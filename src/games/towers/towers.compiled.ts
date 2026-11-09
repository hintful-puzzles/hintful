// Compiled by `npm run describe` from src/games/towers/towers.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, popcount, rangeMask } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  sees: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "facing" | "bounds" | "latin.hiddenSingle" | "latin.single" | "arrangement" | "latin.set" | "latin.fish" | "latin.wing";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "latin.placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "latin.placed" },
];

/** Every technique run as a value is struck from a cell, by id. */
export type StrikingId = never;

/** The techniques run as a value is struck from a cell, in the
 * description's order, each with the variation that adds it where one
 * does. */
export const striking: readonly { id: StrikingId; variation?: string }[] = [
];

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, the cap from which it no longer runs where it has one, and the
 * variation that adds it where one does, in the order the description
 * lists them, a variation's before the first of a higher tier. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [
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
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q236 = true;
  const _n240 = new Int32Array(32);
  Q237: for (const _u238 of sp.lines) {
    _n240.fill(0);
    for (const _c239 of sp.lineCells[_u238]) {
      const _t241 = (g[_c239] || -1);
      if (++_n240[_t241] > 1) {
        _q236 = false;
        break Q237;
      }
    }
  }
  if (!(_q236)) return false;
  for (let _k242 = 0; _k242 < cl.sees.at.length; _k242++) {
    const _at243 = cl.sees.at[_k242];
    const _v244 = cl.sees.v[_k242];
    let _g245 = 0;
    G246: {
      const _a247 = sp.sight[_at243];
      for (let _i248 = 0; _i248 < _a247.length; _i248++) {
        const v_c = _a247[_i248];
        const _h255 = (g[v_c] || -1);
        let _q249 = true;
        Q250: {
          const _a251 = sp.sight[_at243];
          const _n252 = _i248;
          for (let _i253 = 0; _i253 < _n252; _i253++) {
            const v_c2 = _a251[_i253];
            const _h254 = (g[v_c2] || -1);
            if (!((_h254 < _h255))) {
              _q249 = false;
              break Q250;
            }
          }
        }
        if (!(_q249)) continue;
        _g245++;
      }
    }
    if (!((_g245 === _v244))) return false;
  }
  return true;
}

export interface FacingBinding {
  P: readonly number[];
}

const facingFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function facing(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FacingBinding> | null): number {
  const _g8: number[] = [];
  const facts = facingFacts;
  let fired = 0;
  let changed = false;
  const _h16 = (sp.w + 1);
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
        let _c25: boolean = (((b.cands[v_c] >> sp.w) & 1) !== 0);
        if (_c25) {
          const _t24 = sp.w;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t24); changed = true; } else facts.push(PLACE, v_c, _t24); }
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
      if (fire !== null && !fire({ P: v_P.slice() }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function bounds(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BoundsBinding> | null): number {
  const facts = boundsFacts;
  let fired = 0;
  let changed = false;
  const _h197 = (sp.w + 1);
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
        const _h90 = (b.grid[v_c] !== 0);
        if (!(_h90)) continue;
        const _h91 = (b.grid[v_c] || -1);
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
        const _h100 = (b.grid[v_c] || -1);
        let _c107: boolean = (((v_R >> _h100) & 1) !== 0);
        if (_c107) {
          let _q101 = true;
          Q102: {
            const _a103 = v_L;
            const _n104 = _i99;
            for (let _i105 = 0; _i105 < _n104; _i105++) {
              const v_c2 = _a103[_i105];
              const _h106 = (b.grid[v_c2] || -1);
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
    let _c112: boolean = (v_v === (_g96 + 1));
    if (_c112) {
      let _g108 = -1;
      G109: {
        const _t110 = sp.w;
        for (let v_i = 0; v_i <= _t110; v_i++) {
          const _h111 = (b.grid[(v_L[v_i] ?? -1)] || -1);
          if (!(((v_i === sp.w) || (((v_R >> _h111) & 1) !== 0)))) continue;
          _g108 = v_i;
          break G109;
        }
      }
      _c112 = (_g108 > 1);
    }
    let _c148: boolean = _c112;
    if (_c148) {
      let _g129 = -1;
      G130: {
        const _t131 = sp.w;
        for (let v_i = 0; v_i <= _t131; v_i++) {
          const _h132 = (b.grid[(v_L[v_i] ?? -1)] || -1);
          if (!(((v_i === sp.w) || (((v_R >> _h132) & 1) !== 0)))) continue;
          _g129 = v_i;
          break G130;
        }
      }
      let _g133 = 0;
      G134: {
        const _a137 = v_L;
        for (let _i138 = 0; _i138 < _a137.length; _i138++) {
          const v_c = _a137[_i138];
          const _h139 = (b.grid[v_c] !== 0);
          if (!((_h139 && (_i138 >= _g129)))) continue;
          const _h140 = (b.grid[v_c] || -1);
          _g133 |= 1 << _h140;
        }
      }
      const _t141 = (b.domain & ~_g133);
      const _t142 = (_g129 - 1);
      let _g143 = 0;
      G144: {
        for (let _m146 = _t141; _m146 !== 0; _m146 &= _m146 - 1) {
          const v_h = 31 - Math.clz32(_m146 & -_m146);
          const _h147 = popcount((_t141 & ~rangeMask(v_h, sp.w)));
          if (!((_h147 < _t142))) continue;
          _g143 |= 1 << v_h;
        }
      }
      _c148 = ((_g143 & (cands[v_c0] >= 0 ? cands[v_c0] : (cands[v_c0] = b.cands[v_c0]))) !== 0);
    }
    const v_near = _c148;
    facts.length = 0;
    changed = false;
    let _c171: boolean = !(v_near);
    if (!_c171) {
      let _q149 = true;
      Q150: {
        let _g151 = -1;
        G152: {
          const _t153 = sp.w;
          for (let v_i = 0; v_i <= _t153; v_i++) {
            const _h154 = (b.grid[(v_L[v_i] ?? -1)] || -1);
            if (!(((v_i === sp.w) || (((v_R >> _h154) & 1) !== 0)))) continue;
            _g151 = v_i;
            break G152;
          }
        }
        let _g155 = 0;
        G156: {
          const _a159 = v_L;
          for (let _i160 = 0; _i160 < _a159.length; _i160++) {
            const v_c = _a159[_i160];
            const _h161 = (b.grid[v_c] !== 0);
            if (!((_h161 && (_i160 >= _g151)))) continue;
            const _h162 = (b.grid[v_c] || -1);
            _g155 |= 1 << _h162;
          }
        }
        const _t163 = (b.domain & ~_g155);
        const _t164 = (_g151 - 1);
        let _g165 = 0;
        G166: {
          for (let _m168 = _t163; _m168 !== 0; _m168 &= _m168 - 1) {
            const v_h = 31 - Math.clz32(_m168 & -_m168);
            const _h169 = popcount((_t163 & ~rangeMask(v_h, sp.w)));
            if (!((_h169 < _t164))) continue;
            _g165 |= 1 << v_h;
          }
        }
        for (let _m170 = _g165; _m170 !== 0; _m170 &= _m170 - 1) {
          const v_h = 31 - Math.clz32(_m170 & -_m170);
          if ((((b.cands[v_c0] >> v_h) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c0, v_h); changed = true; } else facts.push(STRIKE, v_c0, v_h); }
          if (!(true)) {
            _q149 = false;
            break Q150;
          }
        }
      }
      _c171 = _q149;
    }
    let _c203: boolean = _c171;
    if (_c203) {
      let _c202: boolean = v_near;
      if (!_c202) {
        let _q172 = true;
        Q173: {
          let _g174 = 0;
          G175: {
            const _a184 = v_L;
            for (let _i185 = 0; _i185 < _a184.length; _i185++) {
              const v_c = _a184[_i185];
              const _h186 = (b.grid[v_c] !== 0);
              const _h193 = (b.grid[v_c] || -1);
              const _h194 = (_h193 + 1);
              let _c195: boolean = _h186;
              if (_c195) {
                let _q187 = false;
                Q188: {
                  const _a189 = v_L;
                  const _n190 = _i185;
                  for (let _i191 = 0; _i191 < _n190; _i191++) {
                    const v_c2 = _a189[_i191];
                    const _h192 = (b.grid[v_c2] || -1);
                    if ((_h192 > _h194)) {
                      _q187 = true;
                      break Q188;
                    }
                  }
                }
                _c195 = !(_q187);
              }
              if (!(_c195)) continue;
              _g174 |= 1 << _h193;
            }
          }
          const v_K = ((b.domain & ~v_P) | _g174);
          for (let _m196 = b.domain; _m196 !== 0; _m196 &= _m196 - 1) {
            const v_i = 31 - Math.clz32(_m196 & -_m196);
            L198: {
              const v_h = (_h197 - v_i);
              if (!((((v_K >> v_h) & 1) !== 0))) break L198;
              const _h199 = popcount((v_K & ~rangeMask(1, v_h)));
              const _t200 = ((v_v - _h199) - 2);
              for (let v_j = 0; v_j <= _t200; v_j++) {
                const _t201 = (v_L[v_j] ?? -1);
                if ((((b.cands[_t201] >> v_h) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t201, v_h); changed = true; } else facts.push(STRIKE, _t201, v_h); }
                if (!(true)) {
                  _q172 = false;
                  break Q173;
                }
              }
            }
          }
        }
        _c202 = _q172;
      }
      _c203 = _c202;
    }
    if (!(_c203)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, s: v_s, v: v_v, L: v_L.slice(), c0: v_c0, P: v_P, R: v_R, near: v_near }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function arrangement(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ArrangementBinding> | null): number {
  const _p211 = new Int32Array(sp.cells.length);
  let _l212: readonly number[] = [];
  let _y213 = false;
  const _f217 = new Int32Array(sp.cells.length).fill(-1);
  let _l218: readonly number[] = [];
  const _s219: number[] = [];
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
    let _g214 = -1;
    const _a206 = v_L;
    for (let _i207 = 0; _i207 < _a206.length; _i207++) {
      const v_c = _a206[_i207];
      facts.length = 0;
      changed = false;
      let _q208 = true;
      Q209: {
        for (let _m210 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m210 !== 0; _m210 &= _m210 - 1) {
          const v_d = 31 - Math.clz32(_m210 & -_m210);
          if (_g214 !== _epoch) {
            _g214 = _epoch;
            for (const _e215 of _l212) _p211[_e215] = 0;
            _y213 = false;
            const _a216 = v_L;
            for (const _e220 of _l218) _f217[_e220] = -1;
            _l218 = _a216;
            let _i222 = 0;
            _s219[0] = 0;
            let _o226 = _a216.length === 0;
            for (;;) {
              if (_a216.length === 0) {
                if (!_o226) break;
                _o226 = false;
              }
              while (_a216.length > 0 && _i222 >= 0) {
                const _e220 = _a216[_i222];
                if (_s219[_i222] > 0) _f217[_e220] = -1;
                let _r225 = (cands[_e220] >= 0 ? cands[_e220] : (cands[_e220] = b.cands[_e220])) & ~((2 << _s219[_i222]) - 1);
                let _d221 = 0;
                for (; _r225 !== 0; _r225 &= _r225 - 1) {
                  _d221 = 31 - Math.clz32(_r225 & -_r225);
                  _f217[_e220] = _d221;
                  if (true) { let _j223 = 0; while (_j223 < _i222 && !(_f217[_a216[_j223]] === _d221 && true)) _j223++; if (_j223 < _i222) continue; }
                  break;
                }
                if (_r225 === 0) {
                  _s219[_i222] = 0;
                  _i222--;
                  continue;
                }
                _s219[_i222] = _d221;
                if (_i222 === _a216.length - 1) break;
                _i222++;
                _s219[_i222] = 0;
              }
              if (_i222 < 0) break;
              let _g227 = 0;
              G228: {
                const _a229 = v_L;
                for (let _i230 = 0; _i230 < _a229.length; _i230++) {
                  const v_c = _a229[_i230];
                  let _q231 = true;
                  Q232: {
                    const _a233 = v_L;
                    const _n234 = _i230;
                    for (let _i235 = 0; _i235 < _n234; _i235++) {
                      const v_c2 = _a233[_i235];
                      if (!((_f217[v_c2] < _f217[v_c]))) {
                        _q231 = false;
                        break Q232;
                      }
                    }
                  }
                  if (!(_q231)) continue;
                  _g227++;
                }
              }
              if (!((_g227 === v_v))) continue;
              _l212 = _a216;
              _y213 = true;
              for (const _e215 of _a216) _p211[_e215] |= 1 << _f217[_e215];
            }
          }
          if (!(!(((((_p211[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y213 && !v_L.includes(v_c)))))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q208 = false;
            break Q209;
          }
        }
      }
      if (!(_q208)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, s: v_s, v: v_v, L: v_L.slice(), c: v_c }, facts)) return 1;
        cands.fill(-1);
        _epoch++;
      }
    }
  }
  return fired;
}
