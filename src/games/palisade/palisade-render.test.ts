// Tier-2 render-ops: drive Palisade's `redraw` against a recording
// `GameDrawing` double — first-draw grid dots, per-edge colors, the
// live error reddening for a wrong-sized region, the findMistakes
// overlay edge, the clue text, and the cursor outline.
import { describe, expect, it } from "vitest";
import { BORDER } from "../../engine/border-grid.ts";
import { EDGE, type ForcedBorderEdge } from "../../engine/border-grid-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, mark, phrase, so } from "../../engine/hint-words.ts";
import { newCursor } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { expectRing, ringsOf } from "../../engine/testing/mark-shape.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH, sweepStep } from "../../engine/win-wave.ts";
import { newDesc } from "./generator.ts";
import { palisadeGame } from "./index.ts";
import {
  COL_CORRECT,
  COL_CURSOR,
  COL_ERROR,
  COL_FLASH,
  COL_FLASH_LEAD,
  COL_GRID,
  COL_HINT_CELL,
  COL_LINE_MAYBE,
  newDrawState,
  type PalisadeDrawState,
  redraw,
} from "./render.ts";
import { solveToBorders } from "./solver.ts";
import {
  decodeParams,
  newState,
  type PalisadeHint,
  type PalisadeMove,
  type PalisadeState,
  type PalisadeUi,
} from "./state.ts";

const PALETTE = palisadeGame.colors(DEFAULT_BACKGROUND);

function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing(PALETTE);
  return { dr, ops: dr.ops };
}

const TS = 48;
const P = decodeParams("5x5n5");

function freshUi(): PalisadeUi {
  return { cursor: newCursor(1, 1) };
}

function freshDs(state: PalisadeState): PalisadeDrawState {
  return newDrawState(state, TS);
}

function makeState(): PalisadeState {
  return newState(P, newDesc(P, randomNew("palisade-render")).desc);
}

