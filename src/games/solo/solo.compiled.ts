// Compiled by `npm run describe` from src/games/solo/solo.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, clueAt, minus, popcount, rangeMask, union, valuesOf } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, and its clues by kind. */
export interface Dealt {
  cage: Partition;
  total: ClueList;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "boxSingle" | "cageSingle" | "regionRule" | "cageMinMax" | "partMinMax" | "cageSums" | "partSums" | "latin.hiddenSingle" | "latin.single" | "intersect" | "latin.set" | "digitSet" | "latin.wing";

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, and the cap from which it no longer runs where it has one, in the
 * order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number }[] = [
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

export interface BoxSingleBinding {
  u: number;
  placed: number;
  d: number;
  n: number;
}

const boxSingleFacts: number[] = [];
let boxSingleCands = new Int32Array(0);

export function boxSingle(b: Marks, sp: GridSpace, fire: Fire<BoxSingleBinding> | null): number {
  const facts = boxSingleFacts;
  let fired = 0;
  let changed = false;
  if (boxSingleCands.length < sp.cells.length) boxSingleCands = new Int32Array(sp.cells.length);
  const cands = boxSingleCands;
  cands.fill(-1);
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
          cands.fill(-1);
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
let cageSingleCands = new Int32Array(0);

export function cageSingle(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageSingleBinding> | null): number {
  const _g52: number[] = [];
  const facts = cageSingleFacts;
  let fired = 0;
  let changed = false;
  if (cageSingleCands.length < sp.cells.length) cageSingleCands = new Int32Array(sp.cells.length);
  const cands = cageSingleCands;
  cands.fill(-1);
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
        cands.fill(-1);
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
let regionRuleCands = new Int32Array(0);

export function regionRule(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionRuleBinding> | null): number {
  const _g131: number[] = [];
  const _g155: number[] = [];
  const _g183: number[] = [];
  const facts = regionRuleFacts;
  let fired = 0;
  let changed = false;
  if (regionRuleCands.length < sp.cells.length) regionRuleCands = new Int32Array(sp.cells.length);
  const cands = regionRuleCands;
  cands.fill(-1);
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
        cands.fill(-1);
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
        const _h237 = b.value(v_c);
        if (!(_h236)) continue;
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
          const _h386 = b.value(v_c);
          if (!(_h385)) continue;
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
              const _h397 = b.value(v_c);
              if (!(_h396)) continue;
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
            const _h413 = b.value(v_c);
            if (!(_h412)) continue;
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
        const _h479 = b.value(v_c);
        if (!(_h478)) continue;
        _g474 += _h479;
      }
    }
    L480: {
      const v_t = (_h473 - _g474);
      if (!((v_t !== 0))) break L480;
      facts.length = 0;
      changed = false;
      let _c521 = (_h481 > 0);
      if (_c521) {
        let _c520 = ((_h481 < 2) || (_h481 > 4));
        if (!_c520) {
          let _q482 = true;
          Q483: {
            let _g484 = 0;
            G485: {
              const _e499 = valuesOf(b.domain);
              for (let _k500 = 0; _k500 < 1 << _e499.length; _k500++) {
                let v_T = 0;
                for (let _j501 = 0; _j501 < _e499.length; _j501++) if ((_k500 >> (_e499.length - 1 - _j501)) & 1) v_T |= 1 << _e499[_j501];
                const _h502 = popcount(v_T);
                let _c506 = (_h502 === _h481);
                if (_c506) {
                  let _g503 = 0;
                  G504: {
                    for (let _m505 = v_T; _m505 !== 0; _m505 &= _m505 - 1) {
                      const v_e = 31 - Math.clz32(_m505 & -_m505);
                      _g503 += v_e;
                    }
                  }
                  _c506 = (_g503 === v_t);
                }
                let _c511 = _c506;
                if (_c511) {
                  let _q507 = true;
                  Q508: {
                    const _a509 = v_K;
                    for (let _i510 = 0; _i510 < _a509.length; _i510++) {
                      const v_x = _a509[_i510];
                      if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x)))) !== 0))) {
                        _q507 = false;
                        break Q508;
                      }
                    }
                  }
                  _c511 = _q507;
                }
                if (!(_c511)) continue;
                for (let _m512 = v_T; _m512 !== 0; _m512 &= _m512 - 1) {
                  const v_d = 31 - Math.clz32(_m512 & -_m512);
                  _g484 |= 1 << v_d;
                }
              }
            }
            const v_P = _g484;
            const _h513 = popcount(v_P);
            let _c519 = (_h513 > 0);
            if (_c519) {
              let _q514 = true;
              Q515: {
                const _a516 = v_K;
                for (let _i517 = 0; _i517 < _a516.length; _i517++) {
                  const v_c = _a516[_i517];
                  for (let _m518 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m518 !== 0; _m518 &= _m518 - 1) {
                    const v_d = 31 - Math.clz32(_m518 & -_m518);
                    if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                    if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                    if (!(true)) {
                      _q514 = false;
                      break Q515;
                    }
                  }
                }
              }
              _c519 = _q514;
            }
            if (!(_c519)) {
              _q482 = false;
              break Q483;
            }
          }
          _c520 = _q482;
        }
        _c521 = _c520;
      }
      if (!(_c521)) return -1;
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
  const _g602: number[] = [];
  const _g628: number[] = [];
  const _g662: number[] = [];
  const _g679: number[] = [];
  const facts = partSumsFacts;
  let fired = 0;
  let changed = false;
  const _h677 = rangeMask(0, 1);
  if (partSumsCands.length < sp.cells.length) partSumsCands = new Int32Array(sp.cells.length);
  const cands = partSumsCands;
  cands.fill(-1);
  const _a600 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i601 = 0; _i601 < _a600.length; _i601++) {
    const v_u = _a600[_i601];
    _g602.length = 0;
    G603: {
      const _a615 = cl.cage.parts;
      for (let _i616 = 0; _i616 < _a615.length; _i616++) {
        const v_r = _a615[_i616];
        let _q617 = false;
        Q618: {
          const _a619 = cl.cage.cells[v_r];
          for (let _i620 = 0; _i620 < _a619.length; _i620++) {
            const v_c = _a619[_i620];
            const _h621 = b.known(v_c);
            if (!(_h621)) {
              _q617 = true;
              break Q618;
            }
          }
        }
        let _c627 = _q617;
        if (_c627) {
          let _q622 = true;
          Q623: {
            const _a624 = cl.cage.cells[v_r];
            for (let _i625 = 0; _i625 < _a624.length; _i625++) {
              const v_c = _a624[_i625];
              const _h626 = b.known(v_c);
              if (!(!(_h626))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q622 = false;
                break Q623;
              }
            }
          }
          _c627 = _q622;
        }
        if (!(_c627)) continue;
        _g602.push(v_r);
      }
    }
    const v_W = _g602;
    _g628.length = 0;
    G629: {
      const _a634 = cl.cage.parts;
      for (let _i635 = 0; _i635 < _a634.length; _i635++) {
        const v_r = _a634[_i635];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a636 = cl.cage.cells[v_r];
        for (let _i637 = 0; _i637 < _a636.length; _i637++) {
          const v_c = _a636[_i637];
          const _h638 = b.known(v_c);
          if (!((!(_h638) && (sp.lineCells[v_u].includes(v_c))))) continue;
          if (!_g628.includes(v_c)) _g628.push(v_c);
        }
      }
    }
    L639: {
      const v_L = _g628;
      const _h640 = v_L.length;
      if (!(((_h640 > 1) && (_h640 < sp.w)))) break L639;
      let _g641 = 0;
      G642: {
        for (let _m643 = b.domain; _m643 !== 0; _m643 &= _m643 - 1) {
          const v_d = 31 - Math.clz32(_m643 & -_m643);
          _g641 += v_d;
        }
      }
      let _g644 = 0;
      G645: {
        const _a646 = sp.lineCells[v_u];
        for (let _i647 = 0; _i647 < _a646.length; _i647++) {
          const v_c = _a646[_i647];
          const _h648 = b.known(v_c);
          const _h649 = b.value(v_c);
          if (!(_h648)) continue;
          _g644 += _h649;
        }
      }
      let _g650 = 0;
      G651: {
        const _a652 = v_W;
        for (let _i653 = 0; _i653 < _a652.length; _i653++) {
          const v_r = _a652[_i653];
          const _h654 = clueAt(cl.total, v_r);
          let _g655 = 0;
          G656: {
            const _a657 = cl.cage.cells[v_r];
            for (let _i658 = 0; _i658 < _a657.length; _i658++) {
              const v_c = _a657[_i658];
              const _h659 = b.known(v_c);
              const _h660 = b.value(v_c);
              if (!(_h659)) continue;
              _g655 += _h660;
            }
          }
          _g650 += (_h654 - _g655);
        }
      }
      L661: {
        const v_s = ((_g641 - _g644) - _g650);
        if (!((v_s > 0))) break L661;
        _g662.length = 0;
        G663: {
          const _a666 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i667 = 0; _i667 < _a666.length; _i667++) {
            const v_c = _a666[_i667];
            const _h668 = b.known(v_c);
            if (!((!(_h668) && !(v_L.includes(v_c))))) continue;
            _g662.push(v_c);
          }
        }
        const v_R = _g662;
        const _t669 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h670 = clueAt(cl.total, _t669);
        let _g671 = 0;
        G672: {
          const _a673 = cl.cage.cells[_t669];
          for (let _i674 = 0; _i674 < _a673.length; _i674++) {
            const v_c = _a673[_i674];
            const _h675 = b.known(v_c);
            const _h676 = b.value(v_c);
            if (!(_h675)) continue;
            _g671 += _h676;
          }
        }
        const v_t = ((_h670 - _g671) - v_s);
        for (let _m678 = _h677; _m678 !== 0; _m678 &= _m678 - 1) {
          const v_i = 31 - Math.clz32(_m678 & -_m678);
          const _h685 = (v_i === 0);
          _g679.length = 0;
          G680: {
            const _a683 = union(v_L, v_R);
            for (let _i684 = 0; _i684 < _a683.length; _i684++) {
              const v_c = _a683[_i684];
              if (!((_h685 === (v_L.includes(v_c))))) continue;
              _g679.push(v_c);
            }
          }
          const v_K = _g679;
          const _h687 = v_K.length;
          L686: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c693 = (((_h687 > 1) && (_h687 <= 4)) && (v_v !== 0));
            if (_c693) {
              let _c692 = (v_i === 0);
              if (!_c692) {
                let _q688 = true;
                Q689: {
                  const _a690 = v_L;
                  for (let _i691 = 0; _i691 < _a690.length; _i691++) {
                    const v_c = _a690[_i691];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q688 = false;
                      break Q689;
                    }
                  }
                }
                _c692 = _q688;
              }
              _c693 = _c692;
            }
            if (!(_c693)) break L686;
            facts.length = 0;
            changed = false;
            let _q694 = true;
            Q695: {
              let _g696 = 0;
              G697: {
                const _e711 = valuesOf(b.domain);
                for (let _k712 = 0; _k712 < 1 << _e711.length; _k712++) {
                  let v_T = 0;
                  for (let _j713 = 0; _j713 < _e711.length; _j713++) if ((_k712 >> (_e711.length - 1 - _j713)) & 1) v_T |= 1 << _e711[_j713];
                  const _h714 = popcount(v_T);
                  let _c718 = (_h714 === _h687);
                  if (_c718) {
                    let _g715 = 0;
                    G716: {
                      for (let _m717 = v_T; _m717 !== 0; _m717 &= _m717 - 1) {
                        const v_e = 31 - Math.clz32(_m717 & -_m717);
                        _g715 += v_e;
                      }
                    }
                    _c718 = (_g715 === v_v);
                  }
                  let _c723 = _c718;
                  if (_c723) {
                    let _q719 = true;
                    Q720: {
                      const _a721 = v_K;
                      for (let _i722 = 0; _i722 < _a721.length; _i722++) {
                        const v_x = _a721[_i722];
                        if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x)))) !== 0))) {
                          _q719 = false;
                          break Q720;
                        }
                      }
                    }
                    _c723 = _q719;
                  }
                  if (!(_c723)) continue;
                  for (let _m724 = v_T; _m724 !== 0; _m724 &= _m724 - 1) {
                    const v_d = 31 - Math.clz32(_m724 & -_m724);
                    _g696 |= 1 << v_d;
                  }
                }
              }
              const v_P = _g696;
              const _h725 = popcount(v_P);
              let _c731 = (_h725 > 0);
              if (_c731) {
                let _q726 = true;
                Q727: {
                  const _a728 = v_K;
                  for (let _i729 = 0; _i729 < _a728.length; _i729++) {
                    const v_c = _a728[_i729];
                    for (let _m730 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m730 !== 0; _m730 &= _m730 - 1) {
                      const v_d = 31 - Math.clz32(_m730 & -_m730);
                      if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                      if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                      if (!(true)) {
                        _q726 = false;
                        break Q727;
                      }
                    }
                  }
                }
                _c731 = _q726;
              }
              if (!(_c731)) {
                _q694 = false;
                break Q695;
              }
            }
            if (!(_q694)) return -1;
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
let intersectCands = new Int32Array(0);

