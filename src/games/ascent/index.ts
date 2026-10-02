/**
 * Ascent (Hidoku / Hidato): the engine `Game` object. Port of upstream's
 * unreleased `ascent.c` (© 2015 Lennard Sprong).
 */

import { type DifficultyContract, difficultyItem } from "../../engine/difficulty.ts";
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
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import { newAscentDesc } from "./generator.ts";
import { type AscentHighlights, ascentHint, ascentKeepTrack } from "./hint.ts";
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
  ASCENT_MODENAMES,
  type AscentMistake,
  type AscentMove,
  type AscentParams,
  type AscentState,
  CELL_NONE,
  checkCompletion,
  DIFF_NORMAL,
  DIFFCOUNT,
  fromNumberEdge,
  isHexagonal,
  isNear,
  isNumberEdge,
  isSolved,
  MODE_EDGES,
  MODE_HEXAGON,
  MODE_HONEYCOMB,
  MODE_RECT,
  MODECOUNT,
  NUMBER_BOUND,
  NUMBER_EMPTY,
  NUMBER_WALL,
  newAscentState,
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

const MAIN_PRESETS: AscentParams[] = [
  mk(6, 7, 0, MODE_RECT, false, false),
  mk(6, 7, 1, MODE_RECT, false, false),
  mk(6, 7, 2, MODE_RECT, false, false),
  mk(6, 7, 3, MODE_RECT, false, false),
  mk(8, 10, 0, MODE_RECT, false, false),
  mk(8, 10, 1, MODE_RECT, false, false),
  mk(8, 10, 2, MODE_RECT, false, false),
  mk(8, 10, 3, MODE_RECT, false, false),
];

// One size of each hexagonal shape: the larger ones are a Custom away. The
// honeycomb is not the square preset transposed, as a honeycomb cannot be
// turned on its side; 6x8 is the nearest size to upstream's 7x6 that draws
// taller than wide.
const HEX_PRESETS: AscentParams[] = [
  mk(6, 8, 1, MODE_HONEYCOMB, false, false),
  mk(6, 8, 2, MODE_HONEYCOMB, false, false),
  mk(6, 8, 3, MODE_HONEYCOMB, false, false),
  mk(7, 7, 1, MODE_HEXAGON, false, false),
  mk(7, 7, 2, MODE_HEXAGON, false, false),
  mk(7, 7, 3, MODE_HEXAGON, false, false),
];

// Edges is 1to25 more than Hidato, so it has a heading of its own.
const EDGES_PRESETS: AscentParams[] = [
  mk(5, 5, 1, MODE_EDGES, true, false),
  mk(5, 5, 2, MODE_EDGES, true, false),
  mk(5, 5, 3, MODE_EDGES, true, false),
];

function presets(): PresetMenu<AscentParams> {
  const entries = (ps: AscentParams[]) => ps.map((p) => ({ params: p }));
  return {
    title: "Ascent",
    submenu: [
      ...entries(MAIN_PRESETS),
      { title: "Hex", submenu: entries(HEX_PRESETS) },
      { title: "Edges", submenu: entries(EDGES_PRESETS) },
    ],
  };
}

// --- params codec --------------------------------------------------

function defaultParams(): AscentParams {
  return { ...MAIN_PRESETS[0] };
}

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
  const p = defaultParams();
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

function validateParams(p: AscentParams, full: boolean): string | null {
  const { w, h } = p;
  if (w * h >= 1000) return "Width times height must be less than 1000.";
  if (p.mode === MODE_HEXAGON && (h & 1) === 0) return "Height must be an odd number.";
  if (p.mode === MODE_HEXAGON && w <= Math.trunc(h / 2))
    return "Width must be more than half the height for a hexagon grid.";
  if (p.mode === MODE_EDGES && w === 2 && h === 2)
    return "Edges mode needs a grid bigger than 2x2.";
  if (full && p.mode === MODE_EDGES && p.diff < DIFF_NORMAL)
    return "Difficulty for Edges mode must be at least Normal.";
  if (full && p.symmetrical && p.mode === MODE_EDGES)
    return "Symmetrical clues must be disabled for Edges mode.";
  return null;
}

const transposeSquareGrid = transposeDimensions<AscentParams>();

/** The grid type's words in a label: Rectangle is the plain board. */
const MODE_WORDS = ["(no diagonals)", null, "Hexagon", "Honeycomb", "Edges"];

const paramConfig: ParamConfigItem<AscentParams>[] = [
  ...dimensionParamConfig<AscentParams>({
    doc: "Size of the grid in squares.",
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
    kw: "grid-type",
    name: "Grid type",
    type: "choices",
    choices: ASCENT_MODENAMES,
    doc: "Choose between 'Rectangle', 'Rectangle (no diagonals)', 'Hexagon', 'Honeycomb' and 'Edges' mode.",
    label: { slot: "kind", words: (p) => MODE_WORDS[p.mode] ?? null },
    get: (p) => p.mode,
    set: (p, v) => {
      p.mode = v;
    },
  },
  difficultyItem(ASCENT_DIFFNAMES, "diff", {
    doc: "Edges mode needs at least Normal.",
  }),
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
  AscentHighlights
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
  hintMarks: {
    roles: {
      ring: "the square the step fills. When the step fills a whole run at once, a line in the hint's color runs along its only route from one end to the other.",
      outline:
        "what the step reasons from: the numbers the new one sits between, a dead end's one way in, the squares a missing run has to step through, and in Edges mode an arrow the step reads.",
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
