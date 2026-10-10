/**
 * Signpost — port of upstream `signpost.c` (the "arrow path" puzzle).
 * Every cell carries an arrow and some cells carry immutable sequence
 * numbers; link the cells into a single chain 1..n where every link
 * follows its cell's arrow and the numbers run consecutively.
 */

import {
  DIFF_EASY,
  DIFF_UNREASONABLE,
  SEARCH_TIER_NAMES,
  searchTierContract,
  searchTierItem,
  searchTierSegment,
  solveFromAnswer,
} from "../../engine/answer-search.ts";
import { descValue } from "../../engine/desc-error.ts";
import { noSuchTier } from "../../engine/difficulty.ts";
import type { GamePref } from "../../engine/game.ts";
import { hintFinishes } from "../../engine/hint-finishes.ts";
import { drag } from "../../engine/hint-gesture.ts";
import {
  fromCoord as fromCoordE,
  type Game,
  type ParamConfigItem,
  registerGame,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/index.ts";
import {
  AREA_TOO_LARGE,
  dimensionParamConfig,
  transposeDimensions,
} from "../../engine/params.ts";
import { dims, flag, paramsCodec } from "../../engine/params-codec.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  moveCursor,
  newCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";
import type { Color, GameStatus, Point, Size } from "../../engine/types.ts";
import { newSignpostDesc } from "./generator.ts";
import {
  SIGNPOST_RUNGS,
  type SignpostHint,
  type SignpostRung,
  signpostHint,
  signpostKeepTrack,
} from "./hint.ts";
import { dragReleaseMove, executeMove } from "./moves.ts";
import { BORDER, buildPalette, FLASH_SPIN, redrawSignpost } from "./render.ts";
import { answerOf, solverFinishes } from "./solver.ts";
import {
  checkCompletion,
  FLAG_IMMUTABLE,
  parseDesc,
  type SignpostDrawState,
  type SignpostMistake,
  type SignpostMove,
  type SignpostParams,
  type SignpostState,
  type SignpostUi,
  updateNumbers,
} from "./state.ts";

// --- geometry --------------------------------------------------------

const PREFERRED_TILE_SIZE = 48;

const coord = (x: number, ts: number): number => x * ts + BORDER;
const fromCoord = (px: number, ts: number): number => fromCoordE(px, ts, BORDER);

// --- presets ---------------------------------------------------------

const board = (side: number, forceCornerStart = true): SignpostParams => ({
  w: side,
  h: side,
  forceCornerStart,
  diff: DIFF_EASY,
});

/** Upstream's four sizes, with the ends in the corners. The menu offers each
 * at both tiers. */
const BOARDS: readonly SignpostParams[] = [4, 5, 6, 7].map((side) => board(side));

/** Upstream's two boards with free ends, after the grid, at Easy. */
const VARIANTS: readonly SignpostParams[] = [board(4, false), board(5, false)];

// --- params ----------------------------------------------------------

function defaultParams(): SignpostParams {
  return board(4);
}

function validateParams(p: SignpostParams, full: boolean): string | null {
  if (p.w > 2147483647 / p.h) {
    return AREA_TOO_LARGE;
  }
  if (full && p.w === 1 && p.h === 1) return "Width and height cannot both be one.";
  if (!full || p.diff !== DIFF_UNREASONABLE) return null;
  const tier = SEARCH_TIER_NAMES[DIFF_UNREASONABLE] as string;
  const area = p.w * p.h;
  const shorter = Math.min(p.w, p.h);
  // Every board of these with its first and last numbers showing was tried
  // (`signpost-tier.test.ts`), and the solver finishes each one that has a
  // single answer. A 1x6 strip is the smallest board that has the tier.
  const tooSmall =
    area <= 5 ||
    (shorter === 2 && area <= 8) ||
    (area === 9 && shorter === 3 && p.forceCornerStart);
  if (tooSmall) {
    const ends = area === 9 ? " puzzle with its ends in the corners" : " puzzle";
    return noSuchTier(`${p.w}x${p.h}${ends}`, tier);
  }
  if (area > MAX_UNREASONABLE_AREA || Math.max(p.w, p.h) > MAX_UNREASONABLE_SIDE)
    return `An ${tier} puzzle must have at most ${MAX_UNREASONABLE_AREA} squares and be at most ${MAX_UNREASONABLE_SIDE} long; a larger one takes too long to deal.`;
  return null;
}

/**
 * The largest Unreasonable board dealt, in squares and along its longer side.
 * An Unreasonable board is an Easy one stripped further by the search, which
 * takes four to five times as long as the Easy board did, and a long thin
 * board takes longer than a square one of its area, since a square's arrow
 * has more squares to lead to.
 *
 * Measured 2026-10-10, mean time for a board inside the bound | past it:
 * 12×12 0.26 s, 15×15 0.9 s, 9×25 1.2 s, 7×30 1.2 s | 16×16 1.3 s, 5×45
 * 2.1 s, 3×75 2.6 s, 1×225 6.3 s, 20×20 4.9 s. The side is one number where
 * the time is a curve: a 1×100 strip deals in 0.5 s and is refused too.
 */
const MAX_UNREASONABLE_AREA = 225;
const MAX_UNREASONABLE_SIDE = 30;

const paramConfig: ParamConfigItem<SignpostParams>[] = [
  ...dimensionParamConfig<SignpostParams>({
    doc: "Size of the grid in squares. Either may be 1, but not both.",
    bounds: { min: 1 },
  }),
  {
    kw: "start-and-end-in-corners",
    name: "Start and end in corners",
    type: "boolean",
    doc: "Make the sequence start in the top left corner and end in the bottom right one. Otherwise its first and last squares can be anywhere in the grid.",
    label: { slot: "tail", words: (p) => (p.forceCornerStart ? null : "free ends") },
    get: (p) => p.forceCornerStart,
    set: (p, v) => {
      p.forceCornerStart = v;
    },
  },
  searchTierItem(
    "diff",
    "An Easy puzzle can be finished one forced link at a time: there is always an arrow with only one square it can lead to, or a square only one arrow can lead into. An Unreasonable one has a single solution that those steps stop short of, so somewhere you have to try a link and see what follows. The Hint button stops where the forced links do.",
  ),
];

/** `WxH`, plus a generator-only `c` when the path must start and end in
 * corners. The tier comes last, in the full form only, and upstream's IDs
 * lack it: without one a board is Easy, the only kind upstream deals. */
const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  flag(paramConfig, "c", "start-and-end-in-corners", { full: true }),
  searchTierSegment(paramConfig),
]);

