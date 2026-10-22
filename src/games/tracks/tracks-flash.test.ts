/**
 * The win flash: the engine's highlight, run along the finished track from
 * the entrance to the exit.
 */

import { describe, expect, it } from "vitest";
import { D, L, R } from "../../engine/square-edges.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH } from "../../engine/win-wave.ts";
import { tracksGame } from "./index.ts";
import { COL_FLASH, COL_FLASH_LEAD, PREFERRED_TILE_SIZE } from "./render.ts";
import {
  blankBoard,
  E_TRACK,
  newState,
  sESet,
  stateToBoard,
  type TracksParams,
  type TracksState,
  trackOrder,
} from "./state.ts";

const P: TracksParams = { w: 6, h: 6, diff: 0, singleOnes: true };
const DESC = "f6pCkC,2,3,3,2,3,S3,3,S3,3,3,2,2";

function solved(): TracksState {
  const start = newState(P, DESC);
  const answer = tracksGame.solve?.(start, start);
  if (!answer?.ok) throw new Error("the fixture does not solve");
  return tracksGame.executeMove(start, answer.move);
}

/** A win flash on `state`, each lit square as its index, row by row: the
 * squares whose tile draws something in one of `slots`, the flash's two
 * colors unless a test asks about one. */
function flashOn(
  state: TracksState,
  frames: number,
  slots: readonly number[] = [COL_FLASH, COL_FLASH_LEAD],
) {
  const paint = (flash: Flash) => {
    const dr = new RecordingDrawing(tracksGame.colors(DEFAULT_BACKGROUND));
    const ds = tracksGame.newDrawState(state, PREFERRED_TILE_SIZE);
    tracksGame.redraw(dr, ds, null, state, 1, tracksGame.newUi(state), 0, flash);
    return dr;
  };
  // A tile clips to itself, so the clips' corners are the grid's lines.
  const clips = opsOfKind(paint(NO_FLASH).ops, "clip");
  const xs = [...new Set(clips.map((c) => c.x))].sort((a, b) => a - b);
  const ys = [...new Set(clips.map((c) => c.y))].sort((a, b) => a - b);
  expect([xs.length, ys.length]).toEqual([state.w, state.h]);
  const index = (x: number, y: number) => ys.indexOf(y) * state.w + xs.indexOf(x);
  return winFlashRun(
    paint,
    (dr) => {
      const squares = new Set<number>();
      let square = -1;
      for (const op of dr.ops) {
        if (op.op === "clip") square = index(op.x, op.y);
        else if ("color" in op && slots.includes(op.color)) squares.add(square);
      }
      return [...squares];
    },
    frames,
  );
}

/** A square's place along the track from the entrance: what the game hands
 * the flash. */
const along = (state: TracksState) => {
  const order = trackOrder(stateToBoard(state));
  return (square: number) => order[square];
};

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

  it("is a solved board", () => {
    expect(tracksGame.status(state)).toBe("solved");
  });

  it("lights every square in turn, a part of the track at a time", () => {
    const run = flashOn(state, 400);
    expectWinFlashTravels(run, 18 * 18, along(state));
    for (const frame of run.frames) expect(frame.length).toBeLessThan((18 * 18) / 4);
  });
});

describe("Tracks: the win flash runs the track from A to B", () => {
  const state = solved();
  const track = 2 + 3 + 3 + 2 + 3 + 3; // the column clues' sum
  const run = flashOn(state, 30);

  it("runs every square of the track once, in order, and no square off it", () => {
    expectWinFlashTravels(run, track, along(state));
  });

  it("lights a few squares at a time, never the whole track", () => {
    for (const frame of run.frames) expect(frame.length).toBeLessThanOrEqual(4);
    expect(run.frames.some((frame) => frame.length >= 3)).toBe(true);
  });

  it("starts at the entrance on the left edge", () => {
    for (const square of run.frames[0]) expect(along(state)(square)).toBeLessThan(4);
    expect(run.frames[0].some((square) => square % P.w === 0)).toBe(true);
  });

  it("leads in one color and follows in the other", () => {
    const lead = flashOn(state, 30, [COL_FLASH_LEAD]).frames;
    const body = flashOn(state, 30, [COL_FLASH]).frames;
    const place = along(state);
    expect(lead.some((frame) => frame.length > 0)).toBe(true);
    expect(body.some((frame) => frame.length > 0)).toBe(true);
    lead.forEach((front, i) => {
      // Whatever is in the lead is further along the track than the body.
      for (const square of front)
        for (const behind of body[i])
          expect(place(square)).toBeGreaterThan(place(behind));
    });
  });
});
