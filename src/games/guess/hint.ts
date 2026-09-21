/**
 * Guess's hint, in two halves with different standards of proof.
 *
 * **What the scored rows prove** is deduction, and every conclusion is an
 * answer-row mark ("not this color, in this slot"), placed as a move so the
 * player can keep it (`docs/games/hints.md` § "Give the facts a notation"). The
 * rules read one row at a time, plus the marks earlier rules placed, and
 * `guess-hint.test.ts` brute-forces each against every answer the rows allow.
 *
 * **What to guess next** is not deduction: a guess is a probe, and choosing one
 * is an information question. So the last step of every plan is a probe, and
 * its sentence claims only what `chooseProbe` has counted — how many answers
 * still fit, that this guess is one of them, and the most it can leave behind.
 *
 * Nothing here reads `state.solution`. The hint knows what the player knows.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { commonHintRefusal, SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import { type Reason, say } from "./hint-text.ts";
import {
  FEEDBACK_CORRECTPLACE,
  type GuessMove,
  type GuessParams,
  type GuessState,
  type SlotMark,
} from "./state.ts";

/** What a step points at. */
export interface GuessHighlights {
  /** Scored rows the step reasons from, outlined. */
  rows: number[];
  /** Answer-row slots whose marks the step cites, outlined. */
  slots: number[];
  /** Answer-row dots to act on, ringed: the marks to set, or the colors a probe
   * enters (one per slot). */
  dots: SlotMark[];
}

/** A scored row as the rules read it. */
interface Scored {
  index: number;
  pegs: readonly number[];
  black: number;
  /** Black plus white: `Σ_c min(#guess_c, #answer_c)`. */
  total: number;
}

interface Firing {
  reason: Reason;
  marks: SlotMark[];
  rows: number[];
  slots: number[];
}

// --- the facts, as bitmasks ---------------------------------------------

const bit = (color: number): number => 1 << color;

/** Bits `1..ncolors`: every color the answer could hold. */
const everyColor = (p: GuessParams): number => ((1 << (p.ncolors + 1)) - 1) & ~1;

function popcount(mask: number): number {
  let n = 0;
  for (let m = mask; m; m &= m - 1) n++;
  return n;
}

/** The one color a slot can still hold, or `0` if it can hold several. */
function fixedColor(mask: number): number {
  if (popcount(mask) !== 1) return 0;
  return 31 - Math.clz32(mask);
}

function scoredRows(state: GuessState): Scored[] {
  const rows: Scored[] = [];
  for (let i = 0; i < state.nextGo; i++) {
    const { pegs, feedback } = state.guesses[i];
    rows.push({
      index: i,
      pegs,
      black: feedback.filter((f) => f === FEEDBACK_CORRECTPLACE).length,
      total: feedback.filter((f) => f !== 0).length,
    });
  }
  return rows;
}

/** How many of each color a row holds, blanks excluded. */
function colorCounts(pegs: readonly number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const c of pegs) if (c > 0) counts.set(c, (counts.get(c) ?? 0) + 1);
  return counts;
}

/**
 * The deduction rules. Each reads one scored row against what `out` already
 * rules out, and returns the marks it forces that `out` does not have yet —
 * `null` when there are none.
 *
 * `cands(i)` is what slot `i` can still hold. A slot is **fixed** when that is
 * one color, and a row's peg is **open** when its slot can still hold it.
 */
class Rules {
  private readonly all: number;

  constructor(
    private readonly p: GuessParams,
    private readonly out: Int32Array,
  ) {
    this.all = everyColor(p);
  }

  private cands(i: number): number {
    return this.all & ~this.out[i];
  }

  private isOut(pos: number, color: number): boolean {
    return (this.out[pos] & bit(color)) !== 0;
  }

  /** `marks`, less those already known. */
  private fresh(marks: SlotMark[]): SlotMark[] {
    return marks.filter((m) => !this.isOut(m.pos, m.color));
  }

  /** Every color but `keep`, out of slot `pos`. */
  private fixTo(pos: number, keep: number): SlotMark[] {
    const marks: SlotMark[] = [];
    for (let c = 1; c <= this.p.ncolors; c++) {
      if (c !== keep) marks.push({ pos, color: c });
    }
    return marks;
  }

