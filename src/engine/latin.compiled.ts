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
  const _g108: number[] = [];
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
    const _h106 = popcount(v_V);
    const _h107 = (_h106 - 2);
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
      if (!(((_h105 === 0) || ((2 <= _h105) && (_h105 <= _h107))))) continue;
      _g108.length = 0;
      G109: {
        const _a112 = v_open;
        for (let _i113 = 0; _i113 < _a112.length; _i113++) {
          const v_c = _a112[_i113];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) !== 0)))) continue;
          _g108.push(v_c);
        }
      }
      L114: {
        const v_S = _g108;
        const _h115 = v_S.length;
        if (!((_h115 >= (_h106 - _h105)))) break L114;
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
        let _c127 = (_c120 && (_h115 === (_h106 - _h105)));
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
  const _g200: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  const _h184 = (sp.h - 1);
  const _h185 = rangeMask(0, _h184);
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
    const _h198 = v_X0.length;
    const _h199 = (_h198 - 2);
    let _g186 = 0;
    G187: {
      const _a190 = sp.cells;
      for (let _i191 = 0; _i191 < _a190.length; _i191++) {
        const v_c = _a190[_i191];
        const _h192 = b.value(v_c);
        if (!((_h192 === v_d))) continue;
        const _t193 = ((v_c / sp.w) | 0);
        _g186 |= 1 << _t193;
      }
    }
    const v_Y0 = (_h185 & ~_g186);
    const _e194 = valuesOf(v_Y0);
    for (let _k195 = 0; _k195 < 1 << _e194.length; _k195++) {
      let v_T = 0;
      for (let _j196 = 0; _j196 < _e194.length; _j196++) if ((_k195 >> (_e194.length - 1 - _j196)) & 1) v_T |= 1 << _e194[_j196];
      const _h197 = popcount(v_T);
      const _h231 = (v_Y0 & ~v_T);
      if (!(((_h197 === 0) || ((2 <= _h197) && (_h197 <= _h199))))) continue;
      _g200.length = 0;
      G201: {
        const _a208 = v_X0;
        for (let _i209 = 0; _i209 < _a208.length; _i209++) {
          const v_L = _a208[_i209];
          let _q210 = false;
          Q211: {
            const _a212 = sp.lineCells[v_L];
            for (let _i213 = 0; _i213 < _a212.length; _i213++) {
              const v_c = _a212[_i213];
              if (((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d))) {
                _q210 = true;
                break Q211;
              }
            }
          }
          if (!(!(_q210))) continue;
          _g200.push(v_L);
        }
      }
      L214: {
        const v_X = _g200;
        const _h215 = v_X.length;
        if (!((_h215 >= (_h198 - _h197)))) break L214;
        facts.length = 0;
        changed = false;
        let _c224 = (_h197 > 0);
        if (!_c224) {
          let _q216 = true;
          Q217: {
            const _a218 = sp.cols;
            for (let _i219 = 0; _i219 < _a218.length; _i219++) {
              const v_L = _a218[_i219];
              let _q220 = false;
              Q221: {
                const _a222 = sp.lineCells[v_L];
                for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                  const v_c = _a222[_i223];
                  if (b.has(v_c, v_d)) {
                    _q220 = true;
                    break Q221;
                  }
                }
              }
              if (!(_q220)) {
                _q216 = false;
                break Q217;
              }
            }
          }
          _c224 = _q216;
        }
        let _c232 = (_c224 && (_h215 === (_h198 - _h197)));
        if (_c232) {
          let _q225 = true;
          Q226: {
            const _a227 = minus(v_X0, v_X);
            for (let _i228 = 0; _i228 < _a227.length; _i228++) {
              const v_L = _a227[_i228];
              const _a229 = sp.lineCells[v_L];
              for (let _i230 = 0; _i230 < _a229.length; _i230++) {
                const v_c = _a229[_i230];
                if (!(((((_h231 >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d)))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q225 = false;
                  break Q226;
                }
              }
            }
          }
          _c232 = _q225;
        }
        if (!(_c232)) return -1;
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
  const _g314: number[] = [];
  const _g324: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a278 = sp.cells;
  for (let _i279 = 0; _i279 < _a278.length; _i279++) {
    const v_m = _a278[_i279];
    const _h280 = b.known(v_m);
    if (!(!(_h280))) continue;
    for (let _m281 = b.domain; _m281 !== 0; _m281 &= _m281 - 1) {
      const v_x = 31 - Math.clz32(_m281 & -_m281);
      L282: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cand(v_m))) & ~((1 << v_x)));
        const _h283 = popcount(v_R);
        let _c293 = (_h283 >= 1);
        if (_c293) {
          let _q284 = true;
          Q285: {
            for (let _m286 = v_R; _m286 !== 0; _m286 &= _m286 - 1) {
              const v_a = 31 - Math.clz32(_m286 & -_m286);
              const _h292 = ((1 << v_a) | (1 << v_x));
              let _q287 = false;
              Q288: {
                const _a289 = sp.peers[v_m];
                for (let _i290 = 0; _i290 < _a289.length; _i290++) {
                  const v_k = _a289[_i290];
                  const _h291 = b.known(v_k);
                  if ((!(_h291) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h292))) {
                    _q287 = true;
                    break Q288;
                  }
                }
              }
              if (!(_q287)) {
                _q284 = false;
                break Q285;
              }
            }
          }
          _c293 = _q284;
        }
        if (!(_c293)) break L282;
        const _a294 = sp.peers[v_m];
        for (let _i295 = 0; _i295 < _a294.length; _i295++) {
          const v_k0 = _a294[_i295];
          const _h296 = b.known(v_k0);
          let _c300 = !(_h296);
          if (_c300) {
            let _g297 = -1;
            G298: {
              for (let _m299 = v_R; _m299 !== 0; _m299 &= _m299 - 1) {
                const v_a = 31 - Math.clz32(_m299 & -_m299);
                if (_g297 === -1 || v_a < _g297) _g297 = v_a;
              }
            }
            _c300 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cand(v_k0))) === ((1 << _g297) | (1 << v_x)));
          }
          if (!(_c300)) continue;
          const _a301 = sp.peers[v_k0];
          for (let _i302 = 0; _i302 < _a301.length; _i302++) {
            const v_t = _a301[_i302];
            const _h303 = b.known(v_t);
            let _c313 = ((((v_t !== v_m) && !(_h303)) && b.has(v_t, v_x)) && (!b.has(v_m, v_x) || (sp.peers[v_m].includes(v_t))));
            if (_c313) {
              let _q304 = true;
              Q305: {
                for (let _m306 = v_R; _m306 !== 0; _m306 &= _m306 - 1) {
                  const v_a = 31 - Math.clz32(_m306 & -_m306);
                  const _h312 = ((1 << v_a) | (1 << v_x));
                  let _q307 = false;
                  Q308: {
                    const _a309 = sp.peers[v_m];
                    for (let _i310 = 0; _i310 < _a309.length; _i310++) {
                      const v_k = _a309[_i310];
                      const _h311 = b.known(v_k);
                      if ((((!(_h311) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h312)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q307 = true;
                        break Q308;
                      }
                    }
                  }
                  if (!(_q307)) {
                    _q304 = false;
                    break Q305;
                  }
                }
              }
              _c313 = _q304;
            }
            if (!(_c313)) continue;
            _g314.length = 0;
            G315: {
              for (let _m323 = v_R; _m323 !== 0; _m323 &= _m323 - 1) {
                const v_a = 31 - Math.clz32(_m323 & -_m323);
                const _h331 = ((1 << v_a) | (1 << v_x));
                _g324.length = 0;
                G325: {
                  const _a328 = sp.peers[v_m];
                  for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                    const v_k = _a328[_i329];
                    const _h330 = b.known(v_k);
                    if (!((((!(_h330) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h331)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g324.push(v_k);
                  }
                }
                const _t332 = (_g324.length > 0 ? _g324[0] : -1);
                if (!_g314.includes(_t332)) _g314.push(_t332);
              }
            }
            const v_E = _g314;
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
