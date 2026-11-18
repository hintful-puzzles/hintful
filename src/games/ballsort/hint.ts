/**
 * Ball Sort's hint.
 *
 * No pour is forced by logic, so the hint is the search kind
 * (docs/hints-search.md § "What every game does"). The search enumerates
 * every position the board can reach (`Reach`), so it offers the first pour of
 * a shortest line that sorts the board and settles every rival pour exactly:
 * one that leads to a dead end, a position nothing sorts, is the reason a
 * player can learn from, so it leads.
 *
 * Each pour is narrated by the color the line next fills a tube with, the
 * stable subgoal (`add-ball-sort` design D5). The line from any position on
 * it is the rest of it, so that color holds from one request to the next
 * until its tube is full, and the potential every hinted pour lowers is the
 * fewest pours left, which a shortest line has by construction
 * (docs/hints-search.md § "Recompute-stable plans").
 */

import { FREE_NAMES } from "../../engine/color/colors.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Relation } from "../../engine/hint-words.ts";
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
export const BALLSORT_RUNGS = ["last", "only", "trap", "fills", "serves"] as const;
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

/** The color the first pour of `line` to fill a tube fills it with. */
function aimOf(s: BallsortState, line: readonly BallsortPour[]): number {
  let at = s;
  for (const m of line) {
    at = poured(at, m);
    if (isSorted(at, m.to)) return topColor(at, m.to);
  }
  throw new Error("ballsort: a line that sorts the board fills no tube");
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

  if (line.length === 1)
    return {
      ok: true,
      steps: [step("last", speak.sentence("last", { ring, terms: { n } }))],
    };

  const terms = { n, color: aimOf(state, line) };
  const rivals: Marked[] = legalPours(state).filter(
    (r) => r.from !== m.from || r.to !== m.to,
  );
  const { claim } = judgeRivals(rivals, rivals.length, (r, allowance) => {
    allowance.left--;
    return reach.distance(poured(state, { type: "pour", ...r })) === null
      ? "lost"
      : "finishes";
  });

  if (claim.kind === "only") {
    const words = speak.sentence("only", { ring, terms, relation: claim.relation });
    return { ok: true, steps: [step("only", words)] };
  }
  if (claim.kind === "onlyThese" || claim.kind === "alsoThese") {
    const good = new Set(claim.goods);
    const lost = rivals.filter((r) => !good.has(r));
    // The dead end nearest the pour the player is choosing whose stripes do
    // not lie under its ring: first one through the tube it pours into or
    // from, then one through neither, and only then one that moves the same
    // balls or fills the same slots.
    const overlaps = (r: Marked) => r.from === m.from || r.to === m.to;
    const beside = (r: Marked) => r.from === m.to || r.to === m.from;
    const rank = (r: Marked) => (overlaps(r) ? 2 : beside(r) ? 0 : 1);
    const trap = lost.reduce((best, r) => (rank(r) < rank(best) ? r : best));
    const words = speak.sentence("trap", {
      ring,
      terms,
      marks: { stripes: { pour: [trap] } },
    });
    return { ok: true, steps: [step("trap", words)] };
  }
  const relation: Relation = { kind: "serves" };
  const fills = isSorted(poured(state, m), m.to);
  const rung = fills ? "fills" : "serves";
  return {
    ok: true,
    steps: [step(rung, speak.sentence(rung, { ring, terms, relation }))],
  };
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
