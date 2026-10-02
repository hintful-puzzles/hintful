/**
 * Palisade — native TS port of `palisade.c` (Nikoli's "Five Cells").
 * Numeric clues count the walls around a cell; the player draws walls
 * so the grid divides into connected regions of exactly `k` cells, each
 * clue equal to its cell's wall count.
 *
 * Input picks the edge nearest the click (left toggles wall, right toggles
 * no-wall mark), and there is a half-grid keyboard cursor.
 */

import {
  BORDER,
  BORDER_MASK,
  borderGridVerbs,
  DISABLED,
  DX,
  DY,
} from "../../engine/border-grid.ts";
import {
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
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { edgeContinuation } from "../../engine/hint-text.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { interpretTargetVerbs, verbClicks } from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  type PalisadeDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  deduceForcedEdges,
  type ForcedEdge,
  newDesc,
  solveToBorders,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  newState,
  type PalisadeHint,
  type PalisadeMistake,
  type PalisadeMove,
  type PalisadeParams,
  type PalisadeState,
  type PalisadeUi,
  paramConfig,
  presets,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: PalisadeState): PalisadeUi {
  return { cursor: newCursor(1, 1) };
}

function paramsOf(state: PalisadeState): PalisadeParams {
  return { w: state.w, h: state.h, k: state.k };
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

function findMistakes(state: PalisadeState): readonly PalisadeMistake[] {
  const sol = solveToBorders(paramsOf(state), state.clues);
  if (!sol) return [];
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

// --- hint ------------------------------------------------------------------

/** Narrate one leg of a deduction. A multi-edge firing (`equivalentEdges`
 * pair, `numberExhausted` sweep) narrates the coupling on its first leg and a
 * short continuation on the rest. The words, and why each reads as it does,
 * are [`hint-text.ts`](./hint-text.ts)'s. */
function explain(
  fe: ForcedEdge,
  clues: Int8Array,
  w: number,
  k: number,
  leg: number,
  left: readonly ForcedBorderEdge[],
  groupSize: number,
): Sentence {
  const c = clues[fe.y * w + fe.x];
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const cells = (fe.cells ?? []).map(at);
  const clue = { x: fe.x, y: fe.y };
  if (leg > 0) {
    const basis =
      fe.rule === "numberExhausted"
        ? say.basis.clue(clue, c)
        : fe.rule === "notTooSmall" || fe.rule === "equivalentEdges"
          ? say.basis.region(cells)
          : say.basis.outlined(cells, BASIS_NOUN[fe.rule]);
    return edgeContinuation(left, basis);
  }
  const multi = groupSize > 1;
  switch (fe.rule) {
    case "cluesVersusRegionSize": {
      // The clue on the other side of the edge.
      const d = clues[(fe.y + DY[fe.dir]) * w + (fe.x + DX[fe.dir])];
      return say.cluesVersusRegionSize(cells, c, d, k, left);
    }
    case "numberExhausted":
      return say.numberExhausted(clue, c, left, multi);
    case "notTooBig":
      return say.notTooBig(cells, fe.cells?.length ?? null, k, left);
    case "notTooSmall":
      return say.notTooSmall(cells, fe.cells?.length ?? null, k, left);
    case "noDanglingEdges":
      return say.noDanglingEdges(cells, left);
    case "equivalentEdges":
      return say.equivalentEdges(cells, c, left, multi);
  }
}

/** What a later leg calls the outlined squares its first leg named, for the
 * rules whose evidence is outlined. */
const BASIS_NOUN = {
  cluesVersusRegionSize: "clue",
  notTooBig: "region",
  noDanglingEdges: ["corner", "corner"],
} as const;

/** Compute the next deductions as a hint plan, seeded from the player's
 * current borders and no-wall marks. Refuses on a solved board or one
 * carrying a mistake, so a hint is never built on a wrong wall. Edges
 * forced by one firing (the `equivalentEdges` pair, a `numberExhausted`
 * sweep) form one multi-leg journey; distinct firings stay separate
 * hints. */
function hint(state: PalisadeState): HintResult<PalisadeMove, PalisadeHint> {
  const forced = deduceForcedEdges(paramsOf(state), state.clues, state.borders);
  if (forced.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };

  // Split the flat, discovery-ordered list into contiguous runs of one
  // firing (a firing's surviving edges stay contiguous after dedup), and
  // emit one journey per run.
  const steps: HintStep<PalisadeMove, PalisadeHint>[] = [];
  for (let g = 0; g < forced.length; ) {
    let end = g + 1;
    while (end < forced.length && forced[end].group === forced[g].group) end++;
    const group = forced.slice(g, end);
    const fe = group[0];
    steps.push(
      ...borderHintJourney(
        group,
        // The one region a sentence is about is striped (docs/games/hints.md
        // § "Hatch the line the sentence names"); a clue, a corner or the two
        // regions a join would merge are outlined. The words say which.
        (leg, left) =>
          explain(fe, state.clues, state.w, state.k, leg, left, group.length),
        (edits): PalisadeMove => ({ type: "edges", edits }),
      ),
    );
    g = end;
  }
  return { ok: true, steps };
}

// --- Game object -----------------------------------------------------------

function hintKeepTrack(
  m: PalisadeMove,
  step: HintStep<PalisadeMove, PalisadeHint>,
  state: PalisadeState,
): HintTrackVerdict {
  return borderHintKeepTrack(
    m.type === "edges" ? m.edits : null,
    step,
    state.w,
    state.borders,
  );
}

export const palisadeGame: Game<
  PalisadeParams,
  PalisadeState,
  PalisadeMove,
  PalisadeUi,
  PalisadeDrawState,
  PalisadeMistake,
  PalisadeHint
> = {
  id: "palisade",

  defaultParams,
  presets,
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

  solve(orig, _curr) {
    const sol = solveToBorders(paramsOf(orig), orig.clues);
    if (!sol) return { ok: false, error: PUZZLE_NOT_REASONABLE };
    const full = Array.from(sol, (b) => (b & BORDER_MASK) | DISABLED(~b & BORDER_MASK));
    return { ok: true, move: { type: "solve", borders: full } };
  },

  findMistakes,
  hint,
  hintMarks: {
    roles: {
      ring: "the edges the step decides, drawn in the hint color along the edge itself. When one reason decides several edges at once they are all marked together, because they share one fate, and each drops back to normal as you set it.",
      outline:
        'what the step reasons from, inside its squares: the clue it counts, the two clues either side of an edge, the four squares meeting at "this corner", or the two regions a join would merge.',
      stripes:
        'the one region the sentence is about: "this region", or "the same region" two edges both border.',
    },
  },
  hintKeepTrack,
  hintGesture: (s, ui, ds, m, step) => {
    if (m.type !== "edges") throw new Error("palisade: a hint only sets edges");
    return verbClicks(targetVerbs, { executeMove, hintKeepTrack }, s, ui, ds, step, [
      borderStepEdge(m.edits),
    ]);
  },

  textFormat,
  statusbarText: (s) => `Region size: ${s.k}`,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(palisadeGame);
