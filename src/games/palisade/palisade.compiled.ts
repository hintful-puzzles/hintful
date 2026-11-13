// Compiled by `npm run describe` from src/games/palisade/palisade.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, before, clueAt, edgeGroups, freshBinding, keptEdgeGroups, keptStore, rangeMask, sameSet, setOf, staleChecking, stamps, through, type Kept, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  cluesVersusRegionSize: CluesVersusRegionSizeSays;
  numberExhausted: NumberExhaustedSays;
  notTooBig: NotTooBigSays;
  notTooSmall: NotTooSmallSays;
  noDanglingEdges: NoDanglingEdgesSays;
  equivalentEdges: EquivalentEdgesSays;
  inside: InsideSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["cluesVersusRegionSize","numberExhausted","notTooBig","notTooSmall","noDanglingEdges","equivalentEdges","inside"] as const;

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
  const _g3: number[] = [];
  const _g16: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    _g3.length = 0;
    G4: {
      const _a7 = sp.edges;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_e = _a7[_i8];
        const _h9 = (g[v_e] || -1);
        if (!((_h9 === 2))) continue;
        _g3.push(v_e);
      }
    }
    const v_O = _g3;
    const _eg13 = edgeGroups(sp, v_O);
    const _a10 = sp.edges;
    for (let _i11 = 0; _i11 < _a10.length; _i11++) {
      const v_e = _a10[_i11];
      const _h12 = (g[v_e] || -1);
      if (!(((_h12 === 1) === !(_eg13.of(sp.edgeEnds[2 * v_e + 1]) === _eg13.of(sp.edgeEnds[2 * v_e]))))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q14 = true;
  Q15: {
    _g16.length = 0;
    G17: {
      const _a20 = sp.edges;
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_e = _a20[_i21];
        const _h22 = (g[v_e] || -1);
        if (!((_h22 === 2))) continue;
        _g16.push(v_e);
      }
    }
    const v_O = _g16;
    const _eg25 = edgeGroups(sp, v_O);
    const _a23 = sp.cells;
    for (let _i24 = 0; _i24 < _a23.length; _i24++) {
      const v_c = _a23[_i24];
      const _h26 = _eg25.of(v_c).length;
      if (!((_h26 === cl.k))) {
        _q14 = false;
        break Q15;
      }
    }
  }
  if (!(_q14)) return false;
  for (let _k27 = 0; _k27 < cl.number.at.length; _k27++) {
    const _at28 = cl.number.at[_k27];
    const _v29 = cl.number.v[_k27];
    let _g30 = 0;
    G31: {
      const _a32 = sp.adj4[_at28];
      for (let _i33 = 0; _i33 < _a32.length; _i33++) {
        const _h34 = (g[sp.adj4Edges[_at28][_i33]] || -1);
        if (!((_h34 === 1))) continue;
        _g30++;
      }
    }
    if (!((((4 - sp.adj4[_at28].length) + _g30) === _v29))) return false;
  }
  return true;
}

