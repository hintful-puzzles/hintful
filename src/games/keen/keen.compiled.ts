// Compiled by `npm run describe` from src/games/keen/keen.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, STRIKE, clueAt, freshBinding, rangeMask, sameSet, staleChecking, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  cage: Partition;
  sum: ClueList;
  product: ClueList;
  difference: ClueList;
  quotient: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "cageEasy" | "latin.hiddenSingle" | "latin.single" | "cage" | "cageLine" | "latin.set" | "latin.fish" | "latin.wing";

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
  { id: "cageEasy", tier: 0, until: 1 },
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "cage", tier: 1 },
  { id: "cageLine", tier: 2 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
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
  for (let _k7 = 0; _k7 < cl.sum.at.length; _k7++) {
    const _at8 = cl.sum.at[_k7];
    const _v9 = cl.sum.v[_k7];
    let _g10 = 0;
    G11: {
      const _a12 = cl.cage.cells[_at8];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_c = _a12[_i13];
        const _h14 = (g[v_c] || -1);
        _g10 += _h14;
      }
    }
    if (!((_g10 === _v9))) return false;
  }
  for (let _k15 = 0; _k15 < cl.product.at.length; _k15++) {
    const _at16 = cl.product.at[_k15];
    const _v17 = cl.product.v[_k15];
    let _g18 = 1;
    G19: {
      const _a20 = cl.cage.cells[_at16];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        const _h22 = (g[v_c] || -1);
        _g18 *= _h22;
      }
    }
    if (!((_g18 === _v17))) return false;
  }
  for (let _k23 = 0; _k23 < cl.difference.at.length; _k23++) {
    const _at24 = cl.difference.at[_k23];
    const _v25 = cl.difference.v[_k23];
    let _g26 = -1;
    G27: {
      const _a28 = cl.cage.cells[_at24];
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_c = _a28[_i29];
        const _h30 = (g[v_c] || -1);
        if (_g26 === -1 || _h30 > _g26) _g26 = _h30;
      }
    }
    let _g31 = -1;
    G32: {
      const _a33 = cl.cage.cells[_at24];
      for (let _i34 = 0; _i34 < _a33.length; _i34++) {
        const v_c = _a33[_i34];
        const _h35 = (g[v_c] || -1);
        if (_g31 === -1 || _h35 < _g31) _g31 = _h35;
      }
    }
    if (!(((_g26 - _g31) === _v25))) return false;
  }
  for (let _k36 = 0; _k36 < cl.quotient.at.length; _k36++) {
    const _at37 = cl.quotient.at[_k36];
    const _v38 = cl.quotient.v[_k36];
    let _g39 = -1;
    G40: {
      const _a41 = cl.cage.cells[_at37];
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_c = _a41[_i42];
        const _h43 = (g[v_c] || -1);
        if (_g39 === -1 || _h43 > _g39) _g39 = _h43;
      }
    }
    let _g44 = -1;
    G45: {
      const _a46 = cl.cage.cells[_at37];
      for (let _i47 = 0; _i47 < _a46.length; _i47++) {
        const v_c = _a46[_i47];
        const _h48 = (g[v_c] || -1);
        if (_g44 === -1 || _h48 < _g44) _g44 = _h48;
      }
    }
    if (!((_g39 === (_v38 * _g44)))) return false;
  }
  return true;
}

export interface CageEasyBinding {
  r: number;
  K: readonly number[];
  D: number;
}

