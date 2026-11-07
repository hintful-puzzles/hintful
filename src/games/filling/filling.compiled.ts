// Compiled by `npm run describe` from src/games/filling/filling.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, edgeGroups, popcount, rangeMask, reaches, through } from "../../engine/describe-runtime.ts";

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
  const _g358: number[] = [];
  const _domain = rangeMask(1, cl.largest);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q356 = true;
  Q357: {
    _g358.length = 0;
    G359: {
      const _a362 = sp.edges;
      for (let _i363 = 0; _i363 < _a362.length; _i363++) {
        const v_e = _a362[_i363];
        if (!(((g[sp.edgeEnds[2 * v_e]] || -1) === (g[sp.edgeEnds[2 * v_e + 1]] || -1)))) continue;
        _g358.push(v_e);
      }
    }
    const v_O = _g358;
    const _a364 = sp.cells;
    for (let _i365 = 0; _i365 < _a364.length; _i365++) {
      const v_c = _a364[_i365];
      if (!((through(sp, v_c, v_O).length === (g[v_c] || -1)))) {
        _q356 = false;
        break Q357;
      }
    }
  }
  if (!(_q356)) return false;
  for (let _k366 = 0; _k366 < cl.number.at.length; _k366++) {
    const _at367 = cl.number.at[_k366];
    const _v368 = cl.number.v[_k366];
    if (!(((g[_at367] || -1) === _v368))) return false;
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
      if (!((b.known(sp.edgeEnds[2 * v_e]) && (b.value(sp.edgeEnds[2 * v_e]) === b.value(sp.edgeEnds[2 * v_e + 1]))))) continue;
      _g30.push(v_e);
    }
  }
  const v_O = _g30;
  const _eg45 = edgeGroups(sp, v_O);
  for (let _m36 = b.domain; _m36 !== 0; _m36 &= _m36 - 1) {
    const v_d = 31 - Math.clz32(_m36 & -_m36);
    _g37.length = 0;
    G38: {
      const _a41 = sp.edges;
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_e = _a41[_i42];
        if (!(((!(b.known(sp.edgeEnds[2 * v_e])) || (b.value(sp.edgeEnds[2 * v_e]) === v_d)) && (!(b.known(sp.edgeEnds[2 * v_e + 1])) || (b.value(sp.edgeEnds[2 * v_e + 1]) === v_d))))) continue;
        _g37.push(v_e);
      }
    }
    const v_F = _g37;
    const _eg55 = edgeGroups(sp, v_F);
    const _a43 = sp.cells;
    for (let _i44 = 0; _i44 < _a43.length; _i44++) {
      const v_c = _a43[_i44];
      if (!((b.value(v_c) === v_d))) continue;
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
                if ((b.value(v_z) === b.value(v_a))) {
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
            if (!((!(b.known(v_t)) && (reaches(sp, v_c, v_R, v_t) < v_d)))) continue;
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
              if (!b.known(v_t)) { if (fire === null) { b.placeAt(v_t, v_d); changed = true; } else facts.push(PLACE, v_t, v_d); }
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
          if (fire !== null && !fire({ O: v_O, d: v_d, F: v_F, c: v_c, A: v_A, R: v_R, Y: v_Y }, facts)) return 1;
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
      if (!((b.known(sp.edgeEnds[2 * v_e]) && (b.value(sp.edgeEnds[2 * v_e]) === b.value(sp.edgeEnds[2 * v_e + 1]))))) continue;
      _g117.push(v_e);
    }
  }
  const v_O = _g117;
  const _eg125 = edgeGroups(sp, v_O);
  const _a123 = sp.cells;
  for (let _i124 = 0; _i124 < _a123.length; _i124++) {
    const v_c = _a123[_i124];
    if (!(b.known(v_c))) continue;
    L126: {
      const v_A = _eg125.of(v_c);
      const _h127 = v_A.length;
      let _c134: boolean = ((v_c === (v_A[0] ?? -1)) && (_h127 < b.value(v_c)));
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
              if ((b.value(v_z) === b.value(v_a))) {
                _q128 = true;
                break Q129;
              }
            }
          }
        }
        _c134 = !(_q128);
      }
      if (!(_c134)) break L126;
      const v_d = b.value(v_c);
      _g135.length = 0;
      G136: {
        const _a152 = v_A;
        for (let _i153 = 0; _i153 < _a152.length; _i153++) {
          const v_a = _a152[_i153];
          const _a154 = sp.adj4[v_a];
          for (let _i155 = 0; _i155 < _a154.length; _i155++) {
            const v_t = _a154[_i155];
            let _c166: boolean = !(b.known(v_t));
            if (_c166) {
              _g156.length = 0;
              G157: {
                const _a162 = sp.adj4[v_t];
                for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                  const v_z = _a162[_i163];
                  if (!((b.value(v_z) === v_d))) continue;
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
          if (!b.known(_t169)) { if (fire === null) { b.placeAt(_t169, v_d); changed = true; } else facts.push(PLACE, _t169, v_d); }
          _c170 = true;
        }
        if (!(_c170)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ O: v_O, c: v_c, A: v_A, d: v_d, T: v_T }, facts)) return 1;
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
      const _h196 = b.known(sp.edgeEnds[2 * v_e]);
      const _h197 = b.value(sp.edgeEnds[2 * v_e]);
      const _h198 = b.value(sp.edgeEnds[2 * v_e + 1]);
      if (!((_h196 && (_h197 === _h198)))) continue;
      _g190.push(v_e);
    }
  }
  const v_O = _g190;
  const _eg212 = edgeGroups(sp, v_O);
  const _a199 = sp.cells;
  for (let _i200 = 0; _i200 < _a199.length; _i200++) {
    const v_c = _a199[_i200];
    const _h201 = b.known(v_c);
    if (!(!(_h201))) continue;
    for (let _m202 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m202 !== 0; _m202 &= _m202 - 1) {
      const v_d = 31 - Math.clz32(_m202 & -_m202);
      _g203.length = 0;
      G204: {
        const _a209 = sp.adj4[v_c];
        for (let _i210 = 0; _i210 < _a209.length; _i210++) {
          const v_z = _a209[_i210];
          const _h211 = b.value(v_z);
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
      if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O, c: v_c, d: v_d }, facts)) return 1;
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
        const _h231 = b.known(sp.edgeEnds[2 * v_e]);
        const _h232 = b.value(sp.edgeEnds[2 * v_e]);
        const _h233 = b.known(sp.edgeEnds[2 * v_e + 1]);
        const _h234 = b.value(sp.edgeEnds[2 * v_e + 1]);
        if (!(((!(_h231) || (_h232 === v_d)) && (!(_h233) || (_h234 === v_d))))) continue;
        _g225.push(v_e);
      }
    }
    const v_F = _g225;
    const _eg238 = edgeGroups(sp, v_F);
    const _a235 = sp.cells;
    for (let _i236 = 0; _i236 < _a235.length; _i236++) {
      const v_c = _a235[_i236];
      const _h237 = b.known(v_c);
      const _h239 = _eg238.of(v_c).length;
      if (!(((!(_h237) && b.has(v_c, v_d)) && (_h239 < v_d)))) continue;
      facts.length = 0;
      changed = false;
      if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ d: v_d, F: v_F, c: v_c }, facts)) return 1;
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

