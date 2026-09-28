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
  DISABLED,
  interpretBorderGridInput,
} from "../../engine/border-grid.ts";
import {
  type BorderHint,
  type BorderHintEvidence,
  borderHintJourney,
  borderHintKeepTrack,
} from "../../engine/border-grid-hint.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type HintResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  commonHintRefusal,
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { edgeContinuation } from "../../engine/hint-text.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor, stripModifiers } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { ConfigValues, Point } from "../../engine/types.ts";
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
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: SeparateState): SeparateUi {
  return { cursor: newCursor(1, 1) };
}

function paramsOf(state: SeparateState): SeparateParams {
  return { w: state.w, h: state.h, k: state.k };
}

// --- input -----------------------------------------------------------------

function interpretMove(
  state: SeparateState,
  ui: SeparateUi,
  ds: SeparateDrawState,
  p: Point,
  rawButton: number,
): SeparateMove | null | UiUpdate {
  const r = interpretBorderGridInput(
    state,
    ui,
    p,
    stripModifiers(rawButton),
    ds.tileSize,
  );
  if (r === null) return null;
  return r === "ui" ? UI_UPDATE : { type: "edges", edits: r };
}

// --- flash -----------------------------------------------------------------

function flashLength(
  oldState: SeparateState,
  newState_: SeparateState,
  _dir: number,
  _ui: SeparateUi,
): number {
  return winFlash(oldState, newState_, FLASH_TIME);
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
  k: number,
  leg: number,
): string {
  if (leg > 0) return edgeContinuation(f.edges[leg].kind);
  const multi = f.edges.length > 1;
  switch (f.kind) {
    case "sharedLetter": {
      const [hatched, outlined] = hatchedFirst(f.a, f.b);
      return say.sharedLetter(f.letter, hatched.length, outlined.length, multi);
    }
    case "walledApart":
      return say.walledApart(multi);
    case "onlyWay":
      return say.onlyWay(f.region.length, k, letters[f.region[0]]);
  }
}

/** Which of a firing's two regions is hatched and which outlined: the first,
 * unless it is the lone square of a mixed pair, which the sentence names by
 * its letter and so wants outlined. */
function hatchedFirst(a: number[], b: number[]): [number[], number[]] {
  return a.length === 1 && b.length > 1 ? [b, a] : [a, b];
}

/** The squares a firing's sentence cites, as the border grid marks them. */
function evidence(f: SeparateFiring): BorderHintEvidence {
  switch (f.kind) {
    case "sharedLetter": {
      // Two lone squares are both just letters: outline both.
      if (f.a.length === 1 && f.b.length === 1) return { cells: [...f.a, ...f.b] };
      const [hatch, cells] = hatchedFirst(f.a, f.b);
      return { hatch, cells };
    }
    case "walledApart":
      return { hatch: f.a, cells: f.b };
    case "onlyWay":
      return { hatch: f.region };
  }
}

/**
 * The deduction from the player's own marks to the end, as one journey per
 * firing. Refuses on a solved board or one carrying a mistake, so no firing is
 * built on a wrong edge, and on a board the solver cannot finish from empty,
 * whose marks nothing can vouch for.
 */
function hint(state: SeparateState): HintResult<SeparateMove, BorderHint> {
  const refusal = commonHintRefusal(state.completed, findMistakes(state).length);
  if (refusal) return refusal;
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
    borderHintJourney(
      state.w,
      f.edges,
      (leg) => explain(f, state.letters, state.k, leg),
      evidence(f),
      (edits): SeparateMove => ({ type: "edges", edits }),
    ),
  );
  return { ok: true, steps };
}

// --- Game object -----------------------------------------------------------

export const separateGame: Game<
  SeparateParams,
  SeparateState,
  SeparateMove,
  SeparateUi,
  SeparateDrawState,
  SeparateMistake
> = {
  id: "separate",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,
  describeParams: (p): ConfigValues => ({
    width: String(p.w),
    height: String(p.h),
    letters: String(p.k),
  }),

  newDesc: newSeparateDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve(orig, _curr) {
    const sol = solveToBorders(paramsOf(orig), orig.letters);
    if (!sol) return { ok: false, error: "Sorry, I can't solve this puzzle" };
    const full = Array.from(sol, (b) => (b & BORDER_MASK) | DISABLED(~b & BORDER_MASK));
    return { ok: true, move: { type: "solve", borders: full } };
  },

  findMistakes,
  hint,
  hintKeepTrack: (m, step, state) =>
    borderHintKeepTrack(
      m.type === "edges" ? m.edits : null,
      step,
      state.w,
      state.borders,
    ),

  textFormat,
  statusbarText: (s) => `${s.k} letters per region`,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
};

registerGame(separateGame);
