// Compiled by `npm run describe` from src/games/mosaic/mosaic.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, rangeMask, type Kept, within } from "../../engine/describe-runtime.ts";

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
  for (let _k125 = 0; _k125 < cl.count.at.length; _k125++) {
    const _at126 = cl.count.at[_k125];
    const _v127 = cl.count.v[_k125];
    let _g128 = 0;
    G129: {
      const _a130 = within(sp, _at126, 1);
      for (let _i131 = 0; _i131 < _a130.length; _i131++) {
        const v_d = _a130[_i131];
        const _h132 = (g[v_d] || -1);
        if (!((_h132 === 1))) continue;
        _g128++;
      }
    }
    if (!((_g128 === _v127))) return false;
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
      facts.length = 0;
      changed = false;
      let _c25: boolean = ((v_n >= 0) && (v_r >= cl.count.v[v_k]));
      if (_c25) {
        let _c24: boolean = !((v_n === 0));
        if (!_c24) {
          let _q20 = true;
          Q21: {
            const _a22 = within(sp, v_c, 1);
            for (let _i23 = 0; _i23 < _a22.length; _i23++) {
              const v_d = _a22[_i23];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q20 = false;
                break Q21;
              }
            }
          }
          _c24 = _q20;
        }
        _c25 = _c24;
      }
      let _c31: boolean = _c25;
      if (_c31) {
        let _c30: boolean = (v_n === 0);
        if (!_c30) {
          let _q26 = true;
          Q27: {
            const _a28 = within(sp, v_c, 1);
            for (let _i29 = 0; _i29 < _a28.length; _i29++) {
              const v_d = _a28[_i29];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
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
      if (!(_c31)) return -1;
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
  const _g88: number[] = [];
  const _g98: number[] = [];
  const _g115: number[] = [];
  const facts = comparedFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L67: {
      const v_c = cl.count.at[v_k];
      let _q68 = false;
      Q69: {
        const _a70 = within(sp, v_c, 1);
        for (let _i71 = 0; _i71 < _a70.length; _i71++) {
          const v_d = _a70[_i71];
          if (!((b.grid[v_d] !== 0))) {
            _q68 = true;
            break Q69;
          }
        }
      }
      if (!(_q68)) break L67;
      const _h104 = (v_c % sp.w);
      const _h105 = ((v_c / sp.w) | 0);
      const _a72 = within(sp, v_c, 2);
      for (let _i73 = 0; _i73 < _a72.length; _i73++) {
        const v_b = _a72[_i73];
        const _h74 = clueAt(cl.count, v_b);
        let _c79: boolean = ((v_b !== v_c) && (_h74 !== -1));
        if (_c79) {
          let _q75 = false;
          Q76: {
            const _a77 = within(sp, v_b, 1);
            for (let _i78 = 0; _i78 < _a77.length; _i78++) {
              const v_d = _a77[_i78];
              if (!((b.grid[v_d] !== 0))) {
                _q75 = true;
                break Q76;
              }
            }
          }
          _c79 = _q75;
        }
        if (!(_c79)) continue;
        const _h94 = (v_b % sp.w);
        const _h95 = ((v_b / sp.w) | 0);
        const v_n = need(b, sp, cl, v_c);
        let _g84 = 0;
        G85: {
          const _a86 = within(sp, v_b, 1);
          for (let _i87 = 0; _i87 < _a86.length; _i87++) {
            const v_d = _a86[_i87];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g84++;
          }
        }
        const v_by = (v_n - (_h74 - _g84));
        _g88.length = 0;
        G89: {
          const _a92 = within(sp, v_c, 1);
          for (let _i93 = 0; _i93 < _a92.length; _i93++) {
            const v_d = _a92[_i93];
            if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h94)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h95)) <= 1)))))) continue;
            _g88.push(v_d);
          }
        }
        L96: {
          const v_O = _g88;
          const _h97 = v_O.length;
          let _c107: boolean = (v_by >= _h97);
          if (_c107) {
            let _c106: boolean = (v_by > 0);
            if (!_c106) {
              _g98.length = 0;
              G99: {
                const _a102 = within(sp, v_b, 1);
                for (let _i103 = 0; _i103 < _a102.length; _i103++) {
                  const v_d = _a102[_i103];
                  if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h104)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h105)) <= 1)))))) continue;
                  _g98.push(v_d);
                }
              }
              _c106 = (_g98.length > 0);
            }
            _c107 = _c106;
          }
          if (!(_c107)) break L96;
          facts.length = 0;
          changed = false;
          let _c112: boolean = (v_by === _h97);
          if (_c112) {
            let _q108 = true;
            Q109: {
              const _a110 = v_O;
              for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                const v_d = _a110[_i111];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q108 = false;
                  break Q109;
                }
              }
            }
            _c112 = _q108;
          }
          let _c124: boolean = _c112;
          if (_c124) {
            let _c123: boolean = (v_by > 0);
            if (!_c123) {
              let _q113 = true;
              Q114: {
                _g115.length = 0;
                G116: {
                  const _a119 = within(sp, v_b, 1);
                  for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                    const v_d = _a119[_i120];
                    if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h104)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h105)) <= 1)))))) continue;
                    _g115.push(v_d);
                  }
                }
                const _a121 = _g115;
                for (let _i122 = 0; _i122 < _a121.length; _i122++) {
                  const v_d = _a121[_i122];
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q113 = false;
                    break Q114;
                  }
                }
              }
              _c123 = _q113;
            }
            _c124 = _c123;
          }
          if (!(_c124)) return -1;
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
  let _g80 = 0;
  G81: {
    const _a82 = within(sp, v_c, 1);
    for (let _i83 = 0; _i83 < _a82.length; _i83++) {
      const v_d = _a82[_i83];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g80++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g80);
  _kept[v_c] = _made;
  return _made;
}
