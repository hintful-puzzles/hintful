// Compiled by `npm run describe` from src/games/pearl/pearl.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, edgeGroups, keptEdgeGroups, keptStore, minus, rangeMask, setOf, type Footprint, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  pearl: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "square" | "blackPearl" | "blackRunsOn" | "blackCannotRunOn" | "whiteCannotTurn" | "whiteTurnsOpposite" | "closed" | "earlyLoop" | "earlyThrough";

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
  { id: "square", tier: 0 },
  { id: "blackPearl", tier: 0 },
  { id: "blackRunsOn", tier: 0 },
  { id: "blackCannotRunOn", tier: 0 },
  { id: "whiteCannotTurn", tier: 0 },
  { id: "whiteTurnsOpposite", tier: 0 },
  { id: "closed", tier: 0 },
  { id: "earlyLoop", tier: 1 },
  { id: "earlyThrough", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g1339: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1317 = true;
  Q1318: {
    const _a1319 = sp.cells;
    for (let _i1320 = 0; _i1320 < _a1319.length; _i1320++) {
      const v_c = _a1319[_i1320];
      let _g1321 = 0;
      G1322: {
        const _a1323 = sp.cellEdges[v_c];
        for (let _i1324 = 0; _i1324 < _a1323.length; _i1324++) {
          const v_e = _a1323[_i1324];
          const _h1325 = (g[v_e] || -1);
          if (!((_h1325 === 1))) continue;
          _g1321++;
        }
      }
      let _c1331: boolean = (_g1321 === 0);
      if (!_c1331) {
        let _g1326 = 0;
        G1327: {
          const _a1328 = sp.cellEdges[v_c];
          for (let _i1329 = 0; _i1329 < _a1328.length; _i1329++) {
            const v_e = _a1328[_i1329];
            const _h1330 = (g[v_e] || -1);
            if (!((_h1330 === 1))) continue;
            _g1326++;
          }
        }
        _c1331 = (_g1326 === 2);
      }
      if (!(_c1331)) {
        _q1317 = false;
        break Q1318;
      }
    }
  }
  if (!(_q1317)) return false;
  let _q1332 = false;
  Q1333: {
    const _a1334 = sp.edges;
    for (let _i1335 = 0; _i1335 < _a1334.length; _i1335++) {
      const v_e = _a1334[_i1335];
      const _h1336 = (g[v_e] || -1);
      if ((_h1336 === 1)) {
        _q1332 = true;
        break Q1333;
      }
    }
  }
  let _c1361: boolean = _q1332;
  if (_c1361) {
    let _q1337 = true;
    Q1338: {
      _g1339.length = 0;
      G1340: {
        const _a1343 = sp.edges;
        for (let _i1344 = 0; _i1344 < _a1343.length; _i1344++) {
          const v_e = _a1343[_i1344];
          const _h1345 = (g[v_e] || -1);
          if (!((_h1345 === 1))) continue;
          _g1339.push(v_e);
        }
      }
      const v_L = _g1339;
      const _eg1360 = edgeGroups(sp, v_L);
      const _a1346 = sp.cells;
      for (let _i1347 = 0; _i1347 < _a1346.length; _i1347++) {
        const v_a = _a1346[_i1347];
        let _g1348 = 0;
        G1349: {
          const _a1350 = sp.cellEdges[v_a];
          for (let _i1351 = 0; _i1351 < _a1350.length; _i1351++) {
            const v_e = _a1350[_i1351];
            const _h1352 = (g[v_e] || -1);
            if (!((_h1352 === 1))) continue;
            _g1348++;
          }
        }
        if (!((_g1348 > 0))) continue;
        const _a1353 = sp.cells;
        for (let _i1354 = 0; _i1354 < _a1353.length; _i1354++) {
          const v_b = _a1353[_i1354];
          let _g1355 = 0;
          G1356: {
            const _a1357 = sp.cellEdges[v_b];
            for (let _i1358 = 0; _i1358 < _a1357.length; _i1358++) {
              const v_e = _a1357[_i1358];
              const _h1359 = (g[v_e] || -1);
              if (!((_h1359 === 1))) continue;
              _g1355++;
            }
          }
          if (!((_g1355 > 0))) continue;
          if (!((_eg1360.of(v_b) === _eg1360.of(v_a)))) {
            _q1337 = false;
            break Q1338;
          }
        }
      }
    }
    _c1361 = _q1337;
  }
  if (!(_c1361)) return false;
  for (let _k1362 = 0; _k1362 < cl.pearl.at.length; _k1362++) {
    const _at1363 = cl.pearl.at[_k1362];
    const _v1364 = cl.pearl.v[_k1362];
    let _g1365 = 0;
    G1366: {
      const _a1367 = sp.cellEdges[_at1363];
      for (let _i1368 = 0; _i1368 < _a1367.length; _i1368++) {
        const v_e = _a1367[_i1368];
        const _h1369 = (g[v_e] || -1);
        if (!((_h1369 === 1))) continue;
        _g1365++;
      }
    }
    let _c1384: boolean = (_g1365 === 2);
    if (_c1384) {
      let _q1370 = true;
      Q1371: {
        const _a1372 = sp.cellEdges[_at1363];
        for (let _i1373 = 0; _i1373 < _a1372.length; _i1373++) {
          const v_e = _a1372[_i1373];
          const _h1377 = (g[v_e] || -1);
          const _h1378 = (_h1377 === 1);
          const _a1374 = sp.cellEdges[_at1363];
          const _n1375 = _i1373;
          for (let _i1376 = 0; _i1376 < _n1375; _i1376++) {
            const v_x = _a1374[_i1376];
            const _h1379 = (g[v_x] || -1);
            if (!((_h1378 && (_h1379 === 1)))) continue;
            let _q1380 = false;
            Q1381: {
              const _a1382 = sp.edgeFaces[v_e];
              for (let _i1383 = 0; _i1383 < _a1382.length; _i1383++) {
                const v_f = _a1382[_i1383];
                if ((sp.edgeFaces[v_x].includes(v_f))) {
                  _q1380 = true;
                  break Q1381;
                }
              }
            }
            if (!((_q1380 === (_v1364 === 1)))) {
              _q1370 = false;
              break Q1371;
            }
          }
        }
      }
      _c1384 = _q1370;
    }
    let _c1401: boolean = _c1384;
    if (_c1401) {
      let _c1400: boolean = (_v1364 !== 1);
      if (!_c1400) {
        let _q1385 = true;
        Q1386: {
          const _a1387 = sp.cellEdges[_at1363];
          for (let _i1388 = 0; _i1388 < _a1387.length; _i1388++) {
            const v_e = _a1387[_i1388];
            const _h1389 = (g[v_e] || -1);
            if (!((_h1389 === 1))) continue;
            let _q1390 = false;
            Q1391: {
              const _a1392 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1363 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1393 = 0; _i1393 < _a1392.length; _i1393++) {
                const v_x = _a1392[_i1393];
                const _h1394 = (g[v_x] || -1);
                let _c1399: boolean = ((v_x !== v_e) && (_h1394 === 1));
                if (_c1399) {
                  let _q1395 = false;
                  Q1396: {
                    const _a1397 = sp.edgeFaces[v_x];
                    for (let _i1398 = 0; _i1398 < _a1397.length; _i1398++) {
                      const v_f = _a1397[_i1398];
                      if ((sp.edgeFaces[v_e].includes(v_f))) {
                        _q1395 = true;
                        break Q1396;
                      }
                    }
                  }
                  _c1399 = !(_q1395);
                }
                if (_c1399) {
                  _q1390 = true;
                  break Q1391;
                }
              }
            }
            if (!(_q1390)) {
              _q1385 = false;
              break Q1386;
            }
          }
        }
        _c1400 = _q1385;
      }
      _c1401 = _c1400;
    }
    let _c1418: boolean = _c1401;
    if (_c1418) {
      let _c1417: boolean = (_v1364 !== 2);
      if (!_c1417) {
        let _q1402 = false;
        Q1403: {
          const _a1404 = sp.cellEdges[_at1363];
          for (let _i1405 = 0; _i1405 < _a1404.length; _i1405++) {
            const v_e = _a1404[_i1405];
            const _h1406 = (g[v_e] || -1);
            if (!((_h1406 === 1))) continue;
            let _q1407 = false;
            Q1408: {
              const _a1409 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1363 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1410 = 0; _i1410 < _a1409.length; _i1410++) {
                const v_x = _a1409[_i1410];
                const _h1411 = (g[v_x] || -1);
                let _c1416: boolean = ((v_x !== v_e) && (_h1411 === 1));
                if (_c1416) {
                  let _q1412 = false;
                  Q1413: {
                    const _a1414 = sp.edgeFaces[v_x];
                    for (let _i1415 = 0; _i1415 < _a1414.length; _i1415++) {
                      const v_f = _a1414[_i1415];
                      if ((sp.edgeFaces[v_e].includes(v_f))) {
                        _q1412 = true;
                        break Q1413;
                      }
                    }
                  }
                  _c1416 = _q1412;
                }
                if (_c1416) {
                  _q1407 = true;
                  break Q1408;
                }
              }
            }
            if (_q1407) {
              _q1402 = true;
              break Q1403;
            }
          }
        }
        _c1417 = _q1402;
      }
      _c1418 = _c1417;
    }
    if (!(_c1418)) return false;
  }
  return true;
}

