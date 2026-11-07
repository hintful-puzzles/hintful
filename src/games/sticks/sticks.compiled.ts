// Compiled by `npm run describe` from src/games/sticks/sticks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, stretch, union } from "../../engine/describe-runtime.ts";

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
  const _g369: number[] = [];
  const _g376: number[] = [];
  const _g392: number[] = [];
  const _g399: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q363 = true;
  Q364: {
    const _a365 = sp.cells;
    for (let _i366 = 0; _i366 < _a365.length; _i366++) {
      const v_c = _a365[_i366];
      let _g367 = 0;
      G368: {
        _g369.length = 0;
        G370: {
          const _a373 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i374 = 0; _i374 < _a373.length; _i374++) {
            const v_x = _a373[_i374];
            const _h375 = (g[v_x] || -1);
            if (!((_h375 === 1))) continue;
            _g369.push(v_x);
          }
        }
        _g376.length = 0;
        G377: {
          const _a380 = sp.lineCells[sp.colOf[v_c]];
          for (let _i381 = 0; _i381 < _a380.length; _i381++) {
            const v_x = _a380[_i381];
            const _h382 = (g[v_x] || -1);
            if (!((_h382 === 2))) continue;
            _g376.push(v_x);
          }
        }
        const _a383 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g369), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g376));
        for (let _i384 = 0; _i384 < _a383.length; _i384++) {
          const v_k = _a383[_i384];
          const _h385 = clueAt(cl.length, v_k);
          if (!((_h385 >= 0))) continue;
          _g367++;
        }
      }
      if (!((_g367 <= 1))) {
        _q363 = false;
        break Q364;
      }
    }
  }
  if (!(_q363)) return false;
  for (let _k386 = 0; _k386 < cl.block.at.length; _k386++) {
    const _at387 = cl.block.at[_k386];
    if (!(((g[_at387] || -1) === 3))) return false;
  }
  for (let _k389 = 0; _k389 < cl.length.at.length; _k389++) {
    const _at390 = cl.length.at[_k389];
    const _v391 = cl.length.v[_k389];
    _g392.length = 0;
    G393: {
      const _a396 = sp.lineCells[sp.rowOf[_at390]];
      for (let _i397 = 0; _i397 < _a396.length; _i397++) {
        const v_x = _a396[_i397];
        const _h398 = (g[v_x] || -1);
        if (!((_h398 === 1))) continue;
        _g392.push(v_x);
      }
    }
    _g399.length = 0;
    G400: {
      const _a403 = sp.lineCells[sp.colOf[_at390]];
      for (let _i404 = 0; _i404 < _a403.length; _i404++) {
        const v_x = _a403[_i404];
        const _h405 = (g[v_x] || -1);
        if (!((_h405 === 2))) continue;
        _g399.push(v_x);
      }
    }
    if (!((union(stretch(sp.lineCells[sp.rowOf[_at390]], _at390, _g392), stretch(sp.lineCells[sp.colOf[_at390]], _at390, _g399)).length === _v391))) return false;
  }
  for (let _k406 = 0; _k406 < cl.joins.at.length; _k406++) {
    const _at407 = cl.joins.at[_k406];
    const _v408 = cl.joins.v[_k406];
    let _g409 = 0;
    G410: {
      const _a411 = sp.adj4[_at407];
      for (let _i412 = 0; _i412 < _a411.length; _i412++) {
        const v_p = _a411[_i412];
        const _h413 = (g[v_p] || -1);
        if (!((((_h413 === 1) && (((v_p / sp.w) | 0) === ((_at407 / sp.w) | 0))) || ((_h413 === 2) && ((v_p % sp.w) === (_at407 % sp.w)))))) continue;
        _g409++;
      }
    }
    if (!((_g409 === _v408))) return false;
  }
  return true;
}

export interface OverConnectedBinding {
  b: number;
  n: number;
}

const overConnectedFacts: number[] = [];
let overConnectedCands = new Int32Array(0);

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

