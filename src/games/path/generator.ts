/**
 * Path's generator: lay paths that fill the board, number their ends, and
 * keep the board only where the ladder finishes it at exactly the tier asked
 * for.
 *
 * The paths are grown as upstream's `path.c` sketched: start from many short
 * pieces and join them end to end, so that a few long paths fill the board.
 * Upstream found its boards had other answers than the one it laid, and had
 * no solver to tell. Here the ladder is that solver: where it stalls, a path
 * is cut in two at an edge the ladder could not decide, which puts two more
 * numbers on the board, until the ladder finishes it. Then paths are joined
 * again wherever the ladder still finishes the board without the two numbers
 * the join takes away, so the board keeps only the numbers it needs.
 */

import { type CappedSolve, solvableAtExactlyTier } from "../../engine/difficulty.ts";
import { OPEN } from "../../engine/line-drawing.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import {
  across,
  edgeBetween,
  type SquareEdges,
  squareEdges,
} from "../../engine/square-edges.ts";
import { PathBoard, solvePath } from "./solver.ts";
import { DIFF_EASY, encodeDesc, type PathParams } from "./state.ts";

/** The fewest squares a path may have: two numbers side by side would leave
 * the player nothing to find. */
const MIN_LENGTH = 3;

/** The longest straight run a path may be. Upstream found its boards full
 * of "really boring and obvious paths", a whole edge row as one path, and a
 * straight line between two numbers in a row is the shape of them. */
const LONGEST_STRAIGHT = 3;

/** A path's squares, end to end. */
type Path = readonly number[];

/** Whether `path` is a straight line too long to be worth finding. */
function boring(g: SquareEdges, path: Path): boolean {
  if (path.length <= LONGEST_STRAIGHT) return false;
  const row = (i: number): number => Math.floor(i / g.w);
  const col = (i: number): number => i % g.w;
  return (
    path.every((i) => row(i) === row(path[0])) ||
    path.every((i) => col(i) === col(path[0]))
  );
}

/** Whether `p` and `q` touch anywhere but at `u` beside `v`. A path never
 * touches itself except along its own line, as in `path.c`: one that did
 * would leave a corner a line could cut. */
function touches(g: SquareEdges, p: Path, q: Path, u: number, v: number): boolean {
  const inQ = new Set(q);
  for (const i of p)
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e >= 0 && inQ.has(across(g, e, i)) && !(i === u && across(g, e, i) === v))
        return true;
    }
  return false;
}

/** `p` and `q` as one path, through `u`, an end of `p`, beside `v`, an end of
 * `q`. */
function joined(p: Path, q: Path, u: number, v: number): Path {
  const head = p[0] === u ? [...p].reverse() : p;
  const tail = q[0] === v ? q : [...q].reverse();
  return [...head, ...tail];
}

/** Two paths whose ends sit side by side, as a join would take them. */
interface Join {
  p: number;
  q: number;
  u: number;
  v: number;
}

/** Every join of two of `paths` whose ends touch, the joined path touching
 * itself nowhere else and not {@link boring}. */
function joins(g: SquareEdges, paths: readonly Path[]): Join[] {
  const owner = new Int32Array(g.cells).fill(-1);
  paths.forEach((path, k) => {
    owner[path[0]] = k;
    owner[path[path.length - 1]] = k;
  });
  const out: Join[] = [];
  for (let e = 0; e < g.edgeCount; e++) {
    const [u, v] = [g.a[e], g.b[e]];
    const [p, q] = [owner[u], owner[v]];
    if (p < 0 || q < 0 || p === q) continue;
    if (touches(g, paths[p], paths[q], u, v)) continue;
    if (!boring(g, joined(paths[p], paths[q], u, v))) out.push({ p, q, u, v });
  }
  return out;
}

/** `paths` with join `j` made. */
function withJoin(paths: readonly Path[], j: Join): Path[] {
  const out = paths.filter((_, k) => k !== j.p && k !== j.q);
  out.push(joined(paths[j.p], paths[j.q], j.u, j.v));
  return out;
}

/** Paths filling the board, or `null` where the joining left a path too
 * short to stand. Every square starts as a path of its own, and paths are
 * joined at random until no two can be. A path too short to stand is joined
 * first, the one with the fewest joins left soonest: joined at random among
 * the rest, one is soon walled in by long paths' middles, and the chance that
 * none is falls away with the board's area. */
function layPaths(g: SquareEdges, rng: RandomState): Path[] | null {
  let paths: Path[] = Array.from({ length: g.cells }, (_, i) => [i]);
  // Each join leaves one path fewer.
  const join = retryLimit("path: lay", g.cells);
  for (;;) {
    join();
    const candidates = joins(g, paths);
    if (candidates.length === 0) break;
    shuffle(candidates, rng);
    const short = (k: number): boolean => paths[k].length < MIN_LENGTH;
    const ways = new Map<number, number>();
    for (const j of candidates)
      for (const k of [j.p, j.q]) if (short(k)) ways.set(k, (ways.get(k) ?? 0) + 1);
    let pick = candidates[0];
    if (ways.size > 0) {
      const fewest = Math.min(...ways.values());
      const k = [...ways].find(([, n]) => n === fewest)?.[0];
      pick = candidates.find((j) => j.p === k || j.q === k) ?? pick;
    }
    paths = withJoin(paths, pick);
  }
  return paths.every((p) => p.length >= MIN_LENGTH) ? paths : null;
}

