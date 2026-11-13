/**
 * Path's explained hint: the compiled ladder walked one firing at a time from
 * the player's own lines and crosses (`pathWalk`), and each firing turned
 * into a step (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a number, a line or a cross on the board: the
 * ladder reads nothing else. The lines a Check tries are drawn thin where its
 * words outline them, and never played.
 *
 * A Check's firing says which lines it tried; what they break, which its
 * words name (a loop, two numbers, a square left short), is read here off
 * the board with those lines drawn ({@link clashOf}), in the order a player
 * looks: what the lines join first, then the squares round them.
 * `path-hint.test.ts` holds every Check a walk takes to finding one.
 */

import {
  describedEdgeHint,
  type EdgeSpoken,
  type Fired as FiredOf,
} from "../../engine/described-edge-hint.ts";
import { type ShapedEdge, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { CROSS, LINE, OPEN } from "../../engine/line-drawing.ts";
import {
  across,
  pieceThrough,
  type SquareEdges,
  squareEdges,
} from "../../engine/square-edges.ts";
import type { Point } from "../../engine/types.ts";
import { type Clash, type Square, say, type Why } from "./hint-text.ts";
import {
  type PathFiring,
  type PathRung,
  type PathSays,
  type PathWalkContext,
  pathWalk,
} from "./solver.ts";
import {
  DIFF_TRICKY,
  executeMove,
  MODE_PATH,
  NO_END,
  type PathMove,
  type PathPuzzle,
  type PathState,
} from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 40;

/** The edges a step tries lines on, as the board draws them. */
export interface PathHighlights {
  tried: readonly ShapedEdge[];
}

// --- what tried lines break --------------------------------------------------

/** What lines tried on the board break at once, before it is put in words:
 * a square crowded or left short, or a line that closes a loop or joins two
 * numbers that may not meet. */
type TrialClash =
  | { kind: "crowded" | "stuck"; cell: number }
  | { kind: "closed" | "joined"; edge: number };

/** The board `edges` as a player reads it: its pieces of line, and which
 * edges may still take one. */
class Reading {
  readonly g: SquareEdges;
  constructor(
    readonly puzzle: PathPuzzle,
    readonly edges: Uint8Array,
  ) {
    this.g = squareEdges(puzzle.w, puzzle.h);
  }

  lines(i: number): number {
    let n = 0;
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.edges[e] === LINE) n++;
    }
    return n;
  }

  spare(i: number): boolean {
    return this.lines(i) < this.puzzle.takes[i];
  }

  piece(i: number): number[] {
    return pieceThrough(this.g, (e) => this.edges[e] === LINE, i);
  }

  /** The number nearest square `i` along its piece, where `i` is one of its
   * ends, or {@link NO_END}: the line walked from `i` to its first number. */
  near(i: number): number {
    let at = i;
    let from = -1;
    for (;;) {
      if (this.puzzle.ends[at] !== NO_END) return this.puzzle.ends[at];
      let next = -1;
      for (let k = 0; k < 4 && next < 0; k++) {
        const e = this.g.around[at * 4 + k];
        if (e < 0 || this.edges[e] !== LINE) continue;
        const j = across(this.g, e, at);
        if (j !== from) next = j;
      }
      if (next < 0 || next === i) return NO_END;
      from = at;
      at = next;
    }
  }

  /** Whether numbers `p` and `q` may be joined, either being {@link NO_END}. */
  fits(p: number, q: number): boolean {
    if (p === NO_END || q === NO_END) return true;
    return this.puzzle.mode === MODE_PATH ? Math.abs(p - q) === 1 : p === q;
  }

  /** Whether a line could still go on edge `e`, as the ladder's `live`. */
  live(e: number): boolean {
    const [i, j] = [this.g.a[e], this.g.b[e]];
    if (this.edges[e] !== OPEN || !this.spare(i) || !this.spare(j)) return false;
    if (this.piece(i).includes(j)) return this.puzzle.mode !== MODE_PATH;
    return this.fits(this.near(i), this.near(j));
  }

  liveAt(i: number): number[] {
    const out: number[] = [];
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.live(e)) out.push(e);
    }
    return out;
  }
}

/**
 * What lines on `tried` would break on `edges` at once, or `null`. A loop
 * or a join first, line by line, as each is laid: it is on the board as
 * drawn, where a square short of ways is a count the player makes. Then the
 * squares the lines can reach, in reading order: their own, the two ends of
 * the piece they make, and those beside any of them.
 */
function clashOf(
  puzzle: PathPuzzle,
  edges: Uint8Array,
  tried: readonly number[],
): TrialClash | null {
  const trial = new Reading(puzzle, edges.slice());
  const { g } = trial;
  for (const e of tried) {
    const [u, v] = [g.a[e], g.b[e]];
    if (trial.piece(u).includes(v)) return { kind: "closed", edge: e };
    if (!trial.fits(trial.near(u), trial.near(v))) return { kind: "joined", edge: e };
    trial.edges[e] = LINE;
  }
  const near = new Set<number>();
  for (const e of tried) {
    const piece = trial.piece(g.a[e]);
    const ends = piece.filter((i) => trial.lines(i) < 2 || piece.length === 1);
    for (const i of [g.a[e], g.b[e], ...ends]) {
      near.add(i);
      for (let k = 0; k < 4; k++) {
        const f = g.around[i * 4 + k];
        if (f >= 0) near.add(across(g, f, i));
      }
    }
  }
  for (const i of [...near].sort((x, y) => x - y)) {
    const lines = trial.lines(i);
    const need = puzzle.takes[i];
    if (lines > need) return { kind: "crowded", cell: i };
    if (lines < need && lines + trial.liveAt(i).length < need)
      return { kind: "stuck", cell: i };
  }
  return null;
}

