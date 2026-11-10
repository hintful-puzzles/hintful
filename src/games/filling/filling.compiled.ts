// Compiled by `npm run describe` from src/games/filling/filling.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, cellsValued, edgeGroups, freshBinding, keptEdgeGroups, keptStore, popcount, rangeMask, reaches, sameSet, staleChecking, stamps, through, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  largest: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "mustGrow" | "onlyWay" | "tooBig" | "noRoom" | "tooFar" | "onlyNumber";

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
  { id: "mustGrow", tier: 0 },
  { id: "onlyWay", tier: 0 },
  { id: "tooBig", tier: 0 },
  { id: "noRoom", tier: 0 },
  { id: "tooFar", tier: 0 },
  { id: "onlyNumber", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g3: number[] = [];
  const _domain = rangeMask(1, cl.largest);
  for (const cell of sp.cells) {
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
        const _h9 = (g[sp.edgeEnds[2 * v_e]] || -1);
        const _h10 = (g[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!((_h9 === _h10))) continue;
        _g3.push(v_e);
      }
    }
    const v_O = _g3;
    const _eg13 = edgeGroups(sp, v_O);
    const _a11 = sp.cells;
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_c = _a11[_i12];
      const _h14 = _eg13.of(v_c).length;
      const _h15 = (g[v_c] || -1);
      if (!((_h14 === _h15))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k16 = 0; _k16 < cl.number.at.length; _k16++) {
    const _at17 = cl.number.at[_k16];
    const _v18 = cl.number.v[_k16];
    if (!(((g[_at17] || -1) === _v18))) return false;
  }
  return true;
}

export interface MustGrowBinding {
  O: readonly number[];
  d: number;
  F: readonly number[];
  c: number;
  A: readonly number[];
  R: readonly number[];
  Y: readonly number[];
}

const mustGrowFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function mustGrow(b: Marks, sp: GridSpace, fire: Fire<MustGrowBinding> | null): number {
  const _g34: number[] = [];
  const _g45: number[] = [];
  const _g64: number[] = [];
  const facts = mustGrowFacts;
  let fired = 0;
  let changed = false;
  const _m105_0 = b.made[0];
  _g34.length = 0;
  G35: {
    const _a38 = sp.edges;
    for (let _i39 = 0; _i39 < _a38.length; _i39++) {
      const v_e = _a38[_i39];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g34.push(v_e);
    }
  }
  const v_O = _g34;
  const _m106_1 = b.made[1];
  const _eg53 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  for (let _m40 = b.domain; _m40 !== 0; _m40 &= _m40 - 1) {
    const v_d = 31 - Math.clz32(_m40 & -_m40);
    let _q41 = false;
    Q42: {
      const _a43 = cellsValued(b, sp.cells, v_d);
      for (let _i44 = 0; _i44 < _a43.length; _i44++) {
        const v_c = _a43[_i44];
        if (!(((b.grid[v_c] || -1) === v_d))) continue;
        if (true) {
          _q41 = true;
          break Q42;
        }
      }
    }
    if (!(_q41)) continue;
    _g45.length = 0;
    G46: {
      const _a49 = sp.edges;
      for (let _i50 = 0; _i50 < _a49.length; _i50++) {
        const v_e = _a49[_i50];
        if (!(((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === v_d)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === v_d))))) continue;
        _g45.push(v_e);
      }
    }
    const v_F = _g45;
    const _eg63 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a51 = cellsValued(b, sp.cells, v_d);
    R2:
    for (let _i52 = 0; _i52 < _a51.length; _i52++) {
      const v_c = _a51[_i52];
      if (!(((b.grid[v_c] || -1) === v_d))) continue;
      L54: {
        const v_A = _eg53.of(v_c);
        const _h55 = v_A.length;
        let _c62: boolean = ((v_c === (v_A[0] ?? -1)) && (_h55 !== v_d));
        if (_c62) {
          let _q56 = false;
          Q57: {
            const _a58 = v_A;
            for (let _i59 = 0; _i59 < _a58.length; _i59++) {
              const v_a = _a58[_i59];
              const _a60 = sp.adj4[v_a];
              for (let _i61 = 0; _i61 < _a60.length; _i61++) {
                const v_z = _a60[_i61];
                if (!(!(_eg53.of(v_z) === v_A))) continue;
                if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                  _q56 = true;
                  break Q57;
                }
              }
            }
          }
          _c62 = !(_q56);
        }
        if (!(_c62)) break L54;
        const v_R = _eg63.of(v_c);
        const _h99 = v_R.length;
        _g64.length = 0;
        G65: {
          const _a68 = v_R;
          for (let _i69 = 0; _i69 < _a68.length; _i69++) {
            const v_t = _a68[_i69];
            if (!((!((b.grid[v_t] !== 0)) && (reaches(sp, v_c, v_R, v_t) < v_d)))) continue;
            _g64.push(v_t);
          }
        }
        const v_Y = _g64;
        if (b.made[0] !== _m105_0 || b.made[1] !== _m106_1) {
          const _now70 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false).of(v_c);
          if (!(_now70 === _eg53.of(v_c) || sameSet(_now70, _eg53.of(v_c)))) { continue R2; }
          const _now71 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false).of(v_c);
          if (!(_now71 === _eg63.of(v_c) || sameSet(_now71, _eg63.of(v_c)))) { continue R2; }
        }
        if (DEV && staleChecking) {
          const _g72: number[] = [];
          G73: {
            const _a76 = sp.edges;
            for (let _i77 = 0; _i77 < _a76.length; _i77++) {
              const v_e = _a76[_i77];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g72.push(v_e);
            }
          }
          const _fg78 = edgeGroups(sp, _g72);
          const _g79: number[] = [];
          G80: {
            const _a83 = sp.edges;
            for (let _i84 = 0; _i84 < _a83.length; _i84++) {
              const v_e = _a83[_i84];
              if (!(((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === v_d)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === v_d))))) continue;
              _g79.push(v_e);
            }
          }
          const _fg85 = edgeGroups(sp, _g79);
          let _c92: boolean = ((v_c === (v_A[0] ?? -1)) && (v_A.length !== v_d));
          if (_c92) {
            let _q86 = false;
            Q87: {
              const _a88 = v_A;
              for (let _i89 = 0; _i89 < _a88.length; _i89++) {
                const v_a = _a88[_i89];
                const _a90 = sp.adj4[v_a];
                for (let _i91 = 0; _i91 < _a90.length; _i91++) {
                  const v_z = _a90[_i91];
                  if (!(!(_eg53.of(v_z) === v_A))) continue;
                  if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                    _q86 = true;
                    break Q87;
                  }
                }
              }
            }
            _c92 = !(_q86);
          }
          const _g93: number[] = [];
          G94: {
            const _a97 = v_R;
            for (let _i98 = 0; _i98 < _a97.length; _i98++) {
              const v_t = _a97[_i98];
              if (!((!((b.grid[v_t] !== 0)) && (reaches(sp, v_c, v_R, v_t) < v_d)))) continue;
              _g93.push(v_t);
            }
          }
          freshBinding("mustGrow", [sameSet(_fg78.of(v_c), _eg53.of(v_c)), (((b.domain >> v_d) & 1) !== 0), sameSet(_fg85.of(v_c), _eg63.of(v_c)), (sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === v_d), sameSet(v_A, through(sp, v_c, v_O)), _c92, sameSet(v_R, through(sp, v_c, v_F)), sameSet(v_Y, _g93)], ["O's groups", "d in", "F's groups", "c in", "where of c", "A =", "where of A", "R =", "Y ="]);
        }
        facts.length = 0;
        changed = false;
        let _c104: boolean = ((_h55 < v_d) && (_h99 >= v_d));
        if (_c104) {
          let _q100 = true;
          Q101: {
            const _a102 = v_Y;
            for (let _i103 = 0; _i103 < _a102.length; _i103++) {
              const v_t = _a102[_i103];
              if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, v_d); changed = true; } else facts.push(PLACE, v_t, v_d); }
              if (!(true)) {
                _q100 = false;
                break Q101;
              }
            }
          }
          _c104 = _q100;
        }
        if (!(_c104)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ O: v_O.slice(), d: v_d, F: v_F.slice(), c: v_c, A: v_A.slice(), R: v_R.slice(), Y: v_Y.slice() }, facts)) return 1;
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
  d: number;
  T: readonly number[];
}

