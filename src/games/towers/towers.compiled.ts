// Compiled by `npm run describe` from src/games/towers/towers.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, freshBinding, popcount, rangeMask, sameSet, staleChecking } from "../../engine/describe-runtime.ts";

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
  let _q300 = true;
  const _n304 = new Int32Array(32);
  Q301: for (const _u302 of sp.lines) {
    _n304.fill(0);
    for (const _c303 of sp.lineCells[_u302]) {
      const _t305 = (g[_c303] || -1);
      if (++_n304[_t305] > 1) {
        _q300 = false;
        break Q301;
      }
    }
  }
  if (!(_q300)) return false;
  for (let _k306 = 0; _k306 < cl.sees.at.length; _k306++) {
    const _at307 = cl.sees.at[_k306];
    const _v308 = cl.sees.v[_k306];
    let _g309 = 0;
    G310: {
      const _a311 = sp.sight[_at307];
      for (let _i312 = 0; _i312 < _a311.length; _i312++) {
        const v_c = _a311[_i312];
        const _h319 = (g[v_c] || -1);
        let _q313 = true;
        Q314: {
          const _a315 = sp.sight[_at307];
          const _n316 = _i312;
          for (let _i317 = 0; _i317 < _n316; _i317++) {
            const v_c2 = _a315[_i317];
            const _h318 = (g[v_c2] || -1);
            if (!((_h318 < _h319))) {
              _q313 = false;
              break Q314;
            }
          }
        }
        if (!(_q313)) continue;
        _g309++;
      }
    }
    if (!((_g309 === _v308))) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      const _g19: number[] = [];
      G20: {
        const _a23 = sp.slots;
        for (let _i24 = 0; _i24 < _a23.length; _i24++) {
          const v_s = _a23[_i24];
          if (!(((_i24 < sp.opposite[v_s]) && ((clueAt(cl.sees, v_s) + clueAt(cl.sees, sp.opposite[v_s])) === (sp.w + 1))))) continue;
          _g19.push(v_s);
        }
      }
      freshBinding("facing", [sameSet(v_P, _g19), (v_P.length > 0)], ["P =", "where of P"]);
    }
    facts.length = 0;
    changed = false;
    let _q25 = true;
    Q26: {
      const _a27 = v_P;
      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
        const v_s = _a27[_i28];
        const _h29 = clueAt(cl.sees, v_s);
        const v_c = (sp.sight[v_s][(_h29 - 1)] ?? -1);
        let _c31: boolean = (((b.cands[v_c] >> sp.w) & 1) !== 0);
        if (_c31) {
          const _t30 = sp.w;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t30); changed = true; } else facts.push(PLACE, v_c, _t30); }
          _c31 = true;
        }
        if (!(_c31)) {
          _q25 = false;
          break Q26;
        }
      }
    }
    if (!(_q25)) return -1;
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
  const _h261 = (sp.w + 1);
  if (boundsCands.length < sp.cells.length) boundsCands = new Int32Array(sp.cells.length);
  const cands = boundsCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.sees.at.length; v_k++) {
    const v_s = cl.sees.at[v_k];
    const v_v = cl.sees.v[v_k];
    const v_L = sp.sight[v_s];
    const v_c0 = (v_L.length > 0 ? v_L[0] : -1);
    let _g90 = 0;
    G91: {
      const _a94 = v_L;
      for (let _i95 = 0; _i95 < _a94.length; _i95++) {
        const v_c = _a94[_i95];
        const _h96 = (b.grid[v_c] !== 0);
        if (!(_h96)) continue;
        const _h97 = (b.grid[v_c] || -1);
        _g90 |= 1 << _h97;
      }
    }
    const v_P = _g90;
    let _g98 = 0;
    G99: {
      for (let _m101 = b.domain; _m101 !== 0; _m101 &= _m101 - 1) {
        const v_h = 31 - Math.clz32(_m101 & -_m101);
        if (!(((rangeMask(v_h, sp.w) & ~v_P) === 0))) continue;
        _g98 |= 1 << v_h;
      }
    }
    const v_R = _g98;
    let _g102 = 0;
    G103: {
      const _a104 = v_L;
      for (let _i105 = 0; _i105 < _a104.length; _i105++) {
        const v_c = _a104[_i105];
        const _h106 = (b.grid[v_c] || -1);
        let _c113: boolean = (((v_R >> _h106) & 1) !== 0);
        if (_c113) {
          let _q107 = true;
          Q108: {
            const _a109 = v_L;
            const _n110 = _i105;
            for (let _i111 = 0; _i111 < _n110; _i111++) {
              const v_c2 = _a109[_i111];
              const _h112 = (b.grid[v_c2] || -1);
              if (!((_h112 < _h106))) {
                _q107 = false;
                break Q108;
              }
            }
          }
          _c113 = _q107;
        }
        if (!(_c113)) continue;
        _g102++;
      }
    }
    let _c118: boolean = (v_v === (_g102 + 1));
    if (_c118) {
      let _g114 = -1;
      G115: {
        const _t116 = sp.w;
        for (let v_i = 0; v_i <= _t116; v_i++) {
          const _h117 = (b.grid[(v_L[v_i] ?? -1)] || -1);
          if (!(((v_i === sp.w) || (((v_R >> _h117) & 1) !== 0)))) continue;
          _g114 = v_i;
          break G115;
        }
      }
      _c118 = (_g114 > 1);
    }
    let _c154: boolean = _c118;
    if (_c154) {
      let _g135 = -1;
      G136: {
        const _t137 = sp.w;
        for (let v_i = 0; v_i <= _t137; v_i++) {
          const _h138 = (b.grid[(v_L[v_i] ?? -1)] || -1);
          if (!(((v_i === sp.w) || (((v_R >> _h138) & 1) !== 0)))) continue;
          _g135 = v_i;
          break G136;
        }
      }
      let _g139 = 0;
      G140: {
        const _a143 = v_L;
        for (let _i144 = 0; _i144 < _a143.length; _i144++) {
          const v_c = _a143[_i144];
          const _h145 = (b.grid[v_c] !== 0);
          if (!((_h145 && (_i144 >= _g135)))) continue;
          const _h146 = (b.grid[v_c] || -1);
          _g139 |= 1 << _h146;
        }
      }
      const _t147 = (b.domain & ~_g139);
      const _t148 = (_g135 - 1);
      let _g149 = 0;
      G150: {
        for (let _m152 = _t147; _m152 !== 0; _m152 &= _m152 - 1) {
          const v_h = 31 - Math.clz32(_m152 & -_m152);
          const _h153 = popcount((_t147 & ~rangeMask(v_h, sp.w)));
          if (!((_h153 < _t148))) continue;
          _g149 |= 1 << v_h;
        }
      }
      _c154 = ((_g149 & (cands[v_c0] >= 0 ? cands[v_c0] : (cands[v_c0] = b.cands[v_c0]))) !== 0);
    }
    const v_near = _c154;
    if (import.meta.env.DEV && staleChecking) {
      let _g155 = 0;
      G156: {
        const _a159 = v_L;
        for (let _i160 = 0; _i160 < _a159.length; _i160++) {
          const v_c = _a159[_i160];
          if (!((b.grid[v_c] !== 0))) continue;
          const _t161 = (b.grid[v_c] || -1);
          _g155 |= 1 << _t161;
        }
      }
      let _g162 = 0;
      G163: {
        for (let _m165 = b.domain; _m165 !== 0; _m165 &= _m165 - 1) {
          const v_h = 31 - Math.clz32(_m165 & -_m165);
          if (!(((rangeMask(v_h, sp.w) & ~v_P) === 0))) continue;
          _g162 |= 1 << v_h;
        }
      }
      let _g166 = 0;
      G167: {
        const _a168 = v_L;
        for (let _i169 = 0; _i169 < _a168.length; _i169++) {
          const v_c = _a168[_i169];
          let _c175: boolean = (((v_R >> (b.grid[v_c] || -1)) & 1) !== 0);
          if (_c175) {
            let _q170 = true;
            Q171: {
              const _a172 = v_L;
              const _n173 = _i169;
              for (let _i174 = 0; _i174 < _n173; _i174++) {
                const v_c2 = _a172[_i174];
                if (!(((b.grid[v_c2] || -1) < (b.grid[v_c] || -1)))) {
                  _q170 = false;
                  break Q171;
                }
              }
            }
            _c175 = _q170;
          }
          if (!(_c175)) continue;
          _g166++;
        }
      }
      let _c179: boolean = (v_v === (_g166 + 1));
      if (_c179) {
        let _g176 = -1;
        G177: {
          const _t178 = sp.w;
          for (let v_i = 0; v_i <= _t178; v_i++) {
            if (!(((v_i === sp.w) || (((v_R >> (b.grid[(v_L[v_i] ?? -1)] || -1)) & 1) !== 0)))) continue;
            _g176 = v_i;
            break G177;
          }
        }
        _c179 = (_g176 > 1);
      }
      let _c212: boolean = _c179;
      if (_c212) {
        let _g196 = -1;
        G197: {
          const _t198 = sp.w;
          for (let v_i = 0; v_i <= _t198; v_i++) {
            if (!(((v_i === sp.w) || (((v_R >> (b.grid[(v_L[v_i] ?? -1)] || -1)) & 1) !== 0)))) continue;
            _g196 = v_i;
            break G197;
          }
        }
        let _g199 = 0;
        G200: {
          const _a203 = v_L;
          for (let _i204 = 0; _i204 < _a203.length; _i204++) {
            const v_c = _a203[_i204];
            if (!(((b.grid[v_c] !== 0) && (_i204 >= _g196)))) continue;
            const _t205 = (b.grid[v_c] || -1);
            _g199 |= 1 << _t205;
          }
        }
        const _t206 = (b.domain & ~_g199);
        const _t207 = (_g196 - 1);
        let _g208 = 0;
        G209: {
          for (let _m211 = _t206; _m211 !== 0; _m211 &= _m211 - 1) {
            const v_h = 31 - Math.clz32(_m211 & -_m211);
            if (!((popcount((_t206 & ~rangeMask(v_h, sp.w))) < _t207))) continue;
            _g208 |= 1 << v_h;
          }
        }
        _c212 = ((_g208 & (cands[v_c0] >= 0 ? cands[v_c0] : (cands[v_c0] = b.cands[v_c0]))) !== 0);
      }
      freshBinding("bounds", [(v_s === cl.sees.at[v_k]), (v_v === cl.sees.v[v_k]), sameSet(v_L, sp.sight[v_s]), (v_c0 === (v_L.length > 0 ? v_L[0] : -1)), (v_P === _g155), (v_R === _g162), (v_near === _c212)], ["s =", "v =", "L =", "c0 =", "P =", "R =", "near ="]);
    }
    facts.length = 0;
    changed = false;
    let _c235: boolean = !(v_near);
    if (!_c235) {
      let _q213 = true;
      Q214: {
        let _g215 = -1;
        G216: {
          const _t217 = sp.w;
          for (let v_i = 0; v_i <= _t217; v_i++) {
            const _h218 = (b.grid[(v_L[v_i] ?? -1)] || -1);
            if (!(((v_i === sp.w) || (((v_R >> _h218) & 1) !== 0)))) continue;
            _g215 = v_i;
            break G216;
          }
        }
        let _g219 = 0;
        G220: {
          const _a223 = v_L;
          for (let _i224 = 0; _i224 < _a223.length; _i224++) {
            const v_c = _a223[_i224];
            const _h225 = (b.grid[v_c] !== 0);
            if (!((_h225 && (_i224 >= _g215)))) continue;
            const _h226 = (b.grid[v_c] || -1);
            _g219 |= 1 << _h226;
          }
        }
        const _t227 = (b.domain & ~_g219);
        const _t228 = (_g215 - 1);
        let _g229 = 0;
        G230: {
          for (let _m232 = _t227; _m232 !== 0; _m232 &= _m232 - 1) {
            const v_h = 31 - Math.clz32(_m232 & -_m232);
            const _h233 = popcount((_t227 & ~rangeMask(v_h, sp.w)));
            if (!((_h233 < _t228))) continue;
            _g229 |= 1 << v_h;
          }
        }
        for (let _m234 = _g229; _m234 !== 0; _m234 &= _m234 - 1) {
          const v_h = 31 - Math.clz32(_m234 & -_m234);
          if ((((b.cands[v_c0] >> v_h) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c0, v_h); changed = true; } else facts.push(STRIKE, v_c0, v_h); }
          if (!(true)) {
            _q213 = false;
            break Q214;
          }
        }
      }
      _c235 = _q213;
    }
    let _c267: boolean = _c235;
    if (_c267) {
      let _c266: boolean = v_near;
      if (!_c266) {
        let _q236 = true;
        Q237: {
          let _g238 = 0;
          G239: {
            const _a248 = v_L;
            for (let _i249 = 0; _i249 < _a248.length; _i249++) {
              const v_c = _a248[_i249];
              const _h250 = (b.grid[v_c] !== 0);
              const _h257 = (b.grid[v_c] || -1);
              const _h258 = (_h257 + 1);
              let _c259: boolean = _h250;
              if (_c259) {
                let _q251 = false;
                Q252: {
                  const _a253 = v_L;
                  const _n254 = _i249;
                  for (let _i255 = 0; _i255 < _n254; _i255++) {
                    const v_c2 = _a253[_i255];
                    const _h256 = (b.grid[v_c2] || -1);
                    if ((_h256 > _h258)) {
                      _q251 = true;
                      break Q252;
                    }
                  }
                }
                _c259 = !(_q251);
              }
              if (!(_c259)) continue;
              _g238 |= 1 << _h257;
            }
          }
          const v_K = ((b.domain & ~v_P) | _g238);
          for (let _m260 = b.domain; _m260 !== 0; _m260 &= _m260 - 1) {
            const v_i = 31 - Math.clz32(_m260 & -_m260);
            L262: {
              const v_h = (_h261 - v_i);
              if (!((((v_K >> v_h) & 1) !== 0))) break L262;
              const _h263 = popcount((v_K & ~rangeMask(1, v_h)));
              const _t264 = ((v_v - _h263) - 2);
              for (let v_j = 0; v_j <= _t264; v_j++) {
                const _t265 = (v_L[v_j] ?? -1);
                if ((((b.cands[_t265] >> v_h) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t265, v_h); changed = true; } else facts.push(STRIKE, _t265, v_h); }
                if (!(true)) {
                  _q236 = false;
                  break Q237;
                }
              }
            }
          }
        }
        _c266 = _q236;
      }
      _c267 = _c266;
    }
    if (!(_c267)) return -1;
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
let _p275 = new Int32Array(0);
let _l276: readonly number[] = [];
let _f281 = new Int32Array(0);
let _l282: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function arrangement(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ArrangementBinding> | null): number {
  if (_p275.length < sp.cells.length) _p275 = new Int32Array(sp.cells.length);
  else _p275.fill(0);
  _l276 = [];
  let _y277 = false;
  if (_f281.length < sp.cells.length) _f281 = new Int32Array(sp.cells.length).fill(-1);
  else _f281.fill(-1);
  _l282 = [];
  const _s283: number[] = [];
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
    let _g278 = -1;
    const _a270 = v_L;
    for (let _i271 = 0; _i271 < _a270.length; _i271++) {
      const v_c = _a270[_i271];
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("arrangement", [(v_s === cl.sees.at[v_k]), (v_v === cl.sees.v[v_k]), sameSet(v_L, sp.sight[v_s]), (v_L.includes(v_c))], ["s =", "v =", "L =", "c in"]);
      }
      facts.length = 0;
      changed = false;
      let _q272 = true;
      Q273: {
        for (let _m274 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m274 !== 0; _m274 &= _m274 - 1) {
          const v_d = 31 - Math.clz32(_m274 & -_m274);
          if (_g278 !== _epoch) {
            _g278 = _epoch;
            for (const _e279 of _l276) _p275[_e279] = 0;
            _y277 = false;
            const _a280 = v_L;
            for (const _e284 of _l282) _f281[_e284] = -1;
            _l282 = _a280;
            let _i286 = 0;
            _s283[0] = 0;
            let _o290 = _a280.length === 0;
            for (;;) {
              if (_a280.length === 0) {
                if (!_o290) break;
                _o290 = false;
              }
              while (_a280.length > 0 && _i286 >= 0) {
                const _e284 = _a280[_i286];
                if (_s283[_i286] > 0) _f281[_e284] = -1;
                let _r289 = (cands[_e284] >= 0 ? cands[_e284] : (cands[_e284] = b.cands[_e284])) & ~((2 << _s283[_i286]) - 1);
                let _d285 = 0;
                for (; _r289 !== 0; _r289 &= _r289 - 1) {
                  _d285 = 31 - Math.clz32(_r289 & -_r289);
                  _f281[_e284] = _d285;
                  if (true) { let _j287 = 0; while (_j287 < _i286 && !(_f281[_a280[_j287]] === _d285 && true)) _j287++; if (_j287 < _i286) continue; }
                  break;
                }
                if (_r289 === 0) {
                  _s283[_i286] = 0;
                  _i286--;
                  continue;
                }
                _s283[_i286] = _d285;
                if (_i286 === _a280.length - 1) break;
                _i286++;
                _s283[_i286] = 0;
              }
              if (_i286 < 0) break;
              let _g291 = 0;
              G292: {
                const _a293 = v_L;
                for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                  const v_c = _a293[_i294];
                  let _q295 = true;
                  Q296: {
                    const _a297 = v_L;
                    const _n298 = _i294;
                    for (let _i299 = 0; _i299 < _n298; _i299++) {
                      const v_c2 = _a297[_i299];
                      if (!((_f281[v_c2] < _f281[v_c]))) {
                        _q295 = false;
                        break Q296;
                      }
                    }
                  }
                  if (!(_q295)) continue;
                  _g291++;
                }
              }
              if (!((_g291 === v_v))) continue;
              _l276 = _a280;
              _y277 = true;
              for (const _e279 of _a280) _p275[_e279] |= 1 << _f281[_e279];
            }
          }
          if (!(!(((((_p275[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y277 && !v_L.includes(v_c)))))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q272 = false;
            break Q273;
          }
        }
      }
      if (!(_q272)) return -1;
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
