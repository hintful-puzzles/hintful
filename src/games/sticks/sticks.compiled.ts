// Compiled by `npm run describe` from src/games/sticks/sticks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  block: ClueList;
  length: ClueList;
  joins: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "overConnected" | "twoClues" | "tooLong" | "starved" | "unreachable";

/** Every technique run as each value is placed, by id. */
export type PlacingId = never;

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
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
  { id: "overConnected", tier: 0 },
  { id: "twoClues", tier: 0 },
  { id: "tooLong", tier: 0 },
  { id: "starved", tier: 0 },
  { id: "unreachable", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g6 = 0;
  G7: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!(((v_d === 3) === (clueAt(cl.block, v_c) >= 0)))) continue;
      _g6 |= 1 << v_d;
    }
  }
  return _g6;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g306: number[] = [];
  const _g313: number[] = [];
  const _g329: number[] = [];
  const _g336: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q300 = true;
  Q301: {
    const _a302 = sp.cells;
    for (let _i303 = 0; _i303 < _a302.length; _i303++) {
      const v_c = _a302[_i303];
      let _g304 = 0;
      G305: {
        _g306.length = 0;
        G307: {
          const _a310 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i311 = 0; _i311 < _a310.length; _i311++) {
            const v_x = _a310[_i311];
            const _h312 = (g[v_x] || -1);
            if (!((_h312 === 1))) continue;
            _g306.push(v_x);
          }
        }
        _g313.length = 0;
        G314: {
          const _a317 = sp.lineCells[sp.colOf[v_c]];
          for (let _i318 = 0; _i318 < _a317.length; _i318++) {
            const v_x = _a317[_i318];
            const _h319 = (g[v_x] || -1);
            if (!((_h319 === 2))) continue;
            _g313.push(v_x);
          }
        }
        const _a320 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g306), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g313));
        for (let _i321 = 0; _i321 < _a320.length; _i321++) {
          const v_k = _a320[_i321];
          const _h322 = clueAt(cl.length, v_k);
          if (!((_h322 >= 0))) continue;
          _g304++;
        }
      }
      if (!((_g304 <= 1))) {
        _q300 = false;
        break Q301;
      }
    }
  }
  if (!(_q300)) return false;
  for (let _k323 = 0; _k323 < cl.block.at.length; _k323++) {
    const _at324 = cl.block.at[_k323];
    if (!(((g[_at324] || -1) === 3))) return false;
  }
  for (let _k326 = 0; _k326 < cl.length.at.length; _k326++) {
    const _at327 = cl.length.at[_k326];
    const _v328 = cl.length.v[_k326];
    _g329.length = 0;
    G330: {
      const _a333 = sp.lineCells[sp.rowOf[_at327]];
      for (let _i334 = 0; _i334 < _a333.length; _i334++) {
        const v_x = _a333[_i334];
        const _h335 = (g[v_x] || -1);
        if (!((_h335 === 1))) continue;
        _g329.push(v_x);
      }
    }
    _g336.length = 0;
    G337: {
      const _a340 = sp.lineCells[sp.colOf[_at327]];
      for (let _i341 = 0; _i341 < _a340.length; _i341++) {
        const v_x = _a340[_i341];
        const _h342 = (g[v_x] || -1);
        if (!((_h342 === 2))) continue;
        _g336.push(v_x);
      }
    }
    if (!((union(stretch(sp.lineCells[sp.rowOf[_at327]], _at327, _g329), stretch(sp.lineCells[sp.colOf[_at327]], _at327, _g336)).length === _v328))) return false;
  }
  for (let _k343 = 0; _k343 < cl.joins.at.length; _k343++) {
    const _at344 = cl.joins.at[_k343];
    const _v345 = cl.joins.v[_k343];
    let _g346 = 0;
    G347: {
      const _a348 = sp.adj4[_at344];
      for (let _i349 = 0; _i349 < _a348.length; _i349++) {
        const v_p = _a348[_i349];
        const _h350 = (g[v_p] || -1);
        if (!((((_h350 === 1) && (((v_p / sp.w) | 0) === ((_at344 / sp.w) | 0))) || ((_h350 === 2) && ((v_p % sp.w) === (_at344 % sp.w)))))) continue;
        _g346++;
      }
    }
    if (!((_g346 === _v345))) return false;
  }
  return true;
}