// --- the words ---------------------------------------------------------------

/** The words for one firing on `state` with `edges` as the ladder had them
 * when it fired. */
function wordsOf(state: PathState, edges: Uint8Array, firing: PathFiring): Sentence {
  const { w, ends } = state;
  const at = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const square = (i: number): Square => ({
    at: at(i),
    number: ends[i] === NO_END ? null : ends[i],
  });
  const clash = (tried: readonly number[]): Clash => {
    const found = clashOf(state, edges, tried);
    if (found === null) throw new Error(`path: lines on ${tried} break nothing`);
    return clashWords(state, edges, tried, found, square);
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
    case "lineBreaks":
      return say.lineBreaks(firing.edges[0], clash(reason.tried));
    case "pairBreaks":
      return say.pairBreaks(reason.tried, firing.edges[0], clash(reason.tried));
    case "weighed": {
      const whys = reason.ruledOut.map((tried) => whyOf(clash(tried)));
      const s = square(reason.cell);
      if (firing.mark === CROSS) return say.weighedCross(s, firing.edges[0], whys);
      if (firing.edges.length > 1) return say.weighedPair(s, firing.edges, whys);
      // The pairs ruled out are every pair of the square's other three edges.
      const others = new Set(reason.ruledOut.flat());
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

/** A clash in the terms its words need, read off the board with the lines
 * on `tried` drawn. */
function clashWords(
  state: PathState,
  edges: Uint8Array,
  tried: readonly number[],
  clash: TrialClash,
  square: (i: number) => Square,
): Clash {
  const trial = new Reading(state, edges.slice());
  const { g } = trial;
  for (const e of tried) trial.edges[e] = LINE;
  switch (clash.kind) {
    case "crowded":
      return {
        kind: "crowded",
        square: square(clash.cell),
        lines: trial.lines(clash.cell),
      };
    case "stuck": {
      const ways = trial.lines(clash.cell) + trial.liveAt(clash.cell).length;
      return { kind: "stuck", square: square(clash.cell), ways };
    }
    case "closed":
      return {
        kind: "closed",
        squares: trial.piece(g.a[clash.edge]).map((i) => square(i).at),
      };
    case "joined": {
      // The two sides of the joining edge, each before it was laid: the
      // numbered square nearest each end of it.
      trial.edges[clash.edge] = CROSS;
      const numberOn = (i: number): Square => {
        const n = trial.near(i);
        const found = trial.piece(i).find((j) => state.ends[j] === n);
        return square(found ?? i);
      };
      const [a, b] = [numberOn(g.a[clash.edge]), numberOn(g.b[clash.edge])];
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
    case "lineBreaks":
    case "pairBreaks":
      return reason.tried;
    case "weighed":
      return reason.ruledOut.flat();
  }
}

/** What a firing's sentence is told besides the technique's terms: the firing
 * as the game reads it, and the edges as they stood when it fired. */
interface Fired {
  firing: PathFiring;
  before: Uint8Array;
}

/** Every technique's sentence is the one `wordsOf` says for its reason. */
const sentence = (_spoken: unknown, { firing, before }: Fired, state: PathState) =>
  wordsOf(state, before, firing);

const sentences: {
  [K in keyof PathSays]: (
    spoken: EdgeSpoken<PathSays[K]>,
    marked: Fired,
    state: PathState,
  ) => Sentence;
} = {
  forced: sentence,
  lineBreaks: sentence,
  pairBreaks: sentence,
  weighed: sentence,
};

/** A firing's step: the lines or crosses it makes, and the lines it tries. */
function stepOf(
  fired: FiredOf<PathSays[keyof PathSays], PathWalkContext>,
): { move: PathMove; highlights: PathHighlights; marked: Fired }[] {
  const firing = fired.ctx.firing(fired.taken);
  // Every edge a firing sets was open before it.
  const before = fired.ctx.edges();
  for (const e of firing.edges) before[e] = OPEN;
  return [
    {
      move: {
        kind: "edges",
        changes: firing.edges.map((edge) => ({ edge, mark: firing.mark })),
      },
      highlights: {
        tried: [...new Set(triedOf(firing))].map((edge) => ({ edge, mark: LINE })),
      },
      marked: { firing, before },
    },
  ];
}

/** The plan from the player's lines and crosses. */
export const pathHint = describedEdgeHint<
  PathState,
  PathMove,
  PathHighlights,
  Fired,
  PathWalkContext,
  PathSays,
  PathRung
>({
  name: "path hint",
  walk: (state) => pathWalk(state),
  // The whole ladder, from the Easy rung up.
  tiers: { lowest: () => DIFF_TRICKY, count: DIFF_TRICKY + 1 },
  done: (_marks, ctx) => ctx.complete(),
  plan: PLAN_CAP,
  reads: (taken, ctx) => ctx.reads(taken),
  writes: (taken, ctx) => ctx.writes(taken),
  step: (fired) => stepOf(fired),
  say: sentences,
});

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
