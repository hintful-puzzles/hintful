/**
 * Signpost's explained hint: the compiled ladder (`solver.ts`) walked one
 * forced link at a time, and told with the reason each rival is ruled out.
 *
 * Two rungs, plainest first, the description's techniques:
 *
 * - **only next**: of the squares an arrow points at, one alone can come next;
 * - **only before**: of the arrows pointing at a square, one alone can lead in.
 *
 * A number whose arrow points at the next number is no step: the board links
 * the two itself after every move, and the walk's marks do as the board does.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { narratedStep } from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { ladderWalk, type Taken, TIERS } from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import * as signpost from "./signpost.compiled.ts";
import {
  deduction,
  linkValue,
  type SignpostFiring,
  type SignpostRung,
} from "./solver.ts";
import {
  checkCompletion,
  cloneState,
  makeLink,
  type SignpostMove,
  type SignpostState,
  updateNumbers,
} from "./state.ts";

export type { Rival, SignpostFiring, SignpostRung } from "./solver.ts";

/** The rungs a step can be: the description's techniques, in its order. */
export const SIGNPOST_RUNGS: readonly SignpostRung[] = signpost.ladder.map((e) => e.id);

/** What a step shows: the arrow it links from, the square it links to, the
 * line the sentence stripes and the squares it outlines. */
export interface SignpostHint {
  arrow: Point;
  target: Point;
  line: Point[];
  others: Point[];
}

/** The squares a link's premise reads, which a walk continues from: the two
 * it joins, and the squares it ruled out. */
const readsOf = (f: SignpostFiring): number[] => [f.from, f.to, ...f.line, ...f.others];

/** The firing a taken step records: one link a firing. */
const firingOf = (t: Taken): SignpostFiring => t.reasons[0] as SignpostFiring;

/**
 * The plan from the player's own links as far as forced links go, a step per
 * link. Refuses only when no link is forced, which on an Unreasonable board
 * is before the end.
 */
export function signpostHint(
  state: SignpostState,
): HintResult<SignpostMove, SignpostHint, SignpostRung> {
  const d = deduction(state);
  if (d === null) return { ok: false, error: DEDUCTION_EXHAUSTED };
  const { m, ladder } = d;
  m.budget = stepBudget("signpost hint");
  const walk = ladderWalk(
    m,
    ladder.entries,
    { [TIERS]: 0 },
    (t) => readsOf(firingOf(t)),
    {
      writes: (t) => [firingOf(t).from, firingOf(t).to],
    },
  );
  // As `executeMove` leaves the board after each link: the numbers it
  // settles, and the links between consecutive numbers the board then makes
  // itself. Marks without those plan a step for a link the player already
  // has.
  const board = cloneState(state);
  const plan: SignpostFiring[] = [];
  for (;;) {
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    const f = firingOf(taken);
    plan.push(f);
    makeLink(board, f.from, f.to);
    updateNumbers(board);
    checkCompletion(board, true);
    for (let i = 0; i < board.n; i++)
      if (board.next[i] >= 0 && m.grid[i] === 0)
        m.place(i, linkValue(board, i, board.next[i]));
  }
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
