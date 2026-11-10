// Compiled by `npm run describe` from src/games/filling/filling.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, cellsValued, edgeGroups, freshBinding, keptEdgeGroups, keptStore, popcount, rangeMask, reaches, sameSet, staleChecking, stamps, through, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g463: number[] = [];
  const _domain = rangeMask(1, cl.largest);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q461 = true;
  Q462: {
    _g463.length = 0;
    G464: {
      const _a467 = sp.edges;
      for (let _i468 = 0; _i468 < _a467.length; _i468++) {
        const v_e = _a467[_i468];
        const _h469 = (g[sp.edgeEnds[2 * v_e]] || -1);
        const _h470 = (g[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!((_h469 === _h470))) continue;
        _g463.push(v_e);
      }
    }
    const v_O = _g463;
    const _eg473 = edgeGroups(sp, v_O);
    const _a471 = sp.cells;
    for (let _i472 = 0; _i472 < _a471.length; _i472++) {
      const v_c = _a471[_i472];
      const _h474 = _eg473.of(v_c).length;
      const _h475 = (g[v_c] || -1);
      if (!((_h474 === _h475))) {
        _q461 = false;
        break Q462;
      }
    }
  }
  if (!(_q461)) return false;
  for (let _k476 = 0; _k476 < cl.number.at.length; _k476++) {
    const _at477 = cl.number.at[_k476];
    const _v478 = cl.number.v[_k476];
    if (!(((g[_at477] || -1) === _v478))) return false;
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
  const _m4_0 = b.made[0];
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
  const _m7_1 = b.made[1];
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
        if (b.made[0] !== _m4_0 || b.made[1] !== _m7_1) {
          const _now70 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false).of(v_c);
          if (!(_now70 === _eg53.of(v_c) || sameSet(_now70, _eg53.of(v_c)))) { continue R2; }
          const _now71 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false).of(v_c);
          if (!(_now71 === _eg63.of(v_c) || sameSet(_now71, _eg63.of(v_c)))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
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
const _st189 = stamps();
const _st200 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, fire: Fire<OnlyWayBinding> | null): number {
  const _g154: number[] = [];
  const _g172: number[] = [];
  const _g194: number[] = [];
  const _g210: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m45_0 = b.made[0];
  _g154.length = 0;
  G155: {
    const _a158 = sp.edges;
    for (let _i159 = 0; _i159 < _a158.length; _i159++) {
      const v_e = _a158[_i159];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g154.push(v_e);
    }
  }
  const v_O = _g154;
  const _m48_1 = b.made[1];
  const _eg162 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a160 = sp.cells;
  for (let _i161 = 0; _i161 < _a160.length; _i161++) {
    const v_c = _a160[_i161];
    if (!((b.grid[v_c] !== 0))) continue;
    L163: {
      const v_A = _eg162.of(v_c);
      const _h164 = v_A.length;
      let _c171: boolean = ((v_c === (v_A[0] ?? -1)) && (_h164 < (b.grid[v_c] || -1)));
      if (_c171) {
        let _q165 = false;
        Q166: {
          const _a167 = v_A;
          for (let _i168 = 0; _i168 < _a167.length; _i168++) {
            const v_a = _a167[_i168];
            const _a169 = sp.adj4[v_a];
            for (let _i170 = 0; _i170 < _a169.length; _i170++) {
              const v_z = _a169[_i170];
              if (!(!(_eg162.of(v_z) === v_A))) continue;
              if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                _q165 = true;
                break Q166;
              }
            }
          }
        }
        _c171 = !(_q165);
      }
      if (!(_c171)) break L163;
      const v_d = (b.grid[v_c] || -1);
      _g172.length = 0;
      _st189.pass++;
      G173: {
        const _a190 = v_A;
        for (let _i191 = 0; _i191 < _a190.length; _i191++) {
          const v_a = _a190[_i191];
          const _a192 = sp.adj4[v_a];
          for (let _i193 = 0; _i193 < _a192.length; _i193++) {
            const v_t = _a192[_i193];
            let _c206: boolean = !((b.grid[v_t] !== 0));
            if (_c206) {
              _g194.length = 0;
              _st200.pass++;
              G195: {
                const _a201 = sp.adj4[v_t];
                for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                  const v_z = _a201[_i202];
                  if (!(((b.grid[v_z] || -1) === v_d))) continue;
                  const _a203 = _eg162.of(v_z);
                  for (let _i204 = 0; _i204 < _a203.length; _i204++) {
                    const v_a = _a203[_i204];
                    const _t205 = v_a;
                    if (_g194.length < 16) { if (!_g194.includes(_t205)) _g194.push(_t205); } else addOnce(_g194, _st200, _t205);
                  }
                }
              }
              _c206 = ((1 + _g194.length) <= v_d);
            }
            if (!(_c206)) continue;
            const _t207 = v_t;
            if (_g172.length < 16) { if (!_g172.includes(_t207)) _g172.push(_t207); } else addOnce(_g172, _st189, _t207);
          }
        }
      }
      L208: {
        const v_T = _g172;
        const _h209 = v_T.length;
        if (!((_h209 <= 1))) break L208;
        if (b.made[0] !== _m45_0 || b.made[1] !== _m48_1) {
          _g210.length = 0;
          G211: {
            const _a214 = sp.edges;
            for (let _i215 = 0; _i215 < _a214.length; _i215++) {
              const v_e = _a214[_i215];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g210.push(v_e);
            }
          }
          if (!(sameSet(v_O, _g210))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g216: number[] = [];
          G217: {
            const _a220 = sp.edges;
            for (let _i221 = 0; _i221 < _a220.length; _i221++) {
              const v_e = _a220[_i221];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g216.push(v_e);
            }
          }
          let _c228: boolean = ((v_c === (v_A[0] ?? -1)) && (v_A.length < (b.grid[v_c] || -1)));
          if (_c228) {
            let _q222 = false;
            Q223: {
              const _a224 = v_A;
              for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                const v_a = _a224[_i225];
                const _a226 = sp.adj4[v_a];
                for (let _i227 = 0; _i227 < _a226.length; _i227++) {
                  const v_z = _a226[_i227];
                  if (!(!(_eg162.of(v_z) === v_A))) continue;
                  if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                    _q222 = true;
                    break Q223;
                  }
                }
              }
            }
            _c228 = !(_q222);
          }
          const _g229: number[] = [];
          G230: {
            const _a246 = v_A;
            for (let _i247 = 0; _i247 < _a246.length; _i247++) {
              const v_a = _a246[_i247];
              const _a248 = sp.adj4[v_a];
              for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                const v_t = _a248[_i249];
                let _c260: boolean = !((b.grid[v_t] !== 0));
                if (_c260) {
                  const _g250: number[] = [];
                  G251: {
                    const _a256 = sp.adj4[v_t];
                    for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                      const v_z = _a256[_i257];
                      if (!(((b.grid[v_z] || -1) === v_d))) continue;
                      const _a258 = through(sp, v_z, v_O);
                      for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                        const v_a = _a258[_i259];
                        if (!_g250.includes(v_a)) _g250.push(v_a);
                      }
                    }
                  }
                  _c260 = ((1 + _g250.length) <= v_d);
                }
                if (!(_c260)) continue;
                if (!_g229.includes(v_t)) _g229.push(v_t);
              }
            }
          }
          freshBinding("onlyWay", [sameSet(v_O, _g216), (sp.cells.includes(v_c)), (b.grid[v_c] !== 0), sameSet(v_A, through(sp, v_c, v_O)), _c228, (v_d === (b.grid[v_c] || -1)), sameSet(v_T, _g229), (v_T.length <= 1)], ["O =", "c in", "where of c", "A =", "where of A", "d =", "T =", "where of T"]);
        }
        facts.length = 0;
        changed = false;
        let _c262: boolean = (_h209 === 1);
        if (_c262) {
          const _t261 = (v_T[0] ?? -1);
          if (!(b.grid[_t261] !== 0)) { if (fire === null) { b.placeAt(_t261, v_d); changed = true; } else facts.push(PLACE, _t261, v_d); }
          _c262 = true;
        }
        if (!(_c262)) return -1;
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
const _st301 = stamps();

