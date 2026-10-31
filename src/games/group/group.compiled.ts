// Compiled by `npm run describe` from src/games/group/group.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, setOf } from "../../engine/describe-runtime.ts";

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "associativity" | "identity" | "notIdentity" | "latin.set" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, and the cap from which it no longer runs where it has one, in the
 * order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number }[] = [
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "associativity", tier: 1 },
  { id: "identity", tier: 1 },
  { id: "notIdentity", tier: 2 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Trivial","Normal","Hard","Extreme","Unreasonable"];

export interface AssociativityBinding {
  a: number;
  b: number;
  p: number;
  c: number;
  q: number;
  l: number;
  r: number;
}

const associativityFacts: number[] = [];
let associativityCands = new Int32Array(0);

export function associativity(b: Marks, sp: GridSpace, fire: Fire<AssociativityBinding> | null): number {
  const facts = associativityFacts;
  let fired = 0;
  let changed = false;
  if (associativityCands.length < sp.cells.length) associativityCands = new Int32Array(sp.cells.length);
  const cands = associativityCands;
  cands.fill(-1);
  for (let _m9 = b.domain; _m9 !== 0; _m9 &= _m9 - 1) {
    const v_a = 31 - Math.clz32(_m9 & -_m9);
    const _h11 = (v_a - 1);
    for (let _m10 = b.domain; _m10 !== 0; _m10 &= _m10 - 1) {
      const v_b = 31 - Math.clz32(_m10 & -_m10);
      const _h14 = (v_b - 1);
      L12: {
        const v_p = (_h11 * sp.w + (v_b - 1));
        if (!(b.known(v_p))) break L12;
        for (let _m13 = b.domain; _m13 !== 0; _m13 &= _m13 - 1) {
          const v_c = 31 - Math.clz32(_m13 & -_m13);
          L15: {
            const v_q = (_h14 * sp.w + (v_c - 1));
            if (!(b.known(v_q))) break L15;
            const _t16 = b.value(v_p);
            const v_l = ((_t16 - 1) * sp.w + (v_c - 1));
            const _t17 = b.value(v_q);
            L18: {
              const v_r = (_h11 * sp.w + (_t17 - 1));
              if (!((b.known(v_l) !== b.known(v_r)))) break L18;
              facts.length = 0;
              changed = false;
              let _c20 = !((b.known(v_l) && b.has(v_r, b.value(v_l))));
              if (!_c20) {
                const _t19 = b.value(v_l);
                if (!b.known(v_r)) { if (fire === null) { b.placeAt(v_r, _t19); changed = true; } else facts.push(PLACE, v_r, _t19); }
                _c20 = true;
              }
              let _c23 = _c20;
              if (_c23) {
                let _c22 = !((b.known(v_r) && b.has(v_l, b.value(v_r))));
                if (!_c22) {
                  const _t21 = b.value(v_r);
                  if (!b.known(v_l)) { if (fire === null) { b.placeAt(v_l, _t21); changed = true; } else facts.push(PLACE, v_l, _t21); }
                  _c22 = true;
                }
                _c23 = _c22;
              }
              if (!(_c23)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ a: v_a, b: v_b, p: v_p, c: v_c, q: v_q, l: v_l, r: v_r }, facts)) return 1;
                cands.fill(-1);
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface IdentityBinding {
  w0: number;
  e: number;
}

const identityFacts: number[] = [];
let identityCands = new Int32Array(0);

export function identity(b: Marks, sp: GridSpace, fire: Fire<IdentityBinding> | null): number {
  const _g32: number[] = [];
  const facts = identityFacts;
  let fired = 0;
  let changed = false;
  if (identityCands.length < sp.cells.length) identityCands = new Int32Array(sp.cells.length);
  const cands = identityCands;
  cands.fill(-1);
  _g32.length = 0;
  G33: {
    const _a36 = sp.cells;
    for (let _i37 = 0; _i37 < _a36.length; _i37++) {
      const v_c = _a36[_i37];
      if (!((b.known(v_c) && ((b.value(v_c) === (((v_c / sp.w) | 0) + 1)) || (b.value(v_c) === ((v_c % sp.w) + 1)))))) continue;
      _g32.push(v_c);
    }
  }
  L38: {
    const v_w0 = (_g32.length > 0 ? _g32[0] : -1);
    if (!((v_w0 !== -1))) break L38;
    const _h40 = ((v_w0 / sp.w) | 0);
    const _h41 = (_h40 + 1);
    const _h42 = _h41;
    const _h43 = (v_w0 % sp.w);
    const _h44 = (_h43 + 1);
    const _h45 = _h44;
    for (let _m39 = b.domain; _m39 !== 0; _m39 &= _m39 - 1) {
      const v_e = 31 - Math.clz32(_m39 & -_m39);
      if (!((((b.value(v_w0) === _h42) && (v_e === _h45)) || ((b.value(v_w0) !== _h42) && (v_e === _h42))))) continue;
      const _h49 = (v_e - 1);
      facts.length = 0;
      changed = false;
      let _q46 = true;
      Q47: {
        for (let _m48 = b.domain; _m48 !== 0; _m48 &= _m48 - 1) {
          const v_j = 31 - Math.clz32(_m48 & -_m48);
          const _a50 = setOf(((v_j - 1) * sp.w + _h49), (_h49 * sp.w + (v_j - 1)));
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_c = _a50[_i51];
            if (!(!(b.known(v_c)))) continue;
            let _c52 = b.has(v_c, v_j);
            if (_c52) {
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_j); changed = true; } else facts.push(PLACE, v_c, v_j); }
              _c52 = true;
            }
            if (!(_c52)) {
              _q46 = false;
              break Q47;
            }
          }
        }
      }
      if (!(_q46)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ w0: v_w0, e: v_e }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface NotIdentityBinding {
  a: number;
  o: number;
}

const notIdentityFacts: number[] = [];
let notIdentityCands = new Int32Array(0);

export function notIdentity(b: Marks, sp: GridSpace, fire: Fire<NotIdentityBinding> | null): number {
  const facts = notIdentityFacts;
  let fired = 0;
  let changed = false;
  if (notIdentityCands.length < sp.cells.length) notIdentityCands = new Int32Array(sp.cells.length);
  const cands = notIdentityCands;
  cands.fill(-1);
  for (let _m58 = b.domain; _m58 !== 0; _m58 &= _m58 - 1) {
    const v_a = 31 - Math.clz32(_m58 & -_m58);
    const _h62 = (v_a - 1);
    let _g59 = -1;
    G60: {
      for (let _m61 = b.domain; _m61 !== 0; _m61 &= _m61 - 1) {
        const v_j = 31 - Math.clz32(_m61 & -_m61);
        const _h63 = b.known(((v_j - 1) * sp.w + _h62));
        const _h64 = b.value(((v_j - 1) * sp.w + _h62));
        const _h65 = b.known((_h62 * sp.w + (v_j - 1)));
        const _h66 = b.value((_h62 * sp.w + (v_j - 1)));
        if (!(((_h63 && (_h64 !== v_j)) || (_h65 && (_h66 !== v_j))))) continue;
        if (_g59 === -1 || v_j < _g59) _g59 = v_j;
      }
    }
    L67: {
      const v_o = _g59;
      if (!((v_o !== -1))) break L67;
      facts.length = 0;
      changed = false;
      let _q68 = true;
      Q69: {
        for (let _m70 = b.domain; _m70 !== 0; _m70 &= _m70 - 1) {
          const v_j = 31 - Math.clz32(_m70 & -_m70);
          const _t71 = ((v_j - 1) * sp.w + _h62);
          if (b.has(_t71, v_j)) { if (fire === null) { b.strikeAt(_t71, v_j); changed = true; } else facts.push(STRIKE, _t71, v_j); }
          let _c74 = true;
          if (_c74) {
            let _c73 = (v_j === v_a);
            if (!_c73) {
              const _t72 = (_h62 * sp.w + (v_j - 1));
              if (b.has(_t72, v_j)) { if (fire === null) { b.strikeAt(_t72, v_j); changed = true; } else facts.push(STRIKE, _t72, v_j); }
              _c73 = true;
            }
            _c74 = _c73;
          }
          if (!(_c74)) {
            _q68 = false;
            break Q69;
          }
        }
      }
      if (!(_q68)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, o: v_o }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
