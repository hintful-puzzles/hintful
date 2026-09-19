/**
 * Subsets rule validator and deductive solver — port of `subsets_validate`
 * and the `subsets_solve_*` family in `puzzles/unreleased/subsets.c`.
 *
 * The solver is a candidate-elimination fixpoint over a **cube**
 * `cube[cell][value]`: for each cell and each of the `2^n` possible
 * set-values, whether that value is still a candidate.
 *
 * **Deductive strength is the difficulty axis, and it is capped explicitly.**
 * The generator keeps a cell blank only while this solver still reaches a
 * complete solution, so the precise set of deductions decides which cells stay
 * givens and therefore every generated desc. `DIFF_EASY` is upstream's compiled
 * strength exactly — rules and loop order verbatim, neither strengthened nor
 * weakened, which is what keeps the C fixtures reproducing byte-for-byte
 * (subsets-differential.test.ts). `DIFF_TRICKY` adds one rule *on top*: the
 * half of `applyArrowsAdvanced` that upstream wrote, commented out and never
 * compiled. Being added above rather than in place keeps the oracle intact.
 */
import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
} from "../../engine/deduction-fixpoint.ts";
import { deduceHintPlan as accumulateHintPlan } from "../../engine/hint-plan.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  ADJTHAN,
  ALL_BITS,
  cloneState,
  DIFF_EASY,
  DIFF_TRICKY,
  type SubsetsMistake,
  type SubsetsState,
} from "./state.ts";

export type SubsetsStatus = "complete" | "unfinished" | "invalid";

/**
 * Classify the board (upstream `subsets_validate`): `complete` when every
 * cell is decided and consistent, `invalid` on a duplicated placement or a
 * violated (missing-)arrow relation between decided cells, else
 * `unfinished`.
 *
 * With `flags` given, every violated edge is recorded as the `ADJTHAN` flag
 * bit on the cell it was found from (and the scan runs to completion instead
 * of early-exiting). With `counts` given, `counts[v]` receives the number of
 * decided cells holding set-value `v` (the solver's and the tally's input;
 * sized `w·h`, which equals `2^n` at the only legal params).
 */
export function subsetsValidate(
  state: SubsetsState,
  flags?: Uint8Array | null,
  counts?: Int32Array | null,
): SubsetsStatus {
  const { w, h } = state;
  const hasCounts = counts != null;

  let ret: SubsetsStatus = "complete";

  for (let i = 0; i < w * h; i++) {
    if (state.known[i] !== state.mask[i]) {
      if (!flags && !hasCounts) return "unfinished";
      ret = "unfinished";
    }
  }

  if (flags) flags.fill(0);
  const cnt = counts ?? new Int32Array(w * h);
  cnt.fill(0);

  // Validate counts (each set placed at most once).
  for (let i = 0; i < w * h; i++) {
    if (state.known[i] === state.mask[i]) {
      cnt[state.known[i]]++;
      if (cnt[state.known[i]] > 1) ret = "invalid";
      if (!flags && ret === "invalid") break;
    }
  }

  // Validate arrows between decided cells.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (ret === "invalid" && !flags) break;

      const i = y * w + x;
      if (state.known[i] !== state.mask[i]) continue;

      for (let dir = 0; dir < 4; dir++) {
        const x2 = x + ADJTHAN[dir].dx;
        const y2 = y + ADJTHAN[dir].dy;
        if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= h) continue;

        const i2 = y2 * w + x2;
        if (state.known[i2] !== state.mask[i2]) continue;

        // Validate disjoint pairs only once.
        if (!(state.clues[i] & ADJTHAN[dir].f) && (x2 < x || y2 < y)) continue;

        const intersect = state.known[i] & state.known[i2];

        if (state.clues[i] & ADJTHAN[dir].f) {
          // Arrow i -> i2: set(i2) must be contained in set(i).
          if (intersect !== state.known[i2]) {
            ret = "invalid";
            if (flags) flags[i] |= ADJTHAN[dir].f;
          }
        } else if (!(state.clues[i2] & ADJTHAN[dir].fo)) {
          // No arrow either way: neither set may contain the other.
          if (intersect === state.known[i2] || intersect === state.known[i]) {
            ret = "invalid";
            if (flags) flags[i] |= ADJTHAN[dir].f;
          }
        }
      }
    }
  }

  return ret;
}

// --- the solver rules (upstream order and strength, exactly) -----------------

/** Drop a candidate value outside the cell's `mask` or missing a `known`
 * bit (upstream `subsets_sync_cube`). */
function syncCube(state: SubsetsState, cube: Uint8Array): void {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  for (let i = 0; i < s; i++) {
    for (let nj = 0; nj < n2; nj++) {
      if (!cube[i * n2 + nj]) continue;
      if ((state.mask[i] & nj) !== nj) cube[i * n2 + nj] = 0;
      if ((state.known[i] & nj) !== state.known[i]) cube[i * n2 + nj] = 0;
    }
  }
}

/** A value already placed exactly once is no candidate anywhere else
 * (upstream `subsets_cube_single_count`). */
function cubeSingleCount(
  state: SubsetsState,
  counts: Int32Array,
  cube: Uint8Array,
): void {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  for (let ni = 0; ni < n2; ni++) {
    if (counts[ni] !== 1) continue;
    for (let j = 0; j < s; j++) {
      if (state.mask[j] === state.known[j]) continue;
      if (!cube[j * n2 + ni]) continue;
      cube[j * n2 + ni] = 0;
    }
  }
}

/** An arrow `i1 -> i2` means set(i2) ⊆ set(i1): confirmed letters of the
 * subset propagate up, ruled-out letters of the superset propagate down
 * (upstream `subsets_solve_apply_arrows`). Returns the progress count. */
