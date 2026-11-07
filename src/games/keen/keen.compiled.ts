// Compiled by `npm run describe` from src/games/keen/keen.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, STRIKE, clueAt, rangeMask, union } from "../../engine/describe-runtime.ts";

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
export const tiers: readonly string[] = ["Easy","Normal","Hard","Extreme","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q417 = true;
  const _n421 = new Int32Array(32);
  Q418: for (const _u419 of sp.lines) {
    _n421.fill(0);
    for (const _c420 of sp.lineCells[_u419]) {
      const _t422 = (g[_c420] || -1);
      if (++_n421[_t422] > 1) {
        _q417 = false;
        break Q418;
      }
    }
  }
  if (!(_q417)) return false;
  for (let _k423 = 0; _k423 < cl.sum.at.length; _k423++) {
    const _at424 = cl.sum.at[_k423];
    const _v425 = cl.sum.v[_k423];
    let _g426 = 0;
    G427: {
      const _a428 = cl.cage.cells[_at424];
      for (let _i429 = 0; _i429 < _a428.length; _i429++) {
        const v_c = _a428[_i429];
        const _h430 = (g[v_c] || -1);
        _g426 += _h430;
      }
    }
    if (!((_g426 === _v425))) return false;
  }
  for (let _k431 = 0; _k431 < cl.product.at.length; _k431++) {
    const _at432 = cl.product.at[_k431];
    const _v433 = cl.product.v[_k431];
    let _g434 = 1;
    G435: {
      const _a436 = cl.cage.cells[_at432];
      for (let _i437 = 0; _i437 < _a436.length; _i437++) {
        const v_c = _a436[_i437];
        const _h438 = (g[v_c] || -1);
        _g434 *= _h438;
      }
    }
    if (!((_g434 === _v433))) return false;
  }
  for (let _k439 = 0; _k439 < cl.difference.at.length; _k439++) {
    const _at440 = cl.difference.at[_k439];
    const _v441 = cl.difference.v[_k439];
    let _g442 = -1;
    G443: {
      const _a444 = cl.cage.cells[_at440];
      for (let _i445 = 0; _i445 < _a444.length; _i445++) {
        const v_c = _a444[_i445];
        const _h446 = (g[v_c] || -1);
        if (_g442 === -1 || _h446 > _g442) _g442 = _h446;
      }
    }
    let _g447 = -1;
    G448: {
      const _a449 = cl.cage.cells[_at440];
      for (let _i450 = 0; _i450 < _a449.length; _i450++) {
        const v_c = _a449[_i450];
        const _h451 = (g[v_c] || -1);
        if (_g447 === -1 || _h451 < _g447) _g447 = _h451;
      }
    }
    if (!(((_g442 - _g447) === _v441))) return false;
  }
  for (let _k452 = 0; _k452 < cl.quotient.at.length; _k452++) {
    const _at453 = cl.quotient.at[_k452];
    const _v454 = cl.quotient.v[_k452];
    let _g455 = -1;
    G456: {
      const _a457 = cl.cage.cells[_at453];
      for (let _i458 = 0; _i458 < _a457.length; _i458++) {
        const v_c = _a457[_i458];
        const _h459 = (g[v_c] || -1);
        if (_g455 === -1 || _h459 > _g455) _g455 = _h459;
      }
    }
    let _g460 = -1;
    G461: {
      const _a462 = cl.cage.cells[_at453];
      for (let _i463 = 0; _i463 < _a462.length; _i463++) {
        const v_c = _a462[_i463];
        const _h464 = (g[v_c] || -1);
        if (_g460 === -1 || _h464 < _g460) _g460 = _h464;
      }
    }
    if (!((_g455 === (_v454 * _g460)))) return false;
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

export function cageEasy(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageEasyBinding> | null): number {
  const _f192 = new Int32Array(sp.cells.length).fill(-1);
  let _l193: readonly number[] = [];
  const _s194: number[] = [];
  const facts = cageEasyFacts;
  let fired = 0;
  let changed = false;
  if (cageEasyCands.length < sp.cells.length) cageEasyCands = new Int32Array(sp.cells.length);
  const cands = cageEasyCands;
  cands.fill(-1);
  const _a128 = cl.cage.parts;
  for (let _i129 = 0; _i129 < _a128.length; _i129++) {
    const v_r = _a128[_i129];
    const _h200 = clueAt(cl.sum, v_r);
    const _h204 = clueAt(cl.product, v_r);
    const _h213 = (_h200 === -1);
    const _h219 = (_h204 === -1);
    const _h226 = clueAt(cl.difference, v_r);
    const _h227 = (_h226 === -1);
    const _h240 = clueAt(cl.quotient, v_r);
    const _h241 = (_h240 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g130 = 0;
    G131: {
      const _a191 = v_K;
      const _t201 = (_h200 === -1);
      const _lo202 = 31 - Math.clz32(b.domain & -b.domain);
      const _hi203 = 31 - Math.clz32(b.domain);
      const _t205 = (_h204 === -1);
      for (const _e195 of _l193) _f192[_e195] = -1;
      _l193 = _a191;
      let _i197 = 0;
      _s194[0] = 0;
      let _o209 = _a191.length === 0;
      for (;;) {
        if (_a191.length === 0) {
          if (!_o209) break;
          _o209 = false;
        }
        while (_a191.length > 0 && _i197 >= 0) {
          const _e195 = _a191[_i197];
          if (_s194[_i197] > 0) _f192[_e195] = -1;
          let _r208 = (cands[_e195] >= 0 ? cands[_e195] : (cands[_e195] = b.cand(_e195))) & ~((2 << _s194[_i197]) - 1);
          let _d196 = 0;
          V199: for (; _r208 !== 0; _r208 &= _r208 - 1) {
            _d196 = 31 - Math.clz32(_r208 & -_r208);
            _f192[_e195] = _d196;
            for (let _j198 = 0; _j198 < _i197; _j198++) {
              const _y210 = _a191[_j198];
              if (!(((sp.rowOf[_e195] === sp.rowOf[_y210]) || (sp.colOf[_e195] === sp.colOf[_y210])))) continue;
              if (!((_f192[_e195] !== _f192[_y210]))) continue V199;
            }
            if (!_t201) {
              let _t211 = _d196;
              for (let _j198 = 0; _j198 < _i197; _j198++) _t211 += _f192[_a191[_j198]];
              if (_t211 + (_a191.length - _i197 - 1) * _lo202 > _h200) continue;
              if (_t211 + (_a191.length - _i197 - 1) * _hi203 < _h200) continue;
            }
            if (!_t205) {
              let _t212 = _d196;
              for (let _j198 = 0; _j198 < _i197; _j198++) _t212 *= _f192[_a191[_j198]];
              if (_t212 > 0 && _h204 % _t212 !== 0) continue;
            }
            break;
          }
          if (_r208 === 0) {
            _s194[_i197] = 0;
            _i197--;
            continue;
          }
          _s194[_i197] = _d196;
          if (_i197 === _a191.length - 1) break;
          _i197++;
          _s194[_i197] = 0;
        }
        if (_i197 < 0) break;
        let _c218: boolean = _h213;
        if (!_c218) {
          let _g214 = 0;
          G215: {
            const _a216 = cl.cage.cells[v_r];
            for (let _i217 = 0; _i217 < _a216.length; _i217++) {
              const v_x = _a216[_i217];
              _g214 += _f192[v_x];
            }
          }
          _c218 = (_g214 === _h200);
        }
        let _c225: boolean = _c218;
        if (_c225) {
          let _c224: boolean = _h219;
          if (!_c224) {
            let _g220 = 1;
            G221: {
              const _a222 = cl.cage.cells[v_r];
              for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                const v_x = _a222[_i223];
                _g220 *= _f192[v_x];
              }
            }
            _c224 = (_g220 === _h204);
          }
          _c225 = _c224;
        }
        let _c239: boolean = _c225;
        if (_c239) {
          let _c238: boolean = _h227;
          if (!_c238) {
            let _g228 = -1;
            G229: {
              const _a230 = cl.cage.cells[v_r];
              for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                const v_x = _a230[_i231];
                const _t232 = _f192[v_x];
                if (_g228 === -1 || _t232 > _g228) _g228 = _t232;
              }
            }
            let _g233 = -1;
            G234: {
              const _a235 = cl.cage.cells[v_r];
              for (let _i236 = 0; _i236 < _a235.length; _i236++) {
                const v_x = _a235[_i236];
                const _t237 = _f192[v_x];
                if (_g233 === -1 || _t237 < _g233) _g233 = _t237;
              }
            }
            _c238 = ((_g228 - _g233) === _h226);
          }
          _c239 = _c238;
        }
        let _c253: boolean = _c239;
        if (_c253) {
          let _c252: boolean = _h241;
          if (!_c252) {
            let _g242 = -1;
            G243: {
              const _a244 = cl.cage.cells[v_r];
              for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                const v_x = _a244[_i245];
                const _t246 = _f192[v_x];
                if (_g242 === -1 || _t246 > _g242) _g242 = _t246;
              }
            }
            let _g247 = -1;
            G248: {
              const _a249 = cl.cage.cells[v_r];
              for (let _i250 = 0; _i250 < _a249.length; _i250++) {
                const v_x = _a249[_i250];
                const _t251 = _f192[v_x];
                if (_g247 === -1 || _t251 < _g247) _g247 = _t251;
              }
            }
            _c252 = (_g242 === (_h240 * _g247));
          }
          _c253 = _c252;
        }
        if (!(_c253)) continue;
        const _a254 = v_K;
        for (let _i255 = 0; _i255 < _a254.length; _i255++) {
          const v_x = _a254[_i255];
          const _t256 = _f192[v_x];
          _g130 |= 1 << _t256;
        }
      }
    }
    const v_D = _g130;
    facts.length = 0;
    changed = false;
    let _q257 = true;
    Q258: {
      const _a259 = v_K;
      for (let _i260 = 0; _i260 < _a259.length; _i260++) {
        const v_c = _a259[_i260];
        for (let _m261 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m261 !== 0; _m261 &= _m261 - 1) {
          const v_d = 31 - Math.clz32(_m261 & -_m261);
          if (!(!(((v_D >> v_d) & 1) !== 0))) continue;
          if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q257 = false;
            break Q258;
          }
        }
      }
    }
    if (!(_q257)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ r: v_r, K: v_K, D: v_D }, facts)) return 1;
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

