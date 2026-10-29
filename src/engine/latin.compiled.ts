// Compiled by `npm run describe` from src/engine/latin.description.json: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, STRIKE, least, minus, popcount, setOf, valuesOf } from "./describe-runtime.ts";

export interface PlacedBinding {
  c: number;
  L: number;
  p: number;
}

export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding>): number {
  const facts: number[] = [];
  if (!(b.known(v_c))) return 0;
  const _a7 = setOf(sp.colOf[v_c], sp.rowOf[v_c]);
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_L = _a7[_i8];
    const _a9 = sp.lineCells[v_L];
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_p = _a9[_i10];
      if (!(((v_p !== v_c) && b.has(v_p, b.value(v_c))))) continue;
      facts.length = 0;
      const _t11 = b.value(v_c);
      if (b.has(v_p, _t11)) facts.push(STRIKE, v_p, _t11);
      if (!(true)) return -1;
      if (facts.length > 0) fire({ c: v_c, L: v_L, p: v_p }, facts);
    }
  }
  return 0;
}

export interface HiddenSingleBinding {
  u: number;
  d: number;
  n: number;
}

export function hiddenSingle(b: Marks, sp: GridSpace, fire: Fire<HiddenSingleBinding>): number {
  const facts: number[] = [];
  const _a24 = sp.units;
  for (let _i25 = 0; _i25 < _a24.length; _i25++) {
    const v_u = _a24[_i25];
    for (let _m26 = b.domain; _m26 !== 0; _m26 &= _m26 - 1) {
      const v_d = 31 - Math.clz32(_m26 & -_m26);
      let _q27 = false;
      Q28: {
        const _a29 = sp.lineCells[v_u];
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_c = _a29[_i30];
          if ((b.value(v_c) === v_d)) {
            _q27 = true;
            break Q28;
          }
        }
      }
      if (!(!(_q27))) continue;
      let _g31 = 0;
      G32: {
        const _a33 = sp.lineCells[v_u];
        for (let _i34 = 0; _i34 < _a33.length; _i34++) {
          const v_c = _a33[_i34];
          if (!(b.has(v_c, v_d))) continue;
          _g31++;
        }
      }
      L35: {
        const v_n = _g31;
        if (!((v_n < 2))) break L35;
        facts.length = 0;
        let _c41 = (v_n === 1);
        if (_c41) {
          let _g36 = -1;
          let _n38 = 0;
          G37: {
            const _a39 = sp.lineCells[v_u];
            for (let _i40 = 0; _i40 < _a39.length; _i40++) {
              const v_c = _a39[_i40];
              if (!(b.has(v_c, v_d))) continue;
              if (++_n38 === 2) {
                _g36 = -1;
                break G37;
              }
              _g36 = v_c;
            }
          }
          if (!b.known(_g36)) facts.push(PLACE, _g36, v_d);
          _c41 = true;
        }
        if (!(_c41)) return -1;
        if (facts.length > 0) {
          fire({ u: v_u, d: v_d, n: v_n }, facts);
          return 1;
        }
      }
    }
  }
  return 0;
}

export interface SingleBinding {
  L: number;
  c: number;
}

export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding>): number {
  const facts: number[] = [];
  const _a46 = sp.cols;
  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
    const v_L = _a46[_i47];
    const _a48 = sp.lineCells[v_L];
    for (let _i49 = 0; _i49 < _a48.length; _i49++) {
      const v_c = _a48[_i49];
      if (!((!(b.known(v_c)) && (popcount(b.cand(v_c)) < 2)))) continue;
      facts.length = 0;
      let _c51 = (popcount(b.cand(v_c)) === 1);
      if (_c51) {
        const _t50 = least(b.cand(v_c));
        if (!b.known(v_c)) facts.push(PLACE, v_c, _t50);
        _c51 = true;
      }
      if (!(_c51)) return -1;
      if (facts.length > 0) {
        fire({ L: v_L, c: v_c }, facts);
        return 1;
      }
    }
  }
  return 0;
}

export interface SetBinding {
  u: number;
  V: number;
  T: number;
  S: readonly number[];
}

