/**
 * A fill game drawn by layers, on boards built by hand: what each layer puts
 * on the canvas, read from a recording. The painters and the labels are drawn
 * on fixtures, and a link, and the clues and errors a board's rules give, on
 * the `linking` one. A wash and a number drawn plain are `washing`'s, and a
 * square given its piece's shape `fleet`'s.
 */

import { describe, expect, it } from "vitest";
import * as fleet from "../../generated/engine/testing/fixtures/fleet/fleet.compiled.ts";
import * as joining from "../../generated/engine/testing/fixtures/joining/joining.compiled.ts";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import * as painting from "../../generated/engine/testing/fixtures/painting/painting.compiled.ts";
import * as playing from "../../generated/engine/testing/fixtures/playing/playing.compiled.ts";
import * as washing from "../../generated/engine/testing/fixtures/washing/washing.compiled.ts";
import { YELLOW_WASH } from "../color/colors.ts";
import { COL_ERROR } from "../color/roles.ts";
import { PAINTERS } from "../render/pieces/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { clueList } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND, renderScenario } from "../testing/render-scenario.ts";
import type { FillMistake } from "./answer.ts";
import { type FillBoard, newBoard, paramSpaceOf, washedValues } from "./board.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { fillGame } from "./game.ts";
import { fillInput, newFillUi } from "./play.ts";
import { type FillLook, fillRender } from "./render.ts";

const PIECE = 1;

// Pieces (P), anchors (A) and empty squares (.), the anchors at 1, 11 and 12.
const ANSWER = ["PA..", "...P", "...A", "AP.."];
const W = 4;
const TS = 32;
const look: FillLook<linking.Dealt> = {
  play: linking.play,
  lineClues: linking.lineClues,
};

function dealt(): FillBoard<linking.Dealt> {
  const g = Uint8Array.from(ANSWER.join(""), (ch) => "_P.A".indexOf(ch));
  return newBoard(
    linking,
    W,
    W,
    linking.deriveClues(g, paramSpaceOf(linking, { w: W, h: W })),
  );
}

function draw(
  edits: readonly Edit[],
  options: { look?: FillLook<linking.Dealt>; mistakes?: readonly FillMistake[] } = {},
): { ops: readonly DrawOp[]; render: ReturnType<typeof fillRender<linking.Dealt>> } {
  let board = dealt();
  for (const e of edits) board = applyEdit(linking, board, e);
  const input = fillInput<linking.Dealt, { tileSize: number }>(
    linking,
    linking.play,
    () => 1,
  );
  const render = fillRender(linking, options.look ?? look, input.previewed);
  const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
  const ds = render.newDrawState(board, TS);
  render.redraw(dr, ds, {
    state: board,
    prev: null,
    dir: 1,
    ui: newFillUi(),
    animTime: 0,
    flash: NO_FLASH,
    mistakes: options.mistakes,
  });
  return { ops: dr.ops, render };
}

const texts = (ops: readonly DrawOp[], color?: number): string[] =>
  ops.flatMap((o) =>
    o.op === "text" && (color === undefined || o.color === color) ? [o.text] : [],
  );

describe("a fill game drawn by layers", () => {
  it("draws each given with its painter and each line's clue past its end", () => {
    const { ops } = draw([]);
    // The `tree` painter's five leaves, for each of the three anchors.
    expect(ops.filter((o) => o.op === "circle")).toHaveLength(15);
    // The rows' counts, then the columns'.
    expect(texts(ops)).toEqual(["1", "1", "0", "1", "1", "1", "0", "1"]);
  });

  it("puts a diamond on the side two touching pieces share, and on the corner, a quarter a tile", () => {
    const side = draw([{ set: [4, PIECE, 5, PIECE] }]).ops;
    const diamonds = (ops: readonly DrawOp[]) =>
      // A diamond is outlined in ink; a piece in error is red all over.
      ops.filter(
        (o) => o.op === "polygon" && o.fill === COL_ERROR && o.outline !== o.fill,
      );
    // Each tile's half, at the side they share.
    expect(diamonds(side)).toHaveLength(2);
    const corner = draw([{ set: [4, PIECE, 9, PIECE] }]).ops;
    expect(diamonds(corner)).toHaveLength(4);
  });

  it("draws a link's halves on both its cells, in the error color once found wrong", () => {
    // The piece at 0 linked to the anchor at 1, the anchor clue's index 0.
    const linked = [{ set: [0, PIECE], mark: [0, 0] }];
    const render0 = draw([]).render;
    const halves = (ops: readonly DrawOp[], color?: number) =>
      ops.filter(
        (o) =>
          o.op === "rect" &&
          (color === undefined || o.color === color) &&
          o.w === Math.floor(TS / 4) + 1 &&
          o.h === Math.max(2, Math.floor(TS / 14)),
      );
    const [a, b] = halves(draw(linked).ops).flatMap((o) =>
      o.op === "rect" ? [o] : [],
    );
    // One line across the grid line the two cells share.
    expect(a.x + a.w).toBe(b.x);
    expect(b.x).toBe(render0.origin(TS, { w: W, h: W }) + TS);
    const wrong = draw(linked, { mistakes: [{ cell: 0, kind: "mark" }] }).ops;
    expect(halves(wrong, COL_ERROR)).toHaveLength(2);
  });

  it("reddens a line's clue its line breaks", () => {
    // Row 2's count is 0.
    const { ops } = draw([{ set: [8, PIECE] }]);
    expect(texts(ops, COL_ERROR)).toEqual(["0"]);
  });
});

