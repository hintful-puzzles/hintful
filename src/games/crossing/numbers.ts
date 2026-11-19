/**
 * Crossing's reference aid: the clue numbers, each marked written in, written
 * in twice, still fitting or ruled out. "Fits" is the selected square's: a
 * number a run through it can take, as a click on the list would place it
 * (`runForNumber`); with no square selected, a number some run can take. It
 * is the aid that does the scan "which numbers fit here?" for the player, so
 * it lives behind the panel, where it counts as help.
 */

import type { ReferenceAid } from "../../engine/game.ts";
import type {
  ReferenceItem,
  ReferenceModel,
  ReferenceSection,
} from "../../engine/types.ts";
import {
  type CrossingState,
  type CrossingUi,
  numberAvailableTo,
  placedRuns,
  runForNumber,
  validateBoard,
} from "./state.ts";

function model(state: CrossingState, ui: CrossingUi): ReferenceModel {
  const { puzzle, grid } = state;
  const { done } = validateBoard(puzzle, grid);
  const placed = placedRuns(puzzle, grid);
  const square = ui.cursor.visible && !ui.pencilMode;
  const fits = (l: number): boolean =>
    square
      ? runForNumber(puzzle, grid, placed, ui.cursor.x, ui.cursor.y, l, ui.dir) >= 0
      : puzzle.runs.some((_, r) => numberAvailableTo(puzzle, grid, placed, r, l));
  const status = (l: number): ReferenceItem["status"] =>
    done[l] > 1
      ? "conflict"
      : done[l] === 1
        ? "placed"
        : fits(l)
          ? "outstanding"
          : "ruledOut";

  const sections: ReferenceSection[] = [];
  puzzle.numbers.forEach((digits, l) => {
    const heading = `${digits.length} digits`;
    let section = sections.at(-1);
    if (section?.heading !== heading) {
      section = { heading, group: null, items: [] };
      sections.push(section);
    }
    section.items.push({ key: String(l), label: digits.join(""), status: status(l) });
  });
  return {
    instructions: square
      ? "The numbers that fit a run through the selected square. Tap one to pick it up."
      : "Select a square to see the numbers that fit its runs. Tap one to pick it up.",
    search: true,
    filters: [
      { label: "Fits", statuses: ["outstanding"] },
      { label: "Placed", statuses: ["placed", "conflict"] },
    ],
    sections,
    selected: ui.heldNumber === null ? null : String(ui.heldNumber),
    hinted: [],
  };
}

/** Pick the number up, as a click on the list does: the board shows every
 * run that can take it, and a click on one writes it in. */
function select(ui: CrossingUi, key: string | null): boolean {
  const held = key === null ? null : Number(key);
  if (ui.heldNumber === held) return false;
  ui.heldNumber = held;
  return true;
}

export const numbers: ReferenceAid<CrossingState, CrossingUi> = {
  title: "Numbers",
  model,
  watches: (ui) =>
    `${ui.cursor.visible ? `${ui.cursor.x},${ui.cursor.y}` : ""}|${ui.dir}|${ui.pencilMode}|${ui.heldNumber}`,
  select,
};
