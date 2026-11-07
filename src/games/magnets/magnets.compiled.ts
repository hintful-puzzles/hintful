// Compiled by `npm run describe` from src/games/magnets/magnets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, clueAt, least, perElement, perPlace, perValue, popcount, stretch, union } from "../../engine/describe-runtime.ts";

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
  const _g411: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q403 = true;
  Q404: {
    const _a405 = sp.cells;
    for (let _i406 = 0; _i406 < _a405.length; _i406++) {
      const v_c = _a405[_i406];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q403 = false;
        break Q404;
      }
    }
  }
  if (!(_q403)) return false;
  let _q407 = true;
  Q408: {
    const _a409 = sp.cells;
    for (let _i410 = 0; _i410 < _a409.length; _i410++) {
      const v_c = _a409[_i410];
      const _h420 = (g[v_c] || -1);
      const _h421 = (4 - _h420);
      _g411.length = 0;
      G412: {
        const _a415 = cl.tile.cells[cl.tile.of[v_c]];
        for (let _i416 = 0; _i416 < _a415.length; _i416++) {
          const v_p = _a415[_i416];
          if (!((v_p !== v_c))) continue;
          _g411.push(v_p);
        }
      }
      const _a417 = _g411;
      for (let _i418 = 0; _i418 < _a417.length; _i418++) {
        const v_p = _a417[_i418];
        const _h419 = (g[v_p] || -1);
        if (!((_h419 === _h421))) {
          _q407 = false;
          break Q408;
        }
      }
    }
  }
  if (!(_q407)) return false;
  let _q422 = true;
  Q423: {
    const _a424 = sp.cells;
    for (let _i425 = 0; _i425 < _a424.length; _i425++) {
      const v_c = _a424[_i425];
      const _h426 = (g[v_c] || -1);
      if (!((_h426 !== 2))) continue;
      const _a427 = sp.adj4[v_c];
      for (let _i428 = 0; _i428 < _a427.length; _i428++) {
        const v_p = _a427[_i428];
        const _h429 = (g[v_p] || -1);
        if (!((_h429 !== _h426))) {
          _q422 = false;
          break Q423;
        }
      }
    }
  }
  if (!(_q422)) return false;
  for (let _k430 = 0; _k430 < cl.count.at.length; _k430++) {
    const _at431 = perElement(cl.count.at[_k430]);
    const _per433 = perValue(cl.count.at[_k430]);
    const _v432 = cl.count.v[_k430];
    let _g434 = 0;
    G435: {
      const _a436 = sp.lineCells[_at431];
      for (let _i437 = 0; _i437 < _a436.length; _i437++) {
        const v_c = _a436[_i437];
        const _h438 = (g[v_c] || -1);
        if (!((_h438 === _per433))) continue;
        _g434++;
      }
    }
    if (!((_g434 === _v432))) return false;
  }
  return true;
}

export interface PairBinding {
  c: number;
  p: number;
}

const pairFacts: number[] = [];

export function pair(b: Marks, _sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<PairBinding> | null): number {
  const _g13: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (!(b.known(v_c))) return 0;
  _g13.length = 0;
  G14: {
    const _a17 = cl.tile.cells[cl.tile.of[v_c]];
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_p = _a17[_i18];
      if (!((v_p !== v_c))) continue;
      _g13.push(v_p);
    }
  }
  const _a19 = _g13;
  for (let _i20 = 0; _i20 < _a19.length; _i20++) {
    const v_p = _a19[_i20];
    if (!(!(b.known(v_p)))) continue;
    facts.length = 0;
    changed = false;
    const _t21 = (4 - b.value(v_c));
    if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, _t21); changed = true; } else facts.push(PLACE, v_p, _t21); }
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

