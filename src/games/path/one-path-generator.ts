/**
 * The Path ruleset's generator: lay one path through every square, number
 * points along it, and keep the board only where the ladder finishes it at
 * exactly the tier asked for.
 *
 * As Pairs' generator does with its pairs, the numbers are mended until the
 * Easy rung finishes the board, then stripped. Mending numbers a square of
 * the path beside an edge the ladder left open; stripping takes a number
 * away wherever the ladder still finishes the board without it. The 1 and
 * the highest number stay on the path's two ends. A few walls are laid at
 * random on edges the path does not take before any of that, and each one
 * the stripped board can do without is taken away last, so a wall kept is
 * one the board needs with the numbers it has.
 *
 * Walls laid first and kept where needed made a 7x7 Normal board a median
 * 60 ms to find; trying each wall on the stripped board, and keeping it
 * where it let one more number go, took 700 ms, and kept a median of eight
 * numbers on a board against seven, with as many walls (2026-10-23).
 */

import { dealUnreasonable } from "../../engine/answer-search.ts";
import { type CappedSolve, solvableAtExactlyTier } from "../../engine/difficulty.ts";
import { OPEN } from "../../engine/line-drawing.ts";
import { type RandomState, randomBits, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import {
  edgeBetween,
  type SquareEdges,
  squareEdges,
} from "../../engine/square-edges.ts";
import { PathBoard, searchAnswer, solvePath } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_TRICKY,
  DIFF_UNREASONABLE,
  encodeDesc,
  MAX_NUMBER,
  type PathParams,
  puzzleOf,
  startEdges,
} from "./state.ts";

/** How many backbites per square shake the first path loose: past about
 * this, more changed nothing measurable. */
const BACKBITES = 20;

/** How many walls a board starts with, one a square in so many. */
const SQUARES_A_WALL = 8;

/**
 * A path through every square, picked at random: a snake along the rows,
 * then shaken by backbites. A backbite joins an end of the path to a square
 * beside it, which closes a loop, and breaks the loop just behind that
 * square, so the path still covers every square.
 */
function layLine(g: SquareEdges, rng: RandomState): number[] {
  const line: number[] = [];
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) line.push(y * g.w + (y % 2 ? g.w - 1 - x : x));
  const at = new Int32Array(g.cells);
  const place = (from: number, to: number): void => {
    for (let k = from; k < to; k++) at[line[k]] = k;
  };
  place(0, g.cells);
  for (let n = g.cells * BACKBITES; n > 0; n--) {
    if (randomBits(rng, 1)) {
      line.reverse();
      place(0, g.cells);
    }
    const e = g.around[line[0] * 4 + randomUpto(rng, 4)];
    if (e < 0) continue;
    const k = at[g.a[e] === line[0] ? g.b[e] : g.a[e]];
    if (k === 1) continue;
    // Reverse the squares before it, so that the end comes to sit beside it.
    const head = line.slice(0, k).reverse();
    line.splice(0, k, ...head);
    place(0, k);
  }
  return line;
}

/** The numbers of `line` with a number at each position in `marks`, from 1
 * at the first. */
function numbered(g: SquareEdges, line: readonly number[], marks: ReadonlySet<number>) {
  const ends = new Uint8Array(g.cells);
  let n = 0;
  line.forEach((i, k) => {
    if (marks.has(k)) ends[i] = ++n;
  });
  return ends;
}

/** The ladder run at `cap` on the board `line` and `marks` number, with these
 * walls, and the edges it decided. */
function attempt(
  p: PathParams,
  g: SquareEdges,
  line: readonly number[],
  marks: ReadonlySet<number>,
  walls: Uint8Array,
  cap: number,
): PathBoard {
  const puzzle = puzzleOf(p, numbered(g, line, marks), walls);
  const board = new PathBoard(puzzle, startEdges(puzzle));
  solvePath(board, cap);
  return board;
}

/** Number squares of `line` beside an edge of it the ladder leaves open,
 * one at a time, until the Easy rung finishes the board, or return `null`
 * where the numbers would pass {@link MAX_NUMBER}. */
function mend(
  p: PathParams,
  g: SquareEdges,
  line: readonly number[],
  walls: Uint8Array,
  rng: RandomState,
): Set<number> | null {
  const marks = new Set([0, line.length - 1]);
  // Each pass numbers one more square, and a board with every square
  // numbered is finished.
  const mark = retryLimit("path: one-path mend", g.cells);
  for (;;) {
    mark();
    const board = attempt(p, g, line, marks, walls, DIFF_EASY);
    if (!board.unfinished()) return marks;
    if (marks.size >= MAX_NUMBER) return null;
    const open: number[] = [];
    for (let k = 1; k < line.length - 1; k++) {
      if (marks.has(k)) continue;
      const before = edgeBetween(g, line[k - 1], line[k]);
      const after = edgeBetween(g, line[k], line[k + 1]);
      if (board.edges[before] === OPEN || board.edges[after] === OPEN) open.push(k);
    }
    // Only the edge between the two ends' squares can be left open with
    // nothing beside it to number.
    if (open.length === 0) return null;
    marks.add(open[randomUpto(rng, open.length)]);
  }
}

/** Whether the ladder at `cap` finishes the board `marks` number. */
const finishesAt =
  (
    p: PathParams,
    g: SquareEdges,
    line: readonly number[],
    walls: Uint8Array,
    cap: number,
  ) =>
  (marks: ReadonlySet<number>): boolean =>
    !attempt(p, g, line, marks, walls, cap).unfinished();

