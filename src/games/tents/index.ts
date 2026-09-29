/**
 * Tents — native TS port of `tents.c`. Place a tent orthogonally next to each
 * tree in a one-to-one matching, no two tents even diagonally adjacent, and
 * each row/column holding its edge-clue number of tents.
 *
 * Input is drag-based (upstream): pressing a button starts a one-cell drag;
 * releasing enacts it. A left click sets a blank to a tent (or clears a
 * non-blank); a right click sets a blank to a non-tent; a right-drag paints
 * blanks to non-tents along one row/column. A keyboard cursor places
 * tents/non-tents via select/select2 and the literal keys T/N/B.
 *
 * The link is this fork's notation: a left drag between a tree and the tent
 * beside it (either way) joins the two, or parts them, and a drag between a
 * tree and an open square places the tent and joins it in one go. `L` then an
 * arrow does the same from the keyboard. The hint reasons from links, and places one where
 * a deduction rests on a pairing the board does not show.
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { fromCoord as fromCoordE } from "../../engine/geometry.ts";
import { commonHintRefusal } from "../../engine/hint-refusal.ts";
import { matching } from "../../engine/latin.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  endDrag,
  hideCursor,
  isCursorMove,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  moveCursor,
  moveDrag,
  newCursor,
  newDrag,
  RIGHT_BUTTON,
  showCursor,
  startDrag,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import { newTentsDesc } from "./generator.ts";
import { tentsHint, tentsKeepTrack } from "./hint.ts";
import {
  colors,
  computeSize,
  dirTo,
  dragLink,
  dragXform,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type TentsDrawState,
  TLBORDER,
} from "./render.ts";
import { tentsSolve } from "./solver.ts";
import {
  BLANK,
  canJoin,
  DIFF_COUNT,
  DX,
  DY,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  MAXDIR,
  NONTENT,
  newState,
  paramConfig,
  partnerOf,
  presets,
  status,
  TENT,
  type TentsMistake,
  type TentsMove,
  type TentsParams,
  type TentsState,
  type TentsUi,
  TREE,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

// Keyboard letter codes (both cases, tolerant of frontend casing).
const KEY_T = "T".charCodeAt(0);
const KEY_t = "t".charCodeAt(0);
const KEY_N = "N".charCodeAt(0);
const KEY_n = "n".charCodeAt(0);
const KEY_B = "B".charCodeAt(0);
const KEY_b = "b".charCodeAt(0);
const KEY_L = "L".charCodeAt(0);
const KEY_l = "l".charCodeAt(0);

function newUi(_state: TentsState): TentsUi {
  return {
    drag: newDrag(),
    dragButton: -1,
    dragOk: false,
    cursor: newCursor(),
    linkArmed: false,
  };
}

function interpretMove(
  state: TentsState,
  ui: TentsUi,
  ds: TentsDrawState,
  p: Point,
  rawButton: number,
): TentsMove | null | UiUpdate {
  const { w, h, grid } = state;
  const shift = rawButton & MOD_SHFT;
  const control = rawButton & MOD_CTRL;
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;
  const fromCoord = (v: number) => fromCoordE(v, ts, TLBORDER);

  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    const x = fromCoord(p.x);
    const y = fromCoord(p.y);
    if (x < 0 || y < 0 || x >= w || y >= h) return null;
    ui.dragButton = button;
    startDrag(ui.drag, x, y);
    ui.dragOk = true;
    ui.linkArmed = false;
    hideCursor(ui.cursor);
    return UI_UPDATE;
  }

  if ((isMouseDrag(button) || isMouseRelease(button)) && ui.dragButton >= 0) {
    // The engine ends a live drag when the board changes under it. The gesture
    // is still physically in progress, so finish the bookkeeping the frontend
    // started — but commit nothing from an anchor the undo invalidated.
    if (!ui.drag.live) {
      if (isMouseRelease(button)) ui.dragButton = -1;
      return UI_UPDATE;
    }
    let x = fromCoord(p.x);
    let y = fromCoord(p.y);
    if (x < 0 || y < 0 || x >= w || y >= h) {
      ui.dragOk = false;
    } else {
      // Drags are limited to one row or column: move the axis-nearer
      // coordinate back to the drag start.
      if (Math.abs(x - ui.drag.sx) < Math.abs(y - ui.drag.sy)) x = ui.drag.sx;
      else y = ui.drag.sy;
      moveDrag(ui.drag, x, y);
      ui.dragOk = true;
    }

    if (isMouseDrag(button)) return UI_UPDATE;

    // Release — enact the drag.
    if (!ui.dragOk) {
      ui.dragButton = -1;
      endDrag(ui.drag);
      return UI_UPDATE;
    }
    const link = dragLink(ui, state);
    const xmin = Math.min(ui.drag.sx, ui.drag.ex);
    const xmax = Math.max(ui.drag.sx, ui.drag.ex);
    const ymin = Math.min(ui.drag.sy, ui.drag.ey);
    const ymax = Math.max(ui.drag.sy, ui.drag.ey);
    const cells: { x: number; y: number; v: number }[] = [];
    for (let yy = ymin; yy <= ymax; yy++) {
      for (let xx = xmin; xx <= xmax; xx++) {
        const v = dragXform(ui, state, xx, yy);
        if (grid[yy * w + xx] !== v) cells.push({ x: xx, y: yy, v });
      }
    }
    ui.dragButton = -1;
    endDrag(ui.drag);
    if (link) return link;
    if (cells.length === 0) return UI_UPDATE;
    return { type: "cells", cells };
  }

  // `L` arms a link from the cursor's tent, tree or open square, and the next
  // arrow joins it to the neighbor that way (or parts them), taking the cursor
  // along: the keyboard's form of the link drag.
  if (ui.linkArmed) {
    ui.linkArmed = false;
    const delta = cursorDelta(button);
    if (delta) {
      const { x, y } = ui.cursor;
      const x2 = x + delta.dx;
      const y2 = y + delta.dy;
      const d = dirTo(delta.dx, delta.dy);
      if (
        x2 >= 0 &&
        x2 < w &&
        y2 >= 0 &&
        y2 < h &&
        canJoin(grid, y * w + x, y2 * w + x2)
      ) {
        moveCursor(ui.cursor, button, w, h);
        return { type: "link", x, y, d, on: state.links[y * w + x] !== d };
      }
    }
    if (button === KEY_L || button === KEY_l || delta) return UI_UPDATE;
  }
  if ((button === KEY_L || button === KEY_l) && ui.cursor.visible) {
    const v = grid[ui.cursor.y * w + ui.cursor.x];
    if (v === NONTENT) return null;
    ui.linkArmed = true;
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    // The shared helper carries the cursor; painting the cells it passed over
    // is Tents' own verb, so it reads the index either side of the move.
    const idx0 = ui.cursor.x + w * ui.cursor.y;
    const changed = moveCursor(ui.cursor, button, w, h);
    if (shift || control) {
      const idx1 = ui.cursor.x + w * ui.cursor.y;
      const cells: { x: number; y: number; v: number }[] = [];
      const idxs = idx0 !== idx1 ? [idx0, idx1] : [idx0];
      for (const i of idxs) {
        if (grid[i] === BLANK || (control && grid[i] === TENT)) {
          cells.push({ x: i % w, y: Math.floor(i / w), v: NONTENT });
        }
      }
      if (cells.length) return { type: "cells", cells };
    }
    return changed ? UI_UPDATE : null;
  }

  if (ui.cursor.visible) {
    const v = grid[ui.cursor.y * w + ui.cursor.x];
    let rep: number | null = null;
    if (v !== TREE) {
      if (button === CURSOR_SELECT) rep = v === BLANK ? TENT : BLANK;
      else if (button === CURSOR_SELECT2) rep = v === BLANK ? NONTENT : BLANK;
      else if (button === KEY_T || button === KEY_t) rep = TENT;
      else if (button === KEY_N || button === KEY_n) rep = NONTENT;
      else if (button === KEY_B || button === KEY_b) rep = BLANK;
    }
    if (rep !== null) {
      return { type: "cells", cells: [{ x: ui.cursor.x, y: ui.cursor.y, v: rep }] };
    }
  } else if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    showCursor(ui.cursor);
    return UI_UPDATE;
  }

  return null;
}

/** Solve from the trees and edge numbers alone, never the player's marks.
 * `ret` is 1 when both the grid and the tent–tree links come out complete, 0
 * on an inconsistency the solver can prove, and 2 when it simply runs dry. */
