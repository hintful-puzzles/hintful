// Compiled by `npm run describe` from src/skeleton/grid/skeleton.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, minus, rangeMask, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "count" | "shared";

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
  { id: "count", tier: 0 },
  { id: "shared", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  for (let _k106 = 0; _k106 < cl.count.at.length; _k106++) {
    const _at107 = cl.count.at[_k106];
    const _v108 = cl.count.v[_k106];
    let _c114: boolean = ((g[_at107] || -1) === 2);
    if (_c114) {
      let _g109 = 0;
      G110: {
        const _a111 = sp.adj4[_at107];
        for (let _i112 = 0; _i112 < _a111.length; _i112++) {
          const v_d = _a111[_i112];
          const _h113 = (g[v_d] || -1);
          if (!((_h113 === 1))) continue;
          _g109++;
        }
      }
      _c114 = (_g109 === _v108);
    }
    if (!(_c114)) return false;
  }
  return true;
}

export interface CountBinding {
  k: number;
  c: number;
  n: number;
  O: readonly number[];
}

const countFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g17: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    const _h12 = clueAt(cl.count, v_c);
    let _g13 = 0;
    G14: {
      const _a15 = sp.adj4[v_c];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_d = _a15[_i16];
        if (!(((b.grid[v_d] || -1) === 1))) continue;
        _g13++;
      }
    }
    const v_n = (_h12 - _g13);
    _g17.length = 0;
    G18: {
      const _a21 = sp.adj4[v_c];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_d = _a21[_i22];
        const _h23 = clueAt(cl.count, v_d);
        if (!((!((b.grid[v_d] !== 0)) && (_h23 === -1)))) continue;
        _g17.push(v_d);
      }
    }
    L24: {
      const v_O = _g17;
      const _h25 = v_O.length;
      if (!(((_h25 > 0) && ((v_n <= 0) || (v_n >= _h25))))) break L24;
      facts.length = 0;
      changed = false;
      let _c31: boolean = ((v_n >= 0) && (v_n <= _h25));
      if (_c31) {
        let _c30: boolean = !((v_n === 0));
        if (!_c30) {
          let _q26 = true;
          Q27: {
            const _a28 = v_O;
            for (let _i29 = 0; _i29 < _a28.length; _i29++) {
              const v_d = _a28[_i29];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q26 = false;
                break Q27;
              }
            }
          }
          _c30 = _q26;
        }
        _c31 = _c30;
      }
      let _c37: boolean = _c31;
      if (_c37) {
        let _c36: boolean = (v_n === 0);
        if (!_c36) {
          let _q32 = true;
          Q33: {
            const _a34 = v_O;
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_d = _a34[_i35];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
              if (!(true)) {
                _q32 = false;
                break Q33;
              }
            }
          }
          _c36 = _q32;
        }
        _c37 = _c36;
      }
      if (!(_c37)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, c: v_c, n: v_n, O: v_O.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SharedBinding {
  k: number;
  c: number;
  O: readonly number[];
  b: number;
  M: readonly number[];
  by: number;
  R: readonly number[];
}

const sharedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function shared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedBinding> | null): number {
  const _g63: number[] = [];
  const _g75: number[] = [];
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    _g63.length = 0;
    G64: {
      const _a67 = sp.adj4[v_c];
      for (let _i68 = 0; _i68 < _a67.length; _i68++) {
        const v_d = _a67[_i68];
        const _h69 = clueAt(cl.count, v_d);
        if (!((!((b.grid[v_d] !== 0)) && (_h69 === -1)))) continue;
        _g63.push(v_d);
      }
    }
    L70: {
      const v_O = _g63;
      const _h71 = v_O.length;
      if (!((_h71 >= 2))) break L70;
      const _a72 = within(sp, v_c, 2);
      for (let _i73 = 0; _i73 < _a72.length; _i73++) {
        const v_b = _a72[_i73];
        const _h74 = clueAt(cl.count, v_b);
        if (!(((v_b !== v_c) && (_h74 !== -1)))) continue;
        _g75.length = 0;
        G76: {
          const _a79 = sp.adj4[v_b];
          for (let _i80 = 0; _i80 < _a79.length; _i80++) {
            const v_d = _a79[_i80];
            const _h81 = clueAt(cl.count, v_d);
            if (!((!((b.grid[v_d] !== 0)) && (_h81 === -1)))) continue;
            _g75.push(v_d);
          }
        }
        L82: {
          const v_M = _g75;
          const _h83 = v_M.length;
          if (!((((_h83 > 0) && (_h83 < _h71)) && subsetOf(v_M, v_O)))) break L82;
          let _g88 = 0;
          G89: {
            const _a90 = sp.adj4[v_b];
            for (let _i91 = 0; _i91 < _a90.length; _i91++) {
              const v_d = _a90[_i91];
              if (!(((b.grid[v_d] || -1) === 1))) continue;
              _g88++;
            }
          }
          const v_by = (need(b, sp, cl, v_c) - (_h74 - _g88));
          L92: {
            const v_R = minus(v_O, v_M);
            const _h93 = v_R.length;
            if (!(((v_by <= 0) || (v_by >= _h93)))) break L92;
            facts.length = 0;
            changed = false;
            let _c99: boolean = ((v_by >= 0) && (v_by <= _h93));
            if (_c99) {
              let _c98: boolean = !((v_by === 0));
              if (!_c98) {
                let _q94 = true;
                Q95: {
                  const _a96 = v_R;
                  for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                    const v_d = _a96[_i97];
                    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                    if (!(true)) {
                      _q94 = false;
                      break Q95;
                    }
                  }
                }
                _c98 = _q94;
              }
              _c99 = _c98;
            }
            let _c105: boolean = _c99;
            if (_c105) {
              let _c104: boolean = (v_by === 0);
              if (!_c104) {
                let _q100 = true;
                Q101: {
                  const _a102 = v_R;
                  for (let _i103 = 0; _i103 < _a102.length; _i103++) {
                    const v_d = _a102[_i103];
                    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                    if (!(true)) {
                      _q100 = false;
                      break Q101;
                    }
                  }
                }
                _c104 = _q100;
              }
              _c105 = _c104;
            }
            if (!(_c105)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ k: v_k, c: v_c, O: v_O.slice(), b: v_b, M: v_M.slice(), by: v_by, R: v_R.slice() }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

const needKept = keptStore<number>();

/** `need(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g84 = 0;
  G85: {
    const _a86 = sp.adj4[v_c];
    for (let _i87 = 0; _i87 < _a86.length; _i87++) {
      const v_d = _a86[_i87];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g84++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g84);
  _kept[v_c] = _made;
  return _made;
}
