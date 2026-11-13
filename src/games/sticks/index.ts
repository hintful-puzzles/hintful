/**
 * Sticks (Tatebo-Yokobo) — native TS port of `puzzles/unreleased/sticks.c`.
 * Fill every white cell with a horizontal or vertical line: a number on a
 * line states that line's exact length (and a line may overlap at most one
 * number); a number in a black cell states how many lines connect to it.
 *
 * Input is the upstream drag machine: press then drag along an axis to draw
 * that orientation across the cells passed (starting on a matching line
 * turns the drag into a clearing drag); a plain left click cycles
 * blank→vertical→horizontal→blank and a right click cycles the other way; a
 * keyboard cursor places lines with Enter/Space/
 * 0/1/2/backspace and draws across two cells with Shift/Ctrl+arrows.
 * Violated clue numbers red live (upstream behavior); Check & Save
 * additionally flags lines contradicting the unique solution
 * (`findMistakes`).
 */

import { searchTierContract, solveFromAnswer } from "../../engine/answer-search.ts";
import {
  type Game,
  type HintStep,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { hintFinishes } from "../../engine/hint-finishes.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_LEFT,
  CURSOR_RIGHT,
  gridCursorMove,
  isCursorMove,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  newCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  buttonVerb,
  digitKey,
  ERASE_KEYS,
  interpretTargetVerbs,
  pressTarget,
  squareGrid,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newSticksDesc } from "./generator.ts";
import {
  type SticksHint,
  sticksHint,
  sticksKeepTrack,
  sticksRefreshHintStep,
} from "./hint.ts";
import {
  border,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SticksDrawState,
} from "./render.ts";
import {
  answerOf,
  deductionFinishes,
  findMistakes,
  isSolved,
  STICKS_RUNGS,
  type SticksRung,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  F_BLOCK,
  F_HOR,
  F_VER,
  menu,
  newState,
  paramConfig,
  type SticksLine,
  type SticksMistake,
  type SticksMove,
  type SticksParams,
  type SticksState,
  type SticksUi,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: SticksState): SticksUi {
  return {
    cursor: newCursor(),
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    dragType: "none",
    drag: [],
    dragMove: [],
  };
}

const bitsLine = (bits: number): SticksLine =>
  bits & F_HOR ? "hor" : bits & F_VER ? "ver" : "none";

/** One step of a click's cycle: empty, then a `first` line, then the other
 * line, then empty again. */
const cycleLine = (old: number, first: number): number =>
  old === 0 ? first : old & first ? first ^ (F_HOR | F_VER) : 0;

/** A verb that sets the square to `to(old)`, or means nothing on a black
 * square or where the square would stay as it is — upstream's "don't put
 * no-ops on the undo chain". */
const setLine =
  (to: (old: number) => number) =>
  (s: SticksState, { x, y }: Point): SticksMove | null => {
    const index = y * s.w + x;
    const old = s.grid[index];
    const bits = to(old);
    if (old & F_BLOCK || bits === old) return null;
    return { kind: "set", changes: [{ index, line: bitsLine(bits) }] };
  };

type SticksVerb = TargetVerb<SticksState, SticksUi, Point, SticksMove>;
const verticalVerb: SticksVerb = {
  does:
    "place a vertical line in it (click again to turn it horizontal, and again " +
    "to clear it)",
  apply: setLine((old) => cycleLine(old, F_VER)),
};
const horizontalVerb: SticksVerb = {
  does: "place a horizontal line in it (again to turn it vertical, and again to clear it)",
  apply: setLine((old) => cycleLine(old, F_HOR)),
};

const targetVerbs: TargetVerbs<
  SticksState,
  SticksUi,
  SticksDrawState,
  Point,
  SticksMove
