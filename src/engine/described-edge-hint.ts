/**
 * A described game's hint where the answer is on the edges and a step is a
 * firing: the walk, the tier it starts at, the plan's length, the kind of each
 * step from the technique and the arm that held, and each technique's words
 * from what it says (`describe/`'s `says`). `described-firing-hint.ts` is the
 * cell games' shape.
 *
 * What a firing decided is not a placement a cell holds but what its facts did
 * to the edges' marks, so the engine hands the game the marks as the firing
 * found them (`before`) and as it left them, and the game makes the move and the
 * highlights from the two. A game's own keep-track stays its own: the moves a
 * player makes along an edge (a bridge a drag at a time) are not the facts.
 */

import { spokenOf, techniqueOf } from "./described-hint.ts";
import type { HintResult, HintStep } from "./game.ts";
import { CONTRADICTION_UNLOCALIZED, DEDUCTION_EXHAUSTED } from "./hint-refusal.ts";
import type { Sentence } from "./hint-words.ts";
import {
  type CellMarks,
  type LadderEntry,
  ladderWalk,
  type Taken,
  TIERS,
} from "./ladder-runtime.ts";
import { stepBudget } from "./step-budget.ts";

/** What a firing says, as the compiled module types it: its terms and the
 * elements it marks by role, and the arm that held where it has arms. */
interface SaysOf {
  arm?: string;
  terms: object;
  marks: {
    outline?: readonly number[];
    stripes?: readonly number[];
    reads?: readonly number[];
  };
}

/** A firing as the game reads it to make its step. */
export interface Fired<S, Ctx> {
  /** The firing the walk took, its facts included. */
  taken: Taken;
  /** The terms, marks and arm it said. */
  says: S;
  /** What the game's `walk` handed back beside the marks. */
  ctx: Ctx;
  /** The edges' candidates as the firing found them. */
  before: Int32Array;
  /** The marks, as the firing left them. */
  marks: CellMarks;
}

/** What a sentence is built from: the technique's terms, which arm held, and
 * the elements it outlines (less none: the facts are edges, not elements). */
export type EdgeSpoken<S> = S extends { terms: infer T }
  ? {
      terms: T;
      arm: S extends { arm: infer A } ? A : undefined;
      outline: readonly number[];
      stripes: readonly number[];
    }
  : never;

/** What a game supplies for a hint on the edges. */
export interface EdgeHintSpec<
  State,
  Move,
  H,
  Marked,
  Ctx,
  Says extends { [K in keyof Says]: SaysOf },
> {
  /** A name for the walk's step budget. */
  name: string;
  /** What to walk: the state as the description's marks, the ladder with no
   * technique above tier `cap`, and what the game reads its firings by (made
   * afresh for each plan). `null` where the player's own marks clash, which
   * leaves a hint nothing to walk from. */
  walk(
    state: State,
    cap: number,
  ): { marks: CellMarks; entries: readonly LadderEntry[]; ctx: Ctx } | null;
  /** The walk begins at the lowest tier that solves the board and goes up a
   * tier only where one has nothing to say. */
  tiers: { lowest(state: State): number; count: number | ((state: State) => number) };
  /** The techniques the walk takes before any other (`prerequisite`) and only
   * where nothing else follows (`fallback`), by id: a square's own sides before
   * a clue is counted. */
  roles?: {
    readonly prerequisite?: readonly string[];
    readonly fallback?: readonly string[];
  };
  /** Whether the marks already are the answer: a plan ends there, though the
   * ladder may still have a mark to make (Separate's no-wall marks, once its
   * walls divide the board). */
  done?(marks: CellMarks, ctx: Ctx): boolean;
  /** Brings the marks up to what the board shows before each firing is
   * taken (links the player can read at a glance, say), where that is more
   * than the steps made so far have left on them. `false` where the board
   * contradicts itself, which ends the hint as a contradiction does. */
  settle?(marks: CellMarks, ctx: Ctx): boolean;
  /** The most firings a plan holds: a player rarely follows more, and a
   * recompute yields the next batch. */
  plan: number;
  /** The elements a firing writes, which the walk continues from. Left out, a
   * firing writes the two cells each of its edges lies between. */
  writes?(taken: Taken, ctx: Ctx): readonly number[];
  /** The elements a firing reads beyond the marks it says (its outline and
   * `reads`), which the walk continues from too: the squares its own facts
   * touch, where the reason names others. */
  reads?(taken: Taken, ctx: Ctx): readonly number[];
  /** A firing's legs, one move each, with their highlights and what each leg's
   * words are told of them. A firing is one step unless it is a journey of
   * edges, one leg an edge: the legs after the first continue it. */
  step(
    fired: Fired<Says[keyof Says & string], Ctx>,
    state: State,
  ): { move: Move; highlights: H; marked: Marked }[];
  /** Each technique's sentence. */
  say: {
    [K in keyof Says & string]: (
      spoken: EdgeSpoken<Says[K]>,
      marked: Marked,
      state: State,
    ) => Sentence;
  };
}

