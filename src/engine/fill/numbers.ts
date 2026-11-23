/**
 * How a fill board of numbers is played (`play.numbers`): its values are the
 * answer's domain, each typed into a selected cell by its key, the selection
 * being the note-taking cell's highlight (`mechanics/note-taking-cell.ts`),
 * as every game whose player types numbers into cells has it. Every move is
 * an `Edit`, as on a board of buttons (`play.ts`).
 */

import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type { KeyLabel, Point } from "../contract/types.ts";
import type { PointerAction } from "../input/hint-gesture.ts";
import { digitKeyCode, digitKeys } from "../input/key-labels.ts";
import {
  CURSOR_SELECT2,
  digitOf,
  isCursorMove,
  isEraseKey,
  LEFT_BUTTON,
  moveCursor,
  stripModifiers,
} from "../input/pointer.ts";
import { squareGrid } from "../input/target-verb.ts";
import {
  type NoteTakingUi,
  noOpEntryResult,
  noteEntryGesture,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
} from "../mechanics/note-taking-cell.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";
import type { Edit } from "./edit.ts";
import type { FillUi } from "./play.ts";

/** The largest value a board of numbers on the space `sp` holds: the top of
 * its domain, which is the board's, the same at every cell. */
function topValue<C>(module: FillModule<C>, sp: GridSpace): number {
  // The compiler refuses a board of numbers whose domain reads its clues.
  const mask = module.domainOf(sp, {} as C, sp.cells[0]);
  return 31 - Math.clz32(mask);
}

/** `ui` as a board of numbers keeps it: with the note-taking cell's fields,
 * which `newUi` gives it. */
export function typedUi(ui: FillUi): FillUi & NoteTakingUi {
  ui.pencilMode ??= false;
  ui.cursorFromKeyboard ??= false;
  return ui as FillUi & NoteTakingUi;
}

/** The glyph value `v` is drawn and typed as: a digit, and past nine a
 * letter, as the keypad's keys are labeled. */
export const numeral = (v: number): string => String.fromCharCode(digitKeyCode(v));

/** A board of numbers' input: `interpretMove`, the keypad, and the taps and
 * keys that make an edit, which a hint's gesture shows. */
export interface NumberInput<C, D> {
  interpretMove(
    board: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): Edit | UiUpdate | null;
  /** A key a value, then the clear key, for a board of size `size`. */
  requestKeys(size: { w: number; h: number }): KeyLabel[];
  gesture(board: FillBoard<C>, ui: FillUi, ds: D, edit: Edit): PointerAction[];
}

export function numberInput<C, D extends { readonly tileSize: number }>(
  module: FillModule<C>,
  origin: (tileSize: number, board: FillBoard<C>) => number,
): NumberInput<C, D> {
  const geometry = squareGrid<FillBoard<C>, D>({ size: (b) => b, border: origin });
  return {
    interpretMove(b, fillUi, ds, p, raw) {
      const ui = typedUi(fillUi);
      const button = stripModifiers(raw);
      const at = geometry.pointerTarget(b, ds, p, ui);
      // A press selects a cell the player may type into; a given is no such
      // cell, and is not left highlighted.
      if (button === LEFT_BUTTON && at !== null) {
        const open = b.fixed[at.y * b.w + at.x] === 0;
        pressNoteTakingCell(ui, button, at.x, at.y, { canEnter: open, canMark: false });
        return UI_UPDATE;
      }
      if (isCursorMove(button)) {
        ui.cursorFromKeyboard = true;
        return moveCursor(ui.cursor, button, b.w, b.h) ? UI_UPDATE : null;
      }
      if (!ui.cursor.visible) return null;
      const n = button === CURSOR_SELECT2 || isEraseKey(button) ? 0 : digitOf(button);
      if (n === null || n > topValue(module, spaceOf(module, b))) return null;
      const c = ui.cursor.y * b.w + ui.cursor.x;
      if (b.fixed[c]) return null;
      if (b.values[c] === n) return noOpEntryResult(ui);
      releaseHighlightAfterEntry(ui);
      return { set: [c, n] };
    },
    requestKeys(size) {
      return digitKeys(topValue(module, spaceOf(module, size)));
    },
    gesture(b, ui, ds, edit) {
      const set = edit.set ?? [];
      const entries = [];
      for (let i = 0; i < set.length; i += 2) {
        const c = set[i];
        entries.push({
          x: c % b.w,
          y: Math.floor(c / b.w),
          code: digitKeyCode(set[i + 1]),
          pencil: false,
        });
      }
      return noteEntryGesture(
        typedUi(ui),
        (x, y) => geometry.pointAt(b, ds, { x, y }, ui),
        entries,
      );
    },
  };
}
