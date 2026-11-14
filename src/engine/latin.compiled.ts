// Compiled by `npm run describe` from src/engine/latin.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, cellsValued, freshBinding, least, minus, popcount, rangeMask, sameSet, staleChecking, stamps, valuesOf } from "./describe-runtime.ts";

const DEV = import.meta.env.DEV;

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
  const _m22_0 = b.made[0];
  const _h5 = (b.grid[v_c] !== 0);
  const _h6 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const v_d = _h6;
  const v_k = (v_d === b.repeat ? b.times : 1);
  const _h9 = (v_k === 1);
  const _a7 = sp.unitsOf[v_c];
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_u = _a7[_i8];
    if (b.made[0] !== _m22_0) {
      if (!((v_d === (b.grid[v_c] || -1)))) { return placed(b, sp, v_c, fire) | fired; }
    }
    if (DEV && staleChecking) {
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
  const _a16 = sp.units;
  R1:
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_u = _a16[_i17];
    const _m54_0 = b.made[0];
    let _g18 = 0;
    G19: {
      const _a22 = sp.lineCells[v_u];
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_c = _a22[_i23];
        if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
        const _t24 = (b.grid[v_c] || -1);
        _g18 |= 1 << _t24;
      }
    }
    const v_placed = _g18;
    for (let _m25 = (b.domain & ~v_placed); _m25 !== 0; _m25 &= _m25 - 1) {
      const v_d = 31 - Math.clz32(_m25 & -_m25);
      let _g26 = 0;
      G27: {
        const _a28 = sp.lineCells[v_u];
        for (let _i29 = 0; _i29 < _a28.length; _i29++) {
          const v_c = _a28[_i29];
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g26++;
        }
      }
      L30: {
        const v_n = _g26;
        if (!((v_n <= (v_d === b.repeat ? b.times : 1)))) break L30;
        if (b.made[0] !== _m54_0) {
          let _g31 = 0;
          G32: {
            const _a35 = sp.lineCells[v_u];
            for (let _i36 = 0; _i36 < _a35.length; _i36++) {
              const v_c = _a35[_i36];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t37 = (b.grid[v_c] || -1);
              _g31 |= 1 << _t37;
            }
          }
          if (!((v_placed === _g31))) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _g38 = 0;
          G39: {
            const _a42 = sp.lineCells[v_u];
            for (let _i43 = 0; _i43 < _a42.length; _i43++) {
              const v_c = _a42[_i43];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t44 = (b.grid[v_c] || -1);
              _g38 |= 1 << _t44;
            }
          }
          let _g45 = 0;
          G46: {
            const _a47 = sp.lineCells[v_u];
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_c = _a47[_i48];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              _g45++;
            }
          }
          freshBinding("hiddenSingle", [(sp.units.includes(v_u)), (v_placed === _g38), ((((b.domain & ~v_placed) >> v_d) & 1) !== 0), (v_n === _g45), (v_n <= (v_d === b.repeat ? b.times : 1))], ["u in", "placed =", "d in", "n =", "where of n"]);
        }
        facts.length = 0;
        changed = false;
        let _c53: boolean = (v_n === (v_d === b.repeat ? b.times : 1));
        if (_c53) {
          let _q49 = true;
          Q50: {
            const _a51 = sp.lineCells[v_u];
            for (let _i52 = 0; _i52 < _a51.length; _i52++) {
              const v_c = _a51[_i52];
              if (!(((((b.cands[v_c] >> v_d) & 1) !== 0) && !((b.grid[v_c] !== 0))))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q49 = false;
                break Q50;
              }
            }
          }
          _c53 = _q49;
        }
        if (!(_c53)) return -1;
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
  const _a5 = sp.cols;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_L = _a5[_i6];
    const _a7 = sp.lineCells[v_L];
    for (let _i8 = 0; _i8 < _a7.length; _i8++) {
      const v_c = _a7[_i8];
      if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
      if (DEV && staleChecking) {
        freshBinding("single", [(sp.cols.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["L in", "c in", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      let _c10: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
      if (_c10) {
        const _t9 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t9); changed = true; } else facts.push(PLACE, v_c, _t9); }
        _c10 = true;
      }
      if (!(_c10)) return -1;
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SetSays {
  terms: { u: number; S: readonly number[]; };
  marks: {  };
}

const setFacts: number[] = [];
let setCands = new Int32Array(0);

/** Its dearest read grows with the board as n^0.5. */
export function set(b: Marks, sp: GridSpace, fire: Fire<SetBinding, SetSays> | null): number {
  const _g40: number[] = [];
  const _g58: number[] = [];
  const _g74: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  if (setCands.length < sp.cells.length) setCands = new Int32Array(sp.cells.length);
  const cands = setCands;
  cands.fill(-1);
  const _a30 = sp.units;
  R1:
  for (let _i31 = 0; _i31 < _a30.length; _i31++) {
    const v_u = _a30[_i31];
    const _m115_0 = b.made[0];
    let _g32 = 0;
    G33: {
      const _a36 = sp.lineCells[v_u];
      for (let _i37 = 0; _i37 < _a36.length; _i37++) {
        const v_c = _a36[_i37];
        const _h38 = (b.grid[v_c] !== 0);
        const _h39 = (b.grid[v_c] || -1);
        if (!((_h38 && ((_h39 === b.repeat ? b.times : 1) === 1)))) continue;
        _g32 |= 1 << _h39;
      }
    }
    const v_V = (b.domain & ~_g32);
    const _h52 = popcount(v_V);
    const _h57 = (_h52 - 2);
    _g40.length = 0;
    G41: {
      const _a44 = sp.lineCells[v_u];
      for (let _i45 = 0; _i45 < _a44.length; _i45++) {
        const v_c = _a44[_i45];
        const _h46 = (b.grid[v_c] !== 0);
        if (!(!(_h46))) continue;
        _g40.push(v_c);
      }
    }
    const v_open = _g40;
    const _h51 = v_open.length;
    let _g47 = 0;
    G48: {
      for (let _m50 = v_V; _m50 !== 0; _m50 &= _m50 - 1) {
        const v_d = 31 - Math.clz32(_m50 & -_m50);
        if (!(((v_d === b.repeat ? b.times : 1) > 1))) continue;
        _g47 |= 1 << v_d;
      }
    }
    const v_R = _g47;
    const v_extra = (_h51 - _h52);
    const _e53 = valuesOf(v_V);
    for (let _k54 = 0; _k54 < 1 << _e53.length; _k54++) {
      let v_T = 0;
      for (let _j55 = 0; _j55 < _e53.length; _j55++) if ((_k54 >> (_e53.length - 1 - _j55)) & 1) v_T |= 1 << _e53[_j55];
      const _h56 = popcount(v_T);
      if (!(((_h56 === 0) || ((2 <= _h56) && (_h56 <= _h57))))) continue;
      const _h66 = popcount((v_R & ~v_T));
      const _h112 = (v_V & ~v_T);
      _g58.length = 0;
      G59: {
        const _a62 = v_open;
        for (let _i63 = 0; _i63 < _a62.length; _i63++) {
          const v_c = _a62[_i63];
          if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) !== 0)))) continue;
          _g58.push(v_c);
        }
      }
      L64: {
        const v_S = _g58;
        const _h65 = v_S.length;
        if (!((_h65 >= ((_h52 - _h56) + (v_extra * _h66))))) break L64;
        if (b.made[0] !== _m115_0) {
          let _g67 = 0;
          G68: {
            const _a71 = sp.lineCells[v_u];
            for (let _i72 = 0; _i72 < _a71.length; _i72++) {
              const v_c = _a71[_i72];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t73 = (b.grid[v_c] || -1);
              _g67 |= 1 << _t73;
            }
          }
          if (!((v_V === (b.domain & ~_g67)))) { continue R1; }
          _g74.length = 0;
          G75: {
            const _a78 = sp.lineCells[v_u];
            for (let _i79 = 0; _i79 < _a78.length; _i79++) {
              const v_c = _a78[_i79];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g74.push(v_c);
            }
          }
          if (!(sameSet(v_open, _g74))) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _g80 = 0;
          G81: {
            const _a84 = sp.lineCells[v_u];
            for (let _i85 = 0; _i85 < _a84.length; _i85++) {
              const v_c = _a84[_i85];
              if (!(((b.grid[v_c] !== 0) && (((b.grid[v_c] || -1) === b.repeat ? b.times : 1) === 1)))) continue;
              const _t86 = (b.grid[v_c] || -1);
              _g80 |= 1 << _t86;
            }
          }
          const _g87: number[] = [];
          G88: {
            const _a91 = sp.lineCells[v_u];
            for (let _i92 = 0; _i92 < _a91.length; _i92++) {
              const v_c = _a91[_i92];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g87.push(v_c);
            }
          }
          let _g93 = 0;
          G94: {
            for (let _m96 = v_V; _m96 !== 0; _m96 &= _m96 - 1) {
              const v_d = 31 - Math.clz32(_m96 & -_m96);
              if (!(((v_d === b.repeat ? b.times : 1) > 1))) continue;
              _g93 |= 1 << v_d;
            }
          }
          const _g97: number[] = [];
          G98: {
            const _a101 = v_open;
            for (let _i102 = 0; _i102 < _a101.length; _i102++) {
              const v_c = _a101[_i102];
              if (!(!(((v_T & (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) !== 0)))) continue;
              _g97.push(v_c);
            }
          }
          freshBinding("set", [(sp.units.includes(v_u)), (v_V === (b.domain & ~_g80)), sameSet(v_open, _g87), (v_R === _g93), (v_extra === (v_open.length - popcount(v_V))), ((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (popcount(v_V) - 2)))), sameSet(v_S, _g97), (v_S.length >= ((popcount(v_V) - popcount(v_T)) + (v_extra * popcount((v_R & ~v_T)))))], ["u in", "V =", "open =", "R =", "extra =", "where of T", "S =", "where of S"]);
        }
        facts.length = 0;
        changed = false;
        let _c107: boolean = (_h56 > 0);
        if (!_c107) {
          let _q103 = true;
          Q104: {
            const _a105 = sp.lineCells[v_u];
            for (let _i106 = 0; _i106 < _a105.length; _i106++) {
              const v_c = _a105[_i106];
              if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) > 0))) {
                _q103 = false;
                break Q104;
              }
            }
          }
          _c107 = _q103;
        }
        let _c114: boolean = (_c107 && (_h65 === ((_h52 - _h56) + (v_extra * _h66))));
        if (_c114) {
          let _q108 = true;
          Q109: {
            const _a110 = v_open;
            for (let _i111 = 0; _i111 < _a110.length; _i111++) {
              const v_c = _a110[_i111];
              if (!(!(v_S.includes(v_c)))) continue;
              for (let _m113 = _h112; _m113 !== 0; _m113 &= _m113 - 1) {
                const v_d = 31 - Math.clz32(_m113 & -_m113);
                if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q108 = false;
                  break Q109;
                }
              }
            }
          }
          _c114 = _q108;
        }
        if (!(_c114)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { u: v_u, S: v_S.slice() }, marks: {  } };
            if (!fire({ u: v_u, V: v_V, open: v_open.slice(), R: v_R, extra: v_extra, T: v_T, S: v_S.slice() }, facts, _says)) return 1;
          }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; the arm that holds says which way it reads. */
