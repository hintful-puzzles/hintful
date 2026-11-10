// Compiled by `npm run describe` from src/games/slide/slide.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["ground","field","goal","block"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly ground: Int32Array;
  readonly field: Int32Array;
  readonly goal: Int32Array;
  readonly block: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface ShiftMove {
  readonly move: "shift";
  readonly a: number;
  readonly n: number;
}

/** A move: its name and its binding. */
export type Move = ShiftMove;

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
export function rules(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function shiftMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_a = _a1[_i2];
      let _c9: boolean = (p.block[v_a] !== 0);
      if (_c9) {
        const _g3: number[] = [];
        G4: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_c = _a7[_i8];
            if (!((p.block[v_c] === p.block[v_a]))) continue;
            _g3.push(v_c);
          }
        }
        _c9 = ((_g3.length > 0 ? _g3[0] : -1) === v_a);
      }
      if (!(_c9)) continue;
      const _a10 = sp.adj4[v_a];
      for (let _i11 = 0; _i11 < _a10.length; _i11++) {
        const v_n = _a10[_i11];
        let _q12 = true;
        Q13: {
          const _a14 = sp.cells;
          for (let _i15 = 0; _i15 < _a14.length; _i15++) {
            const v_c = _a14[_i15];
            if (!((p.block[v_c] === p.block[v_a]))) continue;
            const _t16 = p.block[v_a];
            const _t17 = (((v_c % sp.w) + (v_n % sp.w)) - (v_a % sp.w));
            const _t18 = ((((v_c / sp.w) | 0) + ((v_n / sp.w) | 0)) - ((v_a / sp.w) | 0));
            if (!(((((_t17 >= 0 && _t17 < sp.w && _t18 >= 0 && _t18 < sp.h) && (p.ground[(_t18 * sp.w + _t17)] === 0)) && ((p.block[(_t18 * sp.w + _t17)] === 0) || (p.block[(_t18 * sp.w + _t17)] === _t16))) && ((p.field[(_t18 * sp.w + _t17)] === 0) || (_t16 === 1))))) {
              _q12 = false;
              break Q13;
            }
          }
        }
        if (_q12) into.push({ move: "shift", a: v_a, n: v_n });
      }
    }
  }

  function shiftLegal(p: Position, m: ShiftMove): boolean {
    const v_a = m.a;
    const v_n = m.n;
    if (!(Number.isInteger(v_a) && v_a >= 0 && v_a < sp.cells.length)) return false;
    let _c7: boolean = (p.block[v_a] !== 0);
    if (_c7) {
      const _g1: number[] = [];
      G2: {
        const _a5 = sp.cells;
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_c = _a5[_i6];
          if (!((p.block[v_c] === p.block[v_a]))) continue;
          _g1.push(v_c);
        }
      }
      _c7 = ((_g1.length > 0 ? _g1[0] : -1) === v_a);
    }
    if (!(_c7)) return false;
    if (!sp.adj4[v_a].includes(v_n)) return false;
    let _q8 = true;
    Q9: {
      const _a10 = sp.cells;
      for (let _i11 = 0; _i11 < _a10.length; _i11++) {
        const v_c = _a10[_i11];
        if (!((p.block[v_c] === p.block[v_a]))) continue;
        const _t12 = p.block[v_a];
        const _t13 = (((v_c % sp.w) + (v_n % sp.w)) - (v_a % sp.w));
        const _t14 = ((((v_c / sp.w) | 0) + ((v_n / sp.w) | 0)) - ((v_a / sp.w) | 0));
        if (!(((((_t13 >= 0 && _t13 < sp.w && _t14 >= 0 && _t14 < sp.h) && (p.ground[(_t14 * sp.w + _t13)] === 0)) && ((p.block[(_t14 * sp.w + _t13)] === 0) || (p.block[(_t14 * sp.w + _t13)] === _t12))) && ((p.field[(_t14 * sp.w + _t13)] === 0) || (_t12 === 1))))) {
          _q8 = false;
          break Q9;
        }
      }
    }
    return _q8;
  }

  function shiftPlay(p: Position, m: ShiftMove): Position {
    const v_a = m.a;
    const v_n = m.n;
    const q: Position = { ...p, block: p.block.slice() };
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!((p.block[v_c] === p.block[v_a]))) continue;
        q.block[v_c] = 0;
      }
    }
    {
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_b = _a3[_i4];
        if (!((p.block[v_b] === p.block[v_a]))) continue;
        const v_c = (((((v_b / sp.w) | 0) + ((v_n / sp.w) | 0)) - ((v_a / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_n % sp.w)) - (v_a % sp.w)));
        q.block[v_c] = p.block[v_a];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_g = _a3[_i4];
          if (!((p.goal[v_g] === 1))) continue;
          let _c12: boolean = (p.block[v_g] === 1);
          if (_c12) {
            let _c11: boolean = (p.block[v_g] !== 0);
            if (_c11) {
              const _g5: number[] = [];
              G6: {
                const _a9 = sp.cells;
                for (let _i10 = 0; _i10 < _a9.length; _i10++) {
                  const v_c = _a9[_i10];
                  if (!((p.block[v_c] === p.block[v_g]))) continue;
                  _g5.push(v_c);
                }
              }
              _c11 = ((_g5.length > 0 ? _g5[0] : -1) === v_g);
            }
            _c12 = _c11;
          }
          if (_c12) {
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
      shiftMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "shift": return shiftLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "shift": return shiftPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: () => [],
  };
}
