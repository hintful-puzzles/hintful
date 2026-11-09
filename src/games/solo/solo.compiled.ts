// Compiled by `npm run describe` from src/games/solo/solo.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, cellsValued, clueAt, minus, nextOfSize, popcount, rangeMask, stamps, union, valuesOf } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  cage: Partition;
  total: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["box","rows","cols","diagonals"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "boxSingle" | "cageSingle" | "regionRule" | "cageMinMax" | "partMinMax" | "cageSums" | "partSums" | "latin.hiddenSingle" | "latin.single" | "intersect" | "latin.set" | "digitSet" | "latin.wing";

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
  { id: "boxSingle", tier: 0 },
  { id: "cageSingle", tier: 0, scale: "killer" },
  { id: "regionRule", tier: 3, scale: "killer" },
  { id: "cageMinMax", tier: 1, scale: "killer" },
  { id: "partMinMax", tier: 1, scale: "killer", from: 3 },
  { id: "cageSums", tier: 2, scale: "killer" },
  { id: "partSums", tier: 2, scale: "killer", from: 3 },
  { id: "latin.hiddenSingle", tier: 1 },
  { id: "latin.single", tier: 1 },
  { id: "intersect", tier: 2 },
  { id: "latin.set", tier: 3 },
  { id: "digitSet", tier: 4 },
  { id: "latin.wing", tier: 4 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard","Extreme","Unreasonable"];

/** Its other scales' tiers, by scale. */
export const scales: Readonly<Record<string, readonly string[]>> = {"killer":["Single","MinMax","Sums","Region"]};

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q917 = true;
  const _n921 = new Int32Array(32);
  Q918: for (const _u919 of sp.units) {
    _n921.fill(0);
    for (const _c920 of sp.lineCells[_u919]) {
      const _t922 = (g[_c920] || -1);
      if (++_n921[_t922] > 1) {
        _q917 = false;
        break Q918;
      }
    }
  }
  if (!(_q917)) return false;
  for (let _k923 = 0; _k923 < cl.total.at.length; _k923++) {
    const _at924 = cl.total.at[_k923];
    const _v925 = cl.total.v[_k923];
    let _g926 = 0;
    G927: {
      const _a928 = cl.cage.cells[_at924];
      for (let _i929 = 0; _i929 < _a928.length; _i929++) {
        const v_c = _a928[_i929];
        const _h930 = (g[v_c] || -1);
        _g926 += _h930;
      }
    }
    let _c937: boolean = (_g926 === _v925);
    if (_c937) {
      let _g931 = true;
      const _s933: number[] = [];
      G932: {
        const _a934 = cl.cage.cells[_at924];
        for (let _i935 = 0; _i935 < _a934.length; _i935++) {
          const v_c = _a934[_i935];
          const _h936 = (g[v_c] || -1);
          if (_s933.includes(_h936)) {
            _g931 = false;
            break G932;
          }
          _s933.push(_h936);
        }
      }
      _c937 = _g931;
    }
    if (!(_c937)) return false;
  }
  return true;
}

export interface BoxSingleBinding {
  u: number;
  placed: number;
  d: number;
  n: number;
}

const boxSingleFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function boxSingle(b: Marks, sp: GridSpace, fire: Fire<BoxSingleBinding> | null): number {
  const facts = boxSingleFacts;
  let fired = 0;
  let changed = false;
  const _a16 = sp.boxes;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_u = _a16[_i17];
    let _g18 = 0;
    G19: {
      const _a22 = sp.lineCells[v_u];
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_c = _a22[_i23];
        if (!((b.grid[v_c] !== 0))) continue;
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
        if (!((v_n < 2))) break L30;
        facts.length = 0;
        changed = false;
        let _c36: boolean = (v_n === 1);
        if (_c36) {
          let _g31 = -1;
          let _n33 = 0;
          G32: {
            const _a34 = sp.lineCells[v_u];
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_c = _a34[_i35];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              if (++_n33 === 2) {
                _g31 = -1;
                break G32;
              }
              _g31 = v_c;
            }
          }
          if (!(b.grid[_g31] !== 0)) { if (fire === null) { b.placeAt(_g31, v_d); changed = true; } else facts.push(PLACE, _g31, v_d); }
          _c36 = true;
        }
        if (!(_c36)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ u: v_u, placed: v_placed, d: v_d, n: v_n }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CageSingleBinding {
  r: number;
  K: readonly number[];
  c: number;
  t: number;
}

const cageSingleFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function cageSingle(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageSingleBinding> | null): number {
  const _g52: number[] = [];
  const facts = cageSingleFacts;
  let fired = 0;
  let changed = false;
  const _a50 = cl.cage.parts;
  for (let _i51 = 0; _i51 < _a50.length; _i51++) {
    const v_r = _a50[_i51];
    const _h60 = clueAt(cl.total, v_r);
    _g52.length = 0;
    G53: {
      const _a56 = cl.cage.cells[v_r];
      for (let _i57 = 0; _i57 < _a56.length; _i57++) {
        const v_c = _a56[_i57];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g52.push(v_c);
      }
    }
    L58: {
      const v_K = _g52;
      const _h59 = v_K.length;
      if (!((_h59 === 1))) break L58;
      const v_c = (v_K.length > 0 ? v_K[0] : -1);
      let _g61 = 0;
      G62: {
        const _a63 = cl.cage.cells[v_r];
        for (let _i64 = 0; _i64 < _a63.length; _i64++) {
          const v_c = _a63[_i64];
          if (!((b.grid[v_c] !== 0))) continue;
          _g61 += (b.grid[v_c] || -1);
        }
      }
      const v_t = (_h60 - _g61);
      facts.length = 0;
      changed = false;
      let _c65: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[v_c] >> v_t) & 1) !== 0));
      if (_c65) {
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_t); changed = true; } else facts.push(PLACE, v_c, v_t); }
        _c65 = true;
      }
      if (!(_c65)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K.slice(), c: v_c, t: v_t }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface RegionRuleBinding {
  u: number;
  W: readonly number[];
  L: readonly number[];
  s: number;
  R: readonly number[];
  t: number;
}

