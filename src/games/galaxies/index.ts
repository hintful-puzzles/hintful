/**
 * Galaxies (Tentai Show): divide the grid into regions, each rotationally
 * symmetric about the one dot it contains.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import { BLACK, PURPLE, WHITE } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  DRAG_ADD,
  ERROR,
  givenSurface,
  HINT_EVIDENCE,
  INK,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { galaxiesBlackRegion } from "../../engine/color/palette-games.ts";
import { descValue } from "../../engine/desc-error.ts";
import {
  type DifficultyContract,
  difficultyItem,
  noSuchTier,
  tierNames,
} from "../../engine/difficulty.ts";
import { fromCoord } from "../../engine/geometry.ts";
import { drag, type PointerAction } from "../../engine/hint-gesture.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type ParamConfigItem,
  registerGame,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/index.ts";
import { dimensionParamConfig, transposeDimensions } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  isCursorMove,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  newCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import type { RandomState } from "../../engine/random/index.ts";
import {
  beginSweep,
  buttonVerb,
  endSweep,
  interpretTargetVerbs,
  pressTarget,
  sweepOpen,
  sweepTo,
  type TargetGeometry,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { newGameDesc } from "./generator.ts";
import {
  GALAXIES_RUNGS,
  type GalaxiesHint,
  type GalaxiesRung,
  galaxiesHintSteps,
  outstanding,
  stepSatisfied,
} from "./hint.ts";
import { say } from "./hint-text.ts";
import {
  addAssocWithOpposite,
  legalDotsFor,
  okToAddAssocWithOpposite,
  removeAssocWithOpposite,
} from "./moves.ts";
import {
  borderFor,
  COL_ARROW,
  COL_BACKGROUND,
  COL_BLACKBG,
  COL_BLACKDOT,
  COL_CELL,
  COL_CURSOR,
  COL_DOT_RIM,
  COL_DRAG,
  COL_EDGE,
  COL_GRID,
  COL_HINT,
  COL_HINT_CELL,
  COL_MISTAKE,
  COL_WHITEBG,
  COL_WHITEDOT,
  type GalaxiesDrawState,
  NCOLORS,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { clearForSolve, GalaxiesDiff, solverState } from "./solver.ts";
import {
  addAssoc,
  checkComplete,
  cloneState,
  F_DOT,
  F_DOT_BLACK,
  F_DOT_HOLD,
  F_EDGE_SET,
  F_TILE_ASSOC,
  type GalaxiesState,
  idx,
  inGrid,
  inInterior,
  isVerticalEdge,
  parseDesc,
  rebuildDots,
  removeAssoc,
  SpaceType,
  spaceTypeAt,
  tilesFromEdge,
} from "./state.ts";

const FLASH_TIME = 0.15;

// --- types -----------------------------------------------------------

export interface GalaxiesParams {
  w: number;
  h: number;
  diff: GalaxiesDiff;
}

export type GalaxiesOp =
  | { kind: "edge"; x: number; y: number }
  | { kind: "unassoc"; x: number; y: number }
  | { kind: "hold"; x: number; y: number }
  | { kind: "assoc"; x: number; y: number; ax: number; ay: number };

export interface GalaxiesMove {
  ops: GalaxiesOp[];
  /** True for the solver's move: its ops apply without their 180° partners. */
  solving: boolean;
}

/** A cell flagged by `findMistakes`. `(x, y)` are grid coords: a
 * `"tile"` is a tile center (odd/odd) the player associated with the
 * wrong dot; an `"edge"` is a wall (one even coord) the player set
 * inside what the unique solution leaves as a single region. */
export type GalaxiesMistake =
  | { kind: "tile"; x: number; y: number }
  | { kind: "edge"; x: number; y: number };

export interface GalaxiesUi {
  dragging: boolean;
  /**
   * Snapped drop target of the in-progress drag, in grid coords: the
   * tile a release would commit (pointer path), or the cursor cell
   * (keyboard path). Raw — it may be off-grid or otherwise
   * uncommittable; the preview shows that by drawing nothing, and a
   * release there removes or cancels instead of committing (the
   * Inertia aim idiom: absence of the preview *is* the feedback).
   */
  targetX: number;
  targetY: number;
  /**
   * Which end of the (tile, dot) pair the pointer is steering.
   *
   * `false` — the classic drag: the dot is fixed and `targetX/targetY`
   * follows the pointer. `true` — the reverse drag, started from a plain
   * cell: `targetX/targetY` stay pinned to that cell and `dotx/doty` is what
   * the pointer picks. Everything downstream of these four fields
   * (`okToAddAssocWithOpposite`, the preview, `dropDrag`, `executeMove`)
   * reads a (tile, dot) pair and needs no knowledge of which end moved.
   */
  dragToDot: boolean;
  /** Grid coords of the dot we're dragging from — or, in `dragToDot` mode,
   * the dot the pointer has currently picked (`-1` when none is in reach,
   * which the preview shows by drawing nothing). */
  dotx: number;
  doty: number;
  /** Grid coords of the drag's source square. */
  srcx: number;
  srcy: number;
  /** Show a ring on every dot this cell could legally join during a
   * `dragToDot` drag. A solving aid — "which dots have a legal 180° image of
   * this cell" is a deduction — so it is a preference, unlike the gesture
   * itself. See `prefs` below. */
  showDragCandidates: boolean;
  /** The pixel a left press landed on, and whether one is still open.
   * Left carries both meanings — a click toggles an edge, a drag associates —
   * so the press is held until the release or the first travel past
   * `DRAG_SLOP_PX` says which it was. */
  pressX: number;
  pressY: number;
  pressPending: boolean;
  /** Keyboard cursor grid coords. */
  cursor: GridCursor;
}

export type { GalaxiesDrawState, GalaxiesState };
export { GalaxiesDiff };

// --- interaction helpers -------------------------------------------

/** Edge-rounded grid coord from a pixel coord. Mirrors
 * `coord_round_to_edge` plus the (2 * FROMCOORD + 0.5)
 * grid-rounding in upstream's `interpret_move`. This and
 * {@link gridRoundDouble} divide for themselves: which edge or dot of a tile
 * the pointer is nearest is in the fraction of a tile, which `fromCoord` of
 * `engine/geometry.ts` floors away. */
