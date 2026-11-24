/**
 * A fill game's deal: draw an answer, check it is one, derive its clues,
 * hide what `deal.hide` says may go, and keep the board the ladder finishes
 * at the asked tier and not at the tier below; or, at a search tier, the
 * board with one answer that the search proves and the ladder does not
 * reach. Its desc is the clues, and its `aux` the answer
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 7).
 *
 * This is the runner; each phase is a module of `deal/`. A draw runs them
 * in the order the deal's rng draws in, which a seed's board depends on:
 * the sampler (`samplers.ts`), the partition (`partition.ts`), the derive's
 * `pick`, the clue steps (`clue-steps.ts`), then the hide (`hide.ts`).
 */

import { drawRejected } from "../contract/deal-census.ts";
import { retryLimit } from "../contract/retry-limit.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import type { ClueList } from "../solve/describe-runtime.ts";
import { encodeAnswer } from "./answer.ts";
import { type Clues, spaceOf } from "./board.ts";
import { refusalOf } from "./deal/accept.ts";
import { climbBuild } from "./deal/build.ts";
import { climbFill } from "./deal/climb.ts";
import { CLUE_STEPS } from "./deal/clue-steps.ts";
import { type DealtFillModule, dealContext, type Grown } from "./deal/context.ts";
import { hideOf } from "./deal/hide.ts";
import { shownOf } from "./deal/keeping.ts";
import { grownRound } from "./deal/partition.ts";
import { drawSample } from "./deal/samplers.ts";
import { type Draw, dealEveryClue, dealStripped } from "./deal/search-tier.ts";
import { encodeDesc } from "./desc.ts";
import type { FillDeal, FillParams } from "./game-id.ts";
import { searches } from "./search.ts";

export function dealFill<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
): { desc: string; aux: string } {
  const { sample } = deal;
  if (sample === null) throw new Error("deal: the description samples no answer");
  if ("scatter" in sample && sample.climb === true)
    return climbFill(module, deal, sample, p, rs);
  const cx = dealContext(module, deal, p, rs);
  const { sp, sizes, variations, given } = cx;
  const { kind, symmetry } = cx.hide;
  const hide = hideOf(cx);
  /** Answer `g`'s clues on the partitions `grown`, every one shown but those
   * of a kind hidden whole; `null` where they are no board. */
  const dealt = (
    g: Uint8Array,
    grown: Grown,
    tier: number,
  ): { g: Uint8Array; clues: C } | null => {
    // The board's units, where it deals the partition among them.
    const on = spaceOf(module, {
      w: sp.w,
      h: sp.h,
      dealt: { ...sizes, ...grown },
      variations,
    });
    let derived = module.deriveClues(g, on, grown, given, (n) => randomUpto(rs, n));
    for (const step of CLUE_STEPS) {
      const next = step(derived, cx, { g, on, tier });
      if (next === null) return null;
      derived = next;
    }
    if (!module.isAnswer(g, on, derived, variations))
      return "build" in sample
        ? climbBuild(cx, "fill: the answer built breaks a rule")
        : drawRejected("fill: the answer drawn breaks a rule");
    if (kind === null) return { g, clues: derived };
    const list = derived[kind] as ClueList;
    // A clue a square of whose orbit has none cannot be shown symmetrically.
    const shown =
      symmetry === "none"
        ? hide.allShown(derived)
        : shownOf(list).filter((i) => hide.orbitClues(list, i) !== null);
    return { g, clues: hide.keeping(derived, shown) };
  };
  const draw: Draw<C> = (tier) => {
    const got = drawSample(sample, cx);
    if (got === null) return null;
    const grown = got.grown ?? grownRound(cx, got.g, tier);
    return grown === null ? null : dealt(got.g, grown, tier);
  };

  if (searches(module) && p.diff === module.tiers.length - 1)
    return kind === null ? dealEveryClue(cx, draw) : dealStripped(cx, hide, draw);

  const refusal = refusalOf(cx);
  const attempt = retryLimit("fill: deal");
  for (;;) {
    attempt();
    const drawn = draw(p.diff);
    if (drawn === null) continue;
    const clues = hide.hideUpTo(drawn.clues, p.diff);
    if (clues === null) {
      drawRejected("fill: the lowest tier stops short of every clue");
      continue;
    }
    const refused = refusal(clues);
    if (refused !== null) {
      drawRejected(refused);
      continue;
    }
    return { desc: encodeDesc(deal, sp, clues), aux: encodeAnswer(drawn.g) };
  }
}
