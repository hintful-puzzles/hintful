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
  const _g337: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q329 = true;
  Q330: {
    const _a331 = sp.cells;
    for (let _i332 = 0; _i332 < _a331.length; _i332++) {
      const v_c = _a331[_i332];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q329 = false;
        break Q330;
      }
    }
  }
  if (!(_q329)) return false;
  let _q333 = true;
  Q334: {
    const _a335 = sp.cells;
    for (let _i336 = 0; _i336 < _a335.length; _i336++) {
      const v_c = _a335[_i336];
      const _h346 = (g[v_c] || -1);
      const _h347 = (4 - _h346);
      _g337.length = 0;
      G338: {
        const _a341 = cl.tile.cells[cl.tile.of[v_c]];
        for (let _i342 = 0; _i342 < _a341.length; _i342++) {
          const v_p = _a341[_i342];
          if (!((v_p !== v_c))) continue;
          _g337.push(v_p);
        }
      }
      const _a343 = _g337;
      for (let _i344 = 0; _i344 < _a343.length; _i344++) {
        const v_p = _a343[_i344];
        const _h345 = (g[v_p] || -1);
        if (!((_h345 === _h347))) {
          _q333 = false;
          break Q334;
        }
      }
    }
  }
  if (!(_q333)) return false;
  let _q348 = true;
  Q349: {
    const _a350 = sp.cells;
    for (let _i351 = 0; _i351 < _a350.length; _i351++) {
      const v_c = _a350[_i351];
      const _h352 = (g[v_c] || -1);
      if (!((_h352 !== 2))) continue;
      const _a353 = sp.adj4[v_c];
      for (let _i354 = 0; _i354 < _a353.length; _i354++) {
        const v_p = _a353[_i354];
        const _h355 = (g[v_p] || -1);
        if (!((_h355 !== _h352))) {
          _q348 = false;
          break Q349;
        }
      }
    }
  }
  if (!(_q348)) return false;
  for (let _k356 = 0; _k356 < cl.count.at.length; _k356++) {
    const _at357 = perElement(cl.count.at[_k356]);
    const _per359 = perValue(cl.count.at[_k356]);
    const _v358 = cl.count.v[_k356];
    let _g360 = 0;
    G361: {
      const _a362 = sp.lineCells[_at357];
      for (let _i363 = 0; _i363 < _a362.length; _i363++) {
        const v_c = _a362[_i363];
        const _h364 = (g[v_c] || -1);
        if (!((_h364 === _per359))) continue;
        _g360++;
      }
    }
    if (!((_g360 === _v358))) return false;
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
          if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, O: v_O }, facts)) return 1;
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
            if (fire !== null && !fire({ L: v_L, n: v_n, d: v_d, O: v_O, S: v_S }, facts)) return 1;
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

