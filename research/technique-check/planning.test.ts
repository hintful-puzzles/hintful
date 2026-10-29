/**
 * The planning pairs of the test (`test.md` § "The computed cut", a planning
 * freedom), checked by exhaustive search of every position of small boards.
 *
 * A prune claims no plan reaches the finish from a position its premise holds
 * of: it is sound when every such position is unsolvable. A macro claims an
 * effect: it is sound when the effect holds wherever it applies. Both are
 * checked on every position reachable from every deal of the board.
 *
 * `PAIRS="A9 D1 D2 C15 C23"` runs those (all by default). Writes
 * `results-planning.txt`.
 *
 * A position is a number or a string that is its own key, so the searches
 * over a million positions keep them in plain sets. A set of cells is a
 * bitmask over the cells in reading order.
 */
import { it } from "vitest";
import {
  fixed,
  pad,
  pairsToRun,
  type ResultRow,
  say,
  show,
  tup,
  writeResults,
} from "./pzl.ts";

const results = new Map<string, ResultRow[]>();

function record(
  pair: string,
  label: string,
  verdict: string,
  seconds: number,
  witness: string | null = null,
): void {
  say(
    `${pad(pair, 4)} ${pad(label, 58)} ${pad(verdict, 28)} ${fixed(seconds, 7)}s` +
      (witness !== null ? `   at ${witness}` : ""),
  );
  const rows = results.get(pair) ?? [];
  rows.push({
    check: label,
    verdict,
    seconds: Math.round(seconds * 10) / 10,
    binding: witness,
  });
  results.set(pair, rows);
}

const now = () => performance.now() / 1000;

/** Every position reachable from `starts`. */
function reachable<P>(starts: Iterable<P>, moves: (p: P) => P[]): Set<P> {
  const seen = new Set(starts);
  const todo = [...seen];
  while (todo.length > 0) {
    const p = todo.pop() as P;
    for (const q of moves(p))
      if (!seen.has(q)) {
        seen.add(q);
        todo.push(q);
      }
  }
  return seen;
}

/** Whether a position can reach the finish, for every position reachable
 * from `starts`: a least fixed point backward from the finished positions,
 * which is exact whether or not moves can be undone (ball sort's can). */
class Solver<P> {
  readonly positions: Set<P>;
  readonly good: Set<P>;

  constructor(starts: Iterable<P>, moves: (p: P) => P[], finish: (p: P) => boolean) {
    this.positions = reachable(starts, moves);
    const back = new Map<P, P[]>();
    for (const p of this.positions)
      for (const q of moves(p)) {
        const from = back.get(q);
        if (from === undefined) back.set(q, [p]);
        else from.push(p);
      }
    const good = new Set([...this.positions].filter(finish));
    const todo = [...good];
    while (todo.length > 0) {
      const q = todo.pop() as P;
      for (const p of back.get(q) ?? [])
        if (!good.has(p)) {
          good.add(p);
          todo.push(p);
        }
    }
    this.good = good;
  }

  solvable(p: P): boolean {
    return this.good.has(p);
  }
}

/** A prune is sound when no position its premise holds of is solvable. */
function checkPrune<P>(
  pair: string,
  label: string,
  positions: Set<P>,
  premise: (p: P) => boolean,
  solver: Solver<P>,
  showP: (p: P) => string,
): string {
  const t0 = now();
  let n = 0;
  let fired = 0;
  for (const p of positions) {
    n++;
    if (premise(p)) {
      fired++;
      if (solver.solvable(p)) {
        record(pair, label, "unsound", now() - t0, showP(p));
        return "unsound";
      }
    }
  }
  const verdict = fired ? "sound" : "sound (never fires)";
  record(pair, `${label} [${fired}/${n} positions]`, verdict, now() - t0);
  return verdict;
}

// ------------------------------------------------------- Neko and Hiroimono

