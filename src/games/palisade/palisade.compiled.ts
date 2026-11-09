// Compiled by `npm run describe` from src/games/palisade/palisade.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, keptStore, rangeMask, sameSet, stamps, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  k: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "cluesVersusRegionSize" | "numberExhausted" | "notTooBig" | "notTooSmall" | "noDanglingEdges" | "equivalentEdges" | "inside";

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
  { id: "cluesVersusRegionSize", tier: 0 },
  { id: "numberExhausted", tier: 0 },
  { id: "notTooBig", tier: 0 },
  { id: "notTooSmall", tier: 0 },
  { id: "noDanglingEdges", tier: 0 },
  { id: "equivalentEdges", tier: 0 },
  { id: "inside", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g295: number[] = [];
  const _g308: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q293 = true;
  Q294: {
    _g295.length = 0;
    G296: {
      const _a299 = sp.edges;
      for (let _i300 = 0; _i300 < _a299.length; _i300++) {
        const v_e = _a299[_i300];
        const _h301 = (g[v_e] || -1);
        if (!((_h301 === 2))) continue;
        _g295.push(v_e);
      }
    }
    const v_O = _g295;
    const _eg305 = edgeGroups(sp, v_O);
    const _a302 = sp.edges;
    for (let _i303 = 0; _i303 < _a302.length; _i303++) {
      const v_e = _a302[_i303];
      const _h304 = (g[v_e] || -1);
      if (!(((_h304 === 1) === !(_eg305.of(sp.edgeEnds[2 * v_e + 1]) === _eg305.of(sp.edgeEnds[2 * v_e]))))) {
        _q293 = false;
        break Q294;
      }
    }
  }
  if (!(_q293)) return false;
  let _q306 = true;
  Q307: {
    _g308.length = 0;
    G309: {
      const _a312 = sp.edges;
      for (let _i313 = 0; _i313 < _a312.length; _i313++) {
        const v_e = _a312[_i313];
        const _h314 = (g[v_e] || -1);
        if (!((_h314 === 2))) continue;
        _g308.push(v_e);
      }
    }
    const v_O = _g308;
    const _eg317 = edgeGroups(sp, v_O);
    const _a315 = sp.cells;
    for (let _i316 = 0; _i316 < _a315.length; _i316++) {
      const v_c = _a315[_i316];
      const _h318 = _eg317.of(v_c).length;
      if (!((_h318 === cl.k))) {
        _q306 = false;
        break Q307;
      }
    }
  }
  if (!(_q306)) return false;
  for (let _k319 = 0; _k319 < cl.number.at.length; _k319++) {
    const _at320 = cl.number.at[_k319];
    const _v321 = cl.number.v[_k319];
    let _g322 = 0;
    G323: {
      const _a324 = sp.adj4[_at320];
      for (let _i325 = 0; _i325 < _a324.length; _i325++) {
        const _h326 = (g[sp.adj4Edges[_at320][_i325]] || -1);
        if (!((_h326 === 1))) continue;
        _g322++;
      }
    }
    if (!((((4 - sp.adj4[_at320].length) + _g322) === _v321))) return false;
  }
  return true;
}

export interface CluesVersusRegionSizeBinding {
  q: number;
  a: number;
  b: number;
  d: number;
}

const cluesVersusRegionSizeFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function cluesVersusRegionSize(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CluesVersusRegionSizeBinding> | null): number {
  const facts = cluesVersusRegionSizeFacts;
  let fired = 0;
  let changed = false;
  const _h11 = (cl.k !== 2);
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _h8 = cl.number.v[v_q];
    const _h9 = (8 - _h8);
    const _h10 = (_h8 === 3);
    const v_a = cl.number.at[v_q];
    const _a4 = sp.adj4[v_a];
    for (let _i5 = 0; _i5 < _a4.length; _i5++) {
      const v_b = _a4[_i5];
      if (!(!((b.grid[sp.adj4Edges[v_a][_i5]] !== 0)))) continue;
      const _h6 = clueAt(cl.number, v_b);
      L7: {
        const v_d = _h6;
        if (!(((v_d !== -1) && (((_h9 - v_d) > cl.k) || ((_h10 && (v_d === 3)) && _h11))))) break L7;
        facts.length = 0;
        changed = false;
        const _t12 = sp.adj4Edges[v_a][_i5];
        if (!(b.grid[_t12] !== 0)) { if (fire === null) { b.placeAt(_t12, 1); changed = true; } else facts.push(PLACE, _t12, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ q: v_q, a: v_a, b: v_b, d: v_d }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface NumberExhaustedBinding {
  q: number;
  c: number;
  U: readonly number[];
  n: number;
}

const numberExhaustedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function numberExhausted(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NumberExhaustedBinding> | null): number {
  const _g24: number[] = [];
  const facts = numberExhaustedFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const v_c = cl.number.at[v_q];
    _g24.length = 0;
    G25: {
      const _a28 = sp.adj4[v_c];
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_y = _a28[_i29];
        if (!(!((b.grid[sp.adj4Edges[v_c][_i29]] !== 0)))) continue;
        _g24.push(v_y);
      }
    }
    const v_U = _g24;
    const _h35 = v_U.length;
    let _g30 = 0;
    G31: {
      const _a32 = sp.adj4[v_c];
      for (let _i33 = 0; _i33 < _a32.length; _i33++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i33]] || -1) === 1))) continue;
        _g30++;
      }
    }
    L34: {
      const v_n = ((4 - sp.adj4[v_c].length) + _g30);
      if (!((((_h35 > 0) || (v_n !== cl.number.v[v_q])) && ((v_n >= cl.number.v[v_q]) || ((v_n + _h35) <= cl.number.v[v_q]))))) break L34;
      facts.length = 0;
      changed = false;
      let _c42: boolean = ((v_n <= cl.number.v[v_q]) && ((v_n + _h35) >= cl.number.v[v_q]));
      if (_c42) {
        let _c41: boolean = !((v_n === cl.number.v[v_q]));
        if (!_c41) {
          let _q36 = true;
          Q37: {
            const _a38 = v_U;
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_y = _a38[_i39];
              const _t40 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t40] !== 0)) { if (fire === null) { b.placeAt(_t40, 2); changed = true; } else facts.push(PLACE, _t40, 2); }
              if (!(true)) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c41 = _q36;
        }
        _c42 = _c41;
      }
      let _c49: boolean = _c42;
      if (_c49) {
        let _c48: boolean = !((v_n < cl.number.v[v_q]));
        if (!_c48) {
          let _q43 = true;
          Q44: {
            const _a45 = v_U;
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_y = _a45[_i46];
              const _t47 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t47] !== 0)) { if (fire === null) { b.placeAt(_t47, 1); changed = true; } else facts.push(PLACE, _t47, 1); }
              if (!(true)) {
                _q43 = false;
                break Q44;
              }
            }
          }
          _c48 = _q43;
        }
        _c49 = _c48;
      }
      if (!(_c49)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ q: v_q, c: v_c, U: v_U.slice(), n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NotTooBigBinding {
  O: readonly number[];
  e: number;
  A: readonly number[];
  b: number;
  B: readonly number[];
}

const notTooBigFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function notTooBig(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooBigBinding> | null): number {
  const _g60: number[] = [];
  const facts = notTooBigFacts;
  let fired = 0;
  let changed = false;
  const _m49_0 = b.made[0];
  _g60.length = 0;
  G61: {
    const _a64 = sp.edges;
    for (let _i65 = 0; _i65 < _a64.length; _i65++) {
      const v_e = _a64[_i65];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g60.push(v_e);
    }
  }
  const v_O = _g60;
  const _m52_1 = b.made[1];
  const _eg68 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a66 = sp.edges;
  R1:
  for (let _i67 = 0; _i67 < _a66.length; _i67++) {
    const v_e = _a66[_i67];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg68.of(sp.edgeEnds[2 * v_e]);
    const _h71 = v_A.length;
    L69: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg68.of(v_b) === v_A))) break L69;
      L70: {
        const v_B = _eg68.of(v_b);
        const _h72 = v_B.length;
        if (!(((_h71 + _h72) > cl.k))) break L70;
        if (b.made[0] !== _m49_0 || b.made[1] !== _m52_1) {
          const _now73 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
          if (!(_now73 === _eg68.of(sp.edgeEnds[2 * v_e]) || sameSet(_now73, _eg68.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
          const _now74 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
          if (!(_now74 === _eg68.of(v_b) || sameSet(_now74, _eg68.of(v_b)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ O: v_O.slice(), e: v_e, A: v_A.slice(), b: v_b, B: v_B.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface NotTooSmallBinding {
  O: readonly number[];
  c: number;
  A: readonly number[];
  S: readonly number[];
}

const notTooSmallFacts: number[] = [];
const _st129 = stamps();

/** Its dearest read grows with the board as n. */
export function notTooSmall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooSmallBinding> | null): number {
  const _g106: number[] = [];
  const _g117: number[] = [];
  const _g132: number[] = [];
  const facts = notTooSmallFacts;
  let fired = 0;
  let changed = false;
  const _m75_0 = b.made[0];
  _g106.length = 0;
  G107: {
    const _a110 = sp.edges;
    for (let _i111 = 0; _i111 < _a110.length; _i111++) {
      const v_e = _a110[_i111];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g106.push(v_e);
    }
  }
  const v_O = _g106;
  const _m78_1 = b.made[1];
  const _eg114 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a112 = sp.cells;
  R1:
  for (let _i113 = 0; _i113 < _a112.length; _i113++) {
    const v_c = _a112[_i113];
    L115: {
      const v_A = _eg114.of(v_c);
      const _h116 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h116 !== cl.k)))) break L115;
      _g117.length = 0;
      _st129.pass++;
      G118: {
        const _a130 = v_A;
        for (let _i131 = 0; _i131 < _a130.length; _i131++) {
          const v_x = _a130[_i131];
          _g132.length = 0;
          G133: {
            const _a136 = sp.adj4[v_x];
            for (let _i137 = 0; _i137 < _a136.length; _i137++) {
              const v_y = _a136[_i137];
              if (!(!((b.grid[sp.adj4Edges[v_x][_i137]] !== 0)))) continue;
              _g132.push(v_y);
            }
          }
          const _a138 = _g132;
          for (let _i139 = 0; _i139 < _a138.length; _i139++) {
            const v_s = _a138[_i139];
            const _t140 = v_s;
            if (_g117.length < 16) { if (!_g117.includes(_t140)) _g117.push(_t140); } else addOnce(_g117, _st129, _t140);
          }
        }
      }
      const v_S = _g117;
      const _h143 = v_S.length;
      if (b.made[0] !== _m75_0 || b.made[1] !== _m78_1) {
        const _now141 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_c);
        if (!(_now141 === _eg114.of(v_c) || sameSet(_now141, _eg114.of(v_c)))) { continue R1; }
        const _now142 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of((v_S[0] ?? -1));
        if (!(_now142 === _eg114.of((v_S[0] ?? -1)) || sameSet(_now142, _eg114.of((v_S[0] ?? -1))))) { continue R1; }
      }
      facts.length = 0;
      changed = false;
      let _c158: boolean = ((_h116 < cl.k) && (_h143 > 0));
      if (_c158) {
        let _q144 = true;
        Q145: {
          const v_B = _eg114.of((v_S[0] ?? -1));
          let _q146 = true;
          Q147: {
            const _a148 = v_S;
            for (let _i149 = 0; _i149 < _a148.length; _i149++) {
              const v_s = _a148[_i149];
              if (!((_eg114.of(v_s) === v_B))) {
                _q146 = false;
                break Q147;
              }
            }
          }
          let _c157: boolean = !(_q146);
          if (!_c157) {
            let _q150 = true;
            Q151: {
              const _a152 = v_A;
              for (let _i153 = 0; _i153 < _a152.length; _i153++) {
                const v_x = _a152[_i153];
                const _a154 = sp.adj4[v_x];
                for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                  const v_y = _a154[_i155];
                  if (!((_eg114.of(v_y) === v_B))) continue;
                  const _t156 = sp.adj4Edges[v_x][_i155];
                  if (!(b.grid[_t156] !== 0)) { if (fire === null) { b.placeAt(_t156, 2); changed = true; } else facts.push(PLACE, _t156, 2); }
                  if (!(true)) {
                    _q150 = false;
                    break Q151;
                  }
                }
              }
            }
            _c157 = _q150;
          }
          if (!(_c157)) {
            _q144 = false;
            break Q145;
          }
        }
        _c158 = _q144;
      }
      if (!(_c158)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O.slice(), c: v_c, A: v_A.slice(), S: v_S.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NoDanglingEdgesBinding {
  p: number;
  C: readonly number[];
  F: readonly number[];
  f: number;
}

const noDanglingEdgesFacts: number[] = [];
const _st192 = stamps();

/** Its dearest read grows with the board as n. */
export function noDanglingEdges(b: Marks, sp: GridSpace, fire: Fire<NoDanglingEdgesBinding> | null): number {
  const _g186: number[] = [];
  const facts = noDanglingEdgesFacts;
  let fired = 0;
  let changed = false;
  const _a184 = sp.corners;
  for (let _i185 = 0; _i185 < _a184.length; _i185++) {
    const v_p = _a184[_i185];
    const v_C = sp.cornerCells[v_p];
    _g186.length = 0;
    _st192.pass++;
    G187: {
      const _a193 = v_C;
      for (let _i194 = 0; _i194 < _a193.length; _i194++) {
        const v_x = _a193[_i194];
        const _a195 = sp.adj4[v_x];
        for (let _i196 = 0; _i196 < _a195.length; _i196++) {
          const v_y = _a195[_i196];
          if (!((v_C.includes(v_y)))) continue;
          const _t197 = sp.adj4Edges[v_x][_i196];
          const _t198 = _t197;
          if (_g186.length < 16) { if (!_g186.includes(_t198)) _g186.push(_t198); } else addOnce(_g186, _st192, _t198);
        }
      }
    }
    const v_F = _g186;
    const _a199 = v_F;
    for (let _i200 = 0; _i200 < _a199.length; _i200++) {
      const v_f = _a199[_i200];
      let _c205: boolean = !((b.grid[v_f] !== 0));
      if (_c205) {
        let _g201 = 0;
        G202: {
          const _a203 = v_F;
          for (let _i204 = 0; _i204 < _a203.length; _i204++) {
            const v_e = _a203[_i204];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g201++;
          }
        }
        _c205 = (_g201 === 1);
      }
      let _c210: boolean = _c205;
      if (_c210) {
        let _g206 = 0;
        G207: {
          const _a208 = v_F;
          for (let _i209 = 0; _i209 < _a208.length; _i209++) {
            const v_e = _a208[_i209];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g206++;
          }
        }
        _c210 = (_g206 === 1);
      }
      if (!(_c210)) continue;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ p: v_p, C: v_C.slice(), F: v_F.slice(), f: v_f }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface EquivalentEdgesBinding {
  O: readonly number[];
  q: number;
  c: number;
  y: number;
  R: readonly number[];
  z: number;
}

const equivalentEdgesFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function equivalentEdges(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EquivalentEdgesBinding> | null): number {
  const _g230: number[] = [];
  const _g237: number[] = [];
  const _g251: number[] = [];
  const facts = equivalentEdgesFacts;
  let fired = 0;
  let changed = false;
  const _m131_0 = b.made[0];
  _g230.length = 0;
  G231: {
    const _a234 = sp.edges;
    for (let _i235 = 0; _i235 < _a234.length; _i235++) {
      const v_e = _a234[_i235];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g230.push(v_e);
    }
  }
  const v_O = _g230;
  const _m134_1 = b.made[1];
  const _eg245 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _h261 = cl.number.v[v_q];
    const _h270 = (4 - _h261);
    L236: {
      const v_c = cl.number.at[v_q];
      if (!(((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)))) break L236;
      _g237.length = 0;
      G238: {
        const _a241 = sp.adj4[v_c];
        for (let _i242 = 0; _i242 < _a241.length; _i242++) {
          const v_y = _a241[_i242];
          if (!(!((b.grid[sp.adj4Edges[v_c][_i242]] !== 0)))) continue;
          _g237.push(v_y);
        }
      }
      const _a243 = _g237;
      R2:
      for (let _i244 = 0; _i244 < _a243.length; _i244++) {
        const v_y = _a243[_i244];
        if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) continue;
        const _h262 = sp.edgeOf(v_c, v_y);
        L246: {
          const v_R = _eg245.of(v_y);
          if (!(!(_eg245.of(v_c) === v_R))) break L246;
          const _a247 = sp.adj4[v_c];
          const _n248 = _a247.indexOf(v_y);
          for (let _i249 = 0; _i249 < _n248; _i249++) {
            const v_z = _a247[_i249];
            if (!((!((b.grid[sp.adj4Edges[v_c][_i249]] !== 0)) && (_eg245.of(v_z) === v_R)))) continue;
            if (b.made[0] !== _m131_0 || b.made[1] !== _m134_1) {
              const _now250 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_y);
              if (!(_now250 === _eg245.of(v_y) || sameSet(_now250, _eg245.of(v_y)))) { continue R2; }
              _g251.length = 0;
              G252: {
                const _a255 = sp.adj4[v_c];
                for (let _i256 = 0; _i256 < _a255.length; _i256++) {
                  const v_y = _a255[_i256];
                  if (!(!((b.grid[sp.adj4Edges[v_c][_i256]] !== 0)))) continue;
                  _g251.push(v_y);
                }
              }
              if (!((_g251.includes(v_y)))) { continue R2; }
              if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) { continue R2; }
            }
            facts.length = 0;
            changed = false;
            let _c265: boolean = !(((walls(b, sp, v_c) + 2) > _h261));
            if (!_c265) {
              if (!(b.grid[_h262] !== 0)) { if (fire === null) { b.placeAt(_h262, 2); changed = true; } else facts.push(PLACE, _h262, 2); }
              let _c264: boolean = true;
              if (_c264) {
                const _t263 = sp.adj4Edges[v_c][_i249];
                if (!(b.grid[_t263] !== 0)) { if (fire === null) { b.placeAt(_t263, 2); changed = true; } else facts.push(PLACE, _t263, 2); }
                _c264 = true;
              }
              _c265 = _c264;
            }
            let _c274: boolean = _c265;
            if (_c274) {
              let _c273: boolean = !((((walls(b, sp, v_c) + 2) <= _h261) && ((opens(b, sp, v_c) + 2) > _h270)));
              if (!_c273) {
                if (!(b.grid[_h262] !== 0)) { if (fire === null) { b.placeAt(_h262, 1); changed = true; } else facts.push(PLACE, _h262, 1); }
                let _c272: boolean = true;
                if (_c272) {
                  const _t271 = sp.adj4Edges[v_c][_i249];
                  if (!(b.grid[_t271] !== 0)) { if (fire === null) { b.placeAt(_t271, 1); changed = true; } else facts.push(PLACE, _t271, 1); }
                  _c272 = true;
                }
                _c273 = _c272;
              }
              _c274 = _c273;
            }
            if (!(_c274)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ O: v_O.slice(), q: v_q, c: v_c, y: v_y, R: v_R.slice(), z: v_z }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface InsideBinding {
  O: readonly number[];
  e: number;
}

const insideFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function inside(b: Marks, sp: GridSpace, fire: Fire<InsideBinding> | null): number {
  const _g283: number[] = [];
  const facts = insideFacts;
  let fired = 0;
  let changed = false;
  const _m163_0 = b.made[0];
  _g283.length = 0;
  G284: {
    const _a287 = sp.edges;
    for (let _i288 = 0; _i288 < _a287.length; _i288++) {
      const v_e = _a287[_i288];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g283.push(v_e);
    }
  }
  const v_O = _g283;
  const _m166_1 = b.made[1];
  const _eg291 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a289 = sp.edges;
  R1:
  for (let _i290 = 0; _i290 < _a289.length; _i290++) {
    const v_e = _a289[_i290];
    if (!((((b.grid[v_e] || -1) !== 2) && (_eg291.of(sp.edgeEnds[2 * v_e + 1]) === _eg291.of(sp.edgeEnds[2 * v_e]))))) continue;
    if (b.made[0] !== _m163_0 || b.made[1] !== _m166_1) {
      const _now292 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
      if (!(_now292 === _eg291.of(sp.edgeEnds[2 * v_e]) || sameSet(_now292, _eg291.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ O: v_O.slice(), e: v_e }, facts)) return 1;
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 2);
}

const wallsKept = keptStore<number>();

/** `walls(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function walls(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = wallsKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g257 = 0;
  G258: {
    const _a259 = sp.adj4[v_c];
    for (let _i260 = 0; _i260 < _a259.length; _i260++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i260]] || -1) === 1))) continue;
      _g257++;
    }
  }
  const _made = ((4 - sp.adj4[v_c].length) + _g257);
  _kept[v_c] = _made;
  return _made;
}

const opensKept = keptStore<number>();

/** `opens(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function opens(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = opensKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g266 = 0;
  G267: {
    const _a268 = sp.adj4[v_c];
    for (let _i269 = 0; _i269 < _a268.length; _i269++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i269]] || -1) === 2))) continue;
      _g266++;
    }
  }
  const _made = _g266;
  _kept[v_c] = _made;
  return _made;
}