function solveFromClues(state: TentsState, cap = DIFF_COUNT - 1) {
  const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : BLANK));
  return tentsSolve(state.w, state.h, puzzle, state.numbers, cap);
}

function solve(
  orig: TentsState,
  _curr: TentsState,
  aux?: string,
): SolveResult<TentsMove> {
  if (aux) {
    // aux is "S;T<x>,<y>;…" — the generator's known solution.
    const tents: number[] = [];
    for (const part of aux.split(";")) {
      const m = /^T(\d+),(\d+)$/.exec(part);
      if (m) tents.push(Number(m[2]) * orig.w + Number(m[1]));
    }
    if (tents.length > 0) return { ok: true, move: { type: "solve", tents } };
  }
  const { ret, soln } = solveFromClues(orig);
  if (ret !== 1) {
    return {
      ok: false,
      error:
        ret === 0
          ? "This puzzle is not self-consistent"
          : "Unable to find a unique solution for this puzzle",
    };
  }
  const tents: number[] = [];
  for (let i = 0; i < soln.length; i++) if (soln[i] === TENT) tents.push(i);
  return { ok: true, move: { type: "solve", tents } };
}

/** Re-solve from the clues and flag every placed square that contradicts the
 * unique solution (a tent where none belongs, a non-tent where a tent
 * belongs), and every link no pairing of that solution can hold. Blanks are
 * never mistakes; a non-uniquely-solvable board yields none. The hint takes
 * tents, grass and links as facts, so this must vouch for all three. */
