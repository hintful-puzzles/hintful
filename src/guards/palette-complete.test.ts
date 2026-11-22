/**
 * Every game's palette fills every slot below its last: the frontend converts
 * each color it is handed, and a slot left empty throws there, so the game
 * opens on an error dialog where no test that draws through a recording
 * notices. A renderer that numbers its slots by what a board has (the fill
 * engine's walls, numbers and dots) is where a hole is made.
 */

import { describe, expect, it } from "vitest";
import { REGISTERED_GAMES } from "../engine/testing/enrollment.ts";
import { DEFAULT_BACKGROUND } from "../engine/testing/render-scenario.ts";

describe("palette", () => {
  it.each(REGISTERED_GAMES)("%s fills every slot it numbers", (_id, game) => {
    const colors = game.colors(DEFAULT_BACKGROUND);
    const holes = Array.from(colors.keys()).filter((i) => colors[i] === undefined);
    expect(holes).toEqual([]);
  });
});
