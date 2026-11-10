// Compiled by `npm run describe` from src/games/signpost/signpost.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, chain, chainEnd, chainHas, chainHolders, chainLength, clueAt, compass, freshBinding, keptStore, least, popcount, sameSet, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  arrow: ClueList;
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "onlyNext" | "onlyBefore";

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
  { id: "onlyNext", tier: 0 },
  { id: "onlyBefore", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    const _t4 = (sp.w + sp.h);
    for (let v_d = 1; v_d <= _t4; v_d++) {
      if (!((((v_d === 1) === (clueAt(cl.number, v_c) === sp.cells.length)) && ((v_d === 1) || (compass(sp, v_c, clueAt(cl.arrow, v_c), (v_d - 1)) !== -1))))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _h8 = sp.cells.length;
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = false;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h7 = chain(sp, (_x5: number): number => { if (_x5 < 0) return -1; const _d6 = (g[_x5] || -1); if (_d6 < 0) return -1; return compass(sp, _x5, clueAt(cl.arrow, _x5), (_d6 - 1)); }, v_c).length;
      if ((_h7 === _h8)) {
        _q1 = true;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q9 = true;
  Q10: {
    const _a11 = sp.cells;
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_c = _a11[_i12];
      const _h13 = clueAt(cl.arrow, v_c);
      if (!((_h13 !== -1))) {
        _q9 = false;
        break Q10;
      }
    }
  }
  let _c19: boolean = _q9;
  if (_c19) {
    let _q14 = false;
    Q15: {
      const _a16 = sp.cells;
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_c = _a16[_i17];
        const _h18 = clueAt(cl.number, v_c);
        if ((_h18 === 1)) {
          _q14 = true;
          break Q15;
        }
      }
    }
    _c19 = _q14;
  }
  let _c25: boolean = _c19;
  if (_c25) {
    let _q20 = false;
    Q21: {
      const _a22 = sp.cells;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_c = _a22[_i23];
        const _h24 = clueAt(cl.number, v_c);
        if ((_h24 === _h8)) {
          _q20 = true;
          break Q21;
        }
      }
    }
    _c25 = _q20;
  }
  if (!(_c25)) return false;
  for (let _k26 = 0; _k26 < cl.number.at.length; _k26++) {
    const _at27 = cl.number.at[_k26];
    const _v28 = cl.number.v[_k26];
    if (!((chain(sp, (_x29: number): number => { if (_x29 < 0) return -1; const _d30 = (g[_x29] || -1); if (_d30 < 0) return -1; return compass(sp, _x29, clueAt(cl.arrow, _x29), (_d30 - 1)); }, _at27).length === ((_h8 + 1) - _v28)))) return false;
  }
  return true;
}

export interface OnlyNextBinding {
  c: number;
  U: number;
}

const onlyNextFacts: number[] = [];
let onlyNextCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function onlyNext(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyNextBinding> | null): number {
  const facts = onlyNextFacts;
  let fired = 0;
  let changed = false;
  if (onlyNextCands.length < sp.cells.length) onlyNextCands = new Int32Array(sp.cells.length);
  const cands = onlyNextCands;
  cands.fill(-1);
  mayMarkedKept.clear();
  fitsMarkedKept.clear();
  const _a10 = sp.cells;
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_c = _a10[_i11];
    if (!((!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 1) & 1) !== 0)))) continue;
    const _h17 = clueAt(cl.arrow, v_c);
    let _g12 = 0;
    G13: {
      for (let _m16 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m16 !== 0; _m16 &= _m16 - 1) {
        const v_d = 31 - Math.clz32(_m16 & -_m16);
        const _t18 = compass(sp, v_c, _h17, (v_d - 1));
        if (!(mayMarked(b, sp, cl, cands, v_c, _t18))) continue;
        _g12 |= 1 << v_d;
      }
    }
    L19: {
      const v_U = _g12;
      const _h20 = popcount(v_U);
      if (!((_h20 < 2))) break L19;
      if (import.meta.env.DEV && staleChecking) {
        let _g21 = 0;
        G22: {
          for (let _m25 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m25 !== 0; _m25 &= _m25 - 1) {
            const v_d = 31 - Math.clz32(_m25 & -_m25);
            const _t26 = compass(sp, v_c, clueAt(cl.arrow, v_c), (v_d - 1));
            if (!(mayMarked(b, sp, cl, cands, v_c, _t26))) continue;
            _g21 |= 1 << v_d;
          }
        }
        freshBinding("onlyNext", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 1) & 1) !== 0)), (v_U === _g21), (popcount(v_U) < 2)], ["c in", "where of c", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c28: boolean = (_h20 === 1);
      if (_c28) {
        const _t27 = least(v_U);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t27); changed = true; } else facts.push(PLACE, v_c, _t27); }
        _c28 = true;
      }
      if (!(_c28)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, U: v_U }, facts)) return 1;
        cands.fill(-1);
        mayMarkedKept.clear();
        fitsMarkedKept.clear();
      }
    }
  }
  return fired;
}