/** The hint of a game whose ladder works on the edges, a step a firing. */
export function describedEdgeHint<
  State,
  Move,
  H,
  Marked,
  Ctx,
  Says extends { [K in keyof Says]: SaysOf },
  Kind extends string = string,
>(
  spec: EdgeHintSpec<State, Move, H, Marked, Ctx, Says>,
): (state: State) => HintResult<Move, H, Kind> {
  type Step = HintStep<Move, H, Kind>;
  const say = spec.say as unknown as Record<
    string,
    (spoken: unknown, marked: Marked, state: State) => Sentence
  >;

  /** The steps the ladder makes from `state` at tier `cap`, or the refusal
   * where its marks contradict themselves. */
  const stepsAt = (state: State, cap: number): Step[] | "contradiction" | "clash" => {
    const walked = spec.walk(state, cap);
    if (walked === null) return "clash";
    const { marks: m, entries, ctx } = walked;
    m.budget = stepBudget(spec.name);
    const walk = ladderWalk(
      m,
      entries,
      { [TIERS]: cap },
      (taken) => {
        const { marks } = spokenOf<SaysOf>(taken).says;
        return [
          ...(marks.reads ?? []),
          ...(marks.outline ?? []),
          ...(spec.reads?.(taken, ctx) ?? []),
        ];
      },
      {
        ...spec.roles,
        ...(spec.writes === undefined
          ? {}
          : { writes: (taken: Taken) => spec.writes?.(taken, ctx) ?? [] }),
      },
    );
    const steps: Step[] = [];
    while (steps.length < spec.plan && !spec.done?.(m, ctx)) {
      if (spec.settle?.(m, ctx) === false) return "contradiction";
      const before = m.cands.slice();
      const taken = walk.next();
      if (taken === "contradiction") return taken;
      if (taken === null) break;
      const technique = techniqueOf(taken);
      const { says } = spokenOf<SaysOf>(taken);
      const legs = spec.step(
        { taken, says: says as Says[keyof Says & string], ctx, before, marks: m },
        state,
      );
      legs.forEach(({ move, highlights, marked }, leg) => {
        const words = say[technique](
          {
            terms: says.terms,
            arm: says.arm,
            outline: says.marks.outline ?? [],
            stripes: says.marks.stripes ?? [],
          },
          marked,
          state,
        );
        steps.push({
          move,
          rung: (says.arm === undefined
            ? technique
            : `${technique}.${says.arm}`) as Kind,
          explanation: words.text,
          words,
          highlights,
          ...(leg > 0 ? { continuesPrevious: true } : {}),
        });
      });
    }
    return steps;
  };

  return (state) => {
    const { tiers } = spec;
    const count = typeof tiers.count === "number" ? tiers.count : tiers.count(state);
    let steps = stepsAt(state, tiers.lowest(state));
    for (
      let cap = tiers.lowest(state) + 1;
      Array.isArray(steps) && steps.length === 0 && cap < count;
      cap++
    )
      steps = stepsAt(state, cap);
    if (steps === "clash") return { ok: false, error: DEDUCTION_EXHAUSTED };
    // A contradiction here is the player's own: the mistake check re-solves
    // from the clues and finds none to name, so it is left unlocalized.
    if (steps === "contradiction")
      return { ok: false, error: CONTRADICTION_UNLOCALIZED };
    return steps.length === 0
      ? { ok: false, error: DEDUCTION_EXHAUSTED }
      : { ok: true, steps };
  };
}
