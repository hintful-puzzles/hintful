/**
 * A described game's hint where a step is a firing: one step decides every
 * square the firing does, and the player makes them one at a time, so the step
 * shrinks in place to what is left (`hint-track.ts`). `described-hint.ts` is
 * the other shape, a step a fact.
 *
 * Or, where the game gives a `journey`, a firing is a journey of legs, each a
 * move of the game's own that the player makes whole (a fill along a line): the
 * step then never shrinks, and a leg is judged by the squares it makes.
 *
 * What a firing's placing techniques decide on their own (the water a boat
 * drags along) is read off the marks across the firing; the step shows and
 * makes it with the firing's squares, and says nothing of it.
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
import { changedCells, trackLeg, trackTargets } from "./hint-track.ts";
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

/** What a step marks, for a game that draws its highlights its own way: the
 * squares it asks for (those the firing decides, then those its placing
 * techniques follow with), and the cells its technique outlines, hatches and
 * draws apart. */
interface Marked<Target extends Point> {
  targets: Target[];
  outline: Point[];
  stripes: Point[];
  strand: Point[];
}

/** A firing as a journey: its legs are moves of the game's own, and a leg is
 * judged by the squares it makes. */
interface Journey<Move, Target extends Point, State> {
  /** The moves that make these targets, all of one value, in the order the
   * player makes them; `before` is the marks as the firing found them. */
  legs(group: readonly Target[], before: ArrayLike<number>, state: State): Move[];
  /** The targets a leg's move makes. */
  legTargets(move: Move, targets: readonly Target[]): readonly Target[];
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
      /** The squares the firing's placing techniques follow with, which the
       * step shows and makes but does not say. */
      consequences: readonly Point[];
      /** The squares the firing decides to be `n`. */
      placing(n: number): readonly Point[];
    }
  : never;

interface FiringShape<
  State,
  Move,
  Target extends Point,
  Says extends { [K in keyof Says]: SaysOf },
  H extends { targets: Target[] },
> {
  /** A name for the walk's step budget. */
  name: string;
  /** What to walk: the state as the description's marks, and the ladder with
   * no technique above tier `cap`; `null` where the marks clash. */
  walk(
    state: State,
    cap: number,
  ): { marks: CellMarks; entries: readonly LadderEntry[] } | null;
  /** The walk begins at the lowest tier that solves the board and goes up a
   * tier only where one has nothing to say, so a hint teaches what the board
   * needs and does not move as the player plays. Without it every tier is
   * open. */
  tiers?: { lowest(state: State): number; count: number };
  /** The most firings a plan holds: a player rarely follows more, and a
   * recompute yields the next batch. */
  plan?: number;
  /** The techniques whose step is made for each square the firing decides
   * (`says.shown: each`): the compiled module's `SAYS_EACH`. */
  each?: readonly string[];
  /** Whether the squares a firing's placing techniques decide are shown and
   * made with it. `false` where they are what the board already shows: a bulb
   * lights its lines, and a player does not cross each. Default `true`. */
  consequences?: boolean;
  /** What a step's highlights hold, where it is more than the targets and the
   * strand. */
  highlights?(marked: Marked<Target>, state: State): H;
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
  /** Each technique's sentence; the state is the board's numbers and the like. */
  say: {
    [K in keyof Says & string]: (
      spoken: FiringSpoken<Says[K]>,
      state: State,
    ) => Sentence;
  };
}

/** What a game supplies for a hint whose step is a firing: the move that makes
 * the targets left, or the journey a firing is. */
export type FiringHintSpec<
  State,
  Move,
  Target extends Point,
  Says extends { [K in keyof Says]: SaysOf },
  H extends { targets: Target[] } = FiringHint<Target>,
> = FiringShape<State, Move, Target, Says, H> &
  (
    | {
        /** The move that makes these targets. */
        move(targets: readonly Target[]): Move;
        journey?: never;
      }
    | { journey: Journey<Move, Target, State>; move?: never }
  );

/** The hooks a game takes from its description. */
export interface DescribedFiringHint<
  State,
  Move,
  Target extends Point,
  Kind extends string,
  H extends { targets: Target[] } = FiringHint<Target>,
> {
  hint(state: State): HintResult<Move, H, Kind>;
  /** Judges a move against a step of any kind: the kind is no part of it. */
  hintKeepTrack(m: Move, step: HintStep<Move, H>, state: State): HintTrackVerdict;
  /** A step the player has already made some of (undo and redo move the board
   * under a shown step) is shown for what is left, or `null` where nothing is. */
  refreshHintStep(step: HintStep<Move, H>, state: State): HintStep<Move, H> | null;
}

/** The hooks of a game whose hint is its ladder's firings, a step each. */
export function describedFiringHint<
  State,
  Move,
  Target extends Point,
  Says extends { [K in keyof Says]: SaysOf },
  Kind extends string = string,
  H extends { targets: Target[] } = FiringHint<Target>,
