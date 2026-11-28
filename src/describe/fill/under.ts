/**
 * A ruleset or variation a deal key names (`engine/fill/params/under.ts`):
 * read by the hide's `whole` and the sample's `hidden` alike.
 */

import type { Under } from "../../engine/fill/params/under.ts";
import { CompileError } from "../compile-sorts.ts";
import type { DescriptionJson } from "../description.ts";
import type { SettingOut } from "./settings.ts";

/** The ruleset or variation of name `name`, as the deal reads it (`Under`). */
export function underOf(
  json: DescriptionJson,
  settings: readonly SettingOut[],
  name: string,
  where: string,
): Under {
  const ruleset = rulesetNamed(settings, name);
  if (ruleset !== null) return { ruleset };
  if (json.variations?.[name] === undefined)
    throw new CompileError(`${where}: ${name}, no variation or ruleset`);
  return { with: name };
}

/** The ruleset of name `name`, by its setting and its choice's index; `null`
 * where no choice of a size is so named. */
function rulesetNamed(
  settings: readonly SettingOut[],
  name: string,
): { setting: string; choice: number } | null {
  for (const s of settings) {
    if (s.kind !== "choice" || s.gives !== "size") continue;
    const choice = s.choices.findIndex((c) => c.name === name);
    if (choice >= 0) return { setting: s.id, choice };
  }
  return null;
}
