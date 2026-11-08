// Compiled by `npm run describe` from src/games/sticks/sticks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  block: ClueList;
  length: ClueList;
  joins: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "overConnected" | "twoClues" | "tooLong" | "starved" | "unreachable";

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
  { id: "overConnected", tier: 0 },
  { id: "twoClues", tier: 0 },
  { id: "tooLong", tier: 0 },
  { id: "starved", tier: 0 },
  { id: "unreachable", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g7 = 0;
  G8: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!(((v_d === 3) === (clueAt(cl.block, v_c) >= 0)))) continue;
      _g7 |= 1 << v_d;
    }
  }
  return _g7;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g307: number[] = [];
  const _g314: number[] = [];
  const _g330: number[] = [];
  const _g337: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q301 = true;
  Q302: {
    const _a303 = sp.cells;
    for (let _i304 = 0; _i304 < _a303.length; _i304++) {
      const v_c = _a303[_i304];
      let _g305 = 0;
      G306: {
        _g307.length = 0;
        G308: {
          const _a311 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i312 = 0; _i312 < _a311.length; _i312++) {
            const v_x = _a311[_i312];
            const _h313 = (g[v_x] || -1);
            if (!((_h313 === 1))) continue;
            _g307.push(v_x);
          }
        }
        _g314.length = 0;
        G315: {
          const _a318 = sp.lineCells[sp.colOf[v_c]];
          for (let _i319 = 0; _i319 < _a318.length; _i319++) {
            const v_x = _a318[_i319];
            const _h320 = (g[v_x] || -1);
            if (!((_h320 === 2))) continue;
            _g314.push(v_x);
          }
        }
        const _a321 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g307), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g314));
        for (let _i322 = 0; _i322 < _a321.length; _i322++) {
          const v_k = _a321[_i322];
          const _h323 = clueAt(cl.length, v_k);
          if (!((_h323 >= 0))) continue;
          _g305++;
        }
      }
      if (!((_g305 <= 1))) {
        _q301 = false;
        break Q302;
      }
    }
  }
  if (!(_q301)) return false;
  for (let _k324 = 0; _k324 < cl.block.at.length; _k324++) {
    const _at325 = cl.block.at[_k324];
    if (!(((g[_at325] || -1) === 3))) return false;
  }
  for (let _k327 = 0; _k327 < cl.length.at.length; _k327++) {
    const _at328 = cl.length.at[_k327];
    const _v329 = cl.length.v[_k327];
    _g330.length = 0;
    G331: {
      const _a334 = sp.lineCells[sp.rowOf[_at328]];
      for (let _i335 = 0; _i335 < _a334.length; _i335++) {
        const v_x = _a334[_i335];
        const _h336 = (g[v_x] || -1);
        if (!((_h336 === 1))) continue;
        _g330.push(v_x);
      }
    }
    _g337.length = 0;
    G338: {
      const _a341 = sp.lineCells[sp.colOf[_at328]];
      for (let _i342 = 0; _i342 < _a341.length; _i342++) {
        const v_x = _a341[_i342];
        const _h343 = (g[v_x] || -1);
        if (!((_h343 === 2))) continue;
        _g337.push(v_x);
      }
    }
    if (!((union(stretch(sp.lineCells[sp.rowOf[_at328]], _at328, _g330), stretch(sp.lineCells[sp.colOf[_at328]], _at328, _g337)).length === _v329))) return false;
  }
  for (let _k344 = 0; _k344 < cl.joins.at.length; _k344++) {
    const _at345 = cl.joins.at[_k344];
    const _v346 = cl.joins.v[_k344];
    let _g347 = 0;
    G348: {
      const _a349 = sp.adj4[_at345];
      for (let _i350 = 0; _i350 < _a349.length; _i350++) {
        const v_p = _a349[_i350];
        const _h351 = (g[v_p] || -1);
        if (!((((_h351 === 1) && (((v_p / sp.w) | 0) === ((_at345 / sp.w) | 0))) || ((_h351 === 2) && ((v_p % sp.w) === (_at345 % sp.w)))))) continue;
        _g347++;
      }
    }
    if (!((_g347 === _v346))) return false;
  }
  return true;
}

export interface OverConnectedBinding {
  b: number;
  n: number;
}

