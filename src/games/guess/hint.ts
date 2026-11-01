/**
 * Guess's hint, in two halves with different standards of proof.
 *
 * **What the scored rows prove** is deduction, and every conclusion is an
 * answer-row mark ("not this color, in this slot"), placed as a move so the
 * player can keep it (`docs/hints-marks.md` § "Give the facts a notation"). The
 * techniques are `guess.description.yaml`'s, compiled: each reads one scored
 * row, a clue the state reveals and rebuilt here on each hint, plus the marks
 * earlier firings made, and each is checked sound against the rules.
 *
 * **What to guess next** is not deduction: a guess is a probe, and choosing one
 * is an information question. So the last step of every plan is a probe, and
 * its sentence claims only what `chooseProbe` has counted — how many answers
 * still fit, that this guess is one of them, and the most it can leave behind.
 *
 * Nothing here reads `state.solution`. The hint knows what the player knows.
 */

import { describedSpace, type GridSpace } from "../../engine/describe-runtime.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { GAME_OVER, SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { claimRelation, judgeRivals } from "../../engine/rival-judging.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as guess from "./guess.compiled.ts";
import { COLOR, type Reason, say } from "./hint-text.ts";
import {
  FEEDBACK_CORRECTPLACE,
  type GuessMove,
  type GuessParams,
  type GuessState,
  outcome,
  type SlotMark,
} from "./state.ts";

/** What a step rests on: its {@link Reason}'s kind. */
export const GUESS_RUNGS = [
  "scoredNothing",
  "noBlack",
  "everyPegScored",
  "noRepeats",
  "blacksForced",
  "blacksAccounted",
  "totalAccounted",
  "onlyAnswer",
  "opening",
  "probe",
  "probeFits",
] as const;
export type GuessRung = (typeof GUESS_RUNGS)[number];

/** What a step points at. */
export interface GuessHighlights {
  /** The scored row the sentence reads ("the striped row"), hatched; empty when
   * it reads none (docs/hints-marks.md § "Hatch the line the sentence names"). */
  line: number[];
  /** Answer-row slots whose marks the step cites, outlined. */
  slots: number[];
  /** Answer-row colors to act on, marked: the rule-outs to set, or the colors
   * a probe enters (one per slot). */
  marked: SlotMark[];
}

/** A scored row as the rules read it. */
interface Scored {
  index: number;
  pegs: readonly number[];
  black: number;
  /** Black plus white: `Σ_c min(#guess_c, #answer_c)`. */
  total: number;
}

/** What a firing reads, and why it rules its colors out. */
interface GuessFiring {
  reason: Reason;
  /** The scored rows it reads, by index. */
  rows: number[];
  /** The answer slots whose marks it leans on. */
  slots: number[];
}

// --- the described ladder ------------------------------------------------

const bit = (color: number): number => 1 << color;

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

/** The scored rows as the description reads them: a clue at the board a
 * row, rebuilt from the state on each hint. */
function dealtOf(p: GuessParams, rows: readonly Scored[]): guess.Dealt {
  return {
    score: {
      n: rows.length,
      peg: rows.map((r) => r.pegs),
      black: rows.map((r) => r.black),
      total: rows.map((r) => r.total),
    },
    ncolors: p.ncolors,
  };
}

/** The answer row as the description's space: a slot a cell. */
const spaceOf = (p: GuessParams): GridSpace => describedSpace(guess.units, p.npegs, 1);

/** The variations a board has on, by the description's names. */
const variationsOf = (p: GuessParams): string[] =>
  p.allowMultiple ? [] : ["no duplicates"];

/** Whether `answer` fits every row of `dealt`, by the rules the description
 * compiles to. */
function fitsEvery(
  p: GuessParams,
  dealt: guess.Dealt,
  answer: readonly number[],
): boolean {
  return guess.isAnswer(answer, spaceOf(p), dealt, variationsOf(p));
}

/** The one color `m` leaves slot `s`, or 0 where it leaves several. */
function settledTo(m: CellMarks, s: number): number {
  const c = m.cand(s);
  return c !== 0 && (c & (c - 1)) === 0 ? 31 - Math.clz32(c) : 0;
}

/** The slots `m` settles to a color row `k` holds, which its score is
 * measured against. */
function settledOf(m: CellMarks, pegs: readonly number[]): number[] {
  const colors = colorCounts(pegs);
  const out: number[] = [];
  for (let s = 0; s < pegs.length; s++) if (colors.has(settledTo(m, s))) out.push(s);
  return out;
}

/** The ladder over the rows `dealt` deals, each firing with what it reads. */
function guessLadder(p: GuessParams, dealt: guess.Dealt): Ladder {
  const { score } = dealt;
  const row = (k: number, reason: Reason, slots: number[] = []): GuessFiring => ({
    reason,
    rows: [k],
    slots,
  });
  return describedLadder(
    guess,
    {
      scoredNothing: compiledRung(guess.scoredNothing, dealt, ({ k }) =>
        row(k, { kind: "scoredNothing" }),
      ),
      noBlack: compiledRung(guess.noBlack, dealt, ({ k }) =>
        row(k, { kind: "noBlack" }),
      ),
      everyPegScored: compiledRung(guess.everyPegScored, dealt, ({ k }) =>
        row(k, { kind: "everyPegScored" }),
      ),
      blacksForced: compiledRung(guess.blacksForced, dealt, ({ k }, _c, _n, m) =>
        row(
          k,
          { kind: "blacksForced", black: score.black[k] },
          score.peg[k].flatMap((c, s) => (c > 0 && m.has(s, c) ? [s] : [])),
        ),
      ),
      blacksAccounted: compiledRung(guess.blacksAccounted, dealt, ({ k, P }) =>
        row(k, { kind: "blacksAccounted", black: score.black[k] }, [...P]),
      ),
      totalAccounted: compiledRung(guess.totalAccounted, dealt, ({ k }, _c, _n, m) =>
        row(
          k,
          { kind: "totalAccounted", total: score.total[k] },
          settledOf(m, score.peg[k]),
        ),
      ),
      noRepeats: uncluedRung(
        guess.noRepeats,
        ({ s }): GuessFiring => ({
          reason: { kind: "noRepeats" },
          rows: [],
          slots: [s],
        }),
      ),
    },
    undefined,
    variationsOf(p),
  );
}

