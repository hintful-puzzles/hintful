/**
 * Skeleton's hint, in two halves with different standards of proof
 * (`docs/hints-search.md` § "A hidden answer: marks for what is proved, a
 * count for the guess").
 *
 * **What the scored rows prove** is deduction, and every conclusion is an
 * answer-row mark ("not this digit, in this slot"), placed as a move so the
 * player can keep it. The techniques are `skeleton.description.yaml`'s,
 * compiled, run over the scored rows rebuilt as clues on each hint, and each
 * is checked sound against the rules.
 *
 * **What to guess next** is not deduction: a guess is a probe, so the last
 * step of every plan is one, and its sentence claims only what was counted:
 * how many codes still fit, that this guess is one, and the most it can leave.
 *
 * Nothing here reads `state.code`. The hint knows what the player knows.
 */

import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
} from "../../engine/contract/game.ts";
import { GAME_OVER } from "../../engine/contract/hint-refusal.ts";
import type { MarkKind, Relation, Sentence } from "../../engine/contract/hint-words.ts";
import { describedSpace, type GridSpace } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
} from "../../engine/ladder-runtime.ts";
import {
  pendingRuleOuts,
  type RuleOut,
  ruleOutProgress,
} from "../../engine/mechanics/code-rows.ts";
import { claimRelation, judgeRivals } from "../../engine/rival-judging.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as skeleton from "../../generated/skeleton/code/skeleton.compiled.ts";
import { DIGIT, ROW, SQUARE } from "./hint-marks.ts";
import type { SkeletonMove, SkeletonParams, SkeletonState } from "./state.ts";
import { IN_PLACE, outcome } from "./state.ts";

/** Why a step's digits are out, or which probe it is: the step of
 * `skeleton.description.yaml` that says it, with its terms. */
type Reason =
  | { kind: "absent"; digit: number }
  | { kind: "onlyAnswer"; code: string }
  | { kind: "opening" | "probe"; code: string; fitting: number; worst: number };

/** What a step rests on: its {@link Reason}'s kind. */
export const SKELETON_RUNGS = ["absent", "onlyAnswer", "opening", "probe"] as const;
export type SkeletonRung = (typeof SKELETON_RUNGS)[number];

/** What a step points at. */
export interface SkeletonHighlights {
  /** The scored row the sentence reads, hatched. */
  line: number[];
  /** The answer-row digits the step rules out, ringed. */
  marked: RuleOut[];
  /** The working row's squares a suggested guess goes in, ringed. */
  squares: number[];
}

type Element = number | RuleOut;
const speak = skeleton.voice<Element>({
  kind: DIGIT as MarkKind<Element>,
  kinds: {
    row: ROW as MarkKind<Element>,
    square: SQUARE as MarkKind<Element>,
  },
  value: String,
});

/** A step's sentence. A deduction's "so" claims every rival lost, and only
 * the judging that found them lost (`judged`) may say it; a probe counts. */
function say(r: Reason, h: SkeletonHighlights, judged: Relation | null): Sentence {
  const proved = (): Relation => {
    if (judged === null) throw new Error(`skeleton: a ${r.kind} step with no judging`);
    return judged;
  };
  switch (r.kind) {
    case "absent":
      return speak.sentence(r.kind, {
        ring: h.marked,
        terms: { several: h.marked.length > 1, digit: r.digit },
        marks: { stripes: { row: h.line } },
        relation: proved(),
      });
    case "onlyAnswer":
      return speak.sentence(r.kind, {
        ring: h.squares,
        terms: { code: r.code },
        relation: proved(),
      });
    case "opening":
    case "probe":
      return speak.sentence(r.kind, {
        ring: h.squares,
        terms: { code: r.code, fitting: r.fitting, worst: r.worst },
      });
  }
}

// --- the described ladder ------------------------------------------------

/** The scored rows as the description reads them: a clue at the board a
 * row. */
function dealtOf(state: SkeletonState): skeleton.Dealt {
  const { rows, params } = state;
  return {
    score: {
      n: rows.length,
      peg: rows.map((r) => r.digits),
      mark: rows.map((r) => r.marks),
    },
    nsymbols: params.nsymbols,
  };
}

/** The answer row as the description's space: a slot a cell. */
const spaceOf = (p: SkeletonParams): GridSpace =>
  describedSpace(skeleton.units, p.len, 1);

