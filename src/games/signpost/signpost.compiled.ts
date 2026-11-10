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
  const _h137 = sp.cells.length;
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q130 = false;
  Q131: {
    const _a132 = sp.cells;
    for (let _i133 = 0; _i133 < _a132.length; _i133++) {
      const v_c = _a132[_i133];
      const _h136 = chain(sp, (_x134: number): number => { if (_x134 < 0) return -1; const _d135 = (g[_x134] || -1); if (_d135 < 0) return -1; return compass(sp, _x134, clueAt(cl.arrow, _x134), (_d135 - 1)); }, v_c).length;
      if ((_h136 === _h137)) {
        _q130 = true;
        break Q131;
      }
    }
  }
  if (!(_q130)) return false;
  let _q138 = true;
  Q139: {
    const _a140 = sp.cells;
    for (let _i141 = 0; _i141 < _a140.length; _i141++) {
      const v_c = _a140[_i141];
      const _h142 = clueAt(cl.arrow, v_c);
      if (!((_h142 !== -1))) {
        _q138 = false;
        break Q139;
      }
    }
  }
  let _c148: boolean = _q138;
  if (_c148) {
    let _q143 = false;
    Q144: {
      const _a145 = sp.cells;
      for (let _i146 = 0; _i146 < _a145.length; _i146++) {
        const v_c = _a145[_i146];
        const _h147 = clueAt(cl.number, v_c);
        if ((_h147 === 1)) {
          _q143 = true;
          break Q144;
        }
      }
    }
    _c148 = _q143;
  }
  let _c154: boolean = _c148;
  if (_c154) {
    let _q149 = false;
    Q150: {
      const _a151 = sp.cells;
      for (let _i152 = 0; _i152 < _a151.length; _i152++) {
        const v_c = _a151[_i152];
        const _h153 = clueAt(cl.number, v_c);
        if ((_h153 === _h137)) {
          _q149 = true;
          break Q150;
        }
      }
    }
    _c154 = _q149;
  }
  if (!(_c154)) return false;
  for (let _k155 = 0; _k155 < cl.number.at.length; _k155++) {
    const _at156 = cl.number.at[_k155];
    const _v157 = cl.number.v[_k155];
    if (!((chain(sp, (_x158: number): number => { if (_x158 < 0) return -1; const _d159 = (g[_x158] || -1); if (_d159 < 0) return -1; return compass(sp, _x158, clueAt(cl.arrow, _x158), (_d159 - 1)); }, _at156).length === ((_h137 + 1) - _v157)))) return false;
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
  const _a77 = sp.cells;
  for (let _i78 = 0; _i78 < _a77.length; _i78++) {
    const v_c = _a77[_i78];
    if (!((!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 1) & 1) !== 0)))) continue;
    const _h84 = clueAt(cl.arrow, v_c);
    let _g79 = 0;
    G80: {
      for (let _m83 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m83 !== 0; _m83 &= _m83 - 1) {
        const v_d = 31 - Math.clz32(_m83 & -_m83);
        const _t85 = compass(sp, v_c, _h84, (v_d - 1));
        if (!(mayMarked(b, sp, cl, cands, v_c, _t85))) continue;
        _g79 |= 1 << v_d;
      }
    }
    L86: {
      const v_U = _g79;
      const _h87 = popcount(v_U);
      if (!((_h87 < 2))) break L86;
      if (import.meta.env.DEV && staleChecking) {
        let _g88 = 0;
        G89: {
          for (let _m92 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m92 !== 0; _m92 &= _m92 - 1) {
            const v_d = 31 - Math.clz32(_m92 & -_m92);
            const _t93 = compass(sp, v_c, clueAt(cl.arrow, v_c), (v_d - 1));
            if (!(mayMarked(b, sp, cl, cands, v_c, _t93))) continue;
            _g88 |= 1 << v_d;
          }
        }
        freshBinding("onlyNext", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 1) & 1) !== 0)), (v_U === _g88), (popcount(v_U) < 2)], ["c in", "where of c", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c95: boolean = (_h87 === 1);
      if (_c95) {
        const _t94 = least(v_U);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t94); changed = true; } else facts.push(PLACE, v_c, _t94); }
        _c95 = true;
      }
      if (!(_c95)) return -1;
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
  const _g108: number[] = [];
  const facts = onlyBeforeFacts;
  let fired = 0;
  let changed = false;
  const _k112 = aimsKept.board(cl);
  if (onlyBeforeCands.length < sp.cells.length) onlyBeforeCands = new Int32Array(sp.cells.length);
  const cands = onlyBeforeCands;
  cands.fill(-1);
  mayMarkedKept.clear();
  fitsMarkedKept.clear();
  const _a105 = sp.cells;
  for (let _i106 = 0; _i106 < _a105.length; _i106++) {
    const v_j = _a105[_i106];
    const _h107 = clueAt(cl.number, v_j);
    if (!(((_h107 !== 1) && !(entered(b, sp, cl, v_j))))) continue;
    _g108.length = 0;
    G109: {
      const _a113 = (_k112[v_j] ?? aims(sp, cl, v_j));
      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
        const v_p = _a113[_i114];
        if (!(((!((b.grid[v_p] !== 0)) && !(((b.cands[v_p] >> 1) & 1) !== 0)) && mayMarked(b, sp, cl, cands, v_p, v_j)))) continue;
        _g108.push(v_p);
      }
    }
    L115: {
      const v_P = _g108;
      const _h116 = v_P.length;
      if (!((_h116 < 2))) break L115;
      if (import.meta.env.DEV && staleChecking) {
        const _g117: number[] = [];
        G118: {
          const _a121 = aims(sp, cl, v_j);
          for (let _i122 = 0; _i122 < _a121.length; _i122++) {
            const v_p = _a121[_i122];
            if (!(((!((b.grid[v_p] !== 0)) && !(((b.cands[v_p] >> 1) & 1) !== 0)) && mayMarked(b, sp, cl, cands, v_p, v_j)))) continue;
            _g117.push(v_p);
          }
        }
        freshBinding("onlyBefore", [(sp.cells.includes(v_j)), ((clueAt(cl.number, v_j) !== 1) && !(entered(b, sp, cl, v_j))), sameSet(v_P, _g117), (v_P.length < 2)], ["j in", "where of j", "P =", "where of P"]);
      }
      facts.length = 0;
      changed = false;
      let _c129: boolean = (_h116 === 1);
      if (_c129) {
        let _q123 = true;
        Q124: {
          const _a125 = v_P;
          for (let _i126 = 0; _i126 < _a125.length; _i126++) {
            const v_p = _a125[_i126];
            const _h128 = clueAt(cl.arrow, v_p);
            for (let _m127 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m127 !== 0; _m127 &= _m127 - 1) {
              const v_d = 31 - Math.clz32(_m127 & -_m127);
              if (!((compass(sp, v_p, _h128, (v_d - 1)) === v_j))) continue;
              if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, v_d); changed = true; } else facts.push(PLACE, v_p, v_d); }
              if (!(true)) {
                _q123 = false;
                break Q124;
              }
            }
          }
        }
        _c129 = _q123;
      }
      if (!(_c129)) return -1;
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
  const _g13: number[] = [];
  G14: {
    for (let v_a = 1; v_a <= 8; v_a++) {
      const _t17 = (sp.w + sp.h);
      for (let v_k = 1; v_k <= _t17; v_k++) {
        L18: {
          const v_p = compass(sp, v_j, v_a, v_k);
          if (!(((v_p !== -1) && (clueAt(cl.arrow, v_p) === (((v_a + 3) % 8) + 1))))) break L18;
          if (!_g13.includes(v_p)) _g13.push(v_p);
        }
      }
    }
  }
  const _made = _g13;
  _kept[v_j] = _made;
  return _made;
}

