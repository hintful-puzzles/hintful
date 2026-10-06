// The next board dealt ahead and played, through the real `Puzzle`, the real
// worker adapter over a real midend, and the real store on fake-indexeddb.
// Only the second worker is stood in for: each deal it is asked for is held
// until the test lets it finish. The setup import comes first.
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
import { DealAhead, type RunningDeal } from "./deal-ahead.ts";
import { DEAL_PENDING_MESSAGE, DEAL_PENDING_MS, Puzzle } from "./puzzle.ts";
import type { RemoteWorkerPuzzle } from "./worker.ts";
import { TsWorkerPuzzle } from "./worker-adapter.ts";

const UPRIGHT_PHONE = { w: 390, h: 640 };
const DESKTOP = { w: 1200, h: 700 };

const store = new KeptBoards("this-build");

/** One deal the page asked its second worker for. */
interface AskedDeal {
  params: string;
  stopped: boolean;
  /** Let it end: with a board the game really deals, or with none. */
  finish(found?: "a board" | "nothing"): DealtBoard | null;
}

async function waitFor(predicate: () => boolean | Promise<boolean>): Promise<void> {
  const deadline = Date.now() + 2000;
  while (!(await predicate())) {
    if (Date.now() > deadline) throw new Error("waited two seconds for nothing");
    await new Promise((r) => setTimeout(r, 2));
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
    let settle = (_board: DealtBoard | null) => {};
    const deal: AskedDeal = {
      params,
      stopped: false,
      finish(found = "a board") {
        const board = found === "a board" ? dealBoard(game, params) : null;
        settle(board);
        return board;
      },
    };
    asked.push(deal);
    return {
      board: new Promise((resolve) => {
        settle = resolve;
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
    await puzzle.newGame();
    await idle();
    // Which way round the next deal goes is not known yet.
    expect(asked).toEqual([]);

    puzzle.setBoardArea(UPRIGHT_PHONE);
    await waitFor(() => asked.length === 1);
    expect(asked[0].params).toBe("5x6dt");
    const board = asked[0].finish();
    await waitFor(() => store.has("magnets", "5x6dt"));
    expect(board).not.toBeNull();
  });

  it("is the board the next New game plays, and another is dealt behind it", async () => {
    const { puzzle, asked, gameId } = puzzleOf("magnets");
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await puzzle.newGame();
    await waitFor(() => asked.length === 1);
    const kept = asked[0].finish();
    await waitFor(() => store.has("magnets", "5x6dt"));

    expect(await puzzle.newGame()).toBeNull();
    expect(gameId()).toBe(`5x6dt:${kept?.desc}`);
    expect(await store.has("magnets", "5x6dt")).toBe(false);
    await waitFor(() => asked.length === 2);
    expect(asked[1].params).toBe("5x6dt");
  });

  it("is not asked for twice while one is on its way or kept", async () => {
    const { puzzle, asked } = puzzleOf("magnets");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await puzzle.newGame();
    await waitFor(() => asked.length === 1);
    puzzle.setBoardArea({ w: 400, h: 640 });
    await idle();
    expect(asked.length).toBe(1);

    asked[0].finish();
    await waitFor(() => store.has("magnets", asked[0].params));
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
    await puzzle.newGame();
    await waitFor(() => asked.length === 1);
    asked[0].finish("nothing");
    await idle();

    puzzle.setBoardArea({ w: 400, h: 640 });
    await idle();
    expect(asked.length).toBe(1);

    await puzzle.newGame();
    await waitFor(() => asked.length === 2);
  });

  it("says it is looking where a deal goes a second unanswered", async () => {
    const { puzzle, adapter } = puzzleOf("magnets");
    await puzzle.newGame();
    expect(puzzle.helpMessage).toBe("");

    // A generator that has not come back: the deal is held open.
    let finish = (_refusal: string | null) => {};
    const slow = new Promise<string | null>((resolve) => {
      finish = resolve;
    });
    Object.assign(adapter, { newGame: () => slow });
    vi.useFakeTimers();
    try {
      const dealing = puzzle.newGame();
      await vi.advanceTimersByTimeAsync(DEAL_PENDING_MS - 1);
      expect(puzzle.helpMessage).toBe("");
      await vi.advanceTimersByTimeAsync(1);
      expect(puzzle.helpMessage).toBe(DEAL_PENDING_MESSAGE);
      expect(puzzle.generatingGame).toBe(true);
      finish(null);
      await dealing;
      expect(puzzle.helpMessage).toBe("");
      expect(puzzle.generatingGame).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("stops with the puzzle", async () => {
    const { puzzle, asked, terminated } = puzzleOf("magnets");
    puzzle.setBoardArea(UPRIGHT_PHONE);
    await puzzle.newGame();
    await waitFor(() => asked.length === 1);
    await puzzle.delete();
    expect(asked[0].stopped).toBe(true);
    expect(terminated()).toBe(true);
  });
});
