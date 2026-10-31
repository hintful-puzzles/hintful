// Compiled by `npm run describe` from src/games/salad/salad.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its clues by kind, and
 * the sizes a technique reads that the grid does not give. */
export interface Dealt {
  border: ClueList;
  ball: ClueList;
  nums: number;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "border" | "latin.hiddenSingle" | "latin.single" | "latin.set" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, and the cap from which it no longer runs where it has one, in the
 * order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number }[] = [
  { id: "border", tier: 0 },
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "latin.set", tier: 1 },
  { id: "latin.fish", tier: 1 },
  { id: "latin.wing", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

export interface BorderBinding {
  k: number;
  L: readonly number[];
  H: number;
  f: number;
  reach: number;
  stop: number;
}

const borderFacts: number[] = [];
let borderCands = new Int32Array(0);

export function border(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BorderBinding> | null): number {
  const _g18: number[] = [];
  const _g33: number[] = [];
  const facts = borderFacts;
  let fired = 0;
  let changed = false;
  const _h17 = (sp.w - cl.nums);
  const _h26 = (cl.nums + 1);
  if (borderCands.length < sp.cells.length) borderCands = new Int32Array(sp.cells.length);
  const cands = borderCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.border.at.length; v_k++) {
    const _h47 = cl.border.v[v_k];
    const v_L = sp.sight[cl.border.at[v_k]];
    const v_H = _h17;
    _g18.length = 0;
    G19: {
      const _a22 = v_L;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_c = _a22[_i23];
        const _h24 = b.known(v_c);
        const _h25 = b.value(v_c);
        if (!(!((_h24 && (_h25 === _h26))))) continue;
        _g18.push(v_c);
      }
    }
    const v_f = v_L.indexOf((_g18.length > 0 ? _g18[0] : -1));
    const _h43 = (v_f < 0);
    let _g27 = 0;
    G28: {
      const _a29 = v_L;
      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
        const v_c = _a29[_i30];
        const _h31 = b.known(v_c);
        const _h32 = b.value(v_c);
        if (!((((_i30 >= v_H) && _h31) && (_h32 === _h26)))) continue;
        _g27++;
      }
    }
    const v_reach = (v_H - _g27);
    _g33.length = 0;
    G34: {
      const _a37 = v_L;
      for (let _i38 = 0; _i38 < _a37.length; _i38++) {
        const v_c = _a37[_i38];
        if (!(!b.has(v_c, _h26))) continue;
        _g33.push(v_c);
      }
    }
    const v_stop = v_L.indexOf((_g33.length > 0 ? _g33[0] : -1));
    const _h49 = (v_stop >= 0);
    facts.length = 0;
    changed = false;
    let _q39 = true;
    Q40: {
      const _a41 = v_L;
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_c = _a41[_i42];
        const v_i = _i42;
        let _c48 = !((_h43 || (v_i <= v_f)));
        if (!_c48) {
          let _q44 = true;
          Q45: {
            for (let _m46 = b.domain; _m46 !== 0; _m46 &= _m46 - 1) {
              const v_e = 31 - Math.clz32(_m46 & -_m46);
              if (!(((v_e !== _h47) && (v_e <= cl.nums)))) continue;
              if (b.has(v_c, v_e)) { if (fire === null) { b.strikeAt(v_c, v_e); changed = true; } else facts.push(STRIKE, v_c, v_e); }
              if (!(true)) {
                _q44 = false;
                break Q45;
              }
            }
          }
          _c48 = _q44;
        }
        let _c51 = _c48;
        if (_c51) {
          let _c50 = !(((_h49 && (v_i > v_stop)) || (v_i > v_reach)));
          if (!_c50) {
            if (b.has(v_c, _h47)) { if (fire === null) { b.strikeAt(v_c, _h47); changed = true; } else facts.push(STRIKE, v_c, _h47); }
            _c50 = true;
          }
          _c51 = _c50;
        }
        if (!(_c51)) {
          _q39 = false;
          break Q40;
        }
      }
    }
    if (!(_q39)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, L: v_L, H: v_H, f: v_f, reach: v_reach, stop: v_stop }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
