/**
 * A dark-mode `paletteSwaps` pair names a bevel's highlight and its lowlight.
 *
 * The pairs in `puzzle/augmentation.ts` are raw palette indices, and a game's
 * indices move whenever a color is added or dropped above them. Mines lost one
 * above its bevel, its pair went on naming the old slots, and from then on the
 * dark scheme exchanged the lowlight with the wrong-number wash: a dark red
 * grid, with every other test green.
 *
 * So each pair is read back through the game's own `COL_*` constants: the two
 * names must be one name with `HIGHLIGHT` and `LOWLIGHT` exchanged. A pair that
 * is deliberately something else is in {@link OTHER_PAIRS} with what it is.
 */
import { describe, expect, it } from "vitest";
import { puzzleAugmentations } from "./puzzle/augmentation.ts";

const renderModules = import.meta.glob<string>("./games/*/render.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Pairs that exchange two things other than a highlight and a lowlight. */
const OTHER_PAIRS: Record<string, [string, string][]> = {
  // An opened square and a covered one are a tone apart, and the tone has to
  // step the same way off the board in both schemes.
  mines: [["COL_BACKGROUND", "COL_BACKGROUND2"]],
};

/** A game's `COL_*` constants, index to name. */
function constantNames(game: string): Map<number, string[]> {
  const src = renderModules[`./games/${game}/render.ts`];
  if (src === undefined) throw new Error(`${game} has no render.ts`);
  const names = new Map<number, string[]>();
  for (const m of src.matchAll(/^(?:export )?const (COL_\w+) = (\d+);/gm)) {
    const index = Number(m[2]);
    names.set(index, [...(names.get(index) ?? []), m[1]]);
  }
  return names;
}

const PAIRS = Object.entries(puzzleAugmentations).flatMap(([game, aug]) =>
  (aug?.darkMode?.paletteSwaps ?? []).map(([a, b]) => ({ game, a, b })),
);

describe("a dark-mode swap names a highlight and its lowlight", () => {
  it("finds the pairs and the constants", () => {
    expect(PAIRS.length).toBeGreaterThanOrEqual(12);
    for (const game of new Set(PAIRS.map((p) => p.game)))
      expect(constantNames(game).size, game).toBeGreaterThan(3);
  });

  for (const { game, a, b } of PAIRS) {
    it(`${game} swaps ${a} with ${b}`, () => {
      const names = constantNames(game);
      const first = names.get(a) ?? [];
      const second = names.get(b) ?? [];
      const other = (OTHER_PAIRS[game] ?? []).some(
        ([x, y]) => first.includes(x) && second.includes(y),
      );
      const bevel = first.some(
        (n) =>
          n.includes("HIGHLIGHT") &&
          second.includes(n.replace("HIGHLIGHT", "LOWLIGHT")),
      );
      expect(
        other || bevel,
        `${game} swaps ${first.join("/") || a} with ${second.join("/") || b}`,
      ).toBe(true);
    });
  }

  it("excuses only pairs that exist", () => {
    for (const [game, pairs] of Object.entries(OTHER_PAIRS)) {
      const names = constantNames(game);
      for (const [x, y] of pairs)
        expect(
          PAIRS.some(
            (p) =>
              p.game === game &&
              (names.get(p.a) ?? []).includes(x) &&
              (names.get(p.b) ?? []).includes(y),
          ),
          `${game}: ${x}/${y}`,
        ).toBe(true);
    }
  });
});
