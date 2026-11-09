// Compiled by `npm run describe` from src/games/tracks/tracks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, cutEdges, edgeGroups, keptEdgeGroups, keptStore, minus, rangeMask, sameSet, setOf, step, through, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g1535: number[] = [];
  const _domain = rangeMask(1, 2);
  const _k1524 = exitsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1515 = true;
  Q1516: {
    const _a1517 = sp.cells;
    for (let _i1518 = 0; _i1518 < _a1517.length; _i1518++) {
      const v_c = _a1517[_i1518];
      let _g1519 = 0;
      G1520: {
        const _a1521 = sp.adj4[v_c];
        for (let _i1522 = 0; _i1522 < _a1521.length; _i1522++) {
          const _h1523 = (g[sp.adj4Edges[v_c][_i1522]] || -1);
          if (!((_h1523 === 1))) continue;
          _g1519++;
        }
      }
      let _c1530: boolean = ((_g1519 + (_k1524[v_c] ?? exits(sp, cl, v_c))) === 0);
      if (!_c1530) {
        let _g1525 = 0;
        G1526: {
          const _a1527 = sp.adj4[v_c];
          for (let _i1528 = 0; _i1528 < _a1527.length; _i1528++) {
            const _h1529 = (g[sp.adj4Edges[v_c][_i1528]] || -1);
            if (!((_h1529 === 1))) continue;
            _g1525++;
          }
        }
        _c1530 = ((_g1525 + (_k1524[v_c] ?? exits(sp, cl, v_c))) === 2);
      }
      if (!(_c1530)) {
        _q1515 = false;
        break Q1516;
      }
    }
  }
  if (!(_q1515)) return false;
  let _g1531 = 0;
  G1532: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      _g1531++;
    }
  }
  if (!((_g1531 === 2))) return false;
  let _q1533 = true;
  Q1534: {
    _g1535.length = 0;
    G1536: {
      const _a1539 = sp.edges;
      for (let _i1540 = 0; _i1540 < _a1539.length; _i1540++) {
        const v_e = _a1539[_i1540];
        const _h1541 = (g[v_e] || -1);
        if (!((_h1541 === 1))) continue;
        _g1535.push(v_e);
      }
    }
    const v_R = _g1535;
    const _eg1556 = edgeGroups(sp, v_R);
    const _a1542 = sp.cells;
    for (let _i1543 = 0; _i1543 < _a1542.length; _i1543++) {
      const v_a = _a1542[_i1543];
      let _g1544 = 0;
      G1545: {
        const _a1546 = sp.adj4[v_a];
        for (let _i1547 = 0; _i1547 < _a1546.length; _i1547++) {
          const _h1548 = (g[sp.adj4Edges[v_a][_i1547]] || -1);
          if (!((_h1548 === 1))) continue;
          _g1544++;
        }
      }
      if (!(((_g1544 + (_k1524[v_a] ?? exits(sp, cl, v_a))) > 0))) continue;
      const _a1549 = sp.cells;
      for (let _i1550 = 0; _i1550 < _a1549.length; _i1550++) {
        const v_b = _a1549[_i1550];
        let _g1551 = 0;
        G1552: {
          const _a1553 = sp.adj4[v_b];
          for (let _i1554 = 0; _i1554 < _a1553.length; _i1554++) {
            const _h1555 = (g[sp.adj4Edges[v_b][_i1554]] || -1);
            if (!((_h1555 === 1))) continue;
            _g1551++;
          }
        }
        if (!(((_g1551 + (_k1524[v_b] ?? exits(sp, cl, v_b))) > 0))) continue;
        if (!((_eg1556.of(v_b) === _eg1556.of(v_a)))) {
          _q1533 = false;
          break Q1534;
        }
      }
    }
  }
  if (!(_q1533)) return false;
  for (let _k1557 = 0; _k1557 < cl.count.at.length; _k1557++) {
    const _at1558 = cl.count.at[_k1557];
    const _v1559 = cl.count.v[_k1557];
    let _g1560 = 0;
    G1561: {
      const _a1562 = sp.lineCells[_at1558];
      for (let _i1563 = 0; _i1563 < _a1562.length; _i1563++) {
        const v_c = _a1562[_i1563];
        let _g1564 = 0;
        G1565: {
          const _a1566 = sp.adj4[v_c];
          for (let _i1567 = 0; _i1567 < _a1566.length; _i1567++) {
            const _h1568 = (g[sp.adj4Edges[v_c][_i1567]] || -1);
            if (!((_h1568 === 1))) continue;
            _g1564++;
          }
        }
        if (!(((_g1564 + (_k1524[v_c] ?? exits(sp, cl, v_c))) > 0))) continue;
        _g1560++;
      }
    }
    if (!((_g1560 === _v1559))) return false;
  }
  for (let _k1569 = 0; _k1569 < cl.end.at.length; _k1569++) {
    const _at1570 = cl.end.at[_k1569];
    const _v1571 = cl.end.v[_k1569];
    let _g1572 = 0;
    G1573: {
      const _a1574 = sp.adj4[_at1570];
      for (let _i1575 = 0; _i1575 < _a1574.length; _i1575++) {
        const _h1576 = (g[sp.adj4Edges[_at1570][_i1575]] || -1);
        if (!((_h1576 === 1))) continue;
        _g1572++;
      }
    }
    if (!((((_g1572 + (_k1524[_at1570] ?? exits(sp, cl, _at1570))) === 2) && (step(sp, _at1570, _v1571) === -1)))) return false;
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
  const _m89_0 = b.made[0];
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
  const _m92_1 = b.made[1];
  const _m92_2 = b.made[2];
  const _eg583 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a552 = sp.edges;
  R1:
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
      if (b.made[0] !== _m89_0 || b.made[1] !== _m92_1 || b.made[2] !== _m92_2) {
        const _now585 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now585 === _eg583.of(sp.edgeEnds[2 * v_e]) || sameSet(_now585, _eg583.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
      }
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
  const _g639: number[] = [];
  const facts = strandFacts;
  let fired = 0;
  let changed = false;
  const _k652 = exitsKept.board(cl);
  const _m120_0 = b.made[0];
  _g639.length = 0;
  G640: {
    const _a643 = sp.edges;
    for (let _i644 = 0; _i644 < _a643.length; _i644++) {
      const v_e = _a643[_i644];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g639.push(v_e);
    }
  }
  const v_R = _g639;
  const _m123_1 = b.made[1];
  const _m123_2 = b.made[2];
  const _eg676 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a645 = sp.edges;
  R1:
  for (let _i646 = 0; _i646 < _a645.length; _i646++) {
    const v_e = _a645[_i646];
    let _c654: boolean = !((b.grid[v_e] !== 0));
    if (_c654) {
      const _t647 = sp.edgeEnds[2 * v_e];
      let _c653: boolean = !(((b.edgeCand(_t647) >> 2) & 1) !== 0);
      if (!_c653) {
        let _g648 = 0;
        G649: {
          const _a650 = sp.adj4[_t647];
          for (let _i651 = 0; _i651 < _a650.length; _i651++) {
            if (!(((b.grid[sp.adj4Edges[_t647][_i651]] || -1) === 1))) continue;
            _g648++;
          }
        }
        _c653 = ((_g648 + (_k652[_t647] ?? exits(sp, cl, _t647))) > 0);
      }
      _c654 = _c653;
    }
    let _c661: boolean = _c654;
    if (_c661) {
      const _t655 = sp.edgeEnds[2 * v_e + 1];
      let _c660: boolean = !(((b.edgeCand(_t655) >> 2) & 1) !== 0);
      if (!_c660) {
        let _g656 = 0;
        G657: {
          const _a658 = sp.adj4[_t655];
          for (let _i659 = 0; _i659 < _a658.length; _i659++) {
            if (!(((b.grid[sp.adj4Edges[_t655][_i659]] || -1) === 1))) continue;
            _g656++;
          }
        }
        _c660 = ((_g656 + (_k652[_t655] ?? exits(sp, cl, _t655))) > 0);
      }
      _c661 = _c660;
    }
    let _c675: boolean = _c661;
    if (_c675) {
      const _t662 = sp.edgeEnds[2 * v_e];
      const _t663 = sp.edgeEnds[2 * v_e + 1];
      let _c674: boolean = ((((b.grid[sp.edgeOf(_t662, _t663)] || -1) === 2) || !(((b.edgeCand(_t662) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t663) >> 1) & 1) !== 0));
      if (!_c674) {
        let _c673: boolean = ((b.grid[sp.edgeOf(_t662, _t663)] || -1) !== 1);
        if (_c673) {
          let _g664 = 0;
          G665: {
            const _a666 = sp.adj4[_t662];
            for (let _i667 = 0; _i667 < _a666.length; _i667++) {
              if (!(((b.grid[sp.adj4Edges[_t662][_i667]] || -1) === 1))) continue;
              _g664++;
            }
          }
          let _c672: boolean = ((_g664 + (_k652[_t662] ?? exits(sp, cl, _t662))) === 2);
          if (!_c672) {
            let _g668 = 0;
            G669: {
              const _a670 = sp.adj4[_t663];
              for (let _i671 = 0; _i671 < _a670.length; _i671++) {
                if (!(((b.grid[sp.adj4Edges[_t663][_i671]] || -1) === 1))) continue;
                _g668++;
              }
            }
            _c672 = ((_g668 + (_k652[_t663] ?? exits(sp, cl, _t663))) === 2);
          }
          _c673 = _c672;
        }
        _c674 = _c673;
      }
      _c675 = !(_c674);
    }
    if (!(_c675)) continue;
    const v_G = _eg676.of(sp.edgeEnds[2 * v_e]);
    L677: {
      const v_H = _eg676.of(sp.edgeEnds[2 * v_e + 1]);
      let _c680: boolean = !(_eg676.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c680) {
        let _q678 = false;
        Q679: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg676.of(cl.end.at[v_q]) === v_G)) {
              _q678 = true;
              break Q679;
            }
          }
        }
        _c680 = _q678;
      }
      let _c683: boolean = _c680;
      if (_c683) {
        let _q681 = false;
        Q682: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg676.of(cl.end.at[v_q]) === v_H)) {
              _q681 = true;
              break Q682;
            }
          }
        }
        _c683 = _q681;
      }
      let _c693: boolean = _c683;
      if (_c693) {
        let _q684 = false;
        Q685: {
          const _a686 = sp.cells;
          for (let _i687 = 0; _i687 < _a686.length; _i687++) {
            const v_c = _a686[_i687];
            let _c692: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c692) {
              let _g688 = 0;
              G689: {
                const _a690 = sp.adj4[v_c];
                for (let _i691 = 0; _i691 < _a690.length; _i691++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i691]] || -1) === 1))) continue;
                  _g688++;
                }
              }
              _c692 = ((_g688 + (_k652[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (((_c692 && !(_eg676.of(v_c) === v_G)) && !(_eg676.of(v_c) === v_H))) {
              _q684 = true;
              break Q685;
            }
          }
        }
        _c693 = _q684;
      }
      if (!(_c693)) break L677;
      if (b.made[0] !== _m120_0 || b.made[1] !== _m123_1 || b.made[2] !== _m123_2) {
        const _now694 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now694 === _eg676.of(sp.edgeEnds[2 * v_e]) || sameSet(_now694, _eg676.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
        const _now695 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e + 1]);
        if (!(_now695 === _eg676.of(sp.edgeEnds[2 * v_e + 1]) || sameSet(_now695, _eg676.of(sp.edgeEnds[2 * v_e + 1])))) { continue R1; }
      }
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
  const _g748: number[] = [];
  const facts = finishEarlyFacts;
  let fired = 0;
  let changed = false;
  const _k761 = exitsKept.board(cl);
  const _m159_0 = b.made[0];
  _g748.length = 0;
  G749: {
    const _a752 = sp.edges;
    for (let _i753 = 0; _i753 < _a752.length; _i753++) {
      const v_e = _a752[_i753];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g748.push(v_e);
    }
  }
  const v_R = _g748;
  const _m162_1 = b.made[1];
  const _m162_2 = b.made[2];
  const _eg785 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a754 = sp.edges;
  R1:
  for (let _i755 = 0; _i755 < _a754.length; _i755++) {
    const v_e = _a754[_i755];
    let _c763: boolean = !((b.grid[v_e] !== 0));
    if (_c763) {
      const _t756 = sp.edgeEnds[2 * v_e];
      let _c762: boolean = !(((b.edgeCand(_t756) >> 2) & 1) !== 0);
      if (!_c762) {
        let _g757 = 0;
        G758: {
          const _a759 = sp.adj4[_t756];
          for (let _i760 = 0; _i760 < _a759.length; _i760++) {
            if (!(((b.grid[sp.adj4Edges[_t756][_i760]] || -1) === 1))) continue;
            _g757++;
          }
        }
        _c762 = ((_g757 + (_k761[_t756] ?? exits(sp, cl, _t756))) > 0);
      }
      _c763 = _c762;
    }
    let _c770: boolean = _c763;
    if (_c770) {
      const _t764 = sp.edgeEnds[2 * v_e + 1];
      let _c769: boolean = !(((b.edgeCand(_t764) >> 2) & 1) !== 0);
      if (!_c769) {
        let _g765 = 0;
        G766: {
          const _a767 = sp.adj4[_t764];
          for (let _i768 = 0; _i768 < _a767.length; _i768++) {
            if (!(((b.grid[sp.adj4Edges[_t764][_i768]] || -1) === 1))) continue;
            _g765++;
          }
        }
        _c769 = ((_g765 + (_k761[_t764] ?? exits(sp, cl, _t764))) > 0);
      }
      _c770 = _c769;
    }
    let _c784: boolean = _c770;
    if (_c784) {
      const _t771 = sp.edgeEnds[2 * v_e];
      const _t772 = sp.edgeEnds[2 * v_e + 1];
      let _c783: boolean = ((((b.grid[sp.edgeOf(_t771, _t772)] || -1) === 2) || !(((b.edgeCand(_t771) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t772) >> 1) & 1) !== 0));
      if (!_c783) {
        let _c782: boolean = ((b.grid[sp.edgeOf(_t771, _t772)] || -1) !== 1);
        if (_c782) {
          let _g773 = 0;
          G774: {
            const _a775 = sp.adj4[_t771];
            for (let _i776 = 0; _i776 < _a775.length; _i776++) {
              if (!(((b.grid[sp.adj4Edges[_t771][_i776]] || -1) === 1))) continue;
              _g773++;
            }
          }
          let _c781: boolean = ((_g773 + (_k761[_t771] ?? exits(sp, cl, _t771))) === 2);
          if (!_c781) {
            let _g777 = 0;
            G778: {
              const _a779 = sp.adj4[_t772];
              for (let _i780 = 0; _i780 < _a779.length; _i780++) {
                if (!(((b.grid[sp.adj4Edges[_t772][_i780]] || -1) === 1))) continue;
                _g777++;
              }
            }
            _c781 = ((_g777 + (_k761[_t772] ?? exits(sp, cl, _t772))) === 2);
          }
          _c782 = _c781;
        }
        _c783 = _c782;
      }
      _c784 = !(_c783);
    }
    if (!(_c784)) continue;
    const v_G = _eg785.of(sp.edgeEnds[2 * v_e]);
    L786: {
      const v_H = _eg785.of(sp.edgeEnds[2 * v_e + 1]);
      let _c789: boolean = !(_eg785.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c789) {
        let _q787 = false;
        Q788: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg785.of(cl.end.at[v_q]) === v_G)) {
              _q787 = true;
              break Q788;
            }
          }
        }
        _c789 = _q787;
      }
      let _c792: boolean = _c789;
      if (_c792) {
        let _q790 = false;
        Q791: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg785.of(cl.end.at[v_q]) === v_H)) {
              _q790 = true;
              break Q791;
            }
          }
        }
        _c792 = _q790;
      }
      let _c802: boolean = _c792;
      if (_c802) {
        let _q793 = false;
        Q794: {
          const _a795 = sp.lines;
          for (let _i796 = 0; _i796 < _a795.length; _i796++) {
            const v_L = _a795[_i796];
            const _h801 = clueAt(cl.count, v_L);
            let _g797 = 0;
            G798: {
              const _a799 = sp.lineCells[v_L];
              for (let _i800 = 0; _i800 < _a799.length; _i800++) {
                const v_c = _a799[_i800];
                if (!(((_eg785.of(v_c) === v_G) || (_eg785.of(v_c) === v_H)))) continue;
                _g797++;
              }
            }
            if ((_g797 < _h801)) {
              _q793 = true;
              break Q794;
            }
          }
        }
        _c802 = _q793;
      }
      if (!(_c802)) break L786;
      if (b.made[0] !== _m159_0 || b.made[1] !== _m162_1 || b.made[2] !== _m162_2) {
        const _now803 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now803 === _eg785.of(sp.edgeEnds[2 * v_e]) || sameSet(_now803, _eg785.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
        const _now804 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e + 1]);
        if (!(_now804 === _eg785.of(sp.edgeEnds[2 * v_e + 1]) || sameSet(_now804, _eg785.of(sp.edgeEnds[2 * v_e + 1])))) { continue R1; }
      }
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
  const _g887: number[] = [];
  const _g914: number[] = [];
  const _g944: number[] = [];
  const facts = looseEndFacts;
  let fired = 0;
  let changed = false;
  const _k901 = exitsKept.board(cl);
  if (looseEndCands.length < sp.edges.length) looseEndCands = new Int32Array(sp.edges.length);
  const cands = looseEndCands;
  cands.fill(-1);
  crossableMarkedKept.clear();
  const _a885 = sp.lines;
  for (let _i886 = 0; _i886 < _a885.length; _i886++) {
    const v_L = _a885[_i886];
    const _h903 = clueAt(cl.count, v_L);
    const _h935 = (sp.rows.includes(v_L));
    _g887.length = 0;
    G888: {
      const _a895 = sp.lineCells[v_L];
      for (let _i896 = 0; _i896 < _a895.length; _i896++) {
        const v_c = _a895[_i896];
        let _g897 = 0;
        G898: {
          const _a899 = sp.adj4[v_c];
          for (let _i900 = 0; _i900 < _a899.length; _i900++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i900]] || -1) === 1))) continue;
            _g897++;
          }
        }
        if (!(((_g897 + (_k901[v_c] ?? exits(sp, cl, v_c))) === 2))) continue;
        _g887.push(v_c);
      }
    }
    L902: {
      const v_F = _g887;
      const _h904 = v_F.length;
      let _c913: boolean = ((_h903 - _h904) === 2);
      if (_c913) {
        let _q905 = true;
        Q906: {
          const _a907 = sp.lineCells[v_L];
          for (let _i908 = 0; _i908 < _a907.length; _i908++) {
            const v_c = _a907[_i908];
            let _g909 = 0;
            G910: {
              const _a911 = sp.adj4[v_c];
              for (let _i912 = 0; _i912 < _a911.length; _i912++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i912]] || -1) === 1))) continue;
                _g909++;
              }
            }
            if (!(((_g909 + (_k901[v_c] ?? exits(sp, cl, v_c))) !== 2))) continue;
            if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
              _q905 = false;
              break Q906;
            }
          }
        }
        _c913 = _q905;
      }
      if (!(_c913)) break L902;
      _g914.length = 0;
      G915: {
        const _a928 = sp.lineCells[v_L];
        for (let _i929 = 0; _i929 < _a928.length; _i929++) {
          const v_c = _a928[_i929];
          const _h934 = clueAt(cl.end, v_c);
          let _g930 = 0;
          G931: {
            const _a932 = sp.adj4[v_c];
            for (let _i933 = 0; _i933 < _a932.length; _i933++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i933]] || -1) === 1))) continue;
              _g930++;
            }
          }
          let _c941: boolean = ((_g930 + (_k901[v_c] ?? exits(sp, cl, v_c))) === 1);
          if (_c941) {
            let _c940: boolean = ((_h934 >= 1) && ((_h934 >= 3) === _h935));
            if (!_c940) {
              let _q936 = false;
              Q937: {
                const _a938 = sp.adj4[v_c];
                for (let _i939 = 0; _i939 < _a938.length; _i939++) {
                  const v_y = _a938[_i939];
                  if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_c][_i939]] || -1) === 1)) {
                    _q936 = true;
                    break Q937;
                  }
                }
              }
              _c940 = _q936;
            }
            _c941 = _c940;
          }
          if (!(_c941)) continue;
          _g914.push(v_c);
        }
      }
      L942: {
        const v_P = _g914;
        const _h943 = v_P.length;
        if (!((_h943 === 1))) break L942;
        const v_p = (v_P[0] ?? -1);
        _g944.length = 0;
        G945: {
          const _a948 = sp.adj4[v_p];
          for (let _i949 = 0; _i949 < _a948.length; _i949++) {
            const v_y = _a948[_i949];
            if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i949]] || -1) !== 1)))) continue;
            _g944.push(v_y);
          }
        }
        const v_Q = _g944;
        const _h950 = v_Q.length;
        facts.length = 0;
        changed = false;
        let _c956: boolean = (_h950 === 1);
        if (_c956) {
          let _q951 = true;
          Q952: {
            const _a953 = v_Q;
            for (let _i954 = 0; _i954 < _a953.length; _i954++) {
              const v_y = _a953[_i954];
              const _t955 = sp.edgeOf(v_p, v_y);
              if (!(b.grid[_t955] !== 0)) { if (fire === null) { b.placeAt(_t955, 1); changed = true; } else facts.push(PLACE, _t955, 1); }
              if (!(true)) {
                _q951 = false;
                break Q952;
              }
            }
          }
          _c956 = _q951;
        }
        if (!(_c956)) return -1;
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
  const _g1064: number[] = [];
  const _g1102: number[] = [];
  const _g1151: number[] = [];
  const facts = sharedFateFacts;
  let fired = 0;
  let changed = false;
  const _k1080 = exitsKept.board(cl);
  if (sharedFateCands.length < sp.edges.length) sharedFateCands = new Int32Array(sp.edges.length);
  const cands = sharedFateCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a1045 = sp.lines;
  R1:
  for (let _i1046 = 0; _i1046 < _a1045.length; _i1046++) {
    const v_L = _a1045[_i1046];
    const _m239_0 = b.made[0];
    const _m239_1 = b.made[1];
    const _m239_2 = b.made[2];
    const _h1047 = clueAt(cl.count, v_L);
    if (!(((_h1047 - laidMarked(b, sp, cl, cands, v_L)) === 1))) continue;
    _g1064.length = 0;
    G1065: {
      const _a1073 = sp.lineCells[v_L];
      for (let _i1074 = 0; _i1074 < _a1073.length; _i1074++) {
        const v_c = _a1073[_i1074];
        let _c1081: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1081) {
          let _g1075 = 0;
          G1076: {
            const _a1077 = sp.adj4[v_c];
            for (let _i1078 = 0; _i1078 < _a1077.length; _i1078++) {
              const _h1079 = (b.grid[sp.adj4Edges[v_c][_i1078]] || -1);
              if (!((_h1079 === 1))) continue;
              _g1075++;
            }
          }
          _c1081 = ((_g1075 + (_k1080[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1081) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1064.push(v_c);
      }
    }
    const _a1082 = _g1064;
    R2:
    for (let _i1083 = 0; _i1083 < _a1082.length; _i1083++) {
      const v_p = _a1082[_i1083];
      const _a1084 = sp.adj4[v_p];
      for (let _i1085 = 0; _i1085 < _a1084.length; _i1085++) {
        const v_q = _a1084[_i1085];
        _g1102.length = 0;
        G1103: {
          const _a1111 = sp.lineCells[v_L];
          for (let _i1112 = 0; _i1112 < _a1111.length; _i1112++) {
            const v_c = _a1111[_i1112];
            let _c1118: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1118) {
              let _g1113 = 0;
              G1114: {
                const _a1115 = sp.adj4[v_c];
                for (let _i1116 = 0; _i1116 < _a1115.length; _i1116++) {
                  const _h1117 = (b.grid[sp.adj4Edges[v_c][_i1116]] || -1);
                  if (!((_h1117 === 1))) continue;
                  _g1113++;
                }
              }
              _c1118 = ((_g1113 + (_k1080[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1118) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1102.push(v_c);
          }
        }
        let _c1134: boolean = (_g1102.includes(v_q));
        if (_c1134) {
          let _g1119 = 0;
          G1120: {
            const _a1121 = sp.adj4[v_p];
            for (let _i1122 = 0; _i1122 < _a1121.length; _i1122++) {
              const v_y = _a1121[_i1122];
              const _h1123 = (b.grid[sp.adj4Edges[v_p][_i1122]] || -1);
              let _c1133: boolean = (v_y !== v_q);
              if (_c1133) {
                let _c1132: boolean = (((_h1123 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1132) {
                  let _c1131: boolean = (_h1123 !== 1);
                  if (_c1131) {
                    let _c1130: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1130) {
                      let _g1124 = 0;
                      G1125: {
                        const _a1127 = sp.adj4[v_y];
                        for (let _i1128 = 0; _i1128 < _a1127.length; _i1128++) {
                          const _h1129 = (b.grid[sp.adj4Edges[v_y][_i1128]] || -1);
                          if (!((_h1129 === 1))) continue;
                          _g1124++;
                        }
                      }
                      _c1130 = ((_g1124 + (_k1080[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1131 = _c1130;
                  }
                  _c1132 = _c1131;
                }
                _c1133 = !(_c1132);
              }
              if (!(_c1133)) continue;
              _g1119++;
            }
          }
          _c1134 = (_g1119 < 2);
        }
        if (!(_c1134)) continue;
        if (b.made[0] !== _m239_0 || b.made[1] !== _m239_1 || b.made[2] !== _m239_2) {
          if (!(((clueAt(cl.count, v_L) - laidMarked(b, sp, cl, cands, v_L)) === 1))) { continue R1; }
          _g1151.length = 0;
          G1152: {
            const _a1160 = sp.lineCells[v_L];
            for (let _i1161 = 0; _i1161 < _a1160.length; _i1161++) {
              const v_c = _a1160[_i1161];
              let _c1166: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1166) {
                let _g1162 = 0;
                G1163: {
                  const _a1164 = sp.adj4[v_c];
                  for (let _i1165 = 0; _i1165 < _a1164.length; _i1165++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1165]] || -1) === 1))) continue;
                    _g1162++;
                  }
                }
                _c1166 = ((_g1162 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1166) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1151.push(v_c);
            }
          }
          if (!((_g1151.includes(v_p)))) { continue R2; }
        }
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
  const _g1282: number[] = [];
  const _g1320: number[] = [];
  const _g1373: number[] = [];
  const facts = sharedFateEmptiesFacts;
  let fired = 0;
  let changed = false;
  const _k1298 = exitsKept.board(cl);
  const _a1259 = sp.lines;
  R1:
  for (let _i1260 = 0; _i1260 < _a1259.length; _i1260++) {
    const v_L = _a1259[_i1260];
    const _m268_2 = b.made[2];
    const _h1261 = clueAt(cl.count, v_L);
    let _g1262 = 0;
    G1263: {
      const _a1264 = sp.lineCells[v_L];
      for (let _i1265 = 0; _i1265 < _a1264.length; _i1265++) {
        const v_c = _a1264[_i1265];
        if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
        _g1262++;
      }
    }
    if (!((((sp.lineCells[v_L].length - _h1261) - _g1262) === 1))) continue;
    const _m273_0 = b.made[0];
    _g1282.length = 0;
    G1283: {
      const _a1291 = sp.lineCells[v_L];
      for (let _i1292 = 0; _i1292 < _a1291.length; _i1292++) {
        const v_c = _a1291[_i1292];
        let _c1299: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1299) {
          let _g1293 = 0;
          G1294: {
            const _a1295 = sp.adj4[v_c];
            for (let _i1296 = 0; _i1296 < _a1295.length; _i1296++) {
              const _h1297 = (b.grid[sp.adj4Edges[v_c][_i1296]] || -1);
              if (!((_h1297 === 1))) continue;
              _g1293++;
            }
          }
          _c1299 = ((_g1293 + (_k1298[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1299) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1282.push(v_c);
      }
    }
    const _a1300 = _g1282;
    R2:
    for (let _i1301 = 0; _i1301 < _a1300.length; _i1301++) {
      const v_p = _a1300[_i1301];
      const _a1302 = sp.adj4[v_p];
      for (let _i1303 = 0; _i1303 < _a1302.length; _i1303++) {
        const v_q = _a1302[_i1303];
        _g1320.length = 0;
        G1321: {
          const _a1329 = sp.lineCells[v_L];
          for (let _i1330 = 0; _i1330 < _a1329.length; _i1330++) {
            const v_c = _a1329[_i1330];
            let _c1336: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1336) {
              let _g1331 = 0;
              G1332: {
                const _a1333 = sp.adj4[v_c];
                for (let _i1334 = 0; _i1334 < _a1333.length; _i1334++) {
                  const _h1335 = (b.grid[sp.adj4Edges[v_c][_i1334]] || -1);
                  if (!((_h1335 === 1))) continue;
                  _g1331++;
                }
              }
              _c1336 = ((_g1331 + (_k1298[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1336) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1320.push(v_c);
          }
        }
        let _c1352: boolean = (_g1320.includes(v_q));
        if (_c1352) {
          let _g1337 = 0;
          G1338: {
            const _a1339 = sp.adj4[v_p];
            for (let _i1340 = 0; _i1340 < _a1339.length; _i1340++) {
              const v_y = _a1339[_i1340];
              const _h1341 = (b.grid[sp.adj4Edges[v_p][_i1340]] || -1);
              let _c1351: boolean = (v_y !== v_q);
              if (_c1351) {
                let _c1350: boolean = (((_h1341 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1350) {
                  let _c1349: boolean = (_h1341 !== 1);
                  if (_c1349) {
                    let _c1348: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1348) {
                      let _g1342 = 0;
                      G1343: {
                        const _a1345 = sp.adj4[v_y];
                        for (let _i1346 = 0; _i1346 < _a1345.length; _i1346++) {
                          const _h1347 = (b.grid[sp.adj4Edges[v_y][_i1346]] || -1);
                          if (!((_h1347 === 1))) continue;
                          _g1342++;
                        }
                      }
                      _c1348 = ((_g1342 + (_k1298[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1349 = _c1348;
                  }
                  _c1350 = _c1349;
                }
                _c1351 = !(_c1350);
              }
              if (!(_c1351)) continue;
              _g1337++;
            }
          }
          _c1352 = (_g1337 < 2);
        }
        if (!(_c1352)) continue;
        if (b.made[0] !== _m273_0 || b.made[2] !== _m268_2) {
          let _g1353 = 0;
          G1354: {
            const _a1355 = sp.lineCells[v_L];
            for (let _i1356 = 0; _i1356 < _a1355.length; _i1356++) {
              const v_c = _a1355[_i1356];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g1353++;
            }
          }
          if (!((((sp.lineCells[v_L].length - clueAt(cl.count, v_L)) - _g1353) === 1))) { continue R1; }
          _g1373.length = 0;
          G1374: {
            const _a1382 = sp.lineCells[v_L];
            for (let _i1383 = 0; _i1383 < _a1382.length; _i1383++) {
              const v_c = _a1382[_i1383];
              let _c1388: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1388) {
                let _g1384 = 0;
                G1385: {
                  const _a1386 = sp.adj4[v_c];
                  for (let _i1387 = 0; _i1387 < _a1386.length; _i1387++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1387]] || -1) === 1))) continue;
                    _g1384++;
                  }
                }
                _c1388 = ((_g1384 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1388) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1373.push(v_c);
            }
          }
          if (!((_g1373.includes(v_p)))) { continue R2; }
        }
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
  const _g1433: number[] = [];
  const _g1478: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _k1459 = exitsKept.board(cl);
  const _m298_0 = b.made[0];
  const _m298_2 = b.made[2];
  _g1433.length = 0;
  G1434: {
    const _a1451 = sp.edges;
    for (let _i1452 = 0; _i1452 < _a1451.length; _i1452++) {
      const v_x = _a1451[_i1452];
      let _c1467: boolean = !((b.grid[v_x] !== 0));
      if (_c1467) {
        const _t1453 = sp.edgeEnds[2 * v_x];
        const _t1454 = sp.edgeEnds[2 * v_x + 1];
        let _c1466: boolean = ((((b.grid[sp.edgeOf(_t1453, _t1454)] || -1) === 2) || !(((b.edgeCand(_t1453) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1454) >> 1) & 1) !== 0));
        if (!_c1466) {
          let _c1465: boolean = ((b.grid[sp.edgeOf(_t1453, _t1454)] || -1) !== 1);
          if (_c1465) {
            let _g1455 = 0;
            G1456: {
              const _a1457 = sp.adj4[_t1453];
              for (let _i1458 = 0; _i1458 < _a1457.length; _i1458++) {
                if (!(((b.grid[sp.adj4Edges[_t1453][_i1458]] || -1) === 1))) continue;
                _g1455++;
              }
            }
            let _c1464: boolean = ((_g1455 + (_k1459[_t1453] ?? exits(sp, cl, _t1453))) === 2);
            if (!_c1464) {
              let _g1460 = 0;
              G1461: {
                const _a1462 = sp.adj4[_t1454];
                for (let _i1463 = 0; _i1463 < _a1462.length; _i1463++) {
                  if (!(((b.grid[sp.adj4Edges[_t1454][_i1463]] || -1) === 1))) continue;
                  _g1460++;
                }
              }
              _c1464 = ((_g1460 + (_k1459[_t1454] ?? exits(sp, cl, _t1454))) === 2);
            }
            _c1465 = _c1464;
          }
          _c1466 = _c1465;
        }
        _c1467 = !(_c1466);
      }
      if (!(_c1467)) continue;
      _g1433.push(v_x);
    }
  }
  const v_O = _g1433;
  const _a1468 = cutEdges(sp, v_O);
  for (let _i1469 = 0; _i1469 < _a1468.length; _i1469++) {
    const v_e = _a1468[_i1469];
    const v_G = through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)));
    let _g1470 = 0;
    G1471: {
      const _a1472 = v_G;
      for (let _i1473 = 0; _i1473 < _a1472.length; _i1473++) {
        const v_c = _a1472[_i1473];
        let _g1474 = 0;
        G1475: {
          const _a1476 = sp.adj4[v_c];
          for (let _i1477 = 0; _i1477 < _a1476.length; _i1477++) {
            const v_y = _a1476[_i1477];
            if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i1477]] || -1) === 1)))) continue;
            _g1474++;
          }
        }
        _g1470 += (_g1474 + (_k1459[v_c] ?? exits(sp, cl, v_c)));
      }
    }
    const v_k = _g1470;
    if (b.made[0] !== _m298_0 || b.made[2] !== _m298_2) {
      _g1478.length = 0;
      G1479: {
        const _a1496 = sp.edges;
        for (let _i1497 = 0; _i1497 < _a1496.length; _i1497++) {
          const v_x = _a1496[_i1497];
          let _c1511: boolean = !((b.grid[v_x] !== 0));
          if (_c1511) {
            const _t1498 = sp.edgeEnds[2 * v_x];
            const _t1499 = sp.edgeEnds[2 * v_x + 1];
            let _c1510: boolean = ((((b.grid[sp.edgeOf(_t1498, _t1499)] || -1) === 2) || !(((b.edgeCand(_t1498) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1499) >> 1) & 1) !== 0));
            if (!_c1510) {
              let _c1509: boolean = ((b.grid[sp.edgeOf(_t1498, _t1499)] || -1) !== 1);
              if (_c1509) {
                let _g1500 = 0;
                G1501: {
                  const _a1502 = sp.adj4[_t1498];
                  for (let _i1503 = 0; _i1503 < _a1502.length; _i1503++) {
                    if (!(((b.grid[sp.adj4Edges[_t1498][_i1503]] || -1) === 1))) continue;
                    _g1500++;
                  }
                }
                let _c1508: boolean = ((_g1500 + exits(sp, cl, _t1498)) === 2);
                if (!_c1508) {
                  let _g1504 = 0;
                  G1505: {
                    const _a1506 = sp.adj4[_t1499];
                    for (let _i1507 = 0; _i1507 < _a1506.length; _i1507++) {
                      if (!(((b.grid[sp.adj4Edges[_t1499][_i1507]] || -1) === 1))) continue;
                      _g1504++;
                    }
                  }
                  _c1508 = ((_g1504 + exits(sp, cl, _t1499)) === 2);
                }
                _c1509 = _c1508;
              }
              _c1510 = _c1509;
            }
            _c1511 = !(_c1510);
          }
          if (!(_c1511)) continue;
          _g1478.push(v_x);
        }
      }
      if (!(sameSet(v_O, _g1478))) { return fired; }
    }
    facts.length = 0;
    changed = false;
    let _c1512: boolean = !(((v_k % 2) === 1));
    if (!_c1512) {
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      _c1512 = true;
    }
    let _c1514: boolean = _c1512;
    if (_c1514) {
      let _c1513: boolean = !(((v_k % 2) === 0));
      if (!_c1513) {
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        _c1513 = true;
      }
      _c1514 = _c1513;
    }
    if (!(_c1514)) return -1;
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
  let _q830 = true;
  Q831: {
    const _a832 = sp.adj4[v_c];
    for (let _i833 = 0; _i833 < _a832.length; _i833++) {
      const v_y = _a832[_i833];
      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
      let _c845: boolean = ((((b.grid[sp.adj4Edges[v_c][_i833]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
      if (!_c845) {
        let _c844: boolean = ((b.grid[sp.adj4Edges[v_c][_i833]] || -1) !== 1);
        if (_c844) {
          let _g834 = 0;
          G835: {
            const _a836 = sp.adj4[v_c];
            for (let _i837 = 0; _i837 < _a836.length; _i837++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i837]] || -1) === 1))) continue;
              _g834++;
            }
          }
          let _c843: boolean = ((_g834 + exits(sp, cl, v_c)) === 2);
          if (!_c843) {
            let _g838 = 0;
            G839: {
              const _a841 = sp.adj4[v_y];
              for (let _i842 = 0; _i842 < _a841.length; _i842++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i842]] || -1) === 1))) continue;
                _g838++;
              }
            }
            _c843 = ((_g838 + exits(sp, cl, v_y)) === 2);
          }
          _c844 = _c843;
        }
        _c845 = _c844;
      }
      if (!(!(_c845))) {
        _q830 = false;
        break Q831;
      }
    }
  }
  let _c850: boolean = _q830;
  if (_c850) {
    let _g846 = 0;
    G847: {
      const _a848 = sp.adj4[v_c];
      for (let _i849 = 0; _i849 < _a848.length; _i849++) {
        const v_y = _a848[_i849];
        if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
        _g846++;
      }
    }
    _c850 = ((_g846 === 2) || ((clueAt(cl.end, v_c) >= 1) && !(((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L)))))));
  }
  const _made = _c850;
  crossableMarkedKept.set((v_c + 1) * 1048577 + (v_L + 1), _made);
  return _made;
}
