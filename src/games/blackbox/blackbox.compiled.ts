// Compiled by `npm run describe` from src/games/blackbox/blackbox.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, ahead, beam, beamOf, clueAt, rangeMask } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  laser: ClueList;
  maxballs: number;
  minballs: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "ray";

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
  { id: "ray", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _g10 = 0;
  G11: {
    const _a12 = sp.cells;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_c = _a12[_i13];
      if (!(((g[v_c] || -1) === 1))) continue;
      _g10++;
    }
  }
  let _c18 = (_g10 >= cl.minballs);
  if (_c18) {
    let _g14 = 0;
    G15: {
      const _a16 = sp.cells;
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_c = _a16[_i17];
        if (!(((g[v_c] || -1) === 1))) continue;
        _g14++;
      }
    }
    _c18 = (_g14 <= cl.maxballs);
  }
  if (!(_c18)) return false;
  for (let _k19 = 0; _k19 < cl.laser.at.length; _k19++) {
    const _at20 = cl.laser.at[_k19];
    const _v21 = cl.laser.v[_k19];
    if (!((beamOf(sp, g, _at20) === _v21))) return false;
  }
  return true;
}

export interface RayBinding {
  k: number;
  s: number;
  u: number;
  d: number;
  r: number;
}

const rayFacts: number[] = [];

export function ray(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RayBinding> | null): number {
  const facts = rayFacts;
  let fired = 0;
  let changed = false;
  const _h5 = ((1 << 1) | (1 << 2));
  for (let v_k = 0; v_k < cl.laser.at.length; v_k++) {
    const v_s = cl.laser.at[v_k];
    const _h8 = clueAt(cl.laser, v_s);
    L4: {
      const v_u = ahead(sp, b, v_s);
      if (!((v_u !== -1))) break L4;
      for (let _m6 = _h5; _m6 !== 0; _m6 &= _m6 - 1) {
        const v_d = 31 - Math.clz32(_m6 & -_m6);
        L7: {
          const v_r = beam(sp, b, v_s, v_u, v_d);
          if (!(((v_r !== -1) && (v_r !== _h8)))) break L7;
          facts.length = 0;
          changed = false;
          const _t9 = (3 - v_d);
          if (!b.known(v_u)) { if (fire === null) { b.placeAt(v_u, _t9); changed = true; } else facts.push(PLACE, v_u, _t9); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, s: v_s, u: v_u, d: v_d, r: v_r }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}
