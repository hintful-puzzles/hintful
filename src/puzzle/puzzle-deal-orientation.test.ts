// A board dealt turned on its side keeps its preset's name in the type menu,
// and Puzzle hands every deal the board area `<puzzle-view>` last measured.
// Driven over a real Magnets midend behind the real worker adapter; only the
// Worker itself is absent, and nothing here draws.
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import type { EngineCore } from "../engine/midend.ts";
import { createTsEngine } from "../engine/registry.ts";
import type { ChangeNotification, PuzzleStaticAttributes } from "../engine/types.ts";
import { Puzzle } from "./puzzle.ts";
import type { RemoteWorkerPuzzle } from "./worker.ts";
import { TsWorkerPuzzle } from "./worker-adapter.ts";

function magnetsPuzzle() {
  const adapter = new TsWorkerPuzzle(
    "magnets",
    createTsEngine("magnets") as EngineCore,
  );
  let board = "";
  adapter.setCallbacks(
    (n: ChangeNotification) => {
      if (n.type === "game-id-change") board = n.restoreGameId.split(":")[0];
    },
    () => {},
  );
  const puzzle = Reflect.construct(Puzzle, [
    "magnets",
    {} as unknown as Worker,
    adapter as unknown as RemoteWorkerPuzzle,
    adapter.getStaticProperties() as PuzzleStaticAttributes,
  ]) as Puzzle;
  return { puzzle, board: () => board };
}

describe("a board dealt to fit the screen", () => {
  it("is dealt turned when the measured area is wide", async () => {
    const { puzzle, board } = magnetsPuzzle();
    await puzzle.setParams("5x6dt");
    puzzle.setBoardArea({ w: 1200, h: 700 });
    await puzzle.newGame();
    expect(board()).toBe("6x5dt");
    puzzle.setBoardArea({ w: 390, h: 640 });
    await puzzle.newGame();
    expect(board()).toBe("5x6dt");
  });

  it("is named after the preset it was dealt from", async () => {
    const { puzzle } = magnetsPuzzle();
    const presets = await puzzle.getPresets(true);
    const preset = presets.find((p) => p.params === "5x6dt");
    expect(preset?.title).toBe("5x6 Normal");
    expect(await puzzle.getParamsDescription("6x5dt")).toBe("5x6 Normal");
    expect(await puzzle.getParamsDescription("5x6dt")).toBe("5x6 Normal");
  });

  it("is not named after a preset it could not have been dealt from", async () => {
    const { puzzle } = magnetsPuzzle();
    const titles = (await puzzle.getPresets(true)).map((p) => p.title);
    const description = await puzzle.getParamsDescription("7x5dt");
    expect(description.length).toBeGreaterThan(0);
    expect(titles).not.toContain(description);
  });
});
