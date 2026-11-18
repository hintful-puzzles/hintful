/**
 * Ball Sort's hint.
 *
 * No pour is forced by logic, so the hint is the search kind
 * (docs/hints-search.md § "What every game does"). The search enumerates
 * every position the board can reach (`Reach`), so it offers the first pour of
 * a shortest line that sorts the board, and says what that pour does on the
 * board: fills a tube, frees balls the line moves before covering them,
 * empties a tube, lands on its color or starts a tube of one
 * (`add-ball-sort` design D5).
 *
 * The line from any position on it is the rest of it, so the potential every
 * hinted pour lowers is the fewest pours left, which a shortest line has by
 * construction (docs/hints-search.md § "Recompute-stable plans").
 */

import { bestBy } from "../../engine/best-by.ts";
import { FREE_NAMES } from "../../engine/color/colors.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { judgeRivals } from "../../engine/rival-judging.ts";
import { searchRefusal } from "../../engine/search-outcome.ts";
import { voice } from "../../generated/games/ballsort/ballsort.compiled.ts";
import { BALL, type Marked, POUR, RUN, TUBE } from "./kinds.ts";
import { Reach } from "./solver.ts";
import {
  type BallsortMove,
  type BallsortPour,
  type BallsortState,
  heightOf,
  isSorted,
  legalPours,
  positionOf,
  poured,
  rulesOf,
  topColor,
  topRun,
} from "./state.ts";

/** What a step rests on, by the branch of {@link hint} that chose its words. */
export const BALLSORT_RUNGS = [
  "last",
  "fills",
  "either",
  "frees",
  "empties",
  "roomiest",
  "joins",
  "starts",
  "plain",
] as const;
export type BallsortRung = (typeof BALLSORT_RUNGS)[number];

type Step = HintStep<BallsortMove, unknown, BallsortRung>;

/** A color is said by the palette's name for it, which the balls are drawn
 * in. */
const speak = voice<number | Marked>({
  kind: BALL,
  kinds: { run: RUN, tube: TUBE, pour: POUR },
  value: (c) => FREE_NAMES[c - 1],
});

/** How many balls pour `m` moves on `s`: the top run, as much as fits. */
function pourCount(s: BallsortState, m: Marked): number {
  return Math.min(topRun(s, m.from), s.h - heightOf(s, m.to));
}

/** The slots, as grid indices, of the balls pour `m` moves on `s`, from the
 * top down. */
export function movingBalls(s: BallsortState, m: Marked): number[] {
  const top = s.h - heightOf(s, m.from);
  return Array.from({ length: pourCount(s, m) }, (_, k) => (top + k) * s.w + m.from);
}

/** The slots, as grid indices, pour `m` fills on `s`, from the bottom up. */
export function landingSlots(s: BallsortState, m: Marked): number[] {
  const first = s.h - heightOf(s, m.to) - 1;
  return Array.from({ length: pourCount(s, m) }, (_, k) => (first - k) * s.w + m.to);
}

/**
 * The description's one dead end a player can see at a glance: no pour at
 * all, with the board unsorted. Any other is the search's to find, and the
 * hint refuses it.
 */
export function hasNoSolution(state: BallsortState): boolean {
  return rulesOf(state).deadEnd(positionOf(state)) !== null;
}

export function hint(
  state: BallsortState,
): HintResult<BallsortMove, unknown, BallsortRung> {
  const reach = Reach.of(state);
  if (reach === null) return searchRefusal({ kind: "out-of-reach" });
  const line = reach.line(state);
  if (line === null) return searchRefusal({ kind: "lost" });
  const m = line[0];
  if (m === undefined) throw new Error("ballsort: a hint asked of a sorted board");
  const ring = { run: movingBalls(state, m), tube: [m.to] };
  const n = ring.run.length;
  const step = (rung: BallsortRung, words: Step["words"] & object): Step => ({
    move: m,
    rung,
    explanation: words.text,
    words,
  });

  const terms = { n };
  const one = (rung: Exclude<BallsortRung, "either" | "frees" | "starts">) => ({
    ok: true as const,
    steps: [step(rung, speak.sentence(rung, { ring, terms }))],
  });
  if (line.length === 1) return one("last");
  const after = poured(state, m);
  if (isSorted(after, m.to)) return one("fills");

  // A dead end is worth a player's attention only as one of two choices
  // (owner, 2026-11-18): among many pours, naming one that fails says
  // nothing about the one to make.
  const rivals: Marked[] = legalPours(state).filter(
    (r) => r.from !== m.from || r.to !== m.to,
  );
  if (rivals.length === 1) {
    const { claim } = judgeRivals(rivals, 1, (r, allowance) => {
      allowance.left--;
      return reach.distance(poured(state, { type: "pour", ...r })) === null
        ? "lost"
        : "finishes";
    });
    if (claim.kind === "only") {
      const words = speak.sentence("either", {
        ring,
        terms,
        marks: { stripes: { pour: rivals } },
        relation: claim.relation,
      });
      return { ok: true, steps: [step("either", words)] };
    }
  }

  const rest = line.slice(1);
  if (heightOf(after, m.from) > 0 && movesBeforeCovered(rest, m.from)) {
    const color = topColor(after, m.from);
    const freed = topRun(after, m.from);
    const words = speak.sentence("frees", { ring, terms: { n, color, freed } });
    return { ok: true, steps: [step("frees", words)] };
  }
  if (heightOf(after, m.from) === 0) return one("empties");
  // The room a pour leaves, said by the count a player can make: the pours
  // there are after it. Said only where no other pour leaves as many.
  const room = bestBy(legalPours(state), (r) => legalPours(poured(state, r)).length);
  if (room?.alone && room.item.from === m.from && room.item.to === m.to)
    return one("roomiest");
  if (heightOf(state, m.to) > 0) return one("joins");
  if (staysUntilFull(after, rest, m.to)) {
    const color = topColor(after, m.to);
    const words = speak.sentence("starts", { ring, terms: { n, color } });
    return { ok: true, steps: [step("starts", words)] };
  }
  return one("plain");
}

/** Whether `line` pours out of tube `t` before it pours anything into it:
 * the balls a pour uncovers there are the line's to move. */
function movesBeforeCovered(line: readonly BallsortPour[], t: number): boolean {
  for (const m of line) {
    if (m.from === t) return true;
    if (m.to === t) return false;
  }
  return false;
}

/** Whether `line`, from `s`, fills tube `t` before it pours out of it: the
 * balls just poured there begin a tube of their color. */
function staysUntilFull(
  s: BallsortState,
  line: readonly BallsortPour[],
  t: number,
): boolean {
  let at = s;
  for (const m of line) {
    if (m.from === t) return false;
    at = poured(at, m);
    if (isSorted(at, t)) return true;
  }
  return false;
}

/** A pour is settled by its two tubes, so the step's own pour lands exactly
 * the board the plan expects; anything else drops the plan. */
export function hintKeepTrack(
  m: BallsortMove,
  step: Step,
  _s: BallsortState,
): HintTrackVerdict {
  const want = step.move;
  if (m.type !== "pour" || want.type !== "pour") return "off";
  return m.from === want.from && m.to === want.to ? "completed" : "off";
}