  private open(row: Scored): number[] {
    const open: number[] = [];
    row.pegs.forEach((c, i) => {
      if (c > 0 && !this.isOut(i, c)) open.push(i);
    });
    return open;
  }

  private fixedMatches(row: Scored): number[] {
    return this.open(row).filter((i) => fixedColor(this.cands(i)) === row.pegs[i]);
  }

  /**
   * The row's black pegs are all accounted for by the slots already fixed to
   * the color it put there, so its other open pegs are all out of place.
   * `b = 0` with nothing fixed is the plain "no black pegs" reading.
   */
  blacksAccounted(row: Scored, withFixed: boolean): Firing | null {
    const fixed = this.fixedMatches(row);
    if (row.black !== fixed.length || fixed.length > 0 !== withFixed) return null;
    const marks = this.fresh(
      this.open(row)
        .filter((i) => !fixed.includes(i))
        .map((pos) => ({ pos, color: row.pegs[pos] })),
    );
    if (marks.length === 0) return null;
    const reason: Reason = withFixed
      ? { kind: "blacksAccounted", black: row.black }
      : { kind: "noBlack" };
    return { reason, marks, rows: [row.index], slots: fixed };
  }

  /**
   * Exactly as many of the row's pegs are open as it scored black, so every
   * open one is right.
   *
   * This is also the whole of what a row of one color proves about where that
   * color goes: such a row's blacks *are* its color's count in the answer, so
   * "only that many slots can still hold it" is this rule, not a second one.
   * A separate reading was written and the census found it never fired.
   */
  blacksForced(row: Scored): Firing | null {
    const open = this.open(row);
    if (row.black === 0 || open.length !== row.black) return null;
    const marks = this.fresh(open.flatMap((pos) => this.fixTo(pos, row.pegs[pos])));
    if (marks.length === 0) return null;
    return {
      reason: { kind: "blacksForced", black: row.black },
      marks,
      rows: [row.index],
      slots: open,
    };
  }

  /**
   * The slots already fixed account for the row's whole score, so none of its
   * colors appears anywhere but where it is fixed. With nothing fixed this is
   * "the row scored nothing at all".
   *
   * The score is `Σ_c min(#row_c, #answer_c)` and each answer count is at least
   * the fixed count, so equality with `Σ_c min(#row_c, #fixed_c)` forces every
   * term: a color the row holds more of than is fixed occurs in the answer
   * exactly where it is fixed.
   */
  totalAccounted(row: Scored, withFixed: boolean): Firing | null {
    const fixedOf = new Map<number, number[]>();
    for (let i = 0; i < this.p.npegs; i++) {
      const c = fixedColor(this.cands(i));
      if (c) fixedOf.set(c, [...(fixedOf.get(c) ?? []), i]);
    }
    const counts = colorCounts(row.pegs);
    let explained = 0;
    const cited: number[] = [];
    for (const [c, n] of counts) {
      const at = fixedOf.get(c) ?? [];
      explained += Math.min(n, at.length);
      if (at.length > 0) cited.push(...at);
    }
    if (explained !== row.total || explained > 0 !== withFixed) return null;
    const marks: SlotMark[] = [];
    for (const [c, n] of counts) {
      const at = fixedOf.get(c) ?? [];
      if (n <= at.length) continue;
      for (let pos = 0; pos < this.p.npegs; pos++) {
        if (!at.includes(pos)) marks.push({ pos, color: c });
      }
    }
    const fresh = this.fresh(marks);
    if (fresh.length === 0) return null;
    const reason: Reason = withFixed
      ? { kind: "totalAccounted", total: row.total }
      : { kind: "scoredNothing" };
    return {
      reason,
      marks: fresh,
      rows: [row.index],
      slots: cited.sort((a, b) => a - b),
    };
  }

  /** Every peg of the row scored, so the answer is made of the row's colors. */
  everyPegScored(row: Scored): Firing | null {
    if (row.total !== this.p.npegs) return null;
    const used = colorCounts(row.pegs);
    const marks: SlotMark[] = [];
    for (let c = 1; c <= this.p.ncolors; c++) {
      if (used.has(c)) continue;
      for (let pos = 0; pos < this.p.npegs; pos++) marks.push({ pos, color: c });
    }
    const fresh = this.fresh(marks);
    if (fresh.length === 0) return null;
    return {
      reason: { kind: "everyPegScored" },
      marks: fresh,
      rows: [row.index],
      slots: [],
    };
  }