export function set(b: Marks, sp: GridSpace, fire: Fire<SetBinding>): number {
  const facts: number[] = [];
  const _a84 = sp.units;
  for (let _i85 = 0; _i85 < _a84.length; _i85++) {
    const v_u = _a84[_i85];
    let _g86 = 0;
    G87: {
      for (let _m93 = b.domain; _m93 !== 0; _m93 &= _m93 - 1) {
        const v_d = 31 - Math.clz32(_m93 & -_m93);
        let _q94 = false;
        Q95: {
          const _a96 = sp.lineCells[v_u];
          for (let _i97 = 0; _i97 < _a96.length; _i97++) {
            const v_c = _a96[_i97];
            if ((b.value(v_c) === v_d)) {
              _q94 = true;
              break Q95;
            }
          }
        }
        if (!(!(_q94))) continue;
        _g86 |= 1 << v_d;
      }
    }
    const v_V = _g86;
    const _e98 = valuesOf(v_V);
    for (let _k99 = 0; _k99 < 1 << _e98.length; _k99++) {
      let v_T = 0;
      for (let _j100 = 0; _j100 < _e98.length; _j100++) if ((_k99 >> (_e98.length - 1 - _j100)) & 1) v_T |= 1 << _e98[_j100];
      if (!(((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (popcount(v_V) - 2)))))) continue;
      const _g101: number[] = [];
      G102: {
        const _a109 = sp.lineCells[v_u];
        for (let _i110 = 0; _i110 < _a109.length; _i110++) {
          const v_c = _a109[_i110];
          let _c114 = !(b.known(v_c));
          if (_c114) {
            let _q111 = false;
            Q112: {
              for (let _m113 = v_T; _m113 !== 0; _m113 &= _m113 - 1) {
                const v_d = 31 - Math.clz32(_m113 & -_m113);
                if (b.has(v_c, v_d)) {
                  _q111 = true;
                  break Q112;
                }
              }
            }
            _c114 = !(_q111);
          }
          if (!(_c114)) continue;
          _g101.push(v_c);
        }
      }
      L115: {
        const v_S = _g101;
        if (!((v_S.length >= (popcount(v_V) - popcount(v_T))))) break L115;
        facts.length = 0;
        let _c120 = (popcount(v_T) > 0);
        if (!_c120) {
          let _q116 = true;
          Q117: {
            const _a118 = sp.lineCells[v_u];
            for (let _i119 = 0; _i119 < _a118.length; _i119++) {
              const v_c = _a118[_i119];
              if (!((popcount(b.cand(v_c)) > 0))) {
                _q116 = false;
                break Q117;
              }
            }
          }
          _c120 = _q116;
        }
        let _c126 = (_c120 && (v_S.length === (popcount(v_V) - popcount(v_T))));
        if (_c126) {
          let _q121 = true;
          Q122: {
            const _a123 = sp.lineCells[v_u];
            for (let _i124 = 0; _i124 < _a123.length; _i124++) {
              const v_c = _a123[_i124];
              if (!((!(b.known(v_c)) && !(v_S.includes(v_c))))) continue;
              for (let _m125 = (v_V & ~v_T); _m125 !== 0; _m125 &= _m125 - 1) {
                const v_d = 31 - Math.clz32(_m125 & -_m125);
                if (!(b.has(v_c, v_d))) continue;
                if (b.has(v_c, v_d)) facts.push(STRIKE, v_c, v_d);
                if (!(true)) {
                  _q121 = false;
                  break Q122;
                }
              }
            }
          }
          _c126 = _q121;
        }
        if (!(_c126)) return -1;
        if (facts.length > 0) {
          fire({ u: v_u, V: v_V, T: v_T, S: v_S }, facts);
          return 1;
        }
      }
    }
  }
  return 0;
}

export interface FishBinding {
  d: number;
  X0: readonly number[];
  Y0: readonly number[];
  T: readonly number[];
  X: readonly number[];
}

