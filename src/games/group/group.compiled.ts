// Compiled by `npm run describe` from src/games/group/group.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, freshBinding, rangeMask, staleChecking } from "../../engine/describe-runtime.ts";

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "associativity" | "identity" | "notIdentity" | "latin.set" | "latin.fish" | "latin.wing";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "latin.placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "latin.placed" },
];

/** Every technique run as a value is struck from a cell, by id. */
export type StrikingId = never;

/** The techniques run as a value is struck from a cell, in the
 * description's order, each with the variation that adds it where one
 * does. */
export const striking: readonly { id: StrikingId; variation?: string }[] = [
];

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, the cap from which it no longer runs where it has one, and the
 * variation that adds it where one does, in the order the description
 * lists them, a variation's before the first of a higher tier. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [
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
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  const _n5 = new Int32Array(32);
  Q2: for (const _u3 of sp.lines) {
    _n5.fill(0);
    for (const _c4 of sp.lineCells[_u3]) {
      const _t6 = (g[_c4] || -1);
      if (++_n5[_t6] > 1) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q7 = true;
  Q8: {
    for (let _m9 = _domain; _m9 !== 0; _m9 &= _m9 - 1) {
      const v_a = 31 - Math.clz32(_m9 & -_m9);
      const _h13 = (v_a - 1);
      for (let _m10 = _domain; _m10 !== 0; _m10 &= _m10 - 1) {
        const v_b = 31 - Math.clz32(_m10 & -_m10);
        const _h12 = (v_b - 1);
        const _h14 = (_h13 * sp.w + _h12);
        const _h15 = _h14;
        const _h16 = (g[_h15] || -1);
        const _h17 = (_h16 - 1);
        for (let _m11 = _domain; _m11 !== 0; _m11 &= _m11 - 1) {
          const v_c = 31 - Math.clz32(_m11 & -_m11);
          const _h18 = (g[(_h17 * sp.w + (v_c - 1))] || -1);
          const _h19 = (g[(_h12 * sp.w + (v_c - 1))] || -1);
          const _h20 = (g[(_h13 * sp.w + (_h19 - 1))] || -1);
          if (!((_h18 === _h20))) {
            _q7 = false;
            break Q8;
          }
        }
      }
    }
  }
  if (!(_q7)) return false;
  return true;
}

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

/** Its dearest read grows with the board as 1. */
export function associativity(b: Marks, sp: GridSpace, fire: Fire<AssociativityBinding> | null): number {
  const facts = associativityFacts;
  let fired = 0;
  let changed = false;
  for (let _m9 = b.domain; _m9 !== 0; _m9 &= _m9 - 1) {
    const v_a = 31 - Math.clz32(_m9 & -_m9);
    const _h11 = (v_a - 1);
    R2:
    for (let _m10 = b.domain; _m10 !== 0; _m10 &= _m10 - 1) {
      const v_b = 31 - Math.clz32(_m10 & -_m10);
      const _h14 = (v_b - 1);
      L12: {
        const v_p = (_h11 * sp.w + (v_b - 1));
        const _m26_0 = b.made[0];
        if (!((b.grid[v_p] !== 0))) break L12;
        for (let _m13 = b.domain; _m13 !== 0; _m13 &= _m13 - 1) {
          const v_c = 31 - Math.clz32(_m13 & -_m13);
          L15: {
            const v_q = (_h14 * sp.w + (v_c - 1));
            if (!((b.grid[v_q] !== 0))) break L15;
            const _t16 = (b.grid[v_p] || -1);
            const v_l = ((_t16 - 1) * sp.w + (v_c - 1));
            const _t17 = (b.grid[v_q] || -1);
            L18: {
              const v_r = (_h11 * sp.w + (_t17 - 1));
              if (!(((b.grid[v_l] !== 0) !== (b.grid[v_r] !== 0)))) break L18;
              if (b.made[0] !== _m26_0) {
                if (!((b.grid[v_p] !== 0))) { continue R2; }
              }
              if (import.meta.env.DEV && staleChecking) {
                const _t19 = (b.grid[v_p] || -1);
                const _t20 = (b.grid[v_q] || -1);
                freshBinding("associativity", [(((b.domain >> v_a) & 1) !== 0), (((b.domain >> v_b) & 1) !== 0), (v_p === ((v_a - 1) * sp.w + (v_b - 1))), (b.grid[v_p] !== 0), (((b.domain >> v_c) & 1) !== 0), (v_q === ((v_b - 1) * sp.w + (v_c - 1))), (b.grid[v_q] !== 0), (v_l === ((_t19 - 1) * sp.w + (v_c - 1))), (v_r === ((v_a - 1) * sp.w + (_t20 - 1))), ((b.grid[v_l] !== 0) !== (b.grid[v_r] !== 0))], ["a in", "b in", "p =", "where of p", "c in", "q =", "where of q", "l =", "r =", "where of r"]);
              }
              facts.length = 0;
              changed = false;
              let _c22: boolean = !(((b.grid[v_l] !== 0) && (((b.cands[v_r] >> (b.grid[v_l] || -1)) & 1) !== 0)));
              if (!_c22) {
                const _t21 = (b.grid[v_l] || -1);
                if (!(b.grid[v_r] !== 0)) { if (fire === null) { b.placeAt(v_r, _t21); changed = true; } else facts.push(PLACE, v_r, _t21); }
                _c22 = true;
              }
              let _c25: boolean = _c22;
              if (_c25) {
                let _c24: boolean = !(((b.grid[v_r] !== 0) && (((b.cands[v_l] >> (b.grid[v_r] || -1)) & 1) !== 0)));
                if (!_c24) {
                  const _t23 = (b.grid[v_r] || -1);
                  if (!(b.grid[v_l] !== 0)) { if (fire === null) { b.placeAt(v_l, _t23); changed = true; } else facts.push(PLACE, v_l, _t23); }
                  _c24 = true;
                }
                _c25 = _c24;
              }
              if (!(_c25)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ a: v_a, b: v_b, p: v_p, c: v_c, q: v_q, l: v_l, r: v_r }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function identity(b: Marks, sp: GridSpace, fire: Fire<IdentityBinding> | null): number {
  const _g9: number[] = [];
  const _g23: number[] = [];
  const facts = identityFacts;
  let fired = 0;
  let changed = false;
  const _m43_0 = b.made[0];
  _g9.length = 0;
  G10: {
    const _a13 = sp.cells;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_c = _a13[_i14];
      if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === (((v_c / sp.w) | 0) + 1)) || ((b.grid[v_c] || -1) === ((v_c % sp.w) + 1)))))) continue;
      _g9.push(v_c);
    }
  }
  L15: {
    const v_w0 = (_g9.length > 0 ? _g9[0] : -1);
    if (!((v_w0 !== -1))) break L15;
    const _h17 = ((v_w0 / sp.w) | 0);
    const _h18 = (_h17 + 1);
    const _h19 = _h18;
    const _h20 = (v_w0 % sp.w);
    const _h21 = (_h20 + 1);
    const _h22 = _h21;
    for (let _m16 = b.domain; _m16 !== 0; _m16 &= _m16 - 1) {
      const v_e = 31 - Math.clz32(_m16 & -_m16);
      if (!(((((b.grid[v_w0] || -1) === _h19) && (v_e === _h22)) || (((b.grid[v_w0] || -1) !== _h19) && (v_e === _h19))))) continue;
      const _h38 = (v_e - 1);
      if (b.made[0] !== _m43_0) {
        _g23.length = 0;
        G24: {
          const _a27 = sp.cells;
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_c = _a27[_i28];
            if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === (((v_c / sp.w) | 0) + 1)) || ((b.grid[v_c] || -1) === ((v_c % sp.w) + 1)))))) continue;
            _g23.push(v_c);
          }
        }
        if (!((v_w0 === (_g23.length > 0 ? _g23[0] : -1)))) { return fired; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g29: number[] = [];
        G30: {
          const _a33 = sp.cells;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === (((v_c / sp.w) | 0) + 1)) || ((b.grid[v_c] || -1) === ((v_c % sp.w) + 1)))))) continue;
            _g29.push(v_c);
          }
        }
        freshBinding("identity", [(v_w0 === (_g29.length > 0 ? _g29[0] : -1)), (v_w0 !== -1), (((b.domain >> v_e) & 1) !== 0), ((((b.grid[v_w0] || -1) === (((v_w0 / sp.w) | 0) + 1)) && (v_e === ((v_w0 % sp.w) + 1))) || (((b.grid[v_w0] || -1) !== (((v_w0 / sp.w) | 0) + 1)) && (v_e === (((v_w0 / sp.w) | 0) + 1))))], ["w0 =", "where of w0", "e in", "where of e"]);
      }
      facts.length = 0;
      changed = false;
      let _q35 = true;
      Q36: {
        for (let _m37 = b.domain; _m37 !== 0; _m37 &= _m37 - 1) {
          const v_j = 31 - Math.clz32(_m37 & -_m37);
          const _t39 = ((v_j - 1) * sp.w + _h38);
          const _t40 = (_h38 * sp.w + (v_j - 1));
          for (let _i41 = 0; _i41 < 2; _i41++) {
            const v_c = _i41 === 0 ? _t39 : _t40;
            if (_i41 === 1 && (v_c === _t39)) continue;
            if (!(!((b.grid[v_c] !== 0)))) continue;
            let _c42: boolean = (((b.cands[v_c] >> v_j) & 1) !== 0);
            if (_c42) {
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_j); changed = true; } else facts.push(PLACE, v_c, v_j); }
              _c42 = true;
            }
            if (!(_c42)) {
              _q35 = false;
              break Q36;
            }
          }
        }
      }
      if (!(_q35)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ w0: v_w0, e: v_e }, facts)) return 1;
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

