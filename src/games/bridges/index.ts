/**
 * Bridges (Hashiwokakero) — port of upstream's `bridges.c`.
 *
 * Connect the numbered islands with horizontal/vertical bridges so every island
 * carries its number of bridge-ends, at most `maxb` join any pair, bridges never
 * cross, and all islands form one connected group.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import {
  type Game,
  type GamePref,
  type HintStep,
  type HintTrackVerdict,
  type PresetMenu,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import {
  click,
  drag,
  type GestureButton,
  type PointerAction,
} from "../../engine/hint-gesture.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  digitOf,
  endDrag,
  gridCursorMove,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
  newCursor,
  newDrag,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  startDrag,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newBridgesDesc } from "./generator.ts";
import {
  type BridgesHighlights,
  bridgesHint,
  bridgesKeepTrack,
  limitAfter,
  spanBridges,
  wantedLimit,
} from "./hint.ts";
import {
  type BridgesDrawState,
  border,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redrawBridges,
  toCoord,
} from "./render.ts";
import { type BridgesSpan, runMapCheck, solveFromScratch } from "./solver.ts";
import {
  BRIDGES_PRESETS,
  type BridgesMistake,
  type BridgesMove,
  type BridgesOp,
  type BridgesParams,
  type BridgesState,
  type BridgesUi,
  decodeParams,
  defaultParams,
  encodeParams,
  G_ISLAND,
  G_LINEH,
  G_LINEV,
  G_MARK,
  G_MARKH,
  G_MARKV,
  G_NOLINEH,
  G_NOLINEV,
  newStateFromDesc,
  paramConfig,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(state: BridgesState): BridgesUi {
  const first = state.islands[0];
  return {
    drag: newDrag(),
    dragged: false,
    todraw: 0,
    dragIsNoline: false,
    nlines: 0,
    cursor: newCursor(first?.x ?? 0, first?.y ?? 0),
    showPossible: false,
    autoMark: true,
  };
}

const prefs: GamePref<BridgesUi>[] = [
  {
    // `kw` is a stored preference key, so it keeps upstream's spelling even
    // though the field it drives no longer shares the hint system's word.
    kw: "show-hints",
    name: "Show possible bridge locations",
    type: "boolean",
    get: (ui) => ui.showPossible,
    set: (ui, v) => {
      ui.showPossible = v;
    },
  },
  {
    // Fork aid: auto-gray islands whose clue is satisfied (visual only, no lock).
    kw: "auto-mark-complete",
    name: "Highlight islands once their bridge count is met",
    type: "boolean",
    get: (ui) => ui.autoMark,
    set: (ui, v) => {
      ui.autoMark = v;
    },
  },
];

// --- Drag model (bridges.c ui_cancel_drag / update_drag_dst / finish_drag) ---

function uiCancelDrag(ui: BridgesUi): UiUpdate {
  endDrag(ui.drag);
  ui.drag.sx = -1;
  ui.drag.sy = -1;
  ui.drag.ex = -1;
  ui.drag.ey = -1;
  ui.dragged = false;
  return UI_UPDATE;
}

/** Work out which orthogonal island the drag from the anchor toward
 * pixel (nx,ny) targets, and how many bridges the release would set. Mutates
 * `ui` in place; null only when there is no drag. */
