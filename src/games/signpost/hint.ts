/**
 * Signpost's explained hint: the compiled ladder (`solver.ts`) walked one
 * forced link at a time, and told with the reason each rival is ruled out.
 *
 * Two rungs, plainest first, the description's techniques:
 *
 * - **only next**: of the squares an arrow points at, one alone can come next;
 * - **only before**: of the arrows pointing at a square, one alone can lead in.
 *
 * A number whose arrow points at the next number is no step: the board links
 * the two itself after every move, and the walk's marks do as the board does.
 */

import {
  describedEdgeHint,
  type EdgeSpoken,
  type Fired as FiredOf,
} from "../../engine/described-edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type { CellMarks, Ladder } from "../../engine/ladder-runtime.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import * as signpost from "./signpost.compiled.ts";
import {
  deduction,
  firingOf,
  linkOf,
  linkValue,
  type SignpostFiring,
  type SignpostRung,
} from "./solver.ts";
import {
  checkCompletion,
  cloneState,
  makeLink,
  type SignpostMove,
  type SignpostState,
  updateNumbers,
} from "./state.ts";

export type { Rival, SignpostFiring, SignpostRung } from "./solver.ts";

/** How far ahead the plan is computed. */
const PLAN_CAP = 40;

/** The rungs a step can be: the description's techniques, in its order. */
export const SIGNPOST_RUNGS: readonly SignpostRung[] = signpost.ladder.map((e) => e.id);

/** What a step shows: the arrow it links from, the square it links to, the
 * line the sentence stripes and the squares it outlines. */
export interface SignpostHint {
  arrow: Point;
  target: Point;
  line: Point[];
  others: Point[];
}

/** What each technique says, as the hint's sentences read it. */
type SignpostSays = signpost.SaysById;

/** What the walk reads a firing by: the board as `executeMove` leaves it after
 * each link, and the marks. */
interface SignpostWalkContext {
  board: SignpostState;
  marks: CellMarks;
}

/** What a sentence is told of its step. */
interface SignpostMarked {
  firing: SignpostFiring;
  highlights: SignpostHint;
}

/** The link a taken firing makes, from the marks' `grid` before it. */
function firingBefore(
  state: SignpostState,
  kind: SignpostRung,
  facts: readonly number[],
  grid: ArrayLike<number>,
): SignpostFiring {
  const from = facts[1];
  return firingOf(kind, state, grid, from, linkOf(state, from, facts[2]));
}

/** The squares a link's premise reads, which a walk continues from: the two
 * it joins, and the squares it ruled out. */
const readsOf = (f: SignpostFiring): number[] => [f.from, f.to, ...f.line, ...f.others];

const sentence = (_spoken: unknown, { firing, highlights }: SignpostMarked): Sentence =>
  say.firing(firing, highlights);

const sentences: {
  [K in keyof SignpostSays]: (
    spoken: EdgeSpoken<SignpostSays[K]>,
    marked: SignpostMarked,
  ) => Sentence;
} = { onlyNext: sentence, onlyBefore: sentence };

/** A firing's step: its link, drawn on the walk's board as `executeMove` does,
 * with the numbers it settles and the links between consecutive numbers the
 * board then makes itself. Marks without those plan a step for a link the
 * player already has. */
function stepOf(
  fired: FiredOf<SignpostSays[keyof SignpostSays], SignpostWalkContext>,
  state: SignpostState,
): { move: SignpostMove; highlights: SignpostHint; marked: SignpostMarked }[] {
  const { taken, ctx, marks: m } = fired;
  const { board } = ctx;
  const before = Uint8Array.from(m.grid);
  for (let i = 0; i < taken.facts.length; i += 3) before[taken.facts[i + 1]] = 0;
  const f = firingBefore(state, taken.entry.id as SignpostRung, taken.facts, before);
  makeLink(board, f.from, f.to);
  updateNumbers(board);
  checkCompletion(board, true);
  for (let i = 0; i < board.n; i++)
    if (board.next[i] >= 0 && m.grid[i] === 0)
      m.place(i, linkValue(board, i, board.next[i]));

  const { w } = state;
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const highlights: SignpostHint = {
    arrow: at(f.from),
    target: at(f.to),
    // A line of one square is the target alone: nothing to stripe.
    line: f.line.length > 1 ? f.line.map(at) : [],
    others: f.others.map(at),
  };
  return [
    {
      move: {
        type: "link",
        fromX: highlights.arrow.x,
        fromY: highlights.arrow.y,
        toX: highlights.target.x,
        toY: highlights.target.y,
      },
      highlights,
      marked: { firing: f, highlights },
    },
  ];
}

/** The ladder over the player's links, or nothing where a link is one no
 * square may hold. */
function signpostWalk(state: SignpostState): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: SignpostWalkContext;
} | null {
  const d = deduction(state);
  if (d === null) return null;
  return {
    marks: d.m,
    entries: d.ladder.entries,
    ctx: { board: cloneState(state), marks: d.m },
  };
}

/**
 * The plan from the player's own links as far as forced links go, a step per
 * link. Refuses only when no link is forced, which on an Unreasonable board
 * is before the end.
 */
export const signpostHint = describedEdgeHint<
  SignpostState,
  SignpostMove,
  SignpostHint,
  SignpostMarked,
  SignpostWalkContext,
  SignpostSays,
  SignpostRung
>({
  name: "signpost hint",
  walk: signpostWalk,
  tiers: { lowest: () => 0, count: 1 },
  plan: PLAN_CAP,
  reads: (taken, ctx) =>
    readsOf(
      firingBefore(
        ctx.board,
        taken.entry.id as SignpostRung,
        taken.facts,
        ctx.marks.grid,
      ),
    ),
  writes: (taken, ctx) => {
    const f = firingBefore(
      ctx.board,
      taken.entry.id as SignpostRung,
      taken.facts,
      ctx.marks.grid,
    );
    return [f.from, f.to];
  },
  step: stepOf,
  say: sentences,
});

/** The step's link, made by the player, completes it; any other move goes
 * its own way. A drag from either end makes the same move. */
export function signpostKeepTrack(
  m: SignpostMove,
  step: HintStep<SignpostMove, SignpostHint>,
): HintTrackVerdict {
  const h = step.highlights;
  if (m.type !== "link" || !h) return "off";
  return m.fromX === h.arrow.x &&
    m.fromY === h.arrow.y &&
    m.toX === h.target.x &&
    m.toY === h.target.y
    ? "completed"
    : "off";
}