function coordRoundToEdge(
  px: number,
  py: number,
  tileSize: number,
  border: number,
): Point {
  const fx = (px - border) / tileSize;
  const fy = (py - border) / tileSize;
  const xs = Math.floor(fx) + 0.5;
  const ys = Math.floor(fy) + 0.5;
  const xv = Math.floor(fx + 0.5);
  const yv = Math.floor(fy + 0.5);
  const ddx = Math.abs(fx - xs);
  const ddy = Math.abs(fy - ys);
  if (ddx > ddy) {
    return { x: 2 * xv, y: 1 + 2 * Math.floor(ys) };
  }
  return { x: 1 + 2 * Math.floor(xs), y: 2 * yv };
}

/** Grid-round for arrow drag: 2 * (pixel / tileSize) + 0.5 → nearest
 * grid coord. Used for nearest-dot detection and drop targets. */
function gridRoundDouble(
  px: number,
  py: number,
  tileSize: number,
  border: number,
): Point {
  const fx = (px - border) / tileSize;
  const fy = (py - border) / tileSize;
  return {
    x: Math.floor(2 * fx + 0.5),
    y: Math.floor(2 * fy + 0.5),
  };
}

function edgePlacementLegal(s: GalaxiesState, x: number, y: number): boolean {
  if (spaceTypeAt(x, y) !== SpaceType.Edge) return false;
  // The line mustn't intersect a dot.
  const flagsHere = s.flags[idx(s, x, y)];
  const v1 = s.flags[idx(s, x & ~1, y & ~1)];
  const v2 = s.flags[idx(s, (x + 1) & ~1, (y + 1) & ~1)];
  return !((flagsHere | v1 | v2) & F_DOT);
}

/** Coordinate of the screen pixel center of a grid cell, in the
 * tile-size convention used here. */
function scoord(c: number, tileSize: number, border: number): number {
  return (c * tileSize) / 2 + border;
}

/** Snap one pixel axis to the tile-center grid coordinate under it —
 * the drop target a release commits to. Mirrors upstream's
 * `2*FROMCOORD(x + TILE_SIZE) - 1`; always yields an odd (tile)
 * coordinate, possibly off-grid when the pointer leaves the board. */
function snapToTile(p: number, tileSize: number, border: number): number {
  return 2 * fromCoord(p + tileSize, tileSize, border) - 1;
}

// --- the click half: edges as targets ---------------------------------

/**
 * A click draws or removes the line on the grid edge nearest the press, so a
 * target is an interior edge, in grid coordinates. The cursor walks the whole
 * half-grid, and rests on a target only on an edge: on a dot, a square or a
 * corner, Enter starts the keyboard's drag instead, an arm of Galaxies' own.
 */
const edgeGeometry: TargetGeometry<
  GalaxiesState,
  GalaxiesUi,
  GalaxiesDrawState,
  Point
> = {
  noun: "grid edge",
  pointerTarget(s, ds, p) {
    const border = borderFor(ds.tileSize);
    const e = coordRoundToEdge(p.x, p.y, ds.tileSize, border);
    return inInterior(s, e.x, e.y) ? e : null;
  },
  pointAt(_s, ds, e) {
    const border = borderFor(ds.tileSize);
    return { x: scoord(e.x, ds.tileSize, border), y: scoord(e.y, ds.tileSize, border) };
  },
  cursorTarget(s, ui) {
    const { x, y } = ui.cursor;
    return spaceTypeAt(x, y) === SpaceType.Edge && inInterior(s, x, y)
      ? { x, y }
      : null;
  },
  parkCursor(ui, e) {
    ui.cursor.x = e.x;
    ui.cursor.y = e.y;
  },
  moveCursor(s, ui, button) {
    const delta = cursorDelta(button);
    if (!delta) return false;
    const nx = Math.max(1, Math.min(s.sx - 2, ui.cursor.x + delta.dx));
    const ny = Math.max(1, Math.min(s.sy - 2, ui.cursor.y + delta.dy));
    const changed = nx !== ui.cursor.x || ny !== ui.cursor.y || !ui.cursor.visible;
    ui.cursor.x = nx;
    ui.cursor.y = ny;
    ui.cursor.visible = true;
    return changed;
  },
};

const targetVerbs: TargetVerbs<
  GalaxiesState,
  GalaxiesUi,
  GalaxiesDrawState,
  Point,
  GalaxiesMove
> = {
  geometry: edgeGeometry,
  primary: {
    does: "add or remove a line",
    apply: (s, e) =>
      edgePlacementLegal(s, e.x, e.y)
        ? { ops: [{ kind: "edge", x: e.x, y: e.y }], solving: false }
        : null,
  },
  sweep: {
    holds: (s, e) => (s.flags[idx(s, e.x, e.y)] & F_EDGE_SET ? 1 : 0),
    buttons: ["primary"],
    // Lines turn corners, so a drag takes an edge of either direction, but
    // only near its middle: four edges meet at every corner it passes.
    within: (ds) => ds.tileSize * WALL_DRAG_REACH,
    says:
      "Press on a grid edge and drag along the grid to do the same to every " +
      "edge you pass over that looked the same as the first.",
  },
};

/** How near an edge's middle a wall drag passes to take it, in tiles. */
const WALL_DRAG_REACH = 0.3;
/** How near an edge's line a press lands to drag walls and not an arrow, in
 * tiles: the strip a player aims at to mean "this line", leaving the body of
 * each tile to the association drag. */
const WALL_PRESS_REACH = 0.2;

/** The edge a press at `(x, y)` would drag walls from: one whose line the
 * press is on, that can take a line, with no dot under the press (a dot on an
 * edge is the association's to pick up). */
function wallPressed(
  s: GalaxiesState,
  ds: GalaxiesDrawState,
  ui: GalaxiesUi,
  x: number,
  y: number,
): Point | null {
  const tile = ds.tileSize;
  const border = borderFor(tile);
  const e = edgeGeometry.pointerTarget(s, ds, { x, y }, ui);
  if (e === null || !edgePlacementLegal(s, e.x, e.y)) return null;
  if (dotUnder(s, x, y, tile, border) !== null) return null;
  // An edge between two tiles side by side has an even x and is a vertical
  // line; one between two stacked tiles is horizontal.
  const off =
    e.x % 2 === 0
      ? Math.abs(x - scoord(e.x, tile, border))
      : Math.abs(y - scoord(e.y, tile, border));
  return off <= tile * WALL_PRESS_REACH ? e : null;
}

