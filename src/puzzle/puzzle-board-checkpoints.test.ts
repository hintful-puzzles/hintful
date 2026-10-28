// Checkpoints are move numbers in one run, play from a fresh board. These
// drive `Puzzle` with the state notifications the engine sends as a run is
// left and brought back (`NotifyGameStateChange.board`), against a stub worker.
import { describe, expect, it } from "vitest";
import type { NotifyGameStateChange, PuzzleStaticAttributes } from "../engine/types.ts";
import { BROUGHT_BACK, Puzzle } from "./puzzle.ts";

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
      board: 1,
      boardBefore: null,
      boardAfter: null,
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
    state({ board: 2, boardBefore: "board" });
    expect([...puzzle.checkpoints]).toEqual([]);
  });

  it("come back with the board, whole, when Undo brings it back", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: "board" });
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: "board" });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
  });

  it("are kept apart from the other board's through Redo and Undo again", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: "board" });
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: "board" });
    state({ board: 2, boardBefore: "board" });
    expect([...puzzle.checkpoints]).toEqual([]);
    puzzle.addCheckpoint(0);
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: "board" });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
    state({ board: 2, boardBefore: "board" });
    expect([...puzzle.checkpoints]).toEqual([0]);
  });

  it("are not brought to a third board", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: "board" });
    state({ board: 3, boardBefore: "board" });
    expect([...puzzle.checkpoints]).toEqual([]);
  });

  it("come back from two boards back", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: "board" });
    state({ board: 3, boardBefore: "board" });
    state({ board: 2, boardBefore: "board", boardAfter: "board" });
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: "board" });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
  });

  it("leave with a run a Start over puts away, and come back with it", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, boardBefore: "restart" });
    expect([...puzzle.checkpoints]).toEqual([]);
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: "restart" });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
  });

  it("are not pruned by a run with fewer moves", () => {
    const { puzzle, state } = withCheckpoints();
    state({ board: 2, currentMove: 1, totalMoves: 1, boardBefore: "restart" });
    state({ board: 1, currentMove: 5, totalMoves: 5, boardAfter: "restart" });
    expect([...puzzle.checkpoints]).toEqual([2, 4]);
  });
});

describe("whether the board in play is played", () => {
  it("is so after a Start over, which shows no move, on either side of it", () => {
    const { puzzle, state } = makePuzzle();
    expect(puzzle.played).toBe(false);
    state({ board: 2, boardBefore: "restart" });
    expect(puzzle.played).toBe(true);
    state({ board: 1, boardAfter: "restart" });
    expect(puzzle.played).toBe(true);
  });

  it("is not so for an unplayed board with another kept behind it", () => {
    const { puzzle, state } = makePuzzle();
    state({ board: 2, boardBefore: "board" });
    expect(puzzle.played).toBe(false);
  });
});

describe("what Undo says of a run it brought back", () => {
  it("is said when the board arrives by Undo, and taken down by the Redo", () => {
    const { puzzle, state } = makePuzzle();
    state({ board: 1, currentMove: 1, totalMoves: 1 });
    state({ board: 2, boardBefore: "board" });
    expect(puzzle.helpMessage).toBe("");
    state({ board: 1, currentMove: 1, totalMoves: 1, boardAfter: "board" });
    expect(puzzle.helpMessage).toBe(BROUGHT_BACK.board);
    state({ board: 2, boardBefore: "board" });
    expect(puzzle.helpMessage).toBe("");
  });

  it("names the moves a Start over put away", () => {
    const { puzzle, state } = makePuzzle();
    state({ board: 1, currentMove: 1, totalMoves: 1 });
    state({ board: 2, boardBefore: "restart" });
    state({ board: 1, currentMove: 1, totalMoves: 1, boardAfter: "restart" });
    expect(puzzle.helpMessage).toBe(BROUGHT_BACK.restart);
  });

  it("is not said for a Redo onto a run with another ahead of it", () => {
    const { puzzle, state } = makePuzzle();
    state({ board: 1 });
    state({ board: 2, boardBefore: "board" });
    state({ board: 3, boardBefore: "board" });
    state({ board: 2, boardBefore: "board", boardAfter: "board" });
    state({ board: 1, boardAfter: "board" });
    state({ board: 2, boardBefore: "board", boardAfter: "board" });
    expect(puzzle.helpMessage).toBe("");
  });

  it("is not said again for a move made on that board", () => {
    const { puzzle, state } = makePuzzle();
    state({ board: 1 });
    state({ board: 2, boardBefore: "board" });
    state({ board: 1, boardAfter: "board" });
    Reflect.get(puzzle, "setHelpMessage").call(puzzle, "");
    state({ board: 1, currentMove: 1, totalMoves: 1 });
    expect(puzzle.helpMessage).toBe("");
  });
});
