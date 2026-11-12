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
import { PLACE } from "./describe-runtime.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "./game.ts";
import { DEDUCTION_EXHAUSTED } from "./hint-refusal.ts";
import type { Sentence } from "./hint-words.ts";
import {
  type CellMarks,
  type LadderEntry,
  ladderWalk,
  type Said,
  type Taken,
  TIERS,
} from "./ladder-runtime.ts";
import { stepBudget } from "./step-budget.ts";
import type { Point } from "./types.ts";

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
  marks: {
    outline?: readonly number[];
    stripes?: readonly number[];
    reads?: readonly number[];
  };
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
  /** Each technique's sentence. */
  say: { [K in keyof Says & string]: (spoken: Spoken<Says[K]["terms"]>) => Sentence };
}

/** The hooks a game takes from its description. */
export interface DescribedHint<State, Move, Kind extends string> {
  hint(state: State): HintResult<Move, CellHint, Kind>;
  hintKeepTrack(m: Move, step: HintStep<Move, CellHint, Kind>): HintTrackVerdict;
  /** The kinds a step can speak: the techniques that have a sentence. */
  hintRungs: readonly Kind[];
}

/** Whether two moves are the same move, as plain data. */
const sameMove = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

/** What a firing says: recorded for each of its facts by a technique that
 * `says`; the first fact's is the firing's. */
export const spokenOf = <Y>(taken: Taken): Said<unknown, Y> =>
  taken.reasons[0] as Said<unknown, Y>;

/** The cells of the facts a firing makes. */
export const filledBy = (taken: Taken): number[] => {
  const out: number[] = [];
  for (let i = 0; i < taken.facts.length; i += 3) out.push(taken.facts[i + 1]);
  return out;
};

/** The hooks of a game whose hint is its ladder's firings. */
export function describedHint<
  State,
  Move,
  Says extends { [K in keyof Says]: SaysOf },
  Kind extends keyof Says & string = keyof Says & string,
>(spec: DescribedHintSpec<State, Move, Says>): DescribedHint<State, Move, Kind> {
  const kinds = Object.keys(spec.say) as Kind[];
  const spoken = spokenOf<SaysOf>;
  const filled = filledBy;

  const hint = (state: State): HintResult<Move, CellHint, Kind> => {
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
    );
    const steps: HintStep<Move, CellHint, Kind>[] = [];
    for (let f = walk.next(); f !== null && f !== "contradiction"; f = walk.next()) {
      const kind = f.entry.id as Kind;
      const { terms, marks } = spoken(f).says;
      const fills = filled(f);
      const outline = (marks.outline ?? []).filter((c) => !fills.includes(c));
      for (let i = 0, leg = 0; i < f.facts.length; i += 3) {
        if (f.facts[i] !== PLACE) continue;
        const target = pointOf(f.facts[i + 1]);
        const value = f.facts[i + 2];
        const words = spec.say[kind]({
          terms: terms as Says[Kind]["terms"],
          target,
          outline: outline.map(pointOf),
          stripes: (marks.stripes ?? []).map(pointOf),
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
    }
    return steps.length === 0
      ? { ok: false, error: DEDUCTION_EXHAUSTED }
      : { ok: true, steps };
  };

  return {
    hint,
    // A move completes the step iff it is the step's move; anything else drops
    // the plan to recompute.
    hintKeepTrack: (m, step) => (sameMove(m, step.move) ? "completed" : "off"),
    hintRungs: kinds,
  };
}
