/**
 * Clues at slots, a step beyond each end of every line, on the `flanking`
 * fixture: dealt from the answer, every sum shown at Easy and above it the
 * squares hidden before the sums, written a slot at a time between slashes
 * with the givens after a comma only where there are any, drawn in the
 * margin at both ends of each line, red where broken, gray where marked
 * done, printed in the text format, and outlined by the walk's own step.
 */

import { describe, expect, it } from "vitest";
import * as flanking from "../../generated/engine/testing/fixtures/flanking/flanking.compiled.ts";
import { clueDoneColor } from "../color/palette.ts";
import { COL_ERROR, COL_HINT_OUTLINE } from "../color/roles.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  descBadCharacter,
  validateDesc,
} from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import type { Color, Point } from "../contract/types.ts";
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
import {
  type DrawOp,
  opsOfKind,
  RecordingDrawing,
} from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { expectDragRepeatsThePress } from "../testing/sweep-probe.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { dealFill } from "./deal.ts";
import { encodeDesc } from "./desc.ts";
import { fillGame } from "./game.ts";
import type { FillDeal } from "./game-id.ts";
import { slotAt, slotPoint } from "./slots.ts";

const game = fillGame("flanking", flanking);
type Board = FillBoard<flanking.Dealt>;

const params = (w: number, diff = 0) => ({ w, h: w, diff });
const board = (w: number, desc: string): Board => game.newState(params(w), desc);
const NORMAL = 1;
const sameColor = (a: Color, b: Color): boolean => a.every((v, i) => v === b[i]);

// Sums of the answer 1234/3412/4321/2143 above each column, below each, left
// of each row and right of each, some left out, and two of its squares given.
const SLOTS4 = ["4", "6", "", "6", "6", "", "", "", "", "7", "", "", "", "", "", "7"];
const FLANKS4 = SLOTS4.join("/");
const D4 = `${FLANKS4},a2_3m`;