const onlyWayFacts: number[] = [];
const onlyWay_st85 = stamps();
const onlyWay_st96 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, fire: Fire<OnlyWayBinding> | null): number {
  const _g50: number[] = [];
  const _g68: number[] = [];
  const _g90: number[] = [];
  const _g106: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m159_0 = b.made[0];
  _g50.length = 0;
  G51: {
    const _a54 = sp.edges;
    for (let _i55 = 0; _i55 < _a54.length; _i55++) {
      const v_e = _a54[_i55];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g50.push(v_e);
    }
  }
  const v_O = _g50;
  const _m160_1 = b.made[1];
  const _eg58 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a56 = sp.cells;
  for (let _i57 = 0; _i57 < _a56.length; _i57++) {
    const v_c = _a56[_i57];
    if (!((b.grid[v_c] !== 0))) continue;
    L59: {
      const v_A = _eg58.of(v_c);
      const _h60 = v_A.length;
      let _c67: boolean = ((v_c === (v_A[0] ?? -1)) && (_h60 < (b.grid[v_c] || -1)));
      if (_c67) {
        let _q61 = false;
        Q62: {
          const _a63 = v_A;
          for (let _i64 = 0; _i64 < _a63.length; _i64++) {
            const v_a = _a63[_i64];
            const _a65 = sp.adj4[v_a];
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_z = _a65[_i66];
              if (!(!(_eg58.of(v_z) === v_A))) continue;
              if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                _q61 = true;
                break Q62;
              }
            }
          }
        }
        _c67 = !(_q61);
      }
      if (!(_c67)) break L59;
      const v_d = (b.grid[v_c] || -1);
      _g68.length = 0;
      onlyWay_st85.pass++;
      G69: {
        const _a86 = v_A;
        for (let _i87 = 0; _i87 < _a86.length; _i87++) {
          const v_a = _a86[_i87];
          const _a88 = sp.adj4[v_a];
          for (let _i89 = 0; _i89 < _a88.length; _i89++) {
            const v_t = _a88[_i89];
            let _c102: boolean = !((b.grid[v_t] !== 0));
            if (_c102) {
              _g90.length = 0;
              onlyWay_st96.pass++;
              G91: {
                const _a97 = sp.adj4[v_t];
                for (let _i98 = 0; _i98 < _a97.length; _i98++) {
                  const v_z = _a97[_i98];
                  if (!(((b.grid[v_z] || -1) === v_d))) continue;
                  const _a99 = _eg58.of(v_z);
                  for (let _i100 = 0; _i100 < _a99.length; _i100++) {
                    const v_a = _a99[_i100];
                    const _t101 = v_a;
                    if (_g90.length < 16) { if (!_g90.includes(_t101)) _g90.push(_t101); } else addOnce(_g90, onlyWay_st96, _t101);
                  }
                }
              }
              _c102 = ((1 + _g90.length) <= v_d);
            }
            if (!(_c102)) continue;
            const _t103 = v_t;
            if (_g68.length < 16) { if (!_g68.includes(_t103)) _g68.push(_t103); } else addOnce(_g68, onlyWay_st85, _t103);
          }
        }
      }
      L104: {
        const v_T = _g68;
        const _h105 = v_T.length;
        if (!((_h105 <= 1))) break L104;
        if (b.made[0] !== _m159_0 || b.made[1] !== _m160_1) {
          _g106.length = 0;
          G107: {
            const _a110 = sp.edges;
            for (let _i111 = 0; _i111 < _a110.length; _i111++) {
              const v_e = _a110[_i111];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g106.push(v_e);
            }
          }
          if (!(sameSet(v_O, _g106))) { return fired; }
        }
        if (DEV && staleChecking) {
          const _g112: number[] = [];
          G113: {
            const _a116 = sp.edges;
            for (let _i117 = 0; _i117 < _a116.length; _i117++) {
              const v_e = _a116[_i117];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g112.push(v_e);
            }
          }
          let _c124: boolean = ((v_c === (v_A[0] ?? -1)) && (v_A.length < (b.grid[v_c] || -1)));
          if (_c124) {
            let _q118 = false;
            Q119: {
              const _a120 = v_A;
              for (let _i121 = 0; _i121 < _a120.length; _i121++) {
                const v_a = _a120[_i121];
                const _a122 = sp.adj4[v_a];
                for (let _i123 = 0; _i123 < _a122.length; _i123++) {
                  const v_z = _a122[_i123];
                  if (!(!(_eg58.of(v_z) === v_A))) continue;
                  if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                    _q118 = true;
                    break Q119;
                  }
                }
              }
            }
            _c124 = !(_q118);
          }
          const _g125: number[] = [];
          G126: {
            const _a142 = v_A;
            for (let _i143 = 0; _i143 < _a142.length; _i143++) {
              const v_a = _a142[_i143];
              const _a144 = sp.adj4[v_a];
              for (let _i145 = 0; _i145 < _a144.length; _i145++) {
                const v_t = _a144[_i145];
                let _c156: boolean = !((b.grid[v_t] !== 0));
                if (_c156) {
                  const _g146: number[] = [];
                  G147: {
                    const _a152 = sp.adj4[v_t];
                    for (let _i153 = 0; _i153 < _a152.length; _i153++) {
                      const v_z = _a152[_i153];
                      if (!(((b.grid[v_z] || -1) === v_d))) continue;
                      const _a154 = through(sp, v_z, v_O);
                      for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                        const v_a = _a154[_i155];
                        if (!_g146.includes(v_a)) _g146.push(v_a);
                      }
                    }
                  }
                  _c156 = ((1 + _g146.length) <= v_d);
                }
                if (!(_c156)) continue;
                if (!_g125.includes(v_t)) _g125.push(v_t);
              }
            }
          }
          freshBinding("onlyWay", [sameSet(v_O, _g112), (sp.cells.includes(v_c)), (b.grid[v_c] !== 0), sameSet(v_A, through(sp, v_c, v_O)), _c124, (v_d === (b.grid[v_c] || -1)), sameSet(v_T, _g125), (v_T.length <= 1)], ["O =", "c in", "where of c", "A =", "where of A", "d =", "T =", "where of T"]);
        }
        facts.length = 0;
        changed = false;
        let _c158: boolean = (_h105 === 1);
        if (_c158) {
          const _t157 = (v_T[0] ?? -1);
          if (!(b.grid[_t157] !== 0)) { if (fire === null) { b.placeAt(_t157, v_d); changed = true; } else facts.push(PLACE, _t157, v_d); }
          _c158 = true;
        }
        if (!(_c158)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ O: v_O.slice(), c: v_c, A: v_A.slice(), d: v_d, T: v_T.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface TooBigBinding {
  O: readonly number[];
  c: number;
  d: number;
}

const tooBigFacts: number[] = [];
let tooBigCands = new Int32Array(0);
const tooBig_st39 = stamps();

/** Its dearest read grows with the board as n. */
export function tooBig(b: Marks, sp: GridSpace, fire: Fire<TooBigBinding> | null): number {
  const _g20: number[] = [];
  const _g33: number[] = [];
  const _g47: number[] = [];
  const facts = tooBigFacts;
  let fired = 0;
  let changed = false;
  if (tooBigCands.length < sp.cells.length) tooBigCands = new Int32Array(sp.cells.length);
  const cands = tooBigCands;
  cands.fill(-1);
  const _m69_0 = b.made[0];
  _g20.length = 0;
  G21: {
    const _a24 = sp.edges;
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      const v_e = _a24[_i25];
      const _h26 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h27 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h28 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h26 && (_h27 === _h28)))) continue;
      _g20.push(v_e);
    }
  }
  const v_O = _g20;
  const _m70_1 = b.made[1];
  const _eg43 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a29 = sp.cells;
  R1:
  for (let _i30 = 0; _i30 < _a29.length; _i30++) {
    const v_c = _a29[_i30];
    const _h31 = (b.grid[v_c] !== 0);
    if (!(!(_h31))) continue;
    R2:
    for (let _m32 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m32 !== 0; _m32 &= _m32 - 1) {
      const v_d = 31 - Math.clz32(_m32 & -_m32);
      _g33.length = 0;
      tooBig_st39.pass++;
      G34: {
        const _a40 = sp.adj4[v_c];
        for (let _i41 = 0; _i41 < _a40.length; _i41++) {
          const v_z = _a40[_i41];
          const _h42 = (b.grid[v_z] || -1);
          if (!((_h42 === v_d))) continue;
          const _a44 = _eg43.of(v_z);
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            const v_a = _a44[_i45];
            const _t46 = v_a;
            if (_g33.length < 16) { if (!_g33.includes(_t46)) _g33.push(_t46); } else addOnce(_g33, tooBig_st39, _t46);
          }
        }
      }
      if (!(((1 + _g33.length) > v_d))) continue;
      if (b.made[0] !== _m69_0 || b.made[1] !== _m70_1) {
        _g47.length = 0;
        G48: {
          const _a51 = sp.edges;
          for (let _i52 = 0; _i52 < _a51.length; _i52++) {
            const v_e = _a51[_i52];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g47.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g47))) { return fired; }
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) { continue R2; }
      }
      if (DEV && staleChecking) {
        const _g53: number[] = [];
        G54: {
          const _a57 = sp.edges;
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_e = _a57[_i58];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g53.push(v_e);
          }
        }
        const _g59: number[] = [];
        G60: {
          const _a65 = sp.adj4[v_c];
          for (let _i66 = 0; _i66 < _a65.length; _i66++) {
            const v_z = _a65[_i66];
            if (!(((b.grid[v_z] || -1) === v_d))) continue;
            const _a67 = through(sp, v_z, v_O);
            for (let _i68 = 0; _i68 < _a67.length; _i68++) {
              const v_a = _a67[_i68];
              if (!_g59.includes(v_a)) _g59.push(v_a);
            }
          }
        }
        freshBinding("tooBig", [sameSet(v_O, _g53), (sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), (((b.cands[v_c] >> v_d) & 1) !== 0), ((1 + _g59.length) > v_d)], ["O =", "c in", "where of c", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O.slice(), c: v_c, d: v_d }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface NoRoomBinding {
  d: number;
  F: readonly number[];
  c: number;
}

const noRoomFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function noRoom(b: Marks, sp: GridSpace, fire: Fire<NoRoomBinding> | null): number {
  const _g11: number[] = [];
  const facts = noRoomFacts;
  let fired = 0;
  let changed = false;
  for (let _m10 = b.domain; _m10 !== 0; _m10 &= _m10 - 1) {
    const v_d = 31 - Math.clz32(_m10 & -_m10);
    const _m34_0 = b.made[0];
    _g11.length = 0;
    G12: {
      const _a15 = sp.edges;
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_e = _a15[_i16];
        const _h17 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
        const _h18 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
        const _h19 = (b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0);
        const _h20 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!(((!(_h17) || (_h18 === v_d)) && (!(_h19) || (_h20 === v_d))))) continue;
        _g11.push(v_e);
      }
    }
    const v_F = _g11;
    const _m35_1 = b.made[1];
    const _eg24 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a21 = sp.cells;
    R2:
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_c = _a21[_i22];
      const _h23 = (b.grid[v_c] !== 0);
      const _h25 = _eg24.of(v_c).length;
      if (!(((!(_h23) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h25 < v_d)))) continue;
      if (b.made[0] !== _m34_0 || b.made[1] !== _m35_1) {
        const _now26 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false).of(v_c);
        if (!(_now26 === _eg24.of(v_c) || sameSet(_now26, _eg24.of(v_c)))) { continue R2; }
      }
      if (DEV && staleChecking) {
        const _g27: number[] = [];
        G28: {
          const _a31 = sp.edges;
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_e = _a31[_i32];
            if (!(((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === v_d)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === v_d))))) continue;
            _g27.push(v_e);
          }
        }
        const _fg33 = edgeGroups(sp, _g27);
        freshBinding("noRoom", [(((b.domain >> v_d) & 1) !== 0), sameSet(_fg33.of(v_c), _eg24.of(v_c)), (sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (through(sp, v_c, v_F).length < v_d))], ["d in", "F's groups", "c in", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ d: v_d, F: v_F.slice(), c: v_c }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface TooFarBinding {
  O: readonly number[];
  d: number;
  F: readonly number[];
  c: number;
}

const tooFarFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function tooFar(b: Marks, sp: GridSpace, fire: Fire<TooFarBinding> | null): number {
  const _g15: number[] = [];
  const _g40: number[] = [];
  const facts = tooFarFacts;
  let fired = 0;
  let changed = false;
  const _m57_0 = b.made[0];
  _g15.length = 0;
  G16: {
    const _a19 = sp.edges;
    for (let _i20 = 0; _i20 < _a19.length; _i20++) {
      const v_e = _a19[_i20];
      const _h21 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h22 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h23 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h21 && (_h22 === _h23)))) continue;
      _g15.push(v_e);
    }
  }
  const v_O = _g15;
  const _m58_1 = b.made[1];
  const _eg35 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  R1:
  for (let _m24 = b.domain; _m24 !== 0; _m24 &= _m24 - 1) {
    const v_d = 31 - Math.clz32(_m24 & -_m24);
    const v_F = fresh(b, sp, v_d);
    const _eg28 = edgeGroups(sp, v_F);
    const _a25 = sp.cells;
    for (let _i26 = 0; _i26 < _a25.length; _i26++) {
      const v_c = _a25[_i26];
      const _h27 = (b.grid[v_c] !== 0);
      const _h29 = _eg28.of(v_c).length;
      const _h37 = (v_c % sp.w);
      const _h38 = ((v_c / sp.w) | 0);
      let _c39: boolean = ((!(_h27) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h29 < v_d));
      if (_c39) {
        let _q30 = false;
        Q31: {
          const _a32 = cellsValued(b, sp.cells, v_d);
          for (let _i33 = 0; _i33 < _a32.length; _i33++) {
            const v_a = _a32[_i33];
            const _h34 = (b.grid[v_a] || -1);
            if (!((_h34 === v_d))) continue;
            const _h36 = _eg35.of(v_a).length;
            if ((((_h36 + Math.abs(((v_a % sp.w) - _h37))) + Math.abs((((v_a / sp.w) | 0) - _h38))) <= v_d)) {
              _q30 = true;
              break Q31;
            }
          }
        }
        _c39 = !(_q30);
      }
      if (!(_c39)) continue;
      if (b.made[0] !== _m57_0 || b.made[1] !== _m58_1) {
        _g40.length = 0;
        G41: {
          const _a44 = sp.edges;
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            const v_e = _a44[_i45];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g40.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g40))) { return fired; }
        if (!(sameSet(v_F, fresh(b, sp, v_d)))) { continue R1; }
      }
      if (DEV && staleChecking) {
        const _g46: number[] = [];
        G47: {
          const _a50 = sp.edges;
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_e = _a50[_i51];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g46.push(v_e);
          }
        }
        let _c56: boolean = ((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (through(sp, v_c, v_F).length < v_d));
        if (_c56) {
          let _q52 = false;
          Q53: {
            const _a54 = cellsValued(b, sp.cells, v_d);
            for (let _i55 = 0; _i55 < _a54.length; _i55++) {
              const v_a = _a54[_i55];
              if (!(((b.grid[v_a] || -1) === v_d))) continue;
              if ((((through(sp, v_a, v_O).length + Math.abs(((v_a % sp.w) - (v_c % sp.w)))) + Math.abs((((v_a / sp.w) | 0) - ((v_c / sp.w) | 0)))) <= v_d)) {
                _q52 = true;
                break Q53;
              }
            }
          }
          _c56 = !(_q52);
        }
        freshBinding("tooFar", [sameSet(v_O, _g46), (((b.domain >> v_d) & 1) !== 0), sameSet(v_F, fresh(b, sp, v_d)), (sp.cells.includes(v_c)), _c56], ["O =", "d in", "F =", "c in", "where of c"]);
      }
      facts.length = 0;
      changed = false;
      if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O.slice(), d: v_d, F: v_F.slice(), c: v_c }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface OnlyNumberBinding {
  c: number;
}

