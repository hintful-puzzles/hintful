// Compiled by `npm run describe` from src/games/singles/singles.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, cellsValued, clueAt, connected, cuts, freshBinding, rangeMask, sameSet, staleChecking } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "besideCovered" | "sameLine" | "sandwich" | "pair" | "corner" | "boxedIn" | "offset" | "split";

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
  { id: "besideCovered", tier: 0 },
  { id: "sameLine", tier: 0 },
  { id: "sandwich", tier: 0 },
  { id: "pair", tier: 0 },
  { id: "corner", tier: 0 },
  { id: "boxedIn", tier: 0 },
  { id: "offset", tier: 1 },
  { id: "split", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g11: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = (g[v_c] || -1);
      if (!((_h5 === 1))) continue;
      let _q6 = true;
      Q7: {
        const _a8 = sp.adj4[v_c];
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_p = _a8[_i9];
          const _h10 = (g[v_p] || -1);
          if (!((_h10 === 2))) {
            _q6 = false;
            break Q7;
          }
        }
      }
      if (!(_q6)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  _g11.length = 0;
  G12: {
    const _a15 = sp.cells;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_c = _a15[_i16];
      const _h17 = (g[v_c] || -1);
      if (!((_h17 === 2))) continue;
      _g11.push(v_c);
    }
  }
  if (!(connected(sp, _g11))) return false;
  for (let _k18 = 0; _k18 < cl.number.at.length; _k18++) {
    const _at19 = cl.number.at[_k18];
    const _v20 = cl.number.v[_k18];
    let _c30: boolean = ((g[_at19] || -1) === 1);
    if (!_c30) {
      let _q21 = true;
      Q22: {
        const _t23 = sp.rowOf[_at19];
        const _t24 = sp.colOf[_at19];
        for (let _i25 = 0; _i25 < 2; _i25++) {
          const v_L = _i25 === 0 ? _t23 : _t24;
          if (_i25 === 1 && (v_L === _t23)) continue;
          const _a26 = sp.lineCells[v_L];
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_p = _a26[_i27];
            const _h28 = clueAt(cl.number, v_p);
            if (!(((v_p !== _at19) && (_h28 === _v20)))) continue;
            const _h29 = (g[v_p] || -1);
            if (!((_h29 === 1))) {
              _q21 = false;
              break Q22;
            }
          }
        }
      }
      _c30 = _q21;
    }
    if (!(_c30)) return false;
  }
  return true;
}

export interface BesideCoveredBinding {
  c: number;
}

const besideCoveredFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function besideCovered(b: Marks, sp: GridSpace, fire: Fire<BesideCoveredBinding> | null): number {
  const facts = besideCoveredFacts;
  let fired = 0;
  let changed = false;
  const _a3 = cellsValued(b, sp.cells, 1);
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("besideCovered", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1)], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      const _a7 = sp.adj4[v_c];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_p = _a7[_i8];
        if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
        if (!(true)) {
          _q5 = false;
          break Q6;
        }
      }
    }
    if (!(_q5)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface SameLineBinding {
  c: number;
  n: number;
}

const sameLineFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function sameLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SameLineBinding> | null): number {
  const facts = sameLineFacts;
  let fired = 0;
  let changed = false;
  const _a3 = cellsValued(b, sp.cells, 2);
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!(((b.grid[v_c] || -1) === 2))) continue;
    const _h5 = clueAt(cl.number, v_c);
    const v_n = _h5;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("sameLine", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 2), (v_n === clueAt(cl.number, v_c))], ["c in", "where of c", "n ="]);
    }
    facts.length = 0;
    changed = false;
    let _q6 = true;
    Q7: {
      const _t8 = sp.rowOf[v_c];
      const _t9 = sp.colOf[v_c];
      for (let _i10 = 0; _i10 < 2; _i10++) {
        const v_L = _i10 === 0 ? _t8 : _t9;
        if (_i10 === 1 && (v_L === _t8)) continue;
        const _a11 = sp.lineCells[v_L];
        for (let _i12 = 0; _i12 < _a11.length; _i12++) {
          const v_p = _a11[_i12];
          const _h13 = clueAt(cl.number, v_p);
          if (!(((v_p !== v_c) && (_h13 === v_n)))) continue;
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
          if (!(true)) {
            _q6 = false;
            break Q7;
          }
        }
      }
    }
    if (!(_q6)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c, n: v_n }, facts)) return 1;
    }
  }
  return fired;
}

export interface SandwichBinding {
  L: number;
  c: number;
  e: number;
}

const sandwichFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function sandwich(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SandwichBinding> | null): number {
  const facts = sandwichFacts;
  let fired = 0;
  let changed = false;
  const _a6 = sp.lines;
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_L = _a6[_i7];
    const _a8 = sp.lineCells[v_L];
    for (let _i9 = 0; _i9 < _a8.length; _i9++) {
      const v_c = _a8[_i9];
      const _h12 = clueAt(cl.number, v_c);
      L10: {
        const v_e = (sp.lineCells[v_L][(_i9 + 2)] ?? -1);
        const _h11 = clueAt(cl.number, v_e);
        if (!(((v_e !== -1) && (_h11 === _h12)))) break L10;
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("sandwich", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), (v_e === (sp.lineCells[v_L][(_i9 + 2)] ?? -1)), ((v_e !== -1) && (clueAt(cl.number, v_e) === clueAt(cl.number, v_c)))], ["L in", "c in", "e =", "where of e"]);
        }
        facts.length = 0;
        changed = false;
        const _t13 = (sp.lineCells[v_L][(_i9 + 1)] ?? -1);
        if (!(b.grid[_t13] !== 0)) { if (fire === null) { b.placeAt(_t13, 2); changed = true; } else facts.push(PLACE, _t13, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, c: v_c, e: v_e }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface PairBinding {
  L: number;
  c: number;
  q: number;
}

const pairFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  const _a6 = sp.lines;
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_L = _a6[_i7];
    const _a8 = sp.lineCells[v_L];
    for (let _i9 = 0; _i9 < _a8.length; _i9++) {
      const v_c = _a8[_i9];
      const _h12 = clueAt(cl.number, v_c);
      L10: {
        const v_q = (sp.lineCells[v_L][(_i9 + 1)] ?? -1);
        const _h11 = clueAt(cl.number, v_q);
        if (!(((v_q !== -1) && (_h11 === _h12)))) break L10;
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("pair", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), (v_q === (sp.lineCells[v_L][(_i9 + 1)] ?? -1)), ((v_q !== -1) && (clueAt(cl.number, v_q) === clueAt(cl.number, v_c)))], ["L in", "c in", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        let _q13 = true;
        Q14: {
          const _a15 = sp.lineCells[v_L];
          for (let _i16 = 0; _i16 < _a15.length; _i16++) {
            const v_p = _a15[_i16];
            const _h17 = clueAt(cl.number, v_p);
            if (!((((v_p !== v_c) && (v_p !== v_q)) && (_h17 === _h12)))) continue;
            if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
            if (!(true)) {
              _q13 = false;
              break Q14;
            }
          }
        }
        if (!(_q13)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, c: v_c, q: v_q }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CornerBinding {
  c: number;
  s: number;
  t: number;
  i: number;
  n: number;
  ns: number;
  nt: number;
  ni: number;
}

const cornerFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function corner(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CornerBinding> | null): number {
  const facts = cornerFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    if (!((sp.adj4[v_c].length === 2))) continue;
    const _h17 = clueAt(cl.number, v_c);
    const _t11 = sp.adj4[v_c];
    const v_s = (_t11.length > 0 ? _t11[0] : -1);
    const _h18 = clueAt(cl.number, v_s);
    const v_t = (sp.adj4[v_c][1] ?? -1);
    const _h19 = clueAt(cl.number, v_t);
    let _g12 = -1;
    let _n14 = 0;
    G13: {
      const _a15 = sp.adj4[v_s];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_p = _a15[_i16];
        if (!(((v_p !== v_c) && (sp.adj4[v_t].includes(v_p))))) continue;
        if (++_n14 === 2) {
          _g12 = -1;
          break G13;
        }
        _g12 = v_p;
      }
    }
    const v_i = _g12;
    const _h20 = clueAt(cl.number, v_i);
    const v_n = _h17;
    const v_ns = _h18;
    const v_nt = _h19;
    const v_ni = _h20;
    if (import.meta.env.DEV && staleChecking) {
      const _t21 = sp.adj4[v_c];
      let _g22 = -1;
      let _n24 = 0;
      G23: {
        const _a25 = sp.adj4[v_s];
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_p = _a25[_i26];
          if (!(((v_p !== v_c) && (sp.adj4[v_t].includes(v_p))))) continue;
          if (++_n24 === 2) {
            _g22 = -1;
            break G23;
          }
          _g22 = v_p;
        }
      }
      freshBinding("corner", [(sp.cells.includes(v_c)), (sp.adj4[v_c].length === 2), (v_s === (_t21.length > 0 ? _t21[0] : -1)), (v_t === (sp.adj4[v_c][1] ?? -1)), (v_i === _g22), (v_n === clueAt(cl.number, v_c)), (v_ns === clueAt(cl.number, v_s)), (v_nt === clueAt(cl.number, v_t)), (v_ni === clueAt(cl.number, v_i))], ["c in", "where of c", "s =", "t =", "i =", "n =", "ns =", "nt =", "ni ="]);
    }
    facts.length = 0;
    changed = false;
    let _c27: boolean = ((v_ns !== v_n) || (v_nt !== v_n));
    if (!_c27) {
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
      _c27 = true;
    }
    let _c29: boolean = _c27;
    if (_c29) {
      let _c28: boolean = ((v_ns !== v_nt) || (v_ni !== v_nt));
      if (!_c28) {
        if (!(b.grid[v_i] !== 0)) { if (fire === null) { b.placeAt(v_i, 1); changed = true; } else facts.push(PLACE, v_i, 1); }
        _c28 = true;
      }
      _c29 = _c28;
    }
    let _c34: boolean = _c29;
    if (_c34) {
      let _c33: boolean = (((v_ns === v_n) && (v_nt === v_n)) || ((v_ns === v_nt) && (v_ni === v_nt)));
      if (!_c33) {
        let _c30: boolean = ((v_ns !== v_n) && (v_ns !== v_ni));
        if (!_c30) {
          if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, 2); changed = true; } else facts.push(PLACE, v_t, 2); }
          _c30 = true;
        }
        let _c32: boolean = _c30;
        if (_c32) {
          let _c31: boolean = (((v_ns === v_n) || (v_ns === v_ni)) || ((v_nt !== v_n) && (v_nt !== v_ni)));
          if (!_c31) {
            if (!(b.grid[v_s] !== 0)) { if (fire === null) { b.placeAt(v_s, 2); changed = true; } else facts.push(PLACE, v_s, 2); }
            _c31 = true;
          }
          _c32 = _c31;
        }
        _c33 = _c32;
      }
      _c34 = _c33;
    }
    if (!(_c34)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c, s: v_s, t: v_t, i: v_i, n: v_n, ns: v_ns, nt: v_nt, ni: v_ni }, facts)) return 1;
    }
  }
  return fired;
}