export interface OnlyBeforeBinding {
  j: number;
  P: readonly number[];
}

const onlyBeforeFacts: number[] = [];
let onlyBeforeCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function onlyBefore(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyBeforeBinding> | null): number {
  const _g13: number[] = [];
  const facts = onlyBeforeFacts;
  let fired = 0;
  let changed = false;
  const _k17 = aimsKept.board(cl);
  if (onlyBeforeCands.length < sp.cells.length) onlyBeforeCands = new Int32Array(sp.cells.length);
  const cands = onlyBeforeCands;
  cands.fill(-1);
  mayMarkedKept.clear();
  fitsMarkedKept.clear();
  const _a10 = sp.cells;
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_j = _a10[_i11];
    const _h12 = clueAt(cl.number, v_j);
    if (!(((_h12 !== 1) && !(entered(b, sp, cl, v_j))))) continue;
    _g13.length = 0;
    G14: {
      const _a18 = (_k17[v_j] ?? aims(sp, cl, v_j));
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_p = _a18[_i19];
        if (!(((!((b.grid[v_p] !== 0)) && !(((b.cands[v_p] >> 1) & 1) !== 0)) && mayMarked(b, sp, cl, cands, v_p, v_j)))) continue;
        _g13.push(v_p);
      }
    }
    L20: {
      const v_P = _g13;
      const _h21 = v_P.length;
      if (!((_h21 < 2))) break L20;
      if (import.meta.env.DEV && staleChecking) {
        const _g22: number[] = [];
        G23: {
          const _a26 = aims(sp, cl, v_j);
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_p = _a26[_i27];
            if (!(((!((b.grid[v_p] !== 0)) && !(((b.cands[v_p] >> 1) & 1) !== 0)) && mayMarked(b, sp, cl, cands, v_p, v_j)))) continue;
            _g22.push(v_p);
          }
        }
        freshBinding("onlyBefore", [(sp.cells.includes(v_j)), ((clueAt(cl.number, v_j) !== 1) && !(entered(b, sp, cl, v_j))), sameSet(v_P, _g22), (v_P.length < 2)], ["j in", "where of j", "P =", "where of P"]);
      }
      facts.length = 0;
      changed = false;
      let _c34: boolean = (_h21 === 1);
      if (_c34) {
        let _q28 = true;
        Q29: {
          const _a30 = v_P;
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_p = _a30[_i31];
            const _h33 = clueAt(cl.arrow, v_p);
            for (let _m32 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m32 !== 0; _m32 &= _m32 - 1) {
              const v_d = 31 - Math.clz32(_m32 & -_m32);
              if (!((compass(sp, v_p, _h33, (v_d - 1)) === v_j))) continue;
              if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, v_d); changed = true; } else facts.push(PLACE, v_p, v_d); }
              if (!(true)) {
                _q28 = false;
                break Q29;
              }
            }
          }
        }
        _c34 = _q28;
      }
      if (!(_c34)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ j: v_j, P: v_P.slice() }, facts)) return 1;
        cands.fill(-1);
        mayMarkedKept.clear();
        fitsMarkedKept.clear();
      }
    }
  }
  return fired;
}

const aimsKept = keptStore<readonly number[]>();
let aimsOn: object | null = null;
let aimsAt: Kept<readonly number[]> = [];

