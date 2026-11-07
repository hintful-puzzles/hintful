// Compiled by `npm run describe` from src/games/singles/singles.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, connected, cuts, rangeMask, setOf } from "../../engine/describe-runtime.ts";

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
  const _g170: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q160 = true;
  Q161: {
    const _a162 = sp.cells;
    for (let _i163 = 0; _i163 < _a162.length; _i163++) {
      const v_c = _a162[_i163];
      const _h164 = (g[v_c] || -1);
      if (!((_h164 === 1))) continue;
      let _q165 = true;
      Q166: {
        const _a167 = sp.adj4[v_c];
        for (let _i168 = 0; _i168 < _a167.length; _i168++) {
          const v_p = _a167[_i168];
          const _h169 = (g[v_p] || -1);
          if (!((_h169 === 2))) {
            _q165 = false;
            break Q166;
          }
        }
      }
      if (!(_q165)) {
        _q160 = false;
        break Q161;
      }
    }
  }
  if (!(_q160)) return false;
  _g170.length = 0;
  G171: {
    const _a174 = sp.cells;
    for (let _i175 = 0; _i175 < _a174.length; _i175++) {
      const v_c = _a174[_i175];
      const _h176 = (g[v_c] || -1);
      if (!((_h176 === 2))) continue;
      _g170.push(v_c);
    }
  }
  if (!(connected(sp, _g170))) return false;
  for (let _k177 = 0; _k177 < cl.number.at.length; _k177++) {
    const _at178 = cl.number.at[_k177];
    const _v179 = cl.number.v[_k177];
    let _c188: boolean = ((g[_at178] || -1) === 1);
    if (!_c188) {
      let _q180 = true;
      Q181: {
        const _a182 = setOf(sp.rowOf[_at178], sp.colOf[_at178]);
        for (let _i183 = 0; _i183 < _a182.length; _i183++) {
          const v_L = _a182[_i183];
          const _a184 = sp.lineCells[v_L];
          for (let _i185 = 0; _i185 < _a184.length; _i185++) {
            const v_p = _a184[_i185];
            const _h186 = clueAt(cl.number, v_p);
            if (!(((v_p !== _at178) && (_h186 === _v179)))) continue;
            const _h187 = (g[v_p] || -1);
            if (!((_h187 === 1))) {
              _q180 = false;
              break Q181;
            }
          }
        }
      }
      _c188 = _q180;
    }
    if (!(_c188)) return false;
  }
  return true;
}

export interface BesideCoveredBinding {
  c: number;
}

const besideCoveredFacts: number[] = [];

export function besideCovered(b: Marks, sp: GridSpace, fire: Fire<BesideCoveredBinding> | null): number {
  const facts = besideCoveredFacts;
  let fired = 0;
  let changed = false;
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    if (!((b.value(v_c) === 1))) continue;
    facts.length = 0;
    changed = false;
    let _q10 = true;
    Q11: {
      const _a12 = sp.adj4[v_c];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_p = _a12[_i13];
        if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
        if (!(true)) {
          _q10 = false;
          break Q11;
        }
      }
    }
    if (!(_q10)) return -1;
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

export function sameLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SameLineBinding> | null): number {
  const facts = sameLineFacts;
  let fired = 0;
  let changed = false;
  const _a16 = sp.cells;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_c = _a16[_i17];
    if (!((b.value(v_c) === 2))) continue;
    const _h18 = clueAt(cl.number, v_c);
    const v_n = _h18;
    facts.length = 0;
    changed = false;
    let _q19 = true;
    Q20: {
      const _a21 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_L = _a21[_i22];
        const _a23 = sp.lineCells[v_L];
        for (let _i24 = 0; _i24 < _a23.length; _i24++) {
          const v_p = _a23[_i24];
          const _h25 = clueAt(cl.number, v_p);
          if (!(((v_p !== v_c) && (_h25 === v_n)))) continue;
          if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
          if (!(true)) {
            _q19 = false;
            break Q20;
          }
        }
      }
    }
    if (!(_q19)) return -1;
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

