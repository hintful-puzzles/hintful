/**
 * A clue at an edge whose value is one of its ends, on the `ordering`
 * fixture: derived from a sampled answer, written in the desc as a record a
 * cell (upstream's Unequal), and read back.
 */

import { describe, expect, it } from "vitest";
import * as ordering from "../../generated/engine/testing/fixtures/ordering/ordering.compiled.ts";
import { clueDoneColor } from "../color/palette.ts";
import { COL_ERROR } from "../color/roles.ts";
import {
  DESC_CONTRADICTORY,
  DESC_OUT_OF_RANGE,
  descBadCharacter,
  validateDesc,
} from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import type { Color } from "../contract/types.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  RIGHT_BUTTON,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import type { AnyGame } from "../testing/input-probe.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { expectDragRepeatsThePress } from "../testing/sweep-probe.ts";
import { asDealt, type FillBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";
import { type FillMove, isCandidateMove } from "./notes.ts";

const game = fillGame("ordering", ordering);
type Board = FillBoard<ordering.Dealt>;

const params = (w: number, diff = 0) => ({ w, h: w, diff });
const sameColor = (a: Color, b: Color): boolean => a.every((v, i) => v === b[i]);
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

  it("hides first the givens `deal.hideBy` ranks higher", () => {
    // The fixture ranks a given by its number, so it keeps smaller ones than
    // the same module hiding at random. A board keeps the givens its tier
    // needs, so this compares the two over several deals.
    const unranked = fillGame("ordering", { ...ordering, hideRank: undefined });
    const kept = (g: typeof game): number[] =>
      ["a", "b", "c", "d", "e", "f"].flatMap((seed) => {
        const { desc } = g.newDesc(params(5, NORMAL), randomNew(seed));
        return [...board(5, desc).dealt.given.v];
      });
    const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const [ranked, random] = [mean(kept(game)), mean(kept(unranked))];
    expect(ranked + 0.5, `${ranked} against ${random}`).toBeLessThan(random);
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

  it("takes a press in a cell, and none in a gap without a sign", () => {
    const b = board(4, UPSTREAM);
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, TS);
    const o = (game.computeSize(params(4), TS).w - (4 * TS + 3 * GAP)) / 2;
    expect(game.interpretMove(b, ui, ds, middle(5, o), LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(ui.cursor).toMatchObject({ x: 1, y: 1, visible: true });
    const inGap = { x: middle(5, o).x + TS / 2 + GAP / 2, y: middle(5, o).y };
    expect(game.interpretMove(b, game.newUi(b), ds, inGap, LEFT_BUTTON)).toBeNull();
  });

  describe("a sign marked done", () => {
    const b = board(4, UPSTREAM);
    const ds = game.newDrawState(b, TS);
    const o = (game.computeSize(params(4), TS).w - (4 * TS + 3 * GAP)) / 2;
    /** The middle of the gap right of cell `c`, or below it. */
    const right = (c: number) => ({
      x: middle(c, o).x + TS / 2 + GAP / 2,
      y: middle(c, o).y,
    });
    const below = (c: number) => ({
      x: middle(c, o).x,
      y: middle(c, o).y + TS / 2 + GAP / 2,
    });
    /** The board after the move a press at `p` makes, with `button`. */
    const pressed = (s: Board, p: { x: number; y: number }, button = LEFT_BUTTON) => {
      const move = game.interpretMove(s, game.newUi(s), ds, p, button);
      if (move === null || move === UI_UPDATE)
        throw new Error("the press made no move");
      return game.executeMove(s, move);
    };
    const doneSigns = (s: Board) => Array.from(s.done["greater"] ?? []);

    it("is marked by a press in its gap with either button, and unmarked by another", () => {
      // The signs right of cell 0, below it, and right of cell 9.
      const k = (e: number) => b.dealt.greater.byAt[e];
      const sp = spaceOf(ordering, b);
      const once = pressed(b, right(0));
      expect(doneSigns(once)[k(sp.edgeOf(0, 1))]).toBe(1);
      expect(doneSigns(once).filter((d) => d === 1)).toHaveLength(1);
      const other = pressed(once, below(0), RIGHT_BUTTON);
      expect(doneSigns(other)[k(sp.edgeOf(0, 4))]).toBe(1);
      expect(doneSigns(pressed(other, right(0)))[k(sp.edgeOf(0, 1))]).toBe(0);
      // The sign right of a given.
      expect(doneSigns(pressed(b, right(9)))[k(sp.edgeOf(9, 10))]).toBe(1);
    });

    it("is drawn gray, and red once it breaks", () => {
      const colors = game.colors(DEFAULT_BACKGROUND);
      const inks = (s: Board) => signs(draw(s)).map((op) => colors[op.fill]);
      const gray = clueDoneColor(DEFAULT_BACKGROUND);
      const grays = (s: Board) => inks(s).filter((c) => sameColor(c, gray)).length;
      const marked = pressed(b, below(0));
      expect(grays(b)).toBe(0);
      expect(grays(marked)).toBe(1);
      expect(inks(marked)).toHaveLength(inks(b).length);
      // Above 3 where the top must be the greater: red, though marked done.
      const broken = inks(game.executeMove(marked, { set: [0, 1, 4, 3] }));
      expect(broken.filter((c) => sameColor(c, colors[COL_ERROR]))).toHaveLength(1);
      expect(grays(game.executeMove(marked, { set: [0, 1, 4, 3] }))).toBe(0);
    });

    it("is marked by Shift or Ctrl with the arrow toward it, from the selected square", () => {
      const ui = game.newUi(b);
      expect(game.interpretMove(b, ui, ds, middle(0, o), LEFT_BUTTON)).toBe(UI_UPDATE);
      const sp = spaceOf(ordering, b);
      const down = game.interpretMove(
        b,
        ui,
        ds,
        { x: 0, y: 0 },
        CURSOR_DOWN | MOD_SHFT,
      );
      expect(down).toEqual({
        type: "done",
        kind: "greater",
        k: b.dealt.greater.byAt[sp.edgeOf(0, 4)],
      });
      const across = game.interpretMove(
        b,
        ui,
        ds,
        { x: 0, y: 0 },
        CURSOR_RIGHT | MOD_CTRL,
      );
      expect(across).toEqual({
        type: "done",
        kind: "greater",
        k: b.dealt.greater.byAt[sp.edgeOf(0, 1)],
      });
      // No sign that way: no move, and the cursor stays.
      expect(
        game.interpretMove(b, ui, ds, { x: 0, y: 0 }, CURSOR_LEFT | MOD_SHFT),
      ).toBeNull();
      expect(ui.cursor).toMatchObject({ x: 0, y: 0 });
    });

    it("leaves the values and notes as they were, and is gone from the board as dealt", () => {
      const marked = pressed(b, right(0));
      expect(marked.values).toEqual(b.values);
      expect(marked.pencil).toEqual(b.pencil);
      expect(asDealt(marked).done["greater"]).toEqual(b.done["greater"]);
    });

    it("is read back from a save as the move it was", () => {
      const move = { type: "done", kind: "greater", k: 1 };
      expect(doneSigns(game.executeMove(b, JSON.parse(JSON.stringify(move))))[1]).toBe(
        1,
      );
      expect(() =>
        game.executeMove(b, { type: "done", kind: "given", k: 0 } as never),
      ).toThrow();
    });

    it("is what a drag through the gaps repeats", () => {
      const declared = game.doneClues;
      if (declared === undefined) throw new Error("no doneClues");
      expectDragRepeatsThePress(
        { ...game, defaultParams: () => params(5, NORMAL) } as unknown as AnyGame,
        "ordering",
        declared,
      );
    });
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