/** One firing of the ladder: why, and the colors it rules out. */
interface Proved extends GuessFiring {
  marks: SlotMark[];
}

/**
 * Everything the scored rows prove, from every color possible in every
 * slot: the hint's knowledge, independent of what the player has marked.
 *
 * The firings come in the ladder's own order, one a pass, and not by
 * `ladderWalk`'s rule of continuing from the last one's slots: a plan here
 * is a few firings over one row, and on every preset, eight seeds each
 * played to the end, the rule had something to choose between 6 times
 * (2026-11-01), too few for it to shape a plan or for its guard to read.
 */
function proved(
  p: GuessParams,
  rows: readonly Scored[],
): {
  firings: Proved[];
  out: Int32Array;
} {
  const all = ((1 << (p.ncolors + 1)) - 1) & ~1;
  const m = new CellMarks(spaceOf(p), all, new Uint8Array(p.npegs));
  m.seed(m.grid);
  m.budget = stepBudget("guess hint");
  const firings: Proved[] = [];
  let group = -1;
  m.recorder = (rec) => {
    if (rec.group !== group) {
      group = rec.group;
      firings.push({ ...(rec.reason as GuessFiring), marks: [] });
    }
    firings[firings.length - 1].marks.push({ pos: rec.x, color: rec.n });
  };
  const { entries } = guessLadder(p, dealtOf(p, rows));
  runLadder(m, ladderTechniques(m, entries, { [SCALE]: 0 }, {}));
  const out = new Int32Array(p.npegs);
  for (let s = 0; s < p.npegs; s++) out[s] = all & ~m.cand(s);
  return { firings, out };
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
 * is what the rows prove). A partial answer that no longer could is pruned;
 * a whole one is judged by the rules.
 */
function enumerate(p: GuessParams, rows: Scored[], out: Int32Array): Enumerated {
  const { npegs, ncolors, allowMultiple } = p;
  const dealt = dealtOf(p, rows);
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
      if (!fitsEvery(p, dealt, cur)) return;
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
): HintResult<GuessMove, GuessHighlights, GuessRung> {
  // Out of guesses, or the answer shown by Solve: the status is lost.
  if (outcome(state) < 0) return { ok: false, error: GAME_OVER };
  const p = state.params;
  const { firings, out } = proved(p, scoredRows(state));
  const board = state.ruledOut.slice();
  const steps: HintStep<GuessMove, GuessHighlights, GuessRung>[] = [];

  for (const f of firings) {
    // A mark the player has already made is not taught again
    // (`docs/hints.md` § "Show only what the board does not already say").
    const place = f.marks.filter((m) => !(board[m.pos] & bit(m.color)));
    if (place.length === 0) continue;
    for (const m of place) board[m.pos] |= bit(m.color);
    const highlights: GuessHighlights = { line: f.rows, slots: f.slots, marked: place };
    // Each rule-out's rival is that color standing in that slot, which the
    // firing proved from the scores cannot be the answer; the only-answer
    // firing proved every other answer misfits a score.
    const relation = claimRelation(judgeRivals(place, 0, () => "lost").claim);
    const words = say(f.reason, highlights, relation);
    steps.push({
      move: { type: "mark", marks: place, ruledOut: true },
      rung: f.reason.kind,
      explanation: words.text,
      words,
      highlights,
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
  const highlights: GuessHighlights = {
    line: [],
    slots: [],
    marked: probe.guess.map((color, pos) => ({ pos, color })),
  };
  // When one answer fits, the enumeration found every other answer misfitting
  // a score: each is a rival guess, and lost.
  const only = probe.fitting === 1;
  const reason = probeReason(probe);
  const words = say(
    reason,
    highlights,
    only
      ? claimRelation(judgeRivals(["every other answer"], 0, () => "lost").claim)
      : null,
  );
  steps.push({
    move: {
      type: "guess",
      pegs: probe.guess,
      holds: ui ? ui.holds.slice() : new Array(p.npegs).fill(false),
    },
    rung: reason.kind,
    explanation: words.text,
    words,
    highlights,
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
  step: HintStep<GuessMove, GuessHighlights>,
  state: GuessState,
): HintStep<GuessMove, GuessHighlights> | null {
  const move = step.move;
  if (move.type !== "mark") return step;
  const live = move.marks.filter((m) => !(state.ruledOut[m.pos] & bit(m.color)));
  if (live.length === 0) return null;
  if (live.length === move.marks.length) return step;
  const hl = step.highlights as GuessHighlights;
  // The words keep naming what is still framed (design D4).
  const keep = new Set(live.map((m) => COLOR.key(m)));
  const words = step.words?.narrow(
    (role, kind, key) => role !== "ring" || kind !== COLOR.name || keep.has(key),
  );
  return {
    ...step,
    move: { ...move, marks: live },
    highlights: { ...hl, marked: live },
    ...(words ? { words, explanation: words.text } : {}),
  };
}
