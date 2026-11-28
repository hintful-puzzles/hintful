/**
 * A display order of a square board's lines (`play.order`): on a board whose
 * rows and columns stand for the same things (upstream Group's elements),
 * the player drags a line's label to move that row and the same column
 * together, or moves the cursor's with Shift and an arrow, to line up what
 * belongs together. The board keeps the order, the line drawn at each place,
 * and every value stays on its own line.
 *
 * What the player sees and touches is a view: the board permuted into its
 * order (`viewOf`), each cell at its place, so the renderer and the input
 * read a board drawn where it is stored, the Ui's cursor and selection
 * included. What the board says of its own cells is taken to the view (its
 * live errors, its mistakes, a hint's marks and moves), and a move made on
 * the view is taken back to the board's lines (`fromView`). A reorder move
 * alone names a board's line, since the view it is made on is already
 * reordered while its drag is live.
 */

import type { HintStep } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import type { LiveErrors } from "../render/live-errors.ts";
import { type ClueList, clueList } from "../solve/describe-runtime.ts";
import type { FillMistake } from "./answer.ts";
import type { FillBoard } from "./board.ts";
import type { FillMove } from "./notes.ts";
import type { FillUi } from "./play.ts";

/** Moves line `line` of the board, its row and its column, to place `to`. */
export interface ReorderMove {
  readonly type: "reorder";
  readonly line: number;
  readonly to: number;
}

/** A header drag the player has under way: the board's line whose label
 * they pressed, along the rows or the columns, the place the pointer is
 * over, where the press was, and whether the pointer has moved since. */
export interface ReorderDrag {
  readonly line: number;
  readonly rows: boolean;
  to: number;
  moved: boolean;
  readonly press: Point;
}

/** Whether `move` has a reorder move's shape, as a save holds it. */
export function isReorderShaped(move: unknown): move is ReorderMove {
  if (typeof move !== "object" || move === null) return false;
  const m = move as Partial<Record<keyof ReorderMove, unknown>>;
  return m.type === "reorder" && Number.isInteger(m.line) && Number.isInteger(m.to);
}

/** `order` with line `line` taken out and put back at place `to`. */
function movedIn(order: ArrayLike<number>, line: number, to: number): Int32Array {
  const rest = Array.from(order).filter((l) => l !== line);
  rest.splice(to, 0, line);
  return Int32Array.from(rest);
}

/** The board after `move`: its line at the place asked, and each divider
 * whose two lines it parted taken away, as upstream Group's. A board that
 * keeps no order, or a line or place it lacks, was not built by the engine,
 * and throws. */
export function applyReorder<C>(board: FillBoard<C>, move: ReorderMove): FillBoard<C> {
  const { order } = board;
  const n = order?.length ?? 0;
  if (order === null || [move.line, move.to].some((v) => v < 0 || v >= n))
    throw new Error(`reorder: no line ${move.line} or place ${move.to}`);
  const next = movedIn(order, move.line, move.to);
  if (board.dividers === null) return { ...board, order: next };
  const dividers = board.dividers.slice();
  next.forEach((l, i) => {
    if (dividers[l] !== (i + 1 < n ? next[i + 1] : -1)) dividers[l] = -1;
  });
  return { ...board, order: next, dividers };
}

/** The place of the label a press at `p` lands on, on a board `n` lines
 * across whose first cell lies `origin` in from the canvas's top and left, a
 * cell every `pitch`, and whether it heads a row; `null` off the labels. */
export function labelAt(
  n: number,
  origin: number,
  pitch: number,
  p: Point,
): { readonly place: number; readonly rows: boolean } | null {
  const along = (v: number) => v >= origin && v < origin + n * pitch;
  const place = (v: number) => Math.floor((v - origin) / pitch);
  if (p.y < origin && along(p.x)) return { place: place(p.x), rows: false };
  if (p.x < origin && along(p.y)) return { place: place(p.y), rows: true };
  return null;
}

/** The header drag's next frame, the pointer at `p`: the place it is over
 * along the drag's lines, where it is over one, and moved once that is
 * another than the press's. */
export function dragTo(
  drag: ReorderDrag,
  n: number,
  origin: number,
  pitch: number,
  p: Point,
): void {
  const place = Math.floor(((drag.rows ? p.y : p.x) - origin) / pitch);
  if (place < 0 || place >= n || place === drag.to) return;
  drag.to = place;
  drag.moved = true;
}

