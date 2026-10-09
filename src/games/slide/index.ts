/**
 * Slide (Klotski) — native TS port of `puzzles/unfinished/slide.c`. Slide the
 * rectangular blocks around a walled board until the blue main block reaches
 * the green target and escapes through the hole in the wall.
 *
 * Upstream finished Slide — generator, exhaustive BFS solver and drag
 * interaction all work — but only ever shipped it behind
 * `PUZZLES_ENABLE_UNFINISHED`, with generator variety and graphics polish left
 * as TODOs. This port finishes it rather than merely transliterating it.
 *
 * Deliberately absent:
 *
 *  - **`findMistakes`.** Every reachable position is legal — you are simply
 *    nearer to or further from the exit — so there is nothing to flag, as for
 *    the permutation games
 *    (docs/games/solver-and-generator.md § "The solvable-game contract").
 *    Check & Save degrades to a plain quick-save.
 *  - **A guess-free-generation obligation.** That binds logic puzzles; Slide is
 *    a movement puzzle whose "solver" is a shortest-path search, with no
 *    difficulty tiers (`maxmoves` bounds solution *length*).
 *  - **An explained hint**, so far. One would be a solver-path hint of its own.
 */

import type {
  Game,
  ParamConfigItem,
  SolveResult,
  UiUpdate,
} from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { numberItem, parseConfigInt } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  isCancelKey,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  moveCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import type { Point } from "../../engine/types.ts";
import { newSlideDesc } from "./generator.ts";
import { computeReachable, executeMove, nearestReachable } from "./moves.ts";
import {
  BORDER,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  paletteScheme,
  redraw,
  type SlideDrawState,
} from "./render.ts";
import { solveBoard } from "./solver.ts";
import {
  cancelGrab,
  decodeParams,
  defaultParams,
  encodeParams,
  isBlock,
  isDist,
  MAXWID,
  newState,
  newUi,
  presets,
  type SlideMove,
  type SlideParams,
  type SlideState,
  type SlideUi,
  status,
  statusbarText,
  textFormat,
  validateParams,
} from "./state.ts";

// --- input ------------------------------------------------------------

/**
 * Fold the right button onto the left. Slide's whole pointer vocabulary is one
 * press-and-drag, and a touch that holds still arrives as `RIGHT_BUTTON`
 * (docs/games/input.md § "A touch hold arrives as the right button"), so
 * "press a block, pause to aim, then drag" would die exactly when the player
 * stops to think.
 *
 * It names the three codes rather than a range, so no cursor, select or cancel
 * key can reach the pointer arms disguised as a press. The "right→left fold"
 * test in `slide.test.ts` asserts the mapping rather than an outcome, so a fold
 * widened to a range fails it.
 */
function asPrimary(button: number): number {
  if (button === RIGHT_BUTTON) return LEFT_BUTTON;
  if (button === RIGHT_DRAG) return LEFT_DRAG;
  if (button === RIGHT_RELEASE) return LEFT_RELEASE;
  return button;
}

/**
 * Pick up the block covering `(cx, cy)`, held by that square, and work out —
 * once — every square its anchor can be slid to. Returns false when there is
 * no block there.
 *
 * The pointer press and the keyboard select both grab here and differ only in
 * where `(cx, cy)` comes from, which is what makes a keyboard journey produce
 * the *same* move as the equivalent drag rather than a parallel one.
 */
function grabBlockAt(state: SlideState, ui: SlideUi, cx: number, cy: number): boolean {
  const { w, h, board } = state;
  if (cx < 0 || cx >= w || cy < 0 || cy >= h) return false;
  if (!isBlock(board[cy * w + cx])) return false;

  let anchor = cy * w + cx;
  while (isDist(board[anchor])) anchor -= board[anchor];

  ui.grabbed = true;
  ui.grabAnchor = anchor;
  ui.grabOffsetX = cx - (anchor % w);
  ui.grabOffsetY = cy - Math.floor(anchor / w);
  ui.grabCurrpos = anchor;
  computeReachable(state, anchor, ui.reachable);
  return true;
}

