// Compiled by `npm run describe` from src/games/separate/separate.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptEdgeGroups, rangeMask, sameSet, staleChecking, stamps, through } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  letter: ClueList;
  k: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "sharedLetter" | "walledApart" | "onlyWay";

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
  { id: "sharedLetter", tier: 0 },
  { id: "walledApart", tier: 0 },
  { id: "onlyWay", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g251: number[] = [];
  const _g264: number[] = [];
  const _g280: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q249 = true;
  Q250: {
    _g251.length = 0;
    G252: {
      const _a255 = sp.edges;
      for (let _i256 = 0; _i256 < _a255.length; _i256++) {
        const v_e = _a255[_i256];
        const _h257 = (g[v_e] || -1);
        if (!((_h257 === 2))) continue;
        _g251.push(v_e);
      }
    }
    const v_O = _g251;
    const _eg261 = edgeGroups(sp, v_O);
    const _a258 = sp.edges;
    for (let _i259 = 0; _i259 < _a258.length; _i259++) {
      const v_e = _a258[_i259];
      const _h260 = (g[v_e] || -1);
      if (!(((_h260 === 1) === !(_eg261.of(sp.edgeEnds[2 * v_e + 1]) === _eg261.of(sp.edgeEnds[2 * v_e]))))) {
        _q249 = false;
        break Q250;
      }
    }
  }
  if (!(_q249)) return false;
  let _q262 = true;
  Q263: {
    _g264.length = 0;
    G265: {
      const _a268 = sp.edges;
      for (let _i269 = 0; _i269 < _a268.length; _i269++) {
        const v_e = _a268[_i269];
        const _h270 = (g[v_e] || -1);
        if (!((_h270 === 2))) continue;
        _g264.push(v_e);
      }
    }
    const v_O = _g264;
    const _eg273 = edgeGroups(sp, v_O);
    const _a271 = sp.cells;
    for (let _i272 = 0; _i272 < _a271.length; _i272++) {
      const v_c = _a271[_i272];
      const _h274 = _eg273.of(v_c).length;
      if (!((_h274 === cl.k))) {
        _q262 = false;
        break Q263;
      }
    }
  }
  if (!(_q262)) return false;
  for (let _k275 = 0; _k275 < cl.letter.at.length; _k275++) {
    const _at276 = cl.letter.at[_k275];
    const _v277 = cl.letter.v[_k275];
    let _q278 = true;
    Q279: {
      _g280.length = 0;
      G281: {
        const _a284 = sp.edges;
        for (let _i285 = 0; _i285 < _a284.length; _i285++) {
          const v_e = _a284[_i285];
          const _h286 = (g[v_e] || -1);
          if (!((_h286 === 2))) continue;
          _g280.push(v_e);
        }
      }
      const _a287 = through(sp, _at276, _g280);
      for (let _i288 = 0; _i288 < _a287.length; _i288++) {
        const v_x = _a287[_i288];
        if (!((v_x !== _at276))) continue;
        const _h289 = clueAt(cl.letter, v_x);
        if (!((_h289 !== _v277))) {
          _q278 = false;
          break Q279;
        }
      }
    }
    if (!(_q278)) return false;
  }
  return true;
}

export interface SharedLetterBinding {
  O: readonly number[];
  e: number;
  A: readonly number[];
  b: number;
  B: readonly number[];
  L: number;
  d: number;
  x: number;
  y: number;
}

const sharedLetterFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function sharedLetter(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedLetterBinding> | null): number {
  const _g36: number[] = [];
  const _g113: number[] = [];
  const facts = sharedLetterFacts;
  let fired = 0;
  let changed = false;
  const _m4_0 = b.made[0];
  _g36.length = 0;
  G37: {
    const _a40 = sp.edges;
    for (let _i41 = 0; _i41 < _a40.length; _i41++) {
      const v_e = _a40[_i41];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g36.push(v_e);
    }
  }
  const v_O = _g36;
  const _m7_1 = b.made[1];
  const _eg44 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a42 = sp.edges;
  R1:
  for (let _i43 = 0; _i43 < _a42.length; _i43++) {
    const v_e = _a42[_i43];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg44.of(sp.edgeEnds[2 * v_e]);
    L45: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg44.of(v_b) === v_A))) break L45;
      const v_B = _eg44.of(v_b);
      let _g46 = 0;
      G47: {
        const _a50 = v_B;
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_y = _a50[_i51];
          const _h52 = clueAt(cl.letter, v_y);
          _g46 |= 1 << _h52;
        }
      }
      const v_L = _g46;
      let _g53 = 0;
      G54: {
        const _a57 = v_A;
        for (let _i58 = 0; _i58 < _a57.length; _i58++) {
          const v_x = _a57[_i58];
          const _h59 = clueAt(cl.letter, v_x);
          _g53 |= 1 << _h59;
        }
      }
      R2:
      for (let _m60 = _g53; _m60 !== 0; _m60 &= _m60 - 1) {
        const v_d = 31 - Math.clz32(_m60 & -_m60);
        let _c67: boolean = (((v_L >> v_d) & 1) !== 0);
        if (_c67) {
          let _q61 = false;
          Q62: {
            const _a63 = v_A;
            for (let _i64 = 0; _i64 < _a63.length; _i64++) {
              const v_x = _a63[_i64];
              const _a65 = sp.adj4[v_x];
              for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                const v_y = _a65[_i66];
                if (!((_eg44.of(v_y) === v_B))) continue;
                if (((b.grid[sp.adj4Edges[v_x][_i66]] || -1) === 1)) {
                  _q61 = true;
                  break Q62;
                }
              }
            }
          }
          _c67 = !(_q61);
        }
        if (!(_c67)) continue;
        const _a68 = v_A;
        for (let _i69 = 0; _i69 < _a68.length; _i69++) {
          const v_x = _a68[_i69];
          const _h70 = clueAt(cl.letter, v_x);
          if (!((_h70 === v_d))) continue;
          const _a71 = v_B;
          for (let _i72 = 0; _i72 < _a71.length; _i72++) {
            const v_y = _a71[_i72];
            const _h73 = clueAt(cl.letter, v_y);
            if (!((_h73 === v_d))) continue;
            if (b.made[0] !== _m4_0 || b.made[1] !== _m7_1) {
              const _now74 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
              if (!(_now74 === _eg44.of(sp.edgeEnds[2 * v_e]) || sameSet(_now74, _eg44.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
              const _now75 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
              if (!(_now75 === _eg44.of(v_b) || sameSet(_now75, _eg44.of(v_b)))) { continue R1; }
              if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
              let _c82: boolean = (((v_L >> v_d) & 1) !== 0);
              if (_c82) {
                let _q76 = false;
                Q77: {
                  const _a78 = v_A;
                  for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                    const v_x = _a78[_i79];
                    const _a80 = sp.adj4[v_x];
                    for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                      const v_y = _a80[_i81];
                      if (!((_eg44.of(v_y) === v_B))) continue;
                      if (((b.grid[sp.adj4Edges[v_x][_i81]] || -1) === 1)) {
                        _q76 = true;
                        break Q77;
                      }
                    }
                  }
                }
                _c82 = !(_q76);
              }
              if (!(_c82)) { continue R2; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g83: number[] = [];
              G84: {
                const _a87 = sp.edges;
                for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                  const v_e = _a87[_i88];
                  if (!(((b.grid[v_e] || -1) === 2))) continue;
                  _g83.push(v_e);
                }
              }
              const _fg89 = edgeGroups(sp, _g83);
              let _g90 = 0;
              G91: {
                const _a94 = v_B;
                for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                  const v_y = _a94[_i95];
                  const _t96 = clueAt(cl.letter, v_y);
                  _g90 |= 1 << _t96;
                }
              }
              let _g97 = 0;
              G98: {
                const _a101 = v_A;
                for (let _i102 = 0; _i102 < _a101.length; _i102++) {
                  const v_x = _a101[_i102];
                  const _t103 = clueAt(cl.letter, v_x);
                  _g97 |= 1 << _t103;
                }
              }
              let _c110: boolean = (((v_L >> v_d) & 1) !== 0);
              if (_c110) {
                let _q104 = false;
                Q105: {
                  const _a106 = v_A;
                  for (let _i107 = 0; _i107 < _a106.length; _i107++) {
                    const v_x = _a106[_i107];
                    const _a108 = sp.adj4[v_x];
                    for (let _i109 = 0; _i109 < _a108.length; _i109++) {
                      const v_y = _a108[_i109];
                      if (!((_eg44.of(v_y) === v_B))) continue;
                      if (((b.grid[sp.adj4Edges[v_x][_i109]] || -1) === 1)) {
                        _q104 = true;
                        break Q105;
                      }
                    }
                  }
                }
                _c110 = !(_q104);
              }
              freshBinding("sharedLetter", [sameSet(_fg89.of(sp.edgeEnds[2 * v_e]), _eg44.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg89.of(v_b), _eg44.of(v_b)), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_e], v_O)), (v_b === sp.edgeEnds[2 * v_e + 1]), !(_eg44.of(v_b) === v_A), sameSet(v_B, through(sp, v_b, v_O)), (v_L === _g90), (((_g97 >> v_d) & 1) !== 0), _c110, (_eg44.of(v_x) === v_A), (clueAt(cl.letter, v_x) === v_d), (_eg44.of(v_y) === v_B), (clueAt(cl.letter, v_y) === v_d)], ["O's groups", "e in", "where of e", "A =", "b =", "where of b", "B =", "L =", "d in", "where of d", "x in", "where of x", "y in", "where of y"]);
            }
            facts.length = 0;
            changed = false;
            let _q111 = true;
            Q112: {
              _g113.length = 0;
              G114: {
                const _a117 = sp.edges;
                for (let _i118 = 0; _i118 < _a117.length; _i118++) {
                  const v_e = _a117[_i118];
                  if (!((((_eg44.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg44.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
                  _g113.push(v_e);
                }
              }
              const _a119 = _g113;
              for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                const v_f = _a119[_i120];
                if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
                if (!(true)) {
                  _q111 = false;
                  break Q112;
                }
              }
            }
            if (!(_q111)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ O: v_O.slice(), e: v_e, A: v_A.slice(), b: v_b, B: v_B.slice(), L: v_L, d: v_d, x: v_x, y: v_y }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface WalledApartBinding {
  O: readonly number[];
  e: number;
  A: readonly number[];
  b: number;
  B: readonly number[];
}

const walledApartFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function walledApart(b: Marks, sp: GridSpace, fire: Fire<WalledApartBinding> | null): number {
  const _g137: number[] = [];
  const _g171: number[] = [];
  const facts = walledApartFacts;
  let fired = 0;
  let changed = false;
  const _m52_0 = b.made[0];
  _g137.length = 0;
  G138: {
    const _a141 = sp.edges;
    for (let _i142 = 0; _i142 < _a141.length; _i142++) {
      const v_e = _a141[_i142];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g137.push(v_e);
    }
  }
  const v_O = _g137;
  const _m55_1 = b.made[1];
  const _eg145 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a143 = sp.edges;
  R1:
  for (let _i144 = 0; _i144 < _a143.length; _i144++) {
    const v_e = _a143[_i144];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg145.of(sp.edgeEnds[2 * v_e]);
    L146: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg145.of(v_b) === v_A))) break L146;
      L147: {
        const v_B = _eg145.of(v_b);
        let _q148 = false;
        Q149: {
          const _a150 = v_A;
          for (let _i151 = 0; _i151 < _a150.length; _i151++) {
            const v_x = _a150[_i151];
            const _a152 = sp.adj4[v_x];
            for (let _i153 = 0; _i153 < _a152.length; _i153++) {
              const v_y = _a152[_i153];
              if (!((_eg145.of(v_y) === v_B))) continue;
              if (((b.grid[sp.adj4Edges[v_x][_i153]] || -1) === 1)) {
                _q148 = true;
                break Q149;
              }
            }
          }
        }
        if (!(_q148)) break L147;
        if (b.made[0] !== _m52_0 || b.made[1] !== _m55_1) {
          const _now154 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
          if (!(_now154 === _eg145.of(sp.edgeEnds[2 * v_e]) || sameSet(_now154, _eg145.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
          const _now155 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
          if (!(_now155 === _eg145.of(v_b) || sameSet(_now155, _eg145.of(v_b)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g156: number[] = [];
          G157: {
            const _a160 = sp.edges;
            for (let _i161 = 0; _i161 < _a160.length; _i161++) {
              const v_e = _a160[_i161];
              if (!(((b.grid[v_e] || -1) === 2))) continue;
              _g156.push(v_e);
            }
          }
          const _fg162 = edgeGroups(sp, _g156);
          let _q163 = false;
          Q164: {
            const _a165 = v_A;
            for (let _i166 = 0; _i166 < _a165.length; _i166++) {
              const v_x = _a165[_i166];
              const _a167 = sp.adj4[v_x];
              for (let _i168 = 0; _i168 < _a167.length; _i168++) {
                const v_y = _a167[_i168];
                if (!((_eg145.of(v_y) === v_B))) continue;
                if (((b.grid[sp.adj4Edges[v_x][_i168]] || -1) === 1)) {
                  _q163 = true;
                  break Q164;
                }
              }
            }
          }
          freshBinding("walledApart", [sameSet(_fg162.of(sp.edgeEnds[2 * v_e]), _eg145.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg162.of(v_b), _eg145.of(v_b)), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_e], v_O)), (v_b === sp.edgeEnds[2 * v_e + 1]), !(_eg145.of(v_b) === v_A), sameSet(v_B, through(sp, v_b, v_O)), _q163], ["O's groups", "e in", "where of e", "A =", "b =", "where of b", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _q169 = true;
        Q170: {
          _g171.length = 0;
          G172: {
            const _a175 = sp.edges;
            for (let _i176 = 0; _i176 < _a175.length; _i176++) {
              const v_e = _a175[_i176];
              if (!((((_eg145.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg145.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg145.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg145.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
              _g171.push(v_e);
            }
          }
          const _a177 = _g171;
          for (let _i178 = 0; _i178 < _a177.length; _i178++) {
            const v_f = _a177[_i178];
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
            if (!(true)) {
              _q169 = false;
              break Q170;
            }
          }
        }
        if (!(_q169)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ O: v_O.slice(), e: v_e, A: v_A.slice(), b: v_b, B: v_B.slice() }, facts)) return 1;
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
  S: readonly number[];
}

const onlyWayFacts: number[] = [];
const _st215 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyWayBinding> | null): number {
  const _g198: number[] = [];
  const _g209: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m84_0 = b.made[0];
  _g198.length = 0;
  G199: {
    const _a202 = sp.edges;
    for (let _i203 = 0; _i203 < _a202.length; _i203++) {
      const v_e = _a202[_i203];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g198.push(v_e);
    }
  }
  const v_O = _g198;
  const _m87_1 = b.made[1];
  const _eg206 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a204 = sp.cells;
  R1:
  for (let _i205 = 0; _i205 < _a204.length; _i205++) {
    const v_c = _a204[_i205];
    L207: {
      const v_A = _eg206.of(v_c);
      const _h208 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h208 < cl.k)))) break L207;
      _g209.length = 0;
      _st215.pass++;
      G210: {
        const _a216 = v_A;
        for (let _i217 = 0; _i217 < _a216.length; _i217++) {
          const v_x = _a216[_i217];
          const _a218 = sp.adj4[v_x];
          for (let _i219 = 0; _i219 < _a218.length; _i219++) {
            const v_s = _a218[_i219];
            if (!((!(_eg206.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i219]] || -1) !== 1)))) continue;
            const _t220 = v_s;
            if (_g209.length < 16) { if (!_g209.includes(_t220)) _g209.push(_t220); } else addOnce(_g209, _st215, _t220);
          }
        }
      }
      const v_S = _g209;
      const _h239 = v_S.length;
      if (b.made[0] !== _m84_0 || b.made[1] !== _m87_1) {
        const _now221 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_c);
        if (!(_now221 === _eg206.of(v_c) || sameSet(_now221, _eg206.of(v_c)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g222: number[] = [];
        G223: {
          const _a226 = sp.edges;
          for (let _i227 = 0; _i227 < _a226.length; _i227++) {
            const v_e = _a226[_i227];
            if (!(((b.grid[v_e] || -1) === 2))) continue;
            _g222.push(v_e);
          }
        }
        const _fg228 = edgeGroups(sp, _g222);
        const _g229: number[] = [];
        G230: {
          const _a235 = v_A;
          for (let _i236 = 0; _i236 < _a235.length; _i236++) {
            const v_x = _a235[_i236];
            const _a237 = sp.adj4[v_x];
            for (let _i238 = 0; _i238 < _a237.length; _i238++) {
              const v_s = _a237[_i238];
              if (!((!(_eg206.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i238]] || -1) !== 1)))) continue;
              if (!_g229.includes(v_s)) _g229.push(v_s);
            }
          }
        }
        freshBinding("onlyWay", [sameSet(_fg228.of(v_c), _eg206.of(v_c)), (sp.cells.includes(v_c)), sameSet(v_A, through(sp, v_c, v_O)), ((v_c === (v_A[0] ?? -1)) && (v_A.length < cl.k)), sameSet(v_S, _g229)], ["O's groups", "c in", "A =", "where of A", "S ="]);
      }
      facts.length = 0;
      changed = false;
      let _c248: boolean = (_h239 > 0);
      if (_c248) {
        let _c247: boolean = !((_h239 === 1));
        if (!_c247) {
          let _q240 = true;
          Q241: {
            const _a242 = v_A;
            for (let _i243 = 0; _i243 < _a242.length; _i243++) {
              const v_x = _a242[_i243];
              const _a244 = sp.adj4[v_x];
              for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                const v_y = _a244[_i245];
                if (!((v_S.includes(v_y)))) continue;
                const _t246 = sp.adj4Edges[v_x][_i245];
                if (!(b.grid[_t246] !== 0)) { if (fire === null) { b.placeAt(_t246, 2); changed = true; } else facts.push(PLACE, _t246, 2); }
                if (!(true)) {
                  _q240 = false;
                  break Q241;
                }
              }
            }
          }
          _c247 = _q240;
        }
        _c248 = _c247;
      }
      if (!(_c248)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O.slice(), c: v_c, A: v_A.slice(), S: v_S.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 2);
}
