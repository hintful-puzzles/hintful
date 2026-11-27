/** The sizes the settings give, apart from `settings.ts`, which the sample's
 * and the partitions' compilers it calls also read. */

import type { SettingOut } from "./settings.ts";

/** The sizes the settings give, each with its least and its count of
 * values. */
export const sizeSettings = (
  settings: readonly SettingOut[],
): { id: string; from: number; values: number }[] =>
  settings.flatMap((s) =>
    s.kind === "choice" && s.gives === "size"
      ? [{ id: s.id, from: s.from, values: s.choices.length }]
      : s.kind === "number" && s.gives === "size"
        ? [{ id: s.id, from: s.min, values: s.max - s.min + 1 }]
        : [],
  );