type Dir = readonly [number, number];
const DIRS: readonly Dir[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
/** The index in DIRS of each direction's reverse. */
const OPP = [1, 0, 3, 2];

/** A board's cells in reading order, as coordinates by index. */
class Board {
  readonly n: number;
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.n = w * h;
  }
  x(i: number): number {
    return i % this.w;
  }
  y(i: number): number {
    return Math.trunc(i / this.w);
  }
  show(i: number): string {
    return show(tup(this.x(i), this.y(i)));
  }
  showSet(mask: number): string {
    const out: string[] = [];
    for (let i = 0; i < this.n; i++) if (mask & (1 << i)) out.push(this.show(i));
    return out.length > 0 ? `frozenset({${out.join(", ")}})` : "frozenset()";
  }
  /** The first of `items` from c in direction d, or -1. */
  firstIn(c: number, d: Dir, items: number): number {
    let x = this.x(c);
    let y = this.y(c);
    for (;;) {
      x += d[0];
      y += d[1];
      if (!(x >= 0 && x < this.w && y >= 0 && y < this.h)) return -1;
      const i = y * this.w + x;
      if (items & (1 << i)) return i;
    }
  }
  sharesLine(a: number, b: number): boolean {
    return a !== b && (this.x(a) === this.x(b) || this.y(a) === this.y(b));
  }
}

function* bits(mask: number, n: number): Generator<number> {
  for (let i = 0; i < n; i++) if (mask & (1 << i)) yield i;
}

/** Neko (corpus 102): the cat jumps to the first fruit in a direction and
 * eats it; finished when no fruit is left. A position is the cat's cell and
 * the fruits, `cat * 2^n + fruits`. */
function neko(b: Board) {
  const N = 2 ** b.n;
  const cat = (p: number) => Math.trunc(p / N);
  const fruit = (p: number) => p % N;
  const moves = (p: number): number[] => {
    const out: number[] = [];
    for (const d of DIRS) {
      const f = b.firstIn(cat(p), d, fruit(p));
      if (f >= 0) out.push(f * N + (fruit(p) & ~(1 << f)));
    }
    return out;
  };
  const starts: number[] = [];
  for (let c = 0; c < b.n; c++)
    for (let F = 0; F < N; F++) if (!(F & (1 << c))) starts.push(c * N + F);
  const showP = (p: number) => `(${b.show(cat(p))}, ${b.showSet(fruit(p))})`;
  return { starts, moves, finish: (p: number) => fruit(p) === 0, cat, fruit, showP };
}

/** Hiroimono (corpus 38), written as moves (the rewrite `test.md` allows): the
 * first move picks any stone; each later move goes to the first stone in a
 * direction that does not reverse the last. A position is the current stone
 * (-1 before the first move), the stones left and the last direction (-1 for
 * none), `((cur + 1) * 5 + last + 1) * 2^n + stones`. */
function hiroimono(b: Board) {
  const N = 2 ** b.n;
  const enc = (cur: number, stones: number, last: number) =>
    ((cur + 1) * 5 + last + 1) * N + stones;
  const stones = (p: number) => p % N;
  const cur = (p: number) => Math.trunc(Math.trunc(p / N) / 5) - 1;
  const last = (p: number) => (Math.trunc(p / N) % 5) - 1;
  const moves = (p: number): number[] => {
    const S = stones(p);
    if (cur(p) < 0) return [...bits(S, b.n)].map((s) => enc(s, S & ~(1 << s), -1));
    const out: number[] = [];
    for (let d = 0; d < 4; d++) {
      if (last(p) >= 0 && d === OPP[last(p)]) continue;
      const s = b.firstIn(cur(p), DIRS[d], S);
      if (s >= 0) out.push(enc(s, S & ~(1 << s), d));
    }
    return out;
  };
  const starts: number[] = [];
  for (let S = 1; S < N; S++) starts.push(enc(-1, S, -1));
  const showP = (p: number) =>
    `(${cur(p) < 0 ? "None" : b.show(cur(p))}, ${b.showSet(stones(p))}, ${last(p) < 0 ? "None" : show(tup(...DIRS[last(p)]))})`;
  return {
    starts,
    moves,
    finish: (p: number) => cur(p) >= 0 && stones(p) === 0,
    cur,
    stones,
    last,
    showP,
  };
}

/** For the cat's cell k and a fruit f: nothing else of the fruits, nor k, in
 * f's row or column. */
function nekoIsolated(b: Board, cat: number, fruit: number): boolean {
  if (cat < 0) return false;
  for (const f of bits(fruit, b.n)) {
    let alone = !b.sharesLine(f, cat);
    for (const g of bits(fruit, b.n)) if (g !== f && b.sharesLine(f, g)) alone = false;
    if (alone) return true;
  }
  return false;
}

