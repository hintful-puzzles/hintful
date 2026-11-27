/**
 * An alphabet (`letters`, a string), on the `lettering` fixture, a Latin
 * square whose ruleset chooses the alphabet and is written after the tier
 * by its code alone: value 1 drawn as the alphabet's first letter, typed by
 * it in either case or by its place from A as a digit, and the lines'
 * labels drawn as their values' letters (`play.labels.glyph`). Its tiers
 * are bounded by ruleset and size, `i` taking no Easy at any size (a
 * choice's `tiers`), and its menu skips a tier on a board
 * (`play.boardSkips`).
 */

import { describe, expect, it } from "vitest";
import * as lettering from "../../generated/engine/testing/fixtures/lettering/lettering.compiled.ts";
import { presetMenu } from "../game-id/param-label.ts";
import { paramsError } from "../game-id/params.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import { numberInput } from "./numbers.ts";
import { newFillUi } from "./play.ts";
import { fillRender } from "./render.ts";

type Board = FillBoard<lettering.Dealt>;

const game = fillGame("lettering", lettering);
const TS = 32;
const input = numberInput<lettering.Dealt, { tileSize: number }>(lettering, () => 0);

function dealt(id: string): Board {
  const p = game.decodeParams(id);
  return game.newState(p, game.newDesc(p, randomNew(`lettering-${id}`)).desc);
}

/** The value key `key` types into an open square of `b`, or `null`. */
function typed(b: Board, key: string): number | null {
  const open = [...b.fixed].indexOf(0);
  const ui = game.newUi(b);
  Object.assign(ui.cursor, { x: open % b.w, y: Math.floor(open / b.w), visible: true });
  const move = input.interpretMove(
    b,
    ui,
    { tileSize: TS },
    { x: 0, y: 0 },
    key.charCodeAt(0),
  );
  return move !== null && typeof move === "object" && "n" in move ? move.n : null;
}

/** The texts board `b` draws. */
function texts(b: Board): string[] {
  const render = fillRender(
    lettering,
    {
      play: lettering.play,
      lineClues: lettering.lineClues,
      labels: lettering.labels,
    },
    (s) => s,
  );
  const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
  render.redraw(dr, render.newDrawState(b, TS), {
    state: b,
    prev: null,
    dir: 1,
    ui: newFillUi(),
    animTime: 0,
    flash: NO_FLASH,
  });
  return dr.ops.flatMap((o: DrawOp) => (o.op === "text" ? [o.text] : []));
}

describe("an alphabet", () => {
  it("writes the ruleset after the tier by its code alone, nothing at the default", () => {
    expect(game.encodeParams(game.decodeParams("4"), true)).toBe("4de");
    expect(game.encodeParams(game.decodeParams("4dei"), true)).toBe("4dei");
    expect(game.encodeParams(game.decodeParams("4i"), false)).toBe("4i");
  });

  it("offers the keys of the ruleset's alphabet, in the values' order", () => {
    const keys = (id: string) =>
      game.requestKeys?.(game.decodeParams(id)).map((k) => k.label);
    expect(keys("4")).toEqual(["e", "a", "b", "c", "Clear"]);
    expect(keys("4i")).toEqual(["a", "b", "c", "d", "Clear"]);
  });

  it("types a value by its letter in either case, or by the letter's place from A", () => {
    const first = dealt("4");
    expect(["e", "E", "5"].map((k) => typed(first, k))).toEqual([1, 1, 1]);
    expect(["a", "1"].map((k) => typed(first, k))).toEqual([2, 2]);
    // A letter the alphabet holds past the board's values types nothing.
    expect(typed(first, "f")).toBeNull();
    const plain = dealt("4i");
    expect(["a", "A", "1"].map((k) => typed(plain, k))).toEqual([1, 1, 1]);
    expect(typed(plain, "e")).toBeNull();
  });

  it("bounds a tier by ruleset and size, and leaves a ruleset only its tiers", () => {
    const refusal = (id: string, full = true) =>
      paramsError(game, game.decodeParams(id), full);
    expect(refusal("4dn")).toBe("No 4x4 E first puzzle is Normal.");
    expect(refusal("5dn")).toBeNull();
    expect(refusal("9dei")).toBe("Difficulty must be Normal or Hard for In order.");
    expect(refusal("4dni")).toBeNull();
    expect(refusal("3dni")).toBe("In order: the grid size must be at least 4.");
    // A brief ID names no tier, so its ruleset's tiers do not hold it.
    expect(refusal("4i", false)).toBeNull();
  });

  it("offers each ruleset its section, a board's skipped tier left out", () => {
    const sections = (presetMenu(game).submenu ?? []).map((s) => [
      s.title,
      (s.submenu ?? []).map((m) =>
        m.params === undefined ? "" : game.encodeParams(m.params, true),
      ),
    ]);
    expect(sections).toEqual([
      ["E first", ["4de", "5de", "5dh"]],
      ["In order", ["4dni"]],
    ]);
  });

  it("draws the values and the lines' labels as the alphabet's letters", () => {
    for (const [id, letters] of [
      ["4", ["e", "a", "b", "c"]],
      ["4i", ["a", "b", "c", "d"]],
    ] as const) {
      const drawn = texts(dealt(id));
      // Each line's label, a row's and a column's, then the givens.
      for (const l of letters)
        expect(
          drawn.filter((t) => t === l).length,
          `${id} ${l}`,
        ).toBeGreaterThanOrEqual(2);
      expect(
        drawn.every((t) => letters.includes(t as never)),
        id,
      ).toBe(true);
    }
  });
});
