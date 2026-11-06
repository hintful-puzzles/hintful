// Compiled by `npm run describe` from src/games/sticks/sticks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, stretch, union } from "../../engine/describe-runtime.ts";

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
  let _g6 = 0;
  G7: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!(((v_d === 3) === (clueAt(cl.block, v_c) >= 0)))) continue;
      _g6 |= 1 << v_d;
    }
  }
  return _g6;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g309: number[] = [];
  const _g315: number[] = [];
  const _g329: number[] = [];
  const _g335: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q303 = true;
  Q304: {
    const _a305 = sp.cells;
    for (let _i306 = 0; _i306 < _a305.length; _i306++) {
      const v_c = _a305[_i306];
      let _g307 = 0;
      G308: {
        _g309.length = 0;
        G310: {
          const _a313 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i314 = 0; _i314 < _a313.length; _i314++) {
            const v_x = _a313[_i314];
            if (!(((g[v_x] || -1) === 1))) continue;
            _g309.push(v_x);
          }
        }
        _g315.length = 0;
        G316: {
          const _a319 = sp.lineCells[sp.colOf[v_c]];
          for (let _i320 = 0; _i320 < _a319.length; _i320++) {
            const v_x = _a319[_i320];
            if (!(((g[v_x] || -1) === 2))) continue;
            _g315.push(v_x);
          }
        }
        const _a321 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g309), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g315));
        for (let _i322 = 0; _i322 < _a321.length; _i322++) {
          const v_k = _a321[_i322];
          if (!((clueAt(cl.length, v_k) >= 0))) continue;
          _g307++;
        }
      }
      if (!((_g307 <= 1))) {
        _q303 = false;
        break Q304;
      }
    }
  }
  if (!(_q303)) return false;
  for (let _k323 = 0; _k323 < cl.block.at.length; _k323++) {
    const _at324 = cl.block.at[_k323];
    if (!(((g[_at324] || -1) === 3))) return false;
  }
  for (let _k326 = 0; _k326 < cl.length.at.length; _k326++) {
    const _at327 = cl.length.at[_k326];
    const _v328 = cl.length.v[_k326];
    _g329.length = 0;
    G330: {
      const _a333 = sp.lineCells[sp.rowOf[_at327]];
      for (let _i334 = 0; _i334 < _a333.length; _i334++) {
        const v_x = _a333[_i334];
        if (!(((g[v_x] || -1) === 1))) continue;
        _g329.push(v_x);
      }
    }
    _g335.length = 0;
    G336: {
      const _a339 = sp.lineCells[sp.colOf[_at327]];
      for (let _i340 = 0; _i340 < _a339.length; _i340++) {
        const v_x = _a339[_i340];
        if (!(((g[v_x] || -1) === 2))) continue;
        _g335.push(v_x);
      }
    }
    if (!((union(stretch(sp.lineCells[sp.rowOf[_at327]], _at327, _g329), stretch(sp.lineCells[sp.colOf[_at327]], _at327, _g335)).length === _v328))) return false;
  }
  for (let _k341 = 0; _k341 < cl.joins.at.length; _k341++) {
    const _at342 = cl.joins.at[_k341];
    const _v343 = cl.joins.v[_k341];
    let _g344 = 0;
    G345: {
      const _a346 = sp.adj4[_at342];
      for (let _i347 = 0; _i347 < _a346.length; _i347++) {
        const v_p = _a346[_i347];
        if (!(((((g[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === ((_at342 / sp.w) | 0))) || (((g[v_p] || -1) === 2) && ((v_p % sp.w) === (_at342 % sp.w)))))) continue;
        _g344++;
      }
    }
    if (!((_g344 === _v343))) return false;
  }
  return true;
}

export interface OverConnectedBinding {
  b: number;
  n: number;
}

const overConnectedFacts: number[] = [];
let overConnectedCands = new Int32Array(0);

export function overConnected(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverConnectedBinding> | null): number {
  const facts = overConnectedFacts;
  let fired = 0;
  let changed = false;
  if (overConnectedCands.length < sp.cells.length) overConnectedCands = new Int32Array(sp.cells.length);
  const cands = overConnectedCands;
  cands.fill(-1);
  const _a11 = sp.cells;
  for (let _i12 = 0; _i12 < _a11.length; _i12++) {
    const v_b = _a11[_i12];
    const _h13 = clueAt(cl.joins, v_b);
    const _h19 = ((v_b / sp.w) | 0);
    const _h20 = (v_b % sp.w);
    L14: {
      const v_n = _h13;
      if (!((v_n >= 0))) break L14;
      facts.length = 0;
      changed = false;
      let _g15 = 0;
      G16: {
        const _a17 = sp.adj4[v_b];
        for (let _i18 = 0; _i18 < _a17.length; _i18++) {
          const v_p = _a17[_i18];
          if (!((((b.value(v_p) === 1) && (((v_p / sp.w) | 0) === _h19)) || ((b.value(v_p) === 2) && ((v_p % sp.w) === _h20))))) continue;
          _g15++;
        }
      }
      let _c34: boolean = (_g15 <= v_n);
      if (_c34) {
        let _q21 = true;
        Q22: {
          const _a23 = sp.adj4[v_b];
          for (let _i24 = 0; _i24 < _a23.length; _i24++) {
            const v_c = _a23[_i24];
            const _h25 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h25 < 0)))) continue;
            for (let _m26 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m26 !== 0; _m26 &= _m26 - 1) {
              const v_a = 31 - Math.clz32(_m26 & -_m26);
              const _wc27 = v_c;
              const _wd28 = v_a;
              let _g29 = 0;
              G30: {
                const _a31 = sp.adj4[v_b];
                for (let _i32 = 0; _i32 < _a31.length; _i32++) {
                  const v_p = _a31[_i32];
                  if (!(((((v_p === _wc27 ? _wd28 : b.value(v_p)) === 1) && (((v_p / sp.w) | 0) === _h19)) || (((v_p === _wc27 ? _wd28 : b.value(v_p)) === 2) && ((v_p % sp.w) === _h20))))) continue;
                  _g29++;
                }
              }
              if (!((_g29 > v_n))) continue;
              const _t33 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t33); changed = true; } else facts.push(PLACE, v_c, _t33); }
              if (!(true)) {
                _q21 = false;
                break Q22;
              }
            }
          }
        }
        _c34 = _q21;
      }
      if (!(_c34)) return -1;
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

