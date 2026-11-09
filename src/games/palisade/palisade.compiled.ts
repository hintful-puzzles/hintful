// Compiled by `npm run describe` from src/games/palisade/palisade.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, keptStore, rangeMask, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g297: number[] = [];
  const _g310: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q295 = true;
  Q296: {
    _g297.length = 0;
    G298: {
      const _a301 = sp.edges;
      for (let _i302 = 0; _i302 < _a301.length; _i302++) {
        const v_e = _a301[_i302];
        const _h303 = (g[v_e] || -1);
        if (!((_h303 === 2))) continue;
        _g297.push(v_e);
      }
    }
    const v_O = _g297;
    const _eg307 = edgeGroups(sp, v_O);
    const _a304 = sp.edges;
    for (let _i305 = 0; _i305 < _a304.length; _i305++) {
      const v_e = _a304[_i305];
      const _h306 = (g[v_e] || -1);
      if (!(((_h306 === 1) === !(_eg307.of(sp.edgeEnds[2 * v_e + 1]) === _eg307.of(sp.edgeEnds[2 * v_e]))))) {
        _q295 = false;
        break Q296;
      }
    }
  }
  if (!(_q295)) return false;
  let _q308 = true;
  Q309: {
    _g310.length = 0;
    G311: {
      const _a314 = sp.edges;
      for (let _i315 = 0; _i315 < _a314.length; _i315++) {
        const v_e = _a314[_i315];
        const _h316 = (g[v_e] || -1);
        if (!((_h316 === 2))) continue;
        _g310.push(v_e);
      }
    }
    const v_O = _g310;
    const _eg319 = edgeGroups(sp, v_O);
    const _a317 = sp.cells;
    for (let _i318 = 0; _i318 < _a317.length; _i318++) {
      const v_c = _a317[_i318];
      const _h320 = _eg319.of(v_c).length;
      if (!((_h320 === cl.k))) {
        _q308 = false;
        break Q309;
      }
    }
  }
  if (!(_q308)) return false;
  for (let _k321 = 0; _k321 < cl.number.at.length; _k321++) {
    const _at322 = cl.number.at[_k321];
    const _v323 = cl.number.v[_k321];
    let _g324 = 0;
    G325: {
      const _a326 = sp.adj4[_at322];
      for (let _i327 = 0; _i327 < _a326.length; _i327++) {
        const _h328 = (g[sp.adj4Edges[_at322][_i327]] || -1);
        if (!((_h328 === 1))) continue;
        _g324++;
      }
    }
    if (!((((4 - sp.adj4[_at322].length) + _g324) === _v323))) return false;
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
const _st141 = stamps();

/** Its dearest read grows with the board as n. */
export function notTooSmall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooSmallBinding> | null): number {
  const _g111: number[] = [];
  const _g129: number[] = [];
  const _g144: number[] = [];
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
      _st141.pass++;
      G130: {
        const _a142 = v_A;
        for (let _i143 = 0; _i143 < _a142.length; _i143++) {
          const v_x = _a142[_i143];
          _g144.length = 0;
          G145: {
            const _a148 = sp.adj4[v_x];
            for (let _i149 = 0; _i149 < _a148.length; _i149++) {
              const v_y = _a148[_i149];
              if (!(!((b.grid[sp.adj4Edges[v_x][_i149]] !== 0)))) continue;
              _g144.push(v_y);
            }
          }
          const _a150 = _g144;
          for (let _i151 = 0; _i151 < _a150.length; _i151++) {
            const v_s = _a150[_i151];
            const _t152 = v_s;
            if (_g129.length < 16) { if (!_g129.includes(_t152)) _g129.push(_t152); } else addOnce(_g129, _st141, _t152);
          }
        }
      }
      const v_S = _g129;
      const _h153 = v_S.length;
      facts.length = 0;
      changed = false;
      let _c168: boolean = ((_h121 < cl.k) && (_h153 > 0));
      if (_c168) {
        let _q154 = true;
        Q155: {
          const v_B = _eg119.of((v_S[0] ?? -1));
          let _q156 = true;
          Q157: {
            const _a158 = v_S;
            for (let _i159 = 0; _i159 < _a158.length; _i159++) {
              const v_s = _a158[_i159];
              if (!((_eg119.of(v_s) === v_B))) {
                _q156 = false;
                break Q157;
              }
            }
          }
          let _c167: boolean = !(_q156);
          if (!_c167) {
            let _q160 = true;
            Q161: {
              const _a162 = v_A;
              for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                const v_x = _a162[_i163];
                const _a164 = sp.adj4[v_x];
                for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                  const v_y = _a164[_i165];
                  if (!((_eg119.of(v_y) === v_B))) continue;
                  const _t166 = sp.adj4Edges[v_x][_i165];
                  if (!(b.grid[_t166] !== 0)) { if (fire === null) { b.placeAt(_t166, 2); changed = true; } else facts.push(PLACE, _t166, 2); }
                  if (!(true)) {
                    _q160 = false;
                    break Q161;
                  }
                }
              }
            }
            _c167 = _q160;
          }
          if (!(_c167)) {
            _q154 = false;
            break Q155;
          }
        }
        _c168 = _q154;
      }
      if (!(_c168)) return -1;
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
const _st202 = stamps();

