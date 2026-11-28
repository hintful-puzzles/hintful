/**
 * A clue one a value of some values alone, laid at a line's two ends and
 * written a character a value, on the `ending` fixture: each line's count of
 * 1s before its start and of 3s past its end, its 2s following from them.
 */

import { describe, expect, it } from "vitest";
import * as ending from "../../generated/engine/testing/fixtures/ending/ending.compiled.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import type { Color, Point } from "../contract/types.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  LEFT_BUTTON,
  MOD_SHFT,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { perPlace, perValue } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";

const game = fillGame("ending", ending);
type Board = FillBoard<ending.Dealt>;
const p = game.decodeParams("4x4");
const dealt = (seed: string): Board =>
  game.newState(p, game.newDesc(p, randomNew(seed)).desc);

describe("a clue one a value of some values alone", () => {
  it("is dealt for those values, as many as the answer holds, and the rest follow", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const b = dealt(seed);
      const { count } = b.dealt;
      expect(
        Array.from(count.at, (a) => perValue(a)).every((d) => d === 1 || d === 3),
      ).toBe(true);
      // A shown count is what the answer the board finishes holds, and no
      // line has a count of 2s.
      const g = solveBoard(ending, b, 0).values;
      expect(g.includes(0)).toBe(false);
      const sp = spaceOf(ending, b);
      // The deal derives none for a 2 either, so it never judges a board by
      // a clue its ID would drop.
      const derived = ending.deriveClues(g, sp).count;
      expect(Array.from(derived.at, (a) => perValue(a)).sort()).toEqual(
        Array.from({ length: 2 * sp.lines.length }, (_, i) =>
          i < sp.lines.length ? 1 : 3,
        ),
      );
      for (const L of sp.lines) {
        expect(count.valueAt[perPlace(L, 2)]).toBe(-1);
        for (const d of [1, 3]) {
          const v = count.valueAt[perPlace(L, d)];
          if (v >= 0) expect(v).toBe(sp.lineCells[L].filter((c) => g[c] === d).length);
        }
      }
    }
  });

  it("is written a character a value, the 1s columns then rows, then the 3s, each run closed", () => {
    const { desc } = game.newDesc(p, randomNew("write"));
    expect(desc).toMatch(/^([0-4.]{4},){4}$/);
    const b = game.newState(p, desc);
    const runs = desc.split(",").slice(0, 4);
    const at = (line: number, d: number) => b.dealt.count.valueAt[perPlace(line, d)];
    const char = (v: number) => (v < 0 ? "." : String(v));
    // Lines are rows (0 to 3) then columns (4 to 7).
    const cols = (d: number) => [4, 5, 6, 7].map((L) => char(at(L, d))).join("");
    const rows = (d: number) => [0, 1, 2, 3].map((L) => char(at(L, d))).join("");
    expect(runs).toEqual([cols(1), rows(1), cols(3), rows(3)]);
    // Read back the same.
    expect(game.newState(p, desc).dealt.count).toEqual(b.dealt.count);
  });

  it("refuses a count past its line, a character short, and a run left open", () => {
    expect(validateDesc(game, p, "1010,0101,1010,0101,")).toBeNull();
    expect(validateDesc(game, p, "5010,0101,1010,0101,")).not.toBeNull();
    expect(validateDesc(game, p, "101,0101,1010,0101,")).not.toBeNull();
    expect(validateDesc(game, p, "1010,0101,1010,0101")).not.toBeNull();
    // Hidden counts are dots.
    expect(validateDesc(game, p, "....,....,....,....,")).toBeNull();
  });
});

