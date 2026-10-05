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

import { assertNever } from "../../engine/assert-never.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_NUM_KEYPAD,
  MOD_SHFT,
  newCursor,
  RIGHT_BUTTON,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  buttonVerb,
  digitKey,
  ERASE_KEYS,
  interpretTargetVerbs,
  pressTarget,
  type TargetGeometry,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newBricksDesc } from "./generator.ts";
import { say } from "./hint-text.ts";
import {
  type BricksDrawState,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  offsets,
  PREFERRED_TILE_SIZE,
  redraw,
  tileOrigin,
} from "./render.ts";
import {
  type BricksReason,
  bricksValidate,
  deduceBricksPlan,
  findMistakes,
  solveGame,
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
  cloneState,
  colorBits,
  DIFF_TRICKY,
  decodeParams,
  defaultParams,
  encodeParams,
  F_BOUND,
  F_EMPTY,
  F_SHADE,
  F_UNSHADE,
  NUM_MASK,
  newState,
  paramConfig,
  presets,
  textFormat,
} from "./state.ts";

// Numpad-flagged keys (the web frontend sets MOD_NUM_KEYPAD for the numpad).
const NK = (ch: number): number => MOD_NUM_KEYPAD | ch;

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
  let button = key;
  if (button === NK(56)) button = CURSOR_UP;
  else if (button === NK(50)) button = CURSOR_DOWN;
  else if (button === NK(52)) button = CURSOR_LEFT;
  else if (button === NK(54)) button = CURSOR_RIGHT;

  if (button === CURSOR_UP && cursorY > 0 && (cursorY & 1) === 0) button = NK(57);
  else if (button === CURSOR_DOWN && cursorY < h - 1 && cursorY & 1) button = NK(49);
  else if (button === NK(55)) button = CURSOR_UP;
  else if (button === NK(51)) button = CURSOR_DOWN;

  if (button === CURSOR_UP) return { dx: 0, dy: -1 };
  if (button === CURSOR_DOWN) return { dx: 0, dy: 1 };
  if (button === CURSOR_LEFT) return { dx: -1, dy: 0 };
  if (button === CURSOR_RIGHT) return { dx: 1, dy: 0 };
  if (button === NK(49)) return { dx: -1, dy: 1 };
  if (button === NK(57)) return { dx: 1, dy: -1 };
  return null;
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
  // Undo the shear, then floor to a cell.
  pointerTarget(s, ds, p) {
    const ts = ds.tileSize;
    const { ox, oy } = offsets(s.h, ts);
    const py = p.y - oy;
    const y = py < 0 ? -1 : (py / ts) | 0;
    const px = p.x - ox - y * (ts >> 1);
    const x = px < 0 ? -1 : (px / ts) | 0;
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
  does: "cycle it from empty to shaded, then unshaded, then empty again",
  apply: paintCell((old) => cycleColor(LEFT_BUTTON, old)),
};
const unshadeVerb: BricksVerb = {
  does: "cycle it the other way, from empty to unshaded, then shaded",
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
  secondary: unshadeVerb,
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
      does: "unshade it",
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
      for (const index of i1 === i2 ? [i1] : [i1, i2])
        if ((grid[index] & COL_MASK) !== bits) cells.push({ index, to });
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

function executeMove(state: BricksState, move: BricksMove): BricksState {
  const next = cloneState(state);
  const { w, h } = next;
  if (move.kind === "solve") {
    for (let i = 0; i < w * h; i++) {
      if (!(state.grid[i] & COL_MASK)) continue;
      next.grid[i] = colorBits(move.grid[i]);
    }
  } else if (move.kind === "paint") {
    for (const { index, to } of move.cells) {
      if (state.grid[index] & COL_MASK) next.grid[index] = colorBits(to);
    }
  } else {
    return assertNever(move, "bricks: executeMove");
  }
  return next;
}

function status(s: BricksState): GameStatus {
  return bricksValidate(s.grid, s.w, s.h, false) === "complete" ? "solved" : "ongoing";
}

function solve(orig: BricksState): SolveResult<BricksMove> {
  const { w, h } = orig;
  const grid = orig.grid.slice();
  solveGame(grid, w, h, DIFF_TRICKY, true, true);
  if (bricksValidate(grid, w, h, false) === "invalid")
    return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solve", grid: Array.from(grid, bitsColor) } };
}

// --- hint (a second projection of the contradiction solver) -----------------

/** Plan data for a Bricks hint step, read by `hintKeepTrack`: the forced cell
 * (`target`, an index into the padded grid) and the color it is forced to
 * (`forced` — the narration says which; the render never pre-places it). */
export interface BricksHint {
  target: number;
  forced: CellColor;
}

const pointOf = (i: number, w: number): Point => ({ x: i % w, y: Math.floor(i / w) });

/** The evidence cells a reason reasons over (padded indices). */
function evidenceOf(reason: BricksReason): number[] {
  switch (reason.kind) {
    case "three":
      return reason.cells;
    case "unsupported":
      return reason.below;
    case "overcount":
    case "undercount":
      return [reason.clue];
    case "strandSupport":
      return [reason.above];
    case "localBreak":
      return reason.conflict;
  }
}

/** Narrate *why* the move is forced, against the `evidence` the frame outlines
 * rather than the raw reason. The words are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(
  reason: BricksReason,
  forced: CellColor,
  state: BricksState,
  targetIndex: number,
  evidenceIndices: readonly number[],
): Sentence {
  const clueVal = (i: number): number => state.grid[i] & NUM_MASK;
  const at = (i: number): Point => pointOf(i, state.w);
  const target = at(targetIndex);
  const evidence = evidenceIndices.map(at);
  switch (reason.kind) {
    case "three":
      return say.three(target, evidence);
    case "unsupported":
      return say.unsupported(target, evidence);
    case "overcount":
      return say.overcount(target, at(reason.clue), clueVal(reason.clue));
    case "strandSupport":
      return say.strandSupport(target, at(reason.above));
    case "undercount":
      return say.undercount(target, at(reason.clue), clueVal(reason.clue));
    case "localBreak":
      return say.localBreak(target, forced, evidence);
  }
}

/** Why a cell is forced, by the `kind` of the reason the solver records. */
export const BRICKS_RUNGS = [
  "three",
  "unsupported",
  "overcount",
  "strandSupport",
  "undercount",
  "localBreak",
] as const satisfies readonly BricksReason["kind"][];
export type BricksRung = (typeof BRICKS_RUNGS)[number];

function hint(state: BricksState): HintResult<BricksMove, BricksHint, BricksRung> {
  // `findMistakes` is a rule validator, blind to a mark that is wrong but breaks
  // no rule, so a board it passes can still be doomed. The re-solve below
  // answers that case with `CONTRADICTION_UNLOCALIZED`, which asks the player to
  // undo rather than promising a highlight that will never appear.
  const { w, h, grid } = state;

  // Check the marks against the unique solution rather than deduce onward from
  // a doomed position.
  const sol = grid.slice();
  if (solveGame(sol, w, h, DIFF_TRICKY, true, true) !== "complete") {
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  }
  for (let i = 0; i < w * h; i++) {
    const pc = grid[i] & COL_MASK;
    if ((pc === F_SHADE || pc === F_UNSHADE) && pc !== (sol[i] & COL_MASK)) {
      return { ok: false, error: CONTRADICTION_UNLOCALIZED };
    }
  }

  const plan = deduceBricksPlan(grid, w, h);
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  const steps: HintStep<BricksMove, BricksHint, BricksRung>[] = plan.map((m) => {
    const evidence = evidenceOf(m.reason).filter((c) => c !== m.index);
    const highlights: BricksHint = { target: m.index, forced: m.to };
    const words = narrate(m.reason, m.to, state, m.index, evidence);
    return {
      move: { kind: "paint", cells: [{ index: m.index, to: m.to }] },
      rung: m.reason.kind,
      explanation: words.text,
      words,
      highlights,
    };
  });
  return { ok: true, steps };
}

/** A move completes the step when it paints the target cell to the hinted
 * color; touching the target with a different color, or not touching it, is
 * off-plan (Bricks steps are single-cell — no partial-subset case). */
function hintKeepTrack(
  m: BricksMove,
  step: HintStep<BricksMove, BricksHint>,
): HintTrackVerdict {
  const hl = step.highlights;
  if (m.kind !== "paint" || !hl) return "off";
  const cell = m.cells.find((c) => c.index === hl.target);
  return cell?.to === hl.forced ? "completed" : "off";
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
    { executeMove, hintKeepTrack },
    state,
    ui,
    ds,
    step,
    cells,
  );
}