export interface OverConnectedBinding {
  b: number;
  n: number;
}

const overConnectedFacts: number[] = [];
let overConnectedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function overConnected(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverConnectedBinding> | null): number {
  const facts = overConnectedFacts;
  let fired = 0;
  let changed = false;
  if (overConnectedCands.length < sp.cells.length) overConnectedCands = new Int32Array(sp.cells.length);
  const cands = overConnectedCands;
  cands.fill(-1);
  const _a11 = sp.cells;
  for (let _i12 = 0; _i12 < _a11.length; _i12++) {
    const v_b = _a11[_i12];
    const _h13 = clueAt(cl.joins, v_b);
    const _h19 = ((v_b / sp.w) | 0);
    const _h20 = (v_b % sp.w);
    L14: {
      const v_n = _h13;
      if (!((v_n >= 0))) break L14;
      facts.length = 0;
      changed = false;
      let _g15 = 0;
      G16: {
        const _a17 = sp.adj4[v_b];
        for (let _i18 = 0; _i18 < _a17.length; _i18++) {
          const v_p = _a17[_i18];
          if (!(((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h19)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h20))))) continue;
          _g15++;
        }
      }
      let _c34: boolean = (_g15 <= v_n);
      if (_c34) {
        let _q21 = true;
        Q22: {
          const _a23 = sp.adj4[v_b];
          for (let _i24 = 0; _i24 < _a23.length; _i24++) {
            const v_c = _a23[_i24];
            const _h25 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h25 < 0)))) continue;
            for (let _m26 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m26 !== 0; _m26 &= _m26 - 1) {
              const v_a = 31 - Math.clz32(_m26 & -_m26);
              const _wc27 = v_c;
              const _wd28 = v_a;
              let _g29 = 0;
              G30: {
                const _a31 = sp.adj4[v_b];
                for (let _i32 = 0; _i32 < _a31.length; _i32++) {
                  const v_p = _a31[_i32];
                  if (!(((((v_p === _wc27 ? _wd28 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h19)) || (((v_p === _wc27 ? _wd28 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h20))))) continue;
                  _g29++;
                }
              }
              if (!((_g29 > v_n))) continue;
              const _t33 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t33); changed = true; } else facts.push(PLACE, v_c, _t33); }
              if (!(true)) {
                _q21 = false;
                break Q22;
              }
            }
          }
        }
        _c34 = _q21;
      }
      if (!(_c34)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ b: v_b, n: v_n }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface TwoCluesBinding {
  k: number;
}

const twoCluesFacts: number[] = [];
let twoCluesCands = new Int32Array(0);

