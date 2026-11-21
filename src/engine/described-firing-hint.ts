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
 * and the words: its module's `STATED`, the clauses its description states,
 * and for a technique that states none, a sentence as a function of the
 * technique's terms and the squares its step marks. Nothing here is about a
 * puzzle.
 *
 * Cell games only: a fact is a placement of a value on a cell.
 */

import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
  MoveVerdict,
  RulesOut,
} from "./contract/game.ts";
import { DEDUCTION_EXHAUSTED } from "./contract/hint-refusal.ts";
import { changedCells, trackLeg, trackTargets } from "./contract/hint-track.ts";
import { CELL, type MarkKind, type Sentence } from "./contract/hint-words.ts";
import type { Point } from "./contract/types.ts";
import { DEFAULT_PLAN, filledBy, premiseOf, spokenOf } from "./described-hint.ts";
import { type DescribedRulesOut, describedRulesOut } from "./described-rules-out.ts";
import { type Judging, judgeWalked } from "./move-judge.ts";
import type { PairIndex } from "./render/piece.ts";
import { PLACE } from "./solve/describe-runtime.ts";
import {
  type CellMarks,
  type LadderEntry,
  ladderWalk,
  TIERS,
} from "./solve/ladder-runtime.ts";
import { stepBudget } from "./solve/step-budget.ts";
import { type Clauses, statedSentence } from "./stated.ts";

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
  /** The wording that held, where the technique states several. */
  wording?: number;
  terms: object;
  marks: SaidMarks;
  /** What each square the firing decides has of its own (`says.fact`), by
   * fact, in the order of the firing's facts. */
  facts?: readonly { terms: object; marks: SaidMarks; wording?: number }[];
}

interface SaidMarks {
  outline?: readonly number[];
  stripes?: readonly number[];
  strand?: readonly number[];
  reads?: readonly number[];
}

/** What a sentence is built from: the technique's terms (and, where it has
 * arms, which arm held, so narrowing on `arm` narrows `terms`), and the squares
 * its step marks. `targets` are the squares the firing decides; `outline` is
 * what the technique outlines less those and less `strand`, which is drawn
 * apart; `stripes` is the line it hatches. Where a technique reads what each
 * square has of its own (`says.fact`), `outline`, `stripes` and `strand` hold
 * the firing's with those of the squares the step is about, and `facts` has
 * each of those squares with its own terms. */
