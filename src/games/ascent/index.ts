/**
 * Ascent (Hidoku / Hidato): the engine `Game` object. Port of upstream's
 * unreleased `ascent.c` (© 2015 Lennard Sprong).
 */

import {
  DIFFICULTY_KW,
  type DifficultyContract,
  difficultyItem,
  noSuchTier,
} from "../../engine/difficulty.ts";
import type {
  Game,
  GamePref,
  ParamConfigItem,
  PresetMenu,
  SolveResult,
} from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { clearKey, numberKeys } from "../../engine/key-labels.ts";
import {
  dimensionParamConfig,
  parseDimensions,
  transposeDimensions,
} from "../../engine/params.ts";
import { LEFT_BUTTON, LEFT_RELEASE } from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";
import { registerGame } from "../../engine/registry.ts";
import { type Ruleset, rulesetItem } from "../../engine/ruleset.ts";
import type { Point } from "../../engine/types.ts";
import { newAscentDesc } from "./generator.ts";
import {
  ASCENT_RUNGS,
  type AscentHighlights,
  type AscentRung,
  ascentHint,
  ascentKeepTrack,
} from "./hint.ts";
import { executeAscentMove } from "./moves.ts";
import {
  type AscentDrawState,
  ascentColors,
  ascentComputeSize,
  cellCenter,
  FLASH_FRAME,
  FLASH_SIZE,
  newAscentDrawState,
  redrawAscent,
} from "./render.ts";
import { ascentSolve, SolverScratch } from "./solver.ts";
import {
  ASCENT_DIFFCHARS,
  ASCENT_DIFFNAMES,
  ASCENT_MODECHARS,
  ASCENT_SHAPE_NAMES,
  type AscentMistake,
  type AscentMove,
  type AscentParams,
  type AscentState,
  CELL_NONE,
  checkCompletion,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_NORMAL,
  DIFF_TRICKY,
  DIFFCOUNT,
  fromNumberEdge,
  isHexagonal,
  isNear,
  isNumberEdge,
  isSolved,
  MODE_EDGES,
  MODE_HEXAGON,
  MODE_HONEYCOMB,
  MODE_ORTHOGONAL,
  MODE_RECT,
  MODECOUNT,
  NUMBER_BOUND,
  NUMBER_EMPTY,
  NUMBER_WALL,
  newAscentState,
  SHAPE_HEXAGON,
  SHAPE_HONEYCOMB,
  SHAPE_RECTANGLE,
} from "./state.ts";
import {
  type AscentUi,
  changedState,
  decodeAscentUi,
  encodeAscentUi,
  interpretAscentMove,
  newAscentUi,
} from "./ui.ts";

// --- the hint's gesture ----------------------------------------------

/** What a run of taps and keypad keys makes, played through Ascent's own input
 * on copies of the board and the `Ui`: a tap is a left press and its release at
 * one point, and a key arrives at (0, 0), as the midend delivers them. */
function rehearse(
  state: AscentState,
  ui: AscentUi,
  ds: AscentDrawState,
  actions: readonly Tap[],
): { state: AscentState; ui: AscentUi; moves: AscentMove[] } {
  let s = state;
  const u = structuredClone(ui);
  const moves: AscentMove[] = [];
  const send = (p: Point, button: number) => {
    const made = interpretAscentMove(s, u, ds, p, button);
    if (made === null || made === UI_UPDATE) return;
    const next = executeAscentMove(s, made);
    changedState(u, s, next);
    s = next;
    moves.push(made);
  };
  for (const a of actions) {
    if (a.kind === "key") {
      send({ x: 0, y: 0 }, a.code);
    } else {
      send(a.at, LEFT_BUTTON);
      send(a.at, LEFT_RELEASE);
    }
  }
  return { state: s, ui: u, moves };
}

type Tap = Extract<PointerAction, { kind: "key" } | { kind: "click" }>;

/**
 * Each number the step places, the way a player writes it: tap its square,
 * type it on the keypad, and tap the square again to commit it.
 *
 * Ascent's taps also carry a selection. A tap next to the selected number
 * places the number it offers, and a second tap on the selected square
 * deselects it, so the taps a number needs depend on the live `Ui`. Each
 * candidate is rehearsed on copies through the game's own input, and the
 * first whose only move is that number is the one the hint asks for.
 */
