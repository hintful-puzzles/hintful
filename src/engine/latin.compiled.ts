// Compiled by `npm run describe` from src/engine/latin.description.json: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, least, minus, popcount, rangeMask, valuesOf } from "./describe-runtime.ts";

export interface PlacedBinding {
  c: number;
}

const placedFacts: number[] = [];

export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  if (!(b.known(v_c))) return 0;
  facts.length = 0;
  changed = false;
  let _q3 = true;
  Q4: {
    const _a5 = sp.lineCells[sp.colOf[v_c]];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_p = _a5[_i6];
      if (!((v_p !== v_c))) continue;
      const _t7 = b.value(v_c);
      if (b.has(v_p, _t7)) { if (fire === null) { b.strikeAt(v_p, _t7); changed = true; } else facts.push(STRIKE, v_p, _t7); }
      if (!(true)) {
        _q3 = false;
        break Q4;
      }
    }
  }
  let _c13 = _q3;
  if (_c13) {
    let _q8 = true;
    Q9: {
      const _a10 = sp.lineCells[sp.rowOf[v_c]];
      for (let _i11 = 0; _i11 < _a10.length; _i11++) {
        const v_p = _a10[_i11];
        if (!((v_p !== v_c))) continue;
        const _t12 = b.value(v_c);
        if (b.has(v_p, _t12)) { if (fire === null) { b.strikeAt(v_p, _t12); changed = true; } else facts.push(STRIKE, v_p, _t12); }
        if (!(true)) {
          _q8 = false;
          break Q9;
        }
      }
    }
    _c13 = _q8;
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
  const _g94: number[] = [];
  const _g103: number[] = [];
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
        if (!(b.known(v_c))) continue;
        const _t93 = b.value(v_c);
        _g87 |= 1 << _t93;
      }
    }
    const v_V = (b.domain & ~_g87);
    _g94.length = 0;
    G95: {
      const _a98 = sp.lineCells[v_u];
      for (let _i99 = 0; _i99 < _a98.length; _i99++) {
        const v_c = _a98[_i99];
        if (!(!(b.known(v_c)))) continue;
        _g94.push(v_c);
      }
    }
    const v_open = _g94;
    const _e100 = valuesOf(v_V);
    for (let _k101 = 0; _k101 < 1 << _e100.length; _k101++) {
      let v_T = 0;
      for (let _j102 = 0; _j102 < _e100.length; _j102++) if ((_k101 >> (_e100.length - 1 - _j102)) & 1) v_T |= 1 << _e100[_j102];
      if (!(((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (popcount(v_V) - 2)))))) continue;
      _g103.length = 0;
      G104: {
        const _a107 = v_open;
        for (let _i108 = 0; _i108 < _a107.length; _i108++) {
          const v_c = _a107[_i108];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) !== 0)))) continue;
          _g103.push(v_c);
        }
      }
      L109: {
        const v_S = _g103;
        if (!((v_S.length >= (popcount(v_V) - popcount(v_T))))) break L109;
        facts.length = 0;
        changed = false;
        let _c114 = (popcount(v_T) > 0);
        if (!_c114) {
          let _q110 = true;
          Q111: {
            const _a112 = sp.lineCells[v_u];
            for (let _i113 = 0; _i113 < _a112.length; _i113++) {
              const v_c = _a112[_i113];
              if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) > 0))) {
                _q110 = false;
                break Q111;
              }
            }
          }
          _c114 = _q110;
        }
        let _c120 = (_c114 && (v_S.length === (popcount(v_V) - popcount(v_T))));
        if (_c120) {
          let _q115 = true;
          Q116: {
            const _a117 = v_open;
            for (let _i118 = 0; _i118 < _a117.length; _i118++) {
              const v_c = _a117[_i118];
              if (!(!(v_S.includes(v_c)))) continue;
              for (let _m119 = (v_V & ~v_T); _m119 !== 0; _m119 &= _m119 - 1) {
                const v_d = 31 - Math.clz32(_m119 & -_m119);
                if (!(b.has(v_c, v_d))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q115 = false;
                  break Q116;
                }
              }
            }
          }
          _c120 = _q115;
        }
        if (!(_c120)) return -1;
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
  const _g162: number[] = [];
  const _g186: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  if (fishCands.length < sp.cells.length) fishCands = new Int32Array(sp.cells.length);
  const cands = fishCands;
  cands.fill(-1);
  for (let _m161 = b.domain; _m161 !== 0; _m161 &= _m161 - 1) {
    const v_d = 31 - Math.clz32(_m161 & -_m161);
    _g162.length = 0;
    G163: {
      const _a170 = sp.cols;
      for (let _i171 = 0; _i171 < _a170.length; _i171++) {
        const v_L = _a170[_i171];
        let _q172 = false;
        Q173: {
          const _a174 = sp.lineCells[v_L];
          for (let _i175 = 0; _i175 < _a174.length; _i175++) {
            const v_c = _a174[_i175];
            if ((b.value(v_c) === v_d)) {
              _q172 = true;
              break Q173;
            }
          }
        }
        if (!(!(_q172))) continue;
        _g162.push(v_L);
      }
    }
    const v_X0 = _g162;
    let _g176 = 0;
    G177: {
      const _a180 = sp.cells;
      for (let _i181 = 0; _i181 < _a180.length; _i181++) {
        const v_c = _a180[_i181];
        if (!((b.value(v_c) === v_d))) continue;
        const _t182 = ((v_c / sp.w) | 0);
        _g176 |= 1 << _t182;
      }
    }
    const v_Y0 = (rangeMask(0, (sp.h - 1)) & ~_g176);
    const _e183 = valuesOf(v_Y0);
    for (let _k184 = 0; _k184 < 1 << _e183.length; _k184++) {
      let v_T = 0;
      for (let _j185 = 0; _j185 < _e183.length; _j185++) if ((_k184 >> (_e183.length - 1 - _j185)) & 1) v_T |= 1 << _e183[_j185];
      if (!(((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (v_X0.length - 2)))))) continue;
      _g186.length = 0;
      G187: {
        const _a194 = v_X0;
        for (let _i195 = 0; _i195 < _a194.length; _i195++) {
          const v_L = _a194[_i195];
          let _q196 = false;
          Q197: {
            const _a198 = sp.lineCells[v_L];
            for (let _i199 = 0; _i199 < _a198.length; _i199++) {
              const v_c = _a198[_i199];
              if (((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d))) {
                _q196 = true;
                break Q197;
              }
            }
          }
          if (!(!(_q196))) continue;
          _g186.push(v_L);
        }
      }
      L200: {
        const v_X = _g186;
        if (!((v_X.length >= (v_X0.length - popcount(v_T))))) break L200;
        facts.length = 0;
        changed = false;
        let _c209 = (popcount(v_T) > 0);
        if (!_c209) {
          let _q201 = true;
          Q202: {
            const _a203 = sp.cols;
            for (let _i204 = 0; _i204 < _a203.length; _i204++) {
              const v_L = _a203[_i204];
              let _q205 = false;
              Q206: {
                const _a207 = sp.lineCells[v_L];
                for (let _i208 = 0; _i208 < _a207.length; _i208++) {
                  const v_c = _a207[_i208];
                  if (b.has(v_c, v_d)) {
                    _q205 = true;
                    break Q206;
                  }
                }
              }
              if (!(_q205)) {
                _q201 = false;
                break Q202;
              }
            }
          }
          _c209 = _q201;
        }
        let _c216 = (_c209 && (v_X.length === (v_X0.length - popcount(v_T))));
        if (_c216) {
          let _q210 = true;
          Q211: {
            const _a212 = minus(v_X0, v_X);
            for (let _i213 = 0; _i213 < _a212.length; _i213++) {
              const v_L = _a212[_i213];
              const _a214 = sp.lineCells[v_L];
              for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                const v_c = _a214[_i215];
                if (!((((((v_Y0 & ~v_T) >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d)))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q210 = false;
                  break Q211;
                }
              }
            }
          }
          _c216 = _q210;
        }
        if (!(_c216)) return -1;
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
  const _g290: number[] = [];
  const _g300: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a262 = sp.cells;
  for (let _i263 = 0; _i263 < _a262.length; _i263++) {
    const v_m = _a262[_i263];
    if (!(!(b.known(v_m)))) continue;
    for (let _m264 = b.domain; _m264 !== 0; _m264 &= _m264 - 1) {
      const v_x = 31 - Math.clz32(_m264 & -_m264);
      L265: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cand(v_m))) & ~((1 << v_x)));
        let _c273 = (popcount(v_R) >= 1);
        if (_c273) {
          let _q266 = true;
          Q267: {
            for (let _m268 = v_R; _m268 !== 0; _m268 &= _m268 - 1) {
              const v_a = 31 - Math.clz32(_m268 & -_m268);
              let _q269 = false;
              Q270: {
                const _a271 = sp.peers[v_m];
                for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                  const v_k = _a271[_i272];
                  if ((!(b.known(v_k)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === ((1 << v_a) | (1 << v_x))))) {
                    _q269 = true;
                    break Q270;
                  }
                }
              }
              if (!(_q269)) {
                _q266 = false;
                break Q267;
              }
            }
          }
          _c273 = _q266;
        }
        if (!(_c273)) break L265;
        const _a274 = sp.peers[v_m];
        for (let _i275 = 0; _i275 < _a274.length; _i275++) {
          const v_k0 = _a274[_i275];
          let _c279 = !(b.known(v_k0));
          if (_c279) {
            let _g276 = -1;
            G277: {
              for (let _m278 = v_R; _m278 !== 0; _m278 &= _m278 - 1) {
                const v_a = 31 - Math.clz32(_m278 & -_m278);
                if (_g276 === -1 || v_a < _g276) _g276 = v_a;
              }
            }
            _c279 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cand(v_k0))) === ((1 << _g276) | (1 << v_x)));
          }
          if (!(_c279)) continue;
          const _a280 = sp.peers[v_k0];
          for (let _i281 = 0; _i281 < _a280.length; _i281++) {
            const v_t = _a280[_i281];
            let _c289 = ((((v_t !== v_m) && !(b.known(v_t))) && b.has(v_t, v_x)) && (!b.has(v_m, v_x) || (sp.peers[v_m].includes(v_t))));
            if (_c289) {
              let _q282 = true;
              Q283: {
                for (let _m284 = v_R; _m284 !== 0; _m284 &= _m284 - 1) {
                  const v_a = 31 - Math.clz32(_m284 & -_m284);
                  let _q285 = false;
                  Q286: {
                    const _a287 = sp.peers[v_m];
                    for (let _i288 = 0; _i288 < _a287.length; _i288++) {
                      const v_k = _a287[_i288];
                      if ((((!(b.known(v_k)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q285 = true;
                        break Q286;
                      }
                    }
                  }
                  if (!(_q285)) {
                    _q282 = false;
                    break Q283;
                  }
                }
              }
              _c289 = _q282;
            }
            if (!(_c289)) continue;
            _g290.length = 0;
            G291: {
              for (let _m299 = v_R; _m299 !== 0; _m299 &= _m299 - 1) {
                const v_a = 31 - Math.clz32(_m299 & -_m299);
                _g300.length = 0;
                G301: {
                  const _a304 = sp.peers[v_m];
                  for (let _i305 = 0; _i305 < _a304.length; _i305++) {
                    const v_k = _a304[_i305];
                    if (!((((!(b.known(v_k)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g300.push(v_k);
                  }
                }
                const _t306 = (_g300.length > 0 ? _g300[0] : -1);
                if (!_g290.includes(_t306)) _g290.push(_t306);
              }
            }
            const v_E = _g290;
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