export function twoClues(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoCluesBinding> | null): number {
  const _g42: number[] = [];
  const _g48: number[] = [];
  const _g68: number[] = [];
  const _g75: number[] = [];
  const facts = twoCluesFacts;
  let fired = 0;
  let changed = false;
  if (twoCluesCands.length < sp.cells.length) twoCluesCands = new Int32Array(sp.cells.length);
  const cands = twoCluesCands;
  cands.fill(-1);
  const _a37 = sp.cells;
  for (let _i38 = 0; _i38 < _a37.length; _i38++) {
    const v_k = _a37[_i38];
    const _h39 = clueAt(cl.length, v_k);
    if (!((_h39 >= 0))) continue;
    const _h67 = sp.rowOf[v_k];
    const _h74 = sp.colOf[v_k];
    facts.length = 0;
    changed = false;
    let _g40 = 0;
    G41: {
      _g42.length = 0;
      G43: {
        const _a46 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i47 = 0; _i47 < _a46.length; _i47++) {
          const v_x = _a46[_i47];
          if (!((b.value(v_x) === 1))) continue;
          _g42.push(v_x);
        }
      }
      _g48.length = 0;
      G49: {
        const _a52 = sp.lineCells[sp.colOf[v_k]];
        for (let _i53 = 0; _i53 < _a52.length; _i53++) {
          const v_x = _a52[_i53];
          if (!((b.value(v_x) === 2))) continue;
          _g48.push(v_x);
        }
      }
      const _a54 = union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g42), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g48));
      for (let _i55 = 0; _i55 < _a54.length; _i55++) {
        const v_j = _a54[_i55];
        const _h56 = clueAt(cl.length, v_j);
        if (!((_h56 >= 0))) continue;
        _g40++;
      }
    }
    let _c85: boolean = (_g40 <= 1);
    if (_c85) {
      let _q57 = true;
      Q58: {
        const _a59 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
        for (let _i60 = 0; _i60 < _a59.length; _i60++) {
          const v_c = _a59[_i60];
          const _h61 = clueAt(cl.block, v_c);
          if (!((!(b.known(v_c)) && (_h61 < 0)))) continue;
          for (let _m62 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m62 !== 0; _m62 &= _m62 - 1) {
            const v_a = 31 - Math.clz32(_m62 & -_m62);
            const _wc63 = v_c;
            const _wd64 = v_a;
            let _g65 = 0;
            G66: {
              _g68.length = 0;
              G69: {
                const _a72 = sp.lineCells[_h67];
                for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                  const v_x = _a72[_i73];
                  if (!(((v_x === _wc63 ? _wd64 : b.value(v_x)) === 1))) continue;
                  _g68.push(v_x);
                }
              }
              _g75.length = 0;
              G76: {
                const _a79 = sp.lineCells[_h74];
                for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                  const v_x = _a79[_i80];
                  if (!(((v_x === _wc63 ? _wd64 : b.value(v_x)) === 2))) continue;
                  _g75.push(v_x);
                }
              }
              const _a81 = union(stretch(sp.lineCells[_h67], v_k, _g68), stretch(sp.lineCells[_h74], v_k, _g75));
              for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                const v_j = _a81[_i82];
                const _h83 = clueAt(cl.length, v_j);
                if (!((_h83 >= 0))) continue;
                _g65++;
              }
            }
            if (!((_g65 > 1))) continue;
            const _t84 = (3 - v_a);
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t84); changed = true; } else facts.push(PLACE, v_c, _t84); }
            if (!(true)) {
              _q57 = false;
              break Q58;
            }
          }
        }
      }
      _c85 = _q57;
    }
    if (!(_c85)) return -1;
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

