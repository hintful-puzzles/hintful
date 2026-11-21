/**
 * **The walk a game's own hint test takes**: from a position, ask the plan,
 * play its steps, ask again, until the board is done, the plan has nothing, or
 * the asks run out. A test is the visitor it hands the walk, the stop rule it
 * needs and the limit it pins.
 *
 * `hint-walk.ts` is the cross-game guards' walk, through a midend; this one is
 * a state and a plan, with nothing between them, so a test can walk any
 * position, the game's internal firings included (`walkPlan`), or the
 * contract's steps (`walkHint`).
 *
 * Dev/test-only; never imported by production code.
 */
import type { HintResult, HintStep } from "../contract/game.ts";
import type { GameStatus } from "../contract/types.ts";

/** Why a walk ended. */
export type PlanWalkEnd =
  /** `done` held: the board is solved, or the test's own stop rule. */
  | "done"
  /** The plan had no step. */
  | "empty"
  /** The plan refused, with `refuse: "stop"`. */
  | "refused"
  /** `asks` plans were asked and the board is not done. */
  | "limit";

export interface PlanWalkResult<State> {
  /** The position the walk stopped at. */
  readonly state: State;
  readonly end: PlanWalkEnd;
  /** Steps played, across every plan. */
  readonly steps: number;
  /** Plans asked. */
  readonly asks: number;
  /** Why the plan refused, where the walk ended `"refused"`. */
  readonly refusal: string | null;
}

export interface PlanWalkVisitor<State, Step> {
  /** Each position a plan is asked at, before it is asked. */
  asked?(state: State, ask: number): void;
  /** Each plan, before its first step is played. */
  planned?(steps: readonly Step[], state: State, ask: number): void;
  /** Each step once played, with the positions either side; `index` counts
   * steps across the whole walk. */
  step?(step: Step, before: State, after: State, index: number): void;
}

export interface PlanWalk<State, Step> extends PlanWalkVisitor<State, Step> {
  /** The plan at `state`: its steps, or why it refused. */
  plan(state: State): readonly Step[] | { refused: string };
  apply(state: State, step: Step): State;
  /** Whether the walk is over at `state`, checked before each ask. */
  done(state: State): boolean;
  /** How many plans are asked, at most. */
  asks: number;
  /** What a refusal does: fail the walk (the default), or end it. */
  refuse?: "throw" | "stop";
  /** What an exhausted limit does: end the walk (the default), or fail it. */
  limit?: "stop" | "throw";
  /** The board, named in each error the walk throws. */
  label?: string;
}

/** Walk `walk.plan` from `start`. A refusal throws unless `refuse` is
 * `"stop"`; so does a visitor's own throw. */
export function walkPlan<State, Step>(
  start: State,
  walk: PlanWalk<State, Step>,
): PlanWalkResult<State> {
  let state = start;
  let steps = 0;
  let asks = 0;
  const fail = (why: string) =>
    new Error(walk.label === undefined ? why : `${walk.label}: ${why}`);
  const end = (why: PlanWalkEnd, refusal: string | null = null) => ({
    state,
    end: why,
    steps,
    asks,
    refusal,
  });
  for (;;) {
    if (walk.done(state)) return end("done");
    if (asks === walk.asks) {
      if (walk.limit === "throw")
        throw fail(`the walk asked ${asks} plans and is not done`);
      return end("limit");
    }
    walk.asked?.(state, asks);
    const plan = walk.plan(state);
    asks++;
    if ("refused" in plan) {
      if (walk.refuse === "stop") return end("refused", plan.refused);
      throw fail(`the plan refused after ${steps} steps: ${plan.refused}`);
    }
    if (plan.length === 0) return end("empty");
    walk.planned?.(plan, state, asks - 1);
    for (const step of plan) {
      const before = state;
      state = walk.apply(state, step);
      walk.step?.(step, before, state, steps);
      steps++;
    }
  }
}

/** What `walkHint` reads of a game. */
export interface HintWalkable<State, Move, Ui, Highlights, Rung extends string> {
  readonly hint: {
    plan(state: State, aux?: string, ui?: Ui): HintResult<Move, Highlights, Rung>;
  };
  executeMove(state: State, move: Move): State;
  status(state: State): GameStatus;
  findMistakes?(state: State): readonly unknown[];
}

export interface HintWalk<State, Move, Ui, Highlights, Rung extends string>
  extends PlanWalkVisitor<State, HintStep<Move, Highlights, Rung>>,
    Pick<
      PlanWalk<State, HintStep<Move, Highlights, Rung>>,
      "asks" | "refuse" | "limit" | "label"
    > {
  /** Over at `state`, besides solved (`validateBoard`, a test's own). */
  done?(state: State): boolean;
  /** Passed to every `plan`. */
  aux?: string;
  /** The `ui` every `plan` is asked with, given the position. */
  ui?(state: State): Ui;
  /** Play only each plan's first step and ask again: the recomputed hint a
   * player meets pressing Hint after every move. `planned` still sees each
   * whole plan. */
  first?: boolean;
  /** Fail a step after which `findMistakes` finds a mistake: the answer
   * check a hint test makes of every step it plays. */
  mistakes?: boolean;
}

/** Walk `game`'s hint from `start`: `walkPlan` over `game.hint.plan`, playing
 * each step's move with `executeMove`, until the board is solved. */
export function walkHint<State, Move, Ui, Highlights, Rung extends string>(
  game: HintWalkable<State, Move, Ui, Highlights, Rung>,
  start: State,
  walk: HintWalk<State, Move, Ui, Highlights, Rung>,
): PlanWalkResult<State> & { readonly solved: boolean } {
  type Step = HintStep<Move, Highlights, Rung>;
  let ask = 0;
  const result = walkPlan<State, Step>(start, {
    asks: walk.asks,
    refuse: walk.refuse,
    limit: walk.limit,
    label: walk.label,
    done: (s) => game.status(s) === "solved" || (walk.done?.(s) ?? false),
    plan(s) {
      const r = game.hint.plan(s, walk.aux, walk.ui?.(s));
      if (!r.ok) return { refused: r.error };
      // `planned` sees the whole plan, `first` or not.
      if (r.steps.length > 0) walk.planned?.(r.steps, s, ask);
      ask++;
      return walk.first ? r.steps.slice(0, 1) : r.steps;
    },
    apply: (s, step) => game.executeMove(s, step.move),
    asked: walk.asked,
    step(step, before, after, index) {
      if (walk.mistakes) {
        const found = game.findMistakes?.(after) ?? [];
        if (found.length > 0) {
          const why = `step ${index} made a mistake: ${step.explanation} ${JSON.stringify(found)}`;
          throw new Error(walk.label === undefined ? why : `${walk.label}: ${why}`);
        }
      }
      walk.step?.(step, before, after, index);
    },
  });
  return { ...result, solved: game.status(result.state) === "solved" };
}
