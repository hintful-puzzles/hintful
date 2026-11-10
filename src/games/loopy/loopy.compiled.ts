// Compiled by `npm run describe` from src/games/loopy/loopy.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, RELATE, STRIKE_EDGE, clueAt, edgeGroups, freshBinding, keptEdgeGroups, keptStore, least, minus, popcount, rangeMask, sameSet, setOf, staleChecking, through, type Footprint, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "deadEnd" | "lineContinues" | "dotFull" | "clueFull" | "clueStarved" | "clueBlockedPair" | "clueOneShort" | "earlyLoop" | "closed" | "related" | "cornerAtDot" | "cornerOther" | "cornerBoth" | "clueBound" | "cornerFromClue" | "cornerAcross" | "cornerExit" | "cornerOppositeExit" | "matchingPair" | "pairAtClue" | "parityClue" | "linkClue" | "pairFromCorner" | "cornerFromPair" | "pairAtDot" | "parityDot" | "linkDot";

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
  { id: "deadEnd", tier: 0 },
  { id: "lineContinues", tier: 0 },
  { id: "dotFull", tier: 0 },
  { id: "clueFull", tier: 0 },
  { id: "clueStarved", tier: 0 },
  { id: "clueBlockedPair", tier: 0 },
  { id: "clueOneShort", tier: 0 },
  { id: "earlyLoop", tier: 0 },
  { id: "closed", tier: 0 },
  { id: "related", tier: 0 },
  { id: "cornerAtDot", tier: 1 },
  { id: "cornerOther", tier: 1 },
  { id: "cornerBoth", tier: 1 },
  { id: "clueBound", tier: 1 },
  { id: "cornerFromClue", tier: 2 },
  { id: "cornerAcross", tier: 2 },
  { id: "cornerExit", tier: 2 },
  { id: "cornerOppositeExit", tier: 2 },
  { id: "matchingPair", tier: 3 },
  { id: "pairAtClue", tier: 3 },
  { id: "parityClue", tier: 3 },
  { id: "linkClue", tier: 3 },
  { id: "pairFromCorner", tier: 3 },
  { id: "cornerFromPair", tier: 3 },
  { id: "pairAtDot", tier: 3 },
  { id: "parityDot", tier: 3 },
  { id: "linkDot", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g1813: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1791 = true;
  Q1792: {
    const _a1793 = sp.cells;
    for (let _i1794 = 0; _i1794 < _a1793.length; _i1794++) {
      const v_c = _a1793[_i1794];
      let _g1795 = 0;
      G1796: {
        const _a1797 = sp.cellEdges[v_c];
        for (let _i1798 = 0; _i1798 < _a1797.length; _i1798++) {
          const v_e = _a1797[_i1798];
          const _h1799 = (g[v_e] || -1);
          if (!((_h1799 === 1))) continue;
          _g1795++;
        }
      }
      let _c1805: boolean = (_g1795 === 0);
      if (!_c1805) {
        let _g1800 = 0;
        G1801: {
          const _a1802 = sp.cellEdges[v_c];
          for (let _i1803 = 0; _i1803 < _a1802.length; _i1803++) {
            const v_e = _a1802[_i1803];
            const _h1804 = (g[v_e] || -1);
            if (!((_h1804 === 1))) continue;
            _g1800++;
          }
        }
        _c1805 = (_g1800 === 2);
      }
      if (!(_c1805)) {
        _q1791 = false;
        break Q1792;
      }
    }
  }
  if (!(_q1791)) return false;
  let _q1806 = false;
  Q1807: {
    const _a1808 = sp.edges;
    for (let _i1809 = 0; _i1809 < _a1808.length; _i1809++) {
      const v_e = _a1808[_i1809];
      const _h1810 = (g[v_e] || -1);
      if ((_h1810 === 1)) {
        _q1806 = true;
        break Q1807;
      }
    }
  }
  let _c1835: boolean = _q1806;
  if (_c1835) {
    let _q1811 = true;
    Q1812: {
      _g1813.length = 0;
      G1814: {
        const _a1817 = sp.edges;
        for (let _i1818 = 0; _i1818 < _a1817.length; _i1818++) {
          const v_e = _a1817[_i1818];
          const _h1819 = (g[v_e] || -1);
          if (!((_h1819 === 1))) continue;
          _g1813.push(v_e);
        }
      }
      const v_L = _g1813;
      const _eg1834 = edgeGroups(sp, v_L);
      const _a1820 = sp.cells;
      for (let _i1821 = 0; _i1821 < _a1820.length; _i1821++) {
        const v_a = _a1820[_i1821];
        let _g1822 = 0;
        G1823: {
          const _a1824 = sp.cellEdges[v_a];
          for (let _i1825 = 0; _i1825 < _a1824.length; _i1825++) {
            const v_e = _a1824[_i1825];
            const _h1826 = (g[v_e] || -1);
            if (!((_h1826 === 1))) continue;
            _g1822++;
          }
        }
        if (!((_g1822 > 0))) continue;
        const _a1827 = sp.cells;
        for (let _i1828 = 0; _i1828 < _a1827.length; _i1828++) {
          const v_b = _a1827[_i1828];
          let _g1829 = 0;
          G1830: {
            const _a1831 = sp.cellEdges[v_b];
            for (let _i1832 = 0; _i1832 < _a1831.length; _i1832++) {
              const v_e = _a1831[_i1832];
              const _h1833 = (g[v_e] || -1);
              if (!((_h1833 === 1))) continue;
              _g1829++;
            }
          }
          if (!((_g1829 > 0))) continue;
          if (!((_eg1834.of(v_b) === _eg1834.of(v_a)))) {
            _q1811 = false;
            break Q1812;
          }
        }
      }
    }
    _c1835 = _q1811;
  }
  if (!(_c1835)) return false;
  for (let _k1836 = 0; _k1836 < cl.number.at.length; _k1836++) {
    const _at1837 = cl.number.at[_k1836];
    let _g1839 = 0;
    G1840: {
      const _a1841 = sp.faceEdges[_at1837];
      for (let _i1842 = 0; _i1842 < _a1841.length; _i1842++) {
        const v_e = _a1841[_i1842];
        const _h1843 = (g[v_e] || -1);
        if (!((_h1843 === 1))) continue;
        _g1839++;
      }
    }
    if (!((_g1839 === clueAt(cl.number, _at1837)))) return false;
  }
  return true;
}

export interface DeadEndBinding {
  c: number;
}

const deadEndFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const deadEndFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function deadEnd(b: Marks, sp: GridSpace, fire: Fire<DeadEndBinding> | null): number {
  const facts = deadEndFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(deadEndFootprint) ?? null) : null;
  const _a12 = sp.cells;
  for (let _i13 = 0; _i13 < _a12.length; _i13++) {
    const v_c = _a12[_i13];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g14 = 0;
    G15: {
      const _a16 = sp.cellEdges[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_e = _a16[_i17];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g14++;
      }
    }
    let _c22: boolean = (_g14 === 0);
    if (_c22) {
      let _g18 = 0;
      G19: {
        const _a20 = sp.cellEdges[v_c];
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_e = _a20[_i21];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g18++;
        }
      }
      _c22 = (_g18 === 1);
    }
    if (!(_c22)) continue;
    if (import.meta.env.DEV && staleChecking) {
      let _g23 = 0;
      G24: {
        const _a25 = sp.cellEdges[v_c];
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_e = _a25[_i26];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g23++;
        }
      }
      let _c31: boolean = (_g23 === 0);
      if (_c31) {
        let _g27 = 0;
        G28: {
          const _a29 = sp.cellEdges[v_c];
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_e = _a29[_i30];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g27++;
          }
        }
        _c31 = (_g27 === 1);
      }
      freshBinding("deadEnd", [(sp.cells.includes(v_c)), _c31], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _q32 = true;
    Q33: {
      const _a34 = sp.cellEdges[v_c];
      for (let _i35 = 0; _i35 < _a34.length; _i35++) {
        const v_e = _a34[_i35];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) {
          _q32 = false;
          break Q33;
        }
      }
    }
    if (!(_q32)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface LineContinuesBinding {
  c: number;
  o: number;
}

const lineContinuesFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const lineContinuesFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function lineContinues(b: Marks, sp: GridSpace, fire: Fire<LineContinuesBinding> | null): number {
  const facts = lineContinuesFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(lineContinuesFootprint) ?? null) : null;
  const _a47 = sp.cells;
  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
    const v_c = _a47[_i48];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g49 = 0;
    G50: {
      const _a51 = sp.cellEdges[v_c];
      for (let _i52 = 0; _i52 < _a51.length; _i52++) {
        const v_e = _a51[_i52];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g49++;
      }
    }
    L53: {
      const v_o = _g49;
      let _g54 = 0;
      G55: {
        const _a56 = sp.cellEdges[v_c];
        for (let _i57 = 0; _i57 < _a56.length; _i57++) {
          const v_e = _a56[_i57];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g54++;
        }
      }
      if (!(((_g54 === 1) && (v_o <= 1)))) break L53;
      if (import.meta.env.DEV && staleChecking) {
        let _g58 = 0;
        G59: {
          const _a60 = sp.cellEdges[v_c];
          for (let _i61 = 0; _i61 < _a60.length; _i61++) {
            const v_e = _a60[_i61];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g58++;
          }
        }
        let _g62 = 0;
        G63: {
          const _a64 = sp.cellEdges[v_c];
          for (let _i65 = 0; _i65 < _a64.length; _i65++) {
            const v_e = _a64[_i65];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g62++;
          }
        }
        freshBinding("lineContinues", [(sp.cells.includes(v_c)), (v_o === _g58), ((_g62 === 1) && (v_o <= 1))], ["c in", "o =", "where of o"]);
      }
      facts.length = 0;
      changed = false;
      let _c70: boolean = (v_o === 1);
      if (_c70) {
        let _q66 = true;
        Q67: {
          const _a68 = sp.cellEdges[v_c];
          for (let _i69 = 0; _i69 < _a68.length; _i69++) {
            const v_e = _a68[_i69];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            if (!(true)) {
              _q66 = false;
              break Q67;
            }
          }
        }
        _c70 = _q66;
      }
      if (!(_c70)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, o: v_o }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DotFullBinding {
  c: number;
  k: number;
}

const dotFullFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const dotFullFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function dotFull(b: Marks, sp: GridSpace, fire: Fire<DotFullBinding> | null): number {
  const facts = dotFullFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(dotFullFootprint) ?? null) : null;
  const _a84 = sp.cells;
  for (let _i85 = 0; _i85 < _a84.length; _i85++) {
    const v_c = _a84[_i85];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g86 = 0;
    G87: {
      const _a88 = sp.cellEdges[v_c];
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_e = _a88[_i89];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g86++;
      }
    }
    L90: {
      const v_k = _g86;
      let _c96: boolean = (v_k > 2);
      if (!_c96) {
        let _c95: boolean = (v_k === 2);
        if (_c95) {
          let _g91 = 0;
          G92: {
            const _a93 = sp.cellEdges[v_c];
            for (let _i94 = 0; _i94 < _a93.length; _i94++) {
              const v_e = _a93[_i94];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g91++;
            }
          }
          _c95 = (_g91 > 0);
        }
        _c96 = _c95;
      }
      if (!(_c96)) break L90;
      if (import.meta.env.DEV && staleChecking) {
        let _g97 = 0;
        G98: {
          const _a99 = sp.cellEdges[v_c];
          for (let _i100 = 0; _i100 < _a99.length; _i100++) {
            const v_e = _a99[_i100];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g97++;
          }
        }
        let _c106: boolean = (v_k > 2);
        if (!_c106) {
          let _c105: boolean = (v_k === 2);
          if (_c105) {
            let _g101 = 0;
            G102: {
              const _a103 = sp.cellEdges[v_c];
              for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                const v_e = _a103[_i104];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g101++;
              }
            }
            _c105 = (_g101 > 0);
          }
          _c106 = _c105;
        }
        freshBinding("dotFull", [(sp.cells.includes(v_c)), (v_k === _g97), _c106], ["c in", "k =", "where of k"]);
      }
      facts.length = 0;
      changed = false;
      let _c111: boolean = (v_k === 2);
      if (_c111) {
        let _q107 = true;
        Q108: {
          const _a109 = sp.cellEdges[v_c];
          for (let _i110 = 0; _i110 < _a109.length; _i110++) {
            const v_e = _a109[_i110];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q107 = false;
              break Q108;
            }
          }
        }
        _c111 = _q107;
      }
      if (!(_c111)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, k: v_k }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueFullBinding {
  f: number;
  n: number;
}

const clueFullFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueFullFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueFullBinding> | null): number {
  const facts = clueFullFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueFullFootprint) ?? null) : null;
  const _a125 = sp.faces;
  for (let _i126 = 0; _i126 < _a125.length; _i126++) {
    const v_f = _a125[_i126];
    const _h127 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h127 !== -1))) continue;
    let _g128 = 0;
    G129: {
      const _a130 = sp.faceEdges[v_f];
      for (let _i131 = 0; _i131 < _a130.length; _i131++) {
        const v_e = _a130[_i131];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g128++;
      }
    }
    L132: {
      const v_n = (_h127 - _g128);
      let _c138: boolean = (v_n < 0);
      if (!_c138) {
        let _c137: boolean = (v_n === 0);
        if (_c137) {
          let _g133 = 0;
          G134: {
            const _a135 = sp.faceEdges[v_f];
            for (let _i136 = 0; _i136 < _a135.length; _i136++) {
              const v_e = _a135[_i136];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g133++;
            }
          }
          _c137 = (_g133 > 0);
        }
        _c138 = _c137;
      }
      if (!(_c138)) break L132;
      if (import.meta.env.DEV && staleChecking) {
        let _g139 = 0;
        G140: {
          const _a141 = sp.faceEdges[v_f];
          for (let _i142 = 0; _i142 < _a141.length; _i142++) {
            const v_e = _a141[_i142];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g139++;
          }
        }
        let _c148: boolean = (v_n < 0);
        if (!_c148) {
          let _c147: boolean = (v_n === 0);
          if (_c147) {
            let _g143 = 0;
            G144: {
              const _a145 = sp.faceEdges[v_f];
              for (let _i146 = 0; _i146 < _a145.length; _i146++) {
                const v_e = _a145[_i146];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g143++;
              }
            }
            _c147 = (_g143 > 0);
          }
          _c148 = _c147;
        }
        freshBinding("clueFull", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === (clueAt(cl.number, v_f) - _g139)), _c148], ["f in", "where of f", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c153: boolean = (v_n === 0);
      if (_c153) {
        let _q149 = true;
        Q150: {
          const _a151 = sp.faceEdges[v_f];
          for (let _i152 = 0; _i152 < _a151.length; _i152++) {
            const v_e = _a151[_i152];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q149 = false;
              break Q150;
            }
          }
        }
        _c153 = _q149;
      }
      if (!(_c153)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueStarvedBinding {
  f: number;
  n: number;
  o: number;
}

const clueStarvedFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueStarvedFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueStarved(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueStarvedBinding> | null): number {
  const facts = clueStarvedFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueStarvedFootprint) ?? null) : null;
  const _a165 = sp.faces;
  for (let _i166 = 0; _i166 < _a165.length; _i166++) {
    const v_f = _a165[_i166];
    const _h167 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h167 !== -1))) continue;
    let _g168 = 0;
    G169: {
      const _a170 = sp.faceEdges[v_f];
      for (let _i171 = 0; _i171 < _a170.length; _i171++) {
        const v_e = _a170[_i171];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g168++;
      }
    }
    const v_n = (_h167 - _g168);
    let _g172 = 0;
    G173: {
      const _a174 = sp.faceEdges[v_f];
      for (let _i175 = 0; _i175 < _a174.length; _i175++) {
        const v_e = _a174[_i175];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g172++;
      }
    }
    L176: {
      const v_o = _g172;
      if (!(((v_n > 0) && (v_o <= v_n)))) break L176;
      if (import.meta.env.DEV && staleChecking) {
        let _g177 = 0;
        G178: {
          const _a179 = sp.faceEdges[v_f];
          for (let _i180 = 0; _i180 < _a179.length; _i180++) {
            const v_e = _a179[_i180];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g177++;
          }
        }
        let _g181 = 0;
        G182: {
          const _a183 = sp.faceEdges[v_f];
          for (let _i184 = 0; _i184 < _a183.length; _i184++) {
            const v_e = _a183[_i184];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g181++;
          }
        }
        freshBinding("clueStarved", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === (clueAt(cl.number, v_f) - _g177)), (v_o === _g181), ((v_n > 0) && (v_o <= v_n))], ["f in", "where of f", "n =", "o =", "where of o"]);
      }
      facts.length = 0;
      changed = false;
      let _c189: boolean = (v_o === v_n);
      if (_c189) {
        let _q185 = true;
        Q186: {
          const _a187 = sp.faceEdges[v_f];
          for (let _i188 = 0; _i188 < _a187.length; _i188++) {
            const v_e = _a187[_i188];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            if (!(true)) {
              _q185 = false;
              break Q186;
            }
          }
        }
        _c189 = _q185;
      }
      if (!(_c189)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, n: v_n, o: v_o }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueBlockedPairBinding {
  f: number;
  e: number;
}

const clueBlockedPairFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueBlockedPairFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueBlockedPair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBlockedPairBinding> | null): number {
  const facts = clueBlockedPairFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueBlockedPairFootprint) ?? null) : null;
  const _a222 = sp.faces;
  R1:
  for (let _i223 = 0; _i223 < _a222.length; _i223++) {
    const v_f = _a222[_i223];
    const _m114_0 = b.made[0];
    const _h224 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c233: boolean = (_h224 !== -1);
    if (_c233) {
      let _g225 = 0;
      G226: {
        const _a227 = sp.faceEdges[v_f];
        for (let _i228 = 0; _i228 < _a227.length; _i228++) {
          const v_e = _a227[_i228];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g225++;
        }
      }
      let _g229 = 0;
      G230: {
        const _a231 = sp.faceEdges[v_f];
        for (let _i232 = 0; _i232 < _a231.length; _i232++) {
          const v_e = _a231[_i232];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g229++;
        }
      }
      _c233 = ((_h224 - _g225) === (_g229 - 1));
    }
    let _c238: boolean = _c233;
    if (_c238) {
      let _g234 = 0;
      G235: {
        const _a236 = sp.faceEdges[v_f];
        for (let _i237 = 0; _i237 < _a236.length; _i237++) {
          const v_e = _a236[_i237];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g234++;
        }
      }
      _c238 = (_g234 > 2);
    }
    if (!(_c238)) continue;
    const _a239 = sp.faceEdges[v_f];
    for (let _i240 = 0; _i240 < _a239.length; _i240++) {
      const v_e = _a239[_i240];
      let _c254: boolean = !((b.grid[v_e] !== 0));
      if (_c254) {
        let _q241 = true;
        Q242: {
          const _a243 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
          for (let _i244 = 0; _i244 < _a243.length; _i244++) {
            const v_c = _a243[_i244];
            let _g245 = 0;
            G246: {
              const _a247 = sp.cellEdges[v_c];
              for (let _i248 = 0; _i248 < _a247.length; _i248++) {
                const v_e = _a247[_i248];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g245++;
              }
            }
            let _c253: boolean = (_g245 > 0);
            if (_c253) {
              let _q249 = true;
              Q250: {
                const _a251 = sp.faceEdges[v_f];
                for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                  const v_g = _a251[_i252];
                  if (!(((v_g !== v_e) && ([sp.edgeEnds[2 * v_g], sp.edgeEnds[2 * v_g + 1]].includes(v_c))))) continue;
                  if (!(!((b.grid[v_g] !== 0)))) {
                    _q249 = false;
                    break Q250;
                  }
                }
              }
              _c253 = _q249;
            }
            if (!(_c253)) {
              _q241 = false;
              break Q242;
            }
          }
        }
        _c254 = _q241;
      }
      if (!(_c254)) continue;
      if (b.made[0] !== _m114_0) {
        let _c263: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c263) {
          let _g255 = 0;
          G256: {
            const _a257 = sp.faceEdges[v_f];
            for (let _i258 = 0; _i258 < _a257.length; _i258++) {
              const v_e = _a257[_i258];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g255++;
            }
          }
          let _g259 = 0;
          G260: {
            const _a261 = sp.faceEdges[v_f];
            for (let _i262 = 0; _i262 < _a261.length; _i262++) {
              const v_e = _a261[_i262];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g259++;
            }
          }
          _c263 = ((clueAt(cl.number, v_f) - _g255) === (_g259 - 1));
        }
        let _c268: boolean = _c263;
        if (_c268) {
          let _g264 = 0;
          G265: {
            const _a266 = sp.faceEdges[v_f];
            for (let _i267 = 0; _i267 < _a266.length; _i267++) {
              const v_e = _a266[_i267];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g264++;
            }
          }
          _c268 = (_g264 > 2);
        }
        if (!(_c268)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c277: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c277) {
          let _g269 = 0;
          G270: {
            const _a271 = sp.faceEdges[v_f];
            for (let _i272 = 0; _i272 < _a271.length; _i272++) {
              const v_e = _a271[_i272];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g269++;
            }
          }
          let _g273 = 0;
          G274: {
            const _a275 = sp.faceEdges[v_f];
            for (let _i276 = 0; _i276 < _a275.length; _i276++) {
              const v_e = _a275[_i276];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g273++;
            }
          }
          _c277 = ((clueAt(cl.number, v_f) - _g269) === (_g273 - 1));
        }
        let _c282: boolean = _c277;
        if (_c282) {
          let _g278 = 0;
          G279: {
            const _a280 = sp.faceEdges[v_f];
            for (let _i281 = 0; _i281 < _a280.length; _i281++) {
              const v_e = _a280[_i281];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g278++;
            }
          }
          _c282 = (_g278 > 2);
        }
        let _c296: boolean = !((b.grid[v_e] !== 0));
        if (_c296) {
          let _q283 = true;
          Q284: {
            const _a285 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
            for (let _i286 = 0; _i286 < _a285.length; _i286++) {
              const v_c = _a285[_i286];
              let _g287 = 0;
              G288: {
                const _a289 = sp.cellEdges[v_c];
                for (let _i290 = 0; _i290 < _a289.length; _i290++) {
                  const v_e = _a289[_i290];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g287++;
                }
              }
              let _c295: boolean = (_g287 > 0);
              if (_c295) {
                let _q291 = true;
                Q292: {
                  const _a293 = sp.faceEdges[v_f];
                  for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                    const v_g = _a293[_i294];
                    if (!(((v_g !== v_e) && ([sp.edgeEnds[2 * v_g], sp.edgeEnds[2 * v_g + 1]].includes(v_c))))) continue;
                    if (!(!((b.grid[v_g] !== 0)))) {
                      _q291 = false;
                      break Q292;
                    }
                  }
                }
                _c295 = _q291;
              }
              if (!(_c295)) {
                _q283 = false;
                break Q284;
              }
            }
          }
          _c296 = _q283;
        }
        freshBinding("clueBlockedPair", [(sp.faces.includes(v_f)), _c282, (sp.faceEdges[v_f].includes(v_e)), _c296], ["f in", "where of f", "e in", "where of e"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      let _c301: boolean = true;
      if (_c301) {
        let _q297 = true;
        Q298: {
          const _a299 = sp.faceEdges[v_f];
          for (let _i300 = 0; _i300 < _a299.length; _i300++) {
            const v_g = _a299[_i300];
            if (!(((v_g !== v_e) && !((b.grid[v_g] !== 0))))) continue;
            if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
            if (!(true)) {
              _q297 = false;
              break Q298;
            }
          }
        }
        _c301 = _q297;
      }
      if (!(_c301)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, e: v_e }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueOneShortBinding {
  f: number;
  a: number;
}

const clueOneShortFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueOneShortFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceAngles","angleEdges"],"kind":"answer"},{"steps":["faceAngles","angleCell","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueOneShort(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueOneShortBinding> | null): number {
  const facts = clueOneShortFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueOneShortFootprint) ?? null) : null;
  const _a330 = sp.faces;
  R1:
  for (let _i331 = 0; _i331 < _a330.length; _i331++) {
    const v_f = _a330[_i331];
    const _m142_0 = b.made[0];
    const _h332 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c341: boolean = (_h332 !== -1);
    if (_c341) {
      let _g333 = 0;
      G334: {
        const _a335 = sp.faceEdges[v_f];
        for (let _i336 = 0; _i336 < _a335.length; _i336++) {
          const v_e = _a335[_i336];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g333++;
        }
      }
      let _g337 = 0;
      G338: {
        const _a339 = sp.faceEdges[v_f];
        for (let _i340 = 0; _i340 < _a339.length; _i340++) {
          const v_e = _a339[_i340];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g337++;
        }
      }
      _c341 = ((_h332 - _g333) === (_g337 - 1));
    }
    let _c346: boolean = _c341;
    if (_c346) {
      let _g342 = 0;
      G343: {
        const _a344 = sp.faceEdges[v_f];
        for (let _i345 = 0; _i345 < _a344.length; _i345++) {
          const v_e = _a344[_i345];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g342++;
        }
      }
      _c346 = (_g342 > 2);
    }
    if (!(_c346)) continue;
    const _a347 = sp.faceAngles[v_f];
    for (let _i348 = 0; _i348 < _a347.length; _i348++) {
      const v_a = _a347[_i348];
      let _q349 = true;
      Q350: {
        const _a351 = sp.angleEdges[v_a];
        for (let _i352 = 0; _i352 < _a351.length; _i352++) {
          const v_e = _a351[_i352];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q349 = false;
            break Q350;
          }
        }
      }
      let _c358: boolean = _q349;
      if (_c358) {
        const _t353 = sp.angleCell[v_a];
        let _g354 = 0;
        G355: {
          const _a356 = sp.cellEdges[_t353];
          for (let _i357 = 0; _i357 < _a356.length; _i357++) {
            const v_e = _a356[_i357];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g354++;
          }
        }
        _c358 = (_g354 > 0);
      }
      if (!(_c358)) continue;
      if (b.made[0] !== _m142_0) {
        let _c367: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c367) {
          let _g359 = 0;
          G360: {
            const _a361 = sp.faceEdges[v_f];
            for (let _i362 = 0; _i362 < _a361.length; _i362++) {
              const v_e = _a361[_i362];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g359++;
            }
          }
          let _g363 = 0;
          G364: {
            const _a365 = sp.faceEdges[v_f];
            for (let _i366 = 0; _i366 < _a365.length; _i366++) {
              const v_e = _a365[_i366];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g363++;
            }
          }
          _c367 = ((clueAt(cl.number, v_f) - _g359) === (_g363 - 1));
        }
        let _c372: boolean = _c367;
        if (_c372) {
          let _g368 = 0;
          G369: {
            const _a370 = sp.faceEdges[v_f];
            for (let _i371 = 0; _i371 < _a370.length; _i371++) {
              const v_e = _a370[_i371];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g368++;
            }
          }
          _c372 = (_g368 > 2);
        }
        if (!(_c372)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c381: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c381) {
          let _g373 = 0;
          G374: {
            const _a375 = sp.faceEdges[v_f];
            for (let _i376 = 0; _i376 < _a375.length; _i376++) {
              const v_e = _a375[_i376];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g373++;
            }
          }
          let _g377 = 0;
          G378: {
            const _a379 = sp.faceEdges[v_f];
            for (let _i380 = 0; _i380 < _a379.length; _i380++) {
              const v_e = _a379[_i380];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g377++;
            }
          }
          _c381 = ((clueAt(cl.number, v_f) - _g373) === (_g377 - 1));
        }
        let _c386: boolean = _c381;
        if (_c386) {
          let _g382 = 0;
          G383: {
            const _a384 = sp.faceEdges[v_f];
            for (let _i385 = 0; _i385 < _a384.length; _i385++) {
              const v_e = _a384[_i385];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g382++;
            }
          }
          _c386 = (_g382 > 2);
        }
        let _q387 = true;
        Q388: {
          const _a389 = sp.angleEdges[v_a];
          for (let _i390 = 0; _i390 < _a389.length; _i390++) {
            const v_e = _a389[_i390];
            if (!(!((b.grid[v_e] !== 0)))) {
              _q387 = false;
              break Q388;
            }
          }
        }
        let _c396: boolean = _q387;
        if (_c396) {
          const _t391 = sp.angleCell[v_a];
          let _g392 = 0;
          G393: {
            const _a394 = sp.cellEdges[_t391];
            for (let _i395 = 0; _i395 < _a394.length; _i395++) {
              const v_e = _a394[_i395];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g392++;
            }
          }
          _c396 = (_g392 > 0);
        }
        freshBinding("clueOneShort", [(sp.faces.includes(v_f)), _c386, (sp.faceAngles[v_f].includes(v_a)), _c396], ["f in", "where of f", "a in", "where of a"]);
      }
      facts.length = 0;
      changed = false;
      let _q397 = true;
      Q398: {
        const _a399 = sp.faceEdges[v_f];
        for (let _i400 = 0; _i400 < _a399.length; _i400++) {
          const v_g = _a399[_i400];
          if (!((!((b.grid[v_g] !== 0)) && !(sp.angleEdges[v_a].includes(v_g))))) continue;
          if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
          if (!(true)) {
            _q397 = false;
            break Q398;
          }
        }
      }
      if (!(_q397)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, a: v_a }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface EarlyLoopBinding {
  L: readonly number[];
  e: number;
  G: readonly number[];
}

const earlyLoopFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function earlyLoop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyLoopBinding> | null): number {
  const _g428: number[] = [];
  const _g457: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  const _m167_0 = b.made[0];
  _g428.length = 0;
  G429: {
    const _a432 = sp.edges;
    for (let _i433 = 0; _i433 < _a432.length; _i433++) {
      const v_e = _a432[_i433];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g428.push(v_e);
    }
  }
  const v_L = _g428;
  const _m170_1 = b.made[1];
  const _m170_2 = b.made[2];
  const _m170_4 = b.made[4];
  const _eg436 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a434 = sp.edges;
  for (let _i435 = 0; _i435 < _a434.length; _i435++) {
    const v_e = _a434[_i435];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L437: {
      const v_G = _eg436.of(sp.edgeEnds[2 * v_e]);
      let _c456: boolean = (_eg436.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c456) {
        let _q438 = false;
        Q439: {
          const _a440 = v_L;
          for (let _i441 = 0; _i441 < _a440.length; _i441++) {
            const v_g = _a440[_i441];
            if (!(_eg436.of(sp.edgeEnds[2 * v_g]) === v_G)) {
              _q438 = true;
              break Q439;
            }
          }
        }
        let _c455: boolean = _q438;
        if (!_c455) {
          let _q442 = false;
          Q443: {
            const _a444 = sp.faces;
            for (let _i445 = 0; _i445 < _a444.length; _i445++) {
              const v_f = _a444[_i445];
              const _h446 = clueAt(cl.number, v_f);
              if (!((_h446 !== -1))) continue;
              let _g447 = 0;
              G448: {
                const _a449 = sp.faceEdges[v_f];
                for (let _i450 = 0; _i450 < _a449.length; _i450++) {
                  const v_e = _a449[_i450];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g447++;
                }
              }
              let _g451 = 0;
              G452: {
                const _a453 = sp.faceEdges[v_f];
                for (let _i454 = 0; _i454 < _a453.length; _i454++) {
                  const v_x = _a453[_i454];
                  if (!((v_x === v_e))) continue;
                  _g451++;
                }
              }
              if (((_h446 - _g447) !== _g451)) {
                _q442 = true;
                break Q443;
              }
            }
          }
          _c455 = _q442;
        }
        _c456 = _c455;
      }
      if (!(_c456)) break L437;
      if (b.made[0] !== _m167_0 || b.made[1] !== _m170_1 || b.made[2] !== _m170_2 || b.made[4] !== _m170_4) {
        _g457.length = 0;
        G458: {
          const _a461 = sp.edges;
          for (let _i462 = 0; _i462 < _a461.length; _i462++) {
            const v_e = _a461[_i462];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g457.push(v_e);
          }
        }
        if (!(sameSet(v_L, _g457))) { return fired; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g463: number[] = [];
        G464: {
          const _a467 = sp.edges;
          for (let _i468 = 0; _i468 < _a467.length; _i468++) {
            const v_e = _a467[_i468];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g463.push(v_e);
          }
        }
        let _c486: boolean = (_eg436.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c486) {
          let _q469 = false;
          Q470: {
            const _a471 = v_L;
            for (let _i472 = 0; _i472 < _a471.length; _i472++) {
              const v_g = _a471[_i472];
              if (!(_eg436.of(sp.edgeEnds[2 * v_g]) === v_G)) {
                _q469 = true;
                break Q470;
              }
            }
          }
          let _c485: boolean = _q469;
          if (!_c485) {
            let _q473 = false;
            Q474: {
              const _a475 = sp.faces;
              for (let _i476 = 0; _i476 < _a475.length; _i476++) {
                const v_f = _a475[_i476];
                if (!((clueAt(cl.number, v_f) !== -1))) continue;
                let _g477 = 0;
                G478: {
                  const _a479 = sp.faceEdges[v_f];
                  for (let _i480 = 0; _i480 < _a479.length; _i480++) {
                    const v_e = _a479[_i480];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g477++;
                  }
                }
                let _g481 = 0;
                G482: {
                  const _a483 = sp.faceEdges[v_f];
                  for (let _i484 = 0; _i484 < _a483.length; _i484++) {
                    const v_x = _a483[_i484];
                    if (!((v_x === v_e))) continue;
                    _g481++;
                  }
                }
                if (((clueAt(cl.number, v_f) - _g477) !== _g481)) {
                  _q473 = true;
                  break Q474;
                }
              }
            }
            _c485 = _q473;
          }
          _c486 = _c485;
        }
        freshBinding("earlyLoop", [sameSet(v_L, _g463), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_L)), _c486], ["L =", "e in", "where of e", "G =", "where of G"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L.slice(), e: v_e, G: v_G.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClosedBinding {
  L: readonly number[];
  g: number;
}

const closedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function closed(b: Marks, sp: GridSpace, fire: Fire<ClosedBinding> | null): number {
  const _g513: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g513.length = 0;
  G514: {
    const _a517 = sp.edges;
    for (let _i518 = 0; _i518 < _a517.length; _i518++) {
      const v_e = _a517[_i518];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g513.push(v_e);
    }
  }
  const v_L = _g513;
  const _eg539 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L519: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    const _h538 = sp.edgeEnds[2 * v_g];
    let _c524: boolean = (v_g !== -1);
    if (_c524) {
      let _q520 = false;
      Q521: {
        const _a522 = sp.edges;
        for (let _i523 = 0; _i523 < _a522.length; _i523++) {
          const v_e = _a522[_i523];
          if (!((b.grid[v_e] !== 0))) {
            _q520 = true;
            break Q521;
          }
        }
      }
      _c524 = _q520;
    }
    let _c533: boolean = _c524;
    if (_c533) {
      let _q525 = true;
      Q526: {
        const _a527 = sp.cells;
        for (let _i528 = 0; _i528 < _a527.length; _i528++) {
          const v_c = _a527[_i528];
          let _g529 = 0;
          G530: {
            const _a531 = sp.cellEdges[v_c];
            for (let _i532 = 0; _i532 < _a531.length; _i532++) {
              const v_e = _a531[_i532];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g529++;
            }
          }
          if (!((_g529 !== 1))) {
            _q525 = false;
            break Q526;
          }
        }
      }
      _c533 = _q525;
    }
    let _c540: boolean = _c533;
    if (_c540) {
      let _q534 = true;
      Q535: {
        const _a536 = v_L;
        for (let _i537 = 0; _i537 < _a536.length; _i537++) {
          const v_x = _a536[_i537];
          if (!((_eg539.of(sp.edgeEnds[2 * v_x]) === _eg539.of(_h538)))) {
            _q534 = false;
            break Q535;
          }
        }
      }
      _c540 = _q534;
    }
    if (!(_c540)) break L519;
    if (import.meta.env.DEV && staleChecking) {
      const _g541: number[] = [];
      G542: {
        const _a545 = sp.edges;
        for (let _i546 = 0; _i546 < _a545.length; _i546++) {
          const v_e = _a545[_i546];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g541.push(v_e);
        }
      }
      let _c551: boolean = (v_g !== -1);
      if (_c551) {
        let _q547 = false;
        Q548: {
          const _a549 = sp.edges;
          for (let _i550 = 0; _i550 < _a549.length; _i550++) {
            const v_e = _a549[_i550];
            if (!((b.grid[v_e] !== 0))) {
              _q547 = true;
              break Q548;
            }
          }
        }
        _c551 = _q547;
      }
      let _c560: boolean = _c551;
      if (_c560) {
        let _q552 = true;
        Q553: {
          const _a554 = sp.cells;
          for (let _i555 = 0; _i555 < _a554.length; _i555++) {
            const v_c = _a554[_i555];
            let _g556 = 0;
            G557: {
              const _a558 = sp.cellEdges[v_c];
              for (let _i559 = 0; _i559 < _a558.length; _i559++) {
                const v_e = _a558[_i559];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g556++;
              }
            }
            if (!((_g556 !== 1))) {
              _q552 = false;
              break Q553;
            }
          }
        }
        _c560 = _q552;
      }
      let _c565: boolean = _c560;
      if (_c565) {
        let _q561 = true;
        Q562: {
          const _a563 = v_L;
          for (let _i564 = 0; _i564 < _a563.length; _i564++) {
            const v_x = _a563[_i564];
            if (!((through(sp, sp.edgeEnds[2 * v_g], v_L).includes(sp.edgeEnds[2 * v_x])))) {
              _q561 = false;
              break Q562;
            }
          }
        }
        _c565 = _q561;
      }
      freshBinding("closed", [sameSet(v_L, _g541), (v_g === (v_L.length > 0 ? v_L[0] : -1)), _c565], ["L =", "g =", "where of g"]);
    }
    facts.length = 0;
    changed = false;
    let _q566 = true;
    Q567: {
      const _a568 = sp.edges;
      for (let _i569 = 0; _i569 < _a568.length; _i569++) {
        const v_e = _a568[_i569];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) {
          _q566 = false;
          break Q567;
        }
      }
    }
    if (!(_q566)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ L: v_L.slice(), g: v_g }, facts)) return 1;
    }
  }
  return fired;
}

