// Compiled by `npm run describe` from src/games/separate/separate.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, edgeGroups, keptEdgeGroups, rangeMask, through } from "../../engine/describe-runtime.ts";

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
  const _g179: number[] = [];
  const _g192: number[] = [];
  const _g208: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q177 = true;
  Q178: {
    _g179.length = 0;
    G180: {
      const _a183 = sp.edges;
      for (let _i184 = 0; _i184 < _a183.length; _i184++) {
        const v_e = _a183[_i184];
        const _h185 = (g[v_e] || -1);
        if (!((_h185 === 2))) continue;
        _g179.push(v_e);
      }
    }
    const v_O = _g179;
    const _eg189 = edgeGroups(sp, v_O);
    const _a186 = sp.edges;
    for (let _i187 = 0; _i187 < _a186.length; _i187++) {
      const v_e = _a186[_i187];
      const _h188 = (g[v_e] || -1);
      if (!(((_h188 === 1) === !(_eg189.of(sp.edgeEnds[2 * v_e + 1]) === _eg189.of(sp.edgeEnds[2 * v_e]))))) {
        _q177 = false;
        break Q178;
      }
    }
  }
  if (!(_q177)) return false;
  let _q190 = true;
  Q191: {
    _g192.length = 0;
    G193: {
      const _a196 = sp.edges;
      for (let _i197 = 0; _i197 < _a196.length; _i197++) {
        const v_e = _a196[_i197];
        const _h198 = (g[v_e] || -1);
        if (!((_h198 === 2))) continue;
        _g192.push(v_e);
      }
    }
    const v_O = _g192;
    const _eg201 = edgeGroups(sp, v_O);
    const _a199 = sp.cells;
    for (let _i200 = 0; _i200 < _a199.length; _i200++) {
      const v_c = _a199[_i200];
      const _h202 = _eg201.of(v_c).length;
      if (!((_h202 === cl.k))) {
        _q190 = false;
        break Q191;
      }
    }
  }
  if (!(_q190)) return false;
  for (let _k203 = 0; _k203 < cl.letter.at.length; _k203++) {
    const _at204 = cl.letter.at[_k203];
    const _v205 = cl.letter.v[_k203];
    let _q206 = true;
    Q207: {
      _g208.length = 0;
      G209: {
        const _a212 = sp.edges;
        for (let _i213 = 0; _i213 < _a212.length; _i213++) {
          const v_e = _a212[_i213];
          const _h214 = (g[v_e] || -1);
          if (!((_h214 === 2))) continue;
          _g208.push(v_e);
        }
      }
      const _a215 = through(sp, _at204, _g208);
      for (let _i216 = 0; _i216 < _a215.length; _i216++) {
        const v_x = _a215[_i216];
        if (!((v_x !== _at204))) continue;
        const _h217 = clueAt(cl.letter, v_x);
        if (!((_h217 !== _v205))) {
          _q206 = false;
          break Q207;
        }
      }
    }
    if (!(_q206)) return false;
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
              if (fire !== null && !fire({ O: v_O, e: v_e, A: v_A, b: v_b, B: v_B, L: v_L, d: v_d, x: v_x, y: v_y }, facts)) return 1;
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
          if (fire !== null && !fire({ O: v_O, e: v_e, A: v_A, b: v_b, B: v_B }, facts)) return 1;
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
      G158: {
        const _a163 = v_A;
        for (let _i164 = 0; _i164 < _a163.length; _i164++) {
          const v_x = _a163[_i164];
          const _a165 = sp.adj4[v_x];
          for (let _i166 = 0; _i166 < _a165.length; _i166++) {
            const v_s = _a165[_i166];
            if (!((!(_eg154.of(v_s) === v_A) && ((b.grid[sp.adj4Edges[v_x][_i166]] || -1) !== 1)))) continue;
            if (!_g157.includes(v_s)) _g157.push(v_s);
          }
        }
      }
      const v_S = _g157;
      const _h167 = v_S.length;
      facts.length = 0;
      changed = false;
      let _c176: boolean = (_h167 > 0);
      if (_c176) {
        let _c175: boolean = !((_h167 === 1));
        if (!_c175) {
          let _q168 = true;
          Q169: {
            const _a170 = v_A;
            for (let _i171 = 0; _i171 < _a170.length; _i171++) {
              const v_x = _a170[_i171];
              const _a172 = sp.adj4[v_x];
              for (let _i173 = 0; _i173 < _a172.length; _i173++) {
                const v_y = _a172[_i173];
                if (!((v_S.includes(v_y)))) continue;
                const _t174 = sp.adj4Edges[v_x][_i173];
                if (!(b.grid[_t174] !== 0)) { if (fire === null) { b.placeAt(_t174, 2); changed = true; } else facts.push(PLACE, _t174, 2); }
                if (!(true)) {
                  _q168 = false;
                  break Q169;
                }
              }
            }
          }
          _c175 = _q168;
        }
        _c176 = _c175;
      }
      if (!(_c176)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O, c: v_c, A: v_A, S: v_S }, facts)) return 1;
      }
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 2);
}
