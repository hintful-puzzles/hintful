// Compiled by `npm run describe` from src/games/tents/tents.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, addOnce, cellsValued, clueAt, freshBinding, keptStore, matched, sameSet, staleChecking, stamps, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  tree: ClueList;
  count: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "tentLink" | "noTree" | "treesDone" | "nextToTent" | "treeSingle" | "treeLink" | "treeDiagonal" | "lineCount" | "lineNeighbors";

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
  { id: "tentLink", tier: 0 },
  { id: "noTree", tier: 0 },
  { id: "treesDone", tier: 0 },
  { id: "nextToTent", tier: 0 },
  { id: "treeSingle", tier: 0 },
  { id: "treeLink", tier: 0 },
  { id: "treeDiagonal", tier: 1 },
  { id: "lineCount", tier: 0 },
  { id: "lineNeighbors", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!(((v_d === 3) === (clueAt(cl.tree, v_c) >= 0)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g11: number[] = [];
  const _g18: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_a = _a3[_i4];
      const _h5 = (g[v_a] || -1);
      if (!((_h5 === 1))) continue;
      let _q6 = true;
      Q7: {
        const _a8 = sp.adj8[v_a];
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_b = _a8[_i9];
          const _h10 = (g[v_b] || -1);
          if (!((_h10 !== 1))) {
            _q6 = false;
            break Q7;
          }
        }
      }
      if (!(_q6)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  _g11.length = 0;
  G12: {
    const _a15 = sp.cells;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_c = _a15[_i16];
      const _h17 = (g[v_c] || -1);
      if (!((_h17 === 1))) continue;
      _g11.push(v_c);
    }
  }
  _g18.length = 0;
  G19: {
    const _a22 = sp.cells;
    for (let _i23 = 0; _i23 < _a22.length; _i23++) {
      const v_c = _a22[_i23];
      const _h24 = (g[v_c] || -1);
      if (!((_h24 === 3))) continue;
      _g18.push(v_c);
    }
  }
  if (!(matched(sp, _g11, _g18))) return false;
  for (let _k25 = 0; _k25 < cl.tree.at.length; _k25++) {
    const _at26 = cl.tree.at[_k25];
    if (!(((g[_at26] || -1) === 3))) return false;
  }
  for (let _k28 = 0; _k28 < cl.count.at.length; _k28++) {
    const _at29 = cl.count.at[_k28];
    const _v30 = cl.count.v[_k28];
    let _g31 = 0;
    G32: {
      const _a33 = sp.lineCells[_at29];
      for (let _i34 = 0; _i34 < _a33.length; _i34++) {
        const v_c = _a33[_i34];
        const _h35 = (g[v_c] || -1);
        if (!((_h35 === 1))) continue;
        _g31++;
      }
    }
    if (!((_g31 === _v30))) return false;
  }
  return true;
}

export interface TentLinkBinding {
  c: number;
  K: readonly number[];
}

const tentLinkFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function tentLink(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TentLinkBinding> | null): number {
  const facts = tentLinkFacts;
  let fired = 0;
  let changed = false;
  const _a4 = cellsValued(b, sp.cells, 1);
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_c = _a4[_i5];
    const _h6 = (b.grid[v_c] || -1);
    if (!(((_h6 === 1) && (b.markOf(v_c) === -1)))) continue;
    L7: {
      const v_K = free(b, sp, cl, v_c);
      const _h8 = v_K.length;
      if (!((_h8 < 2))) break L7;
      if (DEV && staleChecking) {
        freshBinding("tentLink", [(sp.cells.includes(v_c)), (((b.grid[v_c] || -1) === 1) && (b.markOf(v_c) === -1)), sameSet(v_K, free(b, sp, cl, v_c)), (v_K.length < 2)], ["c in", "where of c", "K =", "where of K"]);
      }
      facts.length = 0;
      changed = false;
      let _c14: boolean = (_h8 > 0);
      if (_c14) {
        let _q9 = true;
        Q10: {
          const _a11 = v_K;
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_q = _a11[_i12];
            let _mk13 = v_c >= 0;
            if (_mk13) { const _was = b.markOf(v_c); if (_was >= 0) _mk13 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            if (!(_mk13)) {
              _q9 = false;
              break Q10;
            }
          }
        }
        _c14 = _q9;
      }
      if (!(_c14)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, K: v_K.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NoTreeBinding {
  S: readonly number[];
}

const noTreeFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function noTree(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NoTreeBinding> | null): number {
  const _g8: number[] = [];
  const facts = noTreeFacts;
  let fired = 0;
  let changed = false;
  const _k15 = treesKept.board(cl);
  _g8.length = 0;
  G9: {
    const _a12 = sp.cells;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_c = _a12[_i13];
      const _h14 = clueAt(cl.tree, v_c);
      if (!(((!((b.grid[v_c] !== 0)) && (_h14 < 0)) && ((_k15[v_c] ?? trees(sp, cl, v_c)).length === 0)))) continue;
      _g8.push(v_c);
    }
  }
  L16: {
    const v_S = _g8;
    const _h17 = v_S.length;
    if (!((_h17 > 0))) break L16;
    if (DEV && staleChecking) {
      const _g18: number[] = [];
      G19: {
        const _a22 = sp.cells;
        for (let _i23 = 0; _i23 < _a22.length; _i23++) {
          const v_c = _a22[_i23];
          if (!(((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)) && (trees(sp, cl, v_c).length === 0)))) continue;
          _g18.push(v_c);
        }
      }
      freshBinding("noTree", [sameSet(v_S, _g18), (v_S.length > 0)], ["S =", "where of S"]);
    }
    facts.length = 0;
    changed = false;
    let _q24 = true;
    Q25: {
      const _a26 = v_S;
      for (let _i27 = 0; _i27 < _a26.length; _i27++) {
        const v_c = _a26[_i27];
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        if (!(true)) {
          _q24 = false;
          break Q25;
        }
      }
    }
    if (!(_q24)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ S: v_S.slice() }, facts)) return 1;
    }
  }
  return fired;
}

export interface TreesDoneBinding {
  q: number;
  S: readonly number[];
}

const treesDoneFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function treesDone(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TreesDoneBinding> | null): number {
  const _g16: number[] = [];
  const facts = treesDoneFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q12 = false;
    Q13: {
      const _a14 = sp.adj4[cl.tree.at[v_q]];
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_x = _a14[_i15];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q12 = true;
          break Q13;
        }
      }
    }
    if (!(_q12)) continue;
    _g16.length = 0;
    G17: {
      const _a20 = sp.adj4[cl.tree.at[v_q]];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        const _h22 = clueAt(cl.tree, v_c);
        if (!(((!((b.grid[v_c] !== 0)) && (_h22 < 0)) && (free(b, sp, cl, v_c).length === 0)))) continue;
        _g16.push(v_c);
      }
    }
    L23: {
      const v_S = _g16;
      const _h24 = v_S.length;
      if (!((_h24 > 0))) break L23;
      if (DEV && staleChecking) {
        let _q25 = false;
        Q26: {
          const _a27 = sp.adj4[cl.tree.at[v_q]];
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_x = _a27[_i28];
            if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
              _q25 = true;
              break Q26;
            }
          }
        }
        const _g29: number[] = [];
        G30: {
          const _a33 = sp.adj4[cl.tree.at[v_q]];
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!(((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)) && (free(b, sp, cl, v_c).length === 0)))) continue;
            _g29.push(v_c);
          }
        }
        freshBinding("treesDone", [_q25, sameSet(v_S, _g29), (v_S.length > 0)], ["where of q", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _q35 = true;
      Q36: {
        const _a37 = v_S;
        for (let _i38 = 0; _i38 < _a37.length; _i38++) {
          const v_c = _a37[_i38];
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q35 = false;
            break Q36;
          }
        }
      }
      if (!(_q35)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ q: v_q, S: v_S.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NextToTentBinding {
  t: number;
  S: readonly number[];
}

const nextToTentFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function nextToTent(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NextToTentBinding> | null): number {
  const _g12: number[] = [];
  const facts = nextToTentFacts;
  let fired = 0;
  let changed = false;
  const _a10 = cellsValued(b, sp.cells, 1);
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_t = _a10[_i11];
    if (!(((b.grid[v_t] || -1) === 1))) continue;
    _g12.length = 0;
    G13: {
      const _a16 = sp.adj8[v_t];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_x = _a16[_i17];
        const _h18 = clueAt(cl.tree, v_x);
        if (!((!((b.grid[v_x] !== 0)) && (_h18 < 0)))) continue;
        _g12.push(v_x);
      }
    }
    L19: {
      const v_S = _g12;
      const _h20 = v_S.length;
      if (!((_h20 > 0))) break L19;
      if (DEV && staleChecking) {
        const _g21: number[] = [];
        G22: {
          const _a25 = sp.adj8[v_t];
          for (let _i26 = 0; _i26 < _a25.length; _i26++) {
            const v_x = _a25[_i26];
            if (!((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)))) continue;
            _g21.push(v_x);
          }
        }
        freshBinding("nextToTent", [(sp.cells.includes(v_t)), ((b.grid[v_t] || -1) === 1), sameSet(v_S, _g21), (v_S.length > 0)], ["t in", "where of t", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _q27 = true;
      Q28: {
        const _a29 = sp.adj8[v_t];
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_x = _a29[_i30];
          if (!(((b.grid[v_x] || -1) !== 1))) {
            _q27 = false;
            break Q28;
          }
        }
      }
      let _c35: boolean = _q27;
      if (_c35) {
        let _q31 = true;
        Q32: {
          const _a33 = v_S;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_x = _a33[_i34];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q31 = false;
              break Q32;
            }
          }
        }
        _c35 = _q31;
      }
      if (!(_c35)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ t: v_t, S: v_S.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface TreeSingleBinding {
  q: number;
  R: readonly number[];
}

const treeSingleFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function treeSingle(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TreeSingleBinding> | null): number {
  const _g21: number[] = [];
  const facts = treeSingleFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q17 = false;
    Q18: {
      const _a19 = sp.adj4[cl.tree.at[v_q]];
      for (let _i20 = 0; _i20 < _a19.length; _i20++) {
        const v_x = _a19[_i20];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q17 = true;
          break Q18;
        }
      }
    }
    if (!(!(_q17))) continue;
    _g21.length = 0;
    G22: {
      const _a25 = sp.adj4[cl.tree.at[v_q]];
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_x = _a25[_i26];
        const _h27 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h27 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g21.push(v_x);
      }
    }
    L28: {
      const v_R = _g21;
      const _h29 = v_R.length;
      let _c35: boolean = (_h29 < 2);
      if (_c35) {
        let _q30 = true;
        Q31: {
          const _a32 = v_R;
          for (let _i33 = 0; _i33 < _a32.length; _i33++) {
            const v_x = _a32[_i33];
            const _h34 = clueAt(cl.tree, v_x);
            if (!((!((b.grid[v_x] !== 0)) && (_h34 < 0)))) {
              _q30 = false;
              break Q31;
            }
          }
        }
        _c35 = _q30;
      }
      if (!(_c35)) break L28;
      if (DEV && staleChecking) {
        let _q36 = false;
        Q37: {
          const _a38 = sp.adj4[cl.tree.at[v_q]];
          for (let _i39 = 0; _i39 < _a38.length; _i39++) {
            const v_x = _a38[_i39];
            if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
              _q36 = true;
              break Q37;
            }
          }
        }
        const _g40: number[] = [];
        G41: {
          const _a44 = sp.adj4[cl.tree.at[v_q]];
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            const v_x = _a44[_i45];
            if (!(((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
            _g40.push(v_x);
          }
        }
        let _c50: boolean = (v_R.length < 2);
        if (_c50) {
          let _q46 = true;
          Q47: {
            const _a48 = v_R;
            for (let _i49 = 0; _i49 < _a48.length; _i49++) {
              const v_x = _a48[_i49];
              if (!((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)))) {
                _q46 = false;
                break Q47;
              }
            }
          }
          _c50 = _q46;
        }
        freshBinding("treeSingle", [!(_q36), sameSet(v_R, _g40), _c50], ["where of q", "R =", "where of R"]);
      }
      facts.length = 0;
      changed = false;
      let _c57: boolean = (_h29 > 0);
      if (_c57) {
        let _q51 = true;
        Q52: {
          const _a53 = v_R;
          for (let _i54 = 0; _i54 < _a53.length; _i54++) {
            const v_x = _a53[_i54];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
            let _c56: boolean = true;
            if (_c56) {
              let _mk55 = v_x >= 0;
              if (_mk55) { const _was = b.markOf(v_x); if (_was >= 0) _mk55 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
              _c56 = _mk55;
            }
            if (!(_c56)) {
              _q51 = false;
              break Q52;
            }
          }
        }
        _c57 = _q51;
      }
      if (!(_c57)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ q: v_q, R: v_R.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface TreeLinkBinding {
  q: number;
  R: readonly number[];
  x: number;
}

const treeLinkFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function treeLink(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TreeLinkBinding> | null): number {
  const _g18: number[] = [];
  const facts = treeLinkFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q13 = false;
    Q14: {
      const _a15 = sp.adj4[cl.tree.at[v_q]];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_x = _a15[_i16];
        const _h17 = (b.grid[v_x] || -1);
        if (((b.markOf(v_x) === v_q) && (_h17 === 1))) {
          _q13 = true;
          break Q14;
        }
      }
    }
    if (!(!(_q13))) continue;
    _g18.length = 0;
    G19: {
      const _a22 = sp.adj4[cl.tree.at[v_q]];
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_x = _a22[_i23];
        const _h24 = (b.grid[v_x] !== 0);
        const _h25 = clueAt(cl.tree, v_x);
        const _h26 = (b.grid[v_x] || -1);
        if (!(((!(_h24) && (_h25 < 0)) || ((_h26 === 1) && (b.markOf(v_x) === -1))))) continue;
        _g18.push(v_x);
      }
    }
    L27: {
      const v_R = _g18;
      const _h28 = v_R.length;
      if (!((_h28 === 1))) break L27;
      L29: {
        const v_x = (v_R[0] ?? -1);
        const _h30 = (b.grid[v_x] || -1);
        if (!((_h30 === 1))) break L29;
        if (DEV && staleChecking) {
          let _q31 = false;
          Q32: {
            const _a33 = sp.adj4[cl.tree.at[v_q]];
            for (let _i34 = 0; _i34 < _a33.length; _i34++) {
              const v_x = _a33[_i34];
              if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
                _q31 = true;
                break Q32;
              }
            }
          }
          const _g35: number[] = [];
          G36: {
            const _a39 = sp.adj4[cl.tree.at[v_q]];
            for (let _i40 = 0; _i40 < _a39.length; _i40++) {
              const v_x = _a39[_i40];
              if (!(((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
              _g35.push(v_x);
            }
          }
          freshBinding("treeLink", [!(_q31), sameSet(v_R, _g35), (v_R.length === 1), (v_x === (v_R[0] ?? -1)), ((b.grid[v_x] || -1) === 1)], ["where of q", "R =", "where of R", "x =", "where of x"]);
        }
        facts.length = 0;
        changed = false;
        let _mk41 = v_x >= 0;
        if (_mk41) { const _was = b.markOf(v_x); if (_was >= 0) _mk41 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
        if (!(_mk41)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ q: v_q, R: v_R.slice(), x: v_x }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface TreeDiagonalBinding {
  q: number;
  R: readonly number[];
  a: number;
  b: number;
  z: number;
}

const treeDiagonalFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function treeDiagonal(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TreeDiagonalBinding> | null): number {
  const _g18: number[] = [];
  const facts = treeDiagonalFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q14 = false;
    Q15: {
      const _a16 = sp.adj4[cl.tree.at[v_q]];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_x = _a16[_i17];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q14 = true;
          break Q15;
        }
      }
    }
    if (!(!(_q14))) continue;
    _g18.length = 0;
    G19: {
      const _a22 = sp.adj4[cl.tree.at[v_q]];
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_x = _a22[_i23];
        const _h24 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h24 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g18.push(v_x);
      }
    }
    L25: {
      const v_R = _g18;
      const _h26 = v_R.length;
      if (!((_h26 === 2))) break L25;
      const v_a = (v_R[0] ?? -1);
      L27: {
        const v_b = (v_R[1] ?? -1);
        if (!((((v_a % sp.w) !== (v_b % sp.w)) && (((v_a / sp.w) | 0) !== ((v_b / sp.w) | 0))))) break L27;
        L28: {
          const v_z = (((((v_a / sp.w) | 0) + ((v_b / sp.w) | 0)) - ((cl.tree.at[v_q] / sp.w) | 0)) * sp.w + (((v_a % sp.w) + (v_b % sp.w)) - (cl.tree.at[v_q] % sp.w)));
          const _h29 = clueAt(cl.tree, v_z);
          if (!((!((b.grid[v_z] !== 0)) && (_h29 < 0)))) break L28;
          if (DEV && staleChecking) {
            let _q30 = false;
            Q31: {
              const _a32 = sp.adj4[cl.tree.at[v_q]];
              for (let _i33 = 0; _i33 < _a32.length; _i33++) {
                const v_x = _a32[_i33];
                if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
                  _q30 = true;
                  break Q31;
                }
              }
            }
            const _g34: number[] = [];
            G35: {
              const _a38 = sp.adj4[cl.tree.at[v_q]];
              for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                const v_x = _a38[_i39];
                if (!(((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
                _g34.push(v_x);
              }
            }
            freshBinding("treeDiagonal", [!(_q30), sameSet(v_R, _g34), (v_R.length === 2), (v_a === (v_R[0] ?? -1)), (v_b === (v_R[1] ?? -1)), (((v_a % sp.w) !== (v_b % sp.w)) && (((v_a / sp.w) | 0) !== ((v_b / sp.w) | 0))), (v_z === (((((v_a / sp.w) | 0) + ((v_b / sp.w) | 0)) - ((cl.tree.at[v_q] / sp.w) | 0)) * sp.w + (((v_a % sp.w) + (v_b % sp.w)) - (cl.tree.at[v_q] % sp.w)))), (!((b.grid[v_z] !== 0)) && (clueAt(cl.tree, v_z) < 0))], ["where of q", "R =", "where of R", "a =", "b =", "where of b", "z =", "where of z"]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_z] !== 0)) { if (fire === null) { b.placeAt(v_z, 2); changed = true; } else facts.push(PLACE, v_z, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ q: v_q, R: v_R.slice(), a: v_a, b: v_b, z: v_z }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LineCountBinding {
  L: number;
  k: number;
  O: readonly number[];
  T: readonly number[];
  G: readonly number[];
}

const lineCountFacts: number[] = [];
let lineCountCands = new Int32Array(0);
let lineCount_p163 = new Int32Array(0);
let lineCount_l164: readonly number[] = [];
let lineCount_f169 = new Int32Array(0);
let lineCount_l170: readonly number[] = [];
let lineCount_p217 = new Int32Array(0);
let lineCount_l218: readonly number[] = [];
let lineCount_f223 = new Int32Array(0);
let lineCount_l224: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function lineCount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineCountBinding> | null): number {
  const _g126: number[] = [];
  const _g135: number[] = [];
  if (lineCount_p163.length < sp.cells.length) lineCount_p163 = new Int32Array(sp.cells.length);
  else lineCount_p163.fill(0);
  lineCount_l164 = [];
  let _y165 = false;
  if (lineCount_f169.length < sp.cells.length) lineCount_f169 = new Int32Array(sp.cells.length).fill(-1);
  else lineCount_f169.fill(-1);
  lineCount_l170 = [];
  const _s171: number[] = [];
  const _g189: number[] = [];
  if (lineCount_p217.length < sp.cells.length) lineCount_p217 = new Int32Array(sp.cells.length);
  else lineCount_p217.fill(0);
  lineCount_l218 = [];
  let _y219 = false;
  if (lineCount_f223.length < sp.cells.length) lineCount_f223 = new Int32Array(sp.cells.length).fill(-1);
  else lineCount_f223.fill(-1);
  lineCount_l224 = [];
  const _s225: number[] = [];
  const facts = lineCountFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (lineCountCands.length < sp.cells.length) lineCountCands = new Int32Array(sp.cells.length);
  const cands = lineCountCands;
  cands.fill(-1);
  const _a119 = sp.lines;
  for (let _i120 = 0; _i120 < _a119.length; _i120++) {
    const v_L = _a119[_i120];
    const _h121 = clueAt(cl.count, v_L);
    let _g122 = 0;
    G123: {
      const _a124 = sp.lineCells[v_L];
      for (let _i125 = 0; _i125 < _a124.length; _i125++) {
        const v_c = _a124[_i125];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g122++;
      }
    }
    const v_k = (_h121 - _g122);
    _g126.length = 0;
    G127: {
      const _a130 = sp.lineCells[v_L];
      for (let _i131 = 0; _i131 < _a130.length; _i131++) {
        const v_c = _a130[_i131];
        const _h132 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h132 < 0)))) continue;
        _g126.push(v_c);
      }
    }
    L133: {
      const v_O = _g126;
      const _h134 = v_O.length;
      if (!((_h134 > 0))) break L133;
      let _g166 = -1;
      const _h177 = (2 * _h134);
      const _h178 = (_h177 - v_k);
      let _g220 = -1;
      _g135.length = 0;
      G136: {
        const _a161 = v_O;
        for (let _i162 = 0; _i162 < _a161.length; _i162++) {
          const v_x = _a161[_i162];
          if (_g166 !== _epoch) {
            _g166 = _epoch;
            for (const _e167 of lineCount_l164) lineCount_p163[_e167] = 0;
            _y165 = false;
            const _a168 = v_O;
            const _lo179 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi180 = 31 - Math.clz32(b.domain);
            for (const _e172 of lineCount_l170) lineCount_f169[_e172] = -1;
            lineCount_l170 = _a168;
            let _i174 = 0;
            _s171[0] = 0;
            let _o182 = _a168.length === 0;
            for (;;) {
              if (_a168.length === 0) {
                if (!_o182) break;
                _o182 = false;
              }
              while (_a168.length > 0 && _i174 >= 0) {
                const _e172 = _a168[_i174];
                if (_s171[_i174] > 0) lineCount_f169[_e172] = -1;
                let _r181 = (cands[_e172] >= 0 ? cands[_e172] : (cands[_e172] = b.cands[_e172])) & ~((2 << _s171[_i174]) - 1);
                let _d173 = 0;
                V176: for (; _r181 !== 0; _r181 &= _r181 - 1) {
                  _d173 = 31 - Math.clz32(_r181 & -_r181);
                  lineCount_f169[_e172] = _d173;
                  {
                    let _t183 = _d173;
                    for (let _j175 = 0; _j175 < _i174; _j175++) _t183 += lineCount_f169[_a168[_j175]];
                    if (_t183 + (_a168.length - _i174 - 1) * _lo179 > _h178) continue;
                    if (_t183 + (_a168.length - _i174 - 1) * _hi180 < _h178) continue;
                  }
                  for (let _j175 = 0; _j175 < _i174; _j175++) {
                    const _y184 = _a168[_j175];
                    if (!(!((((lineCount_f169[_e172] === 1) && (lineCount_f169[_y184] === 1)) && (sp.adj4[_e172].includes(_y184)))))) continue V176;
                  }
                  break;
                }
                if (_r181 === 0) {
                  _s171[_i174] = 0;
                  _i174--;
                  continue;
                }
                _s171[_i174] = _d173;
                if (_i174 === _a168.length - 1) break;
                _i174++;
                _s171[_i174] = 0;
              }
              if (_i174 < 0) break;
              let _g185 = 0;
              G186: {
                const _a187 = v_O;
                for (let _i188 = 0; _i188 < _a187.length; _i188++) {
                  const v_y = _a187[_i188];
                  _g185 += lineCount_f169[v_y];
                }
              }
              if (!((_g185 === _h178))) continue;
              if (!(true)) continue;
              lineCount_l164 = _a168;
              _y165 = true;
              for (const _e167 of _a168) lineCount_p163[_e167] |= 1 << lineCount_f169[_e167];
            }
          }
          if (!(((((lineCount_p163[v_x] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y165 && !v_O.includes(v_x))))) continue;
          _g135.push(v_x);
        }
      }
      const v_T = _g135;
      _g189.length = 0;
      G190: {
        const _a215 = v_O;
        for (let _i216 = 0; _i216 < _a215.length; _i216++) {
          const v_x = _a215[_i216];
          if (_g220 !== _epoch) {
            _g220 = _epoch;
            for (const _e221 of lineCount_l218) lineCount_p217[_e221] = 0;
            _y219 = false;
            const _a222 = v_O;
            const _lo231 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi232 = 31 - Math.clz32(b.domain);
            for (const _e226 of lineCount_l224) lineCount_f223[_e226] = -1;
            lineCount_l224 = _a222;
            let _i228 = 0;
            _s225[0] = 0;
            let _o234 = _a222.length === 0;
            for (;;) {
              if (_a222.length === 0) {
                if (!_o234) break;
                _o234 = false;
              }
              while (_a222.length > 0 && _i228 >= 0) {
                const _e226 = _a222[_i228];
                if (_s225[_i228] > 0) lineCount_f223[_e226] = -1;
                let _r233 = (cands[_e226] >= 0 ? cands[_e226] : (cands[_e226] = b.cands[_e226])) & ~((2 << _s225[_i228]) - 1);
                let _d227 = 0;
                V230: for (; _r233 !== 0; _r233 &= _r233 - 1) {
                  _d227 = 31 - Math.clz32(_r233 & -_r233);
                  lineCount_f223[_e226] = _d227;
                  {
                    let _t235 = _d227;
                    for (let _j229 = 0; _j229 < _i228; _j229++) _t235 += lineCount_f223[_a222[_j229]];
                    if (_t235 + (_a222.length - _i228 - 1) * _lo231 > _h178) continue;
                    if (_t235 + (_a222.length - _i228 - 1) * _hi232 < _h178) continue;
                  }
                  for (let _j229 = 0; _j229 < _i228; _j229++) {
                    const _y236 = _a222[_j229];
                    if (!(!((((lineCount_f223[_e226] === 1) && (lineCount_f223[_y236] === 1)) && (sp.adj4[_e226].includes(_y236)))))) continue V230;
                  }
                  break;
                }
                if (_r233 === 0) {
                  _s225[_i228] = 0;
                  _i228--;
                  continue;
                }
                _s225[_i228] = _d227;
                if (_i228 === _a222.length - 1) break;
                _i228++;
                _s225[_i228] = 0;
              }
              if (_i228 < 0) break;
              let _g237 = 0;
              G238: {
                const _a239 = v_O;
                for (let _i240 = 0; _i240 < _a239.length; _i240++) {
                  const v_y = _a239[_i240];
                  _g237 += lineCount_f223[v_y];
                }
              }
              if (!((_g237 === _h178))) continue;
              if (!(true)) continue;
              lineCount_l218 = _a222;
              _y219 = true;
              for (const _e221 of _a222) lineCount_p217[_e221] |= 1 << lineCount_f223[_e221];
            }
          }
          if (!(((((lineCount_p217[v_x] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y219 && !v_O.includes(v_x))))) continue;
          _g189.push(v_x);
        }
      }
      L241: {
        const v_G = _g189;
        let _q242 = false;
        Q243: {
          const _a244 = v_O;
          for (let _i245 = 0; _i245 < _a244.length; _i245++) {
            const v_x = _a244[_i245];
            if ((!(v_T.includes(v_x)) || !(v_G.includes(v_x)))) {
              _q242 = true;
              break Q243;
            }
          }
        }
        if (!(_q242)) break L241;
        if (DEV && staleChecking) {
          let _g246 = 0;
          G247: {
            const _a248 = sp.lineCells[v_L];
            for (let _i249 = 0; _i249 < _a248.length; _i249++) {
              const v_c = _a248[_i249];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g246++;
            }
          }
          const _g250: number[] = [];
          G251: {
            const _a254 = sp.lineCells[v_L];
            for (let _i255 = 0; _i255 < _a254.length; _i255++) {
              const v_c = _a254[_i255];
              if (!((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)))) continue;
              _g250.push(v_c);
            }
          }
          const _g256: number[] = [];
          G257: {
            const _a282 = v_O;
            for (let _i283 = 0; _i283 < _a282.length; _i283++) {
              const v_x = _a282[_i283];
              let _q284 = false;
              Q285: {
                const _f287 = new Int32Array(sp.cells.length).fill(-1);
                let _l288: readonly number[] = [];
                const _s289: number[] = [];
                const _a286 = v_O;
                const _t295 = ((2 * v_O.length) - v_k);
                const _lo296 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi297 = 31 - Math.clz32(b.domain);
                for (const _e290 of _l288) _f287[_e290] = -1;
                _l288 = _a286;
                let _i292 = 0;
                _s289[0] = 0;
                let _o299 = _a286.length === 0;
                for (;;) {
                  if (_a286.length === 0) {
                    if (!_o299) break;
                    _o299 = false;
                  }
                  while (_a286.length > 0 && _i292 >= 0) {
                    const _e290 = _a286[_i292];
                    if (_s289[_i292] > 0) _f287[_e290] = -1;
                    let _r298 = (cands[_e290] >= 0 ? cands[_e290] : (cands[_e290] = b.cands[_e290])) & ~((2 << _s289[_i292]) - 1);
                    let _d291 = 0;
                    V294: for (; _r298 !== 0; _r298 &= _r298 - 1) {
                      _d291 = 31 - Math.clz32(_r298 & -_r298);
                      _f287[_e290] = _d291;
                      if (_e290 === v_x && _d291 !== 1) continue;
                      {
                        let _t300 = _d291;
                        for (let _j293 = 0; _j293 < _i292; _j293++) _t300 += _f287[_a286[_j293]];
                        if (_t300 + (_a286.length - _i292 - 1) * _lo296 > _t295) continue;
                        if (_t300 + (_a286.length - _i292 - 1) * _hi297 < _t295) continue;
                      }
                      for (let _j293 = 0; _j293 < _i292; _j293++) {
                        const _y301 = _a286[_j293];
                        if (!(!((((_f287[_e290] === 1) && (_f287[_y301] === 1)) && (sp.adj4[_e290].includes(_y301)))))) continue V294;
                      }
                      break;
                    }
                    if (_r298 === 0) {
                      _s289[_i292] = 0;
                      _i292--;
                      continue;
                    }
                    _s289[_i292] = _d291;
                    if (_i292 === _a286.length - 1) break;
                    _i292++;
                    _s289[_i292] = 0;
                  }
                  if (_i292 < 0) break;
                  let _g302 = 0;
                  G303: {
                    const _a304 = v_O;
                    for (let _i305 = 0; _i305 < _a304.length; _i305++) {
                      const v_y = _a304[_i305];
                      _g302 += _f287[v_y];
                    }
                  }
                  if (!((_g302 === ((2 * v_O.length) - v_k)))) continue;
                  if (true) {
                    _q284 = true;
                    break Q285;
                  }
                }
              }
              if (!(_q284)) continue;
              _g256.push(v_x);
            }
          }
          const _g306: number[] = [];
          G307: {
            const _a332 = v_O;
            for (let _i333 = 0; _i333 < _a332.length; _i333++) {
              const v_x = _a332[_i333];
              let _q334 = false;
              Q335: {
                const _f337 = new Int32Array(sp.cells.length).fill(-1);
                let _l338: readonly number[] = [];
                const _s339: number[] = [];
                const _a336 = v_O;
                const _t345 = ((2 * v_O.length) - v_k);
                const _lo346 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi347 = 31 - Math.clz32(b.domain);
                for (const _e340 of _l338) _f337[_e340] = -1;
                _l338 = _a336;
                let _i342 = 0;
                _s339[0] = 0;
                let _o349 = _a336.length === 0;
                for (;;) {
                  if (_a336.length === 0) {
                    if (!_o349) break;
                    _o349 = false;
                  }
                  while (_a336.length > 0 && _i342 >= 0) {
                    const _e340 = _a336[_i342];
                    if (_s339[_i342] > 0) _f337[_e340] = -1;
                    let _r348 = (cands[_e340] >= 0 ? cands[_e340] : (cands[_e340] = b.cands[_e340])) & ~((2 << _s339[_i342]) - 1);
                    let _d341 = 0;
                    V344: for (; _r348 !== 0; _r348 &= _r348 - 1) {
                      _d341 = 31 - Math.clz32(_r348 & -_r348);
                      _f337[_e340] = _d341;
                      if (_e340 === v_x && _d341 !== 2) continue;
                      {
                        let _t350 = _d341;
                        for (let _j343 = 0; _j343 < _i342; _j343++) _t350 += _f337[_a336[_j343]];
                        if (_t350 + (_a336.length - _i342 - 1) * _lo346 > _t345) continue;
                        if (_t350 + (_a336.length - _i342 - 1) * _hi347 < _t345) continue;
                      }
                      for (let _j343 = 0; _j343 < _i342; _j343++) {
                        const _y351 = _a336[_j343];
                        if (!(!((((_f337[_e340] === 1) && (_f337[_y351] === 1)) && (sp.adj4[_e340].includes(_y351)))))) continue V344;
                      }
                      break;
                    }
                    if (_r348 === 0) {
                      _s339[_i342] = 0;
                      _i342--;
                      continue;
                    }
                    _s339[_i342] = _d341;
                    if (_i342 === _a336.length - 1) break;
                    _i342++;
                    _s339[_i342] = 0;
                  }
                  if (_i342 < 0) break;
                  let _g352 = 0;
                  G353: {
                    const _a354 = v_O;
                    for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                      const v_y = _a354[_i355];
                      _g352 += _f337[v_y];
                    }
                  }
                  if (!((_g352 === ((2 * v_O.length) - v_k)))) continue;
                  if (true) {
                    _q334 = true;
                    break Q335;
                  }
                }
              }
              if (!(_q334)) continue;
              _g306.push(v_x);
            }
          }
          let _q356 = false;
          Q357: {
            const _a358 = v_O;
            for (let _i359 = 0; _i359 < _a358.length; _i359++) {
              const v_x = _a358[_i359];
              if ((!(v_T.includes(v_x)) || !(v_G.includes(v_x)))) {
                _q356 = true;
                break Q357;
              }
            }
          }
          freshBinding("lineCount", [(sp.lines.includes(v_L)), (v_k === (clueAt(cl.count, v_L) - _g246)), sameSet(v_O, _g250), (v_O.length > 0), sameSet(v_T, _g256), sameSet(v_G, _g306), _q356], ["L in", "k =", "O =", "where of O", "T =", "G =", "where of G"]);
        }
        facts.length = 0;
        changed = false;
        let _q360 = true;
        Q361: {
          const _a362 = v_O;
          for (let _i363 = 0; _i363 < _a362.length; _i363++) {
            const v_x = _a362[_i363];
            let _c365: boolean = ((v_T.includes(v_x)) || (v_G.includes(v_x)));
            if (_c365) {
              let _c364: boolean = !(!(v_T.includes(v_x)));
              if (!_c364) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c364 = true;
              }
              _c365 = _c364;
            }
            let _c367: boolean = _c365;
            if (_c367) {
              let _c366: boolean = !(!(v_G.includes(v_x)));
              if (!_c366) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                _c366 = true;
              }
              _c367 = _c366;
            }
            if (!(_c367)) {
              _q360 = false;
              break Q361;
            }
          }
        }
        if (!(_q360)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, k: v_k, O: v_O.slice(), T: v_T.slice(), G: v_G.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface LineNeighborsBinding {
  L: number;
  k: number;
  O: readonly number[];
  N: readonly number[];
  U: readonly number[];
}

const lineNeighborsFacts: number[] = [];
let lineNeighborsCands = new Int32Array(0);
const lineNeighbors_st106 = stamps();
const lineNeighbors_st143 = stamps();
let lineNeighbors_f145 = new Int32Array(0);
let lineNeighbors_l146: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function lineNeighbors(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineNeighborsBinding> | null): number {
  const _g91: number[] = [];
  const _g100: number[] = [];
  const _g115: number[] = [];
  if (lineNeighbors_f145.length < sp.cells.length) lineNeighbors_f145 = new Int32Array(sp.cells.length).fill(-1);
  else lineNeighbors_f145.fill(-1);
  lineNeighbors_l146 = [];
  const _s147: number[] = [];
  const facts = lineNeighborsFacts;
  let fired = 0;
  let changed = false;
  if (lineNeighborsCands.length < sp.cells.length) lineNeighborsCands = new Int32Array(sp.cells.length);
  const cands = lineNeighborsCands;
  cands.fill(-1);
  const _a84 = sp.lines;
  for (let _i85 = 0; _i85 < _a84.length; _i85++) {
    const v_L = _a84[_i85];
    const _h86 = clueAt(cl.count, v_L);
    let _g87 = 0;
    G88: {
      const _a89 = sp.lineCells[v_L];
      for (let _i90 = 0; _i90 < _a89.length; _i90++) {
        const v_c = _a89[_i90];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g87++;
      }
    }
    const v_k = (_h86 - _g87);
    _g91.length = 0;
    G92: {
      const _a95 = sp.lineCells[v_L];
      for (let _i96 = 0; _i96 < _a95.length; _i96++) {
        const v_c = _a95[_i96];
        const _h97 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h97 < 0)))) continue;
        _g91.push(v_c);
      }
    }
    L98: {
      const v_O = _g91;
      const _h99 = v_O.length;
      if (!(((_h99 > 0) && (v_k > 0)))) break L98;
      const _h164 = (2 * _h99);
      const _h165 = (_h164 - v_k);
      _g100.length = 0;
      lineNeighbors_st106.pass++;
      G101: {
        const _a107 = v_O;
        for (let _i108 = 0; _i108 < _a107.length; _i108++) {
          const v_y = _a107[_i108];
          const _a109 = sp.adj8[v_y];
          for (let _i110 = 0; _i110 < _a109.length; _i110++) {
            const v_z = _a109[_i110];
            const _h111 = clueAt(cl.tree, v_z);
            if (!(((!((b.grid[v_z] !== 0)) && (_h111 < 0)) && !(sp.lineCells[v_L].includes(v_z))))) continue;
            const _t112 = v_z;
            if (_g100.length < 16) { if (!_g100.includes(_t112)) _g100.push(_t112); } else addOnce(_g100, lineNeighbors_st106, _t112);
          }
        }
      }
      L113: {
        const v_N = _g100;
        const _h114 = v_N.length;
        if (!((_h114 > 0))) break L113;
        _g115.length = 0;
        lineNeighbors_st143.pass++;
        G116: {
          const _a144 = v_O;
          const _t153 = ((2 * _h99) - v_k);
          const _lo154 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi155 = 31 - Math.clz32(b.domain);
          for (const _e148 of lineNeighbors_l146) lineNeighbors_f145[_e148] = -1;
          lineNeighbors_l146 = _a144;
          let _i150 = 0;
          _s147[0] = 0;
          let _o157 = _a144.length === 0;
          for (;;) {
            if (_a144.length === 0) {
              if (!_o157) break;
              _o157 = false;
            }
            while (_a144.length > 0 && _i150 >= 0) {
              const _e148 = _a144[_i150];
              if (_s147[_i150] > 0) lineNeighbors_f145[_e148] = -1;
              let _r156 = (cands[_e148] >= 0 ? cands[_e148] : (cands[_e148] = b.cands[_e148])) & ~((2 << _s147[_i150]) - 1);
              let _d149 = 0;
              V152: for (; _r156 !== 0; _r156 &= _r156 - 1) {
                _d149 = 31 - Math.clz32(_r156 & -_r156);
                lineNeighbors_f145[_e148] = _d149;
                {
                  let _t158 = _d149;
                  for (let _j151 = 0; _j151 < _i150; _j151++) _t158 += lineNeighbors_f145[_a144[_j151]];
                  if (_t158 + (_a144.length - _i150 - 1) * _lo154 > _t153) continue;
                  if (_t158 + (_a144.length - _i150 - 1) * _hi155 < _t153) continue;
                }
                for (let _j151 = 0; _j151 < _i150; _j151++) {
                  const _y159 = _a144[_j151];
                  if (!(!((((lineNeighbors_f145[_e148] === 1) && (lineNeighbors_f145[_y159] === 1)) && (sp.adj4[_e148].includes(_y159)))))) continue V152;
                }
                break;
              }
              if (_r156 === 0) {
                _s147[_i150] = 0;
                _i150--;
                continue;
              }
              _s147[_i150] = _d149;
              if (_i150 === _a144.length - 1) break;
              _i150++;
              _s147[_i150] = 0;
            }
            if (_i150 < 0) break;
            let _g160 = 0;
            G161: {
              const _a162 = v_O;
              for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                const v_y = _a162[_i163];
                _g160 += lineNeighbors_f145[v_y];
              }
            }
            if (!((_g160 === _h165))) continue;
            const _a166 = v_N;
            for (let _i167 = 0; _i167 < _a166.length; _i167++) {
              const v_z = _a166[_i167];
              let _q168 = true;
              Q169: {
                const _a170 = v_O;
                for (let _i171 = 0; _i171 < _a170.length; _i171++) {
                  const v_y = _a170[_i171];
                  if (!((sp.adj8[v_z].includes(v_y)))) continue;
                  if (!((lineNeighbors_f145[v_y] === 2))) {
                    _q168 = false;
                    break Q169;
                  }
                }
              }
              if (!(_q168)) continue;
              const _t172 = v_z;
              if (_g115.length < 16) { if (!_g115.includes(_t172)) _g115.push(_t172); } else addOnce(_g115, lineNeighbors_st143, _t172);
            }
          }
        }
        L173: {
          const v_U = _g115;
          let _q174 = false;
          Q175: {
            const _a176 = v_N;
            for (let _i177 = 0; _i177 < _a176.length; _i177++) {
              const v_z = _a176[_i177];
              if (!(v_U.includes(v_z))) {
                _q174 = true;
                break Q175;
              }
            }
          }
          if (!(_q174)) break L173;
          if (DEV && staleChecking) {
            let _g178 = 0;
            G179: {
              const _a180 = sp.lineCells[v_L];
              for (let _i181 = 0; _i181 < _a180.length; _i181++) {
                const v_c = _a180[_i181];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g178++;
              }
            }
            const _g182: number[] = [];
            G183: {
              const _a186 = sp.lineCells[v_L];
              for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                const v_c = _a186[_i187];
                if (!((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)))) continue;
                _g182.push(v_c);
              }
            }
            const _g188: number[] = [];
            G189: {
              const _a194 = v_O;
              for (let _i195 = 0; _i195 < _a194.length; _i195++) {
                const v_y = _a194[_i195];
                const _a196 = sp.adj8[v_y];
                for (let _i197 = 0; _i197 < _a196.length; _i197++) {
                  const v_z = _a196[_i197];
                  if (!(((!((b.grid[v_z] !== 0)) && (clueAt(cl.tree, v_z) < 0)) && !(sp.lineCells[v_L].includes(v_z))))) continue;
                  if (!_g188.includes(v_z)) _g188.push(v_z);
                }
              }
            }
            const _g198: number[] = [];
            G199: {
              const _f227 = new Int32Array(sp.cells.length).fill(-1);
              let _l228: readonly number[] = [];
              const _s229: number[] = [];
              const _a226 = v_O;
              const _t235 = ((2 * v_O.length) - v_k);
              const _lo236 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi237 = 31 - Math.clz32(b.domain);
              for (const _e230 of _l228) _f227[_e230] = -1;
              _l228 = _a226;
              let _i232 = 0;
              _s229[0] = 0;
              let _o239 = _a226.length === 0;
              for (;;) {
                if (_a226.length === 0) {
                  if (!_o239) break;
                  _o239 = false;
                }
                while (_a226.length > 0 && _i232 >= 0) {
                  const _e230 = _a226[_i232];
                  if (_s229[_i232] > 0) _f227[_e230] = -1;
                  let _r238 = (cands[_e230] >= 0 ? cands[_e230] : (cands[_e230] = b.cands[_e230])) & ~((2 << _s229[_i232]) - 1);
                  let _d231 = 0;
                  V234: for (; _r238 !== 0; _r238 &= _r238 - 1) {
                    _d231 = 31 - Math.clz32(_r238 & -_r238);
                    _f227[_e230] = _d231;
                    {
                      let _t240 = _d231;
                      for (let _j233 = 0; _j233 < _i232; _j233++) _t240 += _f227[_a226[_j233]];
                      if (_t240 + (_a226.length - _i232 - 1) * _lo236 > _t235) continue;
                      if (_t240 + (_a226.length - _i232 - 1) * _hi237 < _t235) continue;
                    }
                    for (let _j233 = 0; _j233 < _i232; _j233++) {
                      const _y241 = _a226[_j233];
                      if (!(!((((_f227[_e230] === 1) && (_f227[_y241] === 1)) && (sp.adj4[_e230].includes(_y241)))))) continue V234;
                    }
                    break;
                  }
                  if (_r238 === 0) {
                    _s229[_i232] = 0;
                    _i232--;
                    continue;
                  }
                  _s229[_i232] = _d231;
                  if (_i232 === _a226.length - 1) break;
                  _i232++;
                  _s229[_i232] = 0;
                }
                if (_i232 < 0) break;
                let _g242 = 0;
                G243: {
                  const _a244 = v_O;
                  for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                    const v_y = _a244[_i245];
                    _g242 += _f227[v_y];
                  }
                }
                if (!((_g242 === ((2 * v_O.length) - v_k)))) continue;
                const _a246 = v_N;
                for (let _i247 = 0; _i247 < _a246.length; _i247++) {
                  const v_z = _a246[_i247];
                  let _q248 = true;
                  Q249: {
                    const _a250 = v_O;
                    for (let _i251 = 0; _i251 < _a250.length; _i251++) {
                      const v_y = _a250[_i251];
                      if (!((sp.adj8[v_z].includes(v_y)))) continue;
                      if (!((_f227[v_y] === 2))) {
                        _q248 = false;
                        break Q249;
                      }
                    }
                  }
                  if (!(_q248)) continue;
                  if (!_g198.includes(v_z)) _g198.push(v_z);
                }
              }
            }
            let _q252 = false;
            Q253: {
              const _a254 = v_N;
              for (let _i255 = 0; _i255 < _a254.length; _i255++) {
                const v_z = _a254[_i255];
                if (!(v_U.includes(v_z))) {
                  _q252 = true;
                  break Q253;
                }
              }
            }
            freshBinding("lineNeighbors", [(sp.lines.includes(v_L)), (v_k === (clueAt(cl.count, v_L) - _g178)), sameSet(v_O, _g182), ((v_O.length > 0) && (v_k > 0)), sameSet(v_N, _g188), (v_N.length > 0), sameSet(v_U, _g198), _q252], ["L in", "k =", "O =", "where of O", "N =", "where of N", "U =", "where of U"]);
          }
          facts.length = 0;
          changed = false;
          let _q256 = true;
          Q257: {
            const _a258 = v_N;
            for (let _i259 = 0; _i259 < _a258.length; _i259++) {
              const v_z = _a258[_i259];
              if (!(!(v_U.includes(v_z)))) continue;
              if (!(b.grid[v_z] !== 0)) { if (fire === null) { b.placeAt(v_z, 2); changed = true; } else facts.push(PLACE, v_z, 2); }
              if (!(true)) {
                _q256 = false;
                break Q257;
              }
            }
          }
          if (!(_q256)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, k: v_k, O: v_O.slice(), N: v_N.slice(), U: v_U.slice() }, facts)) return 1;
            cands.fill(-1);
          }
        }
      }
    }
  }
  return fired;
}

const treesKept = keptStore<readonly number[]>();
let treesOn: object | null = null;
let treesAt: Kept<readonly number[]> = [];

/** `trees(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function trees(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== treesOn) {
    treesAt = treesKept.board(cl);
    treesOn = cl;
  }
  const _kept: Kept<readonly number[]> = treesAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
      if (!((sp.adj4[v_c].includes(cl.tree.at[v_q])))) continue;
      _g1.push(v_q);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const freeKept = keptStore<readonly number[]>();

/** `free(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function free(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = freeKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a9 = trees(sp, cl, v_c);
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_q = _a9[_i10];
      let _q11 = false;
      Q12: {
        const _a13 = sp.adj4[cl.tree.at[v_q]];
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_x = _a13[_i14];
          if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
            _q11 = true;
            break Q12;
          }
        }
      }
      if (!(!(_q11))) continue;
      _g1.push(v_q);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}
