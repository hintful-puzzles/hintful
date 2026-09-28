/**
 * Separate solver — upstream's `solver_attempt`, run as a ladder of declared
 * techniques on `runDeductionFixpoint`.
 *
 * The working state is a disjoint-set forest of squares plus, per component
 * (all indexed by the dsf canonical root):
 *  - `size[root]` — component size.
 *  - `contents[root*k + letter]` — the grid index contributing `letter` to this
 *    component, or `-1` if the component lacks it.
 *  - `disconnect[root1*wh + root2]` — components known to be distinct regions.
 *
 * and the same facts in the player's notation, `borders` (the border-grid byte
 * per square): a disconnect walls every edge between the two components, a
 * merge marks the edges it crossed "no wall". The generator reads only the
 * first set; the hint reads the second, and both are written by the one ladder.
 *
 * The rungs, easiest first, all on tier 0 (Separate has no difficulty levels,
 * so the ladder is an order and the grade is unused):
 *
 *  1. **shared-letter** — two adjacent components that already hold a common
 *     letter can never be one region: disconnect them.
 *  2. **walled-apart** — two components already disconnected, with an edge
 *     between them still unwalled: wall it. Upstream has no such step, because
 *     its disconnect matrix ORs rows on a merge, so a grown component inherits
 *     "separate from B" silently. On the player's board that inheritance is
 *     visible work (the new boundary needs its walls), and this rung is it. It
 *     touches no dsf, matrix or `genLock` state, so it moves no board.
 *  3. **only-way** — a component below the target size `k` with exactly one
 *     legal neighboring *square* to grow into must take it: merge.
 *
 * The generator only keeps a board the solver fully solves, so on a real board
 * running this to a fixpoint yields *the* unique partition.
 */

import {
  BORDER,
  BORDER_D,
  BORDER_L,
  BORDER_R,
  BORDER_U,
  DISABLED,
  DX,
  DY,
  FLIP,
  initBorders,
} from "../../engine/border-grid.ts";
import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import type { SeparateParams } from "./state.ts";

/** Solver verdict, mirroring upstream's 0/1/2. */
export const STUCK = 0;
const PROGRESS = 1;
export const SOLVED = 2;

/** One edge a firing sets, on the square `(x, y)`'s `dir` side. */
export interface SeparateEdge {
  x: number;
  y: number;
  dir: number;
  kind: "wall" | "nowall";
}

/**
 * One firing, in the player's terms: which rung, the squares its premise names
 * (captured before the rung acted), and the edges it set, in scan order.
 */
export type SeparateFiring =
  | {
      kind: "sharedLetter";
      /** The two components, as square lists. */
      a: number[];
      b: number[];
      letter: number;
      /** The square in `a`, then in `b`, carrying `letter`. */
      holders: [number, number];
      edges: SeparateEdge[];
    }
  | { kind: "walledApart"; a: number[]; b: number[]; edges: SeparateEdge[] }
  | {
      kind: "onlyWay";
      /** The component that must grow. */
      region: number[];
      /** The one square it can grow into. */
      square: number;
      edges: SeparateEdge[];
    };

/** The solver's working state, reused by the generator across letter fills. */
export class SolverScratch {
  readonly w: number;
  readonly h: number;
  readonly k: number;
  readonly wh: number;
  dsf: Dsf;
  size: Int32Array;
  contents: Int32Array;
  disconnect: Uint8Array; // wh*wh boolean matrix
  tmp: Int32Array;
  /** The same facts as walls and no-wall marks, in the border-grid byte. */
  borders: Uint8Array;
  /** Hint path only: the last firing, captured by the rung that fired. */
  rec: { firing: SeparateFiring | null } | null = null;

  constructor(w: number, h: number, k: number) {
    this.w = w;
    this.h = h;
    this.k = k;
    this.wh = w * h;
    this.dsf = new Dsf(this.wh);
    this.size = new Int32Array(this.wh);
    this.contents = new Int32Array(this.wh * k);
    this.disconnect = new Uint8Array(this.wh * this.wh);
    this.tmp = new Int32Array(this.wh);
    this.borders = initBorders(w, h);
  }

