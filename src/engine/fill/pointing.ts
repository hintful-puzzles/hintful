/**
 * How a board of numbers whose every piece the player places points
 * (`glyphs.ts`'s `waysOf`) is played, as upstream Rome is: a drag from a
 * square chooses the value pointing its way, back on the square clearing
 * it, and a release that commits nothing is a tap (the select-or-drag
 * gesture, `mechanics/note-taking-cell.ts`); Enter arms the selection for
 * the arrow key that says a value's way, Space a note's on an empty square,
 * or clears where a value is armed.
 */

import { fromCoord } from "../board/geometry.ts";
import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import type { CandidateMove } from "../hint/candidate-hint.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  endDrag,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  moveDrag,
  RIGHT_BUTTON,
  startDrag,
} from "../input/pointer.ts";
import {
  dragEnteredNoteTakingCell,
  type NoteTakingUi,
  releaseHighlightAfterEntry,
  tapNoteTakingCell,
} from "../mechanics/note-taking-cell.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";
import { glyphsOf, waysOf } from "./glyphs.ts";
import type { FillUi } from "./play.ts";

/** What the input answers for a button that is not its own. */
export const PASS = "pass";

/** The way each arrow key says, a step across the grid. */
const ARROW_WAYS: ReadonlyMap<number, readonly [number, number]> = new Map([
  [CURSOR_UP, [0, -1]],
  [CURSOR_DOWN, [0, 1]],
  [CURSOR_LEFT, [-1, 0]],
  [CURSOR_RIGHT, [1, 0]],
]);

export interface PointingInput<C, D> {
  /** The move or Ui update `button` makes, or {@link PASS}. */
  interpret(
    b: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): CandidateMove | UiUpdate | null | typeof PASS;
  /** The board as the live drag would leave it, for the renderer. */
  previewed(b: FillBoard<C>, ui: FillUi): FillBoard<C>;
}

/** The input of `module`'s board where every piece points, `null` on any
 * other: `cellAt` the cell a press lands on, `noteTaking` the note-taking
 * cell's view of the Ui, the board drawn `origin` in, `gap` between
 * squares. */