/** Its dearest read grows with the board as n^1.5. */
export function twoClues(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoCluesBinding> | null): number {
  const _g42: number[] = [];
  const _g48: number[] = [];
  const _g68: number[] = [];
  const _g75: number[] = [];
  const facts = twoCluesFacts;
  let fired = 0;
  let changed = false;
  if (twoCluesCands.length < sp.cells.length) twoCluesCands = new Int32Array(sp.cells.length);
  const cands = twoCluesCands;
  cands.fill(-1);
  const _a37 = sp.cells;
  for (let _i38 = 0; _i38 < _a37.length; _i38++) {
    const v_k = _a37[_i38];
    const _h39 = clueAt(cl.length, v_k);
    if (!((_h39 >= 0))) continue;
    const _h67 = sp.rowOf[v_k];
    const _h74 = sp.colOf[v_k];
    facts.length = 0;
    changed = false;
    let _g40 = 0;
    G41: {
      _g42.length = 0;
      G43: {
        const _a46 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i47 = 0; _i47 < _a46.length; _i47++) {
          const v_x = _a46[_i47];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g42.push(v_x);
        }
      }
      _g48.length = 0;
      G49: {
        const _a52 = sp.lineCells[sp.colOf[v_k]];
        for (let _i53 = 0; _i53 < _a52.length; _i53++) {
          const v_x = _a52[_i53];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g48.push(v_x);
        }
      }
      const _a54 = union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g42), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g48));
      for (let _i55 = 0; _i55 < _a54.length; _i55++) {
        const v_j = _a54[_i55];
        const _h56 = clueAt(cl.length, v_j);
        if (!((_h56 >= 0))) continue;
        _g40++;
      }
    }
    let _c85: boolean = (_g40 <= 1);
    if (_c85) {
      let _q57 = true;
      Q58: {
        const _a59 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
        for (let _i60 = 0; _i60 < _a59.length; _i60++) {
          const v_c = _a59[_i60];
          const _h61 = clueAt(cl.block, v_c);
          if (!((!((b.grid[v_c] !== 0)) && (_h61 < 0)))) continue;
          for (let _m62 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m62 !== 0; _m62 &= _m62 - 1) {
            const v_a = 31 - Math.clz32(_m62 & -_m62);
            const _wc63 = v_c;
            const _wd64 = v_a;
            let _g65 = 0;
            G66: {
              _g68.length = 0;
              G69: {
                const _a72 = sp.lineCells[_h67];
                for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                  const v_x = _a72[_i73];
                  if (!(((v_x === _wc63 ? _wd64 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g68.push(v_x);
                }
              }
              _g75.length = 0;
              G76: {
                const _a79 = sp.lineCells[_h74];
                for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                  const v_x = _a79[_i80];
                  if (!(((v_x === _wc63 ? _wd64 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g75.push(v_x);
                }
              }
              const _a81 = union(stretch(sp.lineCells[_h67], v_k, _g68), stretch(sp.lineCells[_h74], v_k, _g75));
              for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                const v_j = _a81[_i82];
                const _h83 = clueAt(cl.length, v_j);
                if (!((_h83 >= 0))) continue;
                _g65++;
              }
            }
            if (!((_g65 > 1))) continue;
            const _t84 = (3 - v_a);
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t84); changed = true; } else facts.push(PLACE, v_c, _t84); }
            if (!(true)) {
              _q57 = false;
              break Q58;
            }
          }
        }
      }
      _c85 = _q57;
    }
    if (!(_c85)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface TooLongBinding {
  k: number;
  v: number;
}

const tooLongFacts: number[] = [];
let tooLongCands = new Int32Array(0);

/** Its dearest read grows with the board as n^1.5. */
export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding> | null): number {
  const _g93: number[] = [];
  const _g99: number[] = [];
  const _g114: number[] = [];
  const _g121: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  if (tooLongCands.length < sp.cells.length) tooLongCands = new Int32Array(sp.cells.length);
  const cands = tooLongCands;
  cands.fill(-1);
  const _a89 = sp.cells;
  for (let _i90 = 0; _i90 < _a89.length; _i90++) {
    const v_k = _a89[_i90];
    const _h91 = clueAt(cl.length, v_k);
    const _h113 = sp.rowOf[v_k];
    const _h120 = sp.colOf[v_k];
    L92: {
      const v_v = _h91;
      if (!((v_v >= 0))) break L92;
      facts.length = 0;
      changed = false;
      _g93.length = 0;
      G94: {
        const _a97 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i98 = 0; _i98 < _a97.length; _i98++) {
          const v_x = _a97[_i98];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g93.push(v_x);
        }
      }
      _g99.length = 0;
      G100: {
        const _a103 = sp.lineCells[sp.colOf[v_k]];
        for (let _i104 = 0; _i104 < _a103.length; _i104++) {
          const v_x = _a103[_i104];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g99.push(v_x);
        }
      }
      let _c128: boolean = (union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g93), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g99)).length <= v_v);
      if (_c128) {
        let _q105 = true;
        Q106: {
          const _a107 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i108 = 0; _i108 < _a107.length; _i108++) {
            const v_c = _a107[_i108];
            const _h109 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h109 < 0)))) continue;
            for (let _m110 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m110 !== 0; _m110 &= _m110 - 1) {
              const v_a = 31 - Math.clz32(_m110 & -_m110);
              const _wc111 = v_c;
              const _wd112 = v_a;
              _g114.length = 0;
              G115: {
                const _a118 = sp.lineCells[_h113];
                for (let _i119 = 0; _i119 < _a118.length; _i119++) {
                  const v_x = _a118[_i119];
                  if (!(((v_x === _wc111 ? _wd112 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g114.push(v_x);
                }
              }
              _g121.length = 0;
              G122: {
                const _a125 = sp.lineCells[_h120];
                for (let _i126 = 0; _i126 < _a125.length; _i126++) {
                  const v_x = _a125[_i126];
                  if (!(((v_x === _wc111 ? _wd112 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g121.push(v_x);
                }
              }
              if (!((union(stretch(sp.lineCells[_h113], v_k, _g114), stretch(sp.lineCells[_h120], v_k, _g121)).length > v_v))) continue;
              const _t127 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t127); changed = true; } else facts.push(PLACE, v_c, _t127); }
              if (!(true)) {
                _q105 = false;
                break Q106;
              }
            }
          }
        }
        _c128 = _q105;
      }
      if (!(_c128)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, v: v_v }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface StarvedBinding {
  b: number;
  n: number;
}

const starvedFacts: number[] = [];
let starvedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function starved(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedBinding> | null): number {
  const facts = starvedFacts;
  let fired = 0;
  let changed = false;
  if (starvedCands.length < sp.cells.length) starvedCands = new Int32Array(sp.cells.length);
  const cands = starvedCands;
  cands.fill(-1);
  const _a132 = sp.cells;
  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
    const v_b = _a132[_i133];
    const _h134 = clueAt(cl.joins, v_b);
    const _h141 = ((v_b / sp.w) | 0);
    const _h142 = (v_b % sp.w);
    L135: {
      const v_n = _h134;
      if (!((v_n >= 0))) break L135;
      facts.length = 0;
      changed = false;
      let _g136 = 0;
      G137: {
        const _a138 = sp.adj4[v_b];
        for (let _i139 = 0; _i139 < _a138.length; _i139++) {
          const v_p = _a138[_i139];
          const _h140 = clueAt(cl.block, v_p);
          if (!(((_h140 < 0) && (!((b.grid[v_p] !== 0)) || ((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h141)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h142))))))) continue;
          _g136++;
        }
      }
      let _c157: boolean = (_g136 >= v_n);
      if (_c157) {
        let _q143 = true;
        Q144: {
          const _a145 = sp.adj4[v_b];
          for (let _i146 = 0; _i146 < _a145.length; _i146++) {
            const v_c = _a145[_i146];
            const _h147 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h147 < 0)))) continue;
            for (let _m148 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m148 !== 0; _m148 &= _m148 - 1) {
              const v_a = 31 - Math.clz32(_m148 & -_m148);
              const _wc149 = v_c;
              const _wd150 = v_a;
              let _g151 = 0;
              G152: {
                const _a153 = sp.adj4[v_b];
                for (let _i154 = 0; _i154 < _a153.length; _i154++) {
                  const v_p = _a153[_i154];
                  const _h155 = clueAt(cl.block, v_p);
                  if (!(((_h155 < 0) && (!((v_p === _wc149 ? true : (b.grid[v_p] !== 0))) || ((((v_p === _wc149 ? _wd150 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h141)) || (((v_p === _wc149 ? _wd150 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h142))))))) continue;
                  _g151++;
                }
              }
              if (!((_g151 < v_n))) continue;
              const _t156 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t156); changed = true; } else facts.push(PLACE, v_c, _t156); }
              if (!(true)) {
                _q143 = false;
                break Q144;
              }
            }
          }
        }
        _c157 = _q143;
      }
      if (!(_c157)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ b: v_b, n: v_n }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface UnreachableBinding {
  k: number;
  v: number;
}