function hintGesture(
  state: AscentState,
  ui: AscentUi,
  ds: AscentDrawState,
  m: AscentMove,
): readonly PointerAction[] {
  const goals = m.kind === "place" ? [m] : m.kind === "places" ? m.cells : [];
  const out: Tap[] = [];
  let s = state;
  let u = ui;
  const tapAt = (cell: number): Tap => {
    const c = cellCenter(cell, s.w, s.mode, ds.tileSize, ds.offsetX, ds.offsetY);
    return {
      kind: "click",
      button: "primary",
      at: { x: Math.round(c.cx), y: Math.round(c.cy) },
    };
  };
  const keyFor = (code: number): Tap => ({ kind: "key", code });
  for (const goal of goals) {
    // A number half typed elsewhere would be committed by the first tap, so
    // rub it out a digit at a time.
    const digitsTyped = u.typingCell === CELL_NONE ? 0 : String(u.typingNumber).length;
    const erase = Array.from({ length: digitsTyped }, () => keyFor(clearKey.button));
    const tap = tapAt(goal.cell);
    const typed = [...String(goal.n + 1)].map((d) => keyFor(d.charCodeAt(0)));
    const deselect = u.held >= 0 ? [tapAt(u.held)] : [];
    // Selecting a number away from the square moves the selection off it,
    // where a second tap on the selected number would cycle what it placed.
    const away = s.grid.findIndex(
      (n, i) =>
        n >= 0 &&
        i !== u.held &&
        i !== u.tapCycle?.cell &&
        !isNear(i, goal.cell, s.w, s.mode),
    );
    const candidates = [
      [tap],
      [tap, ...typed, tap],
      [...deselect, tap, ...typed, tap],
      [...deselect, ...deselect, tap, ...typed, tap],
      ...(away >= 0 ? [[tapAt(away), tap, ...typed, tap]] : []),
    ];
    let found = false;
    for (const candidate of candidates) {
      const actions = [...erase, ...candidate];
      const r = rehearse(s, u, ds, actions);
      const [made, ...more] = r.moves;
      if (
        more.length > 0 ||
        made?.kind !== "place" ||
        made.cell !== goal.cell ||
        made.n !== goal.n
      ) {
        continue;
      }
      out.push(...actions);
      s = r.state;
      u = r.ui;
      found = true;
      break;
    }
    // Nothing here writes the number: the midend reports the step unplayable.
    if (!found) return [];
  }
  return out;
}

// --- presets -------------------------------------------------------

function mk(
  w: number,
  h: number,
  diff: number,
  mode: number,
  removeends: boolean,
  symmetrical: boolean,
): AscentParams {
  return { w, h, diff, mode, removeends, symmetrical };
}

// The menu's boards: one of each ruleset, and of each shape of Hex, which is
// what the menu's length leaves room for. Other sizes are a Custom away. A
// honeycomb is not the square board transposed, as it cannot be turned on its
// side: 6x8 is the size nearest upstream's 7x6 that draws taller than wide.
const BOARDS: AscentParams[] = [
  mk(6, 7, 0, MODE_ORTHOGONAL, false, false),
  mk(6, 8, 0, MODE_HONEYCOMB, false, false),
  mk(7, 7, DIFF_NORMAL, MODE_HEXAGON, false, false),
  mk(6, 7, 0, MODE_RECT, false, false),
  mk(5, 5, DIFF_NORMAL, MODE_EDGES, true, false),
];

const RULESET_ORTHOGONAL = 0;
const RULESET_HEX = 1;
const RULESET_CLASSIC = 2;
const RULESET_EDGES = 3;
const CLASSIC = "Classic";
const EDGES = "Edges";
const SHAPE_KW = "board-shape";
const ON_THE_RECTANGLE = { [SHAPE_KW]: [SHAPE_RECTANGLE] };