/** The cells of the view the live header drag carries, which are drawn as
 * the selected cell is: the dragged line's at the place it is over. */
export function draggedCells(ui: FillUi, w: number): number[] {
  const drag = ui.reorder;
  if (drag === undefined || drag === null || !drag.moved) return [];
  return Array.from({ length: w }, (_, i) =>
    drag.rows ? drag.to * w + i : i * w + drag.to,
  );
}

/** The order the board is drawn in, `null` where it keeps none: while `ui`'s
 * header drag is live, with the dragged line at the place the pointer is
 * over. */
export function orderOf<C>(board: FillBoard<C>, ui: FillUi): Int32Array | null {
  const { order } = board;
  const drag = ui.reorder;
  return order === null || drag === undefined || drag === null
    ? order
    : movedIn(order, drag.line, drag.to);
}

/** How the cells of a board `w` wide lie in the view drawn in the order
 * `lines`: the board's cell each view's cell shows, and the other way. */
class Seen {
  /** Each line's place. */
  readonly places: Int32Array;

  constructor(
    readonly lines: Int32Array,
    readonly w: number,
  ) {
    this.places = new Int32Array(lines.length);
    lines.forEach((l, i) => {
      this.places[l] = i;
    });
  }

  /** The board's cell view cell `c` shows. */
  boardCell = (c: number): number =>
    this.lines[Math.floor(c / this.w)] * this.w + this.lines[c % this.w];

  /** The view's cell that shows board cell `c`. */
  viewCell = (c: number): number =>
    this.places[Math.floor(c / this.w)] * this.w + this.places[c % this.w];

  boardPoint = <P extends Point>(p: P): P => ({
    ...p,
    x: this.lines[p.x],
    y: this.lines[p.y],
  });

  viewPoint = <P extends Point>(p: P): P => ({
    ...p,
    x: this.places[p.x],
    y: this.places[p.y],
  });
}

/** A board drawn in an order, as its view holds it: the line each place
 * shows. */
export type Viewed<C> = FillBoard<C> & { readonly lines: Int32Array };

/** The line drawn at place `i` of `b`: a view's line there, and on a board
 * drawn as it is stored, line `i`. */
export const shownLine = <C>(b: FillBoard<C>, i: number): number =>
  (b as Partial<Viewed<C>>).lines?.[i] ?? i;

/** A clue of the board, permuted with its cells: a clue list's elements
 * moved, each clue keeping its index; a size beyond the grid's as it is. */
function viewedClue(clue: unknown, seen: Seen): unknown {
  if (typeof clue === "number") return clue;
  if (typeof clue === "object" && clue !== null && "valueAt" in clue) {
    const list = clue as ClueList;
    return clueList(
      Array.from(list.at, seen.viewCell),
      Array.from(list.v),
      list.byAt.length,
    );
  }
  // The compiler offers an order only where every clue sits at a cell.
  throw new Error("order: a clue off the cells is not drawn in an order");
}

/** The board drawn in the order `lines`, each cell at its place: its values,
 * givens, notes and clues permuted; its dividers each between the two places
 * whose lines it waits for; and no order of its own, so a view is never
 * permuted again. */
export function viewOf<C>(board: FillBoard<C>, lines: Int32Array): Viewed<C> {
  const seen = new Seen(lines, board.w);
  const permute = <A extends Uint8Array | Int32Array>(a: A): A =>
    a.map((_, c) => a[seen.boardCell(c)]) as A;
  const dealt = Object.fromEntries(
    Object.entries(board.dealt as Readonly<Record<string, unknown>>).map(([k, v]) => [
      k,
      viewedClue(v, seen),
    ]),
  ) as C;
  const { dividers } = board;
  return {
    ...board,
    dealt,
    values: permute(board.values),
    fixed: permute(board.fixed),
    // A cell's mark names an element, which no board with an order keeps.
    mark: board.mark.slice().fill(-1),
    pencil: board.pencil === null ? null : permute(board.pencil),
    dividers:
      dividers === null
        ? null
        : lines.map((l, i) =>
            i + 1 < lines.length && dividers[l] === lines[i + 1] ? i + 1 : -1,
          ),
    order: null,
    lines,
  };
}

