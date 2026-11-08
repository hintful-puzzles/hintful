// Compiled by `npm run describe` from src/games/magnets/magnets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, clueAt, keptStore, least, perElement, perPlace, perValue, popcount, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g320: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q312 = true;
  Q313: {
    const _a314 = sp.cells;
    for (let _i315 = 0; _i315 < _a314.length; _i315++) {
      const v_c = _a314[_i315];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q312 = false;
        break Q313;
      }
    }
  }
  if (!(_q312)) return false;
  let _q316 = true;
  Q317: {
    const _a318 = sp.cells;
    for (let _i319 = 0; _i319 < _a318.length; _i319++) {
      const v_c = _a318[_i319];
      const _h329 = (g[v_c] || -1);
      const _h330 = (4 - _h329);
      _g320.length = 0;
      G321: {
        const _a324 = cl.tile.cells[cl.tile.of[v_c]];
        for (let _i325 = 0; _i325 < _a324.length; _i325++) {
          const v_p = _a324[_i325];
          if (!((v_p !== v_c))) continue;
          _g320.push(v_p);
        }
      }
      const _a326 = _g320;
      for (let _i327 = 0; _i327 < _a326.length; _i327++) {
        const v_p = _a326[_i327];
        const _h328 = (g[v_p] || -1);
        if (!((_h328 === _h330))) {
          _q316 = false;
          break Q317;
        }
      }
    }
  }
  if (!(_q316)) return false;
  let _q331 = true;
  Q332: {
    const _a333 = sp.cells;
    for (let _i334 = 0; _i334 < _a333.length; _i334++) {
      const v_c = _a333[_i334];
      const _h335 = (g[v_c] || -1);
      if (!((_h335 !== 2))) continue;
      const _a336 = sp.adj4[v_c];
      for (let _i337 = 0; _i337 < _a336.length; _i337++) {
        const v_p = _a336[_i337];
        const _h338 = (g[v_p] || -1);
        if (!((_h338 !== _h335))) {
          _q331 = false;
          break Q332;
        }
      }
    }
  }
  if (!(_q331)) return false;
  for (let _k339 = 0; _k339 < cl.count.at.length; _k339++) {
    const _at340 = perElement(cl.count.at[_k339]);
    const _per342 = perValue(cl.count.at[_k339]);
    const _v341 = cl.count.v[_k339];
    let _g343 = 0;
    G344: {
      const _a345 = sp.lineCells[_at340];
      for (let _i346 = 0; _i346 < _a345.length; _i346++) {
        const v_c = _a345[_i346];
        const _h347 = (g[v_c] || -1);
        if (!((_h347 === _per342))) continue;
        _g343++;
      }
    }
    if (!((_g343 === _v341))) return false;
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
  if (!((b.grid[v_c] !== 0))) return 0;
  const _a13 = others(sp, cl, v_c);
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_p = _a13[_i14];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    facts.length = 0;
    changed = false;
    const _t15 = (4 - (b.grid[v_c] || -1));
    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, _t15); changed = true; } else facts.push(PLACE, v_p, _t15); }
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
  const _h20 = (b.grid[v_c] !== 0);
  const _h21 = (b.grid[v_c] || -1);
  if (!((_h20 && (_h21 !== 2)))) return 0;
  const _a22 = sp.adj4[v_c];
  for (let _i23 = 0; _i23 < _a22.length; _i23++) {
    const v_p = _a22[_i23];
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> _h21) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _h21); changed = true; } else facts.push(STRIKE, v_p, _h21); }
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
  const _a28 = others(sp, cl, v_c);
  for (let _i29 = 0; _i29 < _a28.length; _i29++) {
    const v_p = _a28[_i29];
    facts.length = 0;
    changed = false;
    let _q30 = true;
    Q31: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!(!(((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        const _t32 = (4 - v_d);
        if ((((b.cands[v_p] >> _t32) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _t32); changed = true; } else facts.push(STRIKE, v_p, _t32); }
        if (!(true)) {
          _q30 = false;
          break Q31;
        }
      }
    }
    if (!(_q30)) return -1;
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
  const _a35 = sp.cells;
  for (let _i36 = 0; _i36 < _a35.length; _i36++) {
    const v_c = _a35[_i36];
    if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))) continue;
    facts.length = 0;
    changed = false;
    let _c39: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c39) {
      let _c38: boolean = (b.grid[v_c] !== 0);
      if (!_c38) {
        const _t37 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t37); changed = true; } else facts.push(PLACE, v_c, _t37); }
        _c38 = true;
      }
      _c39 = _c38;
    }
    if (!(_c39)) return -1;
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
  const _g53: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  const _a49 = union(sp.cols, sp.rows);
  for (let _i50 = 0; _i50 < _a49.length; _i50++) {
    const v_L = _a49[_i50];
    for (let v_d = 1; v_d <= 3; v_d++) {
      const _h51 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L52: {
        const v_v = _h51;
        if (!((v_v >= 0))) break L52;
        _g53.length = 0;
        G54: {
          const _a57 = sp.lineCells[v_L];
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_c = _a57[_i58];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g53.push(v_c);
          }
        }
        const v_O = _g53;
        const _h63 = v_O.length;
        facts.length = 0;
        changed = false;
        let _g59 = 0;
        G60: {
          const _a61 = sp.lineCells[v_L];
          for (let _i62 = 0; _i62 < _a61.length; _i62++) {
            const v_c = _a61[_i62];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g59++;
          }
        }
        let _c69: boolean = ((_g59 <= v_v) && (_h63 >= (v_v - _g59)));
        if (_c69) {
          let _c68: boolean = (_g59 < v_v);
          if (!_c68) {
            let _q64 = true;
            Q65: {
              const _a66 = v_O;
              for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                const v_c = _a66[_i67];
                if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q64 = false;
                  break Q65;
                }
              }
            }
            _c68 = _q64;
          }
          _c69 = _c68;
        }
        let _c79: boolean = _c69;
        if (_c79) {
          let _g70 = 0;
          G71: {
            const _a72 = sp.lineCells[v_L];
            for (let _i73 = 0; _i73 < _a72.length; _i73++) {
              const v_c = _a72[_i73];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g70++;
            }
          }
          let _c78: boolean = ((_g70 === v_v) || (_h63 > (v_v - _g70)));
          if (!_c78) {
            let _q74 = true;
            Q75: {
              const _a76 = v_O;
              for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                const v_c = _a76[_i77];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
                if (!(true)) {
                  _q74 = false;
                  break Q75;
                }
              }
            }
            _c78 = _q74;
          }
          _c79 = _c78;
        }
        if (!(_c79)) return -1;
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
  const _g132: number[] = [];
  const _g138: number[] = [];
  const facts = oddGapFacts;
  let fired = 0;
  let changed = false;
  const _a111 = union(sp.cols, sp.rows);
  for (let _i112 = 0; _i112 < _a111.length; _i112++) {
    const v_L = _a111[_i112];
    const _h113 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L114: {
      const v_n = _h113;
      let _c119: boolean = (v_n >= 0);
      if (_c119) {
        let _g115 = 0;
        G116: {
          const _a117 = sp.lineCells[v_L];
          for (let _i118 = 0; _i118 < _a117.length; _i118++) {
            const v_c = _a117[_i118];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g115++;
          }
        }
        _c119 = (_g115 === v_n);
      }
      if (!(_c119)) break L114;
      for (let v_d = 1; v_d <= 3; v_d++) {
        const _h120 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        const _h121 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d))));
        let _c131: boolean = (((v_d !== 2) && (_h120 >= 0)) && (_h121 >= 0));
        if (_c131) {
          let _g122 = 0;
          G123: {
            const _a124 = sp.lineCells[v_L];
            for (let _i125 = 0; _i125 < _a124.length; _i125++) {
              const v_c = _a124[_i125];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g122++;
            }
          }
          const _t126 = (4 - v_d);
          let _g127 = 0;
          G128: {
            const _a129 = sp.lineCells[v_L];
            for (let _i130 = 0; _i130 < _a129.length; _i130++) {
              const v_c = _a129[_i130];
              if (!(((b.grid[v_c] || -1) === _t126))) continue;
              _g127++;
            }
          }
          _c131 = ((_h120 - _g122) === ((_h121 - _g127) + 1));
        }
        if (!(_c131)) continue;
        _g132.length = 0;
        G133: {
          const _a136 = sp.lineCells[v_L];
          for (let _i137 = 0; _i137 < _a136.length; _i137++) {
            const v_c = _a136[_i137];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g132.push(v_c);
          }
        }
        const v_O = _g132;
        _g138.length = 0;
        G139: {
          const _a142 = v_O;
          for (let _i143 = 0; _i143 < _a142.length; _i143++) {
            const v_c = _a142[_i143];
            const _h144 = stretch(sp.lineCells[v_L], v_c, v_O).length;
            if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((_h144 % 2) === 1)))) continue;
            _g138.push(v_c);
          }
        }
        L145: {
          const v_S = _g138;
          const _h146 = v_S.length;
          if (!((_h146 === 1))) break L145;
          facts.length = 0;
          changed = false;
          const _t147 = (v_S.length > 0 ? v_S[0] : -1);
          if (!(b.grid[_t147] !== 0)) { if (fire === null) { b.placeAt(_t147, v_d); changed = true; } else facts.push(PLACE, _t147, v_d); }
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
  const _g170: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  if (markedCands.length < sp.cells.length) markedCands = new Int32Array(sp.cells.length);
  const cands = markedCands;
  cands.fill(-1);
  inMagnetMarkedKept.clear();
  const _a168 = union(sp.cols, sp.rows);
  for (let _i169 = 0; _i169 < _a168.length; _i169++) {
    const v_L = _a168[_i169];
    _g170.length = 0;
    G171: {
      const _a174 = sp.lineCells[v_L];
      for (let _i175 = 0; _i175 < _a174.length; _i175++) {
        const v_c = _a174[_i175];
        if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
        _g170.push(v_c);
      }
    }
    L176: {
      const v_M = _g170;
      const _h177 = v_M.length;
      if (!((_h177 > 0))) break L176;
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        const _h178 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L179: {
          const v_v = _h178;
          let _c185: boolean = (v_v >= 0);
          if (_c185) {
            let _g180 = 0;
            G181: {
              const _a182 = sp.lineCells[v_L];
              for (let _i183 = 0; _i183 < _a182.length; _i183++) {
                const v_c = _a182[_i183];
                const _h184 = (b.grid[v_c] || -1);
                if (!((_h184 === v_d))) continue;
                _g180++;
              }
            }
            _c185 = ((2 * (v_v - _g180)) === _h177);
          }
          if (!(_c185)) break L179;
          facts.length = 0;
          changed = false;
          let _q186 = true;
          Q187: {
            const _a188 = sp.lineCells[v_L];
            for (let _i189 = 0; _i189 < _a188.length; _i189++) {
              const v_c = _a188[_i189];
              const _h190 = (b.grid[v_c] !== 0);
              if (!((!(_h190) && !(v_M.includes(v_c))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q186 = false;
                break Q187;
              }
            }
          }
          if (!(_q186)) return -1;
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
  const _a199 = union(sp.cols, sp.rows);
  for (let _i200 = 0; _i200 < _a199.length; _i200++) {
    const v_L = _a199[_i200];
    const _h201 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L202: {
      const v_n = _h201;
      let _c208: boolean = (v_n >= 0);
      if (_c208) {
        let _g203 = 0;
        G204: {
          const _a205 = sp.lineCells[v_L];
          for (let _i206 = 0; _i206 < _a205.length; _i206++) {
            const v_c = _a205[_i206];
            const _h207 = (b.grid[v_c] || -1);
            if (!((_h207 === 2))) continue;
            _g203++;
          }
        }
        _c208 = ((_g203 + 1) === v_n);
      }
      if (!(_c208)) break L202;
      facts.length = 0;
      changed = false;
      let _q209 = true;
      Q210: {
        const _a211 = sp.lineCells[v_L];
        for (let _i212 = 0; _i212 < _a211.length; _i212++) {
          const v_c = _a211[_i212];
          const _h213 = (b.grid[v_c] !== 0);
          if (!(!(_h213))) continue;
          const _a214 = others(sp, cl, v_c);
          for (let _i215 = 0; _i215 < _a214.length; _i215++) {
            const v_p = _a214[_i215];
            const _h216 = (b.grid[v_p] !== 0);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h216)))) continue;
            if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
            if (!(true)) {
              _q209 = false;
              break Q210;
            }
          }
        }
      }
      if (!(_q209)) return -1;
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

/** Its dearest read grows with the board as n^0.5. */
export function everyTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryTileBinding> | null): number {
  const _g237: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
  const _a233 = union(sp.cols, sp.rows);
  for (let _i234 = 0; _i234 < _a233.length; _i234++) {
    const v_L = _a233[_i234];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h235 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L236: {
        const v_v = _h235;
        if (!((v_v >= 0))) break L236;
        _g237.length = 0;
        G238: {
          const _a241 = sp.lineCells[v_L];
          for (let _i242 = 0; _i242 < _a241.length; _i242++) {
            const v_c = _a241[_i242];
            const _h243 = (b.grid[v_c] !== 0);
            if (!(!(_h243))) continue;
            const _t244 = cl.tile.of[v_c];
            if (!_g237.includes(_t244)) _g237.push(_t244);
          }
        }
        L245: {
          const v_T = _g237;
          const _h246 = v_T.length;
          let _c252: boolean = (_h246 > 0);
          if (_c252) {
            let _g247 = 0;
            G248: {
              const _a249 = sp.lineCells[v_L];
              for (let _i250 = 0; _i250 < _a249.length; _i250++) {
                const v_c = _a249[_i250];
                const _h251 = (b.grid[v_c] || -1);
                if (!((_h251 === v_d))) continue;
                _g247++;
              }
            }
            _c252 = ((v_v - _g247) === _h246);
          }
          if (!(_c252)) break L245;
          facts.length = 0;
          changed = false;
          let _q253 = true;
          Q254: {
            const _a255 = sp.lineCells[v_L];
            for (let _i256 = 0; _i256 < _a255.length; _i256++) {
              const v_c = _a255[_i256];
              const _h257 = (b.grid[v_c] !== 0);
              if (!(!(_h257))) continue;
              if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q253 = false;
                break Q254;
              }
            }
          }
          if (!(_q253)) return -1;
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

/** Its dearest read grows with the board as n^0.5. */
export function onlyEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyEndBinding> | null): number {
  const _g284: number[] = [];
  const _g290: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _a280 = union(sp.cols, sp.rows);
  for (let _i281 = 0; _i281 < _a280.length; _i281++) {
    const v_L = _a280[_i281];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h282 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L283: {
        const v_v = _h282;
        if (!((v_v >= 0))) break L283;
        _g284.length = 0;
        G285: {
          const _a288 = sp.lineCells[v_L];
          for (let _i289 = 0; _i289 < _a288.length; _i289++) {
            const v_c = _a288[_i289];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g284.push(v_c);
          }
        }
        const v_O = _g284;
        _g290.length = 0;
        G291: {
          const _a294 = v_O;
          for (let _i295 = 0; _i295 < _a294.length; _i295++) {
            const v_c = _a294[_i295];
            const _t296 = cl.tile.of[v_c];
            if (!_g290.includes(_t296)) _g290.push(_t296);
          }
        }
        L297: {
          const v_T = _g290;
          const _h298 = v_T.length;
          let _c303: boolean = (_h298 > 0);
          if (_c303) {
            let _g299 = 0;
            G300: {
              const _a301 = sp.lineCells[v_L];
              for (let _i302 = 0; _i302 < _a301.length; _i302++) {
                const v_c = _a301[_i302];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g299++;
              }
            }
            _c303 = ((v_v - _g299) === _h298);
          }
          if (!(_c303)) break L297;
          facts.length = 0;
          changed = false;
          let _q304 = true;
          Q305: {
            const _a306 = v_O;
            for (let _i307 = 0; _i307 < _a306.length; _i307++) {
              const v_c = _a306[_i307];
              let _q308 = false;
              Q309: {
                const _a310 = others(sp, cl, v_c);
                for (let _i311 = 0; _i311 < _a310.length; _i311++) {
                  const v_p = _a310[_i311];
                  if ((v_O.includes(v_p))) {
                    _q308 = true;
                    break Q309;
                  }
                }
              }
              if (!(!(_q308))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q304 = false;
                break Q305;
              }
            }
          }
          if (!(_q304)) return -1;
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

/** `others(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function others(_sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = othersKept.board(cl);
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
  let _c158: boolean = (!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 2) & 1) !== 0));
  if (_c158) {
    let _q154 = false;
    Q155: {
      const _a156 = others(sp, cl, v_c);
      for (let _i157 = 0; _i157 < _a156.length; _i157++) {
        const v_p = _a156[_i157];
        if ((((sp.lineCells[v_L].includes(v_p)) && !((b.grid[v_p] !== 0))) && !(((b.cands[v_p] >> 2) & 1) !== 0))) {
          _q154 = true;
          break Q155;
        }
      }
    }
    _c158 = _q154;
  }
  const _made = _c158;
  inMagnetMarkedKept.set((v_L + 1) * 1048577 + (v_c + 1), _made);
  return _made;
}
