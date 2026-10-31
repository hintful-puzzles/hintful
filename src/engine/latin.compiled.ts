// Compiled by `npm run describe` from src/engine/latin.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, least, minus, popcount, rangeMask, valuesOf } from "./describe-runtime.ts";

export interface PlacedBinding {
  c: number;
  d: number;
  k: number;
}

const placedFacts: number[] = [];

export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h3 = b.known(v_c);
  const _h4 = b.value(v_c);
  if (!(_h3)) return 0;
  const v_d = _h4;
  const v_k = b.multiplicity(v_d);
  const _h15 = (v_k === 1);
  facts.length = 0;
  changed = false;
  let _c10 = (v_k === 1);
  if (!_c10) {
    let _g5 = 0;
    G6: {
      const _a7 = sp.lineCells[sp.colOf[v_c]];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_p = _a7[_i8];
        const _h9 = b.value(v_p);
        if (!((_h9 === v_d))) continue;
        _g5++;
      }
    }
    _c10 = (_g5 >= v_k);
  }
  let _c17 = !(_c10);
  if (!_c17) {
    let _q11 = true;
    Q12: {
      const _a13 = sp.lineCells[sp.colOf[v_c]];
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        const v_p = _a13[_i14];
        const _h16 = b.value(v_p);
        if (!(((v_p !== v_c) && (_h15 || (_h16 !== v_d))))) continue;
        if (b.has(v_p, v_d)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
        if (!(true)) {
          _q11 = false;
          break Q12;
        }
      }
    }
    _c17 = _q11;
  }
  let _c30 = _c17;
  if (_c30) {
    let _c23 = (v_k === 1);
    if (!_c23) {
      let _g18 = 0;
      G19: {
        const _a20 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_p = _a20[_i21];
          const _h22 = b.value(v_p);
          if (!((_h22 === v_d))) continue;
          _g18++;
        }
      }
      _c23 = (_g18 >= v_k);
    }
    let _c29 = !(_c23);
    if (!_c29) {
      let _q24 = true;
      Q25: {
        const _a26 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_p = _a26[_i27];
          const _h28 = b.value(v_p);
          if (!(((v_p !== v_c) && (_h15 || (_h28 !== v_d))))) continue;
          if (b.has(v_p, v_d)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
          if (!(true)) {
            _q24 = false;
            break Q25;
          }
        }
      }
      _c29 = _q24;
    }
    _c30 = _c29;
  }
  if (!(_c30)) return -1;
  if (changed || facts.length > 0) {
    fired = 1;
    if (fire !== null) fire({ c: v_c, d: v_d, k: v_k }, facts);
  }
  return fired;
}

export interface HiddenSingleBinding {
  u: number;
  placed: number;
  d: number;
  n: number;
}

const hiddenSingleFacts: number[] = [];
let hiddenSingleCands = new Int32Array(0);

