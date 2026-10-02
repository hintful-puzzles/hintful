/**
 * Black Box's hint: what the fired lasers prove about the box, and what to fire
 * when they prove nothing more.
 *
 * It reads only what the player can see, the lasers fired and where they went
 * and the marks on the box, never the hidden balls, so it gives nothing away
 * the board has not. The midend asks only about a board whose marks the check
 * passes, and every board has one answer (`answer.ts`), so no mark it meets is
 * wrong and its steps only ever add marks.
 *
 * 1. **Settle squares.** Follow a fired laser through the squares already
 *    settled to the first one nothing has settled. If one of the two things
 *    that square could hold would send the laser somewhere it did not go, the
 *    square holds the other. A laser that came out at a numbered square is
 *    followed from both ends, since a path runs the same either way. Repeat
 *    until nothing more settles. An empty square is shown by marking it known
 *    and a ball by guessing it, so each later deduction's premises are on the
 *    board.
 * 2. **Fire a laser** whose way through the box still depends on squares
 *    nothing has settled.
 * 3. **Offer a layout.** When every laser is fired and none settles a square on
 *    its own, a bounded search finds balls that send every laser where it went,
 *    keeping the player's marks. Past its budget the hint says it is out of
 *    reach.
 * 4. **Check the answer** once every laser's way is settled by the balls on
 *    the board, first putting any balls the count still needs on the squares
 *    no laser reaches.
 */

import {
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  narratedStep,
} from "../../engine/game.ts";
import { SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import type { Point } from "../../engine/types.ts";
import { type Seen, type Settled, say, type Would } from "./hint-text.ts";
import {
  BALL_GUESS,
  BALL_LOCK,
  type BlackboxMove,
  type BlackboxState,
  gridGet,
  type Holds,
  LASER_EMPTY,
  LASER_FLAGMASK,
  LASER_HIT,
  LASER_REFLECT,
  range2grid,
  type Traced,
  traceLaser,
} from "./state.ts";

/** A fired laser's result, with the flags the check adds taken off. */
function resultOf(state: BlackboxState, i: number): number {
  const e = state.exits[i];
  if (e === LASER_EMPTY) return LASER_EMPTY;
  if (e & LASER_HIT) return LASER_HIT;
  if (e & LASER_REFLECT) return LASER_REFLECT;
  return e & ~LASER_FLAGMASK;
}

/** What is known about each square of the box: `null` where nothing settles
 * it. Indexed `(y - 1) * w + (x - 1)` on the 1-based grid. */
export class Knowledge {
  readonly cells: Holds[];

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = new Array<Holds>(w * h).fill(null);
  }

  readonly at = (x: number, y: number): Holds => this.cells[(y - 1) * this.w + (x - 1)];

  set(p: Point, v: Holds): void {
    this.cells[(p.y - 1) * this.w + (p.x - 1)] = v;
  }

  trace(entry: number): Traced {
    return traceLaser(this.w, this.h, entry, this.at);
  }

  balls(): number {
    return this.cells.filter((c) => c === true).length;
  }

  /** Every square, with its place on the 1-based grid. */
  *squares(): Generator<{ at: Point; holds: Holds }> {
    for (let i = 0; i < this.cells.length; i++)
      yield {
        at: { x: (i % this.w) + 1, y: Math.floor(i / this.w) + 1 },
        holds: this.cells[i],
      };
  }
}

/** One square a fired laser settles, and the laser it was followed along. */
export interface Firing {
  readonly settled: Settled;
  readonly seen: Seen;
  readonly would: Would;
}

/** A fired laser's end to follow it from, and the result it must reach. */
interface Start {
  readonly from: number;
  readonly arrives: number;
  readonly seen: Seen;
}

/** Every end a fired laser can be followed from: its entry, and the far end of
 * one that came out at a numbered square. */
function startsOf(state: BlackboxState): Start[] {
  const out: Start[] = [];
  for (let i = 0; i < state.nlasers; i++) {
    const r = resultOf(state, i);
    if (r === LASER_EMPTY) continue;
    if (r === LASER_HIT)
      out.push({ from: i, arrives: r, seen: { kind: "hit", entry: i } });
    else if (r === LASER_REFLECT)
      out.push({ from: i, arrives: r, seen: { kind: "reflect", entry: i } });
    else if (i < r) {
      const end = range2grid(state.w, state.h, i) as Point;
      const n = gridGet(state, end.x, end.y) & ~LASER_FLAGMASK;
      const seen: Seen = { kind: "exit", ends: [i, r], n };
      out.push({ from: i, arrives: r, seen }, { from: r, arrives: i, seen });
    }
  }
  return out;
}

