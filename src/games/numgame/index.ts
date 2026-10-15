/**
 * Numgame: combine six numbers with + − × ÷ to make a target, as in
 * Countdown's numbers round.
 *
 * Upstream's `numgame.c` is a solver with no game; everything a player
 * touches here was designed for this collection (`add-numgame-ts-port`). The
 * board is in [`state.ts`](./state.ts) and the search in
 * [`solver.ts`](./solver.ts).
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import type { Game, HintStep, SolveResult } from "../../engine/game.ts";
import { click, type PointerAction } from "../../engine/hint-gesture.ts";
import { registerGame, UI_UPDATE, type UiUpdate } from "../../engine/index.ts";
import {
  cursorDelta,
  isCancelKey,
  newCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { solveBySearch } from "../../engine/search-outcome.ts";
import {
  interpretTargetVerbs,
  type TargetVerb,
  type TargetVerbs,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newNumgameDesc } from "./generator.ts";
import {
  hasNoSolution,
  NUMGAME_RUNGS,
  type NumgameRung,
  numgameHint,
  numgameKeepTrack,
} from "./hint.ts";
import { HINT_MARKS } from "./hint-text.ts";
import {
  colors,
  computeSize,
  elementAt,
  elementCenter,
  type NumgameDrawState,
  newDrawState,
  opElement,
  PREFERRED_TILE_SIZE,
  redraw,
  SLIDE_S,
} from "./render.ts";
import { findLine, OPS, type Op, reachOf } from "./solver.ts";
import {
  combined,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  type NumgameMove,
  type NumgameParams,
  type NumgameState,
  type NumgameUi,
  newState,
  normalized,
  OPS_AT_EASIEST,
  PLACES,
  paramConfig,
  presets,
  ROW,
  reachesTarget,
  textFormat,
} from "./state.ts";

function newUi(_state: NumgameState): NumgameUi {
  return { selected: null, op: null, cursor: newCursor() };
}

// --- input ------------------------------------------------------------------

/** A target is an element of the board: a place, or an operator's button
 * (`opElement`). The target number is never one. */
type Target = number;

/** The operator a target is, or `null` for a place. */
const opOf = (t: Target): Op | null => (t >= PLACES ? (OPS[t - PLACES] ?? null) : null);

/** The cursor's rows: two of places, then one of the operators. */
const OP_ROW = 2;

const cursorTarget = (ui: NumgameUi): Target =>
  ui.cursor.y === OP_ROW
    ? opElement(OPS[ui.cursor.x])
    : ui.cursor.y * ROW + ui.cursor.x;

/** The operator, chosen or unchosen; only once a number is selected. */
function pickOp(ui: NumgameUi, op: Op): UiUpdate | null {
  if (ui.selected === null) return null;
  ui.op = ui.op === op ? null : op;
  return UI_UPDATE;
}

/**
 * One tap, whatever it lands on (design D5): a number selects it, the
 * selected one again deselects it, another number moves the selection while
 * no operator is chosen, and makes the move once one is. A number the
 * operator cannot combine with the selected one does nothing.
 */
const tap: TargetVerb<NumgameState, NumgameUi, Target, NumgameMove> = {
  does: "pick it: a number, then an operator, then another number combines the two numbers",
  apply(s, t, ui) {
    const op = opOf(t);
    if (op !== null) return pickOp(ui, op);
    if (!s.slots[t]) return null;
    if (ui.selected === t) {
      ui.selected = null;
      ui.op = null;
      return UI_UPDATE;
    }
    if (ui.selected === null || ui.op === null) {
      ui.selected = t;
      return UI_UPDATE;
    }
    const step = normalized(s.slots, { from: ui.selected, into: t, op: ui.op });
    return combined(s.slots, step) === null ? null : { kind: "combine", ...step };
  },
};

const targetVerbs: TargetVerbs<
  NumgameState,
  NumgameUi,
  NumgameDrawState,
  Target,
  NumgameMove
> = {
  geometry: {
    noun: "number or operator",
    pointerTarget: (_s, ds, p) => {
      const i = elementAt(ds, p);
      return i !== null && i < PLACES + OPS.length ? i : null;
    },
    pointAt: (_s, ds, t) => elementCenter(ds, t),
    cursorTarget: (_s, ui) => cursorTarget(ui),
    parkCursor: (ui, t) => {
      const op = opOf(t);
      ui.cursor.x = op === null ? t % ROW : OPS.indexOf(op);
      ui.cursor.y = op === null ? Math.floor(t / ROW) : OP_ROW;
    },
    moveCursor: (_s, ui, button) => {
      const d = cursorDelta(button);
      if (d === null) return false;
      const { cursor } = ui;
      const y = Math.min(OP_ROW, Math.max(0, cursor.y + d.dy));
      const width = y === OP_ROW ? OPS.length : ROW;
      const x = Math.min(width - 1, Math.max(0, cursor.x + d.dx));
      const changed = !cursor.visible || x !== cursor.x || y !== cursor.y;
      cursor.x = x;
      cursor.y = y;
      cursor.visible = true;
      return changed;
    },
  },
  primary: tap,
};

