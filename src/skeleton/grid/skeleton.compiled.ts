// Compiled by `npm run describe` from src/skeleton/grid/skeleton.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, minus, rangeMask, sameSet, staleChecking, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

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
  for (let _k1 = 0; _k1 < cl.count.at.length; _k1++) {
    const _at2 = cl.count.at[_k1];
    const _v3 = cl.count.v[_k1];
    let _c9: boolean = ((g[_at2] || -1) === 2);
    if (_c9) {
      let _g4 = 0;
      G5: {
        const _a6 = sp.adj4[_at2];
        for (let _i7 = 0; _i7 < _a6.length; _i7++) {
          const v_d = _a6[_i7];
          const _h8 = (g[v_d] || -1);
          if (!((_h8 === 1))) continue;
          _g4++;
        }
      }
      _c9 = (_g4 === _v3);
    }
    if (!(_c9)) return false;
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
      if (import.meta.env.DEV && staleChecking) {
        let _g26 = 0;
        G27: {
          const _a28 = sp.adj4[v_c];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_d = _a28[_i29];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g26++;
          }
        }
        const _g30: number[] = [];
        G31: {
          const _a34 = sp.adj4[v_c];
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_d = _a34[_i35];
            if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
            _g30.push(v_d);
          }
        }
        freshBinding("count", [(v_c === cl.count.at[v_k]), (v_n === (clueAt(cl.count, v_c) - _g26)), sameSet(v_O, _g30), ((v_O.length > 0) && ((v_n <= 0) || (v_n >= v_O.length)))], ["c =", "n =", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c41: boolean = ((v_n >= 0) && (v_n <= _h25));
      if (_c41) {
        let _c40: boolean = !((v_n === 0));
        if (!_c40) {
          let _q36 = true;
          Q37: {
            const _a38 = v_O;
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_d = _a38[_i39];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c40 = _q36;
        }
        _c41 = _c40;
      }
      let _c47: boolean = _c41;
      if (_c47) {
        let _c46: boolean = (v_n === 0);
        if (!_c46) {
          let _q42 = true;
          Q43: {
            const _a44 = v_O;
            for (let _i45 = 0; _i45 < _a44.length; _i45++) {
              const v_d = _a44[_i45];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
              if (!(true)) {
                _q42 = false;
                break Q43;
              }
            }
          }
          _c46 = _q42;
        }
        _c47 = _c46;
      }
      if (!(_c47)) return -1;
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
  const _g26: number[] = [];
  const _g38: number[] = [];
  const _g53: number[] = [];
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    const _m91_0 = b.made[0];
    _g26.length = 0;
    G27: {
      const _a30 = sp.adj4[v_c];
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_d = _a30[_i31];
        const _h32 = clueAt(cl.count, v_d);
        if (!((!((b.grid[v_d] !== 0)) && (_h32 === -1)))) continue;
        _g26.push(v_d);
      }
    }
    L33: {
      const v_O = _g26;
      const _h34 = v_O.length;
      if (!((_h34 >= 2))) break L33;
      const _a35 = within(sp, v_c, 2);
      for (let _i36 = 0; _i36 < _a35.length; _i36++) {
        const v_b = _a35[_i36];
        const _h37 = clueAt(cl.count, v_b);
        if (!(((v_b !== v_c) && (_h37 !== -1)))) continue;
        _g38.length = 0;
        G39: {
          const _a42 = sp.adj4[v_b];
          for (let _i43 = 0; _i43 < _a42.length; _i43++) {
            const v_d = _a42[_i43];
            const _h44 = clueAt(cl.count, v_d);
            if (!((!((b.grid[v_d] !== 0)) && (_h44 === -1)))) continue;
            _g38.push(v_d);
          }
        }
        L45: {
          const v_M = _g38;
          const _h46 = v_M.length;
          if (!((((_h46 > 0) && (_h46 < _h34)) && subsetOf(v_M, v_O)))) break L45;
          let _g47 = 0;
          G48: {
            const _a49 = sp.adj4[v_b];
            for (let _i50 = 0; _i50 < _a49.length; _i50++) {
              const v_d = _a49[_i50];
              if (!(((b.grid[v_d] || -1) === 1))) continue;
              _g47++;
            }
          }
          const v_by = (need(b, sp, cl, v_c) - (_h37 - _g47));
          L51: {
            const v_R = minus(v_O, v_M);
            const _h52 = v_R.length;
            if (!(((v_by <= 0) || (v_by >= _h52)))) break L51;
            if (b.made[0] !== _m91_0) {
              _g53.length = 0;
              G54: {
                const _a57 = sp.adj4[v_c];
                for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                  const v_d = _a57[_i58];
                  if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
                  _g53.push(v_d);
                }
              }
              if (!(sameSet(v_O, _g53))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g59: number[] = [];
              G60: {
                const _a63 = sp.adj4[v_c];
                for (let _i64 = 0; _i64 < _a63.length; _i64++) {
                  const v_d = _a63[_i64];
                  if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
                  _g59.push(v_d);
                }
              }
              const _g65: number[] = [];
              G66: {
                const _a69 = sp.adj4[v_b];
                for (let _i70 = 0; _i70 < _a69.length; _i70++) {
                  const v_d = _a69[_i70];
                  if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
                  _g65.push(v_d);
                }
              }
              let _g71 = 0;
              G72: {
                const _a73 = sp.adj4[v_c];
                for (let _i74 = 0; _i74 < _a73.length; _i74++) {
                  const v_d = _a73[_i74];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g71++;
                }
              }
              let _g75 = 0;
              G76: {
                const _a77 = sp.adj4[v_b];
                for (let _i78 = 0; _i78 < _a77.length; _i78++) {
                  const v_d = _a77[_i78];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g75++;
                }
              }
              freshBinding("shared", [(v_c === cl.count.at[v_k]), sameSet(v_O, _g59), (v_O.length >= 2), (within(sp, v_c, 2).includes(v_b)), ((v_b !== v_c) && (clueAt(cl.count, v_b) !== -1)), sameSet(v_M, _g65), (((v_M.length > 0) && (v_M.length < v_O.length)) && subsetOf(v_M, v_O)), (v_by === ((clueAt(cl.count, v_c) - _g71) - (clueAt(cl.count, v_b) - _g75))), sameSet(v_R, minus(v_O, v_M)), ((v_by <= 0) || (v_by >= v_R.length))], ["c =", "O =", "where of O", "b in", "where of b", "M =", "where of M", "by =", "R =", "where of R"]);
            }
            facts.length = 0;
            changed = false;
            let _c84: boolean = ((v_by >= 0) && (v_by <= _h52));
            if (_c84) {
              let _c83: boolean = !((v_by === 0));
              if (!_c83) {
                let _q79 = true;
                Q80: {
                  const _a81 = v_R;
                  for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                    const v_d = _a81[_i82];
                    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                    if (!(true)) {
                      _q79 = false;
                      break Q80;
                    }
                  }
                }
                _c83 = _q79;
              }
              _c84 = _c83;
            }
            let _c90: boolean = _c84;
            if (_c90) {
              let _c89: boolean = (v_by === 0);
              if (!_c89) {
                let _q85 = true;
                Q86: {
                  const _a87 = v_R;
                  for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                    const v_d = _a87[_i88];
                    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                    if (!(true)) {
                      _q85 = false;
                      break Q86;
                    }
                  }
                }
                _c89 = _q85;
              }
              _c90 = _c89;
            }
            if (!(_c90)) return -1;
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
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
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