function applyArrows(state: SubsetsState): number {
  const { w, h } = state;
  let ret = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let d = 0; d < 4; d++) {
        const i1 = y * w + x;
        if (!(state.clues[i1] & ADJTHAN[d].f)) continue;
        const i2 = i1 + ADJTHAN[d].dy * w + ADJTHAN[d].dx;

        let prev = state.known[i1];
        state.known[i1] |= state.known[i2];
        if (prev !== state.known[i1]) ret++;

        prev = state.mask[i2];
        state.mask[i2] &= state.mask[i1];
        if (prev !== state.mask[i2]) ret++;
      }
    }
  }
  return ret;
}

/** A value placed nowhere with exactly one remaining candidate cell is
 * placed there (upstream `subsets_solve_single_position`). */
function solveSinglePosition(
  state: SubsetsState,
  counts: Int32Array,
  cube: Uint8Array,
): number {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  let ret = 0;
  for (let nj = 0; nj < n2; nj++) {
    if (counts[nj] !== 0) continue;
    let found = -1;
    for (let i = 0; i < s && found !== -2; i++) {
      if (!cube[i * n2 + nj]) continue;
      found = found === -1 ? i : -2;
    }
    if (found < 0) continue;
    state.known[found] = nj;
    state.mask[found] = nj;
    ret++;
  }
  return ret;
}

/** Collapse the surviving candidates back into `known`/`mask` (upstream
 * `subsets_bits_from_cube`). A cell with no surviving candidate — a
 * contradiction — gets `known |= ~0` as upstream: the Uint16Array stores
 * 0xFFFF where C stores 0xFFFFFFFF, which is observationally identical because
 * `mask` never exceeds `ALL_BITS(n)`, so such a cell never reads as decided. */
function bitsFromCube(state: SubsetsState, cube: Uint8Array): number {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  let ret = 0;
  for (let i = 0; i < s; i++) {
    let newmask = 0;
    let newknown = ~0;
    for (let nj = 0; nj < n2; nj++) {
      if (cube[i * n2 + nj]) {
        newmask |= nj;
        newknown &= nj;
      }
    }

    let prev = state.known[i];
    state.known[i] |= newknown;
    if (prev !== state.known[i]) ret++;

    prev = state.mask[i];
    state.mask[i] &= newmask;
    if (prev !== state.mask[i]) ret++;
  }
  return ret;
}

/**
 * For an arrow `i1 -> i2` (meaning set(i2) ⊂ set(i1)), eliminate candidates
 * that no partner on the other end can satisfy (upstream
 * `subsets_solve_apply_arrows_advanced`).
 *
 * Both halves rest on the arrow forcing a **proper** subset — which the arrow
 * rule alone does not say (`subsetsValidate` accepts equality) but the
 * separate "each set is placed at most once" rule does, since two cells cannot
 * hold the same value. That is why each half looks for a *strictly* smaller /
 * larger partner.
 *
 * - **Tail half** (every tier): drop a superset candidate at `i1` that has no
 *   strictly-smaller live candidate at `i2`.
 * - **Head half** (`strong` only): the mirror — drop a subset candidate at
 *   `i2` that has no strictly-larger live candidate at `i1`. Upstream wrote
 *   this, commented it out under `// TODO repair this`, and shipped without
 *   it; here it is the Normal rung.
 */
function applyArrowsAdvanced(
  state: SubsetsState,
  cube: Uint8Array,
  strong: boolean,
): number {
  const { w, h } = state;
  const n2 = 1 << state.n;
  let ret = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let d = 0; d < 4; d++) {
        const i1 = y * w + x;
        if (!(state.clues[i1] & ADJTHAN[d].f)) continue;
        const i2 = i1 + ADJTHAN[d].dy * w + ADJTHAN[d].dx;

        for (let sup = 0; sup < n2; sup++) {
          if (!cube[i1 * n2 + sup]) continue;
          let found = false;
          for (let sub = 0; sub < sup && !found; sub++) {
            if ((sup & sub) !== sub || !cube[i2 * n2 + sub]) continue;
            found = true;
          }
          if (!found) {
            cube[i1 * n2 + sup] = 0;
            ret++;
          }
        }

        if (!strong) continue;

        for (let sub = 0; sub < n2; sub++) {
          if (!cube[i2 * n2 + sub]) continue;
          let found = false;
          for (let sup = sub + 1; sup < n2 && !found; sup++) {
            if ((sup & sub) !== sub || !cube[i1 * n2 + sup]) continue;
            found = true;
          }
          if (!found) {
            cube[i2 * n2 + sub] = 0;
            ret++;
          }
        }
      }
    }
  }
  return ret;
}

/** A missing arrow between adjacent cells means neither contains the other:
 * an undecided such cell can be neither the empty nor the full set, and
 * next to a decided one loses every improperly-overlapping candidate
 * (upstream `subsets_disjoint`). */
