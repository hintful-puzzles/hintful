/**
 * A described game's hint where a step is a firing: one step decides every
 * square the firing does, and the player makes them one at a time, so the step
 * shrinks in place to what is left (`hint-track.ts`). `described-hint.ts` is
 * the other shape, a step a fact.
 *
 * A game supplies what only it knows: its state as the description's marks, a
 * fact as the target its highlights hold and the move that makes some of them,
 * and each technique's sentence as a function of the technique's terms and the
 * squares its step marks. Nothing here is about a puzzle.
 *
 * Cell games only: a fact is a placement of a value on a cell.
 */
import { PLACE } from "./describe-runtime.ts";
import { filledBy, spokenOf } from "./described-hint.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "./game.ts";
import { DEDUCTION_EXHAUSTED } from "./hint-refusal.ts";
import { changedCells, trackTargets } from "./hint-track.ts";
import { CELL, type Sentence } from "./hint-words.ts";
import {
  type CellMarks,
  type LadderEntry,
  ladderWalk,
  TIERS,
} from "./ladder-runtime.ts";
import { stepBudget } from "./step-budget.ts";
import type { Point } from "./types.ts";

/** What a step's highlights hold: the squares it decides, each with the value
 * it asks, and the squares drawn apart from the outline. */
export interface FiringHint<Target extends Point> {
  targets: Target[];
  strand: Point[];
}

/** What a firing says, as the compiled module types it for a technique: its
 * terms and the cells it marks by role, and the arm that held where it has
 * arms. */
interface SaysOf {
  arm?: string;
  terms: object;
  marks: {
    outline?: readonly number[];
    stripes?: readonly number[];
    strand?: readonly number[];
    reads?: readonly number[];
  };
}

/** What a sentence is built from: the technique's terms (and, where it has
 * arms, which arm held, so narrowing on `arm` narrows `terms`), and the squares
 * its step marks. `targets` are the squares the firing decides; `outline` is
 * what the technique outlines less those and less `strand`, which is drawn
 * apart; `stripes` is the line it hatches. */
export type FiringSpoken<S> = S extends { terms: infer T }
  ? {
      terms: T;
      arm: S extends { arm: infer A } ? A : undefined;
      targets: readonly Point[];
      outline: readonly Point[];
      stripes: readonly Point[];
      strand: readonly Point[];
      /** The point of a cell a term names. */
      at(cell: number): Point;
    }
  : never;

/** What a game supplies for a hint whose step is a firing. */
export interface FiringHintSpec<
  State,
  Move,
  Target extends Point,
  Says extends { [K in keyof Says]: SaysOf },
> {
  /** A name for the walk's step budget. */
  name: string;
  /** What to walk: the state as the description's marks, and the ladder. */
  walk(state: State): { marks: CellMarks; entries: readonly LadderEntry[] };
  /** The width of the board, to name a cell's point. */
  width(state: State): number;
  /** How many cells the board has. */
  size(state: State): number;
  /** The value a cell holds as the description reads it, 0 for none. */
  valueAt(state: State, cell: number): number;
  /** The state after a move. */
  execute(state: State, move: Move): State;
  /** Whether a move can be no part of a step (a solve). */
  foreign(move: Move): boolean;
  /** A fact as the target a highlight holds. */
  target(at: Point, n: number): Target;
  /** The value a target asks its square to hold. */
  want(target: Target): number;
  /** The move that makes these targets. */
  move(targets: readonly Target[]): Move;
  /** Each technique's sentence; the state is the board's numbers and the like. */
  say: {
    [K in keyof Says & string]: (
      spoken: FiringSpoken<Says[K]>,
      state: State,
    ) => Sentence;
  };
}

/** The hooks a game takes from its description. */
export interface DescribedFiringHint<
  State,
  Move,
  Target extends Point,
  Kind extends string,
> {
  hint(state: State): HintResult<Move, FiringHint<Target>, Kind>;
  hintKeepTrack(
    m: Move,
    step: HintStep<Move, FiringHint<Target>, Kind>,
    state: State,
  ): HintTrackVerdict;
}

