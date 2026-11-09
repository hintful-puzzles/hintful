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
  const _g357: number[] = [];
  const _domain = rangeMask(1, cl.largest);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q355 = true;
  Q356: {
    _g357.length = 0;
    G358: {
      const _a361 = sp.edges;
      for (let _i362 = 0; _i362 < _a361.length; _i362++) {
        const v_e = _a361[_i362];
        const _h363 = (g[sp.edgeEnds[2 * v_e]] || -1);
        const _h364 = (g[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!((_h363 === _h364))) continue;
        _g357.push(v_e);
      }
    }
    const v_O = _g357;
    const _eg367 = edgeGroups(sp, v_O);
    const _a365 = sp.cells;
    for (let _i366 = 0; _i366 < _a365.length; _i366++) {
      const v_c = _a365[_i366];
      const _h368 = _eg367.of(v_c).length;
      const _h369 = (g[v_c] || -1);
      if (!((_h368 === _h369))) {
        _q355 = false;
        break Q356;
      }
    }
  }
  if (!(_q355)) return false;
  for (let _k370 = 0; _k370 < cl.number.at.length; _k370++) {
    const _at371 = cl.number.at[_k370];
    const _v372 = cl.number.v[_k370];
    if (!(((g[_at371] || -1) === _v372))) return false;
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
        const _h72 = v_R.length;
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
        facts.length = 0;
        changed = false;
        let _c77: boolean = ((_h55 < v_d) && (_h72 >= v_d));
        if (_c77) {
          let _q73 = true;
          Q74: {
            const _a75 = v_Y;
            for (let _i76 = 0; _i76 < _a75.length; _i76++) {
              const v_t = _a75[_i76];
              if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, v_d); changed = true; } else facts.push(PLACE, v_t, v_d); }
              if (!(true)) {
                _q73 = false;
                break Q74;
              }
            }
          }
          _c77 = _q73;
        }
        if (!(_c77)) return -1;
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
const _st162 = stamps();
const _st173 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, fire: Fire<OnlyWayBinding> | null): number {
  const _g127: number[] = [];
  const _g145: number[] = [];
  const _g167: number[] = [];
  const _g183: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m45_0 = b.made[0];
  _g127.length = 0;
  G128: {
    const _a131 = sp.edges;
    for (let _i132 = 0; _i132 < _a131.length; _i132++) {
      const v_e = _a131[_i132];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g127.push(v_e);
    }
  }
  const v_O = _g127;
  const _m48_1 = b.made[1];
  const _eg135 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a133 = sp.cells;
  for (let _i134 = 0; _i134 < _a133.length; _i134++) {
    const v_c = _a133[_i134];
    if (!((b.grid[v_c] !== 0))) continue;
    L136: {
      const v_A = _eg135.of(v_c);
      const _h137 = v_A.length;
      let _c144: boolean = ((v_c === (v_A[0] ?? -1)) && (_h137 < (b.grid[v_c] || -1)));
      if (_c144) {
        let _q138 = false;
        Q139: {
          const _a140 = v_A;
          for (let _i141 = 0; _i141 < _a140.length; _i141++) {
            const v_a = _a140[_i141];
            const _a142 = sp.adj4[v_a];
            for (let _i143 = 0; _i143 < _a142.length; _i143++) {
              const v_z = _a142[_i143];
              if (!(!(_eg135.of(v_z) === v_A))) continue;
              if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                _q138 = true;
                break Q139;
              }
            }
          }
        }
        _c144 = !(_q138);
      }
      if (!(_c144)) break L136;
      const v_d = (b.grid[v_c] || -1);
      _g145.length = 0;
      _st162.pass++;
      G146: {
        const _a163 = v_A;
        for (let _i164 = 0; _i164 < _a163.length; _i164++) {
          const v_a = _a163[_i164];
          const _a165 = sp.adj4[v_a];
          for (let _i166 = 0; _i166 < _a165.length; _i166++) {
            const v_t = _a165[_i166];
            let _c179: boolean = !((b.grid[v_t] !== 0));
            if (_c179) {
              _g167.length = 0;
              _st173.pass++;
              G168: {
                const _a174 = sp.adj4[v_t];
                for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                  const v_z = _a174[_i175];
                  if (!(((b.grid[v_z] || -1) === v_d))) continue;
                  const _a176 = _eg135.of(v_z);
                  for (let _i177 = 0; _i177 < _a176.length; _i177++) {
                    const v_a = _a176[_i177];
                    const _t178 = v_a;
                    if (_g167.length < 16) { if (!_g167.includes(_t178)) _g167.push(_t178); } else addOnce(_g167, _st173, _t178);
                  }
                }
              }
              _c179 = ((1 + _g167.length) <= v_d);
            }
            if (!(_c179)) continue;
            const _t180 = v_t;
            if (_g145.length < 16) { if (!_g145.includes(_t180)) _g145.push(_t180); } else addOnce(_g145, _st162, _t180);
          }
        }
      }
      L181: {
        const v_T = _g145;
        const _h182 = v_T.length;
        if (!((_h182 <= 1))) break L181;
        if (b.made[0] !== _m45_0 || b.made[1] !== _m48_1) {
          _g183.length = 0;
          G184: {
            const _a187 = sp.edges;
            for (let _i188 = 0; _i188 < _a187.length; _i188++) {
              const v_e = _a187[_i188];
              if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
              _g183.push(v_e);
            }
          }
          if (!(sameSet(v_O, _g183))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _c190: boolean = (_h182 === 1);
        if (_c190) {
          const _t189 = (v_T[0] ?? -1);
          if (!(b.grid[_t189] !== 0)) { if (fire === null) { b.placeAt(_t189, v_d); changed = true; } else facts.push(PLACE, _t189, v_d); }
          _c190 = true;
        }
        if (!(_c190)) return -1;
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
const _st229 = stamps();

/** Its dearest read grows with the board as n. */
export function tooBig(b: Marks, sp: GridSpace, fire: Fire<TooBigBinding> | null): number {
  const _g210: number[] = [];
  const _g223: number[] = [];
  const _g237: number[] = [];
  const facts = tooBigFacts;
  let fired = 0;
  let changed = false;
  if (tooBigCands.length < sp.cells.length) tooBigCands = new Int32Array(sp.cells.length);
  const cands = tooBigCands;
  cands.fill(-1);
  const _m80_0 = b.made[0];
  _g210.length = 0;
  G211: {
    const _a214 = sp.edges;
    for (let _i215 = 0; _i215 < _a214.length; _i215++) {
      const v_e = _a214[_i215];
      const _h216 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h217 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h218 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h216 && (_h217 === _h218)))) continue;
      _g210.push(v_e);
    }
  }
  const v_O = _g210;
  const _m83_1 = b.made[1];
  const _eg233 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a219 = sp.cells;
  R1:
  for (let _i220 = 0; _i220 < _a219.length; _i220++) {
    const v_c = _a219[_i220];
    const _h221 = (b.grid[v_c] !== 0);
    if (!(!(_h221))) continue;
    R2:
    for (let _m222 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m222 !== 0; _m222 &= _m222 - 1) {
      const v_d = 31 - Math.clz32(_m222 & -_m222);
      _g223.length = 0;
      _st229.pass++;
      G224: {
        const _a230 = sp.adj4[v_c];
        for (let _i231 = 0; _i231 < _a230.length; _i231++) {
          const v_z = _a230[_i231];
          const _h232 = (b.grid[v_z] || -1);
          if (!((_h232 === v_d))) continue;
          const _a234 = _eg233.of(v_z);
          for (let _i235 = 0; _i235 < _a234.length; _i235++) {
            const v_a = _a234[_i235];
            const _t236 = v_a;
            if (_g223.length < 16) { if (!_g223.includes(_t236)) _g223.push(_t236); } else addOnce(_g223, _st229, _t236);
          }
        }
      }
      if (!(((1 + _g223.length) > v_d))) continue;
      if (b.made[0] !== _m80_0 || b.made[1] !== _m83_1) {
        _g237.length = 0;
        G238: {
          const _a241 = sp.edges;
          for (let _i242 = 0; _i242 < _a241.length; _i242++) {
            const v_e = _a241[_i242];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g237.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g237))) { return fired; }
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
  const _g253: number[] = [];
  const facts = noRoomFacts;
  let fired = 0;
  let changed = false;
  for (let _m252 = b.domain; _m252 !== 0; _m252 &= _m252 - 1) {
    const v_d = 31 - Math.clz32(_m252 & -_m252);
    const _m105_0 = b.made[0];
    _g253.length = 0;
    G254: {
      const _a257 = sp.edges;
      for (let _i258 = 0; _i258 < _a257.length; _i258++) {
        const v_e = _a257[_i258];
        const _h259 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
        const _h260 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
        const _h261 = (b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0);
        const _h262 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!(((!(_h259) || (_h260 === v_d)) && (!(_h261) || (_h262 === v_d))))) continue;
        _g253.push(v_e);
      }
    }
    const v_F = _g253;
    const _m108_1 = b.made[1];
    const _eg266 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a263 = sp.cells;
    R2:
    for (let _i264 = 0; _i264 < _a263.length; _i264++) {
      const v_c = _a263[_i264];
      const _h265 = (b.grid[v_c] !== 0);
      const _h267 = _eg266.of(v_c).length;
      if (!(((!(_h265) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h267 < v_d)))) continue;
      if (b.made[0] !== _m105_0 || b.made[1] !== _m108_1) {
        const _now268 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false).of(v_c);
        if (!(_now268 === _eg266.of(v_c) || sameSet(_now268, _eg266.of(v_c)))) { continue R2; }
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
  const _g315: number[] = [];
  const _g340: number[] = [];
  const facts = tooFarFacts;
  let fired = 0;
  let changed = false;
  const _m120_0 = b.made[0];
  _g315.length = 0;
  G316: {
    const _a319 = sp.edges;
    for (let _i320 = 0; _i320 < _a319.length; _i320++) {
      const v_e = _a319[_i320];
      const _h321 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h322 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h323 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h321 && (_h322 === _h323)))) continue;
      _g315.push(v_e);
    }
  }
  const v_O = _g315;
  const _m123_1 = b.made[1];
  const _eg335 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  R1:
  for (let _m324 = b.domain; _m324 !== 0; _m324 &= _m324 - 1) {
    const v_d = 31 - Math.clz32(_m324 & -_m324);
    const v_F = fresh(b, sp, v_d);
    const _eg328 = edgeGroups(sp, v_F);
    const _a325 = sp.cells;
    for (let _i326 = 0; _i326 < _a325.length; _i326++) {
      const v_c = _a325[_i326];
      const _h327 = (b.grid[v_c] !== 0);
      const _h329 = _eg328.of(v_c).length;
      const _h337 = (v_c % sp.w);
      const _h338 = ((v_c / sp.w) | 0);
      let _c339: boolean = ((!(_h327) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h329 < v_d));
      if (_c339) {
        let _q330 = false;
        Q331: {
          const _a332 = cellsValued(b, sp.cells, v_d);
          for (let _i333 = 0; _i333 < _a332.length; _i333++) {
            const v_a = _a332[_i333];
            const _h334 = (b.grid[v_a] || -1);
            if (!((_h334 === v_d))) continue;
            const _h336 = _eg335.of(v_a).length;
            if ((((_h336 + Math.abs(((v_a % sp.w) - _h337))) + Math.abs((((v_a / sp.w) | 0) - _h338))) <= v_d)) {
              _q330 = true;
              break Q331;
            }
          }
        }
        _c339 = !(_q330);
      }
      if (!(_c339)) continue;
      if (b.made[0] !== _m120_0 || b.made[1] !== _m123_1) {
        _g340.length = 0;
        G341: {
          const _a344 = sp.edges;
          for (let _i345 = 0; _i345 < _a344.length; _i345++) {
            const v_e = _a344[_i345];
            if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
            _g340.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g340))) { return fired; }
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
  const _a348 = sp.cells;
  for (let _i349 = 0; _i349 < _a348.length; _i349++) {
    const v_c = _a348[_i349];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1)))) continue;
    facts.length = 0;
    changed = false;
    let _c354: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c354) {
      let _g350 = -1;
      let _n352 = 0;
      G351: {
        for (let _m353 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m353 !== 0; _m353 &= _m353 - 1) {
          const v_d = 31 - Math.clz32(_m353 & -_m353);
          if (++_n352 === 2) {
            _g350 = -1;
            break G351;
          }
          _g350 = v_d;
        }
      }
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _g350); changed = true; } else facts.push(PLACE, v_c, _g350); }
      _c354 = true;
    }
    if (!(_c354)) return -1;
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
  const _g276: number[] = [];
  G277: {
    const _a293 = sp.edges;
    for (let _i294 = 0; _i294 < _a293.length; _i294++) {
      const v_e = _a293[_i294];
      const _t295 = sp.edgeEnds[2 * v_e];
      let _c300: boolean = !((b.grid[_t295] !== 0));
      if (_c300) {
        let _q296 = false;
        Q297: {
          const _a298 = sp.adj4[_t295];
          for (let _i299 = 0; _i299 < _a298.length; _i299++) {
            const v_z = _a298[_i299];
            if (((b.grid[v_z] || -1) === v_d)) {
              _q296 = true;
              break Q297;
            }
          }
        }
        _c300 = !(_q296);
      }
      let _c307: boolean = _c300;
      if (_c307) {
        const _t301 = sp.edgeEnds[2 * v_e + 1];
        let _c306: boolean = !((b.grid[_t301] !== 0));
        if (_c306) {
          let _q302 = false;
          Q303: {
            const _a304 = sp.adj4[_t301];
            for (let _i305 = 0; _i305 < _a304.length; _i305++) {
              const v_z = _a304[_i305];
              if (((b.grid[v_z] || -1) === v_d)) {
                _q302 = true;
                break Q303;
              }
            }
          }
          _c306 = !(_q302);
        }
        _c307 = _c306;
      }
      if (!(_c307)) continue;
      _g276.push(v_e);
    }
  }
  const _made = _g276;
  _kept[v_d] = _made;
  return _made;
}
