/**
 * Separate ("Block Puzzle"). Upstream (`separate.c`) is an *unfinished* puzzle:
 * only its solver/generator were written, so the playable game is ours. Every
 * cell holds one of `k` letters; the player draws walls so the grid divides into
 * connected `k`-ominoes, each holding one of each letter.
 *
 * The interaction is Palisade's: edges are three-valued (wall / no-wall-mark /
 * unknown) and shared between two cells, so each edit records both sides; input
 * picks the edge nearest the click (left toggles wall, right toggles no-wall
 * mark) with a half-grid keyboard cursor.
 */

import type { Game } from "../../engine/contract/game.ts";
import { transposeDimensions } from "../../engine/game-id/params.ts";
import { newCursor } from "../../engine/input/pointer.ts";
import { playedByTargetVerbs } from "../../engine/input/target-verb.ts";
import {
  BORDER,
  BORDER_MASK,
  borderGridVerbs,
  clearBorderEdges,
  DISABLED,
  revealBorderEdge,
} from "../../engine/mechanics/border-grid.ts";
import {
  BORDER_RING_LEGEND,
  type BorderHint,
  borderStepEdge,
} from "../../engine/mechanics/border-grid-hint.ts";
import { registerGame } from "../../engine/midend/registry.ts";
import {
  searchTierContract,
  solveFromAnswer,
} from "../../engine/solve/answer-search.ts";
import { hintFinishes } from "../../engine/solve/hint-finishes.ts";
import { newSeparateDesc } from "./generator.ts";
import {
  SEPARATE_RUNGS,
  type SeparateRung,
  separateHint,
  separateHintKeepTrack,
  separateJudgeMove,
} from "./hint.ts";
import {
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SeparateDrawState,
} from "./render.ts";
import { answerOf, rules, solveToBorders } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  newState,
  paramConfig,
  type SeparateMistake,
  type SeparateMove,
  type SeparateParams,
  type SeparateState,
  type SeparateUi,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: SeparateState): SeparateUi {
  return { cursor: newCursor(1, 1) };
}

// --- input -----------------------------------------------------------------

const targetVerbs = borderGridVerbs<
  SeparateState,
  SeparateUi,
  SeparateDrawState,
  SeparateMove
>((edits) => ({ type: "edges", edits }));

// --- mistakes --------------------------------------------------------------

/** Every edge the player has decided against the board's one answer, which
 * the search found at either tier. Nothing is flagged where it did not prove
 * there is exactly one. */
function findMistakes(state: SeparateState): readonly SeparateMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const sol = answer.solution;
  const { w, h, borders } = state;
  const out: SeparateMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      for (let dir = 0; dir < 4; dir++) {
        const b = BORDER(dir);
        const solWall = sol[i] & b;
        if ((borders[i] & b && !solWall) || (borders[i] & DISABLED(b) && solWall))
          out.push({ x, y, dir });
      }
    }
  }
  return out;
}

// --- Game object -----------------------------------------------------------

export const separateGame: Game<
  SeparateParams,
  SeparateState,
  SeparateMove,
  SeparateUi,
  SeparateDrawState,
  SeparateMistake,
  BorderHint,
  SeparateRung
> = {
  id: "separate",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSeparateDesc,
  newState,
  newUi,

  ...playedByTargetVerbs(targetVerbs),
  executeMove,
  status,
  rules,

  solve: (orig, _curr) =>
    solveFromAnswer(answerOf(orig), (sol) => ({
      type: "solve",
      borders: Array.from(sol, (b) => (b & BORDER_MASK) | DISABLED(~b & BORDER_MASK)),
    })),
  // Easy is what the solver's three rungs finish and the hint, which runs the
  // same rungs from the player's edges, finishes too.
  difficulty: searchTierContract<SeparateParams, SeparateState>({
    newState,
    deductionFinishes: (state) =>
      solveToBorders(state, state.letters) !== null &&
      hintFinishes(separateGame, state),
    answerOf,
  }),

  findMistakes,
  clearMistakes: (state, mistakes) => {
    const edits = clearBorderEdges(state, mistakes);
    return edits.length > 0 ? [{ type: "edges", edits }] : [];
  },
  revealOne: (state, solved) => {
    const edits = revealBorderEdge(state, solved);
    return edits === null ? null : { type: "edges", edits };
  },
  hint: {
    plan: separateHint,
    judgeMove: separateJudgeMove,
    marks: {
      roles: {
        ring: BORDER_RING_LEGEND,
        outline:
          "a second region the step reasons from, or a lone square, which the sentence names by its letter or calls a square.",
        stripes: "the region the sentence is about, which can be a lone square.",
      },
    },
    rungs: SEPARATE_RUNGS,
    keepTrack: separateHintKeepTrack,
    targets: (_s, m) => {
      if (m.type !== "edges") throw new Error("separate: a hint only sets edges");
      return [borderStepEdge(m.edits)];
    },
  },

  textFormat,
  statusbarText: (s) => `${s.k} letters per region`,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(separateGame);