// --- move logic -----------------------------------------------------

function applyOp(s: GalaxiesState, op: GalaxiesOp, solving: boolean): void {
  if (op.kind === "edge") {
    if (!inInterior(s, op.x, op.y) || spaceTypeAt(op.x, op.y) !== SpaceType.Edge) {
      throw new Error(`Galaxies: invalid edge move at (${op.x},${op.y})`);
    }
    s.flags[idx(s, op.x, op.y)] ^= F_EDGE_SET;
  } else if (op.kind === "unassoc") {
    if (
      !inInterior(s, op.x, op.y) ||
      spaceTypeAt(op.x, op.y) !== SpaceType.Tile ||
      !(s.flags[idx(s, op.x, op.y)] & F_TILE_ASSOC)
    ) {
      throw new Error(`Galaxies: invalid unassoc at (${op.x},${op.y})`);
    }
    if (solving) {
      removeAssoc(s, op.x, op.y);
    } else {
      removeAssocWithOpposite(s, op.x, op.y);
    }
  } else if (op.kind === "hold") {
    const i = idx(s, op.x, op.y);
    if (!(s.flags[i] & F_DOT)) {
      throw new Error(`Galaxies: invalid hold at (${op.x},${op.y})`);
    }
    s.flags[i] ^= F_DOT_HOLD;
  } else if (op.kind === "assoc") {
    if (
      !inInterior(s, op.x, op.y) ||
      !inInterior(s, op.ax, op.ay) ||
      !(s.flags[idx(s, op.ax, op.ay)] & F_DOT)
    ) {
      throw new Error(
        `Galaxies: invalid assoc at (${op.x},${op.y}) → (${op.ax},${op.ay})`,
      );
    }
    if (s.flags[idx(s, op.ax, op.ay)] & F_DOT_HOLD) {
      throw new Error("Galaxies: cannot add to a held dot");
    }
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const tx = op.x + dx;
        const ty = op.y + dy;
        if (!inGrid(s, tx, ty)) continue;
        if (spaceTypeAt(tx, ty) !== SpaceType.Tile) continue;
        const ti = idx(s, tx, ty);
        if (s.flags[ti] & F_TILE_ASSOC) {
          const di = idx(s, s.dotx[ti], s.doty[ti]);
          if (s.flags[di] & F_DOT_HOLD) continue;
        }
        if (solving) {
          addAssoc(s, tx, ty, op.ax, op.ay);
        } else {
          addAssocWithOpposite(s, tx, ty, op.ax, op.ay);
        }
      }
    }
  } else {
    assertNever(op, "galaxies: executeMove");
  }
}

function executeMove(s: GalaxiesState, move: GalaxiesMove): GalaxiesState {
  // A move is an op list, not a union, so there is no discriminant to narrow to
  // `never`: check the one field the dispatch reads (see `rejectMove`).
  if (!Array.isArray(move.ops)) rejectMove(move, "galaxies: executeMove");

  const next = cloneState(s);
  for (const op of move.ops) applyOp(next, op, move.solving);
  return next;
}

// --- the association drag -------------------------------------------

/** How far a press may travel and still count as a click. Small enough that a
 * deliberate drag is recognized at once, large enough that a finger's wobble
 * on a tap does not silently become one. */
const DRAG_SLOP_PX = 5;

const NO_DOT: Point = { x: -1, y: -1 };

function traveled(ui: GalaxiesUi, x: number, y: number): boolean {
  const dx = x - ui.pressX;
  const dy = y - ui.pressY;
  return dx * dx + dy * dy > DRAG_SLOP_PX * DRAG_SLOP_PX;
}

/** The dot under `(x, y)`, if the pointer is inside one's catchment. Mirrors
 * upstream's 3x3 search around the rounded subcell coordinate. */
function dotUnder(
  s: GalaxiesState,
  x: number,
  y: number,
  tile: number,
  border: number,
): Point | null {
  const g = gridRoundDouble(x, y, tile, border);
  for (let gy = g.y - 1; gy <= g.y + 1; gy++) {
    for (let gx = g.x - 1; gx <= g.x + 1; gx++) {
      if (gx < 0 || gy < 0 || gx >= s.sx || gy >= s.sy) continue;
      if (
        x >= scoord(gx - 1, tile, border) &&
        x < scoord(gx + 1, tile, border) &&
        y >= scoord(gy - 1, tile, border) &&
        y < scoord(gy + 1, tile, border) &&
        s.flags[idx(s, gx, gy)] & F_DOT
      ) {
        return { x: gx, y: gy };
      }
    }
  }
  return null;
}

/**
 * Enter an association drag: from `src`, with the (tile, dot) pair held as
 * `target` and `dot`, steering the dot end when `toDot`.
 *
 * Not the engine's `startDrag`, and deliberately not named like it: Galaxies'
 * drag remembers a source, a dot and a target rather than an anchor and a
 * current position, so it is not the shared `GridDrag` shape.
 */
function enterDrag(
  ui: GalaxiesUi,
  toDot: boolean,
  src: Point,
  dot: Point,
  target: Point,
): void {
  ui.dragging = true;
  ui.dragToDot = toDot;
  ui.srcx = src.x;
  ui.srcy = src.y;
  ui.dotx = dot.x;
  ui.doty = dot.y;
  ui.targetX = target.x;
  ui.targetY = target.y;
}

/**
 * Start an association drag from the press point, if anything there can start
 * one. Three sources, in priority order:
 *
 *  1. a **dot** under the pointer — carry an arrow out to a cell;
 *  2. a tile with an **existing arrow** — pick that arrow up and move it;
 *  3. any other in-grid, dot-free **tile** — the reverse drag: hold the cell
 *     still and go looking for the dot that owns it.
 *
 * (3) is why 2 keeps its meaning rather than becoming "re-point this cell":
 * moving an arrow would otherwise have no gesture at all, and re-pointing a
 * cell is still reachable by dragging from the dot you want.
 */