const enteredKept = keptStore<boolean>();

/** `entered(j)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function entered(b: Marks, sp: GridSpace, cl: Dealt, v_j: number): boolean {
  const _kept: Kept<boolean> = enteredKept.marks(b);
  if (_kept[v_j] !== undefined) return _kept[v_j];
  let _q11 = false;
  Q12: {
    const _a19 = aims(sp, cl, v_j);
    for (let _i20 = 0; _i20 < _a19.length; _i20++) {
      const v_p = _a19[_i20];
      if ((((_x21: number): number => { if (_x21 < 0) return -1; const _d22 = (b.grid[_x21] || -1); if (_d22 < 0) return -1; return compass(sp, _x21, clueAt(cl.arrow, _x21), (_d22 - 1)); })(v_p) === v_j)) {
        _q11 = true;
        break Q12;
      }
    }
  }
  const _made = _q11;
  _kept[v_j] = _made;
  return _made;
}

const topKept = keptStore<number>();

/** `top(e)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function top(b: Marks, sp: GridSpace, cl: Dealt, v_e: number): number {
  const _kept: Kept<number> = topKept.marks(b);
  if (_kept[v_e] !== undefined) return _kept[v_e];
  let _g33 = -1;
  G34: {
    const _a35 = chainHolders(sp, b, (_x37: number): number => { if (_x37 < 0) return -1; const _d38 = (b.grid[_x37] || -1); if (_d38 < 0) return -1; return compass(sp, _x37, clueAt(cl.arrow, _x37), (_d38 - 1)); }, v_e);
    for (let _i36 = 0; _i36 < _a35.length; _i36++) {
      const v_g = _a35[_i36];
      if (!((chainHas(sp, b, (_x39: number): number => { if (_x39 < 0) return -1; const _d40 = (b.grid[_x39] || -1); if (_d40 < 0) return -1; return compass(sp, _x39, clueAt(cl.arrow, _x39), (_d40 - 1)); }, v_e, v_g) && (clueAt(cl.number, v_g) !== -1)))) continue;
      const _t43 = (clueAt(cl.number, v_g) + chainLength(sp, b, (_x41: number): number => { if (_x41 < 0) return -1; const _d42 = (b.grid[_x41] || -1); if (_d42 < 0) return -1; return compass(sp, _x41, clueAt(cl.arrow, _x41), (_d42 - 1)); }, v_g));
      if (_g33 === -1 || _t43 < _g33) _g33 = _t43;
    }
  }
  const _made = _g33;
  _kept[v_e] = _made;
  return _made;
}

const numKept = keptStore<number>();

/** `num(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function num(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = numKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g25 = -1;
  G26: {
    const _t31 = chainEnd(sp, b, (_x29: number): number => { if (_x29 < 0) return -1; const _d30 = (b.grid[_x29] || -1); if (_d30 < 0) return -1; return compass(sp, _x29, clueAt(cl.arrow, _x29), (_d30 - 1)); }, v_c);
    for (let _i32 = 0; _i32 < 1; _i32++) {
      const v_e = _t31;
      if (!(((v_e !== -1) && (top(b, sp, cl, v_e) !== -1)))) continue;
      const _t46 = (top(b, sp, cl, v_e) - chainLength(sp, b, (_x44: number): number => { if (_x44 < 0) return -1; const _d45 = (b.grid[_x44] || -1); if (_d45 < 0) return -1; return compass(sp, _x44, clueAt(cl.arrow, _x44), (_d45 - 1)); }, v_c));
      if (_g25 === -1 || _t46 < _g25) _g25 = _t46;
    }
  }
  const _made = _g25;
  _kept[v_c] = _made;
  return _made;
}

const heldKept = keptStore<boolean>();

/** `held(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function held(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): boolean {
  const _kept: Kept<boolean> = heldKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g53 = 0;
  G54: {
    const _a57 = numKept.valued(b, (_y56: number): number => num(b, sp, cl, _y56), sp.cells, v_k);
    for (let _i58 = 0; _i58 < _a57.length; _i58++) {
      const v_x = _a57[_i58];
      if (!((num(b, sp, cl, v_x) === v_k))) continue;
      _g53++;
    }
  }
  const _made = (_g53 > 0);
  _kept[v_k] = _made;
  return _made;
}

const roomAfterKept = keptStore<number>();

/** `roomAfter(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function roomAfter(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = roomAfterKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g49 = -1;
  G50: {
    const _t51 = (num(b, sp, cl, v_c) + 1);
    const _t52 = sp.cells.length;
    for (let v_k = _t51; v_k <= _t52; v_k++) {
      if (!(held(b, sp, cl, v_k))) continue;
      const _t59 = ((v_k - num(b, sp, cl, v_c)) - 1);
      _g49 = _t59;
      break G50;
    }
  }
  const _made = _g49;
  _kept[v_c] = _made;
  return _made;
}

const roomBeforeKept = keptStore<number>();

/** `roomBefore(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function roomBefore(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = roomBeforeKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g68 = -1;
  G69: {
    const _t70 = (num(b, sp, cl, v_c) - 1);
    for (let v_k = _t70; v_k >= 1; v_k--) {
      if (!(held(b, sp, cl, v_k))) continue;
      const _t71 = ((num(b, sp, cl, v_c) - v_k) - 1);
      _g68 = _t71;
      break G69;
    }
  }
  const _made = _g68;
  _kept[v_c] = _made;
  return _made;
}

const fitsMarkedKept = new Map<number, boolean>();

/** `fits(c, j)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function fitsMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_c: number, v_j: number): boolean {
  const _was = fitsMarkedKept.get((v_c + 1) * 1048577 + (v_j + 1));
  if (_was !== undefined) return _was;
  let _c73: boolean = ((((num(b, sp, cl, v_c) === -1) && (num(b, sp, cl, v_j) === -1)) || (((num(b, sp, cl, v_c) !== -1) && (num(b, sp, cl, v_j) !== -1)) && (num(b, sp, cl, v_j) === (num(b, sp, cl, v_c) + 1)))) || (((num(b, sp, cl, v_c) !== -1) && (num(b, sp, cl, v_j) === -1)) && (chainLength(sp, b, (_x47: number): number => { if (_x47 < 0) return -1; const _d48 = (b.grid[_x47] || -1); if (_d48 < 0) return -1; return compass(sp, _x47, clueAt(cl.arrow, _x47), (_d48 - 1)); }, v_j) <= roomAfter(b, sp, cl, v_c))));
  if (!_c73) {
    let _c72: boolean = ((num(b, sp, cl, v_c) === -1) && (num(b, sp, cl, v_j) !== -1));
    if (_c72) {
      let _g60 = 0;
      G61: {
        const _a62 = chainHolders(sp, b, (_x64: number): number => { if (_x64 < 0) return -1; const _d65 = (b.grid[_x64] || -1); if (_d65 < 0) return -1; return compass(sp, _x64, clueAt(cl.arrow, _x64), (_d65 - 1)); }, v_c);
        for (let _i63 = 0; _i63 < _a62.length; _i63++) {
          const v_x = _a62[_i63];
          if (!(chainHas(sp, b, (_x66: number): number => { if (_x66 < 0) return -1; const _d67 = (b.grid[_x66] || -1); if (_d67 < 0) return -1; return compass(sp, _x66, clueAt(cl.arrow, _x66), (_d67 - 1)); }, v_c, v_x))) continue;
          _g60++;
        }
      }
      _c72 = (_g60 <= roomBefore(b, sp, cl, v_j));
    }
    _c73 = _c72;
  }
  const _made = _c73;
  fitsMarkedKept.set((v_c + 1) * 1048577 + (v_j + 1), _made);
  return _made;
}

const mayMarkedKept = new Map<number, boolean>();

/** `may(c, j)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function mayMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_j: number): boolean {
  const _was = mayMarkedKept.get((v_c + 1) * 1048577 + (v_j + 1));
  if (_was !== undefined) return _was;
  const _made = ((!(entered(b, sp, cl, v_j)) && !chainHas(sp, b, (_x23: number): number => { if (_x23 < 0) return -1; const _d24 = (b.grid[_x23] || -1); if (_d24 < 0) return -1; return compass(sp, _x23, clueAt(cl.arrow, _x23), (_d24 - 1)); }, v_c, v_j)) && fitsMarked(b, sp, cl, cands, v_c, v_j));
  mayMarkedKept.set((v_c + 1) * 1048577 + (v_j + 1), _made);
  return _made;
}
