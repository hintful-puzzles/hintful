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

import {
  BORDER,
  BORDER_MASK,
  borderGridVerbs,
  DISABLED,
} from "../../engine/border-grid.ts";
import {
  type BorderHint,
  borderHintJourney,
  borderHintKeepTrack,
  borderStepEdge,
  type ForcedBorderEdge,
} from "../../engine/border-grid-hint.ts";
import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
  UiUpdate,
} from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { edgeContinuation } from "../../engine/hint-text.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { interpretTargetVerbs, verbClicks } from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newSeparateDesc } from "./generator.ts";
import { say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SeparateDrawState,
} from "./render.ts";
import {
  type SeparateFiring,
  type SolverScratch,
  separateRecordingPass,
  solveToBorders,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  isSolved,
  newState,
  paramConfig,
  presets,
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

function paramsOf(state: SeparateState): SeparateParams {
  return { w: state.w, h: state.h, k: state.k };
}

// --- input -----------------------------------------------------------------

const targetVerbs = borderGridVerbs<
  SeparateState,
  SeparateUi,
  SeparateDrawState,
  SeparateMove
>((edits) => ({ type: "edges", edits }));

function interpretMove(
  state: SeparateState,
  ui: SeparateUi,
  ds: SeparateDrawState,
  p: Point,
  rawButton: number,
): SeparateMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

// --- mistakes --------------------------------------------------------------

function findMistakes(state: SeparateState): readonly SeparateMistake[] {
  const sol = solveToBorders(paramsOf(state), state.letters);
  if (!sol) return [];
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

// --- hint ------------------------------------------------------------------

/** The first leg's sentence for a firing; later legs continue it. The words
 * are [`hint-text.ts`](./hint-text.ts)'s. */
function explain(
  f: SeparateFiring,
  letters: Uint8Array,
  w: number,
  k: number,
  leg: number,
  left: readonly ForcedBorderEdge[],
): Sentence {
  const at = (sqs: readonly number[]): Point[] =>
    sqs.map((i) => ({ x: i % w, y: Math.floor(i / w) }));
  const { striped, outlined } = evidence(f);
  if (leg > 0) {
    const letter = f.kind === "sharedLetter" ? f.letter : 0;
    return edgeContinuation(left, say.basis(at(striped), at(outlined), letter));
  }
  switch (f.kind) {
    case "sharedLetter":
      return say.sharedLetter(f.letter, at(striped), at(outlined), left);
    case "walledApart":
      return say.walledApart(at(striped), at(outlined), left);
    case "onlyWay":
      return say.onlyWay(at(f.region), k, letters[f.region[0]], left);
  }
}

/**
 * Which of a firing's regions the sentence stripes and which it outlines. Of
 * two, the first is striped unless it is the lone square of a mixed pair, which
 * the sentence names by its letter and so wants outlined; two lone squares are
 * both just letters, and both outlined.
 */
function evidence(f: SeparateFiring): { striped: number[]; outlined: number[] } {
  switch (f.kind) {
    case "sharedLetter": {
      if (f.a.length === 1 && f.b.length === 1)
        return { striped: [], outlined: [...f.a, ...f.b] };
      return f.a.length === 1 && f.b.length > 1
        ? { striped: f.b, outlined: f.a }
        : { striped: f.a, outlined: f.b };
    }
    case "walledApart":
      return { striped: f.a, outlined: f.b };
    case "onlyWay":
      return { striped: f.region, outlined: [] };
  }
}

/** The hint's rungs: the kinds of the solver's firings. */
export const SEPARATE_RUNGS = ["sharedLetter", "walledApart", "onlyWay"] as const;
export type SeparateRung = (typeof SEPARATE_RUNGS)[number];

/**
 * The deduction from the player's own marks to the end, as one journey per
 * firing. Refuses on a solved board or one carrying a mistake, so no firing is
 * built on a wrong edge, and on a board the solver cannot finish from empty,
 * whose marks nothing can vouch for.
 */
function hint(
  state: SeparateState,
): HintResult<SeparateMove, BorderHint, SeparateRung> {
  const p = paramsOf(state);
  if (!solveToBorders(p, state.letters))
    return { ok: false, error: PUZZLE_NOT_REASONABLE };

  const { scratch, next } = separateRecordingPass(
    p,
    state.letters,
    state.borders,
    stepBudget("separate hint"),
  );
  const { plan } = deduceHintPlan<SolverScratch, SeparateFiring, boolean>({
    board: scratch,
    status: (sc) => isSolved(sc.w, sc.h, sc.k, state.letters, sc.borders),
    incomplete: false,
    next: () => next(),
    // Every firing sets an edge when the player's marks were seeded whole; one
    // that set none restates the board and has nothing to show.
    showable: (_, f) => f.edges.length > 0,
  });
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };

  const steps = plan.flatMap((f) =>
    borderHintJourney<SeparateMove, SeparateRung>(
      f.kind,
      f.edges,
      (leg, left) => explain(f, state.letters, state.w, state.k, leg, left),
      (edits): SeparateMove => ({ type: "edges", edits }),
    ),
  );
  return { ok: true, steps };
}

function hintKeepTrack(
  m: SeparateMove,
  step: HintStep<SeparateMove, BorderHint>,
  state: SeparateState,
): HintTrackVerdict {
  return borderHintKeepTrack(
    m.type === "edges" ? m.edits : null,
    step,
    state.w,
    state.borders,
  );
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
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSeparateDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve(orig, _curr) {
    const sol = solveToBorders(paramsOf(orig), orig.letters);
    if (!sol) return { ok: false, error: PUZZLE_NOT_REASONABLE };
    const full = Array.from(sol, (b) => (b & BORDER_MASK) | DISABLED(~b & BORDER_MASK));
    return { ok: true, move: { type: "solve", borders: full } };
  },

  findMistakes,
  hint,
  hintMarks: {
    roles: {
      ring: 'the edges the step decides, drawn in the hint color along the edge itself: a wall, or a mark saying "no wall here". When one reason decides several edges at once they are all marked together.',
      outline:
        "a second region the step reasons from, or a lone square it names by its letter.",
      stripes: "the region the sentence is about.",
    },
  },
  hintRungs: SEPARATE_RUNGS,
  hintKeepTrack,
  hintGesture: (s, ui, ds, m, step) => {
    if (m.type !== "edges") throw new Error("separate: a hint only sets edges");
    return verbClicks(targetVerbs, { executeMove, hintKeepTrack }, s, ui, ds, step, [
      borderStepEdge(m.edits),
    ]);
  },

  textFormat,
  statusbarText: (s) => `${s.k} letters per region`,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(separateGame);
