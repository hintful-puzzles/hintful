/**
 * The check a bound game's every hint step owes (`Game.hintMarks`): its words
 * and its marks say the same thing.
 *
 * 1. The explanation is the words' text.
 * 2. Every mark the words name is one the step draws.
 * 3. Every mark the step draws is one the words name.
 * 4. Every role the step draws is one the game's legend lists, so the help's
 *    list of marks covers it.
 *
 * Dev/test-only; the hint-quality walk runs it on every step it visits.
 */

import type { HintMarkLegend, HintStep } from "../game.ts";
import { type MarkRef, markKeys } from "../hint-words.ts";

/** What is wrong with `step`, one line per defect; empty when it is bound. */
export function bindingDefects<H>(
  step: HintStep<unknown, H>,
  legend: HintMarkLegend<H>,
): string[] {
  const out: string[] = [];
  const { words } = step;
  if (!words) return ["the step has no words"];
  if (words.text !== step.explanation)
    out.push(`explanation "${step.explanation}" is not its words "${words.text}"`);
  const drawn: readonly MarkRef[] =
    step.highlights === undefined ? [] : legend.drawn(step.highlights);
  const named = markKeys(words.refs);
  const shown = markKeys(drawn);
  for (const k of named) if (!shown.has(k)) out.push(`names ${k}, which is not drawn`);
  for (const k of shown) if (!named.has(k)) out.push(`draws ${k}, which no word names`);
  for (const r of drawn) {
    if (r.elements.length > 0 && !(r.role in legend.roles))
      out.push(`draws the ${r.role} role, which the legend does not list`);
  }
  return out;
}
