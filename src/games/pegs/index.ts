/**
 * Pegs — peg solitaire.
 *
 * Jump pegs over adjacent pegs into empty holes, removing the jumped
 * peg. Win when exactly one peg remains. Three board types: Cross
 * (the classic English/European layouts), Octagon (European with
 * parity-safe starting hole), and Random (reverse-move generation
 * guaranteeing solubility).
 *
 * Upstream's `pegs.c`, as idiomatic TS: immutable state, a `PegsMove`
 * object, and `SortedMultiset` standing in for the Random generator's
 * `tree234`.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { SolveResult } from "../../engine/game.ts";
import { drag } from "../../engine/hint-gesture.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import {
  type Game,
  registerGame,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/index.ts";
import { dimensionParamConfig, transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
} from "../../engine/pointer.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import type { Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import { hint, hintKeepTrack } from "./hint.ts";
import { HINT_MARKS } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_FRAME,
  fromCoordWithTileSize,
  newDrawState,
  type PegsDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  tileCenter,
} from "./render.ts";
import { findFinish } from "./solver.ts";
import {
  BOARD_TYPE_NAMES,
  decodeParams,
  defaultParams,
  deserializeMove,
  encodeParams,
  GRID_HOLE,
  GRID_OBST,
  GRID_PEG,
  newState,
  newUi,
  type PegsJump,
  type PegsMove,
  type PegsParams,
  type PegsState,
  type PegsUi,
  presets,
  serializeMove,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

export type { PegsMove, PegsParams, PegsState, PegsUi };

// --- jump legality ---------------------------------------------------

function inGrid(s: PegsState, x: number, y: number): boolean {
  return x >= 0 && x < s.w && y >= 0 && y < s.h;
}

/** Why `m` is not a legal jump on `s`, or null if it is. */
function illegalJump(s: PegsState, m: PegsJump): string | null {
  const { sx, sy, tx, ty } = m;
  if (!inGrid(s, sx, sy)) return "Source out of range";
  if (!inGrid(s, tx, ty)) return "Target out of range";
  const dx = Math.abs(tx - sx);
  const dy = Math.abs(ty - sy);
  if (Math.max(dx, dy) !== 2 || Math.min(dx, dy) !== 0) {
    return "Move length was wrong";
  }
  const { w } = s;
  if (
    s.grid[sy * w + sx] !== GRID_PEG ||
    s.grid[((sy + ty) / 2) * w + (sx + tx) / 2] !== GRID_PEG ||
    s.grid[ty * w + tx] !== GRID_HOLE
  ) {
    return "Grid contents were invalid for this move";
  }
  return null;
}

// --- interpretMove ---------------------------------------------------

function interpretMove(
  s: PegsState,
  ui: PegsUi,
  ds: PegsDrawState,
  p: Point,
  button: number,
): PegsMove | null | UiUpdate {
  const { w, h } = s;
  const ts = ds.tileSize;

  if (button === LEFT_BUTTON) {
    const tx = fromCoordWithTileSize(p.x, ts);
    const ty = fromCoordWithTileSize(p.y, ts);
    if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
      const v = s.grid[ty * w + tx];
      if (v === GRID_PEG) {
        ui.dragging = true;
        ui.sx = tx;
        ui.sy = ty;
        ui.dx = p.x;
        ui.dy = p.y;
        ui.cursor.visible = false;
        ui.curJumping = false;
        return UI_UPDATE;
      }
      if (v === GRID_HOLE) return null; // MOVE_NO_EFFECT
      return null; // MOVE_UNUSED (OBST)
    }
    return null;
  }

  if (button === LEFT_DRAG && ui.dragging) {
    ui.dx = p.x;
    ui.dy = p.y;
    return UI_UPDATE;
  }

  if (button === LEFT_RELEASE && ui.dragging) {
    ui.dragging = false;
    const tx = fromCoordWithTileSize(p.x, ts);
    const ty = fromCoordWithTileSize(p.y, ts);
    const move: PegsMove = { type: "jump", sx: ui.sx, sy: ui.sy, tx, ty };
    return illegalJump(s, move) ? UI_UPDATE : move;
  }

  const cursorMove = cursorDelta(button);
  if (cursorMove) {
    const { dx, dy } = cursorMove;
    const { x, y } = ui.cursor;
    if (!ui.curJumping) {
      // An obstacle cell refuses the cursor.
      const nx = x + dx;
      const ny = y + dy;
      if (inGrid(s, nx, ny) && s.grid[ny * w + nx] !== GRID_OBST) {
        ui.cursor.x = nx;
        ui.cursor.y = ny;
      }
      ui.cursor.visible = true;
      return UI_UPDATE;
    }

    // Jumping mode: the arrow names the direction to jump in.
    const tx = x + 2 * dx;
    const ty = y + 2 * dy;
    ui.curJumping = false;
    if (
      !inGrid(s, tx, ty) ||
      s.grid[(y + dy) * w + (x + dx)] !== GRID_PEG ||
      s.grid[ty * w + tx] !== GRID_HOLE
    ) {
      return UI_UPDATE;
    }
    ui.cursor.x = tx;
    ui.cursor.y = ty;
    return { type: "jump", sx: x, sy: y, tx, ty };
  }

  if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    if (ui.curJumping) {
      ui.curJumping = false;
      return UI_UPDATE;
    }
    if (s.grid[ui.cursor.y * w + ui.cursor.x] === GRID_PEG) {
      ui.curJumping = true;
      return UI_UPDATE;
    }
    return null;
  }

  return null;
}

