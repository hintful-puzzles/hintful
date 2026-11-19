/**
 * A deduction ladder's hint plan continues from its latest steps where it can,
 * in every game whose ladder is driven with `continuing`
 * (`testing/ladder-continuity.ts`; the candidate plans' guard is
 * `hint-frontier.test.ts`).
 */
import { describe, expect, it } from "vitest";
import { dealt } from "./testing/dealt.ts";
import { membersNotMentioning } from "./testing/enrollment.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";
import { ladderContinuity } from "./testing/ladder-continuity.ts";

const IDS = HINT_GAMES.map(([id]) => id);
const mentioning = (marker: string): string[] => {
  const without = new Set(membersNotMentioning(IDS, marker));
  return IDS.filter((id) => !without.has(id));
};

/** Each game's corpus at seed `s`: the gate's boards, one of each kind
 * (`gatePresets`), and every leaf preset in the slow tier. */
function corpus(
  id: string,
  s = 0,
): { game: (typeof HINT_GAMES)[number][1]; state: unknown }[] {
  const game = HINT_GAMES.find(([g]) => g === id)?.[1];
  if (!game) throw new Error(`${id} is not a hint game`);
  return gatePresets(game).map((p) => ({
    game,
    state: game.newState(p.params, dealt(game, p.params, s).desc),
  }));
}

/**
 * How many positions where a plan could continue a game's share is read over.
 * The gate's boards are small, and on them a frontier planted off leaves
 * fewer positions than on a large one: at 30 Singles read under the bound, at
 * 60 Mosaic did, and at 120 every game but Range failed (2026-11-09). Every
 * leaf preset at 30 was the corpus before, and it missed Range too.
 */
const ENOUGH = 120;

/** The most seeds dealt to reach {@link ENOUGH}. */
const MAX_SEEDS = 40;

/**
 * The games whose hint builds a continuing driver, found by running each hint
 * that drives the ladder at all (its code calls `singleFirings(`, or
 * `ladderWalk(`, which builds one) on its first board and seeing a continuing
 * driver built, never by reading for the option.
 */
const DRIVING = [
  ...new Set([...mentioning("singleFirings("), ...mentioning("ladderWalk(")]),
];
const CONTINUING: readonly string[] = DRIVING.filter((id) => {
  const [{ game, state }] = corpus(id);
  return ladderContinuity(game, state).continuing > 0;
});

/**
 * The share of the positions where a plan could continue that it left
 * anyway. With the frontier planted off it was 6% at the least (3 of 48) and
 * 96% at the most, most games over 20% (2026-10-22), so the bound sits
 * between them; a frontier given no history is the plant ({@link ENOUGH}).
 */
const MAX_AVOIDABLE = 0.05;

describe("ladder hint plans continue from their latest step where they can", () => {
  it("finds the games that continue", () => {
    expect(CONTINUING).toContain("crossing");
  });

  // A game that builds its own frontier continues by it, and
  // `hint-frontier.test.ts`'s `OWN_FRONTIER` accounts for it.
  it("finds every game on deduceHintPlan continuing, or taking the frontier itself", () => {
    const own = mentioning("new HintFrontier");
    expect(own.length).toBeGreaterThan(0);
    const off = mentioning("deduceHintPlan(").filter(
      (id) => !CONTINUING.includes(id) && !own.includes(id),
    );
    expect(
      off,
      "plans through deduceHintPlan with neither a continuing ladder nor a " +
        "frontier of its own: drive the ladder with `continuing`",
    ).toEqual([]);
  });

  for (const id of CONTINUING) {
    // Titled `<id>: `, which is what lets a local hook run one game's case.
    it(`${id}: a plan that could continue seldom leaves`, () => {
      let continuable = 0;
      let avoidable = 0;
      // Seed after seed of every preset, until the share is read over enough.
      for (let s = 0; s < MAX_SEEDS && continuable < ENOUGH; s++)
        for (const { game, state } of corpus(id, s)) {
          const c = ladderContinuity(game, state);
          continuable += c.continuable;
          avoidable += c.avoidable;
        }
      expect(continuable).toBeGreaterThanOrEqual(ENOUGH);
      expect(avoidable / continuable, `${avoidable} of ${continuable}`).toBeLessThan(
        MAX_AVOIDABLE,
      );
    });
  }
});
