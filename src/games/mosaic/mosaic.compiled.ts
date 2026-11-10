// Compiled by `npm run describe` from src/games/mosaic/mosaic.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, rangeMask, sameSet, staleChecking, type Kept, within } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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
  for (let _k1 = 0; _k1 < cl.count.at.length; _k1++) {
    const _at2 = cl.count.at[_k1];
    const _v3 = cl.count.v[_k1];
    let _g4 = 0;
    G5: {
      const _a6 = within(sp, _at2, 1);
      for (let _i7 = 0; _i7 < _a6.length; _i7++) {
        const v_d = _a6[_i7];
        const _h8 = (g[v_d] || -1);
        if (!((_h8 === 1))) continue;
        _g4++;
      }
    }
    if (!((_g4 === _v3))) return false;
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
      if (DEV && staleChecking) {
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
  const _g53: number[] = [];
  const _g63: number[] = [];
  const _g115: number[] = [];
  const facts = comparedFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L36: {
      const v_c = cl.count.at[v_k];
      const _m125_0 = b.made[0];
      let _q37 = false;
      Q38: {
        const _a39 = within(sp, v_c, 1);
        for (let _i40 = 0; _i40 < _a39.length; _i40++) {
          const v_d = _a39[_i40];
          if (!((b.grid[v_d] !== 0))) {
            _q37 = true;
            break Q38;
          }
        }
      }
      if (!(_q37)) break L36;
      const _h69 = (v_c % sp.w);
      const _h70 = ((v_c / sp.w) | 0);
      const _a41 = within(sp, v_c, 2);
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_b = _a41[_i42];
        const _h43 = clueAt(cl.count, v_b);
        let _c48: boolean = ((v_b !== v_c) && (_h43 !== -1));
        if (_c48) {
          let _q44 = false;
          Q45: {
            const _a46 = within(sp, v_b, 1);
            for (let _i47 = 0; _i47 < _a46.length; _i47++) {
              const v_d = _a46[_i47];
              if (!((b.grid[v_d] !== 0))) {
                _q44 = true;
                break Q45;
              }
            }
          }
          _c48 = _q44;
        }
        if (!(_c48)) continue;
        const _h59 = (v_b % sp.w);
        const _h60 = ((v_b / sp.w) | 0);
        const v_n = need(b, sp, cl, v_c);
        let _g49 = 0;
        G50: {
          const _a51 = within(sp, v_b, 1);
          for (let _i52 = 0; _i52 < _a51.length; _i52++) {
            const v_d = _a51[_i52];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g49++;
          }
        }
        const v_by = (v_n - (_h43 - _g49));
        _g53.length = 0;
        G54: {
          const _a57 = within(sp, v_c, 1);
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_d = _a57[_i58];
            if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h59)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h60)) <= 1)))))) continue;
            _g53.push(v_d);
          }
        }
        L61: {
          const v_O = _g53;
          const _h62 = v_O.length;
          let _c72: boolean = (v_by >= _h62);
          if (_c72) {
            let _c71: boolean = (v_by > 0);
            if (!_c71) {
              _g63.length = 0;
              G64: {
                const _a67 = within(sp, v_b, 1);
                for (let _i68 = 0; _i68 < _a67.length; _i68++) {
                  const v_d = _a67[_i68];
                  if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h69)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h70)) <= 1)))))) continue;
                  _g63.push(v_d);
                }
              }
              _c71 = (_g63.length > 0);
            }
            _c72 = _c71;
          }
          if (!(_c72)) break L61;
          if (b.made[0] !== _m125_0) {
            let _q73 = false;
            Q74: {
              const _a75 = within(sp, v_c, 1);
              for (let _i76 = 0; _i76 < _a75.length; _i76++) {
                const v_d = _a75[_i76];
                if (!((b.grid[v_d] !== 0))) {
                  _q73 = true;
                  break Q74;
                }
              }
            }
            if (!(_q73)) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _q77 = false;
            Q78: {
              const _a79 = within(sp, v_c, 1);
              for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                const v_d = _a79[_i80];
                if (!((b.grid[v_d] !== 0))) {
                  _q77 = true;
                  break Q78;
                }
              }
            }
            let _c85: boolean = ((v_b !== v_c) && (clueAt(cl.count, v_b) !== -1));
            if (_c85) {
              let _q81 = false;
              Q82: {
                const _a83 = within(sp, v_b, 1);
                for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                  const v_d = _a83[_i84];
                  if (!((b.grid[v_d] !== 0))) {
                    _q81 = true;
                    break Q82;
                  }
                }
              }
              _c85 = _q81;
            }
            let _g86 = 0;
            G87: {
              const _a88 = within(sp, v_c, 1);
              for (let _i89 = 0; _i89 < _a88.length; _i89++) {
                const v_d = _a88[_i89];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g86++;
              }
            }
            let _g90 = 0;
            G91: {
              const _a92 = within(sp, v_b, 1);
              for (let _i93 = 0; _i93 < _a92.length; _i93++) {
                const v_d = _a92[_i93];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g90++;
              }
            }
            const _g94: number[] = [];
            G95: {
              const _a98 = within(sp, v_c, 1);
              for (let _i99 = 0; _i99 < _a98.length; _i99++) {
                const v_d = _a98[_i99];
                if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - (v_b % sp.w))) <= 1) && (Math.abs((((v_d / sp.w) | 0) - ((v_b / sp.w) | 0))) <= 1)))))) continue;
                _g94.push(v_d);
              }
            }
            let _c107: boolean = (v_by >= v_O.length);
            if (_c107) {
              let _c106: boolean = (v_by > 0);
              if (!_c106) {
                const _g100: number[] = [];
                G101: {
                  const _a104 = within(sp, v_b, 1);
                  for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                    const v_d = _a104[_i105];
                    if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - (v_c % sp.w))) <= 1) && (Math.abs((((v_d / sp.w) | 0) - ((v_c / sp.w) | 0))) <= 1)))))) continue;
                    _g100.push(v_d);
                  }
                }
                _c106 = (_g100.length > 0);
              }
              _c107 = _c106;
            }
            freshBinding("compared", [(v_c === cl.count.at[v_k]), _q77, (within(sp, v_c, 2).includes(v_b)), _c85, (v_n === (clueAt(cl.count, v_c) - _g86)), (v_by === (v_n - (clueAt(cl.count, v_b) - _g90))), sameSet(v_O, _g94), _c107], ["c =", "where of c", "b in", "where of b", "n =", "by =", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _c112: boolean = (v_by === _h62);
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
                    if (!((!((b.grid[v_d] !== 0)) && !(((Math.abs(((v_d % sp.w) - _h69)) <= 1) && (Math.abs((((v_d / sp.w) | 0) - _h70)) <= 1)))))) continue;
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
  let _g1 = 0;
  G2: {
    const _a3 = within(sp, v_c, 1);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_d = _a3[_i4];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g1);
  _kept[v_c] = _made;
  return _made;
}
