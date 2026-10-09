/**
 * Tracks generator, after `new_game_desc` and `add_clues` in `tracks.c`. The
 * clue-laying is solver-gated (it keeps a clue only while the board stays
 * soluble at exactly the target difficulty). It deals other boards than
 * upstream does for a seed: the path is laid another way (`layPath`), and
 * `addClues` grades a bare board differently (see there).
 */

import type { RandomState } from "../../engine/random/index.ts";
import { randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { copyAndStrip, tracksSolve } from "./solver.ts";
import {
  type Board,
  blankBoard,
  D,
  DIRS,
  DX,
  DY,
  E_NOTRACK,
  E_TRACK,
  encodeDesc,
  inGrid,
  L,
  R,
  S_CLUE,
  S_NOTRACK,
  S_TRACK,
  sECount,
  sEDirs,
  sESet,
  type TracksParams,
  U,
} from "./state.ts";

function clearBoard(b: Board): void {
  b.sflags.fill(0);
  b.numbers.fill(0);
  b.numErrors.fill(0);
  b.rowS = -1;
  b.colS = -1;
  b.impossible = false;
}

function solveProgress(b: Board): number {
  const { w, h } = b;
  let progress = 0;
  for (let i = 0; i < w * h; i++) {
    const x = i % w;
    const y = Math.floor(i / w);
    if (b.sflags[i] & S_TRACK) progress++;
    if (b.sflags[i] & S_NOTRACK) progress++;
    progress += sECount(b, x, y, E_TRACK) + sECount(b, x, y, E_NOTRACK);
  }
  return progress;
}

/** Squares (non-clue) that would show a phantom piece of track at game start
 * (upstream `check_phantom_moves`). */
function checkPhantomMoves(b: Board): boolean {
  const { w, h } = b;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      if (b.sflags[i] & S_CLUE) continue;
      if (sECount(b, x, y, E_TRACK) > 1) return true;
    }
  }
  return false;
}

/**
 * A track while it is being laid: the squares it is on, how many of them each
 * row and column holds, and whether a square is one it could still finish from.
 */
class Coverage {
  /** Track squares in each column, then in each row: the clue numbers. */
  readonly lines: Int32Array;
  private readonly used: Uint8Array;
  /** Rows and columns with no track yet. */
  private bare: number;
  // Flood-fill scratch, stamped per fill so that nothing is cleared between.
  private readonly seen: Int32Array;
  private readonly lineSeen: Int32Array;
  private readonly stack: Int32Array;
  private stamp = 0;

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.lines = new Int32Array(w + h);
    this.used = new Uint8Array(w * h);
    this.bare = w + h;
    this.seen = new Int32Array(w * h);
    this.lineSeen = new Int32Array(w + h);
    this.stack = new Int32Array(w * h);
  }

  reset(): void {
    this.lines.fill(0);
    this.used.fill(0);
    this.bare = this.lines.length;
  }

  /** Every row and column has track, so the walk may leave. */
  get complete(): boolean {
    return this.bare === 0;
  }

  /** Whether (x, y) is a square of the board with no track on it. */
  free(x: number, y: number): boolean {
    return inGrid(this, x, y) && this.used[y * this.w + x] === 0;
  }

  enter(x: number, y: number): void {
    this.used[y * this.w + x] = 1;
    if (this.lines[x]++ === 0) this.bare--;
    if (this.lines[this.w + y]++ === 0) this.bare--;
  }

  /**
   * Whether the free squares joined to (x, y), with it, touch the bottom row
   * and every row and column still bare. A walk that steps where they do not
   * can never finish. One that steps where they do may still fail, since one
   * path cannot always take in everything it can reach, and is started again.
   */
  canFinishFrom(x: number, y: number): boolean {
    const lines = this.lines;
    const seen = this.seen;
    const lineSeen = this.lineSeen;
    const stack = this.stack;
    const { w, h } = this;
    const stamp = ++this.stamp;
    let need = this.bare;
    let bottom = false;
    let top = 0;
    const visit = (vx: number, vy: number): void => {
      seen[vy * w + vx] = stamp;
      stack[top++] = vy * w + vx;
      if (vy === h - 1) bottom = true;
      for (const line of [vx, w + vy]) {
        if (lineSeen[line] === stamp) continue;
        lineSeen[line] = stamp;
        if (lines[line] === 0) need--;
      }
    };
    visit(x, y);
    while (top > 0 && !(bottom && need === 0)) {
      const i = stack[--top];
      const cx = i % w;
      const cy = (i - cx) / w;
      for (const d of DIRS) {
        const nx = cx + DX(d);
        const ny = cy + DY(d);
        if (!this.free(nx, ny) || seen[ny * w + nx] === stamp) continue;
        visit(nx, ny);
      }
    }
    return bottom && need === 0;
  }
}

