/**
 * What Wordguess's frame draws: a score by its shape, and a refused row's
 * frame.
 */
import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { NO_FLASH } from "../../engine/win-wave.ts";
import { wordguessGame } from "./index.ts";
import {
  COL_ELSEWHERE,
  COL_IN_PLACE,
  redraw,
  type WordguessDrawState,
} from "./render.ts";
import {
  defaultParams,
  encodeDesc,
  newState,
  valuesOf,
  type WordguessState,
  type WordguessUi,
} from "./state.ts";

const PALETTE = wordguessGame.colors(DEFAULT_BACKGROUND);
const TS = 40;
const cigar = newState(defaultParams(), encodeDesc(valuesOf("cigar")));

function paintWith(s: WordguessState, ui: WordguessUi) {
  const draw = wordguessGame.newDrawState(s, TS) as WordguessDrawState;
  return () => {
    const rec = new RecordingDrawing(PALETTE);
    redraw(rec, draw, null, s, 1, ui, 0, NO_FLASH);
    return rec.ops;
  };
}

describe("Wordguess redraw", () => {
  it("draws a letter in place on a square and a letter elsewhere on a disc", () => {
    const s = wordguessGame.executeMove(cigar, {
      type: "guess",
      letters: valuesOf("crane"),
    });
    const ops = paintWith(s, wordguessGame.newUi(s))();
    const squares = ops.filter((o) => o.op === "rect" && o.color === COL_IN_PLACE);
    const discs = ops.filter((o) => o.op === "circle" && o.fill === COL_ELSEWHERE);
    // C in place; R and A elsewhere; N and E on the bare surface.
    expect(squares).toHaveLength(1);
    expect(discs).toHaveLength(2);
  });

  it("frames a refused row until it is edited", () => {
    const ui = wordguessGame.newUi(cigar);
    const paint = paintWith(cigar, ui);
    ui.entries.splice(0, 5, ...valuesOf("crnae"));
    paint();
    ui.refused = true;
    expect(paint().some((o) => o.op === "rect" && o.color === COL_ERROR)).toBe(true);
    ui.refused = false;
    expect(paint().some((o) => o.op === "rect" && o.color === COL_ERROR)).toBe(false);
  });
});