export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding> | null): number {
  const _g93: number[] = [];
  const _g99: number[] = [];
  const _g114: number[] = [];
  const _g121: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  if (tooLongCands.length < sp.cells.length) tooLongCands = new Int32Array(sp.cells.length);
  const cands = tooLongCands;
  cands.fill(-1);
  const _a89 = sp.cells;
  for (let _i90 = 0; _i90 < _a89.length; _i90++) {
    const v_k = _a89[_i90];
    const _h91 = clueAt(cl.length, v_k);
    const _h113 = sp.rowOf[v_k];
    const _h120 = sp.colOf[v_k];
    L92: {
      const v_v = _h91;
      if (!((v_v >= 0))) break L92;
      facts.length = 0;
      changed = false;
      _g93.length = 0;
      G94: {
        const _a97 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i98 = 0; _i98 < _a97.length; _i98++) {
          const v_x = _a97[_i98];
          if (!((b.value(v_x) === 1))) continue;
          _g93.push(v_x);
        }
      }
      _g99.length = 0;
      G100: {
        const _a103 = sp.lineCells[sp.colOf[v_k]];
        for (let _i104 = 0; _i104 < _a103.length; _i104++) {
          const v_x = _a103[_i104];
          if (!((b.value(v_x) === 2))) continue;
          _g99.push(v_x);
        }
      }
      let _c128: boolean = (union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g93), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g99)).length <= v_v);
      if (_c128) {
        let _q105 = true;
        Q106: {
          const _a107 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i108 = 0; _i108 < _a107.length; _i108++) {
            const v_c = _a107[_i108];
            const _h109 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h109 < 0)))) continue;
            for (let _m110 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m110 !== 0; _m110 &= _m110 - 1) {
              const v_a = 31 - Math.clz32(_m110 & -_m110);
              const _wc111 = v_c;
              const _wd112 = v_a;
              _g114.length = 0;
              G115: {
                const _a118 = sp.lineCells[_h113];
                for (let _i119 = 0; _i119 < _a118.length; _i119++) {
                  const v_x = _a118[_i119];
                  if (!(((v_x === _wc111 ? _wd112 : b.value(v_x)) === 1))) continue;
                  _g114.push(v_x);
                }
              }
              _g121.length = 0;
              G122: {
                const _a125 = sp.lineCells[_h120];
                for (let _i126 = 0; _i126 < _a125.length; _i126++) {
                  const v_x = _a125[_i126];
                  if (!(((v_x === _wc111 ? _wd112 : b.value(v_x)) === 2))) continue;
                  _g121.push(v_x);
                }
              }
              if (!((union(stretch(sp.lineCells[_h113], v_k, _g114), stretch(sp.lineCells[_h120], v_k, _g121)).length > v_v))) continue;
              const _t127 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t127); changed = true; } else facts.push(PLACE, v_c, _t127); }
              if (!(true)) {
                _q105 = false;
                break Q106;
              }
            }
          }
        }
        _c128 = _q105;
      }
      if (!(_c128)) return -1;
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