const onlyNumberFacts: number[] = [];
let onlyNumberCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function onlyNumber(b: Marks, sp: GridSpace, fire: Fire<OnlyNumberBinding> | null): number {
  const facts = onlyNumberFacts;
  let fired = 0;
  let changed = false;
  if (onlyNumberCands.length < sp.cells.length) onlyNumberCands = new Int32Array(sp.cells.length);
  const cands = onlyNumberCands;
  cands.fill(-1);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1)))) continue;
    if (DEV && staleChecking) {
      freshBinding("onlyNumber", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c9: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c9) {
      let _g5 = -1;
      let _n7 = 0;
      G6: {
        for (let _m8 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m8 !== 0; _m8 &= _m8 - 1) {
          const v_d = 31 - Math.clz32(_m8 & -_m8);
          if (++_n7 === 2) {
            _g5 = -1;
            break G6;
          }
          _g5 = v_d;
        }
      }
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _g5); changed = true; } else facts.push(PLACE, v_c, _g5); }
      _c9 = true;
    }
    if (!(_c9)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1)));
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds1(b: Marks, sp: GridSpace, _cl: null, v_e: number, a: number): boolean {
  return ((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === a)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === a)));
}

const freshKept = keptStore<readonly number[]>();

/** `fresh(d)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function fresh(b: Marks, sp: GridSpace, v_d: number): readonly number[] {
  const _kept: Kept<readonly number[]> = freshKept.marks(b);
  if (_kept[v_d] !== undefined) return _kept[v_d];
  const _g1: number[] = [];
  G2: {
    const _a18 = sp.edges;
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_e = _a18[_i19];
      const _t20 = sp.edgeEnds[2 * v_e];
      let _c25: boolean = !((b.grid[_t20] !== 0));
      if (_c25) {
        let _q21 = false;
        Q22: {
          const _a23 = sp.adj4[_t20];
          for (let _i24 = 0; _i24 < _a23.length; _i24++) {
            const v_z = _a23[_i24];
            if (((b.grid[v_z] || -1) === v_d)) {
              _q21 = true;
              break Q22;
            }
          }
        }
        _c25 = !(_q21);
      }
      let _c32: boolean = _c25;
      if (_c32) {
        const _t26 = sp.edgeEnds[2 * v_e + 1];
        let _c31: boolean = !((b.grid[_t26] !== 0));
        if (_c31) {
          let _q27 = false;
          Q28: {
            const _a29 = sp.adj4[_t26];
            for (let _i30 = 0; _i30 < _a29.length; _i30++) {
              const v_z = _a29[_i30];
              if (((b.grid[v_z] || -1) === v_d)) {
                _q27 = true;
                break Q28;
              }
            }
          }
          _c31 = !(_q27);
        }
        _c32 = _c31;
      }
      if (!(_c32)) continue;
      _g1.push(v_e);
    }
  }
  const _made = _g1;
  _kept[v_d] = _made;
  return _made;
}
