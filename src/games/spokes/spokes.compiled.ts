// Compiled by `npm run describe` from src/games/spokes/spokes.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, edgeGroups, keptStore, rangeMask, setOf, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  block: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** A diagonal neighbor is across an edge too: the engine builds the
 * space's edges by it. */
export const edgeGeometry = "king";

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "saturation" | "twoOnes" | "exhaustion" | "lineBreaks" | "spareBreaks";

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
  { id: "saturation", tier: 0 },
  { id: "twoOnes", tier: 0 },
  { id: "exhaustion", tier: 0 },
  { id: "lineBreaks", tier: 1 },
  { id: "spareBreaks", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g897: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q880 = true;
  Q881: {
    const _a882 = sp.cells;
    for (let _i883 = 0; _i883 < _a882.length; _i883++) {
      const v_c = _a882[_i883];
      const _h884 = clueAt(cl.number, v_c);
      if (!(!((_h884 !== -1)))) continue;
      let _g885 = 0;
      G886: {
        const _a887 = sp.adj8[v_c];
        for (let _i888 = 0; _i888 < _a887.length; _i888++) {
          const _h889 = (g[sp.adj8Edges[v_c][_i888]] || -1);
          if (!((_h889 === 1))) continue;
          _g885++;
        }
      }
      if (!((_g885 === 0))) {
        _q880 = false;
        break Q881;
      }
    }
  }
  if (!(_q880)) return false;
  let _q890 = true;
  Q891: {
    const _a892 = sp.edges;
    for (let _i893 = 0; _i893 < _a892.length; _i893++) {
      const v_e = _a892[_i893];
      if (!((sp.crossing[v_e] !== -1))) continue;
      const _h894 = (g[v_e] || -1);
      if (!(((_h894 === 2) || ((g[sp.crossing[v_e]] || -1) === 2)))) {
        _q890 = false;
        break Q891;
      }
    }
  }
  if (!(_q890)) return false;
  let _q895 = true;
  Q896: {
    _g897.length = 0;
    G898: {
      const _a901 = sp.edges;
      for (let _i902 = 0; _i902 < _a901.length; _i902++) {
        const v_e = _a901[_i902];
        const _h903 = (g[v_e] || -1);
        if (!((_h903 === 1))) continue;
        _g897.push(v_e);
      }
    }
    const v_L = _g897;
    const _eg910 = edgeGroups(sp, v_L);
    const _a904 = sp.cells;
    for (let _i905 = 0; _i905 < _a904.length; _i905++) {
      const v_a = _a904[_i905];
      const _h906 = clueAt(cl.number, v_a);
      if (!((_h906 !== -1))) continue;
      const _a907 = sp.cells;
      for (let _i908 = 0; _i908 < _a907.length; _i908++) {
        const v_b = _a907[_i908];
        const _h909 = clueAt(cl.number, v_b);
        if (!((_h909 !== -1))) continue;
        if (!((_eg910.of(v_b) === _eg910.of(v_a)))) {
          _q895 = false;
          break Q896;
        }
      }
    }
  }
  if (!(_q895)) return false;
  for (let _k911 = 0; _k911 < cl.number.at.length; _k911++) {
    const _at912 = cl.number.at[_k911];
    let _g914 = 0;
    G915: {
      const _a916 = sp.adj8[_at912];
      for (let _i917 = 0; _i917 < _a916.length; _i917++) {
        const _h918 = (g[sp.adj8Edges[_at912][_i917]] || -1);
        if (!((_h918 === 1))) continue;
        _g914++;
      }
    }
    if (!((_g914 === clueAt(cl.number, _at912)))) return false;
  }
  for (let _k919 = 0; _k919 < cl.block.at.length; _k919++) {
    const _at920 = cl.block.at[_k919];
    let _q922 = true;
    Q923: {
      const _a924 = sp.adj4[_at920];
      for (let _i925 = 0; _i925 < _a924.length; _i925++) {
        const v_a = _a924[_i925];
        const _a926 = sp.adj4[_at920];
        for (let _i927 = 0; _i927 < _a926.length; _i927++) {
          const v_b = _a926[_i927];
          if (!((sp.edgeOf(v_a, v_b) !== -1))) continue;
          const _h928 = (g[sp.edgeOf(v_a, v_b)] || -1);
          if (!((_h928 === 2))) {
            _q922 = false;
            break Q923;
          }
        }
      }
    }
    if (!(_q922)) return false;
  }
  return true;
}

export interface SaturationBinding {
  c: number;
  n: number;
  U: readonly number[];
}

const saturationFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function saturation(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SaturationBinding> | null): number {
  const facts = saturationFacts;
  let fired = 0;
  let changed = false;
  const _a44 = sp.cells;
  for (let _i45 = 0; _i45 < _a44.length; _i45++) {
    const v_c = _a44[_i45];
    let _g46 = 0;
    G47: {
      const _a48 = sp.adj8[v_c];
      for (let _i49 = 0; _i49 < _a48.length; _i49++) {
        if (!(((b.grid[sp.adj8Edges[v_c][_i49]] || -1) === 1))) continue;
        _g46++;
      }
    }
    const v_n = (takes(sp, cl, v_c) - _g46);
    L50: {
      const v_U = ways(b, sp, cl, v_c);
      const _h51 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h51 <= v_n))))) break L50;
      facts.length = 0;
      changed = false;
      let _c57: boolean = ((v_n >= 0) && (_h51 === v_n));
      if (_c57) {
        let _q52 = true;
        Q53: {
          const _a54 = v_U;
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_y = _a54[_i55];
            const _t56 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t56] !== 0)) { if (fire === null) { b.placeAt(_t56, 1); changed = true; } else facts.push(PLACE, _t56, 1); }
            if (!(true)) {
              _q52 = false;
              break Q53;
            }
          }
        }
        _c57 = _q52;
      }
      if (!(_c57)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n, U: v_U }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface TwoOnesBinding {
  N: number;
  e: number;
  a: number;
  b: number;
}

const twoOnesFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function twoOnes(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoOnesBinding> | null): number {
  const facts = twoOnesFacts;
  let fired = 0;
  let changed = false;
  let _g79 = 0;
  G80: {
    const _a81 = sp.cells;
    for (let _i82 = 0; _i82 < _a81.length; _i82++) {
      const v_y = _a81[_i82];
      const _h83 = clueAt(cl.number, v_y);
      if (!((_h83 !== -1))) continue;
      _g79++;
    }
  }
  L84: {
    const v_N = _g79;
    if (!((v_N > 2))) break L84;
    const _a85 = sp.edges;
    for (let _i86 = 0; _i86 < _a85.length; _i86++) {
      const v_e = _a85[_i86];
      const v_a = sp.edgeEnds[2 * v_e];
      L87: {
        const v_b = sp.edgeEnds[2 * v_e + 1];
        let _c100: boolean = ((takes(sp, cl, v_a) === 1) && (takes(sp, cl, v_b) === 1));
        if (_c100) {
          let _c92: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
          if (_c92) {
            let _g88 = 0;
            G89: {
              const _a90 = sp.adj8[v_a];
              for (let _i91 = 0; _i91 < _a90.length; _i91++) {
                if (!(((b.grid[sp.adj8Edges[v_a][_i91]] || -1) === 1))) continue;
                _g88++;
              }
            }
            _c92 = (_g88 < takes(sp, cl, v_a));
          }
          let _c97: boolean = _c92;
          if (_c97) {
            let _g93 = 0;
            G94: {
              const _a95 = sp.adj8[v_b];
              for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                if (!(((b.grid[sp.adj8Edges[v_b][_i96]] || -1) === 1))) continue;
                _g93++;
              }
            }
            _c97 = (_g93 < takes(sp, cl, v_b));
          }
          let _c99: boolean = _c97;
          if (_c99) {
            const _t98 = sp.edgeOf(v_a, v_b);
            _c99 = !(((sp.crossing[_t98] !== -1) && ((b.grid[sp.crossing[_t98]] || -1) === 1)));
          }
          _c100 = _c99;
        }
        if (!(_c100)) break L87;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ N: v_N, e: v_e, a: v_a, b: v_b }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ExhaustionBinding {
  c: number;
  U: readonly number[];
}

const exhaustionFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function exhaustion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExhaustionBinding> | null): number {
  const _g139: number[] = [];
  const facts = exhaustionFacts;
  let fired = 0;
  let changed = false;
  const _a131 = sp.cells;
  for (let _i132 = 0; _i132 < _a131.length; _i132++) {
    const v_c = _a131[_i132];
    const _h133 = clueAt(cl.number, v_c);
    let _c138: boolean = (_h133 !== -1);
    if (_c138) {
      let _g134 = 0;
      G135: {
        const _a136 = sp.adj8[v_c];
        for (let _i137 = 0; _i137 < _a136.length; _i137++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i137]] || -1) === 1))) continue;
          _g134++;
        }
      }
      _c138 = (_g134 === takes(sp, cl, v_c));
    }
    if (!(_c138)) continue;
    _g139.length = 0;
    G140: {
      const _a151 = sp.adj8[v_c];
      for (let _i152 = 0; _i152 < _a151.length; _i152++) {
        const v_y = _a151[_i152];
        let _c158: boolean = !((b.grid[sp.adj8Edges[v_c][_i152]] !== 0));
        if (_c158) {
          let _g153 = 0;
          G154: {
            const _a156 = sp.adj8[v_y];
            for (let _i157 = 0; _i157 < _a156.length; _i157++) {
              if (!(((b.grid[sp.adj8Edges[v_y][_i157]] || -1) === 1))) continue;
              _g153++;
            }
          }
          _c158 = (_g153 < takes(sp, cl, v_y));
        }
        let _c160: boolean = _c158;
        if (_c160) {
          const _t159 = sp.adj8Edges[v_c][_i152];
          _c160 = !(((sp.crossing[_t159] !== -1) && ((b.grid[sp.crossing[_t159]] || -1) === 1)));
        }
        if (!(_c160)) continue;
        _g139.push(v_y);
      }
    }
    L161: {
      const v_U = _g139;
      const _h162 = v_U.length;
      if (!((_h162 > 0))) break L161;
      facts.length = 0;
      changed = false;
      let _q163 = true;
      Q164: {
        const _a165 = v_U;
        for (let _i166 = 0; _i166 < _a165.length; _i166++) {
          const v_y = _a165[_i166];
          const _t167 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t167] !== 0)) { if (fire === null) { b.placeAt(_t167, 2); changed = true; } else facts.push(PLACE, _t167, 2); }
          if (!(true)) {
            _q163 = false;
            break Q164;
          }
        }
      }
      if (!(_q163)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, U: v_U }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface LineBreaksBinding {
  e: number;
  a: number;
  b: number;
  H: readonly number[];
}

const lineBreaksFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding> | null): number {
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _a337 = sp.edges;
  for (let _i338 = 0; _i338 < _a337.length; _i338++) {
    const v_e = _a337[_i338];
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    L339: {
      const v_H = setOf(v_e);
      let _c344: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
      if (_c344) {
        let _g340 = 0;
        G341: {
          const _a342 = sp.adj8[v_a];
          for (let _i343 = 0; _i343 < _a342.length; _i343++) {
            if (!(((b.grid[sp.adj8Edges[v_a][_i343]] || -1) === 1))) continue;
            _g340++;
          }
        }
        _c344 = (_g340 < takes(sp, cl, v_a));
      }
      let _c349: boolean = _c344;
      if (_c349) {
        let _g345 = 0;
        G346: {
          const _a347 = sp.adj8[v_b];
          for (let _i348 = 0; _i348 < _a347.length; _i348++) {
            if (!(((b.grid[sp.adj8Edges[v_b][_i348]] || -1) === 1))) continue;
            _g345++;
          }
        }
        _c349 = (_g345 < takes(sp, cl, v_b));
      }
      let _c351: boolean = _c349;
      if (_c351) {
        const _t350 = sp.edgeOf(v_a, v_b);
        _c351 = !(((sp.crossing[_t350] !== -1) && ((b.grid[sp.crossing[_t350]] || -1) === 1)));
      }
      let _c509: boolean = _c351;
      if (_c509) {
        let _q352 = false;
        Q353: {
          let _g354 = 0;
          G355: {
            const _a356 = sp.adj8[v_a];
            for (let _i357 = 0; _i357 < _a356.length; _i357++) {
              const _t358 = sp.adj8Edges[v_a][_i357];
              if (!((((b.grid[_t358] || -1) === 1) || (v_H.includes(_t358))))) continue;
              _g354++;
            }
          }
          L359: {
            const v_n = (takes(sp, cl, v_a) - _g354);
            if (!((v_n > 0))) break L359;
            let _g360 = 0;
            G361: {
              const _a362 = sp.adj8[v_a];
              for (let _i363 = 0; _i363 < _a362.length; _i363++) {
                const v_y = _a362[_i363];
                let _c370: boolean = (!((b.grid[sp.adj8Edges[v_a][_i363]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_a][_i363])));
                if (_c370) {
                  let _g364 = 0;
                  G365: {
                    const _a367 = sp.adj8[v_y];
                    for (let _i368 = 0; _i368 < _a367.length; _i368++) {
                      const _t369 = sp.adj8Edges[v_y][_i368];
                      if (!((((b.grid[_t369] || -1) === 1) || (v_H.includes(_t369))))) continue;
                      _g364++;
                    }
                  }
                  _c370 = (_g364 < takes(sp, cl, v_y));
                }
                let _c373: boolean = _c370;
                if (_c373) {
                  let _c372: boolean = (sp.crossing[sp.adj8Edges[v_a][_i363]] !== -1);
                  if (_c372) {
                    const _t371 = sp.crossing[sp.adj8Edges[v_a][_i363]];
                    _c372 = (((b.grid[_t371] || -1) === 1) || (v_H.includes(_t371)));
                  }
                  _c373 = !(_c372);
                }
                if (!(_c373)) continue;
                _g360++;
              }
            }
            if ((_g360 < v_n)) {
              _q352 = true;
              break Q353;
            }
          }
        }
        let _c400: boolean = _q352;
        if (!_c400) {
          let _q374 = false;
          Q375: {
            const _a376 = sp.adj8[v_a];
            for (let _i377 = 0; _i377 < _a376.length; _i377++) {
              const v_s = _a376[_i377];
              let _q378 = false;
              Q379: {
                let _g380 = 0;
                G381: {
                  const _a382 = sp.adj8[v_s];
                  for (let _i383 = 0; _i383 < _a382.length; _i383++) {
                    const _t384 = sp.adj8Edges[v_s][_i383];
                    if (!((((b.grid[_t384] || -1) === 1) || (v_H.includes(_t384))))) continue;
                    _g380++;
                  }
                }
                L385: {
                  const v_n = (takes(sp, cl, v_s) - _g380);
                  if (!((v_n > 0))) break L385;
                  let _g386 = 0;
                  G387: {
                    const _a388 = sp.adj8[v_s];
                    for (let _i389 = 0; _i389 < _a388.length; _i389++) {
                      const v_y = _a388[_i389];
                      let _c396: boolean = (!((b.grid[sp.adj8Edges[v_s][_i389]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i389])));
                      if (_c396) {
                        let _g390 = 0;
                        G391: {
                          const _a393 = sp.adj8[v_y];
                          for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                            const _t395 = sp.adj8Edges[v_y][_i394];
                            if (!((((b.grid[_t395] || -1) === 1) || (v_H.includes(_t395))))) continue;
                            _g390++;
                          }
                        }
                        _c396 = (_g390 < takes(sp, cl, v_y));
                      }
                      let _c399: boolean = _c396;
                      if (_c399) {
                        let _c398: boolean = (sp.crossing[sp.adj8Edges[v_s][_i389]] !== -1);
                        if (_c398) {
                          const _t397 = sp.crossing[sp.adj8Edges[v_s][_i389]];
                          _c398 = (((b.grid[_t397] || -1) === 1) || (v_H.includes(_t397)));
                        }
                        _c399 = !(_c398);
                      }
                      if (!(_c399)) continue;
                      _g386++;
                    }
                  }
                  if ((_g386 < v_n)) {
                    _q378 = true;
                    break Q379;
                  }
                }
              }
              if (_q378) {
                _q374 = true;
                break Q375;
              }
            }
          }
          _c400 = _q374;
        }
        let _c429: boolean = _c400;
        if (!_c429) {
          let _g401 = 0;
          G402: {
            const _a403 = sp.adj8[v_a];
            for (let _i404 = 0; _i404 < _a403.length; _i404++) {
              const _t405 = sp.adj8Edges[v_a][_i404];
              if (!((((b.grid[_t405] || -1) === 1) || (v_H.includes(_t405))))) continue;
              _g401++;
            }
          }
          let _c416: boolean = !((_g401 < takes(sp, cl, v_a)));
          if (_c416) {
            let _q406 = true;
            Q407: {
              const _a409 = throughWhere(sp, v_a, (_te408: number): boolean => {  return (((b.grid[_te408] || -1) === 1) || (v_H.includes(_te408))); });
              for (let _i410 = 0; _i410 < _a409.length; _i410++) {
                const v_x = _a409[_i410];
                let _g411 = 0;
                G412: {
                  const _a413 = sp.adj8[v_x];
                  for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                    const _t415 = sp.adj8Edges[v_x][_i414];
                    if (!((((b.grid[_t415] || -1) === 1) || (v_H.includes(_t415))))) continue;
                    _g411++;
                  }
                }
                if (!(!((_g411 < takes(sp, cl, v_x))))) {
                  _q406 = false;
                  break Q407;
                }
              }
            }
            _c416 = _q406;
          }
          let _c428: boolean = _c416;
          if (_c428) {
            let _g417 = 0;
            G418: {
              const _a420 = throughWhere(sp, v_a, (_te419: number): boolean => {  return (((b.grid[_te419] || -1) === 1) || (v_H.includes(_te419))); });
              for (let _i421 = 0; _i421 < _a420.length; _i421++) {
                const v_x = _a420[_i421];
                const _h422 = clueAt(cl.number, v_x);
                if (!((_h422 !== -1))) continue;
                _g417++;
              }
            }
            let _g423 = 0;
            G424: {
              const _a425 = sp.cells;
              for (let _i426 = 0; _i426 < _a425.length; _i426++) {
                const v_y = _a425[_i426];
                const _h427 = clueAt(cl.number, v_y);
                if (!((_h427 !== -1))) continue;
                _g423++;
              }
            }
            _c428 = (_g417 < _g423);
          }
          _c429 = _c428;
        }
        let _c508: boolean = _c429;
        if (!_c508) {
          let _q430 = false;
          Q431: {
            let _g432 = 0;
            G433: {
              const _a434 = sp.adj8[v_b];
              for (let _i435 = 0; _i435 < _a434.length; _i435++) {
                const _t436 = sp.adj8Edges[v_b][_i435];
                if (!((((b.grid[_t436] || -1) === 1) || (v_H.includes(_t436))))) continue;
                _g432++;
              }
            }
            L437: {
              const v_n = (takes(sp, cl, v_b) - _g432);
              if (!((v_n > 0))) break L437;
              let _g438 = 0;
              G439: {
                const _a440 = sp.adj8[v_b];
                for (let _i441 = 0; _i441 < _a440.length; _i441++) {
                  const v_y = _a440[_i441];
                  let _c448: boolean = (!((b.grid[sp.adj8Edges[v_b][_i441]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_b][_i441])));
                  if (_c448) {
                    let _g442 = 0;
                    G443: {
                      const _a445 = sp.adj8[v_y];
                      for (let _i446 = 0; _i446 < _a445.length; _i446++) {
                        const _t447 = sp.adj8Edges[v_y][_i446];
                        if (!((((b.grid[_t447] || -1) === 1) || (v_H.includes(_t447))))) continue;
                        _g442++;
                      }
                    }
                    _c448 = (_g442 < takes(sp, cl, v_y));
                  }
                  let _c451: boolean = _c448;
                  if (_c451) {
                    let _c450: boolean = (sp.crossing[sp.adj8Edges[v_b][_i441]] !== -1);
                    if (_c450) {
                      const _t449 = sp.crossing[sp.adj8Edges[v_b][_i441]];
                      _c450 = (((b.grid[_t449] || -1) === 1) || (v_H.includes(_t449)));
                    }
                    _c451 = !(_c450);
                  }
                  if (!(_c451)) continue;
                  _g438++;
                }
              }
              if ((_g438 < v_n)) {
                _q430 = true;
                break Q431;
              }
            }
          }
          let _c478: boolean = _q430;
          if (!_c478) {
            let _q452 = false;
            Q453: {
              const _a454 = sp.adj8[v_b];
              for (let _i455 = 0; _i455 < _a454.length; _i455++) {
                const v_s = _a454[_i455];
                let _q456 = false;
                Q457: {
                  let _g458 = 0;
                  G459: {
                    const _a460 = sp.adj8[v_s];
                    for (let _i461 = 0; _i461 < _a460.length; _i461++) {
                      const _t462 = sp.adj8Edges[v_s][_i461];
                      if (!((((b.grid[_t462] || -1) === 1) || (v_H.includes(_t462))))) continue;
                      _g458++;
                    }
                  }
                  L463: {
                    const v_n = (takes(sp, cl, v_s) - _g458);
                    if (!((v_n > 0))) break L463;
                    let _g464 = 0;
                    G465: {
                      const _a466 = sp.adj8[v_s];
                      for (let _i467 = 0; _i467 < _a466.length; _i467++) {
                        const v_y = _a466[_i467];
                        let _c474: boolean = (!((b.grid[sp.adj8Edges[v_s][_i467]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i467])));
                        if (_c474) {
                          let _g468 = 0;
                          G469: {
                            const _a471 = sp.adj8[v_y];
                            for (let _i472 = 0; _i472 < _a471.length; _i472++) {
                              const _t473 = sp.adj8Edges[v_y][_i472];
                              if (!((((b.grid[_t473] || -1) === 1) || (v_H.includes(_t473))))) continue;
                              _g468++;
                            }
                          }
                          _c474 = (_g468 < takes(sp, cl, v_y));
                        }
                        let _c477: boolean = _c474;
                        if (_c477) {
                          let _c476: boolean = (sp.crossing[sp.adj8Edges[v_s][_i467]] !== -1);
                          if (_c476) {
                            const _t475 = sp.crossing[sp.adj8Edges[v_s][_i467]];
                            _c476 = (((b.grid[_t475] || -1) === 1) || (v_H.includes(_t475)));
                          }
                          _c477 = !(_c476);
                        }
                        if (!(_c477)) continue;
                        _g464++;
                      }
                    }
                    if ((_g464 < v_n)) {
                      _q456 = true;
                      break Q457;
                    }
                  }
                }
                if (_q456) {
                  _q452 = true;
                  break Q453;
                }
              }
            }
            _c478 = _q452;
          }
          let _c507: boolean = _c478;
          if (!_c507) {
            let _g479 = 0;
            G480: {
              const _a481 = sp.adj8[v_b];
              for (let _i482 = 0; _i482 < _a481.length; _i482++) {
                const _t483 = sp.adj8Edges[v_b][_i482];
                if (!((((b.grid[_t483] || -1) === 1) || (v_H.includes(_t483))))) continue;
                _g479++;
              }
            }
            let _c494: boolean = !((_g479 < takes(sp, cl, v_b)));
            if (_c494) {
              let _q484 = true;
              Q485: {
                const _a487 = throughWhere(sp, v_b, (_te486: number): boolean => {  return (((b.grid[_te486] || -1) === 1) || (v_H.includes(_te486))); });
                for (let _i488 = 0; _i488 < _a487.length; _i488++) {
                  const v_x = _a487[_i488];
                  let _g489 = 0;
                  G490: {
                    const _a491 = sp.adj8[v_x];
                    for (let _i492 = 0; _i492 < _a491.length; _i492++) {
                      const _t493 = sp.adj8Edges[v_x][_i492];
                      if (!((((b.grid[_t493] || -1) === 1) || (v_H.includes(_t493))))) continue;
                      _g489++;
                    }
                  }
                  if (!(!((_g489 < takes(sp, cl, v_x))))) {
                    _q484 = false;
                    break Q485;
                  }
                }
              }
              _c494 = _q484;
            }
            let _c506: boolean = _c494;
            if (_c506) {
              let _g495 = 0;
              G496: {
                const _a498 = throughWhere(sp, v_b, (_te497: number): boolean => {  return (((b.grid[_te497] || -1) === 1) || (v_H.includes(_te497))); });
                for (let _i499 = 0; _i499 < _a498.length; _i499++) {
                  const v_x = _a498[_i499];
                  const _h500 = clueAt(cl.number, v_x);
                  if (!((_h500 !== -1))) continue;
                  _g495++;
                }
              }
              let _g501 = 0;
              G502: {
                const _a503 = sp.cells;
                for (let _i504 = 0; _i504 < _a503.length; _i504++) {
                  const v_y = _a503[_i504];
                  const _h505 = clueAt(cl.number, v_y);
                  if (!((_h505 !== -1))) continue;
                  _g501++;
                }
              }
              _c506 = (_g495 < _g501);
            }
            _c507 = _c506;
          }
          _c508 = _c507;
        }
        _c509 = _c508;
      }
      if (!(_c509)) break L339;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, H: v_H }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SpareBreaksBinding {
  c: number;
  U: readonly number[];
  y: number;
  H: readonly number[];
}

const spareBreaksFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function spareBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SpareBreaksBinding> | null): number {
  const _g707: number[] = [];
  const facts = spareBreaksFacts;
  let fired = 0;
  let changed = false;
  const _a692 = sp.cells;
  for (let _i693 = 0; _i693 < _a692.length; _i693++) {
    const v_c = _a692[_i693];
    L694: {
      const v_U = ways(b, sp, cl, v_c);
      const _h699 = v_U.length;
      let _g695 = 0;
      G696: {
        const _a697 = sp.adj8[v_c];
        for (let _i698 = 0; _i698 < _a697.length; _i698++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i698]] || -1) === 1))) continue;
          _g695++;
        }
      }
      let _c704: boolean = (_g695 < takes(sp, cl, v_c));
      if (_c704) {
        let _g700 = 0;
        G701: {
          const _a702 = sp.adj8[v_c];
          for (let _i703 = 0; _i703 < _a702.length; _i703++) {
            if (!(((b.grid[sp.adj8Edges[v_c][_i703]] || -1) === 1))) continue;
            _g700++;
          }
        }
        _c704 = (_h699 === ((takes(sp, cl, v_c) - _g700) + 1));
      }
      if (!(_c704)) break L694;
      const _a705 = v_U;
      for (let _i706 = 0; _i706 < _a705.length; _i706++) {
        const v_y = _a705[_i706];
        _g707.length = 0;
        G708: {
          const _a711 = v_U;
          for (let _i712 = 0; _i712 < _a711.length; _i712++) {
            const v_x = _a711[_i712];
            if (!((v_x !== v_y))) continue;
            const _t713 = sp.edgeOf(v_c, v_x);
            if (!_g707.includes(_t713)) _g707.push(_t713);
          }
        }
        L714: {
          const v_H = _g707;
          let _c878: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
          if (_c878) {
            let _q715 = false;
            Q716: {
              let _g717 = 0;
              G718: {
                const _a719 = sp.adj8[v_c];
                for (let _i720 = 0; _i720 < _a719.length; _i720++) {
                  const _t721 = sp.adj8Edges[v_c][_i720];
                  if (!((((b.grid[_t721] || -1) === 1) || (v_H.includes(_t721))))) continue;
                  _g717++;
                }
              }
              L722: {
                const v_n = (takes(sp, cl, v_c) - _g717);
                if (!((v_n > 0))) break L722;
                let _g723 = 0;
                G724: {
                  const _a725 = sp.adj8[v_c];
                  for (let _i726 = 0; _i726 < _a725.length; _i726++) {
                    const v_y = _a725[_i726];
                    let _c733: boolean = (!((b.grid[sp.adj8Edges[v_c][_i726]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_c][_i726])));
                    if (_c733) {
                      let _g727 = 0;
                      G728: {
                        const _a730 = sp.adj8[v_y];
                        for (let _i731 = 0; _i731 < _a730.length; _i731++) {
                          const _t732 = sp.adj8Edges[v_y][_i731];
                          if (!((((b.grid[_t732] || -1) === 1) || (v_H.includes(_t732))))) continue;
                          _g727++;
                        }
                      }
                      _c733 = (_g727 < takes(sp, cl, v_y));
                    }
                    let _c736: boolean = _c733;
                    if (_c736) {
                      let _c735: boolean = (sp.crossing[sp.adj8Edges[v_c][_i726]] !== -1);
                      if (_c735) {
                        const _t734 = sp.crossing[sp.adj8Edges[v_c][_i726]];
                        _c735 = (((b.grid[_t734] || -1) === 1) || (v_H.includes(_t734)));
                      }
                      _c736 = !(_c735);
                    }
                    if (!(_c736)) continue;
                    _g723++;
                  }
                }
                if ((_g723 < v_n)) {
                  _q715 = true;
                  break Q716;
                }
              }
            }
            let _c763: boolean = _q715;
            if (!_c763) {
              let _q737 = false;
              Q738: {
                const _a739 = sp.adj8[v_c];
                for (let _i740 = 0; _i740 < _a739.length; _i740++) {
                  const v_s = _a739[_i740];
                  let _q741 = false;
                  Q742: {
                    let _g743 = 0;
                    G744: {
                      const _a745 = sp.adj8[v_s];
                      for (let _i746 = 0; _i746 < _a745.length; _i746++) {
                        const _t747 = sp.adj8Edges[v_s][_i746];
                        if (!((((b.grid[_t747] || -1) === 1) || (v_H.includes(_t747))))) continue;
                        _g743++;
                      }
                    }
                    L748: {
                      const v_n = (takes(sp, cl, v_s) - _g743);
                      if (!((v_n > 0))) break L748;
                      let _g749 = 0;
                      G750: {
                        const _a751 = sp.adj8[v_s];
                        for (let _i752 = 0; _i752 < _a751.length; _i752++) {
                          const v_y = _a751[_i752];
                          let _c759: boolean = (!((b.grid[sp.adj8Edges[v_s][_i752]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i752])));
                          if (_c759) {
                            let _g753 = 0;
                            G754: {
                              const _a756 = sp.adj8[v_y];
                              for (let _i757 = 0; _i757 < _a756.length; _i757++) {
                                const _t758 = sp.adj8Edges[v_y][_i757];
                                if (!((((b.grid[_t758] || -1) === 1) || (v_H.includes(_t758))))) continue;
                                _g753++;
                              }
                            }
                            _c759 = (_g753 < takes(sp, cl, v_y));
                          }
                          let _c762: boolean = _c759;
                          if (_c762) {
                            let _c761: boolean = (sp.crossing[sp.adj8Edges[v_s][_i752]] !== -1);
                            if (_c761) {
                              const _t760 = sp.crossing[sp.adj8Edges[v_s][_i752]];
                              _c761 = (((b.grid[_t760] || -1) === 1) || (v_H.includes(_t760)));
                            }
                            _c762 = !(_c761);
                          }
                          if (!(_c762)) continue;
                          _g749++;
                        }
                      }
                      if ((_g749 < v_n)) {
                        _q741 = true;
                        break Q742;
                      }
                    }
                  }
                  if (_q741) {
                    _q737 = true;
                    break Q738;
                  }
                }
              }
              _c763 = _q737;
            }
            let _c792: boolean = _c763;
            if (!_c792) {
              let _g764 = 0;
              G765: {
                const _a766 = sp.adj8[v_c];
                for (let _i767 = 0; _i767 < _a766.length; _i767++) {
                  const _t768 = sp.adj8Edges[v_c][_i767];
                  if (!((((b.grid[_t768] || -1) === 1) || (v_H.includes(_t768))))) continue;
                  _g764++;
                }
              }
              let _c779: boolean = !((_g764 < takes(sp, cl, v_c)));
              if (_c779) {
                let _q769 = true;
                Q770: {
                  const _a772 = throughWhere(sp, v_c, (_te771: number): boolean => {  return (((b.grid[_te771] || -1) === 1) || (v_H.includes(_te771))); });
                  for (let _i773 = 0; _i773 < _a772.length; _i773++) {
                    const v_x = _a772[_i773];
                    let _g774 = 0;
                    G775: {
                      const _a776 = sp.adj8[v_x];
                      for (let _i777 = 0; _i777 < _a776.length; _i777++) {
                        const _t778 = sp.adj8Edges[v_x][_i777];
                        if (!((((b.grid[_t778] || -1) === 1) || (v_H.includes(_t778))))) continue;
                        _g774++;
                      }
                    }
                    if (!(!((_g774 < takes(sp, cl, v_x))))) {
                      _q769 = false;
                      break Q770;
                    }
                  }
                }
                _c779 = _q769;
              }
              let _c791: boolean = _c779;
              if (_c791) {
                let _g780 = 0;
                G781: {
                  const _a783 = throughWhere(sp, v_c, (_te782: number): boolean => {  return (((b.grid[_te782] || -1) === 1) || (v_H.includes(_te782))); });
                  for (let _i784 = 0; _i784 < _a783.length; _i784++) {
                    const v_x = _a783[_i784];
                    const _h785 = clueAt(cl.number, v_x);
                    if (!((_h785 !== -1))) continue;
                    _g780++;
                  }
                }
                let _g786 = 0;
                G787: {
                  const _a788 = sp.cells;
                  for (let _i789 = 0; _i789 < _a788.length; _i789++) {
                    const v_y = _a788[_i789];
                    const _h790 = clueAt(cl.number, v_y);
                    if (!((_h790 !== -1))) continue;
                    _g786++;
                  }
                }
                _c791 = (_g780 < _g786);
              }
              _c792 = _c791;
            }
            let _c877: boolean = _c792;
            if (!_c877) {
              let _q793 = false;
              Q794: {
                const _a795 = v_U;
                for (let _i796 = 0; _i796 < _a795.length; _i796++) {
                  const v_x = _a795[_i796];
                  if (!((v_x !== v_y))) continue;
                  let _q797 = false;
                  Q798: {
                    let _g799 = 0;
                    G800: {
                      const _a801 = sp.adj8[v_x];
                      for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                        const _t803 = sp.adj8Edges[v_x][_i802];
                        if (!((((b.grid[_t803] || -1) === 1) || (v_H.includes(_t803))))) continue;
                        _g799++;
                      }
                    }
                    L804: {
                      const v_n = (takes(sp, cl, v_x) - _g799);
                      if (!((v_n > 0))) break L804;
                      let _g805 = 0;
                      G806: {
                        const _a807 = sp.adj8[v_x];
                        for (let _i808 = 0; _i808 < _a807.length; _i808++) {
                          const v_y = _a807[_i808];
                          let _c815: boolean = (!((b.grid[sp.adj8Edges[v_x][_i808]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_x][_i808])));
                          if (_c815) {
                            let _g809 = 0;
                            G810: {
                              const _a812 = sp.adj8[v_y];
                              for (let _i813 = 0; _i813 < _a812.length; _i813++) {
                                const _t814 = sp.adj8Edges[v_y][_i813];
                                if (!((((b.grid[_t814] || -1) === 1) || (v_H.includes(_t814))))) continue;
                                _g809++;
                              }
                            }
                            _c815 = (_g809 < takes(sp, cl, v_y));
                          }
                          let _c818: boolean = _c815;
                          if (_c818) {
                            let _c817: boolean = (sp.crossing[sp.adj8Edges[v_x][_i808]] !== -1);
                            if (_c817) {
                              const _t816 = sp.crossing[sp.adj8Edges[v_x][_i808]];
                              _c817 = (((b.grid[_t816] || -1) === 1) || (v_H.includes(_t816)));
                            }
                            _c818 = !(_c817);
                          }
                          if (!(_c818)) continue;
                          _g805++;
                        }
                      }
                      if ((_g805 < v_n)) {
                        _q797 = true;
                        break Q798;
                      }
                    }
                  }
                  let _c845: boolean = _q797;
                  if (!_c845) {
                    let _q819 = false;
                    Q820: {
                      const _a821 = sp.adj8[v_x];
                      for (let _i822 = 0; _i822 < _a821.length; _i822++) {
                        const v_s = _a821[_i822];
                        let _q823 = false;
                        Q824: {
                          let _g825 = 0;
                          G826: {
                            const _a827 = sp.adj8[v_s];
                            for (let _i828 = 0; _i828 < _a827.length; _i828++) {
                              const _t829 = sp.adj8Edges[v_s][_i828];
                              if (!((((b.grid[_t829] || -1) === 1) || (v_H.includes(_t829))))) continue;
                              _g825++;
                            }
                          }
                          L830: {
                            const v_n = (takes(sp, cl, v_s) - _g825);
                            if (!((v_n > 0))) break L830;
                            let _g831 = 0;
                            G832: {
                              const _a833 = sp.adj8[v_s];
                              for (let _i834 = 0; _i834 < _a833.length; _i834++) {
                                const v_y = _a833[_i834];
                                let _c841: boolean = (!((b.grid[sp.adj8Edges[v_s][_i834]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i834])));
                                if (_c841) {
                                  let _g835 = 0;
                                  G836: {
                                    const _a838 = sp.adj8[v_y];
                                    for (let _i839 = 0; _i839 < _a838.length; _i839++) {
                                      const _t840 = sp.adj8Edges[v_y][_i839];
                                      if (!((((b.grid[_t840] || -1) === 1) || (v_H.includes(_t840))))) continue;
                                      _g835++;
                                    }
                                  }
                                  _c841 = (_g835 < takes(sp, cl, v_y));
                                }
                                let _c844: boolean = _c841;
                                if (_c844) {
                                  let _c843: boolean = (sp.crossing[sp.adj8Edges[v_s][_i834]] !== -1);
                                  if (_c843) {
                                    const _t842 = sp.crossing[sp.adj8Edges[v_s][_i834]];
                                    _c843 = (((b.grid[_t842] || -1) === 1) || (v_H.includes(_t842)));
                                  }
                                  _c844 = !(_c843);
                                }
                                if (!(_c844)) continue;
                                _g831++;
                              }
                            }
                            if ((_g831 < v_n)) {
                              _q823 = true;
                              break Q824;
                            }
                          }
                        }
                        if (_q823) {
                          _q819 = true;
                          break Q820;
                        }
                      }
                    }
                    _c845 = _q819;
                  }
                  let _c876: boolean = _c845;
                  if (!_c876) {
                    let _g846 = 0;
                    G847: {
                      const _a848 = sp.adj8[v_x];
                      for (let _i849 = 0; _i849 < _a848.length; _i849++) {
                        const _t850 = sp.adj8Edges[v_x][_i849];
                        if (!((((b.grid[_t850] || -1) === 1) || (v_H.includes(_t850))))) continue;
                        _g846++;
                      }
                    }
                    let _c862: boolean = !((_g846 < takes(sp, cl, v_x)));
                    if (_c862) {
                      let _q851 = true;
                      Q852: {
                        const _a855 = throughWhere(sp, v_x, (_te854: number): boolean => {  return (((b.grid[_te854] || -1) === 1) || (v_H.includes(_te854))); });
                        for (let _i856 = 0; _i856 < _a855.length; _i856++) {
                          const v_x_853 = _a855[_i856];
                          let _g857 = 0;
                          G858: {
                            const _a859 = sp.adj8[v_x_853];
                            for (let _i860 = 0; _i860 < _a859.length; _i860++) {
                              const _t861 = sp.adj8Edges[v_x_853][_i860];
                              if (!((((b.grid[_t861] || -1) === 1) || (v_H.includes(_t861))))) continue;
                              _g857++;
                            }
                          }
                          if (!(!((_g857 < takes(sp, cl, v_x_853))))) {
                            _q851 = false;
                            break Q852;
                          }
                        }
                      }
                      _c862 = _q851;
                    }
                    let _c875: boolean = _c862;
                    if (_c875) {
                      let _g863 = 0;
                      G864: {
                        const _a867 = throughWhere(sp, v_x, (_te866: number): boolean => {  return (((b.grid[_te866] || -1) === 1) || (v_H.includes(_te866))); });
                        for (let _i868 = 0; _i868 < _a867.length; _i868++) {
                          const v_x_865 = _a867[_i868];
                          const _h869 = clueAt(cl.number, v_x_865);
                          if (!((_h869 !== -1))) continue;
                          _g863++;
                        }
                      }
                      let _g870 = 0;
                      G871: {
                        const _a872 = sp.cells;
                        for (let _i873 = 0; _i873 < _a872.length; _i873++) {
                          const v_y = _a872[_i873];
                          const _h874 = clueAt(cl.number, v_y);
                          if (!((_h874 !== -1))) continue;
                          _g870++;
                        }
                      }
                      _c875 = (_g863 < _g870);
                    }
                    _c876 = _c875;
                  }
                  if (_c876) {
                    _q793 = true;
                    break Q794;
                  }
                }
              }
              _c877 = _q793;
            }
            _c878 = _c877;
          }
          if (!(_c878)) break L714;
          facts.length = 0;
          changed = false;
          const _t879 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t879] !== 0)) { if (fire === null) { b.placeAt(_t879, 1); changed = true; } else facts.push(PLACE, _t879, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, U: v_U, y: v_y, H: v_H }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const takesKept = keptStore<number>();

/** `takes(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function takes(_sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = takesKept.board(cl);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g3 = 0;
  G4: {
    const _a5 = setOf(v_c);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_k = _a5[_i6];
      if (!((clueAt(cl.number, v_k) !== -1))) continue;
      _g3 += clueAt(cl.number, v_k);
    }
  }
  const _made = _g3;
  _kept[v_c] = _made;
  return _made;
}

const waysKept = keptStore<readonly number[]>();

/** `ways(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ways(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = waysKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g11: number[] = [];
  G12: {
    const _a28 = sp.adj8[v_c];
    for (let _i29 = 0; _i29 < _a28.length; _i29++) {
      const v_y = _a28[_i29];
      let _c34: boolean = !((b.grid[sp.adj8Edges[v_c][_i29]] !== 0));
      if (_c34) {
        let _g30 = 0;
        G31: {
          const _a32 = sp.adj8[v_c];
          for (let _i33 = 0; _i33 < _a32.length; _i33++) {
            if (!(((b.grid[sp.adj8Edges[v_c][_i33]] || -1) === 1))) continue;
            _g30++;
          }
        }
        _c34 = (_g30 < takes(sp, cl, v_c));
      }
      let _c40: boolean = _c34;
      if (_c40) {
        let _g35 = 0;
        G36: {
          const _a38 = sp.adj8[v_y];
          for (let _i39 = 0; _i39 < _a38.length; _i39++) {
            if (!(((b.grid[sp.adj8Edges[v_y][_i39]] || -1) === 1))) continue;
            _g35++;
          }
        }
        _c40 = (_g35 < takes(sp, cl, v_y));
      }
      let _c42: boolean = _c40;
      if (_c42) {
        const _t41 = sp.adj8Edges[v_c][_i29];
        _c42 = !(((sp.crossing[_t41] !== -1) && ((b.grid[sp.crossing[_t41]] || -1) === 1)));
      }
      if (!(_c42)) continue;
      _g11.push(v_y);
    }
  }
  const _made = _g11;
  _kept[v_c] = _made;
  return _made;
}
