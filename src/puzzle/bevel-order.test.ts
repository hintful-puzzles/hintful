/**
 * A bevel is lit from the same side in both schemes.
 *
 * Inverting lightness for the dark scheme turns an emboss into an inset unless
 * the bevel's two colors trade dark values. Pegs drew its board's relief with
 * two colors that did not, and was lit from the top-left in one scheme and the
 * bottom-right in the other, with nothing failing.
 *
 * The bevels are read off each game's own frames, by shape: two polygons drawn
 * one after the other, with the same number of points, sharing an edge, in two
 * different colors. That is what `drawRaisedBevel` and `drawRecessedBorder`
 * emit, and what a game drawing its own two-triangle bevel emits too. So a game
 * joins by drawing one, and how it made the colors does not matter.
 *
 * It reads the frames `sampleFrames` takes, so a bevel only input brings out is
 * not covered.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import type { DrawOp } from "../engine/testing/recording-drawing.ts";
import { colorToOKLCH } from "../utils/color.ts";
import { puzzleIds } from "./catalog.ts";
import { sampleFrames } from "./neighbor-contrast.ts";
import { schemePalettes } from "./scheme-palettes.ts";

type Points = ReadonlyArray<readonly [number, number]>;

/** Which corners of the box around `points` are among them, as a string of
 * `1`s and `0`s in the order top-left, top-right, bottom-left, bottom-right,
 * after the box itself. */
function corners(points: Points): { box: string; held: string } {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const [l, r, t, b] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const held = [
    [l, t],
    [r, t],
    [l, b],
    [r, b],
  ].map(([cx, cy]) => (points.some(([x, y]) => x === cx && y === cy) ? "1" : "0"));
  return { box: `${l},${t},${r},${b}`, held: held.join("") };
}

/**
 * Every `first:second` pair of colors the frames draw as a bevel: two polygons
 * in a row that split one box along its diagonal. Each holds both ends of the
 * diagonal, one holds the top-left corner and the other the bottom-right. Two
 * shapes drawn one over the other (Net's wire under its endpoint) hold the
 * same corners and are not a bevel.
 */
function bevelPairs(frames: readonly (readonly DrawOp[])[]): [number, number][] {
  const seen = new Map<string, [number, number]>();
  for (const ops of frames)
    for (let i = 0; i + 1 < ops.length; i++) {
      const [p, q] = [ops[i], ops[i + 1]];
      if (p.op !== "polygon" || q.op !== "polygon") continue;
      if (p.fill === q.fill || p.points.length !== q.points.length) continue;
      const [a, b] = [corners(p.points), corners(q.points)];
      if (a.box !== b.box) continue;
      const halves = [a.held, b.held].sort().join(" ");
      if (halves !== "0111 1110") continue;
      seen.set(`${p.fill}:${q.fill}`, [p.fill, q.fill]);
    }
  return [...seen.values()];
}

const BEVELS = puzzleIds.map((id) => ({
  id,
  pairs: bevelPairs(sampleFrames(id).frames),
}));

describe("a bevel keeps its lit side across the schemes", () => {
  it("finds the games that draw one", () => {
    const drawing = BEVELS.filter((g) => g.pairs.length > 0).map((g) => g.id);
    expect(drawing.length).toBeGreaterThanOrEqual(8);
    // One through each shared helper, one drawing its own, and the game this
    // guard was written for.
    for (const id of ["fifteen", "samegame", "crossing", "pegs"])
      expect(drawing).toContain(id);
  });

  for (const { id, pairs } of BEVELS.filter((g) => g.pairs.length > 0)) {
    it(`${id}: each bevel's lighter color is the lighter one in both schemes`, () => {
      const { light, dark } = schemePalettes(id);
      const L = (palette: typeof light, index: number) =>
        colorToOKLCH(palette[index])[0];
      const flipped = pairs
        .filter(
          ([a, b]) =>
            Math.sign(L(light, a) - L(light, b)) !== Math.sign(L(dark, a) - L(dark, b)),
        )
        .map(([a, b]) => `${a}:${b}`);
      expect(flipped).toEqual([]);
    });
  }
});
