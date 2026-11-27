/**
 * What a board's hide hides, as the deal and the params say: the kinds, the
 * symmetry its hiding keeps, and the kinds it hides whole. Every runner of
 * the deal reads them, and so does a build that lays its `first` cells.
 */

import type { Symmetry } from "../../generate/symmetry.ts";
import type { Clues } from "../board.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { within } from "../params/bounds.ts";
import { isOn, settingOf, symmetricOf } from "../params/settings.ts";

export interface HideSettings<C> {
  /** The kinds hidden, in the deal's order. */
  readonly kinds: readonly string[];
  /** The first of them, the one a symmetric hide hides. */
  readonly kind: keyof C | null;
  readonly symmetry: Symmetry;
  /** The hidden kinds this board hides whole (their `whole`). */
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
    const h = deal.hide?.find((x) => x.kind === k)?.whole;
    return (
      h !== undefined &&
      p.diff < h.below &&
      (h.with === undefined || variations.includes(h.with)) &&
      (h.ruleset === undefined ||
        settingOf(deal, p, h.ruleset.setting) === h.ruleset.choice) &&
      within(h.bounds, p)
    );
  });
  return { kinds, kind, symmetry, whole };
}

/** The kinds the deal hides on a board of `p` (`deal.hide`), but one kept
 * whole below its tier (`from`) or under a flag `p` has off (`when`). */
export const hiddenKinds = (deal: FillDeal, p: FillParams): readonly string[] =>
  (deal.hide ?? [])
    .filter(
      (h) => p.diff >= (h.from ?? 0) && (h.when === undefined || isOn(deal, p, h.when)),
    )
    .map((h) => h.kind);