describe("a clue at a slot in the desc", () => {
  it("reads a clue a slot between slashes, and the givens after the comma", () => {
    const b = board(4, D4);
    const { flank, given } = b.dealt;
    expect(Array.from(flank.at)).toEqual([0, 1, 3, 4, 9, 15]);
    expect(Array.from(flank.v)).toEqual([4, 6, 6, 6, 7, 7]);
    expect(Array.from(given.at)).toEqual([1, 2]);
    expect(Array.from(given.v)).toEqual([2, 3]);
    expect(Array.from(b.values.slice(0, 3))).toEqual([0, 2, 3]);
  });

  it("writes it back byte for byte, and no comma where no square is given", () => {
    for (const desc of [D4, FLANKS4]) {
      const b = board(4, desc);
      expect(encodeDesc(flanking.deal, spaceOf(flanking, b), b.dealt)).toBe(desc);
    }
  });

  it("refuses a clue out of range, a slot too many and a comma between", () => {
    const p = params(4);
    expect(validateDesc(game, p, D4)).toBeNull();
    // Two squares of 1 to 4 sum to 3 to 7.
    expect(validateDesc(game, p, D4.replace("4/6", "4/8"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, D4.replace("4/6", "2/6"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, `/${D4}`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(game, p, D4.replace("4/6", "4,6"))).toBe(descBadCharacter(","));
  });

  it("deals the sums of an answer's two squares nearest each slot, and writes them back", () => {
    for (const seed of ["a", "b", "c"]) {
      const p = params(5, NORMAL);
      const { desc } = game.newDesc(p, randomNew(seed));
      const b = game.newState(p, desc);
      const solved = solveBoard(flanking, b, NORMAL);
      expect(solved.verdict).toBe("solved");
      const answer = solved.values;
      const sp = spaceOf(flanking, b);
      b.dealt.flank.at.forEach((s, k) => {
        const [a, z] = sp.sight[s];
        expect(answer[a] + answer[z]).toBe(b.dealt.flank.v[k]);
      });
      expect(encodeDesc(flanking.deal, sp, b.dealt)).toBe(desc);
    }
  });

  it("shows every sum at Easy, where the deal hides sums from Normal on", () => {
    for (const seed of ["a", "b", "c"]) {
      const p = params(5);
      const b = game.newState(p, game.newDesc(p, randomNew(seed)).desc);
      expect(b.dealt.flank.at.length).toBe(20);
      expect(b.dealt.given.at.length).toBeLessThan(25);
    }
  });

  it("hides the squares first and then the sums, where the squares go first", () => {
    /** The squares and sums a Normal deal of `deal` leaves, over some seeds. */
    const left = (deal: FillDeal) => {
      let given = 0;
      let flank = 0;
      for (const seed of ["a", "b", "c", "d", "e", "f"]) {
        const p = params(5, NORMAL);
        const { desc } = dealFill(flanking, deal, p, randomNew(seed));
        const b = game.newState(p, desc);
        given += b.dealt.given.at.length;
        flank += b.dealt.flank.at.length;
      }
      return { given, flank };
    };
    const { hideFirst: _, ...together } = flanking.deal;
    const inTurn = left(flanking.deal);
    const mixed = left(together);
    // Measured 2026-11-23: 1 square and 41 sums left squares first, 30 and 16 not.
    expect(inTurn.given).toBeLessThan(mixed.given);
    expect(inTurn.flank).toBeGreaterThan(mixed.flank);
  });

  it("hides the squares first at the lowest tier too, where it reads no sum while they all show", () => {
    // Easy hiding sums as well: the squares alone finish the board, so a
    // shortest run kept from the start of the order, where the squares are,
    // leaves squares and no sum.
    const { hideFrom: _, ...atEasy } = flanking.deal;
    let given = 0;
    let flank = 0;
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const p = params(5);
      const b = game.newState(p, dealFill(flanking, atEasy, p, randomNew(seed)).desc);
      given += b.dealt.given.at.length;
      flank += b.dealt.flank.at.length;
    }
    expect(flank).toBeGreaterThan(0);
    expect(given).toBeLessThan(flank);
  });

  it("hides the squares whole below a tier on a small board, and keeps some elsewhere", () => {
    // Below the tier after Normal, which the fixture has none of: its Easy
    // finishes no board without a square, its `rest` reading one.
    const deal: FillDeal = {
      ...flanking.deal,
      hideWhole: { given: { below: NORMAL + 1, bounds: { longer: { max: 4 } } } },
    };
    /** The squares a Normal deal of `deal` leaves on a `w` by `w` board,
     * over some seeds. */
    const given = (w: number) => {
      let n = 0;
      for (const seed of ["a", "b", "c", "d", "e", "f"]) {
        const p = params(w, NORMAL);
        const { desc } = dealFill(flanking, deal, p, randomNew(seed));
        n += game.newState(p, desc).dealt.given.at.length;
      }
      return n;
    };
    expect(given(4)).toBe(0);
    // Past the bounds a square is kept, as without the setting.
    expect(given(5)).toBeGreaterThan(0);
  });
});

describe("a slot's clue drawn", () => {
  const TS = 48;
  const o = (game.computeSize(params(4), TS).w - 4 * TS) / 2;
  const draw = (b: Board, extra: object = {}): readonly DrawOp[] => {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
      ...extra,
    });
    return dr.ops;
  };
  const texts = (ops: readonly DrawOp[]) =>
    ops.filter((op): op is Extract<DrawOp, { op: "text" }> => op.op === "text");
  const at = (t: { x: number; y: number }): Point => ({ x: t.x, y: t.y });
  /** The middle of the square at `(x, y)`, off the grid or on it. */
  const middle = ({ x, y }: Point): Point => ({
    x: o + x * TS + TS / 2,
    y: o + y * TS + TS / 2,
  });
  const colors = game.colors(DEFAULT_BACKGROUND);
  const b = board(4, D4);
  const ds = game.newDrawState(b, TS);

  it("is a tile and an eighth wide all round the board", () => {
    expect(o).toBe(TS + TS / 8);
    expect(game.computeSize(params(4), TS)).toEqual({
      w: 4 * TS + 2 * o,
      h: 4 * TS + 2 * o,
    });
  });

  it("writes each clue in the middle of its margin square, at both ends of the lines", () => {
    const off = (t: Point) =>
      t.x < o || t.y < o || t.x > o + 4 * TS || t.y > o + 4 * TS;
    const drawn = texts(draw(b)).filter((t) => off(t));
    expect(drawn.map((t) => [t.text, at(t)])).toEqual(
      Array.from(b.dealt.flank.at, (s, k) => [
        String(b.dealt.flank.v[k]),
        middle(slotPoint(4, 4, s)),
      ]),
    );
  });

  it("keeps the grid's frame whole beside the slots right of the board and below it", () => {
    const rects = opsOfKind(draw(b), "rect");
    /** The color of the last rect painted over `p`. */
    const top = (p: Point) =>
      rects.findLast(
        (r) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h,
      )?.rgb;
    // The left line, which no slot reaches, is the frame's color.
    const frame = top({ x: o, y: o + TS / 2 });
    expect(frame).toBeDefined();
    for (let i = 0; i < 4; i++) {
      expect(top({ x: o + 4 * TS, y: o + i * TS + TS / 2 })).toBe(frame);
      expect(top({ x: o + i * TS + TS / 2, y: o + 4 * TS })).toBe(frame);
    }
  });

  /** Row 1's first square holds 4: with 1 above it, the sum above column 0
   * is 5, not 4. */
  const brokenAbove = (s: Board) => game.executeMove(s, { set: [4, 4] } as never);

  it("draws a clue red where the two squares nearest it break it", () => {
    const top = game.executeMove(b, { set: [0, 1] } as never);
    const red = texts(draw(brokenAbove(top))).filter((t) =>
      sameColor(colors[t.color], colors[COL_ERROR]),
    );
    expect(red.map(at)).toEqual([middle({ x: 0, y: -1 })]);
  });

  /** The board after the move a press at `p` makes, with `button`. */
  const pressed = (s: Board, p: Point, button = LEFT_BUTTON) => {
    const move = game.interpretMove(s, game.newUi(s), ds, p, button);
    if (move === null || move === UI_UPDATE) throw new Error("the press made no move");
    return game.executeMove(s, move);
  };
  const doneFlags = (s: Board) => Array.from(s.done["flank"] ?? []);

  it("is marked done by a press on it with either button, and unmarked by another", () => {
    const k = (s: number) => b.dealt.flank.byAt[s];
    const once = pressed(b, middle({ x: 1, y: -1 }));
    expect(doneFlags(once)[k(1)]).toBe(1);
    expect(doneFlags(once).filter((d) => d === 1)).toHaveLength(1);
    const twice = pressed(once, middle({ x: 4, y: 3 }), RIGHT_BUTTON);
    expect(doneFlags(twice)[k(15)]).toBe(1);
    expect(doneFlags(pressed(twice, middle({ x: 1, y: -1 })))[k(1)]).toBe(0);
    // A margin square with no clue, and a corner, take no mark.
    for (const p of [
      { x: 2, y: -1 },
      { x: -1, y: -1 },
    ])
      expect(
        game.interpretMove(b, game.newUi(b), ds, middle(p), LEFT_BUTTON),
      ).toBeNull();
  });

  it("is drawn gray once marked done, and red over that once it breaks", () => {
    const gray = clueDoneColor(DEFAULT_BACKGROUND);
    const grays = (s: Board) =>
      texts(draw(s)).filter((t) => sameColor(colors[t.color], gray)).length;
    const marked = pressed(b, middle({ x: 0, y: -1 }));
    expect(grays(b)).toBe(0);
    expect(grays(marked)).toBe(1);
    const broken = brokenAbove(game.executeMove(marked, { set: [0, 1] } as never));
    expect(grays(broken)).toBe(0);
  });

  it("is marked by Shift or Ctrl with an arrow, the clue at that end of the cursor's line", () => {
    const ui = game.newUi(b);
    expect(game.interpretMove(b, ui, ds, middle({ x: 0, y: 3 }), LEFT_BUTTON)).toBe(
      UI_UPDATE,
    );
    const key = (k: number) => game.interpretMove(b, ui, ds, { x: 0, y: 0 }, k);
    const marks = (s: number) => ({
      type: "done",
      kind: "flank",
      k: b.dealt.flank.byAt[s],
    });
    // Up column 0 to slot 0, down it to slot 4, right along row 3 to slot 15.
    expect(key(CURSOR_UP | MOD_SHFT)).toEqual(marks(0));
    expect(key(CURSOR_DOWN | MOD_SHFT)).toEqual(marks(4));
    expect(key(CURSOR_RIGHT | MOD_CTRL)).toEqual(marks(15));
    // Left of row 3 holds none.
    expect(key(CURSOR_LEFT | MOD_SHFT)).toBeNull();
    expect(ui.cursor).toMatchObject({ x: 0, y: 3 });
  });

  it("is what a drag along the margin repeats", () => {
    const declared = game.doneClues;
    if (declared === undefined) throw new Error("no doneClues");
    expectDragRepeatsThePress(
      { ...game, defaultParams: () => params(5, NORMAL) } as unknown as AnyGame,
      "flanking",
      declared,
    );
  });
});

