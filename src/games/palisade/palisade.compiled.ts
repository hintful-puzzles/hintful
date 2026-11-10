// Compiled by `npm run describe` from src/games/palisade/palisade.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, before, clueAt, edgeGroups, freshBinding, keptEdgeGroups, keptStore, rangeMask, sameSet, staleChecking, stamps, through, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g382: number[] = [];
  const _g395: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q380 = true;
  Q381: {
    _g382.length = 0;
    G383: {
      const _a386 = sp.edges;
      for (let _i387 = 0; _i387 < _a386.length; _i387++) {
        const v_e = _a386[_i387];
        const _h388 = (g[v_e] || -1);
        if (!((_h388 === 2))) continue;
        _g382.push(v_e);
      }
    }
    const v_O = _g382;
    const _eg392 = edgeGroups(sp, v_O);
    const _a389 = sp.edges;
    for (let _i390 = 0; _i390 < _a389.length; _i390++) {
      const v_e = _a389[_i390];
      const _h391 = (g[v_e] || -1);
      if (!(((_h391 === 1) === !(_eg392.of(sp.edgeEnds[2 * v_e + 1]) === _eg392.of(sp.edgeEnds[2 * v_e]))))) {
        _q380 = false;
        break Q381;
      }
    }
  }
  if (!(_q380)) return false;
  let _q393 = true;
  Q394: {
    _g395.length = 0;
    G396: {
      const _a399 = sp.edges;
      for (let _i400 = 0; _i400 < _a399.length; _i400++) {
        const v_e = _a399[_i400];
        const _h401 = (g[v_e] || -1);
        if (!((_h401 === 2))) continue;
        _g395.push(v_e);
      }
    }
    const v_O = _g395;
    const _eg404 = edgeGroups(sp, v_O);
    const _a402 = sp.cells;
    for (let _i403 = 0; _i403 < _a402.length; _i403++) {
      const v_c = _a402[_i403];
      const _h405 = _eg404.of(v_c).length;
      if (!((_h405 === cl.k))) {
        _q393 = false;
        break Q394;
      }
    }
  }
  if (!(_q393)) return false;
  for (let _k406 = 0; _k406 < cl.number.at.length; _k406++) {
    const _at407 = cl.number.at[_k406];
    const _v408 = cl.number.v[_k406];
    let _g409 = 0;
    G410: {
      const _a411 = sp.adj4[_at407];
      for (let _i412 = 0; _i412 < _a411.length; _i412++) {
        const _h413 = (g[sp.adj4Edges[_at407][_i412]] || -1);
        if (!((_h413 === 1))) continue;
        _g409++;
      }
    }
    if (!((((4 - sp.adj4[_at407].length) + _g409) === _v408))) return false;
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
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("cluesVersusRegionSize", [(v_a === cl.number.at[v_q]), (sp.adj4[v_a].includes(v_b)), !((b.grid[sp.adj4Edges[v_a][_i5]] !== 0)), (v_d === clueAt(cl.number, v_b)), ((v_d !== -1) && ((((8 - cl.number.v[v_q]) - v_d) > cl.k) || (((cl.number.v[v_q] === 3) && (v_d === 3)) && (cl.k !== 2))))], ["a =", "b in", "where of b", "d =", "where of d"]);
        }
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
      if (import.meta.env.DEV && staleChecking) {
        const _g36: number[] = [];
        G37: {
          const _a40 = sp.adj4[v_c];
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_y = _a40[_i41];
            if (!(!((b.grid[sp.adj4Edges[v_c][_i41]] !== 0)))) continue;
            _g36.push(v_y);
          }
        }
        let _g42 = 0;
        G43: {
          const _a44 = sp.adj4[v_c];
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i45]] || -1) === 1))) continue;
            _g42++;
          }
        }
        freshBinding("numberExhausted", [(v_c === cl.number.at[v_q]), sameSet(v_U, _g36), (v_n === ((4 - sp.adj4[v_c].length) + _g42)), (((v_U.length > 0) || (v_n !== cl.number.v[v_q])) && ((v_n >= cl.number.v[v_q]) || ((v_n + v_U.length) <= cl.number.v[v_q])))], ["c =", "U =", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c52: boolean = ((v_n <= cl.number.v[v_q]) && ((v_n + _h35) >= cl.number.v[v_q]));
      if (_c52) {
        let _c51: boolean = !((v_n === cl.number.v[v_q]));
        if (!_c51) {
          let _q46 = true;
          Q47: {
            const _a48 = v_U;
            for (let _i49 = 0; _i49 < _a48.length; _i49++) {
              const v_y = _a48[_i49];
              const _t50 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t50] !== 0)) { if (fire === null) { b.placeAt(_t50, 2); changed = true; } else facts.push(PLACE, _t50, 2); }
              if (!(true)) {
                _q46 = false;
                break Q47;
              }
            }
          }
          _c51 = _q46;
        }
        _c52 = _c51;
      }
      let _c59: boolean = _c52;
      if (_c59) {
        let _c58: boolean = !((v_n < cl.number.v[v_q]));
        if (!_c58) {
          let _q53 = true;
          Q54: {
            const _a55 = v_U;
            for (let _i56 = 0; _i56 < _a55.length; _i56++) {
              const v_y = _a55[_i56];
              const _t57 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t57] !== 0)) { if (fire === null) { b.placeAt(_t57, 1); changed = true; } else facts.push(PLACE, _t57, 1); }
              if (!(true)) {
                _q53 = false;
                break Q54;
              }
            }
          }
          _c58 = _q53;
        }
        _c59 = _c58;
      }
      if (!(_c59)) return -1;
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
  const _g70: number[] = [];
  const facts = notTooBigFacts;
  let fired = 0;
  let changed = false;
  const _m49_0 = b.made[0];
  _g70.length = 0;
  G71: {
    const _a74 = sp.edges;
    for (let _i75 = 0; _i75 < _a74.length; _i75++) {
      const v_e = _a74[_i75];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g70.push(v_e);
    }
  }
  const v_O = _g70;
  const _m52_1 = b.made[1];
  const _eg78 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a76 = sp.edges;
  R1:
  for (let _i77 = 0; _i77 < _a76.length; _i77++) {
    const v_e = _a76[_i77];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg78.of(sp.edgeEnds[2 * v_e]);
    const _h81 = v_A.length;
    L79: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg78.of(v_b) === v_A))) break L79;
      L80: {
        const v_B = _eg78.of(v_b);
        const _h82 = v_B.length;
        if (!(((_h81 + _h82) > cl.k))) break L80;
        if (b.made[0] !== _m49_0 || b.made[1] !== _m52_1) {
          const _now83 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
          if (!(_now83 === _eg78.of(sp.edgeEnds[2 * v_e]) || sameSet(_now83, _eg78.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
          const _now84 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
          if (!(_now84 === _eg78.of(v_b) || sameSet(_now84, _eg78.of(v_b)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g85: number[] = [];
          G86: {
            const _a89 = sp.edges;
            for (let _i90 = 0; _i90 < _a89.length; _i90++) {
              const v_e = _a89[_i90];
              if (!(((b.grid[v_e] || -1) === 2))) continue;
              _g85.push(v_e);
            }
          }
          const _fg91 = edgeGroups(sp, _g85);
          freshBinding("notTooBig", [sameSet(_fg91.of(sp.edgeEnds[2 * v_e]), _eg78.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg91.of(v_b), _eg78.of(v_b)), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_e], v_O)), (v_b === sp.edgeEnds[2 * v_e + 1]), !(_eg78.of(v_b) === v_A), sameSet(v_B, through(sp, v_b, v_O)), ((v_A.length + v_B.length) > cl.k)], ["O's groups", "e in", "where of e", "A =", "b =", "where of b", "B =", "where of B"]);
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
const _st146 = stamps();

/** Its dearest read grows with the board as n. */
export function notTooSmall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NotTooSmallBinding> | null): number {
  const _g123: number[] = [];
  const _g134: number[] = [];
  const _g149: number[] = [];
  const facts = notTooSmallFacts;
  let fired = 0;
  let changed = false;
  const _m75_0 = b.made[0];
  _g123.length = 0;
  G124: {
    const _a127 = sp.edges;
    for (let _i128 = 0; _i128 < _a127.length; _i128++) {
      const v_e = _a127[_i128];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g123.push(v_e);
    }
  }
  const v_O = _g123;
  const _m78_1 = b.made[1];
  const _eg131 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a129 = sp.cells;
  R1:
  for (let _i130 = 0; _i130 < _a129.length; _i130++) {
    const v_c = _a129[_i130];
    L132: {
      const v_A = _eg131.of(v_c);
      const _h133 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h133 !== cl.k)))) break L132;
      _g134.length = 0;
      _st146.pass++;
      G135: {
        const _a147 = v_A;
        for (let _i148 = 0; _i148 < _a147.length; _i148++) {
          const v_x = _a147[_i148];
          _g149.length = 0;
          G150: {
            const _a153 = sp.adj4[v_x];
            for (let _i154 = 0; _i154 < _a153.length; _i154++) {
              const v_y = _a153[_i154];
              if (!(!((b.grid[sp.adj4Edges[v_x][_i154]] !== 0)))) continue;
              _g149.push(v_y);
            }
          }
          const _a155 = _g149;
          for (let _i156 = 0; _i156 < _a155.length; _i156++) {
            const v_s = _a155[_i156];
            const _t157 = v_s;
            if (_g134.length < 16) { if (!_g134.includes(_t157)) _g134.push(_t157); } else addOnce(_g134, _st146, _t157);
          }
        }
      }
      const v_S = _g134;
      const _h189 = v_S.length;
      if (b.made[0] !== _m75_0 || b.made[1] !== _m78_1) {
        const _now158 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_c);
        if (!(_now158 === _eg131.of(v_c) || sameSet(_now158, _eg131.of(v_c)))) { continue R1; }
        const _now159 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of((v_S[0] ?? -1));
        if (!(_now159 === _eg131.of((v_S[0] ?? -1)) || sameSet(_now159, _eg131.of((v_S[0] ?? -1))))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g160: number[] = [];
        G161: {
          const _a164 = sp.edges;
          for (let _i165 = 0; _i165 < _a164.length; _i165++) {
            const v_e = _a164[_i165];
            if (!(((b.grid[v_e] || -1) === 2))) continue;
            _g160.push(v_e);
          }
        }
        const _fg166 = edgeGroups(sp, _g160);
        const _g167: number[] = [];
        G168: {
          const _a179 = v_A;
          for (let _i180 = 0; _i180 < _a179.length; _i180++) {
            const v_x = _a179[_i180];
            const _g181: number[] = [];
            G182: {
              const _a185 = sp.adj4[v_x];
              for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                const v_y = _a185[_i186];
                if (!(!((b.grid[sp.adj4Edges[v_x][_i186]] !== 0)))) continue;
                _g181.push(v_y);
              }
            }
            const _a187 = _g181;
            for (let _i188 = 0; _i188 < _a187.length; _i188++) {
              const v_s = _a187[_i188];
              if (!_g167.includes(v_s)) _g167.push(v_s);
            }
          }
        }
        freshBinding("notTooSmall", [sameSet(_fg166.of(v_c), _eg131.of(v_c)) && sameSet(_fg166.of((v_S[0] ?? -1)), _eg131.of((v_S[0] ?? -1))), (sp.cells.includes(v_c)), sameSet(v_A, through(sp, v_c, v_O)), ((v_c === (v_A[0] ?? -1)) && (v_A.length !== cl.k)), sameSet(v_S, _g167)], ["O's groups", "c in", "A =", "where of A", "S ="]);
      }
      facts.length = 0;
      changed = false;
      let _c204: boolean = ((_h133 < cl.k) && (_h189 > 0));
      if (_c204) {
        let _q190 = true;
        Q191: {
          const v_B = _eg131.of((v_S[0] ?? -1));
          let _q192 = true;
          Q193: {
            const _a194 = v_S;
            for (let _i195 = 0; _i195 < _a194.length; _i195++) {
              const v_s = _a194[_i195];
              if (!((_eg131.of(v_s) === v_B))) {
                _q192 = false;
                break Q193;
              }
            }
          }
          let _c203: boolean = !(_q192);
          if (!_c203) {
            let _q196 = true;
            Q197: {
              const _a198 = v_A;
              for (let _i199 = 0; _i199 < _a198.length; _i199++) {
                const v_x = _a198[_i199];
                const _a200 = sp.adj4[v_x];
                for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                  const v_y = _a200[_i201];
                  if (!((_eg131.of(v_y) === v_B))) continue;
                  const _t202 = sp.adj4Edges[v_x][_i201];
                  if (!(b.grid[_t202] !== 0)) { if (fire === null) { b.placeAt(_t202, 2); changed = true; } else facts.push(PLACE, _t202, 2); }
                  if (!(true)) {
                    _q196 = false;
                    break Q197;
                  }
                }
              }
            }
            _c203 = _q196;
          }
          if (!(_c203)) {
            _q190 = false;
            break Q191;
          }
        }
        _c204 = _q190;
      }
      if (!(_c204)) return -1;
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
const _st238 = stamps();

/** Its dearest read grows with the board as n. */
export function noDanglingEdges(b: Marks, sp: GridSpace, fire: Fire<NoDanglingEdgesBinding> | null): number {
  const _g232: number[] = [];
  const facts = noDanglingEdgesFacts;
  let fired = 0;
  let changed = false;
  const _a230 = sp.corners;
  for (let _i231 = 0; _i231 < _a230.length; _i231++) {
    const v_p = _a230[_i231];
    const v_C = sp.cornerCells[v_p];
    _g232.length = 0;
    _st238.pass++;
    G233: {
      const _a239 = v_C;
      for (let _i240 = 0; _i240 < _a239.length; _i240++) {
        const v_x = _a239[_i240];
        const _a241 = sp.adj4[v_x];
        for (let _i242 = 0; _i242 < _a241.length; _i242++) {
          const v_y = _a241[_i242];
          if (!((v_C.includes(v_y)))) continue;
          const _t243 = sp.adj4Edges[v_x][_i242];
          const _t244 = _t243;
          if (_g232.length < 16) { if (!_g232.includes(_t244)) _g232.push(_t244); } else addOnce(_g232, _st238, _t244);
        }
      }
    }
    const v_F = _g232;
    const _a245 = v_F;
    for (let _i246 = 0; _i246 < _a245.length; _i246++) {
      const v_f = _a245[_i246];
      let _c251: boolean = !((b.grid[v_f] !== 0));
      if (_c251) {
        let _g247 = 0;
        G248: {
          const _a249 = v_F;
          for (let _i250 = 0; _i250 < _a249.length; _i250++) {
            const v_e = _a249[_i250];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g247++;
          }
        }
        _c251 = (_g247 === 1);
      }
      let _c256: boolean = _c251;
      if (_c256) {
        let _g252 = 0;
        G253: {
          const _a254 = v_F;
          for (let _i255 = 0; _i255 < _a254.length; _i255++) {
            const v_e = _a254[_i255];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g252++;
          }
        }
        _c256 = (_g252 === 1);
      }
      if (!(_c256)) continue;
      if (import.meta.env.DEV && staleChecking) {
        const _g257: number[] = [];
        G258: {
          const _a263 = v_C;
          for (let _i264 = 0; _i264 < _a263.length; _i264++) {
            const v_x = _a263[_i264];
            const _a265 = sp.adj4[v_x];
            for (let _i266 = 0; _i266 < _a265.length; _i266++) {
              const v_y = _a265[_i266];
              if (!((v_C.includes(v_y)))) continue;
              const _t267 = sp.adj4Edges[v_x][_i266];
              if (!_g257.includes(_t267)) _g257.push(_t267);
            }
          }
        }
        let _c272: boolean = !((b.grid[v_f] !== 0));
        if (_c272) {
          let _g268 = 0;
          G269: {
            const _a270 = v_F;
            for (let _i271 = 0; _i271 < _a270.length; _i271++) {
              const v_e = _a270[_i271];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g268++;
            }
          }
          _c272 = (_g268 === 1);
        }
        let _c277: boolean = _c272;
        if (_c277) {
          let _g273 = 0;
          G274: {
            const _a275 = v_F;
            for (let _i276 = 0; _i276 < _a275.length; _i276++) {
              const v_e = _a275[_i276];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g273++;
            }
          }
          _c277 = (_g273 === 1);
        }
        freshBinding("noDanglingEdges", [(sp.corners.includes(v_p)), sameSet(v_C, sp.cornerCells[v_p]), sameSet(v_F, _g257), (v_F.includes(v_f)), _c277], ["p in", "C =", "F =", "f in", "where of f"]);
      }
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
  const _g297: number[] = [];
  const _g304: number[] = [];
  const _g318: number[] = [];
  const facts = equivalentEdgesFacts;
  let fired = 0;
  let changed = false;
  const _m131_0 = b.made[0];
  _g297.length = 0;
  G298: {
    const _a301 = sp.edges;
    for (let _i302 = 0; _i302 < _a301.length; _i302++) {
      const v_e = _a301[_i302];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g297.push(v_e);
    }
  }
  const v_O = _g297;
  const _m134_1 = b.made[1];
  const _eg312 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _h341 = cl.number.v[v_q];
    const _h350 = (4 - _h341);
    L303: {
      const v_c = cl.number.at[v_q];
      if (!(((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)))) break L303;
      _g304.length = 0;
      G305: {
        const _a308 = sp.adj4[v_c];
        for (let _i309 = 0; _i309 < _a308.length; _i309++) {
          const v_y = _a308[_i309];
          if (!(!((b.grid[sp.adj4Edges[v_c][_i309]] !== 0)))) continue;
          _g304.push(v_y);
        }
      }
      const _a310 = _g304;
      R2:
      for (let _i311 = 0; _i311 < _a310.length; _i311++) {
        const v_y = _a310[_i311];
        if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) continue;
        const _h342 = sp.edgeOf(v_c, v_y);
        L313: {
          const v_R = _eg312.of(v_y);
          if (!(!(_eg312.of(v_c) === v_R))) break L313;
          const _a314 = sp.adj4[v_c];
          const _n315 = _a314.indexOf(v_y);
          for (let _i316 = 0; _i316 < _n315; _i316++) {
            const v_z = _a314[_i316];
            if (!((!((b.grid[sp.adj4Edges[v_c][_i316]] !== 0)) && (_eg312.of(v_z) === v_R)))) continue;
            if (b.made[0] !== _m131_0 || b.made[1] !== _m134_1) {
              const _now317 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_y);
              if (!(_now317 === _eg312.of(v_y) || sameSet(_now317, _eg312.of(v_y)))) { continue R2; }
              _g318.length = 0;
              G319: {
                const _a322 = sp.adj4[v_c];
                for (let _i323 = 0; _i323 < _a322.length; _i323++) {
                  const v_y = _a322[_i323];
                  if (!(!((b.grid[sp.adj4Edges[v_c][_i323]] !== 0)))) continue;
                  _g318.push(v_y);
                }
              }
              if (!((_g318.includes(v_y)))) { continue R2; }
              if (!(!((b.grid[sp.edgeOf(v_c, v_y)] !== 0)))) { continue R2; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g324: number[] = [];
              G325: {
                const _a328 = sp.edges;
                for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                  const v_e = _a328[_i329];
                  if (!(((b.grid[v_e] || -1) === 2))) continue;
                  _g324.push(v_e);
                }
              }
              const _fg330 = edgeGroups(sp, _g324);
              const _g331: number[] = [];
              G332: {
                const _a335 = sp.adj4[v_c];
                for (let _i336 = 0; _i336 < _a335.length; _i336++) {
                  const v_y = _a335[_i336];
                  if (!(!((b.grid[sp.adj4Edges[v_c][_i336]] !== 0)))) continue;
                  _g331.push(v_y);
                }
              }
              freshBinding("equivalentEdges", [sameSet(_fg330.of(v_y), _eg312.of(v_y)), (v_c === cl.number.at[v_q]), ((cl.number.v[v_q] >= 1) && (cl.number.v[v_q] <= 3)), (_g331.includes(v_y)), !((b.grid[sp.edgeOf(v_c, v_y)] !== 0)), sameSet(v_R, through(sp, v_y, v_O)), !(_eg312.of(v_c) === v_R), (before(v_y, sp.adj4[v_c]).includes(v_z)), (!((b.grid[sp.adj4Edges[v_c][_i316]] !== 0)) && (_eg312.of(v_z) === v_R))], ["O's groups", "c =", "where of c", "y in", "where of y", "R =", "where of R", "z in", "where of z"]);
            }
            facts.length = 0;
            changed = false;
            let _c345: boolean = !(((walls(b, sp, v_c) + 2) > _h341));
            if (!_c345) {
              if (!(b.grid[_h342] !== 0)) { if (fire === null) { b.placeAt(_h342, 2); changed = true; } else facts.push(PLACE, _h342, 2); }
              let _c344: boolean = true;
              if (_c344) {
                const _t343 = sp.adj4Edges[v_c][_i316];
                if (!(b.grid[_t343] !== 0)) { if (fire === null) { b.placeAt(_t343, 2); changed = true; } else facts.push(PLACE, _t343, 2); }
                _c344 = true;
              }
              _c345 = _c344;
            }
            let _c354: boolean = _c345;
            if (_c354) {
              let _c353: boolean = !((((walls(b, sp, v_c) + 2) <= _h341) && ((opens(b, sp, v_c) + 2) > _h350)));
              if (!_c353) {
                if (!(b.grid[_h342] !== 0)) { if (fire === null) { b.placeAt(_h342, 1); changed = true; } else facts.push(PLACE, _h342, 1); }
                let _c352: boolean = true;
                if (_c352) {
                  const _t351 = sp.adj4Edges[v_c][_i316];
                  if (!(b.grid[_t351] !== 0)) { if (fire === null) { b.placeAt(_t351, 1); changed = true; } else facts.push(PLACE, _t351, 1); }
                  _c352 = true;
                }
                _c353 = _c352;
              }
              _c354 = _c353;
            }
            if (!(_c354)) return -1;
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
  const _g363: number[] = [];
  const facts = insideFacts;
  let fired = 0;
  let changed = false;
  const _m163_0 = b.made[0];
  _g363.length = 0;
  G364: {
    const _a367 = sp.edges;
    for (let _i368 = 0; _i368 < _a367.length; _i368++) {
      const v_e = _a367[_i368];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g363.push(v_e);
    }
  }
  const v_O = _g363;
  const _m166_1 = b.made[1];
  const _eg371 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a369 = sp.edges;
  R1:
  for (let _i370 = 0; _i370 < _a369.length; _i370++) {
    const v_e = _a369[_i370];
    if (!((((b.grid[v_e] || -1) !== 2) && (_eg371.of(sp.edgeEnds[2 * v_e + 1]) === _eg371.of(sp.edgeEnds[2 * v_e]))))) continue;
    if (b.made[0] !== _m163_0 || b.made[1] !== _m166_1) {
      const _now372 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
      if (!(_now372 === _eg371.of(sp.edgeEnds[2 * v_e]) || sameSet(_now372, _eg371.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
    }
    if (import.meta.env.DEV && staleChecking) {
      const _g373: number[] = [];
      G374: {
        const _a377 = sp.edges;
        for (let _i378 = 0; _i378 < _a377.length; _i378++) {
          const v_e = _a377[_i378];
          if (!(((b.grid[v_e] || -1) === 2))) continue;
          _g373.push(v_e);
        }
      }
      const _fg379 = edgeGroups(sp, _g373);
      freshBinding("inside", [sameSet(_fg379.of(sp.edgeEnds[2 * v_e]), _eg371.of(sp.edgeEnds[2 * v_e])), (sp.edges.includes(v_e)), (((b.grid[v_e] || -1) !== 2) && (through(sp, sp.edgeEnds[2 * v_e], v_O).includes(sp.edgeEnds[2 * v_e + 1])))], ["O's groups", "e in", "where of e"]);
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
  let _g337 = 0;
  G338: {
    const _a339 = sp.adj4[v_c];
    for (let _i340 = 0; _i340 < _a339.length; _i340++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i340]] || -1) === 1))) continue;
      _g337++;
    }
  }
  const _made = ((4 - sp.adj4[v_c].length) + _g337);
  _kept[v_c] = _made;
  return _made;
}

const opensKept = keptStore<number>();

/** `opens(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function opens(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = opensKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g346 = 0;
  G347: {
    const _a348 = sp.adj4[v_c];
    for (let _i349 = 0; _i349 < _a348.length; _i349++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i349]] || -1) === 2))) continue;
      _g346++;
    }
  }
  const _made = _g346;
  _kept[v_c] = _made;
  return _made;
}
