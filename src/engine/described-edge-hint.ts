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
import { CELL, type MarkKind, type Narration, type Sentence } from "./hint-words.ts";
import {
  type CellMarks,
  type LadderEntry,
  ladderWalk,
  type Taken,
  TIERS,
} from "./ladder-runtime.ts";
import {
  type Clauses,
  type StatedContext,
  statedParts,
  statedSentence,
} from "./stated.ts";
import { stepBudget } from "./step-budget.ts";
import type { Point } from "./types.ts";

/** What a firing says, as the compiled module types it: its terms and the
 * elements it marks by role, and the arm that held where it has arms. */
interface SaysOf {
  arm?: string;
  /** The wording that held, where the technique states several. */
  wording?: number;
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
  Ring = never,
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
   * contradicts itself, which ends the hint as a contradiction does. It may
   * also note the board as it stands in `ctx`, for the step that follows the
   * firing to tell what the firing changed (Magnets). */
  settle?(marks: CellMarks, ctx: Ctx): boolean;
  /** The most steps a plan holds, a firing's last leg included; {@link
   * EDGE_PLAN} where left out. */
  plan?: number;
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
  /** Each kind of step's words as the description states them: the compiled
   * module's `STATED`. A technique none of whose kinds it states is said by
   * `say`. Stating a kind needs the rest of this block. */
  stated?: Readonly<Record<string, { readonly step?: readonly Clauses[] }>>;
  /** What a stated clause's `ring` is drawn on: the edges (or whatever) a leg
   * decides, which are not the cells its terms and marks name. */
  ringKind?: MarkKind<Ring>;
  /** What a leg decides, for a stated clause's `ring`. */
  ring?(marked: Marked): readonly Ring[];
  /** A later leg's sentence (a leg after the firing's first): its move is the
   * game's, from the ring it still has to make, and `basis` is what the kind's
   * `again` clause says of the reasoning. Needed where a kind states `again`. */
  later?(ring: readonly Ring[], basis: Narration): Sentence;
  /** The width of the board, to name a cell's point in a stated clause. */
  width?(state: State): number;
  /** A number term as the board draws it; its numeral where absent. */
  value?(n: number, state: State): string;
  /** The sentences the description cannot state, each technique's an override
   * of the stated form, with a comment saying why: one for every technique,
   * where the game reads the firing's premise itself into `marked`, or one a
   * technique. */
  say?:
    | ((
        spoken: EdgeSpoken<Says[keyof Says & string]>,
        marked: Marked,
        state: State,
      ) => Sentence)
    | {
        [K in keyof Says & string]?: (
          spoken: EdgeSpoken<Says[K]>,
          marked: Marked,
          state: State,
        ) => Sentence;
      };
}

/**
 * The most steps a plan holds unless a game says otherwise: a UX bound, not a
 * correctness one. A player rarely follows more than a handful of steps before
 * going their own way, and the plan is recomputed then anyway; it also keeps a
 * hint cheap enough for the cross-game resume walk, which asks after every
 * move.
 */
const EDGE_PLAN = 40;

/** The hint of a game whose ladder works on the edges, a step a firing. */
export function describedEdgeHint<
  State,
  Move,
  H,
  Marked,
  Ctx,
  Says extends { [K in keyof Says]: SaysOf },
  Kind extends string = string,
  Ring = never,
>(
  spec: EdgeHintSpec<State, Move, H, Marked, Ctx, Says, Ring>,
): (state: State) => HintResult<Move, H, Kind> {
  type Step = HintStep<Move, H, Kind>;
  type Say = (spoken: unknown, marked: Marked, state: State) => Sentence;
  const { say } = spec;
  const stated = spec.stated ?? {};
  // A technique is stated or overridden, never both.
  if (typeof say === "object")
    for (const id of Object.keys(say))
      if (Object.keys(stated).some((k) => k === id || k.startsWith(`${id}.`)))
        throw new Error(`${spec.name}: ${id} is both stated and overridden`);
  const sayOf = (technique: string): Say | null =>
    typeof say === "function"
      ? (say as Say)
      : ((say as unknown as Record<string, Say> | undefined)?.[technique] ?? null);
  const plan = spec.plan ?? EDGE_PLAN;

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
    while (steps.length < plan && !spec.done?.(m, ctx)) {
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
      const rung = (
        says.arm === undefined ? technique : `${technique}.${says.arm}`
      ) as Kind;
      const clauses = stated[rung]?.step?.[says.wording ?? 0];
      legs.forEach(({ move, highlights, marked }, leg) => {
        let words: Sentence;
        if (clauses !== undefined) {
          const w = (spec.width as NonNullable<typeof spec.width>)(state);
          const pointOf = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
          const ring = (spec.ring as NonNullable<typeof spec.ring>)(marked);
          const cx: StatedContext<Point, Ring> = {
            kind: CELL,
            ...(spec.ringKind === undefined ? {} : { ringKind: spec.ringKind }),
            at: pointOf,
            ring,
            marks: {
              outline: (says.marks.outline ?? []).map(pointOf),
              stripes: (says.marks.stripes ?? []).map(pointOf),
            },
            terms: {
              ...(says.terms as Record<string, unknown>),
              // A technique that declares `multi` is told whether its firing
              // sets several edges, which a leg's words differ by.
              ...("multi" in says.terms ? { multi: legs.length > 1 } : {}),
            },
            value: (n) => spec.value?.(n, state) ?? String(n),
          };
          const basis = leg > 0 ? statedParts(clauses, cx).again : undefined;
          words =
            basis !== undefined && spec.later !== undefined
              ? spec.later(ring, basis)
              : statedSentence(clauses, cx);
        } else
          words = (
            sayOf(technique) ??
            (() => {
              throw new Error(`${spec.name}: ${rung} is neither stated nor overridden`);
            })
          )(
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
          rung,
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
