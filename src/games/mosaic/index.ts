/**
 * Mosaic (upstream's `mosaic.c`, Fill-a-Pix): numeric clues count the
 * shaded cells of their 3×3 neighborhood (itself included); mark every
 * cell shaded or clear. Click toggles unmarked→shaded→clear→unmarked
 * (right-click cycles the other way); a drag on from the press gives its
 * result to every cell it passes that held what the pressed one held.
 */

import { solveFromAnswer } from "../../engine/answer-search.ts";
import type { Game, UiUpdate } from "../../engine/game.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { SHADED_NAME, UNSHADED_NAME } from "../../engine/piece.ts";
import { cursorDelta, newCursor, stripModifiers } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  rulingOut,
  squareGrid,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { type MosaicHint, mosaicHint, mosaicKeepTrack } from "./hint.ts";
import {
  colors,
  computeSize,
  type MosaicDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  deductionTier,
  encodeSolution,
  findMistakes,
  MOSAIC_RUNGS,
  type MosaicRung,
  newDesc,
  status,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  type MosaicMistake,
  type MosaicMove,
  type MosaicParams,
  type MosaicState,
  type MosaicUi,
  menu,
  newState,
  paramConfig,
  STATE_BLANK,
  STATE_MARK_MASK,
  STATE_MARKED,
  STATE_UNMARKED,
  statusbarText,
  TIERS,
  textFormat,
  validateParams,
} from "./state.ts";

// --- input -------------------------------------------------------------

function newUi(_state: MosaicState): MosaicUi {
  return { cursor: newCursor() };
}

/** A verb that cycles the square one way: `double` is the right button's
 * way round, two steps forward in a cycle of three. */
const toggle =
  (double: boolean) =>
  (_s: MosaicState, { x, y }: Point): MosaicMove => ({ type: "toggle", x, y, double });

const targetVerbs: TargetVerbs<
  MosaicState,
  MosaicUi,
  MosaicDrawState,
  Point,
  MosaicMove
> = {
  geometry: squareGrid({
    size: (s) => ({ w: s.width, h: s.height }),
    border: (ts) => Math.floor(ts / 2),
  }),
  primary: {
    does: `turn it ${SHADED_NAME}, then ${UNSHADED_NAME}, then empty again`,
    apply: toggle(false),
  },
  secondary: rulingOut({
    does: `turn it ${UNSHADED_NAME}, then ${SHADED_NAME}, then empty again`,
    apply: toggle(true),
  }),
  sweep: {
    holds: (s, { x, y }) => s.cells[y * s.width + x] & STATE_MARK_MASK,
  },
};

function interpretMove(
  state: MosaicState,
  ui: MosaicUi,
  ds: MosaicDrawState,
  p: Point,
  button: number,
): MosaicMove | null | UiUpdate {
  const raw = stripModifiers(button);

  // After completion, only cursor browsing is accepted (upstream freeze).
  if (status(state) === "solved" && !cursorDelta(raw)) return null;

  // A press, a drag and a release are all the model's: a drag gives the
  // press's result to every square it passes that held what the pressed one
  // held, so it lays a mark or clears one.
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, raw);
}

/** Each wrong square emptied, in one move. */
function clearMistakes(
  state: MosaicState,
  mistakes: readonly MosaicMistake[],
): MosaicMove[] {
  const cells = mistakes.map(({ x, y }) => y * state.width + x);
  return cells.length === 0 ? [] : [{ type: "fill", cells, mark: STATE_UNMARKED }];
}

/** The answer's first square still empty: a shaded one while any is left,
 * before the clear ones, which are the ruling-out mark. */
function revealOne(state: MosaicState, solved: MosaicState): MosaicMove | null {
  const empty = (mark: number): number =>
    state.cells.findIndex(
      (c, i) =>
        (c & STATE_MARK_MASK) === STATE_UNMARKED &&
        (solved.cells[i] & STATE_MARK_MASK) === mark,
    );
  for (const mark of [STATE_MARKED, STATE_BLANK]) {
    const at = empty(mark);
    if (at >= 0) return { type: "fill", cells: [at], mark };
  }
  return null;
}

// --- Game object -----------------------------------------------------------

export const mosaicGame: Game<
  MosaicParams,
  MosaicState,
  MosaicMove,
  MosaicUi,
  MosaicDrawState,
  MosaicMistake,
  MosaicHint,
  MosaicRung
> = {
  id: "mosaic",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions<MosaicParams>({ w: "width", h: "height" }),
  paramConfig,

  newDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve: (orig, _curr) =>
    solveFromAnswer(answerOf(orig), (cells) => ({
      type: "solve",
      solution: encodeSolution(cells),
    })),
  // A tier below Unreasonable is what its part of the deduction finishes.
  // The hint walks the same compiled ladder from the player's marks, so it is
  // not asked as well.
  difficulty: TIERS.contract<MosaicParams, MosaicState>({
    newState,
    deductionFinishes(state, cap) {
      const tier = deductionTier(state.board);
      return tier !== null && tier <= cap;
    },
    answerOf,
  }),

  findMistakes,
  clearMistakes,
  revealOne,

  hint: mosaicHint,
  hintRungs: MOSAIC_RUNGS,
  hintKeepTrack: mosaicKeepTrack,
  // A tap on each of the step's squares: a tap cycles a filled square too,
  // where a drag would paint only empty ones.
  hintGesture: (state, ui, ds, m, step) =>
    m.type === "fill"
      ? verbClicks(
          targetVerbs,
          { executeMove, hintKeepTrack: mosaicKeepTrack },
          state,
          ui,
          ds,
          step,
          m.cells.map((i) => ({ x: i % state.width, y: Math.floor(i / state.width) })),
        )
      : [],
  hintMarks: {
    roles: {
      ring: `the squares the step decides; the sentence says whether they must be ${SHADED_NAME} or ${UNSHADED_NAME}.`,
      outline:
        "the block of each number the step reasons from: the number's own square and the eight around it. The number itself is circled.",
    },
  },

  textFormat,
  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(mosaicGame);
