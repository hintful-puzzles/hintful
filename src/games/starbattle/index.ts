import { registerGame } from "../../engine/registry.ts";
/**
 * Star Battle: place stars in a square grid divided into regions, so that
 * every row, every column and every region holds the same number of them and
 * no two stars touch, even at a corner. With one star to each it is the
 * puzzle also known as Queens.
 *
 * This file is the `Game` object and the glue around it. The rules a square
 * obeys are in [`solver.ts`](./solver.ts), and the board in
 * [`state.ts`](./state.ts).
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { entryMistakes, gridCell } from "../../engine/entry-mistakes.ts";
import type { Game, HintStep, SolveResult } from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { newCursor } from "../../engine/pointer.ts";
import { SQUARE_GRID } from "../../engine/sections.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  ERASE_KEYS,
  interpretTargetVerbs,
  squareGrid,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newStarbattleDesc } from "./generator.ts";
import { starbattleHint, starbattleKeepTrack, starbattleMakesStep } from "./hint.ts";
import {
  border,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type StarbattleDrawState,
} from "./render.ts";
import {
  answerOf,
  isComplete,
  STARBATTLE_RUNGS,
  StarbattleBoard,
  type StarbattleRung,
  solveStarbattle,
} from "./solver.ts";
import {
  BLANK,
  CROSSED,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  newState,
  paramConfig,
  presets,
  STAR,
  type StarbattleMark,
  type StarbattleMove,
  type StarbattleParams,
  type StarbattleState,
  type StarbattleUi,
  textFormat,
  validateParams,
} from "./state.ts";

/** A square whose mark is not the answer's. */
export interface StarbattleMistake extends Point {
  kind: "cell" | "note";
}

function newUi(_state: StarbattleState): StarbattleUi {
  return { cursor: newCursor() };
}

const boardOf = (s: StarbattleState): StarbattleBoard =>
  new StarbattleBoard(s.size, s.stars, s.regions, s.grid);

// --- input ------------------------------------------------------------------

type StarbattleVerb = TargetVerb<StarbattleState, StarbattleUi, Point, StarbattleMove>;

/** A verb that gives the square `to(old)`, and nothing where the square would
 * stay as it is. */
const markWith =
  (to: (old: StarbattleMark) => StarbattleMark) =>
  (s: StarbattleState, { x, y }: Point): StarbattleMove | null => {
    const index = y * s.size + x;
    const old = s.grid[index] as StarbattleMark;
    const mark = to(old);
    return mark === old ? null : { kind: "mark", cells: [{ index, mark }] };
  };

/** One click of a button: blank, then `first`, then the other mark, then
 * blank again. */
const cycle =
  (first: StarbattleMark, second: StarbattleMark) =>
  (old: StarbattleMark): StarbattleMark =>
    old === BLANK ? first : old === first ? second : BLANK;

// A board has many more empty squares than stars, and a player crosses most
// of them out on the way, so the cross is the first click and the drag.
const cross: StarbattleVerb = {
  does: "cross it out (click again to put a star there, and again to clear it)",
  apply: markWith(cycle(CROSSED, STAR)),
};
const star: StarbattleVerb = {
  does: "put a star there (click again to cross it out, and again to clear it)",
  apply: markWith(cycle(STAR, CROSSED)),
};

const targetVerbs: TargetVerbs<
  StarbattleState,
  StarbattleUi,
  StarbattleDrawState,
  Point,
  StarbattleMove
> = {
  geometry: squareGrid({
    size: (s) => ({ w: s.size, h: s.size }),
    border: (ts) => border(ts),
  }),
  sweep: { holds: (s, { x, y }) => s.grid[y * s.size + x] },
  primary: cross,
  secondary: star,
  keyOnly: [
    {
      does: "clear it",
      keys: ERASE_KEYS,
      apply: markWith(() => BLANK),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
};

// --- the answer -------------------------------------------------------------

function status(s: StarbattleState): GameStatus {
  return isComplete(boardOf(s)) ? "solved" : "ongoing";
}

function solve(orig: StarbattleState): SolveResult<StarbattleMove> {
  const grid = answerOf(orig.size, orig.stars, orig.regions);
  if (grid === null) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solve", grid } };
}

/** The squares marked against the answer. A blank square is never one, and
 * neither is any square of a board the ladder cannot finish, which has no
 * answer to compare with. */
function findMistakes(state: StarbattleState): readonly StarbattleMistake[] {
  const { size, stars, regions, grid } = state;
  const answer = answerOf(size, stars, regions);
  if (answer === null) return [];
  return entryMistakes({ answer, entry: grid }, gridCell(size));
}

const difficulty: DifficultyContract<StarbattleParams> = {
  solveAtCap: (p, desc, cap) => solveStarbattle(boardOf(newState(p, desc)), cap),
};

// --- the hint's gesture -----------------------------------------------------

/** A click on each square the step decides, with the button that marks it
 * the way the step asks. */
function hintGesture(
  state: StarbattleState,
  ui: StarbattleUi,
  ds: StarbattleDrawState,
  move: StarbattleMove,
  step: HintStep<StarbattleMove>,
): readonly PointerAction[] {
  if (move.kind !== "mark") return [];
  const { size } = state;
  return verbClicks(
    targetVerbs,
    { executeMove, hintKeepTrack: starbattleMakesStep },
    state,
    ui,
    ds,
    step,
    move.cells.map(({ index }) => ({ x: index % size, y: (index / size) | 0 })),
  );
}

export const starbattleGame: Game<
  StarbattleParams,
  StarbattleState,
  StarbattleMove,
  StarbattleUi,
  StarbattleDrawState,
  StarbattleMistake,
  unknown,
  StarbattleRung
> = {
  id: "starbattle",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,
  notApplicable: { transposeParams: SQUARE_GRID },

  newDesc: newStarbattleDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove: (state, ui, ds, p, button) =>
    interpretTargetVerbs(targetVerbs, state, ui, ds, p, button),
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  textFormat,

  hint: starbattleHint,
  hintRungs: STARBATTLE_RUNGS,
  hintMarks: {
    roles: {
      ring: "the squares the step decides. The sentence says what they must be.",
      stripes:
        "the row, column or region the step is about, or several rows or columns counted together.",
      outline:
        "what else it reasons from: a star, a region, or the squares a star would rule out.",
    },
  },
  hintKeepTrack: starbattleKeepTrack,
  hintGesture,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(starbattleGame);