/** Bricks' difficulty contract. `solveGame` returns `"complete"` exactly when
 * the deduction alone solves the board, and `clear` blanks the grid first, so
 * the verdict is about the puzzle rather than any marks already on it.
 *
 * Two tiers for three `DIFF_*` levels: the tier list is the tiers a player can
 * pick (`paramConfig`, from `DIFF_NAMES`), so upstream's ungenerable third is
 * not among them. `solveAtCap` takes a raw cap and answers for it regardless,
 * which a loaded `dt` game needs.
 */
const difficulty: DifficultyContract<BricksParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const ret = solveGame(s.grid, s.w, s.h, cap, true, true);
    return ret === "complete"
      ? "solved"
      : ret === "invalid"
        ? "impossible"
        : "unsolved";
  },
};

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
  presets,
  encodeParams,
  decodeParams,
  paramConfig,

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
  hint,
  hintRungs: BRICKS_RUNGS,
  hintMarks: {
    roles: {
      ring: "the cell the step decides, on the cell's own border. The sentence says whether it must be shaded or stay clear.",
      outline:
        "what the step reasons from, as a smaller ring inside the cell: a number, the shaded bricks beside the cell, the cells beneath it or the brick above it.",
    },
  },
  hintKeepTrack,
  hintGesture,
  findMistakes,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(bricksGame);