export function hiddenSingle(b: Marks, sp: GridSpace, fire: Fire<HiddenSingleBinding> | null): number {
  const facts = hiddenSingleFacts;
  let fired = 0;
  let changed = false;
  if (hiddenSingleCands.length < sp.cells.length) hiddenSingleCands = new Int32Array(sp.cells.length);
  const cands = hiddenSingleCands;
  cands.fill(-1);
  const _a46 = sp.units;
  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
    const v_u = _a46[_i47];
    let _g48 = 0;
    G49: {
      const _a52 = sp.lineCells[v_u];
      for (let _i53 = 0; _i53 < _a52.length; _i53++) {
        const v_c = _a52[_i53];
        if (!((b.known(v_c) && (b.multiplicity(b.value(v_c)) === 1)))) continue;
        const _t54 = b.value(v_c);
        _g48 |= 1 << _t54;
      }
    }
    const v_placed = _g48;
    for (let _m55 = (b.domain & ~v_placed); _m55 !== 0; _m55 &= _m55 - 1) {
      const v_d = 31 - Math.clz32(_m55 & -_m55);
      let _g56 = 0;
      G57: {
        const _a58 = sp.lineCells[v_u];
        for (let _i59 = 0; _i59 < _a58.length; _i59++) {
          const v_c = _a58[_i59];
          if (!(b.has(v_c, v_d))) continue;
          _g56++;
        }
      }
      L60: {
        const v_n = _g56;
        if (!((v_n <= b.multiplicity(v_d)))) break L60;
        facts.length = 0;
        changed = false;
        let _c65 = (v_n === b.multiplicity(v_d));
        if (_c65) {
          let _q61 = true;
          Q62: {
            const _a63 = sp.lineCells[v_u];
            for (let _i64 = 0; _i64 < _a63.length; _i64++) {
              const v_c = _a63[_i64];
              if (!((b.has(v_c, v_d) && !(b.known(v_c))))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q61 = false;
                break Q62;
              }
            }
          }
          _c65 = _q61;
        }
        if (!(_c65)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ u: v_u, placed: v_placed, d: v_d, n: v_n }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface SingleBinding {
  L: number;
  c: number;
}

const singleFacts: number[] = [];
let singleCands = new Int32Array(0);

export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding> | null): number {
  const facts = singleFacts;
  let fired = 0;
  let changed = false;
  if (singleCands.length < sp.cells.length) singleCands = new Int32Array(sp.cells.length);
  const cands = singleCands;
  cands.fill(-1);
  const _a70 = sp.cols;
  for (let _i71 = 0; _i71 < _a70.length; _i71++) {
    const v_L = _a70[_i71];
    const _a72 = sp.lineCells[v_L];
    for (let _i73 = 0; _i73 < _a72.length; _i73++) {
      const v_c = _a72[_i73];
      if (!((!(b.known(v_c)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) < 2)))) continue;
      facts.length = 0;
      changed = false;
      let _c75 = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) === 1);
      if (_c75) {
        const _t74 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))));
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t74); changed = true; } else facts.push(PLACE, v_c, _t74); }
        _c75 = true;
      }
      if (!(_c75)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, c: v_c }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface SetBinding {
  u: number;
  V: number;
  open: readonly number[];
  R: number;
  extra: number;
  T: number;
  S: readonly number[];
}

const setFacts: number[] = [];
let setCands = new Int32Array(0);