const overConnectedFacts: number[] = [];
let overConnectedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function overConnected(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverConnectedBinding> | null): number {
  const facts = overConnectedFacts;
  let fired = 0;
  let changed = false;
  if (overConnectedCands.length < sp.cells.length) overConnectedCands = new Int32Array(sp.cells.length);
  const cands = overConnectedCands;
  cands.fill(-1);
  const _a12 = sp.cells;
  for (let _i13 = 0; _i13 < _a12.length; _i13++) {
    const v_b = _a12[_i13];
    const _h14 = clueAt(cl.joins, v_b);
    const _h20 = ((v_b / sp.w) | 0);
    const _h21 = (v_b % sp.w);
    L15: {
      const v_n = _h14;
      if (!((v_n >= 0))) break L15;
      facts.length = 0;
      changed = false;
      let _g16 = 0;
      G17: {
        const _a18 = sp.adj4[v_b];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_p = _a18[_i19];
          if (!(((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h20)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h21))))) continue;
          _g16++;
        }
      }
      let _c35: boolean = (_g16 <= v_n);
      if (_c35) {
        let _q22 = true;
        Q23: {
          const _a24 = sp.adj4[v_b];
          for (let _i25 = 0; _i25 < _a24.length; _i25++) {
            const v_c = _a24[_i25];
            const _h26 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h26 < 0)))) continue;
            for (let _m27 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m27 !== 0; _m27 &= _m27 - 1) {
              const v_a = 31 - Math.clz32(_m27 & -_m27);
              const _wc28 = v_c;
              const _wd29 = v_a;
              let _g30 = 0;
              G31: {
                const _a32 = sp.adj4[v_b];
                for (let _i33 = 0; _i33 < _a32.length; _i33++) {
                  const v_p = _a32[_i33];
                  if (!(((((v_p === _wc28 ? _wd29 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h20)) || (((v_p === _wc28 ? _wd29 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h21))))) continue;
                  _g30++;
                }
              }
              if (!((_g30 > v_n))) continue;
              const _t34 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t34); changed = true; } else facts.push(PLACE, v_c, _t34); }
              if (!(true)) {
                _q22 = false;
                break Q23;
              }
            }
          }
        }
        _c35 = _q22;
      }
      if (!(_c35)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ b: v_b, n: v_n }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface TwoCluesBinding {
  k: number;
}

const twoCluesFacts: number[] = [];
let twoCluesCands = new Int32Array(0);