/** For the cat's cell k: no fruit in k's row or column, and a fruit left. */
function nekoStuck(b: Board, cat: number, fruit: number): boolean {
  return (
    cat >= 0 && fruit !== 0 && ![...bits(fruit, b.n)].some((f) => b.sharesLine(cat, f))
  );
}

/** The current stone has stones only behind it, in the reverse of the last
 * direction, and stones are left. */
function hiroNoReverse(b: Board, cur: number, stones: number, last: number): boolean {
  if (cur < 0 || last < 0 || stones === 0) return false;
  const cx = b.x(cur);
  const cy = b.y(cur);
  return DIRS.every(
    (d, i) =>
      i === OPP[last] ||
      ![...bits(stones, b.n)].some((s) => {
        const dx = b.x(s) - cx;
        const dy = b.y(s) - cy;
        return (dx === 0 && dy * d[1] > 0) || (dy === 0 && dx * d[0] > 0);
      }),
  );
}

function runA9(): void {
  for (const [w, h] of [
    [3, 3],
    [4, 3],
    [4, 4],
  ]) {
    const tag = `${w}x${h}`;
    const b = new Board(w, h);
    const nk = neko(b);
    const hr = hiroimono(b);
    const nSolv = new Solver(nk.starts, nk.moves, nk.finish);
    const hSolv = new Solver(hr.starts, hr.moves, hr.finish);
    const nPos = nSolv.positions;
    const hPos = hSolv.positions;
    checkPrune(
      "A9",
      `Neko's isolated in Neko ${tag}`,
      nPos,
      (p) => nekoIsolated(b, nk.cat(p), nk.fruit(p)),
      nSolv,
      nk.showP,
    );
    checkPrune(
      "A9",
      `Neko's stuck in Neko ${tag}`,
      nPos,
      (p) => nekoStuck(b, nk.cat(p), nk.fruit(p)),
      nSolv,
      nk.showP,
    );
    // Neko's prunes read the cat: in Hiroimono's writing, its current stone.
    checkPrune(
      "A9",
      `Neko's isolated in Hiroimono ${tag}`,
      hPos,
      (p) => nekoIsolated(b, hr.cur(p), hr.stones(p)),
      hSolv,
      hr.showP,
    );
    checkPrune(
      "A9",
      `Neko's stuck in Hiroimono ${tag}`,
      hPos,
      (p) => nekoStuck(b, hr.cur(p), hr.stones(p)),
      hSolv,
      hr.showP,
    );
    checkPrune(
      "A9",
      `Hiroimono's noReverse in Hiroimono ${tag}`,
      hPos,
      (p) => hiroNoReverse(b, hr.cur(p), hr.stones(p), hr.last(p)),
      hSolv,
      hr.showP,
    );
  }
  record(
    "A9",
    "Hiroimono's noReverse in Neko",
    "not expressible",
    0.0,
    "Neko's position has no last direction",
  );
}

// ------------------------------------------------------------------ ball sort

/** A ball sort position: each tube bottom to top, and whether the added tube
 * is still to come. */
interface Sort {
  tubes: number[][];
  spare: number;
}

const sortKey = (p: Sort) => `${p.tubes.map((t) => t.join("")).join("|")};${p.spare}`;

function sortOf(key: string): Sort {
  const [tubes, spare] = key.split(";");
  return {
    tubes: tubes.split("|").map((t) => [...t].map(Number)),
    spare: Number(spare),
  };
}

const showSort = (key: string) => {
  const p = sortOf(key);
  return `((${p.tubes.map((t) => show(tup(...t))).join(", ")}), ${p.spare})`;
};

/** Every distinct ordering of the balls. */
function permutations(balls: number[]): number[][] {
  if (balls.length === 0) return [[]];
  const out: number[][] = [];
  for (const c of [...new Set(balls)]) {
    const rest = [...balls];
    rest.splice(rest.indexOf(c), 1);
    for (const p of permutations(rest)) out.push([c, ...p]);
  }
  return out;
}

/** Ball sort (corpus 108): pour the top ball onto an empty tube or a same
 * colored top with room; finished when every tube is empty or full of one
 * color. With `tube`, the owner's added tube: one more empty tube, once. A
 * position is its key, `sortKey`. */