  init(): void {
    this.dsf = new Dsf(this.wh);
    this.size.fill(1);
    this.disconnect.fill(0);
    this.borders = initBorders(this.w, this.h);
  }

  /** Index each component's letters from the grid and the current dsf. */
  indexContents(letters: Uint8Array): void {
    const { k, wh } = this;
    this.contents.fill(-1);
    for (let i = 0; i < wh; i++)
      this.contents[this.dsf.canonify(i) * k + letters[i]] = i;
  }

  connect(yx1: number, yx2: number): void {
    const { k, wh } = this;
    yx1 = this.dsf.canonify(yx1);
    yx2 = this.dsf.canonify(yx2);
    this.dsf.merge(yx1, yx2);
    const yxnew = this.dsf.canonify(yx2);

    this.size[yxnew] = this.size[yx1] + this.size[yx2];

    // Union the contents: at most one of the pair holds each letter, so
    // (a + b + 1) yields -1 iff both were -1, else the other index.
    for (let i = 0; i < k; i++) {
      this.contents[yxnew * k + i] =
        this.contents[yx1 * k + i] + this.contents[yx2 * k + i] + 1;
    }

    // Merge disconnect rows and columns.
    for (let i = 0; i < wh; i++)
      this.disconnect[yxnew * wh + i] =
        this.disconnect[yx1 * wh + i] || this.disconnect[yx2 * wh + i];
    for (let i = 0; i < wh; i++)
      this.disconnect[i * wh + yxnew] =
        this.disconnect[i * wh + yx1] || this.disconnect[i * wh + yx2];
  }

  disconnectPair(yx1: number, yx2: number): void {
    const { wh } = this;
    yx1 = this.dsf.canonify(yx1);
    yx2 = this.dsf.canonify(yx2);
    this.disconnect[yx1 * wh + yx2] = 1;
    this.disconnect[yx2 * wh + yx1] = 1;
  }

  /** The squares of `yx`'s component, ascending. */
  componentOf(yx: number): number[] {
    const root = this.dsf.canonify(yx);
    const out: number[] = [];
    for (let i = 0; i < this.wh; i++) if (this.dsf.canonify(i) === root) out.push(i);
    return out;
  }

  /**
   * Set `bit` (a wall, or a no-wall mark) on every edge between a square in
   * component `ra` and one for which `inB` holds, where neither is set yet.
   * Returns the edges set, in scan order, each named on its `ra` side.
   */
  private markBetween(
    ra: number,
    inB: (sq: number) => boolean,
    kind: SeparateEdge["kind"],
  ): SeparateEdge[] {
    const { w, h, wh, borders } = this;
    const out: SeparateEdge[] = [];
    for (let i = 0; i < wh; i++) {
      if (this.dsf.canonify(i) !== ra) continue;
      const x = i % w;
      const y = (i - x) / w;
      for (let dir = 0; dir < 4; dir++) {
        const x2 = x + DX[dir];
        const y2 = y + DY[dir];
        if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= h) continue;
        const j = y2 * w + x2;
        if (!inB(j)) continue;
        const b = BORDER(dir);
        if (borders[i] & (b | DISABLED(b))) continue;
        const bit = kind === "wall" ? b : DISABLED(b);
        const flip = kind === "wall" ? BORDER(FLIP(dir)) : DISABLED(BORDER(FLIP(dir)));
        borders[i] |= bit;
        borders[j] |= flip;
        out.push({ x, y, dir, kind });
      }
    }
    return out;
  }

  /** Wall every still-open edge between components `ra` and `rb`. */
  wallBetween(ra: number, rb: number): SeparateEdge[] {
    const root = this.dsf.canonify(rb);
    return this.markBetween(
      this.dsf.canonify(ra),
      (j) => this.dsf.canonify(j) === root,
      "wall",
    );
  }

  /** Mark "no wall" on every still-open edge between component `ra` and square `sq`. */
  openTo(ra: number, sq: number): SeparateEdge[] {
    return this.markBetween(this.dsf.canonify(ra), (j) => j === sq, "nowall");
  }
}

