/**
 * Tracks (Train Tracks): native TS port of `tracks.c`. Lay one continuous
 * train track from the entrance (A, left edge) to the exit (B, bottom edge)
 * of a `w × h` grid, using only straight and curved rails that never cross or
 * loop, so every row/column clue counts the track-bearing cells in it.
 *
 * Left-drag lays track along a straight run; right-drag lays "no track". A
 * click near a cell center toggles the square; near an edge toggles that
 * edge. The keyboard cursor walks a half-grid that addresses the same squares
 * and edges, so the declared verbs serve both.
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  endDrag,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  moveDrag,
  newCursor,
  newDrag,
  RIGHT_BUTTON,
  showCursor,
  startDrag,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  buttonVerb,
  interpretTargetVerbs,
  pressTarget,
  type TargetGeometry,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import { tracksHint, tracksKeepTrack } from "./hint.ts";
import {
  copyAndApplyDrag,
  executeMove,
  moveDiff,
  uiCanFlipEdge,
  uiCanFlipSquare,
} from "./moves.ts";
import {
  centeredCoord,
  colors,
  computeSize,
  FLASH_TIME,
  metrics,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type TracksDrawState,
} from "./render.ts";
import { copyAndStrip, tracksSolve } from "./solver.ts";
import {
  type Board,
  D,
  DIFF_COUNT,
  DX,
  DY,
  decodeParams,
  defaultParams,
  E_NOTRACK,
  E_TRACK,
  encodeParams,
  inGrid,
  L,
  newState,
  paramConfig,
  presets,
  R,
  S_NOTRACK,
  S_TRACK,
  sEDirs,
  sEFlags,
  stateToBoard,
  status,
  type TracksMove,
  type TracksParams,
  type TracksState,
  type TracksUi,
  textFormat,
  U,
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: TracksState): TracksUi {
  return {
    drag: newDrag(),
    painting: false,
    clearing: false,
    notrack: false,
    clickx: 0,
    clicky: 0,
    cursor: newCursor(1, 1),
  };
}

/** A single square-flip move (upstream `square_flip_str`: a toggle). */
function squareFlipMove(b: Board, x: number, y: number, notrack: boolean): TracksMove {
  const sf = b.sflags[y * b.w + x];
  const set = notrack ? !(sf & S_NOTRACK) : !(sf & S_TRACK);
  return { ops: [{ kind: "square", x, y, track: !notrack, set }] };
}

/** A single edge-flip move (upstream `edge_flip_str`: a toggle). */
function edgeFlipMove(
  b: Board,
  x: number,
  y: number,
  dir: number,
  notrack: boolean,
): TracksMove {
  const ef = sEFlags(b, x, y, dir);
  const set = notrack ? !(ef & E_NOTRACK) : !(ef & E_TRACK);
  return { ops: [{ kind: "edge", x, y, dir, track: !notrack, set }] };
}

/** Constrain an in-progress drag to a single straight row or column
 * (upstream `update_ui_drag`).
 *
 * Deliberate divergence from upstream: when the pointer drifts to neither the
 * start row nor the start column (the common touch case of wandering off the
 * grid mid-drag), upstream reset the paint to the start cell and dropped
 * `dragging`, throwing the whole gesture away. Here the last valid extent stays
 * frozen, so a stray excursion out of bounds does not invalidate the paint; the
 * drag resumes when the finger returns to the start row/column, and the only
 * way to cancel is to drag back to the start cell (or paint and undo). */
function updateUiDrag(state: TracksState, ui: TracksUi, gx: number, gy: number): void {
  const { w, h } = state;
  if (gy === ui.drag.sy) {
    moveDrag(ui.drag, gx < 0 ? 0 : gx >= w ? w - 1 : gx, ui.drag.sy);
    ui.painting = true;
  } else if (gx === ui.drag.sx) {
    moveDrag(ui.drag, ui.drag.sx, gy < 0 ? 0 : gy >= h ? h - 1 : gy);
    ui.painting = true;
  }
}

