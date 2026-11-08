// Compiled by `npm run describe` from src/games/singles/singles.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, connected, cuts, rangeMask } from "../../engine/describe-runtime.ts";

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
  const _g172: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q162 = true;
  Q163: {
    const _a164 = sp.cells;
    for (let _i165 = 0; _i165 < _a164.length; _i165++) {
      const v_c = _a164[_i165];
      const _h166 = (g[v_c] || -1);
      if (!((_h166 === 1))) continue;
      let _q167 = true;
      Q168: {
        const _a169 = sp.adj4[v_c];
        for (let _i170 = 0; _i170 < _a169.length; _i170++) {
          const v_p = _a169[_i170];
          const _h171 = (g[v_p] || -1);
          if (!((_h171 === 2))) {
            _q167 = false;
            break Q168;
          }
        }
      }
      if (!(_q167)) {
        _q162 = false;
        break Q163;
      }
    }
  }
  if (!(_q162)) return false;
  _g172.length = 0;
  G173: {
    const _a176 = sp.cells;
    for (let _i177 = 0; _i177 < _a176.length; _i177++) {
      const v_c = _a176[_i177];
      const _h178 = (g[v_c] || -1);
      if (!((_h178 === 2))) continue;
      _g172.push(v_c);
    }
  }
  if (!(connected(sp, _g172))) return false;
  for (let _k179 = 0; _k179 < cl.number.at.length; _k179++) {
    const _at180 = cl.number.at[_k179];
    const _v181 = cl.number.v[_k179];
    let _c191: boolean = ((g[_at180] || -1) === 1);
    if (!_c191) {
      let _q182 = true;
      Q183: {
        const _t184 = sp.rowOf[_at180];
        const _t185 = sp.colOf[_at180];
        for (let _i186 = 0; _i186 < 2; _i186++) {
          const v_L = _i186 === 0 ? _t184 : _t185;
          if (_i186 === 1 && (v_L === _t184)) continue;
          const _a187 = sp.lineCells[v_L];
          for (let _i188 = 0; _i188 < _a187.length; _i188++) {
            const v_p = _a187[_i188];
            const _h189 = clueAt(cl.number, v_p);
            if (!(((v_p !== _at180) && (_h189 === _v181)))) continue;
            const _h190 = (g[v_p] || -1);
            if (!((_h190 === 1))) {
              _q182 = false;
              break Q183;
            }
          }
        }
      }
      _c191 = _q182;
    }
    if (!(_c191)) return false;
  }
  return true;
}

export interface BesideCoveredBinding {
  c: number;
}

const besideCoveredFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function besideCovered(b: Marks, sp: GridSpace, fire: Fire<BesideCoveredBinding> | null): number {
  const facts = besideCoveredFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
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

/** Its dearest read grows with the board as n^1.5. */
export function sameLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SameLineBinding> | null): number {
  const facts = sameLineFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.cells;
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_c = _a17[_i18];
    if (!(((b.grid[v_c] || -1) === 2))) continue;
    const _h19 = clueAt(cl.number, v_c);
    const v_n = _h19;
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
    facts.length = 0;
    changed = false;
    let _c78: boolean = ((v_ns !== v_n) || (v_nt !== v_n));
    if (!_c78) {
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
      _c78 = true;
    }
    let _c80: boolean = _c78;
    if (_c80) {
      let _c79: boolean = ((v_ns !== v_nt) || (v_ni !== v_nt));
      if (!_c79) {
        if (!(b.grid[v_i] !== 0)) { if (fire === null) { b.placeAt(v_i, 1); changed = true; } else facts.push(PLACE, v_i, 1); }
        _c79 = true;
      }
      _c80 = _c79;
    }
    let _c85: boolean = _c80;
    if (_c85) {
      let _c84: boolean = (((v_ns === v_n) && (v_nt === v_n)) || ((v_ns === v_nt) && (v_ni === v_nt)));
      if (!_c84) {
        let _c81: boolean = ((v_ns !== v_n) && (v_ns !== v_ni));
        if (!_c81) {
          if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, 2); changed = true; } else facts.push(PLACE, v_t, 2); }
          _c81 = true;
        }
        let _c83: boolean = _c81;
        if (_c83) {
          let _c82: boolean = (((v_ns === v_n) || (v_ns === v_ni)) || ((v_nt !== v_n) && (v_nt !== v_ni)));
          if (!_c82) {
            if (!(b.grid[v_s] !== 0)) { if (fire === null) { b.placeAt(v_s, 2); changed = true; } else facts.push(PLACE, v_s, 2); }
            _c82 = true;
          }
          _c83 = _c82;
        }
        _c84 = _c83;
      }
      _c85 = _c84;
    }
    if (!(_c85)) return -1;
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
  const _g96: number[] = [];
  const facts = boxedInFacts;
  let fired = 0;
  let changed = false;
  const _a94 = sp.cells;
  for (let _i95 = 0; _i95 < _a94.length; _i95++) {
    const v_c = _a94[_i95];
    if (!(((b.grid[v_c] || -1) !== 1))) continue;
    _g96.length = 0;
    G97: {
      const _a100 = sp.adj4[v_c];
      for (let _i101 = 0; _i101 < _a100.length; _i101++) {
        const v_p = _a100[_i101];
        if (!(((b.grid[v_p] || -1) !== 1))) continue;
        _g96.push(v_p);
      }
    }
    const v_F = _g96;
    const _h102 = v_F.length;
    facts.length = 0;
    changed = false;
    let _c105: boolean = (_h102 > 0);
    if (_c105) {
      let _c104: boolean = (_h102 > 1);
      if (!_c104) {
        const _t103 = (v_F.length > 0 ? v_F[0] : -1);
        if (!(b.grid[_t103] !== 0)) { if (fire === null) { b.placeAt(_t103, 2); changed = true; } else facts.push(PLACE, _t103, 2); }
        _c104 = true;
      }
      _c105 = _c104;
    }
    if (!(_c105)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c, F: v_F }, facts)) return 1;
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
  const _a121 = sp.cells;
  for (let _i122 = 0; _i122 < _a121.length; _i122++) {
    const v_a = _a121[_i122];
    const _h123 = clueAt(cl.number, v_a);
    const _h127 = sp.colOf[v_a];
    const _h128 = sp.rowOf[v_a];
    const v_n = _h123;
    const _a124 = sp.adj8[v_a];
    for (let _i125 = 0; _i125 < _a124.length; _i125++) {
      const v_b = _a124[_i125];
      if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
      const _h126 = clueAt(cl.number, v_b);
      const _h138 = (v_b % sp.w);
      const _h139 = ((v_b / sp.w) | 0);
      const v_m = _h126;
      for (let _i129 = 0; _i129 < 2; _i129++) {
        const v_L = _i129 === 0 ? _h127 : _h128;
        if (_i129 === 1 && (v_L === _h127)) continue;
        const _a130 = sp.lineCells[v_L];
        for (let _i131 = 0; _i131 < _a130.length; _i131++) {
          const v_a1 = _a130[_i131];
          const _h132 = clueAt(cl.number, v_a1);
          if (!((((v_a1 !== v_a) && !(sp.adj4[v_b].includes(v_a1))) && (_h132 === v_n)))) continue;
          let _g133 = -1;
          let _n135 = 0;
          G134: {
            const _a136 = sp.adj4[v_a1];
            for (let _i137 = 0; _i137 < _a136.length; _i137++) {
              const v_p = _a136[_i137];
              if (!((!(sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) === _h138) || (((v_p / sp.w) | 0) === _h139))))) continue;
              if (++_n135 === 2) {
                _g133 = -1;
                break G134;
              }
              _g133 = v_p;
            }
          }
          L140: {
            const v_b1 = _g133;
            const _h141 = clueAt(cl.number, v_b1);
            if (!((_h141 === v_m))) break L140;
            facts.length = 0;
            changed = false;
            let _q142 = true;
            Q143: {
              const _a144 = sp.adj4[v_a];
              for (let _i145 = 0; _i145 < _a144.length; _i145++) {
                const v_p = _a144[_i145];
                if (!((sp.adj4[v_b].includes(v_p)))) continue;
                if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                if (!(true)) {
                  _q142 = false;
                  break Q143;
                }
              }
            }
            if (!(_q142)) return -1;
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
  const _g154: number[] = [];
  const facts = splitFacts;
  let fired = 0;
  let changed = false;
  _g154.length = 0;
  G155: {
    const _a158 = sp.cells;
    for (let _i159 = 0; _i159 < _a158.length; _i159++) {
      const v_c = _a158[_i159];
      if (!(((b.grid[v_c] || -1) !== 1))) continue;
      _g154.push(v_c);
    }
  }
  const v_K = cuts(sp, _g154);
  const _a160 = v_K;
  for (let _i161 = 0; _i161 < _a160.length; _i161++) {
    const v_c = _a160[_i161];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ K: v_K, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}