export function repel(b: Marks, sp: GridSpace, v_c: number, fire: Fire<RepelBinding> | null): number {
  const facts = repelFacts;
  let fired = 0;
  let changed = false;
  const _h26 = b.known(v_c);
  const _h27 = b.value(v_c);
  if (!((_h26 && (_h27 !== 2)))) return 0;
  const _a28 = sp.adj4[v_c];
  for (let _i29 = 0; _i29 < _a28.length; _i29++) {
    const v_p = _a28[_i29];
    facts.length = 0;
    changed = false;
    if (b.has(v_p, _h27)) { if (fire === null) { b.strikeAt(v_p, _h27); changed = true; } else facts.push(STRIKE, v_p, _h27); }
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

export function tile(b: Marks, _sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<TileBinding> | null): number {
  const _g40: number[] = [];
  const facts = tileFacts;
  let fired = 0;
  let changed = false;
  _g40.length = 0;
  G41: {
    const _a44 = cl.tile.cells[cl.tile.of[v_c]];
    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
      const v_p = _a44[_i45];
      if (!((v_p !== v_c))) continue;
      _g40.push(v_p);
    }
  }
  const _a46 = _g40;
  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
    const v_p = _a46[_i47];
    facts.length = 0;
    changed = false;
    let _q48 = true;
    Q49: {
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!(!b.has(v_c, v_d))) continue;
        const _t50 = (4 - v_d);
        if (b.has(v_p, _t50)) { if (fire === null) { b.strikeAt(v_p, _t50); changed = true; } else facts.push(STRIKE, v_p, _t50); }
        if (!(true)) {
          _q48 = false;
          break Q49;
        }
      }
    }
    if (!(_q48)) return -1;
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

export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding> | null): number {
  const facts = singleFacts;
  let fired = 0;
  let changed = false;
  if (singleCands.length < sp.cells.length) singleCands = new Int32Array(sp.cells.length);
  const cands = singleCands;
  cands.fill(-1);
  const _a53 = sp.cells;
  for (let _i54 = 0; _i54 < _a53.length; _i54++) {
    const v_c = _a53[_i54];
    if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) < 2))) continue;
    facts.length = 0;
    changed = false;
    let _c57: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) === 1);
    if (_c57) {
      let _c56: boolean = b.known(v_c);
      if (!_c56) {
        const _t55 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))));
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t55); changed = true; } else facts.push(PLACE, v_c, _t55); }
        _c56 = true;
      }
      _c57 = _c56;
    }
    if (!(_c57)) return -1;
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