export function cage(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageBinding> | null): number {
  const _p271 = new Int32Array(sp.cells.length);
  let _l272: readonly number[] = [];
  let _y273 = false;
  const _f277 = new Int32Array(sp.cells.length).fill(-1);
  let _l278: readonly number[] = [];
  const _s279: number[] = [];
  const facts = cageFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (cageCands.length < sp.cells.length) cageCands = new Int32Array(sp.cells.length);
  const cands = cageCands;
  cands.fill(-1);
  const _a264 = cl.cage.parts;
  for (let _i265 = 0; _i265 < _a264.length; _i265++) {
    const v_r = _a264[_i265];
    const _h285 = clueAt(cl.sum, v_r);
    const _h286 = (_h285 === -1);
    const _h289 = clueAt(cl.product, v_r);
    const _h290 = (_h289 === -1);
    const _h309 = clueAt(cl.difference, v_r);
    const _h310 = (_h309 === -1);
    const _h323 = clueAt(cl.quotient, v_r);
    const _h324 = (_h323 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g274 = -1;
    facts.length = 0;
    changed = false;
    let _q266 = true;
    Q267: {
      const _a268 = v_K;
      for (let _i269 = 0; _i269 < _a268.length; _i269++) {
        const v_c = _a268[_i269];
        for (let _m270 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m270 !== 0; _m270 &= _m270 - 1) {
          const v_d = 31 - Math.clz32(_m270 & -_m270);
          if (_g274 !== _epoch) {
            _g274 = _epoch;
            for (const _e275 of _l272) _p271[_e275] = 0;
            _y273 = false;
            const _a276 = v_K;
            const _lo287 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi288 = 31 - Math.clz32(b.domain);
            for (const _e280 of _l278) _f277[_e280] = -1;
            _l278 = _a276;
            let _i282 = 0;
            _s279[0] = 0;
            let _o294 = _a276.length === 0;
            for (;;) {
              if (_a276.length === 0) {
                if (!_o294) break;
                _o294 = false;
              }
              while (_a276.length > 0 && _i282 >= 0) {
                const _e280 = _a276[_i282];
                if (_s279[_i282] > 0) _f277[_e280] = -1;
                let _r293 = (cands[_e280] >= 0 ? cands[_e280] : (cands[_e280] = b.cand(_e280))) & ~((2 << _s279[_i282]) - 1);
                let _d281 = 0;
                V284: for (; _r293 !== 0; _r293 &= _r293 - 1) {
                  _d281 = 31 - Math.clz32(_r293 & -_r293);
                  _f277[_e280] = _d281;
                  for (let _j283 = 0; _j283 < _i282; _j283++) {
                    const _y295 = _a276[_j283];
                    if (!(((sp.rowOf[_e280] === sp.rowOf[_y295]) || (sp.colOf[_e280] === sp.colOf[_y295])))) continue;
                    if (!((_f277[_e280] !== _f277[_y295]))) continue V284;
                  }
                  if (!_h286) {
                    let _t296 = _d281;
                    for (let _j283 = 0; _j283 < _i282; _j283++) _t296 += _f277[_a276[_j283]];
                    if (_t296 + (_a276.length - _i282 - 1) * _lo287 > _h285) continue;
                    if (_t296 + (_a276.length - _i282 - 1) * _hi288 < _h285) continue;
                  }
                  if (!_h290) {
                    let _t297 = _d281;
                    for (let _j283 = 0; _j283 < _i282; _j283++) _t297 *= _f277[_a276[_j283]];
                    if (_t297 > 0 && _h289 % _t297 !== 0) continue;
                  }
                  break;
                }
                if (_r293 === 0) {
                  _s279[_i282] = 0;
                  _i282--;
                  continue;
                }
                _s279[_i282] = _d281;
                if (_i282 === _a276.length - 1) break;
                _i282++;
                _s279[_i282] = 0;
              }
              if (_i282 < 0) break;
              let _c302: boolean = _h286;
              if (!_c302) {
                let _g298 = 0;
                G299: {
                  const _a300 = cl.cage.cells[v_r];
                  for (let _i301 = 0; _i301 < _a300.length; _i301++) {
                    const v_x = _a300[_i301];
                    _g298 += _f277[v_x];
                  }
                }
                _c302 = (_g298 === _h285);
              }
              let _c308: boolean = _c302;
              if (_c308) {
                let _c307: boolean = _h290;
                if (!_c307) {
                  let _g303 = 1;
                  G304: {
                    const _a305 = cl.cage.cells[v_r];
                    for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                      const v_x = _a305[_i306];
                      _g303 *= _f277[v_x];
                    }
                  }
                  _c307 = (_g303 === _h289);
                }
                _c308 = _c307;
              }
              let _c322: boolean = _c308;
              if (_c322) {
                let _c321: boolean = _h310;
                if (!_c321) {
                  let _g311 = -1;
                  G312: {
                    const _a313 = cl.cage.cells[v_r];
                    for (let _i314 = 0; _i314 < _a313.length; _i314++) {
                      const v_x = _a313[_i314];
                      const _t315 = _f277[v_x];
                      if (_g311 === -1 || _t315 > _g311) _g311 = _t315;
                    }
                  }
                  let _g316 = -1;
                  G317: {
                    const _a318 = cl.cage.cells[v_r];
                    for (let _i319 = 0; _i319 < _a318.length; _i319++) {
                      const v_x = _a318[_i319];
                      const _t320 = _f277[v_x];
                      if (_g316 === -1 || _t320 < _g316) _g316 = _t320;
                    }
                  }
                  _c321 = ((_g311 - _g316) === _h309);
                }
                _c322 = _c321;
              }
              let _c336: boolean = _c322;
              if (_c336) {
                let _c335: boolean = _h324;
                if (!_c335) {
                  let _g325 = -1;
                  G326: {
                    const _a327 = cl.cage.cells[v_r];
                    for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                      const v_x = _a327[_i328];
                      const _t329 = _f277[v_x];
                      if (_g325 === -1 || _t329 > _g325) _g325 = _t329;
                    }
                  }
                  let _g330 = -1;
                  G331: {
                    const _a332 = cl.cage.cells[v_r];
                    for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                      const v_x = _a332[_i333];
                      const _t334 = _f277[v_x];
                      if (_g330 === -1 || _t334 < _g330) _g330 = _t334;
                    }
                  }
                  _c335 = (_g325 === (_h323 * _g330));
                }
                _c336 = _c335;
              }
              if (!(_c336)) continue;
              if (!(true)) continue;
              _l272 = _a276;
              _y273 = true;
              for (const _e275 of _a276) _p271[_e275] |= 1 << _f277[_e275];
            }
          }
          if (!(!(((((_p271[v_c] >> v_d) & 1) !== 0) || (v_d === -1 && _y273 && !v_K.includes(v_c)))))) continue;
          if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q266 = false;
            break Q267;
          }
        }
      }
    }
    if (!(_q266)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ r: v_r, K: v_K }, facts)) return 1;
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