describe("a slot's clue in the text", () => {
  it("prints each column's clues over and under it and each row's at its ends", () => {
    expect((game.textFormat?.(board(4, D4)) ?? "").split("\n")).toEqual([
      "    4   6       6",
      "  +---+---+---+---+",
      "  | . | 2 | 3 | . |",
      "  +---+---+---+---+",
      "7 | . | . | . | . |",
      "  +---+---+---+---+",
      "  | . | . | . | . |",
      "  +---+---+---+---+",
      "  | . | . | . | . | 7",
      "  +---+---+---+---+",
      "    6",
      "",
    ]);
  });
});

describe("the hint of a board of slots", () => {
  const TS = 48;
  const W = 5;
  const o = (game.computeSize(params(W), TS).w - W * TS) / 2;
  const colors = game.colors(DEFAULT_BACKGROUND);
  /** What a step of the walk draws on board `b`. */
  const drawn = (b: Board, hint: unknown): readonly DrawOp[] => {
    const dr = new RecordingDrawing(colors);
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
      hint,
    } as never);
    return dr.ops;
  };
  /** The square at `(x, y)`, off the grid or on it. */
  const square = ({ x, y }: Point) => ({ x: o + x * TS, y: o + y * TS, w: TS, h: TS });

  it("finishes a dealt board, its own step outlining the clue in its margin and hatching its line's ends", () => {
    let outlined = 0;
    for (const seed of ["a", "b", "c", "d"]) {
      const p = params(W, NORMAL);
      let b = game.newState(p, game.newDesc(p, randomNew(seed)).desc);
      for (let made = 0; game.status(b) !== "solved"; made++) {
        expect(made).toBeLessThan(80);
        const got = game.hint.plan(b);
        if (!got.ok) throw new Error(`no hint: ${got.error}`);
        const [step] = got.steps;
        if (step.rung === "flank") {
          const said = step.explanation;
          // The square it strikes from is outlined too, on the grid.
          const slots = stepMarks(step)
            .of("outline", CELL)
            .map((q) => slotAt(W, W, q.x, q.y))
            .filter((s) => s >= 0);
          expect(slots, said).toHaveLength(1);
          const [s] = slots;
          const k = b.dealt.flank.byAt[s];
          expect(k, said).toBeGreaterThanOrEqual(0);
          expect(said).toMatch(
            new RegExp(
              `^No two numbers that sum to ${b.dealt.flank.v[k]} for this clue `,
            ),
          );
          // Drawn: four sides inside the clue's margin square, and the
          // squares at both ends of its line hatched.
          const ops = drawn(b, step);
          const box = square(slotPoint(W, W, s));
          const inBox = (r: { x: number; y: number; w: number; h: number }) =>
            r.x >= box.x &&
            r.x + r.w <= box.x + TS &&
            r.y >= box.y &&
            r.y + r.h <= box.y + TS;
          const sides = ops.filter(
            (op) =>
              op.op === "rect" &&
              sameColor(colors[op.color], colors[COL_HINT_OUTLINE]) &&
              inBox(op),
          );
          expect(sides, said).toHaveLength(4);
          const hatched = ops.flatMap((op) =>
            op.op === "hatch" ? [{ x: op.x, y: op.y, w: op.w, h: op.h }] : [],
          );
          const other = spaceOf(flanking, b).opposite[s];
          expect(hatched, said).toContainEqual(box);
          expect(hatched, said).toContainEqual(square(slotPoint(W, W, other)));
          outlined++;
        }
        b = game.executeMove(b, step.move);
      }
    }
    expect(outlined).toBeGreaterThan(0);
  });
});
