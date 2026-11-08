// Compiled by `npm run describe` from src/games/tracks/tracks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, cutEdges, edgeGroups, keptEdgeGroups, keptStore, minus, rangeMask, setOf, step, through, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
  end: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "oneWayIn" | "bothSidesLeft" | "clueFull" | "clueExact" | "closeLoop" | "strand" | "finishEarly" | "looseEnd" | "sharedFate" | "sharedFateEmpties" | "parity";

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
  { id: "oneWayIn", tier: 0 },
  { id: "bothSidesLeft", tier: 0 },
  { id: "clueFull", tier: 0 },
  { id: "clueExact", tier: 0 },
  { id: "closeLoop", tier: 0 },
  { id: "strand", tier: 0 },
  { id: "finishEarly", tier: 0 },
  { id: "looseEnd", tier: 1 },
  { id: "sharedFate", tier: 1 },
  { id: "sharedFateEmpties", tier: 2 },
  { id: "parity", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g1420: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1397 = true;
  Q1398: {
    const _a1399 = sp.cells;
    for (let _i1400 = 0; _i1400 < _a1399.length; _i1400++) {
      const v_c = _a1399[_i1400];
      let _g1401 = 0;
      G1402: {
        const _a1403 = sp.adj4[v_c];
        for (let _i1404 = 0; _i1404 < _a1403.length; _i1404++) {
          const _h1405 = (g[sp.adj4Edges[v_c][_i1404]] || -1);
          if (!((_h1405 === 1))) continue;
          _g1401++;
        }
      }
      let _g1406 = 0;
      G1407: {
        for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
          if (!((cl.end.at[v_q] === v_c))) continue;
          _g1406++;
        }
      }
      let _c1415: boolean = ((_g1401 + _g1406) === 0);
      if (!_c1415) {
        let _g1408 = 0;
        G1409: {
          const _a1410 = sp.adj4[v_c];
          for (let _i1411 = 0; _i1411 < _a1410.length; _i1411++) {
            const _h1412 = (g[sp.adj4Edges[v_c][_i1411]] || -1);
            if (!((_h1412 === 1))) continue;
            _g1408++;
          }
        }
        let _g1413 = 0;
        G1414: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if (!((cl.end.at[v_q] === v_c))) continue;
            _g1413++;
          }
        }
        _c1415 = ((_g1408 + _g1413) === 2);
      }
      if (!(_c1415)) {
        _q1397 = false;
        break Q1398;
      }
    }
  }
  if (!(_q1397)) return false;
  let _g1416 = 0;
  G1417: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      _g1416++;
    }
  }
  if (!((_g1416 === 2))) return false;
  let _q1418 = true;
  Q1419: {
    _g1420.length = 0;
    G1421: {
      const _a1424 = sp.edges;
      for (let _i1425 = 0; _i1425 < _a1424.length; _i1425++) {
        const v_e = _a1424[_i1425];
        const _h1426 = (g[v_e] || -1);
        if (!((_h1426 === 1))) continue;
        _g1420.push(v_e);
      }
    }
    const v_R = _g1420;
    const _eg1445 = edgeGroups(sp, v_R);
    const _a1427 = sp.cells;
    for (let _i1428 = 0; _i1428 < _a1427.length; _i1428++) {
      const v_a = _a1427[_i1428];
      let _g1429 = 0;
      G1430: {
        const _a1431 = sp.adj4[v_a];
        for (let _i1432 = 0; _i1432 < _a1431.length; _i1432++) {
          const _h1433 = (g[sp.adj4Edges[v_a][_i1432]] || -1);
          if (!((_h1433 === 1))) continue;
          _g1429++;
        }
      }
      let _g1434 = 0;
      G1435: {
        for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
          if (!((cl.end.at[v_q] === v_a))) continue;
          _g1434++;
        }
      }
      if (!(((_g1429 + _g1434) > 0))) continue;
      const _a1436 = sp.cells;
      for (let _i1437 = 0; _i1437 < _a1436.length; _i1437++) {
        const v_b = _a1436[_i1437];
        let _g1438 = 0;
        G1439: {
          const _a1440 = sp.adj4[v_b];
          for (let _i1441 = 0; _i1441 < _a1440.length; _i1441++) {
            const _h1442 = (g[sp.adj4Edges[v_b][_i1441]] || -1);
            if (!((_h1442 === 1))) continue;
            _g1438++;
          }
        }
        let _g1443 = 0;
        G1444: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if (!((cl.end.at[v_q] === v_b))) continue;
            _g1443++;
          }
        }
        if (!(((_g1438 + _g1443) > 0))) continue;
        if (!((_eg1445.of(v_b) === _eg1445.of(v_a)))) {
          _q1418 = false;
          break Q1419;
        }
      }
    }
  }
  if (!(_q1418)) return false;
  for (let _k1446 = 0; _k1446 < cl.count.at.length; _k1446++) {
    const _at1447 = cl.count.at[_k1446];
    const _v1448 = cl.count.v[_k1446];
    let _g1449 = 0;
    G1450: {
      const _a1451 = sp.lineCells[_at1447];
      for (let _i1452 = 0; _i1452 < _a1451.length; _i1452++) {
        const v_c = _a1451[_i1452];
        let _g1453 = 0;
        G1454: {
          const _a1455 = sp.adj4[v_c];
          for (let _i1456 = 0; _i1456 < _a1455.length; _i1456++) {
            const _h1457 = (g[sp.adj4Edges[v_c][_i1456]] || -1);
            if (!((_h1457 === 1))) continue;
            _g1453++;
          }
        }
        let _g1458 = 0;
        G1459: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if (!((cl.end.at[v_q] === v_c))) continue;
            _g1458++;
          }
        }
        if (!(((_g1453 + _g1458) > 0))) continue;
        _g1449++;
      }
    }
    if (!((_g1449 === _v1448))) return false;
  }
  for (let _k1460 = 0; _k1460 < cl.end.at.length; _k1460++) {
    const _at1461 = cl.end.at[_k1460];
    const _v1462 = cl.end.v[_k1460];
    let _g1463 = 0;
    G1464: {
      const _a1465 = sp.adj4[_at1461];
      for (let _i1466 = 0; _i1466 < _a1465.length; _i1466++) {
        const _h1467 = (g[sp.adj4Edges[_at1461][_i1466]] || -1);
        if (!((_h1467 === 1))) continue;
        _g1463++;
      }
    }
    let _g1468 = 0;
    G1469: {
      for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
        if (!((cl.end.at[v_q] === _at1461))) continue;
        _g1468++;
      }
    }
    if (!((((_g1463 + _g1468) === 2) && (step(sp, _at1461, _v1462) === -1)))) return false;
  }
  return true;
}

