// Compiled by `npm run describe` from src/games/subsets/subsets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, freshBinding, least, popcount, rangeMask, sameSet, staleChecking } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  shoe: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "carryIn" | "carryOut" | "noShoe" | "noShoeBeside" | "lone" | "onlyCell" | "smaller" | "bigger";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "placed" },
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
  { id: "carryIn", tier: 0 },
  { id: "carryOut", tier: 0 },
  { id: "noShoe", tier: 0 },
  { id: "noShoeBeside", tier: 0 },
  { id: "lone", tier: 0 },
  { id: "onlyCell", tier: 0 },
  { id: "smaller", tier: 0 },
  { id: "bigger", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 16);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _g1 = true;
  const _s3: number[] = [];
  G2: {
    const _a4 = sp.cells;
    for (let _i5 = 0; _i5 < _a4.length; _i5++) {
      const v_c = _a4[_i5];
      const _h6 = (g[v_c] || -1);
      if (_s3.includes(_h6)) {
        _g1 = false;
        break G2;
      }
      _s3.push(_h6);
    }
  }
  if (!(_g1)) return false;
  for (let _k7 = 0; _k7 < cl.shoe.at.length; _k7++) {
    const _at8 = cl.shoe.at[_k7];
    const _v9 = cl.shoe.v[_k7];
    const _t10 = (g[sp.edgeEnds[2 * _at8]] || -1);
    const _t11 = (g[sp.edgeEnds[2 * _at8 + 1]] || -1);
    let _c14: boolean = ((_v9 === 1) === ((_t10 !== _t11) && ((Math.max(0, (_t11 - 1)) & ~Math.max(0, (_t10 - 1))) === 0)));
    if (_c14) {
      const _t12 = (g[sp.edgeEnds[2 * _at8 + 1]] || -1);
      const _t13 = (g[sp.edgeEnds[2 * _at8]] || -1);
      _c14 = ((_v9 === 2) === ((_t12 !== _t13) && ((Math.max(0, (_t13 - 1)) & ~Math.max(0, (_t12 - 1))) === 0)));
    }
    if (!(_c14)) return false;
  }
  return true;
}

export interface PlacedBinding {
  c: number;
  k: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (b.grid[v_c] !== 0);
  const _h9 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const _a6 = sp.cells;
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_k = _a6[_i7];
    const _h8 = (b.grid[v_k] !== 0);
    if (!(((v_k !== v_c) && !(_h8)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("placed", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (sp.cells.includes(v_k)), ((v_k !== v_c) && !((b.grid[v_k] !== 0)))], ["c in", "where of c", "k in", "where of k"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_k] >> _h9) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_k, _h9); changed = true; } else facts.push(STRIKE, v_k, _h9); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, k: v_k }, facts);
    }
  }
  return fired;
}

export interface CarryInBinding {
  e: number;
  a: number;
  b: number;
  K: number;
}