export interface CluesVersusRegionSizeBinding {
  q: number;
  a: number;
  b: number;
  d: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CluesVersusRegionSizeSays {
  terms: { anchor: readonly number[]; c: number; d: number; size: number; };
  marks: { outline: readonly number[]; };
}

const cluesVersusRegionSizeFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function cluesVersusRegionSize(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CluesVersusRegionSizeBinding, CluesVersusRegionSizeSays> | null): number {
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
        if (DEV && staleChecking) {
          freshBinding("cluesVersusRegionSize", [(v_a === cl.number.at[v_q]), (sp.adj4[v_a].includes(v_b)), !((b.grid[sp.adj4Edges[v_a][_i5]] !== 0)), (v_d === clueAt(cl.number, v_b)), ((v_d !== -1) && ((((8 - cl.number.v[v_q]) - v_d) > cl.k) || (((cl.number.v[v_q] === 3) && (v_d === 3)) && (cl.k !== 2))))], ["a =", "b in", "where of b", "d =", "where of d"]);
        }
        facts.length = 0;
        changed = false;
        const _t12 = sp.adj4Edges[v_a][_i5];
        if (!(b.grid[_t12] !== 0)) { if (fire === null) { b.placeAt(_t12, 1); changed = true; } else facts.push(PLACE, _t12, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { anchor: setOf(v_a).slice(), c: _h8, d: v_d, size: cl.k }, marks: { outline: setOf(v_a, v_b).slice() } };
            if (!fire({ q: v_q, a: v_a, b: v_b, d: v_d }, facts, _says)) return 1;
          }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface NumberExhaustedSays {
  terms: { anchor: readonly number[]; clue: number; };
  marks: { outline: readonly number[]; };
}

const numberExhaustedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function numberExhausted(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NumberExhaustedBinding, NumberExhaustedSays> | null): number {
  const _g12: number[] = [];
  const facts = numberExhaustedFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const v_c = cl.number.at[v_q];
    _g12.length = 0;
    G13: {
      const _a16 = sp.adj4[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_y = _a16[_i17];
        if (!(!((b.grid[sp.adj4Edges[v_c][_i17]] !== 0)))) continue;
        _g12.push(v_y);
      }
    }
    const v_U = _g12;
    const _h23 = v_U.length;
    let _g18 = 0;
    G19: {
      const _a20 = sp.adj4[v_c];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i21]] || -1) === 1))) continue;
        _g18++;
      }
    }
    L22: {
      const v_n = ((4 - sp.adj4[v_c].length) + _g18);
      if (!((((_h23 > 0) || (v_n !== cl.number.v[v_q])) && ((v_n >= cl.number.v[v_q]) || ((v_n + _h23) <= cl.number.v[v_q]))))) break L22;
      if (DEV && staleChecking) {
        const _g24: number[] = [];
        G25: {
          const _a28 = sp.adj4[v_c];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_y = _a28[_i29];
            if (!(!((b.grid[sp.adj4Edges[v_c][_i29]] !== 0)))) continue;
            _g24.push(v_y);
          }
        }
        let _g30 = 0;
        G31: {
          const _a32 = sp.adj4[v_c];
          for (let _i33 = 0; _i33 < _a32.length; _i33++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i33]] || -1) === 1))) continue;
            _g30++;
          }
        }
        freshBinding("numberExhausted", [(v_c === cl.number.at[v_q]), sameSet(v_U, _g24), (v_n === ((4 - sp.adj4[v_c].length) + _g30)), (((v_U.length > 0) || (v_n !== cl.number.v[v_q])) && ((v_n >= cl.number.v[v_q]) || ((v_n + v_U.length) <= cl.number.v[v_q])))], ["c =", "U =", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c40: boolean = ((v_n <= cl.number.v[v_q]) && ((v_n + _h23) >= cl.number.v[v_q]));
      if (_c40) {
        let _c39: boolean = !((v_n === cl.number.v[v_q]));
        if (!_c39) {
          let _q34 = true;
          Q35: {
            const _a36 = v_U;
            for (let _i37 = 0; _i37 < _a36.length; _i37++) {
              const v_y = _a36[_i37];
              const _t38 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t38] !== 0)) { if (fire === null) { b.placeAt(_t38, 2); changed = true; } else facts.push(PLACE, _t38, 2); }
              if (!(true)) {
                _q34 = false;
                break Q35;
              }
            }
          }
          _c39 = _q34;
        }
        _c40 = _c39;
      }
      let _c47: boolean = _c40;
      if (_c47) {
        let _c46: boolean = !((v_n < cl.number.v[v_q]));
        if (!_c46) {
          let _q41 = true;
          Q42: {
            const _a43 = v_U;
            for (let _i44 = 0; _i44 < _a43.length; _i44++) {
              const v_y = _a43[_i44];
              const _t45 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t45] !== 0)) { if (fire === null) { b.placeAt(_t45, 1); changed = true; } else facts.push(PLACE, _t45, 1); }
              if (!(true)) {
                _q41 = false;
                break Q42;
              }
            }
          }
          _c46 = _q41;
        }
        _c47 = _c46;
      }
      if (!(_c47)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { anchor: setOf(v_c).slice(), clue: cl.number.v[v_q] }, marks: { outline: setOf(v_c).slice() } };
          if (!fire({ q: v_q, c: v_c, U: v_U.slice(), n: v_n }, facts, _says)) return 1;
        }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface NotTooBigSays {
  terms: { anchor: readonly number[]; joined: number; size: number; };
  marks: { outline: readonly number[]; };
}

const notTooBigFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function notTooBig(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooBigBinding, NotTooBigSays> | null): number {
  const _g11: number[] = [];
  const facts = notTooBigFacts;
  let fired = 0;
  let changed = false;
  const _m33_0 = b.made[0];
  _g11.length = 0;
  G12: {
    const _a15 = sp.edges;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_e = _a15[_i16];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g11.push(v_e);
    }
  }
  const v_O = _g11;
  const _m34_1 = b.made[1];
  const _eg19 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a17 = sp.edges;
  R1:
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_e = _a17[_i18];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg19.of(sp.edgeEnds[2 * v_e]);
    const _h22 = v_A.length;
    L20: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg19.of(v_b) === v_A))) break L20;
      L21: {
        const v_B = _eg19.of(v_b);
        const _h23 = v_B.length;
        if (!(((_h22 + _h23) > cl.k))) break L21;
        if (b.made[0] !== _m33_0 || b.made[1] !== _m34_1) {
          const _now24 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
          if (!(_now24 === _eg19.of(sp.edgeEnds[2 * v_e]) || sameSet(_now24, _eg19.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
          const _now25 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
          if (!(_now25 === _eg19.of(v_b) || sameSet(_now25, _eg19.of(v_b)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          const _g26: number[] = [];
          G27: {
            const _a30 = sp.edges;
            for (let _i31 = 0; _i31 < _a30.length; _i31++) {
              const v_e = _a30[_i31];
              if (!(((b.grid[v_e] || -1) === 2))) continue;
              _g26.push(v_e);
            }
          }
          const _fg32 = edgeGroups(sp, _g26);
          freshBinding("notTooBig", [sameSet(_fg32.of(sp.edgeEnds[2 * v_e]), _eg19.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg32.of(v_b), _eg19.of(v_b)), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_e], v_O)), (v_b === sp.edgeEnds[2 * v_e + 1]), !(_eg19.of(v_b) === v_A), sameSet(v_B, through(sp, v_b, v_O)), ((v_A.length + v_B.length) > cl.k)], ["O's groups", "e in", "where of e", "A =", "b =", "where of b", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { anchor: v_A.slice(), joined: (_h22 + _h23), size: cl.k }, marks: { outline: union(v_A, v_B).slice() } };
            if (!fire({ O: v_O.slice(), e: v_e, A: v_A.slice(), b: v_b, B: v_B.slice() }, facts, _says)) return 1;
          }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface NotTooSmallSays {
  terms: { anchor: readonly number[]; have: number; size: number; };
  marks: { stripes: readonly number[]; reads: readonly number[]; };
}

const notTooSmallFacts: number[] = [];
const notTooSmall_st55 = stamps();

/** Its dearest read grows with the board as n. */
export function notTooSmall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooSmallBinding, NotTooSmallSays> | null): number {
  const _g32: number[] = [];
  const _g43: number[] = [];
  const _g58: number[] = [];
  const facts = notTooSmallFacts;
  let fired = 0;
  let changed = false;
  const _m114_0 = b.made[0];
  _g32.length = 0;
  G33: {
    const _a36 = sp.edges;
    for (let _i37 = 0; _i37 < _a36.length; _i37++) {
      const v_e = _a36[_i37];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g32.push(v_e);
    }
  }
  const v_O = _g32;
  const _m115_1 = b.made[1];
  const _eg40 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a38 = sp.cells;
  R1:
  for (let _i39 = 0; _i39 < _a38.length; _i39++) {
    const v_c = _a38[_i39];
    L41: {
      const v_A = _eg40.of(v_c);
      const _h42 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h42 !== cl.k)))) break L41;
      _g43.length = 0;
      notTooSmall_st55.pass++;
      G44: {
        const _a56 = v_A;
        for (let _i57 = 0; _i57 < _a56.length; _i57++) {
          const v_x = _a56[_i57];
          _g58.length = 0;
          G59: {
            const _a62 = sp.adj4[v_x];
            for (let _i63 = 0; _i63 < _a62.length; _i63++) {
              const v_y = _a62[_i63];
              if (!(!((b.grid[sp.adj4Edges[v_x][_i63]] !== 0)))) continue;
              _g58.push(v_y);
            }
          }
          const _a64 = _g58;
          for (let _i65 = 0; _i65 < _a64.length; _i65++) {
            const v_s = _a64[_i65];
            const _t66 = v_s;
            if (_g43.length < 16) { if (!_g43.includes(_t66)) _g43.push(_t66); } else addOnce(_g43, notTooSmall_st55, _t66);
          }
        }
      }
      const v_S = _g43;
      const _h98 = v_S.length;
      if (b.made[0] !== _m114_0 || b.made[1] !== _m115_1) {
        const _now67 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_c);
        if (!(_now67 === _eg40.of(v_c) || sameSet(_now67, _eg40.of(v_c)))) { continue R1; }
        const _now68 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of((v_S[0] ?? -1));
        if (!(_now68 === _eg40.of((v_S[0] ?? -1)) || sameSet(_now68, _eg40.of((v_S[0] ?? -1))))) { continue R1; }
      }
      if (DEV && staleChecking) {
        const _g69: number[] = [];
        G70: {
          const _a73 = sp.edges;
          for (let _i74 = 0; _i74 < _a73.length; _i74++) {
            const v_e = _a73[_i74];
            if (!(((b.grid[v_e] || -1) === 2))) continue;
            _g69.push(v_e);
          }
        }
        const _fg75 = edgeGroups(sp, _g69);
        const _g76: number[] = [];
        G77: {
          const _a88 = v_A;
          for (let _i89 = 0; _i89 < _a88.length; _i89++) {
            const v_x = _a88[_i89];
            const _g90: number[] = [];
            G91: {
              const _a94 = sp.adj4[v_x];
              for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                const v_y = _a94[_i95];
                if (!(!((b.grid[sp.adj4Edges[v_x][_i95]] !== 0)))) continue;
                _g90.push(v_y);
              }
            }
            const _a96 = _g90;
            for (let _i97 = 0; _i97 < _a96.length; _i97++) {
              const v_s = _a96[_i97];
              if (!_g76.includes(v_s)) _g76.push(v_s);
            }
          }
        }
        freshBinding("notTooSmall", [sameSet(_fg75.of(v_c), _eg40.of(v_c)) && sameSet(_fg75.of((v_S[0] ?? -1)), _eg40.of((v_S[0] ?? -1))), (sp.cells.includes(v_c)), sameSet(v_A, through(sp, v_c, v_O)), ((v_c === (v_A[0] ?? -1)) && (v_A.length !== cl.k)), sameSet(v_S, _g76)], ["O's groups", "c in", "A =", "where of A", "S ="]);
      }
      facts.length = 0;
      changed = false;
      let _c113: boolean = ((_h42 < cl.k) && (_h98 > 0));
      if (_c113) {
        let _q99 = true;
        Q100: {
          const v_B = _eg40.of((v_S[0] ?? -1));
          let _q101 = true;
          Q102: {
            const _a103 = v_S;
            for (let _i104 = 0; _i104 < _a103.length; _i104++) {
              const v_s = _a103[_i104];
              if (!((_eg40.of(v_s) === v_B))) {
                _q101 = false;
                break Q102;
              }
            }
          }
          let _c112: boolean = !(_q101);
          if (!_c112) {
            let _q105 = true;
            Q106: {
              const _a107 = v_A;
              for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                const v_x = _a107[_i108];
                const _a109 = sp.adj4[v_x];
                for (let _i110 = 0; _i110 < _a109.length; _i110++) {
                  const v_y = _a109[_i110];
                  if (!((_eg40.of(v_y) === v_B))) continue;
                  const _t111 = sp.adj4Edges[v_x][_i110];
                  if (!(b.grid[_t111] !== 0)) { if (fire === null) { b.placeAt(_t111, 2); changed = true; } else facts.push(PLACE, _t111, 2); }
                  if (!(true)) {
                    _q105 = false;
                    break Q106;
                  }
                }
              }
            }
            _c112 = _q105;
          }
          if (!(_c112)) {
            _q99 = false;
            break Q100;
          }
        }
        _c113 = _q99;
      }
      if (!(_c113)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { anchor: v_A.slice(), have: _h42, size: cl.k }, marks: { stripes: v_A.slice(), reads: v_A.slice() } };
          if (!fire({ O: v_O.slice(), c: v_c, A: v_A.slice(), S: v_S.slice() }, facts, _says)) return 1;
        }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface NoDanglingEdgesSays {
  terms: { anchor: readonly number[]; };
  marks: { outline: readonly number[]; };
}

