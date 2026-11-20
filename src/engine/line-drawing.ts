/**
 * Drawing lines along the edges between the squares of a square grid, as
 * Pearl's loop and Path's lines are drawn: what an edge holds, and the drag,
 * click and keys that change it.
 *
 * The left button drags a line from square to square: a rook move a square
 * at a time, drawn back over its own end to take back steps, waiting where it
 * returns to any other square it has passed, stopped by a crossed edge and by
 * a square that would get more lines than it takes. On
 * release it draws a line along every edge it passed, keeping the lines
 * already there, so a drag along a line and on past its end carries the line
 * on; a drag that passes only lines takes them up. Upstream took up the lines
 * a drag started along even where it went on to lay one, and a player tracing
 * a line to continue it lost it (owner, 2026-10-21 for Path, 2026-10-22 for
 * both). A game may say which lines a drag from a square replaces
 * ({@link LineRules.restarts}), as Path's line ahead of a number or of a
 * square in the middle of a line: the drag draws as if they were not there,
 * and once it lays a line its release takes up those it does not lay again. A press released where it began is a click on the edge it
 * was aimed at, and replaces nothing. The right button crosses an edge, and drags to cross every edge it
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
 *
 * A game may declare its lines directed ({@link LineRules.directed}), as
 * Wordtrail's words read from their first letter: each line runs from one
 * square to the next. A drag lays its lines the way it passes them, a
 * square takes at most one line in and one out, and no run of lines closes
 * on itself. So a drag from the end of a run carries it on, one that ends on
 * a run's first square joins onto its front, and one that sets off from a
 * run's first square, or would meet a run head to head, stops before the
 * square as it stops where a square would take too many lines. A click and
 * Ctrl+arrow lay a line with a direction too ({@link lineDrawing}'s
 * `clickLine`).
 */

import {
  directionOf,
  type EdgeLayout,
  edgeAt,
  edgeBetween,
  edgeMiddle,
  pointAtEdge,
  squareAt,
  squareCenter,
  squareEdges,
} from "./board/square-edges.ts";
import { UI_UPDATE, type UiUpdate } from "./game.ts";
import { click, drag as dragGesture, type PointerAction } from "./hint-gesture.ts";
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
  /** In a directed game, the square a line it lays runs from; absent for a
   * line without direction, an open edge and a cross. */
  readonly from?: number;
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
  /** Whether edge `e` is the board's and not the player's, as a wall is: no
   * click, key or drag changes it. Absent, every edge is the player's. */
  fixed?(state: S, e: number): boolean;
  /** The lines a drag that begins on square `i` and steps first to square
   * `toward` replaces: the drag sees them as open, and once it lays a line
   * its release takes up each one it does not lay again. Asked at the first
   * step and not at the press, so a game can take the way the drag sets off
   * as the way it means to redraw. Absent, a drag replaces nothing. */
  restarts?(state: S, i: number, toward: number): readonly number[];
  /** Present where the lines run one way: `from` is the square the line on
   * edge `e` runs from, asked only of an edge holding a line. A square then
   * takes at most one line in and one out, whatever {@link takes} allows,
   * and no run of lines closes on itself. */
  directed?: { from(state: S, e: number): number };
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
  /** The lines it replaces, from {@link LineRules.restarts} on its first
   * square, or `null` before its first step. */
  replaces: readonly number[] | null;
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
 *
 * Each edge holds a game's own code: `OPEN`, `CROSS`, and anything else a
 * line, which is `LINE` but for a directed game that stores which way its
 * line runs in the code. A line is against the answer where the answer holds
 * another code there, so a line the wrong way round is a mistake.
 */
export function edgeMistakes(
  marks: ArrayLike<number>,
  answer: ArrayLike<number>,
): EdgeMistake[] {
  const isLine = (code: number) => code !== OPEN && code !== CROSS;
  const out: EdgeMistake[] = [];
  for (let edge = 0; edge < marks.length; edge++) {
    if (isLine(marks[edge]) && answer[edge] !== marks[edge]) out.push({ edge });
    if (marks[edge] === CROSS && isLine(answer[edge])) out.push({ edge });
  }
  return out;
}

/** The marks of every edge of `state`. */
function marksOf<S extends Board>(rules: LineRules<S>, state: S): EdgeMark[] {
  const g = squareEdges(state.w, state.h);
  return Array.from({ length: g.edgeCount }, (_, e) => rules.mark(state, e));
}

/** The square each edge's line runs from in `state`, or -1 for an edge
 * with no line or a game whose lines have no direction. */
