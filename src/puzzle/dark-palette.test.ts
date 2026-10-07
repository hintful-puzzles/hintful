/**
 * The dark-scheme pass, and in particular the **swaps** a game declares
 * (`Game.paletteScheme.darkSwaps`).
 *
 * A swap exists because inverting lightness turns an emboss into an inset: a
 * game built on `game_mkhighlight` draws each surface with a lighter band on the
 * side the light comes from and a darker one opposite, and if every color's
 * lightness inverts, so does the direction of the light. Exchanging each trio's
 * highlight and lowlight puts it back.
 *
 * That is a claim about *roles*, and it is the claim these tests make: whatever
 * the pipeline does to the numbers, a bevel highlight has to stay lighter than
 * the surface it sits on and a lowlight darker, **in both schemes**. A bevel
 * whose swap is missing, or a swap naming two colors that are not a bevel,
 * leaves every color in the palette and one game's blocks lit from the wrong
 * side in dark mode only.
 */
import { describe, expect, it } from "vitest";
import {
  mkhighlightBackground,
  resolvePalette,
} from "../engine/color/color-mkhighlight.ts";
import { darkValue } from "../engine/color/color-token.ts";
import {
  cellSurface,
  givenSurface,
  highlightWash,
  lineNoColor,
  playerEntryColor,
  REGION_DONE,
} from "../engine/color/palette.ts";
import { getTsGame, registeredGameIds } from "../engine/registry.ts";
import type { Color, PuzzleId } from "../engine/types.ts";
import {
  colorToOKLCH,
  darkModeColor,
  type OKLCH,
  oklchToColor,
} from "../utils/color.ts";
import { darkModePalette } from "./dark-palette.ts";
import { schemeOf } from "./scheme-palettes.ts";
import "../games/index.ts";

/** The lightness a dark-mode board background sits at, per `utils/color.ts`. */
const DARK_BG_L = 0.2;
/** What `components/view.ts` hands the engine in dark mode, and why: games derive
 * colors by scaling the background down, so the palette is generated light and
 * inverted afterwards. (`resolvePalette` shifts it off pure white before the
 * game sees it, exactly as the midend does.) */
const DARK_INPUT = oklchToColor([1, 0, 0]);

function schemes(id: PuzzleId): { light: OKLCH[]; dark: OKLCH[] } {
  const game = getTsGame(id);
  if (!game) throw new Error(`${id} is not registered`);
  const rgb = resolvePalette(game, DARK_INPUT);
  const light = rgb.map(colorToOKLCH);
  const authored: Record<number, Color> = {};
  rgb.forEach((c, i) => {
    const d = c && darkValue(c);
    if (d) authored[i] = [...d];
  });
  return { light, dark: darkModePalette(light, schemeOf(id), authored, DARK_BG_L) };
}

/** Every declared swap in the collection, with its game. */
const PAIRS: [PuzzleId, number, number][] = registeredGameIds().flatMap((id) =>
  schemeOf(id).darkSwaps.map(([a, b]): [PuzzleId, number, number] => [id, a, b]),
);

