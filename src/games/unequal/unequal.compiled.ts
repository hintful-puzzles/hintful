// Compiled by `npm run describe` from src/games/unequal/unequal.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, rangeMask } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  greater: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "sign" | "latin.set" | "latin.fish" | "latin.wing";

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
  { id: "sign", tier: 1 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Trivial","Easy","Tricky","Extreme","Recursive"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q17 = true;
  const _n21 = new Int32Array(32);
  Q18: for (const _u19 of sp.lines) {
    _n21.fill(0);
    for (const _c20 of sp.lineCells[_u19]) {
      const _t22 = (g[_c20] || -1);
      if (++_n21[_t22] > 1) {
        _q17 = false;
        break Q18;
      }
    }
  }
  if (!(_q17)) return false;
  for (let _k23 = 0; _k23 < cl.greater.at.length; _k23++) {
    const _at24 = cl.greater.at[_k23];
    const _v25 = cl.greater.v[_k23];
    if (!(((g[_v25] || -1) > (g[(sp.edgeEnds[2 * _at24] === _v25 ? sp.edgeEnds[2 * _at24 + 1] : sp.edgeEnds[2 * _at24])] || -1)))) return false;
  }
  return true;
}

export interface SignBinding {
  k: number;
  big: number;
  small: number;
}

const signFacts: number[] = [];
let signCands = new Int32Array(0);

export function sign(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SignBinding> | null): number {
  const facts = signFacts;
  let fired = 0;
  let changed = false;
  if (signCands.length < sp.cells.length) signCands = new Int32Array(sp.cells.length);
  const cands = signCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.greater.at.length; v_k++) {
    const v_big = cl.greater.v[v_k];
    const _t3 = cl.greater.at[v_k];
    const _t4 = cl.greater.v[v_k];
    const v_small = (sp.edgeEnds[2 * _t3] === _t4 ? sp.edgeEnds[2 * _t3 + 1] : sp.edgeEnds[2 * _t3]);
    facts.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      for (let _m7 = b.domain; _m7 !== 0; _m7 &= _m7 - 1) {
        const v_d = 31 - Math.clz32(_m7 & -_m7);
        let _q8 = true;
        Q9: {
          for (let _m10 = (cands[v_small] >= 0 ? cands[v_small] : (cands[v_small] = b.cand(v_small))); _m10 !== 0; _m10 &= _m10 - 1) {
            const v_d2 = 31 - Math.clz32(_m10 & -_m10);
            if (!((v_d <= v_d2))) {
              _q8 = false;
              break Q9;
            }
          }
        }
        let _c11 = !(_q8);
        if (!_c11) {
          if (b.has(v_big, v_d)) { if (fire === null) { b.strikeAt(v_big, v_d); changed = true; } else facts.push(STRIKE, v_big, v_d); }
          _c11 = true;
        }
        let _c16 = _c11;
        if (_c16) {
          let _q12 = true;
          Q13: {
            for (let _m14 = (cands[v_big] >= 0 ? cands[v_big] : (cands[v_big] = b.cand(v_big))); _m14 !== 0; _m14 &= _m14 - 1) {
              const v_d2 = 31 - Math.clz32(_m14 & -_m14);
              if (!((v_d >= v_d2))) {
                _q12 = false;
                break Q13;
              }
            }
          }
          let _c15 = !(_q12);
          if (!_c15) {
            if (b.has(v_small, v_d)) { if (fire === null) { b.strikeAt(v_small, v_d); changed = true; } else facts.push(STRIKE, v_small, v_d); }
            _c15 = true;
          }
          _c16 = _c15;
        }
        if (!(_c16)) {
          _q5 = false;
          break Q6;
        }
      }
    }
    if (!(_q5)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, big: v_big, small: v_small }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