function disjoint(state: SubsetsState, cube: Uint8Array): number {
  const { w, h } = state;
  const n2 = 1 << state.n;
  let ret = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let d = 0; d < 4; d++) {
        const i1 = y * w + x;
        if (state.clues[i1] & ADJTHAN[d].f) continue;
        const x2 = x + ADJTHAN[d].dx;
        const y2 = y + ADJTHAN[d].dy;
        if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= h) continue;
        const i2 = y2 * w + x2;
        if (state.clues[i2] & ADJTHAN[d].fo) continue;

        if (state.known[i1] !== state.mask[i1]) {
          // Remove the minimum and maximum sets.
          if (cube[i1 * n2] || cube[i1 * n2 + (n2 - 1)]) {
            cube[i1 * n2] = 0;
            cube[i1 * n2 + (n2 - 1)] = 0;
            ret++;
          }
        } else if (state.known[i2] !== state.mask[i2]) {
          // Rule out every set at i2 that is not disjoint with the set at i1
          // (i.e. one contains the other; a partial overlap is fine).
          for (let opt = 0; opt < n2; opt++) {
            if (!cube[i2 * n2 + opt]) continue;
            if (
              (state.known[i1] & opt) !== opt &&
              (state.known[i1] & opt) !== state.known[i1]
            )
              continue;
            cube[i2 * n2 + opt] = 0;
            ret++;
          }
        }
      }
    }
  }
  return ret;
}

/**
 * Run the solver to a fixpoint (upstream `subsets_solve_game`), mutating
 * `state` in place: every non-given cell is reset, then the rules run in
 * upstream's fixed order, restarting on the first that makes progress.
 * Callers pass a clone when they need the original preserved.
 *
 * `maxdiff` caps the deduction ladder: {@link DIFF_EASY} is upstream's shipped
 * strength exactly, {@link DIFF_TRICKY} adds the head half of
 * {@link applyArrowsAdvanced}. The rungs nest — Normal runs every Easy rule —
 * so a board solvable at Easy is solvable at Normal. Required, not defaulted:
 * an implicit cap is how a caller silently measures the wrong tier.
 */
export function subsetsSolveGame(
  state: SubsetsState,
  maxdiff: number,
  firings?: FiringTally,
): SubsetsStatus {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  const counts = new Int32Array(s);
  const cube = new Uint8Array(s * n2).fill(1);

  for (let i = 0; i < s; i++) {
    if (state.immutable[i]) continue;
    state.known[i] = 0;
    state.mask[i] = ALL_BITS(state.n);
  }

  // The verdict the loop stopped on, set by `settled` below.
  let status: SubsetsStatus = "unfinished";

  const ladder: DeductionTechnique[] = [
    { id: "arrows", tier: DIFF_EASY, run: () => applyArrows(state) },
    { id: "disjoint", tier: DIFF_EASY, run: () => disjoint(state, cube) },
    { id: "bits-from-cube", tier: DIFF_EASY, run: () => bitsFromCube(state, cube) },
    {
      id: "single-position",
      tier: DIFF_EASY,
      run: () => solveSinglePosition(state, counts, cube),
    },
    // **The cap is an argument, not a tier** (the guards-itself convention):
    // this rung runs at every tier and does *more* at Normal. Declaring it
    // `tier: DIFF_TRICKY` would stop it running at Easy, where upstream runs it.
    {
      id: "arrows-advanced",
      tier: DIFF_EASY,
      run: () => applyArrowsAdvanced(state, cube, maxdiff >= DIFF_TRICKY),
    },
  ];

  runDeductionFixpoint({
    techniques: ladder,
    firings,
    // **`settled` carries the per-iteration prologue** — classify the board,
    // then re-sync the cube — because it runs at the top of every iteration,
    // before any rung, which is exactly where upstream's loop ran it. A
    // never-firing rung at position 0 (the Singles shape) would work too, but
    // the firing census would then have to excuse it.
    settled: () => {
      status = subsetsValidate(state, null, counts);
      if (status !== "unfinished") return true;
      syncCube(state, cube);
      cubeSingleCount(state, counts, cube);
      return false;
    },
  });

  return status;
}

/**
 * The hand-written ladder, upstream's loop shape, kept as the oracle
 * `subsets-ladder.test.ts` proves {@link subsetsSolveGame} against.
 *
 * Subsets uses neither of the runner's graded features: it returns a
 * *verdict*, not a tier, and its difficulty is a boolean handed to one rung
 * rather than a cap over the ladder, so `maxTier` is unused. What the runner
 * gives it is the loop, the restart discipline, named rungs in the
 * step-budget's non-termination message, and the firing census.
 */
export function subsetsSolveGameLegacy(
  state: SubsetsState,
  maxdiff: number,
): SubsetsStatus {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  const counts = new Int32Array(s);
  const cube = new Uint8Array(s * n2).fill(1);

  for (let i = 0; i < s; i++) {
    if (state.immutable[i]) continue;
    state.known[i] = 0;
    state.mask[i] = ALL_BITS(state.n);
  }

  for (;;) {
    const ret = subsetsValidate(state, null, counts);
    if (ret !== "unfinished") return ret;

    syncCube(state, cube);
    cubeSingleCount(state, counts, cube);

    if (applyArrows(state)) continue;
    if (disjoint(state, cube)) continue;
    if (bitsFromCube(state, cube)) continue;
    if (solveSinglePosition(state, counts, cube)) continue;
    if (applyArrowsAdvanced(state, cube, maxdiff >= DIFF_TRICKY)) continue;

    return ret;
  }
}

// --- findMistakes: the rule validator's error set ----------------------------

/**
 * The Check & Save mistake set: exactly what upstream's own error display
 * highlights — every set-value fully placed in more than one cell (each
 * offending cell flagged), and every edge whose horseshoe or
 * missing-horseshoe relation two decided cells violate — a rule-based check
 * matching the C's live `COL_ERROR` verdicts — and every rule-out of the set
 * the solution puts in that cell, which only the solution can judge. The hint
 * reads the rule-outs as facts, so this is what makes that sound.
 */
