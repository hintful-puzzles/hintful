/**
 * Whether the rules hold of an answer a deal draws, and the deal's refusal
 * where they hold of none: a rule no board keeps (a loop rule turned round)
 * leaves every draw thrown away, which the retry bound ends only after its
 * ten thousand tries or the app's two minutes. The refusal names the rule.
 */

import { RetryLimitExceeded } from "../../contract/retry-limit.ts";
import type { GridSpace } from "../../solve/describe-runtime.ts";
import type { FillModule } from "../board.ts";

/**
 * The answers the rules refuse in a row, none having held, before the deal
 * is refused. Singles' built answers are refused most of any game's draws,
 * 4 in 15 over its default params (2026-11-24): a hundred refused in a row
 * comes once in 10^56 of its deals.
 */
export const REFUSED_IN_A_ROW = 100;

/**
 * The check a deal asks of each answer it draws: `module.isAnswer`, which,
 * once it has refused {@link REFUSED_IN_A_ROW} answers and held of none,
 * throws a {@link RetryLimitExceeded} naming the rule that broke most often,
 * by the module's violations of each answer refused.
 */
export function rulesHeld<C>(
  module: Pick<FillModule<C>, "isAnswer" | "violations">,
  label: string,
): (
  g: ArrayLike<number>,
  sp: GridSpace,
  cl: C,
  variations: readonly string[],
) => boolean {
  let held = false;
  let refused = 0;
  const broke = new Map<string, number>();
  return (g, sp, cl, variations) => {
    if (module.isAnswer(g, sp, cl, variations)) {
      held = true;
      return true;
    }
    if (held) return false;
    refused++;
    for (const rule of new Set(
      module.violations(g, sp, cl, variations).map((v) => v.rule),
    ))
      broke.set(rule, (broke.get(rule) ?? 0) + 1);
    if (refused < REFUSED_IN_A_ROW) return false;
    const [rule] = [...broke].reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0]);
    throw new RetryLimitExceeded(
      `${label}: the rule ${rule === "" ? "(none named)" : rule} held of none of the answers drawn`,
      refused,
    );
  };
}