const unreachableFacts: number[] = [];
let unreachableCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function unreachable(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UnreachableBinding> | null): number {
  const _g234: number[] = [];
  const _g255: number[] = [];
  const _g266: number[] = [];
  const _g287: number[] = [];
  const facts = unreachableFacts;
  let fired = 0;
  let changed = false;
  if (unreachableCands.length < sp.cells.length) unreachableCands = new Int32Array(sp.cells.length);
  const cands = unreachableCands;
  cands.fill(-1);
  const _a161 = sp.cells;
  for (let _i162 = 0; _i162 < _a161.length; _i162++) {
    const v_k = _a161[_i162];
    const _h163 = clueAt(cl.length, v_k);
    const _h233 = sp.rowOf[v_k];
    const _h265 = sp.colOf[v_k];
    L164: {
      const v_v = _h163;
      if (!((v_v >= 0))) break L164;
      facts.length = 0;
      changed = false;
      let _c299: boolean = (!((b.grid[v_k] !== 0)) || (reach(b, sp, cl, v_k) >= v_v));
      if (_c299) {
        let _q225 = true;
        Q226: {
          const _a227 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i228 = 0; _i228 < _a227.length; _i228++) {
            const v_c = _a227[_i228];
            const _h229 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h229 < 0)))) continue;
            for (let _m230 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m230 !== 0; _m230 &= _m230 - 1) {
              const v_a = 31 - Math.clz32(_m230 & -_m230);
              const _wc231 = v_c;
              const _wd232 = v_a;
              let _c297: boolean = (v_k === _wc231 ? true : (b.grid[v_k] !== 0));
              if (_c297) {
                _g234.length = 0;
                G235: {
                  const _a250 = sp.lineCells[_h233];
                  for (let _i251 = 0; _i251 < _a250.length; _i251++) {
                    const v_x = _a250[_i251];
                    const _h252 = clueAt(cl.block, v_x);
                    let _c264: boolean = ((_h252 < 0) && (!((v_x === _wc231 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc231 ? _wd232 : (b.grid[v_x] || -1)) === 1)));
                    if (_c264) {
                      let _q253 = true;
                      Q254: {
                        _g255.length = 0;
                        G256: {
                          const _a259 = sp.lineCells[_h233];
                          for (let _i260 = 0; _i260 < _a259.length; _i260++) {
                            const v_z = _a259[_i260];
                            if (!((((v_z === _wc231 ? _wd232 : (b.grid[v_z] || -1)) === 1) || (v_z === v_x)))) continue;
                            _g255.push(v_z);
                          }
                        }
                        const _a261 = stretch(sp.lineCells[_h233], v_x, _g255);
                        for (let _i262 = 0; _i262 < _a261.length; _i262++) {
                          const v_y = _a261[_i262];
                          const _h263 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h263 >= 0))))) {
                            _q253 = false;
                            break Q254;
                          }
                        }
                      }
                      _c264 = _q253;
                    }
                    if (!(_c264)) continue;
                    _g234.push(v_x);
                  }
                }
                _g266.length = 0;
                G267: {
                  const _a282 = sp.lineCells[_h265];
                  for (let _i283 = 0; _i283 < _a282.length; _i283++) {
                    const v_x = _a282[_i283];
                    const _h284 = clueAt(cl.block, v_x);
                    let _c296: boolean = ((_h284 < 0) && (!((v_x === _wc231 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc231 ? _wd232 : (b.grid[v_x] || -1)) === 2)));
                    if (_c296) {
                      let _q285 = true;
                      Q286: {
                        _g287.length = 0;
                        G288: {
                          const _a291 = sp.lineCells[_h265];
                          for (let _i292 = 0; _i292 < _a291.length; _i292++) {
                            const v_z = _a291[_i292];
                            if (!((((v_z === _wc231 ? _wd232 : (b.grid[v_z] || -1)) === 2) || (v_z === v_x)))) continue;
                            _g287.push(v_z);
                          }
                        }
                        const _a293 = stretch(sp.lineCells[_h265], v_x, _g287);
                        for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                          const v_y = _a293[_i294];
                          const _h295 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h295 >= 0))))) {
                            _q285 = false;
                            break Q286;
                          }
                        }
                      }
                      _c296 = _q285;
                    }
                    if (!(_c296)) continue;
                    _g266.push(v_x);
                  }
                }
                _c297 = ((stretch(sp.lineCells[_h233], v_k, _g234).length + stretch(sp.lineCells[_h265], v_k, _g266).length) < v_v);
              }
              if (!(_c297)) continue;
              const _t298 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t298); changed = true; } else facts.push(PLACE, v_c, _t298); }
              if (!(true)) {
                _q225 = false;
                break Q226;
              }
            }
          }
        }
        _c299 = _q225;
      }
      if (!(_c299)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, v: v_v }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

