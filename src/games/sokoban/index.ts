/**
 * Sokoban (upstream `puzzles/unfinished/sokoban.c`): push every barrel onto a
 * target square by walking into it; you can never pull.
 *
 * A movement puzzle: every reachable position is legal, so there is no
 * wrong-but-legal state to flag. Upstream has no solver (Sokoban solving is
 * PSPACE-complete); the hint and Solve search within a budget (`solver.ts`,
 * `hint.ts`). Moves are instant, as upstream's `game_anim_length` is 0.
 */

import { rejectMove } from "../../engine/assert-never.ts";
import type { Game, SolveResult } from "../../engine/game.ts";
import { click, type PointerAction } from "../../engine/hint-gesture.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { cursorDelta, LEFT_BUTTON, stripModifiers } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import type { Point } from "../../engine/types.ts";
import { newSokobanDesc } from "./generator.ts";
import { hint, hintKeepTrack, pushMove, routeTo } from "./hint.ts";
import { HINT_MARKS } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_LENGTH,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SokobanDrawState,
  tileCenter,
} from "./render.ts";
import { PLAN_BUDGET, search } from "./solver.ts";
import {
  canWalkTo,
  DEEP_PIT,
  decodeParams,
  defaultParams,
  detargetize,
  encodeBoard,
  encodeParams,
  isOnTarget,
  moveType,
  newState,
  PIT,
  paramConfig,
  presets,
  type SokobanMove,
  type SokobanParams,
  type SokobanState,
  type SokobanUi,
  SPACE,
  status,
  TARGET,
  targetize,
  WALL,
} from "./state.ts";

// --- input ------------------------------------------------------------

/**
 * The eight directions on the digits `1`–`9` (not `5`), beside the cursor keys'
 * four. Upstream binds only the number pad's digits; the bare digits are bound
 * too, because a numpad sends digits only with Num Lock on and a laptop may
 * have none (docs/games/input.md § "The numeric keypad never arrives").
 * `stripModifiers` lets the numpad's own digits through.
 */
const DIGIT_DIRECTIONS: Record<string, { dx: number; dy: number }> = {
  "7": { dx: -1, dy: -1 },
  "8": { dx: 0, dy: -1 },
  "9": { dx: 1, dy: -1 },
  "4": { dx: -1, dy: 0 },
  "6": { dx: 1, dy: 0 },
  "1": { dx: -1, dy: 1 },
  "2": { dx: 0, dy: 1 },
  "3": { dx: 1, dy: 1 },
};

function interpretMove(
  state: SokobanState,
  _ui: SokobanUi,
  ds: SokobanDrawState,
  p: Point,
  rawButton: number,
): SokobanMove | null {
  const button = stripModifiers(rawButton);
  let dx = 0;
  let dy = 0;

  if (button === LEFT_BUTTON) {
    // Toward the click from the player's cell, diagonally when off both axes.
    const ts = ds.tileSize;
    if (p.x < state.px * ts) dx = -1;
    else if (p.x > (state.px + 1) * ts) dx = 1;
    if (p.y < state.py * ts) dy = -1;
    else if (p.y > (state.py + 1) * ts) dy = 1;
  } else {
    const dir = cursorDelta(button) ?? DIGIT_DIRECTIONS[String.fromCharCode(button)];
    if (!dir) return null;
    dx = dir.dx;
    dy = dir.dy;
  }

  if (dx === 0 && dy === 0) return null;
  if (moveType(state, dx, dy) === "illegal") return null;
  return { type: "move", dx, dy };
}

// --- move execution ---------------------------------------------------

