// Compiled by `npm run describe` from src/games/mosaic/mosaic.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, rangeMask, sameSet, staleChecking, type Kept, within } from "../../engine/describe-runtime.ts";

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
export type LadderId = "alone" | "compared";

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
  { id: "alone", tier: 0 },
  { id: "compared", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  for (let _k168 = 0; _k168 < cl.count.at.length; _k168++) {
    const _at169 = cl.count.at[_k168];
    const _v170 = cl.count.v[_k168];
    let _g171 = 0;
    G172: {
      const _a173 = within(sp, _at169, 1);
      for (let _i174 = 0; _i174 < _a173.length; _i174++) {
        const v_d = _a173[_i174];
        const _h175 = (g[v_d] || -1);
        if (!((_h175 === 1))) continue;
        _g171++;
      }
    }
    if (!((_g171 === _v170))) return false;
  }
  return true;
}

export interface AloneBinding {
  k: number;
  c: number;
  n: number;
  r: number;
}

const aloneFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function alone(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<AloneBinding> | null): number {
  const facts = aloneFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    const _h10 = clueAt(cl.count, v_c);
    let _g11 = 0;
    G12: {
      const _a13 = within(sp, v_c, 1);
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        const v_d = _a13[_i14];
        if (!(((b.grid[v_d] || -1) === 1))) continue;
        _g11++;
      }
    }
    const v_n = (_h10 - _g11);
    let _g15 = 0;
    G16: {
      const _a17 = within(sp, v_c, 1);
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_d = _a17[_i18];
        if (!(((b.grid[v_d] || -1) !== 2))) continue;
        _g15++;
      }
    }
    L19: {
      const v_r = _g15;
      if (!((((v_n <= 0) || (v_r <= cl.count.v[v_k])) && ((v_n !== 0) || (v_r !== cl.count.v[v_k]))))) break L19;
      if (import.meta.env.DEV && staleChecking) {
        let _g20 = 0;
        G21: {
          const _a22 = within(sp, v_c, 1);
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_d = _a22[_i23];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g20++;
          }
        }
        let _g24 = 0;
        G25: {
          const _a26 = within(sp, v_c, 1);
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_d = _a26[_i27];
            if (!(((b.grid[v_d] || -1) !== 2))) continue;
            _g24++;
          }
        }
        freshBinding("alone", [(v_c === cl.count.at[v_k]), (v_n === (clueAt(cl.count, v_c) - _g20)), (v_r === _g24), (((v_n <= 0) || (v_r <= cl.count.v[v_k])) && ((v_n !== 0) || (v_r !== cl.count.v[v_k])))], ["c =", "n =", "r =", "where of r"]);
      }
      facts.length = 0;
      changed = false;
      let _c33: boolean = ((v_n >= 0) && (v_r >= cl.count.v[v_k]));
      if (_c33) {
        let _c32: boolean = !((v_n === 0));
        if (!_c32) {
          let _q28 = true;
          Q29: {
            const _a30 = within(sp, v_c, 1);
            for (let _i31 = 0; _i31 < _a30.length; _i31++) {
              const v_d = _a30[_i31];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q28 = false;
                break Q29;
              }
            }
          }
          _c32 = _q28;
        }
        _c33 = _c32;
      }
      let _c39: boolean = _c33;
      if (_c39) {
        let _c38: boolean = (v_n === 0);
        if (!_c38) {
          let _q34 = true;
          Q35: {
            const _a36 = within(sp, v_c, 1);
            for (let _i37 = 0; _i37 < _a36.length; _i37++) {
              const v_d = _a36[_i37];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
              if (!(true)) {
                _q34 = false;
                break Q35;
              }
            }
          }
          _c38 = _q34;
        }
        _c39 = _c38;
      }
      if (!(_c39)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, c: v_c, n: v_n, r: v_r }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ComparedBinding {
  k: number;
  c: number;
  b: number;
  n: number;
  by: number;
  O: readonly number[];
}

const comparedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function compared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ComparedBinding> | null): number {
  const _g96: number[] = [];
  const _g106: number[] = [];
  const _g158: number[] = [];
  const facts = comparedFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L75: {
      const v_c = cl.count.at[v_k];
      const _m35_0 = b.made[0];
      let _q76 = false;
      Q77: {
        const _a78 = within(sp, v_c, 1);
        for (let _i79 = 0; _i79 < _a78.length; _i79++) {
          const v_d = _a78[_i79];
          if (!((b.grid[v_d] !== 0))) {
            _q76 = true;
            break Q77;
          }
        }
      }
      if (!(_q76)) break L75;
      const _h112 = (v_c % sp.w);
      const _h113 = ((v_c / sp.w) | 0);
      const _a80 = within(sp, v_c, 2);
      for (let _i81 = 0; _i81 < _a80.length; _i81++) {
        const v_b = _a80[_i81];
        const _h82 = clueAt(cl.count, v_b);
        let _c87: boolean = ((v_b !== v_c) && (_h82 !== -1));
        if (_c87) {
          let _q83 = false;
          Q84: {
            const _a85 = within(sp, v_b, 1);
            for (let _i86 = 0; _i86 < _a85.length; _i86++) {
              const v_d = _a85[_i86];
              if (!((b.grid[v_d] !== 0))) {
                _q83 = true;
                break Q84;
              }
            }
          }
          _c87 = _q83;
        }
        if (!(_c87)) continue;
        const _h102 = (v_b % sp.w);
        const _h103 = ((v_b / sp.w) | 0);
        const v_n = need(b, sp, cl, v_c);
        let _g92 = 0;
        G93: {
          const _a94 = within(sp, v_b, 1);
          for (let _i95 = 0; _i95 < _a94.length; _i95++) {
            const v_d = _a94[_i95];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g92++;
          }
        }
        const v_by = (v_n - (_h82 - _g92));
        _g96.length = 0;
        G97: {
          const _a100 = within(sp, v_c, 1);
          for (let _i101 = 0; _i101 < _a100.length; _i101++) {
            const v_d = _a100[_i101];
            if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h102)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h103)) <= 1)))))) continue;
            _g96.push(v_d);
          }
        }
        L104: {
          const v_O = _g96;
          const _h105 = v_O.length;
          let _c115: boolean = (v_by >= _h105);
          if (_c115) {
            let _c114: boolean = (v_by > 0);
            if (!_c114) {
              _g106.length = 0;
              G107: {
                const _a110 = within(sp, v_b, 1);
                for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                  const v_d = _a110[_i111];
                  if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h112)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h113)) <= 1)))))) continue;
                  _g106.push(v_d);
                }
              }
              _c114 = (_g106.length > 0);
            }
            _c115 = _c114;
          }
          if (!(_c115)) break L104;
          if (b.made[0] !== _m35_0) {
            let _q116 = false;
            Q117: {
              const _a118 = within(sp, v_c, 1);
              for (let _i119 = 0; _i119 < _a118.length; _i119++) {
                const v_d = _a118[_i119];
                if (!((b.grid[v_d] !== 0))) {
                  _q116 = true;
                  break Q117;
                }
              }
            }
            if (!(_q116)) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _q120 = false;
            Q121: {
              const _a122 = within(sp, v_c, 1);
              for (let _i123 = 0; _i123 < _a122.length; _i123++) {
                const v_d = _a122[_i123];
                if (!((b.grid[v_d] !== 0))) {
                  _q120 = true;
                  break Q121;
                }
              }
            }
            let _c128: boolean = ((v_b !== v_c) && (clueAt(cl.count, v_b) !== -1));
            if (_c128) {
              let _q124 = false;
              Q125: {
                const _a126 = within(sp, v_b, 1);
                for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                  const v_d = _a126[_i127];
                  if (!((b.grid[v_d] !== 0))) {
                    _q124 = true;
                    break Q125;
                  }
                }
              }
              _c128 = _q124;
            }
            let _g129 = 0;
            G130: {
              const _a131 = within(sp, v_c, 1);
              for (let _i132 = 0; _i132 < _a131.length; _i132++) {
                const v_d = _a131[_i132];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g129++;
              }
            }
            let _g133 = 0;
            G134: {
              const _a135 = within(sp, v_b, 1);
              for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                const v_d = _a135[_i136];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g133++;
              }
            }
            const _g137: number[] = [];
            G138: {
              const _a141 = within(sp, v_c, 1);
              for (let _i142 = 0; _i142 < _a141.length; _i142++) {
                const v_d = _a141[_i142];
                if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - (v_b % sp.w))) <= 1) && (Math.abs((((v_d / sp.w) | 0) - ((v_b / sp.w) | 0))) <= 1)))))) continue;
                _g137.push(v_d);
              }
            }
            let _c150: boolean = (v_by >= v_O.length);
            if (_c150) {
              let _c149: boolean = (v_by > 0);
              if (!_c149) {
                const _g143: number[] = [];
                G144: {
                  const _a147 = within(sp, v_b, 1);
                  for (let _i148 = 0; _i148 < _a147.length; _i148++) {
                    const v_d = _a147[_i148];
                    if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - (v_c % sp.w))) <= 1) && (Math.abs((((v_d / sp.w) | 0) - ((v_c / sp.w) | 0))) <= 1)))))) continue;
                    _g143.push(v_d);
                  }
                }
                _c149 = (_g143.length > 0);
              }
              _c150 = _c149;
            }
            freshBinding("compared", [(v_c === cl.count.at[v_k]), _q120, (within(sp, v_c, 2).includes(v_b)), _c128, (v_n === (clueAt(cl.count, v_c) - _g129)), (v_by === (v_n - (clueAt(cl.count, v_b) - _g133))), sameSet(v_O, _g137), _c150], ["c =", "where of c", "b in", "where of b", "n =", "by =", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _c155: boolean = (v_by === _h105);
          if (_c155) {
            let _q151 = true;
            Q152: {
              const _a153 = v_O;
              for (let _i154 = 0; _i154 < _a153.length; _i154++) {
                const v_d = _a153[_i154];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q151 = false;
                  break Q152;
                }
              }
            }
            _c155 = _q151;
          }
          let _c167: boolean = _c155;
          if (_c167) {
            let _c166: boolean = (v_by > 0);
            if (!_c166) {
              let _q156 = true;
              Q157: {
                _g158.length = 0;
                G159: {
                  const _a162 = within(sp, v_b, 1);
                  for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                    const v_d = _a162[_i163];
                    if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h112)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h113)) <= 1)))))) continue;
                    _g158.push(v_d);
                  }
                }
                const _a164 = _g158;
                for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                  const v_d = _a164[_i165];
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q156 = false;
                    break Q157;
                  }
                }
              }
              _c166 = _q156;
            }
            _c167 = _c166;
          }
          if (!(_c167)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, c: v_c, b: v_b, n: v_n, by: v_by, O: v_O.slice() }, facts)) return 1;
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
  let _g88 = 0;
  G89: {
    const _a90 = within(sp, v_c, 1);
    for (let _i91 = 0; _i91 < _a90.length; _i91++) {
      const v_d = _a90[_i91];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g88++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g88);
  _kept[v_c] = _made;
  return _made;
}
