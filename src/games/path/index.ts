/**
 * Path: draw lines from square to square that never cross or branch, so
 * every square has a line through it. Its Path ruleset draws one line
 * through the numbers in order; its Pairs ruleset (Numberlink) joins each
 * pair of like numbers with a line of its own.
 *
 * This file is the `Game` object and the glue around it: the input, the
 * answer, the hint's gesture. The rules a line obeys are in
 * [`solver.ts`](./solver.ts), and the board in [`state.ts`](./state.ts).
 */

import { solveFromAnswer } from "../../engine/answer-search.ts";
import type { Game, SolveResult } from "../../engine/game.ts";
import {
  type EdgeMistake,
  edgeMistakes,
  lineDrawing,
} from "../../engine/line-drawing.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { GameStatus } from "../../engine/types.ts";
import { newPathDesc } from "./generator.ts";
import { type PathHighlights, pathHint, pathKeepTrack } from "./hint.ts";
import { pathLines } from "./moves.ts";
import {
  colors,
  computeSize,
  layout,
  newDrawState,
  type PathDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  isComplete,
  PATH_RUNGS,
  PathBoard,
  type PathRung,
  solvePath,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  newState,
  type PathMove,
  type PathParams,
  type PathState,
  type PathUi,
  paramConfig,
  TIERS,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: PathState): PathUi {
  return { cursor: newCursor(), drag: null };
}

// --- input ------------------------------------------------------------------

const input = lineDrawing<PathState, PathUi, PathDrawState, PathMove>(pathLines, {
  layout: (ds) => layout(ds.tileSize),
  move: (_state, changes) => ({ kind: "edges", changes }),
});

/** The right button's drag, which crosses every edge it passes. */
export const crossDrag = input.crossDrag;

// --- the answer -------------------------------------------------------------

function status(s: PathState): GameStatus {
  return isComplete(s, s.edges) ? "solved" : "ongoing";
}

function solve(orig: PathState): SolveResult<PathMove> {
  return solveFromAnswer(answerOf(orig), (edges) => ({ kind: "solve", edges }));
}

/** No edge of a board without one answer is a mistake: it has none to
 * compare with. */
function findMistakes(state: PathState): readonly EdgeMistake[] {
  const answer = answerOf(state);
  return answer.kind === "one" ? edgeMistakes(state.edges, answer.solution) : [];
}

const difficulty = TIERS.contract<PathParams, PathState>({
  newState,
  deductionFinishes: (s, cap) => solvePath(new PathBoard(s, s.edges), cap) === "solved",
  answerOf: (s) => answerOf(s),
});

export const pathGame: Game<
  PathParams,
  PathState,
  PathMove,
  PathUi,
  PathDrawState,
  EdgeMistake,
  PathHighlights,
  PathRung
> = {
  id: "path",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newPathDesc,
  newState,
  newUi,

  interpretMove: input.interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  textFormat,

  hint: pathHint,
  hintRungs: PATH_RUNGS,
  hintMarks: {
    roles: {
      ring: "the edges the step decides, drawn as the line or cross it asks for.",
      outline:
        "the squares it reasons from, and the edges it tries lines on, drawn thin.",
    },
  },
  hintKeepTrack: pathKeepTrack,
  hintGesture: (state, _ui, ds, move) =>
    move.kind === "edges" ? input.hintGesture(state, ds, move.changes) : [],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(pathGame);
