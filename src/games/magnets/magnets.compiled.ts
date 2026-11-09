// Compiled by `npm run describe` from src/games/magnets/magnets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, clueAt, keptStore, least, perElement, perPlace, perValue, popcount, sameSet, stamps, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  tile: Partition;
  count: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "single" | "count" | "oddGap" | "marked" | "oneNeutral" | "everyTile" | "onlyEnd";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "pair" | "repel";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "pair" },
  { id: "repel" },
];

/** Every technique run as a value is struck from a cell, by id. */
export type StrikingId = "tile";

/** The techniques run as a value is struck from a cell, in the
 * description's order, each with the variation that adds it where one
 * does. */
export const striking: readonly { id: StrikingId; variation?: string }[] = [
  { id: "tile" },
];

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, the cap from which it no longer runs where it has one, and the
 * variation that adds it where one does, in the order the description
 * lists them, a variation's before the first of a higher tier. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [
  { id: "single", tier: 0 },
  { id: "count", tier: 0 },
  { id: "oddGap", tier: 0 },
  { id: "marked", tier: 1 },
  { id: "oneNeutral", tier: 1 },
  { id: "everyTile", tier: 1 },
  { id: "onlyEnd", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!(((v_d === 2) || (cl.tile.cells[cl.tile.of[v_c]].length === 2)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _k343 = othersKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q335 = true;
  Q336: {
    const _a337 = sp.cells;
    for (let _i338 = 0; _i338 < _a337.length; _i338++) {
      const v_c = _a337[_i338];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q335 = false;
        break Q336;
      }
    }
  }
  if (!(_q335)) return false;
  let _q339 = true;
  Q340: {
    const _a341 = sp.cells;
    for (let _i342 = 0; _i342 < _a341.length; _i342++) {
      const v_c = _a341[_i342];
      const _h347 = (g[v_c] || -1);
      const _h348 = (4 - _h347);
      const _a344 = (_k343[v_c] ?? others(sp, cl, v_c));
      for (let _i345 = 0; _i345 < _a344.length; _i345++) {
        const v_p = _a344[_i345];
        const _h346 = (g[v_p] || -1);
        if (!((_h346 === _h348))) {
          _q339 = false;
          break Q340;
        }
      }
    }
  }
  if (!(_q339)) return false;
  let _q349 = true;
  Q350: {
    const _a351 = sp.cells;
    for (let _i352 = 0; _i352 < _a351.length; _i352++) {
      const v_c = _a351[_i352];
      const _h353 = (g[v_c] || -1);
      if (!((_h353 !== 2))) continue;
      const _a354 = sp.adj4[v_c];
      for (let _i355 = 0; _i355 < _a354.length; _i355++) {
        const v_p = _a354[_i355];
        const _h356 = (g[v_p] || -1);
        if (!((_h356 !== _h353))) {
          _q349 = false;
          break Q350;
        }
      }
    }
  }
  if (!(_q349)) return false;
  for (let _k357 = 0; _k357 < cl.count.at.length; _k357++) {
    const _at358 = perElement(cl.count.at[_k357]);
    const _per360 = perValue(cl.count.at[_k357]);
    const _v359 = cl.count.v[_k357];
    let _g361 = 0;
    G362: {
      const _a363 = sp.lineCells[_at358];
      for (let _i364 = 0; _i364 < _a363.length; _i364++) {
        const v_c = _a363[_i364];
        const _h365 = (g[v_c] || -1);
        if (!((_h365 === _per360))) continue;
        _g361++;
      }
    }
    if (!((_g361 === _v359))) return false;
  }
  return true;
}

export interface PairBinding {
  c: number;
  p: number;
}

const pairFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<PairBinding> | null): number {
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  const _k13 = othersKept.board(cl);
  if (!((b.grid[v_c] !== 0))) return 0;
  const _a14 = (_k13[v_c] ?? others(sp, cl, v_c));
  for (let _i15 = 0; _i15 < _a14.length; _i15++) {
    const v_p = _a14[_i15];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    facts.length = 0;
    changed = false;
    const _t16 = (4 - (b.grid[v_c] || -1));
    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, _t16); changed = true; } else facts.push(PLACE, v_p, _t16); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface RepelBinding {
  c: number;
  p: number;
}

const repelFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function repel(b: Marks, sp: GridSpace, v_c: number, fire: Fire<RepelBinding> | null): number {
  const facts = repelFacts;
  let fired = 0;
  let changed = false;
  const _h21 = (b.grid[v_c] !== 0);
  const _h22 = (b.grid[v_c] || -1);
  if (!((_h21 && (_h22 !== 2)))) return 0;
  const _a23 = sp.adj4[v_c];
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_p = _a23[_i24];
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> _h22) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _h22); changed = true; } else facts.push(STRIKE, v_p, _h22); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface TileBinding {
  c: number;
  p: number;
}

const tileFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function tile(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<TileBinding> | null): number {
  const facts = tileFacts;
  let fired = 0;
  let changed = false;
  const _k29 = othersKept.board(cl);
  const _a30 = (_k29[v_c] ?? others(sp, cl, v_c));
  for (let _i31 = 0; _i31 < _a30.length; _i31++) {
    const v_p = _a30[_i31];
    facts.length = 0;
    changed = false;
    let _q32 = true;
    Q33: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!(!(((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        const _t34 = (4 - v_d);
        if ((((b.cands[v_p] >> _t34) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _t34); changed = true; } else facts.push(STRIKE, v_p, _t34); }
        if (!(true)) {
          _q32 = false;
          break Q33;
        }
      }
    }
    if (!(_q32)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface SingleBinding {
  c: number;
}

const singleFacts: number[] = [];
let singleCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding> | null): number {
  const facts = singleFacts;
  let fired = 0;
  let changed = false;
  if (singleCands.length < sp.cells.length) singleCands = new Int32Array(sp.cells.length);
  const cands = singleCands;
  cands.fill(-1);
  const _a37 = sp.cells;
  for (let _i38 = 0; _i38 < _a37.length; _i38++) {
    const v_c = _a37[_i38];
    if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))) continue;
    facts.length = 0;
    changed = false;
    let _c41: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c41) {
      let _c40: boolean = (b.grid[v_c] !== 0);
      if (!_c40) {
        const _t39 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t39); changed = true; } else facts.push(PLACE, v_c, _t39); }
        _c40 = true;
      }
      _c41 = _c40;
    }
    if (!(_c41)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface CountBinding {
  L: number;
  d: number;
  v: number;
  O: readonly number[];
}

const countFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g55: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  const _a51 = union(sp.cols, sp.rows);
  for (let _i52 = 0; _i52 < _a51.length; _i52++) {
    const v_L = _a51[_i52];
    for (let v_d = 1; v_d <= 3; v_d++) {
      const _h53 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L54: {
        const v_v = _h53;
        if (!((v_v >= 0))) break L54;
        _g55.length = 0;
        G56: {
          const _a59 = sp.lineCells[v_L];
          for (let _i60 = 0; _i60 < _a59.length; _i60++) {
            const v_c = _a59[_i60];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g55.push(v_c);
          }
        }
        const v_O = _g55;
        const _h65 = v_O.length;
        facts.length = 0;
        changed = false;
        let _g61 = 0;
        G62: {
          const _a63 = sp.lineCells[v_L];
          for (let _i64 = 0; _i64 < _a63.length; _i64++) {
            const v_c = _a63[_i64];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g61++;
          }
        }
        let _c71: boolean = ((_g61 <= v_v) && (_h65 >= (v_v - _g61)));
        if (_c71) {
          let _c70: boolean = (_g61 < v_v);
          if (!_c70) {
            let _q66 = true;
            Q67: {
              const _a68 = v_O;
              for (let _i69 = 0; _i69 < _a68.length; _i69++) {
                const v_c = _a68[_i69];
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q66 = false;
                  break Q67;
                }
              }
            }
            _c70 = _q66;
          }
          _c71 = _c70;
        }
        let _c81: boolean = _c71;
        if (_c81) {
          let _g72 = 0;
          G73: {
            const _a74 = sp.lineCells[v_L];
            for (let _i75 = 0; _i75 < _a74.length; _i75++) {
              const v_c = _a74[_i75];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g72++;
            }
          }
          let _c80: boolean = ((_g72 === v_v) || (_h65 > (v_v - _g72)));
          if (!_c80) {
            let _q76 = true;
            Q77: {
              const _a78 = v_O;
              for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                const v_c = _a78[_i79];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
                if (!(true)) {
                  _q76 = false;
                  break Q77;
                }
              }
            }
            _c80 = _q76;
          }
          _c81 = _c80;
        }
        if (!(_c81)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, O: v_O.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface OddGapBinding {
  L: number;
  n: number;
  d: number;
  O: readonly number[];
  S: readonly number[];
}

const oddGapFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function oddGap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OddGapBinding> | null): number {
  const _g134: number[] = [];
  const _g140: number[] = [];
  const facts = oddGapFacts;
  let fired = 0;
  let changed = false;
  const _a113 = union(sp.cols, sp.rows);
  R1:
  for (let _i114 = 0; _i114 < _a113.length; _i114++) {
    const v_L = _a113[_i114];
    const _h115 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L116: {
      const v_n = _h115;
      const _m72_0 = b.made[0];
      let _c121: boolean = (v_n >= 0);
      if (_c121) {
        let _g117 = 0;
        G118: {
          const _a119 = sp.lineCells[v_L];
          for (let _i120 = 0; _i120 < _a119.length; _i120++) {
            const v_c = _a119[_i120];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g117++;
          }
        }
        _c121 = (_g117 === v_n);
      }
      if (!(_c121)) break L116;
      for (let v_d = 1; v_d <= 3; v_d++) {
        const _h122 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        const _h123 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d))));
        let _c133: boolean = (((v_d !== 2) && (_h122 >= 0)) && (_h123 >= 0));
        if (_c133) {
          let _g124 = 0;
          G125: {
            const _a126 = sp.lineCells[v_L];
            for (let _i127 = 0; _i127 < _a126.length; _i127++) {
              const v_c = _a126[_i127];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g124++;
            }
          }
          const _t128 = (4 - v_d);
          let _g129 = 0;
          G130: {
            const _a131 = sp.lineCells[v_L];
            for (let _i132 = 0; _i132 < _a131.length; _i132++) {
              const v_c = _a131[_i132];
              if (!(((b.grid[v_c] || -1) === _t128))) continue;
              _g129++;
            }
          }
          _c133 = ((_h122 - _g124) === ((_h123 - _g129) + 1));
        }
        if (!(_c133)) continue;
        _g134.length = 0;
        G135: {
          const _a138 = sp.lineCells[v_L];
          for (let _i139 = 0; _i139 < _a138.length; _i139++) {
            const v_c = _a138[_i139];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g134.push(v_c);
          }
        }
        const v_O = _g134;
        _g140.length = 0;
        G141: {
          const _a144 = v_O;
          for (let _i145 = 0; _i145 < _a144.length; _i145++) {
            const v_c = _a144[_i145];
            const _h146 = stretch(sp.lineCells[v_L], v_c, v_O).length;
            if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((_h146 % 2) === 1)))) continue;
            _g140.push(v_c);
          }
        }
        L147: {
          const v_S = _g140;
          const _h148 = v_S.length;
          if (!((_h148 === 1))) break L147;
          if (b.made[0] !== _m72_0) {
            let _c153: boolean = (v_n >= 0);
            if (_c153) {
              let _g149 = 0;
              G150: {
                const _a151 = sp.lineCells[v_L];
                for (let _i152 = 0; _i152 < _a151.length; _i152++) {
                  const v_c = _a151[_i152];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g149++;
                }
              }
              _c153 = (_g149 === v_n);
            }
            if (!(_c153)) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          const _t154 = (v_S.length > 0 ? v_S[0] : -1);
          if (!(b.grid[_t154] !== 0)) { if (fire === null) { b.placeAt(_t154, v_d); changed = true; } else facts.push(PLACE, _t154, v_d); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, n: v_n, d: v_d, O: v_O.slice(), S: v_S.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface MarkedBinding {
  L: number;
  M: readonly number[];
  d: number;
  v: number;
}

const markedFacts: number[] = [];
let markedCands = new Int32Array(0);

/** Its dearest read grows with the board as n^0.5. */
export function marked(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MarkedBinding> | null): number {
  const _g181: number[] = [];
  const _g197: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  if (markedCands.length < sp.cells.length) markedCands = new Int32Array(sp.cells.length);
  const cands = markedCands;
  cands.fill(-1);
  inMagnetMarkedKept.clear();
  const _a177 = union(sp.cols, sp.rows);
  R1:
  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
    const v_L = _a177[_i178];
    const _m106_0 = b.made[0];
    const _m106_1 = b.made[1];
    let _q179 = false;
    Q180: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        if (true) {
          _q179 = true;
          break Q180;
        }
      }
    }
    if (!(_q179)) continue;
    _g181.length = 0;
    G182: {
      const _a185 = sp.lineCells[v_L];
      for (let _i186 = 0; _i186 < _a185.length; _i186++) {
        const v_c = _a185[_i186];
        if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
        _g181.push(v_c);
      }
    }
    L187: {
      const v_M = _g181;
      const _h188 = v_M.length;
      if (!((_h188 > 0))) break L187;
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        const _h189 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L190: {
          const v_v = _h189;
          let _c196: boolean = (v_v >= 0);
          if (_c196) {
            let _g191 = 0;
            G192: {
              const _a193 = sp.lineCells[v_L];
              for (let _i194 = 0; _i194 < _a193.length; _i194++) {
                const v_c = _a193[_i194];
                const _h195 = (b.grid[v_c] || -1);
                if (!((_h195 === v_d))) continue;
                _g191++;
              }
            }
            _c196 = ((2 * (v_v - _g191)) === _h188);
          }
          if (!(_c196)) break L190;
          if (b.made[0] !== _m106_0 || b.made[1] !== _m106_1) {
            _g197.length = 0;
            G198: {
              const _a201 = sp.lineCells[v_L];
              for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                const v_c = _a201[_i202];
                if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
                _g197.push(v_c);
              }
            }
            if (!(sameSet(v_M, _g197))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _q203 = true;
          Q204: {
            const _a205 = sp.lineCells[v_L];
            for (let _i206 = 0; _i206 < _a205.length; _i206++) {
              const v_c = _a205[_i206];
              const _h207 = (b.grid[v_c] !== 0);
              if (!((!(_h207) && !(v_M.includes(v_c))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q203 = false;
                break Q204;
              }
            }
          }
          if (!(_q203)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, M: v_M.slice(), d: v_d, v: v_v }, facts)) return 1;
            cands.fill(-1);
            inMagnetMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface OneNeutralBinding {
  L: number;
  n: number;
}

const oneNeutralFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function oneNeutral(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OneNeutralBinding> | null): number {
  const facts = oneNeutralFacts;
  let fired = 0;
  let changed = false;
  const _k231 = othersKept.board(cl);
  const _a216 = union(sp.cols, sp.rows);
  for (let _i217 = 0; _i217 < _a216.length; _i217++) {
    const v_L = _a216[_i217];
    const _h218 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L219: {
      const v_n = _h218;
      let _c225: boolean = (v_n >= 0);
      if (_c225) {
        let _g220 = 0;
        G221: {
          const _a222 = sp.lineCells[v_L];
          for (let _i223 = 0; _i223 < _a222.length; _i223++) {
            const v_c = _a222[_i223];
            const _h224 = (b.grid[v_c] || -1);
            if (!((_h224 === 2))) continue;
            _g220++;
          }
        }
        _c225 = ((_g220 + 1) === v_n);
      }
      if (!(_c225)) break L219;
      facts.length = 0;
      changed = false;
      let _q226 = true;
      Q227: {
        const _a228 = sp.lineCells[v_L];
        for (let _i229 = 0; _i229 < _a228.length; _i229++) {
          const v_c = _a228[_i229];
          const _h230 = (b.grid[v_c] !== 0);
          if (!(!(_h230))) continue;
          const _a232 = (_k231[v_c] ?? others(sp, cl, v_c));
          for (let _i233 = 0; _i233 < _a232.length; _i233++) {
            const v_p = _a232[_i233];
            const _h234 = (b.grid[v_p] !== 0);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h234)))) continue;
            if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
            if (!(true)) {
              _q226 = false;
              break Q227;
            }
          }
        }
      }
      if (!(_q226)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface EveryTileBinding {
  L: number;
  d: number;
  v: number;
  T: readonly number[];
}

const everyTileFacts: number[] = [];
const _st259 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function everyTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryTileBinding> | null): number {
  const _g255: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
  const _a251 = union(sp.cols, sp.rows);
  for (let _i252 = 0; _i252 < _a251.length; _i252++) {
    const v_L = _a251[_i252];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h253 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L254: {
        const v_v = _h253;
        if (!((v_v >= 0))) break L254;
        _g255.length = 0;
        _st259.pass++;
        G256: {
          const _a260 = sp.lineCells[v_L];
          for (let _i261 = 0; _i261 < _a260.length; _i261++) {
            const v_c = _a260[_i261];
            const _h262 = (b.grid[v_c] !== 0);
            if (!(!(_h262))) continue;
            const _t263 = cl.tile.of[v_c];
            const _t264 = _t263;
            if (_g255.length < 16) { if (!_g255.includes(_t264)) _g255.push(_t264); } else addOnce(_g255, _st259, _t264);
          }
        }
        L265: {
          const v_T = _g255;
          const _h266 = v_T.length;
          let _c272: boolean = (_h266 > 0);
          if (_c272) {
            let _g267 = 0;
            G268: {
              const _a269 = sp.lineCells[v_L];
              for (let _i270 = 0; _i270 < _a269.length; _i270++) {
                const v_c = _a269[_i270];
                const _h271 = (b.grid[v_c] || -1);
                if (!((_h271 === v_d))) continue;
                _g267++;
              }
            }
            _c272 = ((v_v - _g267) === _h266);
          }
          if (!(_c272)) break L265;
          facts.length = 0;
          changed = false;
          let _q273 = true;
          Q274: {
            const _a275 = sp.lineCells[v_L];
            for (let _i276 = 0; _i276 < _a275.length; _i276++) {
              const v_c = _a275[_i276];
              const _h277 = (b.grid[v_c] !== 0);
              if (!(!(_h277))) continue;
              if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q273 = false;
                break Q274;
              }
            }
          }
          if (!(_q273)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, T: v_T.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface OnlyEndBinding {
  L: number;
  d: number;
  v: number;
  O: readonly number[];
  T: readonly number[];
}

const onlyEndFacts: number[] = [];
const _st314 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function onlyEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyEndBinding> | null): number {
  const _g304: number[] = [];
  const _g310: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _k332 = othersKept.board(cl);
  const _a300 = union(sp.cols, sp.rows);
  for (let _i301 = 0; _i301 < _a300.length; _i301++) {
    const v_L = _a300[_i301];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h302 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L303: {
        const v_v = _h302;
        if (!((v_v >= 0))) break L303;
        _g304.length = 0;
        G305: {
          const _a308 = sp.lineCells[v_L];
          for (let _i309 = 0; _i309 < _a308.length; _i309++) {
            const v_c = _a308[_i309];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g304.push(v_c);
          }
        }
        const v_O = _g304;
        _g310.length = 0;
        _st314.pass++;
        G311: {
          const _a315 = v_O;
          for (let _i316 = 0; _i316 < _a315.length; _i316++) {
            const v_c = _a315[_i316];
            const _t317 = cl.tile.of[v_c];
            const _t318 = _t317;
            if (_g310.length < 16) { if (!_g310.includes(_t318)) _g310.push(_t318); } else addOnce(_g310, _st314, _t318);
          }
        }
        L319: {
          const v_T = _g310;
          const _h320 = v_T.length;
          let _c325: boolean = (_h320 > 0);
          if (_c325) {
            let _g321 = 0;
            G322: {
              const _a323 = sp.lineCells[v_L];
              for (let _i324 = 0; _i324 < _a323.length; _i324++) {
                const v_c = _a323[_i324];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g321++;
              }
            }
            _c325 = ((v_v - _g321) === _h320);
          }
          if (!(_c325)) break L319;
          facts.length = 0;
          changed = false;
          let _q326 = true;
          Q327: {
            const _a328 = v_O;
            for (let _i329 = 0; _i329 < _a328.length; _i329++) {
              const v_c = _a328[_i329];
              let _q330 = false;
              Q331: {
                const _a333 = (_k332[v_c] ?? others(sp, cl, v_c));
                for (let _i334 = 0; _i334 < _a333.length; _i334++) {
                  const v_p = _a333[_i334];
                  if ((v_O.includes(v_p))) {
                    _q330 = true;
                    break Q331;
                  }
                }
              }
              if (!(!(_q330))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q326 = false;
                break Q327;
              }
            }
          }
          if (!(_q326)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, O: v_O.slice(), T: v_T.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const othersKept = keptStore<readonly number[]>();
let othersOn: object | null = null;
let othersAt: Kept<readonly number[]> = [];

/** `others(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function others(_sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== othersOn) {
    othersAt = othersKept.board(cl);
    othersOn = cl;
  }
  const _kept: Kept<readonly number[]> = othersAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g5: number[] = [];
  G6: {
    const _a9 = cl.tile.cells[cl.tile.of[v_c]];
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_p = _a9[_i10];
      if (!((v_p !== v_c))) continue;
      _g5.push(v_p);
    }
  }
  const _made = _g5;
  _kept[v_c] = _made;
  return _made;
}

const inMagnetMarkedKept = new Map<number, boolean>();

/** `inMagnet(L, c)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function inMagnetMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_L: number, v_c: number): boolean {
  const _was = inMagnetMarkedKept.get((v_L + 1) * 1048577 + (v_c + 1));
  if (_was !== undefined) return _was;
  let _c167: boolean = (!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 2) & 1) !== 0));
  if (_c167) {
    let _q163 = false;
    Q164: {
      const _a165 = others(sp, cl, v_c);
      for (let _i166 = 0; _i166 < _a165.length; _i166++) {
        const v_p = _a165[_i166];
        if ((((sp.lineCells[v_L].includes(v_p)) && !((b.grid[v_p] !== 0))) && !(((b.cands[v_p] >> 2) & 1) !== 0))) {
          _q163 = true;
          break Q164;
        }
      }
    }
    _c167 = _q163;
  }
  const _made = _c167;
  inMagnetMarkedKept.set((v_L + 1) * 1048577 + (v_c + 1), _made);
  return _made;
}
