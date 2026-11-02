// Compiled by `npm run describe` from src/games/sticks/sticks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, rangeMask, stretch, union } from "../../engine/describe-runtime.ts";

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
    for (let _m9 = rangeMask(1, 3); _m9 !== 0; _m9 &= _m9 - 1) {
      const v_d = 31 - Math.clz32(_m9 & -_m9);
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
  const _g311: number[] = [];
  const _g317: number[] = [];
  const _g331: number[] = [];
  const _g337: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q305 = true;
  Q306: {
    const _a307 = sp.cells;
    for (let _i308 = 0; _i308 < _a307.length; _i308++) {
      const v_c = _a307[_i308];
      let _g309 = 0;
      G310: {
        _g311.length = 0;
        G312: {
          const _a315 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i316 = 0; _i316 < _a315.length; _i316++) {
            const v_x = _a315[_i316];
            if (!(((g[v_x] || -1) === 1))) continue;
            _g311.push(v_x);
          }
        }
        _g317.length = 0;
        G318: {
          const _a321 = sp.lineCells[sp.colOf[v_c]];
          for (let _i322 = 0; _i322 < _a321.length; _i322++) {
            const v_x = _a321[_i322];
            if (!(((g[v_x] || -1) === 2))) continue;
            _g317.push(v_x);
          }
        }
        const _a323 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g311), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g317));
        for (let _i324 = 0; _i324 < _a323.length; _i324++) {
          const v_k = _a323[_i324];
          if (!((clueAt(cl.length, v_k) >= 0))) continue;
          _g309++;
        }
      }
      if (!((_g309 <= 1))) {
        _q305 = false;
        break Q306;
      }
    }
  }
  if (!(_q305)) return false;
  for (let _k325 = 0; _k325 < cl.block.at.length; _k325++) {
    const _at326 = cl.block.at[_k325];
    if (!(((g[_at326] || -1) === 3))) return false;
  }
  for (let _k328 = 0; _k328 < cl.length.at.length; _k328++) {
    const _at329 = cl.length.at[_k328];
    const _v330 = cl.length.v[_k328];
    _g331.length = 0;
    G332: {
      const _a335 = sp.lineCells[sp.rowOf[_at329]];
      for (let _i336 = 0; _i336 < _a335.length; _i336++) {
        const v_x = _a335[_i336];
        if (!(((g[v_x] || -1) === 1))) continue;
        _g331.push(v_x);
      }
    }
    _g337.length = 0;
    G338: {
      const _a341 = sp.lineCells[sp.colOf[_at329]];
      for (let _i342 = 0; _i342 < _a341.length; _i342++) {
        const v_x = _a341[_i342];
        if (!(((g[v_x] || -1) === 2))) continue;
        _g337.push(v_x);
      }
    }
    if (!((union(stretch(sp.lineCells[sp.rowOf[_at329]], _at329, _g331), stretch(sp.lineCells[sp.colOf[_at329]], _at329, _g337)).length === _v330))) return false;
  }
  for (let _k343 = 0; _k343 < cl.joins.at.length; _k343++) {
    const _at344 = cl.joins.at[_k343];
    const _v345 = cl.joins.v[_k343];
    let _g346 = 0;
    G347: {
      const _a348 = sp.adj4[_at344];
      for (let _i349 = 0; _i349 < _a348.length; _i349++) {
        const v_p = _a348[_i349];
        if (!(((((g[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === ((_at344 / sp.w) | 0))) || (((g[v_p] || -1) === 2) && ((v_p % sp.w) === (_at344 % sp.w)))))) continue;
        _g346++;
      }
    }
    if (!((_g346 === _v345))) return false;
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
  const _a13 = sp.cells;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_b = _a13[_i14];
    const _h15 = clueAt(cl.joins, v_b);
    const _h21 = ((v_b / sp.w) | 0);
    const _h22 = (v_b % sp.w);
    L16: {
      const v_n = _h15;
      if (!((v_n >= 0))) break L16;
      facts.length = 0;
      changed = false;
      let _g17 = 0;
      G18: {
        const _a19 = sp.adj4[v_b];
        for (let _i20 = 0; _i20 < _a19.length; _i20++) {
          const v_p = _a19[_i20];
          if (!((((b.value(v_p) === 1) && (((v_p / sp.w) | 0) === _h21)) || ((b.value(v_p) === 2) && ((v_p % sp.w) === _h22))))) continue;
          _g17++;
        }
      }
      let _c36 = (_g17 <= v_n);
      if (_c36) {
        let _q23 = true;
        Q24: {
          const _a25 = sp.adj4[v_b];
          for (let _i26 = 0; _i26 < _a25.length; _i26++) {
            const v_c = _a25[_i26];
            const _h27 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h27 < 0)))) continue;
            for (let _m28 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m28 !== 0; _m28 &= _m28 - 1) {
              const v_a = 31 - Math.clz32(_m28 & -_m28);
              const _wc29 = v_c;
              const _wd30 = v_a;
              let _g31 = 0;
              G32: {
                const _a33 = sp.adj4[v_b];
                for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                  const v_p = _a33[_i34];
                  if (!(((((v_p === _wc29 ? _wd30 : b.value(v_p)) === 1) && (((v_p / sp.w) | 0) === _h21)) || (((v_p === _wc29 ? _wd30 : b.value(v_p)) === 2) && ((v_p % sp.w) === _h22))))) continue;
                  _g31++;
                }
              }
              if (!((_g31 > v_n))) continue;
              const _t35 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t35); changed = true; } else facts.push(PLACE, v_c, _t35); }
              if (!(true)) {
                _q23 = false;
                break Q24;
              }
            }
          }
        }
        _c36 = _q23;
      }
      if (!(_c36)) return -1;
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
  const _g44: number[] = [];
  const _g50: number[] = [];
  const _g70: number[] = [];
  const _g77: number[] = [];
  const facts = twoCluesFacts;
  let fired = 0;
  let changed = false;
  if (twoCluesCands.length < sp.cells.length) twoCluesCands = new Int32Array(sp.cells.length);
  const cands = twoCluesCands;
  cands.fill(-1);
  const _a39 = sp.cells;
  for (let _i40 = 0; _i40 < _a39.length; _i40++) {
    const v_k = _a39[_i40];
    const _h41 = clueAt(cl.length, v_k);
    if (!((_h41 >= 0))) continue;
    const _h69 = sp.rowOf[v_k];
    const _h76 = sp.colOf[v_k];
    facts.length = 0;
    changed = false;
    let _g42 = 0;
    G43: {
      _g44.length = 0;
      G45: {
        const _a48 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i49 = 0; _i49 < _a48.length; _i49++) {
          const v_x = _a48[_i49];
          if (!((b.value(v_x) === 1))) continue;
          _g44.push(v_x);
        }
      }
      _g50.length = 0;
      G51: {
        const _a54 = sp.lineCells[sp.colOf[v_k]];
        for (let _i55 = 0; _i55 < _a54.length; _i55++) {
          const v_x = _a54[_i55];
          if (!((b.value(v_x) === 2))) continue;
          _g50.push(v_x);
        }
      }
      const _a56 = union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g44), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g50));
      for (let _i57 = 0; _i57 < _a56.length; _i57++) {
        const v_j = _a56[_i57];
        const _h58 = clueAt(cl.length, v_j);
        if (!((_h58 >= 0))) continue;
        _g42++;
      }
    }
    let _c87 = (_g42 <= 1);
    if (_c87) {
      let _q59 = true;
      Q60: {
        const _a61 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
        for (let _i62 = 0; _i62 < _a61.length; _i62++) {
          const v_c = _a61[_i62];
          const _h63 = clueAt(cl.block, v_c);
          if (!((!(b.known(v_c)) && (_h63 < 0)))) continue;
          for (let _m64 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m64 !== 0; _m64 &= _m64 - 1) {
            const v_a = 31 - Math.clz32(_m64 & -_m64);
            const _wc65 = v_c;
            const _wd66 = v_a;
            let _g67 = 0;
            G68: {
              _g70.length = 0;
              G71: {
                const _a74 = sp.lineCells[_h69];
                for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                  const v_x = _a74[_i75];
                  if (!(((v_x === _wc65 ? _wd66 : b.value(v_x)) === 1))) continue;
                  _g70.push(v_x);
                }
              }
              _g77.length = 0;
              G78: {
                const _a81 = sp.lineCells[_h76];
                for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                  const v_x = _a81[_i82];
                  if (!(((v_x === _wc65 ? _wd66 : b.value(v_x)) === 2))) continue;
                  _g77.push(v_x);
                }
              }
              const _a83 = union(stretch(sp.lineCells[_h69], v_k, _g70), stretch(sp.lineCells[_h76], v_k, _g77));
              for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                const v_j = _a83[_i84];
                const _h85 = clueAt(cl.length, v_j);
                if (!((_h85 >= 0))) continue;
                _g67++;
              }
            }
            if (!((_g67 > 1))) continue;
            const _t86 = (3 - v_a);
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t86); changed = true; } else facts.push(PLACE, v_c, _t86); }
            if (!(true)) {
              _q59 = false;
              break Q60;
            }
          }
        }
      }
      _c87 = _q59;
    }
    if (!(_c87)) return -1;
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
  const _g95: number[] = [];
  const _g101: number[] = [];
  const _g116: number[] = [];
  const _g123: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  if (tooLongCands.length < sp.cells.length) tooLongCands = new Int32Array(sp.cells.length);
  const cands = tooLongCands;
  cands.fill(-1);
  const _a91 = sp.cells;
  for (let _i92 = 0; _i92 < _a91.length; _i92++) {
    const v_k = _a91[_i92];
    const _h93 = clueAt(cl.length, v_k);
    const _h115 = sp.rowOf[v_k];
    const _h122 = sp.colOf[v_k];
    L94: {
      const v_v = _h93;
      if (!((v_v >= 0))) break L94;
      facts.length = 0;
      changed = false;
      _g95.length = 0;
      G96: {
        const _a99 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i100 = 0; _i100 < _a99.length; _i100++) {
          const v_x = _a99[_i100];
          if (!((b.value(v_x) === 1))) continue;
          _g95.push(v_x);
        }
      }
      _g101.length = 0;
      G102: {
        const _a105 = sp.lineCells[sp.colOf[v_k]];
        for (let _i106 = 0; _i106 < _a105.length; _i106++) {
          const v_x = _a105[_i106];
          if (!((b.value(v_x) === 2))) continue;
          _g101.push(v_x);
        }
      }
      let _c130 = (union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g95), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g101)).length <= v_v);
      if (_c130) {
        let _q107 = true;
        Q108: {
          const _a109 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i110 = 0; _i110 < _a109.length; _i110++) {
            const v_c = _a109[_i110];
            const _h111 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h111 < 0)))) continue;
            for (let _m112 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m112 !== 0; _m112 &= _m112 - 1) {
              const v_a = 31 - Math.clz32(_m112 & -_m112);
              const _wc113 = v_c;
              const _wd114 = v_a;
              _g116.length = 0;
              G117: {
                const _a120 = sp.lineCells[_h115];
                for (let _i121 = 0; _i121 < _a120.length; _i121++) {
                  const v_x = _a120[_i121];
                  if (!(((v_x === _wc113 ? _wd114 : b.value(v_x)) === 1))) continue;
                  _g116.push(v_x);
                }
              }
              _g123.length = 0;
              G124: {
                const _a127 = sp.lineCells[_h122];
                for (let _i128 = 0; _i128 < _a127.length; _i128++) {
                  const v_x = _a127[_i128];
                  if (!(((v_x === _wc113 ? _wd114 : b.value(v_x)) === 2))) continue;
                  _g123.push(v_x);
                }
              }
              if (!((union(stretch(sp.lineCells[_h115], v_k, _g116), stretch(sp.lineCells[_h122], v_k, _g123)).length > v_v))) continue;
              const _t129 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t129); changed = true; } else facts.push(PLACE, v_c, _t129); }
              if (!(true)) {
                _q107 = false;
                break Q108;
              }
            }
          }
        }
        _c130 = _q107;
      }
      if (!(_c130)) return -1;
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
  const _a134 = sp.cells;
  for (let _i135 = 0; _i135 < _a134.length; _i135++) {
    const v_b = _a134[_i135];
    const _h136 = clueAt(cl.joins, v_b);
    const _h143 = ((v_b / sp.w) | 0);
    const _h144 = (v_b % sp.w);
    L137: {
      const v_n = _h136;
      if (!((v_n >= 0))) break L137;
      facts.length = 0;
      changed = false;
      let _g138 = 0;
      G139: {
        const _a140 = sp.adj4[v_b];
        for (let _i141 = 0; _i141 < _a140.length; _i141++) {
          const v_p = _a140[_i141];
          const _h142 = clueAt(cl.block, v_p);
          if (!(((_h142 < 0) && (!(b.known(v_p)) || (((b.value(v_p) === 1) && (((v_p / sp.w) | 0) === _h143)) || ((b.value(v_p) === 2) && ((v_p % sp.w) === _h144))))))) continue;
          _g138++;
        }
      }
      let _c159 = (_g138 >= v_n);
      if (_c159) {
        let _q145 = true;
        Q146: {
          const _a147 = sp.adj4[v_b];
          for (let _i148 = 0; _i148 < _a147.length; _i148++) {
            const v_c = _a147[_i148];
            const _h149 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h149 < 0)))) continue;
            for (let _m150 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m150 !== 0; _m150 &= _m150 - 1) {
              const v_a = 31 - Math.clz32(_m150 & -_m150);
              const _wc151 = v_c;
              const _wd152 = v_a;
              let _g153 = 0;
              G154: {
                const _a155 = sp.adj4[v_b];
                for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                  const v_p = _a155[_i156];
                  const _h157 = clueAt(cl.block, v_p);
                  if (!(((_h157 < 0) && (!((v_p === _wc151 ? true : b.known(v_p))) || ((((v_p === _wc151 ? _wd152 : b.value(v_p)) === 1) && (((v_p / sp.w) | 0) === _h143)) || (((v_p === _wc151 ? _wd152 : b.value(v_p)) === 2) && ((v_p % sp.w) === _h144))))))) continue;
                  _g153++;
                }
              }
              if (!((_g153 < v_n))) continue;
              const _t158 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t158); changed = true; } else facts.push(PLACE, v_c, _t158); }
              if (!(true)) {
                _q145 = false;
                break Q146;
              }
            }
          }
        }
        _c159 = _q145;
      }
      if (!(_c159)) return -1;
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
  const _g167: number[] = [];
  const _g189: number[] = [];
  const _g199: number[] = [];
  const _g221: number[] = [];
  const _g240: number[] = [];
  const _g261: number[] = [];
  const _g271: number[] = [];
  const _g292: number[] = [];
  const facts = unreachableFacts;
  let fired = 0;
  let changed = false;
  if (unreachableCands.length < sp.cells.length) unreachableCands = new Int32Array(sp.cells.length);
  const cands = unreachableCands;
  cands.fill(-1);
  const _a163 = sp.cells;
  for (let _i164 = 0; _i164 < _a163.length; _i164++) {
    const v_k = _a163[_i164];
    const _h165 = clueAt(cl.length, v_k);
    const _h185 = sp.rowOf[v_k];
    const _h217 = sp.colOf[v_k];
    L166: {
      const v_v = _h165;
      if (!((v_v >= 0))) break L166;
      facts.length = 0;
      changed = false;
      let _c231 = !(b.known(v_k));
      if (!_c231) {
        _g167.length = 0;
        G168: {
          const _a183 = sp.lineCells[sp.rowOf[v_k]];
          for (let _i184 = 0; _i184 < _a183.length; _i184++) {
            const v_x = _a183[_i184];
            const _h186 = clueAt(cl.block, v_x);
            let _c198 = ((_h186 < 0) && (!(b.known(v_x)) || (b.value(v_x) === 1)));
            if (_c198) {
              let _q187 = true;
              Q188: {
                _g189.length = 0;
                G190: {
                  const _a193 = sp.lineCells[_h185];
                  for (let _i194 = 0; _i194 < _a193.length; _i194++) {
                    const v_z = _a193[_i194];
                    if (!(((b.value(v_z) === 1) || (v_z === v_x)))) continue;
                    _g189.push(v_z);
                  }
                }
                const _a195 = stretch(sp.lineCells[_h185], v_x, _g189);
                for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                  const v_y = _a195[_i196];
                  const _h197 = clueAt(cl.length, v_y);
                  if (!(((v_y === v_k) || !((_h197 >= 0))))) {
                    _q187 = false;
                    break Q188;
                  }
                }
              }
              _c198 = _q187;
            }
            if (!(_c198)) continue;
            _g167.push(v_x);
          }
        }
        _g199.length = 0;
        G200: {
          const _a215 = sp.lineCells[sp.colOf[v_k]];
          for (let _i216 = 0; _i216 < _a215.length; _i216++) {
            const v_x = _a215[_i216];
            const _h218 = clueAt(cl.block, v_x);
            let _c230 = ((_h218 < 0) && (!(b.known(v_x)) || (b.value(v_x) === 2)));
            if (_c230) {
              let _q219 = true;
              Q220: {
                _g221.length = 0;
                G222: {
                  const _a225 = sp.lineCells[_h217];
                  for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                    const v_z = _a225[_i226];
                    if (!(((b.value(v_z) === 2) || (v_z === v_x)))) continue;
                    _g221.push(v_z);
                  }
                }
                const _a227 = stretch(sp.lineCells[_h217], v_x, _g221);
                for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                  const v_y = _a227[_i228];
                  const _h229 = clueAt(cl.length, v_y);
                  if (!(((v_y === v_k) || !((_h229 >= 0))))) {
                    _q219 = false;
                    break Q220;
                  }
                }
              }
              _c230 = _q219;
            }
            if (!(_c230)) continue;
            _g199.push(v_x);
          }
        }
        _c231 = ((stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g167).length + stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g199).length) >= v_v);
      }
      let _c304 = _c231;
      if (_c304) {
        let _q232 = true;
        Q233: {
          const _a234 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i235 = 0; _i235 < _a234.length; _i235++) {
            const v_c = _a234[_i235];
            const _h236 = clueAt(cl.block, v_c);
            if (!((!(b.known(v_c)) && (_h236 < 0)))) continue;
            for (let _m237 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m237 !== 0; _m237 &= _m237 - 1) {
              const v_a = 31 - Math.clz32(_m237 & -_m237);
              const _wc238 = v_c;
              const _wd239 = v_a;
              let _c302 = (v_k === _wc238 ? true : b.known(v_k));
              if (_c302) {
                _g240.length = 0;
                G241: {
                  const _a256 = sp.lineCells[_h185];
                  for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                    const v_x = _a256[_i257];
                    const _h258 = clueAt(cl.block, v_x);
                    let _c270 = ((_h258 < 0) && (!((v_x === _wc238 ? true : b.known(v_x))) || ((v_x === _wc238 ? _wd239 : b.value(v_x)) === 1)));
                    if (_c270) {
                      let _q259 = true;
                      Q260: {
                        _g261.length = 0;
                        G262: {
                          const _a265 = sp.lineCells[_h185];
                          for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                            const v_z = _a265[_i266];
                            if (!((((v_z === _wc238 ? _wd239 : b.value(v_z)) === 1) || (v_z === v_x)))) continue;
                            _g261.push(v_z);
                          }
                        }
                        const _a267 = stretch(sp.lineCells[_h185], v_x, _g261);
                        for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                          const v_y = _a267[_i268];
                          const _h269 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h269 >= 0))))) {
                            _q259 = false;
                            break Q260;
                          }
                        }
                      }
                      _c270 = _q259;
                    }
                    if (!(_c270)) continue;
                    _g240.push(v_x);
                  }
                }
                _g271.length = 0;
                G272: {
                  const _a287 = sp.lineCells[_h217];
                  for (let _i288 = 0; _i288 < _a287.length; _i288++) {
                    const v_x = _a287[_i288];
                    const _h289 = clueAt(cl.block, v_x);
                    let _c301 = ((_h289 < 0) && (!((v_x === _wc238 ? true : b.known(v_x))) || ((v_x === _wc238 ? _wd239 : b.value(v_x)) === 2)));
                    if (_c301) {
                      let _q290 = true;
                      Q291: {
                        _g292.length = 0;
                        G293: {
                          const _a296 = sp.lineCells[_h217];
                          for (let _i297 = 0; _i297 < _a296.length; _i297++) {
                            const v_z = _a296[_i297];
                            if (!((((v_z === _wc238 ? _wd239 : b.value(v_z)) === 2) || (v_z === v_x)))) continue;
                            _g292.push(v_z);
                          }
                        }
                        const _a298 = stretch(sp.lineCells[_h217], v_x, _g292);
                        for (let _i299 = 0; _i299 < _a298.length; _i299++) {
                          const v_y = _a298[_i299];
                          const _h300 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h300 >= 0))))) {
                            _q290 = false;
                            break Q291;
                          }
                        }
                      }
                      _c301 = _q290;
                    }
                    if (!(_c301)) continue;
                    _g271.push(v_x);
                  }
                }
                _c302 = ((stretch(sp.lineCells[_h185], v_k, _g240).length + stretch(sp.lineCells[_h217], v_k, _g271).length) < v_v);
              }
              if (!(_c302)) continue;
              const _t303 = (3 - v_a);
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t303); changed = true; } else facts.push(PLACE, v_c, _t303); }
              if (!(true)) {
                _q232 = false;
                break Q233;
              }
            }
          }
        }
        _c304 = _q232;
      }
      if (!(_c304)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, v: v_v }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