export interface RelatedBinding {
  e: number;
  g: number;
}

const relatedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function related(b: Marks, sp: GridSpace, fire: Fire<RelatedBinding> | null): number {
  const facts = relatedFacts;
  let fired = 0;
  let changed = false;
  const _h578 = ((1 << 1));
  const _h581 = ((1 << 2));
  const _a574 = sp.edges;
  R1:
  for (let _i575 = 0; _i575 < _a574.length; _i575++) {
    const v_e = _a574[_i575];
    const _m216_0 = b.made[0];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _m219_4 = b.made[4];
    const _a576 = b.relatedOf(v_e);
    R2:
    for (let _i577 = 0; _i577 < _a576.length; _i577++) {
      const v_g = _a576[_i577];
      if (!((b.grid[v_g] !== 0))) continue;
      if (b.made[0] !== _m216_0 || b.made[4] !== _m219_4) {
        if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
        if (!((b.relatedOf(v_e).includes(v_g)))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("related", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), (b.relatedOf(v_e).includes(v_g)), (b.grid[v_g] !== 0)], ["e in", "where of e", "g in", "where of g"]);
      }
      facts.length = 0;
      changed = false;
      let _c580: boolean = !((b.pairOf(v_e, v_g) === _h578));
      if (!_c580) {
        const _t579 = (b.grid[v_g] || -1);
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t579); changed = true; } else facts.push(PLACE, v_e, _t579); }
        _c580 = true;
      }
      let _c584: boolean = _c580;
      if (_c584) {
        let _c583: boolean = !((b.pairOf(v_e, v_g) === _h581));
        if (!_c583) {
          const _t582 = (3 - (b.grid[v_g] || -1));
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t582); changed = true; } else facts.push(PLACE, v_e, _t582); }
          _c583 = true;
        }
        _c584 = _c583;
      }
      if (!(_c584)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, g: v_g }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerAtDotBinding {
  c: number;
  a: number;
}

const cornerAtDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerAtDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellAngles","angleEdges"],"kind":"answer"},{"steps":["cellAngles"],"kind":"edgeMark"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerAtDot(b: Marks, sp: GridSpace, fire: Fire<CornerAtDotBinding> | null): number {
  const facts = cornerAtDotFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(cornerAtDotFootprint) ?? null) : null;
  const _a597 = sp.cells;
  R1:
  for (let _i598 = 0; _i598 < _a597.length; _i598++) {
    const v_c = _a597[_i598];
    const _m234_0 = b.made[0];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g599 = 0;
    G600: {
      const _a601 = sp.cellEdges[v_c];
      for (let _i602 = 0; _i602 < _a601.length; _i602++) {
        const v_e = _a601[_i602];
        const _h603 = (b.grid[v_e] || -1);
        if (!((_h603 === 1))) continue;
        _g599++;
      }
    }
    if (!((_g599 === 1))) continue;
    const _a604 = sp.cellAngles[v_c];
    for (let _i605 = 0; _i605 < _a604.length; _i605++) {
      const v_a = _a604[_i605];
      let _q606 = true;
      Q607: {
        const _a608 = sp.angleEdges[v_a];
        for (let _i609 = 0; _i609 < _a608.length; _i609++) {
          const v_e = _a608[_i609];
          const _h610 = (b.grid[v_e] !== 0);
          if (!(!(_h610))) {
            _q606 = false;
            break Q607;
          }
        }
      }
      if (!(_q606)) continue;
      if (b.made[0] !== _m234_0) {
        let _g611 = 0;
        G612: {
          const _a613 = sp.cellEdges[v_c];
          for (let _i614 = 0; _i614 < _a613.length; _i614++) {
            const v_e = _a613[_i614];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g611++;
          }
        }
        if (!((_g611 === 1))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _g615 = 0;
        G616: {
          const _a617 = sp.cellEdges[v_c];
          for (let _i618 = 0; _i618 < _a617.length; _i618++) {
            const v_e = _a617[_i618];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g615++;
          }
        }
        let _q619 = true;
        Q620: {
          const _a621 = sp.angleEdges[v_a];
          for (let _i622 = 0; _i622 < _a621.length; _i622++) {
            const v_e = _a621[_i622];
            if (!(!((b.grid[v_e] !== 0)))) {
              _q619 = false;
              break Q620;
            }
          }
        }
        freshBinding("cornerAtDot", [(sp.cells.includes(v_c)), (_g615 === 1), (sp.cellAngles[v_c].includes(v_a)), _q619], ["c in", "where of c", "a in", "where of a"]);
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
      let _c628: boolean = true;
      if (_c628) {
        let _c627: boolean = !((dotOpen(b, sp, v_c) === 2));
        if (!_c627) {
          if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
          _c627 = true;
        }
        _c628 = _c627;
      }
      if (!(_c628)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, a: v_a }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerOtherBinding {
  a: number;
  e: number;
  g: number;
}

const cornerOtherFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerOtherFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerOther(b: Marks, sp: GridSpace, fire: Fire<CornerOtherBinding> | null): number {
  const facts = cornerOtherFacts;
  let fired = 0;
  let changed = false;
  const _h637 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerOtherFootprint) ?? null) : null;
  const _a635 = sp.angles;
  R1:
  for (let _i636 = 0; _i636 < _a635.length; _i636++) {
    const v_a = _a635[_i636];
    const _m252_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    if (!((b.edgeCand(v_a) !== _h637))) continue;
    const _a638 = sp.angleEdges[v_a];
    for (let _i639 = 0; _i639 < _a638.length; _i639++) {
      const v_e = _a638[_i639];
      const _a640 = sp.angleEdges[v_a];
      for (let _i641 = 0; _i641 < _a640.length; _i641++) {
        const v_g = _a640[_i641];
        if (!(((((v_g !== v_e) && (b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && ((((b.grid[v_e] || -1) === 1) && !(((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (((b.grid[v_e] || -1) === 2) && !(((b.edgeCand(v_a) >> 0) & 1) !== 0)))))) continue;
        if (b.made[2] !== _m252_2) {
          if (!((b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("cornerOther", [(sp.angles.includes(v_a)), (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))), (sp.angleEdges[v_a].includes(v_e)), (sp.angleEdges[v_a].includes(v_g)), ((((v_g !== v_e) && (b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && ((((b.grid[v_e] || -1) === 1) && !(((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (((b.grid[v_e] || -1) === 2) && !(((b.edgeCand(v_a) >> 0) & 1) !== 0))))], ["a in", "where of a", "e in", "g in", "where of g"]);
        }
        facts.length = 0;
        changed = false;
        const _t642 = (3 - (b.grid[v_e] || -1));
        if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, _t642); changed = true; } else facts.push(PLACE, v_g, _t642); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, e: v_e, g: v_g }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CornerBothBinding {
  a: number;
  c: number;
}

const cornerBothFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerBothFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerBoth(b: Marks, sp: GridSpace, fire: Fire<CornerBothBinding> | null): number {
  const facts = cornerBothFacts;
  let fired = 0;
  let changed = false;
  const _h662 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerBothFootprint) ?? null) : null;
  const _a660 = sp.angles;
  for (let _i661 = 0; _i661 < _a660.length; _i661++) {
    const v_a = _a660[_i661];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c667: boolean = (b.edgeCand(v_a) !== _h662);
    if (_c667) {
      let _q663 = true;
      Q664: {
        const _a665 = sp.angleEdges[v_a];
        for (let _i666 = 0; _i666 < _a665.length; _i666++) {
          const v_e = _a665[_i666];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q663 = false;
            break Q664;
          }
        }
      }
      _c667 = _q663;
    }
    if (!(_c667)) continue;
    L668: {
      const v_c = sp.angleCell[v_a];
      let _g669 = 0;
      G670: {
        const _a671 = sp.cellEdges[v_c];
        for (let _i672 = 0; _i672 < _a671.length; _i672++) {
          const v_e = _a671[_i672];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g669++;
        }
      }
      let _c677: boolean = (_g669 === 0);
      if (_c677) {
        let _g673 = 0;
        G674: {
          const _a675 = sp.cellEdges[v_c];
          for (let _i676 = 0; _i676 < _a675.length; _i676++) {
            const v_e = _a675[_i676];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g673++;
          }
        }
        _c677 = (_g673 === 2);
      }
      if (!(_c677)) break L668;
      if (import.meta.env.DEV && staleChecking) {
        let _c682: boolean = (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2)));
        if (_c682) {
          let _q678 = true;
          Q679: {
            const _a680 = sp.angleEdges[v_a];
            for (let _i681 = 0; _i681 < _a680.length; _i681++) {
              const v_e = _a680[_i681];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q678 = false;
                break Q679;
              }
            }
          }
          _c682 = _q678;
        }
        let _g683 = 0;
        G684: {
          const _a685 = sp.cellEdges[v_c];
          for (let _i686 = 0; _i686 < _a685.length; _i686++) {
            const v_e = _a685[_i686];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g683++;
          }
        }
        let _c691: boolean = (_g683 === 0);
        if (_c691) {
          let _g687 = 0;
          G688: {
            const _a689 = sp.cellEdges[v_c];
            for (let _i690 = 0; _i690 < _a689.length; _i690++) {
              const v_e = _a689[_i690];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g687++;
            }
          }
          _c691 = (_g687 === 2);
        }
        freshBinding("cornerBoth", [(sp.angles.includes(v_a)), _c682, (v_c === sp.angleCell[v_a]), _c691], ["a in", "where of a", "c =", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      let _c697: boolean = ((((b.edgeCand(v_a) >> 0) & 1) !== 0) || (((b.edgeCand(v_a) >> 2) & 1) !== 0));
      if (_c697) {
        let _c696: boolean = !(!(((b.edgeCand(v_a) >> 2) & 1) !== 0));
        if (!_c696) {
          let _q692 = true;
          Q693: {
            const _a694 = sp.angleEdges[v_a];
            for (let _i695 = 0; _i695 < _a694.length; _i695++) {
              const v_e = _a694[_i695];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
              if (!(true)) {
                _q692 = false;
                break Q693;
              }
            }
          }
          _c696 = _q692;
        }
        _c697 = _c696;
      }
      let _c703: boolean = _c697;
      if (_c703) {
        let _c702: boolean = !(!(((b.edgeCand(v_a) >> 0) & 1) !== 0));
        if (!_c702) {
          let _q698 = true;
          Q699: {
            const _a700 = sp.angleEdges[v_a];
            for (let _i701 = 0; _i701 < _a700.length; _i701++) {
              const v_e = _a700[_i701];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q698 = false;
                break Q699;
              }
            }
          }
          _c702 = _q698;
        }
        _c703 = _c702;
      }
      if (!(_c703)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, c: v_c }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueBoundBinding {
  f: number;
  n: number;
  e: number;
  S: readonly number[];
  P: boolean;
  Q: boolean;
}

const clueBoundFacts: number[] = [];
let clueBoundCands = new Int32Array(0);
let _f789 = new Int32Array(0);
let _l790: readonly number[] = [];
let _f819 = new Int32Array(0);
let _l820: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const clueBoundFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceAngles","angleEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueBound(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBoundBinding> | null): number {
  if (_f789.length < sp.edges.length) _f789 = new Int32Array(sp.edges.length).fill(-1);
  else _f789.fill(-1);
  _l790 = [];
  const _s791: number[] = [];
  if (_f819.length < sp.edges.length) _f819 = new Int32Array(sp.edges.length).fill(-1);
  else _f819.fill(-1);
  _l820 = [];
  const _s821: number[] = [];
  const facts = clueBoundFacts;
  let fired = 0;
  let changed = false;
  const _h782 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (clueBoundCands.length < sp.edges.length) clueBoundCands = new Int32Array(sp.edges.length);
  const cands = clueBoundCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(clueBoundFootprint) ?? null) : null;
  const _a771 = sp.faces;
  R1:
  for (let _i772 = 0; _i772 < _a771.length; _i772++) {
    const v_f = _a771[_i772];
    const _m292_0 = b.made[0];
    const _m292_2 = b.made[2];
    const _h773 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c783: boolean = (_h773 !== -1);
    if (_c783) {
      let _q774 = false;
      Q775: {
        const _a776 = sp.faceAngles[v_f];
        for (let _i777 = 0; _i777 < _a776.length; _i777++) {
          const v_a = _a776[_i777];
          let _q778 = true;
          Q779: {
            const _a780 = sp.angleEdges[v_a];
            for (let _i781 = 0; _i781 < _a780.length; _i781++) {
              const v_e = _a780[_i781];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q778 = false;
                break Q779;
              }
            }
          }
          if ((_q778 && (b.edgeCand(v_a) !== _h782))) {
            _q774 = true;
            break Q775;
          }
        }
      }
      _c783 = _q774;
    }
    if (!(_c783)) continue;
    const v_n = _h773;
    const _h815 = (v_n - 1);
    const _a784 = sp.faceEdges[v_f];
    for (let _i785 = 0; _i785 < _a784.length; _i785++) {
      const v_e = _a784[_i785];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      const v_S = minus(sp.faceEdges[v_f], setOf(v_e));
      const _h797 = v_S.length;
      const _h813 = (2 * _h797);
      const _h814 = (_h813 - v_n);
      const _h842 = (_h813 - _h815);
      let _q786 = false;
      Q787: {
        const _a788 = v_S;
        const _t798 = ((2 * _h797) - v_n);
        const _lo799 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi800 = 31 - Math.clz32(b.domain);
        for (const _e792 of _l790) _f789[_e792] = -1;
        _l790 = _a788;
        let _i794 = 0;
        _s791[0] = 0;
        let _o802 = _a788.length === 0;
        for (;;) {
          if (_a788.length === 0) {
            if (!_o802) break;
            _o802 = false;
          }
          while (_a788.length > 0 && _i794 >= 0) {
            const _e792 = _a788[_i794];
            if (_s791[_i794] > 0) _f789[_e792] = -1;
            let _r801 = (cands[_e792] >= 0 ? cands[_e792] : (cands[_e792] = b.cands[_e792])) & ~((2 << _s791[_i794]) - 1);
            let _d793 = 0;
            V796: for (; _r801 !== 0; _r801 &= _r801 - 1) {
              _d793 = 31 - Math.clz32(_r801 & -_r801);
              _f789[_e792] = _d793;
              {
                let _t803 = _d793;
                for (let _j795 = 0; _j795 < _i794; _j795++) _t803 += _f789[_a788[_j795]];
                if (_t803 + (_a788.length - _i794 - 1) * _lo799 > _t798) continue;
                if (_t803 + (_a788.length - _i794 - 1) * _hi800 < _t798) continue;
              }
              for (let _j795 = 0; _j795 < _i794; _j795++) {
                const _y804 = _a788[_j795];
                let _q805 = true;
                Q806: {
                  const _a807 = sp.faceAngles[v_f];
                  for (let _i808 = 0; _i808 < _a807.length; _i808++) {
                    const v_a = _a807[_i808];
                    if (!(((sp.angleEdges[v_a].includes(_e792)) && (sp.angleEdges[v_a].includes(_y804))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - _f789[_e792]) - _f789[_y804])) & 1) !== 0))) {
                      _q805 = false;
                      break Q806;
                    }
                  }
                }
                if (!(_q805)) continue V796;
              }
              break;
            }
            if (_r801 === 0) {
              _s791[_i794] = 0;
              _i794--;
              continue;
            }
            _s791[_i794] = _d793;
            if (_i794 === _a788.length - 1) break;
            _i794++;
            _s791[_i794] = 0;
          }
          if (_i794 < 0) break;
          let _g809 = 0;
          G810: {
            const _a811 = v_S;
            for (let _i812 = 0; _i812 < _a811.length; _i812++) {
              const v_x = _a811[_i812];
              _g809 += _f789[v_x];
            }
          }
          if (!((_g809 === _h814))) continue;
          if (true) {
            _q786 = true;
            break Q787;
          }
        }
      }
      const v_P = _q786;
      let _q816 = false;
      Q817: {
        const _a818 = v_S;
        const _t827 = ((2 * _h797) - _h815);
        const _lo828 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi829 = 31 - Math.clz32(b.domain);
        for (const _e822 of _l820) _f819[_e822] = -1;
        _l820 = _a818;
        let _i824 = 0;
        _s821[0] = 0;
        let _o831 = _a818.length === 0;
        for (;;) {
          if (_a818.length === 0) {
            if (!_o831) break;
            _o831 = false;
          }
          while (_a818.length > 0 && _i824 >= 0) {
            const _e822 = _a818[_i824];
            if (_s821[_i824] > 0) _f819[_e822] = -1;
            let _r830 = (cands[_e822] >= 0 ? cands[_e822] : (cands[_e822] = b.cands[_e822])) & ~((2 << _s821[_i824]) - 1);
            let _d823 = 0;
            V826: for (; _r830 !== 0; _r830 &= _r830 - 1) {
              _d823 = 31 - Math.clz32(_r830 & -_r830);
              _f819[_e822] = _d823;
              {
                let _t832 = _d823;
                for (let _j825 = 0; _j825 < _i824; _j825++) _t832 += _f819[_a818[_j825]];
                if (_t832 + (_a818.length - _i824 - 1) * _lo828 > _t827) continue;
                if (_t832 + (_a818.length - _i824 - 1) * _hi829 < _t827) continue;
              }
              for (let _j825 = 0; _j825 < _i824; _j825++) {
                const _y833 = _a818[_j825];
                let _q834 = true;
                Q835: {
                  const _a836 = sp.faceAngles[v_f];
                  for (let _i837 = 0; _i837 < _a836.length; _i837++) {
                    const v_a = _a836[_i837];
                    if (!(((sp.angleEdges[v_a].includes(_e822)) && (sp.angleEdges[v_a].includes(_y833))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - _f819[_e822]) - _f819[_y833])) & 1) !== 0))) {
                      _q834 = false;
                      break Q835;
                    }
                  }
                }
                if (!(_q834)) continue V826;
              }
              break;
            }
            if (_r830 === 0) {
              _s821[_i824] = 0;
              _i824--;
              continue;
            }
            _s821[_i824] = _d823;
            if (_i824 === _a818.length - 1) break;
            _i824++;
            _s821[_i824] = 0;
          }
          if (_i824 < 0) break;
          let _g838 = 0;
          G839: {
            const _a840 = v_S;
            for (let _i841 = 0; _i841 < _a840.length; _i841++) {
              const v_x = _a840[_i841];
              _g838 += _f819[v_x];
            }
          }
          if (!((_g838 === _h842))) continue;
          if (true) {
            _q816 = true;
            break Q817;
          }
        }
      }
      L843: {
        const v_Q = _q816;
        if (!((!(v_P) || !(v_Q)))) break L843;
        if (b.made[0] !== _m292_0 || b.made[2] !== _m292_2) {
          let _c852: boolean = (clueAt(cl.number, v_f) !== -1);
          if (_c852) {
            let _q844 = false;
            Q845: {
              const _a846 = sp.faceAngles[v_f];
              for (let _i847 = 0; _i847 < _a846.length; _i847++) {
                const v_a = _a846[_i847];
                let _q848 = true;
                Q849: {
                  const _a850 = sp.angleEdges[v_a];
                  for (let _i851 = 0; _i851 < _a850.length; _i851++) {
                    const v_e = _a850[_i851];
                    if (!(!((b.grid[v_e] !== 0)))) {
                      _q848 = false;
                      break Q849;
                    }
                  }
                }
                if ((_q848 && (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) {
                  _q844 = true;
                  break Q845;
                }
              }
            }
            _c852 = _q844;
          }
          if (!(_c852)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c861: boolean = (clueAt(cl.number, v_f) !== -1);
          if (_c861) {
            let _q853 = false;
            Q854: {
              const _a855 = sp.faceAngles[v_f];
              for (let _i856 = 0; _i856 < _a855.length; _i856++) {
                const v_a = _a855[_i856];
                let _q857 = true;
                Q858: {
                  const _a859 = sp.angleEdges[v_a];
                  for (let _i860 = 0; _i860 < _a859.length; _i860++) {
                    const v_e = _a859[_i860];
                    if (!(!((b.grid[v_e] !== 0)))) {
                      _q857 = false;
                      break Q858;
                    }
                  }
                }
                if ((_q857 && (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) {
                  _q853 = true;
                  break Q854;
                }
              }
            }
            _c861 = _q853;
          }
          let _q862 = false;
          Q863: {
            const _f865 = new Int32Array(sp.edges.length).fill(-1);
            let _l866: readonly number[] = [];
            const _s867: number[] = [];
            const _a864 = v_S;
            const _t873 = ((2 * v_S.length) - v_n);
            const _lo874 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi875 = 31 - Math.clz32(b.domain);
            for (const _e868 of _l866) _f865[_e868] = -1;
            _l866 = _a864;
            let _i870 = 0;
            _s867[0] = 0;
            let _o877 = _a864.length === 0;
            for (;;) {
              if (_a864.length === 0) {
                if (!_o877) break;
                _o877 = false;
              }
              while (_a864.length > 0 && _i870 >= 0) {
                const _e868 = _a864[_i870];
                if (_s867[_i870] > 0) _f865[_e868] = -1;
                let _r876 = (cands[_e868] >= 0 ? cands[_e868] : (cands[_e868] = b.cands[_e868])) & ~((2 << _s867[_i870]) - 1);
                let _d869 = 0;
                V872: for (; _r876 !== 0; _r876 &= _r876 - 1) {
                  _d869 = 31 - Math.clz32(_r876 & -_r876);
                  _f865[_e868] = _d869;
                  {
                    let _t878 = _d869;
                    for (let _j871 = 0; _j871 < _i870; _j871++) _t878 += _f865[_a864[_j871]];
                    if (_t878 + (_a864.length - _i870 - 1) * _lo874 > _t873) continue;
                    if (_t878 + (_a864.length - _i870 - 1) * _hi875 < _t873) continue;
                  }
                  for (let _j871 = 0; _j871 < _i870; _j871++) {
                    const _y879 = _a864[_j871];
                    let _q880 = true;
                    Q881: {
                      const _a882 = sp.faceAngles[v_f];
                      for (let _i883 = 0; _i883 < _a882.length; _i883++) {
                        const v_a = _a882[_i883];
                        if (!(((sp.angleEdges[v_a].includes(_e868)) && (sp.angleEdges[v_a].includes(_y879))))) continue;
                        if (!((((b.edgeCand(v_a) >> ((4 - _f865[_e868]) - _f865[_y879])) & 1) !== 0))) {
                          _q880 = false;
                          break Q881;
                        }
                      }
                    }
                    if (!(_q880)) continue V872;
                  }
                  break;
                }
                if (_r876 === 0) {
                  _s867[_i870] = 0;
                  _i870--;
                  continue;
                }
                _s867[_i870] = _d869;
                if (_i870 === _a864.length - 1) break;
                _i870++;
                _s867[_i870] = 0;
              }
              if (_i870 < 0) break;
              let _g884 = 0;
              G885: {
                const _a886 = v_S;
                for (let _i887 = 0; _i887 < _a886.length; _i887++) {
                  const v_x = _a886[_i887];
                  _g884 += _f865[v_x];
                }
              }
              if (!((_g884 === ((2 * v_S.length) - v_n)))) continue;
              if (true) {
                _q862 = true;
                break Q863;
              }
            }
          }
          const _t888 = (v_n - 1);
          let _q889 = false;
          Q890: {
            const _f892 = new Int32Array(sp.edges.length).fill(-1);
            let _l893: readonly number[] = [];
            const _s894: number[] = [];
            const _a891 = v_S;
            const _t900 = ((2 * v_S.length) - _t888);
            const _lo901 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi902 = 31 - Math.clz32(b.domain);
            for (const _e895 of _l893) _f892[_e895] = -1;
            _l893 = _a891;
            let _i897 = 0;
            _s894[0] = 0;
            let _o904 = _a891.length === 0;
            for (;;) {
              if (_a891.length === 0) {
                if (!_o904) break;
                _o904 = false;
              }
              while (_a891.length > 0 && _i897 >= 0) {
                const _e895 = _a891[_i897];
                if (_s894[_i897] > 0) _f892[_e895] = -1;
                let _r903 = (cands[_e895] >= 0 ? cands[_e895] : (cands[_e895] = b.cands[_e895])) & ~((2 << _s894[_i897]) - 1);
                let _d896 = 0;
                V899: for (; _r903 !== 0; _r903 &= _r903 - 1) {
                  _d896 = 31 - Math.clz32(_r903 & -_r903);
                  _f892[_e895] = _d896;
                  {
                    let _t905 = _d896;
                    for (let _j898 = 0; _j898 < _i897; _j898++) _t905 += _f892[_a891[_j898]];
                    if (_t905 + (_a891.length - _i897 - 1) * _lo901 > _t900) continue;
                    if (_t905 + (_a891.length - _i897 - 1) * _hi902 < _t900) continue;
                  }
                  for (let _j898 = 0; _j898 < _i897; _j898++) {
                    const _y906 = _a891[_j898];
                    let _q907 = true;
                    Q908: {
                      const _a909 = sp.faceAngles[v_f];
                      for (let _i910 = 0; _i910 < _a909.length; _i910++) {
                        const v_a = _a909[_i910];
                        if (!(((sp.angleEdges[v_a].includes(_e895)) && (sp.angleEdges[v_a].includes(_y906))))) continue;
                        if (!((((b.edgeCand(v_a) >> ((4 - _f892[_e895]) - _f892[_y906])) & 1) !== 0))) {
                          _q907 = false;
                          break Q908;
                        }
                      }
                    }
                    if (!(_q907)) continue V899;
                  }
                  break;
                }
                if (_r903 === 0) {
                  _s894[_i897] = 0;
                  _i897--;
                  continue;
                }
                _s894[_i897] = _d896;
                if (_i897 === _a891.length - 1) break;
                _i897++;
                _s894[_i897] = 0;
              }
              if (_i897 < 0) break;
              let _g911 = 0;
              G912: {
                const _a913 = v_S;
                for (let _i914 = 0; _i914 < _a913.length; _i914++) {
                  const v_x = _a913[_i914];
                  _g911 += _f892[v_x];
                }
              }
              if (!((_g911 === ((2 * v_S.length) - _t888)))) continue;
              if (true) {
                _q889 = true;
                break Q890;
              }
            }
          }
          freshBinding("clueBound", [(sp.faces.includes(v_f)), _c861, (v_n === clueAt(cl.number, v_f)), (sp.faceEdges[v_f].includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_S, minus(sp.faceEdges[v_f], setOf(v_e))), (v_P === _q862), (v_Q === _q889), (!(v_P) || !(v_Q))], ["f in", "where of f", "n =", "e in", "where of e", "S =", "P =", "Q =", "where of Q"]);
        }
        facts.length = 0;
        changed = false;
        let _c916: boolean = (v_P || v_Q);
        if (_c916) {
          let _c915: boolean = !(!(v_P));
          if (!_c915) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c915 = true;
          }
          _c916 = _c915;
        }
        let _c918: boolean = _c916;
        if (_c918) {
          let _c917: boolean = !(!(v_Q));
          if (!_c917) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c917 = true;
          }
          _c918 = _c917;
        }
        if (!(_c918)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ f: v_f, n: v_n, e: v_e, S: v_S.slice(), P: v_P, Q: v_Q }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface CornerFromClueBinding {
  f: number;
  n: number;
  k: number;
  o: number;
  a: number;
  S: readonly number[];
  P: boolean;
  Q: boolean;
}

const cornerFromClueFacts: number[] = [];
let cornerFromClueCands = new Int32Array(0);
let _f1026 = new Int32Array(0);
let _l1027: readonly number[] = [];
let _f1055 = new Int32Array(0);
let _l1056: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerFromClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceAngles","angleEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerFromClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CornerFromClueBinding> | null): number {
  if (_f1026.length < sp.edges.length) _f1026 = new Int32Array(sp.edges.length).fill(-1);
  else _f1026.fill(-1);
  _l1027 = [];
  const _s1028: number[] = [];
  if (_f1055.length < sp.edges.length) _f1055 = new Int32Array(sp.edges.length).fill(-1);
  else _f1055.fill(-1);
  _l1056 = [];
  const _s1057: number[] = [];
  const facts = cornerFromClueFacts;
  let fired = 0;
  let changed = false;
  const _h1013 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (cornerFromClueCands.length < sp.edges.length) cornerFromClueCands = new Int32Array(sp.edges.length);
  const cands = cornerFromClueCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(cornerFromClueFootprint) ?? null) : null;
  const _a995 = sp.faces;
  R1:
  for (let _i996 = 0; _i996 < _a995.length; _i996++) {
    const v_f = _a995[_i996];
    const _h997 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h997 !== -1))) continue;
    const v_n = _h997;
    const _h1022 = (v_n - 2);
    const _m334_0 = b.made[0];
    let _g998 = 0;
    G999: {
      const _a1000 = sp.faceEdges[v_f];
      for (let _i1001 = 0; _i1001 < _a1000.length; _i1001++) {
        const v_e = _a1000[_i1001];
        const _h1002 = (b.grid[v_e] || -1);
        if (!((_h1002 === 1))) continue;
        _g998++;
      }
    }
    const v_k = (_h997 - _g998);
    let _g1003 = 0;
    G1004: {
      const _a1005 = sp.faceEdges[v_f];
      for (let _i1006 = 0; _i1006 < _a1005.length; _i1006++) {
        const v_e = _a1005[_i1006];
        const _h1007 = (b.grid[v_e] !== 0);
        if (!(!(_h1007))) continue;
        _g1003++;
      }
    }
    L1008: {
      const v_o = _g1003;
      const _m342_2 = b.made[2];
      let _c1014: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
      if (!_c1014) {
        let _q1009 = false;
        Q1010: {
          const _a1011 = sp.faceAngles[v_f];
          for (let _i1012 = 0; _i1012 < _a1011.length; _i1012++) {
            const v_b = _a1011[_i1012];
            if ((b.edgeCand(v_b) !== _h1013)) {
              _q1009 = true;
              break Q1010;
            }
          }
        }
        _c1014 = _q1009;
      }
      if (!(_c1014)) break L1008;
      const _a1015 = sp.faceAngles[v_f];
      for (let _i1016 = 0; _i1016 < _a1015.length; _i1016++) {
        const v_a = _a1015[_i1016];
        let _q1017 = true;
        Q1018: {
          const _a1019 = sp.angleEdges[v_a];
          for (let _i1020 = 0; _i1020 < _a1019.length; _i1020++) {
            const v_e = _a1019[_i1020];
            const _h1021 = (b.grid[v_e] !== 0);
            if (!(!(_h1021))) {
              _q1017 = false;
              break Q1018;
            }
          }
        }
        if (!(_q1017)) continue;
        const v_S = minus(sp.faceEdges[v_f], sp.angleEdges[v_a]);
        const _h1034 = v_S.length;
        const _h1050 = (2 * _h1034);
        const _h1051 = (_h1050 - _h1022);
        const _h1078 = (_h1050 - v_n);
        let _q1023 = false;
        Q1024: {
          const _a1025 = v_S;
          const _t1035 = ((2 * _h1034) - _h1022);
          const _lo1036 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi1037 = 31 - Math.clz32(b.domain);
          for (const _e1029 of _l1027) _f1026[_e1029] = -1;
          _l1027 = _a1025;
          let _i1031 = 0;
          _s1028[0] = 0;
          let _o1039 = _a1025.length === 0;
          for (;;) {
            if (_a1025.length === 0) {
              if (!_o1039) break;
              _o1039 = false;
            }
            while (_a1025.length > 0 && _i1031 >= 0) {
              const _e1029 = _a1025[_i1031];
              if (_s1028[_i1031] > 0) _f1026[_e1029] = -1;
              let _r1038 = (cands[_e1029] >= 0 ? cands[_e1029] : (cands[_e1029] = b.cands[_e1029])) & ~((2 << _s1028[_i1031]) - 1);
              let _d1030 = 0;
              V1033: for (; _r1038 !== 0; _r1038 &= _r1038 - 1) {
                _d1030 = 31 - Math.clz32(_r1038 & -_r1038);
                _f1026[_e1029] = _d1030;
                {
                  let _t1040 = _d1030;
                  for (let _j1032 = 0; _j1032 < _i1031; _j1032++) _t1040 += _f1026[_a1025[_j1032]];
                  if (_t1040 + (_a1025.length - _i1031 - 1) * _lo1036 > _t1035) continue;
                  if (_t1040 + (_a1025.length - _i1031 - 1) * _hi1037 < _t1035) continue;
                }
                for (let _j1032 = 0; _j1032 < _i1031; _j1032++) {
                  const _y1041 = _a1025[_j1032];
                  let _q1042 = true;
                  Q1043: {
                    const _a1044 = sp.faceAngles[v_f];
                    for (let _i1045 = 0; _i1045 < _a1044.length; _i1045++) {
                      const v_a = _a1044[_i1045];
                      if (!(((sp.angleEdges[v_a].includes(_e1029)) && (sp.angleEdges[v_a].includes(_y1041))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - _f1026[_e1029]) - _f1026[_y1041])) & 1) !== 0))) {
                        _q1042 = false;
                        break Q1043;
                      }
                    }
                  }
                  if (!(_q1042)) continue V1033;
                }
                break;
              }
              if (_r1038 === 0) {
                _s1028[_i1031] = 0;
                _i1031--;
                continue;
              }
              _s1028[_i1031] = _d1030;
              if (_i1031 === _a1025.length - 1) break;
              _i1031++;
              _s1028[_i1031] = 0;
            }
            if (_i1031 < 0) break;
            let _g1046 = 0;
            G1047: {
              const _a1048 = v_S;
              for (let _i1049 = 0; _i1049 < _a1048.length; _i1049++) {
                const v_x = _a1048[_i1049];
                _g1046 += _f1026[v_x];
              }
            }
            if (!((_g1046 === _h1051))) continue;
            if (true) {
              _q1023 = true;
              break Q1024;
            }
          }
        }
        const v_P = _q1023;
        let _q1052 = false;
        Q1053: {
          const _a1054 = v_S;
          const _t1063 = ((2 * _h1034) - v_n);
          const _lo1064 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi1065 = 31 - Math.clz32(b.domain);
          for (const _e1058 of _l1056) _f1055[_e1058] = -1;
          _l1056 = _a1054;
          let _i1060 = 0;
          _s1057[0] = 0;
          let _o1067 = _a1054.length === 0;
          for (;;) {
            if (_a1054.length === 0) {
              if (!_o1067) break;
              _o1067 = false;
            }
            while (_a1054.length > 0 && _i1060 >= 0) {
              const _e1058 = _a1054[_i1060];
              if (_s1057[_i1060] > 0) _f1055[_e1058] = -1;
              let _r1066 = (cands[_e1058] >= 0 ? cands[_e1058] : (cands[_e1058] = b.cands[_e1058])) & ~((2 << _s1057[_i1060]) - 1);
              let _d1059 = 0;
              V1062: for (; _r1066 !== 0; _r1066 &= _r1066 - 1) {
                _d1059 = 31 - Math.clz32(_r1066 & -_r1066);
                _f1055[_e1058] = _d1059;
                {
                  let _t1068 = _d1059;
                  for (let _j1061 = 0; _j1061 < _i1060; _j1061++) _t1068 += _f1055[_a1054[_j1061]];
                  if (_t1068 + (_a1054.length - _i1060 - 1) * _lo1064 > _t1063) continue;
                  if (_t1068 + (_a1054.length - _i1060 - 1) * _hi1065 < _t1063) continue;
                }
                for (let _j1061 = 0; _j1061 < _i1060; _j1061++) {
                  const _y1069 = _a1054[_j1061];
                  let _q1070 = true;
                  Q1071: {
                    const _a1072 = sp.faceAngles[v_f];
                    for (let _i1073 = 0; _i1073 < _a1072.length; _i1073++) {
                      const v_a = _a1072[_i1073];
                      if (!(((sp.angleEdges[v_a].includes(_e1058)) && (sp.angleEdges[v_a].includes(_y1069))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - _f1055[_e1058]) - _f1055[_y1069])) & 1) !== 0))) {
                        _q1070 = false;
                        break Q1071;
                      }
                    }
                  }
                  if (!(_q1070)) continue V1062;
                }
                break;
              }
              if (_r1066 === 0) {
                _s1057[_i1060] = 0;
                _i1060--;
                continue;
              }
              _s1057[_i1060] = _d1059;
              if (_i1060 === _a1054.length - 1) break;
              _i1060++;
              _s1057[_i1060] = 0;
            }
            if (_i1060 < 0) break;
            let _g1074 = 0;
            G1075: {
              const _a1076 = v_S;
              for (let _i1077 = 0; _i1077 < _a1076.length; _i1077++) {
                const v_x = _a1076[_i1077];
                _g1074 += _f1055[v_x];
              }
            }
            if (!((_g1074 === _h1078))) continue;
            if (true) {
              _q1052 = true;
              break Q1053;
            }
          }
        }
        L1079: {
          const v_Q = _q1052;
          if (!(((!(v_P) && (((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (!(v_Q) && (((b.edgeCand(v_a) >> 0) & 1) !== 0))))) break L1079;
          if (b.made[0] !== _m334_0 || b.made[2] !== _m342_2) {
            let _g1080 = 0;
            G1081: {
              const _a1082 = sp.faceEdges[v_f];
              for (let _i1083 = 0; _i1083 < _a1082.length; _i1083++) {
                const v_e = _a1082[_i1083];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g1080++;
              }
            }
            if (!((v_k === (clueAt(cl.number, v_f) - _g1080)))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _g1084 = 0;
            G1085: {
              const _a1086 = sp.faceEdges[v_f];
              for (let _i1087 = 0; _i1087 < _a1086.length; _i1087++) {
                const v_e = _a1086[_i1087];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1084++;
              }
            }
            if (!((v_o === _g1084))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _c1092: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
            if (!_c1092) {
              let _q1088 = false;
              Q1089: {
                const _a1090 = sp.faceAngles[v_f];
                for (let _i1091 = 0; _i1091 < _a1090.length; _i1091++) {
                  const v_b = _a1090[_i1091];
                  if ((b.edgeCand(v_b) !== ((1 << 0) | (1 << 1) | (1 << 2)))) {
                    _q1088 = true;
                    break Q1089;
                  }
                }
              }
              _c1092 = _q1088;
            }
            if (!(_c1092)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g1093 = 0;
            G1094: {
              const _a1095 = sp.faceEdges[v_f];
              for (let _i1096 = 0; _i1096 < _a1095.length; _i1096++) {
                const v_e = _a1095[_i1096];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g1093++;
              }
            }
            let _g1097 = 0;
            G1098: {
              const _a1099 = sp.faceEdges[v_f];
              for (let _i1100 = 0; _i1100 < _a1099.length; _i1100++) {
                const v_e = _a1099[_i1100];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1097++;
              }
            }
            let _c1105: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
            if (!_c1105) {
              let _q1101 = false;
              Q1102: {
                const _a1103 = sp.faceAngles[v_f];
                for (let _i1104 = 0; _i1104 < _a1103.length; _i1104++) {
                  const v_b = _a1103[_i1104];
                  if ((b.edgeCand(v_b) !== ((1 << 0) | (1 << 1) | (1 << 2)))) {
                    _q1101 = true;
                    break Q1102;
                  }
                }
              }
              _c1105 = _q1101;
            }
            let _q1106 = true;
            Q1107: {
              const _a1108 = sp.angleEdges[v_a];
              for (let _i1109 = 0; _i1109 < _a1108.length; _i1109++) {
                const v_e = _a1108[_i1109];
                if (!(!((b.grid[v_e] !== 0)))) {
                  _q1106 = false;
                  break Q1107;
                }
              }
            }
            const _t1110 = (v_n - 2);
            let _q1111 = false;
            Q1112: {
              const _f1114 = new Int32Array(sp.edges.length).fill(-1);
              let _l1115: readonly number[] = [];
              const _s1116: number[] = [];
              const _a1113 = v_S;
              const _t1122 = ((2 * v_S.length) - _t1110);
              const _lo1123 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1124 = 31 - Math.clz32(b.domain);
              for (const _e1117 of _l1115) _f1114[_e1117] = -1;
              _l1115 = _a1113;
              let _i1119 = 0;
              _s1116[0] = 0;
              let _o1126 = _a1113.length === 0;
              for (;;) {
                if (_a1113.length === 0) {
                  if (!_o1126) break;
                  _o1126 = false;
                }
                while (_a1113.length > 0 && _i1119 >= 0) {
                  const _e1117 = _a1113[_i1119];
                  if (_s1116[_i1119] > 0) _f1114[_e1117] = -1;
                  let _r1125 = (cands[_e1117] >= 0 ? cands[_e1117] : (cands[_e1117] = b.cands[_e1117])) & ~((2 << _s1116[_i1119]) - 1);
                  let _d1118 = 0;
                  V1121: for (; _r1125 !== 0; _r1125 &= _r1125 - 1) {
                    _d1118 = 31 - Math.clz32(_r1125 & -_r1125);
                    _f1114[_e1117] = _d1118;
                    {
                      let _t1127 = _d1118;
                      for (let _j1120 = 0; _j1120 < _i1119; _j1120++) _t1127 += _f1114[_a1113[_j1120]];
                      if (_t1127 + (_a1113.length - _i1119 - 1) * _lo1123 > _t1122) continue;
                      if (_t1127 + (_a1113.length - _i1119 - 1) * _hi1124 < _t1122) continue;
                    }
                    for (let _j1120 = 0; _j1120 < _i1119; _j1120++) {
                      const _y1128 = _a1113[_j1120];
                      let _q1129 = true;
                      Q1130: {
                        const _a1131 = sp.faceAngles[v_f];
                        for (let _i1132 = 0; _i1132 < _a1131.length; _i1132++) {
                          const v_a = _a1131[_i1132];
                          if (!(((sp.angleEdges[v_a].includes(_e1117)) && (sp.angleEdges[v_a].includes(_y1128))))) continue;
                          if (!((((b.edgeCand(v_a) >> ((4 - _f1114[_e1117]) - _f1114[_y1128])) & 1) !== 0))) {
                            _q1129 = false;
                            break Q1130;
                          }
                        }
                      }
                      if (!(_q1129)) continue V1121;
                    }
                    break;
                  }
                  if (_r1125 === 0) {
                    _s1116[_i1119] = 0;
                    _i1119--;
                    continue;
                  }
                  _s1116[_i1119] = _d1118;
                  if (_i1119 === _a1113.length - 1) break;
                  _i1119++;
                  _s1116[_i1119] = 0;
                }
                if (_i1119 < 0) break;
                let _g1133 = 0;
                G1134: {
                  const _a1135 = v_S;
                  for (let _i1136 = 0; _i1136 < _a1135.length; _i1136++) {
                    const v_x = _a1135[_i1136];
                    _g1133 += _f1114[v_x];
                  }
                }
                if (!((_g1133 === ((2 * v_S.length) - _t1110)))) continue;
                if (true) {
                  _q1111 = true;
                  break Q1112;
                }
              }
            }
            let _q1137 = false;
            Q1138: {
              const _f1140 = new Int32Array(sp.edges.length).fill(-1);
              let _l1141: readonly number[] = [];
              const _s1142: number[] = [];
              const _a1139 = v_S;
              const _t1148 = ((2 * v_S.length) - v_n);
              const _lo1149 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1150 = 31 - Math.clz32(b.domain);
              for (const _e1143 of _l1141) _f1140[_e1143] = -1;
              _l1141 = _a1139;
              let _i1145 = 0;
              _s1142[0] = 0;
              let _o1152 = _a1139.length === 0;
              for (;;) {
                if (_a1139.length === 0) {
                  if (!_o1152) break;
                  _o1152 = false;
                }
                while (_a1139.length > 0 && _i1145 >= 0) {
                  const _e1143 = _a1139[_i1145];
                  if (_s1142[_i1145] > 0) _f1140[_e1143] = -1;
                  let _r1151 = (cands[_e1143] >= 0 ? cands[_e1143] : (cands[_e1143] = b.cands[_e1143])) & ~((2 << _s1142[_i1145]) - 1);
                  let _d1144 = 0;
                  V1147: for (; _r1151 !== 0; _r1151 &= _r1151 - 1) {
                    _d1144 = 31 - Math.clz32(_r1151 & -_r1151);
                    _f1140[_e1143] = _d1144;
                    {
                      let _t1153 = _d1144;
                      for (let _j1146 = 0; _j1146 < _i1145; _j1146++) _t1153 += _f1140[_a1139[_j1146]];
                      if (_t1153 + (_a1139.length - _i1145 - 1) * _lo1149 > _t1148) continue;
                      if (_t1153 + (_a1139.length - _i1145 - 1) * _hi1150 < _t1148) continue;
                    }
                    for (let _j1146 = 0; _j1146 < _i1145; _j1146++) {
                      const _y1154 = _a1139[_j1146];
                      let _q1155 = true;
                      Q1156: {
                        const _a1157 = sp.faceAngles[v_f];
                        for (let _i1158 = 0; _i1158 < _a1157.length; _i1158++) {
                          const v_a = _a1157[_i1158];
                          if (!(((sp.angleEdges[v_a].includes(_e1143)) && (sp.angleEdges[v_a].includes(_y1154))))) continue;
                          if (!((((b.edgeCand(v_a) >> ((4 - _f1140[_e1143]) - _f1140[_y1154])) & 1) !== 0))) {
                            _q1155 = false;
                            break Q1156;
                          }
                        }
                      }
                      if (!(_q1155)) continue V1147;
                    }
                    break;
                  }
                  if (_r1151 === 0) {
                    _s1142[_i1145] = 0;
                    _i1145--;
                    continue;
                  }
                  _s1142[_i1145] = _d1144;
                  if (_i1145 === _a1139.length - 1) break;
                  _i1145++;
                  _s1142[_i1145] = 0;
                }
                if (_i1145 < 0) break;
                let _g1159 = 0;
                G1160: {
                  const _a1161 = v_S;
                  for (let _i1162 = 0; _i1162 < _a1161.length; _i1162++) {
                    const v_x = _a1161[_i1162];
                    _g1159 += _f1140[v_x];
                  }
                }
                if (!((_g1159 === ((2 * v_S.length) - v_n)))) continue;
                if (true) {
                  _q1137 = true;
                  break Q1138;
                }
              }
            }
            freshBinding("cornerFromClue", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === clueAt(cl.number, v_f)), (v_k === (clueAt(cl.number, v_f) - _g1093)), (v_o === _g1097), _c1105, (sp.faceAngles[v_f].includes(v_a)), _q1106, sameSet(v_S, minus(sp.faceEdges[v_f], sp.angleEdges[v_a])), (v_P === _q1111), (v_Q === _q1137), ((!(v_P) && (((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (!(v_Q) && (((b.edgeCand(v_a) >> 0) & 1) !== 0)))], ["f in", "where of f", "n =", "k =", "o =", "where of o", "a in", "where of a", "S =", "P =", "Q =", "where of Q"]);
          }
          facts.length = 0;
          changed = false;
          let _c1163: boolean = !(!(v_P));
          if (!_c1163) {
            if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
            _c1163 = true;
          }
          let _c1165: boolean = _c1163;
          if (_c1165) {
            let _c1164: boolean = !(!(v_Q));
            if (!_c1164) {
              if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
              _c1164 = true;
            }
            _c1165 = _c1164;
          }
          if (!(_c1165)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ f: v_f, n: v_n, k: v_k, o: v_o, a: v_a, S: v_S.slice(), P: v_P, Q: v_Q }, facts)) return 1;
            cands.fill(-1);
          }
        }
      }
    }
  }
  return fired;
}

export interface CornerAcrossBinding {
  a: number;
  b: number;
}

const cornerAcrossFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerAcrossFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellAngles"],"kind":"edgeMark"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerAcross(b: Marks, sp: GridSpace, fire: Fire<CornerAcrossBinding> | null): number {
  const facts = cornerAcrossFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(cornerAcrossFootprint) ?? null) : null;
  const _a1180 = sp.angles;
  R1:
  for (let _i1181 = 0; _i1181 < _a1180.length; _i1181++) {
    const v_a = _a1180[_i1181];
    const _m375_0 = b.made[0];
    const _m375_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1187: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
    if (_c1187) {
      let _q1182 = true;
      Q1183: {
        const _a1184 = sp.angleEdges[v_a];
        for (let _i1185 = 0; _i1185 < _a1184.length; _i1185++) {
          const v_e = _a1184[_i1185];
          const _h1186 = (b.grid[v_e] !== 0);
          if (!(!(_h1186))) {
            _q1182 = false;
            break Q1183;
          }
        }
      }
      _c1187 = _q1182;
    }
    if (!(_c1187)) continue;
    const _a1188 = sp.cellAngles[sp.angleCell[v_a]];
    for (let _i1189 = 0; _i1189 < _a1188.length; _i1189++) {
      const v_b = _a1188[_i1189];
      let _c1194: boolean = (((b.edgeCand(v_b) >> 2) & 1) !== 0);
      if (_c1194) {
        let _q1190 = true;
        Q1191: {
          const _a1192 = sp.angleEdges[v_b];
          for (let _i1193 = 0; _i1193 < _a1192.length; _i1193++) {
            const v_e = _a1192[_i1193];
            if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
              _q1190 = false;
              break Q1191;
            }
          }
        }
        _c1194 = _q1190;
      }
      if (!(_c1194)) continue;
      if (b.made[0] !== _m375_0 || b.made[2] !== _m375_2) {
        let _c1199: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
        if (_c1199) {
          let _q1195 = true;
          Q1196: {
            const _a1197 = sp.angleEdges[v_a];
            for (let _i1198 = 0; _i1198 < _a1197.length; _i1198++) {
              const v_e = _a1197[_i1198];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q1195 = false;
                break Q1196;
              }
            }
          }
          _c1199 = _q1195;
        }
        if (!(_c1199)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c1204: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
        if (_c1204) {
          let _q1200 = true;
          Q1201: {
            const _a1202 = sp.angleEdges[v_a];
            for (let _i1203 = 0; _i1203 < _a1202.length; _i1203++) {
              const v_e = _a1202[_i1203];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q1200 = false;
                break Q1201;
              }
            }
          }
          _c1204 = _q1200;
        }
        let _c1209: boolean = (((b.edgeCand(v_b) >> 2) & 1) !== 0);
        if (_c1209) {
          let _q1205 = true;
          Q1206: {
            const _a1207 = sp.angleEdges[v_b];
            for (let _i1208 = 0; _i1208 < _a1207.length; _i1208++) {
              const v_e = _a1207[_i1208];
              if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                _q1205 = false;
                break Q1206;
              }
            }
          }
          _c1209 = _q1205;
        }
        freshBinding("cornerAcross", [(sp.angles.includes(v_a)), _c1204, (sp.cellAngles[sp.angleCell[v_a]].includes(v_b)), _c1209], ["a in", "where of a", "b in", "where of b"]);
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_b) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 2); changed = true; } else facts.push(STRIKE_EDGE, v_b, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, b: v_b }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerExitBinding {
  a: number;
  c: number;
}

const cornerExitFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerExitFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerExit(b: Marks, sp: GridSpace, fire: Fire<CornerExitBinding> | null): number {
  const facts = cornerExitFacts;
  let fired = 0;
  let changed = false;
  const _h1229 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerExitFootprint) ?? null) : null;
  const _a1227 = sp.angles;
  for (let _i1228 = 0; _i1228 < _a1227.length; _i1228++) {
    const v_a = _a1227[_i1228];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1234: boolean = (b.edgeCand(v_a) === _h1229);
    if (_c1234) {
      let _q1230 = true;
      Q1231: {
        const _a1232 = sp.angleEdges[v_a];
        for (let _i1233 = 0; _i1233 < _a1232.length; _i1233++) {
          const v_e = _a1232[_i1233];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q1230 = false;
            break Q1231;
          }
        }
      }
      _c1234 = _q1230;
    }
    if (!(_c1234)) continue;
    L1235: {
      const v_c = sp.angleCell[v_a];
      let _g1236 = 0;
      G1237: {
        const _a1238 = sp.cellEdges[v_c];
        for (let _i1239 = 0; _i1239 < _a1238.length; _i1239++) {
          const v_e = _a1238[_i1239];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g1236++;
        }
      }
      let _c1244: boolean = (_g1236 === 0);
      if (_c1244) {
        let _g1240 = 0;
        G1241: {
          const _a1242 = sp.cellEdges[v_c];
          for (let _i1243 = 0; _i1243 < _a1242.length; _i1243++) {
            const v_e = _a1242[_i1243];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g1240++;
          }
        }
        _c1244 = (_g1240 === 3);
      }
      if (!(_c1244)) break L1235;
      if (import.meta.env.DEV && staleChecking) {
        let _c1249: boolean = (b.edgeCand(v_a) === ((1 << 1)));
        if (_c1249) {
          let _q1245 = true;
          Q1246: {
            const _a1247 = sp.angleEdges[v_a];
            for (let _i1248 = 0; _i1248 < _a1247.length; _i1248++) {
              const v_e = _a1247[_i1248];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q1245 = false;
                break Q1246;
              }
            }
          }
          _c1249 = _q1245;
        }
        let _g1250 = 0;
        G1251: {
          const _a1252 = sp.cellEdges[v_c];
          for (let _i1253 = 0; _i1253 < _a1252.length; _i1253++) {
            const v_e = _a1252[_i1253];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g1250++;
          }
        }
        let _c1258: boolean = (_g1250 === 0);
        if (_c1258) {
          let _g1254 = 0;
          G1255: {
            const _a1256 = sp.cellEdges[v_c];
            for (let _i1257 = 0; _i1257 < _a1256.length; _i1257++) {
              const v_e = _a1256[_i1257];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g1254++;
            }
          }
          _c1258 = (_g1254 === 3);
        }
        freshBinding("cornerExit", [(sp.angles.includes(v_a)), _c1249, (v_c === sp.angleCell[v_a]), _c1258], ["a in", "where of a", "c =", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      let _q1259 = true;
      Q1260: {
        const _a1261 = sp.cellEdges[v_c];
        for (let _i1262 = 0; _i1262 < _a1261.length; _i1262++) {
          const v_e = _a1261[_i1262];
          if (!((!((b.grid[v_e] !== 0)) && !(sp.angleEdges[v_a].includes(v_e))))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) {
            _q1259 = false;
            break Q1260;
          }
        }
      }
      if (!(_q1259)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, c: v_c }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerOppositeExitBinding {
  a: number;
  c: number;
  b: number;
}

const cornerOppositeExitFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerOppositeExitFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellEdges"],"kind":"answer"},{"steps":["angleCell","cellAngles","angleEdges"],"kind":"answer"},{"steps":["angleCell","cellAngles"],"kind":"edgeMark"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerOppositeExit(b: Marks, sp: GridSpace, fire: Fire<CornerOppositeExitBinding> | null): number {
  const facts = cornerOppositeExitFacts;
  let fired = 0;
  let changed = false;
  const _h1293 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerOppositeExitFootprint) ?? null) : null;
  const _a1291 = sp.angles;
  R1:
  for (let _i1292 = 0; _i1292 < _a1291.length; _i1292++) {
    const v_a = _a1291[_i1292];
    const _m414_0 = b.made[0];
    const _m414_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1299: boolean = (b.edgeCand(v_a) === _h1293);
    if (_c1299) {
      let _q1294 = true;
      Q1295: {
        const _a1296 = sp.angleEdges[v_a];
        for (let _i1297 = 0; _i1297 < _a1296.length; _i1297++) {
          const v_e = _a1296[_i1297];
          const _h1298 = (b.grid[v_e] !== 0);
          if (!(!(_h1298))) {
            _q1294 = false;
            break Q1295;
          }
        }
      }
      _c1299 = _q1294;
    }
    if (!(_c1299)) continue;
    L1300: {
      const v_c = sp.angleCell[v_a];
      let _g1301 = 0;
      G1302: {
        const _a1303 = sp.cellEdges[v_c];
        for (let _i1304 = 0; _i1304 < _a1303.length; _i1304++) {
          const v_e = _a1303[_i1304];
          const _h1305 = (b.grid[v_e] || -1);
          if (!((_h1305 === 1))) continue;
          _g1301++;
        }
      }
      let _c1311: boolean = (_g1301 === 0);
      if (_c1311) {
        let _g1306 = 0;
        G1307: {
          const _a1308 = sp.cellEdges[v_c];
          for (let _i1309 = 0; _i1309 < _a1308.length; _i1309++) {
            const v_e = _a1308[_i1309];
            const _h1310 = (b.grid[v_e] !== 0);
            if (!(!(_h1310))) continue;
            _g1306++;
          }
        }
        _c1311 = (_g1306 === 4);
      }
      if (!(_c1311)) break L1300;
      const _a1312 = sp.cellAngles[v_c];
      for (let _i1313 = 0; _i1313 < _a1312.length; _i1313++) {
        const v_b = _a1312[_i1313];
        let _q1314 = true;
        Q1315: {
          const _a1316 = sp.angleEdges[v_b];
          for (let _i1317 = 0; _i1317 < _a1316.length; _i1317++) {
            const v_e = _a1316[_i1317];
            const _h1318 = (b.grid[v_e] !== 0);
            if (!(!(_h1318))) {
              _q1314 = false;
              break Q1315;
            }
          }
        }
        let _c1323: boolean = (_q1314 && (b.edgeCand(v_b) !== _h1293));
        if (_c1323) {
          let _q1319 = true;
          Q1320: {
            const _a1321 = sp.angleEdges[v_b];
            for (let _i1322 = 0; _i1322 < _a1321.length; _i1322++) {
              const v_e = _a1321[_i1322];
              if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                _q1319 = false;
                break Q1320;
              }
            }
          }
          _c1323 = _q1319;
        }
        if (!(_c1323)) continue;
        if (b.made[0] !== _m414_0 || b.made[2] !== _m414_2) {
          let _c1328: boolean = (b.edgeCand(v_a) === ((1 << 1)));
          if (_c1328) {
            let _q1324 = true;
            Q1325: {
              const _a1326 = sp.angleEdges[v_a];
              for (let _i1327 = 0; _i1327 < _a1326.length; _i1327++) {
                const v_e = _a1326[_i1327];
                if (!(!((b.grid[v_e] !== 0)))) {
                  _q1324 = false;
                  break Q1325;
                }
              }
            }
            _c1328 = _q1324;
          }
          if (!(_c1328)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
          let _g1329 = 0;
          G1330: {
            const _a1331 = sp.cellEdges[v_c];
            for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
              const v_e = _a1331[_i1332];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1329++;
            }
          }
          let _c1337: boolean = (_g1329 === 0);
          if (_c1337) {
            let _g1333 = 0;
            G1334: {
              const _a1335 = sp.cellEdges[v_c];
              for (let _i1336 = 0; _i1336 < _a1335.length; _i1336++) {
                const v_e = _a1335[_i1336];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1333++;
              }
            }
            _c1337 = (_g1333 === 4);
          }
          if (!(_c1337)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c1342: boolean = (b.edgeCand(v_a) === ((1 << 1)));
          if (_c1342) {
            let _q1338 = true;
            Q1339: {
              const _a1340 = sp.angleEdges[v_a];
              for (let _i1341 = 0; _i1341 < _a1340.length; _i1341++) {
                const v_e = _a1340[_i1341];
                if (!(!((b.grid[v_e] !== 0)))) {
                  _q1338 = false;
                  break Q1339;
                }
              }
            }
            _c1342 = _q1338;
          }
          let _g1343 = 0;
          G1344: {
            const _a1345 = sp.cellEdges[v_c];
            for (let _i1346 = 0; _i1346 < _a1345.length; _i1346++) {
              const v_e = _a1345[_i1346];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1343++;
            }
          }
          let _c1351: boolean = (_g1343 === 0);
          if (_c1351) {
            let _g1347 = 0;
            G1348: {
              const _a1349 = sp.cellEdges[v_c];
              for (let _i1350 = 0; _i1350 < _a1349.length; _i1350++) {
                const v_e = _a1349[_i1350];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1347++;
              }
            }
            _c1351 = (_g1347 === 4);
          }
          let _q1352 = true;
          Q1353: {
            const _a1354 = sp.angleEdges[v_b];
            for (let _i1355 = 0; _i1355 < _a1354.length; _i1355++) {
              const v_e = _a1354[_i1355];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q1352 = false;
                break Q1353;
              }
            }
          }
          let _c1360: boolean = (_q1352 && (b.edgeCand(v_b) !== ((1 << 1))));
          if (_c1360) {
            let _q1356 = true;
            Q1357: {
              const _a1358 = sp.angleEdges[v_b];
              for (let _i1359 = 0; _i1359 < _a1358.length; _i1359++) {
                const v_e = _a1358[_i1359];
                if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                  _q1356 = false;
                  break Q1357;
                }
              }
            }
            _c1360 = _q1356;
          }
          freshBinding("cornerOppositeExit", [(sp.angles.includes(v_a)), _c1342, (v_c === sp.angleCell[v_a]), _c1351, (sp.cellAngles[v_c].includes(v_b)), _c1360], ["a in", "where of a", "c =", "where of c", "b in", "where of b"]);
        }
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_b) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 0); changed = true; } else facts.push(STRIKE_EDGE, v_b, 0); }
        let _c1361: boolean = true;
        if (_c1361) {
          if ((b.edgeCand(v_b) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 2); changed = true; } else facts.push(STRIKE_EDGE, v_b, 2); }
          _c1361 = true;
        }
        if (!(_c1361)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, c: v_c, b: v_b }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface MatchingPairBinding {
  f: number;
  n: number;
  o: number;
  e: number;
  g: number;
}

const matchingPairFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const matchingPairFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function matchingPair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MatchingPairBinding> | null): number {
  const facts = matchingPairFacts;
  let fired = 0;
  let changed = false;
  const _h1402 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(matchingPairFootprint) ?? null) : null;
  const _a1381 = sp.faces;
  R1:
  for (let _i1382 = 0; _i1382 < _a1381.length; _i1382++) {
    const v_f = _a1381[_i1382];
    const _h1383 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h1383 !== -1))) continue;
    const _m443_0 = b.made[0];
    let _q1384 = false;
    Q1385: {
      const _a1386 = sp.faceEdges[v_f];
      for (let _i1387 = 0; _i1387 < _a1386.length; _i1387++) {
        const v_e = _a1386[_i1387];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q1384 = true;
          break Q1385;
        }
      }
    }
    if (!(_q1384)) continue;
    let _g1388 = 0;
    G1389: {
      const _a1390 = sp.faceEdges[v_f];
      for (let _i1391 = 0; _i1391 < _a1390.length; _i1391++) {
        const v_e = _a1390[_i1391];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g1388++;
      }
    }
    const v_n = (_h1383 - _g1388);
    const _h1419 = (v_n === 1);
    const _h1422 = (v_n !== 1);
    let _g1392 = 0;
    G1393: {
      const _a1394 = sp.faceEdges[v_f];
      for (let _i1395 = 0; _i1395 < _a1394.length; _i1395++) {
        const v_e = _a1394[_i1395];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1392++;
      }
    }
    L1396: {
      const v_o = _g1392;
      if (!(((v_n === 1) || ((v_o - v_n) === 1)))) break L1396;
      const _a1397 = sp.faceEdges[v_f];
      R2:
      for (let _i1398 = 0; _i1398 < _a1397.length; _i1398++) {
        const v_e = _a1397[_i1398];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        const _h1401 = _i1398;
        const _a1399 = sp.faceEdges[v_f];
        for (let _i1400 = 0; _i1400 < _a1399.length; _i1400++) {
          const v_g = _a1399[_i1400];
          if (!(((!((b.grid[v_g] !== 0)) && (_i1400 > _h1401)) && (b.pairOf(v_e, v_g) === _h1402)))) continue;
          if (b.made[0] !== _m443_0) {
            let _g1403 = 0;
            G1404: {
              const _a1405 = sp.faceEdges[v_f];
              for (let _i1406 = 0; _i1406 < _a1405.length; _i1406++) {
                const v_e = _a1405[_i1406];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g1403++;
              }
            }
            if (!((v_n === (clueAt(cl.number, v_f) - _g1403)))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _g1407 = 0;
            G1408: {
              const _a1409 = sp.faceEdges[v_f];
              for (let _i1410 = 0; _i1410 < _a1409.length; _i1410++) {
                const v_e = _a1409[_i1410];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1407++;
              }
            }
            if (!((v_o === _g1407))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            if (!(!((b.grid[v_e] !== 0)))) { if (_visit !== null) _visit[v_f] = 1; continue R2; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g1411 = 0;
            G1412: {
              const _a1413 = sp.faceEdges[v_f];
              for (let _i1414 = 0; _i1414 < _a1413.length; _i1414++) {
                const v_e = _a1413[_i1414];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g1411++;
              }
            }
            let _g1415 = 0;
            G1416: {
              const _a1417 = sp.faceEdges[v_f];
              for (let _i1418 = 0; _i1418 < _a1417.length; _i1418++) {
                const v_e = _a1417[_i1418];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1415++;
              }
            }
            freshBinding("matchingPair", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === (clueAt(cl.number, v_f) - _g1411)), (v_o === _g1415), ((v_n === 1) || ((v_o - v_n) === 1)), (sp.faceEdges[v_f].includes(v_e)), !((b.grid[v_e] !== 0)), (sp.faceEdges[v_f].includes(v_g)), ((!((b.grid[v_g] !== 0)) && (_i1400 > _i1398)) && (b.pairOf(v_e, v_g) === ((1 << 1))))], ["f in", "where of f", "n =", "o =", "where of o", "e in", "where of e", "g in", "where of g"]);
          }
          facts.length = 0;
          changed = false;
          let _c1421: boolean = !(_h1419);
          if (!_c1421) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            let _c1420: boolean = true;
            if (_c1420) {
              if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 2); changed = true; } else facts.push(PLACE, v_g, 2); }
              _c1420 = true;
            }
            _c1421 = _c1420;
          }
          let _c1425: boolean = _c1421;
          if (_c1425) {
            let _c1424: boolean = !(_h1422);
            if (!_c1424) {
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              let _c1423: boolean = true;
              if (_c1423) {
                if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
                _c1423 = true;
              }
              _c1424 = _c1423;
            }
            _c1425 = _c1424;
          }
          if (!(_c1425)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ f: v_f, n: v_n, o: v_o, e: v_e, g: v_g }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface PairAtClueBinding {
  f: number;
  O: readonly number[];
  e: number;
  g: number;
}

const pairAtClueFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const pairAtClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function pairAtClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairAtClueBinding> | null): number {
  const _g1450: number[] = [];
  const facts = pairAtClueFacts;
  let fired = 0;
  let changed = false;
  const _h1460 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtClueFootprint) ?? null) : null;
  const _a1441 = sp.faces;
  for (let _i1442 = 0; _i1442 < _a1441.length; _i1442++) {
    const v_f = _a1441[_i1442];
    const _h1443 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1449: boolean = (_h1443 !== -1);
    if (_c1449) {
      let _g1444 = 0;
      G1445: {
        const _a1446 = sp.faceEdges[v_f];
        for (let _i1447 = 0; _i1447 < _a1446.length; _i1447++) {
          const v_e = _a1446[_i1447];
          const _h1448 = (b.grid[v_e] || -1);
          if (!((_h1448 === 1))) continue;
          _g1444++;
        }
      }
      _c1449 = ((_h1443 - _g1444) >= 0);
    }
    if (!(_c1449)) continue;
    _g1450.length = 0;
    G1451: {
      const _a1454 = sp.faceEdges[v_f];
      for (let _i1455 = 0; _i1455 < _a1454.length; _i1455++) {
        const v_e = _a1454[_i1455];
        const _h1456 = (b.grid[v_e] !== 0);
        if (!(!(_h1456))) continue;
        _g1450.push(v_e);
      }
    }
    L1457: {
      const v_O = _g1450;
      const _h1458 = v_O.length;
      if (!((_h1458 === 2))) break L1457;
      const v_e = (v_O[0] ?? -1);
      L1459: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h1460))) break L1459;
        if (import.meta.env.DEV && staleChecking) {
          let _c1465: boolean = (clueAt(cl.number, v_f) !== -1);
          if (_c1465) {
            let _g1461 = 0;
            G1462: {
              const _a1463 = sp.faceEdges[v_f];
              for (let _i1464 = 0; _i1464 < _a1463.length; _i1464++) {
                const v_e = _a1463[_i1464];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g1461++;
              }
            }
            _c1465 = ((clueAt(cl.number, v_f) - _g1461) >= 0);
          }
          const _g1466: number[] = [];
          G1467: {
            const _a1470 = sp.faceEdges[v_f];
            for (let _i1471 = 0; _i1471 < _a1470.length; _i1471++) {
              const v_e = _a1470[_i1471];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g1466.push(v_e);
            }
          }
          freshBinding("pairAtClue", [(sp.faces.includes(v_f)), _c1465, sameSet(v_O, _g1466), (v_O.length === 2), (v_e === (v_O[0] ?? -1)), (v_g === (v_O[1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 1) | (1 << 2)))], ["f in", "where of f", "O =", "where of O", "e =", "g =", "where of g"]);
        }
        facts.length = 0;
        changed = false;
        let _g1472 = 0;
        G1473: {
          const _a1474 = sp.faceEdges[v_f];
          for (let _i1475 = 0; _i1475 < _a1474.length; _i1475++) {
            const v_e = _a1474[_i1475];
            const _h1476 = (b.grid[v_e] || -1);
            if (!((_h1476 === 1))) continue;
            _g1472++;
          }
        }
        const _t1477 = (1 + ((_h1443 - _g1472) % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t1477); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t1477); }
        if (!(((b.pairOf(v_e, v_g) >> _t1477) & 1) !== 0)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ f: v_f, O: v_O.slice(), e: v_e, g: v_g }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ParityClueBinding {
  f: number;
  O: readonly number[];
  e: number;
  g: number;
  k: number;
}

const parityClueFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const parityClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function parityClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ParityClueBinding> | null): number {
  const _g1505: number[] = [];
  const _g1524: number[] = [];
  const facts = parityClueFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityClueFootprint) ?? null) : null;
  const _a1497 = sp.faces;
  R1:
  for (let _i1498 = 0; _i1498 < _a1497.length; _i1498++) {
    const v_f = _a1497[_i1498];
    const _m500_0 = b.made[0];
    const _h1499 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1504: boolean = (_h1499 !== -1);
    if (_c1504) {
      let _g1500 = 0;
      G1501: {
        const _a1502 = sp.faceEdges[v_f];
        for (let _i1503 = 0; _i1503 < _a1502.length; _i1503++) {
          const v_e = _a1502[_i1503];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g1500++;
        }
      }
      _c1504 = ((_h1499 - _g1500) >= 0);
    }
    if (!(_c1504)) continue;
    _g1505.length = 0;
    G1506: {
      const _a1509 = sp.faceEdges[v_f];
      for (let _i1510 = 0; _i1510 < _a1509.length; _i1510++) {
        const v_e = _a1509[_i1510];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1505.push(v_e);
      }
    }
    L1511: {
      const v_O = _g1505;
      const _h1512 = v_O.length;
      if (!((_h1512 === 3))) break L1511;
      const _a1513 = v_O;
      for (let _i1514 = 0; _i1514 < _a1513.length; _i1514++) {
        const v_e = _a1513[_i1514];
        const _h1517 = _i1514;
        const _a1515 = v_O;
        for (let _i1516 = 0; _i1516 < _a1515.length; _i1516++) {
          const v_g = _a1515[_i1516];
          if (!(((_i1516 > _h1517) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t1518 = minus(v_O, setOf(v_e, v_g));
          const v_k = (_t1518.length > 0 ? _t1518[0] : -1);
          if (b.made[0] !== _m500_0) {
            let _c1523: boolean = (clueAt(cl.number, v_f) !== -1);
            if (_c1523) {
              let _g1519 = 0;
              G1520: {
                const _a1521 = sp.faceEdges[v_f];
                for (let _i1522 = 0; _i1522 < _a1521.length; _i1522++) {
                  const v_e = _a1521[_i1522];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g1519++;
                }
              }
              _c1523 = ((clueAt(cl.number, v_f) - _g1519) >= 0);
            }
            if (!(_c1523)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            _g1524.length = 0;
            G1525: {
              const _a1528 = sp.faceEdges[v_f];
              for (let _i1529 = 0; _i1529 < _a1528.length; _i1529++) {
                const v_e = _a1528[_i1529];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1524.push(v_e);
              }
            }
            if (!(sameSet(v_O, _g1524))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _c1534: boolean = (clueAt(cl.number, v_f) !== -1);
            if (_c1534) {
              let _g1530 = 0;
              G1531: {
                const _a1532 = sp.faceEdges[v_f];
                for (let _i1533 = 0; _i1533 < _a1532.length; _i1533++) {
                  const v_e = _a1532[_i1533];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g1530++;
                }
              }
              _c1534 = ((clueAt(cl.number, v_f) - _g1530) >= 0);
            }
            const _g1535: number[] = [];
            G1536: {
              const _a1539 = sp.faceEdges[v_f];
              for (let _i1540 = 0; _i1540 < _a1539.length; _i1540++) {
                const v_e = _a1539[_i1540];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1535.push(v_e);
              }
            }
            const _t1541 = minus(v_O, setOf(v_e, v_g));
            freshBinding("parityClue", [(sp.faces.includes(v_f)), _c1534, sameSet(v_O, _g1535), (v_O.length === 3), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i1516 > _i1514) && (popcount(b.pairOf(v_e, v_g)) === 1)), (v_k === (_t1541.length > 0 ? _t1541[0] : -1))], ["f in", "where of f", "O =", "where of O", "e in", "g in", "where of g", "k ="]);
          }
          facts.length = 0;
          changed = false;
          const _t1546 = (2 - (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
          if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t1546); changed = true; } else facts.push(PLACE, v_k, _t1546); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ f: v_f, O: v_O.slice(), e: v_e, g: v_g, k: v_k }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LinkClueBinding {
  f: number;
  O: readonly number[];
  e: number;
  g: number;
  R: readonly number[];
  h: number;
  k: number;
}

const linkClueFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const linkClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function linkClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LinkClueBinding> | null): number {
  const _g1575: number[] = [];
  const _g1596: number[] = [];
  const facts = linkClueFacts;
  let fired = 0;
  let changed = false;
  const _h1590 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkClueFootprint) ?? null) : null;
  const _a1566 = sp.faces;
  R1:
  for (let _i1567 = 0; _i1567 < _a1566.length; _i1567++) {
    const v_f = _a1566[_i1567];
    const _m529_0 = b.made[0];
    const _h1568 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1574: boolean = (_h1568 !== -1);
    if (_c1574) {
      let _g1569 = 0;
      G1570: {
        const _a1571 = sp.faceEdges[v_f];
        for (let _i1572 = 0; _i1572 < _a1571.length; _i1572++) {
          const v_e = _a1571[_i1572];
          const _h1573 = (b.grid[v_e] || -1);
          if (!((_h1573 === 1))) continue;
          _g1569++;
        }
      }
      _c1574 = ((_h1568 - _g1569) >= 0);
    }
    if (!(_c1574)) continue;
    _g1575.length = 0;
    G1576: {
      const _a1579 = sp.faceEdges[v_f];
      for (let _i1580 = 0; _i1580 < _a1579.length; _i1580++) {
        const v_e = _a1579[_i1580];
        const _h1581 = (b.grid[v_e] !== 0);
        if (!(!(_h1581))) continue;
        _g1575.push(v_e);
      }
    }
    L1582: {
      const v_O = _g1575;
      const _h1583 = v_O.length;
      if (!((_h1583 === 4))) break L1582;
      const _a1584 = v_O;
      for (let _i1585 = 0; _i1585 < _a1584.length; _i1585++) {
        const v_e = _a1584[_i1585];
        const _h1588 = _i1585;
        const _a1586 = v_O;
        for (let _i1587 = 0; _i1587 < _a1586.length; _i1587++) {
          const v_g = _a1586[_i1587];
          if (!(((_i1587 > _h1588) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L1589: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h1590))) break L1589;
            if (b.made[0] !== _m529_0) {
              let _c1595: boolean = (clueAt(cl.number, v_f) !== -1);
              if (_c1595) {
                let _g1591 = 0;
                G1592: {
                  const _a1593 = sp.faceEdges[v_f];
                  for (let _i1594 = 0; _i1594 < _a1593.length; _i1594++) {
                    const v_e = _a1593[_i1594];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1591++;
                  }
                }
                _c1595 = ((clueAt(cl.number, v_f) - _g1591) >= 0);
              }
              if (!(_c1595)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
              _g1596.length = 0;
              G1597: {
                const _a1600 = sp.faceEdges[v_f];
                for (let _i1601 = 0; _i1601 < _a1600.length; _i1601++) {
                  const v_e = _a1600[_i1601];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g1596.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g1596))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              let _c1606: boolean = (clueAt(cl.number, v_f) !== -1);
              if (_c1606) {
                let _g1602 = 0;
                G1603: {
                  const _a1604 = sp.faceEdges[v_f];
                  for (let _i1605 = 0; _i1605 < _a1604.length; _i1605++) {
                    const v_e = _a1604[_i1605];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1602++;
                  }
                }
                _c1606 = ((clueAt(cl.number, v_f) - _g1602) >= 0);
              }
              const _g1607: number[] = [];
              G1608: {
                const _a1611 = sp.faceEdges[v_f];
                for (let _i1612 = 0; _i1612 < _a1611.length; _i1612++) {
                  const v_e = _a1611[_i1612];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g1607.push(v_e);
                }
              }
              freshBinding("linkClue", [(sp.faces.includes(v_f)), _c1606, sameSet(v_O, _g1607), (v_O.length === 4), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i1587 > _i1585) && (popcount(b.pairOf(v_e, v_g)) === 1)), sameSet(v_R, minus(v_O, setOf(v_e, v_g))), (v_h === (v_R[0] ?? -1)), (v_k === (v_R[1] ?? -1)), (b.pairOf(v_h, v_k) === ((1 << 1) | (1 << 2)))], ["f in", "where of f", "O =", "where of O", "e in", "g in", "where of g", "R =", "h =", "k =", "where of k"]);
            }
            facts.length = 0;
            changed = false;
            const _t1613 = (1 + (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t1613); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t1613); }
            if (!(((b.pairOf(v_h, v_k) >> _t1613) & 1) !== 0)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ f: v_f, O: v_O.slice(), e: v_e, g: v_g, R: v_R.slice(), h: v_h, k: v_k }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface PairFromCornerBinding {
  a: number;
  e: number;
  g: number;
}

const pairFromCornerFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const pairFromCornerFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function pairFromCorner(b: Marks, sp: GridSpace, fire: Fire<PairFromCornerBinding> | null): number {
  const facts = pairFromCornerFacts;
  let fired = 0;
  let changed = false;
  const _h1624 = ((1 << 1));
  const _h1632 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairFromCornerFootprint) ?? null) : null;
  const _a1622 = sp.angles;
  for (let _i1623 = 0; _i1623 < _a1622.length; _i1623++) {
    const v_a = _a1622[_i1623];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1630: boolean = (b.edgeCand(v_a) === _h1624);
    if (_c1630) {
      let _q1625 = true;
      Q1626: {
        const _a1627 = sp.angleEdges[v_a];
        for (let _i1628 = 0; _i1628 < _a1627.length; _i1628++) {
          const v_e = _a1627[_i1628];
          const _h1629 = (b.grid[v_e] !== 0);
          if (!(!(_h1629))) {
            _q1625 = false;
            break Q1626;
          }
        }
      }
      _c1630 = _q1625;
    }
    if (!(_c1630)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L1631: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h1632))) break L1631;
      if (import.meta.env.DEV && staleChecking) {
        let _c1637: boolean = (b.edgeCand(v_a) === ((1 << 1)));
        if (_c1637) {
          let _q1633 = true;
          Q1634: {
            const _a1635 = sp.angleEdges[v_a];
            for (let _i1636 = 0; _i1636 < _a1635.length; _i1636++) {
              const v_e = _a1635[_i1636];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q1633 = false;
                break Q1634;
              }
            }
          }
          _c1637 = _q1633;
        }
        freshBinding("pairFromCorner", [(sp.angles.includes(v_a)), _c1637, (v_e === (sp.angleEdges[v_a][0] ?? -1)), (v_g === (sp.angleEdges[v_a][1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 1) | (1 << 2)))], ["a in", "where of a", "e =", "g =", "where of g"]);
      }
      facts.length = 0;
      changed = false;
      if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, 2); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + 2); }
      if (!(((b.pairOf(v_e, v_g) >> 2) & 1) !== 0)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, e: v_e, g: v_g }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerFromPairBinding {
  a: number;
  e: number;
  g: number;
}

const cornerFromPairFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerFromPairFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function cornerFromPair(b: Marks, sp: GridSpace, fire: Fire<CornerFromPairBinding> | null): number {
  const facts = cornerFromPairFacts;
  let fired = 0;
  let changed = false;
  const _h1648 = ((1 << 1));
  const _h1656 = ((1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerFromPairFootprint) ?? null) : null;
  const _a1646 = sp.angles;
  for (let _i1647 = 0; _i1647 < _a1646.length; _i1647++) {
    const v_a = _a1646[_i1647];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1654: boolean = (b.edgeCand(v_a) !== _h1648);
    if (_c1654) {
      let _q1649 = true;
      Q1650: {
        const _a1651 = sp.angleEdges[v_a];
        for (let _i1652 = 0; _i1652 < _a1651.length; _i1652++) {
          const v_e = _a1651[_i1652];
          const _h1653 = (b.grid[v_e] !== 0);
          if (!(!(_h1653))) {
            _q1649 = false;
            break Q1650;
          }
        }
      }
      _c1654 = _q1649;
    }
    if (!(_c1654)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L1655: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h1656))) break L1655;
      if (import.meta.env.DEV && staleChecking) {
        let _c1661: boolean = (b.edgeCand(v_a) !== ((1 << 1)));
        if (_c1661) {
          let _q1657 = true;
          Q1658: {
            const _a1659 = sp.angleEdges[v_a];
            for (let _i1660 = 0; _i1660 < _a1659.length; _i1660++) {
              const v_e = _a1659[_i1660];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q1657 = false;
                break Q1658;
              }
            }
          }
          _c1661 = _q1657;
        }
        freshBinding("cornerFromPair", [(sp.angles.includes(v_a)), _c1661, (v_e === (sp.angleEdges[v_a][0] ?? -1)), (v_g === (sp.angleEdges[v_a][1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 2)))], ["a in", "where of a", "e =", "g =", "where of g"]);
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
      let _c1662: boolean = true;
      if (_c1662) {
        if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
        _c1662 = true;
      }
      if (!(_c1662)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, e: v_e, g: v_g }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairAtDotBinding {
  c: number;
  O: readonly number[];
  e: number;
  g: number;
}

const pairAtDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const pairAtDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function pairAtDot(b: Marks, sp: GridSpace, fire: Fire<PairAtDotBinding> | null): number {
  const _g1675: number[] = [];
  const facts = pairAtDotFacts;
  let fired = 0;
  let changed = false;
  const _h1685 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtDotFootprint) ?? null) : null;
  const _a1673 = sp.cells;
  for (let _i1674 = 0; _i1674 < _a1673.length; _i1674++) {
    const v_c = _a1673[_i1674];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g1675.length = 0;
    G1676: {
      const _a1679 = sp.cellEdges[v_c];
      for (let _i1680 = 0; _i1680 < _a1679.length; _i1680++) {
        const v_e = _a1679[_i1680];
        const _h1681 = (b.grid[v_e] !== 0);
        if (!(!(_h1681))) continue;
        _g1675.push(v_e);
      }
    }
    L1682: {
      const v_O = _g1675;
      const _h1683 = v_O.length;
      if (!((_h1683 === 2))) break L1682;
      const v_e = (v_O[0] ?? -1);
      L1684: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h1685))) break L1684;
        if (import.meta.env.DEV && staleChecking) {
          const _g1686: number[] = [];
          G1687: {
            const _a1690 = sp.cellEdges[v_c];
            for (let _i1691 = 0; _i1691 < _a1690.length; _i1691++) {
              const v_e = _a1690[_i1691];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g1686.push(v_e);
            }
          }
          freshBinding("pairAtDot", [(sp.cells.includes(v_c)), sameSet(v_O, _g1686), (v_O.length === 2), (v_e === (v_O[0] ?? -1)), (v_g === (v_O[1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 1) | (1 << 2)))], ["c in", "O =", "where of O", "e =", "g =", "where of g"]);
        }
        facts.length = 0;
        changed = false;
        let _g1692 = 0;
        G1693: {
          const _a1694 = sp.cellEdges[v_c];
          for (let _i1695 = 0; _i1695 < _a1694.length; _i1695++) {
            const v_e = _a1694[_i1695];
            const _h1696 = (b.grid[v_e] || -1);
            if (!((_h1696 === 1))) continue;
            _g1692++;
          }
        }
        const _t1697 = (1 + (_g1692 % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t1697); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t1697); }
        if (!(((b.pairOf(v_e, v_g) >> _t1697) & 1) !== 0)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, O: v_O.slice(), e: v_e, g: v_g }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ParityDotBinding {
  c: number;
  O: readonly number[];
  e: number;
  g: number;
  k: number;
}

const parityDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const parityDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function parityDot(b: Marks, sp: GridSpace, fire: Fire<ParityDotBinding> | null): number {
  const _g1714: number[] = [];
  const _g1728: number[] = [];
  const facts = parityDotFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityDotFootprint) ?? null) : null;
  const _a1712 = sp.cells;
  R1:
  for (let _i1713 = 0; _i1713 < _a1712.length; _i1713++) {
    const v_c = _a1712[_i1713];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _m630_0 = b.made[0];
    _g1714.length = 0;
    G1715: {
      const _a1718 = sp.cellEdges[v_c];
      for (let _i1719 = 0; _i1719 < _a1718.length; _i1719++) {
        const v_e = _a1718[_i1719];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1714.push(v_e);
      }
    }
    L1720: {
      const v_O = _g1714;
      const _h1721 = v_O.length;
      if (!((_h1721 === 3))) break L1720;
      const _a1722 = v_O;
      for (let _i1723 = 0; _i1723 < _a1722.length; _i1723++) {
        const v_e = _a1722[_i1723];
        const _h1726 = _i1723;
        const _a1724 = v_O;
        for (let _i1725 = 0; _i1725 < _a1724.length; _i1725++) {
          const v_g = _a1724[_i1725];
          if (!(((_i1725 > _h1726) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t1727 = minus(v_O, setOf(v_e, v_g));
          const v_k = (_t1727.length > 0 ? _t1727[0] : -1);
          if (b.made[0] !== _m630_0) {
            _g1728.length = 0;
            G1729: {
              const _a1732 = sp.cellEdges[v_c];
              for (let _i1733 = 0; _i1733 < _a1732.length; _i1733++) {
                const v_e = _a1732[_i1733];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1728.push(v_e);
              }
            }
            if (!(sameSet(v_O, _g1728))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g1734: number[] = [];
            G1735: {
              const _a1738 = sp.cellEdges[v_c];
              for (let _i1739 = 0; _i1739 < _a1738.length; _i1739++) {
                const v_e = _a1738[_i1739];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1734.push(v_e);
              }
            }
            const _t1740 = minus(v_O, setOf(v_e, v_g));
            freshBinding("parityDot", [(sp.cells.includes(v_c)), sameSet(v_O, _g1734), (v_O.length === 3), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i1725 > _i1723) && (popcount(b.pairOf(v_e, v_g)) === 1)), (v_k === (_t1740.length > 0 ? _t1740[0] : -1))], ["c in", "O =", "where of O", "e in", "g in", "where of g", "k ="]);
          }
          facts.length = 0;
          changed = false;
          const _t1745 = (2 - (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
          if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t1745); changed = true; } else facts.push(PLACE, v_k, _t1745); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, O: v_O.slice(), e: v_e, g: v_g, k: v_k }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LinkDotBinding {
  c: number;
  O: readonly number[];
  e: number;
  g: number;
  R: readonly number[];
  h: number;
  k: number;
}

const linkDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const linkDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function linkDot(b: Marks, sp: GridSpace, fire: Fire<LinkDotBinding> | null): number {
  const _g1762: number[] = [];
  const _g1778: number[] = [];
  const facts = linkDotFacts;
  let fired = 0;
  let changed = false;
  const _h1777 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkDotFootprint) ?? null) : null;
  const _a1760 = sp.cells;
  R1:
  for (let _i1761 = 0; _i1761 < _a1760.length; _i1761++) {
    const v_c = _a1760[_i1761];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _m656_0 = b.made[0];
    _g1762.length = 0;
    G1763: {
      const _a1766 = sp.cellEdges[v_c];
      for (let _i1767 = 0; _i1767 < _a1766.length; _i1767++) {
        const v_e = _a1766[_i1767];
        const _h1768 = (b.grid[v_e] !== 0);
        if (!(!(_h1768))) continue;
        _g1762.push(v_e);
      }
    }
    L1769: {
      const v_O = _g1762;
      const _h1770 = v_O.length;
      if (!((_h1770 === 4))) break L1769;
      const _a1771 = v_O;
      for (let _i1772 = 0; _i1772 < _a1771.length; _i1772++) {
        const v_e = _a1771[_i1772];
        const _h1775 = _i1772;
        const _a1773 = v_O;
        for (let _i1774 = 0; _i1774 < _a1773.length; _i1774++) {
          const v_g = _a1773[_i1774];
          if (!(((_i1774 > _h1775) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L1776: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h1777))) break L1776;
            if (b.made[0] !== _m656_0) {
              _g1778.length = 0;
              G1779: {
                const _a1782 = sp.cellEdges[v_c];
                for (let _i1783 = 0; _i1783 < _a1782.length; _i1783++) {
                  const v_e = _a1782[_i1783];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g1778.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g1778))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g1784: number[] = [];
              G1785: {
                const _a1788 = sp.cellEdges[v_c];
                for (let _i1789 = 0; _i1789 < _a1788.length; _i1789++) {
                  const v_e = _a1788[_i1789];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g1784.push(v_e);
                }
              }
              freshBinding("linkDot", [(sp.cells.includes(v_c)), sameSet(v_O, _g1784), (v_O.length === 4), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i1774 > _i1772) && (popcount(b.pairOf(v_e, v_g)) === 1)), sameSet(v_R, minus(v_O, setOf(v_e, v_g))), (v_h === (v_R[0] ?? -1)), (v_k === (v_R[1] ?? -1)), (b.pairOf(v_h, v_k) === ((1 << 1) | (1 << 2)))], ["c in", "O =", "where of O", "e in", "g in", "where of g", "R =", "h =", "k =", "where of k"]);
            }
            facts.length = 0;
            changed = false;
            const _t1790 = (1 + (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t1790); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t1790); }
            if (!(((b.pairOf(v_h, v_k) >> _t1790) & 1) !== 0)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ c: v_c, O: v_O.slice(), e: v_e, g: v_g, R: v_R.slice(), h: v_h, k: v_k }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}

const dotOpenKept = keptStore<number>();

/** `dotOpen(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function dotOpen(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = dotOpenKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g623 = 0;
  G624: {
    const _a625 = sp.cellEdges[v_c];
    for (let _i626 = 0; _i626 < _a625.length; _i626++) {
      const v_e = _a625[_i626];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      _g623++;
    }
  }
  const _made = _g623;
  _kept[v_c] = _made;
  return _made;
}

const needKept = keptStore<number>();

/** `need(f)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_f: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_f] !== undefined) return _kept[v_f];
  let _g1542 = 0;
  G1543: {
    const _a1544 = sp.faceEdges[v_f];
    for (let _i1545 = 0; _i1545 < _a1544.length; _i1545++) {
      const v_e = _a1544[_i1545];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1542++;
    }
  }
  const _made = (clueAt(cl.number, v_f) - _g1542);
  _kept[v_f] = _made;
  return _made;
}

const dotLinesKept = keptStore<number>();

/** `dotLines(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function dotLines(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = dotLinesKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1741 = 0;
  G1742: {
    const _a1743 = sp.cellEdges[v_c];
    for (let _i1744 = 0; _i1744 < _a1743.length; _i1744++) {
      const v_e = _a1743[_i1744];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1741++;
    }
  }
  const _made = _g1741;
  _kept[v_c] = _made;
  return _made;
}
