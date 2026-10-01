/**
 * Rectangles (`rect.c`) — native TS port. Divide a `w × h` grid into
 * rectangles so that every rectangle contains exactly one numbered square and
 * its area equals that number.
 *
 * Left-drag draws a rectangle outline; right-drag erases interior edges; a
 * click near an edge toggles that single edge; a half-grid keyboard cursor
 * supports press-to-drag. `coord_round`'s corner/center/edge click allocation
 * is ported exactly. A drag or click that changes nothing produces no move.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { completionStatus } from "../../engine/completion-status.ts";
import { winFlash } from "../../engine/flash.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { click, drag, type PointerAction } from "../../engine/hint-gesture.ts";
import {
  atof,
  dimensionParamConfig,
  formatG,
  transposeDimensions,
} from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  endDrag,
  isCancelKey,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  moveCursor,
  moveDrag,
  newCursor,
  newDrag,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  startDrag,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import { type RectHint, rectHint, rectKeepTrack, rectRefreshStep } from "./hint.ts";
import {
  executeMove,
  gridDrawRect,
  hrange,
  newState,
  status,
  textFormat,
  vrange,
} from "./moves.ts";
import {
  BORDER,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { type NumberData, rectSolver, SOLVE_UNIQUE } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  presets,
  type RectDrawState,
  type RectMistake,
  type RectMove,
  type RectParams,
  type RectState,
  type RectUi,
  validateDesc,
  validateParams,
} from "./state.ts";

const CORNER_TOLERANCE = 0.15;
const CENTER_TOLERANCE = 0.15;

/** Map a fractional grid coordinate to the half-grid space (0..2w, 0..2h),
 * allocating the click to a corner, a cell center, or an edge exactly as
 * upstream `coord_round`. `(int)` casts are `Math.trunc`; `floor()` is
 * `Math.floor`. */
function coordRound(x: number, y: number): [number, number] {
  const xs = Math.floor(x) + 0.5;
  const ys = Math.floor(y) + 0.5;
  const xv = Math.floor(x + 0.5);
  const yv = Math.floor(y + 0.5);

  let dx = Math.abs(x - xv);
  let dy = Math.abs(y - yv);
  if (Math.max(dx, dy) < CORNER_TOLERANCE) return [2 * xv, 2 * yv];
  dx = Math.abs(x - xs);
  dy = Math.abs(y - ys);
  if (Math.max(dx, dy) < CENTER_TOLERANCE) {
    return [1 + 2 * Math.trunc(xs), 1 + 2 * Math.trunc(ys)];
  }
  // Vertical edge: x-coord of corner, y-coord of square center.
  if (dx > dy) return [2 * xv, 1 + 2 * Math.floor(ys)];
  // Horizontal edge: x-coord of square center, y-coord of corner.
  return [1 + 2 * Math.floor(xs), 2 * yv];
}

function newUi(_state: RectState): RectUi {
  return {
    drag: newDrag(),
    dragged: false,
    erasing: false,
    x1: -1,
    y1: -1,
    x2: -1,
    y2: -1,
    cursor: newCursor(),
    cursorDragging: false,
  };
}

function resetUi(ui: RectUi): void {
  endDrag(ui.drag);
  ui.x1 = -1;
  ui.y1 = -1;
  ui.x2 = -1;
  ui.y2 = -1;
  ui.dragged = false;
}

/** Recompute the cell rectangle the current drag spans, or clear it when the
 * pointer is off the board. The half-grid pair halves into cell coordinates:
 * the near edge rounds down, the far edge rounds up. */
function updateDragBox(ui: RectUi, w: number, h: number, xc: number, yc: number): void {
  if (xc < 0 || xc > 2 * w || yc < 0 || yc > 2 * h) {
    ui.x1 = ui.y1 = ui.x2 = ui.y2 = -1;
    return;
  }
  const { sx, sy, ex, ey } = ui.drag;
  const [x1, x2] = sx <= ex ? [sx, ex] : [ex, sx];
  const [y1, y2] = sy <= ey ? [sy, ey] : [ey, sy];
  ui.x1 = Math.floor(x1 / 2);
  ui.x2 = Math.floor((x2 + 1) / 2);
  ui.y1 = Math.floor(y1 / 2);
  ui.y2 = Math.floor((y2 + 1) / 2);
}

