/**
 * The hint's line hatch (`engine/hatch.ts`) has to be visible on the board it
 * is drawn over, in both schemes. A flat fill could not be made to work in both
 * (docs/games/hints.md § "Why a fill cannot work, whatever color it is"), so the
 * bands have a bar of their own, and it is measured on the colors the app
 * actually paints: each game's hatch color is read off a recorded hint frame,
 * not off a constant, and blended over its board the way the canvas blends it.
 */
import { describe, expect, it } from "vitest";
import { HATCH_OPACITY } from "../engine/hatch.ts";
import { Midend } from "../engine/index.ts";
import { registeredGameIds } from "../engine/registry.ts";
import { codeLinesMatching } from "../engine/testing/enrollment.ts";
import { gatePresets, HINT_GAMES } from "../engine/testing/hint-games.ts";
import { opsOfKind, RecordingDrawing } from "../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../engine/testing/render-scenario.ts";
import type { Color } from "../engine/types.ts";
import * as magnets from "../games/magnets/render.ts";
import { puzzleAugmentations } from "./augmentation.ts";
import { schemePalettes } from "./scheme-palettes.ts";

const relLum = (c: Color): number => {
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
};
const contrast = (a: Color, b: Color): number => {
  const [hi, lo] = [relLum(a), relLum(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};
/** What the canvas does with `globalAlpha`: a mix in the encoded values. */
const over = (under: Color, color: Color): Color =>
  [0, 1, 2].map((i) => under[i] * (1 - HATCH_OPACITY) + color[i] * HATCH_OPACITY) as [
    number,
    number,
    number,
  ];

/** The stripe has to show as a stripe against the board. The whole-cell wash
 * reads at 1.28 (`palette.test.ts`); a band is half the area but has an edge
 * every few pixels, and Magnets' board measured 1.40 light, 1.36 dark at 0.3. */
const VISIBLE = 1.25;

/** The first palette index a game hatches with, from its own hint frames. */
function hatchColor(id: string): number | null {
  const game = HINT_GAMES.find(([g]) => g === id)?.[1];
  if (!game) return null;
  const palette = game.colors(DEFAULT_BACKGROUND);
  for (const { title, params } of gatePresets(id, game)) {
    for (let s = 0; s < 4; s++) {
      const midend = new Midend(game);
      if (
        midend.newGameFromId(`${game.encodeParams(params, true)}#hatch-${title}-${s}`)
      )
        continue;
      midend.size({ w: 700, h: 700 });
      if (midend.hint()) continue;
      for (let step = 0; step < 24 && midend.activeHintStep(); step++) {
        const frame = new RecordingDrawing(palette);
        midend.redraw(frame);
        const [hatch] = opsOfKind(frame.ops, "hatch");
        if (hatch) return hatch.color;
        midend.executeHint();
      }
    }
  }
  return null;
}

describe("the hint's line hatch", () => {
  const hatching = [
    ...new Set(
      codeLinesMatching(registeredGameIds(), /\.drawHatch\(/).map(({ id }) => id),
    ),
  ];

  it("finds the games that draw it", () => {
    // A scan keyed on the call; Magnets is the known positive.
    expect(hatching).toContain("magnets");
  });

  it.each(hatching)("%s: shows against its board in both schemes", (id) => {
    const color = hatchColor(id);
    expect(color, `${id} calls drawHatch but no hint frame drew one`).not.toBeNull();
    if (color === null) return;
    const bgIndex = puzzleAugmentations[id]?.paletteBgIndex ?? 0;
    const { light, dark } = schemePalettes(id);
    for (const [scheme, palette] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      const board = palette[bgIndex];
      expect(
        contrast(over(board, palette[color]), board),
        `${id} in ${scheme}`,
      ).toBeGreaterThan(VISIBLE);
    }
  });
});

// Here rather than beside Magnets' render tests because the palettes the app
// paints are built in this layer, which no game may import.
describe("Magnets under the hatch", () => {
  it("keeps every symbol legible on a hatched square, in both schemes", () => {
    // Each domino fill, with the symbol drawn on it. The `?` on an empty domino
    // is the weakest to begin with (1.97 light, 1.80 dark).
    const pairs = [
      [magnets.COL_LOWLIGHT, magnets.COL_NOT],
      [magnets.COL_POSITIVE, magnets.COL_BACKGROUND],
      [magnets.COL_NEGATIVE, magnets.COL_BACKGROUND],
      [magnets.COL_NEUTRAL, magnets.COL_BACKGROUND],
    ];
    const { light, dark } = schemePalettes("magnets");
    for (const [scheme, palette] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      for (const [fill, symbol] of pairs) {
        const under = palette[fill];
        const before = contrast(palette[symbol], under);
        // A stripe may cost a symbol a quarter of its contrast, or anything
        // that still leaves it at 4.5:1.
        expect(
          contrast(palette[symbol], over(under, palette[magnets.COL_HINT])),
          `symbol ${symbol} on fill ${fill} in ${scheme}`,
        ).toBeGreaterThanOrEqual(Math.min(before * 0.75, 4.5));
      }
    }
  });
});
