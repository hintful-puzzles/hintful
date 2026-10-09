import { assertNever } from "../../engine/assert-never.ts";
import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
  UiUpdate,
} from "../../engine/game.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { click } from "../../engine/hint-gesture.ts";
import { NO_MOVE_WORTH_MAKING } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  gridCursorMove,
  isCursorMove,
  LEFT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import {
  ANIM_TIME,
  cellCenter,
  colors,
  computeSize,
  type FifteenDrawState,
  FLASH_FRAME,
  fromCoord,
  newDrawState,
  PREFERRED_TILE_SIZE,
  paletteScheme,
  redraw,
} from "./render.ts";
import { computeHint } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  type FifteenMove,
  type FifteenParams,
  type FifteenState,
  type FifteenUi,
  newDesc,
  newState,
  paramConfig,
  presets,
  status,
  textFormat,
} from "./state.ts";

// --- move logic -------------------------------------------------------

export function executeMove(state: FifteenState, move: FifteenMove): FifteenState {
  const { w, h, n } = state;

  if (move.type === "solve") {
    const tiles = new Int32Array(n);
    for (let i = 0; i < n; i++) tiles[i] = (i + 1) % n;
    // Solve counts as one move; that the solver was used is the engine's to
    // say, so the count does not restart here as upstream's did.
    return { ...state, tiles, gapPos: n - 1, moveCount: state.moveCount + 1 };
  }
  if (move.type !== "move") return assertNever(move, "fifteen: executeMove");

  const { x, y } = move;
  const gx = state.gapPos % w;
  const gy = Math.floor(state.gapPos / w);
  // The destination must share exactly one coordinate with the gap.
  if (x < 0 || x >= w || y < 0 || y >= h || (x === gx) === (y === gy)) {
    throw new Error(`Illegal fifteen move to (${x}, ${y})`);
  }

  // The flat stride of one step from the old gap toward the destination.
  const step = Math.sign(y - gy) * w + Math.sign(x - gx);
  const tiles = new Int32Array(state.tiles);
  const newGap = y * w + x;
  tiles[newGap] = 0;

  let moveCount = state.moveCount;
  for (let p = state.gapPos; p !== newGap; p += step) {
    tiles[p] = state.tiles[p + step];
    moveCount++;
  }

  return { ...state, tiles, gapPos: newGap, moveCount };
}

// --- UI / input -------------------------------------------------------

function newUi(_state: FifteenState): FifteenUi {
  return { invertCursor: false };
}

const OPPOSITE_ARROW: Record<number, number> = {
  [CURSOR_UP]: CURSOR_DOWN,
  [CURSOR_DOWN]: CURSOR_UP,
  [CURSOR_LEFT]: CURSOR_RIGHT,
  [CURSOR_RIGHT]: CURSOR_LEFT,
};

function interpretMove(
  state: FifteenState,
  ui: FifteenUi,
  ds: FifteenDrawState,
  p: Point,
  button: number,
): FifteenMove | null | UiUpdate {
  const { w, h } = state;
  const gx = state.gapPos % w;
  const gy = Math.floor(state.gapPos / w);
  const raw = stripModifiers(button);

  if (isCursorMove(raw)) {
    // The pressed arrow moves a *tile* that way, so the gap moves the
    // opposite way (unless invertCursor). One step along one axis always
    // makes a legal slide; a step off the edge is null, as upstream's
    // clamped `move_cursor`.
    const arrow = ui.invertCursor ? raw : OPPOSITE_ARROW[raw];
    const next = gridCursorMove(arrow, gx, gy, w, h);
    return next && { type: "move", x: next.x, y: next.y };
  }
  if (raw !== LEFT_BUTTON) return null;

  const x = fromCoord(p.x, ds.tileSize);
  const y = fromCoord(p.y, ds.tileSize);
  if (x < 0 || x >= w || y < 0 || y >= h) return null;
  // A legal target shares exactly one coordinate with the gap.
  return (x === gx) !== (y === gy) ? { type: "move", x, y } : null;
}

// --- status bar -------------------------------------------------------

function statusbarText(state: FifteenState, _ui: FifteenUi): string {
  return `Moves: ${state.moveCount}`;
}

// --- hint -------------------------------------------------------------

/** What a slide does for the goal tile, by the branch of
 * {@link narrateFifteenStep} that chose its words. */
export const FIFTEEN_RUNGS = [
  "goalHome",
  "goalCloser",
  "goalReposition",
  "tileHome",
  "outOfWay",
] as const;
export type FifteenRung = (typeof FIFTEEN_RUNGS)[number];

/** Narrate one greedy step around a **stable goal** tile (see `hint`), not
 * the solver's per-step `target`. To place the last tiles of a line the
 * solver displaces an already-home tile and then restores it; narrating
 * `target` would make the banner read "Working on tile 8", then "Working on
 * tile 7", as though the hint had lost the plot. Held steady, the
 * restoration reads as a sub-step of the same goal ("slide tile 7 into
 * place").
 *
 * The slid tile lands at the old gap (`board.gapPos`); tile `t`'s solved
 * cell is index `t - 1`. Given the goal:
 * - the goal lands home → "slide it into place";
 * - the goal moves but not home → "slide it closer" only when its Manhattan
 *   distance to home shrinks, else "slide it back a step" (a one-cell slide
 *   changes that distance by exactly one, so the goal is then further away);
 * - another tile lands in its own home and `stays`, no later slide of the
 *   solution moving it → "slide tile N into place";
 * - any other slide → "slide tile N out of the way", a tile the gap only
 *   carries through its home on the way round included.
 *
 * The goal's own "into place" makes no such promise: the rotation that places
 * the next tile of its line may displace it, and restores it. */