/** Its dearest read grows with the board as n. */
export function noDanglingEdges(b: Marks, sp: GridSpace, fire: Fire<NoDanglingEdgesBinding> | null): number {
  const _g196: number[] = [];
  const facts = noDanglingEdgesFacts;
  let fired = 0;
  let changed = false;
  const _a194 = sp.corners;
  for (let _i195 = 0; _i195 < _a194.length; _i195++) {
    const v_p = _a194[_i195];
    const v_C = sp.cornerCells[v_p];
    _g196.length = 0;
    _st202.pass++;
    G197: {
      const _a203 = v_C;
      for (let _i204 = 0; _i204 < _a203.length; _i204++) {
        const v_x = _a203[_i204];
        const _a205 = sp.adj4[v_x];
        for (let _i206 = 0; _i206 < _a205.length; _i206++) {
          const v_y = _a205[_i206];
          if (!((v_C.includes(v_y)))) continue;
          const _t207 = sp.adj4Edges[v_x][_i206];
          const _t208 = _t207;
          if (_g196.length < 16) { if (!_g196.includes(_t208)) _g196.push(_t208); } else addOnce(_g196, _st202, _t208);
        }
      }
    }
    const v_F = _g196;
    const _a209 = v_F;
    for (let _i210 = 0; _i210 < _a209.length; _i210++) {
      const v_f = _a209[_i210];
      let _c215: boolean = !((b.grid[v_f] !== 0));
      if (_c215) {
        let _g211 = 0;
        G212: {
          const _a213 = v_F;
          for (let _i214 = 0; _i214 < _a213.length; _i214++) {
            const v_e = _a213[_i214];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g211++;
          }
        }
        _c215 = (_g211 === 1);
      }
      let _c220: boolean = _c215;
      if (_c220) {
        let _g216 = 0;
        G217: {
          const _a218 = v_F;
          for (let _i219 = 0; _i219 < _a218.length; _i219++) {
            const v_e = _a218[_i219];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g216++;
          }
        }
        _c220 = (_g216 === 1);
      }
      if (!(_c220)) continue;
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
  const _g240: number[] = [];
  const _g247: number[] = [];
  const facts = equivalentEdgesFacts;
  let fired = 0;
  let changed = false;
  _g240.length = 0;
  G241: {
    const _a244 = sp.edges;
    for (let _i245 = 0; _i245 < _a244.length; _i245++) {
      const v_e = _a244[_i245];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g240.push(v_e);
    }
  }
  const v_O = _g240;
  const _eg255 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _h264 = cl.number.v[v_q];
    const _h273 = (4 - _h264);
    L246: {
      const v_c = cl.number.at[v_q];
      if (!(((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)))) break L246;
      _g247.length = 0;
      G248: {
        const _a251 = sp.adj4[v_c];
        for (let _i252 = 0; _i252 < _a251.length; _i252++) {
          const v_y = _a251[_i252];
          if (!(!((b.grid[sp.adj4Edges[v_c][_i252]] !== 0)))) continue;
          _g247.push(v_y);
        }
      }
      const _a253 = _g247;
      for (let _i254 = 0; _i254 < _a253.length; _i254++) {
        const v_y = _a253[_i254];
        if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) continue;
        const _h265 = sp.edgeOf(v_c, v_y);
        L256: {
          const v_R = _eg255.of(v_y);
          if (!(!(_eg255.of(v_c) === v_R))) break L256;
          const _a257 = sp.adj4[v_c];
          const _n258 = _a257.indexOf(v_y);
          for (let _i259 = 0; _i259 < _n258; _i259++) {
            const v_z = _a257[_i259];
            if (!((!((b.grid[sp.adj4Edges[v_c][_i259]] !== 0)) && (_eg255.of(v_z) === v_R)))) continue;
            facts.length = 0;
            changed = false;
            let _c268: boolean = !(((walls(b, sp, v_c) + 2) > _h264));
            if (!_c268) {
              if (!(b.grid[_h265] !== 0)) { if (fire === null) { b.placeAt(_h265, 2); changed = true; } else facts.push(PLACE, _h265, 2); }
              let _c267: boolean = true;
              if (_c267) {
                const _t266 = sp.adj4Edges[v_c][_i259];
                if (!(b.grid[_t266] !== 0)) { if (fire === null) { b.placeAt(_t266, 2); changed = true; } else facts.push(PLACE, _t266, 2); }
                _c267 = true;
              }
              _c268 = _c267;
            }
            let _c277: boolean = _c268;
            if (_c277) {
              let _c276: boolean = !((((walls(b, sp, v_c) + 2) <= _h264) && ((opens(b, sp, v_c) + 2) > _h273)));
              if (!_c276) {
                if (!(b.grid[_h265] !== 0)) { if (fire === null) { b.placeAt(_h265, 1); changed = true; } else facts.push(PLACE, _h265, 1); }
                let _c275: boolean = true;
                if (_c275) {
                  const _t274 = sp.adj4Edges[v_c][_i259];
                  if (!(b.grid[_t274] !== 0)) { if (fire === null) { b.placeAt(_t274, 1); changed = true; } else facts.push(PLACE, _t274, 1); }
                  _c275 = true;
                }
                _c276 = _c275;
              }
              _c277 = _c276;
            }
            if (!(_c277)) return -1;
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
  const _g286: number[] = [];
  const facts = insideFacts;
  let fired = 0;
  let changed = false;
  _g286.length = 0;
  G287: {
    const _a290 = sp.edges;
    for (let _i291 = 0; _i291 < _a290.length; _i291++) {
      const v_e = _a290[_i291];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g286.push(v_e);
    }
  }
  const v_O = _g286;
  const _eg294 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a292 = sp.edges;
  for (let _i293 = 0; _i293 < _a292.length; _i293++) {
    const v_e = _a292[_i293];
    if (!((((b.grid[v_e] || -1) !== 2) && (_eg294.of(sp.edgeEnds[2 * v_e + 1]) === _eg294.of(sp.edgeEnds[2 * v_e]))))) continue;
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
  let _g260 = 0;
  G261: {
    const _a262 = sp.adj4[v_c];
    for (let _i263 = 0; _i263 < _a262.length; _i263++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i263]] || -1) === 1))) continue;
      _g260++;
    }
  }
  const _made = ((4 - sp.adj4[v_c].length) + _g260);
  _kept[v_c] = _made;
  return _made;
}

const opensKept = keptStore<number>();

/** `opens(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function opens(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = opensKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g269 = 0;
  G270: {
    const _a271 = sp.adj4[v_c];
    for (let _i272 = 0; _i272 < _a271.length; _i272++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i272]] || -1) === 2))) continue;
      _g269++;
    }
  }
  const _made = _g269;
  _kept[v_c] = _made;
  return _made;
}