function findMistakes(state: TentsState): readonly TentsMistake[] {
  const { ret, soln } = solveFromClues(state);
  if (ret !== 1) return [];
  const { w, h, grid } = state;
  const out: TentsMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const g = grid[y * w + x];
      const s = soln[y * w + x];
      if (g === TENT && s !== TENT) out.push({ x, y, kind: "tent" });
      else if (g === NONTENT && s === TENT) out.push({ x, y, kind: "nontent" });
    }
  }
  for (const i of badLinks(state, soln)) {
    out.push({ x: i % w, y: Math.floor(i / w), kind: "link" });
  }
  return out;
}

/**
 * The tents whose link no pairing of the solution `soln` can hold, in reading
 * order.
 *
 * The solution's tents are unique but its pairing need not be: two trees and
 * two tents round a square pair either way. So a link is judged by whether
 * some pairing keeps it, together with every link before it that passed.
 * Judging each link alone would pass two that exclude each other.
 */
function badLinks(state: TentsState, soln: Int8Array): number[] {
  const { w, h, links } = state;
  const trees: number[] = [];
  const tents: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (soln[i] === TREE) trees.push(i);
    else if (soln[i] === TENT) tents.push(i);
  }
  const treeId = new Map(trees.map((t, k) => [t, k]));
  const kept = new Map<number, number>(); // tent square -> tree square
  const pairs = (): boolean => {
    const taken = new Set(kept.values());
    const adj = tents.map((t) => {
      const tree = kept.get(t);
      if (tree !== undefined) return [treeId.get(tree) ?? -1];
      const out: number[] = [];
      for (let d = 1; d < MAXDIR; d++) {
        const x = (t % w) + DX(d);
        const y = Math.floor(t / w) + DY(d);
        const j = y * w + x;
        if (x >= 0 && x < w && y >= 0 && y < h && soln[j] === TREE && !taken.has(j))
          out.push(treeId.get(j) ?? -1);
      }
      return out;
    });
    const got = matching(
      tents.length,
      trees.length,
      adj,
      adj.map((l) => l.length),
    );
    return !got.includes(-1);
  };

  const bad: number[] = [];
  for (let i = 0; i < w * h; i++) {
    const tree = partnerOf(w, links, i);
    if (tree < 0 || state.grid[i] !== TENT) continue;
    if (soln[i] !== TENT || soln[tree] !== TREE) {
      bad.push(i);
      continue;
    }
    kept.set(i, tree);
    if (!pairs()) {
      kept.delete(i);
      bad.push(i);
    }
  }
  return bad;
}

/** Tents' difficulty contract (`engine/difficulty.ts`). */
const difficulty: DifficultyContract<TentsParams> = {
  solveAtCap: (p, desc, cap) => {
    const { ret } = solveFromClues(newState(p, desc), cap);
    return ret === 1 ? "solved" : ret === 0 ? "impossible" : "unsolved";
  },
};

export const tentsGame: Game<
  TentsParams,
  TentsState,
  TentsMove,
  TentsUi,
  TentsDrawState,
  TentsMistake
> = {
  id: "tents",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newTentsDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  hint: (state) =>
    commonHintRefusal(state.completed, findMistakes(state).length) ?? tentsHint(state),
  hintMarks: {
    roles: {
      ring: "the squares the step decides. When it asks for a link, the tent and the tree are ringed as one shape, and the link is drawn between them in the hint color.",
      outline:
        "what it reasons from: a tree, or a tent that already belongs to another tree, and the number of the row or column it counts with, which is shown in the hint's color.",
      stripes: 'the row or column the sentence calls "this row" or "this column".',
    },
  },
  hintKeepTrack: tentsKeepTrack,

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  flashLength: (from, to) => winFlash(from, to, FLASH_TIME),
};

registerGame(tentsGame);
