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
  const _g206: number[] = [];
  const _g219: number[] = [];
  const _g235: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
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
    const _eg216 = edgeGroups(sp, v_O);
    const _a213 = sp.edges;
    for (let _i214 = 0; _i214 < _a213.length; _i214++) {
      const v_e = _a213[_i214];
      const _h215 = (g[v_e] || -1);
      if (!(((_h215 === 1) === !(_eg216.of(sp.edgeEnds[2 * v_e + 1]) === _eg216.of(sp.edgeEnds[2 * v_e]))))) {
        _q204 = false;
        break Q205;
      }
    }
  }
  if (!(_q204)) return false;
  let _q217 = true;
  Q218: {
    _g219.length = 0;
    G220: {
      const _a223 = sp.edges;
      for (let _i224 = 0; _i224 < _a223.length; _i224++) {
        const v_e = _a223[_i224];
        const _h225 = (g[v_e] || -1);
        if (!((_h225 === 2))) continue;
        _g219.push(v_e);
      }
    }
    const v_O = _g219;
    const _eg228 = edgeGroups(sp, v_O);
    const _a226 = sp.cells;
    for (let _i227 = 0; _i227 < _a226.length; _i227++) {
      const v_c = _a226[_i227];
      const _h229 = _eg228.of(v_c).length;
      if (!((_h229 === cl.k))) {
        _q217 = false;
        break Q218;
      }
    }
  }
  if (!(_q217)) return false;
  for (let _k230 = 0; _k230 < cl.letter.at.length; _k230++) {
    const _at231 = cl.letter.at[_k230];
    const _v232 = cl.letter.v[_k230];
    let _q233 = true;
    Q234: {
      _g235.length = 0;
      G236: {
        const _a239 = sp.edges;
        for (let _i240 = 0; _i240 < _a239.length; _i240++) {
          const v_e = _a239[_i240];
          const _h241 = (g[v_e] || -1);
          if (!((_h241 === 2))) continue;
          _g235.push(v_e);
        }
      }
      const _a242 = through(sp, _at231, _g235);
      for (let _i243 = 0; _i243 < _a242.length; _i243++) {
        const v_x = _a242[_i243];
        if (!((v_x !== _at231))) continue;
        const _h244 = clueAt(cl.letter, v_x);
        if (!((_h244 !== _v232))) {
          _q233 = false;
          break Q234;
        }
      }
    }
    if (!(_q233)) return false;
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
  const _g74: number[] = [];
  const _g89: number[] = [];
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
              _g74.length = 0;
              G75: {
                const _a78 = sp.edges;
                for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                  const v_e = _a78[_i79];
                  if (!(((b.grid[v_e] || -1) === 2))) continue;
                  _g74.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g74))) { return fired; }
              if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
              let _c86: boolean = (((v_L >> v_d) & 1) !== 0);
              if (_c86) {
                let _q80 = false;
                Q81: {
                  const _a82 = v_A;
                  for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                    const v_x = _a82[_i83];
                    const _a84 = sp.adj4[v_x];
                    for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                      const v_y = _a84[_i85];
                      if (!((_eg44.of(v_y) === v_B))) continue;
                      if (((b.grid[sp.adj4Edges[v_x][_i85]] || -1) === 1)) {
                        _q80 = true;
                        break Q81;
                      }
                    }
                  }
                }
                _c86 = !(_q80);
              }
              if (!(_c86)) { continue R2; }
            }
            facts.length = 0;
            changed = false;
            let _q87 = true;
            Q88: {
              _g89.length = 0;
              G90: {
                const _a93 = sp.edges;
                for (let _i94 = 0; _i94 < _a93.length; _i94++) {
                  const v_e = _a93[_i94];
                  if (!((((_eg44.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg44.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
                  _g89.push(v_e);
                }
              }
              const _a95 = _g89;
              for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                const v_f = _a95[_i96];
                if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
                if (!(true)) {
                  _q87 = false;
                  break Q88;
                }
              }
            }
            if (!(_q87)) return -1;
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
  const _g113: number[] = [];
  const _g130: number[] = [];
  const _g138: number[] = [];
  const facts = walledApartFacts;
  let fired = 0;
  let changed = false;
  const _m52_0 = b.made[0];
  _g113.length = 0;
  G114: {
    const _a117 = sp.edges;
    for (let _i118 = 0; _i118 < _a117.length; _i118++) {
      const v_e = _a117[_i118];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g113.push(v_e);
    }
  }
  const v_O = _g113;
  const _m55_1 = b.made[1];
  const _eg121 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a119 = sp.edges;
  for (let _i120 = 0; _i120 < _a119.length; _i120++) {
    const v_e = _a119[_i120];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg121.of(sp.edgeEnds[2 * v_e]);
    L122: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg121.of(v_b) === v_A))) break L122;
      L123: {
        const v_B = _eg121.of(v_b);
        let _q124 = false;
        Q125: {
          const _a126 = v_A;
          for (let _i127 = 0; _i127 < _a126.length; _i127++) {
            const v_x = _a126[_i127];
            const _a128 = sp.adj4[v_x];
            for (let _i129 = 0; _i129 < _a128.length; _i129++) {
              const v_y = _a128[_i129];
              if (!((_eg121.of(v_y) === v_B))) continue;
              if (((b.grid[sp.adj4Edges[v_x][_i129]] || -1) === 1)) {
                _q124 = true;
                break Q125;
              }
            }
          }
        }
        if (!(_q124)) break L123;
        if (b.made[0] !== _m52_0 || b.made[1] !== _m55_1) {
          _g130.length = 0;
          G131: {
            const _a134 = sp.edges;
            for (let _i135 = 0; _i135 < _a134.length; _i135++) {
              const v_e = _a134[_i135];
              if (!(((b.grid[v_e] || -1) === 2))) continue;
              _g130.push(v_e);
            }
          }
          if (!(sameSet(v_O, _g130))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _q136 = true;
        Q137: {
          _g138.length = 0;
          G139: {
            const _a142 = sp.edges;
            for (let _i143 = 0; _i143 < _a142.length; _i143++) {
              const v_e = _a142[_i143];
              if (!((((_eg121.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg121.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg121.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg121.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
              _g138.push(v_e);
            }
          }
          const _a144 = _g138;
          for (let _i145 = 0; _i145 < _a144.length; _i145++) {
            const v_f = _a144[_i145];
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
            if (!(true)) {
              _q136 = false;
              break Q137;
            }
          }
        }
        if (!(_q136)) return -1;
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
const _st182 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyWayBinding> | null): number {
  const _g165: number[] = [];
  const _g176: number[] = [];
  const _g188: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  const _m84_0 = b.made[0];
  _g165.length = 0;
  G166: {
    const _a169 = sp.edges;
    for (let _i170 = 0; _i170 < _a169.length; _i170++) {
      const v_e = _a169[_i170];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g165.push(v_e);
    }
  }
  const v_O = _g165;
  const _m87_1 = b.made[1];
  const _eg173 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a171 = sp.cells;
  for (let _i172 = 0; _i172 < _a171.length; _i172++) {
    const v_c = _a171[_i172];
    L174: {
      const v_A = _eg173.of(v_c);
      const _h175 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h175 < cl.k)))) break L174;
      _g176.length = 0;
      _st182.pass++;
      G177: {
        const _a183 = v_A;
        for (let _i184 = 0; _i184 < _a183.length; _i184++) {
          const v_x = _a183[_i184];
          const _a185 = sp.adj4[v_x];
          for (let _i186 = 0; _i186 < _a185.length; _i186++) {
            const v_s = _a185[_i186];
            if (!((!(_eg173.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i186]] || -1) !== 1)))) continue;
            const _t187 = v_s;
            if (_g176.length < 16) { if (!_g176.includes(_t187)) _g176.push(_t187); } else addOnce(_g176, _st182, _t187);
          }
        }
      }
      const v_S = _g176;
      const _h194 = v_S.length;
      if (b.made[0] !== _m84_0 || b.made[1] !== _m87_1) {
        _g188.length = 0;
        G189: {
          const _a192 = sp.edges;
          for (let _i193 = 0; _i193 < _a192.length; _i193++) {
            const v_e = _a192[_i193];
            if (!(((b.grid[v_e] || -1) === 2))) continue;
            _g188.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g188))) { return fired; }
      }
      facts.length = 0;
      changed = false;
      let _c203: boolean = (_h194 > 0);
      if (_c203) {
        let _c202: boolean = !((_h194 === 1));
        if (!_c202) {
          let _q195 = true;
          Q196: {
            const _a197 = v_A;
            for (let _i198 = 0; _i198 < _a197.length; _i198++) {
              const v_x = _a197[_i198];
              const _a199 = sp.adj4[v_x];
              for (let _i200 = 0; _i200 < _a199.length; _i200++) {
                const v_y = _a199[_i200];
                if (!((v_S.includes(v_y)))) continue;
                const _t201 = sp.adj4Edges[v_x][_i200];
                if (!(b.grid[_t201] !== 0)) { if (fire === null) { b.placeAt(_t201, 2); changed = true; } else facts.push(PLACE, _t201, 2); }
                if (!(true)) {
                  _q195 = false;
                  break Q196;
                }
              }
            }
          }
          _c202 = _q195;
        }
        _c203 = _c202;
      }
      if (!(_c203)) return -1;
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
