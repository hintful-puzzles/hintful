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
import { clearKey } from "../input/key-labels.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_SELECT2,
  CURSOR_UP,
  isCursorMove,
  isEraseKey,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_SHFT,
  moveCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../input/pointer.ts";
import {
  beginSweep,
  endSweep,
  squareGrid,
  sweepOpen,
  sweepTo,
} from "../input/target-verb.ts";
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
import {
  type DividerMove,
  dividerAt,
  dividerKeyed,
  KEY_BAR,
  KEY_MINUS,
} from "./dividers.ts";
import { type ClueSites, type DoneInput, type DoneMove, doneInput } from "./done.ts";
import type { FillParams } from "./game-id.ts";
import { BALL_GLYPH, boardGlyphs, emptyOf, glyphsOf } from "./glyphs.ts";
import { type FillMove, isCandidateMove, markAll, type SetCellsMove } from "./notes.ts";
import { dragTo, labelAt, type ReorderMove, type Viewed } from "./order.ts";
import type { FillPlay, FillUi } from "./play.ts";
import {
  type SelectShape,
  selectedCells,
  selectionMove,
  typedCells,
} from "./select.ts";

/** What a step of the input answers where the button is not its own, so the
 * next takes it: `null` is an answer, "nothing happened". */
const PASS = "pass";

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
  if (play.select !== undefined) ui.selected ??= [];
  if (play.order === true) ui.reorder ??= null;
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

/** The empty square's keys (upstream Salad's), and the ball's. */
const EMPTY_KEYS = ["X", "x", "-", "_"].map((k) => k.charCodeAt(0));
const BALL_KEYS = ["O", "o", "+", "="].map((k) => k.charCodeAt(0));

/** The note move `O` makes on open cell `c` of a board `w` wide, whose notes
 * are `noted`, empty square `empty` and domain `all`: the empty square
 * struck, from every value where the cell has no notes; or, where it is
 * struck already, put back, which leaves a cell noted every other value with
 * none. */
