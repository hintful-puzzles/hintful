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
 * 1. **Settle squares**, by the ladder `blackbox.description.yaml` states,
 *    compiled: its `ray` follows a fired laser through the squares already
 *    settled to the first one nothing has settled, which holds whatever does
 *    not send the laser somewhere it did not go. Each fired laser is a clue
 *    of its `laser` kind, rebuilt from the board on each hint. An empty
 *    square is shown by marking it known and a ball by guessing it, so each
 *    later deduction's premises are on the board.
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

import { clueList, traceBeam } from "../../engine/describe-runtime.ts";
import {
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  narratedStep,
} from "../../engine/game.ts";
import { SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
} from "../../engine/ladder-runtime.ts";
import { claimRelation, judgeRivals } from "../../engine/rival-judging.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import * as blackbox from "./blackbox.compiled.ts";
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
  rangeOf,
  slotOf,
  spaceOf,
} from "./state.ts";

/** What the marks hold: a ball, or an empty square. */
const BALL = 1;
const EMPTY = 2;
const DOMAIN = (1 << BALL) | (1 << EMPTY);

/** A fired laser's result, with the flags the check adds taken off. */
function resultOf(state: BlackboxState, i: number): number {
  const e = state.exits[i];
  if (e === LASER_EMPTY) return LASER_EMPTY;
  if (e & LASER_HIT) return LASER_HIT;
  if (e & LASER_REFLECT) return LASER_REFLECT;
  return e & ~LASER_FLAGMASK;
}

/** The fired lasers as the description reads them: a clue at each end of
 * each, the slot it came out at, its own where it was reflected, and the
 * slot count where a ball absorbed it. In range order, each laser's far end
 * just after its entry. */
function dealtOf(state: BlackboxState): blackbox.Dealt {
  const { w, h } = state;
  const at: number[] = [];
  const v: number[] = [];
  const hit = 2 * (w + h);
  for (let i = 0; i < state.nlasers; i++) {
    const r = resultOf(state, i);
    if (r === LASER_EMPTY) continue;
    const s = slotOf(w, h, i);
    if (r === LASER_HIT || r === LASER_REFLECT) {
      at.push(s);
      v.push(r === LASER_HIT ? hit : s);
    } else if (i < r) {
      const e = slotOf(w, h, r);
      at.push(s, e);
      v.push(e, s);
    }
  }
  return {
    laser: clueList(at, v, hit),
    minballs: state.minballs,
    maxballs: state.maxballs,
  };
}

/** What a fired laser was seen to do, from the end at range index `i`. */
function seenOf(state: BlackboxState, i: number): Seen {
  const r = resultOf(state, i);
  if (r === LASER_HIT) return { kind: "hit", entry: i };
  if (r === LASER_REFLECT) return { kind: "reflect", entry: i };
  const lo = Math.min(i, r);
  const end = range2grid(state.w, state.h, lo) as Point;
  const n = gridGet(state, end.x, end.y) & ~LASER_FLAGMASK;
  return { kind: "exit", ends: [lo, Math.max(i, r)], n };
}

/** One square a fired laser settles, and the laser it was followed along. */
export interface Firing {
  readonly settled: Settled;
  readonly seen: Seen;
  readonly would: Would;
}

/** The ladder over the lasers `dealt` holds, each firing with its reason. */
function ladderOf(state: BlackboxState, dealt: blackbox.Dealt) {
  const hit = 2 * (state.w + state.h);
  return describedLadder(blackbox, {
    ray: compiledRung(
      blackbox.ray,
      dealt,
      ({ s, u, d, r }): Firing => ({
        settled: { at: pointOf(state, u), ball: d !== BALL },
        seen: seenOf(state, rangeOf(state.w, state.h, s)),
        would: r === hit ? "hit" : r === s ? "reflect" : "exit",
      }),
    ),
  });
}

/** A square of the description's space on the 1-based grid. */
const pointOf = (state: BlackboxState, c: number): Point => ({
  x: (c % state.w) + 1,
  y: ((c / state.w) | 0) + 1,
});

/** What is known about each square of the box, as the ladder's marks hold
 * it: `null` where nothing settles it. */
export class Knowledge {
  readonly m: CellMarks;

  constructor(
    readonly state: BlackboxState,
    readonly dealt: blackbox.Dealt,
  ) {
    this.m = new CellMarks(
      spaceOf(state.w, state.h),
      DOMAIN,
      new Uint8Array(state.w * state.h),
    );
    this.m.seed(this.m.grid);
  }

  /** What the square at `p` holds, on the 1-based grid. */
  readonly at = (p: Point): Holds => this.holds((p.y - 1) * this.state.w + (p.x - 1));

  holds(c: number): Holds {
    return this.m.known(c) ? this.m.value(c) === BALL : null;
  }

  set(p: Point, ball: boolean): void {
    this.m.placeAt((p.y - 1) * this.state.w + (p.x - 1), ball ? BALL : EMPTY);
  }

  /** Where the laser fired from range index `i` goes, or `null` where a
   * square nothing settles decides it. */
  goes(i: number): number | null {
    const r = traceBeam(this.m.sp, slotOf(this.state.w, this.state.h, i), (c) =>
      this.holds(c),
    );
    return r < 0 ? null : r;
  }

  balls(): number {
    let n = 0;
    for (let c = 0; c < this.m.grid.length; c++) if (this.m.grid[c] === BALL) n++;
    return n;
  }

