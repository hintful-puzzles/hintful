// Compiled by `npm run describe` from src/games/pearl/pearl.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, edgeGroups, keptEdgeGroups, keptStore, minus, rangeMask, sameSet, setOf, type Footprint, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g1368: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1346 = true;
  Q1347: {
    const _a1348 = sp.cells;
    for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
      const v_c = _a1348[_i1349];
      let _g1350 = 0;
      G1351: {
        const _a1352 = sp.cellEdges[v_c];
        for (let _i1353 = 0; _i1353 < _a1352.length; _i1353++) {
          const v_e = _a1352[_i1353];
          const _h1354 = (g[v_e] || -1);
          if (!((_h1354 === 1))) continue;
          _g1350++;
        }
      }
      let _c1360: boolean = (_g1350 === 0);
      if (!_c1360) {
        let _g1355 = 0;
        G1356: {
          const _a1357 = sp.cellEdges[v_c];
          for (let _i1358 = 0; _i1358 < _a1357.length; _i1358++) {
            const v_e = _a1357[_i1358];
            const _h1359 = (g[v_e] || -1);
            if (!((_h1359 === 1))) continue;
            _g1355++;
          }
        }
        _c1360 = (_g1355 === 2);
      }
      if (!(_c1360)) {
        _q1346 = false;
        break Q1347;
      }
    }
  }
  if (!(_q1346)) return false;
  let _q1361 = false;
  Q1362: {
    const _a1363 = sp.edges;
    for (let _i1364 = 0; _i1364 < _a1363.length; _i1364++) {
      const v_e = _a1363[_i1364];
      const _h1365 = (g[v_e] || -1);
      if ((_h1365 === 1)) {
        _q1361 = true;
        break Q1362;
      }
    }
  }
  let _c1390: boolean = _q1361;
  if (_c1390) {
    let _q1366 = true;
    Q1367: {
      _g1368.length = 0;
      G1369: {
        const _a1372 = sp.edges;
        for (let _i1373 = 0; _i1373 < _a1372.length; _i1373++) {
          const v_e = _a1372[_i1373];
          const _h1374 = (g[v_e] || -1);
          if (!((_h1374 === 1))) continue;
          _g1368.push(v_e);
        }
      }
      const v_L = _g1368;
      const _eg1389 = edgeGroups(sp, v_L);
      const _a1375 = sp.cells;
      for (let _i1376 = 0; _i1376 < _a1375.length; _i1376++) {
        const v_a = _a1375[_i1376];
        let _g1377 = 0;
        G1378: {
          const _a1379 = sp.cellEdges[v_a];
          for (let _i1380 = 0; _i1380 < _a1379.length; _i1380++) {
            const v_e = _a1379[_i1380];
            const _h1381 = (g[v_e] || -1);
            if (!((_h1381 === 1))) continue;
            _g1377++;
          }
        }
        if (!((_g1377 > 0))) continue;
        const _a1382 = sp.cells;
        for (let _i1383 = 0; _i1383 < _a1382.length; _i1383++) {
          const v_b = _a1382[_i1383];
          let _g1384 = 0;
          G1385: {
            const _a1386 = sp.cellEdges[v_b];
            for (let _i1387 = 0; _i1387 < _a1386.length; _i1387++) {
              const v_e = _a1386[_i1387];
              const _h1388 = (g[v_e] || -1);
              if (!((_h1388 === 1))) continue;
              _g1384++;
            }
          }
          if (!((_g1384 > 0))) continue;
          if (!((_eg1389.of(v_b) === _eg1389.of(v_a)))) {
            _q1366 = false;
            break Q1367;
          }
        }
      }
    }
    _c1390 = _q1366;
  }
  if (!(_c1390)) return false;
  for (let _k1391 = 0; _k1391 < cl.pearl.at.length; _k1391++) {
    const _at1392 = cl.pearl.at[_k1391];
    const _v1393 = cl.pearl.v[_k1391];
    let _g1394 = 0;
    G1395: {
      const _a1396 = sp.cellEdges[_at1392];
      for (let _i1397 = 0; _i1397 < _a1396.length; _i1397++) {
        const v_e = _a1396[_i1397];
        const _h1398 = (g[v_e] || -1);
        if (!((_h1398 === 1))) continue;
        _g1394++;
      }
    }
    let _c1409: boolean = (_g1394 === 2);
    if (_c1409) {
      let _q1399 = true;
      Q1400: {
        const _a1401 = sp.cellEdges[_at1392];
        for (let _i1402 = 0; _i1402 < _a1401.length; _i1402++) {
          const v_e = _a1401[_i1402];
          const _h1406 = (g[v_e] || -1);
          const _h1407 = (_h1406 === 1);
          const _a1403 = sp.cellEdges[_at1392];
          const _n1404 = _i1402;
          for (let _i1405 = 0; _i1405 < _n1404; _i1405++) {
            const v_x = _a1403[_i1405];
            const _h1408 = (g[v_x] || -1);
            if (!((_h1407 && (_h1408 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v1393 === 1)))) {
              _q1399 = false;
              break Q1400;
            }
          }
        }
      }
      _c1409 = _q1399;
    }
    let _c1421: boolean = _c1409;
    if (_c1421) {
      let _c1420: boolean = (_v1393 !== 1);
      if (!_c1420) {
        let _q1410 = true;
        Q1411: {
          const _a1412 = sp.cellEdges[_at1392];
          for (let _i1413 = 0; _i1413 < _a1412.length; _i1413++) {
            const v_e = _a1412[_i1413];
            const _h1414 = (g[v_e] || -1);
            if (!((_h1414 === 1))) continue;
            let _q1415 = false;
            Q1416: {
              const _a1417 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1392 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1418 = 0; _i1418 < _a1417.length; _i1418++) {
                const v_x = _a1417[_i1418];
                const _h1419 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h1419 === 1)) && !(bent(sp, v_x, v_e)))) {
                  _q1415 = true;
                  break Q1416;
                }
              }
            }
            if (!(_q1415)) {
              _q1410 = false;
              break Q1411;
            }
          }
        }
        _c1420 = _q1410;
      }
      _c1421 = _c1420;
    }
    let _c1433: boolean = _c1421;
    if (_c1433) {
      let _c1432: boolean = (_v1393 !== 2);
      if (!_c1432) {
        let _q1422 = false;
        Q1423: {
          const _a1424 = sp.cellEdges[_at1392];
          for (let _i1425 = 0; _i1425 < _a1424.length; _i1425++) {
            const v_e = _a1424[_i1425];
            const _h1426 = (g[v_e] || -1);
            if (!((_h1426 === 1))) continue;
            let _q1427 = false;
            Q1428: {
              const _a1429 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1392 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1430 = 0; _i1430 < _a1429.length; _i1430++) {
                const v_x = _a1429[_i1430];
                const _h1431 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h1431 === 1)) && bent(sp, v_x, v_e))) {
                  _q1427 = true;
                  break Q1428;
                }
              }
            }
            if (_q1427) {
              _q1422 = true;
              break Q1423;
            }
          }
        }
        _c1432 = _q1422;
      }
      _c1433 = _c1432;
    }
    if (!(_c1433)) return false;
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
let _p158 = new Int32Array(0);
let _l159: readonly number[] = [];
let _f164 = new Int32Array(0);
let _l165: readonly number[] = [];
let _p204 = new Int32Array(0);
let _l205: readonly number[] = [];
let _f210 = new Int32Array(0);
let _l211: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const squareFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function square(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareBinding> | null): number {
  const _g126: number[] = [];
  const _g134: number[] = [];
  if (_p158.length < sp.edges.length) _p158 = new Int32Array(sp.edges.length);
  else _p158.fill(0);
  _l159 = [];
  let _y160 = false;
  if (_f164.length < sp.edges.length) _f164 = new Int32Array(sp.edges.length).fill(-1);
  else _f164.fill(-1);
  _l165 = [];
  const _s166: number[] = [];
  const _g180: number[] = [];
  if (_p204.length < sp.edges.length) _p204 = new Int32Array(sp.edges.length);
  else _p204.fill(0);
  _l205 = [];
  let _y206 = false;
  if (_f210.length < sp.edges.length) _f210 = new Int32Array(sp.edges.length).fill(-1);
  else _f210.fill(-1);
  _l211 = [];
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
let _p284 = new Int32Array(0);
let _l285: readonly number[] = [];
let _f290 = new Int32Array(0);
let _l291: readonly number[] = [];
let _p305 = new Int32Array(0);
let _l306: readonly number[] = [];
let _f311 = new Int32Array(0);
let _l312: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const blackPearlFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackPearl(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackPearlBinding> | null): number {
  if (_p284.length < sp.edges.length) _p284 = new Int32Array(sp.edges.length);
  else _p284.fill(0);
  _l285 = [];
  let _y286 = false;
  if (_f290.length < sp.edges.length) _f290 = new Int32Array(sp.edges.length).fill(-1);
  else _f290.fill(-1);
  _l291 = [];
  const _s292: number[] = [];
  if (_p305.length < sp.edges.length) _p305 = new Int32Array(sp.edges.length);
  else _p305.fill(0);
  _l306 = [];
  let _y307 = false;
  if (_f311.length < sp.edges.length) _f311 = new Int32Array(sp.edges.length).fill(-1);
  else _f311.fill(-1);
  _l312 = [];
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

/** What a binding at one element of its first binder reads. */
const blackRunsOnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackRunsOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackRunsOnBinding> | null): number {
  const facts = blackRunsOnFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(blackRunsOnFootprint) ?? null) : null;
  const _a340 = cluesValued(cl.pearl, 1);
  for (let _i341 = 0; _i341 < _a340.length; _i341++) {
    const v_c = _a340[_i341];
    const _h342 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
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
let _f399 = new Int32Array(0);
let _l400: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const blackCannotRunOnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackCannotRunOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackCannotRunOnBinding> | null): number {
  if (_f399.length < sp.edges.length) _f399 = new Int32Array(sp.edges.length).fill(-1);
  else _f399.fill(-1);
  _l400 = [];
  const _s401: number[] = [];
  const facts = blackCannotRunOnFacts;
  let fired = 0;
  let changed = false;
  if (blackCannotRunOnCands.length < sp.edges.length) blackCannotRunOnCands = new Int32Array(sp.edges.length);
  const cands = blackCannotRunOnCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(blackCannotRunOnFootprint) ?? null) : null;
  const _a390 = cluesValued(cl.pearl, 1);
  for (let _i391 = 0; _i391 < _a390.length; _i391++) {
    const v_c = _a390[_i391];
    const _h392 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
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
let _p502 = new Int32Array(0);
let _l503: readonly number[] = [];
let _f508 = new Int32Array(0);
let _l509: readonly number[] = [];
let _f535 = new Int32Array(0);
let _l536: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const whiteCannotTurnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function whiteCannotTurn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteCannotTurnBinding> | null): number {
  if (_p502.length < sp.edges.length) _p502 = new Int32Array(sp.edges.length);
  else _p502.fill(0);
  _l503 = [];
  let _y504 = false;
  if (_f508.length < sp.edges.length) _f508 = new Int32Array(sp.edges.length).fill(-1);
  else _f508.fill(-1);
  _l509 = [];
  const _s510: number[] = [];
  if (_f535.length < sp.edges.length) _f535 = new Int32Array(sp.edges.length).fill(-1);
  else _f535.fill(-1);
  _l536 = [];
  const _s537: number[] = [];
  const _g558: number[] = [];
  const facts = whiteCannotTurnFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteCannotTurnCands.length < sp.edges.length) whiteCannotTurnCands = new Int32Array(sp.edges.length);
  const cands = whiteCannotTurnCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(whiteCannotTurnFootprint) ?? null) : null;
  const _a488 = cluesValued(cl.pearl, 2);
  R1:
  for (let _i489 = 0; _i489 < _a488.length; _i489++) {
    const v_c = _a488[_i489];
    const _m118_0 = b.made[0];
    const _h490 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
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
    R2:
    for (let _i497 = 0; _i497 < _a496.length; _i497++) {
      const v_e = _a496[_i497];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      const _h500 = _i497;
      const _h501 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g505 = -1;
      const _h518 = clueAt(cl.pearl, _h501);
      const _h519 = (_h518 !== 2);
      const _a498 = sp.cellEdges[v_c];
      for (let _i499 = 0; _i499 < _a498.length; _i499++) {
        const v_f = _a498[_i499];
        let _c530: boolean = (((_i499 > _h500) && !(bent(sp, v_e, v_f))) && ((b.grid[v_f] || -1) !== 2));
        if (_c530) {
          if (_g505 !== _epoch) {
            _g505 = _epoch;
            for (const _e506 of _l503) _p502[_e506] = 0;
            _y504 = false;
            const _a507 = sp.cellEdges[_h501];
            for (const _e511 of _l509) _f508[_e511] = -1;
            _l509 = _a507;
            let _i513 = 0;
            _s510[0] = 0;
            let _o517 = _a507.length === 0;
            for (;;) {
              if (_a507.length === 0) {
                if (!_o517) break;
                _o517 = false;
              }
              while (_a507.length > 0 && _i513 >= 0) {
                const _e511 = _a507[_i513];
                if (_s510[_i513] > 0) _f508[_e511] = -1;
                let _r516 = (cands[_e511] >= 0 ? cands[_e511] : (cands[_e511] = b.cands[_e511])) & ~((2 << _s510[_i513]) - 1);
                let _d512 = 0;
                for (; _r516 !== 0; _r516 &= _r516 - 1) {
                  _d512 = 31 - Math.clz32(_r516 & -_r516);
                  _f508[_e511] = _d512;
                  break;
                }
                if (_r516 === 0) {
                  _s510[_i513] = 0;
                  _i513--;
                  continue;
                }
                _s510[_i513] = _d512;
                if (_i513 === _a507.length - 1) break;
                _i513++;
                _s510[_i513] = 0;
              }
              if (_i513 < 0) break;
              let _c524: boolean = _h519;
              if (_c524) {
                let _g520 = 0;
                G521: {
                  const _a522 = sp.cellEdges[_h501];
                  for (let _i523 = 0; _i523 < _a522.length; _i523++) {
                    const v_x = _a522[_i523];
                    if (!((_f508[v_x] === 1))) continue;
                    _g520++;
                  }
                }
                _c524 = (_g520 === 2);
              }
              let _c529: boolean = _c524;
              if (_c529) {
                let _q525 = true;
                Q526: {
                  const _a527 = sp.cellEdges[_h501];
                  for (let _i528 = 0; _i528 < _a527.length; _i528++) {
                    const v_x = _a527[_i528];
                    if (!(((_f508[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q525 = false;
                      break Q526;
                    }
                  }
                }
                _c529 = _q525;
              }
              if (!(_c529)) continue;
              if (!(true)) continue;
              _l503 = _a507;
              _y504 = true;
              for (const _e506 of _a507) _p502[_e506] |= 1 << _f508[_e506];
            }
          }
          _c530 = !(((((_p502[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y504 && !sp.cellEdges[_h501].includes(v_e))));
        }
        let _c557: boolean = _c530;
        if (_c557) {
          const _t531 = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h545 = clueAt(cl.pearl, _t531);
          const _h546 = (_h545 !== 2);
          let _q532 = false;
          Q533: {
            const _a534 = sp.cellEdges[_t531];
            for (const _e538 of _l536) _f535[_e538] = -1;
            _l536 = _a534;
            let _i540 = 0;
            _s537[0] = 0;
            let _o544 = _a534.length === 0;
            for (;;) {
              if (_a534.length === 0) {
                if (!_o544) break;
                _o544 = false;
              }
              while (_a534.length > 0 && _i540 >= 0) {
                const _e538 = _a534[_i540];
                if (_s537[_i540] > 0) _f535[_e538] = -1;
                let _r543 = (cands[_e538] >= 0 ? cands[_e538] : (cands[_e538] = b.cands[_e538])) & ~((2 << _s537[_i540]) - 1);
                let _d539 = 0;
                for (; _r543 !== 0; _r543 &= _r543 - 1) {
                  _d539 = 31 - Math.clz32(_r543 & -_r543);
                  _f535[_e538] = _d539;
                  if (_e538 === v_f && _d539 !== 1) continue;
                  break;
                }
                if (_r543 === 0) {
                  _s537[_i540] = 0;
                  _i540--;
                  continue;
                }
                _s537[_i540] = _d539;
                if (_i540 === _a534.length - 1) break;
                _i540++;
                _s537[_i540] = 0;
              }
              if (_i540 < 0) break;
              let _c551: boolean = _h546;
              if (_c551) {
                let _g547 = 0;
                G548: {
                  const _a549 = sp.cellEdges[_t531];
                  for (let _i550 = 0; _i550 < _a549.length; _i550++) {
                    const v_x = _a549[_i550];
                    if (!((_f535[v_x] === 1))) continue;
                    _g547++;
                  }
                }
                _c551 = (_g547 === 2);
              }
              let _c556: boolean = _c551;
              if (_c556) {
                let _q552 = true;
                Q553: {
                  const _a554 = sp.cellEdges[_t531];
                  for (let _i555 = 0; _i555 < _a554.length; _i555++) {
                    const v_x = _a554[_i555];
                    if (!(((_f535[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(bent(sp, v_x, v_f))) {
                      _q552 = false;
                      break Q553;
                    }
                  }
                }
                _c556 = _q552;
              }
              if (!(_c556)) continue;
              if (true) {
                _q532 = true;
                break Q533;
              }
            }
          }
          _c557 = !(_q532);
        }
        if (!(_c557)) continue;
        _g558.length = 0;
        G559: {
          const _a562 = sp.cellEdges[v_c];
          for (let _i563 = 0; _i563 < _a562.length; _i563++) {
            const v_x = _a562[_i563];
            if (!(((v_x !== v_e) && (v_x !== v_f)))) continue;
            _g558.push(v_x);
          }
        }
        const v_P = _g558;
        const _h570 = v_P.length;
        if (b.made[0] !== _m118_0) {
          let _c568: boolean = (clueAt(cl.pearl, v_c) === 2);
          if (_c568) {
            let _q564 = false;
            Q565: {
              const _a566 = sp.cellEdges[v_c];
              for (let _i567 = 0; _i567 < _a566.length; _i567++) {
                const v_x = _a566[_i567];
                if (!((b.grid[v_x] !== 0))) {
                  _q564 = true;
                  break Q565;
                }
              }
            }
            _c568 = _q564;
          }
          if (!(_c568)) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
          if (!(((b.grid[v_e] || -1) !== 2))) { if (_visit !== null) _visit[v_c] = 1; continue R2; }
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        let _c569: boolean = true;
        if (_c569) {
          if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
          _c569 = true;
        }
        let _c575: boolean = (_c569 && (_h570 === 2));
        if (_c575) {
          let _q571 = true;
          Q572: {
            const _a573 = v_P;
            for (let _i574 = 0; _i574 < _a573.length; _i574++) {
              const v_x = _a573[_i574];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q571 = false;
                break Q572;
              }
            }
          }
          _c575 = _q571;
        }
        if (!(_c575)) return -1;
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
let _p755 = new Int32Array(0);
let _l756: readonly number[] = [];
let _f761 = new Int32Array(0);
let _l762: readonly number[] = [];
let _f788 = new Int32Array(0);
let _l789: readonly number[] = [];
let _f850 = new Int32Array(0);
let _l851: readonly number[] = [];
let _f903 = new Int32Array(0);
let _l904: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const whiteTurnsOppositeFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function whiteTurnsOpposite(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteTurnsOppositeBinding> | null): number {
  if (_p755.length < sp.edges.length) _p755 = new Int32Array(sp.edges.length);
  else _p755.fill(0);
  _l756 = [];
  let _y757 = false;
  if (_f761.length < sp.edges.length) _f761 = new Int32Array(sp.edges.length).fill(-1);
  else _f761.fill(-1);
  _l762 = [];
  const _s763: number[] = [];
  if (_f788.length < sp.edges.length) _f788 = new Int32Array(sp.edges.length).fill(-1);
  else _f788.fill(-1);
  _l789 = [];
  const _s790: number[] = [];
  const _g810: number[] = [];
  const _g818: number[] = [];
  if (_f850.length < sp.edges.length) _f850 = new Int32Array(sp.edges.length).fill(-1);
  else _f850.fill(-1);
  _l851 = [];
  const _s852: number[] = [];
  const _g871: number[] = [];
  if (_f903.length < sp.edges.length) _f903 = new Int32Array(sp.edges.length).fill(-1);
  else _f903.fill(-1);
  _l904 = [];
  const _s905: number[] = [];
  const facts = whiteTurnsOppositeFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteTurnsOppositeCands.length < sp.edges.length) whiteTurnsOppositeCands = new Int32Array(sp.edges.length);
  const cands = whiteTurnsOppositeCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(whiteTurnsOppositeFootprint) ?? null) : null;
  const _a747 = cluesValued(cl.pearl, 2);
  for (let _i748 = 0; _i748 < _a747.length; _i748++) {
    const v_c = _a747[_i748];
    const _h749 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h749 === 2))) continue;
    const _a750 = sp.cellEdges[v_c];
    R2:
    for (let _i751 = 0; _i751 < _a750.length; _i751++) {
      const v_e = _a750[_i751];
      const _m160_0 = b.made[0];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      const _h754 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g758 = -1;
      const _h771 = clueAt(cl.pearl, _h754);
      const _h772 = (_h771 !== 2);
      const _a752 = sp.cellEdges[v_c];
      for (let _i753 = 0; _i753 < _a752.length; _i753++) {
        const v_f = _a752[_i753];
        let _c783: boolean = (((v_f !== v_e) && ((b.grid[v_f] || -1) === 1)) && !(bent(sp, v_e, v_f)));
        if (_c783) {
          if (_g758 !== _epoch) {
            _g758 = _epoch;
            for (const _e759 of _l756) _p755[_e759] = 0;
            _y757 = false;
            const _a760 = sp.cellEdges[_h754];
            for (const _e764 of _l762) _f761[_e764] = -1;
            _l762 = _a760;
            let _i766 = 0;
            _s763[0] = 0;
            let _o770 = _a760.length === 0;
            for (;;) {
              if (_a760.length === 0) {
                if (!_o770) break;
                _o770 = false;
              }
              while (_a760.length > 0 && _i766 >= 0) {
                const _e764 = _a760[_i766];
                if (_s763[_i766] > 0) _f761[_e764] = -1;
                let _r769 = (cands[_e764] >= 0 ? cands[_e764] : (cands[_e764] = b.cands[_e764])) & ~((2 << _s763[_i766]) - 1);
                let _d765 = 0;
                for (; _r769 !== 0; _r769 &= _r769 - 1) {
                  _d765 = 31 - Math.clz32(_r769 & -_r769);
                  _f761[_e764] = _d765;
                  break;
                }
                if (_r769 === 0) {
                  _s763[_i766] = 0;
                  _i766--;
                  continue;
                }
                _s763[_i766] = _d765;
                if (_i766 === _a760.length - 1) break;
                _i766++;
                _s763[_i766] = 0;
              }
              if (_i766 < 0) break;
              let _c777: boolean = _h772;
              if (_c777) {
                let _g773 = 0;
                G774: {
                  const _a775 = sp.cellEdges[_h754];
                  for (let _i776 = 0; _i776 < _a775.length; _i776++) {
                    const v_x = _a775[_i776];
                    if (!((_f761[v_x] === 1))) continue;
                    _g773++;
                  }
                }
                _c777 = (_g773 === 2);
              }
              let _c782: boolean = _c777;
              if (_c782) {
                let _q778 = true;
                Q779: {
                  const _a780 = sp.cellEdges[_h754];
                  for (let _i781 = 0; _i781 < _a780.length; _i781++) {
                    const v_x = _a780[_i781];
                    if (!(((_f761[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q778 = false;
                      break Q779;
                    }
                  }
                }
                _c782 = _q778;
              }
              if (!(_c782)) continue;
              if (!(true)) continue;
              _l756 = _a760;
              _y757 = true;
              for (const _e759 of _a760) _p755[_e759] |= 1 << _f761[_e759];
            }
          }
          _c783 = !(((((_p755[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y757 && !sp.cellEdges[_h754].includes(v_e))));
        }
        if (!(_c783)) continue;
        L784: {
          const v_k = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h798 = clueAt(cl.pearl, v_k);
          const _h799 = (_h798 !== 1);
          let _q785 = false;
          Q786: {
            const _a787 = sp.cellEdges[v_k];
            for (const _e791 of _l789) _f788[_e791] = -1;
            _l789 = _a787;
            let _i793 = 0;
            _s790[0] = 0;
            let _o797 = _a787.length === 0;
            for (;;) {
              if (_a787.length === 0) {
                if (!_o797) break;
                _o797 = false;
              }
              while (_a787.length > 0 && _i793 >= 0) {
                const _e791 = _a787[_i793];
                if (_s790[_i793] > 0) _f788[_e791] = -1;
                let _r796 = (cands[_e791] >= 0 ? cands[_e791] : (cands[_e791] = b.cands[_e791])) & ~((2 << _s790[_i793]) - 1);
                let _d792 = 0;
                for (; _r796 !== 0; _r796 &= _r796 - 1) {
                  _d792 = 31 - Math.clz32(_r796 & -_r796);
                  _f788[_e791] = _d792;
                  if (_e791 === v_f && _d792 !== 1) continue;
                  break;
                }
                if (_r796 === 0) {
                  _s790[_i793] = 0;
                  _i793--;
                  continue;
                }
                _s790[_i793] = _d792;
                if (_i793 === _a787.length - 1) break;
                _i793++;
                _s790[_i793] = 0;
              }
              if (_i793 < 0) break;
              let _c804: boolean = _h799;
              if (_c804) {
                let _g800 = 0;
                G801: {
                  const _a802 = sp.cellEdges[v_k];
                  for (let _i803 = 0; _i803 < _a802.length; _i803++) {
                    const v_x = _a802[_i803];
                    if (!((_f788[v_x] === 1))) continue;
                    _g800++;
                  }
                }
                _c804 = (_g800 === 2);
              }
              let _c809: boolean = _c804;
              if (_c809) {
                let _q805 = true;
                Q806: {
                  const _a807 = sp.cellEdges[v_k];
                  for (let _i808 = 0; _i808 < _a807.length; _i808++) {
                    const v_x = _a807[_i808];
                    if (!(((_f788[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(!(bent(sp, v_x, v_f)))) {
                      _q805 = false;
                      break Q806;
                    }
                  }
                }
                _c809 = _q805;
              }
              if (!(_c809)) continue;
              if (true) {
                _q785 = true;
                break Q786;
              }
            }
          }
          if (!(_q785)) break L784;
          const _h860 = (_h798 !== 2);
          _g810.length = 0;
          G811: {
            const _a814 = sp.cellEdges[v_k];
            for (let _i815 = 0; _i815 < _a814.length; _i815++) {
              const v_x = _a814[_i815];
              if (!(!((b.grid[v_x] !== 0)))) continue;
              _g810.push(v_x);
            }
          }
          L816: {
            const v_F = _g810;
            const _h817 = v_F.length;
            if (!((_h817 > 0))) break L816;
            _g818.length = 0;
            G819: {
              const _a845 = v_F;
              for (let _i846 = 0; _i846 < _a845.length; _i846++) {
                const v_x = _a845[_i846];
                let _q847 = false;
                Q848: {
                  const _a849 = sp.cellEdges[v_k];
                  for (const _e853 of _l851) _f850[_e853] = -1;
                  _l851 = _a849;
                  let _i855 = 0;
                  _s852[0] = 0;
                  let _o859 = _a849.length === 0;
                  for (;;) {
                    if (_a849.length === 0) {
                      if (!_o859) break;
                      _o859 = false;
                    }
                    while (_a849.length > 0 && _i855 >= 0) {
                      const _e853 = _a849[_i855];
                      if (_s852[_i855] > 0) _f850[_e853] = -1;
                      let _r858 = (cands[_e853] >= 0 ? cands[_e853] : (cands[_e853] = b.cands[_e853])) & ~((2 << _s852[_i855]) - 1);
                      let _d854 = 0;
                      for (; _r858 !== 0; _r858 &= _r858 - 1) {
                        _d854 = 31 - Math.clz32(_r858 & -_r858);
                        _f850[_e853] = _d854;
                        if (_e853 === v_f && _d854 !== 1) continue;
                        if (_e853 === v_x && _d854 !== 1) continue;
                        break;
                      }
                      if (_r858 === 0) {
                        _s852[_i855] = 0;
                        _i855--;
                        continue;
                      }
                      _s852[_i855] = _d854;
                      if (_i855 === _a849.length - 1) break;
                      _i855++;
                      _s852[_i855] = 0;
                    }
                    if (_i855 < 0) break;
                    let _c865: boolean = _h860;
                    if (_c865) {
                      let _g861 = 0;
                      G862: {
                        const _a863 = sp.cellEdges[v_k];
                        for (let _i864 = 0; _i864 < _a863.length; _i864++) {
                          const v_y = _a863[_i864];
                          if (!((_f850[v_y] === 1))) continue;
                          _g861++;
                        }
                      }
                      _c865 = (_g861 === 2);
                    }
                    let _c870: boolean = _c865;
                    if (_c870) {
                      let _q866 = true;
                      Q867: {
                        const _a868 = sp.cellEdges[v_k];
                        for (let _i869 = 0; _i869 < _a868.length; _i869++) {
                          const v_y = _a868[_i869];
                          if (!(((_f850[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q866 = false;
                            break Q867;
                          }
                        }
                      }
                      _c870 = _q866;
                    }
                    if (!(_c870)) continue;
                    if (true) {
                      _q847 = true;
                      break Q848;
                    }
                  }
                }
                if (!(_q847)) continue;
                _g818.push(v_x);
              }
            }
            const v_W = _g818;
            _g871.length = 0;
            G872: {
              const _a898 = v_F;
              for (let _i899 = 0; _i899 < _a898.length; _i899++) {
                const v_x = _a898[_i899];
                let _q900 = false;
                Q901: {
                  const _a902 = sp.cellEdges[v_k];
                  for (const _e906 of _l904) _f903[_e906] = -1;
                  _l904 = _a902;
                  let _i908 = 0;
                  _s905[0] = 0;
                  let _o912 = _a902.length === 0;
                  for (;;) {
                    if (_a902.length === 0) {
                      if (!_o912) break;
                      _o912 = false;
                    }
                    while (_a902.length > 0 && _i908 >= 0) {
                      const _e906 = _a902[_i908];
                      if (_s905[_i908] > 0) _f903[_e906] = -1;
                      let _r911 = (cands[_e906] >= 0 ? cands[_e906] : (cands[_e906] = b.cands[_e906])) & ~((2 << _s905[_i908]) - 1);
                      let _d907 = 0;
                      for (; _r911 !== 0; _r911 &= _r911 - 1) {
                        _d907 = 31 - Math.clz32(_r911 & -_r911);
                        _f903[_e906] = _d907;
                        if (_e906 === v_f && _d907 !== 1) continue;
                        if (_e906 === v_x && _d907 !== 2) continue;
                        break;
                      }
                      if (_r911 === 0) {
                        _s905[_i908] = 0;
                        _i908--;
                        continue;
                      }
                      _s905[_i908] = _d907;
                      if (_i908 === _a902.length - 1) break;
                      _i908++;
                      _s905[_i908] = 0;
                    }
                    if (_i908 < 0) break;
                    let _c917: boolean = _h860;
                    if (_c917) {
                      let _g913 = 0;
                      G914: {
                        const _a915 = sp.cellEdges[v_k];
                        for (let _i916 = 0; _i916 < _a915.length; _i916++) {
                          const v_y = _a915[_i916];
                          if (!((_f903[v_y] === 1))) continue;
                          _g913++;
                        }
                      }
                      _c917 = (_g913 === 2);
                    }
                    let _c922: boolean = _c917;
                    if (_c922) {
                      let _q918 = true;
                      Q919: {
                        const _a920 = sp.cellEdges[v_k];
                        for (let _i921 = 0; _i921 < _a920.length; _i921++) {
                          const v_y = _a920[_i921];
                          if (!(((_f903[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q918 = false;
                            break Q919;
                          }
                        }
                      }
                      _c922 = _q918;
                    }
                    if (!(_c922)) continue;
                    if (true) {
                      _q900 = true;
                      break Q901;
                    }
                  }
                }
                if (!(_q900)) continue;
                _g871.push(v_x);
              }
            }
            L923: {
              const v_N = _g871;
              let _q924 = false;
              Q925: {
                const _a926 = v_F;
                for (let _i927 = 0; _i927 < _a926.length; _i927++) {
                  const v_x = _a926[_i927];
                  if ((!(v_W.includes(v_x)) || !(v_N.includes(v_x)))) {
                    _q924 = true;
                    break Q925;
                  }
                }
              }
              if (!(_q924)) break L923;
              if (b.made[0] !== _m160_0) {
                if (!(((b.grid[v_e] || -1) === 1))) { if (_visit !== null) _visit[v_c] = 1; continue R2; }
              }
              facts.length = 0;
              changed = false;
              let _q928 = true;
              Q929: {
                const _a930 = v_F;
                for (let _i931 = 0; _i931 < _a930.length; _i931++) {
                  const v_x = _a930[_i931];
                  let _c933: boolean = ((v_W.includes(v_x)) || (v_N.includes(v_x)));
                  if (_c933) {
                    let _c932: boolean = !(!(v_W.includes(v_x)));
                    if (!_c932) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                      _c932 = true;
                    }
                    _c933 = _c932;
                  }
                  let _c935: boolean = _c933;
                  if (_c935) {
                    let _c934: boolean = !(!(v_N.includes(v_x)));
                    if (!_c934) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                      _c934 = true;
                    }
                    _c935 = _c934;
                  }
                  if (!(_c935)) {
                    _q928 = false;
                    break Q929;
                  }
                }
              }
              if (!(_q928)) return -1;
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
  const _g957: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g957.length = 0;
  G958: {
    const _a961 = sp.edges;
    for (let _i962 = 0; _i962 < _a961.length; _i962++) {
      const v_e = _a961[_i962];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g957.push(v_e);
    }
  }
  const v_L = _g957;
  const _eg978 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L963: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    let _c968: boolean = (v_g !== -1);
    if (_c968) {
      let _q964 = false;
      Q965: {
        const _a966 = sp.edges;
        for (let _i967 = 0; _i967 < _a966.length; _i967++) {
          const v_e = _a966[_i967];
          if (!((b.grid[v_e] !== 0))) {
            _q964 = true;
            break Q965;
          }
        }
      }
      _c968 = _q964;
    }
    let _c977: boolean = _c968;
    if (_c977) {
      let _q969 = true;
      Q970: {
        const _a971 = sp.cells;
        for (let _i972 = 0; _i972 < _a971.length; _i972++) {
          const v_c = _a971[_i972];
          let _g973 = 0;
          G974: {
            const _a975 = sp.cellEdges[v_c];
            for (let _i976 = 0; _i976 < _a975.length; _i976++) {
              const v_e = _a975[_i976];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g973++;
            }
          }
          if (!((_g973 !== 1))) {
            _q969 = false;
            break Q970;
          }
        }
      }
      _c977 = _q969;
    }
    if (!(_c977)) break L963;
    const v_G = _eg978.of(sp.edgeEnds[2 * v_g]);
    facts.length = 0;
    changed = false;
    let _q979 = true;
    Q980: {
      const _a981 = v_L;
      for (let _i982 = 0; _i982 < _a981.length; _i982++) {
        const v_x = _a981[_i982];
        if (!((_eg978.of(sp.edgeEnds[2 * v_x]) === v_G))) {
          _q979 = false;
          break Q980;
        }
      }
    }
    let _c988: boolean = _q979;
    if (_c988) {
      let _q983 = true;
      Q984: {
        const _a985 = sp.cells;
        for (let _i986 = 0; _i986 < _a985.length; _i986++) {
          const v_c = _a985[_i986];
          const _h987 = clueAt(cl.pearl, v_c);
          if (!((_h987 !== -1))) continue;
          if (!((_eg978.of(v_c) === v_G))) {
            _q983 = false;
            break Q984;
          }
        }
      }
      _c988 = _q983;
    }
    let _c993: boolean = _c988;
    if (_c993) {
      let _q989 = true;
      Q990: {
        const _a991 = sp.edges;
        for (let _i992 = 0; _i992 < _a991.length; _i992++) {
          const v_e = _a991[_i992];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
          if (!(true)) {
            _q989 = false;
            break Q990;
          }
        }
      }
      _c993 = _q989;
    }
    if (!(_c993)) return -1;
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
  const _g1014: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  const _m246_0 = b.made[0];
  _g1014.length = 0;
  G1015: {
    const _a1018 = sp.edges;
    for (let _i1019 = 0; _i1019 < _a1018.length; _i1019++) {
      const v_e = _a1018[_i1019];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1014.push(v_e);
    }
  }
  const v_L = _g1014;
  const _m249_1 = b.made[1];
  const _eg1022 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a1020 = sp.edges;
  R1:
  for (let _i1021 = 0; _i1021 < _a1020.length; _i1021++) {
    const v_e = _a1020[_i1021];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L1023: {
      const v_G = _eg1022.of(sp.edgeEnds[2 * v_e]);
      let _c1035: boolean = (_eg1022.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c1035) {
        let _q1024 = false;
        Q1025: {
          const _a1026 = sp.cells;
          for (let _i1027 = 0; _i1027 < _a1026.length; _i1027++) {
            const v_c = _a1026[_i1027];
            const _h1028 = clueAt(cl.pearl, v_c);
            let _c1034: boolean = !(_eg1022.of(v_c) === v_G);
            if (_c1034) {
              let _c1033: boolean = (_h1028 !== -1);
              if (!_c1033) {
                let _g1029 = 0;
                G1030: {
                  const _a1031 = sp.cellEdges[v_c];
                  for (let _i1032 = 0; _i1032 < _a1031.length; _i1032++) {
                    const v_e = _a1031[_i1032];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1029++;
                  }
                }
                _c1033 = (_g1029 > 0);
              }
              _c1034 = _c1033;
            }
            if (_c1034) {
              _q1024 = true;
              break Q1025;
            }
          }
        }
        _c1035 = _q1024;
      }
      if (!(_c1035)) break L1023;
      if (b.made[0] !== _m246_0 || b.made[1] !== _m249_1) {
        const _now1036 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now1036 === _eg1022.of(sp.edgeEnds[2 * v_e]) || sameSet(_now1036, _eg1022.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
      }
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
let _p1242 = new Int32Array(0);
let _l1243: readonly number[] = [];
let _f1248 = new Int32Array(0);
let _l1249: readonly number[] = [];
let _p1290 = new Int32Array(0);
let _l1291: readonly number[] = [];
let _f1296 = new Int32Array(0);
let _l1297: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function earlyThrough(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyThroughBinding> | null): number {
  const _g1181: number[] = [];
  const _g1187: number[] = [];
  const _g1210: number[] = [];
  const _g1218: number[] = [];
  if (_p1242.length < sp.edges.length) _p1242 = new Int32Array(sp.edges.length);
  else _p1242.fill(0);
  _l1243 = [];
  let _y1244 = false;
  if (_f1248.length < sp.edges.length) _f1248 = new Int32Array(sp.edges.length).fill(-1);
  else _f1248.fill(-1);
  _l1249 = [];
  const _s1250: number[] = [];
  const _g1266: number[] = [];
  if (_p1290.length < sp.edges.length) _p1290 = new Int32Array(sp.edges.length);
  else _p1290.fill(0);
  _l1291 = [];
  let _y1292 = false;
  if (_f1296.length < sp.edges.length) _f1296 = new Int32Array(sp.edges.length).fill(-1);
  else _f1296.fill(-1);
  _l1297 = [];
  const _s1298: number[] = [];
  const _g1316: number[] = [];
  const _g1322: number[] = [];
  const facts = earlyThroughFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (earlyThroughCands.length < sp.edges.length) earlyThroughCands = new Int32Array(sp.edges.length);
  const cands = earlyThroughCands;
  cands.fill(-1);
  const _m268_0 = b.made[0];
  _g1181.length = 0;
  G1182: {
    const _a1185 = sp.edges;
    for (let _i1186 = 0; _i1186 < _a1185.length; _i1186++) {
      const v_e = _a1185[_i1186];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1181.push(v_e);
    }
  }
  const v_L = _g1181;
  const _m271_1 = b.made[1];
  const _eg1259 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1187.length = 0;
  G1188: {
    const _a1196 = sp.cells;
    for (let _i1197 = 0; _i1197 < _a1196.length; _i1197++) {
      const v_q = _a1196[_i1197];
      const _h1198 = clueAt(cl.pearl, v_q);
      let _c1203: boolean = (_h1198 !== -1);
      if (!_c1203) {
        let _g1199 = 0;
        G1200: {
          const _a1201 = sp.cellEdges[v_q];
          for (let _i1202 = 0; _i1202 < _a1201.length; _i1202++) {
            const v_e = _a1201[_i1202];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g1199++;
          }
        }
        _c1203 = (_g1199 > 0);
      }
      if (!(_c1203)) continue;
      _g1187.push(v_q);
    }
  }
  const v_Q = _g1187;
  const _a1204 = sp.cells;
  for (let _i1205 = 0; _i1205 < _a1204.length; _i1205++) {
    const v_c = _a1204[_i1205];
    let _g1206 = 0;
    G1207: {
      const _a1208 = sp.cellEdges[v_c];
      for (let _i1209 = 0; _i1209 < _a1208.length; _i1209++) {
        const v_e = _a1208[_i1209];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g1206++;
      }
    }
    if (!((_g1206 === 0))) continue;
    let _g1245 = -1;
    const _h1264 = clueAt(cl.pearl, v_c);
    const _h1265 = (_h1264 === -1);
    let _g1293 = -1;
    _g1210.length = 0;
    G1211: {
      const _a1214 = sp.cellEdges[v_c];
      for (let _i1215 = 0; _i1215 < _a1214.length; _i1215++) {
        const v_e = _a1214[_i1215];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1210.push(v_e);
      }
    }
    L1216: {
      const v_F = _g1210;
      const _h1217 = v_F.length;
      if (!((_h1217 > 1))) break L1216;
      _g1218.length = 0;
      G1219: {
        const _a1240 = v_F;
        for (let _i1241 = 0; _i1241 < _a1240.length; _i1241++) {
          const v_e = _a1240[_i1241];
          if (_g1245 !== _epoch) {
            _g1245 = _epoch;
            for (const _e1246 of _l1243) _p1242[_e1246] = 0;
            _y1244 = false;
            const _a1247 = sp.cellEdges[v_c];
            for (const _e1251 of _l1249) _f1248[_e1251] = -1;
            _l1249 = _a1247;
            let _i1253 = 0;
            _s1250[0] = 0;
            let _o1257 = _a1247.length === 0;
            for (;;) {
              if (_a1247.length === 0) {
                if (!_o1257) break;
                _o1257 = false;
              }
              while (_a1247.length > 0 && _i1253 >= 0) {
                const _e1251 = _a1247[_i1253];
                if (_s1250[_i1253] > 0) _f1248[_e1251] = -1;
                let _r1256 = (cands[_e1251] >= 0 ? cands[_e1251] : (cands[_e1251] = b.cands[_e1251])) & ~((2 << _s1250[_i1253]) - 1);
                let _d1252 = 0;
                V1255: for (; _r1256 !== 0; _r1256 &= _r1256 - 1) {
                  _d1252 = 31 - Math.clz32(_r1256 & -_r1256);
                  _f1248[_e1251] = _d1252;
                  for (let _j1254 = 0; _j1254 < _i1253; _j1254++) {
                    const _y1258 = _a1247[_j1254];
                    if (!(((_f1248[_e1251] === 1) && (_f1248[_y1258] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1251, _y1258)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1251, _y1258)))) && (!(_eg1259.of((sp.edgeEnds[2 * _y1258] === v_c ? sp.edgeEnds[2 * _y1258 + 1] : sp.edgeEnds[2 * _y1258])) === _eg1259.of((sp.edgeEnds[2 * _e1251] === v_c ? sp.edgeEnds[2 * _e1251 + 1] : sp.edgeEnds[2 * _e1251]))) || (minus(minus(v_Q, _eg1259.of((sp.edgeEnds[2 * _e1251] === v_c ? sp.edgeEnds[2 * _e1251 + 1] : sp.edgeEnds[2 * _e1251]))), setOf(v_c)).length === 0))))) continue V1255;
                  }
                  break;
                }
                if (_r1256 === 0) {
                  _s1250[_i1253] = 0;
                  _i1253--;
                  continue;
                }
                _s1250[_i1253] = _d1252;
                if (_i1253 === _a1247.length - 1) break;
                _i1253++;
                _s1250[_i1253] = 0;
              }
              if (_i1253 < 0) break;
              let _g1260 = 0;
              G1261: {
                const _a1262 = sp.cellEdges[v_c];
                for (let _i1263 = 0; _i1263 < _a1262.length; _i1263++) {
                  const v_x = _a1262[_i1263];
                  if (!((_f1248[v_x] === 1))) continue;
                  _g1260++;
                }
              }
              if (!(((_g1260 === 2) || ((_g1260 === 0) && _h1265)))) continue;
              if (!(true)) continue;
              _l1243 = _a1247;
              _y1244 = true;
              for (const _e1246 of _a1247) _p1242[_e1246] |= 1 << _f1248[_e1246];
            }
          }
          if (!(((((_p1242[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y1244 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1218.push(v_e);
        }
      }
      const v_W = _g1218;
      _g1266.length = 0;
      G1267: {
        const _a1288 = v_F;
        for (let _i1289 = 0; _i1289 < _a1288.length; _i1289++) {
          const v_e = _a1288[_i1289];
          if (_g1293 !== _epoch) {
            _g1293 = _epoch;
            for (const _e1294 of _l1291) _p1290[_e1294] = 0;
            _y1292 = false;
            const _a1295 = sp.cellEdges[v_c];
            for (const _e1299 of _l1297) _f1296[_e1299] = -1;
            _l1297 = _a1295;
            let _i1301 = 0;
            _s1298[0] = 0;
            let _o1305 = _a1295.length === 0;
            for (;;) {
              if (_a1295.length === 0) {
                if (!_o1305) break;
                _o1305 = false;
              }
              while (_a1295.length > 0 && _i1301 >= 0) {
                const _e1299 = _a1295[_i1301];
                if (_s1298[_i1301] > 0) _f1296[_e1299] = -1;
                let _r1304 = (cands[_e1299] >= 0 ? cands[_e1299] : (cands[_e1299] = b.cands[_e1299])) & ~((2 << _s1298[_i1301]) - 1);
                let _d1300 = 0;
                V1303: for (; _r1304 !== 0; _r1304 &= _r1304 - 1) {
                  _d1300 = 31 - Math.clz32(_r1304 & -_r1304);
                  _f1296[_e1299] = _d1300;
                  for (let _j1302 = 0; _j1302 < _i1301; _j1302++) {
                    const _y1306 = _a1295[_j1302];
                    if (!(((_f1296[_e1299] === 1) && (_f1296[_y1306] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1299, _y1306)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1299, _y1306)))) && (!(_eg1259.of((sp.edgeEnds[2 * _y1306] === v_c ? sp.edgeEnds[2 * _y1306 + 1] : sp.edgeEnds[2 * _y1306])) === _eg1259.of((sp.edgeEnds[2 * _e1299] === v_c ? sp.edgeEnds[2 * _e1299 + 1] : sp.edgeEnds[2 * _e1299]))) || (minus(minus(v_Q, _eg1259.of((sp.edgeEnds[2 * _e1299] === v_c ? sp.edgeEnds[2 * _e1299 + 1] : sp.edgeEnds[2 * _e1299]))), setOf(v_c)).length === 0))))) continue V1303;
                  }
                  break;
                }
                if (_r1304 === 0) {
                  _s1298[_i1301] = 0;
                  _i1301--;
                  continue;
                }
                _s1298[_i1301] = _d1300;
                if (_i1301 === _a1295.length - 1) break;
                _i1301++;
                _s1298[_i1301] = 0;
              }
              if (_i1301 < 0) break;
              let _g1307 = 0;
              G1308: {
                const _a1309 = sp.cellEdges[v_c];
                for (let _i1310 = 0; _i1310 < _a1309.length; _i1310++) {
                  const v_x = _a1309[_i1310];
                  if (!((_f1296[v_x] === 1))) continue;
                  _g1307++;
                }
              }
              if (!(((_g1307 === 2) || ((_g1307 === 0) && _h1265)))) continue;
              if (!(true)) continue;
              _l1291 = _a1295;
              _y1292 = true;
              for (const _e1294 of _a1295) _p1290[_e1294] |= 1 << _f1296[_e1294];
            }
          }
          if (!(((((_p1290[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y1292 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1266.push(v_e);
        }
      }
      L1311: {
        const v_N = _g1266;
        let _q1312 = false;
        Q1313: {
          const _a1314 = v_F;
          for (let _i1315 = 0; _i1315 < _a1314.length; _i1315++) {
            const v_e = _a1314[_i1315];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q1312 = true;
              break Q1313;
            }
          }
        }
        if (!(_q1312)) break L1311;
        if (b.made[0] !== _m268_0 || b.made[1] !== _m271_1) {
          _g1316.length = 0;
          G1317: {
            const _a1320 = sp.edges;
            for (let _i1321 = 0; _i1321 < _a1320.length; _i1321++) {
              const v_e = _a1320[_i1321];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1316.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g1316))) { return fired; }
          _g1322.length = 0;
          G1323: {
            const _a1331 = sp.cells;
            for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
              const v_q = _a1331[_i1332];
              let _c1337: boolean = (clueAt(cl.pearl, v_q) !== -1);
              if (!_c1337) {
                let _g1333 = 0;
                G1334: {
                  const _a1335 = sp.cellEdges[v_q];
                  for (let _i1336 = 0; _i1336 < _a1335.length; _i1336++) {
                    const v_e = _a1335[_i1336];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1333++;
                  }
                }
                _c1337 = (_g1333 > 0);
              }
              if (!(_c1337)) continue;
              _g1322.push(v_q);
            }
          }
          if (!(sameSet(v_Q, _g1322))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _q1338 = true;
        Q1339: {
          const _a1340 = v_F;
          for (let _i1341 = 0; _i1341 < _a1340.length; _i1341++) {
            const v_e = _a1340[_i1341];
            let _c1343: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c1343) {
              let _c1342: boolean = !(!(v_W.includes(v_e)));
              if (!_c1342) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c1342 = true;
              }
              _c1343 = _c1342;
            }
            let _c1345: boolean = _c1343;
            if (_c1345) {
              let _c1344: boolean = !(!(v_N.includes(v_e)));
              if (!_c1344) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c1344 = true;
              }
              _c1345 = _c1344;
            }
            if (!(_c1345)) {
              _q1338 = false;
              break Q1339;
            }
          }
        }
        if (!(_q1338)) return -1;
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
let bentOn: object | null = null;
let bentAt: Kept<Kept<boolean>> = [];

/** `bent(e, x)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function bent(sp: GridSpace, v_e: number, v_x: number): boolean {
  if (sp !== bentOn) {
    bentAt = bentKept.board(sp);
    bentOn = sp;
  }
  const _kept: Kept<Kept<boolean>> = bentAt;
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
