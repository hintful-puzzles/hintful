// Compiled by `npm run describe` from src/games/range/range.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, connected, cuts, freshBinding, keptStore, ray, sameSet, setOf, staleChecking, stamps, type Kept, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  besideShaded: BesideShadedSays;
  capped: CappedSays;
  reach: ReachSays;
  cut: CutSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["besideShaded","capped.satisfied","capped.overrun","reach","cut"] as const;

/** The techniques whose step is made for each square the firing decides. */
export const SAYS_EACH: readonly (keyof SaysById)[] = ["besideShaded","capped","reach","cut"];

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
  const _g11: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = (g[v_c] || -1);
      if (!((_h5 === 1))) continue;
      let _q6 = true;
      Q7: {
        const _a8 = sp.adj4[v_c];
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_p = _a8[_i9];
          const _h10 = (g[v_p] || -1);
          if (!((_h10 === 2))) {
            _q6 = false;
            break Q7;
          }
        }
      }
      if (!(_q6)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  _g11.length = 0;
  G12: {
    const _a15 = sp.cells;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_c = _a15[_i16];
      const _h17 = (g[v_c] || -1);
      if (!((_h17 !== 1))) continue;
      _g11.push(v_c);
    }
  }
  if (!(connected(sp, _g11))) return false;
  for (let _k18 = 0; _k18 < cl.number.at.length; _k18++) {
    const _at19 = cl.number.at[_k18];
    const _v20 = cl.number.v[_k18];
    let _g21 = 0;
    G22: {
      const _a23 = sp.adj4[_at19];
      for (let _i24 = 0; _i24 < _a23.length; _i24++) {
        const v_a = _a23[_i24];
        const _t25 = ray(sp, _at19, v_a);
        const _h28 = _t25.length;
        let _g26 = -1;
        G27: {
          for (let v_i = 0; v_i <= _h28; v_i++) {
            const _h29 = (g[(_t25[v_i] ?? -1)] || -1);
            if (!(((v_i === _h28) || (_h29 !== 2)))) continue;
            _g26 = v_i;
            break G27;
          }
        }
        _g21 += _g26;
      }
    }
    if (!(((1 + _g21) === _v20))) return false;
  }
  return true;
}

export interface BesideShadedBinding {
  c: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface BesideShadedSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const besideShadedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function besideShaded(b: Marks, sp: GridSpace, fire: Fire<BesideShadedBinding, BesideShadedSays> | null): number {
  const facts = besideShadedFacts;
  let fired = 0;
  let changed = false;
  const _a3 = cellsValued(b, sp.cells, 1);
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    if (DEV && staleChecking) {
      freshBinding("besideShaded", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1)], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      const _a7 = sp.adj4[v_c];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_p = _a7[_i8];
        let _c9: boolean = ((b.grid[v_p] || -1) !== 1);
        if (_c9) {
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
          _c9 = true;
        }
        if (!(_c9)) {
          _q5 = false;
          break Q6;
        }
      }
    }
    if (!(_q5)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: {  }, marks: { outline: setOf(v_c).slice() } };
        if (!fire({ c: v_c }, facts, _says)) return 1;
      }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; the arm that holds says which way it reads. */
export type CappedSays =
  | { arm: "satisfied"; terms: { clue: number; value: number; }; marks: { outline: readonly number[]; } }
  | { arm: "overrun"; terms: { clue: number; value: number; }; marks: { outline: readonly number[]; } }
;

const cappedFacts: number[] = [];
const capped_st58 = stamps();
const capped_st76 = stamps();

