// Compiled by `npm run describe` from src/games/solo/solo.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, clueAt, minus, nextOfSize, popcount, rangeMask, union, valuesOf } from "../../engine/describe-runtime.ts";

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
  let _q915 = true;
  const _n919 = new Int32Array(32);
  Q916: for (const _u917 of sp.units) {
    _n919.fill(0);
    for (const _c918 of sp.lineCells[_u917]) {
      const _t920 = (g[_c918] || -1);
      if (++_n919[_t920] > 1) {
        _q915 = false;
        break Q916;
      }
    }
  }
  if (!(_q915)) return false;
  for (let _k921 = 0; _k921 < cl.total.at.length; _k921++) {
    const _at922 = cl.total.at[_k921];
    const _v923 = cl.total.v[_k921];
    let _g924 = 0;
    G925: {
      const _a926 = cl.cage.cells[_at922];
      for (let _i927 = 0; _i927 < _a926.length; _i927++) {
        const v_c = _a926[_i927];
        _g924 += (g[v_c] || -1);
      }
    }
    let _c934 = (_g924 === _v923);
    if (_c934) {
      let _g928 = true;
      const _s930: number[] = [];
      G929: {
        const _a931 = cl.cage.cells[_at922];
        for (let _i932 = 0; _i932 < _a931.length; _i932++) {
          const v_c = _a931[_i932];
          const _t933 = (g[v_c] || -1);
          if (_s930.includes(_t933)) {
            _g928 = false;
            break G929;
          }
          _s930.push(_t933);
        }
      }
      _c934 = _g928;
    }
    if (!(_c934)) return false;
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
        if (!(b.known(v_c))) continue;
        const _t24 = b.value(v_c);
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
          if (!(b.has(v_c, v_d))) continue;
          _g26++;
        }
      }
      L30: {
        const v_n = _g26;
        if (!((v_n < 2))) break L30;
        facts.length = 0;
        changed = false;
        let _c36 = (v_n === 1);
        if (_c36) {
          let _g31 = -1;
          let _n33 = 0;
          G32: {
            const _a34 = sp.lineCells[v_u];
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_c = _a34[_i35];
              if (!(b.has(v_c, v_d))) continue;
              if (++_n33 === 2) {
                _g31 = -1;
                break G32;
              }
              _g31 = v_c;
            }
          }
          if (!b.known(_g31)) { if (fire === null) { b.placeAt(_g31, v_d); changed = true; } else facts.push(PLACE, _g31, v_d); }
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
        if (!(!(b.known(v_c)))) continue;
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
          if (!(b.known(v_c))) continue;
          _g61 += b.value(v_c);
        }
      }
      const v_t = (_h60 - _g61);
      facts.length = 0;
      changed = false;
      let _c65 = (((v_t >= 1) && (v_t <= sp.w)) && b.has(v_c, v_t));
      if (_c65) {
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_t); changed = true; } else facts.push(PLACE, v_c, v_t); }
        _c65 = true;
      }
      if (!(_c65)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K, c: v_c, t: v_t }, facts)) return 1;
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