function updateDragDst(
  s: BridgesState,
  ui: BridgesUi,
  ts: number,
  b: number,
  nx: number,
  ny: number,
): UiUpdate | null {
  if (ui.drag.sx === -1 || ui.drag.sy === -1) return null;
  ui.drag.ex = -1;
  ui.drag.ey = -1;

  const half = Math.trunc(ts / 2);
  const ox = toCoord(ui.drag.sx, ts, b) + half;
  const oy = toCoord(ui.drag.sy, ts, b) + half;
  let dx = 0;
  let dy = 0;
  if (Math.abs(nx - ox) < Math.abs(ny - oy)) dy = ny < oy ? -1 : 1;
  else dx = nx < ox ? -1 : 1;
  const nextX = ui.drag.sx + dx;
  const nextY = ui.drag.sy + dy;
  if (!s.inGrid(nextX, nextY)) return UI_UPDATE;
  const gtype = dx ? G_LINEH : G_LINEV;
  const ntype = dx ? G_NOLINEH : G_NOLINEV;
  const mtype = dx ? G_MARKH : G_MARKV;
  const nc = s.idx(nextX, nextY);

  if (ui.dragIsNoline) {
    ui.todraw = ntype;
  } else if (!(s.grid[nc] & gtype)) {
    ui.todraw = gtype;
    ui.nlines = 1;
  } else if (s.lines[nc] === s.maximum(dx, nextX, nextY)) {
    ui.todraw = 0;
    ui.nlines = 0;
  } else {
    ui.todraw = gtype;
    ui.nlines = s.lines[nc] + 1;
  }

  const is = s.islandAt(ui.drag.sx, ui.drag.sy);
  if (!is) return UI_UPDATE;
  const pt = is.points.find((p) => p.dx === dx && p.dy === dy);
  if (!pt || pt.off === 0) return UI_UPDATE;
  if (s.grid[nc] & mtype) return UI_UPDATE; // don't change marked lines
  if (ui.dragIsNoline) {
    const span = { x1: is.x, y1: is.y, x2: is.x + pt.off * dx, y2: is.y + pt.off * dy };
    if (!lowerLimit(s, span)) return UI_UPDATE; // a full bundle with no limit to lower
  } else {
    if (s.possibles(dx, nextX, nextY) === 0) return UI_UPDATE; // not possible
    if (s.grid[nc] & ntype) return UI_UPDATE; // no bridge over a no-line
  }
  ui.drag.ex = is.x + pt.off * dx;
  ui.drag.ey = is.y + pt.off * dy;
  return UI_UPDATE;
}

/**
 * The secondary drag lowers the most bridges a span may carry by one:
 * no limit, then each limit down to one, then none at all (the no-line
 * cross), then no limit again. Every stop on the way is weaker than the next,
 * so a player heading for "at most one" or for the cross never passes through a
 * mark that claims more than they mean. A limit never drops below the bridges
 * already drawn, so over a bundle the cycle skips the cross and wraps to no
 * limit instead. `null` when there is nothing to lower: a full bundle with no
 * limit on it.
 */
function lowerLimit(s: BridgesState, span: BridgesSpan): BridgesOp[] | null {
  const dx = Math.sign(span.x2 - span.x1);
  const cx = span.x1 + dx;
  const cy = span.y1 + Math.sign(span.y2 - span.y1);
  const cross = { op: "N" as const, ...span };
  const limit = (n: number): BridgesOp => ({ op: "C", ...span, n });
  if (s.gridAt(cx, cy) & (dx ? G_NOLINEH : G_NOLINEV)) return [cross];
  const drawn = s.gridCount(cx, cy, dx ? G_LINEH : G_LINEV);
  const now = s.maximum(dx, cx, cy);
  const next = now - 1;
  if (next >= Math.max(drawn, 1)) return [limit(next)];
  const lifted = now < s.maxb ? [limit(s.maxb)] : [];
  if (drawn === 0) return [...lifted, cross];
  return lifted.length ? lifted : null;
}

function finishDrag(s: BridgesState, ui: BridgesUi): BridgesMove | UiUpdate | null {
  const { sx, sy, ex, ey } = ui.drag;
  if (sx === -1 || sy === -1) return null;
  if (ex === -1 || ey === -1) return uiCancelDrag(ui);
  const span = { x1: sx, y1: sy, x2: ex, y2: ey };
  const ops: BridgesOp[] | null = ui.dragIsNoline
    ? lowerLimit(s, span)
    : [{ op: "L", ...span, n: ui.nlines }];
  uiCancelDrag(ui);
  return ops ? { ops } : UI_UPDATE;
}

