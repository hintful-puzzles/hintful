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

import {
  DEFAULT_PLAN,
  type SuppliedHooks,
  type SuppliedOf,
  spokenOf,
  techniqueOf,
} from "./described-hint.ts";
import type { HintResult, HintStep, MoveVerdict } from "./game.ts";
import { CONTRADICTION_UNLOCALIZED, DEDUCTION_EXHAUSTED } from "./hint-refusal.ts";
import {
  CELL,
  type MarkKind,
  type Narration,
  type Noun,
  type Sentence,
} from "./hint-words.ts";
import {
  type CellMarks,
  type LadderEntry,
  ladderWalk,
  type Taken,
  TIERS,
} from "./ladder-runtime.ts";
import { type Judging, judgeWalked, type MovedFact } from "./move-judge.ts";
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
  Elem = Point,
  Supplied = Record<never, never>,
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
  /** Whether the marks decide a fact of a player's move they hold no mark
   * for, as the board reads them, for Check & save's verdict: Tracks' side a
   * square's two rails close, which no technique crosses. */
  holds?(marks: CellMarks, ctx: Ctx, fact: MovedFact): boolean;
  /** The most steps a plan holds, a firing's last leg included; {@link
   * DEFAULT_PLAN} where left out. */
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
   * edges, one leg an edge: the legs after the first continue it. A leg's
   * `reference` is its step's (`HintStep.reference`). */
  step(
    fired: Fired<Says[keyof Says & string], Ctx>,
    state: State,
  ): { move: Move; highlights: H; marked: Marked; reference?: readonly string[] }[];
  /** Each kind of step's words as the description states them, and the flag
   * terms it declares `several`: the compiled module's `STATED`. A technique
   * none of whose kinds it states is said by `say`. Stating a kind needs the
   * rest of this block. */
  stated?: Readonly<
    Record<
      string,
      { readonly step?: readonly Clauses[]; readonly several?: readonly string[] }
    >
  >;
  /** What a stated clause's `ring` is drawn on: the edges (or whatever) a leg
   * decides, which are not the cells its terms and marks name. */
  ringKind?: MarkKind<Ring>;
  /** What a ring's `{noun}` calls one of `ringKind`'s elements ("edge"). */
  ringNoun?: Noun;
  /** What a leg decides, for a stated clause's `ring`. */
  ring?(marked: Marked): readonly Ring[];
  /** A later leg's sentence (a leg after the firing's first): its move is the
   * game's, from the ring it still has to make, and `basis` is what the kind's
   * `again` clause says of the reasoning. Left out, a kind's `later` clause
   * says the move. Palisade and Separate keep it (`edgeContinuation`): their
   * move says "a wall" or "walls" by the count of the leg's ring, which no
   * clause slot says without marking the words. */
  later?(ring: readonly Ring[], basis: Narration): Sentence;
  /** What a leg supplies to each technique that declares a term or mark
   * `supplied` (the module's `SuppliedById`), by technique: the domino of the
   * spot a leg decides, which differs by leg and which no firing's binding
   * holds, or the hubs a trial breaks. */
  supplied?: SuppliedHooks<Supplied, Marked, State, Says>;
  /** The width of the board, to name a cell's point in a stated clause. */
  width?(state: State): number;
  /** What a stated clause's outlines and terms are drawn on, where it is not
   * the board's squares by their points, and the element each index names:
   * Spokes' hubs, Pearl's squares by index, Tracks' pieces by their numbers.
   * How a game draws its elements is its own; the description names only
   * their sort. */
  elements?: { kind: MarkKind<Elem>; at(index: number, state: State): Elem };
  /** The terms a stated clause draws on a mark kind of their own, apart from
   * the elements, by name (Path's tried edges, Pearl's lines carried on,
   * Tracks' lines and pieces), and the element each index of one names where
   * that is not `elements.at` (Path, Tracks). By name, not by sort: Tracks
   * draws a line term as a line and a piece term as a piece, both numbers. */
  termKinds?: Readonly<Record<string, MarkKind<Elem>>>;
  termAt?: Readonly<Record<string, (index: number, state: State) => Elem>>;
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

/** The part of a game's hint (`Game.hint`) the builder makes: its plan, and
 * what Check & save says of the last move. The game spreads it. */