/** The four puzzles, told apart by which squares are neighbors, fewest first:
 * four (Numbrix), six, eight (Hidato), and eight with arrows (1to25). */
const RULESETS: Ruleset[] = [
  {
    name: "Orthogonal",
    rule: "Two numbers in sequence must be horizontally or vertically adjacent, and never diagonally.",
    only: ON_THE_RECTANGLE,
  },
  {
    name: "Hex",
    rule: `The board is made of hexagons, and two numbers in sequence must be in hexagons that share a side. The board is a ${ASCENT_SHAPE_NAMES[SHAPE_HONEYCOMB]} or a ${ASCENT_SHAPE_NAMES[SHAPE_HEXAGON]}.`,
    only: { [SHAPE_KW]: [SHAPE_HONEYCOMB, SHAPE_HEXAGON] },
  },
  {
    name: CLASSIC,
    rule: "Two numbers in sequence must be horizontally, vertically or diagonally adjacent. The squares have their corners cut off, as a reminder that the path may cross them.",
    only: ON_THE_RECTANGLE,
  },
  {
    name: EDGES,
    rule: `The neighbors are those of ${CLASSIC}, and the grid is surrounded by numbers placed inside arrows. An arrow points to the row, column or diagonal where this number appears in the path.`,
    only: {
      ...ON_THE_RECTANGLE,
      "symmetrical-clues": false,
      [DIFFICULTY_KW]: [DIFF_NORMAL, DIFF_TRICKY, DIFF_HARD],
    },
  },
];

/** Which of {@link RULESETS} a mode plays. */
function rulesetOf(mode: number): number {
  if (mode === MODE_ORTHOGONAL) return RULESET_ORTHOGONAL;
  if (isHexagonal(mode)) return RULESET_HEX;
  return mode === MODE_EDGES ? RULESET_EDGES : RULESET_CLASSIC;
}

function presets(): PresetMenu<AscentParams> {
  return {
    title: "Ascent",
    ...presetGrid(paramConfig, BOARDS, {
      // Edges has no Easy, and the Honeycomb's is the Hex section's.
      tiers: (p) =>
        p.mode === MODE_EDGES || p.mode === MODE_HEXAGON
          ? [DIFF_NORMAL, DIFF_HARD]
          : null,
    }),
  };
}

// --- params codec --------------------------------------------------

function defaultParams(): AscentParams {
  return { ...BOARDS[0] };
}

/** What a params string that names no mode or tier decodes over: upstream's
 * default, so such a string names the board it always did. */
const UNSAID = mk(6, 7, DIFF_EASY, MODE_RECT, false, false);

function encodeParams(p: AscentParams, full: boolean): string {
  let out = `${p.w}x${p.h}m${ASCENT_MODECHARS[p.mode]}`;
  if (full && p.removeends) out += "E";
  if (full) {
    out += `d${ASCENT_DIFFCHARS[p.diff]}`;
    if (p.symmetrical && p.mode !== MODE_EDGES) out += "S";
  }
  return out;
}

function decodeParams(s: string): AscentParams {
  const p = { ...UNSAID };
  const dims = parseDimensions(s);
  p.w = dims.w;
  p.h = dims.h;
  let i = dims.next;

  if (s[i] === "m") {
    i++;
    p.mode = MODECOUNT + 1; /* invalid until matched */
    if (i < s.length) {
      for (let m = 0; m < MODECOUNT; m++) if (s[i] === ASCENT_MODECHARS[m]) p.mode = m;
      i++;
    }
  }
  if (s[i] === "E") {
    p.removeends = true;
    i++;
  }
  if (s[i] === "d") {
    i++;
    p.diff = DIFFCOUNT + 1; /* invalid until matched */
    if (i < s.length) {
      for (let d = 0; d < DIFFCOUNT; d++) if (s[i] === ASCENT_DIFFCHARS[d]) p.diff = d;
      i++;
    }
  } else if (p.mode === MODE_EDGES) {
    p.diff = Math.max(p.diff, DIFF_NORMAL);
  }

  p.symmetrical = s[i] === "S";
  return p;
}

