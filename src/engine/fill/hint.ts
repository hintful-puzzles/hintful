/**
 * A fill game's hint, built from its board: the compiled ladder walked from
 * the player's own values and marks, a step a firing, each worded by what the
 * description's `says` states (`engine/hint/described-firing-hint.ts`). The
 * walk begins at the lowest tier that finishes the board as dealt, so a hint
 * teaches what the board needs. No game writes a hook
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 5).
 *
 * A step decides values: the firing hint reads a firing's `PLACE` facts, so a
 * technique that only marks a cell (Tents' link) is not hinted from here yet.
 */

import type { HintStep, RulesOut } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import {
  describedFiringHint,
  type FiringHint,
  type FiringHintParts,
} from "../hint/described-firing-hint.ts";
import type { DescribedRulesOut } from "../hint/described-rules-out.ts";
import type { Clauses } from "../hint/stated.ts";
import { describedLadder } from "../solve/ladder-runtime.ts";
import { asDealt } from "./answer.ts";
import {
  type FillBoard,
  type LadderedFillModule,
  marksOf,
  solveBoard,
} from "./board.ts";
import { applyEdit, type Edit } from "./edit.ts";

/** A square a step decides, and the value it asks. */
export interface FillTarget extends Point {
  readonly value: number;
}

export type FillHint = FiringHint<FillTarget>;

/** What the hint reads of a fill game's compiled module beside its ladder. */
export interface FillHintModule<C> extends LadderedFillModule<C> {
  /** Every kind of step a firing can be. */
  readonly SAYS_KINDS: readonly string[];
  readonly STATED?: Readonly<
    Record<
      string,
      { readonly step?: readonly Clauses[]; readonly fact?: readonly Clauses[] }
    >
  >;
  readonly SAYS_EACH?: readonly string[];
  readonly SAYS_LEGS?: readonly string[];
  readonly RULES_OUT?: DescribedRulesOut;
}

/** A fill game's `Game.hint`, but for its legend of marks, and what a
 * placement rules out where the description says. */
export interface FillHintHooks<C>
  extends FiringHintParts<FillBoard<C>, Edit, FillHint, string> {
  readonly rungs: readonly string[];
  /** The squares the step's move sets, in order: the engine clicks each with
   * the button whose verb keeps the step on track. */
  targets(board: FillBoard<C>, move: Edit, step: HintStep<Edit, FillHint>): Point[];
}

export function fillHint<C extends object>(
  module: FillHintModule<C>,
): { hint: FillHintHooks<C>; rulesOut?: RulesOut<FillBoard<C>, Edit> } {
  // A board's tier is its deal's, which no move changes: every board of one
  // game shares its `dealt`.
  const lowest = new WeakMap<C, number>();
  const tierOf = (board: FillBoard<C>): number => {
    const known = lowest.get(board.dealt);
    if (known !== undefined) return known;
    const top = module.tiers.length - 1;
    const dealt = asDealt(board);
    let tier = 0;
    while (tier < top && solveBoard(module, dealt, tier).verdict !== "solved") tier++;
    lowest.set(board.dealt, tier);
    return tier;
  };

  const described = describedFiringHint<
    FillBoard<C>,
    Edit,
    FillTarget,
    Record<string, never>,
    string
  >({
    name: "fill hint",
    walk(board) {
      const { marks, ok } = marksOf(module, board);
      if (!ok) return null;
      return { marks, entries: describedLadder(module, board.dealt as never).entries };
    },
    tiers: { lowest: tierOf, count: module.tiers.length },
    ...(module.SAYS_EACH === undefined ? {} : { each: module.SAYS_EACH }),
    ...(module.SAYS_LEGS === undefined ? {} : { legs: module.SAYS_LEGS }),
    ...(module.RULES_OUT === undefined ? {} : { rulesOut: module.RULES_OUT }),
    width: (b) => b.w,
    size: (b) => b.values.length,
    valueAt: (b, c) => b.values[c],
    execute: (b, m) => applyEdit(module, b, m),
    // Every move is an edit, and one the step does not ask for is judged off.
    foreign: () => false,
    target: (at, n) => ({ ...at, value: n }),
    want: (t) => t.value,
    move: (targets, b) => ({ set: targets.flatMap((t) => [t.y * b.w + t.x, t.value]) }),
    ...(module.STATED === undefined ? {} : { stated: module.STATED }),
    say: {},
  });
  return {
    hint: {
      ...described.hint,
      rungs: module.SAYS_KINDS,
      targets: (b, move) => {
        const set = move.set ?? [];
        const out: Point[] = [];
        for (let i = 0; i < set.length; i += 2)
          out.push({ x: set[i] % b.w, y: Math.floor(set[i] / b.w) });
        return out;
      },
    },
    ...(described.rulesOut === undefined ? {} : { rulesOut: described.rulesOut }),
  };
}
