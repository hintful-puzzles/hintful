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

import { fromCoord } from "../board/geometry.ts";
import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type { KeyLabel, Point } from "../contract/types.ts";
import {
  type CandidateMove,
  candidateGesture,
  DEFAULT_CANDIDATE_READING,
} from "../hint/candidate-hint.ts";
import type { PointerAction } from "../input/hint-gesture.ts";
import { clearKey, digitKeyCode } from "../input/key-labels.ts";
import {
  CURSOR_SELECT2,
  digitOf,
  isCursorMove,
  isEraseKey,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  moveCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../input/pointer.ts";
import { beginSweep, endSweep, squareGrid, sweepTo } from "../input/target-verb.ts";
import {
  type NoteTakingUi,
  noOpEntryResult,
  noteEntryGesture,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../mechanics/note-taking-cell.ts";
import { pressedRaised } from "../render/raised.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import {
  type Clues,
  type FillBoard,
  type FillModule,
  type LadderedFillModule,
  paramSpaceOf,
  spaceOf,
  topValue,
} from "./board.ts";
import { type DoneInput, type DoneMove, doneInput, type PartClueAt } from "./done.ts";
import type { FillParams } from "./game-id.ts";
import { type FillMove, isCandidateMove, markAll } from "./notes.ts";
import type { FillPlay, FillUi } from "./play.ts";

/**
 * The keypad's last value on a board of `size`, which the params alone
 * give: the top of the domain, the same at every cell; or where a cell's is
 * the numbers 1 to its part's size, the largest part the deal divides
 * (Seismic's), as the compiler holds it. A key past it would type nothing
 * on any board dealt.
 */
function keypadTop<C>(
  module: FillModule<C>,
  sp: GridSpace,
  sizes: Readonly<Record<string, number>>,
): number {
  const divide = module.deal?.divide?.find((d) => "sizes" in d);
  if (divide === undefined || !("sizes" in divide))
    // The compiler refuses any other domain that differs from cell to cell.
    // A domain read off a size reads it among the clues, where a deal keeps
    // the sizes the params give.
    return topValue(module, sp, sizes as unknown as C);
  const { by } = divide;
  const list = divide.sizes[by === undefined ? 0 : (sizes[by.size] ?? by.min) - by.min];
  return Math.max(...(list ?? []));
}

/** `ui` as a board of numbers keeps it, which `newUi` gives it: the
 * note-taking cell's fields, and where the board keeps notes its mode and
 * preferences, as every game with notes starts them, the hint's reading the
 * one `play` declares; and no drag of buttons. */
export function typedUi({ drag: _drag, ...ui }: FillUi, play: FillPlay): FillUi {
  ui.cursorFromKeyboard ??= false;
  if (play.notes === true) {
    ui.pencilMode ??= false;
    ui.pencilSticky ??= true;
    ui.pencilKeepHighlight ??= true;
    ui.autoPencil ??= false;
    ui.candidateReading ??= play.hintNotes ?? DEFAULT_CANDIDATE_READING;
  }
  if (play.numbers?.raised === true) ui.raised ??= true;
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
 * letter, as the keypad's keys are labeled. No key draws a value past `z`'s:
 * one is a count or a clue, said `{numeral …}` in a hint. */
const numeral = (v: number): string => {
  if (!Number.isInteger(v) || v < 1 || v > 35)
    throw new Error(`no key draws the value ${v}: say a count as {numeral …}`);
  return String.fromCharCode(digitKeyCode(v));
};

/** How a board of numbers' values are drawn, said and typed. */
export interface ValueGlyphs {
  /** The glyph value `v` is drawn and said as. */
  readonly draw: (v: number) => string;
  /** The key that types value `v`. */
  readonly keyCode: (v: number) => number;
  /** The value key `button` types, 0 for one that clears, or `null`. */
  readonly typed: (button: number) => number | null;
  /** The last value with a glyph, within a cell's domain mask. */
  readonly top: number;
}

const NUMERALS: ValueGlyphs = {
  draw: numeral,
  keyCode: digitKeyCode,
  typed: digitOf,
  top: 31,
};

const A = "A".charCodeAt(0);
const a = "a".charCodeAt(0);

/** The letter value `v` is drawn as, from A. */
const letter = (v: number): string => {
  if (!Number.isInteger(v) || v < 1 || v > 26)
    throw new Error(`no letter draws the value ${v}: say a count as {numeral …}`);
  return String.fromCharCode(A + v - 1);
};

/** Letters from A, typed by either case, or by a value's place as a digit
 * (ABCD's keys, upstream's too). */
const LETTERS: ValueGlyphs = {
  draw: letter,
  keyCode: (v) => A + v - 1,
  typed: (button) => {
    const base = stripModifiers(button);
    if (base >= A && base < A + 26) return base - A + 1;
    if (base >= a && base < a + 26) return base - a + 1;
    return digitOf(button);
  },
  top: 26,
};

/** The glyphs of a board whose `play` is `play`: letters where it says
 * `numbers.letters`, else numerals. */
export const glyphsOf = (play?: FillPlay): ValueGlyphs =>
  play?.numbers?.letters === true ? LETTERS : NUMERALS;

/** A board of numbers' input: `interpretMove`, the keypad, and the taps and
 * keys that make a move, which a hint's gesture shows. */
export interface NumberInput<C, D> {
  /** Where the board has clues the player marks done, that mark's input. */
  readonly done: DoneInput<C, D> | null;
  interpretMove(
    board: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): CandidateMove | DoneMove | UiUpdate | null;
  /** A key a value, then the clear key, for a board of the params `p`, and
   * of `board` where it is in play. */
  requestKeys(p: FillParams, board?: FillBoard<C>): KeyLabel[];
  gesture(board: FillBoard<C>, ui: FillUi, ds: D, move: FillMove): PointerAction[];
}

export function numberInput<
  C extends Clues<C>,
  D extends { readonly tileSize: number },
>(
  module: LadderedFillModule<C>,
  origin: (tileSize: number, board: FillBoard<C>) => number,
  gap: (tileSize: number) => number = () => 0,
  partClue: PartClueAt<C> | null = null,
  slotKinds: readonly (keyof C)[] = [],
): NumberInput<C, D> {
  const geometry = squareGrid<FillBoard<C>, D>({ size: (b) => b, border: origin, gap });
  const notes = module.play?.notes === true;
  const glyphs = glyphsOf(module.play);
  const done =
    module.play === undefined
      ? null
      : doneInput<C, D>(module, module.play, origin, gap, partClue, slotKinds);
  /** The cell whose raised value a press at `p` lands on, drawn up and
   * right of its own square, or `null`. A raised board has no gaps. */
  const raisedPressed = (b: FillBoard<C>, ds: D, p: Point): Point | null => {
    const ts = ds.tileSize;
    const o = origin(ts, b);
    const at = { x: fromCoord(p.x, ts, o), y: fromCoord(p.y, ts, o) };
    return pressedRaised(
      p,
      at,
      (x, y) => ({ x: o + x * ts, y: o + y * ts, w: ts, h: ts }),
      (x, y) => (x < 0 || y < 0 || x >= b.w || y >= b.h ? 0 : b.values[y * b.w + x]),
      topValue(module, spaceOf(module, b), b.dealt),
    );
  };
  return {
    done,
    interpretMove(b, fillUi, ds, p, raw) {
      const ui = noteTaking(fillUi);
      const button = stripModifiers(raw);
      // A press on a raised value's top is its cell's, wherever it is drawn:
      // over a neighbor's square or a clue beside the grid.
      const raisedAt =
        fillUi.raised === true && (button === LEFT_BUTTON || button === RIGHT_BUTTON)
          ? raisedPressed(b, ds, p)
          : null;
      if (done !== null && raisedAt === null) {
        // A press on a clue marks it done, and a drag on marks those that
        // looked the same.
        if (isMouseDrag(button)) return sweepTo(done.verbs, b, fillUi, ds, p);
        if (isMouseRelease(button)) {
          endSweep(fillUi);
          return null;
        }
        if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
          const clue = done.verbs.geometry.pointerTarget(b, ds, p, fillUi);
          if (clue !== null) {
            beginSweep(done.verbs, b, fillUi, clue, button, p, true);
            return clue;
          }
        }
        // A Shift or Ctrl arrow is the mark's alone, and moves no cursor.
        if (done.isKey(raw)) {
          // A hidden cursor is shown first, so the clue it marks is seen.
          if (!ui.cursor.visible) {
            ui.cursor.visible = true;
            ui.cursorFromKeyboard = true;
            return UI_UPDATE;
          }
          return done.keyed(b, fillUi, raw);
        }
      }
      const at = raisedAt ?? geometry.pointerTarget(b, ds, p, ui);
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
      const n =
        button === CURSOR_SELECT2 || isEraseKey(button) ? 0 : glyphs.typed(button);
      if (n === null) return null;
      const { x, y } = ui.cursor;
      const c = y * b.w + x;
      // A number the cell cannot hold is not typed (Seismic's past its area).
      if (n > 0 && (module.domainOf(spaceOf(module, b), b.dealt, c) & (1 << n)) === 0)
        return null;
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
    requestKeys(p, board) {
      const sp = paramSpaceOf(module, p);
      const top = keypadTop(module, sp, p.sizes ?? {});
      // A board from another ID may hold a part larger than any the deal
      // divides (upstream Seismic's areas of six): its keypad reaches it.
      const n =
        board === undefined ? top : Math.max(top, topValue(module, sp, board.dealt));
      return [
        ...Array.from({ length: n }, (_, i) => ({
          button: glyphs.keyCode(i + 1),
          label: glyphs.draw(i + 1),
        })),
        clearKey,
      ];
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
          glyphs.keyCode,
          undefined,
          markAll(module, b),
        );
      // A hint marks no clue done.
      if ("type" in move) throw new Error(`no gesture for ${JSON.stringify(move)}`);
      const set = move.set ?? [];
      const entries = [];
      for (let i = 0; i < set.length; i += 2) {
        const c = set[i];
        entries.push({
          x: c % b.w,
          y: Math.floor(c / b.w),
          code: glyphs.keyCode(set[i + 1]),
          pencil: false,
        });
      }
      return noteEntryGesture(ui, pointAt, entries);
    },
  };
}