export function regionRule(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionRuleBinding> | null): number {
  const _g131: number[] = [];
  const _g155: number[] = [];
  const _g183: number[] = [];
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
            if (!(b.known(v_c))) {
              _q146 = true;
              break Q147;
            }
          }
        }
        let _c154 = _q146;
        if (_c154) {
          let _q150 = true;
          Q151: {
            const _a152 = cl.cage.cells[v_r];
            for (let _i153 = 0; _i153 < _a152.length; _i153++) {
              const v_c = _a152[_i153];
              if (!(!(b.known(v_c)))) continue;
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
    G156: {
      const _a161 = cl.cage.parts;
      for (let _i162 = 0; _i162 < _a161.length; _i162++) {
        const v_r = _a161[_i162];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a163 = cl.cage.cells[v_r];
        for (let _i164 = 0; _i164 < _a163.length; _i164++) {
          const v_c = _a163[_i164];
          if (!((!(b.known(v_c)) && (sp.lineCells[v_u].includes(v_c))))) continue;
          if (!_g155.includes(v_c)) _g155.push(v_c);
        }
      }
    }
    L165: {
      const v_L = _g155;
      const _h166 = v_L.length;
      if (!(((_h166 > 0) && (_h166 < sp.w)))) break L165;
      let _g167 = 0;
      G168: {
        for (let _m169 = b.domain; _m169 !== 0; _m169 &= _m169 - 1) {
          const v_d = 31 - Math.clz32(_m169 & -_m169);
          _g167 += v_d;
        }
      }
      let _g170 = 0;
      G171: {
        const _a172 = sp.lineCells[v_u];
        for (let _i173 = 0; _i173 < _a172.length; _i173++) {
          const v_c = _a172[_i173];
          if (!(b.known(v_c))) continue;
          _g170 += b.value(v_c);
        }
      }
      let _g174 = 0;
      G175: {
        const _a176 = v_W;
        for (let _i177 = 0; _i177 < _a176.length; _i177++) {
          const v_r = _a176[_i177];
          const _h178 = clueAt(cl.total, v_r);
          let _g179 = 0;
          G180: {
            const _a181 = cl.cage.cells[v_r];
            for (let _i182 = 0; _i182 < _a181.length; _i182++) {
              const v_c = _a181[_i182];
              if (!(b.known(v_c))) continue;
              _g179 += b.value(v_c);
            }
          }
          _g174 += (_h178 - _g179);
        }
      }
      const v_s = ((_g167 - _g170) - _g174);
      _g183.length = 0;
      G184: {
        const _a187 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
        for (let _i188 = 0; _i188 < _a187.length; _i188++) {
          const v_c = _a187[_i188];
          if (!((!(b.known(v_c)) && !(v_L.includes(v_c))))) continue;
          _g183.push(v_c);
        }
      }
      const v_R = _g183;
      const _h199 = v_R.length;
      const _t189 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
      const _h190 = clueAt(cl.total, _t189);
      let _g191 = 0;
      G192: {
        const _a193 = cl.cage.cells[_t189];
        for (let _i194 = 0; _i194 < _a193.length; _i194++) {
          const v_c = _a193[_i194];
          if (!(b.known(v_c))) continue;
          _g191 += b.value(v_c);
        }
      }
      const v_t = ((_h190 - _g191) - v_s);
      facts.length = 0;
      changed = false;
      let _c198 = (v_s > 0);
      if (_c198) {
        let _c197 = (_h166 !== 1);
        if (!_c197) {
          let _c196 = ((v_s <= sp.w) && b.has((v_L.length > 0 ? v_L[0] : -1), v_s));
          if (_c196) {
            const _t195 = (v_L.length > 0 ? v_L[0] : -1);
            if (!b.known(_t195)) { if (fire === null) { b.placeAt(_t195, v_s); changed = true; } else facts.push(PLACE, _t195, v_s); }
            _c196 = true;
          }
          _c197 = _c196;
        }
        _c198 = _c197;
      }
      let _c208 = _c198;
      if (_c208) {
        let _c204 = ((_h166 === 1) || (_h199 !== 1));
        if (!_c204) {
          let _q200 = false;
          Q201: {
            const _a202 = v_L;
            for (let _i203 = 0; _i203 < _a202.length; _i203++) {
              const v_c = _a202[_i203];
              if ((cl.cage.of[v_c] !== cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)])) {
                _q200 = true;
                break Q201;
              }
            }
          }
          _c204 = _q200;
        }
        let _c207 = _c204;
        if (!_c207) {
          let _c206 = (((v_t >= 1) && (v_t <= sp.w)) && b.has((v_R.length > 0 ? v_R[0] : -1), v_t));
          if (_c206) {
            const _t205 = (v_R.length > 0 ? v_R[0] : -1);
            if (!b.known(_t205)) { if (fire === null) { b.placeAt(_t205, v_t); changed = true; } else facts.push(PLACE, _t205, v_t); }
            _c206 = true;
          }
          _c207 = _c206;
        }
        _c208 = _c207;
      }
      if (!(_c208)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ u: v_u, W: v_W, L: v_L, s: v_s, R: v_R, t: v_t }, facts)) return 1;
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

export function cageMinMax(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageMinMaxBinding> | null): number {
  const _g224: number[] = [];
  const facts = cageMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (cageMinMaxCands.length < sp.cells.length) cageMinMaxCands = new Int32Array(sp.cells.length);
  const cands = cageMinMaxCands;
  cands.fill(-1);
  const _a222 = cl.cage.parts;
  for (let _i223 = 0; _i223 < _a222.length; _i223++) {
    const v_r = _a222[_i223];
    const _h231 = clueAt(cl.total, v_r);
    _g224.length = 0;
    G225: {
      const _a228 = cl.cage.cells[v_r];
      for (let _i229 = 0; _i229 < _a228.length; _i229++) {
        const v_c = _a228[_i229];
        const _h230 = b.known(v_c);
        if (!(!(_h230))) continue;
        _g224.push(v_c);
      }
    }
    const v_K = _g224;
    let _g232 = 0;
    G233: {
      const _a234 = cl.cage.cells[v_r];
      for (let _i235 = 0; _i235 < _a234.length; _i235++) {
        const v_c = _a234[_i235];
        const _h236 = b.known(v_c);
        if (!(_h236)) continue;
        const _h237 = b.value(v_c);
        _g232 += _h237;
      }
    }
    L238: {
      const v_t = (_h231 - _g232);
      if (!((v_t !== 0))) break L238;
      facts.length = 0;
      changed = false;
      let _q239 = true;
      Q240: {
        const _a241 = v_K;
        for (let _i242 = 0; _i242 < _a241.length; _i242++) {
          const v_c = _a241[_i242];
          for (let _m243 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m243 !== 0; _m243 &= _m243 - 1) {
            const v_d = 31 - Math.clz32(_m243 & -_m243);
            let _g244 = 0;
            G245: {
              const _a246 = v_K;
              for (let _i247 = 0; _i247 < _a246.length; _i247++) {
                const v_x = _a246[_i247];
                if (!((v_x !== v_c))) continue;
                let _g248 = -1;
                G249: {
                  for (let _m250 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x))); _m250 !== 0; _m250 &= _m250 - 1) {
                    const v_e = 31 - Math.clz32(_m250 & -_m250);
                    if (_g248 === -1 || v_e > _g248) _g248 = v_e;
                  }
                }
                _g244 += _g248;
              }
            }
            let _c258 = ((v_d + _g244) < v_t);
            if (!_c258) {
              let _g251 = 0;
              G252: {
                const _a253 = v_K;
                for (let _i254 = 0; _i254 < _a253.length; _i254++) {
                  const v_x = _a253[_i254];
                  if (!((v_x !== v_c))) continue;
                  let _g255 = -1;
                  G256: {
                    for (let _m257 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x))); _m257 !== 0; _m257 &= _m257 - 1) {
                      const v_e = 31 - Math.clz32(_m257 & -_m257);
                      if (_g255 === -1 || v_e < _g255) _g255 = v_e;
                    }
                  }
                  _g251 += _g255;
                }
              }
              _c258 = ((v_d + _g251) > v_t);
            }
            if (!(_c258)) continue;
            if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q239 = false;
              break Q240;
            }
          }
        }
      }
      if (!(_q239)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K, t: v_t }, facts)) return 1;
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

