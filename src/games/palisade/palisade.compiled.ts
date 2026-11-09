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
  const _g313: number[] = [];
  const _g326: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q311 = true;
  Q312: {
    _g313.length = 0;
    G314: {
      const _a317 = sp.edges;
      for (let _i318 = 0; _i318 < _a317.length; _i318++) {
        const v_e = _a317[_i318];
        const _h319 = (g[v_e] || -1);
        if (!((_h319 === 2))) continue;
        _g313.push(v_e);
      }
    }
    const v_O = _g313;
    const _eg323 = edgeGroups(sp, v_O);
    const _a320 = sp.edges;
    for (let _i321 = 0; _i321 < _a320.length; _i321++) {
      const v_e = _a320[_i321];
      const _h322 = (g[v_e] || -1);
      if (!(((_h322 === 1) === !(_eg323.of(sp.edgeEnds[2 * v_e + 1]) === _eg323.of(sp.edgeEnds[2 * v_e]))))) {
        _q311 = false;
        break Q312;
      }
    }
  }
  if (!(_q311)) return false;
  let _q324 = true;
  Q325: {
    _g326.length = 0;
    G327: {
      const _a330 = sp.edges;
      for (let _i331 = 0; _i331 < _a330.length; _i331++) {
        const v_e = _a330[_i331];
        const _h332 = (g[v_e] || -1);
        if (!((_h332 === 2))) continue;
        _g326.push(v_e);
      }
    }
    const v_O = _g326;
    const _eg335 = edgeGroups(sp, v_O);
    const _a333 = sp.cells;
    for (let _i334 = 0; _i334 < _a333.length; _i334++) {
      const v_c = _a333[_i334];
      const _h336 = _eg335.of(v_c).length;
      if (!((_h336 === cl.k))) {
        _q324 = false;
        break Q325;
      }
    }
  }
  if (!(_q324)) return false;
  for (let _k337 = 0; _k337 < cl.number.at.length; _k337++) {
    const _at338 = cl.number.at[_k337];
    const _v339 = cl.number.v[_k337];
    let _g340 = 0;
    G341: {
      const _a342 = sp.adj4[_at338];
      for (let _i343 = 0; _i343 < _a342.length; _i343++) {
        const _h344 = (g[sp.adj4Edges[_at338][_i343]] || -1);
        if (!((_h344 === 1))) continue;
        _g340++;
      }
    }
    if (!((((4 - sp.adj4[_at338].length) + _g340) === _v339))) return false;
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
  const _g73: number[] = [];
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
          _g73.length = 0;
          G74: {
            const _a77 = sp.edges;
            for (let _i78 = 0; _i78 < _a77.length; _i78++) {
              const v_e = _a77[_i78];
              if (!(((b.grid[v_e] || -1) === 2))) continue;
              _g73.push(v_e);
            }
          }
          if (!(sameSet(v_O, _g73))) { return fired; }
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
const _st133 = stamps();

/** Its dearest read grows with the board as n. */
export function notTooSmall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooSmallBinding> | null): number {
  const _g110: number[] = [];
  const _g121: number[] = [];
  const _g136: number[] = [];
  const _g145: number[] = [];
  const facts = notTooSmallFacts;
  let fired = 0;
  let changed = false;
  const _m75_0 = b.made[0];
  _g110.length = 0;
  G111: {
    const _a114 = sp.edges;
    for (let _i115 = 0; _i115 < _a114.length; _i115++) {
      const v_e = _a114[_i115];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g110.push(v_e);
    }
  }
  const v_O = _g110;
  const _m78_1 = b.made[1];
  const _eg118 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a116 = sp.cells;
  for (let _i117 = 0; _i117 < _a116.length; _i117++) {
    const v_c = _a116[_i117];
    L119: {
      const v_A = _eg118.of(v_c);
      const _h120 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h120 !== cl.k)))) break L119;
      _g121.length = 0;
      _st133.pass++;
      G122: {
        const _a134 = v_A;
        for (let _i135 = 0; _i135 < _a134.length; _i135++) {
          const v_x = _a134[_i135];
          _g136.length = 0;
          G137: {
            const _a140 = sp.adj4[v_x];
            for (let _i141 = 0; _i141 < _a140.length; _i141++) {
              const v_y = _a140[_i141];
              if (!(!((b.grid[sp.adj4Edges[v_x][_i141]] !== 0)))) continue;
              _g136.push(v_y);
            }
          }
          const _a142 = _g136;
          for (let _i143 = 0; _i143 < _a142.length; _i143++) {
            const v_s = _a142[_i143];
            const _t144 = v_s;
            if (_g121.length < 16) { if (!_g121.includes(_t144)) _g121.push(_t144); } else addOnce(_g121, _st133, _t144);
          }
        }
      }
      const v_S = _g121;
      const _h151 = v_S.length;
      if (b.made[0] !== _m75_0 || b.made[1] !== _m78_1) {
        _g145.length = 0;
        G146: {
          const _a149 = sp.edges;
          for (let _i150 = 0; _i150 < _a149.length; _i150++) {
            const v_e = _a149[_i150];
            if (!(((b.grid[v_e] || -1) === 2))) continue;
            _g145.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g145))) { return fired; }
      }
      facts.length = 0;
      changed = false;
      let _c166: boolean = ((_h120 < cl.k) && (_h151 > 0));
      if (_c166) {
        let _q152 = true;
        Q153: {
          const v_B = _eg118.of((v_S[0] ?? -1));
          let _q154 = true;
          Q155: {
            const _a156 = v_S;
            for (let _i157 = 0; _i157 < _a156.length; _i157++) {
              const v_s = _a156[_i157];
              if (!((_eg118.of(v_s) === v_B))) {
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
                  if (!((_eg118.of(v_y) === v_B))) continue;
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
const _st200 = stamps();

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
    _st200.pass++;
    G195: {
      const _a201 = v_C;
      for (let _i202 = 0; _i202 < _a201.length; _i202++) {
        const v_x = _a201[_i202];
        const _a203 = sp.adj4[v_x];
        for (let _i204 = 0; _i204 < _a203.length; _i204++) {
          const v_y = _a203[_i204];
          if (!((v_C.includes(v_y)))) continue;
          const _t205 = sp.adj4Edges[v_x][_i204];
          const _t206 = _t205;
          if (_g194.length < 16) { if (!_g194.includes(_t206)) _g194.push(_t206); } else addOnce(_g194, _st200, _t206);
        }
      }
    }
    const v_F = _g194;
    const _a207 = v_F;
    for (let _i208 = 0; _i208 < _a207.length; _i208++) {
      const v_f = _a207[_i208];
      let _c213: boolean = !((b.grid[v_f] !== 0));
      if (_c213) {
        let _g209 = 0;
        G210: {
          const _a211 = v_F;
          for (let _i212 = 0; _i212 < _a211.length; _i212++) {
            const v_e = _a211[_i212];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g209++;
          }
        }
        _c213 = (_g209 === 1);
      }
      let _c218: boolean = _c213;
      if (_c218) {
        let _g214 = 0;
        G215: {
          const _a216 = v_F;
          for (let _i217 = 0; _i217 < _a216.length; _i217++) {
            const v_e = _a216[_i217];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g214++;
          }
        }
        _c218 = (_g214 === 1);
      }
      if (!(_c218)) continue;
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
  const _g238: number[] = [];
  const _g245: number[] = [];
  const _g258: number[] = [];
  const _g264: number[] = [];
  const facts = equivalentEdgesFacts;
  let fired = 0;
  let changed = false;
  const _m131_0 = b.made[0];
  _g238.length = 0;
  G239: {
    const _a242 = sp.edges;
    for (let _i243 = 0; _i243 < _a242.length; _i243++) {
      const v_e = _a242[_i243];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g238.push(v_e);
    }
  }
  const v_O = _g238;
  const _m134_1 = b.made[1];
  const _eg253 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _h274 = cl.number.v[v_q];
    const _h283 = (4 - _h274);
    L244: {
      const v_c = cl.number.at[v_q];
      if (!(((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)))) break L244;
      _g245.length = 0;
      G246: {
        const _a249 = sp.adj4[v_c];
        for (let _i250 = 0; _i250 < _a249.length; _i250++) {
          const v_y = _a249[_i250];
          if (!(!((b.grid[sp.adj4Edges[v_c][_i250]] !== 0)))) continue;
          _g245.push(v_y);
        }
      }
      const _a251 = _g245;
      R2:
      for (let _i252 = 0; _i252 < _a251.length; _i252++) {
        const v_y = _a251[_i252];
        if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) continue;
        const _h275 = sp.edgeOf(v_c, v_y);
        L254: {
          const v_R = _eg253.of(v_y);
          if (!(!(_eg253.of(v_c) === v_R))) break L254;
          const _a255 = sp.adj4[v_c];
          const _n256 = _a255.indexOf(v_y);
          for (let _i257 = 0; _i257 < _n256; _i257++) {
            const v_z = _a255[_i257];
            if (!((!((b.grid[sp.adj4Edges[v_c][_i257]] !== 0)) && (_eg253.of(v_z) === v_R)))) continue;
            if (b.made[0] !== _m131_0 || b.made[1] !== _m134_1) {
              _g258.length = 0;
              G259: {
                const _a262 = sp.edges;
                for (let _i263 = 0; _i263 < _a262.length; _i263++) {
                  const v_e = _a262[_i263];
                  if (!(((b.grid[v_e] || -1) === 2))) continue;
                  _g258.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g258))) { return fired; }
              _g264.length = 0;
              G265: {
                const _a268 = sp.adj4[v_c];
                for (let _i269 = 0; _i269 < _a268.length; _i269++) {
                  const v_y = _a268[_i269];
                  if (!(!((b.grid[sp.adj4Edges[v_c][_i269]] !== 0)))) continue;
                  _g264.push(v_y);
                }
              }
              if (!((_g264.includes(v_y)))) { continue R2; }
              if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) { continue R2; }
            }
            facts.length = 0;
            changed = false;
            let _c278: boolean = !(((walls(b, sp, v_c) + 2) > _h274));
            if (!_c278) {
              if (!(b.grid[_h275] !== 0)) { if (fire === null) { b.placeAt(_h275, 2); changed = true; } else facts.push(PLACE, _h275, 2); }
              let _c277: boolean = true;
              if (_c277) {
                const _t276 = sp.adj4Edges[v_c][_i257];
                if (!(b.grid[_t276] !== 0)) { if (fire === null) { b.placeAt(_t276, 2); changed = true; } else facts.push(PLACE, _t276, 2); }
                _c277 = true;
              }
              _c278 = _c277;
            }
            let _c287: boolean = _c278;
            if (_c287) {
              let _c286: boolean = !((((walls(b, sp, v_c) + 2) <= _h274) && ((opens(b, sp, v_c) + 2) > _h283)));
              if (!_c286) {
                if (!(b.grid[_h275] !== 0)) { if (fire === null) { b.placeAt(_h275, 1); changed = true; } else facts.push(PLACE, _h275, 1); }
                let _c285: boolean = true;
                if (_c285) {
                  const _t284 = sp.adj4Edges[v_c][_i257];
                  if (!(b.grid[_t284] !== 0)) { if (fire === null) { b.placeAt(_t284, 1); changed = true; } else facts.push(PLACE, _t284, 1); }
                  _c285 = true;
                }
                _c286 = _c285;
              }
              _c287 = _c286;
            }
            if (!(_c287)) return -1;
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
  const _g296: number[] = [];
  const _g305: number[] = [];
  const facts = insideFacts;
  let fired = 0;
  let changed = false;
  const _m163_0 = b.made[0];
  _g296.length = 0;
  G297: {
    const _a300 = sp.edges;
    for (let _i301 = 0; _i301 < _a300.length; _i301++) {
      const v_e = _a300[_i301];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g296.push(v_e);
    }
  }
  const v_O = _g296;
  const _m166_1 = b.made[1];
  const _eg304 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a302 = sp.edges;
  for (let _i303 = 0; _i303 < _a302.length; _i303++) {
    const v_e = _a302[_i303];
    if (!((((b.grid[v_e] || -1) !== 2) && (_eg304.of(sp.edgeEnds[2 * v_e + 1]) === _eg304.of(sp.edgeEnds[2 * v_e]))))) continue;
    if (b.made[0] !== _m163_0 || b.made[1] !== _m166_1) {
      _g305.length = 0;
      G306: {
        const _a309 = sp.edges;
        for (let _i310 = 0; _i310 < _a309.length; _i310++) {
          const v_e = _a309[_i310];
          if (!(((b.grid[v_e] || -1) === 2))) continue;
          _g305.push(v_e);
        }
      }
      if (!(sameSet(v_O, _g305))) { return fired; }
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
  let _g270 = 0;
  G271: {
    const _a272 = sp.adj4[v_c];
    for (let _i273 = 0; _i273 < _a272.length; _i273++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i273]] || -1) === 1))) continue;
      _g270++;
    }
  }
  const _made = ((4 - sp.adj4[v_c].length) + _g270);
  _kept[v_c] = _made;
  return _made;
}

const opensKept = keptStore<number>();

/** `opens(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function opens(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = opensKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g279 = 0;
  G280: {
    const _a281 = sp.adj4[v_c];
    for (let _i282 = 0; _i282 < _a281.length; _i282++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i282]] || -1) === 2))) continue;
      _g279++;
    }
  }
  const _made = _g279;
  _kept[v_c] = _made;
  return _made;
}
