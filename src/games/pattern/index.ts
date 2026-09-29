/**
 * Pattern (Nonograms) — native TS port of `pattern.c`. Reconstruct a
 * black/white picture from the run-length clues listed beside every row and
 * column. Left-drag paints black (FULL), right-drag paints white/empty
 * (EMPTY), middle-drag clears to undecided (UNKNOWN); a stylus press cycles a
 * cell's value. The keyboard cursor paints with Ctrl/Shift held and the
 * select keys cycle a cell.
 */

import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { commonHintRefusal, DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { trackTargets } from "../../engine/hint-track.ts";
import { CELL, type Narration } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  endDrag,
  gridCursorMove,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MIDDLE_BUTTON,
  MIDDLE_DRAG,
  MIDDLE_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
  MOD_STYLUS,
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
import { newPatternDesc } from "./generator.ts";
import { cellAt } from "./hint-marks.ts";
import { type Marked, say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  fromCoord,
  newDrawState,
  type PatternDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  deduceHintPlan,
  findMistakes,
  type PatternHintMove,
  solveToString,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  GRID_EMPTY,
  GRID_FULL,
  GRID_UNKNOWN,
  type GridVal,
  newState,
  type PatternMistake,
  type PatternMove,
  type PatternParams,
  type PatternState,
  type PatternUi,
  paramConfig,
  presets,
  status,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: PatternState): PatternUi {
  return {
    drag: newDrag(),
    dragButton: 0,
    releaseButton: 0,
    state: GRID_UNKNOWN,
    cursor: newCursor(),
  };
}

function interpretMove(
  state: PatternState,
  ui: PatternUi,
  ds: PatternDrawState,
  p: Point,
  rawButton: number,
): PatternMove | null | UiUpdate {
  const control = (rawButton & MOD_CTRL) !== 0;
  const shift = (rawButton & MOD_SHFT) !== 0;
  const stylus = (rawButton & MOD_STYLUS) !== 0;
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;
  const { w, h } = state.common;
  const { grid } = state;

  let x = fromCoord(ts, w, p.x);
  let y = fromCoord(ts, h, p.y);

  // --- press: begin a drag ---
  if (
    x >= 0 &&
    x < w &&
    y >= 0 &&
    y < h &&
    (button === LEFT_BUTTON || button === RIGHT_BUTTON || button === MIDDLE_BUTTON)
  ) {
    const curr = grid[y * w + x];
    if (button === LEFT_BUTTON) {
      ui.dragButton = LEFT_DRAG;
      ui.releaseButton = LEFT_RELEASE;
      ui.state = stylus ? (((curr + 2) % 3) as GridVal) : GRID_FULL; // FULL→EMPTY→UNKNOWN
    } else if (button === RIGHT_BUTTON) {
      ui.dragButton = RIGHT_DRAG;
      ui.releaseButton = RIGHT_RELEASE;
      ui.state = stylus ? (((curr + 1) % 3) as GridVal) : GRID_EMPTY; // EMPTY→FULL→UNKNOWN
    } else {
      ui.dragButton = MIDDLE_DRAG;
      ui.releaseButton = MIDDLE_RELEASE;
      ui.state = GRID_UNKNOWN;
    }
    startDrag(ui.drag, x, y);
    ui.cursor.visible = false;
    return UI_UPDATE;
  }

  // --- drag: snap to a single line (except a middle/UNKNOWN area-clear) ---
  if (ui.drag.live && button === ui.dragButton) {
    if (ui.state !== GRID_UNKNOWN) {
      if (Math.abs(x - ui.drag.sx) > Math.abs(y - ui.drag.sy)) y = ui.drag.sy;
      else x = ui.drag.sx;
    }
    x = Math.max(0, Math.min(w - 1, x));
    y = Math.max(0, Math.min(h - 1, y));
    moveDrag(ui.drag, x, y);
    return UI_UPDATE;
  }

  // --- release: emit the rectangle fill if it changes anything ---
  if (ui.drag.live && button === ui.releaseButton) {
    const { sx, sy, ex, ey } = ui.drag;
    const x1 = Math.min(sx, ex);
    const x2 = Math.max(sx, ex);
    const y1 = Math.min(sy, ey);
    const y2 = Math.max(sy, ey);
    // A multi-cell paint drag (not a single click, not a clear) only fills
    // blank cells, so dragging across the board never rewrites a mark the
    // player already placed.
    const multiCell = x2 > x1 || y2 > y1;
    const onlyBlank = multiCell && ui.state !== GRID_UNKNOWN;
    let moveNeeded = false;
    for (let yy = y1; yy <= y2 && !moveNeeded; yy++) {
      for (let xx = x1; xx <= x2; xx++) {
        const i = yy * w + xx;
        if (state.common.immutable[i]) continue;
        const wouldChange = onlyBlank ? grid[i] === GRID_UNKNOWN : grid[i] !== ui.state;
        if (wouldChange) {
          moveNeeded = true;
          break;
        }
      }
    }
    endDrag(ui.drag);
    if (moveNeeded) {
      return {
        type: "fill",
        value: ui.state,
        x: x1,
        y: y1,
        w: x2 - x1 + 1,
        h: y2 - y1 + 1,
        onlyBlank,
      };
    }
    return UI_UPDATE;
  }

  // --- keyboard cursor movement (paints while Ctrl/Shift held) ---
  if (isCursorMove(button)) {
    const ox = ui.cursor.x;
    const oy = ui.cursor.y;
    const wasVisible = ui.cursor.visible;
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, w, h);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    ui.cursor.visible = true;
    const ret = moved || !wasVisible ? UI_UPDATE : null;
    if (!control && !shift) return ret;

    const newstate: GridVal = control ? (shift ? GRID_UNKNOWN : GRID_FULL) : GRID_EMPTY;
    if (
      grid[oy * w + ox] === newstate &&
      grid[ui.cursor.y * w + ui.cursor.x] === newstate
    ) {
      return ret;
    }
    return {
      type: "fill",
      value: newstate,
      x: Math.min(ox, ui.cursor.x),
      y: Math.min(oy, ui.cursor.y),
      w: Math.abs(ox - ui.cursor.x) + 1,
      h: Math.abs(oy - ui.cursor.y) + 1,
    };
  }

  // --- cursor select: cycle the current cell ---
  if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    const curr = grid[ui.cursor.y * w + ui.cursor.x];
    const newstate: GridVal =
      button === CURSOR_SELECT2
        ? curr === GRID_UNKNOWN
          ? GRID_EMPTY
          : curr === GRID_EMPTY
            ? GRID_FULL
            : GRID_UNKNOWN
        : curr === GRID_UNKNOWN
          ? GRID_FULL
          : curr === GRID_FULL
            ? GRID_EMPTY
            : GRID_UNKNOWN;
    return {
      type: "fill",
      value: newstate,
      x: ui.cursor.x,
      y: ui.cursor.y,
      w: 1,
      h: 1,
    };
  }

  return null;
}

