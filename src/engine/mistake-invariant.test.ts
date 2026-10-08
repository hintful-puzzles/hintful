/*
 * Cross-game guarantee: **a board with nothing wrong on it has no mistakes.**
 *
 * `findMistakes` is a whole solve followed by a diff in 36 of the 39 games that
 * offer it, so two things must be true of every one of them:
 *
 *  - a **freshly dealt** board reports none — the player has entered nothing;
 *  - a **solved** board reports none — every cell now equals the solution.
 *
 * Neither was checked anywhere cross-game, and for eighteen games neither was
 * checked at all.
 *
 * WHY THIS IS SMALLER THAN IT LOOKS, stated because the marginal population is
 * the whole argument for the runtime. **Every hinted game already has the
 * fresh-board half**: `hint-resume.test.ts`'s walk asks `findMistakes` at every
 * position it reaches, the first of them the fresh board, as the midend does
 * before every hint. When this was written, twenty-one of the thirty-nine had
 * that coverage and **fifteen of the eighteen without it were hintless**, so
 * nothing anywhere had ever asked their `findMistakes` a question it could get
 * wrong. The solved-board half is uncovered for every game: a hint walk stops at
 * solved and never asks what `findMistakes` says once it arrives.
 *
 * WHAT IT CATCHES that no cheaper test would, and the repo has paid it once:
 * `findMistakes` is a **second consumer** of every one of these solvers, wired
 * by hand, and hand-wiring between two spellings of one rule is where
 * `assert-that-tiers-bind` found Undead — `solveAtCap` running arc-consistency
 * unbounded where the generator bounded it at three passes, with every Undead
 * test green. A solver called here with the wrong cap, the wrong clue array, or
 * a predicate that reads the player's *notes* where it should read only their
 * placements, lands in this net.
 *
 * ON THE AXIS, and the number was taken rather than guessed. Every leaf preset
 * was **120 s** on an idle box (2026-09-09), which is not a per-commit cost, so
 * the gate deals a slice and the slow tier takes every preset. Keying on the
 * smallest preset alone was rejected: a mis-capped solver shows on the tier
 * its cap is wrong for, which is the first-preset blindness
 * `refuse-honestly-at-every-tier` removed.
 *
 * **AND THE BOARDS ARE DEALT FROM A SEED, NOT FROM A DESC.** That is not a
 * detail: `aux` — the generator's own solution — exists only on a board the
 * midend *generated*, so a `params:desc` id silently exercises a different
 * `solve` path from the one every player takes. Solo shipped a `solve` that
 * decoded its comma-separated `aux` one character per cell, corrupting half of
 * every generated board including the fixed clues, and it survived because
 * every Solo test dealt from a desc id (`fix-solo-solve-from-aux`, 2026-09-09).
 *
 * WHAT THIS GUARD COULD NOT SEE, recorded because it found that bug through a
 * single preset out of sixteen: once `solve` had corrupted the *givens*, every
 * non-Killer preset's `findMistakes` re-derived from those corrupt givens, got
 * `DIFF_IMPOSSIBLE`, and returned `[]` — reporting health. Killer was the one
 * preset with no givens to corrupt, so its re-derivation succeeded and the diff
 * was visible. A guard can be right and still see one sixteenth of what it
 * caught.
 *
 * WHAT THIS DELIBERATELY DOES NOT ASSERT: the other direction — a seeded *wrong*
 * board reports non-empty. Reaching a mistaken board takes a game-specific move,
 * which is the same reason `src/mistake-overlay-coverage.test.ts` is a ledger
 * rather than a guard. So a `findMistakes` stubbed to `return []` passes here,
 * and saying so is better than implying a totality this cannot have.
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
 * set rather than from a grep, because four games spelled the member's function
 * differently until 2026-09-06. */
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
 * not a small one — Sixteen's 5×5 cycled for ever where its 3×3 walked in
 * seven moves. The defect class here is different: `findMistakes` is a second,
 * hand-wired consumer of the game's solver, and what desynchronizes the two is
 * a **cap or a clue structure**, which varies by tier and mode, not by board
 * size. Measured on an idle box, 2026-09-09: of the ~30 s a slice with the
 * large boards cost, almost all was **generation** at the largest size
 * (Separate alone was 8 s).
 *
 * It keyed on tier alone until `walk-every-choice-the-dialog-offers`, so it
 * dealt no mode: no Killer grid, no Adjacent clue set, and one board of an
 * untiered game whatever its menu varied.
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