// --- executeMove -----------------------------------------------------

function executeMove(s: PegsState, m: PegsMove): PegsState {
  if (m.type === "solve") {
    const { w, h } = s;
    if (s.grid[m.finish] === undefined || s.grid[m.finish] === GRID_OBST) {
      throw new Error("pegs: the finishing square is off the board");
    }
    const grid = s.grid.map((v) => (v === GRID_OBST ? GRID_OBST : GRID_HOLE));
    grid[m.finish] = GRID_PEG;
    return { w, h, grid };
  }
  if (m.type !== "jump") return assertNever(m, "pegs: executeMove");
  const error = illegalJump(s, m);
  if (error) throw new Error(error);

  const { w, h } = s;
  const { sx, sy, tx, ty } = m;
  const grid = new Uint8Array(s.grid);
  grid[sy * w + sx] = GRID_HOLE;
  grid[((sy + ty) / 2) * w + (sx + tx) / 2] = GRID_HOLE;
  grid[ty * w + tx] = GRID_PEG;
  return { w, h, grid };
}
// --- changedState ----------------------------------------------------

/**
 * Both halves of Pegs' Ui name a peg by where it sits, and a replaced state may
 * have moved or removed it: `dragging` carries the peg picked up at
 * `(sx, sy)`, and `curJumping` arms a jump from under the cursor, checking the
 * direction at fire time but taking that peg on trust. An undo, a redo or a
 * restart is under no obligation to leave either standing, so neither survives
 * one. Upstream does the same in `game_changed_state`.
 */
function changedState(ui: PegsUi, _old: PegsState | null, _next: PegsState): void {
  ui.dragging = false;
  ui.curJumping = false;
}

// --- solve -----------------------------------------------------------

/**
 * The finished board: from the player's position if a line of jumps finishes
 * from there, else from the dealt one, which every generator makes soluble.
 * The fallback is what keeps the hint's out-of-reach refusal honest when it
 * sends the player here (`add-pegs-hint` design D3).
 */
function solve(orig: PegsState, curr: PegsState): SolveResult<PegsMove> {
  let lost = false;
  for (const s of [curr, orig]) {
    const finish = findFinish(s);
    if (finish.kind === "found") {
      const last = finish.jumps[finish.jumps.length - 1];
      const only = s.grid.indexOf(GRID_PEG);
      return { ok: true, move: { type: "solve", finish: last ? last.to : only } };
    }
    lost = finish.kind === "lost";
  }
  return { ok: false, error: lost ? NO_SOLUTION : PUZZLE_NOT_REASONABLE };
}

// --- register --------------------------------------------------------

export const pegsGame: Game<PegsParams, PegsState, PegsMove, PegsUi, PegsDrawState> = {
  id: "pegs",
  // The whole game is one press-and-drag and the secondary button means
  // nothing, so a held press must not be promoted to it: that would destroy
  // the gesture of a touch player who pauses to pick a landing square.
  ignoresSecondaryButton: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig: [
    {
      kw: "board-type",
      name: "Board type",
      type: "choices",
      choices: [...BOARD_TYPE_NAMES],
      doc: "The shape of the board. Cross is the traditional plus-shaped board, full of pegs but for the center hole; each side may be 5, 7 or 9, but not both 5. Octagon has its corners cut off diagonally instead, and comes only in 7×7; its empty hole is placed away from the center, where the board could not be solved. Random makes a board of its own shape by playing a game backwards from a single peg, so it can always be solved.",
      label: { slot: "kind" },
      get: (p) => p.type,
      set: (p, v) => {
        p.type = v;
      },
    },
    ...dimensionParamConfig<PegsParams>({
      doc: "Size of the board in holes. A new board needs both to be more than 3.",
      bounds: { min: 1 },
    }),
  ],

  newDesc,
  newState,
  newUi,

  changedState,
  interpretMove,
  executeMove,
  status,
  notApplicable: {
    findMistakes:
      "Any sequence of jumps that leaves a single peg wins, so there is no single answer to check a move against.",
  },

  solve,

  hint,
  hintMarks: HINT_MARKS,
  hintKeepTrack,
  // The drag a player makes: pick the peg up and drop it in the hole.
  hintGesture(_s, _ui, ds, m) {
    if (m.type !== "jump") return [];
    const at = (x: number, y: number) => ({
      x: tileCenter(x, ds.tileSize),
      y: tileCenter(y, ds.tileSize),
    });
    return [drag(at(m.sx, m.sy), at(m.tx, m.ty))];
  },

  textFormat,
  serializeMove,
  deserializeMove,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
  solvedFlash: () => 2 * FLASH_FRAME,
};

registerGame(pegsGame);