export function starved(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedBinding> | null): number {
  const facts = starvedFacts;
  let fired = 0;
  let changed = false;
  if (starvedCands.length < sp.cells.length) starvedCands = new Int32Array(sp.cells.length);
  const cands = starvedCands;
  cands.fill(-1);
  const _a132 = sp.cells;
  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
    const v_b = _a132[_i133];
    const _h134 = clueAt(cl.joins, v_b);
    const _h141 = ((v_b / sp.w) | 0);
    const _h142 = (v_b % sp.w);
    L135: {
      const v_n = _h134;
      if (!((v_n >= 0))) break L135;
      facts.length = 0;
      changed = false;
      let _g136 = 0;
      G137: {
        const _a138 = sp.adj4[v_b];
        for (let _i139 = 0; _i139 < _a138.length; _i139++) {
          const v_p = _a138[_i139];
          const _h140 = clueAt(cl.block, v_p);
          if (!(((_h140 < 0) && (!(b.known(v_p)) || (((b.value(v_p) === 1) && (((v_p / sp.w) | 0) === _h141)) || ((b.value(v_p) === 2) && ((v_p % sp.w) === _h142))))))) continue;
          _g136++;
        }
      }
      let _c157: boolean = (_g136 >= v_n);
      if (_c157) {
        let _q143 = true;
        Q144: {
          const _a145 = sp.adj4[v_b];
          for (let _i146 = 0; _i146 < _a145.length; _i146++) {
            const v_c = _a145[_i146];
            const _h147 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h147 < 0)))) continue;
            for (let _m148 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m148 !== 0; _m148 &= _m148 - 1) {
              const v_a = 31 - Math.clz32(_m148 & -_m148);
              const _wc149 = v_c;
              const _wd150 = v_a;
              let _g151 = 0;
              G152: {
                const _a153 = sp.adj4[v_b];
                for (let _i154 = 0; _i154 < _a153.length; _i154++) {
                  const v_p = _a153[_i154];
                  const _h155 = clueAt(cl.block, v_p);
                  if (!(((_h155 < 0) && (!((v_p === _wc149 ? true : b.known(v_p))) || ((((v_p === _wc149 ? _wd150 : b.value(v_p)) === 1) && (((v_p / sp.w) | 0) === _h141)) || (((v_p === _wc149 ? _wd150 : b.value(v_p)) === 2) && ((v_p % sp.w) === _h142))))))) continue;
                  _g151++;
                }
              }
              if (!((_g151 < v_n))) continue;
              const _t156 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t156); changed = true; } else facts.push(PLACE, v_c, _t156); }
              if (!(true)) {
                _q143 = false;
                break Q144;
              }
            }
          }
        }
        _c157 = _q143;
      }
      if (!(_c157)) return -1;
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