/**
 * Does no board of this size, on this grid, need the tier asked for?
 *
 * Measured 2026-10-06 over every size of 18 squares or fewer and the boards
 * two wide up to 12 long: none in 40,000 to 800,000 tries a cell, and none in
 * 10,000 at the longest. The tiers are rungs a board needs and not a ladder of
 * size, so a tier is missing under one that is there: a 3x3 Classic has
 * Tricky and Hard boards and no Normal one. With diagonal moves a board two
 * wide has no Hard at any length counted, which past 12 is 3,500 tries at 16
 * long, 1,900 at 20 and 600 at 30. The honeycomb is not the same grid
 * turned round, so its 2x3 and 3x2 differ. {@link EDGES} had none missing.
 */
function lacksTier({ w, h, mode, diff }: AscentParams): boolean {
  const is = (a: number, b: number): boolean => w === a && h === b;
  const either = (a: number, b: number): boolean => is(a, b) || is(b, a);
  switch (mode) {
    case MODE_ORTHOGONAL:
      if (either(2, 2) || either(2, 3)) return true;
      return diff === DIFF_HARD && (either(2, 4) || either(2, 5));
    case MODE_RECT:
      if (either(2, 2)) return true;
      if (diff === DIFF_HARD) return Math.min(w, h) === 2;
      return diff === DIFF_NORMAL && (either(2, 3) || is(3, 3));
    case MODE_HONEYCOMB:
      if (is(2, 2)) return true;
      if (is(2, 3)) return diff !== DIFF_TRICKY;
      if (is(3, 2)) return diff !== DIFF_NORMAL;
      return diff === DIFF_HARD && is(4, 2);
    case MODE_HEXAGON:
      return is(2, 3) || (diff === DIFF_NORMAL && is(3, 3));
    default:
      return false;
  }
}

function validateParams(p: AscentParams, full: boolean): string | null {
  const { w, h } = p;
  if (w * h >= 1000) return "Width times height must be less than 1000.";
  if (p.mode === MODE_HEXAGON && (h & 1) === 0) return "Height must be an odd number.";
  if (p.mode === MODE_HEXAGON && w <= Math.trunc(h / 2))
    return "Width must be more than half the height for a hexagon grid.";
  if (p.mode === MODE_EDGES && w === 2 && h === 2)
    return `${EDGES} mode needs a grid bigger than 2x2.`;
  if (full && p.diff > DIFF_EASY && lacksTier(p))
    return noSuchTier(
      `${w}x${h} ${boardWords(p.mode)} puzzle`,
      ASCENT_DIFFNAMES[p.diff],
    );
  return null;
}

const transposeSquareGrid = transposeDimensions<AscentParams>();

function shapeOf(mode: number): number {
  if (mode === MODE_HONEYCOMB) return SHAPE_HONEYCOMB;
  return mode === MODE_HEXAGON ? SHAPE_HEXAGON : SHAPE_RECTANGLE;
}

/** The shape's words in a label: the Rectangle is its ruleset's only board
 * and goes unsaid. */
function shapeWords(p: AscentParams): string | null {
  return isHexagonal(p.mode) ? ASCENT_SHAPE_NAMES[shapeOf(p.mode)] : null;
}

/** A mode's board in a refusal: its shape where the ruleset has two, and the
 * ruleset's own name otherwise. */
function boardWords(mode: number): string {
  return isHexagonal(mode)
    ? ASCENT_SHAPE_NAMES[shapeOf(mode)]
    : RULESETS[rulesetOf(mode)].name;
}

