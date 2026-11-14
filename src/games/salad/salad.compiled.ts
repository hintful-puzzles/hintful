// Compiled by `npm run describe` from src/games/salad/salad.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, freshBinding, rangeMask, sameSet, staleChecking } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
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

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  border: BorderSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["border"] as const;

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
  const _h21 = (cl.nums + 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  const _repeat = (cl.nums + 1);
  const _times = (sp.w - cl.nums);
  let _q1 = true;
  const _n5 = new Int32Array(32);
  Q2: for (const _u3 of sp.lines) {
    _n5.fill(0);
    for (const _c4 of sp.lineCells[_u3]) {
      const _t6 = (g[_c4] || -1);
      if (++_n5[_t6] > (_t6 === _repeat ? _times : 1)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k7 = 0; _k7 < cl.border.at.length; _k7++) {
    const _at8 = cl.border.at[_k7];
    const _v9 = cl.border.v[_k7];
    let _q10 = false;
    Q11: {
      const _a12 = sp.sight[_at8];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_c = _a12[_i13];
        const _h14 = (g[v_c] || -1);
        let _c22: boolean = (_h14 === _v9);
        if (_c22) {
          let _q15 = true;
          Q16: {
            const _a17 = sp.sight[_at8];
            const _n18 = _i13;
            for (let _i19 = 0; _i19 < _n18; _i19++) {
              const v_c2 = _a17[_i19];
              const _h20 = (g[v_c2] || -1);
              if (!((_h20 === _h21))) {
                _q15 = false;
                break Q16;
              }
            }
          }
          _c22 = _q15;
        }
        if (_c22) {
          _q10 = true;
          break Q11;
        }
      }
    }
    if (!(_q10)) return false;
  }
  for (let _k23 = 0; _k23 < cl.ball.at.length; _k23++) {
    const _at24 = cl.ball.at[_k23];
    const _v25 = cl.ball.v[_k23];
    if (!(((g[_at24] || -1) !== _v25))) return false;
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface BorderSays {
  terms: { k: number; L: readonly number[]; H: number; reach: number; stop: number; };
  marks: {  };
}

const borderFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function border(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BorderBinding, BorderSays> | null): number {
  const _g18: number[] = [];
  const _g33: number[] = [];
  const facts = borderFacts;
  let fired = 0;
  let changed = false;
  const _h17 = (sp.w - cl.nums);
  const _h26 = (cl.nums + 1);
  for (let v_k = 0; v_k < cl.border.at.length; v_k++) {
    const _h63 = cl.border.v[v_k];
    const v_L = sp.sight[cl.border.at[v_k]];
    const v_H = _h17;
    _g18.length = 0;
    G19: {
      const _a22 = v_L;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_c = _a22[_i23];
        const _h24 = (b.grid[v_c] !== 0);
        const _h25 = (b.grid[v_c] || -1);
        if (!(!((_h24 && (_h25 === _h26))))) continue;
        _g18.push(v_c);
      }
    }
    const v_f = v_L.indexOf((_g18.length > 0 ? _g18[0] : -1));
    const _h59 = (v_f < 0);
    let _g27 = 0;
    G28: {
      const _a29 = v_L;
      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
        const v_c = _a29[_i30];
        const _h31 = (b.grid[v_c] !== 0);
        const _h32 = (b.grid[v_c] || -1);
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
        if (!(!(((b.cands[v_c] >> _h26) & 1) !== 0))) continue;
        _g33.push(v_c);
      }
    }
    const v_stop = v_L.indexOf((_g33.length > 0 ? _g33[0] : -1));
    const _h65 = (v_stop >= 0);
    if (DEV && staleChecking) {
      const _g39: number[] = [];
      G40: {
        const _a43 = v_L;
        for (let _i44 = 0; _i44 < _a43.length; _i44++) {
          const v_c = _a43[_i44];
          if (!(!(((b.grid[v_c] !== 0) && ((b.grid[v_c] || -1) === (cl.nums + 1)))))) continue;
          _g39.push(v_c);
        }
      }
      let _g45 = 0;
      G46: {
        const _a47 = v_L;
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_c = _a47[_i48];
          if (!((((_i48 >= v_H) && (b.grid[v_c] !== 0)) && ((b.grid[v_c] || -1) === (cl.nums + 1))))) continue;
          _g45++;
        }
      }
      const _g49: number[] = [];
      G50: {
        const _a53 = v_L;
        for (let _i54 = 0; _i54 < _a53.length; _i54++) {
          const v_c = _a53[_i54];
          if (!(!(((b.cands[v_c] >> (cl.nums + 1)) & 1) !== 0))) continue;
          _g49.push(v_c);
        }
      }
      freshBinding("border", [sameSet(v_L, sp.sight[cl.border.at[v_k]]), (v_H === (sp.w - cl.nums)), (v_f === v_L.indexOf((_g39.length > 0 ? _g39[0] : -1))), (v_reach === (v_H - _g45)), (v_stop === v_L.indexOf((_g49.length > 0 ? _g49[0] : -1)))], ["L =", "H =", "f =", "reach =", "stop ="]);
    }
    facts.length = 0;
    changed = false;
    let _q55 = true;
    Q56: {
      const _a57 = v_L;
      for (let _i58 = 0; _i58 < _a57.length; _i58++) {
        const v_c = _a57[_i58];
        const v_i = _i58;
        let _c64: boolean = !((_h59 || (v_i <= v_f)));
        if (!_c64) {
          let _q60 = true;
          Q61: {
            for (let _m62 = b.domain; _m62 !== 0; _m62 &= _m62 - 1) {
              const v_e = 31 - Math.clz32(_m62 & -_m62);
              if (!(((v_e !== _h63) && (v_e <= cl.nums)))) continue;
              if ((((b.cands[v_c] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_e); changed = true; } else facts.push(STRIKE, v_c, v_e); }
              if (!(true)) {
                _q60 = false;
                break Q61;
              }
            }
          }
          _c64 = _q60;
        }
        let _c67: boolean = _c64;
        if (_c67) {
          let _c66: boolean = !(((_h65 && (v_i > v_stop)) || (v_i > v_reach)));
          if (!_c66) {
            if ((((b.cands[v_c] >> _h63) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, _h63); changed = true; } else facts.push(STRIKE, v_c, _h63); }
            _c66 = true;
          }
          _c67 = _c66;
        }
        if (!(_c67)) {
          _q55 = false;
          break Q56;
        }
      }
    }
    if (!(_q55)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: { k: v_k, L: v_L.slice(), H: v_H, reach: v_reach, stop: v_stop }, marks: {  } };
        if (!fire({ k: v_k, L: v_L.slice(), H: v_H, f: v_f, reach: v_reach, stop: v_stop }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}