function interpretMove(
  s: BridgesState,
  ui: BridgesUi,
  ds: BridgesDrawState,
  p: Point,
  button: number,
): BridgesMove | null | UiUpdate {
  const ts = ds.tileSize;
  const b = border(ts);
  const gx = fromCoord(p.x, ts, b);
  const gy = fromCoord(p.y, ts, b);
  const shift = (button & MOD_SHFT) !== 0;
  const control = (button & MOD_CTRL) !== 0;
  const btn = stripModifiers(button);

  if (btn === LEFT_BUTTON || btn === RIGHT_BUTTON) {
    if (!s.inGrid(gx, gy)) return null;
    ui.cursor.visible = false;
    if (s.gridAt(gx, gy) & G_ISLAND) {
      startDrag(ui.drag, gx, gy);
      ui.drag.ex = -1;
      ui.drag.ey = -1;
      return UI_UPDATE;
    }
    return uiCancelDrag(ui);
  }

  if (btn === LEFT_DRAG || btn === RIGHT_DRAG) {
    if (
      s.inGrid(ui.drag.sx, ui.drag.sy) &&
      (gx !== ui.drag.sx || gy !== ui.drag.sy) &&
      !(s.gridAt(ui.drag.sx, ui.drag.sy) & G_MARK)
    ) {
      ui.dragged = true;
      ui.dragIsNoline = btn === RIGHT_DRAG;
      return updateDragDst(s, ui, ts, b, p.x, p.y);
    }
    ui.drag.ex = -1;
    ui.drag.ey = -1;
    return UI_UPDATE;
  }

  if (btn === LEFT_RELEASE || btn === RIGHT_RELEASE) {
    // The whole release is gated on `drag.live`, not just the bridge half: the
    // engine ends a live drag when the board changes under it, and the *click*
    // path below would otherwise still toggle the mark on the island this
    // gesture pressed — a move committed from a board that no longer exists.
    if (!ui.drag.live) return uiCancelDrag(ui);
    if (ui.dragged) return finishDrag(s, ui);
    if (!s.inGrid(ui.drag.sx, ui.drag.sy) || gx !== ui.drag.sx || gy !== ui.drag.sy) {
      return uiCancelDrag(ui);
    }
    uiCancelDrag(ui);
    if (!(s.gridAt(gx, gy) & G_ISLAND)) return null;
    return { ops: [{ op: "M", x: gx, y: gy }] };
  }

  if (isCursorMove(btn)) {
    ui.cursor.visible = true;
    if (control || shift) {
      startDrag(ui.drag, ui.cursor.x, ui.cursor.y);
      ui.dragged = true;
      ui.dragIsNoline = !control;
    }
    if (ui.dragged) {
      const moved = gridCursorMove(btn, ui.cursor.x, ui.cursor.y, s.w, s.h, false);
      if (!moved) return null;
      const half = Math.trunc(ts / 2);
      updateDragDst(
        s,
        ui,
        ts,
        b,
        toCoord(moved.x, ts, b) + half,
        toCoord(moved.y, ts, b) + half,
      );
      return finishDrag(s, ui);
    }
    // Not dragging: cone-search for the next island in the pressed direction.
    const dx = btn === CURSOR_RIGHT ? 1 : btn === CURSOR_LEFT ? -1 : 0;
    const dy = btn === CURSOR_DOWN ? 1 : btn === CURSOR_UP ? -1 : 0;
    // orthorder tweak so LEFT after a stray upward RIGHT tends back downward.
    const orthorder = btn === CURSOR_LEFT || btn === CURSOR_UP ? 1 : -1;
    const dorthx = (1 - Math.abs(dx)) * orthorder;
    const dorthy = (1 - Math.abs(dy)) * orthorder;
    for (let orth = 0; ; orth++) {
      let oingrid = false;
      // Search an outward cone only: never further sideways than forward.
      for (let dir = Math.max(orth, 1); ; dir++) {
        let dingrid = false;
        for (const side of [orth, -orth]) {
          const nx = ui.cursor.x + dir * dx + side * dorthx;
          const ny = ui.cursor.y + dir * dy + side * dorthy;
          if (!s.inGrid(nx, ny)) continue;
          dingrid = true;
          oingrid = true;
          if (s.gridAt(nx, ny) & G_ISLAND) {
            ui.cursor.x = nx;
            ui.cursor.y = ny;
            return UI_UPDATE;
          }
        }
        if (!dingrid) break;
      }
      if (!oingrid) return UI_UPDATE;
    }
  }

  if (btn === CURSOR_SELECT || btn === CURSOR_SELECT2) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    if (ui.dragged || btn === CURSOR_SELECT2) {
      // ui_cancel_drag clears the far end, so C always toggles the island mark.
      uiCancelDrag(ui);
      return { ops: [{ op: "M", x: ui.cursor.x, y: ui.cursor.y }] };
    }
    const v = s.gridAt(ui.cursor.x, ui.cursor.y);
    if (v & G_ISLAND) {
      ui.dragged = true;
      startDrag(ui.drag, ui.cursor.x, ui.cursor.y);
      ui.drag.ex = -1;
      ui.drag.ey = -1;
      // Only a plain CURSOR_SELECT gets here, so this is a bridge drag.
      ui.dragIsNoline = false;
      return UI_UPDATE;
    }
    return null;
  }

  // Digit / hex letter: jump the cursor to the nearest island with that clue.
  // `0` stands for sixteen, the largest clue an island can carry.
  const digit = digitOf(btn);
  if (digit !== null || (btn >= 0x61 && btn <= 0x66) || (btn >= 0x41 && btn <= 0x46)) {
    let number: number;
    if (digit !== null) number = digit === 0 ? 16 : digit;
    else if (btn >= 0x61 && btn <= 0x66) number = 10 + btn - 0x61;
    else number = 10 + btn - 0x41;

    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    let bestX = -1;
    let bestY = -1;
    let bestSq = -1;
    for (const is of s.islands) {
      if (is.count !== number) continue;
      if (is.x === ui.cursor.x && is.y === ui.cursor.y) continue;
      const ddx = is.x - ui.cursor.x;
      const ddy = is.y - ui.cursor.y;
      const sq = ddx * ddx + ddy * ddy;
      if (bestSq === -1 || sq < bestSq) {
        bestX = is.x;
        bestY = is.y;
        bestSq = sq;
      }
    }
    if (bestX !== -1) {
      ui.cursor.x = bestX;
      ui.cursor.y = bestY;
      return UI_UPDATE;
    }
    return null;
  }

  // 'g'/'G' toggles the possible-bridge overlay.
  if (btn === 0x67 || btn === 0x47) {
    ui.showPossible = !ui.showPossible;
    return UI_UPDATE;
  }

  return null;
}

