/**
 * Whether a board hidden from is one of the asked tier: the last phase of a
 * draw below a search tier.
 */

import type { Caps } from "../../solve/ladder-runtime.ts";
import { type Clues, capsOf } from "../board.ts";
import type { DealContext } from "./context.ts";
import { hidesAny } from "./keeping.ts";

/** What a board is refused for, by the census's stage; `null` where it is
 * kept. Each check in turn, the cheapest refusal first. */
export function refusalOf<C extends Clues<C>>(
  cx: DealContext<C>,
): (clues: C) => string | null {
  const { module, deal, p, sp, variations, finishes } = cx;
  /** For each other scale this board's ladder runs an entry of, the caps of
   * the asked tier with that scale a tier under its top: a board is held to
   * need the top of each, as it is held to need the asked tier. */
  const belowTops: readonly Caps[] = Object.entries(module.scales ?? {})
    .filter(
      ([scale, tiers]) =>
        tiers.length > 1 &&
        module.ladder.some(
          (e) =>
            e.scale === scale &&
            (e.variation === undefined || variations.includes(e.variation)),
        ),
    )
    .map(([scale, tiers]) => ({
      ...capsOf(module, p.diff),
      [scale]: tiers.length - 2,
    }));
  return (clues) => {
    if (!finishes(clues, p.diff))
      return "fill: the tier stops short with the clues left";
    if (p.diff > 0 && finishes(clues, p.diff - 1))
      return "fill: the tier below finishes the board";
    // Upstream's solo.c merges Killer cages until the grade is
    // `DIFF_KINTERSECT` on the killer scale as well as the asked tier.
    if (belowTops.some((caps) => finishes(clues, caps)))
      return "fill: another scale's tier below its top finishes the board";
    // A board the hide flag asked to hide a kind hides one of it (upstream
    // boats.c refused a stripped board that showed every number).
    if (deal.hideFlag !== undefined && p.hides === true && !hidesAny(clues, deal, sp))
      return "fill: the board hides none of the flag's kind";
    return null;
  };
}