/** Its dearest read grows with the board as n^1.5. */
export function twoClues(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoCluesBinding> | null): number {
  const _g43: number[] = [];
  const _g49: number[] = [];
  const _g69: number[] = [];
  const _g76: number[] = [];
  const facts = twoCluesFacts;
  let fired = 0;
  let changed = false;
  if (twoCluesCands.length < sp.cells.length) twoCluesCands = new Int32Array(sp.cells.length);
  const cands = twoCluesCands;
  cands.fill(-1);
  const _a38 = sp.cells;
  for (let _i39 = 0; _i39 < _a38.length; _i39++) {
    const v_k = _a38[_i39];
    const _h40 = clueAt(cl.length, v_k);
    if (!((_h40 >= 0))) continue;
    const _h68 = sp.rowOf[v_k];
    const _h75 = sp.colOf[v_k];
    facts.length = 0;
    changed = false;
    let _g41 = 0;
    G42: {
      _g43.length = 0;
      G44: {
        const _a47 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_x = _a47[_i48];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g43.push(v_x);
        }
      }
      _g49.length = 0;
      G50: {
        const _a53 = sp.lineCells[sp.colOf[v_k]];
        for (let _i54 = 0; _i54 < _a53.length; _i54++) {
          const v_x = _a53[_i54];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g49.push(v_x);
        }
      }
      const _a55 = union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g43), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g49));
      for (let _i56 = 0; _i56 < _a55.length; _i56++) {
        const v_j = _a55[_i56];
        const _h57 = clueAt(cl.length, v_j);
        if (!((_h57 >= 0))) continue;
        _g41++;
      }
    }
    let _c86: boolean = (_g41 <= 1);
    if (_c86) {
      let _q58 = true;
      Q59: {
        const _a60 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
        for (let _i61 = 0; _i61 < _a60.length; _i61++) {
          const v_c = _a60[_i61];
          const _h62 = clueAt(cl.block, v_c);
          if (!((!((b.grid[v_c] !== 0)) && (_h62 < 0)))) continue;
          for (let _m63 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m63 !== 0; _m63 &= _m63 - 1) {
            const v_a = 31 - Math.clz32(_m63 & -_m63);
            const _wc64 = v_c;
            const _wd65 = v_a;
            let _g66 = 0;
            G67: {
              _g69.length = 0;
              G70: {
                const _a73 = sp.lineCells[_h68];
                for (let _i74 = 0; _i74 < _a73.length; _i74++) {
                  const v_x = _a73[_i74];
                  if (!(((v_x === _wc64 ? _wd65 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g69.push(v_x);
                }
              }
              _g76.length = 0;
              G77: {
                const _a80 = sp.lineCells[_h75];
                for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                  const v_x = _a80[_i81];
                  if (!(((v_x === _wc64 ? _wd65 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g76.push(v_x);
                }
              }
              const _a82 = union(stretch(sp.lineCells[_h68], v_k, _g69), stretch(sp.lineCells[_h75], v_k, _g76));
              for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                const v_j = _a82[_i83];
                const _h84 = clueAt(cl.length, v_j);
                if (!((_h84 >= 0))) continue;
                _g66++;
              }
            }
            if (!((_g66 > 1))) continue;
            const _t85 = (3 - v_a);
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t85); changed = true; } else facts.push(PLACE, v_c, _t85); }
            if (!(true)) {
              _q58 = false;
              break Q59;
            }
          }
        }
      }
      _c86 = _q58;
    }
    if (!(_c86)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface TooLongBinding {
  k: number;
  v: number;
}

const tooLongFacts: number[] = [];
let tooLongCands = new Int32Array(0);

/** Its dearest read grows with the board as n^1.5. */
export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding> | null): number {
  const _g94: number[] = [];
  const _g100: number[] = [];
  const _g115: number[] = [];
  const _g122: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  if (tooLongCands.length < sp.cells.length) tooLongCands = new Int32Array(sp.cells.length);
  const cands = tooLongCands;
  cands.fill(-1);
  const _a90 = sp.cells;
  for (let _i91 = 0; _i91 < _a90.length; _i91++) {
    const v_k = _a90[_i91];
    const _h92 = clueAt(cl.length, v_k);
    const _h114 = sp.rowOf[v_k];
    const _h121 = sp.colOf[v_k];
    L93: {
      const v_v = _h92;
      if (!((v_v >= 0))) break L93;
      facts.length = 0;
      changed = false;
      _g94.length = 0;
      G95: {
        const _a98 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i99 = 0; _i99 < _a98.length; _i99++) {
          const v_x = _a98[_i99];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g94.push(v_x);
        }
      }
      _g100.length = 0;
      G101: {
        const _a104 = sp.lineCells[sp.colOf[v_k]];
        for (let _i105 = 0; _i105 < _a104.length; _i105++) {
          const v_x = _a104[_i105];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g100.push(v_x);
        }
      }
      let _c129: boolean = (union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g94), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g100)).length <= v_v);
      if (_c129) {
        let _q106 = true;
        Q107: {
          const _a108 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i109 = 0; _i109 < _a108.length; _i109++) {
            const v_c = _a108[_i109];
            const _h110 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h110 < 0)))) continue;
            for (let _m111 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m111 !== 0; _m111 &= _m111 - 1) {
              const v_a = 31 - Math.clz32(_m111 & -_m111);
              const _wc112 = v_c;
              const _wd113 = v_a;
              _g115.length = 0;
              G116: {
                const _a119 = sp.lineCells[_h114];
                for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                  const v_x = _a119[_i120];
                  if (!(((v_x === _wc112 ? _wd113 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g115.push(v_x);
                }
              }
              _g122.length = 0;
              G123: {
                const _a126 = sp.lineCells[_h121];
                for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                  const v_x = _a126[_i127];
                  if (!(((v_x === _wc112 ? _wd113 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g122.push(v_x);
                }
              }
              if (!((union(stretch(sp.lineCells[_h114], v_k, _g115), stretch(sp.lineCells[_h121], v_k, _g122)).length > v_v))) continue;
              const _t128 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t128); changed = true; } else facts.push(PLACE, v_c, _t128); }
              if (!(true)) {
                _q106 = false;
                break Q107;
              }
            }
          }
        }
        _c129 = _q106;
      }
      if (!(_c129)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, v: v_v }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface StarvedBinding {
  b: number;
  n: number;
}