function beginDrag(
  s: GalaxiesState,
  ui: GalaxiesUi,
  x: number,
  y: number,
  tile: number,
  border: number,
  allowReverse: boolean,
): boolean {
  const cell = { x: snapToTile(x, tile, border), y: snapToTile(y, tile, border) };
  const dot = dotUnder(s, x, y, tile, border);
  if (dot) {
    enterDrag(ui, false, dot, dot, cell);
    return true;
  }

  if (
    !inInterior(s, cell.x, cell.y) ||
    spaceTypeAt(cell.x, cell.y) !== SpaceType.Tile
  ) {
    return false;
  }
  const ti = idx(s, cell.x, cell.y);
  if (s.flags[ti] & F_DOT) return false;

  if (s.flags[ti] & F_TILE_ASSOC) {
    enterDrag(ui, false, cell, { x: s.dotx[ti], y: s.doty[ti] }, cell);
    return true;
  }

  if (!allowReverse) return false;
  enterDrag(ui, true, cell, NO_DOT, cell);
  aimAtDot(s, ui, x, y, tile, border);
  return true;
}

/** Pick the nearest dot this cell could legally join, within one tile of the
 * pointer. Beyond that nothing is picked (`dotx = -1`) — the preview then
 * draws nothing, which is how a reverse drag is canceled. Nearest-legal-dot-
 * anywhere was rejected: it commits across the board and leaves no way to let
 * go harmlessly. Returns true when the pick changed. */
function aimAtDot(
  s: GalaxiesState,
  ui: GalaxiesUi,
  x: number,
  y: number,
  tile: number,
  border: number,
): boolean {
  const reach = tile * tile;
  let bestX = -1;
  let bestY = -1;
  let best = Number.POSITIVE_INFINITY;
  for (const d of legalDotsFor(s, ui.targetX, ui.targetY)) {
    const dx = scoord(d.x, tile, border) - x;
    const dy = scoord(d.y, tile, border) - y;
    const dist = dx * dx + dy * dy;
    if (dist <= reach && dist < best) {
      best = dist;
      bestX = d.x;
      bestY = d.y;
    }
  }
  if (bestX === ui.dotx && bestY === ui.doty) return false;
  ui.dotx = bestX;
  ui.doty = bestY;
  return true;
}

/** Move the drag's free end to follow the pointer. Returns true when
 * something the preview shows actually changed — a pointer move that stays
 * on the same snapped target repaints nothing (the Inertia aim idiom). */
function aimDrag(
  s: GalaxiesState,
  ui: GalaxiesUi,
  x: number,
  y: number,
  tile: number,
  border: number,
): boolean {
  if (ui.dragToDot) return aimAtDot(s, ui, x, y, tile, border);
  const tx = snapToTile(x, tile, border);
  const ty = snapToTile(y, tile, border);
  if (tx === ui.targetX && ty === ui.targetY) return false;
  ui.targetX = tx;
  ui.targetY = ty;
  return true;
}

// --- interpretMove --------------------------------------------------