/** `aims(j)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function aims(sp: GridSpace, cl: Dealt, v_j: number): readonly number[] {
  if (cl !== aimsOn) {
    aimsAt = aimsKept.board(cl);
    aimsOn = cl;
  }
  const _kept: Kept<readonly number[]> = aimsAt;
  if (_kept[v_j] !== undefined) return _kept[v_j];
  const _g1: number[] = [];
  G2: {
    for (let v_a = 1; v_a <= 8; v_a++) {
      const _t5 = (sp.w + sp.h);
      for (let v_k = 1; v_k <= _t5; v_k++) {
        L6: {
          const v_p = compass(sp, v_j, v_a, v_k);
          if (!(((v_p !== -1) && (clueAt(cl.arrow, v_p) === (((v_a + 3) % 8) + 1))))) break L6;
          if (!_g1.includes(v_p)) _g1.push(v_p);
        }
      }
    }
  }
  const _made = _g1;
  _kept[v_j] = _made;
  return _made;
}

const enteredKept = keptStore<boolean>();

/** `entered(j)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function entered(b: Marks, sp: GridSpace, cl: Dealt, v_j: number): boolean {
  const _kept: Kept<boolean> = enteredKept.marks(b);
  if (_kept[v_j] !== undefined) return _kept[v_j];
  let _q1 = false;
  Q2: {
    const _a3 = aims(sp, cl, v_j);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_p = _a3[_i4];
      if ((((_x5: number): number => { if (_x5 < 0) return -1; const _d6 = (b.grid[_x5] || -1); if (_d6 < 0) return -1; return compass(sp, _x5, clueAt(cl.arrow, _x5), (_d6 - 1)); })(v_p) === v_j)) {
        _q1 = true;
        break Q2;
      }
    }
  }
  const _made = _q1;
  _kept[v_j] = _made;
  return _made;
}

const topKept = keptStore<number>();

/** `top(e)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function top(b: Marks, sp: GridSpace, cl: Dealt, v_e: number): number {
  const _kept: Kept<number> = topKept.marks(b);
  if (_kept[v_e] !== undefined) return _kept[v_e];
  let _g1 = -1;
  G2: {
    const _a3 = chainHolders(sp, b, (_x5: number): number => { if (_x5 < 0) return -1; const _d6 = (b.grid[_x5] || -1); if (_d6 < 0) return -1; return compass(sp, _x5, clueAt(cl.arrow, _x5), (_d6 - 1)); }, v_e);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_g = _a3[_i4];
      if (!((chainHas(sp, b, (_x7: number): number => { if (_x7 < 0) return -1; const _d8 = (b.grid[_x7] || -1); if (_d8 < 0) return -1; return compass(sp, _x7, clueAt(cl.arrow, _x7), (_d8 - 1)); }, v_e, v_g) && (clueAt(cl.number, v_g) !== -1)))) continue;
      const _t11 = (clueAt(cl.number, v_g) + chainLength(sp, b, (_x9: number): number => { if (_x9 < 0) return -1; const _d10 = (b.grid[_x9] || -1); if (_d10 < 0) return -1; return compass(sp, _x9, clueAt(cl.arrow, _x9), (_d10 - 1)); }, v_g));
      if (_g1 === -1 || _t11 < _g1) _g1 = _t11;
    }
  }
  const _made = _g1;
  _kept[v_e] = _made;
  return _made;
}

const numKept = keptStore<number>();

/** `num(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function num(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = numKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = -1;
  G2: {
    const _t7 = chainEnd(sp, b, (_x5: number): number => { if (_x5 < 0) return -1; const _d6 = (b.grid[_x5] || -1); if (_d6 < 0) return -1; return compass(sp, _x5, clueAt(cl.arrow, _x5), (_d6 - 1)); }, v_c);
    for (let _i8 = 0; _i8 < 1; _i8++) {
      const v_e = _t7;
      if (!(((v_e !== -1) && (top(b, sp, cl, v_e) !== -1)))) continue;
      const _t11 = (top(b, sp, cl, v_e) - chainLength(sp, b, (_x9: number): number => { if (_x9 < 0) return -1; const _d10 = (b.grid[_x9] || -1); if (_d10 < 0) return -1; return compass(sp, _x9, clueAt(cl.arrow, _x9), (_d10 - 1)); }, v_c));
      if (_g1 === -1 || _t11 < _g1) _g1 = _t11;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const heldKept = keptStore<boolean>();

/** `held(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function held(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): boolean {
  const _kept: Kept<boolean> = heldKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g1 = 0;
  G2: {
    const _a5 = numKept.valued(b, (_y4: number): number => num(b, sp, cl, _y4), sp.cells, v_k);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_x = _a5[_i6];
      if (!((num(b, sp, cl, v_x) === v_k))) continue;
      _g1++;
    }
  }
  const _made = (_g1 > 0);
  _kept[v_k] = _made;
  return _made;
}

const roomAfterKept = keptStore<number>();

/** `roomAfter(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function roomAfter(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = roomAfterKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = -1;
  G2: {
    const _t3 = (num(b, sp, cl, v_c) + 1);
    const _t4 = sp.cells.length;
    for (let v_k = _t3; v_k <= _t4; v_k++) {
      if (!(held(b, sp, cl, v_k))) continue;
      const _t5 = ((v_k - num(b, sp, cl, v_c)) - 1);
      _g1 = _t5;
      break G2;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const roomBeforeKept = keptStore<number>();

/** `roomBefore(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function roomBefore(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = roomBeforeKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = -1;
  G2: {
    const _t3 = (num(b, sp, cl, v_c) - 1);
    for (let v_k = _t3; v_k >= 1; v_k--) {
      if (!(held(b, sp, cl, v_k))) continue;
      const _t4 = ((num(b, sp, cl, v_c) - v_k) - 1);
      _g1 = _t4;
      break G2;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const fitsMarkedKept = new Map<number, boolean>();

/** `fits(c, j)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function fitsMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_c: number, v_j: number): boolean {
  const _was = fitsMarkedKept.get((v_c + 1) * 1048577 + (v_j + 1));
  if (_was !== undefined) return _was;
  let _c12: boolean = ((((num(b, sp, cl, v_c) === -1) && (num(b, sp, cl, v_j) === -1)) || (((num(b, sp, cl, v_c) !== -1) && (num(b, sp, cl, v_j) !== -1)) && (num(b, sp, cl, v_j) === (num(b, sp, cl, v_c) + 1)))) || (((num(b, sp, cl, v_c) !== -1) && (num(b, sp, cl, v_j) === -1)) && (chainLength(sp, b, (_x1: number): number => { if (_x1 < 0) return -1; const _d2 = (b.grid[_x1] || -1); if (_d2 < 0) return -1; return compass(sp, _x1, clueAt(cl.arrow, _x1), (_d2 - 1)); }, v_j) <= roomAfter(b, sp, cl, v_c))));
  if (!_c12) {
    let _c11: boolean = ((num(b, sp, cl, v_c) === -1) && (num(b, sp, cl, v_j) !== -1));
    if (_c11) {
      let _g3 = 0;
      G4: {
        const _a5 = chainHolders(sp, b, (_x7: number): number => { if (_x7 < 0) return -1; const _d8 = (b.grid[_x7] || -1); if (_d8 < 0) return -1; return compass(sp, _x7, clueAt(cl.arrow, _x7), (_d8 - 1)); }, v_c);
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_x = _a5[_i6];
          if (!(chainHas(sp, b, (_x9: number): number => { if (_x9 < 0) return -1; const _d10 = (b.grid[_x9] || -1); if (_d10 < 0) return -1; return compass(sp, _x9, clueAt(cl.arrow, _x9), (_d10 - 1)); }, v_c, v_x))) continue;
          _g3++;
        }
      }
      _c11 = (_g3 <= roomBefore(b, sp, cl, v_j));
    }
    _c12 = _c11;
  }
  const _made = _c12;
  fitsMarkedKept.set((v_c + 1) * 1048577 + (v_j + 1), _made);
  return _made;
}

const mayMarkedKept = new Map<number, boolean>();

/** `may(c, j)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function mayMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_j: number): boolean {
  const _was = mayMarkedKept.get((v_c + 1) * 1048577 + (v_j + 1));
  if (_was !== undefined) return _was;
  const _made = ((!(entered(b, sp, cl, v_j)) && !chainHas(sp, b, (_x1: number): number => { if (_x1 < 0) return -1; const _d2 = (b.grid[_x1] || -1); if (_d2 < 0) return -1; return compass(sp, _x1, clueAt(cl.arrow, _x1), (_d2 - 1)); }, v_c, v_j)) && fitsMarked(b, sp, cl, cands, v_c, v_j));
  mayMarkedKept.set((v_c + 1) * 1048577 + (v_j + 1), _made);
  return _made;
}
