/**
 * Tracks behavioral tests (tier 1 + tier 2): params/desc codecs, the solver
 * grade, `findMistakes`, input mapping, and the mistake render overlay
 * (paint-twice, so the overlay is proven to live in the diff key).
 *
 * Heavy solver checks use frozen fixture descs (not fresh generation), so they
 * are fast and deterministic.
 */
import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { newDesc } from "./generator.ts";
import { tracksGame } from "./index.ts";

// A 4x4 above Easy.
describeAbsentTiers(tracksGame, ["4x4dt", "4x4dh"]);

// The size beside it, which deals both.
describeDealtTiers(tracksGame, ["4x5dt", "4x5dh"], { deals: 8 });

import { executeMove, uiCanFlipSquare } from "./moves.ts";
import {
  COL_ERROR,
  centeredCoord,
  metrics,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { copyAndStrip, tracksSolve } from "./solver.ts";
import {
  DIFF_COUNT,
  DIFF_HARD,
  DIFF_TRICKY,
  decodeParams,
  encodeParams,
  newState,
  S_CLUE,
  S_TRACK,
  stateToBoard,
  type TracksParams,
} from "./state.ts";

const DEFAULT_BACKGROUND: [number, number, number] = [0.9, 0.9, 0.9];

// Known boards from the C-reference fixtures.
const SMALL: { p: TracksParams; desc: string } = {
  p: { w: 6, h: 6, diff: 0, singleOnes: true },
  desc: "f6pCkC,2,3,3,2,3,S3,3,S3,3,3,2,2",
};
const HARD: { p: TracksParams; desc: string } = {
  p: { w: 10, h: 10, diff: 2, singleOnes: true },
  desc: "aCmCa5b6zze9hAhAc,9,5,2,2,5,4,S8,4,8,7,7,8,S5,5,5,4,4,7,6,3",
};

const sq = (x: number, y: number, track: boolean, set: boolean) => ({
  kind: "square" as const,
  x,
  y,
  track,
  set,
});

describe("tracks params codec", () => {
  it("round-trips presets and the single_ones suffix", () => {
    const cases: TracksParams[] = [
      { w: 8, h: 8, diff: 1, singleOnes: true },
      { w: 10, h: 8, diff: 1, singleOnes: false },
      { w: 15, h: 15, diff: 2, singleOnes: true },
    ];
    for (const p of cases) expect(decodeParams(encodeParams(p, true))).toEqual(p);
    expect(encodeParams({ w: 10, h: 8, diff: 1, singleOnes: false }, true)).toBe(
      "10x8dto",
    );
    expect(encodeParams({ w: 8, h: 8, diff: 0, singleOnes: true }, false)).toBe("8x8");
  });
});

describe("tracks desc codec", () => {
  it("parses a board and validates its desc", () => {
    const st = newState(SMALL.p, SMALL.desc);
    expect(st.numbers.rowS).toBeGreaterThanOrEqual(0);
    expect(st.numbers.colS).toBeGreaterThanOrEqual(0);
    expect(validateDesc(tracksGame, SMALL.p, SMALL.desc)).toBeNull();
  });

  it("rejects malformed descs", () => {
    // A clue flag with the wrong bit-count (a single direction is 1 bit).
    expect(validateDesc(tracksGame, SMALL.p, "1zc,1,1,1,1,1,S1,1,S1,1,1,1,1")).toMatch(
      /doesn't join exactly two/,
    );
    // Missing entrance/exit markers.
    expect(validateDesc(tracksGame, SMALL.p, "f6pCkC,2,3,3,2,3,3,3,3,3,3,2,2")).toMatch(
      /one entrance and one exit/,
    );
  });

  it("reads exactly what the encoder writes", () => {
    const v = (desc: string) => validateDesc(tracksGame, SMALL.p, desc);
    const clues = ",2,3,3,2,3,S3,3,S3,3,3,2,2";
    // A `0` nibble is a clue square with no track, which the encoder never writes.
    expect(v(`f0pCkC${clues}`)).toMatch(/doesn't join exactly two/);
    expect(v(`f6pCkG${clues}`)).toBe(descBadCharacter("G"));
    expect(v(`f6pCm${clues}`)).toBe(DESC_TOO_LONG);
    expect(v("f6pCkC,2,,3,2,3,S3,3,S3,3,3,2,2")).toBe(descBadCharacter(","));
    expect(v("f6pCkC,2,7,3,2,3,S3,3,S3,3,3,2,2")).toBe(DESC_OUT_OF_RANGE);
    expect(v("f6pCkC,S2,3,3,2,3,S3,3,S3,3,3,2,2")).toMatch(/one entrance and one exit/);
    expect(v(`f6pCkC${clues},`)).toBe(DESC_TOO_LONG);
    expect(v("f6pCkC,2,3")).toBe(DESC_TOO_SHORT);
  });
});

describe("tracks solver", () => {
  it("solves the fixture board uniquely at DIFF_COUNT", () => {
    const strip = copyAndStrip(stateToBoard(newState(SMALL.p, SMALL.desc)), -1);
    expect(tracksSolve(strip, DIFF_COUNT).ret).toBe(1);
  });

  it("grades the HARD fixture Tricky, and the Normal solver cannot finish it", () => {
    const strip = () => copyAndStrip(stateToBoard(newState(HARD.p, HARD.desc)), -1);
    expect(tracksSolve(strip(), DIFF_COUNT).maxDiff).toBe(DIFF_HARD);
    expect(tracksSolve(strip(), DIFF_TRICKY).ret).toBeLessThan(1);
  });

  it("generates a solvable Easy board (fixed seed)", () => {
    const p: TracksParams = { w: 8, h: 8, diff: 0, singleOnes: true };
    const { desc } = newDesc(p, randomNew("tracks-gen-easy"));
    const solved = copyAndStrip(stateToBoard(newState(p, desc)), -1);
    expect(tracksSolve(solved, DIFF_COUNT).ret).toBe(1);
  });

  // Sizes upstream's walk could not span: it kept one walk in 100,000 at 60x8,
  // and none of those under `singleOnes`.
  it.each([
    ["60x8", 60, 8],
    ["8x60", 8, 60],
    ["40x12", 40, 12],
    ["24x24", 24, 24],
  ])("deals a %s at Easy with a track in every row and column, and no forbidden 1", (_, w, h) => {
    const p: TracksParams = { w, h, diff: 0, singleOnes: true };
    const { desc } = newDesc(p, randomNew(`tracks-large-${w}x${h}`));
    const board = stateToBoard(newState(p, desc));
    const clues = [...board.numbers];
    expect(clues.every((n) => n > 0)).toBe(true);
    expect(clues[0]).not.toBe(1);
    expect(clues[w + h - 1]).not.toBe(1);
    expect(clues.some((n, i) => i > 0 && n === 1 && clues[i - 1] === 1)).toBe(false);
    expect(tracksSolve(copyAndStrip(board, -1), 0)).toEqual({ ret: 1, maxDiff: 0 });
  });
});

describe("tracks findMistakes + solve", () => {
  it("flags a track laid where the solution has none; leaves correct marks", () => {
    const st = newState(SMALL.p, SMALL.desc);
    const solution = copyAndStrip(stateToBoard(st), -1);
    tracksSolve(solution, DIFF_COUNT);
    const { w, h } = SMALL.p;

    let notrackCell = -1;
    let trackCell = -1;
    for (let i = 0; i < w * h; i++) {
      if (st.sflags[i] & S_CLUE) continue;
      if (!(solution.sflags[i] & S_TRACK) && notrackCell < 0) notrackCell = i;
      if (solution.sflags[i] & S_TRACK && trackCell < 0) trackCell = i;
    }
    expect(notrackCell).toBeGreaterThanOrEqual(0);

    const bad = executeMove(st, {
      ops: [sq(notrackCell % w, Math.floor(notrackCell / w), true, true)],
    });
    expect(tracksGame.findMistakes?.(bad) ?? []).toContainEqual({
      x: notrackCell % w,
      y: Math.floor(notrackCell / w),
    });

    const good = executeMove(st, {
      ops: [sq(trackCell % w, Math.floor(trackCell / w), true, true)],
    });
    expect(
      (tracksGame.findMistakes?.(good) ?? []).some(
        (m) => m.x === trackCell % w && m.y === Math.floor(trackCell / w),
      ),
    ).toBe(false);
  });

  it("solve() drives a blank board to completion", () => {
    const st = newState(SMALL.p, SMALL.desc);
    const result = tracksGame.solve?.(st, st);
    expect(result?.ok).toBe(true);
    if (result?.ok) {
      expect(tracksGame.status(executeMove(st, result.move))).toBe("solved");
    }
  });

  it("findMistakes returns [] on an untouched board", () => {
    expect(tracksGame.findMistakes?.(newState(SMALL.p, SMALL.desc)) ?? []).toEqual([]);
  });
});

// The square centers at the tile size `preferredDrawState` draws at.
const CENTER = (n: number) => centeredCoord(n, metrics(PREFERRED_TILE_SIZE));

describe("tracks input", () => {
  it("a left-drag lays a straight run of track", () => {
    const st = newState(SMALL.p, SMALL.desc);
    const ui = tracksGame.newUi(st);
    tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(1), y: CENTER(3) },
      LEFT_BUTTON,
    );
    tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(3), y: CENTER(3) },
      LEFT_DRAG,
    );
    const move = tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(3), y: CENTER(3) },
      LEFT_RELEASE,
    );
    expect(move && typeof move === "object" && "ops" in move).toBe(true);
    const applied = executeMove(st, move as Parameters<typeof executeMove>[1]);
    for (const x of [1, 2, 3]) {
      expect(applied.sflags[3 * SMALL.p.w + x] & S_TRACK).toBeTruthy();
    }
  });

  it("a drag that drifts out of bounds keeps its last valid extent", () => {
    const st = newState(SMALL.p, SMALL.desc);
    const ui = tracksGame.newUi(st);
    tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(1), y: CENTER(3) },
      LEFT_BUTTON,
    );
    // A valid horizontal drag out to column 3.
    tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(3), y: CENTER(3) },
      LEFT_DRAG,
    );
    // Now drift above the grid (y=5 → row −1): upstream would cancel; we freeze.
    tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(3), y: 5 },
      LEFT_DRAG,
    );
    expect(ui.painting).toBe(true);
    expect(ui.drag.ex).toBe(3); // extent preserved, not reset to the origin
    const move = tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(3), y: 5 },
      LEFT_RELEASE,
    );
    const applied = executeMove(st, move as Parameters<typeof executeMove>[1]);
    for (const x of [1, 2, 3]) {
      expect(applied.sflags[3 * SMALL.p.w + x] & S_TRACK).toBeTruthy();
    }
    // The release ends the drag as well as committing it. `painting` and
    // `drag.live` are different questions — the first is "aligned and laying
    // track", the second "a press is down" — and both must be down by now, or
    // the engine's cancel-on-state-change would fire on a drag nobody is doing.
    expect(ui.painting).toBe(false);
    expect(ui.drag.live).toBe(false);
  });

  it("a right-drag over cells that already hold track is a no-op", () => {
    let st = newState(SMALL.p, SMALL.desc);
    st = executeMove(st, { ops: [1, 2, 3].map((x) => sq(x, 3, true, true)) });
    const ui = tracksGame.newUi(st);
    tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(1), y: CENTER(3) },
      RIGHT_BUTTON,
    );
    tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(3), y: CENTER(3) },
      RIGHT_DRAG,
    );
    const move = tracksGame.interpretMove(
      st,
      ui,
      preferredDrawState(tracksGame, st),
      { x: CENTER(3), y: CENTER(3) },
      RIGHT_RELEASE,
    );
    expect(move).toBeNull();
    expect(uiCanFlipSquare(stateToBoard(st), 1, 3, true)).toBe(false);
  });
});