// --- desc / state ----------------------------------------------------

function newState(p: SignpostParams, desc: string): SignpostState {
  const s = descValue(parseDesc(p, desc));
  // Upstream `new_game` finalization: derive numbers and auto-link
  // consecutive immutable numbers.
  updateNumbers(s);
  checkCompletion(s, true);
  return s;
}

function newUi(_state: SignpostState): SignpostUi {
  return {
    cursor: newCursor(),
    dragging: false,
    dragIsFrom: false,
    sx: 0,
    sy: 0,
    dx: 0,
    dy: 0,
    gearMode: false,
  };
}

function changedState(
  ui: SignpostUi,
  oldState: SignpostState | null,
  next: SignpostState,
): void {
  if (oldState && status(oldState) !== "solved" && status(next) === "solved") {
    ui.cursor.visible = false;
    ui.dragging = false;
  }
}

// --- input -----------------------------------------------------------

function interpretMove(
  s: SignpostState,
  ui: SignpostUi,
  ds: SignpostDrawState,
  p: Point,
  button: number,
): SignpostMove | null | UiUpdate {
  const { w, h } = s;
  const ts = ds.tileSize;

  if (isCursorMove(button)) {
    const changed = moveCursor(ui.cursor, button, w, h);
    if (ui.dragging) {
      ui.dx = coord(ui.cursor.x, ts) + ts / 2;
      ui.dy = coord(ui.cursor.y, ts) + ts / 2;
    }
    return changed || ui.dragging ? UI_UPDATE : null;
  }

  if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    if (ui.dragging) {
      ui.dragging = false;
      return dragReleaseMove(s, ui, ui.cursor.x, ui.cursor.y) ?? UI_UPDATE;
    }
    ui.dragging = true;
    ui.sx = ui.cursor.x;
    ui.sy = ui.cursor.y;
    ui.dx = coord(ui.cursor.x, ts) + ts / 2;
    ui.dy = coord(ui.cursor.y, ts) + ts / 2;
    ui.dragIsFrom = button === CURSOR_SELECT;
    return UI_UPDATE;
  }

  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    if (ui.cursor.visible) {
      ui.cursor.visible = false;
      ui.dragging = false;
    }
    const x = fromCoord(p.x, ts);
    const y = fromCoord(p.y, ts);
    if (x < 0 || x >= w || y < 0 || y >= h) return null;
    const si = y * w + x;
    if (button === LEFT_BUTTON) {
      if (s.nums[si] === s.n && s.flags[si] & FLAG_IMMUTABLE) return null;
    } else if (s.nums[si] === 1 && s.flags[si] & FLAG_IMMUTABLE) {
      return null;
    }
    ui.dragging = true;
    ui.dragIsFrom = button === LEFT_BUTTON;
    ui.sx = x;
    ui.sy = y;
    ui.dx = p.x;
    ui.dy = p.y;
    ui.cursor.visible = false;
    return UI_UPDATE;
  }

  if ((button === LEFT_DRAG || button === RIGHT_DRAG) && ui.dragging) {
    ui.dx = p.x;
    ui.dy = p.y;
    return UI_UPDATE;
  }

  if ((button === LEFT_RELEASE || button === RIGHT_RELEASE) && ui.dragging) {
    ui.dragging = false;
    const x = fromCoord(p.x, ts);
    const y = fromCoord(p.y, ts);
    return dragReleaseMove(s, ui, x, y) ?? UI_UPDATE;
  }

  // 'x' / 'X' key: unlink at the cursor.
  if ((button === 120 || button === 88) && ui.cursor.visible) {
    const si = ui.cursor.y * w + ui.cursor.x;
    if (s.prev[si] === -1 && s.next[si] === -1) return UI_UPDATE;
    return button === 120
      ? { type: "unlinkNext", x: ui.cursor.x, y: ui.cursor.y }
      : { type: "unlinkPrev", x: ui.cursor.x, y: ui.cursor.y };
  }

  return null;
}

