// Compiled by `npm run describe` from src/games/loopy/loopy.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, RELATE, STRIKE_EDGE, clueAt, edgeGroups, keptEdgeGroups, keptStore, least, minus, popcount, rangeMask, sameSet, setOf, type Footprint, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "deadEnd" | "lineContinues" | "dotFull" | "clueFull" | "clueStarved" | "clueBlockedPair" | "clueOneShort" | "earlyLoop" | "closed" | "related" | "cornerAtDot" | "cornerOther" | "cornerBoth" | "clueBound" | "cornerFromClue" | "cornerAcross" | "cornerExit" | "cornerOppositeExit" | "matchingPair" | "pairAtClue" | "parityClue" | "linkClue" | "pairFromCorner" | "cornerFromPair" | "pairAtDot" | "parityDot" | "linkDot";

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
  { id: "deadEnd", tier: 0 },
  { id: "lineContinues", tier: 0 },
  { id: "dotFull", tier: 0 },
  { id: "clueFull", tier: 0 },
  { id: "clueStarved", tier: 0 },
  { id: "clueBlockedPair", tier: 0 },
  { id: "clueOneShort", tier: 0 },
  { id: "earlyLoop", tier: 0 },
  { id: "closed", tier: 0 },
  { id: "related", tier: 0 },
  { id: "cornerAtDot", tier: 1 },
  { id: "cornerOther", tier: 1 },
  { id: "cornerBoth", tier: 1 },
  { id: "clueBound", tier: 1 },
  { id: "cornerFromClue", tier: 2 },
  { id: "cornerAcross", tier: 2 },
  { id: "cornerExit", tier: 2 },
  { id: "cornerOppositeExit", tier: 2 },
  { id: "matchingPair", tier: 3 },
  { id: "pairAtClue", tier: 3 },
  { id: "parityClue", tier: 3 },
  { id: "linkClue", tier: 3 },
  { id: "pairFromCorner", tier: 3 },
  { id: "cornerFromPair", tier: 3 },
  { id: "pairAtDot", tier: 3 },
  { id: "parityDot", tier: 3 },
  { id: "linkDot", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g1395: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1373 = true;
  Q1374: {
    const _a1375 = sp.cells;
    for (let _i1376 = 0; _i1376 < _a1375.length; _i1376++) {
      const v_c = _a1375[_i1376];
      let _g1377 = 0;
      G1378: {
        const _a1379 = sp.cellEdges[v_c];
        for (let _i1380 = 0; _i1380 < _a1379.length; _i1380++) {
          const v_e = _a1379[_i1380];
          const _h1381 = (g[v_e] || -1);
          if (!((_h1381 === 1))) continue;
          _g1377++;
        }
      }
      let _c1387: boolean = (_g1377 === 0);
      if (!_c1387) {
        let _g1382 = 0;
        G1383: {
          const _a1384 = sp.cellEdges[v_c];
          for (let _i1385 = 0; _i1385 < _a1384.length; _i1385++) {
            const v_e = _a1384[_i1385];
            const _h1386 = (g[v_e] || -1);
            if (!((_h1386 === 1))) continue;
            _g1382++;
          }
        }
        _c1387 = (_g1382 === 2);
      }
      if (!(_c1387)) {
        _q1373 = false;
        break Q1374;
      }
    }
  }
  if (!(_q1373)) return false;
  let _q1388 = false;
  Q1389: {
    const _a1390 = sp.edges;
    for (let _i1391 = 0; _i1391 < _a1390.length; _i1391++) {
      const v_e = _a1390[_i1391];
      const _h1392 = (g[v_e] || -1);
      if ((_h1392 === 1)) {
        _q1388 = true;
        break Q1389;
      }
    }
  }
  let _c1417: boolean = _q1388;
  if (_c1417) {
    let _q1393 = true;
    Q1394: {
      _g1395.length = 0;
      G1396: {
        const _a1399 = sp.edges;
        for (let _i1400 = 0; _i1400 < _a1399.length; _i1400++) {
          const v_e = _a1399[_i1400];
          const _h1401 = (g[v_e] || -1);
          if (!((_h1401 === 1))) continue;
          _g1395.push(v_e);
        }
      }
      const v_L = _g1395;
      const _eg1416 = edgeGroups(sp, v_L);
      const _a1402 = sp.cells;
      for (let _i1403 = 0; _i1403 < _a1402.length; _i1403++) {
        const v_a = _a1402[_i1403];
        let _g1404 = 0;
        G1405: {
          const _a1406 = sp.cellEdges[v_a];
          for (let _i1407 = 0; _i1407 < _a1406.length; _i1407++) {
            const v_e = _a1406[_i1407];
            const _h1408 = (g[v_e] || -1);
            if (!((_h1408 === 1))) continue;
            _g1404++;
          }
        }
        if (!((_g1404 > 0))) continue;
        const _a1409 = sp.cells;
        for (let _i1410 = 0; _i1410 < _a1409.length; _i1410++) {
          const v_b = _a1409[_i1410];
          let _g1411 = 0;
          G1412: {
            const _a1413 = sp.cellEdges[v_b];
            for (let _i1414 = 0; _i1414 < _a1413.length; _i1414++) {
              const v_e = _a1413[_i1414];
              const _h1415 = (g[v_e] || -1);
              if (!((_h1415 === 1))) continue;
              _g1411++;
            }
          }
          if (!((_g1411 > 0))) continue;
          if (!((_eg1416.of(v_b) === _eg1416.of(v_a)))) {
            _q1393 = false;
            break Q1394;
          }
        }
      }
    }
    _c1417 = _q1393;
  }
  if (!(_c1417)) return false;
  for (let _k1418 = 0; _k1418 < cl.number.at.length; _k1418++) {
    const _at1419 = cl.number.at[_k1418];
    let _g1421 = 0;
    G1422: {
      const _a1423 = sp.faceEdges[_at1419];
      for (let _i1424 = 0; _i1424 < _a1423.length; _i1424++) {
        const v_e = _a1423[_i1424];
        const _h1425 = (g[v_e] || -1);
        if (!((_h1425 === 1))) continue;
        _g1421++;
      }
    }
    if (!((_g1421 === clueAt(cl.number, _at1419)))) return false;
  }
  return true;
}

export interface DeadEndBinding {
  c: number;
}

const deadEndFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const deadEndFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function deadEnd(b: Marks, sp: GridSpace, fire: Fire<DeadEndBinding> | null): number {
  const facts = deadEndFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(deadEndFootprint) ?? null) : null;
  const _a12 = sp.cells;
  for (let _i13 = 0; _i13 < _a12.length; _i13++) {
    const v_c = _a12[_i13];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g14 = 0;
    G15: {
      const _a16 = sp.cellEdges[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_e = _a16[_i17];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g14++;
      }
    }
    let _c22: boolean = (_g14 === 0);
    if (_c22) {
      let _g18 = 0;
      G19: {
        const _a20 = sp.cellEdges[v_c];
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_e = _a20[_i21];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g18++;
        }
      }
      _c22 = (_g18 === 1);
    }
    if (!(_c22)) continue;
    facts.length = 0;
    changed = false;
    let _q23 = true;
    Q24: {
      const _a25 = sp.cellEdges[v_c];
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_e = _a25[_i26];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) {
          _q23 = false;
          break Q24;
        }
      }
    }
    if (!(_q23)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface LineContinuesBinding {
  c: number;
  o: number;
}

const lineContinuesFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const lineContinuesFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function lineContinues(b: Marks, sp: GridSpace, fire: Fire<LineContinuesBinding> | null): number {
  const facts = lineContinuesFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(lineContinuesFootprint) ?? null) : null;
  const _a38 = sp.cells;
  for (let _i39 = 0; _i39 < _a38.length; _i39++) {
    const v_c = _a38[_i39];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g40 = 0;
    G41: {
      const _a42 = sp.cellEdges[v_c];
      for (let _i43 = 0; _i43 < _a42.length; _i43++) {
        const v_e = _a42[_i43];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g40++;
      }
    }
    L44: {
      const v_o = _g40;
      let _g45 = 0;
      G46: {
        const _a47 = sp.cellEdges[v_c];
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_e = _a47[_i48];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g45++;
        }
      }
      if (!(((_g45 === 1) && (v_o <= 1)))) break L44;
      facts.length = 0;
      changed = false;
      let _c53: boolean = (v_o === 1);
      if (_c53) {
        let _q49 = true;
        Q50: {
          const _a51 = sp.cellEdges[v_c];
          for (let _i52 = 0; _i52 < _a51.length; _i52++) {
            const v_e = _a51[_i52];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            if (!(true)) {
              _q49 = false;
              break Q50;
            }
          }
        }
        _c53 = _q49;
      }
      if (!(_c53)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, o: v_o }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DotFullBinding {
  c: number;
  k: number;
}

const dotFullFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const dotFullFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function dotFull(b: Marks, sp: GridSpace, fire: Fire<DotFullBinding> | null): number {
  const facts = dotFullFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(dotFullFootprint) ?? null) : null;
  const _a67 = sp.cells;
  for (let _i68 = 0; _i68 < _a67.length; _i68++) {
    const v_c = _a67[_i68];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g69 = 0;
    G70: {
      const _a71 = sp.cellEdges[v_c];
      for (let _i72 = 0; _i72 < _a71.length; _i72++) {
        const v_e = _a71[_i72];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g69++;
      }
    }
    L73: {
      const v_k = _g69;
      let _c79: boolean = (v_k > 2);
      if (!_c79) {
        let _c78: boolean = (v_k === 2);
        if (_c78) {
          let _g74 = 0;
          G75: {
            const _a76 = sp.cellEdges[v_c];
            for (let _i77 = 0; _i77 < _a76.length; _i77++) {
              const v_e = _a76[_i77];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g74++;
            }
          }
          _c78 = (_g74 > 0);
        }
        _c79 = _c78;
      }
      if (!(_c79)) break L73;
      facts.length = 0;
      changed = false;
      let _c84: boolean = (v_k === 2);
      if (_c84) {
        let _q80 = true;
        Q81: {
          const _a82 = sp.cellEdges[v_c];
          for (let _i83 = 0; _i83 < _a82.length; _i83++) {
            const v_e = _a82[_i83];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q80 = false;
              break Q81;
            }
          }
        }
        _c84 = _q80;
      }
      if (!(_c84)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, k: v_k }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueFullBinding {
  f: number;
  n: number;
}

const clueFullFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueFullFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueFullBinding> | null): number {
  const facts = clueFullFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueFullFootprint) ?? null) : null;
  const _a98 = sp.faces;
  for (let _i99 = 0; _i99 < _a98.length; _i99++) {
    const v_f = _a98[_i99];
    const _h100 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h100 !== -1))) continue;
    let _g101 = 0;
    G102: {
      const _a103 = sp.faceEdges[v_f];
      for (let _i104 = 0; _i104 < _a103.length; _i104++) {
        const v_e = _a103[_i104];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g101++;
      }
    }
    L105: {
      const v_n = (_h100 - _g101);
      let _c111: boolean = (v_n < 0);
      if (!_c111) {
        let _c110: boolean = (v_n === 0);
        if (_c110) {
          let _g106 = 0;
          G107: {
            const _a108 = sp.faceEdges[v_f];
            for (let _i109 = 0; _i109 < _a108.length; _i109++) {
              const v_e = _a108[_i109];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g106++;
            }
          }
          _c110 = (_g106 > 0);
        }
        _c111 = _c110;
      }
      if (!(_c111)) break L105;
      facts.length = 0;
      changed = false;
      let _c116: boolean = (v_n === 0);
      if (_c116) {
        let _q112 = true;
        Q113: {
          const _a114 = sp.faceEdges[v_f];
          for (let _i115 = 0; _i115 < _a114.length; _i115++) {
            const v_e = _a114[_i115];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q112 = false;
              break Q113;
            }
          }
        }
        _c116 = _q112;
      }
      if (!(_c116)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueStarvedBinding {
  f: number;
  n: number;
  o: number;
}

const clueStarvedFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueStarvedFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueStarved(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueStarvedBinding> | null): number {
  const facts = clueStarvedFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueStarvedFootprint) ?? null) : null;
  const _a128 = sp.faces;
  for (let _i129 = 0; _i129 < _a128.length; _i129++) {
    const v_f = _a128[_i129];
    const _h130 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h130 !== -1))) continue;
    let _g131 = 0;
    G132: {
      const _a133 = sp.faceEdges[v_f];
      for (let _i134 = 0; _i134 < _a133.length; _i134++) {
        const v_e = _a133[_i134];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g131++;
      }
    }
    const v_n = (_h130 - _g131);
    let _g135 = 0;
    G136: {
      const _a137 = sp.faceEdges[v_f];
      for (let _i138 = 0; _i138 < _a137.length; _i138++) {
        const v_e = _a137[_i138];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g135++;
      }
    }
    L139: {
      const v_o = _g135;
      if (!(((v_n > 0) && (v_o <= v_n)))) break L139;
      facts.length = 0;
      changed = false;
      let _c144: boolean = (v_o === v_n);
      if (_c144) {
        let _q140 = true;
        Q141: {
          const _a142 = sp.faceEdges[v_f];
          for (let _i143 = 0; _i143 < _a142.length; _i143++) {
            const v_e = _a142[_i143];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            if (!(true)) {
              _q140 = false;
              break Q141;
            }
          }
        }
        _c144 = _q140;
      }
      if (!(_c144)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, n: v_n, o: v_o }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueBlockedPairBinding {
  f: number;
  e: number;
}

const clueBlockedPairFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueBlockedPairFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueBlockedPair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBlockedPairBinding> | null): number {
  const facts = clueBlockedPairFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueBlockedPairFootprint) ?? null) : null;
  const _a177 = sp.faces;
  R1:
  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
    const v_f = _a177[_i178];
    const _m114_0 = b.made[0];
    const _h179 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c188: boolean = (_h179 !== -1);
    if (_c188) {
      let _g180 = 0;
      G181: {
        const _a182 = sp.faceEdges[v_f];
        for (let _i183 = 0; _i183 < _a182.length; _i183++) {
          const v_e = _a182[_i183];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g180++;
        }
      }
      let _g184 = 0;
      G185: {
        const _a186 = sp.faceEdges[v_f];
        for (let _i187 = 0; _i187 < _a186.length; _i187++) {
          const v_e = _a186[_i187];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g184++;
        }
      }
      _c188 = ((_h179 - _g180) === (_g184 - 1));
    }
    let _c193: boolean = _c188;
    if (_c193) {
      let _g189 = 0;
      G190: {
        const _a191 = sp.faceEdges[v_f];
        for (let _i192 = 0; _i192 < _a191.length; _i192++) {
          const v_e = _a191[_i192];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g189++;
        }
      }
      _c193 = (_g189 > 2);
    }
    if (!(_c193)) continue;
    const _a194 = sp.faceEdges[v_f];
    for (let _i195 = 0; _i195 < _a194.length; _i195++) {
      const v_e = _a194[_i195];
      let _c209: boolean = !((b.grid[v_e] !== 0));
      if (_c209) {
        let _q196 = true;
        Q197: {
          const _a198 = [sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]];
          for (let _i199 = 0; _i199 < _a198.length; _i199++) {
            const v_c = _a198[_i199];
            let _g200 = 0;
            G201: {
              const _a202 = sp.cellEdges[v_c];
              for (let _i203 = 0; _i203 < _a202.length; _i203++) {
                const v_e = _a202[_i203];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g200++;
              }
            }
            let _c208: boolean = (_g200 > 0);
            if (_c208) {
              let _q204 = true;
              Q205: {
                const _a206 = sp.faceEdges[v_f];
                for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                  const v_g = _a206[_i207];
                  if (!(((v_g !== v_e) && ([sp.edgeEnds[2 * v_g], sp.edgeEnds[2 * v_g + 1]].includes(v_c))))) continue;
                  if (!(!((b.grid[v_g] !== 0)))) {
                    _q204 = false;
                    break Q205;
                  }
                }
              }
              _c208 = _q204;
            }
            if (!(_c208)) {
              _q196 = false;
              break Q197;
            }
          }
        }
        _c209 = _q196;
      }
      if (!(_c209)) continue;
      if (b.made[0] !== _m114_0) {
        let _c218: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c218) {
          let _g210 = 0;
          G211: {
            const _a212 = sp.faceEdges[v_f];
            for (let _i213 = 0; _i213 < _a212.length; _i213++) {
              const v_e = _a212[_i213];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g210++;
            }
          }
          let _g214 = 0;
          G215: {
            const _a216 = sp.faceEdges[v_f];
            for (let _i217 = 0; _i217 < _a216.length; _i217++) {
              const v_e = _a216[_i217];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g214++;
            }
          }
          _c218 = ((clueAt(cl.number, v_f) - _g210) === (_g214 - 1));
        }
        let _c223: boolean = _c218;
        if (_c223) {
          let _g219 = 0;
          G220: {
            const _a221 = sp.faceEdges[v_f];
            for (let _i222 = 0; _i222 < _a221.length; _i222++) {
              const v_e = _a221[_i222];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g219++;
            }
          }
          _c223 = (_g219 > 2);
        }
        if (!(_c223)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      let _c228: boolean = true;
      if (_c228) {
        let _q224 = true;
        Q225: {
          const _a226 = sp.faceEdges[v_f];
          for (let _i227 = 0; _i227 < _a226.length; _i227++) {
            const v_g = _a226[_i227];
            if (!(((v_g !== v_e) && !((b.grid[v_g] !== 0))))) continue;
            if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
            if (!(true)) {
              _q224 = false;
              break Q225;
            }
          }
        }
        _c228 = _q224;
      }
      if (!(_c228)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, e: v_e }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueOneShortBinding {
  f: number;
  a: number;
}

const clueOneShortFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const clueOneShortFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceAngles","angleEdges"],"kind":"answer"},{"steps":["faceAngles","angleCell","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueOneShort(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueOneShortBinding> | null): number {
  const facts = clueOneShortFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(clueOneShortFootprint) ?? null) : null;
  const _a257 = sp.faces;
  R1:
  for (let _i258 = 0; _i258 < _a257.length; _i258++) {
    const v_f = _a257[_i258];
    const _m142_0 = b.made[0];
    const _h259 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c268: boolean = (_h259 !== -1);
    if (_c268) {
      let _g260 = 0;
      G261: {
        const _a262 = sp.faceEdges[v_f];
        for (let _i263 = 0; _i263 < _a262.length; _i263++) {
          const v_e = _a262[_i263];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g260++;
        }
      }
      let _g264 = 0;
      G265: {
        const _a266 = sp.faceEdges[v_f];
        for (let _i267 = 0; _i267 < _a266.length; _i267++) {
          const v_e = _a266[_i267];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g264++;
        }
      }
      _c268 = ((_h259 - _g260) === (_g264 - 1));
    }
    let _c273: boolean = _c268;
    if (_c273) {
      let _g269 = 0;
      G270: {
        const _a271 = sp.faceEdges[v_f];
        for (let _i272 = 0; _i272 < _a271.length; _i272++) {
          const v_e = _a271[_i272];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g269++;
        }
      }
      _c273 = (_g269 > 2);
    }
    if (!(_c273)) continue;
    const _a274 = sp.faceAngles[v_f];
    for (let _i275 = 0; _i275 < _a274.length; _i275++) {
      const v_a = _a274[_i275];
      let _q276 = true;
      Q277: {
        const _a278 = sp.angleEdges[v_a];
        for (let _i279 = 0; _i279 < _a278.length; _i279++) {
          const v_e = _a278[_i279];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q276 = false;
            break Q277;
          }
        }
      }
      let _c285: boolean = _q276;
      if (_c285) {
        const _t280 = sp.angleCell[v_a];
        let _g281 = 0;
        G282: {
          const _a283 = sp.cellEdges[_t280];
          for (let _i284 = 0; _i284 < _a283.length; _i284++) {
            const v_e = _a283[_i284];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g281++;
          }
        }
        _c285 = (_g281 > 0);
      }
      if (!(_c285)) continue;
      if (b.made[0] !== _m142_0) {
        let _c294: boolean = (clueAt(cl.number, v_f) !== -1);
        if (_c294) {
          let _g286 = 0;
          G287: {
            const _a288 = sp.faceEdges[v_f];
            for (let _i289 = 0; _i289 < _a288.length; _i289++) {
              const v_e = _a288[_i289];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g286++;
            }
          }
          let _g290 = 0;
          G291: {
            const _a292 = sp.faceEdges[v_f];
            for (let _i293 = 0; _i293 < _a292.length; _i293++) {
              const v_e = _a292[_i293];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g290++;
            }
          }
          _c294 = ((clueAt(cl.number, v_f) - _g286) === (_g290 - 1));
        }
        let _c299: boolean = _c294;
        if (_c299) {
          let _g295 = 0;
          G296: {
            const _a297 = sp.faceEdges[v_f];
            for (let _i298 = 0; _i298 < _a297.length; _i298++) {
              const v_e = _a297[_i298];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g295++;
            }
          }
          _c299 = (_g295 > 2);
        }
        if (!(_c299)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
      }
      facts.length = 0;
      changed = false;
      let _q300 = true;
      Q301: {
        const _a302 = sp.faceEdges[v_f];
        for (let _i303 = 0; _i303 < _a302.length; _i303++) {
          const v_g = _a302[_i303];
          if (!((!((b.grid[v_g] !== 0)) && !(sp.angleEdges[v_a].includes(v_g))))) continue;
          if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
          if (!(true)) {
            _q300 = false;
            break Q301;
          }
        }
      }
      if (!(_q300)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ f: v_f, a: v_a }, facts)) return 1;
      }
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
  const _g331: number[] = [];
  const _g360: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  const _m167_0 = b.made[0];
  _g331.length = 0;
  G332: {
    const _a335 = sp.edges;
    for (let _i336 = 0; _i336 < _a335.length; _i336++) {
      const v_e = _a335[_i336];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g331.push(v_e);
    }
  }
  const v_L = _g331;
  const _m170_1 = b.made[1];
  const _m170_2 = b.made[2];
  const _m170_4 = b.made[4];
  const _eg339 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a337 = sp.edges;
  for (let _i338 = 0; _i338 < _a337.length; _i338++) {
    const v_e = _a337[_i338];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L340: {
      const v_G = _eg339.of(sp.edgeEnds[2 * v_e]);
      let _c359: boolean = (_eg339.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c359) {
        let _q341 = false;
        Q342: {
          const _a343 = v_L;
          for (let _i344 = 0; _i344 < _a343.length; _i344++) {
            const v_g = _a343[_i344];
            if (!(_eg339.of(sp.edgeEnds[2 * v_g]) === v_G)) {
              _q341 = true;
              break Q342;
            }
          }
        }
        let _c358: boolean = _q341;
        if (!_c358) {
          let _q345 = false;
          Q346: {
            const _a347 = sp.faces;
            for (let _i348 = 0; _i348 < _a347.length; _i348++) {
              const v_f = _a347[_i348];
              const _h349 = clueAt(cl.number, v_f);
              if (!((_h349 !== -1))) continue;
              let _g350 = 0;
              G351: {
                const _a352 = sp.faceEdges[v_f];
                for (let _i353 = 0; _i353 < _a352.length; _i353++) {
                  const v_e = _a352[_i353];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g350++;
                }
              }
              let _g354 = 0;
              G355: {
                const _a356 = sp.faceEdges[v_f];
                for (let _i357 = 0; _i357 < _a356.length; _i357++) {
                  const v_x = _a356[_i357];
                  if (!((v_x === v_e))) continue;
                  _g354++;
                }
              }
              if (((_h349 - _g350) !== _g354)) {
                _q345 = true;
                break Q346;
              }
            }
          }
          _c358 = _q345;
        }
        _c359 = _c358;
      }
      if (!(_c359)) break L340;
      if (b.made[0] !== _m167_0 || b.made[1] !== _m170_1 || b.made[2] !== _m170_2 || b.made[4] !== _m170_4) {
        _g360.length = 0;
        G361: {
          const _a364 = sp.edges;
          for (let _i365 = 0; _i365 < _a364.length; _i365++) {
            const v_e = _a364[_i365];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g360.push(v_e);
          }
        }
        if (!(sameSet(v_L, _g360))) { return fired; }
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

export interface ClosedBinding {
  L: readonly number[];
  g: number;
}

const closedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function closed(b: Marks, sp: GridSpace, fire: Fire<ClosedBinding> | null): number {
  const _g392: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g392.length = 0;
  G393: {
    const _a396 = sp.edges;
    for (let _i397 = 0; _i397 < _a396.length; _i397++) {
      const v_e = _a396[_i397];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g392.push(v_e);
    }
  }
  const v_L = _g392;
  const _eg418 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L398: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    const _h417 = sp.edgeEnds[2 * v_g];
    let _c403: boolean = (v_g !== -1);
    if (_c403) {
      let _q399 = false;
      Q400: {
        const _a401 = sp.edges;
        for (let _i402 = 0; _i402 < _a401.length; _i402++) {
          const v_e = _a401[_i402];
          if (!((b.grid[v_e] !== 0))) {
            _q399 = true;
            break Q400;
          }
        }
      }
      _c403 = _q399;
    }
    let _c412: boolean = _c403;
    if (_c412) {
      let _q404 = true;
      Q405: {
        const _a406 = sp.cells;
        for (let _i407 = 0; _i407 < _a406.length; _i407++) {
          const v_c = _a406[_i407];
          let _g408 = 0;
          G409: {
            const _a410 = sp.cellEdges[v_c];
            for (let _i411 = 0; _i411 < _a410.length; _i411++) {
              const v_e = _a410[_i411];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g408++;
            }
          }
          if (!((_g408 !== 1))) {
            _q404 = false;
            break Q405;
          }
        }
      }
      _c412 = _q404;
    }
    let _c419: boolean = _c412;
    if (_c419) {
      let _q413 = true;
      Q414: {
        const _a415 = v_L;
        for (let _i416 = 0; _i416 < _a415.length; _i416++) {
          const v_x = _a415[_i416];
          if (!((_eg418.of(sp.edgeEnds[2 * v_x]) === _eg418.of(_h417)))) {
            _q413 = false;
            break Q414;
          }
        }
      }
      _c419 = _q413;
    }
    if (!(_c419)) break L398;
    facts.length = 0;
    changed = false;
    let _q420 = true;
    Q421: {
      const _a422 = sp.edges;
      for (let _i423 = 0; _i423 < _a422.length; _i423++) {
        const v_e = _a422[_i423];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) {
          _q420 = false;
          break Q421;
        }
      }
    }
    if (!(_q420)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ L: v_L.slice(), g: v_g }, facts)) return 1;
    }
  }
  return fired;
}

