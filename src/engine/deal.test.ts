/**
 * A board dealt ahead: what `dealBoard` hands over, and what the midend does
 * with one when the next New game comes. Magnets is the real game here because
 * it turns, and a kept board has to be the one for the way round the deal
 * goes.
 */

import { describe, expect, it, vi } from "vitest";
import "../games/index.ts";
import { dealBoard } from "./deal.ts";
import { fakeGame } from "./fake-game.ts";
import { getTsGame } from "./registry.ts";
import { RetryLimitExceeded } from "./retry-limit.ts";
import { driveMidend } from "./testing/drive-midend.ts";
import type { DealtBoard, Size } from "./types.ts";

const UPRIGHT_PHONE: Size = { w: 390, h: 640 };
const DESKTOP: Size = { w: 1200, h: 700 };

function gameOf(puzzleId: string) {
  const game = getTsGame(puzzleId);
  if (game === null) throw new Error(`no game registered as "${puzzleId}"`);
  return game;
}

/** A midend over `fakeGame` whose generator counts its runs. */
function counted() {
  const newDesc = vi.fn(fakeGame.newDesc);
  const solve = vi.fn(fakeGame.solve);
  const d = driveMidend({ ...fakeGame, newDesc, solve });
  const id = () => d.last("game-id-change")?.currentGameId ?? "";
  return { m: d.midend, newDesc, solve, id };
}

describe("a New game handed a kept board", () => {
  it("plays it and runs no generator", () => {
    const { m, newDesc, id } = counted();
    const kept: DealtBoard = { params: m.dealParams(), desc: "g3-5", aux: null };
    expect(m.newGame(undefined, kept)).toBeNull();
    expect(id()).toBe(`${kept.params}:g3-5`);
    expect(newDesc).not.toHaveBeenCalled();
  });

  it("hands its aux to Solve, as a board it dealt itself", () => {
    const { m, solve } = counted();
    m.newGame(undefined, { params: m.dealParams(), desc: "g3-5", aux: "the answer" });
    m.solve();
    expect(solve.mock.calls[0]?.[2]).toBe("the answer");
  });

  it("deals afresh where the kept board is of another type", () => {
    const { m, newDesc, id } = counted();
    expect(m.newGame(undefined, { params: "t4", desc: "g4-5", aux: null })).toBeNull();
    expect(newDesc).toHaveBeenCalledOnce();
    expect(id().startsWith(`${m.dealParams()}:`)).toBe(true);
    expect(id()).not.toContain("g4-5");
  });

  it("is asked for the board turned to fit, and plays that one turned", () => {
    const game = gameOf("magnets");
    const d = driveMidend(game);
    const m = d.midend;
    const board = () => d.last("game-id-change")?.currentGameId ?? "";
    m.setParams("5x6dt");
    expect(m.dealParams(UPRIGHT_PHONE)).toBe("5x6dt");
    expect(m.dealParams(DESKTOP)).toBe("6x5dt");

    const turned = dealBoard(game, "6x5dt");
    if (turned === null) throw new Error("Magnets dealt no 6x5");
    expect(m.newGame(DESKTOP, turned)).toBeNull();
    expect(board()).toBe(`6x5dt:${turned.desc}`);
    // The type chosen is still the preset, so the next deal turns back.
    expect(m.getParams()).toBe("5x6dt");

    // The same board is not the one an upright screen deals.
    m.newGame(UPRIGHT_PHONE, turned);
    expect(board().startsWith("5x6dt:")).toBe(true);
  });
});

describe("dealBoard", () => {
  it("deals a board the game's own midend opens", () => {
    const game = gameOf("magnets");
    const board = dealBoard(game, "6x5dt");
    expect(board?.params).toBe("6x5dt");
    const { midend } = driveMidend(game);
    expect(midend.newGameFromId(`6x5dt:${board?.desc}`)).toBeNull();
  });

  it("deals nothing where the generator runs out", () => {
    const newDesc = vi.fn(() => {
      throw new RetryLimitExceeded("fake", 1);
    });
    expect(dealBoard({ ...fakeGame, newDesc }, "t3")).toBeNull();
    expect(newDesc).toHaveBeenCalledOnce();
  });

  it("does not run the generator on params the game refuses to deal", () => {
    // A 6x6 Group at Hard loads by its desc and is refused when dealing, so
    // the type can be left there with nobody waiting for a board.
    const game = gameOf("group");
    const newDesc = vi.fn(game.newDesc);
    expect(dealBoard({ ...game, newDesc }, "6dx")).toBeNull();
    expect(newDesc).not.toHaveBeenCalled();
  });

  it("lets any other error through", () => {
    const newDesc = () => {
      throw new Error("a bug");
    };
    expect(() => dealBoard({ ...fakeGame, newDesc }, "t3")).toThrow("a bug");
  });
});