function ballsort(k: number, h: number, e: number, tube: boolean) {
  const moves = (key: string): string[] => {
    const { tubes, spare } = sortOf(key);
    const out: string[] = [];
    tubes.forEach((ta, a) => {
      if (ta.length === 0) return;
      tubes.forEach((tb, b) => {
        if (
          a !== b &&
          tb.length < h &&
          (tb.length === 0 || tb[tb.length - 1] === ta[ta.length - 1])
        ) {
          const nt = [...tubes];
          nt[a] = ta.slice(0, -1);
          nt[b] = [...tb, ta[ta.length - 1]];
          out.push(sortKey({ tubes: nt, spare }));
        }
      });
    });
    if (spare) out.push(sortKey({ tubes: [...tubes, []], spare: 0 }));
    return out;
  };
  const finish = (key: string) =>
    sortOf(key).tubes.every(
      (t) => t.length === 0 || (t.length === h && new Set(t).size === 1),
    );
  const balls: number[] = [];
  for (let c = 0; c < k; c++) for (let i = 0; i < h; i++) balls.push(c);
  const starts = new Set<string>();
  for (const perm of permutations(balls)) {
    const tubes: number[][] = [];
    for (let i = 0; i < k; i++) tubes.push(perm.slice(i * h, (i + 1) * h));
    for (let i = 0; i < e; i++) tubes.push([]);
    starts.add(sortKey({ tubes, spare: tube ? 1 : 0 }));
  }
  return { starts, moves, finish };
}

function pours(p: Sort, h: number): boolean {
  return p.tubes.some((ta, a) =>
    p.tubes.some(
      (tb, b) =>
        ta.length > 0 &&
        b !== a &&
        tb.length < h &&
        (tb.length === 0 || tb[tb.length - 1] === ta[ta.length - 1]),
    ),
  );
}

function runD1(): void {
  for (const [k, h] of [
    [2, 2],
    [2, 3],
    [3, 2],
    [3, 3],
  ]) {
    const tag = `${k} colors, ${h} high, 1 empty`;
    for (const tube of [false, true]) {
      const name = tube ? "ball sort with the tube" : "ball sort";
      const { starts, moves: mv, finish: fin } = ballsort(k, h, 1, tube);
      const solv = new Solver(starts, mv, fin);
      const pos = solv.positions;
      checkPrune(
        "D1",
        `ball sort's noPour in ${name}, ${tag}`,
        pos,
        (p) => !fin(p) && !pours(sortOf(p), h),
        solv,
        showSort,
      );
      const t0 = now();
      let bad: string | null = null;
      for (const key of pos) {
        const { tubes } = sortOf(key);
        tubes.forEach((ta, a) => {
          if (ta.length === 0) return;
          const top = ta[ta.length - 1];
          let n = 0;
          while (n < ta.length && ta[ta.length - 1 - n] === top) n++;
          tubes.forEach((tb, b) => {
            if (
              a !== b &&
              tb.length > 0 &&
              tb[tb.length - 1] === top &&
              h - tb.length >= n
            ) {
              let q = key;
              for (let i = 0; i < n; i++) {
                const qs = sortOf(q);
                const nxt = mv(q).filter((r) => {
                  const rs = sortOf(r);
                  return (
                    rs.spare === qs.spare &&
                    rs.tubes[b].length === qs.tubes[b].length + 1 &&
                    rs.tubes[a].length === qs.tubes[a].length - 1
                  );
                });
                if (nxt.length === 0) {
                  bad = key;
                  break;
                }
                q = nxt[0];
              }
              const end = sortOf(q);
              if (
                bad === null &&
                (end.tubes[b].slice(-n).join() !== ta.slice(-n).join() ||
                  end.tubes[a].join() !== ta.slice(0, -n).join())
              )
                bad = key;
            }
          });
        });
        if (bad !== null) break;
      }
      record(
        "D1",
        `ball sort's pourRun in ${name}, ${tag}`,
        bad !== null ? "unsound" : "sound",
        now() - t0,
        bad !== null ? showSort(bad) : null,
      );
    }
  }
  record(
    "D1",
    "the tube's addTube in plain ball sort",
    "not expressible",
    0.0,
    "plain ball sort has no such move",
  );
}

// ------------------------------------------------------------- knight's tour

const KNIGHT: readonly Dir[] = [
  [1, 2],
  [2, 1],
].flatMap(([a, b]) => [
  [a, b],
  [a, -b],
  [-a, b],
  [-a, -b],
]) as Dir[];