/** A move on cells with each of its cells and lines taken across by `seen`,
 * to the board where `back`, else to the view: an edit's, a typed
 * selection's, the note-taking cell's and a divider's. A reorder move names
 * a board's line already. */
function across(move: FillMove, seen: Seen, back: boolean): FillMove {
  const cell = back ? seen.boardCell : seen.viewCell;
  const point = back ? seen.boardPoint : seen.viewPoint;
  const line = (l: number) => (back ? seen.lines[l] : seen.places[l]);
  if (!("type" in move)) {
    const pairs = (list: readonly number[]) =>
      list.map((v, i) => (i % 2 === 0 ? cell(v) : v));
    return {
      ...(move.set === undefined ? {} : { set: pairs(move.set) }),
      ...(move.mark === undefined ? {} : { mark: pairs(move.mark) }),
    };
  }
  switch (move.type) {
    case "reorder":
    case "pencilAll":
    case "done":
      return move;
    case "setCells":
      return { ...move, cells: move.cells.map(cell) };
    case "divider":
      return { ...move, a: line(move.a), b: line(move.b) };
    case "set":
      return point(move);
    case "pencilStrike":
    case "pencilAdd":
      return { ...move, marks: move.marks.map(point) };
  }
}

/** A move made on the view drawn in the order `lines`, as the board takes
 * it. */
export const fromView = <C>(
  board: FillBoard<C>,
  lines: Int32Array,
  move: FillMove,
): FillMove => across(move, new Seen(lines, board.w), true);

/** A move of the board, as the view drawn in the order `lines` shows it. */
export const toView = <C>(
  board: FillBoard<C>,
  lines: Int32Array,
  move: FillMove,
): FillMove => across(move, new Seen(lines, board.w), false);

/** The board cell view cell `c` shows, on a board `w` wide drawn in the
 * order `lines`. */
export const boardCellOf = (lines: Int32Array, w: number, c: number): number =>
  new Seen(lines, w).boardCell(c);

/** The board's mistakes, at the cells of the view drawn in `lines`. */
export function viewedMistakes(
  w: number,
  lines: Int32Array,
  mistakes: readonly FillMistake[],
): FillMistake[] {
  const seen = new Seen(lines, w);
  return mistakes.map((m) => ({ ...m, cell: seen.viewCell(m.cell) }));
}

/** The board's live errors, at the cells of the view drawn in `lines`: a
 * clue keeps its index, since a view's clues keep theirs. */
export function viewedErrors(w: number, lines: Int32Array, e: LiveErrors): LiveErrors {
  const { viewCell } = new Seen(lines, w);
  const at = new Uint8Array(e.at.length);
  e.at.forEach((v, c) => {
    at[viewCell(c)] = v;
  });
  return {
    at,
    pairs: e.pairs.map(([a, b]) => [viewCell(a), viewCell(b)] as const),
    clues: e.clues,
    clueAt: new Map(
      [...e.clueAt].map(([kind, byClue]) => [
        kind,
        new Map([...byClue].map(([k, els]) => [k, els.map(viewCell)])),
      ]),
    ),
    byRule: new Map(
      [...e.byRule].map(([rule, list]) => [rule, list.map((els) => els.map(viewCell))]),
    ),
    labels: e.labels.map((l) => ({ ...l, at: viewCell(l.at) })),
  };
}

/** A hint step as the view drawn in `lines` shows it: its words said of the
 * board's cells, and each mark drawn at the view's cell that shows it. Every
 * mark of a board with an order is on cells or their notes. */
export function viewedStep<M, H>(
  w: number,
  lines: Int32Array,
  step: HintStep<M, H>,
): HintStep<M, H> {
  const { viewPoint } = new Seen(lines, w);
  const words = step.words?.drawnAt((e) => {
    const p = e as Partial<Point>;
    if (typeof p.x !== "number" || typeof p.y !== "number")
      throw new Error("order: a hint mark off the cells is not drawn in an order");
    return viewPoint(p as Point);
  });
  return words === undefined ? step : { ...step, words };
}

/** The cursor's place after the board went from the order `before` to
 * `after`: on the row and column it was on, wherever they went. */
export function followedCursor(
  before: Int32Array,
  after: Int32Array,
  cursor: Point,
): Point {
  const { places } = new Seen(after, after.length);
  return { x: places[before[cursor.x]], y: places[before[cursor.y]] };
}
