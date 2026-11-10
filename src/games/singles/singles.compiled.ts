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
  const _g201: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q191 = true;
  Q192: {
    const _a193 = sp.cells;
    for (let _i194 = 0; _i194 < _a193.length; _i194++) {
      const v_c = _a193[_i194];
      const _h195 = (g[v_c] || -1);
      if (!((_h195 === 1))) continue;
      let _q196 = true;
      Q197: {
        const _a198 = sp.adj4[v_c];
        for (let _i199 = 0; _i199 < _a198.length; _i199++) {
          const v_p = _a198[_i199];
          const _h200 = (g[v_p] || -1);
          if (!((_h200 === 2))) {
            _q196 = false;
            break Q197;
          }
        }
      }
      if (!(_q196)) {
        _q191 = false;
        break Q192;
      }
    }
  }
  if (!(_q191)) return false;
  _g201.length = 0;
  G202: {
    const _a205 = sp.cells;
    for (let _i206 = 0; _i206 < _a205.length; _i206++) {
      const v_c = _a205[_i206];
      const _h207 = (g[v_c] || -1);
      if (!((_h207 === 2))) continue;
      _g201.push(v_c);
    }
  }
  if (!(connected(sp, _g201))) return false;
  for (let _k208 = 0; _k208 < cl.number.at.length; _k208++) {
    const _at209 = cl.number.at[_k208];
    const _v210 = cl.number.v[_k208];
    let _c220: boolean = ((g[_at209] || -1) === 1);
    if (!_c220) {
      let _q211 = true;
      Q212: {
        const _t213 = sp.rowOf[_at209];
        const _t214 = sp.colOf[_at209];
        for (let _i215 = 0; _i215 < 2; _i215++) {
          const v_L = _i215 === 0 ? _t213 : _t214;
          if (_i215 === 1 && (v_L === _t213)) continue;
          const _a216 = sp.lineCells[v_L];
          for (let _i217 = 0; _i217 < _a216.length; _i217++) {
            const v_p = _a216[_i217];
            const _h218 = clueAt(cl.number, v_p);
            if (!(((v_p !== _at209) && (_h218 === _v210)))) continue;
            const _h219 = (g[v_p] || -1);
            if (!((_h219 === 1))) {
              _q211 = false;
              break Q212;
            }
          }
        }
      }
      _c220 = _q211;
    }
    if (!(_c220)) return false;
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
  const _a9 = cellsValued(b, sp.cells, 1);
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("besideCovered", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1)], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _q11 = true;
    Q12: {
      const _a13 = sp.adj4[v_c];
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        const v_p = _a13[_i14];
        if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
        if (!(true)) {
          _q11 = false;
          break Q12;
        }
      }
    }
    if (!(_q11)) return -1;
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
  const _a17 = cellsValued(b, sp.cells, 2);
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_c = _a17[_i18];
    if (!(((b.grid[v_c] || -1) === 2))) continue;
    const _h19 = clueAt(cl.number, v_c);
    const v_n = _h19;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("sameLine", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 2), (v_n === clueAt(cl.number, v_c))], ["c in", "where of c", "n ="]);
    }
    facts.length = 0;
    changed = false;
    let _q20 = true;
    Q21: {
      const _t22 = sp.rowOf[v_c];
      const _t23 = sp.colOf[v_c];
      for (let _i24 = 0; _i24 < 2; _i24++) {
        const v_L = _i24 === 0 ? _t22 : _t23;
        if (_i24 === 1 && (v_L === _t22)) continue;
        const _a25 = sp.lineCells[v_L];
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_p = _a25[_i26];
          const _h27 = clueAt(cl.number, v_p);
          if (!(((v_p !== v_c) && (_h27 === v_n)))) continue;
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
          if (!(true)) {
            _q20 = false;
            break Q21;
          }
        }
      }
    }
    if (!(_q20)) return -1;
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
  const _a33 = sp.lines;
  for (let _i34 = 0; _i34 < _a33.length; _i34++) {
    const v_L = _a33[_i34];
    const _a35 = sp.lineCells[v_L];
    for (let _i36 = 0; _i36 < _a35.length; _i36++) {
      const v_c = _a35[_i36];
      const _h39 = clueAt(cl.number, v_c);
      L37: {
        const v_e = (sp.lineCells[v_L][(_i36 + 2)] ?? -1);
        const _h38 = clueAt(cl.number, v_e);
        if (!(((v_e !== -1) && (_h38 === _h39)))) break L37;
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("sandwich", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), (v_e === (sp.lineCells[v_L][(_i36 + 2)] ?? -1)), ((v_e !== -1) && (clueAt(cl.number, v_e) === clueAt(cl.number, v_c)))], ["L in", "c in", "e =", "where of e"]);
        }
        facts.length = 0;
        changed = false;
        const _t40 = (sp.lineCells[v_L][(_i36 + 1)] ?? -1);
        if (!(b.grid[_t40] !== 0)) { if (fire === null) { b.placeAt(_t40, 2); changed = true; } else facts.push(PLACE, _t40, 2); }
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
  const _a46 = sp.lines;
  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
    const v_L = _a46[_i47];
    const _a48 = sp.lineCells[v_L];
    for (let _i49 = 0; _i49 < _a48.length; _i49++) {
      const v_c = _a48[_i49];
      const _h52 = clueAt(cl.number, v_c);
      L50: {
        const v_q = (sp.lineCells[v_L][(_i49 + 1)] ?? -1);
        const _h51 = clueAt(cl.number, v_q);
        if (!(((v_q !== -1) && (_h51 === _h52)))) break L50;
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("pair", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), (v_q === (sp.lineCells[v_L][(_i49 + 1)] ?? -1)), ((v_q !== -1) && (clueAt(cl.number, v_q) === clueAt(cl.number, v_c)))], ["L in", "c in", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        let _q53 = true;
        Q54: {
          const _a55 = sp.lineCells[v_L];
          for (let _i56 = 0; _i56 < _a55.length; _i56++) {
            const v_p = _a55[_i56];
            const _h57 = clueAt(cl.number, v_p);
            if (!((((v_p !== v_c) && (v_p !== v_q)) && (_h57 === _h52)))) continue;
            if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
            if (!(true)) {
              _q53 = false;
              break Q54;
            }
          }
        }
        if (!(_q53)) return -1;
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
  const _a66 = sp.cells;
  for (let _i67 = 0; _i67 < _a66.length; _i67++) {
    const v_c = _a66[_i67];
    if (!((sp.adj4[v_c].length === 2))) continue;
    const _h74 = clueAt(cl.number, v_c);
    const _t68 = sp.adj4[v_c];
    const v_s = (_t68.length > 0 ? _t68[0] : -1);
    const _h75 = clueAt(cl.number, v_s);
    const v_t = (sp.adj4[v_c][1] ?? -1);
    const _h76 = clueAt(cl.number, v_t);
    let _g69 = -1;
    let _n71 = 0;
    G70: {
      const _a72 = sp.adj4[v_s];
      for (let _i73 = 0; _i73 < _a72.length; _i73++) {
        const v_p = _a72[_i73];
        if (!(((v_p !== v_c) && (sp.adj4[v_t].includes(v_p))))) continue;
        if (++_n71 === 2) {
          _g69 = -1;
          break G70;
        }
        _g69 = v_p;
      }
    }
    const v_i = _g69;
    const _h77 = clueAt(cl.number, v_i);
    const v_n = _h74;
    const v_ns = _h75;
    const v_nt = _h76;
    const v_ni = _h77;
    if (import.meta.env.DEV && staleChecking) {
      const _t78 = sp.adj4[v_c];
      let _g79 = -1;
      let _n81 = 0;
      G80: {
        const _a82 = sp.adj4[v_s];
        for (let _i83 = 0; _i83 < _a82.length; _i83++) {
          const v_p = _a82[_i83];
          if (!(((v_p !== v_c) && (sp.adj4[v_t].includes(v_p))))) continue;
          if (++_n81 === 2) {
            _g79 = -1;
            break G80;
          }
          _g79 = v_p;
        }
      }
      freshBinding("corner", [(sp.cells.includes(v_c)), (sp.adj4[v_c].length === 2), (v_s === (_t78.length > 0 ? _t78[0] : -1)), (v_t === (sp.adj4[v_c][1] ?? -1)), (v_i === _g79), (v_n === clueAt(cl.number, v_c)), (v_ns === clueAt(cl.number, v_s)), (v_nt === clueAt(cl.number, v_t)), (v_ni === clueAt(cl.number, v_i))], ["c in", "where of c", "s =", "t =", "i =", "n =", "ns =", "nt =", "ni ="]);
    }
    facts.length = 0;
    changed = false;
    let _c84: boolean = ((v_ns !== v_n) || (v_nt !== v_n));
    if (!_c84) {
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
      _c84 = true;
    }
    let _c86: boolean = _c84;
    if (_c86) {
      let _c85: boolean = ((v_ns !== v_nt) || (v_ni !== v_nt));
      if (!_c85) {
        if (!(b.grid[v_i] !== 0)) { if (fire === null) { b.placeAt(v_i, 1); changed = true; } else facts.push(PLACE, v_i, 1); }
        _c85 = true;
      }
      _c86 = _c85;
    }
    let _c91: boolean = _c86;
    if (_c91) {
      let _c90: boolean = (((v_ns === v_n) && (v_nt === v_n)) || ((v_ns === v_nt) && (v_ni === v_nt)));
      if (!_c90) {
        let _c87: boolean = ((v_ns !== v_n) && (v_ns !== v_ni));
        if (!_c87) {
          if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, 2); changed = true; } else facts.push(PLACE, v_t, 2); }
          _c87 = true;
        }
        let _c89: boolean = _c87;
        if (_c89) {
          let _c88: boolean = (((v_ns === v_n) || (v_ns === v_ni)) || ((v_nt !== v_n) && (v_nt !== v_ni)));
          if (!_c88) {
            if (!(b.grid[v_s] !== 0)) { if (fire === null) { b.placeAt(v_s, 2); changed = true; } else facts.push(PLACE, v_s, 2); }
            _c88 = true;
          }
          _c89 = _c88;
        }
        _c90 = _c89;
      }
      _c91 = _c90;
    }
    if (!(_c91)) return -1;
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
  const _g102: number[] = [];
  const facts = boxedInFacts;
  let fired = 0;
  let changed = false;
  const _a100 = sp.cells;
  for (let _i101 = 0; _i101 < _a100.length; _i101++) {
    const v_c = _a100[_i101];
    if (!(((b.grid[v_c] || -1) !== 1))) continue;
    _g102.length = 0;
    G103: {
      const _a106 = sp.adj4[v_c];
      for (let _i107 = 0; _i107 < _a106.length; _i107++) {
        const v_p = _a106[_i107];
        if (!(((b.grid[v_p] || -1) !== 1))) continue;
        _g102.push(v_p);
      }
    }
    const v_F = _g102;
    const _h114 = v_F.length;
    if (import.meta.env.DEV && staleChecking) {
      const _g108: number[] = [];
      G109: {
        const _a112 = sp.adj4[v_c];
        for (let _i113 = 0; _i113 < _a112.length; _i113++) {
          const v_p = _a112[_i113];
          if (!(((b.grid[v_p] || -1) !== 1))) continue;
          _g108.push(v_p);
        }
      }
      freshBinding("boxedIn", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) !== 1), sameSet(v_F, _g108)], ["c in", "where of c", "F ="]);
    }
    facts.length = 0;
    changed = false;
    let _c117: boolean = (_h114 > 0);
    if (_c117) {
      let _c116: boolean = (_h114 > 1);
      if (!_c116) {
        const _t115 = (v_F.length > 0 ? v_F[0] : -1);
        if (!(b.grid[_t115] !== 0)) { if (fire === null) { b.placeAt(_t115, 2); changed = true; } else facts.push(PLACE, _t115, 2); }
        _c116 = true;
      }
      _c117 = _c116;
    }
    if (!(_c117)) return -1;
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
  const _a133 = sp.cells;
  for (let _i134 = 0; _i134 < _a133.length; _i134++) {
    const v_a = _a133[_i134];
    const _h135 = clueAt(cl.number, v_a);
    const _h139 = sp.colOf[v_a];
    const _h140 = sp.rowOf[v_a];
    const v_n = _h135;
    const _a136 = sp.adj8[v_a];
    for (let _i137 = 0; _i137 < _a136.length; _i137++) {
      const v_b = _a136[_i137];
      if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
      const _h138 = clueAt(cl.number, v_b);
      const _h150 = (v_b % sp.w);
      const _h151 = ((v_b / sp.w) | 0);
      const v_m = _h138;
      for (let _i141 = 0; _i141 < 2; _i141++) {
        const v_L = _i141 === 0 ? _h139 : _h140;
        if (_i141 === 1 && (v_L === _h139)) continue;
        const _a142 = sp.lineCells[v_L];
        for (let _i143 = 0; _i143 < _a142.length; _i143++) {
          const v_a1 = _a142[_i143];
          const _h144 = clueAt(cl.number, v_a1);
          if (!((((v_a1 !== v_a) && !(sp.adj4[v_b].includes(v_a1))) && (_h144 === v_n)))) continue;
          let _g145 = -1;
          let _n147 = 0;
          G146: {
            const _a148 = sp.adj4[v_a1];
            for (let _i149 = 0; _i149 < _a148.length; _i149++) {
              const v_p = _a148[_i149];
              if (!((!(sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) === _h150) || (((v_p / sp.w) | 0) === _h151))))) continue;
              if (++_n147 === 2) {
                _g145 = -1;
                break G146;
              }
              _g145 = v_p;
            }
          }
          L152: {
            const v_b1 = _g145;
            const _h153 = clueAt(cl.number, v_b1);
            if (!((_h153 === v_m))) break L152;
            if (import.meta.env.DEV && staleChecking) {
              let _g154 = -1;
              let _n156 = 0;
              G155: {
                const _a157 = sp.adj4[v_a1];
                for (let _i158 = 0; _i158 < _a157.length; _i158++) {
                  const v_p = _a157[_i158];
                  if (!((!(sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) === (v_b % sp.w)) || (((v_p / sp.w) | 0) === ((v_b / sp.w) | 0)))))) continue;
                  if (++_n156 === 2) {
                    _g154 = -1;
                    break G155;
                  }
                  _g154 = v_p;
                }
              }
              freshBinding("offset", [(sp.cells.includes(v_a)), (v_n === clueAt(cl.number, v_a)), (sp.adj8[v_a].includes(v_b)), !(sp.adj4[v_a].includes(v_b)), (v_m === clueAt(cl.number, v_b)), ((v_L === sp.colOf[v_a]) || (v_L === sp.rowOf[v_a])), (sp.lineCells[v_L].includes(v_a1)), (((v_a1 !== v_a) && !(sp.adj4[v_b].includes(v_a1))) && (clueAt(cl.number, v_a1) === v_n)), (v_b1 === _g154), (clueAt(cl.number, v_b1) === v_m)], ["a in", "n =", "b in", "where of b", "m =", "L in", "a1 in", "where of a1", "b1 =", "where of b1"]);
            }
            facts.length = 0;
            changed = false;
            let _q159 = true;
            Q160: {
              const _a161 = sp.adj4[v_a];
              for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                const v_p = _a161[_i162];
                if (!((sp.adj4[v_b].includes(v_p)))) continue;
                if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                if (!(true)) {
                  _q159 = false;
                  break Q160;
                }
              }
            }
            if (!(_q159)) return -1;
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
  const _g171: number[] = [];
  const _g179: number[] = [];
  const facts = splitFacts;
  let fired = 0;
  let changed = false;
  const _m147_0 = b.made[0];
  _g171.length = 0;
  G172: {
    const _a175 = sp.cells;
    for (let _i176 = 0; _i176 < _a175.length; _i176++) {
      const v_c = _a175[_i176];
      if (!(((b.grid[v_c] || -1) !== 1))) continue;
      _g171.push(v_c);
    }
  }
  const v_K = cuts(sp, _g171);
  const _a177 = v_K;
  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
    const v_c = _a177[_i178];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    if (b.made[0] !== _m147_0) {
      _g179.length = 0;
      G180: {
        const _a183 = sp.cells;
        for (let _i184 = 0; _i184 < _a183.length; _i184++) {
          const v_c = _a183[_i184];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g179.push(v_c);
        }
      }
      if (!(sameSet(v_K, cuts(sp, _g179)))) { return fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
      const _g185: number[] = [];
      G186: {
        const _a189 = sp.cells;
        for (let _i190 = 0; _i190 < _a189.length; _i190++) {
          const v_c = _a189[_i190];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g185.push(v_c);
        }
      }
      freshBinding("split", [sameSet(v_K, cuts(sp, _g185)), (v_K.includes(v_c)), !((b.grid[v_c] !== 0))], ["K =", "c in", "where of c"]);
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