function interpretMove(
  state: RectState,
  ui: RectUi,
  ds: RectDrawState,
  p: Point,
  rawButton: number,
): RectMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const { w, h } = state;
  const tile = ds.tileSize;
  const fromCoord = (px: number) => (px - BORDER) / tile;

  let [xc, yc] = coordRound(fromCoord(p.x), fromCoord(p.y));

  let startdrag = false;
  let enddrag = false;
  let active = false;
  let erasing = false;

  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    if (ui.drag.live && ui.cursorDragging) resetUi(ui);
    startdrag = true;
    ui.cursor.visible = false;
    ui.cursorDragging = false;
    active = true;
    erasing = button === RIGHT_BUTTON;
  } else if (button === LEFT_RELEASE || button === RIGHT_RELEASE) {
    if (ui.cursor.visible) {
      ui.cursor.visible = false;
      active = true;
    }
    enddrag = true;
    erasing = button === RIGHT_RELEASE;
  } else if (isCursorMove(button)) {
    const changed = moveCursor(ui.cursor, button, w, h);
    active = true;
    if (!ui.cursorDragging || !changed) return changed ? UI_UPDATE : null;
    [xc, yc] = coordRound(ui.cursor.x + 0.5, ui.cursor.y + 0.5);
  } else if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    // Ignore a keyboard drag start while a mouse drag is in progress.
    if (ui.drag.live && !ui.cursorDragging) return null;
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    [xc, yc] = coordRound(ui.cursor.x + 0.5, ui.cursor.y + 0.5);
    erasing = button === CURSOR_SELECT2;
    if (ui.cursorDragging) {
      ui.cursorDragging = false;
      enddrag = true;
      active = true;
    } else {
      ui.cursorDragging = true;
      startdrag = true;
      active = true;
    }
  } else if (isCancelKey(button)) {
    if (!ui.cursorDragging) {
      ui.cursor.visible = false;
    } else {
      resetUi(ui);
      ui.cursorDragging = false;
    }
    return UI_UPDATE;
  } else if (button !== LEFT_DRAG && button !== RIGHT_DRAG) {
    return null;
  }

  // The press anchors both ends and leaves `dragged` false, which is what keeps
  // a bare click an edge toggle rather than a 1×1 rectangle. An event that
  // actually moves the near end promotes it — `moveDrag` reports exactly that,
  // which is why no "has the far end been set yet" sentinel is needed.
  //
  // The box is computed only on a move: every reader of it is gated on
  // `dragged`, so computing it at the press would be writing a value nothing
  // can read. (The version this replaced did compute it there, as a side effect
  // of sharing one block with the move path.)
  if (startdrag && xc >= 0 && xc <= 2 * w && yc >= 0 && yc <= 2 * h) {
    startDrag(ui.drag, xc, yc);
    ui.dragged = false;
    ui.erasing = erasing;
    active = true;
  } else if (moveDrag(ui.drag, xc, yc)) {
    ui.dragged = true;
    updateDragBox(ui, w, h, xc, yc);
    active = true;
  }

  let ret: RectMove | null = null;

  if (enddrag && ui.drag.live) {
    if (xc >= 0 && xc <= 2 * w && yc >= 0 && yc <= 2 * h && erasing === ui.erasing) {
      if (ui.dragged) {
        // Only emit if the rectangle would actually change something.
        if (
          gridDrawRect(
            w,
            h,
            state.hedge,
            state.vedge,
            1,
            false,
            !ui.erasing,
            ui.x1,
            ui.y1,
            ui.x2,
            ui.y2,
          )
        ) {
          ret = {
            type: "rect",
            erasing: ui.erasing,
            x: ui.x1,
            y: ui.y1,
            w: ui.x2 - ui.x1,
            h: ui.y2 - ui.y1,
          };
        }
      } else {
        const cx = Math.floor(xc / 2);
        const cy = Math.floor(yc / 2);
        if (xc & 1 && !(yc & 1) && hrange(w, h, cx, cy)) {
          ret = { type: "edge", edge: "h", x: cx, y: cy };
        }
        if (yc & 1 && !(xc & 1) && vrange(w, h, cx, cy)) {
          ret = { type: "edge", edge: "v", x: cx, y: cy };
        }
      }
    }
    resetUi(ui);
    active = true;
  }

  if (ret) return ret;
  if (active) return UI_UPDATE;
  return null;
}

/**
 * A line is a click on the middle of its edge. A rectangle is a drag from its
 * top-left corner to its bottom-right one: corner to corner addresses a single
 * square too, where a drag between two centers would be a click on one.
 */
function hintGesture(
  _state: RectState,
  _ui: RectUi,
  ds: RectDrawState,
  m: RectMove,
): readonly PointerAction[] {
  const tile = ds.tileSize;
  const at = (x: number, y: number): Point => ({
    x: BORDER + x * tile,
    y: BORDER + y * tile,
  });
  switch (m.type) {
    case "edge":
      return [click(m.edge === "h" ? at(m.x + 0.5, m.y) : at(m.x, m.y + 0.5))];
    case "rect":
      return [
        drag(at(m.x, m.y), at(m.x + m.w, m.y + m.h), {
          button: m.erasing ? "secondary" : "primary",
        }),
      ];
    case "solve":
      return [];
    default:
      return assertNever(m, "rect hint gesture");
  }
}

