// Compiled by `npm run describe` from src/games/magnets/magnets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, addOnce, clueAt, keptStore, least, perElement, perPlace, perValue, popcount, stamps, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _k332 = othersKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q324 = true;
  Q325: {
    const _a326 = sp.cells;
    for (let _i327 = 0; _i327 < _a326.length; _i327++) {
      const v_c = _a326[_i327];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q324 = false;
        break Q325;
      }
    }
  }
  if (!(_q324)) return false;
  let _q328 = true;
  Q329: {
    const _a330 = sp.cells;
    for (let _i331 = 0; _i331 < _a330.length; _i331++) {
      const v_c = _a330[_i331];
      const _h336 = (g[v_c] || -1);
      const _h337 = (4 - _h336);
      const _a333 = (_k332[v_c] ?? others(sp, cl, v_c));
      for (let _i334 = 0; _i334 < _a333.length; _i334++) {
        const v_p = _a333[_i334];
        const _h335 = (g[v_p] || -1);
        if (!((_h335 === _h337))) {
          _q328 = false;
          break Q329;
        }
      }
    }
  }
  if (!(_q328)) return false;
  let _q338 = true;
  Q339: {
    const _a340 = sp.cells;
    for (let _i341 = 0; _i341 < _a340.length; _i341++) {
      const v_c = _a340[_i341];
      const _h342 = (g[v_c] || -1);
      if (!((_h342 !== 2))) continue;
      const _a343 = sp.adj4[v_c];
      for (let _i344 = 0; _i344 < _a343.length; _i344++) {
        const v_p = _a343[_i344];
        const _h345 = (g[v_p] || -1);
        if (!((_h345 !== _h342))) {
          _q338 = false;
          break Q339;
        }
      }
    }
  }
  if (!(_q338)) return false;
  for (let _k346 = 0; _k346 < cl.count.at.length; _k346++) {
    const _at347 = perElement(cl.count.at[_k346]);
    const _per349 = perValue(cl.count.at[_k346]);
    const _v348 = cl.count.v[_k346];
    let _g350 = 0;
    G351: {
      const _a352 = sp.lineCells[_at347];
      for (let _i353 = 0; _i353 < _a352.length; _i353++) {
        const v_c = _a352[_i353];
        const _h354 = (g[v_c] || -1);
        if (!((_h354 === _per349))) continue;
        _g350++;
      }
    }
    if (!((_g350 === _v348))) return false;
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
  for (let _i114 = 0; _i114 < _a113.length; _i114++) {
    const v_L = _a113[_i114];
    const _h115 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L116: {
      const v_n = _h115;
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
          facts.length = 0;
          changed = false;
          const _t149 = (v_S.length > 0 ? v_S[0] : -1);
          if (!(b.grid[_t149] !== 0)) { if (fire === null) { b.placeAt(_t149, v_d); changed = true; } else facts.push(PLACE, _t149, v_d); }
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
  const _g176: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  if (markedCands.length < sp.cells.length) markedCands = new Int32Array(sp.cells.length);
  const cands = markedCands;
  cands.fill(-1);
  inMagnetMarkedKept.clear();
  const _a172 = union(sp.cols, sp.rows);
  for (let _i173 = 0; _i173 < _a172.length; _i173++) {
    const v_L = _a172[_i173];
    let _q174 = false;
    Q175: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        if (true) {
          _q174 = true;
          break Q175;
        }
      }
    }
    if (!(_q174)) continue;
    _g176.length = 0;
    G177: {
      const _a180 = sp.lineCells[v_L];
      for (let _i181 = 0; _i181 < _a180.length; _i181++) {
        const v_c = _a180[_i181];
        if (!(inMagnetMarked(b, sp, cl, cands, v_L, v_c))) continue;
        _g176.push(v_c);
      }
    }
    L182: {
      const v_M = _g176;
      const _h183 = v_M.length;
      if (!((_h183 > 0))) break L182;
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        const _h184 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L185: {
          const v_v = _h184;
          let _c191: boolean = (v_v >= 0);
          if (_c191) {
            let _g186 = 0;
            G187: {
              const _a188 = sp.lineCells[v_L];
              for (let _i189 = 0; _i189 < _a188.length; _i189++) {
                const v_c = _a188[_i189];
                const _h190 = (b.grid[v_c] || -1);
                if (!((_h190 === v_d))) continue;
                _g186++;
              }
            }
            _c191 = ((2 * (v_v - _g186)) === _h183);
          }
          if (!(_c191)) break L185;
          facts.length = 0;
          changed = false;
          let _q192 = true;
          Q193: {
            const _a194 = sp.lineCells[v_L];
            for (let _i195 = 0; _i195 < _a194.length; _i195++) {
              const v_c = _a194[_i195];
              const _h196 = (b.grid[v_c] !== 0);
              if (!((!(_h196) && !(v_M.includes(v_c))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q192 = false;
                break Q193;
              }
            }
          }
          if (!(_q192)) return -1;
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
  const _k220 = othersKept.board(cl);
  const _a205 = union(sp.cols, sp.rows);
  for (let _i206 = 0; _i206 < _a205.length; _i206++) {
    const v_L = _a205[_i206];
    const _h207 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L208: {
      const v_n = _h207;
      let _c214: boolean = (v_n >= 0);
      if (_c214) {
        let _g209 = 0;
        G210: {
          const _a211 = sp.lineCells[v_L];
          for (let _i212 = 0; _i212 < _a211.length; _i212++) {
            const v_c = _a211[_i212];
            const _h213 = (b.grid[v_c] || -1);
            if (!((_h213 === 2))) continue;
            _g209++;
          }
        }
        _c214 = ((_g209 + 1) === v_n);
      }
      if (!(_c214)) break L208;
      facts.length = 0;
      changed = false;
      let _q215 = true;
      Q216: {
        const _a217 = sp.lineCells[v_L];
        for (let _i218 = 0; _i218 < _a217.length; _i218++) {
          const v_c = _a217[_i218];
          const _h219 = (b.grid[v_c] !== 0);
          if (!(!(_h219))) continue;
          const _a221 = (_k220[v_c] ?? others(sp, cl, v_c));
          for (let _i222 = 0; _i222 < _a221.length; _i222++) {
            const v_p = _a221[_i222];
            const _h223 = (b.grid[v_p] !== 0);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h223)))) continue;
            if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
            if (!(true)) {
              _q215 = false;
              break Q216;
            }
          }
        }
      }
      if (!(_q215)) return -1;
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
const _st248 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function everyTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryTileBinding> | null): number {
  const _g244: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
  const _a240 = union(sp.cols, sp.rows);
  for (let _i241 = 0; _i241 < _a240.length; _i241++) {
    const v_L = _a240[_i241];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h242 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L243: {
        const v_v = _h242;
        if (!((v_v >= 0))) break L243;
        _g244.length = 0;
        _st248.pass++;
        G245: {
          const _a249 = sp.lineCells[v_L];
          for (let _i250 = 0; _i250 < _a249.length; _i250++) {
            const v_c = _a249[_i250];
            const _h251 = (b.grid[v_c] !== 0);
            if (!(!(_h251))) continue;
            const _t252 = cl.tile.of[v_c];
            const _t253 = _t252;
            if (_g244.length < 16) { if (!_g244.includes(_t253)) _g244.push(_t253); } else addOnce(_g244, _st248, _t253);
          }
        }
        L254: {
          const v_T = _g244;
          const _h255 = v_T.length;
          let _c261: boolean = (_h255 > 0);
          if (_c261) {
            let _g256 = 0;
            G257: {
              const _a258 = sp.lineCells[v_L];
              for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                const v_c = _a258[_i259];
                const _h260 = (b.grid[v_c] || -1);
                if (!((_h260 === v_d))) continue;
                _g256++;
              }
            }
            _c261 = ((v_v - _g256) === _h255);
          }
          if (!(_c261)) break L254;
          facts.length = 0;
          changed = false;
          let _q262 = true;
          Q263: {
            const _a264 = sp.lineCells[v_L];
            for (let _i265 = 0; _i265 < _a264.length; _i265++) {
              const v_c = _a264[_i265];
              const _h266 = (b.grid[v_c] !== 0);
              if (!(!(_h266))) continue;
              if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q262 = false;
                break Q263;
              }
            }
          }
          if (!(_q262)) return -1;
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
const _st303 = stamps();

/** Its dearest read grows with the board as n^0.5. */
export function onlyEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyEndBinding> | null): number {
  const _g293: number[] = [];
  const _g299: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _k321 = othersKept.board(cl);
  const _a289 = union(sp.cols, sp.rows);
  for (let _i290 = 0; _i290 < _a289.length; _i290++) {
    const v_L = _a289[_i290];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h291 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L292: {
        const v_v = _h291;
        if (!((v_v >= 0))) break L292;
        _g293.length = 0;
        G294: {
          const _a297 = sp.lineCells[v_L];
          for (let _i298 = 0; _i298 < _a297.length; _i298++) {
            const v_c = _a297[_i298];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g293.push(v_c);
          }
        }
        const v_O = _g293;
        _g299.length = 0;
        _st303.pass++;
        G300: {
          const _a304 = v_O;
          for (let _i305 = 0; _i305 < _a304.length; _i305++) {
            const v_c = _a304[_i305];
            const _t306 = cl.tile.of[v_c];
            const _t307 = _t306;
            if (_g299.length < 16) { if (!_g299.includes(_t307)) _g299.push(_t307); } else addOnce(_g299, _st303, _t307);
          }
        }
        L308: {
          const v_T = _g299;
          const _h309 = v_T.length;
          let _c314: boolean = (_h309 > 0);
          if (_c314) {
            let _g310 = 0;
            G311: {
              const _a312 = sp.lineCells[v_L];
              for (let _i313 = 0; _i313 < _a312.length; _i313++) {
                const v_c = _a312[_i313];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g310++;
              }
            }
            _c314 = ((v_v - _g310) === _h309);
          }
          if (!(_c314)) break L308;
          facts.length = 0;
          changed = false;
          let _q315 = true;
          Q316: {
            const _a317 = v_O;
            for (let _i318 = 0; _i318 < _a317.length; _i318++) {
              const v_c = _a317[_i318];
              let _q319 = false;
              Q320: {
                const _a322 = (_k321[v_c] ?? others(sp, cl, v_c));
                for (let _i323 = 0; _i323 < _a322.length; _i323++) {
                  const v_p = _a322[_i323];
                  if ((v_O.includes(v_p))) {
                    _q319 = true;
                    break Q320;
                  }
                }
              }
              if (!(!(_q319))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q315 = false;
                break Q316;
              }
            }
          }
          if (!(_q315)) return -1;
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
  let _c162: boolean = (!((b.grid[v_c] !== 0)) && !(((b.cands[v_c] >> 2) & 1) !== 0));
  if (_c162) {
    let _q158 = false;
    Q159: {
      const _a160 = others(sp, cl, v_c);
      for (let _i161 = 0; _i161 < _a160.length; _i161++) {
        const v_p = _a160[_i161];
        if ((((sp.lineCells[v_L].includes(v_p)) && !((b.grid[v_p] !== 0))) && !(((b.cands[v_p] >> 2) & 1) !== 0))) {
          _q158 = true;
          break Q159;
        }
      }
    }
    _c162 = _q158;
  }
  const _made = _c162;
  inMagnetMarkedKept.set((v_L + 1) * 1048577 + (v_c + 1), _made);
  return _made;
}
