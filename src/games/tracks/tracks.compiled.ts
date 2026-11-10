// Compiled by `npm run describe` from src/games/tracks/tracks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, cutEdges, edgeGroups, freshBinding, keptEdgeGroups, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, step, through, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g2153: number[] = [];
  const _domain = rangeMask(1, 2);
  const _k2142 = exitsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q2133 = true;
  Q2134: {
    const _a2135 = sp.cells;
    for (let _i2136 = 0; _i2136 < _a2135.length; _i2136++) {
      const v_c = _a2135[_i2136];
      let _g2137 = 0;
      G2138: {
        const _a2139 = sp.adj4[v_c];
        for (let _i2140 = 0; _i2140 < _a2139.length; _i2140++) {
          const _h2141 = (g[sp.adj4Edges[v_c][_i2140]] || -1);
          if (!((_h2141 === 1))) continue;
          _g2137++;
        }
      }
      let _c2148: boolean = ((_g2137 + (_k2142[v_c] ?? exits(sp, cl, v_c))) === 0);
      if (!_c2148) {
        let _g2143 = 0;
        G2144: {
          const _a2145 = sp.adj4[v_c];
          for (let _i2146 = 0; _i2146 < _a2145.length; _i2146++) {
            const _h2147 = (g[sp.adj4Edges[v_c][_i2146]] || -1);
            if (!((_h2147 === 1))) continue;
            _g2143++;
          }
        }
        _c2148 = ((_g2143 + (_k2142[v_c] ?? exits(sp, cl, v_c))) === 2);
      }
      if (!(_c2148)) {
        _q2133 = false;
        break Q2134;
      }
    }
  }
  if (!(_q2133)) return false;
  let _g2149 = 0;
  G2150: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      _g2149++;
    }
  }
  if (!((_g2149 === 2))) return false;
  let _q2151 = true;
  Q2152: {
    _g2153.length = 0;
    G2154: {
      const _a2157 = sp.edges;
      for (let _i2158 = 0; _i2158 < _a2157.length; _i2158++) {
        const v_e = _a2157[_i2158];
        const _h2159 = (g[v_e] || -1);
        if (!((_h2159 === 1))) continue;
        _g2153.push(v_e);
      }
    }
    const v_R = _g2153;
    const _eg2174 = edgeGroups(sp, v_R);
    const _a2160 = sp.cells;
    for (let _i2161 = 0; _i2161 < _a2160.length; _i2161++) {
      const v_a = _a2160[_i2161];
      let _g2162 = 0;
      G2163: {
        const _a2164 = sp.adj4[v_a];
        for (let _i2165 = 0; _i2165 < _a2164.length; _i2165++) {
          const _h2166 = (g[sp.adj4Edges[v_a][_i2165]] || -1);
          if (!((_h2166 === 1))) continue;
          _g2162++;
        }
      }
      if (!(((_g2162 + (_k2142[v_a] ?? exits(sp, cl, v_a))) > 0))) continue;
      const _a2167 = sp.cells;
      for (let _i2168 = 0; _i2168 < _a2167.length; _i2168++) {
        const v_b = _a2167[_i2168];
        let _g2169 = 0;
        G2170: {
          const _a2171 = sp.adj4[v_b];
          for (let _i2172 = 0; _i2172 < _a2171.length; _i2172++) {
            const _h2173 = (g[sp.adj4Edges[v_b][_i2172]] || -1);
            if (!((_h2173 === 1))) continue;
            _g2169++;
          }
        }
        if (!(((_g2169 + (_k2142[v_b] ?? exits(sp, cl, v_b))) > 0))) continue;
        if (!((_eg2174.of(v_b) === _eg2174.of(v_a)))) {
          _q2151 = false;
          break Q2152;
        }
      }
    }
  }
  if (!(_q2151)) return false;
  for (let _k2175 = 0; _k2175 < cl.count.at.length; _k2175++) {
    const _at2176 = cl.count.at[_k2175];
    const _v2177 = cl.count.v[_k2175];
    let _g2178 = 0;
    G2179: {
      const _a2180 = sp.lineCells[_at2176];
      for (let _i2181 = 0; _i2181 < _a2180.length; _i2181++) {
        const v_c = _a2180[_i2181];
        let _g2182 = 0;
        G2183: {
          const _a2184 = sp.adj4[v_c];
          for (let _i2185 = 0; _i2185 < _a2184.length; _i2185++) {
            const _h2186 = (g[sp.adj4Edges[v_c][_i2185]] || -1);
            if (!((_h2186 === 1))) continue;
            _g2182++;
          }
        }
        if (!(((_g2182 + (_k2142[v_c] ?? exits(sp, cl, v_c))) > 0))) continue;
        _g2178++;
      }
    }
    if (!((_g2178 === _v2177))) return false;
  }
  for (let _k2187 = 0; _k2187 < cl.end.at.length; _k2187++) {
    const _at2188 = cl.end.at[_k2187];
    const _v2189 = cl.end.v[_k2187];
    let _g2190 = 0;
    G2191: {
      const _a2192 = sp.adj4[_at2188];
      for (let _i2193 = 0; _i2193 < _a2192.length; _i2193++) {
        const _h2194 = (g[sp.adj4Edges[_at2188][_i2193]] || -1);
        if (!((_h2194 === 1))) continue;
        _g2190++;
      }
    }
    if (!((((_g2190 + (_k2142[_at2188] ?? exits(sp, cl, _at2188))) === 2) && (step(sp, _at2188, _v2189) === -1)))) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      let _c217: boolean = !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0));
      if (_c217) {
        const _g181: number[] = [];
        G182: {
          const _a198 = sp.adj4[v_c];
          for (let _i199 = 0; _i199 < _a198.length; _i199++) {
            const v_y = _a198[_i199];
            let _c212: boolean = ((b.grid[sp.adj4Edges[v_c][_i199]] || -1) !== 1);
            if (_c212) {
              let _c211: boolean = ((((b.grid[sp.adj4Edges[v_c][_i199]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
              if (!_c211) {
                let _c210: boolean = ((b.grid[sp.adj4Edges[v_c][_i199]] || -1) !== 1);
                if (_c210) {
                  let _g200 = 0;
                  G201: {
                    const _a202 = sp.adj4[v_c];
                    for (let _i203 = 0; _i203 < _a202.length; _i203++) {
                      if (!(((b.grid[sp.adj4Edges[v_c][_i203]] || -1) === 1))) continue;
                      _g200++;
                    }
                  }
                  let _c209: boolean = ((_g200 + exits(sp, cl, v_c)) === 2);
                  if (!_c209) {
                    let _g204 = 0;
                    G205: {
                      const _a207 = sp.adj4[v_y];
                      for (let _i208 = 0; _i208 < _a207.length; _i208++) {
                        if (!(((b.grid[sp.adj4Edges[v_y][_i208]] || -1) === 1))) continue;
                        _g204++;
                      }
                    }
                    _c209 = ((_g204 + exits(sp, cl, v_y)) === 2);
                  }
                  _c210 = _c209;
                }
                _c211 = _c210;
              }
              _c212 = !(_c211);
            }
            if (!(_c212)) continue;
            _g181.push(v_y);
          }
        }
        let _g213 = 0;
        G214: {
          const _a215 = sp.adj4[v_c];
          for (let _i216 = 0; _i216 < _a215.length; _i216++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i216]] || -1) === 1))) continue;
            _g213++;
          }
        }
        _c217 = ((_g181.length + (_g213 + exits(sp, cl, v_c))) < 2);
      }
      freshBinding("oneWayIn", [(sp.cells.includes(v_c)), _c217], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c223: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c223) {
      let _g218 = 0;
      G219: {
        const _a220 = sp.adj4[v_c];
        for (let _i221 = 0; _i221 < _a220.length; _i221++) {
          const _h222 = (b.grid[sp.adj4Edges[v_c][_i221]] || -1);
          if (!((_h222 === 1))) continue;
          _g218++;
        }
      }
      _c223 = ((_g218 + (_k138[v_c] ?? exits(sp, cl, v_c))) > 0);
    }
    let _c224: boolean = !(_c223);
    if (_c224) {
      if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
      _c224 = true;
    }
    if (!(_c224)) return -1;
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
  const _g352: number[] = [];
  const facts = bothSidesLeftFacts;
  let fired = 0;
  let changed = false;
  const _k313 = exitsKept.board(cl);
  const _a307 = sp.cells;
  for (let _i308 = 0; _i308 < _a307.length; _i308++) {
    const v_c = _a307[_i308];
    let _c314: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c314) {
      let _g309 = 0;
      G310: {
        const _a311 = sp.adj4[v_c];
        for (let _i312 = 0; _i312 < _a311.length; _i312++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i312]] || -1) === 1))) continue;
          _g309++;
        }
      }
      _c314 = ((_g309 + (_k313[v_c] ?? exits(sp, cl, v_c))) > 0);
    }
    let _c319: boolean = _c314;
    if (_c319) {
      let _g315 = 0;
      G316: {
        const _a317 = sp.adj4[v_c];
        for (let _i318 = 0; _i318 < _a317.length; _i318++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i318]] || -1) === 1))) continue;
          _g315++;
        }
      }
      _c319 = ((_g315 + (_k313[v_c] ?? exits(sp, cl, v_c))) < 2);
    }
    if (!(_c319)) continue;
    _g352.length = 0;
    G353: {
      const _a369 = sp.adj4[v_c];
      for (let _i370 = 0; _i370 < _a369.length; _i370++) {
        const v_y = _a369[_i370];
        let _c379: boolean = ((b.grid[sp.adj4Edges[v_c][_i370]] || -1) !== 1);
        if (_c379) {
          let _c378: boolean = ((((b.grid[sp.adj4Edges[v_c][_i370]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
          if (!_c378) {
            let _c377: boolean = ((b.grid[sp.adj4Edges[v_c][_i370]] || -1) !== 1);
            if (_c377) {
              let _c376: boolean = (drawn(b, sp, cl, v_c) === 2);
              if (!_c376) {
                let _g371 = 0;
                G372: {
                  const _a374 = sp.adj4[v_y];
                  for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                    if (!(((b.grid[sp.adj4Edges[v_y][_i375]] || -1) === 1))) continue;
                    _g371++;
                  }
                }
                _c376 = ((_g371 + (_k313[v_y] ?? exits(sp, cl, v_y))) === 2);
              }
              _c377 = _c376;
            }
            _c378 = _c377;
          }
          _c379 = !(_c378);
        }
        if (!(_c379)) continue;
        _g352.push(v_y);
      }
    }
    L380: {
      const v_F = _g352;
      const _h381 = v_F.length;
      let _c386: boolean = (_h381 > 0);
      if (_c386) {
        let _g382 = 0;
        G383: {
          const _a384 = sp.adj4[v_c];
          for (let _i385 = 0; _i385 < _a384.length; _i385++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i385]] || -1) === 1))) continue;
            _g382++;
          }
        }
        _c386 = ((_h381 + (_g382 + (_k313[v_c] ?? exits(sp, cl, v_c)))) <= 2);
      }
      if (!(_c386)) break L380;
      if (import.meta.env.DEV && staleChecking) {
        let _c391: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c391) {
          let _g387 = 0;
          G388: {
            const _a389 = sp.adj4[v_c];
            for (let _i390 = 0; _i390 < _a389.length; _i390++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i390]] || -1) === 1))) continue;
              _g387++;
            }
          }
          _c391 = ((_g387 + exits(sp, cl, v_c)) > 0);
        }
        let _c396: boolean = _c391;
        if (_c396) {
          let _g392 = 0;
          G393: {
            const _a394 = sp.adj4[v_c];
            for (let _i395 = 0; _i395 < _a394.length; _i395++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i395]] || -1) === 1))) continue;
              _g392++;
            }
          }
          _c396 = ((_g392 + exits(sp, cl, v_c)) < 2);
        }
        const _g429: number[] = [];
        G430: {
          const _a446 = sp.adj4[v_c];
          for (let _i447 = 0; _i447 < _a446.length; _i447++) {
            const v_y = _a446[_i447];
            let _c460: boolean = ((b.grid[sp.adj4Edges[v_c][_i447]] || -1) !== 1);
            if (_c460) {
              let _c459: boolean = ((((b.grid[sp.adj4Edges[v_c][_i447]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
              if (!_c459) {
                let _c458: boolean = ((b.grid[sp.adj4Edges[v_c][_i447]] || -1) !== 1);
                if (_c458) {
                  let _g448 = 0;
                  G449: {
                    const _a450 = sp.adj4[v_c];
                    for (let _i451 = 0; _i451 < _a450.length; _i451++) {
                      if (!(((b.grid[sp.adj4Edges[v_c][_i451]] || -1) === 1))) continue;
                      _g448++;
                    }
                  }
                  let _c457: boolean = ((_g448 + exits(sp, cl, v_c)) === 2);
                  if (!_c457) {
                    let _g452 = 0;
                    G453: {
                      const _a455 = sp.adj4[v_y];
                      for (let _i456 = 0; _i456 < _a455.length; _i456++) {
                        if (!(((b.grid[sp.adj4Edges[v_y][_i456]] || -1) === 1))) continue;
                        _g452++;
                      }
                    }
                    _c457 = ((_g452 + exits(sp, cl, v_y)) === 2);
                  }
                  _c458 = _c457;
                }
                _c459 = _c458;
              }
              _c460 = !(_c459);
            }
            if (!(_c460)) continue;
            _g429.push(v_y);
          }
        }
        let _c465: boolean = (v_F.length > 0);
        if (_c465) {
          let _g461 = 0;
          G462: {
            const _a463 = sp.adj4[v_c];
            for (let _i464 = 0; _i464 < _a463.length; _i464++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i464]] || -1) === 1))) continue;
              _g461++;
            }
          }
          _c465 = ((v_F.length + (_g461 + exits(sp, cl, v_c))) <= 2);
        }
        freshBinding("bothSidesLeft", [(sp.cells.includes(v_c)), _c396, sameSet(v_F, _g429), _c465], ["c in", "where of c", "F =", "where of F"]);
      }
      facts.length = 0;
      changed = false;
      let _g466 = 0;
      G467: {
        const _a468 = sp.adj4[v_c];
        for (let _i469 = 0; _i469 < _a468.length; _i469++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i469]] || -1) === 1))) continue;
          _g466++;
        }
      }
      let _c475: boolean = ((_h381 + (_g466 + (_k313[v_c] ?? exits(sp, cl, v_c)))) === 2);
      if (_c475) {
        let _q470 = true;
        Q471: {
          const _a472 = v_F;
          for (let _i473 = 0; _i473 < _a472.length; _i473++) {
            const v_y = _a472[_i473];
            const _t474 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t474] !== 0)) { if (fire === null) { b.placeAt(_t474, 1); changed = true; } else facts.push(PLACE, _t474, 1); }
            if (!(true)) {
              _q470 = false;
              break Q471;
            }
          }
        }
        _c475 = _q470;
      }
      if (!(_c475)) return -1;
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
  const _g538: number[] = [];
  const facts = clueFullFacts;
  let fired = 0;
  let changed = false;
  const _k554 = exitsKept.board(cl);
  if (clueFullCands.length < sp.edges.length) clueFullCands = new Int32Array(sp.edges.length);
  const cands = clueFullCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a520 = sp.lines;
  for (let _i521 = 0; _i521 < _a520.length; _i521++) {
    const v_L = _a520[_i521];
    const _h558 = clueAt(cl.count, v_L);
    _g538.length = 0;
    G539: {
      const _a547 = sp.lineCells[v_L];
      for (let _i548 = 0; _i548 < _a547.length; _i548++) {
        const v_c = _a547[_i548];
        let _c555: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c555) {
          let _g549 = 0;
          G550: {
            const _a551 = sp.adj4[v_c];
            for (let _i552 = 0; _i552 < _a551.length; _i552++) {
              const _h553 = (b.grid[sp.adj4Edges[v_c][_i552]] || -1);
              if (!((_h553 === 1))) continue;
              _g549++;
            }
          }
          _c555 = ((_g549 + (_k554[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c555) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g538.push(v_c);
      }
    }
    L556: {
      const v_O = _g538;
      const _h557 = v_O.length;
      if (!(((_h557 > 0) && (laidMarked(b, sp, cl, cands, v_L) >= _h558)))) break L556;
      if (import.meta.env.DEV && staleChecking) {
        const _g575: number[] = [];
        G576: {
          const _a584 = sp.lineCells[v_L];
          for (let _i585 = 0; _i585 < _a584.length; _i585++) {
            const v_c = _a584[_i585];
            let _c590: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c590) {
              let _g586 = 0;
              G587: {
                const _a588 = sp.adj4[v_c];
                for (let _i589 = 0; _i589 < _a588.length; _i589++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i589]] || -1) === 1))) continue;
                  _g586++;
                }
              }
              _c590 = ((_g586 + exits(sp, cl, v_c)) > 0);
            }
            if (!((!(_c590) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g575.push(v_c);
          }
        }
        freshBinding("clueFull", [(sp.lines.includes(v_L)), sameSet(v_O, _g575), ((v_O.length > 0) && (laidMarked(b, sp, cl, cands, v_L) >= clueAt(cl.count, v_L)))], ["L in", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c595: boolean = (laidMarked(b, sp, cl, cands, v_L) === _h558);
      if (_c595) {
        let _q591 = true;
        Q592: {
          const _a593 = v_O;
          for (let _i594 = 0; _i594 < _a593.length; _i594++) {
            const v_c = _a593[_i594];
            if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
            if (!(true)) {
              _q591 = false;
              break Q592;
            }
          }
        }
        _c595 = _q591;
      }
      if (!(_c595)) return -1;
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
  const _g654: number[] = [];
  const facts = clueExactFacts;
  let fired = 0;
  let changed = false;
  const _k670 = exitsKept.board(cl);
  const _a636 = sp.lines;
  for (let _i637 = 0; _i637 < _a636.length; _i637++) {
    const v_L = _a636[_i637];
    const _h678 = clueAt(cl.count, v_L);
    _g654.length = 0;
    G655: {
      const _a663 = sp.lineCells[v_L];
      for (let _i664 = 0; _i664 < _a663.length; _i664++) {
        const v_c = _a663[_i664];
        let _c671: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c671) {
          let _g665 = 0;
          G666: {
            const _a667 = sp.adj4[v_c];
            for (let _i668 = 0; _i668 < _a667.length; _i668++) {
              const _h669 = (b.grid[sp.adj4Edges[v_c][_i668]] || -1);
              if (!((_h669 === 1))) continue;
              _g665++;
            }
          }
          _c671 = ((_g665 + (_k670[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c671) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g654.push(v_c);
      }
    }
    L672: {
      const v_O = _g654;
      const _h673 = v_O.length;
      let _c679: boolean = (_h673 > 0);
      if (_c679) {
        let _g674 = 0;
        G675: {
          const _a676 = sp.lineCells[v_L];
          for (let _i677 = 0; _i677 < _a676.length; _i677++) {
            const v_c = _a676[_i677];
            if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
            _g674++;
          }
        }
        _c679 = ((sp.lineCells[v_L].length - _g674) <= _h678);
      }
      if (!(_c679)) break L672;
      if (import.meta.env.DEV && staleChecking) {
        const _g696: number[] = [];
        G697: {
          const _a705 = sp.lineCells[v_L];
          for (let _i706 = 0; _i706 < _a705.length; _i706++) {
            const v_c = _a705[_i706];
            let _c711: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c711) {
              let _g707 = 0;
              G708: {
                const _a709 = sp.adj4[v_c];
                for (let _i710 = 0; _i710 < _a709.length; _i710++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i710]] || -1) === 1))) continue;
                  _g707++;
                }
              }
              _c711 = ((_g707 + exits(sp, cl, v_c)) > 0);
            }
            if (!((!(_c711) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g696.push(v_c);
          }
        }
        let _c716: boolean = (v_O.length > 0);
        if (_c716) {
          let _g712 = 0;
          G713: {
            const _a714 = sp.lineCells[v_L];
            for (let _i715 = 0; _i715 < _a714.length; _i715++) {
              const v_c = _a714[_i715];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g712++;
            }
          }
          _c716 = ((sp.lineCells[v_L].length - _g712) <= clueAt(cl.count, v_L));
        }
        freshBinding("clueExact", [(sp.lines.includes(v_L)), sameSet(v_O, _g696), _c716], ["L in", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _g717 = 0;
      G718: {
        const _a719 = sp.lineCells[v_L];
        for (let _i720 = 0; _i720 < _a719.length; _i720++) {
          const v_c = _a719[_i720];
          if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
          _g717++;
        }
      }
      let _c725: boolean = ((sp.lineCells[v_L].length - _g717) === _h678);
      if (_c725) {
        let _q721 = true;
        Q722: {
          const _a723 = v_O;
          for (let _i724 = 0; _i724 < _a723.length; _i724++) {
            const v_c = _a723[_i724];
            if ((b.edgeCand(v_c) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 2); changed = true; } else facts.push(STRIKE_EDGE, v_c, 2); }
            if (!(true)) {
              _q721 = false;
              break Q722;
            }
          }
        }
        _c725 = _q721;
      }
      if (!(_c725)) return -1;
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
  const _g763: number[] = [];
  const facts = closeLoopFacts;
  let fired = 0;
  let changed = false;
  const _k776 = exitsKept.board(cl);
  const _m89_0 = b.made[0];
  _g763.length = 0;
  G764: {
    const _a767 = sp.edges;
    for (let _i768 = 0; _i768 < _a767.length; _i768++) {
      const v_e = _a767[_i768];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g763.push(v_e);
    }
  }
  const v_R = _g763;
  const _m92_1 = b.made[1];
  const _m92_2 = b.made[2];
  const _eg800 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a769 = sp.edges;
  R1:
  for (let _i770 = 0; _i770 < _a769.length; _i770++) {
    const v_e = _a769[_i770];
    let _c778: boolean = !((b.grid[v_e] !== 0));
    if (_c778) {
      const _t771 = sp.edgeEnds[2 * v_e];
      let _c777: boolean = !(((b.edgeCand(_t771) >> 2) & 1) !== 0);
      if (!_c777) {
        let _g772 = 0;
        G773: {
          const _a774 = sp.adj4[_t771];
          for (let _i775 = 0; _i775 < _a774.length; _i775++) {
            if (!(((b.grid[sp.adj4Edges[_t771][_i775]] || -1) === 1))) continue;
            _g772++;
          }
        }
        _c777 = ((_g772 + (_k776[_t771] ?? exits(sp, cl, _t771))) > 0);
      }
      _c778 = _c777;
    }
    let _c785: boolean = _c778;
    if (_c785) {
      const _t779 = sp.edgeEnds[2 * v_e + 1];
      let _c784: boolean = !(((b.edgeCand(_t779) >> 2) & 1) !== 0);
      if (!_c784) {
        let _g780 = 0;
        G781: {
          const _a782 = sp.adj4[_t779];
          for (let _i783 = 0; _i783 < _a782.length; _i783++) {
            if (!(((b.grid[sp.adj4Edges[_t779][_i783]] || -1) === 1))) continue;
            _g780++;
          }
        }
        _c784 = ((_g780 + (_k776[_t779] ?? exits(sp, cl, _t779))) > 0);
      }
      _c785 = _c784;
    }
    let _c799: boolean = _c785;
    if (_c799) {
      const _t786 = sp.edgeEnds[2 * v_e];
      const _t787 = sp.edgeEnds[2 * v_e + 1];
      let _c798: boolean = ((((b.grid[sp.edgeOf(_t786, _t787)] || -1) === 2) || !(((b.edgeCand(_t786) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t787) >> 1) & 1) !== 0));
      if (!_c798) {
        let _c797: boolean = ((b.grid[sp.edgeOf(_t786, _t787)] || -1) !== 1);
        if (_c797) {
          let _g788 = 0;
          G789: {
            const _a790 = sp.adj4[_t786];
            for (let _i791 = 0; _i791 < _a790.length; _i791++) {
              if (!(((b.grid[sp.adj4Edges[_t786][_i791]] || -1) === 1))) continue;
              _g788++;
            }
          }
          let _c796: boolean = ((_g788 + (_k776[_t786] ?? exits(sp, cl, _t786))) === 2);
          if (!_c796) {
            let _g792 = 0;
            G793: {
              const _a794 = sp.adj4[_t787];
              for (let _i795 = 0; _i795 < _a794.length; _i795++) {
                if (!(((b.grid[sp.adj4Edges[_t787][_i795]] || -1) === 1))) continue;
                _g792++;
              }
            }
            _c796 = ((_g792 + (_k776[_t787] ?? exits(sp, cl, _t787))) === 2);
          }
          _c797 = _c796;
        }
        _c798 = _c797;
      }
      _c799 = !(_c798);
    }
    if (!(_c799)) continue;
    L801: {
      const v_G = _eg800.of(sp.edgeEnds[2 * v_e]);
      if (!((_eg800.of(sp.edgeEnds[2 * v_e + 1]) === v_G))) break L801;
      if (b.made[0] !== _m89_0 || b.made[1] !== _m92_1 || b.made[2] !== _m92_2) {
        const _now802 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now802 === _eg800.of(sp.edgeEnds[2 * v_e]) || sameSet(_now802, _eg800.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g803: number[] = [];
        G804: {
          const _a807 = sp.edges;
          for (let _i808 = 0; _i808 < _a807.length; _i808++) {
            const v_e = _a807[_i808];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g803.push(v_e);
          }
        }
        const _fg809 = edgeGroups(sp, _g803);
        let _c816: boolean = !((b.grid[v_e] !== 0));
        if (_c816) {
          const _t810 = sp.edgeEnds[2 * v_e];
          let _c815: boolean = !(((b.edgeCand(_t810) >> 2) & 1) !== 0);
          if (!_c815) {
            let _g811 = 0;
            G812: {
              const _a813 = sp.adj4[_t810];
              for (let _i814 = 0; _i814 < _a813.length; _i814++) {
                if (!(((b.grid[sp.adj4Edges[_t810][_i814]] || -1) === 1))) continue;
                _g811++;
              }
            }
            _c815 = ((_g811 + exits(sp, cl, _t810)) > 0);
          }
          _c816 = _c815;
        }
        let _c823: boolean = _c816;
        if (_c823) {
          const _t817 = sp.edgeEnds[2 * v_e + 1];
          let _c822: boolean = !(((b.edgeCand(_t817) >> 2) & 1) !== 0);
          if (!_c822) {
            let _g818 = 0;
            G819: {
              const _a820 = sp.adj4[_t817];
              for (let _i821 = 0; _i821 < _a820.length; _i821++) {
                if (!(((b.grid[sp.adj4Edges[_t817][_i821]] || -1) === 1))) continue;
                _g818++;
              }
            }
            _c822 = ((_g818 + exits(sp, cl, _t817)) > 0);
          }
          _c823 = _c822;
        }
        let _c837: boolean = _c823;
        if (_c837) {
          const _t824 = sp.edgeEnds[2 * v_e];
          const _t825 = sp.edgeEnds[2 * v_e + 1];
          let _c836: boolean = ((((b.grid[sp.edgeOf(_t824, _t825)] || -1) === 2) || !(((b.edgeCand(_t824) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t825) >> 1) & 1) !== 0));
          if (!_c836) {
            let _c835: boolean = ((b.grid[sp.edgeOf(_t824, _t825)] || -1) !== 1);
            if (_c835) {
              let _g826 = 0;
              G827: {
                const _a828 = sp.adj4[_t824];
                for (let _i829 = 0; _i829 < _a828.length; _i829++) {
                  if (!(((b.grid[sp.adj4Edges[_t824][_i829]] || -1) === 1))) continue;
                  _g826++;
                }
              }
              let _c834: boolean = ((_g826 + exits(sp, cl, _t824)) === 2);
              if (!_c834) {
                let _g830 = 0;
                G831: {
                  const _a832 = sp.adj4[_t825];
                  for (let _i833 = 0; _i833 < _a832.length; _i833++) {
                    if (!(((b.grid[sp.adj4Edges[_t825][_i833]] || -1) === 1))) continue;
                    _g830++;
                  }
                }
                _c834 = ((_g830 + exits(sp, cl, _t825)) === 2);
              }
              _c835 = _c834;
            }
            _c836 = _c835;
          }
          _c837 = !(_c836);
        }
        freshBinding("closeLoop", [sameSet(_fg809.of(sp.edgeEnds[2 * v_e]), _eg800.of(sp.edgeEnds[2 * v_e])), (sp.edges.includes(v_e)), _c837, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_R)), (_eg800.of(sp.edgeEnds[2 * v_e + 1]) === v_G)], ["R's groups", "e in", "where of e", "G =", "where of G"]);
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
  const _g891: number[] = [];
  const facts = strandFacts;
  let fired = 0;
  let changed = false;
  const _k904 = exitsKept.board(cl);
  const _m120_0 = b.made[0];
  _g891.length = 0;
  G892: {
    const _a895 = sp.edges;
    for (let _i896 = 0; _i896 < _a895.length; _i896++) {
      const v_e = _a895[_i896];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g891.push(v_e);
    }
  }
  const v_R = _g891;
  const _m123_1 = b.made[1];
  const _m123_2 = b.made[2];
  const _eg928 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a897 = sp.edges;
  R1:
  for (let _i898 = 0; _i898 < _a897.length; _i898++) {
    const v_e = _a897[_i898];
    let _c906: boolean = !((b.grid[v_e] !== 0));
    if (_c906) {
      const _t899 = sp.edgeEnds[2 * v_e];
      let _c905: boolean = !(((b.edgeCand(_t899) >> 2) & 1) !== 0);
      if (!_c905) {
        let _g900 = 0;
        G901: {
          const _a902 = sp.adj4[_t899];
          for (let _i903 = 0; _i903 < _a902.length; _i903++) {
            if (!(((b.grid[sp.adj4Edges[_t899][_i903]] || -1) === 1))) continue;
            _g900++;
          }
        }
        _c905 = ((_g900 + (_k904[_t899] ?? exits(sp, cl, _t899))) > 0);
      }
      _c906 = _c905;
    }
    let _c913: boolean = _c906;
    if (_c913) {
      const _t907 = sp.edgeEnds[2 * v_e + 1];
      let _c912: boolean = !(((b.edgeCand(_t907) >> 2) & 1) !== 0);
      if (!_c912) {
        let _g908 = 0;
        G909: {
          const _a910 = sp.adj4[_t907];
          for (let _i911 = 0; _i911 < _a910.length; _i911++) {
            if (!(((b.grid[sp.adj4Edges[_t907][_i911]] || -1) === 1))) continue;
            _g908++;
          }
        }
        _c912 = ((_g908 + (_k904[_t907] ?? exits(sp, cl, _t907))) > 0);
      }
      _c913 = _c912;
    }
    let _c927: boolean = _c913;
    if (_c927) {
      const _t914 = sp.edgeEnds[2 * v_e];
      const _t915 = sp.edgeEnds[2 * v_e + 1];
      let _c926: boolean = ((((b.grid[sp.edgeOf(_t914, _t915)] || -1) === 2) || !(((b.edgeCand(_t914) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t915) >> 1) & 1) !== 0));
      if (!_c926) {
        let _c925: boolean = ((b.grid[sp.edgeOf(_t914, _t915)] || -1) !== 1);
        if (_c925) {
          let _g916 = 0;
          G917: {
            const _a918 = sp.adj4[_t914];
            for (let _i919 = 0; _i919 < _a918.length; _i919++) {
              if (!(((b.grid[sp.adj4Edges[_t914][_i919]] || -1) === 1))) continue;
              _g916++;
            }
          }
          let _c924: boolean = ((_g916 + (_k904[_t914] ?? exits(sp, cl, _t914))) === 2);
          if (!_c924) {
            let _g920 = 0;
            G921: {
              const _a922 = sp.adj4[_t915];
              for (let _i923 = 0; _i923 < _a922.length; _i923++) {
                if (!(((b.grid[sp.adj4Edges[_t915][_i923]] || -1) === 1))) continue;
                _g920++;
              }
            }
            _c924 = ((_g920 + (_k904[_t915] ?? exits(sp, cl, _t915))) === 2);
          }
          _c925 = _c924;
        }
        _c926 = _c925;
      }
      _c927 = !(_c926);
    }
    if (!(_c927)) continue;
    const v_G = _eg928.of(sp.edgeEnds[2 * v_e]);
    L929: {
      const v_H = _eg928.of(sp.edgeEnds[2 * v_e + 1]);
      let _c932: boolean = !(_eg928.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c932) {
        let _q930 = false;
        Q931: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg928.of(cl.end.at[v_q]) === v_G)) {
              _q930 = true;
              break Q931;
            }
          }
        }
        _c932 = _q930;
      }
      let _c935: boolean = _c932;
      if (_c935) {
        let _q933 = false;
        Q934: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg928.of(cl.end.at[v_q]) === v_H)) {
              _q933 = true;
              break Q934;
            }
          }
        }
        _c935 = _q933;
      }
      let _c945: boolean = _c935;
      if (_c945) {
        let _q936 = false;
        Q937: {
          const _a938 = sp.cells;
          for (let _i939 = 0; _i939 < _a938.length; _i939++) {
            const v_c = _a938[_i939];
            let _c944: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c944) {
              let _g940 = 0;
              G941: {
                const _a942 = sp.adj4[v_c];
                for (let _i943 = 0; _i943 < _a942.length; _i943++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i943]] || -1) === 1))) continue;
                  _g940++;
                }
              }
              _c944 = ((_g940 + (_k904[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (((_c944 && !(_eg928.of(v_c) === v_G)) && !(_eg928.of(v_c) === v_H))) {
              _q936 = true;
              break Q937;
            }
          }
        }
        _c945 = _q936;
      }
      if (!(_c945)) break L929;
      if (b.made[0] !== _m120_0 || b.made[1] !== _m123_1 || b.made[2] !== _m123_2) {
        const _now946 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now946 === _eg928.of(sp.edgeEnds[2 * v_e]) || sameSet(_now946, _eg928.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
        const _now947 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e + 1]);
        if (!(_now947 === _eg928.of(sp.edgeEnds[2 * v_e + 1]) || sameSet(_now947, _eg928.of(sp.edgeEnds[2 * v_e + 1])))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g948: number[] = [];
        G949: {
          const _a952 = sp.edges;
          for (let _i953 = 0; _i953 < _a952.length; _i953++) {
            const v_e = _a952[_i953];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g948.push(v_e);
          }
        }
        const _fg954 = edgeGroups(sp, _g948);
        let _c961: boolean = !((b.grid[v_e] !== 0));
        if (_c961) {
          const _t955 = sp.edgeEnds[2 * v_e];
          let _c960: boolean = !(((b.edgeCand(_t955) >> 2) & 1) !== 0);
          if (!_c960) {
            let _g956 = 0;
            G957: {
              const _a958 = sp.adj4[_t955];
              for (let _i959 = 0; _i959 < _a958.length; _i959++) {
                if (!(((b.grid[sp.adj4Edges[_t955][_i959]] || -1) === 1))) continue;
                _g956++;
              }
            }
            _c960 = ((_g956 + exits(sp, cl, _t955)) > 0);
          }
          _c961 = _c960;
        }
        let _c968: boolean = _c961;
        if (_c968) {
          const _t962 = sp.edgeEnds[2 * v_e + 1];
          let _c967: boolean = !(((b.edgeCand(_t962) >> 2) & 1) !== 0);
          if (!_c967) {
            let _g963 = 0;
            G964: {
              const _a965 = sp.adj4[_t962];
              for (let _i966 = 0; _i966 < _a965.length; _i966++) {
                if (!(((b.grid[sp.adj4Edges[_t962][_i966]] || -1) === 1))) continue;
                _g963++;
              }
            }
            _c967 = ((_g963 + exits(sp, cl, _t962)) > 0);
          }
          _c968 = _c967;
        }
        let _c982: boolean = _c968;
        if (_c982) {
          const _t969 = sp.edgeEnds[2 * v_e];
          const _t970 = sp.edgeEnds[2 * v_e + 1];
          let _c981: boolean = ((((b.grid[sp.edgeOf(_t969, _t970)] || -1) === 2) || !(((b.edgeCand(_t969) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t970) >> 1) & 1) !== 0));
          if (!_c981) {
            let _c980: boolean = ((b.grid[sp.edgeOf(_t969, _t970)] || -1) !== 1);
            if (_c980) {
              let _g971 = 0;
              G972: {
                const _a973 = sp.adj4[_t969];
                for (let _i974 = 0; _i974 < _a973.length; _i974++) {
                  if (!(((b.grid[sp.adj4Edges[_t969][_i974]] || -1) === 1))) continue;
                  _g971++;
                }
              }
              let _c979: boolean = ((_g971 + exits(sp, cl, _t969)) === 2);
              if (!_c979) {
                let _g975 = 0;
                G976: {
                  const _a977 = sp.adj4[_t970];
                  for (let _i978 = 0; _i978 < _a977.length; _i978++) {
                    if (!(((b.grid[sp.adj4Edges[_t970][_i978]] || -1) === 1))) continue;
                    _g975++;
                  }
                }
                _c979 = ((_g975 + exits(sp, cl, _t970)) === 2);
              }
              _c980 = _c979;
            }
            _c981 = _c980;
          }
          _c982 = !(_c981);
        }
        let _c985: boolean = !(_eg928.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c985) {
          let _q983 = false;
          Q984: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg928.of(cl.end.at[v_q]) === v_G)) {
                _q983 = true;
                break Q984;
              }
            }
          }
          _c985 = _q983;
        }
        let _c988: boolean = _c985;
        if (_c988) {
          let _q986 = false;
          Q987: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg928.of(cl.end.at[v_q]) === v_H)) {
                _q986 = true;
                break Q987;
              }
            }
          }
          _c988 = _q986;
        }
        let _c998: boolean = _c988;
        if (_c998) {
          let _q989 = false;
          Q990: {
            const _a991 = sp.cells;
            for (let _i992 = 0; _i992 < _a991.length; _i992++) {
              const v_c = _a991[_i992];
              let _c997: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c997) {
                let _g993 = 0;
                G994: {
                  const _a995 = sp.adj4[v_c];
                  for (let _i996 = 0; _i996 < _a995.length; _i996++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i996]] || -1) === 1))) continue;
                    _g993++;
                  }
                }
                _c997 = ((_g993 + exits(sp, cl, v_c)) > 0);
              }
              if (((_c997 && !(_eg928.of(v_c) === v_G)) && !(_eg928.of(v_c) === v_H))) {
                _q989 = true;
                break Q990;
              }
            }
          }
          _c998 = _q989;
        }
        freshBinding("strand", [sameSet(_fg954.of(sp.edgeEnds[2 * v_e]), _eg928.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg954.of(sp.edgeEnds[2 * v_e + 1]), _eg928.of(sp.edgeEnds[2 * v_e + 1])), (sp.edges.includes(v_e)), _c982, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_R)), sameSet(v_H, through(sp, sp.edgeEnds[2 * v_e + 1], v_R)), _c998], ["R's groups", "e in", "where of e", "G =", "H =", "where of H"]);
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
  const _g1051: number[] = [];
  const facts = finishEarlyFacts;
  let fired = 0;
  let changed = false;
  const _k1064 = exitsKept.board(cl);
  const _m159_0 = b.made[0];
  _g1051.length = 0;
  G1052: {
    const _a1055 = sp.edges;
    for (let _i1056 = 0; _i1056 < _a1055.length; _i1056++) {
      const v_e = _a1055[_i1056];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1051.push(v_e);
    }
  }
  const v_R = _g1051;
  const _m162_1 = b.made[1];
  const _m162_2 = b.made[2];
  const _eg1088 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a1057 = sp.edges;
  R1:
  for (let _i1058 = 0; _i1058 < _a1057.length; _i1058++) {
    const v_e = _a1057[_i1058];
    let _c1066: boolean = !((b.grid[v_e] !== 0));
    if (_c1066) {
      const _t1059 = sp.edgeEnds[2 * v_e];
      let _c1065: boolean = !(((b.edgeCand(_t1059) >> 2) & 1) !== 0);
      if (!_c1065) {
        let _g1060 = 0;
        G1061: {
          const _a1062 = sp.adj4[_t1059];
          for (let _i1063 = 0; _i1063 < _a1062.length; _i1063++) {
            if (!(((b.grid[sp.adj4Edges[_t1059][_i1063]] || -1) === 1))) continue;
            _g1060++;
          }
        }
        _c1065 = ((_g1060 + (_k1064[_t1059] ?? exits(sp, cl, _t1059))) > 0);
      }
      _c1066 = _c1065;
    }
    let _c1073: boolean = _c1066;
    if (_c1073) {
      const _t1067 = sp.edgeEnds[2 * v_e + 1];
      let _c1072: boolean = !(((b.edgeCand(_t1067) >> 2) & 1) !== 0);
      if (!_c1072) {
        let _g1068 = 0;
        G1069: {
          const _a1070 = sp.adj4[_t1067];
          for (let _i1071 = 0; _i1071 < _a1070.length; _i1071++) {
            if (!(((b.grid[sp.adj4Edges[_t1067][_i1071]] || -1) === 1))) continue;
            _g1068++;
          }
        }
        _c1072 = ((_g1068 + (_k1064[_t1067] ?? exits(sp, cl, _t1067))) > 0);
      }
      _c1073 = _c1072;
    }
    let _c1087: boolean = _c1073;
    if (_c1087) {
      const _t1074 = sp.edgeEnds[2 * v_e];
      const _t1075 = sp.edgeEnds[2 * v_e + 1];
      let _c1086: boolean = ((((b.grid[sp.edgeOf(_t1074, _t1075)] || -1) === 2) || !(((b.edgeCand(_t1074) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1075) >> 1) & 1) !== 0));
      if (!_c1086) {
        let _c1085: boolean = ((b.grid[sp.edgeOf(_t1074, _t1075)] || -1) !== 1);
        if (_c1085) {
          let _g1076 = 0;
          G1077: {
            const _a1078 = sp.adj4[_t1074];
            for (let _i1079 = 0; _i1079 < _a1078.length; _i1079++) {
              if (!(((b.grid[sp.adj4Edges[_t1074][_i1079]] || -1) === 1))) continue;
              _g1076++;
            }
          }
          let _c1084: boolean = ((_g1076 + (_k1064[_t1074] ?? exits(sp, cl, _t1074))) === 2);
          if (!_c1084) {
            let _g1080 = 0;
            G1081: {
              const _a1082 = sp.adj4[_t1075];
              for (let _i1083 = 0; _i1083 < _a1082.length; _i1083++) {
                if (!(((b.grid[sp.adj4Edges[_t1075][_i1083]] || -1) === 1))) continue;
                _g1080++;
              }
            }
            _c1084 = ((_g1080 + (_k1064[_t1075] ?? exits(sp, cl, _t1075))) === 2);
          }
          _c1085 = _c1084;
        }
        _c1086 = _c1085;
      }
      _c1087 = !(_c1086);
    }
    if (!(_c1087)) continue;
    const v_G = _eg1088.of(sp.edgeEnds[2 * v_e]);
    L1089: {
      const v_H = _eg1088.of(sp.edgeEnds[2 * v_e + 1]);
      let _c1092: boolean = !(_eg1088.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c1092) {
        let _q1090 = false;
        Q1091: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg1088.of(cl.end.at[v_q]) === v_G)) {
              _q1090 = true;
              break Q1091;
            }
          }
        }
        _c1092 = _q1090;
      }
      let _c1095: boolean = _c1092;
      if (_c1095) {
        let _q1093 = false;
        Q1094: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg1088.of(cl.end.at[v_q]) === v_H)) {
              _q1093 = true;
              break Q1094;
            }
          }
        }
        _c1095 = _q1093;
      }
      let _c1105: boolean = _c1095;
      if (_c1105) {
        let _q1096 = false;
        Q1097: {
          const _a1098 = sp.lines;
          for (let _i1099 = 0; _i1099 < _a1098.length; _i1099++) {
            const v_L = _a1098[_i1099];
            const _h1104 = clueAt(cl.count, v_L);
            let _g1100 = 0;
            G1101: {
              const _a1102 = sp.lineCells[v_L];
              for (let _i1103 = 0; _i1103 < _a1102.length; _i1103++) {
                const v_c = _a1102[_i1103];
                if (!(((_eg1088.of(v_c) === v_G) || (_eg1088.of(v_c) === v_H)))) continue;
                _g1100++;
              }
            }
            if ((_g1100 < _h1104)) {
              _q1096 = true;
              break Q1097;
            }
          }
        }
        _c1105 = _q1096;
      }
      if (!(_c1105)) break L1089;
      if (b.made[0] !== _m159_0 || b.made[1] !== _m162_1 || b.made[2] !== _m162_2) {
        const _now1106 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now1106 === _eg1088.of(sp.edgeEnds[2 * v_e]) || sameSet(_now1106, _eg1088.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
        const _now1107 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e + 1]);
        if (!(_now1107 === _eg1088.of(sp.edgeEnds[2 * v_e + 1]) || sameSet(_now1107, _eg1088.of(sp.edgeEnds[2 * v_e + 1])))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g1108: number[] = [];
        G1109: {
          const _a1112 = sp.edges;
          for (let _i1113 = 0; _i1113 < _a1112.length; _i1113++) {
            const v_e = _a1112[_i1113];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g1108.push(v_e);
          }
        }
        const _fg1114 = edgeGroups(sp, _g1108);
        let _c1121: boolean = !((b.grid[v_e] !== 0));
        if (_c1121) {
          const _t1115 = sp.edgeEnds[2 * v_e];
          let _c1120: boolean = !(((b.edgeCand(_t1115) >> 2) & 1) !== 0);
          if (!_c1120) {
            let _g1116 = 0;
            G1117: {
              const _a1118 = sp.adj4[_t1115];
              for (let _i1119 = 0; _i1119 < _a1118.length; _i1119++) {
                if (!(((b.grid[sp.adj4Edges[_t1115][_i1119]] || -1) === 1))) continue;
                _g1116++;
              }
            }
            _c1120 = ((_g1116 + exits(sp, cl, _t1115)) > 0);
          }
          _c1121 = _c1120;
        }
        let _c1128: boolean = _c1121;
        if (_c1128) {
          const _t1122 = sp.edgeEnds[2 * v_e + 1];
          let _c1127: boolean = !(((b.edgeCand(_t1122) >> 2) & 1) !== 0);
          if (!_c1127) {
            let _g1123 = 0;
            G1124: {
              const _a1125 = sp.adj4[_t1122];
              for (let _i1126 = 0; _i1126 < _a1125.length; _i1126++) {
                if (!(((b.grid[sp.adj4Edges[_t1122][_i1126]] || -1) === 1))) continue;
                _g1123++;
              }
            }
            _c1127 = ((_g1123 + exits(sp, cl, _t1122)) > 0);
          }
          _c1128 = _c1127;
        }
        let _c1142: boolean = _c1128;
        if (_c1142) {
          const _t1129 = sp.edgeEnds[2 * v_e];
          const _t1130 = sp.edgeEnds[2 * v_e + 1];
          let _c1141: boolean = ((((b.grid[sp.edgeOf(_t1129, _t1130)] || -1) === 2) || !(((b.edgeCand(_t1129) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t1130) >> 1) & 1) !== 0));
          if (!_c1141) {
            let _c1140: boolean = ((b.grid[sp.edgeOf(_t1129, _t1130)] || -1) !== 1);
            if (_c1140) {
              let _g1131 = 0;
              G1132: {
                const _a1133 = sp.adj4[_t1129];
                for (let _i1134 = 0; _i1134 < _a1133.length; _i1134++) {
                  if (!(((b.grid[sp.adj4Edges[_t1129][_i1134]] || -1) === 1))) continue;
                  _g1131++;
                }
              }
              let _c1139: boolean = ((_g1131 + exits(sp, cl, _t1129)) === 2);
              if (!_c1139) {
                let _g1135 = 0;
                G1136: {
                  const _a1137 = sp.adj4[_t1130];
                  for (let _i1138 = 0; _i1138 < _a1137.length; _i1138++) {
                    if (!(((b.grid[sp.adj4Edges[_t1130][_i1138]] || -1) === 1))) continue;
                    _g1135++;
                  }
                }
                _c1139 = ((_g1135 + exits(sp, cl, _t1130)) === 2);
              }
              _c1140 = _c1139;
            }
            _c1141 = _c1140;
          }
          _c1142 = !(_c1141);
        }
        let _c1145: boolean = !(_eg1088.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c1145) {
          let _q1143 = false;
          Q1144: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg1088.of(cl.end.at[v_q]) === v_G)) {
                _q1143 = true;
                break Q1144;
              }
            }
          }
          _c1145 = _q1143;
        }
        let _c1148: boolean = _c1145;
        if (_c1148) {
          let _q1146 = false;
          Q1147: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg1088.of(cl.end.at[v_q]) === v_H)) {
                _q1146 = true;
                break Q1147;
              }
            }
          }
          _c1148 = _q1146;
        }
        let _c1157: boolean = _c1148;
        if (_c1157) {
          let _q1149 = false;
          Q1150: {
            const _a1151 = sp.lines;
            for (let _i1152 = 0; _i1152 < _a1151.length; _i1152++) {
              const v_L = _a1151[_i1152];
              let _g1153 = 0;
              G1154: {
                const _a1155 = sp.lineCells[v_L];
                for (let _i1156 = 0; _i1156 < _a1155.length; _i1156++) {
                  const v_c = _a1155[_i1156];
                  if (!(((_eg1088.of(v_c) === v_G) || (_eg1088.of(v_c) === v_H)))) continue;
                  _g1153++;
                }
              }
              if ((_g1153 < clueAt(cl.count, v_L))) {
                _q1149 = true;
                break Q1150;
              }
            }
          }
          _c1157 = _q1149;
        }
        freshBinding("finishEarly", [sameSet(_fg1114.of(sp.edgeEnds[2 * v_e]), _eg1088.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg1114.of(sp.edgeEnds[2 * v_e + 1]), _eg1088.of(sp.edgeEnds[2 * v_e + 1])), (sp.edges.includes(v_e)), _c1142, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_R)), sameSet(v_H, through(sp, sp.edgeEnds[2 * v_e + 1], v_R)), _c1157], ["R's groups", "e in", "where of e", "G =", "H =", "where of H"]);
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
  const _g1240: number[] = [];
  const _g1267: number[] = [];
  const _g1297: number[] = [];
  const facts = looseEndFacts;
  let fired = 0;
  let changed = false;
  const _k1254 = exitsKept.board(cl);
  if (looseEndCands.length < sp.edges.length) looseEndCands = new Int32Array(sp.edges.length);
  const cands = looseEndCands;
  cands.fill(-1);
  crossableMarkedKept.clear();
  const _a1238 = sp.lines;
  for (let _i1239 = 0; _i1239 < _a1238.length; _i1239++) {
    const v_L = _a1238[_i1239];
    const _h1256 = clueAt(cl.count, v_L);
    const _h1288 = (sp.rows.includes(v_L));
    _g1240.length = 0;
    G1241: {
      const _a1248 = sp.lineCells[v_L];
      for (let _i1249 = 0; _i1249 < _a1248.length; _i1249++) {
        const v_c = _a1248[_i1249];
        let _g1250 = 0;
        G1251: {
          const _a1252 = sp.adj4[v_c];
          for (let _i1253 = 0; _i1253 < _a1252.length; _i1253++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i1253]] || -1) === 1))) continue;
            _g1250++;
          }
        }
        if (!(((_g1250 + (_k1254[v_c] ?? exits(sp, cl, v_c))) === 2))) continue;
        _g1240.push(v_c);
      }
    }
    L1255: {
      const v_F = _g1240;
      const _h1257 = v_F.length;
      let _c1266: boolean = ((_h1256 - _h1257) === 2);
      if (_c1266) {
        let _q1258 = true;
        Q1259: {
          const _a1260 = sp.lineCells[v_L];
          for (let _i1261 = 0; _i1261 < _a1260.length; _i1261++) {
            const v_c = _a1260[_i1261];
            let _g1262 = 0;
            G1263: {
              const _a1264 = sp.adj4[v_c];
              for (let _i1265 = 0; _i1265 < _a1264.length; _i1265++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i1265]] || -1) === 1))) continue;
                _g1262++;
              }
            }
            if (!(((_g1262 + (_k1254[v_c] ?? exits(sp, cl, v_c))) !== 2))) continue;
            if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
              _q1258 = false;
              break Q1259;
            }
          }
        }
        _c1266 = _q1258;
      }
      if (!(_c1266)) break L1255;
      _g1267.length = 0;
      G1268: {
        const _a1281 = sp.lineCells[v_L];
        for (let _i1282 = 0; _i1282 < _a1281.length; _i1282++) {
          const v_c = _a1281[_i1282];
          const _h1287 = clueAt(cl.end, v_c);
          let _g1283 = 0;
          G1284: {
            const _a1285 = sp.adj4[v_c];
            for (let _i1286 = 0; _i1286 < _a1285.length; _i1286++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i1286]] || -1) === 1))) continue;
              _g1283++;
            }
          }
          let _c1294: boolean = ((_g1283 + (_k1254[v_c] ?? exits(sp, cl, v_c))) === 1);
          if (_c1294) {
            let _c1293: boolean = ((_h1287 >= 1) && ((_h1287 >= 3) === _h1288));
            if (!_c1293) {
              let _q1289 = false;
              Q1290: {
                const _a1291 = sp.adj4[v_c];
                for (let _i1292 = 0; _i1292 < _a1291.length; _i1292++) {
                  const v_y = _a1291[_i1292];
                  if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_c][_i1292]] || -1) === 1)) {
                    _q1289 = true;
                    break Q1290;
                  }
                }
              }
              _c1293 = _q1289;
            }
            _c1294 = _c1293;
          }
          if (!(_c1294)) continue;
          _g1267.push(v_c);
        }
      }
      L1295: {
        const v_P = _g1267;
        const _h1296 = v_P.length;
        if (!((_h1296 === 1))) break L1295;
        const v_p = (v_P[0] ?? -1);
        _g1297.length = 0;
        G1298: {
          const _a1301 = sp.adj4[v_p];
          for (let _i1302 = 0; _i1302 < _a1301.length; _i1302++) {
            const v_y = _a1301[_i1302];
            if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i1302]] || -1) !== 1)))) continue;
            _g1297.push(v_y);
          }
        }
        const v_Q = _g1297;
        const _h1358 = v_Q.length;
        if (import.meta.env.DEV && staleChecking) {
          const _g1303: number[] = [];
          G1304: {
            const _a1311 = sp.lineCells[v_L];
            for (let _i1312 = 0; _i1312 < _a1311.length; _i1312++) {
              const v_c = _a1311[_i1312];
              let _g1313 = 0;
              G1314: {
                const _a1315 = sp.adj4[v_c];
                for (let _i1316 = 0; _i1316 < _a1315.length; _i1316++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i1316]] || -1) === 1))) continue;
                  _g1313++;
                }
              }
              if (!(((_g1313 + exits(sp, cl, v_c)) === 2))) continue;
              _g1303.push(v_c);
            }
          }
          let _c1325: boolean = ((clueAt(cl.count, v_L) - v_F.length) === 2);
          if (_c1325) {
            let _q1317 = true;
            Q1318: {
              const _a1319 = sp.lineCells[v_L];
              for (let _i1320 = 0; _i1320 < _a1319.length; _i1320++) {
                const v_c = _a1319[_i1320];
                let _g1321 = 0;
                G1322: {
                  const _a1323 = sp.adj4[v_c];
                  for (let _i1324 = 0; _i1324 < _a1323.length; _i1324++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1324]] || -1) === 1))) continue;
                    _g1321++;
                  }
                }
                if (!(((_g1321 + exits(sp, cl, v_c)) !== 2))) continue;
                if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
                  _q1317 = false;
                  break Q1318;
                }
              }
            }
            _c1325 = _q1317;
          }
          const _g1326: number[] = [];
          G1327: {
            const _a1340 = sp.lineCells[v_L];
            for (let _i1341 = 0; _i1341 < _a1340.length; _i1341++) {
              const v_c = _a1340[_i1341];
              let _g1342 = 0;
              G1343: {
                const _a1344 = sp.adj4[v_c];
                for (let _i1345 = 0; _i1345 < _a1344.length; _i1345++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i1345]] || -1) === 1))) continue;
                  _g1342++;
                }
              }
              let _c1351: boolean = ((_g1342 + exits(sp, cl, v_c)) === 1);
              if (_c1351) {
                let _c1350: boolean = ((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L))));
                if (!_c1350) {
                  let _q1346 = false;
                  Q1347: {
                    const _a1348 = sp.adj4[v_c];
                    for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
                      const v_y = _a1348[_i1349];
                      if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                      if (((b.grid[sp.adj4Edges[v_c][_i1349]] || -1) === 1)) {
                        _q1346 = true;
                        break Q1347;
                      }
                    }
                  }
                  _c1350 = _q1346;
                }
                _c1351 = _c1350;
              }
              if (!(_c1351)) continue;
              _g1326.push(v_c);
            }
          }
          const _g1352: number[] = [];
          G1353: {
            const _a1356 = sp.adj4[v_p];
            for (let _i1357 = 0; _i1357 < _a1356.length; _i1357++) {
              const v_y = _a1356[_i1357];
              if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i1357]] || -1) !== 1)))) continue;
              _g1352.push(v_y);
            }
          }
          freshBinding("looseEnd", [(sp.lines.includes(v_L)), sameSet(v_F, _g1303), _c1325, sameSet(v_P, _g1326), (v_P.length === 1), (v_p === (v_P[0] ?? -1)), sameSet(v_Q, _g1352)], ["L in", "F =", "where of F", "P =", "where of P", "p =", "Q ="]);
        }
        facts.length = 0;
        changed = false;
        let _c1364: boolean = (_h1358 === 1);
        if (_c1364) {
          let _q1359 = true;
          Q1360: {
            const _a1361 = v_Q;
            for (let _i1362 = 0; _i1362 < _a1361.length; _i1362++) {
              const v_y = _a1361[_i1362];
              const _t1363 = sp.edgeOf(v_p, v_y);
              if (!(b.grid[_t1363] !== 0)) { if (fire === null) { b.placeAt(_t1363, 1); changed = true; } else facts.push(PLACE, _t1363, 1); }
              if (!(true)) {
                _q1359 = false;
                break Q1360;
              }
            }
          }
          _c1364 = _q1359;
        }
        if (!(_c1364)) return -1;
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
  const _g1472: number[] = [];
  const _g1510: number[] = [];
  const _g1559: number[] = [];
  const facts = sharedFateFacts;
  let fired = 0;
  let changed = false;
  const _k1488 = exitsKept.board(cl);
  if (sharedFateCands.length < sp.edges.length) sharedFateCands = new Int32Array(sp.edges.length);
  const cands = sharedFateCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a1453 = sp.lines;
  R1:
  for (let _i1454 = 0; _i1454 < _a1453.length; _i1454++) {
    const v_L = _a1453[_i1454];
    const _m239_0 = b.made[0];
    const _m239_1 = b.made[1];
    const _m239_2 = b.made[2];
    const _h1455 = clueAt(cl.count, v_L);
    if (!(((_h1455 - laidMarked(b, sp, cl, cands, v_L)) === 1))) continue;
    _g1472.length = 0;
    G1473: {
      const _a1481 = sp.lineCells[v_L];
      for (let _i1482 = 0; _i1482 < _a1481.length; _i1482++) {
        const v_c = _a1481[_i1482];
        let _c1489: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1489) {
          let _g1483 = 0;
          G1484: {
            const _a1485 = sp.adj4[v_c];
            for (let _i1486 = 0; _i1486 < _a1485.length; _i1486++) {
              const _h1487 = (b.grid[sp.adj4Edges[v_c][_i1486]] || -1);
              if (!((_h1487 === 1))) continue;
              _g1483++;
            }
          }
          _c1489 = ((_g1483 + (_k1488[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1489) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1472.push(v_c);
      }
    }
    const _a1490 = _g1472;
    R2:
    for (let _i1491 = 0; _i1491 < _a1490.length; _i1491++) {
      const v_p = _a1490[_i1491];
      const _a1492 = sp.adj4[v_p];
      for (let _i1493 = 0; _i1493 < _a1492.length; _i1493++) {
        const v_q = _a1492[_i1493];
        _g1510.length = 0;
        G1511: {
          const _a1519 = sp.lineCells[v_L];
          for (let _i1520 = 0; _i1520 < _a1519.length; _i1520++) {
            const v_c = _a1519[_i1520];
            let _c1526: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1526) {
              let _g1521 = 0;
              G1522: {
                const _a1523 = sp.adj4[v_c];
                for (let _i1524 = 0; _i1524 < _a1523.length; _i1524++) {
                  const _h1525 = (b.grid[sp.adj4Edges[v_c][_i1524]] || -1);
                  if (!((_h1525 === 1))) continue;
                  _g1521++;
                }
              }
              _c1526 = ((_g1521 + (_k1488[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1526) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1510.push(v_c);
          }
        }
        let _c1542: boolean = (_g1510.includes(v_q));
        if (_c1542) {
          let _g1527 = 0;
          G1528: {
            const _a1529 = sp.adj4[v_p];
            for (let _i1530 = 0; _i1530 < _a1529.length; _i1530++) {
              const v_y = _a1529[_i1530];
              const _h1531 = (b.grid[sp.adj4Edges[v_p][_i1530]] || -1);
              let _c1541: boolean = (v_y !== v_q);
              if (_c1541) {
                let _c1540: boolean = (((_h1531 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1540) {
                  let _c1539: boolean = (_h1531 !== 1);
                  if (_c1539) {
                    let _c1538: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1538) {
                      let _g1532 = 0;
                      G1533: {
                        const _a1535 = sp.adj4[v_y];
                        for (let _i1536 = 0; _i1536 < _a1535.length; _i1536++) {
                          const _h1537 = (b.grid[sp.adj4Edges[v_y][_i1536]] || -1);
                          if (!((_h1537 === 1))) continue;
                          _g1532++;
                        }
                      }
                      _c1538 = ((_g1532 + (_k1488[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1539 = _c1538;
                  }
                  _c1540 = _c1539;
                }
                _c1541 = !(_c1540);
              }
              if (!(_c1541)) continue;
              _g1527++;
            }
          }
          _c1542 = (_g1527 < 2);
        }
        if (!(_c1542)) continue;
        if (b.made[0] !== _m239_0 || b.made[1] !== _m239_1 || b.made[2] !== _m239_2) {
          if (!(((clueAt(cl.count, v_L) - laidMarked(b, sp, cl, cands, v_L)) === 1))) { continue R1; }
          _g1559.length = 0;
          G1560: {
            const _a1568 = sp.lineCells[v_L];
            for (let _i1569 = 0; _i1569 < _a1568.length; _i1569++) {
              const v_c = _a1568[_i1569];
              let _c1574: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1574) {
                let _g1570 = 0;
                G1571: {
                  const _a1572 = sp.adj4[v_c];
                  for (let _i1573 = 0; _i1573 < _a1572.length; _i1573++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1573]] || -1) === 1))) continue;
                    _g1570++;
                  }
                }
                _c1574 = ((_g1570 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1574) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1559.push(v_c);
            }
          }
          if (!((_g1559.includes(v_p)))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g1591: number[] = [];
          G1592: {
            const _a1600 = sp.lineCells[v_L];
            for (let _i1601 = 0; _i1601 < _a1600.length; _i1601++) {
              const v_c = _a1600[_i1601];
              let _c1606: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1606) {
                let _g1602 = 0;
                G1603: {
                  const _a1604 = sp.adj4[v_c];
                  for (let _i1605 = 0; _i1605 < _a1604.length; _i1605++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1605]] || -1) === 1))) continue;
                    _g1602++;
                  }
                }
                _c1606 = ((_g1602 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1606) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1591.push(v_c);
            }
          }
          const _g1623: number[] = [];
          G1624: {
            const _a1632 = sp.lineCells[v_L];
            for (let _i1633 = 0; _i1633 < _a1632.length; _i1633++) {
              const v_c = _a1632[_i1633];
              let _c1638: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1638) {
                let _g1634 = 0;
                G1635: {
                  const _a1636 = sp.adj4[v_c];
                  for (let _i1637 = 0; _i1637 < _a1636.length; _i1637++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1637]] || -1) === 1))) continue;
                    _g1634++;
                  }
                }
                _c1638 = ((_g1634 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1638) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1623.push(v_c);
            }
          }
          let _c1656: boolean = (_g1623.includes(v_q));
          if (_c1656) {
            let _g1639 = 0;
            G1640: {
              const _a1641 = sp.adj4[v_p];
              for (let _i1642 = 0; _i1642 < _a1641.length; _i1642++) {
                const v_y = _a1641[_i1642];
                let _c1655: boolean = (v_y !== v_q);
                if (_c1655) {
                  let _c1654: boolean = ((((b.grid[sp.adj4Edges[v_p][_i1642]] || -1) === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                  if (!_c1654) {
                    let _c1653: boolean = ((b.grid[sp.adj4Edges[v_p][_i1642]] || -1) !== 1);
                    if (_c1653) {
                      let _g1643 = 0;
                      G1644: {
                        const _a1645 = sp.adj4[v_p];
                        for (let _i1646 = 0; _i1646 < _a1645.length; _i1646++) {
                          if (!(((b.grid[sp.adj4Edges[v_p][_i1646]] || -1) === 1))) continue;
                          _g1643++;
                        }
                      }
                      let _c1652: boolean = ((_g1643 + exits(sp, cl, v_p)) === 2);
                      if (!_c1652) {
                        let _g1647 = 0;
                        G1648: {
                          const _a1650 = sp.adj4[v_y];
                          for (let _i1651 = 0; _i1651 < _a1650.length; _i1651++) {
                            if (!(((b.grid[sp.adj4Edges[v_y][_i1651]] || -1) === 1))) continue;
                            _g1647++;
                          }
                        }
                        _c1652 = ((_g1647 + exits(sp, cl, v_y)) === 2);
                      }
                      _c1653 = _c1652;
                    }
                    _c1654 = _c1653;
                  }
                  _c1655 = !(_c1654);
                }
                if (!(_c1655)) continue;
                _g1639++;
              }
            }
            _c1656 = (_g1639 < 2);
          }
          freshBinding("sharedFate", [(sp.lines.includes(v_L)), ((clueAt(cl.count, v_L) - laidMarked(b, sp, cl, cands, v_L)) === 1), (_g1591.includes(v_p)), (sp.adj4[v_p].includes(v_q)), _c1656], ["L in", "where of L", "p in", "q in", "where of q"]);
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
  const _g1772: number[] = [];
  const _g1810: number[] = [];
  const _g1863: number[] = [];
  const facts = sharedFateEmptiesFacts;
  let fired = 0;
  let changed = false;
  const _k1788 = exitsKept.board(cl);
  const _a1749 = sp.lines;
  R1:
  for (let _i1750 = 0; _i1750 < _a1749.length; _i1750++) {
    const v_L = _a1749[_i1750];
    const _m268_2 = b.made[2];
    const _h1751 = clueAt(cl.count, v_L);
    let _g1752 = 0;
    G1753: {
      const _a1754 = sp.lineCells[v_L];
      for (let _i1755 = 0; _i1755 < _a1754.length; _i1755++) {
        const v_c = _a1754[_i1755];
        if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
        _g1752++;
      }
    }
    if (!((((sp.lineCells[v_L].length - _h1751) - _g1752) === 1))) continue;
    const _m273_0 = b.made[0];
    _g1772.length = 0;
    G1773: {
      const _a1781 = sp.lineCells[v_L];
      for (let _i1782 = 0; _i1782 < _a1781.length; _i1782++) {
        const v_c = _a1781[_i1782];
        let _c1789: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c1789) {
          let _g1783 = 0;
          G1784: {
            const _a1785 = sp.adj4[v_c];
            for (let _i1786 = 0; _i1786 < _a1785.length; _i1786++) {
              const _h1787 = (b.grid[sp.adj4Edges[v_c][_i1786]] || -1);
              if (!((_h1787 === 1))) continue;
              _g1783++;
            }
          }
          _c1789 = ((_g1783 + (_k1788[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c1789) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g1772.push(v_c);
      }
    }
    const _a1790 = _g1772;
    R2:
    for (let _i1791 = 0; _i1791 < _a1790.length; _i1791++) {
      const v_p = _a1790[_i1791];
      const _a1792 = sp.adj4[v_p];
      for (let _i1793 = 0; _i1793 < _a1792.length; _i1793++) {
        const v_q = _a1792[_i1793];
        _g1810.length = 0;
        G1811: {
          const _a1819 = sp.lineCells[v_L];
          for (let _i1820 = 0; _i1820 < _a1819.length; _i1820++) {
            const v_c = _a1819[_i1820];
            let _c1826: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c1826) {
              let _g1821 = 0;
              G1822: {
                const _a1823 = sp.adj4[v_c];
                for (let _i1824 = 0; _i1824 < _a1823.length; _i1824++) {
                  const _h1825 = (b.grid[sp.adj4Edges[v_c][_i1824]] || -1);
                  if (!((_h1825 === 1))) continue;
                  _g1821++;
                }
              }
              _c1826 = ((_g1821 + (_k1788[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c1826) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g1810.push(v_c);
          }
        }
        let _c1842: boolean = (_g1810.includes(v_q));
        if (_c1842) {
          let _g1827 = 0;
          G1828: {
            const _a1829 = sp.adj4[v_p];
            for (let _i1830 = 0; _i1830 < _a1829.length; _i1830++) {
              const v_y = _a1829[_i1830];
              const _h1831 = (b.grid[sp.adj4Edges[v_p][_i1830]] || -1);
              let _c1841: boolean = (v_y !== v_q);
              if (_c1841) {
                let _c1840: boolean = (((_h1831 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c1840) {
                  let _c1839: boolean = (_h1831 !== 1);
                  if (_c1839) {
                    let _c1838: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c1838) {
                      let _g1832 = 0;
                      G1833: {
                        const _a1835 = sp.adj4[v_y];
                        for (let _i1836 = 0; _i1836 < _a1835.length; _i1836++) {
                          const _h1837 = (b.grid[sp.adj4Edges[v_y][_i1836]] || -1);
                          if (!((_h1837 === 1))) continue;
                          _g1832++;
                        }
                      }
                      _c1838 = ((_g1832 + (_k1788[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c1839 = _c1838;
                  }
                  _c1840 = _c1839;
                }
                _c1841 = !(_c1840);
              }
              if (!(_c1841)) continue;
              _g1827++;
            }
          }
          _c1842 = (_g1827 < 2);
        }
        if (!(_c1842)) continue;
        if (b.made[0] !== _m273_0 || b.made[2] !== _m268_2) {
          let _g1843 = 0;
          G1844: {
            const _a1845 = sp.lineCells[v_L];
            for (let _i1846 = 0; _i1846 < _a1845.length; _i1846++) {
              const v_c = _a1845[_i1846];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g1843++;
            }
          }
          if (!((((sp.lineCells[v_L].length - clueAt(cl.count, v_L)) - _g1843) === 1))) { continue R1; }
          _g1863.length = 0;
          G1864: {
            const _a1872 = sp.lineCells[v_L];
            for (let _i1873 = 0; _i1873 < _a1872.length; _i1873++) {
              const v_c = _a1872[_i1873];
              let _c1878: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1878) {
                let _g1874 = 0;
                G1875: {
                  const _a1876 = sp.adj4[v_c];
                  for (let _i1877 = 0; _i1877 < _a1876.length; _i1877++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1877]] || -1) === 1))) continue;
                    _g1874++;
                  }
                }
                _c1878 = ((_g1874 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1878) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1863.push(v_c);
            }
          }
          if (!((_g1863.includes(v_p)))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _g1879 = 0;
          G1880: {
            const _a1881 = sp.lineCells[v_L];
            for (let _i1882 = 0; _i1882 < _a1881.length; _i1882++) {
              const v_c = _a1881[_i1882];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g1879++;
            }
          }
          const _g1899: number[] = [];
          G1900: {
            const _a1908 = sp.lineCells[v_L];
            for (let _i1909 = 0; _i1909 < _a1908.length; _i1909++) {
              const v_c = _a1908[_i1909];
              let _c1914: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1914) {
                let _g1910 = 0;
                G1911: {
                  const _a1912 = sp.adj4[v_c];
                  for (let _i1913 = 0; _i1913 < _a1912.length; _i1913++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1913]] || -1) === 1))) continue;
                    _g1910++;
                  }
                }
                _c1914 = ((_g1910 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1914) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1899.push(v_c);
            }
          }
          const _g1931: number[] = [];
          G1932: {
            const _a1940 = sp.lineCells[v_L];
            for (let _i1941 = 0; _i1941 < _a1940.length; _i1941++) {
              const v_c = _a1940[_i1941];
              let _c1946: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c1946) {
                let _g1942 = 0;
                G1943: {
                  const _a1944 = sp.adj4[v_c];
                  for (let _i1945 = 0; _i1945 < _a1944.length; _i1945++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i1945]] || -1) === 1))) continue;
                    _g1942++;
                  }
                }
                _c1946 = ((_g1942 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c1946) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g1931.push(v_c);
            }
          }
          let _c1964: boolean = (_g1931.includes(v_q));
          if (_c1964) {
            let _g1947 = 0;
            G1948: {
              const _a1949 = sp.adj4[v_p];
              for (let _i1950 = 0; _i1950 < _a1949.length; _i1950++) {
                const v_y = _a1949[_i1950];
                let _c1963: boolean = (v_y !== v_q);
                if (_c1963) {
                  let _c1962: boolean = ((((b.grid[sp.adj4Edges[v_p][_i1950]] || -1) === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                  if (!_c1962) {
                    let _c1961: boolean = ((b.grid[sp.adj4Edges[v_p][_i1950]] || -1) !== 1);
                    if (_c1961) {
                      let _g1951 = 0;
                      G1952: {
                        const _a1953 = sp.adj4[v_p];
                        for (let _i1954 = 0; _i1954 < _a1953.length; _i1954++) {
                          if (!(((b.grid[sp.adj4Edges[v_p][_i1954]] || -1) === 1))) continue;
                          _g1951++;
                        }
                      }
                      let _c1960: boolean = ((_g1951 + exits(sp, cl, v_p)) === 2);
                      if (!_c1960) {
                        let _g1955 = 0;
                        G1956: {
                          const _a1958 = sp.adj4[v_y];
                          for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
                            if (!(((b.grid[sp.adj4Edges[v_y][_i1959]] || -1) === 1))) continue;
                            _g1955++;
                          }
                        }
                        _c1960 = ((_g1955 + exits(sp, cl, v_y)) === 2);
                      }
                      _c1961 = _c1960;
                    }
                    _c1962 = _c1961;
                  }
                  _c1963 = !(_c1962);
                }
                if (!(_c1963)) continue;
                _g1947++;
              }
            }
            _c1964 = (_g1947 < 2);
          }
          freshBinding("sharedFateEmpties", [(sp.lines.includes(v_L)), (((sp.lineCells[v_L].length - clueAt(cl.count, v_L)) - _g1879) === 1), (_g1899.includes(v_p)), (sp.adj4[v_p].includes(v_q)), _c1964], ["L in", "where of L", "p in", "q in", "where of q"]);
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
  const _g2009: number[] = [];
  const _g2054: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _k2035 = exitsKept.board(cl);
  const _m298_0 = b.made[0];
  const _m298_2 = b.made[2];
  _g2009.length = 0;
  G2010: {
    const _a2027 = sp.edges;
    for (let _i2028 = 0; _i2028 < _a2027.length; _i2028++) {
      const v_x = _a2027[_i2028];
      let _c2043: boolean = !((b.grid[v_x] !== 0));
      if (_c2043) {
        const _t2029 = sp.edgeEnds[2 * v_x];
        const _t2030 = sp.edgeEnds[2 * v_x + 1];
        let _c2042: boolean = ((((b.grid[sp.edgeOf(_t2029, _t2030)] || -1) === 2) || !(((b.edgeCand(_t2029) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t2030) >> 1) & 1) !== 0));
        if (!_c2042) {
          let _c2041: boolean = ((b.grid[sp.edgeOf(_t2029, _t2030)] || -1) !== 1);
          if (_c2041) {
            let _g2031 = 0;
            G2032: {
              const _a2033 = sp.adj4[_t2029];
              for (let _i2034 = 0; _i2034 < _a2033.length; _i2034++) {
                if (!(((b.grid[sp.adj4Edges[_t2029][_i2034]] || -1) === 1))) continue;
                _g2031++;
              }
            }
            let _c2040: boolean = ((_g2031 + (_k2035[_t2029] ?? exits(sp, cl, _t2029))) === 2);
            if (!_c2040) {
              let _g2036 = 0;
              G2037: {
                const _a2038 = sp.adj4[_t2030];
                for (let _i2039 = 0; _i2039 < _a2038.length; _i2039++) {
                  if (!(((b.grid[sp.adj4Edges[_t2030][_i2039]] || -1) === 1))) continue;
                  _g2036++;
                }
              }
              _c2040 = ((_g2036 + (_k2035[_t2030] ?? exits(sp, cl, _t2030))) === 2);
            }
            _c2041 = _c2040;
          }
          _c2042 = _c2041;
        }
        _c2043 = !(_c2042);
      }
      if (!(_c2043)) continue;
      _g2009.push(v_x);
    }
  }
  const v_O = _g2009;
  const _a2044 = cutEdges(sp, v_O);
  for (let _i2045 = 0; _i2045 < _a2044.length; _i2045++) {
    const v_e = _a2044[_i2045];
    const v_G = through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)));
    let _g2046 = 0;
    G2047: {
      const _a2048 = v_G;
      for (let _i2049 = 0; _i2049 < _a2048.length; _i2049++) {
        const v_c = _a2048[_i2049];
        let _g2050 = 0;
        G2051: {
          const _a2052 = sp.adj4[v_c];
          for (let _i2053 = 0; _i2053 < _a2052.length; _i2053++) {
            const v_y = _a2052[_i2053];
            if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i2053]] || -1) === 1)))) continue;
            _g2050++;
          }
        }
        _g2046 += (_g2050 + (_k2035[v_c] ?? exits(sp, cl, v_c)));
      }
    }
    const v_k = _g2046;
    if (b.made[0] !== _m298_0 || b.made[2] !== _m298_2) {
      _g2054.length = 0;
      G2055: {
        const _a2072 = sp.edges;
        for (let _i2073 = 0; _i2073 < _a2072.length; _i2073++) {
          const v_x = _a2072[_i2073];
          let _c2087: boolean = !((b.grid[v_x] !== 0));
          if (_c2087) {
            const _t2074 = sp.edgeEnds[2 * v_x];
            const _t2075 = sp.edgeEnds[2 * v_x + 1];
            let _c2086: boolean = ((((b.grid[sp.edgeOf(_t2074, _t2075)] || -1) === 2) || !(((b.edgeCand(_t2074) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t2075) >> 1) & 1) !== 0));
            if (!_c2086) {
              let _c2085: boolean = ((b.grid[sp.edgeOf(_t2074, _t2075)] || -1) !== 1);
              if (_c2085) {
                let _g2076 = 0;
                G2077: {
                  const _a2078 = sp.adj4[_t2074];
                  for (let _i2079 = 0; _i2079 < _a2078.length; _i2079++) {
                    if (!(((b.grid[sp.adj4Edges[_t2074][_i2079]] || -1) === 1))) continue;
                    _g2076++;
                  }
                }
                let _c2084: boolean = ((_g2076 + exits(sp, cl, _t2074)) === 2);
                if (!_c2084) {
                  let _g2080 = 0;
                  G2081: {
                    const _a2082 = sp.adj4[_t2075];
                    for (let _i2083 = 0; _i2083 < _a2082.length; _i2083++) {
                      if (!(((b.grid[sp.adj4Edges[_t2075][_i2083]] || -1) === 1))) continue;
                      _g2080++;
                    }
                  }
                  _c2084 = ((_g2080 + exits(sp, cl, _t2075)) === 2);
                }
                _c2085 = _c2084;
              }
              _c2086 = _c2085;
            }
            _c2087 = !(_c2086);
          }
          if (!(_c2087)) continue;
          _g2054.push(v_x);
        }
      }
      if (!(sameSet(v_O, _g2054))) { return fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
      const _g2088: number[] = [];
      G2089: {
        const _a2106 = sp.edges;
        for (let _i2107 = 0; _i2107 < _a2106.length; _i2107++) {
          const v_x = _a2106[_i2107];
          let _c2121: boolean = !((b.grid[v_x] !== 0));
          if (_c2121) {
            const _t2108 = sp.edgeEnds[2 * v_x];
            const _t2109 = sp.edgeEnds[2 * v_x + 1];
            let _c2120: boolean = ((((b.grid[sp.edgeOf(_t2108, _t2109)] || -1) === 2) || !(((b.edgeCand(_t2108) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t2109) >> 1) & 1) !== 0));
            if (!_c2120) {
              let _c2119: boolean = ((b.grid[sp.edgeOf(_t2108, _t2109)] || -1) !== 1);
              if (_c2119) {
                let _g2110 = 0;
                G2111: {
                  const _a2112 = sp.adj4[_t2108];
                  for (let _i2113 = 0; _i2113 < _a2112.length; _i2113++) {
                    if (!(((b.grid[sp.adj4Edges[_t2108][_i2113]] || -1) === 1))) continue;
                    _g2110++;
                  }
                }
                let _c2118: boolean = ((_g2110 + exits(sp, cl, _t2108)) === 2);
                if (!_c2118) {
                  let _g2114 = 0;
                  G2115: {
                    const _a2116 = sp.adj4[_t2109];
                    for (let _i2117 = 0; _i2117 < _a2116.length; _i2117++) {
                      if (!(((b.grid[sp.adj4Edges[_t2109][_i2117]] || -1) === 1))) continue;
                      _g2114++;
                    }
                  }
                  _c2118 = ((_g2114 + exits(sp, cl, _t2109)) === 2);
                }
                _c2119 = _c2118;
              }
              _c2120 = _c2119;
            }
            _c2121 = !(_c2120);
          }
          if (!(_c2121)) continue;
          _g2088.push(v_x);
        }
      }
      let _g2122 = 0;
      G2123: {
        const _a2124 = v_G;
        for (let _i2125 = 0; _i2125 < _a2124.length; _i2125++) {
          const v_c = _a2124[_i2125];
          let _g2126 = 0;
          G2127: {
            const _a2128 = sp.adj4[v_c];
            for (let _i2129 = 0; _i2129 < _a2128.length; _i2129++) {
              const v_y = _a2128[_i2129];
              if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i2129]] || -1) === 1)))) continue;
              _g2126++;
            }
          }
          _g2122 += (_g2126 + exits(sp, cl, v_c));
        }
      }
      freshBinding("parity", [sameSet(v_O, _g2088), (cutEdges(sp, v_O).includes(v_e)), sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)))), (v_k === _g2122)], ["O =", "e in", "G =", "k ="]);
    }
    facts.length = 0;
    changed = false;
    let _c2130: boolean = !(((v_k % 2) === 1));
    if (!_c2130) {
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      _c2130 = true;
    }
    let _c2132: boolean = _c2130;
    if (_c2132) {
      let _c2131: boolean = !(((v_k % 2) === 0));
      if (!_c2131) {
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        _c2131 = true;
      }
      _c2132 = _c2131;
    }
    if (!(_c2132)) return -1;
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
  let _g511 = 0;
  G512: {
    const _a513 = sp.lineCells[v_L];
    for (let _i514 = 0; _i514 < _a513.length; _i514++) {
      const v_c = _a513[_i514];
      let _c519: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
      if (!_c519) {
        let _g515 = 0;
        G516: {
          const _a517 = sp.adj4[v_c];
          for (let _i518 = 0; _i518 < _a517.length; _i518++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i518]] || -1) === 1))) continue;
            _g515++;
          }
        }
        _c519 = ((_g515 + exits(sp, cl, v_c)) > 0);
      }
      if (!(_c519)) continue;
      _g511++;
    }
  }
  const _made = _g511;
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
  let _q1183 = true;
  Q1184: {
    const _a1185 = sp.adj4[v_c];
    for (let _i1186 = 0; _i1186 < _a1185.length; _i1186++) {
      const v_y = _a1185[_i1186];
      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
      let _c1198: boolean = ((((b.grid[sp.adj4Edges[v_c][_i1186]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
      if (!_c1198) {
        let _c1197: boolean = ((b.grid[sp.adj4Edges[v_c][_i1186]] || -1) !== 1);
        if (_c1197) {
          let _g1187 = 0;
          G1188: {
            const _a1189 = sp.adj4[v_c];
            for (let _i1190 = 0; _i1190 < _a1189.length; _i1190++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i1190]] || -1) === 1))) continue;
              _g1187++;
            }
          }
          let _c1196: boolean = ((_g1187 + exits(sp, cl, v_c)) === 2);
          if (!_c1196) {
            let _g1191 = 0;
            G1192: {
              const _a1194 = sp.adj4[v_y];
              for (let _i1195 = 0; _i1195 < _a1194.length; _i1195++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i1195]] || -1) === 1))) continue;
                _g1191++;
              }
            }
            _c1196 = ((_g1191 + exits(sp, cl, v_y)) === 2);
          }
          _c1197 = _c1196;
        }
        _c1198 = _c1197;
      }
      if (!(!(_c1198))) {
        _q1183 = false;
        break Q1184;
      }
    }
  }
  let _c1203: boolean = _q1183;
  if (_c1203) {
    let _g1199 = 0;
    G1200: {
      const _a1201 = sp.adj4[v_c];
      for (let _i1202 = 0; _i1202 < _a1201.length; _i1202++) {
        const v_y = _a1201[_i1202];
        if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
        _g1199++;
      }
    }
    _c1203 = ((_g1199 === 2) || ((clueAt(cl.end, v_c) >= 1) && !(((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L)))))));
  }
  const _made = _c1203;
  crossableMarkedKept.set((v_c + 1) * 1048577 + (v_L + 1), _made);
  return _made;
}
