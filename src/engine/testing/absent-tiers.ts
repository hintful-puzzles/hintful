/**
 * The cells a game refuses because no board of that size needs the tier asked
 * for (`ts-migration` spec, "An unbindable tier is refused, not silently
 * downgraded"), and what each owes.
 *
 * A refusal of this kind is a claim of absence, and a claim of absence is
 * only as good as the search behind it. Upstream's table for Group refused
 * two cells that deal a board at once, and it was right about the rest. So a
 * cell is held to three things: it is refused when a board is to be dealt; it
 * is accepted when a board arrives with its desc, since boards dealt under the
 * old label are in saved games and shared IDs; and the generator, asked
 * anyway, runs its retry budget out.
 *
 * **The run-out is the slow tier's, and its power is stated, not assumed.**
 * `budgets` runs of a 10,000-try bound are that many boards built and thrown
 * away, and a tier found once in `n` tries survives them with chance about
 * `e^(-tries/n)`: five runs miss a tier found once in 17,000 one time in
 * twenty. A cell whose boards are rarer than that passes this while not being
 * absent. Group's 6x6 Tricky is found once in 48,000 and was caught by a
 * count over 380,000, so a cell first gets a count that large, and this keeps
 * the answer from drifting when a solver changes.
 *
 * `scripts/checks/tier-walk.test.ts` finds the cells; this pins them.
 *
 * Dev/test-only; never imported by production code.
 */
import { describe, expect, it } from "vitest";
import {
  cappedSolveFor,
  type DifficultyContract,
  difficultyTiers,
  lowestSolvingCap,
  tierOf,
} from "../difficulty.ts";
import type { ParamConfigItem } from "../game.ts";
import { paramsError } from "../params.ts";
import { type RandomState, randomNew } from "../random/index.ts";
import { RetryLimitExceeded } from "../retry-limit.ts";
import { itSlow } from "./slow.ts";

interface DealingGame<Params> {
  paramConfig?: readonly ParamConfigItem<Params>[];
  validateParams?(p: Params, full: boolean): string | null;
  decodeParams(s: string): Params;
  newDesc(p: Params, rng: RandomState): { desc: string };
}

/**
 * Hold each of `cells` to dealing a board that needs the tier it asks for:
 * the lowest cap that solves it is that tier. For the cells beside a refusal,
 * and for a tier rare enough at its size that the retry bound was sized to it.
 * `deals` boards a cell, from fixed seeds.
 */
export function describeDealtTiers<Params>(
  game: DealingGame<Params> & { difficulty?: DifficultyContract<Params> },
  cells: readonly string[],
  opts: { readonly deals?: number } = {},
): void {
  const deals = opts.deals ?? 3;
  describe("a size that carries its tier", () => {
    it.each(cells)(`%s deals ${deals} boards that need it`, (cell) => {
      const { difficulty } = game;
      if (!difficulty) throw new Error("expected a difficulty contract");
      const p = game.decodeParams(cell);
      const tiers = difficultyTiers(game)?.length ?? 0;
      expect(paramsError(game, p, true)).toBeNull();
      for (let seed = 0; seed < deals; seed++) {
        const { desc } = game.newDesc(p, randomNew(`dealt-${cell}-${seed}`));
        expect(lowestSolvingCap(cappedSolveFor(difficulty, p, desc), tiers)).toBe(
          tierOf(game, p),
        );
      }
    });
  });
}

/**
 * Hold each of `cells`, written as full params strings (`"3dh"`), to the three
 * things above. `budgets` is how many times the slow tier runs the generator's
 * retry bound out at each: raise it for a game whose bound is short.
 */
export function describeAbsentTiers<Params>(
  game: DealingGame<Params>,
  cells: readonly string[],
  opts: { readonly budgets?: number } = {},
): void {
  const budgets = opts.budgets ?? 5;
  describe("a size with no board at a tier", () => {
    it.each(cells)("%s is refused when a board is to be dealt", (cell) => {
      expect(paramsError(game, game.decodeParams(cell), true)).toMatch(/\.$/);
    });

    it.each(cells)("%s still loads a board that arrives with its desc", (cell) => {
      expect(paramsError(game, game.decodeParams(cell), false)).toBeNull();
    });

    itSlow.each(cells)(
      `%s: the generator runs out ${budgets} retry budgets`,
      (cell) => {
        const p = game.decodeParams(cell);
        for (let seed = 0; seed < budgets; seed++) {
          expect(() => game.newDesc(p, randomNew(`absent-${cell}-${seed}`))).toThrow(
            RetryLimitExceeded,
          );
        }
      },
    );
  });
}
