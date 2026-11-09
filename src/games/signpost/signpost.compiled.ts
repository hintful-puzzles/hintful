// Compiled by `npm run describe` from src/games/signpost/signpost.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, chain, chainEnd, chainHas, chainHolders, chainLength, clueAt, compass, keptStore, least, popcount, type Kept } from "../../engine/describe-runtime.ts";

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
  const _h124 = sp.cells.length;
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q117 = false;
  Q118: {
    const _a119 = sp.cells;
    for (let _i120 = 0; _i120 < _a119.length; _i120++) {
      const v_c = _a119[_i120];
      const _h123 = chain(sp, (_x121: number): number => { if (_x121 < 0) return -1; const _d122 = (g[_x121] || -1); if (_d122 < 0) return -1; return compass(sp, _x121, clueAt(cl.arrow, _x121), (_d122 - 1)); }, v_c).length;
      if ((_h123 === _h124)) {
        _q117 = true;
        break Q118;
      }
    }
  }
  if (!(_q117)) return false;
  let _q125 = true;
  Q126: {
    const _a127 = sp.cells;
    for (let _i128 = 0; _i128 < _a127.length; _i128++) {
      const v_c = _a127[_i128];
      const _h129 = clueAt(cl.arrow, v_c);
      if (!((_h129 !== -1))) {
        _q125 = false;
        break Q126;
      }
    }
  }
  let _c135: boolean = _q125;
  if (_c135) {
    let _q130 = false;
    Q131: {
      const _a132 = sp.cells;
      for (let _i133 = 0; _i133 < _a132.length; _i133++) {
        const v_c = _a132[_i133];
        const _h134 = clueAt(cl.number, v_c);
        if ((_h134 === 1)) {
          _q130 = true;
          break Q131;
        }
      }
    }
    _c135 = _q130;
  }
  let _c141: boolean = _c135;
  if (_c141) {
    let _q136 = false;
    Q137: {
      const _a138 = sp.cells;
      for (let _i139 = 0; _i139 < _a138.length; _i139++) {
        const v_c = _a138[_i139];
        const _h140 = clueAt(cl.number, v_c);
        if ((_h140 === _h124)) {
          _q136 = true;
          break Q137;
        }
      }
    }
    _c141 = _q136;
  }
  if (!(_c141)) return false;
  for (let _k142 = 0; _k142 < cl.number.at.length; _k142++) {
    const _at143 = cl.number.at[_k142];
    const _v144 = cl.number.v[_k142];
    if (!((chain(sp, (_x145: number): number => { if (_x145 < 0) return -1; const _d146 = (g[_x145] || -1); if (_d146 < 0) return -1; return compass(sp, _x145, clueAt(cl.arrow, _x145), (_d146 - 1)); }, _at143).length === ((_h124 + 1) - _v144)))) return false;
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
      facts.length = 0;
      changed = false;
      let _c89: boolean = (_h87 === 1);
      if (_c89) {
        const _t88 = least(v_U);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t88); changed = true; } else facts.push(PLACE, v_c, _t88); }
        _c89 = true;
      }
      if (!(_c89)) return -1;
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
  const _g102: number[] = [];
  const facts = onlyBeforeFacts;
  let fired = 0;
  let changed = false;
  if (onlyBeforeCands.length < sp.cells.length) onlyBeforeCands = new Int32Array(sp.cells.length);
  const cands = onlyBeforeCands;
  cands.fill(-1);
  mayMarkedKept.clear();
  fitsMarkedKept.clear();
  const _a99 = sp.cells;
  for (let _i100 = 0; _i100 < _a99.length; _i100++) {
    const v_j = _a99[_i100];
    const _h101 = clueAt(cl.number, v_j);
    if (!(((_h101 !== 1) && !(entered(b, sp, cl, v_j))))) continue;
    _g102.length = 0;
    G103: {
      const _a106 = aims(sp, cl, v_j);
      for (let _i107 = 0; _i107 < _a106.length; _i107++) {
        const v_p = _a106[_i107];
        if (!(((!((b.grid[v_p] !== 0)) && !(((b.cands[v_p] >> 1) & 1) !== 0)) && mayMarked(b, sp, cl, cands, v_p, v_j)))) continue;
        _g102.push(v_p);
      }
    }
    L108: {
      const v_P = _g102;
      const _h109 = v_P.length;
      if (!((_h109 < 2))) break L108;
      facts.length = 0;
      changed = false;
      let _c116: boolean = (_h109 === 1);
      if (_c116) {
        let _q110 = true;
        Q111: {
          const _a112 = v_P;
          for (let _i113 = 0; _i113 < _a112.length; _i113++) {
            const v_p = _a112[_i113];
            const _h115 = clueAt(cl.arrow, v_p);
            for (let _m114 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m114 !== 0; _m114 &= _m114 - 1) {
              const v_d = 31 - Math.clz32(_m114 & -_m114);
              if (!((compass(sp, v_p, _h115, (v_d - 1)) === v_j))) continue;
              if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, v_d); changed = true; } else facts.push(PLACE, v_p, v_d); }
              if (!(true)) {
                _q110 = false;
                break Q111;
              }
            }
          }
        }
        _c116 = _q110;
      }
      if (!(_c116)) return -1;
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

/** `aims(j)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function aims(sp: GridSpace, cl: Dealt, v_j: number): readonly number[] {
  const _kept: Kept<readonly number[]> = aimsKept.board(cl);
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
