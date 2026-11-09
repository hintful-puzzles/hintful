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
  const _g1428: number[] = [];
  const _domain = rangeMask(1, 2);
  const _k1417 = exitsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1408 = true;
  Q1409: {
    const _a1410 = sp.cells;
    for (let _i1411 = 0; _i1411 < _a1410.length; _i1411++) {
      const v_c = _a1410[_i1411];
      let _g1412 = 0;
      G1413: {
        const _a1414 = sp.adj4[v_c];
        for (let _i1415 = 0; _i1415 < _a1414.length; _i1415++) {
          const _h1416 = (g[sp.adj4Edges[v_c][_i1415]] || -1);
          if (!((_h1416 === 1))) continue;
          _g1412++;
        }
      }
      let _c1423: boolean = ((_g1412 + (_k1417[v_c] ?? exits(sp, cl, v_c))) === 0);
      if (!_c1423) {
        let _g1418 = 0;
        G1419: {
          const _a1420 = sp.adj4[v_c];
          for (let _i1421 = 0; _i1421 < _a1420.length; _i1421++) {
            const _h1422 = (g[sp.adj4Edges[v_c][_i1421]] || -1);
            if (!((_h1422 === 1))) continue;
            _g1418++;
          }
        }
        _c1423 = ((_g1418 + (_k1417[v_c] ?? exits(sp, cl, v_c))) === 2);
      }
      if (!(_c1423)) {
        _q1408 = false;
        break Q1409;
      }
    }
  }
  if (!(_q1408)) return false;
  let _g1424 = 0;
  G1425: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      _g1424++;
    }
  }
  if (!((_g1424 === 2))) return false;
  let _q1426 = true;
  Q1427: {
    _g1428.length = 0;
    G1429: {
      const _a1432 = sp.edges;
      for (let _i1433 = 0; _i1433 < _a1432.length; _i1433++) {
        const v_e = _a1432[_i1433];
        const _h1434 = (g[v_e] || -1);
        if (!((_h1434 === 1))) continue;
        _g1428.push(v_e);
      }
    }
    const v_R = _g1428;
    const _eg1449 = edgeGroups(sp, v_R);
    const _a1435 = sp.cells;
    for (let _i1436 = 0; _i1436 < _a1435.length; _i1436++) {
      const v_a = _a1435[_i1436];
      let _g1437 = 0;
      G1438: {
        const _a1439 = sp.adj4[v_a];
        for (let _i1440 = 0; _i1440 < _a1439.length; _i1440++) {
          const _h1441 = (g[sp.adj4Edges[v_a][_i1440]] || -1);
          if (!((_h1441 === 1))) continue;
          _g1437++;
        }
      }
      if (!(((_g1437 + (_k1417[v_a] ?? exits(sp, cl, v_a))) > 0))) continue;
      const _a1442 = sp.cells;
      for (let _i1443 = 0; _i1443 < _a1442.length; _i1443++) {
        const v_b = _a1442[_i1443];
        let _g1444 = 0;
        G1445: {
          const _a1446 = sp.adj4[v_b];
          for (let _i1447 = 0; _i1447 < _a1446.length; _i1447++) {
            const _h1448 = (g[sp.adj4Edges[v_b][_i1447]] || -1);
            if (!((_h1448 === 1))) continue;
            _g1444++;
          }
        }
        if (!(((_g1444 + (_k1417[v_b] ?? exits(sp, cl, v_b))) > 0))) continue;
        if (!((_eg1449.of(v_b) === _eg1449.of(v_a)))) {
          _q1426 = false;
          break Q1427;
        }
      }
    }
  }
  if (!(_q1426)) return false;
  for (let _k1450 = 0; _k1450 < cl.count.at.length; _k1450++) {
    const _at1451 = cl.count.at[_k1450];
    const _v1452 = cl.count.v[_k1450];
    let _g1453 = 0;
    G1454: {
      const _a1455 = sp.lineCells[_at1451];
      for (let _i1456 = 0; _i1456 < _a1455.length; _i1456++) {
        const v_c = _a1455[_i1456];
        let _g1457 = 0;
        G1458: {
          const _a1459 = sp.adj4[v_c];
          for (let _i1460 = 0; _i1460 < _a1459.length; _i1460++) {
            const _h1461 = (g[sp.adj4Edges[v_c][_i1460]] || -1);
            if (!((_h1461 === 1))) continue;
            _g1457++;
          }
        }
        if (!(((_g1457 + (_k1417[v_c] ?? exits(sp, cl, v_c))) > 0))) continue;
        _g1453++;
      }
    }
    if (!((_g1453 === _v1452))) return false;
  }
  for (let _k1462 = 0; _k1462 < cl.end.at.length; _k1462++) {
    const _at1463 = cl.end.at[_k1462];
    const _v1464 = cl.end.v[_k1462];
    let _g1465 = 0;
    G1466: {
      const _a1467 = sp.adj4[_at1463];
      for (let _i1468 = 0; _i1468 < _a1467.length; _i1468++) {
        const _h1469 = (g[sp.adj4Edges[_at1463][_i1468]] || -1);
        if (!((_h1469 === 1))) continue;
        _g1465++;
      }
    }
    if (!((((_g1465 + (_k1417[_at1463] ?? exits(sp, cl, _at1463))) === 2) && (step(sp, _at1463, _v1464) === -1)))) return false;
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
  const _k138 = exitsKept.board(cl);
  const _a74 = sp.cells;
  for (let _i75 = 0; _i75 < _a74.length; _i75++) {
    const v_c = _a74[_i75];
    let _c148: boolean = !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0));
    if (_c148) {
      _g108.length = 0;
      G109: {
        const _a125 = sp.adj4[v_c];
        for (let _i126 = 0; _i126 < _a125.length; _i126++) {
          const v_y = _a125[_i126];
          const _h127 = (b.grid[sp.adj4Edges[v_c][_i126]] || -1);
          let _c142: boolean = (_h127 !== 1);
          if (_c142) {
            let _c141: boolean = (((_h127 === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
            if (!_c141) {
              let _c140: boolean = (_h127 !== 1);
              if (_c140) {
                let _c139: boolean = (drawn(b, sp, cl, v_c) === 2);
                if (!_c139) {
                  let _g132 = 0;
                  G133: {
                    const _a135 = sp.adj4[v_y];
                    for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                      const _h137 = (b.grid[sp.adj4Edges[v_y][_i136]] || -1);
                      if (!((_h137 === 1))) continue;
                      _g132++;
                    }
                  }
                  _c139 = ((_g132 + (_k138[v_y] ?? exits(sp, cl, v_y))) === 2);
                }
                _c140 = _c139;
              }
              _c141 = _c140;
            }
            _c142 = !(_c141);
          }
          if (!(_c142)) continue;
          _g108.push(v_y);
        }
      }
      let _g143 = 0;
      G144: {
        const _a145 = sp.adj4[v_c];
        for (let _i146 = 0; _i146 < _a145.length; _i146++) {
          const _h147 = (b.grid[sp.adj4Edges[v_c][_i146]] || -1);
          if (!((_h147 === 1))) continue;
          _g143++;
        }
      }
      _c148 = ((_g108.length + (_g143 + (_k138[v_c] ?? exits(sp, cl, v_c)))) < 2);
    }
    if (!(_c148)) continue;
    facts.length = 0;
    changed = false;
    let _c154: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c154) {
      let _g149 = 0;
      G150: {
        const _a151 = sp.adj4[v_c];
        for (let _i152 = 0; _i152 < _a151.length; _i152++) {
          const _h153 = (b.grid[sp.adj4Edges[v_c][_i152]] || -1);
          if (!((_h153 === 1))) continue;
          _g149++;
        }
      }
      _c154 = ((_g149 + (_k138[v_c] ?? exits(sp, cl, v_c))) > 0);
    }
    let _c155: boolean = !(_c154);
    if (_c155) {
      if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
      _c155 = true;
    }
    if (!(_c155)) return -1;
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
  const _g283: number[] = [];
  const facts = bothSidesLeftFacts;
  let fired = 0;
  let changed = false;
  const _k244 = exitsKept.board(cl);
  const _a238 = sp.cells;
  for (let _i239 = 0; _i239 < _a238.length; _i239++) {
    const v_c = _a238[_i239];
    let _c245: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c245) {
      let _g240 = 0;
      G241: {
        const _a242 = sp.adj4[v_c];
        for (let _i243 = 0; _i243 < _a242.length; _i243++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i243]] || -1) === 1))) continue;
          _g240++;
        }
      }
      _c245 = ((_g240 + (_k244[v_c] ?? exits(sp, cl, v_c))) > 0);
    }
    let _c250: boolean = _c245;
    if (_c250) {
      let _g246 = 0;
      G247: {
        const _a248 = sp.adj4[v_c];
        for (let _i249 = 0; _i249 < _a248.length; _i249++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i249]] || -1) === 1))) continue;
          _g246++;
        }
      }
      _c250 = ((_g246 + (_k244[v_c] ?? exits(sp, cl, v_c))) < 2);
    }
    if (!(_c250)) continue;
    _g283.length = 0;
    G284: {
      const _a300 = sp.adj4[v_c];
      for (let _i301 = 0; _i301 < _a300.length; _i301++) {
        const v_y = _a300[_i301];
        let _c310: boolean = ((b.grid[sp.adj4Edges[v_c][_i301]] || -1) !== 1);
        if (_c310) {
          let _c309: boolean = ((((b.grid[sp.adj4Edges[v_c][_i301]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
          if (!_c309) {
            let _c308: boolean = ((b.grid[sp.adj4Edges[v_c][_i301]] || -1) !== 1);
            if (_c308) {
              let _c307: boolean = (drawn(b, sp, cl, v_c) === 2);
              if (!_c307) {
                let _g302 = 0;
                G303: {
                  const _a305 = sp.adj4[v_y];
                  for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                    if (!(((b.grid[sp.adj4Edges[v_y][_i306]] || -1) === 1))) continue;
                    _g302++;
                  }
                }
                _c307 = ((_g302 + (_k244[v_y] ?? exits(sp, cl, v_y))) === 2);
              }
              _c308 = _c307;
            }
            _c309 = _c308;
          }
          _c310 = !(_c309);
        }
        if (!(_c310)) continue;
        _g283.push(v_y);
      }
    }
    L311: {
      const v_F = _g283;
      const _h312 = v_F.length;
      let _c317: boolean = (_h312 > 0);
      if (_c317) {
        let _g313 = 0;
        G314: {
          const _a315 = sp.adj4[v_c];
          for (let _i316 = 0; _i316 < _a315.length; _i316++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i316]] || -1) === 1))) continue;
            _g313++;
          }
        }
        _c317 = ((_h312 + (_g313 + (_k244[v_c] ?? exits(sp, cl, v_c)))) <= 2);
      }
      if (!(_c317)) break L311;
      facts.length = 0;
      changed = false;
      let _g318 = 0;
      G319: {
        const _a320 = sp.adj4[v_c];
        for (let _i321 = 0; _i321 < _a320.length; _i321++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i321]] || -1) === 1))) continue;
          _g318++;
        }
      }
      let _c327: boolean = ((_h312 + (_g318 + (_k244[v_c] ?? exits(sp, cl, v_c)))) === 2);
      if (_c327) {
        let _q322 = true;
        Q323: {
          const _a324 = v_F;
          for (let _i325 = 0; _i325 < _a324.length; _i325++) {
            const v_y = _a324[_i325];
            const _t326 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t326] !== 0)) { if (fire === null) { b.placeAt(_t326, 1); changed = true; } else facts.push(PLACE, _t326, 1); }
            if (!(true)) {
              _q322 = false;
              break Q323;
            }
          }
        }
        _c327 = _q322;
      }
      if (!(_c327)) return -1;
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
  const _g390: number[] = [];
  const facts = clueFullFacts;
  let fired = 0;
  let changed = false;
  const _k406 = exitsKept.board(cl);
  if (clueFullCands.length < sp.edges.length) clueFullCands = new Int32Array(sp.edges.length);
  const cands = clueFullCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a372 = sp.lines;
  for (let _i373 = 0; _i373 < _a372.length; _i373++) {
    const v_L = _a372[_i373];
    const _h410 = clueAt(cl.count, v_L);
    _g390.length = 0;
    G391: {
      const _a399 = sp.lineCells[v_L];
      for (let _i400 = 0; _i400 < _a399.length; _i400++) {
        const v_c = _a399[_i400];
        let _c407: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c407) {
          let _g401 = 0;
          G402: {
            const _a403 = sp.adj4[v_c];
            for (let _i404 = 0; _i404 < _a403.length; _i404++) {
              const _h405 = (b.grid[sp.adj4Edges[v_c][_i404]] || -1);
              if (!((_h405 === 1))) continue;
              _g401++;
            }
          }
          _c407 = ((_g401 + (_k406[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c407) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g390.push(v_c);
      }
    }
    L408: {
      const v_O = _g390;
      const _h409 = v_O.length;
      if (!(((_h409 > 0) && (laidMarked(b, sp, cl, cands, v_L) >= _h410)))) break L408;
      facts.length = 0;
      changed = false;
      let _c415: boolean = (laidMarked(b, sp, cl, cands, v_L) === _h410);
      if (_c415) {
        let _q411 = true;
        Q412: {
          const _a413 = v_O;
          for (let _i414 = 0; _i414 < _a413.length; _i414++) {
            const v_c = _a413[_i414];
            if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
            if (!(true)) {
              _q411 = false;
              break Q412;
            }
          }
        }
        _c415 = _q411;
      }
      if (!(_c415)) return -1;
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
  const _g474: number[] = [];
  const facts = clueExactFacts;
  let fired = 0;
  let changed = false;
  const _k490 = exitsKept.board(cl);
  const _a456 = sp.lines;
  for (let _i457 = 0; _i457 < _a456.length; _i457++) {
    const v_L = _a456[_i457];
    const _h498 = clueAt(cl.count, v_L);
    _g474.length = 0;
    G475: {
      const _a483 = sp.lineCells[v_L];
      for (let _i484 = 0; _i484 < _a483.length; _i484++) {
        const v_c = _a483[_i484];
        let _c491: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c491) {
          let _g485 = 0;
          G486: {
            const _a487 = sp.adj4[v_c];
            for (let _i488 = 0; _i488 < _a487.length; _i488++) {
              const _h489 = (b.grid[sp.adj4Edges[v_c][_i488]] || -1);
              if (!((_h489 === 1))) continue;
              _g485++;
            }
          }
          _c491 = ((_g485 + (_k490[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c491) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g474.push(v_c);
      }
    }
    L492: {
      const v_O = _g474;
      const _h493 = v_O.length;
      let _c499: boolean = (_h493 > 0);
      if (_c499) {
        let _g494 = 0;
        G495: {
          const _a496 = sp.lineCells[v_L];
          for (let _i497 = 0; _i497 < _a496.length; _i497++) {
            const v_c = _a496[_i497];
            if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
            _g494++;
          }
        }
        _c499 = ((sp.lineCells[v_L].length - _g494) <= _h498);
      }
      if (!(_c499)) break L492;
      facts.length = 0;
      changed = false;
      let _g500 = 0;
      G501: {
        const _a502 = sp.lineCells[v_L];
        for (let _i503 = 0; _i503 < _a502.length; _i503++) {
          const v_c = _a502[_i503];
          if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
          _g500++;
        }
      }
      let _c508: boolean = ((sp.lineCells[v_L].length - _g500) === _h498);
      if (_c508) {
        let _q504 = true;
        Q505: {
          const _a506 = v_O;
          for (let _i507 = 0; _i507 < _a506.length; _i507++) {
            const v_c = _a506[_i507];
            if ((b.edgeCand(v_c) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 2); changed = true; } else facts.push(STRIKE_EDGE, v_c, 2); }
            if (!(true)) {
              _q504 = false;
              break Q505;
            }
          }
        }
        _c508 = _q504;
      }
      if (!(_c508)) return -1;
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
  const _g546: number[] = [];
  const facts = closeLoopFacts;
  let fired = 0;
  let changed = false;
  const _k559 = exitsKept.board(cl);
  _g546.length = 0;
  G547: {
    const _a550 = sp.edges;
    for (let _i551 = 0; _i551 < _a550.length; _i551++) {
      const v_e = _a550[_i551];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g546.push(v_e);
    }
  }
  const v_R = _g546;
  const _eg583 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a552 = sp.edges;
  for (let _i553 = 0; _i553 < _a552.length; _i553++) {
    const v_e = _a552[_i553];
    let _c561: boolean = !((b.grid[v_e] !== 0));
    if (_c561) {
      const _t554 = sp.edgeEnds[2 * v_e];
      let _c560: boolean = !(((b.edgeCand(_t554) >> 2) & 1) !== 0);
      if (!_c560) {
        let _g555 = 0;
        G556: {
          const _a557 = sp.adj4[_t554];
          for (let _i558 = 0; _i558 < _a557.length; _i558++) {
            if (!(((b.grid[sp.adj4Edges[_t554][_i558]] || -1) === 1))) continue;
            _g555++;
          }
        }
        _c560 = ((_g555 + (_k559[_t554] ?? exits(sp, cl, _t554))) > 0);
      }
      _c561 = _c560;
    }
    let _c568: boolean = _c561;
    if (_c568) {
      const _t562 = sp.edgeEnds[2 * v_e + 1];
      let _c567: boolean = !(((b.edgeCand(_t562) >> 2) & 1) !== 0);
      if (!_c567) {
        let _g563 = 0;
        G564: {
          const _a565 = sp.adj4[_t562];
          for (let _i566 = 0; _i566 < _a565.length; _i566++) {
            if (!(((b.grid[sp.adj4Edges[_t562][_i566]] || -1) === 1))) continue;
            _g563++;
          }
        }
        _c567 = ((_g563 + (_k559[_t562] ?? exits(sp, cl, _t562))) > 0);
      }
      _c568 = _c567;
    }
    let _c582: boolean = _c568;
    if (_c582) {
      const _t569 = sp.edgeEnds[2 * v_e];
      const _t570 = sp.edgeEnds[2 * v_e + 1];
      let _c581: boolean = ((((b.grid[sp.edgeOf(_t569, _t570)] || -1) === 2) || !(((b.edgeCand(_t569) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t570) >> 1) & 1) !== 0));
      if (!_c581) {
        let _c580: boolean = ((b.grid[sp.edgeOf(_t569, _t570)] || -1) !== 1);
        if (_c580) {
          let _g571 = 0;
          G572: {
            const _a573 = sp.adj4[_t569];
            for (let _i574 = 0; _i574 < _a573.length; _i574++) {
              if (!(((b.grid[sp.adj4Edges[_t569][_i574]] || -1) === 1))) continue;
              _g571++;
            }
          }
          let _c579: boolean = ((_g571 + (_k559[_t569] ?? exits(sp, cl, _t569))) === 2);
          if (!_c579) {
            let _g575 = 0;
            G576: {
              const _a577 = sp.adj4[_t570];
              for (let _i578 = 0; _i578 < _a577.length; _i578++) {
                if (!(((b.grid[sp.adj4Edges[_t570][_i578]] || -1) === 1))) continue;
                _g575++;
              }
            }
            _c579 = ((_g575 + (_k559[_t570] ?? exits(sp, cl, _t570))) === 2);
          }
          _c580 = _c579;
        }
        _c581 = _c580;
      }
      _c582 = !(_c581);
    }
    if (!(_c582)) continue;
    L584: {
      const v_G = _eg583.of(sp.edgeEnds[2 * v_e]);
      if (!((_eg583.of(sp.edgeEnds[2 * v_e + 1]) === v_G))) break L584;
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
  const _g638: number[] = [];
  const facts = strandFacts;
  let fired = 0;
  let changed = false;
  const _k651 = exitsKept.board(cl);
  _g638.length = 0;
  G639: {
    const _a642 = sp.edges;
    for (let _i643 = 0; _i643 < _a642.length; _i643++) {
      const v_e = _a642[_i643];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g638.push(v_e);
    }
  }
  const v_R = _g638;
  const _eg675 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a644 = sp.edges;
  for (let _i645 = 0; _i645 < _a644.length; _i645++) {
    const v_e = _a644[_i645];
    let _c653: boolean = !((b.grid[v_e] !== 0));
    if (_c653) {
      const _t646 = sp.edgeEnds[2 * v_e];
      let _c652: boolean = !(((b.edgeCand(_t646) >> 2) & 1) !== 0);
      if (!_c652) {
        let _g647 = 0;
        G648: {
          const _a649 = sp.adj4[_t646];
          for (let _i650 = 0; _i650 < _a649.length; _i650++) {
            if (!(((b.grid[sp.adj4Edges[_t646][_i650]] || -1) === 1))) continue;
            _g647++;
          }
        }
        _c652 = ((_g647 + (_k651[_t646] ?? exits(sp, cl, _t646))) > 0);
      }
      _c653 = _c652;
    }
    let _c660: boolean = _c653;
    if (_c660) {
      const _t654 = sp.edgeEnds[2 * v_e + 1];
      let _c659: boolean = !(((b.edgeCand(_t654) >> 2) & 1) !== 0);
      if (!_c659) {
        let _g655 = 0;
        G656: {
          const _a657 = sp.adj4[_t654];
          for (let _i658 = 0; _i658 < _a657.length; _i658++) {
            if (!(((b.grid[sp.adj4Edges[_t654][_i658]] || -1) === 1))) continue;
            _g655++;
          }
        }
        _c659 = ((_g655 + (_k651[_t654] ?? exits(sp, cl, _t654))) > 0);
      }
      _c660 = _c659;
    }
    let _c674: boolean = _c660;
    if (_c674) {
      const _t661 = sp.edgeEnds[2 * v_e];
      const _t662 = sp.edgeEnds[2 * v_e + 1];
      let _c673: boolean = ((((b.grid[sp.edgeOf(_t661, _t662)] || -1) === 2) || !(((b.edgeCand(_t661) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t662) >> 1) & 1) !== 0));
      if (!_c673) {
        let _c672: boolean = ((b.grid[sp.edgeOf(_t661, _t662)] || -1) !== 1);
        if (_c672) {
          let _g663 = 0;
          G664: {
            const _a665 = sp.adj4[_t661];
            for (let _i666 = 0; _i666 < _a665.length; _i666++) {
              if (!(((b.grid[sp.adj4Edges[_t661][_i666]] || -1) === 1))) continue;
              _g663++;
            }
          }
          let _c671: boolean = ((_g663 + (_k651[_t661] ?? exits(sp, cl, _t661))) === 2);
          if (!_c671) {
            let _g667 = 0;
            G668: {
              const _a669 = sp.adj4[_t662];
              for (let _i670 = 0; _i670 < _a669.length; _i670++) {
                if (!(((b.grid[sp.adj4Edges[_t662][_i670]] || -1) === 1))) continue;
                _g667++;
              }
            }
            _c671 = ((_g667 + (_k651[_t662] ?? exits(sp, cl, _t662))) === 2);
          }
          _c672 = _c671;
        }
        _c673 = _c672;
      }
      _c674 = !(_c673);
    }
    if (!(_c674)) continue;
    const v_G = _eg675.of(sp.edgeEnds[2 * v_e]);
    L676: {
      const v_H = _eg675.of(sp.edgeEnds[2 * v_e + 1]);
      let _c679: boolean = !(_eg675.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c679) {
        let _q677 = false;
        Q678: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg675.of(cl.end.at[v_q]) === v_G)) {
              _q677 = true;
              break Q678;
            }
          }
        }
        _c679 = _q677;
      }
      let _c682: boolean = _c679;
      if (_c682) {
        let _q680 = false;
        Q681: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg675.of(cl.end.at[v_q]) === v_H)) {
              _q680 = true;
              break Q681;
            }
          }
        }
        _c682 = _q680;
      }
      let _c692: boolean = _c682;
      if (_c692) {
        let _q683 = false;
        Q684: {
          const _a685 = sp.cells;
          for (let _i686 = 0; _i686 < _a685.length; _i686++) {
            const v_c = _a685[_i686];
            let _c691: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c691) {
              let _g687 = 0;
              G688: {
                const _a689 = sp.adj4[v_c];
                for (let _i690 = 0; _i690 < _a689.length; _i690++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i690]] || -1) === 1))) continue;
                  _g687++;
                }
              }
              _c691 = ((_g687 + (_k651[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (((_c691 && !(_eg675.of(v_c) === v_G)) && !(_eg675.of(v_c) === v_H))) {
              _q683 = true;
              break Q684;
            }
          }
        }
        _c692 = _q683;
      }
      if (!(_c692)) break L676;
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
  const _g745: number[] = [];
  const facts = finishEarlyFacts;
  let fired = 0;
  let changed = false;
  const _k758 = exitsKept.board(cl);
  _g745.length = 0;
  G746: {
    const _a749 = sp.edges;
    for (let _i750 = 0; _i750 < _a749.length; _i750++) {
      const v_e = _a749[_i750];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g745.push(v_e);
    }
  }
  const v_R = _g745;
  const _eg782 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a751 = sp.edges;
  for (let _i752 = 0; _i752 < _a751.length; _i752++) {
    const v_e = _a751[_i752];
    let _c760: boolean = !((b.grid[v_e] !== 0));
    if (_c760) {
      const _t753 = sp.edgeEnds[2 * v_e];
      let _c759: boolean = !(((b.edgeCand(_t753) >> 2) & 1) !== 0);
      if (!_c759) {
        let _g754 = 0;
        G755: {
          const _a756 = sp.adj4[_t753];
          for (let _i757 = 0; _i757 < _a756.length; _i757++) {
            if (!(((b.grid[sp.adj4Edges[_t753][_i757]] || -1) === 1))) continue;
            _g754++;
          }
        }
        _c759 = ((_g754 + (_k758[_t753] ?? exits(sp, cl, _t753))) > 0);
      }
      _c760 = _c759;
    }
    let _c767: boolean = _c760;
    if (_c767) {
      const _t761 = sp.edgeEnds[2 * v_e + 1];
      let _c766: boolean = !(((b.edgeCand(_t761) >> 2) & 1) !== 0);
      if (!_c766) {
        let _g762 = 0;
        G763: {
          const _a764 = sp.adj4[_t761];
          for (let _i765 = 0; _i765 < _a764.length; _i765++) {
            if (!(((b.grid[sp.adj4Edges[_t761][_i765]] || -1) === 1))) continue;
            _g762++;
          }
        }
        _c766 = ((_g762 + (_k758[_t761] ?? exits(sp, cl, _t761))) > 0);
      }
      _c767 = _c766;
    }
    let _c781: boolean = _c767;
    if (_c781) {
      const _t768 = sp.edgeEnds[2 * v_e];
      const _t769 = sp.edgeEnds[2 * v_e + 1];
      let _c780: boolean = ((((b.grid[sp.edgeOf(_t768, _t769)] || -1) === 2) || !(((b.edgeCand(_t768) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t769) >> 1) & 1) !== 0));
      if (!_c780) {
        let _c779: boolean = ((b.grid[sp.edgeOf(_t768, _t769)] || -1) !== 1);
        if (_c779) {
          let _g770 = 0;
          G771: {
            const _a772 = sp.adj4[_t768];
            for (let _i773 = 0; _i773 < _a772.length; _i773++) {
              if (!(((b.grid[sp.adj4Edges[_t768][_i773]] || -1) === 1))) continue;
              _g770++;
            }
          }
          let _c778: boolean = ((_g770 + (_k758[_t768] ?? exits(sp, cl, _t768))) === 2);
          if (!_c778) {
            let _g774 = 0;
            G775: {
              const _a776 = sp.adj4[_t769];
              for (let _i777 = 0; _i777 < _a776.length; _i777++) {
                if (!(((b.grid[sp.adj4Edges[_t769][_i777]] || -1) === 1))) continue;
                _g774++;
              }
            }
            _c778 = ((_g774 + (_k758[_t769] ?? exits(sp, cl, _t769))) === 2);
          }
          _c779 = _c778;
        }
        _c780 = _c779;
      }
      _c781 = !(_c780);
    }
    if (!(_c781)) continue;
    const v_G = _eg782.of(sp.edgeEnds[2 * v_e]);
    L783: {
      const v_H = _eg782.of(sp.edgeEnds[2 * v_e + 1]);
      let _c786: boolean = !(_eg782.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c786) {
        let _q784 = false;
        Q785: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg782.of(cl.end.at[v_q]) === v_G)) {
              _q784 = true;
              break Q785;
            }
          }
        }
        _c786 = _q784;
      }
      let _c789: boolean = _c786;
      if (_c789) {
        let _q787 = false;
        Q788: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg782.of(cl.end.at[v_q]) === v_H)) {
              _q787 = true;
              break Q788;
            }
          }
        }
        _c789 = _q787;
      }
      let _c799: boolean = _c789;
      if (_c799) {
        let _q790 = false;
        Q791: {
          const _a792 = sp.lines;
          for (let _i793 = 0; _i793 < _a792.length; _i793++) {
            const v_L = _a792[_i793];
            const _h798 = clueAt(cl.count, v_L);
            let _g794 = 0;
            G795: {
              const _a796 = sp.lineCells[v_L];
              for (let _i797 = 0; _i797 < _a796.length; _i797++) {
                const v_c = _a796[_i797];
                if (!(((_eg782.of(v_c) === v_G) || (_eg782.of(v_c) === v_H)))) continue;
                _g794++;
              }
            }
            if ((_g794 < _h798)) {
              _q790 = true;
              break Q791;
            }
          }
        }
        _c799 = _q790;
      }
      if (!(_c799)) break L783;
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
  const _g882: number[] = [];
  const _g909: number[] = [];
  const _g939: number[] = [];
  const facts = looseEndFacts;
  let fired = 0;
  let changed = false;
  const _k896 = exitsKept.board(cl);
  if (looseEndCands.length < sp.edges.length) looseEndCands = new Int32Array(sp.edges.length);
  const cands = looseEndCands;
  cands.fill(-1);
  crossableMarkedKept.clear();
  const _a880 = sp.lines;
  for (let _i881 = 0; _i881 < _a880.length; _i881++) {
    const v_L = _a880[_i881];
    const _h898 = clueAt(cl.count, v_L);
    const _h930 = (sp.rows.includes(v_L));
    _g882.length = 0;
    G883: {
      const _a890 = sp.lineCells[v_L];
      for (let _i891 = 0; _i891 < _a890.length; _i891++) {
        const v_c = _a890[_i891];
        let _g892 = 0;
        G893: {
          const _a894 = sp.adj4[v_c];
          for (let _i895 = 0; _i895 < _a894.length; _i895++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i895]] || -1) === 1))) continue;
            _g892++;
          }
        }
        if (!(((_g892 + (_k896[v_c] ?? exits(sp, cl, v_c))) === 2))) continue;
        _g882.push(v_c);
      }
    }
    L897: {
      const v_F = _g882;
      const _h899 = v_F.length;
      let _c908: boolean = ((_h898 - _h899) === 2);
      if (_c908) {
        let _q900 = true;
        Q901: {
          const _a902 = sp.lineCells[v_L];
          for (let _i903 = 0; _i903 < _a902.length; _i903++) {
            const v_c = _a902[_i903];
            let _g904 = 0;
            G905: {
              const _a906 = sp.adj4[v_c];
              for (let _i907 = 0; _i907 < _a906.length; _i907++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i907]] || -1) === 1))) continue;
                _g904++;
              }
            }
            if (!(((_g904 + (_k896[v_c] ?? exits(sp, cl, v_c))) !== 2))) continue;
            if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
              _q900 = false;
              break Q901;
            }
          }
        }
        _c908 = _q900;
      }
      if (!(_c908)) break L897;
      _g909.length = 0;
      G910: {
        const _a923 = sp.lineCells[v_L];
        for (let _i924 = 0; _i924 < _a923.length; _i924++) {
          const v_c = _a923[_i924];
          const _h929 = clueAt(cl.end, v_c);
          let _g925 = 0;
          G926: {
            const _a927 = sp.adj4[v_c];
            for (let _i928 = 0; _i928 < _a927.length; _i928++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i928]] || -1) === 1))) continue;
              _g925++;
            }
          }
          let _c936: boolean = ((_g925 + (_k896[v_c] ?? exits(sp, cl, v_c))) === 1);
          if (_c936) {
            let _c935: boolean = ((_h929 >= 1) && ((_h929 >= 3) === _h930));
            if (!_c935) {
              let _q931 = false;
              Q932: {
                const _a933 = sp.adj4[v_c];
                for (let _i934 = 0; _i934 < _a933.length; _i934++) {
                  const v_y = _a933[_i934];
                  if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_c][_i934]] || -1) === 1)) {
                    _q931 = true;
                    break Q932;
                  }
                }
              }
              _c935 = _q931;
            }
            _c936 = _c935;
          }
          if (!(_c936)) continue;
          _g909.push(v_c);
        }
      }
      L937: {
        const v_P = _g909;
        const _h938 = v_P.length;
        if (!((_h938 === 1))) break L937;
        const v_p = (v_P[0] ?? -1);
        _g939.length = 0;
        G940: {
          const _a943 = sp.adj4[v_p];
          for (let _i944 = 0; _i944 < _a943.length; _i944++) {
            const v_y = _a943[_i944];
            if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i944]] || -1) !== 1)))) continue;
            _g939.push(v_y);
          }
        }
        const v_Q = _g939;
        const _h945 = v_Q.length;
        facts.length = 0;
        changed = false;
        let _c951: boolean = (_h945 === 1);
        if (_c951) {
          let _q946 = true;
          Q947: {
            const _a948 = v_Q;
            for (let _i949 = 0; _i949 < _a948.length; _i949++) {
              const v_y = _a948[_i949];
              const _t950 = sp.edgeOf(v_p, v_y);
              if (!(b.grid[_t950] !== 0)) { if (fire === null) { b.placeAt(_t950, 1); changed = true; } else facts.push(PLACE, _t950, 1); }
              if (!(true)) {
                _q946 = false;
                break Q947;
              }
            }
          }
          _c951 = _q946;
        }
        if (!(_c951)) return -1;
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
  const _g1059: number[] = [];
  const _g1097: number[] = [];
  const facts = sharedFateFacts;
  let fired = 0;
  let changed = false;
  const _k1075 = exitsKept.board(cl);
  if (sharedFateCands.length < sp.edges.length) sharedFateCands = new Int32Array(sp.edges.length);
  const cands = sharedFateCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a1040 = sp.lines;
  for (let _i1041 = 0; _i1041 < _a1040.length; _i1041++) {
    const v_L = _a1040[_i1041];
    const _h1042 = clueAt(cl.count, v_L);
    if (!(((_h1042 - laidMarked(b, sp, cl, cands, v_L)) === 1))) continue;
    _g1059.length = 0;
    G1060: {
      const _a1068 = sp.lineCells[v_L];
      for (let _i1069 = 0; _i1069 < _a1068.length; _i1069++) {
        const v_c = _a1068[_i1069];
        let _c1076: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1076) {
          let _g1070 = 0;
          G1071: {
            const _a1072 = sp.adj4[v_c];
            for (let _i1073 = 0; _i1073 < _a1072.length; _i1073++) {
              const _h1074 = (b.grid[sp.adj4Edges[v_c][_i1073]] || -1);
              if (!((_h1074 === 1))) continue;
              _g1070++;
            }
          }
          _c1076 = ((_g1070 + (_k1075[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1076) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1059.push(v_c);
      }
    }
    const _a1077 = _g1059;
    for (let _i1078 = 0; _i1078 < _a1077.length; _i1078++) {
      const v_p = _a1077[_i1078];
      const _a1079 = sp.adj4[v_p];
      for (let _i1080 = 0; _i1080 < _a1079.length; _i1080++) {
        const v_q = _a1079[_i1080];
        _g1097.length = 0;
        G1098: {
          const _a1106 = sp.lineCells[v_L];
          for (let _i1107 = 0; _i1107 < _a1106.length; _i1107++) {
            const v_c = _a1106[_i1107];
            let _c1113: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1113) {
              let _g1108 = 0;
              G1109: {
                const _a1110 = sp.adj4[v_c];
                for (let _i1111 = 0; _i1111 < _a1110.length; _i1111++) {
                  const _h1112 = (b.grid[sp.adj4Edges[v_c][_i1111]] || -1);
                  if (!((_h1112 === 1))) continue;
                  _g1108++;
                }
              }
              _c1113 = ((_g1108 + (_k1075[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1113) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1097.push(v_c);
          }
        }
        let _c1129: boolean = (_g1097.includes(v_q));
        if (_c1129) {
          let _g1114 = 0;
          G1115: {
            const _a1116 = sp.adj4[v_p];
            for (let _i1117 = 0; _i1117 < _a1116.length; _i1117++) {
              const v_y = _a1116[_i1117];
              const _h1118 = (b.grid[sp.adj4Edges[v_p][_i1117]] || -1);
              let _c1128: boolean = (v_y !== v_q);
              if (_c1128) {
                let _c1127: boolean = (((_h1118 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1127) {
                  let _c1126: boolean = (_h1118 !== 1);
                  if (_c1126) {
                    let _c1125: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1125) {
                      let _g1119 = 0;
                      G1120: {
                        const _a1122 = sp.adj4[v_y];
                        for (let _i1123 = 0; _i1123 < _a1122.length; _i1123++) {
                          const _h1124 = (b.grid[sp.adj4Edges[v_y][_i1123]] || -1);
                          if (!((_h1124 === 1))) continue;
                          _g1119++;
                        }
                      }
                      _c1125 = ((_g1119 + (_k1075[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1126 = _c1125;
                  }
                  _c1127 = _c1126;
                }
                _c1128 = !(_c1127);
              }
              if (!(_c1128)) continue;
              _g1114++;
            }
          }
          _c1129 = (_g1114 < 2);
        }
        if (!(_c1129)) continue;
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
  const _g1245: number[] = [];
  const _g1283: number[] = [];
  const facts = sharedFateEmptiesFacts;
  let fired = 0;
  let changed = false;
  const _k1261 = exitsKept.board(cl);
  const _a1222 = sp.lines;
  for (let _i1223 = 0; _i1223 < _a1222.length; _i1223++) {
    const v_L = _a1222[_i1223];
    const _h1224 = clueAt(cl.count, v_L);
    let _g1225 = 0;
    G1226: {
      const _a1227 = sp.lineCells[v_L];
      for (let _i1228 = 0; _i1228 < _a1227.length; _i1228++) {
        const v_c = _a1227[_i1228];
        if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
        _g1225++;
      }
    }
    if (!((((sp.lineCells[v_L].length - _h1224) - _g1225) === 1))) continue;
    _g1245.length = 0;
    G1246: {
      const _a1254 = sp.lineCells[v_L];
      for (let _i1255 = 0; _i1255 < _a1254.length; _i1255++) {
        const v_c = _a1254[_i1255];
        let _c1262: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1262) {
          let _g1256 = 0;
          G1257: {
            const _a1258 = sp.adj4[v_c];
            for (let _i1259 = 0; _i1259 < _a1258.length; _i1259++) {
              const _h1260 = (b.grid[sp.adj4Edges[v_c][_i1259]] || -1);
              if (!((_h1260 === 1))) continue;
              _g1256++;
            }
          }
          _c1262 = ((_g1256 + (_k1261[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1262) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1245.push(v_c);
      }
    }
    const _a1263 = _g1245;
    for (let _i1264 = 0; _i1264 < _a1263.length; _i1264++) {
      const v_p = _a1263[_i1264];
      const _a1265 = sp.adj4[v_p];
      for (let _i1266 = 0; _i1266 < _a1265.length; _i1266++) {
        const v_q = _a1265[_i1266];
        _g1283.length = 0;
        G1284: {
          const _a1292 = sp.lineCells[v_L];
          for (let _i1293 = 0; _i1293 < _a1292.length; _i1293++) {
            const v_c = _a1292[_i1293];
            let _c1299: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1299) {
              let _g1294 = 0;
              G1295: {
                const _a1296 = sp.adj4[v_c];
                for (let _i1297 = 0; _i1297 < _a1296.length; _i1297++) {
                  const _h1298 = (b.grid[sp.adj4Edges[v_c][_i1297]] || -1);
                  if (!((_h1298 === 1))) continue;
                  _g1294++;
                }
              }
              _c1299 = ((_g1294 + (_k1261[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1299) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1283.push(v_c);
          }
        }
        let _c1315: boolean = (_g1283.includes(v_q));
        if (_c1315) {
          let _g1300 = 0;
          G1301: {
            const _a1302 = sp.adj4[v_p];
            for (let _i1303 = 0; _i1303 < _a1302.length; _i1303++) {
              const v_y = _a1302[_i1303];
              const _h1304 = (b.grid[sp.adj4Edges[v_p][_i1303]] || -1);
              let _c1314: boolean = (v_y !== v_q);
              if (_c1314) {
                let _c1313: boolean = (((_h1304 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1313) {
                  let _c1312: boolean = (_h1304 !== 1);
                  if (_c1312) {
                    let _c1311: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1311) {
                      let _g1305 = 0;
                      G1306: {
                        const _a1308 = sp.adj4[v_y];
                        for (let _i1309 = 0; _i1309 < _a1308.length; _i1309++) {
                          const _h1310 = (b.grid[sp.adj4Edges[v_y][_i1309]] || -1);
                          if (!((_h1310 === 1))) continue;
                          _g1305++;
                        }
                      }
                      _c1311 = ((_g1305 + (_k1261[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1312 = _c1311;
                  }
                  _c1313 = _c1312;
                }
                _c1314 = !(_c1313);
              }
              if (!(_c1314)) continue;
              _g1300++;
            }
          }
          _c1315 = (_g1300 < 2);
        }
        if (!(_c1315)) continue;
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
  const _g1360: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _k1386 = exitsKept.board(cl);
  _g1360.length = 0;
  G1361: {
    const _a1378 = sp.edges;
    for (let _i1379 = 0; _i1379 < _a1378.length; _i1379++) {
      const v_x = _a1378[_i1379];
      let _c1394: boolean = !((b.grid[v_x] !== 0));
      if (_c1394) {
        const _t1380 = sp.edgeEnds[2 * v_x];
        const _t1381 = sp.edgeEnds[2 * v_x + 1];
        let _c1393: boolean = ((((b.grid[sp.edgeOf(_t1380, _t1381)] || -1) === 2) || !(((b.edgeCand(_t1380) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1381) >> 1) & 1) !== 0));
        if (!_c1393) {
          let _c1392: boolean = ((b.grid[sp.edgeOf(_t1380, _t1381)] || -1) !== 1);
          if (_c1392) {
            let _g1382 = 0;
            G1383: {
              const _a1384 = sp.adj4[_t1380];
              for (let _i1385 = 0; _i1385 < _a1384.length; _i1385++) {
                if (!(((b.grid[sp.adj4Edges[_t1380][_i1385]] || -1) === 1))) continue;
                _g1382++;
              }
            }
            let _c1391: boolean = ((_g1382 + (_k1386[_t1380] ?? exits(sp, cl, _t1380))) === 2);
            if (!_c1391) {
              let _g1387 = 0;
              G1388: {
                const _a1389 = sp.adj4[_t1381];
                for (let _i1390 = 0; _i1390 < _a1389.length; _i1390++) {
                  if (!(((b.grid[sp.adj4Edges[_t1381][_i1390]] || -1) === 1))) continue;
                  _g1387++;
                }
              }
              _c1391 = ((_g1387 + (_k1386[_t1381] ?? exits(sp, cl, _t1381))) === 2);
            }
            _c1392 = _c1391;
          }
          _c1393 = _c1392;
        }
        _c1394 = !(_c1393);
      }
      if (!(_c1394)) continue;
      _g1360.push(v_x);
    }
  }
  const v_O = _g1360;
  const _a1395 = cutEdges(sp, v_O);
  for (let _i1396 = 0; _i1396 < _a1395.length; _i1396++) {
    const v_e = _a1395[_i1396];
    const v_G = through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)));
    let _g1397 = 0;
    G1398: {
      const _a1399 = v_G;
      for (let _i1400 = 0; _i1400 < _a1399.length; _i1400++) {
        const v_c = _a1399[_i1400];
        let _g1401 = 0;
        G1402: {
          const _a1403 = sp.adj4[v_c];
          for (let _i1404 = 0; _i1404 < _a1403.length; _i1404++) {
            const v_y = _a1403[_i1404];
            if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i1404]] || -1) === 1)))) continue;
            _g1401++;
          }
        }
        _g1397 += (_g1401 + (_k1386[v_c] ?? exits(sp, cl, v_c)));
      }
    }
    const v_k = _g1397;
    facts.length = 0;
    changed = false;
    let _c1405: boolean = !(((v_k % 2) === 1));
    if (!_c1405) {
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      _c1405 = true;
    }
    let _c1407: boolean = _c1405;
    if (_c1407) {
      let _c1406: boolean = !(((v_k % 2) === 0));
      if (!_c1406) {
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        _c1406 = true;
      }
      _c1407 = _c1406;
    }
    if (!(_c1407)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ O: v_O.slice(), e: v_e, G: v_G.slice(), k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

const exitsKept = keptStore<number>();
let exitsOn: object | null = null;
let exitsAt: Kept<number> = [];

/** `exits(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function exits(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== exitsOn) {
    exitsAt = exitsKept.board(cl);
    exitsOn = cl;
  }
  const _kept: Kept<number> = exitsAt;
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
  let _g363 = 0;
  G364: {
    const _a365 = sp.lineCells[v_L];
    for (let _i366 = 0; _i366 < _a365.length; _i366++) {
      const v_c = _a365[_i366];
      let _c371: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
      if (!_c371) {
        let _g367 = 0;
        G368: {
          const _a369 = sp.adj4[v_c];
          for (let _i370 = 0; _i370 < _a369.length; _i370++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i370]] || -1) === 1))) continue;
            _g367++;
          }
        }
        _c371 = ((_g367 + exits(sp, cl, v_c)) > 0);
      }
      if (!(_c371)) continue;
      _g363++;
    }
  }
  const _made = _g363;
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
  let _q825 = true;
  Q826: {
    const _a827 = sp.adj4[v_c];
    for (let _i828 = 0; _i828 < _a827.length; _i828++) {
      const v_y = _a827[_i828];
      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
      let _c840: boolean = ((((b.grid[sp.adj4Edges[v_c][_i828]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
      if (!_c840) {
        let _c839: boolean = ((b.grid[sp.adj4Edges[v_c][_i828]] || -1) !== 1);
        if (_c839) {
          let _g829 = 0;
          G830: {
            const _a831 = sp.adj4[v_c];
            for (let _i832 = 0; _i832 < _a831.length; _i832++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i832]] || -1) === 1))) continue;
              _g829++;
            }
          }
          let _c838: boolean = ((_g829 + exits(sp, cl, v_c)) === 2);
          if (!_c838) {
            let _g833 = 0;
            G834: {
              const _a836 = sp.adj4[v_y];
              for (let _i837 = 0; _i837 < _a836.length; _i837++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i837]] || -1) === 1))) continue;
                _g833++;
              }
            }
            _c838 = ((_g833 + exits(sp, cl, v_y)) === 2);
          }
          _c839 = _c838;
        }
        _c840 = _c839;
      }
      if (!(!(_c840))) {
        _q825 = false;
        break Q826;
      }
    }
  }
  let _c845: boolean = _q825;
  if (_c845) {
    let _g841 = 0;
    G842: {
      const _a843 = sp.adj4[v_c];
      for (let _i844 = 0; _i844 < _a843.length; _i844++) {
        const v_y = _a843[_i844];
        if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
        _g841++;
      }
    }
    _c845 = ((_g841 === 2) || ((clueAt(cl.end, v_c) >= 1) && !(((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L)))))));
  }
  const _made = _c845;
  crossableMarkedKept.set((v_c + 1) * 1048577 + (v_L + 1), _made);
  return _made;
}
