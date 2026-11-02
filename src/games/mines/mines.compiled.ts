// Compiled by `npm run describe` from src/games/mines/mines.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, minus, nextOfSize, rangeMask, subsetOf, within } from "../../engine/describe-runtime.ts";

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

/** The techniques run as each value is placed, in the description's order. */
export const placing: readonly PlacingId[] = [];

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
  let _g881 = 0;
  G882: {
    const _a883 = sp.cells;
    for (let _i884 = 0; _i884 < _a883.length; _i884++) {
      const v_c = _a883[_i884];
      if (!(((g[v_c] || -1) === 1))) continue;
      _g881++;
    }
  }
  if (!((_g881 === cl.mines))) return false;
  for (let _k885 = 0; _k885 < cl.count.at.length; _k885++) {
    const _at886 = cl.count.at[_k885];
    const _v887 = cl.count.v[_k885];
    let _c892 = ((g[_at886] || -1) === 2);
    if (_c892) {
      let _g888 = 0;
      G889: {
        const _a890 = sp.adj8[_at886];
        for (let _i891 = 0; _i891 < _a890.length; _i891++) {
          const v_d = _a890[_i891];
          if (!(((g[v_d] || -1) === 1))) continue;
          _g888++;
        }
      }
      _c892 = (_g888 === _v887);
    }
    if (!(_c892)) return false;
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
        if (!(!(b.known(v_d)))) continue;
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
        if (!((b.value(v_d) === 1))) continue;
        _g19++;
      }
    }
    L23: {
      const v_n = (_h18 - _g19);
      if (!(((_h24 > 0) && ((v_n <= 0) || (v_n >= _h24))))) break L23;
      facts.length = 0;
      changed = false;
      let _c30 = ((v_n >= 0) && (v_n <= _h24));
      if (_c30) {
        let _c29 = !((v_n === 0));
        if (!_c29) {
          let _q25 = true;
          Q26: {
            const _a27 = v_U;
            for (let _i28 = 0; _i28 < _a27.length; _i28++) {
              const v_d = _a27[_i28];
              if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
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
      let _c36 = _c30;
      if (_c36) {
        let _c35 = (v_n === 0);
        if (!_c35) {
          let _q31 = true;
          Q32: {
            const _a33 = v_U;
            for (let _i34 = 0; _i34 < _a33.length; _i34++) {
              const v_d = _a33[_i34];
              if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
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

export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const _g104: number[] = [];
  const _g123: number[] = [];
  const _g131: number[] = [];
  const _g148: number[] = [];
  const _g154: number[] = [];
  const _g160: number[] = [];
  const _g166: number[] = [];
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
          if (!(!(b.known(v_d)))) continue;
          _g104.push(v_d);
        }
      }
      if (!((_g104.length > 0))) break L103;
      const _h113 = (v_a % sp.w);
      const _h114 = ((v_a / sp.w) | 0);
      const _h139 = clueAt(cl.count, v_a);
      const _a110 = within(sp, v_a, 2);
      for (let _i111 = 0; _i111 < _a110.length; _i111++) {
        const v_b = _a110[_i111];
        const _h112 = clueAt(cl.count, v_b);
        let _c138 = ((v_b !== v_a) && (_h112 !== -1));
        if (_c138) {
          let _c137 = ((Math.abs((_h113 - (v_b % sp.w))) <= 2) && (Math.abs((_h114 - ((v_b / sp.w) | 0))) <= 2));
          if (_c137) {
            let _q121 = false;
            Q122: {
              _g123.length = 0;
              G124: {
                const _a127 = sp.adj8[v_a];
                for (let _i128 = 0; _i128 < _a127.length; _i128++) {
                  const v_d = _a127[_i128];
                  if (!(!(b.known(v_d)))) continue;
                  _g123.push(v_d);
                }
              }
              const _a129 = _g123;
              for (let _i130 = 0; _i130 < _a129.length; _i130++) {
                const v_d = _a129[_i130];
                _g131.length = 0;
                G132: {
                  const _a135 = sp.adj8[v_b];
                  for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                    const v_d = _a135[_i136];
                    if (!(!(b.known(v_d)))) continue;
                    _g131.push(v_d);
                  }
                }
                if ((_g131.includes(v_d))) {
                  _q121 = true;
                  break Q122;
                }
              }
            }
            _c137 = _q121;
          }
          _c138 = _c137;
        }
        if (!(_c138)) continue;
        let _g140 = 0;
        G141: {
          const _a142 = sp.adj8[v_a];
          for (let _i143 = 0; _i143 < _a142.length; _i143++) {
            const v_d = _a142[_i143];
            if (!((b.value(v_d) === 1))) continue;
            _g140++;
          }
        }
        let _g144 = 0;
        G145: {
          const _a146 = sp.adj8[v_b];
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_d = _a146[_i147];
            if (!((b.value(v_d) === 1))) continue;
            _g144++;
          }
        }
        const v_by = ((_h139 - _g140) - (_h112 - _g144));
        _g148.length = 0;
        G149: {
          const _a152 = sp.adj8[v_a];
          for (let _i153 = 0; _i153 < _a152.length; _i153++) {
            const v_d = _a152[_i153];
            if (!(!(b.known(v_d)))) continue;
            _g148.push(v_d);
          }
        }
        _g154.length = 0;
        G155: {
          const _a158 = sp.adj8[v_b];
          for (let _i159 = 0; _i159 < _a158.length; _i159++) {
            const v_d = _a158[_i159];
            if (!(!(b.known(v_d)))) continue;
            _g154.push(v_d);
          }
        }
        const v_O = minus(_g148, _g154);
        const _h173 = v_O.length;
        _g160.length = 0;
        G161: {
          const _a164 = sp.adj8[v_b];
          for (let _i165 = 0; _i165 < _a164.length; _i165++) {
            const v_d = _a164[_i165];
            if (!(!(b.known(v_d)))) continue;
            _g160.push(v_d);
          }
        }
        _g166.length = 0;
        G167: {
          const _a170 = sp.adj8[v_a];
          for (let _i171 = 0; _i171 < _a170.length; _i171++) {
            const v_d = _a170[_i171];
            if (!(!(b.known(v_d)))) continue;
            _g166.push(v_d);
          }
        }
        L172: {
          const v_S = minus(_g160, _g166);
          const _h174 = v_S.length;
          if (!(((v_by >= _h173) && ((_h173 + _h174) > 0)))) break L172;
          facts.length = 0;
          changed = false;
          let _c179 = (v_by === _h173);
          if (_c179) {
            let _q175 = true;
            Q176: {
              const _a177 = v_O;
              for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                const v_d = _a177[_i178];
                if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q175 = false;
                  break Q176;
                }
              }
            }
            _c179 = _q175;
          }
          let _c184 = _c179;
          if (_c184) {
            let _q180 = true;
            Q181: {
              const _a182 = v_S;
              for (let _i183 = 0; _i183 < _a182.length; _i183++) {
                const v_d = _a182[_i183];
                if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q180 = false;
                  break Q181;
                }
              }
            }
            _c184 = _q180;
          }
          if (!(_c184)) return -1;
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

export function region(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionBinding> | null): number {
  const _g266: number[] = [];
  const _g275: number[] = [];
  const _g282: number[] = [];
  const _g288: number[] = [];
  const _g295: number[] = [];
  const _g301: number[] = [];
  const _g311: number[] = [];
  const _g317: number[] = [];
  const _g323: number[] = [];
  const facts = regionFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L265: {
      const v_o = cl.count.at[v_k];
      _g266.length = 0;
      G267: {
        const _a270 = sp.adj8[v_o];
        for (let _i271 = 0; _i271 < _a270.length; _i271++) {
          const v_d = _a270[_i271];
          if (!(!(b.known(v_d)))) continue;
          _g266.push(v_d);
        }
      }
      if (!((_g266.length > 0))) break L265;
      const _h334 = clueAt(cl.count, v_o);
      const _a272 = within(sp, v_o, 2);
      for (let _i273 = 0; _i273 < _a272.length; _i273++) {
        const v_i = _a272[_i273];
        const _h274 = clueAt(cl.count, v_i);
        let _c281 = ((v_i !== v_o) && (_h274 !== -1));
        if (_c281) {
          _g275.length = 0;
          G276: {
            const _a279 = sp.adj8[v_i];
            for (let _i280 = 0; _i280 < _a279.length; _i280++) {
              const v_d = _a279[_i280];
              if (!(!(b.known(v_d)))) continue;
              _g275.push(v_d);
            }
          }
          _c281 = (_g275.length > 0);
        }
        let _c294 = _c281;
        if (_c294) {
          _g282.length = 0;
          G283: {
            const _a286 = sp.adj8[v_i];
            for (let _i287 = 0; _i287 < _a286.length; _i287++) {
              const v_d = _a286[_i287];
              if (!(!(b.known(v_d)))) continue;
              _g282.push(v_d);
            }
          }
          _g288.length = 0;
          G289: {
            const _a292 = sp.adj8[v_o];
            for (let _i293 = 0; _i293 < _a292.length; _i293++) {
              const v_d = _a292[_i293];
              if (!(!(b.known(v_d)))) continue;
              _g288.push(v_d);
            }
          }
          _c294 = subsetOf(_g282, _g288);
        }
        let _c307 = _c294;
        if (_c307) {
          _g295.length = 0;
          G296: {
            const _a299 = sp.adj8[v_i];
            for (let _i300 = 0; _i300 < _a299.length; _i300++) {
              const v_d = _a299[_i300];
              if (!(!(b.known(v_d)))) continue;
              _g295.push(v_d);
            }
          }
          _g301.length = 0;
          G302: {
            const _a305 = sp.adj8[v_o];
            for (let _i306 = 0; _i306 < _a305.length; _i306++) {
              const v_d = _a305[_i306];
              if (!(!(b.known(v_d)))) continue;
              _g301.push(v_d);
            }
          }
          _c307 = (_g295.length < _g301.length);
        }
        if (!(_c307)) continue;
        const _a308 = within(sp, v_o, 3);
        for (let _i309 = 0; _i309 < _a308.length; _i309++) {
          const v_b = _a308[_i309];
          const _h310 = clueAt(cl.count, v_b);
          if (!((((v_b !== v_o) && (v_b !== v_i)) && (_h310 !== -1)))) continue;
          _g311.length = 0;
          G312: {
            const _a315 = sp.adj8[v_o];
            for (let _i316 = 0; _i316 < _a315.length; _i316++) {
              const v_d = _a315[_i316];
              if (!(!(b.known(v_d)))) continue;
              _g311.push(v_d);
            }
          }
          _g317.length = 0;
          G318: {
            const _a321 = sp.adj8[v_i];
            for (let _i322 = 0; _i322 < _a321.length; _i322++) {
              const v_d = _a321[_i322];
              if (!(!(b.known(v_d)))) continue;
              _g317.push(v_d);
            }
          }
          const v_R = minus(_g311, _g317);
          _g323.length = 0;
          G324: {
            const _a327 = sp.adj8[v_b];
            for (let _i328 = 0; _i328 < _a327.length; _i328++) {
              const v_d = _a327[_i328];
              if (!(!(b.known(v_d)))) continue;
              _g323.push(v_d);
            }
          }
          L329: {
            const v_B = _g323;
            let _q330 = false;
            Q331: {
              const _a332 = v_R;
              for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                const v_d = _a332[_i333];
                if ((v_B.includes(v_d))) {
                  _q330 = true;
                  break Q331;
                }
              }
            }
            if (!(_q330)) break L329;
            const _h347 = minus(v_R, v_B).length;
            const _h349 = minus(v_B, v_R).length;
            let _g335 = 0;
            G336: {
              const _a337 = sp.adj8[v_o];
              for (let _i338 = 0; _i338 < _a337.length; _i338++) {
                const v_d = _a337[_i338];
                if (!((b.value(v_d) === 1))) continue;
                _g335++;
              }
            }
            let _g339 = 0;
            G340: {
              const _a341 = sp.adj8[v_i];
              for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                const v_d = _a341[_i342];
                if (!((b.value(v_d) === 1))) continue;
                _g339++;
              }
            }
            const v_r = ((_h334 - _g335) - (_h274 - _g339));
            let _g343 = 0;
            G344: {
              const _a345 = sp.adj8[v_b];
              for (let _i346 = 0; _i346 < _a345.length; _i346++) {
                const v_d = _a345[_i346];
                if (!((b.value(v_d) === 1))) continue;
                _g343++;
              }
            }
            const v_nb = (_h310 - _g343);
            L348: {
              const v_heavy = ((v_r - v_nb) >= _h347);
              if (!(((v_heavy || ((v_nb - v_r) >= _h349)) && ((_h347 + _h349) > 0)))) break L348;
              facts.length = 0;
              changed = false;
              let _c360 = !(v_heavy);
              if (!_c360) {
                let _c354 = ((v_r - v_nb) === _h347);
                if (_c354) {
                  let _q350 = true;
                  Q351: {
                    const _a352 = minus(v_R, v_B);
                    for (let _i353 = 0; _i353 < _a352.length; _i353++) {
                      const v_d = _a352[_i353];
                      if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q350 = false;
                        break Q351;
                      }
                    }
                  }
                  _c354 = _q350;
                }
                let _c359 = _c354;
                if (_c359) {
                  let _q355 = true;
                  Q356: {
                    const _a357 = minus(v_B, v_R);
                    for (let _i358 = 0; _i358 < _a357.length; _i358++) {
                      const v_d = _a357[_i358];
                      if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q355 = false;
                        break Q356;
                      }
                    }
                  }
                  _c359 = _q355;
                }
                _c360 = _c359;
              }
              let _c372 = _c360;
              if (_c372) {
                let _c371 = v_heavy;
                if (!_c371) {
                  let _c365 = ((v_nb - v_r) === _h349);
                  if (_c365) {
                    let _q361 = true;
                    Q362: {
                      const _a363 = minus(v_B, v_R);
                      for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                        const v_d = _a363[_i364];
                        if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                        if (!(true)) {
                          _q361 = false;
                          break Q362;
                        }
                      }
                    }
                    _c365 = _q361;
                  }
                  let _c370 = _c365;
                  if (_c370) {
                    let _q366 = true;
                    Q367: {
                      const _a368 = minus(v_R, v_B);
                      for (let _i369 = 0; _i369 < _a368.length; _i369++) {
                        const v_d = _a368[_i369];
                        if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                        if (!(true)) {
                          _q366 = false;
                          break Q367;
                        }
                      }
                    }
                    _c370 = _q366;
                  }
                  _c371 = _c370;
                }
                _c372 = _c371;
              }
              if (!(_c372)) return -1;
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

export function regions(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionsBinding> | null): number {
  const _g506: number[] = [];
  const _g515: number[] = [];
  const _g522: number[] = [];
  const _g528: number[] = [];
  const _g535: number[] = [];
  const _g541: number[] = [];
  const _g548: number[] = [];
  const _g554: number[] = [];
  const _g572: number[] = [];
  const _g582: number[] = [];
  const _g589: number[] = [];
  const _g595: number[] = [];
  const _g602: number[] = [];
  const _g608: number[] = [];
  const _g615: number[] = [];
  const _g621: number[] = [];
  const facts = regionsFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L505: {
      const v_o = cl.count.at[v_k];
      _g506.length = 0;
      G507: {
        const _a510 = sp.adj8[v_o];
        for (let _i511 = 0; _i511 < _a510.length; _i511++) {
          const v_d = _a510[_i511];
          if (!(!(b.known(v_d)))) continue;
          _g506.push(v_d);
        }
      }
      if (!((_g506.length > 0))) break L505;
      const _h560 = clueAt(cl.count, v_o);
      const _a512 = within(sp, v_o, 2);
      for (let _i513 = 0; _i513 < _a512.length; _i513++) {
        const v_i = _a512[_i513];
        const _h514 = clueAt(cl.count, v_i);
        let _c521 = ((v_i !== v_o) && (_h514 !== -1));
        if (_c521) {
          _g515.length = 0;
          G516: {
            const _a519 = sp.adj8[v_i];
            for (let _i520 = 0; _i520 < _a519.length; _i520++) {
              const v_d = _a519[_i520];
              if (!(!(b.known(v_d)))) continue;
              _g515.push(v_d);
            }
          }
          _c521 = (_g515.length > 0);
        }
        let _c534 = _c521;
        if (_c534) {
          _g522.length = 0;
          G523: {
            const _a526 = sp.adj8[v_i];
            for (let _i527 = 0; _i527 < _a526.length; _i527++) {
              const v_d = _a526[_i527];
              if (!(!(b.known(v_d)))) continue;
              _g522.push(v_d);
            }
          }
          _g528.length = 0;
          G529: {
            const _a532 = sp.adj8[v_o];
            for (let _i533 = 0; _i533 < _a532.length; _i533++) {
              const v_d = _a532[_i533];
              if (!(!(b.known(v_d)))) continue;
              _g528.push(v_d);
            }
          }
          _c534 = subsetOf(_g522, _g528);
        }
        let _c547 = _c534;
        if (_c547) {
          _g535.length = 0;
          G536: {
            const _a539 = sp.adj8[v_i];
            for (let _i540 = 0; _i540 < _a539.length; _i540++) {
              const v_d = _a539[_i540];
              if (!(!(b.known(v_d)))) continue;
              _g535.push(v_d);
            }
          }
          _g541.length = 0;
          G542: {
            const _a545 = sp.adj8[v_o];
            for (let _i546 = 0; _i546 < _a545.length; _i546++) {
              const v_d = _a545[_i546];
              if (!(!(b.known(v_d)))) continue;
              _g541.push(v_d);
            }
          }
          _c547 = (_g535.length < _g541.length);
        }
        if (!(_c547)) continue;
        _g548.length = 0;
        G549: {
          const _a552 = sp.adj8[v_o];
          for (let _i553 = 0; _i553 < _a552.length; _i553++) {
            const v_d = _a552[_i553];
            if (!(!(b.known(v_d)))) continue;
            _g548.push(v_d);
          }
        }
        _g554.length = 0;
        G555: {
          const _a558 = sp.adj8[v_i];
          for (let _i559 = 0; _i559 < _a558.length; _i559++) {
            const v_d = _a558[_i559];
            if (!(!(b.known(v_d)))) continue;
            _g554.push(v_d);
          }
        }
        const v_R = minus(_g548, _g554);
        let _g561 = 0;
        G562: {
          const _a563 = sp.adj8[v_o];
          for (let _i564 = 0; _i564 < _a563.length; _i564++) {
            const v_d = _a563[_i564];
            if (!((b.value(v_d) === 1))) continue;
            _g561++;
          }
        }
        let _g565 = 0;
        G566: {
          const _a567 = sp.adj8[v_i];
          for (let _i568 = 0; _i568 < _a567.length; _i568++) {
            const v_d = _a567[_i568];
            if (!((b.value(v_d) === 1))) continue;
            _g565++;
          }
        }
        const v_r = ((_h560 - _g561) - (_h514 - _g565));
        const _a569 = within(sp, v_o, 2);
        for (let _i570 = 0; _i570 < _a569.length; _i570++) {
          const v_p = _a569[_i570];
          const _h571 = clueAt(cl.count, v_p);
          let _c578 = ((v_p !== v_o) && (_h571 !== -1));
          if (_c578) {
            _g572.length = 0;
            G573: {
              const _a576 = sp.adj8[v_p];
              for (let _i577 = 0; _i577 < _a576.length; _i577++) {
                const v_d = _a576[_i577];
                if (!(!(b.known(v_d)))) continue;
                _g572.push(v_d);
              }
            }
            _c578 = (_g572.length > 0);
          }
          if (!(_c578)) continue;
          const _a579 = within(sp, v_p, 2);
          for (let _i580 = 0; _i580 < _a579.length; _i580++) {
            const v_q = _a579[_i580];
            const _h581 = clueAt(cl.count, v_q);
            let _c588 = ((v_q !== v_p) && (_h581 !== -1));
            if (_c588) {
              _g582.length = 0;
              G583: {
                const _a586 = sp.adj8[v_q];
                for (let _i587 = 0; _i587 < _a586.length; _i587++) {
                  const v_d = _a586[_i587];
                  if (!(!(b.known(v_d)))) continue;
                  _g582.push(v_d);
                }
              }
              _c588 = (_g582.length > 0);
            }
            let _c601 = _c588;
            if (_c601) {
              _g589.length = 0;
              G590: {
                const _a593 = sp.adj8[v_q];
                for (let _i594 = 0; _i594 < _a593.length; _i594++) {
                  const v_d = _a593[_i594];
                  if (!(!(b.known(v_d)))) continue;
                  _g589.push(v_d);
                }
              }
              _g595.length = 0;
              G596: {
                const _a599 = sp.adj8[v_p];
                for (let _i600 = 0; _i600 < _a599.length; _i600++) {
                  const v_d = _a599[_i600];
                  if (!(!(b.known(v_d)))) continue;
                  _g595.push(v_d);
                }
              }
              _c601 = subsetOf(_g589, _g595);
            }
            let _c614 = _c601;
            if (_c614) {
              _g602.length = 0;
              G603: {
                const _a606 = sp.adj8[v_q];
                for (let _i607 = 0; _i607 < _a606.length; _i607++) {
                  const v_d = _a606[_i607];
                  if (!(!(b.known(v_d)))) continue;
                  _g602.push(v_d);
                }
              }
              _g608.length = 0;
              G609: {
                const _a612 = sp.adj8[v_p];
                for (let _i613 = 0; _i613 < _a612.length; _i613++) {
                  const v_d = _a612[_i613];
                  if (!(!(b.known(v_d)))) continue;
                  _g608.push(v_d);
                }
              }
              _c614 = (_g602.length < _g608.length);
            }
            if (!(_c614)) continue;
            _g615.length = 0;
            G616: {
              const _a619 = sp.adj8[v_p];
              for (let _i620 = 0; _i620 < _a619.length; _i620++) {
                const v_d = _a619[_i620];
                if (!(!(b.known(v_d)))) continue;
                _g615.push(v_d);
              }
            }
            _g621.length = 0;
            G622: {
              const _a625 = sp.adj8[v_q];
              for (let _i626 = 0; _i626 < _a625.length; _i626++) {
                const v_d = _a625[_i626];
                if (!(!(b.known(v_d)))) continue;
                _g621.push(v_d);
              }
            }
            L627: {
              const v_S = minus(_g615, _g621);
              let _q628 = false;
              Q629: {
                const _a630 = v_R;
                for (let _i631 = 0; _i631 < _a630.length; _i631++) {
                  const v_d = _a630[_i631];
                  if ((v_S.includes(v_d))) {
                    _q628 = true;
                    break Q629;
                  }
                }
              }
              if (!(_q628)) break L627;
              const _h641 = minus(v_R, v_S).length;
              const _h642 = minus(v_S, v_R).length;
              let _g632 = 0;
              G633: {
                const _a634 = sp.adj8[v_p];
                for (let _i635 = 0; _i635 < _a634.length; _i635++) {
                  const v_d = _a634[_i635];
                  if (!((b.value(v_d) === 1))) continue;
                  _g632++;
                }
              }
              let _g636 = 0;
              G637: {
                const _a638 = sp.adj8[v_q];
                for (let _i639 = 0; _i639 < _a638.length; _i639++) {
                  const v_d = _a638[_i639];
                  if (!((b.value(v_d) === 1))) continue;
                  _g636++;
                }
              }
              L640: {
                const v_by = (v_r - ((_h571 - _g632) - (_h581 - _g636)));
                if (!(((v_by >= _h641) && ((_h641 + _h642) > 0)))) break L640;
                facts.length = 0;
                changed = false;
                let _c647 = (v_by === _h641);
                if (_c647) {
                  let _q643 = true;
                  Q644: {
                    const _a645 = minus(v_R, v_S);
                    for (let _i646 = 0; _i646 < _a645.length; _i646++) {
                      const v_d = _a645[_i646];
                      if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q643 = false;
                        break Q644;
                      }
                    }
                  }
                  _c647 = _q643;
                }
                let _c652 = _c647;
                if (_c652) {
                  let _q648 = true;
                  Q649: {
                    const _a650 = minus(v_S, v_R);
                    for (let _i651 = 0; _i651 < _a650.length; _i651++) {
                      const v_d = _a650[_i651];
                      if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q648 = false;
                        break Q649;
                      }
                    }
                  }
                  _c652 = _q648;
                }
                if (!(_c652)) return -1;
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

export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g743: number[] = [];
  const _g787: number[] = [];
  const _g795: number[] = [];
  const _g813: number[] = [];
  const _g829: number[] = [];
  const _g845: number[] = [];
  const _g862: number[] = [];
  const _g871: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  _g743.length = 0;
  G744: {
    for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
      let _q749 = false;
      Q750: {
        const _a751 = sp.adj8[cl.count.at[v_k]];
        for (let _i752 = 0; _i752 < _a751.length; _i752++) {
          const v_d = _a751[_i752];
          if (!(b.known(v_d))) {
            _q749 = true;
            break Q750;
          }
        }
      }
      if (!(_q749)) continue;
      _g743.push(v_k);
    }
  }
  L753: {
    const v_C = _g743;
    const _h754 = v_C.length;
    if (!((_h754 <= 10))) break L753;
    let _g755 = 0;
    G756: {
      const _a757 = sp.cells;
      for (let _i758 = 0; _i758 < _a757.length; _i758++) {
        const v_c = _a757[_i758];
        if (!((b.value(v_c) === 1))) continue;
        _g755++;
      }
    }
    const v_L = (cl.mines - _g755);
    let _g759 = 0;
    G760: {
      const _a761 = sp.cells;
      for (let _i762 = 0; _i762 < _a761.length; _i762++) {
        const v_c = _a761[_i762];
        if (!(!(b.known(v_c)))) continue;
        _g759++;
      }
    }
    const v_u = _g759;
    for (let _m763 = rangeMask(0, 5); _m763 !== 0; _m763 &= _m763 - 1) {
      const v_size = 31 - Math.clz32(_m763 & -_m763);
      const _e764 = v_C;
      const _n767 = 1 << _e764.length;
      for (let _k765 = v_size > _e764.length ? _n767 : (1 << v_size) - 1; _k765 < _n767; _k765 = v_size === 0 ? _n767 : nextOfSize(_k765)) {
        const v_T: number[] = [];
        for (let _j766 = 0; _j766 < _e764.length; _j766++) if ((_k765 >> (_e764.length - 1 - _j766)) & 1) v_T.push(_e764[_j766]);
        const _h768 = v_T.length;
        let _c802 = (_h768 === v_size);
        if (_c802) {
          let _q769 = true;
          Q770: {
            const _a771 = v_T;
            for (let _i772 = 0; _i772 < _a771.length; _i772++) {
              const v_x = _a771[_i772];
              const _h775 = cl.count.at[v_x];
              const _h777 = (_h775 % sp.w);
              const _h778 = ((_h775 / sp.w) | 0);
              const _a773 = v_T;
              for (let _i774 = 0; _i774 < _a773.length; _i774++) {
                const v_y = _a773[_i774];
                if (!((v_x !== v_y))) continue;
                const _t776 = cl.count.at[v_y];
                let _c801 = ((Math.abs((_h777 - (_t776 % sp.w))) <= 2) && (Math.abs((_h778 - ((_t776 / sp.w) | 0))) <= 2));
                if (_c801) {
                  let _q785 = false;
                  Q786: {
                    _g787.length = 0;
                    G788: {
                      const _a791 = sp.adj8[_h775];
                      for (let _i792 = 0; _i792 < _a791.length; _i792++) {
                        const v_d = _a791[_i792];
                        if (!(!(b.known(v_d)))) continue;
                        _g787.push(v_d);
                      }
                    }
                    const _a793 = _g787;
                    for (let _i794 = 0; _i794 < _a793.length; _i794++) {
                      const v_d = _a793[_i794];
                      _g795.length = 0;
                      G796: {
                        const _a799 = sp.adj8[_t776];
                        for (let _i800 = 0; _i800 < _a799.length; _i800++) {
                          const v_d = _a799[_i800];
                          if (!(!(b.known(v_d)))) continue;
                          _g795.push(v_d);
                        }
                      }
                      if ((_g795.includes(v_d))) {
                        _q785 = true;
                        break Q786;
                      }
                    }
                  }
                  _c801 = _q785;
                }
                if (!(!(_c801))) {
                  _q769 = false;
                  break Q770;
                }
              }
            }
          }
          _c802 = _q769;
        }
        if (!(_c802)) continue;
        let _g803 = 0;
        G804: {
          const _a805 = v_T;
          for (let _i806 = 0; _i806 < _a805.length; _i806++) {
            const v_x = _a805[_i806];
            const _t807 = cl.count.at[v_x];
            const _h808 = clueAt(cl.count, _t807);
            let _g809 = 0;
            G810: {
              const _a811 = sp.adj8[_t807];
              for (let _i812 = 0; _i812 < _a811.length; _i812++) {
                const v_d = _a811[_i812];
                if (!((b.value(v_d) === 1))) continue;
                _g809++;
              }
            }
            _g803 += (_h808 - _g809);
          }
        }
        const v_n = _g803;
        _g813.length = 0;
        G814: {
          const _a826 = v_T;
          for (let _i827 = 0; _i827 < _a826.length; _i827++) {
            const v_x = _a826[_i827];
            const _t828 = cl.count.at[v_x];
            _g829.length = 0;
            G830: {
              const _a833 = sp.adj8[_t828];
              for (let _i834 = 0; _i834 < _a833.length; _i834++) {
                const v_d = _a833[_i834];
                if (!(!(b.known(v_d)))) continue;
                _g829.push(v_d);
              }
            }
            const _a835 = _g829;
            for (let _i836 = 0; _i836 < _a835.length; _i836++) {
              const v_d = _a835[_i836];
              if (!_g813.includes(v_d)) _g813.push(v_d);
            }
          }
        }
        L837: {
          const v_X = _g813;
          const _h838 = v_X.length;
          if (!(((v_u > _h838) && ((v_n === v_L) || ((v_L - v_n) === (v_u - _h838)))))) break L837;
          facts.length = 0;
          changed = false;
          let _g839 = 0;
          G840: {
            const _a841 = sp.cells;
            for (let _i842 = 0; _i842 < _a841.length; _i842++) {
              const v_c = _a841[_i842];
              if (!((b.value(v_c) === 1))) continue;
              _g839++;
            }
          }
          let _c853 = !((v_n === (cl.mines - _g839)));
          if (!_c853) {
            let _q843 = true;
            Q844: {
              _g845.length = 0;
              G846: {
                const _a849 = sp.cells;
                for (let _i850 = 0; _i850 < _a849.length; _i850++) {
                  const v_c = _a849[_i850];
                  if (!((!(b.known(v_c)) && !(v_X.includes(v_c))))) continue;
                  _g845.push(v_c);
                }
              }
              const _a851 = _g845;
              for (let _i852 = 0; _i852 < _a851.length; _i852++) {
                const v_d = _a851[_i852];
                if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q843 = false;
                  break Q844;
                }
              }
            }
            _c853 = _q843;
          }
          let _c880 = _c853;
          if (_c880) {
            let _g854 = 0;
            G855: {
              const _a856 = sp.cells;
              for (let _i857 = 0; _i857 < _a856.length; _i857++) {
                const v_c = _a856[_i857];
                if (!((b.value(v_c) === 1))) continue;
                _g854++;
              }
            }
            let _c868 = (v_n !== (cl.mines - _g854));
            if (_c868) {
              let _g858 = 0;
              G859: {
                const _a860 = sp.cells;
                for (let _i861 = 0; _i861 < _a860.length; _i861++) {
                  const v_c = _a860[_i861];
                  if (!((b.value(v_c) === 1))) continue;
                  _g858++;
                }
              }
              _g862.length = 0;
              G863: {
                const _a866 = sp.cells;
                for (let _i867 = 0; _i867 < _a866.length; _i867++) {
                  const v_c = _a866[_i867];
                  if (!((!(b.known(v_c)) && !(v_X.includes(v_c))))) continue;
                  _g862.push(v_c);
                }
              }
              _c868 = (((cl.mines - _g858) - v_n) === _g862.length);
            }
            let _c879 = !(_c868);
            if (!_c879) {
              let _q869 = true;
              Q870: {
                _g871.length = 0;
                G872: {
                  const _a875 = sp.cells;
                  for (let _i876 = 0; _i876 < _a875.length; _i876++) {
                    const v_c = _a875[_i876];
                    if (!((!(b.known(v_c)) && !(v_X.includes(v_c))))) continue;
                    _g871.push(v_c);
                  }
                }
                const _a877 = _g871;
                for (let _i878 = 0; _i878 < _a877.length; _i878++) {
                  const v_d = _a877[_i878];
                  if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                  if (!(true)) {
                    _q869 = false;
                    break Q870;
                  }
                }
              }
              _c879 = _q869;
            }
            _c880 = _c879;
          }
          if (!(_c880)) return -1;
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