/** Put the held block down where it now sits — a move if it actually went
 * anywhere, and otherwise just the grab coming off the display. */
function releaseGrab(ui: SlideUi): SlideMove | UiUpdate {
  const from = ui.grabAnchor;
  const to = ui.grabCurrpos;
  cancelGrab(ui);
  return from !== to ? { kind: "move", from, to } : UI_UPDATE;
}

function interpretMove(
  state: SlideState,
  ui: SlideUi,
  ds: SlideDrawState,
  p: Point,
  rawButton: number,
): SlideMove | null | UiUpdate {
  const button = asPrimary(stripModifiers(rawButton));
  const { w, h } = state;
  const ts = ds.tileSize;

  if (button === LEFT_BUTTON) {
    // A pointer press always takes over: the cursor goes away, and pressing
    // anywhere that is not a block puts down whatever the keyboard was
    // holding. Without that, a keyboard grab would survive under a pointer and
    // the next `LEFT_DRAG` would fling it at the pointer.
    const hadUi = ui.grabbed || ui.cursor.visible;
    ui.cursor.visible = false;
    if (
      !grabBlockAt(state, ui, fromCoord(p.x, ts, BORDER), fromCoord(p.y, ts, BORDER))
    ) {
      cancelGrab(ui);
      return hadUi ? UI_UPDATE : null; // this click has no effect
    }
    return UI_UPDATE;
  }

  if (button === LEFT_DRAG && ui.grabbed) {
    const tx = fromCoord(p.x, ts, BORDER) - ui.grabOffsetX;
    const ty = fromCoord(p.y, ts, BORDER) - ui.grabOffsetY;
    const target = nearestReachable(w, h, ui.reachable, tx, ty);
    // Nothing to repaint when no square is in range or the block is already
    // there. (Upstream repaints on every hit; skipping the no-op saves a
    // notification per pixel of pointer movement.)
    if (target === null || target === ui.grabCurrpos) return null;
    ui.grabCurrpos = target;
    return UI_UPDATE;
  }

  if (button === LEFT_RELEASE && ui.grabbed) return releaseGrab(ui);

  if (isCursorMove(button)) return moveSlideCursor(state, ui, button);

  if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    ui.cursor.visible = true;
    if (ui.grabbed) return releaseGrab(ui);
    grabBlockAt(state, ui, ui.cursor.x, ui.cursor.y);
    return UI_UPDATE; // an empty square grabs nothing, but still reveals the cursor
  }

  if (isCancelKey(button)) {
    if (ui.grabbed) {
      // Hand the block back, and the cursor with it: it has been riding the
      // block, so leaving it where the abandoned journey ended would strand it
      // somewhere the player never chose.
      ui.cursor.x = (ui.grabAnchor % w) + ui.grabOffsetX;
      ui.cursor.y = Math.floor(ui.grabAnchor / w) + ui.grabOffsetY;
      cancelGrab(ui);
      return UI_UPDATE;
    }
    if (ui.cursor.visible) {
      ui.cursor.visible = false;
      return UI_UPDATE;
    }
    return null;
  }

  return null;
}

/**
 * One cursor-key press, in whichever of the cursor's two modes is live.
 *
 * **Ungrabbed** it walks a cell cursor over the board, clamped to the grid.
 * **Grabbed** it walks the held block one cell through its reachable set,
 * refusing a step that would leave it — and the cursor goes with the block, so
 * it stays on the square the block was picked up by.
 *
 * One cell per press, not slide-as-far-as-it-goes. Sliding to the end is fewer
 * presses down a long corridor, but it cannot stop *inside* one, so the
 * keyboard could not reach every cell the drag can.
 */
