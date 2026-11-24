/** Tier letters older IDs write, read and never written. */

import type { ParamsSegment } from "../../game-id/params-codec.ts";
import type { FillDeal, FillParams } from "../game-id.ts";

/** A retired tier letter, read after `d` as the tier it stands for and never
 * written (Bricks' `t`, upstream's Tricky, whose boards are Unreasonable). */
export function tierAliasSegment(
  aliases: NonNullable<FillDeal["tierAliases"]>,
): ParamsSegment<FillParams> {
  return {
    encode: () => "",
    decode: (s, i, p) => {
      const tier = s[i] === "d" ? aliases[s[i + 1] ?? ""] : undefined;
      if (tier === undefined) return i;
      p.diff = tier;
      return i + 2;
    },
  };
}

/** A bare letter older IDs write for a tier, before the tier's own `d`: read
 * as that tier, and never written. */
export function tierFlagSegment(
  flag: NonNullable<FillDeal["tierFlag"]>,
): ParamsSegment<FillParams> {
  return {
    encode: () => "",
    decode: (s, i, p) => {
      if (s[i] !== flag.letter) return i;
      p.diff = flag.tier;
      return i + 1;
    },
  };
}
