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
  let _q93 = true;
  const _n97 = new Int32Array(32);
  Q94: for (const _u95 of sp.lines) {
    _n97.fill(0);
    for (const _c96 of sp.lineCells[_u95]) {
      const _t98 = (g[_c96] || -1);
      if (++_n97[_t98] > 1) {
        _q93 = false;
        break Q94;
      }
    }
  }
  if (!(_q93)) return false;
  let _q99 = true;
  Q100: {
    for (let _m101 = _domain; _m101 !== 0; _m101 &= _m101 - 1) {
      const v_a = 31 - Math.clz32(_m101 & -_m101);
      const _h105 = (v_a - 1);
      for (let _m102 = _domain; _m102 !== 0; _m102 &= _m102 - 1) {
        const v_b = 31 - Math.clz32(_m102 & -_m102);
        const _h104 = (v_b - 1);
        const _h106 = (_h105 * sp.w + _h104);
        const _h107 = _h106;
        const _h108 = (g[_h107] || -1);
        const _h109 = (_h108 - 1);
        for (let _m103 = _domain; _m103 !== 0; _m103 &= _m103 - 1) {
          const v_c = 31 - Math.clz32(_m103 & -_m103);
          const _h110 = (g[(_h109 * sp.w + (v_c - 1))] || -1);
          const _h111 = (g[(_h104 * sp.w + (v_c - 1))] || -1);
          const _h112 = (g[(_h105 * sp.w + (_h111 - 1))] || -1);
          if (!((_h110 === _h112))) {
            _q99 = false;
            break Q100;
          }
        }
      }
    }
  }
  if (!(_q99)) return false;
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
        const _m11_0 = b.made[0];
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
              if (b.made[0] !== _m11_0) {
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
  const _g34: number[] = [];
  const _g48: number[] = [];
  const facts = identityFacts;
  let fired = 0;
  let changed = false;
  const _m36_0 = b.made[0];
  _g34.length = 0;
  G35: {
    const _a38 = sp.cells;
    for (let _i39 = 0; _i39 < _a38.length; _i39++) {
      const v_c = _a38[_i39];
      if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === (((v_c / sp.w) | 0) + 1)) || ((b.grid[v_c] || -1) === ((v_c % sp.w) + 1)))))) continue;
      _g34.push(v_c);
    }
  }
  L40: {
    const v_w0 = (_g34.length > 0 ? _g34[0] : -1);
    if (!((v_w0 !== -1))) break L40;
    const _h42 = ((v_w0 / sp.w) | 0);
    const _h43 = (_h42 + 1);
    const _h44 = _h43;
    const _h45 = (v_w0 % sp.w);
    const _h46 = (_h45 + 1);
    const _h47 = _h46;
    for (let _m41 = b.domain; _m41 !== 0; _m41 &= _m41 - 1) {
      const v_e = 31 - Math.clz32(_m41 & -_m41);
      if (!(((((b.grid[v_w0] || -1) === _h44) && (v_e === _h47)) || (((b.grid[v_w0] || -1) !== _h44) && (v_e === _h44))))) continue;
      const _h63 = (v_e - 1);
      if (b.made[0] !== _m36_0) {
        _g48.length = 0;
        G49: {
          const _a52 = sp.cells;
          for (let _i53 = 0; _i53 < _a52.length; _i53++) {
            const v_c = _a52[_i53];
            if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === (((v_c / sp.w) | 0) + 1)) || ((b.grid[v_c] || -1) === ((v_c % sp.w) + 1)))))) continue;
            _g48.push(v_c);
          }
        }
        if (!((v_w0 === (_g48.length > 0 ? _g48[0] : -1)))) { return fired; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g54: number[] = [];
        G55: {
          const _a58 = sp.cells;
          for (let _i59 = 0; _i59 < _a58.length; _i59++) {
            const v_c = _a58[_i59];
            if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === (((v_c / sp.w) | 0) + 1)) || ((b.grid[v_c] || -1) === ((v_c % sp.w) + 1)))))) continue;
            _g54.push(v_c);
          }
        }
        freshBinding("identity", [(v_w0 === (_g54.length > 0 ? _g54[0] : -1)), (v_w0 !== -1), (((b.domain >> v_e) & 1) !== 0), ((((b.grid[v_w0] || -1) === (((v_w0 / sp.w) | 0) + 1)) && (v_e === ((v_w0 % sp.w) + 1))) || (((b.grid[v_w0] || -1) !== (((v_w0 / sp.w) | 0) + 1)) && (v_e === (((v_w0 / sp.w) | 0) + 1))))], ["w0 =", "where of w0", "e in", "where of e"]);
      }
      facts.length = 0;
      changed = false;
      let _q60 = true;
      Q61: {
        for (let _m62 = b.domain; _m62 !== 0; _m62 &= _m62 - 1) {
          const v_j = 31 - Math.clz32(_m62 & -_m62);
          const _t64 = ((v_j - 1) * sp.w + _h63);
          const _t65 = (_h63 * sp.w + (v_j - 1));
          for (let _i66 = 0; _i66 < 2; _i66++) {
            const v_c = _i66 === 0 ? _t64 : _t65;
            if (_i66 === 1 && (v_c === _t64)) continue;
            if (!(!((b.grid[v_c] !== 0)))) continue;
            let _c67: boolean = (((b.cands[v_c] >> v_j) & 1) !== 0);
            if (_c67) {
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_j); changed = true; } else facts.push(PLACE, v_c, v_j); }
              _c67 = true;
            }
            if (!(_c67)) {
              _q60 = false;
              break Q61;
            }
          }
        }
      }
      if (!(_q60)) return -1;
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
  for (let _m73 = b.domain; _m73 !== 0; _m73 &= _m73 - 1) {
    const v_a = 31 - Math.clz32(_m73 & -_m73);
    const _h77 = (v_a - 1);
    let _g74 = -1;
    G75: {
      for (let _m76 = b.domain; _m76 !== 0; _m76 &= _m76 - 1) {
        const v_j = 31 - Math.clz32(_m76 & -_m76);
        const _h78 = (b.grid[((v_j - 1) * sp.w + _h77)] !== 0);
        const _h79 = (b.grid[((v_j - 1) * sp.w + _h77)] || -1);
        const _h80 = (b.grid[(_h77 * sp.w + (v_j - 1))] !== 0);
        const _h81 = (b.grid[(_h77 * sp.w + (v_j - 1))] || -1);
        if (!(((_h78 && (_h79 !== v_j)) || (_h80 && (_h81 !== v_j))))) continue;
        if (_g74 === -1 || v_j < _g74) _g74 = v_j;
      }
    }
    L82: {
      const v_o = _g74;
      if (!((v_o !== -1))) break L82;
      if (import.meta.env.DEV && staleChecking) {
        let _g83 = -1;
        G84: {
          for (let _m85 = b.domain; _m85 !== 0; _m85 &= _m85 - 1) {
            const v_j = 31 - Math.clz32(_m85 & -_m85);
            if (!((((b.grid[((v_j - 1) * sp.w + (v_a - 1))] !== 0) && ((b.grid[((v_j - 1) * sp.w + (v_a - 1))] || -1) !== v_j)) || ((b.grid[((v_a - 1) * sp.w + (v_j - 1))] !== 0) && ((b.grid[((v_a - 1) * sp.w + (v_j - 1))] || -1) !== v_j))))) continue;
            if (_g83 === -1 || v_j < _g83) _g83 = v_j;
          }
        }
        freshBinding("notIdentity", [(((b.domain >> v_a) & 1) !== 0), (v_o === _g83), (v_o !== -1)], ["a in", "o =", "where of o"]);
      }
      facts.length = 0;
      changed = false;
      let _q86 = true;
      Q87: {
        for (let _m88 = b.domain; _m88 !== 0; _m88 &= _m88 - 1) {
          const v_j = 31 - Math.clz32(_m88 & -_m88);
          const _t89 = ((v_j - 1) * sp.w + _h77);
          if ((((b.cands[_t89] >> v_j) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t89, v_j); changed = true; } else facts.push(STRIKE, _t89, v_j); }
          let _c92: boolean = true;
          if (_c92) {
            let _c91: boolean = (v_j === v_a);
            if (!_c91) {
              const _t90 = (_h77 * sp.w + (v_j - 1));
              if ((((b.cands[_t90] >> v_j) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t90, v_j); changed = true; } else facts.push(STRIKE, _t90, v_j); }
              _c91 = true;
            }
            _c92 = _c91;
          }
          if (!(_c92)) {
            _q86 = false;
            break Q87;
          }
        }
      }
      if (!(_q86)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, o: v_o }, facts)) return 1;
      }
    }
  }
  return fired;
}
