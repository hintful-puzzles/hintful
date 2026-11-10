// Compiled by `npm run describe` from src/games/sticks/sticks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, staleChecking, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!(((v_d === 3) === (clueAt(cl.block, v_c) >= 0)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g7: number[] = [];
  const _g14: number[] = [];
  const _g30: number[] = [];
  const _g37: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _g5 = 0;
      G6: {
        _g7.length = 0;
        G8: {
          const _a11 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_x = _a11[_i12];
            const _h13 = (g[v_x] || -1);
            if (!((_h13 === 1))) continue;
            _g7.push(v_x);
          }
        }
        _g14.length = 0;
        G15: {
          const _a18 = sp.lineCells[sp.colOf[v_c]];
          for (let _i19 = 0; _i19 < _a18.length; _i19++) {
            const v_x = _a18[_i19];
            const _h20 = (g[v_x] || -1);
            if (!((_h20 === 2))) continue;
            _g14.push(v_x);
          }
        }
        const _a21 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g7), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g14));
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_k = _a21[_i22];
          const _h23 = clueAt(cl.length, v_k);
          if (!((_h23 >= 0))) continue;
          _g5++;
        }
      }
      if (!((_g5 <= 1))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k24 = 0; _k24 < cl.block.at.length; _k24++) {
    const _at25 = cl.block.at[_k24];
    if (!(((g[_at25] || -1) === 3))) return false;
  }
  for (let _k27 = 0; _k27 < cl.length.at.length; _k27++) {
    const _at28 = cl.length.at[_k27];
    const _v29 = cl.length.v[_k27];
    _g30.length = 0;
    G31: {
      const _a34 = sp.lineCells[sp.rowOf[_at28]];
      for (let _i35 = 0; _i35 < _a34.length; _i35++) {
        const v_x = _a34[_i35];
        const _h36 = (g[v_x] || -1);
        if (!((_h36 === 1))) continue;
        _g30.push(v_x);
      }
    }
    _g37.length = 0;
    G38: {
      const _a41 = sp.lineCells[sp.colOf[_at28]];
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_x = _a41[_i42];
        const _h43 = (g[v_x] || -1);
        if (!((_h43 === 2))) continue;
        _g37.push(v_x);
      }
    }
    if (!((union(stretch(sp.lineCells[sp.rowOf[_at28]], _at28, _g30), stretch(sp.lineCells[sp.colOf[_at28]], _at28, _g37)).length === _v29))) return false;
  }
  for (let _k44 = 0; _k44 < cl.joins.at.length; _k44++) {
    const _at45 = cl.joins.at[_k44];
    const _v46 = cl.joins.v[_k44];
    let _g47 = 0;
    G48: {
      const _a49 = sp.adj4[_at45];
      for (let _i50 = 0; _i50 < _a49.length; _i50++) {
        const v_p = _a49[_i50];
        const _h51 = (g[v_p] || -1);
        if (!((((_h51 === 1) && (((v_p / sp.w) | 0) === ((_at45 / sp.w) | 0))) || ((_h51 === 2) && ((v_p % sp.w) === (_at45 % sp.w)))))) continue;
        _g47++;
      }
    }
    if (!((_g47 === _v46))) return false;
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
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_b = _a4[_i5];
    const _h6 = clueAt(cl.joins, v_b);
    const _h12 = ((v_b / sp.w) | 0);
    const _h13 = (v_b % sp.w);
    L7: {
      const v_n = _h6;
      if (!((v_n >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("overConnected", [(sp.cells.includes(v_b)), (v_n === clueAt(cl.joins, v_b)), (v_n >= 0)], ["b in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _g8 = 0;
      G9: {
        const _a10 = sp.adj4[v_b];
        for (let _i11 = 0; _i11 < _a10.length; _i11++) {
          const v_p = _a10[_i11];
          if (!(((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h12)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h13))))) continue;
          _g8++;
        }
      }
      let _c27: boolean = (_g8 <= v_n);
      if (_c27) {
        let _q14 = true;
        Q15: {
          const _a16 = sp.adj4[v_b];
          for (let _i17 = 0; _i17 < _a16.length; _i17++) {
            const v_c = _a16[_i17];
            const _h18 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h18 < 0)))) continue;
            for (let _m19 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m19 !== 0; _m19 &= _m19 - 1) {
              const v_a = 31 - Math.clz32(_m19 & -_m19);
              const _wc20 = v_c;
              const _wd21 = v_a;
              let _g22 = 0;
              G23: {
                const _a24 = sp.adj4[v_b];
                for (let _i25 = 0; _i25 < _a24.length; _i25++) {
                  const v_p = _a24[_i25];
                  if (!(((((v_p === _wc20 ? _wd21 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h12)) || (((v_p === _wc20 ? _wd21 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h13))))) continue;
                  _g22++;
                }
              }
              if (!((_g22 > v_n))) continue;
              const _t26 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t26); changed = true; } else facts.push(PLACE, v_c, _t26); }
              if (!(true)) {
                _q14 = false;
                break Q15;
              }
            }
          }
        }
        _c27 = _q14;
      }
      if (!(_c27)) return -1;
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
  const _g8: number[] = [];
  const _g14: number[] = [];
  const _g34: number[] = [];
  const _g41: number[] = [];
  const facts = twoCluesFacts;
  let fired = 0;
  let changed = false;
  if (twoCluesCands.length < sp.cells.length) twoCluesCands = new Int32Array(sp.cells.length);
  const cands = twoCluesCands;
  cands.fill(-1);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_k = _a3[_i4];
    const _h5 = clueAt(cl.length, v_k);
    if (!((_h5 >= 0))) continue;
    const _h33 = sp.rowOf[v_k];
    const _h40 = sp.colOf[v_k];
    if (DEV && staleChecking) {
      freshBinding("twoClues", [(sp.cells.includes(v_k)), (clueAt(cl.length, v_k) >= 0)], ["k in", "where of k"]);
    }
    facts.length = 0;
    changed = false;
    let _g6 = 0;
    G7: {
      _g8.length = 0;
      G9: {
        const _a12 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_x = _a12[_i13];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g8.push(v_x);
        }
      }
      _g14.length = 0;
      G15: {
        const _a18 = sp.lineCells[sp.colOf[v_k]];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_x = _a18[_i19];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g14.push(v_x);
        }
      }
      const _a20 = union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g8), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g14));
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_j = _a20[_i21];
        const _h22 = clueAt(cl.length, v_j);
        if (!((_h22 >= 0))) continue;
        _g6++;
      }
    }
    let _c51: boolean = (_g6 <= 1);
    if (_c51) {
      let _q23 = true;
      Q24: {
        const _a25 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_c = _a25[_i26];
          const _h27 = clueAt(cl.block, v_c);
          if (!((!((b.grid[v_c] !== 0)) && (_h27 < 0)))) continue;
          for (let _m28 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m28 !== 0; _m28 &= _m28 - 1) {
            const v_a = 31 - Math.clz32(_m28 & -_m28);
            const _wc29 = v_c;
            const _wd30 = v_a;
            let _g31 = 0;
            G32: {
              _g34.length = 0;
              G35: {
                const _a38 = sp.lineCells[_h33];
                for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                  const v_x = _a38[_i39];
                  if (!(((v_x === _wc29 ? _wd30 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g34.push(v_x);
                }
              }
              _g41.length = 0;
              G42: {
                const _a45 = sp.lineCells[_h40];
                for (let _i46 = 0; _i46 < _a45.length; _i46++) {
                  const v_x = _a45[_i46];
                  if (!(((v_x === _wc29 ? _wd30 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g41.push(v_x);
                }
              }
              const _a47 = union(stretch(sp.lineCells[_h33], v_k, _g34), stretch(sp.lineCells[_h40], v_k, _g41));
              for (let _i48 = 0; _i48 < _a47.length; _i48++) {
                const v_j = _a47[_i48];
                const _h49 = clueAt(cl.length, v_j);
                if (!((_h49 >= 0))) continue;
                _g31++;
              }
            }
            if (!((_g31 > 1))) continue;
            const _t50 = (3 - v_a);
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t50); changed = true; } else facts.push(PLACE, v_c, _t50); }
            if (!(true)) {
              _q23 = false;
              break Q24;
            }
          }
        }
      }
      _c51 = _q23;
    }
    if (!(_c51)) return -1;
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
  const _g8: number[] = [];
  const _g14: number[] = [];
  const _g29: number[] = [];
  const _g36: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  if (tooLongCands.length < sp.cells.length) tooLongCands = new Int32Array(sp.cells.length);
  const cands = tooLongCands;
  cands.fill(-1);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_k = _a4[_i5];
    const _h6 = clueAt(cl.length, v_k);
    const _h28 = sp.rowOf[v_k];
    const _h35 = sp.colOf[v_k];
    L7: {
      const v_v = _h6;
      if (!((v_v >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("tooLong", [(sp.cells.includes(v_k)), (v_v === clueAt(cl.length, v_k)), (v_v >= 0)], ["k in", "v =", "where of v"]);
      }
      facts.length = 0;
      changed = false;
      _g8.length = 0;
      G9: {
        const _a12 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_x = _a12[_i13];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g8.push(v_x);
        }
      }
      _g14.length = 0;
      G15: {
        const _a18 = sp.lineCells[sp.colOf[v_k]];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_x = _a18[_i19];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g14.push(v_x);
        }
      }
      let _c43: boolean = (union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g8), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g14)).length <= v_v);
      if (_c43) {
        let _q20 = true;
        Q21: {
          const _a22 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_c = _a22[_i23];
            const _h24 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h24 < 0)))) continue;
            for (let _m25 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m25 !== 0; _m25 &= _m25 - 1) {
              const v_a = 31 - Math.clz32(_m25 & -_m25);
              const _wc26 = v_c;
              const _wd27 = v_a;
              _g29.length = 0;
              G30: {
                const _a33 = sp.lineCells[_h28];
                for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                  const v_x = _a33[_i34];
                  if (!(((v_x === _wc26 ? _wd27 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g29.push(v_x);
                }
              }
              _g36.length = 0;
              G37: {
                const _a40 = sp.lineCells[_h35];
                for (let _i41 = 0; _i41 < _a40.length; _i41++) {
                  const v_x = _a40[_i41];
                  if (!(((v_x === _wc26 ? _wd27 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g36.push(v_x);
                }
              }
              if (!((union(stretch(sp.lineCells[_h28], v_k, _g29), stretch(sp.lineCells[_h35], v_k, _g36)).length > v_v))) continue;
              const _t42 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t42); changed = true; } else facts.push(PLACE, v_c, _t42); }
              if (!(true)) {
                _q20 = false;
                break Q21;
              }
            }
          }
        }
        _c43 = _q20;
      }
      if (!(_c43)) return -1;
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
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_b = _a4[_i5];
    const _h6 = clueAt(cl.joins, v_b);
    const _h13 = ((v_b / sp.w) | 0);
    const _h14 = (v_b % sp.w);
    L7: {
      const v_n = _h6;
      if (!((v_n >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("starved", [(sp.cells.includes(v_b)), (v_n === clueAt(cl.joins, v_b)), (v_n >= 0)], ["b in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _g8 = 0;
      G9: {
        const _a10 = sp.adj4[v_b];
        for (let _i11 = 0; _i11 < _a10.length; _i11++) {
          const v_p = _a10[_i11];
          const _h12 = clueAt(cl.block, v_p);
          if (!(((_h12 < 0) && (!((b.grid[v_p] !== 0)) || ((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h13)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h14))))))) continue;
          _g8++;
        }
      }
      let _c29: boolean = (_g8 >= v_n);
      if (_c29) {
        let _q15 = true;
        Q16: {
          const _a17 = sp.adj4[v_b];
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_c = _a17[_i18];
            const _h19 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h19 < 0)))) continue;
            for (let _m20 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m20 !== 0; _m20 &= _m20 - 1) {
              const v_a = 31 - Math.clz32(_m20 & -_m20);
              const _wc21 = v_c;
              const _wd22 = v_a;
              let _g23 = 0;
              G24: {
                const _a25 = sp.adj4[v_b];
                for (let _i26 = 0; _i26 < _a25.length; _i26++) {
                  const v_p = _a25[_i26];
                  const _h27 = clueAt(cl.block, v_p);
                  if (!(((_h27 < 0) && (!((v_p === _wc21 ? true : (b.grid[v_p] !== 0))) || ((((v_p === _wc21 ? _wd22 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h13)) || (((v_p === _wc21 ? _wd22 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h14))))))) continue;
                  _g23++;
                }
              }
              if (!((_g23 < v_n))) continue;
              const _t28 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t28); changed = true; } else facts.push(PLACE, v_c, _t28); }
              if (!(true)) {
                _q15 = false;
                break Q16;
              }
            }
          }
        }
        _c29 = _q15;
      }
      if (!(_c29)) return -1;
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
  const _g17: number[] = [];
  const _g38: number[] = [];
  const _g49: number[] = [];
  const _g70: number[] = [];
  const facts = unreachableFacts;
  let fired = 0;
  let changed = false;
  if (unreachableCands.length < sp.cells.length) unreachableCands = new Int32Array(sp.cells.length);
  const cands = unreachableCands;
  cands.fill(-1);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_k = _a4[_i5];
    const _h6 = clueAt(cl.length, v_k);
    const _h16 = sp.rowOf[v_k];
    const _h48 = sp.colOf[v_k];
    L7: {
      const v_v = _h6;
      if (!((v_v >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("unreachable", [(sp.cells.includes(v_k)), (v_v === clueAt(cl.length, v_k)), (v_v >= 0)], ["k in", "v =", "where of v"]);
      }
      facts.length = 0;
      changed = false;
      let _c82: boolean = (!((b.grid[v_k] !== 0)) || (reach(b, sp, cl, v_k) >= v_v));
      if (_c82) {
        let _q8 = true;
        Q9: {
          const _a10 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i11 = 0; _i11 < _a10.length; _i11++) {
            const v_c = _a10[_i11];
            const _h12 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h12 < 0)))) continue;
            for (let _m13 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m13 !== 0; _m13 &= _m13 - 1) {
              const v_a = 31 - Math.clz32(_m13 & -_m13);
              const _wc14 = v_c;
              const _wd15 = v_a;
              let _c80: boolean = (v_k === _wc14 ? true : (b.grid[v_k] !== 0));
              if (_c80) {
                _g17.length = 0;
                G18: {
                  const _a33 = sp.lineCells[_h16];
                  for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                    const v_x = _a33[_i34];
                    const _h35 = clueAt(cl.block, v_x);
                    let _c47: boolean = ((_h35 < 0) && (!((v_x === _wc14 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc14 ? _wd15 : (b.grid[v_x] || -1)) === 1)));
                    if (_c47) {
                      let _q36 = true;
                      Q37: {
                        _g38.length = 0;
                        G39: {
                          const _a42 = sp.lineCells[_h16];
                          for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                            const v_z = _a42[_i43];
                            if (!((((v_z === _wc14 ? _wd15 : (b.grid[v_z] || -1)) === 1) || (v_z === v_x)))) continue;
                            _g38.push(v_z);
                          }
                        }
                        const _a44 = stretch(sp.lineCells[_h16], v_x, _g38);
                        for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                          const v_y = _a44[_i45];
                          const _h46 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h46 >= 0))))) {
                            _q36 = false;
                            break Q37;
                          }
                        }
                      }
                      _c47 = _q36;
                    }
                    if (!(_c47)) continue;
                    _g17.push(v_x);
                  }
                }
                _g49.length = 0;
                G50: {
                  const _a65 = sp.lineCells[_h48];
                  for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                    const v_x = _a65[_i66];
                    const _h67 = clueAt(cl.block, v_x);
                    let _c79: boolean = ((_h67 < 0) && (!((v_x === _wc14 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc14 ? _wd15 : (b.grid[v_x] || -1)) === 2)));
                    if (_c79) {
                      let _q68 = true;
                      Q69: {
                        _g70.length = 0;
                        G71: {
                          const _a74 = sp.lineCells[_h48];
                          for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                            const v_z = _a74[_i75];
                            if (!((((v_z === _wc14 ? _wd15 : (b.grid[v_z] || -1)) === 2) || (v_z === v_x)))) continue;
                            _g70.push(v_z);
                          }
                        }
                        const _a76 = stretch(sp.lineCells[_h48], v_x, _g70);
                        for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                          const v_y = _a76[_i77];
                          const _h78 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h78 >= 0))))) {
                            _q68 = false;
                            break Q69;
                          }
                        }
                      }
                      _c79 = _q68;
                    }
                    if (!(_c79)) continue;
                    _g49.push(v_x);
                  }
                }
                _c80 = ((stretch(sp.lineCells[_h16], v_k, _g17).length + stretch(sp.lineCells[_h48], v_k, _g49).length) < v_v);
              }
              if (!(_c80)) continue;
              const _t81 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t81); changed = true; } else facts.push(PLACE, v_c, _t81); }
              if (!(true)) {
                _q8 = false;
                break Q9;
              }
            }
          }
        }
        _c82 = _q8;
      }
      if (!(_c82)) return -1;
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
  const _g1: number[] = [];
  G2: {
    const _a17 = sp.lineCells[sp.rowOf[v_k]];
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_x = _a17[_i18];
      const _t19 = sp.rowOf[v_k];
      let _c30: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 1)));
      if (_c30) {
        let _q20 = true;
        Q21: {
          const _g22: number[] = [];
          G23: {
            const _a26 = sp.lineCells[_t19];
            for (let _i27 = 0; _i27 < _a26.length; _i27++) {
              const v_z = _a26[_i27];
              if (!((((b.grid[v_z] || -1) === 1) || (v_z === v_x)))) continue;
              _g22.push(v_z);
            }
          }
          const _a28 = stretch(sp.lineCells[_t19], v_x, _g22);
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_y = _a28[_i29];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q20 = false;
              break Q21;
            }
          }
        }
        _c30 = _q20;
      }
      if (!(_c30)) continue;
      _g1.push(v_x);
    }
  }
  const _g31: number[] = [];
  G32: {
    const _a47 = sp.lineCells[sp.colOf[v_k]];
    for (let _i48 = 0; _i48 < _a47.length; _i48++) {
      const v_x = _a47[_i48];
      const _t49 = sp.colOf[v_k];
      let _c60: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 2)));
      if (_c60) {
        let _q50 = true;
        Q51: {
          const _g52: number[] = [];
          G53: {
            const _a56 = sp.lineCells[_t49];
            for (let _i57 = 0; _i57 < _a56.length; _i57++) {
              const v_z = _a56[_i57];
              if (!((((b.grid[v_z] || -1) === 2) || (v_z === v_x)))) continue;
              _g52.push(v_z);
            }
          }
          const _a58 = stretch(sp.lineCells[_t49], v_x, _g52);
          for (let _i59 = 0; _i59 < _a58.length; _i59++) {
            const v_y = _a58[_i59];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q50 = false;
              break Q51;
            }
          }
        }
        _c60 = _q50;
      }
      if (!(_c60)) continue;
      _g31.push(v_x);
    }
  }
  const _made = (stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g1).length + stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g31).length);
  _kept[v_k] = _made;
  return _made;
}
