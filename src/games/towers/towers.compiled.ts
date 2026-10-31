// Compiled by `npm run describe` from src/games/towers/towers.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, popcount, rangeMask } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, and its clues by kind. */
export interface Dealt {
  sees: ClueList;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "facing" | "bounds" | "latin.hiddenSingle" | "latin.single" | "arrangement" | "latin.set" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, and the cap from which it no longer
 * runs where it has one, in the order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; until?: number }[] = [
  { id: "facing", tier: 0 },
  { id: "bounds", tier: 0 },
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "arrangement", tier: 1 },
  { id: "latin.set", tier: 1 },
  { id: "latin.fish", tier: 2 },
  { id: "latin.wing", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Hard","Extreme","Unreasonable"];

export interface FacingBinding {
  P: readonly number[];
}

const facingFacts: number[] = [];
let facingCands = new Int32Array(0);

export function facing(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FacingBinding> | null): number {
  const _g8: number[] = [];
  const facts = facingFacts;
  let fired = 0;
  let changed = false;
  const _h16 = (sp.w + 1);
  if (facingCands.length < sp.cells.length) facingCands = new Int32Array(sp.cells.length);
  const cands = facingCands;
  cands.fill(-1);
  _g8.length = 0;
  G9: {
    const _a12 = sp.slots;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_s = _a12[_i13];
      const _h14 = clueAt(cl.sees, v_s);
      const _h15 = clueAt(cl.sees, sp.opposite[v_s]);
      if (!(((_i13 < sp.opposite[v_s]) && ((_h14 + _h15) === _h16)))) continue;
      _g8.push(v_s);
    }
  }
  L17: {
    const v_P = _g8;
    const _h18 = v_P.length;
    if (!((_h18 > 0))) break L17;
    facts.length = 0;
    changed = false;
    let _q19 = true;
    Q20: {
      const _a21 = v_P;
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_s = _a21[_i22];
        const _h23 = clueAt(cl.sees, v_s);
        const v_c = (sp.sight[v_s][(_h23 - 1)] ?? -1);
        let _c25 = b.has(v_c, sp.w);
        if (_c25) {
          const _t24 = sp.w;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t24); changed = true; } else facts.push(PLACE, v_c, _t24); }
          _c25 = true;
        }
        if (!(_c25)) {
          _q19 = false;
          break Q20;
        }
      }
    }
    if (!(_q19)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ P: v_P }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface BoundsBinding {
  k: number;
  s: number;
  v: number;
  L: readonly number[];
  c0: number;
  P: number;
  R: number;
  near: boolean;
}

const boundsFacts: number[] = [];
let boundsCands = new Int32Array(0);

