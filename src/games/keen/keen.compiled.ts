// Compiled by `npm run describe` from src/games/keen/keen.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, STRIKE, clueAt, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, and its clues by kind. */
export interface Dealt {
  cage: Partition;
  sum: ClueList;
  product: ClueList;
  difference: ClueList;
  quotient: ClueList;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "cageEasy" | "latin.hiddenSingle" | "latin.single" | "cage" | "cageLine" | "latin.set" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, and the cap from which it no longer
 * runs where it has one, in the order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; until?: number }[] = [
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

export interface CageEasyBinding {
  r: number;
  K: readonly number[];
  D: number;
}

const cageEasyFacts: number[] = [];
let cageEasyCands = new Int32Array(0);

export function cageEasy(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageEasyBinding> | null): number {
  const _f180 = new Int32Array(sp.cells.length).fill(-1);
  let _l181: readonly number[] = [];
  const _s182: number[] = [];
  const facts = cageEasyFacts;
  let fired = 0;
  let changed = false;
  if (cageEasyCands.length < sp.cells.length) cageEasyCands = new Int32Array(sp.cells.length);
  const cands = cageEasyCands;
  cands.fill(-1);
  const _a120 = cl.cage.parts;
  for (let _i121 = 0; _i121 < _a120.length; _i121++) {
    const v_r = _a120[_i121];
    const _h188 = clueAt(cl.sum, v_r);
    const _h190 = clueAt(cl.product, v_r);
    const _h197 = (_h188 === -1);
    const _h203 = (_h190 === -1);
    const _h210 = clueAt(cl.difference, v_r);
    const _h211 = (_h210 === -1);
    const _h224 = clueAt(cl.quotient, v_r);
    const _h225 = (_h224 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g122 = 0;
    G123: {
      const _a179 = v_K;
      const _t189 = (_h188 === -1);
      const _t191 = (_h190 === -1);
      for (const _e183 of _l181) _f180[_e183] = -1;
      _l181 = _a179;
      let _i185 = 0;
      _s182[0] = 0;
      let _o193 = _a179.length === 0;
      for (;;) {
        if (_a179.length === 0) {
          if (!_o193) break;
          _o193 = false;
        }
        while (_a179.length > 0 && _i185 >= 0) {
          const _e183 = _a179[_i185];
          if (_s182[_i185] > 0) _f180[_e183] = -1;
          let _r192 = (cands[_e183] >= 0 ? cands[_e183] : (cands[_e183] = b.cand(_e183))) & ~((2 << _s182[_i185]) - 1);
          let _d184 = 0;
          V187: for (; _r192 !== 0; _r192 &= _r192 - 1) {
            _d184 = 31 - Math.clz32(_r192 & -_r192);
            _f180[_e183] = _d184;
            for (let _j186 = 0; _j186 < _i185; _j186++) {
              const _y194 = _a179[_j186];
              if (!(((sp.rowOf[_e183] === sp.rowOf[_y194]) || (sp.colOf[_e183] === sp.colOf[_y194])))) continue;
              if (!((_f180[_e183] !== _f180[_y194]))) continue V187;
            }
            if (!_t189) {
              let _t195 = _d184;
              for (let _j186 = 0; _j186 < _i185; _j186++) _t195 += _f180[_a179[_j186]];
              if (_t195 > _h188) continue;
            }
            if (!_t191) {
              let _t196 = _d184;
              for (let _j186 = 0; _j186 < _i185; _j186++) _t196 *= _f180[_a179[_j186]];
              if (_t196 > 0 && _h190 % _t196 !== 0) continue;
            }
            break;
          }
          if (_r192 === 0) {
            _s182[_i185] = 0;
            _i185--;
            continue;
          }
          _s182[_i185] = _d184;
          if (_i185 === _a179.length - 1) break;
          _i185++;
          _s182[_i185] = 0;
        }
        if (_i185 < 0) break;
        let _c202 = _h197;
        if (!_c202) {
          let _g198 = 0;
          G199: {
            const _a200 = cl.cage.cells[v_r];
            for (let _i201 = 0; _i201 < _a200.length; _i201++) {
              const v_x = _a200[_i201];
              _g198 += _f180[v_x];
            }
          }
          _c202 = (_g198 === _h188);
        }
        let _c209 = _c202;
        if (_c209) {
          let _c208 = _h203;
          if (!_c208) {
            let _g204 = 1;
            G205: {
              const _a206 = cl.cage.cells[v_r];
              for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                const v_x = _a206[_i207];
                _g204 *= _f180[v_x];
              }
            }
            _c208 = (_g204 === _h190);
          }
          _c209 = _c208;
        }
        let _c223 = _c209;
        if (_c223) {
          let _c222 = _h211;
          if (!_c222) {
            let _g212 = -1;
            G213: {
              const _a214 = cl.cage.cells[v_r];
              for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                const v_x = _a214[_i215];
                const _t216 = _f180[v_x];
                if (_g212 === -1 || _t216 > _g212) _g212 = _t216;
              }
            }
            let _g217 = -1;
            G218: {
              const _a219 = cl.cage.cells[v_r];
              for (let _i220 = 0; _i220 < _a219.length; _i220++) {
                const v_x = _a219[_i220];
                const _t221 = _f180[v_x];
                if (_g217 === -1 || _t221 < _g217) _g217 = _t221;
              }
            }
            _c222 = ((_g212 - _g217) === _h210);
          }
          _c223 = _c222;
        }
        let _c237 = _c223;
        if (_c237) {
          let _c236 = _h225;
          if (!_c236) {
            let _g226 = -1;
            G227: {
              const _a228 = cl.cage.cells[v_r];
              for (let _i229 = 0; _i229 < _a228.length; _i229++) {
                const v_x = _a228[_i229];
                const _t230 = _f180[v_x];
                if (_g226 === -1 || _t230 > _g226) _g226 = _t230;
              }
            }
            let _g231 = -1;
            G232: {
              const _a233 = cl.cage.cells[v_r];
              for (let _i234 = 0; _i234 < _a233.length; _i234++) {
                const v_x = _a233[_i234];
                const _t235 = _f180[v_x];
                if (_g231 === -1 || _t235 < _g231) _g231 = _t235;
              }
            }
            _c236 = (_g226 === (_h224 * _g231));
          }
          _c237 = _c236;
        }
        if (!(_c237)) continue;
        const _a238 = v_K;
        for (let _i239 = 0; _i239 < _a238.length; _i239++) {
          const v_x = _a238[_i239];
          const _t240 = _f180[v_x];
          _g122 |= 1 << _t240;
        }
      }
    }
    const v_D = _g122;
    facts.length = 0;
    changed = false;
    let _q241 = true;
    Q242: {
      const _a243 = v_K;
      for (let _i244 = 0; _i244 < _a243.length; _i244++) {
        const v_c = _a243[_i244];
        for (let _m245 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m245 !== 0; _m245 &= _m245 - 1) {
          const v_d = 31 - Math.clz32(_m245 & -_m245);
          if (!(!(((v_D >> v_d) & 1) !== 0))) continue;
          if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q241 = false;
            break Q242;
          }
        }
      }
    }
    if (!(_q241)) return -1;
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
  const _p255 = new Int32Array(sp.cells.length);
  let _l256: readonly number[] = [];
  let _y257 = false;
  const _f261 = new Int32Array(sp.cells.length).fill(-1);
  let _l262: readonly number[] = [];
  const _s263: number[] = [];
  const facts = cageFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (cageCands.length < sp.cells.length) cageCands = new Int32Array(sp.cells.length);
  const cands = cageCands;
  cands.fill(-1);
  const _a248 = cl.cage.parts;
  for (let _i249 = 0; _i249 < _a248.length; _i249++) {
    const v_r = _a248[_i249];
    const _h269 = clueAt(cl.sum, v_r);
    const _h270 = (_h269 === -1);
    const _h271 = clueAt(cl.product, v_r);
    const _h272 = (_h271 === -1);
    const _h289 = clueAt(cl.difference, v_r);
    const _h290 = (_h289 === -1);
    const _h303 = clueAt(cl.quotient, v_r);
    const _h304 = (_h303 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g258 = -1;
    facts.length = 0;
    changed = false;
    let _q250 = true;
    Q251: {
      const _a252 = v_K;
      for (let _i253 = 0; _i253 < _a252.length; _i253++) {
        const v_c = _a252[_i253];
        for (let _m254 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m254 !== 0; _m254 &= _m254 - 1) {
          const v_d = 31 - Math.clz32(_m254 & -_m254);
          if (_g258 !== _epoch) {
            _g258 = _epoch;
            for (const _e259 of _l256) _p255[_e259] = 0;
            _y257 = false;
            const _a260 = v_K;
            for (const _e264 of _l262) _f261[_e264] = -1;
            _l262 = _a260;
            let _i266 = 0;
            _s263[0] = 0;
            let _o274 = _a260.length === 0;
            for (;;) {
              if (_a260.length === 0) {
                if (!_o274) break;
                _o274 = false;
              }
              while (_a260.length > 0 && _i266 >= 0) {
                const _e264 = _a260[_i266];
                if (_s263[_i266] > 0) _f261[_e264] = -1;
                let _r273 = (cands[_e264] >= 0 ? cands[_e264] : (cands[_e264] = b.cand(_e264))) & ~((2 << _s263[_i266]) - 1);
                let _d265 = 0;
                V268: for (; _r273 !== 0; _r273 &= _r273 - 1) {
                  _d265 = 31 - Math.clz32(_r273 & -_r273);
                  _f261[_e264] = _d265;
                  for (let _j267 = 0; _j267 < _i266; _j267++) {
                    const _y275 = _a260[_j267];
                    if (!(((sp.rowOf[_e264] === sp.rowOf[_y275]) || (sp.colOf[_e264] === sp.colOf[_y275])))) continue;
                    if (!((_f261[_e264] !== _f261[_y275]))) continue V268;
                  }
                  if (!_h270) {
                    let _t276 = _d265;
                    for (let _j267 = 0; _j267 < _i266; _j267++) _t276 += _f261[_a260[_j267]];
                    if (_t276 > _h269) continue;
                  }
                  if (!_h272) {
                    let _t277 = _d265;
                    for (let _j267 = 0; _j267 < _i266; _j267++) _t277 *= _f261[_a260[_j267]];
                    if (_t277 > 0 && _h271 % _t277 !== 0) continue;
                  }
                  break;
                }
                if (_r273 === 0) {
                  _s263[_i266] = 0;
                  _i266--;
                  continue;
                }
                _s263[_i266] = _d265;
                if (_i266 === _a260.length - 1) break;
                _i266++;
                _s263[_i266] = 0;
              }
              if (_i266 < 0) break;
              let _c282 = _h270;
              if (!_c282) {
                let _g278 = 0;
                G279: {
                  const _a280 = cl.cage.cells[v_r];
                  for (let _i281 = 0; _i281 < _a280.length; _i281++) {
                    const v_x = _a280[_i281];
                    _g278 += _f261[v_x];
                  }
                }
                _c282 = (_g278 === _h269);
              }
              let _c288 = _c282;
              if (_c288) {
                let _c287 = _h272;
                if (!_c287) {
                  let _g283 = 1;
                  G284: {
                    const _a285 = cl.cage.cells[v_r];
                    for (let _i286 = 0; _i286 < _a285.length; _i286++) {
                      const v_x = _a285[_i286];
                      _g283 *= _f261[v_x];
                    }
                  }
                  _c287 = (_g283 === _h271);
                }
                _c288 = _c287;
              }
              let _c302 = _c288;
              if (_c302) {
                let _c301 = _h290;
                if (!_c301) {
                  let _g291 = -1;
                  G292: {
                    const _a293 = cl.cage.cells[v_r];
                    for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                      const v_x = _a293[_i294];
                      const _t295 = _f261[v_x];
                      if (_g291 === -1 || _t295 > _g291) _g291 = _t295;
                    }
                  }
                  let _g296 = -1;
                  G297: {
                    const _a298 = cl.cage.cells[v_r];
                    for (let _i299 = 0; _i299 < _a298.length; _i299++) {
                      const v_x = _a298[_i299];
                      const _t300 = _f261[v_x];
                      if (_g296 === -1 || _t300 < _g296) _g296 = _t300;
                    }
                  }
                  _c301 = ((_g291 - _g296) === _h289);
                }
                _c302 = _c301;
              }
              let _c316 = _c302;
              if (_c316) {
                let _c315 = _h304;
                if (!_c315) {
                  let _g305 = -1;
                  G306: {
                    const _a307 = cl.cage.cells[v_r];
                    for (let _i308 = 0; _i308 < _a307.length; _i308++) {
                      const v_x = _a307[_i308];
                      const _t309 = _f261[v_x];
                      if (_g305 === -1 || _t309 > _g305) _g305 = _t309;
                    }
                  }
                  let _g310 = -1;
                  G311: {
                    const _a312 = cl.cage.cells[v_r];
                    for (let _i313 = 0; _i313 < _a312.length; _i313++) {
                      const v_x = _a312[_i313];
                      const _t314 = _f261[v_x];
                      if (_g310 === -1 || _t314 < _g310) _g310 = _t314;
                    }
                  }
                  _c315 = (_g305 === (_h303 * _g310));
                }
                _c316 = _c315;
              }
              if (!(_c316)) continue;
              if (!(true)) continue;
              _l256 = _a260;
              _y257 = true;
              for (const _e259 of _a260) _p255[_e259] |= 1 << _f261[_e259];
            }
          }
          if (!(!(((((_p255[v_c] >> v_d) & 1) !== 0) || (v_d === -1 && _y257 && !v_K.includes(v_c)))))) continue;
          if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q250 = false;
            break Q251;
          }
        }
      }
    }
    if (!(_q250)) return -1;
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
  const _f331 = new Int32Array(sp.cells.length).fill(-1);
  let _l332: readonly number[] = [];
  const _s333: number[] = [];
  const facts = cageLineFacts;
  let fired = 0;
  let changed = false;
  if (cageLineCands.length < sp.cells.length) cageLineCands = new Int32Array(sp.cells.length);
  const cands = cageLineCands;
  cands.fill(-1);
  const _a321 = cl.cage.parts;
  for (let _i322 = 0; _i322 < _a321.length; _i322++) {
    const v_r = _a321[_i322];
    const _h339 = clueAt(cl.sum, v_r);
    const _h340 = (_h339 === -1);
    const _h341 = clueAt(cl.product, v_r);
    const _h342 = (_h341 === -1);
    const _h359 = clueAt(cl.difference, v_r);
    const _h360 = (_h359 === -1);
    const _h373 = clueAt(cl.quotient, v_r);
    const _h374 = (_h373 === -1);
    const v_K = cl.cage.cells[v_r];
    const _a323 = union(sp.cols, sp.rows);
    for (let _i324 = 0; _i324 < _a323.length; _i324++) {
      const v_L = _a323[_i324];
      facts.length = 0;
      changed = false;
      let _q325 = true;
      Q326: {
        for (let _m327 = b.domain; _m327 !== 0; _m327 &= _m327 - 1) {
          const v_d = 31 - Math.clz32(_m327 & -_m327);
          let _q328 = true;
          Q329: {
            const _a330 = v_K;
            for (const _e334 of _l332) _f331[_e334] = -1;
            _l332 = _a330;
            let _i336 = 0;
            _s333[0] = 0;
            let _o344 = _a330.length === 0;
            for (;;) {
              if (_a330.length === 0) {
                if (!_o344) break;
                _o344 = false;
              }
              while (_a330.length > 0 && _i336 >= 0) {
                const _e334 = _a330[_i336];
                if (_s333[_i336] > 0) _f331[_e334] = -1;
                let _r343 = (cands[_e334] >= 0 ? cands[_e334] : (cands[_e334] = b.cand(_e334))) & ~((2 << _s333[_i336]) - 1);
                let _d335 = 0;
                V338: for (; _r343 !== 0; _r343 &= _r343 - 1) {
                  _d335 = 31 - Math.clz32(_r343 & -_r343);
                  _f331[_e334] = _d335;
                  for (let _j337 = 0; _j337 < _i336; _j337++) {
                    const _y345 = _a330[_j337];
                    if (!(((sp.rowOf[_e334] === sp.rowOf[_y345]) || (sp.colOf[_e334] === sp.colOf[_y345])))) continue;
                    if (!((_f331[_e334] !== _f331[_y345]))) continue V338;
                  }
                  if (!_h340) {
                    let _t346 = _d335;
                    for (let _j337 = 0; _j337 < _i336; _j337++) _t346 += _f331[_a330[_j337]];
                    if (_t346 > _h339) continue;
                  }
                  if (!_h342) {
                    let _t347 = _d335;
                    for (let _j337 = 0; _j337 < _i336; _j337++) _t347 *= _f331[_a330[_j337]];
                    if (_t347 > 0 && _h341 % _t347 !== 0) continue;
                  }
                  break;
                }
                if (_r343 === 0) {
                  _s333[_i336] = 0;
                  _i336--;
                  continue;
                }
                _s333[_i336] = _d335;
                if (_i336 === _a330.length - 1) break;
                _i336++;
                _s333[_i336] = 0;
              }
              if (_i336 < 0) break;
              let _c352 = _h340;
              if (!_c352) {
                let _g348 = 0;
                G349: {
                  const _a350 = cl.cage.cells[v_r];
                  for (let _i351 = 0; _i351 < _a350.length; _i351++) {
                    const v_x = _a350[_i351];
                    _g348 += _f331[v_x];
                  }
                }
                _c352 = (_g348 === _h339);
              }
              let _c358 = _c352;
              if (_c358) {
                let _c357 = _h342;
                if (!_c357) {
                  let _g353 = 1;
                  G354: {
                    const _a355 = cl.cage.cells[v_r];
                    for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                      const v_x = _a355[_i356];
                      _g353 *= _f331[v_x];
                    }
                  }
                  _c357 = (_g353 === _h341);
                }
                _c358 = _c357;
              }
              let _c372 = _c358;
              if (_c372) {
                let _c371 = _h360;
                if (!_c371) {
                  let _g361 = -1;
                  G362: {
                    const _a363 = cl.cage.cells[v_r];
                    for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                      const v_x = _a363[_i364];
                      const _t365 = _f331[v_x];
                      if (_g361 === -1 || _t365 > _g361) _g361 = _t365;
                    }
                  }
                  let _g366 = -1;
                  G367: {
                    const _a368 = cl.cage.cells[v_r];
                    for (let _i369 = 0; _i369 < _a368.length; _i369++) {
                      const v_x = _a368[_i369];
                      const _t370 = _f331[v_x];
                      if (_g366 === -1 || _t370 < _g366) _g366 = _t370;
                    }
                  }
                  _c371 = ((_g361 - _g366) === _h359);
                }
                _c372 = _c371;
              }
              let _c386 = _c372;
              if (_c386) {
                let _c385 = _h374;
                if (!_c385) {
                  let _g375 = -1;
                  G376: {
                    const _a377 = cl.cage.cells[v_r];
                    for (let _i378 = 0; _i378 < _a377.length; _i378++) {
                      const v_x = _a377[_i378];
                      const _t379 = _f331[v_x];
                      if (_g375 === -1 || _t379 > _g375) _g375 = _t379;
                    }
                  }
                  let _g380 = -1;
                  G381: {
                    const _a382 = cl.cage.cells[v_r];
                    for (let _i383 = 0; _i383 < _a382.length; _i383++) {
                      const v_x = _a382[_i383];
                      const _t384 = _f331[v_x];
                      if (_g380 === -1 || _t384 < _g380) _g380 = _t384;
                    }
                  }
                  _c385 = (_g375 === (_h373 * _g380));
                }
                _c386 = _c385;
              }
              if (!(_c386)) continue;
              let _q387 = false;
              Q388: {
                const _a389 = sp.lineCells[v_L];
                for (let _i390 = 0; _i390 < _a389.length; _i390++) {
                  const v_x = _a389[_i390];
                  if (((v_K.includes(v_x)) && (_f331[v_x] === v_d))) {
                    _q387 = true;
                    break Q388;
                  }
                }
              }
              if (!(_q387)) {
                _q328 = false;
                break Q329;
              }
            }
          }
          if (!(_q328)) continue;
          const _a391 = sp.lineCells[v_L];
          for (let _i392 = 0; _i392 < _a391.length; _i392++) {
            const v_c = _a391[_i392];
            if (!(!(v_K.includes(v_c)))) continue;
            if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q325 = false;
              break Q326;
            }
          }
        }
      }
      if (!(_q325)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K, L: v_L }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
