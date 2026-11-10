// Compiled by `npm run describe` from src/games/rect/rect.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptStore, rangeMask, rectCells, rectHeight, rectHolds, rectInner, rectMeets, rectRim, rectWidth, rectsOf, sameSet, staleChecking, stamps, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  shape: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "fit" | "uncovered" | "boxed" | "reach" | "overlap" | "starve" | "line";

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
  { id: "fit", tier: 0 },
  { id: "uncovered", tier: 0 },
  { id: "boxed", tier: 0 },
  { id: "reach", tier: 0 },
  { id: "overlap", tier: 0 },
  { id: "starve", tier: 1 },
  { id: "line", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g3: number[] = [];
  const _g24: number[] = [];
  const _g44: number[] = [];
  const _g58: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    _g3.length = 0;
    G4: {
      const _a7 = sp.edges;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_e = _a7[_i8];
        const _h9 = (g[v_e] || -1);
        if (!((_h9 === 2))) continue;
        _g3.push(v_e);
      }
    }
    const v_O = _g3;
    const _eg13 = edgeGroups(sp, v_O);
    const _a10 = sp.edges;
    for (let _i11 = 0; _i11 < _a10.length; _i11++) {
      const v_e = _a10[_i11];
      const _h12 = (g[v_e] || -1);
      if (!(((_h12 === 1) === !(_eg13.of(sp.edgeEnds[2 * v_e + 1]) === _eg13.of(sp.edgeEnds[2 * v_e]))))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q14 = true;
  Q15: {
    const _a16 = sp.corners;
    for (let _i17 = 0; _i17 < _a16.length; _i17++) {
      const v_p = _a16[_i17];
      const v_C = sp.cornerCells[v_p];
      const v_a = (v_C[0] ?? -1);
      const v_b = (v_C[1] ?? -1);
      const _h18 = (g[sp.edgeOf(v_a, v_b)] || -1);
      const v_c = (v_C[2] ?? -1);
      const _h20 = (g[sp.edgeOf(v_a, v_c)] || -1);
      const v_d = (v_C[3] ?? -1);
      const _h19 = (g[sp.edgeOf(v_c, v_d)] || -1);
      const _h21 = (g[sp.edgeOf(v_b, v_d)] || -1);
      if (!((((_h18 === 1) === (_h19 === 1)) || ((_h20 === 1) === (_h21 === 1))))) {
        _q14 = false;
        break Q15;
      }
    }
  }
  if (!(_q14)) return false;
  let _q22 = true;
  Q23: {
    _g24.length = 0;
    G25: {
      const _a28 = sp.edges;
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_e = _a28[_i29];
        const _h30 = (g[v_e] || -1);
        if (!((_h30 === 2))) continue;
        _g24.push(v_e);
      }
    }
    const v_O = _g24;
    const _eg35 = edgeGroups(sp, v_O);
    const _a31 = sp.cells;
    for (let _i32 = 0; _i32 < _a31.length; _i32++) {
      const v_c = _a31[_i32];
      let _g33 = 0;
      G34: {
        const _a36 = _eg35.of(v_c);
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          const v_x = _a36[_i37];
          const _h38 = clueAt(cl.number, v_x);
          if (!((_h38 !== -1))) continue;
          _g33++;
        }
      }
      if (!((_g33 === 1))) {
        _q22 = false;
        break Q23;
      }
    }
  }
  if (!(_q22)) return false;
  for (let _k39 = 0; _k39 < cl.number.at.length; _k39++) {
    const _at40 = cl.number.at[_k39];
    const _v41 = cl.number.v[_k39];
    let _c52: boolean = (_v41 === 0);
    if (!_c52) {
      let _q42 = true;
      Q43: {
        _g44.length = 0;
        G45: {
          const _a48 = sp.edges;
          for (let _i49 = 0; _i49 < _a48.length; _i49++) {
            const v_e = _a48[_i49];
            const _h50 = (g[v_e] || -1);
            if (!((_h50 === 2))) continue;
            _g44.push(v_e);
          }
        }
        const v_O = _g44;
        const _eg51 = edgeGroups(sp, v_O);
        if (!((_eg51.of(_at40).length === _v41))) {
          _q42 = false;
          break Q43;
        }
      }
      _c52 = _q42;
    }
    if (!(_c52)) return false;
  }
  for (let _k53 = 0; _k53 < cl.shape.at.length; _k53++) {
    const _at54 = cl.shape.at[_k53];
    const _v55 = cl.shape.v[_k53];
    let _q56 = true;
    Q57: {
      _g58.length = 0;
      G59: {
        const _a62 = sp.edges;
        for (let _i63 = 0; _i63 < _a62.length; _i63++) {
          const v_e = _a62[_i63];
          const _h64 = (g[v_e] || -1);
          if (!((_h64 === 2))) continue;
          _g58.push(v_e);
        }
      }
      const v_O = _g58;
      const _eg65 = edgeGroups(sp, v_O);
      const v_R = _eg65.of(_at54);
      let _g66 = 0;
      G67: {
        const _a68 = v_R;
        for (let _i69 = 0; _i69 < _a68.length; _i69++) {
          const v_s = _a68[_i69];
          if (!((((v_s / sp.w) | 0) === ((_at54 / sp.w) | 0)))) continue;
          _g66++;
        }
      }
      const v_n = _g66;
      let _g70 = 0;
      G71: {
        const _a72 = v_R;
        for (let _i73 = 0; _i73 < _a72.length; _i73++) {
          const v_s = _a72[_i73];
          if (!(((v_s % sp.w) === (_at54 % sp.w)))) continue;
          _g70++;
        }
      }
      const v_m = _g70;
      if (!((((!((_v55 === 1)) || (v_n === v_m)) && (!((_v55 === 2)) || (v_m > v_n))) && (!((_v55 === 3)) || (v_n > v_m))))) {
        _q56 = false;
        break Q57;
      }
    }
    if (!(_q56)) return false;
  }
  return true;
}

