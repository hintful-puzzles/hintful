/**
 * Bricks (Tawamurenga) — native TS port of `puzzles/unreleased/bricks.c`.
 * Shade cells in a hexagonal grid so that every shaded cell is supported by a
 * shaded cell below it, no three shade in a horizontal line, and each clue
 * equals its count of shaded neighbors.
 *
 * Input: left-click/drag cycles a cell shade→unshade→empty (right-click the
 * reverse) and paints the whole drag with the first cell's target color; a
 * drag of one cell releases as its button's declared verb. A hex-aware
 * keyboard cursor moves with the arrow/numpad keys (up/down alternate
 * orthogonal and diagonal steps across the shear) and applies the verbs with
 * Enter/Space/0/1/2/Backspace. Rule violations show live while dragging;
 * Check & Save (`findMistakes`) hard-blocks on any current violation.
 */

import { searchTierContract, solveFromAnswer } from "../../engine/answer-search.ts";
import {
  type Game,
  type HintStep,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import { hintFinishes } from "../../engine/hint-finishes.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { UNSHADED_NAME } from "../../engine/piece.ts";
import {
  cursorDelta,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_NUM_KEYPAD,
  MOD_SHFT,
  newCursor,
  numpadDirection,
  RIGHT_BUTTON,
  shearedHexStep,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  buttonVerb,
  digitKey,
  ERASE_KEYS,
  interpretTargetVerbs,
  pressTarget,
  rulingOut,
  type TargetGeometry,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newBricksDesc } from "./generator.ts";
import {
  type BricksHint,
  bricksHint,
  bricksKeepTrack,
  bricksRefreshHintStep,
} from "./hint.ts";
import {
  type BricksDrawState,
  colors,
  computeSize,
  newDrawState,
  offsets,
  PREFERRED_TILE_SIZE,
  redraw,
  tileOrigin,
} from "./render.ts";
import {
  answerColors,
  answerOf,
  BRICKS_RUNGS,
  type BricksRung,
  deductionFinishes,
  findMistakes,
  isSolved,
} from "./solver.ts";
import {
  type BricksMistake,
  type BricksMove,
  type BricksParams,
  type BricksState,
  type BricksUi,
  bitsColor,
  type CellColor,
  COL_MASK,
  colorBits,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  F_BOUND,
  F_EMPTY,
  F_SHADE,
  F_UNSHADE,
  FE_WRONG,
  menu,
  newState,
  paramConfig,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(state: BricksState): BricksUi {
  // Cursor starts on the first non-bound cell (upstream new_ui).
  const s = state.w * state.h;
  let i = 0;
  while (i < s && state.grid[i] === F_BOUND) i++;
  return {
    cursor: newCursor(i % state.w, (i / state.w) | 0),
    dragType: 0,
    drag: [],
  };
}

/** The color a press of `button` on a cell of color `old` paints: the left
 * button cycles empty → shaded → unshaded → empty, and the right the other way
 * round. The drag paints every cell it passes with the color its first cell
 * took, and a click is a drag of one cell, so both read this. */
function cycleColor(button: number, old: number): number {
  if (button === LEFT_BUTTON)
    return old === F_UNSHADE ? F_EMPTY : old === F_SHADE ? F_UNSHADE : F_SHADE;
  return old === F_UNSHADE ? F_SHADE : old === F_SHADE ? F_EMPTY : F_UNSHADE;
}

/** A verb painting the cell `{ x, y }` with `to(old)`, or `null` on a clue or
 * where the cell already holds it. */
const paintCell =
  (to: (old: number) => number) =>
  (s: BricksState, { x, y }: Point): BricksMove | null => {
    const index = y * s.w + x;
    const old = s.grid[index] & COL_MASK;
    if (!old) return null;
    const bits = to(old);
    return bits === old
      ? null
      : { kind: "paint", cells: [{ index, to: bitsColor(bits) }] };
  };

/** The cursor step a key makes on the hex grid, or `null` for a key that
 * does not move it. Numpad 8/2/4/6 move orthogonally; up and down across the
 * shear alternate orthogonal and diagonal steps, and numpad 7/3 are straight
 * up and down, 1/9 the other diagonals. */
function hexStep(
  cursorY: number,
  h: number,
  key: number,
): { dx: number; dy: number } | null {
  const step = numpadDirection(key) ?? cursorDelta(key);
  return step && shearedHexStep(step, cursorY, h);
}

/** Move the cursor by `step`, clamped into the hexagon, and show it; `true`
 * when anything changed. */
function moveHexCursor(
  state: BricksState,
  ui: BricksUi,
  step: { dx: number; dy: number },
): boolean {
  const { w, h } = state;
  const { x: x0, y: y0, visible } = ui.cursor;
  ui.cursor.visible = true;
  let x = Math.max(0, Math.min(x0 + step.dx, w - 1));
  const y = Math.max(0, Math.min(y0 + step.dy, h - 1));
  const extra = (h | y) & 1 ? 0 : 1;
  x = Math.min(x, w - ((y / 2) | 0) - 1);
  x = Math.max(x, (((h - y) / 2) | 0) - extra);
  ui.cursor.x = x;
  ui.cursor.y = y;
  return !visible || x !== x0 || y !== y0;
}

const inHex = (s: BricksState, x: number, y: number) =>
  x >= 0 && x < s.w && y >= 0 && y < s.h && (s.grid[y * s.w + x] & F_BOUND) === 0;

const geometry: TargetGeometry<BricksState, BricksUi, BricksDrawState, Point> = {
  noun: "cell",
  // Undo the shear, then floor to a cell. A row above the board shears by a
  // row that is not there, and `inHex` turns it away whatever column comes of
  // it.
  pointerTarget(s, ds, p) {
    const ts = ds.tileSize;
    const { ox, oy } = offsets(s.h, ts);
    const y = fromCoord(p.y, ts, oy);
    const x = fromCoord(p.x - y * (ts >> 1), ts, ox);
    return inHex(s, x, y) ? { x, y } : null;
  },
  pointAt(s, ds, t) {
    const ts = ds.tileSize;
    const o = tileOrigin(t.x, t.y, s.h, ts);
    return { x: o.x + (ts >> 1), y: o.y + (ts >> 1) };
  },
  cursorTarget(s, ui) {
    const { x, y } = ui.cursor;
    return inHex(s, x, y) ? { x, y } : null;
  },
  parkCursor(ui, t) {
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
  },
  moveCursor(s, ui, button) {
    const step = hexStep(ui.cursor.y, s.h, button);
    return step !== null && moveHexCursor(s, ui, step);
  },
};

type BricksVerb = TargetVerb<BricksState, BricksUi, Point, BricksMove>;
const shadeVerb: BricksVerb = {
  does: `cycle it from empty to shaded, then ${UNSHADED_NAME}, then empty again`,
  apply: paintCell((old) => cycleColor(LEFT_BUTTON, old)),
};
const unshadeVerb: BricksVerb = {
  does: `cycle it the other way, from empty to ${UNSHADED_NAME}, then shaded`,
  apply: paintCell((old) => cycleColor(RIGHT_BUTTON, old)),
};

const targetVerbs: TargetVerbs<
  BricksState,
  BricksUi,
  BricksDrawState,
  Point,
  BricksMove
> = {
  geometry,
  primary: shadeVerb,
  secondary: rulingOut(unshadeVerb),
  // A numpad digit that moves the cursor (all but 0 and 5) is taken by the
  // move arm first, so only the main row's digits and those two reach here.
  keyOnly: [
    {
      does: "shade it",
      keys: [digitKey(1)],
      apply: paintCell(() => F_SHADE),
      pointer: { kind: "cycle", button: "primary" },
    },
    {
      does: `mark it ${UNSHADED_NAME}`,
      keys: [digitKey(0), digitKey(2)],
      apply: paintCell(() => F_UNSHADE),
      pointer: { kind: "cycle", button: "primary" },
    },
    {
      does: "empty it",
      keys: ERASE_KEYS,
      apply: paintCell(() => F_EMPTY),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
};

function interpretMove(
  state: BricksState,
  ui: BricksUi,
  ds: BricksDrawState,
  pt: Point,
  rawButton: number,
): BricksMove | null | UiUpdate {
  const { w, grid } = state;
  const shift = (rawButton & MOD_SHFT) !== 0;
  const control = (rawButton & MOD_CTRL) !== 0;
  // Strip only Shift/Ctrl — MOD_NUM_KEYPAD is load-bearing for the diagonals.
  const button = rawButton & ~(MOD_SHFT | MOD_CTRL);

  // The numpad's moves, and Shift or Ctrl with a move, which paints the cells
  // the cursor leaves and enters: Bricks' own keys. A bare arrow is the
  // model's, through the geometry.
  const step = hexStep(ui.cursor.y, state.h, button);
  if (step && (shift || control || button & MOD_NUM_KEYPAD)) {
    const i1 = ui.cursor.y * w + ui.cursor.x;
    const changed = moveHexCursor(state, ui, step);
    if (shift || control) {
      const to = shift && control ? "empty" : control ? "shade" : "unshade";
      const i2 = ui.cursor.y * w + ui.cursor.x;
      const bits = colorBits(to);
      const cells: { index: number; to: CellColor }[] = [];
      // A numbered cell holds no color and takes none, so it is not named.
      for (const index of i1 === i2 ? [i1] : [i1, i2]) {
        const old = grid[index] & COL_MASK;
        if (old && old !== bits) cells.push({ index, to });
      }
      if (cells.length > 0) return { kind: "paint", cells };
    }
    return changed ? UI_UPDATE : null;
  }

  if (isMouseDown(button)) {
    const at = geometry.pointerTarget(state, ds, pt, ui);
    if (at === null) return null;
    const i = at.y * w + at.x;
    ui.dragType = cycleColor(button, grid[i] & COL_MASK);
    ui.drag = [i];
    pressTarget(targetVerbs, ui, at);
    return UI_UPDATE;
  }

  if (isMouseDrag(button) && ui.dragType) {
    const at = geometry.pointerTarget(state, ds, pt, ui);
    if (at === null) return null;
    const i = at.y * w + at.x;
    if (grid[i] === ui.dragType) return null;
    if (ui.drag.includes(i)) return null;
    ui.drag.push(i);
    return UI_UPDATE;
  }

  if (isMouseRelease(button) && ui.drag.length > 0) {
    const drag = ui.drag;
    const to = bitsColor(ui.dragType);
    ui.drag = [];
    // A drag that never left its cell is a click: its button's verb.
    if (drag.length === 1) {
      const at = { x: drag[0] % w, y: (drag[0] / w) | 0 };
      return buttonVerb(targetVerbs, button)?.apply(state, at, ui) ?? UI_UPDATE;
    }
    const cells = drag
      .filter((i) => (grid[i] & COL_MASK) !== 0)
      .map((index) => ({ index, to }));
    if (cells.length > 0) return { kind: "paint", cells };
    return UI_UPDATE;
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, pt, rawButton);
}

function status(s: BricksState): GameStatus {
  return isSolved(s) ? "solved" : "ongoing";
}

/** The cells painted against the answer are emptied. A broken rule always
 * holds one of them on a board with one answer, so the rest of a rule's cells
 * keep their paint; only a board without one has its broken rules emptied
 * whole. */
function clearMistakes(
  _state: BricksState,
  mistakes: readonly BricksMistake[],
): BricksMove[] {
  const wrong = mistakes.filter((m) => m.flags & FE_WRONG);
  const cells = (wrong.length > 0 ? wrong : mistakes).map(({ index }) => ({
    index,
    to: "empty" as const,
  }));
  return cells.length > 0 ? [{ kind: "paint", cells }] : [];
}

/** The first empty cell the answer shades, else the first it leaves clear. */
function revealOne(state: BricksState, solved: BricksState): BricksMove | null {
  for (const want of [F_SHADE, F_UNSHADE]) {
    const index = state.grid.findIndex(
      (c, i) => (c & COL_MASK) === F_EMPTY && (solved.grid[i] & COL_MASK) === want,
    );
    if (index >= 0) return { kind: "paint", cells: [{ index, to: bitsColor(want) }] };
  }
  return null;
}

function solve(orig: BricksState): SolveResult<BricksMove> {
  return solveFromAnswer(answerOf(orig), (solution) => ({
    kind: "solve",
    grid: answerColors(solution),
  }));
}

/** A tap on each cell the step paints. */
function hintGesture(
  state: BricksState,
  ui: BricksUi,
  ds: BricksDrawState,
  move: BricksMove,
  step: HintStep<BricksMove, BricksHint>,
): readonly PointerAction[] {
  if (move.kind !== "paint") return [];
  const cells = move.cells.map(({ index }) => ({
    x: index % state.w,
    y: (index / state.w) | 0,
  }));
  return verbClicks(
    targetVerbs,
    { executeMove, hintKeepTrack: bricksKeepTrack },
    state,
    ui,
    ds,
    step,
    cells,
  );
}

/** Bricks' difficulty contract: Easy where the ladder finishes the board from
 * its numbers, and Unreasonable where the search finds it one answer. A loaded
 * `dt` game, upstream's ungenerable third tier, is graded as Unreasonable. */
const difficulty = searchTierContract<BricksParams, BricksState>({
  newState,
  deductionFinishes: (state) =>
    deductionFinishes(state) && hintFinishes(bricksGame, state),
  answerOf,
});

export const bricksGame: Game<
  BricksParams,
  BricksState,
  BricksMove,
  BricksUi,
  BricksDrawState,
  BricksMistake,
  BricksHint,
  BricksRung
> = {
  id: "bricks",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  paramConfig,
  validateParams,

  newDesc: newBricksDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,
  notApplicable: {
    transposeParams:
      "A shaded brick rests on the row below it, and no three may lie in a horizontal line, so a board turned on its side would be a different puzzle.",
  },

  solve,
  difficulty,
  hint: bricksHint,
  hintRungs: BRICKS_RUNGS,
  hintMarks: {
    roles: {
      ring: "the cell the step decides, on the cell's own border. The sentence says whether it must be shaded or stay clear.",
      outline:
        "what the step reasons from, as a smaller ring inside the cell: a number, the shaded bricks beside the cell, the cells beneath it or the brick above it.",
    },
  },
  hintKeepTrack: bricksKeepTrack,
  refreshHintStep: bricksRefreshHintStep,
  hintGesture,
  findMistakes,
  clearMistakes,
  revealOne,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(bricksGame);