export function findMistakes(state: SubsetsState): readonly SubsetsMistake[] {
  const { w, h } = state;
  const mistakes: SubsetsMistake[] = [];
  if (state.ruledOut.some((r) => r !== 0)) {
    const { solved, result } = solveCopy(state);
    if (result === "complete") {
      for (let i = 0; i < w * h; i++) {
        const value = solved.known[i];
        if (state.ruledOut[i] & (1 << value))
          mistakes.push({ kind: "ruled", pos: i, value });
      }
    }
  }

  const flags = new Uint8Array(w * h);
  const counts = new Int32Array(w * h);
  if (subsetsValidate(state, flags, counts) !== "invalid") return mistakes;

  for (let i = 0; i < w * h; i++) {
    if (state.known[i] === state.mask[i] && counts[state.known[i]] > 1)
      mistakes.push({ kind: "cell", pos: i });
  }
  for (let i = 0; i < w * h; i++) {
    for (let d = 0; d < 4; d++) {
      if (flags[i] & ADJTHAN[d].f) mistakes.push({ kind: "edge", pos: i, dir: d });
    }
  }
  return mistakes;
}

/** Solve a copy of `state`, returning the solved copy and its status — the
 * shared entry for `solve()` and tests. Defaults to the top of the ladder,
 * which is right for the Solve button whatever tier the board was generated
 * at: an Easy board solves at Normal too (the rungs nest). */
export function solveCopy(
  state: SubsetsState,
  maxdiff: number = DIFF_TRICKY,
): {
  solved: SubsetsState;
  result: SubsetsStatus;
} {
  const solved = cloneState(state);
  return { solved, result: subsetsSolveGame(solved, maxdiff) };
}

// --- hint recorder ----------------------------------------------------------
//
// A *parallel recorder* over the same six rules: separate code reusing this
// module's primitives, run **from the player's current marks** (no reset — a
// hint continues from where the player is), emitting the deductions one
// narratable letter-firing at a time. Because `subsetsSolveGame` and
// `subsetsValidate` — the byte-match differential surface — never call any of
// this, the generator's desc is unaffected *by construction*; there is no
// recorder flag on the hot path.
//
// The projection problem: the solver reasons over candidate *set-values*, and
// the player marks letters. Most of what the cube rules out the board already
// says, through the shallow reading the reference aid makes (`canHold`: a
// cell's marks, its horseshoes, and the sets placed elsewhere), so the
// recorder's cube is synced to that reading and needs no record of it. The
// advanced-arrow rule is the exception: it rules a set out of a cell because no
// set that can still go in the neighbor fits it, which no letter can say. Those
// are the rule-out marks (`ruledOut`), and the recorder keeps each one's reason
// (`RuleOutWhy`) so a firing that rests on it places it first.
//
// Confluence makes the one-firing-at-a-time order safe: every rule only *adds*
// information monotonically, so the fixpoint is order-independent — the
// recorder never deduces more than the uniqueness gate vetted.

/** One letter slot a firing decides. */
export interface SubsetsDeductionSet {
  /** Letter index (bit position), `0..n-1`. */
  bit: number;
  type: "known" | "cleared";
}

/** Why a firing is forced. `from`/`to` name an arrow `from -> to` meaning
 * `set(to) ⊆ set(from)` (`from` the superset at the arrow's tail, `to` the
 * subset at its head). */
export type SubsetsReason =
  /** The subset `to`'s confirmed letters propagate up to the superset `from`
   * (`pos === from`). */
  | { kind: "arrowKnown"; from: number; to: number }
  /** The superset `from`'s ruled-out letters propagate down to the subset `to`
   * (`pos === to`). */
  | { kind: "arrowMask"; from: number; to: number }
  /** A *hidden single* (Dominosa `onlySpot` analog): set `value` fits — shallow,
   * from the board — in only the one cell `pos`, so it must go there. The
   * spotlight of `value`'s candidate cells is that single cell. */
  | { kind: "hiddenSingle"; value: number }
  /** A candidate collapse (`bitsFromCube`): the sets that can still go in the
   * cell all agree on the decided letters. `survivors` is that set-value list,
   * read off the board once the firing's rule-outs are marked, so it is what
   * the reference aid shows for the cell. */
  | { kind: "collapse"; survivors: number[] };

/** Why a set-value is ruled out of a cell when the board does not say so: the
 * horseshoe between the cell and `via` leaves it no partner. With `head`, the
 * cell is the horseshoe's subset end and no set that can still go in `via` is
 * a bigger set holding it; otherwise the cell is the superset end and none is
 * a smaller set inside it. */
export interface RuleOutWhy {
  via: number;
  head: boolean;
}

/** A rule-out mark the plan places: set-value `value` out of cell `pos`. */
export interface RuleOutMark {
  pos: number;
  value: number;
  why: RuleOutWhy;
}

/** One recorded firing: the cell acted on, the letters it decides together
 * (one journey), the deduction that forces them, and the rule-outs it rests
 * on that the board did not show, in the order they must be placed (each
 * after every rule-out its own reason cites). */
export interface SubsetsDeduction {
  pos: number;
  sets: SubsetsDeductionSet[];
  reason: SubsetsReason;
  marks: RuleOutMark[];
}

/** The remaining plan from the player's position. `status` is the board's
 * verdict when the recorder stopped: `complete` means the deductions solve it
 * (which also certifies the position — the rules are monotone, so a wrong mark
 * can only end `invalid` or stall `unfinished`). */
export interface SubsetsHintPlan {
  status: SubsetsStatus;
  deductions: SubsetsDeduction[];
}

/** Bit positions set in `mask`, ascending. */
export function bitList(mask: number, n: number): number[] {
  const out: number[] = [];
  for (let b = 0; b < n; b++) if (mask & (1 << b)) out.push(b);
  return out;
}