function interpretMove(
  s: GalaxiesState,
  ui: GalaxiesUi,
  ds: GalaxiesDrawState,
  p: Point,
  button: number,
): GalaxiesMove | null | UiUpdate {
  const tile = ds.tileSize;
  const border = borderFor(tile);
  const x = p.x;
  const y = p.y;

  // --- Pointer: one association drag, reachable from either button.
  //
  // Left carries two meanings — a click toggles an edge, a drag associates —
  // so a left press is *held* until the release or the first travel past
  // DRAG_SLOP_PX says which it was. That costs the edge toggle its
  // fire-on-press immediacy, and it is the only reason upstream put the drag
  // on the right button. Worth paying: right-drag reaches touch only through
  // the 350 ms long-press promotion, which docs/games/input.md § "A touch hold
  // arrives as the right button" records as fatal to exactly this gesture.
  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    ui.cursor.visible = false;
    ui.pressX = x;
    ui.pressY = y;
    ui.pressPending = true;
    // The right button has no click meaning, so where the press point names
    // an unambiguous source — a dot, or a tile whose arrow is being picked
    // up — it can commit to the drag at once and let the arrow lift visibly
    // under the finger. The left button must wait: its click toggles an edge.
    // Neither starts a *reverse* drag on the press, so a plain right-click on
    // an empty cell stays a no-op rather than quietly associating it with
    // the nearest dot.
    if (button === RIGHT_BUTTON && beginDrag(s, ui, x, y, tile, border, false)) {
      ui.pressPending = false;
    }
    // UI_UPDATE even when nothing visible changed, and *especially* then.
    // `view-interactive.ts` installs pointer tracking only for a press the
    // game consumed, and `Midend.processInput` reports `null` as unconsumed —
    // so returning `null` here does not mean "nothing to repaint", it means
    // "I don't want this gesture", and not one drag event is delivered
    // afterwards. A press whose meaning is decided later must still claim it.
    return UI_UPDATE;
  }

  // The drag continues off the button *class*, not the press button, so a
  // touch long-press promoted to RIGHT_BUTTON finishes its own drag
  // (input.md § "A touch hold arrives as the right button").
  if (isMouseDrag(button)) {
    if (ui.pressPending && traveled(ui, x, y)) {
      ui.pressPending = false;
      // `view-interactive.ts`'s cancelPointerTracking reports a canceled
      // press as a drag off the canvas's top left corner and then a release
      // there. That is no place the player dragged to, and a press that was
      // still only a press started nothing: read as a drag from the press
      // point it would lift the arrow under the press and drop it off the
      // board.
      if (x < 0 || y < 0) return null;
      // A left press on a line drags walls: the click's own verb, on every
      // edge the drag passes. Anywhere else it is the association.
      const wall =
        stripModifiers(button) === LEFT_DRAG
          ? wallPressed(s, ds, ui, ui.pressX, ui.pressY)
          : null;
      if (wall !== null) {
        const from = { x: ui.pressX, y: ui.pressY };
        beginSweep(targetVerbs, s, ui, wall, LEFT_BUTTON, from, false);
        return sweepTo(targetVerbs, s, ui, ds, p) ?? UI_UPDATE;
      }
      // Start from where the press landed, not from here: the source is
      // whatever the player put their pointer on, and by now it has moved
      // off it. Reverse drags are allowed from here on — the travel is what
      // distinguishes them from a click.
      if (!beginDrag(s, ui, ui.pressX, ui.pressY, tile, border, true)) return null;
      aimDrag(s, ui, x, y, tile, border);
      return UI_UPDATE;
    }
    if (sweepOpen(ui)) return sweepTo(targetVerbs, s, ui, ds, p);
    if (!ui.dragging) return null;
    // The same canceled press, where the press itself began the drag: the
    // right button on a dot or an arrow. A drag whose target has not left its
    // source tile has gone nowhere yet, so the report from off the canvas ends
    // it and the arrow it lifted is put back. One that has moved is not told
    // apart from an arrow dragged off the board, which removes it.
    if (
      !ui.dragToDot &&
      ui.targetX === ui.srcx &&
      ui.targetY === ui.srcy &&
      (x < 0 || y < 0)
    ) {
      ui.dragging = false;
      return UI_UPDATE;
    }
    return aimDrag(s, ui, x, y, tile, border) ? UI_UPDATE : null;
  }

  if (isMouseRelease(button)) {
    const pending = ui.pressPending;
    ui.pressPending = false;
    // A wall drag made its moves as it went; its release is not a click.
    if (sweepOpen(ui)) {
      endSweep(ui);
      return null;
    }
    if (ui.dragging) {
      // Commit the pair the preview showed, not the raw release pixel: the
      // two differ only when the pointer jumps between the last drag event
      // and the release (touch lift-jitter), and what the player saw is
      // what the release should do.
      return dropDrag(s, ui, ui.targetX, ui.targetY);
    }
    // A press that never became a drag is a click — but only if it ended
    // where it started. A release can arrive far from its press with no drag
    // between, and that must not toggle an edge on the far side of the board.
    // Measuring against the press pixel covers it without a special case.
    if (button !== LEFT_RELEASE || !pending || traveled(ui, x, y)) return null;
    // The click: the declared verb on the edge the press addressed, which is
    // where the keyboard carries on from.
    const e = edgeGeometry.pointerTarget(s, ds, { x: ui.pressX, y: ui.pressY }, ui);
    if (e === null) return null;
    pressTarget(targetVerbs, ui, e);
    return buttonVerb(targetVerbs, button)?.apply(s, e, ui) ?? null;
  }

  // While a keyboard or pointer drag is open, the arrows steer its free end.
  if (ui.dragging && isCursorMove(button)) {
    const changed = edgeGeometry.moveCursor(s, ui, button);
    const nx = ui.cursor.x;
    const ny = ui.cursor.y;
    if (ui.dragToDot) {
      // The cursor is picking the *dot*: take it when it lands on a legal
      // one, drop the pick when it moves off (the preview then shows
      // nothing, exactly as with the pointer out of reach).
      const onDot =
        inInterior(s, nx, ny) &&
        s.flags[idx(s, nx, ny)] & F_DOT &&
        okToAddAssocWithOpposite(s, ui.targetX, ui.targetY, nx, ny);
      ui.dotx = onDot ? nx : -1;
      ui.doty = onDot ? ny : -1;
    } else {
      ui.targetX = ui.cursor.x;
      ui.targetY = ui.cursor.y;
    }
    return changed ? UI_UPDATE : null;
  }

  // Enter or Space off an edge, or with a drag open, is the keyboard's drag:
  // it picks up a dot or an arrow, starts the reverse drag from a square, or
  // finishes the drag it started. On an edge it is the click's verb.
  if (
    (button === CURSOR_SELECT || button === CURSOR_SELECT2) &&
    ui.cursor.visible &&
    (ui.dragging || edgeGeometry.cursorTarget(s, ui) === null)
  ) {
    const cx = ui.cursor.x;
    const cy = ui.cursor.y;
    if (ui.dragging) {
      // In a cell→dot drag the cursor is picking the *dot*, so the tile to
      // commit is the pinned target, not wherever the cursor now sits.
      return ui.dragToDot
        ? dropDrag(s, ui, ui.targetX, ui.targetY)
        : dropDrag(s, ui, cx, cy);
    }
    const ci = idx(s, cx, cy);
    const cell = { x: cx, y: cy };
    if (s.flags[ci] & F_DOT) {
      enterDrag(ui, false, cell, cell, cell);
      return UI_UPDATE;
    }
    if (s.flags[ci] & F_TILE_ASSOC) {
      enterDrag(ui, false, cell, { x: s.dotx[ci], y: s.doty[ci] }, cell);
      return UI_UPDATE;
    }
    // A plain tile: start the reverse drag, so the keyboard reaches the
    // cell→dot gesture the pointer has (the input-parity bar). The cursor
    // keys then pick the dot and a second select commits.
    if (spaceTypeAt(cx, cy) === SpaceType.Tile && inInterior(s, cx, cy)) {
      enterDrag(ui, true, cell, NO_DOT, cell);
      return UI_UPDATE;
    }
    return null;
  }

  return interpretTargetVerbs(targetVerbs, s, ui, ds, p, button);
}

function dropDrag(
  s: GalaxiesState,
  ui: GalaxiesUi,
  px: number,
  py: number,
): GalaxiesMove | null | UiUpdate {
  const toDot = ui.dragToDot;
  ui.dragging = false;
  ui.dragToDot = false;
  // Two tests belong to the classic drag only. In reverse mode the target *is*
  // the source cell, so "dragged back where it started" would fire on every
  // commit; and the source is unassociated by construction, so there is no
  // arrow there to lift.
  if (!toDot && px === ui.srcx && py === ui.srcy) return UI_UPDATE;
  const ops: GalaxiesOp[] = [];
  if (
    !toDot &&
    (ui.srcx !== ui.dotx || ui.srcy !== ui.doty) &&
    s.flags[idx(s, ui.srcx, ui.srcy)] & F_TILE_ASSOC
  ) {
    ops.push({ kind: "unassoc", x: ui.srcx, y: ui.srcy });
  }
  // Emit the assoc only where executeMove would commit it — the predicate the
  // preview draws from — so a release never costs an undo entry that changes
  // nothing.
  if (okToAddAssocWithOpposite(s, px, py, ui.dotx, ui.doty)) {
    ops.push({ kind: "assoc", x: px, y: py, ax: ui.dotx, ay: ui.doty });
  }
  if (ops.length === 0) return UI_UPDATE;
  return { ops, solving: false };
}