/** A tour position: where it started, the knight's cell and the cells seen,
 * `(start * n + k) * 2^n + seen`. */
function knights(b: Board, closed: boolean) {
  const N = 2 ** b.n;
  const adj: number[][] = [];
  for (let c = 0; c < b.n; c++)
    adj.push(
      KNIGHT.filter(([dx, dy]) => {
        const x = b.x(c) + dx;
        const y = b.y(c) + dy;
        return x >= 0 && x < b.w && y >= 0 && y < b.h;
      }).map(([dx, dy]) => (b.y(c) + dy) * b.w + b.x(c) + dx),
    );
  const start = (p: number) => Math.trunc(Math.trunc(p / N) / b.n);
  const at = (p: number) => Math.trunc(p / N) % b.n;
  const seen = (p: number) => p % N;
  const full = N - 1;
  const moves = (p: number): number[] =>
    adj[at(p)]
      .filter((m) => !(seen(p) & (1 << m)))
      .map((m) => (start(p) * b.n + m) * N + (seen(p) | (1 << m)));
  const finish = (p: number) =>
    seen(p) === full && (!closed || adj[at(p)].includes(start(p)));
  const starts: number[] = [];
  for (let c = 0; c < b.n; c++) starts.push((c * b.n + c) * N + (1 << c));
  const showP = (p: number) =>
    `(${b.show(start(p))}, ${b.show(at(p))}, ${b.showSet(seen(p))})`;
  return { starts, moves, finish, adj, start, at, seen, full, showP };
}

function runD2(): void {
  for (const [w, h] of [
    [3, 4],
    [3, 5],
  ]) {
    const tag = `${w}x${h}`;
    const b = new Board(w, h);
    const tours = new Map<
      boolean,
      { solv: Solver<number>; kn: ReturnType<typeof knights> }
    >();
    for (const closed of [false, true]) {
      const kn = knights(b, closed);
      tours.set(closed, { solv: new Solver(kn.starts, kn.moves, kn.finish), kn });
    }
    for (const closed of [false, true]) {
      const tour = tours.get(closed);
      if (tour === undefined) throw new Error("no tour");
      const { solv, kn } = tour;
      const name = closed ? "the closed tour" : "Knight's Tour";
      const deadEnds = (p: number) => {
        const seen = kn.seen(p);
        let lone = 0;
        for (let u = 0; u < b.n; u++)
          if (
            !(seen & (1 << u)) &&
            !kn.adj[u].some((v) => !(seen & (1 << v))) &&
            !kn.adj[kn.at(p)].includes(u)
          )
            lone++;
        return lone >= 2;
      };
      const noReturn = (p: number) =>
        kn.seen(p) !== kn.full &&
        !kn.adj[kn.start(p)].some((v) => !(kn.seen(p) & (1 << v)));
      checkPrune(
        "D2",
        `Knight's Tour's deadEnds in ${name} ${tag}`,
        solv.positions,
        deadEnds,
        solv,
        kn.showP,
      );
      checkPrune(
        "D2",
        `the closed tour's noReturn in ${name} ${tag}`,
        solv.positions,
        noReturn,
        solv,
        kn.showP,
      );
    }
    const closedTour = tours.get(true);
    if (closedTour === undefined) throw new Error("no closed tour");
    const { solv, kn } = closedTour;
    const solvableClosed = [...solv.positions].filter(
      (p) => kn.seen(p) === 1 << kn.start(p) && solv.solvable(p),
    ).length;
    record(
      "D2",
      `closed tours exist on ${tag}`,
      solvableClosed ? "yes" : "no: closed checks are vacuous",
      0.0,
    );
  }
  record(
    "D2",
    "Knight's Tour's prunes in the closed tour, by entailment",
    "kept",
    0.0,
    "the same moves, and the closed finish implies the open one",
  );
}

// ------------------------------------------------------------------- Twiddle

/** A move as the cell each content goes to, and the quarter turns it gains,
 * both by cell index. */
type Move = readonly [readonly number[], readonly number[]];

/** Each block's quarter turn, anticlockwise and clockwise. The code's
 * convention: p[k] receives p[k+1] for the cells listed clockwise. */