const cageEasyFacts: number[] = [];
let cageEasyCands = new Int32Array(0);
let cageEasy_f188 = new Int32Array(0);
let cageEasy_l189: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function cageEasy(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageEasyBinding> | null): number {
  if (cageEasy_f188.length < sp.cells.length) cageEasy_f188 = new Int32Array(sp.cells.length).fill(-1);
  else cageEasy_f188.fill(-1);
  cageEasy_l189 = [];
  const _s190: number[] = [];
  const facts = cageEasyFacts;
  let fired = 0;
  let changed = false;
  if (cageEasyCands.length < sp.cells.length) cageEasyCands = new Int32Array(sp.cells.length);
  const cands = cageEasyCands;
  cands.fill(-1);
  const _a124 = cl.cage.parts;
  for (let _i125 = 0; _i125 < _a124.length; _i125++) {
    const v_r = _a124[_i125];
    const _h196 = clueAt(cl.sum, v_r);
    const _h200 = clueAt(cl.product, v_r);
    const _h209 = (_h196 === -1);
    const _h215 = (_h200 === -1);
    const _h222 = clueAt(cl.difference, v_r);
    const _h223 = (_h222 === -1);
    const _h236 = clueAt(cl.quotient, v_r);
    const _h237 = (_h236 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g126 = 0;
    G127: {
      const _a187 = v_K;
      const _t197 = (_h196 === -1);
      const _lo198 = 31 - Math.clz32(b.domain & -b.domain);
      const _hi199 = 31 - Math.clz32(b.domain);
      const _t201 = (_h200 === -1);
      for (const _e191 of cageEasy_l189) cageEasy_f188[_e191] = -1;
      cageEasy_l189 = _a187;
      let _i193 = 0;
      _s190[0] = 0;
      let _o205 = _a187.length === 0;
      for (;;) {
        if (_a187.length === 0) {
          if (!_o205) break;
          _o205 = false;
        }
        while (_a187.length > 0 && _i193 >= 0) {
          const _e191 = _a187[_i193];
          if (_s190[_i193] > 0) cageEasy_f188[_e191] = -1;
          let _r204 = (cands[_e191] >= 0 ? cands[_e191] : (cands[_e191] = b.cands[_e191])) & ~((2 << _s190[_i193]) - 1);
          let _d192 = 0;
          V195: for (; _r204 !== 0; _r204 &= _r204 - 1) {
            _d192 = 31 - Math.clz32(_r204 & -_r204);
            cageEasy_f188[_e191] = _d192;
            for (let _j194 = 0; _j194 < _i193; _j194++) {
              const _y206 = _a187[_j194];
              if (!(((sp.rowOf[_e191] === sp.rowOf[_y206]) || (sp.colOf[_e191] === sp.colOf[_y206])))) continue;
              if (!((cageEasy_f188[_e191] !== cageEasy_f188[_y206]))) continue V195;
            }
            if (!_t197) {
              let _t207 = _d192;
              for (let _j194 = 0; _j194 < _i193; _j194++) _t207 += cageEasy_f188[_a187[_j194]];
              if (_t207 + (_a187.length - _i193 - 1) * _lo198 > _h196) continue;
              if (_t207 + (_a187.length - _i193 - 1) * _hi199 < _h196) continue;
            }
            if (!_t201) {
              let _t208 = _d192;
              for (let _j194 = 0; _j194 < _i193; _j194++) _t208 *= cageEasy_f188[_a187[_j194]];
              if (_t208 > 0 && _h200 % _t208 !== 0) continue;
            }
            break;
          }
          if (_r204 === 0) {
            _s190[_i193] = 0;
            _i193--;
            continue;
          }
          _s190[_i193] = _d192;
          if (_i193 === _a187.length - 1) break;
          _i193++;
          _s190[_i193] = 0;
        }
        if (_i193 < 0) break;
        let _c214: boolean = _h209;
        if (!_c214) {
          let _g210 = 0;
          G211: {
            const _a212 = cl.cage.cells[v_r];
            for (let _i213 = 0; _i213 < _a212.length; _i213++) {
              const v_x = _a212[_i213];
              _g210 += cageEasy_f188[v_x];
            }
          }
          _c214 = (_g210 === _h196);
        }
        let _c221: boolean = _c214;
        if (_c221) {
          let _c220: boolean = _h215;
          if (!_c220) {
            let _g216 = 1;
            G217: {
              const _a218 = cl.cage.cells[v_r];
              for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                const v_x = _a218[_i219];
                _g216 *= cageEasy_f188[v_x];
              }
            }
            _c220 = (_g216 === _h200);
          }
          _c221 = _c220;
        }
        let _c235: boolean = _c221;
        if (_c235) {
          let _c234: boolean = _h223;
          if (!_c234) {
            let _g224 = -1;
            G225: {
              const _a226 = cl.cage.cells[v_r];
              for (let _i227 = 0; _i227 < _a226.length; _i227++) {
                const v_x = _a226[_i227];
                const _t228 = cageEasy_f188[v_x];
                if (_g224 === -1 || _t228 > _g224) _g224 = _t228;
              }
            }
            let _g229 = -1;
            G230: {
              const _a231 = cl.cage.cells[v_r];
              for (let _i232 = 0; _i232 < _a231.length; _i232++) {
                const v_x = _a231[_i232];
                const _t233 = cageEasy_f188[v_x];
                if (_g229 === -1 || _t233 < _g229) _g229 = _t233;
              }
            }
            _c234 = ((_g224 - _g229) === _h222);
          }
          _c235 = _c234;
        }
        let _c249: boolean = _c235;
        if (_c249) {
          let _c248: boolean = _h237;
          if (!_c248) {
            let _g238 = -1;
            G239: {
              const _a240 = cl.cage.cells[v_r];
              for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                const v_x = _a240[_i241];
                const _t242 = cageEasy_f188[v_x];
                if (_g238 === -1 || _t242 > _g238) _g238 = _t242;
              }
            }
            let _g243 = -1;
            G244: {
              const _a245 = cl.cage.cells[v_r];
              for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                const v_x = _a245[_i246];
                const _t247 = cageEasy_f188[v_x];
                if (_g243 === -1 || _t247 < _g243) _g243 = _t247;
              }
            }
            _c248 = (_g238 === (_h236 * _g243));
          }
          _c249 = _c248;
        }
        if (!(_c249)) continue;
        const _a250 = v_K;
        for (let _i251 = 0; _i251 < _a250.length; _i251++) {
          const v_x = _a250[_i251];
          const _t252 = cageEasy_f188[v_x];
          _g126 |= 1 << _t252;
        }
      }
    }
    const v_D = _g126;
    if (DEV && staleChecking) {
      let _g253 = 0;
      G254: {
        const _f315 = new Int32Array(sp.cells.length).fill(-1);
        let _l316: readonly number[] = [];
        const _s317: number[] = [];
        const _a314 = v_K;
        const _t323 = (clueAt(cl.sum, v_r) === -1);
        const _t324 = clueAt(cl.sum, v_r);
        const _lo325 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi326 = 31 - Math.clz32(b.domain);
        const _t327 = (clueAt(cl.product, v_r) === -1);
        const _t328 = clueAt(cl.product, v_r);
        for (const _e318 of _l316) _f315[_e318] = -1;
        _l316 = _a314;
        let _i320 = 0;
        _s317[0] = 0;
        let _o332 = _a314.length === 0;
        for (;;) {
          if (_a314.length === 0) {
            if (!_o332) break;
            _o332 = false;
          }
          while (_a314.length > 0 && _i320 >= 0) {
            const _e318 = _a314[_i320];
            if (_s317[_i320] > 0) _f315[_e318] = -1;
            let _r331 = (cands[_e318] >= 0 ? cands[_e318] : (cands[_e318] = b.cands[_e318])) & ~((2 << _s317[_i320]) - 1);
            let _d319 = 0;
            V322: for (; _r331 !== 0; _r331 &= _r331 - 1) {
              _d319 = 31 - Math.clz32(_r331 & -_r331);
              _f315[_e318] = _d319;
              for (let _j321 = 0; _j321 < _i320; _j321++) {
                const _y333 = _a314[_j321];
                if (!(((sp.rowOf[_e318] === sp.rowOf[_y333]) || (sp.colOf[_e318] === sp.colOf[_y333])))) continue;
                if (!((_f315[_e318] !== _f315[_y333]))) continue V322;
              }
              if (!_t323) {
                let _t334 = _d319;
                for (let _j321 = 0; _j321 < _i320; _j321++) _t334 += _f315[_a314[_j321]];
                if (_t334 + (_a314.length - _i320 - 1) * _lo325 > _t324) continue;
                if (_t334 + (_a314.length - _i320 - 1) * _hi326 < _t324) continue;
              }
              if (!_t327) {
                let _t335 = _d319;
                for (let _j321 = 0; _j321 < _i320; _j321++) _t335 *= _f315[_a314[_j321]];
                if (_t335 > 0 && _t328 % _t335 !== 0) continue;
              }
              break;
            }
            if (_r331 === 0) {
              _s317[_i320] = 0;
              _i320--;
              continue;
            }
            _s317[_i320] = _d319;
            if (_i320 === _a314.length - 1) break;
            _i320++;
            _s317[_i320] = 0;
          }
          if (_i320 < 0) break;
          let _c340: boolean = (clueAt(cl.sum, v_r) === -1);
          if (!_c340) {
            let _g336 = 0;
            G337: {
              const _a338 = cl.cage.cells[v_r];
              for (let _i339 = 0; _i339 < _a338.length; _i339++) {
                const v_x = _a338[_i339];
                _g336 += _f315[v_x];
              }
            }
            _c340 = (_g336 === clueAt(cl.sum, v_r));
          }
          let _c346: boolean = _c340;
          if (_c346) {
            let _c345: boolean = (clueAt(cl.product, v_r) === -1);
            if (!_c345) {
              let _g341 = 1;
              G342: {
                const _a343 = cl.cage.cells[v_r];
                for (let _i344 = 0; _i344 < _a343.length; _i344++) {
                  const v_x = _a343[_i344];
                  _g341 *= _f315[v_x];
                }
              }
              _c345 = (_g341 === clueAt(cl.product, v_r));
            }
            _c346 = _c345;
          }
          let _c358: boolean = _c346;
          if (_c358) {
            let _c357: boolean = (clueAt(cl.difference, v_r) === -1);
            if (!_c357) {
              let _g347 = -1;
              G348: {
                const _a349 = cl.cage.cells[v_r];
                for (let _i350 = 0; _i350 < _a349.length; _i350++) {
                  const v_x = _a349[_i350];
                  const _t351 = _f315[v_x];
                  if (_g347 === -1 || _t351 > _g347) _g347 = _t351;
                }
              }
              let _g352 = -1;
              G353: {
                const _a354 = cl.cage.cells[v_r];
                for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                  const v_x = _a354[_i355];
                  const _t356 = _f315[v_x];
                  if (_g352 === -1 || _t356 < _g352) _g352 = _t356;
                }
              }
              _c357 = ((_g347 - _g352) === clueAt(cl.difference, v_r));
            }
            _c358 = _c357;
          }
          let _c370: boolean = _c358;
          if (_c370) {
            let _c369: boolean = (clueAt(cl.quotient, v_r) === -1);
            if (!_c369) {
              let _g359 = -1;
              G360: {
                const _a361 = cl.cage.cells[v_r];
                for (let _i362 = 0; _i362 < _a361.length; _i362++) {
                  const v_x = _a361[_i362];
                  const _t363 = _f315[v_x];
                  if (_g359 === -1 || _t363 > _g359) _g359 = _t363;
                }
              }
              let _g364 = -1;
              G365: {
                const _a366 = cl.cage.cells[v_r];
                for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                  const v_x = _a366[_i367];
                  const _t368 = _f315[v_x];
                  if (_g364 === -1 || _t368 < _g364) _g364 = _t368;
                }
              }
              _c369 = (_g359 === (clueAt(cl.quotient, v_r) * _g364));
            }
            _c370 = _c369;
          }
          if (!(_c370)) continue;
          const _a371 = v_K;
          for (let _i372 = 0; _i372 < _a371.length; _i372++) {
            const v_x = _a371[_i372];
            const _t373 = _f315[v_x];
            _g253 |= 1 << _t373;
          }
        }
      }
      freshBinding("cageEasy", [(cl.cage.parts.includes(v_r)), sameSet(v_K, cl.cage.cells[v_r]), (v_D === _g253)], ["r in", "K =", "D ="]);
    }
    facts.length = 0;
    changed = false;
    let _q374 = true;
    Q375: {
      const _a376 = v_K;
      for (let _i377 = 0; _i377 < _a376.length; _i377++) {
        const v_c = _a376[_i377];
        for (let _m378 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m378 !== 0; _m378 &= _m378 - 1) {
          const v_d = 31 - Math.clz32(_m378 & -_m378);
          if (!(!(((v_D >> v_d) & 1) !== 0))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q374 = false;
            break Q375;
          }
        }
      }
    }
    if (!(_q374)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ r: v_r, K: v_K.slice(), D: v_D }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface CageBinding {
  r: number;
  K: readonly number[];
}

