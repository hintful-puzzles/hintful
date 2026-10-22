/**
 * Drawing lines along the edges between the squares of a square grid, as
 * Pearl's loop and Path's lines are drawn: what an edge holds, and the drag,
 * click and keys that change it.
 *
 * The left button drags a line from square to square: a rook move a square
 * at a time, cut back where it returns to a square it has passed, stopped by
 * a crossed edge and by a square that would get more lines than it takes. On
 * release it draws a line along every edge it passed, keeping the lines
 * already there, so a drag along a line and on past its end carries the line
 * on; a drag that passes only lines takes them up. Upstream took up the lines
 * a drag started along even where it went on to lay one, and a player tracing
 * a line to continue it lost it (owner, 2026-10-21 for Path, 2026-10-22 for
 * both). A press released where it began is a click on the edge it was aimed
 * at. The right button crosses an edge, and drags to cross every edge it
 * passes, through the engine's sweep.
 *
 * The keyboard: Enter starts a line at the cursor, the arrows carry it,
 * Enter draws it, and Space or a cancel key abandons it. Ctrl+arrow draws or
 * takes up the line on that side and moves along it, Ctrl+Shift+arrow does
 * the same without moving, and Shift+arrow crosses the edge.
 *
 * A game declares what is the puzzle's ({@link LineRules}): what an edge
 * holds, how many lines a square takes, and whether a drag may close a loop.
 * Its saved move stays its own, made from the edges a release changes.
 */

import { UI_UPDATE, type UiUpdate } from "./game.ts";
import { click, type PointerAction } from "./hint-gesture.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  type GridCursor,
  hideCursor,
  isCancelKey,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
  moveCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  showCursor,
  stripModifiers,
} from "./pointer.ts";
import {
  directionOf,
  type EdgeLayout,
  edgeAt,
  edgeBetween,
  edgeMiddle,
  pointAtEdge,
  squareAt,
  squareEdges,
} from "./square-edges.ts";
import {
  beginSweep,
  dragMarkVerbs,
  endSweep,
  sweepOpen,
  sweepTo,
  type TargetVerbs,
} from "./target-verb.ts";
import type { Point } from "./types.ts";

// --- what an edge holds -----------------------------------------------------

/** An edge the player has not decided. */
export const OPEN = 0;
/** An edge a line runs along. */
export const LINE = 1;
/** An edge the player has marked as having no line. */
export const CROSS = 2;
export type EdgeMark = typeof OPEN | typeof LINE | typeof CROSS;

/** One edge a move sets. */
export interface EdgeChange {
  readonly edge: number;
  readonly mark: EdgeMark;
}

/** What is the puzzle's about drawing its lines. */
export interface LineRules<S extends Board> {
  /** What edge `e` holds, numbered as `square-edges.ts` numbers it. */
  mark(state: S, e: number): EdgeMark;
  /** How many lines square `i` takes. No drag, click or key gives it more. */
  takes(state: S, i: number): number;
  /** Whether a drag back onto its first square closes a loop there, rather
   * than being cut back to it. */
  loops: boolean;
}

interface Board {
  readonly w: number;
  readonly h: number;
}

// --- the drag ---------------------------------------------------------------

/** A line being drawn: the squares it has passed through, in order. */
export interface LineDrag {
  cells: number[];
  /** Whether Enter began it, so that the arrows carry it on and Enter
   * finishes it. */
  keyboard: boolean;
  /** Where the press that began a pointer's drag landed, which says the edge
   * a press released where it began is aimed at. */
  at: Point | null;
}

/** The `Ui` a line-drawing game holds. */
export interface LineDrawingUi {
  cursor: GridCursor;
  drag: LineDrag | null;
}

/** An edge marked against the answer. */
export interface EdgeMistake {
  edge: number;
}

/**
 * The edges marked against `answer`, the lines of a board's one answer: a line
 * it does not have, and a cross on one it does. An open edge is never one
 * (docs/solver-and-generator.md § "Edge games flag set edges only").
 */