function fromsOf<S extends Board>(
  rules: LineRules<S>,
  state: S,
  marks: readonly EdgeMark[],
): number[] {
  const { directed } = rules;
  return marks.map((m, e) => (directed && m === LINE ? directed.from(state, e) : -1));
}

/** `marks` and `froms` with `changes` made. */
function applyChanges(
  marks: EdgeMark[],
  froms: number[],
  changes: readonly EdgeChange[],
): void {
  for (const c of changes) {
    marks[c.edge] = c.mark;
    froms[c.edge] = c.from ?? -1;
  }
}

/**
 * The edges a drag through `cells` sets: a line along every edge it passes,
 * keeping the lines already there, or, where it passes only lines, every one
 * taken up. A directed game's line runs the way the drag passed it.
 */
function dragChanges<S extends Board>(
  rules: LineRules<S>,
  state: S,
  cells: readonly number[],
): EdgeChange[] {
  const g = squareEdges(state.w, state.h);
  // Each edge passed, and the square the drag passed it from.
  const passed = new Map<number, number>();
  for (let k = 1; k < cells.length; k++)
    passed.set(edgeBetween(g, cells[k - 1], cells[k]), cells[k - 1]);
  const lays = [...passed.keys()].some((e) => rules.mark(state, e) !== LINE);
  const out: EdgeChange[] = [];
  for (const [edge, from] of passed) {
    if (!lays) {
      if (rules.mark(state, edge) !== OPEN) out.push({ edge, mark: OPEN });
    } else if (rules.mark(state, edge) !== LINE) {
      out.push(rules.directed ? { edge, mark: LINE, from } : { edge, mark: LINE });
    }
  }
  return out.sort((x, y) => x.edge - y.edge);
}

/** `rules` as `drag` sees the board: the lines it replaces open. */
function seenBy<S extends Board>(rules: LineRules<S>, drag: LineDrag): LineRules<S> {
  if (!drag.replaces?.length) return rules;
  const open = new Set(drag.replaces);
  return { ...rules, mark: (state, e) => (open.has(e) ? OPEN : rules.mark(state, e)) };
}

/** The edges `drag` would change if released now, which its preview shows:
 * none for no drag or a press that has not left its square. A drag that
 * replaces lines changes nothing until it lays one: then they are taken up
 * but for those it lays again. So a finger that slips along the line it
 * picked up, or traces it, loses none of it (owner, 2026-11-09). */
