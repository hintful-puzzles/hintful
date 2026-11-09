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
  const _g1340: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1318 = true;
  Q1319: {
    const _a1320 = sp.cells;
    for (let _i1321 = 0; _i1321 < _a1320.length; _i1321++) {
      const v_c = _a1320[_i1321];
      let _g1322 = 0;
      G1323: {
        const _a1324 = sp.cellEdges[v_c];
        for (let _i1325 = 0; _i1325 < _a1324.length; _i1325++) {
          const v_e = _a1324[_i1325];
          const _h1326 = (g[v_e] || -1);
          if (!((_h1326 === 1))) continue;
          _g1322++;
        }
      }
      let _c1332: boolean = (_g1322 === 0);
      if (!_c1332) {
        let _g1327 = 0;
        G1328: {
          const _a1329 = sp.cellEdges[v_c];
          for (let _i1330 = 0; _i1330 < _a1329.length; _i1330++) {
            const v_e = _a1329[_i1330];
            const _h1331 = (g[v_e] || -1);
            if (!((_h1331 === 1))) continue;
            _g1327++;
          }
        }
        _c1332 = (_g1327 === 2);
      }
      if (!(_c1332)) {
        _q1318 = false;
        break Q1319;
      }
    }
  }
  if (!(_q1318)) return false;
  let _q1333 = false;
  Q1334: {
    const _a1335 = sp.edges;
    for (let _i1336 = 0; _i1336 < _a1335.length; _i1336++) {
      const v_e = _a1335[_i1336];
      const _h1337 = (g[v_e] || -1);
      if ((_h1337 === 1)) {
        _q1333 = true;
        break Q1334;
      }
    }
  }
  let _c1362: boolean = _q1333;
  if (_c1362) {
    let _q1338 = true;
    Q1339: {
      _g1340.length = 0;
      G1341: {
        const _a1344 = sp.edges;
        for (let _i1345 = 0; _i1345 < _a1344.length; _i1345++) {
          const v_e = _a1344[_i1345];
          const _h1346 = (g[v_e] || -1);
          if (!((_h1346 === 1))) continue;
          _g1340.push(v_e);
        }
      }
      const v_L = _g1340;
      const _eg1361 = edgeGroups(sp, v_L);
      const _a1347 = sp.cells;
      for (let _i1348 = 0; _i1348 < _a1347.length; _i1348++) {
        const v_a = _a1347[_i1348];
        let _g1349 = 0;
        G1350: {
          const _a1351 = sp.cellEdges[v_a];
          for (let _i1352 = 0; _i1352 < _a1351.length; _i1352++) {
            const v_e = _a1351[_i1352];
            const _h1353 = (g[v_e] || -1);
            if (!((_h1353 === 1))) continue;
            _g1349++;
          }
        }
        if (!((_g1349 > 0))) continue;
        const _a1354 = sp.cells;
        for (let _i1355 = 0; _i1355 < _a1354.length; _i1355++) {
          const v_b = _a1354[_i1355];
          let _g1356 = 0;
          G1357: {
            const _a1358 = sp.cellEdges[v_b];
            for (let _i1359 = 0; _i1359 < _a1358.length; _i1359++) {
              const v_e = _a1358[_i1359];
              const _h1360 = (g[v_e] || -1);
              if (!((_h1360 === 1))) continue;
              _g1356++;
            }
          }
          if (!((_g1356 > 0))) continue;
          if (!((_eg1361.of(v_b) === _eg1361.of(v_a)))) {
            _q1338 = false;
            break Q1339;
          }
        }
      }
    }
    _c1362 = _q1338;
  }
  if (!(_c1362)) return false;
  for (let _k1363 = 0; _k1363 < cl.pearl.at.length; _k1363++) {
    const _at1364 = cl.pearl.at[_k1363];
    const _v1365 = cl.pearl.v[_k1363];
    let _g1366 = 0;
    G1367: {
      const _a1368 = sp.cellEdges[_at1364];
      for (let _i1369 = 0; _i1369 < _a1368.length; _i1369++) {
        const v_e = _a1368[_i1369];
        const _h1370 = (g[v_e] || -1);
        if (!((_h1370 === 1))) continue;
        _g1366++;
      }
    }
    let _c1381: boolean = (_g1366 === 2);
    if (_c1381) {
      let _q1371 = true;
      Q1372: {
        const _a1373 = sp.cellEdges[_at1364];
        for (let _i1374 = 0; _i1374 < _a1373.length; _i1374++) {
          const v_e = _a1373[_i1374];
          const _h1378 = (g[v_e] || -1);
          const _h1379 = (_h1378 === 1);
          const _a1375 = sp.cellEdges[_at1364];
          const _n1376 = _i1374;
          for (let _i1377 = 0; _i1377 < _n1376; _i1377++) {
            const v_x = _a1375[_i1377];
            const _h1380 = (g[v_x] || -1);
            if (!((_h1379 && (_h1380 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v1365 === 1)))) {
              _q1371 = false;
              break Q1372;
            }
          }
        }
      }
      _c1381 = _q1371;
    }
    let _c1393: boolean = _c1381;
    if (_c1393) {
      let _c1392: boolean = (_v1365 !== 1);
      if (!_c1392) {
        let _q1382 = true;
        Q1383: {
          const _a1384 = sp.cellEdges[_at1364];
          for (let _i1385 = 0; _i1385 < _a1384.length; _i1385++) {
            const v_e = _a1384[_i1385];
            const _h1386 = (g[v_e] || -1);
            if (!((_h1386 === 1))) continue;
            let _q1387 = false;
            Q1388: {
              const _a1389 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1364 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1390 = 0; _i1390 < _a1389.length; _i1390++) {
                const v_x = _a1389[_i1390];
                const _h1391 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h1391 === 1)) && !(bent(sp, v_x, v_e)))) {
                  _q1387 = true;
                  break Q1388;
                }
              }
            }
            if (!(_q1387)) {
              _q1382 = false;
              break Q1383;
            }
          }
        }
        _c1392 = _q1382;
      }
      _c1393 = _c1392;
    }
    let _c1405: boolean = _c1393;
    if (_c1405) {
      let _c1404: boolean = (_v1365 !== 2);
      if (!_c1404) {
        let _q1394 = false;
        Q1395: {
          const _a1396 = sp.cellEdges[_at1364];
          for (let _i1397 = 0; _i1397 < _a1396.length; _i1397++) {
            const v_e = _a1396[_i1397];
            const _h1398 = (g[v_e] || -1);
            if (!((_h1398 === 1))) continue;
            let _q1399 = false;
            Q1400: {
              const _a1401 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1364 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1402 = 0; _i1402 < _a1401.length; _i1402++) {
                const v_x = _a1401[_i1402];
                const _h1403 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h1403 === 1)) && bent(sp, v_x, v_e))) {
                  _q1399 = true;
                  break Q1400;
                }
              }
            }
            if (_q1399) {
              _q1394 = true;
              break Q1395;
            }
          }
        }
        _c1404 = _q1394;
      }
      _c1405 = _c1404;
    }
    if (!(_c1405)) return false;
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
  for (let _i489 = 0; _i489 < _a488.length; _i489++) {
    const v_c = _a488[_i489];
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
        const _h565 = v_P.length;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        let _c564: boolean = true;
        if (_c564) {
          if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
          _c564 = true;
        }
        let _c570: boolean = (_c564 && (_h565 === 2));
        if (_c570) {
          let _q566 = true;
          Q567: {
            const _a568 = v_P;
            for (let _i569 = 0; _i569 < _a568.length; _i569++) {
              const v_x = _a568[_i569];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q566 = false;
                break Q567;
              }
            }
          }
          _c570 = _q566;
        }
        if (!(_c570)) return -1;
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
let _p750 = new Int32Array(0);
let _l751: readonly number[] = [];
let _f756 = new Int32Array(0);
let _l757: readonly number[] = [];
let _f783 = new Int32Array(0);
let _l784: readonly number[] = [];
let _f845 = new Int32Array(0);
let _l846: readonly number[] = [];
let _f898 = new Int32Array(0);
let _l899: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const whiteTurnsOppositeFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function whiteTurnsOpposite(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteTurnsOppositeBinding> | null): number {
  if (_p750.length < sp.edges.length) _p750 = new Int32Array(sp.edges.length);
  else _p750.fill(0);
  _l751 = [];
  let _y752 = false;
  if (_f756.length < sp.edges.length) _f756 = new Int32Array(sp.edges.length).fill(-1);
  else _f756.fill(-1);
  _l757 = [];
  const _s758: number[] = [];
  if (_f783.length < sp.edges.length) _f783 = new Int32Array(sp.edges.length).fill(-1);
  else _f783.fill(-1);
  _l784 = [];
  const _s785: number[] = [];
  const _g805: number[] = [];
  const _g813: number[] = [];
  if (_f845.length < sp.edges.length) _f845 = new Int32Array(sp.edges.length).fill(-1);
  else _f845.fill(-1);
  _l846 = [];
  const _s847: number[] = [];
  const _g866: number[] = [];
  if (_f898.length < sp.edges.length) _f898 = new Int32Array(sp.edges.length).fill(-1);
  else _f898.fill(-1);
  _l899 = [];
  const _s900: number[] = [];
  const facts = whiteTurnsOppositeFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteTurnsOppositeCands.length < sp.edges.length) whiteTurnsOppositeCands = new Int32Array(sp.edges.length);
  const cands = whiteTurnsOppositeCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(whiteTurnsOppositeFootprint) ?? null) : null;
  const _a742 = cluesValued(cl.pearl, 2);
  for (let _i743 = 0; _i743 < _a742.length; _i743++) {
    const v_c = _a742[_i743];
    const _h744 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h744 === 2))) continue;
    const _a745 = sp.cellEdges[v_c];
    for (let _i746 = 0; _i746 < _a745.length; _i746++) {
      const v_e = _a745[_i746];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      const _h749 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g753 = -1;
      const _h766 = clueAt(cl.pearl, _h749);
      const _h767 = (_h766 !== 2);
      const _a747 = sp.cellEdges[v_c];
      for (let _i748 = 0; _i748 < _a747.length; _i748++) {
        const v_f = _a747[_i748];
        let _c778: boolean = (((v_f !== v_e) && ((b.grid[v_f] || -1) === 1)) && !(bent(sp, v_e, v_f)));
        if (_c778) {
          if (_g753 !== _epoch) {
            _g753 = _epoch;
            for (const _e754 of _l751) _p750[_e754] = 0;
            _y752 = false;
            const _a755 = sp.cellEdges[_h749];
            for (const _e759 of _l757) _f756[_e759] = -1;
            _l757 = _a755;
            let _i761 = 0;
            _s758[0] = 0;
            let _o765 = _a755.length === 0;
            for (;;) {
              if (_a755.length === 0) {
                if (!_o765) break;
                _o765 = false;
              }
              while (_a755.length > 0 && _i761 >= 0) {
                const _e759 = _a755[_i761];
                if (_s758[_i761] > 0) _f756[_e759] = -1;
                let _r764 = (cands[_e759] >= 0 ? cands[_e759] : (cands[_e759] = b.cands[_e759])) & ~((2 << _s758[_i761]) - 1);
                let _d760 = 0;
                for (; _r764 !== 0; _r764 &= _r764 - 1) {
                  _d760 = 31 - Math.clz32(_r764 & -_r764);
                  _f756[_e759] = _d760;
                  break;
                }
                if (_r764 === 0) {
                  _s758[_i761] = 0;
                  _i761--;
                  continue;
                }
                _s758[_i761] = _d760;
                if (_i761 === _a755.length - 1) break;
                _i761++;
                _s758[_i761] = 0;
              }
              if (_i761 < 0) break;
              let _c772: boolean = _h767;
              if (_c772) {
                let _g768 = 0;
                G769: {
                  const _a770 = sp.cellEdges[_h749];
                  for (let _i771 = 0; _i771 < _a770.length; _i771++) {
                    const v_x = _a770[_i771];
                    if (!((_f756[v_x] === 1))) continue;
                    _g768++;
                  }
                }
                _c772 = (_g768 === 2);
              }
              let _c777: boolean = _c772;
              if (_c777) {
                let _q773 = true;
                Q774: {
                  const _a775 = sp.cellEdges[_h749];
                  for (let _i776 = 0; _i776 < _a775.length; _i776++) {
                    const v_x = _a775[_i776];
                    if (!(((_f756[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q773 = false;
                      break Q774;
                    }
                  }
                }
                _c777 = _q773;
              }
              if (!(_c777)) continue;
              if (!(true)) continue;
              _l751 = _a755;
              _y752 = true;
              for (const _e754 of _a755) _p750[_e754] |= 1 << _f756[_e754];
            }
          }
          _c778 = !(((((_p750[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y752 && !sp.cellEdges[_h749].includes(v_e))));
        }
        if (!(_c778)) continue;
        L779: {
          const v_k = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h793 = clueAt(cl.pearl, v_k);
          const _h794 = (_h793 !== 1);
          let _q780 = false;
          Q781: {
            const _a782 = sp.cellEdges[v_k];
            for (const _e786 of _l784) _f783[_e786] = -1;
            _l784 = _a782;
            let _i788 = 0;
            _s785[0] = 0;
            let _o792 = _a782.length === 0;
            for (;;) {
              if (_a782.length === 0) {
                if (!_o792) break;
                _o792 = false;
              }
              while (_a782.length > 0 && _i788 >= 0) {
                const _e786 = _a782[_i788];
                if (_s785[_i788] > 0) _f783[_e786] = -1;
                let _r791 = (cands[_e786] >= 0 ? cands[_e786] : (cands[_e786] = b.cands[_e786])) & ~((2 << _s785[_i788]) - 1);
                let _d787 = 0;
                for (; _r791 !== 0; _r791 &= _r791 - 1) {
                  _d787 = 31 - Math.clz32(_r791 & -_r791);
                  _f783[_e786] = _d787;
                  if (_e786 === v_f && _d787 !== 1) continue;
                  break;
                }
                if (_r791 === 0) {
                  _s785[_i788] = 0;
                  _i788--;
                  continue;
                }
                _s785[_i788] = _d787;
                if (_i788 === _a782.length - 1) break;
                _i788++;
                _s785[_i788] = 0;
              }
              if (_i788 < 0) break;
              let _c799: boolean = _h794;
              if (_c799) {
                let _g795 = 0;
                G796: {
                  const _a797 = sp.cellEdges[v_k];
                  for (let _i798 = 0; _i798 < _a797.length; _i798++) {
                    const v_x = _a797[_i798];
                    if (!((_f783[v_x] === 1))) continue;
                    _g795++;
                  }
                }
                _c799 = (_g795 === 2);
              }
              let _c804: boolean = _c799;
              if (_c804) {
                let _q800 = true;
                Q801: {
                  const _a802 = sp.cellEdges[v_k];
                  for (let _i803 = 0; _i803 < _a802.length; _i803++) {
                    const v_x = _a802[_i803];
                    if (!(((_f783[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(!(bent(sp, v_x, v_f)))) {
                      _q800 = false;
                      break Q801;
                    }
                  }
                }
                _c804 = _q800;
              }
              if (!(_c804)) continue;
              if (true) {
                _q780 = true;
                break Q781;
              }
            }
          }
          if (!(_q780)) break L779;
          const _h855 = (_h793 !== 2);
          _g805.length = 0;
          G806: {
            const _a809 = sp.cellEdges[v_k];
            for (let _i810 = 0; _i810 < _a809.length; _i810++) {
              const v_x = _a809[_i810];
              if (!(!((b.grid[v_x] !== 0)))) continue;
              _g805.push(v_x);
            }
          }
          L811: {
            const v_F = _g805;
            const _h812 = v_F.length;
            if (!((_h812 > 0))) break L811;
            _g813.length = 0;
            G814: {
              const _a840 = v_F;
              for (let _i841 = 0; _i841 < _a840.length; _i841++) {
                const v_x = _a840[_i841];
                let _q842 = false;
                Q843: {
                  const _a844 = sp.cellEdges[v_k];
                  for (const _e848 of _l846) _f845[_e848] = -1;
                  _l846 = _a844;
                  let _i850 = 0;
                  _s847[0] = 0;
                  let _o854 = _a844.length === 0;
                  for (;;) {
                    if (_a844.length === 0) {
                      if (!_o854) break;
                      _o854 = false;
                    }
                    while (_a844.length > 0 && _i850 >= 0) {
                      const _e848 = _a844[_i850];
                      if (_s847[_i850] > 0) _f845[_e848] = -1;
                      let _r853 = (cands[_e848] >= 0 ? cands[_e848] : (cands[_e848] = b.cands[_e848])) & ~((2 << _s847[_i850]) - 1);
                      let _d849 = 0;
                      for (; _r853 !== 0; _r853 &= _r853 - 1) {
                        _d849 = 31 - Math.clz32(_r853 & -_r853);
                        _f845[_e848] = _d849;
                        if (_e848 === v_f && _d849 !== 1) continue;
                        if (_e848 === v_x && _d849 !== 1) continue;
                        break;
                      }
                      if (_r853 === 0) {
                        _s847[_i850] = 0;
                        _i850--;
                        continue;
                      }
                      _s847[_i850] = _d849;
                      if (_i850 === _a844.length - 1) break;
                      _i850++;
                      _s847[_i850] = 0;
                    }
                    if (_i850 < 0) break;
                    let _c860: boolean = _h855;
                    if (_c860) {
                      let _g856 = 0;
                      G857: {
                        const _a858 = sp.cellEdges[v_k];
                        for (let _i859 = 0; _i859 < _a858.length; _i859++) {
                          const v_y = _a858[_i859];
                          if (!((_f845[v_y] === 1))) continue;
                          _g856++;
                        }
                      }
                      _c860 = (_g856 === 2);
                    }
                    let _c865: boolean = _c860;
                    if (_c865) {
                      let _q861 = true;
                      Q862: {
                        const _a863 = sp.cellEdges[v_k];
                        for (let _i864 = 0; _i864 < _a863.length; _i864++) {
                          const v_y = _a863[_i864];
                          if (!(((_f845[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q861 = false;
                            break Q862;
                          }
                        }
                      }
                      _c865 = _q861;
                    }
                    if (!(_c865)) continue;
                    if (true) {
                      _q842 = true;
                      break Q843;
                    }
                  }
                }
                if (!(_q842)) continue;
                _g813.push(v_x);
              }
            }
            const v_W = _g813;
            _g866.length = 0;
            G867: {
              const _a893 = v_F;
              for (let _i894 = 0; _i894 < _a893.length; _i894++) {
                const v_x = _a893[_i894];
                let _q895 = false;
                Q896: {
                  const _a897 = sp.cellEdges[v_k];
                  for (const _e901 of _l899) _f898[_e901] = -1;
                  _l899 = _a897;
                  let _i903 = 0;
                  _s900[0] = 0;
                  let _o907 = _a897.length === 0;
                  for (;;) {
                    if (_a897.length === 0) {
                      if (!_o907) break;
                      _o907 = false;
                    }
                    while (_a897.length > 0 && _i903 >= 0) {
                      const _e901 = _a897[_i903];
                      if (_s900[_i903] > 0) _f898[_e901] = -1;
                      let _r906 = (cands[_e901] >= 0 ? cands[_e901] : (cands[_e901] = b.cands[_e901])) & ~((2 << _s900[_i903]) - 1);
                      let _d902 = 0;
                      for (; _r906 !== 0; _r906 &= _r906 - 1) {
                        _d902 = 31 - Math.clz32(_r906 & -_r906);
                        _f898[_e901] = _d902;
                        if (_e901 === v_f && _d902 !== 1) continue;
                        if (_e901 === v_x && _d902 !== 2) continue;
                        break;
                      }
                      if (_r906 === 0) {
                        _s900[_i903] = 0;
                        _i903--;
                        continue;
                      }
                      _s900[_i903] = _d902;
                      if (_i903 === _a897.length - 1) break;
                      _i903++;
                      _s900[_i903] = 0;
                    }
                    if (_i903 < 0) break;
                    let _c912: boolean = _h855;
                    if (_c912) {
                      let _g908 = 0;
                      G909: {
                        const _a910 = sp.cellEdges[v_k];
                        for (let _i911 = 0; _i911 < _a910.length; _i911++) {
                          const v_y = _a910[_i911];
                          if (!((_f898[v_y] === 1))) continue;
                          _g908++;
                        }
                      }
                      _c912 = (_g908 === 2);
                    }
                    let _c917: boolean = _c912;
                    if (_c917) {
                      let _q913 = true;
                      Q914: {
                        const _a915 = sp.cellEdges[v_k];
                        for (let _i916 = 0; _i916 < _a915.length; _i916++) {
                          const v_y = _a915[_i916];
                          if (!(((_f898[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q913 = false;
                            break Q914;
                          }
                        }
                      }
                      _c917 = _q913;
                    }
                    if (!(_c917)) continue;
                    if (true) {
                      _q895 = true;
                      break Q896;
                    }
                  }
                }
                if (!(_q895)) continue;
                _g866.push(v_x);
              }
            }
            L918: {
              const v_N = _g866;
              let _q919 = false;
              Q920: {
                const _a921 = v_F;
                for (let _i922 = 0; _i922 < _a921.length; _i922++) {
                  const v_x = _a921[_i922];
                  if ((!(v_W.includes(v_x)) || !(v_N.includes(v_x)))) {
                    _q919 = true;
                    break Q920;
                  }
                }
              }
              if (!(_q919)) break L918;
              facts.length = 0;
              changed = false;
              let _q923 = true;
              Q924: {
                const _a925 = v_F;
                for (let _i926 = 0; _i926 < _a925.length; _i926++) {
                  const v_x = _a925[_i926];
                  let _c928: boolean = ((v_W.includes(v_x)) || (v_N.includes(v_x)));
                  if (_c928) {
                    let _c927: boolean = !(!(v_W.includes(v_x)));
                    if (!_c927) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                      _c927 = true;
                    }
                    _c928 = _c927;
                  }
                  let _c930: boolean = _c928;
                  if (_c930) {
                    let _c929: boolean = !(!(v_N.includes(v_x)));
                    if (!_c929) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                      _c929 = true;
                    }
                    _c930 = _c929;
                  }
                  if (!(_c930)) {
                    _q923 = false;
                    break Q924;
                  }
                }
              }
              if (!(_q923)) return -1;
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
  const _g952: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g952.length = 0;
  G953: {
    const _a956 = sp.edges;
    for (let _i957 = 0; _i957 < _a956.length; _i957++) {
      const v_e = _a956[_i957];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g952.push(v_e);
    }
  }
  const v_L = _g952;
  const _eg973 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L958: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    let _c963: boolean = (v_g !== -1);
    if (_c963) {
      let _q959 = false;
      Q960: {
        const _a961 = sp.edges;
        for (let _i962 = 0; _i962 < _a961.length; _i962++) {
          const v_e = _a961[_i962];
          if (!((b.grid[v_e] !== 0))) {
            _q959 = true;
            break Q960;
          }
        }
      }
      _c963 = _q959;
    }
    let _c972: boolean = _c963;
    if (_c972) {
      let _q964 = true;
      Q965: {
        const _a966 = sp.cells;
        for (let _i967 = 0; _i967 < _a966.length; _i967++) {
          const v_c = _a966[_i967];
          let _g968 = 0;
          G969: {
            const _a970 = sp.cellEdges[v_c];
            for (let _i971 = 0; _i971 < _a970.length; _i971++) {
              const v_e = _a970[_i971];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g968++;
            }
          }
          if (!((_g968 !== 1))) {
            _q964 = false;
            break Q965;
          }
        }
      }
      _c972 = _q964;
    }
    if (!(_c972)) break L958;
    const v_G = _eg973.of(sp.edgeEnds[2 * v_g]);
    facts.length = 0;
    changed = false;
    let _q974 = true;
    Q975: {
      const _a976 = v_L;
      for (let _i977 = 0; _i977 < _a976.length; _i977++) {
        const v_x = _a976[_i977];
        if (!((_eg973.of(sp.edgeEnds[2 * v_x]) === v_G))) {
          _q974 = false;
          break Q975;
        }
      }
    }
    let _c983: boolean = _q974;
    if (_c983) {
      let _q978 = true;
      Q979: {
        const _a980 = sp.cells;
        for (let _i981 = 0; _i981 < _a980.length; _i981++) {
          const v_c = _a980[_i981];
          const _h982 = clueAt(cl.pearl, v_c);
          if (!((_h982 !== -1))) continue;
          if (!((_eg973.of(v_c) === v_G))) {
            _q978 = false;
            break Q979;
          }
        }
      }
      _c983 = _q978;
    }
    let _c988: boolean = _c983;
    if (_c988) {
      let _q984 = true;
      Q985: {
        const _a986 = sp.edges;
        for (let _i987 = 0; _i987 < _a986.length; _i987++) {
          const v_e = _a986[_i987];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
          if (!(true)) {
            _q984 = false;
            break Q985;
          }
        }
      }
      _c988 = _q984;
    }
    if (!(_c988)) return -1;
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
  const _g1009: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  _g1009.length = 0;
  G1010: {
    const _a1013 = sp.edges;
    for (let _i1014 = 0; _i1014 < _a1013.length; _i1014++) {
      const v_e = _a1013[_i1014];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1009.push(v_e);
    }
  }
  const v_L = _g1009;
  const _eg1017 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a1015 = sp.edges;
  for (let _i1016 = 0; _i1016 < _a1015.length; _i1016++) {
    const v_e = _a1015[_i1016];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L1018: {
      const v_G = _eg1017.of(sp.edgeEnds[2 * v_e]);
      let _c1030: boolean = (_eg1017.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c1030) {
        let _q1019 = false;
        Q1020: {
          const _a1021 = sp.cells;
          for (let _i1022 = 0; _i1022 < _a1021.length; _i1022++) {
            const v_c = _a1021[_i1022];
            const _h1023 = clueAt(cl.pearl, v_c);
            let _c1029: boolean = !(_eg1017.of(v_c) === v_G);
            if (_c1029) {
              let _c1028: boolean = (_h1023 !== -1);
              if (!_c1028) {
                let _g1024 = 0;
                G1025: {
                  const _a1026 = sp.cellEdges[v_c];
                  for (let _i1027 = 0; _i1027 < _a1026.length; _i1027++) {
                    const v_e = _a1026[_i1027];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1024++;
                  }
                }
                _c1028 = (_g1024 > 0);
              }
              _c1029 = _c1028;
            }
            if (_c1029) {
              _q1019 = true;
              break Q1020;
            }
          }
        }
        _c1030 = _q1019;
      }
      if (!(_c1030)) break L1018;
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
let _p1236 = new Int32Array(0);
let _l1237: readonly number[] = [];
let _f1242 = new Int32Array(0);
let _l1243: readonly number[] = [];
let _p1284 = new Int32Array(0);
let _l1285: readonly number[] = [];
let _f1290 = new Int32Array(0);
let _l1291: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function earlyThrough(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyThroughBinding> | null): number {
  const _g1175: number[] = [];
  const _g1181: number[] = [];
  const _g1204: number[] = [];
  const _g1212: number[] = [];
  if (_p1236.length < sp.edges.length) _p1236 = new Int32Array(sp.edges.length);
  else _p1236.fill(0);
  _l1237 = [];
  let _y1238 = false;
  if (_f1242.length < sp.edges.length) _f1242 = new Int32Array(sp.edges.length).fill(-1);
  else _f1242.fill(-1);
  _l1243 = [];
  const _s1244: number[] = [];
  const _g1260: number[] = [];
  if (_p1284.length < sp.edges.length) _p1284 = new Int32Array(sp.edges.length);
  else _p1284.fill(0);
  _l1285 = [];
  let _y1286 = false;
  if (_f1290.length < sp.edges.length) _f1290 = new Int32Array(sp.edges.length).fill(-1);
  else _f1290.fill(-1);
  _l1291 = [];
  const _s1292: number[] = [];
  const facts = earlyThroughFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (earlyThroughCands.length < sp.edges.length) earlyThroughCands = new Int32Array(sp.edges.length);
  const cands = earlyThroughCands;
  cands.fill(-1);
  _g1175.length = 0;
  G1176: {
    const _a1179 = sp.edges;
    for (let _i1180 = 0; _i1180 < _a1179.length; _i1180++) {
      const v_e = _a1179[_i1180];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1175.push(v_e);
    }
  }
  const v_L = _g1175;
  const _eg1253 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1181.length = 0;
  G1182: {
    const _a1190 = sp.cells;
    for (let _i1191 = 0; _i1191 < _a1190.length; _i1191++) {
      const v_q = _a1190[_i1191];
      const _h1192 = clueAt(cl.pearl, v_q);
      let _c1197: boolean = (_h1192 !== -1);
      if (!_c1197) {
        let _g1193 = 0;
        G1194: {
          const _a1195 = sp.cellEdges[v_q];
          for (let _i1196 = 0; _i1196 < _a1195.length; _i1196++) {
            const v_e = _a1195[_i1196];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g1193++;
          }
        }
        _c1197 = (_g1193 > 0);
      }
      if (!(_c1197)) continue;
      _g1181.push(v_q);
    }
  }
  const v_Q = _g1181;
  const _a1198 = sp.cells;
  for (let _i1199 = 0; _i1199 < _a1198.length; _i1199++) {
    const v_c = _a1198[_i1199];
    let _g1200 = 0;
    G1201: {
      const _a1202 = sp.cellEdges[v_c];
      for (let _i1203 = 0; _i1203 < _a1202.length; _i1203++) {
        const v_e = _a1202[_i1203];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g1200++;
      }
    }
    if (!((_g1200 === 0))) continue;
    let _g1239 = -1;
    const _h1258 = clueAt(cl.pearl, v_c);
    const _h1259 = (_h1258 === -1);
    let _g1287 = -1;
    _g1204.length = 0;
    G1205: {
      const _a1208 = sp.cellEdges[v_c];
      for (let _i1209 = 0; _i1209 < _a1208.length; _i1209++) {
        const v_e = _a1208[_i1209];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1204.push(v_e);
      }
    }
    L1210: {
      const v_F = _g1204;
      const _h1211 = v_F.length;
      if (!((_h1211 > 1))) break L1210;
      _g1212.length = 0;
      G1213: {
        const _a1234 = v_F;
        for (let _i1235 = 0; _i1235 < _a1234.length; _i1235++) {
          const v_e = _a1234[_i1235];
          if (_g1239 !== _epoch) {
            _g1239 = _epoch;
            for (const _e1240 of _l1237) _p1236[_e1240] = 0;
            _y1238 = false;
            const _a1241 = sp.cellEdges[v_c];
            for (const _e1245 of _l1243) _f1242[_e1245] = -1;
            _l1243 = _a1241;
            let _i1247 = 0;
            _s1244[0] = 0;
            let _o1251 = _a1241.length === 0;
            for (;;) {
              if (_a1241.length === 0) {
                if (!_o1251) break;
                _o1251 = false;
              }
              while (_a1241.length > 0 && _i1247 >= 0) {
                const _e1245 = _a1241[_i1247];
                if (_s1244[_i1247] > 0) _f1242[_e1245] = -1;
                let _r1250 = (cands[_e1245] >= 0 ? cands[_e1245] : (cands[_e1245] = b.cands[_e1245])) & ~((2 << _s1244[_i1247]) - 1);
                let _d1246 = 0;
                V1249: for (; _r1250 !== 0; _r1250 &= _r1250 - 1) {
                  _d1246 = 31 - Math.clz32(_r1250 & -_r1250);
                  _f1242[_e1245] = _d1246;
                  for (let _j1248 = 0; _j1248 < _i1247; _j1248++) {
                    const _y1252 = _a1241[_j1248];
                    if (!(((_f1242[_e1245] === 1) && (_f1242[_y1252] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1245, _y1252)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1245, _y1252)))) && (!(_eg1253.of((sp.edgeEnds[2 * _y1252] === v_c ? sp.edgeEnds[2 * _y1252 + 1] : sp.edgeEnds[2 * _y1252])) === _eg1253.of((sp.edgeEnds[2 * _e1245] === v_c ? sp.edgeEnds[2 * _e1245 + 1] : sp.edgeEnds[2 * _e1245]))) || (minus(minus(v_Q, _eg1253.of((sp.edgeEnds[2 * _e1245] === v_c ? sp.edgeEnds[2 * _e1245 + 1] : sp.edgeEnds[2 * _e1245]))), setOf(v_c)).length === 0))))) continue V1249;
                  }
                  break;
                }
                if (_r1250 === 0) {
                  _s1244[_i1247] = 0;
                  _i1247--;
                  continue;
                }
                _s1244[_i1247] = _d1246;
                if (_i1247 === _a1241.length - 1) break;
                _i1247++;
                _s1244[_i1247] = 0;
              }
              if (_i1247 < 0) break;
              let _g1254 = 0;
              G1255: {
                const _a1256 = sp.cellEdges[v_c];
                for (let _i1257 = 0; _i1257 < _a1256.length; _i1257++) {
                  const v_x = _a1256[_i1257];
                  if (!((_f1242[v_x] === 1))) continue;
                  _g1254++;
                }
              }
              if (!(((_g1254 === 2) || ((_g1254 === 0) && _h1259)))) continue;
              if (!(true)) continue;
              _l1237 = _a1241;
              _y1238 = true;
              for (const _e1240 of _a1241) _p1236[_e1240] |= 1 << _f1242[_e1240];
            }
          }
          if (!(((((_p1236[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y1238 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1212.push(v_e);
        }
      }
      const v_W = _g1212;
      _g1260.length = 0;
      G1261: {
        const _a1282 = v_F;
        for (let _i1283 = 0; _i1283 < _a1282.length; _i1283++) {
          const v_e = _a1282[_i1283];
          if (_g1287 !== _epoch) {
            _g1287 = _epoch;
            for (const _e1288 of _l1285) _p1284[_e1288] = 0;
            _y1286 = false;
            const _a1289 = sp.cellEdges[v_c];
            for (const _e1293 of _l1291) _f1290[_e1293] = -1;
            _l1291 = _a1289;
            let _i1295 = 0;
            _s1292[0] = 0;
            let _o1299 = _a1289.length === 0;
            for (;;) {
              if (_a1289.length === 0) {
                if (!_o1299) break;
                _o1299 = false;
              }
              while (_a1289.length > 0 && _i1295 >= 0) {
                const _e1293 = _a1289[_i1295];
                if (_s1292[_i1295] > 0) _f1290[_e1293] = -1;
                let _r1298 = (cands[_e1293] >= 0 ? cands[_e1293] : (cands[_e1293] = b.cands[_e1293])) & ~((2 << _s1292[_i1295]) - 1);
                let _d1294 = 0;
                V1297: for (; _r1298 !== 0; _r1298 &= _r1298 - 1) {
                  _d1294 = 31 - Math.clz32(_r1298 & -_r1298);
                  _f1290[_e1293] = _d1294;
                  for (let _j1296 = 0; _j1296 < _i1295; _j1296++) {
                    const _y1300 = _a1289[_j1296];
                    if (!(((_f1290[_e1293] === 1) && (_f1290[_y1300] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1293, _y1300)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1293, _y1300)))) && (!(_eg1253.of((sp.edgeEnds[2 * _y1300] === v_c ? sp.edgeEnds[2 * _y1300 + 1] : sp.edgeEnds[2 * _y1300])) === _eg1253.of((sp.edgeEnds[2 * _e1293] === v_c ? sp.edgeEnds[2 * _e1293 + 1] : sp.edgeEnds[2 * _e1293]))) || (minus(minus(v_Q, _eg1253.of((sp.edgeEnds[2 * _e1293] === v_c ? sp.edgeEnds[2 * _e1293 + 1] : sp.edgeEnds[2 * _e1293]))), setOf(v_c)).length === 0))))) continue V1297;
                  }
                  break;
                }
                if (_r1298 === 0) {
                  _s1292[_i1295] = 0;
                  _i1295--;
                  continue;
                }
                _s1292[_i1295] = _d1294;
                if (_i1295 === _a1289.length - 1) break;
                _i1295++;
                _s1292[_i1295] = 0;
              }
              if (_i1295 < 0) break;
              let _g1301 = 0;
              G1302: {
                const _a1303 = sp.cellEdges[v_c];
                for (let _i1304 = 0; _i1304 < _a1303.length; _i1304++) {
                  const v_x = _a1303[_i1304];
                  if (!((_f1290[v_x] === 1))) continue;
                  _g1301++;
                }
              }
              if (!(((_g1301 === 2) || ((_g1301 === 0) && _h1259)))) continue;
              if (!(true)) continue;
              _l1285 = _a1289;
              _y1286 = true;
              for (const _e1288 of _a1289) _p1284[_e1288] |= 1 << _f1290[_e1288];
            }
          }
          if (!(((((_p1284[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y1286 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1260.push(v_e);
        }
      }
      L1305: {
        const v_N = _g1260;
        let _q1306 = false;
        Q1307: {
          const _a1308 = v_F;
          for (let _i1309 = 0; _i1309 < _a1308.length; _i1309++) {
            const v_e = _a1308[_i1309];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q1306 = true;
              break Q1307;
            }
          }
        }
        if (!(_q1306)) break L1305;
        facts.length = 0;
        changed = false;
        let _q1310 = true;
        Q1311: {
          const _a1312 = v_F;
          for (let _i1313 = 0; _i1313 < _a1312.length; _i1313++) {
            const v_e = _a1312[_i1313];
            let _c1315: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c1315) {
              let _c1314: boolean = !(!(v_W.includes(v_e)));
              if (!_c1314) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c1314 = true;
              }
              _c1315 = _c1314;
            }
            let _c1317: boolean = _c1315;
            if (_c1317) {
              let _c1316: boolean = !(!(v_N.includes(v_e)));
              if (!_c1316) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c1316 = true;
              }
              _c1317 = _c1316;
            }
            if (!(_c1317)) {
              _q1310 = false;
              break Q1311;
            }
          }
        }
        if (!(_q1310)) return -1;
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
