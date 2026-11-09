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
  const _k174 = holdsKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q167 = true;
  Q168: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      let _g169 = 0;
      G170: {
        const _a171 = sp.cells;
        for (let _i172 = 0; _i172 < _a171.length; _i172++) {
          const v_c = _a171[_i172];
          const _h173 = (g[v_c] || -1);
          if (!((_h173 === v_d))) continue;
          _g169++;
        }
      }
      if (!((_g169 === (_k174[v_d] ?? holds(sp, cl, v_d))))) {
        _q167 = false;
        break Q168;
      }
    }
  }
  if (!(_q167)) return false;
  for (let _k175 = 0; _k175 < cl.mirror.at.length; _k175++) {
    const _at176 = cl.mirror.at[_k175];
    if (!(((g[_at176] || -1) === 4))) return false;
  }
  for (let _k178 = 0; _k178 < cl.sees.at.length; _k178++) {
    const _at179 = cl.sees.at[_k178];
    const _v180 = cl.sees.v[_k178];
    let _g181 = 0;
    G182: {
      const _a183 = sights(sp, cl.mirror)[_at179].direct;
      for (let _i184 = 0; _i184 < _a183.length; _i184++) {
        const v_x = _a183[_i184];
        const _h185 = (g[v_x] || -1);
        if (!((_h185 !== 1))) continue;
        _g181++;
      }
    }
    let _g186 = 0;
    G187: {
      const _a188 = sights(sp, cl.mirror)[_at179].bent;
      for (let _i189 = 0; _i189 < _a188.length; _i189++) {
        const v_x = _a188[_i189];
        const _h190 = (g[v_x] || -1);
        if (!((_h190 !== 2))) continue;
        _g186++;
      }
    }
    let _g191 = 0;
    G192: {
      const _a193 = sights(sp, cl.mirror)[_at179].twice;
      for (let _i194 = 0; _i194 < _a193.length; _i194++) {
        const v_x = _a193[_i194];
        const _h195 = (g[v_x] || -1);
        if (!((_h195 !== 2))) continue;
        _g191++;
      }
    }
    if (!((((_g181 + _g186) + _g191) === _v180))) return false;
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
  const _g27: number[] = [];
  const _g34: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  const _k26 = holdsKept.board(cl);
  if (totalCands.length < sp.cells.length) totalCands = new Int32Array(sp.cells.length);
  const cands = totalCands;
  cands.fill(-1);
  for (let v_d = 1; v_d <= 3; v_d++) {
    const _h33 = ((1 << v_d));
    const v_n = (_k26[v_d] ?? holds(sp, cl, v_d));
    _g27.length = 0;
    G28: {
      const _a31 = sp.cells;
      for (let _i32 = 0; _i32 < _a31.length; _i32++) {
        const v_c = _a31[_i32];
        if (!(((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) === _h33))) continue;
        _g27.push(v_c);
      }
    }
    const v_P = _g27;
    const _h40 = v_P.length;
    _g34.length = 0;
    G35: {
      const _a38 = sp.cells;
      for (let _i39 = 0; _i39 < _a38.length; _i39++) {
        const v_c = _a38[_i39];
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        _g34.push(v_c);
      }
    }
    const v_O = _g34;
    const _h41 = v_O.length;
    facts.length = 0;
    changed = false;
    let _c47: boolean = ((_h40 <= v_n) && (_h41 >= v_n));
    if (_c47) {
      let _c46: boolean = (_h40 < v_n);
      if (!_c46) {
        let _q42 = true;
        Q43: {
          const _a44 = minus(v_O, v_P);
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            const v_c = _a44[_i45];
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q42 = false;
              break Q43;
            }
          }
        }
        _c46 = _q42;
      }
      _c47 = _c46;
    }
    let _c53: boolean = _c47;
    if (_c53) {
      let _c52: boolean = (_h41 > v_n);
      if (!_c52) {
        let _q48 = true;
        Q49: {
          const _a50 = minus(v_O, v_P);
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_c = _a50[_i51];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
            if (!(true)) {
              _q48 = false;
              break Q49;
            }
          }
        }
        _c52 = _q48;
      }
      _c53 = _c52;
    }
    if (!(_c53)) return -1;
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
let _p107 = new Int32Array(0);
let _l108: readonly number[] = [];
let _f113 = new Int32Array(0);
let _l114: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function sightline(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SightlineBinding> | null): number {
  if (_p107.length < sp.cells.length) _p107 = new Int32Array(sp.cells.length);
  else _p107.fill(0);
  _l108 = [];
  let _y109 = false;
  if (_f113.length < sp.cells.length) _f113 = new Int32Array(sp.cells.length).fill(-1);
  else _f113.fill(-1);
  _l114 = [];
  const _s115: number[] = [];
  const facts = sightlineFacts;
  let fired = 0;
  let changed = false;
  const _h77 = sp.cells.length;
  const _h78 = sp.slots.length;
  const _h79 = (_h78 - 1);
  const _k80 = ofRoundKept.board(sp);
  const _k83 = roundKept.board(sp);
  const _k86 = holdsKept.board(cl);
  const _h91 = ((1 << 1));
  const _h96 = ((1 << 2));
  const _h101 = ((1 << 3));
  let _epoch = 0;
  if (sightlineCands.length < sp.cells.length) sightlineCands = new Int32Array(sp.cells.length);
  const cands = sightlineCands;
  cands.fill(-1);
  for (let v_n = 0; v_n <= _h77; v_n++) {
    for (let v_r = 0; v_r <= _h79; v_r++) {
      L81: {
        const v_s = (sp.slots[(_k80[v_r] ?? ofRound(sp, v_r))] ?? -1);
        const _h82 = sights(sp, cl.mirror)[v_s].all.length;
        if (!(((_h82 === v_n) && (v_r < (_k83[sights(sp, cl.mirror)[v_s].exit] ?? round(sp, sights(sp, cl.mirror)[v_s].exit)))))) break L81;
        const _h84 = clueAt(cl.sees, v_s);
        const v_t = sights(sp, cl.mirror)[v_s].exit;
        const _h85 = clueAt(cl.sees, v_t);
        const v_L = sights(sp, cl.mirror)[v_s].all;
        const v_a = _h84;
        const _h123 = (v_a < 0);
        const v_b = _h85;
        const _h137 = (v_b < 0);
        let _g87 = 0;
        G88: {
          const _a89 = sp.cells;
          for (let _i90 = 0; _i90 < _a89.length; _i90++) {
            const v_x = _a89[_i90];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h91))) continue;
            _g87++;
          }
        }
        const v_g = ((_k86[1] ?? holds(sp, cl, 1)) - _g87);
        let _g92 = 0;
        G93: {
          const _a94 = sp.cells;
          for (let _i95 = 0; _i95 < _a94.length; _i95++) {
            const v_x = _a94[_i95];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h96))) continue;
            _g92++;
          }
        }
        const v_v = ((_k86[2] ?? holds(sp, cl, 2)) - _g92);
        let _g97 = 0;
        G98: {
          const _a99 = sp.cells;
          for (let _i100 = 0; _i100 < _a99.length; _i100++) {
            const v_x = _a99[_i100];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h101))) continue;
            _g97++;
          }
        }
        const v_z = ((_k86[3] ?? holds(sp, cl, 3)) - _g97);
        let _g110 = -1;
        facts.length = 0;
        changed = false;
        let _q102 = true;
        Q103: {
          const _a104 = v_L;
          for (let _i105 = 0; _i105 < _a104.length; _i105++) {
            const v_c = _a104[_i105];
            for (let _m106 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m106 !== 0; _m106 &= _m106 - 1) {
              const v_d = 31 - Math.clz32(_m106 & -_m106);
              if (_g110 !== _epoch) {
                _g110 = _epoch;
                for (const _e111 of _l108) _p107[_e111] = 0;
                _y109 = false;
                const _a112 = v_L;
                for (const _e116 of _l114) _f113[_e116] = -1;
                _l114 = _a112;
                let _i118 = 0;
                _s115[0] = 0;
                let _o122 = _a112.length === 0;
                for (;;) {
                  if (_a112.length === 0) {
                    if (!_o122) break;
                    _o122 = false;
                  }
                  while (_a112.length > 0 && _i118 >= 0) {
                    const _e116 = _a112[_i118];
                    if (_s115[_i118] > 0) _f113[_e116] = -1;
                    let _r121 = (cands[_e116] >= 0 ? cands[_e116] : (cands[_e116] = b.cands[_e116])) & ~((2 << _s115[_i118]) - 1);
                    let _d117 = 0;
                    for (; _r121 !== 0; _r121 &= _r121 - 1) {
                      _d117 = 31 - Math.clz32(_r121 & -_r121);
                      _f113[_e116] = _d117;
                      break;
                    }
                    if (_r121 === 0) {
                      _s115[_i118] = 0;
                      _i118--;
                      continue;
                    }
                    _s115[_i118] = _d117;
                    if (_i118 === _a112.length - 1) break;
                    _i118++;
                    _s115[_i118] = 0;
                  }
                  if (_i118 < 0) break;
                  let _c136: boolean = _h123;
                  if (!_c136) {
                    let _g124 = 0;
                    G125: {
                      const _a126 = sights(sp, cl.mirror)[v_s].direct;
                      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                        const v_x = _a126[_i127];
                        if (!((_f113[v_x] !== 1))) continue;
                        _g124++;
                      }
                    }
                    let _g128 = 0;
                    G129: {
                      const _a130 = sights(sp, cl.mirror)[v_s].bent;
                      for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                        const v_x = _a130[_i131];
                        if (!((_f113[v_x] !== 2))) continue;
                        _g128++;
                      }
                    }
                    let _g132 = 0;
                    G133: {
                      const _a134 = sights(sp, cl.mirror)[v_s].twice;
                      for (let _i135 = 0; _i135 < _a134.length; _i135++) {
                        const v_x = _a134[_i135];
                        if (!((_f113[v_x] !== 2))) continue;
                        _g132++;
                      }
                    }
                    _c136 = (((_g124 + _g128) + _g132) === v_a);
                  }
                  let _c151: boolean = _c136;
                  if (_c151) {
                    let _c150: boolean = _h137;
                    if (!_c150) {
                      let _g138 = 0;
                      G139: {
                        const _a140 = sights(sp, cl.mirror)[v_t].direct;
                        for (let _i141 = 0; _i141 < _a140.length; _i141++) {
                          const v_x = _a140[_i141];
                          if (!((_f113[v_x] !== 1))) continue;
                          _g138++;
                        }
                      }
                      let _g142 = 0;
                      G143: {
                        const _a144 = sights(sp, cl.mirror)[v_t].bent;
                        for (let _i145 = 0; _i145 < _a144.length; _i145++) {
                          const v_x = _a144[_i145];
                          if (!((_f113[v_x] !== 2))) continue;
                          _g142++;
                        }
                      }
                      let _g146 = 0;
                      G147: {
                        const _a148 = sights(sp, cl.mirror)[v_t].twice;
                        for (let _i149 = 0; _i149 < _a148.length; _i149++) {
                          const v_x = _a148[_i149];
                          if (!((_f113[v_x] !== 2))) continue;
                          _g146++;
                        }
                      }
                      _c150 = (((_g138 + _g142) + _g146) === v_b);
                    }
                    _c151 = _c150;
                  }
                  let _c156: boolean = _c151;
                  if (_c156) {
                    let _g152 = 0;
                    G153: {
                      const _a154 = v_L;
                      for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                        const v_x = _a154[_i155];
                        if (!(((_f113[v_x] === 1) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g152++;
                      }
                    }
                    _c156 = (_g152 <= v_g);
                  }
                  let _c161: boolean = _c156;
                  if (_c161) {
                    let _g157 = 0;
                    G158: {
                      const _a159 = v_L;
                      for (let _i160 = 0; _i160 < _a159.length; _i160++) {
                        const v_x = _a159[_i160];
                        if (!(((_f113[v_x] === 2) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g157++;
                      }
                    }
                    _c161 = (_g157 <= v_v);
                  }
                  let _c166: boolean = _c161;
                  if (_c166) {
                    let _g162 = 0;
                    G163: {
                      const _a164 = v_L;
                      for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                        const v_x = _a164[_i165];
                        if (!(((_f113[v_x] === 3) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g162++;
                      }
                    }
                    _c166 = (_g162 <= v_z);
                  }
                  if (!(_c166)) continue;
                  _l108 = _a112;
                  _y109 = true;
                  for (const _e111 of _a112) _p107[_e111] |= 1 << _f113[_e111];
                }
              }
              if (!(!(((((_p107[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y109 && !v_L.includes(v_c)))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q102 = false;
                break Q103;
              }
            }
          }
        }
        if (!(_q102)) return -1;
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
let holdsOn: object | null = null;
let holdsAt: Kept<number> = [];

/** `holds(d)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function holds(sp: GridSpace, cl: Dealt, v_d: number): number {
  if (cl !== holdsOn) {
    holdsAt = holdsKept.board(cl);
    holdsOn = cl;
  }
  const _kept: Kept<number> = holdsAt;
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
let ofRoundOn: object | null = null;
let ofRoundAt: Kept<number> = [];

/** `ofRound(r)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function ofRound(sp: GridSpace, v_r: number): number {
  if (sp !== ofRoundOn) {
    ofRoundAt = ofRoundKept.board(sp);
    ofRoundOn = sp;
  }
  const _kept: Kept<number> = ofRoundAt;
  if (_kept[v_r] !== undefined) return _kept[v_r];
  let _g56 = -1;
  let _n58 = 0;
  G57: {
    const _t59 = (sp.slots.length - 1);
    for (let v_i = 0; v_i <= _t59; v_i++) {
      if (!((((((v_r < sp.w) && (v_i === v_r)) || (((v_r >= sp.w) && (v_r < (sp.w + sp.h))) && (v_i === ((sp.w + sp.h) + v_r)))) || (((v_r >= (sp.w + sp.h)) && (v_r < ((2 * sp.w) + sp.h))) && (v_i === ((((3 * sp.w) + sp.h) - 1) - v_r)))) || ((v_r >= ((2 * sp.w) + sp.h)) && (v_i === ((((4 * sp.w) + (2 * sp.h)) - 1) - v_r)))))) continue;
      if (++_n58 === 2) {
        _g56 = -1;
        break G57;
      }
      _g56 = v_i;
    }
  }
  const _made = _g56;
  _kept[v_r] = _made;
  return _made;
}

const roundKept = keptStore<number>();
let roundOn: object | null = null;
let roundAt: Kept<number> = [];

/** `round(s)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function round(sp: GridSpace, v_s: number): number {
  if (sp !== roundOn) {
    roundAt = roundKept.board(sp);
    roundOn = sp;
  }
  const _kept: Kept<number> = roundAt;
  if (_kept[v_s] !== undefined) return _kept[v_s];
  let _g61 = -1;
  let _n63 = 0;
  G62: {
    const _t64 = (sp.slots.length - 1);
    for (let v_r = 0; v_r <= _t64; v_r++) {
      if (!((ofRound(sp, v_r) === v_s))) continue;
      if (++_n63 === 2) {
        _g61 = -1;
        break G62;
      }
      _g61 = v_r;
    }
  }
  const _made = _g61;
  _kept[v_s] = _made;
  return _made;
}