// --- hint ------------------------------------------------------------------

/** What a Pattern hint step decides. `cells` are the forced target squares
 * (all one color — `value`), as indices into a grid `w` wide. */
export interface PatternHint {
  cells: number[];
  value: GridVal;
  w: number;
}

/** Narrate *why* the cells are forced, naming the marks the renderer draws for
 * them: the target cells ringed, never pre-filled (the narration says black vs
 * white); the row or column hatched and its clue in the action color; and the
 * already-placed marks the deduction leans on, outlined in their own color's
 * reference color (the cross-game element-type legend). The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(m: PatternHintMove, w: number): Narration {
  const at = (i: number) => cellAt(i, w);
  const marked: Marked = {
    cells: m.cells.map(at),
    refs: [...m.blackRefs, ...m.whiteRefs].map(at),
    line: m.line,
    orient: m.line < w ? "column" : "row",
  };
  const { reason } = m;
  switch (reason.kind) {
    case "overlap":
      return say.overlap(marked, reason.run, reason.slack);
    case "unreachable":
      return say.unreachable(marked);
    case "lineEmpty":
      return say.lineEmpty(marked);
    case "intersection":
      return say.intersection(marked, reason.black);
  }
}

function hint(state: PatternState): HintResult<PatternMove, PatternHint> {
  const refusal = commonHintRefusal(state.completed, findMistakes(state).length);
  if (refusal) return refusal;
  const plan = deduceHintPlan(state);
  if (plan.length === 0) {
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }
  const { w } = state.common;
  const steps: HintStep<PatternMove, PatternHint>[] = plan.map((m) => {
    const words = narrate(m, w);
    return {
      move: { type: "fillCells", value: m.value, cells: m.cells },
      explanation: words.text,
      words,
      highlights: { cells: m.cells, value: m.value, w },
    };
  });
  return { ok: true, steps };
}

/** The cells a move would actually change, mapped to their new value. */
function cellsChangedBy(m: PatternMove, state: PatternState): Map<number, GridVal> {
  const out = new Map<number, GridVal>();
  if (m.type === "solve") return out; // a solve is never "following" a step
  const { w, h } = state.common;
  const { grid } = state;
  const imm = state.common.immutable;
  const sz = w * h;
  if (m.type === "fillCells") {
    for (const i of m.cells) {
      if (i < 0 || i >= sz || imm[i]) continue;
      if (grid[i] !== m.value) out.set(i, m.value);
    }
    return out;
  }
  // `w`/`h` already name the grid's size, hence the renames.
  const { x: rx, y: ry, w: rw, h: rh, value, onlyBlank } = m;
  for (let yy = ry; yy < ry + rh; yy++) {
    for (let xx = rx; xx < rx + rw; xx++) {
      const i = yy * w + xx;
      if (imm[i]) continue;
      if (onlyBlank && grid[i] !== GRID_UNKNOWN) continue;
      if (grid[i] !== value) out.set(i, value);
    }
  }
  return out;
}

