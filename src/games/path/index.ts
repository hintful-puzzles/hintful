/**
 * Path (Numberlink): join each pair of like numbers with a line, so that
 * lines never cross or branch and every square has a line through it.
 *
 * This file is the `Game` object and the glue around it: the input, the
 * answer, the hint's gesture. The rules a line obeys are in
 * [`solver.ts`](./solver.ts), and the board in [`state.ts`](./state.ts).
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { click, type PointerAction } from "../../engine/hint-gesture.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  hideCursor,
  isCancelKey,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
  moveCursor,
  newCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  showCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  directionOf,
  edgeAt,
  edgeMiddle,
  pointAtEdge,
  squareEdges,
} from "../../engine/square-edges.ts";
import {
  beginSweep,
  dragMarkVerbs,
  endSweep,
  sweepOpen,
  sweepTo,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newPathDesc } from "./generator.ts";
import { type PathHighlights, pathHint, pathKeepTrack } from "./hint.ts";
import { dragChanges, type EdgeChange, extendDrag, lineFits } from "./moves.ts";
import {
  cellAt,
  colors,
  computeSize,
  layout,
  newDrawState,
  type PathDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  isComplete,
  PATH_RUNGS,
  PathBoard,
  type PathRung,
  solvePath,
} from "./solver.ts";
import {
  CROSS,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  LINE,
  newState,
  OPEN,
  type PathMove,
  type PathParams,
  type PathState,
  type PathUi,
  paramConfig,
  presets,
  textFormat,
  validateParams,
} from "./state.ts";

/** An edge marked against the answer: a line the answer does not have, or a
 * cross on one it does. */
export interface PathMistake {
  edge: number;
}

function newUi(_state: PathState): PathUi {
  return { cursor: newCursor(), drag: null };
}

// --- input ------------------------------------------------------------------

/** A move making `changes`, or `null` where there are none. */
const moveOf = (changes: readonly EdgeChange[]): PathMove | null =>
  changes.length > 0 ? { kind: "edges", changes } : null;

/** A line on edge `e`, or the line taken off it: nothing on a cross, or
 * where a square would have more lines than it takes. */
function toggleLine(state: PathState, e: number): PathMove | null {
  if (state.edges[e] === LINE) return moveOf([{ edge: e, mark: OPEN }]);
  if (!lineFits(state, state.edges, e)) return null;
  return moveOf([{ edge: e, mark: LINE }]);
}

/** A cross on edge `e`, or the cross taken off it: nothing on a line. */
function toggleCross(state: PathState, e: number): PathMove | null {
  if (state.edges[e] === LINE) return null;
  return moveOf([{ edge: e, mark: state.edges[e] === CROSS ? OPEN : CROSS }]);
}

/**
 * The right button's drag: the cross on every edge the pointer passes,
 * through the engine's sweep, so the drag is one step of Undo. The left
 * button's drag is the line, `interpretMove`'s own.
 */
export const crossDrag = dragMarkVerbs<
  PathState,
  PathUi,
  PathDrawState,
  number,
  PathMove
>({
  noun: "edge",
  button: "secondary",
  target: (state, ds, p) => aimedEdge(state, ds.tileSize, p),
  apply: toggleCross,
  pointAt: (state, ds, e) =>
    pointAtEdge(squareEdges(state.w, state.h), layout(ds.tileSize), e),
  sweep: {
    holds: (state, e) => state.edges[e],
    within: (ds) => ds.tileSize * 0.3,
    middle: (ds, state, e) =>
      edgeMiddle(squareEdges(state.w, state.h), layout(ds.tileSize), e),
  },
});

/** The edge a press at `p` is aimed at, or `null` near a square's middle. */
const aimedEdge = (state: PathState, ts: number, p: Point): number | null =>
  edgeAt(squareEdges(state.w, state.h), layout(ts), p);

/** The edge beside the cursor's square in the direction an arrow points, or
 * `null` past the board's side. */
function edgeFromCursor(state: PathState, ui: PathUi, button: number): number | null {
  const d = cursorDelta(button);
  if (!d) return null;
  const { x, y } = ui.cursor;
  const e = squareEdges(state.w, state.h).around[
    (y * state.w + x) * 4 + directionOf(d.dx, d.dy)
  ];
  return e >= 0 ? e : null;
}