export function set(b: Marks, sp: GridSpace, fire: Fire<SetBinding> | null): number {
  const _g115: number[] = [];
  const _g133: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  if (setCands.length < sp.cells.length) setCands = new Int32Array(sp.cells.length);
  const cands = setCands;
  cands.fill(-1);
  const _a105 = sp.units;
  for (let _i106 = 0; _i106 < _a105.length; _i106++) {
    const v_u = _a105[_i106];
    let _g107 = 0;
    G108: {
      const _a111 = sp.lineCells[v_u];
      for (let _i112 = 0; _i112 < _a111.length; _i112++) {
        const v_c = _a111[_i112];
        const _h113 = b.known(v_c);
        const _h114 = b.value(v_c);
        if (!((_h113 && (b.multiplicity(_h114) === 1)))) continue;
        _g107 |= 1 << _h114;
      }
    }
    const v_V = (b.domain & ~_g107);
    const _h127 = popcount(v_V);
    const _h132 = (_h127 - 2);
    _g115.length = 0;
    G116: {
      const _a119 = sp.lineCells[v_u];
      for (let _i120 = 0; _i120 < _a119.length; _i120++) {
        const v_c = _a119[_i120];
        const _h121 = b.known(v_c);
        if (!(!(_h121))) continue;
        _g115.push(v_c);
      }
    }
    const v_open = _g115;
    const _h126 = v_open.length;
    let _g122 = 0;
    G123: {
      for (let _m125 = v_V; _m125 !== 0; _m125 &= _m125 - 1) {
        const v_d = 31 - Math.clz32(_m125 & -_m125);
        if (!((b.multiplicity(v_d) > 1))) continue;
        _g122 |= 1 << v_d;
      }
    }
    const v_R = _g122;
    const v_extra = (_h126 - _h127);
    const _e128 = valuesOf(v_V);
    for (let _k129 = 0; _k129 < 1 << _e128.length; _k129++) {
      let v_T = 0;
      for (let _j130 = 0; _j130 < _e128.length; _j130++) if ((_k129 >> (_e128.length - 1 - _j130)) & 1) v_T |= 1 << _e128[_j130];
      const _h131 = popcount(v_T);
      const _h141 = popcount((v_R & ~v_T));
      const _h151 = (v_V & ~v_T);
      if (!(((_h131 === 0) || ((2 <= _h131) && (_h131 <= _h132))))) continue;
      _g133.length = 0;
      G134: {
        const _a137 = v_open;
        for (let _i138 = 0; _i138 < _a137.length; _i138++) {
          const v_c = _a137[_i138];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) !== 0)))) continue;
          _g133.push(v_c);
        }
      }
      L139: {
        const v_S = _g133;
        const _h140 = v_S.length;
        if (!((_h140 >= ((_h127 - _h131) + (v_extra * _h141))))) break L139;
        facts.length = 0;
        changed = false;
        let _c146 = (_h131 > 0);
        if (!_c146) {
          let _q142 = true;
          Q143: {
            const _a144 = sp.lineCells[v_u];
            for (let _i145 = 0; _i145 < _a144.length; _i145++) {
              const v_c = _a144[_i145];
              if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) > 0))) {
                _q142 = false;
                break Q143;
              }
            }
          }
          _c146 = _q142;
        }
        let _c153 = (_c146 && (_h140 === ((_h127 - _h131) + (v_extra * _h141))));
        if (_c153) {
          let _q147 = true;
          Q148: {
            const _a149 = v_open;
            for (let _i150 = 0; _i150 < _a149.length; _i150++) {
              const v_c = _a149[_i150];
              if (!(!(v_S.includes(v_c)))) continue;
              for (let _m152 = _h151; _m152 !== 0; _m152 &= _m152 - 1) {
                const v_d = 31 - Math.clz32(_m152 & -_m152);
                if (!(b.has(v_c, v_d))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q147 = false;
                  break Q148;
                }
              }
            }
          }
          _c153 = _q147;
        }
        if (!(_c153)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ u: v_u, V: v_V, open: v_open, R: v_R, extra: v_extra, T: v_T, S: v_S }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface FishBinding {
  d: number;
  k: number;
  X0: readonly number[];
  Y0: number;
  T: number;
  X: readonly number[];
}

const fishFacts: number[] = [];
let fishCands = new Int32Array(0);

