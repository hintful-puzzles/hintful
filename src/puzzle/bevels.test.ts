/**
 * The bevels each game draws, read off its own frames by shape: two polygons
 * drawn one after the other, with the same number of points, splitting one box
 * along its diagonal. Two triangles are the raised tile and two pentagons the
 * recessed frame. How a game named or made the colors does not matter, so a
 * game joins both guards below by drawing one.
 *
 * It reads the frames `sampleFrames` takes, so a bevel only input brings out is
 * not covered.
 */
import { describe, expect, it, vi } from "vitest";
import "../games/index.ts";
import * as draw from "../engine/draw.ts";
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

interface Bevel {
  /** Points in each half: 3 for the raised tile, 5 for the recessed frame. */
  points: number;
  /** The two fills, in the order drawn. */
  fills: [number, number];
}

/**
 * Every bevel on the frames: two polygons in a row that split one box along
 * its diagonal. Each holds both ends of the diagonal, one holds the top-left
 * corner and the other the bottom-right. Two shapes drawn one over the other
 * (Net's wire under its endpoint) hold the same corners and are not a bevel.
 */
function bevelsOn(frames: readonly (readonly DrawOp[])[]): Bevel[] {
  const found: Bevel[] = [];
  for (const ops of frames)
    for (let i = 0; i + 1 < ops.length; i++) {
      const [p, q] = [ops[i], ops[i + 1]];
      if (p.op !== "polygon" || q.op !== "polygon") continue;
      if (p.points.length !== q.points.length) continue;
      const [a, b] = [corners(p.points), corners(q.points)];
      if (a.box !== b.box) continue;
      const halves = [a.held, b.held].sort().join(" ");
      if (halves !== "0111 1110") continue;
      found.push({ points: p.points.length, fills: [p.fill, q.fill] });
    }
  return found;
}

/** The shared helpers that emit a bevel, by the number of points in each half
 * of what they emit. `drawRaisedTile` is listed beside the helper it calls
 * because a spy on an export sees only the calls made through an import. */
const HELPERS = {
  3: ["drawRaisedBevel", "drawRaisedTile"],
  5: ["drawRecessedBorder"],
} as const;

/**
 * Each game's bevels, and how many times it called each shared helper while
 * drawing them. The spies stand only while the frames are taken: vitest reads
 * an import at the call, so a spy on the module's own export sees every
 * game's calls.
 */
const GAMES = (() => {
  const spies = Object.values(HELPERS)
    .flat()
    .map((name) => ({ name, spy: vi.spyOn(draw, name) }));
  try {
    return puzzleIds.map((id) => {
      for (const { spy } of spies) spy.mockClear();
      const bevels = bevelsOn(sampleFrames(id).frames);
      const calls = new Map(
        spies.map(({ name, spy }) => [name, spy.mock.calls.length]),
      );
      return { id, bevels, calls };
    });
  } finally {
    for (const { spy } of spies) spy.mockRestore();
  }
})();

const DRAWING = GAMES.filter((g) => g.bevels.length > 0);

describe("the bevels on the frames", () => {
  it("finds the games that draw one", () => {
    const drawing = DRAWING.map((g) => g.id);
    expect(drawing.length).toBeGreaterThanOrEqual(8);
    // One through each shared helper, and the two games these guards were
    // written for.
    for (const id of ["fifteen", "samegame", "crossing", "pegs"])
      expect(drawing).toContain(id);
  });
});

describe("a bevel is drawn by the shared helper", () => {
  it("sees the helpers being called", () => {
    // A spy that stopped reaching the games would count no calls and fail
    // every game below, which is loud; this says why.
    for (const names of Object.values(HELPERS))
      expect(GAMES.some((g) => names.some((n) => (g.calls.get(n) ?? 0) > 0))).toBe(
        true,
      );
  });

  for (const { id, bevels, calls } of DRAWING) {
    it(`${id}: every bevel on its frames came from a helper call`, () => {
      for (const [points, names] of Object.entries(HELPERS)) {
        const drawn = bevels.filter((b) => b.points === Number(points)).length;
        const called = names.reduce((n, name) => n + (calls.get(name) ?? 0), 0);
        expect({ points, bevels: drawn }).toEqual({ points, bevels: called });
      }
    });
  }
});

describe("a bevel keeps its lit side across the schemes", () => {
  // Inverting lightness for the dark scheme turns an emboss into an inset
  // unless the bevel's two colors trade dark values. Pegs drew its board's
  // relief with two colors that did not, and was lit from the top-left in one
  // scheme and the bottom-right in the other, with nothing failing.
  for (const { id, bevels } of DRAWING) {
    it(`${id}: each bevel's lighter color is the lighter one in both schemes`, () => {
      const { light, dark } = schemePalettes(id);
      const L = (palette: typeof light, index: number) =>
        colorToOKLCH(palette[index])[0];
      const flipped = new Set(
        bevels
          .map((b) => b.fills)
          .filter(
            ([a, b]) =>
              Math.sign(L(light, a) - L(light, b)) !==
              Math.sign(L(dark, a) - L(dark, b)),
          )
          .map(([a, b]) => `${a}:${b}`),
      );
      expect([...flipped]).toEqual([]);
    });
  }
});