/** Its dearest read grows with the board as n. */
export function tooBig(b: Marks, sp: GridSpace, fire: Fire<TooBigBinding> | null): number {
  const _g282: number[] = [];
  const _g295: number[] = [];
  const _g309: number[] = [];
  const facts = tooBigFacts;
  let fired = 0;
  let changed = false;
  if (tooBigCands.length < sp.cells.length) tooBigCands = new Int32Array(sp.cells.length);
  const cands = tooBigCands;
  cands.fill(-1);
  const _m80_0 = b.made[0];
  _g282.length = 0;
  G283: {
    const _a286 = sp.edges;
    for (let _i287 = 0; _i287 < _a286.length; _i287++) {
      const v_e = _a286[_i287];
      const _h288 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h289 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h290 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h288 && (_h289 === _h290)))) continue;
      _g282.push(v_e);
    }
  }
  const v_O = _g282;
  const _m83_1 = b.made[1];
  const _eg305 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a291 = sp.cells;
  R1:
  for (let _i292 = 0; _i292 < _a291.length; _i292++) {
    const v_c = _a291[_i292];
    const _h293 = (b.grid[v_c] !== 0);
    if (!(!(_h293))) continue;
    R2:
    for (let _m294 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m294 !== 0; _m294 &= _m294 - 1) {
      const v_d = 31 - Math.clz32(_m294 & -_m294);
      _g295.length = 0;
      _st301.pass++;
      G296: {
        const _a302 = sp.adj4[v_c];
        for (let _i303 = 0; _i303 < _a302.length; _i303++) {
          const v_z = _a302[_i303];
          const _h304 = (b.grid[v_z] || -1);
          if (!((_h304 === v_d))) continue;
          const _a306 = _eg305.of(v_z);
          for (let _i307 = 0; _i307 < _a306.length; _i307++) {
            const v_a = _a306[_i307];
            const _t308 = v_a;
            if (_g295.length < 16) { if (!_g295.includes(_t308)) _g295.push(_t308); } else addOnce(_g295, _st301, _t308);
          }
        }
      }
      if (!(((1 + _g295.length) > v_d))) continue;
      if (b.made[0] !== _m80_0 || b.made[1] !== _m83_1) {
        _g309.length = 0;
        G310: {
          const _a313 = sp.edges;
          for (let _i314 = 0; _i314 < _a313.length; _i314++) {
            const v_e = _a313[_i314];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g309.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g309))) { return fired; }
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g315: number[] = [];
        G316: {
          const _a319 = sp.edges;
          for (let _i320 = 0; _i320 < _a319.length; _i320++) {
            const v_e = _a319[_i320];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g315.push(v_e);
          }
        }
        const _g321: number[] = [];
        G322: {
          const _a327 = sp.adj4[v_c];
          for (let _i328 = 0; _i328 < _a327.length; _i328++) {
            const v_z = _a327[_i328];
            if (!(((b.grid[v_z] || -1) === v_d))) continue;
            const _a329 = through(sp, v_z, v_O);
            for (let _i330 = 0; _i330 < _a329.length; _i330++) {
              const v_a = _a329[_i330];
              if (!_g321.includes(v_a)) _g321.push(v_a);
            }
          }
        }
        freshBinding("tooBig", [sameSet(v_O, _g315), (sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), (((b.cands[v_c] >> v_d) & 1) !== 0), ((1 + _g321.length) > v_d)], ["O =", "c in", "where of c", "d in", "where of d"]);
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
  const _g341: number[] = [];
  const facts = noRoomFacts;
  let fired = 0;
  let changed = false;
  for (let _m340 = b.domain; _m340 !== 0; _m340 &= _m340 - 1) {
    const v_d = 31 - Math.clz32(_m340 & -_m340);
    const _m105_0 = b.made[0];
    _g341.length = 0;
    G342: {
      const _a345 = sp.edges;
      for (let _i346 = 0; _i346 < _a345.length; _i346++) {
        const v_e = _a345[_i346];
        const _h347 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
        const _h348 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
        const _h349 = (b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0);
        const _h350 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!(((!(_h347) || (_h348 === v_d)) && (!(_h349) || (_h350 === v_d))))) continue;
        _g341.push(v_e);
      }
    }
    const v_F = _g341;
    const _m108_1 = b.made[1];
    const _eg354 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a351 = sp.cells;
    R2:
    for (let _i352 = 0; _i352 < _a351.length; _i352++) {
      const v_c = _a351[_i352];
      const _h353 = (b.grid[v_c] !== 0);
      const _h355 = _eg354.of(v_c).length;
      if (!(((!(_h353) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h355 < v_d)))) continue;
      if (b.made[0] !== _m105_0 || b.made[1] !== _m108_1) {
        const _now356 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false).of(v_c);
        if (!(_now356 === _eg354.of(v_c) || sameSet(_now356, _eg354.of(v_c)))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g357: number[] = [];
        G358: {
          const _a361 = sp.edges;
          for (let _i362 = 0; _i362 < _a361.length; _i362++) {
            const v_e = _a361[_i362];
            if (!(((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === v_d)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === v_d))))) continue;
            _g357.push(v_e);
          }
        }
        const _fg363 = edgeGroups(sp, _g357);
        freshBinding("noRoom", [(((b.domain >> v_d) & 1) !== 0), sameSet(_fg363.of(v_c), _eg354.of(v_c)), (sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (through(sp, v_c, v_F).length < v_d))], ["d in", "F's groups", "c in", "where of c"]);
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
  const _g410: number[] = [];
  const _g435: number[] = [];
  const facts = tooFarFacts;
  let fired = 0;
  let changed = false;
  const _m120_0 = b.made[0];
  _g410.length = 0;
  G411: {
    const _a414 = sp.edges;
    for (let _i415 = 0; _i415 < _a414.length; _i415++) {
      const v_e = _a414[_i415];
      const _h416 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h417 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h418 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h416 && (_h417 === _h418)))) continue;
      _g410.push(v_e);
    }
  }
  const v_O = _g410;
  const _m123_1 = b.made[1];
  const _eg430 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  R1:
  for (let _m419 = b.domain; _m419 !== 0; _m419 &= _m419 - 1) {
    const v_d = 31 - Math.clz32(_m419 & -_m419);
    const v_F = fresh(b, sp, v_d);
    const _eg423 = edgeGroups(sp, v_F);
    const _a420 = sp.cells;
    for (let _i421 = 0; _i421 < _a420.length; _i421++) {
      const v_c = _a420[_i421];
      const _h422 = (b.grid[v_c] !== 0);
      const _h424 = _eg423.of(v_c).length;
      const _h432 = (v_c % sp.w);
      const _h433 = ((v_c / sp.w) | 0);
      let _c434: boolean = ((!(_h422) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h424 < v_d));
      if (_c434) {
        let _q425 = false;
        Q426: {
          const _a427 = cellsValued(b, sp.cells, v_d);
          for (let _i428 = 0; _i428 < _a427.length; _i428++) {
            const v_a = _a427[_i428];
            const _h429 = (b.grid[v_a] || -1);
            if (!((_h429 === v_d))) continue;
            const _h431 = _eg430.of(v_a).length;
            if ((((_h431 + Math.abs(((v_a % sp.w) - _h432))) + Math.abs((((v_a / sp.w) | 0) - _h433))) <= v_d)) {
              _q425 = true;
              break Q426;
            }
          }
        }
        _c434 = !(_q425);
      }
      if (!(_c434)) continue;
      if (b.made[0] !== _m120_0 || b.made[1] !== _m123_1) {
        _g435.length = 0;
        G436: {
          const _a439 = sp.edges;
          for (let _i440 = 0; _i440 < _a439.length; _i440++) {
            const v_e = _a439[_i440];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g435.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g435))) { return fired; }
        if (!(sameSet(v_F, fresh(b, sp, v_d)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g441: number[] = [];
        G442: {
          const _a445 = sp.edges;
          for (let _i446 = 0; _i446 < _a445.length; _i446++) {
            const v_e = _a445[_i446];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g441.push(v_e);
          }
        }
        let _c451: boolean = ((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (through(sp, v_c, v_F).length < v_d));
        if (_c451) {
          let _q447 = false;
          Q448: {
            const _a449 = cellsValued(b, sp.cells, v_d);
            for (let _i450 = 0; _i450 < _a449.length; _i450++) {
              const v_a = _a449[_i450];
              if (!(((b.grid[v_a] || -1) === v_d))) continue;
              if ((((through(sp, v_a, v_O).length + Math.abs(((v_a % sp.w) - (v_c % sp.w)))) + Math.abs((((v_a / sp.w) | 0) - ((v_c / sp.w) | 0)))) <= v_d)) {
                _q447 = true;
                break Q448;
              }
            }
          }
          _c451 = !(_q447);
        }
        freshBinding("tooFar", [sameSet(v_O, _g441), (((b.domain >> v_d) & 1) !== 0), sameSet(v_F, fresh(b, sp, v_d)), (sp.cells.includes(v_c)), _c451], ["O =", "d in", "F =", "c in", "where of c"]);
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
  const _a454 = sp.cells;
  for (let _i455 = 0; _i455 < _a454.length; _i455++) {
    const v_c = _a454[_i455];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("onlyNumber", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c460: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c460) {
      let _g456 = -1;
      let _n458 = 0;
      G457: {
        for (let _m459 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m459 !== 0; _m459 &= _m459 - 1) {
          const v_d = 31 - Math.clz32(_m459 & -_m459);
          if (++_n458 === 2) {
            _g456 = -1;
            break G457;
          }
          _g456 = v_d;
        }
      }
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _g456); changed = true; } else facts.push(PLACE, v_c, _g456); }
      _c460 = true;
    }
    if (!(_c460)) return -1;
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
  const _g371: number[] = [];
  G372: {
    const _a388 = sp.edges;
    for (let _i389 = 0; _i389 < _a388.length; _i389++) {
      const v_e = _a388[_i389];
      const _t390 = sp.edgeEnds[2 * v_e];
      let _c395: boolean = !((b.grid[_t390] !== 0));
      if (_c395) {
        let _q391 = false;
        Q392: {
          const _a393 = sp.adj4[_t390];
          for (let _i394 = 0; _i394 < _a393.length; _i394++) {
            const v_z = _a393[_i394];
            if (((b.grid[v_z] || -1) === v_d)) {
              _q391 = true;
              break Q392;
            }
          }
        }
        _c395 = !(_q391);
      }
      let _c402: boolean = _c395;
      if (_c402) {
        const _t396 = sp.edgeEnds[2 * v_e + 1];
        let _c401: boolean = !((b.grid[_t396] !== 0));
        if (_c401) {
          let _q397 = false;
          Q398: {
            const _a399 = sp.adj4[_t396];
            for (let _i400 = 0; _i400 < _a399.length; _i400++) {
              const v_z = _a399[_i400];
              if (((b.grid[v_z] || -1) === v_d)) {
                _q397 = true;
                break Q398;
              }
            }
          }
          _c401 = !(_q397);
        }
        _c402 = _c401;
      }
      if (!(_c402)) continue;
      _g371.push(v_e);
    }
  }
  const _made = _g371;
  _kept[v_d] = _made;
  return _made;
}