  /** Every square, with its place on the 1-based grid. */
  *squares(): Generator<{ at: Point; holds: Holds }> {
    for (let c = 0; c < this.m.grid.length; c++)
      yield { at: pointOf(this.state, c), holds: this.holds(c) };
  }
}

/** The ladder's techniques on `known`'s marks. */
const techniquesOn = (known: Knowledge) =>
  ladderTechniques(
    known.m,
    ladderOf(known.state, known.dealt).entries,
    { [SCALE]: 0 },
    {},
  );

/** Every square the fired lasers settle one at a time, in the order the
 * ladder settles them, and what that leaves known. */
export function deduce(state: BlackboxState): { known: Knowledge; firings: Firing[] } {
  const known = new Knowledge(state, dealtOf(state));
  const { m } = known;
  m.budget = stepBudget("blackbox hint");
  const firings: Firing[] = [];
  let group = -1;
  m.recorder = (rec) => {
    if (rec.group === group) return;
    group = rec.group;
    firings.push(rec.reason as Firing);
  };
  runLadder(m, techniquesOn(known));
  m.recorder = undefined;
  m.budget = undefined;
  return { known, firings };
}

/** What the fired lasers settle, without the reasons. */
function settled(state: BlackboxState): Knowledge {
  const known = new Knowledge(state, dealtOf(state));
  runLadder(known.m, techniquesOn(known));
  return known;
}

/** What a step rests on, by the branch of {@link hint} that built it: a
 * fired laser followed to a square, a laser to fire, a layout the search
 * found, a ball no laser reaches, and the check. A layout's balls are one
 * rung: one journey. */
export const BLACKBOX_RUNGS = ["ray", "fire", "layout", "hidden", "done"] as const;
export type BlackboxRung = (typeof BLACKBOX_RUNGS)[number];

type Step = HintStep<BlackboxMove, unknown, BlackboxRung>;

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
 * empty first and settling what each try forces by the ladder before the
 * next. A way leaves open the squares no laser looks at, and `found` is told
 * how many balls it has and how many such squares; it stops the walk by
 * returning `true`, and the walk then leaves that way in `known`. Throws
 * {@link OutOfReach} after `budget` steps.
 */
function walkLayouts(
  state: BlackboxState,
  known: Knowledge,
  found: (balls: number, open: number) => boolean,
  budget: number,
): boolean {
  const { m, dealt } = known;
  const techniques = techniquesOn(known);
  const holds = (c: number): Holds => known.holds(c);
  let tried = 0;
  const rec = (): boolean => {
    if (++tried > budget) throw new OutOfReach();
    const balls = known.balls();
    if (balls > state.maxballs) return false;
    let pick = -1;
    for (let k = 0; k < dealt.laser.at.length; k++) {
      const r = traceBeam(m.sp, dealt.laser.at[k], holds);
      if (r < 0) {
        if (pick < 0) pick = ~r;
      } else if (r !== dealt.laser.v[k]) return false;
    }
    if (pick < 0) {
      let open = 0;
      for (let c = 0; c < m.grid.length; c++) if (!m.known(c)) open++;
      return balls + open >= state.minballs && found(balls, open);
    }
    const grid = m.grid.slice();
    const cands = m.cands.slice();
    for (const v of [EMPTY, BALL]) {
      m.placeAt(pick, v);
      if (!runLadder(m, techniques) && rec()) return true;
      m.grid.set(grid);
      m.cands.set(cands);
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
  const known = settled(state);
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
export function hint(
  state: BlackboxState,
): HintResult<BlackboxMove, unknown, BlackboxRung> {
  const { known, firings } = deduce(state);
  const settled = firings.flatMap((f): Step[] => {
    const move = moveTo(state, f.settled.at, f.settled.ball);
    if (move === null) return [];
    // The square's one rival is its other content, which the firing followed
    // along the laser to somewhere the laser did not go: it is lost.
    const relation = claimRelation(judgeRivals([f.would], 0, () => "lost").claim);
    if (relation === null) throw new Error("blackbox: a firing left its rival open");
    return [
      narratedStep({
        move,
        rung: "ray",
        words: say.ray(f.seen, f.would, f.settled, relation),
      }),
    ];
  });
  if (settled.length > 0) return { ok: true, steps: settled };

  const open: number[] = [];
  for (let i = 0; i < state.nlasers; i++) if (known.goes(i) === null) open.push(i);
  const unfired = open.filter((i) => resultOf(state, i) === LASER_EMPTY);
  if (unfired.length > 0) {
    const firedAny = state.exits.some((e) => e !== LASER_EMPTY);
    return {
      ok: true,
      steps: [
        narratedStep({
          move: { type: "fire", rangeno: unfired[0] },
          rung: "fire",
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
    narratedStep<BlackboxMove, unknown, BlackboxRung>({
      move: { type: "toggleBall", x: at.x, y: at.y },
      rung: "layout",
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
        rung: "hidden",
        words: say.hidden(more, free),
      }),
    ];
  }
  return [narratedStep({ move: { type: "reveal" }, rung: "done", words: say.done() })];
}

/** A move completes the step when it is the step's move. */
export function hintKeepTrack(
  m: BlackboxMove,
  step: HintStep<BlackboxMove>,
): HintTrackVerdict {
  return JSON.stringify(m) === JSON.stringify(step.move) ? "completed" : "off";
}
