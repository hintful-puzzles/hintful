// The next board dealt ahead and played, through the real `Puzzle`, the real
// worker adapter over a real midend, and the real store on fake-indexeddb.
// Only the second worker is stood in for: each deal it is asked for is held
// until the test lets it finish. A New game with no board kept waits on one. The setup import comes first.
import "../test-setup/indexeddb.ts";
import { releaseProxy } from "comlink";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../games/index.ts";
import { dealBoard } from "../engine/deal.ts";
import type { EngineCore } from "../engine/midend.ts";
import { createTsEngine, getTsGame } from "../engine/registry.ts";
import type {
  ChangeNotification,
  DealtBoard,
  PuzzleStaticAttributes,
} from "../engine/types.ts";
import { KeptBoards } from "../store/kept-boards.ts";
import {
  DealAhead,
  type RunningDeal,
  SLOW_DEAL_MS,
  SLOW_TYPE_BOARDS,
} from "./deal-ahead.ts";
import { DEAL_PENDING_MS, Puzzle } from "./puzzle.ts";
import type { RemoteWorkerPuzzle, TimedDeal } from "./worker.ts";
import { TsWorkerPuzzle } from "./worker-adapter.ts";

const UPRIGHT_PHONE = { w: 390, h: 640 };
const DESKTOP = { w: 1200, h: 700 };

const store = new KeptBoards("this-build");

/** One deal the page asked its second worker for. */
interface AskedDeal {
  params: string;
  stopped: boolean;
  /** Let it end: with a board the game really deals, or with none. `ms` is
   * how long the worker says the generator took. */
  finish(found?: "a board" | "nothing", ms?: number): DealtBoard | null;
  /** Let it end as a worker that could not start ends. */
  fail(error: Error): void;
}

/** How many boards the store holds for a type. */
const kept = async (puzzleId: string, params: string) =>
  (await store.dealTimes(puzzleId, params)).length;

async function waitFor(predicate: () => boolean | Promise<boolean>): Promise<void> {
  const deadline = Date.now() + 2000;
  while (!(await predicate())) {
    if (Date.now() > deadline) throw new Error("waited two seconds for nothing");
    await new Promise((r) => setTimeout(r, 2));
  }
}

/**
 * Fake the clock the page's own wait reads, and leave `setImmediate` real:
 * the store's transactions run on it, and one left waiting on a fake clock
 * holds up every later test's.
 */
const fakeTimeouts = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

/** `waitFor` for a test whose timeouts are faked: it turns on that real clock. */
async function soon(predicate: () => boolean): Promise<void> {
  for (let turns = 0; !predicate(); turns++) {
    if (turns > 10_000) throw new Error("waited ten thousand turns for nothing");
    await kept("magnets", "a turn of the store");
  }
}

/** Long enough for anything the page had queued to have started. */
const idle = () => new Promise((r) => setTimeout(r, 30));

function puzzleOf(id: string) {
  const game = getTsGame(id);
  if (game === null) throw new Error(`no game registered as "${id}"`);
  // `releaseProxy` is Comlink's, and all of it that `Puzzle.delete` calls.
  const adapter = Object.assign(
    new TsWorkerPuzzle(id, createTsEngine(id) as EngineCore),
    { [releaseProxy]: () => {} },
  );
  const asked: AskedDeal[] = [];
  const startDeal = (_puzzleId: string, params: string): RunningDeal => {
    let settle = (_dealt: TimedDeal) => {};
    let reject = (_error: Error) => {};
    const deal: AskedDeal = {
      params,
      stopped: false,
      finish(found = "a board", ms = 0) {
        const board = found === "a board" ? dealBoard(game, params) : null;
        settle({ board, ms });
        return board;
      },
      fail: (error) => reject(error),
    };
    asked.push(deal);
    return {
      dealt: new Promise((resolve, fail) => {
        settle = resolve;
        reject = fail;
      }),
      stop() {
        deal.stopped = true;
      },
    };
  };
  let terminated = false;
  const puzzle = Reflect.construct(Puzzle, [
    id,
    { terminate: () => (terminated = true) },
    adapter as unknown as RemoteWorkerPuzzle,
    adapter.getStaticProperties() as PuzzleStaticAttributes,
    new DealAhead(id, store, startDeal),
  ]) as Puzzle;
  let gameId = "";
  adapter.setCallbacks(
    (n: ChangeNotification) => {
      if (n.type === "game-id-change") gameId = n.currentGameId;
      // What `Puzzle.initialize` wires up over Comlink.
      void Reflect.get(puzzle, "notifyChange")(n);
    },
    () => {},
  );
  return {
    puzzle,
    adapter,
    asked,
    gameId: () => gameId,
    terminated: () => terminated,
  };
}