// --- solve / mistakes ------------------------------------------------

function solve(orig: SignpostState, _curr: SignpostState): SolveResult<SignpostMove> {
  return solveFromAnswer(answerOf(orig), (next) => ({
    type: "solve",
    next: Array.from(next),
  }));
}

/** Every link the player has made that the board's one answer does not,
 * which the search found at either tier. Nothing is flagged where it did not
 * prove there is exactly one. */
function findMistakes(state: SignpostState): readonly SignpostMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const mistakes: SignpostMistake[] = [];
  for (let i = 0; i < state.n; i++) {
    if (state.next[i] !== -1 && state.next[i] !== answer.solution[i]) {
      mistakes.push({ kind: "link", index: i });
    }
  }
  return mistakes;
}

// --- status / text ---------------------------------------------------

function status(s: SignpostState): GameStatus {
  return checkCompletion(s, false) ? "solved" : "ongoing";
}

const DIR_STRINGS = ["N ", "NE", "E ", "SE", "S ", "SW", "W ", "NW"] as const;

function textFormat(s: SignpostState): string {
  const { w, h, n } = s;
  let ret = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      ret += DIR_STRINGS[s.dirs[i]];
      ret += s.flags[i] & FLAG_IMMUTABLE ? "I" : " ";
      ret += " ";
    }
    ret += "\n";
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const num = s.nums[i];
      if (num === 0) {
        ret += "   ";
      } else {
        const nn = num % (n + 1);
        const set = Math.floor(num / (n + 1));
        if (set !== 0) ret += String.fromCharCode(set + 96); // 'a' - 1 + set
        ret += nn >= 10 ? String(Math.floor(nn / 10)) : " ";
        ret += String(nn % 10);
        if (set === 0) ret += " ";
      }
      ret += " ";
    }
    ret += "\n\n";
  }
  return ret;
}