  /** Without repeats, a color fixed in one slot is out of every other. */
  noRepeats(): Firing | null {
    if (this.p.allowMultiple) return null;
    for (let pos = 0; pos < this.p.npegs; pos++) {
      const c = fixedColor(this.cands(pos));
      if (!c) continue;
      const marks: SlotMark[] = [];
      for (let other = 0; other < this.p.npegs; other++) {
        if (other !== pos) marks.push({ pos: other, color: c });
      }
      const fresh = this.fresh(marks);
      if (fresh.length > 0) {
        return { reason: { kind: "noRepeats" }, marks: fresh, rows: [], slots: [pos] };
      }
    }
    return null;
  }
}

/**
 * The first rule that fires, easiest first: the readings a single row gives on
 * its own, then those that also lean on marks already made. Rows are read
 * oldest first within a rule.
 */
function nextFiring(p: GuessParams, rows: Scored[], out: Int32Array): Firing | null {
  const r = new Rules(p, out);
  const perRow: ((row: Scored) => Firing | null)[] = [
    (row) => r.totalAccounted(row, false),
    (row) => r.blacksAccounted(row, false),
    (row) => r.everyPegScored(row),
  ];
  const leaning: ((row: Scored) => Firing | null)[] = [
    (row) => r.blacksForced(row),
    (row) => r.blacksAccounted(row, true),
    (row) => r.totalAccounted(row, true),
  ];
  for (const rule of perRow) {
    for (const row of rows) {
      const f = rule(row);
      if (f) return f;
    }
  }
  const repeats = r.noRepeats();
  if (repeats) return repeats;
  for (const rule of leaning) {
    for (const row of rows) {
      const f = rule(row);
      if (f) return f;
    }
  }
  return null;
}

/**
 * Everything the rules prove from `state`'s scored rows, run to a fixpoint —
 * the hint's knowledge, independent of what the player has marked — and which
 * rules fired to prove it. Exposed for the soundness test and its census.
 */
export function provenRuleOuts(state: GuessState): {
  out: Int32Array;
  fired: Reason[];
} {
  const out = new Int32Array(state.params.npegs);
  const rows = scoredRows(state);
  const fired: Reason[] = [];
  for (
    let f = nextFiring(state.params, rows, out);
    f;
    f = nextFiring(state.params, rows, out)
  ) {
    for (const m of f.marks) out[m.pos] |= bit(m.color);
    fired.push(f.reason);
  }
  return { out, fired };
}

// --- the probe -----------------------------------------------------------

/** Past this many answers still fitting, the probe is not enumerated. */
const ENUMERATION_CAP = 40_000;
/** Nodes the enumeration may visit before giving up on completeness. */
const NODE_BUDGET = 4_000_000;
/**
 * Past this many answers, the probe is the first that fits rather than the one
 * leaving the fewest behind: choosing costs the square of the count. Measured
 * over every Standard answer and 2,048 Super ones (2026-09-21): the first that
 * fits needs up to 9 guesses on Standard and 11 on Super, choosing among at
 * most 1,500 needs 6 and 8, against limits of 10 and 12.
 */
const CHOOSE_AMONG = 1_500;

interface Enumerated {
  answers: number[][];
  /** False when the cap or the budget cut the enumeration short. */
  complete: boolean;
}

/**
 * Every answer that fits every scored row, in lexicographic order, with each
 * slot drawn only from colors `out` has not ruled out (which is sound: `out`
 * is what the rows prove).
 */
