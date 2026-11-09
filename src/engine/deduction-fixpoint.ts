/**
 * The loop every compiled ladder runs on: an ordered ladder of techniques,
 * easiest first, that restarts from the top the moment one fires ("return
 * after first firing", which keeps one firing = one hint group) and stops when
 * none does. A game's generator runs it to a fixpoint with no recorder, and
 * its hint runs the same techniques one firing at a time with a recorder
 * (docs/solver-and-generator.md § "One engine, two projections").
 *
 * **It takes only a ladder `ladder-runtime.ts` built** from a game's compiled
 * description ({@link CompiledTechniques}), so a ladder a game writes by hand
 * does not typecheck. A game reaches it through `runLadder` and `ladderWalk`;
 * which techniques run, at which caps and graded on which scale, is the
 * runtime's, from the compiled module.
 *
 * On the recording path a step budget ticks once a firing, so a technique
 * that reports progress without changing the board fails loud instead of
 * hanging, **naming itself as it does**.
 */
import { HintFrontier } from "./hint-frontier.ts";
import { type StepBudget, StepBudgetExceeded } from "./step-budget.ts";

/**
 * One technique of a ladder, as the runner runs it. `ladder-runtime.ts`
 * makes one from each entry of a compiled module's ladder.
 */
export interface DeductionTechnique {
  /** The technique's id in its description. Appears in the step budget's
   * non-termination error. */
  id: string;
  /** Its tier, in the description's tiers or its scale's. A continuing plan
   * takes no firing of a higher tier than the first the ladder's order would
   * make. */
  tier: number;
  /**
   * Apply the technique once from the current marks and report the outcome:
   * - `> 0` — fired (changed the marks). The runner restarts the ladder from
   *   the top.
   * - `0` — nothing to do; the runner falls through to the next technique.
   * - `< 0` — proved the marks inconsistent; the runner stops.
   */
  run: () => number;
  /**
   * Every firing this technique could make from the current marks, for a
   * hint plan that continues where its latest steps were rather than taking
   * the first firing a scan meets ({@link SingleFiringOptions.continuing}).
   * Each says what it reads and writes, and `take` makes it. `"contradiction"`
   * where `run` would return `< 0`.
   */
  available?: () => readonly LadderCandidate[] | "contradiction";
  /**
   * The technique's premise presumes that every rung before it has nothing to
   * do, so a plan that continues asks it only then. Taking the first firing,
   * the ladder's order already makes it so; a frontier weighs every rung's
   * firings at once, and would take this one beside its work while a cheaper
   * rung elsewhere still fires (Tents draws a link only for a step nothing
   * else can make).
   */
  fallback?: boolean;
  /**
   * Every rung after this one presumes it has nothing left to do, so a plan
   * that continues asks them only once it has none: it keeps a board's
   * bookkeeping current, and a later rung read before it caught up would
   * conclude from a stale board (Tracks: a square with a track side is a
   * track square, which every line count reads).
   */
  prerequisite?: boolean;
}

declare const compiledLadder: unique symbol;

/**
 * A ladder the runner takes: one `ladder-runtime.ts` made from a compiled
 * module's techniques, with a Search after them where a game has one no
 * description states (`withSearch`). The brand is a type alone, given only
 * there, so the runner refuses a list of techniques a game built itself.
 */
export type CompiledTechniques = readonly DeductionTechnique[] & {
  readonly [compiledLadder]: true;
};

/** A firing a technique could make now, offered to a hint plan's frontier. */
export interface LadderCandidate {
  /** The elements its premise reads, by the frontier's key. */
  reads(): readonly number[];
  /** The elements it writes, which a later step continues from. */
  writes(): readonly number[];
  /** Make the firing: write the marks and record it. */
  take(): void;
}

/**
 * Per-technique firing counts, keyed by {@link DeductionTechnique.id}.
 *
 * Counts rather than a set of ids, because the step budget's non-termination
 * attribution needs *how many* — "a runaway technique holds ~the whole budget
 * against its name" — and a census that only needs membership reads the keys.
 */
export type FiringTally = Map<string, number>;