export type FishSays =
  | { arm: "cols"; terms: { d: number; lines: readonly number[]; places: readonly number[]; }; marks: {  } }
  | { arm: "rows"; terms: { d: number; lines: number; places: readonly number[]; }; marks: {  } }
;

const fishFacts: number[] = [];
const fish_st343 = stamps();
const fish_st355 = stamps();

/** Its dearest read grows with the board as n. */
export function fish(b: Marks, sp: GridSpace, fire: Fire<FishBinding, FishSays> | null): number {
  const _g83: number[] = [];
  const _g142: number[] = [];
  const _g178: number[] = [];
  const _g337: number[] = [];
  const _g349: number[] = [];
  const facts = fishFacts;
  let fired = 0;
  let changed = false;
  const _h112 = (sp.h - 1);
  const _h113 = rangeMask(0, _h112);
  R1:
  for (let _m82 = b.domain; _m82 !== 0; _m82 &= _m82 - 1) {
    const v_d = 31 - Math.clz32(_m82 & -_m82);
    const v_k = (v_d === b.repeat ? b.times : 1);
    const _h104 = (v_k > 1);
    const _h127 = (v_k === 1);
    const _m361_0 = b.made[0];
    _g83.length = 0;
    G84: {
      const _a97 = sp.cols;
      for (let _i98 = 0; _i98 < _a97.length; _i98++) {
        const v_L = _a97[_i98];
        let _q99 = false;
        Q100: {
          const _a101 = sp.lineCells[v_L];
          for (let _i102 = 0; _i102 < _a101.length; _i102++) {
            const v_c = _a101[_i102];
            const _h103 = (b.grid[v_c] || -1);
            if ((_h103 === v_d)) {
              _q99 = true;
              break Q100;
            }
          }
        }
        let _c111: boolean = !(_q99);
        if (!_c111) {
          let _c110: boolean = _h104;
          if (_c110) {
            let _g105 = 0;
            G106: {
              const _a107 = sp.lineCells[v_L];
              for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                const v_c = _a107[_i108];
                const _h109 = (b.grid[v_c] || -1);
                if (!((_h109 === v_d))) continue;
                _g105++;
              }
            }
            _c110 = (_g105 < v_k);
          }
          _c111 = _c110;
        }
        if (!(_c111)) continue;
        _g83.push(v_L);
      }
    }
    const v_X0 = _g83;
    const _h140 = v_X0.length;
    const _h141 = (_h140 - 2);
    const _m362_1 = b.made[1];
    let _g114 = 0;
    G115: {
      const _a124 = cellsValued(b, sp.cells, v_d);
      for (let _i125 = 0; _i125 < _a124.length; _i125++) {
        const v_c = _a124[_i125];
        const _h126 = (b.grid[v_c] || -1);
        let _c134: boolean = (_h126 === v_d);
        if (_c134) {
          let _c133: boolean = _h127;
          if (!_c133) {
            let _g128 = 0;
            G129: {
              const _a130 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                const v_p = _a130[_i131];
                const _h132 = (b.grid[v_p] || -1);
                if (!((_h132 === v_d))) continue;
                _g128++;
              }
            }
            _c133 = (_g128 >= v_k);
          }
          _c134 = _c133;
        }
        if (!(_c134)) continue;
        const _t135 = ((v_c / sp.w) | 0);
        _g114 |= 1 << _t135;
      }
    }
    const v_Y0 = (_h113 & ~_g114);
    const _e136 = valuesOf(v_Y0);
    for (let _k137 = 0; _k137 < 1 << _e136.length; _k137++) {
      let v_T = 0;
      for (let _j138 = 0; _j138 < _e136.length; _j138++) if ((_k137 >> (_e136.length - 1 - _j138)) & 1) v_T |= 1 << _e136[_j138];
      const _h139 = popcount(v_T);
      if (!(((_h139 === 0) || ((2 <= _h139) && (_h139 <= _h141))))) continue;
      const _h334 = (v_Y0 & ~v_T);
      _g142.length = 0;
      G143: {
        const _a150 = v_X0;
        for (let _i151 = 0; _i151 < _a150.length; _i151++) {
          const v_L = _a150[_i151];
          let _q152 = false;
          Q153: {
            const _a154 = sp.lineCells[v_L];
            for (let _i155 = 0; _i155 < _a154.length; _i155++) {
              const v_c = _a154[_i155];
              const _h156 = (b.grid[v_c] !== 0);
              if ((((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h127 || !(_h156)))) {
                _q152 = true;
                break Q153;
              }
            }
          }
          if (!(!(_q152))) continue;
          _g142.push(v_L);
        }
      }
      L157: {
        const v_X = _g142;
        const _h158 = v_X.length;
        let _c177: boolean = (_h127 && (_h158 >= (_h140 - _h139)));
        if (!_c177) {
          let _c176: boolean = _h104;
          if (_c176) {
            let _g159 = 0;
            G160: {
              const _a161 = v_X;
              for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                const v_L = _a161[_i162];
                let _g163 = 0;
                G164: {
                  const _a165 = sp.lineCells[v_L];
                  for (let _i166 = 0; _i166 < _a165.length; _i166++) {
                    const v_c = _a165[_i166];
                    const _h167 = (b.grid[v_c] || -1);
                    if (!((_h167 === v_d))) continue;
                    _g163++;
                  }
                }
                _g159 += (v_k - _g163);
              }
            }
            let _g168 = 0;
            G169: {
              for (let _m170 = (v_Y0 & ~v_T); _m170 !== 0; _m170 &= _m170 - 1) {
                const v_r = 31 - Math.clz32(_m170 & -_m170);
                let _g171 = 0;
                G172: {
                  const _a173 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                  for (let _i174 = 0; _i174 < _a173.length; _i174++) {
                    const v_c = _a173[_i174];
                    const _h175 = (b.grid[v_c] || -1);
                    if (!((_h175 === v_d))) continue;
                    _g171++;
                  }
                }
                _g168 += (v_k - _g171);
              }
            }
            _c176 = (_g159 >= _g168);
          }
          _c177 = _c176;
        }
        if (!(_c177)) break L157;
        if (b.made[0] !== _m361_0 || b.made[1] !== _m362_1) {
          _g178.length = 0;
          G179: {
            const _a192 = sp.cols;
            for (let _i193 = 0; _i193 < _a192.length; _i193++) {
              const v_L = _a192[_i193];
              let _q194 = false;
              Q195: {
                const _a196 = sp.lineCells[v_L];
                for (let _i197 = 0; _i197 < _a196.length; _i197++) {
                  const v_c = _a196[_i197];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q194 = true;
                    break Q195;
                  }
                }
              }
              let _c203: boolean = !(_q194);
              if (!_c203) {
                let _c202: boolean = (v_k > 1);
                if (_c202) {
                  let _g198 = 0;
                  G199: {
                    const _a200 = sp.lineCells[v_L];
                    for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                      const v_c = _a200[_i201];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g198++;
                    }
                  }
                  _c202 = (_g198 < v_k);
                }
                _c203 = _c202;
              }
              if (!(_c203)) continue;
              _g178.push(v_L);
            }
          }
          if (!(sameSet(v_X0, _g178))) { continue R1; }
          let _g204 = 0;
          G205: {
            const _a214 = cellsValued(b, sp.cells, v_d);
            for (let _i215 = 0; _i215 < _a214.length; _i215++) {
              const v_c = _a214[_i215];
              let _c221: boolean = ((b.grid[v_c] || -1) === v_d);
              if (_c221) {
                let _c220: boolean = (v_k === 1);
                if (!_c220) {
                  let _g216 = 0;
                  G217: {
                    const _a218 = sp.lineCells[sp.rowOf[v_c]];
                    for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                      const v_p = _a218[_i219];
                      if (!(((b.grid[v_p] || -1) === v_d))) continue;
                      _g216++;
                    }
                  }
                  _c220 = (_g216 >= v_k);
                }
                _c221 = _c220;
              }
              if (!(_c221)) continue;
              const _t222 = ((v_c / sp.w) | 0);
              _g204 |= 1 << _t222;
            }
          }
          if (!((v_Y0 === (rangeMask(0, (sp.h - 1)) & ~_g204)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          const _g223: number[] = [];
          G224: {
            const _a237 = sp.cols;
            for (let _i238 = 0; _i238 < _a237.length; _i238++) {
              const v_L = _a237[_i238];
              let _q239 = false;
              Q240: {
                const _a241 = sp.lineCells[v_L];
                for (let _i242 = 0; _i242 < _a241.length; _i242++) {
                  const v_c = _a241[_i242];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q239 = true;
                    break Q240;
                  }
                }
              }
              let _c248: boolean = !(_q239);
              if (!_c248) {
                let _c247: boolean = (v_k > 1);
                if (_c247) {
                  let _g243 = 0;
                  G244: {
                    const _a245 = sp.lineCells[v_L];
                    for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                      const v_c = _a245[_i246];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g243++;
                    }
                  }
                  _c247 = (_g243 < v_k);
                }
                _c248 = _c247;
              }
              if (!(_c248)) continue;
              _g223.push(v_L);
            }
          }
          let _g249 = 0;
          G250: {
            const _a259 = cellsValued(b, sp.cells, v_d);
            for (let _i260 = 0; _i260 < _a259.length; _i260++) {
              const v_c = _a259[_i260];
              let _c266: boolean = ((b.grid[v_c] || -1) === v_d);
              if (_c266) {
                let _c265: boolean = (v_k === 1);
                if (!_c265) {
                  let _g261 = 0;
                  G262: {
                    const _a263 = sp.lineCells[sp.rowOf[v_c]];
                    for (let _i264 = 0; _i264 < _a263.length; _i264++) {
                      const v_p = _a263[_i264];
                      if (!(((b.grid[v_p] || -1) === v_d))) continue;
                      _g261++;
                    }
                  }
                  _c265 = (_g261 >= v_k);
                }
                _c266 = _c265;
              }
              if (!(_c266)) continue;
              const _t267 = ((v_c / sp.w) | 0);
              _g249 |= 1 << _t267;
            }
          }
          const _g268: number[] = [];
          G269: {
            const _a276 = v_X0;
            for (let _i277 = 0; _i277 < _a276.length; _i277++) {
              const v_L = _a276[_i277];
              let _q278 = false;
              Q279: {
                const _a280 = sp.lineCells[v_L];
                for (let _i281 = 0; _i281 < _a280.length; _i281++) {
                  const v_c = _a280[_i281];
                  if ((((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && ((v_k === 1) || !((b.grid[v_c] !== 0))))) {
                    _q278 = true;
                    break Q279;
                  }
                }
              }
              if (!(!(_q278))) continue;
              _g268.push(v_L);
            }
          }
          let _c298: boolean = ((v_k === 1) && (v_X.length >= (v_X0.length - popcount(v_T))));
          if (!_c298) {
            let _c297: boolean = (v_k > 1);
            if (_c297) {
              let _g282 = 0;
              G283: {
                const _a284 = v_X;
                for (let _i285 = 0; _i285 < _a284.length; _i285++) {
                  const v_L = _a284[_i285];
                  let _g286 = 0;
                  G287: {
                    const _a288 = sp.lineCells[v_L];
                    for (let _i289 = 0; _i289 < _a288.length; _i289++) {
                      const v_c = _a288[_i289];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g286++;
                    }
                  }
                  _g282 += (v_k - _g286);
                }
              }
              let _g290 = 0;
              G291: {
                for (let _m292 = (v_Y0 & ~v_T); _m292 !== 0; _m292 &= _m292 - 1) {
                  const v_r = 31 - Math.clz32(_m292 & -_m292);
                  let _g293 = 0;
                  G294: {
                    const _a295 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                    for (let _i296 = 0; _i296 < _a295.length; _i296++) {
                      const v_c = _a295[_i296];
                      if (!(((b.grid[v_c] || -1) === v_d))) continue;
                      _g293++;
                    }
                  }
                  _g290 += (v_k - _g293);
                }
              }
              _c297 = (_g282 >= _g290);
            }
            _c298 = _c297;
          }
          freshBinding("fish", [(((b.domain >> v_d) & 1) !== 0), (v_k === (v_d === b.repeat ? b.times : 1)), sameSet(v_X0, _g223), (v_Y0 === (rangeMask(0, (sp.h - 1)) & ~_g249)), ((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (v_X0.length - 2)))), sameSet(v_X, _g268), _c298], ["d in", "k =", "X0 =", "Y0 =", "where of T", "X =", "where of X"]);
        }
        facts.length = 0;
        changed = false;
        let _c307: boolean = (_h139 > 0);
        if (!_c307) {
          let _q299 = true;
          Q300: {
            const _a301 = sp.cols;
            for (let _i302 = 0; _i302 < _a301.length; _i302++) {
              const v_L = _a301[_i302];
              let _q303 = false;
              Q304: {
                const _a305 = sp.lineCells[v_L];
                for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                  const v_c = _a305[_i306];
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                    _q303 = true;
                    break Q304;
                  }
                }
              }
              if (!(_q303)) {
                _q299 = false;
                break Q300;
              }
            }
          }
          _c307 = _q299;
        }
        let _c327: boolean = _c307;
        if (_c327) {
          let _c326: boolean = (_h127 && (_h158 === (_h140 - _h139)));
          if (!_c326) {
            let _c325: boolean = _h104;
            if (_c325) {
              let _g308 = 0;
              G309: {
                const _a310 = v_X;
                for (let _i311 = 0; _i311 < _a310.length; _i311++) {
                  const v_L = _a310[_i311];
                  let _g312 = 0;
                  G313: {
                    const _a314 = sp.lineCells[v_L];
                    for (let _i315 = 0; _i315 < _a314.length; _i315++) {
                      const v_c = _a314[_i315];
                      const _h316 = (b.grid[v_c] || -1);
                      if (!((_h316 === v_d))) continue;
                      _g312++;
                    }
                  }
                  _g308 += (v_k - _g312);
                }
              }
              let _g317 = 0;
              G318: {
                for (let _m319 = (v_Y0 & ~v_T); _m319 !== 0; _m319 &= _m319 - 1) {
                  const v_r = 31 - Math.clz32(_m319 & -_m319);
                  let _g320 = 0;
                  G321: {
                    const _a322 = sp.lineCells[sp.rowOf[(v_r * sp.w + 0)]];
                    for (let _i323 = 0; _i323 < _a322.length; _i323++) {
                      const v_c = _a322[_i323];
                      const _h324 = (b.grid[v_c] || -1);
                      if (!((_h324 === v_d))) continue;
                      _g320++;
                    }
                  }
                  _g317 += (v_k - _g320);
                }
              }
              _c325 = (_g308 === _g317);
            }
            _c326 = _c325;
          }
          _c327 = _c326;
        }
        let _c336: boolean = _c327;
        if (_c336) {
          let _q328 = true;
          Q329: {
            const _a330 = minus(v_X0, v_X);
            for (let _i331 = 0; _i331 < _a330.length; _i331++) {
              const v_L = _a330[_i331];
              const _a332 = sp.lineCells[v_L];
              for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                const v_c = _a332[_i333];
                const _h335 = (b.grid[v_c] !== 0);
                if (!((((((_h334 >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h127 || !(_h335))))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q328 = false;
                  break Q329;
                }
              }
            }
          }
          _c336 = _q328;
        }
        if (!(_c336)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            let _arm = -1;
            if ((_h158 <= _h139)) _arm = 0; else if ((_h158 > _h139)) _arm = 1;
            let _says: FishSays | null = null;
            if (_arm === 0) {
              _g337.length = 0;
              fish_st343.pass++;
              G338: {
                const _a344 = v_X;
                for (let _i345 = 0; _i345 < _a344.length; _i345++) {
                  const v_L = _a344[_i345];
                  const _a346 = sp.lineCells[v_L];
                  for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                    const v_c = _a346[_i347];
                    if (!(((((_h334 >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                    const _t348 = v_c;
                    if (_g337.length < 16) { if (!_g337.includes(_t348)) _g337.push(_t348); } else addOnce(_g337, fish_st343, _t348);
                  }
                }
              }
              _says = { arm: "cols", terms: { d: v_d, lines: v_X.slice(), places: _g337.slice() }, marks: {  } };
            }
            if (_arm === 1) {
              _g349.length = 0;
              fish_st355.pass++;
              G350: {
                const _a356 = minus(v_X0, v_X);
                for (let _i357 = 0; _i357 < _a356.length; _i357++) {
                  const v_L = _a356[_i357];
                  const _a358 = sp.lineCells[v_L];
                  for (let _i359 = 0; _i359 < _a358.length; _i359++) {
                    const v_c = _a358[_i359];
                    if (!(((((v_T >> ((v_c / sp.w) | 0)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                    const _t360 = v_c;
                    if (_g349.length < 16) { if (!_g349.includes(_t360)) _g349.push(_t360); } else addOnce(_g349, fish_st355, _t360);
                  }
                }
              }
              _says = { arm: "rows", terms: { d: v_d, lines: v_T, places: _g349.slice() }, marks: {  } };
            }
            if (_says === null) throw new Error("fish: no arm of says holds");
            if (!fire({ d: v_d, k: v_k, X0: v_X0.slice(), Y0: v_Y0, T: v_T, X: v_X.slice() }, facts, _says)) return 1;
          }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface WingSays {
  terms: { m: number; x: number; E: readonly number[]; self: boolean; };
  marks: {  };
}

const wingFacts: number[] = [];
let wingCands = new Int32Array(0);
const wing_st93 = stamps();

/** Its dearest read grows with the board as n. */
export function wing(b: Marks, sp: GridSpace, fire: Fire<WingBinding, WingSays> | null): number {
  const _g84: number[] = [];
  const _g95: number[] = [];
  const facts = wingFacts;
  let fired = 0;
  let changed = false;
  if (wingCands.length < sp.cells.length) wingCands = new Int32Array(sp.cells.length);
  const cands = wingCands;
  cands.fill(-1);
  const _a47 = sp.cells;
  R1:
  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
    const v_m = _a47[_i48];
    const _m156_0 = b.made[0];
    const _h49 = (b.grid[v_m] !== 0);
    if (!(!(_h49))) continue;
    R2:
    for (let _m50 = b.domain; _m50 !== 0; _m50 &= _m50 - 1) {
      const v_x = 31 - Math.clz32(_m50 & -_m50);
      if (!(((v_x === b.repeat ? b.times : 1) === 1))) continue;
      const _m157_1 = b.made[1];
      L51: {
        const v_R = ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)));
        const _h52 = popcount(v_R);
        let _c63: boolean = (_h52 >= 1);
        if (_c63) {
          let _q53 = true;
          Q54: {
            for (let _m55 = v_R; _m55 !== 0; _m55 &= _m55 - 1) {
              const v_a = 31 - Math.clz32(_m55 & -_m55);
              const _h61 = ((1 << v_a) | (1 << v_x));
              let _c62: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
              if (_c62) {
                let _q56 = false;
                Q57: {
                  const _a58 = sp.peers[v_m];
                  for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                    const v_k = _a58[_i59];
                    const _h60 = (b.grid[v_k] !== 0);
                    if ((!(_h60) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h61))) {
                      _q56 = true;
                      break Q57;
                    }
                  }
                }
                _c62 = _q56;
              }
              if (!(_c62)) {
                _q53 = false;
                break Q54;
              }
            }
          }
          _c63 = _q53;
        }
        if (!(_c63)) break L51;
        const _a64 = sp.peers[v_m];
        R3:
        for (let _i65 = 0; _i65 < _a64.length; _i65++) {
          const v_k0 = _a64[_i65];
          const _h66 = (b.grid[v_k0] !== 0);
          let _c70: boolean = !(_h66);
          if (_c70) {
            let _g67 = -1;
            G68: {
              for (let _m69 = v_R; _m69 !== 0; _m69 &= _m69 - 1) {
                const v_a = 31 - Math.clz32(_m69 & -_m69);
                if (_g67 === -1 || v_a < _g67) _g67 = v_a;
              }
            }
            _c70 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g67) | (1 << v_x)));
          }
          if (!(_c70)) continue;
          const _a71 = sp.peers[v_k0];
          for (let _i72 = 0; _i72 < _a71.length; _i72++) {
            const v_t = _a71[_i72];
            const _h73 = (b.grid[v_t] !== 0);
            let _c83: boolean = ((((v_t !== v_m) && !(_h73)) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (sp.peers[v_m].includes(v_t))));
            if (_c83) {
              let _q74 = true;
              Q75: {
                for (let _m76 = v_R; _m76 !== 0; _m76 &= _m76 - 1) {
                  const v_a = 31 - Math.clz32(_m76 & -_m76);
                  const _h82 = ((1 << v_a) | (1 << v_x));
                  let _q77 = false;
                  Q78: {
                    const _a79 = sp.peers[v_m];
                    for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                      const v_k = _a79[_i80];
                      const _h81 = (b.grid[v_k] !== 0);
                      if ((((!(_h81) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h82)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q77 = true;
                        break Q78;
                      }
                    }
                  }
                  if (!(_q77)) {
                    _q74 = false;
                    break Q75;
                  }
                }
              }
              _c83 = _q74;
            }
            if (!(_c83)) continue;
            _g84.length = 0;
            wing_st93.pass++;
            G85: {
              for (let _m94 = v_R; _m94 !== 0; _m94 &= _m94 - 1) {
                const v_a = 31 - Math.clz32(_m94 & -_m94);
                const _h102 = ((1 << v_a) | (1 << v_x));
                _g95.length = 0;
                G96: {
                  const _a99 = sp.peers[v_m];
                  for (let _i100 = 0; _i100 < _a99.length; _i100++) {
                    const v_k = _a99[_i100];
                    const _h101 = (b.grid[v_k] !== 0);
                    if (!((((!(_h101) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === _h102)) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g95.push(v_k);
                  }
                }
                const _t103 = (_g95.length > 0 ? _g95[0] : -1);
                const _t104 = _t103;
                if (_g84.length < 16) { if (!_g84.includes(_t104)) _g84.push(_t104); } else addOnce(_g84, wing_st93, _t104);
              }
            }
            const v_E = _g84;
            if (b.made[0] !== _m156_0 || b.made[1] !== _m157_1) {
              if (!(!((b.grid[v_m] !== 0)))) { continue R1; }
              if (!((v_R === ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)))))) { continue R2; }
              let _c113: boolean = (popcount(v_R) >= 1);
              if (_c113) {
                let _q105 = true;
                Q106: {
                  for (let _m107 = v_R; _m107 !== 0; _m107 &= _m107 - 1) {
                    const v_a = 31 - Math.clz32(_m107 & -_m107);
                    let _c112: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
                    if (_c112) {
                      let _q108 = false;
                      Q109: {
                        const _a110 = sp.peers[v_m];
                        for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                          const v_k = _a110[_i111];
                          if ((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x))))) {
                            _q108 = true;
                            break Q109;
                          }
                        }
                      }
                      _c112 = _q108;
                    }
                    if (!(_c112)) {
                      _q105 = false;
                      break Q106;
                    }
                  }
                }
                _c113 = _q105;
              }
              if (!(_c113)) { continue R2; }
              let _c117: boolean = !((b.grid[v_k0] !== 0));
              if (_c117) {
                let _g114 = -1;
                G115: {
                  for (let _m116 = v_R; _m116 !== 0; _m116 &= _m116 - 1) {
                    const v_a = 31 - Math.clz32(_m116 & -_m116);
                    if (_g114 === -1 || v_a < _g114) _g114 = v_a;
                  }
                }
                _c117 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g114) | (1 << v_x)));
              }
              if (!(_c117)) { continue R3; }
            }
            if (DEV && staleChecking) {
              let _c126: boolean = (popcount(v_R) >= 1);
              if (_c126) {
                let _q118 = true;
                Q119: {
                  for (let _m120 = v_R; _m120 !== 0; _m120 &= _m120 - 1) {
                    const v_a = 31 - Math.clz32(_m120 & -_m120);
                    let _c125: boolean = ((v_a === b.repeat ? b.times : 1) === 1);
                    if (_c125) {
                      let _q121 = false;
                      Q122: {
                        const _a123 = sp.peers[v_m];
                        for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                          const v_k = _a123[_i124];
                          if ((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x))))) {
                            _q121 = true;
                            break Q122;
                          }
                        }
                      }
                      _c125 = _q121;
                    }
                    if (!(_c125)) {
                      _q118 = false;
                      break Q119;
                    }
                  }
                }
                _c126 = _q118;
              }
              let _c130: boolean = !((b.grid[v_k0] !== 0));
              if (_c130) {
                let _g127 = -1;
                G128: {
                  for (let _m129 = v_R; _m129 !== 0; _m129 &= _m129 - 1) {
                    const v_a = 31 - Math.clz32(_m129 & -_m129);
                    if (_g127 === -1 || v_a < _g127) _g127 = v_a;
                  }
                }
                _c130 = ((cands[v_k0] >= 0 ? cands[v_k0] : (cands[v_k0] = b.cands[v_k0])) === ((1 << _g127) | (1 << v_x)));
              }
              let _c138: boolean = ((((v_t !== v_m) && !((b.grid[v_t] !== 0))) && (((b.cands[v_t] >> v_x) & 1) !== 0)) && (!(((b.cands[v_m] >> v_x) & 1) !== 0) || (sp.peers[v_m].includes(v_t))));
              if (_c138) {
                let _q131 = true;
                Q132: {
                  for (let _m133 = v_R; _m133 !== 0; _m133 &= _m133 - 1) {
                    const v_a = 31 - Math.clz32(_m133 & -_m133);
                    let _q134 = false;
                    Q135: {
                      const _a136 = sp.peers[v_m];
                      for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                        const v_k = _a136[_i137];
                        if ((((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                          _q134 = true;
                          break Q135;
                        }
                      }
                    }
                    if (!(_q134)) {
                      _q131 = false;
                      break Q132;
                    }
                  }
                }
                _c138 = _q131;
              }
              const _g139: number[] = [];
              G140: {
                for (let _m148 = v_R; _m148 !== 0; _m148 &= _m148 - 1) {
                  const v_a = 31 - Math.clz32(_m148 & -_m148);
                  const _g149: number[] = [];
                  G150: {
                    const _a153 = sp.peers[v_m];
                    for (let _i154 = 0; _i154 < _a153.length; _i154++) {
                      const v_k = _a153[_i154];
                      if (!((((!((b.grid[v_k] !== 0)) && ((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                      _g149.push(v_k);
                    }
                  }
                  const _t155 = (_g149.length > 0 ? _g149[0] : -1);
                  if (!_g139.includes(_t155)) _g139.push(_t155);
                }
              }
              freshBinding("wing", [(sp.cells.includes(v_m)), !((b.grid[v_m] !== 0)), (((b.domain >> v_x) & 1) !== 0), ((v_x === b.repeat ? b.times : 1) === 1), (v_R === ((cands[v_m] >= 0 ? cands[v_m] : (cands[v_m] = b.cands[v_m])) & ~((1 << v_x)))), _c126, (sp.peers[v_m].includes(v_k0)), _c130, (sp.peers[v_k0].includes(v_t)), _c138, sameSet(v_E, _g139)], ["m in", "where of m", "x in", "where of x", "R =", "where of R", "k0 in", "where of k0", "t in", "where of t", "E ="]);
            }
            facts.length = 0;
            changed = false;
            if ((((b.cands[v_t] >> v_x) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_x); changed = true; } else facts.push(STRIKE, v_t, v_x); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null) {
                const _says = { terms: { m: v_m, x: v_x, E: v_E.slice(), self: (((b.cands[v_m] >> v_x) & 1) !== 0) }, marks: {  } };
                if (!fire({ m: v_m, x: v_x, R: v_R, k0: v_k0, t: v_t, E: v_E.slice() }, facts, _says)) return 1;
              }
              cands.fill(-1);
            }
          }
        }
      }
    }
  }
  return fired;
}
