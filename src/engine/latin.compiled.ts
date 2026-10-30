// Compiled by `npm run describe` from src/engine/latin.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, least, minus, popcount, rangeMask, valuesOf } from "./describe-runtime.ts";

export interface PlacedBinding {
  c: number;
}

const placedFacts: number[] = [];

export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h3 = b.known(v_c);
  const _h8 = b.value(v_c);
  if (!(_h3)) return 0;
  facts.length = 0;
  changed = false;
  let _q4 = true;
  Q5: {
    const _a6 = sp.lineCells[sp.colOf[v_c]];
    for (let _i7 = 0; _i7 < _a6.length; _i7++) {
      const v_p = _a6[_i7];
      if (!((v_p !== v_c))) continue;
      if (b.has(v_p, _h8)) { if (fire === null) { b.strikeAt(v_p, _h8); changed = true; } else facts.push(STRIKE, v_p, _h8); }
      if (!(true)) {
        _q4 = false;
        break Q5;
      }
    }
  }
  let _c13 = _q4;
  if (_c13) {
    let _q9 = true;
    Q10: {
      const _a11 = sp.lineCells[sp.rowOf[v_c]];
      for (let _i12 = 0; _i12 < _a11.length; _i12++) {
        const v_p = _a11[_i12];
        if (!((v_p !== v_c))) continue;
        if (b.has(v_p, _h8)) { if (fire === null) { b.strikeAt(v_p, _h8); changed = true; } else facts.push(STRIKE, v_p, _h8); }
        if (!(true)) {
          _q9 = false;
          break Q10;
        }
      }
    }
    _c13 = _q9;
  }
  if (!(_c13)) return -1;
  if (changed || facts.length > 0) {
    fired = 1;
    if (fire !== null) fire({ c: v_c }, facts);
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
  const _a29 = sp.units;
  for (let _i30 = 0; _i30 < _a29.length; _i30++) {
    const v_u = _a29[_i30];
    let _g31 = 0;
    G32: {
      const _a35 = sp.lineCells[v_u];
      for (let _i36 = 0; _i36 < _a35.length; _i36++) {
        const v_c = _a35[_i36];
        if (!(b.known(v_c))) continue;
        const _t37 = b.value(v_c);
        _g31 |= 1 << _t37;
      }
    }
    const v_placed = _g31;
    for (let _m38 = (b.domain & ~v_placed); _m38 !== 0; _m38 &= _m38 - 1) {
      const v_d = 31 - Math.clz32(_m38 & -_m38);
      let _g39 = 0;
      G40: {
        const _a41 = sp.lineCells[v_u];
        for (let _i42 = 0; _i42 < _a41.length; _i42++) {
          const v_c = _a41[_i42];
          if (!(b.has(v_c, v_d))) continue;
          _g39++;
        }
      }
      L43: {
        const v_n = _g39;
        if (!((v_n < 2))) break L43;
        facts.length = 0;
        changed = false;
        let _c49 = (v_n === 1);
        if (_c49) {
          let _g44 = -1;
          let _n46 = 0;
          G45: {
            const _a47 = sp.lineCells[v_u];
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_c = _a47[_i48];
              if (!(b.has(v_c, v_d))) continue;
              if (++_n46 === 2) {
                _g44 = -1;
                break G45;
              }
              _g44 = v_c;
            }
          }
          if (!b.known(_g44)) { if (fire === null) { b.placeAt(_g44, v_d); changed = true; } else facts.push(PLACE, _g44, v_d); }
          _c49 = true;
        }
        if (!(_c49)) return -1;
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
  const _a54 = sp.cols;
  for (let _i55 = 0; _i55 < _a54.length; _i55++) {
    const v_L = _a54[_i55];
    const _a56 = sp.lineCells[v_L];
    for (let _i57 = 0; _i57 < _a56.length; _i57++) {
      const v_c = _a56[_i57];
      if (!((!(b.known(v_c)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) < 2)))) continue;
      facts.length = 0;
      changed = false;
      let _c59 = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) === 1);
      if (_c59) {
        const _t58 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))));
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t58); changed = true; } else facts.push(PLACE, v_c, _t58); }
        _c59 = true;
      }
      if (!(_c59)) return -1;
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
  T: number;
  S: readonly number[];
}

