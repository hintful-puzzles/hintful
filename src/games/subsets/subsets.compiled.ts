// Compiled by `npm run describe` from src/games/subsets/subsets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, least, popcount, rangeMask } from "../../engine/describe-runtime.ts";

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
  let _g188 = true;
  const _s190: number[] = [];
  G189: {
    const _a191 = sp.cells;
    for (let _i192 = 0; _i192 < _a191.length; _i192++) {
      const v_c = _a191[_i192];
      const _h193 = (g[v_c] || -1);
      if (_s190.includes(_h193)) {
        _g188 = false;
        break G189;
      }
      _s190.push(_h193);
    }
  }
  if (!(_g188)) return false;
  for (let _k194 = 0; _k194 < cl.shoe.at.length; _k194++) {
    const _at195 = cl.shoe.at[_k194];
    const _v196 = cl.shoe.v[_k194];
    const _t197 = (g[sp.edgeEnds[2 * _at195]] || -1);
    const _t198 = (g[sp.edgeEnds[2 * _at195 + 1]] || -1);
    let _c201: boolean = ((_v196 === 1) === ((_t197 !== _t198) && ((Math.max(0, (_t198 - 1)) & ~Math.max(0, (_t197 - 1))) === 0)));
    if (_c201) {
      const _t199 = (g[sp.edgeEnds[2 * _at195 + 1]] || -1);
      const _t200 = (g[sp.edgeEnds[2 * _at195]] || -1);
      _c201 = ((_v196 === 2) === ((_t199 !== _t200) && ((Math.max(0, (_t200 - 1)) & ~Math.max(0, (_t199 - 1))) === 0)));
    }
    if (!(_c201)) return false;
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
  const _h39 = (16 - 1);
  const _h40 = Math.max(0, _h39);
  const _h41 = _h40;
  if (carryInCands.length < sp.cells.length) carryInCands = new Int32Array(sp.cells.length);
  const cands = carryInCands;
  cands.fill(-1);
  const _a24 = sp.edges;
  for (let _i25 = 0; _i25 < _a24.length; _i25++) {
    const v_e = _a24[_i25];
    const _h28 = clueAt(cl.shoe, v_e);
    const _h29 = (_h28 === 1);
    const _h30 = sp.edgeEnds[2 * v_e];
    const _h31 = (_h28 === 2);
    const _h32 = sp.edgeEnds[2 * v_e + 1];
    const _a26 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i27 = 0; _i27 < _a26.length; _i27++) {
      const v_a = _a26[_i27];
      if (!(((_h29 && (v_a === _h30)) || (_h31 && (v_a === _h32))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g33 = 0;
      G34: {
        for (let _m42 = _h41; _m42 !== 0; _m42 &= _m42 - 1) {
          const v_l = 31 - Math.clz32(_m42 & -_m42);
          let _q43 = true;
          Q44: {
            for (let _m45 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m45 !== 0; _m45 &= _m45 - 1) {
              const v_u = 31 - Math.clz32(_m45 & -_m45);
              if (!((((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                _q43 = false;
                break Q44;
              }
            }
          }
          if (!(_q43)) continue;
          _g33 |= 1 << v_l;
        }
      }
      const v_K = _g33;
      facts.length = 0;
      changed = false;
      let _q46 = true;
      Q47: {
        for (let _m48 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m48 !== 0; _m48 &= _m48 - 1) {
          const v_d = 31 - Math.clz32(_m48 & -_m48);
          if (!(!(((v_K & ~Math.max(0, (v_d - 1))) === 0)))) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q46 = false;
            break Q47;
          }
        }
      }
      if (!(_q46)) return -1;
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
  const _h78 = (16 - 1);
  const _h79 = Math.max(0, _h78);
  const _h80 = _h79;
  if (carryOutCands.length < sp.cells.length) carryOutCands = new Int32Array(sp.cells.length);
  const cands = carryOutCands;
  cands.fill(-1);
  const _a63 = sp.edges;
  for (let _i64 = 0; _i64 < _a63.length; _i64++) {
    const v_e = _a63[_i64];
    const _h67 = clueAt(cl.shoe, v_e);
    const _h68 = (_h67 === 1);
    const _h69 = sp.edgeEnds[2 * v_e];
    const _h70 = (_h67 === 2);
    const _h71 = sp.edgeEnds[2 * v_e + 1];
    const _a65 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i66 = 0; _i66 < _a65.length; _i66++) {
      const v_a = _a65[_i66];
      if (!(((_h68 && (v_a === _h69)) || (_h70 && (v_a === _h71))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g72 = 0;
      G73: {
        for (let _m81 = _h80; _m81 !== 0; _m81 &= _m81 - 1) {
          const v_l = 31 - Math.clz32(_m81 & -_m81);
          let _q82 = true;
          Q83: {
            for (let _m84 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m84 !== 0; _m84 &= _m84 - 1) {
              const v_u = 31 - Math.clz32(_m84 & -_m84);
              if (!(!(((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                _q82 = false;
                break Q83;
              }
            }
          }
          if (!(_q82)) continue;
          _g72 |= 1 << v_l;
        }
      }
      const v_L = _g72;
      facts.length = 0;
      changed = false;
      let _q85 = true;
      Q86: {
        for (let _m87 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m87 !== 0; _m87 &= _m87 - 1) {
          const v_d = 31 - Math.clz32(_m87 & -_m87);
          if (!(((v_L & Math.max(0, (v_d - 1))) !== 0))) continue;
          if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
          if (!(true)) {
            _q85 = false;
            break Q86;
          }
        }
      }
      if (!(_q85)) return -1;
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
  const _h101 = (16 - 1);
  const _h102 = Math.max(0, _h101);
  const _h103 = _h102;
  if (noShoeCands.length < sp.cells.length) noShoeCands = new Int32Array(sp.cells.length);
  const cands = noShoeCands;
  cands.fill(-1);
  const _a92 = sp.edges;
  for (let _i93 = 0; _i93 < _a92.length; _i93++) {
    const v_e = _a92[_i93];
    const _h94 = clueAt(cl.shoe, v_e);
    if (!((_h94 === 0))) continue;
    const _a95 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i96 = 0; _i96 < _a95.length; _i96++) {
      const v_c = _a95[_i96];
      facts.length = 0;
      changed = false;
      let _q97 = true;
      Q98: {
        for (let _m99 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m99 !== 0; _m99 &= _m99 - 1) {
          const v_d = 31 - Math.clz32(_m99 & -_m99);
          const _h100 = popcount(Math.max(0, (v_d - 1)));
          if (!(((_h100 === 0) || (Math.max(0, (v_d - 1)) === _h103)))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q97 = false;
            break Q98;
          }
        }
      }
      if (!(_q97)) return -1;
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
  const _a108 = sp.edges;
  for (let _i109 = 0; _i109 < _a108.length; _i109++) {
    const v_e = _a108[_i109];
    const _h110 = clueAt(cl.shoe, v_e);
    if (!((_h110 === 0))) continue;
    const _a111 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i112 = 0; _i112 < _a111.length; _i112++) {
      const v_k = _a111[_i112];
      if (!((popcount((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k]))) === 1))) continue;
      const v_c = (sp.edgeEnds[2 * v_e] === v_k ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      const v_x = least((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])));
      const _h116 = (v_x - 1);
      const _h117 = Math.max(0, _h116);
      const _h118 = _h117;
      facts.length = 0;
      changed = false;
      let _q113 = true;
      Q114: {
        for (let _m115 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m115 !== 0; _m115 &= _m115 - 1) {
          const v_d = 31 - Math.clz32(_m115 & -_m115);
          if (!((((Math.max(0, (v_d - 1)) & ~_h118) === 0) || ((_h118 & ~Math.max(0, (v_d - 1))) === 0)))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q113 = false;
            break Q114;
          }
        }
      }
      if (!(_q113)) return -1;
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
  const _a121 = sp.cells;
  for (let _i122 = 0; _i122 < _a121.length; _i122++) {
    const v_c = _a121[_i122];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c124: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c124) {
      const _t123 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t123); changed = true; } else facts.push(PLACE, v_c, _t123); }
      _c124 = true;
    }
    if (!(_c124)) return -1;
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
  const _g134: number[] = [];
  const facts = onlyCellFacts;
  let fired = 0;
  let changed = false;
  for (let _m133 = b.domain; _m133 !== 0; _m133 &= _m133 - 1) {
    const v_d = 31 - Math.clz32(_m133 & -_m133);
    _g134.length = 0;
    G135: {
      const _a138 = sp.cells;
      for (let _i139 = 0; _i139 < _a138.length; _i139++) {
        const v_c = _a138[_i139];
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        _g134.push(v_c);
      }
    }
    L140: {
      const v_C = _g134;
      const _h141 = v_C.length;
      if (!(((_h141 < 2) && ((_h141 === 0) || !((b.grid[(v_C.length > 0 ? v_C[0] : -1)] !== 0)))))) break L140;
      facts.length = 0;
      changed = false;
      let _c143: boolean = (_h141 === 1);
      if (_c143) {
        const _t142 = (v_C.length > 0 ? v_C[0] : -1);
        if (!(b.grid[_t142] !== 0)) { if (fire === null) { b.placeAt(_t142, v_d); changed = true; } else facts.push(PLACE, _t142, v_d); }
        _c143 = true;
      }
      if (!(_c143)) return -1;
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
  const _a148 = sp.edges;
  for (let _i149 = 0; _i149 < _a148.length; _i149++) {
    const v_e = _a148[_i149];
    const _h152 = clueAt(cl.shoe, v_e);
    const _h153 = (_h152 === 1);
    const _h154 = sp.edgeEnds[2 * v_e];
    const _h155 = (_h152 === 2);
    const _h156 = sp.edgeEnds[2 * v_e + 1];
    const _a150 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i151 = 0; _i151 < _a150.length; _i151++) {
      const v_a = _a150[_i151];
      if (!(((_h153 && (v_a === _h154)) || (_h155 && (v_a === _h156))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      facts.length = 0;
      changed = false;
      let _q157 = true;
      Q158: {
        for (let _m159 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m159 !== 0; _m159 &= _m159 - 1) {
          const v_d = 31 - Math.clz32(_m159 & -_m159);
          const _h163 = (v_d - 1);
          const _h164 = Math.max(0, _h163);
          const _h165 = _h164;
          let _q160 = false;
          Q161: {
            for (let _m162 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m162 !== 0; _m162 &= _m162 - 1) {
              const v_u = 31 - Math.clz32(_m162 & -_m162);
              if (((v_d !== v_u) && ((Math.max(0, (v_u - 1)) & ~_h165) === 0))) {
                _q160 = true;
                break Q161;
              }
            }
          }
          if (!(!(_q160))) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q157 = false;
            break Q158;
          }
        }
      }
      if (!(_q157)) return -1;
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
  const _a170 = sp.edges;
  for (let _i171 = 0; _i171 < _a170.length; _i171++) {
    const v_e = _a170[_i171];
    const _h174 = clueAt(cl.shoe, v_e);
    const _h175 = (_h174 === 1);
    const _h176 = sp.edgeEnds[2 * v_e];
    const _h177 = (_h174 === 2);
    const _h178 = sp.edgeEnds[2 * v_e + 1];
    const _a172 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i173 = 0; _i173 < _a172.length; _i173++) {
      const v_a = _a172[_i173];
      if (!(((_h175 && (v_a === _h176)) || (_h177 && (v_a === _h178))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      facts.length = 0;
      changed = false;
      let _q179 = true;
      Q180: {
        for (let _m181 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m181 !== 0; _m181 &= _m181 - 1) {
          const v_d = 31 - Math.clz32(_m181 & -_m181);
          const _h185 = (v_d - 1);
          const _h186 = Math.max(0, _h185);
          const _h187 = _h186;
          let _q182 = false;
          Q183: {
            for (let _m184 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m184 !== 0; _m184 &= _m184 - 1) {
              const v_u = 31 - Math.clz32(_m184 & -_m184);
              if (((v_u !== v_d) && ((_h187 & ~Math.max(0, (v_u - 1))) === 0))) {
                _q182 = true;
                break Q183;
              }
            }
          }
          if (!(!(_q182))) continue;
          if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
          if (!(true)) {
            _q179 = false;
            break Q180;
          }
        }
      }
      if (!(_q179)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
