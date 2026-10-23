/**
 * How many answers a board has, by brute force: the tests' second opinion on
 * the ladder, and nothing else's. It shares no code with `solver.ts`, only
 * the rules, so a ladder that finishes a board with two answers, or none,
 * disagrees with it.
 *
 * A Pairs board's squares are decided in reading order, each choosing whether
 * a line leaves it to the right and downward once its own left and upper
 * edges are known, so every square's lines are fixed when it is passed. A
 * union-find that can be rolled back refuses a line that would close a loop
 * or join two different numbers.
 *
 * A Path board's answer is one walk from the 1 through every square, so it is
 * counted as one: step by step from the 1, never onto a square already
 * walked, a wall, or a number other than the next one due.
 */

import { DOWN, RIGHT, squareEdges } from "../../engine/square-edges.ts";
import { MODE_PATH, NO_END, type PathPuzzle } from "./state.ts";

export function countAnswers(puzzle: PathPuzzle, limit = 2): number {
  return puzzle.mode === MODE_PATH ? countZip(puzzle, limit) : countPath(puzzle, limit);
}

function countPath(puzzle: PathPuzzle, limit: number): number {
  const { w, h, ends, walls } = puzzle;
  const g = squareEdges(w, h);
  const n = w * h;
  const parent = Int32Array.from({ length: n }, (_, i) => i);
  const size = new Int32Array(n).fill(1);
  const number = Int32Array.from(ends);
  const undo: { child: number; root: number; number: number }[] = [];
  const find = (i: number): number => {
    while (parent[i] !== i) i = parent[i];
    return i;
  };
  /** Join `i` and `j`, or say the line between them breaks a rule. */
  const link = (i: number, j: number): boolean => {
    let [x, y] = [find(i), find(j)];
    if (x === y) return false;
    if (number[x] !== NO_END && number[y] !== NO_END && number[x] !== number[y])
      return false;
    if (size[x] > size[y]) [x, y] = [y, x];
    undo.push({ child: x, root: y, number: number[y] });
    parent[x] = y;
    size[y] += size[x];
    if (number[y] === NO_END) number[y] = number[x];
    return true;
  };
  const rollback = (to: number): void => {
    while (undo.length > to) {
      const { child, root, number: was } = undo.pop() as (typeof undo)[number];
      parent[child] = child;
      size[root] -= size[child];
      number[root] = was;
    }
  };
  const open = (i: number, d: number): boolean => !walls[g.around[i * 4 + d]];
  // Whether the edge into each square from the left, and from above, is a
  // line.
  const fromLeft = new Uint8Array(n);
  const fromAbove = new Uint8Array(n);
  let found = 0;
  const visit = (i: number): void => {
    if (found >= limit) return;
    if (i === n) {
      found++;
      return;
    }
    const x = i % w;
    const y = (i - x) / w;
    const need = (ends[i] === NO_END ? 2 : 1) - fromLeft[i] - fromAbove[i];
    for (const right of [0, 1]) {
      if (right && (x === w - 1 || !open(i, RIGHT))) continue;
      for (const down of [0, 1]) {
        if (down && (y === h - 1 || !open(i, DOWN))) continue;
        if (right + down !== need) continue;
        const mark = undo.length;
        if ((!right || link(i, i + 1)) && (!down || link(i, i + w))) {
          if (right) fromLeft[i + 1] = 1;
          if (down) fromAbove[i + w] = 1;
          visit(i + 1);
          if (right) fromLeft[i + 1] = 0;
          if (down) fromAbove[i + w] = 0;
        }
        rollback(mark);
      }
    }
  };
  visit(0);
  return found;
}

function countZip(puzzle: PathPuzzle, limit: number): number {
  const { w, h, ends, walls } = puzzle;
  const g = squareEdges(w, h);
  const last = Math.max(...ends);
  const walked = new Uint8Array(g.cells);
  let found = 0;
  const walk = (i: number, steps: number, due: number): void => {
    if (found >= limit) return;
    if (steps === g.cells) {
      if (ends[i] === last) found++;
      return;
    }
    for (let d = 0; d < 4; d++) {
      const e = g.around[i * 4 + d];
      if (e < 0 || walls[e]) continue;
      const j = g.a[e] === i ? g.b[e] : g.a[e];
      if (walked[j] || (ends[j] !== NO_END && ends[j] !== due)) continue;
      walked[j] = 1;
      walk(j, steps + 1, ends[j] === due ? due + 1 : due);
      walked[j] = 0;
    }
  };
  const start = ends.indexOf(1);
  walked[start] = 1;
  walk(start, 1, 2);
  return found;
}
