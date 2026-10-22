/**
 * The shared deduction-fixpoint runner: an ordered ladder of *declared*
 * techniques that several logic games' solvers and hints share. The followable
 * guide is `docs/solver-and-generator.md` § "The deduction fixpoint".
 *
 * A logic game's generator and its explained hint are two projections of **one
 * deduction engine**: the generator runs the techniques to a fixpoint with no
 * recorder (accepting a board only when they solve it), and the hint runs the
 * *same* techniques with a recorder that captures each firing to narrate.
 * Either way the *loop* is identical — an ordered ladder, easiest first, that
 * restarts from the top the moment any technique fires ("return after first
 * firing", which keeps one firing = one hint group), stops when nothing fires
 * (or the ladder has settled), caps the ladder by tier while grading, and — on
 * the recording path only — ticks a step budget so a technique that reports
 * progress without changing the board fails loud instead of hanging, **naming
 * itself as it does**. The **techniques stay per-game** (a nonogram overlap is
 * nothing like a sudoku hidden single); only the loop and its bookkeeping live
 * here.
 *
 * **It does not fit every logic game, and must not be read as though it
 * should.** The ladder *shape* is near-universal, but the bookkeeping wrapped
 * around it is per-game and often decides which puzzles exist, so a solver whose
 * loop *looks* like this one is not evidence that it is this one; the
 * differential is. Two solvers each break a promise this runner makes:
 *
 * - **Loopy** breaks *a pass attempts every technique at or below the cap*: each
 *   of its firings reports the cheapest rung that could use the new
 *   information, and the next pass skips the techniques below it.
 * - **Lightup** breaks *return after first firing*: it has no ladder, only two
 *   techniques interleaved per cell inside one grid scan whose order decides
 *   which boards generate.
 *
 * That list is re-derived whenever this contract changes, never carried forward
 * (`docs/solver-and-generator.md` § "Where the fixpoint does not fit").
 *
 * **A conditionally-available technique guards itself in `run` and returns `0`**
 * (Unruly's `unique` variant; Spokes' look-ahead that runs at *exactly* Tricky).
 * This runner grows no `when` predicate, deliberately: it would be
 * indistinguishable from returning `0` and would exist only to document, which
 * is how a runner becomes a configuration language.
 *
 * The callers are `latinSolverTop` and a comment-stripped scan for
 * `runDeductionFixpoint` under `src/games/`. A game adopting this runner ships a
 * ladder census (`engine/testing/ladder-census.ts`), because a
 * fixture corpus certifies only the rungs it fires: deleting one of Tracks'
 * eight rungs entirely left every one of its tests green, since that rung fires
 * on no board its generator produces.
 */
import { HintFrontier } from "./hint-frontier.ts";
import { type StepBudget, StepBudgetExceeded } from "./step-budget.ts";

/**
 * One rung of a game's deduction ladder, **declared rather than anonymous**.
 * Declaring `tier` decouples the grade from the rung's position, so techniques
 * need not map one-to-one onto tiers (Unruly has five across three); declaring
 * `id` gives the ladder names a reader can see and a runaway loop can be blamed
 * on.
 */
