// Compiled by `npm run describe` from src/games/separate/separate.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptEdgeGroups, rangeMask, sameSet, staleChecking, stamps, through } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  letter: ClueList;
  k: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "sharedLetter" | "walledApart" | "onlyWay";

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
  { id: "sharedLetter", tier: 0 },
  { id: "walledApart", tier: 0 },
  { id: "onlyWay", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g3: number[] = [];
  const _g16: number[] = [];
  const _g32: number[] = [];
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
    _g16.length = 0;
    G17: {
      const _a20 = sp.edges;
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_e = _a20[_i21];
        const _h22 = (g[v_e] || -1);
        if (!((_h22 === 2))) continue;
        _g16.push(v_e);
      }
    }
    const v_O = _g16;
    const _eg25 = edgeGroups(sp, v_O);
    const _a23 = sp.cells;
    for (let _i24 = 0; _i24 < _a23.length; _i24++) {
      const v_c = _a23[_i24];
      const _h26 = _eg25.of(v_c).length;
      if (!((_h26 === cl.k))) {
        _q14 = false;
        break Q15;
      }
    }
  }
  if (!(_q14)) return false;
  for (let _k27 = 0; _k27 < cl.letter.at.length; _k27++) {
    const _at28 = cl.letter.at[_k27];
    const _v29 = cl.letter.v[_k27];
    let _q30 = true;
    Q31: {
      _g32.length = 0;
      G33: {
        const _a36 = sp.edges;
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          const v_e = _a36[_i37];
          const _h38 = (g[v_e] || -1);
          if (!((_h38 === 2))) continue;
          _g32.push(v_e);
        }
      }
      const _a39 = through(sp, _at28, _g32);
      for (let _i40 = 0; _i40 < _a39.length; _i40++) {
        const v_x = _a39[_i40];
        if (!((v_x !== _at28))) continue;
        const _h41 = clueAt(cl.letter, v_x);
        if (!((_h41 !== _v29))) {
          _q30 = false;
          break Q31;
        }
      }
    }
    if (!(_q30)) return false;
  }
  return true;
}

export interface SharedLetterBinding {
  O: readonly number[];
  e: number;
  A: readonly number[];
  b: number;
  B: readonly number[];
  L: number;
  d: number;
  x: number;
  y: number;
}

const sharedLetterFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function sharedLetter(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedLetterBinding> | null): number {
  const _g36: number[] = [];
  const _g113: number[] = [];
  const facts = sharedLetterFacts;
  let fired = 0;
  let changed = false;
  const _m121_0 = b.made[0];
  _g36.length = 0;
  G37: {
    const _a40 = sp.edges;
    for (let _i41 = 0; _i41 < _a40.length; _i41++) {
      const v_e = _a40[_i41];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g36.push(v_e);
    }
  }
  const v_O = _g36;
  const _m122_1 = b.made[1];
  const _eg44 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a42 = sp.edges;
  R1:
  for (let _i43 = 0; _i43 < _a42.length; _i43++) {
    const v_e = _a42[_i43];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg44.of(sp.edgeEnds[2 * v_e]);
    L45: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg44.of(v_b) === v_A))) break L45;
      const v_B = _eg44.of(v_b);
      let _g46 = 0;
      G47: {
        const _a50 = v_B;
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_y = _a50[_i51];
          const _h52 = clueAt(cl.letter, v_y);
          _g46 |= 1 << _h52;
        }
      }
      const v_L = _g46;
      let _g53 = 0;
      G54: {
        const _a57 = v_A;
        for (let _i58 = 0; _i58 < _a57.length; _i58++) {
          const v_x = _a57[_i58];
          const _h59 = clueAt(cl.letter, v_x);
          _g53 |= 1 << _h59;
        }
      }
      R2:
      for (let _m60 = _g53; _m60 !== 0; _m60 &= _m60 - 1) {
        const v_d = 31 - Math.clz32(_m60 & -_m60);
        let _c67: boolean = (((v_L >> v_d) & 1) !== 0);
        if (_c67) {
          let _q61 = false;
          Q62: {
            const _a63 = v_A;
            for (let _i64 = 0; _i64 < _a63.length; _i64++) {
              const v_x = _a63[_i64];
              const _a65 = sp.adj4[v_x];
              for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                const v_y = _a65[_i66];
                if (!((_eg44.of(v_y) === v_B))) continue;
                if (((b.grid[sp.adj4Edges[v_x][_i66]] || -1) === 1)) {
                  _q61 = true;
                  break Q62;
                }
              }
            }
          }
          _c67 = !(_q61);
        }
        if (!(_c67)) continue;
        const _a68 = v_A;
        for (let _i69 = 0; _i69 < _a68.length; _i69++) {
          const v_x = _a68[_i69];
          const _h70 = clueAt(cl.letter, v_x);
          if (!((_h70 === v_d))) continue;
          const _a71 = v_B;
          for (let _i72 = 0; _i72 < _a71.length; _i72++) {
            const v_y = _a71[_i72];
            const _h73 = clueAt(cl.letter, v_y);
            if (!((_h73 === v_d))) continue;
            if (b.made[0] !== _m121_0 || b.made[1] !== _m122_1) {
              const _now74 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
              if (!(_now74 === _eg44.of(sp.edgeEnds[2 * v_e]) || sameSet(_now74, _eg44.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
              const _now75 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
              if (!(_now75 === _eg44.of(v_b) || sameSet(_now75, _eg44.of(v_b)))) { continue R1; }
              if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
              let _c82: boolean = (((v_L >> v_d) & 1) !== 0);
              if (_c82) {
                let _q76 = false;
                Q77: {
                  const _a78 = v_A;
                  for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                    const v_x = _a78[_i79];
                    const _a80 = sp.adj4[v_x];
                    for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                      const v_y = _a80[_i81];
                      if (!((_eg44.of(v_y) === v_B))) continue;
                      if (((b.grid[sp.adj4Edges[v_x][_i81]] || -1) === 1)) {
                        _q76 = true;
                        break Q77;
                      }
                    }
                  }
                }
                _c82 = !(_q76);
              }
              if (!(_c82)) { continue R2; }
            }
            if (DEV && staleChecking) {
              const _g83: number[] = [];
              G84: {
                const _a87 = sp.edges;
                for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                  const v_e = _a87[_i88];
                  if (!(((b.grid[v_e] || -1) === 2))) continue;
                  _g83.push(v_e);
                }
              }
              const _fg89 = edgeGroups(sp, _g83);
              let _g90 = 0;
              G91: {
                const _a94 = v_B;
                for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                  const v_y = _a94[_i95];
                  const _t96 = clueAt(cl.letter, v_y);
                  _g90 |= 1 << _t96;
                }
              }
              let _g97 = 0;
              G98: {
                const _a101 = v_A;
                for (let _i102 = 0; _i102 < _a101.length; _i102++) {
                  const v_x = _a101[_i102];
                  const _t103 = clueAt(cl.letter, v_x);
                  _g97 |= 1 << _t103;
                }
              }
              let _c110: boolean = (((v_L >> v_d) & 1) !== 0);
              if (_c110) {
                let _q104 = false;
                Q105: {
                  const _a106 = v_A;
                  for (let _i107 = 0; _i107 < _a106.length; _i107++) {
                    const v_x = _a106[_i107];
                    const _a108 = sp.adj4[v_x];
                    for (let _i109 = 0; _i109 < _a108.length; _i109++) {
                      const v_y = _a108[_i109];
                      if (!((_eg44.of(v_y) === v_B))) continue;
                      if (((b.grid[sp.adj4Edges[v_x][_i109]] || -1) === 1)) {
                        _q104 = true;
                        break Q105;
                      }
                    }
                  }
                }
                _c110 = !(_q104);
              }
              freshBinding("sharedLetter", [sameSet(_fg89.of(sp.edgeEnds[2 * v_e]), _eg44.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg89.of(v_b), _eg44.of(v_b)), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_e], v_O)), (v_b === sp.edgeEnds[2 * v_e + 1]), !(_eg44.of(v_b) === v_A), sameSet(v_B, through(sp, v_b, v_O)), (v_L === _g90), (((_g97 >> v_d) & 1) !== 0), _c110, (_eg44.of(v_x) === v_A), (clueAt(cl.letter, v_x) === v_d), (_eg44.of(v_y) === v_B), (clueAt(cl.letter, v_y) === v_d)], ["O's groups", "e in", "where of e", "A =", "b =", "where of b", "B =", "L =", "d in", "where of d", "x in", "where of x", "y in", "where of y"]);
            }
            facts.length = 0;
            changed = false;
            let _q111 = true;
            Q112: {
              _g113.length = 0;
              G114: {
                const _a117 = sp.edges;
                for (let _i118 = 0; _i118 < _a117.length; _i118++) {
                  const v_e = _a117[_i118];
                  if (!((((_eg44.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg44.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
                  _g113.push(v_e);
                }
              }
              const _a119 = _g113;
              for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                const v_f = _a119[_i120];
                if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
                if (!(true)) {
                  _q111 = false;
                  break Q112;
                }
              }
            }
            if (!(_q111)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ O: v_O.slice(), e: v_e, A: v_A.slice(), b: v_b, B: v_B.slice(), L: v_L, d: v_d, x: v_x, y: v_y }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface WalledApartBinding {
  O: readonly number[];
  e: number;
  A: readonly number[];
  b: number;
  B: readonly number[];
}

const walledApartFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function walledApart(b: Marks, sp: GridSpace, fire: Fire<WalledApartBinding> | null): number {
  const _g17: number[] = [];
  const _g51: number[] = [];
  const facts = walledApartFacts;
  let fired = 0;
  let changed = false;
  const _m59_0 = b.made[0];
  _g17.length = 0;
  G18: {
    const _a21 = sp.edges;
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_e = _a21[_i22];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g17.push(v_e);
    }
  }
  const v_O = _g17;
  const _m60_1 = b.made[1];
  const _eg25 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a23 = sp.edges;
  R1:
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_e = _a23[_i24];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg25.of(sp.edgeEnds[2 * v_e]);
    L26: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg25.of(v_b) === v_A))) break L26;
      L27: {
        const v_B = _eg25.of(v_b);
        let _q28 = false;
        Q29: {
          const _a30 = v_A;
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_x = _a30[_i31];
            const _a32 = sp.adj4[v_x];
            for (let _i33 = 0; _i33 < _a32.length; _i33++) {
              const v_y = _a32[_i33];
              if (!((_eg25.of(v_y) === v_B))) continue;
              if (((b.grid[sp.adj4Edges[v_x][_i33]] || -1) === 1)) {
                _q28 = true;
                break Q29;
              }
            }
          }
        }
        if (!(_q28)) break L27;
        if (b.made[0] !== _m59_0 || b.made[1] !== _m60_1) {
          const _now34 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
          if (!(_now34 === _eg25.of(sp.edgeEnds[2 * v_e]) || sameSet(_now34, _eg25.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
          const _now35 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
          if (!(_now35 === _eg25.of(v_b) || sameSet(_now35, _eg25.of(v_b)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          const _g36: number[] = [];
          G37: {
            const _a40 = sp.edges;
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const v_e = _a40[_i41];
              if (!(((b.grid[v_e] || -1) === 2))) continue;
              _g36.push(v_e);
            }
          }
          const _fg42 = edgeGroups(sp, _g36);
          let _q43 = false;
          Q44: {
            const _a45 = v_A;
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_x = _a45[_i46];
              const _a47 = sp.adj4[v_x];
              for (let _i48 = 0; _i48 < _a47.length; _i48++) {
                const v_y = _a47[_i48];
                if (!((_eg25.of(v_y) === v_B))) continue;
                if (((b.grid[sp.adj4Edges[v_x][_i48]] || -1) === 1)) {
                  _q43 = true;
                  break Q44;
                }
              }
            }
          }
          freshBinding("walledApart", [sameSet(_fg42.of(sp.edgeEnds[2 * v_e]), _eg25.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg42.of(v_b), _eg25.of(v_b)), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_e], v_O)), (v_b === sp.edgeEnds[2 * v_e + 1]), !(_eg25.of(v_b) === v_A), sameSet(v_B, through(sp, v_b, v_O)), _q43], ["O's groups", "e in", "where of e", "A =", "b =", "where of b", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _q49 = true;
        Q50: {
          _g51.length = 0;
          G52: {
            const _a55 = sp.edges;
            for (let _i56 = 0; _i56 < _a55.length; _i56++) {
              const v_e = _a55[_i56];
              if (!((((_eg25.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg25.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg25.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg25.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
              _g51.push(v_e);
            }
          }
          const _a57 = _g51;
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_f = _a57[_i58];
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
            if (!(true)) {
              _q49 = false;
              break Q50;
            }
          }
        }
        if (!(_q49)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ O: v_O.slice(), e: v_e, A: v_A.slice(), b: v_b, B: v_B.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface OnlyWayBinding {
  O: readonly number[];
  c: number;
  A: readonly number[];
  S: readonly number[];
}

const onlyWayFacts: number[] = [];
const onlyWay_st37 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyWayBinding> | null): number {
  const _g20: number[] = [];
  const _g31: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m71_0 = b.made[0];
  _g20.length = 0;
  G21: {
    const _a24 = sp.edges;
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      const v_e = _a24[_i25];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g20.push(v_e);
    }
  }
  const v_O = _g20;
  const _m72_1 = b.made[1];
  const _eg28 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a26 = sp.cells;
  R1:
  for (let _i27 = 0; _i27 < _a26.length; _i27++) {
    const v_c = _a26[_i27];
    L29: {
      const v_A = _eg28.of(v_c);
      const _h30 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h30 < cl.k)))) break L29;
      _g31.length = 0;
      onlyWay_st37.pass++;
      G32: {
        const _a38 = v_A;
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_x = _a38[_i39];
          const _a40 = sp.adj4[v_x];
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_s = _a40[_i41];
            if (!((!(_eg28.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i41]] || -1) !== 1)))) continue;
            const _t42 = v_s;
            if (_g31.length < 16) { if (!_g31.includes(_t42)) _g31.push(_t42); } else addOnce(_g31, onlyWay_st37, _t42);
          }
        }
      }
      const v_S = _g31;
      const _h61 = v_S.length;
      if (b.made[0] !== _m71_0 || b.made[1] !== _m72_1) {
        const _now43 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_c);
        if (!(_now43 === _eg28.of(v_c) || sameSet(_now43, _eg28.of(v_c)))) { continue R1; }
      }
      if (DEV && staleChecking) {
        const _g44: number[] = [];
        G45: {
          const _a48 = sp.edges;
          for (let _i49 = 0; _i49 < _a48.length; _i49++) {
            const v_e = _a48[_i49];
            if (!(((b.grid[v_e] || -1) === 2))) continue;
            _g44.push(v_e);
          }
        }
        const _fg50 = edgeGroups(sp, _g44);
        const _g51: number[] = [];
        G52: {
          const _a57 = v_A;
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_x = _a57[_i58];
            const _a59 = sp.adj4[v_x];
            for (let _i60 = 0; _i60 < _a59.length; _i60++) {
              const v_s = _a59[_i60];
              if (!((!(_eg28.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i60]] || -1) !== 1)))) continue;
              if (!_g51.includes(v_s)) _g51.push(v_s);
            }
          }
        }
        freshBinding("onlyWay", [sameSet(_fg50.of(v_c), _eg28.of(v_c)), (sp.cells.includes(v_c)), sameSet(v_A, through(sp, v_c, v_O)), ((v_c === (v_A[0] ?? -1)) && (v_A.length < cl.k)), sameSet(v_S, _g51)], ["O's groups", "c in", "A =", "where of A", "S ="]);
      }
      facts.length = 0;
      changed = false;
      let _c70: boolean = (_h61 > 0);
      if (_c70) {
        let _c69: boolean = !((_h61 === 1));
        if (!_c69) {
          let _q62 = true;
          Q63: {
            const _a64 = v_A;
            for (let _i65 = 0; _i65 < _a64.length; _i65++) {
              const v_x = _a64[_i65];
              const _a66 = sp.adj4[v_x];
              for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                const v_y = _a66[_i67];
                if (!((v_S.includes(v_y)))) continue;
                const _t68 = sp.adj4Edges[v_x][_i67];
                if (!(b.grid[_t68] !== 0)) { if (fire === null) { b.placeAt(_t68, 2); changed = true; } else facts.push(PLACE, _t68, 2); }
                if (!(true)) {
                  _q62 = false;
                  break Q63;
                }
              }
            }
          }
          _c69 = _q62;
        }
        _c70 = _c69;
      }
      if (!(_c70)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O.slice(), c: v_c, A: v_A.slice(), S: v_S.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 2);
}