const starvedFacts: number[] = [];
let starvedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function starved(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedBinding> | null): number {
  const facts = starvedFacts;
  let fired = 0;
  let changed = false;
  if (starvedCands.length < sp.cells.length) starvedCands = new Int32Array(sp.cells.length);
  const cands = starvedCands;
  cands.fill(-1);
  const _a133 = sp.cells;
  for (let _i134 = 0; _i134 < _a133.length; _i134++) {
    const v_b = _a133[_i134];
    const _h135 = clueAt(cl.joins, v_b);
    const _h142 = ((v_b / sp.w) | 0);
    const _h143 = (v_b % sp.w);
    L136: {
      const v_n = _h135;
      if (!((v_n >= 0))) break L136;
      facts.length = 0;
      changed = false;
      let _g137 = 0;
      G138: {
        const _a139 = sp.adj4[v_b];
        for (let _i140 = 0; _i140 < _a139.length; _i140++) {
          const v_p = _a139[_i140];
          const _h141 = clueAt(cl.block, v_p);
          if (!(((_h141 < 0) && (!((b.grid[v_p] !== 0)) || ((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h142)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h143))))))) continue;
          _g137++;
        }
      }
      let _c158: boolean = (_g137 >= v_n);
      if (_c158) {
        let _q144 = true;
        Q145: {
          const _a146 = sp.adj4[v_b];
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_c = _a146[_i147];
            const _h148 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h148 < 0)))) continue;
            for (let _m149 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m149 !== 0; _m149 &= _m149 - 1) {
              const v_a = 31 - Math.clz32(_m149 & -_m149);
              const _wc150 = v_c;
              const _wd151 = v_a;
              let _g152 = 0;
              G153: {
                const _a154 = sp.adj4[v_b];
                for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                  const v_p = _a154[_i155];
                  const _h156 = clueAt(cl.block, v_p);
                  if (!(((_h156 < 0) && (!((v_p === _wc150 ? true : (b.grid[v_p] !== 0))) || ((((v_p === _wc150 ? _wd151 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h142)) || (((v_p === _wc150 ? _wd151 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h143))))))) continue;
                  _g152++;
                }
              }
              if (!((_g152 < v_n))) continue;
              const _t157 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t157); changed = true; } else facts.push(PLACE, v_c, _t157); }
              if (!(true)) {
                _q144 = false;
                break Q145;
              }
            }
          }
        }
        _c158 = _q144;
      }
      if (!(_c158)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ b: v_b, n: v_n }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface UnreachableBinding {
  k: number;
  v: number;
}

const unreachableFacts: number[] = [];
let unreachableCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function unreachable(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UnreachableBinding> | null): number {
  const _g235: number[] = [];
  const _g256: number[] = [];
  const _g267: number[] = [];
  const _g288: number[] = [];
  const facts = unreachableFacts;
  let fired = 0;
  let changed = false;
  if (unreachableCands.length < sp.cells.length) unreachableCands = new Int32Array(sp.cells.length);
  const cands = unreachableCands;
  cands.fill(-1);
  const _a162 = sp.cells;
  for (let _i163 = 0; _i163 < _a162.length; _i163++) {
    const v_k = _a162[_i163];
    const _h164 = clueAt(cl.length, v_k);
    const _h234 = sp.rowOf[v_k];
    const _h266 = sp.colOf[v_k];
    L165: {
      const v_v = _h164;
      if (!((v_v >= 0))) break L165;
      facts.length = 0;
      changed = false;
      let _c300: boolean = (!((b.grid[v_k] !== 0)) || (reach(b, sp, cl, v_k) >= v_v));
      if (_c300) {
        let _q226 = true;
        Q227: {
          const _a228 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i229 = 0; _i229 < _a228.length; _i229++) {
            const v_c = _a228[_i229];
            const _h230 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h230 < 0)))) continue;
            for (let _m231 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m231 !== 0; _m231 &= _m231 - 1) {
              const v_a = 31 - Math.clz32(_m231 & -_m231);
              const _wc232 = v_c;
              const _wd233 = v_a;
              let _c298: boolean = (v_k === _wc232 ? true : (b.grid[v_k] !== 0));
              if (_c298) {
                _g235.length = 0;
                G236: {
                  const _a251 = sp.lineCells[_h234];
                  for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                    const v_x = _a251[_i252];
                    const _h253 = clueAt(cl.block, v_x);
                    let _c265: boolean = ((_h253 < 0) && (!((v_x === _wc232 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc232 ? _wd233 : (b.grid[v_x] || -1)) === 1)));
                    if (_c265) {
                      let _q254 = true;
                      Q255: {
                        _g256.length = 0;
                        G257: {
                          const _a260 = sp.lineCells[_h234];
                          for (let _i261 = 0; _i261 < _a260.length; _i261++) {
                            const v_z = _a260[_i261];
                            if (!((((v_z === _wc232 ? _wd233 : (b.grid[v_z] || -1)) === 1) || (v_z === v_x)))) continue;
                            _g256.push(v_z);
                          }
                        }
                        const _a262 = stretch(sp.lineCells[_h234], v_x, _g256);
                        for (let _i263 = 0; _i263 < _a262.length; _i263++) {
                          const v_y = _a262[_i263];
                          const _h264 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h264 >= 0))))) {
                            _q254 = false;
                            break Q255;
                          }
                        }
                      }
                      _c265 = _q254;
                    }
                    if (!(_c265)) continue;
                    _g235.push(v_x);
                  }
                }
                _g267.length = 0;
                G268: {
                  const _a283 = sp.lineCells[_h266];
                  for (let _i284 = 0; _i284 < _a283.length; _i284++) {
                    const v_x = _a283[_i284];
                    const _h285 = clueAt(cl.block, v_x);
                    let _c297: boolean = ((_h285 < 0) && (!((v_x === _wc232 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc232 ? _wd233 : (b.grid[v_x] || -1)) === 2)));
                    if (_c297) {
                      let _q286 = true;
                      Q287: {
                        _g288.length = 0;
                        G289: {
                          const _a292 = sp.lineCells[_h266];
                          for (let _i293 = 0; _i293 < _a292.length; _i293++) {
                            const v_z = _a292[_i293];
                            if (!((((v_z === _wc232 ? _wd233 : (b.grid[v_z] || -1)) === 2) || (v_z === v_x)))) continue;
                            _g288.push(v_z);
                          }
                        }
                        const _a294 = stretch(sp.lineCells[_h266], v_x, _g288);
                        for (let _i295 = 0; _i295 < _a294.length; _i295++) {
                          const v_y = _a294[_i295];
                          const _h296 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h296 >= 0))))) {
                            _q286 = false;
                            break Q287;
                          }
                        }
                      }
                      _c297 = _q286;
                    }
                    if (!(_c297)) continue;
                    _g267.push(v_x);
                  }
                }
                _c298 = ((stretch(sp.lineCells[_h234], v_k, _g235).length + stretch(sp.lineCells[_h266], v_k, _g267).length) < v_v);
              }
              if (!(_c298)) continue;
              const _t299 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t299); changed = true; } else facts.push(PLACE, v_c, _t299); }
              if (!(true)) {
                _q226 = false;
                break Q227;
              }
            }
          }
        }
        _c300 = _q226;
      }
      if (!(_c300)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, v: v_v }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

