/**
 * A board dealt ahead: what `dealBoard` hands over, and what the midend does
 * with one when the next New game comes. Magnets is the real game here because
 * it turns, and a kept board has to be the one for the way round the deal
 * goes.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import "../games/index.ts";
import { dealBoard, generate } from "./deal.ts";
import { fakeGame } from "./fake-game.ts";
import { randomNew, randomUpto } from "./random/index.ts";
import { getTsGame } from "./registry.ts";
import { MAX_REGENERATE, RetryLimitExceeded, retryLimit } from "./retry-limit.ts";
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

  describe("bounded by the deal's deadline", () => {
    afterEach(() => vi.restoreAllMocks());

    /** fakeGame, dealing the board of the first draw in `oneIn` to come up
     * zero, or none at all where `oneIn` is `null`. */
    function rare(oneIn: number | null): typeof fakeGame {
      return {
        ...fakeGame,
        newDesc: (p, rng) => {
          const attempt = retryLimit("fake: generation");
          for (let tries = 1; ; tries++) {
            attempt();
            const draw = randomUpto(rng, oneIn ?? 2);
            if (oneIn !== null && draw === 0) return { desc: `g${p.target}-${tries}` };
          }
        },
      };
    }

    /** A clock that moves a millisecond each time it is read. */
    function tickingClock(): void {
      let ms = 0;
      vi.spyOn(performance, "now").mockImplementation(() => ms++);
    }

    it("answers a deal that never finds a board, at the deadline", () => {
      tickingClock();
      const game = rare(null);
      const newDesc = vi.fn(game.newDesc);
      expect(
        generate({ ...game, newDesc }, { target: 3 }, randomNew("s"), 500),
      ).toBeNull();
      expect(newDesc).toHaveBeenCalledOnce();
    });

    it("bounds the same generator by its count where no deal armed one", () => {
      tickingClock();
      expect(() => rare(null).newDesc({ target: 3 }, randomNew("s"))).toThrow(
        `fake: generation: gave up after ${MAX_REGENERATE} attempts`,
      );
    });

    it("deals the board the seed gives, however long the deadline", () => {
      const game = rare(50);
      const direct = game.newDesc({ target: 3 }, randomNew("s"));
      tickingClock();
      for (const deadlineMs of [1_000, 100_000])
        expect(generate(game, { target: 3 }, randomNew("s"), deadlineMs)).toEqual(
          direct,
        );
    });

    it("finds a board rarer than the count allows, and never another in its place", () => {
      const game = rare(4 * MAX_REGENERATE);
      const seed = "rare";
      expect(() => game.newDesc({ target: 3 }, randomNew(seed))).toThrow(
        RetryLimitExceeded,
      );
      tickingClock();
      const found = generate(game, { target: 3 }, randomNew(seed), 10_000_000);
      if (found === null) throw new Error("the deal found no board");
      // The try it was found at is past where the count gave up.
      expect(Number(found.desc.split("-")[1])).toBeGreaterThan(MAX_REGENERATE);
      // A deadline short of that try deals nothing, and not an earlier board.
      expect(generate(game, { target: 3 }, randomNew(seed), MAX_REGENERATE)).toBeNull();
    });
  });

  it("deals again where the board comes solved as dealt", () => {
    // `g0-…` is a board whose target is met before a move.
    const descs = ["g0-1", "g0-2", "g3-7"];
    const newDesc = vi.fn(() => ({ desc: descs.shift() as string }));
    const newState = (_p: { target: number }, desc: string) => ({
      count: 0,
      target: Number(desc[1]),
    });
    expect(dealBoard({ ...fakeGame, newDesc, newState }, "t3")?.desc).toBe("g3-7");
    expect(newDesc).toHaveBeenCalledTimes(3);
  });

  it("deals nothing where every board comes solved as dealt", () => {
    const newDesc = vi.fn(() => ({ desc: "g0-1" }));
    const newState = () => ({ count: 0, target: 0 });
    expect(dealBoard({ ...fakeGame, newDesc, newState }, "t3")).toBeNull();
  });

  // Each dealt one board in twelve, or in 25, solved before a move.
  it.each([
    ["rect", "3x3de"],
    ["rect", "9x9e2de"],
    ["netslide", "3x3b1m1"],
  ])("%s at %s is never dealt solved", (id, params) => {
    const game = gameOf(id);
    const decoded = game.decodeParams(params);
    for (let n = 0; n < 60; n++) {
      const board = dealBoard(game, params);
      if (board === null) throw new Error(`${id} dealt no ${params}`);
      expect(game.status(game.newState(decoded, board.desc)), board.desc).toBe(
        "ongoing",
      );
    }
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
