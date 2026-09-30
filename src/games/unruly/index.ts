/**
 * Unruly — native TS port of `unruly.c` (the binary puzzle Binairo).
 * Fill the grid with two colors so no row/column has three equal cells
 * in a row and each row/column holds equally many of each; an optional
 * variant also forbids two identical rows or columns.
 *
 * Left-click cycles a cell empty → one (black) → zero (white) → empty;
 * right-click cycles the other way; number keys place directly.
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
  UiUpdate,
} from "../../engine/game.ts";
import { commonHintRefusal, DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import type { Narration } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  BACKSPACE,
  DELETE,
  digitOf,
  newCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { type Cell, EMPTY, ONE, ZERO } from "./constants.ts";
import { newDesc, solvableAt } from "./generator.ts";
import { type Marked, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PLACE_ANIM_TIME,
  PREFERRED_TILE_SIZE,
  redraw,
  type UnrulyDrawState,
} from "./render.ts";
import {
  deduceHintPlan,
  findMistakes,
  type HintReason,
  solveToString,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  newState,
  paramConfig,
  presets,
  status,
  textFormat,
  type UnrulyMistake,
  type UnrulyMove,
  type UnrulyParams,
  type UnrulyState,
  type UnrulyUi,
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: UnrulyState): UnrulyUi {
  return { cursor: newCursor() };
}

/** The cell value a key/click decided to set (upstream's `c`), or `null`
 * for "no change requested". */
/** Set the square `{ x, y }` to the value `next` picks from its current one;
 * a clue square, or one already holding that value, takes nothing. */
function place(next: Cell | ((current: Cell) => Cell)) {
  return (state: UnrulyState, { x, y }: Point): UnrulyMove | null => {
    const i = y * state.w2 + x;
    if (state.immutable[i]) return null;
    const current = state.grid[i] as Cell;
    const value = typeof next === "function" ? next(current) : next;
    return value === current ? null : { type: "place", x, y, value };
  };
}

const targetVerbs: TargetVerbs<
  UnrulyState,
  UnrulyUi,
  UnrulyDrawState,
  Point,
  UnrulyMove
> = {
  geometry: squareGrid({ size: (s) => ({ w: s.w2, h: s.h2 }), border }),
  // empty → black → white → empty
  primary: {
    does: "turn it black",
    apply: place((c) => (c === EMPTY ? ONE : c === ONE ? ZERO : EMPTY)),
  },
  // empty → white → black → empty
  secondary: {
    does: "turn it white",
    apply: place((c) => (c === EMPTY ? ZERO : c === ZERO ? ONE : EMPTY)),
  },
  keyOnly: [
    {
      does: "empty the square under the cursor",
      keys: [{ codes: [BACKSPACE, DELETE], name: "Backspace or Delete" }],
      apply: place(EMPTY),
    },
  ],
};

