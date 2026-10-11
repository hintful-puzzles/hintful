/**
 * Every game's win is the engine's traveling highlight.
 *
 * The engine owns the clock and the pace, and a game joins by asking
 * `flash.win` about its elements. A game that asks nothing compiles, plays, and
 * celebrates with nothing: so this paints each game's solved board through a
 * win flash and looks at the frames.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { LEFT_BUTTON, LEFT_RELEASE } from "./pointer.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { type AnyGame, probeBoard } from "./testing/input-probe.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import { winFlashAt } from "./testing/win-flash.ts";
import { type Flash, NO_FLASH, WIN_FLASH_S, WIN_STILL_S } from "./win-wave.ts";

registerAllGames();

/** The games a solved board can be reached in without playing one: those with
 * a solver. The others pin their flash in their own tests. */
const solvable = registeredGameIds()
  .sort()
  .filter((id) => getTsGame(id)?.solve !== undefined);

/** A solved board of `id`, and a painter of it from a draw state that has
 * never painted, so a tile cache hides nothing. */
function solvedBoard(id: string): (flash: Flash) => string {
  const game = getTsGame(id) as AnyGame;
  const pb = probeBoard(game, id);
  pb.reset();
  if (pb.m.solve() !== null) {
    // A board that has no answer until it is opened (Mines): open it.
    const { w, h } = pb.size;
    pb.m.processInput(w / 2, h / 2, LEFT_BUTTON);
    pb.m.processInput(w / 2, h / 2, LEFT_RELEASE);
    if (pb.m.solve() !== null) throw new Error(`${id}: Solve refused its own deal`);
  }
  const { state, ui } = pb.live();
  expect(game.status(state)).toBe("solved");
  const tileSize = game.preferredTileSize ?? 32;
  return (flash) => {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(state, tileSize), null, state, 1, ui, 0, flash);
    return JSON.stringify(dr.ops);
  };
}

describe("the win flash, in every game", () => {
  it("has a population", () => {
    // Vacuity: derived from the registry, and nearly all of it.
    expect(solvable.length).toBeGreaterThanOrEqual(registeredGameIds().length - 2);
  });

  describe.each(solvable)("%s", (id) => {
    let paint: (flash: Flash) => string;
    let settled: string;
    let frames: string[];
    const at = (seconds: number, still = false) =>
      paint(winFlashAt(seconds, paint, still));
    beforeAll(() => {
      paint = solvedBoard(id);
      settled = paint(NO_FLASH);
      // Instants across the flash, neither end among them.
      frames = Array.from({ length: 16 }, (_, i) => at((WIN_FLASH_S * (i + 1)) / 17));
    });

    it("lights something at every instant", () => {
      // Compared as booleans throughout: a frame is a board's worth of ops, and
      // a failure that prints two of them says nothing.
      expect(frames.map((frame) => frame !== settled)).not.toContain(false);
    });

    it("travels: what is lit early is not what is lit late", () => {
      expect(frames[1] === frames[13]).toBe(false);
      // And it is not a blink of the whole board: no two of these are alike.
      expect(new Set([frames[1], frames[5], frames[9], frames[13]]).size).toBe(4);
    });

    // The band test above passes a game whose highlight shows on some
    // elements and is invisible on others: a given that already wears the
    // color a lit cell takes. So each element is lit alone. A game asks once
    // per element, in one order every frame, which makes the nth question of
    // a frame the nth element.
    it("shows the highlight on every element it asks about", () => {
      let asked = 0;
      paint({
        time: 0,
        winning: true,
        win: () => {
          asked++;
          return false;
        },
      });
      expect(asked).toBeGreaterThan(0);
      const unseen: number[] = [];
      for (let only = 0; only < asked; only++) {
        let n = 0;
        if (paint({ time: 0, winning: true, win: () => n++ === only }) === settled)
          unseen.push(only);
      }
      expect(unseen).toEqual([]);
    });

    it("ends with nothing lit", () => {
      expect(at(WIN_FLASH_S) === settled).toBe(true);
    });

    it("paints nothing of a win during a flash that is not one", () => {
      expect(paint({ time: 0, winning: false, win: () => false }) === settled).toBe(
        true,
      );
    });

    it("holds still for a player who asked for reduced motion", () => {
      const lit = at(WIN_STILL_S / 4, true);
      expect(lit === settled).toBe(false);
      expect(at(WIN_STILL_S / 2, true) === lit).toBe(true);
    });
  });
});