const reachKept = keptStore<number>();

/** `reach(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): number {
  const _kept: Kept<number> = reachKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  const _g166: number[] = [];
  G167: {
    const _a182 = sp.lineCells[sp.rowOf[v_k]];
    for (let _i183 = 0; _i183 < _a182.length; _i183++) {
      const v_x = _a182[_i183];
      const _t184 = sp.rowOf[v_k];
      let _c195: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 1)));
      if (_c195) {
        let _q185 = true;
        Q186: {
          const _g187: number[] = [];
          G188: {
            const _a191 = sp.lineCells[_t184];
            for (let _i192 = 0; _i192 < _a191.length; _i192++) {
              const v_z = _a191[_i192];
              if (!((((b.grid[v_z] || -1) === 1) || (v_z === v_x)))) continue;
              _g187.push(v_z);
            }
          }
          const _a193 = stretch(sp.lineCells[_t184], v_x, _g187);
          for (let _i194 = 0; _i194 < _a193.length; _i194++) {
            const v_y = _a193[_i194];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q185 = false;
              break Q186;
            }
          }
        }
        _c195 = _q185;
      }
      if (!(_c195)) continue;
      _g166.push(v_x);
    }
  }
  const _g196: number[] = [];
  G197: {
    const _a212 = sp.lineCells[sp.colOf[v_k]];
    for (let _i213 = 0; _i213 < _a212.length; _i213++) {
      const v_x = _a212[_i213];
      const _t214 = sp.colOf[v_k];
      let _c225: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 2)));
      if (_c225) {
        let _q215 = true;
        Q216: {
          const _g217: number[] = [];
          G218: {
            const _a221 = sp.lineCells[_t214];
            for (let _i222 = 0; _i222 < _a221.length; _i222++) {
              const v_z = _a221[_i222];
              if (!((((b.grid[v_z] || -1) === 2) || (v_z === v_x)))) continue;
              _g217.push(v_z);
            }
          }
          const _a223 = stretch(sp.lineCells[_t214], v_x, _g217);
          for (let _i224 = 0; _i224 < _a223.length; _i224++) {
            const v_y = _a223[_i224];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q215 = false;
              break Q216;
            }
          }
        }
        _c225 = _q215;
      }
      if (!(_c225)) continue;
      _g196.push(v_x);
    }
  }
  const _made = (stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g166).length + stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g196).length);
  _kept[v_k] = _made;
  return _made;
}