type FiringSpoken<S> = S extends { terms: infer T }
  ? {
      terms: T;
      arm: S extends { arm: infer A } ? A : undefined;
      facts: readonly {
        at: Point;
        terms: S extends { facts: readonly (infer F)[] }
          ? F extends { terms: infer FT }
            ? FT
            : never
          : undefined;
      }[];
      targets: readonly Point[];
      outline: readonly Point[];
      stripes: readonly Point[];
      strand: readonly Point[];
      /** Whether this step continues the firing's first (`says.shown: legs`). */
      later: boolean;
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
   * recompute yields the next batch; {@link DEFAULT_PLAN} where left out. */
  plan?: number;
  /** The techniques whose step is made for each square the firing decides
   * (`says.shown: each`): the compiled module's `SAYS_EACH`. */
  each?: readonly string[];
  /** Of those, the techniques whose steps after the first continue it
   * (`continuesPrevious`), and are said as a later leg (`later`): the compiled
   * module's `SAYS_LEGS`. */
  legs?: readonly string[];
  /** Whether the squares a firing's placing techniques decide are shown and
   * made with it. `false` where they are what the board already shows: a bulb
   * lights its lines, and a player does not cross each. Default `true`. */
  consequences?: boolean;
  /** What a step's highlights hold, where it is more than the targets and the
   * strand. */
  highlights?(marked: Marked<Target>, state: State): H;
  /** The description's `rulesOut`, the compiled module's `RULES_OUT`: the
   * game then has `Game.rulesOut` from the hooks, built from the same walk
   * (`described-rules-out.ts`). */
  rulesOut?: DescribedRulesOut;
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
  /** Each kind of step's words as the description states them: the compiled
   * module's `STATED`. A technique none of whose kinds it states is said by
   * `say`. */
  stated?: Readonly<
    Record<
      string,
      { readonly step?: readonly Clauses[]; readonly fact?: readonly Clauses[] }
    >
  >;
  /** The terms whose squares a stated clause draws on a mark kind of their
   * own, apart from the step's squares, by name: Mosaic's clue drawn as its
   * block, Range's as its clue. A term is a cell to the description, so how
   * one is drawn is the game's. */
  termKinds?: Readonly<Record<string, MarkKind<Point>>>;
  /** The number a square shows, for a stated clause's `{each}`. */
  shows?(state: State, at: Point): number;
  /** The member of the two-state pair a number term names, for a stated
   * clause's `{piece term}`. */
  piece?(n: number): PairIndex;
  /** A number term as the board draws it; its numeral where absent. */
  value?(n: number, state: State): string;
  /** The sentences the description cannot state, each technique's an override
   * of the stated form, with a comment saying why; the state is the board's
   * numbers and the like. */
  say: {
    [K in keyof Says & string]?: (
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
        /** The move that makes these targets (`state` for a game whose move
         * names a cell by its place in a board of a width). */
        move(targets: readonly Target[], state: State): Move;
        journey?: never;
      }
    | { journey: Journey<Move, Target, State>; move?: never }
  );

/** The part of a game's hint (`Game.hint`) its description builds: the game
 * spreads it and adds what only it knows, its marks and its targets. */
export interface FiringHintParts<State, Move, H, Kind extends string> {
  plan(state: State): HintResult<Move, H, Kind>;
  /** What Check & save says of the last move. */
  judgeMove(before: State, after: State): MoveVerdict | null;
  /** Judges a move against a step of any kind: the kind is no part of it. */
  keepTrack(m: Move, step: HintStep<Move, H>, state: State): HintTrackVerdict;
  /** A step the player has already made some of (undo and redo move the board
   * under a shown step) is shown for what is left, or `null` where nothing is. */
  refreshStep(step: HintStep<Move, H>, state: State): HintStep<Move, H> | null;
}

/** What a game takes from its description: its hint's part, and what a
 * placement rules out where the spec has the description's. */
export interface DescribedFiringHint<
  State,
  Move,
  Target extends Point,
  Kind extends string,
  H extends { targets: Target[] } = FiringHint<Target>,
> {
  hint: FiringHintParts<State, Move, H, Kind>;
  rulesOut?: RulesOut<State, Move>;
}

/** A line of squares by its noun, for a stated clause's `{unit}`. */
const lineName = (els: readonly Point[]): string =>
  els[0]?.y === els[1]?.y ? "row" : "column";

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
    ((spoken: unknown, state: State) => Sentence) | undefined
  >;
  const stated = spec.stated ?? {};
  const { shows } = spec;
  // A technique is stated or overridden, never both: an override beside a
  // stated kind would silently win or lose by the order of a lookup.
  for (const id of Object.keys(say))
    if (Object.keys(stated).some((k) => k === id || k.startsWith(`${id}.`)))
      throw new Error(`${spec.name}: ${id} is both stated and overridden`);

  /** The steps of the firings the ladder makes from `state` at tier `cap`.
   * Judging a move, the walk is aimed at its facts and runs until `judging`
   * says they are made, past the plan's length. */
  const plan = spec.plan ?? DEFAULT_PLAN;
  const stepsAt = (state: State, cap: number, judging?: Judging): Step[] => {
    const walked = spec.walk(state, cap);
    if (walked === null) return [];
    const { marks: m, entries } = walked;
    const w = spec.width(state);
    const pointOf = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
    m.budget = stepBudget(spec.name);
    const walk = ladderWalk(
      m,
      entries,
      { [TIERS]: cap },
      premiseOf,
      judging ? { aim: judging.aim } : {},
    );
    if (judging)
      judging.traced = walk.trace(() => {
        const again = spec.walk(state, cap)?.marks ?? m;
        again.budget = stepBudget(spec.name);
        return again;
      });
    const steps: Step[] = [];
    for (let fired = 0; judging ? !judging.done(m) : fired < plan; fired++) {
      const before = m.grid.slice();
      const known = walk.graph.facts.length;
      const firstStep = steps.length;
      const f = walk.next();
      if (f === null || f === "contradiction") break;
      const { says } = spokenOf<SaysOf>(f);
      const kind = (
        says.arm === undefined ? f.entry.id : `${f.entry.id}.${says.arm}`
      ) as Kind;
      // The squares the firing decides, still open as it found them.
      const decided: Target[] = [];
      const seen = new Set<number>();
      const own = new Map<
        number,
        { terms: object; marks: SaidMarks; wording?: number }
      >();
      for (let i = 0; i < f.facts.length; i += 3) {
        const c = f.facts[i + 1];
        if (f.facts[i] !== PLACE || before[c] !== 0 || seen.has(c)) continue;
        seen.add(c);
        decided.push(spec.target(pointOf(c), f.facts[i + 2]));
        const fact = says.facts?.[i / 3];
        if (fact !== undefined) own.set(c, fact);
      }
      // The squares its placing techniques went on to decide.
      const followed: Target[] = [];
      if (spec.consequences !== false)
        for (let c = 0; c < m.grid.length; c++)
          if (before[c] === 0 && m.grid[c] !== 0 && !seen.has(c))
            followed.push(spec.target(pointOf(c), m.grid[c]));
      const followedCells = new Set(followed.map((t) => t.y * w + t.x));
      // A step for the firing, or one for each square it decides, which is then
      // the only square the evidence is taken less.
      const each = spec.each?.includes(f.entry.id) === true;
      // A judged move quotes one step alone, so every leg is said as a first.
      const continued = !judging && spec.legs?.includes(f.entry.id) === true;
      for (const [leg, group] of (each
        ? decided.map((t) => [t])
        : [decided]
      ).entries()) {
        const targets = [...group, ...followed];
        const fills = new Set(each ? group.map((t) => t.y * w + t.x) : filledBy(f));
        // What the squares of this step have of their own joins the firing's.
        const squares = group.map((t) => t.y * w + t.x);
        const marksOf = (role: "outline" | "stripes" | "strand"): number[] => [
          ...new Set([
            ...(says.marks[role] ?? []),
            ...squares.flatMap((c) => own.get(c)?.marks[role] ?? []),
          ]),
        ];
        const stripes = marksOf("stripes");
        const strand = marksOf("strand").filter((c) => !fills.has(c));
        const outline = marksOf("outline").filter(
          (c) => !fills.has(c) && !strand.includes(c),
        );
        const bare = (t: Point): Point => ({ x: t.x, y: t.y });
        // A kind states its step, or what each square it decides has of its
        // own (a fact), which only a step for one square can speak.
        const factClauses = stated[kind]?.fact;
        if (factClauses !== undefined && group.length !== 1)
          throw new Error(
            `${spec.name}: ${kind} states its facts, so its step is for one square (each)`,
          );
        // A step for one square reads that square's own terms, whether the
        // fact or the step states the clauses (Clusters' `own`).
        const ownFact = group.length === 1 ? own.get(squares[0]) : undefined;
        const clauses =
          stated[kind]?.step?.[says.wording ?? 0] ??
          (factClauses === undefined ? undefined : factClauses[ownFact?.wording ?? 0]);
        const override = say[f.entry.id];
        if (clauses === undefined && override === undefined)
          throw new Error(`${spec.name}: ${kind} is neither stated nor overridden`);
        const words =
          clauses !== undefined
            ? statedSentence(clauses, {
                kind: CELL,
                later: continued && leg > 0,
                ...(spec.termKinds === undefined ? {} : { termKinds: spec.termKinds }),
                at: pointOf,
                ring: group.map(bare),
                placing: (n: number) =>
                  group.filter((t) => spec.want(t) === n).map(bare),
                consequences: followed.map(bare),
                marks: {
                  // What a step reasons from is not what its placing
                  // techniques drag along.
                  outline: outline.filter((c) => !followedCells.has(c)).map(pointOf),
                  stripes: stripes.map(pointOf),
                  strand: strand.map(pointOf),
                },
                terms: {
                  ...(says.terms as Record<string, unknown>),
                  ...(ownFact?.terms as Record<string, unknown> | undefined),
                },
                value: (n) => spec.value?.(n, state) ?? String(n),
                ...(spec.piece === undefined ? {} : { piece: spec.piece }),
                ...(shows === undefined
                  ? {}
                  : { shows: (p: Point) => shows(state, p) }),
                unit: lineName,
              })
            : (override as NonNullable<typeof override>)(
                {
                  terms: says.terms,
                  arm: says.arm,
                  facts: group.map((t) => ({
                    at: bare(t),
                    terms: own.get(t.y * w + t.x)?.terms,
                  })),
                  targets: group.map(bare),
                  outline: outline.map(pointOf),
                  stripes: stripes.map(pointOf),
                  strand: strand.map(pointOf),
                  later: continued && leg > 0,
                  at: pointOf,
                  consequences: followed.map(bare),
                  placing: (n: number) =>
                    group.filter((t) => spec.want(t) === n).map(bare),
                },
                state,
              );
        const marked: Marked<Target> = {
          targets,
          outline: outline.map(pointOf),
          stripes: stripes.map(pointOf),
          strand: strand.map(pointOf),
        };
        const highlights = (
          spec.highlights
            ? spec.highlights(marked, state)
            : { targets, strand: marked.strand }
        ) as H;
        const step = { rung: kind, explanation: words.text, words, highlights };
        if (spec.journey === undefined) {
          steps.push({
            ...step,
            move: spec.move(targets, state),
            ...(continued && leg > 0 ? { continuesPrevious: true } : {}),
          });
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
      judging?.took(walk.graph, known, f.entry.name, steps.length > firstStep);
    }
    return steps;
  };

  const judgeMove = (before: State, after: State): MoveVerdict | null => {
    const cap = spec.tiers ? spec.tiers.count - 1 : Number.MAX_SAFE_INTEGER;
    return judgeWalked(
      before,
      after,
      (state) => spec.walk(state, cap)?.marks ?? null,
      (judging) => stepsAt(before, cap, judging),
    );
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

  const { rulesOut, move } = spec;
  const described: FiringHintParts<State, Move, H, Kind> = {
    plan: hint,
    judgeMove,
    // The squares the move changed must be ones the step asks for, set as it
    // asks; the step then shrinks to the squares not yet set. A journey's leg
    // is judged by its own squares, and the step does not shrink.
    keepTrack: (m, step, state) => {
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
        Object.assign(step, narrowedTo(step, left, state));
      }
      return verdict;
    },
    refreshStep: (step, state) => {
      const hl = step.highlights;
      if (!hl || spec.journey !== undefined) return step;
      const w = spec.width(state);
      const left = hl.targets.filter(
        (t) => spec.valueAt(state, t.y * w + t.x) !== spec.want(t),
      );
      if (left.length === 0) return null;
      return left.length === hl.targets.length
        ? step
        : { ...step, ...narrowedTo(step, left, state) };
    },
  };
  return {
    hint: described,
    ...(rulesOut && move
      ? { rulesOut: describedRulesOut(rulesOut, { ...spec, move }) }
      : {}),
  };

  /** What `step` becomes where only the targets `left` are still to make: its
   * move, its highlights and its words, which count their ringed squares. */
  function narrowedTo(
    step: HintStep<Move, H>,
    left: Target[],
    state: State,
  ): Pick<HintStep<Move, H>, "move" | "highlights" | "words" | "explanation"> {
    const narrowed = {
      move: spec.move?.(left, state) ?? step.move,
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
