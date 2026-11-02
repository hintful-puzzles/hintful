// Compiled by `npm run describe` from src/games/magnets/magnets.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, clueAt, least, perElement, perPlace, perValue, popcount, rangeMask, stretch, union } from "../../engine/describe-runtime.ts";

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
    for (let _m4 = rangeMask(1, 3); _m4 !== 0; _m4 &= _m4 - 1) {
      const v_d = 31 - Math.clz32(_m4 & -_m4);
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
  const _g430: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q422 = true;
  Q423: {
    const _a424 = sp.cells;
    for (let _i425 = 0; _i425 < _a424.length; _i425++) {
      const v_c = _a424[_i425];
      if (!((cl.tile.cells[cl.tile.of[v_c]].length <= 2))) {
        _q422 = false;
        break Q423;
      }
    }
  }
  if (!(_q422)) return false;
  let _q426 = true;
  Q427: {
    const _a428 = sp.cells;
    for (let _i429 = 0; _i429 < _a428.length; _i429++) {
      const v_c = _a428[_i429];
      _g430.length = 0;
      G431: {
        const _a434 = cl.tile.cells[cl.tile.of[v_c]];
        for (let _i435 = 0; _i435 < _a434.length; _i435++) {
          const v_p = _a434[_i435];
          if (!((v_p !== v_c))) continue;
          _g430.push(v_p);
        }
      }
      const _a436 = _g430;
      for (let _i437 = 0; _i437 < _a436.length; _i437++) {
        const v_p = _a436[_i437];
        if (!(((g[v_p] || -1) === (4 - (g[v_c] || -1))))) {
          _q426 = false;
          break Q427;
        }
      }
    }
  }
  if (!(_q426)) return false;
  let _q438 = true;
  Q439: {
    const _a440 = sp.cells;
    for (let _i441 = 0; _i441 < _a440.length; _i441++) {
      const v_c = _a440[_i441];
      if (!(((g[v_c] || -1) !== 2))) continue;
      const _a442 = sp.adj4[v_c];
      for (let _i443 = 0; _i443 < _a442.length; _i443++) {
        const v_p = _a442[_i443];
        if (!(((g[v_p] || -1) !== (g[v_c] || -1)))) {
          _q438 = false;
          break Q439;
        }
      }
    }
  }
  if (!(_q438)) return false;
  for (let _k444 = 0; _k444 < cl.count.at.length; _k444++) {
    const _at445 = perElement(cl.count.at[_k444]);
    const _per447 = perValue(cl.count.at[_k444]);
    const _v446 = cl.count.v[_k444];
    let _g448 = 0;
    G449: {
      const _a450 = sp.lineCells[_at445];
      for (let _i451 = 0; _i451 < _a450.length; _i451++) {
        const v_c = _a450[_i451];
        if (!(((g[v_c] || -1) === _per447))) continue;
        _g448++;
      }
    }
    if (!((_g448 === _v446))) return false;
  }
  return true;
}

export interface PairBinding {
  c: number;
  p: number;
}

const pairFacts: number[] = [];

