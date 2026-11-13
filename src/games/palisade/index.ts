/**
 * Palisade — native TS port of `palisade.c` (Nikoli's "Five Cells").
 * Numeric clues count the walls around a cell; the player draws walls
 * so the grid divides into connected regions of exactly `k` cells, each
 * clue equal to its cell's wall count.
 *
 * Input picks the edge nearest the click (left toggles wall, right toggles
 * no-wall mark), and there is a half-grid keyboard cursor.
 */

import { searchTierContract, solveFromAnswer } from "../../engine/answer-search.ts";
import {
  BORDER,
  BORDER_MASK,
  borderGridVerbs,
  clearBorderEdges,
  DISABLED,
  revealBorderEdge,
} from "../../engine/border-grid.ts";
import { BORDER_RING_LEGEND, borderStepEdge } from "../../engine/border-grid-hint.ts";
import type { Game, UiUpdate } from "../../engine/game.ts";
import { hintFinishes } from "../../engine/hint-finishes.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { interpretTargetVerbs, verbClicks } from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import {
  PALISADE_RUNGS,
  type PalisadeRung,
  palisadeHint,
  palisadeHintKeepTrack,
} from "./hint.ts";
import {
  colors,
  computeSize,
  newDrawState,
  type PalisadeDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { answerOf, solveToBorders } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  newState,
  type PalisadeHint,
  type PalisadeMistake,
  type PalisadeMove,
  type PalisadeParams,
  type PalisadeState,
  type PalisadeUi,
  paramConfig,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: PalisadeState): PalisadeUi {
  return { cursor: newCursor(1, 1) };
}

// --- input -----------------------------------------------------------------

const targetVerbs = borderGridVerbs<
  PalisadeState,
  PalisadeUi,
  PalisadeDrawState,
  PalisadeMove
>((edits) => ({ type: "edges", edits }));

function interpretMove(
  state: PalisadeState,
  ui: PalisadeUi,
  ds: PalisadeDrawState,
  p: Point,
  rawButton: number,
): PalisadeMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

// --- mistakes --------------------------------------------------------------

/** Every edge the player has decided against the board's one answer, which
 * the search found at either tier. Nothing is flagged where it did not prove
 * there is exactly one. */
function findMistakes(state: PalisadeState): readonly PalisadeMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const sol = answer.solution;
  const { w, h, borders } = state;
  const out: PalisadeMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      for (let dir = 0; dir < 4; dir++) {
        const b = BORDER(dir);
        const solWall = sol[i] & b;
        if (borders[i] & b && !solWall) out.push({ x, y, dir });
        else if (borders[i] & DISABLED(b) && solWall) out.push({ x, y, dir });
      }
    }
  }
  return out;
}

// --- Game object -----------------------------------------------------------

export const palisadeGame: Game<
  PalisadeParams,
  PalisadeState,
  PalisadeMove,
  PalisadeUi,
  PalisadeDrawState,
  PalisadeMistake,
  PalisadeHint,
  PalisadeRung
> = {
  id: "palisade",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve: (orig, _curr) =>
    solveFromAnswer(answerOf(orig), (sol) => ({
      type: "solve",
      borders: Array.from(sol, (b) => (b & BORDER_MASK) | DISABLED(~b & BORDER_MASK)),
    })),
  // Easy is what the ladder finishes and the hint, which walks the same
  // ladder from the player's edges, finishes too.
  difficulty: searchTierContract<PalisadeParams, PalisadeState>({
    newState,
    deductionFinishes: (state) =>
      solveToBorders(state, state.clues) !== null && hintFinishes(palisadeGame, state),
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
  hint: palisadeHint,
  hintMarks: {
    roles: {
      ring: BORDER_RING_LEGEND,
      outline:
        'what the step reasons from, inside its squares: the clue it counts, the two clues either side of an edge, the four squares meeting at "this corner", or the two regions a join would merge.',
      stripes:
        'the one region the sentence is about: "this region", or "the same region" two edges both border.',
    },
  },
  hintRungs: PALISADE_RUNGS,
  hintKeepTrack: palisadeHintKeepTrack,
  hintGesture: (s, ui, ds, m, step) => {
    if (m.type !== "edges") throw new Error("palisade: a hint only sets edges");
    return verbClicks(
      targetVerbs,
      { executeMove, hintKeepTrack: palisadeHintKeepTrack },
      s,
      ui,
      ds,
      step,
      [borderStepEdge(m.edits)],
    );
  },

  textFormat,
  statusbarText: (s) => `Region size: ${s.k}`,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(palisadeGame);
