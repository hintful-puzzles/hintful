/**
 * What a placement rules out, from the description (`Game.rulesOut`): the
 * techniques the description's `rulesOut` names are run on the board after the
 * move, and the move brings the conclusions of the firings that read a square
 * it placed. The game writes no `bring` of its own, so the marks cannot drift
 * from the rule the hint and the solver run (docs/descriptions.md
 * § "What a placement rules out").
 *
 * A firing that reads no placed square is not the move's, though it concludes
 * the same squares: an older placement's, which the player has left open, is
 * not marked again. A square the move itself changed is never brought: the
 * player has just decided it. A technique that finds the marks inconsistent
 * brings nothing, since a firing on a broken board proves nothing a player
 * could read off.
 */

import type { RulesOut } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import type { CellMarks } from "../solve/cell-marks.ts";
import { PLACE } from "../solve/describe-runtime.ts";
import type { LadderEntry } from "../solve/ladder-runtime.ts";
import { stepBudget } from "../solve/step-budget.ts";
import { premiseOf } from "./described-hint.ts";

/** The compiled module's `RULES_OUT`. */
export interface DescribedRulesOut {
  readonly name: string;
  /** The value a placement gives a square, as the description reads it. */
  readonly placing: number;
  readonly techniques: readonly string[];
}

/** What a game supplies to build `Game.rulesOut` from its description. */
export interface RulesOutSpec<State, Move, Target extends Point> {
  /** A name for the walk's step budget. */
  name: string;
  /** The state as the description's marks, and the ladder (every tier). */
  walk(
    state: State,
    cap: number,
  ): { marks: CellMarks; entries: readonly LadderEntry[] } | null;
  width(state: State): number;
  size(state: State): number;
  /** The value a cell holds as the description reads it, 0 for none. */
  valueAt(state: State, cell: number): number;
  target(at: Point, n: number): Target;
  move(targets: readonly Target[], state: State): Move;
}

/** `Game.rulesOut` of a game whose description states `rulesOut`. */
export function describedRulesOut<State, Move, Target extends Point>(
  rulesOut: DescribedRulesOut,
  spec: RulesOutSpec<State, Move, Target>,
): RulesOut<State, Move> {
  return {
    name: rulesOut.name,
    bring(before, after) {
      const placed = new Set<number>();
      const changed = new Set<number>();
      for (let c = 0; c < spec.size(after); c++) {
        const was = spec.valueAt(before, c);
        const now = spec.valueAt(after, c);
        if (was === now) continue;
        changed.add(c);
        if (now === rulesOut.placing) placed.add(c);
      }
      if (placed.size === 0) return null;
      const walked = spec.walk(after, Number.MAX_SAFE_INTEGER);
      if (walked === null) return null;
      const { marks, entries } = walked;
      marks.budget = stepBudget(spec.name);
      const brought = new Map<number, number>();
      for (const id of rulesOut.techniques) {
        const entry = entries.find((e) => e.id === id);
        if (entry === undefined) throw new Error(`${spec.name}: no technique ${id}`);
        const firings = entry.run.firings(marks);
        if (firings === "contradiction") return null;
        for (const firing of firings) {
          if (!premiseOf({ ...firing, entry }).some((c) => placed.has(c))) continue;
          for (let i = 0; i < firing.facts.length; i += 3) {
            const cell = firing.facts[i + 1];
            if (firing.facts[i] === PLACE && !changed.has(cell))
              brought.set(cell, firing.facts[i + 2]);
          }
        }
      }
      if (brought.size === 0) return null;
      const w = spec.width(after);
      const targets = [...brought]
        .sort(([a], [b]) => a - b)
        .map(([cell, value]) =>
          spec.target({ x: cell % w, y: Math.floor(cell / w) }, value),
        );
      return spec.move(targets, after);
    },
  };
}
