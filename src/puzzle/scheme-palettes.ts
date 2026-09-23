/**
 * A game's palette as the app paints it in each scheme, in sRGB: the pipeline
 * of `components/view.ts` on a gray host background (so without the host-hue
 * tint), for a test that measures what a player sees rather than what a token
 * table says.
 *
 * Dev/test-only; never imported by production code.
 */

import { resolvePalette } from "../engine/color/color-mkhighlight.ts";
import { darkValue } from "../engine/color/color-token.ts";
import { getTsGame } from "../engine/registry.ts";
import type { Color } from "../engine/types.ts";
import { colorToOKLCH, oklchToColor } from "../utils/color.ts";
import { puzzleAugmentations } from "./augmentation.ts";
import { darkModePalette } from "./dark-palette.ts";

/** The lightness of the light scheme's board background. */
const LIGHT_BG_L = 0.9;
/** The lightness a dark-scheme board background sits at, per `utils/color.ts`. */
const DARK_BG_L = 0.2;

export function schemePalettes(id: string): { light: Color[]; dark: Color[] } {
  const game = getTsGame(id);
  if (!game) throw new Error(`${id} is not registered`);
  const light = resolvePalette(game, oklchToColor([LIGHT_BG_L, 0, 0]));
  // Dark mode generates from white and inverts afterwards (`components/view.ts`).
  const fromWhite = resolvePalette(game, oklchToColor([1, 0, 0]));
  const authored: Record<number, Color> = {};
  fromWhite.forEach((c, i) => {
    const d = c && darkValue(c);
    if (d) authored[i] = [...d] as Color;
  });
  const dark = darkModePalette(
    fromWhite.map(colorToOKLCH),
    puzzleAugmentations[id]?.darkMode,
    authored,
    DARK_BG_L,
  ).map(oklchToColor);
  return { light, dark };
}
