// Compiled by `npm run describe` from src/games/tents/tents.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, clueAt, keptStore, matched, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g652: number[] = [];
  const _g659: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q642 = true;
  Q643: {
    const _a644 = sp.cells;
    for (let _i645 = 0; _i645 < _a644.length; _i645++) {
      const v_a = _a644[_i645];
      const _h646 = (g[v_a] || -1);
      if (!((_h646 === 1))) continue;
      let _q647 = true;
      Q648: {
        const _a649 = sp.adj8[v_a];
        for (let _i650 = 0; _i650 < _a649.length; _i650++) {
          const v_b = _a649[_i650];
          const _h651 = (g[v_b] || -1);
          if (!((_h651 !== 1))) {
            _q647 = false;
            break Q648;
          }
        }
      }
      if (!(_q647)) {
        _q642 = false;
        break Q643;
      }
    }
  }
  if (!(_q642)) return false;
  _g652.length = 0;
  G653: {
    const _a656 = sp.cells;
    for (let _i657 = 0; _i657 < _a656.length; _i657++) {
      const v_c = _a656[_i657];
      const _h658 = (g[v_c] || -1);
      if (!((_h658 === 1))) continue;
      _g652.push(v_c);
    }
  }
  _g659.length = 0;
  G660: {
    const _a663 = sp.cells;
    for (let _i664 = 0; _i664 < _a663.length; _i664++) {
      const v_c = _a663[_i664];
      const _h665 = (g[v_c] || -1);
      if (!((_h665 === 3))) continue;
      _g659.push(v_c);
    }
  }
  if (!(matched(sp, _g652, _g659))) return false;
  for (let _k666 = 0; _k666 < cl.tree.at.length; _k666++) {
    const _at667 = cl.tree.at[_k666];
    if (!(((g[_at667] || -1) === 3))) return false;
  }
  for (let _k669 = 0; _k669 < cl.count.at.length; _k669++) {
    const _at670 = cl.count.at[_k669];
    const _v671 = cl.count.v[_k669];
    let _g672 = 0;
    G673: {
      const _a674 = sp.lineCells[_at670];
      for (let _i675 = 0; _i675 < _a674.length; _i675++) {
        const v_c = _a674[_i675];
        const _h676 = (g[v_c] || -1);
        if (!((_h676 === 1))) continue;
        _g672++;
      }
    }
    if (!((_g672 === _v671))) return false;
  }
  return true;
}

export interface TentLinkBinding {
  c: number;
  K: readonly number[];
}

const tentLinkFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function tentLink(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TentLinkBinding> | null): number {
  const facts = tentLinkFacts;
  let fired = 0;
  let changed = false;
  const _a22 = sp.cells;
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
  _g40.length = 0;
  G41: {
    const _a44 = sp.cells;
    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
      const v_c = _a44[_i45];
      const _h46 = clueAt(cl.tree, v_c);
      if (!(((!((b.grid[v_c] !== 0)) && (_h46 < 0)) && (trees(sp, cl, v_c).length === 0)))) continue;
      _g40.push(v_c);
    }
  }
  L47: {
    const v_S = _g40;
    const _h48 = v_S.length;
    if (!((_h48 > 0))) break L47;
    facts.length = 0;
    changed = false;
    let _q49 = true;
    Q50: {
      const _a51 = v_S;
      for (let _i52 = 0; _i52 < _a51.length; _i52++) {
        const v_c = _a51[_i52];
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        if (!(true)) {
          _q49 = false;
          break Q50;
        }
      }
    }
    if (!(_q49)) return -1;
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
  const _g68: number[] = [];
  const facts = treesDoneFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q64 = false;
    Q65: {
      const _a66 = sp.adj4[cl.tree.at[v_q]];
      for (let _i67 = 0; _i67 < _a66.length; _i67++) {
        const v_x = _a66[_i67];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q64 = true;
          break Q65;
        }
      }
    }
    if (!(_q64)) continue;
    _g68.length = 0;
    G69: {
      const _a72 = sp.adj4[cl.tree.at[v_q]];
      for (let _i73 = 0; _i73 < _a72.length; _i73++) {
        const v_c = _a72[_i73];
        const _h74 = clueAt(cl.tree, v_c);
        if (!(((!((b.grid[v_c] !== 0)) && (_h74 < 0)) && (free(b, sp, cl, v_c).length === 0)))) continue;
        _g68.push(v_c);
      }
    }
    L75: {
      const v_S = _g68;
      const _h76 = v_S.length;
      if (!((_h76 > 0))) break L75;
      facts.length = 0;
      changed = false;
      let _q77 = true;
      Q78: {
        const _a79 = v_S;
        for (let _i80 = 0; _i80 < _a79.length; _i80++) {
          const v_c = _a79[_i80];
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q77 = false;
            break Q78;
          }
        }
      }
      if (!(_q77)) return -1;
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

