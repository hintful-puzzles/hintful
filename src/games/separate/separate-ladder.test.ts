/*
 * Separate's `runDeductionFixpoint` ladder, certified by a census of which
 * rungs fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * **Each case is a generator run, not a single solve**, because the generator
 * keeps one scratch across refills of the letters it has not locked, and a
 * rung that fired only on a carried-over component would go unseen by a fresh
 * solve. The refill below is `newSeparateDesc`'s, run to its first verdict
 * that ends the loop, so the corpus holds stuck, progressing and solved
 * attempts alike.
 */
import { divvyRectangle } from "../../engine/divvy.ts";
import { randomNew } from "../../engine/random/index.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { SOLVED, SolverScratch, STUCK, solverAttempt } from "./solver.ts";
import type { SeparateParams } from "./state.ts";

const SHAPES: SeparateParams[] = [
  { w: 4, h: 4, k: 4 },
  { w: 5, h: 5, k: 5 },
  { w: 6, h: 6, k: 4 },
  { w: 6, h: 6, k: 6 },
  { w: 8, h: 6, k: 4 },
];

const SEEDS = ["lad-a", "lad-b", "lad-c", "lad-d"];

interface Board {
  p: SeparateParams;
  seed: string;
}

type Attempt = (sc: SolverScratch, letters: Uint8Array, lock: Uint8Array) => number;

/** One divvy's worth of `newSeparateDesc`, with the solve step swapped in. */
function generatorRun({ p, seed }: Board, attempt: Attempt): void {
  const { w, h, k } = p;
  const wh = w * h;
  const rng = randomNew(`separate-ladder-${seed}`);
  const dsf = divvyRectangle(w, h, k, rng);
  const ominoes = new Map<number, number[]>();
  for (let i = 0; i < wh; i++) {
    const root = dsf.canonify(i);
    ominoes.set(root, [...(ominoes.get(root) ?? []), i]);
  }
  const sc = new SolverScratch(w, h, k);
  sc.init();
  const grid = new Uint8Array(wh);
  const lock = new Uint8Array(wh);
  let retries = k * k;
  for (;;) {
    for (const squares of ominoes.values()) {
      const held = new Set(squares.filter((s) => lock[s]).map((s) => grid[s]));
      const free: number[] = [];
      for (let letter = 0; letter < k; letter++)
        if (!held.has(letter)) free.push(letter);
      shuffle(free, rng);
      for (const s of squares) if (!lock[s]) grid[s] = free.pop() as number;
    }
    const m = attempt(sc, grid, lock);
    if (m === SOLVED || (m === STUCK && retries-- <= 0)) break;
    if (m !== STUCK) retries = k * k;
  }
}

const cases = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${p.w}x${p.h}n${p.k} ${seed}`;
    return { label, board: (): Board => ({ p, seed: label }) };
  }),
);

describeLadderCensus<Board>({
  game: "separate",
  rungs: ["shared-letter", "walled-apart", "only-way"],
  unreached: {},
  // Untiered: every rung is tier 0.
  caps: [0],
  cases,
  solve: (board, _cap, firings) =>
    generatorRun(board, (sc, letters, lock) =>
      solverAttempt(sc, letters, lock, firings),
    ),
});