const regionRuleFacts: number[] = [];
const _st161 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function regionRule(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionRuleBinding> | null): number {
  const _g131: number[] = [];
  const _g155: number[] = [];
  const _g185: number[] = [];
  const facts = regionRuleFacts;
  let fired = 0;
  let changed = false;
  const _a129 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i130 = 0; _i130 < _a129.length; _i130++) {
    const v_u = _a129[_i130];
    _g131.length = 0;
    G132: {
      const _a144 = cl.cage.parts;
      for (let _i145 = 0; _i145 < _a144.length; _i145++) {
        const v_r = _a144[_i145];
        let _q146 = false;
        Q147: {
          const _a148 = cl.cage.cells[v_r];
          for (let _i149 = 0; _i149 < _a148.length; _i149++) {
            const v_c = _a148[_i149];
            if (!((b.grid[v_c] !== 0))) {
              _q146 = true;
              break Q147;
            }
          }
        }
        let _c154: boolean = _q146;
        if (_c154) {
          let _q150 = true;
          Q151: {
            const _a152 = cl.cage.cells[v_r];
            for (let _i153 = 0; _i153 < _a152.length; _i153++) {
              const v_c = _a152[_i153];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q150 = false;
                break Q151;
              }
            }
          }
          _c154 = _q150;
        }
        if (!(_c154)) continue;
        _g131.push(v_r);
      }
    }
    const v_W = _g131;
    _g155.length = 0;
    _st161.pass++;
    G156: {
      const _a162 = cl.cage.parts;
      for (let _i163 = 0; _i163 < _a162.length; _i163++) {
        const v_r = _a162[_i163];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a164 = cl.cage.cells[v_r];
        for (let _i165 = 0; _i165 < _a164.length; _i165++) {
          const v_c = _a164[_i165];
          if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t166 = v_c;
          if (_g155.length < 16) { if (!_g155.includes(_t166)) _g155.push(_t166); } else addOnce(_g155, _st161, _t166);
        }
      }
    }
    L167: {
      const v_L = _g155;
      const _h168 = v_L.length;
      if (!(((_h168 > 0) && (_h168 < sp.w)))) break L167;
      let _g169 = 0;
      G170: {
        for (let _m171 = b.domain; _m171 !== 0; _m171 &= _m171 - 1) {
          const v_d = 31 - Math.clz32(_m171 & -_m171);
          _g169 += v_d;
        }
      }
      let _g172 = 0;
      G173: {
        const _a174 = sp.lineCells[v_u];
        for (let _i175 = 0; _i175 < _a174.length; _i175++) {
          const v_c = _a174[_i175];
          if (!((b.grid[v_c] !== 0))) continue;
          _g172 += (b.grid[v_c] || -1);
        }
      }
      let _g176 = 0;
      G177: {
        const _a178 = v_W;
        for (let _i179 = 0; _i179 < _a178.length; _i179++) {
          const v_r = _a178[_i179];
          const _h180 = clueAt(cl.total, v_r);
          let _g181 = 0;
          G182: {
            const _a183 = cl.cage.cells[v_r];
            for (let _i184 = 0; _i184 < _a183.length; _i184++) {
              const v_c = _a183[_i184];
              if (!((b.grid[v_c] !== 0))) continue;
              _g181 += (b.grid[v_c] || -1);
            }
          }
          _g176 += (_h180 - _g181);
        }
      }
      const v_s = ((_g169 - _g172) - _g176);
      _g185.length = 0;
      G186: {
        const _a189 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
        for (let _i190 = 0; _i190 < _a189.length; _i190++) {
          const v_c = _a189[_i190];
          if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
          _g185.push(v_c);
        }
      }
      const v_R = _g185;
      const _h201 = v_R.length;
      const _t191 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
      const _h192 = clueAt(cl.total, _t191);
      let _g193 = 0;
      G194: {
        const _a195 = cl.cage.cells[_t191];
        for (let _i196 = 0; _i196 < _a195.length; _i196++) {
          const v_c = _a195[_i196];
          if (!((b.grid[v_c] !== 0))) continue;
          _g193 += (b.grid[v_c] || -1);
        }
      }
      const v_t = ((_h192 - _g193) - v_s);
      facts.length = 0;
      changed = false;
      let _c200: boolean = (v_s > 0);
      if (_c200) {
        let _c199: boolean = (_h168 !== 1);
        if (!_c199) {
          let _c198: boolean = ((v_s <= sp.w) && (((b.cands[(v_L.length > 0 ? v_L[0] : -1)] >> v_s) & 1) !== 0));
          if (_c198) {
            const _t197 = (v_L.length > 0 ? v_L[0] : -1);
            if (!(b.grid[_t197] !== 0)) { if (fire === null) { b.placeAt(_t197, v_s); changed = true; } else facts.push(PLACE, _t197, v_s); }
            _c198 = true;
          }
          _c199 = _c198;
        }
        _c200 = _c199;
      }
      let _c210: boolean = _c200;
      if (_c210) {
        let _c206: boolean = ((_h168 === 1) || (_h201 !== 1));
        if (!_c206) {
          let _q202 = false;
          Q203: {
            const _a204 = v_L;
            for (let _i205 = 0; _i205 < _a204.length; _i205++) {
              const v_c = _a204[_i205];
              if ((cl.cage.of[v_c] !== cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)])) {
                _q202 = true;
                break Q203;
              }
            }
          }
          _c206 = _q202;
        }
        let _c209: boolean = _c206;
        if (!_c209) {
          let _c208: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[(v_R.length > 0 ? v_R[0] : -1)] >> v_t) & 1) !== 0));
          if (_c208) {
            const _t207 = (v_R.length > 0 ? v_R[0] : -1);
            if (!(b.grid[_t207] !== 0)) { if (fire === null) { b.placeAt(_t207, v_t); changed = true; } else facts.push(PLACE, _t207, v_t); }
            _c208 = true;
          }
          _c209 = _c208;
        }
        _c210 = _c209;
      }
      if (!(_c210)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ u: v_u, W: v_W.slice(), L: v_L.slice(), s: v_s, R: v_R.slice(), t: v_t }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CageMinMaxBinding {
  r: number;
  K: readonly number[];
  t: number;
}