export interface SquareBinding {
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const squareFacts: number[] = [];
let squareCands = new Int32Array(0);

/** What a binding at one element of its first binder reads. */
const squareFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function square(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareBinding> | null): number {
  const _g126: number[] = [];
  const _g134: number[] = [];
  const _p158 = new Int32Array(sp.edges.length);
  let _l159: readonly number[] = [];
  let _y160 = false;
  const _f164 = new Int32Array(sp.edges.length).fill(-1);
  let _l165: readonly number[] = [];
  const _s166: number[] = [];
  const _g180: number[] = [];
  const _p204 = new Int32Array(sp.edges.length);
  let _l205: readonly number[] = [];
  let _y206 = false;
  const _f210 = new Int32Array(sp.edges.length).fill(-1);
  let _l211: readonly number[] = [];
  const _s212: number[] = [];
  const facts = squareFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (squareCands.length < sp.edges.length) squareCands = new Int32Array(sp.edges.length);
  const cands = squareCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(squareFootprint) ?? null) : null;
  const _a123 = sp.cells;
  for (let _i124 = 0; _i124 < _a123.length; _i124++) {
    const v_c = _a123[_i124];
    const _h125 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h125 !== 1))) continue;
    let _g161 = -1;
    const _h179 = (_h125 === -1);
    let _g207 = -1;
    _g126.length = 0;
    G127: {
      const _a130 = sp.cellEdges[v_c];
      for (let _i131 = 0; _i131 < _a130.length; _i131++) {
        const v_e = _a130[_i131];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g126.push(v_e);
      }
    }
    L132: {
      const v_F = _g126;
      const _h133 = v_F.length;
      if (!((_h133 > 0))) break L132;
      _g134.length = 0;
      G135: {
        const _a156 = v_F;
        for (let _i157 = 0; _i157 < _a156.length; _i157++) {
          const v_e = _a156[_i157];
          if (_g161 !== _epoch) {
            _g161 = _epoch;
            for (const _e162 of _l159) _p158[_e162] = 0;
            _y160 = false;
            const _a163 = sp.cellEdges[v_c];
            for (const _e167 of _l165) _f164[_e167] = -1;
            _l165 = _a163;
            let _i169 = 0;
            _s166[0] = 0;
            let _o173 = _a163.length === 0;
            for (;;) {
              if (_a163.length === 0) {
                if (!_o173) break;
                _o173 = false;
              }
              while (_a163.length > 0 && _i169 >= 0) {
                const _e167 = _a163[_i169];
                if (_s166[_i169] > 0) _f164[_e167] = -1;
                let _r172 = (cands[_e167] >= 0 ? cands[_e167] : (cands[_e167] = b.cands[_e167])) & ~((2 << _s166[_i169]) - 1);
                let _d168 = 0;
                V171: for (; _r172 !== 0; _r172 &= _r172 - 1) {
                  _d168 = 31 - Math.clz32(_r172 & -_r172);
                  _f164[_e167] = _d168;
                  for (let _j170 = 0; _j170 < _i169; _j170++) {
                    const _y174 = _a163[_j170];
                    if (!(((_f164[_e167] === 1) && (_f164[_y174] === 1)))) continue;
                    if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e167, _y174)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e167, _y174)))))) continue V171;
                  }
                  break;
                }
                if (_r172 === 0) {
                  _s166[_i169] = 0;
                  _i169--;
                  continue;
                }
                _s166[_i169] = _d168;
                if (_i169 === _a163.length - 1) break;
                _i169++;
                _s166[_i169] = 0;
              }
              if (_i169 < 0) break;
              let _g175 = 0;
              G176: {
                const _a177 = sp.cellEdges[v_c];
                for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                  const v_x = _a177[_i178];
                  if (!((_f164[v_x] === 1))) continue;
                  _g175++;
                }
              }
              if (!(((_g175 === 2) || ((_g175 === 0) && _h179)))) continue;
              if (!(true)) continue;
              _l159 = _a163;
              _y160 = true;
              for (const _e162 of _a163) _p158[_e162] |= 1 << _f164[_e162];
            }
          }
          if (!(((((_p158[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y160 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g134.push(v_e);
        }
      }
      const v_W = _g134;
      _g180.length = 0;
      G181: {
        const _a202 = v_F;
        for (let _i203 = 0; _i203 < _a202.length; _i203++) {
          const v_e = _a202[_i203];
          if (_g207 !== _epoch) {
            _g207 = _epoch;
            for (const _e208 of _l205) _p204[_e208] = 0;
            _y206 = false;
            const _a209 = sp.cellEdges[v_c];
            for (const _e213 of _l211) _f210[_e213] = -1;
            _l211 = _a209;
            let _i215 = 0;
            _s212[0] = 0;
            let _o219 = _a209.length === 0;
            for (;;) {
              if (_a209.length === 0) {
                if (!_o219) break;
                _o219 = false;
              }
              while (_a209.length > 0 && _i215 >= 0) {
                const _e213 = _a209[_i215];
                if (_s212[_i215] > 0) _f210[_e213] = -1;
                let _r218 = (cands[_e213] >= 0 ? cands[_e213] : (cands[_e213] = b.cands[_e213])) & ~((2 << _s212[_i215]) - 1);
                let _d214 = 0;
                V217: for (; _r218 !== 0; _r218 &= _r218 - 1) {
                  _d214 = 31 - Math.clz32(_r218 & -_r218);
                  _f210[_e213] = _d214;
                  for (let _j216 = 0; _j216 < _i215; _j216++) {
                    const _y220 = _a209[_j216];
                    if (!(((_f210[_e213] === 1) && (_f210[_y220] === 1)))) continue;
                    if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e213, _y220)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e213, _y220)))))) continue V217;
                  }
                  break;
                }
                if (_r218 === 0) {
                  _s212[_i215] = 0;
                  _i215--;
                  continue;
                }
                _s212[_i215] = _d214;
                if (_i215 === _a209.length - 1) break;
                _i215++;
                _s212[_i215] = 0;
              }
              if (_i215 < 0) break;
              let _g221 = 0;
              G222: {
                const _a223 = sp.cellEdges[v_c];
                for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                  const v_x = _a223[_i224];
                  if (!((_f210[v_x] === 1))) continue;
                  _g221++;
                }
              }
              if (!(((_g221 === 2) || ((_g221 === 0) && _h179)))) continue;
              if (!(true)) continue;
              _l205 = _a209;
              _y206 = true;
              for (const _e208 of _a209) _p204[_e208] |= 1 << _f210[_e208];
            }
          }
          if (!(((((_p204[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y206 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g180.push(v_e);
        }
      }
      L225: {
        const v_N = _g180;
        let _q226 = false;
        Q227: {
          const _a228 = v_F;
          for (let _i229 = 0; _i229 < _a228.length; _i229++) {
            const v_e = _a228[_i229];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q226 = true;
              break Q227;
            }
          }
        }
        if (!(_q226)) break L225;
        facts.length = 0;
        changed = false;
        let _q230 = true;
        Q231: {
          const _a232 = v_F;
          for (let _i233 = 0; _i233 < _a232.length; _i233++) {
            const v_e = _a232[_i233];
            let _c235: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c235) {
              let _c234: boolean = !(!(v_W.includes(v_e)));
              if (!_c234) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c234 = true;
              }
              _c235 = _c234;
            }
            let _c237: boolean = _c235;
            if (_c237) {
              let _c236: boolean = !(!(v_N.includes(v_e)));
              if (!_c236) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c236 = true;
              }
              _c237 = _c236;
            }
            if (!(_c237)) {
              _q230 = false;
              break Q231;
            }
          }
        }
        if (!(_q230)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface BlackPearlBinding {
  c: number;
  e: number;
  A: boolean;
  B: boolean;
}

const blackPearlFacts: number[] = [];
let blackPearlCands = new Int32Array(0);

/** What a binding at one element of its first binder reads. */
const blackPearlFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackPearl(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackPearlBinding> | null): number {
  const _p284 = new Int32Array(sp.edges.length);
  let _l285: readonly number[] = [];
  let _y286 = false;
  const _f290 = new Int32Array(sp.edges.length).fill(-1);
  let _l291: readonly number[] = [];
  const _s292: number[] = [];
  const _p305 = new Int32Array(sp.edges.length);
  let _l306: readonly number[] = [];
  let _y307 = false;
  const _f311 = new Int32Array(sp.edges.length).fill(-1);
  let _l312: readonly number[] = [];
  const _s313: number[] = [];
  const facts = blackPearlFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (blackPearlCands.length < sp.edges.length) blackPearlCands = new Int32Array(sp.edges.length);
  const cands = blackPearlCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(blackPearlFootprint) ?? null) : null;
  const _a279 = cluesValued(cl.pearl, 1);
  for (let _i280 = 0; _i280 < _a279.length; _i280++) {
    const v_c = _a279[_i280];
    const _h281 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h281 === 1))) continue;
    let _g287 = -1;
    let _g308 = -1;
    const _a282 = sp.cellEdges[v_c];
    for (let _i283 = 0; _i283 < _a282.length; _i283++) {
      const v_e = _a282[_i283];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g287 !== _epoch) {
        _g287 = _epoch;
        for (const _e288 of _l285) _p284[_e288] = 0;
        _y286 = false;
        const _a289 = sp.cellEdges[v_c];
        for (const _e293 of _l291) _f290[_e293] = -1;
        _l291 = _a289;
        let _i295 = 0;
        _s292[0] = 0;
        let _o299 = _a289.length === 0;
        for (;;) {
          if (_a289.length === 0) {
            if (!_o299) break;
            _o299 = false;
          }
          while (_a289.length > 0 && _i295 >= 0) {
            const _e293 = _a289[_i295];
            if (_s292[_i295] > 0) _f290[_e293] = -1;
            let _r298 = (cands[_e293] >= 0 ? cands[_e293] : (cands[_e293] = b.cands[_e293])) & ~((2 << _s292[_i295]) - 1);
            let _d294 = 0;
            V297: for (; _r298 !== 0; _r298 &= _r298 - 1) {
              _d294 = 31 - Math.clz32(_r298 & -_r298);
              _f290[_e293] = _d294;
              for (let _j296 = 0; _j296 < _i295; _j296++) {
                const _y300 = _a289[_j296];
                if (!(((_f290[_e293] === 1) && (_f290[_y300] === 1)))) continue;
                if (!(bent(sp, _e293, _y300))) continue V297;
              }
              break;
            }
            if (_r298 === 0) {
              _s292[_i295] = 0;
              _i295--;
              continue;
            }
            _s292[_i295] = _d294;
            if (_i295 === _a289.length - 1) break;
            _i295++;
            _s292[_i295] = 0;
          }
          if (_i295 < 0) break;
          let _g301 = 0;
          G302: {
            const _a303 = sp.cellEdges[v_c];
            for (let _i304 = 0; _i304 < _a303.length; _i304++) {
              const v_x = _a303[_i304];
              if (!((_f290[v_x] === 1))) continue;
              _g301++;
            }
          }
          if (!((_g301 === 2))) continue;
          if (!(true)) continue;
          _l285 = _a289;
          _y286 = true;
          for (const _e288 of _a289) _p284[_e288] |= 1 << _f290[_e288];
        }
      }
      const v_A = ((((_p284[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y286 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g308 !== _epoch) {
        _g308 = _epoch;
        for (const _e309 of _l306) _p305[_e309] = 0;
        _y307 = false;
        const _a310 = sp.cellEdges[v_c];
        for (const _e314 of _l312) _f311[_e314] = -1;
        _l312 = _a310;
        let _i316 = 0;
        _s313[0] = 0;
        let _o320 = _a310.length === 0;
        for (;;) {
          if (_a310.length === 0) {
            if (!_o320) break;
            _o320 = false;
          }
          while (_a310.length > 0 && _i316 >= 0) {
            const _e314 = _a310[_i316];
            if (_s313[_i316] > 0) _f311[_e314] = -1;
            let _r319 = (cands[_e314] >= 0 ? cands[_e314] : (cands[_e314] = b.cands[_e314])) & ~((2 << _s313[_i316]) - 1);
            let _d315 = 0;
            V318: for (; _r319 !== 0; _r319 &= _r319 - 1) {
              _d315 = 31 - Math.clz32(_r319 & -_r319);
              _f311[_e314] = _d315;
              for (let _j317 = 0; _j317 < _i316; _j317++) {
                const _y321 = _a310[_j317];
                if (!(((_f311[_e314] === 1) && (_f311[_y321] === 1)))) continue;
                if (!(bent(sp, _e314, _y321))) continue V318;
              }
              break;
            }
            if (_r319 === 0) {
              _s313[_i316] = 0;
              _i316--;
              continue;
            }
            _s313[_i316] = _d315;
            if (_i316 === _a310.length - 1) break;
            _i316++;
            _s313[_i316] = 0;
          }
          if (_i316 < 0) break;
          let _g322 = 0;
          G323: {
            const _a324 = sp.cellEdges[v_c];
            for (let _i325 = 0; _i325 < _a324.length; _i325++) {
              const v_x = _a324[_i325];
              if (!((_f311[v_x] === 1))) continue;
              _g322++;
            }
          }
          if (!((_g322 === 2))) continue;
          if (!(true)) continue;
          _l306 = _a310;
          _y307 = true;
          for (const _e309 of _a310) _p305[_e309] |= 1 << _f311[_e309];
        }
      }
      L326: {
        const v_B = ((((_p305[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y307 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L326;
        facts.length = 0;
        changed = false;
        let _c328: boolean = (v_A || v_B);
        if (_c328) {
          let _c327: boolean = !(!(v_A));
          if (!_c327) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c327 = true;
          }
          _c328 = _c327;
        }
        let _c330: boolean = _c328;
        if (_c330) {
          let _c329: boolean = !(!(v_B));
          if (!_c329) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c329 = true;
          }
          _c330 = _c329;
        }
        if (!(_c330)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface BlackRunsOnBinding {
  c: number;
  e: number;
  j: number;
}

const blackRunsOnFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function blackRunsOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackRunsOnBinding> | null): number {
  const facts = blackRunsOnFacts;
  let fired = 0;
  let changed = false;
  const _a340 = cluesValued(cl.pearl, 1);
  for (let _i341 = 0; _i341 < _a340.length; _i341++) {
    const v_c = _a340[_i341];
    const _h342 = clueAt(cl.pearl, v_c);
    if (!((_h342 === 1))) continue;
    const _a343 = sp.cellEdges[v_c];
    for (let _i344 = 0; _i344 < _a343.length; _i344++) {
      const v_e = _a343[_i344];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      L345: {
        const v_j = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        let _q346 = false;
        Q347: {
          const _a348 = sp.cellEdges[v_j];
          for (let _i349 = 0; _i349 < _a348.length; _i349++) {
            const v_x = _a348[_i349];
            if ((((v_x !== v_e) && !(bent(sp, v_x, v_e))) && ((b.grid[v_x] || -1) === 1))) {
              _q346 = true;
              break Q347;
            }
          }
        }
        if (!(!(_q346))) break L345;
        facts.length = 0;
        changed = false;
        let _q350 = false;
        Q351: {
          const _a352 = sp.cellEdges[v_j];
          for (let _i353 = 0; _i353 < _a352.length; _i353++) {
            const v_x = _a352[_i353];
            if (((v_x !== v_e) && !(bent(sp, v_x, v_e)))) {
              _q350 = true;
              break Q351;
            }
          }
        }
        let _c361: boolean = _q350;
        if (_c361) {
          let _q354 = true;
          Q355: {
            const _a356 = sp.cellEdges[v_j];
            for (let _i357 = 0; _i357 < _a356.length; _i357++) {
              const v_x = _a356[_i357];
              if (!((v_x !== v_e))) continue;
              let _c358: boolean = !(bent(sp, v_x, v_e));
              if (!_c358) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c358 = true;
              }
              let _c360: boolean = _c358;
              if (_c360) {
                let _c359: boolean = !(!(bent(sp, v_x, v_e)));
                if (!_c359) {
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  _c359 = true;
                }
                _c360 = _c359;
              }
              if (!(_c360)) {
                _q354 = false;
                break Q355;
              }
            }
          }
          _c361 = _q354;
        }
        if (!(_c361)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, j: v_j }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface BlackCannotRunOnBinding {
  c: number;
  e: number;
  j: number;
}

const blackCannotRunOnFacts: number[] = [];
let blackCannotRunOnCands = new Int32Array(0);

/** Its dearest read grows with the board as 1. */
export function blackCannotRunOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackCannotRunOnBinding> | null): number {
  const _f399 = new Int32Array(sp.edges.length).fill(-1);
  let _l400: readonly number[] = [];
  const _s401: number[] = [];
  const facts = blackCannotRunOnFacts;
  let fired = 0;
  let changed = false;
  if (blackCannotRunOnCands.length < sp.edges.length) blackCannotRunOnCands = new Int32Array(sp.edges.length);
  const cands = blackCannotRunOnCands;
  cands.fill(-1);
  const _a390 = cluesValued(cl.pearl, 1);
  for (let _i391 = 0; _i391 < _a390.length; _i391++) {
    const v_c = _a390[_i391];
    const _h392 = clueAt(cl.pearl, v_c);
    if (!((_h392 === 1))) continue;
    const _a393 = sp.cellEdges[v_c];
    for (let _i394 = 0; _i394 < _a393.length; _i394++) {
      const v_e = _a393[_i394];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      L395: {
        const v_j = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        const _h409 = clueAt(cl.pearl, v_j);
        const _h410 = (_h409 !== 1);
        let _q396 = false;
        Q397: {
          const _a398 = sp.cellEdges[v_j];
          for (const _e402 of _l400) _f399[_e402] = -1;
          _l400 = _a398;
          let _i404 = 0;
          _s401[0] = 0;
          let _o408 = _a398.length === 0;
          for (;;) {
            if (_a398.length === 0) {
              if (!_o408) break;
              _o408 = false;
            }
            while (_a398.length > 0 && _i404 >= 0) {
              const _e402 = _a398[_i404];
              if (_s401[_i404] > 0) _f399[_e402] = -1;
              let _r407 = (cands[_e402] >= 0 ? cands[_e402] : (cands[_e402] = b.cands[_e402])) & ~((2 << _s401[_i404]) - 1);
              let _d403 = 0;
              for (; _r407 !== 0; _r407 &= _r407 - 1) {
                _d403 = 31 - Math.clz32(_r407 & -_r407);
                _f399[_e402] = _d403;
                if (_e402 === v_e && _d403 !== 1) continue;
                break;
              }
              if (_r407 === 0) {
                _s401[_i404] = 0;
                _i404--;
                continue;
              }
              _s401[_i404] = _d403;
              if (_i404 === _a398.length - 1) break;
              _i404++;
              _s401[_i404] = 0;
            }
            if (_i404 < 0) break;
            let _c415: boolean = _h410;
            if (_c415) {
              let _g411 = 0;
              G412: {
                const _a413 = sp.cellEdges[v_j];
                for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                  const v_x = _a413[_i414];
                  if (!((_f399[v_x] === 1))) continue;
                  _g411++;
                }
              }
              _c415 = (_g411 === 2);
            }
            let _c420: boolean = _c415;
            if (_c420) {
              let _q416 = true;
              Q417: {
                const _a418 = sp.cellEdges[v_j];
                for (let _i419 = 0; _i419 < _a418.length; _i419++) {
                  const v_x = _a418[_i419];
                  if (!(((_f399[v_x] === 1) && (v_x !== v_e)))) continue;
                  if (!(!(bent(sp, v_x, v_e)))) {
                    _q416 = false;
                    break Q417;
                  }
                }
              }
              _c420 = _q416;
            }
            if (!(_c420)) continue;
            if (true) {
              _q396 = true;
              break Q397;
            }
          }
        }
        if (!(!(_q396))) break L395;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, j: v_j }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface WhiteCannotTurnBinding {
  c: number;
  e: number;
  f: number;
  P: readonly number[];
}

const whiteCannotTurnFacts: number[] = [];
let whiteCannotTurnCands = new Int32Array(0);

/** Its dearest read grows with the board as 1. */
export function whiteCannotTurn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteCannotTurnBinding> | null): number {
  const _p501 = new Int32Array(sp.edges.length);
  let _l502: readonly number[] = [];
  let _y503 = false;
  const _f507 = new Int32Array(sp.edges.length).fill(-1);
  let _l508: readonly number[] = [];
  const _s509: number[] = [];
  const _f534 = new Int32Array(sp.edges.length).fill(-1);
  let _l535: readonly number[] = [];
  const _s536: number[] = [];
  const _g557: number[] = [];
  const facts = whiteCannotTurnFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteCannotTurnCands.length < sp.edges.length) whiteCannotTurnCands = new Int32Array(sp.edges.length);
  const cands = whiteCannotTurnCands;
  cands.fill(-1);
  const _a488 = cluesValued(cl.pearl, 2);
  for (let _i489 = 0; _i489 < _a488.length; _i489++) {
    const v_c = _a488[_i489];
    const _h490 = clueAt(cl.pearl, v_c);
    let _c495: boolean = (_h490 === 2);
    if (_c495) {
      let _q491 = false;
      Q492: {
        const _a493 = sp.cellEdges[v_c];
        for (let _i494 = 0; _i494 < _a493.length; _i494++) {
          const v_x = _a493[_i494];
          if (!((b.grid[v_x] !== 0))) {
            _q491 = true;
            break Q492;
          }
        }
      }
      _c495 = _q491;
    }
    if (!(_c495)) continue;
    const _a496 = sp.cellEdges[v_c];
    for (let _i497 = 0; _i497 < _a496.length; _i497++) {
      const v_e = _a496[_i497];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      const _h500 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g504 = -1;
      const _h517 = clueAt(cl.pearl, _h500);
      const _h518 = (_h517 !== 2);
      const _a498 = sp.cellEdges[v_c];
      for (let _i499 = 0; _i499 < _a498.length; _i499++) {
        const v_f = _a498[_i499];
        let _c529: boolean = (((_i499 > _i497) && !(bent(sp, v_e, v_f))) && ((b.grid[v_f] || -1) !== 2));
        if (_c529) {
          if (_g504 !== _epoch) {
            _g504 = _epoch;
            for (const _e505 of _l502) _p501[_e505] = 0;
            _y503 = false;
            const _a506 = sp.cellEdges[_h500];
            for (const _e510 of _l508) _f507[_e510] = -1;
            _l508 = _a506;
            let _i512 = 0;
            _s509[0] = 0;
            let _o516 = _a506.length === 0;
            for (;;) {
              if (_a506.length === 0) {
                if (!_o516) break;
                _o516 = false;
              }
              while (_a506.length > 0 && _i512 >= 0) {
                const _e510 = _a506[_i512];
                if (_s509[_i512] > 0) _f507[_e510] = -1;
                let _r515 = (cands[_e510] >= 0 ? cands[_e510] : (cands[_e510] = b.cands[_e510])) & ~((2 << _s509[_i512]) - 1);
                let _d511 = 0;
                for (; _r515 !== 0; _r515 &= _r515 - 1) {
                  _d511 = 31 - Math.clz32(_r515 & -_r515);
                  _f507[_e510] = _d511;
                  break;
                }
                if (_r515 === 0) {
                  _s509[_i512] = 0;
                  _i512--;
                  continue;
                }
                _s509[_i512] = _d511;
                if (_i512 === _a506.length - 1) break;
                _i512++;
                _s509[_i512] = 0;
              }
              if (_i512 < 0) break;
              let _c523: boolean = _h518;
              if (_c523) {
                let _g519 = 0;
                G520: {
                  const _a521 = sp.cellEdges[_h500];
                  for (let _i522 = 0; _i522 < _a521.length; _i522++) {
                    const v_x = _a521[_i522];
                    if (!((_f507[v_x] === 1))) continue;
                    _g519++;
                  }
                }
                _c523 = (_g519 === 2);
              }
              let _c528: boolean = _c523;
              if (_c528) {
                let _q524 = true;
                Q525: {
                  const _a526 = sp.cellEdges[_h500];
                  for (let _i527 = 0; _i527 < _a526.length; _i527++) {
                    const v_x = _a526[_i527];
                    if (!(((_f507[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q524 = false;
                      break Q525;
                    }
                  }
                }
                _c528 = _q524;
              }
              if (!(_c528)) continue;
              if (!(true)) continue;
              _l502 = _a506;
              _y503 = true;
              for (const _e505 of _a506) _p501[_e505] |= 1 << _f507[_e505];
            }
          }
          _c529 = !(((((_p501[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y503 && !sp.cellEdges[_h500].includes(v_e))));
        }
        let _c556: boolean = _c529;
        if (_c556) {
          const _t530 = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h544 = clueAt(cl.pearl, _t530);
          const _h545 = (_h544 !== 2);
          let _q531 = false;
          Q532: {
            const _a533 = sp.cellEdges[_t530];
            for (const _e537 of _l535) _f534[_e537] = -1;
            _l535 = _a533;
            let _i539 = 0;
            _s536[0] = 0;
            let _o543 = _a533.length === 0;
            for (;;) {
              if (_a533.length === 0) {
                if (!_o543) break;
                _o543 = false;
              }
              while (_a533.length > 0 && _i539 >= 0) {
                const _e537 = _a533[_i539];
                if (_s536[_i539] > 0) _f534[_e537] = -1;
                let _r542 = (cands[_e537] >= 0 ? cands[_e537] : (cands[_e537] = b.cands[_e537])) & ~((2 << _s536[_i539]) - 1);
                let _d538 = 0;
                for (; _r542 !== 0; _r542 &= _r542 - 1) {
                  _d538 = 31 - Math.clz32(_r542 & -_r542);
                  _f534[_e537] = _d538;
                  if (_e537 === v_f && _d538 !== 1) continue;
                  break;
                }
                if (_r542 === 0) {
                  _s536[_i539] = 0;
                  _i539--;
                  continue;
                }
                _s536[_i539] = _d538;
                if (_i539 === _a533.length - 1) break;
                _i539++;
                _s536[_i539] = 0;
              }
              if (_i539 < 0) break;
              let _c550: boolean = _h545;
              if (_c550) {
                let _g546 = 0;
                G547: {
                  const _a548 = sp.cellEdges[_t530];
                  for (let _i549 = 0; _i549 < _a548.length; _i549++) {
                    const v_x = _a548[_i549];
                    if (!((_f534[v_x] === 1))) continue;
                    _g546++;
                  }
                }
                _c550 = (_g546 === 2);
              }
              let _c555: boolean = _c550;
              if (_c555) {
                let _q551 = true;
                Q552: {
                  const _a553 = sp.cellEdges[_t530];
                  for (let _i554 = 0; _i554 < _a553.length; _i554++) {
                    const v_x = _a553[_i554];
                    if (!(((_f534[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(bent(sp, v_x, v_f))) {
                      _q551 = false;
                      break Q552;
                    }
                  }
                }
                _c555 = _q551;
              }
              if (!(_c555)) continue;
              if (true) {
                _q531 = true;
                break Q532;
              }
            }
          }
          _c556 = !(_q531);
        }
        if (!(_c556)) continue;
        _g557.length = 0;
        G558: {
          const _a561 = sp.cellEdges[v_c];
          for (let _i562 = 0; _i562 < _a561.length; _i562++) {
            const v_x = _a561[_i562];
            if (!(((v_x !== v_e) && (v_x !== v_f)))) continue;
            _g557.push(v_x);
          }
        }
        const v_P = _g557;
        const _h564 = v_P.length;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        let _c563: boolean = true;
        if (_c563) {
          if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
          _c563 = true;
        }
        let _c569: boolean = (_c563 && (_h564 === 2));
        if (_c569) {
          let _q565 = true;
          Q566: {
            const _a567 = v_P;
            for (let _i568 = 0; _i568 < _a567.length; _i568++) {
              const v_x = _a567[_i568];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q565 = false;
                break Q566;
              }
            }
          }
          _c569 = _q565;
        }
        if (!(_c569)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, f: v_f, P: v_P.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface WhiteTurnsOppositeBinding {
  c: number;
  e: number;
  f: number;
  k: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const whiteTurnsOppositeFacts: number[] = [];
let whiteTurnsOppositeCands = new Int32Array(0);

/** Its dearest read grows with the board as 1. */
export function whiteTurnsOpposite(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteTurnsOppositeBinding> | null): number {
  const _p749 = new Int32Array(sp.edges.length);
  let _l750: readonly number[] = [];
  let _y751 = false;
  const _f755 = new Int32Array(sp.edges.length).fill(-1);
  let _l756: readonly number[] = [];
  const _s757: number[] = [];
  const _f782 = new Int32Array(sp.edges.length).fill(-1);
  let _l783: readonly number[] = [];
  const _s784: number[] = [];
  const _g804: number[] = [];
  const _g812: number[] = [];
  const _f844 = new Int32Array(sp.edges.length).fill(-1);
  let _l845: readonly number[] = [];
  const _s846: number[] = [];
  const _g865: number[] = [];
  const _f897 = new Int32Array(sp.edges.length).fill(-1);
  let _l898: readonly number[] = [];
  const _s899: number[] = [];
  const facts = whiteTurnsOppositeFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteTurnsOppositeCands.length < sp.edges.length) whiteTurnsOppositeCands = new Int32Array(sp.edges.length);
  const cands = whiteTurnsOppositeCands;
  cands.fill(-1);
  const _a741 = cluesValued(cl.pearl, 2);
  for (let _i742 = 0; _i742 < _a741.length; _i742++) {
    const v_c = _a741[_i742];
    const _h743 = clueAt(cl.pearl, v_c);
    if (!((_h743 === 2))) continue;
    const _a744 = sp.cellEdges[v_c];
    for (let _i745 = 0; _i745 < _a744.length; _i745++) {
      const v_e = _a744[_i745];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      const _h748 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g752 = -1;
      const _h765 = clueAt(cl.pearl, _h748);
      const _h766 = (_h765 !== 2);
      const _a746 = sp.cellEdges[v_c];
      for (let _i747 = 0; _i747 < _a746.length; _i747++) {
        const v_f = _a746[_i747];
        let _c777: boolean = (((v_f !== v_e) && ((b.grid[v_f] || -1) === 1)) && !(bent(sp, v_e, v_f)));
        if (_c777) {
          if (_g752 !== _epoch) {
            _g752 = _epoch;
            for (const _e753 of _l750) _p749[_e753] = 0;
            _y751 = false;
            const _a754 = sp.cellEdges[_h748];
            for (const _e758 of _l756) _f755[_e758] = -1;
            _l756 = _a754;
            let _i760 = 0;
            _s757[0] = 0;
            let _o764 = _a754.length === 0;
            for (;;) {
              if (_a754.length === 0) {
                if (!_o764) break;
                _o764 = false;
              }
              while (_a754.length > 0 && _i760 >= 0) {
                const _e758 = _a754[_i760];
                if (_s757[_i760] > 0) _f755[_e758] = -1;
                let _r763 = (cands[_e758] >= 0 ? cands[_e758] : (cands[_e758] = b.cands[_e758])) & ~((2 << _s757[_i760]) - 1);
                let _d759 = 0;
                for (; _r763 !== 0; _r763 &= _r763 - 1) {
                  _d759 = 31 - Math.clz32(_r763 & -_r763);
                  _f755[_e758] = _d759;
                  break;
                }
                if (_r763 === 0) {
                  _s757[_i760] = 0;
                  _i760--;
                  continue;
                }
                _s757[_i760] = _d759;
                if (_i760 === _a754.length - 1) break;
                _i760++;
                _s757[_i760] = 0;
              }
              if (_i760 < 0) break;
              let _c771: boolean = _h766;
              if (_c771) {
                let _g767 = 0;
                G768: {
                  const _a769 = sp.cellEdges[_h748];
                  for (let _i770 = 0; _i770 < _a769.length; _i770++) {
                    const v_x = _a769[_i770];
                    if (!((_f755[v_x] === 1))) continue;
                    _g767++;
                  }
                }
                _c771 = (_g767 === 2);
              }
              let _c776: boolean = _c771;
              if (_c776) {
                let _q772 = true;
                Q773: {
                  const _a774 = sp.cellEdges[_h748];
                  for (let _i775 = 0; _i775 < _a774.length; _i775++) {
                    const v_x = _a774[_i775];
                    if (!(((_f755[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q772 = false;
                      break Q773;
                    }
                  }
                }
                _c776 = _q772;
              }
              if (!(_c776)) continue;
              if (!(true)) continue;
              _l750 = _a754;
              _y751 = true;
              for (const _e753 of _a754) _p749[_e753] |= 1 << _f755[_e753];
            }
          }
          _c777 = !(((((_p749[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y751 && !sp.cellEdges[_h748].includes(v_e))));
        }
        if (!(_c777)) continue;
        L778: {
          const v_k = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h792 = clueAt(cl.pearl, v_k);
          const _h793 = (_h792 !== 1);
          let _q779 = false;
          Q780: {
            const _a781 = sp.cellEdges[v_k];
            for (const _e785 of _l783) _f782[_e785] = -1;
            _l783 = _a781;
            let _i787 = 0;
            _s784[0] = 0;
            let _o791 = _a781.length === 0;
            for (;;) {
              if (_a781.length === 0) {
                if (!_o791) break;
                _o791 = false;
              }
              while (_a781.length > 0 && _i787 >= 0) {
                const _e785 = _a781[_i787];
                if (_s784[_i787] > 0) _f782[_e785] = -1;
                let _r790 = (cands[_e785] >= 0 ? cands[_e785] : (cands[_e785] = b.cands[_e785])) & ~((2 << _s784[_i787]) - 1);
                let _d786 = 0;
                for (; _r790 !== 0; _r790 &= _r790 - 1) {
                  _d786 = 31 - Math.clz32(_r790 & -_r790);
                  _f782[_e785] = _d786;
                  if (_e785 === v_f && _d786 !== 1) continue;
                  break;
                }
                if (_r790 === 0) {
                  _s784[_i787] = 0;
                  _i787--;
                  continue;
                }
                _s784[_i787] = _d786;
                if (_i787 === _a781.length - 1) break;
                _i787++;
                _s784[_i787] = 0;
              }
              if (_i787 < 0) break;
              let _c798: boolean = _h793;
              if (_c798) {
                let _g794 = 0;
                G795: {
                  const _a796 = sp.cellEdges[v_k];
                  for (let _i797 = 0; _i797 < _a796.length; _i797++) {
                    const v_x = _a796[_i797];
                    if (!((_f782[v_x] === 1))) continue;
                    _g794++;
                  }
                }
                _c798 = (_g794 === 2);
              }
              let _c803: boolean = _c798;
              if (_c803) {
                let _q799 = true;
                Q800: {
                  const _a801 = sp.cellEdges[v_k];
                  for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                    const v_x = _a801[_i802];
                    if (!(((_f782[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(!(bent(sp, v_x, v_f)))) {
                      _q799 = false;
                      break Q800;
                    }
                  }
                }
                _c803 = _q799;
              }
              if (!(_c803)) continue;
              if (true) {
                _q779 = true;
                break Q780;
              }
            }
          }
          if (!(_q779)) break L778;
          const _h854 = (_h792 !== 2);
          _g804.length = 0;
          G805: {
            const _a808 = sp.cellEdges[v_k];
            for (let _i809 = 0; _i809 < _a808.length; _i809++) {
              const v_x = _a808[_i809];
              if (!(!((b.grid[v_x] !== 0)))) continue;
              _g804.push(v_x);
            }
          }
          L810: {
            const v_F = _g804;
            const _h811 = v_F.length;
            if (!((_h811 > 0))) break L810;
            _g812.length = 0;
            G813: {
              const _a839 = v_F;
              for (let _i840 = 0; _i840 < _a839.length; _i840++) {
                const v_x = _a839[_i840];
                let _q841 = false;
                Q842: {
                  const _a843 = sp.cellEdges[v_k];
                  for (const _e847 of _l845) _f844[_e847] = -1;
                  _l845 = _a843;
                  let _i849 = 0;
                  _s846[0] = 0;
                  let _o853 = _a843.length === 0;
                  for (;;) {
                    if (_a843.length === 0) {
                      if (!_o853) break;
                      _o853 = false;
                    }
                    while (_a843.length > 0 && _i849 >= 0) {
                      const _e847 = _a843[_i849];
                      if (_s846[_i849] > 0) _f844[_e847] = -1;
                      let _r852 = (cands[_e847] >= 0 ? cands[_e847] : (cands[_e847] = b.cands[_e847])) & ~((2 << _s846[_i849]) - 1);
                      let _d848 = 0;
                      for (; _r852 !== 0; _r852 &= _r852 - 1) {
                        _d848 = 31 - Math.clz32(_r852 & -_r852);
                        _f844[_e847] = _d848;
                        if (_e847 === v_f && _d848 !== 1) continue;
                        if (_e847 === v_x && _d848 !== 1) continue;
                        break;
                      }
                      if (_r852 === 0) {
                        _s846[_i849] = 0;
                        _i849--;
                        continue;
                      }
                      _s846[_i849] = _d848;
                      if (_i849 === _a843.length - 1) break;
                      _i849++;
                      _s846[_i849] = 0;
                    }
                    if (_i849 < 0) break;
                    let _c859: boolean = _h854;
                    if (_c859) {
                      let _g855 = 0;
                      G856: {
                        const _a857 = sp.cellEdges[v_k];
                        for (let _i858 = 0; _i858 < _a857.length; _i858++) {
                          const v_y = _a857[_i858];
                          if (!((_f844[v_y] === 1))) continue;
                          _g855++;
                        }
                      }
                      _c859 = (_g855 === 2);
                    }
                    let _c864: boolean = _c859;
                    if (_c864) {
                      let _q860 = true;
                      Q861: {
                        const _a862 = sp.cellEdges[v_k];
                        for (let _i863 = 0; _i863 < _a862.length; _i863++) {
                          const v_y = _a862[_i863];
                          if (!(((_f844[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q860 = false;
                            break Q861;
                          }
                        }
                      }
                      _c864 = _q860;
                    }
                    if (!(_c864)) continue;
                    if (true) {
                      _q841 = true;
                      break Q842;
                    }
                  }
                }
                if (!(_q841)) continue;
                _g812.push(v_x);
              }
            }
            const v_W = _g812;
            _g865.length = 0;
            G866: {
              const _a892 = v_F;
              for (let _i893 = 0; _i893 < _a892.length; _i893++) {
                const v_x = _a892[_i893];
                let _q894 = false;
                Q895: {
                  const _a896 = sp.cellEdges[v_k];
                  for (const _e900 of _l898) _f897[_e900] = -1;
                  _l898 = _a896;
                  let _i902 = 0;
                  _s899[0] = 0;
                  let _o906 = _a896.length === 0;
                  for (;;) {
                    if (_a896.length === 0) {
                      if (!_o906) break;
                      _o906 = false;
                    }
                    while (_a896.length > 0 && _i902 >= 0) {
                      const _e900 = _a896[_i902];
                      if (_s899[_i902] > 0) _f897[_e900] = -1;
                      let _r905 = (cands[_e900] >= 0 ? cands[_e900] : (cands[_e900] = b.cands[_e900])) & ~((2 << _s899[_i902]) - 1);
                      let _d901 = 0;
                      for (; _r905 !== 0; _r905 &= _r905 - 1) {
                        _d901 = 31 - Math.clz32(_r905 & -_r905);
                        _f897[_e900] = _d901;
                        if (_e900 === v_f && _d901 !== 1) continue;
                        if (_e900 === v_x && _d901 !== 2) continue;
                        break;
                      }
                      if (_r905 === 0) {
                        _s899[_i902] = 0;
                        _i902--;
                        continue;
                      }
                      _s899[_i902] = _d901;
                      if (_i902 === _a896.length - 1) break;
                      _i902++;
                      _s899[_i902] = 0;
                    }
                    if (_i902 < 0) break;
                    let _c911: boolean = _h854;
                    if (_c911) {
                      let _g907 = 0;
                      G908: {
                        const _a909 = sp.cellEdges[v_k];
                        for (let _i910 = 0; _i910 < _a909.length; _i910++) {
                          const v_y = _a909[_i910];
                          if (!((_f897[v_y] === 1))) continue;
                          _g907++;
                        }
                      }
                      _c911 = (_g907 === 2);
                    }
                    let _c916: boolean = _c911;
                    if (_c916) {
                      let _q912 = true;
                      Q913: {
                        const _a914 = sp.cellEdges[v_k];
                        for (let _i915 = 0; _i915 < _a914.length; _i915++) {
                          const v_y = _a914[_i915];
                          if (!(((_f897[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q912 = false;
                            break Q913;
                          }
                        }
                      }
                      _c916 = _q912;
                    }
                    if (!(_c916)) continue;
                    if (true) {
                      _q894 = true;
                      break Q895;
                    }
                  }
                }
                if (!(_q894)) continue;
                _g865.push(v_x);
              }
            }
            L917: {
              const v_N = _g865;
              let _q918 = false;
              Q919: {
                const _a920 = v_F;
                for (let _i921 = 0; _i921 < _a920.length; _i921++) {
                  const v_x = _a920[_i921];
                  if ((!(v_W.includes(v_x)) || !(v_N.includes(v_x)))) {
                    _q918 = true;
                    break Q919;
                  }
                }
              }
              if (!(_q918)) break L917;
              facts.length = 0;
              changed = false;
              let _q922 = true;
              Q923: {
                const _a924 = v_F;
                for (let _i925 = 0; _i925 < _a924.length; _i925++) {
                  const v_x = _a924[_i925];
                  let _c927: boolean = ((v_W.includes(v_x)) || (v_N.includes(v_x)));
                  if (_c927) {
                    let _c926: boolean = !(!(v_W.includes(v_x)));
                    if (!_c926) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                      _c926 = true;
                    }
                    _c927 = _c926;
                  }
                  let _c929: boolean = _c927;
                  if (_c929) {
                    let _c928: boolean = !(!(v_N.includes(v_x)));
                    if (!_c928) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                      _c928 = true;
                    }
                    _c929 = _c928;
                  }
                  if (!(_c929)) {
                    _q922 = false;
                    break Q923;
                  }
                }
              }
              if (!(_q922)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ c: v_c, e: v_e, f: v_f, k: v_k, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
                cands.fill(-1);
                _epoch++;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface ClosedBinding {
  L: readonly number[];
  g: number;
  G: readonly number[];
}

const closedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function closed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClosedBinding> | null): number {
  const _g951: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g951.length = 0;
  G952: {
    const _a955 = sp.edges;
    for (let _i956 = 0; _i956 < _a955.length; _i956++) {
      const v_e = _a955[_i956];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g951.push(v_e);
    }
  }
  const v_L = _g951;
  const _eg972 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L957: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    let _c962: boolean = (v_g !== -1);
    if (_c962) {
      let _q958 = false;
      Q959: {
        const _a960 = sp.edges;
        for (let _i961 = 0; _i961 < _a960.length; _i961++) {
          const v_e = _a960[_i961];
          if (!((b.grid[v_e] !== 0))) {
            _q958 = true;
            break Q959;
          }
        }
      }
      _c962 = _q958;
    }
    let _c971: boolean = _c962;
    if (_c971) {
      let _q963 = true;
      Q964: {
        const _a965 = sp.cells;
        for (let _i966 = 0; _i966 < _a965.length; _i966++) {
          const v_c = _a965[_i966];
          let _g967 = 0;
          G968: {
            const _a969 = sp.cellEdges[v_c];
            for (let _i970 = 0; _i970 < _a969.length; _i970++) {
              const v_e = _a969[_i970];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g967++;
            }
          }
          if (!((_g967 !== 1))) {
            _q963 = false;
            break Q964;
          }
        }
      }
      _c971 = _q963;
    }
    if (!(_c971)) break L957;
    const v_G = _eg972.of(sp.edgeEnds[2 * v_g]);
    facts.length = 0;
    changed = false;
    let _q973 = true;
    Q974: {
      const _a975 = v_L;
      for (let _i976 = 0; _i976 < _a975.length; _i976++) {
        const v_x = _a975[_i976];
        if (!((_eg972.of(sp.edgeEnds[2 * v_x]) === v_G))) {
          _q973 = false;
          break Q974;
        }
      }
    }
    let _c982: boolean = _q973;
    if (_c982) {
      let _q977 = true;
      Q978: {
        const _a979 = sp.cells;
        for (let _i980 = 0; _i980 < _a979.length; _i980++) {
          const v_c = _a979[_i980];
          const _h981 = clueAt(cl.pearl, v_c);
          if (!((_h981 !== -1))) continue;
          if (!((_eg972.of(v_c) === v_G))) {
            _q977 = false;
            break Q978;
          }
        }
      }
      _c982 = _q977;
    }
    let _c987: boolean = _c982;
    if (_c987) {
      let _q983 = true;
      Q984: {
        const _a985 = sp.edges;
        for (let _i986 = 0; _i986 < _a985.length; _i986++) {
          const v_e = _a985[_i986];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
          if (!(true)) {
            _q983 = false;
            break Q984;
          }
        }
      }
      _c987 = _q983;
    }
    if (!(_c987)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ L: v_L.slice(), g: v_g, G: v_G.slice() }, facts)) return 1;
    }
  }
  return fired;
}

export interface EarlyLoopBinding {
  L: readonly number[];
  e: number;
  G: readonly number[];
}

const earlyLoopFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function earlyLoop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyLoopBinding> | null): number {
  const _g1008: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  _g1008.length = 0;
  G1009: {
    const _a1012 = sp.edges;
    for (let _i1013 = 0; _i1013 < _a1012.length; _i1013++) {
      const v_e = _a1012[_i1013];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1008.push(v_e);
    }
  }
  const v_L = _g1008;
  const _eg1016 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a1014 = sp.edges;
  for (let _i1015 = 0; _i1015 < _a1014.length; _i1015++) {
    const v_e = _a1014[_i1015];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L1017: {
      const v_G = _eg1016.of(sp.edgeEnds[2 * v_e]);
      let _c1029: boolean = (_eg1016.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c1029) {
        let _q1018 = false;
        Q1019: {
          const _a1020 = sp.cells;
          for (let _i1021 = 0; _i1021 < _a1020.length; _i1021++) {
            const v_c = _a1020[_i1021];
            const _h1022 = clueAt(cl.pearl, v_c);
            let _c1028: boolean = !(_eg1016.of(v_c) === v_G);
            if (_c1028) {
              let _c1027: boolean = (_h1022 !== -1);
              if (!_c1027) {
                let _g1023 = 0;
                G1024: {
                  const _a1025 = sp.cellEdges[v_c];
                  for (let _i1026 = 0; _i1026 < _a1025.length; _i1026++) {
                    const v_e = _a1025[_i1026];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1023++;
                  }
                }
                _c1027 = (_g1023 > 0);
              }
              _c1028 = _c1027;
            }
            if (_c1028) {
              _q1018 = true;
              break Q1019;
            }
          }
        }
        _c1029 = _q1018;
      }
      if (!(_c1029)) break L1017;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L.slice(), e: v_e, G: v_G.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface EarlyThroughBinding {
  L: readonly number[];
  Q: readonly number[];
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const earlyThroughFacts: number[] = [];
let earlyThroughCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function earlyThrough(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyThroughBinding> | null): number {
  const _g1174: number[] = [];
  const _g1180: number[] = [];
  const _g1203: number[] = [];
  const _g1211: number[] = [];
  const _p1235 = new Int32Array(sp.edges.length);
  let _l1236: readonly number[] = [];
  let _y1237 = false;
  const _f1241 = new Int32Array(sp.edges.length).fill(-1);
  let _l1242: readonly number[] = [];
  const _s1243: number[] = [];
  const _g1259: number[] = [];
  const _p1283 = new Int32Array(sp.edges.length);
  let _l1284: readonly number[] = [];
  let _y1285 = false;
  const _f1289 = new Int32Array(sp.edges.length).fill(-1);
  let _l1290: readonly number[] = [];
  const _s1291: number[] = [];
  const facts = earlyThroughFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (earlyThroughCands.length < sp.edges.length) earlyThroughCands = new Int32Array(sp.edges.length);
  const cands = earlyThroughCands;
  cands.fill(-1);
  _g1174.length = 0;
  G1175: {
    const _a1178 = sp.edges;
    for (let _i1179 = 0; _i1179 < _a1178.length; _i1179++) {
      const v_e = _a1178[_i1179];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1174.push(v_e);
    }
  }
  const v_L = _g1174;
  const _eg1252 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1180.length = 0;
  G1181: {
    const _a1189 = sp.cells;
    for (let _i1190 = 0; _i1190 < _a1189.length; _i1190++) {
      const v_q = _a1189[_i1190];
      const _h1191 = clueAt(cl.pearl, v_q);
      let _c1196: boolean = (_h1191 !== -1);
      if (!_c1196) {
        let _g1192 = 0;
        G1193: {
          const _a1194 = sp.cellEdges[v_q];
          for (let _i1195 = 0; _i1195 < _a1194.length; _i1195++) {
            const v_e = _a1194[_i1195];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g1192++;
          }
        }
        _c1196 = (_g1192 > 0);
      }
      if (!(_c1196)) continue;
      _g1180.push(v_q);
    }
  }
  const v_Q = _g1180;
  const _a1197 = sp.cells;
  for (let _i1198 = 0; _i1198 < _a1197.length; _i1198++) {
    const v_c = _a1197[_i1198];
    let _g1199 = 0;
    G1200: {
      const _a1201 = sp.cellEdges[v_c];
      for (let _i1202 = 0; _i1202 < _a1201.length; _i1202++) {
        const v_e = _a1201[_i1202];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g1199++;
      }
    }
    if (!((_g1199 === 0))) continue;
    let _g1238 = -1;
    const _h1257 = clueAt(cl.pearl, v_c);
    const _h1258 = (_h1257 === -1);
    let _g1286 = -1;
    _g1203.length = 0;
    G1204: {
      const _a1207 = sp.cellEdges[v_c];
      for (let _i1208 = 0; _i1208 < _a1207.length; _i1208++) {
        const v_e = _a1207[_i1208];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1203.push(v_e);
      }
    }
    L1209: {
      const v_F = _g1203;
      const _h1210 = v_F.length;
      if (!((_h1210 > 1))) break L1209;
      _g1211.length = 0;
      G1212: {
        const _a1233 = v_F;
        for (let _i1234 = 0; _i1234 < _a1233.length; _i1234++) {
          const v_e = _a1233[_i1234];
          if (_g1238 !== _epoch) {
            _g1238 = _epoch;
            for (const _e1239 of _l1236) _p1235[_e1239] = 0;
            _y1237 = false;
            const _a1240 = sp.cellEdges[v_c];
            for (const _e1244 of _l1242) _f1241[_e1244] = -1;
            _l1242 = _a1240;
            let _i1246 = 0;
            _s1243[0] = 0;
            let _o1250 = _a1240.length === 0;
            for (;;) {
              if (_a1240.length === 0) {
                if (!_o1250) break;
                _o1250 = false;
              }
              while (_a1240.length > 0 && _i1246 >= 0) {
                const _e1244 = _a1240[_i1246];
                if (_s1243[_i1246] > 0) _f1241[_e1244] = -1;
                let _r1249 = (cands[_e1244] >= 0 ? cands[_e1244] : (cands[_e1244] = b.cands[_e1244])) & ~((2 << _s1243[_i1246]) - 1);
                let _d1245 = 0;
                V1248: for (; _r1249 !== 0; _r1249 &= _r1249 - 1) {
                  _d1245 = 31 - Math.clz32(_r1249 & -_r1249);
                  _f1241[_e1244] = _d1245;
                  for (let _j1247 = 0; _j1247 < _i1246; _j1247++) {
                    const _y1251 = _a1240[_j1247];
                    if (!(((_f1241[_e1244] === 1) && (_f1241[_y1251] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1244, _y1251)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1244, _y1251)))) && (!(_eg1252.of((sp.edgeEnds[2 * _y1251] === v_c ? sp.edgeEnds[2 * _y1251 + 1] : sp.edgeEnds[2 * _y1251])) === _eg1252.of((sp.edgeEnds[2 * _e1244] === v_c ? sp.edgeEnds[2 * _e1244 + 1] : sp.edgeEnds[2 * _e1244]))) || (minus(minus(v_Q, _eg1252.of((sp.edgeEnds[2 * _e1244] === v_c ? sp.edgeEnds[2 * _e1244 + 1] : sp.edgeEnds[2 * _e1244]))), setOf(v_c)).length === 0))))) continue V1248;
                  }
                  break;
                }
                if (_r1249 === 0) {
                  _s1243[_i1246] = 0;
                  _i1246--;
                  continue;
                }
                _s1243[_i1246] = _d1245;
                if (_i1246 === _a1240.length - 1) break;
                _i1246++;
                _s1243[_i1246] = 0;
              }
              if (_i1246 < 0) break;
              let _g1253 = 0;
              G1254: {
                const _a1255 = sp.cellEdges[v_c];
                for (let _i1256 = 0; _i1256 < _a1255.length; _i1256++) {
                  const v_x = _a1255[_i1256];
                  if (!((_f1241[v_x] === 1))) continue;
                  _g1253++;
                }
              }
              if (!(((_g1253 === 2) || ((_g1253 === 0) && _h1258)))) continue;
              if (!(true)) continue;
              _l1236 = _a1240;
              _y1237 = true;
              for (const _e1239 of _a1240) _p1235[_e1239] |= 1 << _f1241[_e1239];
            }
          }
          if (!(((((_p1235[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y1237 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1211.push(v_e);
        }
      }
      const v_W = _g1211;
      _g1259.length = 0;
      G1260: {
        const _a1281 = v_F;
        for (let _i1282 = 0; _i1282 < _a1281.length; _i1282++) {
          const v_e = _a1281[_i1282];
          if (_g1286 !== _epoch) {
            _g1286 = _epoch;
            for (const _e1287 of _l1284) _p1283[_e1287] = 0;
            _y1285 = false;
            const _a1288 = sp.cellEdges[v_c];
            for (const _e1292 of _l1290) _f1289[_e1292] = -1;
            _l1290 = _a1288;
            let _i1294 = 0;
            _s1291[0] = 0;
            let _o1298 = _a1288.length === 0;
            for (;;) {
              if (_a1288.length === 0) {
                if (!_o1298) break;
                _o1298 = false;
              }
              while (_a1288.length > 0 && _i1294 >= 0) {
                const _e1292 = _a1288[_i1294];
                if (_s1291[_i1294] > 0) _f1289[_e1292] = -1;
                let _r1297 = (cands[_e1292] >= 0 ? cands[_e1292] : (cands[_e1292] = b.cands[_e1292])) & ~((2 << _s1291[_i1294]) - 1);
                let _d1293 = 0;
                V1296: for (; _r1297 !== 0; _r1297 &= _r1297 - 1) {
                  _d1293 = 31 - Math.clz32(_r1297 & -_r1297);
                  _f1289[_e1292] = _d1293;
                  for (let _j1295 = 0; _j1295 < _i1294; _j1295++) {
                    const _y1299 = _a1288[_j1295];
                    if (!(((_f1289[_e1292] === 1) && (_f1289[_y1299] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1292, _y1299)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1292, _y1299)))) && (!(_eg1252.of((sp.edgeEnds[2 * _y1299] === v_c ? sp.edgeEnds[2 * _y1299 + 1] : sp.edgeEnds[2 * _y1299])) === _eg1252.of((sp.edgeEnds[2 * _e1292] === v_c ? sp.edgeEnds[2 * _e1292 + 1] : sp.edgeEnds[2 * _e1292]))) || (minus(minus(v_Q, _eg1252.of((sp.edgeEnds[2 * _e1292] === v_c ? sp.edgeEnds[2 * _e1292 + 1] : sp.edgeEnds[2 * _e1292]))), setOf(v_c)).length === 0))))) continue V1296;
                  }
                  break;
                }
                if (_r1297 === 0) {
                  _s1291[_i1294] = 0;
                  _i1294--;
                  continue;
                }
                _s1291[_i1294] = _d1293;
                if (_i1294 === _a1288.length - 1) break;
                _i1294++;
                _s1291[_i1294] = 0;
              }
              if (_i1294 < 0) break;
              let _g1300 = 0;
              G1301: {
                const _a1302 = sp.cellEdges[v_c];
                for (let _i1303 = 0; _i1303 < _a1302.length; _i1303++) {
                  const v_x = _a1302[_i1303];
                  if (!((_f1289[v_x] === 1))) continue;
                  _g1300++;
                }
              }
              if (!(((_g1300 === 2) || ((_g1300 === 0) && _h1258)))) continue;
              if (!(true)) continue;
              _l1284 = _a1288;
              _y1285 = true;
              for (const _e1287 of _a1288) _p1283[_e1287] |= 1 << _f1289[_e1287];
            }
          }
          if (!(((((_p1283[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y1285 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1259.push(v_e);
        }
      }
      L1304: {
        const v_N = _g1259;
        let _q1305 = false;
        Q1306: {
          const _a1307 = v_F;
          for (let _i1308 = 0; _i1308 < _a1307.length; _i1308++) {
            const v_e = _a1307[_i1308];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q1305 = true;
              break Q1306;
            }
          }
        }
        if (!(_q1305)) break L1304;
        facts.length = 0;
        changed = false;
        let _q1309 = true;
        Q1310: {
          const _a1311 = v_F;
          for (let _i1312 = 0; _i1312 < _a1311.length; _i1312++) {
            const v_e = _a1311[_i1312];
            let _c1314: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c1314) {
              let _c1313: boolean = !(!(v_W.includes(v_e)));
              if (!_c1313) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c1313 = true;
              }
              _c1314 = _c1313;
            }
            let _c1316: boolean = _c1314;
            if (_c1316) {
              let _c1315: boolean = !(!(v_N.includes(v_e)));
              if (!_c1315) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c1315 = true;
              }
              _c1316 = _c1315;
            }
            if (!(_c1316)) {
              _q1309 = false;
              break Q1310;
            }
          }
        }
        if (!(_q1309)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), Q: v_Q.slice(), c: v_c, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

const bentKept = keptStore<Kept<boolean>>();

/** `bent(e, x)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function bent(sp: GridSpace, v_e: number, v_x: number): boolean {
  const _kept: Kept<Kept<boolean>> = bentKept.board(sp);
  const _kept1 = (_kept[v_e] ??= []);
  if (_kept1[v_x] !== undefined) return _kept1[v_x];
  let _q28 = false;
  Q29: {
    const _a30 = sp.edgeFaces[v_e];
    for (let _i31 = 0; _i31 < _a30.length; _i31++) {
      const v_f = _a30[_i31];
      if ((sp.edgeFaces[v_x].includes(v_f))) {
        _q28 = true;
        break Q29;
      }
    }
  }
  const _made = _q28;
  _kept1[v_x] = _made;
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}
