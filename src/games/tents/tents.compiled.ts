// Compiled by `npm run describe` from src/games/tents/tents.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, addOnce, cellsValued, clueAt, freshBinding, keptStore, matched, sameSet, staleChecking, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g906: number[] = [];
  const _g913: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q896 = true;
  Q897: {
    const _a898 = sp.cells;
    for (let _i899 = 0; _i899 < _a898.length; _i899++) {
      const v_a = _a898[_i899];
      const _h900 = (g[v_a] || -1);
      if (!((_h900 === 1))) continue;
      let _q901 = true;
      Q902: {
        const _a903 = sp.adj8[v_a];
        for (let _i904 = 0; _i904 < _a903.length; _i904++) {
          const v_b = _a903[_i904];
          const _h905 = (g[v_b] || -1);
          if (!((_h905 !== 1))) {
            _q901 = false;
            break Q902;
          }
        }
      }
      if (!(_q901)) {
        _q896 = false;
        break Q897;
      }
    }
  }
  if (!(_q896)) return false;
  _g906.length = 0;
  G907: {
    const _a910 = sp.cells;
    for (let _i911 = 0; _i911 < _a910.length; _i911++) {
      const v_c = _a910[_i911];
      const _h912 = (g[v_c] || -1);
      if (!((_h912 === 1))) continue;
      _g906.push(v_c);
    }
  }
  _g913.length = 0;
  G914: {
    const _a917 = sp.cells;
    for (let _i918 = 0; _i918 < _a917.length; _i918++) {
      const v_c = _a917[_i918];
      const _h919 = (g[v_c] || -1);
      if (!((_h919 === 3))) continue;
      _g913.push(v_c);
    }
  }
  if (!(matched(sp, _g906, _g913))) return false;
  for (let _k920 = 0; _k920 < cl.tree.at.length; _k920++) {
    const _at921 = cl.tree.at[_k920];
    if (!(((g[_at921] || -1) === 3))) return false;
  }
  for (let _k923 = 0; _k923 < cl.count.at.length; _k923++) {
    const _at924 = cl.count.at[_k923];
    const _v925 = cl.count.v[_k923];
    let _g926 = 0;
    G927: {
      const _a928 = sp.lineCells[_at924];
      for (let _i929 = 0; _i929 < _a928.length; _i929++) {
        const v_c = _a928[_i929];
        const _h930 = (g[v_c] || -1);
        if (!((_h930 === 1))) continue;
        _g926++;
      }
    }
    if (!((_g926 === _v925))) return false;
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
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("tentLink", [(sp.cells.includes(v_c)), (((b.grid[v_c] || -1) === 1) && (b.markOf(v_c) === -1)), sameSet(v_K, free(b, sp, cl, v_c)), (v_K.length < 2)], ["c in", "where of c", "K =", "where of K"]);
      }
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
    if (import.meta.env.DEV && staleChecking) {
      const _g50: number[] = [];
      G51: {
        const _a54 = sp.cells;
        for (let _i55 = 0; _i55 < _a54.length; _i55++) {
          const v_c = _a54[_i55];
          if (!(((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)) && (trees(sp, cl, v_c).length === 0)))) continue;
          _g50.push(v_c);
        }
      }
      freshBinding("noTree", [sameSet(v_S, _g50), (v_S.length > 0)], ["S =", "where of S"]);
    }
    facts.length = 0;
    changed = false;
    let _q56 = true;
    Q57: {
      const _a58 = v_S;
      for (let _i59 = 0; _i59 < _a58.length; _i59++) {
        const v_c = _a58[_i59];
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        if (!(true)) {
          _q56 = false;
          break Q57;
        }
      }
    }
    if (!(_q56)) return -1;
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
  const _g75: number[] = [];
  const facts = treesDoneFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q71 = false;
    Q72: {
      const _a73 = sp.adj4[cl.tree.at[v_q]];
      for (let _i74 = 0; _i74 < _a73.length; _i74++) {
        const v_x = _a73[_i74];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q71 = true;
          break Q72;
        }
      }
    }
    if (!(_q71)) continue;
    _g75.length = 0;
    G76: {
      const _a79 = sp.adj4[cl.tree.at[v_q]];
      for (let _i80 = 0; _i80 < _a79.length; _i80++) {
        const v_c = _a79[_i80];
        const _h81 = clueAt(cl.tree, v_c);
        if (!(((!((b.grid[v_c] !== 0)) && (_h81 < 0)) && (free(b, sp, cl, v_c).length === 0)))) continue;
        _g75.push(v_c);
      }
    }
    L82: {
      const v_S = _g75;
      const _h83 = v_S.length;
      if (!((_h83 > 0))) break L82;
      if (import.meta.env.DEV && staleChecking) {
        let _q84 = false;
        Q85: {
          const _a86 = sp.adj4[cl.tree.at[v_q]];
          for (let _i87 = 0; _i87 < _a86.length; _i87++) {
            const v_x = _a86[_i87];
            if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
              _q84 = true;
              break Q85;
            }
          }
        }
        const _g88: number[] = [];
        G89: {
          const _a92 = sp.adj4[cl.tree.at[v_q]];
          for (let _i93 = 0; _i93 < _a92.length; _i93++) {
            const v_c = _a92[_i93];
            if (!(((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)) && (free(b, sp, cl, v_c).length === 0)))) continue;
            _g88.push(v_c);
          }
        }
        freshBinding("treesDone", [_q84, sameSet(v_S, _g88), (v_S.length > 0)], ["where of q", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _q94 = true;
      Q95: {
        const _a96 = v_S;
        for (let _i97 = 0; _i97 < _a96.length; _i97++) {
          const v_c = _a96[_i97];
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q94 = false;
            break Q95;
          }
        }
      }
      if (!(_q94)) return -1;
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
  const _g109: number[] = [];
  const facts = nextToTentFacts;
  let fired = 0;
  let changed = false;
  const _a107 = cellsValued(b, sp.cells, 1);
  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
    const v_t = _a107[_i108];
    if (!(((b.grid[v_t] || -1) === 1))) continue;
    _g109.length = 0;
    G110: {
      const _a113 = sp.adj8[v_t];
      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
        const v_x = _a113[_i114];
        const _h115 = clueAt(cl.tree, v_x);
        if (!((!((b.grid[v_x] !== 0)) && (_h115 < 0)))) continue;
        _g109.push(v_x);
      }
    }
    L116: {
      const v_S = _g109;
      const _h117 = v_S.length;
      if (!((_h117 > 0))) break L116;
      if (import.meta.env.DEV && staleChecking) {
        const _g118: number[] = [];
        G119: {
          const _a122 = sp.adj8[v_t];
          for (let _i123 = 0; _i123 < _a122.length; _i123++) {
            const v_x = _a122[_i123];
            if (!((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)))) continue;
            _g118.push(v_x);
          }
        }
        freshBinding("nextToTent", [(sp.cells.includes(v_t)), ((b.grid[v_t] || -1) === 1), sameSet(v_S, _g118), (v_S.length > 0)], ["t in", "where of t", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _q124 = true;
      Q125: {
        const _a126 = sp.adj8[v_t];
        for (let _i127 = 0; _i127 < _a126.length; _i127++) {
          const v_x = _a126[_i127];
          if (!(((b.grid[v_x] || -1) !== 1))) {
            _q124 = false;
            break Q125;
          }
        }
      }
      let _c132: boolean = _q124;
      if (_c132) {
        let _q128 = true;
        Q129: {
          const _a130 = v_S;
          for (let _i131 = 0; _i131 < _a130.length; _i131++) {
            const v_x = _a130[_i131];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q128 = false;
              break Q129;
            }
          }
        }
        _c132 = _q128;
      }
      if (!(_c132)) return -1;
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
  const _g153: number[] = [];
  const facts = treeSingleFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q149 = false;
    Q150: {
      const _a151 = sp.adj4[cl.tree.at[v_q]];
      for (let _i152 = 0; _i152 < _a151.length; _i152++) {
        const v_x = _a151[_i152];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q149 = true;
          break Q150;
        }
      }
    }
    if (!(!(_q149))) continue;
    _g153.length = 0;
    G154: {
      const _a157 = sp.adj4[cl.tree.at[v_q]];
      for (let _i158 = 0; _i158 < _a157.length; _i158++) {
        const v_x = _a157[_i158];
        const _h159 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h159 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g153.push(v_x);
      }
    }
    L160: {
      const v_R = _g153;
      const _h161 = v_R.length;
      let _c167: boolean = (_h161 < 2);
      if (_c167) {
        let _q162 = true;
        Q163: {
          const _a164 = v_R;
          for (let _i165 = 0; _i165 < _a164.length; _i165++) {
            const v_x = _a164[_i165];
            const _h166 = clueAt(cl.tree, v_x);
            if (!((!((b.grid[v_x] !== 0)) && (_h166 < 0)))) {
              _q162 = false;
              break Q163;
            }
          }
        }
        _c167 = _q162;
      }
      if (!(_c167)) break L160;
      if (import.meta.env.DEV && staleChecking) {
        let _q168 = false;
        Q169: {
          const _a170 = sp.adj4[cl.tree.at[v_q]];
          for (let _i171 = 0; _i171 < _a170.length; _i171++) {
            const v_x = _a170[_i171];
            if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
              _q168 = true;
              break Q169;
            }
          }
        }
        const _g172: number[] = [];
        G173: {
          const _a176 = sp.adj4[cl.tree.at[v_q]];
          for (let _i177 = 0; _i177 < _a176.length; _i177++) {
            const v_x = _a176[_i177];
            if (!(((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
            _g172.push(v_x);
          }
        }
        let _c182: boolean = (v_R.length < 2);
        if (_c182) {
          let _q178 = true;
          Q179: {
            const _a180 = v_R;
            for (let _i181 = 0; _i181 < _a180.length; _i181++) {
              const v_x = _a180[_i181];
              if (!((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)))) {
                _q178 = false;
                break Q179;
              }
            }
          }
          _c182 = _q178;
        }
        freshBinding("treeSingle", [!(_q168), sameSet(v_R, _g172), _c182], ["where of q", "R =", "where of R"]);
      }
      facts.length = 0;
      changed = false;
      let _c189: boolean = (_h161 > 0);
      if (_c189) {
        let _q183 = true;
        Q184: {
          const _a185 = v_R;
          for (let _i186 = 0; _i186 < _a185.length; _i186++) {
            const v_x = _a185[_i186];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
            let _c188: boolean = true;
            if (_c188) {
              let _mk187 = v_x >= 0;
              if (_mk187) { const _was = b.markOf(v_x); if (_was >= 0) _mk187 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
              _c188 = _mk187;
            }
            if (!(_c188)) {
              _q183 = false;
              break Q184;
            }
          }
        }
        _c189 = _q183;
      }
      if (!(_c189)) return -1;
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
  const _g207: number[] = [];
  const facts = treeLinkFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q202 = false;
    Q203: {
      const _a204 = sp.adj4[cl.tree.at[v_q]];
      for (let _i205 = 0; _i205 < _a204.length; _i205++) {
        const v_x = _a204[_i205];
        const _h206 = (b.grid[v_x] || -1);
        if (((b.markOf(v_x) === v_q) && (_h206 === 1))) {
          _q202 = true;
          break Q203;
        }
      }
    }
    if (!(!(_q202))) continue;
    _g207.length = 0;
    G208: {
      const _a211 = sp.adj4[cl.tree.at[v_q]];
      for (let _i212 = 0; _i212 < _a211.length; _i212++) {
        const v_x = _a211[_i212];
        const _h213 = (b.grid[v_x] !== 0);
        const _h214 = clueAt(cl.tree, v_x);
        const _h215 = (b.grid[v_x] || -1);
        if (!(((!(_h213) && (_h214 < 0)) || ((_h215 === 1) && (b.markOf(v_x) === -1))))) continue;
        _g207.push(v_x);
      }
    }
    L216: {
      const v_R = _g207;
      const _h217 = v_R.length;
      if (!((_h217 === 1))) break L216;
      L218: {
        const v_x = (v_R[0] ?? -1);
        const _h219 = (b.grid[v_x] || -1);
        if (!((_h219 === 1))) break L218;
        if (import.meta.env.DEV && staleChecking) {
          let _q220 = false;
          Q221: {
            const _a222 = sp.adj4[cl.tree.at[v_q]];
            for (let _i223 = 0; _i223 < _a222.length; _i223++) {
              const v_x = _a222[_i223];
              if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
                _q220 = true;
                break Q221;
              }
            }
          }
          const _g224: number[] = [];
          G225: {
            const _a228 = sp.adj4[cl.tree.at[v_q]];
            for (let _i229 = 0; _i229 < _a228.length; _i229++) {
              const v_x = _a228[_i229];
              if (!(((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
              _g224.push(v_x);
            }
          }
          freshBinding("treeLink", [!(_q220), sameSet(v_R, _g224), (v_R.length === 1), (v_x === (v_R[0] ?? -1)), ((b.grid[v_x] || -1) === 1)], ["where of q", "R =", "where of R", "x =", "where of x"]);
        }
        facts.length = 0;
        changed = false;
        let _mk230 = v_x >= 0;
        if (_mk230) { const _was = b.markOf(v_x); if (_was >= 0) _mk230 = _was === v_q; else if (fire === null) { b.markAt(v_x, v_q); changed = true; } else facts.push(MARK, v_x, v_q); }
        if (!(_mk230)) return -1;
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
  const _g248: number[] = [];
  const facts = treeDiagonalFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.tree.at.length; v_q++) {
    let _q244 = false;
    Q245: {
      const _a246 = sp.adj4[cl.tree.at[v_q]];
      for (let _i247 = 0; _i247 < _a246.length; _i247++) {
        const v_x = _a246[_i247];
        if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
          _q244 = true;
          break Q245;
        }
      }
    }
    if (!(!(_q244))) continue;
    _g248.length = 0;
    G249: {
      const _a252 = sp.adj4[cl.tree.at[v_q]];
      for (let _i253 = 0; _i253 < _a252.length; _i253++) {
        const v_x = _a252[_i253];
        const _h254 = clueAt(cl.tree, v_x);
        if (!(((!((b.grid[v_x] !== 0)) && (_h254 < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
        _g248.push(v_x);
      }
    }
    L255: {
      const v_R = _g248;
      const _h256 = v_R.length;
      if (!((_h256 === 2))) break L255;
      const v_a = (v_R[0] ?? -1);
      L257: {
        const v_b = (v_R[1] ?? -1);
        if (!((((v_a % sp.w) !== (v_b % sp.w)) && (((v_a / sp.w) | 0) !== ((v_b / sp.w) | 0))))) break L257;
        L258: {
          const v_z = (((((v_a / sp.w) | 0) + ((v_b / sp.w) | 0)) - ((cl.tree.at[v_q] / sp.w) | 0)) * sp.w + (((v_a % sp.w) + (v_b % sp.w)) - (cl.tree.at[v_q] % sp.w)));
          const _h259 = clueAt(cl.tree, v_z);
          if (!((!((b.grid[v_z] !== 0)) && (_h259 < 0)))) break L258;
          if (import.meta.env.DEV && staleChecking) {
            let _q260 = false;
            Q261: {
              const _a262 = sp.adj4[cl.tree.at[v_q]];
              for (let _i263 = 0; _i263 < _a262.length; _i263++) {
                const v_x = _a262[_i263];
                if (((b.markOf(v_x) === v_q) && ((b.grid[v_x] || -1) === 1))) {
                  _q260 = true;
                  break Q261;
                }
              }
            }
            const _g264: number[] = [];
            G265: {
              const _a268 = sp.adj4[cl.tree.at[v_q]];
              for (let _i269 = 0; _i269 < _a268.length; _i269++) {
                const v_x = _a268[_i269];
                if (!(((!((b.grid[v_x] !== 0)) && (clueAt(cl.tree, v_x) < 0)) || (((b.grid[v_x] || -1) === 1) && (b.markOf(v_x) === -1))))) continue;
                _g264.push(v_x);
              }
            }
            freshBinding("treeDiagonal", [!(_q260), sameSet(v_R, _g264), (v_R.length === 2), (v_a === (v_R[0] ?? -1)), (v_b === (v_R[1] ?? -1)), (((v_a % sp.w) !== (v_b % sp.w)) && (((v_a / sp.w) | 0) !== ((v_b / sp.w) | 0))), (v_z === (((((v_a / sp.w) | 0) + ((v_b / sp.w) | 0)) - ((cl.tree.at[v_q] / sp.w) | 0)) * sp.w + (((v_a % sp.w) + (v_b % sp.w)) - (cl.tree.at[v_q] % sp.w)))), (!((b.grid[v_z] !== 0)) && (clueAt(cl.tree, v_z) < 0))], ["where of q", "R =", "where of R", "a =", "b =", "where of b", "z =", "where of z"]);
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
let _p432 = new Int32Array(0);
let _l433: readonly number[] = [];
let _f438 = new Int32Array(0);
let _l439: readonly number[] = [];
let _p486 = new Int32Array(0);
let _l487: readonly number[] = [];
let _f492 = new Int32Array(0);
let _l493: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function lineCount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineCountBinding> | null): number {
  const _g395: number[] = [];
  const _g404: number[] = [];
  if (_p432.length < sp.cells.length) _p432 = new Int32Array(sp.cells.length);
  else _p432.fill(0);
  _l433 = [];
  let _y434 = false;
  if (_f438.length < sp.cells.length) _f438 = new Int32Array(sp.cells.length).fill(-1);
  else _f438.fill(-1);
  _l439 = [];
  const _s440: number[] = [];
  const _g458: number[] = [];
  if (_p486.length < sp.cells.length) _p486 = new Int32Array(sp.cells.length);
  else _p486.fill(0);
  _l487 = [];
  let _y488 = false;
  if (_f492.length < sp.cells.length) _f492 = new Int32Array(sp.cells.length).fill(-1);
  else _f492.fill(-1);
  _l493 = [];
  const _s494: number[] = [];
  const facts = lineCountFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (lineCountCands.length < sp.cells.length) lineCountCands = new Int32Array(sp.cells.length);
  const cands = lineCountCands;
  cands.fill(-1);
  const _a388 = sp.lines;
  for (let _i389 = 0; _i389 < _a388.length; _i389++) {
    const v_L = _a388[_i389];
    const _h390 = clueAt(cl.count, v_L);
    let _g391 = 0;
    G392: {
      const _a393 = sp.lineCells[v_L];
      for (let _i394 = 0; _i394 < _a393.length; _i394++) {
        const v_c = _a393[_i394];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g391++;
      }
    }
    const v_k = (_h390 - _g391);
    _g395.length = 0;
    G396: {
      const _a399 = sp.lineCells[v_L];
      for (let _i400 = 0; _i400 < _a399.length; _i400++) {
        const v_c = _a399[_i400];
        const _h401 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h401 < 0)))) continue;
        _g395.push(v_c);
      }
    }
    L402: {
      const v_O = _g395;
      const _h403 = v_O.length;
      if (!((_h403 > 0))) break L402;
      let _g435 = -1;
      const _h446 = (2 * _h403);
      const _h447 = (_h446 - v_k);
      let _g489 = -1;
      _g404.length = 0;
      G405: {
        const _a430 = v_O;
        for (let _i431 = 0; _i431 < _a430.length; _i431++) {
          const v_x = _a430[_i431];
          if (_g435 !== _epoch) {
            _g435 = _epoch;
            for (const _e436 of _l433) _p432[_e436] = 0;
            _y434 = false;
            const _a437 = v_O;
            const _lo448 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi449 = 31 - Math.clz32(b.domain);
            for (const _e441 of _l439) _f438[_e441] = -1;
            _l439 = _a437;
            let _i443 = 0;
            _s440[0] = 0;
            let _o451 = _a437.length === 0;
            for (;;) {
              if (_a437.length === 0) {
                if (!_o451) break;
                _o451 = false;
              }
              while (_a437.length > 0 && _i443 >= 0) {
                const _e441 = _a437[_i443];
                if (_s440[_i443] > 0) _f438[_e441] = -1;
                let _r450 = (cands[_e441] >= 0 ? cands[_e441] : (cands[_e441] = b.cands[_e441])) & ~((2 << _s440[_i443]) - 1);
                let _d442 = 0;
                V445: for (; _r450 !== 0; _r450 &= _r450 - 1) {
                  _d442 = 31 - Math.clz32(_r450 & -_r450);
                  _f438[_e441] = _d442;
                  {
                    let _t452 = _d442;
                    for (let _j444 = 0; _j444 < _i443; _j444++) _t452 += _f438[_a437[_j444]];
                    if (_t452 + (_a437.length - _i443 - 1) * _lo448 > _h447) continue;
                    if (_t452 + (_a437.length - _i443 - 1) * _hi449 < _h447) continue;
                  }
                  for (let _j444 = 0; _j444 < _i443; _j444++) {
                    const _y453 = _a437[_j444];
                    if (!(!((((_f438[_e441] === 1) && (_f438[_y453] === 1)) && (sp.adj4[_e441].includes(_y453)))))) continue V445;
                  }
                  break;
                }
                if (_r450 === 0) {
                  _s440[_i443] = 0;
                  _i443--;
                  continue;
                }
                _s440[_i443] = _d442;
                if (_i443 === _a437.length - 1) break;
                _i443++;
                _s440[_i443] = 0;
              }
              if (_i443 < 0) break;
              let _g454 = 0;
              G455: {
                const _a456 = v_O;
                for (let _i457 = 0; _i457 < _a456.length; _i457++) {
                  const v_y = _a456[_i457];
                  _g454 += _f438[v_y];
                }
              }
              if (!((_g454 === _h447))) continue;
              if (!(true)) continue;
              _l433 = _a437;
              _y434 = true;
              for (const _e436 of _a437) _p432[_e436] |= 1 << _f438[_e436];
            }
          }
          if (!(((((_p432[v_x] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y434 && !v_O.includes(v_x))))) continue;
          _g404.push(v_x);
        }
      }
      const v_T = _g404;
      _g458.length = 0;
      G459: {
        const _a484 = v_O;
        for (let _i485 = 0; _i485 < _a484.length; _i485++) {
          const v_x = _a484[_i485];
          if (_g489 !== _epoch) {
            _g489 = _epoch;
            for (const _e490 of _l487) _p486[_e490] = 0;
            _y488 = false;
            const _a491 = v_O;
            const _lo500 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi501 = 31 - Math.clz32(b.domain);
            for (const _e495 of _l493) _f492[_e495] = -1;
            _l493 = _a491;
            let _i497 = 0;
            _s494[0] = 0;
            let _o503 = _a491.length === 0;
            for (;;) {
              if (_a491.length === 0) {
                if (!_o503) break;
                _o503 = false;
              }
              while (_a491.length > 0 && _i497 >= 0) {
                const _e495 = _a491[_i497];
                if (_s494[_i497] > 0) _f492[_e495] = -1;
                let _r502 = (cands[_e495] >= 0 ? cands[_e495] : (cands[_e495] = b.cands[_e495])) & ~((2 << _s494[_i497]) - 1);
                let _d496 = 0;
                V499: for (; _r502 !== 0; _r502 &= _r502 - 1) {
                  _d496 = 31 - Math.clz32(_r502 & -_r502);
                  _f492[_e495] = _d496;
                  {
                    let _t504 = _d496;
                    for (let _j498 = 0; _j498 < _i497; _j498++) _t504 += _f492[_a491[_j498]];
                    if (_t504 + (_a491.length - _i497 - 1) * _lo500 > _h447) continue;
                    if (_t504 + (_a491.length - _i497 - 1) * _hi501 < _h447) continue;
                  }
                  for (let _j498 = 0; _j498 < _i497; _j498++) {
                    const _y505 = _a491[_j498];
                    if (!(!((((_f492[_e495] === 1) && (_f492[_y505] === 1)) && (sp.adj4[_e495].includes(_y505)))))) continue V499;
                  }
                  break;
                }
                if (_r502 === 0) {
                  _s494[_i497] = 0;
                  _i497--;
                  continue;
                }
                _s494[_i497] = _d496;
                if (_i497 === _a491.length - 1) break;
                _i497++;
                _s494[_i497] = 0;
              }
              if (_i497 < 0) break;
              let _g506 = 0;
              G507: {
                const _a508 = v_O;
                for (let _i509 = 0; _i509 < _a508.length; _i509++) {
                  const v_y = _a508[_i509];
                  _g506 += _f492[v_y];
                }
              }
              if (!((_g506 === _h447))) continue;
              if (!(true)) continue;
              _l487 = _a491;
              _y488 = true;
              for (const _e490 of _a491) _p486[_e490] |= 1 << _f492[_e490];
            }
          }
          if (!(((((_p486[v_x] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y488 && !v_O.includes(v_x))))) continue;
          _g458.push(v_x);
        }
      }
      L510: {
        const v_G = _g458;
        let _q511 = false;
        Q512: {
          const _a513 = v_O;
          for (let _i514 = 0; _i514 < _a513.length; _i514++) {
            const v_x = _a513[_i514];
            if ((!(v_T.includes(v_x)) || !(v_G.includes(v_x)))) {
              _q511 = true;
              break Q512;
            }
          }
        }
        if (!(_q511)) break L510;
        if (import.meta.env.DEV && staleChecking) {
          let _g515 = 0;
          G516: {
            const _a517 = sp.lineCells[v_L];
            for (let _i518 = 0; _i518 < _a517.length; _i518++) {
              const v_c = _a517[_i518];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g515++;
            }
          }
          const _g519: number[] = [];
          G520: {
            const _a523 = sp.lineCells[v_L];
            for (let _i524 = 0; _i524 < _a523.length; _i524++) {
              const v_c = _a523[_i524];
              if (!((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)))) continue;
              _g519.push(v_c);
            }
          }
          const _g525: number[] = [];
          G526: {
            const _a551 = v_O;
            for (let _i552 = 0; _i552 < _a551.length; _i552++) {
              const v_x = _a551[_i552];
              let _q553 = false;
              Q554: {
                const _f556 = new Int32Array(sp.cells.length).fill(-1);
                let _l557: readonly number[] = [];
                const _s558: number[] = [];
                const _a555 = v_O;
                const _t564 = ((2 * v_O.length) - v_k);
                const _lo565 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi566 = 31 - Math.clz32(b.domain);
                for (const _e559 of _l557) _f556[_e559] = -1;
                _l557 = _a555;
                let _i561 = 0;
                _s558[0] = 0;
                let _o568 = _a555.length === 0;
                for (;;) {
                  if (_a555.length === 0) {
                    if (!_o568) break;
                    _o568 = false;
                  }
                  while (_a555.length > 0 && _i561 >= 0) {
                    const _e559 = _a555[_i561];
                    if (_s558[_i561] > 0) _f556[_e559] = -1;
                    let _r567 = (cands[_e559] >= 0 ? cands[_e559] : (cands[_e559] = b.cands[_e559])) & ~((2 << _s558[_i561]) - 1);
                    let _d560 = 0;
                    V563: for (; _r567 !== 0; _r567 &= _r567 - 1) {
                      _d560 = 31 - Math.clz32(_r567 & -_r567);
                      _f556[_e559] = _d560;
                      if (_e559 === v_x && _d560 !== 1) continue;
                      {
                        let _t569 = _d560;
                        for (let _j562 = 0; _j562 < _i561; _j562++) _t569 += _f556[_a555[_j562]];
                        if (_t569 + (_a555.length - _i561 - 1) * _lo565 > _t564) continue;
                        if (_t569 + (_a555.length - _i561 - 1) * _hi566 < _t564) continue;
                      }
                      for (let _j562 = 0; _j562 < _i561; _j562++) {
                        const _y570 = _a555[_j562];
                        if (!(!((((_f556[_e559] === 1) && (_f556[_y570] === 1)) && (sp.adj4[_e559].includes(_y570)))))) continue V563;
                      }
                      break;
                    }
                    if (_r567 === 0) {
                      _s558[_i561] = 0;
                      _i561--;
                      continue;
                    }
                    _s558[_i561] = _d560;
                    if (_i561 === _a555.length - 1) break;
                    _i561++;
                    _s558[_i561] = 0;
                  }
                  if (_i561 < 0) break;
                  let _g571 = 0;
                  G572: {
                    const _a573 = v_O;
                    for (let _i574 = 0; _i574 < _a573.length; _i574++) {
                      const v_y = _a573[_i574];
                      _g571 += _f556[v_y];
                    }
                  }
                  if (!((_g571 === ((2 * v_O.length) - v_k)))) continue;
                  if (true) {
                    _q553 = true;
                    break Q554;
                  }
                }
              }
              if (!(_q553)) continue;
              _g525.push(v_x);
            }
          }
          const _g575: number[] = [];
          G576: {
            const _a601 = v_O;
            for (let _i602 = 0; _i602 < _a601.length; _i602++) {
              const v_x = _a601[_i602];
              let _q603 = false;
              Q604: {
                const _f606 = new Int32Array(sp.cells.length).fill(-1);
                let _l607: readonly number[] = [];
                const _s608: number[] = [];
                const _a605 = v_O;
                const _t614 = ((2 * v_O.length) - v_k);
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
                      if (_e609 === v_x && _d610 !== 2) continue;
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
                  if (!((_g621 === ((2 * v_O.length) - v_k)))) continue;
                  if (true) {
                    _q603 = true;
                    break Q604;
                  }
                }
              }
              if (!(_q603)) continue;
              _g575.push(v_x);
            }
          }
          let _q625 = false;
          Q626: {
            const _a627 = v_O;
            for (let _i628 = 0; _i628 < _a627.length; _i628++) {
              const v_x = _a627[_i628];
              if ((!(v_T.includes(v_x)) || !(v_G.includes(v_x)))) {
                _q625 = true;
                break Q626;
              }
            }
          }
          freshBinding("lineCount", [(sp.lines.includes(v_L)), (v_k === (clueAt(cl.count, v_L) - _g515)), sameSet(v_O, _g519), (v_O.length > 0), sameSet(v_T, _g525), sameSet(v_G, _g575), _q625], ["L in", "k =", "O =", "where of O", "T =", "G =", "where of G"]);
        }
        facts.length = 0;
        changed = false;
        let _q629 = true;
        Q630: {
          const _a631 = v_O;
          for (let _i632 = 0; _i632 < _a631.length; _i632++) {
            const v_x = _a631[_i632];
            let _c634: boolean = ((v_T.includes(v_x)) || (v_G.includes(v_x)));
            if (_c634) {
              let _c633: boolean = !(!(v_T.includes(v_x)));
              if (!_c633) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c633 = true;
              }
              _c634 = _c633;
            }
            let _c636: boolean = _c634;
            if (_c636) {
              let _c635: boolean = !(!(v_G.includes(v_x)));
              if (!_c635) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                _c635 = true;
              }
              _c636 = _c635;
            }
            if (!(_c636)) {
              _q629 = false;
              break Q630;
            }
          }
        }
        if (!(_q629)) return -1;
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
const _st742 = stamps();
const _st779 = stamps();
let _f781 = new Int32Array(0);
let _l782: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function lineNeighbors(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineNeighborsBinding> | null): number {
  const _g727: number[] = [];
  const _g736: number[] = [];
  const _g751: number[] = [];
  if (_f781.length < sp.cells.length) _f781 = new Int32Array(sp.cells.length).fill(-1);
  else _f781.fill(-1);
  _l782 = [];
  const _s783: number[] = [];
  const facts = lineNeighborsFacts;
  let fired = 0;
  let changed = false;
  if (lineNeighborsCands.length < sp.cells.length) lineNeighborsCands = new Int32Array(sp.cells.length);
  const cands = lineNeighborsCands;
  cands.fill(-1);
  const _a720 = sp.lines;
  for (let _i721 = 0; _i721 < _a720.length; _i721++) {
    const v_L = _a720[_i721];
    const _h722 = clueAt(cl.count, v_L);
    let _g723 = 0;
    G724: {
      const _a725 = sp.lineCells[v_L];
      for (let _i726 = 0; _i726 < _a725.length; _i726++) {
        const v_c = _a725[_i726];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g723++;
      }
    }
    const v_k = (_h722 - _g723);
    _g727.length = 0;
    G728: {
      const _a731 = sp.lineCells[v_L];
      for (let _i732 = 0; _i732 < _a731.length; _i732++) {
        const v_c = _a731[_i732];
        const _h733 = clueAt(cl.tree, v_c);
        if (!((!((b.grid[v_c] !== 0)) && (_h733 < 0)))) continue;
        _g727.push(v_c);
      }
    }
    L734: {
      const v_O = _g727;
      const _h735 = v_O.length;
      if (!(((_h735 > 0) && (v_k > 0)))) break L734;
      const _h800 = (2 * _h735);
      const _h801 = (_h800 - v_k);
      _g736.length = 0;
      _st742.pass++;
      G737: {
        const _a743 = v_O;
        for (let _i744 = 0; _i744 < _a743.length; _i744++) {
          const v_y = _a743[_i744];
          const _a745 = sp.adj8[v_y];
          for (let _i746 = 0; _i746 < _a745.length; _i746++) {
            const v_z = _a745[_i746];
            const _h747 = clueAt(cl.tree, v_z);
            if (!(((!((b.grid[v_z] !== 0)) && (_h747 < 0)) && !(sp.lineCells[v_L].includes(v_z))))) continue;
            const _t748 = v_z;
            if (_g736.length < 16) { if (!_g736.includes(_t748)) _g736.push(_t748); } else addOnce(_g736, _st742, _t748);
          }
        }
      }
      L749: {
        const v_N = _g736;
        const _h750 = v_N.length;
        if (!((_h750 > 0))) break L749;
        _g751.length = 0;
        _st779.pass++;
        G752: {
          const _a780 = v_O;
          const _t789 = ((2 * _h735) - v_k);
          const _lo790 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi791 = 31 - Math.clz32(b.domain);
          for (const _e784 of _l782) _f781[_e784] = -1;
          _l782 = _a780;
          let _i786 = 0;
          _s783[0] = 0;
          let _o793 = _a780.length === 0;
          for (;;) {
            if (_a780.length === 0) {
              if (!_o793) break;
              _o793 = false;
            }
            while (_a780.length > 0 && _i786 >= 0) {
              const _e784 = _a780[_i786];
              if (_s783[_i786] > 0) _f781[_e784] = -1;
              let _r792 = (cands[_e784] >= 0 ? cands[_e784] : (cands[_e784] = b.cands[_e784])) & ~((2 << _s783[_i786]) - 1);
              let _d785 = 0;
              V788: for (; _r792 !== 0; _r792 &= _r792 - 1) {
                _d785 = 31 - Math.clz32(_r792 & -_r792);
                _f781[_e784] = _d785;
                {
                  let _t794 = _d785;
                  for (let _j787 = 0; _j787 < _i786; _j787++) _t794 += _f781[_a780[_j787]];
                  if (_t794 + (_a780.length - _i786 - 1) * _lo790 > _t789) continue;
                  if (_t794 + (_a780.length - _i786 - 1) * _hi791 < _t789) continue;
                }
                for (let _j787 = 0; _j787 < _i786; _j787++) {
                  const _y795 = _a780[_j787];
                  if (!(!((((_f781[_e784] === 1) && (_f781[_y795] === 1)) && (sp.adj4[_e784].includes(_y795)))))) continue V788;
                }
                break;
              }
              if (_r792 === 0) {
                _s783[_i786] = 0;
                _i786--;
                continue;
              }
              _s783[_i786] = _d785;
              if (_i786 === _a780.length - 1) break;
              _i786++;
              _s783[_i786] = 0;
            }
            if (_i786 < 0) break;
            let _g796 = 0;
            G797: {
              const _a798 = v_O;
              for (let _i799 = 0; _i799 < _a798.length; _i799++) {
                const v_y = _a798[_i799];
                _g796 += _f781[v_y];
              }
            }
            if (!((_g796 === _h801))) continue;
            const _a802 = v_N;
            for (let _i803 = 0; _i803 < _a802.length; _i803++) {
              const v_z = _a802[_i803];
              let _q804 = true;
              Q805: {
                const _a806 = v_O;
                for (let _i807 = 0; _i807 < _a806.length; _i807++) {
                  const v_y = _a806[_i807];
                  if (!((sp.adj8[v_z].includes(v_y)))) continue;
                  if (!((_f781[v_y] === 2))) {
                    _q804 = false;
                    break Q805;
                  }
                }
              }
              if (!(_q804)) continue;
              const _t808 = v_z;
              if (_g751.length < 16) { if (!_g751.includes(_t808)) _g751.push(_t808); } else addOnce(_g751, _st779, _t808);
            }
          }
        }
        L809: {
          const v_U = _g751;
          let _q810 = false;
          Q811: {
            const _a812 = v_N;
            for (let _i813 = 0; _i813 < _a812.length; _i813++) {
              const v_z = _a812[_i813];
              if (!(v_U.includes(v_z))) {
                _q810 = true;
                break Q811;
              }
            }
          }
          if (!(_q810)) break L809;
          if (import.meta.env.DEV && staleChecking) {
            let _g814 = 0;
            G815: {
              const _a816 = sp.lineCells[v_L];
              for (let _i817 = 0; _i817 < _a816.length; _i817++) {
                const v_c = _a816[_i817];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g814++;
              }
            }
            const _g818: number[] = [];
            G819: {
              const _a822 = sp.lineCells[v_L];
              for (let _i823 = 0; _i823 < _a822.length; _i823++) {
                const v_c = _a822[_i823];
                if (!((!((b.grid[v_c] !== 0)) && (clueAt(cl.tree, v_c) < 0)))) continue;
                _g818.push(v_c);
              }
            }
            const _g824: number[] = [];
            G825: {
              const _a830 = v_O;
              for (let _i831 = 0; _i831 < _a830.length; _i831++) {
                const v_y = _a830[_i831];
                const _a832 = sp.adj8[v_y];
                for (let _i833 = 0; _i833 < _a832.length; _i833++) {
                  const v_z = _a832[_i833];
                  if (!(((!((b.grid[v_z] !== 0)) && (clueAt(cl.tree, v_z) < 0)) && !(sp.lineCells[v_L].includes(v_z))))) continue;
                  if (!_g824.includes(v_z)) _g824.push(v_z);
                }
              }
            }
            const _g834: number[] = [];
            G835: {
              const _f863 = new Int32Array(sp.cells.length).fill(-1);
              let _l864: readonly number[] = [];
              const _s865: number[] = [];
              const _a862 = v_O;
              const _t871 = ((2 * v_O.length) - v_k);
              const _lo872 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi873 = 31 - Math.clz32(b.domain);
              for (const _e866 of _l864) _f863[_e866] = -1;
              _l864 = _a862;
              let _i868 = 0;
              _s865[0] = 0;
              let _o875 = _a862.length === 0;
              for (;;) {
                if (_a862.length === 0) {
                  if (!_o875) break;
                  _o875 = false;
                }
                while (_a862.length > 0 && _i868 >= 0) {
                  const _e866 = _a862[_i868];
                  if (_s865[_i868] > 0) _f863[_e866] = -1;
                  let _r874 = (cands[_e866] >= 0 ? cands[_e866] : (cands[_e866] = b.cands[_e866])) & ~((2 << _s865[_i868]) - 1);
                  let _d867 = 0;
                  V870: for (; _r874 !== 0; _r874 &= _r874 - 1) {
                    _d867 = 31 - Math.clz32(_r874 & -_r874);
                    _f863[_e866] = _d867;
                    {
                      let _t876 = _d867;
                      for (let _j869 = 0; _j869 < _i868; _j869++) _t876 += _f863[_a862[_j869]];
                      if (_t876 + (_a862.length - _i868 - 1) * _lo872 > _t871) continue;
                      if (_t876 + (_a862.length - _i868 - 1) * _hi873 < _t871) continue;
                    }
                    for (let _j869 = 0; _j869 < _i868; _j869++) {
                      const _y877 = _a862[_j869];
                      if (!(!((((_f863[_e866] === 1) && (_f863[_y877] === 1)) && (sp.adj4[_e866].includes(_y877)))))) continue V870;
                    }
                    break;
                  }
                  if (_r874 === 0) {
                    _s865[_i868] = 0;
                    _i868--;
                    continue;
                  }
                  _s865[_i868] = _d867;
                  if (_i868 === _a862.length - 1) break;
                  _i868++;
                  _s865[_i868] = 0;
                }
                if (_i868 < 0) break;
                let _g878 = 0;
                G879: {
                  const _a880 = v_O;
                  for (let _i881 = 0; _i881 < _a880.length; _i881++) {
                    const v_y = _a880[_i881];
                    _g878 += _f863[v_y];
                  }
                }
                if (!((_g878 === ((2 * v_O.length) - v_k)))) continue;
                const _a882 = v_N;
                for (let _i883 = 0; _i883 < _a882.length; _i883++) {
                  const v_z = _a882[_i883];
                  let _q884 = true;
                  Q885: {
                    const _a886 = v_O;
                    for (let _i887 = 0; _i887 < _a886.length; _i887++) {
                      const v_y = _a886[_i887];
                      if (!((sp.adj8[v_z].includes(v_y)))) continue;
                      if (!((_f863[v_y] === 2))) {
                        _q884 = false;
                        break Q885;
                      }
                    }
                  }
                  if (!(_q884)) continue;
                  if (!_g834.includes(v_z)) _g834.push(v_z);
                }
              }
            }
            let _q888 = false;
            Q889: {
              const _a890 = v_N;
              for (let _i891 = 0; _i891 < _a890.length; _i891++) {
                const v_z = _a890[_i891];
                if (!(v_U.includes(v_z))) {
                  _q888 = true;
                  break Q889;
                }
              }
            }
            freshBinding("lineNeighbors", [(sp.lines.includes(v_L)), (v_k === (clueAt(cl.count, v_L) - _g814)), sameSet(v_O, _g818), ((v_O.length > 0) && (v_k > 0)), sameSet(v_N, _g824), (v_N.length > 0), sameSet(v_U, _g834), _q888], ["L in", "k =", "O =", "where of O", "N =", "where of N", "U =", "where of U"]);
          }
          facts.length = 0;
          changed = false;
          let _q892 = true;
          Q893: {
            const _a894 = v_N;
            for (let _i895 = 0; _i895 < _a894.length; _i895++) {
              const v_z = _a894[_i895];
              if (!(!(v_U.includes(v_z)))) continue;
              if (!(b.grid[v_z] !== 0)) { if (fire === null) { b.placeAt(v_z, 2); changed = true; } else facts.push(PLACE, v_z, 2); }
              if (!(true)) {
                _q892 = false;
                break Q893;
              }
            }
          }
          if (!(_q892)) return -1;
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