function twiddleMoves(w: number, h: number, n: number): Move[] {
  const idx = (x: number, y: number) => y * w + x;
  const gens: Move[] = [];
  for (let by = 0; by <= h - n; by++)
    for (let bx = 0; bx <= w - n; bx++) {
      const perm = Array.from({ length: w * h }, (_, i) => i);
      const turn = Array.from({ length: w * h }, () => 0);
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          // anticlockwise quarter turn of the block: (x, y) -> (y, n-1-x)
          const src = idx(bx + x, by + y);
          perm[src] = idx(bx + y, by + n - 1 - x);
          turn[src] = 1;
        }
      gens.push([perm, turn]);
    }
  const out: Move[] = [];
  for (const [perm, turn] of gens) {
    const inv = Array.from({ length: perm.length }, () => 0);
    perm.forEach((v, k) => {
      inv[v] = k;
    });
    out.push([perm, turn]);
    out.push([inv, turn.map((t) => ((-t % 4) + 4) % 4)]);
  }
  return out;
}

/** The effect of moves in order: where each cell's content ends, and its net
 * quarter turns. */
function compose(seq: readonly Move[], size: number): [number[], number[]] {
  const where = Array.from({ length: size }, (_, i) => i);
  const turns = Array.from({ length: size }, () => 0);
  for (const [perm, turn] of seq)
    for (let c = 0; c < size; c++) {
      const at = where[c];
      turns[c] = (turns[c] + turn[at]) % 4;
      where[c] = perm[at];
    }
  return [where, turns];
}

function runC15(): void {
  const w = 3;
  const h = 3;
  const n = 2;
  const size = w * h;
  const mv = twiddleMoves(w, h, n);
  const single = mv.map((_, i) => i);
  const inverse = (i: number) => i ^ 1;
  const blocks = mv.length / 2;
  const powers = (b: number) => [[2 * b], [2 * b + 1], [2 * b, 2 * b]];
  const inv = (seq: number[]) => [...seq].reverse().map(inverse);

  const library: number[][] = single.map((i) => [i]);
  for (let a = 0; a < blocks; a++)
    for (let b = 0; b < blocks; b++) {
      if (a === b) continue;
      for (const X of powers(a))
        for (const Y of powers(b)) {
          const comm = [...X, ...Y, ...inv(X), ...inv(Y)];
          library.push(comm);
          // a tuck
          library.push([...X, ...Y, ...inv(X)]);
          for (const s of single) library.push([s, ...comm, inverse(s)]);
        }
    }

  const fix = (where: number[]) => {
    let f = 0;
    while (f < size && where[f] === f) f++;
    return f;
  };

  const t0 = now();
  let broken: string | null = null;
  let checked = 0;
  for (const seq of library) {
    const [where, turns] = compose(
      seq.map((i) => mv[i]),
      size,
    );
    const f = fix(where);
    checked++;
    // Plain's claim: cells before f hold their tiles. With orientation, a
    // finished tile is also the right way round.
    if (turns.slice(0, f).some((t) => t !== 0)) {
      broken = `([${seq.join(", ")}], ${f}, [${turns.slice(0, f).join(", ")}])`;
      break;
    }
  }
  record(
    "C16",
    `Twiddle's library sequences in orientation, 3x3 [${checked} sequences]`,
    broken !== null ? "unsound" : "sound",
    now() - t0,
    broken,
  );
  record(
    "C15",
    "Twiddle's library sequences in rows only",
    "sound (argued, not run)",
    0.0,
    "a cell holding its tile holds a tile of its row",
  );
  record(
    "C15",
    "rows only's sequences in Twiddle",
    "sound (argued, not run)",
    0.0,
    "with every value distinct, a same-valued tile is the tile",
  );
  record(
    "C16",
    "orientation's twists in Twiddle",
    "not expressible",
    0.0,
    "plain Twiddle has no turns",
  );
}

// ------------------------------------------------------------------ Netslide

/** The grid's edges as pairs of cell indices, each once. */
function gridEdges(w: number, h: number, wrap: boolean): [number, number][] {
  const es = new Map<string, [number, number]>();
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        let nx = x + dx;
        let ny = y + dy;
        if (wrap) {
          nx %= w;
          ny %= h;
        } else if (nx >= w || ny >= h) continue;
        if (nx !== x || ny !== y) {
          const a = y * w + x;
          const b = ny * w + nx;
          const e: [number, number] = a < b ? [a, b] : [b, a];
          es.set(`${e[0]},${e[1]}`, e);
        }
      }
  return [...es.values()];
}