const carryInFacts: number[] = [];
let carryInCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function carryIn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CarryInBinding> | null): number {
  const facts = carryInFacts;
  let fired = 0;
  let changed = false;
  const _h30 = (16 - 1);
  const _h31 = Math.max(0, _h30);
  const _h32 = _h31;
  if (carryInCands.length < sp.cells.length) carryInCands = new Int32Array(sp.cells.length);
  const cands = carryInCands;
  cands.fill(-1);
  const _a15 = sp.edges;
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_e = _a15[_i16];
    const _h19 = clueAt(cl.shoe, v_e);
    const _h20 = (_h19 === 1);
    const _h21 = sp.edgeEnds[2 * v_e];
    const _h22 = (_h19 === 2);
    const _h23 = sp.edgeEnds[2 * v_e + 1];
    const _a17 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_a = _a17[_i18];
      if (!(((_h20 && (v_a === _h21)) || (_h22 && (v_a === _h23))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g24 = 0;
      G25: {
        for (let _m33 = _h32; _m33 !== 0; _m33 &= _m33 - 1) {
          const v_l = 31 - Math.clz32(_m33 & -_m33);
          let _q34 = true;
          Q35: {
            for (let _m36 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m36 !== 0; _m36 &= _m36 - 1) {
              const v_u = 31 - Math.clz32(_m36 & -_m36);
              if (!((((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                _q34 = false;
                break Q35;
              }
            }
          }
          if (!(_q34)) continue;
          _g24 |= 1 << v_l;
        }
      }
      const v_K = _g24;
      if (import.meta.env.DEV && staleChecking) {
        let _g37 = 0;
        G38: {
          for (let _m43 = Math.max(0, (16 - 1)); _m43 !== 0; _m43 &= _m43 - 1) {
            const v_l = 31 - Math.clz32(_m43 & -_m43);
            let _q44 = true;
            Q45: {
              for (let _m46 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m46 !== 0; _m46 &= _m46 - 1) {
                const v_u = 31 - Math.clz32(_m46 & -_m46);
                if (!((((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                  _q44 = false;
                  break Q45;
                }
              }
            }
            if (!(_q44)) continue;
            _g37 |= 1 << v_l;
          }
        }
        freshBinding("carryIn", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_K === _g37)], ["e in", "a in", "where of a", "b =", "K ="]);
      }
      facts.length = 0;
      changed = false;
      let _q47 = true;
      Q48: {
        for (let _m49 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m49 !== 0; _m49 &= _m49 - 1) {
          const v_d = 31 - Math.clz32(_m49 & -_m49);
          if (!(!(((v_K & ~Math.max(0, (v_d - 1))) === 0)))) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q47 = false;
            break Q48;
          }
        }
      }
      if (!(_q47)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, K: v_K }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface CarryOutBinding {
  e: number;
  a: number;
  b: number;
  L: number;
}

const carryOutFacts: number[] = [];
let carryOutCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function carryOut(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CarryOutBinding> | null): number {
  const facts = carryOutFacts;
  let fired = 0;
  let changed = false;
  const _h30 = (16 - 1);
  const _h31 = Math.max(0, _h30);
  const _h32 = _h31;
  if (carryOutCands.length < sp.cells.length) carryOutCands = new Int32Array(sp.cells.length);
  const cands = carryOutCands;
  cands.fill(-1);
  const _a15 = sp.edges;
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_e = _a15[_i16];
    const _h19 = clueAt(cl.shoe, v_e);
    const _h20 = (_h19 === 1);
    const _h21 = sp.edgeEnds[2 * v_e];
    const _h22 = (_h19 === 2);
    const _h23 = sp.edgeEnds[2 * v_e + 1];
    const _a17 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_a = _a17[_i18];
      if (!(((_h20 && (v_a === _h21)) || (_h22 && (v_a === _h23))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g24 = 0;
      G25: {
        for (let _m33 = _h32; _m33 !== 0; _m33 &= _m33 - 1) {
          const v_l = 31 - Math.clz32(_m33 & -_m33);
          let _q34 = true;
          Q35: {
            for (let _m36 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m36 !== 0; _m36 &= _m36 - 1) {
              const v_u = 31 - Math.clz32(_m36 & -_m36);
              if (!(!(((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                _q34 = false;
                break Q35;
              }
            }
          }
          if (!(_q34)) continue;
          _g24 |= 1 << v_l;
        }
      }
      const v_L = _g24;
      if (import.meta.env.DEV && staleChecking) {
        let _g37 = 0;
        G38: {
          for (let _m43 = Math.max(0, (16 - 1)); _m43 !== 0; _m43 &= _m43 - 1) {
            const v_l = 31 - Math.clz32(_m43 & -_m43);
            let _q44 = true;
            Q45: {
              for (let _m46 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m46 !== 0; _m46 &= _m46 - 1) {
                const v_u = 31 - Math.clz32(_m46 & -_m46);
                if (!(!(((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                  _q44 = false;
                  break Q45;
                }
              }
            }
            if (!(_q44)) continue;
            _g37 |= 1 << v_l;
          }
        }
        freshBinding("carryOut", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_L === _g37)], ["e in", "a in", "where of a", "b =", "L ="]);
      }
      facts.length = 0;
      changed = false;
      let _q47 = true;
      Q48: {
        for (let _m49 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m49 !== 0; _m49 &= _m49 - 1) {
          const v_d = 31 - Math.clz32(_m49 & -_m49);
          if (!(((v_L & Math.max(0, (v_d - 1))) !== 0))) continue;
          if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
          if (!(true)) {
            _q47 = false;
            break Q48;
          }
        }
      }
      if (!(_q47)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, L: v_L }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface NoShoeBinding {
  e: number;
  c: number;
}

const noShoeFacts: number[] = [];
let noShoeCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function noShoe(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NoShoeBinding> | null): number {
  const facts = noShoeFacts;
  let fired = 0;
  let changed = false;
  const _h14 = (16 - 1);
  const _h15 = Math.max(0, _h14);
  const _h16 = _h15;
  if (noShoeCands.length < sp.cells.length) noShoeCands = new Int32Array(sp.cells.length);
  const cands = noShoeCands;
  cands.fill(-1);
  const _a5 = sp.edges;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_e = _a5[_i6];
    const _h7 = clueAt(cl.shoe, v_e);
    if (!((_h7 === 0))) continue;
    const _a8 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i9 = 0; _i9 < _a8.length; _i9++) {
      const v_c = _a8[_i9];
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("noShoe", [(sp.edges.includes(v_e)), (clueAt(cl.shoe, v_e) === 0), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_c))], ["e in", "where of e", "c in"]);
      }
      facts.length = 0;
      changed = false;
      let _q10 = true;
      Q11: {
        for (let _m12 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m12 !== 0; _m12 &= _m12 - 1) {
          const v_d = 31 - Math.clz32(_m12 & -_m12);
          const _h13 = popcount(Math.max(0, (v_d - 1)));
          if (!(((_h13 === 0) || (Math.max(0, (v_d - 1)) === _h16)))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q10 = false;
            break Q11;
          }
        }
      }
      if (!(_q10)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, c: v_c }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface NoShoeBesideBinding {
  e: number;
  k: number;
  c: number;
  x: number;
}

const noShoeBesideFacts: number[] = [];
let noShoeBesideCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function noShoeBeside(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NoShoeBesideBinding> | null): number {
  const facts = noShoeBesideFacts;
  let fired = 0;
  let changed = false;
  if (noShoeBesideCands.length < sp.cells.length) noShoeBesideCands = new Int32Array(sp.cells.length);
  const cands = noShoeBesideCands;
  cands.fill(-1);
  const _a5 = sp.edges;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_e = _a5[_i6];
    const _h7 = clueAt(cl.shoe, v_e);
    if (!((_h7 === 0))) continue;
    const _a8 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i9 = 0; _i9 < _a8.length; _i9++) {
      const v_k = _a8[_i9];
      if (!((popcount((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k]))) === 1))) continue;
      const v_c = (sp.edgeEnds[2 * v_e] === v_k ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      const v_x = least((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])));
      const _h13 = (v_x - 1);
      const _h14 = Math.max(0, _h13);
      const _h15 = _h14;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("noShoeBeside", [(sp.edges.includes(v_e)), (clueAt(cl.shoe, v_e) === 0), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_k)), (popcount((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k]))) === 1), (v_c === (sp.edgeEnds[2 * v_e] === v_k ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_x === least((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k]))))], ["e in", "where of e", "k in", "where of k", "c =", "x ="]);
      }
      facts.length = 0;
      changed = false;
      let _q10 = true;
      Q11: {
        for (let _m12 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m12 !== 0; _m12 &= _m12 - 1) {
          const v_d = 31 - Math.clz32(_m12 & -_m12);
          if (!((((Math.max(0, (v_d - 1)) & ~_h15) === 0) || ((_h15 & ~Math.max(0, (v_d - 1))) === 0)))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q10 = false;
            break Q11;
          }
        }
      }
      if (!(_q10)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, k: v_k, c: v_c, x: v_x }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface LoneBinding {
  c: number;
}

const loneFacts: number[] = [];
let loneCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function lone(b: Marks, sp: GridSpace, fire: Fire<LoneBinding> | null): number {
  const facts = loneFacts;
  let fired = 0;
  let changed = false;
  if (loneCands.length < sp.cells.length) loneCands = new Int32Array(sp.cells.length);
  const cands = loneCands;
  cands.fill(-1);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("lone", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c6: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c6) {
      const _t5 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t5); changed = true; } else facts.push(PLACE, v_c, _t5); }
      _c6 = true;
    }
    if (!(_c6)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface OnlyCellBinding {
  d: number;
  C: readonly number[];
}

const onlyCellFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyCell(b: Marks, sp: GridSpace, fire: Fire<OnlyCellBinding> | null): number {
  const _g10: number[] = [];
  const facts = onlyCellFacts;
  let fired = 0;
  let changed = false;
  for (let _m9 = b.domain; _m9 !== 0; _m9 &= _m9 - 1) {
    const v_d = 31 - Math.clz32(_m9 & -_m9);
    _g10.length = 0;
    G11: {
      const _a14 = sp.cells;
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_c = _a14[_i15];
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        _g10.push(v_c);
      }
    }
    L16: {
      const v_C = _g10;
      const _h17 = v_C.length;
      if (!(((_h17 < 2) && ((_h17 === 0) || !((b.grid[(v_C.length > 0 ? v_C[0] : -1)] !== 0)))))) break L16;
      if (import.meta.env.DEV && staleChecking) {
        const _g18: number[] = [];
        G19: {
          const _a22 = sp.cells;
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_c = _a22[_i23];
            if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
            _g18.push(v_c);
          }
        }
        freshBinding("onlyCell", [(((b.domain >> v_d) & 1) !== 0), sameSet(v_C, _g18), ((v_C.length < 2) && ((v_C.length === 0) || !((b.grid[(v_C.length > 0 ? v_C[0] : -1)] !== 0))))], ["d in", "C =", "where of C"]);
      }
      facts.length = 0;
      changed = false;
      let _c25: boolean = (_h17 === 1);
      if (_c25) {
        const _t24 = (v_C.length > 0 ? v_C[0] : -1);
        if (!(b.grid[_t24] !== 0)) { if (fire === null) { b.placeAt(_t24, v_d); changed = true; } else facts.push(PLACE, _t24, v_d); }
        _c25 = true;
      }
      if (!(_c25)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ d: v_d, C: v_C.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SmallerBinding {
  e: number;
  a: number;
  b: number;
}

const smallerFacts: number[] = [];
let smallerCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function smaller(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SmallerBinding> | null): number {
  const facts = smallerFacts;
  let fired = 0;
  let changed = false;
  if (smallerCands.length < sp.cells.length) smallerCands = new Int32Array(sp.cells.length);
  const cands = smallerCands;
  cands.fill(-1);
  const _a5 = sp.edges;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_e = _a5[_i6];
    const _h9 = clueAt(cl.shoe, v_e);
    const _h10 = (_h9 === 1);
    const _h11 = sp.edgeEnds[2 * v_e];
    const _h12 = (_h9 === 2);
    const _h13 = sp.edgeEnds[2 * v_e + 1];
    const _a7 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i8 = 0; _i8 < _a7.length; _i8++) {
      const v_a = _a7[_i8];
      if (!(((_h10 && (v_a === _h11)) || (_h12 && (v_a === _h13))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("smaller", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]))], ["e in", "a in", "where of a", "b ="]);
      }
      facts.length = 0;
      changed = false;
      let _q14 = true;
      Q15: {
        for (let _m16 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m16 !== 0; _m16 &= _m16 - 1) {
          const v_d = 31 - Math.clz32(_m16 & -_m16);
          const _h20 = (v_d - 1);
          const _h21 = Math.max(0, _h20);
          const _h22 = _h21;
          let _q17 = false;
          Q18: {
            for (let _m19 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m19 !== 0; _m19 &= _m19 - 1) {
              const v_u = 31 - Math.clz32(_m19 & -_m19);
              if (((v_d !== v_u) && ((Math.max(0, (v_u - 1)) & ~_h22) === 0))) {
                _q17 = true;
                break Q18;
              }
            }
          }
          if (!(!(_q17))) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q14 = false;
            break Q15;
          }
        }
      }
      if (!(_q14)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface BiggerBinding {
  e: number;
  a: number;
  b: number;
}

const biggerFacts: number[] = [];
let biggerCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function bigger(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BiggerBinding> | null): number {
  const facts = biggerFacts;
  let fired = 0;
  let changed = false;
  if (biggerCands.length < sp.cells.length) biggerCands = new Int32Array(sp.cells.length);
  const cands = biggerCands;
  cands.fill(-1);
  const _a5 = sp.edges;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_e = _a5[_i6];
    const _h9 = clueAt(cl.shoe, v_e);
    const _h10 = (_h9 === 1);
    const _h11 = sp.edgeEnds[2 * v_e];
    const _h12 = (_h9 === 2);
    const _h13 = sp.edgeEnds[2 * v_e + 1];
    const _a7 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i8 = 0; _i8 < _a7.length; _i8++) {
      const v_a = _a7[_i8];
      if (!(((_h10 && (v_a === _h11)) || (_h12 && (v_a === _h13))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("bigger", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]))], ["e in", "a in", "where of a", "b ="]);
      }
      facts.length = 0;
      changed = false;
      let _q14 = true;
      Q15: {
        for (let _m16 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m16 !== 0; _m16 &= _m16 - 1) {
          const v_d = 31 - Math.clz32(_m16 & -_m16);
          const _h20 = (v_d - 1);
          const _h21 = Math.max(0, _h20);
          const _h22 = _h21;
          let _q17 = false;
          Q18: {
            for (let _m19 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m19 !== 0; _m19 &= _m19 - 1) {
              const v_u = 31 - Math.clz32(_m19 & -_m19);
              if (((v_u !== v_d) && ((_h22 & ~Math.max(0, (v_u - 1))) === 0))) {
                _q17 = true;
                break Q18;
              }
            }
          }
          if (!(!(_q17))) continue;
          if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
          if (!(true)) {
            _q14 = false;
            break Q15;
          }
        }
      }
      if (!(_q14)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