/** What a firing reads, and why it rules its digits out. */
interface Firing {
  reason: Reason;
  /** The scored row it reads. */
  row: number;
}

function skeletonLadder(dealt: skeleton.Dealt): Ladder {
  return describedLadder(skeleton, dealt, {
    absent: compiledRung(
      skeleton.absent,
      dealt,
      ({ k, s }): Firing => ({
        reason: { kind: "absent", digit: dealt.score.peg[k][s] },
        row: k,
      }),
    ),
  });
}

/** One firing of the ladder, with the digits it rules out. */
interface Proved extends Firing {
  marks: RuleOut[];
}

/**
 * Everything the scored rows prove, from every digit possible in every slot:
 * the hint's knowledge, independent of what the player has marked.
 */
function proved(state: SkeletonState): { firings: Proved[]; out: Int32Array } {
  const p = state.params;
  const all = ((1 << (p.nsymbols + 1)) - 1) & ~1;
  const m = new CellMarks(spaceOf(p), all, new Uint8Array(p.len));
  m.seed(m.grid);
  m.budget = stepBudget("skeleton hint");
  const firings: Proved[] = [];
  let group = -1;
  m.recorder = (rec) => {
    if (rec.group !== group) {
      group = rec.group;
      firings.push({ ...(rec.reason as Firing), marks: [] });
    }
    firings[firings.length - 1].marks.push({ pos: rec.x, value: rec.n });
  };
  const { entries } = skeletonLadder(dealtOf(state));
  runLadder(m, ladderTechniques(m, entries, { [SCALE]: 0 }, {}));
  const out = new Int32Array(p.len);
  for (let s = 0; s < p.len; s++) out[s] = all & ~m.cand(s);
  return { firings, out };
}

// --- the probe -----------------------------------------------------------

/**
 * Every code that fits every scored row, in increasing order, each slot drawn
 * from the digits `out` has not ruled out (which is sound: `out` is what the
 * rows prove), each judged by the rules the description compiles to.
 */
function fitting(state: SkeletonState, out: Int32Array): number[][] {
  const { len, nsymbols } = state.params;
  const dealt = dealtOf(state);
  const space = spaceOf(state.params);
  const codes: number[][] = [];
  const cur: number[] = [];
  const used = new Array<boolean>(nsymbols + 1).fill(false);
  const visit = (pos: number): void => {
    if (pos === len) {
      if (skeleton.isAnswer(cur, space, dealt)) codes.push(cur.slice());
      return;
    }
    for (let d = 1; d <= nsymbols; d++) {
      if (used[d] || out[pos] & (1 << d)) continue;
      used[d] = true;
      cur[pos] = d;
      visit(pos + 1);
      used[d] = false;
    }
    cur.length = pos;
  };
  visit(0);
  return codes;
}

/** Every code that fits every score: what the hint counts, and what the
 * reference lists. */
export const codesFitting = (state: SkeletonState): number[][] =>
  fitting(state, proved(state).out);

/** A score as one number, a base-3 digit a slot. */
function scoreKey(guess: readonly number[], code: readonly number[]): number {
  let key = 0;
  for (let i = guess.length - 1; i >= 0; i--) {
    const mark = guess[i] === code[i] ? IN_PLACE : code.includes(guess[i]) ? 1 : 0;
    key = key * 3 + mark;
  }
  return key;
}

/** The most codes of `codes` that `guess` can leave, over every score it might
 * get but a win. */
function worstLeft(
  guess: readonly number[],
  codes: readonly number[][],
  parts: Int32Array,
): number {
  const win = 3 ** guess.length - 1;
  let worst = 0;
  for (const code of codes) {
    const key = scoreKey(guess, code);
    if (key === win) continue;
    const n = ++parts[key];
    if (n > worst) worst = n;
  }
  parts.fill(0);
  return worst;
}

/** Past this many codes fitting, the probe is the first that fits rather than
 * the one leaving the fewest: choosing costs the square of the count. */
const CHOOSE_AMONG = 2_000;

interface Probe {
  guess: number[];
  fitting: number;
  worst: number;
}

/**
 * The guess to try next: of the codes that fit every score, the one that
 * leaves the fewest whatever it scores, the first in order among equals. A
 * pure function of the scored rows, so a plan recomputed after a mark names
 * the same guess.
 */
