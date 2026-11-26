/**
 * A fill board whose answer sits on the edges, on the `lacing` fixture:
 * the board holds a value an edge, and the ladder reads and solves it.
 */

import { describe, expect, it } from "vitest";
import * as lacing from "../../generated/engine/testing/fixtures/lacing/lacing.compiled.ts";
import { COL_CURSOR, COL_ERROR } from "../color/roles.ts";
import { descValue } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import { sweepPending } from "../input/target-verb.ts";
import { randomNew } from "../random/index.ts";
import type { DrawOp } from "../testing/recording-drawing.ts";
import { renderScenario } from "../testing/render-scenario.ts";
import { type AnswerReading, edgeTextOf, encodeAnswer, textFormat } from "./answer.ts";
import {
  elementsOf,
  type FillBoard,
  marksOf,
  newBoard,
  paramSpaceOf,
  solveBoard,
} from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc } from "./desc.ts";
import { elementAtPoint, pointOfElement } from "./edge-target.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { fillGame } from "./game.ts";
import { fillInput, newFillUi } from "./play.ts";
import { COL_CELL, COL_INK, fillSlots } from "./render/palette.ts";
import { sampleAnswer } from "./sample.ts";

const LINE = 1;
const NONE = 2;

/** A 3 by 3 board whose numbers are those `answer` deals. */
function dealtOn(answer: (sp: ReturnType<typeof paramSpaceOf>) => Uint8Array) {
  const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
  const g = answer(sp);
  return { g, board: newBoard(lacing, 3, 3, lacing.deriveClues(g, sp)) };
}

/** The lines round the rim of the board, and none inside. */
const ring = (sp: ReturnType<typeof paramSpaceOf>): Uint8Array =>
  Uint8Array.from(sp.edges, (e) => {
    const [a, b] = [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]];
    return a === 4 || b === 4 ? NONE : LINE;
  });