/** `marks` with every number taken away, in a random order, that `keeps`
 * still holds without. Taking one away only loosens which pieces may meet,
 * so one the board needs it still needs after others go, and one pass finds
 * them all. */
function strip(
  line: readonly number[],
  marks: ReadonlySet<number>,
  rng: RandomState,
  keeps: (marks: ReadonlySet<number>) => boolean,
): Set<number> {
  const out = new Set(marks);
  const inner = [...marks].filter((k) => k !== 0 && k !== line.length - 1);
  shuffle(inner, rng);
  for (const k of inner) {
    out.delete(k);
    if (!keeps(out)) out.add(k);
  }
  return out;
}

/** Walls on edges `line` does not take, at random, one a square in
 * {@link SQUARES_A_WALL}. A wall says only what the answer already does, so
 * the board keeps its one answer. */
function layWalls(
  g: SquareEdges,
  line: readonly number[],
  rng: RandomState,
): Uint8Array {
  const taken = new Set<number>();
  for (let k = 1; k < line.length; k++) taken.add(edgeBetween(g, line[k - 1], line[k]));
  const free = [...Array(g.edgeCount).keys()].filter((e) => !taken.has(e));
  shuffle(free, rng);
  const walls = new Uint8Array(g.edgeCount);
  for (const e of free.slice(0, Math.floor(g.cells / SQUARES_A_WALL))) walls[e] = 1;
  return walls;
}

/** `walls` less every one `keeps` still holds without. A wall gone only
 * loosens the board, as a number gone does, so one pass finds them all, and
 * the tier below still cannot finish it. */
function stripWalls(
  walls: Uint8Array,
  keeps: (walls: Uint8Array) => boolean,
): Uint8Array {
  const out = walls.slice();
  for (let e = 0; e < out.length; e++) {
    if (!out[e]) continue;
    out[e] = 0;
    if (!keeps(out)) out[e] = 1;
  }
  return out;
}

/** A Path board on its way to Unreasonable: the line, and the numbers and
 * walls a strip takes from. */
interface OnePathDeal {
  line: number[];
  marks: Set<number>;
  walls: Uint8Array;
}

/**
 * An Unreasonable Path board: an Easy board, stripped of every number and
 * wall the search still proves one answer without, and kept where the
 * ladder then stops short.
 */
function newOnePathUnreasonable(p: PathParams, rng: RandomState): { desc: string } {
  const g = squareEdges(p.w, p.h);
  const puzzle = (b: OnePathDeal) => puzzleOf(p, numbered(g, b.line, b.marks), b.walls);
  const dealt = dealUnreasonable<OnePathDeal>({
    label: "path: one-path Unreasonable",
    draw: () => {
      const line = layLine(g, rng);
      const walls = layWalls(g, line, rng);
      const marks = mend(p, g, line, walls, rng);
      if (marks === null) return null;
      return {
        line,
        walls,
        marks: strip(line, marks, rng, finishesAt(p, g, line, walls, DIFF_EASY)),
      };
    },
    strip: (b, one) => {
      b.marks = strip(b.line, b.marks, rng, (marks) => {
        const was = b.marks;
        b.marks = new Set(marks);
        const kept = one();
        b.marks = was;
        return kept;
      });
      b.walls = stripWalls(b.walls, (walls) => {
        const was = b.walls;
        b.walls = walls;
        const kept = one();
        b.walls = was;
        return kept;
      });
    },
    deduced: (b) => finishesAt(p, g, b.line, b.walls, DIFF_TRICKY)(b.marks),
    answer: (b, budget) => searchAnswer(puzzle(b), budget),
  });
  return { desc: encodeDesc(numbered(g, dealt.line, dealt.marks), dealt.walls) };
}

/**
 * A Path board at exactly tier `p.diff`. The numbers are mended until the
 * Easy rung finishes the board, stripped at Easy, then stripped at the tier
 * asked for, where a strip that takes none leaves the board too easy. Unlike
 * Pairs', the strip skips the tiers between: at Tricky a strip at Normal
 * first made a 6x6 board take a median 3.3 s to find against 0.2 s, and a
 * 7x7 1.1 s against 0.5 s, with as many numbers kept (2026-10-23).
 */
export function newOnePathDesc(p: PathParams, rng: RandomState): { desc: string } {
  if (p.diff === DIFF_UNREASONABLE) return newOnePathUnreasonable(p, rng);
  const g = squareEdges(p.w, p.h);
  const next = retryLimit("path: one-path generation");
  for (;;) {
    next();
    const line = layLine(g, rng);
    let walls = layWalls(g, line, rng);
    let marks = mend(p, g, line, walls, rng);
    if (marks === null) continue;
    marks = strip(line, marks, rng, finishesAt(p, g, line, walls, DIFF_EASY));
    if (p.diff > DIFF_EASY) {
      const easy = marks.size;
      marks = strip(line, marks, rng, finishesAt(p, g, line, walls, p.diff));
      if (marks.size === easy) continue;
    }
    const kept = marks;
    walls = stripWalls(walls, (w) => finishesAt(p, g, line, w, p.diff)(kept));
    const ends = numbered(g, line, marks);
    const capped: CappedSolve = (cap) =>
      attempt(p, g, line, marks, walls, cap).unfinished() ? "unsolved" : "solved";
    if (solvableAtExactlyTier(capped, p.diff)) return { desc: encodeDesc(ends, walls) };
  }
}
