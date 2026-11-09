// Compiled by `npm run describe` from src/games/spokes/spokes.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptStore, rangeMask, sameSet, setOf, stamps, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g902: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q885 = true;
  Q886: {
    const _a887 = sp.cells;
    for (let _i888 = 0; _i888 < _a887.length; _i888++) {
      const v_c = _a887[_i888];
      const _h889 = clueAt(cl.number, v_c);
      if (!(!((_h889 !== -1)))) continue;
      let _g890 = 0;
      G891: {
        const _a892 = sp.adj8[v_c];
        for (let _i893 = 0; _i893 < _a892.length; _i893++) {
          const _h894 = (g[sp.adj8Edges[v_c][_i893]] || -1);
          if (!((_h894 === 1))) continue;
          _g890++;
        }
      }
      if (!((_g890 === 0))) {
        _q885 = false;
        break Q886;
      }
    }
  }
  if (!(_q885)) return false;
  let _q895 = true;
  Q896: {
    const _a897 = sp.edges;
    for (let _i898 = 0; _i898 < _a897.length; _i898++) {
      const v_e = _a897[_i898];
      if (!((sp.crossing[v_e] !== -1))) continue;
      const _h899 = (g[v_e] || -1);
      if (!(((_h899 === 2) || ((g[sp.crossing[v_e]] || -1) === 2)))) {
        _q895 = false;
        break Q896;
      }
    }
  }
  if (!(_q895)) return false;
  let _q900 = true;
  Q901: {
    _g902.length = 0;
    G903: {
      const _a906 = sp.edges;
      for (let _i907 = 0; _i907 < _a906.length; _i907++) {
        const v_e = _a906[_i907];
        const _h908 = (g[v_e] || -1);
        if (!((_h908 === 1))) continue;
        _g902.push(v_e);
      }
    }
    const v_L = _g902;
    const _eg915 = edgeGroups(sp, v_L);
    const _a909 = sp.cells;
    for (let _i910 = 0; _i910 < _a909.length; _i910++) {
      const v_a = _a909[_i910];
      const _h911 = clueAt(cl.number, v_a);
      if (!((_h911 !== -1))) continue;
      const _a912 = sp.cells;
      for (let _i913 = 0; _i913 < _a912.length; _i913++) {
        const v_b = _a912[_i913];
        const _h914 = clueAt(cl.number, v_b);
        if (!((_h914 !== -1))) continue;
        if (!((_eg915.of(v_b) === _eg915.of(v_a)))) {
          _q900 = false;
          break Q901;
        }
      }
    }
  }
  if (!(_q900)) return false;
  for (let _k916 = 0; _k916 < cl.number.at.length; _k916++) {
    const _at917 = cl.number.at[_k916];
    let _g919 = 0;
    G920: {
      const _a921 = sp.adj8[_at917];
      for (let _i922 = 0; _i922 < _a921.length; _i922++) {
        const _h923 = (g[sp.adj8Edges[_at917][_i922]] || -1);
        if (!((_h923 === 1))) continue;
        _g919++;
      }
    }
    if (!((_g919 === clueAt(cl.number, _at917)))) return false;
  }
  for (let _k924 = 0; _k924 < cl.block.at.length; _k924++) {
    const _at925 = cl.block.at[_k924];
    let _q927 = true;
    Q928: {
      const _a929 = sp.adj4[_at925];
      for (let _i930 = 0; _i930 < _a929.length; _i930++) {
        const v_a = _a929[_i930];
        const _a931 = sp.adj4[_at925];
        for (let _i932 = 0; _i932 < _a931.length; _i932++) {
          const v_b = _a931[_i932];
          if (!((sp.edgeOf(v_a, v_b) !== -1))) continue;
          const _h933 = (g[sp.edgeOf(v_a, v_b)] || -1);
          if (!((_h933 === 2))) {
            _q927 = false;
            break Q928;
          }
        }
      }
    }
    if (!(_q927)) return false;
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
  const _k45 = takesKept.board(cl);
  const _a43 = sp.cells;
  for (let _i44 = 0; _i44 < _a43.length; _i44++) {
    const v_c = _a43[_i44];
    let _g46 = 0;
    G47: {
      const _a48 = sp.adj8[v_c];
      for (let _i49 = 0; _i49 < _a48.length; _i49++) {
        if (!(((b.grid[sp.adj8Edges[v_c][_i49]] || -1) === 1))) continue;
        _g46++;
      }
    }
    const v_n = ((_k45[v_c] ?? takes(sp, cl, v_c)) - _g46);
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
        if (fire !== null && !fire({ c: v_c, n: v_n, U: v_U.slice() }, facts)) return 1;
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
  const _k88 = takesKept.board(cl);
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
        let _c101: boolean = (((_k88[v_a] ?? takes(sp, cl, v_a)) === 1) && ((_k88[v_b] ?? takes(sp, cl, v_b)) === 1));
        if (_c101) {
          let _c93: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
          if (_c93) {
            let _g89 = 0;
            G90: {
              const _a91 = sp.adj8[v_a];
              for (let _i92 = 0; _i92 < _a91.length; _i92++) {
                if (!(((b.grid[sp.adj8Edges[v_a][_i92]] || -1) === 1))) continue;
                _g89++;
              }
            }
            _c93 = (_g89 < (_k88[v_a] ?? takes(sp, cl, v_a)));
          }
          let _c98: boolean = _c93;
          if (_c98) {
            let _g94 = 0;
            G95: {
              const _a96 = sp.adj8[v_b];
              for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                if (!(((b.grid[sp.adj8Edges[v_b][_i97]] || -1) === 1))) continue;
                _g94++;
              }
            }
            _c98 = (_g94 < (_k88[v_b] ?? takes(sp, cl, v_b)));
          }
          let _c100: boolean = _c98;
          if (_c100) {
            const _t99 = sp.edgeOf(v_a, v_b);
            _c100 = !(((sp.crossing[_t99] !== -1) && ((b.grid[sp.crossing[_t99]] || -1) === 1)));
          }
          _c101 = _c100;
        }
        if (!(_c101)) break L87;
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
  const _g141: number[] = [];
  const facts = exhaustionFacts;
  let fired = 0;
  let changed = false;
  const _k139 = takesKept.board(cl);
  const _a132 = sp.cells;
  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
    const v_c = _a132[_i133];
    const _h134 = clueAt(cl.number, v_c);
    let _c140: boolean = (_h134 !== -1);
    if (_c140) {
      let _g135 = 0;
      G136: {
        const _a137 = sp.adj8[v_c];
        for (let _i138 = 0; _i138 < _a137.length; _i138++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i138]] || -1) === 1))) continue;
          _g135++;
        }
      }
      _c140 = (_g135 === (_k139[v_c] ?? takes(sp, cl, v_c)));
    }
    if (!(_c140)) continue;
    _g141.length = 0;
    G142: {
      const _a153 = sp.adj8[v_c];
      for (let _i154 = 0; _i154 < _a153.length; _i154++) {
        const v_y = _a153[_i154];
        let _c160: boolean = !((b.grid[sp.adj8Edges[v_c][_i154]] !== 0));
        if (_c160) {
          let _g155 = 0;
          G156: {
            const _a158 = sp.adj8[v_y];
            for (let _i159 = 0; _i159 < _a158.length; _i159++) {
              if (!(((b.grid[sp.adj8Edges[v_y][_i159]] || -1) === 1))) continue;
              _g155++;
            }
          }
          _c160 = (_g155 < (_k139[v_y] ?? takes(sp, cl, v_y)));
        }
        let _c162: boolean = _c160;
        if (_c162) {
          const _t161 = sp.adj8Edges[v_c][_i154];
          _c162 = !(((sp.crossing[_t161] !== -1) && ((b.grid[sp.crossing[_t161]] || -1) === 1)));
        }
        if (!(_c162)) continue;
        _g141.push(v_y);
      }
    }
    L163: {
      const v_U = _g141;
      const _h164 = v_U.length;
      if (!((_h164 > 0))) break L163;
      facts.length = 0;
      changed = false;
      let _q165 = true;
      Q166: {
        const _a167 = v_U;
        for (let _i168 = 0; _i168 < _a167.length; _i168++) {
          const v_y = _a167[_i168];
          const _t169 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t169] !== 0)) { if (fire === null) { b.placeAt(_t169, 2); changed = true; } else facts.push(PLACE, _t169, 2); }
          if (!(true)) {
            _q165 = false;
            break Q166;
          }
        }
      }
      if (!(_q165)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, U: v_U.slice() }, facts)) return 1;
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
  const _k346 = takesKept.board(cl);
  const _a339 = sp.edges;
  for (let _i340 = 0; _i340 < _a339.length; _i340++) {
    const v_e = _a339[_i340];
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    L341: {
      const v_H = setOf(v_e);
      let _c347: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
      if (_c347) {
        let _g342 = 0;
        G343: {
          const _a344 = sp.adj8[v_a];
          for (let _i345 = 0; _i345 < _a344.length; _i345++) {
            if (!(((b.grid[sp.adj8Edges[v_a][_i345]] || -1) === 1))) continue;
            _g342++;
          }
        }
        _c347 = (_g342 < (_k346[v_a] ?? takes(sp, cl, v_a)));
      }
      let _c352: boolean = _c347;
      if (_c352) {
        let _g348 = 0;
        G349: {
          const _a350 = sp.adj8[v_b];
          for (let _i351 = 0; _i351 < _a350.length; _i351++) {
            if (!(((b.grid[sp.adj8Edges[v_b][_i351]] || -1) === 1))) continue;
            _g348++;
          }
        }
        _c352 = (_g348 < (_k346[v_b] ?? takes(sp, cl, v_b)));
      }
      let _c354: boolean = _c352;
      if (_c354) {
        const _t353 = sp.edgeOf(v_a, v_b);
        _c354 = !(((sp.crossing[_t353] !== -1) && ((b.grid[sp.crossing[_t353]] || -1) === 1)));
      }
      let _c512: boolean = _c354;
      if (_c512) {
        let _q355 = false;
        Q356: {
          let _g357 = 0;
          G358: {
            const _a359 = sp.adj8[v_a];
            for (let _i360 = 0; _i360 < _a359.length; _i360++) {
              const _t361 = sp.adj8Edges[v_a][_i360];
              if (!((((b.grid[_t361] || -1) === 1) || (v_H.includes(_t361))))) continue;
              _g357++;
            }
          }
          L362: {
            const v_n = ((_k346[v_a] ?? takes(sp, cl, v_a)) - _g357);
            if (!((v_n > 0))) break L362;
            let _g363 = 0;
            G364: {
              const _a365 = sp.adj8[v_a];
              for (let _i366 = 0; _i366 < _a365.length; _i366++) {
                const v_y = _a365[_i366];
                let _c373: boolean = (!((b.grid[sp.adj8Edges[v_a][_i366]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_a][_i366])));
                if (_c373) {
                  let _g367 = 0;
                  G368: {
                    const _a370 = sp.adj8[v_y];
                    for (let _i371 = 0; _i371 < _a370.length; _i371++) {
                      const _t372 = sp.adj8Edges[v_y][_i371];
                      if (!((((b.grid[_t372] || -1) === 1) || (v_H.includes(_t372))))) continue;
                      _g367++;
                    }
                  }
                  _c373 = (_g367 < (_k346[v_y] ?? takes(sp, cl, v_y)));
                }
                let _c376: boolean = _c373;
                if (_c376) {
                  let _c375: boolean = (sp.crossing[sp.adj8Edges[v_a][_i366]] !== -1);
                  if (_c375) {
                    const _t374 = sp.crossing[sp.adj8Edges[v_a][_i366]];
                    _c375 = (((b.grid[_t374] || -1) === 1) || (v_H.includes(_t374)));
                  }
                  _c376 = !(_c375);
                }
                if (!(_c376)) continue;
                _g363++;
              }
            }
            if ((_g363 < v_n)) {
              _q355 = true;
              break Q356;
            }
          }
        }
        let _c403: boolean = _q355;
        if (!_c403) {
          let _q377 = false;
          Q378: {
            const _a379 = sp.adj8[v_a];
            for (let _i380 = 0; _i380 < _a379.length; _i380++) {
              const v_s = _a379[_i380];
              let _q381 = false;
              Q382: {
                let _g383 = 0;
                G384: {
                  const _a385 = sp.adj8[v_s];
                  for (let _i386 = 0; _i386 < _a385.length; _i386++) {
                    const _t387 = sp.adj8Edges[v_s][_i386];
                    if (!((((b.grid[_t387] || -1) === 1) || (v_H.includes(_t387))))) continue;
                    _g383++;
                  }
                }
                L388: {
                  const v_n = ((_k346[v_s] ?? takes(sp, cl, v_s)) - _g383);
                  if (!((v_n > 0))) break L388;
                  let _g389 = 0;
                  G390: {
                    const _a391 = sp.adj8[v_s];
                    for (let _i392 = 0; _i392 < _a391.length; _i392++) {
                      const v_y = _a391[_i392];
                      let _c399: boolean = (!((b.grid[sp.adj8Edges[v_s][_i392]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i392])));
                      if (_c399) {
                        let _g393 = 0;
                        G394: {
                          const _a396 = sp.adj8[v_y];
                          for (let _i397 = 0; _i397 < _a396.length; _i397++) {
                            const _t398 = sp.adj8Edges[v_y][_i397];
                            if (!((((b.grid[_t398] || -1) === 1) || (v_H.includes(_t398))))) continue;
                            _g393++;
                          }
                        }
                        _c399 = (_g393 < (_k346[v_y] ?? takes(sp, cl, v_y)));
                      }
                      let _c402: boolean = _c399;
                      if (_c402) {
                        let _c401: boolean = (sp.crossing[sp.adj8Edges[v_s][_i392]] !== -1);
                        if (_c401) {
                          const _t400 = sp.crossing[sp.adj8Edges[v_s][_i392]];
                          _c401 = (((b.grid[_t400] || -1) === 1) || (v_H.includes(_t400)));
                        }
                        _c402 = !(_c401);
                      }
                      if (!(_c402)) continue;
                      _g389++;
                    }
                  }
                  if ((_g389 < v_n)) {
                    _q381 = true;
                    break Q382;
                  }
                }
              }
              if (_q381) {
                _q377 = true;
                break Q378;
              }
            }
          }
          _c403 = _q377;
        }
        let _c432: boolean = _c403;
        if (!_c432) {
          let _g404 = 0;
          G405: {
            const _a406 = sp.adj8[v_a];
            for (let _i407 = 0; _i407 < _a406.length; _i407++) {
              const _t408 = sp.adj8Edges[v_a][_i407];
              if (!((((b.grid[_t408] || -1) === 1) || (v_H.includes(_t408))))) continue;
              _g404++;
            }
          }
          let _c419: boolean = !((_g404 < (_k346[v_a] ?? takes(sp, cl, v_a))));
          if (_c419) {
            let _q409 = true;
            Q410: {
              const _a412 = throughWhere(sp, v_a, (_te411: number): boolean => {  return (((b.grid[_te411] || -1) === 1) || (v_H.includes(_te411))); });
              for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                const v_x = _a412[_i413];
                let _g414 = 0;
                G415: {
                  const _a416 = sp.adj8[v_x];
                  for (let _i417 = 0; _i417 < _a416.length; _i417++) {
                    const _t418 = sp.adj8Edges[v_x][_i417];
                    if (!((((b.grid[_t418] || -1) === 1) || (v_H.includes(_t418))))) continue;
                    _g414++;
                  }
                }
                if (!(!((_g414 < (_k346[v_x] ?? takes(sp, cl, v_x)))))) {
                  _q409 = false;
                  break Q410;
                }
              }
            }
            _c419 = _q409;
          }
          let _c431: boolean = _c419;
          if (_c431) {
            let _g420 = 0;
            G421: {
              const _a423 = throughWhere(sp, v_a, (_te422: number): boolean => {  return (((b.grid[_te422] || -1) === 1) || (v_H.includes(_te422))); });
              for (let _i424 = 0; _i424 < _a423.length; _i424++) {
                const v_x = _a423[_i424];
                const _h425 = clueAt(cl.number, v_x);
                if (!((_h425 !== -1))) continue;
                _g420++;
              }
            }
            let _g426 = 0;
            G427: {
              const _a428 = sp.cells;
              for (let _i429 = 0; _i429 < _a428.length; _i429++) {
                const v_y = _a428[_i429];
                const _h430 = clueAt(cl.number, v_y);
                if (!((_h430 !== -1))) continue;
                _g426++;
              }
            }
            _c431 = (_g420 < _g426);
          }
          _c432 = _c431;
        }
        let _c511: boolean = _c432;
        if (!_c511) {
          let _q433 = false;
          Q434: {
            let _g435 = 0;
            G436: {
              const _a437 = sp.adj8[v_b];
              for (let _i438 = 0; _i438 < _a437.length; _i438++) {
                const _t439 = sp.adj8Edges[v_b][_i438];
                if (!((((b.grid[_t439] || -1) === 1) || (v_H.includes(_t439))))) continue;
                _g435++;
              }
            }
            L440: {
              const v_n = ((_k346[v_b] ?? takes(sp, cl, v_b)) - _g435);
              if (!((v_n > 0))) break L440;
              let _g441 = 0;
              G442: {
                const _a443 = sp.adj8[v_b];
                for (let _i444 = 0; _i444 < _a443.length; _i444++) {
                  const v_y = _a443[_i444];
                  let _c451: boolean = (!((b.grid[sp.adj8Edges[v_b][_i444]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_b][_i444])));
                  if (_c451) {
                    let _g445 = 0;
                    G446: {
                      const _a448 = sp.adj8[v_y];
                      for (let _i449 = 0; _i449 < _a448.length; _i449++) {
                        const _t450 = sp.adj8Edges[v_y][_i449];
                        if (!((((b.grid[_t450] || -1) === 1) || (v_H.includes(_t450))))) continue;
                        _g445++;
                      }
                    }
                    _c451 = (_g445 < (_k346[v_y] ?? takes(sp, cl, v_y)));
                  }
                  let _c454: boolean = _c451;
                  if (_c454) {
                    let _c453: boolean = (sp.crossing[sp.adj8Edges[v_b][_i444]] !== -1);
                    if (_c453) {
                      const _t452 = sp.crossing[sp.adj8Edges[v_b][_i444]];
                      _c453 = (((b.grid[_t452] || -1) === 1) || (v_H.includes(_t452)));
                    }
                    _c454 = !(_c453);
                  }
                  if (!(_c454)) continue;
                  _g441++;
                }
              }
              if ((_g441 < v_n)) {
                _q433 = true;
                break Q434;
              }
            }
          }
          let _c481: boolean = _q433;
          if (!_c481) {
            let _q455 = false;
            Q456: {
              const _a457 = sp.adj8[v_b];
              for (let _i458 = 0; _i458 < _a457.length; _i458++) {
                const v_s = _a457[_i458];
                let _q459 = false;
                Q460: {
                  let _g461 = 0;
                  G462: {
                    const _a463 = sp.adj8[v_s];
                    for (let _i464 = 0; _i464 < _a463.length; _i464++) {
                      const _t465 = sp.adj8Edges[v_s][_i464];
                      if (!((((b.grid[_t465] || -1) === 1) || (v_H.includes(_t465))))) continue;
                      _g461++;
                    }
                  }
                  L466: {
                    const v_n = ((_k346[v_s] ?? takes(sp, cl, v_s)) - _g461);
                    if (!((v_n > 0))) break L466;
                    let _g467 = 0;
                    G468: {
                      const _a469 = sp.adj8[v_s];
                      for (let _i470 = 0; _i470 < _a469.length; _i470++) {
                        const v_y = _a469[_i470];
                        let _c477: boolean = (!((b.grid[sp.adj8Edges[v_s][_i470]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i470])));
                        if (_c477) {
                          let _g471 = 0;
                          G472: {
                            const _a474 = sp.adj8[v_y];
                            for (let _i475 = 0; _i475 < _a474.length; _i475++) {
                              const _t476 = sp.adj8Edges[v_y][_i475];
                              if (!((((b.grid[_t476] || -1) === 1) || (v_H.includes(_t476))))) continue;
                              _g471++;
                            }
                          }
                          _c477 = (_g471 < (_k346[v_y] ?? takes(sp, cl, v_y)));
                        }
                        let _c480: boolean = _c477;
                        if (_c480) {
                          let _c479: boolean = (sp.crossing[sp.adj8Edges[v_s][_i470]] !== -1);
                          if (_c479) {
                            const _t478 = sp.crossing[sp.adj8Edges[v_s][_i470]];
                            _c479 = (((b.grid[_t478] || -1) === 1) || (v_H.includes(_t478)));
                          }
                          _c480 = !(_c479);
                        }
                        if (!(_c480)) continue;
                        _g467++;
                      }
                    }
                    if ((_g467 < v_n)) {
                      _q459 = true;
                      break Q460;
                    }
                  }
                }
                if (_q459) {
                  _q455 = true;
                  break Q456;
                }
              }
            }
            _c481 = _q455;
          }
          let _c510: boolean = _c481;
          if (!_c510) {
            let _g482 = 0;
            G483: {
              const _a484 = sp.adj8[v_b];
              for (let _i485 = 0; _i485 < _a484.length; _i485++) {
                const _t486 = sp.adj8Edges[v_b][_i485];
                if (!((((b.grid[_t486] || -1) === 1) || (v_H.includes(_t486))))) continue;
                _g482++;
              }
            }
            let _c497: boolean = !((_g482 < (_k346[v_b] ?? takes(sp, cl, v_b))));
            if (_c497) {
              let _q487 = true;
              Q488: {
                const _a490 = throughWhere(sp, v_b, (_te489: number): boolean => {  return (((b.grid[_te489] || -1) === 1) || (v_H.includes(_te489))); });
                for (let _i491 = 0; _i491 < _a490.length; _i491++) {
                  const v_x = _a490[_i491];
                  let _g492 = 0;
                  G493: {
                    const _a494 = sp.adj8[v_x];
                    for (let _i495 = 0; _i495 < _a494.length; _i495++) {
                      const _t496 = sp.adj8Edges[v_x][_i495];
                      if (!((((b.grid[_t496] || -1) === 1) || (v_H.includes(_t496))))) continue;
                      _g492++;
                    }
                  }
                  if (!(!((_g492 < (_k346[v_x] ?? takes(sp, cl, v_x)))))) {
                    _q487 = false;
                    break Q488;
                  }
                }
              }
              _c497 = _q487;
            }
            let _c509: boolean = _c497;
            if (_c509) {
              let _g498 = 0;
              G499: {
                const _a501 = throughWhere(sp, v_b, (_te500: number): boolean => {  return (((b.grid[_te500] || -1) === 1) || (v_H.includes(_te500))); });
                for (let _i502 = 0; _i502 < _a501.length; _i502++) {
                  const v_x = _a501[_i502];
                  const _h503 = clueAt(cl.number, v_x);
                  if (!((_h503 !== -1))) continue;
                  _g498++;
                }
              }
              let _g504 = 0;
              G505: {
                const _a506 = sp.cells;
                for (let _i507 = 0; _i507 < _a506.length; _i507++) {
                  const v_y = _a506[_i507];
                  const _h508 = clueAt(cl.number, v_y);
                  if (!((_h508 !== -1))) continue;
                  _g504++;
                }
              }
              _c509 = (_g498 < _g504);
            }
            _c510 = _c509;
          }
          _c511 = _c510;
        }
        _c512 = _c511;
      }
      if (!(_c512)) break L341;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, H: v_H.slice() }, facts)) return 1;
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
const _st710 = stamps();