export interface DeductionTechnique {
  /**
   * Stable, greppable name — `"single-gap"`, `"wall-parity"`. Appears in the
   * step-budget's non-termination error, so it should name the technique the
   * way the game's own docs and narrations do.
   */
  id: string;
  /**
   * The difficulty tier this technique belongs to, in the game's own tier
   * numbering. Several techniques may share a tier; a tier need not be the
   * technique's position in the ladder, and grading never uses that position.
   */
  tier: number;
  /**
   * Apply the technique once from the current board and report the outcome as a
   * signed number, mirroring the per-game solvers' `-1 / 0 / >0` convention:
   * - `> 0` — fired (changed the board). The runner restarts the ladder from the
   *   top and takes this technique's `tier` as a grade candidate.
   * - `0` — nothing to do; the runner falls through to the next technique.
   * - `< 0` — proved the board inconsistent; the runner stops with
   *   `impossible: true`.
   *
   * On the recording (hint) path a technique also records its firing as a side
   * effect (through the game's own recorder / plan array); the runner is
   * oblivious to it.
   */
  run: () => number;
  /**
   * Every firing this technique could make from the current board, for a hint
   * plan that continues where its latest steps were rather than taking the
   * first firing a scan meets ({@link SingleFiringOptions.frontier}). Each
   * says what it reads and writes, and `take` makes it as `run` would (writes
   * the board, records the firing). `"contradiction"` where `run` would return
   * `< 0`.
   *
   * Only the recording path reads it, and only with a frontier; the fixpoint
   * and a plan without one run `run`. A technique whose search is dear may
   * offer just the firing `run` would make.
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

/** A firing a technique could make now, offered to a hint plan's frontier. */
export interface LadderCandidate {
  /** The elements its premise reads, by the frontier's key. */
  reads(): readonly number[];
  /** The elements it writes, which a later step continues from. */
  writes(): readonly number[];
  /** Make the firing: write the board and record it. */
  take(): void;
}

/**
 * Per-rung firing counts, keyed by {@link DeductionTechnique.id}.
 *
 * Counts rather than a set of ids, because the step budget's non-termination
 * attribution needs *how many* — "a runaway technique holds ~the whole budget
 * against its name" — and a census that only needs membership reads the keys.
 * One map serves both; two would be two things to keep in step.
 */
export type FiringTally = Map<string, number>;

export interface DeductionFixpointOptions {
  /**
   * The ladder, easiest first. A pass tries the techniques in order and
   * restarts from the first the moment one fires.
   */
  techniques: readonly DeductionTechnique[];
  /**
   * Highest `tier` to attempt (inclusive). Caps the ladder while grading a tier
   * a cheaper technique already decides — no point paying for the expensive top
   * technique on a board a cheaper tier rejects anyway. Defaults to no cap.
   *
   * It **excludes by tier, not by position**: a cheap technique placed after an
   * expensive one still runs under a low cap. That is the honest reading of
   * "this technique belongs to Easy", and it is why a ladder whose tiers are not
   * monotonically increasing is legal here.
   */
  maxTier?: number;
  /**
   * The grade returned when no technique ever fires (the floor / "simple"
   * difficulty). Defaults to `0`.
   */
  baseGrade?: number;
  /**
   * The recording-path step budget, ticked once per outer iteration. Present
   * only on the hint/recording path; the generator/solve path omits it and runs
   * unguarded (and byte-for-byte unchanged).
   */
  budget?: StepBudget;
  /**
   * A caller-supplied tally the runner writes each firing into, keyed by
   * {@link DeductionTechnique.id} — **how a caller observes which rungs a board
   * actually reached.** Nothing in a game's own results says which rungs are
   * reachable, so a corpus that walks the ladder (`ladder-census.ts`)
   * needs this census.
   *
   * **A sink rather than a returned value, deliberately.** This runner is called
   * *inside* a game's solver, so a tally on {@link DeductionFixpointResult}
   * would have to be threaded back out through each game's own return shape,
   * each widened for a reader that is not the game. A sink passes straight
   * through in one line.
   *
   * **Omit it and the runner allocates nothing**, which is the generator path's
   * standing rule. When a `budget` is present the runner needs a tally anyway
   * for non-termination attribution; supplying one here means both read the same
   * map, so a budget trip on a recording path is attributed through the caller's
   * own census.
   */
  firings?: FiringTally;
  /**
   * Run once before each technique attempt — e.g. `latinSolverTop` bumps its
   * firing-group id here so every record of one firing shares a `group`. Not
   * called for a technique the tier cap excludes.
   */
  beforeTechnique?: (technique: DeductionTechnique) => void;
  /**
   * Optional early-out, checked at the top of every iteration (after the budget
   * tick, before any technique): return `true` when **the ladder should stop
   * because there is nothing left for it to do**. Deliberately broader than
   * "solved": Undead stops on a *contradiction* (`anyEmpty`), Clusters on
   * complete-or-invalid, and Spokes also when the action budget its own
   * `DIFF_LIMITED` tier imposes is spent.
   *
   * Checking at the top (not after a firing) also means a technique is never run
   * on an already-settled board, so it can't manufacture a spurious step.
   */
  settled?: () => boolean;
}

export interface DeductionFixpointResult {
  /** The highest `tier` that fired, or `baseGrade` if none did. */
  grade: number;
  /** A technique reported a contradiction (returned `< 0`). */
  impossible: boolean;
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
          : "no technique fired (the early-out or the caller's tick, not a technique)";
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
 * proves the board inconsistent. Both the fixpoint and {@link singleFirings}
 * are this pass repeated; they differ only in when they stop repeating it.
 */
function firstFiring(
  opts: DeductionFixpointOptions,
  firings: FiringTally | null,
): DeductionTechnique | null | "contradiction" {
  const { techniques, maxTier, beforeTechnique } = opts;
  for (const technique of techniques) {
    if (maxTier !== undefined && technique.tier > maxTier) continue;
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
  const { techniques, maxTier, beforeTechnique } = opts;
  const admitted = techniques.filter((t) => maxTier === undefined || t.tier <= maxTier);
  let contradiction = false;
  type Offered = LadderCandidate & { technique: DeductionTechnique };
  const asked = new Map<number, readonly Offered[]>();
  const ask = (k: number): readonly Offered[] => {
    const seen = asked.get(k);
    if (seen) return seen;
    const technique = admitted[k];
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
      if (technique.fallback || admitted[j].prerequisite) stalled = ask(j).length === 0;
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
      const k = admitted.findIndex((_, j) => contradiction || ask(j).length > 0);
      ceiling = k < 0 ? Number.NEGATIVE_INFINITY : admitted[k].tier;
    }
    return ceiling;
  };
  const rungs = admitted.map(
    (technique, k) => () => (technique.tier > tierNow() ? [] : ask(k)),
  );
  const taken = frontier.takeContinuing(rungs, () => contradiction);
  if (contradiction) return "contradiction";
  if (taken === null) return null;
  firings.set(taken.technique.id, (firings.get(taken.technique.id) ?? 0) + 1);
  return taken.technique;
}

/**
 * Run the ordered techniques to a fixpoint (see the module doc). Returns the
 * reached grade and whether a technique proved the board inconsistent; callers
 * handle `impossible` first (the reported `grade` is meaningless then).
 */
export function runDeductionFixpoint(
  opts: DeductionFixpointOptions,
): DeductionFixpointResult {
  const { baseGrade = 0, settled } = opts;
  let grade = baseGrade;
  // A tally exists only where a caller asked for one or a budget needs one, so
  // the generator path allocates nothing and runs the loop it always ran.
  const firings = opts.firings ?? (opts.budget ? new Map<string, number>() : null);
  const budget =
    opts.budget && firings ? attributingBudget(opts.budget, firings) : undefined;

  for (;;) {
    budget?.tick();
    if (settled?.()) break;
    const fired = firstFiring(opts, firings);
    if (fired === "contradiction") return { grade, impossible: true };
    if (fired === null) break;
    if (fired.tier > grade) grade = fired.tier;
  }

  return { grade, impossible: false };
}

/**
 * The recording path's options: the fixpoint's, less the grade floor a single
 * firing has no use for, and with the step budget required rather than
 * optional, because a hint is exactly the path that must fail loud on a
 * technique reporting progress without changing the board.
 */
export type SingleFiringOptions = Omit<
  DeductionFixpointOptions,
  "baseGrade" | "budget"
> & {
  budget: StepBudget;
  /**
   * Whether the plan stays where its work is: each call takes the firing that
   * continues from what the plan's latest firings wrote, trying the rungs in
   * order, and only with nothing continuing the first firing of the first rung
   * that has one (`hint-frontier.ts`, the owner's rule). Every technique the
   * cap admits must then declare {@link DeductionTechnique.available}. The
   * frontier is the driver's own, so each plan starts from none and two
   * identical boards hint alike.
   */
  continuing?: boolean;
};

/** The ladder, one firing per call. */
export interface SingleFirings {
  /**
   * Run the ladder from the top until one technique fires, and return it;
   * `null` when none fires, when `settled` says there is nothing left to do,
   * or once a technique has proved the board inconsistent. What the firing
   * changed is the caller's to read: its recorder, or the board itself.
   */
  next(): DeductionTechnique | null;
  /** A technique proved the board inconsistent. Sticky: `next` returns `null`
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
 * proves the hiding ran at all. A driver that skipped such firings itself
 * would hide them where nothing counts them.
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
      if (opts.settled?.()) return null;
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