/**
 * A wall is a click on its midpoint. An arrow is a drag from its dot to the
 * square, which brings the square's partner across the dot along; a dot's own
 * squares (two for a dot on a wall, four on a corner) take one drag per pair of
 * partners still to point at it.
 */
function hintGesture(
  s: GalaxiesState,
  ui: GalaxiesUi,
  ds: GalaxiesDrawState,
  m: GalaxiesMove,
  step: HintStep<GalaxiesMove, GalaxiesHint, GalaxiesRung>,
): readonly PointerAction[] {
  const tile = ds.tileSize;
  const border = borderFor(tile);
  const at = (c: Point): Point => ({
    x: scoord(c.x, tile, border),
    y: scoord(c.y, tile, border),
  });
  // An edge is the click's verb; an arrow is the drag from its dot, which is
  // Galaxies' own.
  const edges = m.ops.flatMap((op) =>
    op.kind === "edge" ? [{ x: op.x, y: op.y }] : [],
  );
  const out: PointerAction[] =
    edges.length === 0
      ? []
      : verbClicks(targetVerbs, { executeMove, hintKeepTrack }, s, ui, ds, step, edges);
  for (const op of m.ops) {
    if (op.kind !== "assoc") continue;
    const dot = { x: op.ax, y: op.ay };
    const covered = new Set<number>();
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const t = { x: op.x + dx, y: op.y + dy };
        if (!inGrid(s, t.x, t.y) || spaceTypeAt(t.x, t.y) !== SpaceType.Tile) continue;
        const ti = idx(s, t.x, t.y);
        if (covered.has(ti) || s.flags[ti] & F_DOT) continue;
        if (s.flags[ti] & F_TILE_ASSOC && s.dotx[ti] === dot.x && s.doty[ti] === dot.y)
          continue;
        covered.add(ti);
        covered.add(idx(s, 2 * dot.x - t.x, 2 * dot.y - t.y));
        out.push(drag(at(dot), at(t)));
      }
    }
  }
  return out;
}

// --- solve --------------------------------------------------------

/** The solved board reached from `start`, or null if the solver cannot settle
 * it. */
function solveFrom(start: GalaxiesState, clear: boolean): GalaxiesState | null {
  const b = cloneState(start);
  if (clear) clearForSolve(b);
  const diff = solverState(b, GalaxiesDiff.Unreasonable);
  return diff === GalaxiesDiff.Normal || diff === GalaxiesDiff.Unreasonable ? b : null;
}

function solveGalaxies(
  orig: GalaxiesState,
  curr: GalaxiesState,
): SolveResult<GalaxiesMove> {
  // From the player's position first, then from the start.
  const solved = solveFrom(curr, false) ?? solveFrom(orig, true);
  if (!solved) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  // The solution is walls only, as upstream's is: every arrow the player set
  // is removed.
  const ops: GalaxiesOp[] = [];
  for (let y = 1; y < curr.sy - 1; y += 2) {
    for (let x = 1; x < curr.sx - 1; x += 2) {
      if (curr.flags[idx(curr, x, y)] & F_TILE_ASSOC)
        ops.push({ kind: "unassoc", x, y });
    }
  }
  for (let y = 0; y < curr.sy; y++) {
    for (let x = 0; x < curr.sx; x++) {
      if (spaceTypeAt(x, y) !== SpaceType.Edge) continue;
      const i = idx(curr, x, y);
      if ((curr.flags[i] & F_EDGE_SET) !== (solved.flags[i] & F_EDGE_SET)) {
        ops.push({ kind: "edge", x, y });
      }
    }
  }
  return { ok: true, move: { ops, solving: true } };
}

// --- mistake checking ----------------------------------------------

/**
 * Flag every player action the unique solution contradicts, in both ways
 * Galaxies is played:
 *
 *  - a **tile** associated with a dot other than the solution's;
 *  - a **wall** set *inside* a region the solution leaves whole.
 *
 * The dots are immutable clues, so re-solving a cleared copy recovers the
 * solution with no stored aux. A wrong tile and its 180° partner are both
 * flagged, since the player sets both at once. Unassociated tiles are
 * incomplete rather than wrong. A board that does not solve uniquely (only a
 * hand-entered ID) yields no flags: nothing can be proved wrong, and "save
 * only when provably clean" must not block on an unprovable board.
 */
function findMistakes(s: GalaxiesState): readonly GalaxiesMistake[] {
  const sol = cloneState(s);
  clearForSolve(sol);
  sol.dots = rebuildDots(sol);
  const diff = solverState(sol, GalaxiesDiff.Unreasonable);
  if (diff !== GalaxiesDiff.Normal && diff !== GalaxiesDiff.Unreasonable) {
    return [];
  }
  const mistakes: GalaxiesMistake[] = [];
  // Wrong associations: a tile pointed at a dot the solution disagrees with.
  for (let y = 1; y < s.sy - 1; y += 2) {
    for (let x = 1; x < s.sx - 1; x += 2) {
      const i = idx(s, x, y);
      if (!(s.flags[i] & F_TILE_ASSOC)) continue;
      const si = idx(sol, x, y);
      // If the solver left this tile undetermined (shouldn't happen for
      // a uniquely-solvable board), don't claim it's wrong.
      if (!(sol.flags[si] & F_TILE_ASSOC)) continue;
      if (s.dotx[i] !== sol.dotx[si] || s.doty[i] !== sol.doty[si]) {
        mistakes.push({ kind: "tile", x, y });
      }
    }
  }
  // Wrong walls: an edge the player set whose two tiles share a solution dot.
  // The rim has a tile off the board, so `tilesFromEdge` skips it.
  for (let y = 1; y < s.sy - 1; y++) {
    for (let x = 1; x < s.sx - 1; x++) {
      if (spaceTypeAt(x, y) !== SpaceType.Edge) continue;
      if (!(s.flags[idx(s, x, y)] & F_EDGE_SET)) continue;
      const [t0, t1] = tilesFromEdge(s, x, y);
      if (!t0 || !t1) continue;
      const a = idx(sol, t0.x, t0.y);
      const b = idx(sol, t1.x, t1.y);
      if (!(sol.flags[a] & F_TILE_ASSOC) || !(sol.flags[b] & F_TILE_ASSOC)) continue;
      if (sol.dotx[a] === sol.dotx[b] && sol.doty[a] === sol.doty[b]) {
        mistakes.push({ kind: "edge", x, y });
      }
    }
  }
  return mistakes;
}