export interface DeductionFixpointOptions {
  /** The ladder, easiest first. A pass tries the techniques in order and
   * restarts from the first the moment one fires. */
  techniques: CompiledTechniques;
  /**
   * The recording-path step budget, ticked once per outer iteration. Present
   * only on the hint/recording path; the generator path omits it and runs
   * unguarded.
   */
  budget?: StepBudget;
  /**
   * A caller-supplied tally the runner writes each firing into: **how a
   * caller observes which techniques a board reached** (`ladder-census.ts`).
   * Omit it and the runner allocates nothing, which is the generator path's
   * standing rule. Where a `budget` is present the runner needs a tally anyway
   * for non-termination attribution, and supplying one here means both read
   * the same map.
   */
  firings?: FiringTally;
  /** Run once before each technique attempt: `runLadder` opens the firing's
   * group there. */
  beforeTechnique?: (technique: DeductionTechnique) => void;
}

/**
 * Wrap the recording path's budget so that tripping it answers the question
 * `stepBudget`'s message asks — *"a hint rule is reporting progress without
 * changing the board?"* — by naming the techniques, by firing count, most-fired
 * first. A runaway technique holds ~the whole budget against its name;
 * everything honest has a handful.
 *
 * Only `tick()` is wrapped, not the ladder: a `StepBudgetExceeded` thrown from
 * *inside* a technique (a game whose deduction runs its own budgeted sub-solve)
 * belongs to that budget and must pass through unattributed.
 */
function attributingBudget(
  budget: StepBudget,
  firings: ReadonlyMap<string, number>,
): StepBudget {
  return {
    tick(): void {
      try {
        budget.tick();
      } catch (e) {
        if (!(e instanceof StepBudgetExceeded)) throw e;
        const byCount = [...firings].sort((a, b) => b[1] - a[1]);
        const tally = byCount.length
          ? byCount.map(([id, n]) => `${id} ×${n}`).join(", ")
          : "no technique fired (the caller's tick, not a technique)";
        throw new StepBudgetExceeded(`${e.message} Techniques by firings: ${tally}.`, {
          cause: e,
        });
      }
    },
  };
}

/**
 * One pass down the ladder, easiest first, stopping at the first technique that
 * fires: that technique, `null` when none does, or `"contradiction"` when one
 * proves the marks inconsistent. Both the fixpoint and {@link singleFirings}
 * are this pass repeated; they differ only in when they stop repeating it.
 */
function firstFiring(
  opts: DeductionFixpointOptions,
  firings: FiringTally | null,
): DeductionTechnique | null | "contradiction" {
  const { techniques, beforeTechnique } = opts;
  for (const technique of techniques) {
    beforeTechnique?.(technique);
    const ret = technique.run();
    if (ret < 0) return "contradiction";
    if (ret > 0) {
      firings?.set(technique.id, (firings.get(technique.id) ?? 0) + 1);
      return technique;
    }
  }
  return null;
}

/**
 * The firing the frontier takes: of every technique's {@link
 * DeductionTechnique.available} firings, the one continuing from the plan's
 * latest firings, rung order breaking ties. A rung's firings are asked for only
 * when the frontier reaches it, so a dear rung costs nothing while an easier one
 * continues.
 */
function continuingFiring(
  opts: SingleFiringOptions,
  frontier: HintFrontier<number>,
  firings: FiringTally,
): DeductionTechnique | null | "contradiction" {
  const { techniques, beforeTechnique } = opts;
  let contradiction = false;
  type Offered = LadderCandidate & { technique: DeductionTechnique };
  const asked = new Map<number, readonly Offered[]>();
  const ask = (k: number): readonly Offered[] => {
    const seen = asked.get(k);
    if (seen) return seen;
    const technique = techniques[k];
    const { available } = technique;
    if (!available)
      throw new Error(
        `deduction-fixpoint: "${technique.id}" declares no available(), which a plan with a frontier needs`,
      );
    let list: readonly Offered[] = [];
    // A fallback is asked only once every rung before it has nothing, and
    // any rung only once each prerequisite before it has nothing.
    let stalled = true;
    for (let j = 0; j < k && stalled && !contradiction; j++)
      if (technique.fallback || techniques[j].prerequisite)
        stalled = ask(j).length === 0;
    if (stalled && !contradiction) {
      beforeTechnique?.(technique);
      const offered = available();
      if (offered === "contradiction") contradiction = true;
      else list = offered.map((candidate) => ({ ...candidate, technique }));
    }
    asked.set(k, list);
    return list;
  };
  // The tier the ladder's own order would fire at: no firing harder than that
  // is taken for continuing, so a plan never teaches harder reasoning than the
  // board needs where it stands.
  let ceiling: number | null = null;
  const tierNow = (): number => {
    if (ceiling === null) {
      const k = techniques.findIndex((_, j) => contradiction || ask(j).length > 0);
      ceiling = k < 0 ? Number.NEGATIVE_INFINITY : techniques[k].tier;
    }
    return ceiling;
  };
  const rungs = techniques.map(
    (technique, k) => () => (technique.tier > tierNow() ? [] : ask(k)),
  );
  const taken = frontier.takeContinuing(rungs, () => contradiction);
  if (contradiction) return "contradiction";
  if (taken === null) return null;
  firings.set(taken.technique.id, (firings.get(taken.technique.id) ?? 0) + 1);
  return taken.technique;
}