describe("Palisade redraw", () => {
  it("draws clue text and unknown edges in line-maybe on first draw", () => {
    const state = makeState();
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 0, freshUi(), 0, NO_FLASH);

    // Some clue digit was rendered.
    expect(ops.some((o) => o.op === "text" && /^[0-4]$/.test(o.text ?? ""))).toBe(true);
    // Interior unknown edges are line-maybe colored.
    expect(ops.some((o) => o.op === "rect" && o.color === COL_LINE_MAYBE)).toBe(true);
    // First-draw grid dots are COL_GRID.
    expect(ops.some((o) => o.op === "rect" && o.color === COL_GRID)).toBe(true);
  });

  it("reddens the walls of an undersized region", () => {
    const state = makeState();
    const s = { ...state, borders: state.borders.slice() };
    // Enclose cell (1,1) entirely → a size-1 region (too small) ⇒ error.
    const i = 1 * P.w + 1;
    s.borders[i] |= BORDER(0) | BORDER(1) | BORDER(2) | BORDER(3);
    s.borders[i - P.w] |= BORDER(2); // neighbor up shares the wall
    s.borders[i + 1] |= BORDER(3);
    s.borders[i + P.w] |= BORDER(0);
    s.borders[i - 1] |= BORDER(1);

    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(s), null, s, 0, freshUi(), 0, NO_FLASH);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_ERROR)).toBe(true);
  });

  it("shades completed correct regions, but not the untouched board", () => {
    const state = makeState();

    // Untouched board: one big undivided region ⇒ no correct shade.
    {
      const { dr, ops } = recordingDrawing();
      redraw(dr, freshDs(state), null, state, 0, freshUi(), 0, NO_FLASH);
      expect(ops.some((o) => o.op === "rect" && o.color === COL_CORRECT)).toBe(false);
    }

    // The unique solution: every region is size k with satisfied clues and no
    // interior wall ⇒ all regions shade COL_CORRECT.
    const sol = solveToBorders(P, state.clues);
    expect(sol).not.toBeNull();
    if (!sol) return;
    const solved = { ...state, borders: sol.slice() };
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(solved), null, solved, 0, freshUi(), 0, NO_FLASH);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_CORRECT)).toBe(true);
  });

  it("sweeps the win flash from the bottom left to the top right", () => {
    const state = makeState();
    const sol = solveToBorders(P, state.clues);
    if (!sol) throw new Error("the board has no solution");
    const solved = { ...state, borders: sol.slice() };
    const paint = (flash: Flash) => {
      const { dr, ops } = recordingDrawing();
      redraw(dr, freshDs(solved), null, solved, 1, freshUi(), 0, flash);
      return ops;
    };
    // The cells whose ground is the flash color, each as its index.
    // Lit is either tone of the highlight, and the flash shows both.
    const tones = new Set<number>();
    const isLit = (color: number) =>
      (color === COL_FLASH || color === COL_FLASH_LEAD) && tones.add(color).size > 0;
    const run = winFlashRun(paint, (ops) => {
      const clips = opsOfKind(ops, "clip");
      const left = Math.min(...clips.map((o) => o.x));
      const top = Math.min(...clips.map((o) => o.y));
      const cells: number[] = [];
      let cell = -1;
      for (const o of ops) {
        if (o.op === "clip") cell = ((o.y - top) / TS) * P.w + (o.x - left) / TS;
        else if (o.op === "rect" && isLit(o.color)) cells.push(cell);
      }
      return cells;
    });
    expectWinFlashTravels(run, P.w * P.h, (i) =>
      sweepStep(i % P.w, Math.floor(i / P.w)),
    );
    expect(tones.size).toBe(2);
  });

  it("reddens a findMistakes overlay edge", () => {
    const state = makeState();
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 0, freshUi(), 0, NO_FLASH, undefined, [
      { x: 1, y: 1, dir: 1 },
    ]);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_ERROR)).toBe(true);
  });

  it("rings every forced edge of the firing, plus the outlined cells", () => {
    const state = makeState();
    const own = { x: 1, y: 1, dir: 1, kind: "wall" } as const;
    const cells = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ];
    const stepRinging = (
      edges: ForcedBorderEdge[],
    ): HintStep<PalisadeMove, PalisadeHint> => {
      const words = so({
        look: mark.as("outline", CELL, cells, "cells"),
        move: phrase`${mark.as("ring", EDGE, edges, "edges")}`,
      });
      return {
        move: { type: "edges", edits: [] },
        rung: "numberExhausted",
        explanation: words.text,
        words,
        highlights: own,
      };
    };
    const { dr, ops } = recordingDrawing();
    redraw(
      dr,
      freshDs(state),
      null,
      state,
      0,
      freshUi(),
      0,
      NO_FLASH,
      stepRinging([own, { x: 1, y: 1, dir: 2, kind: "wall" }]),
    );
    // The action edge AND its sibling are both ringed (they share a fate, so
    // they share a mark); referenced cells get a COL_HINT_CELL outline. Each
    // edge's pill is drawn by both of its cells, so a bare count cannot tell
    // one edge from two: compare against the action edge alone.
    const hintRings = (o: RecordingDrawing["ops"]) => ringsOf(o).length;
    expectRing(ops, { rings: 4 });
    const alone = recordingDrawing();
    redraw(
      alone.dr,
      freshDs(state),
      null,
      state,
      0,
      freshUi(),
      0,
      NO_FLASH,
      stepRinging([own]),
    );
    expect(hintRings(alone.ops)).toBeGreaterThan(0);
    expect(hintRings(ops)).toBeGreaterThan(hintRings(alone.ops));
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);

    // With no hint, none of the hint colors appear.
    const { dr: dr2, ops: ops2 } = recordingDrawing();
    redraw(dr2, freshDs(state), null, state, 0, freshUi(), 0, NO_FLASH);
    expect(ringsOf(ops2)).toEqual([]);
    expect(ops2.some((o) => "color" in o && o.color === COL_HINT_CELL)).toBe(false);
  });

  it("draws the cursor outline when shown", () => {
    const state = makeState();
    const ui = freshUi();
    ui.cursor.visible = true;
    ui.cursor.x = 1;
    ui.cursor.y = 2; // a left-border position
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 0, ui, 0, NO_FLASH);
    expect(ops.some((o) => o.op === "line" && o.color === COL_CURSOR)).toBe(true);
  });
});