describe("tracks render", () => {
  it("draws rails and clue numbers on the initial frame", () => {
    const st = newState(SMALL.p, SMALL.desc);
    const solved = executeMove(
      st,
      (tracksGame.solve?.(st, st) as { ok: true; move: never }).move,
    );
    const ds = newDrawState(solved, tracksGame.preferredTileSize ?? 33);
    const dr = new RecordingDrawing(tracksGame.colors(DEFAULT_BACKGROUND));
    redraw(dr, ds, null, solved, 1, tracksGame.newUi(solved), 0, 0);
    expect(dr.ops.some((o) => o.op === "text")).toBe(true);
    expect(dr.ops.some((o) => o.op === "line")).toBe(true);
  });

  it("paints the mistake overlay even on an already-drawn tile", () => {
    const st = newState(SMALL.p, SMALL.desc);
    const solution = copyAndStrip(stateToBoard(st), -1);
    tracksSolve(solution, DIFF_COUNT);
    const { w, h } = SMALL.p;
    let notrackCell = -1;
    for (let i = 0; i < w * h; i++) {
      if (!(st.sflags[i] & S_CLUE) && !(solution.sflags[i] & S_TRACK)) {
        notrackCell = i;
        break;
      }
    }
    const bad = executeMove(st, {
      ops: [sq(notrackCell % w, Math.floor(notrackCell / w), true, true)],
    });
    const ds = newDrawState(bad, tracksGame.preferredTileSize ?? 33);
    const ui = tracksGame.newUi(bad);
    const palette = tracksGame.colors(DEFAULT_BACKGROUND);

    // Warm the drawstate without the overlay, then repaint with it.
    redraw(new RecordingDrawing(palette), ds, null, bad, 1, ui, 0, 0);
    const mistakes = tracksGame.findMistakes?.(bad) ?? [];
    const dr = new RecordingDrawing(palette);
    redraw(dr, ds, null, bad, 1, ui, 0, 0, undefined, mistakes);
    expect(dr.ops.some((o) => o.op === "rect" && o.color === COL_ERROR)).toBe(true);
  });
});