const setFacts: number[] = [];
let setCands = new Int32Array(0);

export function set(b: Marks, sp: GridSpace, fire: Fire<SetBinding> | null): number {
  const _g95: number[] = [];
  const _g107: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  if (setCands.length < sp.cells.length) setCands = new Int32Array(sp.cells.length);
  const cands = setCands;
  cands.fill(-1);
  const _a85 = sp.units;
  for (let _i86 = 0; _i86 < _a85.length; _i86++) {
    const v_u = _a85[_i86];
    let _g87 = 0;
    G88: {
      const _a91 = sp.lineCells[v_u];
      for (let _i92 = 0; _i92 < _a91.length; _i92++) {
        const v_c = _a91[_i92];
        const _h93 = b.known(v_c);
        const _h94 = b.value(v_c);
        if (!(_h93)) continue;
        _g87 |= 1 << _h94;
      }
    }
    const v_V = (b.domain & ~_g87);
    const _h106 = (popcount(v_V) - 2);
    const _h115 = popcount(v_V);
    _g95.length = 0;
    G96: {
      const _a99 = sp.lineCells[v_u];
      for (let _i100 = 0; _i100 < _a99.length; _i100++) {
        const v_c = _a99[_i100];
        const _h101 = b.known(v_c);
        if (!(!(_h101))) continue;
        _g95.push(v_c);
      }
    }
    const v_open = _g95;
    const _e102 = valuesOf(v_V);
    for (let _k103 = 0; _k103 < 1 << _e102.length; _k103++) {
      let v_T = 0;
      for (let _j104 = 0; _j104 < _e102.length; _j104++) if ((_k103 >> (_e102.length - 1 - _j104)) & 1) v_T |= 1 << _e102[_j104];
      const _h105 = popcount(v_T);
      const _h125 = (v_V & ~v_T);
      if (!(((_h105 === 0) || ((2 <= _h105) && (_h105 <= _h106))))) continue;
      _g107.length = 0;
      G108: {
        const _a111 = v_open;
        for (let _i112 = 0; _i112 < _a111.length; _i112++) {
          const v_c = _a111[_i112];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) !== 0)))) continue;
          _g107.push(v_c);
        }
      }
      L113: {
        const v_S = _g107;
        const _h114 = v_S.length;
        if (!((_h114 >= (_h115 - _h105)))) break L113;
        facts.length = 0;
        changed = false;
        let _c120 = (_h105 > 0);
        if (!_c120) {
          let _q116 = true;
          Q117: {
            const _a118 = sp.lineCells[v_u];
            for (let _i119 = 0; _i119 < _a118.length; _i119++) {
              const v_c = _a118[_i119];
              if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) > 0))) {
                _q116 = false;
                break Q117;
              }
            }
          }
          _c120 = _q116;
        }
        let _c127 = (_c120 && (_h114 === (_h115 - _h105)));
        if (_c127) {
          let _q121 = true;
          Q122: {
            const _a123 = v_open;
            for (let _i124 = 0; _i124 < _a123.length; _i124++) {
              const v_c = _a123[_i124];
              if (!(!(v_S.includes(v_c)))) continue;
              for (let _m126 = _h125; _m126 !== 0; _m126 &= _m126 - 1) {
                const v_d = 31 - Math.clz32(_m126 & -_m126);
                if (!(b.has(v_c, v_d))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q121 = false;
                  break Q122;
                }
              }
            }
          }
          _c127 = _q121;
        }
        if (!(_c127)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ u: v_u, V: v_V, open: v_open, T: v_T, S: v_S }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface FishBinding {
  d: number;
  X0: readonly number[];
  Y0: number;
  T: number;
  X: readonly number[];
}

const fishFacts: number[] = [];
let fishCands = new Int32Array(0);

