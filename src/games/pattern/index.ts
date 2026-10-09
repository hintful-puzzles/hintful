/**
 * Pattern (Nonograms) — native TS port of `pattern.c`. Reconstruct a
 * two-state picture from the run-length clues listed beside every row and
 * column. A press cycles a cell's value — left towards shaded (FULL), right
 * towards clear (EMPTY) — exactly as Enter and Space do at the cursor, and a
 * drag paints the pressed cell's new value along a line. The keyboard cursor
 * paints with Ctrl/Shift held.
 */

import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { hintAndSolveFinish } from "../../engine/hint-finishes.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { trackTargets } from "../../engine/hint-track.ts";
import { CELL, type Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { SHADED_NAME, UNSHADED_NAME } from "../../engine/piece.ts";
import {
  endDrag,
  isCursorMove,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
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
  toCoord,
} from "./render.ts";
import {
  deduceHintPlan,
  findMistakes,
  PATTERN_RUNGS,
  type PatternHintMove,
  type PatternRung,
  solveToString,
} from "./solver.ts";
import {
  clickBlack,
  clickWhite,
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
  validateParams,
} from "./state.ts";

/** A verb that turns a square the player may change into `to(v)`. */
const setSquare =
  (to: (v: number) => GridVal) =>
  (s: PatternState, { x, y }: Point): PatternMove | null => {
    const i = y * s.common.w + x;
    if (s.common.immutable[i]) return null;
    return { type: "fill", value: to(s.grid[i]), x, y, w: 1, h: 1 };
  };

type PatternVerb = TargetVerb<PatternState, PatternUi, Point, PatternMove>;
const shadeVerb: PatternVerb = {
  does: `turn it ${SHADED_NAME}, then ${UNSHADED_NAME} (a cross), then back to undecided`,
  apply: setSquare(clickBlack),
};
const clearVerb: PatternVerb = {
  does: `go the other way round, ${UNSHADED_NAME} first`,
  apply: setSquare(clickWhite),
};

/** The grid of squares, whose origin clears the clue block: its row clues are
 * as wide as the grid is tall needs, and its column clues as tall as it is
 * wide needs, so the two insets differ and each axis has its own. */
const geometry: TargetGeometry<PatternState, PatternUi, PatternDrawState, Point> = {
  noun: "square",
  pointerTarget(s, ds, p) {
    const { w, h } = s.common;
    const x = fromCoord(ds.tileSize, w, p.x);
    const y = fromCoord(ds.tileSize, h, p.y);
    return x >= 0 && x < w && y >= 0 && y < h ? { x, y } : null;
  },
  pointAt(s, ds, t) {
    const ts = ds.tileSize;
    const half = ts >> 1;
    return {
      x: toCoord(ts, s.common.w, t.x) + half,
      y: toCoord(ts, s.common.h, t.y) + half,
    };
  },
  cursorTarget: (_s, ui) => ({ x: ui.cursor.x, y: ui.cursor.y }),
  parkCursor(ui, t) {
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
  },
  moveCursor: (s, ui, button) => moveCursor(ui.cursor, button, s.common.w, s.common.h),
};

const targetVerbs: TargetVerbs<
  PatternState,
  PatternUi,
  PatternDrawState,
  Point,
  PatternMove
> = { geometry, primary: shadeVerb, secondary: clearVerb };

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
    (button === LEFT_BUTTON || button === RIGHT_BUTTON)
  ) {
    // A press cycles the square it lands on, as Enter and Space do at the
    // cursor, and a drag paints that square's new state along the line: so a
    // drag from a clear square returns the line to undecided.
    const curr = grid[y * w + x];
    if (button === LEFT_BUTTON) {
      ui.dragButton = LEFT_DRAG;
      ui.releaseButton = LEFT_RELEASE;
      ui.state = clickBlack(curr);
    } else {
      ui.dragButton = RIGHT_DRAG;
      ui.releaseButton = RIGHT_RELEASE;
      ui.state = clickWhite(curr);
    }
    startDrag(ui.drag, x, y);
    pressTarget(targetVerbs, ui, { x, y });
    return UI_UPDATE;
  }

  // --- drag: snap to a single line (except a clear, which erases a rectangle) ---
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
    // A drag that never left its square is a click: its button's verb.
    if (x1 === x2 && y1 === y2) {
      endDrag(ui.drag);
      return (
        buttonVerb(targetVerbs, button)?.apply(state, { x: sx, y: sy }, ui) ?? UI_UPDATE
      );
    }
    // A paint drag (not a clear) only fills blank cells, so dragging across
    // the board never rewrites a mark the player already placed.
    const onlyBlank = ui.state !== GRID_UNKNOWN;
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

  // --- Ctrl/Shift with an arrow paints as the cursor moves: Pattern's own
  // stroke, where a bare arrow only moves the cursor ---
  if (isCursorMove(button) && (control || shift)) {
    const ox = ui.cursor.x;
    const oy = ui.cursor.y;
    const ret = moveCursor(ui.cursor, button, w, h) ? UI_UPDATE : null;

    const newstate: GridVal = control ? (shift ? GRID_UNKNOWN : GRID_FULL) : GRID_EMPTY;
    // A paint stroke (not a clear) only fills blank squares, as the paint drag
    // does: Enter and Space are the way to change a square already marked.
    const onlyBlank = newstate !== GRID_UNKNOWN;
    const wouldChange = (v: number) =>
      onlyBlank ? v === GRID_UNKNOWN : v !== newstate;
    if (
      !wouldChange(grid[oy * w + ox]) &&
      !wouldChange(grid[ui.cursor.y * w + ui.cursor.x])
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
      onlyBlank,
    };
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
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
 * them: the target cells ringed, never pre-filled (the narration says shaded
 * or clear); the row or column hatched and its clue in the action color; and
 * the already-placed marks the deduction leans on, outlined in their own
 * kind's reference color (the cross-game element-type legend). The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(m: PatternHintMove, w: number): Sentence {
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

function hint(state: PatternState): HintResult<PatternMove, PatternHint, PatternRung> {
  const plan = deduceHintPlan(state);
  if (plan.length === 0) {
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }
  const { w } = state.common;
  const steps: HintStep<PatternMove, PatternHint, PatternRung>[] = plan.map((m) => {
    const words = narrate(m, w);
    return {
      move: { type: "fillCells", value: m.value, cells: m.cells },
      rung: m.reason.kind,
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

/** A tap on each of the step's cells: a tap overwrites, where a drag would
 * paint only blank squares. */
function hintGesture(
  state: PatternState,
  ui: PatternUi,
  ds: PatternDrawState,
  m: PatternMove,
  step: HintStep<PatternMove, PatternHint>,
): readonly PointerAction[] {
  if (m.type !== "fillCells") return [];
  const { w } = state.common;
  const cells = m.cells.map((i) => ({ x: i % w, y: (i / w) | 0 }));
  return verbClicks(
    targetVerbs,
    { executeMove, hintKeepTrack },
    state,
    ui,
    ds,
    step,
    cells,
  );
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
  PatternHint,
  PatternRung
> = {
  id: "pattern",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newPatternDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  finishesByDeduction: (s) => hintAndSolveFinish(patternGame, s),
  status,

  solve(orig) {
    const grid = solveToString(orig);
    if (!grid) return { ok: false, error: PUZZLE_NOT_REASONABLE };
    return { ok: true, move: { type: "solve", grid } };
  },

  hint,
  hintMarks: {
    roles: {
      ring: `the cells the step decides; the sentence says whether they must be ${SHADED_NAME} or ${UNSHADED_NAME}.`,
      outline: `what the step reasons from: the numbers of its row or column, drawn in the hint color, and any squares already marked ${SHADED_NAME} or ${UNSHADED_NAME} that hold a run in place, outlined in a color of their own.`,
      stripes: "the row or column the sentence names, running on through its numbers.",
    },
  },
  hintRungs: PATTERN_RUNGS,
  hintKeepTrack,
  hintGesture,
  findMistakes,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  solvedFlash: () => FLASH_TIME,
};

registerGame(patternGame);
