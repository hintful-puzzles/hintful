/**
 * Mosaic (upstream's `mosaic.c`, Fill-a-Pix): numeric clues count the
 * shaded cells of their 3×3 neighborhood (itself included); mark every
 * cell shaded or clear. Click toggles unmarked→shaded→clear→unmarked
 * (right-click cycles the other way); a drag on from the press gives its
 * result to every cell it passes that held what the pressed one held.
 */

import { searchTierContract, solveFromAnswer } from "../../engine/answer-search.ts";
import type { Game, UiUpdate } from "../../engine/game.ts";
import { hintFinishes } from "../../engine/hint-finishes.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { SHADED_NAME, UNSHADED_NAME } from "../../engine/piece.ts";
import { cursorDelta, newCursor, stripModifiers } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import {
  MOSAIC_RUNGS,
  type MosaicHint,
  type MosaicRung,
  mosaicHint,
  mosaicKeepTrack,
} from "./hint.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  type MosaicDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  encodeSolution,
  findMistakes,
  newDesc,
  solveGameActual,
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
  newState,
  paramConfig,
  presets,
  STATE_MARK_MASK,
  status,
  statusbarText,
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
  secondary: {
    does: `turn it ${UNSHADED_NAME}, then ${SHADED_NAME}, then empty again`,
    apply: toggle(true),
  },
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
  presets,
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
  // Easy is what the one rule finishes and the hint, which reads the same
  // rule off the player's marks, finishes too.
  difficulty: searchTierContract<MosaicParams, MosaicState>({
    newState,
    deductionFinishes: (state) =>
      solveGameActual(state.board) !== null && hintFinishes(mosaicGame, state),
    answerOf,
  }),

  findMistakes,

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
        "the number the step reasons from and its block: the number's own square and the eight around it.",
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
  solvedFlash: () => FLASH_TIME,
};

registerGame(mosaicGame);
