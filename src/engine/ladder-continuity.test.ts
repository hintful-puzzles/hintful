/**
 * A deduction ladder's hint plan continues from its latest steps where it can,
 * in every game whose ladder is driven with `continuing`
 * (`testing/ladder-continuity.ts`; the candidate plans' guard is
 * `hint-frontier.test.ts`).
 */
import { describe, expect, it } from "vitest";
import { dealt } from "./testing/dealt.ts";
import { membersNotMentioning } from "./testing/enrollment.ts";
import { HINT_GAMES } from "./testing/hint-games.ts";
import { ladderContinuity } from "./testing/ladder-continuity.ts";
import { leafPresets } from "./testing/presets.ts";

const IDS = HINT_GAMES.map(([id]) => id);
const mentioning = (marker: string): string[] => {
  const without = new Set(membersNotMentioning(IDS, marker));
  return IDS.filter((id) => !without.has(id));
};

/** Each game's corpus: every leaf preset, two seeds. */
function corpus(
  id: string,
): { game: (typeof HINT_GAMES)[number][1]; state: unknown }[] {
  const game = HINT_GAMES.find(([g]) => g === id)?.[1];
  if (!game) throw new Error(`${id} is not a hint game`);
  return leafPresets(game).flatMap((p) =>
    [0, 1].map((s) => ({
      game,
      state: game.newState(p.params, dealt(game, p.params, s).desc),
    })),
  );
}

/**
 * The games whose hint builds a continuing driver, found by running each hint
 * that drives the ladder at all (its code calls `singleFirings(`) on its first
 * board and seeing a continuing driver built, never by reading for the option.
 */
const CONTINUING: readonly string[] = mentioning("singleFirings(").filter((id) => {
  const [{ game, state }] = corpus(id);
  return ladderContinuity(game, state).continuing > 0;
});

/**
 * The games planning through `deduceHintPlan` without a continuing ladder, each
 * with why. Asserted as an exact set, so a game that moves on fails here until
 * its entry goes, and a new one is not left out in silence.
 */
const NOT_CONTINUING: Record<string, string> = Object.fromEntries(
  [
    "crossing",
    "filling",
    "galaxies",
    "lightup",
    "loopy",
    "range",
    "singles",
    "slant",
    "subsets",
    "unruly",
  ].map((id) => [id, "continue-ladder-hints"]),
);

/**
 * The share of the positions where a plan could continue that it left
 * anyway. With the frontier taking it is none on this corpus; with the
 * frontier planted off it was 11% for Ascent and Tracks and 20% to 66% for
 * the rest (2026-10-22), so the bound sits between with room on both sides.
 */
const MAX_AVOIDABLE = 0.05;

describe("ladder hint plans continue from their latest step where they can", () => {
  it("finds the games that continue", () => {
    expect(CONTINUING).toContain("path");
  });

  it("accounts for every game on deduceHintPlan that does not", () => {
    const off = mentioning("deduceHintPlan(").filter((id) => !CONTINUING.includes(id));
    expect(off.sort()).toEqual(Object.keys(NOT_CONTINUING).sort());
  });

  for (const id of CONTINUING) {
    // Titled `<id>: `, which is what lets a local hook run one game's case.
    it(`${id}: a plan that could continue seldom leaves`, () => {
      let continuable = 0;
      let avoidable = 0;
      for (const { game, state } of corpus(id)) {
        const c = ladderContinuity(game, state);
        continuable += c.continuable;
        avoidable += c.avoidable;
      }
      expect(continuable).toBeGreaterThan(10);
      expect(avoidable / continuable, `${avoidable} of ${continuable}`).toBeLessThan(
        MAX_AVOIDABLE,
      );
    });
  }
});
