// Compiled by `npm run describe` from src/games/filling/filling.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, cellsValued, edgeGroups, keptEdgeGroups, keptStore, popcount, rangeMask, reaches, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g322: number[] = [];
  const _domain = rangeMask(1, cl.largest);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q320 = true;
  Q321: {
    _g322.length = 0;
    G323: {
      const _a326 = sp.edges;
      for (let _i327 = 0; _i327 < _a326.length; _i327++) {
        const v_e = _a326[_i327];
        const _h328 = (g[sp.edgeEnds[2 * v_e]] || -1);
        const _h329 = (g[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!((_h328 === _h329))) continue;
        _g322.push(v_e);
      }
    }
    const v_O = _g322;
    const _eg332 = edgeGroups(sp, v_O);
    const _a330 = sp.cells;
    for (let _i331 = 0; _i331 < _a330.length; _i331++) {
      const v_c = _a330[_i331];
      const _h333 = _eg332.of(v_c).length;
      const _h334 = (g[v_c] || -1);
      if (!((_h333 === _h334))) {
        _q320 = false;
        break Q321;
      }
    }
  }
  if (!(_q320)) return false;
  for (let _k335 = 0; _k335 < cl.number.at.length; _k335++) {
    const _at336 = cl.number.at[_k335];
    const _v337 = cl.number.v[_k335];
    if (!(((g[_at336] || -1) === _v337))) return false;
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
  const _g30: number[] = [];
  const _g37: number[] = [];
  const _g56: number[] = [];
  const facts = mustGrowFacts;
  let fired = 0;
  let changed = false;
  _g30.length = 0;
  G31: {
    const _a34 = sp.edges;
    for (let _i35 = 0; _i35 < _a34.length; _i35++) {
      const v_e = _a34[_i35];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g30.push(v_e);
    }
  }
  const v_O = _g30;
  const _eg45 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  for (let _m36 = b.domain; _m36 !== 0; _m36 &= _m36 - 1) {
    const v_d = 31 - Math.clz32(_m36 & -_m36);
    _g37.length = 0;
    G38: {
      const _a41 = sp.edges;
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_e = _a41[_i42];
        if (!(((!((b.grid[sp.edgeEnds[2 * v_e]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === v_d)) && (!((b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0)) || ((b.grid[sp.edgeEnds[2 * v_e + 1]] || -1) === v_d))))) continue;
        _g37.push(v_e);
      }
    }
    const v_F = _g37;
    const _eg55 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a43 = cellsValued(b, sp.cells, v_d);
    for (let _i44 = 0; _i44 < _a43.length; _i44++) {
      const v_c = _a43[_i44];
      if (!(((b.grid[v_c] || -1) === v_d))) continue;
      L46: {
        const v_A = _eg45.of(v_c);
        const _h47 = v_A.length;
        let _c54: boolean = ((v_c === (v_A[0] ?? -1)) && (_h47 !== v_d));
        if (_c54) {
          let _q48 = false;
          Q49: {
            const _a50 = v_A;
            for (let _i51 = 0; _i51 < _a50.length; _i51++) {
              const v_a = _a50[_i51];
              const _a52 = sp.adj4[v_a];
              for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                const v_z = _a52[_i53];
                if (!(!(_eg45.of(v_z) === v_A))) continue;
                if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                  _q48 = true;
                  break Q49;
                }
              }
            }
          }
          _c54 = !(_q48);
        }
        if (!(_c54)) break L46;
        const v_R = _eg55.of(v_c);
        const _h62 = v_R.length;
        _g56.length = 0;
        G57: {
          const _a60 = v_R;
          for (let _i61 = 0; _i61 < _a60.length; _i61++) {
            const v_t = _a60[_i61];
            if (!((!((b.grid[v_t] !== 0)) && (reaches(sp, v_c, v_R, v_t) < v_d)))) continue;
            _g56.push(v_t);
          }
        }
        const v_Y = _g56;
        facts.length = 0;
        changed = false;
        let _c67: boolean = ((_h47 < v_d) && (_h62 >= v_d));
        if (_c67) {
          let _q63 = true;
          Q64: {
            const _a65 = v_Y;
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_t = _a65[_i66];
              if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, v_d); changed = true; } else facts.push(PLACE, v_t, v_d); }
              if (!(true)) {
                _q63 = false;
                break Q64;
              }
            }
          }
          _c67 = _q63;
        }
        if (!(_c67)) return -1;
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

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, fire: Fire<OnlyWayBinding> | null): number {
  const _g117: number[] = [];
  const _g135: number[] = [];
  const _g156: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  _g117.length = 0;
  G118: {
    const _a121 = sp.edges;
    for (let _i122 = 0; _i122 < _a121.length; _i122++) {
      const v_e = _a121[_i122];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g117.push(v_e);
    }
  }
  const v_O = _g117;
  const _eg125 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a123 = sp.cells;
  for (let _i124 = 0; _i124 < _a123.length; _i124++) {
    const v_c = _a123[_i124];
    if (!((b.grid[v_c] !== 0))) continue;
    L126: {
      const v_A = _eg125.of(v_c);
      const _h127 = v_A.length;
      let _c134: boolean = ((v_c === (v_A[0] ?? -1)) && (_h127 < (b.grid[v_c] || -1)));
      if (_c134) {
        let _q128 = false;
        Q129: {
          const _a130 = v_A;
          for (let _i131 = 0; _i131 < _a130.length; _i131++) {
            const v_a = _a130[_i131];
            const _a132 = sp.adj4[v_a];
            for (let _i133 = 0; _i133 < _a132.length; _i133++) {
              const v_z = _a132[_i133];
              if (!(!(_eg125.of(v_z) === v_A))) continue;
              if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                _q128 = true;
                break Q129;
              }
            }
          }
        }
        _c134 = !(_q128);
      }
      if (!(_c134)) break L126;
      const v_d = (b.grid[v_c] || -1);
      _g135.length = 0;
      G136: {
        const _a152 = v_A;
        for (let _i153 = 0; _i153 < _a152.length; _i153++) {
          const v_a = _a152[_i153];
          const _a154 = sp.adj4[v_a];
          for (let _i155 = 0; _i155 < _a154.length; _i155++) {
            const v_t = _a154[_i155];
            let _c166: boolean = !((b.grid[v_t] !== 0));
            if (_c166) {
              _g156.length = 0;
              G157: {
                const _a162 = sp.adj4[v_t];
                for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                  const v_z = _a162[_i163];
                  if (!(((b.grid[v_z] || -1) === v_d))) continue;
                  const _a164 = _eg125.of(v_z);
                  for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                    const v_a = _a164[_i165];
                    if (!_g156.includes(v_a)) _g156.push(v_a);
                  }
                }
              }
              _c166 = ((1 + _g156.length) <= v_d);
            }
            if (!(_c166)) continue;
            if (!_g135.includes(v_t)) _g135.push(v_t);
          }
        }
      }
      L167: {
        const v_T = _g135;
        const _h168 = v_T.length;
        if (!((_h168 <= 1))) break L167;
        facts.length = 0;
        changed = false;
        let _c170: boolean = (_h168 === 1);
        if (_c170) {
          const _t169 = (v_T[0] ?? -1);
          if (!(b.grid[_t169] !== 0)) { if (fire === null) { b.placeAt(_t169, v_d); changed = true; } else facts.push(PLACE, _t169, v_d); }
          _c170 = true;
        }
        if (!(_c170)) return -1;
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

/** Its dearest read grows with the board as n. */
export function tooBig(b: Marks, sp: GridSpace, fire: Fire<TooBigBinding> | null): number {
  const _g190: number[] = [];
  const _g203: number[] = [];
  const facts = tooBigFacts;
  let fired = 0;
  let changed = false;
  if (tooBigCands.length < sp.cells.length) tooBigCands = new Int32Array(sp.cells.length);
  const cands = tooBigCands;
  cands.fill(-1);
  _g190.length = 0;
  G191: {
    const _a194 = sp.edges;
    for (let _i195 = 0; _i195 < _a194.length; _i195++) {
      const v_e = _a194[_i195];
      const _h196 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h197 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h198 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h196 && (_h197 === _h198)))) continue;
      _g190.push(v_e);
    }
  }
  const v_O = _g190;
  const _eg212 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a199 = sp.cells;
  for (let _i200 = 0; _i200 < _a199.length; _i200++) {
    const v_c = _a199[_i200];
    const _h201 = (b.grid[v_c] !== 0);
    if (!(!(_h201))) continue;
    for (let _m202 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m202 !== 0; _m202 &= _m202 - 1) {
      const v_d = 31 - Math.clz32(_m202 & -_m202);
      _g203.length = 0;
      G204: {
        const _a209 = sp.adj4[v_c];
        for (let _i210 = 0; _i210 < _a209.length; _i210++) {
          const v_z = _a209[_i210];
          const _h211 = (b.grid[v_z] || -1);
          if (!((_h211 === v_d))) continue;
          const _a213 = _eg212.of(v_z);
          for (let _i214 = 0; _i214 < _a213.length; _i214++) {
            const v_a = _a213[_i214];
            if (!_g203.includes(v_a)) _g203.push(v_a);
          }
        }
      }
      if (!(((1 + _g203.length) > v_d))) continue;
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
  const _g225: number[] = [];
  const facts = noRoomFacts;
  let fired = 0;
  let changed = false;
  for (let _m224 = b.domain; _m224 !== 0; _m224 &= _m224 - 1) {
    const v_d = 31 - Math.clz32(_m224 & -_m224);
    _g225.length = 0;
    G226: {
      const _a229 = sp.edges;
      for (let _i230 = 0; _i230 < _a229.length; _i230++) {
        const v_e = _a229[_i230];
        const _h231 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
        const _h232 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
        const _h233 = (b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0);
        const _h234 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!(((!(_h231) || (_h232 === v_d)) && (!(_h233) || (_h234 === v_d))))) continue;
        _g225.push(v_e);
      }
    }
    const v_F = _g225;
    const _eg238 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a235 = sp.cells;
    for (let _i236 = 0; _i236 < _a235.length; _i236++) {
      const v_c = _a235[_i236];
      const _h237 = (b.grid[v_c] !== 0);
      const _h239 = _eg238.of(v_c).length;
      if (!(((!(_h237) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h239 < v_d)))) continue;
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
  const _g286: number[] = [];
  const facts = tooFarFacts;
  let fired = 0;
  let changed = false;
  _g286.length = 0;
  G287: {
    const _a290 = sp.edges;
    for (let _i291 = 0; _i291 < _a290.length; _i291++) {
      const v_e = _a290[_i291];
      const _h292 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h293 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h294 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h292 && (_h293 === _h294)))) continue;
      _g286.push(v_e);
    }
  }
  const v_O = _g286;
  const _eg306 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  for (let _m295 = b.domain; _m295 !== 0; _m295 &= _m295 - 1) {
    const v_d = 31 - Math.clz32(_m295 & -_m295);
    const v_F = fresh(b, sp, v_d);
    const _eg299 = edgeGroups(sp, v_F);
    const _a296 = sp.cells;
    for (let _i297 = 0; _i297 < _a296.length; _i297++) {
      const v_c = _a296[_i297];
      const _h298 = (b.grid[v_c] !== 0);
      const _h300 = _eg299.of(v_c).length;
      const _h308 = (v_c % sp.w);
      const _h309 = ((v_c / sp.w) | 0);
      let _c310: boolean = ((!(_h298) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h300 < v_d));
      if (_c310) {
        let _q301 = false;
        Q302: {
          const _a303 = cellsValued(b, sp.cells, v_d);
          for (let _i304 = 0; _i304 < _a303.length; _i304++) {
            const v_a = _a303[_i304];
            const _h305 = (b.grid[v_a] || -1);
            if (!((_h305 === v_d))) continue;
            const _h307 = _eg306.of(v_a).length;
            if ((((_h307 + Math.abs(((v_a % sp.w) - _h308))) + Math.abs((((v_a / sp.w) | 0) - _h309))) <= v_d)) {
              _q301 = true;
              break Q302;
            }
          }
        }
        _c310 = !(_q301);
      }
      if (!(_c310)) continue;
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
  const _a313 = sp.cells;
  for (let _i314 = 0; _i314 < _a313.length; _i314++) {
    const v_c = _a313[_i314];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1)))) continue;
    facts.length = 0;
    changed = false;
    let _c319: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c319) {
      let _g315 = -1;
      let _n317 = 0;
      G316: {
        for (let _m318 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m318 !== 0; _m318 &= _m318 - 1) {
          const v_d = 31 - Math.clz32(_m318 & -_m318);
          if (++_n317 === 2) {
            _g315 = -1;
            break G316;
          }
          _g315 = v_d;
        }
      }
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _g315); changed = true; } else facts.push(PLACE, v_c, _g315); }
      _c319 = true;
    }
    if (!(_c319)) return -1;
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
  const _g247: number[] = [];
  G248: {
    const _a264 = sp.edges;
    for (let _i265 = 0; _i265 < _a264.length; _i265++) {
      const v_e = _a264[_i265];
      const _t266 = sp.edgeEnds[2 * v_e];
      let _c271: boolean = !((b.grid[_t266] !== 0));
      if (_c271) {
        let _q267 = false;
        Q268: {
          const _a269 = sp.adj4[_t266];
          for (let _i270 = 0; _i270 < _a269.length; _i270++) {
            const v_z = _a269[_i270];
            if (((b.grid[v_z] || -1) === v_d)) {
              _q267 = true;
              break Q268;
            }
          }
        }
        _c271 = !(_q267);
      }
      let _c278: boolean = _c271;
      if (_c278) {
        const _t272 = sp.edgeEnds[2 * v_e + 1];
        let _c277: boolean = !((b.grid[_t272] !== 0));
        if (_c277) {
          let _q273 = false;
          Q274: {
            const _a275 = sp.adj4[_t272];
            for (let _i276 = 0; _i276 < _a275.length; _i276++) {
              const v_z = _a275[_i276];
              if (((b.grid[v_z] || -1) === v_d)) {
                _q273 = true;
                break Q274;
              }
            }
          }
          _c277 = !(_q273);
        }
        _c278 = _c277;
      }
      if (!(_c278)) continue;
      _g247.push(v_e);
    }
  }
  const _made = _g247;
  _kept[v_d] = _made;
  return _made;
}
