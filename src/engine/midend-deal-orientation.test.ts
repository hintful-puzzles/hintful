/**
 * The midend deals a board whichever way round fits the board area better, and
 * only at the moment it deals. Real games, because what is under test is how
 * the decision meets a game's own `transposeParams` and `computeSize`: Magnets
 * turns, Samegame (gravity) never does, and Light Up's default is square.
 */

import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { getTsGame } from "./registry.ts";
import { driveMidend } from "./testing/drive-midend.ts";
import type { Size } from "./types.ts";

const UPRIGHT_PHONE: Size = { w: 390, h: 640 };
const DESKTOP: Size = { w: 1200, h: 700 };

function engine(puzzleId: string) {
  const game = getTsGame(puzzleId);
  if (game === null) throw new Error(`no game registered as "${puzzleId}"`);
  const d = driveMidend(game);
  const board = () => d.last("game-id-change")?.restoreGameId.split(":")[0] ?? "";
  return { m: d.midend, board };
}

describe("dealing to fit the board area", () => {
  it("deals a turning game's portrait preset turned for a wide area", () => {
    const { m, board } = engine("magnets");
    expect(m.setParams("5x6dt")).toBeNull();
    m.newGame(DESKTOP);
    expect(board()).toBe("6x5dt");
    // The choice is still the preset as chosen, so the next deal on an upright
    // screen turns back.
    expect(m.getParams()).toBe("5x6dt");
    m.newGame(UPRIGHT_PHONE);
    expect(board()).toBe("5x6dt");
  });

  it("keeps the chosen orientation when that already fits better", () => {
    const { m, board } = engine("magnets");
    m.setParams("5x6dt");
    m.newGame(UPRIGHT_PHONE);
    expect(board()).toBe("5x6dt");
  });

  it("never turns a game that cannot be turned", () => {
    const { m, board } = engine("samegame");
    m.setParams("10x15c3s2");
    m.newGame(DESKTOP);
    expect(board()).toBe("10x15c3s2");
  });

  it("leaves a square board as chosen", () => {
    const { m, board } = engine("lightup");
    const chosen = m.getParams();
    m.newGame(DESKTOP);
    expect(board()).toBe(chosen);
  });

  it("deals the chosen orientation when no area is known", () => {
    const { m, board } = engine("magnets");
    m.setParams("5x6dt");
    m.newGame();
    expect(board()).toBe("5x6dt");
  });

  it("shows the dealt size in the Custom dialog, and names the turn", () => {
    const { m } = engine("magnets");
    m.setParams("5x6dt");
    m.newGame(DESKTOP);
    expect(m.getCustomParams()).toMatchObject({ width: "6", height: "5" });
    expect(m.turnParams("6x5dt")).toBe("5x6dt");
    // A board dealt as chosen shows the choice.
    m.newGame(UPRIGHT_PHONE);
    expect(m.getCustomParams()).toMatchObject({ width: "5", height: "6" });
  });

  it("has no turn for a game that cannot be turned", () => {
    const { m } = engine("samegame");
    expect(m.turnParams("10x15c3s2")).toBeNull();
  });

  it("never turns a board loaded from an id", () => {
    const { m, board } = engine("magnets");
    m.newGame(UPRIGHT_PHONE);
    const id = `${board()}#fixed-seed`;
    m.newGame(DESKTOP);
    expect(m.newGameFromId(id)).toBeNull();
    expect(board()).toBe(id.split("#")[0]);
  });
});
