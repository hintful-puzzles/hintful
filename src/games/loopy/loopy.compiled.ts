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
  const _g23: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _g5 = 0;
      G6: {
        const _a7 = sp.cellEdges[v_c];
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const v_e = _a7[_i8];
          const _h9 = (g[v_e] || -1);
          if (!((_h9 === 1))) continue;
          _g5++;
        }
      }
      let _c15: boolean = (_g5 === 0);
      if (!_c15) {
        let _g10 = 0;
        G11: {
          const _a12 = sp.cellEdges[v_c];
          for (let _i13 = 0; _i13 < _a12.length; _i13++) {
            const v_e = _a12[_i13];
            const _h14 = (g[v_e] || -1);
            if (!((_h14 === 1))) continue;
            _g10++;
          }
        }
        _c15 = (_g10 === 2);
      }
      if (!(_c15)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q16 = false;
  Q17: {
    const _a18 = sp.edges;
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_e = _a18[_i19];
      const _h20 = (g[v_e] || -1);
      if ((_h20 === 1)) {
        _q16 = true;
        break Q17;
      }
    }
  }
  let _c45: boolean = _q16;
  if (_c45) {
    let _q21 = true;
    Q22: {
      _g23.length = 0;
      G24: {
        const _a27 = sp.edges;
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_e = _a27[_i28];
          const _h29 = (g[v_e] || -1);
          if (!((_h29 === 1))) continue;
          _g23.push(v_e);
        }
      }
      const v_L = _g23;
      const _eg44 = edgeGroups(sp, v_L);
      const _a30 = sp.cells;
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_a = _a30[_i31];
        let _g32 = 0;
        G33: {
          const _a34 = sp.cellEdges[v_a];
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_e = _a34[_i35];
            const _h36 = (g[v_e] || -1);
            if (!((_h36 === 1))) continue;
            _g32++;
          }
        }
        if (!((_g32 > 0))) continue;
        const _a37 = sp.cells;
        for (let _i38 = 0; _i38 < _a37.length; _i38++) {
          const v_b = _a37[_i38];
          let _g39 = 0;
          G40: {
            const _a41 = sp.cellEdges[v_b];
            for (let _i42 = 0; _i42 < _a41.length; _i42++) {
              const v_e = _a41[_i42];
              const _h43 = (g[v_e] || -1);
              if (!((_h43 === 1))) continue;
              _g39++;
            }
          }
          if (!((_g39 > 0))) continue;
          if (!((_eg44.of(v_b) === _eg44.of(v_a)))) {
            _q21 = false;
            break Q22;
          }
        }
      }
    }
    _c45 = _q21;
  }
  if (!(_c45)) return false;
  for (let _k46 = 0; _k46 < cl.number.at.length; _k46++) {
    const _at47 = cl.number.at[_k46];
    let _g49 = 0;
    G50: {
      const _a51 = sp.faceEdges[_at47];
      for (let _i52 = 0; _i52 < _a51.length; _i52++) {
        const v_e = _a51[_i52];
        const _h53 = (g[v_e] || -1);
        if (!((_h53 === 1))) continue;
        _g49++;
      }
    }
    if (!((_g49 === clueAt(cl.number, _at47)))) return false;
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
  const _a12 = sp.cells;
  for (let _i13 = 0; _i13 < _a12.length; _i13++) {
    const v_c = _a12[_i13];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g14 = 0;
    G15: {
      const _a16 = sp.cellEdges[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_e = _a16[_i17];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g14++;
      }
    }
    L18: {
      const v_o = _g14;
      let _g19 = 0;
      G20: {
        const _a21 = sp.cellEdges[v_c];
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_e = _a21[_i22];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g19++;
        }
      }
      if (!(((_g19 === 1) && (v_o <= 1)))) break L18;
      if (import.meta.env.DEV && staleChecking) {
        let _g23 = 0;
        G24: {
          const _a25 = sp.cellEdges[v_c];
          for (let _i26 = 0; _i26 < _a25.length; _i26++) {
            const v_e = _a25[_i26];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g23++;
          }
        }
        let _g27 = 0;
        G28: {
          const _a29 = sp.cellEdges[v_c];
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_e = _a29[_i30];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g27++;
          }
        }
        freshBinding("lineContinues", [(sp.cells.includes(v_c)), (v_o === _g23), ((_g27 === 1) && (v_o <= 1))], ["c in", "o =", "where of o"]);
      }
      facts.length = 0;
      changed = false;
      let _c35: boolean = (v_o === 1);
      if (_c35) {
        let _q31 = true;
        Q32: {
          const _a33 = sp.cellEdges[v_c];
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_e = _a33[_i34];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
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
  const _a14 = sp.cells;
  for (let _i15 = 0; _i15 < _a14.length; _i15++) {
    const v_c = _a14[_i15];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g16 = 0;
    G17: {
      const _a18 = sp.cellEdges[v_c];
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_e = _a18[_i19];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g16++;
      }
    }
    L20: {
      const v_k = _g16;
      let _c26: boolean = (v_k > 2);
      if (!_c26) {
        let _c25: boolean = (v_k === 2);
        if (_c25) {
          let _g21 = 0;
          G22: {
            const _a23 = sp.cellEdges[v_c];
            for (let _i24 = 0; _i24 < _a23.length; _i24++) {
              const v_e = _a23[_i24];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g21++;
            }
          }
          _c25 = (_g21 > 0);
        }
        _c26 = _c25;
      }
      if (!(_c26)) break L20;
      if (import.meta.env.DEV && staleChecking) {
        let _g27 = 0;
        G28: {
          const _a29 = sp.cellEdges[v_c];
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_e = _a29[_i30];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g27++;
          }
        }
        let _c36: boolean = (v_k > 2);
        if (!_c36) {
          let _c35: boolean = (v_k === 2);
          if (_c35) {
            let _g31 = 0;
            G32: {
              const _a33 = sp.cellEdges[v_c];
              for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                const v_e = _a33[_i34];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g31++;
              }
            }
            _c35 = (_g31 > 0);
          }
          _c36 = _c35;
        }
        freshBinding("dotFull", [(sp.cells.includes(v_c)), (v_k === _g27), _c36], ["c in", "k =", "where of k"]);
      }
      facts.length = 0;
      changed = false;
      let _c41: boolean = (v_k === 2);
      if (_c41) {
        let _q37 = true;
        Q38: {
          const _a39 = sp.cellEdges[v_c];
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_e = _a39[_i40];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q37 = false;
              break Q38;
            }
          }
        }
        _c41 = _q37;
      }
      if (!(_c41)) return -1;
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
  const _a14 = sp.faces;
  for (let _i15 = 0; _i15 < _a14.length; _i15++) {
    const v_f = _a14[_i15];
    const _h16 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h16 !== -1))) continue;
    let _g17 = 0;
    G18: {
      const _a19 = sp.faceEdges[v_f];
      for (let _i20 = 0; _i20 < _a19.length; _i20++) {
        const v_e = _a19[_i20];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g17++;
      }
    }
    L21: {
      const v_n = (_h16 - _g17);
      let _c27: boolean = (v_n < 0);
      if (!_c27) {
        let _c26: boolean = (v_n === 0);
        if (_c26) {
          let _g22 = 0;
          G23: {
            const _a24 = sp.faceEdges[v_f];
            for (let _i25 = 0; _i25 < _a24.length; _i25++) {
              const v_e = _a24[_i25];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g22++;
            }
          }
          _c26 = (_g22 > 0);
        }
        _c27 = _c26;
      }
      if (!(_c27)) break L21;
      if (import.meta.env.DEV && staleChecking) {
        let _g28 = 0;
        G29: {
          const _a30 = sp.faceEdges[v_f];
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_e = _a30[_i31];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g28++;
          }
        }
        let _c37: boolean = (v_n < 0);
        if (!_c37) {
          let _c36: boolean = (v_n === 0);
          if (_c36) {
            let _g32 = 0;
            G33: {
              const _a34 = sp.faceEdges[v_f];
              for (let _i35 = 0; _i35 < _a34.length; _i35++) {
                const v_e = _a34[_i35];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g32++;
              }
            }
            _c36 = (_g32 > 0);
          }
          _c37 = _c36;
        }
        freshBinding("clueFull", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === (clueAt(cl.number, v_f) - _g28)), _c37], ["f in", "where of f", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c42: boolean = (v_n === 0);
      if (_c42) {
        let _q38 = true;
        Q39: {
          const _a40 = sp.faceEdges[v_f];
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_e = _a40[_i41];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q38 = false;
              break Q39;
            }
          }
        }
        _c42 = _q38;
      }
      if (!(_c42)) return -1;
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
  const _a12 = sp.faces;
  for (let _i13 = 0; _i13 < _a12.length; _i13++) {
    const v_f = _a12[_i13];
    const _h14 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h14 !== -1))) continue;
    let _g15 = 0;
    G16: {
      const _a17 = sp.faceEdges[v_f];
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_e = _a17[_i18];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g15++;
      }
    }
    const v_n = (_h14 - _g15);
    let _g19 = 0;
    G20: {
      const _a21 = sp.faceEdges[v_f];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_e = _a21[_i22];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g19++;
      }
    }
    L23: {
      const v_o = _g19;
      if (!(((v_n > 0) && (v_o <= v_n)))) break L23;
      if (import.meta.env.DEV && staleChecking) {
        let _g24 = 0;
        G25: {
          const _a26 = sp.faceEdges[v_f];
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_e = _a26[_i27];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g24++;
          }
        }
        let _g28 = 0;
        G29: {
          const _a30 = sp.faceEdges[v_f];
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_e = _a30[_i31];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g28++;
          }
        }
        freshBinding("clueStarved", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === (clueAt(cl.number, v_f) - _g24)), (v_o === _g28), ((v_n > 0) && (v_o <= v_n))], ["f in", "where of f", "n =", "o =", "where of o"]);
      }
      facts.length = 0;
      changed = false;
      let _c36: boolean = (v_o === v_n);
      if (_c36) {
        let _q32 = true;
        Q33: {
          const _a34 = sp.faceEdges[v_f];
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_e = _a34[_i35];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            if (!(true)) {
              _q32 = false;
              break Q33;
            }
          }
        }
        _c36 = _q32;
      }
      if (!(_c36)) return -1;
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
  const _a33 = sp.faces;
  R1:
  for (let _i34 = 0; _i34 < _a33.length; _i34++) {
    const v_f = _a33[_i34];
    const _m113_0 = b.made[0];
    const _h35 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c44: boolean = (_h35 !== -1);
    if (_c44) {
      let _g36 = 0;
      G37: {
        const _a38 = sp.faceEdges[v_f];
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_e = _a38[_i39];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g36++;
        }
      }
      let _g40 = 0;
      G41: {
        const _a42 = sp.faceEdges[v_f];
        for (let _i43 = 0; _i43 < _a42.length; _i43++) {
          const v_e = _a42[_i43];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g40++;
        }
      }
      _c44 = ((_h35 - _g36) === (_g40 - 1));
    }
    let _c49: boolean = _c44;
    if (_c49) {
      let _g45 = 0;
      G46: {
        const _a47 = sp.faceEdges[v_f];
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_e = _a47[_i48];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g45++;
        }
      }
      _c49 = (_g45 > 2);
    }
    if (!(_c49)) continue;
    const _a50 = sp.faceEdges[v_f];
    for (let _i51 = 0; _i51 < _a50.length; _i51++) {
      const v_e = _a50[_i51];
      let _c65: boolean = !((b.grid[v_e] !== 0));
      if (_c65) {
        let _q52 = true;
        Q53: {
          const _a54 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_c = _a54[_i55];
            let _g56 = 0;
            G57: {
              const _a58 = sp.cellEdges[v_c];
              for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                const v_e = _a58[_i59];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g56++;
              }
            }
            let _c64: boolean = (_g56 > 0);
            if (_c64) {
              let _q60 = true;
              Q61: {
                const _a62 = sp.faceEdges[v_f];
                for (let _i63 = 0; _i63 < _a62.length; _i63++) {
                  const v_g = _a62[_i63];
                  if (!(((v_g !== v_e) && ([sp.edgeEnds[2 * v_g], sp.edgeEnds[2 * v_g + 1]].includes(v_c))))) continue;
                  if (!(!((b.grid[v_g] !== 0)))) {
                    _q60 = false;
                    break Q61;
                  }
                }
              }
              _c64 = _q60;
            }
            if (!(_c64)) {
              _q52 = false;
              break Q53;
            }
          }
        }
        _c65 = _q52;
      }
      if (!(_c65)) continue;
      if (b.made[0] !== _m113_0) {
        let _c74: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c74) {
          let _g66 = 0;
          G67: {
            const _a68 = sp.faceEdges[v_f];
            for (let _i69 = 0; _i69 < _a68.length; _i69++) {
              const v_e = _a68[_i69];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g66++;
            }
          }
          let _g70 = 0;
          G71: {
            const _a72 = sp.faceEdges[v_f];
            for (let _i73 = 0; _i73 < _a72.length; _i73++) {
              const v_e = _a72[_i73];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g70++;
            }
          }
          _c74 = ((clueAt(cl.number, v_f) - _g66) === (_g70 - 1));
        }
        let _c79: boolean = _c74;
        if (_c79) {
          let _g75 = 0;
          G76: {
            const _a77 = sp.faceEdges[v_f];
            for (let _i78 = 0; _i78 < _a77.length; _i78++) {
              const v_e = _a77[_i78];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g75++;
            }
          }
          _c79 = (_g75 > 2);
        }
        if (!(_c79)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c88: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c88) {
          let _g80 = 0;
          G81: {
            const _a82 = sp.faceEdges[v_f];
            for (let _i83 = 0; _i83 < _a82.length; _i83++) {
              const v_e = _a82[_i83];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g80++;
            }
          }
          let _g84 = 0;
          G85: {
            const _a86 = sp.faceEdges[v_f];
            for (let _i87 = 0; _i87 < _a86.length; _i87++) {
              const v_e = _a86[_i87];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g84++;
            }
          }
          _c88 = ((clueAt(cl.number, v_f) - _g80) === (_g84 - 1));
        }
        let _c93: boolean = _c88;
        if (_c93) {
          let _g89 = 0;
          G90: {
            const _a91 = sp.faceEdges[v_f];
            for (let _i92 = 0; _i92 < _a91.length; _i92++) {
              const v_e = _a91[_i92];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g89++;
            }
          }
          _c93 = (_g89 > 2);
        }
        let _c107: boolean = !((b.grid[v_e] !== 0));
        if (_c107) {
          let _q94 = true;
          Q95: {
            const _a96 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
            for (let _i97 = 0; _i97 < _a96.length; _i97++) {
              const v_c = _a96[_i97];
              let _g98 = 0;
              G99: {
                const _a100 = sp.cellEdges[v_c];
                for (let _i101 = 0; _i101 < _a100.length; _i101++) {
                  const v_e = _a100[_i101];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g98++;
                }
              }
              let _c106: boolean = (_g98 > 0);
              if (_c106) {
                let _q102 = true;
                Q103: {
                  const _a104 = sp.faceEdges[v_f];
                  for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                    const v_g = _a104[_i105];
                    if (!(((v_g !== v_e) && ([sp.edgeEnds[2 * v_g], sp.edgeEnds[2 * v_g + 1]].includes(v_c))))) continue;
                    if (!(!((b.grid[v_g] !== 0)))) {
                      _q102 = false;
                      break Q103;
                    }
                  }
                }
                _c106 = _q102;
              }
              if (!(_c106)) {
                _q94 = false;
                break Q95;
              }
            }
          }
          _c107 = _q94;
        }
        freshBinding("clueBlockedPair", [(sp.faces.includes(v_f)), _c93, (sp.faceEdges[v_f].includes(v_e)), _c107], ["f in", "where of f", "e in", "where of e"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      let _c112: boolean = true;
      if (_c112) {
        let _q108 = true;
        Q109: {
          const _a110 = sp.faceEdges[v_f];
          for (let _i111 = 0; _i111 < _a110.length; _i111++) {
            const v_g = _a110[_i111];
            if (!(((v_g !== v_e) && !((b.grid[v_g] !== 0))))) continue;
            if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
            if (!(true)) {
              _q108 = false;
              break Q109;
            }
          }
        }
        _c112 = _q108;
      }
      if (!(_c112)) return -1;
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
  const _a29 = sp.faces;
  R1:
  for (let _i30 = 0; _i30 < _a29.length; _i30++) {
    const v_f = _a29[_i30];
    const _m100_0 = b.made[0];
    const _h31 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c40: boolean = (_h31 !== -1);
    if (_c40) {
      let _g32 = 0;
      G33: {
        const _a34 = sp.faceEdges[v_f];
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_e = _a34[_i35];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g32++;
        }
      }
      let _g36 = 0;
      G37: {
        const _a38 = sp.faceEdges[v_f];
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_e = _a38[_i39];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g36++;
        }
      }
      _c40 = ((_h31 - _g32) === (_g36 - 1));
    }
    let _c45: boolean = _c40;
    if (_c45) {
      let _g41 = 0;
      G42: {
        const _a43 = sp.faceEdges[v_f];
        for (let _i44 = 0; _i44 < _a43.length; _i44++) {
          const v_e = _a43[_i44];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g41++;
        }
      }
      _c45 = (_g41 > 2);
    }
    if (!(_c45)) continue;
    const _a46 = sp.faceAngles[v_f];
    for (let _i47 = 0; _i47 < _a46.length; _i47++) {
      const v_a = _a46[_i47];
      let _q48 = true;
      Q49: {
        const _a50 = sp.angleEdges[v_a];
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_e = _a50[_i51];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q48 = false;
            break Q49;
          }
        }
      }
      let _c57: boolean = _q48;
      if (_c57) {
        const _t52 = sp.angleCell[v_a];
        let _g53 = 0;
        G54: {
          const _a55 = sp.cellEdges[_t52];
          for (let _i56 = 0; _i56 < _a55.length; _i56++) {
            const v_e = _a55[_i56];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g53++;
          }
        }
        _c57 = (_g53 > 0);
      }
      if (!(_c57)) continue;
      if (b.made[0] !== _m100_0) {
        let _c66: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c66) {
          let _g58 = 0;
          G59: {
            const _a60 = sp.faceEdges[v_f];
            for (let _i61 = 0; _i61 < _a60.length; _i61++) {
              const v_e = _a60[_i61];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g58++;
            }
          }
          let _g62 = 0;
          G63: {
            const _a64 = sp.faceEdges[v_f];
            for (let _i65 = 0; _i65 < _a64.length; _i65++) {
              const v_e = _a64[_i65];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g62++;
            }
          }
          _c66 = ((clueAt(cl.number, v_f) - _g58) === (_g62 - 1));
        }
        let _c71: boolean = _c66;
        if (_c71) {
          let _g67 = 0;
          G68: {
            const _a69 = sp.faceEdges[v_f];
            for (let _i70 = 0; _i70 < _a69.length; _i70++) {
              const v_e = _a69[_i70];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g67++;
            }
          }
          _c71 = (_g67 > 2);
        }
        if (!(_c71)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c80: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c80) {
          let _g72 = 0;
          G73: {
            const _a74 = sp.faceEdges[v_f];
            for (let _i75 = 0; _i75 < _a74.length; _i75++) {
              const v_e = _a74[_i75];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g72++;
            }
          }
          let _g76 = 0;
          G77: {
            const _a78 = sp.faceEdges[v_f];
            for (let _i79 = 0; _i79 < _a78.length; _i79++) {
              const v_e = _a78[_i79];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g76++;
            }
          }
          _c80 = ((clueAt(cl.number, v_f) - _g72) === (_g76 - 1));
        }
        let _c85: boolean = _c80;
        if (_c85) {
          let _g81 = 0;
          G82: {
            const _a83 = sp.faceEdges[v_f];
            for (let _i84 = 0; _i84 < _a83.length; _i84++) {
              const v_e = _a83[_i84];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g81++;
            }
          }
          _c85 = (_g81 > 2);
        }
        let _q86 = true;
        Q87: {
          const _a88 = sp.angleEdges[v_a];
          for (let _i89 = 0; _i89 < _a88.length; _i89++) {
            const v_e = _a88[_i89];
            if (!(!((b.grid[v_e] !== 0)))) {
              _q86 = false;
              break Q87;
            }
          }
        }
        let _c95: boolean = _q86;
        if (_c95) {
          const _t90 = sp.angleCell[v_a];
          let _g91 = 0;
          G92: {
            const _a93 = sp.cellEdges[_t90];
            for (let _i94 = 0; _i94 < _a93.length; _i94++) {
              const v_e = _a93[_i94];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g91++;
            }
          }
          _c95 = (_g91 > 0);
        }
        freshBinding("clueOneShort", [(sp.faces.includes(v_f)), _c85, (sp.faceAngles[v_f].includes(v_a)), _c95], ["f in", "where of f", "a in", "where of a"]);
      }
      facts.length = 0;
      changed = false;
      let _q96 = true;
      Q97: {
        const _a98 = sp.faceEdges[v_f];
        for (let _i99 = 0; _i99 < _a98.length; _i99++) {
          const v_g = _a98[_i99];
          if (!((!((b.grid[v_g] !== 0)) && !(sp.angleEdges[v_a].includes(v_g))))) continue;
          if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
          if (!(true)) {
            _q96 = false;
            break Q97;
          }
        }
      }
      if (!(_q96)) return -1;
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
  const _g28: number[] = [];
  const _g57: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  const _m87_0 = b.made[0];
  _g28.length = 0;
  G29: {
    const _a32 = sp.edges;
    for (let _i33 = 0; _i33 < _a32.length; _i33++) {
      const v_e = _a32[_i33];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g28.push(v_e);
    }
  }
  const v_L = _g28;
  const _m88_1 = b.made[1];
  const _m89_2 = b.made[2];
  const _m90_4 = b.made[4];
  const _eg36 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a34 = sp.edges;
  for (let _i35 = 0; _i35 < _a34.length; _i35++) {
    const v_e = _a34[_i35];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L37: {
      const v_G = _eg36.of(sp.edgeEnds[2 * v_e]);
      let _c56: boolean = (_eg36.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c56) {
        let _q38 = false;
        Q39: {
          const _a40 = v_L;
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_g = _a40[_i41];
            if (!(_eg36.of(sp.edgeEnds[2 * v_g]) === v_G)) {
              _q38 = true;
              break Q39;
            }
          }
        }
        let _c55: boolean = _q38;
        if (!_c55) {
          let _q42 = false;
          Q43: {
            const _a44 = sp.faces;
            for (let _i45 = 0; _i45 < _a44.length; _i45++) {
              const v_f = _a44[_i45];
              const _h46 = clueAt(cl.number, v_f);
              if (!((_h46 !== -1))) continue;
              let _g47 = 0;
              G48: {
                const _a49 = sp.faceEdges[v_f];
                for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                  const v_e = _a49[_i50];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g47++;
                }
              }
              let _g51 = 0;
              G52: {
                const _a53 = sp.faceEdges[v_f];
                for (let _i54 = 0; _i54 < _a53.length; _i54++) {
                  const v_x = _a53[_i54];
                  if (!((v_x === v_e))) continue;
                  _g51++;
                }
              }
              if (((_h46 - _g47) !== _g51)) {
                _q42 = true;
                break Q43;
              }
            }
          }
          _c55 = _q42;
        }
        _c56 = _c55;
      }
      if (!(_c56)) break L37;
      if (b.made[0] !== _m87_0 || b.made[1] !== _m88_1 || b.made[2] !== _m89_2 || b.made[4] !== _m90_4) {
        _g57.length = 0;
        G58: {
          const _a61 = sp.edges;
          for (let _i62 = 0; _i62 < _a61.length; _i62++) {
            const v_e = _a61[_i62];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g57.push(v_e);
          }
        }
        if (!(sameSet(v_L, _g57))) { return fired; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g63: number[] = [];
        G64: {
          const _a67 = sp.edges;
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_e = _a67[_i68];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g63.push(v_e);
          }
        }
        let _c86: boolean = (_eg36.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c86) {
          let _q69 = false;
          Q70: {
            const _a71 = v_L;
            for (let _i72 = 0; _i72 < _a71.length; _i72++) {
              const v_g = _a71[_i72];
              if (!(_eg36.of(sp.edgeEnds[2 * v_g]) === v_G)) {
                _q69 = true;
                break Q70;
              }
            }
          }
          let _c85: boolean = _q69;
          if (!_c85) {
            let _q73 = false;
            Q74: {
              const _a75 = sp.faces;
              for (let _i76 = 0; _i76 < _a75.length; _i76++) {
                const v_f = _a75[_i76];
                if (!((clueAt(cl.number, v_f) !== -1))) continue;
                let _g77 = 0;
                G78: {
                  const _a79 = sp.faceEdges[v_f];
                  for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                    const v_e = _a79[_i80];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g77++;
                  }
                }
                let _g81 = 0;
                G82: {
                  const _a83 = sp.faceEdges[v_f];
                  for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                    const v_x = _a83[_i84];
                    if (!((v_x === v_e))) continue;
                    _g81++;
                  }
                }
                if (((clueAt(cl.number, v_f) - _g77) !== _g81)) {
                  _q73 = true;
                  break Q74;
                }
              }
            }
            _c85 = _q73;
          }
          _c86 = _c85;
        }
        freshBinding("earlyLoop", [sameSet(v_L, _g63), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_L)), _c86], ["L =", "e in", "where of e", "G =", "where of G"]);
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
  const _g27: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g27.length = 0;
  G28: {
    const _a31 = sp.edges;
    for (let _i32 = 0; _i32 < _a31.length; _i32++) {
      const v_e = _a31[_i32];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g27.push(v_e);
    }
  }
  const v_L = _g27;
  const _eg53 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L33: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    const _h52 = sp.edgeEnds[2 * v_g];
    let _c38: boolean = (v_g !== -1);
    if (_c38) {
      let _q34 = false;
      Q35: {
        const _a36 = sp.edges;
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          const v_e = _a36[_i37];
          if (!((b.grid[v_e] !== 0))) {
            _q34 = true;
            break Q35;
          }
        }
      }
      _c38 = _q34;
    }
    let _c47: boolean = _c38;
    if (_c47) {
      let _q39 = true;
      Q40: {
        const _a41 = sp.cells;
        for (let _i42 = 0; _i42 < _a41.length; _i42++) {
          const v_c = _a41[_i42];
          let _g43 = 0;
          G44: {
            const _a45 = sp.cellEdges[v_c];
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_e = _a45[_i46];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g43++;
            }
          }
          if (!((_g43 !== 1))) {
            _q39 = false;
            break Q40;
          }
        }
      }
      _c47 = _q39;
    }
    let _c54: boolean = _c47;
    if (_c54) {
      let _q48 = true;
      Q49: {
        const _a50 = v_L;
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_x = _a50[_i51];
          if (!((_eg53.of(sp.edgeEnds[2 * v_x]) === _eg53.of(_h52)))) {
            _q48 = false;
            break Q49;
          }
        }
      }
      _c54 = _q48;
    }
    if (!(_c54)) break L33;
    if (import.meta.env.DEV && staleChecking) {
      const _g55: number[] = [];
      G56: {
        const _a59 = sp.edges;
        for (let _i60 = 0; _i60 < _a59.length; _i60++) {
          const v_e = _a59[_i60];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g55.push(v_e);
        }
      }
      let _c65: boolean = (v_g !== -1);
      if (_c65) {
        let _q61 = false;
        Q62: {
          const _a63 = sp.edges;
          for (let _i64 = 0; _i64 < _a63.length; _i64++) {
            const v_e = _a63[_i64];
            if (!((b.grid[v_e] !== 0))) {
              _q61 = true;
              break Q62;
            }
          }
        }
        _c65 = _q61;
      }
      let _c74: boolean = _c65;
      if (_c74) {
        let _q66 = true;
        Q67: {
          const _a68 = sp.cells;
          for (let _i69 = 0; _i69 < _a68.length; _i69++) {
            const v_c = _a68[_i69];
            let _g70 = 0;
            G71: {
              const _a72 = sp.cellEdges[v_c];
              for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                const v_e = _a72[_i73];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g70++;
              }
            }
            if (!((_g70 !== 1))) {
              _q66 = false;
              break Q67;
            }
          }
        }
        _c74 = _q66;
      }
      let _c79: boolean = _c74;
      if (_c79) {
        let _q75 = true;
        Q76: {
          const _a77 = v_L;
          for (let _i78 = 0; _i78 < _a77.length; _i78++) {
            const v_x = _a77[_i78];
            if (!((through(sp, sp.edgeEnds[2 * v_g], v_L).includes(sp.edgeEnds[2 * v_x])))) {
              _q75 = false;
              break Q76;
            }
          }
        }
        _c79 = _q75;
      }
      freshBinding("closed", [sameSet(v_L, _g55), (v_g === (v_L.length > 0 ? v_L[0] : -1)), _c79], ["L =", "g =", "where of g"]);
    }
    facts.length = 0;
    changed = false;
    let _q80 = true;
    Q81: {
      const _a82 = sp.edges;
      for (let _i83 = 0; _i83 < _a82.length; _i83++) {
        const v_e = _a82[_i83];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) {
          _q80 = false;
          break Q81;
        }
      }
    }
    if (!(_q80)) return -1;
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
  const _h9 = ((1 << 1));
  const _h12 = ((1 << 2));
  const _a5 = sp.edges;
  R1:
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_e = _a5[_i6];
    const _m16_0 = b.made[0];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _m17_4 = b.made[4];
    const _a7 = b.relatedOf(v_e);
    R2:
    for (let _i8 = 0; _i8 < _a7.length; _i8++) {
      const v_g = _a7[_i8];
      if (!((b.grid[v_g] !== 0))) continue;
      if (b.made[0] !== _m16_0 || b.made[4] !== _m17_4) {
        if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
        if (!((b.relatedOf(v_e).includes(v_g)))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("related", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), (b.relatedOf(v_e).includes(v_g)), (b.grid[v_g] !== 0)], ["e in", "where of e", "g in", "where of g"]);
      }
      facts.length = 0;
      changed = false;
      let _c11: boolean = !((b.pairOf(v_e, v_g) === _h9));
      if (!_c11) {
        const _t10 = (b.grid[v_g] || -1);
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t10); changed = true; } else facts.push(PLACE, v_e, _t10); }
        _c11 = true;
      }
      let _c15: boolean = _c11;
      if (_c15) {
        let _c14: boolean = !((b.pairOf(v_e, v_g) === _h12));
        if (!_c14) {
          const _t13 = (3 - (b.grid[v_g] || -1));
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t13); changed = true; } else facts.push(PLACE, v_e, _t13); }
          _c14 = true;
        }
        _c15 = _c14;
      }
      if (!(_c15)) return -1;
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
  const _a13 = sp.cells;
  R1:
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_c = _a13[_i14];
    const _m41_0 = b.made[0];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g15 = 0;
    G16: {
      const _a17 = sp.cellEdges[v_c];
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_e = _a17[_i18];
        const _h19 = (b.grid[v_e] || -1);
        if (!((_h19 === 1))) continue;
        _g15++;
      }
    }
    if (!((_g15 === 1))) continue;
    const _a20 = sp.cellAngles[v_c];
    for (let _i21 = 0; _i21 < _a20.length; _i21++) {
      const v_a = _a20[_i21];
      let _q22 = true;
      Q23: {
        const _a24 = sp.angleEdges[v_a];
        for (let _i25 = 0; _i25 < _a24.length; _i25++) {
          const v_e = _a24[_i25];
          const _h26 = (b.grid[v_e] !== 0);
          if (!(!(_h26))) {
            _q22 = false;
            break Q23;
          }
        }
      }
      if (!(_q22)) continue;
      if (b.made[0] !== _m41_0) {
        let _g27 = 0;
        G28: {
          const _a29 = sp.cellEdges[v_c];
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_e = _a29[_i30];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g27++;
          }
        }
        if (!((_g27 === 1))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _g31 = 0;
        G32: {
          const _a33 = sp.cellEdges[v_c];
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_e = _a33[_i34];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g31++;
          }
        }
        let _q35 = true;
        Q36: {
          const _a37 = sp.angleEdges[v_a];
          for (let _i38 = 0; _i38 < _a37.length; _i38++) {
            const v_e = _a37[_i38];
            if (!(!((b.grid[v_e] !== 0)))) {
              _q35 = false;
              break Q36;
            }
          }
        }
        freshBinding("cornerAtDot", [(sp.cells.includes(v_c)), (_g31 === 1), (sp.cellAngles[v_c].includes(v_a)), _q35], ["c in", "where of c", "a in", "where of a"]);
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
      let _c40: boolean = true;
      if (_c40) {
        let _c39: boolean = !((dotOpen(b, sp, v_c) === 2));
        if (!_c39) {
          if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
          _c39 = true;
        }
        _c40 = _c39;
      }
      if (!(_c40)) return -1;
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
  const _h9 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerOtherFootprint) ?? null) : null;
  const _a7 = sp.angles;
  R1:
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_a = _a7[_i8];
    const _m15_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    if (!((b.edgeCand(v_a) !== _h9))) continue;
    const _a10 = sp.angleEdges[v_a];
    for (let _i11 = 0; _i11 < _a10.length; _i11++) {
      const v_e = _a10[_i11];
      const _a12 = sp.angleEdges[v_a];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_g = _a12[_i13];
        if (!(((((v_g !== v_e) && (b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && ((((b.grid[v_e] || -1) === 1) && !(((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (((b.grid[v_e] || -1) === 2) && !(((b.edgeCand(v_a) >> 0) & 1) !== 0)))))) continue;
        if (b.made[2] !== _m15_2) {
          if (!((b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("cornerOther", [(sp.angles.includes(v_a)), (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))), (sp.angleEdges[v_a].includes(v_e)), (sp.angleEdges[v_a].includes(v_g)), ((((v_g !== v_e) && (b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && ((((b.grid[v_e] || -1) === 1) && !(((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (((b.grid[v_e] || -1) === 2) && !(((b.edgeCand(v_a) >> 0) & 1) !== 0))))], ["a in", "where of a", "e in", "g in", "where of g"]);
        }
        facts.length = 0;
        changed = false;
        const _t14 = (3 - (b.grid[v_e] || -1));
        if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, _t14); changed = true; } else facts.push(PLACE, v_g, _t14); }
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
  const _h20 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerBothFootprint) ?? null) : null;
  const _a18 = sp.angles;
  for (let _i19 = 0; _i19 < _a18.length; _i19++) {
    const v_a = _a18[_i19];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c25: boolean = (b.edgeCand(v_a) !== _h20);
    if (_c25) {
      let _q21 = true;
      Q22: {
        const _a23 = sp.angleEdges[v_a];
        for (let _i24 = 0; _i24 < _a23.length; _i24++) {
          const v_e = _a23[_i24];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q21 = false;
            break Q22;
          }
        }
      }
      _c25 = _q21;
    }
    if (!(_c25)) continue;
    L26: {
      const v_c = sp.angleCell[v_a];
      let _g27 = 0;
      G28: {
        const _a29 = sp.cellEdges[v_c];
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_e = _a29[_i30];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g27++;
        }
      }
      let _c35: boolean = (_g27 === 0);
      if (_c35) {
        let _g31 = 0;
        G32: {
          const _a33 = sp.cellEdges[v_c];
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_e = _a33[_i34];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g31++;
          }
        }
        _c35 = (_g31 === 2);
      }
      if (!(_c35)) break L26;
      if (import.meta.env.DEV && staleChecking) {
        let _c40: boolean = (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2)));
        if (_c40) {
          let _q36 = true;
          Q37: {
            const _a38 = sp.angleEdges[v_a];
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_e = _a38[_i39];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c40 = _q36;
        }
        let _g41 = 0;
        G42: {
          const _a43 = sp.cellEdges[v_c];
          for (let _i44 = 0; _i44 < _a43.length; _i44++) {
            const v_e = _a43[_i44];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g41++;
          }
        }
        let _c49: boolean = (_g41 === 0);
        if (_c49) {
          let _g45 = 0;
          G46: {
            const _a47 = sp.cellEdges[v_c];
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_e = _a47[_i48];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g45++;
            }
          }
          _c49 = (_g45 === 2);
        }
        freshBinding("cornerBoth", [(sp.angles.includes(v_a)), _c40, (v_c === sp.angleCell[v_a]), _c49], ["a in", "where of a", "c =", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      let _c55: boolean = ((((b.edgeCand(v_a) >> 0) & 1) !== 0) || (((b.edgeCand(v_a) >> 2) & 1) !== 0));
      if (_c55) {
        let _c54: boolean = !(!(((b.edgeCand(v_a) >> 2) & 1) !== 0));
        if (!_c54) {
          let _q50 = true;
          Q51: {
            const _a52 = sp.angleEdges[v_a];
            for (let _i53 = 0; _i53 < _a52.length; _i53++) {
              const v_e = _a52[_i53];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
              if (!(true)) {
                _q50 = false;
                break Q51;
              }
            }
          }
          _c54 = _q50;
        }
        _c55 = _c54;
      }
      let _c61: boolean = _c55;
      if (_c61) {
        let _c60: boolean = !(!(((b.edgeCand(v_a) >> 0) & 1) !== 0));
        if (!_c60) {
          let _q56 = true;
          Q57: {
            const _a58 = sp.angleEdges[v_a];
            for (let _i59 = 0; _i59 < _a58.length; _i59++) {
              const v_e = _a58[_i59];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q56 = false;
                break Q57;
              }
            }
          }
          _c60 = _q56;
        }
        _c61 = _c60;
      }
      if (!(_c61)) return -1;
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
let clueBound_f86 = new Int32Array(0);
let clueBound_l87: readonly number[] = [];
let clueBound_f116 = new Int32Array(0);
let clueBound_l117: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const clueBoundFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceAngles","angleEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueBound(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBoundBinding> | null): number {
  if (clueBound_f86.length < sp.edges.length) clueBound_f86 = new Int32Array(sp.edges.length).fill(-1);
  else clueBound_f86.fill(-1);
  clueBound_l87 = [];
  const _s88: number[] = [];
  if (clueBound_f116.length < sp.edges.length) clueBound_f116 = new Int32Array(sp.edges.length).fill(-1);
  else clueBound_f116.fill(-1);
  clueBound_l117 = [];
  const _s118: number[] = [];
  const facts = clueBoundFacts;
  let fired = 0;
  let changed = false;
  const _h79 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (clueBoundCands.length < sp.edges.length) clueBoundCands = new Int32Array(sp.edges.length);
  const cands = clueBoundCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(clueBoundFootprint) ?? null) : null;
  const _a68 = sp.faces;
  R1:
  for (let _i69 = 0; _i69 < _a68.length; _i69++) {
    const v_f = _a68[_i69];
    const _m216_0 = b.made[0];
    const _m217_2 = b.made[2];
    const _h70 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c80: boolean = (_h70 !== -1);
    if (_c80) {
      let _q71 = false;
      Q72: {
        const _a73 = sp.faceAngles[v_f];
        for (let _i74 = 0; _i74 < _a73.length; _i74++) {
          const v_a = _a73[_i74];
          let _q75 = true;
          Q76: {
            const _a77 = sp.angleEdges[v_a];
            for (let _i78 = 0; _i78 < _a77.length; _i78++) {
              const v_e = _a77[_i78];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q75 = false;
                break Q76;
              }
            }
          }
          if ((_q75 && (b.edgeCand(v_a) !== _h79))) {
            _q71 = true;
            break Q72;
          }
        }
      }
      _c80 = _q71;
    }
    if (!(_c80)) continue;
    const v_n = _h70;
    const _h112 = (v_n - 1);
    const _a81 = sp.faceEdges[v_f];
    for (let _i82 = 0; _i82 < _a81.length; _i82++) {
      const v_e = _a81[_i82];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      const v_S = minus(sp.faceEdges[v_f], setOf(v_e));
      const _h94 = v_S.length;
      const _h110 = (2 * _h94);
      const _h111 = (_h110 - v_n);
      const _h139 = (_h110 - _h112);
      let _q83 = false;
      Q84: {
        const _a85 = v_S;
        const _t95 = ((2 * _h94) - v_n);
        const _lo96 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi97 = 31 - Math.clz32(b.domain);
        for (const _e89 of clueBound_l87) clueBound_f86[_e89] = -1;
        clueBound_l87 = _a85;
        let _i91 = 0;
        _s88[0] = 0;
        let _o99 = _a85.length === 0;
        for (;;) {
          if (_a85.length === 0) {
            if (!_o99) break;
            _o99 = false;
          }
          while (_a85.length > 0 && _i91 >= 0) {
            const _e89 = _a85[_i91];
            if (_s88[_i91] > 0) clueBound_f86[_e89] = -1;
            let _r98 = (cands[_e89] >= 0 ? cands[_e89] : (cands[_e89] = b.cands[_e89])) & ~((2 << _s88[_i91]) - 1);
            let _d90 = 0;
            V93: for (; _r98 !== 0; _r98 &= _r98 - 1) {
              _d90 = 31 - Math.clz32(_r98 & -_r98);
              clueBound_f86[_e89] = _d90;
              {
                let _t100 = _d90;
                for (let _j92 = 0; _j92 < _i91; _j92++) _t100 += clueBound_f86[_a85[_j92]];
                if (_t100 + (_a85.length - _i91 - 1) * _lo96 > _t95) continue;
                if (_t100 + (_a85.length - _i91 - 1) * _hi97 < _t95) continue;
              }
              for (let _j92 = 0; _j92 < _i91; _j92++) {
                const _y101 = _a85[_j92];
                let _q102 = true;
                Q103: {
                  const _a104 = sp.faceAngles[v_f];
                  for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                    const v_a = _a104[_i105];
                    if (!(((sp.angleEdges[v_a].includes(_e89)) && (sp.angleEdges[v_a].includes(_y101))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - clueBound_f86[_e89]) - clueBound_f86[_y101])) & 1) !== 0))) {
                      _q102 = false;
                      break Q103;
                    }
                  }
                }
                if (!(_q102)) continue V93;
              }
              break;
            }
            if (_r98 === 0) {
              _s88[_i91] = 0;
              _i91--;
              continue;
            }
            _s88[_i91] = _d90;
            if (_i91 === _a85.length - 1) break;
            _i91++;
            _s88[_i91] = 0;
          }
          if (_i91 < 0) break;
          let _g106 = 0;
          G107: {
            const _a108 = v_S;
            for (let _i109 = 0; _i109 < _a108.length; _i109++) {
              const v_x = _a108[_i109];
              _g106 += clueBound_f86[v_x];
            }
          }
          if (!((_g106 === _h111))) continue;
          if (true) {
            _q83 = true;
            break Q84;
          }
        }
      }
      const v_P = _q83;
      let _q113 = false;
      Q114: {
        const _a115 = v_S;
        const _t124 = ((2 * _h94) - _h112);
        const _lo125 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi126 = 31 - Math.clz32(b.domain);
        for (const _e119 of clueBound_l117) clueBound_f116[_e119] = -1;
        clueBound_l117 = _a115;
        let _i121 = 0;
        _s118[0] = 0;
        let _o128 = _a115.length === 0;
        for (;;) {
          if (_a115.length === 0) {
            if (!_o128) break;
            _o128 = false;
          }
          while (_a115.length > 0 && _i121 >= 0) {
            const _e119 = _a115[_i121];
            if (_s118[_i121] > 0) clueBound_f116[_e119] = -1;
            let _r127 = (cands[_e119] >= 0 ? cands[_e119] : (cands[_e119] = b.cands[_e119])) & ~((2 << _s118[_i121]) - 1);
            let _d120 = 0;
            V123: for (; _r127 !== 0; _r127 &= _r127 - 1) {
              _d120 = 31 - Math.clz32(_r127 & -_r127);
              clueBound_f116[_e119] = _d120;
              {
                let _t129 = _d120;
                for (let _j122 = 0; _j122 < _i121; _j122++) _t129 += clueBound_f116[_a115[_j122]];
                if (_t129 + (_a115.length - _i121 - 1) * _lo125 > _t124) continue;
                if (_t129 + (_a115.length - _i121 - 1) * _hi126 < _t124) continue;
              }
              for (let _j122 = 0; _j122 < _i121; _j122++) {
                const _y130 = _a115[_j122];
                let _q131 = true;
                Q132: {
                  const _a133 = sp.faceAngles[v_f];
                  for (let _i134 = 0; _i134 < _a133.length; _i134++) {
                    const v_a = _a133[_i134];
                    if (!(((sp.angleEdges[v_a].includes(_e119)) && (sp.angleEdges[v_a].includes(_y130))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - clueBound_f116[_e119]) - clueBound_f116[_y130])) & 1) !== 0))) {
                      _q131 = false;
                      break Q132;
                    }
                  }
                }
                if (!(_q131)) continue V123;
              }
              break;
            }
            if (_r127 === 0) {
              _s118[_i121] = 0;
              _i121--;
              continue;
            }
            _s118[_i121] = _d120;
            if (_i121 === _a115.length - 1) break;
            _i121++;
            _s118[_i121] = 0;
          }
          if (_i121 < 0) break;
          let _g135 = 0;
          G136: {
            const _a137 = v_S;
            for (let _i138 = 0; _i138 < _a137.length; _i138++) {
              const v_x = _a137[_i138];
              _g135 += clueBound_f116[v_x];
            }
          }
          if (!((_g135 === _h139))) continue;
          if (true) {
            _q113 = true;
            break Q114;
          }
        }
      }
      L140: {
        const v_Q = _q113;
        if (!((!(v_P) || !(v_Q)))) break L140;
        if (b.made[0] !== _m216_0 || b.made[2] !== _m217_2) {
          let _c149: boolean = (clueAt(cl.number, v_f) !== -1);
          if (_c149) {
            let _q141 = false;
            Q142: {
              const _a143 = sp.faceAngles[v_f];
              for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                const v_a = _a143[_i144];
                let _q145 = true;
                Q146: {
                  const _a147 = sp.angleEdges[v_a];
                  for (let _i148 = 0; _i148 < _a147.length; _i148++) {
                    const v_e = _a147[_i148];
                    if (!(!((b.grid[v_e] !== 0)))) {
                      _q145 = false;
                      break Q146;
                    }
                  }
                }
                if ((_q145 && (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) {
                  _q141 = true;
                  break Q142;
                }
              }
            }
            _c149 = _q141;
          }
          if (!(_c149)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c158: boolean = (clueAt(cl.number, v_f) !== -1);
          if (_c158) {
            let _q150 = false;
            Q151: {
              const _a152 = sp.faceAngles[v_f];
              for (let _i153 = 0; _i153 < _a152.length; _i153++) {
                const v_a = _a152[_i153];
                let _q154 = true;
                Q155: {
                  const _a156 = sp.angleEdges[v_a];
                  for (let _i157 = 0; _i157 < _a156.length; _i157++) {
                    const v_e = _a156[_i157];
                    if (!(!((b.grid[v_e] !== 0)))) {
                      _q154 = false;
                      break Q155;
                    }
                  }
                }
                if ((_q154 && (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) {
                  _q150 = true;
                  break Q151;
                }
              }
            }
            _c158 = _q150;
          }
          let _q159 = false;
          Q160: {
            const _f162 = new Int32Array(sp.edges.length).fill(-1);
            let _l163: readonly number[] = [];
            const _s164: number[] = [];
            const _a161 = v_S;
            const _t170 = ((2 * v_S.length) - v_n);
            const _lo171 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi172 = 31 - Math.clz32(b.domain);
            for (const _e165 of _l163) _f162[_e165] = -1;
            _l163 = _a161;
            let _i167 = 0;
            _s164[0] = 0;
            let _o174 = _a161.length === 0;
            for (;;) {
              if (_a161.length === 0) {
                if (!_o174) break;
                _o174 = false;
              }
              while (_a161.length > 0 && _i167 >= 0) {
                const _e165 = _a161[_i167];
                if (_s164[_i167] > 0) _f162[_e165] = -1;
                let _r173 = (cands[_e165] >= 0 ? cands[_e165] : (cands[_e165] = b.cands[_e165])) & ~((2 << _s164[_i167]) - 1);
                let _d166 = 0;
                V169: for (; _r173 !== 0; _r173 &= _r173 - 1) {
                  _d166 = 31 - Math.clz32(_r173 & -_r173);
                  _f162[_e165] = _d166;
                  {
                    let _t175 = _d166;
                    for (let _j168 = 0; _j168 < _i167; _j168++) _t175 += _f162[_a161[_j168]];
                    if (_t175 + (_a161.length - _i167 - 1) * _lo171 > _t170) continue;
                    if (_t175 + (_a161.length - _i167 - 1) * _hi172 < _t170) continue;
                  }
                  for (let _j168 = 0; _j168 < _i167; _j168++) {
                    const _y176 = _a161[_j168];
                    let _q177 = true;
                    Q178: {
                      const _a179 = sp.faceAngles[v_f];
                      for (let _i180 = 0; _i180 < _a179.length; _i180++) {
                        const v_a = _a179[_i180];
                        if (!(((sp.angleEdges[v_a].includes(_e165)) && (sp.angleEdges[v_a].includes(_y176))))) continue;
                        if (!((((b.edgeCand(v_a) >> ((4 - _f162[_e165]) - _f162[_y176])) & 1) !== 0))) {
                          _q177 = false;
                          break Q178;
                        }
                      }
                    }
                    if (!(_q177)) continue V169;
                  }
                  break;
                }
                if (_r173 === 0) {
                  _s164[_i167] = 0;
                  _i167--;
                  continue;
                }
                _s164[_i167] = _d166;
                if (_i167 === _a161.length - 1) break;
                _i167++;
                _s164[_i167] = 0;
              }
              if (_i167 < 0) break;
              let _g181 = 0;
              G182: {
                const _a183 = v_S;
                for (let _i184 = 0; _i184 < _a183.length; _i184++) {
                  const v_x = _a183[_i184];
                  _g181 += _f162[v_x];
                }
              }
              if (!((_g181 === ((2 * v_S.length) - v_n)))) continue;
              if (true) {
                _q159 = true;
                break Q160;
              }
            }
          }
          const _t185 = (v_n - 1);
          let _q186 = false;
          Q187: {
            const _f189 = new Int32Array(sp.edges.length).fill(-1);
            let _l190: readonly number[] = [];
            const _s191: number[] = [];
            const _a188 = v_S;
            const _t197 = ((2 * v_S.length) - _t185);
            const _lo198 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi199 = 31 - Math.clz32(b.domain);
            for (const _e192 of _l190) _f189[_e192] = -1;
            _l190 = _a188;
            let _i194 = 0;
            _s191[0] = 0;
            let _o201 = _a188.length === 0;
            for (;;) {
              if (_a188.length === 0) {
                if (!_o201) break;
                _o201 = false;
              }
              while (_a188.length > 0 && _i194 >= 0) {
                const _e192 = _a188[_i194];
                if (_s191[_i194] > 0) _f189[_e192] = -1;
                let _r200 = (cands[_e192] >= 0 ? cands[_e192] : (cands[_e192] = b.cands[_e192])) & ~((2 << _s191[_i194]) - 1);
                let _d193 = 0;
                V196: for (; _r200 !== 0; _r200 &= _r200 - 1) {
                  _d193 = 31 - Math.clz32(_r200 & -_r200);
                  _f189[_e192] = _d193;
                  {
                    let _t202 = _d193;
                    for (let _j195 = 0; _j195 < _i194; _j195++) _t202 += _f189[_a188[_j195]];
                    if (_t202 + (_a188.length - _i194 - 1) * _lo198 > _t197) continue;
                    if (_t202 + (_a188.length - _i194 - 1) * _hi199 < _t197) continue;
                  }
                  for (let _j195 = 0; _j195 < _i194; _j195++) {
                    const _y203 = _a188[_j195];
                    let _q204 = true;
                    Q205: {
                      const _a206 = sp.faceAngles[v_f];
                      for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                        const v_a = _a206[_i207];
                        if (!(((sp.angleEdges[v_a].includes(_e192)) && (sp.angleEdges[v_a].includes(_y203))))) continue;
                        if (!((((b.edgeCand(v_a) >> ((4 - _f189[_e192]) - _f189[_y203])) & 1) !== 0))) {
                          _q204 = false;
                          break Q205;
                        }
                      }
                    }
                    if (!(_q204)) continue V196;
                  }
                  break;
                }
                if (_r200 === 0) {
                  _s191[_i194] = 0;
                  _i194--;
                  continue;
                }
                _s191[_i194] = _d193;
                if (_i194 === _a188.length - 1) break;
                _i194++;
                _s191[_i194] = 0;
              }
              if (_i194 < 0) break;
              let _g208 = 0;
              G209: {
                const _a210 = v_S;
                for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                  const v_x = _a210[_i211];
                  _g208 += _f189[v_x];
                }
              }
              if (!((_g208 === ((2 * v_S.length) - _t185)))) continue;
              if (true) {
                _q186 = true;
                break Q187;
              }
            }
          }
          freshBinding("clueBound", [(sp.faces.includes(v_f)), _c158, (v_n === clueAt(cl.number, v_f)), (sp.faceEdges[v_f].includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_S, minus(sp.faceEdges[v_f], setOf(v_e))), (v_P === _q159), (v_Q === _q186), (!(v_P) || !(v_Q))], ["f in", "where of f", "n =", "e in", "where of e", "S =", "P =", "Q =", "where of Q"]);
        }
        facts.length = 0;
        changed = false;
        let _c213: boolean = (v_P || v_Q);
        if (_c213) {
          let _c212: boolean = !(!(v_P));
          if (!_c212) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c212 = true;
          }
          _c213 = _c212;
        }
        let _c215: boolean = _c213;
        if (_c215) {
          let _c214: boolean = !(!(v_Q));
          if (!_c214) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c214 = true;
          }
          _c215 = _c214;
        }
        if (!(_c215)) return -1;
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
let cornerFromClue_f108 = new Int32Array(0);
let cornerFromClue_l109: readonly number[] = [];
let cornerFromClue_f137 = new Int32Array(0);
let cornerFromClue_l138: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerFromClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceAngles","angleEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerFromClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CornerFromClueBinding> | null): number {
  if (cornerFromClue_f108.length < sp.edges.length) cornerFromClue_f108 = new Int32Array(sp.edges.length).fill(-1);
  else cornerFromClue_f108.fill(-1);
  cornerFromClue_l109 = [];
  const _s110: number[] = [];
  if (cornerFromClue_f137.length < sp.edges.length) cornerFromClue_f137 = new Int32Array(sp.edges.length).fill(-1);
  else cornerFromClue_f137.fill(-1);
  cornerFromClue_l138 = [];
  const _s139: number[] = [];
  const facts = cornerFromClueFacts;
  let fired = 0;
  let changed = false;
  const _h95 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (cornerFromClueCands.length < sp.edges.length) cornerFromClueCands = new Int32Array(sp.edges.length);
  const cands = cornerFromClueCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(cornerFromClueFootprint) ?? null) : null;
  const _a77 = sp.faces;
  R1:
  for (let _i78 = 0; _i78 < _a77.length; _i78++) {
    const v_f = _a77[_i78];
    const _h79 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h79 !== -1))) continue;
    const v_n = _h79;
    const _h104 = (v_n - 2);
    const _m248_0 = b.made[0];
    let _g80 = 0;
    G81: {
      const _a82 = sp.faceEdges[v_f];
      for (let _i83 = 0; _i83 < _a82.length; _i83++) {
        const v_e = _a82[_i83];
        const _h84 = (b.grid[v_e] || -1);
        if (!((_h84 === 1))) continue;
        _g80++;
      }
    }
    const v_k = (_h79 - _g80);
    let _g85 = 0;
    G86: {
      const _a87 = sp.faceEdges[v_f];
      for (let _i88 = 0; _i88 < _a87.length; _i88++) {
        const v_e = _a87[_i88];
        const _h89 = (b.grid[v_e] !== 0);
        if (!(!(_h89))) continue;
        _g85++;
      }
    }
    L90: {
      const v_o = _g85;
      const _m249_2 = b.made[2];
      let _c96: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
      if (!_c96) {
        let _q91 = false;
        Q92: {
          const _a93 = sp.faceAngles[v_f];
          for (let _i94 = 0; _i94 < _a93.length; _i94++) {
            const v_b = _a93[_i94];
            if ((b.edgeCand(v_b) !== _h95)) {
              _q91 = true;
              break Q92;
            }
          }
        }
        _c96 = _q91;
      }
      if (!(_c96)) break L90;
      const _a97 = sp.faceAngles[v_f];
      for (let _i98 = 0; _i98 < _a97.length; _i98++) {
        const v_a = _a97[_i98];
        let _q99 = true;
        Q100: {
          const _a101 = sp.angleEdges[v_a];
          for (let _i102 = 0; _i102 < _a101.length; _i102++) {
            const v_e = _a101[_i102];
            const _h103 = (b.grid[v_e] !== 0);
            if (!(!(_h103))) {
              _q99 = false;
              break Q100;
            }
          }
        }
        if (!(_q99)) continue;
        const v_S = minus(sp.faceEdges[v_f], sp.angleEdges[v_a]);
        const _h116 = v_S.length;
        const _h132 = (2 * _h116);
        const _h133 = (_h132 - _h104);
        const _h160 = (_h132 - v_n);
        let _q105 = false;
        Q106: {
          const _a107 = v_S;
          const _t117 = ((2 * _h116) - _h104);
          const _lo118 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi119 = 31 - Math.clz32(b.domain);
          for (const _e111 of cornerFromClue_l109) cornerFromClue_f108[_e111] = -1;
          cornerFromClue_l109 = _a107;
          let _i113 = 0;
          _s110[0] = 0;
          let _o121 = _a107.length === 0;
          for (;;) {
            if (_a107.length === 0) {
              if (!_o121) break;
              _o121 = false;
            }
            while (_a107.length > 0 && _i113 >= 0) {
              const _e111 = _a107[_i113];
              if (_s110[_i113] > 0) cornerFromClue_f108[_e111] = -1;
              let _r120 = (cands[_e111] >= 0 ? cands[_e111] : (cands[_e111] = b.cands[_e111])) & ~((2 << _s110[_i113]) - 1);
              let _d112 = 0;
              V115: for (; _r120 !== 0; _r120 &= _r120 - 1) {
                _d112 = 31 - Math.clz32(_r120 & -_r120);
                cornerFromClue_f108[_e111] = _d112;
                {
                  let _t122 = _d112;
                  for (let _j114 = 0; _j114 < _i113; _j114++) _t122 += cornerFromClue_f108[_a107[_j114]];
                  if (_t122 + (_a107.length - _i113 - 1) * _lo118 > _t117) continue;
                  if (_t122 + (_a107.length - _i113 - 1) * _hi119 < _t117) continue;
                }
                for (let _j114 = 0; _j114 < _i113; _j114++) {
                  const _y123 = _a107[_j114];
                  let _q124 = true;
                  Q125: {
                    const _a126 = sp.faceAngles[v_f];
                    for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                      const v_a = _a126[_i127];
                      if (!(((sp.angleEdges[v_a].includes(_e111)) && (sp.angleEdges[v_a].includes(_y123))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - cornerFromClue_f108[_e111]) - cornerFromClue_f108[_y123])) & 1) !== 0))) {
                        _q124 = false;
                        break Q125;
                      }
                    }
                  }
                  if (!(_q124)) continue V115;
                }
                break;
              }
              if (_r120 === 0) {
                _s110[_i113] = 0;
                _i113--;
                continue;
              }
              _s110[_i113] = _d112;
              if (_i113 === _a107.length - 1) break;
              _i113++;
              _s110[_i113] = 0;
            }
            if (_i113 < 0) break;
            let _g128 = 0;
            G129: {
              const _a130 = v_S;
              for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                const v_x = _a130[_i131];
                _g128 += cornerFromClue_f108[v_x];
              }
            }
            if (!((_g128 === _h133))) continue;
            if (true) {
              _q105 = true;
              break Q106;
            }
          }
        }
        const v_P = _q105;
        let _q134 = false;
        Q135: {
          const _a136 = v_S;
          const _t145 = ((2 * _h116) - v_n);
          const _lo146 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi147 = 31 - Math.clz32(b.domain);
          for (const _e140 of cornerFromClue_l138) cornerFromClue_f137[_e140] = -1;
          cornerFromClue_l138 = _a136;
          let _i142 = 0;
          _s139[0] = 0;
          let _o149 = _a136.length === 0;
          for (;;) {
            if (_a136.length === 0) {
              if (!_o149) break;
              _o149 = false;
            }
            while (_a136.length > 0 && _i142 >= 0) {
              const _e140 = _a136[_i142];
              if (_s139[_i142] > 0) cornerFromClue_f137[_e140] = -1;
              let _r148 = (cands[_e140] >= 0 ? cands[_e140] : (cands[_e140] = b.cands[_e140])) & ~((2 << _s139[_i142]) - 1);
              let _d141 = 0;
              V144: for (; _r148 !== 0; _r148 &= _r148 - 1) {
                _d141 = 31 - Math.clz32(_r148 & -_r148);
                cornerFromClue_f137[_e140] = _d141;
                {
                  let _t150 = _d141;
                  for (let _j143 = 0; _j143 < _i142; _j143++) _t150 += cornerFromClue_f137[_a136[_j143]];
                  if (_t150 + (_a136.length - _i142 - 1) * _lo146 > _t145) continue;
                  if (_t150 + (_a136.length - _i142 - 1) * _hi147 < _t145) continue;
                }
                for (let _j143 = 0; _j143 < _i142; _j143++) {
                  const _y151 = _a136[_j143];
                  let _q152 = true;
                  Q153: {
                    const _a154 = sp.faceAngles[v_f];
                    for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                      const v_a = _a154[_i155];
                      if (!(((sp.angleEdges[v_a].includes(_e140)) && (sp.angleEdges[v_a].includes(_y151))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - cornerFromClue_f137[_e140]) - cornerFromClue_f137[_y151])) & 1) !== 0))) {
                        _q152 = false;
                        break Q153;
                      }
                    }
                  }
                  if (!(_q152)) continue V144;
                }
                break;
              }
              if (_r148 === 0) {
                _s139[_i142] = 0;
                _i142--;
                continue;
              }
              _s139[_i142] = _d141;
              if (_i142 === _a136.length - 1) break;
              _i142++;
              _s139[_i142] = 0;
            }
            if (_i142 < 0) break;
            let _g156 = 0;
            G157: {
              const _a158 = v_S;
              for (let _i159 = 0; _i159 < _a158.length; _i159++) {
                const v_x = _a158[_i159];
                _g156 += cornerFromClue_f137[v_x];
              }
            }
            if (!((_g156 === _h160))) continue;
            if (true) {
              _q134 = true;
              break Q135;
            }
          }
        }
        L161: {
          const v_Q = _q134;
          if (!(((!(v_P) && (((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (!(v_Q) && (((b.edgeCand(v_a) >> 0) & 1) !== 0))))) break L161;
          if (b.made[0] !== _m248_0 || b.made[2] !== _m249_2) {
            let _g162 = 0;
            G163: {
              const _a164 = sp.faceEdges[v_f];
              for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                const v_e = _a164[_i165];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g162++;
              }
            }
            if (!((v_k === (clueAt(cl.number, v_f) - _g162)))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _g166 = 0;
            G167: {
              const _a168 = sp.faceEdges[v_f];
              for (let _i169 = 0; _i169 < _a168.length; _i169++) {
                const v_e = _a168[_i169];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g166++;
              }
            }
            if (!((v_o === _g166))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _c174: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
            if (!_c174) {
              let _q170 = false;
              Q171: {
                const _a172 = sp.faceAngles[v_f];
                for (let _i173 = 0; _i173 < _a172.length; _i173++) {
                  const v_b = _a172[_i173];
                  if ((b.edgeCand(v_b) !== ((1 << 0) | (1 << 1) | (1 << 2)))) {
                    _q170 = true;
                    break Q171;
                  }
                }
              }
              _c174 = _q170;
            }
            if (!(_c174)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g175 = 0;
            G176: {
              const _a177 = sp.faceEdges[v_f];
              for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                const v_e = _a177[_i178];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g175++;
              }
            }
            let _g179 = 0;
            G180: {
              const _a181 = sp.faceEdges[v_f];
              for (let _i182 = 0; _i182 < _a181.length; _i182++) {
                const v_e = _a181[_i182];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g179++;
              }
            }
            let _c187: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
            if (!_c187) {
              let _q183 = false;
              Q184: {
                const _a185 = sp.faceAngles[v_f];
                for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                  const v_b = _a185[_i186];
                  if ((b.edgeCand(v_b) !== ((1 << 0) | (1 << 1) | (1 << 2)))) {
                    _q183 = true;
                    break Q184;
                  }
                }
              }
              _c187 = _q183;
            }
            let _q188 = true;
            Q189: {
              const _a190 = sp.angleEdges[v_a];
              for (let _i191 = 0; _i191 < _a190.length; _i191++) {
                const v_e = _a190[_i191];
                if (!(!((b.grid[v_e] !== 0)))) {
                  _q188 = false;
                  break Q189;
                }
              }
            }
            const _t192 = (v_n - 2);
            let _q193 = false;
            Q194: {
              const _f196 = new Int32Array(sp.edges.length).fill(-1);
              let _l197: readonly number[] = [];
              const _s198: number[] = [];
              const _a195 = v_S;
              const _t204 = ((2 * v_S.length) - _t192);
              const _lo205 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi206 = 31 - Math.clz32(b.domain);
              for (const _e199 of _l197) _f196[_e199] = -1;
              _l197 = _a195;
              let _i201 = 0;
              _s198[0] = 0;
              let _o208 = _a195.length === 0;
              for (;;) {
                if (_a195.length === 0) {
                  if (!_o208) break;
                  _o208 = false;
                }
                while (_a195.length > 0 && _i201 >= 0) {
                  const _e199 = _a195[_i201];
                  if (_s198[_i201] > 0) _f196[_e199] = -1;
                  let _r207 = (cands[_e199] >= 0 ? cands[_e199] : (cands[_e199] = b.cands[_e199])) & ~((2 << _s198[_i201]) - 1);
                  let _d200 = 0;
                  V203: for (; _r207 !== 0; _r207 &= _r207 - 1) {
                    _d200 = 31 - Math.clz32(_r207 & -_r207);
                    _f196[_e199] = _d200;
                    {
                      let _t209 = _d200;
                      for (let _j202 = 0; _j202 < _i201; _j202++) _t209 += _f196[_a195[_j202]];
                      if (_t209 + (_a195.length - _i201 - 1) * _lo205 > _t204) continue;
                      if (_t209 + (_a195.length - _i201 - 1) * _hi206 < _t204) continue;
                    }
                    for (let _j202 = 0; _j202 < _i201; _j202++) {
                      const _y210 = _a195[_j202];
                      let _q211 = true;
                      Q212: {
                        const _a213 = sp.faceAngles[v_f];
                        for (let _i214 = 0; _i214 < _a213.length; _i214++) {
                          const v_a = _a213[_i214];
                          if (!(((sp.angleEdges[v_a].includes(_e199)) && (sp.angleEdges[v_a].includes(_y210))))) continue;
                          if (!((((b.edgeCand(v_a) >> ((4 - _f196[_e199]) - _f196[_y210])) & 1) !== 0))) {
                            _q211 = false;
                            break Q212;
                          }
                        }
                      }
                      if (!(_q211)) continue V203;
                    }
                    break;
                  }
                  if (_r207 === 0) {
                    _s198[_i201] = 0;
                    _i201--;
                    continue;
                  }
                  _s198[_i201] = _d200;
                  if (_i201 === _a195.length - 1) break;
                  _i201++;
                  _s198[_i201] = 0;
                }
                if (_i201 < 0) break;
                let _g215 = 0;
                G216: {
                  const _a217 = v_S;
                  for (let _i218 = 0; _i218 < _a217.length; _i218++) {
                    const v_x = _a217[_i218];
                    _g215 += _f196[v_x];
                  }
                }
                if (!((_g215 === ((2 * v_S.length) - _t192)))) continue;
                if (true) {
                  _q193 = true;
                  break Q194;
                }
              }
            }
            let _q219 = false;
            Q220: {
              const _f222 = new Int32Array(sp.edges.length).fill(-1);
              let _l223: readonly number[] = [];
              const _s224: number[] = [];
              const _a221 = v_S;
              const _t230 = ((2 * v_S.length) - v_n);
              const _lo231 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi232 = 31 - Math.clz32(b.domain);
              for (const _e225 of _l223) _f222[_e225] = -1;
              _l223 = _a221;
              let _i227 = 0;
              _s224[0] = 0;
              let _o234 = _a221.length === 0;
              for (;;) {
                if (_a221.length === 0) {
                  if (!_o234) break;
                  _o234 = false;
                }
                while (_a221.length > 0 && _i227 >= 0) {
                  const _e225 = _a221[_i227];
                  if (_s224[_i227] > 0) _f222[_e225] = -1;
                  let _r233 = (cands[_e225] >= 0 ? cands[_e225] : (cands[_e225] = b.cands[_e225])) & ~((2 << _s224[_i227]) - 1);
                  let _d226 = 0;
                  V229: for (; _r233 !== 0; _r233 &= _r233 - 1) {
                    _d226 = 31 - Math.clz32(_r233 & -_r233);
                    _f222[_e225] = _d226;
                    {
                      let _t235 = _d226;
                      for (let _j228 = 0; _j228 < _i227; _j228++) _t235 += _f222[_a221[_j228]];
                      if (_t235 + (_a221.length - _i227 - 1) * _lo231 > _t230) continue;
                      if (_t235 + (_a221.length - _i227 - 1) * _hi232 < _t230) continue;
                    }
                    for (let _j228 = 0; _j228 < _i227; _j228++) {
                      const _y236 = _a221[_j228];
                      let _q237 = true;
                      Q238: {
                        const _a239 = sp.faceAngles[v_f];
                        for (let _i240 = 0; _i240 < _a239.length; _i240++) {
                          const v_a = _a239[_i240];
                          if (!(((sp.angleEdges[v_a].includes(_e225)) && (sp.angleEdges[v_a].includes(_y236))))) continue;
                          if (!((((b.edgeCand(v_a) >> ((4 - _f222[_e225]) - _f222[_y236])) & 1) !== 0))) {
                            _q237 = false;
                            break Q238;
                          }
                        }
                      }
                      if (!(_q237)) continue V229;
                    }
                    break;
                  }
                  if (_r233 === 0) {
                    _s224[_i227] = 0;
                    _i227--;
                    continue;
                  }
                  _s224[_i227] = _d226;
                  if (_i227 === _a221.length - 1) break;
                  _i227++;
                  _s224[_i227] = 0;
                }
                if (_i227 < 0) break;
                let _g241 = 0;
                G242: {
                  const _a243 = v_S;
                  for (let _i244 = 0; _i244 < _a243.length; _i244++) {
                    const v_x = _a243[_i244];
                    _g241 += _f222[v_x];
                  }
                }
                if (!((_g241 === ((2 * v_S.length) - v_n)))) continue;
                if (true) {
                  _q219 = true;
                  break Q220;
                }
              }
            }
            freshBinding("cornerFromClue", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === clueAt(cl.number, v_f)), (v_k === (clueAt(cl.number, v_f) - _g175)), (v_o === _g179), _c187, (sp.faceAngles[v_f].includes(v_a)), _q188, sameSet(v_S, minus(sp.faceEdges[v_f], sp.angleEdges[v_a])), (v_P === _q193), (v_Q === _q219), ((!(v_P) && (((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (!(v_Q) && (((b.edgeCand(v_a) >> 0) & 1) !== 0)))], ["f in", "where of f", "n =", "k =", "o =", "where of o", "a in", "where of a", "S =", "P =", "Q =", "where of Q"]);
          }
          facts.length = 0;
          changed = false;
          let _c245: boolean = !(!(v_P));
          if (!_c245) {
            if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
            _c245 = true;
          }
          let _c247: boolean = _c245;
          if (_c247) {
            let _c246: boolean = !(!(v_Q));
            if (!_c246) {
              if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
              _c246 = true;
            }
            _c247 = _c246;
          }
          if (!(_c247)) return -1;
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
  const _a15 = sp.angles;
  R1:
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_a = _a15[_i16];
    const _m45_0 = b.made[0];
    const _m46_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c22: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
    if (_c22) {
      let _q17 = true;
      Q18: {
        const _a19 = sp.angleEdges[v_a];
        for (let _i20 = 0; _i20 < _a19.length; _i20++) {
          const v_e = _a19[_i20];
          const _h21 = (b.grid[v_e] !== 0);
          if (!(!(_h21))) {
            _q17 = false;
            break Q18;
          }
        }
      }
      _c22 = _q17;
    }
    if (!(_c22)) continue;
    const _a23 = sp.cellAngles[sp.angleCell[v_a]];
    for (let _i24 = 0; _i24 < _a23.length; _i24++) {
      const v_b = _a23[_i24];
      let _c29: boolean = (((b.edgeCand(v_b) >> 2) & 1) !== 0);
      if (_c29) {
        let _q25 = true;
        Q26: {
          const _a27 = sp.angleEdges[v_b];
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_e = _a27[_i28];
            if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
              _q25 = false;
              break Q26;
            }
          }
        }
        _c29 = _q25;
      }
      if (!(_c29)) continue;
      if (b.made[0] !== _m45_0 || b.made[2] !== _m46_2) {
        let _c34: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
        if (_c34) {
          let _q30 = true;
          Q31: {
            const _a32 = sp.angleEdges[v_a];
            for (let _i33 = 0; _i33 < _a32.length; _i33++) {
              const v_e = _a32[_i33];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q30 = false;
                break Q31;
              }
            }
          }
          _c34 = _q30;
        }
        if (!(_c34)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c39: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
        if (_c39) {
          let _q35 = true;
          Q36: {
            const _a37 = sp.angleEdges[v_a];
            for (let _i38 = 0; _i38 < _a37.length; _i38++) {
              const v_e = _a37[_i38];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q35 = false;
                break Q36;
              }
            }
          }
          _c39 = _q35;
        }
        let _c44: boolean = (((b.edgeCand(v_b) >> 2) & 1) !== 0);
        if (_c44) {
          let _q40 = true;
          Q41: {
            const _a42 = sp.angleEdges[v_b];
            for (let _i43 = 0; _i43 < _a42.length; _i43++) {
              const v_e = _a42[_i43];
              if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                _q40 = false;
                break Q41;
              }
            }
          }
          _c44 = _q40;
        }
        freshBinding("cornerAcross", [(sp.angles.includes(v_a)), _c39, (sp.cellAngles[sp.angleCell[v_a]].includes(v_b)), _c44], ["a in", "where of a", "b in", "where of b"]);
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
  const _h20 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerExitFootprint) ?? null) : null;
  const _a18 = sp.angles;
  for (let _i19 = 0; _i19 < _a18.length; _i19++) {
    const v_a = _a18[_i19];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c25: boolean = (b.edgeCand(v_a) === _h20);
    if (_c25) {
      let _q21 = true;
      Q22: {
        const _a23 = sp.angleEdges[v_a];
        for (let _i24 = 0; _i24 < _a23.length; _i24++) {
          const v_e = _a23[_i24];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q21 = false;
            break Q22;
          }
        }
      }
      _c25 = _q21;
    }
    if (!(_c25)) continue;
    L26: {
      const v_c = sp.angleCell[v_a];
      let _g27 = 0;
      G28: {
        const _a29 = sp.cellEdges[v_c];
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_e = _a29[_i30];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g27++;
        }
      }
      let _c35: boolean = (_g27 === 0);
      if (_c35) {
        let _g31 = 0;
        G32: {
          const _a33 = sp.cellEdges[v_c];
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_e = _a33[_i34];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g31++;
          }
        }
        _c35 = (_g31 === 3);
      }
      if (!(_c35)) break L26;
      if (import.meta.env.DEV && staleChecking) {
        let _c40: boolean = (b.edgeCand(v_a) === ((1 << 1)));
        if (_c40) {
          let _q36 = true;
          Q37: {
            const _a38 = sp.angleEdges[v_a];
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_e = _a38[_i39];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c40 = _q36;
        }
        let _g41 = 0;
        G42: {
          const _a43 = sp.cellEdges[v_c];
          for (let _i44 = 0; _i44 < _a43.length; _i44++) {
            const v_e = _a43[_i44];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g41++;
          }
        }
        let _c49: boolean = (_g41 === 0);
        if (_c49) {
          let _g45 = 0;
          G46: {
            const _a47 = sp.cellEdges[v_c];
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_e = _a47[_i48];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g45++;
            }
          }
          _c49 = (_g45 === 3);
        }
        freshBinding("cornerExit", [(sp.angles.includes(v_a)), _c40, (v_c === sp.angleCell[v_a]), _c49], ["a in", "where of a", "c =", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      let _q50 = true;
      Q51: {
        const _a52 = sp.cellEdges[v_c];
        for (let _i53 = 0; _i53 < _a52.length; _i53++) {
          const v_e = _a52[_i53];
          if (!((!((b.grid[v_e] !== 0)) && !(sp.angleEdges[v_a].includes(v_e))))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) {
            _q50 = false;
            break Q51;
          }
        }
      }
      if (!(_q50)) return -1;
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
  const _h31 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerOppositeExitFootprint) ?? null) : null;
  const _a29 = sp.angles;
  R1:
  for (let _i30 = 0; _i30 < _a29.length; _i30++) {
    const v_a = _a29[_i30];
    const _m100_0 = b.made[0];
    const _m101_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c37: boolean = (b.edgeCand(v_a) === _h31);
    if (_c37) {
      let _q32 = true;
      Q33: {
        const _a34 = sp.angleEdges[v_a];
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_e = _a34[_i35];
          const _h36 = (b.grid[v_e] !== 0);
          if (!(!(_h36))) {
            _q32 = false;
            break Q33;
          }
        }
      }
      _c37 = _q32;
    }
    if (!(_c37)) continue;
    L38: {
      const v_c = sp.angleCell[v_a];
      let _g39 = 0;
      G40: {
        const _a41 = sp.cellEdges[v_c];
        for (let _i42 = 0; _i42 < _a41.length; _i42++) {
          const v_e = _a41[_i42];
          const _h43 = (b.grid[v_e] || -1);
          if (!((_h43 === 1))) continue;
          _g39++;
        }
      }
      let _c49: boolean = (_g39 === 0);
      if (_c49) {
        let _g44 = 0;
        G45: {
          const _a46 = sp.cellEdges[v_c];
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_e = _a46[_i47];
            const _h48 = (b.grid[v_e] !== 0);
            if (!(!(_h48))) continue;
            _g44++;
          }
        }
        _c49 = (_g44 === 4);
      }
      if (!(_c49)) break L38;
      const _a50 = sp.cellAngles[v_c];
      for (let _i51 = 0; _i51 < _a50.length; _i51++) {
        const v_b = _a50[_i51];
        let _q52 = true;
        Q53: {
          const _a54 = sp.angleEdges[v_b];
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_e = _a54[_i55];
            const _h56 = (b.grid[v_e] !== 0);
            if (!(!(_h56))) {
              _q52 = false;
              break Q53;
            }
          }
        }
        let _c61: boolean = (_q52 && (b.edgeCand(v_b) !== _h31));
        if (_c61) {
          let _q57 = true;
          Q58: {
            const _a59 = sp.angleEdges[v_b];
            for (let _i60 = 0; _i60 < _a59.length; _i60++) {
              const v_e = _a59[_i60];
              if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                _q57 = false;
                break Q58;
              }
            }
          }
          _c61 = _q57;
        }
        if (!(_c61)) continue;
        if (b.made[0] !== _m100_0 || b.made[2] !== _m101_2) {
          let _c66: boolean = (b.edgeCand(v_a) === ((1 << 1)));
          if (_c66) {
            let _q62 = true;
            Q63: {
              const _a64 = sp.angleEdges[v_a];
              for (let _i65 = 0; _i65 < _a64.length; _i65++) {
                const v_e = _a64[_i65];
                if (!(!((b.grid[v_e] !== 0)))) {
                  _q62 = false;
                  break Q63;
                }
              }
            }
            _c66 = _q62;
          }
          if (!(_c66)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
          let _g67 = 0;
          G68: {
            const _a69 = sp.cellEdges[v_c];
            for (let _i70 = 0; _i70 < _a69.length; _i70++) {
              const v_e = _a69[_i70];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g67++;
            }
          }
          let _c75: boolean = (_g67 === 0);
          if (_c75) {
            let _g71 = 0;
            G72: {
              const _a73 = sp.cellEdges[v_c];
              for (let _i74 = 0; _i74 < _a73.length; _i74++) {
                const v_e = _a73[_i74];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g71++;
              }
            }
            _c75 = (_g71 === 4);
          }
          if (!(_c75)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c80: boolean = (b.edgeCand(v_a) === ((1 << 1)));
          if (_c80) {
            let _q76 = true;
            Q77: {
              const _a78 = sp.angleEdges[v_a];
              for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                const v_e = _a78[_i79];
                if (!(!((b.grid[v_e] !== 0)))) {
                  _q76 = false;
                  break Q77;
                }
              }
            }
            _c80 = _q76;
          }
          let _g81 = 0;
          G82: {
            const _a83 = sp.cellEdges[v_c];
            for (let _i84 = 0; _i84 < _a83.length; _i84++) {
              const v_e = _a83[_i84];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g81++;
            }
          }
          let _c89: boolean = (_g81 === 0);
          if (_c89) {
            let _g85 = 0;
            G86: {
              const _a87 = sp.cellEdges[v_c];
              for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                const v_e = _a87[_i88];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g85++;
              }
            }
            _c89 = (_g85 === 4);
          }
          let _q90 = true;
          Q91: {
            const _a92 = sp.angleEdges[v_b];
            for (let _i93 = 0; _i93 < _a92.length; _i93++) {
              const v_e = _a92[_i93];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q90 = false;
                break Q91;
              }
            }
          }
          let _c98: boolean = (_q90 && (b.edgeCand(v_b) !== ((1 << 1))));
          if (_c98) {
            let _q94 = true;
            Q95: {
              const _a96 = sp.angleEdges[v_b];
              for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                const v_e = _a96[_i97];
                if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                  _q94 = false;
                  break Q95;
                }
              }
            }
            _c98 = _q94;
          }
          freshBinding("cornerOppositeExit", [(sp.angles.includes(v_a)), _c80, (v_c === sp.angleCell[v_a]), _c89, (sp.cellAngles[v_c].includes(v_b)), _c98], ["a in", "where of a", "c =", "where of c", "b in", "where of b"]);
        }
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_b) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 0); changed = true; } else facts.push(STRIKE_EDGE, v_b, 0); }
        let _c99: boolean = true;
        if (_c99) {
          if ((b.edgeCand(v_b) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 2); changed = true; } else facts.push(STRIKE_EDGE, v_b, 2); }
          _c99 = true;
        }
        if (!(_c99)) return -1;
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
  const _h41 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(matchingPairFootprint) ?? null) : null;
  const _a20 = sp.faces;
  R1:
  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
    const v_f = _a20[_i21];
    const _h22 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h22 !== -1))) continue;
    const _m65_0 = b.made[0];
    let _q23 = false;
    Q24: {
      const _a25 = sp.faceEdges[v_f];
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_e = _a25[_i26];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q23 = true;
          break Q24;
        }
      }
    }
    if (!(_q23)) continue;
    let _g27 = 0;
    G28: {
      const _a29 = sp.faceEdges[v_f];
      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
        const v_e = _a29[_i30];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g27++;
      }
    }
    const v_n = (_h22 - _g27);
    const _h58 = (v_n === 1);
    const _h61 = (v_n !== 1);
    let _g31 = 0;
    G32: {
      const _a33 = sp.faceEdges[v_f];
      for (let _i34 = 0; _i34 < _a33.length; _i34++) {
        const v_e = _a33[_i34];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g31++;
      }
    }
    L35: {
      const v_o = _g31;
      if (!(((v_n === 1) || ((v_o - v_n) === 1)))) break L35;
      const _a36 = sp.faceEdges[v_f];
      R2:
      for (let _i37 = 0; _i37 < _a36.length; _i37++) {
        const v_e = _a36[_i37];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        const _h40 = _i37;
        const _a38 = sp.faceEdges[v_f];
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_g = _a38[_i39];
          if (!(((!((b.grid[v_g] !== 0)) && (_i39 > _h40)) && (b.pairOf(v_e, v_g) === _h41)))) continue;
          if (b.made[0] !== _m65_0) {
            let _g42 = 0;
            G43: {
              const _a44 = sp.faceEdges[v_f];
              for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                const v_e = _a44[_i45];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g42++;
              }
            }
            if (!((v_n === (clueAt(cl.number, v_f) - _g42)))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _g46 = 0;
            G47: {
              const _a48 = sp.faceEdges[v_f];
              for (let _i49 = 0; _i49 < _a48.length; _i49++) {
                const v_e = _a48[_i49];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g46++;
              }
            }
            if (!((v_o === _g46))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            if (!(!((b.grid[v_e] !== 0)))) { if (_visit !== null) _visit[v_f] = 1; continue R2; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g50 = 0;
            G51: {
              const _a52 = sp.faceEdges[v_f];
              for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                const v_e = _a52[_i53];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g50++;
              }
            }
            let _g54 = 0;
            G55: {
              const _a56 = sp.faceEdges[v_f];
              for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                const v_e = _a56[_i57];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g54++;
              }
            }
            freshBinding("matchingPair", [(sp.faces.includes(v_f)), (clueAt(cl.number, v_f) !== -1), (v_n === (clueAt(cl.number, v_f) - _g50)), (v_o === _g54), ((v_n === 1) || ((v_o - v_n) === 1)), (sp.faceEdges[v_f].includes(v_e)), !((b.grid[v_e] !== 0)), (sp.faceEdges[v_f].includes(v_g)), ((!((b.grid[v_g] !== 0)) && (_i39 > _i37)) && (b.pairOf(v_e, v_g) === ((1 << 1))))], ["f in", "where of f", "n =", "o =", "where of o", "e in", "where of e", "g in", "where of g"]);
          }
          facts.length = 0;
          changed = false;
          let _c60: boolean = !(_h58);
          if (!_c60) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            let _c59: boolean = true;
            if (_c59) {
              if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 2); changed = true; } else facts.push(PLACE, v_g, 2); }
              _c59 = true;
            }
            _c60 = _c59;
          }
          let _c64: boolean = _c60;
          if (_c64) {
            let _c63: boolean = !(_h61);
            if (!_c63) {
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              let _c62: boolean = true;
              if (_c62) {
                if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
                _c62 = true;
              }
              _c63 = _c62;
            }
            _c64 = _c63;
          }
          if (!(_c64)) return -1;
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
  const _g25: number[] = [];
  const facts = pairAtClueFacts;
  let fired = 0;
  let changed = false;
  const _h35 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtClueFootprint) ?? null) : null;
  const _a16 = sp.faces;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_f = _a16[_i17];
    const _h18 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c24: boolean = (_h18 !== -1);
    if (_c24) {
      let _g19 = 0;
      G20: {
        const _a21 = sp.faceEdges[v_f];
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_e = _a21[_i22];
          const _h23 = (b.grid[v_e] || -1);
          if (!((_h23 === 1))) continue;
          _g19++;
        }
      }
      _c24 = ((_h18 - _g19) >= 0);
    }
    if (!(_c24)) continue;
    _g25.length = 0;
    G26: {
      const _a29 = sp.faceEdges[v_f];
      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
        const v_e = _a29[_i30];
        const _h31 = (b.grid[v_e] !== 0);
        if (!(!(_h31))) continue;
        _g25.push(v_e);
      }
    }
    L32: {
      const v_O = _g25;
      const _h33 = v_O.length;
      if (!((_h33 === 2))) break L32;
      const v_e = (v_O[0] ?? -1);
      L34: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h35))) break L34;
        if (import.meta.env.DEV && staleChecking) {
          let _c40: boolean = (clueAt(cl.number, v_f) !== -1);
          if (_c40) {
            let _g36 = 0;
            G37: {
              const _a38 = sp.faceEdges[v_f];
              for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                const v_e = _a38[_i39];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g36++;
              }
            }
            _c40 = ((clueAt(cl.number, v_f) - _g36) >= 0);
          }
          const _g41: number[] = [];
          G42: {
            const _a45 = sp.faceEdges[v_f];
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_e = _a45[_i46];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g41.push(v_e);
            }
          }
          freshBinding("pairAtClue", [(sp.faces.includes(v_f)), _c40, sameSet(v_O, _g41), (v_O.length === 2), (v_e === (v_O[0] ?? -1)), (v_g === (v_O[1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 1) | (1 << 2)))], ["f in", "where of f", "O =", "where of O", "e =", "g =", "where of g"]);
        }
        facts.length = 0;
        changed = false;
        let _g47 = 0;
        G48: {
          const _a49 = sp.faceEdges[v_f];
          for (let _i50 = 0; _i50 < _a49.length; _i50++) {
            const v_e = _a49[_i50];
            const _h51 = (b.grid[v_e] || -1);
            if (!((_h51 === 1))) continue;
            _g47++;
          }
        }
        const _t52 = (1 + ((_h18 - _g47) % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t52); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t52); }
        if (!(((b.pairOf(v_e, v_g) >> _t52) & 1) !== 0)) return -1;
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
  const _g28: number[] = [];
  const _g47: number[] = [];
  const facts = parityClueFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityClueFootprint) ?? null) : null;
  const _a20 = sp.faces;
  R1:
  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
    const v_f = _a20[_i21];
    const _m66_0 = b.made[0];
    const _h22 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c27: boolean = (_h22 !== -1);
    if (_c27) {
      let _g23 = 0;
      G24: {
        const _a25 = sp.faceEdges[v_f];
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_e = _a25[_i26];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g23++;
        }
      }
      _c27 = ((_h22 - _g23) >= 0);
    }
    if (!(_c27)) continue;
    _g28.length = 0;
    G29: {
      const _a32 = sp.faceEdges[v_f];
      for (let _i33 = 0; _i33 < _a32.length; _i33++) {
        const v_e = _a32[_i33];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g28.push(v_e);
      }
    }
    L34: {
      const v_O = _g28;
      const _h35 = v_O.length;
      if (!((_h35 === 3))) break L34;
      const _a36 = v_O;
      for (let _i37 = 0; _i37 < _a36.length; _i37++) {
        const v_e = _a36[_i37];
        const _h40 = _i37;
        const _a38 = v_O;
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_g = _a38[_i39];
          if (!(((_i39 > _h40) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t41 = minus(v_O, setOf(v_e, v_g));
          const v_k = (_t41.length > 0 ? _t41[0] : -1);
          if (b.made[0] !== _m66_0) {
            let _c46: boolean = (clueAt(cl.number, v_f) !== -1);
            if (_c46) {
              let _g42 = 0;
              G43: {
                const _a44 = sp.faceEdges[v_f];
                for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                  const v_e = _a44[_i45];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g42++;
                }
              }
              _c46 = ((clueAt(cl.number, v_f) - _g42) >= 0);
            }
            if (!(_c46)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            _g47.length = 0;
            G48: {
              const _a51 = sp.faceEdges[v_f];
              for (let _i52 = 0; _i52 < _a51.length; _i52++) {
                const v_e = _a51[_i52];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g47.push(v_e);
              }
            }
            if (!(sameSet(v_O, _g47))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _c57: boolean = (clueAt(cl.number, v_f) !== -1);
            if (_c57) {
              let _g53 = 0;
              G54: {
                const _a55 = sp.faceEdges[v_f];
                for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                  const v_e = _a55[_i56];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g53++;
                }
              }
              _c57 = ((clueAt(cl.number, v_f) - _g53) >= 0);
            }
            const _g58: number[] = [];
            G59: {
              const _a62 = sp.faceEdges[v_f];
              for (let _i63 = 0; _i63 < _a62.length; _i63++) {
                const v_e = _a62[_i63];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g58.push(v_e);
              }
            }
            const _t64 = minus(v_O, setOf(v_e, v_g));
            freshBinding("parityClue", [(sp.faces.includes(v_f)), _c57, sameSet(v_O, _g58), (v_O.length === 3), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i39 > _i37) && (popcount(b.pairOf(v_e, v_g)) === 1)), (v_k === (_t64.length > 0 ? _t64[0] : -1))], ["f in", "where of f", "O =", "where of O", "e in", "g in", "where of g", "k ="]);
          }
          facts.length = 0;
          changed = false;
          const _t65 = (2 - (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
          if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t65); changed = true; } else facts.push(PLACE, v_k, _t65); }
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
  const _g29: number[] = [];
  const _g50: number[] = [];
  const facts = linkClueFacts;
  let fired = 0;
  let changed = false;
  const _h44 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkClueFootprint) ?? null) : null;
  const _a20 = sp.faces;
  R1:
  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
    const v_f = _a20[_i21];
    const _m68_0 = b.made[0];
    const _h22 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c28: boolean = (_h22 !== -1);
    if (_c28) {
      let _g23 = 0;
      G24: {
        const _a25 = sp.faceEdges[v_f];
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_e = _a25[_i26];
          const _h27 = (b.grid[v_e] || -1);
          if (!((_h27 === 1))) continue;
          _g23++;
        }
      }
      _c28 = ((_h22 - _g23) >= 0);
    }
    if (!(_c28)) continue;
    _g29.length = 0;
    G30: {
      const _a33 = sp.faceEdges[v_f];
      for (let _i34 = 0; _i34 < _a33.length; _i34++) {
        const v_e = _a33[_i34];
        const _h35 = (b.grid[v_e] !== 0);
        if (!(!(_h35))) continue;
        _g29.push(v_e);
      }
    }
    L36: {
      const v_O = _g29;
      const _h37 = v_O.length;
      if (!((_h37 === 4))) break L36;
      const _a38 = v_O;
      for (let _i39 = 0; _i39 < _a38.length; _i39++) {
        const v_e = _a38[_i39];
        const _h42 = _i39;
        const _a40 = v_O;
        for (let _i41 = 0; _i41 < _a40.length; _i41++) {
          const v_g = _a40[_i41];
          if (!(((_i41 > _h42) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L43: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h44))) break L43;
            if (b.made[0] !== _m68_0) {
              let _c49: boolean = (clueAt(cl.number, v_f) !== -1);
              if (_c49) {
                let _g45 = 0;
                G46: {
                  const _a47 = sp.faceEdges[v_f];
                  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
                    const v_e = _a47[_i48];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g45++;
                  }
                }
                _c49 = ((clueAt(cl.number, v_f) - _g45) >= 0);
              }
              if (!(_c49)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
              _g50.length = 0;
              G51: {
                const _a54 = sp.faceEdges[v_f];
                for (let _i55 = 0; _i55 < _a54.length; _i55++) {
                  const v_e = _a54[_i55];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g50.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g50))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              let _c60: boolean = (clueAt(cl.number, v_f) !== -1);
              if (_c60) {
                let _g56 = 0;
                G57: {
                  const _a58 = sp.faceEdges[v_f];
                  for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                    const v_e = _a58[_i59];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g56++;
                  }
                }
                _c60 = ((clueAt(cl.number, v_f) - _g56) >= 0);
              }
              const _g61: number[] = [];
              G62: {
                const _a65 = sp.faceEdges[v_f];
                for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                  const v_e = _a65[_i66];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g61.push(v_e);
                }
              }
              freshBinding("linkClue", [(sp.faces.includes(v_f)), _c60, sameSet(v_O, _g61), (v_O.length === 4), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i41 > _i39) && (popcount(b.pairOf(v_e, v_g)) === 1)), sameSet(v_R, minus(v_O, setOf(v_e, v_g))), (v_h === (v_R[0] ?? -1)), (v_k === (v_R[1] ?? -1)), (b.pairOf(v_h, v_k) === ((1 << 1) | (1 << 2)))], ["f in", "where of f", "O =", "where of O", "e in", "g in", "where of g", "R =", "h =", "k =", "where of k"]);
            }
            facts.length = 0;
            changed = false;
            const _t67 = (1 + (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t67); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t67); }
            if (!(((b.pairOf(v_h, v_k) >> _t67) & 1) !== 0)) return -1;
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
  const _h11 = ((1 << 1));
  const _h19 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairFromCornerFootprint) ?? null) : null;
  const _a9 = sp.angles;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_a = _a9[_i10];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c17: boolean = (b.edgeCand(v_a) === _h11);
    if (_c17) {
      let _q12 = true;
      Q13: {
        const _a14 = sp.angleEdges[v_a];
        for (let _i15 = 0; _i15 < _a14.length; _i15++) {
          const v_e = _a14[_i15];
          const _h16 = (b.grid[v_e] !== 0);
          if (!(!(_h16))) {
            _q12 = false;
            break Q13;
          }
        }
      }
      _c17 = _q12;
    }
    if (!(_c17)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L18: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h19))) break L18;
      if (import.meta.env.DEV && staleChecking) {
        let _c24: boolean = (b.edgeCand(v_a) === ((1 << 1)));
        if (_c24) {
          let _q20 = true;
          Q21: {
            const _a22 = sp.angleEdges[v_a];
            for (let _i23 = 0; _i23 < _a22.length; _i23++) {
              const v_e = _a22[_i23];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q20 = false;
                break Q21;
              }
            }
          }
          _c24 = _q20;
        }
        freshBinding("pairFromCorner", [(sp.angles.includes(v_a)), _c24, (v_e === (sp.angleEdges[v_a][0] ?? -1)), (v_g === (sp.angleEdges[v_a][1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 1) | (1 << 2)))], ["a in", "where of a", "e =", "g =", "where of g"]);
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
  const _h11 = ((1 << 1));
  const _h19 = ((1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerFromPairFootprint) ?? null) : null;
  const _a9 = sp.angles;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_a = _a9[_i10];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c17: boolean = (b.edgeCand(v_a) !== _h11);
    if (_c17) {
      let _q12 = true;
      Q13: {
        const _a14 = sp.angleEdges[v_a];
        for (let _i15 = 0; _i15 < _a14.length; _i15++) {
          const v_e = _a14[_i15];
          const _h16 = (b.grid[v_e] !== 0);
          if (!(!(_h16))) {
            _q12 = false;
            break Q13;
          }
        }
      }
      _c17 = _q12;
    }
    if (!(_c17)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L18: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h19))) break L18;
      if (import.meta.env.DEV && staleChecking) {
        let _c24: boolean = (b.edgeCand(v_a) !== ((1 << 1)));
        if (_c24) {
          let _q20 = true;
          Q21: {
            const _a22 = sp.angleEdges[v_a];
            for (let _i23 = 0; _i23 < _a22.length; _i23++) {
              const v_e = _a22[_i23];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q20 = false;
                break Q21;
              }
            }
          }
          _c24 = _q20;
        }
        freshBinding("cornerFromPair", [(sp.angles.includes(v_a)), _c24, (v_e === (sp.angleEdges[v_a][0] ?? -1)), (v_g === (sp.angleEdges[v_a][1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 2)))], ["a in", "where of a", "e =", "g =", "where of g"]);
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
      let _c25: boolean = true;
      if (_c25) {
        if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
        _c25 = true;
      }
      if (!(_c25)) return -1;
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
  const _g13: number[] = [];
  const facts = pairAtDotFacts;
  let fired = 0;
  let changed = false;
  const _h23 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtDotFootprint) ?? null) : null;
  const _a11 = sp.cells;
  for (let _i12 = 0; _i12 < _a11.length; _i12++) {
    const v_c = _a11[_i12];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g13.length = 0;
    G14: {
      const _a17 = sp.cellEdges[v_c];
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_e = _a17[_i18];
        const _h19 = (b.grid[v_e] !== 0);
        if (!(!(_h19))) continue;
        _g13.push(v_e);
      }
    }
    L20: {
      const v_O = _g13;
      const _h21 = v_O.length;
      if (!((_h21 === 2))) break L20;
      const v_e = (v_O[0] ?? -1);
      L22: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h23))) break L22;
        if (import.meta.env.DEV && staleChecking) {
          const _g24: number[] = [];
          G25: {
            const _a28 = sp.cellEdges[v_c];
            for (let _i29 = 0; _i29 < _a28.length; _i29++) {
              const v_e = _a28[_i29];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g24.push(v_e);
            }
          }
          freshBinding("pairAtDot", [(sp.cells.includes(v_c)), sameSet(v_O, _g24), (v_O.length === 2), (v_e === (v_O[0] ?? -1)), (v_g === (v_O[1] ?? -1)), (b.pairOf(v_e, v_g) === ((1 << 1) | (1 << 2)))], ["c in", "O =", "where of O", "e =", "g =", "where of g"]);
        }
        facts.length = 0;
        changed = false;
        let _g30 = 0;
        G31: {
          const _a32 = sp.cellEdges[v_c];
          for (let _i33 = 0; _i33 < _a32.length; _i33++) {
            const v_e = _a32[_i33];
            const _h34 = (b.grid[v_e] || -1);
            if (!((_h34 === 1))) continue;
            _g30++;
          }
        }
        const _t35 = (1 + (_g30 % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t35); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t35); }
        if (!(((b.pairOf(v_e, v_g) >> _t35) & 1) !== 0)) return -1;
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
  const _g17: number[] = [];
  const _g31: number[] = [];
  const facts = parityDotFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityDotFootprint) ?? null) : null;
  const _a15 = sp.cells;
  R1:
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_c = _a15[_i16];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _m45_0 = b.made[0];
    _g17.length = 0;
    G18: {
      const _a21 = sp.cellEdges[v_c];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_e = _a21[_i22];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g17.push(v_e);
      }
    }
    L23: {
      const v_O = _g17;
      const _h24 = v_O.length;
      if (!((_h24 === 3))) break L23;
      const _a25 = v_O;
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_e = _a25[_i26];
        const _h29 = _i26;
        const _a27 = v_O;
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_g = _a27[_i28];
          if (!(((_i28 > _h29) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t30 = minus(v_O, setOf(v_e, v_g));
          const v_k = (_t30.length > 0 ? _t30[0] : -1);
          if (b.made[0] !== _m45_0) {
            _g31.length = 0;
            G32: {
              const _a35 = sp.cellEdges[v_c];
              for (let _i36 = 0; _i36 < _a35.length; _i36++) {
                const v_e = _a35[_i36];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g31.push(v_e);
              }
            }
            if (!(sameSet(v_O, _g31))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g37: number[] = [];
            G38: {
              const _a41 = sp.cellEdges[v_c];
              for (let _i42 = 0; _i42 < _a41.length; _i42++) {
                const v_e = _a41[_i42];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g37.push(v_e);
              }
            }
            const _t43 = minus(v_O, setOf(v_e, v_g));
            freshBinding("parityDot", [(sp.cells.includes(v_c)), sameSet(v_O, _g37), (v_O.length === 3), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i28 > _i26) && (popcount(b.pairOf(v_e, v_g)) === 1)), (v_k === (_t43.length > 0 ? _t43[0] : -1))], ["c in", "O =", "where of O", "e in", "g in", "where of g", "k ="]);
          }
          facts.length = 0;
          changed = false;
          const _t44 = (2 - (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
          if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t44); changed = true; } else facts.push(PLACE, v_k, _t44); }
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
  const _g17: number[] = [];
  const _g33: number[] = [];
  const facts = linkDotFacts;
  let fired = 0;
  let changed = false;
  const _h32 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkDotFootprint) ?? null) : null;
  const _a15 = sp.cells;
  R1:
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_c = _a15[_i16];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _m46_0 = b.made[0];
    _g17.length = 0;
    G18: {
      const _a21 = sp.cellEdges[v_c];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_e = _a21[_i22];
        const _h23 = (b.grid[v_e] !== 0);
        if (!(!(_h23))) continue;
        _g17.push(v_e);
      }
    }
    L24: {
      const v_O = _g17;
      const _h25 = v_O.length;
      if (!((_h25 === 4))) break L24;
      const _a26 = v_O;
      for (let _i27 = 0; _i27 < _a26.length; _i27++) {
        const v_e = _a26[_i27];
        const _h30 = _i27;
        const _a28 = v_O;
        for (let _i29 = 0; _i29 < _a28.length; _i29++) {
          const v_g = _a28[_i29];
          if (!(((_i29 > _h30) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L31: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h32))) break L31;
            if (b.made[0] !== _m46_0) {
              _g33.length = 0;
              G34: {
                const _a37 = sp.cellEdges[v_c];
                for (let _i38 = 0; _i38 < _a37.length; _i38++) {
                  const v_e = _a37[_i38];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g33.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g33))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g39: number[] = [];
              G40: {
                const _a43 = sp.cellEdges[v_c];
                for (let _i44 = 0; _i44 < _a43.length; _i44++) {
                  const v_e = _a43[_i44];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g39.push(v_e);
                }
              }
              freshBinding("linkDot", [(sp.cells.includes(v_c)), sameSet(v_O, _g39), (v_O.length === 4), (v_O.includes(v_e)), (v_O.includes(v_g)), ((_i29 > _i27) && (popcount(b.pairOf(v_e, v_g)) === 1)), sameSet(v_R, minus(v_O, setOf(v_e, v_g))), (v_h === (v_R[0] ?? -1)), (v_k === (v_R[1] ?? -1)), (b.pairOf(v_h, v_k) === ((1 << 1) | (1 << 2)))], ["c in", "O =", "where of O", "e in", "g in", "where of g", "R =", "h =", "k =", "where of k"]);
            }
            facts.length = 0;
            changed = false;
            const _t45 = (1 + (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t45); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t45); }
            if (!(((b.pairOf(v_h, v_k) >> _t45) & 1) !== 0)) return -1;
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
  let _g1 = 0;
  G2: {
    const _a3 = sp.cellEdges[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_e = _a3[_i4];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const needKept = keptStore<number>();

/** `need(f)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_f: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_f] !== undefined) return _kept[v_f];
  let _g1 = 0;
  G2: {
    const _a3 = sp.faceEdges[v_f];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_e = _a3[_i4];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = (clueAt(cl.number, v_f) - _g1);
  _kept[v_f] = _made;
  return _made;
}

const dotLinesKept = keptStore<number>();

/** `dotLines(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function dotLines(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = dotLinesKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.cellEdges[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_e = _a3[_i4];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}