export function partMinMax(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartMinMaxBinding> | null): number {
  const _g339: number[] = [];
  const _g365: number[] = [];
  const _g399: number[] = [];
  const _g416: number[] = [];
  const facts = partMinMaxFacts;
  let fired = 0;
  let changed = false;
  const _h414 = rangeMask(0, 1);
  if (partMinMaxCands.length < sp.cells.length) partMinMaxCands = new Int32Array(sp.cells.length);
  const cands = partMinMaxCands;
  cands.fill(-1);
  const _a337 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i338 = 0; _i338 < _a337.length; _i338++) {
    const v_u = _a337[_i338];
    _g339.length = 0;
    G340: {
      const _a352 = cl.cage.parts;
      for (let _i353 = 0; _i353 < _a352.length; _i353++) {
        const v_r = _a352[_i353];
        let _q354 = false;
        Q355: {
          const _a356 = cl.cage.cells[v_r];
          for (let _i357 = 0; _i357 < _a356.length; _i357++) {
            const v_c = _a356[_i357];
            const _h358 = b.known(v_c);
            if (!(_h358)) {
              _q354 = true;
              break Q355;
            }
          }
        }
        let _c364 = _q354;
        if (_c364) {
          let _q359 = true;
          Q360: {
            const _a361 = cl.cage.cells[v_r];
            for (let _i362 = 0; _i362 < _a361.length; _i362++) {
              const v_c = _a361[_i362];
              const _h363 = b.known(v_c);
              if (!(!(_h363))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q359 = false;
                break Q360;
              }
            }
          }
          _c364 = _q359;
        }
        if (!(_c364)) continue;
        _g339.push(v_r);
      }
    }
    const v_W = _g339;
    _g365.length = 0;
    G366: {
      const _a371 = cl.cage.parts;
      for (let _i372 = 0; _i372 < _a371.length; _i372++) {
        const v_r = _a371[_i372];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a373 = cl.cage.cells[v_r];
        for (let _i374 = 0; _i374 < _a373.length; _i374++) {
          const v_c = _a373[_i374];
          const _h375 = b.known(v_c);
          if (!((!(_h375) && (sp.lineCells[v_u].includes(v_c))))) continue;
          if (!_g365.includes(v_c)) _g365.push(v_c);
        }
      }
    }
    L376: {
      const v_L = _g365;
      const _h377 = v_L.length;
      if (!(((_h377 > 1) && (_h377 < sp.w)))) break L376;
      let _g378 = 0;
      G379: {
        for (let _m380 = b.domain; _m380 !== 0; _m380 &= _m380 - 1) {
          const v_d = 31 - Math.clz32(_m380 & -_m380);
          _g378 += v_d;
        }
      }
      let _g381 = 0;
      G382: {
        const _a383 = sp.lineCells[v_u];
        for (let _i384 = 0; _i384 < _a383.length; _i384++) {
          const v_c = _a383[_i384];
          const _h385 = b.known(v_c);
          if (!(_h385)) continue;
          const _h386 = b.value(v_c);
          _g381 += _h386;
        }
      }
      let _g387 = 0;
      G388: {
        const _a389 = v_W;
        for (let _i390 = 0; _i390 < _a389.length; _i390++) {
          const v_r = _a389[_i390];
          const _h391 = clueAt(cl.total, v_r);
          let _g392 = 0;
          G393: {
            const _a394 = cl.cage.cells[v_r];
            for (let _i395 = 0; _i395 < _a394.length; _i395++) {
              const v_c = _a394[_i395];
              const _h396 = b.known(v_c);
              if (!(_h396)) continue;
              const _h397 = b.value(v_c);
              _g392 += _h397;
            }
          }
          _g387 += (_h391 - _g392);
        }
      }
      L398: {
        const v_s = ((_g378 - _g381) - _g387);
        if (!((v_s > 0))) break L398;
        _g399.length = 0;
        G400: {
          const _a403 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i404 = 0; _i404 < _a403.length; _i404++) {
            const v_c = _a403[_i404];
            const _h405 = b.known(v_c);
            if (!((!(_h405) && !(v_L.includes(v_c))))) continue;
            _g399.push(v_c);
          }
        }
        const v_R = _g399;
        const _t406 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h407 = clueAt(cl.total, _t406);
        let _g408 = 0;
        G409: {
          const _a410 = cl.cage.cells[_t406];
          for (let _i411 = 0; _i411 < _a410.length; _i411++) {
            const v_c = _a410[_i411];
            const _h412 = b.known(v_c);
            if (!(_h412)) continue;
            const _h413 = b.value(v_c);
            _g408 += _h413;
          }
        }
        const v_t = ((_h407 - _g408) - v_s);
        for (let _m415 = _h414; _m415 !== 0; _m415 &= _m415 - 1) {
          const v_i = 31 - Math.clz32(_m415 & -_m415);
          const _h422 = (v_i === 0);
          _g416.length = 0;
          G417: {
            const _a420 = union(v_L, v_R);
            for (let _i421 = 0; _i421 < _a420.length; _i421++) {
              const v_c = _a420[_i421];
              if (!((_h422 === (v_L.includes(v_c))))) continue;
              _g416.push(v_c);
            }
          }
          const v_K = _g416;
          const _h424 = v_K.length;
          L423: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c430 = ((_h424 > 1) && (v_v !== 0));
            if (_c430) {
              let _c429 = (v_i === 0);
              if (!_c429) {
                let _q425 = true;
                Q426: {
                  const _a427 = v_L;
                  for (let _i428 = 0; _i428 < _a427.length; _i428++) {
                    const v_c = _a427[_i428];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q425 = false;
                      break Q426;
                    }
                  }
                }
                _c429 = _q425;
              }
              _c430 = _c429;
            }
            if (!(_c430)) break L423;
            facts.length = 0;
            changed = false;
            let _q431 = true;
            Q432: {
              const _a433 = v_K;
              for (let _i434 = 0; _i434 < _a433.length; _i434++) {
                const v_c = _a433[_i434];
                for (let _m435 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m435 !== 0; _m435 &= _m435 - 1) {
                  const v_d = 31 - Math.clz32(_m435 & -_m435);
                  let _g436 = 0;
                  G437: {
                    const _a438 = v_K;
                    for (let _i439 = 0; _i439 < _a438.length; _i439++) {
                      const v_x = _a438[_i439];
                      if (!((v_x !== v_c))) continue;
                      let _g440 = -1;
                      G441: {
                        for (let _m442 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x))); _m442 !== 0; _m442 &= _m442 - 1) {
                          const v_e = 31 - Math.clz32(_m442 & -_m442);
                          if (_g440 === -1 || v_e > _g440) _g440 = v_e;
                        }
                      }
                      _g436 += _g440;
                    }
                  }
                  let _c450 = ((v_d + _g436) < v_v);
                  if (!_c450) {
                    let _g443 = 0;
                    G444: {
                      const _a445 = v_K;
                      for (let _i446 = 0; _i446 < _a445.length; _i446++) {
                        const v_x = _a445[_i446];
                        if (!((v_x !== v_c))) continue;
                        let _g447 = -1;
                        G448: {
                          for (let _m449 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x))); _m449 !== 0; _m449 &= _m449 - 1) {
                            const v_e = 31 - Math.clz32(_m449 & -_m449);
                            if (_g447 === -1 || v_e < _g447) _g447 = v_e;
                          }
                        }
                        _g443 += _g447;
                      }
                    }
                    _c450 = ((v_d + _g443) > v_v);
                  }
                  if (!(_c450)) continue;
                  if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q431 = false;
                    break Q432;
                  }
                }
              }
            }
            if (!(_q431)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ u: v_u, W: v_W, L: v_L, s: v_s, R: v_R, t: v_t, i: v_i, K: v_K, v: v_v }, facts)) return 1;
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