export interface OneWayInBinding {
  c: number;
}

const oneWayInFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function oneWayIn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OneWayInBinding> | null): number {
  const _g108: number[] = [];
  const facts = oneWayInFacts;
  let fired = 0;
  let changed = false;
  const _a74 = sp.cells;
  for (let _i75 = 0; _i75 < _a74.length; _i75++) {
    const v_c = _a74[_i75];
    let _c147: boolean = !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0));
    if (_c147) {
      _g108.length = 0;
      G109: {
        const _a125 = sp.adj4[v_c];
        for (let _i126 = 0; _i126 < _a125.length; _i126++) {
          const v_y = _a125[_i126];
          const _h127 = (b.grid[sp.adj4Edges[v_c][_i126]] || -1);
          let _c141: boolean = (_h127 !== 1);
          if (_c141) {
            let _c140: boolean = (((_h127 === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
            if (!_c140) {
              let _c139: boolean = (_h127 !== 1);
              if (_c139) {
                let _c138: boolean = (drawn(b, sp, cl, v_c) === 2);
                if (!_c138) {
                  let _g132 = 0;
                  G133: {
                    const _a135 = sp.adj4[v_y];
                    for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                      const _h137 = (b.grid[sp.adj4Edges[v_y][_i136]] || -1);
                      if (!((_h137 === 1))) continue;
                      _g132++;
                    }
                  }
                  _c138 = ((_g132 + exits(sp, cl, v_y)) === 2);
                }
                _c139 = _c138;
              }
              _c140 = _c139;
            }
            _c141 = !(_c140);
          }
          if (!(_c141)) continue;
          _g108.push(v_y);
        }
      }
      let _g142 = 0;
      G143: {
        const _a144 = sp.adj4[v_c];
        for (let _i145 = 0; _i145 < _a144.length; _i145++) {
          const _h146 = (b.grid[sp.adj4Edges[v_c][_i145]] || -1);
          if (!((_h146 === 1))) continue;
          _g142++;
        }
      }
      _c147 = ((_g108.length + (_g142 + exits(sp, cl, v_c))) < 2);
    }
    if (!(_c147)) continue;
    facts.length = 0;
    changed = false;
    let _c153: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c153) {
      let _g148 = 0;
      G149: {
        const _a150 = sp.adj4[v_c];
        for (let _i151 = 0; _i151 < _a150.length; _i151++) {
          const _h152 = (b.grid[sp.adj4Edges[v_c][_i151]] || -1);
          if (!((_h152 === 1))) continue;
          _g148++;
        }
      }
      _c153 = ((_g148 + exits(sp, cl, v_c)) > 0);
    }
    let _c154: boolean = !(_c153);
    if (_c154) {
      if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
      _c154 = true;
    }
    if (!(_c154)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface BothSidesLeftBinding {
  c: number;
  F: readonly number[];
}

const bothSidesLeftFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function bothSidesLeft(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BothSidesLeftBinding> | null): number {
  const _g281: number[] = [];
  const facts = bothSidesLeftFacts;
  let fired = 0;
  let changed = false;
  const _a237 = sp.cells;
  for (let _i238 = 0; _i238 < _a237.length; _i238++) {
    const v_c = _a237[_i238];
    let _c243: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c243) {
      let _g239 = 0;
      G240: {
        const _a241 = sp.adj4[v_c];
        for (let _i242 = 0; _i242 < _a241.length; _i242++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i242]] || -1) === 1))) continue;
          _g239++;
        }
      }
      _c243 = ((_g239 + exits(sp, cl, v_c)) > 0);
    }
    let _c248: boolean = _c243;
    if (_c248) {
      let _g244 = 0;
      G245: {
        const _a246 = sp.adj4[v_c];
        for (let _i247 = 0; _i247 < _a246.length; _i247++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i247]] || -1) === 1))) continue;
          _g244++;
        }
      }
      _c248 = ((_g244 + exits(sp, cl, v_c)) < 2);
    }
    if (!(_c248)) continue;
    _g281.length = 0;
    G282: {
      const _a298 = sp.adj4[v_c];
      for (let _i299 = 0; _i299 < _a298.length; _i299++) {
        const v_y = _a298[_i299];
        let _c308: boolean = ((b.grid[sp.adj4Edges[v_c][_i299]] || -1) !== 1);
        if (_c308) {
          let _c307: boolean = ((((b.grid[sp.adj4Edges[v_c][_i299]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
          if (!_c307) {
            let _c306: boolean = ((b.grid[sp.adj4Edges[v_c][_i299]] || -1) !== 1);
            if (_c306) {
              let _c305: boolean = (drawn(b, sp, cl, v_c) === 2);
              if (!_c305) {
                let _g300 = 0;
                G301: {
                  const _a303 = sp.adj4[v_y];
                  for (let _i304 = 0; _i304 < _a303.length; _i304++) {
                    if (!(((b.grid[sp.adj4Edges[v_y][_i304]] || -1) === 1))) continue;
                    _g300++;
                  }
                }
                _c305 = ((_g300 + exits(sp, cl, v_y)) === 2);
              }
              _c306 = _c305;
            }
            _c307 = _c306;
          }
          _c308 = !(_c307);
        }
        if (!(_c308)) continue;
        _g281.push(v_y);
      }
    }
    L309: {
      const v_F = _g281;
      const _h310 = v_F.length;
      let _c315: boolean = (_h310 > 0);
      if (_c315) {
        let _g311 = 0;
        G312: {
          const _a313 = sp.adj4[v_c];
          for (let _i314 = 0; _i314 < _a313.length; _i314++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i314]] || -1) === 1))) continue;
            _g311++;
          }
        }
        _c315 = ((_h310 + (_g311 + exits(sp, cl, v_c))) <= 2);
      }
      if (!(_c315)) break L309;
      facts.length = 0;
      changed = false;
      let _g316 = 0;
      G317: {
        const _a318 = sp.adj4[v_c];
        for (let _i319 = 0; _i319 < _a318.length; _i319++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i319]] || -1) === 1))) continue;
          _g316++;
        }
      }
      let _c325: boolean = ((_h310 + (_g316 + exits(sp, cl, v_c))) === 2);
      if (_c325) {
        let _q320 = true;
        Q321: {
          const _a322 = v_F;
          for (let _i323 = 0; _i323 < _a322.length; _i323++) {
            const v_y = _a322[_i323];
            const _t324 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t324] !== 0)) { if (fire === null) { b.placeAt(_t324, 1); changed = true; } else facts.push(PLACE, _t324, 1); }
            if (!(true)) {
              _q320 = false;
              break Q321;
            }
          }
        }
        _c325 = _q320;
      }
      if (!(_c325)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, F: v_F.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueFullBinding {
  L: number;
  O: readonly number[];
}

const clueFullFacts: number[] = [];
let clueFullCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function clueFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueFullBinding> | null): number {
  const _g388: number[] = [];
  const facts = clueFullFacts;
  let fired = 0;
  let changed = false;
  if (clueFullCands.length < sp.edges.length) clueFullCands = new Int32Array(sp.edges.length);
  const cands = clueFullCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a370 = sp.lines;
  for (let _i371 = 0; _i371 < _a370.length; _i371++) {
    const v_L = _a370[_i371];
    const _h407 = clueAt(cl.count, v_L);
    _g388.length = 0;
    G389: {
      const _a397 = sp.lineCells[v_L];
      for (let _i398 = 0; _i398 < _a397.length; _i398++) {
        const v_c = _a397[_i398];
        let _c404: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c404) {
          let _g399 = 0;
          G400: {
            const _a401 = sp.adj4[v_c];
            for (let _i402 = 0; _i402 < _a401.length; _i402++) {
              const _h403 = (b.grid[sp.adj4Edges[v_c][_i402]] || -1);
              if (!((_h403 === 1))) continue;
              _g399++;
            }
          }
          _c404 = ((_g399 + exits(sp, cl, v_c)) > 0);
        }
        if (!((!(_c404) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g388.push(v_c);
      }
    }
    L405: {
      const v_O = _g388;
      const _h406 = v_O.length;
      if (!(((_h406 > 0) && (laidMarked(b, sp, cl, cands, v_L) >= _h407)))) break L405;
      facts.length = 0;
      changed = false;
      let _c412: boolean = (laidMarked(b, sp, cl, cands, v_L) === _h407);
      if (_c412) {
        let _q408 = true;
        Q409: {
          const _a410 = v_O;
          for (let _i411 = 0; _i411 < _a410.length; _i411++) {
            const v_c = _a410[_i411];
            if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
            if (!(true)) {
              _q408 = false;
              break Q409;
            }
          }
        }
        _c412 = _q408;
      }
      if (!(_c412)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, O: v_O.slice() }, facts)) return 1;
        cands.fill(-1);
        laidMarkedKept.clear();
      }
    }
  }
  return fired;
}