/**
 * Run the ordered techniques to a fixpoint, and say whether a technique
 * proved the marks inconsistent.
 */
export function runDeductionFixpoint(opts: DeductionFixpointOptions): {
  impossible: boolean;
} {
  // A tally exists only where a caller asked for one or a budget needs one, so
  // the generator path allocates nothing.
  const firings = opts.firings ?? (opts.budget ? new Map<string, number>() : null);
  const budget =
    opts.budget && firings ? attributingBudget(opts.budget, firings) : undefined;
  for (;;) {
    budget?.tick();
    const fired = firstFiring(opts, firings);
    if (fired === "contradiction") return { impossible: true };
    if (fired === null) return { impossible: false };
  }
}

/**
 * The recording path's options: the fixpoint's, with the step budget required
 * rather than optional, because a hint is exactly the path that must fail loud
 * on a technique reporting progress without changing the board.
 */
export type SingleFiringOptions = Omit<DeductionFixpointOptions, "budget"> & {
  budget: StepBudget;
  /**
   * Whether the plan stays where its work is: each call takes the firing that
   * continues from what the plan's latest firings wrote, trying the rungs in
   * order, and only with nothing continuing the first firing of the first rung
   * that has one (`hint-frontier.ts`, the owner's rule). Every technique must
   * then declare {@link DeductionTechnique.available}. The frontier is the
   * driver's own, so each plan starts from none and two identical boards hint
   * alike.
   */
  continuing?: boolean;
};

/** The ladder, one firing per call. */
export interface SingleFirings {
  /**
   * Run the ladder from the top until one technique fires, and return it;
   * `null` when none fires, or once a technique has proved the marks
   * inconsistent. What the firing changed is the caller's to read: its
   * recorder, or the marks themselves.
   */
  next(): DeductionTechnique | null;
  /** A technique proved the marks inconsistent. Sticky: `next` returns `null`
   * from then on. */
  impossible(): boolean;
}

/**
 * The **recording projection's** driver: the same ladder as
 * {@link runDeductionFixpoint}, stopping after every firing so that one firing
 * is one hint step (docs/hints.md § "Recording the deduction").
 *
 * **Every firing is returned, including one that changed nothing the player
 * can see.** Whether a firing is worth a step is the plan loop's question
 * (`deduceHintPlan`'s `showable`), not the driver's: a firing hidden there
 * still advances the board and is counted in `hidden`, which is how a test
 * proves the hiding ran at all.
 *
 * The tally behind the budget's attribution lives as long as the driver, not
 * one call, so a technique that runs away across many calls is still named.
 */
export function singleFirings(opts: SingleFiringOptions): SingleFirings {
  const firings = opts.firings ?? new Map<string, number>();
  const budget = attributingBudget(opts.budget, firings);
  let impossible = false;
  // A ladder's elements are the game's own numbers, so the key is the number.
  const frontier = opts.continuing ? new HintFrontier<number>((i) => i) : null;
  return {
    next(): DeductionTechnique | null {
      if (impossible) return null;
      budget.tick();
      const fired = frontier
        ? continuingFiring(opts, frontier, firings)
        : firstFiring(opts, firings);
      if (fired !== "contradiction") return fired;
      impossible = true;
      return null;
    },
    impossible: () => impossible,
  };
}