export interface RelatedBinding {
  e: number;
  g: number;
}

const relatedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function related(b: Marks, sp: GridSpace, fire: Fire<RelatedBinding> | null): number {
  const facts = relatedFacts;
  let fired = 0;
  let changed = false;
  const _h432 = ((1 << 1));
  const _h435 = ((1 << 2));
  const _a428 = sp.edges;
  R1:
  for (let _i429 = 0; _i429 < _a428.length; _i429++) {
    const v_e = _a428[_i429];
    const _m216_0 = b.made[0];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _m219_4 = b.made[4];
    const _a430 = b.relatedOf(v_e);
    R2:
    for (let _i431 = 0; _i431 < _a430.length; _i431++) {
      const v_g = _a430[_i431];
      if (!((b.grid[v_g] !== 0))) continue;
      if (b.made[0] !== _m216_0 || b.made[4] !== _m219_4) {
        if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
        if (!((b.relatedOf(v_e).includes(v_g)))) { continue R2; }
      }
      facts.length = 0;
      changed = false;
      let _c434: boolean = !((b.pairOf(v_e, v_g) === _h432));
      if (!_c434) {
        const _t433 = (b.grid[v_g] || -1);
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t433); changed = true; } else facts.push(PLACE, v_e, _t433); }
        _c434 = true;
      }
      let _c438: boolean = _c434;
      if (_c438) {
        let _c437: boolean = !((b.pairOf(v_e, v_g) === _h435));
        if (!_c437) {
          const _t436 = (3 - (b.grid[v_g] || -1));
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t436); changed = true; } else facts.push(PLACE, v_e, _t436); }
          _c437 = true;
        }
        _c438 = _c437;
      }
      if (!(_c438)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, g: v_g }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerAtDotBinding {
  c: number;
  a: number;
}

const cornerAtDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerAtDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellAngles","angleEdges"],"kind":"answer"},{"steps":["cellAngles"],"kind":"edgeMark"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerAtDot(b: Marks, sp: GridSpace, fire: Fire<CornerAtDotBinding> | null): number {
  const facts = cornerAtDotFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(cornerAtDotFootprint) ?? null) : null;
  const _a451 = sp.cells;
  R1:
  for (let _i452 = 0; _i452 < _a451.length; _i452++) {
    const v_c = _a451[_i452];
    const _m234_0 = b.made[0];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g453 = 0;
    G454: {
      const _a455 = sp.cellEdges[v_c];
      for (let _i456 = 0; _i456 < _a455.length; _i456++) {
        const v_e = _a455[_i456];
        const _h457 = (b.grid[v_e] || -1);
        if (!((_h457 === 1))) continue;
        _g453++;
      }
    }
    if (!((_g453 === 1))) continue;
    const _a458 = sp.cellAngles[v_c];
    for (let _i459 = 0; _i459 < _a458.length; _i459++) {
      const v_a = _a458[_i459];
      let _q460 = true;
      Q461: {
        const _a462 = sp.angleEdges[v_a];
        for (let _i463 = 0; _i463 < _a462.length; _i463++) {
          const v_e = _a462[_i463];
          const _h464 = (b.grid[v_e] !== 0);
          if (!(!(_h464))) {
            _q460 = false;
            break Q461;
          }
        }
      }
      if (!(_q460)) continue;
      if (b.made[0] !== _m234_0) {
        let _g465 = 0;
        G466: {
          const _a467 = sp.cellEdges[v_c];
          for (let _i468 = 0; _i468 < _a467.length; _i468++) {
            const v_e = _a467[_i468];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g465++;
          }
        }
        if (!((_g465 === 1))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
      let _c474: boolean = true;
      if (_c474) {
        let _c473: boolean = !((dotOpen(b, sp, v_c) === 2));
        if (!_c473) {
          if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
          _c473 = true;
        }
        _c474 = _c473;
      }
      if (!(_c474)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, a: v_a }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerOtherBinding {
  a: number;
  e: number;
  g: number;
}

const cornerOtherFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerOtherFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerOther(b: Marks, sp: GridSpace, fire: Fire<CornerOtherBinding> | null): number {
  const facts = cornerOtherFacts;
  let fired = 0;
  let changed = false;
  const _h483 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerOtherFootprint) ?? null) : null;
  const _a481 = sp.angles;
  R1:
  for (let _i482 = 0; _i482 < _a481.length; _i482++) {
    const v_a = _a481[_i482];
    const _m252_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    if (!((b.edgeCand(v_a) !== _h483))) continue;
    const _a484 = sp.angleEdges[v_a];
    for (let _i485 = 0; _i485 < _a484.length; _i485++) {
      const v_e = _a484[_i485];
      const _a486 = sp.angleEdges[v_a];
      for (let _i487 = 0; _i487 < _a486.length; _i487++) {
        const v_g = _a486[_i487];
        if (!(((((v_g !== v_e) && (b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && ((((b.grid[v_e] || -1) === 1) && !(((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (((b.grid[v_e] || -1) === 2) && !(((b.edgeCand(v_a) >> 0) & 1) !== 0)))))) continue;
        if (b.made[2] !== _m252_2) {
          if (!((b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
        }
        facts.length = 0;
        changed = false;
        const _t488 = (3 - (b.grid[v_e] || -1));
        if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, _t488); changed = true; } else facts.push(PLACE, v_g, _t488); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, e: v_e, g: v_g }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CornerBothBinding {
  a: number;
  c: number;
}

const cornerBothFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerBothFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerBoth(b: Marks, sp: GridSpace, fire: Fire<CornerBothBinding> | null): number {
  const facts = cornerBothFacts;
  let fired = 0;
  let changed = false;
  const _h508 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerBothFootprint) ?? null) : null;
  const _a506 = sp.angles;
  for (let _i507 = 0; _i507 < _a506.length; _i507++) {
    const v_a = _a506[_i507];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c513: boolean = (b.edgeCand(v_a) !== _h508);
    if (_c513) {
      let _q509 = true;
      Q510: {
        const _a511 = sp.angleEdges[v_a];
        for (let _i512 = 0; _i512 < _a511.length; _i512++) {
          const v_e = _a511[_i512];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q509 = false;
            break Q510;
          }
        }
      }
      _c513 = _q509;
    }
    if (!(_c513)) continue;
    L514: {
      const v_c = sp.angleCell[v_a];
      let _g515 = 0;
      G516: {
        const _a517 = sp.cellEdges[v_c];
        for (let _i518 = 0; _i518 < _a517.length; _i518++) {
          const v_e = _a517[_i518];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g515++;
        }
      }
      let _c523: boolean = (_g515 === 0);
      if (_c523) {
        let _g519 = 0;
        G520: {
          const _a521 = sp.cellEdges[v_c];
          for (let _i522 = 0; _i522 < _a521.length; _i522++) {
            const v_e = _a521[_i522];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g519++;
          }
        }
        _c523 = (_g519 === 2);
      }
      if (!(_c523)) break L514;
      facts.length = 0;
      changed = false;
      let _c529: boolean = ((((b.edgeCand(v_a) >> 0) & 1) !== 0) || (((b.edgeCand(v_a) >> 2) & 1) !== 0));
      if (_c529) {
        let _c528: boolean = !(!(((b.edgeCand(v_a) >> 2) & 1) !== 0));
        if (!_c528) {
          let _q524 = true;
          Q525: {
            const _a526 = sp.angleEdges[v_a];
            for (let _i527 = 0; _i527 < _a526.length; _i527++) {
              const v_e = _a526[_i527];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
              if (!(true)) {
                _q524 = false;
                break Q525;
              }
            }
          }
          _c528 = _q524;
        }
        _c529 = _c528;
      }
      let _c535: boolean = _c529;
      if (_c535) {
        let _c534: boolean = !(!(((b.edgeCand(v_a) >> 0) & 1) !== 0));
        if (!_c534) {
          let _q530 = true;
          Q531: {
            const _a532 = sp.angleEdges[v_a];
            for (let _i533 = 0; _i533 < _a532.length; _i533++) {
              const v_e = _a532[_i533];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q530 = false;
                break Q531;
              }
            }
          }
          _c534 = _q530;
        }
        _c535 = _c534;
      }
      if (!(_c535)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, c: v_c }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ClueBoundBinding {
  f: number;
  n: number;
  e: number;
  S: readonly number[];
  P: boolean;
  Q: boolean;
}

const clueBoundFacts: number[] = [];
let clueBoundCands = new Int32Array(0);
let _f621 = new Int32Array(0);
let _l622: readonly number[] = [];
let _f651 = new Int32Array(0);
let _l652: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const clueBoundFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceAngles","angleEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueBound(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBoundBinding> | null): number {
  if (_f621.length < sp.edges.length) _f621 = new Int32Array(sp.edges.length).fill(-1);
  else _f621.fill(-1);
  _l622 = [];
  const _s623: number[] = [];
  if (_f651.length < sp.edges.length) _f651 = new Int32Array(sp.edges.length).fill(-1);
  else _f651.fill(-1);
  _l652 = [];
  const _s653: number[] = [];
  const facts = clueBoundFacts;
  let fired = 0;
  let changed = false;
  const _h614 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (clueBoundCands.length < sp.edges.length) clueBoundCands = new Int32Array(sp.edges.length);
  const cands = clueBoundCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(clueBoundFootprint) ?? null) : null;
  const _a603 = sp.faces;
  R1:
  for (let _i604 = 0; _i604 < _a603.length; _i604++) {
    const v_f = _a603[_i604];
    const _m292_0 = b.made[0];
    const _m292_2 = b.made[2];
    const _h605 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c615: boolean = (_h605 !== -1);
    if (_c615) {
      let _q606 = false;
      Q607: {
        const _a608 = sp.faceAngles[v_f];
        for (let _i609 = 0; _i609 < _a608.length; _i609++) {
          const v_a = _a608[_i609];
          let _q610 = true;
          Q611: {
            const _a612 = sp.angleEdges[v_a];
            for (let _i613 = 0; _i613 < _a612.length; _i613++) {
              const v_e = _a612[_i613];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q610 = false;
                break Q611;
              }
            }
          }
          if ((_q610 && (b.edgeCand(v_a) !== _h614))) {
            _q606 = true;
            break Q607;
          }
        }
      }
      _c615 = _q606;
    }
    if (!(_c615)) continue;
    const v_n = _h605;
    const _h647 = (v_n - 1);
    const _a616 = sp.faceEdges[v_f];
    for (let _i617 = 0; _i617 < _a616.length; _i617++) {
      const v_e = _a616[_i617];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      const v_S = minus(sp.faceEdges[v_f], setOf(v_e));
      const _h629 = v_S.length;
      const _h645 = (2 * _h629);
      const _h646 = (_h645 - v_n);
      const _h674 = (_h645 - _h647);
      let _q618 = false;
      Q619: {
        const _a620 = v_S;
        const _t630 = ((2 * _h629) - v_n);
        const _lo631 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi632 = 31 - Math.clz32(b.domain);
        for (const _e624 of _l622) _f621[_e624] = -1;
        _l622 = _a620;
        let _i626 = 0;
        _s623[0] = 0;
        let _o634 = _a620.length === 0;
        for (;;) {
          if (_a620.length === 0) {
            if (!_o634) break;
            _o634 = false;
          }
          while (_a620.length > 0 && _i626 >= 0) {
            const _e624 = _a620[_i626];
            if (_s623[_i626] > 0) _f621[_e624] = -1;
            let _r633 = (cands[_e624] >= 0 ? cands[_e624] : (cands[_e624] = b.cands[_e624])) & ~((2 << _s623[_i626]) - 1);
            let _d625 = 0;
            V628: for (; _r633 !== 0; _r633 &= _r633 - 1) {
              _d625 = 31 - Math.clz32(_r633 & -_r633);
              _f621[_e624] = _d625;
              {
                let _t635 = _d625;
                for (let _j627 = 0; _j627 < _i626; _j627++) _t635 += _f621[_a620[_j627]];
                if (_t635 + (_a620.length - _i626 - 1) * _lo631 > _t630) continue;
                if (_t635 + (_a620.length - _i626 - 1) * _hi632 < _t630) continue;
              }
              for (let _j627 = 0; _j627 < _i626; _j627++) {
                const _y636 = _a620[_j627];
                let _q637 = true;
                Q638: {
                  const _a639 = sp.faceAngles[v_f];
                  for (let _i640 = 0; _i640 < _a639.length; _i640++) {
                    const v_a = _a639[_i640];
                    if (!(((sp.angleEdges[v_a].includes(_e624)) && (sp.angleEdges[v_a].includes(_y636))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - _f621[_e624]) - _f621[_y636])) & 1) !== 0))) {
                      _q637 = false;
                      break Q638;
                    }
                  }
                }
                if (!(_q637)) continue V628;
              }
              break;
            }
            if (_r633 === 0) {
              _s623[_i626] = 0;
              _i626--;
              continue;
            }
            _s623[_i626] = _d625;
            if (_i626 === _a620.length - 1) break;
            _i626++;
            _s623[_i626] = 0;
          }
          if (_i626 < 0) break;
          let _g641 = 0;
          G642: {
            const _a643 = v_S;
            for (let _i644 = 0; _i644 < _a643.length; _i644++) {
              const v_x = _a643[_i644];
              _g641 += _f621[v_x];
            }
          }
          if (!((_g641 === _h646))) continue;
          if (true) {
            _q618 = true;
            break Q619;
          }
        }
      }
      const v_P = _q618;
      let _q648 = false;
      Q649: {
        const _a650 = v_S;
        const _t659 = ((2 * _h629) - _h647);
        const _lo660 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi661 = 31 - Math.clz32(b.domain);
        for (const _e654 of _l652) _f651[_e654] = -1;
        _l652 = _a650;
        let _i656 = 0;
        _s653[0] = 0;
        let _o663 = _a650.length === 0;
        for (;;) {
          if (_a650.length === 0) {
            if (!_o663) break;
            _o663 = false;
          }
          while (_a650.length > 0 && _i656 >= 0) {
            const _e654 = _a650[_i656];
            if (_s653[_i656] > 0) _f651[_e654] = -1;
            let _r662 = (cands[_e654] >= 0 ? cands[_e654] : (cands[_e654] = b.cands[_e654])) & ~((2 << _s653[_i656]) - 1);
            let _d655 = 0;
            V658: for (; _r662 !== 0; _r662 &= _r662 - 1) {
              _d655 = 31 - Math.clz32(_r662 & -_r662);
              _f651[_e654] = _d655;
              {
                let _t664 = _d655;
                for (let _j657 = 0; _j657 < _i656; _j657++) _t664 += _f651[_a650[_j657]];
                if (_t664 + (_a650.length - _i656 - 1) * _lo660 > _t659) continue;
                if (_t664 + (_a650.length - _i656 - 1) * _hi661 < _t659) continue;
              }
              for (let _j657 = 0; _j657 < _i656; _j657++) {
                const _y665 = _a650[_j657];
                let _q666 = true;
                Q667: {
                  const _a668 = sp.faceAngles[v_f];
                  for (let _i669 = 0; _i669 < _a668.length; _i669++) {
                    const v_a = _a668[_i669];
                    if (!(((sp.angleEdges[v_a].includes(_e654)) && (sp.angleEdges[v_a].includes(_y665))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - _f651[_e654]) - _f651[_y665])) & 1) !== 0))) {
                      _q666 = false;
                      break Q667;
                    }
                  }
                }
                if (!(_q666)) continue V658;
              }
              break;
            }
            if (_r662 === 0) {
              _s653[_i656] = 0;
              _i656--;
              continue;
            }
            _s653[_i656] = _d655;
            if (_i656 === _a650.length - 1) break;
            _i656++;
            _s653[_i656] = 0;
          }
          if (_i656 < 0) break;
          let _g670 = 0;
          G671: {
            const _a672 = v_S;
            for (let _i673 = 0; _i673 < _a672.length; _i673++) {
              const v_x = _a672[_i673];
              _g670 += _f651[v_x];
            }
          }
          if (!((_g670 === _h674))) continue;
          if (true) {
            _q648 = true;
            break Q649;
          }
        }
      }
      L675: {
        const v_Q = _q648;
        if (!((!(v_P) || !(v_Q)))) break L675;
        if (b.made[0] !== _m292_0 || b.made[2] !== _m292_2) {
          let _c684: boolean = (clueAt(cl.number, v_f) !== -1);
          if (_c684) {
            let _q676 = false;
            Q677: {
              const _a678 = sp.faceAngles[v_f];
              for (let _i679 = 0; _i679 < _a678.length; _i679++) {
                const v_a = _a678[_i679];
                let _q680 = true;
                Q681: {
                  const _a682 = sp.angleEdges[v_a];
                  for (let _i683 = 0; _i683 < _a682.length; _i683++) {
                    const v_e = _a682[_i683];
                    if (!(!((b.grid[v_e] !== 0)))) {
                      _q680 = false;
                      break Q681;
                    }
                  }
                }
                if ((_q680 && (b.edgeCand(v_a) !== ((1 << 0) | (1 << 1) | (1 << 2))))) {
                  _q676 = true;
                  break Q677;
                }
              }
            }
            _c684 = _q676;
          }
          if (!(_c684)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c686: boolean = (v_P || v_Q);
        if (_c686) {
          let _c685: boolean = !(!(v_P));
          if (!_c685) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c685 = true;
          }
          _c686 = _c685;
        }
        let _c688: boolean = _c686;
        if (_c688) {
          let _c687: boolean = !(!(v_Q));
          if (!_c687) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c687 = true;
          }
          _c688 = _c687;
        }
        if (!(_c688)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ f: v_f, n: v_n, e: v_e, S: v_S.slice(), P: v_P, Q: v_Q }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface CornerFromClueBinding {
  f: number;
  n: number;
  k: number;
  o: number;
  a: number;
  S: readonly number[];
  P: boolean;
  Q: boolean;
}

const cornerFromClueFacts: number[] = [];
let cornerFromClueCands = new Int32Array(0);
let _f796 = new Int32Array(0);
let _l797: readonly number[] = [];
let _f825 = new Int32Array(0);
let _l826: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerFromClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceAngles","angleEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerFromClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CornerFromClueBinding> | null): number {
  if (_f796.length < sp.edges.length) _f796 = new Int32Array(sp.edges.length).fill(-1);
  else _f796.fill(-1);
  _l797 = [];
  const _s798: number[] = [];
  if (_f825.length < sp.edges.length) _f825 = new Int32Array(sp.edges.length).fill(-1);
  else _f825.fill(-1);
  _l826 = [];
  const _s827: number[] = [];
  const facts = cornerFromClueFacts;
  let fired = 0;
  let changed = false;
  const _h783 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (cornerFromClueCands.length < sp.edges.length) cornerFromClueCands = new Int32Array(sp.edges.length);
  const cands = cornerFromClueCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(cornerFromClueFootprint) ?? null) : null;
  const _a765 = sp.faces;
  R1:
  for (let _i766 = 0; _i766 < _a765.length; _i766++) {
    const v_f = _a765[_i766];
    const _h767 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h767 !== -1))) continue;
    const v_n = _h767;
    const _h792 = (v_n - 2);
    const _m334_0 = b.made[0];
    let _g768 = 0;
    G769: {
      const _a770 = sp.faceEdges[v_f];
      for (let _i771 = 0; _i771 < _a770.length; _i771++) {
        const v_e = _a770[_i771];
        const _h772 = (b.grid[v_e] || -1);
        if (!((_h772 === 1))) continue;
        _g768++;
      }
    }
    const v_k = (_h767 - _g768);
    let _g773 = 0;
    G774: {
      const _a775 = sp.faceEdges[v_f];
      for (let _i776 = 0; _i776 < _a775.length; _i776++) {
        const v_e = _a775[_i776];
        const _h777 = (b.grid[v_e] !== 0);
        if (!(!(_h777))) continue;
        _g773++;
      }
    }
    L778: {
      const v_o = _g773;
      const _m342_2 = b.made[2];
      let _c784: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
      if (!_c784) {
        let _q779 = false;
        Q780: {
          const _a781 = sp.faceAngles[v_f];
          for (let _i782 = 0; _i782 < _a781.length; _i782++) {
            const v_b = _a781[_i782];
            if ((b.edgeCand(v_b) !== _h783)) {
              _q779 = true;
              break Q780;
            }
          }
        }
        _c784 = _q779;
      }
      if (!(_c784)) break L778;
      const _a785 = sp.faceAngles[v_f];
      for (let _i786 = 0; _i786 < _a785.length; _i786++) {
        const v_a = _a785[_i786];
        let _q787 = true;
        Q788: {
          const _a789 = sp.angleEdges[v_a];
          for (let _i790 = 0; _i790 < _a789.length; _i790++) {
            const v_e = _a789[_i790];
            const _h791 = (b.grid[v_e] !== 0);
            if (!(!(_h791))) {
              _q787 = false;
              break Q788;
            }
          }
        }
        if (!(_q787)) continue;
        const v_S = minus(sp.faceEdges[v_f], sp.angleEdges[v_a]);
        const _h804 = v_S.length;
        const _h820 = (2 * _h804);
        const _h821 = (_h820 - _h792);
        const _h848 = (_h820 - v_n);
        let _q793 = false;
        Q794: {
          const _a795 = v_S;
          const _t805 = ((2 * _h804) - _h792);
          const _lo806 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi807 = 31 - Math.clz32(b.domain);
          for (const _e799 of _l797) _f796[_e799] = -1;
          _l797 = _a795;
          let _i801 = 0;
          _s798[0] = 0;
          let _o809 = _a795.length === 0;
          for (;;) {
            if (_a795.length === 0) {
              if (!_o809) break;
              _o809 = false;
            }
            while (_a795.length > 0 && _i801 >= 0) {
              const _e799 = _a795[_i801];
              if (_s798[_i801] > 0) _f796[_e799] = -1;
              let _r808 = (cands[_e799] >= 0 ? cands[_e799] : (cands[_e799] = b.cands[_e799])) & ~((2 << _s798[_i801]) - 1);
              let _d800 = 0;
              V803: for (; _r808 !== 0; _r808 &= _r808 - 1) {
                _d800 = 31 - Math.clz32(_r808 & -_r808);
                _f796[_e799] = _d800;
                {
                  let _t810 = _d800;
                  for (let _j802 = 0; _j802 < _i801; _j802++) _t810 += _f796[_a795[_j802]];
                  if (_t810 + (_a795.length - _i801 - 1) * _lo806 > _t805) continue;
                  if (_t810 + (_a795.length - _i801 - 1) * _hi807 < _t805) continue;
                }
                for (let _j802 = 0; _j802 < _i801; _j802++) {
                  const _y811 = _a795[_j802];
                  let _q812 = true;
                  Q813: {
                    const _a814 = sp.faceAngles[v_f];
                    for (let _i815 = 0; _i815 < _a814.length; _i815++) {
                      const v_a = _a814[_i815];
                      if (!(((sp.angleEdges[v_a].includes(_e799)) && (sp.angleEdges[v_a].includes(_y811))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - _f796[_e799]) - _f796[_y811])) & 1) !== 0))) {
                        _q812 = false;
                        break Q813;
                      }
                    }
                  }
                  if (!(_q812)) continue V803;
                }
                break;
              }
              if (_r808 === 0) {
                _s798[_i801] = 0;
                _i801--;
                continue;
              }
              _s798[_i801] = _d800;
              if (_i801 === _a795.length - 1) break;
              _i801++;
              _s798[_i801] = 0;
            }
            if (_i801 < 0) break;
            let _g816 = 0;
            G817: {
              const _a818 = v_S;
              for (let _i819 = 0; _i819 < _a818.length; _i819++) {
                const v_x = _a818[_i819];
                _g816 += _f796[v_x];
              }
            }
            if (!((_g816 === _h821))) continue;
            if (true) {
              _q793 = true;
              break Q794;
            }
          }
        }
        const v_P = _q793;
        let _q822 = false;
        Q823: {
          const _a824 = v_S;
          const _t833 = ((2 * _h804) - v_n);
          const _lo834 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi835 = 31 - Math.clz32(b.domain);
          for (const _e828 of _l826) _f825[_e828] = -1;
          _l826 = _a824;
          let _i830 = 0;
          _s827[0] = 0;
          let _o837 = _a824.length === 0;
          for (;;) {
            if (_a824.length === 0) {
              if (!_o837) break;
              _o837 = false;
            }
            while (_a824.length > 0 && _i830 >= 0) {
              const _e828 = _a824[_i830];
              if (_s827[_i830] > 0) _f825[_e828] = -1;
              let _r836 = (cands[_e828] >= 0 ? cands[_e828] : (cands[_e828] = b.cands[_e828])) & ~((2 << _s827[_i830]) - 1);
              let _d829 = 0;
              V832: for (; _r836 !== 0; _r836 &= _r836 - 1) {
                _d829 = 31 - Math.clz32(_r836 & -_r836);
                _f825[_e828] = _d829;
                {
                  let _t838 = _d829;
                  for (let _j831 = 0; _j831 < _i830; _j831++) _t838 += _f825[_a824[_j831]];
                  if (_t838 + (_a824.length - _i830 - 1) * _lo834 > _t833) continue;
                  if (_t838 + (_a824.length - _i830 - 1) * _hi835 < _t833) continue;
                }
                for (let _j831 = 0; _j831 < _i830; _j831++) {
                  const _y839 = _a824[_j831];
                  let _q840 = true;
                  Q841: {
                    const _a842 = sp.faceAngles[v_f];
                    for (let _i843 = 0; _i843 < _a842.length; _i843++) {
                      const v_a = _a842[_i843];
                      if (!(((sp.angleEdges[v_a].includes(_e828)) && (sp.angleEdges[v_a].includes(_y839))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - _f825[_e828]) - _f825[_y839])) & 1) !== 0))) {
                        _q840 = false;
                        break Q841;
                      }
                    }
                  }
                  if (!(_q840)) continue V832;
                }
                break;
              }
              if (_r836 === 0) {
                _s827[_i830] = 0;
                _i830--;
                continue;
              }
              _s827[_i830] = _d829;
              if (_i830 === _a824.length - 1) break;
              _i830++;
              _s827[_i830] = 0;
            }
            if (_i830 < 0) break;
            let _g844 = 0;
            G845: {
              const _a846 = v_S;
              for (let _i847 = 0; _i847 < _a846.length; _i847++) {
                const v_x = _a846[_i847];
                _g844 += _f825[v_x];
              }
            }
            if (!((_g844 === _h848))) continue;
            if (true) {
              _q822 = true;
              break Q823;
            }
          }
        }
        L849: {
          const v_Q = _q822;
          if (!(((!(v_P) && (((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (!(v_Q) && (((b.edgeCand(v_a) >> 0) & 1) !== 0))))) break L849;
          if (b.made[0] !== _m334_0 || b.made[2] !== _m342_2) {
            let _g850 = 0;
            G851: {
              const _a852 = sp.faceEdges[v_f];
              for (let _i853 = 0; _i853 < _a852.length; _i853++) {
                const v_e = _a852[_i853];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g850++;
              }
            }
            if (!((v_k === (clueAt(cl.number, v_f) - _g850)))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _g854 = 0;
            G855: {
              const _a856 = sp.faceEdges[v_f];
              for (let _i857 = 0; _i857 < _a856.length; _i857++) {
                const v_e = _a856[_i857];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g854++;
              }
            }
            if (!((v_o === _g854))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _c862: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
            if (!_c862) {
              let _q858 = false;
              Q859: {
                const _a860 = sp.faceAngles[v_f];
                for (let _i861 = 0; _i861 < _a860.length; _i861++) {
                  const v_b = _a860[_i861];
                  if ((b.edgeCand(v_b) !== ((1 << 0) | (1 << 1) | (1 << 2)))) {
                    _q858 = true;
                    break Q859;
                  }
                }
              }
              _c862 = _q858;
            }
            if (!(_c862)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _c863: boolean = !(!(v_P));
          if (!_c863) {
            if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
            _c863 = true;
          }
          let _c865: boolean = _c863;
          if (_c865) {
            let _c864: boolean = !(!(v_Q));
            if (!_c864) {
              if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
              _c864 = true;
            }
            _c865 = _c864;
          }
          if (!(_c865)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ f: v_f, n: v_n, k: v_k, o: v_o, a: v_a, S: v_S.slice(), P: v_P, Q: v_Q }, facts)) return 1;
            cands.fill(-1);
          }
        }
      }
    }
  }
  return fired;
}

export interface CornerAcrossBinding {
  a: number;
  b: number;
}

const cornerAcrossFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerAcrossFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellAngles"],"kind":"edgeMark"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerAcross(b: Marks, sp: GridSpace, fire: Fire<CornerAcrossBinding> | null): number {
  const facts = cornerAcrossFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(cornerAcrossFootprint) ?? null) : null;
  const _a880 = sp.angles;
  R1:
  for (let _i881 = 0; _i881 < _a880.length; _i881++) {
    const v_a = _a880[_i881];
    const _m375_0 = b.made[0];
    const _m375_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c887: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
    if (_c887) {
      let _q882 = true;
      Q883: {
        const _a884 = sp.angleEdges[v_a];
        for (let _i885 = 0; _i885 < _a884.length; _i885++) {
          const v_e = _a884[_i885];
          const _h886 = (b.grid[v_e] !== 0);
          if (!(!(_h886))) {
            _q882 = false;
            break Q883;
          }
        }
      }
      _c887 = _q882;
    }
    if (!(_c887)) continue;
    const _a888 = sp.cellAngles[sp.angleCell[v_a]];
    for (let _i889 = 0; _i889 < _a888.length; _i889++) {
      const v_b = _a888[_i889];
      let _c894: boolean = (((b.edgeCand(v_b) >> 2) & 1) !== 0);
      if (_c894) {
        let _q890 = true;
        Q891: {
          const _a892 = sp.angleEdges[v_b];
          for (let _i893 = 0; _i893 < _a892.length; _i893++) {
            const v_e = _a892[_i893];
            if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
              _q890 = false;
              break Q891;
            }
          }
        }
        _c894 = _q890;
      }
      if (!(_c894)) continue;
      if (b.made[0] !== _m375_0 || b.made[2] !== _m375_2) {
        let _c899: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
        if (_c899) {
          let _q895 = true;
          Q896: {
            const _a897 = sp.angleEdges[v_a];
            for (let _i898 = 0; _i898 < _a897.length; _i898++) {
              const v_e = _a897[_i898];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q895 = false;
                break Q896;
              }
            }
          }
          _c899 = _q895;
        }
        if (!(_c899)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_b) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 2); changed = true; } else facts.push(STRIKE_EDGE, v_b, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, b: v_b }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerExitBinding {
  a: number;
  c: number;
}

const cornerExitFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerExitFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerExit(b: Marks, sp: GridSpace, fire: Fire<CornerExitBinding> | null): number {
  const facts = cornerExitFacts;
  let fired = 0;
  let changed = false;
  const _h919 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerExitFootprint) ?? null) : null;
  const _a917 = sp.angles;
  for (let _i918 = 0; _i918 < _a917.length; _i918++) {
    const v_a = _a917[_i918];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c924: boolean = (b.edgeCand(v_a) === _h919);
    if (_c924) {
      let _q920 = true;
      Q921: {
        const _a922 = sp.angleEdges[v_a];
        for (let _i923 = 0; _i923 < _a922.length; _i923++) {
          const v_e = _a922[_i923];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q920 = false;
            break Q921;
          }
        }
      }
      _c924 = _q920;
    }
    if (!(_c924)) continue;
    L925: {
      const v_c = sp.angleCell[v_a];
      let _g926 = 0;
      G927: {
        const _a928 = sp.cellEdges[v_c];
        for (let _i929 = 0; _i929 < _a928.length; _i929++) {
          const v_e = _a928[_i929];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g926++;
        }
      }
      let _c934: boolean = (_g926 === 0);
      if (_c934) {
        let _g930 = 0;
        G931: {
          const _a932 = sp.cellEdges[v_c];
          for (let _i933 = 0; _i933 < _a932.length; _i933++) {
            const v_e = _a932[_i933];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g930++;
          }
        }
        _c934 = (_g930 === 3);
      }
      if (!(_c934)) break L925;
      facts.length = 0;
      changed = false;
      let _q935 = true;
      Q936: {
        const _a937 = sp.cellEdges[v_c];
        for (let _i938 = 0; _i938 < _a937.length; _i938++) {
          const v_e = _a937[_i938];
          if (!((!((b.grid[v_e] !== 0)) && !(sp.angleEdges[v_a].includes(v_e))))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) {
            _q935 = false;
            break Q936;
          }
        }
      }
      if (!(_q935)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, c: v_c }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerOppositeExitBinding {
  a: number;
  c: number;
  b: number;
}

const cornerOppositeExitFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerOppositeExitFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"},{"steps":["angleCell","cellEdges"],"kind":"answer"},{"steps":["angleCell","cellAngles","angleEdges"],"kind":"answer"},{"steps":["angleCell","cellAngles"],"kind":"edgeMark"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerOppositeExit(b: Marks, sp: GridSpace, fire: Fire<CornerOppositeExitBinding> | null): number {
  const facts = cornerOppositeExitFacts;
  let fired = 0;
  let changed = false;
  const _h969 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerOppositeExitFootprint) ?? null) : null;
  const _a967 = sp.angles;
  R1:
  for (let _i968 = 0; _i968 < _a967.length; _i968++) {
    const v_a = _a967[_i968];
    const _m414_0 = b.made[0];
    const _m414_2 = b.made[2];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c975: boolean = (b.edgeCand(v_a) === _h969);
    if (_c975) {
      let _q970 = true;
      Q971: {
        const _a972 = sp.angleEdges[v_a];
        for (let _i973 = 0; _i973 < _a972.length; _i973++) {
          const v_e = _a972[_i973];
          const _h974 = (b.grid[v_e] !== 0);
          if (!(!(_h974))) {
            _q970 = false;
            break Q971;
          }
        }
      }
      _c975 = _q970;
    }
    if (!(_c975)) continue;
    L976: {
      const v_c = sp.angleCell[v_a];
      let _g977 = 0;
      G978: {
        const _a979 = sp.cellEdges[v_c];
        for (let _i980 = 0; _i980 < _a979.length; _i980++) {
          const v_e = _a979[_i980];
          const _h981 = (b.grid[v_e] || -1);
          if (!((_h981 === 1))) continue;
          _g977++;
        }
      }
      let _c987: boolean = (_g977 === 0);
      if (_c987) {
        let _g982 = 0;
        G983: {
          const _a984 = sp.cellEdges[v_c];
          for (let _i985 = 0; _i985 < _a984.length; _i985++) {
            const v_e = _a984[_i985];
            const _h986 = (b.grid[v_e] !== 0);
            if (!(!(_h986))) continue;
            _g982++;
          }
        }
        _c987 = (_g982 === 4);
      }
      if (!(_c987)) break L976;
      const _a988 = sp.cellAngles[v_c];
      for (let _i989 = 0; _i989 < _a988.length; _i989++) {
        const v_b = _a988[_i989];
        let _q990 = true;
        Q991: {
          const _a992 = sp.angleEdges[v_b];
          for (let _i993 = 0; _i993 < _a992.length; _i993++) {
            const v_e = _a992[_i993];
            const _h994 = (b.grid[v_e] !== 0);
            if (!(!(_h994))) {
              _q990 = false;
              break Q991;
            }
          }
        }
        let _c999: boolean = (_q990 && (b.edgeCand(v_b) !== _h969));
        if (_c999) {
          let _q995 = true;
          Q996: {
            const _a997 = sp.angleEdges[v_b];
            for (let _i998 = 0; _i998 < _a997.length; _i998++) {
              const v_e = _a997[_i998];
              if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                _q995 = false;
                break Q996;
              }
            }
          }
          _c999 = _q995;
        }
        if (!(_c999)) continue;
        if (b.made[0] !== _m414_0 || b.made[2] !== _m414_2) {
          let _c1004: boolean = (b.edgeCand(v_a) === ((1 << 1)));
          if (_c1004) {
            let _q1000 = true;
            Q1001: {
              const _a1002 = sp.angleEdges[v_a];
              for (let _i1003 = 0; _i1003 < _a1002.length; _i1003++) {
                const v_e = _a1002[_i1003];
                if (!(!((b.grid[v_e] !== 0)))) {
                  _q1000 = false;
                  break Q1001;
                }
              }
            }
            _c1004 = _q1000;
          }
          if (!(_c1004)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
          let _g1005 = 0;
          G1006: {
            const _a1007 = sp.cellEdges[v_c];
            for (let _i1008 = 0; _i1008 < _a1007.length; _i1008++) {
              const v_e = _a1007[_i1008];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1005++;
            }
          }
          let _c1013: boolean = (_g1005 === 0);
          if (_c1013) {
            let _g1009 = 0;
            G1010: {
              const _a1011 = sp.cellEdges[v_c];
              for (let _i1012 = 0; _i1012 < _a1011.length; _i1012++) {
                const v_e = _a1011[_i1012];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1009++;
              }
            }
            _c1013 = (_g1009 === 4);
          }
          if (!(_c1013)) { if (_visit !== null) _visit[v_a] = 1; continue R1; }
        }
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_b) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 0); changed = true; } else facts.push(STRIKE_EDGE, v_b, 0); }
        let _c1014: boolean = true;
        if (_c1014) {
          if ((b.edgeCand(v_b) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 2); changed = true; } else facts.push(STRIKE_EDGE, v_b, 2); }
          _c1014 = true;
        }
        if (!(_c1014)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, c: v_c, b: v_b }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface MatchingPairBinding {
  f: number;
  n: number;
  o: number;
  e: number;
  g: number;
}

const matchingPairFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const matchingPairFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function matchingPair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MatchingPairBinding> | null): number {
  const facts = matchingPairFacts;
  let fired = 0;
  let changed = false;
  const _h1055 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(matchingPairFootprint) ?? null) : null;
  const _a1034 = sp.faces;
  R1:
  for (let _i1035 = 0; _i1035 < _a1034.length; _i1035++) {
    const v_f = _a1034[_i1035];
    const _h1036 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h1036 !== -1))) continue;
    const _m443_0 = b.made[0];
    let _q1037 = false;
    Q1038: {
      const _a1039 = sp.faceEdges[v_f];
      for (let _i1040 = 0; _i1040 < _a1039.length; _i1040++) {
        const v_e = _a1039[_i1040];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q1037 = true;
          break Q1038;
        }
      }
    }
    if (!(_q1037)) continue;
    let _g1041 = 0;
    G1042: {
      const _a1043 = sp.faceEdges[v_f];
      for (let _i1044 = 0; _i1044 < _a1043.length; _i1044++) {
        const v_e = _a1043[_i1044];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g1041++;
      }
    }
    const v_n = (_h1036 - _g1041);
    const _h1064 = (v_n === 1);
    const _h1067 = (v_n !== 1);
    let _g1045 = 0;
    G1046: {
      const _a1047 = sp.faceEdges[v_f];
      for (let _i1048 = 0; _i1048 < _a1047.length; _i1048++) {
        const v_e = _a1047[_i1048];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1045++;
      }
    }
    L1049: {
      const v_o = _g1045;
      if (!(((v_n === 1) || ((v_o - v_n) === 1)))) break L1049;
      const _a1050 = sp.faceEdges[v_f];
      R2:
      for (let _i1051 = 0; _i1051 < _a1050.length; _i1051++) {
        const v_e = _a1050[_i1051];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        const _h1054 = _i1051;
        const _a1052 = sp.faceEdges[v_f];
        for (let _i1053 = 0; _i1053 < _a1052.length; _i1053++) {
          const v_g = _a1052[_i1053];
          if (!(((!((b.grid[v_g] !== 0)) && (_i1053 > _h1054)) && (b.pairOf(v_e, v_g) === _h1055)))) continue;
          if (b.made[0] !== _m443_0) {
            let _g1056 = 0;
            G1057: {
              const _a1058 = sp.faceEdges[v_f];
              for (let _i1059 = 0; _i1059 < _a1058.length; _i1059++) {
                const v_e = _a1058[_i1059];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g1056++;
              }
            }
            if (!((v_n === (clueAt(cl.number, v_f) - _g1056)))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            let _g1060 = 0;
            G1061: {
              const _a1062 = sp.faceEdges[v_f];
              for (let _i1063 = 0; _i1063 < _a1062.length; _i1063++) {
                const v_e = _a1062[_i1063];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1060++;
              }
            }
            if (!((v_o === _g1060))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            if (!(!((b.grid[v_e] !== 0)))) { if (_visit !== null) _visit[v_f] = 1; continue R2; }
          }
          facts.length = 0;
          changed = false;
          let _c1066: boolean = !(_h1064);
          if (!_c1066) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            let _c1065: boolean = true;
            if (_c1065) {
              if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 2); changed = true; } else facts.push(PLACE, v_g, 2); }
              _c1065 = true;
            }
            _c1066 = _c1065;
          }
          let _c1070: boolean = _c1066;
          if (_c1070) {
            let _c1069: boolean = !(_h1067);
            if (!_c1069) {
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              let _c1068: boolean = true;
              if (_c1068) {
                if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
                _c1068 = true;
              }
              _c1069 = _c1068;
            }
            _c1070 = _c1069;
          }
          if (!(_c1070)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ f: v_f, n: v_n, o: v_o, e: v_e, g: v_g }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface PairAtClueBinding {
  f: number;
  O: readonly number[];
  e: number;
  g: number;
}

const pairAtClueFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const pairAtClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function pairAtClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairAtClueBinding> | null): number {
  const _g1095: number[] = [];
  const facts = pairAtClueFacts;
  let fired = 0;
  let changed = false;
  const _h1105 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtClueFootprint) ?? null) : null;
  const _a1086 = sp.faces;
  for (let _i1087 = 0; _i1087 < _a1086.length; _i1087++) {
    const v_f = _a1086[_i1087];
    const _h1088 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1094: boolean = (_h1088 !== -1);
    if (_c1094) {
      let _g1089 = 0;
      G1090: {
        const _a1091 = sp.faceEdges[v_f];
        for (let _i1092 = 0; _i1092 < _a1091.length; _i1092++) {
          const v_e = _a1091[_i1092];
          const _h1093 = (b.grid[v_e] || -1);
          if (!((_h1093 === 1))) continue;
          _g1089++;
        }
      }
      _c1094 = ((_h1088 - _g1089) >= 0);
    }
    if (!(_c1094)) continue;
    _g1095.length = 0;
    G1096: {
      const _a1099 = sp.faceEdges[v_f];
      for (let _i1100 = 0; _i1100 < _a1099.length; _i1100++) {
        const v_e = _a1099[_i1100];
        const _h1101 = (b.grid[v_e] !== 0);
        if (!(!(_h1101))) continue;
        _g1095.push(v_e);
      }
    }
    L1102: {
      const v_O = _g1095;
      const _h1103 = v_O.length;
      if (!((_h1103 === 2))) break L1102;
      const v_e = (v_O[0] ?? -1);
      L1104: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h1105))) break L1104;
        facts.length = 0;
        changed = false;
        let _g1106 = 0;
        G1107: {
          const _a1108 = sp.faceEdges[v_f];
          for (let _i1109 = 0; _i1109 < _a1108.length; _i1109++) {
            const v_e = _a1108[_i1109];
            const _h1110 = (b.grid[v_e] || -1);
            if (!((_h1110 === 1))) continue;
            _g1106++;
          }
        }
        const _t1111 = (1 + ((_h1088 - _g1106) % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t1111); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t1111); }
        if (!(((b.pairOf(v_e, v_g) >> _t1111) & 1) !== 0)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ f: v_f, O: v_O.slice(), e: v_e, g: v_g }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ParityClueBinding {
  f: number;
  O: readonly number[];
  e: number;
  g: number;
  k: number;
}

const parityClueFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const parityClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function parityClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ParityClueBinding> | null): number {
  const _g1139: number[] = [];
  const _g1158: number[] = [];
  const facts = parityClueFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityClueFootprint) ?? null) : null;
  const _a1131 = sp.faces;
  R1:
  for (let _i1132 = 0; _i1132 < _a1131.length; _i1132++) {
    const v_f = _a1131[_i1132];
    const _m500_0 = b.made[0];
    const _h1133 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1138: boolean = (_h1133 !== -1);
    if (_c1138) {
      let _g1134 = 0;
      G1135: {
        const _a1136 = sp.faceEdges[v_f];
        for (let _i1137 = 0; _i1137 < _a1136.length; _i1137++) {
          const v_e = _a1136[_i1137];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g1134++;
        }
      }
      _c1138 = ((_h1133 - _g1134) >= 0);
    }
    if (!(_c1138)) continue;
    _g1139.length = 0;
    G1140: {
      const _a1143 = sp.faceEdges[v_f];
      for (let _i1144 = 0; _i1144 < _a1143.length; _i1144++) {
        const v_e = _a1143[_i1144];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1139.push(v_e);
      }
    }
    L1145: {
      const v_O = _g1139;
      const _h1146 = v_O.length;
      if (!((_h1146 === 3))) break L1145;
      const _a1147 = v_O;
      for (let _i1148 = 0; _i1148 < _a1147.length; _i1148++) {
        const v_e = _a1147[_i1148];
        const _h1151 = _i1148;
        const _a1149 = v_O;
        for (let _i1150 = 0; _i1150 < _a1149.length; _i1150++) {
          const v_g = _a1149[_i1150];
          if (!(((_i1150 > _h1151) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t1152 = minus(v_O, setOf(v_e, v_g));
          const v_k = (_t1152.length > 0 ? _t1152[0] : -1);
          if (b.made[0] !== _m500_0) {
            let _c1157: boolean = (clueAt(cl.number, v_f) !== -1);
            if (_c1157) {
              let _g1153 = 0;
              G1154: {
                const _a1155 = sp.faceEdges[v_f];
                for (let _i1156 = 0; _i1156 < _a1155.length; _i1156++) {
                  const v_e = _a1155[_i1156];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g1153++;
                }
              }
              _c1157 = ((clueAt(cl.number, v_f) - _g1153) >= 0);
            }
            if (!(_c1157)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            _g1158.length = 0;
            G1159: {
              const _a1162 = sp.faceEdges[v_f];
              for (let _i1163 = 0; _i1163 < _a1162.length; _i1163++) {
                const v_e = _a1162[_i1163];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1158.push(v_e);
              }
            }
            if (!(sameSet(v_O, _g1158))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
          }
          facts.length = 0;
          changed = false;
          const _t1168 = (2 - (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
          if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t1168); changed = true; } else facts.push(PLACE, v_k, _t1168); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ f: v_f, O: v_O.slice(), e: v_e, g: v_g, k: v_k }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LinkClueBinding {
  f: number;
  O: readonly number[];
  e: number;
  g: number;
  R: readonly number[];
  h: number;
  k: number;
}

const linkClueFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const linkClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function linkClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LinkClueBinding> | null): number {
  const _g1197: number[] = [];
  const _g1218: number[] = [];
  const facts = linkClueFacts;
  let fired = 0;
  let changed = false;
  const _h1212 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkClueFootprint) ?? null) : null;
  const _a1188 = sp.faces;
  R1:
  for (let _i1189 = 0; _i1189 < _a1188.length; _i1189++) {
    const v_f = _a1188[_i1189];
    const _m529_0 = b.made[0];
    const _h1190 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1196: boolean = (_h1190 !== -1);
    if (_c1196) {
      let _g1191 = 0;
      G1192: {
        const _a1193 = sp.faceEdges[v_f];
        for (let _i1194 = 0; _i1194 < _a1193.length; _i1194++) {
          const v_e = _a1193[_i1194];
          const _h1195 = (b.grid[v_e] || -1);
          if (!((_h1195 === 1))) continue;
          _g1191++;
        }
      }
      _c1196 = ((_h1190 - _g1191) >= 0);
    }
    if (!(_c1196)) continue;
    _g1197.length = 0;
    G1198: {
      const _a1201 = sp.faceEdges[v_f];
      for (let _i1202 = 0; _i1202 < _a1201.length; _i1202++) {
        const v_e = _a1201[_i1202];
        const _h1203 = (b.grid[v_e] !== 0);
        if (!(!(_h1203))) continue;
        _g1197.push(v_e);
      }
    }
    L1204: {
      const v_O = _g1197;
      const _h1205 = v_O.length;
      if (!((_h1205 === 4))) break L1204;
      const _a1206 = v_O;
      for (let _i1207 = 0; _i1207 < _a1206.length; _i1207++) {
        const v_e = _a1206[_i1207];
        const _h1210 = _i1207;
        const _a1208 = v_O;
        for (let _i1209 = 0; _i1209 < _a1208.length; _i1209++) {
          const v_g = _a1208[_i1209];
          if (!(((_i1209 > _h1210) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L1211: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h1212))) break L1211;
            if (b.made[0] !== _m529_0) {
              let _c1217: boolean = (clueAt(cl.number, v_f) !== -1);
              if (_c1217) {
                let _g1213 = 0;
                G1214: {
                  const _a1215 = sp.faceEdges[v_f];
                  for (let _i1216 = 0; _i1216 < _a1215.length; _i1216++) {
                    const v_e = _a1215[_i1216];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1213++;
                  }
                }
                _c1217 = ((clueAt(cl.number, v_f) - _g1213) >= 0);
              }
              if (!(_c1217)) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
              _g1218.length = 0;
              G1219: {
                const _a1222 = sp.faceEdges[v_f];
                for (let _i1223 = 0; _i1223 < _a1222.length; _i1223++) {
                  const v_e = _a1222[_i1223];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g1218.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g1218))) { if (_visit !== null) _visit[v_f] = 1; continue R1; }
            }
            facts.length = 0;
            changed = false;
            const _t1224 = (1 + (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t1224); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t1224); }
            if (!(((b.pairOf(v_h, v_k) >> _t1224) & 1) !== 0)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ f: v_f, O: v_O.slice(), e: v_e, g: v_g, R: v_R.slice(), h: v_h, k: v_k }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface PairFromCornerBinding {
  a: number;
  e: number;
  g: number;
}

const pairFromCornerFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const pairFromCornerFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function pairFromCorner(b: Marks, sp: GridSpace, fire: Fire<PairFromCornerBinding> | null): number {
  const facts = pairFromCornerFacts;
  let fired = 0;
  let changed = false;
  const _h1235 = ((1 << 1));
  const _h1243 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairFromCornerFootprint) ?? null) : null;
  const _a1233 = sp.angles;
  for (let _i1234 = 0; _i1234 < _a1233.length; _i1234++) {
    const v_a = _a1233[_i1234];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1241: boolean = (b.edgeCand(v_a) === _h1235);
    if (_c1241) {
      let _q1236 = true;
      Q1237: {
        const _a1238 = sp.angleEdges[v_a];
        for (let _i1239 = 0; _i1239 < _a1238.length; _i1239++) {
          const v_e = _a1238[_i1239];
          const _h1240 = (b.grid[v_e] !== 0);
          if (!(!(_h1240))) {
            _q1236 = false;
            break Q1237;
          }
        }
      }
      _c1241 = _q1236;
    }
    if (!(_c1241)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L1242: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h1243))) break L1242;
      facts.length = 0;
      changed = false;
      if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, 2); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + 2); }
      if (!(((b.pairOf(v_e, v_g) >> 2) & 1) !== 0)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, e: v_e, g: v_g }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface CornerFromPairBinding {
  a: number;
  e: number;
  g: number;
}

const cornerFromPairFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerFromPairFootprint: Footprint = {"sort":"angle","reads":[{"steps":[],"kind":"edgeMark"},{"steps":["angleEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function cornerFromPair(b: Marks, sp: GridSpace, fire: Fire<CornerFromPairBinding> | null): number {
  const facts = cornerFromPairFacts;
  let fired = 0;
  let changed = false;
  const _h1254 = ((1 << 1));
  const _h1262 = ((1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerFromPairFootprint) ?? null) : null;
  const _a1252 = sp.angles;
  for (let _i1253 = 0; _i1253 < _a1252.length; _i1253++) {
    const v_a = _a1252[_i1253];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1260: boolean = (b.edgeCand(v_a) !== _h1254);
    if (_c1260) {
      let _q1255 = true;
      Q1256: {
        const _a1257 = sp.angleEdges[v_a];
        for (let _i1258 = 0; _i1258 < _a1257.length; _i1258++) {
          const v_e = _a1257[_i1258];
          const _h1259 = (b.grid[v_e] !== 0);
          if (!(!(_h1259))) {
            _q1255 = false;
            break Q1256;
          }
        }
      }
      _c1260 = _q1255;
    }
    if (!(_c1260)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L1261: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h1262))) break L1261;
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
      let _c1263: boolean = true;
      if (_c1263) {
        if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
        _c1263 = true;
      }
      if (!(_c1263)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, e: v_e, g: v_g }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairAtDotBinding {
  c: number;
  O: readonly number[];
  e: number;
  g: number;
}

const pairAtDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const pairAtDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function pairAtDot(b: Marks, sp: GridSpace, fire: Fire<PairAtDotBinding> | null): number {
  const _g1276: number[] = [];
  const facts = pairAtDotFacts;
  let fired = 0;
  let changed = false;
  const _h1286 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtDotFootprint) ?? null) : null;
  const _a1274 = sp.cells;
  for (let _i1275 = 0; _i1275 < _a1274.length; _i1275++) {
    const v_c = _a1274[_i1275];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g1276.length = 0;
    G1277: {
      const _a1280 = sp.cellEdges[v_c];
      for (let _i1281 = 0; _i1281 < _a1280.length; _i1281++) {
        const v_e = _a1280[_i1281];
        const _h1282 = (b.grid[v_e] !== 0);
        if (!(!(_h1282))) continue;
        _g1276.push(v_e);
      }
    }
    L1283: {
      const v_O = _g1276;
      const _h1284 = v_O.length;
      if (!((_h1284 === 2))) break L1283;
      const v_e = (v_O[0] ?? -1);
      L1285: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h1286))) break L1285;
        facts.length = 0;
        changed = false;
        let _g1287 = 0;
        G1288: {
          const _a1289 = sp.cellEdges[v_c];
          for (let _i1290 = 0; _i1290 < _a1289.length; _i1290++) {
            const v_e = _a1289[_i1290];
            const _h1291 = (b.grid[v_e] || -1);
            if (!((_h1291 === 1))) continue;
            _g1287++;
          }
        }
        const _t1292 = (1 + (_g1287 % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t1292); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t1292); }
        if (!(((b.pairOf(v_e, v_g) >> _t1292) & 1) !== 0)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, O: v_O.slice(), e: v_e, g: v_g }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ParityDotBinding {
  c: number;
  O: readonly number[];
  e: number;
  g: number;
  k: number;
}

const parityDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const parityDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function parityDot(b: Marks, sp: GridSpace, fire: Fire<ParityDotBinding> | null): number {
  const _g1309: number[] = [];
  const _g1323: number[] = [];
  const facts = parityDotFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityDotFootprint) ?? null) : null;
  const _a1307 = sp.cells;
  R1:
  for (let _i1308 = 0; _i1308 < _a1307.length; _i1308++) {
    const v_c = _a1307[_i1308];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _m630_0 = b.made[0];
    _g1309.length = 0;
    G1310: {
      const _a1313 = sp.cellEdges[v_c];
      for (let _i1314 = 0; _i1314 < _a1313.length; _i1314++) {
        const v_e = _a1313[_i1314];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1309.push(v_e);
      }
    }
    L1315: {
      const v_O = _g1309;
      const _h1316 = v_O.length;
      if (!((_h1316 === 3))) break L1315;
      const _a1317 = v_O;
      for (let _i1318 = 0; _i1318 < _a1317.length; _i1318++) {
        const v_e = _a1317[_i1318];
        const _h1321 = _i1318;
        const _a1319 = v_O;
        for (let _i1320 = 0; _i1320 < _a1319.length; _i1320++) {
          const v_g = _a1319[_i1320];
          if (!(((_i1320 > _h1321) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t1322 = minus(v_O, setOf(v_e, v_g));
          const v_k = (_t1322.length > 0 ? _t1322[0] : -1);
          if (b.made[0] !== _m630_0) {
            _g1323.length = 0;
            G1324: {
              const _a1327 = sp.cellEdges[v_c];
              for (let _i1328 = 0; _i1328 < _a1327.length; _i1328++) {
                const v_e = _a1327[_i1328];
                if (!(!((b.grid[v_e] !== 0)))) continue;
                _g1323.push(v_e);
              }
            }
            if (!(sameSet(v_O, _g1323))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
          }
          facts.length = 0;
          changed = false;
          const _t1333 = (2 - (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
          if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t1333); changed = true; } else facts.push(PLACE, v_k, _t1333); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, O: v_O.slice(), e: v_e, g: v_g, k: v_k }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LinkDotBinding {
  c: number;
  O: readonly number[];
  e: number;
  g: number;
  R: readonly number[];
  h: number;
  k: number;
}

const linkDotFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const linkDotFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":true};

/** Its dearest read grows with the board as n. */
export function linkDot(b: Marks, sp: GridSpace, fire: Fire<LinkDotBinding> | null): number {
  const _g1350: number[] = [];
  const _g1366: number[] = [];
  const facts = linkDotFacts;
  let fired = 0;
  let changed = false;
  const _h1365 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkDotFootprint) ?? null) : null;
  const _a1348 = sp.cells;
  R1:
  for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
    const v_c = _a1348[_i1349];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _m656_0 = b.made[0];
    _g1350.length = 0;
    G1351: {
      const _a1354 = sp.cellEdges[v_c];
      for (let _i1355 = 0; _i1355 < _a1354.length; _i1355++) {
        const v_e = _a1354[_i1355];
        const _h1356 = (b.grid[v_e] !== 0);
        if (!(!(_h1356))) continue;
        _g1350.push(v_e);
      }
    }
    L1357: {
      const v_O = _g1350;
      const _h1358 = v_O.length;
      if (!((_h1358 === 4))) break L1357;
      const _a1359 = v_O;
      for (let _i1360 = 0; _i1360 < _a1359.length; _i1360++) {
        const v_e = _a1359[_i1360];
        const _h1363 = _i1360;
        const _a1361 = v_O;
        for (let _i1362 = 0; _i1362 < _a1361.length; _i1362++) {
          const v_g = _a1361[_i1362];
          if (!(((_i1362 > _h1363) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L1364: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h1365))) break L1364;
            if (b.made[0] !== _m656_0) {
              _g1366.length = 0;
              G1367: {
                const _a1370 = sp.cellEdges[v_c];
                for (let _i1371 = 0; _i1371 < _a1370.length; _i1371++) {
                  const v_e = _a1370[_i1371];
                  if (!(!((b.grid[v_e] !== 0)))) continue;
                  _g1366.push(v_e);
                }
              }
              if (!(sameSet(v_O, _g1366))) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
            }
            facts.length = 0;
            changed = false;
            const _t1372 = (1 + (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t1372); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t1372); }
            if (!(((b.pairOf(v_h, v_k) >> _t1372) & 1) !== 0)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ c: v_c, O: v_O.slice(), e: v_e, g: v_g, R: v_R.slice(), h: v_h, k: v_k }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}

const dotOpenKept = keptStore<number>();

/** `dotOpen(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function dotOpen(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = dotOpenKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g469 = 0;
  G470: {
    const _a471 = sp.cellEdges[v_c];
    for (let _i472 = 0; _i472 < _a471.length; _i472++) {
      const v_e = _a471[_i472];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      _g469++;
    }
  }
  const _made = _g469;
  _kept[v_c] = _made;
  return _made;
}

const needKept = keptStore<number>();

/** `need(f)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_f: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_f] !== undefined) return _kept[v_f];
  let _g1164 = 0;
  G1165: {
    const _a1166 = sp.faceEdges[v_f];
    for (let _i1167 = 0; _i1167 < _a1166.length; _i1167++) {
      const v_e = _a1166[_i1167];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1164++;
    }
  }
  const _made = (clueAt(cl.number, v_f) - _g1164);
  _kept[v_f] = _made;
  return _made;
}

const dotLinesKept = keptStore<number>();

/** `dotLines(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function dotLines(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = dotLinesKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1329 = 0;
  G1330: {
    const _a1331 = sp.cellEdges[v_c];
    for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
      const v_e = _a1331[_i1332];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1329++;
    }
  }
  const _made = _g1329;
  _kept[v_c] = _made;
  return _made;
}