// --- executeMove (bridges.c execute_move) ---

function executeMove(s: BridgesState, m: BridgesMove): BridgesState {
  // A move is an op list, not a union, so there is no discriminant to narrow to
  // `never`: check the one field the dispatch reads (see `rejectMove`).
  if (!Array.isArray(m.ops)) rejectMove(m, "bridges: executeMove");

  const ret = s.clone();
  for (const op of m.ops) {
    if (op.op === "S") {
      // The solver's marker: what follows is its answer, played as bridges.
    } else if (op.op === "L" || op.op === "N" || op.op === "C") {
      if (!ret.inGrid(op.x1, op.y1) || !ret.inGrid(op.x2, op.y2))
        throw new Error(`bridges executeMove: ${op.op} endpoint off-grid`);
      if ((op.x1 !== op.x2 ? 1 : 0) + (op.y1 !== op.y2 ? 1 : 0) !== 1)
        throw new Error(`bridges executeMove: ${op.op} not orthogonal`);
      const is1 = ret.islandAt(op.x1, op.y1);
      const is2 = ret.islandAt(op.x2, op.y2);
      if (!is1 || !is2)
        throw new Error(`bridges executeMove: ${op.op} endpoint not an island`);
      if (op.op === "L" && (op.n < 0 || op.n > ret.maxb))
        throw new Error("bridges executeMove: L count out of range");
      if (op.op === "C") {
        // A limit below the bridges already drawn would be a board that
        // contradicts its own marks, which no gesture and no hint produces.
        const dx = Math.sign(op.x2 - op.x1);
        const cx = op.x1 + dx;
        const cy = op.y1 + Math.sign(op.y2 - op.y1);
        const drawn = ret.gridCount(cx, cy, dx ? G_LINEH : G_LINEV);
        if (op.n < 1 || op.n > ret.maxb || op.n < drawn)
          throw new Error("bridges executeMove: C limit out of range");
        ret.islandJoin(is1, is2, op.n, true);
      } else {
        ret.islandJoin(is1, is2, op.op === "L" ? op.n : -1, false);
      }
    } else if (op.op === "M") {
      if (!ret.inGrid(op.x, op.y)) throw new Error("bridges executeMove: M off-grid");
      const is1 = ret.islandAt(op.x, op.y);
      if (!is1) throw new Error("bridges executeMove: M not an island");
      ret.islandTogglemark(is1);
    } else {
      return assertNever(op, "bridges: executeMove");
    }
  }
  ret.mapUpdatePossibles();
  // Run for the group warnings it leaves on the grid.
  runMapCheck(ret);
  return ret;
}