/** The numbers for `paths`: each path's two ends take one number, numbered in
 * reading order of the first square of either end. */
function numberEnds(g: SquareEdges, paths: readonly Path[]): Uint8Array {
  const order = paths
    .map((p) => [p[0], p[p.length - 1]] as const)
    .sort((x, y) => Math.min(...x) - Math.min(...y));
  const ends = new Uint8Array(g.cells);
  order.forEach(([s, t], k) => {
    ends[s] = ends[t] = k + 1;
  });
  return ends;
}

/** The ladder run on `ends` at `cap`, with the edges it decided. */
function attempt(p: PathParams, ends: Uint8Array, cap: number): PathBoard {
  const board = new PathBoard(
    p.w,
    p.h,
    ends,
    new Uint8Array(squareEdges(p.w, p.h).edgeCount),
  );
  solvePath(board, cap);
  return board;
}

/**
 * Cut paths in two at edges the ladder leaves open until it finishes the
 * board at `cap`, or return `null` where no path can be cut and keep both
 * halves long enough.
 */
function mend(
  p: PathParams,
  g: SquareEdges,
  start: readonly Path[],
  rng: RandomState,
  cap: number,
): Path[] | null {
  const paths = [...start];
  // Each cut makes one path more, and no board holds more paths than it has
  // squares.
  const cut = retryLimit("path: mend", g.cells);
  for (;;) {
    cut();
    const board = attempt(p, numberEnds(g, paths), cap);
    if (!board.unfinished()) return paths;
    const cuts: { path: number; at: number }[] = [];
    paths.forEach((path, k) => {
      for (let at = MIN_LENGTH; at <= path.length - MIN_LENGTH; at++) {
        if (board.edges[edgeBetween(g, path[at - 1], path[at])] !== OPEN) continue;
        if (boring(g, path.slice(0, at)) || boring(g, path.slice(at))) continue;
        cuts.push({ path: k, at });
      }
    });
    if (cuts.length === 0) return null;
    const { path, at } = cuts[randomUpto(rng, cuts.length)];
    const whole = paths[path];
    paths.splice(path, 1, whole.slice(0, at), whole.slice(at));
  }
}

/** Join paths, in a random order, wherever the ladder still finishes the
 * board at `cap` without the two numbers a join takes away. A join the
 * ladder refused is not tried again: joins elsewhere seldom make it one the
 * ladder takes, and trying every refused join on every pass costs a solve
 * each. */
function strip(
  p: PathParams,
  g: SquareEdges,
  start: readonly Path[],
  rng: RandomState,
  cap: number,
): Path[] {
  let paths = [...start];
  // By the edge between the two ends a join meets at.
  const refused = new Set<number>();
  // Each pass but the last joins two paths into one.
  const pass = retryLimit("path: strip", g.cells);
  for (let again = true; again; ) {
    pass();
    again = false;
    const candidates = joins(g, paths);
    shuffle(candidates, rng);
    for (const j of candidates) {
      const at = edgeBetween(g, j.u, j.v);
      if (refused.has(at)) continue;
      const tried = withJoin(paths, j);
      if (attempt(p, numberEnds(g, tried), cap).unfinished()) {
        refused.add(at);
        continue;
      }
      paths = tried;
      again = true;
      break;
    }
  }
  return paths;
}

/**
 * A board at exactly tier `p.diff`. The paths are mended until the Easy rung
 * finishes the board, then stripped at each tier in turn, up to the one asked
 * for. A board stripped as far as the tier below allows takes a join at the
 * next only where that join leaves the tier below unable to finish it, so
 * each tier's strip pushes the board past the last, and one that joins
 * nothing leaves the board too easy.
 */
export function newPathDesc(p: PathParams, rng: RandomState): { desc: string } {
  const g = squareEdges(p.w, p.h);
  const next = retryLimit("path: generation");
  for (;;) {
    next();
    const laid = layPaths(g, rng);
    if (laid === null) continue;
    let paths = mend(p, g, laid, rng, DIFF_EASY);
    if (paths === null) continue;
    let joined = true;
    for (let tier = DIFF_EASY; tier <= p.diff; tier++) {
      const before = paths.length;
      paths = strip(p, g, paths, rng, tier);
      joined = paths.length < before;
    }
    if (p.diff > DIFF_EASY && !joined) continue;
    const ends = numberEnds(g, paths);
    const capped: CappedSolve = (cap) =>
      attempt(p, ends, cap).unfinished() ? "unsolved" : "solved";
    if (solvableAtExactlyTier(capped, p.diff)) return { desc: encodeDesc(ends) };
  }
}