export function unreachable(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UnreachableBinding> | null): number {
  const _g225: number[] = [];
  const _g247: number[] = [];
  const _g257: number[] = [];
  const _g279: number[] = [];
  const _g298: number[] = [];
  const _g319: number[] = [];
  const _g329: number[] = [];
  const _g350: number[] = [];
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
    const _h243 = sp.rowOf[v_k];
    const _h275 = sp.colOf[v_k];
    L164: {
      const v_v = _h163;
      if (!((v_v >= 0))) break L164;
      facts.length = 0;
      changed = false;
      let _c289: boolean = !((b.grid[v_k] !== 0));
      if (!_c289) {
        _g225.length = 0;
        G226: {
          const _a241 = sp.lineCells[sp.rowOf[v_k]];
          for (let _i242 = 0; _i242 < _a241.length; _i242++) {
            const v_x = _a241[_i242];
            const _h244 = clueAt(cl.block, v_x);
            let _c256: boolean = ((_h244 < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 1)));
            if (_c256) {
              let _q245 = true;
              Q246: {
                _g247.length = 0;
                G248: {
                  const _a251 = sp.lineCells[_h243];
                  for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                    const v_z = _a251[_i252];
                    if (!((((b.grid[v_z] || -1) === 1) || (v_z === v_x)))) continue;
                    _g247.push(v_z);
                  }
                }
                const _a253 = stretch(sp.lineCells[_h243], v_x, _g247);
                for (let _i254 = 0; _i254 < _a253.length; _i254++) {
                  const v_y = _a253[_i254];
                  const _h255 = clueAt(cl.length, v_y);
                  if (!(((v_y === v_k) || !((_h255 >= 0))))) {
                    _q245 = false;
                    break Q246;
                  }
                }
              }
              _c256 = _q245;
            }
            if (!(_c256)) continue;
            _g225.push(v_x);
          }
        }
        _g257.length = 0;
        G258: {
          const _a273 = sp.lineCells[sp.colOf[v_k]];
          for (let _i274 = 0; _i274 < _a273.length; _i274++) {
            const v_x = _a273[_i274];
            const _h276 = clueAt(cl.block, v_x);
            let _c288: boolean = ((_h276 < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 2)));
            if (_c288) {
              let _q277 = true;
              Q278: {
                _g279.length = 0;
                G280: {
                  const _a283 = sp.lineCells[_h275];
                  for (let _i284 = 0; _i284 < _a283.length; _i284++) {
                    const v_z = _a283[_i284];
                    if (!((((b.grid[v_z] || -1) === 2) || (v_z === v_x)))) continue;
                    _g279.push(v_z);
                  }
                }
                const _a285 = stretch(sp.lineCells[_h275], v_x, _g279);
                for (let _i286 = 0; _i286 < _a285.length; _i286++) {
                  const v_y = _a285[_i286];
                  const _h287 = clueAt(cl.length, v_y);
                  if (!(((v_y === v_k) || !((_h287 >= 0))))) {
                    _q277 = false;
                    break Q278;
                  }
                }
              }
              _c288 = _q277;
            }
            if (!(_c288)) continue;
            _g257.push(v_x);
          }
        }
        _c289 = ((stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g225).length + stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g257).length) >= v_v);
      }
      let _c362: boolean = _c289;
      if (_c362) {
        let _q290 = true;
        Q291: {
          const _a292 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i293 = 0; _i293 < _a292.length; _i293++) {
            const v_c = _a292[_i293];
            const _h294 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h294 < 0)))) continue;
            for (let _m295 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m295 !== 0; _m295 &= _m295 - 1) {
              const v_a = 31 - Math.clz32(_m295 & -_m295);
              const _wc296 = v_c;
              const _wd297 = v_a;
              let _c360: boolean = (v_k === _wc296 ? true : (b.grid[v_k] !== 0));
              if (_c360) {
                _g298.length = 0;
                G299: {
                  const _a314 = sp.lineCells[_h243];
                  for (let _i315 = 0; _i315 < _a314.length; _i315++) {
                    const v_x = _a314[_i315];
                    const _h316 = clueAt(cl.block, v_x);
                    let _c328: boolean = ((_h316 < 0) && (!((v_x === _wc296 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc296 ? _wd297 : (b.grid[v_x] || -1)) === 1)));
                    if (_c328) {
                      let _q317 = true;
                      Q318: {
                        _g319.length = 0;
                        G320: {
                          const _a323 = sp.lineCells[_h243];
                          for (let _i324 = 0; _i324 < _a323.length; _i324++) {
                            const v_z = _a323[_i324];
                            if (!((((v_z === _wc296 ? _wd297 : (b.grid[v_z] || -1)) === 1) || (v_z === v_x)))) continue;
                            _g319.push(v_z);
                          }
                        }
                        const _a325 = stretch(sp.lineCells[_h243], v_x, _g319);
                        for (let _i326 = 0; _i326 < _a325.length; _i326++) {
                          const v_y = _a325[_i326];
                          const _h327 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h327 >= 0))))) {
                            _q317 = false;
                            break Q318;
                          }
                        }
                      }
                      _c328 = _q317;
                    }
                    if (!(_c328)) continue;
                    _g298.push(v_x);
                  }
                }
                _g329.length = 0;
                G330: {
                  const _a345 = sp.lineCells[_h275];
                  for (let _i346 = 0; _i346 < _a345.length; _i346++) {
                    const v_x = _a345[_i346];
                    const _h347 = clueAt(cl.block, v_x);
                    let _c359: boolean = ((_h347 < 0) && (!((v_x === _wc296 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc296 ? _wd297 : (b.grid[v_x] || -1)) === 2)));
                    if (_c359) {
                      let _q348 = true;
                      Q349: {
                        _g350.length = 0;
                        G351: {
                          const _a354 = sp.lineCells[_h275];
                          for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                            const v_z = _a354[_i355];
                            if (!((((v_z === _wc296 ? _wd297 : (b.grid[v_z] || -1)) === 2) || (v_z === v_x)))) continue;
                            _g350.push(v_z);
                          }
                        }
                        const _a356 = stretch(sp.lineCells[_h275], v_x, _g350);
                        for (let _i357 = 0; _i357 < _a356.length; _i357++) {
                          const v_y = _a356[_i357];
                          const _h358 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h358 >= 0))))) {
                            _q348 = false;
                            break Q349;
                          }
                        }
                      }
                      _c359 = _q348;
                    }
                    if (!(_c359)) continue;
                    _g329.push(v_x);
                  }
                }
                _c360 = ((stretch(sp.lineCells[_h243], v_k, _g298).length + stretch(sp.lineCells[_h275], v_k, _g329).length) < v_v);
              }
              if (!(_c360)) continue;
              const _t361 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t361); changed = true; } else facts.push(PLACE, v_c, _t361); }
              if (!(true)) {
                _q290 = false;
                break Q291;
              }
            }
          }
        }
        _c362 = _q290;
      }
      if (!(_c362)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, v: v_v }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