export interface DescribedEdgeHint<State, Move, H, Kind extends string> {
  plan(state: State): HintResult<Move, H, Kind>;
  judgeMove(before: State, after: State): MoveVerdict | null;
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
  Ring = never,
  Elem = Point,
  Supplied = Record<never, never>,
>(
  spec: EdgeHintSpec<State, Move, H, Marked, Ctx, Says, Ring, Elem, Supplied>,
): DescribedEdgeHint<State, Move, H, Kind> {
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
  const plan = spec.plan ?? DEFAULT_PLAN;

  /** The steps the ladder makes from `state` at tier `cap`, or the refusal
   * where its marks contradict themselves. Judging a move, the walk is aimed
   * at its facts and runs until `judging` says they are made, past the
   * plan's length, and each firing's legs are said as its first is. */
  const stepsAt = (
    state: State,
    cap: number,
    judging?: Judging,
  ): Step[] | "contradiction" | "clash" => {
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
        ...(judging ? { aim: judging.aim } : {}),
      },
    );
    if (judging) {
      judging.traced = walk.trace(() => {
        const again = spec.walk(state, cap)?.marks ?? m;
        again.budget = stepBudget(spec.name);
        return again;
      });
      const { holds } = spec;
      if (holds) judging.holds = (marks, fact) => holds(marks, ctx, fact);
    }
    const steps: Step[] = [];
    while (judging ? !judging.done(m) : steps.length < plan && !spec.done?.(m, ctx)) {
      if (spec.settle?.(m, ctx) === false) return "contradiction";
      // What the board shows may hold a fact before the next firing does.
      if (judging?.done(m)) break;
      const before = m.cands.slice();
      const known = walk.graph.facts.length;
      const taken = walk.next();
      if (taken === "contradiction") return taken;
      if (taken === null) break;
      const technique = techniqueOf(taken);
      const { says } = spokenOf<SaysOf>(taken);
      const legs = spec.step(
        { taken, says: says as Says[keyof Says & string], ctx, before, marks: m },
        state,
      );
      // Each leg is one step; a firing with none is bookkeeping (Pearl's
      // square that has its two lines).
      judging?.took(walk.graph, known, taken.entry.name, legs.length > 0);
      const rung = (
        says.arm === undefined ? technique : `${technique}.${says.arm}`
      ) as Kind;
      const clauses = stated[rung]?.step?.[says.wording ?? 0];
      const hooks = spec.supplied as
        | Readonly<
            Record<string, (marked: Marked, state: State, terms: object) => SuppliedOf>
          >
        | undefined;
      legs.forEach(({ move, highlights, marked, reference }, leg) => {
        let words: Sentence;
        if (clauses !== undefined) {
          const ring = (spec.ring as NonNullable<typeof spec.ring>)(marked);
          const own = hooks?.[technique]?.(marked, state, says.terms) ?? {};
          // Whether the firing decides more than one element: it has several
          // legs, or its one leg rings several.
          const several =
            legs.length > 1 ||
            (spec.ring as NonNullable<typeof spec.ring>)(legs[0].marked).length > 1;
          const { kind, at: pointOf } =
            spec.elements ??
            (() => {
              const w = (spec.width as NonNullable<typeof spec.width>)(state);
              return {
                kind: CELL as unknown as MarkKind<Elem>,
                at: (c: number) => ({ x: c % w, y: Math.floor(c / w) }) as Elem,
              };
            })();
          const cx: StatedContext<Elem, Ring> = {
            kind,
            ...(spec.ringKind === undefined ? {} : { ringKind: spec.ringKind }),
            ...(spec.ringNoun === undefined ? {} : { ringNoun: spec.ringNoun }),
            at: (index) => pointOf(index, state),
            ...(spec.termKinds === undefined ? {} : { termKinds: spec.termKinds }),
            ...(spec.termAt === undefined
              ? {}
              : {
                  termAt: Object.fromEntries(
                    Object.entries(spec.termAt).map(([name, at]) => [
                      name,
                      (index: number) => at(index, state),
                    ]),
                  ),
                }),
            ring,
            marks: {
              outline: (own.marks?.outline ?? says.marks.outline ?? []).map((i) =>
                pointOf(i, state),
              ),
              stripes: (own.marks?.stripes ?? says.marks.stripes ?? []).map((i) =>
                pointOf(i, state),
              ),
            },
            terms: {
              ...(says.terms as Record<string, unknown>),
              ...Object.fromEntries(
                (stated[rung]?.several ?? []).map((n) => [n, several]),
              ),
              ...own.terms,
            },
            value: (n) => spec.value?.(n, state) ?? String(n),
            later: leg > 0,
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
          ...(reference === undefined ? {} : { reference }),
          ...(leg > 0 ? { continuesPrevious: true } : {}),
        });
      });
    }
    return steps;
  };

  const tierCount = (state: State): number =>
    typeof spec.tiers.count === "number" ? spec.tiers.count : spec.tiers.count(state);

  /** What Check & save says of the last move: nothing where the walk from
   * the position before it finds the marks inconsistent. */
  const judgeMove = (before: State, after: State): MoveVerdict | null => {
    const cap = tierCount(before) - 1;
    let clashed = false;
    const verdict = judgeWalked(
      before,
      after,
      (state) => spec.walk(state, cap)?.marks ?? null,
      (judging) => {
        clashed = !Array.isArray(stepsAt(before, cap, judging));
      },
    );
    return clashed ? null : verdict;
  };

  const hint = (state: State): HintResult<Move, H, Kind> => {
    const { tiers } = spec;
    const count = tierCount(state);
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

  return { plan: hint, judgeMove };
}