export function cageSums(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageSumsBinding> | null): number {
  const _g466: number[] = [];
  const facts = cageSumsFacts;
  let fired = 0;
  let changed = false;
  if (cageSumsCands.length < sp.cells.length) cageSumsCands = new Int32Array(sp.cells.length);
  const cands = cageSumsCands;
  cands.fill(-1);
  const _a464 = cl.cage.parts;
  for (let _i465 = 0; _i465 < _a464.length; _i465++) {
    const v_r = _a464[_i465];
    const _h473 = clueAt(cl.total, v_r);
    _g466.length = 0;
    G467: {
      const _a470 = cl.cage.cells[v_r];
      for (let _i471 = 0; _i471 < _a470.length; _i471++) {
        const v_c = _a470[_i471];
        const _h472 = b.known(v_c);
        if (!(!(_h472))) continue;
        _g466.push(v_c);
      }
    }
    const v_K = _g466;
    const _h481 = v_K.length;
    let _g474 = 0;
    G475: {
      const _a476 = cl.cage.cells[v_r];
      for (let _i477 = 0; _i477 < _a476.length; _i477++) {
        const v_c = _a476[_i477];
        const _h478 = b.known(v_c);
        if (!(_h478)) continue;
        const _h479 = b.value(v_c);
        _g474 += _h479;
      }
    }
    L480: {
      const v_t = (_h473 - _g474);
      if (!((v_t !== 0))) break L480;
      facts.length = 0;
      changed = false;
      let _c524 = (_h481 > 0);
      if (_c524) {
        let _c523 = ((_h481 < 2) || (_h481 > 4));
        if (!_c523) {
          let _q482 = true;
          Q483: {
            let _g484 = 0;
            G485: {
              const _e501 = valuesOf(b.domain);
              const _n504 = 1 << _e501.length;
              for (let _k502 = _h481 > _e501.length ? _n504 : (1 << _h481) - 1; _k502 < _n504; _k502 = _h481 === 0 ? _n504 : nextOfSize(_k502)) {
                let v_T = 0;
                for (let _j503 = 0; _j503 < _e501.length; _j503++) if ((_k502 >> (_e501.length - 1 - _j503)) & 1) v_T |= 1 << _e501[_j503];
                const _h505 = popcount(v_T);
                let _c509 = (_h505 === _h481);
                if (_c509) {
                  let _g506 = 0;
                  G507: {
                    for (let _m508 = v_T; _m508 !== 0; _m508 &= _m508 - 1) {
                      const v_e = 31 - Math.clz32(_m508 & -_m508);
                      _g506 += v_e;
                    }
                  }
                  _c509 = (_g506 === v_t);
                }
                let _c514 = _c509;
                if (_c514) {
                  let _q510 = true;
                  Q511: {
                    const _a512 = v_K;
                    for (let _i513 = 0; _i513 < _a512.length; _i513++) {
                      const v_x = _a512[_i513];
                      if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x)))) !== 0))) {
                        _q510 = false;
                        break Q511;
                      }
                    }
                  }
                  _c514 = _q510;
                }
                if (!(_c514)) continue;
                for (let _m515 = v_T; _m515 !== 0; _m515 &= _m515 - 1) {
                  const v_d = 31 - Math.clz32(_m515 & -_m515);
                  _g484 |= 1 << v_d;
                }
              }
            }
            const v_P = _g484;
            const _h516 = popcount(v_P);
            let _c522 = (_h516 > 0);
            if (_c522) {
              let _q517 = true;
              Q518: {
                const _a519 = v_K;
                for (let _i520 = 0; _i520 < _a519.length; _i520++) {
                  const v_c = _a519[_i520];
                  for (let _m521 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m521 !== 0; _m521 &= _m521 - 1) {
                    const v_d = 31 - Math.clz32(_m521 & -_m521);
                    if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                    if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                    if (!(true)) {
                      _q517 = false;
                      break Q518;
                    }
                  }
                }
              }
              _c522 = _q517;
            }
            if (!(_c522)) {
              _q482 = false;
              break Q483;
            }
          }
          _c523 = _q482;
        }
        _c524 = _c523;
      }
      if (!(_c524)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K, t: v_t }, facts)) return 1;
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

