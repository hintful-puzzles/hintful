/**
 * Subsets' solver: the ladder `subsets.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), the hint plan
 * read off its firings, and the board's validator.
 *
 * The marks hold each square's set as one more than the number its letters
 * add up to, and a square's candidates are the sets it may still hold. The
 * player marks letters, which are what the sets a square may hold agree on.
 *
 * **The tiers are the generator's**: it keeps a square blank only while the
 * ladder, capped at the board's tier, still finishes it. Easy is upstream's
 * compiled strength; Normal adds `bigger`, the half of upstream's advanced
 * arrow rule that it wrote, commented out and never compiled.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  PLACE,
  rangeMask,
  STRIKE,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
  uncluedPlacingRung,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  ADJTHAN,
  ALL_BITS,
  cloneState,
  DIFF_NORMAL,
  type SubsetsMistake,
  type SubsetsState,
} from "./state.ts";
import * as subsets from "./subsets.compiled.ts";

export type SubsetsStatus = "complete" | "unfinished" | "invalid";

/**
 * Classify the board (upstream `subsets_validate`): `complete` when every
 * cell is decided and the description's rules hold of it, which its answer
 * check says (`isAnswer`), `invalid` on a duplicated placement or a
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

  // Whether a whole board is solved is the rules' to say.
  if (ret === "complete" && !isAnswer(state)) return "invalid";
  return ret;
}

// --- the board as the description reads it -----------------------------------

/** Every set as the marks hold it: set `v` is value `v + 1`, since the marks
 * hold no value 0. */
const SETS = rangeMask(1, 16);

/** The last board size's space, which every solve reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(subsets.units, w, h);
  return lastSpace;
}

/** Whether the horseshoe between squares `a` and `b`, side by side, opens
 * toward `b`: `a`'s set holds `b`'s. */
function opensToward(s: SubsetsState, a: number, b: number): boolean {
  const dx = (b % s.w) - (a % s.w);
  const dy = Math.floor(b / s.w) - Math.floor(a / s.w);
  const dir = ADJTHAN.find((d) => d.dx === dx && d.dy === dy);
  return dir !== undefined && (s.clues[a] & dir.f) !== 0;
}

/** The board as the description deals it: every edge's horseshoe, 1 where its
 * first square's set holds the second's, 2 the other way, 0 for none. */
function dealtOf(s: SubsetsState): subsets.Dealt {
  const sp = spaceOf(s.w, s.h);
  const v = sp.edges.map((e) => {
    const a = sp.edgeEnds[2 * e];
    const b = sp.edgeEnds[2 * e + 1];
    return opensToward(s, a, b) ? 1 : opensToward(s, b, a) ? 2 : 0;
  });
  return { shoe: clueList(sp.edges, v, sp.edgeEnds.length / 2) };
}

/** Whether square `i`'s letters are all decided. */
const decided = (s: SubsetsState, i: number): boolean => s.known[i] === s.mask[i];

/** The value the description reads in each square: its set's where its
 * letters are all decided, or none. */
function decidedGrid(s: SubsetsState): Uint8Array {
  return Uint8Array.from(s.known, (k, i) => (decided(s, i) ? k + 1 : 0));
}

/** Whether a board's letters are its answer, by the description's rules. */
function isAnswer(s: SubsetsState): boolean {
  return subsets.isAnswer(decidedGrid(s), spaceOf(s.w, s.h), dealtOf(s));
}

/** Why a technique struck or placed a set, as the hint reads it: the
 * horseshoe a carried letter crosses, from its open end `from` to its closed
 * end `to`; the neighbor `via` that leaves a set no smaller or bigger partner;
 * the set only one square can hold; or what the board itself shows. */
type SubsetsFiring =
  | { kind: "carryIn" | "carryOut"; from: number; to: number; letters: number }
  | { kind: "smaller" | "bigger"; via: number }
  | { kind: "onlyCell"; value: number }
  | { kind: "board" };

/** The reason of a firing whose strikes the board shows by itself. */
const BOARD: SubsetsFiring = { kind: "board" };

/** The ladder over the dealt horseshoes, each technique with its reason. */
function subsetsLadder(dl: subsets.Dealt): Ladder {
  return describedLadder(subsets, {
    placed: uncluedPlacingRung(subsets.placed),
    carryIn: compiledRung(
      subsets.carryIn,
      dl,
      ({ a, b, K }): SubsetsFiring => ({ kind: "carryIn", from: a, to: b, letters: K }),
    ),
    carryOut: compiledRung(
      subsets.carryOut,
      dl,
      ({ a, b, L }): SubsetsFiring => ({
        kind: "carryOut",
        from: a,
        to: b,
        letters: L,
      }),
    ),
    noShoe: compiledRung(subsets.noShoe, dl, () => BOARD),
    noShoeBeside: compiledRung(subsets.noShoeBeside, dl, () => BOARD),
    lone: uncluedRung(subsets.lone, () => BOARD),
    onlyCell: uncluedRung(
      subsets.onlyCell,
      ({ d }): SubsetsFiring => ({ kind: "onlyCell", value: d - 1 }),
    ),
    smaller: compiledRung(
      subsets.smaller,
      dl,
      ({ b }): SubsetsFiring => ({ kind: "smaller", via: b }),
    ),
    bigger: compiledRung(
      subsets.bigger,
      dl,
      ({ a }): SubsetsFiring => ({ kind: "bigger", via: a }),
    ),
  });
}