/**
 * The three rungs over one scratch, whose `contents` index the letters. `genLock`, when supplied,
 * records which grid squares' letters a deduction has depended on (for the
 * generator). `progress.fired` is raised by the two rungs upstream counts as
 * progress; `walled-apart` restates a known disconnect and does not raise it.
 *
 * On the recording path (`sc.rec` set) each rung returns after its first
 * firing, so one firing is one hint step; without a recorder the first two
 * sweep the whole grid, as upstream's pass does. Both walks reach the same
 * state: a disconnect changes no component, so which pairs a sweep disconnects,
 * and which letters it locks, cannot depend on their order.
 */
function separateLadder(
  sc: SolverScratch,
  genLock: Uint8Array | null,
  progress: { fired: boolean },
): DeductionTechnique[] {
  const { w, h, k, wh } = sc;

  const sharedLetter = (): number => {
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let dir = 0; dir < 2; dir++) {
          const x2 = x + dir;
          const y2 = y + 1 - dir;
          if (x2 >= w || y2 >= h) continue;
          const yx = sc.dsf.canonify(y * w + x);
          const yx2 = sc.dsf.canonify(y2 * w + x2);
          if (yx === yx2) continue;
          if (sc.disconnect[yx * wh + yx2]) continue;

          let i = 0;
          for (; i < k; i++)
            if (sc.contents[yx * k + i] >= 0 && sc.contents[yx2 * k + i] >= 0) break;
          if (i === k) continue; // no letter in common

          const a = sc.rec ? sc.componentOf(yx) : [];
          const b = sc.rec ? sc.componentOf(yx2) : [];
          sc.disconnectPair(yx, yx2);
          const edges = sc.wallBetween(yx, yx2);
          fired++;
          progress.fired = true;
          if (genLock) {
            genLock[sc.contents[yx * k + i]] = 1;
            genLock[sc.contents[yx2 * k + i]] = 1;
          }
          if (sc.rec) {
            const holders: [number, number] = [
              sc.contents[yx * k + i],
              sc.contents[yx2 * k + i],
            ];
            sc.rec.firing = { kind: "sharedLetter", a, b, letter: i, holders, edges };
            return fired;
          }
        }
      }
    }
    return fired;
  };

  const walledApart = (): number => {
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let dir = 1; dir <= 2; dir++) {
          const x2 = x + DX[dir];
          const y2 = y + DY[dir];
          if (x2 >= w || y2 >= h) continue;
          const i = y * w + x;
          if (sc.borders[i] & BORDER(dir)) continue;
          const yx = sc.dsf.canonify(i);
          const yx2 = sc.dsf.canonify(y2 * w + x2);
          if (yx === yx2 || !sc.disconnect[yx * wh + yx2]) continue;

          const a = sc.rec ? sc.componentOf(yx) : [];
          const b = sc.rec ? sc.componentOf(yx2) : [];
          const edges = sc.wallBetween(yx, yx2);
          fired++;
          if (sc.rec) {
            sc.rec.firing = { kind: "walledApart", a, b, edges };
            return fired;
          }
        }
      }
    }
    return fired;
  };

  const onlyWay = (): number => {
    sc.tmp.fill(-1);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const yx = sc.dsf.canonify(y * w + x);
        if (sc.size[yx] === k) continue;
        for (let dir = 0; dir < 4; dir++) {
          const x2 = x + (dir === 0 ? -1 : dir === 2 ? 1 : 0);
          const y2 = y + (dir === 1 ? -1 : dir === 3 ? 1 : 0);
          if (y2 < 0 || y2 >= h || x2 < 0 || x2 >= w) continue;
          const yx2 = y2 * w + x2;
          const yx2c = sc.dsf.canonify(yx2);
          if (yx2c !== yx && !sc.disconnect[yx2c * wh + yx]) {
            if (sc.tmp[yx] === -1) sc.tmp[yx] = yx2;
            else if (sc.tmp[yx] !== yx2) sc.tmp[yx] = -2; // multiple choices
          }
        }
      }
    }
    // Upstream merges the lowest-rooted component with a single choice and
    // restarts. The order is load-bearing: a component that grows can gain
    // choices, so extending another first can leave this one unforced, and the
    // generator keeps only boards this exact walk solves.
    for (let i = 0; i < wh; i++) {
      const sq = sc.tmp[i];
      if (sq < 0) continue;
      // Skip if the two ends are already one component (both sides of a
      // two-component pair can each be the other's sole extension).
      if (sc.dsf.canonify(i) === sc.dsf.canonify(sq)) continue;
      const region = sc.rec ? sc.componentOf(i) : [];
      const edges = sc.openTo(i, sq);
      sc.connect(i, sq);
      progress.fired = true;
      if (sc.rec) sc.rec.firing = { kind: "onlyWay", region, square: sq, edges };
      return 1;
    }
    return 0;
  };

  return [
    { id: "shared-letter", tier: 0, run: sharedLetter },
    { id: "walled-apart", tier: 0, run: walledApart },
    { id: "only-way", tier: 0, run: onlyWay },
  ];
}

