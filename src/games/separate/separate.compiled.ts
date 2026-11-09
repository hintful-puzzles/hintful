// Compiled by `npm run describe` from src/games/separate/separate.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, rangeMask, stamps, through } from "../../engine/describe-runtime.ts";

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
  const _g181: number[] = [];
  const _g194: number[] = [];
  const _g210: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q179 = true;
  Q180: {
    _g181.length = 0;
    G182: {
      const _a185 = sp.edges;
      for (let _i186 = 0; _i186 < _a185.length; _i186++) {
        const v_e = _a185[_i186];
        const _h187 = (g[v_e] || -1);
        if (!((_h187 === 2))) continue;
        _g181.push(v_e);
      }
    }
    const v_O = _g181;
    const _eg191 = edgeGroups(sp, v_O);
    const _a188 = sp.edges;
    for (let _i189 = 0; _i189 < _a188.length; _i189++) {
      const v_e = _a188[_i189];
      const _h190 = (g[v_e] || -1);
      if (!(((_h190 === 1) === !(_eg191.of(sp.edgeEnds[2 * v_e + 1]) === _eg191.of(sp.edgeEnds[2 * v_e]))))) {
        _q179 = false;
        break Q180;
      }
    }
  }
  if (!(_q179)) return false;
  let _q192 = true;
  Q193: {
    _g194.length = 0;
    G195: {
      const _a198 = sp.edges;
      for (let _i199 = 0; _i199 < _a198.length; _i199++) {
        const v_e = _a198[_i199];
        const _h200 = (g[v_e] || -1);
        if (!((_h200 === 2))) continue;
        _g194.push(v_e);
      }
    }
    const v_O = _g194;
    const _eg203 = edgeGroups(sp, v_O);
    const _a201 = sp.cells;
    for (let _i202 = 0; _i202 < _a201.length; _i202++) {
      const v_c = _a201[_i202];
      const _h204 = _eg203.of(v_c).length;
      if (!((_h204 === cl.k))) {
        _q192 = false;
        break Q193;
      }
    }
  }
  if (!(_q192)) return false;
  for (let _k205 = 0; _k205 < cl.letter.at.length; _k205++) {
    const _at206 = cl.letter.at[_k205];
    const _v207 = cl.letter.v[_k205];
    let _q208 = true;
    Q209: {
      _g210.length = 0;
      G211: {
        const _a214 = sp.edges;
        for (let _i215 = 0; _i215 < _a214.length; _i215++) {
          const v_e = _a214[_i215];
          const _h216 = (g[v_e] || -1);
          if (!((_h216 === 2))) continue;
          _g210.push(v_e);
        }
      }
      const _a217 = through(sp, _at206, _g210);
      for (let _i218 = 0; _i218 < _a217.length; _i218++) {
        const v_x = _a217[_i218];
        if (!((v_x !== _at206))) continue;
        const _h219 = clueAt(cl.letter, v_x);
        if (!((_h219 !== _v207))) {
          _q208 = false;
          break Q209;
        }
      }
    }
    if (!(_q208)) return false;
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
  const _g76: number[] = [];
  const facts = sharedLetterFacts;
  let fired = 0;
  let changed = false;
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
  const _eg44 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a42 = sp.edges;
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
            facts.length = 0;
            changed = false;
            let _q74 = true;
            Q75: {
              _g76.length = 0;
              G77: {
                const _a80 = sp.edges;
                for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                  const v_e = _a80[_i81];
                  if (!((((_eg44.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg44.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg44.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
                  _g76.push(v_e);
                }
              }
              const _a82 = _g76;
              for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                const v_f = _a82[_i83];
                if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
                if (!(true)) {
                  _q74 = false;
                  break Q75;
                }
              }
            }
            if (!(_q74)) return -1;
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
  const _g100: number[] = [];
  const _g119: number[] = [];
  const facts = walledApartFacts;
  let fired = 0;
  let changed = false;
  _g100.length = 0;
  G101: {
    const _a104 = sp.edges;
    for (let _i105 = 0; _i105 < _a104.length; _i105++) {
      const v_e = _a104[_i105];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g100.push(v_e);
    }
  }
  const v_O = _g100;
  const _eg108 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a106 = sp.edges;
  for (let _i107 = 0; _i107 < _a106.length; _i107++) {
    const v_e = _a106[_i107];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_A = _eg108.of(sp.edgeEnds[2 * v_e]);
    L109: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      if (!(!(_eg108.of(v_b) === v_A))) break L109;
      L110: {
        const v_B = _eg108.of(v_b);
        let _q111 = false;
        Q112: {
          const _a113 = v_A;
          for (let _i114 = 0; _i114 < _a113.length; _i114++) {
            const v_x = _a113[_i114];
            const _a115 = sp.adj4[v_x];
            for (let _i116 = 0; _i116 < _a115.length; _i116++) {
              const v_y = _a115[_i116];
              if (!((_eg108.of(v_y) === v_B))) continue;
              if (((b.grid[sp.adj4Edges[v_x][_i116]] || -1) === 1)) {
                _q111 = true;
                break Q112;
              }
            }
          }
        }
        if (!(_q111)) break L110;
        facts.length = 0;
        changed = false;
        let _q117 = true;
        Q118: {
          _g119.length = 0;
          G120: {
            const _a123 = sp.edges;
            for (let _i124 = 0; _i124 < _a123.length; _i124++) {
              const v_e = _a123[_i124];
              if (!((((_eg108.of(sp.edgeEnds[2 * v_e]) === v_A) && (_eg108.of(sp.edgeEnds[2 * v_e + 1]) === v_B)) || ((_eg108.of(sp.edgeEnds[2 * v_e]) === v_B) && (_eg108.of(sp.edgeEnds[2 * v_e + 1]) === v_A))))) continue;
              _g119.push(v_e);
            }
          }
          const _a125 = _g119;
          for (let _i126 = 0; _i126 < _a125.length; _i126++) {
            const v_f = _a125[_i126];
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 1); changed = true; } else facts.push(PLACE, v_f, 1); }
            if (!(true)) {
              _q117 = false;
              break Q118;
            }
          }
        }
        if (!(_q117)) return -1;
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
const _st163 = stamps();

/** Its dearest read grows with the board as n. */
export function onlyWay(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyWayBinding> | null): number {
  const _g146: number[] = [];
  const _g157: number[] = [];
  const facts = onlyWayFacts;
  let fired = 0;
  let changed = false;
  _g146.length = 0;
  G147: {
    const _a150 = sp.edges;
    for (let _i151 = 0; _i151 < _a150.length; _i151++) {
      const v_e = _a150[_i151];
      if (!(((b.grid[v_e] || -1) === 2))) continue;
      _g146.push(v_e);
    }
  }
  const v_O = _g146;
  const _eg154 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a152 = sp.cells;
  for (let _i153 = 0; _i153 < _a152.length; _i153++) {
    const v_c = _a152[_i153];
    L155: {
      const v_A = _eg154.of(v_c);
      const _h156 = v_A.length;
      if (!(((v_c === (v_A[0] ?? -1)) && (_h156 < cl.k)))) break L155;
      _g157.length = 0;
      _st163.pass++;
      G158: {
        const _a164 = v_A;
        for (let _i165 = 0; _i165 < _a164.length; _i165++) {
          const v_x = _a164[_i165];
          const _a166 = sp.adj4[v_x];
          for (let _i167 = 0; _i167 < _a166.length; _i167++) {
            const v_s = _a166[_i167];
            if (!((!(_eg154.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i167]] || -1) !== 1)))) continue;
            const _t168 = v_s;
            if (_g157.length < 16) { if (!_g157.includes(_t168)) _g157.push(_t168); } else addOnce(_g157, _st163, _t168);
          }
        }
      }
      const v_S = _g157;
      const _h169 = v_S.length;
      facts.length = 0;
      changed = false;
      let _c178: boolean = (_h169 > 0);
      if (_c178) {
        let _c177: boolean = !((_h169 === 1));
        if (!_c177) {
          let _q170 = true;
          Q171: {
            const _a172 = v_A;
            for (let _i173 = 0; _i173 < _a172.length; _i173++) {
              const v_x = _a172[_i173];
              const _a174 = sp.adj4[v_x];
              for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                const v_y = _a174[_i175];
                if (!((v_S.includes(v_y)))) continue;
                const _t176 = sp.adj4Edges[v_x][_i175];
                if (!(b.grid[_t176] !== 0)) { if (fire === null) { b.placeAt(_t176, 2); changed = true; } else facts.push(PLACE, _t176, 2); }
                if (!(true)) {
                  _q170 = false;
                  break Q171;
                }
              }
            }
          }
          _c177 = _q170;
        }
        _c178 = _c177;
      }
      if (!(_c178)) return -1;
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