export function partSums(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartSumsBinding> | null): number {
  const _g605: number[] = [];
  const _g631: number[] = [];
  const _g665: number[] = [];
  const _g682: number[] = [];
  const facts = partSumsFacts;
  let fired = 0;
  let changed = false;
  const _h680 = rangeMask(0, 1);
  if (partSumsCands.length < sp.cells.length) partSumsCands = new Int32Array(sp.cells.length);
  const cands = partSumsCands;
  cands.fill(-1);
  const _a603 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i604 = 0; _i604 < _a603.length; _i604++) {
    const v_u = _a603[_i604];
    _g605.length = 0;
    G606: {
      const _a618 = cl.cage.parts;
      for (let _i619 = 0; _i619 < _a618.length; _i619++) {
        const v_r = _a618[_i619];
        let _q620 = false;
        Q621: {
          const _a622 = cl.cage.cells[v_r];
          for (let _i623 = 0; _i623 < _a622.length; _i623++) {
            const v_c = _a622[_i623];
            const _h624 = b.known(v_c);
            if (!(_h624)) {
              _q620 = true;
              break Q621;
            }
          }
        }
        let _c630 = _q620;
        if (_c630) {
          let _q625 = true;
          Q626: {
            const _a627 = cl.cage.cells[v_r];
            for (let _i628 = 0; _i628 < _a627.length; _i628++) {
              const v_c = _a627[_i628];
              const _h629 = b.known(v_c);
              if (!(!(_h629))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q625 = false;
                break Q626;
              }
            }
          }
          _c630 = _q625;
        }
        if (!(_c630)) continue;
        _g605.push(v_r);
      }
    }
    const v_W = _g605;
    _g631.length = 0;
    G632: {
      const _a637 = cl.cage.parts;
      for (let _i638 = 0; _i638 < _a637.length; _i638++) {
        const v_r = _a637[_i638];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a639 = cl.cage.cells[v_r];
        for (let _i640 = 0; _i640 < _a639.length; _i640++) {
          const v_c = _a639[_i640];
          const _h641 = b.known(v_c);
          if (!((!(_h641) && (sp.lineCells[v_u].includes(v_c))))) continue;
          if (!_g631.includes(v_c)) _g631.push(v_c);
        }
      }
    }
    L642: {
      const v_L = _g631;
      const _h643 = v_L.length;
      if (!(((_h643 > 1) && (_h643 < sp.w)))) break L642;
      let _g644 = 0;
      G645: {
        for (let _m646 = b.domain; _m646 !== 0; _m646 &= _m646 - 1) {
          const v_d = 31 - Math.clz32(_m646 & -_m646);
          _g644 += v_d;
        }
      }
      let _g647 = 0;
      G648: {
        const _a649 = sp.lineCells[v_u];
        for (let _i650 = 0; _i650 < _a649.length; _i650++) {
          const v_c = _a649[_i650];
          const _h651 = b.known(v_c);
          if (!(_h651)) continue;
          const _h652 = b.value(v_c);
          _g647 += _h652;
        }
      }
      let _g653 = 0;
      G654: {
        const _a655 = v_W;
        for (let _i656 = 0; _i656 < _a655.length; _i656++) {
          const v_r = _a655[_i656];
          const _h657 = clueAt(cl.total, v_r);
          let _g658 = 0;
          G659: {
            const _a660 = cl.cage.cells[v_r];
            for (let _i661 = 0; _i661 < _a660.length; _i661++) {
              const v_c = _a660[_i661];
              const _h662 = b.known(v_c);
              if (!(_h662)) continue;
              const _h663 = b.value(v_c);
              _g658 += _h663;
            }
          }
          _g653 += (_h657 - _g658);
        }
      }
      L664: {
        const v_s = ((_g644 - _g647) - _g653);
        if (!((v_s > 0))) break L664;
        _g665.length = 0;
        G666: {
          const _a669 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i670 = 0; _i670 < _a669.length; _i670++) {
            const v_c = _a669[_i670];
            const _h671 = b.known(v_c);
            if (!((!(_h671) && !(v_L.includes(v_c))))) continue;
            _g665.push(v_c);
          }
        }
        const v_R = _g665;
        const _t672 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h673 = clueAt(cl.total, _t672);
        let _g674 = 0;
        G675: {
          const _a676 = cl.cage.cells[_t672];
          for (let _i677 = 0; _i677 < _a676.length; _i677++) {
            const v_c = _a676[_i677];
            const _h678 = b.known(v_c);
            if (!(_h678)) continue;
            const _h679 = b.value(v_c);
            _g674 += _h679;
          }
        }
        const v_t = ((_h673 - _g674) - v_s);
        for (let _m681 = _h680; _m681 !== 0; _m681 &= _m681 - 1) {
          const v_i = 31 - Math.clz32(_m681 & -_m681);
          const _h688 = (v_i === 0);
          _g682.length = 0;
          G683: {
            const _a686 = union(v_L, v_R);
            for (let _i687 = 0; _i687 < _a686.length; _i687++) {
              const v_c = _a686[_i687];
              if (!((_h688 === (v_L.includes(v_c))))) continue;
              _g682.push(v_c);
            }
          }
          const v_K = _g682;
          const _h690 = v_K.length;
          L689: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c696 = (((_h690 > 1) && (_h690 <= 4)) && (v_v !== 0));
            if (_c696) {
              let _c695 = (v_i === 0);
              if (!_c695) {
                let _q691 = true;
                Q692: {
                  const _a693 = v_L;
                  for (let _i694 = 0; _i694 < _a693.length; _i694++) {
                    const v_c = _a693[_i694];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q691 = false;
                      break Q692;
                    }
                  }
                }
                _c695 = _q691;
              }
              _c696 = _c695;
            }
            if (!(_c696)) break L689;
            facts.length = 0;
            changed = false;
            let _q697 = true;
            Q698: {
              let _g699 = 0;
              G700: {
                const _e716 = valuesOf(b.domain);
                const _n719 = 1 << _e716.length;
                for (let _k717 = _h690 > _e716.length ? _n719 : (1 << _h690) - 1; _k717 < _n719; _k717 = _h690 === 0 ? _n719 : nextOfSize(_k717)) {
                  let v_T = 0;
                  for (let _j718 = 0; _j718 < _e716.length; _j718++) if ((_k717 >> (_e716.length - 1 - _j718)) & 1) v_T |= 1 << _e716[_j718];
                  const _h720 = popcount(v_T);
                  let _c724 = (_h720 === _h690);
                  if (_c724) {
                    let _g721 = 0;
                    G722: {
                      for (let _m723 = v_T; _m723 !== 0; _m723 &= _m723 - 1) {
                        const v_e = 31 - Math.clz32(_m723 & -_m723);
                        _g721 += v_e;
                      }
                    }
                    _c724 = (_g721 === v_v);
                  }
                  let _c729 = _c724;
                  if (_c729) {
                    let _q725 = true;
                    Q726: {
                      const _a727 = v_K;
                      for (let _i728 = 0; _i728 < _a727.length; _i728++) {
                        const v_x = _a727[_i728];
                        if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x)))) !== 0))) {
                          _q725 = false;
                          break Q726;
                        }
                      }
                    }
                    _c729 = _q725;
                  }
                  if (!(_c729)) continue;
                  for (let _m730 = v_T; _m730 !== 0; _m730 &= _m730 - 1) {
                    const v_d = 31 - Math.clz32(_m730 & -_m730);
                    _g699 |= 1 << v_d;
                  }
                }
              }
              const v_P = _g699;
              const _h731 = popcount(v_P);
              let _c737 = (_h731 > 0);
              if (_c737) {
                let _q732 = true;
                Q733: {
                  const _a734 = v_K;
                  for (let _i735 = 0; _i735 < _a734.length; _i735++) {
                    const v_c = _a734[_i735];
                    for (let _m736 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m736 !== 0; _m736 &= _m736 - 1) {
                      const v_d = 31 - Math.clz32(_m736 & -_m736);
                      if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                      if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                      if (!(true)) {
                        _q732 = false;
                        break Q733;
                      }
                    }
                  }
                }
                _c737 = _q732;
              }
              if (!(_c737)) {
                _q697 = false;
                break Q698;
              }
            }
            if (!(_q697)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ u: v_u, W: v_W, L: v_L, s: v_s, R: v_R, t: v_t, i: v_i, K: v_K, v: v_v }, facts)) return 1;
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

