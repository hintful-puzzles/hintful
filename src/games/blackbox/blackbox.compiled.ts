// Compiled by `npm run describe` from src/games/blackbox/blackbox.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, ahead, beam, beamOf, clueAt, freshBinding, rangeMask, staleChecking } from "../../engine/describe-runtime.ts";

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
  let _g1 = 0;
  G2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = (g[v_c] || -1);
      if (!((_h5 === 1))) continue;
      _g1++;
    }
  }
  let _c11: boolean = (_g1 >= cl.minballs);
  if (_c11) {
    let _g6 = 0;
    G7: {
      const _a8 = sp.cells;
      for (let _i9 = 0; _i9 < _a8.length; _i9++) {
        const v_c = _a8[_i9];
        const _h10 = (g[v_c] || -1);
        if (!((_h10 === 1))) continue;
        _g6++;
      }
    }
    _c11 = (_g6 <= cl.maxballs);
  }
  if (!(_c11)) return false;
  for (let _k12 = 0; _k12 < cl.laser.at.length; _k12++) {
    const _at13 = cl.laser.at[_k12];
    const _v14 = cl.laser.v[_k12];
    if (!((beamOf(sp, g, _at13) === _v14))) return false;
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

/** Its dearest read grows with the board as n^2. */
export function ray(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RayBinding> | null): number {
  const facts = rayFacts;
  let fired = 0;
  let changed = false;
  const _h5 = ((1 << 1) | (1 << 2));
  R1:
  for (let v_k = 0; v_k < cl.laser.at.length; v_k++) {
    const v_s = cl.laser.at[v_k];
    const _h8 = clueAt(cl.laser, v_s);
    const _m10_0 = b.made[0];
    const _m11_1 = b.made[1];
    L4: {
      const v_u = ahead(sp, b, v_s);
      if (!((v_u !== -1))) break L4;
      for (let _m6 = _h5; _m6 !== 0; _m6 &= _m6 - 1) {
        const v_d = 31 - Math.clz32(_m6 & -_m6);
        L7: {
          const v_r = beam(sp, b, v_s, v_u, v_d);
          if (!(((v_r !== -1) && (v_r !== _h8)))) break L7;
          if (b.made[0] !== _m10_0 || b.made[1] !== _m11_1) {
            if (!((v_u === ahead(sp, b, v_s)))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            freshBinding("ray", [(v_s === cl.laser.at[v_k]), (v_u === ahead(sp, b, v_s)), (v_u !== -1), ((v_d === 1) || (v_d === 2)), (v_r === beam(sp, b, v_s, v_u, v_d)), ((v_r !== -1) && (v_r !== clueAt(cl.laser, v_s)))], ["s =", "u =", "where of u", "d in", "r =", "where of r"]);
          }
          facts.length = 0;
          changed = false;
          const _t9 = (3 - v_d);
          if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t9); changed = true; } else facts.push(PLACE, v_u, _t9); }
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