>(
  spec: FiringHintSpec<State, Move, Target, Says, H>,
): DescribedFiringHint<State, Move, Target, Kind, H> {
  type Step = HintStep<Move, H, Kind>;
  // The sentence of a technique is typed by what that technique says; the
  // firing's own record is the one that says it, so the match is by id.
  const say = spec.say as unknown as Record<
    string,
    (spoken: unknown, state: State) => Sentence
  >;

  /** The steps of the firings the ladder makes from `state` at tier `cap`. */
  const stepsAt = (state: State, cap: number): Step[] => {
    const walked = spec.walk(state, cap);
    if (walked === null) return [];
    const { marks: m, entries } = walked;
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
    const walk = ladderWalk(m, entries, { [TIERS]: cap }, reads);
    const steps: Step[] = [];
    for (let fired = 0; spec.plan === undefined || fired < spec.plan; fired++) {
      const before = m.grid.slice();
      const f = walk.next();
      if (f === null || f === "contradiction") break;
      const { says } = spokenOf<SaysOf>(f);
      const kind = (
        says.arm === undefined ? f.entry.id : `${f.entry.id}.${says.arm}`
      ) as Kind;
      // The squares the firing decides, still open as it found them.
      const decided: Target[] = [];
      const seen = new Set<number>();
      for (let i = 0; i < f.facts.length; i += 3) {
        const c = f.facts[i + 1];
        if (f.facts[i] !== PLACE || before[c] !== 0 || seen.has(c)) continue;
        seen.add(c);
        decided.push(spec.target(pointOf(c), f.facts[i + 2]));
      }
      // The squares its placing techniques went on to decide.
      const followed: Target[] = [];
      if (spec.consequences !== false)
        for (let c = 0; c < m.grid.length; c++)
          if (before[c] === 0 && m.grid[c] !== 0 && !seen.has(c))
            followed.push(spec.target(pointOf(c), m.grid[c]));
      // A step for the firing, or one for each square it decides, which is then
      // the only square the evidence is taken less.
      const each = spec.each?.includes(f.entry.id) === true;
      for (const group of each ? decided.map((t) => [t]) : [decided]) {
        const targets = [...group, ...followed];
        const fills = new Set(each ? group.map((t) => t.y * w + t.x) : filledBy(f));
        const strand = (says.marks.strand ?? []).filter((c) => !fills.has(c));
        const outline = (says.marks.outline ?? []).filter(
          (c) => !fills.has(c) && !strand.includes(c),
        );
        const bare = (t: Point): Point => ({ x: t.x, y: t.y });
        const words = say[f.entry.id](
          {
            terms: says.terms,
            arm: says.arm,
            targets: group.map(bare),
            outline: outline.map(pointOf),
            stripes: (says.marks.stripes ?? []).map(pointOf),
            strand: strand.map(pointOf),
            at: pointOf,
            consequences: followed.map(bare),
            placing: (n: number) => group.filter((t) => spec.want(t) === n).map(bare),
          },
          state,
        );
        const marked: Marked<Target> = {
          targets,
          outline: outline.map(pointOf),
          stripes: (says.marks.stripes ?? []).map(pointOf),
          strand: strand.map(pointOf),
        };
        const highlights = (
          spec.highlights
            ? spec.highlights(marked, state)
            : { targets, strand: marked.strand }
        ) as H;
        const step = { rung: kind, explanation: words.text, words, highlights };
        if (spec.journey === undefined) {
          steps.push({ ...step, move: spec.move(targets) });
          continue;
        }
        const { journey } = spec;
        const values = [...new Set(targets.map(spec.want))].sort((a, b) => a - b);
        const legs = values.flatMap((n) =>
          journey.legs(
            targets.filter((t) => spec.want(t) === n),
            before,
            state,
          ),
        );
        for (const [i, move] of legs.entries())
          steps.push({ ...step, move, continuesPrevious: i > 0 });
      }
    }
    return steps;
  };

  const hint = (state: State): HintResult<Move, H, Kind> => {
    const { tiers } = spec;
    const first = tiers ? tiers.lowest(state) : Number.MAX_SAFE_INTEGER;
    let steps = stepsAt(state, first);
    for (let cap = first + 1; tiers && steps.length === 0 && cap < tiers.count; cap++)
      steps = stepsAt(state, cap);
    return steps.length === 0
      ? { ok: false, error: DEDUCTION_EXHAUSTED }
      : { ok: true, steps };
  };

  return {
    hint,
    // The squares the move changed must be ones the step asks for, set as it
    // asks; the step then shrinks to the squares not yet set. A journey's leg
    // is judged by its own squares, and the step does not shrink.
    hintKeepTrack: (m, step, state) => {
      const hl = step.highlights;
      if (spec.foreign(m) || !hl) return "off";
      const after = spec.execute(state, m);
      const w = spec.width(state);
      const index = (t: Point): number => t.y * w + t.x;
      if (spec.journey !== undefined)
        return trackLeg({
          targets: spec.journey.legTargets(step.move, hl.targets),
          want: spec.want,
          was: (t) => spec.valueAt(state, index(t)),
          now: (t) => spec.valueAt(after, index(t)),
        });
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
        Object.assign(step, narrowedTo(step, left));
      }
      return verdict;
    },
    refreshHintStep: (step, state) => {
      const hl = step.highlights;
      if (!hl || spec.journey !== undefined) return step;
      const w = spec.width(state);
      const left = hl.targets.filter(
        (t) => spec.valueAt(state, t.y * w + t.x) !== spec.want(t),
      );
      if (left.length === 0) return null;
      return left.length === hl.targets.length
        ? step
        : { ...step, ...narrowedTo(step, left) };
    },
  };

  /** What `step` becomes where only the targets `left` are still to make: its
   * move, its highlights and its words, which count their ringed squares. */
  function narrowedTo(
    step: HintStep<Move, H>,
    left: Target[],
  ): Pick<HintStep<Move, H>, "move" | "highlights" | "words" | "explanation"> {
    const narrowed = {
      move: spec.move?.(left) ?? step.move,
      highlights: { ...(step.highlights as H), targets: left },
    };
    if (!step.words) return { ...narrowed, explanation: step.explanation };
    const kept = new Set(left.map((t) => CELL.key(t)));
    const words = step.words.narrow(
      (role, kind, key) => role !== "ring" || kind !== CELL.name || kept.has(key),
    );
    return { ...narrowed, words, explanation: words.text };
  }
}
