/**
 * Every board is held to the engine's area (`engine-params`, "A grid too large
 * for a game is refused in one sentence").
 *
 * ON THE INSTRUMENT: a field is a size field when the words its params label
 * says the board's size in move as the field does: the label's `size` slot is
 * how every game tells a player how big the board is, so the population comes
 * from what each game declares, and a field that sizes the board under any
 * name is found. Each one is set, through the Custom dialog's own `set`, to a
 * million alone, and the params must then be refused even with a description
 * in hand (`full: false`), since a board loaded is drawn and held as one dealt.
 */
import { describe, expect, it } from "vitest";
import type { ParamConfigItem } from "../engine/contract/game.ts";
import { paramsError } from "../engine/game-id/params.ts";
import { REGISTERED_GAMES } from "../engine/testing/enrollment.ts";

const HUGE = "1000000";

function sizeWords<P>(config: readonly ParamConfigItem<P>[], p: P): string {
  return config
    .filter((item) => item.label?.slot === "size")
    .map((item) => {
      if (item.label?.words) return item.label.words(p);
      return item.type === "string" ? item.get(p) : null;
    })
    .join(" ");
}

const sizeFields = REGISTERED_GAMES.flatMap(([id, game]) =>
  game.paramConfig.flatMap((item) => {
    if (item.type !== "string") return [];
    const before = game.defaultParams();
    const after = game.defaultParams();
    item.set(after, HUGE);
    const sized =
      sizeWords(game.paramConfig, after) !== sizeWords(game.paramConfig, before);
    return sized ? [{ id, game, item, after }] : [];
  }),
);

describe("no field sizes a board past the engine's area", () => {
  it("found size fields across the collection", () => {
    // Every game with a Custom size has one; most have two.
    expect(new Set(sizeFields.map((f) => f.id)).size).toBeGreaterThan(40);
  });

  it.each(
    sizeFields.map((f) => [`${f.id} ${f.item.kw}`, f] as const),
  )("%s at a million is refused", (_, { game, after }) => {
    expect(paramsError(game, after, false)).not.toBeNull();
  });
});
