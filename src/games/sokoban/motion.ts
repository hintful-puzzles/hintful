/**
 * How a move looks in motion: the player's route square by square, and the
 * barrel it pushes, from the board before the move to the board after it.
 *
 * Read off the two boards rather than the move, so a step, a tap's walk, a
 * push and the hint's push all move the same way, and an undo plays the same
 * motion backward. Two boards whose barrels differ in any other way (Solve's,
 * or a barrel a pit took) have no motion and change at once.
 */

import { isBarrel, moveType, type SokobanState } from "./state.ts";

/** The player's squares from start to end, one per step, and the barrel it
 * pushes: the square it starts on, the way it goes, how far, and the step of
 * `path` at which the player reaches the square behind it. */
export interface Motion {
  readonly path: readonly number[];
  readonly barrel: {
    readonly from: number;
    readonly dx: number;
    readonly dy: number;
    readonly n: number;
    readonly at: number;
  } | null;
}

/** Seconds a square of motion takes, and the bounds on a whole move: quick
 * enough that a long walk does not hold up play, long enough to see. */
const STEP_S = 0.06;
const MIN_S = 0.1;
const MAX_S = 0.45;

/** The squares the player walks from `from` to `to` on `s`, fewest steps,
 * diagonals where a corner allows them; null if it cannot get there. */
function route(s: SokobanState, from: number, to: number): number[] | null {
  const { w, h } = s;
  const prev = new Int32Array(w * h).fill(-1);
  prev[from] = from;
  const queue = [from];
  const steps = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  for (let q = 0; q < queue.length && prev[to] < 0; q++) {
    const c = queue[q];
    const at = { ...s, px: c % w, py: Math.floor(c / w) };
    for (const [dx, dy] of steps) {
      if (moveType(at, dx, dy) !== "walk") continue;
      const n = (at.py + dy) * w + at.px + dx;
      if (prev[n] >= 0) continue;
      prev[n] = c;
      queue.push(n);
    }
  }
  if (prev[to] < 0) return null;
  const path: number[] = [];
  for (let c = to; c !== from; c = prev[c]) path.push(c);
  path.push(from);
  return path.reverse();
}

/** The motion from `earlier` to `later`, or null where there is none to show. */
function motionBetween(earlier: SokobanState, later: SokobanState): Motion | null {
  const { w } = earlier;
  const start = earlier.py * w + earlier.px;
  const end = later.py * w + later.px;
  const gone: number[] = [];
  const came: number[] = [];
  for (let c = 0; c < earlier.grid.length; c++) {
    const before = isBarrel(earlier.grid[c]);
    const after = isBarrel(later.grid[c]);
    if (before && !after) gone.push(c);
    if (after && !before) came.push(c);
  }
  if (gone.length === 0 && came.length === 0) {
    if (start === end) return null;
    const path = route(earlier, start, end);
    return path ? { path, barrel: null } : null;
  }
  if (gone.length !== 1 || came.length !== 1) return null;
  const [s] = gone;
  const [t] = came;
  const sx = s % w;
  const sy = Math.floor(s / w);
  const tx = t % w;
  const ty = Math.floor(t / w);
  if (sx !== tx && sy !== ty) return null;
  const dx = Math.sign(tx - sx);
  const dy = Math.sign(ty - sy);
  const n = Math.abs(tx - sx) + Math.abs(ty - sy);
  const walk = route(earlier, start, s - dy * w - dx);
  if (!walk) return null;
  const path = [...walk];
  for (let k = 0; k < n; k++) path.push(s + k * (dy * w + dx));
  if (path[path.length - 1] !== end) return null;
  return { path, barrel: { from: s, dx, dy, n, at: walk.length - 1 } };
}

/** The motion of a transition from `prev` to `next`, which an undo (`dir`
 * negative) plays from `next`'s side: the motion of the move it undoes. */
export function motionFor(
  prev: SokobanState,
  next: SokobanState,
  dir: number,
): Motion | null {
  return dir < 0 ? motionBetween(next, prev) : motionBetween(prev, next);
}

/** How long `m` takes to play, in seconds. */
export function motionLength(m: Motion): number {
  return Math.min(MAX_S, Math.max(MIN_S, (m.path.length - 1) * STEP_S));
}

/** Where the player and the barrel are a fraction `p` of the way through
 * `m`, in squares (fractional), on a board `w` wide. */
export function motionAt(
  m: Motion,
  w: number,
  p: number,
): { player: { x: number; y: number }; barrel: { x: number; y: number } | null } {
  const steps = m.path.length - 1;
  const f = Math.min(Math.max(p, 0), 1) * steps;
  const i = Math.min(Math.floor(f), steps - 1);
  const a = m.path[i];
  const b = m.path[i + 1];
  const k = f - i;
  const player = {
    x: (a % w) * (1 - k) + (b % w) * k,
    y: Math.floor(a / w) * (1 - k) + Math.floor(b / w) * k,
  };
  if (!m.barrel) return { player, barrel: null };
  const { from, dx, dy, n, at } = m.barrel;
  const moved = Math.min(Math.max(f - at, 0), n);
  return {
    player,
    barrel: { x: (from % w) + moved * dx, y: Math.floor(from / w) + moved * dy },
  };
}
