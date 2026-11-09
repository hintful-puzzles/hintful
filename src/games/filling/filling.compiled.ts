// Compiled by `npm run describe` from src/games/filling/filling.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, cellsValued, edgeGroups, keptEdgeGroups, keptStore, popcount, rangeMask, reaches, sameSet, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g372: number[] = [];
  const _domain = rangeMask(1, cl.largest);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q370 = true;
  Q371: {
    _g372.length = 0;
    G373: {
      const _a376 = sp.edges;
      for (let _i377 = 0; _i377 < _a376.length; _i377++) {
        const v_e = _a376[_i377];
        const _h378 = (g[sp.edgeEnds[2 * v_e]] || -1);
        const _h379 = (g[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!((_h378 === _h379))) continue;
        _g372.push(v_e);
      }
    }
    const v_O = _g372;
    const _eg382 = edgeGroups(sp, v_O);
    const _a380 = sp.cells;
    for (let _i381 = 0; _i381 < _a380.length; _i381++) {
      const v_c = _a380[_i381];
      const _h383 = _eg382.of(v_c).length;
      const _h384 = (g[v_c] || -1);
      if (!((_h383 === _h384))) {
        _q370 = false;
        break Q371;
      }
    }
  }
  if (!(_q370)) return false;
  for (let _k385 = 0; _k385 < cl.number.at.length; _k385++) {
    const _at386 = cl.number.at[_k385];
    const _v387 = cl.number.v[_k385];
    if (!(((g[_at386] || -1) === _v387))) return false;
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
  const _g70: number[] = [];
  const _g76: number[] = [];
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
  R1:
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
        const _h82 = v_R.length;
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
          _g70.length = 0;
          G71: {
            const _a74 = sp.edges;
            for (let _i75 = 0; _i75 < _a74.length; _i75++) {
              const v_e = _a74[_i75];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g70.push(v_e);
            }
          }
          if (!(sameSet(v_O, _g70))) { return fired; }
          _g76.length = 0;
          G77: {
            const _a80 = sp.edges;
            for (let _i81 = 0; _i81 < _a80.length; _i81++) {
              const v_e = _a80[_i81];
              if (!(((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === v_d)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === v_d))))) continue;
              _g76.push(v_e);
            }
          }
          if (!(sameSet(v_F, _g76))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c87: boolean = ((_h55 < v_d) && (_h82 >= v_d));
        if (_c87) {
          let _q83 = true;
          Q84: {
            const _a85 = v_Y;
            for (let _i86 = 0; _i86 < _a85.length; _i86++) {
              const v_t = _a85[_i86];
              if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, v_d); changed = true; } else facts.push(PLACE, v_t, v_d); }
              if (!(true)) {
                _q83 = false;
                break Q84;
              }
            }
          }
          _c87 = _q83;
        }
        if (!(_c87)) return -1;
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
const _st172 = stamps();
const _st183 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, fire: Fire<OnlyWayBinding> | null): number {
  const _g137: number[] = [];
  const _g155: number[] = [];
  const _g177: number[] = [];
  const _g193: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m45_0 = b.made[0];
  _g137.length = 0;
  G138: {
    const _a141 = sp.edges;
    for (let _i142 = 0; _i142 < _a141.length; _i142++) {
      const v_e = _a141[_i142];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g137.push(v_e);
    }
  }
  const v_O = _g137;
  const _m48_1 = b.made[1];
  const _eg145 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a143 = sp.cells;
  for (let _i144 = 0; _i144 < _a143.length; _i144++) {
    const v_c = _a143[_i144];
    if (!((b.grid[v_c] !== 0))) continue;
    L146: {
      const v_A = _eg145.of(v_c);
      const _h147 = v_A.length;
      let _c154: boolean = ((v_c === (v_A[0] ?? -1)) && (_h147 < (b.grid[v_c] || -1)));
      if (_c154) {
        let _q148 = false;
        Q149: {
          const _a150 = v_A;
          for (let _i151 = 0; _i151 < _a150.length; _i151++) {
            const v_a = _a150[_i151];
            const _a152 = sp.adj4[v_a];
            for (let _i153 = 0; _i153 < _a152.length; _i153++) {
              const v_z = _a152[_i153];
              if (!(!(_eg145.of(v_z) === v_A))) continue;
              if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                _q148 = true;
                break Q149;
              }
            }
          }
        }
        _c154 = !(_q148);
      }
      if (!(_c154)) break L146;
      const v_d = (b.grid[v_c] || -1);
      _g155.length = 0;
      _st172.pass++;
      G156: {
        const _a173 = v_A;
        for (let _i174 = 0; _i174 < _a173.length; _i174++) {
          const v_a = _a173[_i174];
          const _a175 = sp.adj4[v_a];
          for (let _i176 = 0; _i176 < _a175.length; _i176++) {
            const v_t = _a175[_i176];
            let _c189: boolean = !((b.grid[v_t] !== 0));
            if (_c189) {
              _g177.length = 0;
              _st183.pass++;
              G178: {
                const _a184 = sp.adj4[v_t];
                for (let _i185 = 0; _i185 < _a184.length; _i185++) {
                  const v_z = _a184[_i185];
                  if (!(((b.grid[v_z] || -1) === v_d))) continue;
                  const _a186 = _eg145.of(v_z);
                  for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                    const v_a = _a186[_i187];
                    const _t188 = v_a;
                    if (_g177.length < 16) { if (!_g177.includes(_t188)) _g177.push(_t188); } else addOnce(_g177, _st183, _t188);
                  }
                }
              }
              _c189 = ((1 + _g177.length) <= v_d);
            }
            if (!(_c189)) continue;
            const _t190 = v_t;
            if (_g155.length < 16) { if (!_g155.includes(_t190)) _g155.push(_t190); } else addOnce(_g155, _st172, _t190);
          }
        }
      }
      L191: {
        const v_T = _g155;
        const _h192 = v_T.length;
        if (!((_h192 <= 1))) break L191;
        if (b.made[0] !== _m45_0 || b.made[1] !== _m48_1) {
          _g193.length = 0;
          G194: {
            const _a197 = sp.edges;
            for (let _i198 = 0; _i198 < _a197.length; _i198++) {
              const v_e = _a197[_i198];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g193.push(v_e);
            }
          }
          if (!(sameSet(v_O, _g193))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _c200: boolean = (_h192 === 1);
        if (_c200) {
          const _t199 = (v_T[0] ?? -1);
          if (!(b.grid[_t199] !== 0)) { if (fire === null) { b.placeAt(_t199, v_d); changed = true; } else facts.push(PLACE, _t199, v_d); }
          _c200 = true;
        }
        if (!(_c200)) return -1;
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
const _st239 = stamps();

/** Its dearest read grows with the board as n. */
export function tooBig(b: Marks, sp: GridSpace, fire: Fire<TooBigBinding> | null): number {
  const _g220: number[] = [];
  const _g233: number[] = [];
  const _g247: number[] = [];
  const facts = tooBigFacts;
  let fired = 0;
  let changed = false;
  if (tooBigCands.length < sp.cells.length) tooBigCands = new Int32Array(sp.cells.length);
  const cands = tooBigCands;
  cands.fill(-1);
  const _m80_0 = b.made[0];
  _g220.length = 0;
  G221: {
    const _a224 = sp.edges;
    for (let _i225 = 0; _i225 < _a224.length; _i225++) {
      const v_e = _a224[_i225];
      const _h226 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h227 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h228 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h226 && (_h227 === _h228)))) continue;
      _g220.push(v_e);
    }
  }
  const v_O = _g220;
  const _m83_1 = b.made[1];
  const _eg243 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a229 = sp.cells;
  R1:
  for (let _i230 = 0; _i230 < _a229.length; _i230++) {
    const v_c = _a229[_i230];
    const _h231 = (b.grid[v_c] !== 0);
    if (!(!(_h231))) continue;
    R2:
    for (let _m232 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m232 !== 0; _m232 &= _m232 - 1) {
      const v_d = 31 - Math.clz32(_m232 & -_m232);
      _g233.length = 0;
      _st239.pass++;
      G234: {
        const _a240 = sp.adj4[v_c];
        for (let _i241 = 0; _i241 < _a240.length; _i241++) {
          const v_z = _a240[_i241];
          const _h242 = (b.grid[v_z] || -1);
          if (!((_h242 === v_d))) continue;
          const _a244 = _eg243.of(v_z);
          for (let _i245 = 0; _i245 < _a244.length; _i245++) {
            const v_a = _a244[_i245];
            const _t246 = v_a;
            if (_g233.length < 16) { if (!_g233.includes(_t246)) _g233.push(_t246); } else addOnce(_g233, _st239, _t246);
          }
        }
      }
      if (!(((1 + _g233.length) > v_d))) continue;
      if (b.made[0] !== _m80_0 || b.made[1] !== _m83_1) {
        _g247.length = 0;
        G248: {
          const _a251 = sp.edges;
          for (let _i252 = 0; _i252 < _a251.length; _i252++) {
            const v_e = _a251[_i252];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g247.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g247))) { return fired; }
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) { continue R2; }
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
  const _g263: number[] = [];
  const _g278: number[] = [];
  const facts = noRoomFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let _m262 = b.domain; _m262 !== 0; _m262 &= _m262 - 1) {
    const v_d = 31 - Math.clz32(_m262 & -_m262);
    const _m105_0 = b.made[0];
    _g263.length = 0;
    G264: {
      const _a267 = sp.edges;
      for (let _i268 = 0; _i268 < _a267.length; _i268++) {
        const v_e = _a267[_i268];
        const _h269 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
        const _h270 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
        const _h271 = (b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0);
        const _h272 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!(((!(_h269) || (_h270 === v_d)) && (!(_h271) || (_h272 === v_d))))) continue;
        _g263.push(v_e);
      }
    }
    const v_F = _g263;
    const _m108_1 = b.made[1];
    const _eg276 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a273 = sp.cells;
    for (let _i274 = 0; _i274 < _a273.length; _i274++) {
      const v_c = _a273[_i274];
      const _h275 = (b.grid[v_c] !== 0);
      const _h277 = _eg276.of(v_c).length;
      if (!(((!(_h275) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h277 < v_d)))) continue;
      if (b.made[0] !== _m105_0 || b.made[1] !== _m108_1) {
        _g278.length = 0;
        G279: {
          const _a282 = sp.edges;
          for (let _i283 = 0; _i283 < _a282.length; _i283++) {
            const v_e = _a282[_i283];
            if (!(((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === v_d)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === v_d))))) continue;
            _g278.push(v_e);
          }
        }
        if (!(sameSet(v_F, _g278))) { continue R1; }
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
  const _g330: number[] = [];
  const _g355: number[] = [];
  const facts = tooFarFacts;
  let fired = 0;
  let changed = false;
  const _m120_0 = b.made[0];
  _g330.length = 0;
  G331: {
    const _a334 = sp.edges;
    for (let _i335 = 0; _i335 < _a334.length; _i335++) {
      const v_e = _a334[_i335];
      const _h336 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h337 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h338 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h336 && (_h337 === _h338)))) continue;
      _g330.push(v_e);
    }
  }
  const v_O = _g330;
  const _m123_1 = b.made[1];
  const _eg350 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  R1:
  for (let _m339 = b.domain; _m339 !== 0; _m339 &= _m339 - 1) {
    const v_d = 31 - Math.clz32(_m339 & -_m339);
    const v_F = fresh(b, sp, v_d);
    const _eg343 = edgeGroups(sp, v_F);
    const _a340 = sp.cells;
    for (let _i341 = 0; _i341 < _a340.length; _i341++) {
      const v_c = _a340[_i341];
      const _h342 = (b.grid[v_c] !== 0);
      const _h344 = _eg343.of(v_c).length;
      const _h352 = (v_c % sp.w);
      const _h353 = ((v_c / sp.w) | 0);
      let _c354: boolean = ((!(_h342) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h344 < v_d));
      if (_c354) {
        let _q345 = false;
        Q346: {
          const _a347 = cellsValued(b, sp.cells, v_d);
          for (let _i348 = 0; _i348 < _a347.length; _i348++) {
            const v_a = _a347[_i348];
            const _h349 = (b.grid[v_a] || -1);
            if (!((_h349 === v_d))) continue;
            const _h351 = _eg350.of(v_a).length;
            if ((((_h351 + Math.abs(((v_a % sp.w) - _h352))) + Math.abs((((v_a / sp.w) | 0) - _h353))) <= v_d)) {
              _q345 = true;
              break Q346;
            }
          }
        }
        _c354 = !(_q345);
      }
      if (!(_c354)) continue;
      if (b.made[0] !== _m120_0 || b.made[1] !== _m123_1) {
        _g355.length = 0;
        G356: {
          const _a359 = sp.edges;
          for (let _i360 = 0; _i360 < _a359.length; _i360++) {
            const v_e = _a359[_i360];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g355.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g355))) { return fired; }
        if (!(sameSet(v_F, fresh(b, sp, v_d)))) { continue R1; }
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
  const _a363 = sp.cells;
  for (let _i364 = 0; _i364 < _a363.length; _i364++) {
    const v_c = _a363[_i364];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1)))) continue;
    facts.length = 0;
    changed = false;
    let _c369: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c369) {
      let _g365 = -1;
      let _n367 = 0;
      G366: {
        for (let _m368 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m368 !== 0; _m368 &= _m368 - 1) {
          const v_d = 31 - Math.clz32(_m368 & -_m368);
          if (++_n367 === 2) {
            _g365 = -1;
            break G366;
          }
          _g365 = v_d;
        }
      }
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _g365); changed = true; } else facts.push(PLACE, v_c, _g365); }
      _c369 = true;
    }
    if (!(_c369)) return -1;
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
  const _g291: number[] = [];
  G292: {
    const _a308 = sp.edges;
    for (let _i309 = 0; _i309 < _a308.length; _i309++) {
      const v_e = _a308[_i309];
      const _t310 = sp.edgeEnds[2 * v_e];
      let _c315: boolean = !((b.grid[_t310] !== 0));
      if (_c315) {
        let _q311 = false;
        Q312: {
          const _a313 = sp.adj4[_t310];
          for (let _i314 = 0; _i314 < _a313.length; _i314++) {
            const v_z = _a313[_i314];
            if (((b.grid[v_z] || -1) === v_d)) {
              _q311 = true;
              break Q312;
            }
          }
        }
        _c315 = !(_q311);
      }
      let _c322: boolean = _c315;
      if (_c322) {
        const _t316 = sp.edgeEnds[2 * v_e + 1];
        let _c321: boolean = !((b.grid[_t316] !== 0));
        if (_c321) {
          let _q317 = false;
          Q318: {
            const _a319 = sp.adj4[_t316];
            for (let _i320 = 0; _i320 < _a319.length; _i320++) {
              const v_z = _a319[_i320];
              if (((b.grid[v_z] || -1) === v_d)) {
                _q317 = true;
                break Q318;
              }
            }
          }
          _c321 = !(_q317);
        }
        _c322 = _c321;
      }
      if (!(_c322)) continue;
      _g291.push(v_e);
    }
  }
  const _made = _g291;
  _kept[v_d] = _made;
  return _made;
}
