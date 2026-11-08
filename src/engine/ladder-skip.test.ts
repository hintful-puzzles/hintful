/**
 * A compiled technique's solve run visits only the elements a fact reached
 * since a binding there found nothing (`CellMarks.visit`). That is sound only
 * if its footprint names every mark a binding reads, so every game whose
 * compiled module skips deals the same boards with skipping and without: a
 * board's description holds every verdict its generator's ladder gave, so a
 * binding skipped that would have fired changes a board.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { CellMarks } from "./ladder-runtime.ts";
import { randomNew } from "./random/index.ts";
import { getTsGame } from "./registry.ts";
import { type AnyGame, gatePresets } from "./testing/hint-games.ts";

const modules = import.meta.glob<string>("../games/*/*.compiled.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** The games whose compiled module emits a footprint, by what it compiled. */
const SKIPPING = Object.entries(modules)
  .filter(([, text]) => /: Footprint = /.test(text))
  .map(([path]) => path.split("/")[2])
  .sort();

/** Boards dealt a preset, both ways: one deal is thousands of runs of every
 * technique, and a footprint planted with one read, or blind to the
 * relation, changed a board on the first preset it reached. */
const DEALS = 1;

function deals(game: AnyGame, params: unknown, skipping: boolean): string[] {
  const before = CellMarks.skipping;
  CellMarks.skipping = skipping;
  try {
    return Array.from(
      { length: DEALS },
      (_, i) => game.newDesc(params, randomNew(`skip-${i}`)).desc,
    );
  } finally {
    CellMarks.skipping = before;
  }
}

describe("a solve that skips deals the boards one that does not deals", () => {
  it("has games to compare", () => {
    expect(SKIPPING.length).toBeGreaterThan(0);
  });

  it.each(SKIPPING)("%s", (id) => {
    const game = getTsGame(id) as AnyGame;
    const presets = gatePresets(game);
    expect(presets.length).toBeGreaterThan(0);
    for (const { title, params } of presets)
      expect(deals(game, params, true), title).toEqual(deals(game, params, false));
  });
});