/** The letter moves that turn cell `pos` into exactly set `value`, in letter
 * order. */
function lettersToPlace(
  state: SubsetsState,
  pos: number,
  value: number,
): SubsetsDeductionSet[] {
  const sets: SubsetsDeductionSet[] = [];
  for (let b = 0; b < state.n; b++) {
    if (value & (1 << b)) {
      if (!(state.known[pos] & (1 << b))) sets.push({ bit: b, type: "known" });
    } else if (state.mask[pos] & (1 << b)) {
      sets.push({ bit: b, type: "cleared" });
    }
  }
  return sets;
}

/** The first arrow with a player-visible letter change, applied and recorded
 * (mirrors `applyArrows`, one side of one arrow at a time). */
function nextArrowFiring(state: SubsetsState): SubsetsDeduction | null {
  const { w, h, n } = state;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let d = 0; d < 4; d++) {
        const i1 = y * w + x;
        if (!(state.clues[i1] & ADJTHAN[d].f)) continue;
        const i2 = i1 + ADJTHAN[d].dy * w + ADJTHAN[d].dx;

        // set(i2) ⊆ set(i1): a letter confirmed in the subset i2 is in i1.
        const gainedKnown = state.known[i2] & ~state.known[i1];
        if (gainedKnown) {
          state.known[i1] |= state.known[i2];
          return {
            pos: i1,
            sets: bitList(gainedKnown, n).map((bit) => ({ bit, type: "known" })),
            reason: { kind: "arrowKnown", from: i1, to: i2 },
            marks: [],
          };
        }
        // A letter ruled out of the superset i1 is ruled out of the subset i2.
        const lostMask = state.mask[i2] & ~state.mask[i1];
        if (lostMask) {
          state.mask[i2] &= state.mask[i1];
          return {
            pos: i2,
            sets: bitList(lostMask, n).map((bit) => ({ bit, type: "cleared" })),
            reason: { kind: "arrowMask", from: i1, to: i2 },
            marks: [],
          };
        }
      }
    }
  }
  return null;
}

/** Drop from the cube every set-value the board already rules out of its cell
 * (`canHold`). This one rule stands in for the solve path's `syncCube`,
 * `cubeSingleCount` and `disjoint`, all of which the shallow reading covers,
 * and for the player's own rule-out marks; none of it needs a record, because
 * a firing resting on it cites only the board. */
function syncToBoard(state: SubsetsState, cube: Uint8Array): void {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  for (let i = 0; i < s; i++) {
    for (let v = 0; v < n2; v++) {
      if (cube[i * n2 + v] && !canHold(state, i, v)) cube[i * n2 + v] = 0;
    }
  }
}

/**
 * `applyArrowsAdvanced`, recording why each set-value it rules out is gone.
 * `strong` adds the head half exactly as the solve path does — and, exactly as
 * there, the recorder reaches for it only once the cheaper vocabulary is
 * exhausted (see {@link deduceHintPlan}).
 */
function recApplyArrowsAdvanced(
  state: SubsetsState,
  cube: Uint8Array,
  why: (RuleOutWhy | null)[],
  strong: boolean,
): number {
  const { w, h } = state;
  const n2 = 1 << state.n;
  let ret = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let d = 0; d < 4; d++) {
        const i1 = y * w + x;
        if (!(state.clues[i1] & ADJTHAN[d].f)) continue;
        const i2 = i1 + ADJTHAN[d].dy * w + ADJTHAN[d].dx;

        for (let sup = 0; sup < n2; sup++) {
          if (!cube[i1 * n2 + sup]) continue;
          let found = false;
          for (let sub = 0; sub < sup && !found; sub++) {
            if ((sup & sub) !== sub || !cube[i2 * n2 + sub]) continue;
            found = true;
          }
          if (!found) {
            cube[i1 * n2 + sup] = 0;
            why[i1 * n2 + sup] = { via: i2, head: false };
            ret++;
          }
        }

        if (!strong) continue;

        for (let sub = 0; sub < n2; sub++) {
          if (!cube[i2 * n2 + sub]) continue;
          let found = false;
          for (let sup = sub + 1; sup < n2 && !found; sup++) {
            if ((sup & sub) !== sub || !cube[i1 * n2 + sup]) continue;
            found = true;
          }
          if (!found) {
            cube[i2 * n2 + sub] = 0;
            why[i2 * n2 + sub] = { via: i1, head: true };
            ret++;
          }
        }
      }
    }
  }
  return ret;
}

/** Shrink the cube to a fixpoint from the board. The board's reading is
 * fixed here (no letter changes), so the sync runs once, and the advanced
 * rule iterates on its own output. */
function shrinkCube(
  state: SubsetsState,
  cube: Uint8Array,
  why: (RuleOutWhy | null)[],
  strong: boolean,
): void {
  syncToBoard(state, cube);
  while (recApplyArrowsAdvanced(state, cube, why, strong)) {}
}

/** The set-values a rule-out's premise needs gone from `why.via`: every bigger
 * set holding `value` for a subset end, every smaller set inside it for a
 * superset end. */
function premiseValues(value: number, why: RuleOutWhy, n2: number): number[] {
  const out: number[] = [];
  for (let v = 0; v < n2; v++) {
    if (v === value) continue;
    if (why.head ? (v & value) === value : (value & v) === v) out.push(v);
  }
  return out;
}

/**
 * Mark on `state` every rule-out that `targets` rest on and the board does not
 * show, each after the rule-outs its own premise needs, and return them in that
 * order. A target the board already rules out needs nothing, and since the
 * board's reading only grows as it fills, one ruled out when the recorder
 * found it stays ruled out.
 */
