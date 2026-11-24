/**
 * Clues at a dealt partition's parts, on the `caging` fixture: the partition
 * divided at random into small parts, one clue a part of one of the kinds,
 * written in the desc as upstream Keen's block structure and a letter and a
 * number a part, and read back.
 */

import { describe, expect, it } from "vitest";
import * as caging from "../../generated/engine/testing/fixtures/caging/caging.compiled.ts";
import { clueDoneColor } from "../color/palette.ts";
import { COL_ERROR } from "../color/roles.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import type { Color } from "../contract/types.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
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
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { encodeDesc } from "./desc.ts";
import { fillGame } from "./game.ts";
import type { FillMove } from "./notes.ts";
import { COL_INK } from "./render/palette.ts";

const game = fillGame("caging", caging);
type Board = FillBoard<caging.Dealt>;

const sameColor = (a: Color, b: Color): boolean => a.every((v, i) => v === b[i]);
const params = (w: number, diff = 0, only = false) => ({
  w,
  h: w,
  diff,
  settings: { productsOnly: only ? 1 : 0 },
});
const board = (w: number, desc: string): Board => game.newState(params(w), desc);
/** The tier whose boards need a cage's clue read by the ways to fill it. */
const NORMAL = 1;

// Upstream Keen's 4x4 block structure, its clues each a sum or a product:
// a desc to read and draw, with no answer.
const BLOCKS4 = "aa_a_aa_ba_5a";
const D4 = `${BLOCKS4},m2a3a9m4m2m6a3`;