function enumerate(p: GuessParams, rows: Scored[], out: Int32Array): Enumerated {
  const { npegs, ncolors, allowMultiple } = p;
  const answers: number[][] = [];
  const cur = new Array<number>(npegs).fill(0);
  const blacks = new Array<number>(rows.length).fill(0);
  const counts = new Array<number>(ncolors + 1).fill(0);
  const rowCounts = rows.map((r) => colorCounts(r.pegs));
  let nodes = 0;
  let complete = true;

  /** Whether the pegs placed so far could still earn each row its score. */
  const viable = (placed: number): boolean => {
    const left = npegs - placed;
    for (let r = 0; r < rows.length; r++) {
      const { black, total } = rows[r];
      if (blacks[r] > black || blacks[r] + left < black) return false;
      let matched = 0;
      for (const [c, n] of rowCounts[r]) matched += Math.min(n, counts[c]);
      if (matched > total || matched + left < total) return false;
    }
    return true;
  };

  const visit = (pos: number): void => {
    if (!complete) return;
    if (pos === npegs) {
      if (answers.length >= ENUMERATION_CAP) {
        complete = false;
        return;
      }
      answers.push(cur.slice());
      return;
    }
    for (let c = 1; c <= ncolors; c++) {
      if (out[pos] & bit(c)) continue;
      if (!allowMultiple && counts[c] > 0) continue;
      if (++nodes > NODE_BUDGET) {
        complete = false;
        return;
      }
      cur[pos] = c;
      counts[c]++;
      for (let r = 0; r < rows.length; r++) if (rows[r].pegs[pos] === c) blacks[r]++;
      if (viable(pos + 1)) visit(pos + 1);
      for (let r = 0; r < rows.length; r++) if (rows[r].pegs[pos] === c) blacks[r]--;
      counts[c]--;
      if (!complete) return;
    }
  };
  visit(0);
  return { answers, complete };
}

/**
 * The most answers `guess` can leave standing, over every score it might get
 * other than winning. A score is keyed as `black * (npegs + 1) + total`.
 *
 * Written against scratch arrays rather than `markPegs`: choosing a probe
 * scores up to {@link CHOOSE_AMONG} squared pairs, and an allocation per pair
 * is most of the cost.
 */
function worstLeft(
  guess: readonly number[],
  answers: number[][],
  ncolors: number,
): number {
  const npegs = guess.length;
  const win = npegs * (npegs + 1) + npegs;
  const parts = new Int32Array((npegs + 1) * (npegs + 1));
  const g = new Int32Array(ncolors + 1);
  for (const c of guess) g[c]++;
  const a = new Int32Array(ncolors + 1);
  for (const answer of answers) {
    a.fill(0);
    let black = 0;
    for (let i = 0; i < npegs; i++) {
      if (guess[i] === answer[i]) black++;
      a[answer[i]]++;
    }
    let total = 0;
    for (let c = 1; c <= ncolors; c++) total += Math.min(g[c], a[c]);
    parts[black * (npegs + 1) + total]++;
  }
  let worst = 0;
  parts.forEach((n, key) => {
    if (key !== win && n > worst) worst = n;
  });
  return worst;
}

/** The first guess of a game with repeats, when every answer fits: two of each
 * color from four pegs up, else one each. Without repeats a pair is not a legal
 * guess, and the opening goes through the ordinary choice in `chooseProbe`. */
function opening(p: GuessParams): number[] {
  const pairs = p.npegs >= 4;
  return Array.from({ length: p.npegs }, (_, i) =>
    Math.min(pairs ? Math.floor(i / 2) + 1 : i + 1, p.ncolors),
  );
}

interface Probe {
  guess: number[];
  /** Answers still fitting, or `null` when too many to count. */
  fitting: number | null;
  /** The most `guess` can leave, or `null` when not counted. */
  worst: number | null;
  opening: boolean;
}

/**
 * The guess to try next. Always one that fits every score (so it could win),
 * chosen to leave the fewest answers standing whatever it scores when there are
 * few enough to compare — except the very first guess, where every answer fits
 * and a fixed spread of colors does as well as any.
 *
 * A pure function of the scored rows: recomputed after any move but a guess, it
 * names the same guess, which is what keeps a plan from swinging
 * (`hint-resume.test.ts`).
 */