describe("a margin laid at a line's two ends", () => {
  const TS = 32;
  const colors = game.colors(DEFAULT_BACKGROUND);
  const sameColor = (a: Color, c: Color): boolean => a.every((v, i) => v === c[i]);
  const draw = (b: Board): readonly DrawOp[] => {
    const dr = new RecordingDrawing(colors);
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
    } as never);
    return dr.ops;
  };
  const texts = (ops: readonly DrawOp[]) =>
    ops.filter((op): op is Extract<DrawOp, { op: "text" }> => op.op === "text");
  const b = game.newState(p, "1012,0121,2101,1210,");
  const frame = draw(b).find((op) => op.op === "rect" && op.w === 4 * TS + 1);
  if (frame?.op !== "rect") throw new Error("no frame");
  const o = frame.x;
  const middle = ({ x, y }: Point): Point => ({
    x: o + x * TS + TS / 2,
    y: o + y * TS + TS / 2,
  });
  const at = (q: { x: number; y: number }) =>
    texts(draw(b))
      .filter((t) => t.x === middle(q).x && t.y === middle(q).y)
      .map((t) => t.text);

  it("draws the 1s before each line's start and the 3s past its end, and no 2s", () => {
    // The 1s: columns 1 0 1 2 above, rows 0 1 2 1 before.
    expect([0, 1, 2, 3].map((x) => at({ x, y: -1 }))).toEqual([
      ["1"],
      ["0"],
      ["1"],
      ["2"],
    ]);
    expect([0, 1, 2, 3].map((y) => at({ x: -1, y }))).toEqual([
      ["0"],
      ["1"],
      ["2"],
      ["1"],
    ]);
    // The 3s: columns 2 1 0 1 below, rows 1 2 1 0 after.
    expect([0, 1, 2, 3].map((x) => at({ x, y: 4 }))).toEqual([
      ["2"],
      ["1"],
      ["0"],
      ["1"],
    ]);
    expect([0, 1, 2, 3].map((y) => at({ x: 4, y }))).toEqual([
      ["1"],
      ["2"],
      ["1"],
      ["0"],
    ]);
    // Each heading in its end's corner, one tile from the board each way.
    expect(at({ x: -1, y: -1 })).toEqual(["1"]);
    expect(at({ x: 4, y: 4 })).toEqual(["3"]);
    // The other corners head nothing: the 2s are drawn nowhere.
    expect(at({ x: 4, y: -1 })).toEqual([]);
    expect(at({ x: -1, y: 4 })).toEqual([]);
    expect(at({ x: -2, y: 0 })).toEqual([]);
    // The canvas holds a tile past the end, and its rim.
    const { w } = game.computeSize(p, TS);
    expect(w - 4 * TS - o).toBe(o);
  });

  it("marks a clue done by a press at either end, and by Shift with each arrow", () => {
    const pressed = (q: Point) => {
      const move = game.interpretMove(
        b,
        game.newUi(b),
        game.newDrawState(b, TS),
        middle(q),
        LEFT_BUTTON,
      );
      if (move === null || move === UI_UPDATE)
        throw new Error("the press made no move");
      return move;
    };
    const marks = (line: number, d: number) => ({
      type: "done",
      kind: "count",
      k: b.dealt.count.byAt[perPlace(line, d)],
    });
    expect(pressed({ x: 4, y: 2 })).toEqual(marks(2, 3));
    expect(pressed({ x: 1, y: 4 })).toEqual(marks(4 + 1, 3));
    expect(pressed({ x: -1, y: 2 })).toEqual(marks(2, 1));
    const ui = game.newUi(b);
    Object.assign(ui.cursor, { x: 1, y: 2, visible: true });
    const key = (k: number) =>
      game.interpretMove(b, ui, game.newDrawState(b, TS), { x: 0, y: 0 }, k | MOD_SHFT);
    expect(key(CURSOR_LEFT)).toEqual(marks(2, 1));
    expect(key(CURSOR_RIGHT)).toEqual(marks(2, 3));
    expect(key(CURSOR_UP)).toEqual(marks(4 + 1, 1));
    expect(key(CURSOR_DOWN)).toEqual(marks(4 + 1, 3));
    // Done, a count is drawn gray.
    const done = game.executeMove(b, pressed({ x: 4, y: 2 }));
    const gray = texts(draw(done)).filter(
      (t) => t.x === middle({ x: 4, y: 2 }).x && t.y === middle({ x: 4, y: 2 }).y,
    );
    expect(
      gray.some((t) => !sameColor(colors[t.color], colors[texts(draw(b))[0].color])),
    ).toBe(true);
  });

  it("prints the 3s after each row and below the grid", () => {
    const text = (game.textFormat?.(b) ?? "").split("\n");
    expect(text[0].trimStart().startsWith("1")).toBe(true);
    expect(
      text.some((l) => l.trimEnd().endsWith("| 1") || l.trimEnd().endsWith(" 1")),
    ).toBe(true);
    expect(text.at(-2)).toMatch(/2 +1 +0 +1 +3$/);
  });
});