/** Its dearest read grows with the board as n^0.5. */
export function marked(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MarkedBinding> | null): number {
  const _g175: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  const _a173 = union(sp.cols, sp.rows);
  for (let _i174 = 0; _i174 < _a173.length; _i174++) {
    const v_L = _a173[_i174];
    _g175.length = 0;
    G176: {
      const _a184 = sp.lineCells[v_L];
      for (let _i185 = 0; _i185 < _a184.length; _i185++) {
        const v_c = _a184[_i185];
        const _h186 = (b.grid[v_c] !== 0);
        let _c192: boolean = (!(_h186) && !(((b.cands[v_c] >> 2) & 1) !== 0));
        if (_c192) {
          let _q187 = false;
          Q188: {
            const _a189 = others(sp, cl, v_c);
            for (let _i190 = 0; _i190 < _a189.length; _i190++) {
              const v_p = _a189[_i190];
              const _h191 = (b.grid[v_p] !== 0);
              if ((((sp.lineCells[v_L].includes(v_p)) && !(_h191)) && !(((b.cands[v_p] >> 2) & 1) !== 0))) {
                _q187 = true;
                break Q188;
              }
            }
          }
          _c192 = _q187;
        }
        if (!(_c192)) continue;
        _g175.push(v_c);
      }
    }
    L193: {
      const v_M = _g175;
      const _h194 = v_M.length;
      if (!((_h194 > 0))) break L193;
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        const _h195 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L196: {
          const v_v = _h195;
          let _c202: boolean = (v_v >= 0);
          if (_c202) {
            let _g197 = 0;
            G198: {
              const _a199 = sp.lineCells[v_L];
              for (let _i200 = 0; _i200 < _a199.length; _i200++) {
                const v_c = _a199[_i200];
                const _h201 = (b.grid[v_c] || -1);
                if (!((_h201 === v_d))) continue;
                _g197++;
              }
            }
            _c202 = ((2 * (v_v - _g197)) === _h194);
          }
          if (!(_c202)) break L196;
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
            if (fire !== null && !fire({ L: v_L, M: v_M, d: v_d, v: v_v }, facts)) return 1;
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
          const _a231 = others(sp, cl, v_c);
          for (let _i232 = 0; _i232 < _a231.length; _i232++) {
            const v_p = _a231[_i232];
            const _h233 = (b.grid[v_p] !== 0);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h233)))) continue;
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

/** Its dearest read grows with the board as n^0.5. */
export function everyTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryTileBinding> | null): number {
  const _g254: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
  const _a250 = union(sp.cols, sp.rows);
  for (let _i251 = 0; _i251 < _a250.length; _i251++) {
    const v_L = _a250[_i251];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h252 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L253: {
        const v_v = _h252;
        if (!((v_v >= 0))) break L253;
        _g254.length = 0;
        G255: {
          const _a258 = sp.lineCells[v_L];
          for (let _i259 = 0; _i259 < _a258.length; _i259++) {
            const v_c = _a258[_i259];
            const _h260 = (b.grid[v_c] !== 0);
            if (!(!(_h260))) continue;
            const _t261 = cl.tile.of[v_c];
            if (!_g254.includes(_t261)) _g254.push(_t261);
          }
        }
        L262: {
          const v_T = _g254;
          const _h263 = v_T.length;
          let _c269: boolean = (_h263 > 0);
          if (_c269) {
            let _g264 = 0;
            G265: {
              const _a266 = sp.lineCells[v_L];
              for (let _i267 = 0; _i267 < _a266.length; _i267++) {
                const v_c = _a266[_i267];
                const _h268 = (b.grid[v_c] || -1);
                if (!((_h268 === v_d))) continue;
                _g264++;
              }
            }
            _c269 = ((v_v - _g264) === _h263);
          }
          if (!(_c269)) break L262;
          facts.length = 0;
          changed = false;
          let _q270 = true;
          Q271: {
            const _a272 = sp.lineCells[v_L];
            for (let _i273 = 0; _i273 < _a272.length; _i273++) {
              const v_c = _a272[_i273];
              const _h274 = (b.grid[v_c] !== 0);
              if (!(!(_h274))) continue;
              if ((((b.cands[v_c] >> 2) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q270 = false;
                break Q271;
              }
            }
          }
          if (!(_q270)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, T: v_T }, facts)) return 1;
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
  const _g301: number[] = [];
  const _g307: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _a297 = union(sp.cols, sp.rows);
  for (let _i298 = 0; _i298 < _a297.length; _i298++) {
    const v_L = _a297[_i298];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h299 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L300: {
        const v_v = _h299;
        if (!((v_v >= 0))) break L300;
        _g301.length = 0;
        G302: {
          const _a305 = sp.lineCells[v_L];
          for (let _i306 = 0; _i306 < _a305.length; _i306++) {
            const v_c = _a305[_i306];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g301.push(v_c);
          }
        }
        const v_O = _g301;
        _g307.length = 0;
        G308: {
          const _a311 = v_O;
          for (let _i312 = 0; _i312 < _a311.length; _i312++) {
            const v_c = _a311[_i312];
            const _t313 = cl.tile.of[v_c];
            if (!_g307.includes(_t313)) _g307.push(_t313);
          }
        }
        L314: {
          const v_T = _g307;
          const _h315 = v_T.length;
          let _c320: boolean = (_h315 > 0);
          if (_c320) {
            let _g316 = 0;
            G317: {
              const _a318 = sp.lineCells[v_L];
              for (let _i319 = 0; _i319 < _a318.length; _i319++) {
                const v_c = _a318[_i319];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g316++;
              }
            }
            _c320 = ((v_v - _g316) === _h315);
          }
          if (!(_c320)) break L314;
          facts.length = 0;
          changed = false;
          let _q321 = true;
          Q322: {
            const _a323 = v_O;
            for (let _i324 = 0; _i324 < _a323.length; _i324++) {
              const v_c = _a323[_i324];
              let _q325 = false;
              Q326: {
                const _a327 = others(sp, cl, v_c);
                for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                  const v_p = _a327[_i328];
                  if ((v_O.includes(v_p))) {
                    _q325 = true;
                    break Q326;
                  }
                }
              }
              if (!(!(_q325))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q321 = false;
                break Q322;
              }
            }
          }
          if (!(_q321)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, O: v_O, T: v_T }, facts)) return 1;
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