export interface FitBinding {
  q: number;
  F: readonly number[];
}

const fitFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function fit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitBinding> | null): number {
  const facts = fitFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const v_F = fits(b, sp, cl, v_q);
    const _h1 = v_F.length;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("fit", [sameSet(v_F, fits(b, sp, cl, v_q))], ["F ="]);
    }
    facts.length = 0;
    changed = false;
    let _c16: boolean = (_h1 > 0);
    if (_c16) {
      let _c15: boolean = !((_h1 === 1));
      if (!_c15) {
        let _q2 = true;
        Q3: {
          const _a4 = v_F;
          for (let _i5 = 0; _i5 < _a4.length; _i5++) {
            const v_r = _a4[_i5];
            let _q6 = true;
            Q7: {
              const _a8 = rectInner(sp, v_r);
              for (let _i9 = 0; _i9 < _a8.length; _i9++) {
                const v_e = _a8[_i9];
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                if (!(true)) {
                  _q6 = false;
                  break Q7;
                }
              }
            }
            let _c14: boolean = _q6;
            if (_c14) {
              let _q10 = true;
              Q11: {
                const _a12 = rectRim(sp, v_r);
                for (let _i13 = 0; _i13 < _a12.length; _i13++) {
                  const v_e = _a12[_i13];
                  if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                  if (!(true)) {
                    _q10 = false;
                    break Q11;
                  }
                }
              }
              _c14 = _q10;
            }
            if (!(_c14)) {
              _q2 = false;
              break Q3;
            }
          }
        }
        _c15 = _q2;
      }
      _c16 = _c15;
    }
    if (!(_c16)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ q: v_q, F: v_F.slice() }, facts)) return 1;
    }
  }
  return fired;
}

export interface UncoveredBinding {
  c: number;
}

const uncoveredFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function uncovered(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UncoveredBinding> | null): number {
  const facts = uncoveredFacts;
  let fired = 0;
  let changed = false;
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("uncovered", [(sp.cells.includes(v_c))], ["c in"]);
    }
    facts.length = 0;
    changed = false;
    if (!((reachers(b, sp, cl, v_c).length > 0))) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface BoxedBinding {
  q: number;
  F: readonly number[];
  r: number;
}

const boxedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function boxed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BoxedBinding> | null): number {
  const facts = boxedFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _m29_0 = b.made[0];
    const _m30_1 = b.made[1];
    L8: {
      const v_F = fits(b, sp, cl, v_q);
      const _h9 = v_F.length;
      if (!((_h9 > 1))) break L8;
      const _a10 = v_F;
      for (let _i11 = 0; _i11 < _a10.length; _i11++) {
        const v_r = _a10[_i11];
        let _q12 = true;
        Q13: {
          const _a14 = rectRim(sp, v_r);
          for (let _i15 = 0; _i15 < _a14.length; _i15++) {
            const v_e = _a14[_i15];
            if (!(((b.grid[v_e] || -1) === 1))) {
              _q12 = false;
              break Q13;
            }
          }
        }
        if (!(_q12)) continue;
        if (b.made[0] !== _m29_0 || b.made[1] !== _m30_1) {
          if (!(sameSet(v_F, fits(b, sp, cl, v_q)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _q16 = true;
          Q17: {
            const _a18 = rectRim(sp, v_r);
            for (let _i19 = 0; _i19 < _a18.length; _i19++) {
              const v_e = _a18[_i19];
              if (!(((b.grid[v_e] || -1) === 1))) {
                _q16 = false;
                break Q17;
              }
            }
          }
          freshBinding("boxed", [sameSet(v_F, fits(b, sp, cl, v_q)), (v_F.length > 1), (v_F.includes(v_r)), _q16], ["F =", "where of F", "r in", "where of r"]);
        }
        facts.length = 0;
        changed = false;
        let _q20 = true;
        Q21: {
          const _a22 = rectInner(sp, v_r);
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_e = _a22[_i23];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q20 = false;
              break Q21;
            }
          }
        }
        let _c28: boolean = _q20;
        if (_c28) {
          let _q24 = true;
          Q25: {
            const _a26 = rectRim(sp, v_r);
            for (let _i27 = 0; _i27 < _a26.length; _i27++) {
              const v_e = _a26[_i27];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q24 = false;
                break Q25;
              }
            }
          }
          _c28 = _q24;
        }
        if (!(_c28)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ q: v_q, F: v_F.slice(), r: v_r }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ReachBinding {
  c: number;
  Q: readonly number[];
  q: number;
  F: readonly number[];
  r: number;
}

const reachFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding> | null): number {
  const _g15: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  const _a11 = sp.cells;
  for (let _i12 = 0; _i12 < _a11.length; _i12++) {
    const v_c = _a11[_i12];
    L13: {
      const v_Q = reachers(b, sp, cl, v_c);
      const _h14 = v_Q.length;
      if (!((_h14 === 1))) break L13;
      const v_q = (v_Q[0] ?? -1);
      _g15.length = 0;
      G16: {
        const _a19 = fits(b, sp, cl, v_q);
        for (let _i20 = 0; _i20 < _a19.length; _i20++) {
          const v_r = _a19[_i20];
          if (!(rectHolds(sp, v_r, v_c))) continue;
          _g15.push(v_r);
        }
      }
      L21: {
        const v_F = _g15;
        const _h22 = v_F.length;
        if (!((_h22 === 1))) break L21;
        const v_r = (v_F[0] ?? -1);
        if (import.meta.env.DEV && staleChecking) {
          const _g23: number[] = [];
          G24: {
            const _a27 = fits(b, sp, cl, v_q);
            for (let _i28 = 0; _i28 < _a27.length; _i28++) {
              const v_r = _a27[_i28];
              if (!(rectHolds(sp, v_r, v_c))) continue;
              _g23.push(v_r);
            }
          }
          freshBinding("reach", [(sp.cells.includes(v_c)), sameSet(v_Q, reachers(b, sp, cl, v_c)), (v_Q.length === 1), (v_q === (v_Q[0] ?? -1)), sameSet(v_F, _g23), (v_F.length === 1), (v_r === (v_F[0] ?? -1))], ["c in", "Q =", "where of Q", "q =", "F =", "where of F", "r ="]);
        }
        facts.length = 0;
        changed = false;
        let _q29 = true;
        Q30: {
          const _a31 = rectInner(sp, v_r);
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_e = _a31[_i32];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q29 = false;
              break Q30;
            }
          }
        }
        let _c37: boolean = _q29;
        if (_c37) {
          let _q33 = true;
          Q34: {
            const _a35 = rectRim(sp, v_r);
            for (let _i36 = 0; _i36 < _a35.length; _i36++) {
              const v_e = _a35[_i36];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q33 = false;
                break Q34;
              }
            }
          }
          _c37 = _q33;
        }
        if (!(_c37)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, Q: v_Q.slice(), q: v_q, F: v_F.slice(), r: v_r }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface OverlapBinding {
  p: number;
  K: readonly number[];
  q: number;
  F: readonly number[];
  G: readonly number[];
  r: number;
}

const overlapFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function overlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverlapBinding> | null): number {
  const _g26: number[] = [];
  const facts = overlapFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
    const _m65_0 = b.made[0];
    const _m66_1 = b.made[1];
    let _q20 = false;
    Q21: {
      for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
        if (!((v_q !== v_p))) continue;
        if (true) {
          _q20 = true;
          break Q21;
        }
      }
    }
    if (!(_q20)) continue;
    L22: {
      const v_K = core(b, sp, cl, v_p);
      const _h23 = v_K.length;
      if (!((_h23 > 1))) break L22;
      for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
        if (!((v_q !== v_p))) continue;
        L24: {
          const v_F = fits(b, sp, cl, v_q);
          const _h25 = v_F.length;
          if (!((_h25 > 1))) break L24;
          _g26.length = 0;
          G27: {
            const _a34 = v_F;
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_r = _a34[_i35];
              let _q36 = false;
              Q37: {
                const _a38 = v_K;
                for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                  const v_x = _a38[_i39];
                  if (rectHolds(sp, v_r, v_x)) {
                    _q36 = true;
                    break Q37;
                  }
                }
              }
              if (!(!(_q36))) continue;
              _g26.push(v_r);
            }
          }
          L40: {
            const v_G = _g26;
            const _h41 = v_G.length;
            if (!(((_h41 === 1) && (_h41 < _h25)))) break L40;
            const v_r = (v_G[0] ?? -1);
            if (b.made[0] !== _m65_0 || b.made[1] !== _m66_1) {
              if (!(sameSet(v_K, core(b, sp, cl, v_p)))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g42: number[] = [];
              G43: {
                const _a50 = v_F;
                for (let _i51 = 0; _i51 < _a50.length; _i51++) {
                  const v_r = _a50[_i51];
                  let _q52 = false;
                  Q53: {
                    const _a54 = v_K;
                    for (let _i55 = 0; _i55 < _a54.length; _i55++) {
                      const v_x = _a54[_i55];
                      if (rectHolds(sp, v_r, v_x)) {
                        _q52 = true;
                        break Q53;
                      }
                    }
                  }
                  if (!(!(_q52))) continue;
                  _g42.push(v_r);
                }
              }
              freshBinding("overlap", [sameSet(v_K, core(b, sp, cl, v_p)), (v_K.length > 1), (v_q !== v_p), sameSet(v_F, fits(b, sp, cl, v_q)), (v_F.length > 1), sameSet(v_G, _g42), ((v_G.length === 1) && (v_G.length < v_F.length)), (v_r === (v_G[0] ?? -1))], ["K =", "where of K", "where of q", "F =", "where of F", "G =", "where of G", "r ="]);
            }
            facts.length = 0;
            changed = false;
            let _q56 = true;
            Q57: {
              const _a58 = rectInner(sp, v_r);
              for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                const v_e = _a58[_i59];
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                if (!(true)) {
                  _q56 = false;
                  break Q57;
                }
              }
            }
            let _c64: boolean = _q56;
            if (_c64) {
              let _q60 = true;
              Q61: {
                const _a62 = rectRim(sp, v_r);
                for (let _i63 = 0; _i63 < _a62.length; _i63++) {
                  const v_e = _a62[_i63];
                  if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                  if (!(true)) {
                    _q60 = false;
                    break Q61;
                  }
                }
              }
              _c64 = _q60;
            }
            if (!(_c64)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ p: v_p, K: v_K.slice(), q: v_q, F: v_F.slice(), G: v_G.slice(), r: v_r }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface StarveBinding {
  q: number;
  F: readonly number[];
  G: readonly number[];
  r: number;
  Z: readonly number[];
  U: readonly number[];
}

const starveFacts: number[] = [];
let starveCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function starve(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarveBinding> | null): number {
  const _g57: number[] = [];
  const _g65: number[] = [];
  const _g85: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  if (starveCands.length < sp.edges.length) starveCands = new Int32Array(sp.edges.length);
  const cands = starveCands;
  cands.fill(-1);
  starvesMarkedKept.clear();
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    L55: {
      const v_F = fits(b, sp, cl, v_q);
      const _h56 = v_F.length;
      if (!((_h56 > 1))) break L55;
      _g57.length = 0;
      G58: {
        const _a61 = v_F;
        for (let _i62 = 0; _i62 < _a61.length; _i62++) {
          const v_r = _a61[_i62];
          if (!(!(starvesMarked(b, sp, cl, cands, v_q, v_r)))) continue;
          _g57.push(v_r);
        }
      }
      L63: {
        const v_G = _g57;
        const _h64 = v_G.length;
        if (!((_h64 === 1))) break L63;
        const v_r = (v_G[0] ?? -1);
        _g65.length = 0;
        G66: {
          for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
            let _c84: boolean = (v_j !== v_q);
            if (_c84) {
              let _q76 = false;
              Q77: {
                const _a78 = v_F;
                for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                  const v_s = _a78[_i79];
                  if (!((v_s !== v_r))) continue;
                  let _q80 = true;
                  Q81: {
                    const _a82 = fits(b, sp, cl, v_j);
                    for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                      const v_t = _a82[_i83];
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q80 = false;
                        break Q81;
                      }
                    }
                  }
                  if (_q80) {
                    _q76 = true;
                    break Q77;
                  }
                }
              }
              _c84 = _q76;
            }
            if (!(_c84)) continue;
            _g65.push(v_j);
          }
        }
        const v_Z = _g65;
        _g85.length = 0;
        G86: {
          const _a99 = sp.cells;
          for (let _i100 = 0; _i100 < _a99.length; _i100++) {
            const v_x = _a99[_i100];
            let _q101 = false;
            Q102: {
              const _a103 = v_F;
              for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                const v_s = _a103[_i104];
                if (!(((v_s !== v_r) && !rectHolds(sp, v_s, v_x)))) continue;
                let _q105 = false;
                Q106: {
                  const _a107 = reachers(b, sp, cl, v_x);
                  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                    const v_j = _a107[_i108];
                    if (!((v_j !== v_q))) continue;
                    const _a109 = fits(b, sp, cl, v_j);
                    for (let _i110 = 0; _i110 < _a109.length; _i110++) {
                      const v_t = _a109[_i110];
                      if (!(rectHolds(sp, v_t, v_x))) continue;
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q105 = true;
                        break Q106;
                      }
                    }
                  }
                }
                if (!(_q105)) {
                  _q101 = true;
                  break Q102;
                }
              }
            }
            if (!(_q101)) continue;
            _g85.push(v_x);
          }
        }
        const v_U = _g85;
        if (import.meta.env.DEV && staleChecking) {
          const _g111: number[] = [];
          G112: {
            const _a115 = v_F;
            for (let _i116 = 0; _i116 < _a115.length; _i116++) {
              const v_r = _a115[_i116];
              if (!(!(starvesMarked(b, sp, cl, cands, v_q, v_r)))) continue;
              _g111.push(v_r);
            }
          }
          const _g117: number[] = [];
          G118: {
            for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
              let _c136: boolean = (v_j !== v_q);
              if (_c136) {
                let _q128 = false;
                Q129: {
                  const _a130 = v_F;
                  for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                    const v_s = _a130[_i131];
                    if (!((v_s !== v_r))) continue;
                    let _q132 = true;
                    Q133: {
                      const _a134 = fits(b, sp, cl, v_j);
                      for (let _i135 = 0; _i135 < _a134.length; _i135++) {
                        const v_t = _a134[_i135];
                        if (!(rectMeets(sp, v_t, v_s))) {
                          _q132 = false;
                          break Q133;
                        }
                      }
                    }
                    if (_q132) {
                      _q128 = true;
                      break Q129;
                    }
                  }
                }
                _c136 = _q128;
              }
              if (!(_c136)) continue;
              _g117.push(v_j);
            }
          }
          const _g137: number[] = [];
          G138: {
            const _a151 = sp.cells;
            for (let _i152 = 0; _i152 < _a151.length; _i152++) {
              const v_x = _a151[_i152];
              let _q153 = false;
              Q154: {
                const _a155 = v_F;
                for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                  const v_s = _a155[_i156];
                  if (!(((v_s !== v_r) && !rectHolds(sp, v_s, v_x)))) continue;
                  let _q157 = false;
                  Q158: {
                    const _a159 = reachers(b, sp, cl, v_x);
                    for (let _i160 = 0; _i160 < _a159.length; _i160++) {
                      const v_j = _a159[_i160];
                      if (!((v_j !== v_q))) continue;
                      const _a161 = fits(b, sp, cl, v_j);
                      for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                        const v_t = _a161[_i162];
                        if (!(rectHolds(sp, v_t, v_x))) continue;
                        if (!(rectMeets(sp, v_t, v_s))) {
                          _q157 = true;
                          break Q158;
                        }
                      }
                    }
                  }
                  if (!(_q157)) {
                    _q153 = true;
                    break Q154;
                  }
                }
              }
              if (!(_q153)) continue;
              _g137.push(v_x);
            }
          }
          freshBinding("starve", [sameSet(v_F, fits(b, sp, cl, v_q)), (v_F.length > 1), sameSet(v_G, _g111), (v_G.length === 1), (v_r === (v_G[0] ?? -1)), sameSet(v_Z, _g117), sameSet(v_U, _g137)], ["F =", "where of F", "G =", "where of G", "r =", "Z =", "U ="]);
        }
        facts.length = 0;
        changed = false;
        let _q163 = true;
        Q164: {
          const _a165 = rectInner(sp, v_r);
          for (let _i166 = 0; _i166 < _a165.length; _i166++) {
            const v_e = _a165[_i166];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q163 = false;
              break Q164;
            }
          }
        }
        let _c171: boolean = _q163;
        if (_c171) {
          let _q167 = true;
          Q168: {
            const _a169 = rectRim(sp, v_r);
            for (let _i170 = 0; _i170 < _a169.length; _i170++) {
              const v_e = _a169[_i170];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q167 = false;
                break Q168;
              }
            }
          }
          _c171 = _q167;
        }
        if (!(_c171)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ q: v_q, F: v_F.slice(), G: v_G.slice(), r: v_r, Z: v_Z.slice(), U: v_U.slice() }, facts)) return 1;
          cands.fill(-1);
          starvesMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface LineBinding {
  e: number;
  a: number;
  b: number;
  C: readonly number[];
  O: readonly number[];
  T: readonly number[];
  M: readonly number[];
}