function markRuleOuts(
  state: SubsetsState,
  why: (RuleOutWhy | null)[],
  targets: { pos: number; value: number }[],
): RuleOutMark[] {
  const n2 = 1 << state.n;
  const out: RuleOutMark[] = [];
  const ensure = (pos: number, value: number): void => {
    if (!canHold(state, pos, value)) return;
    const w = why[pos * n2 + value];
    // Anything else the cube dropped, it dropped because the board says so.
    if (w === null) throw new Error("subsets hint: a rule-out with no reason");
    for (const v of premiseValues(value, w, n2)) ensure(w.via, v);
    state.ruledOut[pos] |= 1 << value;
    out.push({ pos, value, why: w });
  };
  for (const t of targets) ensure(t.pos, t.value);
  return out;
}

/** The first cell whose surviving cube-candidates collapse into a new letter
 * conclusion (`bitsFromCube`), applied and recorded with the rule-outs it
 * rests on. */
function nextCollapseFiring(
  state: SubsetsState,
  cube: Uint8Array,
  why: (RuleOutWhy | null)[],
): SubsetsDeduction | null {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  const n = state.n;
  for (let i = 0; i < s; i++) {
    let newmask = 0;
    let newknown = ~0;
    const survivors: number[] = [];
    for (let nj = 0; nj < n2; nj++) {
      if (cube[i * n2 + nj]) {
        newmask |= nj;
        newknown &= nj;
        survivors.push(nj);
      }
    }
    // A cell with no surviving candidate is a contradiction — the position is
    // unsolvable. Skip it (the hint refuses such boards up front); never emit
    // a garbage firing.
    if (survivors.length === 0) continue;

    const gainedKnown = newknown & ALL_BITS(n) & ~state.known[i];
    const lostMask = state.mask[i] & ~newmask;
    if (!gainedKnown && !lostMask) continue;

    const sets: SubsetsDeductionSet[] = [
      ...bitList(gainedKnown, n).map((bit) => ({ bit, type: "known" as const })),
      ...bitList(lostMask, n).map((bit) => ({ bit, type: "cleared" as const })),
    ];

    // The *culprits* are the ruled-out sets the conclusion needs gone: a Known
    // letter L is forced because every set lacking L is out, a Cleared letter
    // L because every set holding L is. The rest of the cube's eliminations
    // this firing does not rest on, so they are never placed.
    const culprits: { pos: number; value: number }[] = [];
    for (let v = 0; v < n2; v++) {
      if (cube[i * n2 + v]) continue;
      if ((gainedKnown & ~v) !== 0 || (lostMask & v) !== 0)
        culprits.push({ pos: i, value: v });
    }
    const marks = markRuleOuts(state, why, culprits);
    const reason: SubsetsReason = {
      kind: "collapse",
      survivors: candidateSets(state, i),
    };

    state.known[i] |= newknown;
    state.mask[i] &= newmask;
    return { pos: i, sets, reason, marks };
  }
  return null;
}

/**
 * A set placed nowhere with exactly one cube cell left is placed there
 * (`solveSinglePosition`). Once the rule-outs from its other cells are marked,
 * the board shows it has one cell left, so it is spoken as a hidden single.
 */
function nextSinglePosition(
  state: SubsetsState,
  counts: Int32Array,
  cube: Uint8Array,
  why: (RuleOutWhy | null)[],
): SubsetsDeduction | null {
  const s = state.w * state.h;
  const n2 = 1 << state.n;
  for (let nj = 0; nj < n2; nj++) {
    if (counts[nj] !== 0) continue;
    let found = -1;
    for (let i = 0; i < s && found !== -2; i++) {
      if (!cube[i * n2 + nj]) continue;
      found = found === -1 ? i : -2;
    }
    if (found < 0) continue;

    const others: { pos: number; value: number }[] = [];
    for (let i = 0; i < s; i++) if (i !== found) others.push({ pos: i, value: nj });
    const marks = markRuleOuts(state, why, others);
    const sets = lettersToPlace(state, found, nj);
    state.known[found] = nj;
    state.mask[found] = nj;
    return { pos: found, sets, reason: { kind: "hiddenSingle", value: nj }, marks };
  }
  return null;
}

/** Why placing a set in an undecided cell breaks a *visible* rule — the
 * shallow reason a player can see, for the reference aid and the "why not X"
 * hint clause. `null` from {@link whyCantPlace} means it fits. */
export type PlacementBlock =
  /** The cell's own marks forbid it (it lacks a marked letter, or holds a
   * cleared one). */
  | { kind: "marks" }
  /** The player (or a hint step) ruled this set out of the cell. */
  | { kind: "ruledOut" }
  /** The empty set lies inside every set and the full set holds every set, so
   * either one needs every edge of its cell to say so: the empty set a
   * horseshoe pointing into the cell from each neighbor, the full set one
   * pointing out to each. `neighbor` is one whose edge does not. */
  | { kind: "extreme"; neighbor: number }
  /** A horseshoe to decided `neighbor` requires `value` to contain / be
   * contained in the neighbor's set, and it isn't: `mustContain` says which
   * direction, `letters` are the offending letters. */
  | { kind: "arrow"; neighbor: number; mustContain: boolean; letters: number }
  /** A missing horseshoe to decided `neighbor` forbids one set containing the
   * other, but `value` and the neighbor's set are comparable. */
  | { kind: "adjacent"; neighbor: number };

/** The visible rule (if any) that stops `value` sitting in undecided cell `i`,
 * judged shallowly from the board: the cell's letters and rule-outs, the
 * horseshoes around it, and its decided neighbors. */
