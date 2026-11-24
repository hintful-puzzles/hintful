/**
 * What a board's hide hides, as the deal and the params say: the kinds, the
 * symmetry its hiding keeps, and the kinds it hides whole. Every runner of
 * the deal reads them, and so does a build that lays its `first` cells.
 */

import type { Symmetry } from "../../generate/symmetry.ts";
import type { Clues } from "../board.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { within } from "../params/bounds.ts";
import { symmetricOf } from "../params/options.ts";

export interface HideSettings<C> {
  /** The kinds hidden, in the deal's order. */
  readonly kinds: readonly string[];
  /** The first of them, the one a symmetric hide hides. */
  readonly kind: keyof C | null;
  readonly symmetry: Symmetry;
  /** The hidden kinds this board hides whole (`deal.hideWhole`). */
  readonly whole: readonly string[];
}

export function hideSettingsOf<C extends Clues<C>>(
  deal: FillDeal,
  p: FillParams,
  variations: readonly string[],
): HideSettings<C> {
  const kinds = hiddenKinds(deal, p);
  const kind = (kinds.length === 0 ? null : kinds[0]) as keyof C | null;
  const symmetry = symmetricOf(deal, p);
  if (kinds.length > 1 && symmetry !== "none")
    throw new Error("deal: a symmetric hide is of one kind");
  const whole = kinds.filter((k) => {
    const h = deal.hideWhole?.[k];
    return (
      h !== undefined &&
      p.diff < h.below &&
      (h.with === undefined || variations.includes(h.with)) &&
      within(h.bounds, p)
    );
  });
  return { kinds, kind, symmetry, whole };
}

/** The kinds the deal hides on a board of `p` (`deal.hide`), but one kept
 * whole below its tier (`deal.hideFrom`): the hide flag's too where `p` has
 * it on. */
export const hiddenKinds = (deal: FillDeal, p: FillParams): readonly string[] => {
  const kinds = (
    deal.hide === undefined
      ? []
      : typeof deal.hide === "string"
        ? [deal.hide]
        : deal.hide
  ).filter((k) => p.diff >= (deal.hideFrom?.[k] ?? 0));
  return deal.hideFlag !== undefined && p.hides === true
    ? [...kinds, deal.hideFlag.kind]
    : kinds;
};
