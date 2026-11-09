// Compiled by `npm run describe` from src/games/tents/tents.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, addOnce, cellsValued, clueAt, keptStore, matched, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g657: number[] = [];
  const _g664: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q647 = true;
  Q648: {
    const _a649 = sp.cells;
    for (let _i650 = 0; _i650 < _a649.length; _i650++) {
      const v_a = _a649[_i650];
      const _h651 = (g[v_a] || -1);
      if (!((_h651 === 1))) continue;
      let _q652 = true;
      Q653: {
        const _a654 = sp.adj8[v_a];
        for (let _i655 = 0; _i655 < _a654.length; _i655++) {
          const v_b = _a654[_i655];
          const _h656 = (g[v_b] || -1);
          if (!((_h656 !== 1))) {
            _q652 = false;
            break Q653;
          }
        }
      }
      if (!(_q652)) {
        _q647 = false;
        break Q648;
      }
    }
  }
  if (!(_q647)) return false;
  _g657.length = 0;
  G658: {
    const _a661 = sp.cells;
    for (let _i662 = 0; _i662 < _a661.length; _i662++) {
      const v_c = _a661[_i662];
      const _h663 = (g[v_c] || -1);
      if (!((_h663 === 1))) continue;
      _g657.push(v_c);
    }
  }
  _g664.length = 0;
  G665: {
    const _a668 = sp.cells;
    for (let _i669 = 0; _i669 < _a668.length; _i669++) {
      const v_c = _a668[_i669];
      const _h670 = (g[v_c] || -1);
      if (!((_h670 === 3))) continue;
      _g664.push(v_c);
    }
  }
  if (!(matched(sp, _g657, _g664))) return false;
  for (let _k671 = 0; _k671 < cl.tree.at.length; _k671++) {
    const _at672 = cl.tree.at[_k671];
    if (!(((g[_at672] || -1) === 3))) return false;
  }
  for (let _k674 = 0; _k674 < cl.count.at.length; _k674++) {
    const _at675 = cl.count.at[_k674];
    const _v676 = cl.count.v[_k674];
    let _g677 = 0;
    G678: {
      const _a679 = sp.lineCells[_at675];
      for (let _i680 = 0; _i680 < _a679.length; _i680++) {
        const v_c = _a679[_i680];
        const _h681 = (g[v_c] || -1);
        if (!((_h681 === 1))) continue;
        _g677++;
      }
    }
    if (!((_g677 === _v676))) return false;
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
  const _a22 = cellsValued(b, sp.cells, 1);
  for (let _i23 = 0; _i23 < _a22.length; _i23++) {
    const v_c = _a22[_i23];
    const _h24 = (b.grid[v_c] || -1);
    if (!(((_h24 === 1) && (b.markOf(v_c) === -1)))) continue;
    L25: {
      const v_K = free(b, sp, cl, v_c);
      const _h26 = v_K.length;
      if (!((_h26 < 2))) break L25;
      facts.length = 0;
      changed = false;
      let _c32: boolean = (_h26 > 0);
      if (_c32) {
        let _q27 = true;
        Q28: {
          const _a29 = v_K;
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_q = _a29[_i30];
            let _mk31 = v_c >= 0;
            if (_mk31) { const _was = b.markOf(v_c); if (_was >= 0) _mk31 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            if (!(_mk31)) {
              _q27 = false;
              break Q28;
            }
          }
        }
        _c32 = _q27;
      }
      if (!(_c32)) return -1;
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
  const _g40: number[] = [];
  const facts = noTreeFacts;
  let fired = 0;
  let changed = false;
  const _k47 = treesKept.board(cl);
  _g40.length = 0;
  G41: {
    const _a44 = sp.cells;
    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
      const v_c = _a44[_i45];
      const _h46 = clueAt(cl.tree, v_c);
      if (!(((!((b.grid[v_c] !== 0)) && (_h46 < 0)) && ((_k47[v_c] ?? trees(sp, cl, v_c)).length === 0)))) continue;
      _g40.push(v_c);
    }
  }
  L48: {
    const v_S = _g40;
    const _h49 = v_S.length;
    if (!((_h49 > 0))) break L48;
    facts.length = 0;
    changed = false;
    let _q50 = true;
    Q51: {
      const _a52 = v_S;
      for (let _i53 = 0; _i53 < _a52.length; _i53++) {
        const v_c = _a52[_i53];
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        if (!(true)) {
          _q50 = false;
          break Q51;
        }
      }
    }
    if (!(_q50)) return -1;
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
  const _g69: number[] = [];
  const facts = treesDoneFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q65 = false;
    Q66: {
      const _a67 = sp.adj4[cl.tree.at[v_q]];
      for (let _i68 = 0; _i68 < _a67.length; _i68++) {
        const v_x = _a67[_i68];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q65 = true;
          break Q66;
        }
      }
    }
    if (!(_q65)) continue;
    _g69.length = 0;
    G70: {
      const _a73 = sp.adj4[cl.tree.at[v_q]];
      for (let _i74 = 0; _i74 < _a73.length; _i74++) {
        const v_c = _a73[_i74];
        const _h75 = clueAt(cl.tree, v_c);
        if (!(((!((b.grid[v_c] !== 0)) && (_h75 < 0)) && (free(b, sp, cl, v_c).length === 0)))) continue;
        _g69.push(v_c);
      }
    }
    L76: {
      const v_S = _g69;
      const _h77 = v_S.length;
      if (!((_h77 > 0))) break L76;
      facts.length = 0;
      changed = false;
      let _q78 = true;
      Q79: {
        const _a80 = v_S;
        for (let _i81 = 0; _i81 < _a80.length; _i81++) {
          const v_c = _a80[_i81];
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q78 = false;
            break Q79;
          }
        }
      }
      if (!(_q78)) return -1;
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
  const _g93: number[] = [];
  const facts = nextToTentFacts;
  let fired = 0;
  let changed = false;
  const _a91 = cellsValued(b, sp.cells, 1);
  for (let _i92 = 0; _i92 < _a91.length; _i92++) {
    const v_t = _a91[_i92];
    if (!(((b.grid[v_t] || -1) === 1))) continue;
    _g93.length = 0;
    G94: {
      const _a97 = sp.adj8[v_t];
      for (let _i98 = 0; _i98 < _a97.length; _i98++) {
        const v_x = _a97[_i98];
        const _h99 = clueAt(cl.tree, v_x);
        if (!((!((b.grid[v_x] !== 0)) && (_h99 < 0)))) continue;
        _g93.push(v_x);
      }
    }
    L100: {
      const v_S = _g93;
      const _h101 = v_S.length;
      if (!((_h101 > 0))) break L100;
      facts.length = 0;
      changed = false;
      let _q102 = true;
      Q103: {
        const _a104 = sp.adj8[v_t];
        for (let _i105 = 0; _i105 < _a104.length; _i105++) {
          const v_x = _a104[_i105];
          if (!(((b.grid[v_x] || -1) !== 1))) {
            _q102 = false;
            break Q103;
          }
        }
      }
      let _c110: boolean = _q102;
      if (_c110) {
        let _q106 = true;
        Q107: {
          const _a108 = v_S;
          for (let _i109 = 0; _i109 < _a108.length; _i109++) {
            const v_x = _a108[_i109];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q106 = false;
              break Q107;
            }
          }
        }
        _c110 = _q106;
      }
      if (!(_c110)) return -1;
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
  const _g131: number[] = [];
  const facts = treeSingleFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q127 = false;
    Q128: {
      const _a129 = sp.adj4[cl.tree.at[v_q]];
      for (let _i130 = 0; _i130 < _a129.length; _i130++) {
        const v_x = _a129[_i130];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q127 = true;
          break Q128;
        }
      }
    }
    if (!(!(_q127))) continue;
    _g131.length = 0;
    G132: {
      const _a135 = sp.adj4[cl.tree.at[v_q]];
      for (let _i136 = 0; _i136 < _a135.length; _i136++) {
        const v_x = _a135[_i136];
        const _h137 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h137 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g131.push(v_x);
      }
    }
    L138: {
      const v_R = _g131;
      const _h139 = v_R.length;
      let _c145: boolean = (_h139 < 2);
      if (_c145) {
        let _q140 = true;
        Q141: {
          const _a142 = v_R;
          for (let _i143 = 0; _i143 < _a142.length; _i143++) {
            const v_x = _a142[_i143];
            const _h144 = clueAt(cl.tree, v_x);
            if (!((!((b.grid[v_x] !== 0)) && (_h144 < 0)))) {
              _q140 = false;
              break Q141;
            }
          }
        }
        _c145 = _q140;
      }
      if (!(_c145)) break L138;
      facts.length = 0;
      changed = false;
      let _c152: boolean = (_h139 > 0);
      if (_c152) {
        let _q146 = true;
        Q147: {
          const _a148 = v_R;
          for (let _i149 = 0; _i149 < _a148.length; _i149++) {
            const v_x = _a148[_i149];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
            let _c151: boolean = true;
            if (_c151) {
              let _mk150 = v_x >= 0;
              if (_mk150) { const _was = b.markOf(v_x); if (_was >= 0) _mk150 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
              _c151 = _mk150;
            }
            if (!(_c151)) {
              _q146 = false;
              break Q147;
            }
          }
        }
        _c152 = _q146;
      }
      if (!(_c152)) return -1;
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
  const _g170: number[] = [];
  const facts = treeLinkFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q165 = false;
    Q166: {
      const _a167 = sp.adj4[cl.tree.at[v_q]];
      for (let _i168 = 0; _i168 < _a167.length; _i168++) {
        const v_x = _a167[_i168];
        const _h169 = (b.grid[v_x] || -1);
        if (((b.markOf(v_x) === v_q) && (_h169 === 1))) {
          _q165 = true;
          break Q166;
        }
      }
    }
    if (!(!(_q165))) continue;
    _g170.length = 0;
    G171: {
      const _a174 = sp.adj4[cl.tree.at[v_q]];
      for (let _i175 = 0; _i175 < _a174.length; _i175++) {
        const v_x = _a174[_i175];
        const _h176 = (b.grid[v_x] !== 0);
        const _h177 = clueAt(cl.tree, v_x);
        const _h178 = (b.grid[v_x] || -1);
        if (!(((!(_h176) && (_h177 < 0)) || ((_h178 === 1) && (b.markOf(v_x) === -1))))) continue;
        _g170.push(v_x);
      }
    }
    L179: {
      const v_R = _g170;
      const _h180 = v_R.length;
      if (!((_h180 === 1))) break L179;
      L181: {
        const v_x = (v_R[0] ?? -1);
        const _h182 = (b.grid[v_x] || -1);
        if (!((_h182 === 1))) break L181;
        facts.length = 0;
        changed = false;
        let _mk183 = v_x >= 0;
        if (_mk183) { const _was = b.markOf(v_x); if (_was >= 0) _mk183 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
        if (!(_mk183)) return -1;
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
  const _g201: number[] = [];
  const facts = treeDiagonalFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q197 = false;
    Q198: {
      const _a199 = sp.adj4[cl.tree.at[v_q]];
      for (let _i200 = 0; _i200 < _a199.length; _i200++) {
        const v_x = _a199[_i200];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q197 = true;
          break Q198;
        }
      }
    }
    if (!(!(_q197))) continue;
    _g201.length = 0;
    G202: {
      const _a205 = sp.adj4[cl.tree.at[v_q]];
      for (let _i206 = 0; _i206 < _a205.length; _i206++) {
        const v_x = _a205[_i206];
        const _h207 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h207 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g201.push(v_x);
      }
    }
    L208: {
      const v_R = _g201;
      const _h209 = v_R.length;
      if (!((_h209 === 2))) break L208;
      const v_a = (v_R[0] ?? -1);
      L210: {
        const v_b = (v_R[1] ?? -1);
        if (!((((v_a % sp.w) !== (v_b % sp.w)) && (((v_a / sp.w) | 0) !== ((v_b / sp.w) | 0))))) break L210;
        L211: {
          const v_z = (((((v_a / sp.w) | 0) + ((v_b / sp.w) | 0)) - ((cl.tree.at[v_q] / sp.w) | 0)) * sp.w + (((v_a % sp.w) + (v_b % sp.w)) - (cl.tree.at[v_q] % sp.w)));
          const _h212 = clueAt(cl.tree, v_z);
          if (!((!((b.grid[v_z] !== 0)) && (_h212 < 0)))) break L211;
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
let _p375 = new Int32Array(0);
let _l376: readonly number[] = [];
let _f381 = new Int32Array(0);
let _l382: readonly number[] = [];
let _p429 = new Int32Array(0);
let _l430: readonly number[] = [];
let _f435 = new Int32Array(0);
let _l436: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function lineCount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineCountBinding> | null): number {
  const _g338: number[] = [];
  const _g347: number[] = [];
  if (_p375.length < sp.cells.length) _p375 = new Int32Array(sp.cells.length);
  else _p375.fill(0);
  _l376 = [];
  let _y377 = false;
  if (_f381.length < sp.cells.length) _f381 = new Int32Array(sp.cells.length).fill(-1);
  else _f381.fill(-1);
  _l382 = [];
  const _s383: number[] = [];
  const _g401: number[] = [];
  if (_p429.length < sp.cells.length) _p429 = new Int32Array(sp.cells.length);
  else _p429.fill(0);
  _l430 = [];
  let _y431 = false;
  if (_f435.length < sp.cells.length) _f435 = new Int32Array(sp.cells.length).fill(-1);
  else _f435.fill(-1);
  _l436 = [];
  const _s437: number[] = [];
  const facts = lineCountFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (lineCountCands.length < sp.cells.length) lineCountCands = new Int32Array(sp.cells.length);
  const cands = lineCountCands;
  cands.fill(-1);
  const _a331 = sp.lines;
  for (let _i332 = 0; _i332 < _a331.length; _i332++) {
    const v_L = _a331[_i332];
    const _h333 = clueAt(cl.count, v_L);
    let _g334 = 0;
    G335: {
      const _a336 = sp.lineCells[v_L];
      for (let _i337 = 0; _i337 < _a336.length; _i337++) {
        const v_c = _a336[_i337];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g334++;
      }
    }
    const v_k = (_h333 - _g334);
    _g338.length = 0;
    G339: {
      const _a342 = sp.lineCells[v_L];
      for (let _i343 = 0; _i343 < _a342.length; _i343++) {
        const v_c = _a342[_i343];
        const _h344 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h344 < 0)))) continue;
        _g338.push(v_c);
      }
    }
    L345: {
      const v_O = _g338;
      const _h346 = v_O.length;
      if (!((_h346 > 0))) break L345;
      let _g378 = -1;
      const _h389 = (2 * _h346);
      const _h390 = (_h389 - v_k);
      let _g432 = -1;
      _g347.length = 0;
      G348: {
        const _a373 = v_O;
        for (let _i374 = 0; _i374 < _a373.length; _i374++) {
          const v_x = _a373[_i374];
          if (_g378 !== _epoch) {
            _g378 = _epoch;
            for (const _e379 of _l376) _p375[_e379] = 0;
            _y377 = false;
            const _a380 = v_O;
            const _lo391 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi392 = 31 - Math.clz32(b.domain);
            for (const _e384 of _l382) _f381[_e384] = -1;
            _l382 = _a380;
            let _i386 = 0;
            _s383[0] = 0;
            let _o394 = _a380.length === 0;
            for (;;) {
              if (_a380.length === 0) {
                if (!_o394) break;
                _o394 = false;
              }
              while (_a380.length > 0 && _i386 >= 0) {
                const _e384 = _a380[_i386];
                if (_s383[_i386] > 0) _f381[_e384] = -1;
                let _r393 = (cands[_e384] >= 0 ? cands[_e384] : (cands[_e384] = b.cands[_e384])) & ~((2 << _s383[_i386]) - 1);
                let _d385 = 0;
                V388: for (; _r393 !== 0; _r393 &= _r393 - 1) {
                  _d385 = 31 - Math.clz32(_r393 & -_r393);
                  _f381[_e384] = _d385;
                  {
                    let _t395 = _d385;
                    for (let _j387 = 0; _j387 < _i386; _j387++) _t395 += _f381[_a380[_j387]];
                    if (_t395 + (_a380.length - _i386 - 1) * _lo391 > _h390) continue;
                    if (_t395 + (_a380.length - _i386 - 1) * _hi392 < _h390) continue;
                  }
                  for (let _j387 = 0; _j387 < _i386; _j387++) {
                    const _y396 = _a380[_j387];
                    if (!(!((((_f381[_e384] === 1) && (_f381[_y396] === 1)) && (sp.adj4[_e384].includes(_y396)))))) continue V388;
                  }
                  break;
                }
                if (_r393 === 0) {
                  _s383[_i386] = 0;
                  _i386--;
                  continue;
                }
                _s383[_i386] = _d385;
                if (_i386 === _a380.length - 1) break;
                _i386++;
                _s383[_i386] = 0;
              }
              if (_i386 < 0) break;
              let _g397 = 0;
              G398: {
                const _a399 = v_O;
                for (let _i400 = 0; _i400 < _a399.length; _i400++) {
                  const v_y = _a399[_i400];
                  _g397 += _f381[v_y];
                }
              }
              if (!((_g397 === _h390))) continue;
              if (!(true)) continue;
              _l376 = _a380;
              _y377 = true;
              for (const _e379 of _a380) _p375[_e379] |= 1 << _f381[_e379];
            }
          }
          if (!(((((_p375[v_x] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y377 && !v_O.includes(v_x))))) continue;
          _g347.push(v_x);
        }
      }
      const v_T = _g347;
      _g401.length = 0;
      G402: {
        const _a427 = v_O;
        for (let _i428 = 0; _i428 < _a427.length; _i428++) {
          const v_x = _a427[_i428];
          if (_g432 !== _epoch) {
            _g432 = _epoch;
            for (const _e433 of _l430) _p429[_e433] = 0;
            _y431 = false;
            const _a434 = v_O;
            const _lo443 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi444 = 31 - Math.clz32(b.domain);
            for (const _e438 of _l436) _f435[_e438] = -1;
            _l436 = _a434;
            let _i440 = 0;
            _s437[0] = 0;
            let _o446 = _a434.length === 0;
            for (;;) {
              if (_a434.length === 0) {
                if (!_o446) break;
                _o446 = false;
              }
              while (_a434.length > 0 && _i440 >= 0) {
                const _e438 = _a434[_i440];
                if (_s437[_i440] > 0) _f435[_e438] = -1;
                let _r445 = (cands[_e438] >= 0 ? cands[_e438] : (cands[_e438] = b.cands[_e438])) & ~((2 << _s437[_i440]) - 1);
                let _d439 = 0;
                V442: for (; _r445 !== 0; _r445 &= _r445 - 1) {
                  _d439 = 31 - Math.clz32(_r445 & -_r445);
                  _f435[_e438] = _d439;
                  {
                    let _t447 = _d439;
                    for (let _j441 = 0; _j441 < _i440; _j441++) _t447 += _f435[_a434[_j441]];
                    if (_t447 + (_a434.length - _i440 - 1) * _lo443 > _h390) continue;
                    if (_t447 + (_a434.length - _i440 - 1) * _hi444 < _h390) continue;
                  }
                  for (let _j441 = 0; _j441 < _i440; _j441++) {
                    const _y448 = _a434[_j441];
                    if (!(!((((_f435[_e438] === 1) && (_f435[_y448] === 1)) && (sp.adj4[_e438].includes(_y448)))))) continue V442;
                  }
                  break;
                }
                if (_r445 === 0) {
                  _s437[_i440] = 0;
                  _i440--;
                  continue;
                }
                _s437[_i440] = _d439;
                if (_i440 === _a434.length - 1) break;
                _i440++;
                _s437[_i440] = 0;
              }
              if (_i440 < 0) break;
              let _g449 = 0;
              G450: {
                const _a451 = v_O;
                for (let _i452 = 0; _i452 < _a451.length; _i452++) {
                  const v_y = _a451[_i452];
                  _g449 += _f435[v_y];
                }
              }
              if (!((_g449 === _h390))) continue;
              if (!(true)) continue;
              _l430 = _a434;
              _y431 = true;
              for (const _e433 of _a434) _p429[_e433] |= 1 << _f435[_e433];
            }
          }
          if (!(((((_p429[v_x] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y431 && !v_O.includes(v_x))))) continue;
          _g401.push(v_x);
        }
      }
      L453: {
        const v_G = _g401;
        let _q454 = false;
        Q455: {
          const _a456 = v_O;
          for (let _i457 = 0; _i457 < _a456.length; _i457++) {
            const v_x = _a456[_i457];
            if ((!(v_T.includes(v_x)) || !(v_G.includes(v_x)))) {
              _q454 = true;
              break Q455;
            }
          }
        }
        if (!(_q454)) break L453;
        facts.length = 0;
        changed = false;
        let _q458 = true;
        Q459: {
          const _a460 = v_O;
          for (let _i461 = 0; _i461 < _a460.length; _i461++) {
            const v_x = _a460[_i461];
            let _c463: boolean = ((v_T.includes(v_x)) || (v_G.includes(v_x)));
            if (_c463) {
              let _c462: boolean = !(!(v_T.includes(v_x)));
              if (!_c462) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c462 = true;
              }
              _c463 = _c462;
            }
            let _c465: boolean = _c463;
            if (_c465) {
              let _c464: boolean = !(!(v_G.includes(v_x)));
              if (!_c464) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                _c464 = true;
              }
              _c465 = _c464;
            }
            if (!(_c465)) {
              _q458 = false;
              break Q459;
            }
          }
        }
        if (!(_q458)) return -1;
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
const _st571 = stamps();
const _st608 = stamps();
let _f610 = new Int32Array(0);
let _l611: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function lineNeighbors(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineNeighborsBinding> | null): number {
  const _g556: number[] = [];
  const _g565: number[] = [];
  const _g580: number[] = [];
  if (_f610.length < sp.cells.length) _f610 = new Int32Array(sp.cells.length).fill(-1);
  else _f610.fill(-1);
  _l611 = [];
  const _s612: number[] = [];
  const facts = lineNeighborsFacts;
  let fired = 0;
  let changed = false;
  if (lineNeighborsCands.length < sp.cells.length) lineNeighborsCands = new Int32Array(sp.cells.length);
  const cands = lineNeighborsCands;
  cands.fill(-1);
  const _a549 = sp.lines;
  for (let _i550 = 0; _i550 < _a549.length; _i550++) {
    const v_L = _a549[_i550];
    const _h551 = clueAt(cl.count, v_L);
    let _g552 = 0;
    G553: {
      const _a554 = sp.lineCells[v_L];
      for (let _i555 = 0; _i555 < _a554.length; _i555++) {
        const v_c = _a554[_i555];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g552++;
      }
    }
    const v_k = (_h551 - _g552);
    _g556.length = 0;
    G557: {
      const _a560 = sp.lineCells[v_L];
      for (let _i561 = 0; _i561 < _a560.length; _i561++) {
        const v_c = _a560[_i561];
        const _h562 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h562 < 0)))) continue;
        _g556.push(v_c);
      }
    }
    L563: {
      const v_O = _g556;
      const _h564 = v_O.length;
      if (!(((_h564 > 0) && (v_k > 0)))) break L563;
      const _h629 = (2 * _h564);
      const _h630 = (_h629 - v_k);
      _g565.length = 0;
      _st571.pass++;
      G566: {
        const _a572 = v_O;
        for (let _i573 = 0; _i573 < _a572.length; _i573++) {
          const v_y = _a572[_i573];
          const _a574 = sp.adj8[v_y];
          for (let _i575 = 0; _i575 < _a574.length; _i575++) {
            const v_z = _a574[_i575];
            const _h576 = clueAt(cl.tree, v_z);
            if (!(((!((b.grid[v_z] !== 0)) && (_h576 < 0)) && !(sp.lineCells[v_L].includes(v_z))))) continue;
            const _t577 = v_z;
            if (_g565.length < 16) { if (!_g565.includes(_t577)) _g565.push(_t577); } else addOnce(_g565, _st571, _t577);
          }
        }
      }
      L578: {
        const v_N = _g565;
        const _h579 = v_N.length;
        if (!((_h579 > 0))) break L578;
        _g580.length = 0;
        _st608.pass++;
        G581: {
          const _a609 = v_O;
          const _t618 = ((2 * _h564) - v_k);
          const _lo619 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi620 = 31 - Math.clz32(b.domain);
          for (const _e613 of _l611) _f610[_e613] = -1;
          _l611 = _a609;
          let _i615 = 0;
          _s612[0] = 0;
          let _o622 = _a609.length === 0;
          for (;;) {
            if (_a609.length === 0) {
              if (!_o622) break;
              _o622 = false;
            }
            while (_a609.length > 0 && _i615 >= 0) {
              const _e613 = _a609[_i615];
              if (_s612[_i615] > 0) _f610[_e613] = -1;
              let _r621 = (cands[_e613] >= 0 ? cands[_e613] : (cands[_e613] = b.cands[_e613])) & ~((2 << _s612[_i615]) - 1);
              let _d614 = 0;
              V617: for (; _r621 !== 0; _r621 &= _r621 - 1) {
                _d614 = 31 - Math.clz32(_r621 & -_r621);
                _f610[_e613] = _d614;
                {
                  let _t623 = _d614;
                  for (let _j616 = 0; _j616 < _i615; _j616++) _t623 += _f610[_a609[_j616]];
                  if (_t623 + (_a609.length - _i615 - 1) * _lo619 > _t618) continue;
                  if (_t623 + (_a609.length - _i615 - 1) * _hi620 < _t618) continue;
                }
                for (let _j616 = 0; _j616 < _i615; _j616++) {
                  const _y624 = _a609[_j616];
                  if (!(!((((_f610[_e613] === 1) && (_f610[_y624] === 1)) && (sp.adj4[_e613].includes(_y624)))))) continue V617;
                }
                break;
              }
              if (_r621 === 0) {
                _s612[_i615] = 0;
                _i615--;
                continue;
              }
              _s612[_i615] = _d614;
              if (_i615 === _a609.length - 1) break;
              _i615++;
              _s612[_i615] = 0;
            }
            if (_i615 < 0) break;
            let _g625 = 0;
            G626: {
              const _a627 = v_O;
              for (let _i628 = 0; _i628 < _a627.length; _i628++) {
                const v_y = _a627[_i628];
                _g625 += _f610[v_y];
              }
            }
            if (!((_g625 === _h630))) continue;
            const _a631 = v_N;
            for (let _i632 = 0; _i632 < _a631.length; _i632++) {
              const v_z = _a631[_i632];
              let _q633 = true;
              Q634: {
                const _a635 = v_O;
                for (let _i636 = 0; _i636 < _a635.length; _i636++) {
                  const v_y = _a635[_i636];
                  if (!((sp.adj8[v_z].includes(v_y)))) continue;
                  if (!((_f610[v_y] === 2))) {
                    _q633 = false;
                    break Q634;
                  }
                }
              }
              if (!(_q633)) continue;
              const _t637 = v_z;
              if (_g580.length < 16) { if (!_g580.includes(_t637)) _g580.push(_t637); } else addOnce(_g580, _st608, _t637);
            }
          }
        }
        L638: {
          const v_U = _g580;
          let _q639 = false;
          Q640: {
            const _a641 = v_N;
            for (let _i642 = 0; _i642 < _a641.length; _i642++) {
              const v_z = _a641[_i642];
              if (!(v_U.includes(v_z))) {
                _q639 = true;
                break Q640;
              }
            }
          }
          if (!(_q639)) break L638;
          facts.length = 0;
          changed = false;
          let _q643 = true;
          Q644: {
            const _a645 = v_N;
            for (let _i646 = 0; _i646 < _a645.length; _i646++) {
              const v_z = _a645[_i646];
              if (!(!(v_U.includes(v_z)))) continue;
              if (!(b.grid[v_z] !== 0)) { if (fire === null) { b.placeAt(v_z, 2); changed = true; } else facts.push(PLACE, v_z, 2); }
              if (!(true)) {
                _q643 = false;
                break Q644;
              }
            }
          }
          if (!(_q643)) return -1;
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
  const _g7: number[] = [];
  G8: {
    for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
      if (!((sp.adj4[v_c].includes(cl.tree.at[v_q])))) continue;
      _g7.push(v_q);
    }
  }
  const _made = _g7;
  _kept[v_c] = _made;
  return _made;
}

const freeKept = keptStore<readonly number[]>();

/** `free(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function free(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = freeKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g5: number[] = [];
  G6: {
    const _a15 = trees(sp, cl, v_c);
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_q = _a15[_i16];
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
      _g5.push(v_q);
    }
  }
  const _made = _g5;
  _kept[v_c] = _made;
  return _made;
}
