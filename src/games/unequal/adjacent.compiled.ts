// Compiled by `npm run describe` from src/games/unequal/adjacent.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, clueAt } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, and its clues by kind. */
export interface Dealt {
  bar: ClueList;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "adjacent" | "adjacentSet" | "latin.set" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, and the cap from which it no longer runs where it has one, in the
 * order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number }[] = [
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

const adjacentFacts: number[] = [];
let adjacentCands = new Int32Array(0);

export function adjacent(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<AdjacentBinding> | null): number {
  const facts = adjacentFacts;
  let fired = 0;
  let changed = false;
  if (adjacentCands.length < sp.cells.length) adjacentCands = new Int32Array(sp.cells.length);
  const cands = adjacentCands;
  cands.fill(-1);
  const _a7 = sp.cols;
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_L = _a7[_i8];
    const _a9 = sp.lineCells[v_L];
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_a = _a9[_i10];
      const _h11 = b.known(v_a);
      const _h17 = b.value(v_a);
      if (!(_h11)) continue;
      const _a12 = sp.adj4[v_a];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_b = _a12[_i13];
        const v_e = sp.edgeOf(v_a, v_b);
        const _h18 = clueAt(cl.bar, v_e);
        const _h19 = (_h18 === 1);
        facts.length = 0;
        changed = false;
        let _q14 = true;
        Q15: {
          for (let _m16 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cand(v_b))); _m16 !== 0; _m16 &= _m16 - 1) {
            const v_d = 31 - Math.clz32(_m16 & -_m16);
            if (!(!((_h19 === (Math.abs((_h17 - v_d)) === 1))))) continue;
            if (b.has(v_b, v_d)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
            if (!(true)) {
              _q14 = false;
              break Q15;
            }
          }
        }
        if (!(_q14)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, a: v_a, b: v_b, e: v_e }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface AdjacentSetBinding {
  L: number;
  a: number;
  b: number;
  e: number;
}

const adjacentSetFacts: number[] = [];
let adjacentSetCands = new Int32Array(0);

export function adjacentSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<AdjacentSetBinding> | null): number {
  const facts = adjacentSetFacts;
  let fired = 0;
  let changed = false;
  if (adjacentSetCands.length < sp.cells.length) adjacentSetCands = new Int32Array(sp.cells.length);
  const cands = adjacentSetCands;
  cands.fill(-1);
  const _a26 = sp.cols;
  for (let _i27 = 0; _i27 < _a26.length; _i27++) {
    const v_L = _a26[_i27];
    const _a28 = sp.lineCells[v_L];
    for (let _i29 = 0; _i29 < _a28.length; _i29++) {
      const v_a = _a28[_i29];
      const _a30 = sp.adj4[v_a];
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_b = _a30[_i31];
        const v_e = sp.edgeOf(v_a, v_b);
        const _h38 = clueAt(cl.bar, v_e);
        const _h39 = (_h38 === 1);
        facts.length = 0;
        changed = false;
        let _q32 = true;
        Q33: {
          for (let _m34 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cand(v_b))); _m34 !== 0; _m34 &= _m34 - 1) {
            const v_d = 31 - Math.clz32(_m34 & -_m34);
            let _q35 = false;
            Q36: {
              for (let _m37 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cand(v_a))); _m37 !== 0; _m37 &= _m37 - 1) {
                const v_d2 = 31 - Math.clz32(_m37 & -_m37);
                if (((v_d2 !== v_d) && (_h39 === (Math.abs((v_d2 - v_d)) === 1)))) {
                  _q35 = true;
                  break Q36;
                }
              }
            }
            if (!(!(_q35))) continue;
            if (b.has(v_b, v_d)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
            if (!(true)) {
              _q32 = false;
              break Q33;
            }
          }
        }
        if (!(_q32)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, a: v_a, b: v_b, e: v_e }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}
