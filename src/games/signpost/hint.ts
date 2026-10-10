/**
 * Signpost's explained hint: the solver's one rule (`solver.ts`), taken one
 * forced link at a time and told with the reason each rival is ruled out.
 *
 * Three rungs, plainest first:
 *
 * - **follows**: square `k`'s arrow points at square `k + 1`, so they link;
 * - **only next**: of the squares an arrow points at, one alone can come next;
 * - **only before**: of the arrows pointing at a square, one alone can lead in.
 *
 * A rival is ruled out for one of a few reasons, and the sentence names the
 * reasons the rivals of *this* firing have rather than a reason per square: a
 * square the arrow could reach already has one before it, is already in the
 * arrow's own chain (linking would close a loop), or holds a number that
 * cannot come next.
 */

import {
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  narratedStep,
} from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import {
  checkCompletion,
  cloneState,
  DXS,
  DYS,
  inGrid,
  isPointing,
  isValidMove,
  makeLink,
  type SignpostMove,
  type SignpostState,
  updateNumbers,
} from "./state.ts";

/** Why a square cannot be the other end of a link. */
export type Rival = "taken" | "chain" | "number";

/** The rungs a step can be: the firings' kinds, in the order they are tried. */
export const SIGNPOST_RUNGS = ["follows", "onlyNext", "onlyBefore"] as const;
export type SignpostRung = (typeof SIGNPOST_RUNGS)[number];

/** One forced link, from `from`'s arrow into `to`, and what it rests on. */
export interface SignpostFiring {
  kind: SignpostRung;
  from: number;
  to: number;
  /** The squares `from`'s arrow points at, in order (`onlyNext`). */
  line: number[];
  /** The other squares whose arrows point at `to` (`onlyBefore`). */
  others: number[];
  /** Why the rivals are ruled out: each reason at least one of them has. */
  why: Rival[];
  /** The numbers of `from` and `to` (`follows`). */
  k: number;
}

/** What a step shows: the arrow it links from, the square it links to, the
 * line the sentence stripes and the squares it outlines. */
export interface SignpostHint {
  arrow: Point;
  target: Point;
  line: Point[];
  others: Point[];
}

/** The squares `i`'s arrow points at, nearest first. */
function arrowLine(s: SignpostState, i: number): number[] {
  const out: number[] = [];
  const d = s.dirs[i];
  let x = (i % s.w) + DXS[d];
  let y = Math.floor(i / s.w) + DYS[d];
  while (inGrid(s, x, y)) {
    out.push(y * s.w + x);
    x += DXS[d];
    y += DYS[d];
  }
  return out;
}

/** Whether `from` may link into `to`, and if not why, by the solver's own test
 * (`isValidMove`, with its look-ahead on numbered chains) plus the square
 * already having one before it. `null` when it may. */
function rival(s: SignpostState, from: number, to: number): Rival | null {
  const { w } = s;
  const fx = from % w;
  const fy = Math.floor(from / w);
  const tx = to % w;
  const ty = Math.floor(to / w);
  if (s.dsf.equivalent(from, to)) return "chain";
  if (!isValidMove(s, true, fx, fy, tx, ty)) return "number";
  if (s.prev[to] !== -1) return "taken";
  return null;
}

/** The distinct reasons in `rivals`, in a fixed order. */
function reasons(rivals: readonly Rival[]): Rival[] {
  return (["taken", "chain", "number"] as const).filter((r) => rivals.includes(r));
}

function follows(s: SignpostState): SignpostFiring | null {
  for (let k = 1; k < s.n; k++) {
    const from = s.numsi[k];
    const to = s.numsi[k + 1];
    if (from === -1 || to === -1 || s.next[from] !== -1) continue;
    const { w } = s;
    if (!isPointing(s, from % w, Math.floor(from / w), to % w, Math.floor(to / w)))
      continue;
    if (rival(s, from, to) !== null) continue;
    return { kind: "follows", from, to, line: [], others: [], why: [], k };
  }
  return null;
}

