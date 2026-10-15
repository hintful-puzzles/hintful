/*
 * Cross-game guarantee: **a board with nothing wrong on it has no mistakes.**
 *
 * `findMistakes` is a whole solve followed by a diff in most of the games that
 * offer it, so two things must be true of every one of them:
 *
 *  - a **freshly dealt** board reports none — the player has entered nothing;
 *  - a **solved** board reports none — every cell now equals the solution.
 *
 * WHY THIS IS SMALLER THAN IT LOOKS, stated because the marginal population is
 * the whole argument for the runtime. **Every hinted game already has the
 * fresh-board half**: `hint-resume.test.ts`'s walk asks `findMistakes` at every
 * position it reaches, the first of them the fresh board, as the midend does
 * before every hint. The games this adds are the hintless ones, where nothing
 * else asks `findMistakes` a question it could get wrong. The solved-board half
 * is uncovered for every game: a hint walk stops at solved and never asks what
 * `findMistakes` says once it arrives.
 *
 * WHAT IT CATCHES that no cheaper test would: `findMistakes` is a **second
 * consumer** of every one of these solvers, wired by hand, and hand-wiring
 * between two spellings of one rule drifts with every game test green — a
 * `solveAtCap` running a deduction unbounded where the generator bounds it is
 * the shape. A solver called here with the wrong cap, the wrong clue array, or
 * a predicate that reads the player's *notes* where it should read only their
 * placements, lands in this net.
 *
 * ON THE AXIS: every leaf preset is not a per-commit cost, so the gate deals a
 * slice and the slow tier takes every preset. Keying on the smallest preset
 * alone is rejected: a mis-capped solver shows on the tier its cap is wrong
 * for, which the first preset never reaches.
 *
 * **AND THE BOARDS ARE DEALT FROM A SEED, NOT FROM A DESC.** That is not a
 * detail: `aux` — the generator's own solution — exists only on a board the
 * midend *generated*, so a `params:desc` id silently exercises a different
 * `solve` path from the one every player takes. A `solve` that misreads its
 * `aux` passes every test that deals from a desc id.
 *
 * WHAT THIS GUARD CANNOT SEE: a `solve` that corrupts the *givens* leaves a
 * `findMistakes` that re-derives from them unable to solve, and one that then
 * returns `[]` reports health. Only a preset with no givens to corrupt (Solo's
 * Killer) shows the diff, so a guard can be right and still see a small share
 * of what it catches.
 *
 * WHAT THIS DELIBERATELY DOES NOT ASSERT: the other direction — a *wrong* board
 * reports non-empty. Reaching a mistaken board takes a game-specific move, so a
 * `findMistakes` stubbed to `return []` passes here; `warm-repaint.test.ts`
 * fails it, since it requires every game that finds mistakes to have flagged a
 * board, from its seeded run or a pinned wrong board.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { Midend } from "./midend.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { NOT_STARTED } from "./solve-failure.ts";
import { beginDealt } from "./testing/dealt.ts";
import { capabilitySets } from "./testing/enrollment.ts";
import { dealtBoards } from "./testing/presets.ts";
import { SLOW_TESTS_ENABLED } from "./testing/slow.ts";

beforeAll(registerAllGames);

// biome-ignore lint/suspicious/noExplicitAny: the registry is heterogeneous by design.
type AnyGame = any;

/** Every game carrying the `findMistakes` member — derived from the capability
 * set rather than from a grep, because a game may spell the member's function
 * its own way. */
function mistakeGames(): [string, AnyGame][] {
  const offers = new Set(
    capabilitySets()
      .filter((c) => c.members.includes("findMistakes"))
      .map((c) => c.id),
  );
  return registeredGameIds()
    .sort()
    .filter((id) => offers.has(id))
    .map((id): [string, AnyGame] => [id, getTsGame(id) as AnyGame]);
}

const GAMES = mistakeGames();

/**
 * The boards this guard deals, per game: **every tier and mode, each on the
 * smallest board carrying it, and no large board** (`dealtBoards` with
 * `scalarEnds: false`). The slow tier takes every leaf preset.
 *
 * **No large board is a deliberate weakening with a reason.** `hint-resume`
 * takes both ends of a size because a hint *plan* can fail on a big board and
 * not a small one, as a search that cycles only past its reach does. The defect class here is different: `findMistakes` is a second,
 * hand-wired consumer of the game's solver, and what desynchronizes the two is
 * a **cap or a clue structure**, which varies by tier and mode, not by board
 * size. What a large board costs here is almost all **generation** at the
 * largest size.
 *
 * Keyed on tier alone it would deal no mode: no Killer grid, no Adjacent clue
 * set, and one board of an untiered game whatever its menu varies.
 */
function dealtPresets(game: AnyGame): { title: string; params: unknown }[] {
  return dealtBoards(game, { every: SLOW_TESTS_ENABLED, scalarEnds: false });
}

describe("a board with nothing wrong on it reports no mistakes", () => {
  it("swept a populated registry", () => {
    // The vacuity floor this repo owes every derived sweep: an unpopulated
    // registry would make every case below iterate over nothing and pass.
    expect(registeredGameIds().length).toBeGreaterThanOrEqual(50);
    expect(GAMES.length).toBeGreaterThanOrEqual(35);
  });

  for (const [name, game] of GAMES) {
    it(`${name}: clean when dealt, and clean when solved`, () => {
      const presets = dealtPresets(game);
      // Per-game vacuity: a presets menu that flattened to nothing would leave
      // this loop asserting nothing while reporting health.
      expect(presets.length, `${name}: no preset to deal`).toBeGreaterThan(0);

      for (const { title, params } of presets) {
        const midend = new Midend(game);
        expect(
          beginDealt(midend, game, params),
          `${name}/${title}: could not deal`,
        ).toBeNull();

        expect(
          midend.findMistakes(),
          `${name}/${title}: a freshly dealt board reports mistakes — the ` +
            "player has entered nothing, so nothing can diverge from the solution",
        ).toBe(0);

        // A board laid out by the first move (Mines) has nothing to solve until
        // that move is made, and Solve says so; the hint makes it.
        let solved = midend.solve();
        if (solved === NOT_STARTED) {
          expect(
            midend.executeHint(),
            `${name}/${title}: no hint to start the board with`,
          ).toBeNull();
          solved = midend.solve();
        }
        expect(
          solved,
          `${name}/${title}: solve refused on its own generated board`,
        ).toBeNull();

        expect(
          midend.findMistakes(),
          `${name}/${title}: a solved board reports mistakes — every cell now ` +
            "equals the solution, so this is `findMistakes` disagreeing with " +
            "the solver it is wired to",
        ).toBe(0);
      }
    });
  }
});
