/**
 * The win flash: a highlight a few squares long that runs the finished track
 * from the entrance to the exit.
 */

import { describe, expect, it } from "vitest";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { tracksGame } from "./index.ts";
import { COL_FLASH, flashLength, PREFERRED_TILE_SIZE } from "./render.ts";
import {
  blankBoard,
  D,
  E_TRACK,
  L,
  newState,
  R,
  sESet,
  type TracksParams,
  type TracksState,
} from "./state.ts";

const P: TracksParams = { w: 6, h: 6, diff: 0, singleOnes: true };
const DESC = "f6pCkC,2,3,3,2,3,S3,3,S3,3,3,2,2";

function solved(): TracksState {
  const start = newState(P, DESC);
  const answer = tracksGame.solve?.(start, start);
  if (!answer?.ok) throw new Error("the fixture does not solve");
  return tracksGame.executeMove(start, answer.move);
}

/** The squares drawn in the flash's color `time` seconds in, as their tiles'
 * clip rectangles, in the order drawn. */
function lit(state: TracksState, time: number): string[] {
  const dr = new RecordingDrawing(tracksGame.colors(DEFAULT_BACKGROUND));
  const ds = tracksGame.newDrawState(state, PREFERRED_TILE_SIZE);
  tracksGame.redraw(dr, ds, null, state, 1, tracksGame.newUi(state), 0, time);
  const squares = new Set<string>();
  let clip = "";
  for (const op of dr.ops) {
    if (op.op === "clip") clip = `${op.x},${op.y}`;
    else if ("color" in op && op.color === COL_FLASH) squares.add(clip);
  }
  return [...squares];
}

/** A solved `n`-square board whose track is every square: along the top row,
 * down a square, back along the next, and out through the bottom of the first
 * column. `n` is even. */
function serpentine(n: number): TracksState {
  const b = blankBoard(n, n);
  for (let y = 0; y < n; y++) {
    const leftward = y % 2 === 1;
    for (let x = 0; x < n; x++) {
      if (x + 1 < n) sESet(b, x, y, R, E_TRACK);
      const turn = leftward ? x === 0 : x === n - 1;
      if (turn && y + 1 < n) sESet(b, x, y, D, E_TRACK);
    }
  }
  sESet(b, 0, 0, L, E_TRACK);
  sESet(b, 0, n - 1, D, E_TRACK);
  b.numbers.fill(n);
  b.rowS = 0;
  b.colS = 0;
  const state: TracksState = {
    w: n,
    h: n,
    diff: 0,
    singleOnes: true,
    sflags: b.sflags,
    numbers: { numbers: b.numbers, rowS: 0, colS: 0 },
    numErrors: b.numErrors,
  };
  // Through a move, so the state is one `executeMove` made.
  return tracksGame.executeMove(state, { ops: [] });
}

describe("Tracks: the win flash on a track of several hundred squares", () => {
  const state = serpentine(18);
  const total = flashLength(state);

  it("is a solved board", () => {
    expect(tracksGame.status(state)).toBe("solved");
  });

  it("lights every square in turn, a few at a time", () => {
    const frames = Array.from({ length: 400 }, (_, i) =>
      lit(state, (total * (i + 1)) / 401),
    );
    for (const frame of frames) expect(frame.length).toBeLessThanOrEqual(3);
    expect(new Set(frames.flat()).size).toBe(18 * 18);
    expect(lit(state, total)).toEqual([]);
  });
});

describe("Tracks: the win flash runs the track from A to B", () => {
  const state = solved();
  const total = flashLength(state);
  const track = 2 + 3 + 3 + 2 + 3 + 3; // the column clues' sum
  // Thirty frames across the flash, none on its first or last instant.
  const frames = Array.from({ length: 30 }, (_, i) =>
    lit(state, (total * (i + 1)) / 31),
  );

  it("lights a few squares at a time, never the whole track", () => {
    for (const frame of frames) expect(frame.length).toBeLessThanOrEqual(3);
    expect(frames.some((frame) => frame.length === 3)).toBe(true);
  });

  it("reaches every square of the track, each for one stretch of frames", () => {
    const all = new Set(frames.flat());
    expect(all.size).toBe(track);
    for (const square of all) {
      const on = frames.map((frame) => frame.includes(square));
      // Lit once and never again: the highlight passes and does not return.
      expect(on.lastIndexOf(true) - on.indexOf(true) + 1).toBe(
        on.filter(Boolean).length,
      );
    }
  });

  it("starts at the entrance on the left edge, and is over by the end", () => {
    // The entrance is in column 0: the leftmost tile's clip.
    const xs = frames.flat().map((clip) => Number(clip.split(",")[0]));
    expect(Number(frames[0][0].split(",")[0])).toBe(Math.min(...xs));
    expect(lit(state, total)).toEqual([]);
  });
});