function onlyNext(s: SignpostState): SignpostFiring | null {
  for (let from = 0; from < s.n; from++) {
    if (s.next[from] !== -1 || s.nums[from] === s.n) continue;
    const line = arrowLine(s, from);
    const open = line.filter((j) => rival(s, from, j) === null);
    if (open.length !== 1) continue;
    const why = reasons(
      line.flatMap((j) => {
        const r = j === open[0] ? null : rival(s, from, j);
        return r ? [r] : [];
      }),
    );
    return { kind: "onlyNext", from, to: open[0], line, others: [], why, k: 0 };
  }
  return null;
}

function onlyBefore(s: SignpostState): SignpostFiring | null {
  const { w } = s;
  for (let to = 0; to < s.n; to++) {
    if (s.prev[to] !== -1 || s.nums[to] === 1) continue;
    const pointing: number[] = [];
    for (let i = 0; i < s.n; i++) {
      if (isPointing(s, i % w, Math.floor(i / w), to % w, Math.floor(to / w)))
        pointing.push(i);
    }
    // A square already leading somewhere is ruled out as "taken" too: it has
    // the one link it may make.
    const why = (i: number): Rival | null =>
      s.next[i] !== -1 ? "taken" : rival(s, i, to);
    const open = pointing.filter((i) => why(i) === null);
    if (open.length !== 1) continue;
    const others = pointing.filter((i) => i !== open[0]);
    const rivals = others.flatMap((i) => {
      const r = why(i);
      return r ? [r] : [];
    });
    return {
      kind: "onlyBefore",
      from: open[0],
      to,
      line: [],
      others,
      why: reasons(rivals),
      k: 0,
    };
  }
  return null;
}

/** The next forced link on `s`, plainest rung first, or `null`. */
function nextFiring(s: SignpostState): SignpostFiring | null {
  updateNumbers(s);
  return follows(s) ?? onlyNext(s) ?? onlyBefore(s);
}

/**
 * The plan from the player's own links as far as forced links go, a step per
 * link. Refuses only when no link is forced, which on an Unreasonable board
 * is before the end.
 */
export function signpostHint(
  state: SignpostState,
): HintResult<SignpostMove, SignpostHint, SignpostRung> {
  const board = cloneState(state);
  const { plan } = deduceHintPlan({
    board,
    status: (b) => checkCompletion(b, false),
    incomplete: false,
    next: nextFiring,
    apply: (b, f) => {
      makeLink(b, f.from, f.to);
      updateNumbers(b);
    },
    budget: stepBudget("signpost hint"),
  });
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.map((f) => stepOf(state, f)) };
}

function stepOf(
  state: SignpostState,
  f: SignpostFiring,
): HintStep<SignpostMove, SignpostHint, SignpostRung> {
  const { w } = state;
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const highlights: SignpostHint = {
    arrow: at(f.from),
    target: at(f.to),
    // A line of one square is the target alone: nothing to stripe.
    line: f.line.length > 1 ? f.line.map(at) : [],
    others: f.others.map(at),
  };
  return narratedStep({
    move: {
      type: "link",
      fromX: highlights.arrow.x,
      fromY: highlights.arrow.y,
      toX: highlights.target.x,
      toY: highlights.target.y,
    },
    rung: f.kind,
    words: say.firing(f, highlights),
    highlights,
  });
}

/** The step's link, made by the player, completes it; any other move goes
 * its own way. A drag from either end makes the same move. */
export function signpostKeepTrack(
  m: SignpostMove,
  step: HintStep<SignpostMove, SignpostHint>,
): HintTrackVerdict {
  const h = step.highlights;
  if (m.type !== "link" || !h) return "off";
  return m.fromX === h.arrow.x &&
    m.fromY === h.arrow.y &&
    m.toX === h.target.x &&
    m.toY === h.target.y
    ? "completed"
    : "off";
}