beforeEach(() => store.clear());

describe("the next board, dealt ahead", () => {
  it("is asked for once the board area is known, and kept", async () => {
    const { puzzle, asked } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    await idle();
    // Which way round the next deal goes is not known yet.
    expect(asked).toEqual([]);

    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    expect(asked[0].params).toBe("5x6dt");
    const board = asked[0].finish();
    await waitFor(async () => (await kept("magnets", "5x6dt")) === 1);
    expect(board).not.toBeNull();
  });

  it("is the board the next New game plays, and another is dealt behind it", async () => {
    const { puzzle, asked, gameId } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    const ahead = asked[0].finish();
    await waitFor(async () => (await kept("magnets", "5x6dt")) === 1);

    expect(await puzzle.newGame()).toBe("dealt");
    expect(gameId()).toBe(`5x6dt:${ahead?.desc}`);
    expect(await kept("magnets", "5x6dt")).toBe(0);
    await waitFor(() => asked.length === 2);
    expect(asked[1].params).toBe("5x6dt");
  });

  it("keeps one board of a type whose deal was quick", async () => {
    const { puzzle, asked } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    asked[0].finish("a board", SLOW_DEAL_MS - 1);
    await waitFor(async () => (await kept("magnets", "5x6dt")) === 1);
    await idle();
    expect(asked.length).toBe(1);
  });

  it("keeps dealing a type whose deal was slow, and New game plays them in turn", async () => {
    const { puzzle, asked, gameId } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    const ahead: (DealtBoard | null)[] = [];
    // One slow deal makes the type slow, however quick the ones after it.
    for (const ms of [SLOW_DEAL_MS, 0, 0]) {
      await waitFor(() => asked.length === ahead.length + 1);
      ahead.push(asked[ahead.length].finish("a board", ms));
      await waitFor(async () => (await kept("magnets", "5x6dt")) === ahead.length);
    }
    expect(ahead.length).toBe(SLOW_TYPE_BOARDS);
    await idle();
    expect(asked.length).toBe(SLOW_TYPE_BOARDS);

    // Three New games running, each a kept board and none a wait. The deal
    // behind them is held, so none of the three is one dealt meanwhile.
    for (const board of ahead) {
      expect(await puzzle.newGame()).toBe("dealt");
      expect(gameId()).toBe(`5x6dt:${board?.desc}`);
    }
    expect(await kept("magnets", "5x6dt")).toBe(0);
    await waitFor(() => asked.length === SLOW_TYPE_BOARDS + 1);

    // The slow board is played and gone, and the type is slow still.
    asked[SLOW_TYPE_BOARDS].finish("a board", 0);
    await waitFor(() => asked.length === SLOW_TYPE_BOARDS + 2);
  });

  it("knows on a later visit that a type is slow, from a board kept for it", async () => {
    await store.keep("magnets", { params: "5x6dt", desc: "unplayed", aux: null }, 7000);
    const { puzzle, asked } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    asked[0].finish();
    await waitFor(() => asked.length === 2);
    asked[1].finish();
    await waitFor(async () => (await kept("magnets", "5x6dt")) === SLOW_TYPE_BOARDS);
    await idle();
    expect(asked.length).toBe(2);
  });

  it("is not asked for twice while one is on its way or kept", async () => {
    const { puzzle, asked } = puzzleOf("magnets");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    puzzle.setBoardArea({ w: 400, h: 640 });
    await idle();
    expect(asked.length).toBe(1);

    asked[0].finish();
    await waitFor(async () => (await kept("magnets", asked[0].params)) === 1);
    puzzle.setBoardArea({ w: 410, h: 640 });
    await idle();
    expect(asked.length).toBe(1);
  });

  it("follows the type chosen, and stops the deal for the type left", async () => {
    const { puzzle, asked, adapter } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);

    const other = (await puzzle.getPresets(true)).find(
      (preset) => !preset.submenu && preset.params !== "5x6dt",
    );
    if (!other) throw new Error("Magnets has one preset");
    expect(await puzzle.setParams(other.params)).toBeNull();
    await waitFor(() => asked.length === 2);
    expect(asked[0].stopped).toBe(true);
    expect(asked[1].stopped).toBe(false);
    expect(asked[1].params).toBe(adapter.dealParams(UPRIGHT_PHONE));
    expect(asked[1].params).not.toBe("5x6dt");
  });

  it("follows the screen turned round", async () => {
    const { puzzle, asked } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    puzzle.setBoardArea(DESKTOP);
    await waitFor(() => asked.length === 2);
    expect(asked.map((d) => d.params)).toEqual(["5x6dt", "6x5dt"]);
    expect(asked[0].stopped).toBe(true);
  });

  it("does not search again for a type that had no board, until one is asked for", async () => {
    const { puzzle, asked } = puzzleOf("magnets");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    asked[0].finish("nothing");
    await idle();

    puzzle.setBoardArea({ w: 400, h: 640 });
    await idle();
    expect(asked.length).toBe(1);

    const dealing = puzzle.newGame();
    await waitFor(() => asked.length === 2);
    asked[1].finish();
    expect(await dealing).toBe("dealt");
  });

  it("stops with the puzzle", async () => {
    const { puzzle, asked, terminated } = puzzleOf("magnets");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    const dealing = puzzle.newGame();
    await waitFor(() => asked.length === 1);
    await puzzle.delete();
    expect(asked[0].stopped).toBe(true);
    expect(terminated()).toBe(true);
    expect(await dealing).toBe("stopped");
  });
});

