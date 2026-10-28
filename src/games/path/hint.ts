/**
 * Path's explained hint: the solver's rungs run one firing at a time from the
 * player's own lines and crosses, and each firing turned into a step
 * (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a number, a line or a cross on the board: the
 * ladder reads nothing else. The lines a Check tries are drawn thin where its
 * words outline them, and never played.
 */

import { type ShapedEdge, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { CROSS, LINE } from "../../engine/line-drawing.ts";
import { pieceThrough, squareEdges } from "../../engine/square-edges.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { type Clash, type Square, say, type Why } from "./hint-text.ts";
import {
  isComplete,
  PathBoard,
  type PathClash,
  type PathFiring,
  type PathRung,
  pathRecordingPass,
} from "./solver.ts";
import {
  executeMove,
  MODE_PATH,
  NO_END,
  type PathMove,
  type PathState,
} from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

/** The edges a step tries lines on, as the board draws them. */
export interface PathHighlights {
  tried: readonly ShapedEdge[];
}

type PathStep = HintStep<PathMove, PathHighlights, PathRung>;

/** The squares of the piece of line through square `from` on `edges`. */
function pieceOf(state: PathState, edges: Uint8Array, from: number): number[] {
  return pieceThrough(squareEdges(state.w, state.h), (e) => edges[e] === LINE, from);
}

/** The words for one firing on `state` with `edges` as the ladder had them
 * when it fired. */
function wordsOf(state: PathState, edges: Uint8Array, firing: PathFiring): Sentence {
  const { w, ends } = state;
  const at = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const square = (i: number): Square => ({
    at: at(i),
    number: ends[i] === NO_END ? null : ends[i],
  });
  /** The numbered square nearest `i` along its piece, where `i` is an end of
   * it. */
  const numberOn = (i: number, lines: Uint8Array): Square => {
    const near = new PathBoard(state, lines).pieces().nearAt(i);
    const found = pieceOf(state, lines, i).find((j) => ends[j] === near);
    return square(found ?? i);
  };
  const { reason } = firing;
  switch (reason.kind) {
    case "forced":
      return say.forced(
        square(reason.cell),
        state.takes[reason.cell],
        reason.need,
        firing.edges,
      );
    case "breaks": {
      // The board with the lines tried, for what breaks there.
      const trial = edges.slice();
      for (const e of reason.tried) trial[e] = LINE;
      const clash = clashWords(state, trial, reason.clash, square, numberOn);
      return reason.cell === null
        ? say.lineBreaks(firing.edges[0], clash)
        : say.pairBreaks(reason.tried, firing.edges[0], clash);
    }
    case "weighed": {
      const whys = reason.ruledOut.map(({ tried, clash }) => {
        const trial = edges.slice();
        for (const e of tried) trial[e] = LINE;
        return whyOf(clashWords(state, trial, clash, square, numberOn));
      });
      const s = square(reason.cell);
      if (firing.mark === CROSS) return say.weighedCross(s, firing.edges[0], whys);
      if (firing.edges.length > 1) return say.weighedPair(s, firing.edges, whys);
      // The pairs ruled out are every pair of the square's other three edges.
      const others = new Set(reason.ruledOut.flatMap(({ tried }) => tried));
      return say.weighedLine([...others], firing.edges[0], whys);
    }
  }
}

/** A ruled-out way's clash as a weighed step says it, without the squares
 * it outlines: a step weighs several ways, too many to outline each break. */
function whyOf(clash: Clash): Why {
  if (clash.kind !== "stuck") return clash.kind;
  return clash.ways > 0 ? "dead-end" : "cut-off";
}

function clashWords(
  state: PathState,
  trial: Uint8Array,
  clash: PathClash,
  square: (i: number) => Square,
  numberOn: (i: number, lines: Uint8Array) => Square,
): Clash {
  const g = squareEdges(state.w, state.h);
  switch (clash.kind) {
    case "crowded": {
      let lines = 0;
      for (let k = 0; k < 4; k++) {
        const e = g.around[clash.cell * 4 + k];
        if (e >= 0 && trial[e] === LINE) lines++;
      }
      return { kind: "crowded", square: square(clash.cell), lines };
    }
    case "stuck": {
      const b = new PathBoard(state, trial);
      const ways = b.edgesAt(clash.cell, LINE).length + b.liveAt(clash.cell).length;
      return { kind: "stuck", square: square(clash.cell), ways };
    }
    case "closed":
      return {
        kind: "closed",
        squares: pieceOf(state, trial, g.a[clash.edge]).map((i) => square(i).at),
      };
    case "joined": {
      // The two sides of the joining edge, each before it was laid.
      const before = trial.slice();
      before[clash.edge] = CROSS;
      const [a, b] = [
        numberOn(g.a[clash.edge], before),
        numberOn(g.b[clash.edge], before),
      ];
      // "The 3 to the 7": a Path line runs up its numbers, so the lower first.
      const swap = state.mode === MODE_PATH && (a.number ?? 0) > (b.number ?? 0);
      return { kind: "joined", a: swap ? b : a, b: swap ? a : b };
    }
  }
}

/** The edges a firing tries lines on, which its step draws thin as lines
 * where its words outline them. */
function triedOf(firing: PathFiring): number[] {
  const { reason } = firing;
  switch (reason.kind) {
    case "forced":
      return [];
    case "breaks":
      return reason.tried;
    case "weighed":
      return reason.ruledOut.flatMap(({ tried }) => tried);
  }
}

function stepOf(state: PathState, edges: Uint8Array, firing: PathFiring): PathStep {
  const words = wordsOf(state, edges, firing);
  return {
    move: {
      kind: "edges",
      changes: firing.edges.map((edge) => ({ edge, mark: firing.mark })),
    },
    rung: firing.reason.kind,
    explanation: words.text,
    words,
    highlights: {
      tried: [...new Set(triedOf(firing))].map((edge) => ({ edge, mark: LINE })),
    },
  };
}

/**
 * The plan from the player's lines and crosses. No tier cap: a board that
 * arrives by its ID carries no tier, and the ladder tries the Easy rung
 * first, which is the order a hint wants anyway.
 */
export function pathHint(
  state: PathState,
): HintResult<PathMove, PathHighlights, PathRung> {
  const board = new PathBoard(state, state.edges.slice());
  const pass = pathRecordingPass(board, stepBudget("path hint"));
  // Each firing is narrated against the edges as they stood when it fired.
  const before: Uint8Array[] = [];
  const { plan } = deduceHintPlan<PathBoard, PathFiring, "open" | "done">({
    board,
    status: (b) => (isComplete(state, b.edges) ? "done" : "open"),
    incomplete: "open",
    next: () => {
      const edges = board.edges.slice();
      const firing = pass.next();
      if (firing) before.push(edges);
      return firing;
    },
    planCap: PLAN_CAP,
  });
  // The mistake check vouches for every line and cross, so a contradiction
  // here means the board itself has no answer.
  if (pass.impossible()) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.map((firing, k) => stepOf(state, before[k], firing)) };
}

/** Judge a move against the step on show by what it did to the edges, which
 * a solve never makes a step of. */
export function pathKeepTrack(
  move: PathMove,
  step: HintStep<PathMove>,
  state: PathState,
): HintTrackVerdict {
  if (move.kind !== "edges" || step.move.kind !== "edges") return "off";
  return trackEdgeStep(
    step,
    step.move.changes,
    state.edges,
    executeMove(state, move).edges,
    (changes): PathMove => ({ kind: "edges", changes }),
  );
}
