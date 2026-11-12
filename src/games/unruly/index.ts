/**
 * Unruly — native TS port of `unruly.c` (the binary puzzle Binairo).
 * Fill the grid with two colors so no row/column has three equal cells
 * in a row and each row/column holds equally many of each; an optional
 * variant also forbids two identical rows or columns.
 *
 * Left-click cycles a cell empty → one → zero → empty;
 * right-click cycles the other way; number keys place directly.
 */

import { type CellHint, describedHint } from "../../engine/described-hint.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import type { Game, UiUpdate } from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { digitOf, newCursor, stripModifiers } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  ERASE_KEYS,
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { type Cell, EMPTY, ONE, ZERO } from "./constants.ts";
import { newDesc, solvableAt } from "./generator.ts";
import { colorName, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  newDrawState,
  PLACE_ANIM_TIME,
  PREFERRED_TILE_SIZE,
  redraw,
  type UnrulyDrawState,
} from "./render.ts";
import { findMistakes, LADDERS, marksOf, solveToString } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  newState,
  paramConfig,
  status,
  textFormat,
  type UnrulyMistake,
  type UnrulyMove,
  type UnrulyParams,
  type UnrulyState,
  type UnrulyUi,
  validateParams,
} from "./state.ts";
import type { SaysById } from "./unruly.compiled.ts";

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
  // empty → one → zero → empty
  primary: {
    does: `turn it ${colorName(ONE).only}`,
    apply: place((c) => (c === EMPTY ? ONE : c === ONE ? ZERO : EMPTY)),
  },
  // empty → zero → one → empty
  secondary: {
    does: `turn it ${colorName(ZERO).only}`,
    apply: place((c) => (c === EMPTY ? ZERO : c === ZERO ? ONE : EMPTY)),
  },
  keyOnly: [
    {
      does: "empty the square under the cursor",
      keys: ERASE_KEYS,
      apply: place(EMPTY),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
  sweep: { holds: (s, { x, y }) => s.grid[y * s.w2 + x] },
};

function interpretMove(
  state: UnrulyState,
  ui: UnrulyUi,
  ds: UnrulyDrawState,
  p: Point,
  rawButton: number,
): UnrulyMove | null | UiUpdate {
  // A digit sets the square under a shown cursor outright: 1 is ONE, 0 or 2
  // is ZERO.
  const digit = digitOf(stripModifiers(rawButton));
  if (digit !== null && digit <= 2 && ui.cursor.visible)
    return place(digit === 1 ? ONE : ZERO)(state, ui.cursor);
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

// --- hint -----------------------------------------------------------------

/** The hint's steps, kinds and track-keeping, built by the engine from the
 * description's firings (`engine/described-hint.ts`) with Unruly's sentences. */
const described = describedHint<UnrulyState, UnrulyMove, SaysById>({
  name: "unruly hint",
  marks: ({ w2, h2, unique, grid }) =>
    marksOf({ w2, h2, unique, grid: Uint8Array.from(grid) }),
  entries: ({ unique }) => (unique ? LADDERS.unique : LADDERS.plain).entries,
  width: ({ w2 }) => w2,
  move: ({ x, y }, value) => ({ type: "place", x, y, value: value as Cell }),
  say,
});

export type UnrulyRung = keyof SaysById;
export type UnrulyHint = CellHint;

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

/** Each wrong square emptied, a move apiece. */
function clearMistakes(
  _state: UnrulyState,
  mistakes: readonly UnrulyMistake[],
): UnrulyMove[] {
  return mistakes.map(({ x, y }) => ({ type: "place", x, y, value: EMPTY }));
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
  UnrulyHint,
  UnrulyRung
> = {
  id: "unruly",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions<UnrulyParams>({ w: "w2", h: "h2" }),
  paramConfig,

  newDesc,
  newState,
  newUi,

  interpretMove,
  targetVerbs,
  executeMove,
  status,

  difficulty,

  solve(orig) {
    const grid = solveToString(orig);
    if (!grid) return { ok: false, error: PUZZLE_NOT_REASONABLE };
    return { ok: true, move: { type: "solve", grid } };
  },

  hint: described.hint,
  hintRungs: described.hintRungs,
  hintMarks: {
    roles: {
      ring: `the square to color. It is drawn empty: the sentence says whether it must be ${colorName(ONE).only} or ${colorName(ZERO).only}.`,
      outline:
        "the squares whose colors the step reasons from: the pair that would make three, the full quota, the only places the last one can go, or the row a match would copy.",
      stripes: 'the row or column the sentence calls "this row" or "this column".',
    },
  },
  hintKeepTrack: described.hintKeepTrack,
  hintGesture: (s, ui, ds, m) => {
    if (m.type !== "place") throw new Error("unruly: a hint only places");
    const at = { x: m.x, y: m.y };
    // Each button walks the three states one way round, so one of them reaches
    // any other state in one press.
    const left = targetVerbs.primary.apply(s, at, ui);
    const reaches =
      typeof left === "object" && left?.type === "place" && left.value === m.value;
    return verbGesture(targetVerbs, s, ds, ui, [at], reaches ? "primary" : "secondary");
  },
  findMistakes,
  clearMistakes,

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength,
};

registerGame(unrulyGame);
