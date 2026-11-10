// Compiled by `npm run describe` from src/games/solo/solo.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, cellsValued, clueAt, freshBinding, minus, nextOfSize, popcount, rangeMask, sameSet, staleChecking, stamps, union, valuesOf } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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
  let _q1 = true;
  const _n5 = new Int32Array(32);
  Q2: for (const _u3 of sp.units) {
    _n5.fill(0);
    for (const _c4 of sp.lineCells[_u3]) {
      const _t6 = (g[_c4] || -1);
      if (++_n5[_t6] > 1) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k7 = 0; _k7 < cl.total.at.length; _k7++) {
    const _at8 = cl.total.at[_k7];
    const _v9 = cl.total.v[_k7];
    let _g10 = 0;
    G11: {
      const _a12 = cl.cage.cells[_at8];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_c = _a12[_i13];
        const _h14 = (g[v_c] || -1);
        _g10 += _h14;
      }
    }
    let _c21: boolean = (_g10 === _v9);
    if (_c21) {
      let _g15 = true;
      const _s17: number[] = [];
      G16: {
        const _a18 = cl.cage.cells[_at8];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_c = _a18[_i19];
          const _h20 = (g[v_c] || -1);
          if (_s17.includes(_h20)) {
            _g15 = false;
            break G16;
          }
          _s17.push(_h20);
        }
      }
      _c21 = _g15;
    }
    if (!(_c21)) return false;
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
    const _m55_0 = b.made[0];
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
        if (b.made[0] !== _m55_0) {
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
        if (DEV && staleChecking) {
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
  const _g16: number[] = [];
  const facts = cageSingleFacts;
  let fired = 0;
  let changed = false;
  const _a14 = cl.cage.parts;
  for (let _i15 = 0; _i15 < _a14.length; _i15++) {
    const v_r = _a14[_i15];
    const _h24 = clueAt(cl.total, v_r);
    _g16.length = 0;
    G17: {
      const _a20 = cl.cage.cells[v_r];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g16.push(v_c);
      }
    }
    L22: {
      const v_K = _g16;
      const _h23 = v_K.length;
      if (!((_h23 === 1))) break L22;
      const v_c = (v_K.length > 0 ? v_K[0] : -1);
      let _g25 = 0;
      G26: {
        const _a27 = cl.cage.cells[v_r];
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_c = _a27[_i28];
          if (!((b.grid[v_c] !== 0))) continue;
          _g25 += (b.grid[v_c] || -1);
        }
      }
      const v_t = (_h24 - _g25);
      if (DEV && staleChecking) {
        const _g29: number[] = [];
        G30: {
          const _a33 = cl.cage.cells[v_r];
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g29.push(v_c);
          }
        }
        let _g35 = 0;
        G36: {
          const _a37 = cl.cage.cells[v_r];
          for (let _i38 = 0; _i38 < _a37.length; _i38++) {
            const v_c = _a37[_i38];
            if (!((b.grid[v_c] !== 0))) continue;
            _g35 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("cageSingle", [(cl.cage.parts.includes(v_r)), sameSet(v_K, _g29), (v_K.length === 1), (v_c === (v_K.length > 0 ? v_K[0] : -1)), (v_t === (clueAt(cl.total, v_r) - _g35))], ["r in", "K =", "where of K", "c =", "t ="]);
      }
      facts.length = 0;
      changed = false;
      let _c39: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[v_c] >> v_t) & 1) !== 0));
      if (_c39) {
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_t); changed = true; } else facts.push(PLACE, v_c, v_t); }
        _c39 = true;
      }
      if (!(_c39)) return -1;
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
const regionRule_st96 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function regionRule(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionRuleBinding> | null): number {
  const _g66: number[] = [];
  const _g90: number[] = [];
  const _g120: number[] = [];
  const facts = regionRuleFacts;
  let fired = 0;
  let changed = false;
  const _a64 = union(union(sp.rows, sp.cols), sp.boxes);
  for (let _i65 = 0; _i65 < _a64.length; _i65++) {
    const v_u = _a64[_i65];
    _g66.length = 0;
    G67: {
      const _a79 = cl.cage.parts;
      for (let _i80 = 0; _i80 < _a79.length; _i80++) {
        const v_r = _a79[_i80];
        let _q81 = false;
        Q82: {
          const _a83 = cl.cage.cells[v_r];
          for (let _i84 = 0; _i84 < _a83.length; _i84++) {
            const v_c = _a83[_i84];
            if (!((b.grid[v_c] !== 0))) {
              _q81 = true;
              break Q82;
            }
          }
        }
        let _c89: boolean = _q81;
        if (_c89) {
          let _q85 = true;
          Q86: {
            const _a87 = cl.cage.cells[v_r];
            for (let _i88 = 0; _i88 < _a87.length; _i88++) {
              const v_c = _a87[_i88];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q85 = false;
                break Q86;
              }
            }
          }
          _c89 = _q85;
        }
        if (!(_c89)) continue;
        _g66.push(v_r);
      }
    }
    const v_W = _g66;
    _g90.length = 0;
    regionRule_st96.pass++;
    G91: {
      const _a97 = cl.cage.parts;
      for (let _i98 = 0; _i98 < _a97.length; _i98++) {
        const v_r = _a97[_i98];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a99 = cl.cage.cells[v_r];
        for (let _i100 = 0; _i100 < _a99.length; _i100++) {
          const v_c = _a99[_i100];
          if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t101 = v_c;
          if (_g90.length < 16) { if (!_g90.includes(_t101)) _g90.push(_t101); } else addOnce(_g90, regionRule_st96, _t101);
        }
      }
    }
    L102: {
      const v_L = _g90;
      const _h103 = v_L.length;
      if (!(((_h103 > 0) && (_h103 < sp.w)))) break L102;
      let _g104 = 0;
      G105: {
        for (let _m106 = b.domain; _m106 !== 0; _m106 &= _m106 - 1) {
          const v_d = 31 - Math.clz32(_m106 & -_m106);
          _g104 += v_d;
        }
      }
      let _g107 = 0;
      G108: {
        const _a109 = sp.lineCells[v_u];
        for (let _i110 = 0; _i110 < _a109.length; _i110++) {
          const v_c = _a109[_i110];
          if (!((b.grid[v_c] !== 0))) continue;
          _g107 += (b.grid[v_c] || -1);
        }
      }
      let _g111 = 0;
      G112: {
        const _a113 = v_W;
        for (let _i114 = 0; _i114 < _a113.length; _i114++) {
          const v_r = _a113[_i114];
          const _h115 = clueAt(cl.total, v_r);
          let _g116 = 0;
          G117: {
            const _a118 = cl.cage.cells[v_r];
            for (let _i119 = 0; _i119 < _a118.length; _i119++) {
              const v_c = _a118[_i119];
              if (!((b.grid[v_c] !== 0))) continue;
              _g116 += (b.grid[v_c] || -1);
            }
          }
          _g111 += (_h115 - _g116);
        }
      }
      const v_s = ((_g104 - _g107) - _g111);
      _g120.length = 0;
      G121: {
        const _a124 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
        for (let _i125 = 0; _i125 < _a124.length; _i125++) {
          const v_c = _a124[_i125];
          if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
          _g120.push(v_c);
        }
      }
      const v_R = _g120;
      const _h196 = v_R.length;
      const _t126 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
      const _h127 = clueAt(cl.total, _t126);
      let _g128 = 0;
      G129: {
        const _a130 = cl.cage.cells[_t126];
        for (let _i131 = 0; _i131 < _a130.length; _i131++) {
          const v_c = _a130[_i131];
          if (!((b.grid[v_c] !== 0))) continue;
          _g128 += (b.grid[v_c] || -1);
        }
      }
      const v_t = ((_h127 - _g128) - v_s);
      if (DEV && staleChecking) {
        const _g132: number[] = [];
        G133: {
          const _a145 = cl.cage.parts;
          for (let _i146 = 0; _i146 < _a145.length; _i146++) {
            const v_r = _a145[_i146];
            let _q147 = false;
            Q148: {
              const _a149 = cl.cage.cells[v_r];
              for (let _i150 = 0; _i150 < _a149.length; _i150++) {
                const v_c = _a149[_i150];
                if (!((b.grid[v_c] !== 0))) {
                  _q147 = true;
                  break Q148;
                }
              }
            }
            let _c155: boolean = _q147;
            if (_c155) {
              let _q151 = true;
              Q152: {
                const _a153 = cl.cage.cells[v_r];
                for (let _i154 = 0; _i154 < _a153.length; _i154++) {
                  const v_c = _a153[_i154];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  if (!((sp.lineCells[v_u].includes(v_c)))) {
                    _q151 = false;
                    break Q152;
                  }
                }
              }
              _c155 = _q151;
            }
            if (!(_c155)) continue;
            _g132.push(v_r);
          }
        }
        const _g156: number[] = [];
        G157: {
          const _a162 = cl.cage.parts;
          for (let _i163 = 0; _i163 < _a162.length; _i163++) {
            const v_r = _a162[_i163];
            if (!(!(v_W.includes(v_r)))) continue;
            const _a164 = cl.cage.cells[v_r];
            for (let _i165 = 0; _i165 < _a164.length; _i165++) {
              const v_c = _a164[_i165];
              if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
              if (!_g156.includes(v_c)) _g156.push(v_c);
            }
          }
        }
        let _g166 = 0;
        G167: {
          for (let _m168 = b.domain; _m168 !== 0; _m168 &= _m168 - 1) {
            const v_d = 31 - Math.clz32(_m168 & -_m168);
            _g166 += v_d;
          }
        }
        let _g169 = 0;
        G170: {
          const _a171 = sp.lineCells[v_u];
          for (let _i172 = 0; _i172 < _a171.length; _i172++) {
            const v_c = _a171[_i172];
            if (!((b.grid[v_c] !== 0))) continue;
            _g169 += (b.grid[v_c] || -1);
          }
        }
        let _g173 = 0;
        G174: {
          const _a175 = v_W;
          for (let _i176 = 0; _i176 < _a175.length; _i176++) {
            const v_r = _a175[_i176];
            let _g177 = 0;
            G178: {
              const _a179 = cl.cage.cells[v_r];
              for (let _i180 = 0; _i180 < _a179.length; _i180++) {
                const v_c = _a179[_i180];
                if (!((b.grid[v_c] !== 0))) continue;
                _g177 += (b.grid[v_c] || -1);
              }
            }
            _g173 += (clueAt(cl.total, v_r) - _g177);
          }
        }
        const _g181: number[] = [];
        G182: {
          const _a185 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i186 = 0; _i186 < _a185.length; _i186++) {
            const v_c = _a185[_i186];
            if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
            _g181.push(v_c);
          }
        }
        const _t187 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        let _g188 = 0;
        G189: {
          const _a190 = cl.cage.cells[_t187];
          for (let _i191 = 0; _i191 < _a190.length; _i191++) {
            const v_c = _a190[_i191];
            if (!((b.grid[v_c] !== 0))) continue;
            _g188 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("regionRule", [(union(union(sp.rows, sp.cols), sp.boxes).includes(v_u)), sameSet(v_W, _g132), sameSet(v_L, _g156), ((v_L.length > 0) && (v_L.length < sp.w)), (v_s === ((_g166 - _g169) - _g173)), sameSet(v_R, _g181), (v_t === ((clueAt(cl.total, _t187) - _g188) - v_s))], ["u in", "W =", "L =", "where of L", "s =", "R =", "t ="]);
      }
      facts.length = 0;
      changed = false;
      let _c195: boolean = (v_s > 0);
      if (_c195) {
        let _c194: boolean = (_h103 !== 1);
        if (!_c194) {
          let _c193: boolean = ((v_s <= sp.w) && (((b.cands[(v_L.length > 0 ? v_L[0] : -1)] >> v_s) & 1) !== 0));
          if (_c193) {
            const _t192 = (v_L.length > 0 ? v_L[0] : -1);
            if (!(b.grid[_t192] !== 0)) { if (fire === null) { b.placeAt(_t192, v_s); changed = true; } else facts.push(PLACE, _t192, v_s); }
            _c193 = true;
          }
          _c194 = _c193;
        }
        _c195 = _c194;
      }
      let _c205: boolean = _c195;
      if (_c205) {
        let _c201: boolean = ((_h103 === 1) || (_h196 !== 1));
        if (!_c201) {
          let _q197 = false;
          Q198: {
            const _a199 = v_L;
            for (let _i200 = 0; _i200 < _a199.length; _i200++) {
              const v_c = _a199[_i200];
              if ((cl.cage.of[v_c] !== cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)])) {
                _q197 = true;
                break Q198;
              }
            }
          }
          _c201 = _q197;
        }
        let _c204: boolean = _c201;
        if (!_c204) {
          let _c203: boolean = (((v_t >= 1) && (v_t <= sp.w)) && (((b.cands[(v_R.length > 0 ? v_R[0] : -1)] >> v_t) & 1) !== 0));
          if (_c203) {
            const _t202 = (v_R.length > 0 ? v_R[0] : -1);
            if (!(b.grid[_t202] !== 0)) { if (fire === null) { b.placeAt(_t202, v_t); changed = true; } else facts.push(PLACE, _t202, v_t); }
            _c203 = true;
          }
          _c204 = _c203;
        }
        _c205 = _c204;
      }
      if (!(_c205)) return -1;
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
  const _g16: number[] = [];
  const facts = cageMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (cageMinMaxCands.length < sp.cells.length) cageMinMaxCands = new Int32Array(sp.cells.length);
  const cands = cageMinMaxCands;
  cands.fill(-1);
  const _a14 = cl.cage.parts;
  for (let _i15 = 0; _i15 < _a14.length; _i15++) {
    const v_r = _a14[_i15];
    const _h23 = clueAt(cl.total, v_r);
    _g16.length = 0;
    G17: {
      const _a20 = cl.cage.cells[v_r];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        const _h22 = (b.grid[v_c] !== 0);
        if (!(!(_h22))) continue;
        _g16.push(v_c);
      }
    }
    const v_K = _g16;
    let _g24 = 0;
    G25: {
      const _a26 = cl.cage.cells[v_r];
      for (let _i27 = 0; _i27 < _a26.length; _i27++) {
        const v_c = _a26[_i27];
        const _h28 = (b.grid[v_c] !== 0);
        if (!(_h28)) continue;
        const _h29 = (b.grid[v_c] || -1);
        _g24 += _h29;
      }
    }
    L30: {
      const v_t = (_h23 - _g24);
      if (!((v_t !== 0))) break L30;
      if (DEV && staleChecking) {
        const _g31: number[] = [];
        G32: {
          const _a35 = cl.cage.cells[v_r];
          for (let _i36 = 0; _i36 < _a35.length; _i36++) {
            const v_c = _a35[_i36];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g31.push(v_c);
          }
        }
        let _g37 = 0;
        G38: {
          const _a39 = cl.cage.cells[v_r];
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_c = _a39[_i40];
            if (!((b.grid[v_c] !== 0))) continue;
            _g37 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("cageMinMax", [(cl.cage.parts.includes(v_r)), sameSet(v_K, _g31), (v_t === (clueAt(cl.total, v_r) - _g37)), (v_t !== 0)], ["r in", "K =", "t =", "where of t"]);
      }
      facts.length = 0;
      changed = false;
      let _q41 = true;
      Q42: {
        const _a43 = v_K;
        for (let _i44 = 0; _i44 < _a43.length; _i44++) {
          const v_c = _a43[_i44];
          for (let _m45 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m45 !== 0; _m45 &= _m45 - 1) {
            const v_d = 31 - Math.clz32(_m45 & -_m45);
            let _g46 = 0;
            G47: {
              const _a48 = v_K;
              for (let _i49 = 0; _i49 < _a48.length; _i49++) {
                const v_x = _a48[_i49];
                if (!((v_x !== v_c))) continue;
                let _g50 = -1;
                G51: {
                  for (let _m52 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m52 !== 0; _m52 &= _m52 - 1) {
                    const v_e = 31 - Math.clz32(_m52 & -_m52);
                    if (_g50 === -1 || v_e > _g50) _g50 = v_e;
                  }
                }
                _g46 += _g50;
              }
            }
            let _c60: boolean = ((v_d + _g46) < v_t);
            if (!_c60) {
              let _g53 = 0;
              G54: {
                const _a55 = v_K;
                for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                  const v_x = _a55[_i56];
                  if (!((v_x !== v_c))) continue;
                  let _g57 = -1;
                  G58: {
                    for (let _m59 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m59 !== 0; _m59 &= _m59 - 1) {
                      const v_e = 31 - Math.clz32(_m59 & -_m59);
                      if (_g57 === -1 || v_e < _g57) _g57 = v_e;
                    }
                  }
                  _g53 += _g57;
                }
              }
              _c60 = ((v_d + _g53) > v_t);
            }
            if (!(_c60)) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q41 = false;
              break Q42;
            }
          }
        }
      }
      if (!(_q41)) return -1;
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
const partMinMax_st112 = stamps();
const partMinMax_st203 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partMinMax(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartMinMaxBinding> | null): number {
  const _g80: number[] = [];
  const _g106: number[] = [];
  const _g142: number[] = [];
  const _g157: number[] = [];
  const _g173: number[] = [];
  const _g197: number[] = [];
  const _g224: number[] = [];
  const facts = partMinMaxFacts;
  let fired = 0;
  let changed = false;
  if (partMinMaxCands.length < sp.cells.length) partMinMaxCands = new Int32Array(sp.cells.length);
  const cands = partMinMaxCands;
  cands.fill(-1);
  const _a78 = union(union(sp.rows, sp.cols), sp.boxes);
  R1:
  for (let _i79 = 0; _i79 < _a78.length; _i79++) {
    const v_u = _a78[_i79];
    const _m327_0 = b.made[0];
    _g80.length = 0;
    G81: {
      const _a93 = cl.cage.parts;
      for (let _i94 = 0; _i94 < _a93.length; _i94++) {
        const v_r = _a93[_i94];
        let _q95 = false;
        Q96: {
          const _a97 = cl.cage.cells[v_r];
          for (let _i98 = 0; _i98 < _a97.length; _i98++) {
            const v_c = _a97[_i98];
            const _h99 = (b.grid[v_c] !== 0);
            if (!(_h99)) {
              _q95 = true;
              break Q96;
            }
          }
        }
        let _c105: boolean = _q95;
        if (_c105) {
          let _q100 = true;
          Q101: {
            const _a102 = cl.cage.cells[v_r];
            for (let _i103 = 0; _i103 < _a102.length; _i103++) {
              const v_c = _a102[_i103];
              const _h104 = (b.grid[v_c] !== 0);
              if (!(!(_h104))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q100 = false;
                break Q101;
              }
            }
          }
          _c105 = _q100;
        }
        if (!(_c105)) continue;
        _g80.push(v_r);
      }
    }
    const v_W = _g80;
    _g106.length = 0;
    partMinMax_st112.pass++;
    G107: {
      const _a113 = cl.cage.parts;
      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
        const v_r = _a113[_i114];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a115 = cl.cage.cells[v_r];
        for (let _i116 = 0; _i116 < _a115.length; _i116++) {
          const v_c = _a115[_i116];
          const _h117 = (b.grid[v_c] !== 0);
          if (!((!(_h117) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t118 = v_c;
          if (_g106.length < 16) { if (!_g106.includes(_t118)) _g106.push(_t118); } else addOnce(_g106, partMinMax_st112, _t118);
        }
      }
    }
    L119: {
      const v_L = _g106;
      const _h120 = v_L.length;
      if (!(((_h120 > 1) && (_h120 < sp.w)))) break L119;
      let _g121 = 0;
      G122: {
        for (let _m123 = b.domain; _m123 !== 0; _m123 &= _m123 - 1) {
          const v_d = 31 - Math.clz32(_m123 & -_m123);
          _g121 += v_d;
        }
      }
      let _g124 = 0;
      G125: {
        const _a126 = sp.lineCells[v_u];
        for (let _i127 = 0; _i127 < _a126.length; _i127++) {
          const v_c = _a126[_i127];
          const _h128 = (b.grid[v_c] !== 0);
          if (!(_h128)) continue;
          const _h129 = (b.grid[v_c] || -1);
          _g124 += _h129;
        }
      }
      let _g130 = 0;
      G131: {
        const _a132 = v_W;
        for (let _i133 = 0; _i133 < _a132.length; _i133++) {
          const v_r = _a132[_i133];
          const _h134 = clueAt(cl.total, v_r);
          let _g135 = 0;
          G136: {
            const _a137 = cl.cage.cells[v_r];
            for (let _i138 = 0; _i138 < _a137.length; _i138++) {
              const v_c = _a137[_i138];
              const _h139 = (b.grid[v_c] !== 0);
              if (!(_h139)) continue;
              const _h140 = (b.grid[v_c] || -1);
              _g135 += _h140;
            }
          }
          _g130 += (_h134 - _g135);
        }
      }
      L141: {
        const v_s = ((_g121 - _g124) - _g130);
        if (!((v_s > 0))) break L141;
        _g142.length = 0;
        G143: {
          const _a146 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_c = _a146[_i147];
            const _h148 = (b.grid[v_c] !== 0);
            if (!((!(_h148) && !(v_L.includes(v_c))))) continue;
            _g142.push(v_c);
          }
        }
        const v_R = _g142;
        const _h161 = union(v_L, v_R);
        const _t149 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h150 = clueAt(cl.total, _t149);
        let _g151 = 0;
        G152: {
          const _a153 = cl.cage.cells[_t149];
          for (let _i154 = 0; _i154 < _a153.length; _i154++) {
            const v_c = _a153[_i154];
            const _h155 = (b.grid[v_c] !== 0);
            if (!(_h155)) continue;
            const _h156 = (b.grid[v_c] || -1);
            _g151 += _h156;
          }
        }
        const v_t = ((_h150 - _g151) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h164 = (v_i === 0);
          _g157.length = 0;
          G158: {
            const _a162 = _h161;
            for (let _i163 = 0; _i163 < _a162.length; _i163++) {
              const v_c = _a162[_i163];
              if (!((_h164 === (v_L.includes(v_c))))) continue;
              _g157.push(v_c);
            }
          }
          const v_K = _g157;
          const _h166 = v_K.length;
          L165: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c172: boolean = ((_h166 > 1) && (v_v !== 0));
            if (_c172) {
              let _c171: boolean = (v_i === 0);
              if (!_c171) {
                let _q167 = true;
                Q168: {
                  const _a169 = v_L;
                  for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                    const v_c = _a169[_i170];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q167 = false;
                      break Q168;
                    }
                  }
                }
                _c171 = _q167;
              }
              _c172 = _c171;
            }
            if (!(_c172)) break L165;
            if (b.made[0] !== _m327_0) {
              _g173.length = 0;
              G174: {
                const _a186 = cl.cage.parts;
                for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                  const v_r = _a186[_i187];
                  let _q188 = false;
                  Q189: {
                    const _a190 = cl.cage.cells[v_r];
                    for (let _i191 = 0; _i191 < _a190.length; _i191++) {
                      const v_c = _a190[_i191];
                      if (!((b.grid[v_c] !== 0))) {
                        _q188 = true;
                        break Q189;
                      }
                    }
                  }
                  let _c196: boolean = _q188;
                  if (_c196) {
                    let _q192 = true;
                    Q193: {
                      const _a194 = cl.cage.cells[v_r];
                      for (let _i195 = 0; _i195 < _a194.length; _i195++) {
                        const v_c = _a194[_i195];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q192 = false;
                          break Q193;
                        }
                      }
                    }
                    _c196 = _q192;
                  }
                  if (!(_c196)) continue;
                  _g173.push(v_r);
                }
              }
              if (!(sameSet(v_W, _g173))) { continue R1; }
              _g197.length = 0;
              partMinMax_st203.pass++;
              G198: {
                const _a204 = cl.cage.parts;
                for (let _i205 = 0; _i205 < _a204.length; _i205++) {
                  const v_r = _a204[_i205];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a206 = cl.cage.cells[v_r];
                  for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                    const v_c = _a206[_i207];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    const _t208 = v_c;
                    if (_g197.length < 16) { if (!_g197.includes(_t208)) _g197.push(_t208); } else addOnce(_g197, partMinMax_st203, _t208);
                  }
                }
              }
              if (!(sameSet(v_L, _g197))) { continue R1; }
              let _g209 = 0;
              G210: {
                for (let _m211 = b.domain; _m211 !== 0; _m211 &= _m211 - 1) {
                  const v_d = 31 - Math.clz32(_m211 & -_m211);
                  _g209 += v_d;
                }
              }
              let _g212 = 0;
              G213: {
                const _a214 = sp.lineCells[v_u];
                for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                  const v_c = _a214[_i215];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g212 += (b.grid[v_c] || -1);
                }
              }
              let _g216 = 0;
              G217: {
                const _a218 = v_W;
                for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                  const v_r = _a218[_i219];
                  let _g220 = 0;
                  G221: {
                    const _a222 = cl.cage.cells[v_r];
                    for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                      const v_c = _a222[_i223];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g220 += (b.grid[v_c] || -1);
                    }
                  }
                  _g216 += (clueAt(cl.total, v_r) - _g220);
                }
              }
              if (!((v_s === ((_g209 - _g212) - _g216)))) { continue R1; }
              _g224.length = 0;
              G225: {
                const _a228 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i229 = 0; _i229 < _a228.length; _i229++) {
                  const v_c = _a228[_i229];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g224.push(v_c);
                }
              }
              if (!(sameSet(v_R, _g224))) { continue R1; }
              const _t230 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g231 = 0;
              G232: {
                const _a233 = cl.cage.cells[_t230];
                for (let _i234 = 0; _i234 < _a233.length; _i234++) {
                  const v_c = _a233[_i234];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g231 += (b.grid[v_c] || -1);
                }
              }
              if (!((v_t === ((clueAt(cl.total, _t230) - _g231) - v_s)))) { continue R1; }
            }
            if (DEV && staleChecking) {
              const _g235: number[] = [];
              G236: {
                const _a248 = cl.cage.parts;
                for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                  const v_r = _a248[_i249];
                  let _q250 = false;
                  Q251: {
                    const _a252 = cl.cage.cells[v_r];
                    for (let _i253 = 0; _i253 < _a252.length; _i253++) {
                      const v_c = _a252[_i253];
                      if (!((b.grid[v_c] !== 0))) {
                        _q250 = true;
                        break Q251;
                      }
                    }
                  }
                  let _c258: boolean = _q250;
                  if (_c258) {
                    let _q254 = true;
                    Q255: {
                      const _a256 = cl.cage.cells[v_r];
                      for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                        const v_c = _a256[_i257];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q254 = false;
                          break Q255;
                        }
                      }
                    }
                    _c258 = _q254;
                  }
                  if (!(_c258)) continue;
                  _g235.push(v_r);
                }
              }
              const _g259: number[] = [];
              G260: {
                const _a265 = cl.cage.parts;
                for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                  const v_r = _a265[_i266];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a267 = cl.cage.cells[v_r];
                  for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                    const v_c = _a267[_i268];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    if (!_g259.includes(v_c)) _g259.push(v_c);
                  }
                }
              }
              let _g269 = 0;
              G270: {
                for (let _m271 = b.domain; _m271 !== 0; _m271 &= _m271 - 1) {
                  const v_d = 31 - Math.clz32(_m271 & -_m271);
                  _g269 += v_d;
                }
              }
              let _g272 = 0;
              G273: {
                const _a274 = sp.lineCells[v_u];
                for (let _i275 = 0; _i275 < _a274.length; _i275++) {
                  const v_c = _a274[_i275];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g272 += (b.grid[v_c] || -1);
                }
              }
              let _g276 = 0;
              G277: {
                const _a278 = v_W;
                for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                  const v_r = _a278[_i279];
                  let _g280 = 0;
                  G281: {
                    const _a282 = cl.cage.cells[v_r];
                    for (let _i283 = 0; _i283 < _a282.length; _i283++) {
                      const v_c = _a282[_i283];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g280 += (b.grid[v_c] || -1);
                    }
                  }
                  _g276 += (clueAt(cl.total, v_r) - _g280);
                }
              }
              const _g284: number[] = [];
              G285: {
                const _a288 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i289 = 0; _i289 < _a288.length; _i289++) {
                  const v_c = _a288[_i289];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g284.push(v_c);
                }
              }
              const _t290 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g291 = 0;
              G292: {
                const _a293 = cl.cage.cells[_t290];
                for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                  const v_c = _a293[_i294];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g291 += (b.grid[v_c] || -1);
                }
              }
              const _g295: number[] = [];
              G296: {
                const _a299 = union(v_L, v_R);
                for (let _i300 = 0; _i300 < _a299.length; _i300++) {
                  const v_c = _a299[_i300];
                  if (!(((v_i === 0) === (v_L.includes(v_c))))) continue;
                  _g295.push(v_c);
                }
              }
              let _c306: boolean = ((v_K.length > 1) && (v_v !== 0));
              if (_c306) {
                let _c305: boolean = (v_i === 0);
                if (!_c305) {
                  let _q301 = true;
                  Q302: {
                    const _a303 = v_L;
                    for (let _i304 = 0; _i304 < _a303.length; _i304++) {
                      const v_c = _a303[_i304];
                      if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                        _q301 = false;
                        break Q302;
                      }
                    }
                  }
                  _c305 = _q301;
                }
                _c306 = _c305;
              }
              freshBinding("partMinMax", [(union(union(sp.rows, sp.cols), sp.boxes).includes(v_u)), sameSet(v_W, _g235), sameSet(v_L, _g259), ((v_L.length > 1) && (v_L.length < sp.w)), (v_s === ((_g269 - _g272) - _g276)), (v_s > 0), sameSet(v_R, _g284), (v_t === ((clueAt(cl.total, _t290) - _g291) - v_s)), ((0 <= v_i) && (v_i <= 1)), sameSet(v_K, _g295), (v_v === ((v_s * (1 - v_i)) + (v_t * v_i))), _c306], ["u in", "W =", "L =", "where of L", "s =", "where of s", "R =", "t =", "i in", "K =", "v =", "where of v"]);
            }
            facts.length = 0;
            changed = false;
            let _q307 = true;
            Q308: {
              const _a309 = v_K;
              for (let _i310 = 0; _i310 < _a309.length; _i310++) {
                const v_c = _a309[_i310];
                for (let _m311 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m311 !== 0; _m311 &= _m311 - 1) {
                  const v_d = 31 - Math.clz32(_m311 & -_m311);
                  let _g312 = 0;
                  G313: {
                    const _a314 = v_K;
                    for (let _i315 = 0; _i315 < _a314.length; _i315++) {
                      const v_x = _a314[_i315];
                      if (!((v_x !== v_c))) continue;
                      let _g316 = -1;
                      G317: {
                        for (let _m318 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m318 !== 0; _m318 &= _m318 - 1) {
                          const v_e = 31 - Math.clz32(_m318 & -_m318);
                          if (_g316 === -1 || v_e > _g316) _g316 = v_e;
                        }
                      }
                      _g312 += _g316;
                    }
                  }
                  let _c326: boolean = ((v_d + _g312) < v_v);
                  if (!_c326) {
                    let _g319 = 0;
                    G320: {
                      const _a321 = v_K;
                      for (let _i322 = 0; _i322 < _a321.length; _i322++) {
                        const v_x = _a321[_i322];
                        if (!((v_x !== v_c))) continue;
                        let _g323 = -1;
                        G324: {
                          for (let _m325 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m325 !== 0; _m325 &= _m325 - 1) {
                            const v_e = 31 - Math.clz32(_m325 & -_m325);
                            if (_g323 === -1 || v_e < _g323) _g323 = v_e;
                          }
                        }
                        _g319 += _g323;
                      }
                    }
                    _c326 = ((v_d + _g319) > v_v);
                  }
                  if (!(_c326)) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q307 = false;
                    break Q308;
                  }
                }
              }
            }
            if (!(_q307)) return -1;
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
  const _g16: number[] = [];
  const facts = cageSumsFacts;
  let fired = 0;
  let changed = false;
  if (cageSumsCands.length < sp.cells.length) cageSumsCands = new Int32Array(sp.cells.length);
  const cands = cageSumsCands;
  cands.fill(-1);
  const _a14 = cl.cage.parts;
  for (let _i15 = 0; _i15 < _a14.length; _i15++) {
    const v_r = _a14[_i15];
    const _h23 = clueAt(cl.total, v_r);
    _g16.length = 0;
    G17: {
      const _a20 = cl.cage.cells[v_r];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        const _h22 = (b.grid[v_c] !== 0);
        if (!(!(_h22))) continue;
        _g16.push(v_c);
      }
    }
    const v_K = _g16;
    const _h41 = v_K.length;
    let _g24 = 0;
    G25: {
      const _a26 = cl.cage.cells[v_r];
      for (let _i27 = 0; _i27 < _a26.length; _i27++) {
        const v_c = _a26[_i27];
        const _h28 = (b.grid[v_c] !== 0);
        if (!(_h28)) continue;
        const _h29 = (b.grid[v_c] || -1);
        _g24 += _h29;
      }
    }
    L30: {
      const v_t = (_h23 - _g24);
      if (!((v_t !== 0))) break L30;
      if (DEV && staleChecking) {
        const _g31: number[] = [];
        G32: {
          const _a35 = cl.cage.cells[v_r];
          for (let _i36 = 0; _i36 < _a35.length; _i36++) {
            const v_c = _a35[_i36];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g31.push(v_c);
          }
        }
        let _g37 = 0;
        G38: {
          const _a39 = cl.cage.cells[v_r];
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_c = _a39[_i40];
            if (!((b.grid[v_c] !== 0))) continue;
            _g37 += (b.grid[v_c] || -1);
          }
        }
        freshBinding("cageSums", [(cl.cage.parts.includes(v_r)), sameSet(v_K, _g31), (v_t === (clueAt(cl.total, v_r) - _g37)), (v_t !== 0)], ["r in", "K =", "t =", "where of t"]);
      }
      facts.length = 0;
      changed = false;
      let _c84: boolean = (_h41 > 0);
      if (_c84) {
        let _c83: boolean = ((_h41 < 2) || (_h41 > 4));
        if (!_c83) {
          let _q42 = true;
          Q43: {
            let _g44 = 0;
            G45: {
              const _e61 = valuesOf(b.domain);
              const _n64 = 1 << _e61.length;
              for (let _k62 = _h41 > _e61.length ? _n64 : (1 << _h41) - 1; _k62 < _n64; _k62 = _h41 === 0 ? _n64 : nextOfSize(_k62)) {
                let v_T = 0;
                for (let _j63 = 0; _j63 < _e61.length; _j63++) if ((_k62 >> (_e61.length - 1 - _j63)) & 1) v_T |= 1 << _e61[_j63];
                const _h65 = popcount(v_T);
                let _c69: boolean = (_h65 === _h41);
                if (_c69) {
                  let _g66 = 0;
                  G67: {
                    for (let _m68 = v_T; _m68 !== 0; _m68 &= _m68 - 1) {
                      const v_e = 31 - Math.clz32(_m68 & -_m68);
                      _g66 += v_e;
                    }
                  }
                  _c69 = (_g66 === v_t);
                }
                let _c74: boolean = _c69;
                if (_c74) {
                  let _q70 = true;
                  Q71: {
                    const _a72 = v_K;
                    for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                      const v_x = _a72[_i73];
                      if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                        _q70 = false;
                        break Q71;
                      }
                    }
                  }
                  _c74 = _q70;
                }
                if (!(_c74)) continue;
                for (let _m75 = v_T; _m75 !== 0; _m75 &= _m75 - 1) {
                  const v_d = 31 - Math.clz32(_m75 & -_m75);
                  _g44 |= 1 << v_d;
                }
              }
            }
            const v_P = _g44;
            const _h76 = popcount(v_P);
            let _c82: boolean = (_h76 > 0);
            if (_c82) {
              let _q77 = true;
              Q78: {
                const _a79 = v_K;
                for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                  const v_c = _a79[_i80];
                  for (let _m81 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m81 !== 0; _m81 &= _m81 - 1) {
                    const v_d = 31 - Math.clz32(_m81 & -_m81);
                    if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                    if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                    if (!(true)) {
                      _q77 = false;
                      break Q78;
                    }
                  }
                }
              }
              _c82 = _q77;
            }
            if (!(_c82)) {
              _q42 = false;
              break Q43;
            }
          }
          _c83 = _q42;
        }
        _c84 = _c83;
      }
      if (!(_c84)) return -1;
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
const partSums_st112 = stamps();
const partSums_st203 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function partSums(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PartSumsBinding> | null): number {
  const _g80: number[] = [];
  const _g106: number[] = [];
  const _g142: number[] = [];
  const _g157: number[] = [];
  const _g173: number[] = [];
  const _g197: number[] = [];
  const _g224: number[] = [];
  const facts = partSumsFacts;
  let fired = 0;
  let changed = false;
  if (partSumsCands.length < sp.cells.length) partSumsCands = new Int32Array(sp.cells.length);
  const cands = partSumsCands;
  cands.fill(-1);
  const _a78 = union(union(sp.rows, sp.cols), sp.boxes);
  R1:
  for (let _i79 = 0; _i79 < _a78.length; _i79++) {
    const v_u = _a78[_i79];
    const _m348_0 = b.made[0];
    _g80.length = 0;
    G81: {
      const _a93 = cl.cage.parts;
      for (let _i94 = 0; _i94 < _a93.length; _i94++) {
        const v_r = _a93[_i94];
        let _q95 = false;
        Q96: {
          const _a97 = cl.cage.cells[v_r];
          for (let _i98 = 0; _i98 < _a97.length; _i98++) {
            const v_c = _a97[_i98];
            const _h99 = (b.grid[v_c] !== 0);
            if (!(_h99)) {
              _q95 = true;
              break Q96;
            }
          }
        }
        let _c105: boolean = _q95;
        if (_c105) {
          let _q100 = true;
          Q101: {
            const _a102 = cl.cage.cells[v_r];
            for (let _i103 = 0; _i103 < _a102.length; _i103++) {
              const v_c = _a102[_i103];
              const _h104 = (b.grid[v_c] !== 0);
              if (!(!(_h104))) continue;
              if (!((sp.lineCells[v_u].includes(v_c)))) {
                _q100 = false;
                break Q101;
              }
            }
          }
          _c105 = _q100;
        }
        if (!(_c105)) continue;
        _g80.push(v_r);
      }
    }
    const v_W = _g80;
    _g106.length = 0;
    partSums_st112.pass++;
    G107: {
      const _a113 = cl.cage.parts;
      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
        const v_r = _a113[_i114];
        if (!(!(v_W.includes(v_r)))) continue;
        const _a115 = cl.cage.cells[v_r];
        for (let _i116 = 0; _i116 < _a115.length; _i116++) {
          const v_c = _a115[_i116];
          const _h117 = (b.grid[v_c] !== 0);
          if (!((!(_h117) && (sp.lineCells[v_u].includes(v_c))))) continue;
          const _t118 = v_c;
          if (_g106.length < 16) { if (!_g106.includes(_t118)) _g106.push(_t118); } else addOnce(_g106, partSums_st112, _t118);
        }
      }
    }
    L119: {
      const v_L = _g106;
      const _h120 = v_L.length;
      if (!(((_h120 > 1) && (_h120 < sp.w)))) break L119;
      let _g121 = 0;
      G122: {
        for (let _m123 = b.domain; _m123 !== 0; _m123 &= _m123 - 1) {
          const v_d = 31 - Math.clz32(_m123 & -_m123);
          _g121 += v_d;
        }
      }
      let _g124 = 0;
      G125: {
        const _a126 = sp.lineCells[v_u];
        for (let _i127 = 0; _i127 < _a126.length; _i127++) {
          const v_c = _a126[_i127];
          const _h128 = (b.grid[v_c] !== 0);
          if (!(_h128)) continue;
          const _h129 = (b.grid[v_c] || -1);
          _g124 += _h129;
        }
      }
      let _g130 = 0;
      G131: {
        const _a132 = v_W;
        for (let _i133 = 0; _i133 < _a132.length; _i133++) {
          const v_r = _a132[_i133];
          const _h134 = clueAt(cl.total, v_r);
          let _g135 = 0;
          G136: {
            const _a137 = cl.cage.cells[v_r];
            for (let _i138 = 0; _i138 < _a137.length; _i138++) {
              const v_c = _a137[_i138];
              const _h139 = (b.grid[v_c] !== 0);
              if (!(_h139)) continue;
              const _h140 = (b.grid[v_c] || -1);
              _g135 += _h140;
            }
          }
          _g130 += (_h134 - _g135);
        }
      }
      L141: {
        const v_s = ((_g121 - _g124) - _g130);
        if (!((v_s > 0))) break L141;
        _g142.length = 0;
        G143: {
          const _a146 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_c = _a146[_i147];
            const _h148 = (b.grid[v_c] !== 0);
            if (!((!(_h148) && !(v_L.includes(v_c))))) continue;
            _g142.push(v_c);
          }
        }
        const v_R = _g142;
        const _h161 = union(v_L, v_R);
        const _t149 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
        const _h150 = clueAt(cl.total, _t149);
        let _g151 = 0;
        G152: {
          const _a153 = cl.cage.cells[_t149];
          for (let _i154 = 0; _i154 < _a153.length; _i154++) {
            const v_c = _a153[_i154];
            const _h155 = (b.grid[v_c] !== 0);
            if (!(_h155)) continue;
            const _h156 = (b.grid[v_c] || -1);
            _g151 += _h156;
          }
        }
        const v_t = ((_h150 - _g151) - v_s);
        for (let v_i = 0; v_i <= 1; v_i++) {
          const _h164 = (v_i === 0);
          _g157.length = 0;
          G158: {
            const _a162 = _h161;
            for (let _i163 = 0; _i163 < _a162.length; _i163++) {
              const v_c = _a162[_i163];
              if (!((_h164 === (v_L.includes(v_c))))) continue;
              _g157.push(v_c);
            }
          }
          const v_K = _g157;
          const _h166 = v_K.length;
          L165: {
            const v_v = ((v_s * (1 - v_i)) + (v_t * v_i));
            let _c172: boolean = (((_h166 > 1) && (_h166 <= 4)) && (v_v !== 0));
            if (_c172) {
              let _c171: boolean = (v_i === 0);
              if (!_c171) {
                let _q167 = true;
                Q168: {
                  const _a169 = v_L;
                  for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                    const v_c = _a169[_i170];
                    if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                      _q167 = false;
                      break Q168;
                    }
                  }
                }
                _c171 = _q167;
              }
              _c172 = _c171;
            }
            if (!(_c172)) break L165;
            if (b.made[0] !== _m348_0) {
              _g173.length = 0;
              G174: {
                const _a186 = cl.cage.parts;
                for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                  const v_r = _a186[_i187];
                  let _q188 = false;
                  Q189: {
                    const _a190 = cl.cage.cells[v_r];
                    for (let _i191 = 0; _i191 < _a190.length; _i191++) {
                      const v_c = _a190[_i191];
                      if (!((b.grid[v_c] !== 0))) {
                        _q188 = true;
                        break Q189;
                      }
                    }
                  }
                  let _c196: boolean = _q188;
                  if (_c196) {
                    let _q192 = true;
                    Q193: {
                      const _a194 = cl.cage.cells[v_r];
                      for (let _i195 = 0; _i195 < _a194.length; _i195++) {
                        const v_c = _a194[_i195];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q192 = false;
                          break Q193;
                        }
                      }
                    }
                    _c196 = _q192;
                  }
                  if (!(_c196)) continue;
                  _g173.push(v_r);
                }
              }
              if (!(sameSet(v_W, _g173))) { continue R1; }
              _g197.length = 0;
              partSums_st203.pass++;
              G198: {
                const _a204 = cl.cage.parts;
                for (let _i205 = 0; _i205 < _a204.length; _i205++) {
                  const v_r = _a204[_i205];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a206 = cl.cage.cells[v_r];
                  for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                    const v_c = _a206[_i207];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    const _t208 = v_c;
                    if (_g197.length < 16) { if (!_g197.includes(_t208)) _g197.push(_t208); } else addOnce(_g197, partSums_st203, _t208);
                  }
                }
              }
              if (!(sameSet(v_L, _g197))) { continue R1; }
              let _g209 = 0;
              G210: {
                for (let _m211 = b.domain; _m211 !== 0; _m211 &= _m211 - 1) {
                  const v_d = 31 - Math.clz32(_m211 & -_m211);
                  _g209 += v_d;
                }
              }
              let _g212 = 0;
              G213: {
                const _a214 = sp.lineCells[v_u];
                for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                  const v_c = _a214[_i215];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g212 += (b.grid[v_c] || -1);
                }
              }
              let _g216 = 0;
              G217: {
                const _a218 = v_W;
                for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                  const v_r = _a218[_i219];
                  let _g220 = 0;
                  G221: {
                    const _a222 = cl.cage.cells[v_r];
                    for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                      const v_c = _a222[_i223];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g220 += (b.grid[v_c] || -1);
                    }
                  }
                  _g216 += (clueAt(cl.total, v_r) - _g220);
                }
              }
              if (!((v_s === ((_g209 - _g212) - _g216)))) { continue R1; }
              _g224.length = 0;
              G225: {
                const _a228 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i229 = 0; _i229 < _a228.length; _i229++) {
                  const v_c = _a228[_i229];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g224.push(v_c);
                }
              }
              if (!(sameSet(v_R, _g224))) { continue R1; }
              const _t230 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g231 = 0;
              G232: {
                const _a233 = cl.cage.cells[_t230];
                for (let _i234 = 0; _i234 < _a233.length; _i234++) {
                  const v_c = _a233[_i234];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g231 += (b.grid[v_c] || -1);
                }
              }
              if (!((v_t === ((clueAt(cl.total, _t230) - _g231) - v_s)))) { continue R1; }
            }
            if (DEV && staleChecking) {
              const _g235: number[] = [];
              G236: {
                const _a248 = cl.cage.parts;
                for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                  const v_r = _a248[_i249];
                  let _q250 = false;
                  Q251: {
                    const _a252 = cl.cage.cells[v_r];
                    for (let _i253 = 0; _i253 < _a252.length; _i253++) {
                      const v_c = _a252[_i253];
                      if (!((b.grid[v_c] !== 0))) {
                        _q250 = true;
                        break Q251;
                      }
                    }
                  }
                  let _c258: boolean = _q250;
                  if (_c258) {
                    let _q254 = true;
                    Q255: {
                      const _a256 = cl.cage.cells[v_r];
                      for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                        const v_c = _a256[_i257];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        if (!((sp.lineCells[v_u].includes(v_c)))) {
                          _q254 = false;
                          break Q255;
                        }
                      }
                    }
                    _c258 = _q254;
                  }
                  if (!(_c258)) continue;
                  _g235.push(v_r);
                }
              }
              const _g259: number[] = [];
              G260: {
                const _a265 = cl.cage.parts;
                for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                  const v_r = _a265[_i266];
                  if (!(!(v_W.includes(v_r)))) continue;
                  const _a267 = cl.cage.cells[v_r];
                  for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                    const v_c = _a267[_i268];
                    if (!((!((b.grid[v_c] !== 0)) && (sp.lineCells[v_u].includes(v_c))))) continue;
                    if (!_g259.includes(v_c)) _g259.push(v_c);
                  }
                }
              }
              let _g269 = 0;
              G270: {
                for (let _m271 = b.domain; _m271 !== 0; _m271 &= _m271 - 1) {
                  const v_d = 31 - Math.clz32(_m271 & -_m271);
                  _g269 += v_d;
                }
              }
              let _g272 = 0;
              G273: {
                const _a274 = sp.lineCells[v_u];
                for (let _i275 = 0; _i275 < _a274.length; _i275++) {
                  const v_c = _a274[_i275];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g272 += (b.grid[v_c] || -1);
                }
              }
              let _g276 = 0;
              G277: {
                const _a278 = v_W;
                for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                  const v_r = _a278[_i279];
                  let _g280 = 0;
                  G281: {
                    const _a282 = cl.cage.cells[v_r];
                    for (let _i283 = 0; _i283 < _a282.length; _i283++) {
                      const v_c = _a282[_i283];
                      if (!((b.grid[v_c] !== 0))) continue;
                      _g280 += (b.grid[v_c] || -1);
                    }
                  }
                  _g276 += (clueAt(cl.total, v_r) - _g280);
                }
              }
              const _g284: number[] = [];
              G285: {
                const _a288 = cl.cage.cells[cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]];
                for (let _i289 = 0; _i289 < _a288.length; _i289++) {
                  const v_c = _a288[_i289];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_L.includes(v_c))))) continue;
                  _g284.push(v_c);
                }
              }
              const _t290 = cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)];
              let _g291 = 0;
              G292: {
                const _a293 = cl.cage.cells[_t290];
                for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                  const v_c = _a293[_i294];
                  if (!((b.grid[v_c] !== 0))) continue;
                  _g291 += (b.grid[v_c] || -1);
                }
              }
              const _g295: number[] = [];
              G296: {
                const _a299 = union(v_L, v_R);
                for (let _i300 = 0; _i300 < _a299.length; _i300++) {
                  const v_c = _a299[_i300];
                  if (!(((v_i === 0) === (v_L.includes(v_c))))) continue;
                  _g295.push(v_c);
                }
              }
              let _c306: boolean = (((v_K.length > 1) && (v_K.length <= 4)) && (v_v !== 0));
              if (_c306) {
                let _c305: boolean = (v_i === 0);
                if (!_c305) {
                  let _q301 = true;
                  Q302: {
                    const _a303 = v_L;
                    for (let _i304 = 0; _i304 < _a303.length; _i304++) {
                      const v_c = _a303[_i304];
                      if (!((cl.cage.of[v_c] === cl.cage.of[(v_L.length > 0 ? v_L[0] : -1)]))) {
                        _q301 = false;
                        break Q302;
                      }
                    }
                  }
                  _c305 = _q301;
                }
                _c306 = _c305;
              }
              freshBinding("partSums", [(union(union(sp.rows, sp.cols), sp.boxes).includes(v_u)), sameSet(v_W, _g235), sameSet(v_L, _g259), ((v_L.length > 1) && (v_L.length < sp.w)), (v_s === ((_g269 - _g272) - _g276)), (v_s > 0), sameSet(v_R, _g284), (v_t === ((clueAt(cl.total, _t290) - _g291) - v_s)), ((0 <= v_i) && (v_i <= 1)), sameSet(v_K, _g295), (v_v === ((v_s * (1 - v_i)) + (v_t * v_i))), _c306], ["u in", "W =", "L =", "where of L", "s =", "where of s", "R =", "t =", "i in", "K =", "v =", "where of v"]);
            }
            facts.length = 0;
            changed = false;
            let _q307 = true;
            Q308: {
              let _g309 = 0;
              G310: {
                const _e326 = valuesOf(b.domain);
                const _n329 = 1 << _e326.length;
                for (let _k327 = _h166 > _e326.length ? _n329 : (1 << _h166) - 1; _k327 < _n329; _k327 = _h166 === 0 ? _n329 : nextOfSize(_k327)) {
                  let v_T = 0;
                  for (let _j328 = 0; _j328 < _e326.length; _j328++) if ((_k327 >> (_e326.length - 1 - _j328)) & 1) v_T |= 1 << _e326[_j328];
                  const _h330 = popcount(v_T);
                  let _c334: boolean = (_h330 === _h166);
                  if (_c334) {
                    let _g331 = 0;
                    G332: {
                      for (let _m333 = v_T; _m333 !== 0; _m333 &= _m333 - 1) {
                        const v_e = 31 - Math.clz32(_m333 & -_m333);
                        _g331 += v_e;
                      }
                    }
                    _c334 = (_g331 === v_v);
                  }
                  let _c339: boolean = _c334;
                  if (_c339) {
                    let _q335 = true;
                    Q336: {
                      const _a337 = v_K;
                      for (let _i338 = 0; _i338 < _a337.length; _i338++) {
                        const v_x = _a337[_i338];
                        if (!(((v_T & (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) !== 0))) {
                          _q335 = false;
                          break Q336;
                        }
                      }
                    }
                    _c339 = _q335;
                  }
                  if (!(_c339)) continue;
                  for (let _m340 = v_T; _m340 !== 0; _m340 &= _m340 - 1) {
                    const v_d = 31 - Math.clz32(_m340 & -_m340);
                    _g309 |= 1 << v_d;
                  }
                }
              }
              const v_P = _g309;
              const _h341 = popcount(v_P);
              let _c347: boolean = (_h341 > 0);
              if (_c347) {
                let _q342 = true;
                Q343: {
                  const _a344 = v_K;
                  for (let _i345 = 0; _i345 < _a344.length; _i345++) {
                    const v_c = _a344[_i345];
                    for (let _m346 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m346 !== 0; _m346 &= _m346 - 1) {
                      const v_d = 31 - Math.clz32(_m346 & -_m346);
                      if (!(!(((v_P >> v_d) & 1) !== 0))) continue;
                      if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                      if (!(true)) {
                        _q342 = false;
                        break Q343;
                      }
                    }
                  }
                }
                _c347 = _q342;
              }
              if (!(_c347)) {
                _q307 = false;
                break Q308;
              }
            }
            if (!(_q307)) return -1;
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
  const _a28 = union(union(sp.rows, sp.cols), sp.diagonals);
  for (let _i29 = 0; _i29 < _a28.length; _i29++) {
    const v_L = _a28[_i29];
    const _a30 = sp.boxes;
    for (let _i31 = 0; _i31 < _a30.length; _i31++) {
      const v_b = _a30[_i31];
      let _q32 = false;
      Q33: {
        const _a34 = sp.lineCells[v_L];
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_c = _a34[_i35];
          if ((sp.boxOf[v_c] === v_b)) {
            _q32 = true;
            break Q33;
          }
        }
      }
      if (!(_q32)) continue;
      for (let _m36 = b.domain; _m36 !== 0; _m36 &= _m36 - 1) {
        const v_d = 31 - Math.clz32(_m36 & -_m36);
        let _q37 = false;
        Q38: {
          const _a39 = sp.lineCells[v_L];
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_c = _a39[_i40];
            const _h41 = (b.grid[v_c] || -1);
            if ((_h41 === v_d)) {
              _q37 = true;
              break Q38;
            }
          }
        }
        let _c47: boolean = !(_q37);
        if (_c47) {
          let _q42 = false;
          Q43: {
            const _a44 = sp.lineCells[v_b];
            for (let _i45 = 0; _i45 < _a44.length; _i45++) {
              const v_c = _a44[_i45];
              const _h46 = (b.grid[v_c] || -1);
              if ((_h46 === v_d)) {
                _q42 = true;
                break Q43;
              }
            }
          }
          _c47 = !(_q42);
        }
        if (!(_c47)) continue;
        let _q48 = true;
        Q49: {
          const _a50 = sp.lineCells[v_L];
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_c = _a50[_i51];
            if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
            if (!((sp.boxOf[v_c] === v_b))) {
              _q48 = false;
              break Q49;
            }
          }
        }
        let _c56: boolean = _q48;
        if (_c56) {
          let _q52 = false;
          Q53: {
            const _a54 = sp.lineCells[v_b];
            for (let _i55 = 0; _i55 < _a54.length; _i55++) {
              const v_c = _a54[_i55];
              if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                _q52 = true;
                break Q53;
              }
            }
          }
          _c56 = _q52;
        }
        const v_first = _c56;
        if (DEV && staleChecking) {
          let _q57 = false;
          Q58: {
            const _a59 = sp.lineCells[v_L];
            for (let _i60 = 0; _i60 < _a59.length; _i60++) {
              const v_c = _a59[_i60];
              if ((sp.boxOf[v_c] === v_b)) {
                _q57 = true;
                break Q58;
              }
            }
          }
          let _q61 = false;
          Q62: {
            const _a63 = sp.lineCells[v_L];
            for (let _i64 = 0; _i64 < _a63.length; _i64++) {
              const v_c = _a63[_i64];
              if (((b.grid[v_c] || -1) === v_d)) {
                _q61 = true;
                break Q62;
              }
            }
          }
          let _c69: boolean = !(_q61);
          if (_c69) {
            let _q65 = false;
            Q66: {
              const _a67 = sp.lineCells[v_b];
              for (let _i68 = 0; _i68 < _a67.length; _i68++) {
                const v_c = _a67[_i68];
                if (((b.grid[v_c] || -1) === v_d)) {
                  _q65 = true;
                  break Q66;
                }
              }
            }
            _c69 = !(_q65);
          }
          let _q70 = true;
          Q71: {
            const _a72 = sp.lineCells[v_L];
            for (let _i73 = 0; _i73 < _a72.length; _i73++) {
              const v_c = _a72[_i73];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              if (!((sp.boxOf[v_c] === v_b))) {
                _q70 = false;
                break Q71;
              }
            }
          }
          let _c78: boolean = _q70;
          if (_c78) {
            let _q74 = false;
            Q75: {
              const _a76 = sp.lineCells[v_b];
              for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                const v_c = _a76[_i77];
                if (!(!(sp.lineCells[v_L].includes(v_c)))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                  _q74 = true;
                  break Q75;
                }
              }
            }
            _c78 = _q74;
          }
          freshBinding("intersect", [(union(union(sp.rows, sp.cols), sp.diagonals).includes(v_L)), (sp.boxes.includes(v_b)), _q57, (((b.domain >> v_d) & 1) !== 0), _c69, (v_first === _c78)], ["L in", "b in", "where of b", "d in", "where of d", "first ="]);
        }
        facts.length = 0;
        changed = false;
        let _c83: boolean = !(v_first);
        if (!_c83) {
          let _q79 = true;
          Q80: {
            const _a81 = sp.lineCells[v_b];
            for (let _i82 = 0; _i82 < _a81.length; _i82++) {
              const v_c = _a81[_i82];
              if (!((!(sp.lineCells[v_L].includes(v_c)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q79 = false;
                break Q80;
              }
            }
          }
          _c83 = _q79;
        }
        let _c94: boolean = _c83;
        if (_c94) {
          let _c93: boolean = v_first;
          if (!_c93) {
            let _q84 = true;
            Q85: {
              const _a86 = sp.lineCells[v_b];
              for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                const v_c = _a86[_i87];
                if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
                if (!((sp.lineCells[v_L].includes(v_c)))) {
                  _q84 = false;
                  break Q85;
                }
              }
            }
            let _c92: boolean = !(_q84);
            if (!_c92) {
              let _q88 = true;
              Q89: {
                const _a90 = sp.lineCells[v_L];
                for (let _i91 = 0; _i91 < _a90.length; _i91++) {
                  const v_c = _a90[_i91];
                  if (!(((sp.boxOf[v_c] !== v_b) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                  if (!(true)) {
                    _q88 = false;
                    break Q89;
                  }
                }
              }
              _c92 = _q88;
            }
            _c93 = _c92;
          }
          _c94 = _c93;
        }
        if (!(_c94)) return -1;
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
  const _g42: number[] = [];
  const _g73: number[] = [];
  const _g89: number[] = [];
  const facts = digitSetFacts;
  let fired = 0;
  let changed = false;
  const _h57 = (sp.w - 1);
  const _h58 = rangeMask(0, _h57);
  R1:
  for (let _m41 = b.domain; _m41 !== 0; _m41 &= _m41 - 1) {
    const v_d = 31 - Math.clz32(_m41 & -_m41);
    const _m162_0 = b.made[0];
    _g42.length = 0;
    G43: {
      const _a50 = sp.rows;
      for (let _i51 = 0; _i51 < _a50.length; _i51++) {
        const v_L = _a50[_i51];
        let _q52 = false;
        Q53: {
          const _a54 = sp.lineCells[v_L];
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_c = _a54[_i55];
            const _h56 = (b.grid[v_c] || -1);
            if ((_h56 === v_d)) {
              _q52 = true;
              break Q53;
            }
          }
        }
        if (!(!(_q52))) continue;
        _g42.push(v_L);
      }
    }
    const v_Y0 = _g42;
    const _h71 = v_Y0.length;
    const _h72 = (_h71 - 2);
    const _m163_1 = b.made[1];
    let _g59 = 0;
    G60: {
      const _a63 = cellsValued(b, sp.cells, v_d);
      for (let _i64 = 0; _i64 < _a63.length; _i64++) {
        const v_c = _a63[_i64];
        const _h65 = (b.grid[v_c] || -1);
        if (!((_h65 === v_d))) continue;
        const _t66 = (v_c % sp.w);
        _g59 |= 1 << _t66;
      }
    }
    const v_X0 = (_h58 & ~_g59);
    const _e67 = valuesOf(v_X0);
    for (let _k68 = 0; _k68 < 1 << _e67.length; _k68++) {
      let v_T = 0;
      for (let _j69 = 0; _j69 < _e67.length; _j69++) if ((_k68 >> (_e67.length - 1 - _j69)) & 1) v_T |= 1 << _e67[_j69];
      const _h70 = popcount(v_T);
      if (!(((_h70 === 0) || ((2 <= _h70) && (_h70 <= _h72))))) continue;
      const _h160 = (v_X0 & ~v_T);
      _g73.length = 0;
      G74: {
        const _a81 = v_Y0;
        for (let _i82 = 0; _i82 < _a81.length; _i82++) {
          const v_L = _a81[_i82];
          let _q83 = false;
          Q84: {
            const _a85 = sp.lineCells[v_L];
            for (let _i86 = 0; _i86 < _a85.length; _i86++) {
              const v_c = _a85[_i86];
              if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0))) {
                _q83 = true;
                break Q84;
              }
            }
          }
          if (!(!(_q83))) continue;
          _g73.push(v_L);
        }
      }
      L87: {
        const v_Y = _g73;
        const _h88 = v_Y.length;
        if (!((_h88 >= (_h71 - _h70)))) break L87;
        if (b.made[0] !== _m162_0 || b.made[1] !== _m163_1) {
          _g89.length = 0;
          G90: {
            const _a97 = sp.rows;
            for (let _i98 = 0; _i98 < _a97.length; _i98++) {
              const v_L = _a97[_i98];
              let _q99 = false;
              Q100: {
                const _a101 = sp.lineCells[v_L];
                for (let _i102 = 0; _i102 < _a101.length; _i102++) {
                  const v_c = _a101[_i102];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q99 = true;
                    break Q100;
                  }
                }
              }
              if (!(!(_q99))) continue;
              _g89.push(v_L);
            }
          }
          if (!(sameSet(v_Y0, _g89))) { continue R1; }
          let _g103 = 0;
          G104: {
            const _a107 = cellsValued(b, sp.cells, v_d);
            for (let _i108 = 0; _i108 < _a107.length; _i108++) {
              const v_c = _a107[_i108];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              const _t109 = (v_c % sp.w);
              _g103 |= 1 << _t109;
            }
          }
          if (!((v_X0 === (rangeMask(0, (sp.w - 1)) & ~_g103)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          const _g110: number[] = [];
          G111: {
            const _a118 = sp.rows;
            for (let _i119 = 0; _i119 < _a118.length; _i119++) {
              const v_L = _a118[_i119];
              let _q120 = false;
              Q121: {
                const _a122 = sp.lineCells[v_L];
                for (let _i123 = 0; _i123 < _a122.length; _i123++) {
                  const v_c = _a122[_i123];
                  if (((b.grid[v_c] || -1) === v_d)) {
                    _q120 = true;
                    break Q121;
                  }
                }
              }
              if (!(!(_q120))) continue;
              _g110.push(v_L);
            }
          }
          let _g124 = 0;
          G125: {
            const _a128 = cellsValued(b, sp.cells, v_d);
            for (let _i129 = 0; _i129 < _a128.length; _i129++) {
              const v_c = _a128[_i129];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              const _t130 = (v_c % sp.w);
              _g124 |= 1 << _t130;
            }
          }
          const _g131: number[] = [];
          G132: {
            const _a139 = v_Y0;
            for (let _i140 = 0; _i140 < _a139.length; _i140++) {
              const v_L = _a139[_i140];
              let _q141 = false;
              Q142: {
                const _a143 = sp.lineCells[v_L];
                for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                  const v_c = _a143[_i144];
                  if (((((v_T >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0))) {
                    _q141 = true;
                    break Q142;
                  }
                }
              }
              if (!(!(_q141))) continue;
              _g131.push(v_L);
            }
          }
          freshBinding("digitSet", [(((b.domain >> v_d) & 1) !== 0), sameSet(v_Y0, _g110), (v_X0 === (rangeMask(0, (sp.w - 1)) & ~_g124)), ((popcount(v_T) === 0) || ((2 <= popcount(v_T)) && (popcount(v_T) <= (v_Y0.length - 2)))), sameSet(v_Y, _g131), (v_Y.length >= (v_Y0.length - popcount(v_T)))], ["d in", "Y0 =", "X0 =", "where of T", "Y =", "where of Y"]);
        }
        facts.length = 0;
        changed = false;
        let _c153: boolean = (_h70 > 0);
        if (!_c153) {
          let _q145 = true;
          Q146: {
            const _a147 = sp.rows;
            for (let _i148 = 0; _i148 < _a147.length; _i148++) {
              const v_L = _a147[_i148];
              let _q149 = false;
              Q150: {
                const _a151 = sp.lineCells[v_L];
                for (let _i152 = 0; _i152 < _a151.length; _i152++) {
                  const v_c = _a151[_i152];
                  if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                    _q149 = true;
                    break Q150;
                  }
                }
              }
              if (!(_q149)) {
                _q145 = false;
                break Q146;
              }
            }
          }
          _c153 = _q145;
        }
        let _c161: boolean = (_c153 && (_h88 === (_h71 - _h70)));
        if (_c161) {
          let _q154 = true;
          Q155: {
            const _a156 = minus(v_Y0, v_Y);
            for (let _i157 = 0; _i157 < _a156.length; _i157++) {
              const v_L = _a156[_i157];
              const _a158 = sp.lineCells[v_L];
              for (let _i159 = 0; _i159 < _a158.length; _i159++) {
                const v_c = _a158[_i159];
                if (!(((((_h160 >> (v_c % sp.w)) & 1) !== 0) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q154 = false;
                  break Q155;
                }
              }
            }
          }
          _c161 = _q154;
        }
        if (!(_c161)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ d: v_d, Y0: v_Y0.slice(), X0: v_X0, T: v_T, Y: v_Y.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
