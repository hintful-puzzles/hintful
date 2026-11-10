// Compiled by `npm run describe` from src/games/numgame/numgame.description.yaml: edit that, not this.

import { type GridSpace, held, iadd, idiv, imod, imul, isub } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["value"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly value: Float64Array;
};

/** What the rules read that the grid does not give: sizes,
 * relations, a set of cells for each cell, and tables, an element
 * (`-1` for none) for each of their arguments, outermost first. */
export interface Dealt {
  readonly target: number;
}

export interface AddMove {
  readonly move: "add";
  readonly a: number;
  readonly b: number;
}

export interface SubtractMove {
  readonly move: "subtract";
  readonly a: number;
  readonly b: number;
}

export interface MultiplyMove {
  readonly move: "multiply";
  readonly a: number;
  readonly b: number;
}

export interface DivideMove {
  readonly move: "divide";
  readonly a: number;
  readonly b: number;
}

/** A move: its name and its binding. */
export type Move = AddMove | SubtractMove | MultiplyMove | DivideMove;

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
  function addMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_a = _a1[_i2];
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_b = _a3[_i4];
        if (!(((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (_i2 < _i4)))))) continue;
        into.push({ move: "add", a: v_a, b: v_b });
      }
    }
  }

  function addLegal(p: Position, m: AddMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(Number.isInteger(v_a) && v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!(((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (v_a < v_b)))))) return false;
    return true;
  }

  function addPlay(p: Position, m: AddMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held(iadd(p.value[v_a], p.value[v_b]));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function subtractMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_a = _a1[_i2];
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_b = _a3[_i4];
        if (!((((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (_i2 < _i4)))) && (p.value[v_a] > p.value[v_b])))) continue;
        into.push({ move: "subtract", a: v_a, b: v_b });
      }
    }
  }

  function subtractLegal(p: Position, m: SubtractMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(Number.isInteger(v_a) && v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (v_a < v_b)))) && (p.value[v_a] > p.value[v_b])))) return false;
    return true;
  }

  function subtractPlay(p: Position, m: SubtractMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held(isub(p.value[v_a], p.value[v_b]));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function multiplyMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_a = _a1[_i2];
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_b = _a3[_i4];
        if (!(((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (_i2 < _i4)))))) continue;
        into.push({ move: "multiply", a: v_a, b: v_b });
      }
    }
  }

  function multiplyLegal(p: Position, m: MultiplyMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(Number.isInteger(v_a) && v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!(((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (v_a < v_b)))))) return false;
    return true;
  }

  function multiplyPlay(p: Position, m: MultiplyMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held(imul(p.value[v_a], p.value[v_b]));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function divideMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_a = _a1[_i2];
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_b = _a3[_i4];
        if (!((((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (_i2 < _i4)))) && (imod(p.value[v_a], p.value[v_b]) === 0)))) continue;
        into.push({ move: "divide", a: v_a, b: v_b });
      }
    }
  }

  function divideLegal(p: Position, m: DivideMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(Number.isInteger(v_a) && v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((((v_a !== v_b) && (p.value[v_a] > 0)) && (p.value[v_b] > 0)) && ((p.value[v_a] > p.value[v_b]) || ((p.value[v_a] === p.value[v_b]) && (v_a < v_b)))) && (imod(p.value[v_a], p.value[v_b]) === 0)))) return false;
    return true;
  }

  function dividePlay(p: Position, m: DivideMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held(idiv(p.value[v_a], p.value[v_b]));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if ((p.value[v_c] === cl.target)) {
            _q1 = true;
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
      addMoves(p, into);
      subtractMoves(p, into);
      multiplyMoves(p, into);
      divideMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "add": return addLegal(p, m);
        case "subtract": return subtractLegal(p, m);
        case "multiply": return multiplyLegal(p, m);
        case "divide": return divideLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "add": return addPlay(p, m);
        case "subtract": return subtractPlay(p, m);
        case "multiply": return multiplyPlay(p, m);
        case "divide": return dividePlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: () => [],
  };
}
