/**
 * Black Box's hint: what the fired lasers prove about the box, and what to fire
 * when they prove nothing more.
 *
 * It reads only what the player can see, the lasers fired and where they went,
 * never the hidden balls, so it gives nothing away the board has not.
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
 *    its own, a bounded search finds balls that send every laser where it went.
 *    Past its budget the hint says it is out of reach.
 * 4. **Check the answer** once every laser's way is settled by the balls on
 *    the board. The check accepts any balls that send every laser where the
 *    real ones do, so balls no laser can see may sit on any unsettled square.
 */

import {
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  narratedStep,
} from "../../engine/game.ts";
import { SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
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
  const starts = startsOf(state);
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
  return { known, firings };
}

type Step = HintStep<BlackboxMove>;

const guessed = (s: BlackboxState, p: Point): boolean =>
  (gridGet(s, p.x, p.y) & BALL_GUESS) !== 0;
const locked = (s: BlackboxState, p: Point): boolean =>
  (gridGet(s, p.x, p.y) & BALL_LOCK) !== 0;

/** The moves that show a settled square on the board: a ball is a guess on a
 * square not marked known; an empty square holds no guess and is marked known.
 * A square shown otherwise takes two moves, the first undoing it. */
function movesTo(s: BlackboxState, at: Point, ball: boolean): BlackboxMove[] {
  const lock: BlackboxMove = { type: "toggleLock", x: at.x, y: at.y };
  const toggle: BlackboxMove = { type: "toggleBall", x: at.x, y: at.y };
  if (ball)
    return [...(locked(s, at) ? [lock] : []), ...(guessed(s, at) ? [] : [toggle])];
  return [...(guessed(s, at) ? [toggle] : []), ...(locked(s, at) ? [] : [lock])];
}

/** One journey over `moves`: its first leg in `lead`'s words and the rest in
 * `later`'s. */
function journey(
  moves: readonly BlackboxMove[],
  lead: () => Sentence,
  later: () => Sentence,
): Step[] {
  return moves.map((move, leg) =>
    narratedStep<BlackboxMove, unknown>({
      move,
      words: leg === 0 ? lead() : later(),
      ...(leg > 0 ? { continuesPrevious: true } : {}),
    }),
  );
}

/** How many layouts the search may try before it says the board is out of
 * its reach. */
const LAYOUT_BUDGET = 200_000;

class OutOfReach extends Error {}

/**
 * Fill the squares the fired lasers leave open so that every fired laser goes
 * where it went, within the most balls the box holds, trying each square empty
 * first so the layout adds as few balls as it can. Fills `known` in place and
 * says whether a layout was found; throws {@link OutOfReach} past its budget.
 */
function searchLayout(state: BlackboxState, known: Knowledge): boolean {
  // A numbered laser's two ends are one path, so its entry alone suffices.
  const starts = startsOf(state).filter(
    (s) => s.seen.kind !== "exit" || s.from < s.arrives,
  );
  let tried = 0;
  const rec = (open: number): boolean => {
    if (++tried > LAYOUT_BUDGET) throw new OutOfReach();
    const balls = known.balls();
    if (balls > state.maxballs) return false;
    let pick: Point | null = null;
    for (const s of starts) {
      const t = known.trace(s.from);
      if (typeof t !== "number") pick ??= t.unknown;
      else if (t !== s.arrives) return false;
    }
    if (pick === null) return balls + open >= state.minballs;
    for (const ball of [false, true]) {
      known.set(pick, ball);
      if (rec(open - 1)) return true;
    }
    known.set(pick, null);
    return false;
  };
  return rec(known.cells.filter((c) => c === null).length);
}

/** Black Box's hint (see the file header). */
export function hint(state: BlackboxState): HintResult<BlackboxMove> {
  const { known, firings } = deduce(state);
  const settle = firings.flatMap((f) =>
    journey(
      movesTo(state, f.settled.at, f.settled.ball),
      () => say.ray(f.seen, f.would, f.settled),
      () => say.again(f.settled, "ray"),
    ),
  );
  if (settle.length > 0) return { ok: true, steps: settle };

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
 * the board shows it already, `null` past the search's budget. Leaves the
 * layout in `known`. */
function layoutSteps(state: BlackboxState, known: Knowledge): Step[] | null {
  const before = known.cells.slice();
  try {
    if (!searchLayout(state, known))
      throw new Error("blackbox hint: the fired lasers admit no layout");
  } catch (e) {
    if (e instanceof OutOfReach) return null;
    throw e;
  }
  const changes: Settled[] = [];
  for (const [i, { at, holds }] of [...known.squares()].entries())
    if (before[i] === null && holds !== null && holds !== guessed(state, at))
      changes.push({ at, ball: holds });
  // A ball goes on through a known mark; an empty square only loses its ball.
  const legs = changes.flatMap(({ at, ball }) => {
    const out: { at: Point; change: "ball" | "unball" | "unlock" }[] = [];
    if (!ball) out.push({ at, change: "unball" });
    else {
      if (locked(state, at)) out.push({ at, change: "unlock" });
      out.push({ at, change: "ball" });
    }
    return out;
  });
  const all = changes.map((c) => c.at);
  return legs.map(({ at, change }, i) => {
    const leg =
      legs.length === 1
        ? "only"
        : i === 0
          ? "first"
          : i === legs.length - 1
            ? "last"
            : "next";
    return narratedStep<BlackboxMove, unknown>({
      move: {
        type: change === "unlock" ? "toggleLock" : "toggleBall",
        x: at.x,
        y: at.y,
      },
      words: say.layout(at, change, leg, all),
      ...(i > 0 ? { continuesPrevious: true } : {}),
    });
  });
}

/** Every laser's way is settled by `known`: bring the balls on unsettled
 * squares to a count the box can hold, then check the answer. */
function finish(state: BlackboxState, known: Knowledge): Step[] {
  let onOpen = 0;
  let free: Point | null = null;
  let freeLocked: Point | null = null;
  let extra: Point | null = null;
  for (const { at, holds } of known.squares()) {
    if (holds !== null) continue;
    if (guessed(state, at)) {
      onOpen++;
      extra ??= at;
    } else if (locked(state, at)) freeLocked ??= at;
    else free ??= at;
  }
  const found = known.balls();
  const more = state.minballs - found - onOpen;
  const spare = free ?? freeLocked;
  if (more > 0 && spare !== null) {
    return journey(
      movesTo(state, spare, true),
      () => say.hidden(more, spare),
      () => say.again({ at: spare, ball: true }, "count"),
    );
  }
  if (found + onOpen > state.maxballs && extra !== null)
    return [
      narratedStep({
        move: { type: "toggleBall", x: extra.x, y: extra.y },
        words: say.extra(state.maxballs, extra),
      }),
    ];
  return [narratedStep({ move: { type: "reveal" }, words: say.done() })];
}

/** A move completes the step when it is the step's move. */
export function hintKeepTrack(
  m: BlackboxMove,
  step: HintStep<BlackboxMove>,
): HintTrackVerdict {
  return JSON.stringify(m) === JSON.stringify(step.move) ? "completed" : "off";
}
