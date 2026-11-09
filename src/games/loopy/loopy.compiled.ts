// Compiled by `npm run describe` from src/games/loopy/loopy.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, RELATE, STRIKE_EDGE, clueAt, edgeGroups, keptEdgeGroups, keptStore, least, minus, popcount, rangeMask, setOf, type Footprint, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g1278: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1256 = true;
  Q1257: {
    const _a1258 = sp.cells;
    for (let _i1259 = 0; _i1259 < _a1258.length; _i1259++) {
      const v_c = _a1258[_i1259];
      let _g1260 = 0;
      G1261: {
        const _a1262 = sp.cellEdges[v_c];
        for (let _i1263 = 0; _i1263 < _a1262.length; _i1263++) {
          const v_e = _a1262[_i1263];
          const _h1264 = (g[v_e] || -1);
          if (!((_h1264 === 1))) continue;
          _g1260++;
        }
      }
      let _c1270: boolean = (_g1260 === 0);
      if (!_c1270) {
        let _g1265 = 0;
        G1266: {
          const _a1267 = sp.cellEdges[v_c];
          for (let _i1268 = 0; _i1268 < _a1267.length; _i1268++) {
            const v_e = _a1267[_i1268];
            const _h1269 = (g[v_e] || -1);
            if (!((_h1269 === 1))) continue;
            _g1265++;
          }
        }
        _c1270 = (_g1265 === 2);
      }
      if (!(_c1270)) {
        _q1256 = false;
        break Q1257;
      }
    }
  }
  if (!(_q1256)) return false;
  let _q1271 = false;
  Q1272: {
    const _a1273 = sp.edges;
    for (let _i1274 = 0; _i1274 < _a1273.length; _i1274++) {
      const v_e = _a1273[_i1274];
      const _h1275 = (g[v_e] || -1);
      if ((_h1275 === 1)) {
        _q1271 = true;
        break Q1272;
      }
    }
  }
  let _c1300: boolean = _q1271;
  if (_c1300) {
    let _q1276 = true;
    Q1277: {
      _g1278.length = 0;
      G1279: {
        const _a1282 = sp.edges;
        for (let _i1283 = 0; _i1283 < _a1282.length; _i1283++) {
          const v_e = _a1282[_i1283];
          const _h1284 = (g[v_e] || -1);
          if (!((_h1284 === 1))) continue;
          _g1278.push(v_e);
        }
      }
      const v_L = _g1278;
      const _eg1299 = edgeGroups(sp, v_L);
      const _a1285 = sp.cells;
      for (let _i1286 = 0; _i1286 < _a1285.length; _i1286++) {
        const v_a = _a1285[_i1286];
        let _g1287 = 0;
        G1288: {
          const _a1289 = sp.cellEdges[v_a];
          for (let _i1290 = 0; _i1290 < _a1289.length; _i1290++) {
            const v_e = _a1289[_i1290];
            const _h1291 = (g[v_e] || -1);
            if (!((_h1291 === 1))) continue;
            _g1287++;
          }
        }
        if (!((_g1287 > 0))) continue;
        const _a1292 = sp.cells;
        for (let _i1293 = 0; _i1293 < _a1292.length; _i1293++) {
          const v_b = _a1292[_i1293];
          let _g1294 = 0;
          G1295: {
            const _a1296 = sp.cellEdges[v_b];
            for (let _i1297 = 0; _i1297 < _a1296.length; _i1297++) {
              const v_e = _a1296[_i1297];
              const _h1298 = (g[v_e] || -1);
              if (!((_h1298 === 1))) continue;
              _g1294++;
            }
          }
          if (!((_g1294 > 0))) continue;
          if (!((_eg1299.of(v_b) === _eg1299.of(v_a)))) {
            _q1276 = false;
            break Q1277;
          }
        }
      }
    }
    _c1300 = _q1276;
  }
  if (!(_c1300)) return false;
  for (let _k1301 = 0; _k1301 < cl.number.at.length; _k1301++) {
    const _at1302 = cl.number.at[_k1301];
    let _g1304 = 0;
    G1305: {
      const _a1306 = sp.faceEdges[_at1302];
      for (let _i1307 = 0; _i1307 < _a1306.length; _i1307++) {
        const v_e = _a1306[_i1307];
        const _h1308 = (g[v_e] || -1);
        if (!((_h1308 === 1))) continue;
        _g1304++;
      }
    }
    if (!((_g1304 === clueAt(cl.number, _at1302)))) return false;
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
  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
    const v_f = _a177[_i178];
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
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      let _c214: boolean = true;
      if (_c214) {
        let _q210 = true;
        Q211: {
          const _a212 = sp.faceEdges[v_f];
          for (let _i213 = 0; _i213 < _a212.length; _i213++) {
            const v_g = _a212[_i213];
            if (!(((v_g !== v_e) && !((b.grid[v_g] !== 0))))) continue;
            if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
            if (!(true)) {
              _q210 = false;
              break Q211;
            }
          }
        }
        _c214 = _q210;
      }
      if (!(_c214)) return -1;
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
  const _a243 = sp.faces;
  for (let _i244 = 0; _i244 < _a243.length; _i244++) {
    const v_f = _a243[_i244];
    const _h245 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c254: boolean = (_h245 !== -1);
    if (_c254) {
      let _g246 = 0;
      G247: {
        const _a248 = sp.faceEdges[v_f];
        for (let _i249 = 0; _i249 < _a248.length; _i249++) {
          const v_e = _a248[_i249];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g246++;
        }
      }
      let _g250 = 0;
      G251: {
        const _a252 = sp.faceEdges[v_f];
        for (let _i253 = 0; _i253 < _a252.length; _i253++) {
          const v_e = _a252[_i253];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g250++;
        }
      }
      _c254 = ((_h245 - _g246) === (_g250 - 1));
    }
    let _c259: boolean = _c254;
    if (_c259) {
      let _g255 = 0;
      G256: {
        const _a257 = sp.faceEdges[v_f];
        for (let _i258 = 0; _i258 < _a257.length; _i258++) {
          const v_e = _a257[_i258];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          _g255++;
        }
      }
      _c259 = (_g255 > 2);
    }
    if (!(_c259)) continue;
    const _a260 = sp.faceAngles[v_f];
    for (let _i261 = 0; _i261 < _a260.length; _i261++) {
      const v_a = _a260[_i261];
      let _q262 = true;
      Q263: {
        const _a264 = sp.angleEdges[v_a];
        for (let _i265 = 0; _i265 < _a264.length; _i265++) {
          const v_e = _a264[_i265];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q262 = false;
            break Q263;
          }
        }
      }
      let _c271: boolean = _q262;
      if (_c271) {
        const _t266 = sp.angleCell[v_a];
        let _g267 = 0;
        G268: {
          const _a269 = sp.cellEdges[_t266];
          for (let _i270 = 0; _i270 < _a269.length; _i270++) {
            const v_e = _a269[_i270];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g267++;
          }
        }
        _c271 = (_g267 > 0);
      }
      if (!(_c271)) continue;
      facts.length = 0;
      changed = false;
      let _q272 = true;
      Q273: {
        const _a274 = sp.faceEdges[v_f];
        for (let _i275 = 0; _i275 < _a274.length; _i275++) {
          const v_g = _a274[_i275];
          if (!((!((b.grid[v_g] !== 0)) && !(sp.angleEdges[v_a].includes(v_g))))) continue;
          if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
          if (!(true)) {
            _q272 = false;
            break Q273;
          }
        }
      }
      if (!(_q272)) return -1;
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
  const _g303: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  _g303.length = 0;
  G304: {
    const _a307 = sp.edges;
    for (let _i308 = 0; _i308 < _a307.length; _i308++) {
      const v_e = _a307[_i308];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g303.push(v_e);
    }
  }
  const v_L = _g303;
  const _eg311 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a309 = sp.edges;
  for (let _i310 = 0; _i310 < _a309.length; _i310++) {
    const v_e = _a309[_i310];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L312: {
      const v_G = _eg311.of(sp.edgeEnds[2 * v_e]);
      let _c331: boolean = (_eg311.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c331) {
        let _q313 = false;
        Q314: {
          const _a315 = v_L;
          for (let _i316 = 0; _i316 < _a315.length; _i316++) {
            const v_g = _a315[_i316];
            if (!(_eg311.of(sp.edgeEnds[2 * v_g]) === v_G)) {
              _q313 = true;
              break Q314;
            }
          }
        }
        let _c330: boolean = _q313;
        if (!_c330) {
          let _q317 = false;
          Q318: {
            const _a319 = sp.faces;
            for (let _i320 = 0; _i320 < _a319.length; _i320++) {
              const v_f = _a319[_i320];
              const _h321 = clueAt(cl.number, v_f);
              if (!((_h321 !== -1))) continue;
              let _g322 = 0;
              G323: {
                const _a324 = sp.faceEdges[v_f];
                for (let _i325 = 0; _i325 < _a324.length; _i325++) {
                  const v_e = _a324[_i325];
                  if (!(((b.grid[v_e] || -1) === 1))) continue;
                  _g322++;
                }
              }
              let _g326 = 0;
              G327: {
                const _a328 = sp.faceEdges[v_f];
                for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                  const v_x = _a328[_i329];
                  if (!((v_x === v_e))) continue;
                  _g326++;
                }
              }
              if (((_h321 - _g322) !== _g326)) {
                _q317 = true;
                break Q318;
              }
            }
          }
          _c330 = _q317;
        }
        _c331 = _c330;
      }
      if (!(_c331)) break L312;
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
  const _g358: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g358.length = 0;
  G359: {
    const _a362 = sp.edges;
    for (let _i363 = 0; _i363 < _a362.length; _i363++) {
      const v_e = _a362[_i363];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g358.push(v_e);
    }
  }
  const v_L = _g358;
  const _eg384 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L364: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    const _h383 = sp.edgeEnds[2 * v_g];
    let _c369: boolean = (v_g !== -1);
    if (_c369) {
      let _q365 = false;
      Q366: {
        const _a367 = sp.edges;
        for (let _i368 = 0; _i368 < _a367.length; _i368++) {
          const v_e = _a367[_i368];
          if (!((b.grid[v_e] !== 0))) {
            _q365 = true;
            break Q366;
          }
        }
      }
      _c369 = _q365;
    }
    let _c378: boolean = _c369;
    if (_c378) {
      let _q370 = true;
      Q371: {
        const _a372 = sp.cells;
        for (let _i373 = 0; _i373 < _a372.length; _i373++) {
          const v_c = _a372[_i373];
          let _g374 = 0;
          G375: {
            const _a376 = sp.cellEdges[v_c];
            for (let _i377 = 0; _i377 < _a376.length; _i377++) {
              const v_e = _a376[_i377];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g374++;
            }
          }
          if (!((_g374 !== 1))) {
            _q370 = false;
            break Q371;
          }
        }
      }
      _c378 = _q370;
    }
    let _c385: boolean = _c378;
    if (_c385) {
      let _q379 = true;
      Q380: {
        const _a381 = v_L;
        for (let _i382 = 0; _i382 < _a381.length; _i382++) {
          const v_x = _a381[_i382];
          if (!((_eg384.of(sp.edgeEnds[2 * v_x]) === _eg384.of(_h383)))) {
            _q379 = false;
            break Q380;
          }
        }
      }
      _c385 = _q379;
    }
    if (!(_c385)) break L364;
    facts.length = 0;
    changed = false;
    let _q386 = true;
    Q387: {
      const _a388 = sp.edges;
      for (let _i389 = 0; _i389 < _a388.length; _i389++) {
        const v_e = _a388[_i389];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) {
          _q386 = false;
          break Q387;
        }
      }
    }
    if (!(_q386)) return -1;
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
  const _h398 = ((1 << 1));
  const _h401 = ((1 << 2));
  const _a394 = sp.edges;
  for (let _i395 = 0; _i395 < _a394.length; _i395++) {
    const v_e = _a394[_i395];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _a396 = b.relatedOf(v_e);
    for (let _i397 = 0; _i397 < _a396.length; _i397++) {
      const v_g = _a396[_i397];
      if (!((b.grid[v_g] !== 0))) continue;
      facts.length = 0;
      changed = false;
      let _c400: boolean = !((b.pairOf(v_e, v_g) === _h398));
      if (!_c400) {
        const _t399 = (b.grid[v_g] || -1);
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t399); changed = true; } else facts.push(PLACE, v_e, _t399); }
        _c400 = true;
      }
      let _c404: boolean = _c400;
      if (_c404) {
        let _c403: boolean = !((b.pairOf(v_e, v_g) === _h401));
        if (!_c403) {
          const _t402 = (3 - (b.grid[v_g] || -1));
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, _t402); changed = true; } else facts.push(PLACE, v_e, _t402); }
          _c403 = true;
        }
        _c404 = _c403;
      }
      if (!(_c404)) return -1;
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
  const _a417 = sp.cells;
  for (let _i418 = 0; _i418 < _a417.length; _i418++) {
    const v_c = _a417[_i418];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _g419 = 0;
    G420: {
      const _a421 = sp.cellEdges[v_c];
      for (let _i422 = 0; _i422 < _a421.length; _i422++) {
        const v_e = _a421[_i422];
        const _h423 = (b.grid[v_e] || -1);
        if (!((_h423 === 1))) continue;
        _g419++;
      }
    }
    if (!((_g419 === 1))) continue;
    const _a424 = sp.cellAngles[v_c];
    for (let _i425 = 0; _i425 < _a424.length; _i425++) {
      const v_a = _a424[_i425];
      let _q426 = true;
      Q427: {
        const _a428 = sp.angleEdges[v_a];
        for (let _i429 = 0; _i429 < _a428.length; _i429++) {
          const v_e = _a428[_i429];
          const _h430 = (b.grid[v_e] !== 0);
          if (!(!(_h430))) {
            _q426 = false;
            break Q427;
          }
        }
      }
      if (!(_q426)) continue;
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
      let _c436: boolean = true;
      if (_c436) {
        let _c435: boolean = !((dotOpen(b, sp, v_c) === 2));
        if (!_c435) {
          if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
          _c435 = true;
        }
        _c436 = _c435;
      }
      if (!(_c436)) return -1;
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
  const _h445 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerOtherFootprint) ?? null) : null;
  const _a443 = sp.angles;
  for (let _i444 = 0; _i444 < _a443.length; _i444++) {
    const v_a = _a443[_i444];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    if (!((b.edgeCand(v_a) !== _h445))) continue;
    const _a446 = sp.angleEdges[v_a];
    for (let _i447 = 0; _i447 < _a446.length; _i447++) {
      const v_e = _a446[_i447];
      const _a448 = sp.angleEdges[v_a];
      for (let _i449 = 0; _i449 < _a448.length; _i449++) {
        const v_g = _a448[_i449];
        if (!(((((v_g !== v_e) && (b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && ((((b.grid[v_e] || -1) === 1) && !(((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (((b.grid[v_e] || -1) === 2) && !(((b.edgeCand(v_a) >> 0) & 1) !== 0)))))) continue;
        facts.length = 0;
        changed = false;
        const _t450 = (3 - (b.grid[v_e] || -1));
        if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, _t450); changed = true; } else facts.push(PLACE, v_g, _t450); }
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
  const _h470 = ((1 << 0) | (1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerBothFootprint) ?? null) : null;
  const _a468 = sp.angles;
  for (let _i469 = 0; _i469 < _a468.length; _i469++) {
    const v_a = _a468[_i469];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c475: boolean = (b.edgeCand(v_a) !== _h470);
    if (_c475) {
      let _q471 = true;
      Q472: {
        const _a473 = sp.angleEdges[v_a];
        for (let _i474 = 0; _i474 < _a473.length; _i474++) {
          const v_e = _a473[_i474];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q471 = false;
            break Q472;
          }
        }
      }
      _c475 = _q471;
    }
    if (!(_c475)) continue;
    L476: {
      const v_c = sp.angleCell[v_a];
      let _g477 = 0;
      G478: {
        const _a479 = sp.cellEdges[v_c];
        for (let _i480 = 0; _i480 < _a479.length; _i480++) {
          const v_e = _a479[_i480];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g477++;
        }
      }
      let _c485: boolean = (_g477 === 0);
      if (_c485) {
        let _g481 = 0;
        G482: {
          const _a483 = sp.cellEdges[v_c];
          for (let _i484 = 0; _i484 < _a483.length; _i484++) {
            const v_e = _a483[_i484];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g481++;
          }
        }
        _c485 = (_g481 === 2);
      }
      if (!(_c485)) break L476;
      facts.length = 0;
      changed = false;
      let _c491: boolean = ((((b.edgeCand(v_a) >> 0) & 1) !== 0) || (((b.edgeCand(v_a) >> 2) & 1) !== 0));
      if (_c491) {
        let _c490: boolean = !(!(((b.edgeCand(v_a) >> 2) & 1) !== 0));
        if (!_c490) {
          let _q486 = true;
          Q487: {
            const _a488 = sp.angleEdges[v_a];
            for (let _i489 = 0; _i489 < _a488.length; _i489++) {
              const v_e = _a488[_i489];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
              if (!(true)) {
                _q486 = false;
                break Q487;
              }
            }
          }
          _c490 = _q486;
        }
        _c491 = _c490;
      }
      let _c497: boolean = _c491;
      if (_c497) {
        let _c496: boolean = !(!(((b.edgeCand(v_a) >> 0) & 1) !== 0));
        if (!_c496) {
          let _q492 = true;
          Q493: {
            const _a494 = sp.angleEdges[v_a];
            for (let _i495 = 0; _i495 < _a494.length; _i495++) {
              const v_e = _a494[_i495];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q492 = false;
                break Q493;
              }
            }
          }
          _c496 = _q492;
        }
        _c497 = _c496;
      }
      if (!(_c497)) return -1;
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
let _f583 = new Int32Array(0);
let _l584: readonly number[] = [];
let _f613 = new Int32Array(0);
let _l614: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const clueBoundFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceAngles","angleEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function clueBound(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBoundBinding> | null): number {
  if (_f583.length < sp.edges.length) _f583 = new Int32Array(sp.edges.length).fill(-1);
  else _f583.fill(-1);
  _l584 = [];
  const _s585: number[] = [];
  if (_f613.length < sp.edges.length) _f613 = new Int32Array(sp.edges.length).fill(-1);
  else _f613.fill(-1);
  _l614 = [];
  const _s615: number[] = [];
  const facts = clueBoundFacts;
  let fired = 0;
  let changed = false;
  const _h576 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (clueBoundCands.length < sp.edges.length) clueBoundCands = new Int32Array(sp.edges.length);
  const cands = clueBoundCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(clueBoundFootprint) ?? null) : null;
  const _a565 = sp.faces;
  for (let _i566 = 0; _i566 < _a565.length; _i566++) {
    const v_f = _a565[_i566];
    const _h567 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c577: boolean = (_h567 !== -1);
    if (_c577) {
      let _q568 = false;
      Q569: {
        const _a570 = sp.faceAngles[v_f];
        for (let _i571 = 0; _i571 < _a570.length; _i571++) {
          const v_a = _a570[_i571];
          let _q572 = true;
          Q573: {
            const _a574 = sp.angleEdges[v_a];
            for (let _i575 = 0; _i575 < _a574.length; _i575++) {
              const v_e = _a574[_i575];
              if (!(!((b.grid[v_e] !== 0)))) {
                _q572 = false;
                break Q573;
              }
            }
          }
          if ((_q572 && (b.edgeCand(v_a) !== _h576))) {
            _q568 = true;
            break Q569;
          }
        }
      }
      _c577 = _q568;
    }
    if (!(_c577)) continue;
    const v_n = _h567;
    const _h609 = (v_n - 1);
    const _a578 = sp.faceEdges[v_f];
    for (let _i579 = 0; _i579 < _a578.length; _i579++) {
      const v_e = _a578[_i579];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      const v_S = minus(sp.faceEdges[v_f], setOf(v_e));
      const _h591 = v_S.length;
      const _h607 = (2 * _h591);
      const _h608 = (_h607 - v_n);
      const _h636 = (_h607 - _h609);
      let _q580 = false;
      Q581: {
        const _a582 = v_S;
        const _t592 = ((2 * _h591) - v_n);
        const _lo593 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi594 = 31 - Math.clz32(b.domain);
        for (const _e586 of _l584) _f583[_e586] = -1;
        _l584 = _a582;
        let _i588 = 0;
        _s585[0] = 0;
        let _o596 = _a582.length === 0;
        for (;;) {
          if (_a582.length === 0) {
            if (!_o596) break;
            _o596 = false;
          }
          while (_a582.length > 0 && _i588 >= 0) {
            const _e586 = _a582[_i588];
            if (_s585[_i588] > 0) _f583[_e586] = -1;
            let _r595 = (cands[_e586] >= 0 ? cands[_e586] : (cands[_e586] = b.cands[_e586])) & ~((2 << _s585[_i588]) - 1);
            let _d587 = 0;
            V590: for (; _r595 !== 0; _r595 &= _r595 - 1) {
              _d587 = 31 - Math.clz32(_r595 & -_r595);
              _f583[_e586] = _d587;
              {
                let _t597 = _d587;
                for (let _j589 = 0; _j589 < _i588; _j589++) _t597 += _f583[_a582[_j589]];
                if (_t597 + (_a582.length - _i588 - 1) * _lo593 > _t592) continue;
                if (_t597 + (_a582.length - _i588 - 1) * _hi594 < _t592) continue;
              }
              for (let _j589 = 0; _j589 < _i588; _j589++) {
                const _y598 = _a582[_j589];
                let _q599 = true;
                Q600: {
                  const _a601 = sp.faceAngles[v_f];
                  for (let _i602 = 0; _i602 < _a601.length; _i602++) {
                    const v_a = _a601[_i602];
                    if (!(((sp.angleEdges[v_a].includes(_e586)) && (sp.angleEdges[v_a].includes(_y598))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - _f583[_e586]) - _f583[_y598])) & 1) !== 0))) {
                      _q599 = false;
                      break Q600;
                    }
                  }
                }
                if (!(_q599)) continue V590;
              }
              break;
            }
            if (_r595 === 0) {
              _s585[_i588] = 0;
              _i588--;
              continue;
            }
            _s585[_i588] = _d587;
            if (_i588 === _a582.length - 1) break;
            _i588++;
            _s585[_i588] = 0;
          }
          if (_i588 < 0) break;
          let _g603 = 0;
          G604: {
            const _a605 = v_S;
            for (let _i606 = 0; _i606 < _a605.length; _i606++) {
              const v_x = _a605[_i606];
              _g603 += _f583[v_x];
            }
          }
          if (!((_g603 === _h608))) continue;
          if (true) {
            _q580 = true;
            break Q581;
          }
        }
      }
      const v_P = _q580;
      let _q610 = false;
      Q611: {
        const _a612 = v_S;
        const _t621 = ((2 * _h591) - _h609);
        const _lo622 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi623 = 31 - Math.clz32(b.domain);
        for (const _e616 of _l614) _f613[_e616] = -1;
        _l614 = _a612;
        let _i618 = 0;
        _s615[0] = 0;
        let _o625 = _a612.length === 0;
        for (;;) {
          if (_a612.length === 0) {
            if (!_o625) break;
            _o625 = false;
          }
          while (_a612.length > 0 && _i618 >= 0) {
            const _e616 = _a612[_i618];
            if (_s615[_i618] > 0) _f613[_e616] = -1;
            let _r624 = (cands[_e616] >= 0 ? cands[_e616] : (cands[_e616] = b.cands[_e616])) & ~((2 << _s615[_i618]) - 1);
            let _d617 = 0;
            V620: for (; _r624 !== 0; _r624 &= _r624 - 1) {
              _d617 = 31 - Math.clz32(_r624 & -_r624);
              _f613[_e616] = _d617;
              {
                let _t626 = _d617;
                for (let _j619 = 0; _j619 < _i618; _j619++) _t626 += _f613[_a612[_j619]];
                if (_t626 + (_a612.length - _i618 - 1) * _lo622 > _t621) continue;
                if (_t626 + (_a612.length - _i618 - 1) * _hi623 < _t621) continue;
              }
              for (let _j619 = 0; _j619 < _i618; _j619++) {
                const _y627 = _a612[_j619];
                let _q628 = true;
                Q629: {
                  const _a630 = sp.faceAngles[v_f];
                  for (let _i631 = 0; _i631 < _a630.length; _i631++) {
                    const v_a = _a630[_i631];
                    if (!(((sp.angleEdges[v_a].includes(_e616)) && (sp.angleEdges[v_a].includes(_y627))))) continue;
                    if (!((((b.edgeCand(v_a) >> ((4 - _f613[_e616]) - _f613[_y627])) & 1) !== 0))) {
                      _q628 = false;
                      break Q629;
                    }
                  }
                }
                if (!(_q628)) continue V620;
              }
              break;
            }
            if (_r624 === 0) {
              _s615[_i618] = 0;
              _i618--;
              continue;
            }
            _s615[_i618] = _d617;
            if (_i618 === _a612.length - 1) break;
            _i618++;
            _s615[_i618] = 0;
          }
          if (_i618 < 0) break;
          let _g632 = 0;
          G633: {
            const _a634 = v_S;
            for (let _i635 = 0; _i635 < _a634.length; _i635++) {
              const v_x = _a634[_i635];
              _g632 += _f613[v_x];
            }
          }
          if (!((_g632 === _h636))) continue;
          if (true) {
            _q610 = true;
            break Q611;
          }
        }
      }
      L637: {
        const v_Q = _q610;
        if (!((!(v_P) || !(v_Q)))) break L637;
        facts.length = 0;
        changed = false;
        let _c639: boolean = (v_P || v_Q);
        if (_c639) {
          let _c638: boolean = !(!(v_P));
          if (!_c638) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c638 = true;
          }
          _c639 = _c638;
        }
        let _c641: boolean = _c639;
        if (_c641) {
          let _c640: boolean = !(!(v_Q));
          if (!_c640) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c640 = true;
          }
          _c641 = _c640;
        }
        if (!(_c641)) return -1;
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
let _f749 = new Int32Array(0);
let _l750: readonly number[] = [];
let _f778 = new Int32Array(0);
let _l779: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const cornerFromClueFootprint: Footprint = {"sort":"face","reads":[{"steps":["faceEdges"],"kind":"answer"},{"steps":["faceAngles"],"kind":"edgeMark"},{"steps":["faceAngles","angleEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function cornerFromClue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CornerFromClueBinding> | null): number {
  if (_f749.length < sp.edges.length) _f749 = new Int32Array(sp.edges.length).fill(-1);
  else _f749.fill(-1);
  _l750 = [];
  const _s751: number[] = [];
  if (_f778.length < sp.edges.length) _f778 = new Int32Array(sp.edges.length).fill(-1);
  else _f778.fill(-1);
  _l779 = [];
  const _s780: number[] = [];
  const facts = cornerFromClueFacts;
  let fired = 0;
  let changed = false;
  const _h736 = ((1 << 0) | (1 << 1) | (1 << 2));
  if (cornerFromClueCands.length < sp.edges.length) cornerFromClueCands = new Int32Array(sp.edges.length);
  const cands = cornerFromClueCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(cornerFromClueFootprint) ?? null) : null;
  const _a718 = sp.faces;
  for (let _i719 = 0; _i719 < _a718.length; _i719++) {
    const v_f = _a718[_i719];
    const _h720 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h720 !== -1))) continue;
    const v_n = _h720;
    const _h745 = (v_n - 2);
    let _g721 = 0;
    G722: {
      const _a723 = sp.faceEdges[v_f];
      for (let _i724 = 0; _i724 < _a723.length; _i724++) {
        const v_e = _a723[_i724];
        const _h725 = (b.grid[v_e] || -1);
        if (!((_h725 === 1))) continue;
        _g721++;
      }
    }
    const v_k = (_h720 - _g721);
    let _g726 = 0;
    G727: {
      const _a728 = sp.faceEdges[v_f];
      for (let _i729 = 0; _i729 < _a728.length; _i729++) {
        const v_e = _a728[_i729];
        const _h730 = (b.grid[v_e] !== 0);
        if (!(!(_h730))) continue;
        _g726++;
      }
    }
    L731: {
      const v_o = _g726;
      let _c737: boolean = ((v_k <= 1) || (v_k >= (v_o - 1)));
      if (!_c737) {
        let _q732 = false;
        Q733: {
          const _a734 = sp.faceAngles[v_f];
          for (let _i735 = 0; _i735 < _a734.length; _i735++) {
            const v_b = _a734[_i735];
            if ((b.edgeCand(v_b) !== _h736)) {
              _q732 = true;
              break Q733;
            }
          }
        }
        _c737 = _q732;
      }
      if (!(_c737)) break L731;
      const _a738 = sp.faceAngles[v_f];
      for (let _i739 = 0; _i739 < _a738.length; _i739++) {
        const v_a = _a738[_i739];
        let _q740 = true;
        Q741: {
          const _a742 = sp.angleEdges[v_a];
          for (let _i743 = 0; _i743 < _a742.length; _i743++) {
            const v_e = _a742[_i743];
            const _h744 = (b.grid[v_e] !== 0);
            if (!(!(_h744))) {
              _q740 = false;
              break Q741;
            }
          }
        }
        if (!(_q740)) continue;
        const v_S = minus(sp.faceEdges[v_f], sp.angleEdges[v_a]);
        const _h757 = v_S.length;
        const _h773 = (2 * _h757);
        const _h774 = (_h773 - _h745);
        const _h801 = (_h773 - v_n);
        let _q746 = false;
        Q747: {
          const _a748 = v_S;
          const _t758 = ((2 * _h757) - _h745);
          const _lo759 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi760 = 31 - Math.clz32(b.domain);
          for (const _e752 of _l750) _f749[_e752] = -1;
          _l750 = _a748;
          let _i754 = 0;
          _s751[0] = 0;
          let _o762 = _a748.length === 0;
          for (;;) {
            if (_a748.length === 0) {
              if (!_o762) break;
              _o762 = false;
            }
            while (_a748.length > 0 && _i754 >= 0) {
              const _e752 = _a748[_i754];
              if (_s751[_i754] > 0) _f749[_e752] = -1;
              let _r761 = (cands[_e752] >= 0 ? cands[_e752] : (cands[_e752] = b.cands[_e752])) & ~((2 << _s751[_i754]) - 1);
              let _d753 = 0;
              V756: for (; _r761 !== 0; _r761 &= _r761 - 1) {
                _d753 = 31 - Math.clz32(_r761 & -_r761);
                _f749[_e752] = _d753;
                {
                  let _t763 = _d753;
                  for (let _j755 = 0; _j755 < _i754; _j755++) _t763 += _f749[_a748[_j755]];
                  if (_t763 + (_a748.length - _i754 - 1) * _lo759 > _t758) continue;
                  if (_t763 + (_a748.length - _i754 - 1) * _hi760 < _t758) continue;
                }
                for (let _j755 = 0; _j755 < _i754; _j755++) {
                  const _y764 = _a748[_j755];
                  let _q765 = true;
                  Q766: {
                    const _a767 = sp.faceAngles[v_f];
                    for (let _i768 = 0; _i768 < _a767.length; _i768++) {
                      const v_a = _a767[_i768];
                      if (!(((sp.angleEdges[v_a].includes(_e752)) && (sp.angleEdges[v_a].includes(_y764))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - _f749[_e752]) - _f749[_y764])) & 1) !== 0))) {
                        _q765 = false;
                        break Q766;
                      }
                    }
                  }
                  if (!(_q765)) continue V756;
                }
                break;
              }
              if (_r761 === 0) {
                _s751[_i754] = 0;
                _i754--;
                continue;
              }
              _s751[_i754] = _d753;
              if (_i754 === _a748.length - 1) break;
              _i754++;
              _s751[_i754] = 0;
            }
            if (_i754 < 0) break;
            let _g769 = 0;
            G770: {
              const _a771 = v_S;
              for (let _i772 = 0; _i772 < _a771.length; _i772++) {
                const v_x = _a771[_i772];
                _g769 += _f749[v_x];
              }
            }
            if (!((_g769 === _h774))) continue;
            if (true) {
              _q746 = true;
              break Q747;
            }
          }
        }
        const v_P = _q746;
        let _q775 = false;
        Q776: {
          const _a777 = v_S;
          const _t786 = ((2 * _h757) - v_n);
          const _lo787 = 31 - Math.clz32(b.domain & -b.domain);
          const _hi788 = 31 - Math.clz32(b.domain);
          for (const _e781 of _l779) _f778[_e781] = -1;
          _l779 = _a777;
          let _i783 = 0;
          _s780[0] = 0;
          let _o790 = _a777.length === 0;
          for (;;) {
            if (_a777.length === 0) {
              if (!_o790) break;
              _o790 = false;
            }
            while (_a777.length > 0 && _i783 >= 0) {
              const _e781 = _a777[_i783];
              if (_s780[_i783] > 0) _f778[_e781] = -1;
              let _r789 = (cands[_e781] >= 0 ? cands[_e781] : (cands[_e781] = b.cands[_e781])) & ~((2 << _s780[_i783]) - 1);
              let _d782 = 0;
              V785: for (; _r789 !== 0; _r789 &= _r789 - 1) {
                _d782 = 31 - Math.clz32(_r789 & -_r789);
                _f778[_e781] = _d782;
                {
                  let _t791 = _d782;
                  for (let _j784 = 0; _j784 < _i783; _j784++) _t791 += _f778[_a777[_j784]];
                  if (_t791 + (_a777.length - _i783 - 1) * _lo787 > _t786) continue;
                  if (_t791 + (_a777.length - _i783 - 1) * _hi788 < _t786) continue;
                }
                for (let _j784 = 0; _j784 < _i783; _j784++) {
                  const _y792 = _a777[_j784];
                  let _q793 = true;
                  Q794: {
                    const _a795 = sp.faceAngles[v_f];
                    for (let _i796 = 0; _i796 < _a795.length; _i796++) {
                      const v_a = _a795[_i796];
                      if (!(((sp.angleEdges[v_a].includes(_e781)) && (sp.angleEdges[v_a].includes(_y792))))) continue;
                      if (!((((b.edgeCand(v_a) >> ((4 - _f778[_e781]) - _f778[_y792])) & 1) !== 0))) {
                        _q793 = false;
                        break Q794;
                      }
                    }
                  }
                  if (!(_q793)) continue V785;
                }
                break;
              }
              if (_r789 === 0) {
                _s780[_i783] = 0;
                _i783--;
                continue;
              }
              _s780[_i783] = _d782;
              if (_i783 === _a777.length - 1) break;
              _i783++;
              _s780[_i783] = 0;
            }
            if (_i783 < 0) break;
            let _g797 = 0;
            G798: {
              const _a799 = v_S;
              for (let _i800 = 0; _i800 < _a799.length; _i800++) {
                const v_x = _a799[_i800];
                _g797 += _f778[v_x];
              }
            }
            if (!((_g797 === _h801))) continue;
            if (true) {
              _q775 = true;
              break Q776;
            }
          }
        }
        L802: {
          const v_Q = _q775;
          if (!(((!(v_P) && (((b.edgeCand(v_a) >> 2) & 1) !== 0)) || (!(v_Q) && (((b.edgeCand(v_a) >> 0) & 1) !== 0))))) break L802;
          facts.length = 0;
          changed = false;
          let _c803: boolean = !(!(v_P));
          if (!_c803) {
            if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
            _c803 = true;
          }
          let _c805: boolean = _c803;
          if (_c805) {
            let _c804: boolean = !(!(v_Q));
            if (!_c804) {
              if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
              _c804 = true;
            }
            _c805 = _c804;
          }
          if (!(_c805)) return -1;
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
  const _a820 = sp.angles;
  for (let _i821 = 0; _i821 < _a820.length; _i821++) {
    const v_a = _a820[_i821];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c827: boolean = !(((b.edgeCand(v_a) >> 0) & 1) !== 0);
    if (_c827) {
      let _q822 = true;
      Q823: {
        const _a824 = sp.angleEdges[v_a];
        for (let _i825 = 0; _i825 < _a824.length; _i825++) {
          const v_e = _a824[_i825];
          const _h826 = (b.grid[v_e] !== 0);
          if (!(!(_h826))) {
            _q822 = false;
            break Q823;
          }
        }
      }
      _c827 = _q822;
    }
    if (!(_c827)) continue;
    const _a828 = sp.cellAngles[sp.angleCell[v_a]];
    for (let _i829 = 0; _i829 < _a828.length; _i829++) {
      const v_b = _a828[_i829];
      let _c834: boolean = (((b.edgeCand(v_b) >> 2) & 1) !== 0);
      if (_c834) {
        let _q830 = true;
        Q831: {
          const _a832 = sp.angleEdges[v_b];
          for (let _i833 = 0; _i833 < _a832.length; _i833++) {
            const v_e = _a832[_i833];
            if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
              _q830 = false;
              break Q831;
            }
          }
        }
        _c834 = _q830;
      }
      if (!(_c834)) continue;
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
  const _h854 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerExitFootprint) ?? null) : null;
  const _a852 = sp.angles;
  for (let _i853 = 0; _i853 < _a852.length; _i853++) {
    const v_a = _a852[_i853];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c859: boolean = (b.edgeCand(v_a) === _h854);
    if (_c859) {
      let _q855 = true;
      Q856: {
        const _a857 = sp.angleEdges[v_a];
        for (let _i858 = 0; _i858 < _a857.length; _i858++) {
          const v_e = _a857[_i858];
          if (!(!((b.grid[v_e] !== 0)))) {
            _q855 = false;
            break Q856;
          }
        }
      }
      _c859 = _q855;
    }
    if (!(_c859)) continue;
    L860: {
      const v_c = sp.angleCell[v_a];
      let _g861 = 0;
      G862: {
        const _a863 = sp.cellEdges[v_c];
        for (let _i864 = 0; _i864 < _a863.length; _i864++) {
          const v_e = _a863[_i864];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g861++;
        }
      }
      let _c869: boolean = (_g861 === 0);
      if (_c869) {
        let _g865 = 0;
        G866: {
          const _a867 = sp.cellEdges[v_c];
          for (let _i868 = 0; _i868 < _a867.length; _i868++) {
            const v_e = _a867[_i868];
            if (!(!((b.grid[v_e] !== 0)))) continue;
            _g865++;
          }
        }
        _c869 = (_g865 === 3);
      }
      if (!(_c869)) break L860;
      facts.length = 0;
      changed = false;
      let _q870 = true;
      Q871: {
        const _a872 = sp.cellEdges[v_c];
        for (let _i873 = 0; _i873 < _a872.length; _i873++) {
          const v_e = _a872[_i873];
          if (!((!((b.grid[v_e] !== 0)) && !(sp.angleEdges[v_a].includes(v_e))))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) {
            _q870 = false;
            break Q871;
          }
        }
      }
      if (!(_q870)) return -1;
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
  const _h904 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(cornerOppositeExitFootprint) ?? null) : null;
  const _a902 = sp.angles;
  for (let _i903 = 0; _i903 < _a902.length; _i903++) {
    const v_a = _a902[_i903];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c910: boolean = (b.edgeCand(v_a) === _h904);
    if (_c910) {
      let _q905 = true;
      Q906: {
        const _a907 = sp.angleEdges[v_a];
        for (let _i908 = 0; _i908 < _a907.length; _i908++) {
          const v_e = _a907[_i908];
          const _h909 = (b.grid[v_e] !== 0);
          if (!(!(_h909))) {
            _q905 = false;
            break Q906;
          }
        }
      }
      _c910 = _q905;
    }
    if (!(_c910)) continue;
    L911: {
      const v_c = sp.angleCell[v_a];
      let _g912 = 0;
      G913: {
        const _a914 = sp.cellEdges[v_c];
        for (let _i915 = 0; _i915 < _a914.length; _i915++) {
          const v_e = _a914[_i915];
          const _h916 = (b.grid[v_e] || -1);
          if (!((_h916 === 1))) continue;
          _g912++;
        }
      }
      let _c922: boolean = (_g912 === 0);
      if (_c922) {
        let _g917 = 0;
        G918: {
          const _a919 = sp.cellEdges[v_c];
          for (let _i920 = 0; _i920 < _a919.length; _i920++) {
            const v_e = _a919[_i920];
            const _h921 = (b.grid[v_e] !== 0);
            if (!(!(_h921))) continue;
            _g917++;
          }
        }
        _c922 = (_g917 === 4);
      }
      if (!(_c922)) break L911;
      const _a923 = sp.cellAngles[v_c];
      for (let _i924 = 0; _i924 < _a923.length; _i924++) {
        const v_b = _a923[_i924];
        let _q925 = true;
        Q926: {
          const _a927 = sp.angleEdges[v_b];
          for (let _i928 = 0; _i928 < _a927.length; _i928++) {
            const v_e = _a927[_i928];
            const _h929 = (b.grid[v_e] !== 0);
            if (!(!(_h929))) {
              _q925 = false;
              break Q926;
            }
          }
        }
        let _c934: boolean = (_q925 && (b.edgeCand(v_b) !== _h904));
        if (_c934) {
          let _q930 = true;
          Q931: {
            const _a932 = sp.angleEdges[v_b];
            for (let _i933 = 0; _i933 < _a932.length; _i933++) {
              const v_e = _a932[_i933];
              if (!(!(sp.angleEdges[v_a].includes(v_e)))) {
                _q930 = false;
                break Q931;
              }
            }
          }
          _c934 = _q930;
        }
        if (!(_c934)) continue;
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_b) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 0); changed = true; } else facts.push(STRIKE_EDGE, v_b, 0); }
        let _c935: boolean = true;
        if (_c935) {
          if ((b.edgeCand(v_b) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_b, 2); changed = true; } else facts.push(STRIKE_EDGE, v_b, 2); }
          _c935 = true;
        }
        if (!(_c935)) return -1;
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
  const _h976 = ((1 << 1));
  const _visit = fire === null ? (b.visit?.(matchingPairFootprint) ?? null) : null;
  const _a955 = sp.faces;
  for (let _i956 = 0; _i956 < _a955.length; _i956++) {
    const v_f = _a955[_i956];
    const _h957 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    if (!((_h957 !== -1))) continue;
    let _q958 = false;
    Q959: {
      const _a960 = sp.faceEdges[v_f];
      for (let _i961 = 0; _i961 < _a960.length; _i961++) {
        const v_e = _a960[_i961];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q958 = true;
          break Q959;
        }
      }
    }
    if (!(_q958)) continue;
    let _g962 = 0;
    G963: {
      const _a964 = sp.faceEdges[v_f];
      for (let _i965 = 0; _i965 < _a964.length; _i965++) {
        const v_e = _a964[_i965];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g962++;
      }
    }
    const v_n = (_h957 - _g962);
    const _h977 = (v_n === 1);
    const _h980 = (v_n !== 1);
    let _g966 = 0;
    G967: {
      const _a968 = sp.faceEdges[v_f];
      for (let _i969 = 0; _i969 < _a968.length; _i969++) {
        const v_e = _a968[_i969];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g966++;
      }
    }
    L970: {
      const v_o = _g966;
      if (!(((v_n === 1) || ((v_o - v_n) === 1)))) break L970;
      const _a971 = sp.faceEdges[v_f];
      for (let _i972 = 0; _i972 < _a971.length; _i972++) {
        const v_e = _a971[_i972];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        const _h975 = _i972;
        const _a973 = sp.faceEdges[v_f];
        for (let _i974 = 0; _i974 < _a973.length; _i974++) {
          const v_g = _a973[_i974];
          if (!(((!((b.grid[v_g] !== 0)) && (_i974 > _h975)) && (b.pairOf(v_e, v_g) === _h976)))) continue;
          facts.length = 0;
          changed = false;
          let _c979: boolean = !(_h977);
          if (!_c979) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            let _c978: boolean = true;
            if (_c978) {
              if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 2); changed = true; } else facts.push(PLACE, v_g, 2); }
              _c978 = true;
            }
            _c979 = _c978;
          }
          let _c983: boolean = _c979;
          if (_c983) {
            let _c982: boolean = !(_h980);
            if (!_c982) {
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              let _c981: boolean = true;
              if (_c981) {
                if (!(b.grid[v_g] !== 0)) { if (fire === null) { b.placeAt(v_g, 1); changed = true; } else facts.push(PLACE, v_g, 1); }
                _c981 = true;
              }
              _c982 = _c981;
            }
            _c983 = _c982;
          }
          if (!(_c983)) return -1;
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
  const _g1008: number[] = [];
  const facts = pairAtClueFacts;
  let fired = 0;
  let changed = false;
  const _h1018 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtClueFootprint) ?? null) : null;
  const _a999 = sp.faces;
  for (let _i1000 = 0; _i1000 < _a999.length; _i1000++) {
    const v_f = _a999[_i1000];
    const _h1001 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1007: boolean = (_h1001 !== -1);
    if (_c1007) {
      let _g1002 = 0;
      G1003: {
        const _a1004 = sp.faceEdges[v_f];
        for (let _i1005 = 0; _i1005 < _a1004.length; _i1005++) {
          const v_e = _a1004[_i1005];
          const _h1006 = (b.grid[v_e] || -1);
          if (!((_h1006 === 1))) continue;
          _g1002++;
        }
      }
      _c1007 = ((_h1001 - _g1002) >= 0);
    }
    if (!(_c1007)) continue;
    _g1008.length = 0;
    G1009: {
      const _a1012 = sp.faceEdges[v_f];
      for (let _i1013 = 0; _i1013 < _a1012.length; _i1013++) {
        const v_e = _a1012[_i1013];
        const _h1014 = (b.grid[v_e] !== 0);
        if (!(!(_h1014))) continue;
        _g1008.push(v_e);
      }
    }
    L1015: {
      const v_O = _g1008;
      const _h1016 = v_O.length;
      if (!((_h1016 === 2))) break L1015;
      const v_e = (v_O[0] ?? -1);
      L1017: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h1018))) break L1017;
        facts.length = 0;
        changed = false;
        let _g1019 = 0;
        G1020: {
          const _a1021 = sp.faceEdges[v_f];
          for (let _i1022 = 0; _i1022 < _a1021.length; _i1022++) {
            const v_e = _a1021[_i1022];
            const _h1023 = (b.grid[v_e] || -1);
            if (!((_h1023 === 1))) continue;
            _g1019++;
          }
        }
        const _t1024 = (1 + ((_h1001 - _g1019) % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t1024); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t1024); }
        if (!(((b.pairOf(v_e, v_g) >> _t1024) & 1) !== 0)) return -1;
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
  const _g1053: number[] = [];
  const facts = parityClueFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityClueFootprint) ?? null) : null;
  const _a1045 = sp.faces;
  for (let _i1046 = 0; _i1046 < _a1045.length; _i1046++) {
    const v_f = _a1045[_i1046];
    const _h1047 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1052: boolean = (_h1047 !== -1);
    if (_c1052) {
      let _g1048 = 0;
      G1049: {
        const _a1050 = sp.faceEdges[v_f];
        for (let _i1051 = 0; _i1051 < _a1050.length; _i1051++) {
          const v_e = _a1050[_i1051];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g1048++;
        }
      }
      _c1052 = ((_h1047 - _g1048) >= 0);
    }
    if (!(_c1052)) continue;
    _g1053.length = 0;
    G1054: {
      const _a1057 = sp.faceEdges[v_f];
      for (let _i1058 = 0; _i1058 < _a1057.length; _i1058++) {
        const v_e = _a1057[_i1058];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1053.push(v_e);
      }
    }
    L1059: {
      const v_O = _g1053;
      const _h1060 = v_O.length;
      if (!((_h1060 === 3))) break L1059;
      const _a1061 = v_O;
      for (let _i1062 = 0; _i1062 < _a1061.length; _i1062++) {
        const v_e = _a1061[_i1062];
        const _h1065 = _i1062;
        const _a1063 = v_O;
        for (let _i1064 = 0; _i1064 < _a1063.length; _i1064++) {
          const v_g = _a1063[_i1064];
          if (!(((_i1064 > _h1065) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t1066 = minus(v_O, setOf(v_e, v_g));
          L1067: {
            const v_k = (_t1066.length > 0 ? _t1066[0] : -1);
            if (!(((!((b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && !((b.grid[v_k] !== 0))))) break L1067;
            facts.length = 0;
            changed = false;
            const _t1072 = (2 - (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t1072); changed = true; } else facts.push(PLACE, v_k, _t1072); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ f: v_f, O: v_O.slice(), e: v_e, g: v_g, k: v_k }, facts)) return 1;
            }
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
  const _g1101: number[] = [];
  const facts = linkClueFacts;
  let fired = 0;
  let changed = false;
  const _h1116 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkClueFootprint) ?? null) : null;
  const _a1092 = sp.faces;
  for (let _i1093 = 0; _i1093 < _a1092.length; _i1093++) {
    const v_f = _a1092[_i1093];
    const _h1094 = clueAt(cl.number, v_f);
    if (_visit !== null) { if (_visit[v_f] === 0) continue; _visit[v_f] = 0; }
    let _c1100: boolean = (_h1094 !== -1);
    if (_c1100) {
      let _g1095 = 0;
      G1096: {
        const _a1097 = sp.faceEdges[v_f];
        for (let _i1098 = 0; _i1098 < _a1097.length; _i1098++) {
          const v_e = _a1097[_i1098];
          const _h1099 = (b.grid[v_e] || -1);
          if (!((_h1099 === 1))) continue;
          _g1095++;
        }
      }
      _c1100 = ((_h1094 - _g1095) >= 0);
    }
    if (!(_c1100)) continue;
    _g1101.length = 0;
    G1102: {
      const _a1105 = sp.faceEdges[v_f];
      for (let _i1106 = 0; _i1106 < _a1105.length; _i1106++) {
        const v_e = _a1105[_i1106];
        const _h1107 = (b.grid[v_e] !== 0);
        if (!(!(_h1107))) continue;
        _g1101.push(v_e);
      }
    }
    L1108: {
      const v_O = _g1101;
      const _h1109 = v_O.length;
      if (!((_h1109 === 4))) break L1108;
      const _a1110 = v_O;
      for (let _i1111 = 0; _i1111 < _a1110.length; _i1111++) {
        const v_e = _a1110[_i1111];
        const _h1114 = _i1111;
        const _a1112 = v_O;
        for (let _i1113 = 0; _i1113 < _a1112.length; _i1113++) {
          const v_g = _a1112[_i1113];
          if (!(((_i1113 > _h1114) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L1115: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h1116))) break L1115;
            facts.length = 0;
            changed = false;
            const _t1117 = (1 + (((need(b, sp, cl, v_f) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t1117); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t1117); }
            if (!(((b.pairOf(v_h, v_k) >> _t1117) & 1) !== 0)) return -1;
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
  const _h1128 = ((1 << 1));
  const _h1136 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairFromCornerFootprint) ?? null) : null;
  const _a1126 = sp.angles;
  for (let _i1127 = 0; _i1127 < _a1126.length; _i1127++) {
    const v_a = _a1126[_i1127];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1134: boolean = (b.edgeCand(v_a) === _h1128);
    if (_c1134) {
      let _q1129 = true;
      Q1130: {
        const _a1131 = sp.angleEdges[v_a];
        for (let _i1132 = 0; _i1132 < _a1131.length; _i1132++) {
          const v_e = _a1131[_i1132];
          const _h1133 = (b.grid[v_e] !== 0);
          if (!(!(_h1133))) {
            _q1129 = false;
            break Q1130;
          }
        }
      }
      _c1134 = _q1129;
    }
    if (!(_c1134)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L1135: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h1136))) break L1135;
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
  const _h1147 = ((1 << 1));
  const _h1155 = ((1 << 2));
  const _visit = fire === null ? (b.visit?.(cornerFromPairFootprint) ?? null) : null;
  const _a1145 = sp.angles;
  for (let _i1146 = 0; _i1146 < _a1145.length; _i1146++) {
    const v_a = _a1145[_i1146];
    if (_visit !== null) { if (_visit[v_a] === 0) continue; _visit[v_a] = 0; }
    let _c1153: boolean = (b.edgeCand(v_a) !== _h1147);
    if (_c1153) {
      let _q1148 = true;
      Q1149: {
        const _a1150 = sp.angleEdges[v_a];
        for (let _i1151 = 0; _i1151 < _a1150.length; _i1151++) {
          const v_e = _a1150[_i1151];
          const _h1152 = (b.grid[v_e] !== 0);
          if (!(!(_h1152))) {
            _q1148 = false;
            break Q1149;
          }
        }
      }
      _c1153 = _q1148;
    }
    if (!(_c1153)) continue;
    const v_e = (sp.angleEdges[v_a][0] ?? -1);
    L1154: {
      const v_g = (sp.angleEdges[v_a][1] ?? -1);
      if (!((b.pairOf(v_e, v_g) === _h1155))) break L1154;
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_a) >> 0) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 0); changed = true; } else facts.push(STRIKE_EDGE, v_a, 0); }
      let _c1156: boolean = true;
      if (_c1156) {
        if ((b.edgeCand(v_a) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_a, 2); changed = true; } else facts.push(STRIKE_EDGE, v_a, 2); }
        _c1156 = true;
      }
      if (!(_c1156)) return -1;
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
  const _g1169: number[] = [];
  const facts = pairAtDotFacts;
  let fired = 0;
  let changed = false;
  const _h1179 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(pairAtDotFootprint) ?? null) : null;
  const _a1167 = sp.cells;
  for (let _i1168 = 0; _i1168 < _a1167.length; _i1168++) {
    const v_c = _a1167[_i1168];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g1169.length = 0;
    G1170: {
      const _a1173 = sp.cellEdges[v_c];
      for (let _i1174 = 0; _i1174 < _a1173.length; _i1174++) {
        const v_e = _a1173[_i1174];
        const _h1175 = (b.grid[v_e] !== 0);
        if (!(!(_h1175))) continue;
        _g1169.push(v_e);
      }
    }
    L1176: {
      const v_O = _g1169;
      const _h1177 = v_O.length;
      if (!((_h1177 === 2))) break L1176;
      const v_e = (v_O[0] ?? -1);
      L1178: {
        const v_g = (v_O[1] ?? -1);
        if (!((b.pairOf(v_e, v_g) === _h1179))) break L1178;
        facts.length = 0;
        changed = false;
        let _g1180 = 0;
        G1181: {
          const _a1182 = sp.cellEdges[v_c];
          for (let _i1183 = 0; _i1183 < _a1182.length; _i1183++) {
            const v_e = _a1182[_i1183];
            const _h1184 = (b.grid[v_e] || -1);
            if (!((_h1184 === 1))) continue;
            _g1180++;
          }
        }
        const _t1185 = (1 + (_g1180 % 2));
        if (b.pairOf(v_e, v_g) === 6) { if (fire === null) { b.relateAt(v_e, v_g, _t1185); changed = true; } else facts.push(RELATE, v_e, 4 * v_g + _t1185); }
        if (!(((b.pairOf(v_e, v_g) >> _t1185) & 1) !== 0)) return -1;
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
  const _g1203: number[] = [];
  const facts = parityDotFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(parityDotFootprint) ?? null) : null;
  const _a1201 = sp.cells;
  for (let _i1202 = 0; _i1202 < _a1201.length; _i1202++) {
    const v_c = _a1201[_i1202];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
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
      const v_O = _g1203;
      const _h1210 = v_O.length;
      if (!((_h1210 === 3))) break L1209;
      const _a1211 = v_O;
      for (let _i1212 = 0; _i1212 < _a1211.length; _i1212++) {
        const v_e = _a1211[_i1212];
        const _h1215 = _i1212;
        const _a1213 = v_O;
        for (let _i1214 = 0; _i1214 < _a1213.length; _i1214++) {
          const v_g = _a1213[_i1214];
          if (!(((_i1214 > _h1215) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const _t1216 = minus(v_O, setOf(v_e, v_g));
          L1217: {
            const v_k = (_t1216.length > 0 ? _t1216[0] : -1);
            if (!(((!((b.grid[v_e] !== 0)) && !((b.grid[v_g] !== 0))) && !((b.grid[v_k] !== 0))))) break L1217;
            facts.length = 0;
            changed = false;
            const _t1222 = (2 - (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (!(b.grid[v_k] !== 0)) { if (fire === null) { b.placeAt(v_k, _t1222); changed = true; } else facts.push(PLACE, v_k, _t1222); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ c: v_c, O: v_O.slice(), e: v_e, g: v_g, k: v_k }, facts)) return 1;
            }
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
  const _g1239: number[] = [];
  const facts = linkDotFacts;
  let fired = 0;
  let changed = false;
  const _h1254 = ((1 << 1) | (1 << 2));
  const _visit = fire === null ? (b.visit?.(linkDotFootprint) ?? null) : null;
  const _a1237 = sp.cells;
  for (let _i1238 = 0; _i1238 < _a1237.length; _i1238++) {
    const v_c = _a1237[_i1238];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g1239.length = 0;
    G1240: {
      const _a1243 = sp.cellEdges[v_c];
      for (let _i1244 = 0; _i1244 < _a1243.length; _i1244++) {
        const v_e = _a1243[_i1244];
        const _h1245 = (b.grid[v_e] !== 0);
        if (!(!(_h1245))) continue;
        _g1239.push(v_e);
      }
    }
    L1246: {
      const v_O = _g1239;
      const _h1247 = v_O.length;
      if (!((_h1247 === 4))) break L1246;
      const _a1248 = v_O;
      for (let _i1249 = 0; _i1249 < _a1248.length; _i1249++) {
        const v_e = _a1248[_i1249];
        const _h1252 = _i1249;
        const _a1250 = v_O;
        for (let _i1251 = 0; _i1251 < _a1250.length; _i1251++) {
          const v_g = _a1250[_i1251];
          if (!(((_i1251 > _h1252) && (popcount(b.pairOf(v_e, v_g)) === 1)))) continue;
          const v_R = minus(v_O, setOf(v_e, v_g));
          const v_h = (v_R[0] ?? -1);
          L1253: {
            const v_k = (v_R[1] ?? -1);
            if (!((b.pairOf(v_h, v_k) === _h1254))) break L1253;
            facts.length = 0;
            changed = false;
            const _t1255 = (1 + (((dotLines(b, sp, v_c) + least(b.pairOf(v_e, v_g))) - 1) % 2));
            if (b.pairOf(v_h, v_k) === 6) { if (fire === null) { b.relateAt(v_h, v_k, _t1255); changed = true; } else facts.push(RELATE, v_h, 4 * v_k + _t1255); }
            if (!(((b.pairOf(v_h, v_k) >> _t1255) & 1) !== 0)) return -1;
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
  let _g431 = 0;
  G432: {
    const _a433 = sp.cellEdges[v_c];
    for (let _i434 = 0; _i434 < _a433.length; _i434++) {
      const v_e = _a433[_i434];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      _g431++;
    }
  }
  const _made = _g431;
  _kept[v_c] = _made;
  return _made;
}

const needKept = keptStore<number>();

/** `need(f)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_f: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_f] !== undefined) return _kept[v_f];
  let _g1068 = 0;
  G1069: {
    const _a1070 = sp.faceEdges[v_f];
    for (let _i1071 = 0; _i1071 < _a1070.length; _i1071++) {
      const v_e = _a1070[_i1071];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1068++;
    }
  }
  const _made = (clueAt(cl.number, v_f) - _g1068);
  _kept[v_f] = _made;
  return _made;
}

const dotLinesKept = keptStore<number>();

/** `dotLines(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function dotLines(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = dotLinesKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1218 = 0;
  G1219: {
    const _a1220 = sp.cellEdges[v_c];
    for (let _i1221 = 0; _i1221 < _a1220.length; _i1221++) {
      const v_e = _a1220[_i1221];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1218++;
    }
  }
  const _made = _g1218;
  _kept[v_c] = _made;
  return _made;
}
