/**
 * Wordtrail's dictionary: the reference aid listing, a group for each length
 * the list asks for, every common word of that length, each marked drawn,
 * still fitting or ruled out by the player's lines and crosses. A word no
 * trail spells is listed too, ruled out: finding the words is the puzzle, so
 * the whole list leaves it to the player, and "Fits" is the help.
 * "Still fitting" is the hint's own reading (`fittingTrails`), so a word the
 * hint names is one the dictionary shows as fitting.
 */

import type { ReferenceAid } from "../../engine/game.ts";
import type {
  ReferenceItem,
  ReferenceModel,
  ReferenceSection,
} from "../../engine/types.ts";
import { commonWords } from "../../engine/word-list/index.ts";
import { wordsDrawn } from "./render.ts";
import { fittingTrails } from "./solver.ts";
import type { WordtrailState, WordtrailUi } from "./state.ts";
import { spell } from "./trails.ts";

function status(
  word: string,
  drawn: Set<string>,
  fits: Set<string>,
): ReferenceItem["status"] {
  if (drawn.has(word)) return "placed";
  return fits.has(word) ? "outstanding" : "ruledOut";
}

function model(state: WordtrailState, ui: WordtrailUi): ReferenceModel {
  const fitting = fittingTrails(state);
  const drawn = wordsDrawn(state);
  const fits = new Set<string>();
  state.trails.forEach((trail, k) => {
    if (fitting.has(k)) fits.add(spell(state.letters, trail));
  });
  const sections: ReferenceSection[] = [];
  for (const n of new Set(state.lengths)) {
    const group = `${n} letters`;
    for (const word of commonWords(n)) {
      const heading = word[0].toUpperCase();
      let section = sections.at(-1);
      if (section?.group !== group || section.heading !== heading) {
        section = { heading, group, items: [] };
        sections.push(section);
      }
      section.items.push({
        key: word,
        label: word.toUpperCase(),
        status: status(word, drawn, fits),
      });
    }
  }
  return {
    instructions: "Every word the game counts. Tap one to see where it can go.",
    search: true,
    filters: [
      { label: "Fits", statuses: ["outstanding"] },
      { label: "Found", statuses: ["placed"] },
    ],
    sections,
    selected: ui.spotlight,
    hinted: [],
  };
}

function select(ui: WordtrailUi, key: string | null): boolean {
  if (ui.spotlight === key) return false;
  ui.spotlight = key;
  return true;
}

export const dictionary: ReferenceAid<WordtrailState, WordtrailUi> = {
  title: "Dictionary",
  model,
  watches: (ui) => ui.spotlight ?? "",
  select,
};
