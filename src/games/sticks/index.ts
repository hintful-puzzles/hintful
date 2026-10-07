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

import { assertNever } from "../../engine/assert-never.ts";
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
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
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
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
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
import { type SticksMarks, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SticksDrawState,
} from "./render.ts";
import {
  deduceSticksPlan,
  findMistakes,
  type SticksFiring,
  sticksSolveGame,
  sticksValidate,
} from "./solver.ts";
import {
  cloneState,
  decodeParams,
  defaultParams,
  encodeParams,
  F_BLOCK,
  F_HOR,
  F_VER,
  newState,
  paramConfig,
  presets,
  type SticksHint,
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

const lineBits = (line: SticksLine): number =>
  line === "hor" ? F_HOR : line === "ver" ? F_VER : 0;

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

function executeMove(state: SticksState, move: SticksMove): SticksState {
  const next = cloneState(state);
  if (move.kind === "solve") {
    for (let i = 0; i < next.grid.length; i++) {
      if (state.grid[i] & F_BLOCK) continue;
      next.grid[i] = lineBits(move.grid[i]);
    }
  } else if (move.kind === "set") {
    for (const { index, line } of move.changes) {
      if (state.grid[index] & F_BLOCK) continue;
      next.grid[index] = lineBits(line);
    }
  } else {
    return assertNever(move, "sticks: executeMove");
  }
  return next;
}

function status(s: SticksState): GameStatus {
  return sticksValidate(s.grid, s.numbers, s.w, s.h) === "complete"
    ? "solved"
    : "ongoing";
}

function solve(orig: SticksState): SolveResult<SticksMove> {
  const grid = orig.grid.slice();
  const result = sticksSolveGame(grid, orig.numbers, orig.w, orig.h);
  if (result === "invalid") return { ok: false, error: NO_SOLUTION };
  // An unfinished solve still emits the partial deduction (upstream).
  return { ok: true, move: { kind: "solve", grid: Array.from(grid, bitsLine) } };
}

// --- hint (a second projection of the one contradiction technique) ----------

/**
 * Narrate *why* the square can only take one orientation, reading the clue
 * numbers the sentence names off the board. `continues` is a later leg of the
 * same firing. The words are [`hint-text.ts`](./hint-text.ts)'s.
 *
 * The cells it outlines are exactly what its sentence claims, so the player
 * can count the picture against the words. The forced square is deliberately
 * **kept** in the three length arguments and left out of the two black-clue
 * ones, because that is where it honestly belongs: the run a length argument
 * measures does contain the square being decided ("would run the 2's line to
 * 3 squares" shades all three, with the blue bar on the one to act on), while
 * the lines a black clue already counts do not include the one being ruled
 * out. Dropping it everywhere leaves an `unreachable` step whose whole
 * evidence *is* the target with nothing on the board (docs/games/hints.md
 * § "Show the evidence as an area").
 */
function narrate(
  firing: SticksFiring,
  state: SticksState,
  continues: boolean,
): Sentence {
  const { reason, to } = firing;
  const at = (i: number): Point => pointOf(i, state.w);
  // The evidence, split by the part each cell plays in the sentence.
  const [clues, cells] = ((): [number[], number[]] => {
    switch (reason.kind) {
      case "tooLong":
        return [[reason.clue], reason.segment];
      case "unreachable":
        return [[reason.clue], reason.span];
      case "twoClues":
        return [reason.clues, reason.segment];
      case "overConnected":
        return [[reason.clue], reason.lines.filter((c) => c !== firing.index)];
      case "starved":
        return [[reason.clue], reason.open];
    }
  })();
  const m: SticksMarks = {
    target: at(firing.index),
    // The square's own clue, or -1: what the closing sentence names it by.
    clue: state.numbers[firing.index],
    clues: clues.map(at),
    cells: cells.map(at),
  };
  switch (reason.kind) {
    case "tooLong":
      return say.tooLong(reason, to, m, continues);
    case "unreachable":
      return say.unreachable(reason, to, m, continues);
    case "twoClues":
      return say.twoClues(
        reason.clues.map((c) => state.numbers[c]),
        to,
        m,
        continues,
      );
    case "overConnected":
      return say.overConnected(reason, to, m, continues);
    case "starved":
      return say.starved(reason, to, m, continues);
  }
}

const pointOf = (i: number, w: number): Point => ({ x: i % w, y: Math.floor(i / w) });

/** A step's rung is the contradiction its firing rests on: `SticksReason`'s
 * kinds. The squares one firing decides share it. */
export const STICKS_RUNGS = [
  "tooLong",
  "unreachable",
  "twoClues",
  "overConnected",
  "starved",
] as const;
type SticksRung = (typeof STICKS_RUNGS)[number];

function hint(state: SticksState): HintResult<SticksMove, SticksHint, SticksRung> {
  const plan = deduceSticksPlan(state);
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };

  const steps: HintStep<SticksMove, SticksHint, SticksRung>[] = [];
  for (const group of plan) {
    // One firing = one journey: a clue that rules out several squares at once
    // is one insight, so its later squares continue the step rather than
    // queueing up as separate hints (quality-bar rule 2).
    group.forEach((f, leg) => {
      const words = narrate(f, state, leg > 0);
      steps.push({
        move: { kind: "set", changes: [{ index: f.index, line: f.to }] },
        rung: f.reason.kind,
        explanation: words.text,
        words,
        highlights: { target: f.index, to: f.to },
        continuesPrevious: leg > 0,
      });
    });
  }
  return { ok: true, steps };
}

/**
 * A move completes the step when it sets the hinted square to the hinted
 * orientation. Steps are single-square (a journey's legs arrive one at a time),
 * so there is no partial-subset `"onTrack"` case; a drag that sweeps the target
 * still completes it, and any move that leaves the target alone is off-plan.
 *
 * No `refreshHintStep`: Sticks has no pencil notes and no preference
 * that edits the board, so a kept step cannot be silently resolved by a side
 * effect — only by the player making its own move, which the midend sees.
 */
function hintKeepTrack(
  m: SticksMove,
  step: HintStep<SticksMove, SticksHint>,
  _state: SticksState,
): HintTrackVerdict {
  const hl = step.highlights;
  if (!hl || m.kind !== "set") return "off";
  for (const c of m.changes) {
    if (c.index === hl.target) return c.line === hl.to ? "completed" : "off";
  }
  return "off";
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
    { executeMove, hintKeepTrack },
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
  presets,
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

  solve,
  findMistakes,
  hint,
  hintRungs: STICKS_RUNGS,
  hintMarks: {
    roles: {
      ring: "the square the step decides, as the line it asks you to place, drawn in the hint color and running the way it must go: across for horizontal, up and down for vertical.",
      outline:
        "the cells the step reasons from: the cells a numbered line runs through or could still reach, or a block together with the lines already running into it or the cells beside it where one still could.",
    },
  },
  hintKeepTrack,
  hintGesture,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(sticksGame);