const cageFacts: number[] = [];
let cageCands = new Int32Array(0);
let cage_p10 = new Int32Array(0);
let cage_l11: readonly number[] = [];
let cage_f16 = new Int32Array(0);
let cage_l17: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function cage(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageBinding> | null): number {
  if (cage_p10.length < sp.cells.length) cage_p10 = new Int32Array(sp.cells.length);
  else cage_p10.fill(0);
  cage_l11 = [];
  let _y12 = false;
  if (cage_f16.length < sp.cells.length) cage_f16 = new Int32Array(sp.cells.length).fill(-1);
  else cage_f16.fill(-1);
  cage_l17 = [];
  const _s18: number[] = [];
  const facts = cageFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (cageCands.length < sp.cells.length) cageCands = new Int32Array(sp.cells.length);
  const cands = cageCands;
  cands.fill(-1);
  const _a3 = cl.cage.parts;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_r = _a3[_i4];
    const _h24 = clueAt(cl.sum, v_r);
    const _h25 = (_h24 === -1);
    const _h28 = clueAt(cl.product, v_r);
    const _h29 = (_h28 === -1);
    const _h48 = clueAt(cl.difference, v_r);
    const _h49 = (_h48 === -1);
    const _h62 = clueAt(cl.quotient, v_r);
    const _h63 = (_h62 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g13 = -1;
    if (DEV && staleChecking) {
      freshBinding("cage", [(cl.cage.parts.includes(v_r)), sameSet(v_K, cl.cage.cells[v_r])], ["r in", "K ="]);
    }
    facts.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      const _a7 = v_K;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_c = _a7[_i8];
        for (let _m9 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m9 !== 0; _m9 &= _m9 - 1) {
          const v_d = 31 - Math.clz32(_m9 & -_m9);
          if (_g13 !== _epoch) {
            _g13 = _epoch;
            for (const _e14 of cage_l11) cage_p10[_e14] = 0;
            _y12 = false;
            const _a15 = v_K;
            const _lo26 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi27 = 31 - Math.clz32(b.domain);
            for (const _e19 of cage_l17) cage_f16[_e19] = -1;
            cage_l17 = _a15;
            let _i21 = 0;
            _s18[0] = 0;
            let _o33 = _a15.length === 0;
            for (;;) {
              if (_a15.length === 0) {
                if (!_o33) break;
                _o33 = false;
              }
              while (_a15.length > 0 && _i21 >= 0) {
                const _e19 = _a15[_i21];
                if (_s18[_i21] > 0) cage_f16[_e19] = -1;
                let _r32 = (cands[_e19] >= 0 ? cands[_e19] : (cands[_e19] = b.cands[_e19])) & ~((2 << _s18[_i21]) - 1);
                let _d20 = 0;
                V23: for (; _r32 !== 0; _r32 &= _r32 - 1) {
                  _d20 = 31 - Math.clz32(_r32 & -_r32);
                  cage_f16[_e19] = _d20;
                  for (let _j22 = 0; _j22 < _i21; _j22++) {
                    const _y34 = _a15[_j22];
                    if (!(((sp.rowOf[_e19] === sp.rowOf[_y34]) || (sp.colOf[_e19] === sp.colOf[_y34])))) continue;
                    if (!((cage_f16[_e19] !== cage_f16[_y34]))) continue V23;
                  }
                  if (!_h25) {
                    let _t35 = _d20;
                    for (let _j22 = 0; _j22 < _i21; _j22++) _t35 += cage_f16[_a15[_j22]];
                    if (_t35 + (_a15.length - _i21 - 1) * _lo26 > _h24) continue;
                    if (_t35 + (_a15.length - _i21 - 1) * _hi27 < _h24) continue;
                  }
                  if (!_h29) {
                    let _t36 = _d20;
                    for (let _j22 = 0; _j22 < _i21; _j22++) _t36 *= cage_f16[_a15[_j22]];
                    if (_t36 > 0 && _h28 % _t36 !== 0) continue;
                  }
                  break;
                }
                if (_r32 === 0) {
                  _s18[_i21] = 0;
                  _i21--;
                  continue;
                }
                _s18[_i21] = _d20;
                if (_i21 === _a15.length - 1) break;
                _i21++;
                _s18[_i21] = 0;
              }
              if (_i21 < 0) break;
              let _c41: boolean = _h25;
              if (!_c41) {
                let _g37 = 0;
                G38: {
                  const _a39 = cl.cage.cells[v_r];
                  for (let _i40 = 0; _i40 < _a39.length; _i40++) {
                    const v_x = _a39[_i40];
                    _g37 += cage_f16[v_x];
                  }
                }
                _c41 = (_g37 === _h24);
              }
              let _c47: boolean = _c41;
              if (_c47) {
                let _c46: boolean = _h29;
                if (!_c46) {
                  let _g42 = 1;
                  G43: {
                    const _a44 = cl.cage.cells[v_r];
                    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                      const v_x = _a44[_i45];
                      _g42 *= cage_f16[v_x];
                    }
                  }
                  _c46 = (_g42 === _h28);
                }
                _c47 = _c46;
              }
              let _c61: boolean = _c47;
              if (_c61) {
                let _c60: boolean = _h49;
                if (!_c60) {
                  let _g50 = -1;
                  G51: {
                    const _a52 = cl.cage.cells[v_r];
                    for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                      const v_x = _a52[_i53];
                      const _t54 = cage_f16[v_x];
                      if (_g50 === -1 || _t54 > _g50) _g50 = _t54;
                    }
                  }
                  let _g55 = -1;
                  G56: {
                    const _a57 = cl.cage.cells[v_r];
                    for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                      const v_x = _a57[_i58];
                      const _t59 = cage_f16[v_x];
                      if (_g55 === -1 || _t59 < _g55) _g55 = _t59;
                    }
                  }
                  _c60 = ((_g50 - _g55) === _h48);
                }
                _c61 = _c60;
              }
              let _c75: boolean = _c61;
              if (_c75) {
                let _c74: boolean = _h63;
                if (!_c74) {
                  let _g64 = -1;
                  G65: {
                    const _a66 = cl.cage.cells[v_r];
                    for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                      const v_x = _a66[_i67];
                      const _t68 = cage_f16[v_x];
                      if (_g64 === -1 || _t68 > _g64) _g64 = _t68;
                    }
                  }
                  let _g69 = -1;
                  G70: {
                    const _a71 = cl.cage.cells[v_r];
                    for (let _i72 = 0; _i72 < _a71.length; _i72++) {
                      const v_x = _a71[_i72];
                      const _t73 = cage_f16[v_x];
                      if (_g69 === -1 || _t73 < _g69) _g69 = _t73;
                    }
                  }
                  _c74 = (_g64 === (_h62 * _g69));
                }
                _c75 = _c74;
              }
              if (!(_c75)) continue;
              if (!(true)) continue;
              cage_l11 = _a15;
              _y12 = true;
              for (const _e14 of _a15) cage_p10[_e14] |= 1 << cage_f16[_e14];
            }
          }
          if (!(!(((((cage_p10[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y12 && !v_K.includes(v_c)))))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q5 = false;
            break Q6;
          }
        }
      }
    }
    if (!(_q5)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ r: v_r, K: v_K.slice() }, facts)) return 1;
      cands.fill(-1);
      _epoch++;
    }
  }
  return fired;
}

