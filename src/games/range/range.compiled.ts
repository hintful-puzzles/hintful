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
  const _g170: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q162 = true;
  Q163: {
    const _a164 = sp.cells;
    for (let _i165 = 0; _i165 < _a164.length; _i165++) {
      const v_c = _a164[_i165];
      if (!(((g[v_c] || -1) === 1))) continue;
      let _q166 = true;
      Q167: {
        const _a168 = sp.adj4[v_c];
        for (let _i169 = 0; _i169 < _a168.length; _i169++) {
          const v_p = _a168[_i169];
          if (!(((g[v_p] || -1) === 2))) {
            _q166 = false;
            break Q167;
          }
        }
      }
      if (!(_q166)) {
        _q162 = false;
        break Q163;
      }
    }
  }
  if (!(_q162)) return false;
  _g170.length = 0;
  G171: {
    const _a174 = sp.cells;
    for (let _i175 = 0; _i175 < _a174.length; _i175++) {
      const v_c = _a174[_i175];
      if (!(((g[v_c] || -1) !== 1))) continue;
      _g170.push(v_c);
    }
  }
  if (!(connected(sp, _g170))) return false;
  for (let _k176 = 0; _k176 < cl.number.at.length; _k176++) {
    const _at177 = cl.number.at[_k176];
    const _v178 = cl.number.v[_k176];
    let _g179 = 0;
    G180: {
      const _a181 = sp.adj4[_at177];
      for (let _i182 = 0; _i182 < _a181.length; _i182++) {
        const v_a = _a181[_i182];
        const _t183 = ray(sp, _at177, v_a);
        let _g184 = -1;
        G185: {
          const _t186 = _t183.length;
          for (let v_i = 0; v_i <= _t186; v_i++) {
            if (!(((v_i === _t183.length) || ((g[(_t183[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g184 = v_i;
            break G185;
          }
        }
        _g179 += _g184;
      }
    }
    if (!(((1 + _g179) === _v178))) return false;
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
    if (!((b.value(v_c) === 1))) continue;
    facts.length = 0;
    changed = false;
    let _q7 = true;
    Q8: {
      const _a9 = sp.adj4[v_c];
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_p = _a9[_i10];
        let _c11: boolean = (b.value(v_p) !== 1);
        if (_c11) {
          if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
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
  const _a36 = sp.cells;
  for (let _i37 = 0; _i37 < _a36.length; _i37++) {
    const v_k = _a36[_i37];
    const _h38 = clueAt(cl.number, v_k);
    L39: {
      const v_n = _h38;
      if (!((v_n > 0))) break L39;
      let _g40 = 0;
      G41: {
        const _a42 = sp.adj4[v_k];
        for (let _i43 = 0; _i43 < _a42.length; _i43++) {
          const v_a = _a42[_i43];
          const _t44 = ray(sp, v_k, v_a);
          const _h47 = _t44.length;
          let _g45 = -1;
          G46: {
            for (let v_i = 0; v_i <= _h47; v_i++) {
              if (!(((v_i === _h47) || (b.value((_t44[v_i] ?? -1)) !== 2)))) continue;
              _g45 = v_i;
              break G46;
            }
          }
          _g40 += _g45;
        }
      }
      const v_W = (1 + _g40);
      const _h54 = (v_n - v_W);
      const _h60 = (v_W <= v_n);
      const _a48 = sp.adj4[v_k];
      for (let _i49 = 0; _i49 < _a48.length; _i49++) {
        const v_a = _a48[_i49];
        const v_R = ray(sp, v_k, v_a);
        const _h52 = v_R.length;
        let _g50 = -1;
        G51: {
          for (let v_i = 0; v_i <= _h52; v_i++) {
            if (!(((v_i === _h52) || (b.value((v_R[v_i] ?? -1)) !== 2)))) continue;
            _g50 = v_i;
            break G51;
          }
        }
        L53: {
          const v_s = _g50;
          let _g55 = -1;
          G56: {
            for (let v_i = 0; v_i <= _h52; v_i++) {
              if (!(((v_i === _h52) || (b.value((v_R[v_i] ?? -1)) === 1)))) continue;
              _g55 = v_i;
              break G56;
            }
          }
          const _t57 = (_h54 + v_s);
          let _g58 = -1;
          G59: {
            for (let v_i = _h52; v_i >= v_s; v_i--) {
              if (!(((v_i === v_s) || (((v_i <= _t57) && (v_i <= _g55)) && ((v_i === _h52) || (b.value((v_R[v_i] ?? -1)) !== 2)))))) continue;
              _g58 = v_i;
              break G59;
            }
          }
          if (!((_g58 === v_s))) break L53;
          facts.length = 0;
          changed = false;
          let _c63: boolean = _h60;
          if (_c63) {
            let _c62: boolean = (v_s === _h52);
            if (!_c62) {
              const _t61 = (v_R[v_s] ?? -1);
              if (!b.known(_t61)) { if (fire === null) { b.placeAt(_t61, 1); changed = true; } else facts.push(PLACE, _t61, 1); }
              _c62 = true;
            }
            _c63 = _c62;
          }
          if (!(_c63)) return -1;
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
  const _a101 = sp.cells;
  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
    const v_k = _a101[_i102];
    const _h103 = clueAt(cl.number, v_k);
    L104: {
      const v_n = _h103;
      if (!((v_n > 0))) break L104;
      let _g105 = 0;
      G106: {
        const _a107 = sp.adj4[v_k];
        for (let _i108 = 0; _i108 < _a107.length; _i108++) {
          const v_a = _a107[_i108];
          const _t109 = ray(sp, v_k, v_a);
          const _h112 = _t109.length;
          let _g110 = -1;
          G111: {
            for (let v_i = 0; v_i <= _h112; v_i++) {
              if (!(((v_i === _h112) || (b.value((_t109[v_i] ?? -1)) !== 2)))) continue;
              _g110 = v_i;
              break G111;
            }
          }
          _g105 += _g110;
        }
      }
      const v_W = (1 + _g105);
      const _h120 = (v_n - v_W);
      let _g113 = 0;
      G114: {
        const _a115 = sp.adj4[v_k];
        for (let _i116 = 0; _i116 < _a115.length; _i116++) {
          const v_b = _a115[_i116];
          const v_B = ray(sp, v_k, v_b);
          const _h119 = v_B.length;
          let _g117 = -1;
          G118: {
            for (let v_i = 0; v_i <= _h119; v_i++) {
              if (!(((v_i === _h119) || (b.value((v_B[v_i] ?? -1)) !== 2)))) continue;
              _g117 = v_i;
              break G118;
            }
          }
          const v_t = _g117;
          let _g121 = -1;
          G122: {
            for (let v_i = 0; v_i <= _h119; v_i++) {
              if (!(((v_i === _h119) || (b.value((v_B[v_i] ?? -1)) === 1)))) continue;
              _g121 = v_i;
              break G122;
            }
          }
          const _t123 = (_h120 + v_t);
          let _g124 = -1;
          G125: {
            for (let v_i = _h119; v_i >= v_t; v_i--) {
              if (!(((v_i === v_t) || (((v_i <= _t123) && (v_i <= _g121)) && ((v_i === _h119) || (b.value((v_B[v_i] ?? -1)) !== 2)))))) continue;
              _g124 = v_i;
              break G125;
            }
          }
          _g113 += _g124;
        }
      }
      const v_M = (1 + _g113);
      const _h136 = (v_M >= v_n);
      const _h141 = (v_n - v_M);
      const _a126 = sp.adj4[v_k];
      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
        const v_a = _a126[_i127];
        const v_R = ray(sp, v_k, v_a);
        const _h130 = v_R.length;
        let _g128 = -1;
        G129: {
          for (let v_i = 0; v_i <= _h130; v_i++) {
            if (!(((v_i === _h130) || (b.value((v_R[v_i] ?? -1)) !== 2)))) continue;
            _g128 = v_i;
            break G129;
          }
        }
        const v_s = _g128;
        let _g131 = -1;
        G132: {
          for (let v_i = 0; v_i <= _h130; v_i++) {
            if (!(((v_i === _h130) || (b.value((v_R[v_i] ?? -1)) === 1)))) continue;
            _g131 = v_i;
            break G132;
          }
        }
        const _t133 = (_h120 + v_s);
        let _g134 = -1;
        G135: {
          for (let v_i = _h130; v_i >= v_s; v_i--) {
            if (!(((v_i === v_s) || (((v_i <= _t133) && (v_i <= _g131)) && ((v_i === _h130) || (b.value((v_R[v_i] ?? -1)) !== 2)))))) continue;
            _g134 = v_i;
            break G135;
          }
        }
        const v_f = _g134;
        const _h142 = (_h141 + v_f);
        facts.length = 0;
        changed = false;
        let _c143: boolean = _h136;
        if (_c143) {
          let _q137 = true;
          Q138: {
            const _a139 = v_R;
            for (let _i140 = 0; _i140 < _a139.length; _i140++) {
              const v_p = _a139[_i140];
              if (!((_i140 < _h142))) continue;
              if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
              if (!(true)) {
                _q137 = false;
                break Q138;
              }
            }
          }
          _c143 = _q137;
        }
        if (!(_c143)) return -1;
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
  const _g152: number[] = [];
  const facts = cutFacts;
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
  const v_U = _g152;
  const _h160 = connected(sp, v_U);
  const v_K = cuts(sp, v_U);
  const _a158 = v_K;
  for (let _i159 = 0; _i159 < _a158.length; _i159++) {
    const v_c = _a158[_i159];
    if (!(!(b.known(v_c)))) continue;
    facts.length = 0;
    changed = false;
    let _c161: boolean = _h160;
    if (_c161) {
      if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
      _c161 = true;
    }
    if (!(_c161)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ U: v_U, K: v_K, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}
