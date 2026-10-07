// A page load has a `Puzzle` before it has a board, and the worker is free to
// answer through the first deal, which runs on another thread. These drive
// `Puzzle` against a stub worker that records every method asked of it.
import { describe, expect, it } from "vitest";
import type { PuzzleStaticAttributes } from "../engine/types.ts";
import { awaitsFirstBoard } from "./board-commands.ts";
import { Puzzle } from "./puzzle.ts";

const ATTRS: PuzzleStaticAttributes = {
  canSolve: true,
  canHint: true,
  canCheck: true,
  hasReference: true,
  canMarkAll: true,
  ignoresSecondaryButton: false,
  wantsStatusbar: true,
  paletteScheme: { board: 0, darkSwaps: [] },
};

/** Each command of `Puzzle` that acts on the board in play. */
const COMMANDS: Record<string, (p: Puzzle) => Promise<unknown>> = {
  hint: (p) => p.hint(),
  executeHint: (p) => p.executeHint(),
  solve: (p) => p.solve(),
  check: (p) => p.check(),
  undo: (p) => p.undo(),
  redo: (p) => p.redo(),
  restartGame: (p) => p.restartGame(),
  saveGame: (p) => p.saveGame(),
  formatAsText: (p) => p.formatAsText(),
  processKey: (p) => p.processKey(104),
  processMouse: (p) => p.processMouse({ x: 1, y: 1 }, 0x200),
  processHover: (p) => p.processHover({ x: 1, y: 1 }),
  getReference: (p) => p.getReference(),
  selectReference: (p) => p.selectReference(null),
};

function makePuzzle(): { puzzle: Puzzle; asked: string[]; dealBoard: () => void } {
  const asked: string[] = [];
  const worker = new Proxy(
    {},
    {
      // Not a thenable: `Puzzle.board` resolves to this object.
      get: (_, name) =>
        name === "then"
          ? undefined
          : async () => {
              asked.push(String(name));
              return null;
            },
    },
  );
  const puzzle = Reflect.construct(Puzzle, ["test", {}, worker, ATTRS]) as Puzzle;
  const dealBoard = () =>
    void Reflect.get(
      puzzle,
      "notifyChange",
    )({
      type: "game-id-change",
      currentGameId: "p:d",
    });
  return { puzzle, asked, dealBoard };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("a command sent before the first board", () => {
  for (const [name, send] of Object.entries(COMMANDS)) {
    it(`${name} waits for the board, then runs`, async () => {
      const { puzzle, asked, dealBoard } = makePuzzle();
      const answer = send(puzzle);
      await tick();
      expect(asked).toEqual([]);
      expect(puzzle.hasBoard).toBe(false);
      dealBoard();
      await answer;
      expect(asked).toEqual([name]);
      expect(puzzle.hasBoard).toBe(true);
    });
  }

  it("a board from an id or a save is asked for at once: nothing else brings one", async () => {
    const { puzzle, asked } = makePuzzle();
    await puzzle.newGameFromId("p:d");
    await puzzle.loadGame(new Uint8Array(1));
    expect(asked).toEqual(["newGameFromId", "loadGame"]);
  });
});

describe("the chrome's word for it", () => {
  it("a board command's control is unavailable until the board arrives", () => {
    const { puzzle, dealBoard } = makePuzzle();
    expect(awaitsFirstBoard("hint", puzzle)).toBe(true);
    expect(awaitsFirstBoard("hint", null)).toBe(true);
    dealBoard();
    expect(awaitsFirstBoard("hint", puzzle)).toBe(false);
  });

  it("a command that needs no board is offered throughout", () => {
    const { puzzle } = makePuzzle();
    expect(awaitsFirstBoard("new-game", puzzle)).toBe(false);
    expect(awaitsFirstBoard("load-game", puzzle)).toBe(false);
  });
});