export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g71: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  const _a67 = union(sp.cols, sp.rows);
  for (let _i68 = 0; _i68 < _a67.length; _i68++) {
    const v_L = _a67[_i68];
    for (let v_d = 1; v_d <= 3; v_d++) {
      const _h69 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L70: {
        const v_v = _h69;
        if (!((v_v >= 0))) break L70;
        _g71.length = 0;
        G72: {
          const _a75 = sp.lineCells[v_L];
          for (let _i76 = 0; _i76 < _a75.length; _i76++) {
            const v_c = _a75[_i76];
            if (!((!(b.known(v_c)) && b.has(v_c, v_d)))) continue;
            _g71.push(v_c);
          }
        }
        const v_O = _g71;
        const _h81 = v_O.length;
        facts.length = 0;
        changed = false;
        let _g77 = 0;
        G78: {
          const _a79 = sp.lineCells[v_L];
          for (let _i80 = 0; _i80 < _a79.length; _i80++) {
            const v_c = _a79[_i80];
            if (!((b.value(v_c) === v_d))) continue;
            _g77++;
          }
        }
        let _c86: boolean = (_g77 <= v_v);
        if (_c86) {
          let _g82 = 0;
          G83: {
            const _a84 = sp.lineCells[v_L];
            for (let _i85 = 0; _i85 < _a84.length; _i85++) {
              const v_c = _a84[_i85];
              if (!((b.value(v_c) === v_d))) continue;
              _g82++;
            }
          }
          _c86 = (_h81 >= (v_v - _g82));
        }
        let _c96: boolean = _c86;
        if (_c96) {
          let _g87 = 0;
          G88: {
            const _a89 = sp.lineCells[v_L];
            for (let _i90 = 0; _i90 < _a89.length; _i90++) {
              const v_c = _a89[_i90];
              if (!((b.value(v_c) === v_d))) continue;
              _g87++;
            }
          }
          let _c95: boolean = (_g87 < v_v);
          if (!_c95) {
            let _q91 = true;
            Q92: {
              const _a93 = v_O;
              for (let _i94 = 0; _i94 < _a93.length; _i94++) {
                const v_c = _a93[_i94];
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q91 = false;
                  break Q92;
                }
              }
            }
            _c95 = _q91;
          }
          _c96 = _c95;
        }
        let _c111: boolean = _c96;
        if (_c111) {
          let _g97 = 0;
          G98: {
            const _a99 = sp.lineCells[v_L];
            for (let _i100 = 0; _i100 < _a99.length; _i100++) {
              const v_c = _a99[_i100];
              if (!((b.value(v_c) === v_d))) continue;
              _g97++;
            }
          }
          let _c105: boolean = (_g97 === v_v);
          if (!_c105) {
            let _g101 = 0;
            G102: {
              const _a103 = sp.lineCells[v_L];
              for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                const v_c = _a103[_i104];
                if (!((b.value(v_c) === v_d))) continue;
                _g101++;
              }
            }
            _c105 = (_h81 > (v_v - _g101));
          }
          let _c110: boolean = _c105;
          if (!_c110) {
            let _q106 = true;
            Q107: {
              const _a108 = v_O;
              for (let _i109 = 0; _i109 < _a108.length; _i109++) {
                const v_c = _a108[_i109];
                if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
                if (!(true)) {
                  _q106 = false;
                  break Q107;
                }
              }
            }
            _c110 = _q106;
          }
          _c111 = _c110;
        }
        if (!(_c111)) return -1;
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

export function oddGap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OddGapBinding> | null): number {
  const _g164: number[] = [];
  const _g170: number[] = [];
  const facts = oddGapFacts;
  let fired = 0;
  let changed = false;
  const _a143 = union(sp.cols, sp.rows);
  for (let _i144 = 0; _i144 < _a143.length; _i144++) {
    const v_L = _a143[_i144];
    const _h145 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L146: {
      const v_n = _h145;
      let _c151: boolean = (v_n >= 0);
      if (_c151) {
        let _g147 = 0;
        G148: {
          const _a149 = sp.lineCells[v_L];
          for (let _i150 = 0; _i150 < _a149.length; _i150++) {
            const v_c = _a149[_i150];
            if (!((b.value(v_c) === 2))) continue;
            _g147++;
          }
        }
        _c151 = (_g147 === v_n);
      }
      if (!(_c151)) break L146;
      for (let v_d = 1; v_d <= 3; v_d++) {
        const _h152 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        const _h153 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d))));
        let _c163: boolean = (((v_d !== 2) && (_h152 >= 0)) && (_h153 >= 0));
        if (_c163) {
          let _g154 = 0;
          G155: {
            const _a156 = sp.lineCells[v_L];
            for (let _i157 = 0; _i157 < _a156.length; _i157++) {
              const v_c = _a156[_i157];
              if (!((b.value(v_c) === v_d))) continue;
              _g154++;
            }
          }
          const _t158 = (4 - v_d);
          let _g159 = 0;
          G160: {
            const _a161 = sp.lineCells[v_L];
            for (let _i162 = 0; _i162 < _a161.length; _i162++) {
              const v_c = _a161[_i162];
              if (!((b.value(v_c) === _t158))) continue;
              _g159++;
            }
          }
          _c163 = ((_h152 - _g154) === ((_h153 - _g159) + 1));
        }
        if (!(_c163)) continue;
        _g164.length = 0;
        G165: {
          const _a168 = sp.lineCells[v_L];
          for (let _i169 = 0; _i169 < _a168.length; _i169++) {
            const v_c = _a168[_i169];
            if (!(!(b.known(v_c)))) continue;
            _g164.push(v_c);
          }
        }
        const v_O = _g164;
        _g170.length = 0;
        G171: {
          const _a174 = v_O;
          for (let _i175 = 0; _i175 < _a174.length; _i175++) {
            const v_c = _a174[_i175];
            const _h176 = stretch(sp.lineCells[v_L], v_c, v_O).length;
            if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((_h176 % 2) === 1)))) continue;
            _g170.push(v_c);
          }
        }
        L177: {
          const v_S = _g170;
          const _h178 = v_S.length;
          if (!((_h178 === 1))) break L177;
          facts.length = 0;
          changed = false;
          const _t179 = (v_S.length > 0 ? v_S[0] : -1);
          if (!b.known(_t179)) { if (fire === null) { b.placeAt(_t179, v_d); changed = true; } else facts.push(PLACE, _t179, v_d); }
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

export function marked(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MarkedBinding> | null): number {
  const _g219: number[] = [];
  const _g239: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  const _a217 = union(sp.cols, sp.rows);
  for (let _i218 = 0; _i218 < _a217.length; _i218++) {
    const v_L = _a217[_i218];
    _g219.length = 0;
    G220: {
      const _a234 = sp.lineCells[v_L];
      for (let _i235 = 0; _i235 < _a234.length; _i235++) {
        const v_c = _a234[_i235];
        const _h236 = b.known(v_c);
        let _c248: boolean = (!(_h236) && !b.has(v_c, 2));
        if (_c248) {
          let _q237 = false;
          Q238: {
            _g239.length = 0;
            G240: {
              const _a243 = cl.tile.cells[cl.tile.of[v_c]];
              for (let _i244 = 0; _i244 < _a243.length; _i244++) {
                const v_p = _a243[_i244];
                if (!((v_p !== v_c))) continue;
                _g239.push(v_p);
              }
            }
            const _a245 = _g239;
            for (let _i246 = 0; _i246 < _a245.length; _i246++) {
              const v_p = _a245[_i246];
              const _h247 = b.known(v_p);
              if ((((sp.lineCells[v_L].includes(v_p)) && !(_h247)) && !b.has(v_p, 2))) {
                _q237 = true;
                break Q238;
              }
            }
          }
          _c248 = _q237;
        }
        if (!(_c248)) continue;
        _g219.push(v_c);
      }
    }
    L249: {
      const v_M = _g219;
      const _h250 = v_M.length;
      if (!((_h250 > 0))) break L249;
      for (let v_d = 1; v_d <= 3; v_d++) {
        if (!((v_d !== 2))) continue;
        const _h251 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L252: {
          const v_v = _h251;
          let _c258: boolean = (v_v >= 0);
          if (_c258) {
            let _g253 = 0;
            G254: {
              const _a255 = sp.lineCells[v_L];
              for (let _i256 = 0; _i256 < _a255.length; _i256++) {
                const v_c = _a255[_i256];
                const _h257 = b.value(v_c);
                if (!((_h257 === v_d))) continue;
                _g253++;
              }
            }
            _c258 = ((2 * (v_v - _g253)) === _h250);
          }
          if (!(_c258)) break L252;
          facts.length = 0;
          changed = false;
          let _q259 = true;
          Q260: {
            const _a261 = sp.lineCells[v_L];
            for (let _i262 = 0; _i262 < _a261.length; _i262++) {
              const v_c = _a261[_i262];
              const _h263 = b.known(v_c);
              if (!((!(_h263) && !(v_M.includes(v_c))))) continue;
              if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q259 = false;
                break Q260;
              }
            }
          }
          if (!(_q259)) return -1;
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

export function oneNeutral(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OneNeutralBinding> | null): number {
  const _g287: number[] = [];
  const facts = oneNeutralFacts;
  let fired = 0;
  let changed = false;
  const _a272 = union(sp.cols, sp.rows);
  for (let _i273 = 0; _i273 < _a272.length; _i273++) {
    const v_L = _a272[_i273];
    const _h274 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L275: {
      const v_n = _h274;
      let _c281: boolean = (v_n >= 0);
      if (_c281) {
        let _g276 = 0;
        G277: {
          const _a278 = sp.lineCells[v_L];
          for (let _i279 = 0; _i279 < _a278.length; _i279++) {
            const v_c = _a278[_i279];
            const _h280 = b.value(v_c);
            if (!((_h280 === 2))) continue;
            _g276++;
          }
        }
        _c281 = ((_g276 + 1) === v_n);
      }
      if (!(_c281)) break L275;
      facts.length = 0;
      changed = false;
      let _q282 = true;
      Q283: {
        const _a284 = sp.lineCells[v_L];
        for (let _i285 = 0; _i285 < _a284.length; _i285++) {
          const v_c = _a284[_i285];
          const _h286 = b.known(v_c);
          if (!(!(_h286))) continue;
          _g287.length = 0;
          G288: {
            const _a291 = cl.tile.cells[cl.tile.of[v_c]];
            for (let _i292 = 0; _i292 < _a291.length; _i292++) {
              const v_p = _a291[_i292];
              if (!((v_p !== v_c))) continue;
              _g287.push(v_p);
            }
          }
          const _a293 = _g287;
          for (let _i294 = 0; _i294 < _a293.length; _i294++) {
            const v_p = _a293[_i294];
            const _h295 = b.known(v_p);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h295)))) continue;
            if (b.has(v_c, 2)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
            if (!(true)) {
              _q282 = false;
              break Q283;
            }
          }
        }
      }
      if (!(_q282)) return -1;
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

export function everyTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryTileBinding> | null): number {
  const _g316: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
  const _a312 = union(sp.cols, sp.rows);
  for (let _i313 = 0; _i313 < _a312.length; _i313++) {
    const v_L = _a312[_i313];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h314 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L315: {
        const v_v = _h314;
        if (!((v_v >= 0))) break L315;
        _g316.length = 0;
        G317: {
          const _a320 = sp.lineCells[v_L];
          for (let _i321 = 0; _i321 < _a320.length; _i321++) {
            const v_c = _a320[_i321];
            const _h322 = b.known(v_c);
            if (!(!(_h322))) continue;
            const _t323 = cl.tile.of[v_c];
            if (!_g316.includes(_t323)) _g316.push(_t323);
          }
        }
        L324: {
          const v_T = _g316;
          const _h325 = v_T.length;
          let _c331: boolean = (_h325 > 0);
          if (_c331) {
            let _g326 = 0;
            G327: {
              const _a328 = sp.lineCells[v_L];
              for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                const v_c = _a328[_i329];
                const _h330 = b.value(v_c);
                if (!((_h330 === v_d))) continue;
                _g326++;
              }
            }
            _c331 = ((v_v - _g326) === _h325);
          }
          if (!(_c331)) break L324;
          facts.length = 0;
          changed = false;
          let _q332 = true;
          Q333: {
            const _a334 = sp.lineCells[v_L];
            for (let _i335 = 0; _i335 < _a334.length; _i335++) {
              const v_c = _a334[_i335];
              const _h336 = b.known(v_c);
              if (!(!(_h336))) continue;
              if (b.has(v_c, 2)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q332 = false;
                break Q333;
              }
            }
          }
          if (!(_q332)) return -1;
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

export function onlyEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyEndBinding> | null): number {
  const _g363: number[] = [];
  const _g369: number[] = [];
  const _g395: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _a359 = union(sp.cols, sp.rows);
  for (let _i360 = 0; _i360 < _a359.length; _i360++) {
    const v_L = _a359[_i360];
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!((v_d !== 2))) continue;
      const _h361 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L362: {
        const v_v = _h361;
        if (!((v_v >= 0))) break L362;
        _g363.length = 0;
        G364: {
          const _a367 = sp.lineCells[v_L];
          for (let _i368 = 0; _i368 < _a367.length; _i368++) {
            const v_c = _a367[_i368];
            if (!((!(b.known(v_c)) && b.has(v_c, v_d)))) continue;
            _g363.push(v_c);
          }
        }
        const v_O = _g363;
        _g369.length = 0;
        G370: {
          const _a373 = v_O;
          for (let _i374 = 0; _i374 < _a373.length; _i374++) {
            const v_c = _a373[_i374];
            const _t375 = cl.tile.of[v_c];
            if (!_g369.includes(_t375)) _g369.push(_t375);
          }
        }
        L376: {
          const v_T = _g369;
          const _h377 = v_T.length;
          let _c382: boolean = (_h377 > 0);
          if (_c382) {
            let _g378 = 0;
            G379: {
              const _a380 = sp.lineCells[v_L];
              for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                const v_c = _a380[_i381];
                if (!((b.value(v_c) === v_d))) continue;
                _g378++;
              }
            }
            _c382 = ((v_v - _g378) === _h377);
          }
          if (!(_c382)) break L376;
          facts.length = 0;
          changed = false;
          let _q383 = true;
          Q384: {
            const _a385 = v_O;
            for (let _i386 = 0; _i386 < _a385.length; _i386++) {
              const v_c = _a385[_i386];
              let _q393 = false;
              Q394: {
                _g395.length = 0;
                G396: {
                  const _a399 = cl.tile.cells[cl.tile.of[v_c]];
                  for (let _i400 = 0; _i400 < _a399.length; _i400++) {
                    const v_p = _a399[_i400];
                    if (!((v_p !== v_c))) continue;
                    _g395.push(v_p);
                  }
                }
                const _a401 = _g395;
                for (let _i402 = 0; _i402 < _a401.length; _i402++) {
                  const v_p = _a401[_i402];
                  if ((v_O.includes(v_p))) {
                    _q393 = true;
                    break Q394;
                  }
                }
              }
              if (!(!(_q393))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q383 = false;
                break Q384;
              }
            }
          }
          if (!(_q383)) return -1;
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
