// Compiled by `npm run describe` from src/games/numgame/numgame.description.yaml: edit that, not this.

import { type GridSpace, held } from "../../engine/describe-runtime.ts";
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
    const _a5 = sp.cells;
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_a = _a5[_i6];
      const _a7 = sp.cells;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_b = _a7[_i8];
        if (!(((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (_i6 < _i8)))))) continue;
        into.push({ move: "add", a: v_a, b: v_b });
      }
    }
  }

  function addLegal(p: Position, m: AddMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!(((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (v_a < v_b)))))) return false;
    return true;
  }

  function addPlay(p: Position, m: AddMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held((BigInt(p.value[v_a]) + BigInt(p.value[v_b])));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function subtractMoves(p: Position, into: Move[]): void {
    const _a13 = sp.cells;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_a = _a13[_i14];
      const _a15 = sp.cells;
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_b = _a15[_i16];
        if (!((((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (_i14 < _i16)))) && (BigInt(p.value[v_a]) > BigInt(p.value[v_b]))))) continue;
        into.push({ move: "subtract", a: v_a, b: v_b });
      }
    }
  }

  function subtractLegal(p: Position, m: SubtractMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (v_a < v_b)))) && (BigInt(p.value[v_a]) > BigInt(p.value[v_b]))))) return false;
    return true;
  }

  function subtractPlay(p: Position, m: SubtractMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held((BigInt(p.value[v_a]) - BigInt(p.value[v_b])));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function multiplyMoves(p: Position, into: Move[]): void {
    const _a21 = sp.cells;
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_a = _a21[_i22];
      const _a23 = sp.cells;
      for (let _i24 = 0; _i24 < _a23.length; _i24++) {
        const v_b = _a23[_i24];
        if (!(((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (_i22 < _i24)))))) continue;
        into.push({ move: "multiply", a: v_a, b: v_b });
      }
    }
  }

  function multiplyLegal(p: Position, m: MultiplyMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!(((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (v_a < v_b)))))) return false;
    return true;
  }

  function multiplyPlay(p: Position, m: MultiplyMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held((BigInt(p.value[v_a]) * BigInt(p.value[v_b])));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function divideMoves(p: Position, into: Move[]): void {
    const _a29 = sp.cells;
    for (let _i30 = 0; _i30 < _a29.length; _i30++) {
      const v_a = _a29[_i30];
      const _a31 = sp.cells;
      for (let _i32 = 0; _i32 < _a31.length; _i32++) {
        const v_b = _a31[_i32];
        if (!((((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (_i30 < _i32)))) && ((BigInt(p.value[v_a]) % BigInt(p.value[v_b])) === 0n)))) continue;
        into.push({ move: "divide", a: v_a, b: v_b });
      }
    }
  }

  function divideLegal(p: Position, m: DivideMove): boolean {
    const v_a = m.a;
    const v_b = m.b;
    if (!(v_a >= 0 && v_a < sp.cells.length)) return false;
    if (!(v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((((v_a !== v_b) && (BigInt(p.value[v_a]) > 0n)) && (BigInt(p.value[v_b]) > 0n)) && ((BigInt(p.value[v_a]) > BigInt(p.value[v_b])) || ((BigInt(p.value[v_a]) === BigInt(p.value[v_b])) && (v_a < v_b)))) && ((BigInt(p.value[v_a]) % BigInt(p.value[v_b])) === 0n)))) return false;
    return true;
  }

  function dividePlay(p: Position, m: DivideMove): Position {
    const v_a = m.a;
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_a;
      q.value[v_c] = held((BigInt(p.value[v_a]) / BigInt(p.value[v_b])));
    }
    {
      const v_c = v_b;
      q.value[v_c] = 0;
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q33 = false;
      Q34: {
        const _a35 = sp.cells;
        for (let _i36 = 0; _i36 < _a35.length; _i36++) {
          const v_c = _a35[_i36];
          if ((BigInt(p.value[v_c]) === BigInt(cl.target))) {
            _q33 = true;
            break Q34;
          }
        }
      }
      if (!(_q33)) return false;
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