export function fish(b: Marks, sp: GridSpace, fire: Fire<FishBinding> | null): number {
  const _g169: number[] = [];
  const _g198: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  const _h184 = rangeMask(0, (sp.h - 1));
  if (fishCands.length < sp.cells.length) fishCands = new Int32Array(sp.cells.length);
  const cands = fishCands;
  cands.fill(-1);
  for (let _m168 = b.domain; _m168 !== 0; _m168 &= _m168 - 1) {
    const v_d = 31 - Math.clz32(_m168 & -_m168);
    _g169.length = 0;
    G170: {
      const _a177 = sp.cols;
      for (let _i178 = 0; _i178 < _a177.length; _i178++) {
        const v_L = _a177[_i178];
        let _q179 = false;
        Q180: {
          const _a181 = sp.lineCells[v_L];
          for (let _i182 = 0; _i182 < _a181.length; _i182++) {
            const v_c = _a181[_i182];
            const _h183 = b.value(v_c);
            if ((_h183 === v_d)) {
              _q179 = true;
              break Q180;
            }
          }
        }
        if (!(!(_q179))) continue;
        _g169.push(v_L);
      }
    }
    const v_X0 = _g169;
    const _h197 = (v_X0.length - 2);
    const _h214 = v_X0.length;
    let _g185 = 0;
    G186: {
      const _a189 = sp.cells;
      for (let _i190 = 0; _i190 < _a189.length; _i190++) {
        const v_c = _a189[_i190];
        const _h191 = b.value(v_c);
        if (!((_h191 === v_d))) continue;
        const _t192 = ((v_c / sp.w) | 0);
        _g185 |= 1 << _t192;
      }
    }
    const v_Y0 = (_h184 & ~_g185);
    const _e193 = valuesOf(v_Y0);
    for (let _k194 = 0; _k194 < 1 << _e193.length; _k194++) {
      let v_T = 0;
      for (let _j195 = 0; _j195 < _e193.length; _j195++) if ((_k194 >> (_e193.length - 1 - _j195)) & 1) v_T |= 1 << _e193[_j195];
      const _h196 = popcount(v_T);
      const _h230 = (v_Y0 & ~v_T);
      if (!(((_h196 === 0) || ((2 <= _h196) && (_h196 <= _h197))))) continue;
      _g198.length = 0;
      G199: {
        const _a206 = v_X0;
        for (let _i207 = 0; _i207 < _a206.length; _i207++) {
          const v_L = _a206[_i207];
          let _q208 = false;
          Q209: {
            const _a210 = sp.lineCells[v_L];
            for (let _i211 = 0; _i211 < _a210.length; _i211++) {
              const v_c = _a210[_i211];
              if (((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d))) {
                _q208 = true;
                break Q209;
              }
            }
          }
          if (!(!(_q208))) continue;
          _g198.push(v_L);
        }
      }
      L212: {
        const v_X = _g198;
        const _h213 = v_X.length;
        if (!((_h213 >= (_h214 - _h196)))) break L212;
        facts.length = 0;
        changed = false;
        let _c223 = (_h196 > 0);
        if (!_c223) {
          let _q215 = true;
          Q216: {
            const _a217 = sp.cols;
            for (let _i218 = 0; _i218 < _a217.length; _i218++) {
              const v_L = _a217[_i218];
              let _q219 = false;
              Q220: {
                const _a221 = sp.lineCells[v_L];
                for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                  const v_c = _a221[_i222];
                  if (b.has(v_c, v_d)) {
                    _q219 = true;
                    break Q220;
                  }
                }
              }
              if (!(_q219)) {
                _q215 = false;
                break Q216;
              }
            }
          }
          _c223 = _q215;
        }
        let _c231 = (_c223 && (_h213 === (_h214 - _h196)));
        if (_c231) {
          let _q224 = true;
          Q225: {
            const _a226 = minus(v_X0, v_X);
            for (let _i227 = 0; _i227 < _a226.length; _i227++) {
              const v_L = _a226[_i227];
              const _a228 = sp.lineCells[v_L];
              for (let _i229 = 0; _i229 < _a228.length; _i229++) {
                const v_c = _a228[_i229];
                if (!(((((_h230 >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d)))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q224 = false;
                  break Q225;
                }
              }
            }
          }
          _c231 = _q224;
        }
        if (!(_c231)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, X0: v_X0, Y0: v_Y0, T: v_T, X: v_X }, facts)) return 1;
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
  const _g313: number[] = [];
  const _g323: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a277 = sp.cells;
  for (let _i278 = 0; _i278 < _a277.length; _i278++) {
    const v_m = _a277[_i278];
    const _h279 = b.known(v_m);
    if (!(!(_h279))) continue;
    for (let _m280 = b.domain; _m280 !== 0; _m280 &= _m280 - 1) {
      const v_x = 31 - Math.clz32(_m280 & -_m280);
      L281: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cand(v_m))) & ~((1 << v_x)));
        const _h282 = popcount(v_R);
        let _c292 = (_h282 >= 1);
        if (_c292) {
          let _q283 = true;
          Q284: {
            for (let _m285 = v_R; _m285 !== 0; _m285 &= _m285 - 1) {
              const v_a = 31 - Math.clz32(_m285 & -_m285);
              const _h291 = ((1 << v_a) | (1 << v_x));
              let _q286 = false;
              Q287: {
                const _a288 = sp.peers[v_m];
                for (let _i289 = 0; _i289 < _a288.length; _i289++) {
                  const v_k = _a288[_i289];
                  const _h290 = b.known(v_k);
                  if ((!(_h290) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h291))) {
                    _q286 = true;
                    break Q287;
                  }
                }
              }
              if (!(_q286)) {
                _q283 = false;
                break Q284;
              }
            }
          }
          _c292 = _q283;
        }
        if (!(_c292)) break L281;
        const _a293 = sp.peers[v_m];
        for (let _i294 = 0; _i294 < _a293.length; _i294++) {
          const v_k0 = _a293[_i294];
          const _h295 = b.known(v_k0);
          let _c299 = !(_h295);
          if (_c299) {
            let _g296 = -1;
            G297: {
              for (let _m298 = v_R; _m298 !== 0; _m298 &= _m298 - 1) {
                const v_a = 31 - Math.clz32(_m298 & -_m298);
                if (_g296 === -1 || v_a < _g296) _g296 = v_a;
              }
            }
            _c299 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cand(v_k0))) === ((1 << _g296) | (1 << v_x)));
          }
          if (!(_c299)) continue;
          const _a300 = sp.peers[v_k0];
          for (let _i301 = 0; _i301 < _a300.length; _i301++) {
            const v_t = _a300[_i301];
            const _h302 = b.known(v_t);
            let _c312 = ((((v_t !== v_m) && !(_h302)) && b.has(v_t, v_x)) && (!b.has(v_m, v_x) || (sp.peers[v_m].includes(v_t))));
            if (_c312) {
              let _q303 = true;
              Q304: {
                for (let _m305 = v_R; _m305 !== 0; _m305 &= _m305 - 1) {
                  const v_a = 31 - Math.clz32(_m305 & -_m305);
                  const _h311 = ((1 << v_a) | (1 << v_x));
                  let _q306 = false;
                  Q307: {
                    const _a308 = sp.peers[v_m];
                    for (let _i309 = 0; _i309 < _a308.length; _i309++) {
                      const v_k = _a308[_i309];
                      const _h310 = b.known(v_k);
                      if ((((!(_h310) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h311)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q306 = true;
                        break Q307;
                      }
                    }
                  }
                  if (!(_q306)) {
                    _q303 = false;
                    break Q304;
                  }
                }
              }
              _c312 = _q303;
            }
            if (!(_c312)) continue;
            _g313.length = 0;
            G314: {
              for (let _m322 = v_R; _m322 !== 0; _m322 &= _m322 - 1) {
                const v_a = 31 - Math.clz32(_m322 & -_m322);
                const _h330 = ((1 << v_a) | (1 << v_x));
                _g323.length = 0;
                G324: {
                  const _a327 = sp.peers[v_m];
                  for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                    const v_k = _a327[_i328];
                    const _h329 = b.known(v_k);
                    if (!((((!(_h329) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h330)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g323.push(v_k);
                  }
                }
                const _t331 = (_g323.length > 0 ? _g323[0] : -1);
                if (!_g313.includes(_t331)) _g313.push(_t331);
              }
            }
            const v_E = _g313;
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
