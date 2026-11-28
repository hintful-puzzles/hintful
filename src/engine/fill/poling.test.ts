/**
 * A part played whole, on the `poling` fixture: a value placed in one square
 * of a domino writes the other `4 - d`, by a click, a key or any edit, and
 * each button's click goes round its own values from the square pressed.
 */

import { describe, expect, it } from "vitest";
import * as poling from "../../generated/engine/testing/fixtures/poling/poling.compiled.ts";
import { GREEN, RED } from "../color/colors.ts";
import { INK } from "../color/palette.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  LEFT_BUTTON,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { applyEdit } from "./edit.ts";
import { fillGame } from "./game.ts";
import { fillInput, newFillUi } from "./play.ts";

const game = fillGame("poling", poling);
type Board = FillBoard<poling.Dealt>;
const TS = 32;
const p = game.decodeParams("4x4");
/** A 4x4 board of dominoes side by side, the squares given at `givens`. */
const board = (givens: Record<number, number> = {}): Board =>
  game.newState(
    p,
    `${"LR".repeat(8)},${Array.from({ length: 16 }, (_, c) => givens[c] ?? ".").join(",")}`,
  );
const ds = { tileSize: TS };
const input = fillInput<poling.Dealt, typeof ds>(poling, poling.play, () => 0);

/** The board after a click with `button` on square `c`, or `null` where the
 * click makes no move. */
function clicked(b: Board, c: number, button = LEFT_BUTTON): Board | null {
  const at = { x: (c % 4) * TS + TS / 2, y: Math.floor(c / 4) * TS + TS / 2 };
  const ui = newFillUi();
  let out: Board | null = null;
  // A sweep's press makes the edit, or its release, which ends the stroke.
  for (const k of [button, button === LEFT_BUTTON ? LEFT_RELEASE : RIGHT_RELEASE]) {
    const got = input.interpretMove(out ?? b, ui, ds, at, k);
    if (got !== null && got !== UI_UPDATE) out = applyEdit(poling, out ?? b, got);
  }
  return out;
}

/** Squares 0 and 1, a domino. */
const ends = (b: Board) => [b.values[0], b.values[1]];

describe("a part played whole", () => {
  it("goes round empty, a 1 where pressed and a 3 where pressed, by the left button", () => {
    let b = board();
    const seen: number[][] = [];
    for (let k = 0; k < 3; k++) {
      b = clicked(b, 0) ?? b;
      seen.push(ends(b));
    }
    expect(seen).toEqual([
      [1, 3],
      [3, 1],
      [0, 0],
    ]);
    // A press at the other end puts the 1 there.
    expect(ends(clicked(board(), 1) ?? board())).toEqual([3, 1]);
    // And a press on a magnet's 3 end empties it, as upstream's does.
    const magnet = clicked(board(), 0) as Board;
    expect(ends(clicked(magnet, 1) ?? magnet)).toEqual([0, 0]);
  });

  it("makes a domino 2s by the right button, and leaves a magnet to it", () => {
    const neutral = clicked(board(), 0, RIGHT_BUTTON) as Board;
    expect(ends(neutral)).toEqual([2, 2]);
    expect(ends(clicked(neutral, 1, RIGHT_BUTTON) ?? neutral)).toEqual([0, 0]);
    // Each button leaves what the other placed.
    expect(clicked(neutral, 0)).toBeNull();
    expect(clicked(clicked(board(), 0) as Board, 0, RIGHT_BUTTON)).toBeNull();
  });

  it("writes the other end by a key, and by any edit, and leaves a given", () => {
    const ui = newFillUi();
    Object.assign(ui.cursor, { x: 1, y: 0, visible: true });
    const typed = input.interpretMove(
      board(),
      ui,
      ds,
      { x: -1, y: -1 },
      "3".charCodeAt(0),
    );
    if (typed === null || typed === UI_UPDATE) throw new Error("the key made no move");
    expect(ends(applyEdit(poling, board(), typed))).toEqual([1, 3]);
    expect(ends(applyEdit(poling, board(), { set: [0, 2] }))).toEqual([2, 2]);
    // A given end stays as dealt.
    const given = board({ 1: 2 });
    expect(ends(applyEdit(poling, given, { set: [0, 1] }))).toEqual([1, 2]);
  });

  it("draws a placed tile's halves joined, red + to ink − or green both ends", () => {
    const colors = game.colors(DEFAULT_BACKGROUND);
    const draw = (b: Board) => {
      const dr = new RecordingDrawing(colors);
      game.redraw(dr, game.newDrawState(b, TS), {
        state: b,
        prev: null,
        dir: 1,
        ui: game.newUi(b),
        animTime: 0,
        flash: NO_FLASH,
      } as never);
      return dr.ops.filter(
        (op): op is Extract<DrawOp, { op: "polygon" }> => op.op === "polygon",
      );
    };
    /** Each piece's fill and its right edge, left to right. */
    const pieces = (b: Board) =>
      draw(b)
        .map((op) => ({
          fill: op.fill,
          left: Math.min(...op.points.map(([x]) => x)),
          right: Math.max(...op.points.map(([x]) => x)),
        }))
        .sort((a, z) => a.right - z.right);
    const magnet = pieces(applyEdit(poling, board(), { set: [0, 1] }));
    const neutral = pieces(applyEdit(poling, board(), { set: [0, 2] }));
    expect([...magnet, ...neutral].map((m) => colors[m.fill])).toEqual([
      RED,
      INK,
      GREEN,
      GREEN,
    ]);
    // The + half reaches the line between the squares, where the − half
    // begins, so the two read as one tile.
    expect(magnet[0].right).toBe(magnet[1].left);
    expect(neutral[0].right).toBe(neutral[1].left);
    // An open half joins nothing: a given end alone stands in from its edge.
    const lone = pieces(board({ 0: 2 }));
    expect(lone[0].right).toBeLessThan(magnet[0].right);
  });

  it("says each press of a cycle in its verb's words", () => {
    expect(input.targetVerbs.primary.does).toBe(
      "put a + in it; again, put a − in it; and again, empty it",
    );
    expect(input.targetVerbs.secondary?.does).toBe(
      "make it neutral, or empty it if it is already filled",
    );
  });

  it("deals boards the ladder finishes, each domino a 1 and 3 or two 2s", () => {
    for (const seed of ["a", "b", "c"]) {
      const b = game.newState(p, game.newDesc(p, randomNew(seed)).desc);
      const g = solveBoard(poling, b, 0).values;
      for (const cells of b.dealt.tile.cells)
        if (cells.length === 2) expect(g[cells[0]] + g[cells[1]]).toBe(4);
        else expect(g[cells[0]]).toBe(2);
      // Solve's edit, every square at once, leaves the answer as it is.
      const solved = applyEdit(poling, b, {
        set: spaceOf(poling, b).cells.flatMap((c) => (b.fixed[c] ? [] : [c, g[c]])),
      });
      expect(Array.from(solved.values)).toEqual(Array.from(g));
    }
  });
});
