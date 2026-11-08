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
  const _g891: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q874 = true;
  Q875: {
    const _a876 = sp.cells;
    for (let _i877 = 0; _i877 < _a876.length; _i877++) {
      const v_c = _a876[_i877];
      const _h878 = clueAt(cl.number, v_c);
      if (!(!((_h878 !== -1)))) continue;
      let _g879 = 0;
      G880: {
        const _a881 = sp.adj8[v_c];
        for (let _i882 = 0; _i882 < _a881.length; _i882++) {
          const _h883 = (g[sp.adj8Edges[v_c][_i882]] || -1);
          if (!((_h883 === 1))) continue;
          _g879++;
        }
      }
      if (!((_g879 === 0))) {
        _q874 = false;
        break Q875;
      }
    }
  }
  if (!(_q874)) return false;
  let _q884 = true;
  Q885: {
    const _a886 = sp.edges;
    for (let _i887 = 0; _i887 < _a886.length; _i887++) {
      const v_e = _a886[_i887];
      if (!((sp.crossing[v_e] !== -1))) continue;
      const _h888 = (g[v_e] || -1);
      if (!(((_h888 === 2) || ((g[sp.crossing[v_e]] || -1) === 2)))) {
        _q884 = false;
        break Q885;
      }
    }
  }
  if (!(_q884)) return false;
  let _q889 = true;
  Q890: {
    _g891.length = 0;
    G892: {
      const _a895 = sp.edges;
      for (let _i896 = 0; _i896 < _a895.length; _i896++) {
        const v_e = _a895[_i896];
        const _h897 = (g[v_e] || -1);
        if (!((_h897 === 1))) continue;
        _g891.push(v_e);
      }
    }
    const v_L = _g891;
    const _eg904 = edgeGroups(sp, v_L);
    const _a898 = sp.cells;
    for (let _i899 = 0; _i899 < _a898.length; _i899++) {
      const v_a = _a898[_i899];
      const _h900 = clueAt(cl.number, v_a);
      if (!((_h900 !== -1))) continue;
      const _a901 = sp.cells;
      for (let _i902 = 0; _i902 < _a901.length; _i902++) {
        const v_b = _a901[_i902];
        const _h903 = clueAt(cl.number, v_b);
        if (!((_h903 !== -1))) continue;
        if (!((_eg904.of(v_b) === _eg904.of(v_a)))) {
          _q889 = false;
          break Q890;
        }
      }
    }
  }
  if (!(_q889)) return false;
  for (let _k905 = 0; _k905 < cl.number.at.length; _k905++) {
    const _at906 = cl.number.at[_k905];
    let _g908 = 0;
    G909: {
      const _a910 = sp.adj8[_at906];
      for (let _i911 = 0; _i911 < _a910.length; _i911++) {
        const _h912 = (g[sp.adj8Edges[_at906][_i911]] || -1);
        if (!((_h912 === 1))) continue;
        _g908++;
      }
    }
    if (!((_g908 === clueAt(cl.number, _at906)))) return false;
  }
  for (let _k913 = 0; _k913 < cl.block.at.length; _k913++) {
    const _at914 = cl.block.at[_k913];
    let _q916 = true;
    Q917: {
      const _a918 = sp.adj4[_at914];
      for (let _i919 = 0; _i919 < _a918.length; _i919++) {
        const v_a = _a918[_i919];
        const _a920 = sp.adj4[_at914];
        for (let _i921 = 0; _i921 < _a920.length; _i921++) {
          const v_b = _a920[_i921];
          if (!((sp.edgeOf(v_a, v_b) !== -1))) continue;
          const _h922 = (g[sp.edgeOf(v_a, v_b)] || -1);
          if (!((_h922 === 2))) {
            _q916 = false;
            break Q917;
          }
        }
      }
    }
    if (!(_q916)) return false;
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
  const _a43 = sp.cells;
  for (let _i44 = 0; _i44 < _a43.length; _i44++) {
    const v_c = _a43[_i44];
    let _g45 = 0;
    G46: {
      const _a47 = sp.adj8[v_c];
      for (let _i48 = 0; _i48 < _a47.length; _i48++) {
        if (!(((b.grid[sp.adj8Edges[v_c][_i48]] || -1) === 1))) continue;
        _g45++;
      }
    }
    const v_n = (takes(sp, cl, v_c) - _g45);
    L49: {
      const v_U = ways(b, sp, cl, v_c);
      const _h50 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h50 <= v_n))))) break L49;
      facts.length = 0;
      changed = false;
      let _c56: boolean = ((v_n >= 0) && (_h50 === v_n));
      if (_c56) {
        let _q51 = true;
        Q52: {
          const _a53 = v_U;
          for (let _i54 = 0; _i54 < _a53.length; _i54++) {
            const v_y = _a53[_i54];
            const _t55 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t55] !== 0)) { if (fire === null) { b.placeAt(_t55, 1); changed = true; } else facts.push(PLACE, _t55, 1); }
            if (!(true)) {
              _q51 = false;
              break Q52;
            }
          }
        }
        _c56 = _q51;
      }
      if (!(_c56)) return -1;
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
  let _g78 = 0;
  G79: {
    const _a80 = sp.cells;
    for (let _i81 = 0; _i81 < _a80.length; _i81++) {
      const v_y = _a80[_i81];
      const _h82 = clueAt(cl.number, v_y);
      if (!((_h82 !== -1))) continue;
      _g78++;
    }
  }
  L83: {
    const v_N = _g78;
    if (!((v_N > 2))) break L83;
    const _a84 = sp.edges;
    for (let _i85 = 0; _i85 < _a84.length; _i85++) {
      const v_e = _a84[_i85];
      const v_a = sp.edgeEnds[2 * v_e];
      L86: {
        const v_b = sp.edgeEnds[2 * v_e + 1];
        let _c99: boolean = ((takes(sp, cl, v_a) === 1) && (takes(sp, cl, v_b) === 1));
        if (_c99) {
          let _c91: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
          if (_c91) {
            let _g87 = 0;
            G88: {
              const _a89 = sp.adj8[v_a];
              for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                if (!(((b.grid[sp.adj8Edges[v_a][_i90]] || -1) === 1))) continue;
                _g87++;
              }
            }
            _c91 = (_g87 < takes(sp, cl, v_a));
          }
          let _c96: boolean = _c91;
          if (_c96) {
            let _g92 = 0;
            G93: {
              const _a94 = sp.adj8[v_b];
              for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                if (!(((b.grid[sp.adj8Edges[v_b][_i95]] || -1) === 1))) continue;
                _g92++;
              }
            }
            _c96 = (_g92 < takes(sp, cl, v_b));
          }
          let _c98: boolean = _c96;
          if (_c98) {
            const _t97 = sp.edgeOf(v_a, v_b);
            _c98 = !(((sp.crossing[_t97] !== -1) && ((b.grid[sp.crossing[_t97]] || -1) === 1)));
          }
          _c99 = _c98;
        }
        if (!(_c99)) break L86;
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
  const _g138: number[] = [];
  const facts = exhaustionFacts;
  let fired = 0;
  let changed = false;
  const _a130 = sp.cells;
  for (let _i131 = 0; _i131 < _a130.length; _i131++) {
    const v_c = _a130[_i131];
    const _h132 = clueAt(cl.number, v_c);
    let _c137: boolean = (_h132 !== -1);
    if (_c137) {
      let _g133 = 0;
      G134: {
        const _a135 = sp.adj8[v_c];
        for (let _i136 = 0; _i136 < _a135.length; _i136++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i136]] || -1) === 1))) continue;
          _g133++;
        }
      }
      _c137 = (_g133 === takes(sp, cl, v_c));
    }
    if (!(_c137)) continue;
    _g138.length = 0;
    G139: {
      const _a150 = sp.adj8[v_c];
      for (let _i151 = 0; _i151 < _a150.length; _i151++) {
        const v_y = _a150[_i151];
        let _c157: boolean = !((b.grid[sp.adj8Edges[v_c][_i151]] !== 0));
        if (_c157) {
          let _g152 = 0;
          G153: {
            const _a155 = sp.adj8[v_y];
            for (let _i156 = 0; _i156 < _a155.length; _i156++) {
              if (!(((b.grid[sp.adj8Edges[v_y][_i156]] || -1) === 1))) continue;
              _g152++;
            }
          }
          _c157 = (_g152 < takes(sp, cl, v_y));
        }
        let _c159: boolean = _c157;
        if (_c159) {
          const _t158 = sp.adj8Edges[v_c][_i151];
          _c159 = !(((sp.crossing[_t158] !== -1) && ((b.grid[sp.crossing[_t158]] || -1) === 1)));
        }
        if (!(_c159)) continue;
        _g138.push(v_y);
      }
    }
    L160: {
      const v_U = _g138;
      const _h161 = v_U.length;
      if (!((_h161 > 0))) break L160;
      facts.length = 0;
      changed = false;
      let _q162 = true;
      Q163: {
        const _a164 = v_U;
        for (let _i165 = 0; _i165 < _a164.length; _i165++) {
          const v_y = _a164[_i165];
          const _t166 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t166] !== 0)) { if (fire === null) { b.placeAt(_t166, 2); changed = true; } else facts.push(PLACE, _t166, 2); }
          if (!(true)) {
            _q162 = false;
            break Q163;
          }
        }
      }
      if (!(_q162)) return -1;
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
  const _a336 = sp.edges;
  for (let _i337 = 0; _i337 < _a336.length; _i337++) {
    const v_e = _a336[_i337];
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    L338: {
      const v_H = setOf(v_e);
      let _c343: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
      if (_c343) {
        let _g339 = 0;
        G340: {
          const _a341 = sp.adj8[v_a];
          for (let _i342 = 0; _i342 < _a341.length; _i342++) {
            if (!(((b.grid[sp.adj8Edges[v_a][_i342]] || -1) === 1))) continue;
            _g339++;
          }
        }
        _c343 = (_g339 < takes(sp, cl, v_a));
      }
      let _c348: boolean = _c343;
      if (_c348) {
        let _g344 = 0;
        G345: {
          const _a346 = sp.adj8[v_b];
          for (let _i347 = 0; _i347 < _a346.length; _i347++) {
            if (!(((b.grid[sp.adj8Edges[v_b][_i347]] || -1) === 1))) continue;
            _g344++;
          }
        }
        _c348 = (_g344 < takes(sp, cl, v_b));
      }
      let _c350: boolean = _c348;
      if (_c350) {
        const _t349 = sp.edgeOf(v_a, v_b);
        _c350 = !(((sp.crossing[_t349] !== -1) && ((b.grid[sp.crossing[_t349]] || -1) === 1)));
      }
      let _c508: boolean = _c350;
      if (_c508) {
        let _q351 = false;
        Q352: {
          let _g353 = 0;
          G354: {
            const _a355 = sp.adj8[v_a];
            for (let _i356 = 0; _i356 < _a355.length; _i356++) {
              const _t357 = sp.adj8Edges[v_a][_i356];
              if (!((((b.grid[_t357] || -1) === 1) || (v_H.includes(_t357))))) continue;
              _g353++;
            }
          }
          L358: {
            const v_n = (takes(sp, cl, v_a) - _g353);
            if (!((v_n > 0))) break L358;
            let _g359 = 0;
            G360: {
              const _a361 = sp.adj8[v_a];
              for (let _i362 = 0; _i362 < _a361.length; _i362++) {
                const v_y = _a361[_i362];
                let _c369: boolean = (!((b.grid[sp.adj8Edges[v_a][_i362]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_a][_i362])));
                if (_c369) {
                  let _g363 = 0;
                  G364: {
                    const _a366 = sp.adj8[v_y];
                    for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                      const _t368 = sp.adj8Edges[v_y][_i367];
                      if (!((((b.grid[_t368] || -1) === 1) || (v_H.includes(_t368))))) continue;
                      _g363++;
                    }
                  }
                  _c369 = (_g363 < takes(sp, cl, v_y));
                }
                let _c372: boolean = _c369;
                if (_c372) {
                  let _c371: boolean = (sp.crossing[sp.adj8Edges[v_a][_i362]] !== -1);
                  if (_c371) {
                    const _t370 = sp.crossing[sp.adj8Edges[v_a][_i362]];
                    _c371 = (((b.grid[_t370] || -1) === 1) || (v_H.includes(_t370)));
                  }
                  _c372 = !(_c371);
                }
                if (!(_c372)) continue;
                _g359++;
              }
            }
            if ((_g359 < v_n)) {
              _q351 = true;
              break Q352;
            }
          }
        }
        let _c399: boolean = _q351;
        if (!_c399) {
          let _q373 = false;
          Q374: {
            const _a375 = sp.adj8[v_a];
            for (let _i376 = 0; _i376 < _a375.length; _i376++) {
              const v_s = _a375[_i376];
              let _q377 = false;
              Q378: {
                let _g379 = 0;
                G380: {
                  const _a381 = sp.adj8[v_s];
                  for (let _i382 = 0; _i382 < _a381.length; _i382++) {
                    const _t383 = sp.adj8Edges[v_s][_i382];
                    if (!((((b.grid[_t383] || -1) === 1) || (v_H.includes(_t383))))) continue;
                    _g379++;
                  }
                }
                L384: {
                  const v_n = (takes(sp, cl, v_s) - _g379);
                  if (!((v_n > 0))) break L384;
                  let _g385 = 0;
                  G386: {
                    const _a387 = sp.adj8[v_s];
                    for (let _i388 = 0; _i388 < _a387.length; _i388++) {
                      const v_y = _a387[_i388];
                      let _c395: boolean = (!((b.grid[sp.adj8Edges[v_s][_i388]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i388])));
                      if (_c395) {
                        let _g389 = 0;
                        G390: {
                          const _a392 = sp.adj8[v_y];
                          for (let _i393 = 0; _i393 < _a392.length; _i393++) {
                            const _t394 = sp.adj8Edges[v_y][_i393];
                            if (!((((b.grid[_t394] || -1) === 1) || (v_H.includes(_t394))))) continue;
                            _g389++;
                          }
                        }
                        _c395 = (_g389 < takes(sp, cl, v_y));
                      }
                      let _c398: boolean = _c395;
                      if (_c398) {
                        let _c397: boolean = (sp.crossing[sp.adj8Edges[v_s][_i388]] !== -1);
                        if (_c397) {
                          const _t396 = sp.crossing[sp.adj8Edges[v_s][_i388]];
                          _c397 = (((b.grid[_t396] || -1) === 1) || (v_H.includes(_t396)));
                        }
                        _c398 = !(_c397);
                      }
                      if (!(_c398)) continue;
                      _g385++;
                    }
                  }
                  if ((_g385 < v_n)) {
                    _q377 = true;
                    break Q378;
                  }
                }
              }
              if (_q377) {
                _q373 = true;
                break Q374;
              }
            }
          }
          _c399 = _q373;
        }
        let _c428: boolean = _c399;
        if (!_c428) {
          let _g400 = 0;
          G401: {
            const _a402 = sp.adj8[v_a];
            for (let _i403 = 0; _i403 < _a402.length; _i403++) {
              const _t404 = sp.adj8Edges[v_a][_i403];
              if (!((((b.grid[_t404] || -1) === 1) || (v_H.includes(_t404))))) continue;
              _g400++;
            }
          }
          let _c415: boolean = !((_g400 < takes(sp, cl, v_a)));
          if (_c415) {
            let _q405 = true;
            Q406: {
              const _a408 = throughWhere(sp, v_a, (_te407: number): boolean => {  return (((b.grid[_te407] || -1) === 1) || (v_H.includes(_te407))); });
              for (let _i409 = 0; _i409 < _a408.length; _i409++) {
                const v_x = _a408[_i409];
                let _g410 = 0;
                G411: {
                  const _a412 = sp.adj8[v_x];
                  for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                    const _t414 = sp.adj8Edges[v_x][_i413];
                    if (!((((b.grid[_t414] || -1) === 1) || (v_H.includes(_t414))))) continue;
                    _g410++;
                  }
                }
                if (!(!((_g410 < takes(sp, cl, v_x))))) {
                  _q405 = false;
                  break Q406;
                }
              }
            }
            _c415 = _q405;
          }
          let _c427: boolean = _c415;
          if (_c427) {
            let _g416 = 0;
            G417: {
              const _a419 = throughWhere(sp, v_a, (_te418: number): boolean => {  return (((b.grid[_te418] || -1) === 1) || (v_H.includes(_te418))); });
              for (let _i420 = 0; _i420 < _a419.length; _i420++) {
                const v_x = _a419[_i420];
                const _h421 = clueAt(cl.number, v_x);
                if (!((_h421 !== -1))) continue;
                _g416++;
              }
            }
            let _g422 = 0;
            G423: {
              const _a424 = sp.cells;
              for (let _i425 = 0; _i425 < _a424.length; _i425++) {
                const v_y = _a424[_i425];
                const _h426 = clueAt(cl.number, v_y);
                if (!((_h426 !== -1))) continue;
                _g422++;
              }
            }
            _c427 = (_g416 < _g422);
          }
          _c428 = _c427;
        }
        let _c507: boolean = _c428;
        if (!_c507) {
          let _q429 = false;
          Q430: {
            let _g431 = 0;
            G432: {
              const _a433 = sp.adj8[v_b];
              for (let _i434 = 0; _i434 < _a433.length; _i434++) {
                const _t435 = sp.adj8Edges[v_b][_i434];
                if (!((((b.grid[_t435] || -1) === 1) || (v_H.includes(_t435))))) continue;
                _g431++;
              }
            }
            L436: {
              const v_n = (takes(sp, cl, v_b) - _g431);
              if (!((v_n > 0))) break L436;
              let _g437 = 0;
              G438: {
                const _a439 = sp.adj8[v_b];
                for (let _i440 = 0; _i440 < _a439.length; _i440++) {
                  const v_y = _a439[_i440];
                  let _c447: boolean = (!((b.grid[sp.adj8Edges[v_b][_i440]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_b][_i440])));
                  if (_c447) {
                    let _g441 = 0;
                    G442: {
                      const _a444 = sp.adj8[v_y];
                      for (let _i445 = 0; _i445 < _a444.length; _i445++) {
                        const _t446 = sp.adj8Edges[v_y][_i445];
                        if (!((((b.grid[_t446] || -1) === 1) || (v_H.includes(_t446))))) continue;
                        _g441++;
                      }
                    }
                    _c447 = (_g441 < takes(sp, cl, v_y));
                  }
                  let _c450: boolean = _c447;
                  if (_c450) {
                    let _c449: boolean = (sp.crossing[sp.adj8Edges[v_b][_i440]] !== -1);
                    if (_c449) {
                      const _t448 = sp.crossing[sp.adj8Edges[v_b][_i440]];
                      _c449 = (((b.grid[_t448] || -1) === 1) || (v_H.includes(_t448)));
                    }
                    _c450 = !(_c449);
                  }
                  if (!(_c450)) continue;
                  _g437++;
                }
              }
              if ((_g437 < v_n)) {
                _q429 = true;
                break Q430;
              }
            }
          }
          let _c477: boolean = _q429;
          if (!_c477) {
            let _q451 = false;
            Q452: {
              const _a453 = sp.adj8[v_b];
              for (let _i454 = 0; _i454 < _a453.length; _i454++) {
                const v_s = _a453[_i454];
                let _q455 = false;
                Q456: {
                  let _g457 = 0;
                  G458: {
                    const _a459 = sp.adj8[v_s];
                    for (let _i460 = 0; _i460 < _a459.length; _i460++) {
                      const _t461 = sp.adj8Edges[v_s][_i460];
                      if (!((((b.grid[_t461] || -1) === 1) || (v_H.includes(_t461))))) continue;
                      _g457++;
                    }
                  }
                  L462: {
                    const v_n = (takes(sp, cl, v_s) - _g457);
                    if (!((v_n > 0))) break L462;
                    let _g463 = 0;
                    G464: {
                      const _a465 = sp.adj8[v_s];
                      for (let _i466 = 0; _i466 < _a465.length; _i466++) {
                        const v_y = _a465[_i466];
                        let _c473: boolean = (!((b.grid[sp.adj8Edges[v_s][_i466]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i466])));
                        if (_c473) {
                          let _g467 = 0;
                          G468: {
                            const _a470 = sp.adj8[v_y];
                            for (let _i471 = 0; _i471 < _a470.length; _i471++) {
                              const _t472 = sp.adj8Edges[v_y][_i471];
                              if (!((((b.grid[_t472] || -1) === 1) || (v_H.includes(_t472))))) continue;
                              _g467++;
                            }
                          }
                          _c473 = (_g467 < takes(sp, cl, v_y));
                        }
                        let _c476: boolean = _c473;
                        if (_c476) {
                          let _c475: boolean = (sp.crossing[sp.adj8Edges[v_s][_i466]] !== -1);
                          if (_c475) {
                            const _t474 = sp.crossing[sp.adj8Edges[v_s][_i466]];
                            _c475 = (((b.grid[_t474] || -1) === 1) || (v_H.includes(_t474)));
                          }
                          _c476 = !(_c475);
                        }
                        if (!(_c476)) continue;
                        _g463++;
                      }
                    }
                    if ((_g463 < v_n)) {
                      _q455 = true;
                      break Q456;
                    }
                  }
                }
                if (_q455) {
                  _q451 = true;
                  break Q452;
                }
              }
            }
            _c477 = _q451;
          }
          let _c506: boolean = _c477;
          if (!_c506) {
            let _g478 = 0;
            G479: {
              const _a480 = sp.adj8[v_b];
              for (let _i481 = 0; _i481 < _a480.length; _i481++) {
                const _t482 = sp.adj8Edges[v_b][_i481];
                if (!((((b.grid[_t482] || -1) === 1) || (v_H.includes(_t482))))) continue;
                _g478++;
              }
            }
            let _c493: boolean = !((_g478 < takes(sp, cl, v_b)));
            if (_c493) {
              let _q483 = true;
              Q484: {
                const _a486 = throughWhere(sp, v_b, (_te485: number): boolean => {  return (((b.grid[_te485] || -1) === 1) || (v_H.includes(_te485))); });
                for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                  const v_x = _a486[_i487];
                  let _g488 = 0;
                  G489: {
                    const _a490 = sp.adj8[v_x];
                    for (let _i491 = 0; _i491 < _a490.length; _i491++) {
                      const _t492 = sp.adj8Edges[v_x][_i491];
                      if (!((((b.grid[_t492] || -1) === 1) || (v_H.includes(_t492))))) continue;
                      _g488++;
                    }
                  }
                  if (!(!((_g488 < takes(sp, cl, v_x))))) {
                    _q483 = false;
                    break Q484;
                  }
                }
              }
              _c493 = _q483;
            }
            let _c505: boolean = _c493;
            if (_c505) {
              let _g494 = 0;
              G495: {
                const _a497 = throughWhere(sp, v_b, (_te496: number): boolean => {  return (((b.grid[_te496] || -1) === 1) || (v_H.includes(_te496))); });
                for (let _i498 = 0; _i498 < _a497.length; _i498++) {
                  const v_x = _a497[_i498];
                  const _h499 = clueAt(cl.number, v_x);
                  if (!((_h499 !== -1))) continue;
                  _g494++;
                }
              }
              let _g500 = 0;
              G501: {
                const _a502 = sp.cells;
                for (let _i503 = 0; _i503 < _a502.length; _i503++) {
                  const v_y = _a502[_i503];
                  const _h504 = clueAt(cl.number, v_y);
                  if (!((_h504 !== -1))) continue;
                  _g500++;
                }
              }
              _c505 = (_g494 < _g500);
            }
            _c506 = _c505;
          }
          _c507 = _c506;
        }
        _c508 = _c507;
      }
      if (!(_c508)) break L338;
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
  const _g701: number[] = [];
  const facts = spareBreaksFacts;
  let fired = 0;
  let changed = false;
  const _a691 = sp.cells;
  for (let _i692 = 0; _i692 < _a691.length; _i692++) {
    const v_c = _a691[_i692];
    L693: {
      const v_U = ways(b, sp, cl, v_c);
      const _h698 = v_U.length;
      let _g694 = 0;
      G695: {
        const _a696 = sp.adj8[v_c];
        for (let _i697 = 0; _i697 < _a696.length; _i697++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i697]] || -1) === 1))) continue;
          _g694++;
        }
      }
      if (!(((_g694 < takes(sp, cl, v_c)) && (_h698 === ((takes(sp, cl, v_c) - _g694) + 1))))) break L693;
      const _a699 = v_U;
      for (let _i700 = 0; _i700 < _a699.length; _i700++) {
        const v_y = _a699[_i700];
        _g701.length = 0;
        G702: {
          const _a705 = v_U;
          for (let _i706 = 0; _i706 < _a705.length; _i706++) {
            const v_x = _a705[_i706];
            if (!((v_x !== v_y))) continue;
            const _t707 = sp.edgeOf(v_c, v_x);
            if (!_g701.includes(_t707)) _g701.push(_t707);
          }
        }
        L708: {
          const v_H = _g701;
          let _c872: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
          if (_c872) {
            let _q709 = false;
            Q710: {
              let _g711 = 0;
              G712: {
                const _a713 = sp.adj8[v_c];
                for (let _i714 = 0; _i714 < _a713.length; _i714++) {
                  const _t715 = sp.adj8Edges[v_c][_i714];
                  if (!((((b.grid[_t715] || -1) === 1) || (v_H.includes(_t715))))) continue;
                  _g711++;
                }
              }
              L716: {
                const v_n = (takes(sp, cl, v_c) - _g711);
                if (!((v_n > 0))) break L716;
                let _g717 = 0;
                G718: {
                  const _a719 = sp.adj8[v_c];
                  for (let _i720 = 0; _i720 < _a719.length; _i720++) {
                    const v_y = _a719[_i720];
                    let _c727: boolean = (!((b.grid[sp.adj8Edges[v_c][_i720]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_c][_i720])));
                    if (_c727) {
                      let _g721 = 0;
                      G722: {
                        const _a724 = sp.adj8[v_y];
                        for (let _i725 = 0; _i725 < _a724.length; _i725++) {
                          const _t726 = sp.adj8Edges[v_y][_i725];
                          if (!((((b.grid[_t726] || -1) === 1) || (v_H.includes(_t726))))) continue;
                          _g721++;
                        }
                      }
                      _c727 = (_g721 < takes(sp, cl, v_y));
                    }
                    let _c730: boolean = _c727;
                    if (_c730) {
                      let _c729: boolean = (sp.crossing[sp.adj8Edges[v_c][_i720]] !== -1);
                      if (_c729) {
                        const _t728 = sp.crossing[sp.adj8Edges[v_c][_i720]];
                        _c729 = (((b.grid[_t728] || -1) === 1) || (v_H.includes(_t728)));
                      }
                      _c730 = !(_c729);
                    }
                    if (!(_c730)) continue;
                    _g717++;
                  }
                }
                if ((_g717 < v_n)) {
                  _q709 = true;
                  break Q710;
                }
              }
            }
            let _c757: boolean = _q709;
            if (!_c757) {
              let _q731 = false;
              Q732: {
                const _a733 = sp.adj8[v_c];
                for (let _i734 = 0; _i734 < _a733.length; _i734++) {
                  const v_s = _a733[_i734];
                  let _q735 = false;
                  Q736: {
                    let _g737 = 0;
                    G738: {
                      const _a739 = sp.adj8[v_s];
                      for (let _i740 = 0; _i740 < _a739.length; _i740++) {
                        const _t741 = sp.adj8Edges[v_s][_i740];
                        if (!((((b.grid[_t741] || -1) === 1) || (v_H.includes(_t741))))) continue;
                        _g737++;
                      }
                    }
                    L742: {
                      const v_n = (takes(sp, cl, v_s) - _g737);
                      if (!((v_n > 0))) break L742;
                      let _g743 = 0;
                      G744: {
                        const _a745 = sp.adj8[v_s];
                        for (let _i746 = 0; _i746 < _a745.length; _i746++) {
                          const v_y = _a745[_i746];
                          let _c753: boolean = (!((b.grid[sp.adj8Edges[v_s][_i746]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i746])));
                          if (_c753) {
                            let _g747 = 0;
                            G748: {
                              const _a750 = sp.adj8[v_y];
                              for (let _i751 = 0; _i751 < _a750.length; _i751++) {
                                const _t752 = sp.adj8Edges[v_y][_i751];
                                if (!((((b.grid[_t752] || -1) === 1) || (v_H.includes(_t752))))) continue;
                                _g747++;
                              }
                            }
                            _c753 = (_g747 < takes(sp, cl, v_y));
                          }
                          let _c756: boolean = _c753;
                          if (_c756) {
                            let _c755: boolean = (sp.crossing[sp.adj8Edges[v_s][_i746]] !== -1);
                            if (_c755) {
                              const _t754 = sp.crossing[sp.adj8Edges[v_s][_i746]];
                              _c755 = (((b.grid[_t754] || -1) === 1) || (v_H.includes(_t754)));
                            }
                            _c756 = !(_c755);
                          }
                          if (!(_c756)) continue;
                          _g743++;
                        }
                      }
                      if ((_g743 < v_n)) {
                        _q735 = true;
                        break Q736;
                      }
                    }
                  }
                  if (_q735) {
                    _q731 = true;
                    break Q732;
                  }
                }
              }
              _c757 = _q731;
            }
            let _c786: boolean = _c757;
            if (!_c786) {
              let _g758 = 0;
              G759: {
                const _a760 = sp.adj8[v_c];
                for (let _i761 = 0; _i761 < _a760.length; _i761++) {
                  const _t762 = sp.adj8Edges[v_c][_i761];
                  if (!((((b.grid[_t762] || -1) === 1) || (v_H.includes(_t762))))) continue;
                  _g758++;
                }
              }
              let _c773: boolean = !((_g758 < takes(sp, cl, v_c)));
              if (_c773) {
                let _q763 = true;
                Q764: {
                  const _a766 = throughWhere(sp, v_c, (_te765: number): boolean => {  return (((b.grid[_te765] || -1) === 1) || (v_H.includes(_te765))); });
                  for (let _i767 = 0; _i767 < _a766.length; _i767++) {
                    const v_x = _a766[_i767];
                    let _g768 = 0;
                    G769: {
                      const _a770 = sp.adj8[v_x];
                      for (let _i771 = 0; _i771 < _a770.length; _i771++) {
                        const _t772 = sp.adj8Edges[v_x][_i771];
                        if (!((((b.grid[_t772] || -1) === 1) || (v_H.includes(_t772))))) continue;
                        _g768++;
                      }
                    }
                    if (!(!((_g768 < takes(sp, cl, v_x))))) {
                      _q763 = false;
                      break Q764;
                    }
                  }
                }
                _c773 = _q763;
              }
              let _c785: boolean = _c773;
              if (_c785) {
                let _g774 = 0;
                G775: {
                  const _a777 = throughWhere(sp, v_c, (_te776: number): boolean => {  return (((b.grid[_te776] || -1) === 1) || (v_H.includes(_te776))); });
                  for (let _i778 = 0; _i778 < _a777.length; _i778++) {
                    const v_x = _a777[_i778];
                    const _h779 = clueAt(cl.number, v_x);
                    if (!((_h779 !== -1))) continue;
                    _g774++;
                  }
                }
                let _g780 = 0;
                G781: {
                  const _a782 = sp.cells;
                  for (let _i783 = 0; _i783 < _a782.length; _i783++) {
                    const v_y = _a782[_i783];
                    const _h784 = clueAt(cl.number, v_y);
                    if (!((_h784 !== -1))) continue;
                    _g780++;
                  }
                }
                _c785 = (_g774 < _g780);
              }
              _c786 = _c785;
            }
            let _c871: boolean = _c786;
            if (!_c871) {
              let _q787 = false;
              Q788: {
                const _a789 = v_U;
                for (let _i790 = 0; _i790 < _a789.length; _i790++) {
                  const v_x = _a789[_i790];
                  if (!((v_x !== v_y))) continue;
                  let _q791 = false;
                  Q792: {
                    let _g793 = 0;
                    G794: {
                      const _a795 = sp.adj8[v_x];
                      for (let _i796 = 0; _i796 < _a795.length; _i796++) {
                        const _t797 = sp.adj8Edges[v_x][_i796];
                        if (!((((b.grid[_t797] || -1) === 1) || (v_H.includes(_t797))))) continue;
                        _g793++;
                      }
                    }
                    L798: {
                      const v_n = (takes(sp, cl, v_x) - _g793);
                      if (!((v_n > 0))) break L798;
                      let _g799 = 0;
                      G800: {
                        const _a801 = sp.adj8[v_x];
                        for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                          const v_y = _a801[_i802];
                          let _c809: boolean = (!((b.grid[sp.adj8Edges[v_x][_i802]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_x][_i802])));
                          if (_c809) {
                            let _g803 = 0;
                            G804: {
                              const _a806 = sp.adj8[v_y];
                              for (let _i807 = 0; _i807 < _a806.length; _i807++) {
                                const _t808 = sp.adj8Edges[v_y][_i807];
                                if (!((((b.grid[_t808] || -1) === 1) || (v_H.includes(_t808))))) continue;
                                _g803++;
                              }
                            }
                            _c809 = (_g803 < takes(sp, cl, v_y));
                          }
                          let _c812: boolean = _c809;
                          if (_c812) {
                            let _c811: boolean = (sp.crossing[sp.adj8Edges[v_x][_i802]] !== -1);
                            if (_c811) {
                              const _t810 = sp.crossing[sp.adj8Edges[v_x][_i802]];
                              _c811 = (((b.grid[_t810] || -1) === 1) || (v_H.includes(_t810)));
                            }
                            _c812 = !(_c811);
                          }
                          if (!(_c812)) continue;
                          _g799++;
                        }
                      }
                      if ((_g799 < v_n)) {
                        _q791 = true;
                        break Q792;
                      }
                    }
                  }
                  let _c839: boolean = _q791;
                  if (!_c839) {
                    let _q813 = false;
                    Q814: {
                      const _a815 = sp.adj8[v_x];
                      for (let _i816 = 0; _i816 < _a815.length; _i816++) {
                        const v_s = _a815[_i816];
                        let _q817 = false;
                        Q818: {
                          let _g819 = 0;
                          G820: {
                            const _a821 = sp.adj8[v_s];
                            for (let _i822 = 0; _i822 < _a821.length; _i822++) {
                              const _t823 = sp.adj8Edges[v_s][_i822];
                              if (!((((b.grid[_t823] || -1) === 1) || (v_H.includes(_t823))))) continue;
                              _g819++;
                            }
                          }
                          L824: {
                            const v_n = (takes(sp, cl, v_s) - _g819);
                            if (!((v_n > 0))) break L824;
                            let _g825 = 0;
                            G826: {
                              const _a827 = sp.adj8[v_s];
                              for (let _i828 = 0; _i828 < _a827.length; _i828++) {
                                const v_y = _a827[_i828];
                                let _c835: boolean = (!((b.grid[sp.adj8Edges[v_s][_i828]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i828])));
                                if (_c835) {
                                  let _g829 = 0;
                                  G830: {
                                    const _a832 = sp.adj8[v_y];
                                    for (let _i833 = 0; _i833 < _a832.length; _i833++) {
                                      const _t834 = sp.adj8Edges[v_y][_i833];
                                      if (!((((b.grid[_t834] || -1) === 1) || (v_H.includes(_t834))))) continue;
                                      _g829++;
                                    }
                                  }
                                  _c835 = (_g829 < takes(sp, cl, v_y));
                                }
                                let _c838: boolean = _c835;
                                if (_c838) {
                                  let _c837: boolean = (sp.crossing[sp.adj8Edges[v_s][_i828]] !== -1);
                                  if (_c837) {
                                    const _t836 = sp.crossing[sp.adj8Edges[v_s][_i828]];
                                    _c837 = (((b.grid[_t836] || -1) === 1) || (v_H.includes(_t836)));
                                  }
                                  _c838 = !(_c837);
                                }
                                if (!(_c838)) continue;
                                _g825++;
                              }
                            }
                            if ((_g825 < v_n)) {
                              _q817 = true;
                              break Q818;
                            }
                          }
                        }
                        if (_q817) {
                          _q813 = true;
                          break Q814;
                        }
                      }
                    }
                    _c839 = _q813;
                  }
                  let _c870: boolean = _c839;
                  if (!_c870) {
                    let _g840 = 0;
                    G841: {
                      const _a842 = sp.adj8[v_x];
                      for (let _i843 = 0; _i843 < _a842.length; _i843++) {
                        const _t844 = sp.adj8Edges[v_x][_i843];
                        if (!((((b.grid[_t844] || -1) === 1) || (v_H.includes(_t844))))) continue;
                        _g840++;
                      }
                    }
                    let _c856: boolean = !((_g840 < takes(sp, cl, v_x)));
                    if (_c856) {
                      let _q845 = true;
                      Q846: {
                        const _a849 = throughWhere(sp, v_x, (_te848: number): boolean => {  return (((b.grid[_te848] || -1) === 1) || (v_H.includes(_te848))); });
                        for (let _i850 = 0; _i850 < _a849.length; _i850++) {
                          const v_x_847 = _a849[_i850];
                          let _g851 = 0;
                          G852: {
                            const _a853 = sp.adj8[v_x_847];
                            for (let _i854 = 0; _i854 < _a853.length; _i854++) {
                              const _t855 = sp.adj8Edges[v_x_847][_i854];
                              if (!((((b.grid[_t855] || -1) === 1) || (v_H.includes(_t855))))) continue;
                              _g851++;
                            }
                          }
                          if (!(!((_g851 < takes(sp, cl, v_x_847))))) {
                            _q845 = false;
                            break Q846;
                          }
                        }
                      }
                      _c856 = _q845;
                    }
                    let _c869: boolean = _c856;
                    if (_c869) {
                      let _g857 = 0;
                      G858: {
                        const _a861 = throughWhere(sp, v_x, (_te860: number): boolean => {  return (((b.grid[_te860] || -1) === 1) || (v_H.includes(_te860))); });
                        for (let _i862 = 0; _i862 < _a861.length; _i862++) {
                          const v_x_859 = _a861[_i862];
                          const _h863 = clueAt(cl.number, v_x_859);
                          if (!((_h863 !== -1))) continue;
                          _g857++;
                        }
                      }
                      let _g864 = 0;
                      G865: {
                        const _a866 = sp.cells;
                        for (let _i867 = 0; _i867 < _a866.length; _i867++) {
                          const v_y = _a866[_i867];
                          const _h868 = clueAt(cl.number, v_y);
                          if (!((_h868 !== -1))) continue;
                          _g864++;
                        }
                      }
                      _c869 = (_g857 < _g864);
                    }
                    _c870 = _c869;
                  }
                  if (_c870) {
                    _q787 = true;
                    break Q788;
                  }
                }
              }
              _c871 = _q787;
            }
            _c872 = _c871;
          }
          if (!(_c872)) break L708;
          facts.length = 0;
          changed = false;
          const _t873 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t873] !== 0)) { if (fire === null) { b.placeAt(_t873, 1); changed = true; } else facts.push(PLACE, _t873, 1); }
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
    for (let _i5 = 0; _i5 < 1; _i5++) {
      const v_k = v_c;
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
  const _g10: number[] = [];
  G11: {
    const _a27 = sp.adj8[v_c];
    for (let _i28 = 0; _i28 < _a27.length; _i28++) {
      const v_y = _a27[_i28];
      let _c33: boolean = !((b.grid[sp.adj8Edges[v_c][_i28]] !== 0));
      if (_c33) {
        let _g29 = 0;
        G30: {
          const _a31 = sp.adj8[v_c];
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            if (!(((b.grid[sp.adj8Edges[v_c][_i32]] || -1) === 1))) continue;
            _g29++;
          }
        }
        _c33 = (_g29 < takes(sp, cl, v_c));
      }
      let _c39: boolean = _c33;
      if (_c39) {
        let _g34 = 0;
        G35: {
          const _a37 = sp.adj8[v_y];
          for (let _i38 = 0; _i38 < _a37.length; _i38++) {
            if (!(((b.grid[sp.adj8Edges[v_y][_i38]] || -1) === 1))) continue;
            _g34++;
          }
        }
        _c39 = (_g34 < takes(sp, cl, v_y));
      }
      let _c41: boolean = _c39;
      if (_c41) {
        const _t40 = sp.adj8Edges[v_c][_i28];
        _c41 = !(((sp.crossing[_t40] !== -1) && ((b.grid[sp.crossing[_t40]] || -1) === 1)));
      }
      if (!(_c41)) continue;
      _g10.push(v_y);
    }
  }
  const _made = _g10;
  _kept[v_c] = _made;
  return _made;
}