/**
 * A random walk from the left edge to the bottom edge through every row and
 * column, as the squares it passes in order, or `null` where it had nowhere to
 * go. It may not leave while a row or column is bare, and never steps where it
 * could no longer finish.
 *
 * Upstream walks freely and throws away every walk that left a line bare. Its
 * walk is about 25 squares long whatever the board's size, so that kept one
 * walk in 13 at 8x8, one in 2,000 at 30x30 and one in 100,000 at 60x8
 * (measured 2026-10-09). This one keeps about two in three at every square
 * size from 5x5 to 50x50, and its track fills more of a large board.
 */
function walk(cover: Coverage, rs: RandomState): number[] | null {
  const { w, h } = cover;
  const dirs = [...DIRS];
  const path: number[] = [];
  cover.reset();
  let x = 0;
  let y = randomUpto(rs, h);
  step: for (;;) {
    cover.enter(x, y);
    path.push(y * w + x);
    shuffle(dirs, rs);
    for (const d of dirs) {
      const nx = x + DX(d);
      const ny = y + DY(d);
      if (ny === h) {
        if (cover.complete) return path;
        continue;
      }
      if (!cover.free(nx, ny) || !cover.canFinishFrom(nx, ny)) continue;
      x = nx;
      y = ny;
      continue step;
    }
    return null;
  }
}

/**
 * Where `singleOnes` forbids a clue of 1 among `lines`: on the entrance's
 * column, on the exit's row, and next to another in the list. The answer is
 * the first of two lines that lie side by side on the board and include it,
 * or -1 where nothing is forbidden.
 */
function forbiddenOne(lines: Int32Array, w: number): number {
  const last = lines.length - 1;
  if (lines[0] === 1) return 0;
  if (lines[last] === 1) return last - 1;
  for (let i = 1; i <= last; i++) {
    if (lines[i] !== 1 || lines[i - 1] !== 1) continue;
    // The last column and the first row are neighbors in the list alone.
    return i === w ? w - 2 : i - 1;
  }
  return -1;
}

/**
 * Bend the track until it shows no clue of 1 that `singleOnes` forbids, or
 * answer false where a bend has no room.
 *
 * A line with one track square is crossed by one straight step, which also
 * crosses the line beside it. Taking that step round three sides of a square,
 * through the row or column next to it, gives each of the two lines a second
 * track square and the one it detours through two more, so it can make no new
 * 1. Upstream throws the track away instead, which keeps three in five at
 * 12x12, one in fourteen at 60x8 and none in 144 at 200x8 (2026-10-09).
 */
function spreadOnes(cover: Coverage, path: number[], rs: RandomState): boolean {
  const { w } = cover;
  const signs = [-1, 1];
  for (;;) {
    const first = forbiddenOne(cover.lines, w);
    if (first < 0) return true;
    const rows = first >= w;
    const lineOf = (cell: number): number =>
      rows ? w + Math.floor(cell / w) : cell % w;
    const k = path.findIndex(
      (cell, n) =>
        n + 1 < path.length &&
        Math.min(lineOf(cell), lineOf(path[n + 1])) === first &&
        Math.max(lineOf(cell), lineOf(path[n + 1])) === first + 1,
    );
    if (k < 0) return false;
    // Two rows are crossed by a vertical step, which bends sideways.
    const dx = rows ? 1 : 0;
    const dy = rows ? 0 : 1;
    const ends = [path[k], path[k + 1]].map((cell) => ({
      x: cell % w,
      y: Math.floor(cell / w),
    }));
    shuffle(signs, rs);
    const sign = signs.find((s) =>
      ends.every((e) => cover.free(e.x + s * dx, e.y + s * dy)),
    );
    if (sign === undefined) return false;
    const detour = ends.map((e) => ({ x: e.x + sign * dx, y: e.y + sign * dy }));
    for (const e of detour) cover.enter(e.x, e.y);
    path.splice(k + 1, 0, ...detour.map((e) => e.y * w + e.x));
  }
}

/**
 * Lay a track on `b` from the left edge to the bottom edge, through every row
 * and column, and under `singleOnes` with no clue of 1 where that forbids one.
 */
