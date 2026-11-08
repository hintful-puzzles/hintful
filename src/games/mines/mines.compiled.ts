// Compiled by `npm run describe` from src/games/mines/mines.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, minus, nextOfSize, rangeMask, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

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
  let _g767 = 0;
  G768: {
    const _a769 = sp.cells;
    for (let _i770 = 0; _i770 < _a769.length; _i770++) {
      const v_c = _a769[_i770];
      const _h771 = (g[v_c] || -1);
      if (!((_h771 === 1))) continue;
      _g767++;
    }
  }
  if (!((_g767 === cl.mines))) return false;
  for (let _k772 = 0; _k772 < cl.count.at.length; _k772++) {
    const _at773 = cl.count.at[_k772];
    const _v774 = cl.count.v[_k772];
    let _c780: boolean = ((g[_at773] || -1) === 2);
    if (_c780) {
      let _g775 = 0;
      G776: {
        const _a777 = sp.adj8[_at773];
        for (let _i778 = 0; _i778 < _a777.length; _i778++) {
          const v_d = _a777[_i778];
          const _h779 = (g[v_d] || -1);
          if (!((_h779 === 1))) continue;
          _g775++;
        }
      }
      _c780 = (_g775 === _v774);
    }
    if (!(_c780)) return false;
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
        if (fire !== null && !fire({ k: v_k, c: v_c, U: v_U, n: v_n }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const _g104: number[] = [];
  const _g141: number[] = [];
  const _g147: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L103: {
      const v_a = cl.count.at[v_k];
      _g104.length = 0;
      G105: {
        const _a108 = sp.adj8[v_a];
        for (let _i109 = 0; _i109 < _a108.length; _i109++) {
          const v_d = _a108[_i109];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g104.push(v_d);
        }
      }
      if (!((_g104.length > 0))) break L103;
      const _h113 = (v_a % sp.w);
      const _h114 = ((v_a / sp.w) | 0);
      const _a110 = within(sp, v_a, 2);
      for (let _i111 = 0; _i111 < _a110.length; _i111++) {
        const v_b = _a110[_i111];
        const _h112 = clueAt(cl.count, v_b);
        let _c132: boolean = ((v_b !== v_a) && (_h112 !== -1));
        if (_c132) {
          let _c131: boolean = ((Math.abs((_h113 - (v_b % sp.w))) <= 2) && (Math.abs((_h114 - ((v_b / sp.w) | 0))) <= 2));
          if (_c131) {
            let _q121 = false;
            Q122: {
              const _a129 = open(b, sp, v_a);
              for (let _i130 = 0; _i130 < _a129.length; _i130++) {
                const v_d = _a129[_i130];
                if ((open(b, sp, v_b).includes(v_d))) {
                  _q121 = true;
                  break Q122;
                }
              }
            }
            _c131 = _q121;
          }
          _c132 = _c131;
        }
        if (!(_c132)) continue;
        let _g137 = 0;
        G138: {
          const _a139 = sp.adj8[v_b];
          for (let _i140 = 0; _i140 < _a139.length; _i140++) {
            const v_d = _a139[_i140];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g137++;
          }
        }
        const v_by = (need(b, sp, cl, v_a) - (_h112 - _g137));
        _g141.length = 0;
        G142: {
          const _a145 = sp.adj8[v_b];
          for (let _i146 = 0; _i146 < _a145.length; _i146++) {
            const v_d = _a145[_i146];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g141.push(v_d);
          }
        }
        const v_O = minus(open(b, sp, v_a), _g141);
        const _h154 = v_O.length;
        _g147.length = 0;
        G148: {
          const _a151 = sp.adj8[v_b];
          for (let _i152 = 0; _i152 < _a151.length; _i152++) {
            const v_d = _a151[_i152];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g147.push(v_d);
          }
        }
        L153: {
          const v_S = minus(_g147, open(b, sp, v_a));
          const _h155 = v_S.length;
          if (!(((v_by >= _h154) && ((_h154 + _h155) > 0)))) break L153;
          facts.length = 0;
          changed = false;
          let _c160: boolean = (v_by === _h154);
          if (_c160) {
            let _q156 = true;
            Q157: {
              const _a158 = v_O;
              for (let _i159 = 0; _i159 < _a158.length; _i159++) {
                const v_d = _a158[_i159];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q156 = false;
                  break Q157;
                }
              }
            }
            _c160 = _q156;
          }
          let _c165: boolean = _c160;
          if (_c165) {
            let _q161 = true;
            Q162: {
              const _a163 = v_S;
              for (let _i164 = 0; _i164 < _a163.length; _i164++) {
                const v_d = _a163[_i164];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q161 = false;
                  break Q162;
                }
              }
            }
            _c165 = _q161;
          }
          if (!(_c165)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, by: v_by, O: v_O, S: v_S }, facts)) return 1;
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
  const _g247: number[] = [];
  const _g256: number[] = [];
  const _g263: number[] = [];
  const _g270: number[] = [];
  const _g280: number[] = [];
  const facts = regionFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L246: {
      const v_o = cl.count.at[v_k];
      _g247.length = 0;
      G248: {
        const _a251 = sp.adj8[v_o];
        for (let _i252 = 0; _i252 < _a251.length; _i252++) {
          const v_d = _a251[_i252];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g247.push(v_d);
        }
      }
      if (!((_g247.length > 0))) break L246;
      const _a253 = within(sp, v_o, 2);
      for (let _i254 = 0; _i254 < _a253.length; _i254++) {
        const v_i = _a253[_i254];
        const _h255 = clueAt(cl.count, v_i);
        let _c262: boolean = ((v_i !== v_o) && (_h255 !== -1));
        if (_c262) {
          _g256.length = 0;
          G257: {
            const _a260 = sp.adj8[v_i];
            for (let _i261 = 0; _i261 < _a260.length; _i261++) {
              const v_d = _a260[_i261];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g256.push(v_d);
            }
          }
          _c262 = (_g256.length > 0);
        }
        let _c269: boolean = _c262;
        if (_c269) {
          _g263.length = 0;
          G264: {
            const _a267 = sp.adj8[v_i];
            for (let _i268 = 0; _i268 < _a267.length; _i268++) {
              const v_d = _a267[_i268];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g263.push(v_d);
            }
          }
          _c269 = subsetOf(_g263, open(b, sp, v_o));
        }
        let _c276: boolean = _c269;
        if (_c276) {
          _g270.length = 0;
          G271: {
            const _a274 = sp.adj8[v_i];
            for (let _i275 = 0; _i275 < _a274.length; _i275++) {
              const v_d = _a274[_i275];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g270.push(v_d);
            }
          }
          _c276 = (_g270.length < open(b, sp, v_o).length);
        }
        if (!(_c276)) continue;
        const _a277 = within(sp, v_o, 3);
        for (let _i278 = 0; _i278 < _a277.length; _i278++) {
          const v_b = _a277[_i278];
          const _h279 = clueAt(cl.count, v_b);
          if (!((((v_b !== v_o) && (v_b !== v_i)) && (_h279 !== -1)))) continue;
          const v_R = minus(open(b, sp, v_o), open(b, sp, v_i));
          _g280.length = 0;
          G281: {
            const _a284 = sp.adj8[v_b];
            for (let _i285 = 0; _i285 < _a284.length; _i285++) {
              const v_d = _a284[_i285];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g280.push(v_d);
            }
          }
          L286: {
            const v_B = _g280;
            let _q287 = false;
            Q288: {
              const _a289 = v_R;
              for (let _i290 = 0; _i290 < _a289.length; _i290++) {
                const v_d = _a289[_i290];
                if ((v_B.includes(v_d))) {
                  _q287 = true;
                  break Q288;
                }
              }
            }
            if (!(_q287)) break L286;
            const _h295 = minus(v_R, v_B).length;
            const _h297 = minus(v_B, v_R).length;
            const v_r = (need(b, sp, cl, v_o) - need(b, sp, cl, v_i));
            let _g291 = 0;
            G292: {
              const _a293 = sp.adj8[v_b];
              for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                const v_d = _a293[_i294];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g291++;
              }
            }
            const v_nb = (_h279 - _g291);
            L296: {
              const v_heavy = ((v_r - v_nb) >= _h295);
              if (!(((v_heavy || ((v_nb - v_r) >= _h297)) && ((_h295 + _h297) > 0)))) break L296;
              facts.length = 0;
              changed = false;
              let _c308: boolean = !(v_heavy);
              if (!_c308) {
                let _c302: boolean = ((v_r - v_nb) === _h295);
                if (_c302) {
                  let _q298 = true;
                  Q299: {
                    const _a300 = minus(v_R, v_B);
                    for (let _i301 = 0; _i301 < _a300.length; _i301++) {
                      const v_d = _a300[_i301];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q298 = false;
                        break Q299;
                      }
                    }
                  }
                  _c302 = _q298;
                }
                let _c307: boolean = _c302;
                if (_c307) {
                  let _q303 = true;
                  Q304: {
                    const _a305 = minus(v_B, v_R);
                    for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                      const v_d = _a305[_i306];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q303 = false;
                        break Q304;
                      }
                    }
                  }
                  _c307 = _q303;
                }
                _c308 = _c307;
              }
              let _c320: boolean = _c308;
              if (_c320) {
                let _c319: boolean = v_heavy;
                if (!_c319) {
                  let _c313: boolean = ((v_nb - v_r) === _h297);
                  if (_c313) {
                    let _q309 = true;
                    Q310: {
                      const _a311 = minus(v_B, v_R);
                      for (let _i312 = 0; _i312 < _a311.length; _i312++) {
                        const v_d = _a311[_i312];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                        if (!(true)) {
                          _q309 = false;
                          break Q310;
                        }
                      }
                    }
                    _c313 = _q309;
                  }
                  let _c318: boolean = _c313;
                  if (_c318) {
                    let _q314 = true;
                    Q315: {
                      const _a316 = minus(v_R, v_B);
                      for (let _i317 = 0; _i317 < _a316.length; _i317++) {
                        const v_d = _a316[_i317];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                        if (!(true)) {
                          _q314 = false;
                          break Q315;
                        }
                      }
                    }
                    _c318 = _q314;
                  }
                  _c319 = _c318;
                }
                _c320 = _c319;
              }
              if (!(_c320)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ k: v_k, o: v_o, i: v_i, b: v_b, R: v_R, B: v_B, r: v_r, nb: v_nb, heavy: v_heavy }, facts)) return 1;
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
  const _g454: number[] = [];
  const _g463: number[] = [];
  const _g470: number[] = [];
  const _g477: number[] = [];
  const _g484: number[] = [];
  const _g497: number[] = [];
  const _g507: number[] = [];
  const _g514: number[] = [];
  const _g521: number[] = [];
  const _g528: number[] = [];
  const facts = regionsFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L453: {
      const v_o = cl.count.at[v_k];
      _g454.length = 0;
      G455: {
        const _a458 = sp.adj8[v_o];
        for (let _i459 = 0; _i459 < _a458.length; _i459++) {
          const v_d = _a458[_i459];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g454.push(v_d);
        }
      }
      if (!((_g454.length > 0))) break L453;
      const _a460 = within(sp, v_o, 2);
      for (let _i461 = 0; _i461 < _a460.length; _i461++) {
        const v_i = _a460[_i461];
        const _h462 = clueAt(cl.count, v_i);
        let _c469: boolean = ((v_i !== v_o) && (_h462 !== -1));
        if (_c469) {
          _g463.length = 0;
          G464: {
            const _a467 = sp.adj8[v_i];
            for (let _i468 = 0; _i468 < _a467.length; _i468++) {
              const v_d = _a467[_i468];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g463.push(v_d);
            }
          }
          _c469 = (_g463.length > 0);
        }
        let _c476: boolean = _c469;
        if (_c476) {
          _g470.length = 0;
          G471: {
            const _a474 = sp.adj8[v_i];
            for (let _i475 = 0; _i475 < _a474.length; _i475++) {
              const v_d = _a474[_i475];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g470.push(v_d);
            }
          }
          _c476 = subsetOf(_g470, open(b, sp, v_o));
        }
        let _c483: boolean = _c476;
        if (_c483) {
          _g477.length = 0;
          G478: {
            const _a481 = sp.adj8[v_i];
            for (let _i482 = 0; _i482 < _a481.length; _i482++) {
              const v_d = _a481[_i482];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g477.push(v_d);
            }
          }
          _c483 = (_g477.length < open(b, sp, v_o).length);
        }
        if (!(_c483)) continue;
        _g484.length = 0;
        G485: {
          const _a488 = sp.adj8[v_i];
          for (let _i489 = 0; _i489 < _a488.length; _i489++) {
            const v_d = _a488[_i489];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g484.push(v_d);
          }
        }
        const v_R = minus(open(b, sp, v_o), _g484);
        let _g490 = 0;
        G491: {
          const _a492 = sp.adj8[v_i];
          for (let _i493 = 0; _i493 < _a492.length; _i493++) {
            const v_d = _a492[_i493];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g490++;
          }
        }
        const v_r = (need(b, sp, cl, v_o) - (_h462 - _g490));
        const _a494 = within(sp, v_o, 2);
        for (let _i495 = 0; _i495 < _a494.length; _i495++) {
          const v_p = _a494[_i495];
          const _h496 = clueAt(cl.count, v_p);
          let _c503: boolean = ((v_p !== v_o) && (_h496 !== -1));
          if (_c503) {
            _g497.length = 0;
            G498: {
              const _a501 = sp.adj8[v_p];
              for (let _i502 = 0; _i502 < _a501.length; _i502++) {
                const v_d = _a501[_i502];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g497.push(v_d);
              }
            }
            _c503 = (_g497.length > 0);
          }
          if (!(_c503)) continue;
          const _a504 = within(sp, v_p, 2);
          for (let _i505 = 0; _i505 < _a504.length; _i505++) {
            const v_q = _a504[_i505];
            const _h506 = clueAt(cl.count, v_q);
            let _c513: boolean = ((v_q !== v_p) && (_h506 !== -1));
            if (_c513) {
              _g507.length = 0;
              G508: {
                const _a511 = sp.adj8[v_q];
                for (let _i512 = 0; _i512 < _a511.length; _i512++) {
                  const v_d = _a511[_i512];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g507.push(v_d);
                }
              }
              _c513 = (_g507.length > 0);
            }
            let _c520: boolean = _c513;
            if (_c520) {
              _g514.length = 0;
              G515: {
                const _a518 = sp.adj8[v_q];
                for (let _i519 = 0; _i519 < _a518.length; _i519++) {
                  const v_d = _a518[_i519];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g514.push(v_d);
                }
              }
              _c520 = subsetOf(_g514, open(b, sp, v_p));
            }
            let _c527: boolean = _c520;
            if (_c527) {
              _g521.length = 0;
              G522: {
                const _a525 = sp.adj8[v_q];
                for (let _i526 = 0; _i526 < _a525.length; _i526++) {
                  const v_d = _a525[_i526];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g521.push(v_d);
                }
              }
              _c527 = (_g521.length < open(b, sp, v_p).length);
            }
            if (!(_c527)) continue;
            _g528.length = 0;
            G529: {
              const _a532 = sp.adj8[v_q];
              for (let _i533 = 0; _i533 < _a532.length; _i533++) {
                const v_d = _a532[_i533];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g528.push(v_d);
              }
            }
            L534: {
              const v_S = minus(open(b, sp, v_p), _g528);
              let _q535 = false;
              Q536: {
                const _a537 = v_R;
                for (let _i538 = 0; _i538 < _a537.length; _i538++) {
                  const v_d = _a537[_i538];
                  if ((v_S.includes(v_d))) {
                    _q535 = true;
                    break Q536;
                  }
                }
              }
              if (!(_q535)) break L534;
              const _h544 = minus(v_R, v_S).length;
              const _h545 = minus(v_S, v_R).length;
              let _g539 = 0;
              G540: {
                const _a541 = sp.adj8[v_q];
                for (let _i542 = 0; _i542 < _a541.length; _i542++) {
                  const v_d = _a541[_i542];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g539++;
                }
              }
              L543: {
                const v_by = (v_r - (need(b, sp, cl, v_p) - (_h506 - _g539)));
                if (!(((v_by >= _h544) && ((_h544 + _h545) > 0)))) break L543;
                facts.length = 0;
                changed = false;
                let _c550: boolean = (v_by === _h544);
                if (_c550) {
                  let _q546 = true;
                  Q547: {
                    const _a548 = minus(v_R, v_S);
                    for (let _i549 = 0; _i549 < _a548.length; _i549++) {
                      const v_d = _a548[_i549];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q546 = false;
                        break Q547;
                      }
                    }
                  }
                  _c550 = _q546;
                }
                let _c555: boolean = _c550;
                if (_c555) {
                  let _q551 = true;
                  Q552: {
                    const _a553 = minus(v_S, v_R);
                    for (let _i554 = 0; _i554 < _a553.length; _i554++) {
                      const v_d = _a553[_i554];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q551 = false;
                        break Q552;
                      }
                    }
                  }
                  _c555 = _q551;
                }
                if (!(_c555)) return -1;
                if (changed || facts.length > 0) {
                  fired = 1;
                  if (fire !== null && !fire({ k: v_k, o: v_o, i: v_i, R: v_R, r: v_r, p: v_p, q: v_q, S: v_S, by: v_by }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g645: number[] = [];
  const _g669: number[] = [];
  const _g703: number[] = [];
  const _g719: number[] = [];
  const _g735: number[] = [];
  const _g748: number[] = [];
  const _g757: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  _g645.length = 0;
  G646: {
    for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
      let _q651 = false;
      Q652: {
        const _a653 = sp.adj8[cl.count.at[v_k]];
        for (let _i654 = 0; _i654 < _a653.length; _i654++) {
          const v_d = _a653[_i654];
          if (!((b.grid[v_d] !== 0))) {
            _q651 = true;
            break Q652;
          }
        }
      }
      if (!(_q651)) continue;
      _g645.push(v_k);
    }
  }
  L655: {
    const v_C = _g645;
    const _h656 = v_C.length;
    if (!((_h656 <= 10))) break L655;
    let _g657 = 0;
    G658: {
      const _a659 = sp.cells;
      for (let _i660 = 0; _i660 < _a659.length; _i660++) {
        const v_c = _a659[_i660];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g657++;
      }
    }
    const v_L = (cl.mines - _g657);
    let _g661 = 0;
    G662: {
      const _a663 = sp.cells;
      for (let _i664 = 0; _i664 < _a663.length; _i664++) {
        const v_c = _a663[_i664];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g661++;
      }
    }
    const v_u = _g661;
    for (let v_size = 0; v_size <= 5; v_size++) {
      const _e665 = v_C;
      const _n668 = 1 << _e665.length;
      for (let _k666 = v_size > _e665.length ? _n668 : (1 << v_size) - 1; _k666 < _n668; _k666 = v_size === 0 ? _n668 : nextOfSize(_k666)) {
        const v_T = _g669;
        v_T.length = 0;
        for (let _j667 = 0; _j667 < _e665.length; _j667++) if ((_k666 >> (_e665.length - 1 - _j667)) & 1) v_T.push(_e665[_j667]);
        const _h670 = v_T.length;
        let _c692: boolean = (_h670 === v_size);
        if (_c692) {
          let _q671 = true;
          Q672: {
            const _a673 = v_T;
            for (let _i674 = 0; _i674 < _a673.length; _i674++) {
              const v_x = _a673[_i674];
              const _h677 = cl.count.at[v_x];
              const _h679 = (_h677 % sp.w);
              const _h680 = ((_h677 / sp.w) | 0);
              const _a675 = v_T;
              for (let _i676 = 0; _i676 < _a675.length; _i676++) {
                const v_y = _a675[_i676];
                if (!((v_x !== v_y))) continue;
                const _t678 = cl.count.at[v_y];
                let _c691: boolean = ((Math.abs((_h679 - (_t678 % sp.w))) <= 2) && (Math.abs((_h680 - ((_t678 / sp.w) | 0))) <= 2));
                if (_c691) {
                  let _q687 = false;
                  Q688: {
                    const _a689 = open(b, sp, _h677);
                    for (let _i690 = 0; _i690 < _a689.length; _i690++) {
                      const v_d = _a689[_i690];
                      if ((open(b, sp, _t678).includes(v_d))) {
                        _q687 = true;
                        break Q688;
                      }
                    }
                  }
                  _c691 = _q687;
                }
                if (!(!(_c691))) {
                  _q671 = false;
                  break Q672;
                }
              }
            }
          }
          _c692 = _q671;
        }
        if (!(_c692)) continue;
        let _g693 = 0;
        G694: {
          const _a695 = v_T;
          for (let _i696 = 0; _i696 < _a695.length; _i696++) {
            const v_x = _a695[_i696];
            const _t697 = cl.count.at[v_x];
            const _h698 = clueAt(cl.count, _t697);
            let _g699 = 0;
            G700: {
              const _a701 = sp.adj8[_t697];
              for (let _i702 = 0; _i702 < _a701.length; _i702++) {
                const v_d = _a701[_i702];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g699++;
              }
            }
            _g693 += (_h698 - _g699);
          }
        }
        const v_n = _g693;
        _g703.length = 0;
        G704: {
          const _a716 = v_T;
          for (let _i717 = 0; _i717 < _a716.length; _i717++) {
            const v_x = _a716[_i717];
            const _t718 = cl.count.at[v_x];
            _g719.length = 0;
            G720: {
              const _a723 = sp.adj8[_t718];
              for (let _i724 = 0; _i724 < _a723.length; _i724++) {
                const v_d = _a723[_i724];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g719.push(v_d);
              }
            }
            const _a725 = _g719;
            for (let _i726 = 0; _i726 < _a725.length; _i726++) {
              const v_d = _a725[_i726];
              if (!_g703.includes(v_d)) _g703.push(v_d);
            }
          }
        }
        L727: {
          const v_X = _g703;
          const _h728 = v_X.length;
          if (!(((v_u > _h728) && ((v_n === v_L) || ((v_L - v_n) === (v_u - _h728)))))) break L727;
          facts.length = 0;
          changed = false;
          let _g729 = 0;
          G730: {
            const _a731 = sp.cells;
            for (let _i732 = 0; _i732 < _a731.length; _i732++) {
              const v_c = _a731[_i732];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g729++;
            }
          }
          let _c743: boolean = !((v_n === (cl.mines - _g729)));
          if (!_c743) {
            let _q733 = true;
            Q734: {
              _g735.length = 0;
              G736: {
                const _a739 = sp.cells;
                for (let _i740 = 0; _i740 < _a739.length; _i740++) {
                  const v_c = _a739[_i740];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g735.push(v_c);
                }
              }
              const _a741 = _g735;
              for (let _i742 = 0; _i742 < _a741.length; _i742++) {
                const v_d = _a741[_i742];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q733 = false;
                  break Q734;
                }
              }
            }
            _c743 = _q733;
          }
          let _c766: boolean = _c743;
          if (_c766) {
            let _g744 = 0;
            G745: {
              const _a746 = sp.cells;
              for (let _i747 = 0; _i747 < _a746.length; _i747++) {
                const v_c = _a746[_i747];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g744++;
              }
            }
            let _c754: boolean = (v_n !== (cl.mines - _g744));
            if (_c754) {
              _g748.length = 0;
              G749: {
                const _a752 = sp.cells;
                for (let _i753 = 0; _i753 < _a752.length; _i753++) {
                  const v_c = _a752[_i753];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g748.push(v_c);
                }
              }
              _c754 = (((cl.mines - _g744) - v_n) === _g748.length);
            }
            let _c765: boolean = !(_c754);
            if (!_c765) {
              let _q755 = true;
              Q756: {
                _g757.length = 0;
                G758: {
                  const _a761 = sp.cells;
                  for (let _i762 = 0; _i762 < _a761.length; _i762++) {
                    const v_c = _a761[_i762];
                    if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                    _g757.push(v_c);
                  }
                }
                const _a763 = _g757;
                for (let _i764 = 0; _i764 < _a763.length; _i764++) {
                  const v_d = _a763[_i764];
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                  if (!(true)) {
                    _q755 = false;
                    break Q756;
                  }
                }
              }
              _c765 = _q755;
            }
            _c766 = _c765;
          }
          if (!(_c766)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ C: v_C, L: v_L, u: v_u, size: v_size, T: v_T, n: v_n, X: v_X }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g123: number[] = [];
  G124: {
    const _a127 = sp.adj8[v_c];
    for (let _i128 = 0; _i128 < _a127.length; _i128++) {
      const v_d = _a127[_i128];
      if (!(!((b.grid[v_d] !== 0)))) continue;
      _g123.push(v_d);
    }
  }
  const _made = _g123;
  _kept[v_c] = _made;
  return _made;
}

const needKept = keptStore<number>();

/** `need(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g133 = 0;
  G134: {
    const _a135 = sp.adj8[v_c];
    for (let _i136 = 0; _i136 < _a135.length; _i136++) {
      const v_d = _a135[_i136];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g133++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g133);
  _kept[v_c] = _made;
  return _made;
}