export function intersect(b: Marks, sp: GridSpace, fire: Fire<IntersectBinding> | null): number {
  const facts = intersectFacts;
  let fired = 0;
  let changed = false;
  if (intersectCands.length < sp.cells.length) intersectCands = new Int32Array(sp.cells.length);
  const cands = intersectCands;
  cands.fill(-1);
  const _a759 = union(union(sp.rows, sp.cols), sp.diagonals);
  for (let _i760 = 0; _i760 < _a759.length; _i760++) {
    const v_L = _a759[_i760];
    const _a761 = sp.boxes;
    for (let _i762 = 0; _i762 < _a761.length; _i762++) {
      const v_b = _a761[_i762];
      let _q763 = false;
      Q764: {
        const _a765 = sp.lineCells[v_L];
        for (let _i766 = 0; _i766 < _a765.length; _i766++) {
          const v_c = _a765[_i766];
          if ((sp.boxOf[v_c] === v_b)) {
            _q763 = true;
            break Q764;
          }
        }
      }
      if (!(_q763)) continue;
      for (let _m767 = b.domain; _m767 !== 0; _m767 &= _m767 - 1) {
        const v_d = 31 - Math.clz32(_m767 & -_m767);
        let _q768 = false;
        Q769: {
          const _a770 = sp.lineCells[v_L];
          for (let _i771 = 0; _i771 < _a770.length; _i771++) {
            const v_c = _a770[_i771];
            const _h772 = b.value(v_c);
            if ((_h772 === v_d)) {
              _q768 = true;
              break Q769;
            }
          }
        }
        let _c778 = !(_q768);
        if (_c778) {
          let _q773 = false;
          Q774: {
            const _a775 = sp.lineCells[v_b];
            for (let _i776 = 0; _i776 < _a775.length; _i776++) {
              const v_c = _a775[_i776];
              const _h777 = b.value(v_c);
              if ((_h777 === v_d)) {
                _q773 = true;
                break Q774;
              }
            }
          }
          _c778 = !(_q773);
        }
        if (!(_c778)) continue;
        let _q779 = true;
        Q780: {
          const _a781 = sp.lineCells[v_L];
          for (let _i782 = 0; _i782 < _a781.length; _i782++) {
            const v_c = _a781[_i782];
            if (!(b.has(v_c, v_d))) continue;
            if (!((sp.boxOf[v_c] === v_b))) {
              _q779 = false;
              break Q780;
            }
          }
        }
        let _c787 = _q779;
        if (_c787) {
          let _q783 = false;
          Q784: {
            const _a785 = sp.lineCells[v_b];
            for (let _i786 = 0; _i786 < _a785.length; _i786++) {
              const v_c = _a785[_i786];
              if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
              if (b.has(v_c, v_d)) {
                _q783 = true;
                break Q784;
              }
            }
          }
          _c787 = _q783;
        }
        const v_first = _c787;
        facts.length = 0;
        changed = false;
        let _c792 = !(v_first);
        if (!_c792) {
          let _q788 = true;
          Q789: {
            const _a790 = sp.lineCells[v_b];
            for (let _i791 = 0; _i791 < _a790.length; _i791++) {
              const v_c = _a790[_i791];
              if (!((!(sp.lineCells[v_L].includes(v_c)) && b.has(v_c, v_d)))) continue;
              if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q788 = false;
                break Q789;
              }
            }
          }
          _c792 = _q788;
        }
        let _c803 = _c792;
        if (_c803) {
          let _c802 = v_first;
          if (!_c802) {
            let _q793 = true;
            Q794: {
              const _a795 = sp.lineCells[v_b];
              for (let _i796 = 0; _i796 < _a795.length; _i796++) {
                const v_c = _a795[_i796];
                if (!(b.has(v_c, v_d))) continue;
                if (!((sp.lineCells[v_L].includes(v_c)))) {
                  _q793 = false;
                  break Q794;
                }
              }
            }
            let _c801 = !(_q793);
            if (!_c801) {
              let _q797 = true;
              Q798: {
                const _a799 = sp.lineCells[v_L];
                for (let _i800 = 0; _i800 < _a799.length; _i800++) {
                  const v_c = _a799[_i800];
                  if (!(((sp.boxOf[v_c] !== v_b) && b.has(v_c, v_d)))) continue;
                  if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q797 = false;
                    break Q798;
                  }
                }
              }
              _c801 = _q797;
            }
            _c802 = _c801;
          }
          _c803 = _c802;
        }
        if (!(_c803)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, b: v_b, d: v_d, first: v_first }, facts)) return 1;
          cands.fill(-1);
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
let digitSetCands = new Int32Array(0);