/** Every component is a full region. */
function allFull(sc: SolverScratch): boolean {
  for (let i = 0; i < sc.wh; i++)
    if (sc.size[sc.dsf.canonify(i)] !== sc.k) return false;
  return true;
}

/**
 * One full solve attempt over `letters` on the given scratch (which must have
 * been `init()`ed; the generator keeps it across refills of the letters it has
 * not locked). `genLock`, when supplied, records which grid squares' letters a
 * deduction has depended on. Returns STUCK / PROGRESS / SOLVED, mutating the
 * scratch to the deduced partition. `firings` is the ladder census's channel
 * (`separate-ladder.test.ts`).
 */
export function solverAttempt(
  sc: SolverScratch,
  letters: Uint8Array,
  genLock: Uint8Array | null,
  firings?: FiringTally,
): number {
  sc.indexContents(letters);
  const progress = { fired: false };
  runDeductionFixpoint({
    techniques: separateLadder(sc, genLock, progress),
    firings,
  });
  if (allFull(sc)) return SOLVED;
  return progress.fired ? PROGRESS : STUCK;
}

/**
 * The hand-written loop this solver ran before adopting the runner, kept
 * **only** as the oracle `separate-ladder.test.ts` proves the adoption
 * against. It knows nothing of `borders`.
 */
export function solverAttemptLegacy(
  sc: SolverScratch,
  letters: Uint8Array,
  genLock: Uint8Array | null,
): number {
  const { w, h, k, wh } = sc;
  let doneOverall = false;

  sc.indexContents(letters);

  for (;;) {
    let done = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let dir = 0; dir < 2; dir++) {
          const x2 = x + dir;
          const y2 = y + 1 - dir;
          if (x2 >= w || y2 >= h) continue;
          const yx = sc.dsf.canonify(y * w + x);
          const yx2 = sc.dsf.canonify(y2 * w + x2);
          if (yx === yx2) continue;
          if (sc.disconnect[yx * wh + yx2]) continue;

          let i = 0;
          for (; i < k; i++)
            if (sc.contents[yx * k + i] >= 0 && sc.contents[yx2 * k + i] >= 0) break;
          if (i === k) continue;

          sc.disconnectPair(yx, yx2);
          done = doneOverall = true;
          if (genLock) {
            genLock[sc.contents[yx * k + i]] = 1;
            genLock[sc.contents[yx2 * k + i]] = 1;
          }
        }
      }
    }

    sc.tmp.fill(-1);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const yx = sc.dsf.canonify(y * w + x);
        if (sc.size[yx] === k) continue;
        for (let dir = 0; dir < 4; dir++) {
          const x2 = x + (dir === 0 ? -1 : dir === 2 ? 1 : 0);
          const y2 = y + (dir === 1 ? -1 : dir === 3 ? 1 : 0);
          if (y2 < 0 || y2 >= h || x2 < 0 || x2 >= w) continue;
          const yx2 = y2 * w + x2;
          const yx2c = sc.dsf.canonify(yx2);
          if (yx2c !== yx && !sc.disconnect[yx2c * wh + yx]) {
            if (sc.tmp[yx] === -1) sc.tmp[yx] = yx2;
            else if (sc.tmp[yx] !== yx2) sc.tmp[yx] = -2;
          }
        }
      }
    }
    for (let i = 0; i < wh; i++) {
      if (sc.tmp[i] >= 0) {
        if (sc.dsf.canonify(i) === sc.dsf.canonify(sc.tmp[i])) continue;
        sc.connect(i, sc.tmp[i]);
        done = doneOverall = true;
        break;
      }
    }

    if (!done) break;
  }

  if (allFull(sc)) return SOLVED;
  return doneOverall ? PROGRESS : STUCK;
}