const lineFacts: number[] = [];
let lineCands = new Int32Array(0);
const line_st155 = stamps();
const line_st177 = stamps();

/** Its dearest read grows with the board as n^2. */
export function line(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBinding> | null): number {
  const _g94: number[] = [];
  const _g122: number[] = [];
  const _g145: number[] = [];
  const _g165: number[] = [];
  const _g182: number[] = [];
  const facts = lineFacts;
  let fired = 0;
  let changed = false;
  if (lineCands.length < sp.edges.length) lineCands = new Int32Array(sp.edges.length);
  const cands = lineCands;
  cands.fill(-1);
  ownedMarkedKept.clear();
  const _a92 = sp.edges;
  for (let _i93 = 0; _i93 < _a92.length; _i93++) {
    const v_e = _a92[_i93];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    _g94.length = 0;
    G95: {
      const _a102 = reachers(b, sp, cl, v_a);
      for (let _i103 = 0; _i103 < _a102.length; _i103++) {
        const v_q = _a102[_i103];
        let _q104 = false;
        Q105: {
          const _a106 = fits(b, sp, cl, v_q);
          for (let _i107 = 0; _i107 < _a106.length; _i107++) {
            const v_r = _a106[_i107];
            if ((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b))) {
              _q104 = true;
              break Q105;
            }
          }
        }
        if (!(_q104)) continue;
        _g94.push(v_q);
      }
    }
    L108: {
      const v_C = _g94;
      const _h109 = v_C.length;
      let _c121: boolean = (_h109 > 0);
      if (_c121) {
        let _q110 = true;
        Q111: {
          const _a112 = v_C;
          for (let _i113 = 0; _i113 < _a112.length; _i113++) {
            const v_q = _a112[_i113];
            const _a114 = fits(b, sp, cl, v_q);
            for (let _i115 = 0; _i115 < _a114.length; _i115++) {
              const v_r = _a114[_i115];
              if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
              let _c120: boolean = ownedMarked(b, sp, cl, cands, v_q, v_r);
              if (!_c120) {
                let _q116 = false;
                Q117: {
                  const _a118 = sole(b, sp, cl, v_q);
                  for (let _i119 = 0; _i119 < _a118.length; _i119++) {
                    const v_x = _a118[_i119];
                    if (!rectHolds(sp, v_r, v_x)) {
                      _q116 = true;
                      break Q117;
                    }
                  }
                }
                _c120 = _q116;
              }
              if (!(_c120)) {
                _q110 = false;
                break Q111;
              }
            }
          }
        }
        _c121 = _q110;
      }
      if (!(_c121)) break L108;
      _g122.length = 0;
      G123: {
        for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
          let _q134 = false;
          Q135: {
            const _a136 = v_C;
            for (let _i137 = 0; _i137 < _a136.length; _i137++) {
              const v_q = _a136[_i137];
              const _h140 = (v_p !== v_q);
              const _a138 = fits(b, sp, cl, v_q);
              for (let _i139 = 0; _i139 < _a138.length; _i139++) {
                const v_r = _a138[_i139];
                if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && _h140))) continue;
                let _q141 = false;
                Q142: {
                  const _a143 = core(b, sp, cl, v_p);
                  for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                    const v_x = _a143[_i144];
                    if (rectHolds(sp, v_r, v_x)) {
                      _q141 = true;
                      break Q142;
                    }
                  }
                }
                if (_q141) {
                  _q134 = true;
                  break Q135;
                }
              }
            }
          }
          if (!(_q134)) continue;
          _g122.push(v_p);
        }
      }
      const v_O = _g122;
      _g145.length = 0;
      line_st155.pass++;
      G146: {
        const _a156 = v_C;
        for (let _i157 = 0; _i157 < _a156.length; _i157++) {
          const v_q = _a156[_i157];
          const _a158 = fits(b, sp, cl, v_q);
          for (let _i159 = 0; _i159 < _a158.length; _i159++) {
            const v_r = _a158[_i159];
            if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
            const _a160 = v_O;
            for (let _i161 = 0; _i161 < _a160.length; _i161++) {
              const v_p = _a160[_i161];
              if (!((v_p !== v_q))) continue;
              const _a162 = core(b, sp, cl, v_p);
              for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                const v_x = _a162[_i163];
                if (!(rectHolds(sp, v_r, v_x))) continue;
                const _t164 = v_x;
                if (_g145.length < 16) { if (!_g145.includes(_t164)) _g145.push(_t164); } else addOnce(_g145, line_st155, _t164);
              }
            }
          }
        }
      }
      const v_T = _g145;
      _g165.length = 0;
      line_st177.pass++;
      G166: {
        const _a178 = v_C;
        for (let _i179 = 0; _i179 < _a178.length; _i179++) {
          const v_q = _a178[_i179];
          const _a180 = fits(b, sp, cl, v_q);
          for (let _i181 = 0; _i181 < _a180.length; _i181++) {
            const v_r = _a180[_i181];
            if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && !(ownedMarked(b, sp, cl, cands, v_q, v_r))))) continue;
            _g182.length = 0;
            G183: {
              const _a186 = sole(b, sp, cl, v_q);
              for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                const v_x = _a186[_i187];
                if (!(!rectHolds(sp, v_r, v_x))) continue;
                _g182.push(v_x);
              }
            }
            const v_m = (_g182[0] ?? -1);
            const _t188 = v_m;
            if (_g165.length < 16) { if (!_g165.includes(_t188)) _g165.push(_t188); } else addOnce(_g165, line_st177, _t188);
          }
        }
      }
      const v_M = _g165;
      if (import.meta.env.DEV && staleChecking) {
        const _g189: number[] = [];
        G190: {
          const _a197 = reachers(b, sp, cl, v_a);
          for (let _i198 = 0; _i198 < _a197.length; _i198++) {
            const v_q = _a197[_i198];
            let _q199 = false;
            Q200: {
              const _a201 = fits(b, sp, cl, v_q);
              for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                const v_r = _a201[_i202];
                if ((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b))) {
                  _q199 = true;
                  break Q200;
                }
              }
            }
            if (!(_q199)) continue;
            _g189.push(v_q);
          }
        }
        let _c214: boolean = (v_C.length > 0);
        if (_c214) {
          let _q203 = true;
          Q204: {
            const _a205 = v_C;
            for (let _i206 = 0; _i206 < _a205.length; _i206++) {
              const v_q = _a205[_i206];
              const _a207 = fits(b, sp, cl, v_q);
              for (let _i208 = 0; _i208 < _a207.length; _i208++) {
                const v_r = _a207[_i208];
                if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
                let _c213: boolean = ownedMarked(b, sp, cl, cands, v_q, v_r);
                if (!_c213) {
                  let _q209 = false;
                  Q210: {
                    const _a211 = sole(b, sp, cl, v_q);
                    for (let _i212 = 0; _i212 < _a211.length; _i212++) {
                      const v_x = _a211[_i212];
                      if (!rectHolds(sp, v_r, v_x)) {
                        _q209 = true;
                        break Q210;
                      }
                    }
                  }
                  _c213 = _q209;
                }
                if (!(_c213)) {
                  _q203 = false;
                  break Q204;
                }
              }
            }
          }
          _c214 = _q203;
        }
        const _g215: number[] = [];
        G216: {
          for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
            let _q227 = false;
            Q228: {
              const _a229 = v_C;
              for (let _i230 = 0; _i230 < _a229.length; _i230++) {
                const v_q = _a229[_i230];
                const _a231 = fits(b, sp, cl, v_q);
                for (let _i232 = 0; _i232 < _a231.length; _i232++) {
                  const v_r = _a231[_i232];
                  if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && (v_p !== v_q)))) continue;
                  let _q233 = false;
                  Q234: {
                    const _a235 = core(b, sp, cl, v_p);
                    for (let _i236 = 0; _i236 < _a235.length; _i236++) {
                      const v_x = _a235[_i236];
                      if (rectHolds(sp, v_r, v_x)) {
                        _q233 = true;
                        break Q234;
                      }
                    }
                  }
                  if (_q233) {
                    _q227 = true;
                    break Q228;
                  }
                }
              }
            }
            if (!(_q227)) continue;
            _g215.push(v_p);
          }
        }
        const _g237: number[] = [];
        G238: {
          const _a247 = v_C;
          for (let _i248 = 0; _i248 < _a247.length; _i248++) {
            const v_q = _a247[_i248];
            const _a249 = fits(b, sp, cl, v_q);
            for (let _i250 = 0; _i250 < _a249.length; _i250++) {
              const v_r = _a249[_i250];
              if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
              const _a251 = v_O;
              for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                const v_p = _a251[_i252];
                if (!((v_p !== v_q))) continue;
                const _a253 = core(b, sp, cl, v_p);
                for (let _i254 = 0; _i254 < _a253.length; _i254++) {
                  const v_x = _a253[_i254];
                  if (!(rectHolds(sp, v_r, v_x))) continue;
                  if (!_g237.includes(v_x)) _g237.push(v_x);
                }
              }
            }
          }
        }
        const _g255: number[] = [];
        G256: {
          const _a267 = v_C;
          for (let _i268 = 0; _i268 < _a267.length; _i268++) {
            const v_q = _a267[_i268];
            const _a269 = fits(b, sp, cl, v_q);
            for (let _i270 = 0; _i270 < _a269.length; _i270++) {
              const v_r = _a269[_i270];
              if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && !(ownedMarked(b, sp, cl, cands, v_q, v_r))))) continue;
              const _g271: number[] = [];
              G272: {
                const _a275 = sole(b, sp, cl, v_q);
                for (let _i276 = 0; _i276 < _a275.length; _i276++) {
                  const v_x = _a275[_i276];
                  if (!(!rectHolds(sp, v_r, v_x))) continue;
                  _g271.push(v_x);
                }
              }
              const v_m = (_g271[0] ?? -1);
              if (!_g255.includes(v_m)) _g255.push(v_m);
            }
          }
        }
        freshBinding("line", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), sameSet(v_C, _g189), _c214, sameSet(v_O, _g215), sameSet(v_T, _g237), sameSet(v_M, _g255)], ["e in", "where of e", "a =", "b =", "C =", "where of C", "O =", "T =", "M ="]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, C: v_C.slice(), O: v_O.slice(), T: v_T.slice(), M: v_M.slice() }, facts)) return 1;
        cands.fill(-1);
        ownedMarkedKept.clear();
      }
    }
  }
  return fired;
}