// --- preferences -----------------------------------------------------

const prefs: GamePref<SignpostUi>[] = [
  {
    kw: "flash-type",
    name: "Victory rotation effect",
    type: "choices",
    choices: ["Unidirectional", "Meshing gears"],
    get: (ui) => (ui.gearMode ? 1 : 0),
    set: (ui, v) => {
      ui.gearMode = v === 1;
    },
  },
];

// --- rendering plumbing ----------------------------------------------

function colors(defaultBackground: Color): Color[] {
  return buildPalette(defaultBackground);
}

function computeSize(p: SignpostParams, ts: number): Size {
  return { w: ts * p.w + 2 * BORDER, h: ts * p.h + 2 * BORDER };
}

function newDrawState(s: SignpostState, tileSize: number): SignpostDrawState {
  return {
    started: false,
    tileSize,
    w: s.w,
    h: s.h,
    n: s.n,
    cache: new Int32Array(s.n).fill(-1),
    nums: new Int32Array(s.n).fill(-1),
    dirp: new Int32Array(s.n).fill(-2),
    angleOffset: 0,
    dragging: false,
    dragBackground: null,
    dragX: 0,
    dragY: 0,
  };
}

// --- register --------------------------------------------------------

export const signpostGame: Game<
  SignpostParams,
  SignpostState,
  SignpostMove,
  SignpostUi,
  SignpostDrawState,
  SignpostMistake,
  SignpostHint,
  SignpostRung
> = {
  id: "signpost",

  defaultParams,
  presets() {
    return {
      title: "Signpost",
      ...presetGrid(paramConfig, BOARDS, { variants: VARIANTS }),
    };
  },
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSignpostDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,
  // Easy is what the solver's forced links finish and the hint, which makes
  // the same links from the player's own, finishes too.
  difficulty: searchTierContract<SignpostParams, SignpostState>({
    newState,
    deductionFinishes: (state) =>
      solverFinishes(state) && hintFinishes(signpostGame, state),
    answerOf,
  }),

  solve,
  findMistakes,
  hint: signpostHint,
  hintMarks: {
    roles: {
      ring: "the link the step decides, at both ends: the arrow it leaves by is drawn in the hint color, and the square it arrives at is ringed.",
      outline:
        "the other squares whose arrows point at the ringed square, when the sentence says why none of them can lead into it.",
      stripes:
        "the squares an arrow points at, when the sentence says which of them can come next.",
    },
  },
  hintRungs: SIGNPOST_RUNGS,
  hintKeepTrack: signpostKeepTrack,
  hintGesture(_s, _ui, ds, m) {
    if (m.type !== "link") return [];
    const ts = ds.tileSize;
    const mid = (v: number) => coord(v, ts) + Math.floor(ts / 2);
    return [
      drag({ x: mid(m.fromX), y: mid(m.fromY) }, { x: mid(m.toX), y: mid(m.toY) }),
    ];
  },

  textFormat,

  prefs,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw: redrawSignpost,
  solvedFlash: () => FLASH_SPIN,
  animLength: () => 0,
};

registerGame(signpostGame);