export function edgeMistakes(
  marks: ArrayLike<number>,
  answer: ArrayLike<number>,
): EdgeMistake[] {
  const out: EdgeMistake[] = [];
  for (let edge = 0; edge < marks.length; edge++) {
    if (marks[edge] === LINE && answer[edge] !== LINE) out.push({ edge });
    if (marks[edge] === CROSS && answer[edge] === LINE) out.push({ edge });
  }
  return out;
}

/** The marks of every edge of `state`. */
function marksOf<S extends Board>(rules: LineRules<S>, state: S): EdgeMark[] {
  const g = squareEdges(state.w, state.h);
  return Array.from({ length: g.edgeCount }, (_, e) => rules.mark(state, e));
}

/**
 * The edges a drag through `cells` sets: a line along every edge it passes,
 * keeping the lines already there, or, where it passes only lines, every one
 * taken up.
 */
function dragChanges<S extends Board>(
  rules: LineRules<S>,
  state: S,
  cells: readonly number[],
): EdgeChange[] {
  const g = squareEdges(state.w, state.h);
  const passed = new Set<number>();
  for (let k = 1; k < cells.length; k++)
    passed.add(edgeBetween(g, cells[k - 1], cells[k]));
  const lays = [...passed].some((e) => rules.mark(state, e) !== LINE);
  const out: EdgeChange[] = [];
  for (const edge of passed) {
    const mark = lays ? LINE : OPEN;
    if (rules.mark(state, edge) !== mark) out.push({ edge, mark });
  }
  return out.sort((x, y) => x.edge - y.edge);
}

/** The edges `drag` would change if released now, which its preview shows:
 * none for no drag or a press that has not left its square. */
export function dragPreview<S extends Board>(
  rules: LineRules<S>,
  state: S,
  drag: LineDrag | null,
): EdgeChange[] {
  return drag && drag.cells.length > 1 ? dragChanges(rules, state, drag.cells) : [];
}

/** How many lines square `i` has in `marks`. */
function linesAt(state: Board, marks: readonly EdgeMark[], i: number): number {
  const g = squareEdges(state.w, state.h);
  let n = 0;
  for (let d = 0; d < 4; d++) {
    const e = g.around[i * 4 + d];
    if (e >= 0 && marks[e] === LINE) n++;
  }
  return n;
}

/** Whether a line can go on open edge `e`: it is not crossed out, and neither
 * square it joins has all the lines it takes. */
function lineFits<S extends Board>(rules: LineRules<S>, state: S, e: number): boolean {
  const mark = rules.mark(state, e);
  if (mark !== OPEN) return mark === LINE;
  const g = squareEdges(state.w, state.h);
  const marks = marksOf(rules, state);
  return [g.a[e], g.b[e]].every(
    (i) => linesAt(state, marks, i) < rules.takes(state, i),
  );
}

/**
 * Carry `drag` on to square `to`. Back onto a square it has passed through,
 * it is cut back to there, unless it closes a loop on its first square.
 * Otherwise it walks a square at a time in a straight line toward `to`, so a
 * quick drag along a row loses nothing, and stops where the next edge is
 * crossed out or its line would give a square more lines than it takes. A
 * step off the row and column it is on does nothing, as upstream's do: the
 * drag waits for the pointer to come back.
 */
function extendDrag<S extends Board>(
  rules: LineRules<S>,
  state: S,
  drag: LineDrag,
  to: number,
): void {
  const { w } = state;
  const g = squareEdges(state.w, state.h);
  const { cells } = drag;
  const seen = cells.indexOf(to);
  // The smallest loop of squares has four.
  const closing = seen === 0 && rules.loops && cells.length >= 4;
  if (seen >= 0 && !closing) {
    cells.length = seen + 1;
    return;
  }
  const last = cells[cells.length - 1];
  const [lx, ly] = [last % w, Math.floor(last / w)];
  const [tx, ty] = [to % w, Math.floor(to / w)];
  if (lx !== tx && ly !== ty) return;
  const step = lx === tx ? (ty > ly ? w : -w) : tx > lx ? 1 : -1;
  for (let at = last; at !== to; ) {
    const next = at + step;
    if (cells.includes(next) && !(closing && next === to)) break;
    // Judged on the board as the drag would leave it with this step, since
    // a step that lays a line keeps the lines the drag has passed.
    const e = edgeBetween(g, at, next);
    if (rules.mark(state, e) === CROSS) break;
    const marks = marksOf(rules, state);
    for (const c of dragChanges(rules, state, [...cells, next])) marks[c.edge] = c.mark;
    if ([at, next].some((i) => linesAt(state, marks, i) > rules.takes(state, i))) break;
    cells.push(next);
    at = next;
  }
  // A loop that cannot close is a drag back onto its first square.
  if (closing && cells[cells.length - 1] !== to) cells.length = 1;
}

