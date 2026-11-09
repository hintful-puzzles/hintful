// Compiled by `npm run describe` from src/engine/latin.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, cellsValued, least, minus, popcount, rangeMask, sameSet, stamps, valuesOf } from "./describe-runtime.ts";

export interface PlacedBinding {
  c: number;
  d: number;
  k: number;
  u: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _m1_0 = b.made[0];
  const _h5 = (b.grid[v_c] !== 0);
  const _h6 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const v_d = _h6;
  const v_k = (v_d === b.repeat ? b.times : 1);
  const _h9 = (v_k === 1);
  const _a7 = sp.unitsOf[v_c];
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_u = _a7[_i8];
    if (b.made[0] !== _m1_0) {
      if (!((v_d === (b.grid[v_c] || -1)))) { return placed(b, sp, v_c, fire) | fired; }
    }
    facts.length = 0;
    changed = false;
    let _c15: boolean = _h9;
    if (!_c15) {
      let _g10 = 0;
      G11: {
        const _a12 = sp.lineCells[v_u];
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_p = _a12[_i13];
          const _h14 = (b.grid[v_p] || -1);
          if (!((_h14 === v_d))) continue;
          _g10++;
        }
      }
      _c15 = (_g10 >= v_k);
    }
    let _c21: boolean = !(_c15);
    if (!_c21) {
      let _q16 = true;
      Q17: {
        const _a18 = sp.lineCells[v_u];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_p = _a18[_i19];
          const _h20 = (b.grid[v_p] || -1);
          if (!(((v_p !== v_c) && (_h9 || (_h20 !== v_d))))) continue;
          if ((((b.cands[v_p] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
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

/** Its dearest read grows with the board as n^0.5. */
export function hiddenSingle(b: Marks, sp: GridSpace, fire: Fire<HiddenSingleBinding> | null): number {
  const facts = hiddenSingleFacts;
  let fired = 0;
  let changed = false;
  const _a37 = sp.units;
  R1:
  for (let _i38 = 0; _i38 < _a37.length; _i38++) {
    const v_u = _a37[_i38];
    const _m25_0 = b.made[0];
    let _g39 = 0;
    G40: {
      const _a43 = sp.lineCells[v_u];
      for (let _i44 = 0; _i44 < _a43.length; _i44++) {
        const v_c = _a43[_i44];
        if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
        const _t45 = (b.grid[v_c] || -1);
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
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g47++;
        }
      }
      L51: {
        const v_n = _g47;
        if (!((v_n <= (v_d === b.repeat ? b.times : 1)))) break L51;
        if (b.made[0] !== _m25_0) {
          let _g52 = 0;
          G53: {
            const _a56 = sp.lineCells[v_u];
            for (let _i57 = 0; _i57 < _a56.length; _i57++) {
              const v_c = _a56[_i57];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t58 = (b.grid[v_c] || -1);
              _g52 |= 1 << _t58;
            }
          }
          if (!((v_placed === _g52))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c63: boolean = (v_n === (v_d === b.repeat ? b.times : 1));
        if (_c63) {
          let _q59 = true;
          Q60: {
            const _a61 = sp.lineCells[v_u];
            for (let _i62 = 0; _i62 < _a61.length; _i62++) {
              const v_c = _a61[_i62];
              if (!(((((b.cands[v_c] >> v_d) & 1) !== 0) && !((b.grid[v_c] !== 0))))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q59 = false;
                break Q60;
              }
            }
          }
          _c63 = _q59;
        }
        if (!(_c63)) return -1;
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

/** Its dearest read grows with the board as n. */
export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding> | null): number {
  const facts = singleFacts;
  let fired = 0;
  let changed = false;
  if (singleCands.length < sp.cells.length) singleCands = new Int32Array(sp.cells.length);
  const cands = singleCands;
  cands.fill(-1);
  const _a68 = sp.cols;
  for (let _i69 = 0; _i69 < _a68.length; _i69++) {
    const v_L = _a68[_i69];
    const _a70 = sp.lineCells[v_L];
    for (let _i71 = 0; _i71 < _a70.length; _i71++) {
      const v_c = _a70[_i71];
      if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
      facts.length = 0;
      changed = false;
      let _c73: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
      if (_c73) {
        const _t72 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t72); changed = true; } else facts.push(PLACE, v_c, _t72); }
        _c73 = true;
      }
      if (!(_c73)) return -1;
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

/** Its dearest read grows with the board as n^0.5. */
export function set(b: Marks, sp: GridSpace, fire: Fire<SetBinding> | null): number {
  const _g113: number[] = [];
  const _g131: number[] = [];
  const _g147: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  if (setCands.length < sp.cells.length) setCands = new Int32Array(sp.cells.length);
  const cands = setCands;
  cands.fill(-1);
  const _a103 = sp.units;
  R1:
  for (let _i104 = 0; _i104 < _a103.length; _i104++) {
    const v_u = _a103[_i104];
    const _m63_0 = b.made[0];
    let _g105 = 0;
    G106: {
      const _a109 = sp.lineCells[v_u];
      for (let _i110 = 0; _i110 < _a109.length; _i110++) {
        const v_c = _a109[_i110];
        const _h111 = (b.grid[v_c] !== 0);
        const _h112 = (b.grid[v_c] || -1);
        if (!((_h111 && ((_h112 === b.repeat ? b.times : 1) === 1)))) continue;
        _g105 |= 1 << _h112;
      }
    }
    const v_V = (b.domain & ~_g105);
    const _h125 = popcount(v_V);
    const _h130 = (_h125 - 2);
    _g113.length = 0;
    G114: {
      const _a117 = sp.lineCells[v_u];
      for (let _i118 = 0; _i118 < _a117.length; _i118++) {
        const v_c = _a117[_i118];
        const _h119 = (b.grid[v_c] !== 0);
        if (!(!(_h119))) continue;
        _g113.push(v_c);
      }
    }
    const v_open = _g113;
    const _h124 = v_open.length;
    let _g120 = 0;
    G121: {
      for (let _m123 = v_V; _m123 !== 0; _m123 &= _m123 - 1) {
        const v_d = 31 - Math.clz32(_m123 & -_m123);
        if (!(((v_d === b.repeat ? b.times : 1) > 1))) continue;
        _g120 |= 1 << v_d;
      }
    }
    const v_R = _g120;
    const v_extra = (_h124 - _h125);
    const _e126 = valuesOf(v_V);
    for (let _k127 = 0; _k127 < 1 << _e126.length; _k127++) {
      let v_T = 0;
      for (let _j128 = 0; _j128 < _e126.length; _j128++) if ((_k127 >> (_e126.length - 1 - _j128)) & 1) v_T |= 1 << _e126[_j128];
      const _h129 = popcount(v_T);
      if (!(((_h129 === 0) || ((2 <= _h129) && (_h129 <= _h130))))) continue;
      const _h139 = popcount((v_R & ~v_T));
      const _h162 = (v_V & ~v_T);
      _g131.length = 0;
      G132: {
        const _a135 = v_open;
        for (let _i136 = 0; _i136 < _a135.length; _i136++) {
          const v_c = _a135[_i136];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) !== 0)))) continue;
          _g131.push(v_c);
        }
      }
      L137: {
        const v_S = _g131;
        const _h138 = v_S.length;
        if (!((_h138 >= ((_h125 - _h129) + (v_extra * _h139))))) break L137;
        if (b.made[0] !== _m63_0) {
          let _g140 = 0;
          G141: {
            const _a144 = sp.lineCells[v_u];
            for (let _i145 = 0; _i145 < _a144.length; _i145++) {
              const v_c = _a144[_i145];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t146 = (b.grid[v_c] || -1);
              _g140 |= 1 << _t146;
            }
          }
          if (!((v_V === (b.domain & ~_g140)))) { continue R1; }
          _g147.length = 0;
          G148: {
            const _a151 = sp.lineCells[v_u];
            for (let _i152 = 0; _i152 < _a151.length; _i152++) {
              const v_c = _a151[_i152];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g147.push(v_c);
            }
          }
          if (!(sameSet(v_open, _g147))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c157: boolean = (_h129 > 0);
        if (!_c157) {
          let _q153 = true;
          Q154: {
            const _a155 = sp.lineCells[v_u];
            for (let _i156 = 0; _i156 < _a155.length; _i156++) {
              const v_c = _a155[_i156];
              if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) > 0))) {
                _q153 = false;
                break Q154;
              }
            }
          }
          _c157 = _q153;
        }
        let _c164: boolean = (_c157 && (_h138 === ((_h125 - _h129) + (v_extra * _h139))));
        if (_c164) {
          let _q158 = true;
          Q159: {
            const _a160 = v_open;
            for (let _i161 = 0; _i161 < _a160.length; _i161++) {
              const v_c = _a160[_i161];
              if (!(!(v_S.includes(v_c)))) continue;
              for (let _m163 = _h162; _m163 !== 0; _m163 &= _m163 - 1) {
                const v_d = 31 - Math.clz32(_m163 & -_m163);
                if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q158 = false;
                  break Q159;
                }
              }
            }
          }
          _c164 = _q158;
        }
        if (!(_c164)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ u: v_u, V: v_V, open: v_open.slice(), R: v_R, extra: v_extra, T: v_T, S: v_S.slice() }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function fish(b: Marks, sp: GridSpace, fire: Fire<FishBinding> | null): number {
  const _g247: number[] = [];
  const _g306: number[] = [];
  const _g342: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  const _h276 = (sp.h - 1);
  const _h277 = rangeMask(0, _h276);
  R1:
  for (let _m246 = b.domain; _m246 !== 0; _m246 &= _m246 - 1) {
    const v_d = 31 - Math.clz32(_m246 & -_m246);
    const v_k = (v_d === b.repeat ? b.times : 1);
    const _h268 = (v_k > 1);
    const _h291 = (v_k === 1);
    const _m108_0 = b.made[0];
    _g247.length = 0;
    G248: {
      const _a261 = sp.cols;
      for (let _i262 = 0; _i262 < _a261.length; _i262++) {
        const v_L = _a261[_i262];
        let _q263 = false;
        Q264: {
          const _a265 = sp.lineCells[v_L];
          for (let _i266 = 0; _i266 < _a265.length; _i266++) {
            const v_c = _a265[_i266];
            const _h267 = (b.grid[v_c] || -1);
            if ((_h267 === v_d)) {
              _q263 = true;
              break Q264;
            }
          }
        }
        let _c275: boolean = !(_q263);
        if (!_c275) {
          let _c274: boolean = _h268;
          if (_c274) {
            let _g269 = 0;
            G270: {
              const _a271 = sp.lineCells[v_L];
              for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                const v_c = _a271[_i272];
                const _h273 = (b.grid[v_c] || -1);
                if (!((_h273 === v_d))) continue;
                _g269++;
              }
            }
            _c274 = (_g269 < v_k);
          }
          _c275 = _c274;
        }
        if (!(_c275)) continue;
        _g247.push(v_L);
      }
    }
    const v_X0 = _g247;
    const _h304 = v_X0.length;
    const _h305 = (_h304 - 2);
    const _m116_1 = b.made[1];
    let _g278 = 0;
    G279: {
      const _a288 = cellsValued(b, sp.cells, v_d);
      for (let _i289 = 0; _i289 < _a288.length; _i289++) {
        const v_c = _a288[_i289];
        const _h290 = (b.grid[v_c] || -1);
        let _c298: boolean = (_h290 === v_d);
        if (_c298) {
          let _c297: boolean = _h291;
          if (!_c297) {
            let _g292 = 0;
            G293: {
              const _a294 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i295 = 0; _i295 < _a294.length; _i295++) {
                const v_p = _a294[_i295];
                const _h296 = (b.grid[v_p] || -1);
                if (!((_h296 === v_d))) continue;
                _g292++;
              }
            }
            _c297 = (_g292 >= v_k);
          }
          _c298 = _c297;
        }
        if (!(_c298)) continue;
        const _t299 = ((v_c / sp.w) | 0);
        _g278 |= 1 << _t299;
      }
    }
    const v_Y0 = (_h277 & ~_g278);
    const _e300 = valuesOf(v_Y0);
    for (let _k301 = 0; _k301 < 1 << _e300.length; _k301++) {
      let v_T = 0;
      for (let _j302 = 0; _j302 < _e300.length; _j302++) if ((_k301 >> (_e300.length - 1 - _j302)) & 1) v_T |= 1 << _e300[_j302];
      const _h303 = popcount(v_T);
      if (!(((_h303 === 0) || ((2 <= _h303) && (_h303 <= _h305))))) continue;
      const _h422 = (v_Y0 & ~v_T);
      _g306.length = 0;
      G307: {
        const _a314 = v_X0;
        for (let _i315 = 0; _i315 < _a314.length; _i315++) {
          const v_L = _a314[_i315];
          let _q316 = false;
          Q317: {
            const _a318 = sp.lineCells[v_L];
            for (let _i319 = 0; _i319 < _a318.length; _i319++) {
              const v_c = _a318[_i319];
              const _h320 = (b.grid[v_c] !== 0);
              if ((((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h291 || !(_h320)))) {
                _q316 = true;
                break Q317;
              }
            }
          }
          if (!(!(_q316))) continue;
          _g306.push(v_L);
        }
      }
      L321: {
        const v_X = _g306;
        const _h322 = v_X.length;
        let _c341: boolean = (_h291 && (_h322 >= (_h304 - _h303)));
        if (!_c341) {
          let _c340: boolean = _h268;
          if (_c340) {
            let _g323 = 0;
            G324: {
              const _a325 = v_X;
              for (let _i326 = 0; _i326 < _a325.length; _i326++) {
                const v_L = _a325[_i326];
                let _g327 = 0;
                G328: {
                  const _a329 = sp.lineCells[v_L];
                  for (let _i330 = 0; _i330 < _a329.length; _i330++) {
                    const v_c = _a329[_i330];
                    const _h331 = (b.grid[v_c] || -1);
                    if (!((_h331 === v_d))) continue;
                    _g327++;
                  }
                }
                _g323 += (v_k - _g327);
              }
            }
            let _g332 = 0;
            G333: {
              for (let _m334 = (v_Y0 & ~v_T); _m334 !== 0; _m334 &= _m334 - 1) {
                const v_r = 31 - Math.clz32(_m334 & -_m334);
                let _g335 = 0;
                G336: {
                  const _a337 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                  for (let _i338 = 0; _i338 < _a337.length; _i338++) {
                    const v_c = _a337[_i338];
                    const _h339 = (b.grid[v_c] || -1);
                    if (!((_h339 === v_d))) continue;
                    _g335++;
                  }
                }
                _g332 += (v_k - _g335);
              }
            }
            _c340 = (_g323 >= _g332);
          }
          _c341 = _c340;
        }
        if (!(_c341)) break L321;
        if (b.made[0] !== _m108_0 || b.made[1] !== _m116_1) {
          _g342.length = 0;
          G343: {
            const _a356 = sp.cols;
            for (let _i357 = 0; _i357 < _a356.length; _i357++) {
              const v_L = _a356[_i357];
              let _q358 = false;
              Q359: {
                const _a360 = sp.lineCells[v_L];
                for (let _i361 = 0; _i361 < _a360.length; _i361++) {
                  const v_c = _a360[_i361];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q358 = true;
                    break Q359;
                  }
                }
              }
              let _c367: boolean = !(_q358);
              if (!_c367) {
                let _c366: boolean = (v_k > 1);
                if (_c366) {
                  let _g362 = 0;
                  G363: {
                    const _a364 = sp.lineCells[v_L];
                    for (let _i365 = 0; _i365 < _a364.length; _i365++) {
                      const v_c = _a364[_i365];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g362++;
                    }
                  }
                  _c366 = (_g362 < v_k);
                }
                _c367 = _c366;
              }
              if (!(_c367)) continue;
              _g342.push(v_L);
            }
          }
          if (!(sameSet(v_X0, _g342))) { continue R1; }
          let _g368 = 0;
          G369: {
            const _a378 = cellsValued(b, sp.cells, v_d);
            for (let _i379 = 0; _i379 < _a378.length; _i379++) {
              const v_c = _a378[_i379];
              let _c385: boolean = ((b.grid[v_c] || -1) === v_d);
              if (_c385) {
                let _c384: boolean = (v_k === 1);
                if (!_c384) {
                  let _g380 = 0;
                  G381: {
                    const _a382 = sp.lineCells[sp.rowOf[v_c]];
                    for (let _i383 = 0; _i383 < _a382.length; _i383++) {
                      const v_p = _a382[_i383];
                      if (!(((b.grid[v_p] || -1) === v_d))) continue;
                      _g380++;
                    }
                  }
                  _c384 = (_g380 >= v_k);
                }
                _c385 = _c384;
              }
              if (!(_c385)) continue;
              const _t386 = ((v_c / sp.w) | 0);
              _g368 |= 1 << _t386;
            }
          }
          if (!((v_Y0 === (rangeMask(0, (sp.h - 1)) & ~_g368)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c395: boolean = (_h303 > 0);
        if (!_c395) {
          let _q387 = true;
          Q388: {
            const _a389 = sp.cols;
            for (let _i390 = 0; _i390 < _a389.length; _i390++) {
              const v_L = _a389[_i390];
              let _q391 = false;
              Q392: {
                const _a393 = sp.lineCells[v_L];
                for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                  const v_c = _a393[_i394];
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                    _q391 = true;
                    break Q392;
                  }
                }
              }
              if (!(_q391)) {
                _q387 = false;
                break Q388;
              }
            }
          }
          _c395 = _q387;
        }
        let _c415: boolean = _c395;
        if (_c415) {
          let _c414: boolean = (_h291 && (_h322 === (_h304 - _h303)));
          if (!_c414) {
            let _c413: boolean = _h268;
            if (_c413) {
              let _g396 = 0;
              G397: {
                const _a398 = v_X;
                for (let _i399 = 0; _i399 < _a398.length; _i399++) {
                  const v_L = _a398[_i399];
                  let _g400 = 0;
                  G401: {
                    const _a402 = sp.lineCells[v_L];
                    for (let _i403 = 0; _i403 < _a402.length; _i403++) {
                      const v_c = _a402[_i403];
                      const _h404 = (b.grid[v_c] || -1);
                      if (!((_h404 === v_d))) continue;
                      _g400++;
                    }
                  }
                  _g396 += (v_k - _g400);
                }
              }
              let _g405 = 0;
              G406: {
                for (let _m407 = (v_Y0 & ~v_T); _m407 !== 0; _m407 &= _m407 - 1) {
                  const v_r = 31 - Math.clz32(_m407 & -_m407);
                  let _g408 = 0;
                  G409: {
                    const _a410 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                    for (let _i411 = 0; _i411 < _a410.length; _i411++) {
                      const v_c = _a410[_i411];
                      const _h412 = (b.grid[v_c] || -1);
                      if (!((_h412 === v_d))) continue;
                      _g408++;
                    }
                  }
                  _g405 += (v_k - _g408);
                }
              }
              _c413 = (_g396 === _g405);
            }
            _c414 = _c413;
          }
          _c415 = _c414;
        }
        let _c424: boolean = _c415;
        if (_c424) {
          let _q416 = true;
          Q417: {
            const _a418 = minus(v_X0, v_X);
            for (let _i419 = 0; _i419 < _a418.length; _i419++) {
              const v_L = _a418[_i419];
              const _a420 = sp.lineCells[v_L];
              for (let _i421 = 0; _i421 < _a420.length; _i421++) {
                const v_c = _a420[_i421];
                const _h423 = (b.grid[v_c] !== 0);
                if (!((((((_h422 >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h291 || !(_h423))))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q416 = false;
                  break Q417;
                }
              }
            }
          }
          _c424 = _q416;
        }
        if (!(_c424)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, k: v_k, X0: v_X0.slice(), Y0: v_Y0, T: v_T, X: v_X.slice() }, facts)) return 1;
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
const _st517 = stamps();

/** Its dearest read grows with the board as n. */
export function wing(b: Marks, sp: GridSpace, fire: Fire<WingBinding> | null): number {
  const _g508: number[] = [];
  const _g519: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a471 = sp.cells;
  R1:
  for (let _i472 = 0; _i472 < _a471.length; _i472++) {
    const v_m = _a471[_i472];
    const _m158_0 = b.made[0];
    const _h473 = (b.grid[v_m] !== 0);
    if (!(!(_h473))) continue;
    R2:
    for (let _m474 = b.domain; _m474 !== 0; _m474 &= _m474 - 1) {
      const v_x = 31 - Math.clz32(_m474 & -_m474);
      if (!(((v_x === b.repeat ? b.times : 1) === 1))) continue;
      const _m165_1 = b.made[1];
      L475: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)));
        const _h476 = popcount(v_R);
        let _c487: boolean = (_h476 >= 1);
        if (_c487) {
          let _q477 = true;
          Q478: {
            for (let _m479 = v_R; _m479 !== 0; _m479 &= _m479 - 1) {
              const v_a = 31 - Math.clz32(_m479 & -_m479);
              const _h485 = ((1 << v_a) | (1 << v_x));
              let _c486: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
              if (_c486) {
                let _q480 = false;
                Q481: {
                  const _a482 = sp.peers[v_m];
                  for (let _i483 = 0; _i483 < _a482.length; _i483++) {
                    const v_k = _a482[_i483];
                    const _h484 = (b.grid[v_k] !== 0);
                    if ((!(_h484) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h485))) {
                      _q480 = true;
                      break Q481;
                    }
                  }
                }
                _c486 = _q480;
              }
              if (!(_c486)) {
                _q477 = false;
                break Q478;
              }
            }
          }
          _c487 = _q477;
        }
        if (!(_c487)) break L475;
        const _a488 = sp.peers[v_m];
        R3:
        for (let _i489 = 0; _i489 < _a488.length; _i489++) {
          const v_k0 = _a488[_i489];
          const _h490 = (b.grid[v_k0] !== 0);
          let _c494: boolean = !(_h490);
          if (_c494) {
            let _g491 = -1;
            G492: {
              for (let _m493 = v_R; _m493 !== 0; _m493 &= _m493 - 1) {
                const v_a = 31 - Math.clz32(_m493 & -_m493);
                if (_g491 === -1 || v_a < _g491) _g491 = v_a;
              }
            }
            _c494 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g491) | (1 << v_x)));
          }
          if (!(_c494)) continue;
          const _a495 = sp.peers[v_k0];
          for (let _i496 = 0; _i496 < _a495.length; _i496++) {
            const v_t = _a495[_i496];
            const _h497 = (b.grid[v_t] !== 0);
            let _c507: boolean = ((((v_t !== v_m) && !(_h497)) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (sp.peers[v_m].includes(v_t))));
            if (_c507) {
              let _q498 = true;
              Q499: {
                for (let _m500 = v_R; _m500 !== 0; _m500 &= _m500 - 1) {
                  const v_a = 31 - Math.clz32(_m500 & -_m500);
                  const _h506 = ((1 << v_a) | (1 << v_x));
                  let _q501 = false;
                  Q502: {
                    const _a503 = sp.peers[v_m];
                    for (let _i504 = 0; _i504 < _a503.length; _i504++) {
                      const v_k = _a503[_i504];
                      const _h505 = (b.grid[v_k] !== 0);
                      if ((((!(_h505) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h506)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q501 = true;
                        break Q502;
                      }
                    }
                  }
                  if (!(_q501)) {
                    _q498 = false;
                    break Q499;
                  }
                }
              }
              _c507 = _q498;
            }
            if (!(_c507)) continue;
            _g508.length = 0;
            _st517.pass++;
            G509: {
              for (let _m518 = v_R; _m518 !== 0; _m518 &= _m518 - 1) {
                const v_a = 31 - Math.clz32(_m518 & -_m518);
                const _h526 = ((1 << v_a) | (1 << v_x));
                _g519.length = 0;
                G520: {
                  const _a523 = sp.peers[v_m];
                  for (let _i524 = 0; _i524 < _a523.length; _i524++) {
                    const v_k = _a523[_i524];
                    const _h525 = (b.grid[v_k] !== 0);
                    if (!((((!(_h525) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h526)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g519.push(v_k);
                  }
                }
                const _t527 = (_g519.length > 0 ? _g519[0] : -1);
                const _t528 = _t527;
                if (_g508.length < 16) { if (!_g508.includes(_t528)) _g508.push(_t528); } else addOnce(_g508, _st517, _t528);
              }
            }
            const v_E = _g508;
            if (b.made[0] !== _m158_0 || b.made[1] !== _m165_1) {
              if (!(!((b.grid[v_m] !== 0)))) { continue R1; }
              if (!((v_R === ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)))))) { continue R2; }
              let _c537: boolean = (popcount(v_R) >= 1);
              if (_c537) {
                let _q529 = true;
                Q530: {
                  for (let _m531 = v_R; _m531 !== 0; _m531 &= _m531 - 1) {
                    const v_a = 31 - Math.clz32(_m531 & -_m531);
                    let _c536: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
                    if (_c536) {
                      let _q532 = false;
                      Q533: {
                        const _a534 = sp.peers[v_m];
                        for (let _i535 = 0; _i535 < _a534.length; _i535++) {
                          const v_k = _a534[_i535];
                          if ((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x))))) {
                            _q532 = true;
                            break Q533;
                          }
                        }
                      }
                      _c536 = _q532;
                    }
                    if (!(_c536)) {
                      _q529 = false;
                      break Q530;
                    }
                  }
                }
                _c537 = _q529;
              }
              if (!(_c537)) { continue R2; }
              let _c541: boolean = !((b.grid[v_k0] !== 0));
              if (_c541) {
                let _g538 = -1;
                G539: {
                  for (let _m540 = v_R; _m540 !== 0; _m540 &= _m540 - 1) {
                    const v_a = 31 - Math.clz32(_m540 & -_m540);
                    if (_g538 === -1 || v_a < _g538) _g538 = v_a;
                  }
                }
                _c541 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g538) | (1 << v_x)));
              }
              if (!(_c541)) { continue R3; }
            }
            facts.length = 0;
            changed = false;
            if ((((b.cands[v_t] >> v_x) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_x); changed = true; } else facts.push(STRIKE, v_t, v_x); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ m: v_m, x: v_x, R: v_R, k0: v_k0, t: v_t, E: v_E.slice() }, facts)) return 1;
              cands.fill(-1);
            }
          }
        }
      }
    }
  }
  return fired;
}