describe("dark-mode palette swaps", () => {
  it("finds the swap pairs it means to check", () => {
    // The "how many things did I look at?" guard. Without it a refactor that
    // stopped finding any pair would leave every test below vacuously green.
    // Only a game whose tiles the player moves keeps a bevel, so the pairs
    // are few.
    expect(PAIRS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(PAIRS.map(([id]) => id)).size).toBeGreaterThanOrEqual(3);
  });

  it.each(PAIRS)("%s swaps two real, different colors (%i, %i)", (id, a, b) => {
    // What can be checked without knowing a game's palette LAYOUT. An index past
    // the end of the palette leaves `undefined` in it, which reaches the canvas
    // as a color it silently refuses; a pair naming two equal lightnesses is a
    // swap that does nothing, which means the emboss it was written to fix is
    // still inverted.
    const { light } = schemes(id);
    expect(light[a], `${id}[${a}] is in the palette`).toBeDefined();
    expect(light[b], `${id}[${b}] is in the palette`).toBeDefined();
    expect(Math.abs(light[a][0] - light[b][0])).toBeGreaterThan(0.01);
  });

  it("swaps each index at most once", () => {
    // Two pairs sharing an index apply in list order and the second undoes part
    // of the first, which is never what is meant.
    for (const id of new Set(PAIRS.map(([g]) => g))) {
      const used = PAIRS.filter(([g]) => g === id).flatMap(([, a, b]) => [a, b]);
      expect(new Set(used).size, `${id} names an index twice`).toBe(used.length);
    }
  });

  it("actually exchanges the pair", () => {
    // The mechanism itself, stated once: without it the assertions in the next
    // describe would be testing the calculation and not the swap.
    const [id, a, b] = PAIRS[0];
    const { light } = schemes(id);
    const withSwap = darkModePalette(light, { darkSwaps: [[a, b]] }, {}, DARK_BG_L);
    const without = darkModePalette(light, { darkSwaps: [] }, {}, DARK_BG_L);
    expect(withSwap[a]).toEqual(without[b]);
    expect(withSwap[b]).toEqual(without[a]);
  });

  it.each(PAIRS)("%s keeps %i and %i in one order in both schemes", (id, a, b) => {
    // What a swap is for, whatever the two colors are: the lighter of the pair
    // in the light scheme is the lighter of it in the dark one.
    const { light, dark } = schemes(id);
    expect(Math.sign(dark[a][0] - dark[b][0])).toBe(
      Math.sign(light[a][0] - light[b][0]),
    );
  });
});

describe("the ruled-out edge", () => {
  it("is discernible, and apart from a finished region, in both schemes", () => {
    // The owner's playtest: on a dark board the ruled-out edge could not be
    // told from no edge, which a keyboard player walking the edges needs most.
    // "Disabled" still has to be seen. Measured in OKLCH lightness against the
    // board every game paints (the host shifted off white) in each scheme,
    // through the same adaptation the app applies. Lives here rather than in
    // the engine's palette test because the dark half needs `utils/color.ts`,
    // which the engine may not import.
    const L = (c: Color) => colorToOKLCH(c)[0];
    const dark = (c: Color) =>
      darkValue(c) ?? oklchToColor(darkModeColor(colorToOKLCH(c), DARK_BG_L));
    for (const host of [[0.827, 0.827, 0.827] as Color, DARK_INPUT]) {
      const board = mkhighlightBackground(host);
      const ruledOut = lineNoColor(board);
      const finished = REGION_DONE;
      // Light: a clear step below the board, well above ink.
      expect(L(board) - L(ruledOut)).toBeGreaterThan(0.2);
      expect(L(ruledOut)).toBeGreaterThan(0.4);
      expect(Math.abs(L(ruledOut) - L(finished))).toBeGreaterThan(0.08);
      // Dark: the value the playtest rejected sat 0.08 above the board; this
      // one sits at least twice that, and stays below ink (L 1).
      const darkBoard = L(dark(board));
      expect(L(dark(ruledOut)) - darkBoard).toBeGreaterThan(0.16);
      expect(L(dark(ruledOut))).toBeLessThan(0.85);
      expect(Math.abs(L(dark(ruledOut)) - L(dark(finished)))).toBeGreaterThan(0.08);
    }
  });
});

