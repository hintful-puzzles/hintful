// Compiled by `npm run describe` from src/games/range/range.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, cellsValued, clueAt, connected, cuts, keptStore, ray, sameSet, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g168: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q158 = true;
  Q159: {
    const _a160 = sp.cells;
    for (let _i161 = 0; _i161 < _a160.length; _i161++) {
      const v_c = _a160[_i161];
      const _h162 = (g[v_c] || -1);
      if (!((_h162 === 1))) continue;
      let _q163 = true;
      Q164: {
        const _a165 = sp.adj4[v_c];
        for (let _i166 = 0; _i166 < _a165.length; _i166++) {
          const v_p = _a165[_i166];
          const _h167 = (g[v_p] || -1);
          if (!((_h167 === 2))) {
            _q163 = false;
            break Q164;
          }
        }
      }
      if (!(_q163)) {
        _q158 = false;
        break Q159;
      }
    }
  }
  if (!(_q158)) return false;
  _g168.length = 0;
  G169: {
    const _a172 = sp.cells;
    for (let _i173 = 0; _i173 < _a172.length; _i173++) {
      const v_c = _a172[_i173];
      const _h174 = (g[v_c] || -1);
      if (!((_h174 !== 1))) continue;
      _g168.push(v_c);
    }
  }
  if (!(connected(sp, _g168))) return false;
  for (let _k175 = 0; _k175 < cl.number.at.length; _k175++) {
    const _at176 = cl.number.at[_k175];
    const _v177 = cl.number.v[_k175];
    let _g178 = 0;
    G179: {
      const _a180 = sp.adj4[_at176];
      for (let _i181 = 0; _i181 < _a180.length; _i181++) {
        const v_a = _a180[_i181];
        const _t182 = ray(sp, _at176, v_a);
        const _h185 = _t182.length;
        let _g183 = -1;
        G184: {
          for (let v_i = 0; v_i <= _h185; v_i++) {
            const _h186 = (g[(_t182[v_i] ?? -1)] || -1);
            if (!(((v_i === _h185) || (_h186 !== 2)))) continue;
            _g183 = v_i;
            break G184;
          }
        }
        _g178 += _g183;
      }
    }
    if (!(((1 + _g178) === _v177))) return false;
  }
  return true;
}

export interface BesideShadedBinding {
  c: number;
}

const besideShadedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function besideShaded(b: Marks, sp: GridSpace, fire: Fire<BesideShadedBinding> | null): number {
  const facts = besideShadedFacts;
  let fired = 0;
  let changed = false;
  const _a5 = cellsValued(b, sp.cells, 1);
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

/** Its dearest read grows with the board as n^1.5. */
export function capped(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CappedBinding> | null): number {
  const facts = cappedFacts;
  let fired = 0;
  let changed = false;
  const _a36 = sp.cells;
  R1:
  for (let _i37 = 0; _i37 < _a36.length; _i37++) {
    const v_k = _a36[_i37];
    const _h38 = clueAt(cl.number, v_k);
    L39: {
      const v_n = _h38;
      if (!((v_n > 0))) break L39;
      const _m22_0 = b.made[0];
      const _m22_1 = b.made[1];
      const v_W = sees(b, sp, v_k);
      const _h46 = (v_n - v_W);
      const _h52 = (v_W <= v_n);
      const _a40 = sp.adj4[v_k];
      for (let _i41 = 0; _i41 < _a40.length; _i41++) {
        const v_a = _a40[_i41];
        const v_R = ray(sp, v_k, v_a);
        const _h44 = v_R.length;
        let _g42 = -1;
        G43: {
          for (let v_i = 0; v_i <= _h44; v_i++) {
            if (!(((v_i === _h44) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g42 = v_i;
            break G43;
          }
        }
        L45: {
          const v_s = _g42;
          let _g47 = -1;
          G48: {
            for (let v_i = 0; v_i <= _h44; v_i++) {
              if (!(((v_i === _h44) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
              _g47 = v_i;
              break G48;
            }
          }
          const _t49 = (_h46 + v_s);
          let _g50 = -1;
          G51: {
            for (let v_i = _h44; v_i >= v_s; v_i--) {
              if (!(((v_i === v_s) || (((v_i <= _t49) && (v_i <= _g47)) && ((v_i === _h44) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g50 = v_i;
              break G51;
            }
          }
          if (!((_g50 === v_s))) break L45;
          if (b.made[0] !== _m22_0 || b.made[1] !== _m22_1) {
            if (!((v_W === sees(b, sp, v_k)))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _c55: boolean = _h52;
          if (_c55) {
            let _c54: boolean = (v_s === _h44);
            if (!_c54) {
              const _t53 = (v_R[v_s] ?? -1);
              if (!(b.grid[_t53] !== 0)) { if (fire === null) { b.placeAt(_t53, 1); changed = true; } else facts.push(PLACE, _t53, 1); }
              _c54 = true;
            }
            _c55 = _c54;
          }
          if (!(_c55)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, n: v_n, W: v_W, a: v_a, R: v_R.slice(), s: v_s }, facts)) return 1;
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

/** Its dearest read grows with the board as n^1.5. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding> | null): number {
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  const _a85 = sp.cells;
  R1:
  for (let _i86 = 0; _i86 < _a85.length; _i86++) {
    const v_k = _a85[_i86];
    const _h87 = clueAt(cl.number, v_k);
    L88: {
      const v_n = _h87;
      if (!((v_n > 0))) break L88;
      const _m56_0 = b.made[0];
      const _m56_1 = b.made[1];
      const v_W = sees(b, sp, v_k);
      const _h96 = (v_n - v_W);
      let _g89 = 0;
      G90: {
        const _a91 = sp.adj4[v_k];
        for (let _i92 = 0; _i92 < _a91.length; _i92++) {
          const v_b = _a91[_i92];
          const v_B = ray(sp, v_k, v_b);
          const _h95 = v_B.length;
          let _g93 = -1;
          G94: {
            for (let v_i = 0; v_i <= _h95; v_i++) {
              if (!(((v_i === _h95) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g93 = v_i;
              break G94;
            }
          }
          const v_t = _g93;
          let _g97 = -1;
          G98: {
            for (let v_i = 0; v_i <= _h95; v_i++) {
              if (!(((v_i === _h95) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
              _g97 = v_i;
              break G98;
            }
          }
          const _t99 = (_h96 + v_t);
          let _g100 = -1;
          G101: {
            for (let v_i = _h95; v_i >= v_t; v_i--) {
              if (!(((v_i === v_t) || (((v_i <= _t99) && (v_i <= _g97)) && ((v_i === _h95) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g100 = v_i;
              break G101;
            }
          }
          _g89 += _g100;
        }
      }
      const v_M = (1 + _g89);
      const _h126 = (v_M >= v_n);
      const _h131 = (v_n - v_M);
      const _a102 = sp.adj4[v_k];
      for (let _i103 = 0; _i103 < _a102.length; _i103++) {
        const v_a = _a102[_i103];
        const v_R = ray(sp, v_k, v_a);
        const _h106 = v_R.length;
        let _g104 = -1;
        G105: {
          for (let v_i = 0; v_i <= _h106; v_i++) {
            if (!(((v_i === _h106) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g104 = v_i;
            break G105;
          }
        }
        const v_s = _g104;
        let _g107 = -1;
        G108: {
          for (let v_i = 0; v_i <= _h106; v_i++) {
            if (!(((v_i === _h106) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
            _g107 = v_i;
            break G108;
          }
        }
        const _t109 = (_h96 + v_s);
        let _g110 = -1;
        G111: {
          for (let v_i = _h106; v_i >= v_s; v_i--) {
            if (!(((v_i === v_s) || (((v_i <= _t109) && (v_i <= _g107)) && ((v_i === _h106) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
            _g110 = v_i;
            break G111;
          }
        }
        const v_f = _g110;
        const _h132 = (_h131 + v_f);
        if (b.made[0] !== _m56_0 || b.made[1] !== _m56_1) {
          if (!((v_W === sees(b, sp, v_k)))) { continue R1; }
          let _g112 = 0;
          G113: {
            const _a114 = sp.adj4[v_k];
            for (let _i115 = 0; _i115 < _a114.length; _i115++) {
              const v_b = _a114[_i115];
              const v_B = ray(sp, v_k, v_b);
              let _g116 = -1;
              G117: {
                const _t118 = v_B.length;
                for (let v_i = 0; v_i <= _t118; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                  _g116 = v_i;
                  break G117;
                }
              }
              const v_t = _g116;
              let _g119 = -1;
              G120: {
                const _t121 = v_B.length;
                for (let v_i = 0; v_i <= _t121; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
                  _g119 = v_i;
                  break G120;
                }
              }
              const _t122 = ((v_n - v_W) + v_t);
              let _g123 = -1;
              G124: {
                const _t125 = v_B.length;
                for (let v_i = _t125; v_i >= v_t; v_i--) {
                  if (!(((v_i === v_t) || (((v_i <= _t122) && (v_i <= _g119)) && ((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
                  _g123 = v_i;
                  break G124;
                }
              }
              _g112 += _g123;
            }
          }
          if (!((v_M === (1 + _g112)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c133: boolean = _h126;
        if (_c133) {
          let _q127 = true;
          Q128: {
            const _a129 = v_R;
            for (let _i130 = 0; _i130 < _a129.length; _i130++) {
              const v_p = _a129[_i130];
              if (!((_i130 < _h132))) continue;
              if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
              if (!(true)) {
                _q127 = false;
                break Q128;
              }
            }
          }
          _c133 = _q127;
        }
        if (!(_c133)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ k: v_k, n: v_n, W: v_W, M: v_M, a: v_a, R: v_R.slice(), s: v_s, f: v_f }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function cut(b: Marks, sp: GridSpace, fire: Fire<CutBinding> | null): number {
  const _g142: number[] = [];
  const _g150: number[] = [];
  const facts = cutFacts;
  let fired = 0;
  let changed = false;
  const _m101_0 = b.made[0];
  _g142.length = 0;
  G143: {
    const _a146 = sp.cells;
    for (let _i147 = 0; _i147 < _a146.length; _i147++) {
      const v_c = _a146[_i147];
      if (!(((b.grid[v_c] || -1) !== 1))) continue;
      _g142.push(v_c);
    }
  }
  const v_U = _g142;
  const _h156 = connected(sp, v_U);
  const v_K = cuts(sp, v_U);
  const _a148 = v_K;
  for (let _i149 = 0; _i149 < _a148.length; _i149++) {
    const v_c = _a148[_i149];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    if (b.made[0] !== _m101_0) {
      _g150.length = 0;
      G151: {
        const _a154 = sp.cells;
        for (let _i155 = 0; _i155 < _a154.length; _i155++) {
          const v_c = _a154[_i155];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g150.push(v_c);
        }
      }
      if (!(sameSet(v_U, _g150))) { return fired; }
    }
    facts.length = 0;
    changed = false;
    let _c157: boolean = _h156;
    if (_c157) {
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
      _c157 = true;
    }
    if (!(_c157)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ U: v_U.slice(), K: v_K.slice(), c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

const seesKept = keptStore<number>();

/** `sees(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function sees(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = seesKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g15 = 0;
  G16: {
    const _a17 = sp.adj4[v_k];
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_a = _a17[_i18];
      const _t19 = ray(sp, v_k, v_a);
      let _g20 = -1;
      G21: {
        const _t22 = _t19.length;
        for (let v_i = 0; v_i <= _t22; v_i++) {
          if (!(((v_i === _t19.length) || ((b.grid[(_t19[v_i] ?? -1)] || -1) !== 2)))) continue;
          _g20 = v_i;
          break G21;
        }
      }
      _g15 += _g20;
    }
  }
  const _made = (1 + _g15);
  _kept[v_k] = _made;
  return _made;
}
