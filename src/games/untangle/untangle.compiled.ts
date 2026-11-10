// Compiled by `npm run describe` from src/games/untangle/untangle.description.yaml: edit that, not this.

import { type GridSpace, held, iadd, imul, isub } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["xnum","ynum","denom"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly xnum: Float64Array;
  readonly ynum: Float64Array;
  readonly denom: Float64Array;
};

/** What the rules read that the grid does not give: sizes,
 * relations, a set of cells for each cell, and tables, an element
 * (`-1` for none) for each of their arguments, outermost first. */
export interface Dealt {
  readonly joined: readonly (readonly number[])[];
}

export interface PlaceMove {
  readonly move: "place";
  readonly p: number;
  readonly px: number;
  readonly py: number;
  readonly pd: number;
}

/** A move: its name and its binding. */
export type Move = PlaceMove;

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

/** The definitions the game reads beside the rules, each giving the
 * cells it holds of for values of its other parameters. */
export function views(sp: GridSpace, cl: Dealt, _variations: readonly string[]): {
  readonly crossed: (p: Position, a0: number) => number[];
} {
  return {
    crossed: (p, a0) => {
      const at: number[] = [];
      for (let _c1 = 0; _c1 < sp.cells.length; _c1++) {
        let _c21: boolean = (cl.joined[a0].includes(_c1));
        if (_c21) {
          let _q2 = false;
          Q3: {
            const _a4 = sp.cells;
            for (let _i5 = 0; _i5 < _a4.length; _i5++) {
              const v_p = _a4[_i5];
              const _a6 = cl.joined[v_p];
              for (let _i7 = 0; _i7 < _a6.length; _i7++) {
                const v_q = _a6[_i7];
                if (!((((((_i5 < v_q) && (v_p !== a0)) && (v_p !== _c1)) && (v_q !== a0)) && (v_q !== _c1)))) continue;
                let _c13: boolean = (a0 < _i5);
                if (_c13) {
                  const _t8 = isub(imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  const _t9 = isub(imul(isub(imul(p.ynum[_c1], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c1])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[_c1], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c1])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  let _c12: boolean = (!((((_t8 > 0) && (_t9 > 0)) || ((_t8 < 0) && (_t9 < 0)))) && !((((isub(imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0) && (isub(imul(isub(imul(p.ynum[_c1], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c1])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[_c1], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c1])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0)) && (((iadd(imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0) && (iadd(imul(isub(imul(p.xnum[_c1], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c1])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[_c1], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c1])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0)) || ((iadd(imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))) && (iadd(imul(isub(imul(p.xnum[_c1], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c1])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[_c1], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c1])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))))))));
                  if (_c12) {
                    const _t10 = isub(imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1]))));
                    const _t11 = isub(imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1]))));
                    _c12 = !((((_t10 > 0) && (_t11 > 0)) || ((_t10 < 0) && (_t11 < 0))));
                  }
                  _c13 = _c12;
                }
                let _c20: boolean = _c13;
                if (!_c20) {
                  let _c19: boolean = (_i5 < a0);
                  if (_c19) {
                    const _t14 = isub(imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1]))));
                    const _t15 = isub(imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1]))));
                    let _c18: boolean = (!((((_t14 > 0) && (_t15 > 0)) || ((_t14 < 0) && (_t15 < 0)))) && !((((isub(imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])))) === 0) && (isub(imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])))) === 0)) && (((iadd(imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])))) < 0) && (iadd(imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])))) < 0)) || ((iadd(imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])))) > iadd(imul(isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1]))))) && (iadd(imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])))) > iadd(imul(isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1])), isub(imul(p.xnum[_c1], p.denom[a0]), imul(p.xnum[a0], p.denom[_c1]))), imul(isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1])), isub(imul(p.ynum[_c1], p.denom[a0]), imul(p.ynum[a0], p.denom[_c1]))))))))));
                    if (_c18) {
                      const _t16 = isub(imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                      const _t17 = isub(imul(isub(imul(p.ynum[_c1], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c1])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[_c1], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c1])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                      _c18 = !((((_t16 > 0) && (_t17 > 0)) || ((_t16 < 0) && (_t17 < 0))));
                    }
                    _c19 = _c18;
                  }
                  _c20 = _c19;
                }
                if (_c20) {
                  _q2 = true;
                  break Q3;
                }
              }
            }
          }
          _c21 = _q2;
        }
        if (_c21) at.push(_c1);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, _variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function placeMoves(_p: Position, _into: Move[]): void {
    // Bound over every integer: checked and played, never listed.
  }

  function placeLegal(_p: Position, m: PlaceMove): boolean {
    const v_p = m.p;
    const v_px = m.px;
    const v_py = m.py;
    const v_pd = m.pd;
    if (!(Number.isInteger(v_p) && v_p >= 0 && v_p < sp.cells.length)) return false;
    if (!Number.isSafeInteger(v_px)) return false;
    if (!Number.isSafeInteger(v_py)) return false;
    if (!Number.isSafeInteger(v_pd)) return false;
    if (!((v_pd > 0))) return false;
    return true;
  }

  function placePlay(p: Position, m: PlaceMove): Position {
    const v_p = m.p;
    const v_px = m.px;
    const v_py = m.py;
    const v_pd = m.pd;
    const q: Position = { ...p, xnum: p.xnum.slice(), ynum: p.ynum.slice(), denom: p.denom.slice() };
    {
      const v_c = v_p;
      q.xnum[v_c] = held(v_px);
      q.ynum[v_c] = held(v_py);
      q.denom[v_c] = held(v_pd);
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_a = _a3[_i4];
          const _a5 = cl.joined[v_a];
          for (let _i6 = 0; _i6 < _a5.length; _i6++) {
            const v_b = _a5[_i6];
            if (!((_i4 < v_b))) continue;
            let _q7 = true;
            Q8: {
              const _a9 = sp.cells;
              for (let _i10 = 0; _i10 < _a9.length; _i10++) {
                const v_p = _a9[_i10];
                const _a11 = cl.joined[v_p];
                for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                  const v_q = _a11[_i12];
                  if (!(((((_i4 < _i10) && (_i10 < v_q)) && (v_q !== v_b)) && (v_p !== v_b)))) continue;
                  const _t13 = isub(imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  const _t14 = isub(imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  let _c17: boolean = (!((((_t13 > 0) && (_t14 > 0)) || ((_t13 < 0) && (_t14 < 0)))) && !((((isub(imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0) && (isub(imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0)) && (((iadd(imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0) && (iadd(imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0)) || ((iadd(imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))) && (iadd(imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))))))));
                  if (_c17) {
                    const _t15 = isub(imul(isub(imul(p.ynum[v_p], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_p])), isub(imul(p.xnum[v_b], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_b]))), imul(isub(imul(p.xnum[v_p], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_p])), isub(imul(p.ynum[v_b], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_b]))));
                    const _t16 = isub(imul(isub(imul(p.ynum[v_q], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_q])), isub(imul(p.xnum[v_b], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_b]))), imul(isub(imul(p.xnum[v_q], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_q])), isub(imul(p.ynum[v_b], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_b]))));
                    _c17 = !((((_t15 > 0) && (_t16 > 0)) || ((_t15 < 0) && (_t16 < 0))));
                  }
                  if (!(!(_c17))) {
                    _q7 = false;
                    break Q8;
                  }
                }
              }
            }
            if (!(_q7)) {
              _q1 = false;
              break Q2;
            }
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
      placeMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "place": return placeLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "place": return placePlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: () => [],
  };
}
