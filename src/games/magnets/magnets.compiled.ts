// Compiled by `npm run describe` from src/games/magnets/magnets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, clueAt, freshBinding, keptStore, least, perElement, perPlace, perValue, popcount, sameSet, staleChecking, stamps, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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
  const _k9 = othersKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q5 = true;
  Q6: {
    const _a7 = sp.cells;
    for (let _i8 = 0; _i8 < _a7.length; _i8++) {
      const v_c = _a7[_i8];
      const _h13 = (g[v_c] || -1);
      const _h14 = (4 - _h13);
      const _a10 = (_k9[v_c] ?? others(sp, cl, v_c));
      for (let _i11 = 0; _i11 < _a10.length; _i11++) {
        const v_p = _a10[_i11];
        const _h12 = (g[v_p] || -1);
        if (!((_h12 === _h14))) {
          _q5 = false;
          break Q6;
        }
      }
    }
  }
  if (!(_q5)) return false;
  let _q15 = true;
  Q16: {
    const _a17 = sp.cells;
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_c = _a17[_i18];
      const _h19 = (g[v_c] || -1);
      if (!((_h19 !== 2))) continue;
      const _a20 = sp.adj4[v_c];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_p = _a20[_i21];
        const _h22 = (g[v_p] || -1);
        if (!((_h22 !== _h19))) {
          _q15 = false;
          break Q16;
        }
      }
    }
  }
  if (!(_q15)) return false;
  for (let _k23 = 0; _k23 < cl.count.at.length; _k23++) {
    const _at24 = perElement(cl.count.at[_k23]);
    const _per26 = perValue(cl.count.at[_k23]);
    const _v25 = cl.count.v[_k23];
    let _g27 = 0;
    G28: {
      const _a29 = sp.lineCells[_at24];
      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
        const v_c = _a29[_i30];
        const _h31 = (g[v_c] || -1);
        if (!((_h31 === _per26))) continue;
        _g27++;
      }
    }
    if (!((_g27 === _v25))) return false;
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
  const _k5 = othersKept.board(cl);
  if (!((b.grid[v_c] !== 0))) return 0;
  const _a6 = (_k5[v_c] ?? others(sp, cl, v_c));
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_p = _a6[_i7];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    if (DEV && staleChecking) {
      freshBinding("pair", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (others(sp, cl, v_c).includes(v_p)), !((b.grid[v_p] !== 0))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    const _t8 = (4 - (b.grid[v_c] || -1));
    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, _t8); changed = true; } else facts.push(PLACE, v_p, _t8); }
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
  const _h5 = (b.grid[v_c] !== 0);
  const _h6 = (b.grid[v_c] || -1);
  if (!((_h5 && (_h6 !== 2)))) return 0;
  const _a7 = sp.adj4[v_c];
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_p = _a7[_i8];
    if (DEV && staleChecking) {
      freshBinding("repel", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((b.grid[v_c] || -1) !== 2)), (sp.adj4[v_c].includes(v_p))], ["c in", "where of c", "p in"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> _h6) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _h6); changed = true; } else facts.push(STRIKE, v_p, _h6); }
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
  const _k5 = othersKept.board(cl);
  const _a6 = (_k5[v_c] ?? others(sp, cl, v_c));
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_p = _a6[_i7];
    if (DEV && staleChecking) {
      freshBinding("tile", [(sp.cells.includes(v_c)), (others(sp, cl, v_c).includes(v_p))], ["c in", "p in"]);
    }
    facts.length = 0;
    changed = false;
    let _q8 = true;
    Q9: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!(!(((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        const _t10 = (4 - v_d);
        if ((((b.cands[v_p] >> _t10) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _t10); changed = true; } else facts.push(STRIKE, v_p, _t10); }
        if (!(true)) {
          _q8 = false;
          break Q9;
        }
      }
    }
    if (!(_q8)) return -1;
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
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))) continue;
    if (DEV && staleChecking) {
      freshBinding("single", [(sp.cells.includes(v_c)), (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c7: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c7) {
      let _c6: boolean = (b.grid[v_c] !== 0);
      if (!_c6) {
        const _t5 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t5); changed = true; } else facts.push(PLACE, v_c, _t5); }
        _c6 = true;
      }
      _c7 = _c6;
    }
    if (!(_c7)) return -1;
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
  const _g14: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  const _a10 = union(sp.cols, sp.rows);
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_L = _a10[_i11];
    for (let v_d = 1; v_d <= 3; v_d++) {
      const _h12 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L13: {
        const v_v = _h12;
        if (!((v_v >= 0))) break L13;
        _g14.length = 0;
        G15: {
          const _a18 = sp.lineCells[v_L];
          for (let _i19 = 0; _i19 < _a18.length; _i19++) {
            const v_c = _a18[_i19];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g14.push(v_c);
          }
        }
        const v_O = _g14;
        const _h30 = v_O.length;
        if (DEV && staleChecking) {
          const _g20: number[] = [];
          G21: {
            const _a24 = sp.lineCells[v_L];
            for (let _i25 = 0; _i25 < _a24.length; _i25++) {
              const v_c = _a24[_i25];
              if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
              _g20.push(v_c);
            }
          }
          freshBinding("count", [(union(sp.cols, sp.rows).includes(v_L)), ((1 <= v_d) && (v_d <= 3)), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v >= 0), sameSet(v_O, _g20)], ["L in", "d in", "v =", "where of v", "O ="]);
        }
        facts.length = 0;
        changed = false;
        let _g26 = 0;
        G27: {
          const _a28 = sp.lineCells[v_L];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_c = _a28[_i29];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g26++;
          }
        }
        let _c36: boolean = ((_g26 <= v_v) && (_h30 >= (v_v - _g26)));
        if (_c36) {
          let _c35: boolean = (_g26 < v_v);
          if (!_c35) {
            let _q31 = true;
            Q32: {
              const _a33 = v_O;
              for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                const v_c = _a33[_i34];
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q31 = false;
                  break Q32;
                }
              }
            }
            _c35 = _q31;
          }
          _c36 = _c35;
        }
        let _c46: boolean = _c36;
        if (_c46) {
          let _g37 = 0;
          G38: {
            const _a39 = sp.lineCells[v_L];
            for (let _i40 = 0; _i40 < _a39.length; _i40++) {
              const v_c = _a39[_i40];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g37++;
            }
          }
          let _c45: boolean = ((_g37 === v_v) || (_h30 > (v_v - _g37)));
          if (!_c45) {
            let _q41 = true;
            Q42: {
              const _a43 = v_O;
              for (let _i44 = 0; _i44 < _a43.length; _i44++) {
                const v_c = _a43[_i44];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
                if (!(true)) {
                  _q41 = false;
                  break Q42;
                }
              }
            }
            _c45 = _q41;
          }
          _c46 = _c45;
        }
        if (!(_c46)) return -1;
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
  const _g53: number[] = [];
  const _g59: number[] = [];
  const facts = oddGapFacts;
  let fired = 0;
  let changed = false;
  const _a32 = union(sp.cols, sp.rows);
  R1:
  for (let _i33 = 0; _i33 < _a32.length; _i33++) {
    const v_L = _a32[_i33];
    const _h34 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L35: {
      const v_n = _h34;
      const _m101_0 = b.made[0];
      let _c40: boolean = (v_n >= 0);
      if (_c40) {
        let _g36 = 0;
        G37: {
          const _a38 = sp.lineCells[v_L];
          for (let _i39 = 0; _i39 < _a38.length; _i39++) {
            const v_c = _a38[_i39];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g36++;
          }
        }
        _c40 = (_g36 === v_n);
      }
      if (!(_c40)) break L35;
      for (let v_d = 1; v_d <= 3; v_d++) {
        const _h41 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        const _h42 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d))));
        let _c52: boolean = (((v_d !== 2) && (_h41 >= 0)) && (_h42 >= 0));
        if (_c52) {
          let _g43 = 0;
          G44: {
            const _a45 = sp.lineCells[v_L];
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_c = _a45[_i46];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g43++;
            }
          }
          const _t47 = (4 - v_d);
          let _g48 = 0;
          G49: {
            const _a50 = sp.lineCells[v_L];
            for (let _i51 = 0; _i51 < _a50.length; _i51++) {
              const v_c = _a50[_i51];
              if (!(((b.grid[v_c] || -1) === _t47))) continue;
              _g48++;
            }
          }
          _c52 = ((_h41 - _g43) === ((_h42 - _g48) + 1));
        }
        if (!(_c52)) continue;
        _g53.length = 0;
        G54: {
          const _a57 = sp.lineCells[v_L];
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_c = _a57[_i58];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g53.push(v_c);
          }
        }
        const v_O = _g53;
        _g59.length = 0;
        G60: {
          const _a63 = v_O;
          for (let _i64 = 0; _i64 < _a63.length; _i64++) {
            const v_c = _a63[_i64];
            const _h65 = stretch(sp.lineCells[v_L], v_c, v_O).length;
            if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((_h65 % 2) === 1)))) continue;
            _g59.push(v_c);
          }
        }
        L66: {
          const v_S = _g59;
          const _h67 = v_S.length;
          if (!((_h67 === 1))) break L66;
          if (b.made[0] !== _m101_0) {
            let _c72: boolean = (v_n >= 0);
            if (_c72) {
              let _g68 = 0;
              G69: {
                const _a70 = sp.lineCells[v_L];
                for (let _i71 = 0; _i71 < _a70.length; _i71++) {
                  const v_c = _a70[_i71];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g68++;
                }
              }
              _c72 = (_g68 === v_n);
            }
            if (!(_c72)) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _c77: boolean = (v_n >= 0);
            if (_c77) {
              let _g73 = 0;
              G74: {
                const _a75 = sp.lineCells[v_L];
                for (let _i76 = 0; _i76 < _a75.length; _i76++) {
                  const v_c = _a75[_i76];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g73++;
                }
              }
              _c77 = (_g73 === v_n);
            }
            let _c87: boolean = (((v_d !== 2) && (clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d))) >= 0)) && (clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d)))) >= 0));
            if (_c87) {
              let _g78 = 0;
              G79: {
                const _a80 = sp.lineCells[v_L];
                for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                  const v_c = _a80[_i81];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g78++;
                }
              }
              const _t82 = (4 - v_d);
              let _g83 = 0;
              G84: {
                const _a85 = sp.lineCells[v_L];
                for (let _i86 = 0; _i86 < _a85.length; _i86++) {
                  const v_c = _a85[_i86];
                  if (!(((b.grid[v_c] || -1) === _t82))) continue;
                  _g83++;
                }
              }
              _c87 = ((clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d))) - _g78) === ((clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d)))) - _g83) + 1));
            }
            const _g88: number[] = [];
            G89: {
              const _a92 = sp.lineCells[v_L];
              for (let _i93 = 0; _i93 < _a92.length; _i93++) {
                const v_c = _a92[_i93];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g88.push(v_c);
              }
            }
            const _g94: number[] = [];
            G95: {
              const _a98 = v_O;
              for (let _i99 = 0; _i99 < _a98.length; _i99++) {
                const v_c = _a98[_i99];
                if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((stretch(sp.lineCells[v_L], v_c, v_O).length % 2) === 1)))) continue;
                _g94.push(v_c);
              }
            }
            freshBinding("oddGap", [(union(sp.cols, sp.rows).includes(v_L)), (v_n === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)))), _c77, ((1 <= v_d) && (v_d <= 3)), _c87, sameSet(v_O, _g88), sameSet(v_S, _g94), (v_S.length === 1)], ["L in", "n =", "where of n", "d in", "where of d", "O =", "S =", "where of S"]);
          }
          facts.length = 0;
          changed = false;
          const _t100 = (v_S.length > 0 ? v_S[0] : -1);
          if (!(b.grid[_t100] !== 0)) { if (fire === null) { b.placeAt(_t100, v_d); changed = true; } else facts.push(PLACE, _t100, v_d); }
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
  const _g22: number[] = [];
  const _g38: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  if (markedCands.length < sp.cells.length) markedCands = new Int32Array(sp.cells.length);
  const cands = markedCands;
  cands.fill(-1);
  inMagnetMarkedKept.clear();
  const _a18 = union(sp.cols, sp.rows);
  R1:
  for (let _i19 = 0; _i19 < _a18.length; _i19++) {
    const v_L = _a18[_i19];
    const _m60_0 = b.made[0];
    const _m61_1 = b.made[1];
    let _q20 = false;
    Q21: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        if (true) {
          _q20 = true;
          break Q21;
        }
      }
    }
    if (!(_q20)) continue;
    _g22.length = 0;
    G23: {
      const _a26 = sp.lineCells[v_L];
      for (let _i27 = 0; _i27 < _a26.length; _i27++) {
        const v_c = _a26[_i27];
        if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
        _g22.push(v_c);
      }
    }
    L28: {
      const v_M = _g22;
      const _h29 = v_M.length;
      if (!((_h29 > 0))) break L28;
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        const _h30 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L31: {
          const v_v = _h30;
          let _c37: boolean = (v_v >= 0);
          if (_c37) {
            let _g32 = 0;
            G33: {
              const _a34 = sp.lineCells[v_L];
              for (let _i35 = 0; _i35 < _a34.length; _i35++) {
                const v_c = _a34[_i35];
                const _h36 = (b.grid[v_c] || -1);
                if (!((_h36 === v_d))) continue;
                _g32++;
              }
            }
            _c37 = ((2 * (v_v - _g32)) === _h29);
          }
          if (!(_c37)) break L31;
          if (b.made[0] !== _m60_0 || b.made[1] !== _m61_1) {
            _g38.length = 0;
            G39: {
              const _a42 = sp.lineCells[v_L];
              for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                const v_c = _a42[_i43];
                if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
                _g38.push(v_c);
              }
            }
            if (!(sameSet(v_M, _g38))) { continue R1; }
          }
          if (DEV && staleChecking) {
            const _g44: number[] = [];
            G45: {
              const _a48 = sp.lineCells[v_L];
              for (let _i49 = 0; _i49 < _a48.length; _i49++) {
                const v_c = _a48[_i49];
                if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
                _g44.push(v_c);
              }
            }
            let _c54: boolean = (v_v >= 0);
            if (_c54) {
              let _g50 = 0;
              G51: {
                const _a52 = sp.lineCells[v_L];
                for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                  const v_c = _a52[_i53];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g50++;
                }
              }
              _c54 = ((2 * (v_v - _g50)) === v_M.length);
            }
            freshBinding("marked", [(union(sp.cols, sp.rows).includes(v_L)), sameSet(v_M, _g44), (v_M.length > 0), ((1 <= v_d) && (v_d <= 3)), (v_d !== 2), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), _c54], ["L in", "M =", "where of M", "d in", "where of d", "v =", "where of v"]);
          }
          facts.length = 0;
          changed = false;
          let _q55 = true;
          Q56: {
            const _a57 = sp.lineCells[v_L];
            for (let _i58 = 0; _i58 < _a57.length; _i58++) {
              const v_c = _a57[_i58];
              const _h59 = (b.grid[v_c] !== 0);
              if (!((!(_h59) && !(v_M.includes(v_c))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q55 = false;
                break Q56;
              }
            }
          }
          if (!(_q55)) return -1;
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
  const _k29 = othersKept.board(cl);
  const _a9 = union(sp.cols, sp.rows);
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_L = _a9[_i10];
    const _h11 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L12: {
      const v_n = _h11;
      let _c18: boolean = (v_n >= 0);
      if (_c18) {
        let _g13 = 0;
        G14: {
          const _a15 = sp.lineCells[v_L];
          for (let _i16 = 0; _i16 < _a15.length; _i16++) {
            const v_c = _a15[_i16];
            const _h17 = (b.grid[v_c] || -1);
            if (!((_h17 === 2))) continue;
            _g13++;
          }
        }
        _c18 = ((_g13 + 1) === v_n);
      }
      if (!(_c18)) break L12;
      if (DEV && staleChecking) {
        let _c23: boolean = (v_n >= 0);
        if (_c23) {
          let _g19 = 0;
          G20: {
            const _a21 = sp.lineCells[v_L];
            for (let _i22 = 0; _i22 < _a21.length; _i22++) {
              const v_c = _a21[_i22];
              if (!(((b.grid[v_c] || -1) === 2))) continue;
              _g19++;
            }
          }
          _c23 = ((_g19 + 1) === v_n);
        }
        freshBinding("oneNeutral", [(union(sp.cols, sp.rows).includes(v_L)), (v_n === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)))), _c23], ["L in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _q24 = true;
      Q25: {
        const _a26 = sp.lineCells[v_L];
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_c = _a26[_i27];
          const _h28 = (b.grid[v_c] !== 0);
          if (!(!(_h28))) continue;
          const _a30 = (_k29[v_c] ?? others(sp, cl, v_c));
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_p = _a30[_i31];
            const _h32 = (b.grid[v_p] !== 0);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h32)))) continue;
            if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
            if (!(true)) {
              _q24 = false;
              break Q25;
            }
          }
        }
      }
      if (!(_q24)) return -1;
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
const everyTile_st25 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function everyTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryTileBinding> | null): number {
  const _g21: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
  const _a17 = union(sp.cols, sp.rows);
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_L = _a17[_i18];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h19 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L20: {
        const v_v = _h19;
        if (!((v_v >= 0))) break L20;
        _g21.length = 0;
        everyTile_st25.pass++;
        G22: {
          const _a26 = sp.lineCells[v_L];
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_c = _a26[_i27];
            const _h28 = (b.grid[v_c] !== 0);
            if (!(!(_h28))) continue;
            const _t29 = cl.tile.of[v_c];
            const _t30 = _t29;
            if (_g21.length < 16) { if (!_g21.includes(_t30)) _g21.push(_t30); } else addOnce(_g21, everyTile_st25, _t30);
          }
        }
        L31: {
          const v_T = _g21;
          const _h32 = v_T.length;
          let _c38: boolean = (_h32 > 0);
          if (_c38) {
            let _g33 = 0;
            G34: {
              const _a35 = sp.lineCells[v_L];
              for (let _i36 = 0; _i36 < _a35.length; _i36++) {
                const v_c = _a35[_i36];
                const _h37 = (b.grid[v_c] || -1);
                if (!((_h37 === v_d))) continue;
                _g33++;
              }
            }
            _c38 = ((v_v - _g33) === _h32);
          }
          if (!(_c38)) break L31;
          if (DEV && staleChecking) {
            const _g39: number[] = [];
            G40: {
              const _a43 = sp.lineCells[v_L];
              for (let _i44 = 0; _i44 < _a43.length; _i44++) {
                const v_c = _a43[_i44];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                const _t45 = cl.tile.of[v_c];
                if (!_g39.includes(_t45)) _g39.push(_t45);
              }
            }
            let _c50: boolean = (v_T.length > 0);
            if (_c50) {
              let _g46 = 0;
              G47: {
                const _a48 = sp.lineCells[v_L];
                for (let _i49 = 0; _i49 < _a48.length; _i49++) {
                  const v_c = _a48[_i49];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g46++;
                }
              }
              _c50 = ((v_v - _g46) === v_T.length);
            }
            freshBinding("everyTile", [(union(sp.cols, sp.rows).includes(v_L)), ((1 <= v_d) && (v_d <= 3)), (v_d !== 2), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v >= 0), sameSet(v_T, _g39), _c50], ["L in", "d in", "where of d", "v =", "where of v", "T =", "where of T"]);
          }
          facts.length = 0;
          changed = false;
          let _q51 = true;
          Q52: {
            const _a53 = sp.lineCells[v_L];
            for (let _i54 = 0; _i54 < _a53.length; _i54++) {
              const v_c = _a53[_i54];
              const _h55 = (b.grid[v_c] !== 0);
              if (!(!(_h55))) continue;
              if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q51 = false;
                break Q52;
              }
            }
          }
          if (!(_q51)) return -1;
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
const onlyEnd_st37 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function onlyEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyEndBinding> | null): number {
  const _g27: number[] = [];
  const _g33: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _k73 = othersKept.board(cl);
  const _a23 = union(sp.cols, sp.rows);
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_L = _a23[_i24];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h25 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L26: {
        const v_v = _h25;
        if (!((v_v >= 0))) break L26;
        _g27.length = 0;
        G28: {
          const _a31 = sp.lineCells[v_L];
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_c = _a31[_i32];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g27.push(v_c);
          }
        }
        const v_O = _g27;
        _g33.length = 0;
        onlyEnd_st37.pass++;
        G34: {
          const _a38 = v_O;
          for (let _i39 = 0; _i39 < _a38.length; _i39++) {
            const v_c = _a38[_i39];
            const _t40 = cl.tile.of[v_c];
            const _t41 = _t40;
            if (_g33.length < 16) { if (!_g33.includes(_t41)) _g33.push(_t41); } else addOnce(_g33, onlyEnd_st37, _t41);
          }
        }
        L42: {
          const v_T = _g33;
          const _h43 = v_T.length;
          let _c48: boolean = (_h43 > 0);
          if (_c48) {
            let _g44 = 0;
            G45: {
              const _a46 = sp.lineCells[v_L];
              for (let _i47 = 0; _i47 < _a46.length; _i47++) {
                const v_c = _a46[_i47];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g44++;
              }
            }
            _c48 = ((v_v - _g44) === _h43);
          }
          if (!(_c48)) break L42;
          if (DEV && staleChecking) {
            const _g49: number[] = [];
            G50: {
              const _a53 = sp.lineCells[v_L];
              for (let _i54 = 0; _i54 < _a53.length; _i54++) {
                const v_c = _a53[_i54];
                if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                _g49.push(v_c);
              }
            }
            const _g55: number[] = [];
            G56: {
              const _a59 = v_O;
              for (let _i60 = 0; _i60 < _a59.length; _i60++) {
                const v_c = _a59[_i60];
                const _t61 = cl.tile.of[v_c];
                if (!_g55.includes(_t61)) _g55.push(_t61);
              }
            }
            let _c66: boolean = (v_T.length > 0);
            if (_c66) {
              let _g62 = 0;
              G63: {
                const _a64 = sp.lineCells[v_L];
                for (let _i65 = 0; _i65 < _a64.length; _i65++) {
                  const v_c = _a64[_i65];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g62++;
                }
              }
              _c66 = ((v_v - _g62) === v_T.length);
            }
            freshBinding("onlyEnd", [(union(sp.cols, sp.rows).includes(v_L)), ((1 <= v_d) && (v_d <= 3)), (v_d !== 2), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v >= 0), sameSet(v_O, _g49), sameSet(v_T, _g55), _c66], ["L in", "d in", "where of d", "v =", "where of v", "O =", "T =", "where of T"]);
          }
          facts.length = 0;
          changed = false;
          let _q67 = true;
          Q68: {
            const _a69 = v_O;
            for (let _i70 = 0; _i70 < _a69.length; _i70++) {
              const v_c = _a69[_i70];
              let _q71 = false;
              Q72: {
                const _a74 = (_k73[v_c] ?? others(sp, cl, v_c));
                for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                  const v_p = _a74[_i75];
                  if ((v_O.includes(v_p))) {
                    _q71 = true;
                    break Q72;
                  }
                }
              }
              if (!(!(_q71))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q67 = false;
                break Q68;
              }
            }
          }
          if (!(_q67)) return -1;
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
  const _g1: number[] = [];
  G2: {
    const _a5 = cl.tile.cells[cl.tile.of[v_c]];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_p = _a5[_i6];
      if (!((v_p !== v_c))) continue;
      _g1.push(v_p);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const inMagnetMarkedKept = new Map<number, boolean>();

/** `inMagnet(L, c)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function inMagnetMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_L: number, v_c: number): boolean {
  const _was = inMagnetMarkedKept.get((v_L + 1) * 1048577 + (v_c + 1));
  if (_was !== undefined) return _was;
  let _c5: boolean = (!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 2) & 1) !== 0));
  if (_c5) {
    let _q1 = false;
    Q2: {
      const _a3 = others(sp, cl, v_c);
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_p = _a3[_i4];
        if ((((sp.lineCells[v_L].includes(v_p)) && !((b.grid[v_p] !== 0))) && !(((b.cands[v_p] >> 2) & 1) !== 0))) {
          _q1 = true;
          break Q2;
        }
      }
    }
    _c5 = _q1;
  }
  const _made = _c5;
  inMagnetMarkedKept.set((v_L + 1) * 1048577 + (v_c + 1), _made);
  return _made;
}
