/**
 * How a fill board of numbers is played (`play.numbers`): its values are the
 * answer's domain, each typed into a selected cell by its key, the selection
 * being the note-taking cell's highlight (`mechanics/note-taking-cell.ts`),
 * as every game whose player types numbers into cells has it. Where the
 * board keeps notes (`play.notes`), a right press selects a cell for notes,
 * the Marks key switches typing to notes, and a value typed may strike
 * itself from the notes it rules out (auto-pencil). A typed entry and a note
 * are the note-taking cell's moves (`notes.ts`).
 */

import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type { KeyLabel, Point } from "../contract/types.ts";
import {
  type CandidateMove,
  candidateGesture,
  DEFAULT_CANDIDATE_READING,
} from "../hint/candidate-hint.ts";
import type { PointerAction } from "../input/hint-gesture.ts";
import { digitKeyCode, digitKeys } from "../input/key-labels.ts";
import {
  CURSOR_SELECT2,
  digitOf,
  isCursorMove,
  isEraseKey,
  LEFT_BUTTON,
  moveCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../input/pointer.ts";
import { squareGrid } from "../input/target-verb.ts";
import {
  type NoteTakingUi,
  noOpEntryResult,
  noteEntryGesture,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../mechanics/note-taking-cell.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";
import { type FillMove, isCandidateMove, markAll } from "./notes.ts";
import type { FillPlay, FillUi } from "./play.ts";

/** The largest value a board of numbers on the space `sp` holds: the top of
 * its domain, which is the board's, the same at every cell. */
function topValue<C>(module: FillModule<C>, sp: GridSpace): number {
  // The compiler refuses a board of numbers whose domain reads its clues.
  const mask = module.domainOf(sp, {} as C, sp.cells[0]);
  return 31 - Math.clz32(mask);
}

/** `ui` as a board of numbers keeps it, which `newUi` gives it: the
 * note-taking cell's fields, and where the board keeps notes its mode and
 * preferences, as every game with notes starts them, the hint's reading the
 * one `play` declares. */
export function typedUi(ui: FillUi, play: FillPlay): FillUi {
  ui.cursorFromKeyboard ??= false;
  if (play.notes === true) {
    ui.pencilMode ??= false;
    ui.pencilSticky ??= true;
    ui.pencilKeepHighlight ??= true;
    ui.autoPencil ??= false;
    ui.candidateReading ??= play.hintNotes ?? DEFAULT_CANDIDATE_READING;
  }
  return ui;
}

/** The note-taking cell's view of `ui`. A board without notes is never in
 * pencil mode and keeps no such field (`FillUi.pencilMode`), so its view
 * reads the mode as off and drops a write to it. */
function noteTaking(ui: FillUi): NoteTakingUi {
  if (ui.pencilMode !== undefined) return ui as FillUi & NoteTakingUi;
  return {
    cursor: ui.cursor,
    get pencilMode() {
      return false;
    },
    set pencilMode(_on) {},
    get cursorFromKeyboard() {
      return ui.cursorFromKeyboard ?? false;
    },
    set cursorFromKeyboard(on) {
      ui.cursorFromKeyboard = on;
    },
  };
}

/** The glyph value `v` is drawn and typed as: a digit, and past nine a
 * letter, as the keypad's keys are labeled. */
export const numeral = (v: number): string => String.fromCharCode(digitKeyCode(v));

/** A board of numbers' input: `interpretMove`, the keypad, and the taps and
 * keys that make a move, which a hint's gesture shows. */
export interface NumberInput<C, D> {
  interpretMove(
    board: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): CandidateMove | UiUpdate | null;
  /** A key a value, then the clear key, for a board of size `size`. */
  requestKeys(size: { w: number; h: number }): KeyLabel[];
  gesture(board: FillBoard<C>, ui: FillUi, ds: D, move: FillMove): PointerAction[];
}

export function numberInput<C, D extends { readonly tileSize: number }>(
  module: FillModule<C>,
  origin: (tileSize: number, board: FillBoard<C>) => number,
): NumberInput<C, D> {
  const geometry = squareGrid<FillBoard<C>, D>({ size: (b) => b, border: origin });
  const notes = module.play?.notes === true;
  return {
    interpretMove(b, fillUi, ds, p, raw) {
      const ui = noteTaking(fillUi);
      const button = stripModifiers(raw);
      const at = geometry.pointerTarget(b, ds, p, ui);
      // A press selects a cell the player may type into, or with the right
      // button one that may take notes: an open one, empty for notes. A given
      // is neither, and is not left highlighted.
      if (
        at !== null &&
        (button === LEFT_BUTTON || (notes && button === RIGHT_BUTTON))
      ) {
        const c = at.y * b.w + at.x;
        const open = b.fixed[c] === 0;
        pressNoteTakingCell(ui, button, at.x, at.y, {
          canEnter: open,
          canMark: notes && open && b.values[c] === 0,
        });
        return UI_UPDATE;
      }
      if (isCursorMove(button)) {
        ui.cursorFromKeyboard = true;
        return moveCursor(ui.cursor, button, b.w, b.h) ? UI_UPDATE : null;
      }
      if (notes) {
        const toggled = toggleNoteTakingMode(ui, button);
        if (toggled !== null) return toggled;
      }
      if (!ui.cursor.visible) return null;
      const n = button === CURSOR_SELECT2 || isEraseKey(button) ? 0 : digitOf(button);
      if (n === null || n > topValue(module, spaceOf(module, b))) return null;
      const { x, y } = ui.cursor;
      const c = y * b.w + x;
      if (b.fixed[c]) return null;
      // A note goes on an empty cell alone.
      if (ui.pencilMode && b.values[c] !== 0) return null;
      const noted = b.pencil?.[c] ?? 0;
      if ((!ui.pencilMode || n === 0) && b.values[c] === n && noted === 0)
        return noOpEntryResult(ui);
      const pencil = ui.pencilMode && n > 0;
      releaseHighlightAfterEntry(ui);
      return pencil
        ? { type: "set", x, y, n, pencil }
        : { type: "set", x, y, n, pencil, autoElim: fillUi.autoPencil ?? false };
    },
    requestKeys(size) {
      return digitKeys(topValue(module, spaceOf(module, size)));
    },
    gesture(b, fillUi, ds, move) {
      const ui = noteTaking(fillUi);
      const pointAt = (x: number, y: number) =>
        geometry.pointAt(b, ds, { x, y }, fillUi);
      if (isCandidateMove(move))
        return candidateGesture(
          move,
          ui,
          pointAt,
          digitKeyCode,
          undefined,
          markAll(module, b),
        );
      const set = move.set ?? [];
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
      return noteEntryGesture(ui, pointAt, entries);
    },
  };
}