export function digitSet(b: Marks, sp: GridSpace, fire: Fire<DigitSetBinding> | null): number {
  const _g845: number[] = [];
  const _g876: number[] = [];
  const facts = digitSetFacts;
  let fired = 0;
  let changed = false;
  const _h860 = (sp.w - 1);
  const _h861 = rangeMask(0, _h860);
  if (digitSetCands.length < sp.cells.length) digitSetCands = new Int32Array(sp.cells.length);
  const cands = digitSetCands;
  cands.fill(-1);
  for (let _m844 = b.domain; _m844 !== 0; _m844 &= _m844 - 1) {
    const v_d = 31 - Math.clz32(_m844 & -_m844);
    _g845.length = 0;
    G846: {
      const _a853 = sp.rows;
      for (let _i854 = 0; _i854 < _a853.length; _i854++) {
        const v_L = _a853[_i854];
        let _q855 = false;
        Q856: {
          const _a857 = sp.lineCells[v_L];
          for (let _i858 = 0; _i858 < _a857.length; _i858++) {
            const v_c = _a857[_i858];
            const _h859 = b.value(v_c);
            if ((_h859 === v_d)) {
              _q855 = true;
              break Q856;
            }
          }
        }
        if (!(!(_q855))) continue;
        _g845.push(v_L);
      }
    }
    const v_Y0 = _g845;
    const _h874 = v_Y0.length;
    const _h875 = (_h874 - 2);
    let _g862 = 0;
    G863: {
      const _a866 = sp.cells;
      for (let _i867 = 0; _i867 < _a866.length; _i867++) {
        const v_c = _a866[_i867];
        const _h868 = b.value(v_c);
        if (!((_h868 === v_d))) continue;
        const _t869 = (v_c % sp.w);
        _g862 |= 1 << _t869;
      }
    }
    const v_X0 = (_h861 & ~_g862);
    const _e870 = valuesOf(v_X0);
    for (let _k871 = 0; _k871 < 1 << _e870.length; _k871++) {
      let v_T = 0;
      for (let _j872 = 0; _j872 < _e870.length; _j872++) if ((_k871 >> (_e870.length - 1 - _j872)) & 1) v_T |= 1 << _e870[_j872];
      const _h873 = popcount(v_T);
      const _h907 = (v_X0 & ~v_T);
      if (!(((_h873 === 0) || ((2 <= _h873) && (_h873 <= _h875))))) continue;
      _g876.length = 0;
      G877: {
        const _a884 = v_Y0;
        for (let _i885 = 0; _i885 < _a884.length; _i885++) {
          const v_L = _a884[_i885];
          let _q886 = false;
          Q887: {
            const _a888 = sp.lineCells[v_L];
            for (let _i889 = 0; _i889 < _a888.length; _i889++) {
              const v_c = _a888[_i889];
              if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && b.has(v_c, v_d))) {
                _q886 = true;
                break Q887;
              }
            }
          }
          if (!(!(_q886))) continue;
          _g876.push(v_L);
        }
      }
      L890: {
        const v_Y = _g876;
        const _h891 = v_Y.length;
        if (!((_h891 >= (_h874 - _h873)))) break L890;
        facts.length = 0;
        changed = false;
        let _c900 = (_h873 > 0);
        if (!_c900) {
          let _q892 = true;
          Q893: {
            const _a894 = sp.rows;
            for (let _i895 = 0; _i895 < _a894.length; _i895++) {
              const v_L = _a894[_i895];
              let _q896 = false;
              Q897: {
                const _a898 = sp.lineCells[v_L];
                for (let _i899 = 0; _i899 < _a898.length; _i899++) {
                  const v_c = _a898[_i899];
                  if (b.has(v_c, v_d)) {
                    _q896 = true;
                    break Q897;
                  }
                }
              }
              if (!(_q896)) {
                _q892 = false;
                break Q893;
              }
            }
          }
          _c900 = _q892;
        }
        let _c908 = (_c900 && (_h891 === (_h874 - _h873)));
        if (_c908) {
          let _q901 = true;
          Q902: {
            const _a903 = minus(v_Y0, v_Y);
            for (let _i904 = 0; _i904 < _a903.length; _i904++) {
              const v_L = _a903[_i904];
              const _a905 = sp.lineCells[v_L];
              for (let _i906 = 0; _i906 < _a905.length; _i906++) {
                const v_c = _a905[_i906];
                if (!(((((_h907 >> (v_c % sp.w)) & 1) !== 0) && b.has(v_c, v_d)))) continue;
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q901 = false;
                  break Q902;
                }
              }
            }
          }
          _c908 = _q901;
        }
        if (!(_c908)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, Y0: v_Y0, X0: v_X0, T: v_T, Y: v_Y }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}