/**
 * One drag along a span per bridge it still needs, and one secondary drag per
 * stop its limit must be lowered by. A drag starts from an unmarked end, since
 * a marked island takes no drag.
 */
function hintGesture(
  s: BridgesState,
  _ui: BridgesUi,
  ds: BridgesDrawState,
  m: BridgesMove,
): readonly PointerAction[] {
  const ts = ds.tileSize;
  const b = border(ts);
  const half = Math.trunc(ts / 2);
  const at = (x: number, y: number): Point => ({
    x: toCoord(x, ts, b) + half,
    y: toCoord(y, ts, b) + half,
  });
  const out: PointerAction[] = [];
  let cur = s;
  const along = (span: BridgesSpan, button: GestureButton): PointerAction => {
    const { x1, y1, x2, y2 } = span;
    if (!(cur.gridAt(x1, y1) & G_MARK)) return drag(at(x1, y1), at(x2, y2), { button });
    if (!(cur.gridAt(x2, y2) & G_MARK)) return drag(at(x2, y2), at(x1, y1), { button });
    // Both ends marked done by the player: a tap takes one mark off, as the
    // player would before adding to it.
    out.push(click(at(x1, y1)));
    cur = executeMove(cur, { ops: [{ op: "M", x: x1, y: y1 }] });
    return drag(at(x1, y1), at(x2, y2), { button });
  };
  for (const op of m.ops) {
    if (op.op === "L") {
      for (let n = spanBridges(cur, op); n < op.n; n++) {
        out.push(along(op, "primary"));
        cur = executeMove(cur, { ops: [{ ...op, n: n + 1 }] });
      }
    } else if (op.op === "N" || op.op === "C") {
      for (let i = 0; i <= s.maxb + 1; i++) {
        if (limitAfter(cur, op, { ops: [] }) === wantedLimit(op)) break;
        const lowered = lowerLimit(cur, { x1: op.x1, y1: op.y1, x2: op.x2, y2: op.y2 });
        if (!lowered) break;
        out.push(along(op, "secondary"));
        cur = executeMove(cur, { ops: lowered });
      }
    }
  }
  return out;
}

// --- solve (bridges.c game_state_diff over a from-scratch solution) ---

function stateDiff(src: BridgesState, dest: BridgesState): BridgesOp[] {
  const ops: BridgesOp[] = [{ op: "S" }];
  for (let i = 0; i < src.islands.length; i++) {
    const isS = src.islands[i];
    const isD = dest.islands[i];
    for (let d = 0; d < isS.points.length; d++) {
      const { x, y, dx, dy } = isS.points[d];
      if (dx === -1 || dy === -1) continue; // right/down only
      const orth = dest.islandAt(dest.islandOrthX(isD, d), dest.islandOrthY(isD, d));
      if (!orth) continue;
      const ends = { x1: isS.x, y1: isS.y, x2: orth.x, y2: orth.y };
      const gline = dx ? G_LINEH : G_LINEV;
      const nline = dx ? G_NOLINEH : G_NOLINEV;
      if (src.gridCount(x, y, gline) !== dest.gridCount(x, y, gline)) {
        ops.push({ op: "L", ...ends, n: dest.gridCount(x, y, gline) });
      }
      if ((src.gridAt(x, y) & nline) !== (dest.gridAt(x, y) & nline)) {
        ops.push({ op: "N", ...ends });
      }
      // The solution is its bridges, so a limit the player wrote is lifted
      // rather than matched to one the solver derived on the way.
      if (src.maximum(dx, x, y) < src.maxb) ops.push({ op: "C", ...ends, n: src.maxb });
    }
    if ((src.gridAt(isS.x, isS.y) & G_MARK) !== (dest.gridAt(isD.x, isD.y) & G_MARK)) {
      ops.push({ op: "M", x: isS.x, y: isS.y });
    }
  }
  return ops;
}

function solve(orig: BridgesState, curr: BridgesState): SolveResult<BridgesMove> {
  const solved = orig.workingCopy();
  if (solveFromScratch(solved, 10) === 0) {
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  }
  return { ok: true, move: { ops: stateDiff(curr, solved) } };
}