export function executeMove(state: SokobanState, move: SokobanMove): SokobanState {
  if (move.type === "solve") return solvedBoard(state, move.board);
  if (move.type === "push") {
    const { x, y, dx, dy } = move;
    if (![x, y, dx, dy].every(Number.isInteger) || Math.abs(dx) + Math.abs(dy) !== 1)
      rejectMove(move, "sokoban: executeMove");
    const sx = move.x - move.dx;
    const sy = move.y - move.dy;
    const at = { ...state, px: sx, py: sy };
    if (!canWalkTo(state, sx, sy) || moveType(at, move.dx, move.dy) !== "push")
      throw new Error("sokoban: a push the player cannot walk to and make");
    return executeMove(at, { type: "move", dx: move.dx, dy: move.dy });
  }
  // Check the fields the dispatch reads. A move with no step would reach
  // `moveType` as (NaN, NaN), read the grid out of bounds and come back a
  // *legal* walk, gaining the board a move it never made.
  if (
    move.type !== "move" ||
    !Number.isInteger(move.dx) ||
    !Number.isInteger(move.dy)
  ) {
    rejectMove(move, "sokoban: executeMove");
  }

  const { dx, dy } = move;
  const kind = moveType(state, dx, dy);
  if (kind === "illegal") throw new Error("sokoban: illegal move");

  const { w, h } = state;
  const grid = state.grid.slice();
  const nx = state.px + dx;
  const ny = state.py + dy;

  if (kind === "push") {
    const from = ny * w + nx;
    const to = (ny + dy) * w + nx + dx;
    // Lift the barrel, leaving the SPACE or TARGET beneath it.
    let b = grid[from];
    if (isOnTarget(b)) {
      grid[from] = TARGET;
      b = detargetize(b);
    } else {
      grid[from] = SPACE;
    }
    // Set it down beyond: it fills a pit, and a deep pit eats it and remains.
    const beyond = grid[to];
    if (beyond === PIT) grid[to] = SPACE;
    else if (beyond === TARGET) grid[to] = targetize(b);
    else if (beyond !== DEEP_PIT) grid[to] = b;
  }

  return { w, h, grid, px: nx, py: ny };
}

/** The finished board Solve's move names: its walls must be this board's, as
 * every board pushing reaches from it has them. */
function solvedBoard(state: SokobanState, board: string): SokobanState {
  const next = newState({ w: state.w, h: state.h }, board);
  next.grid.forEach((v, i) => {
    if ((v === WALL) !== (state.grid[i] === WALL))
      throw new Error("sokoban: a solution on a different board");
  });
  return next;
}

// --- solve -------------------------------------------------------------

/**
 * The finished board: from the player's position if the search finds a line
 * there, else from the dealt one, which the generator only deals where it
 * does. The fallback is what keeps the hint's out-of-reach refusal honest when
 * it sends the player here.
 */
function solve(orig: SokobanState, curr: SokobanState): SolveResult<SokobanMove> {
  let lost = false;
  for (const s of [curr, orig]) {
    const finish = search(s, PLAN_BUDGET);
    if (finish.kind === "found") {
      let end = s;
      for (const p of finish.pushes) end = executeMove(end, pushMove(s.w, p));
      return { ok: true, move: { type: "solve", board: encodeBoard(end) } };
    }
    lost = finish.kind === "lost";
  }
  return { ok: false, error: lost ? NO_SOLUTION : PUZZLE_NOT_REASONABLE };
}

// --- Game object ------------------------------------------------------

export const sokobanGame: Game<
  SokobanParams,
  SokobanState,
  SokobanMove,
  SokobanUi,
  SokobanDrawState
> = {
  id: "sokoban",
  // Stepping the player is the only gesture; the secondary button has no
  // meaning, so a touch player's held press must not be promoted into one.
  ignoresSecondaryButton: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSokobanDesc,
  newState,
  newUi: () => ({}),

  interpretMove,
  executeMove,
  status,
  notApplicable: {
    findMistakes:
      "Any sequence of pushes that gets every barrel onto a target wins, so there is no single answer to check a move against.",
  },

  solve,

  hint,
  hintMarks: HINT_MARKS,
  hintKeepTrack,
  // The walk a player makes to the barrel, a tap toward each square on the
  // way, then the tap that pushes it.
  hintGesture(s, _ui, ds, m) {
    if (m.type !== "push") return [];
    const taps: PointerAction[] = [];
    let at = s;
    for (const step of routeTo(s, m)) {
      taps.push(click(tileCenter(at.px + step.dx, at.py + step.dy, ds.tileSize)));
      at = { ...at, px: at.px + step.dx, py: at.py + step.dy };
    }
    return taps;
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_LENGTH,
};

registerGame(sokobanGame);