export function pair(b: Marks, _sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<PairBinding> | null): number {
  const _g15: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (!(b.known(v_c))) return 0;
  _g15.length = 0;
  G16: {
    const _a19 = cl.tile.cells[cl.tile.of[v_c]];
    for (let _i20 = 0; _i20 < _a19.length; _i20++) {
      const v_p = _a19[_i20];
      if (!((v_p !== v_c))) continue;
      _g15.push(v_p);
    }
  }
  const _a21 = _g15;
  for (let _i22 = 0; _i22 < _a21.length; _i22++) {
    const v_p = _a21[_i22];
    if (!(!(b.known(v_p)))) continue;
    facts.length = 0;
    changed = false;
    const _t23 = (4 - b.value(v_c));
    if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, _t23); changed = true; } else facts.push(PLACE, v_p, _t23); }
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
  const _h28 = b.known(v_c);
  const _h29 = b.value(v_c);
  if (!((_h28 && (_h29 !== 2)))) return 0;
  const _a30 = sp.adj4[v_c];
  for (let _i31 = 0; _i31 < _a30.length; _i31++) {
    const v_p = _a30[_i31];
    facts.length = 0;
    changed = false;
    if (b.has(v_p, _h29)) { if (fire === null) { b.strikeAt(v_p, _h29); changed = true; } else facts.push(STRIKE, v_p, _h29); }
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
  const _g42: number[] = [];
  const facts = tileFacts;
  let fired = 0;
  let changed = false;
  const _h52 = rangeMask(1, 3);
  _g42.length = 0;
  G43: {
    const _a46 = cl.tile.cells[cl.tile.of[v_c]];
    for (let _i47 = 0; _i47 < _a46.length; _i47++) {
      const v_p = _a46[_i47];
      if (!((v_p !== v_c))) continue;
      _g42.push(v_p);
    }
  }
  const _a48 = _g42;
  for (let _i49 = 0; _i49 < _a48.length; _i49++) {
    const v_p = _a48[_i49];
    facts.length = 0;
    changed = false;
    let _q50 = true;
    Q51: {
      for (let _m53 = _h52; _m53 !== 0; _m53 &= _m53 - 1) {
        const v_d = 31 - Math.clz32(_m53 & -_m53);
        if (!(!b.has(v_c, v_d))) continue;
        const _t54 = (4 - v_d);
        if (b.has(v_p, _t54)) { if (fire === null) { b.strikeAt(v_p, _t54); changed = true; } else facts.push(STRIKE, v_p, _t54); }
        if (!(true)) {
          _q50 = false;
          break Q51;
        }
      }
    }
    if (!(_q50)) return -1;
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
  const _a57 = sp.cells;
  for (let _i58 = 0; _i58 < _a57.length; _i58++) {
    const v_c = _a57[_i58];
    if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) < 2))) continue;
    facts.length = 0;
    changed = false;
    let _c61 = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) === 1);
    if (_c61) {
      let _c60 = b.known(v_c);
      if (!_c60) {
        const _t59 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))));
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t59); changed = true; } else facts.push(PLACE, v_c, _t59); }
        _c60 = true;
      }
      _c61 = _c60;
    }
    if (!(_c61)) return -1;
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
  const _g78: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  const _h74 = rangeMask(1, 3);
  const _a72 = union(sp.cols, sp.rows);
  for (let _i73 = 0; _i73 < _a72.length; _i73++) {
    const v_L = _a72[_i73];
    for (let _m75 = _h74; _m75 !== 0; _m75 &= _m75 - 1) {
      const v_d = 31 - Math.clz32(_m75 & -_m75);
      const _h76 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L77: {
        const v_v = _h76;
        if (!((v_v >= 0))) break L77;
        _g78.length = 0;
        G79: {
          const _a82 = sp.lineCells[v_L];
          for (let _i83 = 0; _i83 < _a82.length; _i83++) {
            const v_c = _a82[_i83];
            if (!((!(b.known(v_c)) && b.has(v_c, v_d)))) continue;
            _g78.push(v_c);
          }
        }
        const v_O = _g78;
        const _h88 = v_O.length;
        facts.length = 0;
        changed = false;
        let _g84 = 0;
        G85: {
          const _a86 = sp.lineCells[v_L];
          for (let _i87 = 0; _i87 < _a86.length; _i87++) {
            const v_c = _a86[_i87];
            if (!((b.value(v_c) === v_d))) continue;
            _g84++;
          }
        }
        let _c93 = (_g84 <= v_v);
        if (_c93) {
          let _g89 = 0;
          G90: {
            const _a91 = sp.lineCells[v_L];
            for (let _i92 = 0; _i92 < _a91.length; _i92++) {
              const v_c = _a91[_i92];
              if (!((b.value(v_c) === v_d))) continue;
              _g89++;
            }
          }
          _c93 = (_h88 >= (v_v - _g89));
        }
        let _c103 = _c93;
        if (_c103) {
          let _g94 = 0;
          G95: {
            const _a96 = sp.lineCells[v_L];
            for (let _i97 = 0; _i97 < _a96.length; _i97++) {
              const v_c = _a96[_i97];
              if (!((b.value(v_c) === v_d))) continue;
              _g94++;
            }
          }
          let _c102 = (_g94 < v_v);
          if (!_c102) {
            let _q98 = true;
            Q99: {
              const _a100 = v_O;
              for (let _i101 = 0; _i101 < _a100.length; _i101++) {
                const v_c = _a100[_i101];
                if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
                if (!(true)) {
                  _q98 = false;
                  break Q99;
                }
              }
            }
            _c102 = _q98;
          }
          _c103 = _c102;
        }
        let _c118 = _c103;
        if (_c118) {
          let _g104 = 0;
          G105: {
            const _a106 = sp.lineCells[v_L];
            for (let _i107 = 0; _i107 < _a106.length; _i107++) {
              const v_c = _a106[_i107];
              if (!((b.value(v_c) === v_d))) continue;
              _g104++;
            }
          }
          let _c112 = (_g104 === v_v);
          if (!_c112) {
            let _g108 = 0;
            G109: {
              const _a110 = sp.lineCells[v_L];
              for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                const v_c = _a110[_i111];
                if (!((b.value(v_c) === v_d))) continue;
                _g108++;
              }
            }
            _c112 = (_h88 > (v_v - _g108));
          }
          let _c117 = _c112;
          if (!_c117) {
            let _q113 = true;
            Q114: {
              const _a115 = v_O;
              for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                const v_c = _a115[_i116];
                if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
                if (!(true)) {
                  _q113 = false;
                  break Q114;
                }
              }
            }
            _c117 = _q113;
          }
          _c118 = _c117;
        }
        if (!(_c118)) return -1;
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
  const _g174: number[] = [];
  const _g180: number[] = [];
  const facts = oddGapFacts;
  let fired = 0;
  let changed = false;
  const _h160 = rangeMask(1, 3);
  const _a151 = union(sp.cols, sp.rows);
  for (let _i152 = 0; _i152 < _a151.length; _i152++) {
    const v_L = _a151[_i152];
    const _h153 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L154: {
      const v_n = _h153;
      let _c159 = (v_n >= 0);
      if (_c159) {
        let _g155 = 0;
        G156: {
          const _a157 = sp.lineCells[v_L];
          for (let _i158 = 0; _i158 < _a157.length; _i158++) {
            const v_c = _a157[_i158];
            if (!((b.value(v_c) === 2))) continue;
            _g155++;
          }
        }
        _c159 = (_g155 === v_n);
      }
      if (!(_c159)) break L154;
      for (let _m161 = _h160; _m161 !== 0; _m161 &= _m161 - 1) {
        const v_d = 31 - Math.clz32(_m161 & -_m161);
        const _h162 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        const _h163 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, (4 - v_d))));
        let _c173 = (((v_d !== 2) && (_h162 >= 0)) && (_h163 >= 0));
        if (_c173) {
          let _g164 = 0;
          G165: {
            const _a166 = sp.lineCells[v_L];
            for (let _i167 = 0; _i167 < _a166.length; _i167++) {
              const v_c = _a166[_i167];
              if (!((b.value(v_c) === v_d))) continue;
              _g164++;
            }
          }
          const _t168 = (4 - v_d);
          let _g169 = 0;
          G170: {
            const _a171 = sp.lineCells[v_L];
            for (let _i172 = 0; _i172 < _a171.length; _i172++) {
              const v_c = _a171[_i172];
              if (!((b.value(v_c) === _t168))) continue;
              _g169++;
            }
          }
          _c173 = ((_h162 - _g164) === ((_h163 - _g169) + 1));
        }
        if (!(_c173)) continue;
        _g174.length = 0;
        G175: {
          const _a178 = sp.lineCells[v_L];
          for (let _i179 = 0; _i179 < _a178.length; _i179++) {
            const v_c = _a178[_i179];
            if (!(!(b.known(v_c)))) continue;
            _g174.push(v_c);
          }
        }
        const v_O = _g174;
        _g180.length = 0;
        G181: {
          const _a184 = v_O;
          for (let _i185 = 0; _i185 < _a184.length; _i185++) {
            const v_c = _a184[_i185];
            const _h186 = stretch(sp.lineCells[v_L], v_c, v_O).length;
            if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0) && ((_h186 % 2) === 1)))) continue;
            _g180.push(v_c);
          }
        }
        L187: {
          const v_S = _g180;
          const _h188 = v_S.length;
          if (!((_h188 === 1))) break L187;
          facts.length = 0;
          changed = false;
          const _t189 = (v_S.length > 0 ? v_S[0] : -1);
          if (!b.known(_t189)) { if (fire === null) { b.placeAt(_t189, v_d); changed = true; } else facts.push(PLACE, _t189, v_d); }
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
  const _g230: number[] = [];
  const _g250: number[] = [];
  const facts = markedFacts;
  let fired = 0;
  let changed = false;
  const _h262 = rangeMask(1, 3);
  const _a228 = union(sp.cols, sp.rows);
  for (let _i229 = 0; _i229 < _a228.length; _i229++) {
    const v_L = _a228[_i229];
    _g230.length = 0;
    G231: {
      const _a245 = sp.lineCells[v_L];
      for (let _i246 = 0; _i246 < _a245.length; _i246++) {
        const v_c = _a245[_i246];
        const _h247 = b.known(v_c);
        let _c259 = (!(_h247) && !b.has(v_c, 2));
        if (_c259) {
          let _q248 = false;
          Q249: {
            _g250.length = 0;
            G251: {
              const _a254 = cl.tile.cells[cl.tile.of[v_c]];
              for (let _i255 = 0; _i255 < _a254.length; _i255++) {
                const v_p = _a254[_i255];
                if (!((v_p !== v_c))) continue;
                _g250.push(v_p);
              }
            }
            const _a256 = _g250;
            for (let _i257 = 0; _i257 < _a256.length; _i257++) {
              const v_p = _a256[_i257];
              const _h258 = b.known(v_p);
              if ((((sp.lineCells[v_L].includes(v_p)) && !(_h258)) && !b.has(v_p, 2))) {
                _q248 = true;
                break Q249;
              }
            }
          }
          _c259 = _q248;
        }
        if (!(_c259)) continue;
        _g230.push(v_c);
      }
    }
    L260: {
      const v_M = _g230;
      const _h261 = v_M.length;
      if (!((_h261 > 0))) break L260;
      for (let _m263 = _h262; _m263 !== 0; _m263 &= _m263 - 1) {
        const v_d = 31 - Math.clz32(_m263 & -_m263);
        if (!((v_d !== 2))) continue;
        const _h264 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
        L265: {
          const v_v = _h264;
          let _c271 = (v_v >= 0);
          if (_c271) {
            let _g266 = 0;
            G267: {
              const _a268 = sp.lineCells[v_L];
              for (let _i269 = 0; _i269 < _a268.length; _i269++) {
                const v_c = _a268[_i269];
                const _h270 = b.value(v_c);
                if (!((_h270 === v_d))) continue;
                _g266++;
              }
            }
            _c271 = ((2 * (v_v - _g266)) === _h261);
          }
          if (!(_c271)) break L265;
          facts.length = 0;
          changed = false;
          let _q272 = true;
          Q273: {
            const _a274 = sp.lineCells[v_L];
            for (let _i275 = 0; _i275 < _a274.length; _i275++) {
              const v_c = _a274[_i275];
              const _h276 = b.known(v_c);
              if (!((!(_h276) && !(v_M.includes(v_c))))) continue;
              if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q272 = false;
                break Q273;
              }
            }
          }
          if (!(_q272)) return -1;
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
  const _g300: number[] = [];
  const facts = oneNeutralFacts;
  let fired = 0;
  let changed = false;
  const _a285 = union(sp.cols, sp.rows);
  for (let _i286 = 0; _i286 < _a285.length; _i286++) {
    const v_L = _a285[_i286];
    const _h287 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, 2)));
    L288: {
      const v_n = _h287;
      let _c294 = (v_n >= 0);
      if (_c294) {
        let _g289 = 0;
        G290: {
          const _a291 = sp.lineCells[v_L];
          for (let _i292 = 0; _i292 < _a291.length; _i292++) {
            const v_c = _a291[_i292];
            const _h293 = b.value(v_c);
            if (!((_h293 === 2))) continue;
            _g289++;
          }
        }
        _c294 = ((_g289 + 1) === v_n);
      }
      if (!(_c294)) break L288;
      facts.length = 0;
      changed = false;
      let _q295 = true;
      Q296: {
        const _a297 = sp.lineCells[v_L];
        for (let _i298 = 0; _i298 < _a297.length; _i298++) {
          const v_c = _a297[_i298];
          const _h299 = b.known(v_c);
          if (!(!(_h299))) continue;
          _g300.length = 0;
          G301: {
            const _a304 = cl.tile.cells[cl.tile.of[v_c]];
            for (let _i305 = 0; _i305 < _a304.length; _i305++) {
              const v_p = _a304[_i305];
              if (!((v_p !== v_c))) continue;
              _g300.push(v_p);
            }
          }
          const _a306 = _g300;
          for (let _i307 = 0; _i307 < _a306.length; _i307++) {
            const v_p = _a306[_i307];
            const _h308 = b.known(v_p);
            if (!(((sp.lineCells[v_L].includes(v_p)) && !(_h308)))) continue;
            if (b.has(v_c, 2)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
            if (!(true)) {
              _q295 = false;
              break Q296;
            }
          }
        }
      }
      if (!(_q295)) return -1;
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
  const _g332: number[] = [];
  const facts = everyTileFacts;
  let fired = 0;
  let changed = false;
  const _h328 = rangeMask(1, 3);
  const _a326 = union(sp.cols, sp.rows);
  for (let _i327 = 0; _i327 < _a326.length; _i327++) {
    const v_L = _a326[_i327];
    for (let _m329 = _h328; _m329 !== 0; _m329 &= _m329 - 1) {
      const v_d = 31 - Math.clz32(_m329 & -_m329);
      if (!((v_d !== 2))) continue;
      const _h330 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L331: {
        const v_v = _h330;
        if (!((v_v >= 0))) break L331;
        _g332.length = 0;
        G333: {
          const _a336 = sp.lineCells[v_L];
          for (let _i337 = 0; _i337 < _a336.length; _i337++) {
            const v_c = _a336[_i337];
            const _h338 = b.known(v_c);
            if (!(!(_h338))) continue;
            const _t339 = cl.tile.of[v_c];
            if (!_g332.includes(_t339)) _g332.push(_t339);
          }
        }
        L340: {
          const v_T = _g332;
          const _h341 = v_T.length;
          let _c347 = (_h341 > 0);
          if (_c347) {
            let _g342 = 0;
            G343: {
              const _a344 = sp.lineCells[v_L];
              for (let _i345 = 0; _i345 < _a344.length; _i345++) {
                const v_c = _a344[_i345];
                const _h346 = b.value(v_c);
                if (!((_h346 === v_d))) continue;
                _g342++;
              }
            }
            _c347 = ((v_v - _g342) === _h341);
          }
          if (!(_c347)) break L340;
          facts.length = 0;
          changed = false;
          let _q348 = true;
          Q349: {
            const _a350 = sp.lineCells[v_L];
            for (let _i351 = 0; _i351 < _a350.length; _i351++) {
              const v_c = _a350[_i351];
              const _h352 = b.known(v_c);
              if (!(!(_h352))) continue;
              if (b.has(v_c, 2)) { if (fire === null) { b.strikeAt(v_c, 2); changed = true; } else facts.push(STRIKE, v_c, 2); }
              if (!(true)) {
                _q348 = false;
                break Q349;
              }
            }
          }
          if (!(_q348)) return -1;
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
  const _g382: number[] = [];
  const _g388: number[] = [];
  const _g414: number[] = [];
  const facts = onlyEndFacts;
  let fired = 0;
  let changed = false;
  const _h378 = rangeMask(1, 3);
  const _a376 = union(sp.cols, sp.rows);
  for (let _i377 = 0; _i377 < _a376.length; _i377++) {
    const v_L = _a376[_i377];
    for (let _m379 = _h378; _m379 !== 0; _m379 &= _m379 - 1) {
      const v_d = 31 - Math.clz32(_m379 & -_m379);
      if (!((v_d !== 2))) continue;
      const _h380 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L381: {
        const v_v = _h380;
        if (!((v_v >= 0))) break L381;
        _g382.length = 0;
        G383: {
          const _a386 = sp.lineCells[v_L];
          for (let _i387 = 0; _i387 < _a386.length; _i387++) {
            const v_c = _a386[_i387];
            if (!((!(b.known(v_c)) && b.has(v_c, v_d)))) continue;
            _g382.push(v_c);
          }
        }
        const v_O = _g382;
        _g388.length = 0;
        G389: {
          const _a392 = v_O;
          for (let _i393 = 0; _i393 < _a392.length; _i393++) {
            const v_c = _a392[_i393];
            const _t394 = cl.tile.of[v_c];
            if (!_g388.includes(_t394)) _g388.push(_t394);
          }
        }
        L395: {
          const v_T = _g388;
          const _h396 = v_T.length;
          let _c401 = (_h396 > 0);
          if (_c401) {
            let _g397 = 0;
            G398: {
              const _a399 = sp.lineCells[v_L];
              for (let _i400 = 0; _i400 < _a399.length; _i400++) {
                const v_c = _a399[_i400];
                if (!((b.value(v_c) === v_d))) continue;
                _g397++;
              }
            }
            _c401 = ((v_v - _g397) === _h396);
          }
          if (!(_c401)) break L395;
          facts.length = 0;
          changed = false;
          let _q402 = true;
          Q403: {
            const _a404 = v_O;
            for (let _i405 = 0; _i405 < _a404.length; _i405++) {
              const v_c = _a404[_i405];
              let _q412 = false;
              Q413: {
                _g414.length = 0;
                G415: {
                  const _a418 = cl.tile.cells[cl.tile.of[v_c]];
                  for (let _i419 = 0; _i419 < _a418.length; _i419++) {
                    const v_p = _a418[_i419];
                    if (!((v_p !== v_c))) continue;
                    _g414.push(v_p);
                  }
                }
                const _a420 = _g414;
                for (let _i421 = 0; _i421 < _a420.length; _i421++) {
                  const v_p = _a420[_i421];
                  if ((v_O.includes(v_p))) {
                    _q412 = true;
                    break Q413;
                  }
                }
              }
              if (!(!(_q412))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q402 = false;
                break Q403;
              }
            }
          }
          if (!(_q402)) return -1;
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
