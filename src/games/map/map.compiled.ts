// Compiled by `npm run describe` from src/games/map/map.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, freshBinding, least, popcount, rangeMask, sameSet, staleChecking, stamps } from "../../engine/describe-runtime.ts";

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
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_a = _a3[_i4];
      const _h8 = (g[v_a] || -1);
      const _a5 = cl.borders[v_a];
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_b = _a5[_i6];
        const _h7 = (g[v_b] || -1);
        if (!((_h7 !== _h8))) {
          _q1 = false;
          break Q2;
        }
      }
    }
  }
  if (!(_q1)) return false;
  return true;
}

export interface PlacedBinding {
  c: number;
  k: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function placed(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<PlacedBinding> | null): number {
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("placed", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (cl.borders[v_c].includes(v_k)), !((b.grid[v_k] !== 0))], ["c in", "where of c", "k in", "where of k"]);
    }
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
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("lone", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c6: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c6) {
      const _t5 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t5); changed = true; } else facts.push(PLACE, v_c, _t5); }
      _c6 = true;
    }
    if (!(_c6)) return -1;
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
  const _a5 = sp.cells;
  R1:
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_a = _a5[_i6];
    const _m18_0 = b.made[0];
    const _m19_1 = b.made[1];
    const _h7 = (b.grid[v_a] !== 0);
    if (!((!(_h7) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) continue;
    const _h10 = _i6;
    const _a8 = cl.borders[v_a];
    for (let _i9 = 0; _i9 < _a8.length; _i9++) {
      const v_b = _a8[_i9];
      const _h11 = (b.grid[v_b] !== 0);
      if (!((((v_b > _h10) && !(_h11)) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])))))) continue;
      if (b.made[0] !== _m18_0 || b.made[1] !== _m19_1) {
        if (!((!((b.grid[v_a] !== 0)) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("pair", [(sp.cells.includes(v_a)), (!((b.grid[v_a] !== 0)) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)), (cl.borders[v_a].includes(v_b)), (((v_b > _i6) && !((b.grid[v_b] !== 0))) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))))], ["a in", "where of a", "b in", "where of b"]);
      }
      facts.length = 0;
      changed = false;
      let _q12 = true;
      Q13: {
        const _a14 = cl.borders[v_a];
        for (let _i15 = 0; _i15 < _a14.length; _i15++) {
          const v_k = _a14[_i15];
          const _h16 = (b.grid[v_k] !== 0);
          if (!(((cl.borders[v_b].includes(v_k)) && !(_h16)))) continue;
          for (let _m17 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m17 !== 0; _m17 &= _m17 - 1) {
            const v_d = 31 - Math.clz32(_m17 & -_m17);
            if ((((b.cands[v_k] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_k, v_d); changed = true; } else facts.push(STRIKE, v_k, v_d); }
            if (!(true)) {
              _q12 = false;
              break Q13;
            }
          }
        }
      }
      if (!(_q12)) return -1;
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
const weigh_st78 = stamps();

/** Its dearest read grows with the board as n^2. */
export function weigh(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighBinding> | null): number {
  const _g69: number[] = [];
  const _g80: number[] = [];
  const facts = weighFacts;
  let fired = 0;
  let changed = false;
  if (weighCands.length < sp.cells.length) weighCands = new Int32Array(sp.cells.length);
  const cands = weighCands;
  cands.fill(-1);
  const _a40 = sp.cells;
  R1:
  for (let _i41 = 0; _i41 < _a40.length; _i41++) {
    const v_m = _a40[_i41];
    const _m131_0 = b.made[0];
    const _h42 = (b.grid[v_m] !== 0);
    if (!(!(_h42))) continue;
    R2:
    for (let _m43 = b.domain; _m43 !== 0; _m43 &= _m43 - 1) {
      const v_x = 31 - Math.clz32(_m43 & -_m43);
      const _m132_1 = b.made[1];
      L44: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)));
        const _h45 = popcount(v_R);
        let _c55: boolean = (_h45 >= 1);
        if (_c55) {
          let _q46 = true;
          Q47: {
            for (let _m48 = v_R; _m48 !== 0; _m48 &= _m48 - 1) {
              const v_a = 31 - Math.clz32(_m48 & -_m48);
              const _h54 = ((1 << v_a) | (1 << v_x));
              let _q49 = false;
              Q50: {
                const _a51 = cl.borders[v_m];
                for (let _i52 = 0; _i52 < _a51.length; _i52++) {
                  const v_k = _a51[_i52];
                  const _h53 = (b.grid[v_k] !== 0);
                  if ((!(_h53) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h54))) {
                    _q49 = true;
                    break Q50;
                  }
                }
              }
              if (!(_q49)) {
                _q46 = false;
                break Q47;
              }
            }
          }
          _c55 = _q46;
        }
        if (!(_c55)) break L44;
        const _a56 = sp.cells;
        for (let _i57 = 0; _i57 < _a56.length; _i57++) {
          const v_t = _a56[_i57];
          const _h58 = (b.grid[v_t] !== 0);
          let _c68: boolean = ((((v_t !== v_m) && !(_h58)) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (cl.borders[v_m].includes(v_t))));
          if (_c68) {
            let _q59 = true;
            Q60: {
              for (let _m61 = v_R; _m61 !== 0; _m61 &= _m61 - 1) {
                const v_a = 31 - Math.clz32(_m61 & -_m61);
                const _h67 = ((1 << v_a) | (1 << v_x));
                let _q62 = false;
                Q63: {
                  const _a64 = cl.borders[v_m];
                  for (let _i65 = 0; _i65 < _a64.length; _i65++) {
                    const v_k = _a64[_i65];
                    const _h66 = (b.grid[v_k] !== 0);
                    if ((((!(_h66) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h67)) && (v_k !== v_t)) && (cl.borders[v_t].includes(v_k)))) {
                      _q62 = true;
                      break Q63;
                    }
                  }
                }
                if (!(_q62)) {
                  _q59 = false;
                  break Q60;
                }
              }
            }
            _c68 = _q59;
          }
          if (!(_c68)) continue;
          _g69.length = 0;
          weigh_st78.pass++;
          G70: {
            for (let _m79 = v_R; _m79 !== 0; _m79 &= _m79 - 1) {
              const v_a = 31 - Math.clz32(_m79 & -_m79);
              const _h87 = ((1 << v_a) | (1 << v_x));
              _g80.length = 0;
              G81: {
                const _a84 = cl.borders[v_m];
                for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                  const v_k = _a84[_i85];
                  const _h86 = (b.grid[v_k] !== 0);
                  if (!((((!(_h86) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h87)) && (v_k !== v_t)) && (cl.borders[v_t].includes(v_k))))) continue;
                  _g80.push(v_k);
                }
              }
              const _t88 = (_g80.length > 0 ? _g80[0] : -1);
              const _t89 = _t88;
              if (_g69.length < 16) { if (!_g69.includes(_t89)) _g69.push(_t89); } else addOnce(_g69, weigh_st78, _t89);
            }
          }
          const v_E = _g69;
          if (b.made[0] !== _m131_0 || b.made[1] !== _m132_1) {
            if (!(!((b.grid[v_m] !== 0)))) { continue R1; }
            if (!((v_R === ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)))))) { continue R2; }
            let _c97: boolean = (popcount(v_R) >= 1);
            if (_c97) {
              let _q90 = true;
              Q91: {
                for (let _m92 = v_R; _m92 !== 0; _m92 &= _m92 - 1) {
                  const v_a = 31 - Math.clz32(_m92 & -_m92);
                  let _q93 = false;
                  Q94: {
                    const _a95 = cl.borders[v_m];
                    for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                      const v_k = _a95[_i96];
                      if ((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x))))) {
                        _q93 = true;
                        break Q94;
                      }
                    }
                  }
                  if (!(_q93)) {
                    _q90 = false;
                    break Q91;
                  }
                }
              }
              _c97 = _q90;
            }
            if (!(_c97)) { continue R2; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _c105: boolean = (popcount(v_R) >= 1);
            if (_c105) {
              let _q98 = true;
              Q99: {
                for (let _m100 = v_R; _m100 !== 0; _m100 &= _m100 - 1) {
                  const v_a = 31 - Math.clz32(_m100 & -_m100);
                  let _q101 = false;
                  Q102: {
                    const _a103 = cl.borders[v_m];
                    for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                      const v_k = _a103[_i104];
                      if ((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x))))) {
                        _q101 = true;
                        break Q102;
                      }
                    }
                  }
                  if (!(_q101)) {
                    _q98 = false;
                    break Q99;
                  }
                }
              }
              _c105 = _q98;
            }
            let _c113: boolean = ((((v_t !== v_m) && !((b.grid[v_t] !== 0))) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (cl.borders[v_m].includes(v_t))));
            if (_c113) {
              let _q106 = true;
              Q107: {
                for (let _m108 = v_R; _m108 !== 0; _m108 &= _m108 - 1) {
                  const v_a = 31 - Math.clz32(_m108 & -_m108);
                  let _q109 = false;
                  Q110: {
                    const _a111 = cl.borders[v_m];
                    for (let _i112 = 0; _i112 < _a111.length; _i112++) {
                      const v_k = _a111[_i112];
                      if ((((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (cl.borders[v_t].includes(v_k)))) {
                        _q109 = true;
                        break Q110;
                      }
                    }
                  }
                  if (!(_q109)) {
                    _q106 = false;
                    break Q107;
                  }
                }
              }
              _c113 = _q106;
            }
            const _g114: number[] = [];
            G115: {
              for (let _m123 = v_R; _m123 !== 0; _m123 &= _m123 - 1) {
                const v_a = 31 - Math.clz32(_m123 & -_m123);
                const _g124: number[] = [];
                G125: {
                  const _a128 = cl.borders[v_m];
                  for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                    const v_k = _a128[_i129];
                    if (!((((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (cl.borders[v_t].includes(v_k))))) continue;
                    _g124.push(v_k);
                  }
                }
                const _t130 = (_g124.length > 0 ? _g124[0] : -1);
                if (!_g114.includes(_t130)) _g114.push(_t130);
              }
            }
            freshBinding("weigh", [(sp.cells.includes(v_m)), !((b.grid[v_m] !== 0)), (((b.domain >> v_x) & 1) !== 0), (v_R === ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)))), _c105, (sp.cells.includes(v_t)), _c113, sameSet(v_E, _g114)], ["m in", "where of m", "x in", "R =", "where of R", "t in", "where of t", "E ="]);
          }
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