/** Every spanning tree of the cells, as its edges. */
function* spanningTrees(
  size: number,
  edges: [number, number][],
): Generator<[number, number][]> {
  const k = size - 1;
  const pick: number[] = [];
  function* choose(from: number): Generator<[number, number][]> {
    if (pick.length === k) {
      const parent = Array.from({ length: size }, (_, i) => i);
      const root = (c: number) => {
        while (parent[c] !== c) {
          parent[c] = parent[parent[c]];
          c = parent[c];
        }
        return c;
      };
      for (const i of pick) {
        const ra = root(edges[i][0]);
        const rb = root(edges[i][1]);
        if (ra === rb) return;
        parent[ra] = rb;
      }
      yield pick.map((i) => edges[i]);
      return;
    }
    for (let i = from; i <= edges.length - (k - pick.length); i++) {
      pick.push(i);
      yield* choose(i + 1);
      pick.pop();
    }
  }
  yield* choose(0);
}

function runC23(): void {
  for (const [w, h] of [
    [3, 3],
    [4, 3],
  ]) {
    const size = w * h;
    for (const wrap of [false, true]) {
      const name = `Netslide${wrap ? " wrapping" : ""} ${w}x${h}`;
      const t0 = now();
      let trees = 0;
      let bad = 0;
      for (const es of spanningTrees(size, gridEdges(w, h, wrap))) {
        trees++;
        const arms = Array.from({ length: size }, () => 0);
        for (const [a, b] of es) {
          arms[a]++;
          arms[b]++;
        }
        if (
          arms.some((v) => v === 0) ||
          arms.reduce((t, v) => t + v, 0) !== 2 * (size - 1)
        )
          bad++;
      }
      record(
        "C23",
        `the arm prunes over every answer of ${name} [${trees} trees]`,
        bad ? "unsound" : "sound",
        now() - t0,
      );
    }
  }
  // The parity prune: on a board odd both ways, every slide of a line other
  // than the source's is an odd cycle, an even permutation. Wrapping does not
  // change the slides, so one group serves both writings.
  const w = 3;
  const h = 3;
  const size = w * h;
  const idx = (x: number, y: number) => y * w + x;
  const cx = Math.trunc(w / 2);
  const cy = Math.trunc(h / 2);
  const gens: number[][] = [];
  const cellsXY = Array.from({ length: size }, (_, i) => [i % w, Math.trunc(i / w)]);
  for (let y = 0; y < h; y++)
    if (y !== cy)
      for (const s of [1, -1])
        gens.push(
          cellsXY.map(([x, yy]) =>
            yy === y ? idx((((x - s) % w) + w) % w, yy) : idx(x, yy),
          ),
        );
  for (let x = 0; x < w; x++)
    if (x !== cx)
      for (const s of [1, -1])
        gens.push(
          cellsXY.map(([xx, y]) =>
            xx === x ? idx(xx, (((y - s) % h) + h) % h) : idx(xx, y),
          ),
        );
  const t0 = now();
  const start = Array.from({ length: size }, (_, i) => i).join(",");
  const seen = new Set([start]);
  const todo = [start];
  while (todo.length > 0) {
    const p = (todo.pop() as string).split(",").map(Number);
    for (const g of gens) {
      const q = g.map((gi) => p[gi]).join(",");
      if (!seen.has(q)) {
        seen.add(q);
        todo.push(q);
      }
    }
  }

  const even = (key: string) => {
    const p = key.split(",").map(Number);
    let s = 0;
    for (let i = 0; i < p.length; i++)
      while (p[i] !== i) {
        const j = p[i];
        [p[i], p[j]] = [p[j], p[i]];
        s++;
      }
    return s % 2 === 0;
  };
  const odd = [...seen].filter((p) => !even(p));
  record(
    "C23",
    `the parity prune, 3x3 slide group [${seen.size} arrangements]`,
    odd.length > 0 ? "unsound" : "sound",
    now() - t0,
  );
}

const RUNS = new Map<string, () => void>([
  ["A9", runA9],
  ["D1", runD1],
  ["D2", runD2],
  ["C15", runC15],
  ["C23", runC23],
]);

it("planning", () => {
  for (const name of pairsToRun([...RUNS.keys()])) {
    const run = RUNS.get(name);
    if (run === undefined) throw new Error(`no run ${name}`);
    run();
  }
  writeResults("results-planning.txt", results);
});
