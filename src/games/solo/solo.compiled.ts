// Compiled by `npm run describe` from src/games/solo/solo.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, cellsValued, clueAt, freshBinding, minus, nextOfSize, popcount, rangeMask, sameSet, staleChecking, stamps, union, valuesOf } from "../../engine/describe-runtime.ts";

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
  let _q1371 = true;
  const _n1375 = new Int32Array(32);
  Q1372: for (const _u1373 of sp.units) {
    _n1375.fill(0);
    for (const _c1374 of sp.lineCells[_u1373]) {
      const _t1376 = (g[_c1374] || -1);
      if (++_n1375[_t1376] > 1) {
        _q1371 = false;
        break Q1372;
      }
    }
  }
  if (!(_q1371)) return false;
  for (let _k1377 = 0; _k1377 < cl.total.at.length; _k1377++) {
    const _at1378 = cl.total.at[_k1377];
    const _v1379 = cl.total.v[_k1377];
    let _g1380 = 0;
    G1381: {
      const _a1382 = cl.cage.cells[_at1378];
      for (let _i1383 = 0; _i1383 < _a1382.length; _i1383++) {
        const v_c = _a1382[_i1383];
        const _h1384 = (g[v_c] || -1);
        _g1380 += _h1384;
      }
    }
    let _c1391: boolean = (_g1380 === _v1379);
    if (_c1391) {
      let _g1385 = true;
      const _s1387: number[] = [];
      G1386: {
        const _a1388 = cl.cage.cells[_at1378];
        for (let _i1389 = 0; _i1389 < _a1388.length; _i1389++) {
          const v_c = _a1388[_i1389];
          const _h1390 = (g[v_c] || -1);
          if (_s1387.includes(_h1390)) {
            _g1385 = false;
            break G1386;
          }
          _s1387.push(_h1390);
        }
      }
      _c1391 = _g1385;
    }
    if (!(_c1391)) return false;
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
        if (import.meta.env.DEV && staleChecking) {
          let _g38 = 0;
          G39: {
            const _a42 = sp.lineCells[v_u];
            for (let _i43 = 0; _i43 < _a42.length; _i43++) {
              const v_c = _a42[_i43];
              if (!((b.grid[v_c] !== 0))) continue;
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
          freshBinding("boxSingle", [(sp.boxes.includes(v_u)), (v_placed === _g38), ((((b.domain & ~v_placed) >> v_d) & 1) !== 0), (v_n === _g45), (v_n < 2)], ["u in", "placed =", "d in", "n =", "where of n"]);
        }
        facts.length = 0;
        changed = false;
        let _c54: boolean = (v_n === 1);
        if (_c54) {
          let _g49 = -1;
          let _n51 = 0;
          G50: {
            const _a52 = sp.lineCells[v_u];
            for (let _i53 = 0; _i53 < _a52.length; _i53++) {
              const v_c = _a52[_i53];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              if (++_n51 === 2) {
                _g49 = -1;
                break G50;
              }
              _g49 = v_c;
            }
          }
          if (!(b.grid[_g49] !== 0)) { if (fire === null) { b.placeAt(_g49, v_d); changed = true; } else facts.push(PLACE, _g49, v_d); }
          _c54 = true;
        }
        if (!(_c54)) return -1;
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
  const _g70: number[] = [];
  const facts = cageSingleFacts;
  let fired = 0;
  let changed = false;
  const _a68 = cl.cage.parts;
  for (let _i69 = 0; _i69 < _a68.length; _i69++) {
    const v_r = _a68[_i69];
    const _h78 = clueAt(cl.total, v_r);
    _g70.length = 0;
    G71: {
      const _a74 = cl.cage.cells[v_r];
      for (let _i75 = 0; _i75 < _a74.length; _i75++) {
        const v_c = _a74[_i75];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g70.push(v_c);
      }
    }
    L76: {
      const v_K = _g70;
      const _h77 = v_K.length;
      if (!((_h77 === 1))) break L76;
      const v_c = (v_K.length > 0 ? v_K[0] : -1);
      let _g79 = 0;
      G80: {
        const _a81 = cl.cage.cells[v_r];
        for (let _i82 = 0; _i82 < _a81.length; _i82++) {
          const v_c = _a81[_i82];
          if (!((b.grid[v_c] !== 0))) continue;
          _g79 += (b.grid[v_c] || -1);
        }
      }
      const v_t = (_h78 - _g79);
      if (import.meta.env.DEV && staleChecking) {
        const _g83: number[] = [];
        G84: {
          const _a87 = cl.cage.cells[v_r];
          for (let _i88 = 0; _i88 < _a87.length; _i88++) {
            const v_c = _a87[_i88];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g83.push(v_c);
          }
        }
        let _g89 = 0;
        G90: {
          const _a91 = cl.cage.cells[v_r];
          for (let _i92 = 0; _i92 < _a91.length; _i92++) {
            const v_c = _a91[_i92];
            if (!((b.grid[v_c] !== 0))) continue;
            _g89 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("cageSingle", [(cl.cage.parts.includes(v_r)), sameSet(v_K, _g83), (v_K.length === 1), (v_c === (v_K.length > 0 ? v_K[0] : -1)), (v_t === (clueAt(cl.total, v_r) - _g89))], ["r in", "K =", "where of K", "c =", "t ="]);
      }
      facts.length = 0;
      changed = false;
      let _c93: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[v_c] >> v_t) & 1) !== 0));
      if (_c93) {
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_t); changed = true; } else facts.push(PLACE, v_c, v_t); }
        _c93 = true;
      }
      if (!(_c93)) return -1;
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
const _st189 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function regionRule(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionRuleBinding> | null): number {
  const _g159: number[] = [];
  const _g183: number[] = [];
  const _g213: number[] = [];
  const facts = regionRuleFacts;
  let fired = 0;
  let changed = false;
  const _a157 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i158 = 0; _i158 < _a157.length; _i158++) {
    const v_u = _a157[_i158];
    _g159.length = 0;
    G160: {
      const _a172 = cl.cage.parts;
      for (let _i173 = 0; _i173 < _a172.length; _i173++) {
        const v_r = _a172[_i173];
        let _q174 = false;
        Q175: {
          const _a176 = cl.cage.cells[v_r];
          for (let _i177 = 0; _i177 < _a176.length; _i177++) {
            const v_c = _a176[_i177];
            if (!((b.grid[v_c] !== 0))) {
              _q174 = true;
              break Q175;
            }
          }
        }
        let _c182: boolean = _q174;
        if (_c182) {
          let _q178 = true;
          Q179: {
            const _a180 = cl.cage.cells[v_r];
            for (let _i181 = 0; _i181 < _a180.length; _i181++) {
              const v_c = _a180[_i181];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q178 = false;
                break Q179;
              }
            }
          }
          _c182 = _q178;
        }
        if (!(_c182)) continue;
        _g159.push(v_r);
      }
    }
    const v_W = _g159;
    _g183.length = 0;
    _st189.pass++;
    G184: {
      const _a190 = cl.cage.parts;
      for (let _i191 = 0; _i191 < _a190.length; _i191++) {
        const v_r = _a190[_i191];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a192 = cl.cage.cells[v_r];
        for (let _i193 = 0; _i193 < _a192.length; _i193++) {
          const v_c = _a192[_i193];
          if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t194 = v_c;
          if (_g183.length < 16) { if (!_g183.includes(_t194)) _g183.push(_t194); } else addOnce(_g183, _st189, _t194);
        }
      }
    }
    L195: {
      const v_L = _g183;
      const _h196 = v_L.length;
      if (!(((_h196 > 0) && (_h196 < sp.w)))) break L195;
      let _g197 = 0;
      G198: {
        for (let _m199 = b.domain; _m199 !== 0; _m199 &= _m199 - 1) {
          const v_d = 31 - Math.clz32(_m199 & -_m199);
          _g197 += v_d;
        }
      }
      let _g200 = 0;
      G201: {
        const _a202 = sp.lineCells[v_u];
        for (let _i203 = 0; _i203 < _a202.length; _i203++) {
          const v_c = _a202[_i203];
          if (!((b.grid[v_c] !== 0))) continue;
          _g200 += (b.grid[v_c] || -1);
        }
      }
      let _g204 = 0;
      G205: {
        const _a206 = v_W;
        for (let _i207 = 0; _i207 < _a206.length; _i207++) {
          const v_r = _a206[_i207];
          const _h208 = clueAt(cl.total, v_r);
          let _g209 = 0;
          G210: {
            const _a211 = cl.cage.cells[v_r];
            for (let _i212 = 0; _i212 < _a211.length; _i212++) {
              const v_c = _a211[_i212];
              if (!((b.grid[v_c] !== 0))) continue;
              _g209 += (b.grid[v_c] || -1);
            }
          }
          _g204 += (_h208 - _g209);
        }
      }
      const v_s = ((_g197 - _g200) - _g204);
      _g213.length = 0;
      G214: {
        const _a217 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
        for (let _i218 = 0; _i218 < _a217.length; _i218++) {
          const v_c = _a217[_i218];
          if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
          _g213.push(v_c);
        }
      }
      const v_R = _g213;
      const _h289 = v_R.length;
      const _t219 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
      const _h220 = clueAt(cl.total, _t219);
      let _g221 = 0;
      G222: {
        const _a223 = cl.cage.cells[_t219];
        for (let _i224 = 0; _i224 < _a223.length; _i224++) {
          const v_c = _a223[_i224];
          if (!((b.grid[v_c] !== 0))) continue;
          _g221 += (b.grid[v_c] || -1);
        }
      }
      const v_t = ((_h220 - _g221) - v_s);
      if (import.meta.env.DEV && staleChecking) {
        const _g225: number[] = [];
        G226: {
          const _a238 = cl.cage.parts;
          for (let _i239 = 0; _i239 < _a238.length; _i239++) {
            const v_r = _a238[_i239];
            let _q240 = false;
            Q241: {
              const _a242 = cl.cage.cells[v_r];
              for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                const v_c = _a242[_i243];
                if (!((b.grid[v_c] !== 0))) {
                  _q240 = true;
                  break Q241;
                }
              }
            }
            let _c248: boolean = _q240;
            if (_c248) {
              let _q244 = true;
              Q245: {
                const _a246 = cl.cage.cells[v_r];
                for (let _i247 = 0; _i247 < _a246.length; _i247++) {
                  const v_c = _a246[_i247];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  if (!((sp.lineCells[v_u].includes(v_c)))) {
                    _q244 = false;
                    break Q245;
                  }
                }
              }
              _c248 = _q244;
            }
            if (!(_c248)) continue;
            _g225.push(v_r);
          }
        }
        const _g249: number[] = [];
        G250: {
          const _a255 = cl.cage.parts;
          for (let _i256 = 0; _i256 < _a255.length; _i256++) {
            const v_r = _a255[_i256];
            if (!(!(v_W.includes(v_r)))) continue;
            const _a257 = cl.cage.cells[v_r];
            for (let _i258 = 0; _i258 < _a257.length; _i258++) {
              const v_c = _a257[_i258];
              if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
              if (!_g249.includes(v_c)) _g249.push(v_c);
            }
          }
        }
        let _g259 = 0;
        G260: {
          for (let _m261 = b.domain; _m261 !== 0; _m261 &= _m261 - 1) {
            const v_d = 31 - Math.clz32(_m261 & -_m261);
            _g259 += v_d;
          }
        }
        let _g262 = 0;
        G263: {
          const _a264 = sp.lineCells[v_u];
          for (let _i265 = 0; _i265 < _a264.length; _i265++) {
            const v_c = _a264[_i265];
            if (!((b.grid[v_c] !== 0))) continue;
            _g262 += (b.grid[v_c] || -1);
          }
        }
        let _g266 = 0;
        G267: {
          const _a268 = v_W;
          for (let _i269 = 0; _i269 < _a268.length; _i269++) {
            const v_r = _a268[_i269];
            let _g270 = 0;
            G271: {
              const _a272 = cl.cage.cells[v_r];
              for (let _i273 = 0; _i273 < _a272.length; _i273++) {
                const v_c = _a272[_i273];
                if (!((b.grid[v_c] !== 0))) continue;
                _g270 += (b.grid[v_c] || -1);
              }
            }
            _g266 += (clueAt(cl.total, v_r) - _g270);
          }
        }
        const _g274: number[] = [];
        G275: {
          const _a278 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i279 = 0; _i279 < _a278.length; _i279++) {
            const v_c = _a278[_i279];
            if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
            _g274.push(v_c);
          }
        }
        const _t280 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        let _g281 = 0;
        G282: {
          const _a283 = cl.cage.cells[_t280];
          for (let _i284 = 0; _i284 < _a283.length; _i284++) {
            const v_c = _a283[_i284];
            if (!((b.grid[v_c] !== 0))) continue;
            _g281 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("regionRule", [(union(union(sp.rows, sp.cols), sp.boxes).includes(v_u)), sameSet(v_W, _g225), sameSet(v_L, _g249), ((v_L.length > 0) && (v_L.length < sp.w)), (v_s === ((_g259 - _g262) - _g266)), sameSet(v_R, _g274), (v_t === ((clueAt(cl.total, _t280) - _g281) - v_s))], ["u in", "W =", "L =", "where of L", "s =", "R =", "t ="]);
      }
      facts.length = 0;
      changed = false;
      let _c288: boolean = (v_s > 0);
      if (_c288) {
        let _c287: boolean = (_h196 !== 1);
        if (!_c287) {
          let _c286: boolean = ((v_s <= sp.w) && (((b.cands[(v_L.length > 0 ? v_L[0] : -1)] >> v_s) & 1) !== 0));
          if (_c286) {
            const _t285 = (v_L.length > 0 ? v_L[0] : -1);
            if (!(b.grid[_t285] !== 0)) { if (fire === null) { b.placeAt(_t285, v_s); changed = true; } else facts.push(PLACE, _t285, v_s); }
            _c286 = true;
          }
          _c287 = _c286;
        }
        _c288 = _c287;
      }
      let _c298: boolean = _c288;
      if (_c298) {
        let _c294: boolean = ((_h196 === 1) || (_h289 !== 1));
        if (!_c294) {
          let _q290 = false;
          Q291: {
            const _a292 = v_L;
            for (let _i293 = 0; _i293 < _a292.length; _i293++) {
              const v_c = _a292[_i293];
              if ((cl.cage.of[v_c] !== cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)])) {
                _q290 = true;
                break Q291;
              }
            }
          }
          _c294 = _q290;
        }
        let _c297: boolean = _c294;
        if (!_c297) {
          let _c296: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[(v_R.length > 0 ? v_R[0] : -1)] >> v_t) & 1) !== 0));
          if (_c296) {
            const _t295 = (v_R.length > 0 ? v_R[0] : -1);
            if (!(b.grid[_t295] !== 0)) { if (fire === null) { b.placeAt(_t295, v_t); changed = true; } else facts.push(PLACE, _t295, v_t); }
            _c296 = true;
          }
          _c297 = _c296;
        }
        _c298 = _c297;
      }
      if (!(_c298)) return -1;
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
  const _g314: number[] = [];
  const facts = cageMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (cageMinMaxCands.length < sp.cells.length) cageMinMaxCands = new Int32Array(sp.cells.length);
  const cands = cageMinMaxCands;
  cands.fill(-1);
  const _a312 = cl.cage.parts;
  for (let _i313 = 0; _i313 < _a312.length; _i313++) {
    const v_r = _a312[_i313];
    const _h321 = clueAt(cl.total, v_r);
    _g314.length = 0;
    G315: {
      const _a318 = cl.cage.cells[v_r];
      for (let _i319 = 0; _i319 < _a318.length; _i319++) {
        const v_c = _a318[_i319];
        const _h320 = (b.grid[v_c] !== 0);
        if (!(!(_h320))) continue;
        _g314.push(v_c);
      }
    }
    const v_K = _g314;
    let _g322 = 0;
    G323: {
      const _a324 = cl.cage.cells[v_r];
      for (let _i325 = 0; _i325 < _a324.length; _i325++) {
        const v_c = _a324[_i325];
        const _h326 = (b.grid[v_c] !== 0);
        if (!(_h326)) continue;
        const _h327 = (b.grid[v_c] || -1);
        _g322 += _h327;
      }
    }
    L328: {
      const v_t = (_h321 - _g322);
      if (!((v_t !== 0))) break L328;
      if (import.meta.env.DEV && staleChecking) {
        const _g329: number[] = [];
        G330: {
          const _a333 = cl.cage.cells[v_r];
          for (let _i334 = 0; _i334 < _a333.length; _i334++) {
            const v_c = _a333[_i334];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g329.push(v_c);
          }
        }
        let _g335 = 0;
        G336: {
          const _a337 = cl.cage.cells[v_r];
          for (let _i338 = 0; _i338 < _a337.length; _i338++) {
            const v_c = _a337[_i338];
            if (!((b.grid[v_c] !== 0))) continue;
            _g335 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("cageMinMax", [(cl.cage.parts.includes(v_r)), sameSet(v_K, _g329), (v_t === (clueAt(cl.total, v_r) - _g335)), (v_t !== 0)], ["r in", "K =", "t =", "where of t"]);
      }
      facts.length = 0;
      changed = false;
      let _q339 = true;
      Q340: {
        const _a341 = v_K;
        for (let _i342 = 0; _i342 < _a341.length; _i342++) {
          const v_c = _a341[_i342];
          for (let _m343 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m343 !== 0; _m343 &= _m343 - 1) {
            const v_d = 31 - Math.clz32(_m343 & -_m343);
            let _g344 = 0;
            G345: {
              const _a346 = v_K;
              for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                const v_x = _a346[_i347];
                if (!((v_x !== v_c))) continue;
                let _g348 = -1;
                G349: {
                  for (let _m350 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m350 !== 0; _m350 &= _m350 - 1) {
                    const v_e = 31 - Math.clz32(_m350 & -_m350);
                    if (_g348 === -1 || v_e > _g348) _g348 = v_e;
                  }
                }
                _g344 += _g348;
              }
            }
            let _c358: boolean = ((v_d + _g344) < v_t);
            if (!_c358) {
              let _g351 = 0;
              G352: {
                const _a353 = v_K;
                for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                  const v_x = _a353[_i354];
                  if (!((v_x !== v_c))) continue;
                  let _g355 = -1;
                  G356: {
                    for (let _m357 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m357 !== 0; _m357 &= _m357 - 1) {
                      const v_e = 31 - Math.clz32(_m357 & -_m357);
                      if (_g355 === -1 || v_e < _g355) _g355 = v_e;
                    }
                  }
                  _g351 += _g355;
                }
              }
              _c358 = ((v_d + _g351) > v_t);
            }
            if (!(_c358)) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q339 = false;
              break Q340;
            }
          }
        }
      }
      if (!(_q339)) return -1;
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
const _st470 = stamps();
const _st561 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partMinMax(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartMinMaxBinding> | null): number {
  const _g438: number[] = [];
  const _g464: number[] = [];
  const _g500: number[] = [];
  const _g515: number[] = [];
  const _g531: number[] = [];
  const _g555: number[] = [];
  const _g582: number[] = [];
  const facts = partMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (partMinMaxCands.length < sp.cells.length) partMinMaxCands = new Int32Array(sp.cells.length);
  const cands = partMinMaxCands;
  cands.fill(-1);
  const _a436 = union(union(sp.rows, sp.cols), sp.boxes);
  R1:
  for (let _i437 = 0; _i437 < _a436.length; _i437++) {
    const v_u = _a436[_i437];
    const _m130_0 = b.made[0];
    _g438.length = 0;
    G439: {
      const _a451 = cl.cage.parts;
      for (let _i452 = 0; _i452 < _a451.length; _i452++) {
        const v_r = _a451[_i452];
        let _q453 = false;
        Q454: {
          const _a455 = cl.cage.cells[v_r];
          for (let _i456 = 0; _i456 < _a455.length; _i456++) {
            const v_c = _a455[_i456];
            const _h457 = (b.grid[v_c] !== 0);
            if (!(_h457)) {
              _q453 = true;
              break Q454;
            }
          }
        }
        let _c463: boolean = _q453;
        if (_c463) {
          let _q458 = true;
          Q459: {
            const _a460 = cl.cage.cells[v_r];
            for (let _i461 = 0; _i461 < _a460.length; _i461++) {
              const v_c = _a460[_i461];
              const _h462 = (b.grid[v_c] !== 0);
              if (!(!(_h462))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q458 = false;
                break Q459;
              }
            }
          }
          _c463 = _q458;
        }
        if (!(_c463)) continue;
        _g438.push(v_r);
      }
    }
    const v_W = _g438;
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
          const _h475 = (b.grid[v_c] !== 0);
          if (!((!(_h475) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t476 = v_c;
          if (_g464.length < 16) { if (!_g464.includes(_t476)) _g464.push(_t476); } else addOnce(_g464, _st470, _t476);
        }
      }
    }
    L477: {
      const v_L = _g464;
      const _h478 = v_L.length;
      if (!(((_h478 > 1) && (_h478 < sp.w)))) break L477;
      let _g479 = 0;
      G480: {
        for (let _m481 = b.domain; _m481 !== 0; _m481 &= _m481 - 1) {
          const v_d = 31 - Math.clz32(_m481 & -_m481);
          _g479 += v_d;
        }
      }
      let _g482 = 0;
      G483: {
        const _a484 = sp.lineCells[v_u];
        for (let _i485 = 0; _i485 < _a484.length; _i485++) {
          const v_c = _a484[_i485];
          const _h486 = (b.grid[v_c] !== 0);
          if (!(_h486)) continue;
          const _h487 = (b.grid[v_c] || -1);
          _g482 += _h487;
        }
      }
      let _g488 = 0;
      G489: {
        const _a490 = v_W;
        for (let _i491 = 0; _i491 < _a490.length; _i491++) {
          const v_r = _a490[_i491];
          const _h492 = clueAt(cl.total, v_r);
          let _g493 = 0;
          G494: {
            const _a495 = cl.cage.cells[v_r];
            for (let _i496 = 0; _i496 < _a495.length; _i496++) {
              const v_c = _a495[_i496];
              const _h497 = (b.grid[v_c] !== 0);
              if (!(_h497)) continue;
              const _h498 = (b.grid[v_c] || -1);
              _g493 += _h498;
            }
          }
          _g488 += (_h492 - _g493);
        }
      }
      L499: {
        const v_s = ((_g479 - _g482) - _g488);
        if (!((v_s > 0))) break L499;
        _g500.length = 0;
        G501: {
          const _a504 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i505 = 0; _i505 < _a504.length; _i505++) {
            const v_c = _a504[_i505];
            const _h506 = (b.grid[v_c] !== 0);
            if (!((!(_h506) && !(v_L.includes(v_c))))) continue;
            _g500.push(v_c);
          }
        }
        const v_R = _g500;
        const _h519 = union(v_L, v_R);
        const _t507 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h508 = clueAt(cl.total, _t507);
        let _g509 = 0;
        G510: {
          const _a511 = cl.cage.cells[_t507];
          for (let _i512 = 0; _i512 < _a511.length; _i512++) {
            const v_c = _a511[_i512];
            const _h513 = (b.grid[v_c] !== 0);
            if (!(_h513)) continue;
            const _h514 = (b.grid[v_c] || -1);
            _g509 += _h514;
          }
        }
        const v_t = ((_h508 - _g509) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h522 = (v_i === 0);
          _g515.length = 0;
          G516: {
            const _a520 = _h519;
            for (let _i521 = 0; _i521 < _a520.length; _i521++) {
              const v_c = _a520[_i521];
              if (!((_h522 === (v_L.includes(v_c))))) continue;
              _g515.push(v_c);
            }
          }
          const v_K = _g515;
          const _h524 = v_K.length;
          L523: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c530: boolean = ((_h524 > 1) && (v_v !== 0));
            if (_c530) {
              let _c529: boolean = (v_i === 0);
              if (!_c529) {
                let _q525 = true;
                Q526: {
                  const _a527 = v_L;
                  for (let _i528 = 0; _i528 < _a527.length; _i528++) {
                    const v_c = _a527[_i528];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q525 = false;
                      break Q526;
                    }
                  }
                }
                _c529 = _q525;
              }
              _c530 = _c529;
            }
            if (!(_c530)) break L523;
            if (b.made[0] !== _m130_0) {
              _g531.length = 0;
              G532: {
                const _a544 = cl.cage.parts;
                for (let _i545 = 0; _i545 < _a544.length; _i545++) {
                  const v_r = _a544[_i545];
                  let _q546 = false;
                  Q547: {
                    const _a548 = cl.cage.cells[v_r];
                    for (let _i549 = 0; _i549 < _a548.length; _i549++) {
                      const v_c = _a548[_i549];
                      if (!((b.grid[v_c] !== 0))) {
                        _q546 = true;
                        break Q547;
                      }
                    }
                  }
                  let _c554: boolean = _q546;
                  if (_c554) {
                    let _q550 = true;
                    Q551: {
                      const _a552 = cl.cage.cells[v_r];
                      for (let _i553 = 0; _i553 < _a552.length; _i553++) {
                        const v_c = _a552[_i553];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q550 = false;
                          break Q551;
                        }
                      }
                    }
                    _c554 = _q550;
                  }
                  if (!(_c554)) continue;
                  _g531.push(v_r);
                }
              }
              if (!(sameSet(v_W, _g531))) { continue R1; }
              _g555.length = 0;
              _st561.pass++;
              G556: {
                const _a562 = cl.cage.parts;
                for (let _i563 = 0; _i563 < _a562.length; _i563++) {
                  const v_r = _a562[_i563];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a564 = cl.cage.cells[v_r];
                  for (let _i565 = 0; _i565 < _a564.length; _i565++) {
                    const v_c = _a564[_i565];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    const _t566 = v_c;
                    if (_g555.length < 16) { if (!_g555.includes(_t566)) _g555.push(_t566); } else addOnce(_g555, _st561, _t566);
                  }
                }
              }
              if (!(sameSet(v_L, _g555))) { continue R1; }
              let _g567 = 0;
              G568: {
                for (let _m569 = b.domain; _m569 !== 0; _m569 &= _m569 - 1) {
                  const v_d = 31 - Math.clz32(_m569 & -_m569);
                  _g567 += v_d;
                }
              }
              let _g570 = 0;
              G571: {
                const _a572 = sp.lineCells[v_u];
                for (let _i573 = 0; _i573 < _a572.length; _i573++) {
                  const v_c = _a572[_i573];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g570 += (b.grid[v_c] || -1);
                }
              }
              let _g574 = 0;
              G575: {
                const _a576 = v_W;
                for (let _i577 = 0; _i577 < _a576.length; _i577++) {
                  const v_r = _a576[_i577];
                  let _g578 = 0;
                  G579: {
                    const _a580 = cl.cage.cells[v_r];
                    for (let _i581 = 0; _i581 < _a580.length; _i581++) {
                      const v_c = _a580[_i581];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g578 += (b.grid[v_c] || -1);
                    }
                  }
                  _g574 += (clueAt(cl.total, v_r) - _g578);
                }
              }
              if (!((v_s === ((_g567 - _g570) - _g574)))) { continue R1; }
              _g582.length = 0;
              G583: {
                const _a586 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i587 = 0; _i587 < _a586.length; _i587++) {
                  const v_c = _a586[_i587];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g582.push(v_c);
                }
              }
              if (!(sameSet(v_R, _g582))) { continue R1; }
              const _t588 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g589 = 0;
              G590: {
                const _a591 = cl.cage.cells[_t588];
                for (let _i592 = 0; _i592 < _a591.length; _i592++) {
                  const v_c = _a591[_i592];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g589 += (b.grid[v_c] || -1);
                }
              }
              if (!((v_t === ((clueAt(cl.total, _t588) - _g589) - v_s)))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g593: number[] = [];
              G594: {
                const _a606 = cl.cage.parts;
                for (let _i607 = 0; _i607 < _a606.length; _i607++) {
                  const v_r = _a606[_i607];
                  let _q608 = false;
                  Q609: {
                    const _a610 = cl.cage.cells[v_r];
                    for (let _i611 = 0; _i611 < _a610.length; _i611++) {
                      const v_c = _a610[_i611];
                      if (!((b.grid[v_c] !== 0))) {
                        _q608 = true;
                        break Q609;
                      }
                    }
                  }
                  let _c616: boolean = _q608;
                  if (_c616) {
                    let _q612 = true;
                    Q613: {
                      const _a614 = cl.cage.cells[v_r];
                      for (let _i615 = 0; _i615 < _a614.length; _i615++) {
                        const v_c = _a614[_i615];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q612 = false;
                          break Q613;
                        }
                      }
                    }
                    _c616 = _q612;
                  }
                  if (!(_c616)) continue;
                  _g593.push(v_r);
                }
              }
              const _g617: number[] = [];
              G618: {
                const _a623 = cl.cage.parts;
                for (let _i624 = 0; _i624 < _a623.length; _i624++) {
                  const v_r = _a623[_i624];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a625 = cl.cage.cells[v_r];
                  for (let _i626 = 0; _i626 < _a625.length; _i626++) {
                    const v_c = _a625[_i626];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    if (!_g617.includes(v_c)) _g617.push(v_c);
                  }
                }
              }
              let _g627 = 0;
              G628: {
                for (let _m629 = b.domain; _m629 !== 0; _m629 &= _m629 - 1) {
                  const v_d = 31 - Math.clz32(_m629 & -_m629);
                  _g627 += v_d;
                }
              }
              let _g630 = 0;
              G631: {
                const _a632 = sp.lineCells[v_u];
                for (let _i633 = 0; _i633 < _a632.length; _i633++) {
                  const v_c = _a632[_i633];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g630 += (b.grid[v_c] || -1);
                }
              }
              let _g634 = 0;
              G635: {
                const _a636 = v_W;
                for (let _i637 = 0; _i637 < _a636.length; _i637++) {
                  const v_r = _a636[_i637];
                  let _g638 = 0;
                  G639: {
                    const _a640 = cl.cage.cells[v_r];
                    for (let _i641 = 0; _i641 < _a640.length; _i641++) {
                      const v_c = _a640[_i641];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g638 += (b.grid[v_c] || -1);
                    }
                  }
                  _g634 += (clueAt(cl.total, v_r) - _g638);
                }
              }
              const _g642: number[] = [];
              G643: {
                const _a646 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i647 = 0; _i647 < _a646.length; _i647++) {
                  const v_c = _a646[_i647];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g642.push(v_c);
                }
              }
              const _t648 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g649 = 0;
              G650: {
                const _a651 = cl.cage.cells[_t648];
                for (let _i652 = 0; _i652 < _a651.length; _i652++) {
                  const v_c = _a651[_i652];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g649 += (b.grid[v_c] || -1);
                }
              }
              const _g653: number[] = [];
              G654: {
                const _a657 = union(v_L, v_R);
                for (let _i658 = 0; _i658 < _a657.length; _i658++) {
                  const v_c = _a657[_i658];
                  if (!(((v_i === 0) === (v_L.includes(v_c))))) continue;
                  _g653.push(v_c);
                }
              }
              let _c664: boolean = ((v_K.length > 1) && (v_v !== 0));
              if (_c664) {
                let _c663: boolean = (v_i === 0);
                if (!_c663) {
                  let _q659 = true;
                  Q660: {
                    const _a661 = v_L;
                    for (let _i662 = 0; _i662 < _a661.length; _i662++) {
                      const v_c = _a661[_i662];
                      if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                        _q659 = false;
                        break Q660;
                      }
                    }
                  }
                  _c663 = _q659;
                }
                _c664 = _c663;
              }
              freshBinding("partMinMax", [(union(union(sp.rows, sp.cols), sp.boxes).includes(v_u)), sameSet(v_W, _g593), sameSet(v_L, _g617), ((v_L.length > 1) && (v_L.length < sp.w)), (v_s === ((_g627 - _g630) - _g634)), (v_s > 0), sameSet(v_R, _g642), (v_t === ((clueAt(cl.total, _t648) - _g649) - v_s)), ((0 <= v_i) && (v_i <= 1)), sameSet(v_K, _g653), (v_v === ((v_s * (1 - v_i)) + (v_t * v_i))), _c664], ["u in", "W =", "L =", "where of L", "s =", "where of s", "R =", "t =", "i in", "K =", "v =", "where of v"]);
            }
            facts.length = 0;
            changed = false;
            let _q665 = true;
            Q666: {
              const _a667 = v_K;
              for (let _i668 = 0; _i668 < _a667.length; _i668++) {
                const v_c = _a667[_i668];
                for (let _m669 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m669 !== 0; _m669 &= _m669 - 1) {
                  const v_d = 31 - Math.clz32(_m669 & -_m669);
                  let _g670 = 0;
                  G671: {
                    const _a672 = v_K;
                    for (let _i673 = 0; _i673 < _a672.length; _i673++) {
                      const v_x = _a672[_i673];
                      if (!((v_x !== v_c))) continue;
                      let _g674 = -1;
                      G675: {
                        for (let _m676 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m676 !== 0; _m676 &= _m676 - 1) {
                          const v_e = 31 - Math.clz32(_m676 & -_m676);
                          if (_g674 === -1 || v_e > _g674) _g674 = v_e;
                        }
                      }
                      _g670 += _g674;
                    }
                  }
                  let _c684: boolean = ((v_d + _g670) < v_v);
                  if (!_c684) {
                    let _g677 = 0;
                    G678: {
                      const _a679 = v_K;
                      for (let _i680 = 0; _i680 < _a679.length; _i680++) {
                        const v_x = _a679[_i680];
                        if (!((v_x !== v_c))) continue;
                        let _g681 = -1;
                        G682: {
                          for (let _m683 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m683 !== 0; _m683 &= _m683 - 1) {
                            const v_e = 31 - Math.clz32(_m683 & -_m683);
                            if (_g681 === -1 || v_e < _g681) _g681 = v_e;
                          }
                        }
                        _g677 += _g681;
                      }
                    }
                    _c684 = ((v_d + _g677) > v_v);
                  }
                  if (!(_c684)) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q665 = false;
                    break Q666;
                  }
                }
              }
            }
            if (!(_q665)) return -1;
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
  const _g700: number[] = [];
  const facts = cageSumsFacts;
  let fired = 0;
  let changed = false;
  if (cageSumsCands.length < sp.cells.length) cageSumsCands = new Int32Array(sp.cells.length);
  const cands = cageSumsCands;
  cands.fill(-1);
  const _a698 = cl.cage.parts;
  for (let _i699 = 0; _i699 < _a698.length; _i699++) {
    const v_r = _a698[_i699];
    const _h707 = clueAt(cl.total, v_r);
    _g700.length = 0;
    G701: {
      const _a704 = cl.cage.cells[v_r];
      for (let _i705 = 0; _i705 < _a704.length; _i705++) {
        const v_c = _a704[_i705];
        const _h706 = (b.grid[v_c] !== 0);
        if (!(!(_h706))) continue;
        _g700.push(v_c);
      }
    }
    const v_K = _g700;
    const _h725 = v_K.length;
    let _g708 = 0;
    G709: {
      const _a710 = cl.cage.cells[v_r];
      for (let _i711 = 0; _i711 < _a710.length; _i711++) {
        const v_c = _a710[_i711];
        const _h712 = (b.grid[v_c] !== 0);
        if (!(_h712)) continue;
        const _h713 = (b.grid[v_c] || -1);
        _g708 += _h713;
      }
    }
    L714: {
      const v_t = (_h707 - _g708);
      if (!((v_t !== 0))) break L714;
      if (import.meta.env.DEV && staleChecking) {
        const _g715: number[] = [];
        G716: {
          const _a719 = cl.cage.cells[v_r];
          for (let _i720 = 0; _i720 < _a719.length; _i720++) {
            const v_c = _a719[_i720];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g715.push(v_c);
          }
        }
        let _g721 = 0;
        G722: {
          const _a723 = cl.cage.cells[v_r];
          for (let _i724 = 0; _i724 < _a723.length; _i724++) {
            const v_c = _a723[_i724];
            if (!((b.grid[v_c] !== 0))) continue;
            _g721 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("cageSums", [(cl.cage.parts.includes(v_r)), sameSet(v_K, _g715), (v_t === (clueAt(cl.total, v_r) - _g721)), (v_t !== 0)], ["r in", "K =", "t =", "where of t"]);
      }
      facts.length = 0;
      changed = false;
      let _c768: boolean = (_h725 > 0);
      if (_c768) {
        let _c767: boolean = ((_h725 < 2) || (_h725 > 4));
        if (!_c767) {
          let _q726 = true;
          Q727: {
            let _g728 = 0;
            G729: {
              const _e745 = valuesOf(b.domain);
              const _n748 = 1 << _e745.length;
              for (let _k746 = _h725 > _e745.length ? _n748 : (1 << _h725) - 1; _k746 < _n748; _k746 = _h725 === 0 ? _n748 : nextOfSize(_k746)) {
                let v_T = 0;
                for (let _j747 = 0; _j747 < _e745.length; _j747++) if ((_k746 >> (_e745.length - 1 - _j747)) & 1) v_T |= 1 << _e745[_j747];
                const _h749 = popcount(v_T);
                let _c753: boolean = (_h749 === _h725);
                if (_c753) {
                  let _g750 = 0;
                  G751: {
                    for (let _m752 = v_T; _m752 !== 0; _m752 &= _m752 - 1) {
                      const v_e = 31 - Math.clz32(_m752 & -_m752);
                      _g750 += v_e;
                    }
                  }
                  _c753 = (_g750 === v_t);
                }
                let _c758: boolean = _c753;
                if (_c758) {
                  let _q754 = true;
                  Q755: {
                    const _a756 = v_K;
                    for (let _i757 = 0; _i757 < _a756.length; _i757++) {
                      const v_x = _a756[_i757];
                      if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                        _q754 = false;
                        break Q755;
                      }
                    }
                  }
                  _c758 = _q754;
                }
                if (!(_c758)) continue;
                for (let _m759 = v_T; _m759 !== 0; _m759 &= _m759 - 1) {
                  const v_d = 31 - Math.clz32(_m759 & -_m759);
                  _g728 |= 1 << v_d;
                }
              }
            }
            const v_P = _g728;
            const _h760 = popcount(v_P);
            let _c766: boolean = (_h760 > 0);
            if (_c766) {
              let _q761 = true;
              Q762: {
                const _a763 = v_K;
                for (let _i764 = 0; _i764 < _a763.length; _i764++) {
                  const v_c = _a763[_i764];
                  for (let _m765 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m765 !== 0; _m765 &= _m765 - 1) {
                    const v_d = 31 - Math.clz32(_m765 & -_m765);
                    if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                    if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                    if (!(true)) {
                      _q761 = false;
                      break Q762;
                    }
                  }
                }
              }
              _c766 = _q761;
            }
            if (!(_c766)) {
              _q726 = false;
              break Q727;
            }
          }
          _c767 = _q726;
        }
        _c768 = _c767;
      }
      if (!(_c768)) return -1;
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
const _st880 = stamps();
const _st971 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partSums(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartSumsBinding> | null): number {
  const _g848: number[] = [];
  const _g874: number[] = [];
  const _g910: number[] = [];
  const _g925: number[] = [];
  const _g941: number[] = [];
  const _g965: number[] = [];
  const _g992: number[] = [];
  const facts = partSumsFacts;
  let fired = 0;
  let changed = false;
  if (partSumsCands.length < sp.cells.length) partSumsCands = new Int32Array(sp.cells.length);
  const cands = partSumsCands;
  cands.fill(-1);
  const _a846 = union(union(sp.rows, sp.cols), sp.boxes);
  R1:
  for (let _i847 = 0; _i847 < _a846.length; _i847++) {
    const v_u = _a846[_i847];
    const _m227_0 = b.made[0];
    _g848.length = 0;
    G849: {
      const _a861 = cl.cage.parts;
      for (let _i862 = 0; _i862 < _a861.length; _i862++) {
        const v_r = _a861[_i862];
        let _q863 = false;
        Q864: {
          const _a865 = cl.cage.cells[v_r];
          for (let _i866 = 0; _i866 < _a865.length; _i866++) {
            const v_c = _a865[_i866];
            const _h867 = (b.grid[v_c] !== 0);
            if (!(_h867)) {
              _q863 = true;
              break Q864;
            }
          }
        }
        let _c873: boolean = _q863;
        if (_c873) {
          let _q868 = true;
          Q869: {
            const _a870 = cl.cage.cells[v_r];
            for (let _i871 = 0; _i871 < _a870.length; _i871++) {
              const v_c = _a870[_i871];
              const _h872 = (b.grid[v_c] !== 0);
              if (!(!(_h872))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q868 = false;
                break Q869;
              }
            }
          }
          _c873 = _q868;
        }
        if (!(_c873)) continue;
        _g848.push(v_r);
      }
    }
    const v_W = _g848;
    _g874.length = 0;
    _st880.pass++;
    G875: {
      const _a881 = cl.cage.parts;
      for (let _i882 = 0; _i882 < _a881.length; _i882++) {
        const v_r = _a881[_i882];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a883 = cl.cage.cells[v_r];
        for (let _i884 = 0; _i884 < _a883.length; _i884++) {
          const v_c = _a883[_i884];
          const _h885 = (b.grid[v_c] !== 0);
          if (!((!(_h885) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t886 = v_c;
          if (_g874.length < 16) { if (!_g874.includes(_t886)) _g874.push(_t886); } else addOnce(_g874, _st880, _t886);
        }
      }
    }
    L887: {
      const v_L = _g874;
      const _h888 = v_L.length;
      if (!(((_h888 > 1) && (_h888 < sp.w)))) break L887;
      let _g889 = 0;
      G890: {
        for (let _m891 = b.domain; _m891 !== 0; _m891 &= _m891 - 1) {
          const v_d = 31 - Math.clz32(_m891 & -_m891);
          _g889 += v_d;
        }
      }
      let _g892 = 0;
      G893: {
        const _a894 = sp.lineCells[v_u];
        for (let _i895 = 0; _i895 < _a894.length; _i895++) {
          const v_c = _a894[_i895];
          const _h896 = (b.grid[v_c] !== 0);
          if (!(_h896)) continue;
          const _h897 = (b.grid[v_c] || -1);
          _g892 += _h897;
        }
      }
      let _g898 = 0;
      G899: {
        const _a900 = v_W;
        for (let _i901 = 0; _i901 < _a900.length; _i901++) {
          const v_r = _a900[_i901];
          const _h902 = clueAt(cl.total, v_r);
          let _g903 = 0;
          G904: {
            const _a905 = cl.cage.cells[v_r];
            for (let _i906 = 0; _i906 < _a905.length; _i906++) {
              const v_c = _a905[_i906];
              const _h907 = (b.grid[v_c] !== 0);
              if (!(_h907)) continue;
              const _h908 = (b.grid[v_c] || -1);
              _g903 += _h908;
            }
          }
          _g898 += (_h902 - _g903);
        }
      }
      L909: {
        const v_s = ((_g889 - _g892) - _g898);
        if (!((v_s > 0))) break L909;
        _g910.length = 0;
        G911: {
          const _a914 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i915 = 0; _i915 < _a914.length; _i915++) {
            const v_c = _a914[_i915];
            const _h916 = (b.grid[v_c] !== 0);
            if (!((!(_h916) && !(v_L.includes(v_c))))) continue;
            _g910.push(v_c);
          }
        }
        const v_R = _g910;
        const _h929 = union(v_L, v_R);
        const _t917 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h918 = clueAt(cl.total, _t917);
        let _g919 = 0;
        G920: {
          const _a921 = cl.cage.cells[_t917];
          for (let _i922 = 0; _i922 < _a921.length; _i922++) {
            const v_c = _a921[_i922];
            const _h923 = (b.grid[v_c] !== 0);
            if (!(_h923)) continue;
            const _h924 = (b.grid[v_c] || -1);
            _g919 += _h924;
          }
        }
        const v_t = ((_h918 - _g919) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h932 = (v_i === 0);
          _g925.length = 0;
          G926: {
            const _a930 = _h929;
            for (let _i931 = 0; _i931 < _a930.length; _i931++) {
              const v_c = _a930[_i931];
              if (!((_h932 === (v_L.includes(v_c))))) continue;
              _g925.push(v_c);
            }
          }
          const v_K = _g925;
          const _h934 = v_K.length;
          L933: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c940: boolean = (((_h934 > 1) && (_h934 <= 4)) && (v_v !== 0));
            if (_c940) {
              let _c939: boolean = (v_i === 0);
              if (!_c939) {
                let _q935 = true;
                Q936: {
                  const _a937 = v_L;
                  for (let _i938 = 0; _i938 < _a937.length; _i938++) {
                    const v_c = _a937[_i938];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q935 = false;
                      break Q936;
                    }
                  }
                }
                _c939 = _q935;
              }
              _c940 = _c939;
            }
            if (!(_c940)) break L933;
            if (b.made[0] !== _m227_0) {
              _g941.length = 0;
              G942: {
                const _a954 = cl.cage.parts;
                for (let _i955 = 0; _i955 < _a954.length; _i955++) {
                  const v_r = _a954[_i955];
                  let _q956 = false;
                  Q957: {
                    const _a958 = cl.cage.cells[v_r];
                    for (let _i959 = 0; _i959 < _a958.length; _i959++) {
                      const v_c = _a958[_i959];
                      if (!((b.grid[v_c] !== 0))) {
                        _q956 = true;
                        break Q957;
                      }
                    }
                  }
                  let _c964: boolean = _q956;
                  if (_c964) {
                    let _q960 = true;
                    Q961: {
                      const _a962 = cl.cage.cells[v_r];
                      for (let _i963 = 0; _i963 < _a962.length; _i963++) {
                        const v_c = _a962[_i963];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q960 = false;
                          break Q961;
                        }
                      }
                    }
                    _c964 = _q960;
                  }
                  if (!(_c964)) continue;
                  _g941.push(v_r);
                }
              }
              if (!(sameSet(v_W, _g941))) { continue R1; }
              _g965.length = 0;
              _st971.pass++;
              G966: {
                const _a972 = cl.cage.parts;
                for (let _i973 = 0; _i973 < _a972.length; _i973++) {
                  const v_r = _a972[_i973];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a974 = cl.cage.cells[v_r];
                  for (let _i975 = 0; _i975 < _a974.length; _i975++) {
                    const v_c = _a974[_i975];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    const _t976 = v_c;
                    if (_g965.length < 16) { if (!_g965.includes(_t976)) _g965.push(_t976); } else addOnce(_g965, _st971, _t976);
                  }
                }
              }
              if (!(sameSet(v_L, _g965))) { continue R1; }
              let _g977 = 0;
              G978: {
                for (let _m979 = b.domain; _m979 !== 0; _m979 &= _m979 - 1) {
                  const v_d = 31 - Math.clz32(_m979 & -_m979);
                  _g977 += v_d;
                }
              }
              let _g980 = 0;
              G981: {
                const _a982 = sp.lineCells[v_u];
                for (let _i983 = 0; _i983 < _a982.length; _i983++) {
                  const v_c = _a982[_i983];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g980 += (b.grid[v_c] || -1);
                }
              }
              let _g984 = 0;
              G985: {
                const _a986 = v_W;
                for (let _i987 = 0; _i987 < _a986.length; _i987++) {
                  const v_r = _a986[_i987];
                  let _g988 = 0;
                  G989: {
                    const _a990 = cl.cage.cells[v_r];
                    for (let _i991 = 0; _i991 < _a990.length; _i991++) {
                      const v_c = _a990[_i991];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g988 += (b.grid[v_c] || -1);
                    }
                  }
                  _g984 += (clueAt(cl.total, v_r) - _g988);
                }
              }
              if (!((v_s === ((_g977 - _g980) - _g984)))) { continue R1; }
              _g992.length = 0;
              G993: {
                const _a996 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i997 = 0; _i997 < _a996.length; _i997++) {
                  const v_c = _a996[_i997];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g992.push(v_c);
                }
              }
              if (!(sameSet(v_R, _g992))) { continue R1; }
              const _t998 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g999 = 0;
              G1000: {
                const _a1001 = cl.cage.cells[_t998];
                for (let _i1002 = 0; _i1002 < _a1001.length; _i1002++) {
                  const v_c = _a1001[_i1002];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g999 += (b.grid[v_c] || -1);
                }
              }
              if (!((v_t === ((clueAt(cl.total, _t998) - _g999) - v_s)))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g1003: number[] = [];
              G1004: {
                const _a1016 = cl.cage.parts;
                for (let _i1017 = 0; _i1017 < _a1016.length; _i1017++) {
                  const v_r = _a1016[_i1017];
                  let _q1018 = false;
                  Q1019: {
                    const _a1020 = cl.cage.cells[v_r];
                    for (let _i1021 = 0; _i1021 < _a1020.length; _i1021++) {
                      const v_c = _a1020[_i1021];
                      if (!((b.grid[v_c] !== 0))) {
                        _q1018 = true;
                        break Q1019;
                      }
                    }
                  }
                  let _c1026: boolean = _q1018;
                  if (_c1026) {
                    let _q1022 = true;
                    Q1023: {
                      const _a1024 = cl.cage.cells[v_r];
                      for (let _i1025 = 0; _i1025 < _a1024.length; _i1025++) {
                        const v_c = _a1024[_i1025];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q1022 = false;
                          break Q1023;
                        }
                      }
                    }
                    _c1026 = _q1022;
                  }
                  if (!(_c1026)) continue;
                  _g1003.push(v_r);
                }
              }
              const _g1027: number[] = [];
              G1028: {
                const _a1033 = cl.cage.parts;
                for (let _i1034 = 0; _i1034 < _a1033.length; _i1034++) {
                  const v_r = _a1033[_i1034];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a1035 = cl.cage.cells[v_r];
                  for (let _i1036 = 0; _i1036 < _a1035.length; _i1036++) {
                    const v_c = _a1035[_i1036];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    if (!_g1027.includes(v_c)) _g1027.push(v_c);
                  }
                }
              }
              let _g1037 = 0;
              G1038: {
                for (let _m1039 = b.domain; _m1039 !== 0; _m1039 &= _m1039 - 1) {
                  const v_d = 31 - Math.clz32(_m1039 & -_m1039);
                  _g1037 += v_d;
                }
              }
              let _g1040 = 0;
              G1041: {
                const _a1042 = sp.lineCells[v_u];
                for (let _i1043 = 0; _i1043 < _a1042.length; _i1043++) {
                  const v_c = _a1042[_i1043];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g1040 += (b.grid[v_c] || -1);
                }
              }
              let _g1044 = 0;
              G1045: {
                const _a1046 = v_W;
                for (let _i1047 = 0; _i1047 < _a1046.length; _i1047++) {
                  const v_r = _a1046[_i1047];
                  let _g1048 = 0;
                  G1049: {
                    const _a1050 = cl.cage.cells[v_r];
                    for (let _i1051 = 0; _i1051 < _a1050.length; _i1051++) {
                      const v_c = _a1050[_i1051];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g1048 += (b.grid[v_c] || -1);
                    }
                  }
                  _g1044 += (clueAt(cl.total, v_r) - _g1048);
                }
              }
              const _g1052: number[] = [];
              G1053: {
                const _a1056 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i1057 = 0; _i1057 < _a1056.length; _i1057++) {
                  const v_c = _a1056[_i1057];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g1052.push(v_c);
                }
              }
              const _t1058 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g1059 = 0;
              G1060: {
                const _a1061 = cl.cage.cells[_t1058];
                for (let _i1062 = 0; _i1062 < _a1061.length; _i1062++) {
                  const v_c = _a1061[_i1062];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g1059 += (b.grid[v_c] || -1);
                }
              }
              const _g1063: number[] = [];
              G1064: {
                const _a1067 = union(v_L, v_R);
                for (let _i1068 = 0; _i1068 < _a1067.length; _i1068++) {
                  const v_c = _a1067[_i1068];
                  if (!(((v_i === 0) === (v_L.includes(v_c))))) continue;
                  _g1063.push(v_c);
                }
              }
              let _c1074: boolean = (((v_K.length > 1) && (v_K.length <= 4)) && (v_v !== 0));
              if (_c1074) {
                let _c1073: boolean = (v_i === 0);
                if (!_c1073) {
                  let _q1069 = true;
                  Q1070: {
                    const _a1071 = v_L;
                    for (let _i1072 = 0; _i1072 < _a1071.length; _i1072++) {
                      const v_c = _a1071[_i1072];
                      if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                        _q1069 = false;
                        break Q1070;
                      }
                    }
                  }
                  _c1073 = _q1069;
                }
                _c1074 = _c1073;
              }
              freshBinding("partSums", [(union(union(sp.rows, sp.cols), sp.boxes).includes(v_u)), sameSet(v_W, _g1003), sameSet(v_L, _g1027), ((v_L.length > 1) && (v_L.length < sp.w)), (v_s === ((_g1037 - _g1040) - _g1044)), (v_s > 0), sameSet(v_R, _g1052), (v_t === ((clueAt(cl.total, _t1058) - _g1059) - v_s)), ((0 <= v_i) && (v_i <= 1)), sameSet(v_K, _g1063), (v_v === ((v_s * (1 - v_i)) + (v_t * v_i))), _c1074], ["u in", "W =", "L =", "where of L", "s =", "where of s", "R =", "t =", "i in", "K =", "v =", "where of v"]);
            }
            facts.length = 0;
            changed = false;
            let _q1075 = true;
            Q1076: {
              let _g1077 = 0;
              G1078: {
                const _e1094 = valuesOf(b.domain);
                const _n1097 = 1 << _e1094.length;
                for (let _k1095 = _h934 > _e1094.length ? _n1097 : (1 << _h934) - 1; _k1095 < _n1097; _k1095 = _h934 === 0 ? _n1097 : nextOfSize(_k1095)) {
                  let v_T = 0;
                  for (let _j1096 = 0; _j1096 < _e1094.length; _j1096++) if ((_k1095 >> (_e1094.length - 1 - _j1096)) & 1) v_T |= 1 << _e1094[_j1096];
                  const _h1098 = popcount(v_T);
                  let _c1102: boolean = (_h1098 === _h934);
                  if (_c1102) {
                    let _g1099 = 0;
                    G1100: {
                      for (let _m1101 = v_T; _m1101 !== 0; _m1101 &= _m1101 - 1) {
                        const v_e = 31 - Math.clz32(_m1101 & -_m1101);
                        _g1099 += v_e;
                      }
                    }
                    _c1102 = (_g1099 === v_v);
                  }
                  let _c1107: boolean = _c1102;
                  if (_c1107) {
                    let _q1103 = true;
                    Q1104: {
                      const _a1105 = v_K;
                      for (let _i1106 = 0; _i1106 < _a1105.length; _i1106++) {
                        const v_x = _a1105[_i1106];
                        if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                          _q1103 = false;
                          break Q1104;
                        }
                      }
                    }
                    _c1107 = _q1103;
                  }
                  if (!(_c1107)) continue;
                  for (let _m1108 = v_T; _m1108 !== 0; _m1108 &= _m1108 - 1) {
                    const v_d = 31 - Math.clz32(_m1108 & -_m1108);
                    _g1077 |= 1 << v_d;
                  }
                }
              }
              const v_P = _g1077;
              const _h1109 = popcount(v_P);
              let _c1115: boolean = (_h1109 > 0);
              if (_c1115) {
                let _q1110 = true;
                Q1111: {
                  const _a1112 = v_K;
                  for (let _i1113 = 0; _i1113 < _a1112.length; _i1113++) {
                    const v_c = _a1112[_i1113];
                    for (let _m1114 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m1114 !== 0; _m1114 &= _m1114 - 1) {
                      const v_d = 31 - Math.clz32(_m1114 & -_m1114);
                      if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                      if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                      if (!(true)) {
                        _q1110 = false;
                        break Q1111;
                      }
                    }
                  }
                }
                _c1115 = _q1110;
              }
              if (!(_c1115)) {
                _q1075 = false;
                break Q1076;
              }
            }
            if (!(_q1075)) return -1;
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
  const _a1143 = union(union(sp.rows, sp.cols), sp.diagonals);
  for (let _i1144 = 0; _i1144 < _a1143.length; _i1144++) {
    const v_L = _a1143[_i1144];
    const _a1145 = sp.boxes;
    for (let _i1146 = 0; _i1146 < _a1145.length; _i1146++) {
      const v_b = _a1145[_i1146];
      let _q1147 = false;
      Q1148: {
        const _a1149 = sp.lineCells[v_L];
        for (let _i1150 = 0; _i1150 < _a1149.length; _i1150++) {
          const v_c = _a1149[_i1150];
          if ((sp.boxOf[v_c] === v_b)) {
            _q1147 = true;
            break Q1148;
          }
        }
      }
      if (!(_q1147)) continue;
      for (let _m1151 = b.domain; _m1151 !== 0; _m1151 &= _m1151 - 1) {
        const v_d = 31 - Math.clz32(_m1151 & -_m1151);
        let _q1152 = false;
        Q1153: {
          const _a1154 = sp.lineCells[v_L];
          for (let _i1155 = 0; _i1155 < _a1154.length; _i1155++) {
            const v_c = _a1154[_i1155];
            const _h1156 = (b.grid[v_c] || -1);
            if ((_h1156 === v_d)) {
              _q1152 = true;
              break Q1153;
            }
          }
        }
        let _c1162: boolean = !(_q1152);
        if (_c1162) {
          let _q1157 = false;
          Q1158: {
            const _a1159 = sp.lineCells[v_b];
            for (let _i1160 = 0; _i1160 < _a1159.length; _i1160++) {
              const v_c = _a1159[_i1160];
              const _h1161 = (b.grid[v_c] || -1);
              if ((_h1161 === v_d)) {
                _q1157 = true;
                break Q1158;
              }
            }
          }
          _c1162 = !(_q1157);
        }
        if (!(_c1162)) continue;
        let _q1163 = true;
        Q1164: {
          const _a1165 = sp.lineCells[v_L];
          for (let _i1166 = 0; _i1166 < _a1165.length; _i1166++) {
            const v_c = _a1165[_i1166];
            if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
            if (!((sp.boxOf[v_c] === v_b))) {
              _q1163 = false;
              break Q1164;
            }
          }
        }
        let _c1171: boolean = _q1163;
        if (_c1171) {
          let _q1167 = false;
          Q1168: {
            const _a1169 = sp.lineCells[v_b];
            for (let _i1170 = 0; _i1170 < _a1169.length; _i1170++) {
              const v_c = _a1169[_i1170];
              if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                _q1167 = true;
                break Q1168;
              }
            }
          }
          _c1171 = _q1167;
        }
        const v_first = _c1171;
        if (import.meta.env.DEV && staleChecking) {
          let _q1172 = false;
          Q1173: {
            const _a1174 = sp.lineCells[v_L];
            for (let _i1175 = 0; _i1175 < _a1174.length; _i1175++) {
              const v_c = _a1174[_i1175];
              if ((sp.boxOf[v_c] === v_b)) {
                _q1172 = true;
                break Q1173;
              }
            }
          }
          let _q1176 = false;
          Q1177: {
            const _a1178 = sp.lineCells[v_L];
            for (let _i1179 = 0; _i1179 < _a1178.length; _i1179++) {
              const v_c = _a1178[_i1179];
              if (((b.grid[v_c] || -1) === v_d)) {
                _q1176 = true;
                break Q1177;
              }
            }
          }
          let _c1184: boolean = !(_q1176);
          if (_c1184) {
            let _q1180 = false;
            Q1181: {
              const _a1182 = sp.lineCells[v_b];
              for (let _i1183 = 0; _i1183 < _a1182.length; _i1183++) {
                const v_c = _a1182[_i1183];
                if (((b.grid[v_c] || -1) === v_d)) {
                  _q1180 = true;
                  break Q1181;
                }
              }
            }
            _c1184 = !(_q1180);
          }
          let _q1185 = true;
          Q1186: {
            const _a1187 = sp.lineCells[v_L];
            for (let _i1188 = 0; _i1188 < _a1187.length; _i1188++) {
              const v_c = _a1187[_i1188];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              if (!((sp.boxOf[v_c] === v_b))) {
                _q1185 = false;
                break Q1186;
              }
            }
          }
          let _c1193: boolean = _q1185;
          if (_c1193) {
            let _q1189 = false;
            Q1190: {
              const _a1191 = sp.lineCells[v_b];
              for (let _i1192 = 0; _i1192 < _a1191.length; _i1192++) {
                const v_c = _a1191[_i1192];
                if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                  _q1189 = true;
                  break Q1190;
                }
              }
            }
            _c1193 = _q1189;
          }
          freshBinding("intersect", [(union(union(sp.rows, sp.cols), sp.diagonals).includes(v_L)), (sp.boxes.includes(v_b)), _q1172, (((b.domain >> v_d) & 1) !== 0), _c1184, (v_first === _c1193)], ["L in", "b in", "where of b", "d in", "where of d", "first ="]);
        }
        facts.length = 0;
        changed = false;
        let _c1198: boolean = !(v_first);
        if (!_c1198) {
          let _q1194 = true;
          Q1195: {
            const _a1196 = sp.lineCells[v_b];
            for (let _i1197 = 0; _i1197 < _a1196.length; _i1197++) {
              const v_c = _a1196[_i1197];
              if (!((!(sp.lineCells[v_L].includes(v_c)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q1194 = false;
                break Q1195;
              }
            }
          }
          _c1198 = _q1194;
        }
        let _c1209: boolean = _c1198;
        if (_c1209) {
          let _c1208: boolean = v_first;
          if (!_c1208) {
            let _q1199 = true;
            Q1200: {
              const _a1201 = sp.lineCells[v_b];
              for (let _i1202 = 0; _i1202 < _a1201.length; _i1202++) {
                const v_c = _a1201[_i1202];
                if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
                if (!((sp.lineCells[v_L].includes(v_c)))) {
                  _q1199 = false;
                  break Q1200;
                }
              }
            }
            let _c1207: boolean = !(_q1199);
            if (!_c1207) {
              let _q1203 = true;
              Q1204: {
                const _a1205 = sp.lineCells[v_L];
                for (let _i1206 = 0; _i1206 < _a1205.length; _i1206++) {
                  const v_c = _a1205[_i1206];
                  if (!(((sp.boxOf[v_c] !== v_b) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q1203 = false;
                    break Q1204;
                  }
                }
              }
              _c1207 = _q1203;
            }
            _c1208 = _c1207;
          }
          _c1209 = _c1208;
        }
        if (!(_c1209)) return -1;
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
  const _g1251: number[] = [];
  const _g1282: number[] = [];
  const _g1298: number[] = [];
  const facts = digitSetFacts;
  let fired = 0;
  let changed = false;
  const _h1266 = (sp.w - 1);
  const _h1267 = rangeMask(0, _h1266);
  R1:
  for (let _m1250 = b.domain; _m1250 !== 0; _m1250 &= _m1250 - 1) {
    const v_d = 31 - Math.clz32(_m1250 & -_m1250);
    const _m328_0 = b.made[0];
    _g1251.length = 0;
    G1252: {
      const _a1259 = sp.rows;
      for (let _i1260 = 0; _i1260 < _a1259.length; _i1260++) {
        const v_L = _a1259[_i1260];
        let _q1261 = false;
        Q1262: {
          const _a1263 = sp.lineCells[v_L];
          for (let _i1264 = 0; _i1264 < _a1263.length; _i1264++) {
            const v_c = _a1263[_i1264];
            const _h1265 = (b.grid[v_c] || -1);
            if ((_h1265 === v_d)) {
              _q1261 = true;
              break Q1262;
            }
          }
        }
        if (!(!(_q1261))) continue;
        _g1251.push(v_L);
      }
    }
    const v_Y0 = _g1251;
    const _h1280 = v_Y0.length;
    const _h1281 = (_h1280 - 2);
    const _m334_1 = b.made[1];
    let _g1268 = 0;
    G1269: {
      const _a1272 = cellsValued(b, sp.cells, v_d);
      for (let _i1273 = 0; _i1273 < _a1272.length; _i1273++) {
        const v_c = _a1272[_i1273];
        const _h1274 = (b.grid[v_c] || -1);
        if (!((_h1274 === v_d))) continue;
        const _t1275 = (v_c % sp.w);
        _g1268 |= 1 << _t1275;
      }
    }
    const v_X0 = (_h1267 & ~_g1268);
    const _e1276 = valuesOf(v_X0);
    for (let _k1277 = 0; _k1277 < 1 << _e1276.length; _k1277++) {
      let v_T = 0;
      for (let _j1278 = 0; _j1278 < _e1276.length; _j1278++) if ((_k1277 >> (_e1276.length - 1 - _j1278)) & 1) v_T |= 1 << _e1276[_j1278];
      const _h1279 = popcount(v_T);
      if (!(((_h1279 === 0) || ((2 <= _h1279) && (_h1279 <= _h1281))))) continue;
      const _h1369 = (v_X0 & ~v_T);
      _g1282.length = 0;
      G1283: {
        const _a1290 = v_Y0;
        for (let _i1291 = 0; _i1291 < _a1290.length; _i1291++) {
          const v_L = _a1290[_i1291];
          let _q1292 = false;
          Q1293: {
            const _a1294 = sp.lineCells[v_L];
            for (let _i1295 = 0; _i1295 < _a1294.length; _i1295++) {
              const v_c = _a1294[_i1295];
              if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0))) {
                _q1292 = true;
                break Q1293;
              }
            }
          }
          if (!(!(_q1292))) continue;
          _g1282.push(v_L);
        }
      }
      L1296: {
        const v_Y = _g1282;
        const _h1297 = v_Y.length;
        if (!((_h1297 >= (_h1280 - _h1279)))) break L1296;
        if (b.made[0] !== _m328_0 || b.made[1] !== _m334_1) {
          _g1298.length = 0;
          G1299: {
            const _a1306 = sp.rows;
            for (let _i1307 = 0; _i1307 < _a1306.length; _i1307++) {
              const v_L = _a1306[_i1307];
              let _q1308 = false;
              Q1309: {
                const _a1310 = sp.lineCells[v_L];
                for (let _i1311 = 0; _i1311 < _a1310.length; _i1311++) {
                  const v_c = _a1310[_i1311];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q1308 = true;
                    break Q1309;
                  }
                }
              }
              if (!(!(_q1308))) continue;
              _g1298.push(v_L);
            }
          }
          if (!(sameSet(v_Y0, _g1298))) { continue R1; }
          let _g1312 = 0;
          G1313: {
            const _a1316 = cellsValued(b, sp.cells, v_d);
            for (let _i1317 = 0; _i1317 < _a1316.length; _i1317++) {
              const v_c = _a1316[_i1317];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              const _t1318 = (v_c % sp.w);
              _g1312 |= 1 << _t1318;
            }
          }
          if (!((v_X0 === (rangeMask(0, (sp.w - 1)) & ~_g1312)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g1319: number[] = [];
          G1320: {
            const _a1327 = sp.rows;
            for (let _i1328 = 0; _i1328 < _a1327.length; _i1328++) {
              const v_L = _a1327[_i1328];
              let _q1329 = false;
              Q1330: {
                const _a1331 = sp.lineCells[v_L];
                for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
                  const v_c = _a1331[_i1332];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q1329 = true;
                    break Q1330;
                  }
                }
              }
              if (!(!(_q1329))) continue;
              _g1319.push(v_L);
            }
          }
          let _g1333 = 0;
          G1334: {
            const _a1337 = cellsValued(b, sp.cells, v_d);
            for (let _i1338 = 0; _i1338 < _a1337.length; _i1338++) {
              const v_c = _a1337[_i1338];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              const _t1339 = (v_c % sp.w);
              _g1333 |= 1 << _t1339;
            }
          }
          const _g1340: number[] = [];
          G1341: {
            const _a1348 = v_Y0;
            for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
              const v_L = _a1348[_i1349];
              let _q1350 = false;
              Q1351: {
                const _a1352 = sp.lineCells[v_L];
                for (let _i1353 = 0; _i1353 < _a1352.length; _i1353++) {
                  const v_c = _a1352[_i1353];
                  if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0))) {
                    _q1350 = true;
                    break Q1351;
                  }
                }
              }
              if (!(!(_q1350))) continue;
              _g1340.push(v_L);
            }
          }
          freshBinding("digitSet", [(((b.domain >> v_d) & 1) !== 0), sameSet(v_Y0, _g1319), (v_X0 === (rangeMask(0, (sp.w - 1)) & ~_g1333)), ((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (v_Y0.length - 2)))), sameSet(v_Y, _g1340), (v_Y.length >= (v_Y0.length - popcount(v_T)))], ["d in", "Y0 =", "X0 =", "where of T", "Y =", "where of Y"]);
        }
        facts.length = 0;
        changed = false;
        let _c1362: boolean = (_h1279 > 0);
        if (!_c1362) {
          let _q1354 = true;
          Q1355: {
            const _a1356 = sp.rows;
            for (let _i1357 = 0; _i1357 < _a1356.length; _i1357++) {
              const v_L = _a1356[_i1357];
              let _q1358 = false;
              Q1359: {
                const _a1360 = sp.lineCells[v_L];
                for (let _i1361 = 0; _i1361 < _a1360.length; _i1361++) {
                  const v_c = _a1360[_i1361];
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                    _q1358 = true;
                    break Q1359;
                  }
                }
              }
              if (!(_q1358)) {
                _q1354 = false;
                break Q1355;
              }
            }
          }
          _c1362 = _q1354;
        }
        let _c1370: boolean = (_c1362 && (_h1297 === (_h1280 - _h1279)));
        if (_c1370) {
          let _q1363 = true;
          Q1364: {
            const _a1365 = minus(v_Y0, v_Y);
            for (let _i1366 = 0; _i1366 < _a1365.length; _i1366++) {
              const v_L = _a1365[_i1366];
              const _a1367 = sp.lineCells[v_L];
              for (let _i1368 = 0; _i1368 < _a1367.length; _i1368++) {
                const v_c = _a1367[_i1368];
                if (!(((((_h1369 >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q1363 = false;
                  break Q1364;
                }
              }
            }
          }
          _c1370 = _q1363;
        }
        if (!(_c1370)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, Y0: v_Y0.slice(), X0: v_X0, T: v_T, Y: v_Y.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
