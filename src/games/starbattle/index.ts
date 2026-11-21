import { registerGame } from "../../engine/midend/registry.ts";
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

import type { DifficultyContract } from "../../engine/contract/difficulty.ts";
import type { Game, SolveResult } from "../../engine/contract/game.ts";
import { SQUARE_GRID } from "../../engine/contract/sections.ts";
import { NO_SOLUTION } from "../../engine/contract/solve-failure.ts";
import type { GameStatus, Point } from "../../engine/contract/types.ts";
import { entryMistakes, gridCell } from "../../engine/hint/entry-mistakes.ts";
import { newCursor } from "../../engine/input/pointer.ts";
import {
  ERASE_KEYS,
  interpretTargetVerbs,
  rulingOut,
  squareGrid,
  type TargetVerb,
  type TargetVerbs,
} from "../../engine/input/target-verb.ts";
import { newStarbattleDesc } from "./generator.ts";
import {
  type StarbattleHint,
  starbattleHint,
  starbattleJudgeMove,
  starbattleKeepTrack,
  starbattleRefreshHintStep,
  starbattleRulesOut,
} from "./hint.ts";
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
  menu,
  newState,
  paramConfig,
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
    if (mark === old) return null;
    return { kind: "mark", cells: [{ index, mark }] };
  };

/** One click of a button: blank, then `first`, then the other mark, then
 * blank again. */
const cycle =
  (first: StarbattleMark, second: StarbattleMark) =>
  (old: StarbattleMark): StarbattleMark =>
    old === BLANK ? first : old === first ? second : BLANK;

// The left button places the thing the puzzle is about and the right button
// says "nothing here", as in the rest of the collection (docs/input.md
// § "Targets and verbs").
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
  primary: star,
  secondary: rulingOut(cross),
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

/** Each wrong square blanked, in one move. */
function clearMistakes(
  state: StarbattleState,
  mistakes: readonly StarbattleMistake[],
): StarbattleMove[] {
  const cells: { index: number; mark: StarbattleMark }[] = mistakes.map(({ x, y }) => ({
    index: y * state.size + x,
    mark: BLANK,
  }));
  return cells.length === 0 ? [] : [{ kind: "mark", cells }];
}

const difficulty: DifficultyContract<StarbattleParams> = {
  solveAtCap: (p, desc, cap) => solveStarbattle(boardOf(newState(p, desc)), cap),
};

// --- the hint's gesture -----------------------------------------------------

/** A click on each square the step decides, with the button that marks it
 * the way the step asks. */
function hintTargets(state: StarbattleState, move: StarbattleMove): Point[] {
  if (move.kind !== "mark") return [];
  const { size } = state;
  return move.cells.map(({ index }) => ({ x: index % size, y: (index / size) | 0 }));
}

export const starbattleGame: Game<
  StarbattleParams,
  StarbattleState,
  StarbattleMove,
  StarbattleUi,
  StarbattleDrawState,
  StarbattleMistake,
  StarbattleHint,
  StarbattleRung
> = {
  id: "starbattle",

  defaultParams,
  menu,
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
  clearMistakes,
  textFormat,
  hint: {
    plan: starbattleHint,
    judgeMove: starbattleJudgeMove,
    rungs: STARBATTLE_RUNGS,
    marks: {
      roles: {
        ring: "the squares the step decides. The sentence says what they must be.",
        stripes:
          "the row, column or region the step is about, or several rows or columns counted together.",
        outline:
          "what else it reasons from: a star, a region, or the squares a star would block.",
      },
    },
    keepTrack: starbattleKeepTrack,
    refreshStep: starbattleRefreshHintStep,
    targets: hintTargets,
  },

  rulesOut: starbattleRulesOut,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(starbattleGame);
