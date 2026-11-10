// Compiled by `npm run describe` from src/games/unequal/unequal.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, freshBinding, rangeMask, staleChecking } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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
  for (let _k7 = 0; _k7 < cl.greater.at.length; _k7++) {
    const _at8 = cl.greater.at[_k7];
    const _v9 = cl.greater.v[_k7];
    if (!(((g[_v9] || -1) > (g[(sp.edgeEnds[2 * _at8] === _v9 ? sp.edgeEnds[2 * _at8 + 1] : sp.edgeEnds[2 * _at8])] || -1)))) return false;
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

/** Its dearest read grows with the board as n. */
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
    if (DEV && staleChecking) {
      const _t5 = cl.greater.at[v_k];
      const _t6 = cl.greater.v[v_k];
      freshBinding("sign", [(v_big === cl.greater.v[v_k]), (v_small === (sp.edgeEnds[2 * _t5] === _t6 ? sp.edgeEnds[2 * _t5 + 1] : sp.edgeEnds[2 * _t5]))], ["big =", "small ="]);
    }
    facts.length = 0;
    changed = false;
    let _q7 = true;
    Q8: {
      for (let _m9 = b.domain; _m9 !== 0; _m9 &= _m9 - 1) {
        const v_d = 31 - Math.clz32(_m9 & -_m9);
        let _q10 = true;
        Q11: {
          for (let _m12 = (cands[v_small] >= 0 ? cands[v_small] : (cands[v_small] = b.cands[v_small])); _m12 !== 0; _m12 &= _m12 - 1) {
            const v_d2 = 31 - Math.clz32(_m12 & -_m12);
            if (!((v_d <= v_d2))) {
              _q10 = false;
              break Q11;
            }
          }
        }
        let _c13: boolean = !(_q10);
        if (!_c13) {
          if ((((b.cands[v_big] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_big, v_d); changed = true; } else facts.push(STRIKE, v_big, v_d); }
          _c13 = true;
        }
        let _c18: boolean = _c13;
        if (_c18) {
          let _q14 = true;
          Q15: {
            for (let _m16 = (cands[v_big] >= 0 ? cands[v_big] : (cands[v_big] = b.cands[v_big])); _m16 !== 0; _m16 &= _m16 - 1) {
              const v_d2 = 31 - Math.clz32(_m16 & -_m16);
              if (!((v_d >= v_d2))) {
                _q14 = false;
                break Q15;
              }
            }
          }
          let _c17: boolean = !(_q14);
          if (!_c17) {
            if ((((b.cands[v_small] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_small, v_d); changed = true; } else facts.push(STRIKE, v_small, v_d); }
            _c17 = true;
          }
          _c18 = _c17;
        }
        if (!(_c18)) {
          _q7 = false;
          break Q8;
        }
      }
    }
    if (!(_q7)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, big: v_big, small: v_small }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