export function fish(b: Marks, sp: GridSpace, fire: Fire<FishBinding>): number {
  const facts: number[] = [];
  for (let _m174 = b.domain; _m174 !== 0; _m174 &= _m174 - 1) {
    const v_d = 31 - Math.clz32(_m174 & -_m174);
    const _g175: number[] = [];
    G176: {
      const _a183 = sp.cols;
      for (let _i184 = 0; _i184 < _a183.length; _i184++) {
        const v_L = _a183[_i184];
        let _q185 = false;
        Q186: {
          const _a187 = sp.lineCells[v_L];
          for (let _i188 = 0; _i188 < _a187.length; _i188++) {
            const v_c = _a187[_i188];
            if ((b.value(v_c) === v_d)) {
              _q185 = true;
              break Q186;
            }
          }
        }
        if (!(!(_q185))) continue;
        _g175.push(v_L);
      }
    }
    const v_X0 = _g175;
    const _g189: number[] = [];
    G190: {
      const _a197 = sp.rows;
      for (let _i198 = 0; _i198 < _a197.length; _i198++) {
        const v_R = _a197[_i198];
        let _q199 = false;
        Q200: {
          const _a201 = sp.lineCells[v_R];
          for (let _i202 = 0; _i202 < _a201.length; _i202++) {
            const v_c = _a201[_i202];
            if ((b.value(v_c) === v_d)) {
              _q199 = true;
              break Q200;
            }
          }
        }
        if (!(!(_q199))) continue;
        _g189.push(v_R);
      }
    }
    const v_Y0 = _g189;
    const _e203 = v_Y0;
    for (let _k204 = 0; _k204 < 1 << _e203.length; _k204++) {
      const v_T: number[] = [];
      for (let _j205 = 0; _j205 < _e203.length; _j205++) if ((_k204 >> (_e203.length - 1 - _j205)) & 1) v_T.push(_e203[_j205]);
      if (!(((v_T.length === 0) || ((2 <= v_T.length) && (v_T.length <= (v_X0.length - 2)))))) continue;
      const _g206: number[] = [];
      G207: {
        const _a214 = v_X0;
        for (let _i215 = 0; _i215 < _a214.length; _i215++) {
          const v_L = _a214[_i215];
          let _q216 = false;
          Q217: {
            const _a218 = sp.lineCells[v_L];
            for (let _i219 = 0; _i219 < _a218.length; _i219++) {
              const v_c = _a218[_i219];
              if (((v_T.includes(sp.rowOf[v_c])) && b.has(v_c, v_d))) {
                _q216 = true;
                break Q217;
              }
            }
          }
          if (!(!(_q216))) continue;
          _g206.push(v_L);
        }
      }
      L220: {
        const v_X = _g206;
        if (!((v_X.length >= (v_X0.length - v_T.length)))) break L220;
        facts.length = 0;
        let _c229 = (v_T.length > 0);
        if (!_c229) {
          let _q221 = true;
          Q222: {
            const _a223 = sp.cols;
            for (let _i224 = 0; _i224 < _a223.length; _i224++) {
              const v_L = _a223[_i224];
              let _q225 = false;
              Q226: {
                const _a227 = sp.lineCells[v_L];
                for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                  const v_c = _a227[_i228];
                  if (b.has(v_c, v_d)) {
                    _q225 = true;
                    break Q226;
                  }
                }
              }
              if (!(_q225)) {
                _q221 = false;
                break Q222;
              }
            }
          }
          _c229 = _q221;
        }
        let _c236 = (_c229 && (v_X.length === (v_X0.length - v_T.length)));
        if (_c236) {
          let _q230 = true;
          Q231: {
            const _a232 = minus(v_X0, v_X);
            for (let _i233 = 0; _i233 < _a232.length; _i233++) {
              const v_L = _a232[_i233];
              const _a234 = sp.lineCells[v_L];
              for (let _i235 = 0; _i235 < _a234.length; _i235++) {
                const v_c = _a234[_i235];
                if (!(((minus(v_Y0, v_T).includes(sp.rowOf[v_c])) && b.has(v_c, v_d)))) continue;
                if (b.has(v_c, v_d)) facts.push(STRIKE, v_c, v_d);
                if (!(true)) {
                  _q230 = false;
                  break Q231;
                }
              }
            }
          }
          _c236 = _q230;
        }
        if (!(_c236)) return -1;
        if (facts.length > 0) {
          fire({ d: v_d, X0: v_X0, Y0: v_Y0, T: v_T, X: v_X }, facts);
          return 1;
        }
      }
    }
  }
  return 0;
}

export interface WingBinding {
  m: number;
  x: number;
  R: number;
  k0: number;
  t: number;
  E: readonly number[];
}

