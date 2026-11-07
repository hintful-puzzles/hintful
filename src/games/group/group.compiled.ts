// Compiled by `npm run describe` from src/games/group/group.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, rangeMask, setOf } from "../../engine/describe-runtime.ts";

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
export const tiers: readonly string[] = ["Trivial","Normal","Hard","Extreme","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q75 = true;
  const _n79 = new Int32Array(32);
  Q76: for (const _u77 of sp.lines) {
    _n79.fill(0);
    for (const _c78 of sp.lineCells[_u77]) {
      const _t80 = (g[_c78] || -1);
      if (++_n79[_t80] > 1) {
        _q75 = false;
        break Q76;
      }
    }
  }
  if (!(_q75)) return false;
  let _q81 = true;
  Q82: {
    for (let _m83 = _domain; _m83 !== 0; _m83 &= _m83 - 1) {
      const v_a = 31 - Math.clz32(_m83 & -_m83);
      const _h87 = (v_a - 1);
      for (let _m84 = _domain; _m84 !== 0; _m84 &= _m84 - 1) {
        const v_b = 31 - Math.clz32(_m84 & -_m84);
        const _h86 = (v_b - 1);
        const _h88 = (_h87 * sp.w + _h86);
        const _h89 = _h88;
        const _h90 = (g[_h89] || -1);
        const _h91 = (_h90 - 1);
        for (let _m85 = _domain; _m85 !== 0; _m85 &= _m85 - 1) {
          const v_c = 31 - Math.clz32(_m85 & -_m85);
          const _h92 = (g[(_h91 * sp.w + (v_c - 1))] || -1);
          const _h93 = (g[(_h86 * sp.w + (v_c - 1))] || -1);
          const _h94 = (g[(_h87 * sp.w + (_h93 - 1))] || -1);
          if (!((_h92 === _h94))) {
            _q81 = false;
            break Q82;
          }
        }
      }
    }
  }
  if (!(_q81)) return false;
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
    for (let _m10 = b.domain; _m10 !== 0; _m10 &= _m10 - 1) {
      const v_b = 31 - Math.clz32(_m10 & -_m10);
      const _h14 = (v_b - 1);
      L12: {
        const v_p = (_h11 * sp.w + (v_b - 1));
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
              facts.length = 0;
              changed = false;
              let _c20: boolean = !(((b.grid[v_l] !== 0) && (((b.cands[v_r] >> (b.grid[v_l] || -1)) & 1) !== 0)));
              if (!_c20) {
                const _t19 = (b.grid[v_l] || -1);
                if (!(b.grid[v_r] !== 0)) { if (fire === null) { b.placeAt(v_r, _t19); changed = true; } else facts.push(PLACE, v_r, _t19); }
                _c20 = true;
              }
              let _c23: boolean = _c20;
              if (_c23) {
                let _c22: boolean = !(((b.grid[v_r] !== 0) && (((b.cands[v_l] >> (b.grid[v_r] || -1)) & 1) !== 0)));
                if (!_c22) {
                  const _t21 = (b.grid[v_r] || -1);
                  if (!(b.grid[v_l] !== 0)) { if (fire === null) { b.placeAt(v_l, _t21); changed = true; } else facts.push(PLACE, v_l, _t21); }
                  _c22 = true;
                }
                _c23 = _c22;
              }
              if (!(_c23)) return -1;
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
  const _g32: number[] = [];
  const facts = identityFacts;
  let fired = 0;
  let changed = false;
  _g32.length = 0;
  G33: {
    const _a36 = sp.cells;
    for (let _i37 = 0; _i37 < _a36.length; _i37++) {
      const v_c = _a36[_i37];
      if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === (((v_c / sp.w) | 0) + 1)) || ((b.grid[v_c] || -1) === ((v_c % sp.w) + 1)))))) continue;
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
      if (!(((((b.grid[v_w0] || -1) === _h42) && (v_e === _h45)) || (((b.grid[v_w0] || -1) !== _h42) && (v_e === _h42))))) continue;
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
            if (!(!((b.grid[v_c] !== 0)))) continue;
            let _c52: boolean = (((b.cands[v_c] >> v_j) & 1) !== 0);
            if (_c52) {
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_j); changed = true; } else facts.push(PLACE, v_c, v_j); }
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
  for (let _m58 = b.domain; _m58 !== 0; _m58 &= _m58 - 1) {
    const v_a = 31 - Math.clz32(_m58 & -_m58);
    const _h62 = (v_a - 1);
    let _g59 = -1;
    G60: {
      for (let _m61 = b.domain; _m61 !== 0; _m61 &= _m61 - 1) {
        const v_j = 31 - Math.clz32(_m61 & -_m61);
        const _h63 = (b.grid[((v_j - 1) * sp.w + _h62)] !== 0);
        const _h64 = (b.grid[((v_j - 1) * sp.w + _h62)] || -1);
        const _h65 = (b.grid[(_h62 * sp.w + (v_j - 1))] !== 0);
        const _h66 = (b.grid[(_h62 * sp.w + (v_j - 1))] || -1);
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
          if ((((b.cands[_t71] >> v_j) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t71, v_j); changed = true; } else facts.push(STRIKE, _t71, v_j); }
          let _c74: boolean = true;
          if (_c74) {
            let _c73: boolean = (v_j === v_a);
            if (!_c73) {
              const _t72 = (_h62 * sp.w + (v_j - 1));
              if ((((b.cands[_t72] >> v_j) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t72, v_j); changed = true; } else facts.push(STRIKE, _t72, v_j); }
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
      }
    }
  }
  return fired;
}