function moveSlideCursor(
  state: SlideState,
  ui: SlideUi,
  button: number,
): null | UiUpdate {
  const { w, h } = state;

  if (!ui.grabbed) return moveCursor(ui.cursor, button, w, h) ? UI_UPDATE : null;

  const delta = cursorDelta(button);
  if (!delta) return null;
  const ax = (ui.grabCurrpos % w) + delta.dx;
  const ay = Math.floor(ui.grabCurrpos / w) + delta.dy;
  if (ax < 0 || ax >= w || ay < 0 || ay >= h) return null;
  const anchor = ay * w + ax;
  if (!ui.reachable[anchor]) return null; // outside the set: nothing moves

  ui.grabCurrpos = anchor;
  ui.cursor.x = ax + ui.grabOffsetX;
  ui.cursor.y = ay + ui.grabOffsetY;
  return UI_UPDATE;
}

// --- solve ------------------------------------------------------------

/**
 * Play the shortest route from here to the exit.
 *
 * Divergence: upstream solves the *initial* board, though its own comment says
 * "from the current position", and a route from the start is illegal from any
 * later position (docs/games/solver-and-generator.md § "Divergence and what it
 * costs" rule 3). We solve `curr`.
 */
function solve(_orig: SlideState, curr: SlideState): SolveResult<SlideMove> {
  const { path } = solveBoard(
    curr.w,
    curr.h,
    curr.board,
    curr.forcefield,
    curr.tx,
    curr.ty,
    -1,
    true,
  );
  // The search is exhaustive and every slide can be undone, so no path from
  // here means none from the start either.
  if (!path) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solution", moves: path } };
}

// --- params form ------------------------------------------------------

/** Width and height are built one by one rather than from
 * `dimensionParamConfig` because their bounds differ. */
const paramConfig: ParamConfigItem<SlideParams>[] = [
  numberItem<SlideParams>("width", "Width", "w", {
    doc: "Size of the board in squares, counting its wall. The whole board can have at most 48 squares: past that, working out whether a board can be solved takes more memory than a browser has to give.",
    bounds: { min: 5, max: MAXWID },
    label: { slot: "size", words: (p) => `${p.w}x${p.h}` },
  }),
  numberItem<SlideParams>("height", "Height", "h", {
    doc: { with: "width" },
    bounds: { min: 4 },
  }),
  {
    kw: "solution-length-limit",
    name: "Solution length limit",
    type: "string",
    doc: "The most moves the puzzle's shortest solution may take. The generator keeps joining blocks together only while the board can still be solved within this many moves, so a higher limit tends to give a harder puzzle. Enter a negative number for no limit at all.",
    label: {
      slot: "tail",
      words: (p) => (p.maxmoves < 0 ? "no move limit" : `max ${p.maxmoves} moves`),
    },
    get: (p) => String(p.maxmoves),
    set: (p, v) => {
      // `atoi`, as upstream's `custom_params` reads it: a blank field is 0,
      // which `validateParams` rejects. Any negative value means no limit.
      p.maxmoves = v.trim().startsWith("-") ? -1 : parseConfigInt(v);
    },
  },
];

// --- the game ---------------------------------------------------------

export const slideGame: Game<
  SlideParams,
  SlideState,
  SlideMove,
  SlideUi,
  SlideDrawState
> = {
  id: "slide",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,

  newDesc: newSlideDesc,
  newState,
  newUi,

  /** Upstream's `game_changed_state` is empty, but a grab left dangling across
   * an undo (pointer still down, or a block held by the keyboard) points at an
   * anchor the new board may not have — which upstream's `game_redraw` asserts
   * on — and its reachable set was computed against the board just replaced.
   * Canceling it costs nothing: a `UI_UPDATE`, which is all a grab or a
   * drag-follow is, never reaches here. The cursor survives (see `SlideUi`). */
  changedState: cancelGrab,

  interpretMove,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  status,
  notApplicable: {
    findMistakes:
      "Every arrangement of the blocks is a step on the way to the answer, so no move can be wrong, only longer.",
    transposeParams:
      "The key block leaves by a gate in the right-hand wall, so a board turned on its side would be a different puzzle.",
  },

  solve,
  textFormat,
  statusbarText,

  colors,
  paletteScheme,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  // Blocks jump straight to where they were dragged: upstream's
  // `game_anim_length` is 0, and the live feedback is the block following the
  // pointer.
  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(slideGame);
