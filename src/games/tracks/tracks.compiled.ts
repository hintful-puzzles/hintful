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
  const _g1548: number[] = [];
  const _domain = rangeMask(1, 2);
  const _k1537 = exitsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1528 = true;
  Q1529: {
    const _a1530 = sp.cells;
    for (let _i1531 = 0; _i1531 < _a1530.length; _i1531++) {
      const v_c = _a1530[_i1531];
      let _g1532 = 0;
      G1533: {
        const _a1534 = sp.adj4[v_c];
        for (let _i1535 = 0; _i1535 < _a1534.length; _i1535++) {
          const _h1536 = (g[sp.adj4Edges[v_c][_i1535]] || -1);
          if (!((_h1536 === 1))) continue;
          _g1532++;
        }
      }
      let _c1543: boolean = ((_g1532 + (_k1537[v_c] ?? exits(sp, cl, v_c))) === 0);
      if (!_c1543) {
        let _g1538 = 0;
        G1539: {
          const _a1540 = sp.adj4[v_c];
          for (let _i1541 = 0; _i1541 < _a1540.length; _i1541++) {
            const _h1542 = (g[sp.adj4Edges[v_c][_i1541]] || -1);
            if (!((_h1542 === 1))) continue;
            _g1538++;
          }
        }
        _c1543 = ((_g1538 + (_k1537[v_c] ?? exits(sp, cl, v_c))) === 2);
      }
      if (!(_c1543)) {
        _q1528 = false;
        break Q1529;
      }
    }
  }
  if (!(_q1528)) return false;
  let _g1544 = 0;
  G1545: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      _g1544++;
    }
  }
  if (!((_g1544 === 2))) return false;
  let _q1546 = true;
  Q1547: {
    _g1548.length = 0;
    G1549: {
      const _a1552 = sp.edges;
      for (let _i1553 = 0; _i1553 < _a1552.length; _i1553++) {
        const v_e = _a1552[_i1553];
        const _h1554 = (g[v_e] || -1);
        if (!((_h1554 === 1))) continue;
        _g1548.push(v_e);
      }
    }
    const v_R = _g1548;
    const _eg1569 = edgeGroups(sp, v_R);
    const _a1555 = sp.cells;
    for (let _i1556 = 0; _i1556 < _a1555.length; _i1556++) {
      const v_a = _a1555[_i1556];
      let _g1557 = 0;
      G1558: {
        const _a1559 = sp.adj4[v_a];
        for (let _i1560 = 0; _i1560 < _a1559.length; _i1560++) {
          const _h1561 = (g[sp.adj4Edges[v_a][_i1560]] || -1);
          if (!((_h1561 === 1))) continue;
          _g1557++;
        }
      }
      if (!(((_g1557 + (_k1537[v_a] ?? exits(sp, cl, v_a))) > 0))) continue;
      const _a1562 = sp.cells;
      for (let _i1563 = 0; _i1563 < _a1562.length; _i1563++) {
        const v_b = _a1562[_i1563];
        let _g1564 = 0;
        G1565: {
          const _a1566 = sp.adj4[v_b];
          for (let _i1567 = 0; _i1567 < _a1566.length; _i1567++) {
            const _h1568 = (g[sp.adj4Edges[v_b][_i1567]] || -1);
            if (!((_h1568 === 1))) continue;
            _g1564++;
          }
        }
        if (!(((_g1564 + (_k1537[v_b] ?? exits(sp, cl, v_b))) > 0))) continue;
        if (!((_eg1569.of(v_b) === _eg1569.of(v_a)))) {
          _q1546 = false;
          break Q1547;
        }
      }
    }
  }
  if (!(_q1546)) return false;
  for (let _k1570 = 0; _k1570 < cl.count.at.length; _k1570++) {
    const _at1571 = cl.count.at[_k1570];
    const _v1572 = cl.count.v[_k1570];
    let _g1573 = 0;
    G1574: {
      const _a1575 = sp.lineCells[_at1571];
      for (let _i1576 = 0; _i1576 < _a1575.length; _i1576++) {
        const v_c = _a1575[_i1576];
        let _g1577 = 0;
        G1578: {
          const _a1579 = sp.adj4[v_c];
          for (let _i1580 = 0; _i1580 < _a1579.length; _i1580++) {
            const _h1581 = (g[sp.adj4Edges[v_c][_i1580]] || -1);
            if (!((_h1581 === 1))) continue;
            _g1577++;
          }
        }
        if (!(((_g1577 + (_k1537[v_c] ?? exits(sp, cl, v_c))) > 0))) continue;
        _g1573++;
      }
    }
    if (!((_g1573 === _v1572))) return false;
  }
  for (let _k1582 = 0; _k1582 < cl.end.at.length; _k1582++) {
    const _at1583 = cl.end.at[_k1582];
    const _v1584 = cl.end.v[_k1582];
    let _g1585 = 0;
    G1586: {
      const _a1587 = sp.adj4[_at1583];
      for (let _i1588 = 0; _i1588 < _a1587.length; _i1588++) {
        const _h1589 = (g[sp.adj4Edges[_at1583][_i1588]] || -1);
        if (!((_h1589 === 1))) continue;
        _g1585++;
      }
    }
    if (!((((_g1585 + (_k1537[_at1583] ?? exits(sp, cl, _at1583))) === 2) && (step(sp, _at1583, _v1584) === -1)))) return false;
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
  const _g585: number[] = [];
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
        _g585.length = 0;
        G586: {
          const _a589 = sp.edges;
          for (let _i590 = 0; _i590 < _a589.length; _i590++) {
            const v_e = _a589[_i590];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g585.push(v_e);
          }
        }
        if (!(sameSet(v_R, _g585))) { return fired; }
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
  const _g644: number[] = [];
  const _g699: number[] = [];
  const facts = strandFacts;
  let fired = 0;
  let changed = false;
  const _k657 = exitsKept.board(cl);
  const _m120_0 = b.made[0];
  _g644.length = 0;
  G645: {
    const _a648 = sp.edges;
    for (let _i649 = 0; _i649 < _a648.length; _i649++) {
      const v_e = _a648[_i649];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g644.push(v_e);
    }
  }
  const v_R = _g644;
  const _m123_1 = b.made[1];
  const _m123_2 = b.made[2];
  const _eg681 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a650 = sp.edges;
  for (let _i651 = 0; _i651 < _a650.length; _i651++) {
    const v_e = _a650[_i651];
    let _c659: boolean = !((b.grid[v_e] !== 0));
    if (_c659) {
      const _t652 = sp.edgeEnds[2 * v_e];
      let _c658: boolean = !(((b.edgeCand(_t652) >> 2) & 1) !== 0);
      if (!_c658) {
        let _g653 = 0;
        G654: {
          const _a655 = sp.adj4[_t652];
          for (let _i656 = 0; _i656 < _a655.length; _i656++) {
            if (!(((b.grid[sp.adj4Edges[_t652][_i656]] || -1) === 1))) continue;
            _g653++;
          }
        }
        _c658 = ((_g653 + (_k657[_t652] ?? exits(sp, cl, _t652))) > 0);
      }
      _c659 = _c658;
    }
    let _c666: boolean = _c659;
    if (_c666) {
      const _t660 = sp.edgeEnds[2 * v_e + 1];
      let _c665: boolean = !(((b.edgeCand(_t660) >> 2) & 1) !== 0);
      if (!_c665) {
        let _g661 = 0;
        G662: {
          const _a663 = sp.adj4[_t660];
          for (let _i664 = 0; _i664 < _a663.length; _i664++) {
            if (!(((b.grid[sp.adj4Edges[_t660][_i664]] || -1) === 1))) continue;
            _g661++;
          }
        }
        _c665 = ((_g661 + (_k657[_t660] ?? exits(sp, cl, _t660))) > 0);
      }
      _c666 = _c665;
    }
    let _c680: boolean = _c666;
    if (_c680) {
      const _t667 = sp.edgeEnds[2 * v_e];
      const _t668 = sp.edgeEnds[2 * v_e + 1];
      let _c679: boolean = ((((b.grid[sp.edgeOf(_t667, _t668)] || -1) === 2) || !(((b.edgeCand(_t667) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t668) >> 1) & 1) !== 0));
      if (!_c679) {
        let _c678: boolean = ((b.grid[sp.edgeOf(_t667, _t668)] || -1) !== 1);
        if (_c678) {
          let _g669 = 0;
          G670: {
            const _a671 = sp.adj4[_t667];
            for (let _i672 = 0; _i672 < _a671.length; _i672++) {
              if (!(((b.grid[sp.adj4Edges[_t667][_i672]] || -1) === 1))) continue;
              _g669++;
            }
          }
          let _c677: boolean = ((_g669 + (_k657[_t667] ?? exits(sp, cl, _t667))) === 2);
          if (!_c677) {
            let _g673 = 0;
            G674: {
              const _a675 = sp.adj4[_t668];
              for (let _i676 = 0; _i676 < _a675.length; _i676++) {
                if (!(((b.grid[sp.adj4Edges[_t668][_i676]] || -1) === 1))) continue;
                _g673++;
              }
            }
            _c677 = ((_g673 + (_k657[_t668] ?? exits(sp, cl, _t668))) === 2);
          }
          _c678 = _c677;
        }
        _c679 = _c678;
      }
      _c680 = !(_c679);
    }
    if (!(_c680)) continue;
    const v_G = _eg681.of(sp.edgeEnds[2 * v_e]);
    L682: {
      const v_H = _eg681.of(sp.edgeEnds[2 * v_e + 1]);
      let _c685: boolean = !(_eg681.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c685) {
        let _q683 = false;
        Q684: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg681.of(cl.end.at[v_q]) === v_G)) {
              _q683 = true;
              break Q684;
            }
          }
        }
        _c685 = _q683;
      }
      let _c688: boolean = _c685;
      if (_c688) {
        let _q686 = false;
        Q687: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg681.of(cl.end.at[v_q]) === v_H)) {
              _q686 = true;
              break Q687;
            }
          }
        }
        _c688 = _q686;
      }
      let _c698: boolean = _c688;
      if (_c698) {
        let _q689 = false;
        Q690: {
          const _a691 = sp.cells;
          for (let _i692 = 0; _i692 < _a691.length; _i692++) {
            const v_c = _a691[_i692];
            let _c697: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c697) {
              let _g693 = 0;
              G694: {
                const _a695 = sp.adj4[v_c];
                for (let _i696 = 0; _i696 < _a695.length; _i696++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i696]] || -1) === 1))) continue;
                  _g693++;
                }
              }
              _c697 = ((_g693 + (_k657[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (((_c697 && !(_eg681.of(v_c) === v_G)) && !(_eg681.of(v_c) === v_H))) {
              _q689 = true;
              break Q690;
            }
          }
        }
        _c698 = _q689;
      }
      if (!(_c698)) break L682;
      if (b.made[0] !== _m120_0 || b.made[1] !== _m123_1 || b.made[2] !== _m123_2) {
        _g699.length = 0;
        G700: {
          const _a703 = sp.edges;
          for (let _i704 = 0; _i704 < _a703.length; _i704++) {
            const v_e = _a703[_i704];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g699.push(v_e);
          }
        }
        if (!(sameSet(v_R, _g699))) { return fired; }
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
  const _g757: number[] = [];
  const _g812: number[] = [];
  const facts = finishEarlyFacts;
  let fired = 0;
  let changed = false;
  const _k770 = exitsKept.board(cl);
  const _m159_0 = b.made[0];
  _g757.length = 0;
  G758: {
    const _a761 = sp.edges;
    for (let _i762 = 0; _i762 < _a761.length; _i762++) {
      const v_e = _a761[_i762];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g757.push(v_e);
    }
  }
  const v_R = _g757;
  const _m162_1 = b.made[1];
  const _m162_2 = b.made[2];
  const _eg794 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a763 = sp.edges;
  for (let _i764 = 0; _i764 < _a763.length; _i764++) {
    const v_e = _a763[_i764];
    let _c772: boolean = !((b.grid[v_e] !== 0));
    if (_c772) {
      const _t765 = sp.edgeEnds[2 * v_e];
      let _c771: boolean = !(((b.edgeCand(_t765) >> 2) & 1) !== 0);
      if (!_c771) {
        let _g766 = 0;
        G767: {
          const _a768 = sp.adj4[_t765];
          for (let _i769 = 0; _i769 < _a768.length; _i769++) {
            if (!(((b.grid[sp.adj4Edges[_t765][_i769]] || -1) === 1))) continue;
            _g766++;
          }
        }
        _c771 = ((_g766 + (_k770[_t765] ?? exits(sp, cl, _t765))) > 0);
      }
      _c772 = _c771;
    }
    let _c779: boolean = _c772;
    if (_c779) {
      const _t773 = sp.edgeEnds[2 * v_e + 1];
      let _c778: boolean = !(((b.edgeCand(_t773) >> 2) & 1) !== 0);
      if (!_c778) {
        let _g774 = 0;
        G775: {
          const _a776 = sp.adj4[_t773];
          for (let _i777 = 0; _i777 < _a776.length; _i777++) {
            if (!(((b.grid[sp.adj4Edges[_t773][_i777]] || -1) === 1))) continue;
            _g774++;
          }
        }
        _c778 = ((_g774 + (_k770[_t773] ?? exits(sp, cl, _t773))) > 0);
      }
      _c779 = _c778;
    }
    let _c793: boolean = _c779;
    if (_c793) {
      const _t780 = sp.edgeEnds[2 * v_e];
      const _t781 = sp.edgeEnds[2 * v_e + 1];
      let _c792: boolean = ((((b.grid[sp.edgeOf(_t780, _t781)] || -1) === 2) || !(((b.edgeCand(_t780) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t781) >> 1) & 1) !== 0));
      if (!_c792) {
        let _c791: boolean = ((b.grid[sp.edgeOf(_t780, _t781)] || -1) !== 1);
        if (_c791) {
          let _g782 = 0;
          G783: {
            const _a784 = sp.adj4[_t780];
            for (let _i785 = 0; _i785 < _a784.length; _i785++) {
              if (!(((b.grid[sp.adj4Edges[_t780][_i785]] || -1) === 1))) continue;
              _g782++;
            }
          }
          let _c790: boolean = ((_g782 + (_k770[_t780] ?? exits(sp, cl, _t780))) === 2);
          if (!_c790) {
            let _g786 = 0;
            G787: {
              const _a788 = sp.adj4[_t781];
              for (let _i789 = 0; _i789 < _a788.length; _i789++) {
                if (!(((b.grid[sp.adj4Edges[_t781][_i789]] || -1) === 1))) continue;
                _g786++;
              }
            }
            _c790 = ((_g786 + (_k770[_t781] ?? exits(sp, cl, _t781))) === 2);
          }
          _c791 = _c790;
        }
        _c792 = _c791;
      }
      _c793 = !(_c792);
    }
    if (!(_c793)) continue;
    const v_G = _eg794.of(sp.edgeEnds[2 * v_e]);
    L795: {
      const v_H = _eg794.of(sp.edgeEnds[2 * v_e + 1]);
      let _c798: boolean = !(_eg794.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c798) {
        let _q796 = false;
        Q797: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg794.of(cl.end.at[v_q]) === v_G)) {
              _q796 = true;
              break Q797;
            }
          }
        }
        _c798 = _q796;
      }
      let _c801: boolean = _c798;
      if (_c801) {
        let _q799 = false;
        Q800: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg794.of(cl.end.at[v_q]) === v_H)) {
              _q799 = true;
              break Q800;
            }
          }
        }
        _c801 = _q799;
      }
      let _c811: boolean = _c801;
      if (_c811) {
        let _q802 = false;
        Q803: {
          const _a804 = sp.lines;
          for (let _i805 = 0; _i805 < _a804.length; _i805++) {
            const v_L = _a804[_i805];
            const _h810 = clueAt(cl.count, v_L);
            let _g806 = 0;
            G807: {
              const _a808 = sp.lineCells[v_L];
              for (let _i809 = 0; _i809 < _a808.length; _i809++) {
                const v_c = _a808[_i809];
                if (!(((_eg794.of(v_c) === v_G) || (_eg794.of(v_c) === v_H)))) continue;
                _g806++;
              }
            }
            if ((_g806 < _h810)) {
              _q802 = true;
              break Q803;
            }
          }
        }
        _c811 = _q802;
      }
      if (!(_c811)) break L795;
      if (b.made[0] !== _m159_0 || b.made[1] !== _m162_1 || b.made[2] !== _m162_2) {
        _g812.length = 0;
        G813: {
          const _a816 = sp.edges;
          for (let _i817 = 0; _i817 < _a816.length; _i817++) {
            const v_e = _a816[_i817];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g812.push(v_e);
          }
        }
        if (!(sameSet(v_R, _g812))) { return fired; }
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
  const _g900: number[] = [];
  const _g927: number[] = [];
  const _g957: number[] = [];
  const facts = looseEndFacts;
  let fired = 0;
  let changed = false;
  const _k914 = exitsKept.board(cl);
  if (looseEndCands.length < sp.edges.length) looseEndCands = new Int32Array(sp.edges.length);
  const cands = looseEndCands;
  cands.fill(-1);
  crossableMarkedKept.clear();
  const _a898 = sp.lines;
  for (let _i899 = 0; _i899 < _a898.length; _i899++) {
    const v_L = _a898[_i899];
    const _h916 = clueAt(cl.count, v_L);
    const _h948 = (sp.rows.includes(v_L));
    _g900.length = 0;
    G901: {
      const _a908 = sp.lineCells[v_L];
      for (let _i909 = 0; _i909 < _a908.length; _i909++) {
        const v_c = _a908[_i909];
        let _g910 = 0;
        G911: {
          const _a912 = sp.adj4[v_c];
          for (let _i913 = 0; _i913 < _a912.length; _i913++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i913]] || -1) === 1))) continue;
            _g910++;
          }
        }
        if (!(((_g910 + (_k914[v_c] ?? exits(sp, cl, v_c))) === 2))) continue;
        _g900.push(v_c);
      }
    }
    L915: {
      const v_F = _g900;
      const _h917 = v_F.length;
      let _c926: boolean = ((_h916 - _h917) === 2);
      if (_c926) {
        let _q918 = true;
        Q919: {
          const _a920 = sp.lineCells[v_L];
          for (let _i921 = 0; _i921 < _a920.length; _i921++) {
            const v_c = _a920[_i921];
            let _g922 = 0;
            G923: {
              const _a924 = sp.adj4[v_c];
              for (let _i925 = 0; _i925 < _a924.length; _i925++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i925]] || -1) === 1))) continue;
                _g922++;
              }
            }
            if (!(((_g922 + (_k914[v_c] ?? exits(sp, cl, v_c))) !== 2))) continue;
            if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
              _q918 = false;
              break Q919;
            }
          }
        }
        _c926 = _q918;
      }
      if (!(_c926)) break L915;
      _g927.length = 0;
      G928: {
        const _a941 = sp.lineCells[v_L];
        for (let _i942 = 0; _i942 < _a941.length; _i942++) {
          const v_c = _a941[_i942];
          const _h947 = clueAt(cl.end, v_c);
          let _g943 = 0;
          G944: {
            const _a945 = sp.adj4[v_c];
            for (let _i946 = 0; _i946 < _a945.length; _i946++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i946]] || -1) === 1))) continue;
              _g943++;
            }
          }
          let _c954: boolean = ((_g943 + (_k914[v_c] ?? exits(sp, cl, v_c))) === 1);
          if (_c954) {
            let _c953: boolean = ((_h947 >= 1) && ((_h947 >= 3) === _h948));
            if (!_c953) {
              let _q949 = false;
              Q950: {
                const _a951 = sp.adj4[v_c];
                for (let _i952 = 0; _i952 < _a951.length; _i952++) {
                  const v_y = _a951[_i952];
                  if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_c][_i952]] || -1) === 1)) {
                    _q949 = true;
                    break Q950;
                  }
                }
              }
              _c953 = _q949;
            }
            _c954 = _c953;
          }
          if (!(_c954)) continue;
          _g927.push(v_c);
        }
      }
      L955: {
        const v_P = _g927;
        const _h956 = v_P.length;
        if (!((_h956 === 1))) break L955;
        const v_p = (v_P[0] ?? -1);
        _g957.length = 0;
        G958: {
          const _a961 = sp.adj4[v_p];
          for (let _i962 = 0; _i962 < _a961.length; _i962++) {
            const v_y = _a961[_i962];
            if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i962]] || -1) !== 1)))) continue;
            _g957.push(v_y);
          }
        }
        const v_Q = _g957;
        const _h963 = v_Q.length;
        facts.length = 0;
        changed = false;
        let _c969: boolean = (_h963 === 1);
        if (_c969) {
          let _q964 = true;
          Q965: {
            const _a966 = v_Q;
            for (let _i967 = 0; _i967 < _a966.length; _i967++) {
              const v_y = _a966[_i967];
              const _t968 = sp.edgeOf(v_p, v_y);
              if (!(b.grid[_t968] !== 0)) { if (fire === null) { b.placeAt(_t968, 1); changed = true; } else facts.push(PLACE, _t968, 1); }
              if (!(true)) {
                _q964 = false;
                break Q965;
              }
            }
          }
          _c969 = _q964;
        }
        if (!(_c969)) return -1;
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
  const _g1077: number[] = [];
  const _g1115: number[] = [];
  const _g1164: number[] = [];
  const facts = sharedFateFacts;
  let fired = 0;
  let changed = false;
  const _k1093 = exitsKept.board(cl);
  if (sharedFateCands.length < sp.edges.length) sharedFateCands = new Int32Array(sp.edges.length);
  const cands = sharedFateCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a1058 = sp.lines;
  R1:
  for (let _i1059 = 0; _i1059 < _a1058.length; _i1059++) {
    const v_L = _a1058[_i1059];
    const _m239_0 = b.made[0];
    const _m239_1 = b.made[1];
    const _m239_2 = b.made[2];
    const _h1060 = clueAt(cl.count, v_L);
    if (!(((_h1060 - laidMarked(b, sp, cl, cands, v_L)) === 1))) continue;
    _g1077.length = 0;
    G1078: {
      const _a1086 = sp.lineCells[v_L];
      for (let _i1087 = 0; _i1087 < _a1086.length; _i1087++) {
        const v_c = _a1086[_i1087];
        let _c1094: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1094) {
          let _g1088 = 0;
          G1089: {
            const _a1090 = sp.adj4[v_c];
            for (let _i1091 = 0; _i1091 < _a1090.length; _i1091++) {
              const _h1092 = (b.grid[sp.adj4Edges[v_c][_i1091]] || -1);
              if (!((_h1092 === 1))) continue;
              _g1088++;
            }
          }
          _c1094 = ((_g1088 + (_k1093[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1094) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1077.push(v_c);
      }
    }
    const _a1095 = _g1077;
    R2:
    for (let _i1096 = 0; _i1096 < _a1095.length; _i1096++) {
      const v_p = _a1095[_i1096];
      const _a1097 = sp.adj4[v_p];
      for (let _i1098 = 0; _i1098 < _a1097.length; _i1098++) {
        const v_q = _a1097[_i1098];
        _g1115.length = 0;
        G1116: {
          const _a1124 = sp.lineCells[v_L];
          for (let _i1125 = 0; _i1125 < _a1124.length; _i1125++) {
            const v_c = _a1124[_i1125];
            let _c1131: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1131) {
              let _g1126 = 0;
              G1127: {
                const _a1128 = sp.adj4[v_c];
                for (let _i1129 = 0; _i1129 < _a1128.length; _i1129++) {
                  const _h1130 = (b.grid[sp.adj4Edges[v_c][_i1129]] || -1);
                  if (!((_h1130 === 1))) continue;
                  _g1126++;
                }
              }
              _c1131 = ((_g1126 + (_k1093[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1131) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1115.push(v_c);
          }
        }
        let _c1147: boolean = (_g1115.includes(v_q));
        if (_c1147) {
          let _g1132 = 0;
          G1133: {
            const _a1134 = sp.adj4[v_p];
            for (let _i1135 = 0; _i1135 < _a1134.length; _i1135++) {
              const v_y = _a1134[_i1135];
              const _h1136 = (b.grid[sp.adj4Edges[v_p][_i1135]] || -1);
              let _c1146: boolean = (v_y !== v_q);
              if (_c1146) {
                let _c1145: boolean = (((_h1136 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1145) {
                  let _c1144: boolean = (_h1136 !== 1);
                  if (_c1144) {
                    let _c1143: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1143) {
                      let _g1137 = 0;
                      G1138: {
                        const _a1140 = sp.adj4[v_y];
                        for (let _i1141 = 0; _i1141 < _a1140.length; _i1141++) {
                          const _h1142 = (b.grid[sp.adj4Edges[v_y][_i1141]] || -1);
                          if (!((_h1142 === 1))) continue;
                          _g1137++;
                        }
                      }
                      _c1143 = ((_g1137 + (_k1093[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1144 = _c1143;
                  }
                  _c1145 = _c1144;
                }
                _c1146 = !(_c1145);
              }
              if (!(_c1146)) continue;
              _g1132++;
            }
          }
          _c1147 = (_g1132 < 2);
        }
        if (!(_c1147)) continue;
        if (b.made[0] !== _m239_0 || b.made[1] !== _m239_1 || b.made[2] !== _m239_2) {
          if (!(((clueAt(cl.count, v_L) - laidMarked(b, sp, cl, cands, v_L)) === 1))) { continue R1; }
          _g1164.length = 0;
          G1165: {
            const _a1173 = sp.lineCells[v_L];
            for (let _i1174 = 0; _i1174 < _a1173.length; _i1174++) {
              const v_c = _a1173[_i1174];
              let _c1179: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1179) {
                let _g1175 = 0;
                G1176: {
                  const _a1177 = sp.adj4[v_c];
                  for (let _i1178 = 0; _i1178 < _a1177.length; _i1178++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1178]] || -1) === 1))) continue;
                    _g1175++;
                  }
                }
                _c1179 = ((_g1175 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1179) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1164.push(v_c);
            }
          }
          if (!((_g1164.includes(v_p)))) { continue R2; }
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
  const _g1295: number[] = [];
  const _g1333: number[] = [];
  const _g1386: number[] = [];
  const facts = sharedFateEmptiesFacts;
  let fired = 0;
  let changed = false;
  const _k1311 = exitsKept.board(cl);
  const _a1272 = sp.lines;
  R1:
  for (let _i1273 = 0; _i1273 < _a1272.length; _i1273++) {
    const v_L = _a1272[_i1273];
    const _m268_2 = b.made[2];
    const _h1274 = clueAt(cl.count, v_L);
    let _g1275 = 0;
    G1276: {
      const _a1277 = sp.lineCells[v_L];
      for (let _i1278 = 0; _i1278 < _a1277.length; _i1278++) {
        const v_c = _a1277[_i1278];
        if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
        _g1275++;
      }
    }
    if (!((((sp.lineCells[v_L].length - _h1274) - _g1275) === 1))) continue;
    const _m273_0 = b.made[0];
    _g1295.length = 0;
    G1296: {
      const _a1304 = sp.lineCells[v_L];
      for (let _i1305 = 0; _i1305 < _a1304.length; _i1305++) {
        const v_c = _a1304[_i1305];
        let _c1312: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1312) {
          let _g1306 = 0;
          G1307: {
            const _a1308 = sp.adj4[v_c];
            for (let _i1309 = 0; _i1309 < _a1308.length; _i1309++) {
              const _h1310 = (b.grid[sp.adj4Edges[v_c][_i1309]] || -1);
              if (!((_h1310 === 1))) continue;
              _g1306++;
            }
          }
          _c1312 = ((_g1306 + (_k1311[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1312) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1295.push(v_c);
      }
    }
    const _a1313 = _g1295;
    R2:
    for (let _i1314 = 0; _i1314 < _a1313.length; _i1314++) {
      const v_p = _a1313[_i1314];
      const _a1315 = sp.adj4[v_p];
      for (let _i1316 = 0; _i1316 < _a1315.length; _i1316++) {
        const v_q = _a1315[_i1316];
        _g1333.length = 0;
        G1334: {
          const _a1342 = sp.lineCells[v_L];
          for (let _i1343 = 0; _i1343 < _a1342.length; _i1343++) {
            const v_c = _a1342[_i1343];
            let _c1349: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1349) {
              let _g1344 = 0;
              G1345: {
                const _a1346 = sp.adj4[v_c];
                for (let _i1347 = 0; _i1347 < _a1346.length; _i1347++) {
                  const _h1348 = (b.grid[sp.adj4Edges[v_c][_i1347]] || -1);
                  if (!((_h1348 === 1))) continue;
                  _g1344++;
                }
              }
              _c1349 = ((_g1344 + (_k1311[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1349) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1333.push(v_c);
          }
        }
        let _c1365: boolean = (_g1333.includes(v_q));
        if (_c1365) {
          let _g1350 = 0;
          G1351: {
            const _a1352 = sp.adj4[v_p];
            for (let _i1353 = 0; _i1353 < _a1352.length; _i1353++) {
              const v_y = _a1352[_i1353];
              const _h1354 = (b.grid[sp.adj4Edges[v_p][_i1353]] || -1);
              let _c1364: boolean = (v_y !== v_q);
              if (_c1364) {
                let _c1363: boolean = (((_h1354 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1363) {
                  let _c1362: boolean = (_h1354 !== 1);
                  if (_c1362) {
                    let _c1361: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1361) {
                      let _g1355 = 0;
                      G1356: {
                        const _a1358 = sp.adj4[v_y];
                        for (let _i1359 = 0; _i1359 < _a1358.length; _i1359++) {
                          const _h1360 = (b.grid[sp.adj4Edges[v_y][_i1359]] || -1);
                          if (!((_h1360 === 1))) continue;
                          _g1355++;
                        }
                      }
                      _c1361 = ((_g1355 + (_k1311[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1362 = _c1361;
                  }
                  _c1363 = _c1362;
                }
                _c1364 = !(_c1363);
              }
              if (!(_c1364)) continue;
              _g1350++;
            }
          }
          _c1365 = (_g1350 < 2);
        }
        if (!(_c1365)) continue;
        if (b.made[0] !== _m273_0 || b.made[2] !== _m268_2) {
          let _g1366 = 0;
          G1367: {
            const _a1368 = sp.lineCells[v_L];
            for (let _i1369 = 0; _i1369 < _a1368.length; _i1369++) {
              const v_c = _a1368[_i1369];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g1366++;
            }
          }
          if (!((((sp.lineCells[v_L].length - clueAt(cl.count, v_L)) - _g1366) === 1))) { continue R1; }
          _g1386.length = 0;
          G1387: {
            const _a1395 = sp.lineCells[v_L];
            for (let _i1396 = 0; _i1396 < _a1395.length; _i1396++) {
              const v_c = _a1395[_i1396];
              let _c1401: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1401) {
                let _g1397 = 0;
                G1398: {
                  const _a1399 = sp.adj4[v_c];
                  for (let _i1400 = 0; _i1400 < _a1399.length; _i1400++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1400]] || -1) === 1))) continue;
                    _g1397++;
                  }
                }
                _c1401 = ((_g1397 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1401) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1386.push(v_c);
            }
          }
          if (!((_g1386.includes(v_p)))) { continue R2; }
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
  const _g1446: number[] = [];
  const _g1491: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _k1472 = exitsKept.board(cl);
  const _m298_0 = b.made[0];
  const _m298_2 = b.made[2];
  _g1446.length = 0;
  G1447: {
    const _a1464 = sp.edges;
    for (let _i1465 = 0; _i1465 < _a1464.length; _i1465++) {
      const v_x = _a1464[_i1465];
      let _c1480: boolean = !((b.grid[v_x] !== 0));
      if (_c1480) {
        const _t1466 = sp.edgeEnds[2 * v_x];
        const _t1467 = sp.edgeEnds[2 * v_x + 1];
        let _c1479: boolean = ((((b.grid[sp.edgeOf(_t1466, _t1467)] || -1) === 2) || !(((b.edgeCand(_t1466) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1467) >> 1) & 1) !== 0));
        if (!_c1479) {
          let _c1478: boolean = ((b.grid[sp.edgeOf(_t1466, _t1467)] || -1) !== 1);
          if (_c1478) {
            let _g1468 = 0;
            G1469: {
              const _a1470 = sp.adj4[_t1466];
              for (let _i1471 = 0; _i1471 < _a1470.length; _i1471++) {
                if (!(((b.grid[sp.adj4Edges[_t1466][_i1471]] || -1) === 1))) continue;
                _g1468++;
              }
            }
            let _c1477: boolean = ((_g1468 + (_k1472[_t1466] ?? exits(sp, cl, _t1466))) === 2);
            if (!_c1477) {
              let _g1473 = 0;
              G1474: {
                const _a1475 = sp.adj4[_t1467];
                for (let _i1476 = 0; _i1476 < _a1475.length; _i1476++) {
                  if (!(((b.grid[sp.adj4Edges[_t1467][_i1476]] || -1) === 1))) continue;
                  _g1473++;
                }
              }
              _c1477 = ((_g1473 + (_k1472[_t1467] ?? exits(sp, cl, _t1467))) === 2);
            }
            _c1478 = _c1477;
          }
          _c1479 = _c1478;
        }
        _c1480 = !(_c1479);
      }
      if (!(_c1480)) continue;
      _g1446.push(v_x);
    }
  }
  const v_O = _g1446;
  const _a1481 = cutEdges(sp, v_O);
  for (let _i1482 = 0; _i1482 < _a1481.length; _i1482++) {
    const v_e = _a1481[_i1482];
    const v_G = through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)));
    let _g1483 = 0;
    G1484: {
      const _a1485 = v_G;
      for (let _i1486 = 0; _i1486 < _a1485.length; _i1486++) {
        const v_c = _a1485[_i1486];
        let _g1487 = 0;
        G1488: {
          const _a1489 = sp.adj4[v_c];
          for (let _i1490 = 0; _i1490 < _a1489.length; _i1490++) {
            const v_y = _a1489[_i1490];
            if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i1490]] || -1) === 1)))) continue;
            _g1487++;
          }
        }
        _g1483 += (_g1487 + (_k1472[v_c] ?? exits(sp, cl, v_c)));
      }
    }
    const v_k = _g1483;
    if (b.made[0] !== _m298_0 || b.made[2] !== _m298_2) {
      _g1491.length = 0;
      G1492: {
        const _a1509 = sp.edges;
        for (let _i1510 = 0; _i1510 < _a1509.length; _i1510++) {
          const v_x = _a1509[_i1510];
          let _c1524: boolean = !((b.grid[v_x] !== 0));
          if (_c1524) {
            const _t1511 = sp.edgeEnds[2 * v_x];
            const _t1512 = sp.edgeEnds[2 * v_x + 1];
            let _c1523: boolean = ((((b.grid[sp.edgeOf(_t1511, _t1512)] || -1) === 2) || !(((b.edgeCand(_t1511) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1512) >> 1) & 1) !== 0));
            if (!_c1523) {
              let _c1522: boolean = ((b.grid[sp.edgeOf(_t1511, _t1512)] || -1) !== 1);
              if (_c1522) {
                let _g1513 = 0;
                G1514: {
                  const _a1515 = sp.adj4[_t1511];
                  for (let _i1516 = 0; _i1516 < _a1515.length; _i1516++) {
                    if (!(((b.grid[sp.adj4Edges[_t1511][_i1516]] || -1) === 1))) continue;
                    _g1513++;
                  }
                }
                let _c1521: boolean = ((_g1513 + exits(sp, cl, _t1511)) === 2);
                if (!_c1521) {
                  let _g1517 = 0;
                  G1518: {
                    const _a1519 = sp.adj4[_t1512];
                    for (let _i1520 = 0; _i1520 < _a1519.length; _i1520++) {
                      if (!(((b.grid[sp.adj4Edges[_t1512][_i1520]] || -1) === 1))) continue;
                      _g1517++;
                    }
                  }
                  _c1521 = ((_g1517 + exits(sp, cl, _t1512)) === 2);
                }
                _c1522 = _c1521;
              }
              _c1523 = _c1522;
            }
            _c1524 = !(_c1523);
          }
          if (!(_c1524)) continue;
          _g1491.push(v_x);
        }
      }
      if (!(sameSet(v_O, _g1491))) { return fired; }
    }
    facts.length = 0;
    changed = false;
    let _c1525: boolean = !(((v_k % 2) === 1));
    if (!_c1525) {
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      _c1525 = true;
    }
    let _c1527: boolean = _c1525;
    if (_c1527) {
      let _c1526: boolean = !(((v_k % 2) === 0));
      if (!_c1526) {
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        _c1526 = true;
      }
      _c1527 = _c1526;
    }
    if (!(_c1527)) return -1;
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
  let _q843 = true;
  Q844: {
    const _a845 = sp.adj4[v_c];
    for (let _i846 = 0; _i846 < _a845.length; _i846++) {
      const v_y = _a845[_i846];
      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
      let _c858: boolean = ((((b.grid[sp.adj4Edges[v_c][_i846]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
      if (!_c858) {
        let _c857: boolean = ((b.grid[sp.adj4Edges[v_c][_i846]] || -1) !== 1);
        if (_c857) {
          let _g847 = 0;
          G848: {
            const _a849 = sp.adj4[v_c];
            for (let _i850 = 0; _i850 < _a849.length; _i850++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i850]] || -1) === 1))) continue;
              _g847++;
            }
          }
          let _c856: boolean = ((_g847 + exits(sp, cl, v_c)) === 2);
          if (!_c856) {
            let _g851 = 0;
            G852: {
              const _a854 = sp.adj4[v_y];
              for (let _i855 = 0; _i855 < _a854.length; _i855++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i855]] || -1) === 1))) continue;
                _g851++;
              }
            }
            _c856 = ((_g851 + exits(sp, cl, v_y)) === 2);
          }
          _c857 = _c856;
        }
        _c858 = _c857;
      }
      if (!(!(_c858))) {
        _q843 = false;
        break Q844;
      }
    }
  }
  let _c863: boolean = _q843;
  if (_c863) {
    let _g859 = 0;
    G860: {
      const _a861 = sp.adj4[v_c];
      for (let _i862 = 0; _i862 < _a861.length; _i862++) {
        const v_y = _a861[_i862];
        if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
        _g859++;
      }
    }
    _c863 = ((_g859 === 2) || ((clueAt(cl.end, v_c) >= 1) && !(((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L)))))));
  }
  const _made = _c863;
  crossableMarkedKept.set((v_c + 1) * 1048577 + (v_L + 1), _made);
  return _made;
}
