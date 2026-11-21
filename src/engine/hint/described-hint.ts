/**
 * A described game's hint, built from its ladder's firings: the walk, the step
 * a fact, the marks from what each technique `says` (`describe/`'s `says`),
 * the track-keeping, and the kinds a step can speak.
 *
 * A game supplies what only it knows: its state as the description's marks, a
 * fact as the move that makes it, and each technique's sentence as a function
 * of the technique's terms and the cells its step marks. Nothing here is
 * about a puzzle.
 *
 * Cell games only: a fact is a placement of a value on a cell.
 */

import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
  MoveVerdict,
} from "../contract/game.ts";
import { DEDUCTION_EXHAUSTED } from "../contract/hint-refusal.ts";
import { CELL, type Sentence } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import type { PairIndex } from "../render/piece.ts";
import { PLACE } from "../solve/describe-runtime.ts";
import {
  type CellMarks,
  type LadderEntry,
  ladderWalk,
  type Said,
  type Taken,
  TIERS,
} from "../solve/ladder-runtime.ts";
import { stepBudget } from "../solve/step-budget.ts";
import { type Judging, judgeWalked } from "./move-judge.ts";
import { type Clauses, statedSentence } from "./stated.ts";

/** What a step's highlights hold: the cell it fills and the value it fills it
 * with, which keep-track compares a move against. The marks are the words'. */
export interface CellHint {
  target: Point & { value: number };
}

/** What a sentence is built from: the technique's terms, and the cells its step
 * marks. A step's own cell is `target`; `outline` is what the technique outlines
 * less the cells the firing fills, and `stripes` is what it stripes. */
export interface Spoken<T> {
  terms: T;
  target: Point;
  outline: readonly Point[];
  stripes: readonly Point[];
}

/** What a technique says, as the compiled module types it. */
interface SaysOf {
  terms: object;
  /** Which of the technique's stated wordings held, where it states several. */
  wording?: number;
  marks: {
    outline?: readonly number[];
    stripes?: readonly number[];
    reads?: readonly number[];
  };
}

/** A game's hooks for what its techniques declare `supplied`, one a technique
 * (`Supplied` is the compiled module's `SuppliedById`): each returns every
 * term and mark its technique declares, so one left out does not compile.
 * It is told the firing's stated terms (`Says`, the module's `SaysById`), for
 * what the game makes of a set the description states: the words Wordtrail's
 * trails spell. */
export type SuppliedHooks<Supplied, Marked, State, Says = unknown> = {
  readonly [K in keyof Supplied]: (
    marked: Marked,
    state: State,
    terms: K extends keyof Says
      ? Says[K] extends { terms: infer T }
        ? T
        : unknown
      : unknown,
  ) => Supplied[K];
};

/** What a hook returns, as the engine reads it whatever the technique. */
export interface SuppliedOf {
  terms?: object;
  marks?: { outline?: readonly number[]; stripes?: readonly number[] };
}

/** What a game supplies for its hint. */
export interface DescribedHintSpec<
  State,
  Move,
  Says extends { [K in keyof Says]: SaysOf },
> {
  /** A name for the walk's step budget. */
  name: string;
  /** The state as the description's marks. */
  marks(state: State): CellMarks;
  /** The ladder to walk on the state. */
  entries(state: State): readonly LadderEntry[];
  /** The cells of a state a board is `w` wide, to name a cell's point. */
  width(state: State): number;
  /** The move that places `n` on the cell at `at`. */
  move(at: Point, n: number): Move;
  /** Each technique's words as the description states them: the compiled
   * module's `STATED`. A technique it does not state is said by `say`. */
  stated?: Readonly<Record<string, { readonly step?: readonly Clauses[] }>>;
  /** The member of the two-state pair a number term names, for a stated
   * clause's `{piece term}`. */
  piece?(n: number): PairIndex;
  /** What a stated clause's `{noun}` calls a cell: the compiled module's
   * `WORDS.cell`, "square" where the game gives none. */
  noun?: string;
  /** The sentences the description cannot state, one per technique that
   * `stated` has none of. */
  say: { [K in keyof Says & string]?: (spoken: Spoken<Says[K]["terms"]>) => Sentence };
}

/** The part of a game's hint (`Game.hint`) its description builds: the game
 * spreads it and adds what only it knows, its marks and its gesture. */
export interface DescribedHint<State, Move, Kind extends string> {
  plan(state: State): HintResult<Move, CellHint, Kind>;
  /** What Check & save says of the last move. */
  judgeMove(before: State, after: State): MoveVerdict | null;
  keepTrack(m: Move, step: HintStep<Move, CellHint, Kind>): HintTrackVerdict;
  /** The kinds a step can speak: the techniques that have a sentence. */
  rungs: readonly Kind[];
}

/** Whether two moves are the same move, as plain data. */
const sameMove = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * The most steps a plan holds unless a game says otherwise: a UX bound, not a
 * correctness one. A player rarely follows more than a handful of steps before
 * going their own way, and the plan is recomputed then anyway; it also keeps a
 * hint cheap enough for the cross-game resume walk, which asks after every
 * move.
 */
export const DEFAULT_PLAN = 40;

/** What a firing says: recorded for each of its facts by a technique that
 * `says`; the first fact's is the firing's. */
export const spokenOf = <Y>(taken: Taken): Said<unknown, Y> =>
  taken.reasons[0] as Said<unknown, Y>;

/** The technique a firing is of: its entry's, unless the entry is a rung
 * that offers the firings of others ({@link keptRung}'s stamp). */
