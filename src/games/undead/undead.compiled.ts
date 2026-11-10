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
  const _k8 = holdsKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      let _g3 = 0;
      G4: {
        const _a5 = sp.cells;
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_c = _a5[_i6];
          const _h7 = (g[v_c] || -1);
          if (!((_h7 === v_d))) continue;
          _g3++;
        }
      }
      if (!((_g3 === (_k8[v_d] ?? holds(sp, cl, v_d))))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k9 = 0; _k9 < cl.mirror.at.length; _k9++) {
    const _at10 = cl.mirror.at[_k9];
    if (!(((g[_at10] || -1) === 4))) return false;
  }
  for (let _k12 = 0; _k12 < cl.sees.at.length; _k12++) {
    const _at13 = cl.sees.at[_k12];
    const _v14 = cl.sees.v[_k12];
    let _g15 = 0;
    G16: {
      const _a17 = sights(sp, cl.mirror)[_at13].direct;
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_x = _a17[_i18];
        const _h19 = (g[v_x] || -1);
        if (!((_h19 !== 1))) continue;
        _g15++;
      }
    }
    let _g20 = 0;
    G21: {
      const _a22 = sights(sp, cl.mirror)[_at13].bent;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_x = _a22[_i23];
        const _h24 = (g[v_x] || -1);
        if (!((_h24 !== 2))) continue;
        _g20++;
      }
    }
    let _g25 = 0;
    G26: {
      const _a27 = sights(sp, cl.mirror)[_at13].twice;
      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
        const v_x = _a27[_i28];
        const _h29 = (g[v_x] || -1);
        if (!((_h29 !== 2))) continue;
        _g25++;
      }
    }
    if (!((((_g15 + _g20) + _g25) === _v14))) return false;
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
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))) continue;
    if (import.meta.env.DEV && staleChecking) {
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
  const _g14: number[] = [];
  const _g21: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  const _k13 = holdsKept.board(cl);
  if (totalCands.length < sp.cells.length) totalCands = new Int32Array(sp.cells.length);
  const cands = totalCands;
  cands.fill(-1);
  for (let v_d = 1; v_d <= 3; v_d++) {
    const _h20 = ((1 << v_d));
    const v_n = (_k13[v_d] ?? holds(sp, cl, v_d));
    _g14.length = 0;
    G15: {
      const _a18 = sp.cells;
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_c = _a18[_i19];
        if (!(((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) === _h20))) continue;
        _g14.push(v_c);
      }
    }
    const v_P = _g14;
    const _h39 = v_P.length;
    _g21.length = 0;
    G22: {
      const _a25 = sp.cells;
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_c = _a25[_i26];
        if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
        _g21.push(v_c);
      }
    }
    const v_O = _g21;
    const _h40 = v_O.length;
    if (import.meta.env.DEV && staleChecking) {
      const _g27: number[] = [];
      G28: {
        const _a31 = sp.cells;
        for (let _i32 = 0; _i32 < _a31.length; _i32++) {
          const v_c = _a31[_i32];
          if (!(((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) === ((1 << v_d))))) continue;
          _g27.push(v_c);
        }
      }
      const _g33: number[] = [];
      G34: {
        const _a37 = sp.cells;
        for (let _i38 = 0; _i38 < _a37.length; _i38++) {
          const v_c = _a37[_i38];
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g33.push(v_c);
        }
      }
      freshBinding("total", [((1 <= v_d) && (v_d <= 3)), (v_n === holds(sp, cl, v_d)), sameSet(v_P, _g27), sameSet(v_O, _g33)], ["d in", "n =", "P =", "O ="]);
    }
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
let sightline_p58 = new Int32Array(0);
let sightline_l59: readonly number[] = [];
let sightline_f64 = new Int32Array(0);
let sightline_l65: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function sightline(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SightlineBinding> | null): number {
  if (sightline_p58.length < sp.cells.length) sightline_p58 = new Int32Array(sp.cells.length);
  else sightline_p58.fill(0);
  sightline_l59 = [];
  let _y60 = false;
  if (sightline_f64.length < sp.cells.length) sightline_f64 = new Int32Array(sp.cells.length).fill(-1);
  else sightline_f64.fill(-1);
  sightline_l65 = [];
  const _s66: number[] = [];
  const facts = sightlineFacts;
  let fired = 0;
  let changed = false;
  const _h16 = sp.cells.length;
  const _h17 = sp.slots.length;
  const _h18 = (_h17 - 1);
  const _k19 = ofRoundKept.board(sp);
  const _k22 = roundKept.board(sp);
  const _k25 = holdsKept.board(cl);
  const _h30 = ((1 << 1));
  const _h35 = ((1 << 2));
  const _h40 = ((1 << 3));
  let _epoch = 0;
  if (sightlineCands.length < sp.cells.length) sightlineCands = new Int32Array(sp.cells.length);
  const cands = sightlineCands;
  cands.fill(-1);
  for (let v_n = 0; v_n <= _h16; v_n++) {
    for (let v_r = 0; v_r <= _h18; v_r++) {
      L20: {
        const v_s = (sp.slots[(_k19[v_r] ?? ofRound(sp, v_r))] ?? -1);
        const _h21 = sights(sp, cl.mirror)[v_s].all.length;
        if (!(((_h21 === v_n) && (v_r < (_k22[sights(sp, cl.mirror)[v_s].exit] ?? round(sp, sights(sp, cl.mirror)[v_s].exit)))))) break L20;
        const _h23 = clueAt(cl.sees, v_s);
        const v_t = sights(sp, cl.mirror)[v_s].exit;
        const _h24 = clueAt(cl.sees, v_t);
        const v_L = sights(sp, cl.mirror)[v_s].all;
        const v_a = _h23;
        const _h74 = (v_a < 0);
        const v_b = _h24;
        const _h88 = (v_b < 0);
        let _g26 = 0;
        G27: {
          const _a28 = sp.cells;
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_x = _a28[_i29];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h30))) continue;
            _g26++;
          }
        }
        const v_g = ((_k25[1] ?? holds(sp, cl, 1)) - _g26);
        let _g31 = 0;
        G32: {
          const _a33 = sp.cells;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_x = _a33[_i34];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h35))) continue;
            _g31++;
          }
        }
        const v_v = ((_k25[2] ?? holds(sp, cl, 2)) - _g31);
        let _g36 = 0;
        G37: {
          const _a38 = sp.cells;
          for (let _i39 = 0; _i39 < _a38.length; _i39++) {
            const v_x = _a38[_i39];
            if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === _h40))) continue;
            _g36++;
          }
        }
        const v_z = ((_k25[3] ?? holds(sp, cl, 3)) - _g36);
        let _g61 = -1;
        if (import.meta.env.DEV && staleChecking) {
          let _g41 = 0;
          G42: {
            const _a43 = sp.cells;
            for (let _i44 = 0; _i44 < _a43.length; _i44++) {
              const v_x = _a43[_i44];
              if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === ((1 << 1))))) continue;
              _g41++;
            }
          }
          let _g45 = 0;
          G46: {
            const _a47 = sp.cells;
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_x = _a47[_i48];
              if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === ((1 << 2))))) continue;
              _g45++;
            }
          }
          let _g49 = 0;
          G50: {
            const _a51 = sp.cells;
            for (let _i52 = 0; _i52 < _a51.length; _i52++) {
              const v_x = _a51[_i52];
              if (!(((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])) === ((1 << 3))))) continue;
              _g49++;
            }
          }
          freshBinding("sightline", [((0 <= v_n) && (v_n <= sp.cells.length)), ((0 <= v_r) && (v_r <= (sp.slots.length - 1))), (v_s === (sp.slots[ofRound(sp, v_r)] ?? -1)), ((sights(sp, cl.mirror)[v_s].all.length === v_n) && (v_r < round(sp, sights(sp, cl.mirror)[v_s].exit))), (v_t === sights(sp, cl.mirror)[v_s].exit), sameSet(v_L, sights(sp, cl.mirror)[v_s].all), (v_a === clueAt(cl.sees, v_s)), (v_b === clueAt(cl.sees, v_t)), (v_g === (holds(sp, cl, 1) - _g41)), (v_v === (holds(sp, cl, 2) - _g45)), (v_z === (holds(sp, cl, 3) - _g49))], ["n in", "r in", "s =", "where of s", "t =", "L =", "a =", "b =", "g =", "v =", "z ="]);
        }
        facts.length = 0;
        changed = false;
        let _q53 = true;
        Q54: {
          const _a55 = v_L;
          for (let _i56 = 0; _i56 < _a55.length; _i56++) {
            const v_c = _a55[_i56];
            for (let _m57 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m57 !== 0; _m57 &= _m57 - 1) {
              const v_d = 31 - Math.clz32(_m57 & -_m57);
              if (_g61 !== _epoch) {
                _g61 = _epoch;
                for (const _e62 of sightline_l59) sightline_p58[_e62] = 0;
                _y60 = false;
                const _a63 = v_L;
                for (const _e67 of sightline_l65) sightline_f64[_e67] = -1;
                sightline_l65 = _a63;
                let _i69 = 0;
                _s66[0] = 0;
                let _o73 = _a63.length === 0;
                for (;;) {
                  if (_a63.length === 0) {
                    if (!_o73) break;
                    _o73 = false;
                  }
                  while (_a63.length > 0 && _i69 >= 0) {
                    const _e67 = _a63[_i69];
                    if (_s66[_i69] > 0) sightline_f64[_e67] = -1;
                    let _r72 = (cands[_e67] >= 0 ? cands[_e67] : (cands[_e67] = b.cands[_e67])) & ~((2 << _s66[_i69]) - 1);
                    let _d68 = 0;
                    for (; _r72 !== 0; _r72 &= _r72 - 1) {
                      _d68 = 31 - Math.clz32(_r72 & -_r72);
                      sightline_f64[_e67] = _d68;
                      break;
                    }
                    if (_r72 === 0) {
                      _s66[_i69] = 0;
                      _i69--;
                      continue;
                    }
                    _s66[_i69] = _d68;
                    if (_i69 === _a63.length - 1) break;
                    _i69++;
                    _s66[_i69] = 0;
                  }
                  if (_i69 < 0) break;
                  let _c87: boolean = _h74;
                  if (!_c87) {
                    let _g75 = 0;
                    G76: {
                      const _a77 = sights(sp, cl.mirror)[v_s].direct;
                      for (let _i78 = 0; _i78 < _a77.length; _i78++) {
                        const v_x = _a77[_i78];
                        if (!((sightline_f64[v_x] !== 1))) continue;
                        _g75++;
                      }
                    }
                    let _g79 = 0;
                    G80: {
                      const _a81 = sights(sp, cl.mirror)[v_s].bent;
                      for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                        const v_x = _a81[_i82];
                        if (!((sightline_f64[v_x] !== 2))) continue;
                        _g79++;
                      }
                    }
                    let _g83 = 0;
                    G84: {
                      const _a85 = sights(sp, cl.mirror)[v_s].twice;
                      for (let _i86 = 0; _i86 < _a85.length; _i86++) {
                        const v_x = _a85[_i86];
                        if (!((sightline_f64[v_x] !== 2))) continue;
                        _g83++;
                      }
                    }
                    _c87 = (((_g75 + _g79) + _g83) === v_a);
                  }
                  let _c102: boolean = _c87;
                  if (_c102) {
                    let _c101: boolean = _h88;
                    if (!_c101) {
                      let _g89 = 0;
                      G90: {
                        const _a91 = sights(sp, cl.mirror)[v_t].direct;
                        for (let _i92 = 0; _i92 < _a91.length; _i92++) {
                          const v_x = _a91[_i92];
                          if (!((sightline_f64[v_x] !== 1))) continue;
                          _g89++;
                        }
                      }
                      let _g93 = 0;
                      G94: {
                        const _a95 = sights(sp, cl.mirror)[v_t].bent;
                        for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                          const v_x = _a95[_i96];
                          if (!((sightline_f64[v_x] !== 2))) continue;
                          _g93++;
                        }
                      }
                      let _g97 = 0;
                      G98: {
                        const _a99 = sights(sp, cl.mirror)[v_t].twice;
                        for (let _i100 = 0; _i100 < _a99.length; _i100++) {
                          const v_x = _a99[_i100];
                          if (!((sightline_f64[v_x] !== 2))) continue;
                          _g97++;
                        }
                      }
                      _c101 = (((_g89 + _g93) + _g97) === v_b);
                    }
                    _c102 = _c101;
                  }
                  let _c107: boolean = _c102;
                  if (_c107) {
                    let _g103 = 0;
                    G104: {
                      const _a105 = v_L;
                      for (let _i106 = 0; _i106 < _a105.length; _i106++) {
                        const v_x = _a105[_i106];
                        if (!(((sightline_f64[v_x] === 1) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g103++;
                      }
                    }
                    _c107 = (_g103 <= v_g);
                  }
                  let _c112: boolean = _c107;
                  if (_c112) {
                    let _g108 = 0;
                    G109: {
                      const _a110 = v_L;
                      for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                        const v_x = _a110[_i111];
                        if (!(((sightline_f64[v_x] === 2) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g108++;
                      }
                    }
                    _c112 = (_g108 <= v_v);
                  }
                  let _c117: boolean = _c112;
                  if (_c117) {
                    let _g113 = 0;
                    G114: {
                      const _a115 = v_L;
                      for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                        const v_x = _a115[_i116];
                        if (!(((sightline_f64[v_x] === 3) && (popcount((cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x]))) > 1)))) continue;
                        _g113++;
                      }
                    }
                    _c117 = (_g113 <= v_z);
                  }
                  if (!(_c117)) continue;
                  sightline_l59 = _a63;
                  _y60 = true;
                  for (const _e62 of _a63) sightline_p58[_e62] |= 1 << sightline_f64[_e62];
                }
              }
              if (!(!(((((sightline_p58[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y60 && !v_L.includes(v_c)))))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q53 = false;
                break Q54;
              }
            }
          }
        }
        if (!(_q53)) return -1;
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
  let _g1 = -1;
  let _n3 = 0;
  G2: {
    const _t4 = sp.cells.length;
    for (let v_n = 0; v_n <= _t4; v_n++) {
      if (!(((((v_d === 1) && (v_n === cl.ghosts)) || ((v_d === 2) && (v_n === cl.vampires))) || ((v_d === 3) && (v_n === cl.zombies))))) continue;
      if (++_n3 === 2) {
        _g1 = -1;
        break G2;
      }
      _g1 = v_n;
    }
  }
  const _made = _g1;
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
  let _g1 = -1;
  let _n3 = 0;
  G2: {
    const _t4 = (sp.slots.length - 1);
    for (let v_i = 0; v_i <= _t4; v_i++) {
      if (!((((((v_r < sp.w) && (v_i === v_r)) || (((v_r >= sp.w) && (v_r < (sp.w + sp.h))) && (v_i === ((sp.w + sp.h) + v_r)))) || (((v_r >= (sp.w + sp.h)) && (v_r < ((2 * sp.w) + sp.h))) && (v_i === ((((3 * sp.w) + sp.h) - 1) - v_r)))) || ((v_r >= ((2 * sp.w) + sp.h)) && (v_i === ((((4 * sp.w) + (2 * sp.h)) - 1) - v_r)))))) continue;
      if (++_n3 === 2) {
        _g1 = -1;
        break G2;
      }
      _g1 = v_i;
    }
  }
  const _made = _g1;
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
  let _g1 = -1;
  let _n3 = 0;
  G2: {
    const _t4 = (sp.slots.length - 1);
    for (let v_r = 0; v_r <= _t4; v_r++) {
      if (!((ofRound(sp, v_r) === v_s))) continue;
      if (++_n3 === 2) {
        _g1 = -1;
        break G2;
      }
      _g1 = v_r;
    }
  }
  const _made = _g1;
  _kept[v_s] = _made;
  return _made;
}