function chooseProbe(state: GuessState, out: Int32Array): Probe | null {
  const p = state.params;
  const rows = scoredRows(state);
  const { answers, complete } = enumerate(p, rows, out);
  if (answers.length === 0) return null;
  if (!complete)
    return { guess: answers[0], fitting: null, worst: null, opening: false };
  let guess = answers[0];
  if (rows.length === 0 && p.allowMultiple) guess = opening(p);
  else if (answers.length <= CHOOSE_AMONG) {
    let best = Number.POSITIVE_INFINITY;
    for (const g of answers) {
      const w = worstLeft(g, answers, p.ncolors);
      if (w < best) {
        best = w;
        guess = g;
      }
    }
  }
  return {
    guess,
    fitting: answers.length,
    worst: worstLeft(guess, answers, p.ncolors),
    opening: rows.length === 0,
  };
}

// --- the plan ------------------------------------------------------------

export function guessHint(
  state: GuessState,
  ui?: { holds: boolean[] },
): HintResult<GuessMove> {
  const refusal = commonHintRefusal(state.solved !== 0, 0);
  if (refusal) return refusal;
  const p = state.params;
  const rows = scoredRows(state);
  const out = new Int32Array(p.npegs);
  const board = state.ruledOut.slice();
  const steps: HintStep<GuessMove, GuessHighlights>[] = [];

  for (let f = nextFiring(p, rows, out); f; f = nextFiring(p, rows, out)) {
    for (const m of f.marks) out[m.pos] |= bit(m.color);
    // A mark the player has already made is not taught again
    // (`docs/games/hints.md` § "Show only what the board does not already say").
    const place = f.marks.filter((m) => !(board[m.pos] & bit(m.color)));
    if (place.length === 0) continue;
    for (const m of place) board[m.pos] |= bit(m.color);
    steps.push({
      move: { type: "mark", marks: place, ruledOut: true },
      explanation: say(f.reason),
      highlights: { rows: f.rows, slots: f.slots, dots: place },
    });
  }

  const probe = chooseProbe(state, out);
  if (!probe) {
    // Unreachable on a sound board — the answer always fits — but a huge custom
    // board can exhaust the enumeration budget before finding it.
    return steps.length > 0
      ? { ok: true, steps }
      : { ok: false, error: SEARCH_OUT_OF_REACH };
  }
  steps.push({
    move: {
      type: "guess",
      pegs: probe.guess,
      holds: ui ? ui.holds.slice() : new Array(p.npegs).fill(false),
    },
    explanation: say(probeReason(probe)),
    highlights: {
      rows: [],
      slots: [],
      dots: probe.guess.map((color, pos) => ({ pos, color })),
    },
  });
  return { ok: true, steps };
}

function probeReason(probe: Probe): Reason {
  const { fitting, worst } = probe;
  if (fitting === null || worst === null) return { kind: "probeFits" };
  if (fitting === 1) return { kind: "onlyAnswer" };
  if (probe.opening) return { kind: "opening", fitting, worst };
  return { kind: "probe", fitting, worst };
}

const sameMark = (a: SlotMark, b: SlotMark): boolean =>
  a.pos === b.pos && a.color === b.color;

/** `state` is the board *before* `m` (the midend classifies a move before it
 * applies it). */
export function guessHintKeepTrack(
  m: GuessMove,
  step: HintStep<GuessMove>,
  state: GuessState,
): HintTrackVerdict {
  const want = step.move;
  if (want.type === "guess") {
    if (m.type !== "guess") return "off";
    return m.pegs.every((c, i) => c === want.pegs[i]) ? "completed" : "off";
  }
  if (want.type !== "mark" || m.type !== "mark" || !m.ruledOut) return "off";
  if (!m.marks.every((x) => want.marks.some((y) => sameMark(x, y)))) return "off";
  const pending = want.marks.filter((x) => !(state.ruledOut[x.pos] & bit(x.color)));
  return pending.every((x) => m.marks.some((y) => sameMark(x, y)))
    ? "completed"
    : "onTrack";
}

/** Drop the marks a stored step would set that are already on the board. */
export function guessRefreshHintStep(
  step: HintStep<GuessMove>,
  state: GuessState,
): HintStep<GuessMove> | null {
  const move = step.move;
  if (move.type !== "mark") return step;
  const live = move.marks.filter((m) => !(state.ruledOut[m.pos] & bit(m.color)));
  if (live.length === 0) return null;
  if (live.length === move.marks.length) return step;
  const hl = step.highlights as GuessHighlights;
  return {
    ...step,
    move: { ...move, marks: live },
    highlights: { ...hl, dots: live },
  };
}