const allowedKept = keptStore<readonly number[]>();
let allowedOn: object | null = null;
let allowedAt: Kept<readonly number[]> = [];

/** `allowed(q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function allowed(sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  if (cl !== allowedOn) {
    allowedAt = allowedKept.board(cl);
    allowedOn = cl;
  }
  const _kept: Kept<readonly number[]> = allowedAt;
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g1: number[] = [];
  G2: {
    const _a11 = rectsOf(sp, cl.number.at[v_q], cl.number.v[v_q]);
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_r = _a11[_i12];
      const _t13 = cl.number.at[v_q];
      let _c18: boolean = ((((clueAt(cl.shape, _t13) === -1) || ((clueAt(cl.shape, _t13) === 1) && (rectWidth(sp, v_r) === rectHeight(sp, v_r)))) || ((clueAt(cl.shape, _t13) === 2) && (rectHeight(sp, v_r) > rectWidth(sp, v_r)))) || ((clueAt(cl.shape, _t13) === 3) && (rectWidth(sp, v_r) > rectHeight(sp, v_r))));
      if (_c18) {
        let _g14 = 0;
        G15: {
          const _a16 = rectCells(sp, v_r);
          for (let _i17 = 0; _i17 < _a16.length; _i17++) {
            const v_x = _a16[_i17];
            if (!((clueAt(cl.number, v_x) !== -1))) continue;
            _g14++;
          }
        }
        _c18 = (_g14 === 1);
      }
      if (!(_c18)) continue;
      _g1.push(v_r);
    }
  }
  const _made = _g1;
  _kept[v_q] = _made;
  return _made;
}

const fitsKept = keptStore<readonly number[]>();

/** `fits(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function fits(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = fitsKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g1: number[] = [];
  G2: {
    const _a14 = allowed(sp, cl, v_q);
    for (let _i15 = 0; _i15 < _a14.length; _i15++) {
      const v_r = _a14[_i15];
      let _q16 = false;
      Q17: {
        const _a18 = rectInner(sp, v_r);
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_e = _a18[_i19];
          if (((b.grid[v_e] || -1) === 1)) {
            _q16 = true;
            break Q17;
          }
        }
      }
      let _c24: boolean = !(_q16);
      if (_c24) {
        let _q20 = false;
        Q21: {
          const _a22 = rectRim(sp, v_r);
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_e = _a22[_i23];
            if (((b.grid[v_e] || -1) === 2)) {
              _q20 = true;
              break Q21;
            }
          }
        }
        _c24 = !(_q20);
      }
      if (!(_c24)) continue;
      _g1.push(v_r);
    }
  }
  const _made = _g1;
  _kept[v_q] = _made;
  return _made;
}

const nearKept = keptStore<readonly number[]>();
let nearOn: object | null = null;
let nearAt: Kept<readonly number[]> = [];

/** `near(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function near(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== nearOn) {
    nearAt = nearKept.board(cl);
    nearOn = cl;
  }
  const _kept: Kept<readonly number[]> = nearAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
      let _c12: boolean = ((cl.number.v[v_q] === 0) || ((Math.abs(((v_c % sp.w) - (cl.number.at[v_q] % sp.w))) + Math.abs((((v_c / sp.w) | 0) - ((cl.number.at[v_q] / sp.w) | 0)))) < cl.number.v[v_q]));
      if (_c12) {
        let _q8 = false;
        Q9: {
          const _a10 = allowed(sp, cl, v_q);
          for (let _i11 = 0; _i11 < _a10.length; _i11++) {
            const v_r = _a10[_i11];
            if (rectHolds(sp, v_r, v_c)) {
              _q8 = true;
              break Q9;
            }
          }
        }
        _c12 = _q8;
      }
      if (!(_c12)) continue;
      _g1.push(v_q);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const reachersKept = keptStore<readonly number[]>();

/** `reachers(x)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function reachers(b: Marks, sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  const _kept: Kept<readonly number[]> = reachersKept.marks(b);
  if (_kept[v_x] !== undefined) return _kept[v_x];
  const _g1: number[] = [];
  G2: {
    const _a9 = near(sp, cl, v_x);
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_q = _a9[_i10];
      let _q11 = false;
      Q12: {
        const _a13 = fits(b, sp, cl, v_q);
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_r = _a13[_i14];
          if (rectHolds(sp, v_r, v_x)) {
            _q11 = true;
            break Q12;
          }
        }
      }
      if (!(_q11)) continue;
      _g1.push(v_q);
    }
  }
  const _made = _g1;
  _kept[v_x] = _made;
  return _made;
}

const coreKept = keptStore<readonly number[]>();

/** `core(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function core(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = coreKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g1: number[] = [];
  G2: {
    const _a9 = rectCells(sp, (fits(b, sp, cl, v_q)[0] ?? -1));
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_x = _a9[_i10];
      let _q11 = true;
      Q12: {
        const _a13 = fits(b, sp, cl, v_q);
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_r = _a13[_i14];
          if (!(rectHolds(sp, v_r, v_x))) {
            _q11 = false;
            break Q12;
          }
        }
      }
      if (!(_q11)) continue;
      _g1.push(v_x);
    }
  }
  const _made = _g1;
  _kept[v_q] = _made;
  return _made;
}

const starvesMarkedKept = new Map<number, boolean>();

/** `starves(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function starvesMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = starvesMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q1 = false;
  Q2: {
    for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
      if (!((v_j !== v_q))) continue;
      let _q3 = true;
      Q4: {
        const _a5 = fits(b, sp, cl, v_j);
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_t = _a5[_i6];
          if (!(rectMeets(sp, v_t, v_r))) {
            _q3 = false;
            break Q4;
          }
        }
      }
      if (_q3) {
        _q1 = true;
        break Q2;
      }
    }
  }
  let _c17: boolean = _q1;
  if (!_c17) {
    let _q7 = false;
    Q8: {
      const _a9 = sp.cells;
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_x = _a9[_i10];
        if (!(!rectHolds(sp, v_r, v_x))) continue;
        let _q11 = false;
        Q12: {
          const _a13 = reachers(b, sp, cl, v_x);
          for (let _i14 = 0; _i14 < _a13.length; _i14++) {
            const v_j = _a13[_i14];
            if (!((v_j !== v_q))) continue;
            const _a15 = fits(b, sp, cl, v_j);
            for (let _i16 = 0; _i16 < _a15.length; _i16++) {
              const v_t = _a15[_i16];
              if (!(rectHolds(sp, v_t, v_x))) continue;
              if (!(rectMeets(sp, v_t, v_r))) {
                _q11 = true;
                break Q12;
              }
            }
          }
        }
        if (!(_q11)) {
          _q7 = true;
          break Q8;
        }
      }
    }
    _c17 = _q7;
  }
  const _made = _c17;
  starvesMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const ownedMarkedKept = new Map<number, boolean>();

/** `owned(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function ownedMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = ownedMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q1 = false;
  Q2: {
    for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
      if (!((v_p !== v_q))) continue;
      let _q3 = false;
      Q4: {
        const _a5 = core(b, sp, cl, v_p);
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_x = _a5[_i6];
          if (rectHolds(sp, v_r, v_x)) {
            _q3 = true;
            break Q4;
          }
        }
      }
      if (_q3) {
        _q1 = true;
        break Q2;
      }
    }
  }
  const _made = _q1;
  ownedMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const soleKept = keptStore<readonly number[]>();

/** `sole(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function sole(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = soleKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.cells;
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_x = _a5[_i6];
      if (!(((reachers(b, sp, cl, v_x).length === 1) && (reachers(b, sp, cl, v_x).includes(v_q))))) continue;
      _g1.push(v_x);
    }
  }
  const _made = _g1;
  _kept[v_q] = _made;
  return _made;
}