// --- the explained hint ---------------------------------------------

/**
 * The whole remaining deduction, narrated. See `hint.ts` for the rules and
 * their wording; the refusals live here because they are about the board the
 * player is looking at, not about the deduction.
 */
function hint(s: GalaxiesState): HintResult<GalaxiesMove, GalaxiesHint, GalaxiesRung> {
  const steps = galaxiesHintSteps(s);
  if (steps.length === 0) {
    // On an Unreasonable board this is the expected end of the road: what
    // remains needs a cell tried and followed until something breaks, and the
    // hint does not teach guessing (see `nextPlanFiring`).
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }
  return { ok: true, steps };
}

/**
 * Did this move do what the step asked?
 *
 * Judged by *effect* rather than by matching ops: the same association is
 * reachable by dragging from the dot, dragging from the cell, or using the
 * keyboard, and all three are the player following the hint. A step that asks
 * for several cells (a dot sitting on four of them) completes when the last
 * one lands, so the earlier ones are `"onTrack"`.
 */
function hintKeepTrack(
  m: GalaxiesMove,
  step: HintStep<GalaxiesMove, GalaxiesHint>,
  s: GalaxiesState,
): HintTrackVerdict {
  if (m.solving) return "off";
  const before = outstanding(s, step).length;
  if (before === 0) return "completed";
  const after = outstanding(executeMove(s, m), step).length;
  if (after === 0) return "completed";
  return after < before ? "onTrack" : "off";
}

/**
 * Validate-at-display. The player can reach a step's association by their own
 * route (or wall off a region so the arrow inside it stops mattering), so a
 * stored step is re-checked before it is shown again: fully done ⇒ drop it and
 * advance, partly done ⇒ show only what is left.
 */
function refreshHintStep(
  step: HintStep<GalaxiesMove, GalaxiesHint, GalaxiesRung>,
  s: GalaxiesState,
): HintStep<GalaxiesMove, GalaxiesHint, GalaxiesRung> | null {
  if (stepSatisfied(s, step)) return null;
  const hl = step.highlights;
  if (!hl?.targetDot || hl.targets.length < 2) return step;
  const left = outstanding(s, step);
  const targets = hl.targets.filter((t) =>
    left.some((l) => l.x === t.x && l.y === t.y),
  );
  if (targets.length === hl.targets.length) return step;
  const highlights = { ...hl, targets };
  const words = say(highlights);
  return { ...step, highlights, words, explanation: words.text };
}

// --- text format and statusbar -------------------------------------

function textFormat(s: GalaxiesState): string {
  const out: string[] = [];
  for (let y = 0; y < s.sy; y++) {
    for (let x = 0; x < s.sx; x++) {
      const i = idx(s, x, y);
      const f = s.flags[i];
      if (f & F_DOT) {
        out.push("o");
        continue;
      }
      const t = spaceTypeAt(x, y);
      if (t === SpaceType.Tile) {
        if (f & F_TILE_ASSOC) {
          const di = idx(s, s.dotx[i], s.doty[i]);
          out.push(s.flags[di] & F_DOT_BLACK ? "B" : "W");
        } else {
          out.push(" ");
        }
      } else if (t === SpaceType.Vertex) {
        out.push("+");
      } else {
        if (f & F_EDGE_SET) out.push(isVerticalEdge(x) ? "|" : "-");
        else out.push(" ");
      }
    }
    out.push("\n");
  }
  return out.join("");
}

/** The two tiers a player picks, in `GalaxiesDiff` order. Distinct from
 * `DIFF_NAMES` below, which is the solver's *verdict* vocabulary — five members
 * for two tiers, which is why the cross-game guard reads the params form and
 * never counts `GalaxiesDiff`. */
const GALAXIES_TIERS = tierNames(2, { search: true });

const DIFF_NAMES = [...GALAXIES_TIERS, "Impossible", "Ambiguous", "Unfinished"];

// --- params ---------------------------------------------------------

function defaultParams(): GalaxiesParams {
  return { w: 7, h: 7, diff: GalaxiesDiff.Normal };
}

const paramConfig: ParamConfigItem<GalaxiesParams>[] = [
  ...dimensionParamConfig<GalaxiesParams>({
    doc: "Size of the grid in squares. A 3x3 has no Unreasonable puzzles.",
    bounds: { min: 3, max: 100 },
  }),
  difficultyItem(GALAXIES_TIERS, "diff"),
];

/** `WxH`, then the generator-only difficulty letter. */
const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", "nu", { full: true }),
]);

function validateParams(p: GalaxiesParams, full: boolean): string | null {
  // Measured 2026-10-06: none in 600,000 boards built. A 3x4 has them.
  if (full && p.w === 3 && p.h === 3 && p.diff === GalaxiesDiff.Unreasonable)
    return noSuchTier("3x3 puzzle", GALAXIES_TIERS[p.diff]);
  return null;
}

/** The last board's difficulty verdict, keyed by its dot layout: the verdict
 * depends only on the dots, and a solve per status-bar update would be paid
 * on every move. One entry, because one board is played at a time. */
let lastDiff: { key: string; diff: number } | null = null;

function statusbarText(s: GalaxiesState, _ui: GalaxiesUi): string {
  const key = `${s.w}x${s.h}:${s.dots.map((d) => `${d.x},${d.y}`).join(";")}`;
  if (lastDiff === null || lastDiff.key !== key) {
    const probe = cloneState(s);
    clearForSolve(probe);
    lastDiff = { key, diff: solverState(probe, GalaxiesDiff.Unreasonable) };
  }
  const diffWord = DIFF_NAMES[lastDiff.diff] ?? "Unknown";
  return `Difficulty ${diffWord}.`;
}

// --- the Game object -----------------------------------------------

/** Galaxies' difficulty contract (`engine/difficulty.ts`). `GalaxiesDiff` is
 * two tiers and three verdicts in one type, which is why the cross-game guard
 * reads the `paramConfig` choices rather than counting its members. The board
 * is cleared to its starting position first, so the player's own edges and
 * associations never enter the verdict. */
