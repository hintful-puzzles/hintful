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
  let _g214 = true;
  const _s216: number[] = [];
  G215: {
    const _a217 = sp.cells;
    for (let _i218 = 0; _i218 < _a217.length; _i218++) {
      const v_c = _a217[_i218];
      const _h219 = (g[v_c] || -1);
      if (_s216.includes(_h219)) {
        _g214 = false;
        break G215;
      }
      _s216.push(_h219);
    }
  }
  if (!(_g214)) return false;
  for (let _k220 = 0; _k220 < cl.shoe.at.length; _k220++) {
    const _at221 = cl.shoe.at[_k220];
    const _v222 = cl.shoe.v[_k220];
    const _t223 = (g[sp.edgeEnds[2 * _at221]] || -1);
    const _t224 = (g[sp.edgeEnds[2 * _at221 + 1]] || -1);
    let _c227: boolean = ((_v222 === 1) === ((_t223 !== _t224) && ((Math.max(0, (_t224 - 1)) & ~Math.max(0, (_t223 - 1))) === 0)));
    if (_c227) {
      const _t225 = (g[sp.edgeEnds[2 * _at221 + 1]] || -1);
      const _t226 = (g[sp.edgeEnds[2 * _at221]] || -1);
      _c227 = ((_v222 === 2) === ((_t225 !== _t226) && ((Math.max(0, (_t226 - 1)) & ~Math.max(0, (_t225 - 1))) === 0)));
    }
    if (!(_c227)) return false;
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
      if (import.meta.env.DEV && staleChecking) {
        let _g46 = 0;
        G47: {
          for (let _m52 = Math.max(0, (16 - 1)); _m52 !== 0; _m52 &= _m52 - 1) {
            const v_l = 31 - Math.clz32(_m52 & -_m52);
            let _q53 = true;
            Q54: {
              for (let _m55 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m55 !== 0; _m55 &= _m55 - 1) {
                const v_u = 31 - Math.clz32(_m55 & -_m55);
                if (!((((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                  _q53 = false;
                  break Q54;
                }
              }
            }
            if (!(_q53)) continue;
            _g46 |= 1 << v_l;
          }
        }
        freshBinding("carryIn", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_K === _g46)], ["e in", "a in", "where of a", "b =", "K ="]);
      }
      facts.length = 0;
      changed = false;
      let _q56 = true;
      Q57: {
        for (let _m58 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m58 !== 0; _m58 &= _m58 - 1) {
          const v_d = 31 - Math.clz32(_m58 & -_m58);
          if (!(!(((v_K & ~Math.max(0, (v_d - 1))) === 0)))) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q56 = false;
            break Q57;
          }
        }
      }
      if (!(_q56)) return -1;
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
  const _h88 = (16 - 1);
  const _h89 = Math.max(0, _h88);
  const _h90 = _h89;
  if (carryOutCands.length < sp.cells.length) carryOutCands = new Int32Array(sp.cells.length);
  const cands = carryOutCands;
  cands.fill(-1);
  const _a73 = sp.edges;
  for (let _i74 = 0; _i74 < _a73.length; _i74++) {
    const v_e = _a73[_i74];
    const _h77 = clueAt(cl.shoe, v_e);
    const _h78 = (_h77 === 1);
    const _h79 = sp.edgeEnds[2 * v_e];
    const _h80 = (_h77 === 2);
    const _h81 = sp.edgeEnds[2 * v_e + 1];
    const _a75 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i76 = 0; _i76 < _a75.length; _i76++) {
      const v_a = _a75[_i76];
      if (!(((_h78 && (v_a === _h79)) || (_h80 && (v_a === _h81))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g82 = 0;
      G83: {
        for (let _m91 = _h90; _m91 !== 0; _m91 &= _m91 - 1) {
          const v_l = 31 - Math.clz32(_m91 & -_m91);
          let _q92 = true;
          Q93: {
            for (let _m94 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m94 !== 0; _m94 &= _m94 - 1) {
              const v_u = 31 - Math.clz32(_m94 & -_m94);
              if (!(!(((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                _q92 = false;
                break Q93;
              }
            }
          }
          if (!(_q92)) continue;
          _g82 |= 1 << v_l;
        }
      }
      const v_L = _g82;
      if (import.meta.env.DEV && staleChecking) {
        let _g95 = 0;
        G96: {
          for (let _m101 = Math.max(0, (16 - 1)); _m101 !== 0; _m101 &= _m101 - 1) {
            const v_l = 31 - Math.clz32(_m101 & -_m101);
            let _q102 = true;
            Q103: {
              for (let _m104 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m104 !== 0; _m104 &= _m104 - 1) {
                const v_u = 31 - Math.clz32(_m104 & -_m104);
                if (!(!(((Math.max(0, (v_u - 1)) >> v_l) & 1) !== 0))) {
                  _q102 = false;
                  break Q103;
                }
              }
            }
            if (!(_q102)) continue;
            _g95 |= 1 << v_l;
          }
        }
        freshBinding("carryOut", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_L === _g95)], ["e in", "a in", "where of a", "b =", "L ="]);
      }
      facts.length = 0;
      changed = false;
      let _q105 = true;
      Q106: {
        for (let _m107 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m107 !== 0; _m107 &= _m107 - 1) {
          const v_d = 31 - Math.clz32(_m107 & -_m107);
          if (!(((v_L & Math.max(0, (v_d - 1))) !== 0))) continue;
          if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
          if (!(true)) {
            _q105 = false;
            break Q106;
          }
        }
      }
      if (!(_q105)) return -1;
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
  const _h121 = (16 - 1);
  const _h122 = Math.max(0, _h121);
  const _h123 = _h122;
  if (noShoeCands.length < sp.cells.length) noShoeCands = new Int32Array(sp.cells.length);
  const cands = noShoeCands;
  cands.fill(-1);
  const _a112 = sp.edges;
  for (let _i113 = 0; _i113 < _a112.length; _i113++) {
    const v_e = _a112[_i113];
    const _h114 = clueAt(cl.shoe, v_e);
    if (!((_h114 === 0))) continue;
    const _a115 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i116 = 0; _i116 < _a115.length; _i116++) {
      const v_c = _a115[_i116];
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("noShoe", [(sp.edges.includes(v_e)), (clueAt(cl.shoe, v_e) === 0), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_c))], ["e in", "where of e", "c in"]);
      }
      facts.length = 0;
      changed = false;
      let _q117 = true;
      Q118: {
        for (let _m119 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m119 !== 0; _m119 &= _m119 - 1) {
          const v_d = 31 - Math.clz32(_m119 & -_m119);
          const _h120 = popcount(Math.max(0, (v_d - 1)));
          if (!(((_h120 === 0) || (Math.max(0, (v_d - 1)) === _h123)))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q117 = false;
            break Q118;
          }
        }
      }
      if (!(_q117)) return -1;
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
  const _a128 = sp.edges;
  for (let _i129 = 0; _i129 < _a128.length; _i129++) {
    const v_e = _a128[_i129];
    const _h130 = clueAt(cl.shoe, v_e);
    if (!((_h130 === 0))) continue;
    const _a131 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i132 = 0; _i132 < _a131.length; _i132++) {
      const v_k = _a131[_i132];
      if (!((popcount((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k]))) === 1))) continue;
      const v_c = (sp.edgeEnds[2 * v_e] === v_k ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      const v_x = least((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k])));
      const _h136 = (v_x - 1);
      const _h137 = Math.max(0, _h136);
      const _h138 = _h137;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("noShoeBeside", [(sp.edges.includes(v_e)), (clueAt(cl.shoe, v_e) === 0), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_k)), (popcount((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k]))) === 1), (v_c === (sp.edgeEnds[2 * v_e] === v_k ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_x === least((cands[v_k] >= 0 ? cands[v_k] : (cands[v_k] = b.cands[v_k]))))], ["e in", "where of e", "k in", "where of k", "c =", "x ="]);
      }
      facts.length = 0;
      changed = false;
      let _q133 = true;
      Q134: {
        for (let _m135 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m135 !== 0; _m135 &= _m135 - 1) {
          const v_d = 31 - Math.clz32(_m135 & -_m135);
          if (!((((Math.max(0, (v_d - 1)) & ~_h138) === 0) || ((_h138 & ~Math.max(0, (v_d - 1))) === 0)))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q133 = false;
            break Q134;
          }
        }
      }
      if (!(_q133)) return -1;
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
  const _a141 = sp.cells;
  for (let _i142 = 0; _i142 < _a141.length; _i142++) {
    const v_c = _a141[_i142];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("lone", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c144: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c144) {
      const _t143 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t143); changed = true; } else facts.push(PLACE, v_c, _t143); }
      _c144 = true;
    }
    if (!(_c144)) return -1;
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
  const _g154: number[] = [];
  const facts = onlyCellFacts;
  let fired = 0;
  let changed = false;
  for (let _m153 = b.domain; _m153 !== 0; _m153 &= _m153 - 1) {
    const v_d = 31 - Math.clz32(_m153 & -_m153);
    _g154.length = 0;
    G155: {
      const _a158 = sp.cells;
      for (let _i159 = 0; _i159 < _a158.length; _i159++) {
        const v_c = _a158[_i159];
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        _g154.push(v_c);
      }
    }
    L160: {
      const v_C = _g154;
      const _h161 = v_C.length;
      if (!(((_h161 < 2) && ((_h161 === 0) || !((b.grid[(v_C.length > 0 ? v_C[0] : -1)] !== 0)))))) break L160;
      if (import.meta.env.DEV && staleChecking) {
        const _g162: number[] = [];
        G163: {
          const _a166 = sp.cells;
          for (let _i167 = 0; _i167 < _a166.length; _i167++) {
            const v_c = _a166[_i167];
            if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
            _g162.push(v_c);
          }
        }
        freshBinding("onlyCell", [(((b.domain >> v_d) & 1) !== 0), sameSet(v_C, _g162), ((v_C.length < 2) && ((v_C.length === 0) || !((b.grid[(v_C.length > 0 ? v_C[0] : -1)] !== 0))))], ["d in", "C =", "where of C"]);
      }
      facts.length = 0;
      changed = false;
      let _c169: boolean = (_h161 === 1);
      if (_c169) {
        const _t168 = (v_C.length > 0 ? v_C[0] : -1);
        if (!(b.grid[_t168] !== 0)) { if (fire === null) { b.placeAt(_t168, v_d); changed = true; } else facts.push(PLACE, _t168, v_d); }
        _c169 = true;
      }
      if (!(_c169)) return -1;
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
  const _a174 = sp.edges;
  for (let _i175 = 0; _i175 < _a174.length; _i175++) {
    const v_e = _a174[_i175];
    const _h178 = clueAt(cl.shoe, v_e);
    const _h179 = (_h178 === 1);
    const _h180 = sp.edgeEnds[2 * v_e];
    const _h181 = (_h178 === 2);
    const _h182 = sp.edgeEnds[2 * v_e + 1];
    const _a176 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i177 = 0; _i177 < _a176.length; _i177++) {
      const v_a = _a176[_i177];
      if (!(((_h179 && (v_a === _h180)) || (_h181 && (v_a === _h182))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("smaller", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]))], ["e in", "a in", "where of a", "b ="]);
      }
      facts.length = 0;
      changed = false;
      let _q183 = true;
      Q184: {
        for (let _m185 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m185 !== 0; _m185 &= _m185 - 1) {
          const v_d = 31 - Math.clz32(_m185 & -_m185);
          const _h189 = (v_d - 1);
          const _h190 = Math.max(0, _h189);
          const _h191 = _h190;
          let _q186 = false;
          Q187: {
            for (let _m188 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m188 !== 0; _m188 &= _m188 - 1) {
              const v_u = 31 - Math.clz32(_m188 & -_m188);
              if (((v_d !== v_u) && ((Math.max(0, (v_u - 1)) & ~_h191) === 0))) {
                _q186 = true;
                break Q187;
              }
            }
          }
          if (!(!(_q186))) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q183 = false;
            break Q184;
          }
        }
      }
      if (!(_q183)) return -1;
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
  const _a196 = sp.edges;
  for (let _i197 = 0; _i197 < _a196.length; _i197++) {
    const v_e = _a196[_i197];
    const _h200 = clueAt(cl.shoe, v_e);
    const _h201 = (_h200 === 1);
    const _h202 = sp.edgeEnds[2 * v_e];
    const _h203 = (_h200 === 2);
    const _h204 = sp.edgeEnds[2 * v_e + 1];
    const _a198 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
    for (let _i199 = 0; _i199 < _a198.length; _i199++) {
      const v_a = _a198[_i199];
      if (!(((_h201 && (v_a === _h202)) || (_h203 && (v_a === _h204))))) continue;
      const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("bigger", [(sp.edges.includes(v_e)), ([sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]].includes(v_a)), (((clueAt(cl.shoe, v_e) === 1) && (v_a === sp.edgeEnds[2 * v_e])) || ((clueAt(cl.shoe, v_e) === 2) && (v_a === sp.edgeEnds[2 * v_e + 1]))), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]))], ["e in", "a in", "where of a", "b ="]);
      }
      facts.length = 0;
      changed = false;
      let _q205 = true;
      Q206: {
        for (let _m207 = (cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])); _m207 !== 0; _m207 &= _m207 - 1) {
          const v_d = 31 - Math.clz32(_m207 & -_m207);
          const _h211 = (v_d - 1);
          const _h212 = Math.max(0, _h211);
          const _h213 = _h212;
          let _q208 = false;
          Q209: {
            for (let _m210 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m210 !== 0; _m210 &= _m210 - 1) {
              const v_u = 31 - Math.clz32(_m210 & -_m210);
              if (((v_u !== v_d) && ((_h213 & ~Math.max(0, (v_u - 1))) === 0))) {
                _q208 = true;
                break Q209;
              }
            }
          }
          if (!(!(_q208))) continue;
          if ((((b.cands[v_b] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_b, v_d); changed = true; } else facts.push(STRIKE, v_b, v_d); }
          if (!(true)) {
            _q205 = false;
            break Q206;
          }
        }
      }
      if (!(_q205)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
