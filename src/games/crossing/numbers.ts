/**
 * Crossing's reference aid: the clue numbers, each marked written in, written
 * in twice, still fitting or ruled out. "Fits" is the selected square's: a
 * number a run through it can take, as a click on the list would place it
 * (`runForNumber`); with no square selected, a number some run can take. It
 * is the aid that does the scan "which numbers fit here?" for the player, so
 * it lives behind the panel, where it counts as help.
 */

import { type ReferenceAid, UI_UPDATE, type UiUpdate } from "../../engine/game.ts";
import type {
  ReferenceItem,
  ReferenceModel,
  ReferenceSection,
} from "../../engine/types.ts";
import {
  type CrossingMove,
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
      ? "The numbers that fit a run through the selected square. Tap one that fits to write it in."
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

/** Would writing a number that fits run `r` change anything? Every filled cell
 * already agrees with it, so only an empty cell makes it a real move. */
export function placementChanges(state: CrossingState, r: number): boolean {
  return state.puzzle.runs[r].cells.some((i) => state.grid[i] === 0);
}

/**
 * Listed number `l` taken, from the list under the board or from the
 * reference alike: with a square selected for digit entry and a run through
 * it that takes `l`, `l` is written into that run; otherwise it is picked up,
 * or put down where it was held. In pencil mode a click only holds it.
 */
export function takeNumber(
  state: CrossingState,
  ui: CrossingUi,
  l: number,
): CrossingMove | UiUpdate {
  if (ui.cursor.visible && !ui.pencilMode) {
    const placed = placedRuns(state.puzzle, state.grid);
    const { x, y } = ui.cursor;
    const run = runForNumber(state.puzzle, state.grid, placed, x, y, l, ui.dir);
    if (run >= 0 && placementChanges(state, run)) {
      ui.heldNumber = null;
      return { kind: "place", run, number: l };
    }
  }
  ui.heldNumber = ui.heldNumber === l ? null : l;
  return UI_UPDATE;
}

function select(
  state: CrossingState,
  ui: CrossingUi,
  key: string | null,
): CrossingMove | UiUpdate | null {
  if (key === null) {
    if (ui.heldNumber === null) return null;
    ui.heldNumber = null;
    return UI_UPDATE;
  }
  const l = Number(key);
  if (!Number.isInteger(l) || l < 0 || l >= state.puzzle.numbers.length) return null;
  return takeNumber(state, ui, l);
}

export const numbers: ReferenceAid<CrossingState, CrossingUi, CrossingMove> = {
  title: "Numbers",
  model,
  watches: (ui) =>
    `${ui.cursor.visible ? `${ui.cursor.x},${ui.cursor.y}` : ""}|${ui.dir}|${ui.pencilMode}|${ui.heldNumber}`,
  select,
};
