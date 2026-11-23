/**
 * A clue at an edge whose value is one of its ends, on the `ordering`
 * fixture: derived from a sampled answer, written in the desc as a record a
 * cell (upstream's Unequal), and read back.
 */

import { describe, expect, it } from "vitest";
import * as ordering from "../../generated/engine/testing/fixtures/ordering/ordering.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import {
  DESC_CONTRADICTORY,
  DESC_OUT_OF_RANGE,
  descBadCharacter,
  validateDesc,
} from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { LEFT_BUTTON } from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";
import { type FillMove, isCandidateMove } from "./notes.ts";

const game = fillGame("ordering", ordering);
type Board = FillBoard<ordering.Dealt>;

const params = (w: number, diff = 0) => ({ w, h: w, diff });
/** The tier whose boards need a sign. */
const NORMAL = 1;
const board = (w: number, desc: string): Board => game.newState(params(w), desc);

// Upstream's: a 4x4 with a given 2 twice and signs, the first at the top
// left pointing down, the next left from its right neighbor.
const UPSTREAM = "0D,0L,0,0,0,0,0,0,0,2R,0,0,2,0,0,0,";

describe("a record a cell", () => {
  it("reads each record's number and its signs, each valued the cell it is written at", () => {
    const b = board(4, UPSTREAM);
    const { given, greater } = b.dealt;
    expect(Array.from(given.at)).toEqual([9, 12]);
    expect(Array.from(given.v)).toEqual([2, 2]);
    const sp = spaceOf(ordering, b);
    const signs = Array.from(greater.at, (e, i) => [
      Array.from(sp.edgeEnds.slice(2 * e, 2 * e + 2)),
      greater.v[i],
    ]);
    expect(signs).toEqual(
      expect.arrayContaining([
        [[0, 4], 0],
        [[0, 1], 1],
        [[9, 10], 9],
      ]),
    );
    expect(signs).toHaveLength(3);
  });

  it("writes upstream's desc back byte for byte", () => {
    for (const desc of [
      UPSTREAM,
      "3R,0R,0,0,0,0R,0,0,0,0,0,0,0,0,0U,2,",
      "0,0D,0L,0L,0,0,0,0D,0,0,0,0,0R,0,0U,0,",
    ]) {
      const b = board(4, desc);
      expect(encodeDesc(ordering.deal, spaceOf(ordering, b), b.dealt)).toBe(desc);
    }
  });

  it("refuses a sign off the grid, one valued both its ends, and a letter out of order", () => {
    const zeros = "0,".repeat(15);
    const p = params(4);
    expect(validateDesc(game, p, `0U,${zeros}`)).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, `0R,0L,${"0,".repeat(14)}`)).toBe(DESC_CONTRADICTORY);
    expect(validateDesc(game, p, `0R,0,${"0,".repeat(14)}`)).toBeNull();
    expect(validateDesc(game, p, `0,0LR,${"0,".repeat(14)}`)).toBe(
      descBadCharacter("R"),
    );
    expect(validateDesc(game, p, `5,${zeros}`)).toBe(DESC_OUT_OF_RANGE);
  });

  it("deals a board whose signs it writes and reads back", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const { desc } = game.newDesc(params(5, NORMAL), randomNew(seed));
      const b = board(5, desc);
      expect(b.dealt.greater.at.length).toBeGreaterThan(0);
      expect(encodeDesc(ordering.deal, spaceOf(ordering, b), b.dealt)).toBe(desc);
    }
  });
});

