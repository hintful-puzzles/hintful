/**
 * Untangle, after upstream's `untangle.c`: drag the vertices of a planar
 * graph until no two edges cross.
 *
 * Where it departs from upstream:
 *  - **No `supersededDesc`**: the public desc is edges-only and never
 *    changes; the player's dragged positions ride the serialized move
 *    log, which the midend save format already replays.
 *  - **Editor build excluded**: no `E` add/delete-edge moves, no text
 *    format (no `textFormat`).
 *  - **No `findMistakes`**: crossed edges drawn red ARE the mistake
 *    feedback.
 *  - **A hint, and a Solve that needs no `aux`**: the hint moves the point
 *    that removes the most crossings and says how many (`hint.ts`); both it
 *    and Solve fall back on a layout computed from the edges alone
 *    (`solution.ts`), so a shared game ID or a resumed save is as solvable
 *    as a freshly generated board. Upstream's Solve refuses without `aux`.
 *  - **Preferences** via the engine `prefs` hook: snap-to-grid,
 *    show-crossed-edges (default ON), vertex-style.
 */

import { rejectMove } from "../../engine/assert-never.ts";
import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { TWO } from "../../engine/color/colors.ts";
import {
  CURSOR,
  ERROR,
  FLASH,
  HELD,
  HINT_ACTION,
  INK,
} from "../../engine/color/palette.ts";
import { parseLeadingInt } from "../../engine/decimal.ts";
import { descValue } from "../../engine/desc-error.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { drag } from "../../engine/hint-gesture.ts";
import {
  type Game,
  registerGame,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/index.ts";
import { numberItem } from "../../engine/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  isCursorMove,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  MOD_SHFT,
  stripModifiers,
} from "../../engine/pointer.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { newUntangleDesc } from "./generator.ts";
import {
  deduceUntangleHintPlan,
  UNTANGLE_RUNGS,
  type UntangleRung,
  untangleKeepTrack,
} from "./hint.ts";
import { COL_BACKGROUND, FLASH_TIME, redrawUntangle } from "./render.ts";
import { closestOrientation, solvedLayout } from "./solution.ts";
import {
  buildEdges,
  coordLimit,
  DRAG_THRESHOLD,
  findCrossings,
  makeCircle,
  PREFERRED_TILE_SIZE,
  parseDesc,
  placeMove,
  pointerDrop,
  type UntangleDrawState,
  type UntangleMove,
  type UntangleParams,
  type UntangleState,
  type UntangleUi,
} from "./state.ts";

// --- constants (untangle.c) -----------------------------------------
const ANIM_TIME = 0.13;
const SOLVEANIM_TIME = 0.5;
/** Tab key — upstream also accepts '\t' to cycle the cursor. */
const TAB = 9;
/** Sane upper cap on vertices (the generator allocates a COORDLIMIT(n)²
 * scratch grid). Upstream's bound is INT_MAX/3; a few thousand is plenty
 * and keeps the O(E²) crossing scan responsive. */
const MAX_POINTS = 2000;

/** The pixel vertex `i` is grabbed at. */
function vertexPixel(s: UntangleState, i: number, tileSize: number): Point {
  const p = s.pts[i];
  return {
    x: Math.trunc((p.x * tileSize) / p.d),
    y: Math.trunc((p.y * tileSize) / p.d),
  };
}

/** Nearest vertex within `DRAG_THRESHOLD` pixels of `(x,y)`, or -1
 * (upstream `point_under_mouse`). */
function pointUnderMouse(
  s: UntangleState,
  tileSize: number,
  x: number,
  y: number,
): number {
  let best = -1;
  let bestd = 0;
  for (let i = 0; i < s.n; i++) {
    const at = vertexPixel(s, i, tileSize);
    const dx = at.x - x;
    const dy = at.y - y;
    const d = dx * dx + dy * dy;
    if (best === -1 || bestd > d) {
      best = i;
      bestd = d;
    }
  }
  return bestd <= DRAG_THRESHOLD * DRAG_THRESHOLD ? best : -1;
}

/** Update `ui.newPoint` for the live drag position `(x,y)` in pixels,
 * snapping to the coarse grid when that preference is on (upstream
 * `place_dragged_point`). */
function placeDraggedPoint(
  s: UntangleState,
  ui: UntangleUi,
  tileSize: number,
  x: number,
  y: number,
): void {
  // Upstream cancels a drag dropped off the board; here it commits where the
  // clamp pins it.
  const dropped = pointerDrop(s.w, tileSize, x, y);
  if (ui.snapToGrid) {
    const d = s.n - 1;
    const gx = Math.trunc((d * dropped.x) / (s.w * tileSize));
    const gy = Math.trunc((d * dropped.y) / (s.w * tileSize));
    ui.newPoint = { x: (gx * 2 + 1) * s.w, y: (gy * 2 + 1) * s.w, d: d * 2 };
  } else {
    ui.newPoint = dropped;
  }
}