/** Classify a player move against a (possibly multi-cell) hint step: it must
 * set the hinted value into a subset of the step's cells and touch nothing
 * else. Filling all completes it; filling some keeps it on track (the step
 * shrinks so a later auto-hint fills only the rest); anything else drops the
 * plan to recompute. */
function hintKeepTrack(
  m: PatternMove,
  step: HintStep<PatternMove, PatternHint>,
  state: PatternState,
): HintTrackVerdict {
  const t = step.highlights;
  if (!t) return "off";
  const changed = cellsChangedBy(m, state);
  const { verdict, left } = trackTargets({
    targets: t.cells,
    changes: changed,
    key: (c) => c,
    want: () => t.value,
    holds: (c) => changed.has(c),
  });
  if (verdict === "onTrack") {
    step.highlights = { ...t, cells: left };
    step.move = { type: "fillCells", value: t.value, cells: left };
    if (step.words) {
      const kept = new Set(left.map((i) => CELL.key(cellAt(i, t.w))));
      step.words = step.words.narrow(
        (role, kind, key) => role !== "ring" || kind !== CELL.name || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}

export const patternGame: Game<
  PatternParams,
  PatternState,
  PatternMove,
  PatternUi,
  PatternDrawState,
  PatternMistake,
  PatternHint
> = {
  id: "pattern",
  // Pattern wants the raw MOD_STYLUS bit: with no right button to hand, a touch
  // press cycles the cell through its three states instead of just filling it.
  // `touch-input.test.ts` holds this declaration to an actual read.
  wantsStylusModifier: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newPatternDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve(orig) {
    const grid = solveToString(orig);
    if (!grid)
      return { ok: false, error: "Solving algorithm cannot complete this puzzle" };
    return { ok: true, move: { type: "solve", grid } };
  },

  hint,
  hintMarks: {
    roles: {
      ring: "the cells the step decides; the sentence says whether they must be black or white.",
      outline:
        "what the step reasons from: the numbers of its row or column, drawn in the hint color, and any squares already marked black or white that hold a run in place, outlined in a color of their own.",
      stripes: "the row or column the sentence names, running on through its numbers.",
    },
  },
  hintKeepTrack,
  findMistakes,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  flashLength: (a, b) => winFlash(a, b, FLASH_TIME),
};

registerGame(patternGame);
