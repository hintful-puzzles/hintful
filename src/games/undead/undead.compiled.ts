// Compiled by `npm run describe` from src/games/undead/undead.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, freshBinding, keptStore, least, minus, popcount, sameSet, sights, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

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
  const _k198 = holdsKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q191 = true;
  Q192: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      let _g193 = 0;
      G194: {
        const _a195 = sp.cells;
        for (let _i196 = 0; _i196 < _a195.length; _i196++) {
          const v_c = _a195[_i196];
          const _h197 = (g[v_c] || -1);
          if (!((_h197 === v_d))) continue;
          _g193++;
        }
      }
      if (!((_g193 === (_k198[v_d] ?? holds(sp, cl, v_d))))) {
        _q191 = false;
        break Q192;
      }
    }
  }
  if (!(_q191)) return false;
  for (let _k199 = 0; _k199 < cl.mirror.at.length; _k199++) {
    const _at200 = cl.mirror.at[_k199];
    if (!(((g[_at200] || -1) === 4))) return false;
  }
  for (let _k202 = 0; _k202 < cl.sees.at.length; _k202++) {
    const _at203 = cl.sees.at[_k202];
    const _v204 = cl.sees.v[_k202];
    let _g205 = 0;
    G206: {
      const _a207 = sights(sp, cl.mirror)[_at203].direct;
      for (let _i208 = 0; _i208 < _a207.length; _i208++) {
        const v_x = _a207[_i208];
        const _h209 = (g[v_x] || -1);
        if (!((_h209 !== 1))) continue;
        _g205++;
      }
    }
    let _g210 = 0;
    G211: {
      const _a212 = sights(sp, cl.mirror)[_at203].bent;
      for (let _i213 = 0; _i213 < _a212.length; _i213++) {
        const v_x = _a212[_i213];
        const _h214 = (g[v_x] || -1);
        if (!((_h214 !== 2))) continue;
        _g210++;
      }
    }
    let _g215 = 0;
    G216: {
      const _a217 = sights(sp, cl.mirror)[_at203].twice;
      for (let _i218 = 0; _i218 < _a217.length; _i218++) {
        const v_x = _a217[_i218];
        const _h219 = (g[v_x] || -1);
        if (!((_h219 !== 2))) continue;
        _g215++;
      }
    }
    if (!((((_g205 + _g210) + _g215) === _v204))) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("single", [(sp.cells.includes(v_c)), (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)], ["c in", "where of c"]);
    }
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
    const _h52 = v_P.length;
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
    const _h53 = v_O.length;
    if (import.meta.env.DEV && staleChecking) {
      const _g40: number[] = [];
      G41: {
        const _a44 = sp.cells;
        for (let _i45 = 0; _i45 < _a44.length; _i45++) {
          const v_c = _a44[_i45];
          if (!(((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) === ((1 << v_d))))) continue;
          _g40.push(v_c);
        }
      }
      const _g46: number[] = [];
      G47: {
        const _a50 = sp.cells;
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_c = _a50[_i51];
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g46.push(v_c);
        }
      }
      freshBinding("total", [((1 <= v_d) && (v_d <= 3)), (v_n === holds(sp, cl, v_d)), sameSet(v_P, _g40), sameSet(v_O, _g46)], ["d in", "n =", "P =", "O ="]);
    }
    facts.length = 0;
    changed = false;
    let _c59: boolean = ((_h52 <= v_n) && (_h53 >= v_n));
    if (_c59) {
      let _c58: boolean = (_h52 < v_n);
      if (!_c58) {
        let _q54 = true;
        Q55: {
          const _a56 = minus(v_O, v_P);
          for (let _i57 = 0; _i57 < _a56.length; _i57++) {
            const v_c = _a56[_i57];
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q54 = false;
              break Q55;
            }
          }
        }
        _c58 = _q54;
      }
      _c59 = _c58;
    }
    let _c65: boolean = _c59;
    if (_c65) {
      let _c64: boolean = (_h53 > v_n);
      if (!_c64) {
        let _q60 = true;
        Q61: {
          const _a62 = minus(v_O, v_P);
          for (let _i63 = 0; _i63 < _a62.length; _i63++) {
            const v_c = _a62[_i63];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
            if (!(true)) {
              _q60 = false;
              break Q61;
            }
          }
        }
        _c64 = _q60;
      }
      _c65 = _c64;
    }
    if (!(_c65)) return -1;
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
let _p131 = new Int32Array(0);
let _l132: readonly number[] = [];
let _f137 = new Int32Array(0);
let _l138: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function sightline(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SightlineBinding> | null): number {
  if (_p131.length < sp.cells.length) _p131 = new Int32Array(sp.cells.length);
  else _p131.fill(0);
  _l132 = [];
  let _y133 = false;
  if (_f137.length < sp.cells.length) _f137 = new Int32Array(sp.cells.length).fill(-1);
  else _f137.fill(-1);
  _l138 = [];
  const _s139: number[] = [];
  const facts = sightlineFacts;
  let fired = 0;
  let changed = false;
  const _h89 = sp.cells.length;
  const _h90 = sp.slots.length;
  const _h91 = (_h90 - 1);
  const _k92 = ofRoundKept.board(sp);
  const _k95 = roundKept.board(sp);
  const _k98 = holdsKept.board(cl);
  const _h103 = ((1 << 1));
  const _h108 = ((1 << 2));
  const _h113 = ((1 << 3));
  let _epoch = 0;
  if (sightlineCands.length < sp.cells.length) sightlineCands = new Int32Array(sp.cells.length);
  const cands = sightlineCands;
  cands.fill(-1);
  for (let v_n = 0; v_n <= _h89; v_n++) {
    for (let v_r = 0; v_r <= _h91; v_r++) {
      L93: {
        const v_s = (sp.slots[(_k92[v_r] ?? ofRound(sp, v_r))] ?? -1);
        const _h94 = sights(sp, cl.mirror)[v_s].all.length;
        if (!(((_h94 === v_n) && (v_r < (_k95[sights(sp, cl.mirror)[v_s].exit] ?? round(sp, sights(sp, cl.mirror)[v_s].exit)))))) break L93;
        const _h96 = clueAt(cl.sees, v_s);
        const v_t = sights(sp, cl.mirror)[v_s].exit;
        const _h97 = clueAt(cl.sees, v_t);
        const v_L = sights(sp, cl.mirror)[v_s].all;
        const v_a = _h96;
        const _h147 = (v_a < 0);
        const v_b = _h97;
        const _h161 = (v_b < 0);
        let _g99 = 0;
        G100: {
          const _a101 = sp.cells;
          for (let _i102 = 0; _i102 < _a101.length; _i102++) {
            const v_x = _a101[_i102];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h103))) continue;
            _g99++;
          }
        }
        const v_g = ((_k98[1] ?? holds(sp, cl, 1)) - _g99);
        let _g104 = 0;
        G105: {
          const _a106 = sp.cells;
          for (let _i107 = 0; _i107 < _a106.length; _i107++) {
            const v_x = _a106[_i107];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h108))) continue;
            _g104++;
          }
        }
        const v_v = ((_k98[2] ?? holds(sp, cl, 2)) - _g104);
        let _g109 = 0;
        G110: {
          const _a111 = sp.cells;
          for (let _i112 = 0; _i112 < _a111.length; _i112++) {
            const v_x = _a111[_i112];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h113))) continue;
            _g109++;
          }
        }
        const v_z = ((_k98[3] ?? holds(sp, cl, 3)) - _g109);
        let _g134 = -1;
        if (import.meta.env.DEV && staleChecking) {
          let _g114 = 0;
          G115: {
            const _a116 = sp.cells;
            for (let _i117 = 0; _i117 < _a116.length; _i117++) {
              const v_x = _a116[_i117];
              if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === ((1 << 1))))) continue;
              _g114++;
            }
          }
          let _g118 = 0;
          G119: {
            const _a120 = sp.cells;
            for (let _i121 = 0; _i121 < _a120.length; _i121++) {
              const v_x = _a120[_i121];
              if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === ((1 << 2))))) continue;
              _g118++;
            }
          }
          let _g122 = 0;
          G123: {
            const _a124 = sp.cells;
            for (let _i125 = 0; _i125 < _a124.length; _i125++) {
              const v_x = _a124[_i125];
              if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === ((1 << 3))))) continue;
              _g122++;
            }
          }
          freshBinding("sightline", [((0 <= v_n) && (v_n <= sp.cells.length)), ((0 <= v_r) && (v_r <= (sp.slots.length - 1))), (v_s === (sp.slots[ofRound(sp, v_r)] ?? -1)), ((sights(sp, cl.mirror)[v_s].all.length === v_n) && (v_r < round(sp, sights(sp, cl.mirror)[v_s].exit))), (v_t === sights(sp, cl.mirror)[v_s].exit), sameSet(v_L, sights(sp, cl.mirror)[v_s].all), (v_a === clueAt(cl.sees, v_s)), (v_b === clueAt(cl.sees, v_t)), (v_g === (holds(sp, cl, 1) - _g114)), (v_v === (holds(sp, cl, 2) - _g118)), (v_z === (holds(sp, cl, 3) - _g122))], ["n in", "r in", "s =", "where of s", "t =", "L =", "a =", "b =", "g =", "v =", "z ="]);
        }
        facts.length = 0;
        changed = false;
        let _q126 = true;
        Q127: {
          const _a128 = v_L;
          for (let _i129 = 0; _i129 < _a128.length; _i129++) {
            const v_c = _a128[_i129];
            for (let _m130 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m130 !== 0; _m130 &= _m130 - 1) {
              const v_d = 31 - Math.clz32(_m130 & -_m130);
              if (_g134 !== _epoch) {
                _g134 = _epoch;
                for (const _e135 of _l132) _p131[_e135] = 0;
                _y133 = false;
                const _a136 = v_L;
                for (const _e140 of _l138) _f137[_e140] = -1;
                _l138 = _a136;
                let _i142 = 0;
                _s139[0] = 0;
                let _o146 = _a136.length === 0;
                for (;;) {
                  if (_a136.length === 0) {
                    if (!_o146) break;
                    _o146 = false;
                  }
                  while (_a136.length > 0 && _i142 >= 0) {
                    const _e140 = _a136[_i142];
                    if (_s139[_i142] > 0) _f137[_e140] = -1;
                    let _r145 = (cands[_e140] >= 0 ? cands[_e140] : (cands[_e140] = b.cands[_e140])) & ~((2 << _s139[_i142]) - 1);
                    let _d141 = 0;
                    for (; _r145 !== 0; _r145 &= _r145 - 1) {
                      _d141 = 31 - Math.clz32(_r145 & -_r145);
                      _f137[_e140] = _d141;
                      break;
                    }
                    if (_r145 === 0) {
                      _s139[_i142] = 0;
                      _i142--;
                      continue;
                    }
                    _s139[_i142] = _d141;
                    if (_i142 === _a136.length - 1) break;
                    _i142++;
                    _s139[_i142] = 0;
                  }
                  if (_i142 < 0) break;
                  let _c160: boolean = _h147;
                  if (!_c160) {
                    let _g148 = 0;
                    G149: {
                      const _a150 = sights(sp, cl.mirror)[v_s].direct;
                      for (let _i151 = 0; _i151 < _a150.length; _i151++) {
                        const v_x = _a150[_i151];
                        if (!((_f137[v_x] !== 1))) continue;
                        _g148++;
                      }
                    }
                    let _g152 = 0;
                    G153: {
                      const _a154 = sights(sp, cl.mirror)[v_s].bent;
                      for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                        const v_x = _a154[_i155];
                        if (!((_f137[v_x] !== 2))) continue;
                        _g152++;
                      }
                    }
                    let _g156 = 0;
                    G157: {
                      const _a158 = sights(sp, cl.mirror)[v_s].twice;
                      for (let _i159 = 0; _i159 < _a158.length; _i159++) {
                        const v_x = _a158[_i159];
                        if (!((_f137[v_x] !== 2))) continue;
                        _g156++;
                      }
                    }
                    _c160 = (((_g148 + _g152) + _g156) === v_a);
                  }
                  let _c175: boolean = _c160;
                  if (_c175) {
                    let _c174: boolean = _h161;
                    if (!_c174) {
                      let _g162 = 0;
                      G163: {
                        const _a164 = sights(sp, cl.mirror)[v_t].direct;
                        for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                          const v_x = _a164[_i165];
                          if (!((_f137[v_x] !== 1))) continue;
                          _g162++;
                        }
                      }
                      let _g166 = 0;
                      G167: {
                        const _a168 = sights(sp, cl.mirror)[v_t].bent;
                        for (let _i169 = 0; _i169 < _a168.length; _i169++) {
                          const v_x = _a168[_i169];
                          if (!((_f137[v_x] !== 2))) continue;
                          _g166++;
                        }
                      }
                      let _g170 = 0;
                      G171: {
                        const _a172 = sights(sp, cl.mirror)[v_t].twice;
                        for (let _i173 = 0; _i173 < _a172.length; _i173++) {
                          const v_x = _a172[_i173];
                          if (!((_f137[v_x] !== 2))) continue;
                          _g170++;
                        }
                      }
                      _c174 = (((_g162 + _g166) + _g170) === v_b);
                    }
                    _c175 = _c174;
                  }
                  let _c180: boolean = _c175;
                  if (_c180) {
                    let _g176 = 0;
                    G177: {
                      const _a178 = v_L;
                      for (let _i179 = 0; _i179 < _a178.length; _i179++) {
                        const v_x = _a178[_i179];
                        if (!(((_f137[v_x] === 1) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g176++;
                      }
                    }
                    _c180 = (_g176 <= v_g);
                  }
                  let _c185: boolean = _c180;
                  if (_c185) {
                    let _g181 = 0;
                    G182: {
                      const _a183 = v_L;
                      for (let _i184 = 0; _i184 < _a183.length; _i184++) {
                        const v_x = _a183[_i184];
                        if (!(((_f137[v_x] === 2) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g181++;
                      }
                    }
                    _c185 = (_g181 <= v_v);
                  }
                  let _c190: boolean = _c185;
                  if (_c190) {
                    let _g186 = 0;
                    G187: {
                      const _a188 = v_L;
                      for (let _i189 = 0; _i189 < _a188.length; _i189++) {
                        const v_x = _a188[_i189];
                        if (!(((_f137[v_x] === 3) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g186++;
                      }
                    }
                    _c190 = (_g186 <= v_z);
                  }
                  if (!(_c190)) continue;
                  _l132 = _a136;
                  _y133 = true;
                  for (const _e135 of _a136) _p131[_e135] |= 1 << _f137[_e135];
                }
              }
              if (!(!(((((_p131[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y133 && !v_L.includes(v_c)))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q126 = false;
                break Q127;
              }
            }
          }
        }
        if (!(_q126)) return -1;
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
  let _g68 = -1;
  let _n70 = 0;
  G69: {
    const _t71 = (sp.slots.length - 1);
    for (let v_i = 0; v_i <= _t71; v_i++) {
      if (!((((((v_r < sp.w) && (v_i === v_r)) || (((v_r >= sp.w) && (v_r < (sp.w + sp.h))) && (v_i === ((sp.w + sp.h) + v_r)))) || (((v_r >= (sp.w + sp.h)) && (v_r < ((2 * sp.w) + sp.h))) && (v_i === ((((3 * sp.w) + sp.h) - 1) - v_r)))) || ((v_r >= ((2 * sp.w) + sp.h)) && (v_i === ((((4 * sp.w) + (2 * sp.h)) - 1) - v_r)))))) continue;
      if (++_n70 === 2) {
        _g68 = -1;
        break G69;
      }
      _g68 = v_i;
    }
  }
  const _made = _g68;
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
  let _g73 = -1;
  let _n75 = 0;
  G74: {
    const _t76 = (sp.slots.length - 1);
    for (let v_r = 0; v_r <= _t76; v_r++) {
      if (!((ofRound(sp, v_r) === v_s))) continue;
      if (++_n75 === 2) {
        _g73 = -1;
        break G74;
      }
      _g73 = v_r;
    }
  }
  const _made = _g73;
  _kept[v_s] = _made;
  return _made;
}