describe("a board with gaps", () => {
  const TS = 32;
  const GAP = TS / 2;
  /** The middle of cell `c` on a 4x4, the board's origin `o` in. */
  const middle = (c: number, o: number) => ({
    x: o + (c % 4) * (TS + GAP) + TS / 2,
    y: o + Math.floor(c / 4) * (TS + GAP) + TS / 2,
  });
  const draw = (b: Board): readonly DrawOp[] => {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops;
  };
  const signs = (ops: readonly DrawOp[]) =>
    ops.filter((o): o is Extract<DrawOp, { op: "polygon" }> => o.op === "polygon");

  it("is a cell and a gap wide a cell, but the last", () => {
    const one = game.computeSize(params(4), TS);
    expect(one.w - game.computeSize({ w: 3, h: 3, diff: 0 }, TS).w).toBe(TS + GAP);
  });

  it("draws each sign in its gap, pointing at the smaller side, red once it breaks", () => {
    const b = board(4, UPSTREAM);
    const ink = signs(draw(b));
    expect(ink).toHaveLength(3);
    const colors = game.colors(DEFAULT_BACKGROUND);
    // Above 3 where the top must be the greater: the sign down from it breaks.
    const broken = signs(draw(game.executeMove(b, { set: [0, 1, 4, 3] })));
    const red = broken.filter((o) => colors[o.fill] === colors[COL_ERROR]);
    expect(red).toHaveLength(1);
    // The sign down from the top left: inside the gap below it, its point
    // the lowest point.
    const o = (game.computeSize(params(4), TS).w - (4 * TS + 3 * GAP)) / 2;
    const ys = red[0].points.map(([, y]) => y);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(o + TS);
    expect(Math.max(...ys)).toBeLessThanOrEqual(o + TS + GAP);
    const tip = red[0].points.find(([, y]) => y === Math.max(...ys));
    expect(tip?.[0]).toBeCloseTo(o + TS / 2, -1);
  });

  it("takes a press in a cell and none in a gap", () => {
    const b = board(4, UPSTREAM);
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, TS);
    const o = (game.computeSize(params(4), TS).w - (4 * TS + 3 * GAP)) / 2;
    expect(game.interpretMove(b, ui, ds, middle(5, o), LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(ui.cursor).toMatchObject({ x: 1, y: 1, visible: true });
    const inGap = { x: middle(5, o).x + TS / 2 + GAP / 2, y: middle(5, o).y };
    expect(game.interpretMove(b, game.newUi(b), ds, inGap, LEFT_BUTTON)).toBeNull();
  });

  it("prints each sign between its cells", () => {
    expect((game.textFormat?.(board(4, UPSTREAM)) ?? "").trimEnd().split("\n")).toEqual(
      [
        "+---+---+---+---+",
        "| . < .   .   . |",
        "+ v             +",
        "| .   .   .   . |",
        "+               +",
        "| .   2 > .   . |",
        "+               +",
        "| 2   .   .   . |",
        "+---+---+---+---+",
      ],
    );
  });
});

describe("the hint of a board with signs", () => {
  it("finishes a dealt board, the sign stepping where the Latin square stops", () => {
    const signs: { words: string; move: FillMove }[] = [];
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const p = params(5, NORMAL);
      let b = board(5, game.newDesc(p, randomNew(seed)).desc);
      for (let made = 0; game.status(b) !== "solved"; made++) {
        // A note step a square, and a placement a square, on 25 squares.
        expect(made).toBeLessThan(60);
        const got = game.hint.plan(b);
        if (!got.ok) throw new Error(`no hint: ${got.error}`);
        const [step] = got.steps;
        if (step.rung === "sign")
          signs.push({ words: step.explanation ?? "", move: step.move });
        b = game.executeMove(b, step.move);
      }
    }
    // Each worded by the fact of the end it strikes, as the description
    // says: the larger end loses the numbers up to the smaller's least, and
    // the smaller end those from the larger's greatest up.
    expect(signs.length).toBeGreaterThan(0);
    for (const { words, move } of signs) {
      const said =
        /^This sign's (smaller side is at least|larger side is at most) (\d), so /.exec(
          words,
        );
      expect(said, words).not.toBeNull();
      const bound = Number(said?.[2]);
      const atLeast = said?.[1].startsWith("smaller");
      if (!isCandidateMove(move)) throw new Error(`not a note's move: ${words}`);
      // What the step leaves the square, or strikes from it.
      const left =
        move.type === "pencilAdd"
          ? move.marks.map((m) => m.n)
          : move.type === "set"
            ? [move.n]
            : [];
      const struck = move.type === "pencilStrike" ? move.marks.map((m) => m.n) : [];
      for (const n of left) expect(atLeast ? n > bound : n < bound, words).toBe(true);
      for (const n of struck)
        expect(atLeast ? n <= bound : n >= bound, words).toBe(true);
    }
  });
});
