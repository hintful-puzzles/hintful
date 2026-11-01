// Compiled by `npm run describe` from src/engine/latin.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, least, minus, popcount, rangeMask, valuesOf } from "./describe-runtime.ts";

export interface PlacedBinding {
  c: number;
  d: number;
  k: number;
  u: number;
}

const placedFacts: number[] = [];

export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h5 = b.known(v_c);
  const _h6 = b.value(v_c);
  if (!(_h5)) return 0;
  const v_d = _h6;
  const v_k = (v_d === b.repeat ? b.times : 1);
  const _h9 = (v_k === 1);
  const _a7 = sp.unitsOf[v_c];
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_u = _a7[_i8];
    facts.length = 0;
    changed = false;
    let _c15 = _h9;
    if (!_c15) {
      let _g10 = 0;
      G11: {
        const _a12 = sp.lineCells[v_u];
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_p = _a12[_i13];
          const _h14 = b.value(v_p);
          if (!((_h14 === v_d))) continue;
          _g10++;
        }
      }
      _c15 = (_g10 >= v_k);
    }
    let _c21 = !(_c15);
    if (!_c21) {
      let _q16 = true;
      Q17: {
        const _a18 = sp.lineCells[v_u];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_p = _a18[_i19];
          const _h20 = b.value(v_p);
          if (!(((v_p !== v_c) && (_h9 || (_h20 !== v_d))))) continue;
          if (b.has(v_p, v_d)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
          if (!(true)) {
            _q16 = false;
            break Q17;
          }
        }
      }
      _c21 = _q16;
    }
    if (!(_c21)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, d: v_d, k: v_k, u: v_u }, facts);
    }
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