export function intersect(b: Marks, sp: GridSpace, fire: Fire<IntersectBinding> | null): number {
  const facts = intersectFacts;
  let fired = 0;
  let changed = false;
  const _a765 = union(union(sp.rows, sp.cols), sp.diagonals);
  for (let _i766 = 0; _i766 < _a765.length; _i766++) {
    const v_L = _a765[_i766];
    const _a767 = sp.boxes;
    for (let _i768 = 0; _i768 < _a767.length; _i768++) {
      const v_b = _a767[_i768];
      let _q769 = false;
      Q770: {
        const _a771 = sp.lineCells[v_L];
        for (let _i772 = 0; _i772 < _a771.length; _i772++) {
          const v_c = _a771[_i772];
          if ((sp.boxOf[v_c] === v_b)) {
            _q769 = true;
            break Q770;
          }
        }
      }
      if (!(_q769)) continue;
      for (let _m773 = b.domain; _m773 !== 0; _m773 &= _m773 - 1) {
        const v_d = 31 - Math.clz32(_m773 & -_m773);
        let _q774 = false;
        Q775: {
          const _a776 = sp.lineCells[v_L];
          for (let _i777 = 0; _i777 < _a776.length; _i777++) {
            const v_c = _a776[_i777];
            const _h778 = b.value(v_c);
            if ((_h778 === v_d)) {
              _q774 = true;
              break Q775;
            }
          }
        }
        let _c784 = !(_q774);
        if (_c784) {
          let _q779 = false;
          Q780: {
            const _a781 = sp.lineCells[v_b];
            for (let _i782 = 0; _i782 < _a781.length; _i782++) {
              const v_c = _a781[_i782];
              const _h783 = b.value(v_c);
              if ((_h783 === v_d)) {
                _q779 = true;
                break Q780;
              }
            }
          }
          _c784 = !(_q779);
        }
        if (!(_c784)) continue;
        let _q785 = true;
        Q786: {
          const _a787 = sp.lineCells[v_L];
          for (let _i788 = 0; _i788 < _a787.length; _i788++) {
            const v_c = _a787[_i788];
            if (!(b.has(v_c, v_d))) continue;
            if (!((sp.boxOf[v_c] === v_b))) {
              _q785 = false;
              break Q786;
            }
          }
        }
        let _c793 = _q785;
        if (_c793) {
          let _q789 = false;
          Q790: {
            const _a791 = sp.lineCells[v_b];
            for (let _i792 = 0; _i792 < _a791.length; _i792++) {
              const v_c = _a791[_i792];
              if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
              if (b.has(v_c, v_d)) {
                _q789 = true;
                break Q790;
              }
            }
          }
          _c793 = _q789;
        }
        const v_first = _c793;
        facts.length = 0;
        changed = false;
        let _c798 = !(v_first);
        if (!_c798) {
          let _q794 = true;
          Q795: {
            const _a796 = sp.lineCells[v_b];
            for (let _i797 = 0; _i797 < _a796.length; _i797++) {
              const v_c = _a796[_i797];
              if (!((!(sp.lineCells[v_L].includes(v_c)) && b.has(v_c, v_d)))) continue;
              if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q794 = false;
                break Q795;
              }
            }
          }
          _c798 = _q794;
        }
        let _c809 = _c798;
        if (_c809) {
          let _c808 = v_first;
          if (!_c808) {
            let _q799 = true;
            Q800: {
              const _a801 = sp.lineCells[v_b];
              for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                const v_c = _a801[_i802];
                if (!(b.has(v_c, v_d))) continue;
                if (!((sp.lineCells[v_L].includes(v_c)))) {
                  _q799 = false;
                  break Q800;
                }
              }
            }
            let _c807 = !(_q799);
            if (!_c807) {
              let _q803 = true;
              Q804: {
                const _a805 = sp.lineCells[v_L];
                for (let _i806 = 0; _i806 < _a805.length; _i806++) {
                  const v_c = _a805[_i806];
                  if (!(((sp.boxOf[v_c] !== v_b) && b.has(v_c, v_d)))) continue;
                  if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q803 = false;
                    break Q804;
                  }
                }
              }
              _c807 = _q803;
            }
            _c808 = _c807;
          }
          _c809 = _c808;
        }
        if (!(_c809)) return -1;
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

export function digitSet(b: Marks, sp: GridSpace, fire: Fire<DigitSetBinding> | null): number {
  const _g851: number[] = [];
  const _g882: number[] = [];
  const facts = digitSetFacts;
  let fired = 0;
  let changed = false;
  const _h866 = (sp.w - 1);
  const _h867 = rangeMask(0, _h866);
  for (let _m850 = b.domain; _m850 !== 0; _m850 &= _m850 - 1) {
    const v_d = 31 - Math.clz32(_m850 & -_m850);
    _g851.length = 0;
    G852: {
      const _a859 = sp.rows;
      for (let _i860 = 0; _i860 < _a859.length; _i860++) {
        const v_L = _a859[_i860];
        let _q861 = false;
        Q862: {
          const _a863 = sp.lineCells[v_L];
          for (let _i864 = 0; _i864 < _a863.length; _i864++) {
            const v_c = _a863[_i864];
            const _h865 = b.value(v_c);
            if ((_h865 === v_d)) {
              _q861 = true;
              break Q862;
            }
          }
        }
        if (!(!(_q861))) continue;
        _g851.push(v_L);
      }
    }
    const v_Y0 = _g851;
    const _h880 = v_Y0.length;
    const _h881 = (_h880 - 2);
    let _g868 = 0;
    G869: {
      const _a872 = sp.cells;
      for (let _i873 = 0; _i873 < _a872.length; _i873++) {
        const v_c = _a872[_i873];
        const _h874 = b.value(v_c);
        if (!((_h874 === v_d))) continue;
        const _t875 = (v_c % sp.w);
        _g868 |= 1 << _t875;
      }
    }
    const v_X0 = (_h867 & ~_g868);
    const _e876 = valuesOf(v_X0);
    for (let _k877 = 0; _k877 < 1 << _e876.length; _k877++) {
      let v_T = 0;
      for (let _j878 = 0; _j878 < _e876.length; _j878++) if ((_k877 >> (_e876.length - 1 - _j878)) & 1) v_T |= 1 << _e876[_j878];
      const _h879 = popcount(v_T);
      if (!(((_h879 === 0) || ((2 <= _h879) && (_h879 <= _h881))))) continue;
      const _h913 = (v_X0 & ~v_T);
      _g882.length = 0;
      G883: {
        const _a890 = v_Y0;
        for (let _i891 = 0; _i891 < _a890.length; _i891++) {
          const v_L = _a890[_i891];
          let _q892 = false;
          Q893: {
            const _a894 = sp.lineCells[v_L];
            for (let _i895 = 0; _i895 < _a894.length; _i895++) {
              const v_c = _a894[_i895];
              if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && b.has(v_c, v_d))) {
                _q892 = true;
                break Q893;
              }
            }
          }
          if (!(!(_q892))) continue;
          _g882.push(v_L);
        }
      }
      L896: {
        const v_Y = _g882;
        const _h897 = v_Y.length;
        if (!((_h897 >= (_h880 - _h879)))) break L896;
        facts.length = 0;
        changed = false;
        let _c906 = (_h879 > 0);
        if (!_c906) {
          let _q898 = true;
          Q899: {
            const _a900 = sp.rows;
            for (let _i901 = 0; _i901 < _a900.length; _i901++) {
              const v_L = _a900[_i901];
              let _q902 = false;
              Q903: {
                const _a904 = sp.lineCells[v_L];
                for (let _i905 = 0; _i905 < _a904.length; _i905++) {
                  const v_c = _a904[_i905];
                  if (b.has(v_c, v_d)) {
                    _q902 = true;
                    break Q903;
                  }
                }
              }
              if (!(_q902)) {
                _q898 = false;
                break Q899;
              }
            }
          }
          _c906 = _q898;
        }
        let _c914 = (_c906 && (_h897 === (_h880 - _h879)));
        if (_c914) {
          let _q907 = true;
          Q908: {
            const _a909 = minus(v_Y0, v_Y);
            for (let _i910 = 0; _i910 < _a909.length; _i910++) {
              const v_L = _a909[_i910];
              const _a911 = sp.lineCells[v_L];
              for (let _i912 = 0; _i912 < _a911.length; _i912++) {
                const v_c = _a911[_i912];
                if (!(((((_h913 >> (v_c % sp.w)) & 1) !== 0) && b.has(v_c, v_d)))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q907 = false;
                  break Q908;
                }
              }
            }
          }
          _c914 = _q907;
        }
        if (!(_c914)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, Y0: v_Y0, X0: v_X0, T: v_T, Y: v_Y }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
