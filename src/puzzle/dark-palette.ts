/**
 * **A game's palette, adapted to a dark scheme** — one rule, used by the app
 * (`components/view.ts`) and by `scripts/checks/color-dark-check.test.ts`, so
 * there is no second copy to keep in step.
 */

import type { Color, PaletteScheme } from "../engine/types.ts";
import { colorToOKLCH, darkModeColor, type OKLCH } from "../utils/color.ts";

/**
 * Adapt `palette` (the light-mode palette the game produced, in OKLCH) to a dark
 * scheme sitting at background lightness `backgroundLightness`.
 *
 * An index gets its dark-mode color from the **authored** dark value of the
 * token the game used, which the engine reports per index in sRGB
 * (`authoredDark`) because a token's scheme values cannot cross the worker
 * boundary attached to the color; otherwise from calculation
 * (`darkModeColor`).
 *
 * The swaps run **last**, after every index has its value. They exist because
 * inverting lightness turns an emboss into an inset, so a game built on
 * `game_mkhighlight` exchanges each trio's highlight and lowlight to keep the
 * light coming from the same direction. That means an index does **not** denote
 * the same role in both schemes, which is worth knowing before comparing one
 * index's two values to each other.
 */
export function darkModePalette(
  palette: readonly OKLCH[],
  scheme: Pick<PaletteScheme, "darkSwaps">,
  authoredDark: Record<number, Color>,
  backgroundLightness: number,
): OKLCH[] {
  const out = palette.map(([l, c, h], i): OKLCH => {
    const authored = authoredDark[i];
    return authored
      ? colorToOKLCH(authored)
      : darkModeColor([l, c, h], backgroundLightness);
  });

  for (const [a, b] of scheme.darkSwaps) {
    [out[a], out[b]] = [out[b], out[a]];
  }
  return out;
}