// --- findMistakes: flag player marks the unique solution can't support ---

/**
 * A span is wrong when it carries more bridges than the solution, or when the
 * player has limited it below the solution's count: an "at most" mark under
 * the bridges it needs, or a cross over a span that needs any. The cross is
 * the bottom of the same scale, so the two are one rule, and both are a span
 * the board can light up.
 */
function findMistakes(state: BridgesState): readonly BridgesMistake[] {
  const solved = state.workingCopy();
  if (solveFromScratch(solved, 10) === 0) return [];
  const out: BridgesMistake[] = [];
  for (const is of state.islands) {
    for (const pt of is.points) {
      if (pt.dx === -1 || pt.dy === -1) continue; // span once (right/down)
      if (pt.off === 0) continue;
      const gline = pt.dx ? G_LINEH : G_LINEV;
      const nline = pt.dx ? G_NOLINEH : G_NOLINEV;
      const needed = solved.gridCount(pt.x, pt.y, gline);
      const limit =
        state.gridAt(pt.x, pt.y) & nline ? 0 : state.maximum(pt.dx, pt.x, pt.y);
      if (state.gridCount(pt.x, pt.y, gline) > needed || limit < needed) {
        out.push({
          x1: is.x,
          y1: is.y,
          x2: is.x + pt.off * pt.dx,
          y2: is.y + pt.off * pt.dy,
        });
      }
    }
  }
  return out;
}

/** Bridges' difficulty contract (`engine/difficulty.ts`). `solveFromScratch`
 * clears the board first and returns 1 for fully solved, 0 otherwise, with no
 * contradiction signal to report. */
const difficulty: DifficultyContract<BridgesParams> = {
  solveAtCap: (p, desc, cap) =>
    solveFromScratch(newStateFromDesc(p, desc), cap) === 1 ? "solved" : "unsolved",
};

export const bridgesGame: Game<
  BridgesParams,
  BridgesState,
  BridgesMove,
  BridgesUi,
  BridgesDrawState,
  BridgesMistake,
  BridgesHighlights
> = {
  id: "bridges",
  preferredTileSize: PREFERRED_TILE_SIZE,

  defaultParams,
  presets(): PresetMenu<BridgesParams> {
    return {
      title: "Type",
      submenu: BRIDGES_PRESETS.map((p) => ({ params: { ...p } })),
    };
  },
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newBridgesDesc,
  newState: newStateFromDesc,
  newUi,

  interpretMove,
  executeMove,

  status(s: BridgesState): GameStatus {
    // On a copy: the check rewrites the grid's warning flags as it groups.
    return runMapCheck(s.clone()) ? "solved" : "ongoing";
  },

  solve,
  difficulty,
  findMistakes,

  textFormat,
  prefs,

  colors,
  computeSize,
  newDrawState,
  hint: bridgesHint,
  hintMarks: {
    roles: {
      ring: "what the step decides along a line, in the hint color. Bridges drawn in the hint color are the ones to add; a line that already carries a bridge keeps it in the board's own ink, so you can see how many the hint is asking you to add. A pair of small crosses means no bridge may ever run there, and a ≤1 means at most one may: the same marks you draw yourself with the right mouse button, and later hints count on them being there. The sentence points at these by direction: “this way”.",
      outline:
        "what the step reasons from. The island the sentence is about (“this 5”) is recolored in the hint color. The islands it counts, and the bridges between them, are outlined in a second color: when a hint says “these 2 islands” or “the outlined group”, these are the ones it means.",
    },
  },
  hintKeepTrack: (
    m: BridgesMove,
    step: HintStep<BridgesMove>,
    state: BridgesState,
  ): HintTrackVerdict =>
    bridgesKeepTrack(m, step as HintStep<BridgesMove, BridgesHighlights>, state),
  hintGesture,

  redraw(
    dr,
    ds,
    prev,
    s,
    _dir,
    ui,
    _animTime,
    flashTime,
    hintStep?: HintStep<BridgesMove>,
    mistakes?: readonly BridgesMistake[],
  ): void {
    redrawBridges(
      dr,
      ds,
      prev,
      s,
      ui,
      flashTime,
      mistakes,
      hintStep as HintStep<BridgesMove, BridgesHighlights> | undefined,
    );
  },
  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(bridgesGame);