function interpretMove(
  state: PathState,
  ui: PathUi,
  ds: PathDrawState,
  p: Point,
  rawButton: number,
): PathMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;

  if (button === LEFT_BUTTON) {
    hideCursor(ui.cursor);
    const i = cellAt(state, ts, p);
    ui.drag = i < 0 ? null : { cells: [i], keyboard: false, at: p };
    return UI_UPDATE;
  }
  if (button === RIGHT_BUTTON) {
    hideCursor(ui.cursor);
    ui.drag = null;
    const e = aimedEdge(state, ts, p);
    if (e !== null) beginSweep(crossDrag, state, ui, e, button, p, false);
    return UI_UPDATE;
  }
  if (button === LEFT_DRAG) {
    if (!ui.drag || ui.drag.keyboard) return null;
    const i = cellAt(state, ts, p);
    if (i >= 0) extendDrag(state, ui.drag, i);
    return UI_UPDATE;
  }
  if (button === RIGHT_DRAG)
    return sweepOpen(ui) ? sweepTo(crossDrag, state, ui, ds, p) : null;
  if (button === LEFT_RELEASE) {
    const drag = ui.drag;
    if (!drag || drag.keyboard) return null;
    ui.drag = null;
    if (drag.cells.length > 1)
      return moveOf(dragChanges(state, drag.cells)) ?? UI_UPDATE;
    // A press released where it began is a click on the edge it was aimed
    // at.
    const e = drag.at ? aimedEdge(state, ts, drag.at) : null;
    return (e !== null ? toggleLine(state, e) : null) ?? UI_UPDATE;
  }
  if (button === RIGHT_RELEASE) {
    // A cross drag made its moves as it went; its release is not a click.
    if (endSweep(ui)) return UI_UPDATE;
    const e = aimedEdge(state, ts, p);
    return (e !== null ? toggleCross(state, e) : null) ?? UI_UPDATE;
  }

  if (isCursorMove(button)) {
    // A modified arrow marks an edge, which is too much to do to a player who
    // cannot yet see where the cursor is, so that one only reveals.
    if (rawButton & (MOD_SHFT | MOD_CTRL)) {
      if (showCursor(ui.cursor)) return UI_UPDATE;
      const e = edgeFromCursor(state, ui, button);
      if (e === null) return null;
      if (rawButton & MOD_SHFT) return toggleCross(state, e);
      const move = toggleLine(state, e);
      if (move) moveCursor(ui.cursor, button, state.w, state.h);
      return move;
    }
    if (!moveCursor(ui.cursor, button, state.w, state.h)) return null;
    if (ui.drag?.keyboard)
      extendDrag(state, ui.drag, ui.cursor.y * state.w + ui.cursor.x);
    return UI_UPDATE;
  }
  if (button === CURSOR_SELECT) {
    if (showCursor(ui.cursor)) return UI_UPDATE;
    if (ui.drag?.keyboard) {
      const { cells } = ui.drag;
      ui.drag = null;
      return moveOf(dragChanges(state, cells)) ?? UI_UPDATE;
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

// --- the answer -------------------------------------------------------------

function status(s: PathState): GameStatus {
  return isComplete(s.w, s.h, s.ends, s.edges) ? "solved" : "ongoing";
}

function solve(orig: PathState): SolveResult<PathMove> {
  const edges = answerOf(orig.w, orig.h, orig.ends);
  if (edges === null) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solve", edges } };
}

/** The lines the answer does not have, and the crosses on lines it does. An
 * open edge is never one, and neither is any edge of a board the ladder
 * cannot finish, which has no answer to compare with. */
function findMistakes(state: PathState): readonly PathMistake[] {
  const answer = answerOf(state.w, state.h, state.ends);
  if (answer === null) return [];
  const out: PathMistake[] = [];
  state.edges.forEach((mark, edge) => {
    if (mark === LINE && answer[edge] !== LINE) out.push({ edge });
    if (mark === CROSS && answer[edge] === LINE) out.push({ edge });
  });
  return out;
}

const difficulty: DifficultyContract<PathParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return solvePath(new PathBoard(s.w, s.h, s.ends, s.edges), cap);
  },
};

// --- the hint's gesture -----------------------------------------------------

/** A click on each edge the step decides: the left button for a line, the
 * right for a cross. */
function hintGesture(
  state: PathState,
  _ui: PathUi,
  ds: PathDrawState,
  move: PathMove,
): readonly PointerAction[] {
  if (move.kind !== "edges") return [];
  return move.changes.map(({ edge, mark }) =>
    click(
      pointAtEdge(squareEdges(state.w, state.h), layout(ds.tileSize), edge),
      mark === LINE ? "primary" : "secondary",
    ),
  );
}

export const pathGame: Game<
  PathParams,
  PathState,
  PathMove,
  PathUi,
  PathDrawState,
  PathMistake,
  PathHighlights,
  PathRung
> = {
  id: "path",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newPathDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  textFormat,

  hint: pathHint,
  hintRungs: PATH_RUNGS,
  hintMarks: {
    roles: {
      ring: "the edges the step decides, drawn as the line or cross it asks for.",
      outline:
        "the squares it reasons from, and the edges a supposed line or cross would force, numbered in the order they follow.",
    },
  },
  hintKeepTrack: pathKeepTrack,
  hintGesture,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(pathGame);