export interface BoxedInBinding {
  c: number;
  F: readonly number[];
}

const boxedInFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function boxedIn(b: Marks, sp: GridSpace, fire: Fire<BoxedInBinding> | null): number {
  const _g11: number[] = [];
  const facts = boxedInFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    if (!(((b.grid[v_c] || -1) !== 1))) continue;
    _g11.length = 0;
    G12: {
      const _a15 = sp.adj4[v_c];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_p = _a15[_i16];
        if (!(((b.grid[v_p] || -1) !== 1))) continue;
        _g11.push(v_p);
      }
    }
    const v_F = _g11;
    const _h23 = v_F.length;
    if (import.meta.env.DEV && staleChecking) {
      const _g17: number[] = [];
      G18: {
        const _a21 = sp.adj4[v_c];
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_p = _a21[_i22];
          if (!(((b.grid[v_p] || -1) !== 1))) continue;
          _g17.push(v_p);
        }
      }
      freshBinding("boxedIn", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) !== 1), sameSet(v_F, _g17)], ["c in", "where of c", "F ="]);
    }
    facts.length = 0;
    changed = false;
    let _c26: boolean = (_h23 > 0);
    if (_c26) {
      let _c25: boolean = (_h23 > 1);
      if (!_c25) {
        const _t24 = (v_F.length > 0 ? v_F[0] : -1);
        if (!(b.grid[_t24] !== 0)) { if (fire === null) { b.placeAt(_t24, 2); changed = true; } else facts.push(PLACE, _t24, 2); }
        _c25 = true;
      }
      _c26 = _c25;
    }
    if (!(_c26)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c, F: v_F.slice() }, facts)) return 1;
    }
  }
  return fired;
}

export interface OffsetBinding {
  a: number;
  n: number;
  b: number;
  m: number;
  L: number;
  a1: number;
  b1: number;
}

const offsetFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function offset(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OffsetBinding> | null): number {
  const facts = offsetFacts;
  let fired = 0;
  let changed = false;
  const _a16 = sp.cells;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_a = _a16[_i17];
    const _h18 = clueAt(cl.number, v_a);
    const _h22 = sp.colOf[v_a];
    const _h23 = sp.rowOf[v_a];
    const v_n = _h18;
    const _a19 = sp.adj8[v_a];
    for (let _i20 = 0; _i20 < _a19.length; _i20++) {
      const v_b = _a19[_i20];
      if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
      const _h21 = clueAt(cl.number, v_b);
      const _h33 = (v_b % sp.w);
      const _h34 = ((v_b / sp.w) | 0);
      const v_m = _h21;
      for (let _i24 = 0; _i24 < 2; _i24++) {
        const v_L = _i24 === 0 ? _h22 : _h23;
        if (_i24 === 1 && (v_L === _h22)) continue;
        const _a25 = sp.lineCells[v_L];
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_a1 = _a25[_i26];
          const _h27 = clueAt(cl.number, v_a1);
          if (!((((v_a1 !== v_a) && !(sp.adj4[v_b].includes(v_a1))) && (_h27 === v_n)))) continue;
          let _g28 = -1;
          let _n30 = 0;
          G29: {
            const _a31 = sp.adj4[v_a1];
            for (let _i32 = 0; _i32 < _a31.length; _i32++) {
              const v_p = _a31[_i32];
              if (!((!(sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) === _h33) || (((v_p / sp.w) | 0) === _h34))))) continue;
              if (++_n30 === 2) {
                _g28 = -1;
                break G29;
              }
              _g28 = v_p;
            }
          }
          L35: {
            const v_b1 = _g28;
            const _h36 = clueAt(cl.number, v_b1);
            if (!((_h36 === v_m))) break L35;
            if (import.meta.env.DEV && staleChecking) {
              let _g37 = -1;
              let _n39 = 0;
              G38: {
                const _a40 = sp.adj4[v_a1];
                for (let _i41 = 0; _i41 < _a40.length; _i41++) {
                  const v_p = _a40[_i41];
                  if (!((!(sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) === (v_b % sp.w)) || (((v_p / sp.w) | 0) === ((v_b / sp.w) | 0)))))) continue;
                  if (++_n39 === 2) {
                    _g37 = -1;
                    break G38;
                  }
                  _g37 = v_p;
                }
              }
              freshBinding("offset", [(sp.cells.includes(v_a)), (v_n === clueAt(cl.number, v_a)), (sp.adj8[v_a].includes(v_b)), !(sp.adj4[v_a].includes(v_b)), (v_m === clueAt(cl.number, v_b)), ((v_L === sp.colOf[v_a]) || (v_L === sp.rowOf[v_a])), (sp.lineCells[v_L].includes(v_a1)), (((v_a1 !== v_a) && !(sp.adj4[v_b].includes(v_a1))) && (clueAt(cl.number, v_a1) === v_n)), (v_b1 === _g37), (clueAt(cl.number, v_b1) === v_m)], ["a in", "n =", "b in", "where of b", "m =", "L in", "a1 in", "where of a1", "b1 =", "where of b1"]);
            }
            facts.length = 0;
            changed = false;
            let _q42 = true;
            Q43: {
              const _a44 = sp.adj4[v_a];
              for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                const v_p = _a44[_i45];
                if (!((sp.adj4[v_b].includes(v_p)))) continue;
                if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                if (!(true)) {
                  _q42 = false;
                  break Q43;
                }
              }
            }
            if (!(_q42)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ a: v_a, n: v_n, b: v_b, m: v_m, L: v_L, a1: v_a1, b1: v_b1 }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface SplitBinding {
  K: readonly number[];
  c: number;
}

const splitFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function split(b: Marks, sp: GridSpace, fire: Fire<SplitBinding> | null): number {
  const _g9: number[] = [];
  const _g17: number[] = [];
  const facts = splitFacts;
  let fired = 0;
  let changed = false;
  const _m29_0 = b.made[0];
  _g9.length = 0;
  G10: {
    const _a13 = sp.cells;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_c = _a13[_i14];
      if (!(((b.grid[v_c] || -1) !== 1))) continue;
      _g9.push(v_c);
    }
  }
  const v_K = cuts(sp, _g9);
  const _a15 = v_K;
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_c = _a15[_i16];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    if (b.made[0] !== _m29_0) {
      _g17.length = 0;
      G18: {
        const _a21 = sp.cells;
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_c = _a21[_i22];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g17.push(v_c);
        }
      }
      if (!(sameSet(v_K, cuts(sp, _g17)))) { return fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
      const _g23: number[] = [];
      G24: {
        const _a27 = sp.cells;
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_c = _a27[_i28];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g23.push(v_c);
        }
      }
      freshBinding("split", [sameSet(v_K, cuts(sp, _g23)), (v_K.includes(v_c)), !((b.grid[v_c] !== 0))], ["K =", "c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ K: v_K.slice(), c: v_c }, facts)) return 1;
    }
  }
  return fired;
}