// --- the input --------------------------------------------------------------

/** How a game's board is laid out and what its move is. */
export interface LineInput<S, D, M> {
  /** The board's pixel layout, as `square-edges.ts` aims at an edge in it. */
  layout(ds: D): EdgeLayout;
  /** The game's move making `changes`, which are never empty. */
  move(state: S, changes: readonly EdgeChange[]): M;
}

/** A line-drawing game's input, as {@link lineDrawing} builds it. */
export interface LineDrawing<S, U, D, M> {
  interpretMove(state: S, ui: U, ds: D, p: Point, button: number): M | null | UiUpdate;
  /** The right button's drag, which crosses every edge it passes. Not a
   * `Game` member, so the game exports it for `drag-marks.test.ts`. */
  crossDrag: TargetVerbs<S, U, D, number, M>;
  /** The clicks that make `changes`, a hint step's edges: the left button
   * on each line, the right on each cross. */
  hintGesture(
    state: S,
    ds: D,
    changes: readonly EdgeChange[],
  ): readonly PointerAction[];
}

/** The input of a game whose player draws lines along the edges of squares:
 * all of it, as the module's header says. */
export function lineDrawing<S extends Board, U extends LineDrawingUi, D, M>(
  rules: LineRules<S>,
  input: LineInput<S, D, M>,
): LineDrawing<S, U, D, M> {
  const edges = (state: S) => squareEdges(state.w, state.h);
  const moveOf = (state: S, changes: readonly EdgeChange[]): M | null =>
    changes.length > 0 ? input.move(state, changes) : null;

  /** A line on edge `e`, or the line taken off it. */
  const toggleLine = (state: S, e: number): M | null =>
    rules.mark(state, e) === LINE
      ? moveOf(state, [{ edge: e, mark: OPEN }])
      : lineFits(rules, state, e)
        ? moveOf(state, [{ edge: e, mark: LINE }])
        : null;

  /** A cross on edge `e`, or the cross taken off it: nothing on a line. */
  const toggleCross = (state: S, e: number): M | null => {
    const mark = rules.mark(state, e);
    if (mark === LINE) return null;
    return moveOf(state, [{ edge: e, mark: mark === CROSS ? OPEN : CROSS }]);
  };

  /** The edge a press at `p` is aimed at, or `null` near a square's middle. */
  const aimedEdge = (state: S, ds: D, p: Point): number | null =>
    edgeAt(edges(state), input.layout(ds), p);

  const crossDrag = dragMarkVerbs<S, U, D, number, M>({
    noun: "edge",
    button: "secondary",
    target: aimedEdge,
    apply: toggleCross,
    pointAt: (state, ds, e) => pointAtEdge(edges(state), input.layout(ds), e),
    sweep: {
      holds: rules.mark,
      within: (ds) => input.layout(ds).tile * 0.3,
      middle: (ds, state, e) => edgeMiddle(edges(state), input.layout(ds), e),
    },
  });

  /** The edge beside the cursor's square in the direction an arrow points,
   * or `null` past the board's side. */
  function edgeFromCursor(state: S, ui: U, button: number): number | null {
    const d = cursorDelta(button);
    if (!d) return null;
    const { x, y } = ui.cursor;
    const e = edges(state).around[(y * state.w + x) * 4 + directionOf(d.dx, d.dy)];
    return e >= 0 ? e : null;
  }

  function interpretMove(
    state: S,
    ui: U,
    ds: D,
    p: Point,
    rawButton: number,
  ): M | null | UiUpdate {
    const button = stripModifiers(rawButton);
    const squareAtP = () => squareAt(edges(state), input.layout(ds), p);

    if (button === LEFT_BUTTON) {
      hideCursor(ui.cursor);
      const i = squareAtP();
      ui.drag = i < 0 ? null : { cells: [i], keyboard: false, at: p };
      return UI_UPDATE;
    }
    if (button === RIGHT_BUTTON) {
      hideCursor(ui.cursor);
      ui.drag = null;
      const e = aimedEdge(state, ds, p);
      if (e !== null) beginSweep(crossDrag, state, ui, e, button, p, false);
      return UI_UPDATE;
    }
    if (button === LEFT_DRAG) {
      if (!ui.drag || ui.drag.keyboard) return null;
      const i = squareAtP();
      if (i >= 0) extendDrag(rules, state, ui.drag, i);
      return UI_UPDATE;
    }
    if (button === RIGHT_DRAG)
      return sweepOpen(ui) ? sweepTo(crossDrag, state, ui, ds, p) : null;
    if (button === LEFT_RELEASE) {
      const drag = ui.drag;
      if (!drag || drag.keyboard) return null;
      ui.drag = null;
      if (drag.cells.length > 1)
        return moveOf(state, dragChanges(rules, state, drag.cells)) ?? UI_UPDATE;
      // A press released where it began is a click on the edge it was aimed
      // at, which is more controllable than where it was released.
      const e = drag.at ? aimedEdge(state, ds, drag.at) : null;
      return (e !== null ? toggleLine(state, e) : null) ?? UI_UPDATE;
    }
    if (button === RIGHT_RELEASE) {
      // A cross drag made its moves as it went; its release is not a click.
      if (endSweep(ui)) return UI_UPDATE;
      const e = aimedEdge(state, ds, p);
      return (e !== null ? toggleCross(state, e) : null) ?? UI_UPDATE;
    }

    if (isCursorMove(button)) {
      // A modified arrow marks an edge, which is too much to do to a player
      // who cannot yet see where the cursor is, so that one only reveals.
      if (rawButton & (MOD_SHFT | MOD_CTRL)) {
        if (showCursor(ui.cursor)) return UI_UPDATE;
        const e = edgeFromCursor(state, ui, button);
        if (e === null) return null;
        if (!(rawButton & MOD_CTRL)) return toggleCross(state, e);
        const move = toggleLine(state, e);
        if (move && !(rawButton & MOD_SHFT))
          moveCursor(ui.cursor, button, state.w, state.h);
        return move;
      }
      if (!moveCursor(ui.cursor, button, state.w, state.h)) return null;
      if (ui.drag?.keyboard)
        extendDrag(rules, state, ui.drag, ui.cursor.y * state.w + ui.cursor.x);
      return UI_UPDATE;
    }
    if (button === CURSOR_SELECT) {
      if (showCursor(ui.cursor)) return UI_UPDATE;
      if (ui.drag?.keyboard) {
        const { cells } = ui.drag;
        ui.drag = null;
        return moveOf(state, dragChanges(rules, state, cells)) ?? UI_UPDATE;
      }
      ui.drag = {
        cells: [ui.cursor.y * state.w + ui.cursor.x],
        keyboard: true,
        at: null,
      };
      return UI_UPDATE;
    }
    if (button === CURSOR_SELECT2 || isCancelKey(button)) {
      if (!ui.drag) return null;
      ui.drag = null;
      return UI_UPDATE;
    }
    return null;
  }

  const hintGesture = (
    state: S,
    ds: D,
    changes: readonly EdgeChange[],
  ): readonly PointerAction[] =>
    changes.map(({ edge, mark }) =>
      click(
        pointAtEdge(edges(state), input.layout(ds), edge),
        mark === LINE ? "primary" : "secondary",
      ),
    );

  return { interpretMove, crossDrag, hintGesture };
}
