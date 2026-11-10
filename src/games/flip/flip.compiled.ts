// Compiled by `npm run describe` from src/games/flip/flip.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["grid"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly grid: Int32Array;
};

/** What the rules read that the grid does not give: sizes,
 * relations, a set of cells for each cell, and tables, an element
 * (`-1` for none) for each of their arguments, outermost first. */
export interface Dealt {
  readonly flips: readonly (readonly number[])[];
}

export interface PressMove {
  readonly move: "press";
  readonly c: number;
}

/** A move: its name and its binding. */
export type Move = PressMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = never;

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = [];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(_sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(_sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, _variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function pressMoves(_p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_c = _a1[_i2];
      if (!((cl.flips[v_c].length > 0))) continue;
      into.push({ move: "press", c: v_c });
    }
  }

  function pressLegal(_p: Position, m: PressMove): boolean {
    const v_c = m.c;
    if (!(Number.isInteger(v_c) && v_c >= 0 && v_c < sp.cells.length)) return false;
    if (!((cl.flips[v_c].length > 0))) return false;
    return true;
  }

  function pressPlay(p: Position, m: PressMove): Position {
    const v_c = m.c;
    const q: Position = { ...p, grid: p.grid.slice() };
    {
      const _a1 = cl.flips[v_c];
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_d = _a1[_i2];
        q.grid[v_d] = (1 - p.grid[v_d]);
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.grid[v_c] === 0))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      if (!(_q1)) return false;
    }
    return true;
  }

  function lost(_p: Position): boolean {
    return false;
  }

  // The description states no claim: nothing is a proved dead end.
  const deadEnd = (_p: Position): DeadEndId | null => null;

  return {
    moves: (p) => {
      const into: Move[] = [];
      pressMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "press": return pressLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "press": return pressPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: () => [],
  };
}
