/**
 * A variation a description states is offered by its game under the word
 * the description's shape gives it: a ruleset where it replaces, a modifier
 * where it only adds (`variationWord`). The field is the declaration the
 * engine reads; the description is what makes the word computed.
 */

import { beforeAll, describe, expect, it } from "vitest";
import {
  isFormal,
  isLibrary,
  isPlanning,
  variationWord,
} from "./describe/description.ts";
import { loadDescriptionFile } from "./describe/load.ts";
import { getTsGame } from "./engine/registry.ts";
import { rulesetField } from "./engine/ruleset.ts";
import { registerAllGames } from "./games/index.ts";

const texts = import.meta.glob<string>("./**/*.description.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

const varied = Object.entries(texts).flatMap(([path, text]) => {
  const d = loadDescriptionFile(text, path);
  return !isLibrary(d) && (isFormal(d) || isPlanning(d)) && d.variations !== undefined
    ? [{ path, game: d.game, variations: d.variations }]
    : [];
});

beforeAll(registerAllGames);

/** How the game offers a variation by `name`: as a ruleset by its name, as
 * a modifier by its words, or not at all. */
function offered(id: string, name: string): string[] {
  const game = getTsGame(id);
  if (game === null) return [`no game ${id}`];
  const config = game.paramConfig ?? [];
  return [
    ...(rulesetField(game)?.rulesets.some((r) => r.name === name) ? ["ruleset"] : []),
    ...config.filter((i) => i.modifier?.words === name).map(() => "modifier"),
  ];
}

describe("a stated variation is offered under the word its shape gives", () => {
  it("finds stated variations", () => {
    expect(varied.length).toBeGreaterThan(0);
  });

  for (const { path, game, variations } of varied)
    for (const [name, v] of Object.entries(variations))
      it(`${path}: ${name}`, () => {
        expect(offered(game, name)).toEqual([variationWord(v)]);
      });
});
