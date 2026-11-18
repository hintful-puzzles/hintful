/**
 * What Wordguess's frame draws: a score by its shape, the answer row's
 * letters, the Check & save frame and a refused row's frame.
 */
import { describe, expect, it } from "vitest";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { NO_FLASH } from "../../engine/win-wave.ts";
import { wordguessGame } from "./index.ts";
import {
  COL_ELSEWHERE,
  COL_IN_PLACE,
  COL_WRONG,
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

function paintWith(s: WordguessState, ui: WordguessUi, ds?: WordguessDrawState) {
  const draw = ds ?? (wordguessGame.newDrawState(s, TS) as WordguessDrawState);
  return (mistakes?: readonly { pos: number }[]) => {
    const rec = new RecordingDrawing(PALETTE);
    redraw(rec, draw, null, s, 1, ui, 0, NO_FLASH, undefined, mistakes);
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

  it("shows a slot's letters but the ruled-out ones", () => {
    const s = wordguessGame.executeMove(cigar, {
      type: "mark",
      marks: [{ pos: 0, letter: 17 }],
      ruledOut: true,
    });
    const ops = paintWith(s, wordguessGame.newUi(s))();
    const letters = (o: (typeof ops)[number]) => (o.op === "text" ? o.text : "");
    // Q is gone from the first slot alone: four slots of 26 letters, less one.
    expect(ops.filter((o) => letters(o).length === 1).length).toBe(5 * 26 - 1);
    expect(ops.filter((o) => letters(o) === "Q").length).toBe(4);
  });

  it("frames a wrong slot on a board already drawn, and clears it (paint twice)", () => {
    const wrong = wordguessGame.executeMove(cigar, {
      type: "mark",
      marks: [{ pos: 1, letter: 9 }],
      ruledOut: true,
    });
    const ui = wordguessGame.newUi(wrong);
    const ds = wordguessGame.newDrawState(wrong, TS) as WordguessDrawState;
    const paint = (mistakes?: readonly { pos: number }[]) => {
      const rec = new RecordingDrawing(PALETTE);
      redraw(rec, ds, null, wrong, 1, ui, 0, NO_FLASH, undefined, mistakes);
      return rec.ops;
    };
    paint();
    const settled = paint().length;
    const framed = paint(wordguessGame.findMistakes?.(wrong));
    expect(framed.length).toBeGreaterThan(settled);
    expect(framed.some((o) => o.op === "rect" && o.color === COL_WRONG)).toBe(true);
    const cleared = paint();
    expect(cleared.some((o) => "color" in o && o.color === COL_WRONG)).toBe(false);
  });

  it("frames a refused row until it is edited", () => {
    const ui = wordguessGame.newUi(cigar);
    const paint = paintWith(cigar, ui);
    ui.entries.splice(0, 5, ...valuesOf("crnae"));
    paint();
    ui.refused = true;
    expect(paint().some((o) => o.op === "rect" && o.color === COL_WRONG)).toBe(true);
    ui.refused = false;
    expect(paint().some((o) => o.op === "rect" && o.color === COL_WRONG)).toBe(false);
  });
});