export interface CageLineBinding {
  r: number;
  K: readonly number[];
  L: number;
}

const cageLineFacts: number[] = [];
let cageLineCands = new Int32Array(0);
let cageLine_f16 = new Int32Array(0);
let cageLine_l17: readonly number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function cageLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageLineBinding> | null): number {
  if (cageLine_f16.length < sp.cells.length) cageLine_f16 = new Int32Array(sp.cells.length).fill(-1);
  else cageLine_f16.fill(-1);
  cageLine_l17 = [];
  const _s18: number[] = [];
  const facts = cageLineFacts;
  let fired = 0;
  let changed = false;
  const _h7 = union(sp.cols, sp.rows);
  if (cageLineCands.length < sp.cells.length) cageLineCands = new Int32Array(sp.cells.length);
  const cands = cageLineCands;
  cands.fill(-1);
  const _a5 = cl.cage.parts;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_r = _a5[_i6];
    const _h24 = clueAt(cl.sum, v_r);
    const _h25 = (_h24 === -1);
    const _h28 = clueAt(cl.product, v_r);
    const _h29 = (_h28 === -1);
    const _h48 = clueAt(cl.difference, v_r);
    const _h49 = (_h48 === -1);
    const _h62 = clueAt(cl.quotient, v_r);
    const _h63 = (_h62 === -1);
    const v_K = cl.cage.cells[v_r];
    const _a8 = _h7;
    for (let _i9 = 0; _i9 < _a8.length; _i9++) {
      const v_L = _a8[_i9];
      if (DEV && staleChecking) {
        freshBinding("cageLine", [(cl.cage.parts.includes(v_r)), sameSet(v_K, cl.cage.cells[v_r]), (union(sp.cols, sp.rows).includes(v_L))], ["r in", "K =", "L in"]);
      }
      facts.length = 0;
      changed = false;
      let _q10 = true;
      Q11: {
        for (let _m12 = b.domain; _m12 !== 0; _m12 &= _m12 - 1) {
          const v_d = 31 - Math.clz32(_m12 & -_m12);
          let _q13 = true;
          Q14: {
            const _a15 = v_K;
            const _lo26 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi27 = 31 - Math.clz32(b.domain);
            for (const _e19 of cageLine_l17) cageLine_f16[_e19] = -1;
            cageLine_l17 = _a15;
            let _i21 = 0;
            _s18[0] = 0;
            let _o33 = _a15.length === 0;
            for (;;) {
              if (_a15.length === 0) {
                if (!_o33) break;
                _o33 = false;
              }
              while (_a15.length > 0 && _i21 >= 0) {
                const _e19 = _a15[_i21];
                if (_s18[_i21] > 0) cageLine_f16[_e19] = -1;
                let _r32 = (cands[_e19] >= 0 ? cands[_e19] : (cands[_e19] = b.cands[_e19])) & ~((2 << _s18[_i21]) - 1);
                let _d20 = 0;
                V23: for (; _r32 !== 0; _r32 &= _r32 - 1) {
                  _d20 = 31 - Math.clz32(_r32 & -_r32);
                  cageLine_f16[_e19] = _d20;
                  for (let _j22 = 0; _j22 < _i21; _j22++) {
                    const _y34 = _a15[_j22];
                    if (!(((sp.rowOf[_e19] === sp.rowOf[_y34]) || (sp.colOf[_e19] === sp.colOf[_y34])))) continue;
                    if (!((cageLine_f16[_e19] !== cageLine_f16[_y34]))) continue V23;
                  }
                  if (!_h25) {
                    let _t35 = _d20;
                    for (let _j22 = 0; _j22 < _i21; _j22++) _t35 += cageLine_f16[_a15[_j22]];
                    if (_t35 + (_a15.length - _i21 - 1) * _lo26 > _h24) continue;
                    if (_t35 + (_a15.length - _i21 - 1) * _hi27 < _h24) continue;
                  }
                  if (!_h29) {
                    let _t36 = _d20;
                    for (let _j22 = 0; _j22 < _i21; _j22++) _t36 *= cageLine_f16[_a15[_j22]];
                    if (_t36 > 0 && _h28 % _t36 !== 0) continue;
                  }
                  break;
                }
                if (_r32 === 0) {
                  _s18[_i21] = 0;
                  _i21--;
                  continue;
                }
                _s18[_i21] = _d20;
                if (_i21 === _a15.length - 1) break;
                _i21++;
                _s18[_i21] = 0;
              }
              if (_i21 < 0) break;
              let _c41: boolean = _h25;
              if (!_c41) {
                let _g37 = 0;
                G38: {
                  const _a39 = cl.cage.cells[v_r];
                  for (let _i40 = 0; _i40 < _a39.length; _i40++) {
                    const v_x = _a39[_i40];
                    _g37 += cageLine_f16[v_x];
                  }
                }
                _c41 = (_g37 === _h24);
              }
              let _c47: boolean = _c41;
              if (_c47) {
                let _c46: boolean = _h29;
                if (!_c46) {
                  let _g42 = 1;
                  G43: {
                    const _a44 = cl.cage.cells[v_r];
                    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                      const v_x = _a44[_i45];
                      _g42 *= cageLine_f16[v_x];
                    }
                  }
                  _c46 = (_g42 === _h28);
                }
                _c47 = _c46;
              }
              let _c61: boolean = _c47;
              if (_c61) {
                let _c60: boolean = _h49;
                if (!_c60) {
                  let _g50 = -1;
                  G51: {
                    const _a52 = cl.cage.cells[v_r];
                    for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                      const v_x = _a52[_i53];
                      const _t54 = cageLine_f16[v_x];
                      if (_g50 === -1 || _t54 > _g50) _g50 = _t54;
                    }
                  }
                  let _g55 = -1;
                  G56: {
                    const _a57 = cl.cage.cells[v_r];
                    for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                      const v_x = _a57[_i58];
                      const _t59 = cageLine_f16[v_x];
                      if (_g55 === -1 || _t59 < _g55) _g55 = _t59;
                    }
                  }
                  _c60 = ((_g50 - _g55) === _h48);
                }
                _c61 = _c60;
              }
              let _c75: boolean = _c61;
              if (_c75) {
                let _c74: boolean = _h63;
                if (!_c74) {
                  let _g64 = -1;
                  G65: {
                    const _a66 = cl.cage.cells[v_r];
                    for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                      const v_x = _a66[_i67];
                      const _t68 = cageLine_f16[v_x];
                      if (_g64 === -1 || _t68 > _g64) _g64 = _t68;
                    }
                  }
                  let _g69 = -1;
                  G70: {
                    const _a71 = cl.cage.cells[v_r];
                    for (let _i72 = 0; _i72 < _a71.length; _i72++) {
                      const v_x = _a71[_i72];
                      const _t73 = cageLine_f16[v_x];
                      if (_g69 === -1 || _t73 < _g69) _g69 = _t73;
                    }
                  }
                  _c74 = (_g64 === (_h62 * _g69));
                }
                _c75 = _c74;
              }
              if (!(_c75)) continue;
              let _q76 = false;
              Q77: {
                const _a78 = sp.lineCells[v_L];
                for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                  const v_x = _a78[_i79];
                  if (((v_K.includes(v_x)) && (cageLine_f16[v_x] === v_d))) {
                    _q76 = true;
                    break Q77;
                  }
                }
              }
              if (!(_q76)) {
                _q13 = false;
                break Q14;
              }
            }
          }
          if (!(_q13)) continue;
          const _a80 = sp.lineCells[v_L];
          for (let _i81 = 0; _i81 < _a80.length; _i81++) {
            const v_c = _a80[_i81];
            if (!(!(v_K.includes(v_c)))) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q10 = false;
              break Q11;
            }
          }
        }
      }
      if (!(_q10)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K.slice(), L: v_L }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