/** Its dearest read grows with the board as n. */
export function nextToTent(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NextToTentBinding> | null): number {
  const _g92: number[] = [];
  const facts = nextToTentFacts;
  let fired = 0;
  let changed = false;
  const _a90 = sp.cells;
  for (let _i91 = 0; _i91 < _a90.length; _i91++) {
    const v_t = _a90[_i91];
    if (!(((b.grid[v_t] || -1) === 1))) continue;
    _g92.length = 0;
    G93: {
      const _a96 = sp.adj8[v_t];
      for (let _i97 = 0; _i97 < _a96.length; _i97++) {
        const v_x = _a96[_i97];
        const _h98 = clueAt(cl.tree, v_x);
        if (!((!((b.grid[v_x] !== 0)) && (_h98 < 0)))) continue;
        _g92.push(v_x);
      }
    }
    L99: {
      const v_S = _g92;
      const _h100 = v_S.length;
      if (!((_h100 > 0))) break L99;
      facts.length = 0;
      changed = false;
      let _q101 = true;
      Q102: {
        const _a103 = sp.adj8[v_t];
        for (let _i104 = 0; _i104 < _a103.length; _i104++) {
          const v_x = _a103[_i104];
          if (!(((b.grid[v_x] || -1) !== 1))) {
            _q101 = false;
            break Q102;
          }
        }
      }
      let _c109: boolean = _q101;
      if (_c109) {
        let _q105 = true;
        Q106: {
          const _a107 = v_S;
          for (let _i108 = 0; _i108 < _a107.length; _i108++) {
            const v_x = _a107[_i108];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q105 = false;
              break Q106;
            }
          }
        }
        _c109 = _q105;
      }
      if (!(_c109)) return -1;
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
  const _g130: number[] = [];
  const facts = treeSingleFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q126 = false;
    Q127: {
      const _a128 = sp.adj4[cl.tree.at[v_q]];
      for (let _i129 = 0; _i129 < _a128.length; _i129++) {
        const v_x = _a128[_i129];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q126 = true;
          break Q127;
        }
      }
    }
    if (!(!(_q126))) continue;
    _g130.length = 0;
    G131: {
      const _a134 = sp.adj4[cl.tree.at[v_q]];
      for (let _i135 = 0; _i135 < _a134.length; _i135++) {
        const v_x = _a134[_i135];
        const _h136 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h136 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g130.push(v_x);
      }
    }
    L137: {
      const v_R = _g130;
      const _h138 = v_R.length;
      let _c144: boolean = (_h138 < 2);
      if (_c144) {
        let _q139 = true;
        Q140: {
          const _a141 = v_R;
          for (let _i142 = 0; _i142 < _a141.length; _i142++) {
            const v_x = _a141[_i142];
            const _h143 = clueAt(cl.tree, v_x);
            if (!((!((b.grid[v_x] !== 0)) && (_h143 < 0)))) {
              _q139 = false;
              break Q140;
            }
          }
        }
        _c144 = _q139;
      }
      if (!(_c144)) break L137;
      facts.length = 0;
      changed = false;
      let _c151: boolean = (_h138 > 0);
      if (_c151) {
        let _q145 = true;
        Q146: {
          const _a147 = v_R;
          for (let _i148 = 0; _i148 < _a147.length; _i148++) {
            const v_x = _a147[_i148];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
            let _c150: boolean = true;
            if (_c150) {
              let _mk149 = v_x >= 0;
              if (_mk149) { const _was = b.markOf(v_x); if (_was >= 0) _mk149 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
              _c150 = _mk149;
            }
            if (!(_c150)) {
              _q145 = false;
              break Q146;
            }
          }
        }
        _c151 = _q145;
      }
      if (!(_c151)) return -1;
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
  const _g169: number[] = [];
  const facts = treeLinkFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q164 = false;
    Q165: {
      const _a166 = sp.adj4[cl.tree.at[v_q]];
      for (let _i167 = 0; _i167 < _a166.length; _i167++) {
        const v_x = _a166[_i167];
        const _h168 = (b.grid[v_x] || -1);
        if (((b.markOf(v_x) === v_q) && (_h168 === 1))) {
          _q164 = true;
          break Q165;
        }
      }
    }
    if (!(!(_q164))) continue;
    _g169.length = 0;
    G170: {
      const _a173 = sp.adj4[cl.tree.at[v_q]];
      for (let _i174 = 0; _i174 < _a173.length; _i174++) {
        const v_x = _a173[_i174];
        const _h175 = (b.grid[v_x] !== 0);
        const _h176 = clueAt(cl.tree, v_x);
        const _h177 = (b.grid[v_x] || -1);
        if (!(((!(_h175) && (_h176 < 0)) || ((_h177 === 1) && (b.markOf(v_x) === -1))))) continue;
        _g169.push(v_x);
      }
    }
    L178: {
      const v_R = _g169;
      const _h179 = v_R.length;
      if (!((_h179 === 1))) break L178;
      L180: {
        const v_x = (v_R[0] ?? -1);
        const _h181 = (b.grid[v_x] || -1);
        if (!((_h181 === 1))) break L180;
        facts.length = 0;
        changed = false;
        let _mk182 = v_x >= 0;
        if (_mk182) { const _was = b.markOf(v_x); if (_was >= 0) _mk182 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
        if (!(_mk182)) return -1;
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
  const _g200: number[] = [];
  const facts = treeDiagonalFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q196 = false;
    Q197: {
      const _a198 = sp.adj4[cl.tree.at[v_q]];
      for (let _i199 = 0; _i199 < _a198.length; _i199++) {
        const v_x = _a198[_i199];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q196 = true;
          break Q197;
        }
      }
    }
    if (!(!(_q196))) continue;
    _g200.length = 0;
    G201: {
      const _a204 = sp.adj4[cl.tree.at[v_q]];
      for (let _i205 = 0; _i205 < _a204.length; _i205++) {
        const v_x = _a204[_i205];
        const _h206 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h206 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g200.push(v_x);
      }
    }
    L207: {
      const v_R = _g200;
      const _h208 = v_R.length;
      if (!((_h208 === 2))) break L207;
      const v_a = (v_R[0] ?? -1);
      L209: {
        const v_b = (v_R[1] ?? -1);
        if (!((((v_a % sp.w) !== (v_b % sp.w)) && (((v_a / sp.w) | 0) !== ((v_b / sp.w) | 0))))) break L209;
        L210: {
          const v_z = (((((v_a / sp.w) | 0) + ((v_b / sp.w) | 0)) - ((cl.tree.at[v_q] / sp.w) | 0)) * sp.w + (((v_a % sp.w) + (v_b % sp.w)) - (cl.tree.at[v_q] % sp.w)));
          const _h211 = clueAt(cl.tree, v_z);
          if (!((!((b.grid[v_z] !== 0)) && (_h211 < 0)))) break L210;
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

/** Its dearest read grows with the board as n. */
export function lineCount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineCountBinding> | null): number {
  const _g337: number[] = [];
  const _g346: number[] = [];
  const _p374 = new Int32Array(sp.cells.length);
  let _l375: readonly number[] = [];
  let _y376 = false;
  const _f380 = new Int32Array(sp.cells.length).fill(-1);
  let _l381: readonly number[] = [];
  const _s382: number[] = [];
  const _g400: number[] = [];
  const _p428 = new Int32Array(sp.cells.length);
  let _l429: readonly number[] = [];
  let _y430 = false;
  const _f434 = new Int32Array(sp.cells.length).fill(-1);
  let _l435: readonly number[] = [];
  const _s436: number[] = [];
  const facts = lineCountFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (lineCountCands.length < sp.cells.length) lineCountCands = new Int32Array(sp.cells.length);
  const cands = lineCountCands;
  cands.fill(-1);
  const _a330 = sp.lines;
  for (let _i331 = 0; _i331 < _a330.length; _i331++) {
    const v_L = _a330[_i331];
    const _h332 = clueAt(cl.count, v_L);
    let _g333 = 0;
    G334: {
      const _a335 = sp.lineCells[v_L];
      for (let _i336 = 0; _i336 < _a335.length; _i336++) {
        const v_c = _a335[_i336];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g333++;
      }
    }
    const v_k = (_h332 - _g333);
    _g337.length = 0;
    G338: {
      const _a341 = sp.lineCells[v_L];
      for (let _i342 = 0; _i342 < _a341.length; _i342++) {
        const v_c = _a341[_i342];
        const _h343 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h343 < 0)))) continue;
        _g337.push(v_c);
      }
    }
    L344: {
      const v_O = _g337;
      const _h345 = v_O.length;
      if (!((_h345 > 0))) break L344;
      let _g377 = -1;
      const _h388 = (2 * _h345);
      const _h389 = (_h388 - v_k);
      let _g431 = -1;
      _g346.length = 0;
      G347: {
        const _a372 = v_O;
        for (let _i373 = 0; _i373 < _a372.length; _i373++) {
          const v_x = _a372[_i373];
          if (_g377 !== _epoch) {
            _g377 = _epoch;
            for (const _e378 of _l375) _p374[_e378] = 0;
            _y376 = false;
            const _a379 = v_O;
            const _lo390 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi391 = 31 - Math.clz32(b.domain);
            for (const _e383 of _l381) _f380[_e383] = -1;
            _l381 = _a379;
            let _i385 = 0;
            _s382[0] = 0;
            let _o393 = _a379.length === 0;
            for (;;) {
              if (_a379.length === 0) {
                if (!_o393) break;
                _o393 = false;
              }
              while (_a379.length > 0 && _i385 >= 0) {
                const _e383 = _a379[_i385];
                if (_s382[_i385] > 0) _f380[_e383] = -1;
                let _r392 = (cands[_e383] >= 0 ? cands[_e383] : (cands[_e383] = b.cands[_e383])) & ~((2 << _s382[_i385]) - 1);
                let _d384 = 0;
                V387: for (; _r392 !== 0; _r392 &= _r392 - 1) {
                  _d384 = 31 - Math.clz32(_r392 & -_r392);
                  _f380[_e383] = _d384;
                  {
                    let _t394 = _d384;
                    for (let _j386 = 0; _j386 < _i385; _j386++) _t394 += _f380[_a379[_j386]];
                    if (_t394 + (_a379.length - _i385 - 1) * _lo390 > _h389) continue;
                    if (_t394 + (_a379.length - _i385 - 1) * _hi391 < _h389) continue;
                  }
                  for (let _j386 = 0; _j386 < _i385; _j386++) {
                    const _y395 = _a379[_j386];
                    if (!(!((((_f380[_e383] === 1) && (_f380[_y395] === 1)) && (sp.adj4[_e383].includes(_y395)))))) continue V387;
                  }
                  break;
                }
                if (_r392 === 0) {
                  _s382[_i385] = 0;
                  _i385--;
                  continue;
                }
                _s382[_i385] = _d384;
                if (_i385 === _a379.length - 1) break;
                _i385++;
                _s382[_i385] = 0;
              }
              if (_i385 < 0) break;
              let _g396 = 0;
              G397: {
                const _a398 = v_O;
                for (let _i399 = 0; _i399 < _a398.length; _i399++) {
                  const v_y = _a398[_i399];
                  _g396 += _f380[v_y];
                }
              }
              if (!((_g396 === _h389))) continue;
              if (!(true)) continue;
              _l375 = _a379;
              _y376 = true;
              for (const _e378 of _a379) _p374[_e378] |= 1 << _f380[_e378];
            }
          }
          if (!(((((_p374[v_x] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y376 && !v_O.includes(v_x))))) continue;
          _g346.push(v_x);
        }
      }
      const v_T = _g346;
      _g400.length = 0;
      G401: {
        const _a426 = v_O;
        for (let _i427 = 0; _i427 < _a426.length; _i427++) {
          const v_x = _a426[_i427];
          if (_g431 !== _epoch) {
            _g431 = _epoch;
            for (const _e432 of _l429) _p428[_e432] = 0;
            _y430 = false;
            const _a433 = v_O;
            const _lo442 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi443 = 31 - Math.clz32(b.domain);
            for (const _e437 of _l435) _f434[_e437] = -1;
            _l435 = _a433;
            let _i439 = 0;
            _s436[0] = 0;
            let _o445 = _a433.length === 0;
            for (;;) {
              if (_a433.length === 0) {
                if (!_o445) break;
                _o445 = false;
              }
              while (_a433.length > 0 && _i439 >= 0) {
                const _e437 = _a433[_i439];
                if (_s436[_i439] > 0) _f434[_e437] = -1;
                let _r444 = (cands[_e437] >= 0 ? cands[_e437] : (cands[_e437] = b.cands[_e437])) & ~((2 << _s436[_i439]) - 1);
                let _d438 = 0;
                V441: for (; _r444 !== 0; _r444 &= _r444 - 1) {
                  _d438 = 31 - Math.clz32(_r444 & -_r444);
                  _f434[_e437] = _d438;
                  {
                    let _t446 = _d438;
                    for (let _j440 = 0; _j440 < _i439; _j440++) _t446 += _f434[_a433[_j440]];
                    if (_t446 + (_a433.length - _i439 - 1) * _lo442 > _h389) continue;
                    if (_t446 + (_a433.length - _i439 - 1) * _hi443 < _h389) continue;
                  }
                  for (let _j440 = 0; _j440 < _i439; _j440++) {
                    const _y447 = _a433[_j440];
                    if (!(!((((_f434[_e437] === 1) && (_f434[_y447] === 1)) && (sp.adj4[_e437].includes(_y447)))))) continue V441;
                  }
                  break;
                }
                if (_r444 === 0) {
                  _s436[_i439] = 0;
                  _i439--;
                  continue;
                }
                _s436[_i439] = _d438;
                if (_i439 === _a433.length - 1) break;
                _i439++;
                _s436[_i439] = 0;
              }
              if (_i439 < 0) break;
              let _g448 = 0;
              G449: {
                const _a450 = v_O;
                for (let _i451 = 0; _i451 < _a450.length; _i451++) {
                  const v_y = _a450[_i451];
                  _g448 += _f434[v_y];
                }
              }
              if (!((_g448 === _h389))) continue;
              if (!(true)) continue;
              _l429 = _a433;
              _y430 = true;
              for (const _e432 of _a433) _p428[_e432] |= 1 << _f434[_e432];
            }
          }
          if (!(((((_p428[v_x] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y430 && !v_O.includes(v_x))))) continue;
          _g400.push(v_x);
        }
      }
      L452: {
        const v_G = _g400;
        let _q453 = false;
        Q454: {
          const _a455 = v_O;
          for (let _i456 = 0; _i456 < _a455.length; _i456++) {
            const v_x = _a455[_i456];
            if ((!(v_T.includes(v_x)) || !(v_G.includes(v_x)))) {
              _q453 = true;
              break Q454;
            }
          }
        }
        if (!(_q453)) break L452;
        facts.length = 0;
        changed = false;
        let _q457 = true;
        Q458: {
          const _a459 = v_O;
          for (let _i460 = 0; _i460 < _a459.length; _i460++) {
            const v_x = _a459[_i460];
            let _c462: boolean = ((v_T.includes(v_x)) || (v_G.includes(v_x)));
            if (_c462) {
              let _c461: boolean = !(!(v_T.includes(v_x)));
              if (!_c461) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c461 = true;
              }
              _c462 = _c461;
            }
            let _c464: boolean = _c462;
            if (_c464) {
              let _c463: boolean = !(!(v_G.includes(v_x)));
              if (!_c463) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                _c463 = true;
              }
              _c464 = _c463;
            }
            if (!(_c464)) {
              _q457 = false;
              break Q458;
            }
          }
        }
        if (!(_q457)) return -1;
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

/** Its dearest read grows with the board as n. */
export function lineNeighbors(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineNeighborsBinding> | null): number {
  const _g555: number[] = [];
  const _g564: number[] = [];
  const _g577: number[] = [];
  const _f606 = new Int32Array(sp.cells.length).fill(-1);
  let _l607: readonly number[] = [];
  const _s608: number[] = [];
  const facts = lineNeighborsFacts;
  let fired = 0;
  let changed = false;
  if (lineNeighborsCands.length < sp.cells.length) lineNeighborsCands = new Int32Array(sp.cells.length);
  const cands = lineNeighborsCands;
  cands.fill(-1);
  const _a548 = sp.lines;
  for (let _i549 = 0; _i549 < _a548.length; _i549++) {
    const v_L = _a548[_i549];
    const _h550 = clueAt(cl.count, v_L);
    let _g551 = 0;
    G552: {
      const _a553 = sp.lineCells[v_L];
      for (let _i554 = 0; _i554 < _a553.length; _i554++) {
        const v_c = _a553[_i554];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g551++;
      }
    }
    const v_k = (_h550 - _g551);
    _g555.length = 0;
    G556: {
      const _a559 = sp.lineCells[v_L];
      for (let _i560 = 0; _i560 < _a559.length; _i560++) {
        const v_c = _a559[_i560];
        const _h561 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h561 < 0)))) continue;
        _g555.push(v_c);
      }
    }
    L562: {
      const v_O = _g555;
      const _h563 = v_O.length;
      if (!(((_h563 > 0) && (v_k > 0)))) break L562;
      const _h625 = (2 * _h563);
      const _h626 = (_h625 - v_k);
      _g564.length = 0;
      G565: {
        const _a570 = v_O;
        for (let _i571 = 0; _i571 < _a570.length; _i571++) {
          const v_y = _a570[_i571];
          const _a572 = sp.adj8[v_y];
          for (let _i573 = 0; _i573 < _a572.length; _i573++) {
            const v_z = _a572[_i573];
            const _h574 = clueAt(cl.tree, v_z);
            if (!(((!((b.grid[v_z] !== 0)) && (_h574 < 0)) && !(sp.lineCells[v_L].includes(v_z))))) continue;
            if (!_g564.includes(v_z)) _g564.push(v_z);
          }
        }
      }
      L575: {
        const v_N = _g564;
        const _h576 = v_N.length;
        if (!((_h576 > 0))) break L575;
        _g577.length = 0;
        G578: {
          const _a605 = v_O;
          const _t614 = ((2 * _h563) - v_k);
          const _lo615 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi616 = 31 - Math.clz32(b.domain);
          for (const _e609 of _l607) _f606[_e609] = -1;
          _l607 = _a605;
          let _i611 = 0;
          _s608[0] = 0;
          let _o618 = _a605.length === 0;
          for (;;) {
            if (_a605.length === 0) {
              if (!_o618) break;
              _o618 = false;
            }
            while (_a605.length > 0 && _i611 >= 0) {
              const _e609 = _a605[_i611];
              if (_s608[_i611] > 0) _f606[_e609] = -1;
              let _r617 = (cands[_e609] >= 0 ? cands[_e609] : (cands[_e609] = b.cands[_e609])) & ~((2 << _s608[_i611]) - 1);
              let _d610 = 0;
              V613: for (; _r617 !== 0; _r617 &= _r617 - 1) {
                _d610 = 31 - Math.clz32(_r617 & -_r617);
                _f606[_e609] = _d610;
                {
                  let _t619 = _d610;
                  for (let _j612 = 0; _j612 < _i611; _j612++) _t619 += _f606[_a605[_j612]];
                  if (_t619 + (_a605.length - _i611 - 1) * _lo615 > _t614) continue;
                  if (_t619 + (_a605.length - _i611 - 1) * _hi616 < _t614) continue;
                }
                for (let _j612 = 0; _j612 < _i611; _j612++) {
                  const _y620 = _a605[_j612];
                  if (!(!((((_f606[_e609] === 1) && (_f606[_y620] === 1)) && (sp.adj4[_e609].includes(_y620)))))) continue V613;
                }
                break;
              }
              if (_r617 === 0) {
                _s608[_i611] = 0;
                _i611--;
                continue;
              }
              _s608[_i611] = _d610;
              if (_i611 === _a605.length - 1) break;
              _i611++;
              _s608[_i611] = 0;
            }
            if (_i611 < 0) break;
            let _g621 = 0;
            G622: {
              const _a623 = v_O;
              for (let _i624 = 0; _i624 < _a623.length; _i624++) {
                const v_y = _a623[_i624];
                _g621 += _f606[v_y];
              }
            }
            if (!((_g621 === _h626))) continue;
            const _a627 = v_N;
            for (let _i628 = 0; _i628 < _a627.length; _i628++) {
              const v_z = _a627[_i628];
              let _q629 = true;
              Q630: {
                const _a631 = v_O;
                for (let _i632 = 0; _i632 < _a631.length; _i632++) {
                  const v_y = _a631[_i632];
                  if (!((sp.adj8[v_z].includes(v_y)))) continue;
                  if (!((_f606[v_y] === 2))) {
                    _q629 = false;
                    break Q630;
                  }
                }
              }
              if (!(_q629)) continue;
              if (!_g577.includes(v_z)) _g577.push(v_z);
            }
          }
        }
        L633: {
          const v_U = _g577;
          let _q634 = false;
          Q635: {
            const _a636 = v_N;
            for (let _i637 = 0; _i637 < _a636.length; _i637++) {
              const v_z = _a636[_i637];
              if (!(v_U.includes(v_z))) {
                _q634 = true;
                break Q635;
              }
            }
          }
          if (!(_q634)) break L633;
          facts.length = 0;
          changed = false;
          let _q638 = true;
          Q639: {
            const _a640 = v_N;
            for (let _i641 = 0; _i641 < _a640.length; _i641++) {
              const v_z = _a640[_i641];
              if (!(!(v_U.includes(v_z)))) continue;
              if (!(b.grid[v_z] !== 0)) { if (fire === null) { b.placeAt(v_z, 2); changed = true; } else facts.push(PLACE, v_z, 2); }
              if (!(true)) {
                _q638 = false;
                break Q639;
              }
            }
          }
          if (!(_q638)) return -1;
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

/** `trees(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function trees(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = treesKept.board(cl);
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