describe("a fill game's labels", () => {
  it("draws fixed labels before each line, in a margin the board makes room for", () => {
    const sp = paramSpaceOf(playing, { w: W, h: W });
    const { count } = playing.deriveClues(new Uint8Array(W * W).fill(2), sp);
    const state = newBoard(playing, W, W, {
      given: clueList([], [], sp.cells.length),
      count,
    });
    // Without `covers`, which keeps half a tile round the board to press.
    const { covers: _covers, ...play } = playing.play;
    const frame = (labels: FillLook<playing.Dealt>["labels"]) => {
      const lookOf = { play, lineClues: playing.lineClues, labels };
      const input = fillInput<playing.Dealt, { tileSize: number }>(
        playing,
        play,
        () => 1,
      );
      const render = fillRender(playing, lookOf, input.previewed);
      const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
      render.redraw(dr, render.newDrawState(state, TS), {
        state,
        prev: null,
        dir: 1,
        ui: newFillUi(),
        animTime: 0,
        flash: NO_FLASH,
      });
      return { ops: dr.ops, render };
    };
    const { ops, render } = frame(playing.labels);
    const plain = frame(undefined).render;
    expect(render.origin(TS, { w: W, h: W })).toBe(TS);
    expect(render.computeSize({ w: W, h: W }, TS).w).toBe(
      plain.computeSize({ w: W, h: W }, TS).w + TS - 1,
    );
    expect(texts(ops).slice(0, 2 * W)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "1",
      "2",
      "3",
      "4",
    ]);
  });
});

describe("a piece that joins", () => {
  const game = fillGame("joining", joining);
  it("draws two side by side as one piece, and two apart each in its own cell", () => {
    // Each half reaches the side it shares with the other, where the other's
    // begins. The board's answer is its top row shaded.
    const id = "3x2:3,0,1,1,1";
    const meet = (moves: { set: number[] }[]) => {
      const xs = renderScenario({ game, id, moves }).recording.ops.flatMap((o) =>
        o.op === "polygon" ? [o.points.map(([x]) => x)] : [],
      );
      return xs.some((a) => xs.some((b) => Math.max(...a) === Math.min(...b)));
    };
    expect(meet([{ set: [0, 1, 1, 1] }])).toBe(true);
    expect(meet([{ set: [0, 1, 2, 1] }])).toBe(false);
  });
});

describe("each painter a description may name", () => {
  // One value of the fixture for each painter, a cell of a 3x3 board holding
  // it, given where the description gives it.
  const N = 3;
  const MIDDLE = 4;
  const sp = paramSpaceOf(painting, { w: N, h: N });
  const clues = painting.deriveClues(new Uint8Array(N * N).fill(2), sp);
  const look: FillLook<painting.Dealt> = {
    play: painting.play,
    lineClues: painting.lineClues,
  };
  const input = fillInput<painting.Dealt, { tileSize: number }>(
    painting,
    painting.play,
    () => 1,
  );
  const frame = (v: number, given: boolean): string => {
    const board = newBoard(painting, N, N, clues);
    board.values[MIDDLE] = v;
    board.fixed[MIDDLE] = given ? 1 : 0;
    const render = fillRender(painting, look, input.previewed);
    const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
    render.redraw(dr, render.newDrawState(board, TS), {
      state: board,
      prev: null,
      dir: 1,
      ui: newFillUi(),
      animTime: 0,
      flash: NO_FLASH,
    });
    return JSON.stringify(dr.ops);
  };
  const placed = Object.entries(painting.play.values).map(([v, { paint }]) => ({
    v: Number(v),
    paint,
    given: false,
  }));
  const givens = Object.entries(painting.play.given).map(([v, { paint }]) => ({
    v: Number(v),
    paint,
    given: true,
  }));

  it("names every painter, with joining's, each once", () => {
    const named = [
      ...[...placed, ...givens].map((p) => p.paint),
      ...Object.values(joining.play.values).map((p) => p.paint),
    ];
    expect(named.sort()).toEqual(Object.keys(PAINTERS).sort());
  });

  it("draws each unlike the others and unlike an open cell", () => {
    const frames = [...placed, ...givens].map((p) => frame(p.v, p.given));
    expect(new Set([frame(0, false), ...frames]).size).toBe(frames.length + 1);
  });

  it("draws a piece the deal gave unlike one placed, where its painter says how", () => {
    const telling = placed.filter((p) => PAINTERS[p.paint].given !== undefined);
    expect(telling.length).toBeGreaterThan(0);
    for (const p of telling) expect(frame(p.v, true)).not.toBe(frame(p.v, false));
  });
});

