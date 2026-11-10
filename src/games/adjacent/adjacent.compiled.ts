// Compiled by `npm run describe` from src/games/adjacent/adjacent.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, clueAt, freshBinding, rangeMask, staleChecking } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  bar: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "adjacent" | "adjacentSet" | "latin.set" | "latin.fish" | "latin.wing";

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
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "adjacent", tier: 1 },
  { id: "adjacentSet", tier: 2 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard","Unreasonable"];

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
  Q2: for (const _u3 of sp.lines) {
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
  for (let _k7 = 0; _k7 < cl.bar.at.length; _k7++) {
    const _at8 = cl.bar.at[_k7];
    const _v9 = cl.bar.v[_k7];
    if (!(((_v9 === 1) === (Math.abs(((g[sp.edgeEnds[2 * _at8]] || -1) - (g[sp.edgeEnds[2 * _at8 + 1]] || -1))) === 1)))) return false;
  }
  return true;
}

export interface AdjacentBinding {
  L: number;
  a: number;
  b: number;
  e: number;
}

const adjacentFacts: number[] = [];
let adjacentCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function adjacent(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<AdjacentBinding> | null): number {
  const facts = adjacentFacts;
  let fired = 0;
  let changed = false;
  if (adjacentCands.length < sp.cells.length) adjacentCands = new Int32Array(sp.cells.length);
  const cands = adjacentCands;
  cands.fill(-1);
  const _a7 = sp.cols;
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_L = _a7[_i8];
    const _a9 = sp.lineCells[v_L];
    R2:
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_a = _a9[_i10];
      const _m20_0 = b.made[0];
      const _h11 = (b.grid[v_a] !== 0);
      if (!(_h11)) continue;
      const _h17 = (b.grid[v_a] || -1);
      const _a12 = sp.adj4[v_a];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_b = _a12[_i13];
        const v_e = sp.adj4Edges[v_a][_i13];
        const _h18 = clueAt(cl.bar, v_e);
        const _h19 = (_h18 === 1);
        if (b.made[0] !== _m20_0) {
          if (!((b.grid[v_a] !== 0))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("adjacent", [(sp.cols.includes(v_L)), (sp.lineCells[v_L].includes(v_a)), (b.grid[v_a] !== 0), (sp.adj4[v_a].includes(v_b)), (v_e === sp.adj4Edges[v_a][_i13])], ["L in", "a in", "where of a", "b in", "e ="]);
        }
        facts.length = 0;
        changed = false;
        let _q14 = true;
        Q15: {
          for (let _m16 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m16 !== 0; _m16 &= _m16 - 1) {
            const v_d = 31 - Math.clz32(_m16 & -_m16);
            if (!(!((_h19 === (Math.abs((_h17 - v_d)) === 1))))) continue;
            if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
            if (!(true)) {
              _q14 = false;
              break Q15;
            }
          }
        }
        if (!(_q14)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, a: v_a, b: v_b, e: v_e }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface AdjacentSetBinding {
  L: number;
  a: number;
  b: number;
  e: number;
}

const adjacentSetFacts: number[] = [];
let adjacentSetCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function adjacentSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<AdjacentSetBinding> | null): number {
  const facts = adjacentSetFacts;
  let fired = 0;
  let changed = false;
  if (adjacentSetCands.length < sp.cells.length) adjacentSetCands = new Int32Array(sp.cells.length);
  const cands = adjacentSetCands;
  cands.fill(-1);
  const _a7 = sp.cols;
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_L = _a7[_i8];
    const _a9 = sp.lineCells[v_L];
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_a = _a9[_i10];
      const _a11 = sp.adj4[v_a];
      for (let _i12 = 0; _i12 < _a11.length; _i12++) {
        const v_b = _a11[_i12];
        const v_e = sp.adj4Edges[v_a][_i12];
        const _h19 = clueAt(cl.bar, v_e);
        const _h20 = (_h19 === 1);
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("adjacentSet", [(sp.cols.includes(v_L)), (sp.lineCells[v_L].includes(v_a)), (sp.adj4[v_a].includes(v_b)), (v_e === sp.adj4Edges[v_a][_i12])], ["L in", "a in", "b in", "e ="]);
        }
        facts.length = 0;
        changed = false;
        let _q13 = true;
        Q14: {
          for (let _m15 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m15 !== 0; _m15 &= _m15 - 1) {
            const v_d = 31 - Math.clz32(_m15 & -_m15);
            let _q16 = false;
            Q17: {
              for (let _m18 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m18 !== 0; _m18 &= _m18 - 1) {
                const v_d2 = 31 - Math.clz32(_m18 & -_m18);
                if (((v_d2 !== v_d) && (_h20 === (Math.abs((v_d2 - v_d)) === 1)))) {
                  _q16 = true;
                  break Q17;
                }
              }
            }
            if (!(!(_q16))) continue;
            if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
            if (!(true)) {
              _q13 = false;
              break Q14;
            }
          }
        }
        if (!(_q13)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, a: v_a, b: v_b, e: v_e }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}