export interface ClueExactBinding {
  L: number;
  O: readonly number[];
}

const clueExactFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function clueExact(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueExactBinding> | null): number {
  const _g471: number[] = [];
  const facts = clueExactFacts;
  let fired = 0;
  let changed = false;
  const _a453 = sp.lines;
  for (let _i454 = 0; _i454 < _a453.length; _i454++) {
    const v_L = _a453[_i454];
    const _h494 = clueAt(cl.count, v_L);
    _g471.length = 0;
    G472: {
      const _a480 = sp.lineCells[v_L];
      for (let _i481 = 0; _i481 < _a480.length; _i481++) {
        const v_c = _a480[_i481];
        let _c487: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c487) {
          let _g482 = 0;
          G483: {
            const _a484 = sp.adj4[v_c];
            for (let _i485 = 0; _i485 < _a484.length; _i485++) {
              const _h486 = (b.grid[sp.adj4Edges[v_c][_i485]] || -1);
              if (!((_h486 === 1))) continue;
              _g482++;
            }
          }
          _c487 = ((_g482 + exits(sp, cl, v_c)) > 0);
        }
        if (!((!(_c487) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g471.push(v_c);
      }
    }
    L488: {
      const v_O = _g471;
      const _h489 = v_O.length;
      let _c495: boolean = (_h489 > 0);
      if (_c495) {
        let _g490 = 0;
        G491: {
          const _a492 = sp.lineCells[v_L];
          for (let _i493 = 0; _i493 < _a492.length; _i493++) {
            const v_c = _a492[_i493];
            if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
            _g490++;
          }
        }
        _c495 = ((sp.lineCells[v_L].length - _g490) <= _h494);
      }
      if (!(_c495)) break L488;
      facts.length = 0;
      changed = false;
      let _g496 = 0;
      G497: {
        const _a498 = sp.lineCells[v_L];
        for (let _i499 = 0; _i499 < _a498.length; _i499++) {
          const v_c = _a498[_i499];
          if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
          _g496++;
        }
      }
      let _c504: boolean = ((sp.lineCells[v_L].length - _g496) === _h494);
      if (_c504) {
        let _q500 = true;
        Q501: {
          const _a502 = v_O;
          for (let _i503 = 0; _i503 < _a502.length; _i503++) {
            const v_c = _a502[_i503];
            if ((b.edgeCand(v_c) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 2); changed = true; } else facts.push(STRIKE_EDGE, v_c, 2); }
            if (!(true)) {
              _q500 = false;
              break Q501;
            }
          }
        }
        _c504 = _q500;
      }
      if (!(_c504)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, O: v_O.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CloseLoopBinding {
  R: readonly number[];
  e: number;
  G: readonly number[];
}

const closeLoopFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function closeLoop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CloseLoopBinding> | null): number {
  const _g542: number[] = [];
  const facts = closeLoopFacts;
  let fired = 0;
  let changed = false;
  _g542.length = 0;
  G543: {
    const _a546 = sp.edges;
    for (let _i547 = 0; _i547 < _a546.length; _i547++) {
      const v_e = _a546[_i547];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g542.push(v_e);
    }
  }
  const v_R = _g542;
  const _eg578 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a548 = sp.edges;
  for (let _i549 = 0; _i549 < _a548.length; _i549++) {
    const v_e = _a548[_i549];
    let _c556: boolean = !((b.grid[v_e] !== 0));
    if (_c556) {
      const _t550 = sp.edgeEnds[2 * v_e];
      let _c555: boolean = !(((b.edgeCand(_t550) >> 2) & 1) !== 0);
      if (!_c555) {
        let _g551 = 0;
        G552: {
          const _a553 = sp.adj4[_t550];
          for (let _i554 = 0; _i554 < _a553.length; _i554++) {
            if (!(((b.grid[sp.adj4Edges[_t550][_i554]] || -1) === 1))) continue;
            _g551++;
          }
        }
        _c555 = ((_g551 + exits(sp, cl, _t550)) > 0);
      }
      _c556 = _c555;
    }
    let _c563: boolean = _c556;
    if (_c563) {
      const _t557 = sp.edgeEnds[2 * v_e + 1];
      let _c562: boolean = !(((b.edgeCand(_t557) >> 2) & 1) !== 0);
      if (!_c562) {
        let _g558 = 0;
        G559: {
          const _a560 = sp.adj4[_t557];
          for (let _i561 = 0; _i561 < _a560.length; _i561++) {
            if (!(((b.grid[sp.adj4Edges[_t557][_i561]] || -1) === 1))) continue;
            _g558++;
          }
        }
        _c562 = ((_g558 + exits(sp, cl, _t557)) > 0);
      }
      _c563 = _c562;
    }
    let _c577: boolean = _c563;
    if (_c577) {
      const _t564 = sp.edgeEnds[2 * v_e];
      const _t565 = sp.edgeEnds[2 * v_e + 1];
      let _c576: boolean = ((((b.grid[sp.edgeOf(_t564, _t565)] || -1) === 2) || !(((b.edgeCand(_t564) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t565) >> 1) & 1) !== 0));
      if (!_c576) {
        let _c575: boolean = ((b.grid[sp.edgeOf(_t564, _t565)] || -1) !== 1);
        if (_c575) {
          let _g566 = 0;
          G567: {
            const _a568 = sp.adj4[_t564];
            for (let _i569 = 0; _i569 < _a568.length; _i569++) {
              if (!(((b.grid[sp.adj4Edges[_t564][_i569]] || -1) === 1))) continue;
              _g566++;
            }
          }
          let _c574: boolean = ((_g566 + exits(sp, cl, _t564)) === 2);
          if (!_c574) {
            let _g570 = 0;
            G571: {
              const _a572 = sp.adj4[_t565];
              for (let _i573 = 0; _i573 < _a572.length; _i573++) {
                if (!(((b.grid[sp.adj4Edges[_t565][_i573]] || -1) === 1))) continue;
                _g570++;
              }
            }
            _c574 = ((_g570 + exits(sp, cl, _t565)) === 2);
          }
          _c575 = _c574;
        }
        _c576 = _c575;
      }
      _c577 = !(_c576);
    }
    if (!(_c577)) continue;
    L579: {
      const v_G = _eg578.of(sp.edgeEnds[2 * v_e]);
      if (!((_eg578.of(sp.edgeEnds[2 * v_e + 1]) === v_G))) break L579;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ R: v_R.slice(), e: v_e, G: v_G.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface StrandBinding {
  R: readonly number[];
  e: number;
  G: readonly number[];
  H: readonly number[];
}

const strandFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strand(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandBinding> | null): number {
  const _g633: number[] = [];
  const facts = strandFacts;
  let fired = 0;
  let changed = false;
  _g633.length = 0;
  G634: {
    const _a637 = sp.edges;
    for (let _i638 = 0; _i638 < _a637.length; _i638++) {
      const v_e = _a637[_i638];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g633.push(v_e);
    }
  }
  const v_R = _g633;
  const _eg669 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a639 = sp.edges;
  for (let _i640 = 0; _i640 < _a639.length; _i640++) {
    const v_e = _a639[_i640];
    let _c647: boolean = !((b.grid[v_e] !== 0));
    if (_c647) {
      const _t641 = sp.edgeEnds[2 * v_e];
      let _c646: boolean = !(((b.edgeCand(_t641) >> 2) & 1) !== 0);
      if (!_c646) {
        let _g642 = 0;
        G643: {
          const _a644 = sp.adj4[_t641];
          for (let _i645 = 0; _i645 < _a644.length; _i645++) {
            if (!(((b.grid[sp.adj4Edges[_t641][_i645]] || -1) === 1))) continue;
            _g642++;
          }
        }
        _c646 = ((_g642 + exits(sp, cl, _t641)) > 0);
      }
      _c647 = _c646;
    }
    let _c654: boolean = _c647;
    if (_c654) {
      const _t648 = sp.edgeEnds[2 * v_e + 1];
      let _c653: boolean = !(((b.edgeCand(_t648) >> 2) & 1) !== 0);
      if (!_c653) {
        let _g649 = 0;
        G650: {
          const _a651 = sp.adj4[_t648];
          for (let _i652 = 0; _i652 < _a651.length; _i652++) {
            if (!(((b.grid[sp.adj4Edges[_t648][_i652]] || -1) === 1))) continue;
            _g649++;
          }
        }
        _c653 = ((_g649 + exits(sp, cl, _t648)) > 0);
      }
      _c654 = _c653;
    }
    let _c668: boolean = _c654;
    if (_c668) {
      const _t655 = sp.edgeEnds[2 * v_e];
      const _t656 = sp.edgeEnds[2 * v_e + 1];
      let _c667: boolean = ((((b.grid[sp.edgeOf(_t655, _t656)] || -1) === 2) || !(((b.edgeCand(_t655) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t656) >> 1) & 1) !== 0));
      if (!_c667) {
        let _c666: boolean = ((b.grid[sp.edgeOf(_t655, _t656)] || -1) !== 1);
        if (_c666) {
          let _g657 = 0;
          G658: {
            const _a659 = sp.adj4[_t655];
            for (let _i660 = 0; _i660 < _a659.length; _i660++) {
              if (!(((b.grid[sp.adj4Edges[_t655][_i660]] || -1) === 1))) continue;
              _g657++;
            }
          }
          let _c665: boolean = ((_g657 + exits(sp, cl, _t655)) === 2);
          if (!_c665) {
            let _g661 = 0;
            G662: {
              const _a663 = sp.adj4[_t656];
              for (let _i664 = 0; _i664 < _a663.length; _i664++) {
                if (!(((b.grid[sp.adj4Edges[_t656][_i664]] || -1) === 1))) continue;
                _g661++;
              }
            }
            _c665 = ((_g661 + exits(sp, cl, _t656)) === 2);
          }
          _c666 = _c665;
        }
        _c667 = _c666;
      }
      _c668 = !(_c667);
    }
    if (!(_c668)) continue;
    const v_G = _eg669.of(sp.edgeEnds[2 * v_e]);
    L670: {
      const v_H = _eg669.of(sp.edgeEnds[2 * v_e + 1]);
      let _c673: boolean = !(_eg669.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c673) {
        let _q671 = false;
        Q672: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg669.of(cl.end.at[v_q]) === v_G)) {
              _q671 = true;
              break Q672;
            }
          }
        }
        _c673 = _q671;
      }
      let _c676: boolean = _c673;
      if (_c676) {
        let _q674 = false;
        Q675: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg669.of(cl.end.at[v_q]) === v_H)) {
              _q674 = true;
              break Q675;
            }
          }
        }
        _c676 = _q674;
      }
      let _c686: boolean = _c676;
      if (_c686) {
        let _q677 = false;
        Q678: {
          const _a679 = sp.cells;
          for (let _i680 = 0; _i680 < _a679.length; _i680++) {
            const v_c = _a679[_i680];
            let _c685: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c685) {
              let _g681 = 0;
              G682: {
                const _a683 = sp.adj4[v_c];
                for (let _i684 = 0; _i684 < _a683.length; _i684++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i684]] || -1) === 1))) continue;
                  _g681++;
                }
              }
              _c685 = ((_g681 + exits(sp, cl, v_c)) > 0);
            }
            if (((_c685 && !(_eg669.of(v_c) === v_G)) && !(_eg669.of(v_c) === v_H))) {
              _q677 = true;
              break Q678;
            }
          }
        }
        _c686 = _q677;
      }
      if (!(_c686)) break L670;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ R: v_R.slice(), e: v_e, G: v_G.slice(), H: v_H.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface FinishEarlyBinding {
  R: readonly number[];
  e: number;
  G: readonly number[];
  H: readonly number[];
}

const finishEarlyFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function finishEarly(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FinishEarlyBinding> | null): number {
  const _g739: number[] = [];
  const facts = finishEarlyFacts;
  let fired = 0;
  let changed = false;
  _g739.length = 0;
  G740: {
    const _a743 = sp.edges;
    for (let _i744 = 0; _i744 < _a743.length; _i744++) {
      const v_e = _a743[_i744];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g739.push(v_e);
    }
  }
  const v_R = _g739;
  const _eg775 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a745 = sp.edges;
  for (let _i746 = 0; _i746 < _a745.length; _i746++) {
    const v_e = _a745[_i746];
    let _c753: boolean = !((b.grid[v_e] !== 0));
    if (_c753) {
      const _t747 = sp.edgeEnds[2 * v_e];
      let _c752: boolean = !(((b.edgeCand(_t747) >> 2) & 1) !== 0);
      if (!_c752) {
        let _g748 = 0;
        G749: {
          const _a750 = sp.adj4[_t747];
          for (let _i751 = 0; _i751 < _a750.length; _i751++) {
            if (!(((b.grid[sp.adj4Edges[_t747][_i751]] || -1) === 1))) continue;
            _g748++;
          }
        }
        _c752 = ((_g748 + exits(sp, cl, _t747)) > 0);
      }
      _c753 = _c752;
    }
    let _c760: boolean = _c753;
    if (_c760) {
      const _t754 = sp.edgeEnds[2 * v_e + 1];
      let _c759: boolean = !(((b.edgeCand(_t754) >> 2) & 1) !== 0);
      if (!_c759) {
        let _g755 = 0;
        G756: {
          const _a757 = sp.adj4[_t754];
          for (let _i758 = 0; _i758 < _a757.length; _i758++) {
            if (!(((b.grid[sp.adj4Edges[_t754][_i758]] || -1) === 1))) continue;
            _g755++;
          }
        }
        _c759 = ((_g755 + exits(sp, cl, _t754)) > 0);
      }
      _c760 = _c759;
    }
    let _c774: boolean = _c760;
    if (_c774) {
      const _t761 = sp.edgeEnds[2 * v_e];
      const _t762 = sp.edgeEnds[2 * v_e + 1];
      let _c773: boolean = ((((b.grid[sp.edgeOf(_t761, _t762)] || -1) === 2) || !(((b.edgeCand(_t761) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t762) >> 1) & 1) !== 0));
      if (!_c773) {
        let _c772: boolean = ((b.grid[sp.edgeOf(_t761, _t762)] || -1) !== 1);
        if (_c772) {
          let _g763 = 0;
          G764: {
            const _a765 = sp.adj4[_t761];
            for (let _i766 = 0; _i766 < _a765.length; _i766++) {
              if (!(((b.grid[sp.adj4Edges[_t761][_i766]] || -1) === 1))) continue;
              _g763++;
            }
          }
          let _c771: boolean = ((_g763 + exits(sp, cl, _t761)) === 2);
          if (!_c771) {
            let _g767 = 0;
            G768: {
              const _a769 = sp.adj4[_t762];
              for (let _i770 = 0; _i770 < _a769.length; _i770++) {
                if (!(((b.grid[sp.adj4Edges[_t762][_i770]] || -1) === 1))) continue;
                _g767++;
              }
            }
            _c771 = ((_g767 + exits(sp, cl, _t762)) === 2);
          }
          _c772 = _c771;
        }
        _c773 = _c772;
      }
      _c774 = !(_c773);
    }
    if (!(_c774)) continue;
    const v_G = _eg775.of(sp.edgeEnds[2 * v_e]);
    L776: {
      const v_H = _eg775.of(sp.edgeEnds[2 * v_e + 1]);
      let _c779: boolean = !(_eg775.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c779) {
        let _q777 = false;
        Q778: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg775.of(cl.end.at[v_q]) === v_G)) {
              _q777 = true;
              break Q778;
            }
          }
        }
        _c779 = _q777;
      }
      let _c782: boolean = _c779;
      if (_c782) {
        let _q780 = false;
        Q781: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg775.of(cl.end.at[v_q]) === v_H)) {
              _q780 = true;
              break Q781;
            }
          }
        }
        _c782 = _q780;
      }
      let _c792: boolean = _c782;
      if (_c792) {
        let _q783 = false;
        Q784: {
          const _a785 = sp.lines;
          for (let _i786 = 0; _i786 < _a785.length; _i786++) {
            const v_L = _a785[_i786];
            const _h791 = clueAt(cl.count, v_L);
            let _g787 = 0;
            G788: {
              const _a789 = sp.lineCells[v_L];
              for (let _i790 = 0; _i790 < _a789.length; _i790++) {
                const v_c = _a789[_i790];
                if (!(((_eg775.of(v_c) === v_G) || (_eg775.of(v_c) === v_H)))) continue;
                _g787++;
              }
            }
            if ((_g787 < _h791)) {
              _q783 = true;
              break Q784;
            }
          }
        }
        _c792 = _q783;
      }
      if (!(_c792)) break L776;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ R: v_R.slice(), e: v_e, G: v_G.slice(), H: v_H.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface LooseEndBinding {
  L: number;
  F: readonly number[];
  P: readonly number[];
  p: number;
  Q: readonly number[];
}