/** Every square the fired lasers settle one at a time, in the order they
 * settle, and what that leaves known. */
export function deduce(state: BlackboxState): { known: Knowledge; firings: Firing[] } {
  const known = new Knowledge(state.w, state.h);
  const firings: Firing[] = [];
  settle(startsOf(state), known, firings);
  return { known, firings };
}

/** Settle in `known` every square the lasers `starts` settle one at a time,
 * recording each in `firings`. */
function settle(starts: readonly Start[], known: Knowledge, firings: Firing[]): void {
  for (let changed = true; changed; ) {
    changed = false;
    for (const s of starts) {
      const t = known.trace(s.from);
      if (typeof t === "number") continue;
      const u = t.unknown;
      for (const ball of [true, false]) {
        known.set(u, ball);
        const r = known.trace(s.from);
        known.set(u, null);
        if (typeof r !== "number" || r === s.arrives) continue;
        known.set(u, !ball);
        const would: Would =
          r === LASER_HIT ? "hit" : r === LASER_REFLECT ? "reflect" : "exit";
        firings.push({ settled: { at: u, ball: !ball }, seen: s.seen, would });
        changed = true;
        break;
      }
    }
  }
}

type Step = HintStep<BlackboxMove>;

const guessed = (s: BlackboxState, p: Point): boolean =>
  (gridGet(s, p.x, p.y) & BALL_GUESS) !== 0;
const locked = (s: BlackboxState, p: Point): boolean =>
  (gridGet(s, p.x, p.y) & BALL_LOCK) !== 0;

/** The move that shows a settled square on the board, or `null` when it shows
 * already: a ball is a guess, an empty square is marked known. A square the
 * board shows the other way would be a mistake, which the midend refuses
 * first. */
function moveTo(s: BlackboxState, at: Point, ball: boolean): BlackboxMove | null {
  if (ball) return guessed(s, at) ? null : { type: "toggleBall", x: at.x, y: at.y };
  return locked(s, at) ? null : { type: "toggleLock", x: at.x, y: at.y };
}

/** How many layouts the search may try before it says the board is out of
 * its reach. */
const LAYOUT_BUDGET = 200_000;

export class OutOfReach extends Error {}

/**
 * Walk the ways of filling the squares `known` leaves open so that every fired
 * laser goes where it went, within the box's ball count, trying each square
 * empty first and settling what each try forces before the next. A way leaves
 * open the squares no laser looks at, and `found` is told how many balls it has
 * and how many such squares; it stops the walk by returning `true`, and the
 * walk then leaves that way in `known`. Throws {@link OutOfReach} after
 * `budget` steps.
 */
function walkLayouts(
  state: BlackboxState,
  known: Knowledge,
  found: (balls: number, open: number) => boolean,
  budget: number,
): boolean {
  const starts = startsOf(state);
  const scratch: Firing[] = [];
  let tried = 0;
  const rec = (): boolean => {
    if (++tried > budget) throw new OutOfReach();
    const balls = known.balls();
    if (balls > state.maxballs) return false;
    let pick: Point | null = null;
    for (const s of starts) {
      const t = known.trace(s.from);
      if (typeof t !== "number") pick ??= t.unknown;
      else if (t !== s.arrives) return false;
    }
    if (pick === null) {
      const open = known.cells.filter((c) => c === null).length;
      return balls + open >= state.minballs && found(balls, open);
    }
    const before = known.cells.slice();
    for (const ball of [false, true]) {
      known.set(pick, ball);
      settle(starts, known, scratch);
      scratch.length = 0;
      if (rec()) return true;
      known.cells.splice(0, before.length, ...before);
    }
    return false;
  };
  return rec();
}

/** Fill `known` with a layout that sends every fired laser where it went, and
 * say whether there is one; throws {@link OutOfReach} past its budget. */
function searchLayout(state: BlackboxState, known: Knowledge): boolean {
  return walkLayouts(state, known, () => true, LAYOUT_BUDGET);
}

/** How many ways `k` balls can sit on `n` squares, capped at 2. */
function waysUpTo2(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return k === 0 || k === n ? 1 : 2;
}

