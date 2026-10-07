// Checkpoints are move numbers on one board. These drive `Puzzle` with the
// state notifications the engine sends as a board is replaced and brought back
// (`NotifyGameStateChange.board`), against a stub worker.
import { describe, expect, it } from "vitest";
import type { NotifyGameStateChange, PuzzleStaticAttributes } from "../engine/types.ts";
import { BOARD_BROUGHT_BACK, Puzzle } from "./puzzle.ts";

const ATTRS: PuzzleStaticAttributes = {
  canSolve: true,
  canHint: true,
  canCheck: true,
  hasReference: false,
  canMarkAll: false,
  ignoresSecondaryButton: false,
  wantsStatusbar: true,
  paletteScheme: { board: 0, darkSwaps: [] },
};

function makePuzzle() {
  const worker = new Proxy({}, { get: () => async () => null });
  const puzzle = Reflect.construct(Puzzle, ["test", {}, worker, ATTRS]) as Puzzle;
  const state = (change: Partial<NotifyGameStateChange>) =>
    void Reflect.get(
      puzzle,
      "notifyChange",
    )({
      type: "game-state-change",
      status: "ongoing",
      currentMove: 0,
      totalMoves: 0,
      canUndo: false,
      canRedo: false,
      restarts: [],
      board: 1,
      boardBefore: false,
      boardAfter: false,
      hasPencilMarks: false,
      ...change,
    });
  return { puzzle, state };
}

/** Board 1 at move 5 of 5, with checkpoints at 2 and 4. */
function withCheckpoints() {
  const made = makePuzzle();
  made.state({ board: 1, currentMove: 5, totalMoves: 5 });
  made.puzzle.addCheckpoint(2);
  made.puzzle.addCheckpoint(4);
  return made;
}

describe("a board's checkpoints", () => {
  it("leave with the board when another replaces it", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: true });
    expect([...puzzle.checkpoints]).toEqual([]);
  });

  it("come back with the board, whole, when Undo brings it back", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: true });
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: true });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
  });

  it("are kept apart from the other board's through Redo and Undo again", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: true });
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: true });
    state({ board: 2, boardBefore: true });
    expect([...puzzle.checkpoints]).toEqual([]);
    puzzle.addCheckpoint(0);
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: true });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
    state({ board: 2, boardBefore: true });
    expect([...puzzle.checkpoints]).toEqual([0]);
  });

  it("are not brought to a third board", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: true });
    state({ board: 3, boardBefore: true });
    expect([...puzzle.checkpoints]).toEqual([]);
  });

  it("stay through a restart, which is a step and shortens nothing", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 1, currentMove: 6, totalMoves: 6, restarts: [6] });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
    expect(puzzle.restarts).toEqual([6]);
  });
});

describe("what Undo says of a board it brought back", () => {
  it("is said when the board arrives by Undo, and taken down by the Redo", () => {
    const { puzzle, state } = makePuzzle();
    state({ board: 1, currentMove: 1, totalMoves: 1 });
    state({ board: 2, boardBefore: true });
    expect(puzzle.helpMessage).toBe("");
    state({ board: 1, currentMove: 1, totalMoves: 1, boardAfter: true });
    expect(puzzle.helpMessage).toBe(BOARD_BROUGHT_BACK);
    state({ board: 2, boardBefore: true });
    expect(puzzle.helpMessage).toBe("");
  });

  it("is not said again for a move made on that board", () => {
    const { puzzle, state } = makePuzzle();
    state({ board: 1 });
    state({ board: 2, boardBefore: true });
    state({ board: 1, boardAfter: true });
    Reflect.get(puzzle, "setHelpMessage").call(puzzle, "");
    state({ board: 1, currentMove: 1, totalMoves: 1 });
    expect(puzzle.helpMessage).toBe("");
  });
});