/**
 * Solve a board from its letters. Returns the deduced partition dsf if fully
 * solved, else `null` (not uniquely deducible by these rules).
 */
export function solve(p: SeparateParams, letters: Uint8Array): Dsf | null {
  const sc = new SolverScratch(p.w, p.h, p.k);
  sc.init();
  return solverAttempt(sc, letters, null) === SOLVED ? sc.dsf : null;
}

/**
 * The unique solution's wall bytes (only wall bits set, including the rim), or
 * `null` if the board is not fully deducible. A wall lies on every edge between
 * two different components.
 */
export function solveToBorders(
  p: SeparateParams,
  letters: Uint8Array,
): Uint8Array | null {
  const dsf = solve(p, letters);
  if (!dsf) return null;
  const { w, h } = p;
  const sol = initBorders(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (x + 1 < w && !dsf.equivalent(i, i + 1)) {
        sol[i] |= BORDER_R;
        sol[i + 1] |= BORDER_L;
      }
      if (y + 1 < h && !dsf.equivalent(i, i + w)) {
        sol[i] |= BORDER_D;
        sol[i + w] |= BORDER_U;
      }
    }
  }
  return sol;
}

/**
 * The recording projection: a scratch seeded from the player's `borders` (their
 * no-wall marks merged, their walls disconnecting the components either side),
 * and a closure returning the next single firing, or `null` when the ladder
 * has nothing left. The scratch's own `borders` is the working board the
 * firings advance.
 *
 * Seeding assumes the player's marks agree with the solution (the hint refuses
 * otherwise), so no merge joins two squares of one letter.
 */
export function separateRecordingPass(
  p: SeparateParams,
  letters: Uint8Array,
  borders: Uint8Array,
  budget: StepBudget,
): { scratch: SolverScratch; next: () => SeparateFiring | null } {
  const { w, h } = p;
  const sc = new SolverScratch(w, h, p.k);
  sc.init();
  sc.borders = borders.slice();
  /** Every interior edge carrying `kind`, as its two squares. */
  const edgesMarked = (kind: SeparateEdge["kind"]): [number, number][] => {
    const on = (b: number): number => (kind === "wall" ? b : DISABLED(b));
    const out: [number, number][] = [];
    for (let i = 0; i < w * h; i++) {
      if (i % w < w - 1 && borders[i] & on(BORDER_R)) out.push([i, i + 1]);
      if (i < w * (h - 1) && borders[i] & on(BORDER_D)) out.push([i, i + w]);
    }
    return out;
  };
  // No-wall marks first, so each wall disconnects whole components.
  for (const [i, j] of edgesMarked("nowall"))
    if (!sc.dsf.equivalent(i, j)) sc.connect(i, j);
  for (const [i, j] of edgesMarked("wall"))
    if (!sc.dsf.equivalent(i, j)) sc.disconnectPair(i, j);
  sc.indexContents(letters);

  const rec: { firing: SeparateFiring | null } = { firing: null };
  sc.rec = rec;
  const firings = singleFirings({
    techniques: separateLadder(sc, null, { fired: false }),
    budget,
    beforeTechnique: () => {
      rec.firing = null;
    },
  });
  return {
    scratch: sc,
    next: () => (firings.next() ? rec.firing : null),
  };
}