export function pointingInput<C, D extends { readonly tileSize: number }>(
  module: FillModule<C>,
  cellAt: (b: FillBoard<C>, ds: D, p: Point, ui: NoteTakingUi) => Point | null,
  noteTaking: (ui: FillUi) => NoteTakingUi,
  origin: (tileSize: number, board: FillBoard<C>) => number,
  gap: (tileSize: number) => number,
): PointingInput<C, D> | null {
  const ways = waysOf(module);
  if (ways === null) return null;
  const notes = module.play?.notes === true;
  const holds = (b: FillBoard<C>, c: number, v: number): boolean =>
    (module.domainOf(spaceOf(module, b), b.dealt, c) & (1 << v)) !== 0;
  /** The value pointing way `[dx, dy]` that open cell `c` may hold, or 0: a
   * way its domain does not hold is none. */
  const wayValue = (b: FillBoard<C>, c: number, dx: number, dy: number): number => {
    if (dx === 0 && dy === 0) return 0;
    // The way is the drag's dominant axis, a tie going across.
    const way = Math.abs(dx) < Math.abs(dy) ? [0, Math.sign(dy)] : [Math.sign(dx), 0];
    for (const [v, [wx, wy]] of ways)
      if (wx === way[0] && wy === way[1]) return holds(b, c, v) ? v : 0;
    return 0;
  };
  /** The live drag: its cell, the value its way chooses (0 back on the
   * cell), and whether it notes; `null` where none is live. A note goes on
   * an empty cell alone. */
  const dragged = (
    b: FillBoard<C>,
    ui: FillUi,
  ): { c: number; v: number; note: boolean } | null => {
    const d = ui.drag;
    if (d === undefined || !d.live) return null;
    const c = d.sy * b.w + d.sx;
    const note = ui.dragButton === RIGHT_BUTTON || ui.pencilMode === true;
    const v = note && b.values[c] !== 0 ? 0 : wayValue(b, c, d.ex - d.sx, d.ey - d.sy);
    return { c, v, note };
  };
  /** Value `v` (0 clearing) put into open cell `c` as a value, or toggled
   * as a note; `UI_UPDATE` where that changes nothing. */
  const pointedMove = (
    b: FillBoard<C>,
    ui: FillUi,
    c: number,
    v: number,
    note: boolean,
  ): CandidateMove | UiUpdate => {
    const at = { x: c % b.w, y: Math.floor(c / b.w) };
    if (v > 0 && !holds(b, c, v)) return UI_UPDATE;
    if (note)
      return v === 0 || b.values[c] !== 0
        ? UI_UPDATE
        : { type: "set", ...at, n: v, pencil: true };
    if (b.values[c] === v) return UI_UPDATE;
    return {
      type: "set",
      ...at,
      n: v,
      pencil: false,
      autoElim: ui.autoPencil ?? false,
    };
  };
  /** A press, drag or release. */
  function pointer(
    b: FillBoard<C>,
    fillUi: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): CandidateMove | UiUpdate | null | typeof PASS {
    const ui = noteTaking(fillUi);
    const drag = fillUi.drag;
    if (drag === undefined) throw new Error("pointing: a Ui with no drag");
    if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
      fillUi.armed = null;
      const at = cellAt(b, ds, p, ui);
      if (at === null) return PASS;
      // The selection is left alone until the gesture resolves
      // (`note-taking-cell.ts` § "the select-or-drag gesture").
      if (b.fixed[at.y * b.w + at.x]) return null;
      startDrag(drag, at.x, at.y);
      fillUi.dragButton = button;
      return UI_UPDATE;
    }
    if (!drag.live) return null;
    const ts = ds.tileSize;
    const o = origin(ts, b);
    const pitch = ts + gap(ts);
    // The square under the pointer, off the board too: its side of the
    // pressed one is all a way reads.
    const before = dragged(b, fillUi);
    moveDrag(drag, fromCoord(p.x, pitch, o), fromCoord(p.y, pitch, o));
    const now = dragged(b, fillUi);
    if (now === null || before === null) return null;
    if (isMouseDrag(button)) return now.v === before.v ? null : UI_UPDATE;
    endDrag(drag);
    const { c, v, note } = now;
    const [x, y] = [c % b.w, Math.floor(c / b.w)];
    if ((note && v === 0) || (!note && v === b.values[c])) {
      tapNoteTakingCell(
        ui,
        button,
        { x, y },
        { canEnter: true, canMark: notes && b.values[c] === 0 },
      );
      return UI_UPDATE;
    }
    dragEnteredNoteTakingCell(ui, x, y);
    return pointedMove(b, fillUi, c, v, note);
  }
  /** A key, at the cursor's cell. */
  function keyed(
    b: FillBoard<C>,
    fillUi: FillUi,
    button: number,
  ): CandidateMove | UiUpdate | null | typeof PASS {
    const ui = noteTaking(fillUi);
    const c = ui.cursor.y * b.w + ui.cursor.x;
    const open = b.fixed[c] === 0;
    const armed = fillUi.armed ?? null;
    if (button === CURSOR_SELECT) {
      if (!open) return null;
      ui.cursor.visible = true;
      ui.cursorFromKeyboard = true;
      fillUi.armed = armed === "value" ? null : "value";
      return UI_UPDATE;
    }
    if (button === CURSOR_SELECT2) {
      if (armed === "value") {
        fillUi.armed = null;
        return open ? pointedMove(b, fillUi, c, 0, false) : UI_UPDATE;
      }
      if (!open || b.values[c] !== 0) return null;
      ui.cursor.visible = true;
      ui.cursorFromKeyboard = true;
      fillUi.armed = armed === "note" ? null : "note";
      return UI_UPDATE;
    }
    if (armed === null) return PASS;
    // An armed selection takes the next arrow key as it was armed; a value's
    // key is typed as ever, a note where a note was armed.
    const way = ARROW_WAYS.get(button);
    if (way === undefined) {
      fillUi.armed = null;
      if (armed !== "note" || ui.pencilMode) return PASS;
      const v = glyphsOf(module, b.dealt as Readonly<Record<string, unknown>>).typed(
        button,
      );
      if (v === null || v === 0) return PASS;
      releaseHighlightAfterEntry(ui);
      return pointedMove(b, fillUi, c, v, true);
    }
    fillUi.armed = null;
    const v = open ? wayValue(b, c, way[0], way[1]) : 0;
    return v === 0 ? UI_UPDATE : pointedMove(b, fillUi, c, v, armed === "note");
  }
  return {
    interpret(b, ui, ds, p, button) {
      const pointed =
        button === LEFT_BUTTON ||
        button === RIGHT_BUTTON ||
        isMouseDrag(button) ||
        isMouseRelease(button);
      return pointed ? pointer(b, ui, ds, p, button) : keyed(b, ui, button);
    },
    previewed(b, ui) {
      const now = dragged(b, ui);
      if (now === null) return b;
      const { c, v, note } = now;
      if (note) {
        if (v === 0 || b.pencil === null) return b;
        const pencil = b.pencil.slice();
        pencil[c] ^= 1 << v;
        return { ...b, pencil };
      }
      const values = b.values.slice();
      values[c] = v;
      return { ...b, values };
    },
  };
}
