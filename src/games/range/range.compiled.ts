// Compiled by `npm run describe` from src/games/range/range.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, cellsValued, clueAt, connected, cuts, freshBinding, keptStore, ray, sameSet, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g208: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q198 = true;
  Q199: {
    const _a200 = sp.cells;
    for (let _i201 = 0; _i201 < _a200.length; _i201++) {
      const v_c = _a200[_i201];
      const _h202 = (g[v_c] || -1);
      if (!((_h202 === 1))) continue;
      let _q203 = true;
      Q204: {
        const _a205 = sp.adj4[v_c];
        for (let _i206 = 0; _i206 < _a205.length; _i206++) {
          const v_p = _a205[_i206];
          const _h207 = (g[v_p] || -1);
          if (!((_h207 === 2))) {
            _q203 = false;
            break Q204;
          }
        }
      }
      if (!(_q203)) {
        _q198 = false;
        break Q199;
      }
    }
  }
  if (!(_q198)) return false;
  _g208.length = 0;
  G209: {
    const _a212 = sp.cells;
    for (let _i213 = 0; _i213 < _a212.length; _i213++) {
      const v_c = _a212[_i213];
      const _h214 = (g[v_c] || -1);
      if (!((_h214 !== 1))) continue;
      _g208.push(v_c);
    }
  }
  if (!(connected(sp, _g208))) return false;
  for (let _k215 = 0; _k215 < cl.number.at.length; _k215++) {
    const _at216 = cl.number.at[_k215];
    const _v217 = cl.number.v[_k215];
    let _g218 = 0;
    G219: {
      const _a220 = sp.adj4[_at216];
      for (let _i221 = 0; _i221 < _a220.length; _i221++) {
        const v_a = _a220[_i221];
        const _t222 = ray(sp, _at216, v_a);
        const _h225 = _t222.length;
        let _g223 = -1;
        G224: {
          for (let v_i = 0; v_i <= _h225; v_i++) {
            const _h226 = (g[(_t222[v_i] ?? -1)] || -1);
            if (!(((v_i === _h225) || (_h226 !== 2)))) continue;
            _g223 = v_i;
            break G224;
          }
        }
        _g218 += _g223;
      }
    }
    if (!(((1 + _g218) === _v217))) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("besideShaded", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1)], ["c in", "where of c"]);
    }
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
      const _h62 = (v_W <= v_n);
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
          if (import.meta.env.DEV && staleChecking) {
            let _g52 = -1;
            G53: {
              const _t54 = v_R.length;
              for (let v_i = 0; v_i <= _t54; v_i++) {
                if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
                _g52 = v_i;
                break G53;
              }
            }
            let _g55 = -1;
            G56: {
              const _t57 = v_R.length;
              for (let v_i = 0; v_i <= _t57; v_i++) {
                if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
                _g55 = v_i;
                break G56;
              }
            }
            const _t58 = ((v_n - v_W) + v_s);
            let _g59 = -1;
            G60: {
              const _t61 = v_R.length;
              for (let v_i = _t61; v_i >= v_s; v_i--) {
                if (!(((v_i === v_s) || (((v_i <= _t58) && (v_i <= _g55)) && ((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
                _g59 = v_i;
                break G60;
              }
            }
            freshBinding("capped", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n > 0), (v_W === sees(b, sp, v_k)), (sp.adj4[v_k].includes(v_a)), sameSet(v_R, ray(sp, v_k, v_a)), (v_s === _g52), (_g59 === v_s)], ["k in", "n =", "where of n", "W =", "a in", "R =", "s =", "where of s"]);
          }
          facts.length = 0;
          changed = false;
          let _c65: boolean = _h62;
          if (_c65) {
            let _c64: boolean = (v_s === _h44);
            if (!_c64) {
              const _t63 = (v_R[v_s] ?? -1);
              if (!(b.grid[_t63] !== 0)) { if (fire === null) { b.placeAt(_t63, 1); changed = true; } else facts.push(PLACE, _t63, 1); }
              _c64 = true;
            }
            _c65 = _c64;
          }
          if (!(_c65)) return -1;
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
  const _a95 = sp.cells;
  R1:
  for (let _i96 = 0; _i96 < _a95.length; _i96++) {
    const v_k = _a95[_i96];
    const _h97 = clueAt(cl.number, v_k);
    L98: {
      const v_n = _h97;
      if (!((v_n > 0))) break L98;
      const _m56_0 = b.made[0];
      const _m56_1 = b.made[1];
      const v_W = sees(b, sp, v_k);
      const _h106 = (v_n - v_W);
      let _g99 = 0;
      G100: {
        const _a101 = sp.adj4[v_k];
        for (let _i102 = 0; _i102 < _a101.length; _i102++) {
          const v_b = _a101[_i102];
          const v_B = ray(sp, v_k, v_b);
          const _h105 = v_B.length;
          let _g103 = -1;
          G104: {
            for (let v_i = 0; v_i <= _h105; v_i++) {
              if (!(((v_i === _h105) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g103 = v_i;
              break G104;
            }
          }
          const v_t = _g103;
          let _g107 = -1;
          G108: {
            for (let v_i = 0; v_i <= _h105; v_i++) {
              if (!(((v_i === _h105) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
              _g107 = v_i;
              break G108;
            }
          }
          const _t109 = (_h106 + v_t);
          let _g110 = -1;
          G111: {
            for (let v_i = _h105; v_i >= v_t; v_i--) {
              if (!(((v_i === v_t) || (((v_i <= _t109) && (v_i <= _g107)) && ((v_i === _h105) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g110 = v_i;
              break G111;
            }
          }
          _g99 += _g110;
        }
      }
      const v_M = (1 + _g99);
      const _h160 = (v_M >= v_n);
      const _h165 = (v_n - v_M);
      const _a112 = sp.adj4[v_k];
      for (let _i113 = 0; _i113 < _a112.length; _i113++) {
        const v_a = _a112[_i113];
        const v_R = ray(sp, v_k, v_a);
        const _h116 = v_R.length;
        let _g114 = -1;
        G115: {
          for (let v_i = 0; v_i <= _h116; v_i++) {
            if (!(((v_i === _h116) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g114 = v_i;
            break G115;
          }
        }
        const v_s = _g114;
        let _g117 = -1;
        G118: {
          for (let v_i = 0; v_i <= _h116; v_i++) {
            if (!(((v_i === _h116) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
            _g117 = v_i;
            break G118;
          }
        }
        const _t119 = (_h106 + v_s);
        let _g120 = -1;
        G121: {
          for (let v_i = _h116; v_i >= v_s; v_i--) {
            if (!(((v_i === v_s) || (((v_i <= _t119) && (v_i <= _g117)) && ((v_i === _h116) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
            _g120 = v_i;
            break G121;
          }
        }
        const v_f = _g120;
        const _h166 = (_h165 + v_f);
        if (b.made[0] !== _m56_0 || b.made[1] !== _m56_1) {
          if (!((v_W === sees(b, sp, v_k)))) { continue R1; }
          let _g122 = 0;
          G123: {
            const _a124 = sp.adj4[v_k];
            for (let _i125 = 0; _i125 < _a124.length; _i125++) {
              const v_b = _a124[_i125];
              const v_B = ray(sp, v_k, v_b);
              let _g126 = -1;
              G127: {
                const _t128 = v_B.length;
                for (let v_i = 0; v_i <= _t128; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                  _g126 = v_i;
                  break G127;
                }
              }
              const v_t = _g126;
              let _g129 = -1;
              G130: {
                const _t131 = v_B.length;
                for (let v_i = 0; v_i <= _t131; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
                  _g129 = v_i;
                  break G130;
                }
              }
              const _t132 = ((v_n - v_W) + v_t);
              let _g133 = -1;
              G134: {
                const _t135 = v_B.length;
                for (let v_i = _t135; v_i >= v_t; v_i--) {
                  if (!(((v_i === v_t) || (((v_i <= _t132) && (v_i <= _g129)) && ((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
                  _g133 = v_i;
                  break G134;
                }
              }
              _g122 += _g133;
            }
          }
          if (!((v_M === (1 + _g122)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _g136 = 0;
          G137: {
            const _a138 = sp.adj4[v_k];
            for (let _i139 = 0; _i139 < _a138.length; _i139++) {
              const v_b = _a138[_i139];
              const v_B = ray(sp, v_k, v_b);
              let _g140 = -1;
              G141: {
                const _t142 = v_B.length;
                for (let v_i = 0; v_i <= _t142; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                  _g140 = v_i;
                  break G141;
                }
              }
              const v_t = _g140;
              let _g143 = -1;
              G144: {
                const _t145 = v_B.length;
                for (let v_i = 0; v_i <= _t145; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
                  _g143 = v_i;
                  break G144;
                }
              }
              const _t146 = ((v_n - v_W) + v_t);
              let _g147 = -1;
              G148: {
                const _t149 = v_B.length;
                for (let v_i = _t149; v_i >= v_t; v_i--) {
                  if (!(((v_i === v_t) || (((v_i <= _t146) && (v_i <= _g143)) && ((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
                  _g147 = v_i;
                  break G148;
                }
              }
              _g136 += _g147;
            }
          }
          let _g150 = -1;
          G151: {
            const _t152 = v_R.length;
            for (let v_i = 0; v_i <= _t152; v_i++) {
              if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g150 = v_i;
              break G151;
            }
          }
          let _g153 = -1;
          G154: {
            const _t155 = v_R.length;
            for (let v_i = 0; v_i <= _t155; v_i++) {
              if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
              _g153 = v_i;
              break G154;
            }
          }
          const _t156 = ((v_n - v_W) + v_s);
          let _g157 = -1;
          G158: {
            const _t159 = v_R.length;
            for (let v_i = _t159; v_i >= v_s; v_i--) {
              if (!(((v_i === v_s) || (((v_i <= _t156) && (v_i <= _g153)) && ((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g157 = v_i;
              break G158;
            }
          }
          freshBinding("reach", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n > 0), (v_W === sees(b, sp, v_k)), (v_M === (1 + _g136)), (sp.adj4[v_k].includes(v_a)), sameSet(v_R, ray(sp, v_k, v_a)), (v_s === _g150), (v_f === _g157)], ["k in", "n =", "where of n", "W =", "M =", "a in", "R =", "s =", "f ="]);
        }
        facts.length = 0;
        changed = false;
        let _c167: boolean = _h160;
        if (_c167) {
          let _q161 = true;
          Q162: {
            const _a163 = v_R;
            for (let _i164 = 0; _i164 < _a163.length; _i164++) {
              const v_p = _a163[_i164];
              if (!((_i164 < _h166))) continue;
              if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
              if (!(true)) {
                _q161 = false;
                break Q162;
              }
            }
          }
          _c167 = _q161;
        }
        if (!(_c167)) return -1;
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
  const _g176: number[] = [];
  const _g184: number[] = [];
  const facts = cutFacts;
  let fired = 0;
  let changed = false;
  const _m101_0 = b.made[0];
  _g176.length = 0;
  G177: {
    const _a180 = sp.cells;
    for (let _i181 = 0; _i181 < _a180.length; _i181++) {
      const v_c = _a180[_i181];
      if (!(((b.grid[v_c] || -1) !== 1))) continue;
      _g176.push(v_c);
    }
  }
  const v_U = _g176;
  const _h196 = connected(sp, v_U);
  const v_K = cuts(sp, v_U);
  const _a182 = v_K;
  for (let _i183 = 0; _i183 < _a182.length; _i183++) {
    const v_c = _a182[_i183];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    if (b.made[0] !== _m101_0) {
      _g184.length = 0;
      G185: {
        const _a188 = sp.cells;
        for (let _i189 = 0; _i189 < _a188.length; _i189++) {
          const v_c = _a188[_i189];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g184.push(v_c);
        }
      }
      if (!(sameSet(v_U, _g184))) { return fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
      const _g190: number[] = [];
      G191: {
        const _a194 = sp.cells;
        for (let _i195 = 0; _i195 < _a194.length; _i195++) {
          const v_c = _a194[_i195];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g190.push(v_c);
        }
      }
      freshBinding("cut", [sameSet(v_U, _g190), sameSet(v_K, cuts(sp, v_U)), (v_K.includes(v_c)), !((b.grid[v_c] !== 0))], ["U =", "K =", "c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c197: boolean = _h196;
    if (_c197) {
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
      _c197 = true;
    }
    if (!(_c197)) return -1;
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