export function wing(b: Marks, sp: GridSpace, fire: Fire<WingBinding>): number {
  const facts: number[] = [];
  const _a282 = sp.cells;
  for (let _i283 = 0; _i283 < _a282.length; _i283++) {
    const v_m = _a282[_i283];
    if (!(!(b.known(v_m)))) continue;
    for (let _m284 = b.domain; _m284 !== 0; _m284 &= _m284 - 1) {
      const v_x = 31 - Math.clz32(_m284 & -_m284);
      L285: {
        const v_R = (b.cand(v_m) & ~((1 << v_x)));
        let _c293 = (popcount(v_R) >= 1);
        if (_c293) {
          let _q286 = true;
          Q287: {
            for (let _m288 = v_R; _m288 !== 0; _m288 &= _m288 - 1) {
              const v_a = 31 - Math.clz32(_m288 & -_m288);
              let _q289 = false;
              Q290: {
                const _a291 = sp.peers[v_m];
                for (let _i292 = 0; _i292 < _a291.length; _i292++) {
                  const v_k = _a291[_i292];
                  if ((!(b.known(v_k)) && (b.cand(v_k) === ((1 << v_a) | (1 << v_x))))) {
                    _q289 = true;
                    break Q290;
                  }
                }
              }
              if (!(_q289)) {
                _q286 = false;
                break Q287;
              }
            }
          }
          _c293 = _q286;
        }
        if (!(_c293)) break L285;
        const _a294 = sp.peers[v_m];
        for (let _i295 = 0; _i295 < _a294.length; _i295++) {
          const v_k0 = _a294[_i295];
          let _c299 = !(b.known(v_k0));
          if (_c299) {
            let _g296 = -1;
            G297: {
              for (let _m298 = v_R; _m298 !== 0; _m298 &= _m298 - 1) {
                const v_a = 31 - Math.clz32(_m298 & -_m298);
                if (_g296 === -1 || v_a < _g296) _g296 = v_a;
              }
            }
            _c299 = (b.cand(v_k0) === ((1 << _g296) | (1 << v_x)));
          }
          if (!(_c299)) continue;
          const _a300 = sp.peers[v_k0];
          for (let _i301 = 0; _i301 < _a300.length; _i301++) {
            const v_t = _a300[_i301];
            let _c309 = ((((v_t !== v_m) && !(b.known(v_t))) && b.has(v_t, v_x)) && (!b.has(v_m, v_x) || (sp.peers[v_m].includes(v_t))));
            if (_c309) {
              let _q302 = true;
              Q303: {
                for (let _m304 = v_R; _m304 !== 0; _m304 &= _m304 - 1) {
                  const v_a = 31 - Math.clz32(_m304 & -_m304);
                  let _q305 = false;
                  Q306: {
                    const _a307 = sp.peers[v_m];
                    for (let _i308 = 0; _i308 < _a307.length; _i308++) {
                      const v_k = _a307[_i308];
                      if ((((!(b.known(v_k)) && (b.cand(v_k) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k)))) {
                        _q305 = true;
                        break Q306;
                      }
                    }
                  }
                  if (!(_q305)) {
                    _q302 = false;
                    break Q303;
                  }
                }
              }
              _c309 = _q302;
            }
            if (!(_c309)) continue;
            const _g310: number[] = [];
            G311: {
              for (let _m319 = v_R; _m319 !== 0; _m319 &= _m319 - 1) {
                const v_a = 31 - Math.clz32(_m319 & -_m319);
                const _g320: number[] = [];
                G321: {
                  const _a324 = sp.peers[v_m];
                  for (let _i325 = 0; _i325 < _a324.length; _i325++) {
                    const v_k = _a324[_i325];
                    if (!((((!(b.known(v_k)) && (b.cand(v_k) === ((1 << v_a) | (1 << v_x)))) && (v_k !== v_t)) && (sp.peers[v_t].includes(v_k))))) continue;
                    _g320.push(v_k);
                  }
                }
                const _t326 = (_g320.length > 0 ? _g320[0] : -1);
                if (!_g310.includes(_t326)) _g310.push(_t326);
              }
            }
            const v_E = _g310;
            facts.length = 0;
            if (b.has(v_t, v_x)) facts.push(STRIKE, v_t, v_x);
            if (!(true)) return -1;
            if (facts.length > 0) {
              fire({ m: v_m, x: v_x, R: v_R, k0: v_k0, t: v_t, E: v_E }, facts);
              return 1;
            }
          }
        }
      }
    }
  }
  return 0;
}
