// Compiled by `npm run describe` from src/games/magnets/magnets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, clueAt, freshBinding, keptStore, least, perElement, perPlace, perValue, popcount, sameSet, staleChecking, stamps, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _k422 = othersKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q414 = true;
  Q415: {
    const _a416 = sp.cells;
    for (let _i417 = 0; _i417 < _a416.length; _i417++) {
      const v_c = _a416[_i417];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q414 = false;
        break Q415;
      }
    }
  }
  if (!(_q414)) return false;
  let _q418 = true;
  Q419: {
    const _a420 = sp.cells;
    for (let _i421 = 0; _i421 < _a420.length; _i421++) {
      const v_c = _a420[_i421];
      const _h426 = (g[v_c] || -1);
      const _h427 = (4 - _h426);
      const _a423 = (_k422[v_c] ?? others(sp, cl, v_c));
      for (let _i424 = 0; _i424 < _a423.length; _i424++) {
        const v_p = _a423[_i424];
        const _h425 = (g[v_p] || -1);
        if (!((_h425 === _h427))) {
          _q418 = false;
          break Q419;
        }
      }
    }
  }
  if (!(_q418)) return false;
  let _q428 = true;
  Q429: {
    const _a430 = sp.cells;
    for (let _i431 = 0; _i431 < _a430.length; _i431++) {
      const v_c = _a430[_i431];
      const _h432 = (g[v_c] || -1);
      if (!((_h432 !== 2))) continue;
      const _a433 = sp.adj4[v_c];
      for (let _i434 = 0; _i434 < _a433.length; _i434++) {
        const v_p = _a433[_i434];
        const _h435 = (g[v_p] || -1);
        if (!((_h435 !== _h432))) {
          _q428 = false;
          break Q429;
        }
      }
    }
  }
  if (!(_q428)) return false;
  for (let _k436 = 0; _k436 < cl.count.at.length; _k436++) {
    const _at437 = perElement(cl.count.at[_k436]);
    const _per439 = perValue(cl.count.at[_k436]);
    const _v438 = cl.count.v[_k436];
    let _g440 = 0;
    G441: {
      const _a442 = sp.lineCells[_at437];
      for (let _i443 = 0; _i443 < _a442.length; _i443++) {
        const v_c = _a442[_i443];
        const _h444 = (g[v_c] || -1);
        if (!((_h444 === _per439))) continue;
        _g440++;
      }
    }
    if (!((_g440 === _v438))) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("pair", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (others(sp, cl, v_c).includes(v_p)), !((b.grid[v_p] !== 0))], ["c in", "where of c", "p in", "where of p"]);
    }
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("repel", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((b.grid[v_c] || -1) !== 2)), (sp.adj4[v_c].includes(v_p))], ["c in", "where of c", "p in"]);
    }
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("tile", [(sp.cells.includes(v_c)), (others(sp, cl, v_c).includes(v_p))], ["c in", "p in"]);
    }
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("single", [(sp.cells.includes(v_c)), (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)], ["c in", "where of c"]);
    }
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
        const _h71 = v_O.length;
        if (import.meta.env.DEV && staleChecking) {
          const _g61: number[] = [];
          G62: {
            const _a65 = sp.lineCells[v_L];
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_c = _a65[_i66];
              if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
              _g61.push(v_c);
            }
          }
          freshBinding("count", [(union(sp.cols, sp.rows).includes(v_L)), ((1 <= v_d) && (v_d <= 3)), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v >= 0), sameSet(v_O, _g61)], ["L in", "d in", "v =", "where of v", "O ="]);
        }
        facts.length = 0;
        changed = false;
        let _g67 = 0;
        G68: {
          const _a69 = sp.lineCells[v_L];
          for (let _i70 = 0; _i70 < _a69.length; _i70++) {
            const v_c = _a69[_i70];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g67++;
          }
        }
        let _c77: boolean = ((_g67 <= v_v) && (_h71 >= (v_v - _g67)));
        if (_c77) {
          let _c76: boolean = (_g67 < v_v);
          if (!_c76) {
            let _q72 = true;
            Q73: {
              const _a74 = v_O;
              for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                const v_c = _a74[_i75];
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q72 = false;
                  break Q73;
                }
              }
            }
            _c76 = _q72;
          }
          _c77 = _c76;
        }
        let _c87: boolean = _c77;
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
          let _c86: boolean = ((_g78 === v_v) || (_h71 > (v_v - _g78)));
          if (!_c86) {
            let _q82 = true;
            Q83: {
              const _a84 = v_O;
              for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                const v_c = _a84[_i85];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
                if (!(true)) {
                  _q82 = false;
                  break Q83;
                }
              }
            }
            _c86 = _q82;
          }
          _c87 = _c86;
        }
        if (!(_c87)) return -1;
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
  const _g140: number[] = [];
  const _g146: number[] = [];
  const facts = oddGapFacts;
  let fired = 0;
  let changed = false;
  const _a119 = union(sp.cols, sp.rows);
  R1:
  for (let _i120 = 0; _i120 < _a119.length; _i120++) {
    const v_L = _a119[_i120];
    const _h121 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L122: {
      const v_n = _h121;
      const _m72_0 = b.made[0];
      let _c127: boolean = (v_n >= 0);
      if (_c127) {
        let _g123 = 0;
        G124: {
          const _a125 = sp.lineCells[v_L];
          for (let _i126 = 0; _i126 < _a125.length; _i126++) {
            const v_c = _a125[_i126];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g123++;
          }
        }
        _c127 = (_g123 === v_n);
      }
      if (!(_c127)) break L122;
      for (let v_d = 1; v_d <= 3; v_d++) {
        const _h128 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        const _h129 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d))));
        let _c139: boolean = (((v_d !== 2) && (_h128 >= 0)) && (_h129 >= 0));
        if (_c139) {
          let _g130 = 0;
          G131: {
            const _a132 = sp.lineCells[v_L];
            for (let _i133 = 0; _i133 < _a132.length; _i133++) {
              const v_c = _a132[_i133];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g130++;
            }
          }
          const _t134 = (4 - v_d);
          let _g135 = 0;
          G136: {
            const _a137 = sp.lineCells[v_L];
            for (let _i138 = 0; _i138 < _a137.length; _i138++) {
              const v_c = _a137[_i138];
              if (!(((b.grid[v_c] || -1) === _t134))) continue;
              _g135++;
            }
          }
          _c139 = ((_h128 - _g130) === ((_h129 - _g135) + 1));
        }
        if (!(_c139)) continue;
        _g140.length = 0;
        G141: {
          const _a144 = sp.lineCells[v_L];
          for (let _i145 = 0; _i145 < _a144.length; _i145++) {
            const v_c = _a144[_i145];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g140.push(v_c);
          }
        }
        const v_O = _g140;
        _g146.length = 0;
        G147: {
          const _a150 = v_O;
          for (let _i151 = 0; _i151 < _a150.length; _i151++) {
            const v_c = _a150[_i151];
            const _h152 = stretch(sp.lineCells[v_L], v_c, v_O).length;
            if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((_h152 % 2) === 1)))) continue;
            _g146.push(v_c);
          }
        }
        L153: {
          const v_S = _g146;
          const _h154 = v_S.length;
          if (!((_h154 === 1))) break L153;
          if (b.made[0] !== _m72_0) {
            let _c159: boolean = (v_n >= 0);
            if (_c159) {
              let _g155 = 0;
              G156: {
                const _a157 = sp.lineCells[v_L];
                for (let _i158 = 0; _i158 < _a157.length; _i158++) {
                  const v_c = _a157[_i158];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g155++;
                }
              }
              _c159 = (_g155 === v_n);
            }
            if (!(_c159)) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _c164: boolean = (v_n >= 0);
            if (_c164) {
              let _g160 = 0;
              G161: {
                const _a162 = sp.lineCells[v_L];
                for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                  const v_c = _a162[_i163];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g160++;
                }
              }
              _c164 = (_g160 === v_n);
            }
            let _c174: boolean = (((v_d !== 2) && (clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d))) >= 0)) && (clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d)))) >= 0));
            if (_c174) {
              let _g165 = 0;
              G166: {
                const _a167 = sp.lineCells[v_L];
                for (let _i168 = 0; _i168 < _a167.length; _i168++) {
                  const v_c = _a167[_i168];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g165++;
                }
              }
              const _t169 = (4 - v_d);
              let _g170 = 0;
              G171: {
                const _a172 = sp.lineCells[v_L];
                for (let _i173 = 0; _i173 < _a172.length; _i173++) {
                  const v_c = _a172[_i173];
                  if (!(((b.grid[v_c] || -1) === _t169))) continue;
                  _g170++;
                }
              }
              _c174 = ((clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d))) - _g165) === ((clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d)))) - _g170) + 1));
            }
            const _g175: number[] = [];
            G176: {
              const _a179 = sp.lineCells[v_L];
              for (let _i180 = 0; _i180 < _a179.length; _i180++) {
                const v_c = _a179[_i180];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g175.push(v_c);
              }
            }
            const _g181: number[] = [];
            G182: {
              const _a185 = v_O;
              for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                const v_c = _a185[_i186];
                if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((stretch(sp.lineCells[v_L], v_c, v_O).length % 2) === 1)))) continue;
                _g181.push(v_c);
              }
            }
            freshBinding("oddGap", [(union(sp.cols, sp.rows).includes(v_L)), (v_n === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)))), _c164, ((1 <= v_d) && (v_d <= 3)), _c174, sameSet(v_O, _g175), sameSet(v_S, _g181), (v_S.length === 1)], ["L in", "n =", "where of n", "d in", "where of d", "O =", "S =", "where of S"]);
          }
          facts.length = 0;
          changed = false;
          const _t187 = (v_S.length > 0 ? v_S[0] : -1);
          if (!(b.grid[_t187] !== 0)) { if (fire === null) { b.placeAt(_t187, v_d); changed = true; } else facts.push(PLACE, _t187, v_d); }
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
  const _g214: number[] = [];
  const _g230: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  if (markedCands.length < sp.cells.length) markedCands = new Int32Array(sp.cells.length);
  const cands = markedCands;
  cands.fill(-1);
  inMagnetMarkedKept.clear();
  const _a210 = union(sp.cols, sp.rows);
  R1:
  for (let _i211 = 0; _i211 < _a210.length; _i211++) {
    const v_L = _a210[_i211];
    const _m106_0 = b.made[0];
    const _m106_1 = b.made[1];
    let _q212 = false;
    Q213: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        if (true) {
          _q212 = true;
          break Q213;
        }
      }
    }
    if (!(_q212)) continue;
    _g214.length = 0;
    G215: {
      const _a218 = sp.lineCells[v_L];
      for (let _i219 = 0; _i219 < _a218.length; _i219++) {
        const v_c = _a218[_i219];
        if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
        _g214.push(v_c);
      }
    }
    L220: {
      const v_M = _g214;
      const _h221 = v_M.length;
      if (!((_h221 > 0))) break L220;
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        const _h222 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L223: {
          const v_v = _h222;
          let _c229: boolean = (v_v >= 0);
          if (_c229) {
            let _g224 = 0;
            G225: {
              const _a226 = sp.lineCells[v_L];
              for (let _i227 = 0; _i227 < _a226.length; _i227++) {
                const v_c = _a226[_i227];
                const _h228 = (b.grid[v_c] || -1);
                if (!((_h228 === v_d))) continue;
                _g224++;
              }
            }
            _c229 = ((2 * (v_v - _g224)) === _h221);
          }
          if (!(_c229)) break L223;
          if (b.made[0] !== _m106_0 || b.made[1] !== _m106_1) {
            _g230.length = 0;
            G231: {
              const _a234 = sp.lineCells[v_L];
              for (let _i235 = 0; _i235 < _a234.length; _i235++) {
                const v_c = _a234[_i235];
                if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
                _g230.push(v_c);
              }
            }
            if (!(sameSet(v_M, _g230))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g236: number[] = [];
            G237: {
              const _a240 = sp.lineCells[v_L];
              for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                const v_c = _a240[_i241];
                if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
                _g236.push(v_c);
              }
            }
            let _c246: boolean = (v_v >= 0);
            if (_c246) {
              let _g242 = 0;
              G243: {
                const _a244 = sp.lineCells[v_L];
                for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                  const v_c = _a244[_i245];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g242++;
                }
              }
              _c246 = ((2 * (v_v - _g242)) === v_M.length);
            }
            freshBinding("marked", [(union(sp.cols, sp.rows).includes(v_L)), sameSet(v_M, _g236), (v_M.length > 0), ((1 <= v_d) && (v_d <= 3)), (v_d !== 2), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), _c246], ["L in", "M =", "where of M", "d in", "where of d", "v =", "where of v"]);
          }
          facts.length = 0;
          changed = false;
          let _q247 = true;
          Q248: {
            const _a249 = sp.lineCells[v_L];
            for (let _i250 = 0; _i250 < _a249.length; _i250++) {
              const v_c = _a249[_i250];
              const _h251 = (b.grid[v_c] !== 0);
              if (!((!(_h251) && !(v_M.includes(v_c))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q247 = false;
                break Q248;
              }
            }
          }
          if (!(_q247)) return -1;
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
  const _k280 = othersKept.board(cl);
  const _a260 = union(sp.cols, sp.rows);
  for (let _i261 = 0; _i261 < _a260.length; _i261++) {
    const v_L = _a260[_i261];
    const _h262 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L263: {
      const v_n = _h262;
      let _c269: boolean = (v_n >= 0);
      if (_c269) {
        let _g264 = 0;
        G265: {
          const _a266 = sp.lineCells[v_L];
          for (let _i267 = 0; _i267 < _a266.length; _i267++) {
            const v_c = _a266[_i267];
            const _h268 = (b.grid[v_c] || -1);
            if (!((_h268 === 2))) continue;
            _g264++;
          }
        }
        _c269 = ((_g264 + 1) === v_n);
      }
      if (!(_c269)) break L263;
      if (import.meta.env.DEV && staleChecking) {
        let _c274: boolean = (v_n >= 0);
        if (_c274) {
          let _g270 = 0;
          G271: {
            const _a272 = sp.lineCells[v_L];
            for (let _i273 = 0; _i273 < _a272.length; _i273++) {
              const v_c = _a272[_i273];
              if (!(((b.grid[v_c] || -1) === 2))) continue;
              _g270++;
            }
          }
          _c274 = ((_g270 + 1) === v_n);
        }
        freshBinding("oneNeutral", [(union(sp.cols, sp.rows).includes(v_L)), (v_n === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)))), _c274], ["L in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _q275 = true;
      Q276: {
        const _a277 = sp.lineCells[v_L];
        for (let _i278 = 0; _i278 < _a277.length; _i278++) {
          const v_c = _a277[_i278];
          const _h279 = (b.grid[v_c] !== 0);
          if (!(!(_h279))) continue;
          const _a281 = (_k280[v_c] ?? others(sp, cl, v_c));
          for (let _i282 = 0; _i282 < _a281.length; _i282++) {
            const v_p = _a281[_i282];
            const _h283 = (b.grid[v_p] !== 0);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h283)))) continue;
            if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
            if (!(true)) {
              _q275 = false;
              break Q276;
            }
          }
        }
      }
      if (!(_q275)) return -1;
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
const _st308 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function everyTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryTileBinding> | null): number {
  const _g304: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
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
        _st308.pass++;
        G305: {
          const _a309 = sp.lineCells[v_L];
          for (let _i310 = 0; _i310 < _a309.length; _i310++) {
            const v_c = _a309[_i310];
            const _h311 = (b.grid[v_c] !== 0);
            if (!(!(_h311))) continue;
            const _t312 = cl.tile.of[v_c];
            const _t313 = _t312;
            if (_g304.length < 16) { if (!_g304.includes(_t313)) _g304.push(_t313); } else addOnce(_g304, _st308, _t313);
          }
        }
        L314: {
          const v_T = _g304;
          const _h315 = v_T.length;
          let _c321: boolean = (_h315 > 0);
          if (_c321) {
            let _g316 = 0;
            G317: {
              const _a318 = sp.lineCells[v_L];
              for (let _i319 = 0; _i319 < _a318.length; _i319++) {
                const v_c = _a318[_i319];
                const _h320 = (b.grid[v_c] || -1);
                if (!((_h320 === v_d))) continue;
                _g316++;
              }
            }
            _c321 = ((v_v - _g316) === _h315);
          }
          if (!(_c321)) break L314;
          if (import.meta.env.DEV && staleChecking) {
            const _g322: number[] = [];
            G323: {
              const _a326 = sp.lineCells[v_L];
              for (let _i327 = 0; _i327 < _a326.length; _i327++) {
                const v_c = _a326[_i327];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                const _t328 = cl.tile.of[v_c];
                if (!_g322.includes(_t328)) _g322.push(_t328);
              }
            }
            let _c333: boolean = (v_T.length > 0);
            if (_c333) {
              let _g329 = 0;
              G330: {
                const _a331 = sp.lineCells[v_L];
                for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                  const v_c = _a331[_i332];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g329++;
                }
              }
              _c333 = ((v_v - _g329) === v_T.length);
            }
            freshBinding("everyTile", [(union(sp.cols, sp.rows).includes(v_L)), ((1 <= v_d) && (v_d <= 3)), (v_d !== 2), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v >= 0), sameSet(v_T, _g322), _c333], ["L in", "d in", "where of d", "v =", "where of v", "T =", "where of T"]);
          }
          facts.length = 0;
          changed = false;
          let _q334 = true;
          Q335: {
            const _a336 = sp.lineCells[v_L];
            for (let _i337 = 0; _i337 < _a336.length; _i337++) {
              const v_c = _a336[_i337];
              const _h338 = (b.grid[v_c] !== 0);
              if (!(!(_h338))) continue;
              if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q334 = false;
                break Q335;
              }
            }
          }
          if (!(_q334)) return -1;
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
const _st375 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function onlyEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyEndBinding> | null): number {
  const _g365: number[] = [];
  const _g371: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _k411 = othersKept.board(cl);
  const _a361 = union(sp.cols, sp.rows);
  for (let _i362 = 0; _i362 < _a361.length; _i362++) {
    const v_L = _a361[_i362];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h363 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L364: {
        const v_v = _h363;
        if (!((v_v >= 0))) break L364;
        _g365.length = 0;
        G366: {
          const _a369 = sp.lineCells[v_L];
          for (let _i370 = 0; _i370 < _a369.length; _i370++) {
            const v_c = _a369[_i370];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g365.push(v_c);
          }
        }
        const v_O = _g365;
        _g371.length = 0;
        _st375.pass++;
        G372: {
          const _a376 = v_O;
          for (let _i377 = 0; _i377 < _a376.length; _i377++) {
            const v_c = _a376[_i377];
            const _t378 = cl.tile.of[v_c];
            const _t379 = _t378;
            if (_g371.length < 16) { if (!_g371.includes(_t379)) _g371.push(_t379); } else addOnce(_g371, _st375, _t379);
          }
        }
        L380: {
          const v_T = _g371;
          const _h381 = v_T.length;
          let _c386: boolean = (_h381 > 0);
          if (_c386) {
            let _g382 = 0;
            G383: {
              const _a384 = sp.lineCells[v_L];
              for (let _i385 = 0; _i385 < _a384.length; _i385++) {
                const v_c = _a384[_i385];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g382++;
              }
            }
            _c386 = ((v_v - _g382) === _h381);
          }
          if (!(_c386)) break L380;
          if (import.meta.env.DEV && staleChecking) {
            const _g387: number[] = [];
            G388: {
              const _a391 = sp.lineCells[v_L];
              for (let _i392 = 0; _i392 < _a391.length; _i392++) {
                const v_c = _a391[_i392];
                if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                _g387.push(v_c);
              }
            }
            const _g393: number[] = [];
            G394: {
              const _a397 = v_O;
              for (let _i398 = 0; _i398 < _a397.length; _i398++) {
                const v_c = _a397[_i398];
                const _t399 = cl.tile.of[v_c];
                if (!_g393.includes(_t399)) _g393.push(_t399);
              }
            }
            let _c404: boolean = (v_T.length > 0);
            if (_c404) {
              let _g400 = 0;
              G401: {
                const _a402 = sp.lineCells[v_L];
                for (let _i403 = 0; _i403 < _a402.length; _i403++) {
                  const v_c = _a402[_i403];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g400++;
                }
              }
              _c404 = ((v_v - _g400) === v_T.length);
            }
            freshBinding("onlyEnd", [(union(sp.cols, sp.rows).includes(v_L)), ((1 <= v_d) && (v_d <= 3)), (v_d !== 2), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v >= 0), sameSet(v_O, _g387), sameSet(v_T, _g393), _c404], ["L in", "d in", "where of d", "v =", "where of v", "O =", "T =", "where of T"]);
          }
          facts.length = 0;
          changed = false;
          let _q405 = true;
          Q406: {
            const _a407 = v_O;
            for (let _i408 = 0; _i408 < _a407.length; _i408++) {
              const v_c = _a407[_i408];
              let _q409 = false;
              Q410: {
                const _a412 = (_k411[v_c] ?? others(sp, cl, v_c));
                for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                  const v_p = _a412[_i413];
                  if ((v_O.includes(v_p))) {
                    _q409 = true;
                    break Q410;
                  }
                }
              }
              if (!(!(_q409))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q405 = false;
                break Q406;
              }
            }
          }
          if (!(_q405)) return -1;
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
  let _c200: boolean = (!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 2) & 1) !== 0));
  if (_c200) {
    let _q196 = false;
    Q197: {
      const _a198 = others(sp, cl, v_c);
      for (let _i199 = 0; _i199 < _a198.length; _i199++) {
        const v_p = _a198[_i199];
        if ((((sp.lineCells[v_L].includes(v_p)) && !((b.grid[v_p] !== 0))) && !(((b.cands[v_p] >> 2) & 1) !== 0))) {
          _q196 = true;
          break Q197;
        }
      }
    }
    _c200 = _q196;
  }
  const _made = _c200;
  inMagnetMarkedKept.set((v_L + 1) * 1048577 + (v_c + 1), _made);
  return _made;
}