/** The letters every set in the candidate mask `cand` has, and those any
 * has: what the player's marks show of it. */
function lettersOf(cand: number): { known: number; mask: number } {
  let known = ALL_BITS(4);
  let mask = 0;
  for (let c = cand; c !== 0; c &= c - 1) {
    const v = 31 - Math.clz32(c & -c) - 1;
    known &= v;
    mask |= v;
  }
  return { known, mask };
}

/**
 * Solve `state` from its givens, mutating it: every square not given is
 * reset, the ladder the description states runs to a fixpoint at `maxdiff`,
 * and each square's letters are written from the sets it can still hold.
 * Callers pass a clone when they need the original preserved.
 *
 * `maxdiff` caps the ladder: {@link DIFF_EASY} runs every technique but the
 * one that asks the open end of a horseshoe for a bigger set, which
 * {@link DIFF_NORMAL} adds. Required, not defaulted: an implicit cap is how a
 * caller silently measures the wrong tier.
 */
export function subsetsSolveGame(
  state: SubsetsState,
  maxdiff: number,
  firings?: FiringTally,
): SubsetsStatus {
  const s = state.w * state.h;
  for (let i = 0; i < s; i++) {
    if (state.immutable[i]) continue;
    state.known[i] = 0;
    state.mask[i] = ALL_BITS(state.n);
  }
  const sp = spaceOf(state.w, state.h);
  const dl = dealtOf(state);
  const ladder = subsetsLadder(dl);
  const m = new CellMarks(sp, SETS, decidedGrid(state));
  m.placing = ladder.placing;
  if (!m.seed(m.grid)) return "invalid";
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: maxdiff }, {});
  const broken = runLadder(m, techniques, { firings });
  for (let i = 0; i < s; i++) {
    if (state.immutable[i]) continue;
    const { known, mask } = lettersOf(m.cands[i]);
    // A square that can hold no set is never read as decided.
    state.known[i] = m.cands[i] === 0 ? ALL_BITS(state.n) : known;
    state.mask[i] = m.cands[i] === 0 ? 0 : mask;
  }
  if (broken) return "invalid";
  if (m.grid.includes(0)) return "unfinished";
  return subsets.isAnswer(m.grid, sp, dl) ? "complete" : "invalid";
}

// --- findMistakes: the rule validator's error set ----------------------------

/**
 * The Check & Save mistake set: exactly what upstream's own error display
 * highlights — every set-value fully placed in more than one cell (each
 * offending cell flagged), and every edge whose horseshoe or
 * missing-horseshoe relation two decided cells violate — a rule-based check
 * matching the C's live `COL_ERROR` verdicts — and what only the solution
 * can judge: every letter marked or crossed out against it, and every
 * rule-out of the set it puts in that cell. A wrong letter need break no
 * rule, and the hint reads letters and rule-outs alike as facts, so this is
 * what makes that sound.
 */