export function whyCantPlace(
  state: SubsetsState,
  i: number,
  value: number,
): PlacementBlock | null {
  const { w } = state;
  const x = i % w;
  const y = Math.floor(i / w);
  if ((state.known[i] & value) !== state.known[i] || (value & state.mask[i]) !== value)
    return { kind: "marks" };
  if (state.ruledOut[i] & (1 << value)) return { kind: "ruledOut" };
  const full = ALL_BITS(state.n);
  for (let d = 0; d < 4; d++) {
    const x2 = x + ADJTHAN[d].dx;
    const y2 = y + ADJTHAN[d].dy;
    if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= state.h) continue;
    const j = y2 * w + x2;
    if (value === 0 && !(state.clues[j] & ADJTHAN[d].fo))
      return { kind: "extreme", neighbor: j };
    if (value === full && !(state.clues[i] & ADJTHAN[d].f))
      return { kind: "extreme", neighbor: j };
    if (state.known[j] !== state.mask[j]) continue; // only decided neighbors constrain
    const kj = state.known[j];
    if (state.clues[i] & ADJTHAN[d].f) {
      // Arrow i -> j: set(j) ⊆ value — value must contain kj.
      if ((kj & value) !== kj)
        return { kind: "arrow", neighbor: j, mustContain: true, letters: kj & ~value };
    } else if (state.clues[j] & ADJTHAN[d].fo) {
      // Arrow j -> i: value ⊆ set(j) — value must fit inside kj.
      if ((value & kj) !== value)
        return {
          kind: "arrow",
          neighbor: j,
          mustContain: false,
          letters: value & ~kj,
        };
    } else if ((value & kj) === value || (value & kj) === kj) {
      // No arrow: neither may contain the other, but they are comparable.
      return { kind: "adjacent", neighbor: j };
    }
  }
  return null;
}

/**
 * The cells set-value `value` can still legally occupy, judged **shallowly from
 * the board** — the Dominosa "no solver, no solution leak" rule. A **placed**
 * set can go nowhere else, so its decided home
 * cell(s) are returned alone; an **unplaced** set returns every undecided cell
 * where placing it breaks no visible rule (marks + decided-neighbor
 * horseshoes). This powers the reference-aid spotlight and the hidden-single
 * hint.
 */
export function candidateCells(state: SubsetsState, value: number): number[] {
  const s = state.w * state.h;
  const placed: number[] = [];
  for (let i = 0; i < s; i++)
    if (state.known[i] === state.mask[i] && state.known[i] === value) placed.push(i);
  if (placed.length) return placed; // placed already — nowhere else

  const out: number[] = [];
  for (let i = 0; i < s; i++) {
    if (state.known[i] === state.mask[i]) continue; // decided as something else
    if (whyCantPlace(state, i, value) === null) out.push(i);
  }
  return out;
}

/** The reverse of {@link candidateCells}: the set-values that can still go in
 * undecided cell `i` — consistent with its marks and horseshoes, and not
 * already placed elsewhere. A decided cell returns just its own set. */
export function candidateSets(state: SubsetsState, i: number): number[] {
  const n2 = 1 << state.n;
  const out: number[] = [];
  for (let value = 0; value < n2; value++)
    if (canHold(state, i, value)) out.push(value);
  return out;
}

/** Whether set-value `value` can still go in cell `i` as the board reads —
 * membership in {@link candidateSets}, the reference aid's cell view. */
export function canHold(state: SubsetsState, i: number, value: number): boolean {
  if (state.known[i] === state.mask[i]) return state.known[i] === value;
  const s = state.w * state.h;
  for (let k = 0; k < s; k++)
    if (k !== i && state.known[k] === state.mask[k] && state.known[k] === value)
      return false;
  return whyCantPlace(state, i, value) === null;
}

/** A representative excluded competitor of a collapse. `block` is why it can't
 * sit in the cell — a visible on-board rule, or `placed` (it is already on the
 * board, at `cell`). */
export type CollapseExclusion = {
  value: number;
  block:
    | Extract<PlacementBlock, { kind: "arrow" | "adjacent" }>
    | { kind: "placed"; cell: number };
};

/** For a collapse at `cell` (only `survivors` fit), a representative *excluded*
 * competitor and why — a set the player might expect but that a visible rule
 * blocks. Prefers an on-board reason (horseshoe/adjacency) over placement, and
 * a nearest-miss competitor. `null` when nothing illustrative is found. */
export function pickExclusion(
  state: SubsetsState,
  cell: number,
  survivors: number[],
): CollapseExclusion | null {
  const n2 = 1 << state.n;
  const surv = new Set(survivors);
  const s = state.w * state.h;
  const placedAt = (value: number): number => {
    for (let k = 0; k < s; k++)
      if (k !== cell && state.known[k] === state.mask[k] && state.known[k] === value)
        return k;
    return -1;
  };
  // Rank the exclusion reason by how clearly it teaches: an arrow (shows the
  // horseshoe logic) over a placement (concrete counting) over adjacency (the
  // subtle missing-horseshoe rule); ties broken by nearest miss.
  const rankOf = (block: CollapseExclusion["block"]): number =>
    block.kind === "arrow" ? 0 : block.kind === "placed" ? 1 : 2;
  let best: (CollapseExclusion & { rank: number; dist: number }) | null = null;
  for (let value = 0; value < n2; value++) {
    if (surv.has(value)) continue;
    // Only competitors consistent with the cell's own marks are illustrative
    // (a mark-excluded set is visibly impossible already).
    if (
      (state.known[cell] & value) !== state.known[cell] ||
      (value & state.mask[cell]) !== value
    )
      continue;
    let block: CollapseExclusion["block"];
    const home = placedAt(value);
    if (home >= 0) {
      block = { kind: "placed", cell: home };
    } else {
      // A competitor the cell's own marks or rule-outs exclude says nothing
      // the player cannot already see in the cell, and the empty and full
      // sets' rule is the help's to teach, not a clause's.
      const b = whyCantPlace(state, cell, value);
      if (!b || b.kind === "marks" || b.kind === "ruledOut" || b.kind === "extreme")
        continue;
      block = b;
    }
    const rank = rankOf(block);
    let dist = state.n + 1;
    for (const sv of survivors) dist = Math.min(dist, popcount(sv ^ value));
    if (!best || rank < best.rank || (rank === best.rank && dist < best.dist))
      best = { value, block, rank, dist };
  }
  return best ? { value: best.value, block: best.block } : null;
}

