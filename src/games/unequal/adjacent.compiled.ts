// Compiled by `npm run describe` from src/games/unequal/adjacent.description.json: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, clueAt } from "../../engine/describe-runtime.ts";

/** The dealt clues, by kind. */
export interface Clues {
  bar: ClueList;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "adjacent" | "adjacentSet" | "latin.set" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, in the order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number }[] = [
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "adjacent", tier: 1 },
  { id: "adjacentSet", tier: 2 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Trivial","Easy","Tricky","Extreme","Recursive"];

export interface AdjacentBinding {
  L: number;
  a: number;
  b: number;
  e: number;
}

export function adjacent(b: Marks, sp: GridSpace, cl: Clues, fire: Fire<AdjacentBinding>): number {
  const facts: number[] = [];
  const _a7 = sp.cols;
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_L = _a7[_i8];
    const _a9 = sp.lineCells[v_L];
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_a = _a9[_i10];
      if (!(b.known(v_a))) continue;
      const _a11 = sp.adj4[v_a];
      for (let _i12 = 0; _i12 < _a11.length; _i12++) {
        const v_b = _a11[_i12];
        const v_e = sp.edgeOf(v_a, v_b);
        facts.length = 0;
        let _q13 = true;
        Q14: {
          for (let _m15 = b.cand(v_b); _m15 !== 0; _m15 &= _m15 - 1) {
            const v_d = 31 - Math.clz32(_m15 & -_m15);
            const _t16 = b.value(v_a);
            if (!(!(((clueAt(cl.bar, v_e) === 1) === (Math.abs((_t16 - v_d)) === 1))))) continue;
            if (b.has(v_b, v_d)) facts.push(STRIKE, v_b, v_d);
            if (!(true)) {
              _q13 = false;
              break Q14;
            }
          }
        }
        if (!(_q13)) return -1;
        if (facts.length > 0) {
          fire({ L: v_L, a: v_a, b: v_b, e: v_e }, facts);
          return 1;
        }
      }
    }
  }
  return 0;
}

export interface AdjacentSetBinding {
  L: number;
  a: number;
  b: number;
  e: number;
}

export function adjacentSet(b: Marks, sp: GridSpace, cl: Clues, fire: Fire<AdjacentSetBinding>): number {
  const facts: number[] = [];
  const _a23 = sp.cols;
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_L = _a23[_i24];
    const _a25 = sp.lineCells[v_L];
    for (let _i26 = 0; _i26 < _a25.length; _i26++) {
      const v_a = _a25[_i26];
      const _a27 = sp.adj4[v_a];
      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
        const v_b = _a27[_i28];
        const v_e = sp.edgeOf(v_a, v_b);
        facts.length = 0;
        let _q29 = true;
        Q30: {
          for (let _m31 = b.cand(v_b); _m31 !== 0; _m31 &= _m31 - 1) {
            const v_d = 31 - Math.clz32(_m31 & -_m31);
            let _q32 = false;
            Q33: {
              for (let _m34 = b.cand(v_a); _m34 !== 0; _m34 &= _m34 - 1) {
                const v_d2 = 31 - Math.clz32(_m34 & -_m34);
                if (((v_d2 !== v_d) && ((clueAt(cl.bar, v_e) === 1) === (Math.abs((v_d2 - v_d)) === 1)))) {
                  _q32 = true;
                  break Q33;
                }
              }
            }
            if (!(!(_q32))) continue;
            if (b.has(v_b, v_d)) facts.push(STRIKE, v_b, v_d);
            if (!(true)) {
              _q29 = false;
              break Q30;
            }
          }
        }
        if (!(_q29)) return -1;
        if (facts.length > 0) {
          fire({ L: v_L, a: v_a, b: v_b, e: v_e }, facts);
          return 1;
        }
      }
    }
  }
  return 0;
}