const difficulty: DifficultyContract<GalaxiesParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = descValue(parseDesc(p, desc));
    clearForSolve(s);
    const ret = solverState(s, cap as GalaxiesDiff);
    if (ret === GalaxiesDiff.Impossible) return "impossible";
    return ret === GalaxiesDiff.Ambiguous || ret === GalaxiesDiff.Unfinished
      ? "unsolved"
      : "solved";
  },
};

export const galaxiesGame: Game<
  GalaxiesParams,
  GalaxiesState,
  GalaxiesMove,
  GalaxiesUi,
  GalaxiesDrawState,
  GalaxiesMistake,
  GalaxiesHint,
  GalaxiesRung
> = {
  id: "galaxies",
  preferredTileSize: PREFERRED_TILE_SIZE,

  defaultParams,

  presets() {
    const mk = (w: number, h: number, diff: GalaxiesDiff) => ({
      params: { w, h, diff },
    });
    return {
      title: "Galaxies",
      submenu: [
        mk(7, 7, GalaxiesDiff.Normal),
        mk(7, 7, GalaxiesDiff.Unreasonable),
        mk(10, 10, GalaxiesDiff.Normal),
        mk(10, 10, GalaxiesDiff.Unreasonable),
        mk(15, 15, GalaxiesDiff.Normal),
        mk(15, 15, GalaxiesDiff.Unreasonable),
      ],
    };
  },

  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc(p: GalaxiesParams, rng: RandomState) {
    return { desc: newGameDesc(p, rng) };
  },

  newState(p, desc): GalaxiesState {
    return descValue(parseDesc(p, desc));
  },

  newUi(_state): GalaxiesUi {
    return {
      dragging: false,
      dragToDot: false,
      targetX: -1,
      targetY: -1,
      dotx: 0,
      doty: 0,
      srcx: 0,
      srcy: 0,
      showDragCandidates: true,
      pressX: 0,
      pressY: 0,
      pressPending: false,
      cursor: newCursor(1, 1),
    };
  },

  newDrawState,
  targetVerbs,
  interpretMove,
  executeMove,

  status(s): "ongoing" | "solved" {
    return checkComplete(s, false).complete ? "solved" : "ongoing";
  },

  solve: solveGalaxies,
  findMistakes,
  hint,
  hintRungs: GALAXIES_RUNGS,
  hintKeepTrack,
  hintGesture,
  refreshHintStep,
  hintMarks: {
    roles: {
      ring: "what the step decides: the square whose dot it settles, ringed twice, with the square opposite the dot (its partner) ringed once, since the same arrow brings it along; the line it asks you to draw; and the dot the arrow points at.",
      outline:
        "what the step reasons from: squares such as the ways out of a square or two partners across a dot, a wall it mirrors, and a dot it cites.",
      stripes:
        "the galaxy, or the piece of one, the sentence names: how far a galaxy can still stretch, or the piece cut off from its dot.",
    },
  },

  /** The rings, not the gesture, and not the information either. Once the
   * preview is honest (`reachableFromDot`), waving the pointer around shows
   * the dots a cell may join — on a fresh 10x10 about 1.5 per cell, so for
   * many cells it is the answer. This preference decides only whether that is
   * read at a glance or by probing; hiding it properly would make the preview
   * lenient again. Default on, since the rings also explain the gesture the
   * first time someone stumbles into it. */
  prefs: [
    {
      kw: "galaxies-show-drag-candidates",
      name: "While dragging from a cell, ring the dots it could belong to",
      type: "boolean",
      get: (ui) => ui.showDragCandidates,
      set: (ui, v) => {
        ui.showDragCandidates = v;
      },
    },
  ],

  difficulty,
  textFormat,
  statusbarText,

  colors(defaultBackground: Color): Color[] {
    const bg = defaultBackground;
    const ret = new Array<Color>(NCOLORS);
    ret[COL_BACKGROUND] = bg;
    // A closed region is a lifted surface against the plain cells around it,
    // brighter than them in both schemes. Paper is not: it inverts, and in
    // the dark scheme lands a faint step below the cell surface.
    ret[COL_WHITEBG] = givenSurface(bg);
    ret[COL_BLACKBG] = galaxiesBlackRegion(bg);
    // The dots are the clues and a hint calls them white and black, so they
    // are pinned: paper inverts, and a "white dot" was a near-black disc on a
    // near-black cell in the dark scheme. The rim is what inverts.
    ret[COL_WHITEDOT] = WHITE;
    ret[COL_BLACKDOT] = BLACK;
    ret[COL_DOT_RIM] = INK;
    ret[COL_GRID] = surfaceGrid(bg);
    ret[COL_CELL] = cellSurface(bg);
    ret[COL_EDGE] = INK;
    ret[COL_ARROW] = INK;
    // Both transient affordances take authored colors rather than
    // board-relative tints, since a tint of the board cannot be prominent by
    // construction, in either scheme. Galaxies spends grays, black, white and
    // red, so the default cursor green is free (`CURSOR`'s doc comment), and
    // blue is free for the drag.
    ret[COL_CURSOR] = CURSOR;
    ret[COL_DRAG] = DRAG_ADD;
    // Mistake highlight: a strong red that reads on both white and black
    // region fills and the page background.
    ret[COL_MISTAKE] = ERROR;
    // The hint takes **purple**, not the collection's hint blue, because blue
    // is the drag's. Both ring a *dot* — a cell→dot drag rings every dot the
    // cell may join, the hint the one it must — and they are on screen
    // together the moment the player drags to follow the hint. Purple is the
    // collection's answer when blue and green are both taken. Evidence keeps
    // the cross-game `HINT_EVIDENCE` teal, a different hue from both.
    ret[COL_HINT] = PURPLE;
    ret[COL_HINT_CELL] = HINT_EVIDENCE;
    return ret;
  },

  computeSize(p, tileSize): Size {
    const border = borderFor(tileSize);
    return { w: p.w * tileSize + 2 * border, h: p.h * tileSize + 2 * border };
  },

  redraw,

  animLength() {
    return 0;
  },
  solvedFlash: () => 3 * FLASH_TIME,
};

registerGame(galaxiesGame);
