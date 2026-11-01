/**
 * Slide's move application and drag reachability, by the description's rules,
 * in their own module because `render.ts` needs them too: upstream's
 * `game_redraw` shows an in-progress drag by *simulating the release move*, so
 * the renderer calls `slid`, and from `index.ts` that would be an import cycle
 * (docs/rendering.md § "A simulated-release preview lives in `moves.ts`").
 */

import { assertNever } from "../../engine/assert-never.ts";
import { describedSpace } from "../../engine/describe-runtime.ts";
import type { GameStatus } from "../../engine/types.ts";
import * as slide from "./slide.compiled.ts";
import {
  ANCHOR,
  EMPTY,
  isAnchor,
  isDist,
  MAINANCHOR,
  type SlideMove,
  type SlideState,
  WALL,
} from "./state.ts";

// --- the description's rules ---------------------------------------------

/** The description's rules on a board of this size. */
function rulesOf(s: { w: number; h: number }) {
  return slide.rules(describedSpace(slide.units, s.w, s.h), {}, []);
}

/** The board as the description's layers: each block numbered in the order
 * its first square comes, the main block 1. */
function positionOf(s: SlideState): slide.Position {
  const n = s.w * s.h;
  const goal = new Int32Array(n);
  goal[s.ty * s.w + s.tx] = 1;
  const block = new Int32Array(n);
  let next = 2;
  s.board.forEach((v, i) => {
    if (v === MAINANCHOR) block[i] = 1;
    else if (v === ANCHOR) block[i] = next++;
    else if (isDist(v)) block[i] = block[i - v];
  });
  return {
    ground: Int32Array.from(s.board, (v) => (v === WALL ? 1 : 0)),
    field: Int32Array.from(s.forcefield),
    goal,
    block,
  };
}

/** The canonical board the layers' blocks make: each block's first square
 * its anchor, and each later one the distance back to the one before. */
function boardOf(p: slide.Position): Uint8Array {
  const last = new Map<number, number>();
  return Uint8Array.from(p.block, (k, i) => {
    if (k === 0) return p.ground[i] === 1 ? WALL : EMPTY;
    const prev = last.get(k);
    last.set(k, i);
    if (prev !== undefined) return i - prev;
    return k === 1 ? MAINANCHOR : ANCHOR;
  });
}

/**
 * Every square the block anchored at `anchor` can have its anchor slid to,
 * each with the board there: the description's shifts of that block alone,
 * searched breadth first, so the block's own squares are free space as it
 * slides out of them and only the main block crosses a forcefield. Empty
 * where no block is anchored there.
 */
function slides(state: SlideState, anchor: number): Map<number, slide.Position> {
  const reached = new Map<number, slide.Position>();
  if (!isAnchor(state.board[anchor])) return reached;
  const rules = rulesOf(state);
  const sp = describedSpace(slide.units, state.w, state.h);
  reached.set(anchor, positionOf(state));
  const queue = [anchor];
  for (let q = 0; q < queue.length; q++) {
    const a = queue[q];
    const p = reached.get(a) as slide.Position;
    for (const n of sp.adj4[a]) {
      const m: slide.Move = { move: "shift", a, n };
      // The block's first square moves with it, onto n.
      if (reached.has(n) || !rules.legal(p, m)) continue;
      reached.set(n, rules.play(p, m));
      queue.push(n);
    }
  }
  return reached;
}

/** Solved by the description's finish: the main block's anchor sits on the
 * target. */
export function status(s: SlideState): GameStatus {
  return rulesOf(s).finished(positionOf(s)) ? "solved" : "ongoing";
}

/**
 * The board after sliding the block anchored at `from` so its anchor lands
 * on `to` (upstream `move_piece`), by a line of the description's shifts;
 * null where the block cannot get there.
 */
export function slid(state: SlideState, from: number, to: number): Uint8Array | null {
  const p = slides(state, from).get(to);
  return p === undefined ? null : boardOf(p);
}

/**
 * Mark, in `reachable`, every square the block anchored at `anchor` can have
 * its anchor slid to — upstream's BFS in `interpret_move`'s press arm, by the
 * description's shifts.
 */
export function computeReachable(
  state: SlideState,
  anchor: number,
  reachable: Uint8Array,
): void {
  reachable.fill(0);
  for (const at of slides(state, anchor).keys()) reachable[at] = 1;
}

/**
 * The reachable square nearest `(tx, ty)` by Manhattan distance, or `null` if
 * none is close enough — upstream's outward spiral in the drag arm, tie-breaks
 * and search bound included. `(tx, ty)` is where the *anchor* would go, i.e.
 * the pointer cell minus the grab offset, and may legitimately be off-board.
 */
export function nearestReachable(
  w: number,
  h: number,
  reachable: Uint8Array,
  tx: number,
  ty: number,
): number | null {
  const distlimit = Math.max(w + tx, h + ty, tx, ty);

  for (let dist = 0; dist <= distlimit; dist++) {
    for (let dx = -dist; dx <= dist; dx++) {
      for (let s = -1; s <= 1; s += 2) {
        const dy = s * (dist - Math.abs(dx));
        const px = tx + dx;
        const py = ty + dy;
        if (px >= 0 && px < w && py >= 0 && py < h && reachable[py * w + px])
          return py * w + px;
      }
    }
  }
  return null;
}

/**
 * Apply a move (upstream `execute_move`). Pure: returns a new state.
 *
 * Sliding the *same* block again does not increment the move counter, and
 * sliding it back where it started *decrements* it — so a multi-nudge slide
 * counts as the one move it is. That is what the `lastmoved` / `lastmovedPos`
 * pair on the state is for, and it governs the displayed count that
 * `maxmoves`/`minmoves` are measured in. It is independent of the engine's undo
 * stack.
 */
export function executeMove(state: SlideState, move: SlideMove): SlideState {
  if (move.kind === "solution") {
    const start: SlideState = move.restart
      ? { ...state, board: state.dealt, lastmoved: -1, lastmovedPos: -1, movecount: 0 }
      : state;
    return move.moves.reduce(
      (s, step) => executeMove(s, { kind: "move", from: step.from, to: step.to }),
      start,
    );
  }
  if (move.kind !== "move") return assertNever(move, "slide: executeMove");

  const { from, to } = move;
  const board = slid(state, from, to);
  if (board === null) throw new Error("slide: illegal move");

  let { lastmoved, lastmovedPos, movecount } = state;

  if (from === lastmoved) {
    if (to === lastmovedPos) {
      movecount--; // reverted the last move
      lastmoved = -1;
      lastmovedPos = -1;
    } else {
      lastmoved = to; // same block again; lastmovedPos deliberately unchanged
    }
  } else {
    lastmoved = to;
    lastmovedPos = from;
    movecount++;
  }

  return {
    ...state,
    board,
    lastmoved,
    lastmovedPos,
    movecount,
  };
}
