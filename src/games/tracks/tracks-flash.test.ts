/**
 * The win flash: a highlight a few squares long that runs the finished track
 * from the entrance to the exit.
 */

import { describe, expect, it } from "vitest";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { tracksGame } from "./index.ts";
import { COL_FLASH, flashLength, PREFERRED_TILE_SIZE } from "./render.ts";
import { newState, type TracksParams, type TracksState } from "./state.ts";

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
