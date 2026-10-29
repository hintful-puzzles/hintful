/**
 * A11: Symmetry Area and Filling, by enumerating every answer of small boards.
 *
 * 1. The rewrite `test.md` allows: Symmetry Area written with walls (corpus 44)
 *    and with a number in every cell, as Filling writes it, must have the same
 *    answers, translated by num(c) = the size of c's region.
 * 2. Written as numbers, Symmetry Area's rules are Filling's with `symmetric`
 *    added, so Filling's techniques are kept (entailment, read off the two
 *    descriptions).
 * 3. Symmetry Area's `straightThree` is checked against both games' answers.
 *
 * Clues are left out on both sides: a clue only removes answers, and each side
 * is compared over all of its answers. Cells are indices in reading order, and
 * an edge is its two cells' indices, lower first.
 */
import { it } from "vitest";
import { fixed, pad, type ResultRow, say, show, tup, writeResults } from "./pzl.ts";

const results = new Map<string, ResultRow[]>();

function record(
  label: string,
  verdict: string,
  seconds: number,
  witness: string | null = null,
): void {
  say(
    `A11  ${pad(label, 58)} ${pad(verdict, 28)} ${fixed(seconds, 7)}s` +
      (witness ? `   at ${witness}` : ""),
  );
  const rows = results.get("A11") ?? [];
  rows.push({
    check: label,
    verdict,
    seconds: Math.round(seconds * 10) / 10,
    binding: witness,
  });
  results.set("A11", rows);
}

const now = () => performance.now() / 1000;

interface Board {
  w: number;
  h: number;
  n: number;
  adj: number[][];
  edges: [number, number][];
}

function grid(w: number, h: number): Board {
  const n = w * h;
  const adj: number[][] = [];
  for (let i = 0; i < n; i++) {
    const x = i % w;
    const y = Math.trunc(i / w);
    adj.push(
      [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]
        .filter(([a, b]) => a >= 0 && a < w && b >= 0 && b < h)
        .map(([a, b]) => b * w + a),
    );
  }
  // In the order of the (x, y) pairs, as the edges of cells (x, y) sort.
  const byXY = (p: number, q: number) =>
    (p % w) - (q % w) || Math.trunc(p / w) - Math.trunc(q / w);
  const edges: [number, number][] = [];
  for (let a = 0; a < n; a++)
    for (const b of adj[a]) if (byXY(a, b) < 0) edges.push([a, b]);
  edges.sort((e, f) => byXY(e[0], f[0]) || byXY(e[1], f[1]));
  return { w, h, n, adj, edges };
}

function showCell(b: Board, i: number): string {
  return show(tup(i % b.w, Math.trunc(i / b.w)));
}

/** The components of the board under `same`, each as its cells. */
function components(b: Board, same: (x: number, y: number) => boolean): number[][] {
  const seen = new Uint8Array(b.n);
  const out: number[][] = [];
  for (let c = 0; c < b.n; c++) {
    if (seen[c]) continue;
    const comp = [c];
    const todo = [c];
    seen[c] = 1;
    while (todo.length > 0) {
      const x = todo.pop() as number;
      for (const y of b.adj[x])
        if (!seen[y] && same(x, y)) {
          seen[y] = 1;
          comp.push(y);
          todo.push(y);
        }
    }
    out.push(comp);
  }
  return out;
}

/** Its own image under a half turn about its center. */
function symmetric(b: Board, region: number[]): boolean {
  const xs = region.map((c) => c % b.w);
  const ys = region.map((c) => Math.trunc(c / b.w));
  const sx = Math.min(...xs) + Math.max(...xs);
  const sy = Math.min(...ys) + Math.max(...ys);
  const set = new Set(region);
  return region.every((_, i) => {
    const x = sx - xs[i];
    const y = sy - ys[i];
    return x >= 0 && x < b.w && y >= 0 && y < b.h && set.has(y * b.w + x);
  });
}

/** Corpus 44's writing: a set of walls; a wall only between regions of
 * different sizes; every region symmetric. Each answer is its walls' indices
 * into `edges`, joined. */
