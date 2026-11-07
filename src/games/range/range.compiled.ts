// Compiled by `npm run describe` from src/games/range/range.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, connected, cuts, ray } from "../../engine/describe-runtime.ts";

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
export type LadderId = "besideShaded" | "capped" | "reach" | "cut";

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
  { id: "besideShaded", tier: 0 },
  { id: "capped", tier: 0 },
  { id: "reach", tier: 0 },
  { id: "cut", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 2; v_d++) {
      if (!(((v_d === 2) || (clueAt(cl.number, v_c) < 0)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g204: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q194 = true;
  Q195: {
    const _a196 = sp.cells;
    for (let _i197 = 0; _i197 < _a196.length; _i197++) {
      const v_c = _a196[_i197];
      const _h198 = (g[v_c] || -1);
      if (!((_h198 === 1))) continue;
      let _q199 = true;
      Q200: {
        const _a201 = sp.adj4[v_c];
        for (let _i202 = 0; _i202 < _a201.length; _i202++) {
          const v_p = _a201[_i202];
          const _h203 = (g[v_p] || -1);
          if (!((_h203 === 2))) {
            _q199 = false;
            break Q200;
          }
        }
      }
      if (!(_q199)) {
        _q194 = false;
        break Q195;
      }
    }
  }
  if (!(_q194)) return false;
  _g204.length = 0;
  G205: {
    const _a208 = sp.cells;
    for (let _i209 = 0; _i209 < _a208.length; _i209++) {
      const v_c = _a208[_i209];
      const _h210 = (g[v_c] || -1);
      if (!((_h210 !== 1))) continue;
      _g204.push(v_c);
    }
  }
  if (!(connected(sp, _g204))) return false;
  for (let _k211 = 0; _k211 < cl.number.at.length; _k211++) {
    const _at212 = cl.number.at[_k211];
    const _v213 = cl.number.v[_k211];
    let _g214 = 0;
    G215: {
      const _a216 = sp.adj4[_at212];
      for (let _i217 = 0; _i217 < _a216.length; _i217++) {
        const v_a = _a216[_i217];
        const _t218 = ray(sp, _at212, v_a);
        const _h221 = _t218.length;
        let _g219 = -1;
        G220: {
          for (let v_i = 0; v_i <= _h221; v_i++) {
            const _h222 = (g[(_t218[v_i] ?? -1)] || -1);
            if (!(((v_i === _h221) || (_h222 !== 2)))) continue;
            _g219 = v_i;
            break G220;
          }
        }
        _g214 += _g219;
      }
    }
    if (!(((1 + _g214) === _v213))) return false;
  }
  return true;
}

export interface BesideShadedBinding {
  c: number;
}

const besideShadedFacts: number[] = [];

export function besideShaded(b: Marks, sp: GridSpace, fire: Fire<BesideShadedBinding> | null): number {
  const facts = besideShadedFacts;
  let fired = 0;
  let changed = false;
  const _a5 = sp.cells;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_c = _a5[_i6];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    facts.length = 0;
    changed = false;
    let _q7 = true;
    Q8: {
      const _a9 = sp.adj4[v_c];
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_p = _a9[_i10];
        let _c11: boolean = ((b.grid[v_p] || -1) !== 1);
        if (_c11) {
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
          _c11 = true;
        }
        if (!(_c11)) {
          _q7 = false;
          break Q8;
        }
      }
    }
    if (!(_q7)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface CappedBinding {
  k: number;
  n: number;
  W: number;
  a: number;
  R: readonly number[];
  s: number;
}

const cappedFacts: number[] = [];

export function capped(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CappedBinding> | null): number {
  const facts = cappedFacts;
  let fired = 0;
  let changed = false;
  const _a44 = sp.cells;
  for (let _i45 = 0; _i45 < _a44.length; _i45++) {
    const v_k = _a44[_i45];
    const _h46 = clueAt(cl.number, v_k);
    L47: {
      const v_n = _h46;
      if (!((v_n > 0))) break L47;
      let _g56 = 0;
      G57: {
        const _a58 = sp.adj4[v_k];
        for (let _i59 = 0; _i59 < _a58.length; _i59++) {
          const v_a = _a58[_i59];
          const _t60 = ray(sp, v_k, v_a);
          const _h63 = _t60.length;
          let _g61 = -1;
          G62: {
            for (let v_i = 0; v_i <= _h63; v_i++) {
              if (!(((v_i === _h63) || ((b.grid[(_t60[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g61 = v_i;
              break G62;
            }
          }
          _g56 += _g61;
        }
      }
      const v_W = (1 + _g56);
      const _h70 = (v_n - v_W);
      const _h76 = (v_W <= v_n);
      const _a64 = sp.adj4[v_k];
      for (let _i65 = 0; _i65 < _a64.length; _i65++) {
        const v_a = _a64[_i65];
        const v_R = ray(sp, v_k, v_a);
        const _h68 = v_R.length;
        let _g66 = -1;
        G67: {
          for (let v_i = 0; v_i <= _h68; v_i++) {
            if (!(((v_i === _h68) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g66 = v_i;
            break G67;
          }
        }
        L69: {
          const v_s = _g66;
          let _g71 = -1;
          G72: {
            for (let v_i = 0; v_i <= _h68; v_i++) {
              if (!(((v_i === _h68) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
              _g71 = v_i;
              break G72;
            }
          }
          const _t73 = (_h70 + v_s);
          let _g74 = -1;
          G75: {
            for (let v_i = _h68; v_i >= v_s; v_i--) {
              if (!(((v_i === v_s) || (((v_i <= _t73) && (v_i <= _g71)) && ((v_i === _h68) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g74 = v_i;
              break G75;
            }
          }
          if (!((_g74 === v_s))) break L69;
          facts.length = 0;
          changed = false;
          let _c79: boolean = _h76;
          if (_c79) {
            let _c78: boolean = (v_s === _h68);
            if (!_c78) {
              const _t77 = (v_R[v_s] ?? -1);
              if (!(b.grid[_t77] !== 0)) { if (fire === null) { b.placeAt(_t77, 1); changed = true; } else facts.push(PLACE, _t77, 1); }
              _c78 = true;
            }
            _c79 = _c78;
          }
          if (!(_c79)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, n: v_n, W: v_W, a: v_a, R: v_R, s: v_s }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface ReachBinding {
  k: number;
  n: number;
  W: number;
  M: number;
  a: number;
  R: readonly number[];
  s: number;
  f: number;
}

const reachFacts: number[] = [];

export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding> | null): number {
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  const _a125 = sp.cells;
  for (let _i126 = 0; _i126 < _a125.length; _i126++) {
    const v_k = _a125[_i126];
    const _h127 = clueAt(cl.number, v_k);
    L128: {
      const v_n = _h127;
      if (!((v_n > 0))) break L128;
      let _g137 = 0;
      G138: {
        const _a139 = sp.adj4[v_k];
        for (let _i140 = 0; _i140 < _a139.length; _i140++) {
          const v_a = _a139[_i140];
          const _t141 = ray(sp, v_k, v_a);
          const _h144 = _t141.length;
          let _g142 = -1;
          G143: {
            for (let v_i = 0; v_i <= _h144; v_i++) {
              if (!(((v_i === _h144) || ((b.grid[(_t141[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g142 = v_i;
              break G143;
            }
          }
          _g137 += _g142;
        }
      }
      const v_W = (1 + _g137);
      const _h152 = (v_n - v_W);
      let _g145 = 0;
      G146: {
        const _a147 = sp.adj4[v_k];
        for (let _i148 = 0; _i148 < _a147.length; _i148++) {
          const v_b = _a147[_i148];
          const v_B = ray(sp, v_k, v_b);
          const _h151 = v_B.length;
          let _g149 = -1;
          G150: {
            for (let v_i = 0; v_i <= _h151; v_i++) {
              if (!(((v_i === _h151) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g149 = v_i;
              break G150;
            }
          }
          const v_t = _g149;
          let _g153 = -1;
          G154: {
            for (let v_i = 0; v_i <= _h151; v_i++) {
              if (!(((v_i === _h151) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
              _g153 = v_i;
              break G154;
            }
          }
          const _t155 = (_h152 + v_t);
          let _g156 = -1;
          G157: {
            for (let v_i = _h151; v_i >= v_t; v_i--) {
              if (!(((v_i === v_t) || (((v_i <= _t155) && (v_i <= _g153)) && ((v_i === _h151) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g156 = v_i;
              break G157;
            }
          }
          _g145 += _g156;
        }
      }
      const v_M = (1 + _g145);
      const _h168 = (v_M >= v_n);
      const _h173 = (v_n - v_M);
      const _a158 = sp.adj4[v_k];
      for (let _i159 = 0; _i159 < _a158.length; _i159++) {
        const v_a = _a158[_i159];
        const v_R = ray(sp, v_k, v_a);
        const _h162 = v_R.length;
        let _g160 = -1;
        G161: {
          for (let v_i = 0; v_i <= _h162; v_i++) {
            if (!(((v_i === _h162) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g160 = v_i;
            break G161;
          }
        }
        const v_s = _g160;
        let _g163 = -1;
        G164: {
          for (let v_i = 0; v_i <= _h162; v_i++) {
            if (!(((v_i === _h162) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
            _g163 = v_i;
            break G164;
          }
        }
        const _t165 = (_h152 + v_s);
        let _g166 = -1;
        G167: {
          for (let v_i = _h162; v_i >= v_s; v_i--) {
            if (!(((v_i === v_s) || (((v_i <= _t165) && (v_i <= _g163)) && ((v_i === _h162) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
            _g166 = v_i;
            break G167;
          }
        }
        const v_f = _g166;
        const _h174 = (_h173 + v_f);
        facts.length = 0;
        changed = false;
        let _c175: boolean = _h168;
        if (_c175) {
          let _q169 = true;
          Q170: {
            const _a171 = v_R;
            for (let _i172 = 0; _i172 < _a171.length; _i172++) {
              const v_p = _a171[_i172];
              if (!((_i172 < _h174))) continue;
              if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
              if (!(true)) {
                _q169 = false;
                break Q170;
              }
            }
          }
          _c175 = _q169;
        }
        if (!(_c175)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ k: v_k, n: v_n, W: v_W, M: v_M, a: v_a, R: v_R, s: v_s, f: v_f }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CutBinding {
  U: readonly number[];
  K: readonly number[];
  c: number;
}

const cutFacts: number[] = [];

export function cut(b: Marks, sp: GridSpace, fire: Fire<CutBinding> | null): number {
  const _g184: number[] = [];
  const facts = cutFacts;
  let fired = 0;
  let changed = false;
  _g184.length = 0;
  G185: {
    const _a188 = sp.cells;
    for (let _i189 = 0; _i189 < _a188.length; _i189++) {
      const v_c = _a188[_i189];
      if (!(((b.grid[v_c] || -1) !== 1))) continue;
      _g184.push(v_c);
    }
  }
  const v_U = _g184;
  const _h192 = connected(sp, v_U);
  const v_K = cuts(sp, v_U);
  const _a190 = v_K;
  for (let _i191 = 0; _i191 < _a190.length; _i191++) {
    const v_c = _a190[_i191];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    facts.length = 0;
    changed = false;
    let _c193: boolean = _h192;
    if (_c193) {
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
      _c193 = true;
    }
    if (!(_c193)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ U: v_U, K: v_K, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}