export const techniqueOf = (taken: Taken): string =>
  spokenOf<unknown>(taken).technique ?? taken.entry.id;

/** The cells of the facts a firing makes. */
export const filledBy = (taken: Taken): number[] => {
  const out: number[] = [];
  for (let i = 0; i < taken.facts.length; i += 3) out.push(taken.facts[i + 1]);
  return out;
};

/** What a firing's premise reads: the squares it outlines, those it draws
 * apart, those it decides, and what it says it reads beyond them. A line it
 * only hatches is not read. */
export const premiseOf = (taken: Taken): number[] => {
  type Marked = {
    outline?: readonly number[];
    strand?: readonly number[];
    reads?: readonly number[];
  };
  const { marks, facts } = spokenOf<{
    marks: Marked;
    facts?: readonly { marks: Marked }[];
  }>(taken).says;
  return [
    ...[marks, ...(facts ?? []).map((x) => x.marks)].flatMap((x) => [
      ...(x.reads ?? []),
      ...(x.outline ?? []),
      ...(x.strand ?? []),
    ]),
    ...filledBy(taken),
  ];
};

/** The hooks of a game whose hint is its ladder's firings. */
export function describedHint<
  State,
  Move,
  Says extends { [K in keyof Says]: SaysOf },
  Kind extends keyof Says & string = keyof Says & string,
>(spec: DescribedHintSpec<State, Move, Says>): DescribedHint<State, Move, Kind> {
  const say = spec.say as Record<
    string,
    ((spoken: Spoken<object>) => Sentence) | undefined
  >;
  const stated = spec.stated ?? {};
  for (const id of Object.keys(say))
    if (id in stated)
      throw new Error(`${spec.name}: ${id} is both stated and overridden`);
  const kinds = [...new Set([...Object.keys(say), ...Object.keys(stated)])] as Kind[];
  const spoken = spokenOf<SaysOf>;
  const filled = filledBy;

  type Step = HintStep<Move, CellHint, Kind>;
  /** Every step the ladder makes from `state`. Judging a move, the walk is
   * aimed at its facts and ends once `judging` says they are made. */
  const stepsFrom = (state: State, judging?: Judging): Step[] => {
    const m = spec.marks(state);
    const w = spec.width(state);
    const pointOf = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
    m.budget = stepBudget(spec.name);
    // What a firing's premise reads: the cells it marks and the cells it fills.
    const reads = (taken: Taken): number[] => {
      const { marks } = spoken(taken).says;
      return [...(marks.reads ?? []), ...(marks.outline ?? []), ...filled(taken)];
    };
    const walk = ladderWalk(
      m,
      spec.entries(state),
      { [TIERS]: Number.MAX_SAFE_INTEGER },
      reads,
      judging ? { aim: judging.aim } : {},
    );
    if (judging)
      judging.traced = walk.trace(() => {
        const again = spec.marks(state);
        again.budget = stepBudget(spec.name);
        return again;
      });
    const steps: Step[] = [];
    while (!judging?.done(m)) {
      const known = walk.graph.facts.length;
      const f = walk.next();
      if (f === null || f === "contradiction") break;
      const from = steps.length;
      const kind = f.entry.id as Kind;
      const { terms, marks, wording } = spoken(f).says;
      const fills = filled(f);
      const outline = (marks.outline ?? []).filter((c) => !fills.includes(c));
      for (let i = 0, leg = 0; i < f.facts.length; i += 3) {
        if (f.facts[i] !== PLACE) continue;
        const target = pointOf(f.facts[i + 1]);
        const value = f.facts[i + 2];
        const stripes = (marks.stripes ?? []).map(pointOf);
        const clauses = stated[kind]?.step?.[wording ?? 0];
        const override = say[kind];
        if (clauses === undefined && override === undefined)
          throw new Error(`${spec.name}: ${kind} is neither stated nor overridden`);
        const words =
          clauses !== undefined
            ? statedSentence(clauses, {
                kind: CELL,
                at: pointOf,
                ring: [target],
                marks: { outline: outline.map(pointOf), stripes },
                terms: terms as Record<string, unknown>,
                value: String,
                ...(spec.piece === undefined ? {} : { piece: spec.piece }),
                ...(spec.noun === undefined ? {} : { noun: spec.noun }),
                unit: (els) => (els[0]?.y === els[1]?.y ? "row" : "column"),
              })
            : (override as NonNullable<typeof override>)({
                terms,
                target,
                outline: outline.map(pointOf),
                stripes,
              });
        steps.push({
          move: spec.move(target, value),
          rung: kind,
          explanation: words.text,
          words,
          highlights: { target: { ...target, value } },
          continuesPrevious: leg++ > 0,
        });
      }
      judging?.took(walk.graph, known, f.entry.name, steps.length > from);
    }
    return steps;
  };

  const hint = (state: State): HintResult<Move, CellHint, Kind> => {
    const steps = stepsFrom(state);
    return steps.length === 0
      ? { ok: false, error: DEDUCTION_EXHAUSTED }
      : { ok: true, steps };
  };

  /** What Check & save says of the last move. */
  const judgeMove = (before: State, after: State): MoveVerdict | null =>
    judgeWalked(before, after, spec.marks, (judging) => stepsFrom(before, judging));

  return {
    plan: hint,
    judgeMove,
    // A move completes the step iff it is the step's move; anything else drops
    // the plan to recompute.
    keepTrack: (m, step) => (sameMove(m, step.move) ? "completed" : "off"),
    rungs: kinds,
  };
}
