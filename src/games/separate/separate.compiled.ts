// Compiled by `npm run describe` from src/games/separate/separate.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, rangeMask, sameSet, stamps, through } from "../../engine/describe-runtime.ts";

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
  const _g193: number[] = [];
  const _g206: number[] = [];
  const _g222: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q191 = true;
  Q192: {
    _g193.length = 0;
    G194: {
      const _a197 = sp.edges;
      for (let _i198 = 0; _i198 < _a197.length; _i198++) {
        const v_e = _a197[_i198];
        const _h199 = (g[v_e] || -1);
        if (!((_h199 === 2))) continue;
        _g193.push(v_e);
      }
    }
    const v_O = _g193;
    const _eg203 = edgeGroups(sp, v_O);
    const _a200 = sp.edges;
    for (let _i201 = 0; _i201 < _a200.length; _i201++) {
      const v_e = _a200[_i201];
      const _h202 = (g[v_e] || -1);
      if (!(((_h202 === 1) === !(_eg203.of(sp.edgeEnds[2 * v_e + 1]) === _eg203.of(sp.edgeEnds[2 * v_e]))))) {
        _q191 = false;
        break Q192;
      }
    }
  }
  if (!(_q191)) return false;
  let _q204 = true;
  Q205: {
    _g206.length = 0;
    G207: {
      const _a210 = sp.edges;
      for (let _i211 = 0; _i211 < _a210.length; _i211++) {
        const v_e = _a210[_i211];
        const _h212 = (g[v_e] || -1);
        if (!((_h212 === 2))) continue;
        _g206.push(v_e);
      }
    }
    const v_O = _g206;
    const _eg215 = edgeGroups(sp, v_O);
    const _a213 = sp.cells;
    for (let _i214 = 0; _i214 < _a213.length; _i214++) {
      const v_c = _a213[_i214];
      const _h216 = _eg215.of(v_c).length;
      if (!((_h216 === cl.k))) {
        _q204 = false;
        break Q205;
      }
    }
  }
  if (!(_q204)) return false;
  for (let _k217 = 0; _k217 < cl.letter.at.length; _k217++) {
    const _at218 = cl.letter.at[_k217];
    const _v219 = cl.letter.v[_k217];
    let _q220 = true;
    Q221: {
      _g222.length = 0;
      G223: {
        const _a226 = sp.edges;
        for (let _i227 = 0; _i227 < _a226.length; _i227++) {
          const v_e = _a226[_i227];
          const _h228 = (g[v_e] || -1);
          if (!((_h228 === 2))) continue;
          _g222.push(v_e);
        }
      }
      const _a229 = through(sp, _at218, _g222);
      for (let _i230 = 0; _i230 < _a229.length; _i230++) {
        const v_x = _a229[_i230];
        if (!((v_x !== _at218))) continue;
        const _h231 = clueAt(cl.letter, v_x);
        if (!((_h231 !== _v219))) {
          _q220 = false;
          break Q221;
        }
      }
    }
    if (!(_q220)) return false;
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
  const _g85: number[] = [];
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
            facts.length = 0;
            changed = false;
            let _q83 = true;
            Q84: {
              _g85.length = 0;
              G86: {
                const _a89 = sp.edges;
                for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                  const v_e = _a89[_i90];
                  if (!((((_eg44.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg44.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
                  _g85.push(v_e);
                }
              }
              const _a91 = _g85;
              for (let _i92 = 0; _i92 < _a91.length; _i92++) {
                const v_f = _a91[_i92];
                if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
                if (!(true)) {
                  _q83 = false;
                  break Q84;
                }
              }
            }
            if (!(_q83)) return -1;
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
  const _g109: number[] = [];
  const _g130: number[] = [];
  const facts = walledApartFacts;
  let fired = 0;
  let changed = false;
  const _m52_0 = b.made[0];
  _g109.length = 0;
  G110: {
    const _a113 = sp.edges;
    for (let _i114 = 0; _i114 < _a113.length; _i114++) {
      const v_e = _a113[_i114];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g109.push(v_e);
    }
  }
  const v_O = _g109;
  const _m55_1 = b.made[1];
  const _eg117 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a115 = sp.edges;
  R1:
  for (let _i116 = 0; _i116 < _a115.length; _i116++) {
    const v_e = _a115[_i116];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg117.of(sp.edgeEnds[2 * v_e]);
    L118: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg117.of(v_b) === v_A))) break L118;
      L119: {
        const v_B = _eg117.of(v_b);
        let _q120 = false;
        Q121: {
          const _a122 = v_A;
          for (let _i123 = 0; _i123 < _a122.length; _i123++) {
            const v_x = _a122[_i123];
            const _a124 = sp.adj4[v_x];
            for (let _i125 = 0; _i125 < _a124.length; _i125++) {
              const v_y = _a124[_i125];
              if (!((_eg117.of(v_y) === v_B))) continue;
              if (((b.grid[sp.adj4Edges[v_x][_i125]] || -1) === 1)) {
                _q120 = true;
                break Q121;
              }
            }
          }
        }
        if (!(_q120)) break L119;
        if (b.made[0] !== _m52_0 || b.made[1] !== _m55_1) {
          const _now126 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
          if (!(_now126 === _eg117.of(sp.edgeEnds[2 * v_e]) || sameSet(_now126, _eg117.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
          const _now127 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_b);
          if (!(_now127 === _eg117.of(v_b) || sameSet(_now127, _eg117.of(v_b)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _q128 = true;
        Q129: {
          _g130.length = 0;
          G131: {
            const _a134 = sp.edges;
            for (let _i135 = 0; _i135 < _a134.length; _i135++) {
              const v_e = _a134[_i135];
              if (!((((_eg117.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg117.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg117.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg117.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
              _g130.push(v_e);
            }
          }
          const _a136 = _g130;
          for (let _i137 = 0; _i137 < _a136.length; _i137++) {
            const v_f = _a136[_i137];
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
            if (!(true)) {
              _q128 = false;
              break Q129;
            }
          }
        }
        if (!(_q128)) return -1;
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
const _st174 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyWayBinding> | null): number {
  const _g157: number[] = [];
  const _g168: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m84_0 = b.made[0];
  _g157.length = 0;
  G158: {
    const _a161 = sp.edges;
    for (let _i162 = 0; _i162 < _a161.length; _i162++) {
      const v_e = _a161[_i162];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g157.push(v_e);
    }
  }
  const v_O = _g157;
  const _m87_1 = b.made[1];
  const _eg165 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a163 = sp.cells;
  R1:
  for (let _i164 = 0; _i164 < _a163.length; _i164++) {
    const v_c = _a163[_i164];
    L166: {
      const v_A = _eg165.of(v_c);
      const _h167 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h167 < cl.k)))) break L166;
      _g168.length = 0;
      _st174.pass++;
      G169: {
        const _a175 = v_A;
        for (let _i176 = 0; _i176 < _a175.length; _i176++) {
          const v_x = _a175[_i176];
          const _a177 = sp.adj4[v_x];
          for (let _i178 = 0; _i178 < _a177.length; _i178++) {
            const v_s = _a177[_i178];
            if (!((!(_eg165.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i178]] || -1) !== 1)))) continue;
            const _t179 = v_s;
            if (_g168.length < 16) { if (!_g168.includes(_t179)) _g168.push(_t179); } else addOnce(_g168, _st174, _t179);
          }
        }
      }
      const v_S = _g168;
      const _h181 = v_S.length;
      if (b.made[0] !== _m84_0 || b.made[1] !== _m87_1) {
        const _now180 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(v_c);
        if (!(_now180 === _eg165.of(v_c) || sameSet(_now180, _eg165.of(v_c)))) { continue R1; }
      }
      facts.length = 0;
      changed = false;
      let _c190: boolean = (_h181 > 0);
      if (_c190) {
        let _c189: boolean = !((_h181 === 1));
        if (!_c189) {
          let _q182 = true;
          Q183: {
            const _a184 = v_A;
            for (let _i185 = 0; _i185 < _a184.length; _i185++) {
              const v_x = _a184[_i185];
              const _a186 = sp.adj4[v_x];
              for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                const v_y = _a186[_i187];
                if (!((v_S.includes(v_y)))) continue;
                const _t188 = sp.adj4Edges[v_x][_i187];
                if (!(b.grid[_t188] !== 0)) { if (fire === null) { b.placeAt(_t188, 2); changed = true; } else facts.push(PLACE, _t188, 2); }
                if (!(true)) {
                  _q182 = false;
                  break Q183;
                }
              }
            }
          }
          _c189 = _q182;
        }
        _c190 = _c189;
      }
      if (!(_c190)) return -1;
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