/** Its dearest read grows with the board as 1. */
export function notIdentity(b: Marks, sp: GridSpace, fire: Fire<NotIdentityBinding> | null): number {
  const facts = notIdentityFacts;
  let fired = 0;
  let changed = false;
  for (let _m6 = b.domain; _m6 !== 0; _m6 &= _m6 - 1) {
    const v_a = 31 - Math.clz32(_m6 & -_m6);
    const _h10 = (v_a - 1);
    let _g7 = -1;
    G8: {
      for (let _m9 = b.domain; _m9 !== 0; _m9 &= _m9 - 1) {
        const v_j = 31 - Math.clz32(_m9 & -_m9);
        const _h11 = (b.grid[((v_j - 1) * sp.w + _h10)] !== 0);
        const _h12 = (b.grid[((v_j - 1) * sp.w + _h10)] || -1);
        const _h13 = (b.grid[(_h10 * sp.w + (v_j - 1))] !== 0);
        const _h14 = (b.grid[(_h10 * sp.w + (v_j - 1))] || -1);
        if (!(((_h11 && (_h12 !== v_j)) || (_h13 && (_h14 !== v_j))))) continue;
        if (_g7 === -1 || v_j < _g7) _g7 = v_j;
      }
    }
    L15: {
      const v_o = _g7;
      if (!((v_o !== -1))) break L15;
      if (import.meta.env.DEV && staleChecking) {
        let _g16 = -1;
        G17: {
          for (let _m18 = b.domain; _m18 !== 0; _m18 &= _m18 - 1) {
            const v_j = 31 - Math.clz32(_m18 & -_m18);
            if (!((((b.grid[((v_j - 1) * sp.w + (v_a - 1))] !== 0) && ((b.grid[((v_j - 1) * sp.w + (v_a - 1))] || -1) !== v_j)) || ((b.grid[((v_a - 1) * sp.w + (v_j - 1))] !== 0) && ((b.grid[((v_a - 1) * sp.w + (v_j - 1))] || -1) !== v_j))))) continue;
            if (_g16 === -1 || v_j < _g16) _g16 = v_j;
          }
        }
        freshBinding("notIdentity", [(((b.domain >> v_a) & 1) !== 0), (v_o === _g16), (v_o !== -1)], ["a in", "o =", "where of o"]);
      }
      facts.length = 0;
      changed = false;
      let _q19 = true;
      Q20: {
        for (let _m21 = b.domain; _m21 !== 0; _m21 &= _m21 - 1) {
          const v_j = 31 - Math.clz32(_m21 & -_m21);
          const _t22 = ((v_j - 1) * sp.w + _h10);
          if ((((b.cands[_t22] >> v_j) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t22, v_j); changed = true; } else facts.push(STRIKE, _t22, v_j); }
          let _c25: boolean = true;
          if (_c25) {
            let _c24: boolean = (v_j === v_a);
            if (!_c24) {
              const _t23 = (_h10 * sp.w + (v_j - 1));
              if ((((b.cands[_t23] >> v_j) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t23, v_j); changed = true; } else facts.push(STRIKE, _t23, v_j); }
              _c24 = true;
            }
            _c25 = _c24;
          }
          if (!(_c25)) {
            _q19 = false;
            break Q20;
          }
        }
      }
      if (!(_q19)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, o: v_o }, facts)) return 1;
      }
    }
  }
  return fired;
}