export function findMistakes(state: SubsetsState): readonly SubsetsMistake[] {
  const { w, h, n } = state;
  const mistakes: SubsetsMistake[] = [];
  // The solver resets what the player marked and derives it again.
  const { solved, result } = solveCopy(state);
  if (result === "complete") {
    for (let i = 0; i < w * h; i++) {
      const value = solved.known[i];
      const decided = state.known[i] | (ALL_BITS(n) & ~state.mask[i]);
      const wrong = (state.known[i] ^ value) & decided;
      for (let bit = 0; bit < n; bit++)
        if (wrong & (1 << bit)) mistakes.push({ kind: "letter", pos: i, bit });
      if (state.ruledOut[i] & (1 << value))
        mistakes.push({ kind: "ruled", pos: i, value });
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
  maxdiff: number = DIFF_NORMAL,
): {
  solved: SubsetsState;
  result: SubsetsStatus;
} {
  const solved = cloneState(state);
  return { solved, result: subsetsSolveGame(solved, maxdiff) };
}

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
  why: ReadonlyMap<number, RuleOutWhy>,
  targets: { pos: number; value: number }[],
): RuleOutMark[] {
  const n2 = 1 << state.n;
  const out: RuleOutMark[] = [];
  const ensure = (pos: number, value: number): void => {
    if (!canHold(state, pos, value)) return;
    const w = why.get(keyOf(pos, value));
    // Anything else a technique struck, the board shows once the steps before
    // it are taken.
    if (w === undefined) throw new Error("subsets hint: a rule-out with no reason");
    for (const v of premiseValues(value, w, n2)) ensure(w.via, v);
    state.ruledOut[pos] |= 1 << value;
    out.push({ pos, value, why: w });
  };
  for (const t of targets) ensure(t.pos, t.value);
  return out;
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

// --- the hint plan ------------------------------------------------------------
//
// The plan walks the compiled ladder's firings (`ladderWalk`) on marks read off
// the player's board: each square may hold the sets its own letters and
// rule-outs let it, and a decided square holds its set. What a neighbor's set
// rules out is the ladder's to find, so a letter a horseshoe carries is spoken
// as the horseshoe's, never as a collapse. A firing strikes sets, and the player marks
// letters, so a step is a square whose remaining sets now agree on more of its
// letters than it shows. A horseshoe's carried letters are spoken as the
// horseshoe's, and a set only one square can hold as a hidden single; anything
// else a square's remaining sets decide is a collapse. Every such step is taken
// as soon as its firing is made, so a square's letters always say what its
// remaining sets agree on, and a technique that reads a neighbor's letters reads
// the board. Of the techniques, only `smaller` and `bigger` strike a set the
// board cannot show; each such strike is kept with its reason, and where a step
// rests on one, a rule-out mark of its own is placed before it
// (`markRuleOuts`).

/** Whether square `i`'s own letters and rule-outs let it hold set `value`. */
const marksAllow = (s: SubsetsState, i: number, value: number): boolean =>
  (s.known[i] & value) === s.known[i] &&
  (value & s.mask[i]) === value &&
  !(s.ruledOut[i] & (1 << value));

/** A set's key among the plan's kept reasons. */
const keyOf = (pos: number, value: number): number => pos * 16 + value;

/** The cells a firing's premise reads, which the walk continues from: the
 * squares it strikes or places in, and the neighbor its reason reads. */
function readsOf(t: Taken): number[] {
  const out: number[] = [];
  for (let i = 0; i < t.facts.length; i += 3) out.push(t.facts[i + 1]);
  const r = t.reasons[0] as SubsetsFiring | undefined;
  if (r?.kind === "carryIn" || r?.kind === "carryOut") out.push(r.from, r.to);
  else if (r?.kind === "smaller" || r?.kind === "bigger") out.push(r.via);
  return out;
}

/** The step a horseshoe's carried letters make: present at the open end, or
 * cleared at the closed end. */
function carryStep(
  board: SubsetsState,
  r: Extract<SubsetsFiring, { kind: "carryIn" | "carryOut" }>,
): SubsetsDeduction | null {
  const inward = r.kind === "carryIn";
  const pos = inward ? r.from : r.to;
  const letters = inward
    ? r.letters & ~board.known[pos]
    : r.letters & board.mask[pos] & ALL_BITS(board.n);
  if (letters === 0) return null;
  if (inward) board.known[pos] |= letters;
  else board.mask[pos] &= ~letters;
  return {
    pos,
    sets: bitList(letters, board.n).map((bit) => ({
      bit,
      type: inward ? ("known" as const) : ("cleared" as const),
    })),
    reason: { kind: inward ? "arrowKnown" : "arrowMask", from: r.from, to: r.to },
    marks: [],
  };
}

/** The step placing set `value`, which only square `pos` can hold, with the
 * rule-outs it rests on from every other square. */
function hiddenSingleStep(
  board: SubsetsState,
  why: ReadonlyMap<number, RuleOutWhy>,
  pos: number,
  value: number,
): SubsetsDeduction | null {
  const sets = lettersToPlace(board, pos, value);
  if (sets.length === 0) return null;
  const others: { pos: number; value: number }[] = [];
  for (let i = 0; i < board.w * board.h; i++)
    if (i !== pos) others.push({ pos: i, value });
  const marks = markRuleOuts(board, why, others);
  board.known[pos] = value;
  board.mask[pos] = value;
  return { pos, sets, reason: { kind: "hiddenSingle", value }, marks };
}

/** The step square `i` makes where the sets it may still hold on `m` agree on
 * more of its letters than it shows: a collapse, with the rule-outs it rests
 * on. Its letters are what the sets the step outlines agree on, which the
 * board may narrow further than `m` (a decided neighbor's horseshoe), and `m`
 * is narrowed with it. */
function collapseStep(
  board: SubsetsState,
  why: ReadonlyMap<number, RuleOutWhy>,
  m: CellMarks,
  i: number,
): SubsetsDeduction | null {
  if (m.cands[i] === 0 || decided(board, i)) return null;
  const moved = lettersOf(m.cands[i]);
  if ((moved.known & ~board.known[i]) === 0 && (board.mask[i] & ~moved.mask) === 0)
    return null;
  for (let v = 0; v < 16; v++) if (!canHold(board, i, v)) m.strikeAt(i, v + 1);
  const cand = m.cands[i];
  if (cand === 0) return null;
  const { known, mask } = lettersOf(cand);
  const gainedKnown = known & ~board.known[i];
  const lostMask = board.mask[i] & ~mask;
  const sets: SubsetsDeductionSet[] = [
    ...bitList(gainedKnown, board.n).map((bit) => ({ bit, type: "known" as const })),
    ...bitList(lostMask, board.n).map((bit) => ({ bit, type: "cleared" as const })),
  ];
  // The *culprits* are the struck sets the conclusion needs gone: a letter
  // marked present is forced because every set lacking it is gone, a letter
  // cleared because every set holding it is.
  const culprits: { pos: number; value: number }[] = [];
  for (let v = 0; v < 16; v++) {
    if ((cand >> (v + 1)) & 1) continue;
    if ((gainedKnown & ~v) !== 0 || (lostMask & v) !== 0)
      culprits.push({ pos: i, value: v });
  }
  const marks = markRuleOuts(board, why, culprits);
  const reason: SubsetsReason = {
    kind: "collapse",
    survivors: candidateSets(board, i),
  };
  board.known[i] |= gainedKnown;
  board.mask[i] &= mask;
  return { pos: i, sets, reason, marks };
}

/**
 * Record the deduction plan from the player's current marks: continue from the
 * position (no reset of non-given cells), one narratable step at a time, each
 * read off the compiled ladder's firings as `ladderWalk` takes them. Stops at
 * `complete`/`invalid`, or `unfinished` when no technique fires. The player's
 * own rule-outs are facts from the start, as the letters are.
 *
 * `maxdiff` caps the ladder and defaults to its top, which is what production
 * wants: the walk takes a Normal firing only where no Easy one is left, so an
 * Easy plan is unaffected by the default. Passing `DIFF_EASY` is how a test
 * asserts that rather than assuming it.
 */
export function deduceHintPlan(
  orig: SubsetsState,
  maxdiff: number = DIFF_NORMAL,
): SubsetsHintPlan {
  const board = cloneState(orig);
  const plan: SubsetsDeduction[] = [];
  if (subsetsValidate(board) === "invalid")
    return { status: "invalid", deductions: plan };
  const ladder = subsetsLadder(dealtOf(board));
  const m = new CellMarks(spaceOf(board.w, board.h), SETS, decidedGrid(board));
  m.placing = ladder.placing;
  if (!m.seed(m.grid)) return { status: "invalid", deductions: plan };
  for (let i = 0; i < m.cands.length; i++)
    for (let v = 0; v < 16; v++)
      if (!decided(board, i) && !marksAllow(board, i, v)) m.cands[i] &= ~(1 << (v + 1));
  m.budget = stepBudget("subsets hint");
  const why = new Map<number, RuleOutWhy>();
  const push = (d: SubsetsDeduction | null): void => {
    if (d !== null) plan.push(d);
  };
  // Every square whose remaining sets now decide more of its letters, those
  // the last firing reached first.
  const settle = (first: readonly number[]): void => {
    const seen = new Set<number>();
    for (const i of [...first, ...m.cands.keys()]) {
      if (seen.has(i)) continue;
      seen.add(i);
      push(collapseStep(board, why, m, i));
    }
  };
  settle([]);
  const walk = ladderWalk(m, ladder.entries, { [TIERS]: maxdiff }, readsOf);
  for (;;) {
    const t = walk.next();
    if (t === "contradiction") return { status: "invalid", deductions: plan };
    if (t === null) break;
    const cells: number[] = [];
    for (let k = 0; k < t.facts.length; k += 3) {
      const at = t.facts[k + 1];
      const r = t.reasons[k / 3] as SubsetsFiring;
      cells.push(at);
      if (t.facts[k] === STRIKE && (r.kind === "smaller" || r.kind === "bigger"))
        why.set(keyOf(at, t.facts[k + 2] - 1), {
          via: r.via,
          head: r.kind === "bigger",
        });
      else if (t.facts[k] === PLACE && r.kind === "onlyCell")
        push(hiddenSingleStep(board, why, at, r.value));
    }
    const r = t.reasons[0] as SubsetsFiring | undefined;
    if (r?.kind === "carryIn" || r?.kind === "carryOut") push(carryStep(board, r));
    settle(cells);
  }
  return { status: subsetsValidate(board), deductions: plan };
}