function popcount(x: number): number {
  let n = 0;
  let v = x;
  while (v) {
    v &= v - 1;
    n++;
  }
  return n;
}

/** A *hidden single*: an unplaced set with exactly one candidate cell must go
 * there (the whole cell decided at once). Shallow (via {@link candidateCells}),
 * so its "only this cell" claim is verifiable against the reference-aid
 * spotlight. Applied and recorded. */
function nextHiddenSingle(
  state: SubsetsState,
  counts: Int32Array,
): SubsetsDeduction | null {
  const n2 = 1 << state.n;
  for (let value = 0; value < n2; value++) {
    if (counts[value] !== 0) continue; // placed already (or duplicated)
    const cells = candidateCells(state, value);
    if (cells.length !== 1) continue;
    const pos = cells[0];
    const sets = lettersToPlace(state, pos, value);
    if (sets.length === 0) continue;
    state.known[pos] = value;
    state.mask[pos] = value;
    return { pos, sets, reason: { kind: "hiddenSingle", value }, marks: [] };
  }
  return null;
}

/**
 * Record the deduction plan from the player's current marks: continue from the
 * position (no reset of non-given cells), emitting one narratable firing at a
 * time. Rung order surfaces the most teachable form first: horseshoe arrows →
 * **hidden single**
 * (a set with one spot left — the crisp, spotlight-shaped counting) → the
 * cube collapse (a cell with one set left) → a last-place cube placement.
 * Stops at `complete`/`invalid`, or `unfinished` when no rule fires. The two
 * cube rungs carry the rule-outs they rest on (`SubsetsDeduction.marks`), and
 * the player's own rule-outs are facts from the start, as the letters are.
 *
 * `maxdiff` mirrors {@link subsetsSolveGame}'s cap and defaults to the top of
 * the ladder, which is what production wants: the Normal rung is a *fallback*,
 * so a board that never exhausts the cheaper vocabulary never reaches it and an
 * Easy plan is unaffected by the default. Passing `DIFF_EASY` is how a test
 * asserts that rather than assuming it.
 */
export function deduceHintPlan(
  orig: SubsetsState,
  maxdiff: number = DIFF_TRICKY,
): SubsetsHintPlan {
  const work = cloneState(orig);
  const s = work.w * work.h;
  const n2 = 1 << work.n;
  const cube = new Uint8Array(s * n2).fill(1);
  const counts = new Int32Array(s);
  const why: (RuleOutWhy | null)[] = new Array(s * n2).fill(null);
  const budget = stepBudget("subsets hint");

  // Every rung *applies as it detects* (each `next*Firing` writes the letter or
  // clears the mask it found), so the shared loop takes no `apply` callback.
  const nextFiring = (state: SubsetsState): SubsetsDeduction | null => {
    // Rung 1: horseshoe arrows — direct letter propagation, no cube needed.
    const arrow = nextArrowFiring(state);
    if (arrow) return arrow;

    // Rung 2: a hidden single — "this set fits only one cell" (shallow, so the
    // player can verify it with the same spotlight). Tried before the collapse
    // so the crisp counting form wins where it exists.
    const hidden = nextHiddenSingle(state, counts);
    if (hidden) return hidden;

    // Rungs 3+: engage the cube. Shrink it to a fixpoint (the value-only
    // rules), then look for a letter collapse, then a last-place placement.
    // `cube` and `why` both persist across iterations (the cube shrinks
    // monotonically, so an elimination's reason is stable) — refilling `why`
    // would lose the reason for a rule-out found in an earlier iteration.
    shrinkCube(state, cube, why, false);
    const easy =
      nextCollapseFiring(state, cube, why) ??
      nextSinglePosition(state, counts, cube, why);
    if (easy) return easy;

    // Rung 4 (`DIFF_TRICKY`): only once every cheaper rung is exhausted, add
    // the head half of the advanced arrow rule and try the cube again. Reaching
    // for it *last* keeps an Easy board's plan free of it — the cheaper
    // vocabulary never runs out on a board vetted as solvable without it. (The
    // Clusters hint's lookahead rung has the same shape.) Both `next*Firing`
    // calls above returned null without mutating, so re-running them here
    // repeats no work and drops no firing.
    if (maxdiff < DIFF_TRICKY) return null;
    shrinkCube(state, cube, why, true);
    return (
      nextCollapseFiring(state, cube, why) ??
      nextSinglePosition(state, counts, cube, why)
    );
  };

  const { status, plan } = accumulateHintPlan<
    SubsetsState,
    SubsetsDeduction,
    SubsetsStatus
  >({
    board: work,
    // Recounts into `counts`, which rung 2 and the cube shrink both read.
    status: (state) => subsetsValidate(state, null, counts),
    incomplete: "unfinished",
    next: nextFiring,
    budget,
  });
  return { status, deductions: plan };
}
