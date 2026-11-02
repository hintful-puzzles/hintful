// Compiled by `npm run describe` from src/games/mosaic/mosaic.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, rangeMask, within } from "../../engine/describe-runtime.ts";

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
  for (let _k126 = 0; _k126 < cl.count.at.length; _k126++) {
    const _at127 = cl.count.at[_k126];
    const _v128 = cl.count.v[_k126];
    let _g129 = 0;
    G130: {
      const _a131 = within(sp, _at127, 1);
      for (let _i132 = 0; _i132 < _a131.length; _i132++) {
        const v_d = _a131[_i132];
        if (!(((g[v_d] || -1) === 1))) continue;
        _g129++;
      }
    }
    if (!((_g129 === _v128))) return false;
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
        if (!((b.value(v_d) === 1))) continue;
        _g11++;
      }
    }
    const v_n = (_h10 - _g11);
    let _g15 = 0;
    G16: {
      const _a17 = within(sp, v_c, 1);
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_d = _a17[_i18];
        if (!((b.value(v_d) !== 2))) continue;
        _g15++;
      }
    }
    L19: {
      const v_r = _g15;
      if (!((((v_n <= 0) || (v_r <= cl.count.v[v_k])) && ((v_n !== 0) || (v_r !== cl.count.v[v_k]))))) break L19;
      facts.length = 0;
      changed = false;
      let _c25 = ((v_n >= 0) && (v_r >= cl.count.v[v_k]));
      if (_c25) {
        let _c24 = !((v_n === 0));
        if (!_c24) {
          let _q20 = true;
          Q21: {
            const _a22 = within(sp, v_c, 1);
            for (let _i23 = 0; _i23 < _a22.length; _i23++) {
              const v_d = _a22[_i23];
              if (!(!(b.known(v_d)))) continue;
              if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
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
      let _c31 = _c25;
      if (_c31) {
        let _c30 = (v_n === 0);
        if (!_c30) {
          let _q26 = true;
          Q27: {
            const _a28 = within(sp, v_c, 1);
            for (let _i29 = 0; _i29 < _a28.length; _i29++) {
              const v_d = _a28[_i29];
              if (!(!(b.known(v_d)))) continue;
              if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
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

export function compared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ComparedBinding> | null): number {
  const _g89: number[] = [];
  const _g99: number[] = [];
  const _g116: number[] = [];
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
          if (!(b.known(v_d))) {
            _q68 = true;
            break Q69;
          }
        }
      }
      if (!(_q68)) break L67;
      const _h80 = clueAt(cl.count, v_c);
      const _h105 = (v_c % sp.w);
      const _h106 = ((v_c / sp.w) | 0);
      const _a72 = within(sp, v_c, 2);
      for (let _i73 = 0; _i73 < _a72.length; _i73++) {
        const v_b = _a72[_i73];
        const _h74 = clueAt(cl.count, v_b);
        let _c79 = ((v_b !== v_c) && (_h74 !== -1));
        if (_c79) {
          let _q75 = false;
          Q76: {
            const _a77 = within(sp, v_b, 1);
            for (let _i78 = 0; _i78 < _a77.length; _i78++) {
              const v_d = _a77[_i78];
              if (!(b.known(v_d))) {
                _q75 = true;
                break Q76;
              }
            }
          }
          _c79 = _q75;
        }
        if (!(_c79)) continue;
        const _h95 = (v_b % sp.w);
        const _h96 = ((v_b / sp.w) | 0);
        let _g81 = 0;
        G82: {
          const _a83 = within(sp, v_c, 1);
          for (let _i84 = 0; _i84 < _a83.length; _i84++) {
            const v_d = _a83[_i84];
            if (!((b.value(v_d) === 1))) continue;
            _g81++;
          }
        }
        const v_n = (_h80 - _g81);
        let _g85 = 0;
        G86: {
          const _a87 = within(sp, v_b, 1);
          for (let _i88 = 0; _i88 < _a87.length; _i88++) {
            const v_d = _a87[_i88];
            if (!((b.value(v_d) === 1))) continue;
            _g85++;
          }
        }
        const v_by = (v_n - (_h74 - _g85));
        _g89.length = 0;
        G90: {
          const _a93 = within(sp, v_c, 1);
          for (let _i94 = 0; _i94 < _a93.length; _i94++) {
            const v_d = _a93[_i94];
            if (!((!(b.known(v_d)) && !(((Math.abs(((v_d % sp.w) - _h95)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h96)) <= 1)))))) continue;
            _g89.push(v_d);
          }
        }
        L97: {
          const v_O = _g89;
          const _h98 = v_O.length;
          let _c108 = (v_by >= _h98);
          if (_c108) {
            let _c107 = (v_by > 0);
            if (!_c107) {
              _g99.length = 0;
              G100: {
                const _a103 = within(sp, v_b, 1);
                for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                  const v_d = _a103[_i104];
                  if (!((!(b.known(v_d)) && !(((Math.abs(((v_d % sp.w) - _h105)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h106)) <= 1)))))) continue;
                  _g99.push(v_d);
                }
              }
              _c107 = (_g99.length > 0);
            }
            _c108 = _c107;
          }
          if (!(_c108)) break L97;
          facts.length = 0;
          changed = false;
          let _c113 = (v_by === _h98);
          if (_c113) {
            let _q109 = true;
            Q110: {
              const _a111 = v_O;
              for (let _i112 = 0; _i112 < _a111.length; _i112++) {
                const v_d = _a111[_i112];
                if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q109 = false;
                  break Q110;
                }
              }
            }
            _c113 = _q109;
          }
          let _c125 = _c113;
          if (_c125) {
            let _c124 = (v_by > 0);
            if (!_c124) {
              let _q114 = true;
              Q115: {
                _g116.length = 0;
                G117: {
                  const _a120 = within(sp, v_b, 1);
                  for (let _i121 = 0; _i121 < _a120.length; _i121++) {
                    const v_d = _a120[_i121];
                    if (!((!(b.known(v_d)) && !(((Math.abs(((v_d % sp.w) - _h105)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h106)) <= 1)))))) continue;
                    _g116.push(v_d);
                  }
                }
                const _a122 = _g116;
                for (let _i123 = 0; _i123 < _a122.length; _i123++) {
                  const v_d = _a122[_i123];
                  if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q114 = false;
                    break Q115;
                  }
                }
              }
              _c124 = _q114;
            }
            _c125 = _c124;
          }
          if (!(_c125)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, c: v_c, b: v_b, n: v_n, by: v_by, O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}