export function bounds(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BoundsBinding> | null): number {
  const facts = boundsFacts;
  let fired = 0;
  let changed = false;
  const _h110 = rangeMask(0, sp.w);
  const _h198 = (sp.w + 1);
  if (boundsCands.length < sp.cells.length) boundsCands = new Int32Array(sp.cells.length);
  const cands = boundsCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.sees.at.length; v_k++) {
    const v_s = cl.sees.at[v_k];
    const v_v = cl.sees.v[v_k];
    const v_L = sp.sight[v_s];
    const v_c0 = (v_L.length > 0 ? v_L[0] : -1);
    let _g84 = 0;
    G85: {
      const _a88 = v_L;
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_c = _a88[_i89];
        const _h90 = b.known(v_c);
        const _h91 = b.value(v_c);
        if (!(_h90)) continue;
        _g84 |= 1 << _h91;
      }
    }
    const v_P = _g84;
    let _g92 = 0;
    G93: {
      for (let _m95 = b.domain; _m95 !== 0; _m95 &= _m95 - 1) {
        const v_h = 31 - Math.clz32(_m95 & -_m95);
        if (!(((rangeMask(v_h, sp.w) & ~v_P) === 0))) continue;
        _g92 |= 1 << v_h;
      }
    }
    const v_R = _g92;
    let _g96 = 0;
    G97: {
      const _a98 = v_L;
      for (let _i99 = 0; _i99 < _a98.length; _i99++) {
        const v_c = _a98[_i99];
        const _h100 = b.value(v_c);
        let _c107 = (((v_R >> _h100) & 1) !== 0);
        if (_c107) {
          let _q101 = true;
          Q102: {
            const _a103 = v_L;
            const _n104 = _i99;
            for (let _i105 = 0; _i105 < _n104; _i105++) {
              const v_c2 = _a103[_i105];
              const _h106 = b.value(v_c2);
              if (!((_h106 < _h100))) {
                _q101 = false;
                break Q102;
              }
            }
          }
          _c107 = _q101;
        }
        if (!(_c107)) continue;
        _g96++;
      }
    }
    let _c113 = (v_v === (_g96 + 1));
    if (_c113) {
      let _g108 = -1;
      G109: {
        for (let _m111 = _h110; _m111 !== 0; _m111 &= _m111 - 1) {
          const v_i = 31 - Math.clz32(_m111 & -_m111);
          const _h112 = b.value((v_L[v_i] ?? -1));
          if (!(((v_i === sp.w) || (((v_R >> _h112) & 1) !== 0)))) continue;
          if (_g108 === -1 || v_i < _g108) _g108 = v_i;
        }
      }
      _c113 = (_g108 > 1);
    }
    let _c149 = _c113;
    if (_c149) {
      let _g130 = -1;
      G131: {
        for (let _m132 = _h110; _m132 !== 0; _m132 &= _m132 - 1) {
          const v_i = 31 - Math.clz32(_m132 & -_m132);
          const _h133 = b.value((v_L[v_i] ?? -1));
          if (!(((v_i === sp.w) || (((v_R >> _h133) & 1) !== 0)))) continue;
          if (_g130 === -1 || v_i < _g130) _g130 = v_i;
        }
      }
      let _g134 = 0;
      G135: {
        const _a138 = v_L;
        for (let _i139 = 0; _i139 < _a138.length; _i139++) {
          const v_c = _a138[_i139];
          const _h140 = b.known(v_c);
          const _h141 = b.value(v_c);
          if (!((_h140 && (_i139 >= _g130)))) continue;
          _g134 |= 1 << _h141;
        }
      }
      const _t142 = (b.domain & ~_g134);
      const _t143 = (_g130 - 1);
      let _g144 = 0;
      G145: {
        for (let _m147 = _t142; _m147 !== 0; _m147 &= _m147 - 1) {
          const v_h = 31 - Math.clz32(_m147 & -_m147);
          const _h148 = popcount((_t142 & ~rangeMask(v_h, sp.w)));
          if (!((_h148 < _t143))) continue;
          _g144 |= 1 << v_h;
        }
      }
      _c149 = ((_g144 & (cands[v_c0] >= 0 ? cands[v_c0] : (cands[v_c0] = b.cand(v_c0)))) !== 0);
    }
    const v_near = _c149;
    facts.length = 0;
    changed = false;
    let _c172 = !(v_near);
    if (!_c172) {
      let _q150 = true;
      Q151: {
        let _g152 = -1;
        G153: {
          for (let _m154 = _h110; _m154 !== 0; _m154 &= _m154 - 1) {
            const v_i = 31 - Math.clz32(_m154 & -_m154);
            const _h155 = b.value((v_L[v_i] ?? -1));
            if (!(((v_i === sp.w) || (((v_R >> _h155) & 1) !== 0)))) continue;
            if (_g152 === -1 || v_i < _g152) _g152 = v_i;
          }
        }
        let _g156 = 0;
        G157: {
          const _a160 = v_L;
          for (let _i161 = 0; _i161 < _a160.length; _i161++) {
            const v_c = _a160[_i161];
            const _h162 = b.known(v_c);
            const _h163 = b.value(v_c);
            if (!((_h162 && (_i161 >= _g152)))) continue;
            _g156 |= 1 << _h163;
          }
        }
        const _t164 = (b.domain & ~_g156);
        const _t165 = (_g152 - 1);
        let _g166 = 0;
        G167: {
          for (let _m169 = _t164; _m169 !== 0; _m169 &= _m169 - 1) {
            const v_h = 31 - Math.clz32(_m169 & -_m169);
            const _h170 = popcount((_t164 & ~rangeMask(v_h, sp.w)));
            if (!((_h170 < _t165))) continue;
            _g166 |= 1 << v_h;
          }
        }
        for (let _m171 = _g166; _m171 !== 0; _m171 &= _m171 - 1) {
          const v_h = 31 - Math.clz32(_m171 & -_m171);
          if (b.has(v_c0, v_h)) { if (fire === null) { b.strikeAt(v_c0, v_h); changed = true; } else facts.push(STRIKE, v_c0, v_h); }
          if (!(true)) {
            _q150 = false;
            break Q151;
          }
        }
      }
      _c172 = _q150;
    }
    let _c204 = _c172;
    if (_c204) {
      let _c203 = v_near;
      if (!_c203) {
        let _q173 = true;
        Q174: {
          let _g175 = 0;
          G176: {
            const _a185 = v_L;
            for (let _i186 = 0; _i186 < _a185.length; _i186++) {
              const v_c = _a185[_i186];
              const _h187 = b.known(v_c);
              const _h194 = (b.value(v_c) + 1);
              const _h196 = b.value(v_c);
              let _c195 = _h187;
              if (_c195) {
                let _q188 = false;
                Q189: {
                  const _a190 = v_L;
                  const _n191 = _i186;
                  for (let _i192 = 0; _i192 < _n191; _i192++) {
                    const v_c2 = _a190[_i192];
                    const _h193 = b.value(v_c2);
                    if ((_h193 > _h194)) {
                      _q188 = true;
                      break Q189;
                    }
                  }
                }
                _c195 = !(_q188);
              }
              if (!(_c195)) continue;
              _g175 |= 1 << _h196;
            }
          }
          const v_K = ((b.domain & ~v_P) | _g175);
          for (let _m197 = b.domain; _m197 !== 0; _m197 &= _m197 - 1) {
            const v_i = 31 - Math.clz32(_m197 & -_m197);
            L199: {
              const v_h = (_h198 - v_i);
              const _h200 = popcount((v_K & ~rangeMask(1, v_h)));
              if (!((((v_K >> v_h) & 1) !== 0))) break L199;
              for (let _m201 = rangeMask(0, ((v_v - _h200) - 2)); _m201 !== 0; _m201 &= _m201 - 1) {
                const v_j = 31 - Math.clz32(_m201 & -_m201);
                const _t202 = (v_L[v_j] ?? -1);
                if (b.has(_t202, v_h)) { if (fire === null) { b.strikeAt(_t202, v_h); changed = true; } else facts.push(STRIKE, _t202, v_h); }
                if (!(true)) {
                  _q173 = false;
                  break Q174;
                }
              }
            }
          }
        }
        _c203 = _q173;
      }
      _c204 = _c203;
    }
    if (!(_c204)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, s: v_s, v: v_v, L: v_L, c0: v_c0, P: v_P, R: v_R, near: v_near }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface ArrangementBinding {
  k: number;
  s: number;
  v: number;
  L: readonly number[];
  c: number;
}

