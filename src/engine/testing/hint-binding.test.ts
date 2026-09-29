import { describe, expect, it } from "vitest";
import type { GameDrawing, HintStep } from "../game.ts";
import { CELL, mark, phrase, stepMarks } from "../hint-words.ts";
import type { Point } from "../types.ts";
import type { AnyGame } from "./enrollment.ts";
import { bindingDefects } from "./hint-binding.ts";

/** Points a renderer may paint beside the words' marks: the defect of a
 * renderer that still reads a highlight field. */
interface H {
  extra: Point[];
}

/** A two-cell board whose renderer paints a ring and an outline per named cell,
 * and optionally drops the outlines or paints `extra` from the highlights. */
function toyGame(opts: { dropOutlines?: boolean; roles?: object } = {}): AnyGame {
  const cell = (dr: GameDrawing, p: Point, color: number) =>
    dr.drawRect({ x: p.x * 10, y: p.y * 10, w: 10, h: 10 }, color);
  return {
    colors: () => [
      [1, 1, 1],
      [0, 0, 1],
      [0, 1, 1],
    ],
    newDrawState: () => ({}),
    redraw(
      dr: GameDrawing,
      _ds: unknown,
      _prev: unknown,
      _s: unknown,
      _dir: number,
      _ui: unknown,
      _anim: number,
      _flash: number,
      hint?: HintStep<null, H>,
    ) {
      dr.drawRect({ x: 0, y: 0, w: 20, h: 10 }, 0);
      const marks = stepMarks(hint);
      for (const p of marks.of("ring", CELL)) cell(dr, p, 1);
      if (!opts.dropOutlines) for (const p of marks.of("outline", CELL)) cell(dr, p, 2);
      for (const p of hint?.highlights?.extra ?? []) cell(dr, p, 1);
    },
    hintMarks: {
      roles: opts.roles ?? {
        ring: "the cell decided",
        outline: "the cells reasoned from",
      },
    },
  } as unknown as AnyGame;
}

const a = { x: 0, y: 0 };
const b = { x: 1, y: 0 };

function step(
  words: ReturnType<typeof phrase>,
  extra: Point[] = [],
  explanation = words.text,
) {
  return { move: null, explanation, words, highlights: { extra } } as HintStep<unknown>;
}

describe("bindingDefects", () => {
  const words = phrase`${mark.the("outline", CELL, [b], "cell").capitalized()} rules out 2, so ${mark.this("ring", CELL, [a], "cell")} must be 1.`;
  const check = (game: AnyGame, s: HintStep<unknown>) =>
    bindingDefects(game, null, null, s);

  it("passes a step whose words name exactly what it draws", () => {
    expect(check(toyGame(), step(words))).toEqual([]);
  });

  it("finds a mark the words name and the frame does not show", () => {
    expect(check(toyGame({ dropOutlines: true }), step(words))).toEqual([
      "names outline|cell|1,0, which is not drawn",
    ]);
  });

  it("finds a mark the frame shows and no word names", () => {
    expect(check(toyGame(), step(words, [b]))).toEqual([
      "draws a mark no word names (the frame without its references is not the unhinted one)",
    ]);
  });

  it("finds an explanation that is not its words", () => {
    expect(check(toyGame(), step(words, [], "Something else."))[0]).toMatch(
      /is not its words/,
    );
  });

  it("finds a role the legend does not list", () => {
    expect(check(toyGame({ roles: { ring: "the cell" } }), step(words))).toEqual([
      "names the outline role, which the legend does not list",
    ]);
  });

  it("finds a step with no words", () => {
    const s = { move: null, explanation: "x" } as HintStep<unknown>;
    expect(check(toyGame(), s)).toEqual(["the step has no words"]);
  });
});