export function hiddenSingle(b: Marks, sp: GridSpace, fire: Fire<HiddenSingleBinding> | null): number {
  const facts = hiddenSingleFacts;
  let fired = 0;
  let changed = false;
  const _a37 = sp.units;
  for (let _i38 = 0; _i38 < _a37.length; _i38++) {
    const v_u = _a37[_i38];
    let _g39 = 0;
    G40: {
      const _a43 = sp.lineCells[v_u];
      for (let _i44 = 0; _i44 < _a43.length; _i44++) {
        const v_c = _a43[_i44];
        if (!((b.known(v_c) && ((b.value(v_c) === b.repeat ? b.times : 1) === 1)))) continue;
        const _t45 = b.value(v_c);
        _g39 |= 1 << _t45;
      }
    }
    const v_placed = _g39;
    for (let _m46 = (b.domain & ~v_placed); _m46 !== 0; _m46 &= _m46 - 1) {
      const v_d = 31 - Math.clz32(_m46 & -_m46);
      let _g47 = 0;
      G48: {
        const _a49 = sp.lineCells[v_u];
        for (let _i50 = 0; _i50 < _a49.length; _i50++) {
          const v_c = _a49[_i50];
          if (!(b.has(v_c, v_d))) continue;
          _g47++;
        }
      }
      L51: {
        const v_n = _g47;
        if (!((v_n <= (v_d === b.repeat ? b.times : 1)))) break L51;
        facts.length = 0;
        changed = false;
        let _c56 = (v_n === (v_d === b.repeat ? b.times : 1));
        if (_c56) {
          let _q52 = true;
          Q53: {
            const _a54 = sp.lineCells[v_u];
            for (let _i55 = 0; _i55 < _a54.length; _i55++) {
              const v_c = _a54[_i55];
              if (!((b.has(v_c, v_d) && !(b.known(v_c))))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q52 = false;
                break Q53;
              }
            }
          }
          _c56 = _q52;
        }
        if (!(_c56)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ u: v_u, placed: v_placed, d: v_d, n: v_n }, facts)) return 1;
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
  const _a61 = sp.cols;
  for (let _i62 = 0; _i62 < _a61.length; _i62++) {
    const v_L = _a61[_i62];
    const _a63 = sp.lineCells[v_L];
    for (let _i64 = 0; _i64 < _a63.length; _i64++) {
      const v_c = _a63[_i64];
      if (!((!(b.known(v_c)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) < 2)))) continue;
      facts.length = 0;
      changed = false;
      let _c66 = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) === 1);
      if (_c66) {
        const _t65 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))));
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t65); changed = true; } else facts.push(PLACE, v_c, _t65); }
        _c66 = true;
      }
      if (!(_c66)) return -1;
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
  const _g106: number[] = [];
  const _g124: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  if (setCands.length < sp.cells.length) setCands = new Int32Array(sp.cells.length);
  const cands = setCands;
  cands.fill(-1);
  const _a96 = sp.units;
  for (let _i97 = 0; _i97 < _a96.length; _i97++) {
    const v_u = _a96[_i97];
    let _g98 = 0;
    G99: {
      const _a102 = sp.lineCells[v_u];
      for (let _i103 = 0; _i103 < _a102.length; _i103++) {
        const v_c = _a102[_i103];
        const _h104 = b.known(v_c);
        const _h105 = b.value(v_c);
        if (!((_h104 && ((_h105 === b.repeat ? b.times : 1) === 1)))) continue;
        _g98 |= 1 << _h105;
      }
    }
    const v_V = (b.domain & ~_g98);
    const _h118 = popcount(v_V);
    const _h123 = (_h118 - 2);
    _g106.length = 0;
    G107: {
      const _a110 = sp.lineCells[v_u];
      for (let _i111 = 0; _i111 < _a110.length; _i111++) {
        const v_c = _a110[_i111];
        const _h112 = b.known(v_c);
        if (!(!(_h112))) continue;
        _g106.push(v_c);
      }
    }
    const v_open = _g106;
    const _h117 = v_open.length;
    let _g113 = 0;
    G114: {
      for (let _m116 = v_V; _m116 !== 0; _m116 &= _m116 - 1) {
        const v_d = 31 - Math.clz32(_m116 & -_m116);
        if (!(((v_d === b.repeat ? b.times : 1) > 1))) continue;
        _g113 |= 1 << v_d;
      }
    }
    const v_R = _g113;
    const v_extra = (_h117 - _h118);
    const _e119 = valuesOf(v_V);
    for (let _k120 = 0; _k120 < 1 << _e119.length; _k120++) {
      let v_T = 0;
      for (let _j121 = 0; _j121 < _e119.length; _j121++) if ((_k120 >> (_e119.length - 1 - _j121)) & 1) v_T |= 1 << _e119[_j121];
      const _h122 = popcount(v_T);
      if (!(((_h122 === 0) || ((2 <= _h122) && (_h122 <= _h123))))) continue;
      const _h132 = popcount((v_R & ~v_T));
      const _h142 = (v_V & ~v_T);
      _g124.length = 0;
      G125: {
        const _a128 = v_open;
        for (let _i129 = 0; _i129 < _a128.length; _i129++) {
          const v_c = _a128[_i129];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) !== 0)))) continue;
          _g124.push(v_c);
        }
      }
      L130: {
        const v_S = _g124;
        const _h131 = v_S.length;
        if (!((_h131 >= ((_h118 - _h122) + (v_extra * _h132))))) break L130;
        facts.length = 0;
        changed = false;
        let _c137 = (_h122 > 0);
        if (!_c137) {
          let _q133 = true;
          Q134: {
            const _a135 = sp.lineCells[v_u];
            for (let _i136 = 0; _i136 < _a135.length; _i136++) {
              const v_c = _a135[_i136];
              if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) > 0))) {
                _q133 = false;
                break Q134;
              }
            }
          }
          _c137 = _q133;
        }
        let _c144 = (_c137 && (_h131 === ((_h118 - _h122) + (v_extra * _h132))));
        if (_c144) {
          let _q138 = true;
          Q139: {
            const _a140 = v_open;
            for (let _i141 = 0; _i141 < _a140.length; _i141++) {
              const v_c = _a140[_i141];
              if (!(!(v_S.includes(v_c)))) continue;
              for (let _m143 = _h142; _m143 !== 0; _m143 &= _m143 - 1) {
                const v_d = 31 - Math.clz32(_m143 & -_m143);
                if (!(b.has(v_c, v_d))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q138 = false;
                  break Q139;
                }
              }
            }
          }
          _c144 = _q138;
        }
        if (!(_c144)) return -1;
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

