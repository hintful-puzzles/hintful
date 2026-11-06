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
      for (let _c20 = 0; _c20 < sp.cells.length; _c20++) {
        let _c40: boolean = (cl.joined[a0].includes(_c20));
        if (_c40) {
          let _q21 = false;
          Q22: {
            const _a23 = sp.cells;
            for (let _i24 = 0; _i24 < _a23.length; _i24++) {
              const v_p = _a23[_i24];
              const _a25 = cl.joined[v_p];
              for (let _i26 = 0; _i26 < _a25.length; _i26++) {
                const v_q = _a25[_i26];
                if (!((((((_i24 < v_q) && (v_p !== a0)) && (v_p !== _c20)) && (v_q !== a0)) && (v_q !== _c20)))) continue;
                let _c32: boolean = (a0 < _i24);
                if (_c32) {
                  const _t27 = isub(imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  const _t28 = isub(imul(isub(imul(p.ynum[_c20], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c20])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[_c20], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c20])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  let _c31: boolean = (!((((_t27 > 0) && (_t28 > 0)) || ((_t27 < 0) && (_t28 < 0)))) && !((((isub(imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0) && (isub(imul(isub(imul(p.ynum[_c20], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c20])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[_c20], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c20])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0)) && (((iadd(imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0) && (iadd(imul(isub(imul(p.xnum[_c20], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c20])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[_c20], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c20])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0)) || ((iadd(imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))) && (iadd(imul(isub(imul(p.xnum[_c20], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c20])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[_c20], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c20])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))))))));
                  if (_c31) {
                    const _t29 = isub(imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20]))));
                    const _t30 = isub(imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20]))));
                    _c31 = !((((_t29 > 0) && (_t30 > 0)) || ((_t29 < 0) && (_t30 < 0))));
                  }
                  _c32 = _c31;
                }
                let _c39: boolean = _c32;
                if (!_c39) {
                  let _c38: boolean = (_i24 < a0);
                  if (_c38) {
                    const _t33 = isub(imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20]))));
                    const _t34 = isub(imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20]))));
                    let _c37: boolean = (!((((_t33 > 0) && (_t34 > 0)) || ((_t33 < 0) && (_t34 < 0)))) && !((((isub(imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])))) === 0) && (isub(imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])))) === 0)) && (((iadd(imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])))) < 0) && (iadd(imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])))) < 0)) || ((iadd(imul(isub(imul(p.xnum[v_p], p.denom[a0]), imul(p.xnum[a0], p.denom[v_p])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.ynum[v_p], p.denom[a0]), imul(p.ynum[a0], p.denom[v_p])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])))) > iadd(imul(isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20]))))) && (iadd(imul(isub(imul(p.xnum[v_q], p.denom[a0]), imul(p.xnum[a0], p.denom[v_q])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.ynum[v_q], p.denom[a0]), imul(p.ynum[a0], p.denom[v_q])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])))) > iadd(imul(isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20])), isub(imul(p.xnum[_c20], p.denom[a0]), imul(p.xnum[a0], p.denom[_c20]))), imul(isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20])), isub(imul(p.ynum[_c20], p.denom[a0]), imul(p.ynum[a0], p.denom[_c20]))))))))));
                    if (_c37) {
                      const _t35 = isub(imul(isub(imul(p.ynum[a0], p.denom[v_p]), imul(p.ynum[v_p], p.denom[a0])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[a0], p.denom[v_p]), imul(p.xnum[v_p], p.denom[a0])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                      const _t36 = isub(imul(isub(imul(p.ynum[_c20], p.denom[v_p]), imul(p.ynum[v_p], p.denom[_c20])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[_c20], p.denom[v_p]), imul(p.xnum[v_p], p.denom[_c20])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                      _c37 = !((((_t35 > 0) && (_t36 > 0)) || ((_t35 < 0) && (_t36 < 0))));
                    }
                    _c38 = _c37;
                  }
                  _c39 = _c38;
                }
                if (_c39) {
                  _q21 = true;
                  break Q22;
                }
              }
            }
          }
          _c40 = _q21;
        }
        if (_c40) at.push(_c20);
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
      let _q3 = true;
      Q4: {
        const _a5 = sp.cells;
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_a = _a5[_i6];
          const _a7 = cl.joined[v_a];
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_b = _a7[_i8];
            if (!((_i6 < v_b))) continue;
            let _q9 = true;
            Q10: {
              const _a11 = sp.cells;
              for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                const v_p = _a11[_i12];
                const _a13 = cl.joined[v_p];
                for (let _i14 = 0; _i14 < _a13.length; _i14++) {
                  const v_q = _a13[_i14];
                  if (!(((((_i6 < _i12) && (_i12 < v_q)) && (v_q !== v_b)) && (v_p !== v_b)))) continue;
                  const _t15 = isub(imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  const _t16 = isub(imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))));
                  let _c19: boolean = (!((((_t15 > 0) && (_t16 > 0)) || ((_t15 < 0) && (_t16 < 0)))) && !((((isub(imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0) && (isub(imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) === 0)) && (((iadd(imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0) && (iadd(imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) < 0)) || ((iadd(imul(isub(imul(p.xnum[v_a], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_a])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_a], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_a])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))) && (iadd(imul(isub(imul(p.xnum[v_b], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_b])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_b], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_b])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])))) > iadd(imul(isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q])), isub(imul(p.xnum[v_q], p.denom[v_p]), imul(p.xnum[v_p], p.denom[v_q]))), imul(isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q])), isub(imul(p.ynum[v_q], p.denom[v_p]), imul(p.ynum[v_p], p.denom[v_q]))))))))));
                  if (_c19) {
                    const _t17 = isub(imul(isub(imul(p.ynum[v_p], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_p])), isub(imul(p.xnum[v_b], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_b]))), imul(isub(imul(p.xnum[v_p], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_p])), isub(imul(p.ynum[v_b], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_b]))));
                    const _t18 = isub(imul(isub(imul(p.ynum[v_q], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_q])), isub(imul(p.xnum[v_b], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_b]))), imul(isub(imul(p.xnum[v_q], p.denom[v_a]), imul(p.xnum[v_a], p.denom[v_q])), isub(imul(p.ynum[v_b], p.denom[v_a]), imul(p.ynum[v_a], p.denom[v_b]))));
                    _c19 = !((((_t17 > 0) && (_t18 > 0)) || ((_t17 < 0) && (_t18 < 0))));
                  }
                  if (!(!(_c19))) {
                    _q9 = false;
                    break Q10;
                  }
                }
              }
            }
            if (!(_q9)) {
              _q3 = false;
              break Q4;
            }
          }
        }
      }
      if (!(_q3)) return false;
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
