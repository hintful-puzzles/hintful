/*
 * Separate's `runDeductionFixpoint` ladder, proved equivalent to upstream's
 * hand-written loop (`solverAttemptLegacy`). The harness and the argument for
 * it are `engine/testing/ladder-equivalence.ts`; this file is the declaration.
 *
 * **What needed proving.** Upstream sweeps every shared-letter disconnect in
 * one pass before extending anything; the runner restarts after each rung
 * that fires, and the ladder adds `walled-apart`, which only writes walls. So
 * the comparison is over the state the generator reads: the partition, the
 * disconnect matrix, the sizes, the letters locked and the verdict.
 *
 * **Each case is a generator run, not a single solve**, because the generator
 * keeps one scratch across refills of the letters it has not locked, and a
 * rung that misbehaved only on a carried-over component would pass a fresh
 * solve. The refill below is `newSeparateDesc`'s, run to its first verdict
 * that ends the loop, so the corpus holds stuck, progressing and solved
 * attempts alike.
 */
import { divvyRectangle } from "../../engine/divvy.ts";
import { randomNew } from "../../engine/random/index.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { describeLadderEquivalence } from "../../engine/testing/ladder-equivalence.ts";
import {
  SOLVED,
  SolverScratch,
  STUCK,
  solverAttempt,
  solverAttemptLegacy,
} from "./solver.ts";
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
function generatorRun({ p, seed }: Board, attempt: Attempt): string {
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
  const verdicts: number[] = [];
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
    verdicts.push(m);
    if (m === SOLVED || (m === STUCK && retries-- <= 0)) break;
    if (m !== STUCK) retries = k * k;
  }
  const partition = Array.from({ length: wh }, (_, i) => sc.dsf.canonify(i));
  return [
    verdicts.join(""),
    partition.join(","),
    Array.from(sc.size).join(","),
    Array.from(sc.disconnect).join(""),
    Array.from(lock).join(""),
  ].join("|");
}

const cases = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${p.w}x${p.h}n${p.k} ${seed}`;
    return { label, board: (): Board => ({ p, seed: label }) };
  }),
);

describeLadderEquivalence<Board>({
  game: "separate",
  rungs: ["shared-letter", "walled-apart", "only-way"],
  unreached: {},
  // Untiered: every rung is tier 0.
  caps: [0],
  cases,
  viaRunner: (board, _cap, firings) =>
    generatorRun(board, (sc, letters, lock) =>
      solverAttempt(sc, letters, lock, firings),
    ),
  viaLegacy: (board) => generatorRun(board, solverAttemptLegacy),
  // The generator's whole working state travels in the verdict string above.
  key: ({ seed }) => seed,
});
