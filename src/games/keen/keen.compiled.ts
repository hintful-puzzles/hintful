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
  let _q418 = true;
  const _n422 = new Int32Array(32);
  Q419: for (const _u420 of sp.lines) {
    _n422.fill(0);
    for (const _c421 of sp.lineCells[_u420]) {
      const _t423 = (g[_c421] || -1);
      if (++_n422[_t423] > 1) {
        _q418 = false;
        break Q419;
      }
    }
  }
  if (!(_q418)) return false;
  for (let _k424 = 0; _k424 < cl.sum.at.length; _k424++) {
    const _at425 = cl.sum.at[_k424];
    const _v426 = cl.sum.v[_k424];
    let _g427 = 0;
    G428: {
      const _a429 = cl.cage.cells[_at425];
      for (let _i430 = 0; _i430 < _a429.length; _i430++) {
        const v_c = _a429[_i430];
        const _h431 = (g[v_c] || -1);
        _g427 += _h431;
      }
    }
    if (!((_g427 === _v426))) return false;
  }
  for (let _k432 = 0; _k432 < cl.product.at.length; _k432++) {
    const _at433 = cl.product.at[_k432];
    const _v434 = cl.product.v[_k432];
    let _g435 = 1;
    G436: {
      const _a437 = cl.cage.cells[_at433];
      for (let _i438 = 0; _i438 < _a437.length; _i438++) {
        const v_c = _a437[_i438];
        const _h439 = (g[v_c] || -1);
        _g435 *= _h439;
      }
    }
    if (!((_g435 === _v434))) return false;
  }
  for (let _k440 = 0; _k440 < cl.difference.at.length; _k440++) {
    const _at441 = cl.difference.at[_k440];
    const _v442 = cl.difference.v[_k440];
    let _g443 = -1;
    G444: {
      const _a445 = cl.cage.cells[_at441];
      for (let _i446 = 0; _i446 < _a445.length; _i446++) {
        const v_c = _a445[_i446];
        const _h447 = (g[v_c] || -1);
        if (_g443 === -1 || _h447 > _g443) _g443 = _h447;
      }
    }
    let _g448 = -1;
    G449: {
      const _a450 = cl.cage.cells[_at441];
      for (let _i451 = 0; _i451 < _a450.length; _i451++) {
        const v_c = _a450[_i451];
        const _h452 = (g[v_c] || -1);
        if (_g448 === -1 || _h452 < _g448) _g448 = _h452;
      }
    }
    if (!(((_g443 - _g448) === _v442))) return false;
  }
  for (let _k453 = 0; _k453 < cl.quotient.at.length; _k453++) {
    const _at454 = cl.quotient.at[_k453];
    const _v455 = cl.quotient.v[_k453];
    let _g456 = -1;
    G457: {
      const _a458 = cl.cage.cells[_at454];
      for (let _i459 = 0; _i459 < _a458.length; _i459++) {
        const v_c = _a458[_i459];
        const _h460 = (g[v_c] || -1);
        if (_g456 === -1 || _h460 > _g456) _g456 = _h460;
      }
    }
    let _g461 = -1;
    G462: {
      const _a463 = cl.cage.cells[_at454];
      for (let _i464 = 0; _i464 < _a463.length; _i464++) {
        const v_c = _a463[_i464];
        const _h465 = (g[v_c] || -1);
        if (_g461 === -1 || _h465 < _g461) _g461 = _h465;
      }
    }
    if (!((_g456 === (_v455 * _g461)))) return false;
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
let _f192 = new Int32Array(0);
let _l193: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function cageEasy(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageEasyBinding> | null): number {
  if (_f192.length < sp.cells.length) _f192 = new Int32Array(sp.cells.length).fill(-1);
  else _f192.fill(-1);
  _l193 = [];
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
          let _r208 = (cands[_e195] >= 0 ? cands[_e195] : (cands[_e195] = b.cands[_e195])) & ~((2 << _s194[_i197]) - 1);
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
        for (let _m261 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m261 !== 0; _m261 &= _m261 - 1) {
          const v_d = 31 - Math.clz32(_m261 & -_m261);
          if (!(!(((v_D >> v_d) & 1) !== 0))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
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
let _p271 = new Int32Array(0);
let _l272: readonly number[] = [];
let _f277 = new Int32Array(0);
let _l278: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function cage(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageBinding> | null): number {
  if (_p271.length < sp.cells.length) _p271 = new Int32Array(sp.cells.length);
  else _p271.fill(0);
  _l272 = [];
  let _y273 = false;
  if (_f277.length < sp.cells.length) _f277 = new Int32Array(sp.cells.length).fill(-1);
  else _f277.fill(-1);
  _l278 = [];
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
        for (let _m270 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m270 !== 0; _m270 &= _m270 - 1) {
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
                let _r293 = (cands[_e280] >= 0 ? cands[_e280] : (cands[_e280] = b.cands[_e280])) & ~((2 << _s279[_i282]) - 1);
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
          if (!(!(((((_p271[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y273 && !v_K.includes(v_c)))))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
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
let _f352 = new Int32Array(0);
let _l353: readonly number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function cageLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageLineBinding> | null): number {
  if (_f352.length < sp.cells.length) _f352 = new Int32Array(sp.cells.length).fill(-1);
  else _f352.fill(-1);
  _l353 = [];
  const _s354: number[] = [];
  const facts = cageLineFacts;
  let fired = 0;
  let changed = false;
  const _h343 = union(sp.cols, sp.rows);
  if (cageLineCands.length < sp.cells.length) cageLineCands = new Int32Array(sp.cells.length);
  const cands = cageLineCands;
  cands.fill(-1);
  const _a341 = cl.cage.parts;
  for (let _i342 = 0; _i342 < _a341.length; _i342++) {
    const v_r = _a341[_i342];
    const _h360 = clueAt(cl.sum, v_r);
    const _h361 = (_h360 === -1);
    const _h364 = clueAt(cl.product, v_r);
    const _h365 = (_h364 === -1);
    const _h384 = clueAt(cl.difference, v_r);
    const _h385 = (_h384 === -1);
    const _h398 = clueAt(cl.quotient, v_r);
    const _h399 = (_h398 === -1);
    const v_K = cl.cage.cells[v_r];
    const _a344 = _h343;
    for (let _i345 = 0; _i345 < _a344.length; _i345++) {
      const v_L = _a344[_i345];
      facts.length = 0;
      changed = false;
      let _q346 = true;
      Q347: {
        for (let _m348 = b.domain; _m348 !== 0; _m348 &= _m348 - 1) {
          const v_d = 31 - Math.clz32(_m348 & -_m348);
          let _q349 = true;
          Q350: {
            const _a351 = v_K;
            const _lo362 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi363 = 31 - Math.clz32(b.domain);
            for (const _e355 of _l353) _f352[_e355] = -1;
            _l353 = _a351;
            let _i357 = 0;
            _s354[0] = 0;
            let _o369 = _a351.length === 0;
            for (;;) {
              if (_a351.length === 0) {
                if (!_o369) break;
                _o369 = false;
              }
              while (_a351.length > 0 && _i357 >= 0) {
                const _e355 = _a351[_i357];
                if (_s354[_i357] > 0) _f352[_e355] = -1;
                let _r368 = (cands[_e355] >= 0 ? cands[_e355] : (cands[_e355] = b.cands[_e355])) & ~((2 << _s354[_i357]) - 1);
                let _d356 = 0;
                V359: for (; _r368 !== 0; _r368 &= _r368 - 1) {
                  _d356 = 31 - Math.clz32(_r368 & -_r368);
                  _f352[_e355] = _d356;
                  for (let _j358 = 0; _j358 < _i357; _j358++) {
                    const _y370 = _a351[_j358];
                    if (!(((sp.rowOf[_e355] === sp.rowOf[_y370]) || (sp.colOf[_e355] === sp.colOf[_y370])))) continue;
                    if (!((_f352[_e355] !== _f352[_y370]))) continue V359;
                  }
                  if (!_h361) {
                    let _t371 = _d356;
                    for (let _j358 = 0; _j358 < _i357; _j358++) _t371 += _f352[_a351[_j358]];
                    if (_t371 + (_a351.length - _i357 - 1) * _lo362 > _h360) continue;
                    if (_t371 + (_a351.length - _i357 - 1) * _hi363 < _h360) continue;
                  }
                  if (!_h365) {
                    let _t372 = _d356;
                    for (let _j358 = 0; _j358 < _i357; _j358++) _t372 *= _f352[_a351[_j358]];
                    if (_t372 > 0 && _h364 % _t372 !== 0) continue;
                  }
                  break;
                }
                if (_r368 === 0) {
                  _s354[_i357] = 0;
                  _i357--;
                  continue;
                }
                _s354[_i357] = _d356;
                if (_i357 === _a351.length - 1) break;
                _i357++;
                _s354[_i357] = 0;
              }
              if (_i357 < 0) break;
              let _c377: boolean = _h361;
              if (!_c377) {
                let _g373 = 0;
                G374: {
                  const _a375 = cl.cage.cells[v_r];
                  for (let _i376 = 0; _i376 < _a375.length; _i376++) {
                    const v_x = _a375[_i376];
                    _g373 += _f352[v_x];
                  }
                }
                _c377 = (_g373 === _h360);
              }
              let _c383: boolean = _c377;
              if (_c383) {
                let _c382: boolean = _h365;
                if (!_c382) {
                  let _g378 = 1;
                  G379: {
                    const _a380 = cl.cage.cells[v_r];
                    for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                      const v_x = _a380[_i381];
                      _g378 *= _f352[v_x];
                    }
                  }
                  _c382 = (_g378 === _h364);
                }
                _c383 = _c382;
              }
              let _c397: boolean = _c383;
              if (_c397) {
                let _c396: boolean = _h385;
                if (!_c396) {
                  let _g386 = -1;
                  G387: {
                    const _a388 = cl.cage.cells[v_r];
                    for (let _i389 = 0; _i389 < _a388.length; _i389++) {
                      const v_x = _a388[_i389];
                      const _t390 = _f352[v_x];
                      if (_g386 === -1 || _t390 > _g386) _g386 = _t390;
                    }
                  }
                  let _g391 = -1;
                  G392: {
                    const _a393 = cl.cage.cells[v_r];
                    for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                      const v_x = _a393[_i394];
                      const _t395 = _f352[v_x];
                      if (_g391 === -1 || _t395 < _g391) _g391 = _t395;
                    }
                  }
                  _c396 = ((_g386 - _g391) === _h384);
                }
                _c397 = _c396;
              }
              let _c411: boolean = _c397;
              if (_c411) {
                let _c410: boolean = _h399;
                if (!_c410) {
                  let _g400 = -1;
                  G401: {
                    const _a402 = cl.cage.cells[v_r];
                    for (let _i403 = 0; _i403 < _a402.length; _i403++) {
                      const v_x = _a402[_i403];
                      const _t404 = _f352[v_x];
                      if (_g400 === -1 || _t404 > _g400) _g400 = _t404;
                    }
                  }
                  let _g405 = -1;
                  G406: {
                    const _a407 = cl.cage.cells[v_r];
                    for (let _i408 = 0; _i408 < _a407.length; _i408++) {
                      const v_x = _a407[_i408];
                      const _t409 = _f352[v_x];
                      if (_g405 === -1 || _t409 < _g405) _g405 = _t409;
                    }
                  }
                  _c410 = (_g400 === (_h398 * _g405));
                }
                _c411 = _c410;
              }
              if (!(_c411)) continue;
              let _q412 = false;
              Q413: {
                const _a414 = sp.lineCells[v_L];
                for (let _i415 = 0; _i415 < _a414.length; _i415++) {
                  const v_x = _a414[_i415];
                  if (((v_K.includes(v_x)) && (_f352[v_x] === v_d))) {
                    _q412 = true;
                    break Q413;
                  }
                }
              }
              if (!(_q412)) {
                _q349 = false;
                break Q350;
              }
            }
          }
          if (!(_q349)) continue;
          const _a416 = sp.lineCells[v_L];
          for (let _i417 = 0; _i417 < _a416.length; _i417++) {
            const v_c = _a416[_i417];
            if (!(!(v_K.includes(v_c)))) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q346 = false;
              break Q347;
            }
          }
        }
      }
      if (!(_q346)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K.slice(), L: v_L }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