function wallsAnswers(b: Board): Set<string> {
  const out = new Set<string>();
  const m = b.edges.length;
  for (let bits = 0; bits < 2 ** m; bits++) {
    const wall = new Set<string>();
    const ids: number[] = [];
    b.edges.forEach(([p, q], i) => {
      // the first edge is the most significant bit, as Python's product runs
      if (bits & (1 << (m - 1 - i))) {
        wall.add(`${p},${q}`);
        ids.push(i);
      }
    });
    const walled = (x: number, y: number) =>
      wall.has(x < y ? `${x},${y}` : `${y},${x}`);
    const regs = components(b, (x, y) => !walled(x, y));
    const of = new Map<number, number[]>();
    for (const r of regs) for (const c of r) of.set(c, r);
    const sizeOf = (c: number) => of.get(c)?.length ?? 0;
    if (ids.some((i) => sizeOf(b.edges[i][0]) === sizeOf(b.edges[i][1]))) continue;
    if (regs.every((r) => symmetric(b, r))) out.add(ids.join(","));
  }
  return out;
}

/** Filling's writing (collection): a number in every cell, each the size of
 * its connected same-number area; with `withSymmetry`, Symmetry Area's rule
 * added, every area symmetric. In the order Python's product enumerates. */
function numberAnswers(b: Board, withSymmetry: boolean): number[][] {
  const out: number[][] = [];
  const num = new Array<number>(b.n).fill(1);
  for (;;) {
    const regs = components(b, (x, y) => num[x] === num[y]);
    if (
      regs.every((r) => r.length === num[r[0]]) &&
      (!withSymmetry || regs.every((r) => symmetric(b, r)))
    )
      out.push([...num]);
    // the last cell counts fastest
    let i = b.n - 1;
    while (i >= 0 && num[i] === b.n) num[i--] = 1;
    if (i < 0) return out;
    num[i]++;
  }
}

/** straightThree: two neighboring 3s make a 3 at a right angle to them
 * impossible. Sound when no answer has such an L of 3s. Marks show only true
 * values, so the answer holding the premise is the worst case. */
function straightThree(b: Board, answers: number[][]): string | null {
  const dir = (p: number, q: number) => [
    (q % b.w) - (p % b.w),
    Math.trunc(q / b.w) - Math.trunc(p / b.w),
  ];
  for (const num of answers)
    for (let a = 0; a < b.n; a++)
      for (const m of b.adj[a])
        for (const c of b.adj[m])
          if (c !== a) {
            const [d1x, d1y] = dir(a, m);
            const [d2x, d2y] = dir(m, c);
            if (
              (d2x !== d1x || d2y !== d1y) &&
              num[a] === 3 &&
              num[m] === 3 &&
              num[c] === 3
            )
              return `(${showCell(b, a)}, ${showCell(b, m)}, ${showCell(b, c)})`;
          }
  return null;
}

it("symarea", () => {
  for (const [w, h] of [
    [2, 3],
    [2, 4],
  ]) {
    const tag = `${w}x${h}`;
    const b = grid(w, h);
    let t0 = now();
    const walls = wallsAnswers(b);
    const sym = numberAnswers(b, true);
    const translated = new Set(
      sym.map((num) =>
        b.edges
          .map((e, i) => [e, i] as const)
          .filter(([[p, q]]) => num[p] !== num[q])
          .map(([, i]) => i)
          .join(","),
      ),
    );
    const same =
      translated.size === walls.size &&
      [...translated].every((t) => walls.has(t)) &&
      translated.size === sym.length;
    record(
      `the two writings of Symmetry Area ${tag} [${walls.size} answers]`,
      same ? "same answers" : "DIFFERENT",
      now() - t0,
    );
    t0 = now();
    const fill = numberAnswers(b, false);
    const fillKeys = new Set(fill.map((f) => f.join(",")));
    record(
      `Filling's rules hold of Symmetry Area's answers ${tag}`,
      sym.every((s) => fillKeys.has(s.join(","))) ? "entails" : "not",
      now() - t0,
    );
    t0 = now();
    let hit = straightThree(b, sym);
    record(
      `Symmetry Area's straightThree in Symmetry Area ${tag}`,
      hit ? "unsound" : "sound",
      now() - t0,
      hit,
    );
    t0 = now();
    hit = straightThree(b, fill);
    record(
      `Symmetry Area's straightThree in Filling ${tag} [${fill.length} answers]`,
      hit ? "unsound" : "sound",
      now() - t0,
      hit,
    );
  }
  writeResults("results-a.txt", results);
});