describe("an answer on the edges", () => {
  it("holds a value an edge, and a mark a cell", () => {
    const { board } = dealtOn(ring);
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    expect(elementsOf(lacing, sp)).toBe(sp.edges);
    expect(board.values.length).toBe(12);
    expect(board.fixed.length).toBe(12);
    expect(board.values.every((v) => v === 0)).toBe(true);
    expect(board.mark.length).toBe(9);
    // The ladder's marks hold candidates an edge, each edge's both values.
    const { marks } = marksOf(lacing, board);
    expect(marks.cands.length).toBe(12);
    const both = (1 << LINE) | (1 << NONE);
    expect(Array.from(marks.cands).every((m) => m === both)).toBe(true);
  });

  it("is solved by the ladder on the edges, to the answer dealt", () => {
    const { g, board } = dealtOn(ring);
    // The center's 0 crosses its four edges, and each side's 2 then has
    // its two lines left.
    expect(Array.from(board.dealt.number.v)).toEqual([2, 2, 2, 2, 0, 2, 2, 2, 2]);
    const got = solveBoard(lacing, board, lacing.TIER.easy);
    expect(got.verdict).toBe("solved");
    expect(Array.from(got.values)).toEqual(Array.from(g));
  });

  it("prints each edge's value where the wall between its squares is", () => {
    const { g, board } = dealtOn(ring);
    const reading: AnswerReading<lacing.Dealt> = {
      blank: NONE,
      glyphs: {},
      lineClues: [],
      numbers: lacing.numbers,
      edges: {
        text: edgeTextOf(lacing.play),
        space: (b) => paramSpaceOf(lacing, b),
      },
    };
    const text = (values: Uint8Array) =>
      textFormat(reading, { ...board, values }).split("\n");
    expect(text(g)).toEqual([
      "+---+---+---+",
      "| 2 - 2 - 2 |",
      "+ | + x + | +",
      "| 2 x 0 x 2 |",
      "+ | + x + | +",
      "| 2 - 2 - 2 |",
      "+---+---+---+",
      "",
    ]);
    // An open edge is blank.
    expect(text(board.values)[1]).toBe("| 2   2   2 |");
  });

  it("is dealt with a line at even odds on each edge, and finishes on it", () => {
    let lines = 0;
    let edges = 0;
    for (const seed of ["lace-a", "lace-b", "lace-c", "lace-d"]) {
      const p = { w: 4, h: 4, diff: lacing.TIER.easy };
      const { desc, aux } = dealFill(lacing, lacing.deal, p, randomNew(seed));
      const sp = paramSpaceOf(lacing, p);
      const board = newBoard(
        lacing,
        4,
        4,
        descValue(decodeDesc(lacing.deal, sp, lacing.clueMax, desc)),
      );
      expect(aux.length).toBe(sp.edges.length);
      const got = solveBoard(lacing, board, lacing.TIER.easy);
      expect(got.verdict).toBe("solved");
      expect(encodeAnswer(got.values)).toBe(aux);
      lines += got.values.filter((v) => v === LINE).length;
      edges += got.values.length;
    }
    // 96 edges at even odds hold a line on between a third and two thirds.
    expect(lines / edges).toBeGreaterThan(1 / 3);
    expect(lines / edges).toBeLessThan(2 / 3);
  });

  it("scatters over the edges, which keep no distance, partner or line", () => {
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    const scatter = { value: LINE, share: 0.5 };
    const g = sampleAnswer({ scatter, rest: NONE }, sp, randomNew("e"), null, sp.edges);
    expect(g?.length).toBe(12);
    expect(g?.every((v) => v === LINE || v === NONE)).toBe(true);
    for (const sample of [
      { scatter: { ...scatter, apart: "adj4" as const }, rest: NONE },
      { scatter, rest: NONE, noBareLine: true },
    ])
      expect(() => sampleAnswer(sample, sp, randomNew("e"), null, sp.edges)).toThrow(
        /only a cell keeps a distance/,
      );
  });

  describe("is drawn", () => {
    const game = fillGame("lacing", lacing);
    const slots = fillSlots(lacing.play, true).edgeByValue;
    const lineInk = slots.get(LINE)?.slot[0] ?? -1;
    const crossInk = slots.get(NONE)?.slot[0] ?? -1;
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    const id = `3x3:${dealtOn(ring).board.dealt.number.v.join("")}`;
    const ops = (moves: { set: number[] }[], showMistakes = false) =>
      renderScenario({ game, id, moves, showMistakes }).recording.ops;
    const tiles = (o: readonly DrawOp[], color: number, op: string) =>
      o.filter((x) => x.op === op && "color" in x && x.color === color);

    it("with each edge's two squares each drawing its half", () => {
      // Each square draws a line's half from its middle to the side the two
      // share, which the two halves meet across.
      const right = sp.edgeOf(0, 1);
      const halves = tiles(ops([{ set: [right, LINE] }]), lineInk, "rect");
      expect(halves).toHaveLength(2);
      const [a, b] = halves.map((r) => (r.op === "rect" ? r : null));
      expect(a !== null && b !== null && a.x + a.w >= b.x && a.y === b.y).toBe(true);
      // A cross is two strokes, in each square's clip.
      const below = sp.edgeOf(0, 3);
      expect(tiles(ops([{ set: [below, NONE] }]), crossInk, "line")).toHaveLength(4);
      expect(tiles(ops([]), lineInk, "rect")).toHaveLength(0);
    });

    it("with each number on a disc the lines run in to", () => {
      const discs = ops([]).filter(
        (o) => o.op === "circle" && o.fill === COL_CELL && o.outline === COL_INK,
      );
      expect(discs).toHaveLength(9);
    });

    it("with an edge Check & Save finds wrong in error", () => {
      // The ring's answer has no line between the corner and the center's
      // side.
      const inner = sp.edgeOf(1, 4);
      const shown = ops([{ set: [inner, LINE] }], true);
      expect(tiles(shown, COL_ERROR, "rect")).toHaveLength(2);
      expect(tiles(shown, lineInk, "rect")).toHaveLength(0);
    });
  });

  describe("is played", () => {
    const TS = 20;
    const ds = { tileSize: TS };
    const input = fillInput<lacing.Dealt, typeof ds>(lacing, lacing.play, () => 0);
    const { geometry } = input.targetVerbs;
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    const fresh = () => {
      const { board } = dealtOn(ring);
      return { board, ui: fillGame("lacing", lacing).newUi(board) };
    };
    /** The pointer's point aiming at the edge between squares `a` and `b`. */
    const aim = (b: FillBoard<lacing.Dealt>, a: number, z: number) =>
      geometry.pointAt(b, ds, pointOfElement(sp, sp.edgeOf(a, z)), newFillUi());
    /** Each button at its point in turn, every edit made applied. */
    function drive(
      start: ReturnType<typeof fresh>,
      steps: readonly (readonly [number, { x: number; y: number }])[],
    ) {
      let { board } = start;
      const edits: Edit[] = [];
      for (const [button, p] of steps)
        do {
          const got = input.interpretMove(board, start.ui, ds, p, button);
          if (got !== null && got !== UI_UPDATE) {
            edits.push(got);
            board = applyEdit(lacing, board, got);
          }
        } while (sweepPending(start.ui));
      return { board, edits };
    }

    it("aiming at each edge by the point its half-grid cursor rests on", () => {
      for (const sp2 of [sp, paramSpaceOf(lacing, { w: 4, h: 2 })]) {
        const board = newBoard(lacing, sp2.w, sp2.h, dealtOn(ring).board.dealt);
        for (const e of sp2.edges) {
          const t = pointOfElement(sp2, e);
          expect(elementAtPoint(sp2, t)).toBe(e);
          expect(
            geometry.pointerTarget(
              board,
              ds,
              geometry.pointAt(board, ds, t, newFillUi()),
              newFillUi(),
            ),
          ).toEqual(t);
        }
      }
      // A square's middle, a corner and the rim are no edge.
      for (const p of [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 0, y: 1 },
        { x: 6, y: 1 },
      ])
        expect(elementAtPoint(sp, p)).toBe(-1);
    });

    it("by a click, which draws a line, and a right-click, which crosses it out", () => {
      const s = fresh();
      const { board } = drive(s, [
        [LEFT_BUTTON, aim(s.board, 0, 1)],
        [LEFT_RELEASE, aim(s.board, 0, 1)],
        [RIGHT_BUTTON, aim(s.board, 4, 7)],
        [RIGHT_RELEASE, aim(s.board, 4, 7)],
      ]);
      expect(board.values[sp.edgeOf(0, 1)]).toBe(LINE);
      expect(board.values[sp.edgeOf(4, 7)]).toBe(NONE);
      // A second click empties the edge.
      const again = drive({ ...s, board }, [[LEFT_BUTTON, aim(s.board, 0, 1)]]);
      expect(again.board.values[sp.edgeOf(0, 1)]).toBe(0);
    });

    it("by a drag along a row's edges, each taken near its middle", () => {
      const s = fresh();
      const { board, edits } = drive(s, [
        [LEFT_BUTTON, { x: TS, y: TS / 2 }],
        [LEFT_DRAG, { x: 2 * TS, y: TS / 2 }],
        [LEFT_RELEASE, { x: 2 * TS, y: TS / 2 }],
      ]);
      expect(edits).toHaveLength(2);
      const lines = sp.edges.filter((e) => board.values[e] === LINE);
      expect(lines).toEqual([sp.edgeOf(0, 1), sp.edgeOf(1, 2)]);
    });

    it("by the keyboard, on the half grid", () => {
      const s = fresh();
      // The cursor starts on the first square's middle, where Enter does
      // nothing, and one step right is the edge beside it.
      const { board } = drive(s, [
        [CURSOR_RIGHT, { x: 0, y: 0 }],
        [CURSOR_SELECT, { x: 0, y: 0 }],
        [CURSOR_DOWN, { x: 0, y: 0 }],
        [CURSOR_DOWN, { x: 0, y: 0 }],
        [CURSOR_SELECT2, { x: 0, y: 0 }],
        [CURSOR_LEFT, { x: 0, y: 0 }],
        [CURSOR_SELECT, { x: 0, y: 0 }],
      ]);
      expect(board.values[sp.edgeOf(0, 1)]).toBe(LINE);
      expect(board.values[sp.edgeOf(3, 4)]).toBe(NONE);
      expect(sp.edges.filter((e) => board.values[e] !== 0)).toHaveLength(2);
    });

    describe("with its cursor drawn", () => {
      const game = fillGame("lacing", lacing);
      const id = `3x3:${dealtOn(ring).board.dealt.number.v.join("")}`;
      const cursorLines = (presses: number[]) =>
        renderScenario({ game, id, presses }).recording.ops.filter(
          (o) => o.op === "line" && o.color === COL_CURSOR,
        );
      const discs = renderScenario({ game, id }).recording.ops.flatMap((o) =>
        o.op === "circle" && o.fill === COL_CELL ? [{ x: o.cx, y: o.cy }] : [],
      );
      /** The middle of the brackets `lines` draw. */
      const middle = (lines: ReturnType<typeof cursorLines>) => {
        const xs = lines.flatMap((l) => (l.op === "line" ? [l.x1, l.x2] : []));
        const ys = lines.flatMap((l) => (l.op === "line" ? [l.y1, l.y2] : []));
        return {
          x: (Math.min(...xs) + Math.max(...xs)) / 2,
          y: (Math.min(...ys) + Math.max(...ys)) / 2,
        };
      };
      const near = (a: { x: number; y: number }, b: { x: number; y: number }) =>
        Math.hypot(a.x - b.x, a.y - b.y) <= 1;

      it("on an edge by its two squares, between their middles", () => {
        const lines = cursorLines([CURSOR_RIGHT]);
        // Each square draws the brackets' eight strokes in its own clip.
        expect(lines).toHaveLength(16);
        const [a, b] = [discs[0], discs[1]];
        expect(near(middle(lines), { x: (a.x + b.x) / 2, y: a.y })).toBe(true);
      });

      it("on a corner by its four squares, and on a middle by its square", () => {
        expect(cursorLines([CURSOR_RIGHT, CURSOR_DOWN])).toHaveLength(32);
        const corner = middle(cursorLines([CURSOR_RIGHT, CURSOR_DOWN]));
        const [a, , , , e] = discs;
        expect(near(corner, { x: (a.x + e.x) / 2, y: (a.y + e.y) / 2 })).toBe(true);
        const square = cursorLines([CURSOR_RIGHT, CURSOR_RIGHT]);
        expect(square).toHaveLength(8);
        expect(near(middle(square), discs[1])).toBe(true);
      });
    });
  });

  it("finds a board whose values break a number impossible", () => {
    const { board } = dealtOn(ring);
    const wrong = { ...board, values: board.values.slice() };
    // A line on an edge of the center, whose number is 0.
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    wrong.values[sp.edgeOf(1, 4)] = LINE;
    expect(solveBoard(lacing, wrong, lacing.TIER.easy).verdict).toBe("impossible");
  });
});