export function fish(b: Marks, sp: GridSpace, fire: Fire<FishBinding> | null): number {
  const _g236: number[] = [];
  const _g295: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  const _h265 = (sp.h - 1);
  const _h266 = rangeMask(0, _h265);
  if (fishCands.length < sp.cells.length) fishCands = new Int32Array(sp.cells.length);
  const cands = fishCands;
  cands.fill(-1);
  for (let _m235 = b.domain; _m235 !== 0; _m235 &= _m235 - 1) {
    const v_d = 31 - Math.clz32(_m235 & -_m235);
    const v_k = b.multiplicity(v_d);
    const _h257 = (v_k > 1);
    const _h280 = (v_k === 1);
    _g236.length = 0;
    G237: {
      const _a250 = sp.cols;
      for (let _i251 = 0; _i251 < _a250.length; _i251++) {
        const v_L = _a250[_i251];
        let _q252 = false;
        Q253: {
          const _a254 = sp.lineCells[v_L];
          for (let _i255 = 0; _i255 < _a254.length; _i255++) {
            const v_c = _a254[_i255];
            const _h256 = b.value(v_c);
            if ((_h256 === v_d)) {
              _q252 = true;
              break Q253;
            }
          }
        }
        let _c264 = !(_q252);
        if (!_c264) {
          let _c263 = _h257;
          if (_c263) {
            let _g258 = 0;
            G259: {
              const _a260 = sp.lineCells[v_L];
              for (let _i261 = 0; _i261 < _a260.length; _i261++) {
                const v_c = _a260[_i261];
                const _h262 = b.value(v_c);
                if (!((_h262 === v_d))) continue;
                _g258++;
              }
            }
            _c263 = (_g258 < v_k);
          }
          _c264 = _c263;
        }
        if (!(_c264)) continue;
        _g236.push(v_L);
      }
    }
    const v_X0 = _g236;
    const _h293 = v_X0.length;
    const _h294 = (_h293 - 2);
    let _g267 = 0;
    G268: {
      const _a277 = sp.cells;
      for (let _i278 = 0; _i278 < _a277.length; _i278++) {
        const v_c = _a277[_i278];
        const _h279 = b.value(v_c);
        let _c287 = (_h279 === v_d);
        if (_c287) {
          let _c286 = _h280;
          if (!_c286) {
            let _g281 = 0;
            G282: {
              const _a283 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i284 = 0; _i284 < _a283.length; _i284++) {
                const v_p = _a283[_i284];
                const _h285 = b.value(v_p);
                if (!((_h285 === v_d))) continue;
                _g281++;
              }
            }
            _c286 = (_g281 >= v_k);
          }
          _c287 = _c286;
        }
        if (!(_c287)) continue;
        const _t288 = ((v_c / sp.w) | 0);
        _g267 |= 1 << _t288;
      }
    }
    const v_Y0 = (_h266 & ~_g267);
    const _e289 = valuesOf(v_Y0);
    for (let _k290 = 0; _k290 < 1 << _e289.length; _k290++) {
      let v_T = 0;
      for (let _j291 = 0; _j291 < _e289.length; _j291++) if ((_k290 >> (_e289.length - 1 - _j291)) & 1) v_T |= 1 << _e289[_j291];
      const _h292 = popcount(v_T);
      const _h366 = (v_Y0 & ~v_T);
      if (!(((_h292 === 0) || ((2 <= _h292) && (_h292 <= _h294))))) continue;
      _g295.length = 0;
      G296: {
        const _a303 = v_X0;
        for (let _i304 = 0; _i304 < _a303.length; _i304++) {
          const v_L = _a303[_i304];
          let _q305 = false;
          Q306: {
            const _a307 = sp.lineCells[v_L];
            for (let _i308 = 0; _i308 < _a307.length; _i308++) {
              const v_c = _a307[_i308];
              const _h309 = b.known(v_c);
              if ((((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d)) && (_h280 || !(_h309)))) {
                _q305 = true;
                break Q306;
              }
            }
          }
          if (!(!(_q305))) continue;
          _g295.push(v_L);
        }
      }
      L310: {
        const v_X = _g295;
        const _h311 = v_X.length;
        let _c330 = (_h280 && (_h311 >= (_h293 - _h292)));
        if (!_c330) {
          let _c329 = _h257;
          if (_c329) {
            let _g312 = 0;
            G313: {
              const _a314 = v_X;
              for (let _i315 = 0; _i315 < _a314.length; _i315++) {
                const v_L = _a314[_i315];
                let _g316 = 0;
                G317: {
                  const _a318 = sp.lineCells[v_L];
                  for (let _i319 = 0; _i319 < _a318.length; _i319++) {
                    const v_c = _a318[_i319];
                    const _h320 = b.value(v_c);
                    if (!((_h320 === v_d))) continue;
                    _g316++;
                  }
                }
                _g312 += (v_k - _g316);
              }
            }
            let _g321 = 0;
            G322: {
              for (let _m323 = (v_Y0 & ~v_T); _m323 !== 0; _m323 &= _m323 - 1) {
                const v_r = 31 - Math.clz32(_m323 & -_m323);
                let _g324 = 0;
                G325: {
                  const _a326 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                  for (let _i327 = 0; _i327 < _a326.length; _i327++) {
                    const v_c = _a326[_i327];
                    const _h328 = b.value(v_c);
                    if (!((_h328 === v_d))) continue;
                    _g324++;
                  }
                }
                _g321 += (v_k - _g324);
              }
            }
            _c329 = (_g312 >= _g321);
          }
          _c330 = _c329;
        }
        if (!(_c330)) break L310;
        facts.length = 0;
        changed = false;
        let _c339 = (_h292 > 0);
        if (!_c339) {
          let _q331 = true;
          Q332: {
            const _a333 = sp.cols;
            for (let _i334 = 0; _i334 < _a333.length; _i334++) {
              const v_L = _a333[_i334];
              let _q335 = false;
              Q336: {
                const _a337 = sp.lineCells[v_L];
                for (let _i338 = 0; _i338 < _a337.length; _i338++) {
                  const v_c = _a337[_i338];
                  if (b.has(v_c, v_d)) {
                    _q335 = true;
                    break Q336;
                  }
                }
              }
              if (!(_q335)) {
                _q331 = false;
                break Q332;
              }
            }
          }
          _c339 = _q331;
        }
        let _c359 = _c339;
        if (_c359) {
          let _c358 = (_h280 && (_h311 === (_h293 - _h292)));
          if (!_c358) {
            let _c357 = _h257;
            if (_c357) {
              let _g340 = 0;
              G341: {
                const _a342 = v_X;
                for (let _i343 = 0; _i343 < _a342.length; _i343++) {
                  const v_L = _a342[_i343];
                  let _g344 = 0;
                  G345: {
                    const _a346 = sp.lineCells[v_L];
                    for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                      const v_c = _a346[_i347];
                      const _h348 = b.value(v_c);
                      if (!((_h348 === v_d))) continue;
                      _g344++;
                    }
                  }
                  _g340 += (v_k - _g344);
                }
              }
              let _g349 = 0;
              G350: {
                for (let _m351 = (v_Y0 & ~v_T); _m351 !== 0; _m351 &= _m351 - 1) {
                  const v_r = 31 - Math.clz32(_m351 & -_m351);
                  let _g352 = 0;
                  G353: {
                    const _a354 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                    for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                      const v_c = _a354[_i355];
                      const _h356 = b.value(v_c);
                      if (!((_h356 === v_d))) continue;
                      _g352++;
                    }
                  }
                  _g349 += (v_k - _g352);
                }
              }
              _c357 = (_g340 === _g349);
            }
            _c358 = _c357;
          }
          _c359 = _c358;
        }
        let _c368 = _c359;
        if (_c368) {
          let _q360 = true;
          Q361: {
            const _a362 = minus(v_X0, v_X);
            for (let _i363 = 0; _i363 < _a362.length; _i363++) {
              const v_L = _a362[_i363];
              const _a364 = sp.lineCells[v_L];
              for (let _i365 = 0; _i365 < _a364.length; _i365++) {
                const v_c = _a364[_i365];
                const _h367 = b.known(v_c);
                if (!((((((_h366 >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d)) && (_h280 || !(_h367))))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q360 = false;
                  break Q361;
                }
              }
            }
          }
          _c368 = _q360;
        }
        if (!(_c368)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, k: v_k, X0: v_X0, Y0: v_Y0, T: v_T, X: v_X }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface WingBinding {
  m: number;
  x: number;
  R: number;
  k0: number;
  t: number;
  E: readonly number[];
}

const wingFacts: number[] = [];
let wingCands = new Int32Array(0);

export function wing(b: Marks, sp: GridSpace, fire: Fire<WingBinding> | null): number {
  const _g452: number[] = [];
  const _g462: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a415 = sp.cells;
  for (let _i416 = 0; _i416 < _a415.length; _i416++) {
    const v_m = _a415[_i416];
    const _h417 = b.known(v_m);
    if (!(!(_h417))) continue;
    for (let _m418 = b.domain; _m418 !== 0; _m418 &= _m418 - 1) {
      const v_x = 31 - Math.clz32(_m418 & -_m418);
      if (!((b.multiplicity(v_x) === 1))) continue;
      L419: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cand(v_m))) & ~((1 << v_x)));
        const _h420 = popcount(v_R);
        let _c431 = (_h420 >= 1);
        if (_c431) {
          let _q421 = true;
          Q422: {
            for (let _m423 = v_R; _m423 !== 0; _m423 &= _m423 - 1) {
              const v_a = 31 - Math.clz32(_m423 & -_m423);
              const _h429 = ((1 << v_a) | (1 << v_x));
              let _c430 = (b.multiplicity(v_a) === 1);
              if (_c430) {
                let _q424 = false;
                Q425: {
                  const _a426 = sp.peers[v_m];
                  for (let _i427 = 0; _i427 < _a426.length; _i427++) {
                    const v_k = _a426[_i427];
                    const _h428 = b.known(v_k);
                    if ((!(_h428) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h429))) {
                      _q424 = true;
                      break Q425;
                    }
                  }
                }
                _c430 = _q424;
              }
              if (!(_c430)) {
                _q421 = false;
                break Q422;
              }
            }
          }
          _c431 = _q421;
        }
        if (!(_c431)) break L419;
        const _a432 = sp.peers[v_m];
        for (let _i433 = 0; _i433 < _a432.length; _i433++) {
          const v_k0 = _a432[_i433];
          const _h434 = b.known(v_k0);
          let _c438 = !(_h434);
          if (_c438) {
            let _g435 = -1;
            G436: {
              for (let _m437 = v_R; _m437 !== 0; _m437 &= _m437 - 1) {
                const v_a = 31 - Math.clz32(_m437 & -_m437);
                if (_g435 === -1 || v_a < _g435) _g435 = v_a;
              }
            }
            _c438 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cand(v_k0))) === ((1 << _g435) | (1 << v_x)));
          }
          if (!(_c438)) continue;
          const _a439 = sp.peers[v_k0];
          for (let _i440 = 0; _i440 < _a439.length; _i440++) {
            const v_t = _a439[_i440];
            const _h441 = b.known(v_t);
            let _c451 = ((((v_t !== v_m) && !(_h441)) && b.has(v_t, v_x)) && (!b.has(v_m, v_x) || (sp.peers[v_m].includes(v_t))));
            if (_c451) {
              let _q442 = true;
              Q443: {
                for (let _m444 = v_R; _m444 !== 0; _m444 &= _m444 - 1) {
                  const v_a = 31 - Math.clz32(_m444 & -_m444);
                  const _h450 = ((1 << v_a) | (1 << v_x));
                  let _q445 = false;
                  Q446: {
                    const _a447 = sp.peers[v_m];
                    for (let _i448 = 0; _i448 < _a447.length; _i448++) {
                      const v_k = _a447[_i448];
                      const _h449 = b.known(v_k);
                      if ((((!(_h449) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h450)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q445 = true;
                        break Q446;
                      }
                    }
                  }
                  if (!(_q445)) {
                    _q442 = false;
                    break Q443;
                  }
                }
              }
              _c451 = _q442;
            }
            if (!(_c451)) continue;
            _g452.length = 0;
            G453: {
              for (let _m461 = v_R; _m461 !== 0; _m461 &= _m461 - 1) {
                const v_a = 31 - Math.clz32(_m461 & -_m461);
                const _h469 = ((1 << v_a) | (1 << v_x));
                _g462.length = 0;
                G463: {
                  const _a466 = sp.peers[v_m];
                  for (let _i467 = 0; _i467 < _a466.length; _i467++) {
                    const v_k = _a466[_i467];
                    const _h468 = b.known(v_k);
                    if (!((((!(_h468) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h469)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g462.push(v_k);
                  }
                }
                const _t470 = (_g462.length > 0 ? _g462[0] : -1);
                if (!_g452.includes(_t470)) _g452.push(_t470);
              }
            }
            const v_E = _g452;
            facts.length = 0;
            changed = false;
            if (b.has(v_t, v_x)) { if (fire === null) { b.strikeAt(v_t, v_x); changed = true; } else facts.push(STRIKE, v_t, v_x); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ m: v_m, x: v_x, R: v_R, k0: v_k0, t: v_t, E: v_E }, facts)) return 1;
              cands.fill(-1);
            }
          }
        }
      }
    }
  }
  return fired;
}
