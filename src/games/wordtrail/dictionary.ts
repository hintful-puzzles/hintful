/**
 * Wordtrail's dictionary: the reference aid listing, for each length the
 * list asks for, every word some trail on the board spells, each marked
 * drawn, still fitting or ruled out by the player's lines and crosses.
 * "Still fitting" is the hint's own reading (`fittingTrails`), so a word the
 * hint names is one the dictionary shows as fitting.
 */

import type { ReferenceItem, ReferenceModel } from "../../engine/types.ts";
import { wordsDrawn } from "./render.ts";
import { fittingTrails } from "./solver.ts";
import type { WordtrailState, WordtrailUi } from "./state.ts";
import { spell } from "./trails.ts";

export function reference(state: WordtrailState, ui: WordtrailUi): ReferenceModel {
  const fitting = fittingTrails(state);
  const drawn = wordsDrawn(state);
  const fits = new Set<string>();
  const all = new Set<string>();
  state.trails.forEach((trail, k) => {
    const word = spell(state.letters, trail);
    all.add(word);
    if (fitting.has(k)) fits.add(word);
  });
  return {
    title: "Dictionary",
    instructions: "The words the letters can spell. Tap one to see where it can go.",
    sections: [...new Set(state.lengths)].map((n) => {
      const count = state.lengths.filter((m) => m === n).length;
      const items: ReferenceItem[] = [...all]
        .filter((word) => word.length === n)
        .sort()
        .map((word) => ({
          key: word,
          label: word.toUpperCase(),
          status: drawn.has(word)
            ? "placed"
            : fits.has(word)
              ? "outstanding"
              : "ruledOut",
        }));
      return {
        heading: `${n} letters: ${count === 1 ? "1 word" : `${count} words`} to find`,
        items,
      };
    }),
    selected: ui.spotlight,
    hinted: [],
  };
}

export function selectReference(ui: WordtrailUi, key: string | null): boolean {
  if (ui.spotlight === key) return false;
  ui.spotlight = key;
  return true;
}
