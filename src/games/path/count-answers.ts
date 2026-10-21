/**
 * How many answers a Path board has, by brute force: the tests' second
 * opinion on the ladder, and nothing else's. It shares no code with
 * `solver.ts`, only the rules, so a ladder that finishes a board with two
 * answers, or none, disagrees with it.
 *
 * Squares are decided in reading order, each choosing whether a line leaves
 * it to the right and downward once its own left and upper edges are known,
 * so every square's lines are fixed when it is passed. A union-find that can
 * be rolled back refuses a line that would close a loop or join two different
 * numbers.
 */

import { NO_END } from "./state.ts";

export function countAnswers(
  w: number,
  h: number,
  ends: Uint8Array,
  limit = 2,
): number {
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
      if (right && x === w - 1) continue;
      for (const down of [0, 1]) {
        if (down && y === h - 1) continue;
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