> = {
  geometry: squareGrid({ size: (s) => s, border: (ts) => border(ts) }),
  primary: verticalVerb,
  secondary: horizontalVerb,
  keyOnly: [
    {
      does: "place a vertical line in it",
      keys: [digitKey(1)],
      apply: setLine(() => F_VER),
      pointer: { kind: "cycle", button: "primary" },
    },
    {
      does: "place a horizontal line in it",
      keys: [digitKey(0), digitKey(2)],
      apply: setLine(() => F_HOR),
      pointer: { kind: "cycle", button: "secondary" },
    },
    {
      does: "clear it",
      keys: ERASE_KEYS,
      apply: setLine(() => 0),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
};

function interpretMove(
  state: SticksState,
  ui: SticksUi,
  ds: SticksDrawState,
  p: Point,
  rawButton: number,
): SticksMove | null | UiUpdate {
  const { w, h, grid } = state;
  const shift = (rawButton & MOD_SHFT) !== 0;
  const control = (rawButton & MOD_CTRL) !== 0;
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;
  /** The cell under pixel (px, py), or -1 off the grid: the same catchment a
   * click's verb addresses. */
  const cellAt = (px: number, py: number): number => {
    const at = targetVerbs.geometry.pointerTarget(state, ds, { x: px, y: py }, ui);
    return at === null ? -1 : at.y * w + at.x;
  };
  const dragDelta = ts * 0.4;

  if (isMouseDown(button) || isMouseDrag(button)) ui.cursor.visible = false;

  // --- Shift/Ctrl with an arrow draws across the two cells it joins, where a
  // bare arrow only moves the cursor ---
  if (isCursorMove(button) && (shift || control)) {
    const ox = ui.cursor.x;
    const oy = ui.cursor.y;
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, w, h);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    ui.cursor.visible = true;

    const horizontalArrow = button === CURSOR_LEFT || button === CURSOR_RIGHT;
    const line: SticksLine =
      shift && control
        ? "none"
        : control
          ? horizontalArrow
            ? "hor"
            : "ver"
          : horizontalArrow
            ? "ver"
            : "hor";
    const i1 = oy * w + ox;
    const i2 = ui.cursor.y * w + ui.cursor.x;
    const inert = (i: number): boolean =>
      !!(grid[i] & F_BLOCK) ||
      (line === "hor" && !!(grid[i] & F_HOR)) ||
      (line === "ver" && !!(grid[i] & F_VER)) ||
      (line === "none" && !grid[i]);
    const changes: { index: number; line: SticksLine }[] = [];
    if (!inert(i1)) changes.push({ index: i1, line });
    if (i1 !== i2 && !inert(i2)) changes.push({ index: i2, line });
    if (changes.length > 0) return { kind: "set", changes };
    return UI_UPDATE;
  }

  // --- begin a normal drag -------------------------------------------------
  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    const at = targetVerbs.geometry.pointerTarget(state, ds, p, ui);
    if (at !== null) pressTarget(targetVerbs, ui, at);
    ui.minX = ui.maxX = p.x;
    ui.minY = ui.maxY = p.y;
    ui.drag = [];
    ui.dragMove = [];
    ui.dragType = "start";
    return UI_UPDATE;
  }

  // --- perform a normal drag -----------------------------------------------
  if (isMouseDrag(button) && (ui.dragType === "start" || ui.dragType === "line")) {
    ui.minX = Math.min(ui.minX, p.x);
    ui.maxX = Math.max(ui.maxX, p.x);
    ui.minY = Math.min(ui.minY, p.y);
    ui.maxY = Math.max(ui.maxY, p.y);

    const dx = ui.maxX - ui.minX;
    const dy = ui.maxY - ui.minY;
    let dragMove: number;
    if (dx > dy && dx > dragDelta) dragMove = F_HOR;
    else if (dy > dx && dy > dragDelta) dragMove = F_VER;
    else return null;

    const i = cellAt((ui.minX + ui.maxX) / 2, (ui.minY + ui.maxY) / 2);
    ui.minX = ui.maxX = p.x;
    ui.minY = ui.maxY = p.y;
    if (i === -1 || grid[i] & F_BLOCK) return null;

    if (ui.dragType === "start" && grid[i] & dragMove) {
      // Starting on a matching line: the drag clears instead of draws.
      ui.dragType = "clear";
      dragMove = 0;
    } else {
      ui.dragType = "line";
      const d = ui.drag.indexOf(i);
      if (d !== -1) {
        ui.dragMove[d] = dragMove;
        return UI_UPDATE;
      }
    }

    ui.drag.push(i);
    ui.dragMove.push(dragMove);
    return UI_UPDATE;
  }

  // --- perform a clearing drag (one that started along a matching line) ----
  if (isMouseDrag(button) && ui.dragType === "clear") {
    const i = cellAt(p.x, p.y);
    if (i === -1 || !(grid[i] & (F_HOR | F_VER))) return null;
    if (ui.drag.includes(i)) return null;
    ui.drag.push(i);
    ui.dragMove.push(0);
    return UI_UPDATE;
  }

  if (isMouseRelease(button)) {
    // --- a release without a qualifying drag is a click: its button's verb --
    if (ui.dragType === "start") {
      ui.dragType = "none";
      const i = cellAt((ui.minX + ui.maxX) / 2, (ui.minY + ui.maxY) / 2);
      const verb = buttonVerb(targetVerbs, button);
      if (i === -1 || verb === null) return UI_UPDATE;
      return verb.apply(state, { x: i % w, y: Math.floor(i / w) }, ui) ?? UI_UPDATE;
    }

    ui.dragType = "none";

    // --- confirm a drag as one batched move --------------------------------
    if (ui.drag.length > 0) {
      const changes: { index: number; line: SticksLine }[] = [];
      for (let d = 0; d < ui.drag.length; d++) {
        const j = ui.drag[d];
        if (grid[j] & F_BLOCK) continue;
        changes.push({ index: j, line: bitsLine(ui.dragMove[d]) });
      }
      ui.drag = [];
      ui.dragMove = [];
      if (changes.length > 0) return { kind: "set", changes };
      return UI_UPDATE;
    }
    return null;
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

function status(s: SticksState): GameStatus {
  return isSolved(s) ? "solved" : "ongoing";
}

function solve(orig: SticksState): SolveResult<SticksMove> {
  return solveFromAnswer(answerOf(orig), (grid) => ({
    kind: "solve",
    grid: Array.from(grid, bitsLine),
  }));
}

/** The first white square of the answer whose line is not yet placed. */
function revealOne(state: SticksState, solved: SticksState): SticksMove | null {
  for (let index = 0; index < state.grid.length; index++) {
    if (state.grid[index] & (F_BLOCK | F_HOR | F_VER)) continue;
    return { kind: "set", changes: [{ index, line: bitsLine(solved.grid[index]) }] };
  }
  return null;
}

/** A tap on each square the step sets. */
function hintGesture(
  state: SticksState,
  ui: SticksUi,
  ds: SticksDrawState,
  m: SticksMove,
  step: HintStep<SticksMove, SticksHint>,
): readonly PointerAction[] {
  if (m.kind !== "set") return [];
  const { w } = state;
  const squares = m.changes.map(({ index }) => ({ x: index % w, y: (index / w) | 0 }));
  return verbClicks(
    targetVerbs,
    { executeMove, hintKeepTrack: sticksKeepTrack },
    state,
    ui,
    ds,
    step,
    squares,
  );
}

export const sticksGame: Game<
  SticksParams,
  SticksState,
  SticksMove,
  SticksUi,
  SticksDrawState,
  SticksMistake,
  SticksHint,
  SticksRung
> = {
  id: "sticks",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSticksDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,
  // Easy is what the ladder finishes, and the hint, which walks the same
  // ladder from the player's lines, finishes too.
  difficulty: searchTierContract<SticksParams, SticksState>({
    newState,
    deductionFinishes: (state) =>
      deductionFinishes(state) && hintFinishes(sticksGame, state),
    answerOf,
  }),

  solve,
  findMistakes,
  clearMistakes: (_state, mistakes) =>
    mistakes.length === 0
      ? []
      : [
          {
            kind: "set",
            changes: mistakes.map(({ index }) => ({ index, line: "none" })),
          },
        ],
  revealOne,
  hint: sticksHint,
  hintRungs: STICKS_RUNGS,
  hintMarks: {
    roles: {
      ring: "the square the step decides, as the line it asks you to place, drawn in the hint color and running the way it must go: across for horizontal, up and down for vertical.",
      outline:
        "the squares the step reasons from: the squares a numbered line runs through or could still reach, or a block together with the lines already running into it or the squares beside it where one still could.",
    },
  },
  hintKeepTrack: sticksKeepTrack,
  refreshHintStep: sticksRefreshHintStep,
  hintGesture,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(sticksGame);