function narrateFifteenStep(
  board: FifteenState,
  tile: number,
  goal: number,
  dest: Point,
  stays: boolean,
): { rung: FifteenRung; words: Sentence } {
  const w = board.w;
  const landsAtOwnHome = board.gapPos === tile - 1;

  if (tile === goal) {
    if (landsAtOwnHome) return { rung: "goalHome", words: say.goalHome(goal) };
    // The goal sits at `dest` before the slide and at the old gap after it.
    const hx = (goal - 1) % w;
    const hy = Math.floor((goal - 1) / w);
    const distBefore = Math.abs(dest.x - hx) + Math.abs(dest.y - hy);
    const distAfter =
      Math.abs((board.gapPos % w) - hx) + Math.abs(Math.floor(board.gapPos / w) - hy);
    return distAfter < distBefore
      ? { rung: "goalCloser", words: say.goalCloser(goal) }
      : { rung: "goalReposition", words: say.goalReposition(goal) };
  }

  if (landsAtOwnHome && stays)
    return { rung: "tileHome", words: say.tileHome(goal, tile) };
  return { rung: "outOfWay", words: say.outOfWay(goal, tile) };
}

/** The *whole* greedy solution as one plan, one narrated gap slide per
 * step, so the banner stays populated through an auto-hint run instead of
 * clearing and recomputing on every step, as Sixteen's plan does. The
 * solver is cheap, and the plan is recomputed only when the player
 * deviates (see `hintKeepTrack`). */
function hint(state: FifteenState): HintResult<FifteenMove, unknown, FifteenRung> {
  /** One slide of the solution, with what its sentence is told from. */
  const slides: {
    board: FifteenState;
    tile: number;
    goal: number;
    dest: Point;
  }[] = [];
  let board = state;
  // The goal is the running maximum of the solver's `target` until it is
  // homed: mid-rotation the target drops to the tile being restored.
  let goal: number | null = null;
  // Upstream's 5·n³ bound on the greedy solver: a cap against an unexpected
  // non-terminating board, never reached for a solvable one.
  for (let guard = 5 * state.n ** 3; guard > 0; guard--) {
    const dest = computeHint(board);
    if (!dest) break; // solved
    const tile = board.tiles[dest.y * board.w + dest.x];
    goal = goal === null ? dest.target : Math.max(goal, dest.target);
    const homedGoal = tile === goal && board.gapPos === goal - 1;
    slides.push({ board, tile, goal, dest });
    board = executeMove(board, { type: "move", x: dest.x, y: dest.y });
    if (homedGoal) goal = null;
  }

  if (slides.length === 0) return { ok: false, error: NO_MOVE_WORTH_MAKING };
  // Narrated once the whole solution is known: whether a tile stays where a
  // slide leaves it is a fact about the slides that follow.
  const lastSlideOf = new Map(slides.map((s, i) => [s.tile, i]));
  const steps = slides.map((s, i): HintStep<FifteenMove, unknown, FifteenRung> => {
    const stays = lastSlideOf.get(s.tile) === i;
    const { rung, words } = narrateFifteenStep(s.board, s.tile, s.goal, s.dest, stays);
    const move: FifteenMove = { type: "move", x: s.dest.x, y: s.dest.y };
    return { move, rung, explanation: words.text, words };
  });
  return { ok: true, steps };
}

/** A slide is named by the gap's destination, so a move to the hinted
 * destination leaves exactly the board the plan expects and completes the
 * step. Anything else is a deviation, which drops the plan for the next
 * hint request to recompute. */
function hintKeepTrack(m: FifteenMove, step: HintStep<FifteenMove>): HintTrackVerdict {
  const hinted = step.move;
  if (m.type !== "move" || hinted.type !== "move") return "off";
  return m.x === hinted.x && m.y === hinted.y ? "completed" : "off";
}

// --- Game object ------------------------------------------------------

export const fifteenGame: Game<
  FifteenParams,
  FifteenState,
  FifteenMove,
  FifteenUi,
  FifteenDrawState,
  unknown,
  unknown,
  FifteenRung
> = {
  id: "fifteen",
  // Sliding a tile is the only gesture; the secondary button has no meaning,
  // so a touch player's held press must not be promoted into one.
  ignoresSecondaryButton: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  status,
  notApplicable: {
    findMistakes:
      "Every arrangement of the tiles is a step on the way to the answer, so no move can be wrong, only longer.",
  },

  solve: () => ({ ok: true, move: { type: "solve" } }),

  hint,
  hintRungs: FIFTEEN_RUNGS,
  hintMarks: {
    roles: {
      ring: "what the step decides: the tile to slide, filled in the hint's color.",
    },
  },
  hintKeepTrack,
  hintGesture: (_s, _ui, ds, m) =>
    m.type === "move"
      ? [click({ x: cellCenter(m.x, ds.tileSize), y: cellCenter(m.y, ds.tileSize) })]
      : [],

  textFormat,
  statusbarText,

  colors,
  paletteScheme,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => ANIM_TIME,
  solvedFlash: () => 2 * FLASH_FRAME,
};

registerGame(fifteenGame);