describe("a block structure and a clue a part", () => {
  it("reads the cages in the order of their first squares, each its one clue", () => {
    const b = board(4, D4);
    const { cage, sum, product } = b.dealt;
    expect(cage.cells.map((cs) => cs[0])).toEqual([0, 2, 4, 5, 6, 10, 13]);
    expect(cage.cells.map((cs) => cs.length)).toEqual([2, 2, 3, 2, 2, 3, 2]);
    expect(Array.from(product.at)).toEqual([0, 3, 4, 5]);
    expect(Array.from(product.v)).toEqual([2, 4, 2, 6]);
    expect(Array.from(sum.at)).toEqual([1, 2, 6]);
    expect(Array.from(sum.v)).toEqual([3, 9, 3]);
  });

  it("writes it back byte for byte, a letter run as upstream compresses it", () => {
    const b = board(4, D4);
    expect(encodeDesc(caging.deal, spaceOf(caging, b), b.dealt)).toBe(D4);
  });

  it("refuses a clue past what its part can make, a part left out and one too many", () => {
    const p = params(4);
    expect(validateDesc(game, p, D4)).toBeNull();
    // Two squares of 1 to 4 multiply to at most 16 and sum to at most 8.
    expect(validateDesc(game, p, D4.replace("m2a3", "m17a3"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, D4.replace("m2a3", "m2a9"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, D4.replace(",m2", ",a0"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, D4.replace("a3a9", "a3"))).toBe(DESC_TOO_SHORT);
    expect(validateDesc(game, p, `${D4}a1`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(game, p, D4.replace(",m2", ",d2"))).toBe(descBadCharacter("d"));
    expect(validateDesc(game, p, `${BLOCKS4.slice(0, 4)},m2`)).toBe(
      descBadCharacter(","),
    );
  });
});

describe("a part's clue drawn", () => {
  const TS = 48;
  const draw = (b: Board, ui = game.newUi(b)): readonly DrawOp[] => {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui,
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops;
  };
  const texts = (ops: readonly DrawOp[]) =>
    ops.filter((o): o is Extract<DrawOp, { op: "text" }> => o.op === "text");
  const colors = game.colors(DEFAULT_BACKGROUND);
  const same = (a: number, b: number) => colors[a].every((v, i) => v === colors[b][i]);

  it("writes each clue once, its number and its sign, at the top left of its part's first square", () => {
    const b = board(4, D4);
    const labels = texts(draw(b));
    expect(labels.map((t) => t.text)).toEqual([
      "2×",
      "3+",
      "9+",
      "4×",
      "2×",
      "6×",
      "3+",
    ]);
    const o = game.computeSize(params(4), TS).w - 4 * TS;
    // The first part's clue in the top left square, in its upper left.
    expect(labels[0].x).toBeLessThan(o / 2 + TS / 3);
    expect(labels[0].y).toBeLessThan(o / 2 + TS / 2);
    expect(labels.every((t) => same(t.color, COL_INK))).toBe(true);
  });

  it("is red once its part's numbers can no longer make it", () => {
    // 2 and 3 multiply to 6, not 2.
    const broken = game.executeMove(board(4, D4), { set: [0, 2, 1, 3] });
    const red = texts(draw(broken)).filter((t) => same(t.color, COL_ERROR));
    expect(red.map((t) => t.text)).toEqual(["2×"]);
  });

  it("keeps a square's notes below the clue's line, in every square", () => {
    const b = board(4, D4);
    const noted = game.executeMove(b, { type: "pencilAll" } as FillMove);
    const ops = texts(draw(noted));
    // The top left square's clue, on the top row's clue line.
    const labelBottom = ops.filter((t) => t.text.length > 1)[0].y;
    // The notes of the top row's squares lie below that line.
    const topNotes = ops.filter(
      (t) => t.text.length === 1 && t.y < labelBottom + (TS * 2) / 3,
    );
    expect(topNotes.length).toBeGreaterThan(0);
    for (const t of topNotes) expect(t.y).toBeGreaterThan(labelBottom);
  });
});

describe("a part's clue marked done", () => {
  const TS = 48;
  const b = board(4, D4);
  const ds = game.newDrawState(b, TS);
  const colors = game.colors(DEFAULT_BACKGROUND);
  const recorded = (s: Board) => {
    const dr = new RecordingDrawing(colors);
    game.redraw(dr, game.newDrawState(s, TS), {
      state: s,
      prev: null,
      dir: 1,
      ui: game.newUi(s),
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops.filter((o): o is Extract<DrawOp, { op: "text" }> => o.op === "text");
  };
  /** A point inside the ink of clue `i` as drawn, from its left baseline. */
  const onClue = (i: number) => {
    const t = recorded(b)[i];
    return { x: t.x + 2, y: t.y - 2 };
  };
  const pressed = (s: Board, p: { x: number; y: number }, button = LEFT_BUTTON) => {
    const move = game.interpretMove(s, game.newUi(s), ds, p, button);
    if (move === null || move === UI_UPDATE) throw new Error("the press made no move");
    return game.executeMove(s, move);
  };

  it("is marked by a press on its text with either button, and unmarked by another", () => {
    // The third clue is the third cage's, a sum: 9+.
    const once = pressed(b, onClue(2));
    expect(Array.from(once.done["sum"])).toEqual([0, 1, 0]);
    expect(Array.from(once.done["product"])).toEqual([0, 0, 0, 0]);
    const other = pressed(once, onClue(0), RIGHT_BUTTON);
    expect(Array.from(other.done["product"])).toEqual([1, 0, 0, 0]);
    expect(Array.from(pressed(other, onClue(2)).done["sum"])).toEqual([0, 0, 0]);
  });

  it("leaves a press elsewhere in the clue's square to select it", () => {
    const t = recorded(b)[0];
    // Below the clue's line, in the same square.
    const below = { x: t.x + 2, y: t.y + TS / 2 };
    const ui = game.newUi(b);
    expect(game.interpretMove(b, ui, ds, below, LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(ui.cursor).toMatchObject({ x: 0, y: 0, visible: true });
  });

  it("is drawn gray, and red over it once it breaks", () => {
    const gray = clueDoneColor(DEFAULT_BACKGROUND);
    const isGray = (c: number) => sameColor(colors[c], gray);
    const marked = pressed(b, onClue(0));
    expect(recorded(b).filter((t) => isGray(t.color))).toHaveLength(0);
    expect(
      recorded(marked)
        .filter((t) => isGray(t.color))
        .map((t) => t.text),
    ).toEqual(["2×"]);
    // 2 and 3 multiply to 6, not 2: red, though marked done.
    const broken = recorded(game.executeMove(marked, { set: [0, 2, 1, 3] }));
    expect(broken.filter((t) => isGray(t.color))).toHaveLength(0);
    expect(
      broken
        .filter((t) => sameColor(colors[t.color], colors[COL_ERROR]))
        .map((t) => t.text),
    ).toEqual(["2×"]);
  });

  it("is what a drag over the clues repeats", () => {
    const declared = game.doneClues;
    if (declared === undefined) throw new Error("no doneClues");
    expectDragRepeatsThePress(
      { ...game, defaultParams: () => params(4) } as unknown as AnyGame,
      "caging",
      declared,
    );
  });

  it("is marked by Shift or Ctrl with an arrow, the clue of the next cage that way", () => {
    const { cells } = b.dealt.cage;
    const partOf = (cell: number) => cells.findIndex((cs) => cs.includes(cell));
    /** The part a done move's clue is at. */
    const partMarked = (m: unknown): number => {
      const { kind, k } = m as { kind: keyof typeof b.dealt; k: number };
      return (b.dealt[kind] as { at: ArrayLike<number> }).at[k];
    };
    const top = recorded(b)[0];
    let checked = 0;
    for (let c = 0; c < 16; c++) {
      const [x, y] = [c % 4, Math.floor(c / 4)];
      const ui = game.newUi(b);
      const inC = { x: top.x + x * TS + TS / 2, y: top.y + y * TS + TS / 2 };
      expect(game.interpretMove(b, ui, ds, inC, LEFT_BUTTON)).toBe(UI_UPDATE);
      for (const [key, dx, dy] of [
        [CURSOR_UP | MOD_SHFT, 0, -1],
        [CURSOR_DOWN | MOD_CTRL, 0, 1],
        [CURSOR_LEFT | MOD_SHFT, -1, 0],
        [CURSOR_RIGHT | MOD_CTRL, 1, 0],
      ] as const) {
        // The first square that way in another cage, if any.
        let next = -1;
        for (
          let [px, py] = [x + dx, y + dy];
          px >= 0 && py >= 0 && px < 4 && py < 4;
          px += dx, py += dy
        )
          if (partOf(py * 4 + px) !== partOf(c)) {
            next = partOf(py * 4 + px);
            break;
          }
        const got = game.interpretMove(b, ui, ds, { x: 0, y: 0 }, key);
        if (next < 0) expect([null, UI_UPDATE], `${c} ${key}`).toContain(got);
        else {
          expect(partMarked(got), `${c} ${key}`).toBe(next);
          checked++;
        }
        expect(ui.cursor).toMatchObject({ x, y });
      }
    }
    expect(checked).toBeGreaterThan(16);
  });
});

describe("the walk", () => {
  it("finishes a dealt board, a cage's step striping its cage and naming its clue", () => {
    for (const seed of ["k", "l"]) {
      const w = 5;
      let b = board(w, game.newDesc(params(w, NORMAL), randomNew(seed)).desc);
      const ui = { ...game.newUi(b), candidateReading: "populate" as const };
      const caged = [];
      for (let n = 0; game.status(b) !== "solved"; n++) {
        if (n > 8 * w * w) throw new Error("the walk runs on");
        const plan = game.hint.plan(b, undefined, ui);
        if (!plan.ok) throw new Error(`no plan: ${JSON.stringify(plan)}`);
        const step = plan.steps[0];
        if (step.rung === "cage") caged.push(step);
        b = game.executeMove(b, step.move);
      }
      expect(caged.length).toBeGreaterThan(0);
      const cages = b.dealt.cage.cells.map((cs) => [...cs].sort((a, c) => a - c));
      for (const step of caged) {
        const striped = stepMarks(step)
          .of("stripes", CELL)
          .map((p) => p.y * w + p.x)
          .sort((a, c) => a - c);
        expect(cages).toContainEqual(striped);
        expect(step.explanation).toMatch(/(sum|multiply) to \d+/);
      }
    }
  });
});

describe("a deal", () => {
  it("divides the board into parts of two to six squares, each with one clue", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const { desc } = game.newDesc(params(5, NORMAL), randomNew(seed));
      const b = board(5, desc);
      const { cage, sum, product } = b.dealt;
      for (const cs of cage.cells) {
        expect(cs.length).toBeGreaterThanOrEqual(2);
        expect(cs.length).toBeLessThanOrEqual(6);
      }
      for (let r = 0; r < cage.parts.length; r++)
        expect(Number(sum.byAt[r] >= 0) + Number(product.byAt[r] >= 0)).toBe(1);
      expect(encodeDesc(caging.deal, spaceOf(caging, b), b.dealt)).toBe(desc);
      // At the tier, and not below it.
      expect(solveBoard(caging, b, NORMAL).verdict).toBe("solved");
      expect(solveBoard(caging, b, NORMAL - 1).verdict).not.toBe("solved");
    }
  });

  it("deals both kinds about as often, a sum of two that leaves no choice only as a last resort", () => {
    let sums = 0;
    let products = 0;
    let poor = 0;
    for (const seed of ["e", "f", "g", "h", "i", "j"]) {
      const { desc } = game.newDesc(params(5, 0), randomNew(seed));
      const { cage, sum, product } = board(5, desc).dealt;
      sums += sum.at.length;
      products += product.at.length;
      for (const [i, r] of sum.at.entries())
        if (cage.cells[r].length === 2 && (sum.v[i] <= 4 || sum.v[i] >= 8)) poor++;
    }
    expect(Math.abs(sums - products)).toBeLessThanOrEqual(6);
    expect(poor).toBeLessThan(sums / 4);
  });

  it("deals products alone under the flag, and writes the flag after the tier", () => {
    const p = params(4, 0, true);
    expect(game.encodeParams(p, true)).toBe("4dem");
    expect(game.decodeParams("4dem")).toMatchObject({ settings: { productsOnly: 1 } });
    expect(game.decodeParams("4de")).toMatchObject({ settings: { productsOnly: 0 } });
    const { desc } = game.newDesc(p, randomNew("only"));
    expect(board(4, desc).dealt.sum.at).toHaveLength(0);
  });

  it("deals a clue past 31, as its part makes it", () => {
    // A product of three squares of a 5x5 often passes 31; the most a
    // clue's domain was once read as.
    const most = Math.max(
      ...["k", "l", "m"].flatMap((seed) =>
        Array.from(
          board(5, game.newDesc(params(5, 0, true), randomNew(seed)).desc).dealt.product
            .v,
        ),
      ),
    );
    expect(most).toBeGreaterThan(31);
  });
});