const reachKept = keptStore<number>();

/** `reach(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): number {
  const _kept: Kept<number> = reachKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  const _g165: number[] = [];
  G166: {
    const _a181 = sp.lineCells[sp.rowOf[v_k]];
    for (let _i182 = 0; _i182 < _a181.length; _i182++) {
      const v_x = _a181[_i182];
      const _t183 = sp.rowOf[v_k];
      let _c194: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 1)));
      if (_c194) {
        let _q184 = true;
        Q185: {
          const _g186: number[] = [];
          G187: {
            const _a190 = sp.lineCells[_t183];
            for (let _i191 = 0; _i191 < _a190.length; _i191++) {
              const v_z = _a190[_i191];
              if (!((((b.grid[v_z] || -1) === 1) || (v_z === v_x)))) continue;
              _g186.push(v_z);
            }
          }
          const _a192 = stretch(sp.lineCells[_t183], v_x, _g186);
          for (let _i193 = 0; _i193 < _a192.length; _i193++) {
            const v_y = _a192[_i193];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q184 = false;
              break Q185;
            }
          }
        }
        _c194 = _q184;
      }
      if (!(_c194)) continue;
      _g165.push(v_x);
    }
  }
  const _g195: number[] = [];
  G196: {
    const _a211 = sp.lineCells[sp.colOf[v_k]];
    for (let _i212 = 0; _i212 < _a211.length; _i212++) {
      const v_x = _a211[_i212];
      const _t213 = sp.colOf[v_k];
      let _c224: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 2)));
      if (_c224) {
        let _q214 = true;
        Q215: {
          const _g216: number[] = [];
          G217: {
            const _a220 = sp.lineCells[_t213];
            for (let _i221 = 0; _i221 < _a220.length; _i221++) {
              const v_z = _a220[_i221];
              if (!((((b.grid[v_z] || -1) === 2) || (v_z === v_x)))) continue;
              _g216.push(v_z);
            }
          }
          const _a222 = stretch(sp.lineCells[_t213], v_x, _g216);
          for (let _i223 = 0; _i223 < _a222.length; _i223++) {
            const v_y = _a222[_i223];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q214 = false;
              break Q215;
            }
          }
        }
        _c224 = _q214;
      }
      if (!(_c224)) continue;
      _g195.push(v_x);
    }
  }
  const _made = (stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g165).length + stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g195).length);
  _kept[v_k] = _made;
  return _made;
}