/** The keys that choose an operator, `x` for × beside `*`. */
const OP_KEYS: ReadonlyMap<number, Op> = new Map([
  ["+".charCodeAt(0), "+"],
  ["-".charCodeAt(0), "-"],
  ["*".charCodeAt(0), "*"],
  ["x".charCodeAt(0), "*"],
  ["X".charCodeAt(0), "*"],
  ["/".charCodeAt(0), "/"],
]);

function interpretMove(
  s: NumgameState,
  ui: NumgameUi,
  ds: NumgameDrawState,
  p: Point,
  button: number,
): NumgameMove | UiUpdate | null {
  const op = OP_KEYS.get(stripModifiers(button));
  if (op !== undefined) {
    // With nothing selected, the key picks the number under the cursor too,
    // so a keyboard player's move is the operator's key between two numbers.
    if (ui.selected === null && ui.cursor.visible) {
      const t = cursorTarget(ui);
      if (opOf(t) !== null || !s.slots[t]) return null;
      ui.selected = t;
    }
    return pickOp(ui, op);
  }
  if (isCancelKey(button)) {
    if (ui.selected === null) return null;
    ui.selected = null;
    ui.op = null;
    return UI_UPDATE;
  }
  return interpretTargetVerbs(targetVerbs, s, ui, ds, p, button);
}

/** A selection names numbers on the board it was made on, so every board
 * change clears it. */
function changedState(ui: NumgameUi): void {
  ui.selected = null;
  ui.op = null;
}

// --- the answer -------------------------------------------------------------

function status(s: NumgameState): GameStatus {
  return reachesTarget(s) ? "solved" : "ongoing";
}

/** A shortest line from the player's numbers, else from the numbers dealt. */
function solve(orig: NumgameState, curr: NumgameState): SolveResult<NumgameMove> {
  return solveBySearch(
    orig,
    curr,
    (s) => findLine(s.slots, s.target),
    (from, line) => ({ kind: "solve", restart: from !== curr, steps: line }),
  );
}

/** A tier is a cap on the operations: the target is made within the tier's
 * count, made only with more, or not made at all (design D4). */
const difficulty: DifficultyContract<NumgameParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const fewest = reachOf(s.slots).fewestOps(s.target);
    if (fewest === null) return "impossible";
    return fewest <= cap + OPS_AT_EASIEST ? "solved" : "unsolved";
  },
};

// --- the hint's gesture -----------------------------------------------------

/** The taps that make the step's combination from the selection as it
 * stands: the first number (unless it is already selected), the operator
 * (unless it is already chosen), the second number. A selection with an
 * operator on another number is put down first, since a tap would combine
 * with it. */
function hintGesture(
  _s: NumgameState,
  ui: NumgameUi,
  ds: NumgameDrawState,
  move: NumgameMove,
  _step: HintStep<NumgameMove>,
): readonly PointerAction[] {
  if (move.kind !== "combine") return [];
  const tapAt = (t: Target) => click(elementCenter(ds, t));
  const out: PointerAction[] = [];
  const held = ui.selected === move.from;
  if (!held && ui.selected !== null && ui.op !== null) out.push(tapAt(ui.selected));
  if (!held) out.push(tapAt(move.from));
  if (!held || ui.op !== move.op) out.push(tapAt(opElement(move.op)));
  out.push(tapAt(move.into));
  return out;
}

export const numgameGame: Game<
  NumgameParams,
  NumgameState,
  NumgameMove,
  NumgameUi,
  NumgameDrawState,
  unknown,
  unknown,
  NumgameRung
> = {
  id: "numgame",
  // A tap is the whole of the input, so a held finger stays a tap.
  ignoresSecondaryButton: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  paramConfig,

  newDesc: newNumgameDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  changedState,
  executeMove,
  status,
  notApplicable: {
    findMistakes:
      "Any combination that still leaves the target within reach is fine, so there is no single answer to check a move against.",
    transposeParams:
      "The board is the same six places, the target and the four operators however the screen is turned.",
  },

  solve,
  hasNoSolution,
  difficulty,
  textFormat,

  hint: numgameHint,
  hintRungs: NUMGAME_RUNGS,
  hintMarks: HINT_MARKS,
  hintKeepTrack: numgameKeepTrack,
  hintGesture,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: (a, b, dir) => {
    if (dir <= 0) return 0;
    return a.slots.some((t, i) => t !== null && b.slots[i] === null) ? SLIDE_S : 0;
  },
};

registerGame(numgameGame);