export function fish(b: Marks, sp: GridSpace, fire: Fire<FishBinding> | null): number {
  const _g227: number[] = [];
  const _g286: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  const _h256 = (sp.h - 1);
  const _h257 = rangeMask(0, _h256);
  for (let _m226 = b.domain; _m226 !== 0; _m226 &= _m226 - 1) {
    const v_d = 31 - Math.clz32(_m226 & -_m226);
    const v_k = (v_d === b.repeat ? b.times : 1);
    const _h248 = (v_k > 1);
    const _h271 = (v_k === 1);
    _g227.length = 0;
    G228: {
      const _a241 = sp.cols;
      for (let _i242 = 0; _i242 < _a241.length; _i242++) {
        const v_L = _a241[_i242];
        let _q243 = false;
        Q244: {
          const _a245 = sp.lineCells[v_L];
          for (let _i246 = 0; _i246 < _a245.length; _i246++) {
            const v_c = _a245[_i246];
            const _h247 = b.value(v_c);
            if ((_h247 === v_d)) {
              _q243 = true;
              break Q244;
            }
          }
        }
        let _c255 = !(_q243);
        if (!_c255) {
          let _c254 = _h248;
          if (_c254) {
            let _g249 = 0;
            G250: {
              const _a251 = sp.lineCells[v_L];
              for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                const v_c = _a251[_i252];
                const _h253 = b.value(v_c);
                if (!((_h253 === v_d))) continue;
                _g249++;
              }
            }
            _c254 = (_g249 < v_k);
          }
          _c255 = _c254;
        }
        if (!(_c255)) continue;
        _g227.push(v_L);
      }
    }
    const v_X0 = _g227;
    const _h284 = v_X0.length;
    const _h285 = (_h284 - 2);
    let _g258 = 0;
    G259: {
      const _a268 = sp.cells;
      for (let _i269 = 0; _i269 < _a268.length; _i269++) {
        const v_c = _a268[_i269];
        const _h270 = b.value(v_c);
        let _c278 = (_h270 === v_d);
        if (_c278) {
          let _c277 = _h271;
          if (!_c277) {
            let _g272 = 0;
            G273: {
              const _a274 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i275 = 0; _i275 < _a274.length; _i275++) {
                const v_p = _a274[_i275];
                const _h276 = b.value(v_p);
                if (!((_h276 === v_d))) continue;
                _g272++;
              }
            }
            _c277 = (_g272 >= v_k);
          }
          _c278 = _c277;
        }
        if (!(_c278)) continue;
        const _t279 = ((v_c / sp.w) | 0);
        _g258 |= 1 << _t279;
      }
    }
    const v_Y0 = (_h257 & ~_g258);
    const _e280 = valuesOf(v_Y0);
    for (let _k281 = 0; _k281 < 1 << _e280.length; _k281++) {
      let v_T = 0;
      for (let _j282 = 0; _j282 < _e280.length; _j282++) if ((_k281 >> (_e280.length - 1 - _j282)) & 1) v_T |= 1 << _e280[_j282];
      const _h283 = popcount(v_T);
      if (!(((_h283 === 0) || ((2 <= _h283) && (_h283 <= _h285))))) continue;
      const _h357 = (v_Y0 & ~v_T);
      _g286.length = 0;
      G287: {
        const _a294 = v_X0;
        for (let _i295 = 0; _i295 < _a294.length; _i295++) {
          const v_L = _a294[_i295];
          let _q296 = false;
          Q297: {
            const _a298 = sp.lineCells[v_L];
            for (let _i299 = 0; _i299 < _a298.length; _i299++) {
              const v_c = _a298[_i299];
              const _h300 = b.known(v_c);
              if ((((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d)) && (_h271 || !(_h300)))) {
                _q296 = true;
                break Q297;
              }
            }
          }
          if (!(!(_q296))) continue;
          _g286.push(v_L);
        }
      }
      L301: {
        const v_X = _g286;
        const _h302 = v_X.length;
        let _c321 = (_h271 && (_h302 >= (_h284 - _h283)));
        if (!_c321) {
          let _c320 = _h248;
          if (_c320) {
            let _g303 = 0;
            G304: {
              const _a305 = v_X;
              for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                const v_L = _a305[_i306];
                let _g307 = 0;
                G308: {
                  const _a309 = sp.lineCells[v_L];
                  for (let _i310 = 0; _i310 < _a309.length; _i310++) {
                    const v_c = _a309[_i310];
                    const _h311 = b.value(v_c);
                    if (!((_h311 === v_d))) continue;
                    _g307++;
                  }
                }
                _g303 += (v_k - _g307);
              }
            }
            let _g312 = 0;
            G313: {
              for (let _m314 = (v_Y0 & ~v_T); _m314 !== 0; _m314 &= _m314 - 1) {
                const v_r = 31 - Math.clz32(_m314 & -_m314);
                let _g315 = 0;
                G316: {
                  const _a317 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                  for (let _i318 = 0; _i318 < _a317.length; _i318++) {
                    const v_c = _a317[_i318];
                    const _h319 = b.value(v_c);
                    if (!((_h319 === v_d))) continue;
                    _g315++;
                  }
                }
                _g312 += (v_k - _g315);
              }
            }
            _c320 = (_g303 >= _g312);
          }
          _c321 = _c320;
        }
        if (!(_c321)) break L301;
        facts.length = 0;
        changed = false;
        let _c330 = (_h283 > 0);
        if (!_c330) {
          let _q322 = true;
          Q323: {
            const _a324 = sp.cols;
            for (let _i325 = 0; _i325 < _a324.length; _i325++) {
              const v_L = _a324[_i325];
              let _q326 = false;
              Q327: {
                const _a328 = sp.lineCells[v_L];
                for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                  const v_c = _a328[_i329];
                  if (b.has(v_c, v_d)) {
                    _q326 = true;
                    break Q327;
                  }
                }
              }
              if (!(_q326)) {
                _q322 = false;
                break Q323;
              }
            }
          }
          _c330 = _q322;
        }
        let _c350 = _c330;
        if (_c350) {
          let _c349 = (_h271 && (_h302 === (_h284 - _h283)));
          if (!_c349) {
            let _c348 = _h248;
            if (_c348) {
              let _g331 = 0;
              G332: {
                const _a333 = v_X;
                for (let _i334 = 0; _i334 < _a333.length; _i334++) {
                  const v_L = _a333[_i334];
                  let _g335 = 0;
                  G336: {
                    const _a337 = sp.lineCells[v_L];
                    for (let _i338 = 0; _i338 < _a337.length; _i338++) {
                      const v_c = _a337[_i338];
                      const _h339 = b.value(v_c);
                      if (!((_h339 === v_d))) continue;
                      _g335++;
                    }
                  }
                  _g331 += (v_k - _g335);
                }
              }
              let _g340 = 0;
              G341: {
                for (let _m342 = (v_Y0 & ~v_T); _m342 !== 0; _m342 &= _m342 - 1) {
                  const v_r = 31 - Math.clz32(_m342 & -_m342);
                  let _g343 = 0;
                  G344: {
                    const _a345 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                    for (let _i346 = 0; _i346 < _a345.length; _i346++) {
                      const v_c = _a345[_i346];
                      const _h347 = b.value(v_c);
                      if (!((_h347 === v_d))) continue;
                      _g343++;
                    }
                  }
                  _g340 += (v_k - _g343);
                }
              }
              _c348 = (_g331 === _g340);
            }
            _c349 = _c348;
          }
          _c350 = _c349;
        }
        let _c359 = _c350;
        if (_c359) {
          let _q351 = true;
          Q352: {
            const _a353 = minus(v_X0, v_X);
            for (let _i354 = 0; _i354 < _a353.length; _i354++) {
              const v_L = _a353[_i354];
              const _a355 = sp.lineCells[v_L];
              for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                const v_c = _a355[_i356];
                const _h358 = b.known(v_c);
                if (!((((((_h357 >> ((v_c / sp.w) | 0)) & 1) !== 0) && b.has(v_c, v_d)) && (_h271 || !(_h358))))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q351 = false;
                  break Q352;
                }
              }
            }
          }
          _c359 = _q351;
        }
        if (!(_c359)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, k: v_k, X0: v_X0, Y0: v_Y0, T: v_T, X: v_X }, facts)) return 1;
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
  const _g443: number[] = [];
  const _g453: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a406 = sp.cells;
  for (let _i407 = 0; _i407 < _a406.length; _i407++) {
    const v_m = _a406[_i407];
    const _h408 = b.known(v_m);
    if (!(!(_h408))) continue;
    for (let _m409 = b.domain; _m409 !== 0; _m409 &= _m409 - 1) {
      const v_x = 31 - Math.clz32(_m409 & -_m409);
      if (!(((v_x === b.repeat ? b.times : 1) === 1))) continue;
      L410: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cand(v_m))) & ~((1 << v_x)));
        const _h411 = popcount(v_R);
        let _c422 = (_h411 >= 1);
        if (_c422) {
          let _q412 = true;
          Q413: {
            for (let _m414 = v_R; _m414 !== 0; _m414 &= _m414 - 1) {
              const v_a = 31 - Math.clz32(_m414 & -_m414);
              const _h420 = ((1 << v_a) | (1 << v_x));
              let _c421 = ((v_a === b.repeat ? b.times : 1) === 1);
              if (_c421) {
                let _q415 = false;
                Q416: {
                  const _a417 = sp.peers[v_m];
                  for (let _i418 = 0; _i418 < _a417.length; _i418++) {
                    const v_k = _a417[_i418];
                    const _h419 = b.known(v_k);
                    if ((!(_h419) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h420))) {
                      _q415 = true;
                      break Q416;
                    }
                  }
                }
                _c421 = _q415;
              }
              if (!(_c421)) {
                _q412 = false;
                break Q413;
              }
            }
          }
          _c422 = _q412;
        }
        if (!(_c422)) break L410;
        const _a423 = sp.peers[v_m];
        for (let _i424 = 0; _i424 < _a423.length; _i424++) {
          const v_k0 = _a423[_i424];
          const _h425 = b.known(v_k0);
          let _c429 = !(_h425);
          if (_c429) {
            let _g426 = -1;
            G427: {
              for (let _m428 = v_R; _m428 !== 0; _m428 &= _m428 - 1) {
                const v_a = 31 - Math.clz32(_m428 & -_m428);
                if (_g426 === -1 || v_a < _g426) _g426 = v_a;
              }
            }
            _c429 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cand(v_k0))) === ((1 << _g426) | (1 << v_x)));
          }
          if (!(_c429)) continue;
          const _a430 = sp.peers[v_k0];
          for (let _i431 = 0; _i431 < _a430.length; _i431++) {
            const v_t = _a430[_i431];
            const _h432 = b.known(v_t);
            let _c442 = ((((v_t !== v_m) && !(_h432)) && b.has(v_t, v_x)) && (!b.has(v_m, v_x) || (sp.peers[v_m].includes(v_t))));
            if (_c442) {
              let _q433 = true;
              Q434: {
                for (let _m435 = v_R; _m435 !== 0; _m435 &= _m435 - 1) {
                  const v_a = 31 - Math.clz32(_m435 & -_m435);
                  const _h441 = ((1 << v_a) | (1 << v_x));
                  let _q436 = false;
                  Q437: {
                    const _a438 = sp.peers[v_m];
                    for (let _i439 = 0; _i439 < _a438.length; _i439++) {
                      const v_k = _a438[_i439];
                      const _h440 = b.known(v_k);
                      if ((((!(_h440) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h441)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q436 = true;
                        break Q437;
                      }
                    }
                  }
                  if (!(_q436)) {
                    _q433 = false;
                    break Q434;
                  }
                }
              }
              _c442 = _q433;
            }
            if (!(_c442)) continue;
            _g443.length = 0;
            G444: {
              for (let _m452 = v_R; _m452 !== 0; _m452 &= _m452 - 1) {
                const v_a = 31 - Math.clz32(_m452 & -_m452);
                const _h460 = ((1 << v_a) | (1 << v_x));
                _g453.length = 0;
                G454: {
                  const _a457 = sp.peers[v_m];
                  for (let _i458 = 0; _i458 < _a457.length; _i458++) {
                    const v_k = _a457[_i458];
                    const _h459 = b.known(v_k);
                    if (!((((!(_h459) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cand(v_k))) === _h460)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g453.push(v_k);
                  }
                }
                const _t461 = (_g453.length > 0 ? _g453[0] : -1);
                if (!_g443.includes(_t461)) _g443.push(_t461);
              }
            }
            const v_E = _g443;
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