function interpretMove(
  state: UnrulyState,
  ui: UnrulyUi,
  ds: UnrulyDrawState,
  p: Point,
  rawButton: number,
): UnrulyMove | null | UiUpdate {
  // A digit sets the square under a shown cursor outright: 1 black, 0 or 2
  // white.
  const digit = digitOf(stripModifiers(rawButton));
  if (digit !== null && digit <= 2 && ui.cursor.visible)
    return place(digit === 1 ? ONE : ZERO)(state, ui.cursor);
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

function flashLength(
  oldState: UnrulyState,
  newState_: UnrulyState,
  _dir: number,
  _ui: UnrulyUi,
): number {
  return winFlash(oldState, newState_, FLASH_TIME);
}

// --- hint -----------------------------------------------------------------

/** Plan data for an Unruly hint step: the cell the deduction forces and the
 * color it forces, which keep-track compares a move against. The marks are
 * the step's words'. */
export interface UnrulyHint {
  target: Point & { value: Cell };
}

/** Every cell index of a row (`horizontal`) or column. */
function lineCells(
  line: number,
  horizontal: boolean,
  w2: number,
  h2: number,
): number[] {
  const n = horizontal ? w2 : h2;
  const out: number[] = [];
  for (let j = 0; j < n; j++) out.push(horizontal ? line * w2 + j : j * w2 + line);
  return out;
}

const pointOf = (i: number, w2: number): Point => ({
  x: i % w2,
  y: Math.floor(i / w2),
});

/** Narrate *why* the move is forced, per the deduction technique, naming the
 * cells `m` marks. The words are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(reason: HintReason, m: Marked): Narration {
  switch (reason.kind) {
    case "threes":
      return say.threes(reason, m);
    case "complete":
      return say.complete(reason, m);
    case "unique":
      return say.unique(reason, m);
    case "nearcomplete":
      return say.nearcomplete(reason, m);
  }
}

/** What a forced move's words mark, from its reason: the row or column the
 * sentence calls "this row", hatched whatever its cells hold
 * (docs/games/hints.md § "Hatch the line the sentence names"), and the
 * premise cells whose color is the evidence (the same-color pair, the
 * completed quota, the near-complete reserved window, the reference row),
 * outlined so the color that *is* the reason stays visible. */
function markedOf(reason: HintReason, target: Point, state: UnrulyState): Marked {
  const { w2, h2, grid } = state;
  const marked = (line: number[], evidence: number[]): Marked => ({
    target,
    line: line.map((i) => pointOf(i, w2)),
    evidence: evidence.map((i) => pointOf(i, w2)),
  });

  switch (reason.kind) {
    case "threes":
      return marked([], [...reason.refs]);
    case "complete": {
      const cells = lineCells(reason.line, reason.horizontal, w2, h2);
      // The already-placed `full` cells are the quota the sentence counts.
      return marked(
        cells,
        cells.filter((i) => grid[i] === reason.full),
      );
    }
    case "unique":
      // "This row" is the one being completed; the reference row it would copy
      // is "the outlined row", named by its mark.
      return marked(
        lineCells(reason.rowB, reason.horizontal, w2, h2),
        lineCells(reason.rowA, reason.horizontal, w2, h2),
      );
    case "nearcomplete":
      return marked(
        lineCells(reason.line, reason.horizontal, w2, h2),
        reason.anchor >= 0 ? [...reason.window, reason.anchor] : [...reason.window],
      );
  }
}

function hint(state: UnrulyState): HintResult<UnrulyMove, UnrulyHint> {
  const refusal = commonHintRefusal(state.completed, findMistakes(state).length);
  if (refusal) return refusal;
  const plan = deduceHintPlan(state);
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  const steps: HintStep<UnrulyMove, UnrulyHint>[] = plan.map((m) => {
    const value = m.value as Cell;
    const x = m.index % state.w2;
    const y = Math.floor(m.index / state.w2);
    const target = { x, y, value };
    const words = narrate(m.reason, markedOf(m.reason, { x, y }, state));
    return {
      move: { type: "place", x, y, value },
      explanation: words.text,
      words,
      highlights: { target },
      continuesPrevious: m.continuesPrevious,
    };
  });
  return { ok: true, steps };
}

/** A move completes the hint step iff it sets the hinted cell to the hinted
 * value; anything else drops the plan to recompute. */
function hintKeepTrack(
  m: UnrulyMove,
  step: HintStep<UnrulyMove, UnrulyHint>,
): HintTrackVerdict {
  const t = step.highlights?.target;
  const hit =
    m.type === "place" && t && m.x === t.x && m.y === t.y && m.value === t.value;
  return hit ? "completed" : "off";
}

/** Animate a placement that changes exactly one cell (so `solve`'s bulk fill
 * and no-ops stay instant); the midend stretches this to the uniform
 * hint-step duration, so auto-hint reads as continuous fills. */
function animLength(oldState: UnrulyState, newState_: UnrulyState): number {
  let changed = 0;
  const g0 = oldState.grid;
  const g1 = newState_.grid;
  for (let i = 0; i < g0.length; i++) {
    if (g0[i] !== g1[i] && ++changed > 1) return 0;
  }
  return changed === 1 ? PLACE_ANIM_TIME : 0;
}

/** Unruly's difficulty contract (`engine/difficulty.ts`). `solveGame` returns
 * the highest rung that fired, not a verdict, so solvability is read the way
 * the generator reads it, through the shared `solvableAt`. */
const difficulty: DifficultyContract<UnrulyParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return solvableAt(s, s.grid, cap) ? "solved" : "unsolved";
  },
};

export const unrulyGame: Game<
  UnrulyParams,
  UnrulyState,
  UnrulyMove,
  UnrulyUi,
  UnrulyDrawState,
  UnrulyMistake,
  UnrulyHint
> = {
  id: "unruly",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions<UnrulyParams>({ w: "w2", h: "h2" }),
  paramConfig,

  newDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  targetVerbs,
  executeMove,
  status,

  difficulty,

  solve(orig) {
    const grid = solveToString(orig);
    if (!grid) return { ok: false, error: "No solution found" };
    return { ok: true, move: { type: "solve", grid } };
  },

  hint,
  hintMarks: {
    roles: {
      ring: "the square to color. It is drawn empty: the sentence says whether it must be black or white.",
      outline:
        "the squares whose colors the step reasons from: the pair that would make three, the full quota, the only places the last one can go, or the row a match would copy.",
      stripes: 'the row or column the sentence calls "this row" or "this column".',
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

  animLength,
  flashLength,
};

registerGame(unrulyGame);