function chooseProbe(state: SkeletonState, out: Int32Array): Probe {
  const { len, nsymbols } = state.params;
  const first = state.rows.length === 0;
  const board = `${len}/${nsymbols}`;
  const known = first ? openings.get(board) : undefined;
  if (known) return known;
  const codes = fitting(state, out);
  // The code fits every score it was given, so some code always does.
  if (codes.length === 0) throw new Error("skeleton hint: no code fits the scores");
  const parts = new Int32Array(3 ** len);
  let guess = codes[0];
  let best = worstLeft(guess, codes, parts);
  if (codes.length <= CHOOSE_AMONG) {
    for (const g of codes) {
      const w = worstLeft(g, codes, parts);
      if (w < best) {
        best = w;
        guess = g;
      }
    }
  }
  const probe = { guess, fitting: codes.length, worst: best };
  if (first) openings.set(board, probe);
  return probe;
}

/** The first guess on each board, chosen once: with nothing scored, every
 * code fits, and the choice is the same in every game. */
const openings = new Map<string, Probe>();

function probeReason(probe: Probe, opening: boolean): Reason {
  const code = probe.guess.join("");
  if (probe.fitting === 1) return { kind: "onlyAnswer", code };
  const { fitting, worst } = probe;
  return { kind: opening ? "opening" : "probe", code, fitting, worst };
}

// --- the plan ------------------------------------------------------------

export function skeletonHint(
  state: SkeletonState,
): HintResult<SkeletonMove, SkeletonHighlights, SkeletonRung> {
  // Out of guesses, or the code shown by Solve: the status is lost.
  if (outcome(state) !== 0) return { ok: false, error: GAME_OVER };
  const { firings, out } = proved(state);
  const board = state.ruledOut.slice();
  const steps: HintStep<SkeletonMove, SkeletonHighlights, SkeletonRung>[] = [];

  for (const f of firings) {
    // A mark the player has already made is not taught again
    // (`docs/hints.md` § "Show only what the board does not already say").
    const place = pendingRuleOuts(board, f.marks);
    if (place.length === 0) continue;
    for (const m of place) board[m.pos] |= 1 << m.value;
    const highlights: SkeletonHighlights = {
      line: [f.row],
      marked: place,
      squares: [],
    };
    // Each rule-out's rival is that digit standing in that slot, which the
    // firing proved from the scores cannot be the code.
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
  const reason = probeReason(probe, state.rows.length === 0);
  const highlights: SkeletonHighlights = {
    line: [],
    marked: [],
    squares: probe.guess.map((_, pos) => pos),
  };
  // When one code fits, every other was found to misfit a score: each is a
  // rival guess, and lost.
  const judged =
    reason.kind === "onlyAnswer"
      ? claimRelation(judgeRivals(["every other code"], 0, () => "lost").claim)
      : null;
  const words = say(reason, highlights, judged);
  steps.push({
    move: { type: "guess", digits: probe.guess },
    rung: reason.kind,
    explanation: words.text,
    words,
    highlights,
  });
  return { ok: true, steps };
}

/** `state` is the board *before* `m` (the midend classifies a move before it
 * applies it). */
export function skeletonHintKeepTrack(
  m: SkeletonMove,
  step: HintStep<SkeletonMove>,
  state: SkeletonState,
): HintTrackVerdict {
  const want = step.move;
  if (want.type === "guess") {
    if (m.type !== "guess") return "off";
    return m.digits.every((v, i) => v === want.digits[i]) ? "completed" : "off";
  }
  if (m.type !== "mark" || !m.ruledOut) return "off";
  return ruleOutProgress(state.ruledOut, want.marks, m.marks);
}

/** Drop the marks a stored step would set that are already on the board. */
export function skeletonRefreshHintStep(
  step: HintStep<SkeletonMove, SkeletonHighlights>,
  state: SkeletonState,
): HintStep<SkeletonMove, SkeletonHighlights> | null {
  const move = step.move;
  if (move.type !== "mark") return step;
  const live = pendingRuleOuts(state.ruledOut, move.marks);
  if (live.length === 0) return null;
  if (live.length === move.marks.length) return step;
  // The words keep naming what is still ringed.
  const keep = new Set(live.map((m) => DIGIT.key(m)));
  const words = step.words?.narrow(
    (role, kind, key) => role !== "ring" || kind !== DIGIT.name || keep.has(key),
  );
  return {
    ...step,
    move: { ...move, marks: live },
    highlights: { ...(step.highlights as SkeletonHighlights), marked: live },
    ...(words ? { words, explanation: words.text } : {}),
  };
}
