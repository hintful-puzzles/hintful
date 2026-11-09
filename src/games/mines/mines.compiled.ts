// Compiled by `npm run describe` from src/games/mines/mines.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, keptStore, minus, nextOfSize, rangeMask, sameSet, stamps, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
  mines: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "alone" | "pair" | "region" | "regions" | "count";

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
  { id: "alone", tier: 0 },
  { id: "pair", tier: 0 },
  { id: "region", tier: 0 },
  { id: "regions", tier: 0 },
  { id: "count", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _g847 = 0;
  G848: {
    const _a849 = sp.cells;
    for (let _i850 = 0; _i850 < _a849.length; _i850++) {
      const v_c = _a849[_i850];
      const _h851 = (g[v_c] || -1);
      if (!((_h851 === 1))) continue;
      _g847++;
    }
  }
  if (!((_g847 === cl.mines))) return false;
  for (let _k852 = 0; _k852 < cl.count.at.length; _k852++) {
    const _at853 = cl.count.at[_k852];
    const _v854 = cl.count.v[_k852];
    let _c860: boolean = ((g[_at853] || -1) === 2);
    if (_c860) {
      let _g855 = 0;
      G856: {
        const _a857 = sp.adj8[_at853];
        for (let _i858 = 0; _i858 < _a857.length; _i858++) {
          const v_d = _a857[_i858];
          const _h859 = (g[v_d] || -1);
          if (!((_h859 === 1))) continue;
          _g855++;
        }
      }
      _c860 = (_g855 === _v854);
    }
    if (!(_c860)) return false;
  }
  return true;
}

export interface AloneBinding {
  k: number;
  c: number;
  U: readonly number[];
  n: number;
}

const aloneFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function alone(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<AloneBinding> | null): number {
  const _g12: number[] = [];
  const facts = aloneFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    const _h18 = clueAt(cl.count, v_c);
    _g12.length = 0;
    G13: {
      const _a16 = sp.adj8[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_d = _a16[_i17];
        if (!(!((b.grid[v_d] !== 0)))) continue;
        _g12.push(v_d);
      }
    }
    const v_U = _g12;
    const _h24 = v_U.length;
    let _g19 = 0;
    G20: {
      const _a21 = sp.adj8[v_c];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_d = _a21[_i22];
        if (!(((b.grid[v_d] || -1) === 1))) continue;
        _g19++;
      }
    }
    L23: {
      const v_n = (_h18 - _g19);
      if (!(((_h24 > 0) && ((v_n <= 0) || (v_n >= _h24))))) break L23;
      facts.length = 0;
      changed = false;
      let _c30: boolean = ((v_n >= 0) && (v_n <= _h24));
      if (_c30) {
        let _c29: boolean = !((v_n === 0));
        if (!_c29) {
          let _q25 = true;
          Q26: {
            const _a27 = v_U;
            for (let _i28 = 0; _i28 < _a27.length; _i28++) {
              const v_d = _a27[_i28];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q25 = false;
                break Q26;
              }
            }
          }
          _c29 = _q25;
        }
        _c30 = _c29;
      }
      let _c36: boolean = _c30;
      if (_c36) {
        let _c35: boolean = (v_n === 0);
        if (!_c35) {
          let _q31 = true;
          Q32: {
            const _a33 = v_U;
            for (let _i34 = 0; _i34 < _a33.length; _i34++) {
              const v_d = _a33[_i34];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
              if (!(true)) {
                _q31 = false;
                break Q32;
              }
            }
          }
          _c35 = _q31;
        }
        _c36 = _c35;
      }
      if (!(_c36)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, c: v_c, U: v_U.slice(), n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairBinding {
  k: number;
  a: number;
  b: number;
  by: number;
  O: readonly number[];
  S: readonly number[];
}

const pairFacts: number[] = [];
let pairCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const _g103: number[] = [];
  const _g126: number[] = [];
  const _g132: number[] = [];
  const _g141: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (pairCands.length < sp.cells.length) pairCands = new Int32Array(sp.cells.length);
  const cands = pairCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L102: {
      const v_a = cl.count.at[v_k];
      const _m33_0 = b.made[0];
      _g103.length = 0;
      G104: {
        const _a107 = sp.adj8[v_a];
        for (let _i108 = 0; _i108 < _a107.length; _i108++) {
          const v_d = _a107[_i108];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g103.push(v_d);
        }
      }
      if (!((_g103.length > 0))) break L102;
      const _a109 = within(sp, v_a, 2);
      for (let _i110 = 0; _i110 < _a109.length; _i110++) {
        const v_b = _a109[_i110];
        const _h111 = clueAt(cl.count, v_b);
        if (!((((v_b !== v_a) && (_h111 !== -1)) && meetMarked(b, sp, cands, v_a, v_b)))) continue;
        let _g116 = 0;
        G117: {
          const _a118 = sp.adj8[v_b];
          for (let _i119 = 0; _i119 < _a118.length; _i119++) {
            const v_d = _a118[_i119];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g116++;
          }
        }
        const v_by = (need(b, sp, cl, v_a) - (_h111 - _g116));
        _g126.length = 0;
        G127: {
          const _a130 = sp.adj8[v_b];
          for (let _i131 = 0; _i131 < _a130.length; _i131++) {
            const v_d = _a130[_i131];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g126.push(v_d);
          }
        }
        const v_O = minus(open(b, sp, v_a), _g126);
        const _h139 = v_O.length;
        _g132.length = 0;
        G133: {
          const _a136 = sp.adj8[v_b];
          for (let _i137 = 0; _i137 < _a136.length; _i137++) {
            const v_d = _a136[_i137];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g132.push(v_d);
          }
        }
        L138: {
          const v_S = minus(_g132, open(b, sp, v_a));
          const _h140 = v_S.length;
          if (!(((v_by >= _h139) && ((_h139 + _h140) > 0)))) break L138;
          if (b.made[0] !== _m33_0) {
            _g141.length = 0;
            G142: {
              const _a145 = sp.adj8[v_a];
              for (let _i146 = 0; _i146 < _a145.length; _i146++) {
                const v_d = _a145[_i146];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g141.push(v_d);
              }
            }
            if (!((_g141.length > 0))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _c151: boolean = (v_by === _h139);
          if (_c151) {
            let _q147 = true;
            Q148: {
              const _a149 = v_O;
              for (let _i150 = 0; _i150 < _a149.length; _i150++) {
                const v_d = _a149[_i150];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q147 = false;
                  break Q148;
                }
              }
            }
            _c151 = _q147;
          }
          let _c156: boolean = _c151;
          if (_c156) {
            let _q152 = true;
            Q153: {
              const _a154 = v_S;
              for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                const v_d = _a154[_i155];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q152 = false;
                  break Q153;
                }
              }
            }
            _c156 = _q152;
          }
          if (!(_c156)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, by: v_by, O: v_O.slice(), S: v_S.slice() }, facts)) return 1;
            cands.fill(-1);
            meetMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface RegionBinding {
  k: number;
  o: number;
  i: number;
  b: number;
  R: readonly number[];
  B: readonly number[];
  r: number;
  nb: number;
  heavy: boolean;
}

const regionFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function region(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionBinding> | null): number {
  const _g238: number[] = [];
  const _g247: number[] = [];
  const _g254: number[] = [];
  const _g261: number[] = [];
  const _g271: number[] = [];
  const _g289: number[] = [];
  const _g295: number[] = [];
  const _g302: number[] = [];
  const _g308: number[] = [];
  const _g315: number[] = [];
  const _g321: number[] = [];
  const facts = regionFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L237: {
      const v_o = cl.count.at[v_k];
      const _m70_0 = b.made[0];
      _g238.length = 0;
      G239: {
        const _a242 = sp.adj8[v_o];
        for (let _i243 = 0; _i243 < _a242.length; _i243++) {
          const v_d = _a242[_i243];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g238.push(v_d);
        }
      }
      if (!((_g238.length > 0))) break L237;
      const _a244 = within(sp, v_o, 2);
      R2:
      for (let _i245 = 0; _i245 < _a244.length; _i245++) {
        const v_i = _a244[_i245];
        const _m76_1 = b.made[1];
        const _h246 = clueAt(cl.count, v_i);
        let _c253: boolean = ((v_i !== v_o) && (_h246 !== -1));
        if (_c253) {
          _g247.length = 0;
          G248: {
            const _a251 = sp.adj8[v_i];
            for (let _i252 = 0; _i252 < _a251.length; _i252++) {
              const v_d = _a251[_i252];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g247.push(v_d);
            }
          }
          _c253 = (_g247.length > 0);
        }
        let _c260: boolean = _c253;
        if (_c260) {
          _g254.length = 0;
          G255: {
            const _a258 = sp.adj8[v_i];
            for (let _i259 = 0; _i259 < _a258.length; _i259++) {
              const v_d = _a258[_i259];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g254.push(v_d);
            }
          }
          _c260 = subsetOf(_g254, open(b, sp, v_o));
        }
        let _c267: boolean = _c260;
        if (_c267) {
          _g261.length = 0;
          G262: {
            const _a265 = sp.adj8[v_i];
            for (let _i266 = 0; _i266 < _a265.length; _i266++) {
              const v_d = _a265[_i266];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g261.push(v_d);
            }
          }
          _c267 = (_g261.length < open(b, sp, v_o).length);
        }
        if (!(_c267)) continue;
        const _a268 = within(sp, v_o, 3);
        for (let _i269 = 0; _i269 < _a268.length; _i269++) {
          const v_b = _a268[_i269];
          const _h270 = clueAt(cl.count, v_b);
          if (!((((v_b !== v_o) && (v_b !== v_i)) && (_h270 !== -1)))) continue;
          const v_R = minus(open(b, sp, v_o), open(b, sp, v_i));
          _g271.length = 0;
          G272: {
            const _a275 = sp.adj8[v_b];
            for (let _i276 = 0; _i276 < _a275.length; _i276++) {
              const v_d = _a275[_i276];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g271.push(v_d);
            }
          }
          L277: {
            const v_B = _g271;
            let _q278 = false;
            Q279: {
              const _a280 = v_R;
              for (let _i281 = 0; _i281 < _a280.length; _i281++) {
                const v_d = _a280[_i281];
                if ((v_B.includes(v_d))) {
                  _q278 = true;
                  break Q279;
                }
              }
            }
            if (!(_q278)) break L277;
            const _h286 = minus(v_R, v_B).length;
            const _h288 = minus(v_B, v_R).length;
            const v_r = (need(b, sp, cl, v_o) - need(b, sp, cl, v_i));
            let _g282 = 0;
            G283: {
              const _a284 = sp.adj8[v_b];
              for (let _i285 = 0; _i285 < _a284.length; _i285++) {
                const v_d = _a284[_i285];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g282++;
              }
            }
            const v_nb = (_h270 - _g282);
            L287: {
              const v_heavy = ((v_r - v_nb) >= _h286);
              if (!(((v_heavy || ((v_nb - v_r) >= _h288)) && ((_h286 + _h288) > 0)))) break L287;
              if (b.made[0] !== _m70_0 || b.made[1] !== _m76_1) {
                _g289.length = 0;
                G290: {
                  const _a293 = sp.adj8[v_o];
                  for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                    const v_d = _a293[_i294];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g289.push(v_d);
                  }
                }
                if (!((_g289.length > 0))) { continue R1; }
                let _c301: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                if (_c301) {
                  _g295.length = 0;
                  G296: {
                    const _a299 = sp.adj8[v_i];
                    for (let _i300 = 0; _i300 < _a299.length; _i300++) {
                      const v_d = _a299[_i300];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g295.push(v_d);
                    }
                  }
                  _c301 = (_g295.length > 0);
                }
                let _c314: boolean = _c301;
                if (_c314) {
                  _g302.length = 0;
                  G303: {
                    const _a306 = sp.adj8[v_i];
                    for (let _i307 = 0; _i307 < _a306.length; _i307++) {
                      const v_d = _a306[_i307];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g302.push(v_d);
                    }
                  }
                  _g308.length = 0;
                  G309: {
                    const _a312 = sp.adj8[v_o];
                    for (let _i313 = 0; _i313 < _a312.length; _i313++) {
                      const v_d = _a312[_i313];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g308.push(v_d);
                    }
                  }
                  _c314 = subsetOf(_g302, _g308);
                }
                let _c327: boolean = _c314;
                if (_c327) {
                  _g315.length = 0;
                  G316: {
                    const _a319 = sp.adj8[v_i];
                    for (let _i320 = 0; _i320 < _a319.length; _i320++) {
                      const v_d = _a319[_i320];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g315.push(v_d);
                    }
                  }
                  _g321.length = 0;
                  G322: {
                    const _a325 = sp.adj8[v_o];
                    for (let _i326 = 0; _i326 < _a325.length; _i326++) {
                      const v_d = _a325[_i326];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g321.push(v_d);
                    }
                  }
                  _c327 = (_g315.length < _g321.length);
                }
                if (!(_c327)) { continue R2; }
              }
              facts.length = 0;
              changed = false;
              let _c338: boolean = !(v_heavy);
              if (!_c338) {
                let _c332: boolean = ((v_r - v_nb) === _h286);
                if (_c332) {
                  let _q328 = true;
                  Q329: {
                    const _a330 = minus(v_R, v_B);
                    for (let _i331 = 0; _i331 < _a330.length; _i331++) {
                      const v_d = _a330[_i331];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q328 = false;
                        break Q329;
                      }
                    }
                  }
                  _c332 = _q328;
                }
                let _c337: boolean = _c332;
                if (_c337) {
                  let _q333 = true;
                  Q334: {
                    const _a335 = minus(v_B, v_R);
                    for (let _i336 = 0; _i336 < _a335.length; _i336++) {
                      const v_d = _a335[_i336];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q333 = false;
                        break Q334;
                      }
                    }
                  }
                  _c337 = _q333;
                }
                _c338 = _c337;
              }
              let _c350: boolean = _c338;
              if (_c350) {
                let _c349: boolean = v_heavy;
                if (!_c349) {
                  let _c343: boolean = ((v_nb - v_r) === _h288);
                  if (_c343) {
                    let _q339 = true;
                    Q340: {
                      const _a341 = minus(v_B, v_R);
                      for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                        const v_d = _a341[_i342];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                        if (!(true)) {
                          _q339 = false;
                          break Q340;
                        }
                      }
                    }
                    _c343 = _q339;
                  }
                  let _c348: boolean = _c343;
                  if (_c348) {
                    let _q344 = true;
                    Q345: {
                      const _a346 = minus(v_R, v_B);
                      for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                        const v_d = _a346[_i347];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                        if (!(true)) {
                          _q344 = false;
                          break Q345;
                        }
                      }
                    }
                    _c348 = _q344;
                  }
                  _c349 = _c348;
                }
                _c350 = _c349;
              }
              if (!(_c350)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ k: v_k, o: v_o, i: v_i, b: v_b, R: v_R.slice(), B: v_B.slice(), r: v_r, nb: v_nb, heavy: v_heavy }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface RegionsBinding {
  k: number;
  o: number;
  i: number;
  R: readonly number[];
  r: number;
  p: number;
  q: number;
  S: readonly number[];
  by: number;
}

const regionsFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function regions(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionsBinding> | null): number {
  const _g484: number[] = [];
  const _g493: number[] = [];
  const _g500: number[] = [];
  const _g507: number[] = [];
  const _g514: number[] = [];
  const _g527: number[] = [];
  const _g537: number[] = [];
  const _g544: number[] = [];
  const _g551: number[] = [];
  const _g558: number[] = [];
  const _g576: number[] = [];
  const _g582: number[] = [];
  const _g589: number[] = [];
  const _g595: number[] = [];
  const _g602: number[] = [];
  const _g608: number[] = [];
  const _g615: number[] = [];
  const _g621: number[] = [];
  const _g635: number[] = [];
  const facts = regionsFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L483: {
      const v_o = cl.count.at[v_k];
      const _m125_0 = b.made[0];
      _g484.length = 0;
      G485: {
        const _a488 = sp.adj8[v_o];
        for (let _i489 = 0; _i489 < _a488.length; _i489++) {
          const v_d = _a488[_i489];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g484.push(v_d);
        }
      }
      if (!((_g484.length > 0))) break L483;
      const _a490 = within(sp, v_o, 2);
      R2:
      for (let _i491 = 0; _i491 < _a490.length; _i491++) {
        const v_i = _a490[_i491];
        const _m131_1 = b.made[1];
        const _h492 = clueAt(cl.count, v_i);
        let _c499: boolean = ((v_i !== v_o) && (_h492 !== -1));
        if (_c499) {
          _g493.length = 0;
          G494: {
            const _a497 = sp.adj8[v_i];
            for (let _i498 = 0; _i498 < _a497.length; _i498++) {
              const v_d = _a497[_i498];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g493.push(v_d);
            }
          }
          _c499 = (_g493.length > 0);
        }
        let _c506: boolean = _c499;
        if (_c506) {
          _g500.length = 0;
          G501: {
            const _a504 = sp.adj8[v_i];
            for (let _i505 = 0; _i505 < _a504.length; _i505++) {
              const v_d = _a504[_i505];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g500.push(v_d);
            }
          }
          _c506 = subsetOf(_g500, open(b, sp, v_o));
        }
        let _c513: boolean = _c506;
        if (_c513) {
          _g507.length = 0;
          G508: {
            const _a511 = sp.adj8[v_i];
            for (let _i512 = 0; _i512 < _a511.length; _i512++) {
              const v_d = _a511[_i512];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g507.push(v_d);
            }
          }
          _c513 = (_g507.length < open(b, sp, v_o).length);
        }
        if (!(_c513)) continue;
        _g514.length = 0;
        G515: {
          const _a518 = sp.adj8[v_i];
          for (let _i519 = 0; _i519 < _a518.length; _i519++) {
            const v_d = _a518[_i519];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g514.push(v_d);
          }
        }
        const v_R = minus(open(b, sp, v_o), _g514);
        let _g520 = 0;
        G521: {
          const _a522 = sp.adj8[v_i];
          for (let _i523 = 0; _i523 < _a522.length; _i523++) {
            const v_d = _a522[_i523];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g520++;
          }
        }
        const v_r = (need(b, sp, cl, v_o) - (_h492 - _g520));
        const _a524 = within(sp, v_o, 2);
        R3:
        for (let _i525 = 0; _i525 < _a524.length; _i525++) {
          const v_p = _a524[_i525];
          const _h526 = clueAt(cl.count, v_p);
          let _c533: boolean = ((v_p !== v_o) && (_h526 !== -1));
          if (_c533) {
            _g527.length = 0;
            G528: {
              const _a531 = sp.adj8[v_p];
              for (let _i532 = 0; _i532 < _a531.length; _i532++) {
                const v_d = _a531[_i532];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g527.push(v_d);
              }
            }
            _c533 = (_g527.length > 0);
          }
          if (!(_c533)) continue;
          const _a534 = within(sp, v_p, 2);
          for (let _i535 = 0; _i535 < _a534.length; _i535++) {
            const v_q = _a534[_i535];
            const _h536 = clueAt(cl.count, v_q);
            let _c543: boolean = ((v_q !== v_p) && (_h536 !== -1));
            if (_c543) {
              _g537.length = 0;
              G538: {
                const _a541 = sp.adj8[v_q];
                for (let _i542 = 0; _i542 < _a541.length; _i542++) {
                  const v_d = _a541[_i542];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g537.push(v_d);
                }
              }
              _c543 = (_g537.length > 0);
            }
            let _c550: boolean = _c543;
            if (_c550) {
              _g544.length = 0;
              G545: {
                const _a548 = sp.adj8[v_q];
                for (let _i549 = 0; _i549 < _a548.length; _i549++) {
                  const v_d = _a548[_i549];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g544.push(v_d);
                }
              }
              _c550 = subsetOf(_g544, open(b, sp, v_p));
            }
            let _c557: boolean = _c550;
            if (_c557) {
              _g551.length = 0;
              G552: {
                const _a555 = sp.adj8[v_q];
                for (let _i556 = 0; _i556 < _a555.length; _i556++) {
                  const v_d = _a555[_i556];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g551.push(v_d);
                }
              }
              _c557 = (_g551.length < open(b, sp, v_p).length);
            }
            if (!(_c557)) continue;
            _g558.length = 0;
            G559: {
              const _a562 = sp.adj8[v_q];
              for (let _i563 = 0; _i563 < _a562.length; _i563++) {
                const v_d = _a562[_i563];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g558.push(v_d);
              }
            }
            L564: {
              const v_S = minus(open(b, sp, v_p), _g558);
              let _q565 = false;
              Q566: {
                const _a567 = v_R;
                for (let _i568 = 0; _i568 < _a567.length; _i568++) {
                  const v_d = _a567[_i568];
                  if ((v_S.includes(v_d))) {
                    _q565 = true;
                    break Q566;
                  }
                }
              }
              if (!(_q565)) break L564;
              const _h574 = minus(v_R, v_S).length;
              const _h575 = minus(v_S, v_R).length;
              let _g569 = 0;
              G570: {
                const _a571 = sp.adj8[v_q];
                for (let _i572 = 0; _i572 < _a571.length; _i572++) {
                  const v_d = _a571[_i572];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g569++;
                }
              }
              L573: {
                const v_by = (v_r - (need(b, sp, cl, v_p) - (_h536 - _g569)));
                if (!(((v_by >= _h574) && ((_h574 + _h575) > 0)))) break L573;
                if (b.made[0] !== _m125_0 || b.made[1] !== _m131_1) {
                  _g576.length = 0;
                  G577: {
                    const _a580 = sp.adj8[v_o];
                    for (let _i581 = 0; _i581 < _a580.length; _i581++) {
                      const v_d = _a580[_i581];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g576.push(v_d);
                    }
                  }
                  if (!((_g576.length > 0))) { continue R1; }
                  let _c588: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                  if (_c588) {
                    _g582.length = 0;
                    G583: {
                      const _a586 = sp.adj8[v_i];
                      for (let _i587 = 0; _i587 < _a586.length; _i587++) {
                        const v_d = _a586[_i587];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g582.push(v_d);
                      }
                    }
                    _c588 = (_g582.length > 0);
                  }
                  let _c601: boolean = _c588;
                  if (_c601) {
                    _g589.length = 0;
                    G590: {
                      const _a593 = sp.adj8[v_i];
                      for (let _i594 = 0; _i594 < _a593.length; _i594++) {
                        const v_d = _a593[_i594];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g589.push(v_d);
                      }
                    }
                    _g595.length = 0;
                    G596: {
                      const _a599 = sp.adj8[v_o];
                      for (let _i600 = 0; _i600 < _a599.length; _i600++) {
                        const v_d = _a599[_i600];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g595.push(v_d);
                      }
                    }
                    _c601 = subsetOf(_g589, _g595);
                  }
                  let _c614: boolean = _c601;
                  if (_c614) {
                    _g602.length = 0;
                    G603: {
                      const _a606 = sp.adj8[v_i];
                      for (let _i607 = 0; _i607 < _a606.length; _i607++) {
                        const v_d = _a606[_i607];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g602.push(v_d);
                      }
                    }
                    _g608.length = 0;
                    G609: {
                      const _a612 = sp.adj8[v_o];
                      for (let _i613 = 0; _i613 < _a612.length; _i613++) {
                        const v_d = _a612[_i613];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g608.push(v_d);
                      }
                    }
                    _c614 = (_g602.length < _g608.length);
                  }
                  if (!(_c614)) { continue R2; }
                  _g615.length = 0;
                  G616: {
                    const _a619 = sp.adj8[v_o];
                    for (let _i620 = 0; _i620 < _a619.length; _i620++) {
                      const v_d = _a619[_i620];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g615.push(v_d);
                    }
                  }
                  _g621.length = 0;
                  G622: {
                    const _a625 = sp.adj8[v_i];
                    for (let _i626 = 0; _i626 < _a625.length; _i626++) {
                      const v_d = _a625[_i626];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g621.push(v_d);
                    }
                  }
                  if (!(sameSet(v_R, minus(_g615, _g621)))) { continue R2; }
                  let _g627 = 0;
                  G628: {
                    const _a629 = sp.adj8[v_o];
                    for (let _i630 = 0; _i630 < _a629.length; _i630++) {
                      const v_d = _a629[_i630];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g627++;
                    }
                  }
                  let _g631 = 0;
                  G632: {
                    const _a633 = sp.adj8[v_i];
                    for (let _i634 = 0; _i634 < _a633.length; _i634++) {
                      const v_d = _a633[_i634];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g631++;
                    }
                  }
                  if (!((v_r === ((clueAt(cl.count, v_o) - _g627) - (clueAt(cl.count, v_i) - _g631))))) { continue R2; }
                  let _c641: boolean = ((v_p !== v_o) && (clueAt(cl.count, v_p) !== -1));
                  if (_c641) {
                    _g635.length = 0;
                    G636: {
                      const _a639 = sp.adj8[v_p];
                      for (let _i640 = 0; _i640 < _a639.length; _i640++) {
                        const v_d = _a639[_i640];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g635.push(v_d);
                      }
                    }
                    _c641 = (_g635.length > 0);
                  }
                  if (!(_c641)) { continue R3; }
                }
                facts.length = 0;
                changed = false;
                let _c646: boolean = (v_by === _h574);
                if (_c646) {
                  let _q642 = true;
                  Q643: {
                    const _a644 = minus(v_R, v_S);
                    for (let _i645 = 0; _i645 < _a644.length; _i645++) {
                      const v_d = _a644[_i645];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q642 = false;
                        break Q643;
                      }
                    }
                  }
                  _c646 = _q642;
                }
                let _c651: boolean = _c646;
                if (_c651) {
                  let _q647 = true;
                  Q648: {
                    const _a649 = minus(v_S, v_R);
                    for (let _i650 = 0; _i650 < _a649.length; _i650++) {
                      const v_d = _a649[_i650];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q647 = false;
                        break Q648;
                      }
                    }
                  }
                  _c651 = _q647;
                }
                if (!(_c651)) return -1;
                if (changed || facts.length > 0) {
                  fired = 1;
                  if (fire !== null && !fire({ k: v_k, o: v_o, i: v_i, R: v_R.slice(), r: v_r, p: v_p, q: v_q, S: v_S.slice(), by: v_by }, facts)) return 1;
                }
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CountBinding {
  C: readonly number[];
  L: number;
  u: number;
  size: number;
  T: readonly number[];
  n: number;
  X: readonly number[];
}

const countFacts: number[] = [];
let countCands = new Int32Array(0);
const _st776 = stamps();

/** Its dearest read grows with the board as n. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g718: number[] = [];
  const _g742: number[] = [];
  const _g763: number[] = [];
  const _g780: number[] = [];
  const _g791: number[] = [];
  const _g815: number[] = [];
  const _g828: number[] = [];
  const _g837: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  if (countCands.length < sp.cells.length) countCands = new Int32Array(sp.cells.length);
  const cands = countCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  const _m187_0 = b.made[0];
  _g718.length = 0;
  G719: {
    for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
      let _q724 = false;
      Q725: {
        const _a726 = sp.adj8[cl.count.at[v_k]];
        for (let _i727 = 0; _i727 < _a726.length; _i727++) {
          const v_d = _a726[_i727];
          if (!((b.grid[v_d] !== 0))) {
            _q724 = true;
            break Q725;
          }
        }
      }
      if (!(_q724)) continue;
      _g718.push(v_k);
    }
  }
  L728: {
    const v_C = _g718;
    const _h729 = v_C.length;
    if (!((_h729 <= 10))) break L728;
    const _m194_1 = b.made[1];
    let _g730 = 0;
    G731: {
      const _a732 = cellsValued(b, sp.cells, 1);
      for (let _i733 = 0; _i733 < _a732.length; _i733++) {
        const v_c = _a732[_i733];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g730++;
      }
    }
    const v_L = (cl.mines - _g730);
    let _g734 = 0;
    G735: {
      const _a736 = sp.cells;
      for (let _i737 = 0; _i737 < _a736.length; _i737++) {
        const v_c = _a736[_i737];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g734++;
      }
    }
    const v_u = _g734;
    for (let v_size = 0; v_size <= 5; v_size++) {
      const _e738 = v_C;
      const _n741 = 1 << _e738.length;
      for (let _k739 = v_size > _e738.length ? _n741 : (1 << v_size) - 1; _k739 < _n741; _k739 = v_size === 0 ? _n741 : nextOfSize(_k739)) {
        const v_T = _g742;
        v_T.length = 0;
        for (let _j740 = 0; _j740 < _e738.length; _j740++) if ((_k739 >> (_e738.length - 1 - _j740)) & 1) v_T.push(_e738[_j740]);
        const _h743 = v_T.length;
        let _c752: boolean = (_h743 === v_size);
        if (_c752) {
          let _q744 = true;
          Q745: {
            const _a746 = v_T;
            for (let _i747 = 0; _i747 < _a746.length; _i747++) {
              const v_x = _a746[_i747];
              const _h750 = cl.count.at[v_x];
              const _a748 = v_T;
              for (let _i749 = 0; _i749 < _a748.length; _i749++) {
                const v_y = _a748[_i749];
                if (!((v_x !== v_y))) continue;
                const _t751 = cl.count.at[v_y];
                if (!(!(meetMarked(b, sp, cands, _h750, _t751)))) {
                  _q744 = false;
                  break Q745;
                }
              }
            }
          }
          _c752 = _q744;
        }
        if (!(_c752)) continue;
        let _g753 = 0;
        G754: {
          const _a755 = v_T;
          for (let _i756 = 0; _i756 < _a755.length; _i756++) {
            const v_x = _a755[_i756];
            const _t757 = cl.count.at[v_x];
            const _h758 = clueAt(cl.count, _t757);
            let _g759 = 0;
            G760: {
              const _a761 = sp.adj8[_t757];
              for (let _i762 = 0; _i762 < _a761.length; _i762++) {
                const v_d = _a761[_i762];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g759++;
              }
            }
            _g753 += (_h758 - _g759);
          }
        }
        const v_n = _g753;
        _g763.length = 0;
        _st776.pass++;
        G764: {
          const _a777 = v_T;
          for (let _i778 = 0; _i778 < _a777.length; _i778++) {
            const v_x = _a777[_i778];
            const _t779 = cl.count.at[v_x];
            _g780.length = 0;
            G781: {
              const _a784 = sp.adj8[_t779];
              for (let _i785 = 0; _i785 < _a784.length; _i785++) {
                const v_d = _a784[_i785];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g780.push(v_d);
              }
            }
            const _a786 = _g780;
            for (let _i787 = 0; _i787 < _a786.length; _i787++) {
              const v_d = _a786[_i787];
              const _t788 = v_d;
              if (_g763.length < 16) { if (!_g763.includes(_t788)) _g763.push(_t788); } else addOnce(_g763, _st776, _t788);
            }
          }
        }
        L789: {
          const v_X = _g763;
          const _h790 = v_X.length;
          if (!(((v_u > _h790) && ((v_n === v_L) || ((v_L - v_n) === (v_u - _h790)))))) break L789;
          if (b.made[0] !== _m187_0 || b.made[1] !== _m194_1) {
            _g791.length = 0;
            G792: {
              for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
                let _q797 = false;
                Q798: {
                  const _a799 = sp.adj8[cl.count.at[v_k]];
                  for (let _i800 = 0; _i800 < _a799.length; _i800++) {
                    const v_d = _a799[_i800];
                    if (!((b.grid[v_d] !== 0))) {
                      _q797 = true;
                      break Q798;
                    }
                  }
                }
                if (!(_q797)) continue;
                _g791.push(v_k);
              }
            }
            if (!(sameSet(v_C, _g791))) { return fired; }
            let _g801 = 0;
            G802: {
              const _a803 = cellsValued(b, sp.cells, 1);
              for (let _i804 = 0; _i804 < _a803.length; _i804++) {
                const v_c = _a803[_i804];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g801++;
              }
            }
            if (!((v_L === (cl.mines - _g801)))) { return fired; }
            let _g805 = 0;
            G806: {
              const _a807 = sp.cells;
              for (let _i808 = 0; _i808 < _a807.length; _i808++) {
                const v_c = _a807[_i808];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g805++;
              }
            }
            if (!((v_u === _g805))) { return fired; }
          }
          facts.length = 0;
          changed = false;
          let _g809 = 0;
          G810: {
            const _a811 = cellsValued(b, sp.cells, 1);
            for (let _i812 = 0; _i812 < _a811.length; _i812++) {
              const v_c = _a811[_i812];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g809++;
            }
          }
          let _c823: boolean = !((v_n === (cl.mines - _g809)));
          if (!_c823) {
            let _q813 = true;
            Q814: {
              _g815.length = 0;
              G816: {
                const _a819 = sp.cells;
                for (let _i820 = 0; _i820 < _a819.length; _i820++) {
                  const v_c = _a819[_i820];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g815.push(v_c);
                }
              }
              const _a821 = _g815;
              for (let _i822 = 0; _i822 < _a821.length; _i822++) {
                const v_d = _a821[_i822];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q813 = false;
                  break Q814;
                }
              }
            }
            _c823 = _q813;
          }
          let _c846: boolean = _c823;
          if (_c846) {
            let _g824 = 0;
            G825: {
              const _a826 = cellsValued(b, sp.cells, 1);
              for (let _i827 = 0; _i827 < _a826.length; _i827++) {
                const v_c = _a826[_i827];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g824++;
              }
            }
            let _c834: boolean = (v_n !== (cl.mines - _g824));
            if (_c834) {
              _g828.length = 0;
              G829: {
                const _a832 = sp.cells;
                for (let _i833 = 0; _i833 < _a832.length; _i833++) {
                  const v_c = _a832[_i833];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g828.push(v_c);
                }
              }
              _c834 = (((cl.mines - _g824) - v_n) === _g828.length);
            }
            let _c845: boolean = !(_c834);
            if (!_c845) {
              let _q835 = true;
              Q836: {
                _g837.length = 0;
                G838: {
                  const _a841 = sp.cells;
                  for (let _i842 = 0; _i842 < _a841.length; _i842++) {
                    const v_c = _a841[_i842];
                    if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                    _g837.push(v_c);
                  }
                }
                const _a843 = _g837;
                for (let _i844 = 0; _i844 < _a843.length; _i844++) {
                  const v_d = _a843[_i844];
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                  if (!(true)) {
                    _q835 = false;
                    break Q836;
                  }
                }
              }
              _c845 = _q835;
            }
            _c846 = _c845;
          }
          if (!(_c846)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ C: v_C.slice(), L: v_L, u: v_u, size: v_size, T: v_T.slice(), n: v_n, X: v_X.slice() }, facts)) return 1;
            cands.fill(-1);
            meetMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

const meetMarkedKept = new Map<number, boolean>();

/** `meet(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function meetMarked(b: Marks, sp: GridSpace, _cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = meetMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  let _c68: boolean = ((Math.abs(((v_a % sp.w) - (v_b % sp.w))) <= 2) && (Math.abs((((v_a / sp.w) | 0) - ((v_b / sp.w) | 0))) <= 2));
  if (_c68) {
    let _q52 = false;
    Q53: {
      const _g54: number[] = [];
      G55: {
        const _a58 = sp.adj8[v_a];
        for (let _i59 = 0; _i59 < _a58.length; _i59++) {
          const v_d = _a58[_i59];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g54.push(v_d);
        }
      }
      const _a60 = _g54;
      for (let _i61 = 0; _i61 < _a60.length; _i61++) {
        const v_d = _a60[_i61];
        const _g62: number[] = [];
        G63: {
          const _a66 = sp.adj8[v_b];
          for (let _i67 = 0; _i67 < _a66.length; _i67++) {
            const v_d = _a66[_i67];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g62.push(v_d);
          }
        }
        if ((_g62.includes(v_d))) {
          _q52 = true;
          break Q53;
        }
      }
    }
    _c68 = _q52;
  }
  const _made = _c68;
  meetMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const needKept = keptStore<number>();

/** `need(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g112 = 0;
  G113: {
    const _a114 = sp.adj8[v_c];
    for (let _i115 = 0; _i115 < _a114.length; _i115++) {
      const v_d = _a114[_i115];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g112++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g112);
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g120: number[] = [];
  G121: {
    const _a124 = sp.adj8[v_c];
    for (let _i125 = 0; _i125 < _a124.length; _i125++) {
      const v_d = _a124[_i125];
      if (!(!((b.grid[v_d] !== 0)))) continue;
      _g120.push(v_d);
    }
  }
  const _made = _g120;
  _kept[v_c] = _made;
  return _made;
}