/** The hooks of a game whose hint is its ladder's firings, a step each. */
export function describedFiringHint<
  State,
  Move,
  Target extends Point,
  Says extends { [K in keyof Says]: SaysOf },
  Kind extends string = string,
>(
  spec: FiringHintSpec<State, Move, Target, Says>,
): DescribedFiringHint<State, Move, Target, Kind> {
  type Step = HintStep<Move, FiringHint<Target>, Kind>;
  // The sentence of a technique is typed by what that technique says; the
  // firing's own record is the one that says it, so the match is by id.
  const say = spec.say as unknown as Record<
    string,
    (spoken: unknown, state: State) => Sentence
  >;

  const hint = (state: State): HintResult<Move, FiringHint<Target>, Kind> => {
    const { marks: m, entries } = spec.walk(state);
    const w = spec.width(state);
    const pointOf = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
    m.budget = stepBudget(spec.name);
    // What a firing's premise reads: the squares it outlines, those it draws
    // apart, those it decides, and what it says it reads beyond them. A line
    // it only hatches is not read.
    const reads = (taken: Parameters<typeof filledBy>[0]): number[] => {
      const { marks } = spokenOf<SaysOf>(taken).says;
      return [
        ...(marks.reads ?? []),
        ...(marks.outline ?? []),
        ...(marks.strand ?? []),
        ...filledBy(taken),
      ];
    };
    const walk = ladderWalk(m, entries, { [TIERS]: Number.MAX_SAFE_INTEGER }, reads);
    const steps: Step[] = [];
    for (let f = walk.next(); f !== null && f !== "contradiction"; f = walk.next()) {
      const { says } = spokenOf<SaysOf>(f);
      const kind = (
        says.arm === undefined ? f.entry.id : `${f.entry.id}.${says.arm}`
      ) as Kind;
      const targets: Target[] = [];
      for (let i = 0; i < f.facts.length; i += 3)
        if (f.facts[i] === PLACE)
          targets.push(spec.target(pointOf(f.facts[i + 1]), f.facts[i + 2]));
      const fills = new Set(filledBy(f));
      const strand = (says.marks.strand ?? []).filter((c) => !fills.has(c));
      const outline = (says.marks.outline ?? []).filter(
        (c) => !fills.has(c) && !strand.includes(c),
      );
      const words = say[f.entry.id](
        {
          terms: says.terms,
          arm: says.arm,
          targets: targets.map(({ x, y }) => ({ x, y })),
          outline: outline.map(pointOf),
          stripes: (says.marks.stripes ?? []).map(pointOf),
          strand: strand.map(pointOf),
          at: pointOf,
        },
        state,
      );
      steps.push({
        move: spec.move(targets),
        rung: kind,
        explanation: words.text,
        words,
        highlights: { targets, strand: strand.map(pointOf) },
      });
    }
    return steps.length === 0
      ? { ok: false, error: DEDUCTION_EXHAUSTED }
      : { ok: true, steps };
  };

  return {
    hint,
    // The squares the move changed must be ones the step asks for, set as it
    // asks; the step then shrinks to the squares not yet set.
    hintKeepTrack: (m, step, state) => {
      const hl = step.highlights;
      if (spec.foreign(m) || !hl) return "off";
      const after = spec.execute(state, m);
      const w = spec.width(state);
      const index = (t: Point): number => t.y * w + t.x;
      const { verdict, left } = trackTargets<Target, number, number>({
        targets: hl.targets,
        changes: changedCells(
          spec.size(state),
          (i) => spec.valueAt(state, i),
          (i) => spec.valueAt(after, i),
        ),
        key: index,
        want: spec.want,
        holds: (t) => spec.valueAt(after, index(t)) === spec.want(t),
      });
      if (verdict === "onTrack") {
        step.move = spec.move(left);
        step.highlights = { ...hl, targets: left };
        if (step.words) {
          const kept = new Set(left.map((t) => CELL.key(t)));
          step.words = step.words.narrow(
            (role, kind, key) => role !== "ring" || kind !== CELL.name || kept.has(key),
          );
          step.explanation = step.words.text;
        }
      }
      return verdict;
    },
  };
}
