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
import { commonHintRefusal } from "../../engine/hint-refusal.ts";
import {
  dimensionParamConfig,
  parseDimensions,
  transposeDimensions,
} from "../../engine/params.ts";
import { registerGame } from "../../engine/registry.ts";
import { newAscentDesc } from "./generator.ts";
import {
  type AscentHighlights,
  ascentHint,
  ascentHintMarks,
  ascentKeepTrack,
} from "./hint.ts";
import { executeAscentMove } from "./moves.ts";
import {
  type AscentDrawState,
  ascentColors,
  ascentComputeSize,
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
  checkCompletion,
  DIFF_NORMAL,
  DIFFCOUNT,
  fromNumberEdge,
  isHexagonal,
  isNumberEdge,
  MODE_EDGES,
  MODE_HEXAGON,
  MODE_HONEYCOMB,
  MODE_RECT,
  MODECOUNT,
  NUMBER_BOUND,
  NUMBER_EMPTY,
  NUMBER_WALL,
  newAscentState,
  validateAscentDesc,
} from "./state.ts";
import {
  type AscentUi,
  changedState,
  decodeAscentUi,
  encodeAscentUi,
  interpretAscentMove,
  newAscentUi,
} from "./ui.ts";

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
  if (w * h >= 1000) return "Puzzle is too large";
  if (p.mode === MODE_HEXAGON && (h & 1) === 0) return "Height must be an odd number";
  if (p.mode === MODE_HEXAGON && w <= Math.trunc(h / 2))
    return "Width is too low for hexagon grid";
  if (p.mode === MODE_EDGES && w === 2 && h === 2)
    return "Grid for Edges mode must be bigger than 2x2";
  if (full && p.mode === MODE_EDGES && p.diff < DIFF_NORMAL)
    return "Difficulty for Edges mode must be at least Normal";
  if (full && p.symmetrical && p.mode === MODE_EDGES)
    return "Symmetrical clues must be disabled for Edges mode";
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

function flashLength(a: AscentState, b: AscentState): number {
  if (!a.completed && b.completed && !a.cheated && !b.cheated)
    return FLASH_FRAME * (b.w * b.h + FLASH_SIZE);
  return 0;
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
  validateDesc: validateAscentDesc,
  newState: newAscentState,
  newUi: newAscentUi,
  changedState,
  encodeUi: encodeAscentUi,
  decodeUi: decodeAscentUi,
  interpretMove: interpretAscentMove,
  executeMove: executeAscentMove,

  solve,
  findMistakes,
  // `findMistakes` compares every entered number with the unique solution, so
  // a board it passes is one the hint may deduce from.
  hint: (state) =>
    commonHintRefusal(state.completed, findMistakes(state).length) ?? ascentHint(state),
  hintMarks: {
    roles: {
      ring: "the square the step fills. When the step fills a whole run at once, a line in the hint's color runs along its only route from one end to the other.",
      outline:
        "what the step reasons from: the numbers the new one sits between, a dead end's one way in, the squares a missing run has to step through, and in Edges mode an arrow the step reads.",
      stripes:
        "the row, column or diagonal an arrow points along, or every square a run of missing numbers can reach.",
    },
    drawn: ascentHintMarks,
  },
  hintKeepTrack: ascentKeepTrack,
  difficulty,
  textFormat,

  status: (s) => (s.completed ? "solved" : "ongoing"),

  colors: ascentColors,
  computeSize: (p, tileSize) => ascentComputeSize(p.w, p.h, p.mode, tileSize),
  newDrawState: newAscentDrawState,
  redraw: redrawAscent,
  flashLength,
};

registerGame(ascentGame);