/** Its dearest read grows with the board as n^1.5. */
export function capped(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CappedBinding, CappedSays> | null): number {
  const _g49: number[] = [];
  const _g67: number[] = [];
  const facts = cappedFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.cells;
  R1:
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_k = _a17[_i18];
    const _h19 = clueAt(cl.number, v_k);
    L20: {
      const v_n = _h19;
      if (!((v_n > 0))) break L20;
      const _m85_0 = b.made[0];
      const _m86_1 = b.made[1];
      const v_W = sees(b, sp, v_k);
      const _h27 = (v_n - v_W);
      const _h43 = (v_W <= v_n);
      const _h47 = (v_W === v_n);
      const _h48 = (v_W !== v_n);
      const _a21 = sp.adj4[v_k];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_a = _a21[_i22];
        const v_R = ray(sp, v_k, v_a);
        const _h25 = v_R.length;
        let _g23 = -1;
        G24: {
          for (let v_i = 0; v_i <= _h25; v_i++) {
            if (!(((v_i === _h25) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g23 = v_i;
            break G24;
          }
        }
        L26: {
          const v_s = _g23;
          let _g28 = -1;
          G29: {
            for (let v_i = 0; v_i <= _h25; v_i++) {
              if (!(((v_i === _h25) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
              _g28 = v_i;
              break G29;
            }
          }
          const _t30 = (_h27 + v_s);
          let _g31 = -1;
          G32: {
            for (let v_i = _h25; v_i >= v_s; v_i--) {
              if (!(((v_i === v_s) || (((v_i <= _t30) && (v_i <= _g28)) && ((v_i === _h25) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g31 = v_i;
              break G32;
            }
          }
          if (!((_g31 === v_s))) break L26;
          if (b.made[0] !== _m85_0 || b.made[1] !== _m86_1) {
            if (!((v_W === sees(b, sp, v_k)))) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _g33 = -1;
            G34: {
              const _t35 = v_R.length;
              for (let v_i = 0; v_i <= _t35; v_i++) {
                if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
                _g33 = v_i;
                break G34;
              }
            }
            let _g36 = -1;
            G37: {
              const _t38 = v_R.length;
              for (let v_i = 0; v_i <= _t38; v_i++) {
                if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
                _g36 = v_i;
                break G37;
              }
            }
            const _t39 = ((v_n - v_W) + v_s);
            let _g40 = -1;
            G41: {
              const _t42 = v_R.length;
              for (let v_i = _t42; v_i >= v_s; v_i--) {
                if (!(((v_i === v_s) || (((v_i <= _t39) && (v_i <= _g36)) && ((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
                _g40 = v_i;
                break G41;
              }
            }
            freshBinding("capped", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n > 0), (v_W === sees(b, sp, v_k)), (sp.adj4[v_k].includes(v_a)), sameSet(v_R, ray(sp, v_k, v_a)), (v_s === _g33), (_g40 === v_s)], ["k in", "n =", "where of n", "W =", "a in", "R =", "s =", "where of s"]);
          }
          facts.length = 0;
          changed = false;
          let _c46: boolean = _h43;
          if (_c46) {
            let _c45: boolean = (v_s === _h25);
            if (!_c45) {
              const _t44 = (v_R[v_s] ?? -1);
              if (!(b.grid[_t44] !== 0)) { if (fire === null) { b.placeAt(_t44, 1); changed = true; } else facts.push(PLACE, _t44, 1); }
              _c45 = true;
            }
            _c46 = _c45;
          }
          if (!(_c46)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              let _arm = -1;
              if (_h47) _arm = 0; else if (_h48) _arm = 1;
              let _says: CappedSays | null = null;
              if (_arm === 0) {
                _g49.length = 0;
                capped_st58.pass++;
                G50: {
                  const _a59 = sp.adj4[v_k];
                  for (let _i60 = 0; _i60 < _a59.length; _i60++) {
                    const v_b = _a59[_i60];
                    const v_B = ray(sp, v_k, v_b);
                    const _h65 = v_B.length;
                    const _a61 = v_B;
                    for (let _i62 = 0; _i62 < _a61.length; _i62++) {
                      const v_p = _a61[_i62];
                      let _g63 = -1;
                      G64: {
                        for (let v_i = 0; v_i <= _h65; v_i++) {
                          if (!(((v_i === _h65) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                          _g63 = v_i;
                          break G64;
                        }
                      }
                      if (!((_i62 < _g63))) continue;
                      const _t66 = v_p;
                      if (_g49.length < 16) { if (!_g49.includes(_t66)) _g49.push(_t66); } else addOnce(_g49, capped_st58, _t66);
                    }
                  }
                }
                _says = { arm: "satisfied", terms: { clue: v_k, value: v_n }, marks: { outline: union(setOf(v_k), _g49).slice() } };
              }
              if (_arm === 1) {
                _g67.length = 0;
                capped_st76.pass++;
                G68: {
                  const _a77 = sp.adj4[v_k];
                  for (let _i78 = 0; _i78 < _a77.length; _i78++) {
                    const v_b = _a77[_i78];
                    const v_B = ray(sp, v_k, v_b);
                    const _h83 = v_B.length;
                    const _a79 = v_B;
                    for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                      const v_p = _a79[_i80];
                      let _g81 = -1;
                      G82: {
                        for (let v_i = 0; v_i <= _h83; v_i++) {
                          if (!(((v_i === _h83) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                          _g81 = v_i;
                          break G82;
                        }
                      }
                      if (!((_i80 < _g81))) continue;
                      const _t84 = v_p;
                      if (_g67.length < 16) { if (!_g67.includes(_t84)) _g67.push(_t84); } else addOnce(_g67, capped_st76, _t84);
                    }
                  }
                }
                _says = { arm: "overrun", terms: { clue: v_k, value: v_n }, marks: { outline: union(setOf(v_k), _g67).slice() } };
              }
              if (_says === null) throw new Error("capped: no arm of says holds");
              if (!fire({ k: v_k, n: v_n, W: v_W, a: v_a, R: v_R.slice(), s: v_s }, facts, _says)) return 1;
            }
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

/** What a square the firing decides has of its own, read where it is made. */
export interface ReachSaysFact {
  terms: {  };
  marks: { outline: readonly number[]; stripes: readonly number[]; };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface ReachSays {
  terms: { clue: number; value: number; };
  marks: { outline: readonly number[]; };
  facts: ReachSaysFact[];
}

const reachFacts: number[] = [];
const reachFactSays: ReachSaysFact[] = [];
const reach_st137 = stamps();

/** Its dearest read grows with the board as n^1.5. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding, ReachSays> | null): number {
  const _g102: number[] = [];
  const _g120: number[] = [];
  const _g127: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  const _a30 = sp.cells;
  R1:
  for (let _i31 = 0; _i31 < _a30.length; _i31++) {
    const v_k = _a30[_i31];
    const _h32 = clueAt(cl.number, v_k);
    L33: {
      const v_n = _h32;
      if (!((v_n > 0))) break L33;
      const _m148_0 = b.made[0];
      const _m149_1 = b.made[1];
      const v_W = sees(b, sp, v_k);
      const _h41 = (v_n - v_W);
      let _g34 = 0;
      G35: {
        const _a36 = sp.adj4[v_k];
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          const v_b = _a36[_i37];
          const v_B = ray(sp, v_k, v_b);
          const _h40 = v_B.length;
          let _g38 = -1;
          G39: {
            for (let v_i = 0; v_i <= _h40; v_i++) {
              if (!(((v_i === _h40) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g38 = v_i;
              break G39;
            }
          }
          const v_t = _g38;
          let _g42 = -1;
          G43: {
            for (let v_i = 0; v_i <= _h40; v_i++) {
              if (!(((v_i === _h40) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
              _g42 = v_i;
              break G43;
            }
          }
          const _t44 = (_h41 + v_t);
          let _g45 = -1;
          G46: {
            for (let v_i = _h40; v_i >= v_t; v_i--) {
              if (!(((v_i === v_t) || (((v_i <= _t44) && (v_i <= _g42)) && ((v_i === _h40) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g45 = v_i;
              break G46;
            }
          }
          _g34 += _g45;
        }
      }
      const v_M = (1 + _g34);
      const _h95 = (v_M >= v_n);
      const _h100 = (v_n - v_M);
      const _a47 = sp.adj4[v_k];
      for (let _i48 = 0; _i48 < _a47.length; _i48++) {
        const v_a = _a47[_i48];
        const v_R = ray(sp, v_k, v_a);
        const _h51 = v_R.length;
        let _g49 = -1;
        G50: {
          for (let v_i = 0; v_i <= _h51; v_i++) {
            if (!(((v_i === _h51) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
            _g49 = v_i;
            break G50;
          }
        }
        const v_s = _g49;
        let _g52 = -1;
        G53: {
          for (let v_i = 0; v_i <= _h51; v_i++) {
            if (!(((v_i === _h51) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
            _g52 = v_i;
            break G53;
          }
        }
        const _t54 = (_h41 + v_s);
        let _g55 = -1;
        G56: {
          for (let v_i = _h51; v_i >= v_s; v_i--) {
            if (!(((v_i === v_s) || (((v_i <= _t54) && (v_i <= _g52)) && ((v_i === _h51) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
            _g55 = v_i;
            break G56;
          }
        }
        const v_f = _g55;
        const _h101 = (_h100 + v_f);
        if (b.made[0] !== _m148_0 || b.made[1] !== _m149_1) {
          if (!((v_W === sees(b, sp, v_k)))) { continue R1; }
          let _g57 = 0;
          G58: {
            const _a59 = sp.adj4[v_k];
            for (let _i60 = 0; _i60 < _a59.length; _i60++) {
              const v_b = _a59[_i60];
              const v_B = ray(sp, v_k, v_b);
              let _g61 = -1;
              G62: {
                const _t63 = v_B.length;
                for (let v_i = 0; v_i <= _t63; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                  _g61 = v_i;
                  break G62;
                }
              }
              const v_t = _g61;
              let _g64 = -1;
              G65: {
                const _t66 = v_B.length;
                for (let v_i = 0; v_i <= _t66; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
                  _g64 = v_i;
                  break G65;
                }
              }
              const _t67 = ((v_n - v_W) + v_t);
              let _g68 = -1;
              G69: {
                const _t70 = v_B.length;
                for (let v_i = _t70; v_i >= v_t; v_i--) {
                  if (!(((v_i === v_t) || (((v_i <= _t67) && (v_i <= _g64)) && ((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
                  _g68 = v_i;
                  break G69;
                }
              }
              _g57 += _g68;
            }
          }
          if (!((v_M === (1 + _g57)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _g71 = 0;
          G72: {
            const _a73 = sp.adj4[v_k];
            for (let _i74 = 0; _i74 < _a73.length; _i74++) {
              const v_b = _a73[_i74];
              const v_B = ray(sp, v_k, v_b);
              let _g75 = -1;
              G76: {
                const _t77 = v_B.length;
                for (let v_i = 0; v_i <= _t77; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                  _g75 = v_i;
                  break G76;
                }
              }
              const v_t = _g75;
              let _g78 = -1;
              G79: {
                const _t80 = v_B.length;
                for (let v_i = 0; v_i <= _t80; v_i++) {
                  if (!(((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) === 1)))) continue;
                  _g78 = v_i;
                  break G79;
                }
              }
              const _t81 = ((v_n - v_W) + v_t);
              let _g82 = -1;
              G83: {
                const _t84 = v_B.length;
                for (let v_i = _t84; v_i >= v_t; v_i--) {
                  if (!(((v_i === v_t) || (((v_i <= _t81) && (v_i <= _g78)) && ((v_i === v_B.length) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))))) continue;
                  _g82 = v_i;
                  break G83;
                }
              }
              _g71 += _g82;
            }
          }
          let _g85 = -1;
          G86: {
            const _t87 = v_R.length;
            for (let v_i = 0; v_i <= _t87; v_i++) {
              if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))) continue;
              _g85 = v_i;
              break G86;
            }
          }
          let _g88 = -1;
          G89: {
            const _t90 = v_R.length;
            for (let v_i = 0; v_i <= _t90; v_i++) {
              if (!(((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) === 1)))) continue;
              _g88 = v_i;
              break G89;
            }
          }
          const _t91 = ((v_n - v_W) + v_s);
          let _g92 = -1;
          G93: {
            const _t94 = v_R.length;
            for (let v_i = _t94; v_i >= v_s; v_i--) {
              if (!(((v_i === v_s) || (((v_i <= _t91) && (v_i <= _g88)) && ((v_i === v_R.length) || ((b.grid[(v_R[v_i] ?? -1)] || -1) !== 2)))))) continue;
              _g92 = v_i;
              break G93;
            }
          }
          freshBinding("reach", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n > 0), (v_W === sees(b, sp, v_k)), (v_M === (1 + _g71)), (sp.adj4[v_k].includes(v_a)), sameSet(v_R, ray(sp, v_k, v_a)), (v_s === _g85), (v_f === _g92)], ["k in", "n =", "where of n", "W =", "M =", "a in", "R =", "s =", "f ="]);
        }
        facts.length = 0;
        reachFactSays.length = 0;
        changed = false;
        let _c126: boolean = _h95;
        if (_c126) {
          let _q96 = true;
          Q97: {
            const _a98 = v_R;
            for (let _i99 = 0; _i99 < _a98.length; _i99++) {
              const v_p = _a98[_i99];
              if (!((_i99 < _h101))) continue;
              const _h113 = _i99;
              if (!(b.grid[v_p] !== 0)) {
                if (fire === null) { b.placeAt(v_p, 2); changed = true; }
                if (fire !== null) {
                  _g102.length = 0;
                  G103: {
                    const _a111 = v_R;
                    for (let _i112 = 0; _i112 < _a111.length; _i112++) {
                      const v_q = _a111[_i112];
                      const _h118 = _i112;
                      let _c119: boolean = (_i112 > _h113);
                      if (_c119) {
                        let _q114 = true;
                        Q115: {
                          const _a116 = v_R;
                          for (let _i117 = 0; _i117 < _a116.length; _i117++) {
                            const v_r = _a116[_i117];
                            if (!(((_i117 > _h113) && (_i117 <= _h118)))) continue;
                            if (!(((b.grid[v_r] || -1) === 2))) {
                              _q114 = false;
                              break Q115;
                            }
                          }
                        }
                        _c119 = _q114;
                      }
                      if (!(_c119)) continue;
                      _g102.push(v_q);
                    }
                  }
                  _g120.length = 0;
                  G121: {
                    const _a124 = v_R;
                    for (let _i125 = 0; _i125 < _a124.length; _i125++) {
                      const v_q = _a124[_i125];
                      if (!((_i125 < _h113))) continue;
                      _g120.push(v_q);
                    }
                  }
                  facts.push(PLACE, v_p, 2);
                  reachFactSays.push({ terms: {  }, marks: { outline: _g102.slice(), stripes: union(setOf(v_k), _g120).slice() } });
                }
              }
              if (!(true)) {
                _q96 = false;
                break Q97;
              }
            }
          }
          _c126 = _q96;
        }
        if (!(_c126)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            if (reachFactSays.length * 3 !== facts.length) throw new Error("reach: a fact of its conclusion is made where says.fact is not read");
            _g127.length = 0;
            reach_st137.pass++;
            G128: {
              const _a138 = sp.adj4[v_k];
              for (let _i139 = 0; _i139 < _a138.length; _i139++) {
                const v_b = _a138[_i139];
                const _h142 = (v_b !== v_a);
                const v_B = ray(sp, v_k, v_b);
                const _h145 = v_B.length;
                const _a140 = v_B;
                for (let _i141 = 0; _i141 < _a140.length; _i141++) {
                  const v_p = _a140[_i141];
                  let _c146: boolean = _h142;
                  if (_c146) {
                    let _g143 = -1;
                    G144: {
                      for (let v_i = 0; v_i <= _h145; v_i++) {
                        if (!(((v_i === _h145) || ((b.grid[(v_B[v_i] ?? -1)] || -1) !== 2)))) continue;
                        _g143 = v_i;
                        break G144;
                      }
                    }
                    _c146 = (_i141 < _g143);
                  }
                  if (!(_c146)) continue;
                  const _t147 = v_p;
                  if (_g127.length < 16) { if (!_g127.includes(_t147)) _g127.push(_t147); } else addOnce(_g127, reach_st137, _t147);
                }
              }
            }
            const _says = { terms: { clue: v_k, value: v_n }, marks: { outline: _g127.slice() }, facts: reachFactSays.slice() };
            if (!fire({ k: v_k, n: v_n, W: v_W, M: v_M, a: v_a, R: v_R.slice(), s: v_s, f: v_f }, facts, _says)) return 1;
          }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CutSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const cutFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function cut(b: Marks, sp: GridSpace, fire: Fire<CutBinding, CutSays> | null): number {
  const _g9: number[] = [];
  const _g17: number[] = [];
  const _g31: number[] = [];
  const facts = cutFacts;
  let fired = 0;
  let changed = false;
  const _m37_0 = b.made[0];
  _g9.length = 0;
  G10: {
    const _a13 = sp.cells;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_c = _a13[_i14];
      if (!(((b.grid[v_c] || -1) !== 1))) continue;
      _g9.push(v_c);
    }
  }
  const v_U = _g9;
  const _h29 = connected(sp, v_U);
  const v_K = cuts(sp, v_U);
  const _a15 = v_K;
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_c = _a15[_i16];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    if (b.made[0] !== _m37_0) {
      _g17.length = 0;
      G18: {
        const _a21 = sp.cells;
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_c = _a21[_i22];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g17.push(v_c);
        }
      }
      if (!(sameSet(v_U, _g17))) { return fired; }
    }
    if (DEV && staleChecking) {
      const _g23: number[] = [];
      G24: {
        const _a27 = sp.cells;
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_c = _a27[_i28];
          if (!(((b.grid[v_c] || -1) !== 1))) continue;
          _g23.push(v_c);
        }
      }
      freshBinding("cut", [sameSet(v_U, _g23), sameSet(v_K, cuts(sp, v_U)), (v_K.includes(v_c)), !((b.grid[v_c] !== 0))], ["U =", "K =", "c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c30: boolean = _h29;
    if (_c30) {
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
      _c30 = true;
    }
    if (!(_c30)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        _g31.length = 0;
        G32: {
          const _a35 = sp.adj4[v_c];
          for (let _i36 = 0; _i36 < _a35.length; _i36++) {
            const v_p = _a35[_i36];
            if (!(((b.grid[v_p] || -1) !== 1))) continue;
            _g31.push(v_p);
          }
        }
        const _says = { terms: {  }, marks: { outline: _g31.slice() } };
        if (!fire({ U: v_U.slice(), K: v_K.slice(), c: v_c }, facts, _says)) return 1;
      }
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
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_k];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_a = _a3[_i4];
      const _t5 = ray(sp, v_k, v_a);
      let _g6 = -1;
      G7: {
        const _t8 = _t5.length;
        for (let v_i = 0; v_i <= _t8; v_i++) {
          if (!(((v_i === _t5.length) || ((b.grid[(_t5[v_i] ?? -1)] || -1) !== 2)))) continue;
          _g6 = v_i;
          break G7;
        }
      }
      _g1 += _g6;
    }
  }
  const _made = (1 + _g1);
  _kept[v_k] = _made;
  return _made;
}