describe("a wash, and a number drawn plain", () => {
  // A 3x3 board with a 1 in the middle, counting the shaded squares beside it.
  const N = 3;
  const CORNER = 0;
  const TOP = 1;
  const MIDDLE = 4;
  const SHADED = 1;
  const CROSSED = 2;
  const sp = paramSpaceOf(washing, { w: N, h: N });
  const clues: washing.Dealt = { number: clueList([MIDDLE], [1], N * N) };
  const input = fillInput<washing.Dealt, { tileSize: number }>(
    washing,
    washing.play,
    () => 1,
  );
  const render = fillRender(
    washing,
    { play: washing.play, lineClues: washing.lineClues },
    input.previewed,
  );
  const palette = render.colors(DEFAULT_BACKGROUND);
  const frame = (values: Record<number, number>, washedMarks = true) => {
    const board = newBoard(washing, N, N, clues);
    for (const [c, v] of Object.entries(values)) board.values[Number(c)] = v;
    const dr = new RecordingDrawing(palette);
    render.redraw(dr, render.newDrawState(board, TS), {
      state: board,
      prev: null,
      dir: 1,
      ui: { ...newFillUi(), washedMarks },
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops;
  };
  const washedTiles = (ops: readonly DrawOp[]) =>
    ops.filter((o) => o.op === "rect" && palette[o.color] === YELLOW_WASH).length;

  it("washes each open square beside a shaded one, and no other", () => {
    expect(washedTiles(frame({}))).toBe(0);
    // The top row's two corners, and the middle.
    expect(washedTiles(frame({ [TOP]: SHADED }))).toBe(3);
  });

  it("draws a washed square's cross only where the preference says", () => {
    const shown = (washedMarks: boolean) =>
      JSON.stringify(frame({ [TOP]: SHADED, [CORNER]: CROSSED }, washedMarks)) !==
      JSON.stringify(frame({ [TOP]: SHADED }, washedMarks));
    expect(shown(true)).toBe(true);
    expect(shown(false)).toBe(false);
  });

  it("reads an open washed square as crossed to the rules", () => {
    // The answer, with the top row's corners, which the shaded square washes,
    // left open.
    const board = newBoard(washing, N, N, clues);
    board.values.set([
      0,
      SHADED,
      0,
      CROSSED,
      CROSSED,
      CROSSED,
      CROSSED,
      CROSSED,
      CROSSED,
    ]);
    expect(washing.isAnswer(washedValues(washing, board), sp, clues)).toBe(true);
    expect(washing.isAnswer(board.values, sp, clues)).toBe(false);
  });

  it("never draws a plain number faint, and counts none as a clue left", () => {
    const ink = (ops: readonly DrawOp[]) =>
      ops.flatMap((o) => (o.op === "text" && o.text === "1" ? [o.color] : []));
    const open = ink(frame({}));
    expect(open).toHaveLength(1);
    // Every square beside the 1 decided, and agreeing with it.
    expect(ink(frame({ [TOP]: SHADED, 3: CROSSED, 5: CROSSED, 7: CROSSED }))).toEqual(
      open,
    );
    expect(fillGame("washing", washing).statusbarText).toBeUndefined();
  });
});

describe("a square given its piece's shape", () => {
  // A piece of two along the top of a 3x3, its left end given: the columns'
  // counts, then the rows', then the end.
  const game = fillGame("fleet", fleet);
  const id = "3x3f2de,0,1:1,1,0,2,0,0,Eh";
  const frame = (moves: { set: number[] }[]) =>
    renderScenario({ game, id, moves }).recording.ops;
  /** Each piece's outline's leftmost and rightmost x, in the top row. */
  const topRow = (ops: readonly DrawOp[]) =>
    ops.flatMap((o) => {
      if (o.op !== "polygon" || Math.max(...o.points.map(([, y]) => y)) > TS) return [];
      const xs = o.points.map(([x]) => x);
      return [[Math.min(...xs), Math.max(...xs)]];
    });

  it("is drawn as its piece, shaped as in the answer before its neighbor is placed", () => {
    const [given] = topRow(frame([]));
    const [same, placed] = topRow(frame([{ set: [1, PIECE] }]));
    expect(same).toEqual(given);
    // It runs to the side it shares with the rest of its piece.
    expect(given[1]).toBe(placed[0]);
  });

  it("is never written as a number: the only numbers are the lines'", () => {
    expect(texts(frame([]))).toEqual(["2", "0", "0", "1", "1", "0"]);
  });
});
