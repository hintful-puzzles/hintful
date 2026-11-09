// Compiled by `npm run describe` from src/games/filling/filling.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, addOnce, cellsValued, edgeGroups, keptEdgeGroups, keptStore, popcount, rangeMask, reaches, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g336: number[] = [];
  const _domain = rangeMask(1, cl.largest);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q334 = true;
  Q335: {
    _g336.length = 0;
    G337: {
      const _a340 = sp.edges;
      for (let _i341 = 0; _i341 < _a340.length; _i341++) {
        const v_e = _a340[_i341];
        const _h342 = (g[sp.edgeEnds[2 * v_e]] || -1);
        const _h343 = (g[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!((_h342 === _h343))) continue;
        _g336.push(v_e);
      }
    }
    const v_O = _g336;
    const _eg346 = edgeGroups(sp, v_O);
    const _a344 = sp.cells;
    for (let _i345 = 0; _i345 < _a344.length; _i345++) {
      const v_c = _a344[_i345];
      const _h347 = _eg346.of(v_c).length;
      const _h348 = (g[v_c] || -1);
      if (!((_h347 === _h348))) {
        _q334 = false;
        break Q335;
      }
    }
  }
  if (!(_q334)) return false;
  for (let _k349 = 0; _k349 < cl.number.at.length; _k349++) {
    const _at350 = cl.number.at[_k349];
    const _v351 = cl.number.v[_k349];
    if (!(((g[_at350] || -1) === _v351))) return false;
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
        const _h70 = v_R.length;
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
        facts.length = 0;
        changed = false;
        let _c75: boolean = ((_h55 < v_d) && (_h70 >= v_d));
        if (_c75) {
          let _q71 = true;
          Q72: {
            const _a73 = v_Y;
            for (let _i74 = 0; _i74 < _a73.length; _i74++) {
              const v_t = _a73[_i74];
              if (!(b.grid[v_t] !== 0)) { if (fire === null) { b.placeAt(v_t, v_d); changed = true; } else facts.push(PLACE, v_t, v_d); }
              if (!(true)) {
                _q71 = false;
                break Q72;
              }
            }
          }
          _c75 = _q71;
        }
        if (!(_c75)) return -1;
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
const _st160 = stamps();
const _st171 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, fire: Fire<OnlyWayBinding> | null): number {
  const _g125: number[] = [];
  const _g143: number[] = [];
  const _g165: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  _g125.length = 0;
  G126: {
    const _a129 = sp.edges;
    for (let _i130 = 0; _i130 < _a129.length; _i130++) {
      const v_e = _a129[_i130];
      if (!(((b.grid[sp.edgeEnds[2 * v_e]] !== 0) && ((b.grid[sp.edgeEnds[2 * v_e]] || -1) === (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1))))) continue;
      _g125.push(v_e);
    }
  }
  const v_O = _g125;
  const _eg133 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a131 = sp.cells;
  for (let _i132 = 0; _i132 < _a131.length; _i132++) {
    const v_c = _a131[_i132];
    if (!((b.grid[v_c] !== 0))) continue;
    L134: {
      const v_A = _eg133.of(v_c);
      const _h135 = v_A.length;
      let _c142: boolean = ((v_c === (v_A[0] ?? -1)) && (_h135 < (b.grid[v_c] || -1)));
      if (_c142) {
        let _q136 = false;
        Q137: {
          const _a138 = v_A;
          for (let _i139 = 0; _i139 < _a138.length; _i139++) {
            const v_a = _a138[_i139];
            const _a140 = sp.adj4[v_a];
            for (let _i141 = 0; _i141 < _a140.length; _i141++) {
              const v_z = _a140[_i141];
              if (!(!(_eg133.of(v_z) === v_A))) continue;
              if (((b.grid[v_z] || -1) === (b.grid[v_a] || -1))) {
                _q136 = true;
                break Q137;
              }
            }
          }
        }
        _c142 = !(_q136);
      }
      if (!(_c142)) break L134;
      const v_d = (b.grid[v_c] || -1);
      _g143.length = 0;
      _st160.pass++;
      G144: {
        const _a161 = v_A;
        for (let _i162 = 0; _i162 < _a161.length; _i162++) {
          const v_a = _a161[_i162];
          const _a163 = sp.adj4[v_a];
          for (let _i164 = 0; _i164 < _a163.length; _i164++) {
            const v_t = _a163[_i164];
            let _c177: boolean = !((b.grid[v_t] !== 0));
            if (_c177) {
              _g165.length = 0;
              _st171.pass++;
              G166: {
                const _a172 = sp.adj4[v_t];
                for (let _i173 = 0; _i173 < _a172.length; _i173++) {
                  const v_z = _a172[_i173];
                  if (!(((b.grid[v_z] || -1) === v_d))) continue;
                  const _a174 = _eg133.of(v_z);
                  for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                    const v_a = _a174[_i175];
                    const _t176 = v_a;
                    if (_g165.length < 16) { if (!_g165.includes(_t176)) _g165.push(_t176); } else addOnce(_g165, _st171, _t176);
                  }
                }
              }
              _c177 = ((1 + _g165.length) <= v_d);
            }
            if (!(_c177)) continue;
            const _t178 = v_t;
            if (_g143.length < 16) { if (!_g143.includes(_t178)) _g143.push(_t178); } else addOnce(_g143, _st160, _t178);
          }
        }
      }
      L179: {
        const v_T = _g143;
        const _h180 = v_T.length;
        if (!((_h180 <= 1))) break L179;
        facts.length = 0;
        changed = false;
        let _c182: boolean = (_h180 === 1);
        if (_c182) {
          const _t181 = (v_T[0] ?? -1);
          if (!(b.grid[_t181] !== 0)) { if (fire === null) { b.placeAt(_t181, v_d); changed = true; } else facts.push(PLACE, _t181, v_d); }
          _c182 = true;
        }
        if (!(_c182)) return -1;
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
const _st221 = stamps();

/** Its dearest read grows with the board as n. */
export function tooBig(b: Marks, sp: GridSpace, fire: Fire<TooBigBinding> | null): number {
  const _g202: number[] = [];
  const _g215: number[] = [];
  const facts = tooBigFacts;
  let fired = 0;
  let changed = false;
  if (tooBigCands.length < sp.cells.length) tooBigCands = new Int32Array(sp.cells.length);
  const cands = tooBigCands;
  cands.fill(-1);
  _g202.length = 0;
  G203: {
    const _a206 = sp.edges;
    for (let _i207 = 0; _i207 < _a206.length; _i207++) {
      const v_e = _a206[_i207];
      const _h208 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h209 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h210 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h208 && (_h209 === _h210)))) continue;
      _g202.push(v_e);
    }
  }
  const v_O = _g202;
  const _eg225 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  const _a211 = sp.cells;
  for (let _i212 = 0; _i212 < _a211.length; _i212++) {
    const v_c = _a211[_i212];
    const _h213 = (b.grid[v_c] !== 0);
    if (!(!(_h213))) continue;
    for (let _m214 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m214 !== 0; _m214 &= _m214 - 1) {
      const v_d = 31 - Math.clz32(_m214 & -_m214);
      _g215.length = 0;
      _st221.pass++;
      G216: {
        const _a222 = sp.adj4[v_c];
        for (let _i223 = 0; _i223 < _a222.length; _i223++) {
          const v_z = _a222[_i223];
          const _h224 = (b.grid[v_z] || -1);
          if (!((_h224 === v_d))) continue;
          const _a226 = _eg225.of(v_z);
          for (let _i227 = 0; _i227 < _a226.length; _i227++) {
            const v_a = _a226[_i227];
            const _t228 = v_a;
            if (_g215.length < 16) { if (!_g215.includes(_t228)) _g215.push(_t228); } else addOnce(_g215, _st221, _t228);
          }
        }
      }
      if (!(((1 + _g215.length) > v_d))) continue;
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
  const _g239: number[] = [];
  const facts = noRoomFacts;
  let fired = 0;
  let changed = false;
  for (let _m238 = b.domain; _m238 !== 0; _m238 &= _m238 - 1) {
    const v_d = 31 - Math.clz32(_m238 & -_m238);
    _g239.length = 0;
    G240: {
      const _a243 = sp.edges;
      for (let _i244 = 0; _i244 < _a243.length; _i244++) {
        const v_e = _a243[_i244];
        const _h245 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
        const _h246 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
        const _h247 = (b.grid[sp.edgeEnds[2 * v_e + 1]] !== 0);
        const _h248 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
        if (!(((!(_h245) || (_h246 === v_d)) && (!(_h247) || (_h248 === v_d))))) continue;
        _g239.push(v_e);
      }
    }
    const v_F = _g239;
    const _eg252 = keptEdgeGroups(sp, b, null, edgeHolds1, v_d, false);
    const _a249 = sp.cells;
    for (let _i250 = 0; _i250 < _a249.length; _i250++) {
      const v_c = _a249[_i250];
      const _h251 = (b.grid[v_c] !== 0);
      const _h253 = _eg252.of(v_c).length;
      if (!(((!(_h251) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h253 < v_d)))) continue;
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
  const _g300: number[] = [];
  const facts = tooFarFacts;
  let fired = 0;
  let changed = false;
  _g300.length = 0;
  G301: {
    const _a304 = sp.edges;
    for (let _i305 = 0; _i305 < _a304.length; _i305++) {
      const v_e = _a304[_i305];
      const _h306 = (b.grid[sp.edgeEnds[2 * v_e]] !== 0);
      const _h307 = (b.grid[sp.edgeEnds[2 * v_e]] || -1);
      const _h308 = (b.grid[sp.edgeEnds[2 * v_e + 1]] || -1);
      if (!((_h306 && (_h307 === _h308)))) continue;
      _g300.push(v_e);
    }
  }
  const v_O = _g300;
  const _eg320 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, false);
  for (let _m309 = b.domain; _m309 !== 0; _m309 &= _m309 - 1) {
    const v_d = 31 - Math.clz32(_m309 & -_m309);
    const v_F = fresh(b, sp, v_d);
    const _eg313 = edgeGroups(sp, v_F);
    const _a310 = sp.cells;
    for (let _i311 = 0; _i311 < _a310.length; _i311++) {
      const v_c = _a310[_i311];
      const _h312 = (b.grid[v_c] !== 0);
      const _h314 = _eg313.of(v_c).length;
      const _h322 = (v_c % sp.w);
      const _h323 = ((v_c / sp.w) | 0);
      let _c324: boolean = ((!(_h312) && (((b.cands[v_c] >> v_d) & 1) !== 0)) && (_h314 < v_d));
      if (_c324) {
        let _q315 = false;
        Q316: {
          const _a317 = cellsValued(b, sp.cells, v_d);
          for (let _i318 = 0; _i318 < _a317.length; _i318++) {
            const v_a = _a317[_i318];
            const _h319 = (b.grid[v_a] || -1);
            if (!((_h319 === v_d))) continue;
            const _h321 = _eg320.of(v_a).length;
            if ((((_h321 + Math.abs(((v_a % sp.w) - _h322))) + Math.abs((((v_a / sp.w) | 0) - _h323))) <= v_d)) {
              _q315 = true;
              break Q316;
            }
          }
        }
        _c324 = !(_q315);
      }
      if (!(_c324)) continue;
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
  const _a327 = sp.cells;
  for (let _i328 = 0; _i328 < _a327.length; _i328++) {
    const v_c = _a327[_i328];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) <= 1)))) continue;
    facts.length = 0;
    changed = false;
    let _c333: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c333) {
      let _g329 = -1;
      let _n331 = 0;
      G330: {
        for (let _m332 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m332 !== 0; _m332 &= _m332 - 1) {
          const v_d = 31 - Math.clz32(_m332 & -_m332);
          if (++_n331 === 2) {
            _g329 = -1;
            break G330;
          }
          _g329 = v_d;
        }
      }
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _g329); changed = true; } else facts.push(PLACE, v_c, _g329); }
      _c333 = true;
    }
    if (!(_c333)) return -1;
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
  const _g261: number[] = [];
  G262: {
    const _a278 = sp.edges;
    for (let _i279 = 0; _i279 < _a278.length; _i279++) {
      const v_e = _a278[_i279];
      const _t280 = sp.edgeEnds[2 * v_e];
      let _c285: boolean = !((b.grid[_t280] !== 0));
      if (_c285) {
        let _q281 = false;
        Q282: {
          const _a283 = sp.adj4[_t280];
          for (let _i284 = 0; _i284 < _a283.length; _i284++) {
            const v_z = _a283[_i284];
            if (((b.grid[v_z] || -1) === v_d)) {
              _q281 = true;
              break Q282;
            }
          }
        }
        _c285 = !(_q281);
      }
      let _c292: boolean = _c285;
      if (_c292) {
        const _t286 = sp.edgeEnds[2 * v_e + 1];
        let _c291: boolean = !((b.grid[_t286] !== 0));
        if (_c291) {
          let _q287 = false;
          Q288: {
            const _a289 = sp.adj4[_t286];
            for (let _i290 = 0; _i290 < _a289.length; _i290++) {
              const v_z = _a289[_i290];
              if (((b.grid[v_z] || -1) === v_d)) {
                _q287 = true;
                break Q288;
              }
            }
          }
          _c291 = !(_q287);
        }
        _c292 = _c291;
      }
      if (!(_c292)) continue;
      _g261.push(v_e);
    }
  }
  const _made = _g261;
  _kept[v_d] = _made;
  return _made;
}
