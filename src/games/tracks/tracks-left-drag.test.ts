/**
 * The left drag in Tracks is one of two things, and what the pressed square
 * holds says which: from a square that carries track it lays segments across
 * the edges it crosses, and from any other it lays the square marks. Where in
 * the square the press lands changes nothing.
 */

import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE } from "../../engine/pointer.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { tracksGame } from "./index.ts";
import { centeredCoord, metrics, PREFERRED_TILE_SIZE } from "./render.ts";
import {
  E_TRACK,
  newState,
  S_CLUE,
  S_TRACK,
  sECount,
  stateToBoard,
  type TracksMove,
  type TracksParams,
  type TracksState,
} from "./state.ts";

const P: TracksParams = { w: 6, h: 6, diff: 0, singleOnes: true };
const DESC = "f6pCkC,2,3,3,2,3,S3,3,S3,3,3,2,2";
const M = metrics(PREFERRED_TILE_SIZE);
const center = (n: number) => centeredCoord(n, M);

/** A board played through `interpretMove`, with every move it made. */
function played() {
  let state = newState(P, DESC);
  const ui = tracksGame.newUi(state);
  const moves: TracksMove[] = [];
  const send = (x: number, y: number, button: number) => {
    const ds = preferredDrawState(tracksGame, state);
    const made = tracksGame.interpretMove(state, ui, ds, { x, y }, button);
    if (made !== null && made !== UI_UPDATE) {
      moves.push(made);
      state = tracksGame.executeMove(state, made);
    }
  };
  /** Press at `from`, drag in small steps to `to`, release there. */
  const drag = (from: [number, number], to: [number, number]) => {
    send(from[0], from[1], LEFT_BUTTON);
    for (let i = 1; i <= 16; i++)
      send(
        from[0] + ((to[0] - from[0]) * i) / 16,
        from[1] + ((to[1] - from[1]) * i) / 16,
        LEFT_DRAG,
      );
    send(to[0], to[1], LEFT_RELEASE);
  };
  return { drag, moves, state: () => state };
}

/** Three squares side by side that hold nothing: no clue, no mark, no rail. */
function emptyRun(state: TracksState): { x: number; y: number } {
  const b = stateToBoard(state);
  const empty = (x: number, y: number) =>
    !(b.sflags[y * b.w + x] & (S_CLUE | S_TRACK)) && sECount(b, x, y, E_TRACK) === 0;
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x + 2 < b.w; x++)
      if (empty(x, y) && empty(x + 1, y) && empty(x + 2, y)) return { x, y };
  throw new Error("the fixture has no three empty squares in a row");
}

const kinds = (moves: readonly TracksMove[]) =>
  moves.flatMap((move) => move.ops.map((op) => op.kind));

describe("Tracks: the left drag", () => {
  it("from an empty square lays square marks, wherever in it the press lands", () => {
    // Off the square's middle, where a click would address the edge.
    for (const off of [0, M.tile / 2 - 6]) {
      const b = played();
      const { x, y } = emptyRun(b.state());
      b.drag([center(x) + off, center(y)], [center(x + 2), center(y)]);
      expect(kinds(b.moves)).toEqual(["square", "square", "square"]);
    }
  });

  it("from a square that carries track lays segments, and no square mark", () => {
    const b = played();
    const { x, y } = emptyRun(b.state());
    b.drag([center(x), center(y)], [center(x + 2), center(y)]);
    b.moves.length = 0;
    b.drag([center(x), center(y)], [center(x + 2), center(y)]);
    // Two edges crossed, each a move of its own, an op for each square's side.
    expect(b.moves).toHaveLength(2);
    expect(new Set(kinds(b.moves))).toEqual(new Set(["edge"]));
    const board = stateToBoard(b.state());
    expect(sECount(board, x + 1, y, E_TRACK)).toBe(2);
  });

  it("from a square whose first edge has a segment, takes the segments away", () => {
    const b = played();
    const { x, y } = emptyRun(b.state());
    b.drag([center(x), center(y)], [center(x + 2), center(y)]);
    b.drag([center(x), center(y)], [center(x + 2), center(y)]);
    b.drag([center(x), center(y)], [center(x + 2), center(y)]);
    expect(sECount(stateToBoard(b.state()), x + 1, y, E_TRACK)).toBe(0);
  });
});
