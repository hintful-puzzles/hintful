/**
 * Wordtrail: divide a grid of letters into words, each a trail of letters
 * side by side, one word for each length the list gives.
 *
 * This file is the `Game` object and the glue around it: the input, the
 * answer, the hint's gesture. What the words can be is in
 * [`trails.ts`](./trails.ts), the rules a line obeys in
 * [`solver.ts`](./solver.ts), and the board in [`state.ts`](./state.ts).
 */

import type { DifficultyContract } from "../../engine/contract/difficulty.ts";
import {
  type Game,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/contract/game.ts";
import { NO_SOLUTION } from "../../engine/contract/solve-failure.ts";
import type { GameStatus, Point } from "../../engine/contract/types.ts";
import { transposeDimensions } from "../../engine/game-id/params.ts";
import { isMouseDown, newCursor } from "../../engine/input/pointer.ts";
import {
  type EdgeMistake,
  edgeMistakes,
  lineDrawing,
} from "../../engine/mechanics/line-drawing.ts";
import { registerGame } from "../../engine/midend/registry.ts";
import { dictionary } from "./dictionary.ts";
import { newWordtrailDesc } from "./generator.ts";
import {
  type WordtrailHighlights,
  wordtrailHint,
  wordtrailJudgeMove,
  wordtrailKeepTrack,
} from "./hint.ts";
import { wordtrailLines } from "./moves.ts";
import {
  colors,
  computeSize,
  layout,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type WordtrailDrawState,
} from "./render.ts";
import {
  answerOf,
  isComplete,
  rules,
  solveWordtrail,
  WORDTRAIL_RUNGS,
  type WordtrailRung,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  newState,
  paramConfig,
  textFormat,
  validateParams,
  type WordtrailMove,
  type WordtrailParams,
  type WordtrailState,
  type WordtrailUi,
} from "./state.ts";

function newUi(_state: WordtrailState): WordtrailUi {
  return { cursor: newCursor(), drag: null, spotlight: null };
}

// --- input ------------------------------------------------------------------

const input = lineDrawing<
  WordtrailState,
  WordtrailUi,
  WordtrailDrawState,
  WordtrailMove
>(wordtrailLines, {
  layout: (ds) => layout(ds.tileSize),
  move: (_state, changes) => ({ kind: "edges", changes }),
});

/** The right button's drag, which crosses every edge it passes. Not a `Game`
 * member, so the test of it imports it from here. */
export const crossDrag = input.crossDrag;

/** A press on the board ends the dictionary's spotlight, and repaints where
 * it does nothing else, so the outline goes. */
function interpretMove(
  state: WordtrailState,
  ui: WordtrailUi,
  ds: WordtrailDrawState,
  p: Point,
  button: number,
): WordtrailMove | null | UiUpdate {
  const dismissed = isMouseDown(button) && ui.spotlight !== null;
  if (dismissed) ui.spotlight = null;
  return (
    input.interpretMove(state, ui, ds, p, button) ?? (dismissed ? UI_UPDATE : null)
  );
}

// --- the answer -------------------------------------------------------------

function status(s: WordtrailState): GameStatus {
  return isComplete(s) ? "solved" : "ongoing";
}

function solve(orig: WordtrailState): SolveResult<WordtrailMove> {
  const edges = answerOf(orig);
  if (edges === null) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "answer", edges } };
}

/** No edge of a board the ladder cannot finish is a mistake: it has no
 * answer to compare with. */
function findMistakes(state: WordtrailState): readonly EdgeMistake[] {
  const answer = answerOf(state);
  return answer === null ? [] : edgeMistakes(state.edges, answer);
}

const difficulty: DifficultyContract<WordtrailParams> = {
  solveAtCap: (p, desc, cap) => solveWordtrail(newState(p, desc), cap),
};

export const wordtrailGame: Game<
  WordtrailParams,
  WordtrailState,
  WordtrailMove,
  WordtrailUi,
  WordtrailDrawState,
  EdgeMistake,
  WordtrailHighlights,
  WordtrailRung
> = {
  id: "wordtrail",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newWordtrailDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,
  rules,

  solve,
  difficulty,
  findMistakes,
  clearMistakes: (state, mistakes) =>
    input.clearEdges(
      state,
      mistakes.map((m) => m.edge),
    ),
  textFormat,
  reference: dictionary,
  hint: {
    plan: wordtrailHint,
    judgeMove: wordtrailJudgeMove,
    rungs: WORDTRAIL_RUNGS,
    marks: {
      roles: {
        ring: "the edges the step decides, drawn as the line or cross it asks for.",
        outline: "the letter it reasons from.",
        stripes: "the letters of the words it finds.",
      },
    },
    keepTrack: wordtrailKeepTrack,
    gesture: (state, _ui, ds, move) =>
      move.kind === "edges" ? input.hintGesture(state, ds, move.changes) : [],
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(wordtrailGame);