const arrangementFacts: number[] = [];
let arrangementCands = new Int32Array(0);

export function arrangement(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ArrangementBinding> | null): number {
  const _p212 = new Int32Array(sp.cells.length);
  let _l213: readonly number[] = [];
  let _y214 = false;
  const _f218 = new Int32Array(sp.cells.length).fill(-1);
  let _l219: readonly number[] = [];
  const _s220: number[] = [];
  const facts = arrangementFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (arrangementCands.length < sp.cells.length) arrangementCands = new Int32Array(sp.cells.length);
  const cands = arrangementCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.sees.at.length; v_k++) {
    const v_s = cl.sees.at[v_k];
    const v_v = cl.sees.v[v_k];
    const v_L = sp.sight[v_s];
    let _g215 = -1;
    const _a207 = v_L;
    for (let _i208 = 0; _i208 < _a207.length; _i208++) {
      const v_c = _a207[_i208];
      facts.length = 0;
      changed = false;
      let _q209 = true;
      Q210: {
        for (let _m211 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m211 !== 0; _m211 &= _m211 - 1) {
          const v_d = 31 - Math.clz32(_m211 & -_m211);
          if (_g215 !== _epoch) {
            _g215 = _epoch;
            for (const _e216 of _l213) _p212[_e216] = 0;
            _y214 = false;
            const _a217 = v_L;
            for (const _e221 of _l219) _f218[_e221] = -1;
            _l219 = _a217;
            let _i223 = 0;
            _s220[0] = 0;
            let _o227 = _a217.length === 0;
            for (;;) {
              if (_a217.length === 0) {
                if (!_o227) break;
                _o227 = false;
              }
              while (_a217.length > 0 && _i223 >= 0) {
                const _e221 = _a217[_i223];
                if (_s220[_i223] > 0) _f218[_e221] = -1;
                let _r226 = (cands[_e221] >= 0 ? cands[_e221] : (cands[_e221] = b.cand(_e221))) & ~((2 << _s220[_i223]) - 1);
                let _d222 = 0;
                for (; _r226 !== 0; _r226 &= _r226 - 1) {
                  _d222 = 31 - Math.clz32(_r226 & -_r226);
                  _f218[_e221] = _d222;
                  if (true) { let _j224 = 0; while (_j224 < _i223 && !(_f218[_a217[_j224]] === _d222 && true)) _j224++; if (_j224 < _i223) continue; }
                  break;
                }
                if (_r226 === 0) {
                  _s220[_i223] = 0;
                  _i223--;
                  continue;
                }
                _s220[_i223] = _d222;
                if (_i223 === _a217.length - 1) break;
                _i223++;
                _s220[_i223] = 0;
              }
              if (_i223 < 0) break;
              let _g228 = 0;
              G229: {
                const _a230 = v_L;
                for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                  const v_c = _a230[_i231];
                  let _q232 = true;
                  Q233: {
                    const _a234 = v_L;
                    const _n235 = _i231;
                    for (let _i236 = 0; _i236 < _n235; _i236++) {
                      const v_c2 = _a234[_i236];
                      if (!((_f218[v_c2] < _f218[v_c]))) {
                        _q232 = false;
                        break Q233;
                      }
                    }
                  }
                  if (!(_q232)) continue;
                  _g228++;
                }
              }
              if (!((_g228 === v_v))) continue;
              _l213 = _a217;
              _y214 = true;
              for (const _e216 of _a217) _p212[_e216] |= 1 << _f218[_e216];
            }
          }
          if (!(!(((((_p212[v_c] >> v_d) & 1) !== 0) || (v_d === -1 && _y214 && !v_L.includes(v_c)))))) continue;
          if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q209 = false;
            break Q210;
          }
        }
      }
      if (!(_q209)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, s: v_s, v: v_v, L: v_L, c: v_c }, facts)) return 1;
        cands.fill(-1);
        _epoch++;
      }
    }
  }
  return fired;
}