describe("a finished region", () => {
  it("is a hue on the board, told from every other cell, in both schemes", () => {
    // What the role is for: a finished board is colored by the player's work.
    // A step of gray fails this whichever way it steps: below the cell it is a
    // hole in the dark board, and above it is a given's lifted cell. So the
    // region is told by hue, and the distances are taken in OKLab, where a
    // chroma counts as a lightness step does.
    const dark = (c: Color) =>
      darkValue(c) ?? oklchToColor(darkModeColor(colorToOKLCH(c), DARK_BG_L));
    const lab = (c: Color) => {
      const [l, chroma, h] = colorToOKLCH(c);
      const rad = (h * Math.PI) / 180;
      return [l, chroma * Math.cos(rad), chroma * Math.sin(rad)];
    };
    const apart = (a: Color, b: Color) =>
      Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
    const board = mkhighlightBackground(DARK_INPUT);
    for (const scheme of [(c: Color) => c, dark]) {
      const finished = scheme(REGION_DONE);
      const [l, chroma] = colorToOKLCH(finished);
      expect(chroma).toBeGreaterThan(0.05);
      // Not a hole: no darker than the cells round it.
      const cell = scheme(cellSurface(board));
      if (scheme === dark) expect(l).toBeGreaterThan(colorToOKLCH(cell)[0]);
      // An unfinished cell, a given, and the selected cell Filling paints
      // beside a finished region.
      for (const other of [
        cell,
        scheme(givenSurface(board)),
        scheme(highlightWash(board)),
      ]) {
        expect(apart(finished, other)).toBeGreaterThan(0.06);
      }
      // The player's digit is drawn on it.
      const entry = colorToOKLCH(scheme(playerEntryColor(board)))[0];
      expect(Math.abs(entry - l)).toBeGreaterThan(0.15);
    }
  });
});

describe("slide's board", () => {
  /**
   * Slide's palette is `base, highlight, lowlight` per material, five materials
   * deep, and its layout is stated in `slide/render.ts`. That is what makes the
   * bevel assertion below possible here and not in the collection-wide block
   * above: **the invariant is about roles, and an index only names a role once
   * you know the layout.** The other games with swaps state no layout, so they
   * get only the collection-wide checks.
   */
  const TRIOS = [
    ["floor", 0],
    ["dragged block", 3],
    ["key block", 6],
    ["dragged key block", 9],
    ["wall", 15],
    ["ordinary block", 18],
  ] as const;

  it.each(
    TRIOS,
  )("lights the %s's bevel from one side in both schemes", (_what, base) => {
    const { light, dark } = schemes("slide");
    for (const [scheme, palette] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      const [b, h, l] = [palette[base][0], palette[base + 1][0], palette[base + 2][0]];
      expect(h, `${scheme}: highlight above base`).toBeGreaterThan(b);
      expect(l, `${scheme}: lowlight below base`).toBeLessThan(b);
    }
  });

  it("keeps the four materials' ladder in both schemes", () => {
    // The floor, an ordinary block and the wall are three steps apart, and the
    // exit stays the most prominent thing on the board. In a dark scheme every
    // step reverses — that IS the rule preserving the relationship, not a
    // violation of it — so the assertion is on the *ordering*, in each scheme's
    // own direction.
    const { light, dark } = schemes("slide");
    const [FLOOR, MAIN, TARGET, WALL, BLOCK] = [0, 6, 12, 15, 18];

    // Light: exit palest, then floor, then block, then wall.
    for (const [a, b] of [
      [TARGET, FLOOR],
      [FLOOR, BLOCK],
      [BLOCK, WALL],
    ] as const) {
      expect(light[a][0], `light ${a} vs ${b}`).toBeGreaterThan(light[b][0] + 0.04);
    }
    // Dark: the same ladder, upside down.
    for (const [a, b] of [
      [TARGET, FLOOR],
      [FLOOR, BLOCK],
      [BLOCK, WALL],
    ] as const) {
      expect(dark[a][0], `dark ${a} vs ${b}`).toBeLessThan(dark[b][0] - 0.04);
    }

    // And the key block carries hue where the two neutrals do not, which is what
    // keeps it findable at a glance whichever end of the ladder it sits at.
    expect(light[MAIN][1]).toBeGreaterThan(0.05);
    expect(dark[MAIN][1]).toBeGreaterThan(0.05);
    expect(light[WALL][1]).toBeLessThan(0.01);
    expect(light[BLOCK][1]).toBeLessThan(0.01);
  });
});
