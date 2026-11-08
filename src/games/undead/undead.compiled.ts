// Compiled by `npm run describe` from src/games/undead/undead.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, keptStore, least, minus, popcount, sights, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  mirror: ClueList;
  sees: ClueList;
  ghosts: number;
  vampires: number;
  zombies: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "single" | "total" | "sightline";

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
  { id: "single", tier: 0 },
  { id: "total", tier: 1 },
  { id: "sightline", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 4; v_d++) {
      if (!(((v_d === 4) === (clueAt(cl.mirror, v_c) >= 0)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _h173 = sp.cells.length;
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q163 = true;
  Q164: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      const _h174 = (v_d === 1);
      const _h175 = (v_d === 2);
      const _h176 = (v_d === 3);
      let _g165 = 0;
      G166: {
        const _a167 = sp.cells;
        for (let _i168 = 0; _i168 < _a167.length; _i168++) {
          const v_c = _a167[_i168];
          const _h169 = (g[v_c] || -1);
          if (!((_h169 === v_d))) continue;
          _g165++;
        }
      }
      let _g170 = -1;
      let _n172 = 0;
      G171: {
        for (let v_n = 0; v_n <= _h173; v_n++) {
          if (!((((_h174 && (v_n === cl.ghosts)) || (_h175 && (v_n === cl.vampires))) || (_h176 && (v_n === cl.zombies))))) continue;
          if (++_n172 === 2) {
            _g170 = -1;
            break G171;
          }
          _g170 = v_n;
        }
      }
      if (!((_g165 === _g170))) {
        _q163 = false;
        break Q164;
      }
    }
  }
  if (!(_q163)) return false;
  for (let _k177 = 0; _k177 < cl.mirror.at.length; _k177++) {
    const _at178 = cl.mirror.at[_k177];
    if (!(((g[_at178] || -1) === 4))) return false;
  }
  for (let _k180 = 0; _k180 < cl.sees.at.length; _k180++) {
    const _at181 = cl.sees.at[_k180];
    const _v182 = cl.sees.v[_k180];
    let _g183 = 0;
    G184: {
      const _a185 = sights(sp, cl.mirror)[_at181].direct;
      for (let _i186 = 0; _i186 < _a185.length; _i186++) {
        const v_x = _a185[_i186];
        const _h187 = (g[v_x] || -1);
        if (!((_h187 !== 1))) continue;
        _g183++;
      }
    }
    let _g188 = 0;
    G189: {
      const _a190 = sights(sp, cl.mirror)[_at181].bent;
      for (let _i191 = 0; _i191 < _a190.length; _i191++) {
        const v_x = _a190[_i191];
        const _h192 = (g[v_x] || -1);
        if (!((_h192 !== 2))) continue;
        _g188++;
      }
    }
    let _g193 = 0;
    G194: {
      const _a195 = sights(sp, cl.mirror)[_at181].twice;
      for (let _i196 = 0; _i196 < _a195.length; _i196++) {
        const v_x = _a195[_i196];
        const _h197 = (g[v_x] || -1);
        if (!((_h197 !== 2))) continue;
        _g193++;
      }
    }
    if (!((((_g183 + _g188) + _g193) === _v182))) return false;
  }
  return true;
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
  const _a5 = sp.cells;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_c = _a5[_i6];
    if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))) continue;
    facts.length = 0;
    changed = false;
    let _c9: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c9) {
      let _c8: boolean = (b.grid[v_c] !== 0);
      if (!_c8) {
        const _t7 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t7); changed = true; } else facts.push(PLACE, v_c, _t7); }
        _c8 = true;
      }
      _c9 = _c8;
    }
    if (!(_c9)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface TotalBinding {
  d: number;
  n: number;
  P: readonly number[];
  O: readonly number[];
}

const totalFacts: number[] = [];
let totalCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function total(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TotalBinding> | null): number {
  const _g26: number[] = [];
  const _g33: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  if (totalCands.length < sp.cells.length) totalCands = new Int32Array(sp.cells.length);
  const cands = totalCands;
  cands.fill(-1);
  for (let v_d = 1; v_d <= 3; v_d++) {
    const _h32 = ((1 << v_d));
    const v_n = holds(sp, cl, v_d);
    _g26.length = 0;
    G27: {
      const _a30 = sp.cells;
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_c = _a30[_i31];
        if (!(((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) === _h32))) continue;
        _g26.push(v_c);
      }
    }
    const v_P = _g26;
    const _h39 = v_P.length;
    _g33.length = 0;
    G34: {
      const _a37 = sp.cells;
      for (let _i38 = 0; _i38 < _a37.length; _i38++) {
        const v_c = _a37[_i38];
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        _g33.push(v_c);
      }
    }
    const v_O = _g33;
    const _h40 = v_O.length;
    facts.length = 0;
    changed = false;
    let _c46: boolean = ((_h39 <= v_n) && (_h40 >= v_n));
    if (_c46) {
      let _c45: boolean = (_h39 < v_n);
      if (!_c45) {
        let _q41 = true;
        Q42: {
          const _a43 = minus(v_O, v_P);
          for (let _i44 = 0; _i44 < _a43.length; _i44++) {
            const v_c = _a43[_i44];
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
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
    let _c52: boolean = _c46;
    if (_c52) {
      let _c51: boolean = (_h40 > v_n);
      if (!_c51) {
        let _q47 = true;
        Q48: {
          const _a49 = minus(v_O, v_P);
          for (let _i50 = 0; _i50 < _a49.length; _i50++) {
            const v_c = _a49[_i50];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
            if (!(true)) {
              _q47 = false;
              break Q48;
            }
          }
        }
        _c51 = _q47;
      }
      _c52 = _c51;
    }
    if (!(_c52)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ d: v_d, n: v_n, P: v_P.slice(), O: v_O.slice() }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface SightlineBinding {
  n: number;
  r: number;
  s: number;
  t: number;
  L: readonly number[];
  a: number;
  b: number;
  g: number;
  v: number;
  z: number;
}

const sightlineFacts: number[] = [];
let sightlineCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function sightline(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SightlineBinding> | null): number {
  const _p103 = new Int32Array(sp.cells.length);
  let _l104: readonly number[] = [];
  let _y105 = false;
  const _f109 = new Int32Array(sp.cells.length).fill(-1);
  let _l110: readonly number[] = [];
  const _s111: number[] = [];
  const facts = sightlineFacts;
  let fired = 0;
  let changed = false;
  const _h76 = sp.cells.length;
  const _h77 = sp.slots.length;
  const _h78 = (_h77 - 1);
  const _h87 = ((1 << 1));
  const _h92 = ((1 << 2));
  const _h97 = ((1 << 3));
  let _epoch = 0;
  if (sightlineCands.length < sp.cells.length) sightlineCands = new Int32Array(sp.cells.length);
  const cands = sightlineCands;
  cands.fill(-1);
  for (let v_n = 0; v_n <= _h76; v_n++) {
    for (let v_r = 0; v_r <= _h78; v_r++) {
      L79: {
        const v_s = (sp.slots[ofRound(sp, v_r)] ?? -1);
        const _h80 = sights(sp, cl.mirror)[v_s].all.length;
        if (!(((_h80 === v_n) && (v_r < round(sp, sights(sp, cl.mirror)[v_s].exit))))) break L79;
        const _h81 = clueAt(cl.sees, v_s);
        const v_t = sights(sp, cl.mirror)[v_s].exit;
        const _h82 = clueAt(cl.sees, v_t);
        const v_L = sights(sp, cl.mirror)[v_s].all;
        const v_a = _h81;
        const _h119 = (v_a < 0);
        const v_b = _h82;
        const _h133 = (v_b < 0);
        let _g83 = 0;
        G84: {
          const _a85 = sp.cells;
          for (let _i86 = 0; _i86 < _a85.length; _i86++) {
            const v_x = _a85[_i86];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h87))) continue;
            _g83++;
          }
        }
        const v_g = (holds(sp, cl, 1) - _g83);
        let _g88 = 0;
        G89: {
          const _a90 = sp.cells;
          for (let _i91 = 0; _i91 < _a90.length; _i91++) {
            const v_x = _a90[_i91];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h92))) continue;
            _g88++;
          }
        }
        const v_v = (holds(sp, cl, 2) - _g88);
        let _g93 = 0;
        G94: {
          const _a95 = sp.cells;
          for (let _i96 = 0; _i96 < _a95.length; _i96++) {
            const v_x = _a95[_i96];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h97))) continue;
            _g93++;
          }
        }
        const v_z = (holds(sp, cl, 3) - _g93);
        let _g106 = -1;
        facts.length = 0;
        changed = false;
        let _q98 = true;
        Q99: {
          const _a100 = v_L;
          for (let _i101 = 0; _i101 < _a100.length; _i101++) {
            const v_c = _a100[_i101];
            for (let _m102 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m102 !== 0; _m102 &= _m102 - 1) {
              const v_d = 31 - Math.clz32(_m102 & -_m102);
              if (_g106 !== _epoch) {
                _g106 = _epoch;
                for (const _e107 of _l104) _p103[_e107] = 0;
                _y105 = false;
                const _a108 = v_L;
                for (const _e112 of _l110) _f109[_e112] = -1;
                _l110 = _a108;
                let _i114 = 0;
                _s111[0] = 0;
                let _o118 = _a108.length === 0;
                for (;;) {
                  if (_a108.length === 0) {
                    if (!_o118) break;
                    _o118 = false;
                  }
                  while (_a108.length > 0 && _i114 >= 0) {
                    const _e112 = _a108[_i114];
                    if (_s111[_i114] > 0) _f109[_e112] = -1;
                    let _r117 = (cands[_e112] >= 0 ? cands[_e112] : (cands[_e112] = b.cands[_e112])) & ~((2 << _s111[_i114]) - 1);
                    let _d113 = 0;
                    for (; _r117 !== 0; _r117 &= _r117 - 1) {
                      _d113 = 31 - Math.clz32(_r117 & -_r117);
                      _f109[_e112] = _d113;
                      break;
                    }
                    if (_r117 === 0) {
                      _s111[_i114] = 0;
                      _i114--;
                      continue;
                    }
                    _s111[_i114] = _d113;
                    if (_i114 === _a108.length - 1) break;
                    _i114++;
                    _s111[_i114] = 0;
                  }
                  if (_i114 < 0) break;
                  let _c132: boolean = _h119;
                  if (!_c132) {
                    let _g120 = 0;
                    G121: {
                      const _a122 = sights(sp, cl.mirror)[v_s].direct;
                      for (let _i123 = 0; _i123 < _a122.length; _i123++) {
                        const v_x = _a122[_i123];
                        if (!((_f109[v_x] !== 1))) continue;
                        _g120++;
                      }
                    }
                    let _g124 = 0;
                    G125: {
                      const _a126 = sights(sp, cl.mirror)[v_s].bent;
                      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                        const v_x = _a126[_i127];
                        if (!((_f109[v_x] !== 2))) continue;
                        _g124++;
                      }
                    }
                    let _g128 = 0;
                    G129: {
                      const _a130 = sights(sp, cl.mirror)[v_s].twice;
                      for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                        const v_x = _a130[_i131];
                        if (!((_f109[v_x] !== 2))) continue;
                        _g128++;
                      }
                    }
                    _c132 = (((_g120 + _g124) + _g128) === v_a);
                  }
                  let _c147: boolean = _c132;
                  if (_c147) {
                    let _c146: boolean = _h133;
                    if (!_c146) {
                      let _g134 = 0;
                      G135: {
                        const _a136 = sights(sp, cl.mirror)[v_t].direct;
                        for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                          const v_x = _a136[_i137];
                          if (!((_f109[v_x] !== 1))) continue;
                          _g134++;
                        }
                      }
                      let _g138 = 0;
                      G139: {
                        const _a140 = sights(sp, cl.mirror)[v_t].bent;
                        for (let _i141 = 0; _i141 < _a140.length; _i141++) {
                          const v_x = _a140[_i141];
                          if (!((_f109[v_x] !== 2))) continue;
                          _g138++;
                        }
                      }
                      let _g142 = 0;
                      G143: {
                        const _a144 = sights(sp, cl.mirror)[v_t].twice;
                        for (let _i145 = 0; _i145 < _a144.length; _i145++) {
                          const v_x = _a144[_i145];
                          if (!((_f109[v_x] !== 2))) continue;
                          _g142++;
                        }
                      }
                      _c146 = (((_g134 + _g138) + _g142) === v_b);
                    }
                    _c147 = _c146;
                  }
                  let _c152: boolean = _c147;
                  if (_c152) {
                    let _g148 = 0;
                    G149: {
                      const _a150 = v_L;
                      for (let _i151 = 0; _i151 < _a150.length; _i151++) {
                        const v_x = _a150[_i151];
                        if (!(((_f109[v_x] === 1) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g148++;
                      }
                    }
                    _c152 = (_g148 <= v_g);
                  }
                  let _c157: boolean = _c152;
                  if (_c157) {
                    let _g153 = 0;
                    G154: {
                      const _a155 = v_L;
                      for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                        const v_x = _a155[_i156];
                        if (!(((_f109[v_x] === 2) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g153++;
                      }
                    }
                    _c157 = (_g153 <= v_v);
                  }
                  let _c162: boolean = _c157;
                  if (_c162) {
                    let _g158 = 0;
                    G159: {
                      const _a160 = v_L;
                      for (let _i161 = 0; _i161 < _a160.length; _i161++) {
                        const v_x = _a160[_i161];
                        if (!(((_f109[v_x] === 3) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g158++;
                      }
                    }
                    _c162 = (_g158 <= v_z);
                  }
                  if (!(_c162)) continue;
                  _l104 = _a108;
                  _y105 = true;
                  for (const _e107 of _a108) _p103[_e107] |= 1 << _f109[_e107];
                }
              }
              if (!(!(((((_p103[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y105 && !v_L.includes(v_c)))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q98 = false;
                break Q99;
              }
            }
          }
        }
        if (!(_q98)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ n: v_n, r: v_r, s: v_s, t: v_t, L: v_L.slice(), a: v_a, b: v_b, g: v_g, v: v_v, z: v_z }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

const holdsKept = keptStore<number>();

/** `holds(d)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function holds(sp: GridSpace, cl: Dealt, v_d: number): number {
  const _kept: Kept<number> = holdsKept.board(cl);
  if (_kept[v_d] !== undefined) return _kept[v_d];
  let _g10 = -1;
  let _n12 = 0;
  G11: {
    const _t13 = sp.cells.length;
    for (let v_n = 0; v_n <= _t13; v_n++) {
      if (!(((((v_d === 1) && (v_n === cl.ghosts)) || ((v_d === 2) && (v_n === cl.vampires))) || ((v_d === 3) && (v_n === cl.zombies))))) continue;
      if (++_n12 === 2) {
        _g10 = -1;
        break G11;
      }
      _g10 = v_n;
    }
  }
  const _made = _g10;
  _kept[v_d] = _made;
  return _made;
}

const ofRoundKept = keptStore<number>();

/** `ofRound(r)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function ofRound(sp: GridSpace, v_r: number): number {
  const _kept: Kept<number> = ofRoundKept.board(sp);
  if (_kept[v_r] !== undefined) return _kept[v_r];
  let _g55 = -1;
  let _n57 = 0;
  G56: {
    const _t58 = (sp.slots.length - 1);
    for (let v_i = 0; v_i <= _t58; v_i++) {
      if (!((((((v_r < sp.w) && (v_i === v_r)) || (((v_r >= sp.w) && (v_r < (sp.w + sp.h))) && (v_i === ((sp.w + sp.h) + v_r)))) || (((v_r >= (sp.w + sp.h)) && (v_r < ((2 * sp.w) + sp.h))) && (v_i === ((((3 * sp.w) + sp.h) - 1) - v_r)))) || ((v_r >= ((2 * sp.w) + sp.h)) && (v_i === ((((4 * sp.w) + (2 * sp.h)) - 1) - v_r)))))) continue;
      if (++_n57 === 2) {
        _g55 = -1;
        break G56;
      }
      _g55 = v_i;
    }
  }
  const _made = _g55;
  _kept[v_r] = _made;
  return _made;
}

const roundKept = keptStore<number>();

/** `round(s)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function round(sp: GridSpace, v_s: number): number {
  const _kept: Kept<number> = roundKept.board(sp);
  if (_kept[v_s] !== undefined) return _kept[v_s];
  let _g60 = -1;
  let _n62 = 0;
  G61: {
    const _t63 = (sp.slots.length - 1);
    for (let v_r = 0; v_r <= _t63; v_r++) {
      if (!((ofRound(sp, v_r) === v_s))) continue;
      if (++_n62 === 2) {
        _g60 = -1;
        break G61;
      }
      _g60 = v_r;
    }
  }
  const _made = _g60;
  _kept[v_s] = _made;
  return _made;
}