describe("a New game that finds no board kept", () => {
  /** A puzzle with a board in play and nothing kept or on its way: the type's
   * one deal ahead found nothing, so it rests until a board is asked for. */
  async function inPlay() {
    const h = puzzleOf("magnets");
    await h.puzzle.setParams("5x6dt");
    h.puzzle.setBoardArea(UPRIGHT_PHONE);
    const first = h.puzzle.newGame();
    await waitFor(() => h.asked.length === 1);
    h.asked[0].finish();
    expect(await first).toBe("dealt");
    await waitFor(() => h.asked.length === 2);
    h.asked[1].finish("nothing");
    await idle();
    // The generator, were the engine to run it on the board's own thread.
    const engineDeal = vi.spyOn(h.adapter, "newGame");
    return { ...h, engineDeal, board: h.gameId() };
  }

  it("waits on a deal off the board's thread, and plays what it finds", async () => {
    const { puzzle, asked, engineDeal, gameId, board } = await inPlay();
    const dealing = puzzle.newGame();
    await waitFor(() => asked.length === 3);
    await idle();
    // The board in play is there to be played: nothing has been asked of
    // its thread, and the view has not been told a board is on its way in.
    expect(engineDeal).not.toHaveBeenCalled();
    expect(puzzle.generatingGame).toBe(false);
    expect(gameId()).toBe(board);

    const found = asked[2].finish();
    expect(await dealing).toBe("dealt");
    expect(gameId()).toBe(`5x6dt:${found?.desc}`);
    // Handed over, and never kept as well.
    expect(engineDeal).toHaveBeenCalledWith(UPRIGHT_PHONE, found);
    expect(await kept("magnets", "5x6dt")).toBe(0);
  });

  it("waits on the deal ahead where one is under way for the type", async () => {
    const { puzzle, asked, gameId } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    const dealing = puzzle.newGame();
    await idle();
    expect(asked.length).toBe(1);
    expect(asked[0].stopped).toBe(false);

    const found = asked[0].finish();
    expect(await dealing).toBe("dealt");
    expect(gameId()).toBe(`5x6dt:${found?.desc}`);
    expect(await kept("magnets", "5x6dt")).toBe(0);
  });

  // The deal ahead ends while a New game is still reading the store, which
  // told it no board is kept: held here by holding that read open.
  it.each([
    ["nothing", "deals for the player all the same"],
    ["a board", "plays the board it found"],
  ] as const)("where the deal ahead found %s as the wait began, %s", async (found, _then) => {
    const { puzzle, asked, gameId } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    let ahead: DealtBoard | null = null;
    vi.spyOn(store, "take").mockImplementationOnce(async () => {
      ahead = asked[0].finish(found);
      await idle();
      return null;
    });
    const dealing = puzzle.newGame();
    if (found === "nothing") {
      await waitFor(() => asked.length === 2);
      ahead = asked[1].finish();
    }
    expect(await dealing).toBe("dealt");
    expect(gameId()).toBe(`5x6dt:${(ahead as DealtBoard | null)?.desc}`);
  });

  it("says it is looking after a second, and offers the way out", async () => {
    const { puzzle, asked } = await inPlay();
    fakeTimeouts();
    try {
      const dealing = puzzle.newGame();
      await soon(() => asked.length === 3);
      await vi.advanceTimersByTimeAsync(DEAL_PENDING_MS - 1);
      expect(puzzle.dealPending).toBe(false);
      expect(puzzle.canStopDeal).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(puzzle.dealPending).toBe(true);
      expect(puzzle.canStopDeal).toBe(true);
      // A hint asked of the board in play writes here, and not over that.
      expect(puzzle.helpMessage).toBe("");
      asked[2].finish();
      expect(await dealing).toBe("dealt");
      expect(puzzle.dealPending).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("offers no way out to a caller with nothing to go back to", async () => {
    const { puzzle, asked, gameId, board } = await inPlay();
    fakeTimeouts();
    try {
      const dealing = puzzle.newGame({ canStop: false });
      await soon(() => asked.length === 3);
      await vi.advanceTimersByTimeAsync(DEAL_PENDING_MS);
      expect(puzzle.dealPending).toBe(true);
      expect(puzzle.canStopDeal).toBe(false);
      await puzzle.stopDeal();
      expect(asked[2].stopped).toBe(false);
      asked[2].finish();
      expect(await dealing).toBe("dealt");
      expect(gameId()).not.toBe(board);
    } finally {
      vi.useRealTimers();
    }
  });

  it("is stopped by the player, and the board and its type are as they were", async () => {
    const { puzzle, asked, engineDeal, gameId, board } = await inPlay();
    const other = (await puzzle.getPresets(true)).find(
      (preset) => !preset.submenu && preset.params !== "5x6dt",
    );
    if (!other) throw new Error("Magnets has one preset");
    const asksFor = () => asked.filter((deal) => deal.params === other.params);
    await puzzle.setParams(other.params);
    await waitFor(() => asksFor().length === 1);
    fakeTimeouts();
    try {
      const dealing = puzzle.newGame();
      // The store has to answer that no board is kept before there is a
      // wait to stop, and nothing outside says when it has. A stop cannot
      // come sooner in the app, where its control is a second away.
      let turns = 0;
      await soon(() => ++turns > 50);
      await vi.advanceTimersByTimeAsync(DEAL_PENDING_MS);
      await puzzle.stopDeal();
      expect(await dealing).toBe("stopped");
    } finally {
      vi.useRealTimers();
    }
    expect(asksFor()[0].stopped).toBe(true);
    expect(puzzle.dealPending).toBe(false);
    expect(engineDeal).not.toHaveBeenCalled();
    expect(gameId()).toBe(board);
    await waitFor(() => puzzle.params === "5x6dt");

    // The type left is not searched again behind the player's back.
    await puzzle.setParams(other.params);
    await idle();
    expect(asksFor().length).toBe(1);

    // Asked for again, it is.
    const again = puzzle.newGame();
    await waitFor(() => asksFor().length === 2);
    asksFor()[1].finish();
    expect(await again).toBe("dealt");
  });

  it("answers as the engine does where the deal finds no board", async () => {
    const { puzzle, adapter, asked, engineDeal, gameId, board } = await inPlay();
    const dealing = puzzle.newGame();
    await waitFor(() => asked.length === 3);
    asked[2].finish("nothing");
    expect(await dealing).toEqual({ refusal: adapter.dealFoundNone(UPRIGHT_PHONE) });
    expect(engineDeal).not.toHaveBeenCalled();
    expect(gameId()).toBe(board);
  });

  it("gives way to a New game of another type, whose deal replaces its own", async () => {
    const { puzzle, asked, adapter } = await inPlay();
    const first = puzzle.newGame();
    await waitFor(() => asked.length === 3);
    const other = (await puzzle.getPresets(true)).find(
      (preset) => !preset.submenu && preset.params !== "5x6dt",
    );
    if (!other) throw new Error("Magnets has one preset");
    await puzzle.setParams(other.params);
    // The wait outlasts the choice: nothing is abandoned until a board of
    // the new type is asked for.
    await idle();
    expect(asked[2].stopped).toBe(false);

    const second = puzzle.newGame();
    expect(await first).toBe("stopped");
    await waitFor(() => asked.length === 4);
    expect(asked[2].stopped).toBe(true);
    expect(asked[3].params).toBe(adapter.dealParams(UPRIGHT_PHONE));
    asked[3].finish();
    expect(await second).toBe("dealt");
    expect(puzzle.params).toBe(other.params);
  });

  it("deals the type chosen meanwhile, where its own board arrives first", async () => {
    const { puzzle, asked, adapter, engineDeal, gameId } = await inPlay();
    const dealing = puzzle.newGame();
    await waitFor(() => asked.length === 3);
    const other = (await puzzle.getPresets(true)).find(
      (preset) => !preset.submenu && preset.params !== "5x6dt",
    );
    if (!other) throw new Error("Magnets has one preset");
    await puzzle.setParams(other.params);
    asked[2].finish();

    // Handed the board of the type left, the engine would have run the
    // generator for the type chosen on the board's own thread.
    await waitFor(() => asked.length === 4);
    expect(engineDeal).not.toHaveBeenCalled();
    const found = asked[3].finish();
    expect(await dealing).toBe("dealt");
    expect(engineDeal).toHaveBeenCalledExactlyOnceWith(UPRIGHT_PHONE, found);
    expect(gameId()).toBe(`${adapter.dealParams(UPRIGHT_PHONE)}:${found?.desc}`);
  });

  it("ends when the player opens another board", async () => {
    const { puzzle, asked, gameId, board } = await inPlay();
    const dealing = puzzle.newGame();
    await waitFor(() => asked.length === 3);
    expect(await puzzle.newGameFromId(board)).toBeNull();
    expect(await dealing).toBe("stopped");
    expect(asked[2].stopped).toBe(true);
    expect(gameId()).toBe(board);
  });

  it("fails as the deal fails, where its worker never started", async () => {
    const { puzzle, asked } = await inPlay();
    const dealing = puzzle.newGame();
    await waitFor(() => asked.length === 3);
    asked[2].fail(new Error("the worker's script could not be loaded"));
    await expect(dealing).rejects.toThrow("could not be loaded");
    expect(puzzle.dealPending).toBe(false);
  });
});