// One `mode` holds the ruleset and the shape. The ruleset is set first and
// picks a mode of its own; the shape then chooses between the two hexagonal
// modes and is nothing's to set on a Rectangle.
const paramConfig: ParamConfigItem<AscentParams>[] = [
  rulesetItem<AscentParams>(RULESETS, {
    get: (p) => rulesetOf(p.mode),
    set: (p, v) => {
      if (v === rulesetOf(p.mode)) return;
      p.mode = [MODE_ORTHOGONAL, MODE_HONEYCOMB, MODE_RECT, MODE_EDGES][v];
    },
  }),
  ...dimensionParamConfig<AscentParams>({
    doc: `Size of the grid in squares. The smallest boards lack some difficulties: a 2x2 has only Easy puzzles, a 3x3 ${CLASSIC} or ${ASCENT_SHAPE_NAMES[SHAPE_HEXAGON]} board has none at Normal, and a ${CLASSIC} board two squares wide has none at Hard.`,
    bounds: { min: 2, max: 50 },
    size: (p) => (p.mode === MODE_HEXAGON ? `Size ${p.w}` : `${p.w}x${p.h}`),
  }),
  {
    kw: "always-show-start-and-end-points",
    name: "Always show start and end points",
    type: "boolean",
    doc: "When enabled, the first and last number are always given. Disable this option for an added challenge.",
    label: {
      slot: "tail",
      // Every Edges preset hides its ends and every other one shows them, so
      // only a departure from that is worth saying.
      words: (p) =>
        p.removeends === (p.mode === MODE_EDGES)
          ? null
          : p.removeends
            ? "hidden ends"
            : "shown ends",
    },
    get: (p) => !p.removeends,
    set: (p, v) => {
      p.removeends = !v;
    },
  },
  {
    kw: "symmetrical-clues",
    name: "Symmetrical clues",
    type: "boolean",
    doc: "When enabled, all given numbers form a symmetric pattern. This usually leads to easier puzzles.",
    label: { slot: "tail", words: (p) => (p.symmetrical ? "symmetric" : null) },
    get: (p) => p.symmetrical,
    set: (p, v) => {
      p.symmetrical = v;
    },
  },
  {
    kw: SHAPE_KW,
    name: "Board shape",
    type: "choices",
    choices: ASCENT_SHAPE_NAMES,
    doc: `The outline of the board: ${ASCENT_SHAPE_NAMES.map((n) => `'${n}'`).join(", ")}. A ${ASCENT_SHAPE_NAMES[SHAPE_HONEYCOMB]} is a rectangle of hexagons, and a ${ASCENT_SHAPE_NAMES[SHAPE_HEXAGON]} is one large hexagon, whose size is the length of its middle row.`,
    label: { slot: "kind", words: shapeWords },
    get: (p) => shapeOf(p.mode),
    set: (p, v) => {
      if (!isHexagonal(p.mode) || v === SHAPE_RECTANGLE) return;
      p.mode = v === SHAPE_HEXAGON ? MODE_HEXAGON : MODE_HONEYCOMB;
    },
  },
  difficultyItem(ASCENT_DIFFNAMES, "diff"),
];

/** Ascent's difficulty contract (`engine/difficulty.ts`). `ascentSolve` reports
 * nothing itself: it deduces into `sc.grid` and the caller asks
 * `checkCompletion`, as the generator's tier gate does, so there is no
 * "impossible" verdict to map. **The scratch is fresh per call**, because its
 * `foundEndpoints` persists and permanently weakens the solver. */
const difficulty: DifficultyContract<AscentParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newAscentState(p, desc);
    const sc = new SolverScratch(s.w, s.h, s.mode, s.last);
    ascentSolve(s.grid, cap, sc);
    return checkCompletion(sc.grid, s.w, s.h, s.mode) ? "solved" : "unsolved";
  },
};

const prefs: GamePref<AscentUi>[] = [
  {
    kw: "numpad",
    name: "Numpad inputs",
    type: "choices",
    choices: ["Enter numbers", "Move cursor"],
    get: (ui) => (ui.moveWithNumpad ? 1 : 0),
    set: (ui, v) => {
      ui.moveWithNumpad = v === 1;
    },
  },
  {
    kw: "auto-advance-runs",
    name: "Skip past already-placed numbers when advancing",
    type: "boolean",
    get: (ui) => ui.autoAdvanceRuns,
    set: (ui, v) => {
      ui.autoAdvanceRuns = v;
    },
  },
];

// --- solve & mistakes ----------------------------------------------

