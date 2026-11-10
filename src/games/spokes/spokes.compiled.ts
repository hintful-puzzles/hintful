// Compiled by `npm run describe` from src/games/spokes/spokes.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptStore, rangeMask, sameSet, setOf, staleChecking, stamps, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g1287: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1270 = true;
  Q1271: {
    const _a1272 = sp.cells;
    for (let _i1273 = 0; _i1273 < _a1272.length; _i1273++) {
      const v_c = _a1272[_i1273];
      const _h1274 = clueAt(cl.number, v_c);
      if (!(!((_h1274 !== -1)))) continue;
      let _g1275 = 0;
      G1276: {
        const _a1277 = sp.adj8[v_c];
        for (let _i1278 = 0; _i1278 < _a1277.length; _i1278++) {
          const _h1279 = (g[sp.adj8Edges[v_c][_i1278]] || -1);
          if (!((_h1279 === 1))) continue;
          _g1275++;
        }
      }
      if (!((_g1275 === 0))) {
        _q1270 = false;
        break Q1271;
      }
    }
  }
  if (!(_q1270)) return false;
  let _q1280 = true;
  Q1281: {
    const _a1282 = sp.edges;
    for (let _i1283 = 0; _i1283 < _a1282.length; _i1283++) {
      const v_e = _a1282[_i1283];
      if (!((sp.crossing[v_e] !== -1))) continue;
      const _h1284 = (g[v_e] || -1);
      if (!(((_h1284 === 2) || ((g[sp.crossing[v_e]] || -1) === 2)))) {
        _q1280 = false;
        break Q1281;
      }
    }
  }
  if (!(_q1280)) return false;
  let _q1285 = true;
  Q1286: {
    _g1287.length = 0;
    G1288: {
      const _a1291 = sp.edges;
      for (let _i1292 = 0; _i1292 < _a1291.length; _i1292++) {
        const v_e = _a1291[_i1292];
        const _h1293 = (g[v_e] || -1);
        if (!((_h1293 === 1))) continue;
        _g1287.push(v_e);
      }
    }
    const v_L = _g1287;
    const _eg1300 = edgeGroups(sp, v_L);
    const _a1294 = sp.cells;
    for (let _i1295 = 0; _i1295 < _a1294.length; _i1295++) {
      const v_a = _a1294[_i1295];
      const _h1296 = clueAt(cl.number, v_a);
      if (!((_h1296 !== -1))) continue;
      const _a1297 = sp.cells;
      for (let _i1298 = 0; _i1298 < _a1297.length; _i1298++) {
        const v_b = _a1297[_i1298];
        const _h1299 = clueAt(cl.number, v_b);
        if (!((_h1299 !== -1))) continue;
        if (!((_eg1300.of(v_b) === _eg1300.of(v_a)))) {
          _q1285 = false;
          break Q1286;
        }
      }
    }
  }
  if (!(_q1285)) return false;
  for (let _k1301 = 0; _k1301 < cl.number.at.length; _k1301++) {
    const _at1302 = cl.number.at[_k1301];
    let _g1304 = 0;
    G1305: {
      const _a1306 = sp.adj8[_at1302];
      for (let _i1307 = 0; _i1307 < _a1306.length; _i1307++) {
        const _h1308 = (g[sp.adj8Edges[_at1302][_i1307]] || -1);
        if (!((_h1308 === 1))) continue;
        _g1304++;
      }
    }
    if (!((_g1304 === clueAt(cl.number, _at1302)))) return false;
  }
  for (let _k1309 = 0; _k1309 < cl.block.at.length; _k1309++) {
    const _at1310 = cl.block.at[_k1309];
    let _q1312 = true;
    Q1313: {
      const _a1314 = sp.adj4[_at1310];
      for (let _i1315 = 0; _i1315 < _a1314.length; _i1315++) {
        const v_a = _a1314[_i1315];
        const _a1316 = sp.adj4[_at1310];
        for (let _i1317 = 0; _i1317 < _a1316.length; _i1317++) {
          const v_b = _a1316[_i1317];
          if (!((sp.edgeOf(v_a, v_b) !== -1))) continue;
          const _h1318 = (g[sp.edgeOf(v_a, v_b)] || -1);
          if (!((_h1318 === 2))) {
            _q1312 = false;
            break Q1313;
          }
        }
      }
    }
    if (!(_q1312)) return false;
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
      if (import.meta.env.DEV && staleChecking) {
        let _g52 = 0;
        G53: {
          const _a54 = sp.adj8[v_c];
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            if (!(((b.grid[sp.adj8Edges[v_c][_i55]] || -1) === 1))) continue;
            _g52++;
          }
        }
        freshBinding("saturation", [(sp.cells.includes(v_c)), (v_n === (takes(sp, cl, v_c) - _g52)), sameSet(v_U, ways(b, sp, cl, v_c)), ((v_n < 0) || ((v_n > 0) && (v_U.length <= v_n)))], ["c in", "n =", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c61: boolean = ((v_n >= 0) && (_h51 === v_n));
      if (_c61) {
        let _q56 = true;
        Q57: {
          const _a58 = v_U;
          for (let _i59 = 0; _i59 < _a58.length; _i59++) {
            const v_y = _a58[_i59];
            const _t60 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t60] !== 0)) { if (fire === null) { b.placeAt(_t60, 1); changed = true; } else facts.push(PLACE, _t60, 1); }
            if (!(true)) {
              _q56 = false;
              break Q57;
            }
          }
        }
        _c61 = _q56;
      }
      if (!(_c61)) return -1;
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
  const _k92 = takesKept.board(cl);
  let _g83 = 0;
  G84: {
    const _a85 = sp.cells;
    for (let _i86 = 0; _i86 < _a85.length; _i86++) {
      const v_y = _a85[_i86];
      const _h87 = clueAt(cl.number, v_y);
      if (!((_h87 !== -1))) continue;
      _g83++;
    }
  }
  L88: {
    const v_N = _g83;
    if (!((v_N > 2))) break L88;
    const _a89 = sp.edges;
    for (let _i90 = 0; _i90 < _a89.length; _i90++) {
      const v_e = _a89[_i90];
      const v_a = sp.edgeEnds[2 * v_e];
      L91: {
        const v_b = sp.edgeEnds[2 * v_e + 1];
        let _c105: boolean = (((_k92[v_a] ?? takes(sp, cl, v_a)) === 1) && ((_k92[v_b] ?? takes(sp, cl, v_b)) === 1));
        if (_c105) {
          let _c97: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
          if (_c97) {
            let _g93 = 0;
            G94: {
              const _a95 = sp.adj8[v_a];
              for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                if (!(((b.grid[sp.adj8Edges[v_a][_i96]] || -1) === 1))) continue;
                _g93++;
              }
            }
            _c97 = (_g93 < (_k92[v_a] ?? takes(sp, cl, v_a)));
          }
          let _c102: boolean = _c97;
          if (_c102) {
            let _g98 = 0;
            G99: {
              const _a100 = sp.adj8[v_b];
              for (let _i101 = 0; _i101 < _a100.length; _i101++) {
                if (!(((b.grid[sp.adj8Edges[v_b][_i101]] || -1) === 1))) continue;
                _g98++;
              }
            }
            _c102 = (_g98 < (_k92[v_b] ?? takes(sp, cl, v_b)));
          }
          let _c104: boolean = _c102;
          if (_c104) {
            const _t103 = sp.edgeOf(v_a, v_b);
            _c104 = !(((sp.crossing[_t103] !== -1) && ((b.grid[sp.crossing[_t103]] || -1) === 1)));
          }
          _c105 = _c104;
        }
        if (!(_c105)) break L91;
        if (import.meta.env.DEV && staleChecking) {
          let _g106 = 0;
          G107: {
            const _a108 = sp.cells;
            for (let _i109 = 0; _i109 < _a108.length; _i109++) {
              const v_y = _a108[_i109];
              if (!((clueAt(cl.number, v_y) !== -1))) continue;
              _g106++;
            }
          }
          let _c122: boolean = ((takes(sp, cl, v_a) === 1) && (takes(sp, cl, v_b) === 1));
          if (_c122) {
            let _c114: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
            if (_c114) {
              let _g110 = 0;
              G111: {
                const _a112 = sp.adj8[v_a];
                for (let _i113 = 0; _i113 < _a112.length; _i113++) {
                  if (!(((b.grid[sp.adj8Edges[v_a][_i113]] || -1) === 1))) continue;
                  _g110++;
                }
              }
              _c114 = (_g110 < takes(sp, cl, v_a));
            }
            let _c119: boolean = _c114;
            if (_c119) {
              let _g115 = 0;
              G116: {
                const _a117 = sp.adj8[v_b];
                for (let _i118 = 0; _i118 < _a117.length; _i118++) {
                  if (!(((b.grid[sp.adj8Edges[v_b][_i118]] || -1) === 1))) continue;
                  _g115++;
                }
              }
              _c119 = (_g115 < takes(sp, cl, v_b));
            }
            let _c121: boolean = _c119;
            if (_c121) {
              const _t120 = sp.edgeOf(v_a, v_b);
              _c121 = !(((sp.crossing[_t120] !== -1) && ((b.grid[sp.crossing[_t120]] || -1) === 1)));
            }
            _c122 = _c121;
          }
          freshBinding("twoOnes", [(v_N === _g106), (v_N > 2), (sp.edges.includes(v_e)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), _c122], ["N =", "where of N", "e in", "a =", "b =", "where of b"]);
        }
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
  const _g162: number[] = [];
  const facts = exhaustionFacts;
  let fired = 0;
  let changed = false;
  const _k160 = takesKept.board(cl);
  const _a153 = sp.cells;
  for (let _i154 = 0; _i154 < _a153.length; _i154++) {
    const v_c = _a153[_i154];
    const _h155 = clueAt(cl.number, v_c);
    let _c161: boolean = (_h155 !== -1);
    if (_c161) {
      let _g156 = 0;
      G157: {
        const _a158 = sp.adj8[v_c];
        for (let _i159 = 0; _i159 < _a158.length; _i159++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i159]] || -1) === 1))) continue;
          _g156++;
        }
      }
      _c161 = (_g156 === (_k160[v_c] ?? takes(sp, cl, v_c)));
    }
    if (!(_c161)) continue;
    _g162.length = 0;
    G163: {
      const _a174 = sp.adj8[v_c];
      for (let _i175 = 0; _i175 < _a174.length; _i175++) {
        const v_y = _a174[_i175];
        let _c181: boolean = !((b.grid[sp.adj8Edges[v_c][_i175]] !== 0));
        if (_c181) {
          let _g176 = 0;
          G177: {
            const _a179 = sp.adj8[v_y];
            for (let _i180 = 0; _i180 < _a179.length; _i180++) {
              if (!(((b.grid[sp.adj8Edges[v_y][_i180]] || -1) === 1))) continue;
              _g176++;
            }
          }
          _c181 = (_g176 < (_k160[v_y] ?? takes(sp, cl, v_y)));
        }
        let _c183: boolean = _c181;
        if (_c183) {
          const _t182 = sp.adj8Edges[v_c][_i175];
          _c183 = !(((sp.crossing[_t182] !== -1) && ((b.grid[sp.crossing[_t182]] || -1) === 1)));
        }
        if (!(_c183)) continue;
        _g162.push(v_y);
      }
    }
    L184: {
      const v_U = _g162;
      const _h185 = v_U.length;
      if (!((_h185 > 0))) break L184;
      if (import.meta.env.DEV && staleChecking) {
        let _c190: boolean = (clueAt(cl.number, v_c) !== -1);
        if (_c190) {
          let _g186 = 0;
          G187: {
            const _a188 = sp.adj8[v_c];
            for (let _i189 = 0; _i189 < _a188.length; _i189++) {
              if (!(((b.grid[sp.adj8Edges[v_c][_i189]] || -1) === 1))) continue;
              _g186++;
            }
          }
          _c190 = (_g186 === takes(sp, cl, v_c));
        }
        const _g191: number[] = [];
        G192: {
          const _a203 = sp.adj8[v_c];
          for (let _i204 = 0; _i204 < _a203.length; _i204++) {
            const v_y = _a203[_i204];
            let _c210: boolean = !((b.grid[sp.adj8Edges[v_c][_i204]] !== 0));
            if (_c210) {
              let _g205 = 0;
              G206: {
                const _a208 = sp.adj8[v_y];
                for (let _i209 = 0; _i209 < _a208.length; _i209++) {
                  if (!(((b.grid[sp.adj8Edges[v_y][_i209]] || -1) === 1))) continue;
                  _g205++;
                }
              }
              _c210 = (_g205 < takes(sp, cl, v_y));
            }
            let _c212: boolean = _c210;
            if (_c212) {
              const _t211 = sp.adj8Edges[v_c][_i204];
              _c212 = !(((sp.crossing[_t211] !== -1) && ((b.grid[sp.crossing[_t211]] || -1) === 1)));
            }
            if (!(_c212)) continue;
            _g191.push(v_y);
          }
        }
        freshBinding("exhaustion", [(sp.cells.includes(v_c)), _c190, sameSet(v_U, _g191), (v_U.length > 0)], ["c in", "where of c", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _q213 = true;
      Q214: {
        const _a215 = v_U;
        for (let _i216 = 0; _i216 < _a215.length; _i216++) {
          const v_y = _a215[_i216];
          const _t217 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t217] !== 0)) { if (fire === null) { b.placeAt(_t217, 2); changed = true; } else facts.push(PLACE, _t217, 2); }
          if (!(true)) {
            _q213 = false;
            break Q214;
          }
        }
      }
      if (!(_q213)) return -1;
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
  const _k394 = takesKept.board(cl);
  const _a387 = sp.edges;
  for (let _i388 = 0; _i388 < _a387.length; _i388++) {
    const v_e = _a387[_i388];
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    L389: {
      const v_H = setOf(v_e);
      let _c395: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
      if (_c395) {
        let _g390 = 0;
        G391: {
          const _a392 = sp.adj8[v_a];
          for (let _i393 = 0; _i393 < _a392.length; _i393++) {
            if (!(((b.grid[sp.adj8Edges[v_a][_i393]] || -1) === 1))) continue;
            _g390++;
          }
        }
        _c395 = (_g390 < (_k394[v_a] ?? takes(sp, cl, v_a)));
      }
      let _c400: boolean = _c395;
      if (_c400) {
        let _g396 = 0;
        G397: {
          const _a398 = sp.adj8[v_b];
          for (let _i399 = 0; _i399 < _a398.length; _i399++) {
            if (!(((b.grid[sp.adj8Edges[v_b][_i399]] || -1) === 1))) continue;
            _g396++;
          }
        }
        _c400 = (_g396 < (_k394[v_b] ?? takes(sp, cl, v_b)));
      }
      let _c402: boolean = _c400;
      if (_c402) {
        const _t401 = sp.edgeOf(v_a, v_b);
        _c402 = !(((sp.crossing[_t401] !== -1) && ((b.grid[sp.crossing[_t401]] || -1) === 1)));
      }
      let _c560: boolean = _c402;
      if (_c560) {
        let _q403 = false;
        Q404: {
          let _g405 = 0;
          G406: {
            const _a407 = sp.adj8[v_a];
            for (let _i408 = 0; _i408 < _a407.length; _i408++) {
              const _t409 = sp.adj8Edges[v_a][_i408];
              if (!((((b.grid[_t409] || -1) === 1) || (v_H.includes(_t409))))) continue;
              _g405++;
            }
          }
          L410: {
            const v_n = ((_k394[v_a] ?? takes(sp, cl, v_a)) - _g405);
            if (!((v_n > 0))) break L410;
            let _g411 = 0;
            G412: {
              const _a413 = sp.adj8[v_a];
              for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                const v_y = _a413[_i414];
                let _c421: boolean = (!((b.grid[sp.adj8Edges[v_a][_i414]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_a][_i414])));
                if (_c421) {
                  let _g415 = 0;
                  G416: {
                    const _a418 = sp.adj8[v_y];
                    for (let _i419 = 0; _i419 < _a418.length; _i419++) {
                      const _t420 = sp.adj8Edges[v_y][_i419];
                      if (!((((b.grid[_t420] || -1) === 1) || (v_H.includes(_t420))))) continue;
                      _g415++;
                    }
                  }
                  _c421 = (_g415 < (_k394[v_y] ?? takes(sp, cl, v_y)));
                }
                let _c424: boolean = _c421;
                if (_c424) {
                  let _c423: boolean = (sp.crossing[sp.adj8Edges[v_a][_i414]] !== -1);
                  if (_c423) {
                    const _t422 = sp.crossing[sp.adj8Edges[v_a][_i414]];
                    _c423 = (((b.grid[_t422] || -1) === 1) || (v_H.includes(_t422)));
                  }
                  _c424 = !(_c423);
                }
                if (!(_c424)) continue;
                _g411++;
              }
            }
            if ((_g411 < v_n)) {
              _q403 = true;
              break Q404;
            }
          }
        }
        let _c451: boolean = _q403;
        if (!_c451) {
          let _q425 = false;
          Q426: {
            const _a427 = sp.adj8[v_a];
            for (let _i428 = 0; _i428 < _a427.length; _i428++) {
              const v_s = _a427[_i428];
              let _q429 = false;
              Q430: {
                let _g431 = 0;
                G432: {
                  const _a433 = sp.adj8[v_s];
                  for (let _i434 = 0; _i434 < _a433.length; _i434++) {
                    const _t435 = sp.adj8Edges[v_s][_i434];
                    if (!((((b.grid[_t435] || -1) === 1) || (v_H.includes(_t435))))) continue;
                    _g431++;
                  }
                }
                L436: {
                  const v_n = ((_k394[v_s] ?? takes(sp, cl, v_s)) - _g431);
                  if (!((v_n > 0))) break L436;
                  let _g437 = 0;
                  G438: {
                    const _a439 = sp.adj8[v_s];
                    for (let _i440 = 0; _i440 < _a439.length; _i440++) {
                      const v_y = _a439[_i440];
                      let _c447: boolean = (!((b.grid[sp.adj8Edges[v_s][_i440]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i440])));
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
                        _c447 = (_g441 < (_k394[v_y] ?? takes(sp, cl, v_y)));
                      }
                      let _c450: boolean = _c447;
                      if (_c450) {
                        let _c449: boolean = (sp.crossing[sp.adj8Edges[v_s][_i440]] !== -1);
                        if (_c449) {
                          const _t448 = sp.crossing[sp.adj8Edges[v_s][_i440]];
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
              if (_q429) {
                _q425 = true;
                break Q426;
              }
            }
          }
          _c451 = _q425;
        }
        let _c480: boolean = _c451;
        if (!_c480) {
          let _g452 = 0;
          G453: {
            const _a454 = sp.adj8[v_a];
            for (let _i455 = 0; _i455 < _a454.length; _i455++) {
              const _t456 = sp.adj8Edges[v_a][_i455];
              if (!((((b.grid[_t456] || -1) === 1) || (v_H.includes(_t456))))) continue;
              _g452++;
            }
          }
          let _c467: boolean = !((_g452 < (_k394[v_a] ?? takes(sp, cl, v_a))));
          if (_c467) {
            let _q457 = true;
            Q458: {
              const _a460 = throughWhere(sp, v_a, (_te459: number): boolean => {  return (((b.grid[_te459] || -1) === 1) || (v_H.includes(_te459))); });
              for (let _i461 = 0; _i461 < _a460.length; _i461++) {
                const v_x = _a460[_i461];
                let _g462 = 0;
                G463: {
                  const _a464 = sp.adj8[v_x];
                  for (let _i465 = 0; _i465 < _a464.length; _i465++) {
                    const _t466 = sp.adj8Edges[v_x][_i465];
                    if (!((((b.grid[_t466] || -1) === 1) || (v_H.includes(_t466))))) continue;
                    _g462++;
                  }
                }
                if (!(!((_g462 < (_k394[v_x] ?? takes(sp, cl, v_x)))))) {
                  _q457 = false;
                  break Q458;
                }
              }
            }
            _c467 = _q457;
          }
          let _c479: boolean = _c467;
          if (_c479) {
            let _g468 = 0;
            G469: {
              const _a471 = throughWhere(sp, v_a, (_te470: number): boolean => {  return (((b.grid[_te470] || -1) === 1) || (v_H.includes(_te470))); });
              for (let _i472 = 0; _i472 < _a471.length; _i472++) {
                const v_x = _a471[_i472];
                const _h473 = clueAt(cl.number, v_x);
                if (!((_h473 !== -1))) continue;
                _g468++;
              }
            }
            let _g474 = 0;
            G475: {
              const _a476 = sp.cells;
              for (let _i477 = 0; _i477 < _a476.length; _i477++) {
                const v_y = _a476[_i477];
                const _h478 = clueAt(cl.number, v_y);
                if (!((_h478 !== -1))) continue;
                _g474++;
              }
            }
            _c479 = (_g468 < _g474);
          }
          _c480 = _c479;
        }
        let _c559: boolean = _c480;
        if (!_c559) {
          let _q481 = false;
          Q482: {
            let _g483 = 0;
            G484: {
              const _a485 = sp.adj8[v_b];
              for (let _i486 = 0; _i486 < _a485.length; _i486++) {
                const _t487 = sp.adj8Edges[v_b][_i486];
                if (!((((b.grid[_t487] || -1) === 1) || (v_H.includes(_t487))))) continue;
                _g483++;
              }
            }
            L488: {
              const v_n = ((_k394[v_b] ?? takes(sp, cl, v_b)) - _g483);
              if (!((v_n > 0))) break L488;
              let _g489 = 0;
              G490: {
                const _a491 = sp.adj8[v_b];
                for (let _i492 = 0; _i492 < _a491.length; _i492++) {
                  const v_y = _a491[_i492];
                  let _c499: boolean = (!((b.grid[sp.adj8Edges[v_b][_i492]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_b][_i492])));
                  if (_c499) {
                    let _g493 = 0;
                    G494: {
                      const _a496 = sp.adj8[v_y];
                      for (let _i497 = 0; _i497 < _a496.length; _i497++) {
                        const _t498 = sp.adj8Edges[v_y][_i497];
                        if (!((((b.grid[_t498] || -1) === 1) || (v_H.includes(_t498))))) continue;
                        _g493++;
                      }
                    }
                    _c499 = (_g493 < (_k394[v_y] ?? takes(sp, cl, v_y)));
                  }
                  let _c502: boolean = _c499;
                  if (_c502) {
                    let _c501: boolean = (sp.crossing[sp.adj8Edges[v_b][_i492]] !== -1);
                    if (_c501) {
                      const _t500 = sp.crossing[sp.adj8Edges[v_b][_i492]];
                      _c501 = (((b.grid[_t500] || -1) === 1) || (v_H.includes(_t500)));
                    }
                    _c502 = !(_c501);
                  }
                  if (!(_c502)) continue;
                  _g489++;
                }
              }
              if ((_g489 < v_n)) {
                _q481 = true;
                break Q482;
              }
            }
          }
          let _c529: boolean = _q481;
          if (!_c529) {
            let _q503 = false;
            Q504: {
              const _a505 = sp.adj8[v_b];
              for (let _i506 = 0; _i506 < _a505.length; _i506++) {
                const v_s = _a505[_i506];
                let _q507 = false;
                Q508: {
                  let _g509 = 0;
                  G510: {
                    const _a511 = sp.adj8[v_s];
                    for (let _i512 = 0; _i512 < _a511.length; _i512++) {
                      const _t513 = sp.adj8Edges[v_s][_i512];
                      if (!((((b.grid[_t513] || -1) === 1) || (v_H.includes(_t513))))) continue;
                      _g509++;
                    }
                  }
                  L514: {
                    const v_n = ((_k394[v_s] ?? takes(sp, cl, v_s)) - _g509);
                    if (!((v_n > 0))) break L514;
                    let _g515 = 0;
                    G516: {
                      const _a517 = sp.adj8[v_s];
                      for (let _i518 = 0; _i518 < _a517.length; _i518++) {
                        const v_y = _a517[_i518];
                        let _c525: boolean = (!((b.grid[sp.adj8Edges[v_s][_i518]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i518])));
                        if (_c525) {
                          let _g519 = 0;
                          G520: {
                            const _a522 = sp.adj8[v_y];
                            for (let _i523 = 0; _i523 < _a522.length; _i523++) {
                              const _t524 = sp.adj8Edges[v_y][_i523];
                              if (!((((b.grid[_t524] || -1) === 1) || (v_H.includes(_t524))))) continue;
                              _g519++;
                            }
                          }
                          _c525 = (_g519 < (_k394[v_y] ?? takes(sp, cl, v_y)));
                        }
                        let _c528: boolean = _c525;
                        if (_c528) {
                          let _c527: boolean = (sp.crossing[sp.adj8Edges[v_s][_i518]] !== -1);
                          if (_c527) {
                            const _t526 = sp.crossing[sp.adj8Edges[v_s][_i518]];
                            _c527 = (((b.grid[_t526] || -1) === 1) || (v_H.includes(_t526)));
                          }
                          _c528 = !(_c527);
                        }
                        if (!(_c528)) continue;
                        _g515++;
                      }
                    }
                    if ((_g515 < v_n)) {
                      _q507 = true;
                      break Q508;
                    }
                  }
                }
                if (_q507) {
                  _q503 = true;
                  break Q504;
                }
              }
            }
            _c529 = _q503;
          }
          let _c558: boolean = _c529;
          if (!_c558) {
            let _g530 = 0;
            G531: {
              const _a532 = sp.adj8[v_b];
              for (let _i533 = 0; _i533 < _a532.length; _i533++) {
                const _t534 = sp.adj8Edges[v_b][_i533];
                if (!((((b.grid[_t534] || -1) === 1) || (v_H.includes(_t534))))) continue;
                _g530++;
              }
            }
            let _c545: boolean = !((_g530 < (_k394[v_b] ?? takes(sp, cl, v_b))));
            if (_c545) {
              let _q535 = true;
              Q536: {
                const _a538 = throughWhere(sp, v_b, (_te537: number): boolean => {  return (((b.grid[_te537] || -1) === 1) || (v_H.includes(_te537))); });
                for (let _i539 = 0; _i539 < _a538.length; _i539++) {
                  const v_x = _a538[_i539];
                  let _g540 = 0;
                  G541: {
                    const _a542 = sp.adj8[v_x];
                    for (let _i543 = 0; _i543 < _a542.length; _i543++) {
                      const _t544 = sp.adj8Edges[v_x][_i543];
                      if (!((((b.grid[_t544] || -1) === 1) || (v_H.includes(_t544))))) continue;
                      _g540++;
                    }
                  }
                  if (!(!((_g540 < (_k394[v_x] ?? takes(sp, cl, v_x)))))) {
                    _q535 = false;
                    break Q536;
                  }
                }
              }
              _c545 = _q535;
            }
            let _c557: boolean = _c545;
            if (_c557) {
              let _g546 = 0;
              G547: {
                const _a549 = throughWhere(sp, v_b, (_te548: number): boolean => {  return (((b.grid[_te548] || -1) === 1) || (v_H.includes(_te548))); });
                for (let _i550 = 0; _i550 < _a549.length; _i550++) {
                  const v_x = _a549[_i550];
                  const _h551 = clueAt(cl.number, v_x);
                  if (!((_h551 !== -1))) continue;
                  _g546++;
                }
              }
              let _g552 = 0;
              G553: {
                const _a554 = sp.cells;
                for (let _i555 = 0; _i555 < _a554.length; _i555++) {
                  const v_y = _a554[_i555];
                  const _h556 = clueAt(cl.number, v_y);
                  if (!((_h556 !== -1))) continue;
                  _g552++;
                }
              }
              _c557 = (_g546 < _g552);
            }
            _c558 = _c557;
          }
          _c559 = _c558;
        }
        _c560 = _c559;
      }
      if (!(_c560)) break L389;
      if (import.meta.env.DEV && staleChecking) {
        let _c565: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
        if (_c565) {
          let _g561 = 0;
          G562: {
            const _a563 = sp.adj8[v_a];
            for (let _i564 = 0; _i564 < _a563.length; _i564++) {
              if (!(((b.grid[sp.adj8Edges[v_a][_i564]] || -1) === 1))) continue;
              _g561++;
            }
          }
          _c565 = (_g561 < takes(sp, cl, v_a));
        }
        let _c570: boolean = _c565;
        if (_c570) {
          let _g566 = 0;
          G567: {
            const _a568 = sp.adj8[v_b];
            for (let _i569 = 0; _i569 < _a568.length; _i569++) {
              if (!(((b.grid[sp.adj8Edges[v_b][_i569]] || -1) === 1))) continue;
              _g566++;
            }
          }
          _c570 = (_g566 < takes(sp, cl, v_b));
        }
        let _c572: boolean = _c570;
        if (_c572) {
          const _t571 = sp.edgeOf(v_a, v_b);
          _c572 = !(((sp.crossing[_t571] !== -1) && ((b.grid[sp.crossing[_t571]] || -1) === 1)));
        }
        let _c726: boolean = _c572;
        if (_c726) {
          let _q573 = false;
          Q574: {
            let _g575 = 0;
            G576: {
              const _a577 = sp.adj8[v_a];
              for (let _i578 = 0; _i578 < _a577.length; _i578++) {
                const _t579 = sp.adj8Edges[v_a][_i578];
                if (!((((b.grid[_t579] || -1) === 1) || (v_H.includes(_t579))))) continue;
                _g575++;
              }
            }
            L580: {
              const v_n = (takes(sp, cl, v_a) - _g575);
              if (!((v_n > 0))) break L580;
              let _g581 = 0;
              G582: {
                const _a583 = sp.adj8[v_a];
                for (let _i584 = 0; _i584 < _a583.length; _i584++) {
                  const v_y = _a583[_i584];
                  let _c591: boolean = (!((b.grid[sp.adj8Edges[v_a][_i584]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_a][_i584])));
                  if (_c591) {
                    let _g585 = 0;
                    G586: {
                      const _a588 = sp.adj8[v_y];
                      for (let _i589 = 0; _i589 < _a588.length; _i589++) {
                        const _t590 = sp.adj8Edges[v_y][_i589];
                        if (!((((b.grid[_t590] || -1) === 1) || (v_H.includes(_t590))))) continue;
                        _g585++;
                      }
                    }
                    _c591 = (_g585 < takes(sp, cl, v_y));
                  }
                  let _c594: boolean = _c591;
                  if (_c594) {
                    let _c593: boolean = (sp.crossing[sp.adj8Edges[v_a][_i584]] !== -1);
                    if (_c593) {
                      const _t592 = sp.crossing[sp.adj8Edges[v_a][_i584]];
                      _c593 = (((b.grid[_t592] || -1) === 1) || (v_H.includes(_t592)));
                    }
                    _c594 = !(_c593);
                  }
                  if (!(_c594)) continue;
                  _g581++;
                }
              }
              if ((_g581 < v_n)) {
                _q573 = true;
                break Q574;
              }
            }
          }
          let _c621: boolean = _q573;
          if (!_c621) {
            let _q595 = false;
            Q596: {
              const _a597 = sp.adj8[v_a];
              for (let _i598 = 0; _i598 < _a597.length; _i598++) {
                const v_s = _a597[_i598];
                let _q599 = false;
                Q600: {
                  let _g601 = 0;
                  G602: {
                    const _a603 = sp.adj8[v_s];
                    for (let _i604 = 0; _i604 < _a603.length; _i604++) {
                      const _t605 = sp.adj8Edges[v_s][_i604];
                      if (!((((b.grid[_t605] || -1) === 1) || (v_H.includes(_t605))))) continue;
                      _g601++;
                    }
                  }
                  L606: {
                    const v_n = (takes(sp, cl, v_s) - _g601);
                    if (!((v_n > 0))) break L606;
                    let _g607 = 0;
                    G608: {
                      const _a609 = sp.adj8[v_s];
                      for (let _i610 = 0; _i610 < _a609.length; _i610++) {
                        const v_y = _a609[_i610];
                        let _c617: boolean = (!((b.grid[sp.adj8Edges[v_s][_i610]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i610])));
                        if (_c617) {
                          let _g611 = 0;
                          G612: {
                            const _a614 = sp.adj8[v_y];
                            for (let _i615 = 0; _i615 < _a614.length; _i615++) {
                              const _t616 = sp.adj8Edges[v_y][_i615];
                              if (!((((b.grid[_t616] || -1) === 1) || (v_H.includes(_t616))))) continue;
                              _g611++;
                            }
                          }
                          _c617 = (_g611 < takes(sp, cl, v_y));
                        }
                        let _c620: boolean = _c617;
                        if (_c620) {
                          let _c619: boolean = (sp.crossing[sp.adj8Edges[v_s][_i610]] !== -1);
                          if (_c619) {
                            const _t618 = sp.crossing[sp.adj8Edges[v_s][_i610]];
                            _c619 = (((b.grid[_t618] || -1) === 1) || (v_H.includes(_t618)));
                          }
                          _c620 = !(_c619);
                        }
                        if (!(_c620)) continue;
                        _g607++;
                      }
                    }
                    if ((_g607 < v_n)) {
                      _q599 = true;
                      break Q600;
                    }
                  }
                }
                if (_q599) {
                  _q595 = true;
                  break Q596;
                }
              }
            }
            _c621 = _q595;
          }
          let _c648: boolean = _c621;
          if (!_c648) {
            let _g622 = 0;
            G623: {
              const _a624 = sp.adj8[v_a];
              for (let _i625 = 0; _i625 < _a624.length; _i625++) {
                const _t626 = sp.adj8Edges[v_a][_i625];
                if (!((((b.grid[_t626] || -1) === 1) || (v_H.includes(_t626))))) continue;
                _g622++;
              }
            }
            let _c637: boolean = !((_g622 < takes(sp, cl, v_a)));
            if (_c637) {
              let _q627 = true;
              Q628: {
                const _a630 = throughWhere(sp, v_a, (_te629: number): boolean => {  return (((b.grid[_te629] || -1) === 1) || (v_H.includes(_te629))); });
                for (let _i631 = 0; _i631 < _a630.length; _i631++) {
                  const v_x = _a630[_i631];
                  let _g632 = 0;
                  G633: {
                    const _a634 = sp.adj8[v_x];
                    for (let _i635 = 0; _i635 < _a634.length; _i635++) {
                      const _t636 = sp.adj8Edges[v_x][_i635];
                      if (!((((b.grid[_t636] || -1) === 1) || (v_H.includes(_t636))))) continue;
                      _g632++;
                    }
                  }
                  if (!(!((_g632 < takes(sp, cl, v_x))))) {
                    _q627 = false;
                    break Q628;
                  }
                }
              }
              _c637 = _q627;
            }
            let _c647: boolean = _c637;
            if (_c647) {
              let _g638 = 0;
              G639: {
                const _a641 = throughWhere(sp, v_a, (_te640: number): boolean => {  return (((b.grid[_te640] || -1) === 1) || (v_H.includes(_te640))); });
                for (let _i642 = 0; _i642 < _a641.length; _i642++) {
                  const v_x = _a641[_i642];
                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                  _g638++;
                }
              }
              let _g643 = 0;
              G644: {
                const _a645 = sp.cells;
                for (let _i646 = 0; _i646 < _a645.length; _i646++) {
                  const v_y = _a645[_i646];
                  if (!((clueAt(cl.number, v_y) !== -1))) continue;
                  _g643++;
                }
              }
              _c647 = (_g638 < _g643);
            }
            _c648 = _c647;
          }
          let _c725: boolean = _c648;
          if (!_c725) {
            let _q649 = false;
            Q650: {
              let _g651 = 0;
              G652: {
                const _a653 = sp.adj8[v_b];
                for (let _i654 = 0; _i654 < _a653.length; _i654++) {
                  const _t655 = sp.adj8Edges[v_b][_i654];
                  if (!((((b.grid[_t655] || -1) === 1) || (v_H.includes(_t655))))) continue;
                  _g651++;
                }
              }
              L656: {
                const v_n = (takes(sp, cl, v_b) - _g651);
                if (!((v_n > 0))) break L656;
                let _g657 = 0;
                G658: {
                  const _a659 = sp.adj8[v_b];
                  for (let _i660 = 0; _i660 < _a659.length; _i660++) {
                    const v_y = _a659[_i660];
                    let _c667: boolean = (!((b.grid[sp.adj8Edges[v_b][_i660]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_b][_i660])));
                    if (_c667) {
                      let _g661 = 0;
                      G662: {
                        const _a664 = sp.adj8[v_y];
                        for (let _i665 = 0; _i665 < _a664.length; _i665++) {
                          const _t666 = sp.adj8Edges[v_y][_i665];
                          if (!((((b.grid[_t666] || -1) === 1) || (v_H.includes(_t666))))) continue;
                          _g661++;
                        }
                      }
                      _c667 = (_g661 < takes(sp, cl, v_y));
                    }
                    let _c670: boolean = _c667;
                    if (_c670) {
                      let _c669: boolean = (sp.crossing[sp.adj8Edges[v_b][_i660]] !== -1);
                      if (_c669) {
                        const _t668 = sp.crossing[sp.adj8Edges[v_b][_i660]];
                        _c669 = (((b.grid[_t668] || -1) === 1) || (v_H.includes(_t668)));
                      }
                      _c670 = !(_c669);
                    }
                    if (!(_c670)) continue;
                    _g657++;
                  }
                }
                if ((_g657 < v_n)) {
                  _q649 = true;
                  break Q650;
                }
              }
            }
            let _c697: boolean = _q649;
            if (!_c697) {
              let _q671 = false;
              Q672: {
                const _a673 = sp.adj8[v_b];
                for (let _i674 = 0; _i674 < _a673.length; _i674++) {
                  const v_s = _a673[_i674];
                  let _q675 = false;
                  Q676: {
                    let _g677 = 0;
                    G678: {
                      const _a679 = sp.adj8[v_s];
                      for (let _i680 = 0; _i680 < _a679.length; _i680++) {
                        const _t681 = sp.adj8Edges[v_s][_i680];
                        if (!((((b.grid[_t681] || -1) === 1) || (v_H.includes(_t681))))) continue;
                        _g677++;
                      }
                    }
                    L682: {
                      const v_n = (takes(sp, cl, v_s) - _g677);
                      if (!((v_n > 0))) break L682;
                      let _g683 = 0;
                      G684: {
                        const _a685 = sp.adj8[v_s];
                        for (let _i686 = 0; _i686 < _a685.length; _i686++) {
                          const v_y = _a685[_i686];
                          let _c693: boolean = (!((b.grid[sp.adj8Edges[v_s][_i686]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i686])));
                          if (_c693) {
                            let _g687 = 0;
                            G688: {
                              const _a690 = sp.adj8[v_y];
                              for (let _i691 = 0; _i691 < _a690.length; _i691++) {
                                const _t692 = sp.adj8Edges[v_y][_i691];
                                if (!((((b.grid[_t692] || -1) === 1) || (v_H.includes(_t692))))) continue;
                                _g687++;
                              }
                            }
                            _c693 = (_g687 < takes(sp, cl, v_y));
                          }
                          let _c696: boolean = _c693;
                          if (_c696) {
                            let _c695: boolean = (sp.crossing[sp.adj8Edges[v_s][_i686]] !== -1);
                            if (_c695) {
                              const _t694 = sp.crossing[sp.adj8Edges[v_s][_i686]];
                              _c695 = (((b.grid[_t694] || -1) === 1) || (v_H.includes(_t694)));
                            }
                            _c696 = !(_c695);
                          }
                          if (!(_c696)) continue;
                          _g683++;
                        }
                      }
                      if ((_g683 < v_n)) {
                        _q675 = true;
                        break Q676;
                      }
                    }
                  }
                  if (_q675) {
                    _q671 = true;
                    break Q672;
                  }
                }
              }
              _c697 = _q671;
            }
            let _c724: boolean = _c697;
            if (!_c724) {
              let _g698 = 0;
              G699: {
                const _a700 = sp.adj8[v_b];
                for (let _i701 = 0; _i701 < _a700.length; _i701++) {
                  const _t702 = sp.adj8Edges[v_b][_i701];
                  if (!((((b.grid[_t702] || -1) === 1) || (v_H.includes(_t702))))) continue;
                  _g698++;
                }
              }
              let _c713: boolean = !((_g698 < takes(sp, cl, v_b)));
              if (_c713) {
                let _q703 = true;
                Q704: {
                  const _a706 = throughWhere(sp, v_b, (_te705: number): boolean => {  return (((b.grid[_te705] || -1) === 1) || (v_H.includes(_te705))); });
                  for (let _i707 = 0; _i707 < _a706.length; _i707++) {
                    const v_x = _a706[_i707];
                    let _g708 = 0;
                    G709: {
                      const _a710 = sp.adj8[v_x];
                      for (let _i711 = 0; _i711 < _a710.length; _i711++) {
                        const _t712 = sp.adj8Edges[v_x][_i711];
                        if (!((((b.grid[_t712] || -1) === 1) || (v_H.includes(_t712))))) continue;
                        _g708++;
                      }
                    }
                    if (!(!((_g708 < takes(sp, cl, v_x))))) {
                      _q703 = false;
                      break Q704;
                    }
                  }
                }
                _c713 = _q703;
              }
              let _c723: boolean = _c713;
              if (_c723) {
                let _g714 = 0;
                G715: {
                  const _a717 = throughWhere(sp, v_b, (_te716: number): boolean => {  return (((b.grid[_te716] || -1) === 1) || (v_H.includes(_te716))); });
                  for (let _i718 = 0; _i718 < _a717.length; _i718++) {
                    const v_x = _a717[_i718];
                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                    _g714++;
                  }
                }
                let _g719 = 0;
                G720: {
                  const _a721 = sp.cells;
                  for (let _i722 = 0; _i722 < _a721.length; _i722++) {
                    const v_y = _a721[_i722];
                    if (!((clueAt(cl.number, v_y) !== -1))) continue;
                    _g719++;
                  }
                }
                _c723 = (_g714 < _g719);
              }
              _c724 = _c723;
            }
            _c725 = _c724;
          }
          _c726 = _c725;
        }
        freshBinding("lineBreaks", [(sp.edges.includes(v_e)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), sameSet(v_H, setOf(v_e)), _c726], ["e in", "a =", "b =", "H =", "where of H"]);
      }
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
const _st924 = stamps();

/** Its dearest read grows with the board as n^2. */
export function spareBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SpareBreaksBinding> | null): number {
  const _g920: number[] = [];
  const facts = spareBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k916 = takesKept.board(cl);
  const _a909 = sp.cells;
  R1:
  for (let _i910 = 0; _i910 < _a909.length; _i910++) {
    const v_c = _a909[_i910];
    const _m167_0 = b.made[0];
    const _m167_1 = b.made[1];
    L911: {
      const v_U = ways(b, sp, cl, v_c);
      const _h917 = v_U.length;
      let _g912 = 0;
      G913: {
        const _a914 = sp.adj8[v_c];
        for (let _i915 = 0; _i915 < _a914.length; _i915++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i915]] || -1) === 1))) continue;
          _g912++;
        }
      }
      if (!(((_g912 < (_k916[v_c] ?? takes(sp, cl, v_c))) && (_h917 === (((_k916[v_c] ?? takes(sp, cl, v_c)) - _g912) + 1))))) break L911;
      const _a918 = v_U;
      for (let _i919 = 0; _i919 < _a918.length; _i919++) {
        const v_y = _a918[_i919];
        _g920.length = 0;
        _st924.pass++;
        G921: {
          const _a925 = v_U;
          for (let _i926 = 0; _i926 < _a925.length; _i926++) {
            const v_x = _a925[_i926];
            if (!((v_x !== v_y))) continue;
            const _t927 = sp.edgeOf(v_c, v_x);
            const _t928 = _t927;
            if (_g920.length < 16) { if (!_g920.includes(_t928)) _g920.push(_t928); } else addOnce(_g920, _st924, _t928);
          }
        }
        L929: {
          const v_H = _g920;
          let _c1093: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
          if (_c1093) {
            let _q930 = false;
            Q931: {
              let _g932 = 0;
              G933: {
                const _a934 = sp.adj8[v_c];
                for (let _i935 = 0; _i935 < _a934.length; _i935++) {
                  const _t936 = sp.adj8Edges[v_c][_i935];
                  if (!((((b.grid[_t936] || -1) === 1) || (v_H.includes(_t936))))) continue;
                  _g932++;
                }
              }
              L937: {
                const v_n = ((_k916[v_c] ?? takes(sp, cl, v_c)) - _g932);
                if (!((v_n > 0))) break L937;
                let _g938 = 0;
                G939: {
                  const _a940 = sp.adj8[v_c];
                  for (let _i941 = 0; _i941 < _a940.length; _i941++) {
                    const v_y = _a940[_i941];
                    let _c948: boolean = (!((b.grid[sp.adj8Edges[v_c][_i941]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_c][_i941])));
                    if (_c948) {
                      let _g942 = 0;
                      G943: {
                        const _a945 = sp.adj8[v_y];
                        for (let _i946 = 0; _i946 < _a945.length; _i946++) {
                          const _t947 = sp.adj8Edges[v_y][_i946];
                          if (!((((b.grid[_t947] || -1) === 1) || (v_H.includes(_t947))))) continue;
                          _g942++;
                        }
                      }
                      _c948 = (_g942 < (_k916[v_y] ?? takes(sp, cl, v_y)));
                    }
                    let _c951: boolean = _c948;
                    if (_c951) {
                      let _c950: boolean = (sp.crossing[sp.adj8Edges[v_c][_i941]] !== -1);
                      if (_c950) {
                        const _t949 = sp.crossing[sp.adj8Edges[v_c][_i941]];
                        _c950 = (((b.grid[_t949] || -1) === 1) || (v_H.includes(_t949)));
                      }
                      _c951 = !(_c950);
                    }
                    if (!(_c951)) continue;
                    _g938++;
                  }
                }
                if ((_g938 < v_n)) {
                  _q930 = true;
                  break Q931;
                }
              }
            }
            let _c978: boolean = _q930;
            if (!_c978) {
              let _q952 = false;
              Q953: {
                const _a954 = sp.adj8[v_c];
                for (let _i955 = 0; _i955 < _a954.length; _i955++) {
                  const v_s = _a954[_i955];
                  let _q956 = false;
                  Q957: {
                    let _g958 = 0;
                    G959: {
                      const _a960 = sp.adj8[v_s];
                      for (let _i961 = 0; _i961 < _a960.length; _i961++) {
                        const _t962 = sp.adj8Edges[v_s][_i961];
                        if (!((((b.grid[_t962] || -1) === 1) || (v_H.includes(_t962))))) continue;
                        _g958++;
                      }
                    }
                    L963: {
                      const v_n = ((_k916[v_s] ?? takes(sp, cl, v_s)) - _g958);
                      if (!((v_n > 0))) break L963;
                      let _g964 = 0;
                      G965: {
                        const _a966 = sp.adj8[v_s];
                        for (let _i967 = 0; _i967 < _a966.length; _i967++) {
                          const v_y = _a966[_i967];
                          let _c974: boolean = (!((b.grid[sp.adj8Edges[v_s][_i967]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i967])));
                          if (_c974) {
                            let _g968 = 0;
                            G969: {
                              const _a971 = sp.adj8[v_y];
                              for (let _i972 = 0; _i972 < _a971.length; _i972++) {
                                const _t973 = sp.adj8Edges[v_y][_i972];
                                if (!((((b.grid[_t973] || -1) === 1) || (v_H.includes(_t973))))) continue;
                                _g968++;
                              }
                            }
                            _c974 = (_g968 < (_k916[v_y] ?? takes(sp, cl, v_y)));
                          }
                          let _c977: boolean = _c974;
                          if (_c977) {
                            let _c976: boolean = (sp.crossing[sp.adj8Edges[v_s][_i967]] !== -1);
                            if (_c976) {
                              const _t975 = sp.crossing[sp.adj8Edges[v_s][_i967]];
                              _c976 = (((b.grid[_t975] || -1) === 1) || (v_H.includes(_t975)));
                            }
                            _c977 = !(_c976);
                          }
                          if (!(_c977)) continue;
                          _g964++;
                        }
                      }
                      if ((_g964 < v_n)) {
                        _q956 = true;
                        break Q957;
                      }
                    }
                  }
                  if (_q956) {
                    _q952 = true;
                    break Q953;
                  }
                }
              }
              _c978 = _q952;
            }
            let _c1007: boolean = _c978;
            if (!_c1007) {
              let _g979 = 0;
              G980: {
                const _a981 = sp.adj8[v_c];
                for (let _i982 = 0; _i982 < _a981.length; _i982++) {
                  const _t983 = sp.adj8Edges[v_c][_i982];
                  if (!((((b.grid[_t983] || -1) === 1) || (v_H.includes(_t983))))) continue;
                  _g979++;
                }
              }
              let _c994: boolean = !((_g979 < (_k916[v_c] ?? takes(sp, cl, v_c))));
              if (_c994) {
                let _q984 = true;
                Q985: {
                  const _a987 = throughWhere(sp, v_c, (_te986: number): boolean => {  return (((b.grid[_te986] || -1) === 1) || (v_H.includes(_te986))); });
                  for (let _i988 = 0; _i988 < _a987.length; _i988++) {
                    const v_x = _a987[_i988];
                    let _g989 = 0;
                    G990: {
                      const _a991 = sp.adj8[v_x];
                      for (let _i992 = 0; _i992 < _a991.length; _i992++) {
                        const _t993 = sp.adj8Edges[v_x][_i992];
                        if (!((((b.grid[_t993] || -1) === 1) || (v_H.includes(_t993))))) continue;
                        _g989++;
                      }
                    }
                    if (!(!((_g989 < (_k916[v_x] ?? takes(sp, cl, v_x)))))) {
                      _q984 = false;
                      break Q985;
                    }
                  }
                }
                _c994 = _q984;
              }
              let _c1006: boolean = _c994;
              if (_c1006) {
                let _g995 = 0;
                G996: {
                  const _a998 = throughWhere(sp, v_c, (_te997: number): boolean => {  return (((b.grid[_te997] || -1) === 1) || (v_H.includes(_te997))); });
                  for (let _i999 = 0; _i999 < _a998.length; _i999++) {
                    const v_x = _a998[_i999];
                    const _h1000 = clueAt(cl.number, v_x);
                    if (!((_h1000 !== -1))) continue;
                    _g995++;
                  }
                }
                let _g1001 = 0;
                G1002: {
                  const _a1003 = sp.cells;
                  for (let _i1004 = 0; _i1004 < _a1003.length; _i1004++) {
                    const v_y = _a1003[_i1004];
                    const _h1005 = clueAt(cl.number, v_y);
                    if (!((_h1005 !== -1))) continue;
                    _g1001++;
                  }
                }
                _c1006 = (_g995 < _g1001);
              }
              _c1007 = _c1006;
            }
            let _c1092: boolean = _c1007;
            if (!_c1092) {
              let _q1008 = false;
              Q1009: {
                const _a1010 = v_U;
                for (let _i1011 = 0; _i1011 < _a1010.length; _i1011++) {
                  const v_x = _a1010[_i1011];
                  if (!((v_x !== v_y))) continue;
                  let _q1012 = false;
                  Q1013: {
                    let _g1014 = 0;
                    G1015: {
                      const _a1016 = sp.adj8[v_x];
                      for (let _i1017 = 0; _i1017 < _a1016.length; _i1017++) {
                        const _t1018 = sp.adj8Edges[v_x][_i1017];
                        if (!((((b.grid[_t1018] || -1) === 1) || (v_H.includes(_t1018))))) continue;
                        _g1014++;
                      }
                    }
                    L1019: {
                      const v_n = ((_k916[v_x] ?? takes(sp, cl, v_x)) - _g1014);
                      if (!((v_n > 0))) break L1019;
                      let _g1020 = 0;
                      G1021: {
                        const _a1022 = sp.adj8[v_x];
                        for (let _i1023 = 0; _i1023 < _a1022.length; _i1023++) {
                          const v_y = _a1022[_i1023];
                          let _c1030: boolean = (!((b.grid[sp.adj8Edges[v_x][_i1023]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_x][_i1023])));
                          if (_c1030) {
                            let _g1024 = 0;
                            G1025: {
                              const _a1027 = sp.adj8[v_y];
                              for (let _i1028 = 0; _i1028 < _a1027.length; _i1028++) {
                                const _t1029 = sp.adj8Edges[v_y][_i1028];
                                if (!((((b.grid[_t1029] || -1) === 1) || (v_H.includes(_t1029))))) continue;
                                _g1024++;
                              }
                            }
                            _c1030 = (_g1024 < (_k916[v_y] ?? takes(sp, cl, v_y)));
                          }
                          let _c1033: boolean = _c1030;
                          if (_c1033) {
                            let _c1032: boolean = (sp.crossing[sp.adj8Edges[v_x][_i1023]] !== -1);
                            if (_c1032) {
                              const _t1031 = sp.crossing[sp.adj8Edges[v_x][_i1023]];
                              _c1032 = (((b.grid[_t1031] || -1) === 1) || (v_H.includes(_t1031)));
                            }
                            _c1033 = !(_c1032);
                          }
                          if (!(_c1033)) continue;
                          _g1020++;
                        }
                      }
                      if ((_g1020 < v_n)) {
                        _q1012 = true;
                        break Q1013;
                      }
                    }
                  }
                  let _c1060: boolean = _q1012;
                  if (!_c1060) {
                    let _q1034 = false;
                    Q1035: {
                      const _a1036 = sp.adj8[v_x];
                      for (let _i1037 = 0; _i1037 < _a1036.length; _i1037++) {
                        const v_s = _a1036[_i1037];
                        let _q1038 = false;
                        Q1039: {
                          let _g1040 = 0;
                          G1041: {
                            const _a1042 = sp.adj8[v_s];
                            for (let _i1043 = 0; _i1043 < _a1042.length; _i1043++) {
                              const _t1044 = sp.adj8Edges[v_s][_i1043];
                              if (!((((b.grid[_t1044] || -1) === 1) || (v_H.includes(_t1044))))) continue;
                              _g1040++;
                            }
                          }
                          L1045: {
                            const v_n = ((_k916[v_s] ?? takes(sp, cl, v_s)) - _g1040);
                            if (!((v_n > 0))) break L1045;
                            let _g1046 = 0;
                            G1047: {
                              const _a1048 = sp.adj8[v_s];
                              for (let _i1049 = 0; _i1049 < _a1048.length; _i1049++) {
                                const v_y = _a1048[_i1049];
                                let _c1056: boolean = (!((b.grid[sp.adj8Edges[v_s][_i1049]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i1049])));
                                if (_c1056) {
                                  let _g1050 = 0;
                                  G1051: {
                                    const _a1053 = sp.adj8[v_y];
                                    for (let _i1054 = 0; _i1054 < _a1053.length; _i1054++) {
                                      const _t1055 = sp.adj8Edges[v_y][_i1054];
                                      if (!((((b.grid[_t1055] || -1) === 1) || (v_H.includes(_t1055))))) continue;
                                      _g1050++;
                                    }
                                  }
                                  _c1056 = (_g1050 < (_k916[v_y] ?? takes(sp, cl, v_y)));
                                }
                                let _c1059: boolean = _c1056;
                                if (_c1059) {
                                  let _c1058: boolean = (sp.crossing[sp.adj8Edges[v_s][_i1049]] !== -1);
                                  if (_c1058) {
                                    const _t1057 = sp.crossing[sp.adj8Edges[v_s][_i1049]];
                                    _c1058 = (((b.grid[_t1057] || -1) === 1) || (v_H.includes(_t1057)));
                                  }
                                  _c1059 = !(_c1058);
                                }
                                if (!(_c1059)) continue;
                                _g1046++;
                              }
                            }
                            if ((_g1046 < v_n)) {
                              _q1038 = true;
                              break Q1039;
                            }
                          }
                        }
                        if (_q1038) {
                          _q1034 = true;
                          break Q1035;
                        }
                      }
                    }
                    _c1060 = _q1034;
                  }
                  let _c1091: boolean = _c1060;
                  if (!_c1091) {
                    let _g1061 = 0;
                    G1062: {
                      const _a1063 = sp.adj8[v_x];
                      for (let _i1064 = 0; _i1064 < _a1063.length; _i1064++) {
                        const _t1065 = sp.adj8Edges[v_x][_i1064];
                        if (!((((b.grid[_t1065] || -1) === 1) || (v_H.includes(_t1065))))) continue;
                        _g1061++;
                      }
                    }
                    let _c1077: boolean = !((_g1061 < (_k916[v_x] ?? takes(sp, cl, v_x))));
                    if (_c1077) {
                      let _q1066 = true;
                      Q1067: {
                        const _a1070 = throughWhere(sp, v_x, (_te1069: number): boolean => {  return (((b.grid[_te1069] || -1) === 1) || (v_H.includes(_te1069))); });
                        for (let _i1071 = 0; _i1071 < _a1070.length; _i1071++) {
                          const v_x_1068 = _a1070[_i1071];
                          let _g1072 = 0;
                          G1073: {
                            const _a1074 = sp.adj8[v_x_1068];
                            for (let _i1075 = 0; _i1075 < _a1074.length; _i1075++) {
                              const _t1076 = sp.adj8Edges[v_x_1068][_i1075];
                              if (!((((b.grid[_t1076] || -1) === 1) || (v_H.includes(_t1076))))) continue;
                              _g1072++;
                            }
                          }
                          if (!(!((_g1072 < (_k916[v_x_1068] ?? takes(sp, cl, v_x_1068)))))) {
                            _q1066 = false;
                            break Q1067;
                          }
                        }
                      }
                      _c1077 = _q1066;
                    }
                    let _c1090: boolean = _c1077;
                    if (_c1090) {
                      let _g1078 = 0;
                      G1079: {
                        const _a1082 = throughWhere(sp, v_x, (_te1081: number): boolean => {  return (((b.grid[_te1081] || -1) === 1) || (v_H.includes(_te1081))); });
                        for (let _i1083 = 0; _i1083 < _a1082.length; _i1083++) {
                          const v_x_1080 = _a1082[_i1083];
                          const _h1084 = clueAt(cl.number, v_x_1080);
                          if (!((_h1084 !== -1))) continue;
                          _g1078++;
                        }
                      }
                      let _g1085 = 0;
                      G1086: {
                        const _a1087 = sp.cells;
                        for (let _i1088 = 0; _i1088 < _a1087.length; _i1088++) {
                          const v_y = _a1087[_i1088];
                          const _h1089 = clueAt(cl.number, v_y);
                          if (!((_h1089 !== -1))) continue;
                          _g1085++;
                        }
                      }
                      _c1090 = (_g1078 < _g1085);
                    }
                    _c1091 = _c1090;
                  }
                  if (_c1091) {
                    _q1008 = true;
                    break Q1009;
                  }
                }
              }
              _c1092 = _q1008;
            }
            _c1093 = _c1092;
          }
          if (!(_c1093)) break L929;
          if (b.made[0] !== _m167_0 || b.made[1] !== _m167_1) {
            if (!(sameSet(v_U, ways(b, sp, cl, v_c)))) { continue R1; }
            let _g1094 = 0;
            G1095: {
              const _a1096 = sp.adj8[v_c];
              for (let _i1097 = 0; _i1097 < _a1096.length; _i1097++) {
                if (!(((b.grid[sp.adj8Edges[v_c][_i1097]] || -1) === 1))) continue;
                _g1094++;
              }
            }
            if (!(((_g1094 < takes(sp, cl, v_c)) && (v_U.length === ((takes(sp, cl, v_c) - _g1094) + 1))))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g1098 = 0;
            G1099: {
              const _a1100 = sp.adj8[v_c];
              for (let _i1101 = 0; _i1101 < _a1100.length; _i1101++) {
                if (!(((b.grid[sp.adj8Edges[v_c][_i1101]] || -1) === 1))) continue;
                _g1098++;
              }
            }
            const _g1102: number[] = [];
            G1103: {
              const _a1106 = v_U;
              for (let _i1107 = 0; _i1107 < _a1106.length; _i1107++) {
                const v_x = _a1106[_i1107];
                if (!((v_x !== v_y))) continue;
                const _t1108 = sp.edgeOf(v_c, v_x);
                if (!_g1102.includes(_t1108)) _g1102.push(_t1108);
              }
            }
            let _c1268: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
            if (_c1268) {
              let _q1109 = false;
              Q1110: {
                let _g1111 = 0;
                G1112: {
                  const _a1113 = sp.adj8[v_c];
                  for (let _i1114 = 0; _i1114 < _a1113.length; _i1114++) {
                    const _t1115 = sp.adj8Edges[v_c][_i1114];
                    if (!((((b.grid[_t1115] || -1) === 1) || (v_H.includes(_t1115))))) continue;
                    _g1111++;
                  }
                }
                L1116: {
                  const v_n = (takes(sp, cl, v_c) - _g1111);
                  if (!((v_n > 0))) break L1116;
                  let _g1117 = 0;
                  G1118: {
                    const _a1119 = sp.adj8[v_c];
                    for (let _i1120 = 0; _i1120 < _a1119.length; _i1120++) {
                      const v_y = _a1119[_i1120];
                      let _c1127: boolean = (!((b.grid[sp.adj8Edges[v_c][_i1120]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_c][_i1120])));
                      if (_c1127) {
                        let _g1121 = 0;
                        G1122: {
                          const _a1124 = sp.adj8[v_y];
                          for (let _i1125 = 0; _i1125 < _a1124.length; _i1125++) {
                            const _t1126 = sp.adj8Edges[v_y][_i1125];
                            if (!((((b.grid[_t1126] || -1) === 1) || (v_H.includes(_t1126))))) continue;
                            _g1121++;
                          }
                        }
                        _c1127 = (_g1121 < takes(sp, cl, v_y));
                      }
                      let _c1130: boolean = _c1127;
                      if (_c1130) {
                        let _c1129: boolean = (sp.crossing[sp.adj8Edges[v_c][_i1120]] !== -1);
                        if (_c1129) {
                          const _t1128 = sp.crossing[sp.adj8Edges[v_c][_i1120]];
                          _c1129 = (((b.grid[_t1128] || -1) === 1) || (v_H.includes(_t1128)));
                        }
                        _c1130 = !(_c1129);
                      }
                      if (!(_c1130)) continue;
                      _g1117++;
                    }
                  }
                  if ((_g1117 < v_n)) {
                    _q1109 = true;
                    break Q1110;
                  }
                }
              }
              let _c1157: boolean = _q1109;
              if (!_c1157) {
                let _q1131 = false;
                Q1132: {
                  const _a1133 = sp.adj8[v_c];
                  for (let _i1134 = 0; _i1134 < _a1133.length; _i1134++) {
                    const v_s = _a1133[_i1134];
                    let _q1135 = false;
                    Q1136: {
                      let _g1137 = 0;
                      G1138: {
                        const _a1139 = sp.adj8[v_s];
                        for (let _i1140 = 0; _i1140 < _a1139.length; _i1140++) {
                          const _t1141 = sp.adj8Edges[v_s][_i1140];
                          if (!((((b.grid[_t1141] || -1) === 1) || (v_H.includes(_t1141))))) continue;
                          _g1137++;
                        }
                      }
                      L1142: {
                        const v_n = (takes(sp, cl, v_s) - _g1137);
                        if (!((v_n > 0))) break L1142;
                        let _g1143 = 0;
                        G1144: {
                          const _a1145 = sp.adj8[v_s];
                          for (let _i1146 = 0; _i1146 < _a1145.length; _i1146++) {
                            const v_y = _a1145[_i1146];
                            let _c1153: boolean = (!((b.grid[sp.adj8Edges[v_s][_i1146]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i1146])));
                            if (_c1153) {
                              let _g1147 = 0;
                              G1148: {
                                const _a1150 = sp.adj8[v_y];
                                for (let _i1151 = 0; _i1151 < _a1150.length; _i1151++) {
                                  const _t1152 = sp.adj8Edges[v_y][_i1151];
                                  if (!((((b.grid[_t1152] || -1) === 1) || (v_H.includes(_t1152))))) continue;
                                  _g1147++;
                                }
                              }
                              _c1153 = (_g1147 < takes(sp, cl, v_y));
                            }
                            let _c1156: boolean = _c1153;
                            if (_c1156) {
                              let _c1155: boolean = (sp.crossing[sp.adj8Edges[v_s][_i1146]] !== -1);
                              if (_c1155) {
                                const _t1154 = sp.crossing[sp.adj8Edges[v_s][_i1146]];
                                _c1155 = (((b.grid[_t1154] || -1) === 1) || (v_H.includes(_t1154)));
                              }
                              _c1156 = !(_c1155);
                            }
                            if (!(_c1156)) continue;
                            _g1143++;
                          }
                        }
                        if ((_g1143 < v_n)) {
                          _q1135 = true;
                          break Q1136;
                        }
                      }
                    }
                    if (_q1135) {
                      _q1131 = true;
                      break Q1132;
                    }
                  }
                }
                _c1157 = _q1131;
              }
              let _c1184: boolean = _c1157;
              if (!_c1184) {
                let _g1158 = 0;
                G1159: {
                  const _a1160 = sp.adj8[v_c];
                  for (let _i1161 = 0; _i1161 < _a1160.length; _i1161++) {
                    const _t1162 = sp.adj8Edges[v_c][_i1161];
                    if (!((((b.grid[_t1162] || -1) === 1) || (v_H.includes(_t1162))))) continue;
                    _g1158++;
                  }
                }
                let _c1173: boolean = !((_g1158 < takes(sp, cl, v_c)));
                if (_c1173) {
                  let _q1163 = true;
                  Q1164: {
                    const _a1166 = throughWhere(sp, v_c, (_te1165: number): boolean => {  return (((b.grid[_te1165] || -1) === 1) || (v_H.includes(_te1165))); });
                    for (let _i1167 = 0; _i1167 < _a1166.length; _i1167++) {
                      const v_x = _a1166[_i1167];
                      let _g1168 = 0;
                      G1169: {
                        const _a1170 = sp.adj8[v_x];
                        for (let _i1171 = 0; _i1171 < _a1170.length; _i1171++) {
                          const _t1172 = sp.adj8Edges[v_x][_i1171];
                          if (!((((b.grid[_t1172] || -1) === 1) || (v_H.includes(_t1172))))) continue;
                          _g1168++;
                        }
                      }
                      if (!(!((_g1168 < takes(sp, cl, v_x))))) {
                        _q1163 = false;
                        break Q1164;
                      }
                    }
                  }
                  _c1173 = _q1163;
                }
                let _c1183: boolean = _c1173;
                if (_c1183) {
                  let _g1174 = 0;
                  G1175: {
                    const _a1177 = throughWhere(sp, v_c, (_te1176: number): boolean => {  return (((b.grid[_te1176] || -1) === 1) || (v_H.includes(_te1176))); });
                    for (let _i1178 = 0; _i1178 < _a1177.length; _i1178++) {
                      const v_x = _a1177[_i1178];
                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                      _g1174++;
                    }
                  }
                  let _g1179 = 0;
                  G1180: {
                    const _a1181 = sp.cells;
                    for (let _i1182 = 0; _i1182 < _a1181.length; _i1182++) {
                      const v_y = _a1181[_i1182];
                      if (!((clueAt(cl.number, v_y) !== -1))) continue;
                      _g1179++;
                    }
                  }
                  _c1183 = (_g1174 < _g1179);
                }
                _c1184 = _c1183;
              }
              let _c1267: boolean = _c1184;
              if (!_c1267) {
                let _q1185 = false;
                Q1186: {
                  const _a1187 = v_U;
                  for (let _i1188 = 0; _i1188 < _a1187.length; _i1188++) {
                    const v_x = _a1187[_i1188];
                    if (!((v_x !== v_y))) continue;
                    let _q1189 = false;
                    Q1190: {
                      let _g1191 = 0;
                      G1192: {
                        const _a1193 = sp.adj8[v_x];
                        for (let _i1194 = 0; _i1194 < _a1193.length; _i1194++) {
                          const _t1195 = sp.adj8Edges[v_x][_i1194];
                          if (!((((b.grid[_t1195] || -1) === 1) || (v_H.includes(_t1195))))) continue;
                          _g1191++;
                        }
                      }
                      L1196: {
                        const v_n = (takes(sp, cl, v_x) - _g1191);
                        if (!((v_n > 0))) break L1196;
                        let _g1197 = 0;
                        G1198: {
                          const _a1199 = sp.adj8[v_x];
                          for (let _i1200 = 0; _i1200 < _a1199.length; _i1200++) {
                            const v_y = _a1199[_i1200];
                            let _c1207: boolean = (!((b.grid[sp.adj8Edges[v_x][_i1200]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_x][_i1200])));
                            if (_c1207) {
                              let _g1201 = 0;
                              G1202: {
                                const _a1204 = sp.adj8[v_y];
                                for (let _i1205 = 0; _i1205 < _a1204.length; _i1205++) {
                                  const _t1206 = sp.adj8Edges[v_y][_i1205];
                                  if (!((((b.grid[_t1206] || -1) === 1) || (v_H.includes(_t1206))))) continue;
                                  _g1201++;
                                }
                              }
                              _c1207 = (_g1201 < takes(sp, cl, v_y));
                            }
                            let _c1210: boolean = _c1207;
                            if (_c1210) {
                              let _c1209: boolean = (sp.crossing[sp.adj8Edges[v_x][_i1200]] !== -1);
                              if (_c1209) {
                                const _t1208 = sp.crossing[sp.adj8Edges[v_x][_i1200]];
                                _c1209 = (((b.grid[_t1208] || -1) === 1) || (v_H.includes(_t1208)));
                              }
                              _c1210 = !(_c1209);
                            }
                            if (!(_c1210)) continue;
                            _g1197++;
                          }
                        }
                        if ((_g1197 < v_n)) {
                          _q1189 = true;
                          break Q1190;
                        }
                      }
                    }
                    let _c1237: boolean = _q1189;
                    if (!_c1237) {
                      let _q1211 = false;
                      Q1212: {
                        const _a1213 = sp.adj8[v_x];
                        for (let _i1214 = 0; _i1214 < _a1213.length; _i1214++) {
                          const v_s = _a1213[_i1214];
                          let _q1215 = false;
                          Q1216: {
                            let _g1217 = 0;
                            G1218: {
                              const _a1219 = sp.adj8[v_s];
                              for (let _i1220 = 0; _i1220 < _a1219.length; _i1220++) {
                                const _t1221 = sp.adj8Edges[v_s][_i1220];
                                if (!((((b.grid[_t1221] || -1) === 1) || (v_H.includes(_t1221))))) continue;
                                _g1217++;
                              }
                            }
                            L1222: {
                              const v_n = (takes(sp, cl, v_s) - _g1217);
                              if (!((v_n > 0))) break L1222;
                              let _g1223 = 0;
                              G1224: {
                                const _a1225 = sp.adj8[v_s];
                                for (let _i1226 = 0; _i1226 < _a1225.length; _i1226++) {
                                  const v_y = _a1225[_i1226];
                                  let _c1233: boolean = (!((b.grid[sp.adj8Edges[v_s][_i1226]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i1226])));
                                  if (_c1233) {
                                    let _g1227 = 0;
                                    G1228: {
                                      const _a1230 = sp.adj8[v_y];
                                      for (let _i1231 = 0; _i1231 < _a1230.length; _i1231++) {
                                        const _t1232 = sp.adj8Edges[v_y][_i1231];
                                        if (!((((b.grid[_t1232] || -1) === 1) || (v_H.includes(_t1232))))) continue;
                                        _g1227++;
                                      }
                                    }
                                    _c1233 = (_g1227 < takes(sp, cl, v_y));
                                  }
                                  let _c1236: boolean = _c1233;
                                  if (_c1236) {
                                    let _c1235: boolean = (sp.crossing[sp.adj8Edges[v_s][_i1226]] !== -1);
                                    if (_c1235) {
                                      const _t1234 = sp.crossing[sp.adj8Edges[v_s][_i1226]];
                                      _c1235 = (((b.grid[_t1234] || -1) === 1) || (v_H.includes(_t1234)));
                                    }
                                    _c1236 = !(_c1235);
                                  }
                                  if (!(_c1236)) continue;
                                  _g1223++;
                                }
                              }
                              if ((_g1223 < v_n)) {
                                _q1215 = true;
                                break Q1216;
                              }
                            }
                          }
                          if (_q1215) {
                            _q1211 = true;
                            break Q1212;
                          }
                        }
                      }
                      _c1237 = _q1211;
                    }
                    let _c1266: boolean = _c1237;
                    if (!_c1266) {
                      let _g1238 = 0;
                      G1239: {
                        const _a1240 = sp.adj8[v_x];
                        for (let _i1241 = 0; _i1241 < _a1240.length; _i1241++) {
                          const _t1242 = sp.adj8Edges[v_x][_i1241];
                          if (!((((b.grid[_t1242] || -1) === 1) || (v_H.includes(_t1242))))) continue;
                          _g1238++;
                        }
                      }
                      let _c1254: boolean = !((_g1238 < takes(sp, cl, v_x)));
                      if (_c1254) {
                        let _q1243 = true;
                        Q1244: {
                          const _a1247 = throughWhere(sp, v_x, (_te1246: number): boolean => {  return (((b.grid[_te1246] || -1) === 1) || (v_H.includes(_te1246))); });
                          for (let _i1248 = 0; _i1248 < _a1247.length; _i1248++) {
                            const v_x_1245 = _a1247[_i1248];
                            let _g1249 = 0;
                            G1250: {
                              const _a1251 = sp.adj8[v_x_1245];
                              for (let _i1252 = 0; _i1252 < _a1251.length; _i1252++) {
                                const _t1253 = sp.adj8Edges[v_x_1245][_i1252];
                                if (!((((b.grid[_t1253] || -1) === 1) || (v_H.includes(_t1253))))) continue;
                                _g1249++;
                              }
                            }
                            if (!(!((_g1249 < takes(sp, cl, v_x_1245))))) {
                              _q1243 = false;
                              break Q1244;
                            }
                          }
                        }
                        _c1254 = _q1243;
                      }
                      let _c1265: boolean = _c1254;
                      if (_c1265) {
                        let _g1255 = 0;
                        G1256: {
                          const _a1259 = throughWhere(sp, v_x, (_te1258: number): boolean => {  return (((b.grid[_te1258] || -1) === 1) || (v_H.includes(_te1258))); });
                          for (let _i1260 = 0; _i1260 < _a1259.length; _i1260++) {
                            const v_x_1257 = _a1259[_i1260];
                            if (!((clueAt(cl.number, v_x_1257) !== -1))) continue;
                            _g1255++;
                          }
                        }
                        let _g1261 = 0;
                        G1262: {
                          const _a1263 = sp.cells;
                          for (let _i1264 = 0; _i1264 < _a1263.length; _i1264++) {
                            const v_y = _a1263[_i1264];
                            if (!((clueAt(cl.number, v_y) !== -1))) continue;
                            _g1261++;
                          }
                        }
                        _c1265 = (_g1255 < _g1261);
                      }
                      _c1266 = _c1265;
                    }
                    if (_c1266) {
                      _q1185 = true;
                      break Q1186;
                    }
                  }
                }
                _c1267 = _q1185;
              }
              _c1268 = _c1267;
            }
            freshBinding("spareBreaks", [(sp.cells.includes(v_c)), sameSet(v_U, ways(b, sp, cl, v_c)), ((_g1098 < takes(sp, cl, v_c)) && (v_U.length === ((takes(sp, cl, v_c) - _g1098) + 1))), (v_U.includes(v_y)), sameSet(v_H, _g1102), _c1268], ["c in", "U =", "where of U", "y in", "H =", "where of H"]);
          }
          facts.length = 0;
          changed = false;
          const _t1269 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t1269] !== 0)) { if (fire === null) { b.placeAt(_t1269, 1); changed = true; } else facts.push(PLACE, _t1269, 1); }
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