export function unreachable(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UnreachableBinding> | null): number {
  const _g165: number[] = [];
  const _g187: number[] = [];
  const _g197: number[] = [];
  const _g219: number[] = [];
  const _g238: number[] = [];
  const _g259: number[] = [];
  const _g269: number[] = [];
  const _g290: number[] = [];
  const facts = unreachableFacts;
  let fired = 0;
  let changed = false;
  if (unreachableCands.length < sp.cells.length) unreachableCands = new Int32Array(sp.cells.length);
  const cands = unreachableCands;
  cands.fill(-1);
  const _a161 = sp.cells;
  for (let _i162 = 0; _i162 < _a161.length; _i162++) {
    const v_k = _a161[_i162];
    const _h163 = clueAt(cl.length, v_k);
    const _h183 = sp.rowOf[v_k];
    const _h215 = sp.colOf[v_k];
    L164: {
      const v_v = _h163;
      if (!((v_v >= 0))) break L164;
      facts.length = 0;
      changed = false;
      let _c229: boolean = !(b.known(v_k));
      if (!_c229) {
        _g165.length = 0;
        G166: {
          const _a181 = sp.lineCells[sp.rowOf[v_k]];
          for (let _i182 = 0; _i182 < _a181.length; _i182++) {
            const v_x = _a181[_i182];
            const _h184 = clueAt(cl.block, v_x);
            let _c196: boolean = ((_h184 < 0) && (!(b.known(v_x)) || (b.value(v_x) === 1)));
            if (_c196) {
              let _q185 = true;
              Q186: {
                _g187.length = 0;
                G188: {
                  const _a191 = sp.lineCells[_h183];
                  for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                    const v_z = _a191[_i192];
                    if (!(((b.value(v_z) === 1) || (v_z === v_x)))) continue;
                    _g187.push(v_z);
                  }
                }
                const _a193 = stretch(sp.lineCells[_h183], v_x, _g187);
                for (let _i194 = 0; _i194 < _a193.length; _i194++) {
                  const v_y = _a193[_i194];
                  const _h195 = clueAt(cl.length, v_y);
                  if (!(((v_y === v_k) || !((_h195 >= 0))))) {
                    _q185 = false;
                    break Q186;
                  }
                }
              }
              _c196 = _q185;
            }
            if (!(_c196)) continue;
            _g165.push(v_x);
          }
        }
        _g197.length = 0;
        G198: {
          const _a213 = sp.lineCells[sp.colOf[v_k]];
          for (let _i214 = 0; _i214 < _a213.length; _i214++) {
            const v_x = _a213[_i214];
            const _h216 = clueAt(cl.block, v_x);
            let _c228: boolean = ((_h216 < 0) && (!(b.known(v_x)) || (b.value(v_x) === 2)));
            if (_c228) {
              let _q217 = true;
              Q218: {
                _g219.length = 0;
                G220: {
                  const _a223 = sp.lineCells[_h215];
                  for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                    const v_z = _a223[_i224];
                    if (!(((b.value(v_z) === 2) || (v_z === v_x)))) continue;
                    _g219.push(v_z);
                  }
                }
                const _a225 = stretch(sp.lineCells[_h215], v_x, _g219);
                for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                  const v_y = _a225[_i226];
                  const _h227 = clueAt(cl.length, v_y);
                  if (!(((v_y === v_k) || !((_h227 >= 0))))) {
                    _q217 = false;
                    break Q218;
                  }
                }
              }
              _c228 = _q217;
            }
            if (!(_c228)) continue;
            _g197.push(v_x);
          }
        }
        _c229 = ((stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g165).length + stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g197).length) >= v_v);
      }
      let _c302: boolean = _c229;
      if (_c302) {
        let _q230 = true;
        Q231: {
          const _a232 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i233 = 0; _i233 < _a232.length; _i233++) {
            const v_c = _a232[_i233];
            const _h234 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h234 < 0)))) continue;
            for (let _m235 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m235 !== 0; _m235 &= _m235 - 1) {
              const v_a = 31 - Math.clz32(_m235 & -_m235);
              const _wc236 = v_c;
              const _wd237 = v_a;
              let _c300: boolean = (v_k === _wc236 ? true : b.known(v_k));
              if (_c300) {
                _g238.length = 0;
                G239: {
                  const _a254 = sp.lineCells[_h183];
                  for (let _i255 = 0; _i255 < _a254.length; _i255++) {
                    const v_x = _a254[_i255];
                    const _h256 = clueAt(cl.block, v_x);
                    let _c268: boolean = ((_h256 < 0) && (!((v_x === _wc236 ? true : b.known(v_x))) || ((v_x === _wc236 ? _wd237 : b.value(v_x)) === 1)));
                    if (_c268) {
                      let _q257 = true;
                      Q258: {
                        _g259.length = 0;
                        G260: {
                          const _a263 = sp.lineCells[_h183];
                          for (let _i264 = 0; _i264 < _a263.length; _i264++) {
                            const v_z = _a263[_i264];
                            if (!((((v_z === _wc236 ? _wd237 : b.value(v_z)) === 1) || (v_z === v_x)))) continue;
                            _g259.push(v_z);
                          }
                        }
                        const _a265 = stretch(sp.lineCells[_h183], v_x, _g259);
                        for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                          const v_y = _a265[_i266];
                          const _h267 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h267 >= 0))))) {
                            _q257 = false;
                            break Q258;
                          }
                        }
                      }
                      _c268 = _q257;
                    }
                    if (!(_c268)) continue;
                    _g238.push(v_x);
                  }
                }
                _g269.length = 0;
                G270: {
                  const _a285 = sp.lineCells[_h215];
                  for (let _i286 = 0; _i286 < _a285.length; _i286++) {
                    const v_x = _a285[_i286];
                    const _h287 = clueAt(cl.block, v_x);
                    let _c299: boolean = ((_h287 < 0) && (!((v_x === _wc236 ? true : b.known(v_x))) || ((v_x === _wc236 ? _wd237 : b.value(v_x)) === 2)));
                    if (_c299) {
                      let _q288 = true;
                      Q289: {
                        _g290.length = 0;
                        G291: {
                          const _a294 = sp.lineCells[_h215];
                          for (let _i295 = 0; _i295 < _a294.length; _i295++) {
                            const v_z = _a294[_i295];
                            if (!((((v_z === _wc236 ? _wd237 : b.value(v_z)) === 2) || (v_z === v_x)))) continue;
                            _g290.push(v_z);
                          }
                        }
                        const _a296 = stretch(sp.lineCells[_h215], v_x, _g290);
                        for (let _i297 = 0; _i297 < _a296.length; _i297++) {
                          const v_y = _a296[_i297];
                          const _h298 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h298 >= 0))))) {
                            _q288 = false;
                            break Q289;
                          }
                        }
                      }
                      _c299 = _q288;
                    }
                    if (!(_c299)) continue;
                    _g269.push(v_x);
                  }
                }
                _c300 = ((stretch(sp.lineCells[_h183], v_k, _g238).length + stretch(sp.lineCells[_h215], v_k, _g269).length) < v_v);
              }
              if (!(_c300)) continue;
              const _t301 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t301); changed = true; } else facts.push(PLACE, v_c, _t301); }
              if (!(true)) {
                _q230 = false;
                break Q231;
              }
            }
          }
        }
        _c302 = _q230;
      }
      if (!(_c302)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, v: v_v }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
