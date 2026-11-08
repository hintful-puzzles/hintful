// Compiled by `npm run describe` from src/games/map/map.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, least, popcount, rangeMask } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  readonly borders: readonly (readonly number[])[];
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "lone" | "pair" | "weigh";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "placed" },
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
  { id: "lone", tier: 0 },
  { id: "pair", tier: 1 },
  { id: "weigh", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 4);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q120 = true;
  Q121: {
    const _a122 = sp.cells;
    for (let _i123 = 0; _i123 < _a122.length; _i123++) {
      const v_a = _a122[_i123];
      const _h127 = (g[v_a] || -1);
      const _a124 = cl.borders[v_a];
      for (let _i125 = 0; _i125 < _a124.length; _i125++) {
        const v_b = _a124[_i125];
        const _h126 = (g[v_b] || -1);
        if (!((_h126 !== _h127))) {
          _q120 = false;
          break Q121;
        }
      }
    }
  }
  if (!(_q120)) return false;
  return true;
}

export interface PlacedBinding {
  c: number;
  k: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function placed(b: Marks, _sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (b.grid[v_c] !== 0);
  const _h9 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const _a6 = cl.borders[v_c];
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_k = _a6[_i7];
    const _h8 = (b.grid[v_k] !== 0);
    if (!(!(_h8))) continue;
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_k] >> _h9) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_k, _h9); changed = true; } else facts.push(STRIKE, v_k, _h9); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, k: v_k }, facts);
    }
  }
  return fired;
}

export interface LoneBinding {
  c: number;
}

const loneFacts: number[] = [];
let loneCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function lone(b: Marks, sp: GridSpace, fire: Fire<LoneBinding> | null): number {
  const facts = loneFacts;
  let fired = 0;
  let changed = false;
  if (loneCands.length < sp.cells.length) loneCands = new Int32Array(sp.cells.length);
  const cands = loneCands;
  cands.fill(-1);
  const _a12 = sp.cells;
  for (let _i13 = 0; _i13 < _a12.length; _i13++) {
    const v_c = _a12[_i13];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c15: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c15) {
      const _t14 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t14); changed = true; } else facts.push(PLACE, v_c, _t14); }
      _c15 = true;
    }
    if (!(_c15)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface PairBinding {
  a: number;
  b: number;
}

const pairFacts: number[] = [];
let pairCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (pairCands.length < sp.cells.length) pairCands = new Int32Array(sp.cells.length);
  const cands = pairCands;
  cands.fill(-1);
  const _a20 = sp.cells;
  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
    const v_a = _a20[_i21];
    const _h22 = (b.grid[v_a] !== 0);
    if (!((!(_h22) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) continue;
    const _h25 = _i21;
    const _a23 = cl.borders[v_a];
    for (let _i24 = 0; _i24 < _a23.length; _i24++) {
      const v_b = _a23[_i24];
      const _h26 = (b.grid[v_b] !== 0);
      if (!((((v_b > _h25) && !(_h26)) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])))))) continue;
      facts.length = 0;
      changed = false;
      let _q27 = true;
      Q28: {
        const _a29 = cl.borders[v_a];
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_k = _a29[_i30];
          const _h31 = (b.grid[v_k] !== 0);
          if (!(((cl.borders[v_b].includes(v_k)) && !(_h31)))) continue;
          for (let _m32 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m32 !== 0; _m32 &= _m32 - 1) {
            const v_d = 31 - Math.clz32(_m32 & -_m32);
            if ((((b.cands[v_k] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_k, v_d); changed = true; } else facts.push(STRIKE, v_k, v_d); }
            if (!(true)) {
              _q27 = false;
              break Q28;
            }
          }
        }
      }
      if (!(_q27)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, b: v_b }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface WeighBinding {
  m: number;
  x: number;
  R: number;
  t: number;
  E: readonly number[];
}