export function sandwich(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SandwichBinding> | null): number {
  const facts = sandwichFacts;
  let fired = 0;
  let changed = false;
  const _a31 = sp.lines;
  for (let _i32 = 0; _i32 < _a31.length; _i32++) {
    const v_L = _a31[_i32];
    const _a33 = sp.lineCells[v_L];
    for (let _i34 = 0; _i34 < _a33.length; _i34++) {
      const v_c = _a33[_i34];
      const _h37 = clueAt(cl.number, v_c);
      L35: {
        const v_e = (sp.lineCells[v_L][(_i34 + 2)] ?? -1);
        const _h36 = clueAt(cl.number, v_e);
        if (!(((v_e !== -1) && (_h36 === _h37)))) break L35;
        facts.length = 0;
        changed = false;
        const _t38 = (sp.lineCells[v_L][(_i34 + 1)] ?? -1);
        if (!b.known(_t38)) { if (fire === null) { b.placeAt(_t38, 2); changed = true; } else facts.push(PLACE, _t38, 2); }
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

export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  const _a44 = sp.lines;
  for (let _i45 = 0; _i45 < _a44.length; _i45++) {
    const v_L = _a44[_i45];
    const _a46 = sp.lineCells[v_L];
    for (let _i47 = 0; _i47 < _a46.length; _i47++) {
      const v_c = _a46[_i47];
      const _h50 = clueAt(cl.number, v_c);
      L48: {
        const v_q = (sp.lineCells[v_L][(_i47 + 1)] ?? -1);
        const _h49 = clueAt(cl.number, v_q);
        if (!(((v_q !== -1) && (_h49 === _h50)))) break L48;
        facts.length = 0;
        changed = false;
        let _q51 = true;
        Q52: {
          const _a53 = sp.lineCells[v_L];
          for (let _i54 = 0; _i54 < _a53.length; _i54++) {
            const v_p = _a53[_i54];
            const _h55 = clueAt(cl.number, v_p);
            if (!((((v_p !== v_c) && (v_p !== v_q)) && (_h55 === _h50)))) continue;
            if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
            if (!(true)) {
              _q51 = false;
              break Q52;
            }
          }
        }
        if (!(_q51)) return -1;
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

export function corner(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CornerBinding> | null): number {
  const facts = cornerFacts;
  let fired = 0;
  let changed = false;
  const _a64 = sp.cells;
  for (let _i65 = 0; _i65 < _a64.length; _i65++) {
    const v_c = _a64[_i65];
    if (!((sp.adj4[v_c].length === 2))) continue;
    const _h72 = clueAt(cl.number, v_c);
    const _t66 = sp.adj4[v_c];
    const v_s = (_t66.length > 0 ? _t66[0] : -1);
    const _h73 = clueAt(cl.number, v_s);
    const v_t = (sp.adj4[v_c][1] ?? -1);
    const _h74 = clueAt(cl.number, v_t);
    let _g67 = -1;
    let _n69 = 0;
    G68: {
      const _a70 = sp.adj4[v_s];
      for (let _i71 = 0; _i71 < _a70.length; _i71++) {
        const v_p = _a70[_i71];
        if (!(((v_p !== v_c) && (sp.adj4[v_t].includes(v_p))))) continue;
        if (++_n69 === 2) {
          _g67 = -1;
          break G68;
        }
        _g67 = v_p;
      }
    }
    const v_i = _g67;
    const _h75 = clueAt(cl.number, v_i);
    const v_n = _h72;
    const v_ns = _h73;
    const v_nt = _h74;
    const v_ni = _h75;
    facts.length = 0;
    changed = false;
    let _c76: boolean = ((v_ns !== v_n) || (v_nt !== v_n));
    if (!_c76) {
      if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
      _c76 = true;
    }
    let _c78: boolean = _c76;
    if (_c78) {
      let _c77: boolean = ((v_ns !== v_nt) || (v_ni !== v_nt));
      if (!_c77) {
        if (!b.known(v_i)) { if (fire === null) { b.placeAt(v_i, 1); changed = true; } else facts.push(PLACE, v_i, 1); }
        _c77 = true;
      }
      _c78 = _c77;
    }
    let _c83: boolean = _c78;
    if (_c83) {
      let _c82: boolean = (((v_ns === v_n) && (v_nt === v_n)) || ((v_ns === v_nt) && (v_ni === v_nt)));
      if (!_c82) {
        let _c79: boolean = ((v_ns !== v_n) && (v_ns !== v_ni));
        if (!_c79) {
          if (!b.known(v_t)) { if (fire === null) { b.placeAt(v_t, 2); changed = true; } else facts.push(PLACE, v_t, 2); }
          _c79 = true;
        }
        let _c81: boolean = _c79;
        if (_c81) {
          let _c80: boolean = (((v_ns === v_n) || (v_ns === v_ni)) || ((v_nt !== v_n) && (v_nt !== v_ni)));
          if (!_c80) {
            if (!b.known(v_s)) { if (fire === null) { b.placeAt(v_s, 2); changed = true; } else facts.push(PLACE, v_s, 2); }
            _c80 = true;
          }
          _c81 = _c80;
        }
        _c82 = _c81;
      }
      _c83 = _c82;
    }
    if (!(_c83)) return -1;
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

export function boxedIn(b: Marks, sp: GridSpace, fire: Fire<BoxedInBinding> | null): number {
  const _g94: number[] = [];
  const facts = boxedInFacts;
  let fired = 0;
  let changed = false;
  const _a92 = sp.cells;
  for (let _i93 = 0; _i93 < _a92.length; _i93++) {
    const v_c = _a92[_i93];
    if (!((b.value(v_c) !== 1))) continue;
    _g94.length = 0;
    G95: {
      const _a98 = sp.adj4[v_c];
      for (let _i99 = 0; _i99 < _a98.length; _i99++) {
        const v_p = _a98[_i99];
        if (!((b.value(v_p) !== 1))) continue;
        _g94.push(v_p);
      }
    }
    const v_F = _g94;
    const _h100 = v_F.length;
    facts.length = 0;
    changed = false;
    let _c103: boolean = (_h100 > 0);
    if (_c103) {
      let _c102: boolean = (_h100 > 1);
      if (!_c102) {
        const _t101 = (v_F.length > 0 ? v_F[0] : -1);
        if (!b.known(_t101)) { if (fire === null) { b.placeAt(_t101, 2); changed = true; } else facts.push(PLACE, _t101, 2); }
        _c102 = true;
      }
      _c103 = _c102;
    }
    if (!(_c103)) return -1;
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

export function offset(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OffsetBinding> | null): number {
  const facts = offsetFacts;
  let fired = 0;
  let changed = false;
  const _a118 = sp.cells;
  for (let _i119 = 0; _i119 < _a118.length; _i119++) {
    const v_a = _a118[_i119];
    const _h120 = clueAt(cl.number, v_a);
    const _h124 = sp.colOf[v_a];
    const _h125 = sp.rowOf[v_a];
    const v_n = _h120;
    const _a121 = sp.adj8[v_a];
    for (let _i122 = 0; _i122 < _a121.length; _i122++) {
      const v_b = _a121[_i122];
      if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
      const _h123 = clueAt(cl.number, v_b);
      const _h136 = (v_b % sp.w);
      const _h137 = ((v_b / sp.w) | 0);
      const v_m = _h123;
      const _a126 = setOf(_h124, _h125);
      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
        const v_L = _a126[_i127];
        const _a128 = sp.lineCells[v_L];
        for (let _i129 = 0; _i129 < _a128.length; _i129++) {
          const v_a1 = _a128[_i129];
          const _h130 = clueAt(cl.number, v_a1);
          if (!((((v_a1 !== v_a) && !(sp.adj4[v_b].includes(v_a1))) && (_h130 === v_n)))) continue;
          let _g131 = -1;
          let _n133 = 0;
          G132: {
            const _a134 = sp.adj4[v_a1];
            for (let _i135 = 0; _i135 < _a134.length; _i135++) {
              const v_p = _a134[_i135];
              if (!((!(sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) === _h136) || (((v_p / sp.w) | 0) === _h137))))) continue;
              if (++_n133 === 2) {
                _g131 = -1;
                break G132;
              }
              _g131 = v_p;
            }
          }
          L138: {
            const v_b1 = _g131;
            const _h139 = clueAt(cl.number, v_b1);
            if (!((_h139 === v_m))) break L138;
            facts.length = 0;
            changed = false;
            let _q140 = true;
            Q141: {
              const _a142 = sp.adj4[v_a];
              for (let _i143 = 0; _i143 < _a142.length; _i143++) {
                const v_p = _a142[_i143];
                if (!((sp.adj4[v_b].includes(v_p)))) continue;
                if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                if (!(true)) {
                  _q140 = false;
                  break Q141;
                }
              }
            }
            if (!(_q140)) return -1;
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

export function split(b: Marks, sp: GridSpace, fire: Fire<SplitBinding> | null): number {
  const _g152: number[] = [];
  const facts = splitFacts;
  let fired = 0;
  let changed = false;
  _g152.length = 0;
  G153: {
    const _a156 = sp.cells;
    for (let _i157 = 0; _i157 < _a156.length; _i157++) {
      const v_c = _a156[_i157];
      if (!((b.value(v_c) !== 1))) continue;
      _g152.push(v_c);
    }
  }
  const v_K = cuts(sp, _g152);
  const _a158 = v_K;
  for (let _i159 = 0; _i159 < _a158.length; _i159++) {
    const v_c = _a158[_i159];
    if (!(!(b.known(v_c)))) continue;
    facts.length = 0;
    changed = false;
    if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ K: v_K, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}