export function cageLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageLineBinding> | null): number {
  const _f351 = new Int32Array(sp.cells.length).fill(-1);
  let _l352: readonly number[] = [];
  const _s353: number[] = [];
  const facts = cageLineFacts;
  let fired = 0;
  let changed = false;
  if (cageLineCands.length < sp.cells.length) cageLineCands = new Int32Array(sp.cells.length);
  const cands = cageLineCands;
  cands.fill(-1);
  const _a341 = cl.cage.parts;
  for (let _i342 = 0; _i342 < _a341.length; _i342++) {
    const v_r = _a341[_i342];
    const _h359 = clueAt(cl.sum, v_r);
    const _h360 = (_h359 === -1);
    const _h363 = clueAt(cl.product, v_r);
    const _h364 = (_h363 === -1);
    const _h383 = clueAt(cl.difference, v_r);
    const _h384 = (_h383 === -1);
    const _h397 = clueAt(cl.quotient, v_r);
    const _h398 = (_h397 === -1);
    const v_K = cl.cage.cells[v_r];
    const _a343 = union(sp.cols, sp.rows);
    for (let _i344 = 0; _i344 < _a343.length; _i344++) {
      const v_L = _a343[_i344];
      facts.length = 0;
      changed = false;
      let _q345 = true;
      Q346: {
        for (let _m347 = b.domain; _m347 !== 0; _m347 &= _m347 - 1) {
          const v_d = 31 - Math.clz32(_m347 & -_m347);
          let _q348 = true;
          Q349: {
            const _a350 = v_K;
            const _lo361 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi362 = 31 - Math.clz32(b.domain);
            for (const _e354 of _l352) _f351[_e354] = -1;
            _l352 = _a350;
            let _i356 = 0;
            _s353[0] = 0;
            let _o368 = _a350.length === 0;
            for (;;) {
              if (_a350.length === 0) {
                if (!_o368) break;
                _o368 = false;
              }
              while (_a350.length > 0 && _i356 >= 0) {
                const _e354 = _a350[_i356];
                if (_s353[_i356] > 0) _f351[_e354] = -1;
                let _r367 = (cands[_e354] >= 0 ? cands[_e354] : (cands[_e354] = b.cand(_e354))) & ~((2 << _s353[_i356]) - 1);
                let _d355 = 0;
                V358: for (; _r367 !== 0; _r367 &= _r367 - 1) {
                  _d355 = 31 - Math.clz32(_r367 & -_r367);
                  _f351[_e354] = _d355;
                  for (let _j357 = 0; _j357 < _i356; _j357++) {
                    const _y369 = _a350[_j357];
                    if (!(((sp.rowOf[_e354] === sp.rowOf[_y369]) || (sp.colOf[_e354] === sp.colOf[_y369])))) continue;
                    if (!((_f351[_e354] !== _f351[_y369]))) continue V358;
                  }
                  if (!_h360) {
                    let _t370 = _d355;
                    for (let _j357 = 0; _j357 < _i356; _j357++) _t370 += _f351[_a350[_j357]];
                    if (_t370 + (_a350.length - _i356 - 1) * _lo361 > _h359) continue;
                    if (_t370 + (_a350.length - _i356 - 1) * _hi362 < _h359) continue;
                  }
                  if (!_h364) {
                    let _t371 = _d355;
                    for (let _j357 = 0; _j357 < _i356; _j357++) _t371 *= _f351[_a350[_j357]];
                    if (_t371 > 0 && _h363 % _t371 !== 0) continue;
                  }
                  break;
                }
                if (_r367 === 0) {
                  _s353[_i356] = 0;
                  _i356--;
                  continue;
                }
                _s353[_i356] = _d355;
                if (_i356 === _a350.length - 1) break;
                _i356++;
                _s353[_i356] = 0;
              }
              if (_i356 < 0) break;
              let _c376: boolean = _h360;
              if (!_c376) {
                let _g372 = 0;
                G373: {
                  const _a374 = cl.cage.cells[v_r];
                  for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                    const v_x = _a374[_i375];
                    _g372 += _f351[v_x];
                  }
                }
                _c376 = (_g372 === _h359);
              }
              let _c382: boolean = _c376;
              if (_c382) {
                let _c381: boolean = _h364;
                if (!_c381) {
                  let _g377 = 1;
                  G378: {
                    const _a379 = cl.cage.cells[v_r];
                    for (let _i380 = 0; _i380 < _a379.length; _i380++) {
                      const v_x = _a379[_i380];
                      _g377 *= _f351[v_x];
                    }
                  }
                  _c381 = (_g377 === _h363);
                }
                _c382 = _c381;
              }
              let _c396: boolean = _c382;
              if (_c396) {
                let _c395: boolean = _h384;
                if (!_c395) {
                  let _g385 = -1;
                  G386: {
                    const _a387 = cl.cage.cells[v_r];
                    for (let _i388 = 0; _i388 < _a387.length; _i388++) {
                      const v_x = _a387[_i388];
                      const _t389 = _f351[v_x];
                      if (_g385 === -1 || _t389 > _g385) _g385 = _t389;
                    }
                  }
                  let _g390 = -1;
                  G391: {
                    const _a392 = cl.cage.cells[v_r];
                    for (let _i393 = 0; _i393 < _a392.length; _i393++) {
                      const v_x = _a392[_i393];
                      const _t394 = _f351[v_x];
                      if (_g390 === -1 || _t394 < _g390) _g390 = _t394;
                    }
                  }
                  _c395 = ((_g385 - _g390) === _h383);
                }
                _c396 = _c395;
              }
              let _c410: boolean = _c396;
              if (_c410) {
                let _c409: boolean = _h398;
                if (!_c409) {
                  let _g399 = -1;
                  G400: {
                    const _a401 = cl.cage.cells[v_r];
                    for (let _i402 = 0; _i402 < _a401.length; _i402++) {
                      const v_x = _a401[_i402];
                      const _t403 = _f351[v_x];
                      if (_g399 === -1 || _t403 > _g399) _g399 = _t403;
                    }
                  }
                  let _g404 = -1;
                  G405: {
                    const _a406 = cl.cage.cells[v_r];
                    for (let _i407 = 0; _i407 < _a406.length; _i407++) {
                      const v_x = _a406[_i407];
                      const _t408 = _f351[v_x];
                      if (_g404 === -1 || _t408 < _g404) _g404 = _t408;
                    }
                  }
                  _c409 = (_g399 === (_h397 * _g404));
                }
                _c410 = _c409;
              }
              if (!(_c410)) continue;
              let _q411 = false;
              Q412: {
                const _a413 = sp.lineCells[v_L];
                for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                  const v_x = _a413[_i414];
                  if (((v_K.includes(v_x)) && (_f351[v_x] === v_d))) {
                    _q411 = true;
                    break Q412;
                  }
                }
              }
              if (!(_q411)) {
                _q348 = false;
                break Q349;
              }
            }
          }
          if (!(_q348)) continue;
          const _a415 = sp.lineCells[v_L];
          for (let _i416 = 0; _i416 < _a415.length; _i416++) {
            const v_c = _a415[_i416];
            if (!(!(v_K.includes(v_c)))) continue;
            if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q345 = false;
              break Q346;
            }
          }
        }
      }
      if (!(_q345)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K, L: v_L }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