const weighFacts: number[] = [];
let weighCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function weigh(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighBinding> | null): number {
  const _g101: number[] = [];
  const _g111: number[] = [];
  const facts = weighFacts;
  let fired = 0;
  let changed = false;
  if (weighCands.length < sp.cells.length) weighCands = new Int32Array(sp.cells.length);
  const cands = weighCands;
  cands.fill(-1);
  const _a72 = sp.cells;
  for (let _i73 = 0; _i73 < _a72.length; _i73++) {
    const v_m = _a72[_i73];
    const _h74 = (b.grid[v_m] !== 0);
    if (!(!(_h74))) continue;
    for (let _m75 = b.domain; _m75 !== 0; _m75 &= _m75 - 1) {
      const v_x = 31 - Math.clz32(_m75 & -_m75);
      L76: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)));
        const _h77 = popcount(v_R);
        let _c87: boolean = (_h77 >= 1);
        if (_c87) {
          let _q78 = true;
          Q79: {
            for (let _m80 = v_R; _m80 !== 0; _m80 &= _m80 - 1) {
              const v_a = 31 - Math.clz32(_m80 & -_m80);
              const _h86 = ((1 << v_a) | (1 << v_x));
              let _q81 = false;
              Q82: {
                const _a83 = cl.borders[v_m];
                for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                  const v_k = _a83[_i84];
                  const _h85 = (b.grid[v_k] !== 0);
                  if ((!(_h85) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h86))) {
                    _q81 = true;
                    break Q82;
                  }
                }
              }
              if (!(_q81)) {
                _q78 = false;
                break Q79;
              }
            }
          }
          _c87 = _q78;
        }
        if (!(_c87)) break L76;
        const _a88 = sp.cells;
        for (let _i89 = 0; _i89 < _a88.length; _i89++) {
          const v_t = _a88[_i89];
          const _h90 = (b.grid[v_t] !== 0);
          let _c100: boolean = ((((v_t !== v_m) && !(_h90)) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (cl.borders[v_m].includes(v_t))));
          if (_c100) {
            let _q91 = true;
            Q92: {
              for (let _m93 = v_R; _m93 !== 0; _m93 &= _m93 - 1) {
                const v_a = 31 - Math.clz32(_m93 & -_m93);
                const _h99 = ((1 << v_a) | (1 << v_x));
                let _q94 = false;
                Q95: {
                  const _a96 = cl.borders[v_m];
                  for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                    const v_k = _a96[_i97];
                    const _h98 = (b.grid[v_k] !== 0);
                    if ((((!(_h98) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h99)) && (v_k !== v_t)) && (cl.borders[v_t].includes(v_k)))) {
                      _q94 = true;
                      break Q95;
                    }
                  }
                }
                if (!(_q94)) {
                  _q91 = false;
                  break Q92;
                }
              }
            }
            _c100 = _q91;
          }
          if (!(_c100)) continue;
          _g101.length = 0;
          G102: {
            for (let _m110 = v_R; _m110 !== 0; _m110 &= _m110 - 1) {
              const v_a = 31 - Math.clz32(_m110 & -_m110);
              const _h118 = ((1 << v_a) | (1 << v_x));
              _g111.length = 0;
              G112: {
                const _a115 = cl.borders[v_m];
                for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                  const v_k = _a115[_i116];
                  const _h117 = (b.grid[v_k] !== 0);
                  if (!((((!(_h117) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h118)) && (v_k !== v_t)) && (cl.borders[v_t].includes(v_k))))) continue;
                  _g111.push(v_k);
                }
              }
              const _t119 = (_g111.length > 0 ? _g111[0] : -1);
              if (!_g101.includes(_t119)) _g101.push(_t119);
            }
          }
          const v_E = _g101;
          facts.length = 0;
          changed = false;
          if ((((b.cands[v_t] >> v_x) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_x); changed = true; } else facts.push(STRIKE, v_t, v_x); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ m: v_m, x: v_x, R: v_R, t: v_t, E: v_E.slice() }, facts)) return 1;
            cands.fill(-1);
          }
        }
      }
    }
  }
  return fired;
}