const looseEndFacts: number[] = [];
let looseEndCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function looseEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LooseEndBinding> | null): number {
  const _g875: number[] = [];
  const _g901: number[] = [];
  const _g931: number[] = [];
  const facts = looseEndFacts;
  let fired = 0;
  let changed = false;
  if (looseEndCands.length < sp.edges.length) looseEndCands = new Int32Array(sp.edges.length);
  const cands = looseEndCands;
  cands.fill(-1);
  crossableMarkedKept.clear();
  const _a873 = sp.lines;
  for (let _i874 = 0; _i874 < _a873.length; _i874++) {
    const v_L = _a873[_i874];
    const _h890 = clueAt(cl.count, v_L);
    const _h922 = (sp.rows.includes(v_L));
    _g875.length = 0;
    G876: {
      const _a883 = sp.lineCells[v_L];
      for (let _i884 = 0; _i884 < _a883.length; _i884++) {
        const v_c = _a883[_i884];
        let _g885 = 0;
        G886: {
          const _a887 = sp.adj4[v_c];
          for (let _i888 = 0; _i888 < _a887.length; _i888++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i888]] || -1) === 1))) continue;
            _g885++;
          }
        }
        if (!(((_g885 + exits(sp, cl, v_c)) === 2))) continue;
        _g875.push(v_c);
      }
    }
    L889: {
      const v_F = _g875;
      const _h891 = v_F.length;
      let _c900: boolean = ((_h890 - _h891) === 2);
      if (_c900) {
        let _q892 = true;
        Q893: {
          const _a894 = sp.lineCells[v_L];
          for (let _i895 = 0; _i895 < _a894.length; _i895++) {
            const v_c = _a894[_i895];
            let _g896 = 0;
            G897: {
              const _a898 = sp.adj4[v_c];
              for (let _i899 = 0; _i899 < _a898.length; _i899++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i899]] || -1) === 1))) continue;
                _g896++;
              }
            }
            if (!(((_g896 + exits(sp, cl, v_c)) !== 2))) continue;
            if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
              _q892 = false;
              break Q893;
            }
          }
        }
        _c900 = _q892;
      }
      if (!(_c900)) break L889;
      _g901.length = 0;
      G902: {
        const _a915 = sp.lineCells[v_L];
        for (let _i916 = 0; _i916 < _a915.length; _i916++) {
          const v_c = _a915[_i916];
          const _h921 = clueAt(cl.end, v_c);
          let _g917 = 0;
          G918: {
            const _a919 = sp.adj4[v_c];
            for (let _i920 = 0; _i920 < _a919.length; _i920++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i920]] || -1) === 1))) continue;
              _g917++;
            }
          }
          let _c928: boolean = ((_g917 + exits(sp, cl, v_c)) === 1);
          if (_c928) {
            let _c927: boolean = ((_h921 >= 1) && ((_h921 >= 3) === _h922));
            if (!_c927) {
              let _q923 = false;
              Q924: {
                const _a925 = sp.adj4[v_c];
                for (let _i926 = 0; _i926 < _a925.length; _i926++) {
                  const v_y = _a925[_i926];
                  if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_c][_i926]] || -1) === 1)) {
                    _q923 = true;
                    break Q924;
                  }
                }
              }
              _c927 = _q923;
            }
            _c928 = _c927;
          }
          if (!(_c928)) continue;
          _g901.push(v_c);
        }
      }
      L929: {
        const v_P = _g901;
        const _h930 = v_P.length;
        if (!((_h930 === 1))) break L929;
        const v_p = (v_P[0] ?? -1);
        _g931.length = 0;
        G932: {
          const _a935 = sp.adj4[v_p];
          for (let _i936 = 0; _i936 < _a935.length; _i936++) {
            const v_y = _a935[_i936];
            if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i936]] || -1) !== 1)))) continue;
            _g931.push(v_y);
          }
        }
        const v_Q = _g931;
        const _h937 = v_Q.length;
        facts.length = 0;
        changed = false;
        let _c943: boolean = (_h937 === 1);
        if (_c943) {
          let _q938 = true;
          Q939: {
            const _a940 = v_Q;
            for (let _i941 = 0; _i941 < _a940.length; _i941++) {
              const v_y = _a940[_i941];
              const _t942 = sp.edgeOf(v_p, v_y);
              if (!(b.grid[_t942] !== 0)) { if (fire === null) { b.placeAt(_t942, 1); changed = true; } else facts.push(PLACE, _t942, 1); }
              if (!(true)) {
                _q938 = false;
                break Q939;
              }
            }
          }
          _c943 = _q938;
        }
        if (!(_c943)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, F: v_F.slice(), P: v_P.slice(), p: v_p, Q: v_Q.slice() }, facts)) return 1;
          cands.fill(-1);
          crossableMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface SharedFateBinding {
  L: number;
  p: number;
  q: number;
}