export function tooFar(b: Marks, sp: GridSpace, fire: Fire<TooFarBinding> | null): number {
  const _g286: number[] = [];
  const _g296: number[] = [];
  const facts = tooFarFacts;
  let fired = 0;
  let changed = false;
  _g286.length = 0;
  G287: {
    const _a290 = sp.edges;
    for (let _i291 = 0; _i291 < _a290.length; _i291++) {
      const v_e = _a290[_i291];
      const _h292 = b.known(sp.edgeEnds[2 * v_e]);
      const _h293 = b.value(sp.edgeEnds[2 * v_e]);
      const _h294 = b.value(sp.edgeEnds[2 * v_e + 1]);
      if (!((_h292 && (_h293 === _h294)))) continue;
      _g286.push(v_e);
    }
  }
  const v_O = _g286;
  const _eg342 = edgeGroups(sp, v_O);
  for (let _m295 = b.domain; _m295 !== 0; _m295 &= _m295 - 1) {
    const v_d = 31 - Math.clz32(_m295 & -_m295);
    _g296.length = 0;
    G297: {
      const _a313 = sp.edges;
      for (let _i314 = 0; _i314 < _a313.length; _i314++) {
        const v_e = _a313[_i314];
        const _t315 = sp.edgeEnds[2 * v_e];
        const _h316 = b.known(_t315);
        let _c322: boolean = !(_h316);
        if (_c322) {
          let _q317 = false;
          Q318: {
            const _a319 = sp.adj4[_t315];
            for (let _i320 = 0; _i320 < _a319.length; _i320++) {
              const v_z = _a319[_i320];
              const _h321 = b.value(v_z);
              if ((_h321 === v_d)) {
                _q317 = true;
                break Q318;
              }
            }
          }
          _c322 = !(_q317);
        }
        let _c331: boolean = _c322;
        if (_c331) {
          const _t323 = sp.edgeEnds[2 * v_e + 1];
          const _h324 = b.known(_t323);
          let _c330: boolean = !(_h324);
          if (_c330) {
            let _q325 = false;
            Q326: {
              const _a327 = sp.adj4[_t323];
              for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                const v_z = _a327[_i328];
                const _h329 = b.value(v_z);
                if ((_h329 === v_d)) {
                  _q325 = true;
                  break Q326;
                }
              }
            }
            _c330 = !(_q325);
          }
          _c331 = _c330;
        }
        if (!(_c331)) continue;
        _g296.push(v_e);
      }
    }
    const v_F = _g296;
    const _eg335 = edgeGroups(sp, v_F);
    const _a332 = sp.cells;
    for (let _i333 = 0; _i333 < _a332.length; _i333++) {
      const v_c = _a332[_i333];
      const _h334 = b.known(v_c);
      const _h336 = _eg335.of(v_c).length;
      const _h344 = (v_c % sp.w);
      const _h345 = ((v_c / sp.w) | 0);
      let _c346: boolean = ((!(_h334) && b.has(v_c, v_d)) && (_h336 < v_d));
      if (_c346) {
        let _q337 = false;
        Q338: {
          const _a339 = sp.cells;
          for (let _i340 = 0; _i340 < _a339.length; _i340++) {
            const v_a = _a339[_i340];
            const _h341 = b.value(v_a);
            if (!((_h341 === v_d))) continue;
            const _h343 = _eg342.of(v_a).length;
            if ((((_h343 + Math.abs(((v_a % sp.w) - _h344))) + Math.abs((((v_a / sp.w) | 0) - _h345))) <= v_d)) {
              _q337 = true;
              break Q338;
            }
          }
        }
        _c346 = !(_q337);
      }
      if (!(_c346)) continue;
      facts.length = 0;
      changed = false;
      if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O, d: v_d, F: v_F, c: v_c }, facts)) return 1;
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

export function onlyNumber(b: Marks, sp: GridSpace, fire: Fire<OnlyNumberBinding> | null): number {
  const facts = onlyNumberFacts;
  let fired = 0;
  let changed = false;
  if (onlyNumberCands.length < sp.cells.length) onlyNumberCands = new Int32Array(sp.cells.length);
  const cands = onlyNumberCands;
  cands.fill(-1);
  const _a349 = sp.cells;
  for (let _i350 = 0; _i350 < _a349.length; _i350++) {
    const v_c = _a349[_i350];
    if (!((!(b.known(v_c)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) <= 1)))) continue;
    facts.length = 0;
    changed = false;
    let _c355: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) === 1);
    if (_c355) {
      let _g351 = -1;
      let _n353 = 0;
      G352: {
        for (let _m354 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m354 !== 0; _m354 &= _m354 - 1) {
          const v_d = 31 - Math.clz32(_m354 & -_m354);
          if (++_n353 === 2) {
            _g351 = -1;
            break G352;
          }
          _g351 = v_d;
        }
      }
      if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _g351); changed = true; } else facts.push(PLACE, v_c, _g351); }
      _c355 = true;
    }
    if (!(_c355)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
