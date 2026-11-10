// Compiled by `npm run describe` from src/engine/latin.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, cellsValued, freshBinding, least, minus, popcount, rangeMask, sameSet, staleChecking, stamps, valuesOf } from "./describe-runtime.ts";

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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("placed", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (v_d === (b.grid[v_c] || -1)), (v_k === (v_d === b.repeat ? b.times : 1)), (sp.unitsOf[v_c].includes(v_u))], ["c in", "where of c", "d =", "k =", "u in"]);
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
        if (import.meta.env.DEV && staleChecking) {
          let _g59 = 0;
          G60: {
            const _a63 = sp.lineCells[v_u];
            for (let _i64 = 0; _i64 < _a63.length; _i64++) {
              const v_c = _a63[_i64];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t65 = (b.grid[v_c] || -1);
              _g59 |= 1 << _t65;
            }
          }
          let _g66 = 0;
          G67: {
            const _a68 = sp.lineCells[v_u];
            for (let _i69 = 0; _i69 < _a68.length; _i69++) {
              const v_c = _a68[_i69];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              _g66++;
            }
          }
          freshBinding("hiddenSingle", [(sp.units.includes(v_u)), (v_placed === _g59), ((((b.domain & ~v_placed) >> v_d) & 1) !== 0), (v_n === _g66), (v_n <= (v_d === b.repeat ? b.times : 1))], ["u in", "placed =", "d in", "n =", "where of n"]);
        }
        facts.length = 0;
        changed = false;
        let _c74: boolean = (v_n === (v_d === b.repeat ? b.times : 1));
        if (_c74) {
          let _q70 = true;
          Q71: {
            const _a72 = sp.lineCells[v_u];
            for (let _i73 = 0; _i73 < _a72.length; _i73++) {
              const v_c = _a72[_i73];
              if (!(((((b.cands[v_c] >> v_d) & 1) !== 0) && !((b.grid[v_c] !== 0))))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q70 = false;
                break Q71;
              }
            }
          }
          _c74 = _q70;
        }
        if (!(_c74)) return -1;
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
  const _a79 = sp.cols;
  for (let _i80 = 0; _i80 < _a79.length; _i80++) {
    const v_L = _a79[_i80];
    const _a81 = sp.lineCells[v_L];
    for (let _i82 = 0; _i82 < _a81.length; _i82++) {
      const v_c = _a81[_i82];
      if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("single", [(sp.cols.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["L in", "c in", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      let _c84: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
      if (_c84) {
        const _t83 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t83); changed = true; } else facts.push(PLACE, v_c, _t83); }
        _c84 = true;
      }
      if (!(_c84)) return -1;
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
  const _g124: number[] = [];
  const _g142: number[] = [];
  const _g158: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  if (setCands.length < sp.cells.length) setCands = new Int32Array(sp.cells.length);
  const cands = setCands;
  cands.fill(-1);
  const _a114 = sp.units;
  R1:
  for (let _i115 = 0; _i115 < _a114.length; _i115++) {
    const v_u = _a114[_i115];
    const _m63_0 = b.made[0];
    let _g116 = 0;
    G117: {
      const _a120 = sp.lineCells[v_u];
      for (let _i121 = 0; _i121 < _a120.length; _i121++) {
        const v_c = _a120[_i121];
        const _h122 = (b.grid[v_c] !== 0);
        const _h123 = (b.grid[v_c] || -1);
        if (!((_h122 && ((_h123 === b.repeat ? b.times : 1) === 1)))) continue;
        _g116 |= 1 << _h123;
      }
    }
    const v_V = (b.domain & ~_g116);
    const _h136 = popcount(v_V);
    const _h141 = (_h136 - 2);
    _g124.length = 0;
    G125: {
      const _a128 = sp.lineCells[v_u];
      for (let _i129 = 0; _i129 < _a128.length; _i129++) {
        const v_c = _a128[_i129];
        const _h130 = (b.grid[v_c] !== 0);
        if (!(!(_h130))) continue;
        _g124.push(v_c);
      }
    }
    const v_open = _g124;
    const _h135 = v_open.length;
    let _g131 = 0;
    G132: {
      for (let _m134 = v_V; _m134 !== 0; _m134 &= _m134 - 1) {
        const v_d = 31 - Math.clz32(_m134 & -_m134);
        if (!(((v_d === b.repeat ? b.times : 1) > 1))) continue;
        _g131 |= 1 << v_d;
      }
    }
    const v_R = _g131;
    const v_extra = (_h135 - _h136);
    const _e137 = valuesOf(v_V);
    for (let _k138 = 0; _k138 < 1 << _e137.length; _k138++) {
      let v_T = 0;
      for (let _j139 = 0; _j139 < _e137.length; _j139++) if ((_k138 >> (_e137.length - 1 - _j139)) & 1) v_T |= 1 << _e137[_j139];
      const _h140 = popcount(v_T);
      if (!(((_h140 === 0) || ((2 <= _h140) && (_h140 <= _h141))))) continue;
      const _h150 = popcount((v_R & ~v_T));
      const _h196 = (v_V & ~v_T);
      _g142.length = 0;
      G143: {
        const _a146 = v_open;
        for (let _i147 = 0; _i147 < _a146.length; _i147++) {
          const v_c = _a146[_i147];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) !== 0)))) continue;
          _g142.push(v_c);
        }
      }
      L148: {
        const v_S = _g142;
        const _h149 = v_S.length;
        if (!((_h149 >= ((_h136 - _h140) + (v_extra * _h150))))) break L148;
        if (b.made[0] !== _m63_0) {
          let _g151 = 0;
          G152: {
            const _a155 = sp.lineCells[v_u];
            for (let _i156 = 0; _i156 < _a155.length; _i156++) {
              const v_c = _a155[_i156];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t157 = (b.grid[v_c] || -1);
              _g151 |= 1 << _t157;
            }
          }
          if (!((v_V === (b.domain & ~_g151)))) { continue R1; }
          _g158.length = 0;
          G159: {
            const _a162 = sp.lineCells[v_u];
            for (let _i163 = 0; _i163 < _a162.length; _i163++) {
              const v_c = _a162[_i163];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g158.push(v_c);
            }
          }
          if (!(sameSet(v_open, _g158))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _g164 = 0;
          G165: {
            const _a168 = sp.lineCells[v_u];
            for (let _i169 = 0; _i169 < _a168.length; _i169++) {
              const v_c = _a168[_i169];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t170 = (b.grid[v_c] || -1);
              _g164 |= 1 << _t170;
            }
          }
          const _g171: number[] = [];
          G172: {
            const _a175 = sp.lineCells[v_u];
            for (let _i176 = 0; _i176 < _a175.length; _i176++) {
              const v_c = _a175[_i176];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g171.push(v_c);
            }
          }
          let _g177 = 0;
          G178: {
            for (let _m180 = v_V; _m180 !== 0; _m180 &= _m180 - 1) {
              const v_d = 31 - Math.clz32(_m180 & -_m180);
              if (!(((v_d === b.repeat ? b.times : 1) > 1))) continue;
              _g177 |= 1 << v_d;
            }
          }
          const _g181: number[] = [];
          G182: {
            const _a185 = v_open;
            for (let _i186 = 0; _i186 < _a185.length; _i186++) {
              const v_c = _a185[_i186];
              if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) !== 0)))) continue;
              _g181.push(v_c);
            }
          }
          freshBinding("set", [(sp.units.includes(v_u)), (v_V === (b.domain & ~_g164)), sameSet(v_open, _g171), (v_R === _g177), (v_extra === (v_open.length - popcount(v_V))), ((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (popcount(v_V) - 2)))), sameSet(v_S, _g181), (v_S.length >= ((popcount(v_V) - popcount(v_T)) + (v_extra * popcount((v_R & ~v_T)))))], ["u in", "V =", "open =", "R =", "extra =", "where of T", "S =", "where of S"]);
        }
        facts.length = 0;
        changed = false;
        let _c191: boolean = (_h140 > 0);
        if (!_c191) {
          let _q187 = true;
          Q188: {
            const _a189 = sp.lineCells[v_u];
            for (let _i190 = 0; _i190 < _a189.length; _i190++) {
              const v_c = _a189[_i190];
              if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) > 0))) {
                _q187 = false;
                break Q188;
              }
            }
          }
          _c191 = _q187;
        }
        let _c198: boolean = (_c191 && (_h149 === ((_h136 - _h140) + (v_extra * _h150))));
        if (_c198) {
          let _q192 = true;
          Q193: {
            const _a194 = v_open;
            for (let _i195 = 0; _i195 < _a194.length; _i195++) {
              const v_c = _a194[_i195];
              if (!(!(v_S.includes(v_c)))) continue;
              for (let _m197 = _h196; _m197 !== 0; _m197 &= _m197 - 1) {
                const v_d = 31 - Math.clz32(_m197 & -_m197);
                if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q192 = false;
                  break Q193;
                }
              }
            }
          }
          _c198 = _q192;
        }
        if (!(_c198)) return -1;
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
  const _g281: number[] = [];
  const _g340: number[] = [];
  const _g376: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  const _h310 = (sp.h - 1);
  const _h311 = rangeMask(0, _h310);
  R1:
  for (let _m280 = b.domain; _m280 !== 0; _m280 &= _m280 - 1) {
    const v_d = 31 - Math.clz32(_m280 & -_m280);
    const v_k = (v_d === b.repeat ? b.times : 1);
    const _h302 = (v_k > 1);
    const _h325 = (v_k === 1);
    const _m108_0 = b.made[0];
    _g281.length = 0;
    G282: {
      const _a295 = sp.cols;
      for (let _i296 = 0; _i296 < _a295.length; _i296++) {
        const v_L = _a295[_i296];
        let _q297 = false;
        Q298: {
          const _a299 = sp.lineCells[v_L];
          for (let _i300 = 0; _i300 < _a299.length; _i300++) {
            const v_c = _a299[_i300];
            const _h301 = (b.grid[v_c] || -1);
            if ((_h301 === v_d)) {
              _q297 = true;
              break Q298;
            }
          }
        }
        let _c309: boolean = !(_q297);
        if (!_c309) {
          let _c308: boolean = _h302;
          if (_c308) {
            let _g303 = 0;
            G304: {
              const _a305 = sp.lineCells[v_L];
              for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                const v_c = _a305[_i306];
                const _h307 = (b.grid[v_c] || -1);
                if (!((_h307 === v_d))) continue;
                _g303++;
              }
            }
            _c308 = (_g303 < v_k);
          }
          _c309 = _c308;
        }
        if (!(_c309)) continue;
        _g281.push(v_L);
      }
    }
    const v_X0 = _g281;
    const _h338 = v_X0.length;
    const _h339 = (_h338 - 2);
    const _m116_1 = b.made[1];
    let _g312 = 0;
    G313: {
      const _a322 = cellsValued(b, sp.cells, v_d);
      for (let _i323 = 0; _i323 < _a322.length; _i323++) {
        const v_c = _a322[_i323];
        const _h324 = (b.grid[v_c] || -1);
        let _c332: boolean = (_h324 === v_d);
        if (_c332) {
          let _c331: boolean = _h325;
          if (!_c331) {
            let _g326 = 0;
            G327: {
              const _a328 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                const v_p = _a328[_i329];
                const _h330 = (b.grid[v_p] || -1);
                if (!((_h330 === v_d))) continue;
                _g326++;
              }
            }
            _c331 = (_g326 >= v_k);
          }
          _c332 = _c331;
        }
        if (!(_c332)) continue;
        const _t333 = ((v_c / sp.w) | 0);
        _g312 |= 1 << _t333;
      }
    }
    const v_Y0 = (_h311 & ~_g312);
    const _e334 = valuesOf(v_Y0);
    for (let _k335 = 0; _k335 < 1 << _e334.length; _k335++) {
      let v_T = 0;
      for (let _j336 = 0; _j336 < _e334.length; _j336++) if ((_k335 >> (_e334.length - 1 - _j336)) & 1) v_T |= 1 << _e334[_j336];
      const _h337 = popcount(v_T);
      if (!(((_h337 === 0) || ((2 <= _h337) && (_h337 <= _h339))))) continue;
      const _h532 = (v_Y0 & ~v_T);
      _g340.length = 0;
      G341: {
        const _a348 = v_X0;
        for (let _i349 = 0; _i349 < _a348.length; _i349++) {
          const v_L = _a348[_i349];
          let _q350 = false;
          Q351: {
            const _a352 = sp.lineCells[v_L];
            for (let _i353 = 0; _i353 < _a352.length; _i353++) {
              const v_c = _a352[_i353];
              const _h354 = (b.grid[v_c] !== 0);
              if ((((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h325 || !(_h354)))) {
                _q350 = true;
                break Q351;
              }
            }
          }
          if (!(!(_q350))) continue;
          _g340.push(v_L);
        }
      }
      L355: {
        const v_X = _g340;
        const _h356 = v_X.length;
        let _c375: boolean = (_h325 && (_h356 >= (_h338 - _h337)));
        if (!_c375) {
          let _c374: boolean = _h302;
          if (_c374) {
            let _g357 = 0;
            G358: {
              const _a359 = v_X;
              for (let _i360 = 0; _i360 < _a359.length; _i360++) {
                const v_L = _a359[_i360];
                let _g361 = 0;
                G362: {
                  const _a363 = sp.lineCells[v_L];
                  for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                    const v_c = _a363[_i364];
                    const _h365 = (b.grid[v_c] || -1);
                    if (!((_h365 === v_d))) continue;
                    _g361++;
                  }
                }
                _g357 += (v_k - _g361);
              }
            }
            let _g366 = 0;
            G367: {
              for (let _m368 = (v_Y0 & ~v_T); _m368 !== 0; _m368 &= _m368 - 1) {
                const v_r = 31 - Math.clz32(_m368 & -_m368);
                let _g369 = 0;
                G370: {
                  const _a371 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                  for (let _i372 = 0; _i372 < _a371.length; _i372++) {
                    const v_c = _a371[_i372];
                    const _h373 = (b.grid[v_c] || -1);
                    if (!((_h373 === v_d))) continue;
                    _g369++;
                  }
                }
                _g366 += (v_k - _g369);
              }
            }
            _c374 = (_g357 >= _g366);
          }
          _c375 = _c374;
        }
        if (!(_c375)) break L355;
        if (b.made[0] !== _m108_0 || b.made[1] !== _m116_1) {
          _g376.length = 0;
          G377: {
            const _a390 = sp.cols;
            for (let _i391 = 0; _i391 < _a390.length; _i391++) {
              const v_L = _a390[_i391];
              let _q392 = false;
              Q393: {
                const _a394 = sp.lineCells[v_L];
                for (let _i395 = 0; _i395 < _a394.length; _i395++) {
                  const v_c = _a394[_i395];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q392 = true;
                    break Q393;
                  }
                }
              }
              let _c401: boolean = !(_q392);
              if (!_c401) {
                let _c400: boolean = (v_k > 1);
                if (_c400) {
                  let _g396 = 0;
                  G397: {
                    const _a398 = sp.lineCells[v_L];
                    for (let _i399 = 0; _i399 < _a398.length; _i399++) {
                      const v_c = _a398[_i399];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g396++;
                    }
                  }
                  _c400 = (_g396 < v_k);
                }
                _c401 = _c400;
              }
              if (!(_c401)) continue;
              _g376.push(v_L);
            }
          }
          if (!(sameSet(v_X0, _g376))) { continue R1; }
          let _g402 = 0;
          G403: {
            const _a412 = cellsValued(b, sp.cells, v_d);
            for (let _i413 = 0; _i413 < _a412.length; _i413++) {
              const v_c = _a412[_i413];
              let _c419: boolean = ((b.grid[v_c] || -1) === v_d);
              if (_c419) {
                let _c418: boolean = (v_k === 1);
                if (!_c418) {
                  let _g414 = 0;
                  G415: {
                    const _a416 = sp.lineCells[sp.rowOf[v_c]];
                    for (let _i417 = 0; _i417 < _a416.length; _i417++) {
                      const v_p = _a416[_i417];
                      if (!(((b.grid[v_p] || -1) === v_d))) continue;
                      _g414++;
                    }
                  }
                  _c418 = (_g414 >= v_k);
                }
                _c419 = _c418;
              }
              if (!(_c419)) continue;
              const _t420 = ((v_c / sp.w) | 0);
              _g402 |= 1 << _t420;
            }
          }
          if (!((v_Y0 === (rangeMask(0, (sp.h - 1)) & ~_g402)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g421: number[] = [];
          G422: {
            const _a435 = sp.cols;
            for (let _i436 = 0; _i436 < _a435.length; _i436++) {
              const v_L = _a435[_i436];
              let _q437 = false;
              Q438: {
                const _a439 = sp.lineCells[v_L];
                for (let _i440 = 0; _i440 < _a439.length; _i440++) {
                  const v_c = _a439[_i440];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q437 = true;
                    break Q438;
                  }
                }
              }
              let _c446: boolean = !(_q437);
              if (!_c446) {
                let _c445: boolean = (v_k > 1);
                if (_c445) {
                  let _g441 = 0;
                  G442: {
                    const _a443 = sp.lineCells[v_L];
                    for (let _i444 = 0; _i444 < _a443.length; _i444++) {
                      const v_c = _a443[_i444];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g441++;
                    }
                  }
                  _c445 = (_g441 < v_k);
                }
                _c446 = _c445;
              }
              if (!(_c446)) continue;
              _g421.push(v_L);
            }
          }
          let _g447 = 0;
          G448: {
            const _a457 = cellsValued(b, sp.cells, v_d);
            for (let _i458 = 0; _i458 < _a457.length; _i458++) {
              const v_c = _a457[_i458];
              let _c464: boolean = ((b.grid[v_c] || -1) === v_d);
              if (_c464) {
                let _c463: boolean = (v_k === 1);
                if (!_c463) {
                  let _g459 = 0;
                  G460: {
                    const _a461 = sp.lineCells[sp.rowOf[v_c]];
                    for (let _i462 = 0; _i462 < _a461.length; _i462++) {
                      const v_p = _a461[_i462];
                      if (!(((b.grid[v_p] || -1) === v_d))) continue;
                      _g459++;
                    }
                  }
                  _c463 = (_g459 >= v_k);
                }
                _c464 = _c463;
              }
              if (!(_c464)) continue;
              const _t465 = ((v_c / sp.w) | 0);
              _g447 |= 1 << _t465;
            }
          }
          const _g466: number[] = [];
          G467: {
            const _a474 = v_X0;
            for (let _i475 = 0; _i475 < _a474.length; _i475++) {
              const v_L = _a474[_i475];
              let _q476 = false;
              Q477: {
                const _a478 = sp.lineCells[v_L];
                for (let _i479 = 0; _i479 < _a478.length; _i479++) {
                  const v_c = _a478[_i479];
                  if ((((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && ((v_k === 1) || !((b.grid[v_c] !== 0))))) {
                    _q476 = true;
                    break Q477;
                  }
                }
              }
              if (!(!(_q476))) continue;
              _g466.push(v_L);
            }
          }
          let _c496: boolean = ((v_k === 1) && (v_X.length >= (v_X0.length - popcount(v_T))));
          if (!_c496) {
            let _c495: boolean = (v_k > 1);
            if (_c495) {
              let _g480 = 0;
              G481: {
                const _a482 = v_X;
                for (let _i483 = 0; _i483 < _a482.length; _i483++) {
                  const v_L = _a482[_i483];
                  let _g484 = 0;
                  G485: {
                    const _a486 = sp.lineCells[v_L];
                    for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                      const v_c = _a486[_i487];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g484++;
                    }
                  }
                  _g480 += (v_k - _g484);
                }
              }
              let _g488 = 0;
              G489: {
                for (let _m490 = (v_Y0 & ~v_T); _m490 !== 0; _m490 &= _m490 - 1) {
                  const v_r = 31 - Math.clz32(_m490 & -_m490);
                  let _g491 = 0;
                  G492: {
                    const _a493 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                    for (let _i494 = 0; _i494 < _a493.length; _i494++) {
                      const v_c = _a493[_i494];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g491++;
                    }
                  }
                  _g488 += (v_k - _g491);
                }
              }
              _c495 = (_g480 >= _g488);
            }
            _c496 = _c495;
          }
          freshBinding("fish", [(((b.domain >> v_d) & 1) !== 0), (v_k === (v_d === b.repeat ? b.times : 1)), sameSet(v_X0, _g421), (v_Y0 === (rangeMask(0, (sp.h - 1)) & ~_g447)), ((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (v_X0.length - 2)))), sameSet(v_X, _g466), _c496], ["d in", "k =", "X0 =", "Y0 =", "where of T", "X =", "where of X"]);
        }
        facts.length = 0;
        changed = false;
        let _c505: boolean = (_h337 > 0);
        if (!_c505) {
          let _q497 = true;
          Q498: {
            const _a499 = sp.cols;
            for (let _i500 = 0; _i500 < _a499.length; _i500++) {
              const v_L = _a499[_i500];
              let _q501 = false;
              Q502: {
                const _a503 = sp.lineCells[v_L];
                for (let _i504 = 0; _i504 < _a503.length; _i504++) {
                  const v_c = _a503[_i504];
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                    _q501 = true;
                    break Q502;
                  }
                }
              }
              if (!(_q501)) {
                _q497 = false;
                break Q498;
              }
            }
          }
          _c505 = _q497;
        }
        let _c525: boolean = _c505;
        if (_c525) {
          let _c524: boolean = (_h325 && (_h356 === (_h338 - _h337)));
          if (!_c524) {
            let _c523: boolean = _h302;
            if (_c523) {
              let _g506 = 0;
              G507: {
                const _a508 = v_X;
                for (let _i509 = 0; _i509 < _a508.length; _i509++) {
                  const v_L = _a508[_i509];
                  let _g510 = 0;
                  G511: {
                    const _a512 = sp.lineCells[v_L];
                    for (let _i513 = 0; _i513 < _a512.length; _i513++) {
                      const v_c = _a512[_i513];
                      const _h514 = (b.grid[v_c] || -1);
                      if (!((_h514 === v_d))) continue;
                      _g510++;
                    }
                  }
                  _g506 += (v_k - _g510);
                }
              }
              let _g515 = 0;
              G516: {
                for (let _m517 = (v_Y0 & ~v_T); _m517 !== 0; _m517 &= _m517 - 1) {
                  const v_r = 31 - Math.clz32(_m517 & -_m517);
                  let _g518 = 0;
                  G519: {
                    const _a520 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                    for (let _i521 = 0; _i521 < _a520.length; _i521++) {
                      const v_c = _a520[_i521];
                      const _h522 = (b.grid[v_c] || -1);
                      if (!((_h522 === v_d))) continue;
                      _g518++;
                    }
                  }
                  _g515 += (v_k - _g518);
                }
              }
              _c523 = (_g506 === _g515);
            }
            _c524 = _c523;
          }
          _c525 = _c524;
        }
        let _c534: boolean = _c525;
        if (_c534) {
          let _q526 = true;
          Q527: {
            const _a528 = minus(v_X0, v_X);
            for (let _i529 = 0; _i529 < _a528.length; _i529++) {
              const v_L = _a528[_i529];
              const _a530 = sp.lineCells[v_L];
              for (let _i531 = 0; _i531 < _a530.length; _i531++) {
                const v_c = _a530[_i531];
                const _h533 = (b.grid[v_c] !== 0);
                if (!((((((_h532 >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h325 || !(_h533))))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q526 = false;
                  break Q527;
                }
              }
            }
          }
          _c534 = _q526;
        }
        if (!(_c534)) return -1;
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
const _st627 = stamps();

/** Its dearest read grows with the board as n. */
export function wing(b: Marks, sp: GridSpace, fire: Fire<WingBinding> | null): number {
  const _g618: number[] = [];
  const _g629: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a581 = sp.cells;
  R1:
  for (let _i582 = 0; _i582 < _a581.length; _i582++) {
    const v_m = _a581[_i582];
    const _m158_0 = b.made[0];
    const _h583 = (b.grid[v_m] !== 0);
    if (!(!(_h583))) continue;
    R2:
    for (let _m584 = b.domain; _m584 !== 0; _m584 &= _m584 - 1) {
      const v_x = 31 - Math.clz32(_m584 & -_m584);
      if (!(((v_x === b.repeat ? b.times : 1) === 1))) continue;
      const _m165_1 = b.made[1];
      L585: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)));
        const _h586 = popcount(v_R);
        let _c597: boolean = (_h586 >= 1);
        if (_c597) {
          let _q587 = true;
          Q588: {
            for (let _m589 = v_R; _m589 !== 0; _m589 &= _m589 - 1) {
              const v_a = 31 - Math.clz32(_m589 & -_m589);
              const _h595 = ((1 << v_a) | (1 << v_x));
              let _c596: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
              if (_c596) {
                let _q590 = false;
                Q591: {
                  const _a592 = sp.peers[v_m];
                  for (let _i593 = 0; _i593 < _a592.length; _i593++) {
                    const v_k = _a592[_i593];
                    const _h594 = (b.grid[v_k] !== 0);
                    if ((!(_h594) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h595))) {
                      _q590 = true;
                      break Q591;
                    }
                  }
                }
                _c596 = _q590;
              }
              if (!(_c596)) {
                _q587 = false;
                break Q588;
              }
            }
          }
          _c597 = _q587;
        }
        if (!(_c597)) break L585;
        const _a598 = sp.peers[v_m];
        R3:
        for (let _i599 = 0; _i599 < _a598.length; _i599++) {
          const v_k0 = _a598[_i599];
          const _h600 = (b.grid[v_k0] !== 0);
          let _c604: boolean = !(_h600);
          if (_c604) {
            let _g601 = -1;
            G602: {
              for (let _m603 = v_R; _m603 !== 0; _m603 &= _m603 - 1) {
                const v_a = 31 - Math.clz32(_m603 & -_m603);
                if (_g601 === -1 || v_a < _g601) _g601 = v_a;
              }
            }
            _c604 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g601) | (1 << v_x)));
          }
          if (!(_c604)) continue;
          const _a605 = sp.peers[v_k0];
          for (let _i606 = 0; _i606 < _a605.length; _i606++) {
            const v_t = _a605[_i606];
            const _h607 = (b.grid[v_t] !== 0);
            let _c617: boolean = ((((v_t !== v_m) && !(_h607)) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (sp.peers[v_m].includes(v_t))));
            if (_c617) {
              let _q608 = true;
              Q609: {
                for (let _m610 = v_R; _m610 !== 0; _m610 &= _m610 - 1) {
                  const v_a = 31 - Math.clz32(_m610 & -_m610);
                  const _h616 = ((1 << v_a) | (1 << v_x));
                  let _q611 = false;
                  Q612: {
                    const _a613 = sp.peers[v_m];
                    for (let _i614 = 0; _i614 < _a613.length; _i614++) {
                      const v_k = _a613[_i614];
                      const _h615 = (b.grid[v_k] !== 0);
                      if ((((!(_h615) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h616)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q611 = true;
                        break Q612;
                      }
                    }
                  }
                  if (!(_q611)) {
                    _q608 = false;
                    break Q609;
                  }
                }
              }
              _c617 = _q608;
            }
            if (!(_c617)) continue;
            _g618.length = 0;
            _st627.pass++;
            G619: {
              for (let _m628 = v_R; _m628 !== 0; _m628 &= _m628 - 1) {
                const v_a = 31 - Math.clz32(_m628 & -_m628);
                const _h636 = ((1 << v_a) | (1 << v_x));
                _g629.length = 0;
                G630: {
                  const _a633 = sp.peers[v_m];
                  for (let _i634 = 0; _i634 < _a633.length; _i634++) {
                    const v_k = _a633[_i634];
                    const _h635 = (b.grid[v_k] !== 0);
                    if (!((((!(_h635) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h636)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g629.push(v_k);
                  }
                }
                const _t637 = (_g629.length > 0 ? _g629[0] : -1);
                const _t638 = _t637;
                if (_g618.length < 16) { if (!_g618.includes(_t638)) _g618.push(_t638); } else addOnce(_g618, _st627, _t638);
              }
            }
            const v_E = _g618;
            if (b.made[0] !== _m158_0 || b.made[1] !== _m165_1) {
              if (!(!((b.grid[v_m] !== 0)))) { continue R1; }
              if (!((v_R === ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)))))) { continue R2; }
              let _c647: boolean = (popcount(v_R) >= 1);
              if (_c647) {
                let _q639 = true;
                Q640: {
                  for (let _m641 = v_R; _m641 !== 0; _m641 &= _m641 - 1) {
                    const v_a = 31 - Math.clz32(_m641 & -_m641);
                    let _c646: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
                    if (_c646) {
                      let _q642 = false;
                      Q643: {
                        const _a644 = sp.peers[v_m];
                        for (let _i645 = 0; _i645 < _a644.length; _i645++) {
                          const v_k = _a644[_i645];
                          if ((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x))))) {
                            _q642 = true;
                            break Q643;
                          }
                        }
                      }
                      _c646 = _q642;
                    }
                    if (!(_c646)) {
                      _q639 = false;
                      break Q640;
                    }
                  }
                }
                _c647 = _q639;
              }
              if (!(_c647)) { continue R2; }
              let _c651: boolean = !((b.grid[v_k0] !== 0));
              if (_c651) {
                let _g648 = -1;
                G649: {
                  for (let _m650 = v_R; _m650 !== 0; _m650 &= _m650 - 1) {
                    const v_a = 31 - Math.clz32(_m650 & -_m650);
                    if (_g648 === -1 || v_a < _g648) _g648 = v_a;
                  }
                }
                _c651 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g648) | (1 << v_x)));
              }
              if (!(_c651)) { continue R3; }
            }
            if (import.meta.env.DEV && staleChecking) {
              let _c660: boolean = (popcount(v_R) >= 1);
              if (_c660) {
                let _q652 = true;
                Q653: {
                  for (let _m654 = v_R; _m654 !== 0; _m654 &= _m654 - 1) {
                    const v_a = 31 - Math.clz32(_m654 & -_m654);
                    let _c659: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
                    if (_c659) {
                      let _q655 = false;
                      Q656: {
                        const _a657 = sp.peers[v_m];
                        for (let _i658 = 0; _i658 < _a657.length; _i658++) {
                          const v_k = _a657[_i658];
                          if ((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x))))) {
                            _q655 = true;
                            break Q656;
                          }
                        }
                      }
                      _c659 = _q655;
                    }
                    if (!(_c659)) {
                      _q652 = false;
                      break Q653;
                    }
                  }
                }
                _c660 = _q652;
              }
              let _c664: boolean = !((b.grid[v_k0] !== 0));
              if (_c664) {
                let _g661 = -1;
                G662: {
                  for (let _m663 = v_R; _m663 !== 0; _m663 &= _m663 - 1) {
                    const v_a = 31 - Math.clz32(_m663 & -_m663);
                    if (_g661 === -1 || v_a < _g661) _g661 = v_a;
                  }
                }
                _c664 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g661) | (1 << v_x)));
              }
              let _c672: boolean = ((((v_t !== v_m) && !((b.grid[v_t] !== 0))) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (sp.peers[v_m].includes(v_t))));
              if (_c672) {
                let _q665 = true;
                Q666: {
                  for (let _m667 = v_R; _m667 !== 0; _m667 &= _m667 - 1) {
                    const v_a = 31 - Math.clz32(_m667 & -_m667);
                    let _q668 = false;
                    Q669: {
                      const _a670 = sp.peers[v_m];
                      for (let _i671 = 0; _i671 < _a670.length; _i671++) {
                        const v_k = _a670[_i671];
                        if ((((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                          _q668 = true;
                          break Q669;
                        }
                      }
                    }
                    if (!(_q668)) {
                      _q665 = false;
                      break Q666;
                    }
                  }
                }
                _c672 = _q665;
              }
              const _g673: number[] = [];
              G674: {
                for (let _m682 = v_R; _m682 !== 0; _m682 &= _m682 - 1) {
                  const v_a = 31 - Math.clz32(_m682 & -_m682);
                  const _g683: number[] = [];
                  G684: {
                    const _a687 = sp.peers[v_m];
                    for (let _i688 = 0; _i688 < _a687.length; _i688++) {
                      const v_k = _a687[_i688];
                      if (!((((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                      _g683.push(v_k);
                    }
                  }
                  const _t689 = (_g683.length > 0 ? _g683[0] : -1);
                  if (!_g673.includes(_t689)) _g673.push(_t689);
                }
              }
              freshBinding("wing", [(sp.cells.includes(v_m)), !((b.grid[v_m] !== 0)), (((b.domain >> v_x) & 1) !== 0), ((v_x === b.repeat ? b.times : 1) === 1), (v_R === ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)))), _c660, (sp.peers[v_m].includes(v_k0)), _c664, (sp.peers[v_k0].includes(v_t)), _c672, sameSet(v_E, _g673)], ["m in", "where of m", "x in", "where of x", "R =", "where of R", "k0 in", "where of k0", "t in", "where of t", "E ="]);
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