/** What a half-grid position addresses: a square (both coordinates odd), the
 * edge on a square's left or top (one even), or nothing — a corner, or an edge
 * on the grid's rim, which no track can cross. */
type Spot =
  | { readonly kind: "square"; readonly x: number; readonly y: number }
  | {
      readonly kind: "edge";
      readonly x: number;
      readonly y: number;
      readonly dir: number;
    };

function spotAt(state: TracksState, t: Point): Spot | null {
  const { w, h } = state;
  const xOdd = t.x % 2 === 1;
  const yOdd = t.y % 2 === 1;
  if (xOdd && yOdd) {
    const x = (t.x - 1) / 2;
    const y = (t.y - 1) / 2;
    return inGrid(state, x, y) ? { kind: "square", x, y } : null;
  }
  if (!xOdd && yOdd) {
    const x = t.x / 2;
    const y = (t.y - 1) / 2;
    return x > 0 && x < w && y >= 0 && y < h ? { kind: "edge", x, y, dir: L } : null;
  }
  if (xOdd && !yOdd) {
    const x = (t.x - 1) / 2;
    const y = t.y / 2;
    return y > 0 && y < h && x >= 0 && x < w ? { kind: "edge", x, y, dir: U } : null;
  }
  return null;
}

/** A verb flipping the track (or, with `notrack`, the no-track cross) of the
 * square or edge at `t`, where the board allows it. */
const flipAt =
  (notrack: boolean) =>
  (state: TracksState, t: Point): TracksMove | null => {
    const spot = spotAt(state, t);
    if (!spot) return null;
    const board = stateToBoard(state);
    if (spot.kind === "square")
      return uiCanFlipSquare(board, spot.x, spot.y, notrack)
        ? squareFlipMove(board, spot.x, spot.y, notrack)
        : null;
    return uiCanFlipEdge(board, spot.x, spot.y, spot.dir, notrack)
      ? edgeFlipMove(board, spot.x, spot.y, spot.dir, notrack)
      : null;
  };

type TracksVerb = TargetVerb<TracksState, TracksUi, Point, TracksMove>;
const trackVerb: TracksVerb = {
  does:
    "lay track there: on an edge, a segment joining the two squares; in a square, " +
    "a mark that it holds track, even before you know which edges it crosses. " +
    "Click it again to take the track away",
  apply: flipAt(false),
};
const noTrackVerb: TracksVerb = {
  does: "cross it out, as holding no track, or take the cross away again",
  apply: flipAt(true),
};

/** Squares and the edges between them, on the cursor's half-grid: a square
 * at odd coordinates, an edge where one is even. A press near a square's
 * middle addresses the square, and elsewhere the edge on the side it is
 * nearest. */
const geometry: TargetGeometry<TracksState, TracksUi, TracksDrawState, Point> = {
  noun: "square or edge",
  pointerTarget(state, ds, p) {
    const m = metrics(ds.tileSize);
    const gx = gridCoord(p.x, m);
    const gy = gridCoord(p.y, m);
    if (!inGrid(state, gx, gy)) return null;
    const cx = centeredCoord(gx, m);
    const cy = centeredCoord(gy, m);
    if (Math.max(Math.abs(p.x - cx), Math.abs(p.y - cy)) < m.tile / 4)
      return { x: 2 * gx + 1, y: 2 * gy + 1 };
    const dir =
      Math.abs(p.x - cx) < Math.abs(p.y - cy) ? (p.y < cy ? U : D) : p.x < cx ? L : R;
    const t = { x: 2 * gx + 1 + DX(dir), y: 2 * gy + 1 + DY(dir) };
    return spotAt(state, t) ? t : null;
  },
  pointAt(state, ds, t) {
    const m = metrics(ds.tileSize);
    const spot = spotAt(state, t);
    const dir = spot?.kind === "edge" ? spot.dir : 0;
    const reach = Math.floor((3 * m.tile) / 8);
    const x = spot ? spot.x : 0;
    const y = spot ? spot.y : 0;
    return {
      x: centeredCoord(x, m) + reach * DX(dir),
      y: centeredCoord(y, m) + reach * DY(dir),
    };
  },
  cursorTarget: (state, ui) =>
    spotAt(state, ui.cursor) ? { x: ui.cursor.x, y: ui.cursor.y } : null,
  parkCursor(ui, t) {
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
  },
  moveCursor(state, ui, button) {
    const dx = button === CURSOR_LEFT ? -1 : button === CURSOR_RIGHT ? 1 : 0;
    const dy = button === CURSOR_DOWN ? 1 : button === CURSOR_UP ? -1 : 0;
    const before = `${ui.cursor.x},${ui.cursor.y},${ui.cursor.visible}`;
    showCursor(ui.cursor);
    ui.cursor.x += dx;
    ui.cursor.y += dy;
    if (ui.cursor.x % 2 === 0 && ui.cursor.y % 2 === 0) {
      // Skip square corners: only centers and edges are selectable.
      ui.cursor.x += dx;
      ui.cursor.y += dy;
    }
    ui.cursor.x = Math.min(Math.max(ui.cursor.x, 1), 2 * state.w - 1);
    ui.cursor.y = Math.min(Math.max(ui.cursor.y, 1), 2 * state.h - 1);
    return `${ui.cursor.x},${ui.cursor.y},${ui.cursor.visible}` !== before;
  },
};

