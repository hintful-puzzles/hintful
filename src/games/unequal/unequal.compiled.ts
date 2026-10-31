// Compiled by `npm run describe` from src/games/unequal/unequal.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, and its clues by kind. */
export interface Dealt {
  greater: ClueList;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "sign" | "latin.set" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, and the cap from which it no longer runs where it has one, in the
 * order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number }[] = [
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "sign", tier: 1 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Trivial","Easy","Tricky","Extreme","Recursive"];

export interface SignBinding {
  k: number;
  big: number;
  small: number;
}

const signFacts: number[] = [];
let signCands = new Int32Array(0);

export function sign(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SignBinding> | null): number {
  const facts = signFacts;
  let fired = 0;
  let changed = false;
  if (signCands.length < sp.cells.length) signCands = new Int32Array(sp.cells.length);
  const cands = signCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.greater.at.length; v_k++) {
    const v_big = cl.greater.v[v_k];
    const _t3 = cl.greater.at[v_k];
    const _t4 = cl.greater.v[v_k];
    const v_small = (sp.edgeEnds[2 * _t3] === _t4 ? sp.edgeEnds[2 * _t3 + 1] : sp.edgeEnds[2 * _t3]);
    facts.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      for (let _m7 = b.domain; _m7 !== 0; _m7 &= _m7 - 1) {
        const v_d = 31 - Math.clz32(_m7 & -_m7);
        let _q8 = true;
        Q9: {
          for (let _m10 = (cands[v_small] >= 0 ? cands[v_small] : (cands[v_small] = b.cand(v_small))); _m10 !== 0; _m10 &= _m10 - 1) {
            const v_d2 = 31 - Math.clz32(_m10 & -_m10);
            if (!((v_d <= v_d2))) {
              _q8 = false;
              break Q9;
            }
          }
        }
        let _c11 = !(_q8);
        if (!_c11) {
          if (b.has(v_big, v_d)) { if (fire === null) { b.strikeAt(v_big, v_d); changed = true; } else facts.push(STRIKE, v_big, v_d); }
          _c11 = true;
        }
        let _c16 = _c11;
        if (_c16) {
          let _q12 = true;
          Q13: {
            for (let _m14 = (cands[v_big] >= 0 ? cands[v_big] : (cands[v_big] = b.cand(v_big))); _m14 !== 0; _m14 &= _m14 - 1) {
              const v_d2 = 31 - Math.clz32(_m14 & -_m14);
              if (!((v_d >= v_d2))) {
                _q12 = false;
                break Q13;
              }
            }
          }
          let _c15 = !(_q12);
          if (!_c15) {
            if (b.has(v_small, v_d)) { if (fire === null) { b.strikeAt(v_small, v_d); changed = true; } else facts.push(STRIKE, v_small, v_d); }
            _c15 = true;
          }
          _c16 = _c15;
        }
        if (!(_c16)) {
          _q5 = false;
          break Q6;
        }
      }
    }
    if (!(_q5)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, big: v_big, small: v_small }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