export const untangleGame: Game<
  UntangleParams,
  UntangleState,
  UntangleMove,
  UntangleUi,
  UntangleDrawState,
  unknown,
  unknown,
  UntangleRung
> = {
  id: "untangle",
  preferredTileSize: PREFERRED_TILE_SIZE,

  // --- params --------------------------------------------------------
  defaultParams: () => ({ n: 10 }),
  paramConfig: [
    numberItem<UntangleParams>("number-of-points", "Number of points", "n", {
      doc: "How many points the puzzle has. More points means more lines to untangle.",
      bounds: { min: 4, max: MAX_POINTS },
      label: { slot: "size", words: (p) => `${p.n} points` },
    }),
  ],
  presets: () => ({
    title: "Untangle",
    submenu: [6, 10, 15, 20, 25].map((n) => ({ params: { n } })),
  }),
  encodeParams: (p) => `${p.n}`,
  // Lenient, as every game's is: a string with no number reads as 0, and the
  // bounds refuse it in the dialog's words rather than a thrown message's.
  decodeParams: (s) => ({ n: parseLeadingInt(s, 0).value }),

  // --- generation ----------------------------------------------------
  newDesc: newUntangleDesc,
  newState: (p, desc) => {
    const n = p.n;
    const w = coordLimit(n);
    const { edges, edgeSet } = buildEdges(descValue(parseDesc(p, desc)), n);
    const pts = makeCircle(n, w);
    const { crosses } = findCrossings(pts, edges);
    return { n, w, pts, edges, edgeSet, crosses, justSolved: false };
  },

  newUi: () => ({
    dragPoint: -1,
    cursorPoint: -1,
    newPoint: { x: 0, y: 0, d: 1 },
    justDragged: false,
    justMoved: false,
    animLength: ANIM_TIME,
    // Preference defaults (show-crossed-edges ON is our divergence).
    snapToGrid: false,
    showCrossedEdges: true,
    vertexNumbers: false,
  }),

  changedState: (ui, _old, _next) => {
    // Mirror game_changed_state: end any drag, and carry "the last move
    // was a player drag" into justMoved (so it animates instantly).
    ui.dragPoint = -1;
    ui.justMoved = ui.justDragged;
    ui.justDragged = false;
  },

  // --- input ---------------------------------------------------------
  interpretMove: (
    s: UntangleState,
    ui: UntangleUi,
    ds: UntangleDrawState,
    pt: Point,
    button: number,
  ): UntangleMove | null | UiUpdate => {
    const n = s.n;
    const tileSize = ds.tileSize;
    const { x, y } = pt;

    if (isMouseDown(button)) {
      const p = pointUnderMouse(s, tileSize, x, y);
      if (p >= 0) {
        ui.dragPoint = p;
        ui.cursorPoint = -1;
        placeDraggedPoint(s, ui, tileSize, x, y);
        return UI_UPDATE;
      }
      return null;
    }
    if (isMouseDrag(button) && ui.dragPoint >= 0) {
      placeDraggedPoint(s, ui, tileSize, x, y);
      return UI_UPDATE;
    }
    if (isMouseRelease(button) && ui.dragPoint >= 0) {
      // Always commits: the drag target was clamped into the play area.
      const p = ui.dragPoint;
      ui.dragPoint = -1;
      ui.cursorPoint = -1;
      ui.justDragged = true;
      return placeMove(p, ui.newPoint);
    }
    if (isMouseDrag(button) || isMouseRelease(button)) {
      return null; // drag/release with no active drag
    }

    if (isCursorMove(button)) {
      if (ui.dragPoint < 0) {
        // Select the nearest point in the quadrant of the arrow key.
        if (ui.cursorPoint < 0) ui.cursorPoint = 0;
        const cur = s.pts[ui.cursorPoint];
        let best = -1;
        let bestd = 0;
        for (let i = 0; i < n; i++) {
          if (i === ui.cursorPoint) continue;
          const p = s.pts[i];
          const dx = p.x * cur.d - cur.x * p.d;
          const dy = p.y * cur.d - cur.y * p.d;
          if (dx === 0 && dy === 0) continue; // overlaps the cursor point
          if (!quadrantOk(button, dx, dy)) continue;
          const dd = cur.d * p.d;
          const distsq = (dx * dx + dy * dy) / (dd * dd);
          if (best === -1 || distsq < bestd) {
            best = i;
            bestd = distsq;
          }
        }
        if (best >= 0) {
          ui.cursorPoint = best;
          return UI_UPDATE;
        }
        return null;
      }
      // Dragging a held point with the arrow keys: nudge by tileSize/2.
      const inc = Math.trunc(tileSize / 2);
      let dx = 0;
      let dy = 0;
      if (button === CURSOR_UP) dy = -inc;
      else if (button === CURSOR_DOWN) dy = inc;
      else if (button === CURSOR_LEFT) dx = -inc;
      else if (button === CURSOR_RIGHT) dx = inc;
      placeDraggedPoint(
        s,
        ui,
        tileSize,
        Math.trunc((ui.newPoint.x * tileSize) / ui.newPoint.d) + dx,
        Math.trunc((ui.newPoint.y * tileSize) / ui.newPoint.d) + dy,
      );
      return UI_UPDATE;
    }

    if (button === CURSOR_SELECT) {
      if (ui.dragPoint < 0 && ui.cursorPoint >= 0) {
        // Begin a keyboard drag of the highlighted point.
        ui.dragPoint = ui.cursorPoint;
        ui.cursorPoint = -1;
        const p = s.pts[ui.dragPoint];
        ui.newPoint = {
          x: Math.trunc((p.x * tileSize) / p.d),
          y: Math.trunc((p.y * tileSize) / p.d),
          d: tileSize,
        };
        return UI_UPDATE;
      }
      if (ui.dragPoint >= 0) {
        // End the keyboard drag (always commits — newPoint is clamped in).
        const p = ui.dragPoint;
        ui.cursorPoint = ui.dragPoint;
        ui.dragPoint = -1;
        ui.justDragged = true;
        return placeMove(p, ui.newPoint);
      }
      if (ui.cursorPoint < 0) {
        ui.cursorPoint = 0;
        return UI_UPDATE;
      }
      return null;
    }

    const base = stripModifiers(button);
    if (base === CURSOR_SELECT2 || base === TAB) {
      // Cycle the cursor through the points (Shift reverses).
      if (ui.dragPoint >= 0) return null;
      if (ui.cursorPoint < 0) {
        ui.cursorPoint = 0;
        return UI_UPDATE;
      }
      const dir = button & MOD_SHFT ? -1 : 1;
      ui.cursorPoint = (ui.cursorPoint + dir + n) % n;
      return UI_UPDATE;
    }

    return null;
  },

  executeMove: (s, m) => {
    // Untangle's move is one object shape rather than a union, so there is no
    // discriminant to narrow to `never`: check the fields the dispatch reads.
    // The per-point validation below only runs over points that exist, so an
    // empty or absent list would sail past it.
    if (m.kind !== "place" || !Array.isArray(m.points)) {
      rejectMove(m, "untangle: executeMove");
    }

    // The topology is shared; only the positions are copied.
    const ns: UntangleState = { ...s, pts: s.pts.slice(), justSolved: m.solving };
    for (const p of m.points) {
      // `RationalPoint`'s integer invariant is enforced here, where every
      // move (drag, solve, replay, load) becomes state: a fraction slipping
      // through any input path would otherwise surface as a cryptic `BigInt`
      // RangeError deep inside `findCrossings`.
      if (
        !Number.isInteger(p.i) ||
        !Number.isInteger(p.x) ||
        !Number.isInteger(p.y) ||
        !Number.isInteger(p.d) ||
        p.d <= 0 ||
        p.i < 0 ||
        p.i >= s.n
      ) {
        throw new Error(
          `untangle executeMove: bad point ${JSON.stringify(p)} (i in [0,${s.n}), d>0, all integral)`,
        );
      }
      ns.pts[p.i] = { x: p.x, y: p.y, d: p.d };
    }
    ns.crosses = findCrossings(ns.pts, ns.edges).crosses;
    return ns;
  },

  finishesByDeduction: nothingToDeduce,
  // The layout comes from a planarity test and is kept for the hint and
  // Solve, which need it next.
  hasNoSolution: (s) => solvedLayout(s.n, s.w, s.edges) === null,
  status: (s) => (s.crosses.includes(true) ? "ongoing" : "solved"),
  notApplicable: {
    findMistakes:
      "Any arrangement of the points with no lines crossing wins, so there is no single answer to check a move against.",
    transposeParams:
      "The points move about a square area, so the board is the same shape either way round.",
  },

  // --- hint (the move that clears the most crossings; see hint.ts) ---
  hint: (s, aux, ui) => deduceUntangleHintPlan(s, aux, ui?.snapToGrid ?? false),
  hintRungs: UNTANGLE_RUNGS,
  hintMarks: {
    roles: {
      ring: "the move the step decides: the point to move, drawn in the hint's color, with a line in the same color running to the spot to drop it on, which is also drawn as a point. When only a few crossings are left, the hint may move several points together so that none of their lines crosses anything; the other points it will move next are ringed too (*these points* and *the others*, in its words), and it moves them one at a time.",
      outline:
        "the crossings the move clears, each with a ring round it, so you can count them.",
    },
  },
  hintKeepTrack: untangleKeepTrack,
  // Grab the point and drop it on the spot the hint marks.
  hintGesture: (s, _ui, ds, m) =>
    m.points.map(({ i, x, y, d }) =>
      drag(vertexPixel(s, i, ds.tileSize), {
        x: (x * ds.tileSize) / d,
        y: (y * ds.tileSize) / d,
      }),
    ),

  // --- solve (the solved layout, in the symmetry closest to the board) -
  solve: (_orig, curr, aux) => {
    const layout = solvedLayout(curr.n, curr.w, curr.edges, aux);
    // `null` only from the planarity test, which is a proof.
    if (layout === null) return { ok: false, error: NO_SOLUTION };
    const points = closestOrientation(layout, curr.pts, curr.w).map((p, i) => ({
      i,
      ...p,
    }));
    return { ok: true, move: { kind: "place", points, solving: true } };
  },

  // --- timing --------------------------------------------------------
  animLength: (a, b, dir, ui) => {
    if (ui.justMoved) {
      ui.animLength = 0;
      return 0;
    }
    const len = (dir < 0 ? a : b).justSolved ? SOLVEANIM_TIME : ANIM_TIME;
    ui.animLength = len;
    return len;
  },
  solvedFlash: () => FLASH_TIME,

  // --- preferences ---------------------------------------------------
  prefs: [
    {
      kw: "snap-to-grid",
      name: "Snap points to a grid",
      type: "boolean",
      get: (ui) => ui.snapToGrid,
      set: (ui, v) => {
        ui.snapToGrid = v;
      },
    },
    {
      kw: "show-crossed-edges",
      name: "Show edges that cross another edge",
      type: "boolean",
      get: (ui) => ui.showCrossedEdges,
      set: (ui, v) => {
        ui.showCrossedEdges = v;
      },
    },
    {
      kw: "vertex-style",
      name: "Display style for vertices",
      type: "choices",
      choices: ["Circles", "Numbers"],
      get: (ui) => (ui.vertexNumbers ? 1 : 0),
      set: (ui, v) => {
        ui.vertexNumbers = v === 1;
      },
    },
  ],

  // --- rendering -----------------------------------------------------
  // Color 0 is the dead space around the play area.
  paletteScheme: { board: COL_BACKGROUND },
  colors: (defaultBackground: Color): Color[] => {
    const { background, lowlight } = mkhighlight(defaultBackground);
    // Index-for-index with the upstream COL_* enum (untangle.c:57) up to the
    // flash, whose two colors (a gray and a white the board alternated
    // between) fold into one: the board blinks between itself and the flash.
    return [
      lowlight, // 0 COL_SYSBACKGROUND (dead space, darker)
      background, // 1 COL_BACKGROUND (play area)
      INK, // 2 COL_LINE
      ERROR, // 3 COL_CROSSEDLINE
      INK, // 4 COL_OUTLINE
      TWO[1], // 5 COL_POINT — a ball the player moves
      HELD, // 6 COL_DRAGPOINT — the vertex you have picked up
      // 7 COL_CURSORPOINT. The held vertex's own green, which it is never
      // shown beside: picking the vertex up is told by its neighbors, which
      // take the pair's other color.
      CURSOR,
      // 8 COL_NEIGHBOR — the vertices joined to the held one, against the
      // rest: the pair.
      TWO[0],
      FLASH, // 9 COL_FLASH
      HINT_ACTION, // 10 COL_HINT
    ];
  },
  computeSize: (p: UntangleParams, tileSize: number): Size => {
    const s = coordLimit(p.n) * tileSize;
    return { w: s, h: s };
  },
  newDrawState: (s, tileSize): UntangleDrawState => ({
    started: false,
    tileSize,
    bg: -1,
    dragPoint: -1,
    cursorPoint: -1,
    hintVertex: -1,
    hintTx: -1,
    hintTy: -1,
    x: new Array<number>(s.n).fill(-1),
    y: new Array<number>(s.n).fill(-1),
  }),
  redraw: (dr, ds, prev, s, _dir, ui, animTime, flashTime, hint) => {
    redrawUntangle(dr, ds, prev, s, ui, animTime, flashTime, hint);
  },
};

/** The quadrant test from untangle.c:1479 — is the vector (dx,dy) within
 * the ±45° cone of the arrow `button`'s direction? Screen convention: y
 * grows downward, so CURSOR_UP wants the most-negative-y cone. */
function quadrantOk(button: number, dx: number, dy: number): boolean {
  switch (button) {
    case CURSOR_UP:
      return dy <= -dx && dy <= dx;
    case CURSOR_DOWN:
      return dy >= -dx && dy >= dx;
    case CURSOR_LEFT:
      return dy >= dx && dy <= -dx;
    case CURSOR_RIGHT:
      return dy <= dx && dy >= -dx;
    default:
      return false;
  }
}

registerGame(untangleGame);