const sharedFateFacts: number[] = [];
let sharedFateCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function sharedFate(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedFateBinding> | null): number {
  const _g1051: number[] = [];
  const _g1088: number[] = [];
  const facts = sharedFateFacts;
  let fired = 0;
  let changed = false;
  if (sharedFateCands.length < sp.edges.length) sharedFateCands = new Int32Array(sp.edges.length);
  const cands = sharedFateCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a1032 = sp.lines;
  for (let _i1033 = 0; _i1033 < _a1032.length; _i1033++) {
    const v_L = _a1032[_i1033];
    const _h1034 = clueAt(cl.count, v_L);
    if (!(((_h1034 - laidMarked(b, sp, cl, cands, v_L)) === 1))) continue;
    _g1051.length = 0;
    G1052: {
      const _a1060 = sp.lineCells[v_L];
      for (let _i1061 = 0; _i1061 < _a1060.length; _i1061++) {
        const v_c = _a1060[_i1061];
        let _c1067: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1067) {
          let _g1062 = 0;
          G1063: {
            const _a1064 = sp.adj4[v_c];
            for (let _i1065 = 0; _i1065 < _a1064.length; _i1065++) {
              const _h1066 = (b.grid[sp.adj4Edges[v_c][_i1065]] || -1);
              if (!((_h1066 === 1))) continue;
              _g1062++;
            }
          }
          _c1067 = ((_g1062 + exits(sp, cl, v_c)) > 0);
        }
        if (!((!(_c1067) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1051.push(v_c);
      }
    }
    const _a1068 = _g1051;
    for (let _i1069 = 0; _i1069 < _a1068.length; _i1069++) {
      const v_p = _a1068[_i1069];
      const _a1070 = sp.adj4[v_p];
      for (let _i1071 = 0; _i1071 < _a1070.length; _i1071++) {
        const v_q = _a1070[_i1071];
        _g1088.length = 0;
        G1089: {
          const _a1097 = sp.lineCells[v_L];
          for (let _i1098 = 0; _i1098 < _a1097.length; _i1098++) {
            const v_c = _a1097[_i1098];
            let _c1104: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1104) {
              let _g1099 = 0;
              G1100: {
                const _a1101 = sp.adj4[v_c];
                for (let _i1102 = 0; _i1102 < _a1101.length; _i1102++) {
                  const _h1103 = (b.grid[sp.adj4Edges[v_c][_i1102]] || -1);
                  if (!((_h1103 === 1))) continue;
                  _g1099++;
                }
              }
              _c1104 = ((_g1099 + exits(sp, cl, v_c)) > 0);
            }
            if (!((!(_c1104) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1088.push(v_c);
          }
        }
        let _c1120: boolean = (_g1088.includes(v_q));
        if (_c1120) {
          let _g1105 = 0;
          G1106: {
            const _a1107 = sp.adj4[v_p];
            for (let _i1108 = 0; _i1108 < _a1107.length; _i1108++) {
              const v_y = _a1107[_i1108];
              const _h1109 = (b.grid[sp.adj4Edges[v_p][_i1108]] || -1);
              let _c1119: boolean = (v_y !== v_q);
              if (_c1119) {
                let _c1118: boolean = (((_h1109 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1118) {
                  let _c1117: boolean = (_h1109 !== 1);
                  if (_c1117) {
                    let _c1116: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1116) {
                      let _g1110 = 0;
                      G1111: {
                        const _a1113 = sp.adj4[v_y];
                        for (let _i1114 = 0; _i1114 < _a1113.length; _i1114++) {
                          const _h1115 = (b.grid[sp.adj4Edges[v_y][_i1114]] || -1);
                          if (!((_h1115 === 1))) continue;
                          _g1110++;
                        }
                      }
                      _c1116 = ((_g1110 + exits(sp, cl, v_y)) === 2);
                    }
                    _c1117 = _c1116;
                  }
                  _c1118 = _c1117;
                }
                _c1119 = !(_c1118);
              }
              if (!(_c1119)) continue;
              _g1105++;
            }
          }
          _c1120 = (_g1105 < 2);
        }
        if (!(_c1120)) continue;
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_p) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_p, 1); changed = true; } else facts.push(STRIKE_EDGE, v_p, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, p: v_p, q: v_q }, facts)) return 1;
          cands.fill(-1);
          laidMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface SharedFateEmptiesBinding {
  L: number;
  p: number;
  q: number;
}

const sharedFateEmptiesFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function sharedFateEmpties(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedFateEmptiesBinding> | null): number {
  const _g1236: number[] = [];
  const _g1273: number[] = [];
  const facts = sharedFateEmptiesFacts;
  let fired = 0;
  let changed = false;
  const _a1213 = sp.lines;
  for (let _i1214 = 0; _i1214 < _a1213.length; _i1214++) {
    const v_L = _a1213[_i1214];
    const _h1215 = clueAt(cl.count, v_L);
    let _g1216 = 0;
    G1217: {
      const _a1218 = sp.lineCells[v_L];
      for (let _i1219 = 0; _i1219 < _a1218.length; _i1219++) {
        const v_c = _a1218[_i1219];
        if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
        _g1216++;
      }
    }
    if (!((((sp.lineCells[v_L].length - _h1215) - _g1216) === 1))) continue;
    _g1236.length = 0;
    G1237: {
      const _a1245 = sp.lineCells[v_L];
      for (let _i1246 = 0; _i1246 < _a1245.length; _i1246++) {
        const v_c = _a1245[_i1246];
        let _c1252: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1252) {
          let _g1247 = 0;
          G1248: {
            const _a1249 = sp.adj4[v_c];
            for (let _i1250 = 0; _i1250 < _a1249.length; _i1250++) {
              const _h1251 = (b.grid[sp.adj4Edges[v_c][_i1250]] || -1);
              if (!((_h1251 === 1))) continue;
              _g1247++;
            }
          }
          _c1252 = ((_g1247 + exits(sp, cl, v_c)) > 0);
        }
        if (!((!(_c1252) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1236.push(v_c);
      }
    }
    const _a1253 = _g1236;
    for (let _i1254 = 0; _i1254 < _a1253.length; _i1254++) {
      const v_p = _a1253[_i1254];
      const _a1255 = sp.adj4[v_p];
      for (let _i1256 = 0; _i1256 < _a1255.length; _i1256++) {
        const v_q = _a1255[_i1256];
        _g1273.length = 0;
        G1274: {
          const _a1282 = sp.lineCells[v_L];
          for (let _i1283 = 0; _i1283 < _a1282.length; _i1283++) {
            const v_c = _a1282[_i1283];
            let _c1289: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1289) {
              let _g1284 = 0;
              G1285: {
                const _a1286 = sp.adj4[v_c];
                for (let _i1287 = 0; _i1287 < _a1286.length; _i1287++) {
                  const _h1288 = (b.grid[sp.adj4Edges[v_c][_i1287]] || -1);
                  if (!((_h1288 === 1))) continue;
                  _g1284++;
                }
              }
              _c1289 = ((_g1284 + exits(sp, cl, v_c)) > 0);
            }
            if (!((!(_c1289) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1273.push(v_c);
          }
        }
        let _c1305: boolean = (_g1273.includes(v_q));
        if (_c1305) {
          let _g1290 = 0;
          G1291: {
            const _a1292 = sp.adj4[v_p];
            for (let _i1293 = 0; _i1293 < _a1292.length; _i1293++) {
              const v_y = _a1292[_i1293];
              const _h1294 = (b.grid[sp.adj4Edges[v_p][_i1293]] || -1);
              let _c1304: boolean = (v_y !== v_q);
              if (_c1304) {
                let _c1303: boolean = (((_h1294 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1303) {
                  let _c1302: boolean = (_h1294 !== 1);
                  if (_c1302) {
                    let _c1301: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1301) {
                      let _g1295 = 0;
                      G1296: {
                        const _a1298 = sp.adj4[v_y];
                        for (let _i1299 = 0; _i1299 < _a1298.length; _i1299++) {
                          const _h1300 = (b.grid[sp.adj4Edges[v_y][_i1299]] || -1);
                          if (!((_h1300 === 1))) continue;
                          _g1295++;
                        }
                      }
                      _c1301 = ((_g1295 + exits(sp, cl, v_y)) === 2);
                    }
                    _c1302 = _c1301;
                  }
                  _c1303 = _c1302;
                }
                _c1304 = !(_c1303);
              }
              if (!(_c1304)) continue;
              _g1290++;
            }
          }
          _c1305 = (_g1290 < 2);
        }
        if (!(_c1305)) continue;
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_q) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_q, 2); changed = true; } else facts.push(STRIKE_EDGE, v_q, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, p: v_p, q: v_q }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ParityBinding {
  O: readonly number[];
  e: number;
  G: readonly number[];
  k: number;
}

const parityFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function parity(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ParityBinding> | null): number {
  const _g1350: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  _g1350.length = 0;
  G1351: {
    const _a1368 = sp.edges;
    for (let _i1369 = 0; _i1369 < _a1368.length; _i1369++) {
      const v_x = _a1368[_i1369];
      let _c1383: boolean = !((b.grid[v_x] !== 0));
      if (_c1383) {
        const _t1370 = sp.edgeEnds[2 * v_x];
        const _t1371 = sp.edgeEnds[2 * v_x + 1];
        let _c1382: boolean = ((((b.grid[sp.edgeOf(_t1370, _t1371)] || -1) === 2) || !(((b.edgeCand(_t1370) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1371) >> 1) & 1) !== 0));
        if (!_c1382) {
          let _c1381: boolean = ((b.grid[sp.edgeOf(_t1370, _t1371)] || -1) !== 1);
          if (_c1381) {
            let _g1372 = 0;
            G1373: {
              const _a1374 = sp.adj4[_t1370];
              for (let _i1375 = 0; _i1375 < _a1374.length; _i1375++) {
                if (!(((b.grid[sp.adj4Edges[_t1370][_i1375]] || -1) === 1))) continue;
                _g1372++;
              }
            }
            let _c1380: boolean = ((_g1372 + exits(sp, cl, _t1370)) === 2);
            if (!_c1380) {
              let _g1376 = 0;
              G1377: {
                const _a1378 = sp.adj4[_t1371];
                for (let _i1379 = 0; _i1379 < _a1378.length; _i1379++) {
                  if (!(((b.grid[sp.adj4Edges[_t1371][_i1379]] || -1) === 1))) continue;
                  _g1376++;
                }
              }
              _c1380 = ((_g1376 + exits(sp, cl, _t1371)) === 2);
            }
            _c1381 = _c1380;
          }
          _c1382 = _c1381;
        }
        _c1383 = !(_c1382);
      }
      if (!(_c1383)) continue;
      _g1350.push(v_x);
    }
  }
  const v_O = _g1350;
  const _a1384 = cutEdges(sp, v_O);
  for (let _i1385 = 0; _i1385 < _a1384.length; _i1385++) {
    const v_e = _a1384[_i1385];
    const v_G = through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)));
    let _g1386 = 0;
    G1387: {
      const _a1388 = v_G;
      for (let _i1389 = 0; _i1389 < _a1388.length; _i1389++) {
        const v_c = _a1388[_i1389];
        let _g1390 = 0;
        G1391: {
          const _a1392 = sp.adj4[v_c];
          for (let _i1393 = 0; _i1393 < _a1392.length; _i1393++) {
            const v_y = _a1392[_i1393];
            if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i1393]] || -1) === 1)))) continue;
            _g1390++;
          }
        }
        _g1386 += (_g1390 + exits(sp, cl, v_c));
      }
    }
    const v_k = _g1386;
    facts.length = 0;
    changed = false;
    let _c1394: boolean = !(((v_k % 2) === 1));
    if (!_c1394) {
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      _c1394 = true;
    }
    let _c1396: boolean = _c1394;
    if (_c1396) {
      let _c1395: boolean = !(((v_k % 2) === 0));
      if (!_c1395) {
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        _c1395 = true;
      }
      _c1396 = _c1395;
    }
    if (!(_c1396)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ O: v_O.slice(), e: v_e, G: v_G.slice(), k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

const exitsKept = keptStore<number>();

/** `exits(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function exits(_sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = exitsKept.board(cl);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g11 = 0;
  G12: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      if (!((cl.end.at[v_q] === v_c))) continue;
      _g11++;
    }
  }
  const _made = _g11;
  _kept[v_c] = _made;
  return _made;
}

const drawnKept = keptStore<number>();

/** `drawn(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function drawn(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = drawnKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g128 = 0;
  G129: {
    const _a130 = sp.adj4[v_c];
    for (let _i131 = 0; _i131 < _a130.length; _i131++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i131]] || -1) === 1))) continue;
      _g128++;
    }
  }
  const _made = (_g128 + exits(sp, cl, v_c));
  _kept[v_c] = _made;
  return _made;
}

const laidMarkedKept = new Map<number, number>();

/** `laid(L)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function laidMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_L: number): number {
  const _was = laidMarkedKept.get(v_L);
  if (_was !== undefined) return _was;
  let _g361 = 0;
  G362: {
    const _a363 = sp.lineCells[v_L];
    for (let _i364 = 0; _i364 < _a363.length; _i364++) {
      const v_c = _a363[_i364];
      let _c369: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
      if (!_c369) {
        let _g365 = 0;
        G366: {
          const _a367 = sp.adj4[v_c];
          for (let _i368 = 0; _i368 < _a367.length; _i368++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i368]] || -1) === 1))) continue;
            _g365++;
          }
        }
        _c369 = ((_g365 + exits(sp, cl, v_c)) > 0);
      }
      if (!(_c369)) continue;
      _g361++;
    }
  }
  const _made = _g361;
  laidMarkedKept.set(v_L, _made);
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}

const crossableMarkedKept = new Map<number, boolean>();

/** `crossable(c, L)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function crossableMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_c: number, v_L: number): boolean {
  const _was = crossableMarkedKept.get((v_c + 1) * 1048577 + (v_L + 1));
  if (_was !== undefined) return _was;
  let _q818 = true;
  Q819: {
    const _a820 = sp.adj4[v_c];
    for (let _i821 = 0; _i821 < _a820.length; _i821++) {
      const v_y = _a820[_i821];
      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
      let _c833: boolean = ((((b.grid[sp.adj4Edges[v_c][_i821]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
      if (!_c833) {
        let _c832: boolean = ((b.grid[sp.adj4Edges[v_c][_i821]] || -1) !== 1);
        if (_c832) {
          let _g822 = 0;
          G823: {
            const _a824 = sp.adj4[v_c];
            for (let _i825 = 0; _i825 < _a824.length; _i825++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i825]] || -1) === 1))) continue;
              _g822++;
            }
          }
          let _c831: boolean = ((_g822 + exits(sp, cl, v_c)) === 2);
          if (!_c831) {
            let _g826 = 0;
            G827: {
              const _a829 = sp.adj4[v_y];
              for (let _i830 = 0; _i830 < _a829.length; _i830++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i830]] || -1) === 1))) continue;
                _g826++;
              }
            }
            _c831 = ((_g826 + exits(sp, cl, v_y)) === 2);
          }
          _c832 = _c831;
        }
        _c833 = _c832;
      }
      if (!(!(_c833))) {
        _q818 = false;
        break Q819;
      }
    }
  }
  let _c838: boolean = _q818;
  if (_c838) {
    let _g834 = 0;
    G835: {
      const _a836 = sp.adj4[v_c];
      for (let _i837 = 0; _i837 < _a836.length; _i837++) {
        const v_y = _a836[_i837];
        if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
        _g834++;
      }
    }
    _c838 = ((_g834 === 2) || ((clueAt(cl.end, v_c) >= 1) && !(((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L)))))));
  }
  const _made = _c838;
  crossableMarkedKept.set((v_c + 1) * 1048577 + (v_L + 1), _made);
  return _made;
}