function solve(orig: AscentState): SolveResult<AscentMove> {
  const sc = new SolverScratch(orig.w, orig.h, orig.mode, orig.last);
  ascentSolve(orig.grid, DIFFCOUNT, sc);
  const grid: number[] = new Array(orig.w * orig.h);
  for (let i = 0; i < grid.length; i++)
    grid[i] = sc.grid[i] >= 0 ? sc.grid[i] : NUMBER_EMPTY;
  return { ok: true, move: { kind: "solve", grid } };
}

function findMistakes(state: AscentState): readonly AscentMistake[] {
  const w = state.w;
  const h = state.h;
  const s = w * h;
  const clues = new Int16Array(s);
  for (let i = 0; i < s; i++)
    clues[i] = state.immutable[i] ? state.grid[i] : NUMBER_EMPTY;

  const sc = new SolverScratch(w, h, state.mode, state.last);
  ascentSolve(clues, DIFFCOUNT, sc);
  if (!checkCompletion(sc.grid, w, h, state.mode)) return [];

  const out: AscentMistake[] = [];
  for (let i = 0; i < s; i++) {
    if (!state.immutable[i] && state.grid[i] >= 0 && sc.grid[i] !== state.grid[i])
      out.push({ cell: i });
  }
  return out;
}

// --- text format ---------------------------------------------------

function textFormat(state: AscentState): string | null {
  if (isHexagonal(state.mode)) return null; // game_can_format_as_text_now
  const w = state.w;
  const h = state.h;
  const space = w * h >= 100 ? 3 : 2;
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = state.grid[y * w + x];
      if (isNumberEdge(n)) n = fromNumberEdge(n);
      let cell: string;
      if (n >= 0) cell = String(n + 1);
      else if (n === NUMBER_WALL) cell = "#";
      else if (n === NUMBER_BOUND) cell = " ";
      else cell = ".";
      out += cell.padStart(space, " ");
      out += x < w - 1 ? " " : "\n";
    }
  }
  return out;
}

// --- flash ---------------------------------------------------------

/** The flash sweeps every cell, so it runs as long as the board is big. */
function solvedFlash(s: AscentState): number {
  return FLASH_FRAME * (s.w * s.h + FLASH_SIZE);
}

// --- Game object ---------------------------------------------------

export const ascentGame: Game<
  AscentParams,
  AscentState,
  AscentMove,
  AscentUi,
  AscentDrawState,
  AscentMistake,
  AscentHighlights,
  AscentRung
> = {
  id: "ascent",
  preferredTileSize: 48,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  // A hexagonal grid turned on its side is a different tiling.
  transposeParams: (p) => (isHexagonal(p.mode) ? null : transposeSquareGrid(p)),
  paramConfig,
  prefs,

  newDesc: newAscentDesc,
  newState: newAscentState,
  newUi: newAscentUi,
  changedState,
  encodeUi: encodeAscentUi,
  decodeUi: decodeAscentUi,
  interpretMove: interpretAscentMove,
  executeMove: executeAscentMove,
  // A number can be written into any empty square only by typing it, and the
  // hint places numbers no chain of taps reaches; on touch this is the way.
  requestKeys: numberKeys,

  solve,
  findMistakes,
  // `findMistakes` compares every entered number with the unique solution, so
  // a board it passes, the only kind the midend asks about, is one the hint may
  // deduce from.
  hint: ascentHint,
  hintRungs: ASCENT_RUNGS,
  hintMarks: {
    roles: {
      ring: "the square the step fills. When the step fills a whole run at once, a line in the hint's color runs along its only route from one end to the other.",
      outline: `what the step reasons from: the numbers the new one sits between, a dead end's one way in, the squares a missing run has to step through, and in ${EDGES} mode an arrow the step reads.`,
      stripes:
        "the row, column or diagonal an arrow points along, or every square a run of missing numbers can reach.",
    },
  },
  hintKeepTrack: ascentKeepTrack,
  hintGesture,
  difficulty,
  textFormat,

  status: (s) => (isSolved(s) ? "solved" : "ongoing"),

  colors: ascentColors,
  computeSize: (p, tileSize) => ascentComputeSize(p.w, p.h, p.mode, tileSize),
  newDrawState: newAscentDrawState,
  redraw: redrawAscent,
  solvedFlash,
};

registerGame(ascentGame);