function layPath(b: Board, rs: RandomState, singleOnes: boolean): void {
  const { w, h } = b;
  const cover = new Coverage(w, h);
  const attempt = retryLimit("tracks: layPath");
  for (;;) {
    attempt();

    const path = walk(cover, rs);
    if (path === null) continue;
    if (singleOnes && !spreadOnes(cover, path, rs)) continue;

    clearBoard(b);
    b.rowS = Math.floor(path[0] / w);
    b.colS = path[path.length - 1] % w;
    sESet(b, 0, b.rowS, L, E_TRACK);
    path.forEach((cell, k) => {
      const step = k + 1 < path.length ? path[k + 1] - cell : w;
      const d = step === 1 ? R : step === -1 ? L : step === w ? D : U;
      sESet(b, cell % w, Math.floor(cell / w), d, E_TRACK);
    });
    return;
  }
}

/** Lay clues to solubility at the target difficulty, then strip redundant
 * ones (upstream `add_clues`). Returns 1 (soluble at target) or −1 (need a
 * new board / already too easy). */
function addClues(b: Board, rs: RandomState, diff: number): number {
  const { w, h } = b;
  const positions: number[] = [];
  const nedgesPreviousSolve = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (sEDirs(b, i % w, Math.floor(i / w), E_TRACK) !== 0) positions.push(i);
  }

  // Already too easy, or already soluble without any added clues? Only a solve
  // that finishes is graded: a bare board that stalls before the target tier's
  // rungs fire has not shown it is too easy, only that it needs clues, and the
  // laying loop below refuses any clue that finishes it too easily. Upstream's
  // f8027fb also rejected the stalled board, which doubles the time a 15x15
  // takes at the top tier (276 ms against 146, 2026-10-09).
  let scratch = copyAndStrip(b, -1);
  const first = tracksSolve(scratch, diff);
  if (first.ret < 0) throw new Error("Generator produced impossible puzzle");
  if (first.ret > 0) return first.maxDiff < diff ? -1 : 1;
  let progress = solveProgress(scratch);

  // Lay clues until soluble.
  shuffle(positions, rs);
  let laid = false;
  for (const i of positions) {
    if (b.sflags[i] & S_CLUE) continue; // already a clue (entrance/exit)
    if (nedgesPreviousSolve[i] === 2) continue; // wouldn't help
    scratch = copyAndStrip(b, i);
    if (checkPhantomMoves(scratch)) continue;
    const solved = tracksSolve(scratch, diff);
    if (solved.ret > 0) {
      if (solved.maxDiff < diff) continue; // too easy
      b.sflags[i] |= S_CLUE;
      laid = true;
      break;
    }
    if (solveProgress(scratch) > progress) {
      progress = solveProgress(scratch);
      b.sflags[i] |= S_CLUE;
      for (let j = 0; j < w * h; j++) {
        nedgesPreviousSolve[j] = sECount(scratch, j % w, Math.floor(j / w), E_TRACK);
      }
    }
  }
  if (!laid) return -1; // never made it soluble

  // Strip redundant clues.
  shuffle(positions, rs);
  for (const i of positions) {
    if (!(b.sflags[i] & S_CLUE)) continue;
    if (
      (i % w === 0 && Math.floor(i / w) === b.rowS) ||
      (Math.floor(i / w) === h - 1 && i % w === b.colS)
    ) {
      continue; // never strip entrance/exit
    }
    scratch = copyAndStrip(b, i);
    if (checkPhantomMoves(scratch)) continue;
    if (tracksSolve(scratch, diff).ret > 0) b.sflags[i] &= ~S_CLUE; // still soluble
  }
  return 1;
}

export function newDesc(
  p: TracksParams,
  rs: RandomState,
): { desc: string; aux?: string } {
  const { w, h } = p;
  const diff = p.diff;

  const b = blankBoard(w, h);
  // The rarest cell counted is a 5x4 at the top tier, one try in 770
  // (2026-10-09), which the house bound runs out once in 400,000 deals.
  const attempt = retryLimit("tracks: generation");
  for (;;) {
    attempt();

    layPath(b, rs, p.singleOnes);
    // Mark the laid track, clue the entrance and exit, and count the clues.
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (sECount(b, x, y, E_TRACK) > 0) {
          b.sflags[y * w + x] |= S_TRACK;
          b.numbers[x]++;
          b.numbers[y + w]++;
        }
        if ((x === 0 && y === b.rowS) || (y === h - 1 && x === b.colS)) {
          b.sflags[y * w + x] |= S_CLUE;
        }
      }
    }

    if (addClues(b, rs, diff) !== 1) continue; // couldn't make soluble / too easy

    return { desc: encodeDesc(b) };
  }
}
