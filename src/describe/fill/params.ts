/**
 * The retired tier letters of a fill game's params (`engine/fill/params/
 * tiers.ts`); its settings are `settings.ts`'.
 */

import { CompileError } from "../compile-sorts.ts";
import type { DescriptionJson } from "../description.ts";
import { tierIndex } from "./emit.ts";

/** The retired tier letters, each the index of the tier it reads as. */
export function tierAliasesOf(
  json: DescriptionJson,
  tiers: readonly string[],
  tierLetters: string,
): Record<string, number> | null {
  if (json.tierAliases === undefined) return null;
  return Object.fromEntries(
    Object.entries(json.tierAliases).map(([letter, tier]) => {
      if (tierLetters.includes(letter))
        throw new CompileError(`tierAliases: ${letter} is a tier's own letter`);
      return [letter, tierIndex(tiers, tier, "tierAliases")];
    }),
  );
}
