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
  let _q909 = true;
  const _n913 = new Int32Array(32);
  Q910: for (const _u911 of sp.units) {
    _n913.fill(0);
    for (const _c912 of sp.lineCells[_u911]) {
      const _t914 = (g[_c912] || -1);
      if (++_n913[_t914] > 1) {
        _q909 = false;
        break Q910;
      }
    }
  }
  if (!(_q909)) return false;
  for (let _k915 = 0; _k915 < cl.total.at.length; _k915++) {
    const _at916 = cl.total.at[_k915];
    const _v917 = cl.total.v[_k915];
    let _g918 = 0;
    G919: {
      const _a920 = cl.cage.cells[_at916];
      for (let _i921 = 0; _i921 < _a920.length; _i921++) {
        const v_c = _a920[_i921];
        _g918 += (g[v_c] || -1);
      }
    }
    let _c928 = (_g918 === _v917);
    if (_c928) {
      let _g922 = true;
      const _s924: number[] = [];
      G923: {
        const _a925 = cl.cage.cells[_at916];
        for (let _i926 = 0; _i926 < _a925.length; _i926++) {
          const v_c = _a925[_i926];
          const _t927 = (g[v_c] || -1);
          if (_s924.includes(_t927)) {
            _g922 = false;
            break G923;
          }
          _s924.push(_t927);
        }
      }
      _c928 = _g922;
    }
    if (!(_c928)) return false;
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
  const _g338: number[] = [];
  const _g364: number[] = [];
  const _g398: number[] = [];
  const _g413: number[] = [];
  const facts = partMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (partMinMaxCands.length < sp.cells.length) partMinMaxCands = new Int32Array(sp.cells.length);
  const cands = partMinMaxCands;
  cands.fill(-1);
  const _a336 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i337 = 0; _i337 < _a336.length; _i337++) {
    const v_u = _a336[_i337];
    _g338.length = 0;
    G339: {
      const _a351 = cl.cage.parts;
      for (let _i352 = 0; _i352 < _a351.length; _i352++) {
        const v_r = _a351[_i352];
        let _q353 = false;
        Q354: {
          const _a355 = cl.cage.cells[v_r];
          for (let _i356 = 0; _i356 < _a355.length; _i356++) {
            const v_c = _a355[_i356];
            const _h357 = b.known(v_c);
            if (!(_h357)) {
              _q353 = true;
              break Q354;
            }
          }
        }
        let _c363 = _q353;
        if (_c363) {
          let _q358 = true;
          Q359: {
            const _a360 = cl.cage.cells[v_r];
            for (let _i361 = 0; _i361 < _a360.length; _i361++) {
              const v_c = _a360[_i361];
              const _h362 = b.known(v_c);
              if (!(!(_h362))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q358 = false;
                break Q359;
              }
            }
          }
          _c363 = _q358;
        }
        if (!(_c363)) continue;
        _g338.push(v_r);
      }
    }
    const v_W = _g338;
    _g364.length = 0;
    G365: {
      const _a370 = cl.cage.parts;
      for (let _i371 = 0; _i371 < _a370.length; _i371++) {
        const v_r = _a370[_i371];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a372 = cl.cage.cells[v_r];
        for (let _i373 = 0; _i373 < _a372.length; _i373++) {
          const v_c = _a372[_i373];
          const _h374 = b.known(v_c);
          if (!((!(_h374) && (sp.lineCells[v_u].includes(v_c))))) continue;
          if (!_g364.includes(v_c)) _g364.push(v_c);
        }
      }
    }
    L375: {
      const v_L = _g364;
      const _h376 = v_L.length;
      if (!(((_h376 > 1) && (_h376 < sp.w)))) break L375;
      let _g377 = 0;
      G378: {
        for (let _m379 = b.domain; _m379 !== 0; _m379 &= _m379 - 1) {
          const v_d = 31 - Math.clz32(_m379 & -_m379);
          _g377 += v_d;
        }
      }
      let _g380 = 0;
      G381: {
        const _a382 = sp.lineCells[v_u];
        for (let _i383 = 0; _i383 < _a382.length; _i383++) {
          const v_c = _a382[_i383];
          const _h384 = b.known(v_c);
          if (!(_h384)) continue;
          const _h385 = b.value(v_c);
          _g380 += _h385;
        }
      }
      let _g386 = 0;
      G387: {
        const _a388 = v_W;
        for (let _i389 = 0; _i389 < _a388.length; _i389++) {
          const v_r = _a388[_i389];
          const _h390 = clueAt(cl.total, v_r);
          let _g391 = 0;
          G392: {
            const _a393 = cl.cage.cells[v_r];
            for (let _i394 = 0; _i394 < _a393.length; _i394++) {
              const v_c = _a393[_i394];
              const _h395 = b.known(v_c);
              if (!(_h395)) continue;
              const _h396 = b.value(v_c);
              _g391 += _h396;
            }
          }
          _g386 += (_h390 - _g391);
        }
      }
      L397: {
        const v_s = ((_g377 - _g380) - _g386);
        if (!((v_s > 0))) break L397;
        _g398.length = 0;
        G399: {
          const _a402 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i403 = 0; _i403 < _a402.length; _i403++) {
            const v_c = _a402[_i403];
            const _h404 = b.known(v_c);
            if (!((!(_h404) && !(v_L.includes(v_c))))) continue;
            _g398.push(v_c);
          }
        }
        const v_R = _g398;
        const _t405 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h406 = clueAt(cl.total, _t405);
        let _g407 = 0;
        G408: {
          const _a409 = cl.cage.cells[_t405];
          for (let _i410 = 0; _i410 < _a409.length; _i410++) {
            const v_c = _a409[_i410];
            const _h411 = b.known(v_c);
            if (!(_h411)) continue;
            const _h412 = b.value(v_c);
            _g407 += _h412;
          }
        }
        const v_t = ((_h406 - _g407) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h419 = (v_i === 0);
          _g413.length = 0;
          G414: {
            const _a417 = union(v_L, v_R);
            for (let _i418 = 0; _i418 < _a417.length; _i418++) {
              const v_c = _a417[_i418];
              if (!((_h419 === (v_L.includes(v_c))))) continue;
              _g413.push(v_c);
            }
          }
          const v_K = _g413;
          const _h421 = v_K.length;
          L420: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c427 = ((_h421 > 1) && (v_v !== 0));
            if (_c427) {
              let _c426 = (v_i === 0);
              if (!_c426) {
                let _q422 = true;
                Q423: {
                  const _a424 = v_L;
                  for (let _i425 = 0; _i425 < _a424.length; _i425++) {
                    const v_c = _a424[_i425];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q422 = false;
                      break Q423;
                    }
                  }
                }
                _c426 = _q422;
              }
              _c427 = _c426;
            }
            if (!(_c427)) break L420;
            facts.length = 0;
            changed = false;
            let _q428 = true;
            Q429: {
              const _a430 = v_K;
              for (let _i431 = 0; _i431 < _a430.length; _i431++) {
                const v_c = _a430[_i431];
                for (let _m432 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m432 !== 0; _m432 &= _m432 - 1) {
                  const v_d = 31 - Math.clz32(_m432 & -_m432);
                  let _g433 = 0;
                  G434: {
                    const _a435 = v_K;
                    for (let _i436 = 0; _i436 < _a435.length; _i436++) {
                      const v_x = _a435[_i436];
                      if (!((v_x !== v_c))) continue;
                      let _g437 = -1;
                      G438: {
                        for (let _m439 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x))); _m439 !== 0; _m439 &= _m439 - 1) {
                          const v_e = 31 - Math.clz32(_m439 & -_m439);
                          if (_g437 === -1 || v_e > _g437) _g437 = v_e;
                        }
                      }
                      _g433 += _g437;
                    }
                  }
                  let _c447 = ((v_d + _g433) < v_v);
                  if (!_c447) {
                    let _g440 = 0;
                    G441: {
                      const _a442 = v_K;
                      for (let _i443 = 0; _i443 < _a442.length; _i443++) {
                        const v_x = _a442[_i443];
                        if (!((v_x !== v_c))) continue;
                        let _g444 = -1;
                        G445: {
                          for (let _m446 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cand(v_x))); _m446 !== 0; _m446 &= _m446 - 1) {
                            const v_e = 31 - Math.clz32(_m446 & -_m446);
                            if (_g444 === -1 || v_e < _g444) _g444 = v_e;
                          }
                        }
                        _g440 += _g444;
                      }
                    }
                    _c447 = ((v_d + _g440) > v_v);
                  }
                  if (!(_c447)) continue;
                  if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q428 = false;
                    break Q429;
                  }
                }
              }
            }
            if (!(_q428)) return -1;
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
  const _g463: number[] = [];
  const facts = cageSumsFacts;
  let fired = 0;
  let changed = false;
  if (cageSumsCands.length < sp.cells.length) cageSumsCands = new Int32Array(sp.cells.length);
  const cands = cageSumsCands;
  cands.fill(-1);
  const _a461 = cl.cage.parts;
  for (let _i462 = 0; _i462 < _a461.length; _i462++) {
    const v_r = _a461[_i462];
    const _h470 = clueAt(cl.total, v_r);
    _g463.length = 0;
    G464: {
      const _a467 = cl.cage.cells[v_r];
      for (let _i468 = 0; _i468 < _a467.length; _i468++) {
        const v_c = _a467[_i468];
        const _h469 = b.known(v_c);
        if (!(!(_h469))) continue;
        _g463.push(v_c);
      }
    }
    const v_K = _g463;
    const _h478 = v_K.length;
    let _g471 = 0;
    G472: {
      const _a473 = cl.cage.cells[v_r];
      for (let _i474 = 0; _i474 < _a473.length; _i474++) {
        const v_c = _a473[_i474];
        const _h475 = b.known(v_c);
        if (!(_h475)) continue;
        const _h476 = b.value(v_c);
        _g471 += _h476;
      }
    }
    L477: {
      const v_t = (_h470 - _g471);
      if (!((v_t !== 0))) break L477;
      facts.length = 0;
      changed = false;
      let _c521 = (_h478 > 0);
      if (_c521) {
        let _c520 = ((_h478 < 2) || (_h478 > 4));
        if (!_c520) {
          let _q479 = true;
          Q480: {
            let _g481 = 0;
            G482: {
              const _e498 = valuesOf(b.domain);
              const _n501 = 1 << _e498.length;
              for (let _k499 = _h478 > _e498.length ? _n501 : (1 << _h478) - 1; _k499 < _n501; _k499 = _h478 === 0 ? _n501 : nextOfSize(_k499)) {
                let v_T = 0;
                for (let _j500 = 0; _j500 < _e498.length; _j500++) if ((_k499 >> (_e498.length - 1 - _j500)) & 1) v_T |= 1 << _e498[_j500];
                const _h502 = popcount(v_T);
                let _c506 = (_h502 === _h478);
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
                  _g481 |= 1 << v_d;
                }
              }
            }
            const v_P = _g481;
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
              _q479 = false;
              break Q480;
            }
          }
          _c520 = _q479;
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
  const _g601: number[] = [];
  const _g627: number[] = [];
  const _g661: number[] = [];
  const _g676: number[] = [];
  const facts = partSumsFacts;
  let fired = 0;
  let changed = false;
  if (partSumsCands.length < sp.cells.length) partSumsCands = new Int32Array(sp.cells.length);
  const cands = partSumsCands;
  cands.fill(-1);
  const _a599 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i600 = 0; _i600 < _a599.length; _i600++) {
    const v_u = _a599[_i600];
    _g601.length = 0;
    G602: {
      const _a614 = cl.cage.parts;
      for (let _i615 = 0; _i615 < _a614.length; _i615++) {
        const v_r = _a614[_i615];
        let _q616 = false;
        Q617: {
          const _a618 = cl.cage.cells[v_r];
          for (let _i619 = 0; _i619 < _a618.length; _i619++) {
            const v_c = _a618[_i619];
            const _h620 = b.known(v_c);
            if (!(_h620)) {
              _q616 = true;
              break Q617;
            }
          }
        }
        let _c626 = _q616;
        if (_c626) {
          let _q621 = true;
          Q622: {
            const _a623 = cl.cage.cells[v_r];
            for (let _i624 = 0; _i624 < _a623.length; _i624++) {
              const v_c = _a623[_i624];
              const _h625 = b.known(v_c);
              if (!(!(_h625))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q621 = false;
                break Q622;
              }
            }
          }
          _c626 = _q621;
        }
        if (!(_c626)) continue;
        _g601.push(v_r);
      }
    }
    const v_W = _g601;
    _g627.length = 0;
    G628: {
      const _a633 = cl.cage.parts;
      for (let _i634 = 0; _i634 < _a633.length; _i634++) {
        const v_r = _a633[_i634];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a635 = cl.cage.cells[v_r];
        for (let _i636 = 0; _i636 < _a635.length; _i636++) {
          const v_c = _a635[_i636];
          const _h637 = b.known(v_c);
          if (!((!(_h637) && (sp.lineCells[v_u].includes(v_c))))) continue;
          if (!_g627.includes(v_c)) _g627.push(v_c);
        }
      }
    }
    L638: {
      const v_L = _g627;
      const _h639 = v_L.length;
      if (!(((_h639 > 1) && (_h639 < sp.w)))) break L638;
      let _g640 = 0;
      G641: {
        for (let _m642 = b.domain; _m642 !== 0; _m642 &= _m642 - 1) {
          const v_d = 31 - Math.clz32(_m642 & -_m642);
          _g640 += v_d;
        }
      }
      let _g643 = 0;
      G644: {
        const _a645 = sp.lineCells[v_u];
        for (let _i646 = 0; _i646 < _a645.length; _i646++) {
          const v_c = _a645[_i646];
          const _h647 = b.known(v_c);
          if (!(_h647)) continue;
          const _h648 = b.value(v_c);
          _g643 += _h648;
        }
      }
      let _g649 = 0;
      G650: {
        const _a651 = v_W;
        for (let _i652 = 0; _i652 < _a651.length; _i652++) {
          const v_r = _a651[_i652];
          const _h653 = clueAt(cl.total, v_r);
          let _g654 = 0;
          G655: {
            const _a656 = cl.cage.cells[v_r];
            for (let _i657 = 0; _i657 < _a656.length; _i657++) {
              const v_c = _a656[_i657];
              const _h658 = b.known(v_c);
              if (!(_h658)) continue;
              const _h659 = b.value(v_c);
              _g654 += _h659;
            }
          }
          _g649 += (_h653 - _g654);
        }
      }
      L660: {
        const v_s = ((_g640 - _g643) - _g649);
        if (!((v_s > 0))) break L660;
        _g661.length = 0;
        G662: {
          const _a665 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i666 = 0; _i666 < _a665.length; _i666++) {
            const v_c = _a665[_i666];
            const _h667 = b.known(v_c);
            if (!((!(_h667) && !(v_L.includes(v_c))))) continue;
            _g661.push(v_c);
          }
        }
        const v_R = _g661;
        const _t668 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h669 = clueAt(cl.total, _t668);
        let _g670 = 0;
        G671: {
          const _a672 = cl.cage.cells[_t668];
          for (let _i673 = 0; _i673 < _a672.length; _i673++) {
            const v_c = _a672[_i673];
            const _h674 = b.known(v_c);
            if (!(_h674)) continue;
            const _h675 = b.value(v_c);
            _g670 += _h675;
          }
        }
        const v_t = ((_h669 - _g670) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h682 = (v_i === 0);
          _g676.length = 0;
          G677: {
            const _a680 = union(v_L, v_R);
            for (let _i681 = 0; _i681 < _a680.length; _i681++) {
              const v_c = _a680[_i681];
              if (!((_h682 === (v_L.includes(v_c))))) continue;
              _g676.push(v_c);
            }
          }
          const v_K = _g676;
          const _h684 = v_K.length;
          L683: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c690 = (((_h684 > 1) && (_h684 <= 4)) && (v_v !== 0));
            if (_c690) {
              let _c689 = (v_i === 0);
              if (!_c689) {
                let _q685 = true;
                Q686: {
                  const _a687 = v_L;
                  for (let _i688 = 0; _i688 < _a687.length; _i688++) {
                    const v_c = _a687[_i688];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q685 = false;
                      break Q686;
                    }
                  }
                }
                _c689 = _q685;
              }
              _c690 = _c689;
            }
            if (!(_c690)) break L683;
            facts.length = 0;
            changed = false;
            let _q691 = true;
            Q692: {
              let _g693 = 0;
              G694: {
                const _e710 = valuesOf(b.domain);
                const _n713 = 1 << _e710.length;
                for (let _k711 = _h684 > _e710.length ? _n713 : (1 << _h684) - 1; _k711 < _n713; _k711 = _h684 === 0 ? _n713 : nextOfSize(_k711)) {
                  let v_T = 0;
                  for (let _j712 = 0; _j712 < _e710.length; _j712++) if ((_k711 >> (_e710.length - 1 - _j712)) & 1) v_T |= 1 << _e710[_j712];
                  const _h714 = popcount(v_T);
                  let _c718 = (_h714 === _h684);
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
                    _g693 |= 1 << v_d;
                  }
                }
              }
              const v_P = _g693;
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
                _q691 = false;
                break Q692;
              }
            }
            if (!(_q691)) return -1;
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
  const _g845: number[] = [];
  const _g876: number[] = [];
  const facts = digitSetFacts;
  let fired = 0;
  let changed = false;
  const _h860 = (sp.w - 1);
  const _h861 = rangeMask(0, _h860);
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
      if (!(((_h873 === 0) || ((2 <= _h873) && (_h873 <= _h875))))) continue;
      const _h907 = (v_X0 & ~v_T);
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
        }
      }
    }
  }
  return fired;
}