const targetVerbs: TargetVerbs<
  TracksState,
  TracksUi,
  TracksDrawState,
  Point,
  TracksMove
> = { geometry, primary: trackVerb, secondary: noTrackVerb };

/** The square a pixel falls in along one axis, `-1` in the top/left border
 * (the clues sit a whole tile in, hence the `- 1`). */
function gridCoord(px: number, m: ReturnType<typeof metrics>): number {
  return px < m.border ? -1 : Math.floor((px - m.border) / m.tile) - 1;
}

function interpretMove(
  state: TracksState,
  ui: TracksUi,
  ds: TracksDrawState,
  p: Point,
  rawButton: number,
): TracksMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const { w } = state;
  const m = metrics(ds.tileSize);
  const board = stateToBoard(state);
  const gx = gridCoord(p.x, m);
  const gy = gridCoord(p.y, m);

  if (isMouseDown(button)) {
    ui.cursor.visible = false;
    ui.painting = false;
    if (!inGrid(state, gx, gy)) {
      endDrag(ui.drag);
      return null;
    }
    if (button === RIGHT_BUTTON) {
      ui.notrack = true;
      ui.clearing = (state.sflags[gy * w + gx] & S_NOTRACK) !== 0;
    } else {
      ui.notrack = false;
      ui.clearing = (state.sflags[gy * w + gx] & S_TRACK) !== 0;
    }
    ui.clickx = p.x;
    ui.clicky = p.y;
    startDrag(ui.drag, gx, gy);
    const aimed = geometry.pointerTarget(state, ds, p, ui);
    if (aimed) pressTarget(targetVerbs, ui, aimed);
    return UI_UPDATE;
  }

  if (isMouseDrag(button)) {
    ui.cursor.visible = false;
    updateUiDrag(state, ui, gx, gy);
    return UI_UPDATE;
  }

  if (isMouseRelease(button)) {
    ui.cursor.visible = false;
    const { sx, sy, ex, ey } = ui.drag;
    // The whole release is gated on `drag.live`: the engine ends a live drag
    // when the board changes under it, and the click path below — which flips a
    // square or lays a track segment from the remembered press point — would
    // otherwise commit a move on a board that no longer exists.
    if (!ui.drag.live) {
      ui.painting = false;
      return UI_UPDATE;
    }
    if (ui.painting && (sx !== ex || sy !== ey)) {
      const dragged = copyAndApplyDrag(board, ui);
      const move = moveDiff(board, dragged, false);
      ui.painting = false;
      endDrag(ui.drag);
      return move.ops.length > 0 ? move : null;
    }
    ui.painting = false;
    endDrag(ui.drag);
    // A release in the square it pressed is a click there, on what the press
    // aimed at: its button's verb.
    const pressed = { x: ui.clickx, y: ui.clicky };
    if (gridCoord(pressed.x, m) !== gx || gridCoord(pressed.y, m) !== gy)
      return UI_UPDATE;
    const target = geometry.pointerTarget(state, ds, pressed, ui);
    if (!target) return UI_UPDATE;
    return buttonVerb(targetVerbs, button)?.apply(state, target, ui) ?? UI_UPDATE;
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

function solve(
  orig: TracksState,
  curr: TracksState,
  _aux?: string,
): SolveResult<TracksMove> {
  const before = stateToBoard(curr);
  let solved = stateToBoard(curr);
  let r = tracksSolve(solved, DIFF_COUNT);
  if (r.ret < 1) {
    solved = stateToBoard(orig);
    r = tracksSolve(solved, DIFF_COUNT);
  }
  if (r.ret < 1) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  return { ok: true, move: moveDiff(before, solved, true) };
}

/** Boards are uniquely solvable: re-solve from the clues and flag every
 * player mark (square or edge) that contradicts the unique solution. A
 * non-uniquely-solvable board degrades to "no detectable mistakes". */
function findMistakes(state: TracksState): readonly Point[] {
  const { w, h } = state;
  const board = stateToBoard(state);
  const strip = copyAndStrip(board, -1);
  if (tracksSolve(strip, DIFF_COUNT).ret < 1) return [];
  const out: Point[] = [];
  for (let i = 0; i < w * h; i++) {
    const x = i % w;
    const y = Math.floor(i / w);
    const solTrack = (strip.sflags[i] & S_TRACK) !== 0;
    const solEdges = sEDirs(strip, x, y, E_TRACK);
    const wrong =
      state.sflags[i] & (solTrack ? S_NOTRACK : S_TRACK) ||
      sEDirs(board, x, y, E_TRACK) & ~solEdges || // a track edge that shouldn't be
      sEDirs(board, x, y, E_NOTRACK) & solEdges; // a no-track edge that should be track
    if (wrong) out.push({ x, y });
  }
  return out;
}

/** Tracks' difficulty contract (`engine/difficulty.ts`); `stateToBoard` on the
 * initial state gives the clue-only board. */
const difficulty: DifficultyContract<TracksParams> = {
  solveAtCap: (p, desc, cap) => {
    const { ret } = tracksSolve(stateToBoard(newState(p, desc)), cap);
    return ret === 1 ? "solved" : ret < 0 ? "impossible" : "unsolved";
  },
};

export const tracksGame: Game<
  TracksParams,
  TracksState,
  TracksMove,
  TracksUi,
  TracksDrawState,
  Point
> = {
  id: "tracks",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc,
  validateDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  hint: tracksHint,
  hintMarks: {
    roles: {
      ring: "what the step decides, in the hint color: a ring round a square means that square is settled (with a cross in it as well, it must be empty; a ring on its own means it must carry track, though not yet which way); a short pair of rail ends poking through a side means the track must cross that side, and a cross on a side means it must not.",
      outline:
        "what the step reasons from, in a second color: an outline round the squares it counts, a short bar on a side whose state is part of the argument, and the clue number it counts with, recolored in the margin.",
      stripes:
        "the row or column the sentence calls “this row” or “this column”, striped through its clue, or the closed block a sentence about crossings is about.",
    },
  },
  hintKeepTrack: tracksKeepTrack,
  // One click per op, on its square or edge of the half-grid.
  hintGesture(state, ui, ds, m, step) {
    const targets = m.ops.map((op) => {
      const dir = op.kind === "edge" ? (op.dir ?? 0) : 0;
      return { x: 2 * op.x + 1 + DX(dir), y: 2 * op.y + 1 + DY(dir) };
    });
    return verbClicks(
      targetVerbs,
      { executeMove, hintKeepTrack: tracksKeepTrack },
      state,
      ui,
      ds,
      step,
      targets,
    );
  },

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  solvedFlash: () => FLASH_TIME,
};

registerGame(tracksGame);