function ballMove(
  c: number,
  w: number,
  noted: number,
  empty: number,
  all: number,
): CandidateMove {
  const at = (n: number) => ({ x: c % w, y: Math.floor(c / w), n });
  const values = (mask: number) => {
    const out = [];
    for (let n = 1; n < 32; n++) if (mask & (1 << n)) out.push(at(n));
    return out;
  };
  const bit = 1 << empty;
  const rest = all & ~bit;
  if (noted === 0) return { type: "pencilAdd", marks: values(rest) };
  if (noted & bit) return { type: "pencilStrike", marks: [at(empty)] };
  if (noted === rest) return { type: "pencilStrike", marks: values(rest) };
  return { type: "pencilAdd", marks: [at(empty)] };
}

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
  ):
    | CandidateMove
    | SetCellsMove
    | DoneMove
    | DividerMove
    | ReorderMove
    | UiUpdate
    | null;
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
  clueSites: ClueSites<C> = {},
): NumberInput<C, D> {
  const geometry = squareGrid<FillBoard<C>, D>({ size: (b) => b, border: origin, gap });
  const notes = module.play?.notes === true;
  const select = module.play?.select;
  const dividers = module.play?.dividers === true;
  const ordered = module.play?.order === true;
  const done =
    module.play === undefined
      ? null
      : doneInput<C, D>(module, module.play, origin, gap, clueSites);
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
  /** The line each place of the view `b` shows: an ordered board's input
   * is given its view (`order.ts`). */
  const linesOf = (b: FillBoard<C>): Int32Array => {
    const { lines } = b as Partial<Viewed<C>>;
    if (lines === undefined) throw new Error("order: the input is given a view");
    return lines;
  };
  /** A selection's input: a press starts it afresh, and a drag from the
   * cell it selected for typing selects the shape to where the pointer
   * is. */
  function selecting(
    shape: SelectShape,
    b: FillBoard<C>,
    fillUi: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): UiUpdate | null | typeof PASS {
    const ui = noteTaking(fillUi);
    if (button === LEFT_BUTTON || button === RIGHT_BUTTON) fillUi.selected = [];
    if (!isMouseDrag(button) || sweepOpen(fillUi)) return PASS;
    if (!ui.cursor.visible || ui.pencilMode) return null;
    const to = geometry.pointerTarget(b, ds, p, ui);
    fillUi.selected = selectedCells(
      shape,
      b.w,
      ui.cursor.y * b.w + ui.cursor.x,
      to === null ? null : to.y * b.w + to.x,
    );
    return UI_UPDATE;
  }
  /** The input of a board in an order: a header drag, and Shift and an
   * arrow, which moves the cursor's column (left, right) or row (up, down) a
   * place along the order, rows and columns being one. */
  function reordering(
    b: FillBoard<C>,
    fillUi: FillUi,
    ds: D,
    p: Point,
    raw: number,
  ): ReorderMove | DividerMove | UiUpdate | null | typeof PASS {
    const button = stripModifiers(raw);
    if (!isCursorMove(button) || !(raw & MOD_SHFT))
      return headerDrag(b, fillUi, ds, p, button);
    const ui = noteTaking(fillUi);
    // A hidden cursor is shown first, so the line it moves is seen.
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      ui.cursorFromKeyboard = true;
      return UI_UPDATE;
    }
    const rows = button === CURSOR_UP || button === CURSOR_DOWN;
    const from = rows ? ui.cursor.y : ui.cursor.x;
    const to = from + (button === CURSOR_LEFT || button === CURSOR_UP ? -1 : 1);
    if (to < 0 || to >= b.w) return null;
    return { type: "reorder", line: linesOf(b)[from], to };
  }
  /** A header drag: a press on a label starts it, a drag carries the line
   * along, and its release moves the line there; a release where it never
   * moved is a press between two labels, which toggles the divider there. */
  function headerDrag(
    b: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): ReorderMove | DividerMove | UiUpdate | null | typeof PASS {
    const ts = ds.tileSize;
    const o = origin(ts, b);
    const pitch = ts + gap(ts);
    const drag = ui.reorder ?? null;
    if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
      const label = labelAt(b.w, o, pitch, p);
      if (label === null) return PASS;
      const { place, rows } = label;
      ui.reorder = { line: linesOf(b)[place], rows, to: place, moved: false, press: p };
      return UI_UPDATE;
    }
    if (drag === null) return PASS;
    if (isMouseDrag(button)) {
      dragTo(drag, b.w, o, pitch, p);
      return UI_UPDATE;
    }
    if (!isMouseRelease(button)) return PASS;
    ui.reorder = null;
    if (drag.moved) return { type: "reorder", line: drag.line, to: drag.to };
    return (dividers ? dividerAt(b, o, pitch, drag.press) : null) ?? UI_UPDATE;
  }
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
      // A press on a label is a header drag's, and so is the drag after it;
      // Shift and an arrow moves a line.
      if (ordered) {
        const headed = reordering(b, fillUi, ds, p, raw);
        if (headed !== PASS) return headed;
      }
      if (select !== undefined) {
        const selected = selecting(select, b, fillUi, ds, p, button);
        if (selected !== PASS) return selected;
      }
      if (dividers && (button === LEFT_BUTTON || button === RIGHT_BUTTON)) {
        const ts = ds.tileSize;
        const ruled = dividerAt(b, origin(ts, b), ts + gap(ts), p);
        if (ruled !== null) return ruled;
      }
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
        if (select !== undefined) fillUi.selected = [];
        ui.cursorFromKeyboard = true;
        return moveCursor(ui.cursor, button, b.w, b.h) ? UI_UPDATE : null;
      }
      if (notes) {
        const toggled = toggleNoteTakingMode(ui, button);
        if (toggled !== null) return toggled;
      }
      if (dividers && (button === KEY_BAR || button === KEY_MINUS)) {
        // A hidden cursor is shown first, so the line it divides after is
        // seen.
        if (!ui.cursor.visible) {
          ui.cursor.visible = true;
          ui.cursorFromKeyboard = true;
          return UI_UPDATE;
        }
        return dividerKeyed(b, ui.cursor, button);
      }
      if (!ui.cursor.visible) return null;
      const { x, y } = ui.cursor;
      const c = y * b.w + x;
      const sp = spaceOf(module, b);
      const empty = emptyOf(module, sp, b.dealt);
      if (empty !== null && BALL_KEYS.includes(button)) {
        // A ball is a state of the notes, on an open square holding nothing.
        if (b.fixed[c] || b.values[c] !== 0 || b.pencil === null) return null;
        releaseHighlightAfterEntry(ui);
        return ballMove(c, b.w, b.pencil[c], empty, module.domainOf(sp, b.dealt, c));
      }
      const emptyKey = empty !== null && EMPTY_KEYS.includes(button);
      const n =
        button === CURSOR_SELECT2 || isEraseKey(button)
          ? 0
          : emptyKey
            ? empty
            : glyphsOf(module, b.dealt as Readonly<Record<string, unknown>>).typed(
                button,
              );
      // The empty square's glyph's key types nothing: it is drawn a cross.
      if (n === null || (n === empty && !emptyKey)) return null;
      const holds = (cell: number) =>
        (module.domainOf(sp, b.dealt, cell) & (1 << n)) !== 0;
      const cells = typedCells(c, fillUi.selected);
      if (cells.length > 1) {
        const made = selectionMove(
          b,
          cells,
          n,
          ui.pencilMode,
          fillUi.autoPencil ?? false,
          holds,
        );
        if (made === null) return null;
        if (made === "same") return noOpEntryResult(ui);
        releaseHighlightAfterEntry(ui);
        return made;
      }
      // A number the cell cannot hold is not typed (Seismic's past its area).
      if (n > 0 && !holds(c)) return null;
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
      const dealt = (board?.dealt ?? p.sizes ?? {}) as C;
      const empty = emptyOf(module, sp, dealt);
      const glyphs = glyphsOf(module, dealt as Readonly<Record<string, unknown>>);
      const keys = Array.from({ length: n }, (_, i) => i + 1)
        .filter((v) => v !== empty)
        .map((v) => ({ button: glyphs.keyCode(v), label: glyphs.draw(v) }));
      // Upstream Salad's: the symbols, then X, O and clear.
      if (empty !== null)
        keys.push(
          ...["X", BALL_GLYPH].map((k) => ({ button: k.charCodeAt(0), label: k })),
        );
      return [...keys, clearKey];
    },
    gesture(b, fillUi, ds, move) {
      const ui = noteTaking(fillUi);
      const pointAt = (x: number, y: number) =>
        geometry.pointAt(b, ds, { x, y }, fillUi);
      const { keyCode } = boardGlyphs(module, spaceOf(module, b), b.dealt);
      if (isCandidateMove(move))
        return candidateGesture(
          move,
          ui,
          pointAt,
          keyCode,
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
          code: keyCode(set[i + 1]),
          pencil: false,
        });
      }
      return noteEntryGesture(ui, pointAt, entries);
    },
  };
}
