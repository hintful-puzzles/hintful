/**
 * Norinori: shade squares of a grid divided into regions, so that every
 * region holds exactly two shaded squares and every shaded square touches
 * exactly one other along a side: the shaded squares are dominoes, which may
 * cross from one region into another.
 *
 * This file is the `Game` object and the glue around it. The rules a square
 * obeys are in [`norinori.description.yaml`](./norinori.description.yaml),
 * and the board in [`state.ts`](./state.ts).
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { entryMistakes, gridCell } from "../../engine/entry-mistakes.ts";
import type { Game, HintStep, SolveResult } from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  ERASE_KEYS,
  interpretTargetVerbs,
  rulingOut,
  squareGrid,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newNorinoriDesc } from "./generator.ts";
import {
  type NorinoriHint,
  norinoriHint,
  norinoriKeepTrack,
  norinoriRefreshHintStep,
  norinoriRulesOut,
} from "./hint.ts";
import {
  border,
  colors,
  computeSize,
  type NorinoriDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  isComplete,
  NORINORI_RUNGS,
  type NorinoriRung,
  solveNorinori,
} from "./solver.ts";
import {
  BLANK,
  CROSSED,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  type NorinoriMark,
  type NorinoriMove,
  type NorinoriParams,
  type NorinoriState,
  type NorinoriUi,
  newState,
  paramConfig,
  SHADED,
  textFormat,
  validateParams,
} from "./state.ts";

/** A square whose mark is not the answer's. */
export interface NorinoriMistake extends Point {
  kind: "cell" | "note";
}

function newUi(_state: NorinoriState): NorinoriUi {
  return { cursor: newCursor() };
}

// --- input ------------------------------------------------------------------

type NorinoriVerb = TargetVerb<NorinoriState, NorinoriUi, Point, NorinoriMove>;

/** A verb that gives the square `to(old)`, and nothing where the square would
 * stay as it is. */
const markWith =
  (to: (old: NorinoriMark) => NorinoriMark) =>
  (s: NorinoriState, { x, y }: Point): NorinoriMove | null => {
    const index = y * s.w + x;
    const old = s.grid[index] as NorinoriMark;
    const mark = to(old);
    return mark === old ? null : { kind: "mark", cells: [{ index, mark }] };
  };

/** One click of a button: blank, then `first`, then the other mark, then
 * blank again. */
const cycle =
  (first: NorinoriMark, second: NorinoriMark) =>
  (old: NorinoriMark): NorinoriMark =>
    old === BLANK ? first : old === first ? second : BLANK;

const shade: NorinoriVerb = {
  does: "shade it (click again to cross it out, and again to clear it)",
  apply: markWith(cycle(SHADED, CROSSED)),
};
const cross: NorinoriVerb = {
  does: "cross it out (click again to shade it, and again to clear it)",
  apply: markWith(cycle(CROSSED, SHADED)),
};

const targetVerbs: TargetVerbs<
  NorinoriState,
  NorinoriUi,
  NorinoriDrawState,
  Point,
  NorinoriMove
> = {
  geometry: squareGrid({ size: (s) => s, border: (ts) => border(ts) }),
  sweep: { holds: (s, { x, y }) => s.grid[y * s.w + x] },
  primary: shade,
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

function status(s: NorinoriState): GameStatus {
  return isComplete(s) ? "solved" : "ongoing";
}

function solve(orig: NorinoriState): SolveResult<NorinoriMove> {
  const grid = answerOf(orig.w, orig.h, orig.regions);
  if (grid === null) return { ok: false, error: NO_SOLUTION };
  return { ok: true, move: { kind: "solve", grid } };
}

/** The squares marked against the answer. A blank square is never one, and
 * neither is any square of a board the ladder cannot finish, which has no
 * answer to compare with. */
function findMistakes(state: NorinoriState): readonly NorinoriMistake[] {
  const { w, h, regions, grid } = state;
  const answer = answerOf(w, h, regions);
  if (answer === null) return [];
  return entryMistakes({ answer, entry: grid }, gridCell(w));
}

const difficulty: DifficultyContract<NorinoriParams> = {
  solveAtCap: (p, desc, cap) => solveNorinori(newState(p, desc), cap),
};

// --- the hint's gesture -----------------------------------------------------

/** A click on each square the step decides, with the button that marks it
 * the way the step asks. */
function hintGesture(
  state: NorinoriState,
  ui: NorinoriUi,
  ds: NorinoriDrawState,
  move: NorinoriMove,
  step: HintStep<NorinoriMove, NorinoriHint>,
): readonly PointerAction[] {
  if (move.kind !== "mark") return [];
  const { w } = state;
  return verbClicks(
    targetVerbs,
    { executeMove, hintKeepTrack: norinoriKeepTrack },
    state,
    ui,
    ds,
    step,
    move.cells.map(({ index }) => ({ x: index % w, y: (index / w) | 0 })),
  );
}

export const norinoriGame: Game<
  NorinoriParams,
  NorinoriState,
  NorinoriMove,
  NorinoriUi,
  NorinoriDrawState,
  NorinoriMistake,
  NorinoriHint,
  NorinoriRung
> = {
  id: "norinori",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newNorinoriDesc,
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
  clearMistakes: (state, mistakes) => [
    {
      kind: "mark",
      cells: mistakes.map(({ x, y }) => ({ index: y * state.w + x, mark: BLANK })),
    },
  ],
  textFormat,
  rulesOut: norinoriRulesOut,

  hint: norinoriHint,
  hintRungs: NORINORI_RUNGS,
  hintMarks: {
    roles: {
      ring: "the squares the step decides. The sentence says what they must be.",
      stripes:
        "the region the step is about, or the open squares beside a shaded square.",
      outline:
        "what else it reasons from: shaded squares, or the squares a tried one would leave clear.",
    },
  },
  hintKeepTrack: norinoriKeepTrack,
  refreshHintStep: norinoriRefreshHintStep,
  hintGesture,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(norinoriGame);