const noDanglingEdgesFacts: number[] = [];
const noDanglingEdges_st34 = stamps();

/** Its dearest read grows with the board as n. */
export function noDanglingEdges(b: Marks, sp: GridSpace, fire: Fire<NoDanglingEdgesBinding, NoDanglingEdgesSays> | null): number {
  const _g28: number[] = [];
  const facts = noDanglingEdgesFacts;
  let fired = 0;
  let changed = false;
  const _a26 = sp.corners;
  for (let _i27 = 0; _i27 < _a26.length; _i27++) {
    const v_p = _a26[_i27];
    const v_C = sp.cornerCells[v_p];
    _g28.length = 0;
    noDanglingEdges_st34.pass++;
    G29: {
      const _a35 = v_C;
      for (let _i36 = 0; _i36 < _a35.length; _i36++) {
        const v_x = _a35[_i36];
        const _a37 = sp.adj4[v_x];
        for (let _i38 = 0; _i38 < _a37.length; _i38++) {
          const v_y = _a37[_i38];
          if (!((v_C.includes(v_y)))) continue;
          const _t39 = sp.adj4Edges[v_x][_i38];
          const _t40 = _t39;
          if (_g28.length < 16) { if (!_g28.includes(_t40)) _g28.push(_t40); } else addOnce(_g28, noDanglingEdges_st34, _t40);
        }
      }
    }
    const v_F = _g28;
    const _a41 = v_F;
    for (let _i42 = 0; _i42 < _a41.length; _i42++) {
      const v_f = _a41[_i42];
      let _c47: boolean = !((b.grid[v_f] !== 0));
      if (_c47) {
        let _g43 = 0;
        G44: {
          const _a45 = v_F;
          for (let _i46 = 0; _i46 < _a45.length; _i46++) {
            const v_e = _a45[_i46];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g43++;
          }
        }
        _c47 = (_g43 === 1);
      }
      let _c52: boolean = _c47;
      if (_c52) {
        let _g48 = 0;
        G49: {
          const _a50 = v_F;
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_e = _a50[_i51];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g48++;
          }
        }
        _c52 = (_g48 === 1);
      }
      if (!(_c52)) continue;
      if (DEV && staleChecking) {
        const _g53: number[] = [];
        G54: {
          const _a59 = v_C;
          for (let _i60 = 0; _i60 < _a59.length; _i60++) {
            const v_x = _a59[_i60];
            const _a61 = sp.adj4[v_x];
            for (let _i62 = 0; _i62 < _a61.length; _i62++) {
              const v_y = _a61[_i62];
              if (!((v_C.includes(v_y)))) continue;
              const _t63 = sp.adj4Edges[v_x][_i62];
              if (!_g53.includes(_t63)) _g53.push(_t63);
            }
          }
        }
        let _c68: boolean = !((b.grid[v_f] !== 0));
        if (_c68) {
          let _g64 = 0;
          G65: {
            const _a66 = v_F;
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              const v_e = _a66[_i67];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g64++;
            }
          }
          _c68 = (_g64 === 1);
        }
        let _c73: boolean = _c68;
        if (_c73) {
          let _g69 = 0;
          G70: {
            const _a71 = v_F;
            for (let _i72 = 0; _i72 < _a71.length; _i72++) {
              const v_e = _a71[_i72];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g69++;
            }
          }
          _c73 = (_g69 === 1);
        }
        freshBinding("noDanglingEdges", [(sp.corners.includes(v_p)), sameSet(v_C, sp.cornerCells[v_p]), sameSet(v_F, _g53), (v_F.includes(v_f)), _c73], ["p in", "C =", "F =", "f in", "where of f"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { anchor: v_C.slice() }, marks: { outline: v_C.slice() } };
          if (!fire({ p: v_p, C: v_C.slice(), F: v_F.slice(), f: v_f }, facts, _says)) return 1;
        }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface EquivalentEdgesSays {
  terms: { anchor: readonly number[]; clue: number; };
  marks: { stripes: readonly number[]; reads: readonly number[]; };
}

const equivalentEdgesFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function equivalentEdges(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EquivalentEdgesBinding, EquivalentEdgesSays> | null): number {
  const _g20: number[] = [];
  const _g27: number[] = [];
  const _g41: number[] = [];
  const facts = equivalentEdgesFacts;
  let fired = 0;
  let changed = false;
  const _m71_0 = b.made[0];
  _g20.length = 0;
  G21: {
    const _a24 = sp.edges;
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      const v_e = _a24[_i25];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g20.push(v_e);
    }
  }
  const v_O = _g20;
  const _m72_1 = b.made[1];
  const _eg35 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _h60 = cl.number.v[v_q];
    const _h65 = (4 - _h60);
    L26: {
      const v_c = cl.number.at[v_q];
      if (!(((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)))) break L26;
      _g27.length = 0;
      G28: {
        const _a31 = sp.adj4[v_c];
        for (let _i32 = 0; _i32 < _a31.length; _i32++) {
          const v_y = _a31[_i32];
          if (!(!((b.grid[sp.adj4Edges[v_c][_i32]] !== 0)))) continue;
          _g27.push(v_y);
        }
      }
      const _a33 = _g27;
      R2:
      for (let _i34 = 0; _i34 < _a33.length; _i34++) {
        const v_y = _a33[_i34];
        if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) continue;
        const _h61 = sp.edgeOf(v_c, v_y);
        L36: {
          const v_R = _eg35.of(v_y);
          if (!(!(_eg35.of(v_c) === v_R))) break L36;
          const _h70 = union(setOf(v_c), v_R);
          const _a37 = sp.adj4[v_c];
          const _n38 = _a37.indexOf(v_y);
          for (let _i39 = 0; _i39 < _n38; _i39++) {
            const v_z = _a37[_i39];
            if (!((!((b.grid[sp.adj4Edges[v_c][_i39]] !== 0)) && (_eg35.of(v_z) === v_R)))) continue;
            if (b.made[0] !== _m71_0 || b.made[1] !== _m72_1) {
              const _now40 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_y);
              if (!(_now40 === _eg35.of(v_y) || sameSet(_now40, _eg35.of(v_y)))) { continue R2; }
              _g41.length = 0;
              G42: {
                const _a45 = sp.adj4[v_c];
                for (let _i46 = 0; _i46 < _a45.length; _i46++) {
                  const v_y = _a45[_i46];
                  if (!(!((b.grid[sp.adj4Edges[v_c][_i46]] !== 0)))) continue;
                  _g41.push(v_y);
                }
              }
              if (!((_g41.includes(v_y)))) { continue R2; }
              if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) { continue R2; }
            }
            if (DEV && staleChecking) {
              const _g47: number[] = [];
              G48: {
                const _a51 = sp.edges;
                for (let _i52 = 0; _i52 < _a51.length; _i52++) {
                  const v_e = _a51[_i52];
                  if (!(((b.grid[v_e] || -1) === 2))) continue;
                  _g47.push(v_e);
                }
              }
              const _fg53 = edgeGroups(sp, _g47);
              const _g54: number[] = [];
              G55: {
                const _a58 = sp.adj4[v_c];
                for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                  const v_y = _a58[_i59];
                  if (!(!((b.grid[sp.adj4Edges[v_c][_i59]] !== 0)))) continue;
                  _g54.push(v_y);
                }
              }
              freshBinding("equivalentEdges", [sameSet(_fg53.of(v_y), _eg35.of(v_y)), (v_c === cl.number.at[v_q]), ((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)), (_g54.includes(v_y)), !((b.grid[sp.edgeOf(v_c, v_y)] !== 0)), sameSet(v_R, through(sp, v_y, v_O)), !(_eg35.of(v_c) === v_R), (before(v_y, sp.adj4[v_c]).includes(v_z)), (!((b.grid[sp.adj4Edges[v_c][_i39]] !== 0)) && (_eg35.of(v_z) === v_R))], ["O's groups", "c =", "where of c", "y in", "where of y", "R =", "where of R", "z in", "where of z"]);
            }
            facts.length = 0;
            changed = false;
            let _c64: boolean = !(((walls(b, sp, v_c) + 2) > _h60));
            if (!_c64) {
              if (!(b.grid[_h61] !== 0)) { if (fire === null) { b.placeAt(_h61, 2); changed = true; } else facts.push(PLACE, _h61, 2); }
              let _c63: boolean = true;
              if (_c63) {
                const _t62 = sp.adj4Edges[v_c][_i39];
                if (!(b.grid[_t62] !== 0)) { if (fire === null) { b.placeAt(_t62, 2); changed = true; } else facts.push(PLACE, _t62, 2); }
                _c63 = true;
              }
              _c64 = _c63;
            }
            let _c69: boolean = _c64;
            if (_c69) {
              let _c68: boolean = !((((walls(b, sp, v_c) + 2) <= _h60) && ((opens(b, sp, v_c) + 2) > _h65)));
              if (!_c68) {
                if (!(b.grid[_h61] !== 0)) { if (fire === null) { b.placeAt(_h61, 1); changed = true; } else facts.push(PLACE, _h61, 1); }
                let _c67: boolean = true;
                if (_c67) {
                  const _t66 = sp.adj4Edges[v_c][_i39];
                  if (!(b.grid[_t66] !== 0)) { if (fire === null) { b.placeAt(_t66, 1); changed = true; } else facts.push(PLACE, _t66, 1); }
                  _c67 = true;
                }
                _c68 = _c67;
              }
              _c69 = _c68;
            }
            if (!(_c69)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null) {
                const _says = { terms: { anchor: setOf(v_c).slice(), clue: _h60 }, marks: { stripes: v_R.slice(), reads: _h70.slice() } };
                if (!fire({ O: v_O.slice(), q: v_q, c: v_c, y: v_y, R: v_R.slice(), z: v_z }, facts, _says)) return 1;
              }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface InsideSays {
  terms: { anchor: readonly number[]; };
  marks: { stripes: readonly number[]; reads: readonly number[]; };
}

const insideFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function inside(b: Marks, sp: GridSpace, fire: Fire<InsideBinding, InsideSays> | null): number {
  const _g9: number[] = [];
  const facts = insideFacts;
  let fired = 0;
  let changed = false;
  const _m26_0 = b.made[0];
  _g9.length = 0;
  G10: {
    const _a13 = sp.edges;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_e = _a13[_i14];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g9.push(v_e);
    }
  }
  const v_O = _g9;
  const _m27_1 = b.made[1];
  const _eg17 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a15 = sp.edges;
  R1:
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_e = _a15[_i16];
    if (!((((b.grid[v_e] || -1) !== 2) && (_eg17.of(sp.edgeEnds[2 * v_e + 1]) === _eg17.of(sp.edgeEnds[2 * v_e]))))) continue;
    if (b.made[0] !== _m26_0 || b.made[1] !== _m27_1) {
      const _now18 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
      if (!(_now18 === _eg17.of(sp.edgeEnds[2 * v_e]) || sameSet(_now18, _eg17.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
    }
    if (DEV && staleChecking) {
      const _g19: number[] = [];
      G20: {
        const _a23 = sp.edges;
        for (let _i24 = 0; _i24 < _a23.length; _i24++) {
          const v_e = _a23[_i24];
          if (!(((b.grid[v_e] || -1) === 2))) continue;
          _g19.push(v_e);
        }
      }
      const _fg25 = edgeGroups(sp, _g19);
      freshBinding("inside", [sameSet(_fg25.of(sp.edgeEnds[2 * v_e]), _eg17.of(sp.edgeEnds[2 * v_e])), (sp.edges.includes(v_e)), (((b.grid[v_e] || -1) !== 2) && (through(sp, sp.edgeEnds[2 * v_e], v_O).includes(sp.edgeEnds[2 * v_e + 1])))], ["O's groups", "e in", "where of e"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: { anchor: _eg17.of(sp.edgeEnds[2 * v_e]).slice() }, marks: { stripes: _eg17.of(sp.edgeEnds[2 * v_e]).slice(), reads: _eg17.of(sp.edgeEnds[2 * v_e]).slice() } };
        if (!fire({ O: v_O.slice(), e: v_e }, facts, _says)) return 1;
      }
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
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i4]] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = ((4 - sp.adj4[v_c].length) + _g1);
  _kept[v_c] = _made;
  return _made;
}

const opensKept = keptStore<number>();

/** `opens(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function opens(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = opensKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i4]] || -1) === 2))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}
