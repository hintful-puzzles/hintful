// Compiled by `npm run describe` from src/games/salad/salad.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, rangeMask } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its clues by kind, and
 * the sizes a technique or the rules read that the grid does not give. */
export interface Dealt {
  border: ClueList;
  ball: ClueList;
  nums: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "border" | "latin.hiddenSingle" | "latin.single" | "latin.set" | "latin.fish" | "latin.wing";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "latin.placed";

/** The techniques run as each value is placed, in the description's order. */
export const placing: readonly PlacingId[] = ["latin.placed"];

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, the cap from which it no longer runs where it has one, and the
 * variation that adds it where one does, in the order the description
 * lists them, a variation's before the first of a higher tier. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [
  { id: "border", tier: 0 },
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "latin.set", tier: 1 },
  { id: "latin.fish", tier: 1 },
  { id: "latin.wing", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, (cl.nums + 1));
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  const _repeat = (cl.nums + 1);
  const _times = (sp.w - cl.nums);
  let _q52 = true;
  const _n56 = new Int32Array(32);
  Q53: for (const _u54 of sp.lines) {
    _n56.fill(0);
    for (const _c55 of sp.lineCells[_u54]) {
      const _t57 = (g[_c55] || -1);
      if (++_n56[_t57] > (_t57 === _repeat ? _times : 1)) {
        _q52 = false;
        break Q53;
      }
    }
  }
  if (!(_q52)) return false;
  for (let _k58 = 0; _k58 < cl.border.at.length; _k58++) {
    const _at59 = cl.border.at[_k58];
    const _v60 = cl.border.v[_k58];
    let _q61 = false;
    Q62: {
      const _a63 = sp.sight[_at59];
      for (let _i64 = 0; _i64 < _a63.length; _i64++) {
        const v_c = _a63[_i64];
        let _c70 = ((g[v_c] || -1) === _v60);
        if (_c70) {
          let _q65 = true;
          Q66: {
            const _a67 = sp.sight[_at59];
            const _n68 = _i64;
            for (let _i69 = 0; _i69 < _n68; _i69++) {
              const v_c2 = _a67[_i69];
              if (!(((g[v_c2] || -1) === (cl.nums + 1)))) {
                _q65 = false;
                break Q66;
              }
            }
          }
          _c70 = _q65;
        }
        if (_c70) {
          _q61 = true;
          break Q62;
        }
      }
    }
    if (!(_q61)) return false;
  }
  for (let _k71 = 0; _k71 < cl.ball.at.length; _k71++) {
    const _at72 = cl.ball.at[_k71];
    const _v73 = cl.ball.v[_k71];
    if (!(((g[_at72] || -1) !== _v73))) return false;
  }
  return true;
}

export interface BorderBinding {
  k: number;
  L: readonly number[];
  H: number;
  f: number;
  reach: number;
  stop: number;
}

const borderFacts: number[] = [];
let borderCands = new Int32Array(0);

export function border(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BorderBinding> | null): number {
  const _g18: number[] = [];
  const _g33: number[] = [];
  const facts = borderFacts;
  let fired = 0;
  let changed = false;
  const _h17 = (sp.w - cl.nums);
  const _h26 = (cl.nums + 1);
  if (borderCands.length < sp.cells.length) borderCands = new Int32Array(sp.cells.length);
  const cands = borderCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.border.at.length; v_k++) {
    const _h47 = cl.border.v[v_k];
    const v_L = sp.sight[cl.border.at[v_k]];
    const v_H = _h17;
    _g18.length = 0;
    G19: {
      const _a22 = v_L;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_c = _a22[_i23];
        const _h24 = b.known(v_c);
        const _h25 = b.value(v_c);
        if (!(!((_h24 && (_h25 === _h26))))) continue;
        _g18.push(v_c);
      }
    }
    const v_f = v_L.indexOf((_g18.length > 0 ? _g18[0] : -1));
    const _h43 = (v_f < 0);
    let _g27 = 0;
    G28: {
      const _a29 = v_L;
      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
        const v_c = _a29[_i30];
        const _h31 = b.known(v_c);
        const _h32 = b.value(v_c);
        if (!((((_i30 >= v_H) && _h31) && (_h32 === _h26)))) continue;
        _g27++;
      }
    }
    const v_reach = (v_H - _g27);
    _g33.length = 0;
    G34: {
      const _a37 = v_L;
      for (let _i38 = 0; _i38 < _a37.length; _i38++) {
        const v_c = _a37[_i38];
        if (!(!b.has(v_c, _h26))) continue;
        _g33.push(v_c);
      }
    }
    const v_stop = v_L.indexOf((_g33.length > 0 ? _g33[0] : -1));
    const _h49 = (v_stop >= 0);
    facts.length = 0;
    changed = false;
    let _q39 = true;
    Q40: {
      const _a41 = v_L;
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_c = _a41[_i42];
        const v_i = _i42;
        let _c48 = !((_h43 || (v_i <= v_f)));
        if (!_c48) {
          let _q44 = true;
          Q45: {
            for (let _m46 = b.domain; _m46 !== 0; _m46 &= _m46 - 1) {
              const v_e = 31 - Math.clz32(_m46 & -_m46);
              if (!(((v_e !== _h47) && (v_e <= cl.nums)))) continue;
              if (b.has(v_c, v_e)) { if (fire === null) { b.strikeAt(v_c, v_e); changed = true; } else facts.push(STRIKE, v_c, v_e); }
              if (!(true)) {
                _q44 = false;
                break Q45;
              }
            }
          }
          _c48 = _q44;
        }
        let _c51 = _c48;
        if (_c51) {
          let _c50 = !(((_h49 && (v_i > v_stop)) || (v_i > v_reach)));
          if (!_c50) {
            if (b.has(v_c, _h47)) { if (fire === null) { b.strikeAt(v_c, _h47); changed = true; } else facts.push(STRIKE, v_c, _h47); }
            _c50 = true;
          }
          _c51 = _c50;
        }
        if (!(_c51)) {
          _q39 = false;
          break Q40;
        }
      }
    }
    if (!(_q39)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, L: v_L, H: v_H, f: v_f, reach: v_reach, stop: v_stop }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