/**
 * How many layouts send every fired laser where it went, counted up to 2, from
 * what the lasers settle; throws {@link OutOfReach} after `budget` steps. Fired
 * on every laser, this is how many answers the board has.
 */
export function layoutsUpTo2(state: BlackboxState, budget: number): number {
  const { known } = deduce(state);
  let count = 0;
  walkLayouts(
    state,
    known,
    (balls, open) => {
      for (let more = 0; more <= open && count < 2; more++)
        if (balls + more >= state.minballs && balls + more <= state.maxballs)
          count += waysUpTo2(open, more);
      return count >= 2;
    },
    budget,
  );
  return Math.min(count, 2);
}

/** Black Box's hint (see the file header). */
export function hint(state: BlackboxState): HintResult<BlackboxMove> {
  const { known, firings } = deduce(state);
  const settled = firings.flatMap((f) => {
    const move = moveTo(state, f.settled.at, f.settled.ball);
    return move === null
      ? []
      : [narratedStep({ move, words: say.ray(f.seen, f.would, f.settled) })];
  });
  if (settled.length > 0) return { ok: true, steps: settled };

  const open: number[] = [];
  for (let i = 0; i < state.nlasers; i++)
    if (typeof known.trace(i) !== "number") open.push(i);
  const unfired = open.filter((i) => resultOf(state, i) === LASER_EMPTY);
  if (unfired.length > 0) {
    const firedAny = state.exits.some((e) => e !== LASER_EMPTY);
    return {
      ok: true,
      steps: [
        narratedStep({
          move: { type: "fire", rangeno: unfired[0] },
          words: say.fire(unfired[0], firedAny),
        }),
      ],
    };
  }

  if (open.length > 0) {
    const steps = layoutSteps(state, known);
    if (steps === null) return { ok: false, error: SEARCH_OUT_OF_REACH };
    if (steps.length > 0) return { ok: true, steps };
  }
  return { ok: true, steps: finish(state, known) };
}

/** The steps that put a found layout on the board, as one journey; none when
 * the board shows it already, `null` past the search's budget. The search keeps
 * the player's marks, so the layout only adds balls. Leaves the layout in
 * `known`. */
function layoutSteps(state: BlackboxState, known: Knowledge): Step[] | null {
  for (const { at, holds } of known.squares())
    if (holds === null && (guessed(state, at) || locked(state, at)))
      known.set(at, guessed(state, at));
  try {
    if (!searchLayout(state, known))
      throw new Error("blackbox hint: the fired lasers admit no layout");
  } catch (e) {
    if (e instanceof OutOfReach) return null;
    throw e;
  }
  const add: Point[] = [];
  for (const { at, holds } of known.squares())
    if (holds === true && !guessed(state, at)) add.push(at);
  return add.map((at, i) =>
    narratedStep<BlackboxMove, unknown>({
      move: { type: "toggleBall", x: at.x, y: at.y },
      words: say.layout(at, sequenceLeg(i, add.length), add),
      ...(i > 0 ? { continuesPrevious: true } : {}),
    }),
  );
}

const sequenceLeg = (i: number, n: number): "only" | "first" | "next" | "last" =>
  n === 1 ? "only" : i === 0 ? "first" : i === n - 1 ? "last" : "next";

/** Every laser's way is settled by `known`: put any balls the count still
 * needs on squares no laser reaches, then check the answer. Every board has one
 * answer, so the count fixes those squares: all of them hold a ball, or none
 * does, and none is marked known. */
function finish(state: BlackboxState, known: Knowledge): Step[] {
  let onOpen = 0;
  let free: Point | null = null;
  for (const { at, holds } of known.squares()) {
    if (holds !== null) continue;
    if (guessed(state, at)) onOpen++;
    else if (!locked(state, at)) free ??= at;
  }
  const more = state.minballs - known.balls() - onOpen;
  if (more > 0) {
    if (free === null)
      throw new Error("blackbox hint: the count needs a ball no square can take");
    return [
      narratedStep({
        move: { type: "toggleBall", x: free.x, y: free.y },
        words: say.hidden(more, free),
      }),
    ];
  }
  return [narratedStep({ move: { type: "reveal" }, words: say.done() })];
}

/** A move completes the step when it is the step's move. */
export function hintKeepTrack(
  m: BlackboxMove,
  step: HintStep<BlackboxMove>,
): HintTrackVerdict {
  return JSON.stringify(m) === JSON.stringify(step.move) ? "completed" : "off";
}
