// Compiled by `npm run describe` from src/games/solo/solo.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, cellsValued, clueAt, minus, nextOfSize, popcount, rangeMask, sameSet, stamps, union, valuesOf } from "../../engine/describe-runtime.ts";

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
  let _q1069 = true;
  const _n1073 = new Int32Array(32);
  Q1070: for (const _u1071 of sp.units) {
    _n1073.fill(0);
    for (const _c1072 of sp.lineCells[_u1071]) {
      const _t1074 = (g[_c1072] || -1);
      if (++_n1073[_t1074] > 1) {
        _q1069 = false;
        break Q1070;
      }
    }
  }
  if (!(_q1069)) return false;
  for (let _k1075 = 0; _k1075 < cl.total.at.length; _k1075++) {
    const _at1076 = cl.total.at[_k1075];
    const _v1077 = cl.total.v[_k1075];
    let _g1078 = 0;
    G1079: {
      const _a1080 = cl.cage.cells[_at1076];
      for (let _i1081 = 0; _i1081 < _a1080.length; _i1081++) {
        const v_c = _a1080[_i1081];
        const _h1082 = (g[v_c] || -1);
        _g1078 += _h1082;
      }
    }
    let _c1089: boolean = (_g1078 === _v1077);
    if (_c1089) {
      let _g1083 = true;
      const _s1085: number[] = [];
      G1084: {
        const _a1086 = cl.cage.cells[_at1076];
        for (let _i1087 = 0; _i1087 < _a1086.length; _i1087++) {
          const v_c = _a1086[_i1087];
          const _h1088 = (g[v_c] || -1);
          if (_s1085.includes(_h1088)) {
            _g1083 = false;
            break G1084;
          }
          _s1085.push(_h1088);
        }
      }
      _c1089 = _g1083;
    }
    if (!(_c1089)) return false;
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
  R1:
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_u = _a16[_i17];
    const _m7_0 = b.made[0];
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
        if (b.made[0] !== _m7_0) {
          let _g31 = 0;
          G32: {
            const _a35 = sp.lineCells[v_u];
            for (let _i36 = 0; _i36 < _a35.length; _i36++) {
              const v_c = _a35[_i36];
              if (!((b.grid[v_c] !== 0))) continue;
              const _t37 = (b.grid[v_c] || -1);
              _g31 |= 1 << _t37;
            }
          }
          if (!((v_placed === _g31))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c43: boolean = (v_n === 1);
        if (_c43) {
          let _g38 = -1;
          let _n40 = 0;
          G39: {
            const _a41 = sp.lineCells[v_u];
            for (let _i42 = 0; _i42 < _a41.length; _i42++) {
              const v_c = _a41[_i42];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              if (++_n40 === 2) {
                _g38 = -1;
                break G39;
              }
              _g38 = v_c;
            }
          }
          if (!(b.grid[_g38] !== 0)) { if (fire === null) { b.placeAt(_g38, v_d); changed = true; } else facts.push(PLACE, _g38, v_d); }
          _c43 = true;
        }
        if (!(_c43)) return -1;
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
  const _g59: number[] = [];
  const facts = cageSingleFacts;
  let fired = 0;
  let changed = false;
  const _a57 = cl.cage.parts;
  for (let _i58 = 0; _i58 < _a57.length; _i58++) {
    const v_r = _a57[_i58];
    const _h67 = clueAt(cl.total, v_r);
    _g59.length = 0;
    G60: {
      const _a63 = cl.cage.cells[v_r];
      for (let _i64 = 0; _i64 < _a63.length; _i64++) {
        const v_c = _a63[_i64];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g59.push(v_c);
      }
    }
    L65: {
      const v_K = _g59;
      const _h66 = v_K.length;
      if (!((_h66 === 1))) break L65;
      const v_c = (v_K.length > 0 ? v_K[0] : -1);
      let _g68 = 0;
      G69: {
        const _a70 = cl.cage.cells[v_r];
        for (let _i71 = 0; _i71 < _a70.length; _i71++) {
          const v_c = _a70[_i71];
          if (!((b.grid[v_c] !== 0))) continue;
          _g68 += (b.grid[v_c] || -1);
        }
      }
      const v_t = (_h67 - _g68);
      facts.length = 0;
      changed = false;
      let _c72: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[v_c] >> v_t) & 1) !== 0));
      if (_c72) {
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_t); changed = true; } else facts.push(PLACE, v_c, v_t); }
        _c72 = true;
      }
      if (!(_c72)) return -1;
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
const _st168 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function regionRule(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionRuleBinding> | null): number {
  const _g138: number[] = [];
  const _g162: number[] = [];
  const _g192: number[] = [];
  const facts = regionRuleFacts;
  let fired = 0;
  let changed = false;
  const _a136 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i137 = 0; _i137 < _a136.length; _i137++) {
    const v_u = _a136[_i137];
    _g138.length = 0;
    G139: {
      const _a151 = cl.cage.parts;
      for (let _i152 = 0; _i152 < _a151.length; _i152++) {
        const v_r = _a151[_i152];
        let _q153 = false;
        Q154: {
          const _a155 = cl.cage.cells[v_r];
          for (let _i156 = 0; _i156 < _a155.length; _i156++) {
            const v_c = _a155[_i156];
            if (!((b.grid[v_c] !== 0))) {
              _q153 = true;
              break Q154;
            }
          }
        }
        let _c161: boolean = _q153;
        if (_c161) {
          let _q157 = true;
          Q158: {
            const _a159 = cl.cage.cells[v_r];
            for (let _i160 = 0; _i160 < _a159.length; _i160++) {
              const v_c = _a159[_i160];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q157 = false;
                break Q158;
              }
            }
          }
          _c161 = _q157;
        }
        if (!(_c161)) continue;
        _g138.push(v_r);
      }
    }
    const v_W = _g138;
    _g162.length = 0;
    _st168.pass++;
    G163: {
      const _a169 = cl.cage.parts;
      for (let _i170 = 0; _i170 < _a169.length; _i170++) {
        const v_r = _a169[_i170];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a171 = cl.cage.cells[v_r];
        for (let _i172 = 0; _i172 < _a171.length; _i172++) {
          const v_c = _a171[_i172];
          if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t173 = v_c;
          if (_g162.length < 16) { if (!_g162.includes(_t173)) _g162.push(_t173); } else addOnce(_g162, _st168, _t173);
        }
      }
    }
    L174: {
      const v_L = _g162;
      const _h175 = v_L.length;
      if (!(((_h175 > 0) && (_h175 < sp.w)))) break L174;
      let _g176 = 0;
      G177: {
        for (let _m178 = b.domain; _m178 !== 0; _m178 &= _m178 - 1) {
          const v_d = 31 - Math.clz32(_m178 & -_m178);
          _g176 += v_d;
        }
      }
      let _g179 = 0;
      G180: {
        const _a181 = sp.lineCells[v_u];
        for (let _i182 = 0; _i182 < _a181.length; _i182++) {
          const v_c = _a181[_i182];
          if (!((b.grid[v_c] !== 0))) continue;
          _g179 += (b.grid[v_c] || -1);
        }
      }
      let _g183 = 0;
      G184: {
        const _a185 = v_W;
        for (let _i186 = 0; _i186 < _a185.length; _i186++) {
          const v_r = _a185[_i186];
          const _h187 = clueAt(cl.total, v_r);
          let _g188 = 0;
          G189: {
            const _a190 = cl.cage.cells[v_r];
            for (let _i191 = 0; _i191 < _a190.length; _i191++) {
              const v_c = _a190[_i191];
              if (!((b.grid[v_c] !== 0))) continue;
              _g188 += (b.grid[v_c] || -1);
            }
          }
          _g183 += (_h187 - _g188);
        }
      }
      const v_s = ((_g176 - _g179) - _g183);
      _g192.length = 0;
      G193: {
        const _a196 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
        for (let _i197 = 0; _i197 < _a196.length; _i197++) {
          const v_c = _a196[_i197];
          if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
          _g192.push(v_c);
        }
      }
      const v_R = _g192;
      const _h208 = v_R.length;
      const _t198 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
      const _h199 = clueAt(cl.total, _t198);
      let _g200 = 0;
      G201: {
        const _a202 = cl.cage.cells[_t198];
        for (let _i203 = 0; _i203 < _a202.length; _i203++) {
          const v_c = _a202[_i203];
          if (!((b.grid[v_c] !== 0))) continue;
          _g200 += (b.grid[v_c] || -1);
        }
      }
      const v_t = ((_h199 - _g200) - v_s);
      facts.length = 0;
      changed = false;
      let _c207: boolean = (v_s > 0);
      if (_c207) {
        let _c206: boolean = (_h175 !== 1);
        if (!_c206) {
          let _c205: boolean = ((v_s <= sp.w) && (((b.cands[(v_L.length > 0 ? v_L[0] : -1)] >> v_s) & 1) !== 0));
          if (_c205) {
            const _t204 = (v_L.length > 0 ? v_L[0] : -1);
            if (!(b.grid[_t204] !== 0)) { if (fire === null) { b.placeAt(_t204, v_s); changed = true; } else facts.push(PLACE, _t204, v_s); }
            _c205 = true;
          }
          _c206 = _c205;
        }
        _c207 = _c206;
      }
      let _c217: boolean = _c207;
      if (_c217) {
        let _c213: boolean = ((_h175 === 1) || (_h208 !== 1));
        if (!_c213) {
          let _q209 = false;
          Q210: {
            const _a211 = v_L;
            for (let _i212 = 0; _i212 < _a211.length; _i212++) {
              const v_c = _a211[_i212];
              if ((cl.cage.of[v_c] !== cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)])) {
                _q209 = true;
                break Q210;
              }
            }
          }
          _c213 = _q209;
        }
        let _c216: boolean = _c213;
        if (!_c216) {
          let _c215: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[(v_R.length > 0 ? v_R[0] : -1)] >> v_t) & 1) !== 0));
          if (_c215) {
            const _t214 = (v_R.length > 0 ? v_R[0] : -1);
            if (!(b.grid[_t214] !== 0)) { if (fire === null) { b.placeAt(_t214, v_t); changed = true; } else facts.push(PLACE, _t214, v_t); }
            _c215 = true;
          }
          _c216 = _c215;
        }
        _c217 = _c216;
      }
      if (!(_c217)) return -1;
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
  const _g233: number[] = [];
  const facts = cageMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (cageMinMaxCands.length < sp.cells.length) cageMinMaxCands = new Int32Array(sp.cells.length);
  const cands = cageMinMaxCands;
  cands.fill(-1);
  const _a231 = cl.cage.parts;
  for (let _i232 = 0; _i232 < _a231.length; _i232++) {
    const v_r = _a231[_i232];
    const _h240 = clueAt(cl.total, v_r);
    _g233.length = 0;
    G234: {
      const _a237 = cl.cage.cells[v_r];
      for (let _i238 = 0; _i238 < _a237.length; _i238++) {
        const v_c = _a237[_i238];
        const _h239 = (b.grid[v_c] !== 0);
        if (!(!(_h239))) continue;
        _g233.push(v_c);
      }
    }
    const v_K = _g233;
    let _g241 = 0;
    G242: {
      const _a243 = cl.cage.cells[v_r];
      for (let _i244 = 0; _i244 < _a243.length; _i244++) {
        const v_c = _a243[_i244];
        const _h245 = (b.grid[v_c] !== 0);
        if (!(_h245)) continue;
        const _h246 = (b.grid[v_c] || -1);
        _g241 += _h246;
      }
    }
    L247: {
      const v_t = (_h240 - _g241);
      if (!((v_t !== 0))) break L247;
      facts.length = 0;
      changed = false;
      let _q248 = true;
      Q249: {
        const _a250 = v_K;
        for (let _i251 = 0; _i251 < _a250.length; _i251++) {
          const v_c = _a250[_i251];
          for (let _m252 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m252 !== 0; _m252 &= _m252 - 1) {
            const v_d = 31 - Math.clz32(_m252 & -_m252);
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
                    if (_g257 === -1 || v_e > _g257) _g257 = v_e;
                  }
                }
                _g253 += _g257;
              }
            }
            let _c267: boolean = ((v_d + _g253) < v_t);
            if (!_c267) {
              let _g260 = 0;
              G261: {
                const _a262 = v_K;
                for (let _i263 = 0; _i263 < _a262.length; _i263++) {
                  const v_x = _a262[_i263];
                  if (!((v_x !== v_c))) continue;
                  let _g264 = -1;
                  G265: {
                    for (let _m266 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m266 !== 0; _m266 &= _m266 - 1) {
                      const v_e = 31 - Math.clz32(_m266 & -_m266);
                      if (_g264 === -1 || v_e < _g264) _g264 = v_e;
                    }
                  }
                  _g260 += _g264;
                }
              }
              _c267 = ((v_d + _g260) > v_t);
            }
            if (!(_c267)) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q248 = false;
              break Q249;
            }
          }
        }
      }
      if (!(_q248)) return -1;
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
const _st379 = stamps();
const _st470 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partMinMax(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartMinMaxBinding> | null): number {
  const _g347: number[] = [];
  const _g373: number[] = [];
  const _g409: number[] = [];
  const _g424: number[] = [];
  const _g440: number[] = [];
  const _g464: number[] = [];
  const _g491: number[] = [];
  const facts = partMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (partMinMaxCands.length < sp.cells.length) partMinMaxCands = new Int32Array(sp.cells.length);
  const cands = partMinMaxCands;
  cands.fill(-1);
  const _a345 = union(union(sp.rows, sp.cols), sp.boxes);
  R1:
  for (let _i346 = 0; _i346 < _a345.length; _i346++) {
    const v_u = _a345[_i346];
    const _m130_0 = b.made[0];
    _g347.length = 0;
    G348: {
      const _a360 = cl.cage.parts;
      for (let _i361 = 0; _i361 < _a360.length; _i361++) {
        const v_r = _a360[_i361];
        let _q362 = false;
        Q363: {
          const _a364 = cl.cage.cells[v_r];
          for (let _i365 = 0; _i365 < _a364.length; _i365++) {
            const v_c = _a364[_i365];
            const _h366 = (b.grid[v_c] !== 0);
            if (!(_h366)) {
              _q362 = true;
              break Q363;
            }
          }
        }
        let _c372: boolean = _q362;
        if (_c372) {
          let _q367 = true;
          Q368: {
            const _a369 = cl.cage.cells[v_r];
            for (let _i370 = 0; _i370 < _a369.length; _i370++) {
              const v_c = _a369[_i370];
              const _h371 = (b.grid[v_c] !== 0);
              if (!(!(_h371))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q367 = false;
                break Q368;
              }
            }
          }
          _c372 = _q367;
        }
        if (!(_c372)) continue;
        _g347.push(v_r);
      }
    }
    const v_W = _g347;
    _g373.length = 0;
    _st379.pass++;
    G374: {
      const _a380 = cl.cage.parts;
      for (let _i381 = 0; _i381 < _a380.length; _i381++) {
        const v_r = _a380[_i381];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a382 = cl.cage.cells[v_r];
        for (let _i383 = 0; _i383 < _a382.length; _i383++) {
          const v_c = _a382[_i383];
          const _h384 = (b.grid[v_c] !== 0);
          if (!((!(_h384) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t385 = v_c;
          if (_g373.length < 16) { if (!_g373.includes(_t385)) _g373.push(_t385); } else addOnce(_g373, _st379, _t385);
        }
      }
    }
    L386: {
      const v_L = _g373;
      const _h387 = v_L.length;
      if (!(((_h387 > 1) && (_h387 < sp.w)))) break L386;
      let _g388 = 0;
      G389: {
        for (let _m390 = b.domain; _m390 !== 0; _m390 &= _m390 - 1) {
          const v_d = 31 - Math.clz32(_m390 & -_m390);
          _g388 += v_d;
        }
      }
      let _g391 = 0;
      G392: {
        const _a393 = sp.lineCells[v_u];
        for (let _i394 = 0; _i394 < _a393.length; _i394++) {
          const v_c = _a393[_i394];
          const _h395 = (b.grid[v_c] !== 0);
          if (!(_h395)) continue;
          const _h396 = (b.grid[v_c] || -1);
          _g391 += _h396;
        }
      }
      let _g397 = 0;
      G398: {
        const _a399 = v_W;
        for (let _i400 = 0; _i400 < _a399.length; _i400++) {
          const v_r = _a399[_i400];
          const _h401 = clueAt(cl.total, v_r);
          let _g402 = 0;
          G403: {
            const _a404 = cl.cage.cells[v_r];
            for (let _i405 = 0; _i405 < _a404.length; _i405++) {
              const v_c = _a404[_i405];
              const _h406 = (b.grid[v_c] !== 0);
              if (!(_h406)) continue;
              const _h407 = (b.grid[v_c] || -1);
              _g402 += _h407;
            }
          }
          _g397 += (_h401 - _g402);
        }
      }
      L408: {
        const v_s = ((_g388 - _g391) - _g397);
        if (!((v_s > 0))) break L408;
        _g409.length = 0;
        G410: {
          const _a413 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i414 = 0; _i414 < _a413.length; _i414++) {
            const v_c = _a413[_i414];
            const _h415 = (b.grid[v_c] !== 0);
            if (!((!(_h415) && !(v_L.includes(v_c))))) continue;
            _g409.push(v_c);
          }
        }
        const v_R = _g409;
        const _h428 = union(v_L, v_R);
        const _t416 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h417 = clueAt(cl.total, _t416);
        let _g418 = 0;
        G419: {
          const _a420 = cl.cage.cells[_t416];
          for (let _i421 = 0; _i421 < _a420.length; _i421++) {
            const v_c = _a420[_i421];
            const _h422 = (b.grid[v_c] !== 0);
            if (!(_h422)) continue;
            const _h423 = (b.grid[v_c] || -1);
            _g418 += _h423;
          }
        }
        const v_t = ((_h417 - _g418) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h431 = (v_i === 0);
          _g424.length = 0;
          G425: {
            const _a429 = _h428;
            for (let _i430 = 0; _i430 < _a429.length; _i430++) {
              const v_c = _a429[_i430];
              if (!((_h431 === (v_L.includes(v_c))))) continue;
              _g424.push(v_c);
            }
          }
          const v_K = _g424;
          const _h433 = v_K.length;
          L432: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c439: boolean = ((_h433 > 1) && (v_v !== 0));
            if (_c439) {
              let _c438: boolean = (v_i === 0);
              if (!_c438) {
                let _q434 = true;
                Q435: {
                  const _a436 = v_L;
                  for (let _i437 = 0; _i437 < _a436.length; _i437++) {
                    const v_c = _a436[_i437];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q434 = false;
                      break Q435;
                    }
                  }
                }
                _c438 = _q434;
              }
              _c439 = _c438;
            }
            if (!(_c439)) break L432;
            if (b.made[0] !== _m130_0) {
              _g440.length = 0;
              G441: {
                const _a453 = cl.cage.parts;
                for (let _i454 = 0; _i454 < _a453.length; _i454++) {
                  const v_r = _a453[_i454];
                  let _q455 = false;
                  Q456: {
                    const _a457 = cl.cage.cells[v_r];
                    for (let _i458 = 0; _i458 < _a457.length; _i458++) {
                      const v_c = _a457[_i458];
                      if (!((b.grid[v_c] !== 0))) {
                        _q455 = true;
                        break Q456;
                      }
                    }
                  }
                  let _c463: boolean = _q455;
                  if (_c463) {
                    let _q459 = true;
                    Q460: {
                      const _a461 = cl.cage.cells[v_r];
                      for (let _i462 = 0; _i462 < _a461.length; _i462++) {
                        const v_c = _a461[_i462];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q459 = false;
                          break Q460;
                        }
                      }
                    }
                    _c463 = _q459;
                  }
                  if (!(_c463)) continue;
                  _g440.push(v_r);
                }
              }
              if (!(sameSet(v_W, _g440))) { continue R1; }
              _g464.length = 0;
              _st470.pass++;
              G465: {
                const _a471 = cl.cage.parts;
                for (let _i472 = 0; _i472 < _a471.length; _i472++) {
                  const v_r = _a471[_i472];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a473 = cl.cage.cells[v_r];
                  for (let _i474 = 0; _i474 < _a473.length; _i474++) {
                    const v_c = _a473[_i474];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    const _t475 = v_c;
                    if (_g464.length < 16) { if (!_g464.includes(_t475)) _g464.push(_t475); } else addOnce(_g464, _st470, _t475);
                  }
                }
              }
              if (!(sameSet(v_L, _g464))) { continue R1; }
              let _g476 = 0;
              G477: {
                for (let _m478 = b.domain; _m478 !== 0; _m478 &= _m478 - 1) {
                  const v_d = 31 - Math.clz32(_m478 & -_m478);
                  _g476 += v_d;
                }
              }
              let _g479 = 0;
              G480: {
                const _a481 = sp.lineCells[v_u];
                for (let _i482 = 0; _i482 < _a481.length; _i482++) {
                  const v_c = _a481[_i482];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g479 += (b.grid[v_c] || -1);
                }
              }
              let _g483 = 0;
              G484: {
                const _a485 = v_W;
                for (let _i486 = 0; _i486 < _a485.length; _i486++) {
                  const v_r = _a485[_i486];
                  let _g487 = 0;
                  G488: {
                    const _a489 = cl.cage.cells[v_r];
                    for (let _i490 = 0; _i490 < _a489.length; _i490++) {
                      const v_c = _a489[_i490];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g487 += (b.grid[v_c] || -1);
                    }
                  }
                  _g483 += (clueAt(cl.total, v_r) - _g487);
                }
              }
              if (!((v_s === ((_g476 - _g479) - _g483)))) { continue R1; }
              _g491.length = 0;
              G492: {
                const _a495 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i496 = 0; _i496 < _a495.length; _i496++) {
                  const v_c = _a495[_i496];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g491.push(v_c);
                }
              }
              if (!(sameSet(v_R, _g491))) { continue R1; }
              const _t497 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g498 = 0;
              G499: {
                const _a500 = cl.cage.cells[_t497];
                for (let _i501 = 0; _i501 < _a500.length; _i501++) {
                  const v_c = _a500[_i501];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g498 += (b.grid[v_c] || -1);
                }
              }
              if (!((v_t === ((clueAt(cl.total, _t497) - _g498) - v_s)))) { continue R1; }
            }
            facts.length = 0;
            changed = false;
            let _q502 = true;
            Q503: {
              const _a504 = v_K;
              for (let _i505 = 0; _i505 < _a504.length; _i505++) {
                const v_c = _a504[_i505];
                for (let _m506 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m506 !== 0; _m506 &= _m506 - 1) {
                  const v_d = 31 - Math.clz32(_m506 & -_m506);
                  let _g507 = 0;
                  G508: {
                    const _a509 = v_K;
                    for (let _i510 = 0; _i510 < _a509.length; _i510++) {
                      const v_x = _a509[_i510];
                      if (!((v_x !== v_c))) continue;
                      let _g511 = -1;
                      G512: {
                        for (let _m513 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m513 !== 0; _m513 &= _m513 - 1) {
                          const v_e = 31 - Math.clz32(_m513 & -_m513);
                          if (_g511 === -1 || v_e > _g511) _g511 = v_e;
                        }
                      }
                      _g507 += _g511;
                    }
                  }
                  let _c521: boolean = ((v_d + _g507) < v_v);
                  if (!_c521) {
                    let _g514 = 0;
                    G515: {
                      const _a516 = v_K;
                      for (let _i517 = 0; _i517 < _a516.length; _i517++) {
                        const v_x = _a516[_i517];
                        if (!((v_x !== v_c))) continue;
                        let _g518 = -1;
                        G519: {
                          for (let _m520 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m520 !== 0; _m520 &= _m520 - 1) {
                            const v_e = 31 - Math.clz32(_m520 & -_m520);
                            if (_g518 === -1 || v_e < _g518) _g518 = v_e;
                          }
                        }
                        _g514 += _g518;
                      }
                    }
                    _c521 = ((v_d + _g514) > v_v);
                  }
                  if (!(_c521)) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q502 = false;
                    break Q503;
                  }
                }
              }
            }
            if (!(_q502)) return -1;
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
  const _g537: number[] = [];
  const facts = cageSumsFacts;
  let fired = 0;
  let changed = false;
  if (cageSumsCands.length < sp.cells.length) cageSumsCands = new Int32Array(sp.cells.length);
  const cands = cageSumsCands;
  cands.fill(-1);
  const _a535 = cl.cage.parts;
  for (let _i536 = 0; _i536 < _a535.length; _i536++) {
    const v_r = _a535[_i536];
    const _h544 = clueAt(cl.total, v_r);
    _g537.length = 0;
    G538: {
      const _a541 = cl.cage.cells[v_r];
      for (let _i542 = 0; _i542 < _a541.length; _i542++) {
        const v_c = _a541[_i542];
        const _h543 = (b.grid[v_c] !== 0);
        if (!(!(_h543))) continue;
        _g537.push(v_c);
      }
    }
    const v_K = _g537;
    const _h552 = v_K.length;
    let _g545 = 0;
    G546: {
      const _a547 = cl.cage.cells[v_r];
      for (let _i548 = 0; _i548 < _a547.length; _i548++) {
        const v_c = _a547[_i548];
        const _h549 = (b.grid[v_c] !== 0);
        if (!(_h549)) continue;
        const _h550 = (b.grid[v_c] || -1);
        _g545 += _h550;
      }
    }
    L551: {
      const v_t = (_h544 - _g545);
      if (!((v_t !== 0))) break L551;
      facts.length = 0;
      changed = false;
      let _c595: boolean = (_h552 > 0);
      if (_c595) {
        let _c594: boolean = ((_h552 < 2) || (_h552 > 4));
        if (!_c594) {
          let _q553 = true;
          Q554: {
            let _g555 = 0;
            G556: {
              const _e572 = valuesOf(b.domain);
              const _n575 = 1 << _e572.length;
              for (let _k573 = _h552 > _e572.length ? _n575 : (1 << _h552) - 1; _k573 < _n575; _k573 = _h552 === 0 ? _n575 : nextOfSize(_k573)) {
                let v_T = 0;
                for (let _j574 = 0; _j574 < _e572.length; _j574++) if ((_k573 >> (_e572.length - 1 - _j574)) & 1) v_T |= 1 << _e572[_j574];
                const _h576 = popcount(v_T);
                let _c580: boolean = (_h576 === _h552);
                if (_c580) {
                  let _g577 = 0;
                  G578: {
                    for (let _m579 = v_T; _m579 !== 0; _m579 &= _m579 - 1) {
                      const v_e = 31 - Math.clz32(_m579 & -_m579);
                      _g577 += v_e;
                    }
                  }
                  _c580 = (_g577 === v_t);
                }
                let _c585: boolean = _c580;
                if (_c585) {
                  let _q581 = true;
                  Q582: {
                    const _a583 = v_K;
                    for (let _i584 = 0; _i584 < _a583.length; _i584++) {
                      const v_x = _a583[_i584];
                      if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                        _q581 = false;
                        break Q582;
                      }
                    }
                  }
                  _c585 = _q581;
                }
                if (!(_c585)) continue;
                for (let _m586 = v_T; _m586 !== 0; _m586 &= _m586 - 1) {
                  const v_d = 31 - Math.clz32(_m586 & -_m586);
                  _g555 |= 1 << v_d;
                }
              }
            }
            const v_P = _g555;
            const _h587 = popcount(v_P);
            let _c593: boolean = (_h587 > 0);
            if (_c593) {
              let _q588 = true;
              Q589: {
                const _a590 = v_K;
                for (let _i591 = 0; _i591 < _a590.length; _i591++) {
                  const v_c = _a590[_i591];
                  for (let _m592 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m592 !== 0; _m592 &= _m592 - 1) {
                    const v_d = 31 - Math.clz32(_m592 & -_m592);
                    if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                    if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                    if (!(true)) {
                      _q588 = false;
                      break Q589;
                    }
                  }
                }
              }
              _c593 = _q588;
            }
            if (!(_c593)) {
              _q553 = false;
              break Q554;
            }
          }
          _c594 = _q553;
        }
        _c595 = _c594;
      }
      if (!(_c595)) return -1;
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
const _st707 = stamps();
const _st798 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partSums(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartSumsBinding> | null): number {
  const _g675: number[] = [];
  const _g701: number[] = [];
  const _g737: number[] = [];
  const _g752: number[] = [];
  const _g768: number[] = [];
  const _g792: number[] = [];
  const _g819: number[] = [];
  const facts = partSumsFacts;
  let fired = 0;
  let changed = false;
  if (partSumsCands.length < sp.cells.length) partSumsCands = new Int32Array(sp.cells.length);
  const cands = partSumsCands;
  cands.fill(-1);
  const _a673 = union(union(sp.rows, sp.cols), sp.boxes);
  R1:
  for (let _i674 = 0; _i674 < _a673.length; _i674++) {
    const v_u = _a673[_i674];
    const _m227_0 = b.made[0];
    _g675.length = 0;
    G676: {
      const _a688 = cl.cage.parts;
      for (let _i689 = 0; _i689 < _a688.length; _i689++) {
        const v_r = _a688[_i689];
        let _q690 = false;
        Q691: {
          const _a692 = cl.cage.cells[v_r];
          for (let _i693 = 0; _i693 < _a692.length; _i693++) {
            const v_c = _a692[_i693];
            const _h694 = (b.grid[v_c] !== 0);
            if (!(_h694)) {
              _q690 = true;
              break Q691;
            }
          }
        }
        let _c700: boolean = _q690;
        if (_c700) {
          let _q695 = true;
          Q696: {
            const _a697 = cl.cage.cells[v_r];
            for (let _i698 = 0; _i698 < _a697.length; _i698++) {
              const v_c = _a697[_i698];
              const _h699 = (b.grid[v_c] !== 0);
              if (!(!(_h699))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q695 = false;
                break Q696;
              }
            }
          }
          _c700 = _q695;
        }
        if (!(_c700)) continue;
        _g675.push(v_r);
      }
    }
    const v_W = _g675;
    _g701.length = 0;
    _st707.pass++;
    G702: {
      const _a708 = cl.cage.parts;
      for (let _i709 = 0; _i709 < _a708.length; _i709++) {
        const v_r = _a708[_i709];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a710 = cl.cage.cells[v_r];
        for (let _i711 = 0; _i711 < _a710.length; _i711++) {
          const v_c = _a710[_i711];
          const _h712 = (b.grid[v_c] !== 0);
          if (!((!(_h712) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t713 = v_c;
          if (_g701.length < 16) { if (!_g701.includes(_t713)) _g701.push(_t713); } else addOnce(_g701, _st707, _t713);
        }
      }
    }
    L714: {
      const v_L = _g701;
      const _h715 = v_L.length;
      if (!(((_h715 > 1) && (_h715 < sp.w)))) break L714;
      let _g716 = 0;
      G717: {
        for (let _m718 = b.domain; _m718 !== 0; _m718 &= _m718 - 1) {
          const v_d = 31 - Math.clz32(_m718 & -_m718);
          _g716 += v_d;
        }
      }
      let _g719 = 0;
      G720: {
        const _a721 = sp.lineCells[v_u];
        for (let _i722 = 0; _i722 < _a721.length; _i722++) {
          const v_c = _a721[_i722];
          const _h723 = (b.grid[v_c] !== 0);
          if (!(_h723)) continue;
          const _h724 = (b.grid[v_c] || -1);
          _g719 += _h724;
        }
      }
      let _g725 = 0;
      G726: {
        const _a727 = v_W;
        for (let _i728 = 0; _i728 < _a727.length; _i728++) {
          const v_r = _a727[_i728];
          const _h729 = clueAt(cl.total, v_r);
          let _g730 = 0;
          G731: {
            const _a732 = cl.cage.cells[v_r];
            for (let _i733 = 0; _i733 < _a732.length; _i733++) {
              const v_c = _a732[_i733];
              const _h734 = (b.grid[v_c] !== 0);
              if (!(_h734)) continue;
              const _h735 = (b.grid[v_c] || -1);
              _g730 += _h735;
            }
          }
          _g725 += (_h729 - _g730);
        }
      }
      L736: {
        const v_s = ((_g716 - _g719) - _g725);
        if (!((v_s > 0))) break L736;
        _g737.length = 0;
        G738: {
          const _a741 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i742 = 0; _i742 < _a741.length; _i742++) {
            const v_c = _a741[_i742];
            const _h743 = (b.grid[v_c] !== 0);
            if (!((!(_h743) && !(v_L.includes(v_c))))) continue;
            _g737.push(v_c);
          }
        }
        const v_R = _g737;
        const _h756 = union(v_L, v_R);
        const _t744 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h745 = clueAt(cl.total, _t744);
        let _g746 = 0;
        G747: {
          const _a748 = cl.cage.cells[_t744];
          for (let _i749 = 0; _i749 < _a748.length; _i749++) {
            const v_c = _a748[_i749];
            const _h750 = (b.grid[v_c] !== 0);
            if (!(_h750)) continue;
            const _h751 = (b.grid[v_c] || -1);
            _g746 += _h751;
          }
        }
        const v_t = ((_h745 - _g746) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h759 = (v_i === 0);
          _g752.length = 0;
          G753: {
            const _a757 = _h756;
            for (let _i758 = 0; _i758 < _a757.length; _i758++) {
              const v_c = _a757[_i758];
              if (!((_h759 === (v_L.includes(v_c))))) continue;
              _g752.push(v_c);
            }
          }
          const v_K = _g752;
          const _h761 = v_K.length;
          L760: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c767: boolean = (((_h761 > 1) && (_h761 <= 4)) && (v_v !== 0));
            if (_c767) {
              let _c766: boolean = (v_i === 0);
              if (!_c766) {
                let _q762 = true;
                Q763: {
                  const _a764 = v_L;
                  for (let _i765 = 0; _i765 < _a764.length; _i765++) {
                    const v_c = _a764[_i765];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q762 = false;
                      break Q763;
                    }
                  }
                }
                _c766 = _q762;
              }
              _c767 = _c766;
            }
            if (!(_c767)) break L760;
            if (b.made[0] !== _m227_0) {
              _g768.length = 0;
              G769: {
                const _a781 = cl.cage.parts;
                for (let _i782 = 0; _i782 < _a781.length; _i782++) {
                  const v_r = _a781[_i782];
                  let _q783 = false;
                  Q784: {
                    const _a785 = cl.cage.cells[v_r];
                    for (let _i786 = 0; _i786 < _a785.length; _i786++) {
                      const v_c = _a785[_i786];
                      if (!((b.grid[v_c] !== 0))) {
                        _q783 = true;
                        break Q784;
                      }
                    }
                  }
                  let _c791: boolean = _q783;
                  if (_c791) {
                    let _q787 = true;
                    Q788: {
                      const _a789 = cl.cage.cells[v_r];
                      for (let _i790 = 0; _i790 < _a789.length; _i790++) {
                        const v_c = _a789[_i790];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q787 = false;
                          break Q788;
                        }
                      }
                    }
                    _c791 = _q787;
                  }
                  if (!(_c791)) continue;
                  _g768.push(v_r);
                }
              }
              if (!(sameSet(v_W, _g768))) { continue R1; }
              _g792.length = 0;
              _st798.pass++;
              G793: {
                const _a799 = cl.cage.parts;
                for (let _i800 = 0; _i800 < _a799.length; _i800++) {
                  const v_r = _a799[_i800];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a801 = cl.cage.cells[v_r];
                  for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                    const v_c = _a801[_i802];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    const _t803 = v_c;
                    if (_g792.length < 16) { if (!_g792.includes(_t803)) _g792.push(_t803); } else addOnce(_g792, _st798, _t803);
                  }
                }
              }
              if (!(sameSet(v_L, _g792))) { continue R1; }
              let _g804 = 0;
              G805: {
                for (let _m806 = b.domain; _m806 !== 0; _m806 &= _m806 - 1) {
                  const v_d = 31 - Math.clz32(_m806 & -_m806);
                  _g804 += v_d;
                }
              }
              let _g807 = 0;
              G808: {
                const _a809 = sp.lineCells[v_u];
                for (let _i810 = 0; _i810 < _a809.length; _i810++) {
                  const v_c = _a809[_i810];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g807 += (b.grid[v_c] || -1);
                }
              }
              let _g811 = 0;
              G812: {
                const _a813 = v_W;
                for (let _i814 = 0; _i814 < _a813.length; _i814++) {
                  const v_r = _a813[_i814];
                  let _g815 = 0;
                  G816: {
                    const _a817 = cl.cage.cells[v_r];
                    for (let _i818 = 0; _i818 < _a817.length; _i818++) {
                      const v_c = _a817[_i818];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g815 += (b.grid[v_c] || -1);
                    }
                  }
                  _g811 += (clueAt(cl.total, v_r) - _g815);
                }
              }
              if (!((v_s === ((_g804 - _g807) - _g811)))) { continue R1; }
              _g819.length = 0;
              G820: {
                const _a823 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i824 = 0; _i824 < _a823.length; _i824++) {
                  const v_c = _a823[_i824];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g819.push(v_c);
                }
              }
              if (!(sameSet(v_R, _g819))) { continue R1; }
              const _t825 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g826 = 0;
              G827: {
                const _a828 = cl.cage.cells[_t825];
                for (let _i829 = 0; _i829 < _a828.length; _i829++) {
                  const v_c = _a828[_i829];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g826 += (b.grid[v_c] || -1);
                }
              }
              if (!((v_t === ((clueAt(cl.total, _t825) - _g826) - v_s)))) { continue R1; }
            }
            facts.length = 0;
            changed = false;
            let _q830 = true;
            Q831: {
              let _g832 = 0;
              G833: {
                const _e849 = valuesOf(b.domain);
                const _n852 = 1 << _e849.length;
                for (let _k850 = _h761 > _e849.length ? _n852 : (1 << _h761) - 1; _k850 < _n852; _k850 = _h761 === 0 ? _n852 : nextOfSize(_k850)) {
                  let v_T = 0;
                  for (let _j851 = 0; _j851 < _e849.length; _j851++) if ((_k850 >> (_e849.length - 1 - _j851)) & 1) v_T |= 1 << _e849[_j851];
                  const _h853 = popcount(v_T);
                  let _c857: boolean = (_h853 === _h761);
                  if (_c857) {
                    let _g854 = 0;
                    G855: {
                      for (let _m856 = v_T; _m856 !== 0; _m856 &= _m856 - 1) {
                        const v_e = 31 - Math.clz32(_m856 & -_m856);
                        _g854 += v_e;
                      }
                    }
                    _c857 = (_g854 === v_v);
                  }
                  let _c862: boolean = _c857;
                  if (_c862) {
                    let _q858 = true;
                    Q859: {
                      const _a860 = v_K;
                      for (let _i861 = 0; _i861 < _a860.length; _i861++) {
                        const v_x = _a860[_i861];
                        if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                          _q858 = false;
                          break Q859;
                        }
                      }
                    }
                    _c862 = _q858;
                  }
                  if (!(_c862)) continue;
                  for (let _m863 = v_T; _m863 !== 0; _m863 &= _m863 - 1) {
                    const v_d = 31 - Math.clz32(_m863 & -_m863);
                    _g832 |= 1 << v_d;
                  }
                }
              }
              const v_P = _g832;
              const _h864 = popcount(v_P);
              let _c870: boolean = (_h864 > 0);
              if (_c870) {
                let _q865 = true;
                Q866: {
                  const _a867 = v_K;
                  for (let _i868 = 0; _i868 < _a867.length; _i868++) {
                    const v_c = _a867[_i868];
                    for (let _m869 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m869 !== 0; _m869 &= _m869 - 1) {
                      const v_d = 31 - Math.clz32(_m869 & -_m869);
                      if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                      if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                      if (!(true)) {
                        _q865 = false;
                        break Q866;
                      }
                    }
                  }
                }
                _c870 = _q865;
              }
              if (!(_c870)) {
                _q830 = false;
                break Q831;
              }
            }
            if (!(_q830)) return -1;
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
  const _a898 = union(union(sp.rows, sp.cols), sp.diagonals);
  for (let _i899 = 0; _i899 < _a898.length; _i899++) {
    const v_L = _a898[_i899];
    const _a900 = sp.boxes;
    for (let _i901 = 0; _i901 < _a900.length; _i901++) {
      const v_b = _a900[_i901];
      let _q902 = false;
      Q903: {
        const _a904 = sp.lineCells[v_L];
        for (let _i905 = 0; _i905 < _a904.length; _i905++) {
          const v_c = _a904[_i905];
          if ((sp.boxOf[v_c] === v_b)) {
            _q902 = true;
            break Q903;
          }
        }
      }
      if (!(_q902)) continue;
      for (let _m906 = b.domain; _m906 !== 0; _m906 &= _m906 - 1) {
        const v_d = 31 - Math.clz32(_m906 & -_m906);
        let _q907 = false;
        Q908: {
          const _a909 = sp.lineCells[v_L];
          for (let _i910 = 0; _i910 < _a909.length; _i910++) {
            const v_c = _a909[_i910];
            const _h911 = (b.grid[v_c] || -1);
            if ((_h911 === v_d)) {
              _q907 = true;
              break Q908;
            }
          }
        }
        let _c917: boolean = !(_q907);
        if (_c917) {
          let _q912 = false;
          Q913: {
            const _a914 = sp.lineCells[v_b];
            for (let _i915 = 0; _i915 < _a914.length; _i915++) {
              const v_c = _a914[_i915];
              const _h916 = (b.grid[v_c] || -1);
              if ((_h916 === v_d)) {
                _q912 = true;
                break Q913;
              }
            }
          }
          _c917 = !(_q912);
        }
        if (!(_c917)) continue;
        let _q918 = true;
        Q919: {
          const _a920 = sp.lineCells[v_L];
          for (let _i921 = 0; _i921 < _a920.length; _i921++) {
            const v_c = _a920[_i921];
            if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
            if (!((sp.boxOf[v_c] === v_b))) {
              _q918 = false;
              break Q919;
            }
          }
        }
        let _c926: boolean = _q918;
        if (_c926) {
          let _q922 = false;
          Q923: {
            const _a924 = sp.lineCells[v_b];
            for (let _i925 = 0; _i925 < _a924.length; _i925++) {
              const v_c = _a924[_i925];
              if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                _q922 = true;
                break Q923;
              }
            }
          }
          _c926 = _q922;
        }
        const v_first = _c926;
        facts.length = 0;
        changed = false;
        let _c931: boolean = !(v_first);
        if (!_c931) {
          let _q927 = true;
          Q928: {
            const _a929 = sp.lineCells[v_b];
            for (let _i930 = 0; _i930 < _a929.length; _i930++) {
              const v_c = _a929[_i930];
              if (!((!(sp.lineCells[v_L].includes(v_c)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q927 = false;
                break Q928;
              }
            }
          }
          _c931 = _q927;
        }
        let _c942: boolean = _c931;
        if (_c942) {
          let _c941: boolean = v_first;
          if (!_c941) {
            let _q932 = true;
            Q933: {
              const _a934 = sp.lineCells[v_b];
              for (let _i935 = 0; _i935 < _a934.length; _i935++) {
                const v_c = _a934[_i935];
                if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
                if (!((sp.lineCells[v_L].includes(v_c)))) {
                  _q932 = false;
                  break Q933;
                }
              }
            }
            let _c940: boolean = !(_q932);
            if (!_c940) {
              let _q936 = true;
              Q937: {
                const _a938 = sp.lineCells[v_L];
                for (let _i939 = 0; _i939 < _a938.length; _i939++) {
                  const v_c = _a938[_i939];
                  if (!(((sp.boxOf[v_c] !== v_b) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q936 = false;
                    break Q937;
                  }
                }
              }
              _c940 = _q936;
            }
            _c941 = _c940;
          }
          _c942 = _c941;
        }
        if (!(_c942)) return -1;
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
  const _g984: number[] = [];
  const _g1015: number[] = [];
  const _g1031: number[] = [];
  const facts = digitSetFacts;
  let fired = 0;
  let changed = false;
  const _h999 = (sp.w - 1);
  const _h1000 = rangeMask(0, _h999);
  R1:
  for (let _m983 = b.domain; _m983 !== 0; _m983 &= _m983 - 1) {
    const v_d = 31 - Math.clz32(_m983 & -_m983);
    const _m328_0 = b.made[0];
    _g984.length = 0;
    G985: {
      const _a992 = sp.rows;
      for (let _i993 = 0; _i993 < _a992.length; _i993++) {
        const v_L = _a992[_i993];
        let _q994 = false;
        Q995: {
          const _a996 = sp.lineCells[v_L];
          for (let _i997 = 0; _i997 < _a996.length; _i997++) {
            const v_c = _a996[_i997];
            const _h998 = (b.grid[v_c] || -1);
            if ((_h998 === v_d)) {
              _q994 = true;
              break Q995;
            }
          }
        }
        if (!(!(_q994))) continue;
        _g984.push(v_L);
      }
    }
    const v_Y0 = _g984;
    const _h1013 = v_Y0.length;
    const _h1014 = (_h1013 - 2);
    const _m334_1 = b.made[1];
    let _g1001 = 0;
    G1002: {
      const _a1005 = cellsValued(b, sp.cells, v_d);
      for (let _i1006 = 0; _i1006 < _a1005.length; _i1006++) {
        const v_c = _a1005[_i1006];
        const _h1007 = (b.grid[v_c] || -1);
        if (!((_h1007 === v_d))) continue;
        const _t1008 = (v_c % sp.w);
        _g1001 |= 1 << _t1008;
      }
    }
    const v_X0 = (_h1000 & ~_g1001);
    const _e1009 = valuesOf(v_X0);
    for (let _k1010 = 0; _k1010 < 1 << _e1009.length; _k1010++) {
      let v_T = 0;
      for (let _j1011 = 0; _j1011 < _e1009.length; _j1011++) if ((_k1010 >> (_e1009.length - 1 - _j1011)) & 1) v_T |= 1 << _e1009[_j1011];
      const _h1012 = popcount(v_T);
      if (!(((_h1012 === 0) || ((2 <= _h1012) && (_h1012 <= _h1014))))) continue;
      const _h1067 = (v_X0 & ~v_T);
      _g1015.length = 0;
      G1016: {
        const _a1023 = v_Y0;
        for (let _i1024 = 0; _i1024 < _a1023.length; _i1024++) {
          const v_L = _a1023[_i1024];
          let _q1025 = false;
          Q1026: {
            const _a1027 = sp.lineCells[v_L];
            for (let _i1028 = 0; _i1028 < _a1027.length; _i1028++) {
              const v_c = _a1027[_i1028];
              if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0))) {
                _q1025 = true;
                break Q1026;
              }
            }
          }
          if (!(!(_q1025))) continue;
          _g1015.push(v_L);
        }
      }
      L1029: {
        const v_Y = _g1015;
        const _h1030 = v_Y.length;
        if (!((_h1030 >= (_h1013 - _h1012)))) break L1029;
        if (b.made[0] !== _m328_0 || b.made[1] !== _m334_1) {
          _g1031.length = 0;
          G1032: {
            const _a1039 = sp.rows;
            for (let _i1040 = 0; _i1040 < _a1039.length; _i1040++) {
              const v_L = _a1039[_i1040];
              let _q1041 = false;
              Q1042: {
                const _a1043 = sp.lineCells[v_L];
                for (let _i1044 = 0; _i1044 < _a1043.length; _i1044++) {
                  const v_c = _a1043[_i1044];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q1041 = true;
                    break Q1042;
                  }
                }
              }
              if (!(!(_q1041))) continue;
              _g1031.push(v_L);
            }
          }
          if (!(sameSet(v_Y0, _g1031))) { continue R1; }
          let _g1045 = 0;
          G1046: {
            const _a1049 = cellsValued(b, sp.cells, v_d);
            for (let _i1050 = 0; _i1050 < _a1049.length; _i1050++) {
              const v_c = _a1049[_i1050];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              const _t1051 = (v_c % sp.w);
              _g1045 |= 1 << _t1051;
            }
          }
          if (!((v_X0 === (rangeMask(0, (sp.w - 1)) & ~_g1045)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c1060: boolean = (_h1012 > 0);
        if (!_c1060) {
          let _q1052 = true;
          Q1053: {
            const _a1054 = sp.rows;
            for (let _i1055 = 0; _i1055 < _a1054.length; _i1055++) {
              const v_L = _a1054[_i1055];
              let _q1056 = false;
              Q1057: {
                const _a1058 = sp.lineCells[v_L];
                for (let _i1059 = 0; _i1059 < _a1058.length; _i1059++) {
                  const v_c = _a1058[_i1059];
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                    _q1056 = true;
                    break Q1057;
                  }
                }
              }
              if (!(_q1056)) {
                _q1052 = false;
                break Q1053;
              }
            }
          }
          _c1060 = _q1052;
        }
        let _c1068: boolean = (_c1060 && (_h1030 === (_h1013 - _h1012)));
        if (_c1068) {
          let _q1061 = true;
          Q1062: {
            const _a1063 = minus(v_Y0, v_Y);
            for (let _i1064 = 0; _i1064 < _a1063.length; _i1064++) {
              const v_L = _a1063[_i1064];
              const _a1065 = sp.lineCells[v_L];
              for (let _i1066 = 0; _i1066 < _a1065.length; _i1066++) {
                const v_c = _a1065[_i1066];
                if (!(((((_h1067 >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q1061 = false;
                  break Q1062;
                }
              }
            }
          }
          _c1068 = _q1061;
        }
        if (!(_c1068)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, Y0: v_Y0.slice(), X0: v_X0, T: v_T, Y: v_Y.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
