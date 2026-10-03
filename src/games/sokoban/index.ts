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
import { click, drag, type PointerAction } from "../../engine/hint-gesture.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { UI_UPDATE, type UiUpdate } from "../../engine/index.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  cursorDelta,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import type { Point } from "../../engine/types.ts";
import { newSokobanDesc } from "./generator.ts";
import { hint, hintKeepTrack, pushMove } from "./hint.ts";
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
  isBarrel,
  isOnTarget,
  moveType,
  newState,
  PIT,
  paramConfig,
  presets,
  pushReach,
  type SokobanMove,
  type SokobanParams,
  type SokobanPush,
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

/**
 * The push a drag held from the player and now at `p` would make: toward the
 * barrel beside the player along the drag's main axis, one square for each
 * tile the drag reaches past the player, no further than the barrel can go.
 * Null while the drag is still on the player, points at no barrel, or has left
 * the board, which is where a pointer that leaves the canvas is reported.
 */
function aimAt(s: SokobanState, ts: number, p: Point): SokobanPush | null {
  const { w, h, px, py } = s;
  if (p.x < 0 || p.y < 0 || p.x >= w * ts || p.y >= h * ts) return null;
  const center = tileCenter(px, py, ts);
  const ox = p.x - center.x;
  const oy = p.y - center.y;
  const along = Math.max(Math.abs(ox), Math.abs(oy));
  if (along < ts / 2) return null;
  const dx = Math.abs(ox) >= Math.abs(oy) ? Math.sign(ox) : 0;
  const dy = dx === 0 ? Math.sign(oy) : 0;
  const bx = px + dx;
  const by = py + dy;
  if (bx < 0 || bx >= w || by < 0 || by >= h || !isBarrel(s.grid[by * w + bx]))
    return null;
  const reach = pushReach(s, bx, by, dx, dy);
  if (reach === 0) return null;
  return {
    type: "push",
    x: bx,
    y: by,
    dx,
    dy,
    n: Math.min(Math.round(along / ts), reach),
  };
}

/**
 * A tap walks the player to any square they can reach and never pushes. A
 * push is a drag held from the player out toward a barrel, previewed until it
 * is let go; let go back on the player, it is called off. The keyboard steps
 * one square at a time, pushing what it walks into, as upstream does.
 */
function interpretMove(
  state: SokobanState,
  ui: SokobanUi,
  ds: SokobanDrawState,
  p: Point,
  rawButton: number,
): SokobanMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;

  if (button === LEFT_BUTTON) {
    // A press on the player is a drag starting, so it must be claimed for the
    // drag to arrive; anywhere else only the release decides, and a press that
    // slides off before it lifts still taps where it started
    // (docs/games/input.md § "A press you do not act on must still be consumed").
    if (Math.floor(p.x / ts) !== state.px || Math.floor(p.y / ts) !== state.py)
      return null;
    ui.aiming = true;
    ui.aim = null;
    return UI_UPDATE;
  }
  if (button === LEFT_DRAG) {
    if (!ui.aiming) return null;
    const aim = aimAt(state, ts, p);
    if (JSON.stringify(aim) === JSON.stringify(ui.aim)) return null;
    ui.aim = aim;
    return UI_UPDATE;
  }
  if (button === LEFT_RELEASE) {
    if (ui.aiming) {
      const aim = ui.aim;
      ui.aiming = false;
      ui.aim = null;
      return aim ?? UI_UPDATE;
    }
    const x = Math.floor(p.x / ts);
    const y = Math.floor(p.y / ts);
    if (x < 0 || x >= state.w || y < 0 || y >= state.h) return null;
    if (x === state.px && y === state.py) return null;
    return canWalkTo(state, x, y) ? { type: "walk", x, y } : null;
  }

  const dir = cursorDelta(button) ?? DIGIT_DIRECTIONS[String.fromCharCode(button)];
  if (!dir) return null;
  const { dx, dy } = dir;
  if (moveType(state, dx, dy) === "illegal") return null;
  return { type: "move", dx, dy };
}

/** A drag held when the board changes under it, by an undo or a hint, aims
 * from a player who may no longer be there, so it does not survive one. */
function changedState(
  ui: SokobanUi,
  _old: SokobanState | null,
  _next: SokobanState,
): void {
  ui.aiming = false;
  ui.aim = null;
}

// --- move execution ---------------------------------------------------

export function executeMove(state: SokobanState, move: SokobanMove): SokobanState {
  if (move.type === "solve") return solvedBoard(state, move.board);
  if (move.type === "walk") {
    const { x, y } = move;
    if (!Number.isInteger(x) || !Number.isInteger(y))
      rejectMove(move, "sokoban: executeMove");
    const inside = x >= 0 && x < state.w && y >= 0 && y < state.h;
    if (!inside || !canWalkTo(state, x, y))
      throw new Error("sokoban: a walk to a square the player cannot reach");
    return { ...state, px: x, py: y };
  }
  if (move.type === "push") {
    const { x, y, dx, dy, n } = move;
    if (
      ![x, y, dx, dy, n].every(Number.isInteger) ||
      Math.abs(dx) + Math.abs(dy) !== 1 ||
      n < 1
    )
      rejectMove(move, "sokoban: executeMove");
    const sx = x - dx;
    const sy = y - dy;
    const at = { ...state, px: sx, py: sy };
    if (
      !canWalkTo(state, sx, sy) ||
      moveType(at, dx, dy) !== "push" ||
      n > pushReach(state, x, y, dx, dy)
    )
      throw new Error("sokoban: a push the player cannot walk to and make");
    let next: SokobanState = at;
    for (let i = 0; i < n; i++) next = executeMove(next, { type: "move", dx, dy });
    return next;
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
  newUi: () => ({ aiming: false, aim: null }),

  changedState,
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
  // What a player does: tap the square behind the barrel, unless already
  // there, then drag from the player onto the barrel.
  hintGesture(s, _ui, ds, m) {
    if (m.type !== "push") return [];
    const ts = ds.tileSize;
    const stand = { x: m.x - m.dx, y: m.y - m.dy };
    const out: PointerAction[] = [];
    if (stand.x !== s.px || stand.y !== s.py)
      out.push(click(tileCenter(stand.x, stand.y, ts)));
    out.push(
      drag(
        tileCenter(stand.x, stand.y, ts),
        tileCenter(m.x + (m.n - 1) * m.dx, m.y + (m.n - 1) * m.dy, ts),
      ),
    );
    return out;
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