/** Parse a generator `aux` (`"S" + vbits + hbits`) into a solve move. */
function auxToMove(w: number, h: number, aux: string): RectMove {
  const vlen = (w - 1) * h;
  return {
    type: "solve",
    vedge: aux.slice(1, 1 + vlen),
    hedge: aux.slice(1 + vlen),
  };
}

/** Run the solver from the fixed numbers. The edges of every rectangle it
 * pins down are written, even when the verdict is not unique. */
function solveFromNumbers({ w, h, grid }: RectState) {
  const nd: NumberData[] = [];
  for (let i = 0; i < w * h; i++) {
    if (grid[i])
      nd.push({
        area: grid[i],
        npoints: 1,
        points: [{ x: i % w, y: Math.floor(i / w) }],
      });
  }
  const hedge = new Uint8Array(w * h);
  const vedge = new Uint8Array(w * h);
  const verdict = rectSolver(w, h, nd, hedge, vedge, null);
  return { hedge, vedge, verdict };
}

function solve(orig: RectState, _curr: RectState, aux?: string): SolveResult<RectMove> {
  const { w, h } = orig;
  if (aux) return { ok: true, move: auxToMove(w, h, aux) };

  const { hedge, vedge } = solveFromNumbers(orig);
  let vbits = "";
  for (let y = 0; y < h; y++)
    for (let x = 1; x < w; x++) vbits += vedge[y * w + x] ? "1" : "0";
  let hbits = "";
  for (let y = 1; y < h; y++)
    for (let x = 0; x < w; x++) hbits += hedge[y * w + x] ? "1" : "0";
  return { ok: true, move: { type: "solve", vedge: vbits, hedge: hbits } };
}

/** Boards are uniquely solvable: re-solve from the numbers and flag every edge
 * the player has drawn that the unique solution does not contain. */
function findMistakes(state: RectState): readonly RectMistake[] {
  const { w, h } = state;
  const { hedge, vedge, verdict } = solveFromNumbers(state);
  if (verdict !== SOLVE_UNIQUE) return [];

  const out: RectMistake[] = [];
  for (let y = 1; y < h; y++)
    for (let x = 0; x < w; x++)
      if (state.hedge[y * w + x] && !hedge[y * w + x]) out.push({ edge: "h", x, y });
  for (let y = 0; y < h; y++)
    for (let x = 1; x < w; x++)
      if (state.vedge[y * w + x] && !vedge[y * w + x]) out.push({ edge: "v", x, y });
  return out;
}

function statusbarText(s: RectState, ui: RectUi): string {
  const words = completionStatus(s.completed, s.cheated);
  if (ui.dragged && ui.x1 >= 0 && ui.y1 >= 0 && ui.x2 >= 0 && ui.y2 >= 0) {
    return `${ui.x2 - ui.x1}x${ui.y2 - ui.y1} ${words}`.trimEnd();
  }
  return words;
}

export const rectGame: Game<
  RectParams,
  RectState,
  RectMove,
  RectUi,
  RectDrawState,
  RectMistake,
  RectHint
> = {
  id: "rect",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<RectParams>({
      doc: "Size of the grid in squares.",
      bounds: { min: 1 },
    }),
    {
      kw: "expansion-factor",
      name: "Expansion factor",
      type: "string",
      doc: "How much the board is stretched after it is built. The generator first divides a smaller grid into rectangles and then widens it to full size by stretching rows and columns at random, so a larger factor gives fewer, larger rectangles. 0 means no stretching.",
      bounds: { min: 0 },
      label: {
        slot: "tail",
        words: (p) =>
          p.expandfactor ? `${Math.round(p.expandfactor * 100)}% expansion` : null,
      },
      get: (p) => formatG(p.expandfactor),
      set: (p, v) => {
        p.expandfactor = Math.fround(atof(v));
      },
    },
    {
      kw: "ensure-unique-solution",
      name: "Ensure unique solution",
      type: "boolean",
      doc: "When enabled, the numbers are placed so the puzzle has exactly one solution. When disabled, the puzzle may have several, and any division that satisfies the numbers counts.",
      label: { slot: "tail", words: (p) => (p.unique ? null : "ambiguous") },
      get: (p) => p.unique,
      set: (p, v) => {
        p.unique = v;
      },
    },
  ],

  newDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve,
  findMistakes,

  hint: rectHint,
  hintMarks: {
    roles: {
      ring: "what the step draws: the rectangle it decides, or the one edge it makes a line.",
      outline:
        "what the step reasons from: a clue that blocks another rectangle, or a square only one clue can reach.",
      stripes:
        "the squares another clue covers wherever its rectangle goes, which no other rectangle can use.",
    },
  },
  hintKeepTrack: rectKeepTrack,
  hintGesture,
  refreshHintStep: rectRefreshStep,

  textFormat,
  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  flashLength: (from, to) => winFlash(from, to, FLASH_TIME),
};

registerGame(rectGame);