/** Its dearest read grows with the board as n^2. */
export function spareBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SpareBreaksBinding> | null): number {
  const _g706: number[] = [];
  const facts = spareBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k702 = takesKept.board(cl);
  const _a695 = sp.cells;
  R1:
  for (let _i696 = 0; _i696 < _a695.length; _i696++) {
    const v_c = _a695[_i696];
    const _m167_0 = b.made[0];
    const _m167_1 = b.made[1];
    L697: {
      const v_U = ways(b, sp, cl, v_c);
      const _h703 = v_U.length;
      let _g698 = 0;
      G699: {
        const _a700 = sp.adj8[v_c];
        for (let _i701 = 0; _i701 < _a700.length; _i701++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i701]] || -1) === 1))) continue;
          _g698++;
        }
      }
      if (!(((_g698 < (_k702[v_c] ?? takes(sp, cl, v_c))) && (_h703 === (((_k702[v_c] ?? takes(sp, cl, v_c)) - _g698) + 1))))) break L697;
      const _a704 = v_U;
      for (let _i705 = 0; _i705 < _a704.length; _i705++) {
        const v_y = _a704[_i705];
        _g706.length = 0;
        _st710.pass++;
        G707: {
          const _a711 = v_U;
          for (let _i712 = 0; _i712 < _a711.length; _i712++) {
            const v_x = _a711[_i712];
            if (!((v_x !== v_y))) continue;
            const _t713 = sp.edgeOf(v_c, v_x);
            const _t714 = _t713;
            if (_g706.length < 16) { if (!_g706.includes(_t714)) _g706.push(_t714); } else addOnce(_g706, _st710, _t714);
          }
        }
        L715: {
          const v_H = _g706;
          let _c879: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
          if (_c879) {
            let _q716 = false;
            Q717: {
              let _g718 = 0;
              G719: {
                const _a720 = sp.adj8[v_c];
                for (let _i721 = 0; _i721 < _a720.length; _i721++) {
                  const _t722 = sp.adj8Edges[v_c][_i721];
                  if (!((((b.grid[_t722] || -1) === 1) || (v_H.includes(_t722))))) continue;
                  _g718++;
                }
              }
              L723: {
                const v_n = ((_k702[v_c] ?? takes(sp, cl, v_c)) - _g718);
                if (!((v_n > 0))) break L723;
                let _g724 = 0;
                G725: {
                  const _a726 = sp.adj8[v_c];
                  for (let _i727 = 0; _i727 < _a726.length; _i727++) {
                    const v_y = _a726[_i727];
                    let _c734: boolean = (!((b.grid[sp.adj8Edges[v_c][_i727]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_c][_i727])));
                    if (_c734) {
                      let _g728 = 0;
                      G729: {
                        const _a731 = sp.adj8[v_y];
                        for (let _i732 = 0; _i732 < _a731.length; _i732++) {
                          const _t733 = sp.adj8Edges[v_y][_i732];
                          if (!((((b.grid[_t733] || -1) === 1) || (v_H.includes(_t733))))) continue;
                          _g728++;
                        }
                      }
                      _c734 = (_g728 < (_k702[v_y] ?? takes(sp, cl, v_y)));
                    }
                    let _c737: boolean = _c734;
                    if (_c737) {
                      let _c736: boolean = (sp.crossing[sp.adj8Edges[v_c][_i727]] !== -1);
                      if (_c736) {
                        const _t735 = sp.crossing[sp.adj8Edges[v_c][_i727]];
                        _c736 = (((b.grid[_t735] || -1) === 1) || (v_H.includes(_t735)));
                      }
                      _c737 = !(_c736);
                    }
                    if (!(_c737)) continue;
                    _g724++;
                  }
                }
                if ((_g724 < v_n)) {
                  _q716 = true;
                  break Q717;
                }
              }
            }
            let _c764: boolean = _q716;
            if (!_c764) {
              let _q738 = false;
              Q739: {
                const _a740 = sp.adj8[v_c];
                for (let _i741 = 0; _i741 < _a740.length; _i741++) {
                  const v_s = _a740[_i741];
                  let _q742 = false;
                  Q743: {
                    let _g744 = 0;
                    G745: {
                      const _a746 = sp.adj8[v_s];
                      for (let _i747 = 0; _i747 < _a746.length; _i747++) {
                        const _t748 = sp.adj8Edges[v_s][_i747];
                        if (!((((b.grid[_t748] || -1) === 1) || (v_H.includes(_t748))))) continue;
                        _g744++;
                      }
                    }
                    L749: {
                      const v_n = ((_k702[v_s] ?? takes(sp, cl, v_s)) - _g744);
                      if (!((v_n > 0))) break L749;
                      let _g750 = 0;
                      G751: {
                        const _a752 = sp.adj8[v_s];
                        for (let _i753 = 0; _i753 < _a752.length; _i753++) {
                          const v_y = _a752[_i753];
                          let _c760: boolean = (!((b.grid[sp.adj8Edges[v_s][_i753]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i753])));
                          if (_c760) {
                            let _g754 = 0;
                            G755: {
                              const _a757 = sp.adj8[v_y];
                              for (let _i758 = 0; _i758 < _a757.length; _i758++) {
                                const _t759 = sp.adj8Edges[v_y][_i758];
                                if (!((((b.grid[_t759] || -1) === 1) || (v_H.includes(_t759))))) continue;
                                _g754++;
                              }
                            }
                            _c760 = (_g754 < (_k702[v_y] ?? takes(sp, cl, v_y)));
                          }
                          let _c763: boolean = _c760;
                          if (_c763) {
                            let _c762: boolean = (sp.crossing[sp.adj8Edges[v_s][_i753]] !== -1);
                            if (_c762) {
                              const _t761 = sp.crossing[sp.adj8Edges[v_s][_i753]];
                              _c762 = (((b.grid[_t761] || -1) === 1) || (v_H.includes(_t761)));
                            }
                            _c763 = !(_c762);
                          }
                          if (!(_c763)) continue;
                          _g750++;
                        }
                      }
                      if ((_g750 < v_n)) {
                        _q742 = true;
                        break Q743;
                      }
                    }
                  }
                  if (_q742) {
                    _q738 = true;
                    break Q739;
                  }
                }
              }
              _c764 = _q738;
            }
            let _c793: boolean = _c764;
            if (!_c793) {
              let _g765 = 0;
              G766: {
                const _a767 = sp.adj8[v_c];
                for (let _i768 = 0; _i768 < _a767.length; _i768++) {
                  const _t769 = sp.adj8Edges[v_c][_i768];
                  if (!((((b.grid[_t769] || -1) === 1) || (v_H.includes(_t769))))) continue;
                  _g765++;
                }
              }
              let _c780: boolean = !((_g765 < (_k702[v_c] ?? takes(sp, cl, v_c))));
              if (_c780) {
                let _q770 = true;
                Q771: {
                  const _a773 = throughWhere(sp, v_c, (_te772: number): boolean => {  return (((b.grid[_te772] || -1) === 1) || (v_H.includes(_te772))); });
                  for (let _i774 = 0; _i774 < _a773.length; _i774++) {
                    const v_x = _a773[_i774];
                    let _g775 = 0;
                    G776: {
                      const _a777 = sp.adj8[v_x];
                      for (let _i778 = 0; _i778 < _a777.length; _i778++) {
                        const _t779 = sp.adj8Edges[v_x][_i778];
                        if (!((((b.grid[_t779] || -1) === 1) || (v_H.includes(_t779))))) continue;
                        _g775++;
                      }
                    }
                    if (!(!((_g775 < (_k702[v_x] ?? takes(sp, cl, v_x)))))) {
                      _q770 = false;
                      break Q771;
                    }
                  }
                }
                _c780 = _q770;
              }
              let _c792: boolean = _c780;
              if (_c792) {
                let _g781 = 0;
                G782: {
                  const _a784 = throughWhere(sp, v_c, (_te783: number): boolean => {  return (((b.grid[_te783] || -1) === 1) || (v_H.includes(_te783))); });
                  for (let _i785 = 0; _i785 < _a784.length; _i785++) {
                    const v_x = _a784[_i785];
                    const _h786 = clueAt(cl.number, v_x);
                    if (!((_h786 !== -1))) continue;
                    _g781++;
                  }
                }
                let _g787 = 0;
                G788: {
                  const _a789 = sp.cells;
                  for (let _i790 = 0; _i790 < _a789.length; _i790++) {
                    const v_y = _a789[_i790];
                    const _h791 = clueAt(cl.number, v_y);
                    if (!((_h791 !== -1))) continue;
                    _g787++;
                  }
                }
                _c792 = (_g781 < _g787);
              }
              _c793 = _c792;
            }
            let _c878: boolean = _c793;
            if (!_c878) {
              let _q794 = false;
              Q795: {
                const _a796 = v_U;
                for (let _i797 = 0; _i797 < _a796.length; _i797++) {
                  const v_x = _a796[_i797];
                  if (!((v_x !== v_y))) continue;
                  let _q798 = false;
                  Q799: {
                    let _g800 = 0;
                    G801: {
                      const _a802 = sp.adj8[v_x];
                      for (let _i803 = 0; _i803 < _a802.length; _i803++) {
                        const _t804 = sp.adj8Edges[v_x][_i803];
                        if (!((((b.grid[_t804] || -1) === 1) || (v_H.includes(_t804))))) continue;
                        _g800++;
                      }
                    }
                    L805: {
                      const v_n = ((_k702[v_x] ?? takes(sp, cl, v_x)) - _g800);
                      if (!((v_n > 0))) break L805;
                      let _g806 = 0;
                      G807: {
                        const _a808 = sp.adj8[v_x];
                        for (let _i809 = 0; _i809 < _a808.length; _i809++) {
                          const v_y = _a808[_i809];
                          let _c816: boolean = (!((b.grid[sp.adj8Edges[v_x][_i809]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_x][_i809])));
                          if (_c816) {
                            let _g810 = 0;
                            G811: {
                              const _a813 = sp.adj8[v_y];
                              for (let _i814 = 0; _i814 < _a813.length; _i814++) {
                                const _t815 = sp.adj8Edges[v_y][_i814];
                                if (!((((b.grid[_t815] || -1) === 1) || (v_H.includes(_t815))))) continue;
                                _g810++;
                              }
                            }
                            _c816 = (_g810 < (_k702[v_y] ?? takes(sp, cl, v_y)));
                          }
                          let _c819: boolean = _c816;
                          if (_c819) {
                            let _c818: boolean = (sp.crossing[sp.adj8Edges[v_x][_i809]] !== -1);
                            if (_c818) {
                              const _t817 = sp.crossing[sp.adj8Edges[v_x][_i809]];
                              _c818 = (((b.grid[_t817] || -1) === 1) || (v_H.includes(_t817)));
                            }
                            _c819 = !(_c818);
                          }
                          if (!(_c819)) continue;
                          _g806++;
                        }
                      }
                      if ((_g806 < v_n)) {
                        _q798 = true;
                        break Q799;
                      }
                    }
                  }
                  let _c846: boolean = _q798;
                  if (!_c846) {
                    let _q820 = false;
                    Q821: {
                      const _a822 = sp.adj8[v_x];
                      for (let _i823 = 0; _i823 < _a822.length; _i823++) {
                        const v_s = _a822[_i823];
                        let _q824 = false;
                        Q825: {
                          let _g826 = 0;
                          G827: {
                            const _a828 = sp.adj8[v_s];
                            for (let _i829 = 0; _i829 < _a828.length; _i829++) {
                              const _t830 = sp.adj8Edges[v_s][_i829];
                              if (!((((b.grid[_t830] || -1) === 1) || (v_H.includes(_t830))))) continue;
                              _g826++;
                            }
                          }
                          L831: {
                            const v_n = ((_k702[v_s] ?? takes(sp, cl, v_s)) - _g826);
                            if (!((v_n > 0))) break L831;
                            let _g832 = 0;
                            G833: {
                              const _a834 = sp.adj8[v_s];
                              for (let _i835 = 0; _i835 < _a834.length; _i835++) {
                                const v_y = _a834[_i835];
                                let _c842: boolean = (!((b.grid[sp.adj8Edges[v_s][_i835]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i835])));
                                if (_c842) {
                                  let _g836 = 0;
                                  G837: {
                                    const _a839 = sp.adj8[v_y];
                                    for (let _i840 = 0; _i840 < _a839.length; _i840++) {
                                      const _t841 = sp.adj8Edges[v_y][_i840];
                                      if (!((((b.grid[_t841] || -1) === 1) || (v_H.includes(_t841))))) continue;
                                      _g836++;
                                    }
                                  }
                                  _c842 = (_g836 < (_k702[v_y] ?? takes(sp, cl, v_y)));
                                }
                                let _c845: boolean = _c842;
                                if (_c845) {
                                  let _c844: boolean = (sp.crossing[sp.adj8Edges[v_s][_i835]] !== -1);
                                  if (_c844) {
                                    const _t843 = sp.crossing[sp.adj8Edges[v_s][_i835]];
                                    _c844 = (((b.grid[_t843] || -1) === 1) || (v_H.includes(_t843)));
                                  }
                                  _c845 = !(_c844);
                                }
                                if (!(_c845)) continue;
                                _g832++;
                              }
                            }
                            if ((_g832 < v_n)) {
                              _q824 = true;
                              break Q825;
                            }
                          }
                        }
                        if (_q824) {
                          _q820 = true;
                          break Q821;
                        }
                      }
                    }
                    _c846 = _q820;
                  }
                  let _c877: boolean = _c846;
                  if (!_c877) {
                    let _g847 = 0;
                    G848: {
                      const _a849 = sp.adj8[v_x];
                      for (let _i850 = 0; _i850 < _a849.length; _i850++) {
                        const _t851 = sp.adj8Edges[v_x][_i850];
                        if (!((((b.grid[_t851] || -1) === 1) || (v_H.includes(_t851))))) continue;
                        _g847++;
                      }
                    }
                    let _c863: boolean = !((_g847 < (_k702[v_x] ?? takes(sp, cl, v_x))));
                    if (_c863) {
                      let _q852 = true;
                      Q853: {
                        const _a856 = throughWhere(sp, v_x, (_te855: number): boolean => {  return (((b.grid[_te855] || -1) === 1) || (v_H.includes(_te855))); });
                        for (let _i857 = 0; _i857 < _a856.length; _i857++) {
                          const v_x_854 = _a856[_i857];
                          let _g858 = 0;
                          G859: {
                            const _a860 = sp.adj8[v_x_854];
                            for (let _i861 = 0; _i861 < _a860.length; _i861++) {
                              const _t862 = sp.adj8Edges[v_x_854][_i861];
                              if (!((((b.grid[_t862] || -1) === 1) || (v_H.includes(_t862))))) continue;
                              _g858++;
                            }
                          }
                          if (!(!((_g858 < (_k702[v_x_854] ?? takes(sp, cl, v_x_854)))))) {
                            _q852 = false;
                            break Q853;
                          }
                        }
                      }
                      _c863 = _q852;
                    }
                    let _c876: boolean = _c863;
                    if (_c876) {
                      let _g864 = 0;
                      G865: {
                        const _a868 = throughWhere(sp, v_x, (_te867: number): boolean => {  return (((b.grid[_te867] || -1) === 1) || (v_H.includes(_te867))); });
                        for (let _i869 = 0; _i869 < _a868.length; _i869++) {
                          const v_x_866 = _a868[_i869];
                          const _h870 = clueAt(cl.number, v_x_866);
                          if (!((_h870 !== -1))) continue;
                          _g864++;
                        }
                      }
                      let _g871 = 0;
                      G872: {
                        const _a873 = sp.cells;
                        for (let _i874 = 0; _i874 < _a873.length; _i874++) {
                          const v_y = _a873[_i874];
                          const _h875 = clueAt(cl.number, v_y);
                          if (!((_h875 !== -1))) continue;
                          _g871++;
                        }
                      }
                      _c876 = (_g864 < _g871);
                    }
                    _c877 = _c876;
                  }
                  if (_c877) {
                    _q794 = true;
                    break Q795;
                  }
                }
              }
              _c878 = _q794;
            }
            _c879 = _c878;
          }
          if (!(_c879)) break L715;
          if (b.made[0] !== _m167_0 || b.made[1] !== _m167_1) {
            if (!(sameSet(v_U, ways(b, sp, cl, v_c)))) { continue R1; }
            let _g880 = 0;
            G881: {
              const _a882 = sp.adj8[v_c];
              for (let _i883 = 0; _i883 < _a882.length; _i883++) {
                if (!(((b.grid[sp.adj8Edges[v_c][_i883]] || -1) === 1))) continue;
                _g880++;
              }
            }
            if (!(((_g880 < takes(sp, cl, v_c)) && (v_U.length === ((takes(sp, cl, v_c) - _g880) + 1))))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          const _t884 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t884] !== 0)) { if (fire === null) { b.placeAt(_t884, 1); changed = true; } else facts.push(PLACE, _t884, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, U: v_U.slice(), y: v_y, H: v_H.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const takesKept = keptStore<number>();
let takesOn: object | null = null;
let takesAt: Kept<number> = [];

/** `takes(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function takes(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== takesOn) {
    takesAt = takesKept.board(cl);
    takesOn = cl;
  }
  const _kept: Kept<number> = takesAt;
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