const cageMinMaxFacts: number[] = [];
let cageMinMaxCands = new Int32Array(0);

/** Its dearest read grows with the board as 1. */
export function cageMinMax(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageMinMaxBinding> | null): number {
  const _g226: number[] = [];
  const facts = cageMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (cageMinMaxCands.length < sp.cells.length) cageMinMaxCands = new Int32Array(sp.cells.length);
  const cands = cageMinMaxCands;
  cands.fill(-1);
  const _a224 = cl.cage.parts;
  for (let _i225 = 0; _i225 < _a224.length; _i225++) {
    const v_r = _a224[_i225];
    const _h233 = clueAt(cl.total, v_r);
    _g226.length = 0;
    G227: {
      const _a230 = cl.cage.cells[v_r];
      for (let _i231 = 0; _i231 < _a230.length; _i231++) {
        const v_c = _a230[_i231];
        const _h232 = (b.grid[v_c] !== 0);
        if (!(!(_h232))) continue;
        _g226.push(v_c);
      }
    }
    const v_K = _g226;
    let _g234 = 0;
    G235: {
      const _a236 = cl.cage.cells[v_r];
      for (let _i237 = 0; _i237 < _a236.length; _i237++) {
        const v_c = _a236[_i237];
        const _h238 = (b.grid[v_c] !== 0);
        if (!(_h238)) continue;
        const _h239 = (b.grid[v_c] || -1);
        _g234 += _h239;
      }
    }
    L240: {
      const v_t = (_h233 - _g234);
      if (!((v_t !== 0))) break L240;
      facts.length = 0;
      changed = false;
      let _q241 = true;
      Q242: {
        const _a243 = v_K;
        for (let _i244 = 0; _i244 < _a243.length; _i244++) {
          const v_c = _a243[_i244];
          for (let _m245 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m245 !== 0; _m245 &= _m245 - 1) {
            const v_d = 31 - Math.clz32(_m245 & -_m245);
            let _g246 = 0;
            G247: {
              const _a248 = v_K;
              for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                const v_x = _a248[_i249];
                if (!((v_x !== v_c))) continue;
                let _g250 = -1;
                G251: {
                  for (let _m252 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m252 !== 0; _m252 &= _m252 - 1) {
                    const v_e = 31 - Math.clz32(_m252 & -_m252);
                    if (_g250 === -1 || v_e > _g250) _g250 = v_e;
                  }
                }
                _g246 += _g250;
              }
            }
            let _c260: boolean = ((v_d + _g246) < v_t);
            if (!_c260) {
              let _g253 = 0;
              G254: {
                const _a255 = v_K;
                for (let _i256 = 0; _i256 < _a255.length; _i256++) {
                  const v_x = _a255[_i256];
                  if (!((v_x !== v_c))) continue;
                  let _g257 = -1;
                  G258: {
                    for (let _m259 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m259 !== 0; _m259 &= _m259 - 1) {
                      const v_e = 31 - Math.clz32(_m259 & -_m259);
                      if (_g257 === -1 || v_e < _g257) _g257 = v_e;
                    }
                  }
                  _g253 += _g257;
                }
              }
              _c260 = ((v_d + _g253) > v_t);
            }
            if (!(_c260)) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q241 = false;
              break Q242;
            }
          }
        }
      }
      if (!(_q241)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K.slice(), t: v_t }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface PartMinMaxBinding {
  u: number;
  W: readonly number[];
  L: readonly number[];
  s: number;
  R: readonly number[];
  t: number;
  i: number;
  K: readonly number[];
  v: number;
}

const partMinMaxFacts: number[] = [];
let partMinMaxCands = new Int32Array(0);
const _st372 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partMinMax(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartMinMaxBinding> | null): number {
  const _g340: number[] = [];
  const _g366: number[] = [];
  const _g402: number[] = [];
  const _g417: number[] = [];
  const facts = partMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (partMinMaxCands.length < sp.cells.length) partMinMaxCands = new Int32Array(sp.cells.length);
  const cands = partMinMaxCands;
  cands.fill(-1);
  const _a338 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i339 = 0; _i339 < _a338.length; _i339++) {
    const v_u = _a338[_i339];
    _g340.length = 0;
    G341: {
      const _a353 = cl.cage.parts;
      for (let _i354 = 0; _i354 < _a353.length; _i354++) {
        const v_r = _a353[_i354];
        let _q355 = false;
        Q356: {
          const _a357 = cl.cage.cells[v_r];
          for (let _i358 = 0; _i358 < _a357.length; _i358++) {
            const v_c = _a357[_i358];
            const _h359 = (b.grid[v_c] !== 0);
            if (!(_h359)) {
              _q355 = true;
              break Q356;
            }
          }
        }
        let _c365: boolean = _q355;
        if (_c365) {
          let _q360 = true;
          Q361: {
            const _a362 = cl.cage.cells[v_r];
            for (let _i363 = 0; _i363 < _a362.length; _i363++) {
              const v_c = _a362[_i363];
              const _h364 = (b.grid[v_c] !== 0);
              if (!(!(_h364))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q360 = false;
                break Q361;
              }
            }
          }
          _c365 = _q360;
        }
        if (!(_c365)) continue;
        _g340.push(v_r);
      }
    }
    const v_W = _g340;
    _g366.length = 0;
    _st372.pass++;
    G367: {
      const _a373 = cl.cage.parts;
      for (let _i374 = 0; _i374 < _a373.length; _i374++) {
        const v_r = _a373[_i374];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a375 = cl.cage.cells[v_r];
        for (let _i376 = 0; _i376 < _a375.length; _i376++) {
          const v_c = _a375[_i376];
          const _h377 = (b.grid[v_c] !== 0);
          if (!((!(_h377) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t378 = v_c;
          if (_g366.length < 16) { if (!_g366.includes(_t378)) _g366.push(_t378); } else addOnce(_g366, _st372, _t378);
        }
      }
    }
    L379: {
      const v_L = _g366;
      const _h380 = v_L.length;
      if (!(((_h380 > 1) && (_h380 < sp.w)))) break L379;
      let _g381 = 0;
      G382: {
        for (let _m383 = b.domain; _m383 !== 0; _m383 &= _m383 - 1) {
          const v_d = 31 - Math.clz32(_m383 & -_m383);
          _g381 += v_d;
        }
      }
      let _g384 = 0;
      G385: {
        const _a386 = sp.lineCells[v_u];
        for (let _i387 = 0; _i387 < _a386.length; _i387++) {
          const v_c = _a386[_i387];
          const _h388 = (b.grid[v_c] !== 0);
          if (!(_h388)) continue;
          const _h389 = (b.grid[v_c] || -1);
          _g384 += _h389;
        }
      }
      let _g390 = 0;
      G391: {
        const _a392 = v_W;
        for (let _i393 = 0; _i393 < _a392.length; _i393++) {
          const v_r = _a392[_i393];
          const _h394 = clueAt(cl.total, v_r);
          let _g395 = 0;
          G396: {
            const _a397 = cl.cage.cells[v_r];
            for (let _i398 = 0; _i398 < _a397.length; _i398++) {
              const v_c = _a397[_i398];
              const _h399 = (b.grid[v_c] !== 0);
              if (!(_h399)) continue;
              const _h400 = (b.grid[v_c] || -1);
              _g395 += _h400;
            }
          }
          _g390 += (_h394 - _g395);
        }
      }
      L401: {
        const v_s = ((_g381 - _g384) - _g390);
        if (!((v_s > 0))) break L401;
        _g402.length = 0;
        G403: {
          const _a406 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i407 = 0; _i407 < _a406.length; _i407++) {
            const v_c = _a406[_i407];
            const _h408 = (b.grid[v_c] !== 0);
            if (!((!(_h408) && !(v_L.includes(v_c))))) continue;
            _g402.push(v_c);
          }
        }
        const v_R = _g402;
        const _h421 = union(v_L, v_R);
        const _t409 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h410 = clueAt(cl.total, _t409);
        let _g411 = 0;
        G412: {
          const _a413 = cl.cage.cells[_t409];
          for (let _i414 = 0; _i414 < _a413.length; _i414++) {
            const v_c = _a413[_i414];
            const _h415 = (b.grid[v_c] !== 0);
            if (!(_h415)) continue;
            const _h416 = (b.grid[v_c] || -1);
            _g411 += _h416;
          }
        }
        const v_t = ((_h410 - _g411) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h424 = (v_i === 0);
          _g417.length = 0;
          G418: {
            const _a422 = _h421;
            for (let _i423 = 0; _i423 < _a422.length; _i423++) {
              const v_c = _a422[_i423];
              if (!((_h424 === (v_L.includes(v_c))))) continue;
              _g417.push(v_c);
            }
          }
          const v_K = _g417;
          const _h426 = v_K.length;
          L425: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c432: boolean = ((_h426 > 1) && (v_v !== 0));
            if (_c432) {
              let _c431: boolean = (v_i === 0);
              if (!_c431) {
                let _q427 = true;
                Q428: {
                  const _a429 = v_L;
                  for (let _i430 = 0; _i430 < _a429.length; _i430++) {
                    const v_c = _a429[_i430];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q427 = false;
                      break Q428;
                    }
                  }
                }
                _c431 = _q427;
              }
              _c432 = _c431;
            }
            if (!(_c432)) break L425;
            facts.length = 0;
            changed = false;
            let _q433 = true;
            Q434: {
              const _a435 = v_K;
              for (let _i436 = 0; _i436 < _a435.length; _i436++) {
                const v_c = _a435[_i436];
                for (let _m437 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m437 !== 0; _m437 &= _m437 - 1) {
                  const v_d = 31 - Math.clz32(_m437 & -_m437);
                  let _g438 = 0;
                  G439: {
                    const _a440 = v_K;
                    for (let _i441 = 0; _i441 < _a440.length; _i441++) {
                      const v_x = _a440[_i441];
                      if (!((v_x !== v_c))) continue;
                      let _g442 = -1;
                      G443: {
                        for (let _m444 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m444 !== 0; _m444 &= _m444 - 1) {
                          const v_e = 31 - Math.clz32(_m444 & -_m444);
                          if (_g442 === -1 || v_e > _g442) _g442 = v_e;
                        }
                      }
                      _g438 += _g442;
                    }
                  }
                  let _c452: boolean = ((v_d + _g438) < v_v);
                  if (!_c452) {
                    let _g445 = 0;
                    G446: {
                      const _a447 = v_K;
                      for (let _i448 = 0; _i448 < _a447.length; _i448++) {
                        const v_x = _a447[_i448];
                        if (!((v_x !== v_c))) continue;
                        let _g449 = -1;
                        G450: {
                          for (let _m451 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m451 !== 0; _m451 &= _m451 - 1) {
                            const v_e = 31 - Math.clz32(_m451 & -_m451);
                            if (_g449 === -1 || v_e < _g449) _g449 = v_e;
                          }
                        }
                        _g445 += _g449;
                      }
                    }
                    _c452 = ((v_d + _g445) > v_v);
                  }
                  if (!(_c452)) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q433 = false;
                    break Q434;
                  }
                }
              }
            }
            if (!(_q433)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ u: v_u, W: v_W.slice(), L: v_L.slice(), s: v_s, R: v_R.slice(), t: v_t, i: v_i, K: v_K.slice(), v: v_v }, facts)) return 1;
              cands.fill(-1);
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CageSumsBinding {
  r: number;
  K: readonly number[];
  t: number;
}

const cageSumsFacts: number[] = [];
let cageSumsCands = new Int32Array(0);

/** Its dearest read grows with the board as 1. */
export function cageSums(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageSumsBinding> | null): number {
  const _g468: number[] = [];
  const facts = cageSumsFacts;
  let fired = 0;
  let changed = false;
  if (cageSumsCands.length < sp.cells.length) cageSumsCands = new Int32Array(sp.cells.length);
  const cands = cageSumsCands;
  cands.fill(-1);
  const _a466 = cl.cage.parts;
  for (let _i467 = 0; _i467 < _a466.length; _i467++) {
    const v_r = _a466[_i467];
    const _h475 = clueAt(cl.total, v_r);
    _g468.length = 0;
    G469: {
      const _a472 = cl.cage.cells[v_r];
      for (let _i473 = 0; _i473 < _a472.length; _i473++) {
        const v_c = _a472[_i473];
        const _h474 = (b.grid[v_c] !== 0);
        if (!(!(_h474))) continue;
        _g468.push(v_c);
      }
    }
    const v_K = _g468;
    const _h483 = v_K.length;
    let _g476 = 0;
    G477: {
      const _a478 = cl.cage.cells[v_r];
      for (let _i479 = 0; _i479 < _a478.length; _i479++) {
        const v_c = _a478[_i479];
        const _h480 = (b.grid[v_c] !== 0);
        if (!(_h480)) continue;
        const _h481 = (b.grid[v_c] || -1);
        _g476 += _h481;
      }
    }
    L482: {
      const v_t = (_h475 - _g476);
      if (!((v_t !== 0))) break L482;
      facts.length = 0;
      changed = false;
      let _c526: boolean = (_h483 > 0);
      if (_c526) {
        let _c525: boolean = ((_h483 < 2) || (_h483 > 4));
        if (!_c525) {
          let _q484 = true;
          Q485: {
            let _g486 = 0;
            G487: {
              const _e503 = valuesOf(b.domain);
              const _n506 = 1 << _e503.length;
              for (let _k504 = _h483 > _e503.length ? _n506 : (1 << _h483) - 1; _k504 < _n506; _k504 = _h483 === 0 ? _n506 : nextOfSize(_k504)) {
                let v_T = 0;
                for (let _j505 = 0; _j505 < _e503.length; _j505++) if ((_k504 >> (_e503.length - 1 - _j505)) & 1) v_T |= 1 << _e503[_j505];
                const _h507 = popcount(v_T);
                let _c511: boolean = (_h507 === _h483);
                if (_c511) {
                  let _g508 = 0;
                  G509: {
                    for (let _m510 = v_T; _m510 !== 0; _m510 &= _m510 - 1) {
                      const v_e = 31 - Math.clz32(_m510 & -_m510);
                      _g508 += v_e;
                    }
                  }
                  _c511 = (_g508 === v_t);
                }
                let _c516: boolean = _c511;
                if (_c516) {
                  let _q512 = true;
                  Q513: {
                    const _a514 = v_K;
                    for (let _i515 = 0; _i515 < _a514.length; _i515++) {
                      const v_x = _a514[_i515];
                      if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                        _q512 = false;
                        break Q513;
                      }
                    }
                  }
                  _c516 = _q512;
                }
                if (!(_c516)) continue;
                for (let _m517 = v_T; _m517 !== 0; _m517 &= _m517 - 1) {
                  const v_d = 31 - Math.clz32(_m517 & -_m517);
                  _g486 |= 1 << v_d;
                }
              }
            }
            const v_P = _g486;
            const _h518 = popcount(v_P);
            let _c524: boolean = (_h518 > 0);
            if (_c524) {
              let _q519 = true;
              Q520: {
                const _a521 = v_K;
                for (let _i522 = 0; _i522 < _a521.length; _i522++) {
                  const v_c = _a521[_i522];
                  for (let _m523 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m523 !== 0; _m523 &= _m523 - 1) {
                    const v_d = 31 - Math.clz32(_m523 & -_m523);
                    if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                    if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                    if (!(true)) {
                      _q519 = false;
                      break Q520;
                    }
                  }
                }
              }
              _c524 = _q519;
            }
            if (!(_c524)) {
              _q484 = false;
              break Q485;
            }
          }
          _c525 = _q484;
        }
        _c526 = _c525;
      }
      if (!(_c526)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K.slice(), t: v_t }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface PartSumsBinding {
  u: number;
  W: readonly number[];
  L: readonly number[];
  s: number;
  R: readonly number[];
  t: number;
  i: number;
  K: readonly number[];
  v: number;
}

const partSumsFacts: number[] = [];
let partSumsCands = new Int32Array(0);
const _st638 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partSums(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartSumsBinding> | null): number {
  const _g606: number[] = [];
  const _g632: number[] = [];
  const _g668: number[] = [];
  const _g683: number[] = [];
  const facts = partSumsFacts;
  let fired = 0;
  let changed = false;
  if (partSumsCands.length < sp.cells.length) partSumsCands = new Int32Array(sp.cells.length);
  const cands = partSumsCands;
  cands.fill(-1);
  const _a604 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i605 = 0; _i605 < _a604.length; _i605++) {
    const v_u = _a604[_i605];
    _g606.length = 0;
    G607: {
      const _a619 = cl.cage.parts;
      for (let _i620 = 0; _i620 < _a619.length; _i620++) {
        const v_r = _a619[_i620];
        let _q621 = false;
        Q622: {
          const _a623 = cl.cage.cells[v_r];
          for (let _i624 = 0; _i624 < _a623.length; _i624++) {
            const v_c = _a623[_i624];
            const _h625 = (b.grid[v_c] !== 0);
            if (!(_h625)) {
              _q621 = true;
              break Q622;
            }
          }
        }
        let _c631: boolean = _q621;
        if (_c631) {
          let _q626 = true;
          Q627: {
            const _a628 = cl.cage.cells[v_r];
            for (let _i629 = 0; _i629 < _a628.length; _i629++) {
              const v_c = _a628[_i629];
              const _h630 = (b.grid[v_c] !== 0);
              if (!(!(_h630))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q626 = false;
                break Q627;
              }
            }
          }
          _c631 = _q626;
        }
        if (!(_c631)) continue;
        _g606.push(v_r);
      }
    }
    const v_W = _g606;
    _g632.length = 0;
    _st638.pass++;
    G633: {
      const _a639 = cl.cage.parts;
      for (let _i640 = 0; _i640 < _a639.length; _i640++) {
        const v_r = _a639[_i640];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a641 = cl.cage.cells[v_r];
        for (let _i642 = 0; _i642 < _a641.length; _i642++) {
          const v_c = _a641[_i642];
          const _h643 = (b.grid[v_c] !== 0);
          if (!((!(_h643) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t644 = v_c;
          if (_g632.length < 16) { if (!_g632.includes(_t644)) _g632.push(_t644); } else addOnce(_g632, _st638, _t644);
        }
      }
    }
    L645: {
      const v_L = _g632;
      const _h646 = v_L.length;
      if (!(((_h646 > 1) && (_h646 < sp.w)))) break L645;
      let _g647 = 0;
      G648: {
        for (let _m649 = b.domain; _m649 !== 0; _m649 &= _m649 - 1) {
          const v_d = 31 - Math.clz32(_m649 & -_m649);
          _g647 += v_d;
        }
      }
      let _g650 = 0;
      G651: {
        const _a652 = sp.lineCells[v_u];
        for (let _i653 = 0; _i653 < _a652.length; _i653++) {
          const v_c = _a652[_i653];
          const _h654 = (b.grid[v_c] !== 0);
          if (!(_h654)) continue;
          const _h655 = (b.grid[v_c] || -1);
          _g650 += _h655;
        }
      }
      let _g656 = 0;
      G657: {
        const _a658 = v_W;
        for (let _i659 = 0; _i659 < _a658.length; _i659++) {
          const v_r = _a658[_i659];
          const _h660 = clueAt(cl.total, v_r);
          let _g661 = 0;
          G662: {
            const _a663 = cl.cage.cells[v_r];
            for (let _i664 = 0; _i664 < _a663.length; _i664++) {
              const v_c = _a663[_i664];
              const _h665 = (b.grid[v_c] !== 0);
              if (!(_h665)) continue;
              const _h666 = (b.grid[v_c] || -1);
              _g661 += _h666;
            }
          }
          _g656 += (_h660 - _g661);
        }
      }
      L667: {
        const v_s = ((_g647 - _g650) - _g656);
        if (!((v_s > 0))) break L667;
        _g668.length = 0;
        G669: {
          const _a672 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i673 = 0; _i673 < _a672.length; _i673++) {
            const v_c = _a672[_i673];
            const _h674 = (b.grid[v_c] !== 0);
            if (!((!(_h674) && !(v_L.includes(v_c))))) continue;
            _g668.push(v_c);
          }
        }
        const v_R = _g668;
        const _h687 = union(v_L, v_R);
        const _t675 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h676 = clueAt(cl.total, _t675);
        let _g677 = 0;
        G678: {
          const _a679 = cl.cage.cells[_t675];
          for (let _i680 = 0; _i680 < _a679.length; _i680++) {
            const v_c = _a679[_i680];
            const _h681 = (b.grid[v_c] !== 0);
            if (!(_h681)) continue;
            const _h682 = (b.grid[v_c] || -1);
            _g677 += _h682;
          }
        }
        const v_t = ((_h676 - _g677) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h690 = (v_i === 0);
          _g683.length = 0;
          G684: {
            const _a688 = _h687;
            for (let _i689 = 0; _i689 < _a688.length; _i689++) {
              const v_c = _a688[_i689];
              if (!((_h690 === (v_L.includes(v_c))))) continue;
              _g683.push(v_c);
            }
          }
          const v_K = _g683;
          const _h692 = v_K.length;
          L691: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c698: boolean = (((_h692 > 1) && (_h692 <= 4)) && (v_v !== 0));
            if (_c698) {
              let _c697: boolean = (v_i === 0);
              if (!_c697) {
                let _q693 = true;
                Q694: {
                  const _a695 = v_L;
                  for (let _i696 = 0; _i696 < _a695.length; _i696++) {
                    const v_c = _a695[_i696];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q693 = false;
                      break Q694;
                    }
                  }
                }
                _c697 = _q693;
              }
              _c698 = _c697;
            }
            if (!(_c698)) break L691;
            facts.length = 0;
            changed = false;
            let _q699 = true;
            Q700: {
              let _g701 = 0;
              G702: {
                const _e718 = valuesOf(b.domain);
                const _n721 = 1 << _e718.length;
                for (let _k719 = _h692 > _e718.length ? _n721 : (1 << _h692) - 1; _k719 < _n721; _k719 = _h692 === 0 ? _n721 : nextOfSize(_k719)) {
                  let v_T = 0;
                  for (let _j720 = 0; _j720 < _e718.length; _j720++) if ((_k719 >> (_e718.length - 1 - _j720)) & 1) v_T |= 1 << _e718[_j720];
                  const _h722 = popcount(v_T);
                  let _c726: boolean = (_h722 === _h692);
                  if (_c726) {
                    let _g723 = 0;
                    G724: {
                      for (let _m725 = v_T; _m725 !== 0; _m725 &= _m725 - 1) {
                        const v_e = 31 - Math.clz32(_m725 & -_m725);
                        _g723 += v_e;
                      }
                    }
                    _c726 = (_g723 === v_v);
                  }
                  let _c731: boolean = _c726;
                  if (_c731) {
                    let _q727 = true;
                    Q728: {
                      const _a729 = v_K;
                      for (let _i730 = 0; _i730 < _a729.length; _i730++) {
                        const v_x = _a729[_i730];
                        if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                          _q727 = false;
                          break Q728;
                        }
                      }
                    }
                    _c731 = _q727;
                  }
                  if (!(_c731)) continue;
                  for (let _m732 = v_T; _m732 !== 0; _m732 &= _m732 - 1) {
                    const v_d = 31 - Math.clz32(_m732 & -_m732);
                    _g701 |= 1 << v_d;
                  }
                }
              }
              const v_P = _g701;
              const _h733 = popcount(v_P);
              let _c739: boolean = (_h733 > 0);
              if (_c739) {
                let _q734 = true;
                Q735: {
                  const _a736 = v_K;
                  for (let _i737 = 0; _i737 < _a736.length; _i737++) {
                    const v_c = _a736[_i737];
                    for (let _m738 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m738 !== 0; _m738 &= _m738 - 1) {
                      const v_d = 31 - Math.clz32(_m738 & -_m738);
                      if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                      if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                      if (!(true)) {
                        _q734 = false;
                        break Q735;
                      }
                    }
                  }
                }
                _c739 = _q734;
              }
              if (!(_c739)) {
                _q699 = false;
                break Q700;
              }
            }
            if (!(_q699)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ u: v_u, W: v_W.slice(), L: v_L.slice(), s: v_s, R: v_R.slice(), t: v_t, i: v_i, K: v_K.slice(), v: v_v }, facts)) return 1;
              cands.fill(-1);
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface IntersectBinding {
  L: number;
  b: number;
  d: number;
  first: boolean;
}

const intersectFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function intersect(b: Marks, sp: GridSpace, fire: Fire<IntersectBinding> | null): number {
  const facts = intersectFacts;
  let fired = 0;
  let changed = false;
  const _a767 = union(union(sp.rows, sp.cols), sp.diagonals);
  for (let _i768 = 0; _i768 < _a767.length; _i768++) {
    const v_L = _a767[_i768];
    const _a769 = sp.boxes;
    for (let _i770 = 0; _i770 < _a769.length; _i770++) {
      const v_b = _a769[_i770];
      let _q771 = false;
      Q772: {
        const _a773 = sp.lineCells[v_L];
        for (let _i774 = 0; _i774 < _a773.length; _i774++) {
          const v_c = _a773[_i774];
          if ((sp.boxOf[v_c] === v_b)) {
            _q771 = true;
            break Q772;
          }
        }
      }
      if (!(_q771)) continue;
      for (let _m775 = b.domain; _m775 !== 0; _m775 &= _m775 - 1) {
        const v_d = 31 - Math.clz32(_m775 & -_m775);
        let _q776 = false;
        Q777: {
          const _a778 = sp.lineCells[v_L];
          for (let _i779 = 0; _i779 < _a778.length; _i779++) {
            const v_c = _a778[_i779];
            const _h780 = (b.grid[v_c] || -1);
            if ((_h780 === v_d)) {
              _q776 = true;
              break Q777;
            }
          }
        }
        let _c786: boolean = !(_q776);
        if (_c786) {
          let _q781 = false;
          Q782: {
            const _a783 = sp.lineCells[v_b];
            for (let _i784 = 0; _i784 < _a783.length; _i784++) {
              const v_c = _a783[_i784];
              const _h785 = (b.grid[v_c] || -1);
              if ((_h785 === v_d)) {
                _q781 = true;
                break Q782;
              }
            }
          }
          _c786 = !(_q781);
        }
        if (!(_c786)) continue;
        let _q787 = true;
        Q788: {
          const _a789 = sp.lineCells[v_L];
          for (let _i790 = 0; _i790 < _a789.length; _i790++) {
            const v_c = _a789[_i790];
            if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
            if (!((sp.boxOf[v_c] === v_b))) {
              _q787 = false;
              break Q788;
            }
          }
        }
        let _c795: boolean = _q787;
        if (_c795) {
          let _q791 = false;
          Q792: {
            const _a793 = sp.lineCells[v_b];
            for (let _i794 = 0; _i794 < _a793.length; _i794++) {
              const v_c = _a793[_i794];
              if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                _q791 = true;
                break Q792;
              }
            }
          }
          _c795 = _q791;
        }
        const v_first = _c795;
        facts.length = 0;
        changed = false;
        let _c800: boolean = !(v_first);
        if (!_c800) {
          let _q796 = true;
          Q797: {
            const _a798 = sp.lineCells[v_b];
            for (let _i799 = 0; _i799 < _a798.length; _i799++) {
              const v_c = _a798[_i799];
              if (!((!(sp.lineCells[v_L].includes(v_c)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q796 = false;
                break Q797;
              }
            }
          }
          _c800 = _q796;
        }
        let _c811: boolean = _c800;
        if (_c811) {
          let _c810: boolean = v_first;
          if (!_c810) {
            let _q801 = true;
            Q802: {
              const _a803 = sp.lineCells[v_b];
              for (let _i804 = 0; _i804 < _a803.length; _i804++) {
                const v_c = _a803[_i804];
                if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
                if (!((sp.lineCells[v_L].includes(v_c)))) {
                  _q801 = false;
                  break Q802;
                }
              }
            }
            let _c809: boolean = !(_q801);
            if (!_c809) {
              let _q805 = true;
              Q806: {
                const _a807 = sp.lineCells[v_L];
                for (let _i808 = 0; _i808 < _a807.length; _i808++) {
                  const v_c = _a807[_i808];
                  if (!(((sp.boxOf[v_c] !== v_b) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q805 = false;
                    break Q806;
                  }
                }
              }
              _c809 = _q805;
            }
            _c810 = _c809;
          }
          _c811 = _c810;
        }
        if (!(_c811)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, b: v_b, d: v_d, first: v_first }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface DigitSetBinding {
  d: number;
  Y0: readonly number[];
  X0: number;
  T: number;
  Y: readonly number[];
}

const digitSetFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function digitSet(b: Marks, sp: GridSpace, fire: Fire<DigitSetBinding> | null): number {
  const _g853: number[] = [];
  const _g884: number[] = [];
  const facts = digitSetFacts;
  let fired = 0;
  let changed = false;
  const _h868 = (sp.w - 1);
  const _h869 = rangeMask(0, _h868);
  for (let _m852 = b.domain; _m852 !== 0; _m852 &= _m852 - 1) {
    const v_d = 31 - Math.clz32(_m852 & -_m852);
    _g853.length = 0;
    G854: {
      const _a861 = sp.rows;
      for (let _i862 = 0; _i862 < _a861.length; _i862++) {
        const v_L = _a861[_i862];
        let _q863 = false;
        Q864: {
          const _a865 = sp.lineCells[v_L];
          for (let _i866 = 0; _i866 < _a865.length; _i866++) {
            const v_c = _a865[_i866];
            const _h867 = (b.grid[v_c] || -1);
            if ((_h867 === v_d)) {
              _q863 = true;
              break Q864;
            }
          }
        }
        if (!(!(_q863))) continue;
        _g853.push(v_L);
      }
    }
    const v_Y0 = _g853;
    const _h882 = v_Y0.length;
    const _h883 = (_h882 - 2);
    let _g870 = 0;
    G871: {
      const _a874 = cellsValued(b, sp.cells, v_d);
      for (let _i875 = 0; _i875 < _a874.length; _i875++) {
        const v_c = _a874[_i875];
        const _h876 = (b.grid[v_c] || -1);
        if (!((_h876 === v_d))) continue;
        const _t877 = (v_c % sp.w);
        _g870 |= 1 << _t877;
      }
    }
    const v_X0 = (_h869 & ~_g870);
    const _e878 = valuesOf(v_X0);
    for (let _k879 = 0; _k879 < 1 << _e878.length; _k879++) {
      let v_T = 0;
      for (let _j880 = 0; _j880 < _e878.length; _j880++) if ((_k879 >> (_e878.length - 1 - _j880)) & 1) v_T |= 1 << _e878[_j880];
      const _h881 = popcount(v_T);
      if (!(((_h881 === 0) || ((2 <= _h881) && (_h881 <= _h883))))) continue;
      const _h915 = (v_X0 & ~v_T);
      _g884.length = 0;
      G885: {
        const _a892 = v_Y0;
        for (let _i893 = 0; _i893 < _a892.length; _i893++) {
          const v_L = _a892[_i893];
          let _q894 = false;
          Q895: {
            const _a896 = sp.lineCells[v_L];
            for (let _i897 = 0; _i897 < _a896.length; _i897++) {
              const v_c = _a896[_i897];
              if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0))) {
                _q894 = true;
                break Q895;
              }
            }
          }
          if (!(!(_q894))) continue;
          _g884.push(v_L);
        }
      }
      L898: {
        const v_Y = _g884;
        const _h899 = v_Y.length;
        if (!((_h899 >= (_h882 - _h881)))) break L898;
        facts.length = 0;
        changed = false;
        let _c908: boolean = (_h881 > 0);
        if (!_c908) {
          let _q900 = true;
          Q901: {
            const _a902 = sp.rows;
            for (let _i903 = 0; _i903 < _a902.length; _i903++) {
              const v_L = _a902[_i903];
              let _q904 = false;
              Q905: {
                const _a906 = sp.lineCells[v_L];
                for (let _i907 = 0; _i907 < _a906.length; _i907++) {
                  const v_c = _a906[_i907];
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                    _q904 = true;
                    break Q905;
                  }
                }
              }
              if (!(_q904)) {
                _q900 = false;
                break Q901;
              }
            }
          }
          _c908 = _q900;
        }
        let _c916: boolean = (_c908 && (_h899 === (_h882 - _h881)));
        if (_c916) {
          let _q909 = true;
          Q910: {
            const _a911 = minus(v_Y0, v_Y);
            for (let _i912 = 0; _i912 < _a911.length; _i912++) {
              const v_L = _a911[_i912];
              const _a913 = sp.lineCells[v_L];
              for (let _i914 = 0; _i914 < _a913.length; _i914++) {
                const v_c = _a913[_i914];
                if (!(((((_h915 >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q909 = false;
                  break Q910;
                }
              }
            }
          }
          _c916 = _q909;
        }
        if (!(_c916)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, Y0: v_Y0.slice(), X0: v_X0, T: v_T, Y: v_Y.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