export function dragPreview<S extends Board>(
  rules: LineRules<S>,
  state: S,
  drag: LineDrag | null,
): EdgeChange[] {
  if (!drag || drag.cells.length < 2) return [];
  const replaces = drag.replaces ?? [];
  if (replaces.length > 0) {
    const g = squareEdges(state.w, state.h);
    let lays = false;
    for (let k = 1; !lays && k < drag.cells.length; k++)
      lays =
        rules.mark(state, edgeBetween(g, drag.cells[k - 1], drag.cells[k])) !== LINE;
    if (!lays) return [];
  }
  const changes = new Map<number, EdgeChange>(
    replaces.map((edge) => [edge, { edge, mark: OPEN }]),
  );
  for (const c of dragChanges(seenBy(rules, drag), state, drag.cells))
    changes.set(c.edge, c);
  return [...changes.values()]
    .filter((c) => rules.mark(state, c.edge) !== c.mark)
    .sort((x, y) => x.edge - y.edge);
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

/** Whether the lines `marks` and `froms` hold obey a directed game's own
 * rules at squares `at`: each takes at most one line in and one out, and no
 * run of lines through it closes on itself. */
function directedFits(
  state: Board,
  marks: readonly EdgeMark[],
  froms: readonly number[],
  at: readonly number[],
): boolean {
  const g = squareEdges(state.w, state.h);
  /** The square square `i`'s one line out runs to, or -1; `null` where it
   * has two lines in or two out. */
  const next = (i: number): number | null => {
    let ins = 0;
    let to = -1;
    for (let d = 0; d < 4; d++) {
      const e = g.around[i * 4 + d];
      if (e < 0 || marks[e] !== LINE) continue;
      if (froms[e] !== i) ins++;
      else if (to >= 0) return null;
      else to = g.a[e] === i ? g.b[e] : g.a[e];
    }
    return ins > 1 ? null : to;
  };
  for (const i of at) {
    let j = next(i);
    if (j === null) return false;
    // A run closes on itself where following its lines on comes back to
    // where it set off. It runs through each square at most once.
    for (let steps = 0; j >= 0 && steps < g.cells; steps++) {
      if (j === i) return false;
      const k = next(j);
      if (k === null) return false;
      j = k;
    }
  }
  return true;
}

/** Whether the line `change` lays fits: its edge is not crossed out, and
 * neither square it joins has all the lines it takes, or for a directed
 * game, a line in or out already the way this one runs. */
function lineFits<S extends Board>(
  rules: LineRules<S>,
  state: S,
  change: EdgeChange,
): boolean {
  const e = change.edge;
  if (rules.mark(state, e) === CROSS) return false;
  const g = squareEdges(state.w, state.h);
  const marks = marksOf(rules, state);
  const froms = fromsOf(rules, state, marks);
  const ends = [g.a[e], g.b[e]];
  applyChanges(marks, froms, [change]);
  if (ends.some((i) => linesAt(state, marks, i) > rules.takes(state, i))) return false;
  return !rules.directed || directedFits(state, marks, froms, ends);
}

/**
 * Carry `drag` on to square `to`: it walks a square at a time in a
 * straight line toward `to`, so a quick drag along a row loses nothing, and
 * stops where the next edge is crossed out or its line would give a square
 * more lines than it takes. A step off the row and column it is on does
 * nothing, as upstream's do: the drag waits for the pointer to come back.
 *
 * Back onto a square it has passed through, a pointer's drag is cut back to
 * there only where it draws back over its own end: onto the square it just
 * came from, or straight back along its last straight stretch. A player can
 * change their mind mid-stroke (owner, 2026-11-09). Onto any other square it
 * has passed, unless it closes a loop on its first square, it does nothing
 * and keeps all it has drawn: a player drawing a long line in one stroke who
 * brushed an earlier part of it lost everything after (owner, 2026-10-23).
 * The keyboard's is cut back to any square it passed, which is how it takes
 * back steps before Enter, and an arrow cannot brush a square by accident.
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
  const last = cells[cells.length - 1];
  const [lx, ly] = [last % w, Math.floor(last / w)];
  const [tx, ty] = [to % w, Math.floor(to / w)];
  // Every square from `to` to the end in `to`'s row, or every one in its
  // column: the drag drawing back over its end. A loop never closes this way,
  // as its squares are never all in one row or column.
  const retreats =
    seen >= 0 &&
    (cells.slice(seen).every((c) => Math.floor(c / w) === ty) ||
      cells.slice(seen).every((c) => c % w === tx));
  // The smallest loop of squares has four.
  const closing = seen === 0 && rules.loops && cells.length >= 4;
  if (retreats || (seen >= 0 && !closing)) {
    if (retreats || drag.keyboard) cells.length = seen + 1;
    // Back on its first square, the drag may set off another way.
    if (cells.length === 1) drag.replaces = null;
    return;
  }
  if (lx !== tx && ly !== ty) return;
  const step = lx === tx ? (ty > ly ? w : -w) : tx > lx ? 1 : -1;
  drag.replaces ??= rules.restarts?.(state, cells[0], cells[0] + step) ?? [];
  const view = seenBy(rules, drag);
  for (let at = last; at !== to; ) {
    const next = at + step;
    if (cells.includes(next) && !(closing && next === to)) break;
    // Judged on the board as the drag would leave it with this step, since
    // a step that lays a line keeps the lines the drag has passed.
    const e = edgeBetween(g, at, next);
    if (view.mark(state, e) === CROSS) break;
    const marks = marksOf(view, state);
    const froms = fromsOf(view, state, marks);
    applyChanges(marks, froms, dragChanges(view, state, [...cells, next]));
    if ([at, next].some((i) => linesAt(state, marks, i) > view.takes(state, i))) break;
    if (view.directed && !directedFits(state, marks, froms, [at, next])) break;
    cells.push(next);
    at = next;
  }
  // A loop that cannot close is a drag back onto its first square.
  if (closing && drag.keyboard && cells[cells.length - 1] !== to) cells.length = 1;
  if (cells.length === 1) drag.replaces = null;
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
  /** `Game.clearMistakes` for the edges `edges`: each one opened, in one move. */
  clearEdges(state: S, edges: readonly number[]): M[];
  /** `Game.revealOne`: the first line of `solved` that `state` does not draw,
   * or draws the other way round. The crosses are the player's notes, never
   * an element of the answer. */
  revealLine(state: S, solved: S): M | null;
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

  const fixed = (state: S, e: number): boolean => rules.fixed?.(state, e) ?? false;

  /** The first of `changes` that fits, as a move, or `null`. */
  const firstFitting = (state: S, changes: readonly EdgeChange[]): M | null => {
    const change = changes.find((c) => lineFits(rules, state, c));
    return change ? moveOf(state, [change]) : null;
  };

  /**
   * A click on edge `e`: a line, or the line taken off it. In a directed game
   * a line laid beside a run's end carries the run on, and one laid beside a
   * run's first square joins onto its front; anywhere else it points right
   * or down. A click on a line that points right or down turns it round
   * where it fits so; otherwise the click takes the line up.
   */
  const clickLine = (state: S, e: number): M | null => {
    if (fixed(state, e)) return null;
    const { directed } = rules;
    const g = edges(state);
    const [a, b] = [g.a[e], g.b[e]];
    const off: EdgeChange = { edge: e, mark: OPEN };
    if (rules.mark(state, e) === LINE) {
      if (!directed || directed.from(state, e) !== a) return moveOf(state, [off]);
      return firstFitting(state, [{ edge: e, mark: LINE, from: b }, off]);
    }
    if (!directed) return firstFitting(state, [{ edge: e, mark: LINE }]);
    const runs = (i: number, out: boolean): boolean =>
      [0, 1, 2, 3].some((d) => {
        const f = g.around[i * 4 + d];
        return (
          f >= 0 &&
          rules.mark(state, f) === LINE &&
          (directed.from(state, f) === i) === out
        );
      });
    // A run's end has a line in and none out; its first square the reverse.
    const end = (i: number) => runs(i, false) && !runs(i, true);
    const start = (i: number) => runs(i, true) && !runs(i, false);
    const line = (from: number): EdgeChange => ({ edge: e, mark: LINE, from });
    const ways = [
      ...[a, b].filter(end).map(line),
      ...[a, b].filter(start).map((i) => line(i === a ? b : a)),
      line(a),
      line(b),
    ];
    return firstFitting(state, ways);
  };

  /** Ctrl+arrow on edge `e` from the cursor's square `i`: the line taken up,
   * or one laid, running from `i` in a directed game. */
  const keyLine = (state: S, e: number, i: number): M | null => {
    if (fixed(state, e)) return null;
    if (rules.mark(state, e) === LINE) return moveOf(state, [{ edge: e, mark: OPEN }]);
    return firstFitting(state, [
      rules.directed ? { edge: e, mark: LINE, from: i } : { edge: e, mark: LINE },
    ]);
  };

  /** A cross on edge `e`, or the cross taken off it: nothing on a line. */
  const toggleCross = (state: S, e: number): M | null => {
    const mark = rules.mark(state, e);
    if (mark === LINE || fixed(state, e)) return null;
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
      ui.drag = i < 0 ? null : { cells: [i], keyboard: false, at: p, replaces: null };
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
        return moveOf(state, dragPreview(rules, state, drag)) ?? UI_UPDATE;
      // A press released where it began is a click on the edge it was aimed
      // at, which is more controllable than where it was released.
      const e = drag.at ? aimedEdge(state, ds, drag.at) : null;
      return (e !== null ? clickLine(state, e) : null) ?? UI_UPDATE;
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
        const move = keyLine(state, e, ui.cursor.y * state.w + ui.cursor.x);
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
        const drag = ui.drag;
        ui.drag = null;
        return moveOf(state, dragPreview(rules, state, drag)) ?? UI_UPDATE;
      }
      const i = ui.cursor.y * state.w + ui.cursor.x;
      ui.drag = {
        cells: [i],
        keyboard: true,
        at: null,
        replaces: null,
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

  // A directed line is a drag from its square, which a click may lay the
  // other way round.
  const hintGesture = (
    state: S,
    ds: D,
    changes: readonly EdgeChange[],
  ): readonly PointerAction[] =>
    changes.map(({ edge, mark, from }) => {
      const g = edges(state);
      const layout = input.layout(ds);
      if (mark === LINE && from !== undefined) {
        const to = g.a[edge] === from ? g.b[edge] : g.a[edge];
        return dragGesture(squareCenter(g, layout, from), squareCenter(g, layout, to));
      }
      return click(
        pointAtEdge(g, layout, edge),
        mark === LINE ? "primary" : "secondary",
      );
    });

  const clearEdges = (state: S, cleared: readonly number[]): M[] => {
    const move = moveOf(
      state,
      cleared.filter((e) => !fixed(state, e)).map((edge) => ({ edge, mark: OPEN })),
    );
    return move === null ? [] : [move];
  };

  const revealLine = (state: S, solved: S): M | null => {
    for (let e = 0; e < edges(state).edgeCount; e++) {
      if (rules.mark(solved, e) !== LINE) continue;
      const from = rules.directed?.from(solved, e);
      if (rules.mark(state, e) === LINE && from === rules.directed?.from(state, e))
        continue;
      return moveOf(state, [
        from === undefined ? { edge: e, mark: LINE } : { edge: e, mark: LINE, from },
      ]);
    }
    return null;
  };

  return { interpretMove, crossDrag, hintGesture, clearEdges, revealLine };
}
