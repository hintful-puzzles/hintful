// Compiled by `npm run describe` from src/games/palisade/palisade.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, edgeGroups, keptEdgeGroups, rangeMask } from "../../engine/describe-runtime.ts";

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
  const _g298: number[] = [];
  const _g311: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q296 = true;
  Q297: {
    _g298.length = 0;
    G299: {
      const _a302 = sp.edges;
      for (let _i303 = 0; _i303 < _a302.length; _i303++) {
        const v_e = _a302[_i303];
        const _h304 = (g[v_e] || -1);
        if (!((_h304 === 2))) continue;
        _g298.push(v_e);
      }
    }
    const v_O = _g298;
    const _eg308 = edgeGroups(sp, v_O);
    const _a305 = sp.edges;
    for (let _i306 = 0; _i306 < _a305.length; _i306++) {
      const v_e = _a305[_i306];
      const _h307 = (g[v_e] || -1);
      if (!(((_h307 === 1) === !(_eg308.of(sp.edgeEnds[2 * v_e + 1]) === _eg308.of(sp.edgeEnds[2 * v_e]))))) {
        _q296 = false;
        break Q297;
      }
    }
  }
  if (!(_q296)) return false;
  let _q309 = true;
  Q310: {
    _g311.length = 0;
    G312: {
      const _a315 = sp.edges;
      for (let _i316 = 0; _i316 < _a315.length; _i316++) {
        const v_e = _a315[_i316];
        const _h317 = (g[v_e] || -1);
        if (!((_h317 === 2))) continue;
        _g311.push(v_e);
      }
    }
    const v_O = _g311;
    const _eg320 = edgeGroups(sp, v_O);
    const _a318 = sp.cells;
    for (let _i319 = 0; _i319 < _a318.length; _i319++) {
      const v_c = _a318[_i319];
      const _h321 = _eg320.of(v_c).length;
      if (!((_h321 === cl.k))) {
        _q309 = false;
        break Q310;
      }
    }
  }
  if (!(_q309)) return false;
  for (let _k322 = 0; _k322 < cl.number.at.length; _k322++) {
    const _at323 = cl.number.at[_k322];
    const _v324 = cl.number.v[_k322];
    let _g325 = 0;
    G326: {
      const _a327 = sp.adj4[_at323];
      for (let _i328 = 0; _i328 < _a327.length; _i328++) {
        const _h329 = (g[sp.adj4Edges[_at323][_i328]] || -1);
        if (!((_h329 === 1))) continue;
        _g325++;
      }
    }
    if (!((((4 - sp.adj4[_at323].length) + _g325) === _v324))) return false;
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
        if (fire !== null && !fire({ q: v_q, c: v_c, U: v_U, n: v_n }, facts)) return 1;
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
  const _eg68 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a66 = sp.edges;
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
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ O: v_O, e: v_e, A: v_A, b: v_b, B: v_B }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function notTooSmall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooSmallBinding> | null): number {
  const _g111: number[] = [];
  const _g129: number[] = [];
  const _g143: number[] = [];
  const facts = notTooSmallFacts;
  let fired = 0;
  let changed = false;
  _g111.length = 0;
  G112: {
    const _a115 = sp.edges;
    for (let _i116 = 0; _i116 < _a115.length; _i116++) {
      const v_e = _a115[_i116];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g111.push(v_e);
    }
  }
  const v_O = _g111;
  const _eg119 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a117 = sp.cells;
  for (let _i118 = 0; _i118 < _a117.length; _i118++) {
    const v_c = _a117[_i118];
    L120: {
      const v_A = _eg119.of(v_c);
      const _h121 = v_A.length;
      let _c128: boolean = ((v_c === (v_A[0] ?? -1)) && (_h121 !== cl.k));
      if (_c128) {
        let _q122 = false;
        Q123: {
          const _a124 = v_A;
          for (let _i125 = 0; _i125 < _a124.length; _i125++) {
            const v_x = _a124[_i125];
            const _a126 = sp.adj4[v_x];
            for (let _i127 = 0; _i127 < _a126.length; _i127++) {
              const v_y = _a126[_i127];
              if (!(!(_eg119.of(v_y) === v_A))) continue;
              if (((b.grid[sp.adj4Edges[v_x][_i127]] || -1) === 2)) {
                _q122 = true;
                break Q123;
              }
            }
          }
        }
        _c128 = !(_q122);
      }
      if (!(_c128)) break L120;
      _g129.length = 0;
      G130: {
        const _a141 = v_A;
        for (let _i142 = 0; _i142 < _a141.length; _i142++) {
          const v_x = _a141[_i142];
          _g143.length = 0;
          G144: {
            const _a147 = sp.adj4[v_x];
            for (let _i148 = 0; _i148 < _a147.length; _i148++) {
              const v_y = _a147[_i148];
              if (!(!((b.grid[sp.adj4Edges[v_x][_i148]] !== 0)))) continue;
              _g143.push(v_y);
            }
          }
          const _a149 = _g143;
          for (let _i150 = 0; _i150 < _a149.length; _i150++) {
            const v_s = _a149[_i150];
            if (!_g129.includes(v_s)) _g129.push(v_s);
          }
        }
      }
      const v_S = _g129;
      const _h151 = v_S.length;
      facts.length = 0;
      changed = false;
      let _c166: boolean = ((_h121 < cl.k) && (_h151 > 0));
      if (_c166) {
        let _q152 = true;
        Q153: {
          const v_B = _eg119.of((v_S[0] ?? -1));
          let _q154 = true;
          Q155: {
            const _a156 = v_S;
            for (let _i157 = 0; _i157 < _a156.length; _i157++) {
              const v_s = _a156[_i157];
              if (!((_eg119.of(v_s) === v_B))) {
                _q154 = false;
                break Q155;
              }
            }
          }
          let _c165: boolean = !(_q154);
          if (!_c165) {
            let _q158 = true;
            Q159: {
              const _a160 = v_A;
              for (let _i161 = 0; _i161 < _a160.length; _i161++) {
                const v_x = _a160[_i161];
                const _a162 = sp.adj4[v_x];
                for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                  const v_y = _a162[_i163];
                  if (!((_eg119.of(v_y) === v_B))) continue;
                  const _t164 = sp.adj4Edges[v_x][_i163];
                  if (!(b.grid[_t164] !== 0)) { if (fire === null) { b.placeAt(_t164, 2); changed = true; } else facts.push(PLACE, _t164, 2); }
                  if (!(true)) {
                    _q158 = false;
                    break Q159;
                  }
                }
              }
            }
            _c165 = _q158;
          }
          if (!(_c165)) {
            _q152 = false;
            break Q153;
          }
        }
        _c166 = _q152;
      }
      if (!(_c166)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O, c: v_c, A: v_A, S: v_S }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function noDanglingEdges(b: Marks, sp: GridSpace, fire: Fire<NoDanglingEdgesBinding> | null): number {
  const _g194: number[] = [];
  const facts = noDanglingEdgesFacts;
  let fired = 0;
  let changed = false;
  const _a192 = sp.corners;
  for (let _i193 = 0; _i193 < _a192.length; _i193++) {
    const v_p = _a192[_i193];
    const v_C = sp.cornerCells[v_p];
    _g194.length = 0;
    G195: {
      const _a200 = v_C;
      for (let _i201 = 0; _i201 < _a200.length; _i201++) {
        const v_x = _a200[_i201];
        const _a202 = sp.adj4[v_x];
        for (let _i203 = 0; _i203 < _a202.length; _i203++) {
          const v_y = _a202[_i203];
          if (!((v_C.includes(v_y)))) continue;
          const _t204 = sp.adj4Edges[v_x][_i203];
          if (!_g194.includes(_t204)) _g194.push(_t204);
        }
      }
    }
    const v_F = _g194;
    const _a205 = v_F;
    for (let _i206 = 0; _i206 < _a205.length; _i206++) {
      const v_f = _a205[_i206];
      let _c211: boolean = !((b.grid[v_f] !== 0));
      if (_c211) {
        let _g207 = 0;
        G208: {
          const _a209 = v_F;
          for (let _i210 = 0; _i210 < _a209.length; _i210++) {
            const v_e = _a209[_i210];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g207++;
          }
        }
        _c211 = (_g207 === 1);
      }
      let _c216: boolean = _c211;
      if (_c216) {
        let _g212 = 0;
        G213: {
          const _a214 = v_F;
          for (let _i215 = 0; _i215 < _a214.length; _i215++) {
            const v_e = _a214[_i215];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g212++;
          }
        }
        _c216 = (_g212 === 1);
      }
      if (!(_c216)) continue;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ p: v_p, C: v_C, F: v_F, f: v_f }, facts)) return 1;
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
  const _g236: number[] = [];
  const _g243: number[] = [];
  const facts = equivalentEdgesFacts;
  let fired = 0;
  let changed = false;
  _g236.length = 0;
  G237: {
    const _a240 = sp.edges;
    for (let _i241 = 0; _i241 < _a240.length; _i241++) {
      const v_e = _a240[_i241];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g236.push(v_e);
    }
  }
  const v_O = _g236;
  const _eg251 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _h260 = cl.number.v[v_q];
    const _h273 = (4 - _h260);
    L242: {
      const v_c = cl.number.at[v_q];
      if (!(((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)))) break L242;
      _g243.length = 0;
      G244: {
        const _a247 = sp.adj4[v_c];
        for (let _i248 = 0; _i248 < _a247.length; _i248++) {
          const v_y = _a247[_i248];
          if (!(!((b.grid[sp.adj4Edges[v_c][_i248]] !== 0)))) continue;
          _g243.push(v_y);
        }
      }
      const _a249 = _g243;
      for (let _i250 = 0; _i250 < _a249.length; _i250++) {
        const v_y = _a249[_i250];
        if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) continue;
        const _h261 = sp.edgeOf(v_c, v_y);
        L252: {
          const v_R = _eg251.of(v_y);
          if (!(!(_eg251.of(v_c) === v_R))) break L252;
          const _a253 = sp.adj4[v_c];
          const _n254 = _a253.indexOf(v_y);
          for (let _i255 = 0; _i255 < _n254; _i255++) {
            const v_z = _a253[_i255];
            if (!((!((b.grid[sp.adj4Edges[v_c][_i255]] !== 0)) && (_eg251.of(v_z) === v_R)))) continue;
            facts.length = 0;
            changed = false;
            let _g256 = 0;
            G257: {
              const _a258 = sp.adj4[v_c];
              for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i259]] || -1) === 1))) continue;
                _g256++;
              }
            }
            let _c264: boolean = !(((((4 - sp.adj4[v_c].length) + _g256) + 2) > _h260));
            if (!_c264) {
              if (!(b.grid[_h261] !== 0)) { if (fire === null) { b.placeAt(_h261, 2); changed = true; } else facts.push(PLACE, _h261, 2); }
              let _c263: boolean = true;
              if (_c263) {
                const _t262 = sp.adj4Edges[v_c][_i255];
                if (!(b.grid[_t262] !== 0)) { if (fire === null) { b.placeAt(_t262, 2); changed = true; } else facts.push(PLACE, _t262, 2); }
                _c263 = true;
              }
              _c264 = _c263;
            }
            let _c278: boolean = _c264;
            if (_c278) {
              let _g265 = 0;
              G266: {
                const _a267 = sp.adj4[v_c];
                for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i268]] || -1) === 1))) continue;
                  _g265++;
                }
              }
              let _c274: boolean = ((((4 - sp.adj4[v_c].length) + _g265) + 2) <= _h260);
              if (_c274) {
                let _g269 = 0;
                G270: {
                  const _a271 = sp.adj4[v_c];
                  for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i272]] || -1) === 2))) continue;
                    _g269++;
                  }
                }
                _c274 = ((_g269 + 2) > _h273);
              }
              let _c277: boolean = !(_c274);
              if (!_c277) {
                if (!(b.grid[_h261] !== 0)) { if (fire === null) { b.placeAt(_h261, 1); changed = true; } else facts.push(PLACE, _h261, 1); }
                let _c276: boolean = true;
                if (_c276) {
                  const _t275 = sp.adj4Edges[v_c][_i255];
                  if (!(b.grid[_t275] !== 0)) { if (fire === null) { b.placeAt(_t275, 1); changed = true; } else facts.push(PLACE, _t275, 1); }
                  _c276 = true;
                }
                _c277 = _c276;
              }
              _c278 = _c277;
            }
            if (!(_c278)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ O: v_O, q: v_q, c: v_c, y: v_y, R: v_R, z: v_z }, facts)) return 1;
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
  const _g287: number[] = [];
  const facts = insideFacts;
  let fired = 0;
  let changed = false;
  _g287.length = 0;
  G288: {
    const _a291 = sp.edges;
    for (let _i292 = 0; _i292 < _a291.length; _i292++) {
      const v_e = _a291[_i292];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g287.push(v_e);
    }
  }
  const v_O = _g287;
  const _eg295 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a293 = sp.edges;
  for (let _i294 = 0; _i294 < _a293.length; _i294++) {
    const v_e = _a293[_i294];
    if (!((((b.grid[v_e] || -1) !== 2) && (_eg295.of(sp.edgeEnds[2 * v_e + 1]) === _eg295.of(sp.edgeEnds[2 * v_e]))))) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ O: v_O, e: v_e }, facts)) return 1;
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 2);
}
