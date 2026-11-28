/**
 * How a board of numbers whose values are carried (`play.carry`) is played
 * with the pointer, as upstream map.c is: a press picks up the value of the
 * cell under it, or its notes where it holds none, which follow the pointer;
 * the release puts them on the cell under it, or with the right button, or
 * while notes are typed, toggles the value carried as a note there. A release
 * that changes nothing is a tap, and selects as a press selects on any other
 * board (the select-or-drag gesture, `mechanics/note-taking-cell.ts`).
 * Upstream map.c's `drag_dropped`.
 */

import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import type { CandidateMove } from "../hint/candidate-hint.ts";
import {
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import {
  dragEnteredNoteTakingCell,
  type NoteTakingUi,
  tapNoteTakingCell,
} from "../mechanics/note-taking-cell.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";
import type { Edit } from "./edit.ts";
import type { Carried, FillUi } from "./play.ts";

/** What the carry answers for a button that is not its own. */
export const PASS = "pass";

export interface CarryInput<C, D> {
  /** The move or Ui update `button` makes, or {@link PASS}. */
  interpret(
    b: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): CandidateMove | Edit | UiUpdate | typeof PASS;
}

/** The carry of `module`'s board, `null` where it carries nothing: `cellAt`
 * the cell a press lands on, `noteTaking` the note-taking cell's view of the
 * Ui, and `pressed` told where a press that moved the selection landed. */
export function carryInput<C, D>(
  module: FillModule<C>,
  cellAt: (b: FillBoard<C>, ds: D, p: Point, ui: NoteTakingUi) => Point | null,
  noteTaking: (ui: FillUi) => NoteTakingUi,
  pressed: (b: FillBoard<C>, ds: D, p: Point, ui: FillUi) => void,
): CarryInput<C, D> | null {
  if (module.play?.carry !== true) return null;
  const notes = module.play.notes === true;
  const holds = (b: FillBoard<C>, c: number, v: number): boolean =>
    (module.domainOf(spaceOf(module, b), b.dealt, c) & (1 << v)) !== 0;

  /** What putting `held` on cell `c` does: the value written there, or a
   * cell holding none given the notes carried; as a note, the value
   * carried toggled there, on an open cell alone; `UI_UPDATE` where it
   * changes nothing. */
  function dropped(
    b: FillBoard<C>,
    ui: FillUi,
    held: Carried,
    c: number,
    note: boolean,
  ): CandidateMove | Edit | UiUpdate {
    const { value, notes: carried } = held;
    if (b.fixed[c] || (value > 0 && !holds(b, c, value))) return UI_UPDATE;
    const at = { x: c % b.w, y: Math.floor(c / b.w) };
    if (note && b.values[c] !== 0) return UI_UPDATE;
    // An empty cell's carry puts its notes down either way, as upstream's.
    if (note && value > 0) return { type: "set", ...at, n: value, pencil: true };
    const noted = b.pencil?.[c] ?? 0;
    if (b.values[c] === value && (value > 0 || noted === carried)) return UI_UPDATE;
    if (value > 0 || carried === 0)
      return {
        type: "set",
        ...at,
        n: value,
        pencil: false,
        autoElim: ui.autoPencil ?? false,
      };
    return { ...(b.values[c] === 0 ? {} : { set: [c, 0] }), notes: [c, carried] };
  }

  return {
    interpret(b, fillUi, ds, p, button) {
      const ui = noteTaking(fillUi);
      if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
        const at = cellAt(b, ds, p, ui);
        if (at === null) return PASS;
        // The selection is left alone until the gesture resolves
        // (`note-taking-cell.ts` § "the select-or-drag gesture").
        const c = at.y * b.w + at.x;
        const value = b.values[c];
        fillUi.carry = {
          value,
          notes: value === 0 ? (b.pencil?.[c] ?? 0) : 0,
          at: { x: p.x, y: p.y },
        };
        return UI_UPDATE;
      }
      const held = fillUi.carry ?? null;
      if (held === null) return PASS;
      if (isMouseDrag(button)) {
        held.at = { x: p.x, y: p.y };
        return UI_UPDATE;
      }
      if (!isMouseRelease(button)) return PASS;
      fillUi.carry = null;
      const at = cellAt(b, ds, p, ui);
      if (at === null) return UI_UPDATE;
      const c = at.y * b.w + at.x;
      const note = notes && (button === RIGHT_RELEASE || ui.pencilMode);
      const made = dropped(b, fillUi, held, c, note);
      if (made !== UI_UPDATE) {
        dragEnteredNoteTakingCell(ui, at.x, at.y);
        pressed(b, ds, p, fillUi);
        return made;
      }
      const open = b.fixed[c] === 0;
      const tapped = tapNoteTakingCell(ui, button, at, {
        canEnter: open,
        canMark: notes && open && b.values[c] === 0,
      });
      if (tapped === "moved") pressed(b, ds, p, fillUi);
      return UI_UPDATE;
    },
  };
}
