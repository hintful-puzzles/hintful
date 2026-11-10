// Compiled by `npm run describe` from src/games/net/net.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptEdgeGroups, keptStore, memberMarks, minus, rangeMask, sameSet, setOf, staleChecking, stamps, through, type Footprint, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  piece: ClueList;
  wall: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "fitLock" | "fitNote" | "loopLock" | "loopNote" | "sealLock" | "sealNote" | "strandLock" | "strandNote";

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
  { id: "fitLock", tier: 0 },
  { id: "fitNote", tier: 0 },
  { id: "loopLock", tier: 0 },
  { id: "loopNote", tier: 0 },
  { id: "sealLock", tier: 0 },
  { id: "sealNote", tier: 0 },
  { id: "strandLock", tier: 0 },
  { id: "strandNote", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g8: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h17 = sp.cells.length;
  const _k32 = armsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = clueAt(cl.piece, v_c);
      if (!((_h5 !== -1))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q6 = true;
  Q7: {
    _g8.length = 0;
    G9: {
      const _a12 = sp.edges;
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_e = _a12[_i13];
        const _h14 = (g[v_e] || -1);
        if (!((_h14 === 1))) continue;
        _g8.push(v_e);
      }
    }
    const v_L = _g8;
    const _h16 = v_L.length;
    const _eg22 = edgeGroups(sp, v_L);
    const _t15 = sp.cells;
    const v_s = (_t15.length > 0 ? _t15[0] : -1);
    let _c23: boolean = (_h16 === (_h17 - 1));
    if (_c23) {
      let _q18 = true;
      Q19: {
        const _a20 = sp.cells;
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_c = _a20[_i21];
          if (!((_eg22.of(v_c) === _eg22.of(v_s)))) {
            _q18 = false;
            break Q19;
          }
        }
      }
      _c23 = _q18;
    }
    if (!(_c23)) {
      _q6 = false;
      break Q7;
    }
  }
  if (!(_q6)) return false;
  for (let _k24 = 0; _k24 < cl.piece.at.length; _k24++) {
    const _at25 = cl.piece.at[_k24];
    const _v26 = cl.piece.v[_k24];
    let _g27 = 0;
    G28: {
      const _a29 = sp.cellEdges[_at25];
      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
        const v_e = _a29[_i30];
        const _h31 = (g[v_e] || -1);
        if (!((_h31 === 1))) continue;
        _g27++;
      }
    }
    let _c43: boolean = (_g27 === (_k32[_at25] ?? arms(sp, cl, _at25)));
    if (_c43) {
      let _q33 = true;
      Q34: {
        const _a35 = sp.cellEdges[_at25];
        for (let _i36 = 0; _i36 < _a35.length; _i36++) {
          const v_e = _a35[_i36];
          const _h40 = (g[v_e] || -1);
          const _h41 = (_h40 === 1);
          const _a37 = sp.cellEdges[_at25];
          const _n38 = _i36;
          for (let _i39 = 0; _i39 < _n38; _i39++) {
            const v_x = _a37[_i39];
            const _h42 = (g[v_x] || -1);
            if (!(((((_k32[_at25] ?? arms(sp, cl, _at25)) === 2) && _h41) && (_h42 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v26 === 3)))) {
              _q33 = false;
              break Q34;
            }
          }
        }
      }
      _c43 = _q33;
    }
    if (!(_c43)) return false;
  }
  for (let _k44 = 0; _k44 < cl.wall.at.length; _k44++) {
    const _at45 = cl.wall.at[_k44];
    if (!(((g[_at45] || -1) === 2))) return false;
  }
  return true;
}

export interface FitLockBinding {
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const fitLockFacts: number[] = [];
let fitLockCands = new Int32Array(0);
let fitLock_p133 = new Int32Array(0);
let fitLock_l134: readonly number[] = [];
let fitLock_f139 = new Int32Array(0);
let fitLock_l140: readonly number[] = [];
let fitLock_p179 = new Int32Array(0);
let fitLock_l180: readonly number[] = [];
let fitLock_f185 = new Int32Array(0);
let fitLock_l186: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const fitLockFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function fitLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitLockBinding> | null): number {
  const _g101: number[] = [];
  const _g109: number[] = [];
  if (fitLock_p133.length < sp.edges.length) fitLock_p133 = new Int32Array(sp.edges.length);
  else fitLock_p133.fill(0);
  fitLock_l134 = [];
  let _y135 = false;
  if (fitLock_f139.length < sp.edges.length) fitLock_f139 = new Int32Array(sp.edges.length).fill(-1);
  else fitLock_f139.fill(-1);
  fitLock_l140 = [];
  const _s141: number[] = [];
  const _g155: number[] = [];
  if (fitLock_p179.length < sp.edges.length) fitLock_p179 = new Int32Array(sp.edges.length);
  else fitLock_p179.fill(0);
  fitLock_l180 = [];
  let _y181 = false;
  if (fitLock_f185.length < sp.edges.length) fitLock_f185 = new Int32Array(sp.edges.length).fill(-1);
  else fitLock_f185.fill(-1);
  fitLock_l186 = [];
  const _s187: number[] = [];
  const facts = fitLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k150 = armsKept.board(cl);
  if (fitLockCands.length < sp.edges.length) fitLockCands = new Int32Array(sp.edges.length);
  const cands = fitLockCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(fitLockFootprint) ?? null) : null;
  const _a99 = sp.cells;
  for (let _i100 = 0; _i100 < _a99.length; _i100++) {
    const v_c = _a99[_i100];
    let _g136 = -1;
    let _g182 = -1;
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g101.length = 0;
    G102: {
      const _a105 = sp.cellEdges[v_c];
      for (let _i106 = 0; _i106 < _a105.length; _i106++) {
        const v_e = _a105[_i106];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g101.push(v_e);
      }
    }
    L107: {
      const v_F = _g101;
      const _h108 = v_F.length;
      if (!((_h108 > 0))) break L107;
      _g109.length = 0;
      G110: {
        const _a131 = v_F;
        for (let _i132 = 0; _i132 < _a131.length; _i132++) {
          const v_e = _a131[_i132];
          if (_g136 !== _epoch) {
            _g136 = _epoch;
            for (const _e137 of fitLock_l134) fitLock_p133[_e137] = 0;
            _y135 = false;
            const _a138 = sp.cellEdges[v_c];
            for (const _e142 of fitLock_l140) fitLock_f139[_e142] = -1;
            fitLock_l140 = _a138;
            let _i144 = 0;
            _s141[0] = 0;
            let _o148 = _a138.length === 0;
            for (;;) {
              if (_a138.length === 0) {
                if (!_o148) break;
                _o148 = false;
              }
              while (_a138.length > 0 && _i144 >= 0) {
                const _e142 = _a138[_i144];
                if (_s141[_i144] > 0) fitLock_f139[_e142] = -1;
                let _r147 = (cands[_e142] >= 0 ? cands[_e142] : (cands[_e142] = b.cands[_e142])) & ~((2 << _s141[_i144]) - 1);
                let _d143 = 0;
                V146: for (; _r147 !== 0; _r147 &= _r147 - 1) {
                  _d143 = 31 - Math.clz32(_r147 & -_r147);
                  fitLock_f139[_e142] = _d143;
                  for (let _j145 = 0; _j145 < _i144; _j145++) {
                    const _y149 = _a138[_j145];
                    if (!(((((_k150[v_c] ?? arms(sp, cl, v_c)) === 2) && (fitLock_f139[_e142] === 1)) && (fitLock_f139[_y149] === 1)))) continue;
                    if (!((bent(sp, _e142, _y149) === (clueAt(cl.piece, v_c) === 3)))) continue V146;
                  }
                  break;
                }
                if (_r147 === 0) {
                  _s141[_i144] = 0;
                  _i144--;
                  continue;
                }
                _s141[_i144] = _d143;
                if (_i144 === _a138.length - 1) break;
                _i144++;
                _s141[_i144] = 0;
              }
              if (_i144 < 0) break;
              let _g151 = 0;
              G152: {
                const _a153 = sp.cellEdges[v_c];
                for (let _i154 = 0; _i154 < _a153.length; _i154++) {
                  const v_x = _a153[_i154];
                  if (!((fitLock_f139[v_x] === 1))) continue;
                  _g151++;
                }
              }
              if (!((_g151 === (_k150[v_c] ?? arms(sp, cl, v_c))))) continue;
              if (!(true)) continue;
              fitLock_l134 = _a138;
              _y135 = true;
              for (const _e137 of _a138) fitLock_p133[_e137] |= 1 << fitLock_f139[_e137];
            }
          }
          if (!(((((fitLock_p133[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y135 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g109.push(v_e);
        }
      }
      const v_W = _g109;
      _g155.length = 0;
      G156: {
        const _a177 = v_F;
        for (let _i178 = 0; _i178 < _a177.length; _i178++) {
          const v_e = _a177[_i178];
          if (_g182 !== _epoch) {
            _g182 = _epoch;
            for (const _e183 of fitLock_l180) fitLock_p179[_e183] = 0;
            _y181 = false;
            const _a184 = sp.cellEdges[v_c];
            for (const _e188 of fitLock_l186) fitLock_f185[_e188] = -1;
            fitLock_l186 = _a184;
            let _i190 = 0;
            _s187[0] = 0;
            let _o194 = _a184.length === 0;
            for (;;) {
              if (_a184.length === 0) {
                if (!_o194) break;
                _o194 = false;
              }
              while (_a184.length > 0 && _i190 >= 0) {
                const _e188 = _a184[_i190];
                if (_s187[_i190] > 0) fitLock_f185[_e188] = -1;
                let _r193 = (cands[_e188] >= 0 ? cands[_e188] : (cands[_e188] = b.cands[_e188])) & ~((2 << _s187[_i190]) - 1);
                let _d189 = 0;
                V192: for (; _r193 !== 0; _r193 &= _r193 - 1) {
                  _d189 = 31 - Math.clz32(_r193 & -_r193);
                  fitLock_f185[_e188] = _d189;
                  for (let _j191 = 0; _j191 < _i190; _j191++) {
                    const _y195 = _a184[_j191];
                    if (!(((((_k150[v_c] ?? arms(sp, cl, v_c)) === 2) && (fitLock_f185[_e188] === 1)) && (fitLock_f185[_y195] === 1)))) continue;
                    if (!((bent(sp, _e188, _y195) === (clueAt(cl.piece, v_c) === 3)))) continue V192;
                  }
                  break;
                }
                if (_r193 === 0) {
                  _s187[_i190] = 0;
                  _i190--;
                  continue;
                }
                _s187[_i190] = _d189;
                if (_i190 === _a184.length - 1) break;
                _i190++;
                _s187[_i190] = 0;
              }
              if (_i190 < 0) break;
              let _g196 = 0;
              G197: {
                const _a198 = sp.cellEdges[v_c];
                for (let _i199 = 0; _i199 < _a198.length; _i199++) {
                  const v_x = _a198[_i199];
                  if (!((fitLock_f185[v_x] === 1))) continue;
                  _g196++;
                }
              }
              if (!((_g196 === (_k150[v_c] ?? arms(sp, cl, v_c))))) continue;
              if (!(true)) continue;
              fitLock_l180 = _a184;
              _y181 = true;
              for (const _e183 of _a184) fitLock_p179[_e183] |= 1 << fitLock_f185[_e183];
            }
          }
          if (!(((((fitLock_p179[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y181 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g155.push(v_e);
        }
      }
      L200: {
        const v_N = _g155;
        let _q201 = true;
        Q202: {
          const _a203 = v_F;
          for (let _i204 = 0; _i204 < _a203.length; _i204++) {
            const v_e = _a203[_i204];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q201 = false;
              break Q202;
            }
          }
        }
        if (!(_q201)) break L200;
        if (import.meta.env.DEV && staleChecking) {
          const _g205: number[] = [];
          G206: {
            const _a209 = sp.cellEdges[v_c];
            for (let _i210 = 0; _i210 < _a209.length; _i210++) {
              const v_e = _a209[_i210];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g205.push(v_e);
            }
          }
          const _g211: number[] = [];
          G212: {
            const _a233 = v_F;
            for (let _i234 = 0; _i234 < _a233.length; _i234++) {
              const v_e = _a233[_i234];
              let _q235 = false;
              Q236: {
                const _f238 = new Int32Array(sp.edges.length).fill(-1);
                let _l239: readonly number[] = [];
                const _s240: number[] = [];
                const _a237 = sp.cellEdges[v_c];
                for (const _e241 of _l239) _f238[_e241] = -1;
                _l239 = _a237;
                let _i243 = 0;
                _s240[0] = 0;
                let _o247 = _a237.length === 0;
                for (;;) {
                  if (_a237.length === 0) {
                    if (!_o247) break;
                    _o247 = false;
                  }
                  while (_a237.length > 0 && _i243 >= 0) {
                    const _e241 = _a237[_i243];
                    if (_s240[_i243] > 0) _f238[_e241] = -1;
                    let _r246 = (cands[_e241] >= 0 ? cands[_e241] : (cands[_e241] = b.cands[_e241])) & ~((2 << _s240[_i243]) - 1);
                    let _d242 = 0;
                    V245: for (; _r246 !== 0; _r246 &= _r246 - 1) {
                      _d242 = 31 - Math.clz32(_r246 & -_r246);
                      _f238[_e241] = _d242;
                      if (_e241 === v_e && _d242 !== 1) continue;
                      for (let _j244 = 0; _j244 < _i243; _j244++) {
                        const _y248 = _a237[_j244];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f238[_e241] === 1)) && (_f238[_y248] === 1)))) continue;
                        if (!((bent(sp, _e241, _y248) === (clueAt(cl.piece, v_c) === 3)))) continue V245;
                      }
                      break;
                    }
                    if (_r246 === 0) {
                      _s240[_i243] = 0;
                      _i243--;
                      continue;
                    }
                    _s240[_i243] = _d242;
                    if (_i243 === _a237.length - 1) break;
                    _i243++;
                    _s240[_i243] = 0;
                  }
                  if (_i243 < 0) break;
                  let _g249 = 0;
                  G250: {
                    const _a251 = sp.cellEdges[v_c];
                    for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                      const v_x = _a251[_i252];
                      if (!((_f238[v_x] === 1))) continue;
                      _g249++;
                    }
                  }
                  if (!((_g249 === arms(sp, cl, v_c)))) continue;
                  if (true) {
                    _q235 = true;
                    break Q236;
                  }
                }
              }
              if (!(_q235)) continue;
              _g211.push(v_e);
            }
          }
          const _g253: number[] = [];
          G254: {
            const _a275 = v_F;
            for (let _i276 = 0; _i276 < _a275.length; _i276++) {
              const v_e = _a275[_i276];
              let _q277 = false;
              Q278: {
                const _f280 = new Int32Array(sp.edges.length).fill(-1);
                let _l281: readonly number[] = [];
                const _s282: number[] = [];
                const _a279 = sp.cellEdges[v_c];
                for (const _e283 of _l281) _f280[_e283] = -1;
                _l281 = _a279;
                let _i285 = 0;
                _s282[0] = 0;
                let _o289 = _a279.length === 0;
                for (;;) {
                  if (_a279.length === 0) {
                    if (!_o289) break;
                    _o289 = false;
                  }
                  while (_a279.length > 0 && _i285 >= 0) {
                    const _e283 = _a279[_i285];
                    if (_s282[_i285] > 0) _f280[_e283] = -1;
                    let _r288 = (cands[_e283] >= 0 ? cands[_e283] : (cands[_e283] = b.cands[_e283])) & ~((2 << _s282[_i285]) - 1);
                    let _d284 = 0;
                    V287: for (; _r288 !== 0; _r288 &= _r288 - 1) {
                      _d284 = 31 - Math.clz32(_r288 & -_r288);
                      _f280[_e283] = _d284;
                      if (_e283 === v_e && _d284 !== 2) continue;
                      for (let _j286 = 0; _j286 < _i285; _j286++) {
                        const _y290 = _a279[_j286];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f280[_e283] === 1)) && (_f280[_y290] === 1)))) continue;
                        if (!((bent(sp, _e283, _y290) === (clueAt(cl.piece, v_c) === 3)))) continue V287;
                      }
                      break;
                    }
                    if (_r288 === 0) {
                      _s282[_i285] = 0;
                      _i285--;
                      continue;
                    }
                    _s282[_i285] = _d284;
                    if (_i285 === _a279.length - 1) break;
                    _i285++;
                    _s282[_i285] = 0;
                  }
                  if (_i285 < 0) break;
                  let _g291 = 0;
                  G292: {
                    const _a293 = sp.cellEdges[v_c];
                    for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                      const v_x = _a293[_i294];
                      if (!((_f280[v_x] === 1))) continue;
                      _g291++;
                    }
                  }
                  if (!((_g291 === arms(sp, cl, v_c)))) continue;
                  if (true) {
                    _q277 = true;
                    break Q278;
                  }
                }
              }
              if (!(_q277)) continue;
              _g253.push(v_e);
            }
          }
          let _q295 = true;
          Q296: {
            const _a297 = v_F;
            for (let _i298 = 0; _i298 < _a297.length; _i298++) {
              const v_e = _a297[_i298];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q295 = false;
                break Q296;
              }
            }
          }
          freshBinding("fitLock", [(sp.cells.includes(v_c)), sameSet(v_F, _g205), (v_F.length > 0), sameSet(v_W, _g211), sameSet(v_N, _g253), _q295], ["c in", "F =", "where of F", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q299 = true;
        Q300: {
          const _a301 = v_F;
          for (let _i302 = 0; _i302 < _a301.length; _i302++) {
            const v_e = _a301[_i302];
            let _c304: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c304) {
              let _c303: boolean = !(!(v_W.includes(v_e)));
              if (!_c303) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c303 = true;
              }
              _c304 = _c303;
            }
            let _c306: boolean = _c304;
            if (_c306) {
              let _c305: boolean = !(!(v_N.includes(v_e)));
              if (!_c305) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c305 = true;
              }
              _c306 = _c305;
            }
            if (!(_c306)) {
              _q299 = false;
              break Q300;
            }
          }
        }
        if (!(_q299)) return -1;
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

export interface FitNoteBinding {
  c: number;
  e: number;
  A: boolean;
  B: boolean;
}

const fitNoteFacts: number[] = [];
let fitNoteCands = new Int32Array(0);
let fitNote_p46 = new Int32Array(0);
let fitNote_l47: readonly number[] = [];
let fitNote_f52 = new Int32Array(0);
let fitNote_l53: readonly number[] = [];
let fitNote_p68 = new Int32Array(0);
let fitNote_l69: readonly number[] = [];
let fitNote_f74 = new Int32Array(0);
let fitNote_l75: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const fitNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function fitNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitNoteBinding> | null): number {
  if (fitNote_p46.length < sp.edges.length) fitNote_p46 = new Int32Array(sp.edges.length);
  else fitNote_p46.fill(0);
  fitNote_l47 = [];
  let _y48 = false;
  if (fitNote_f52.length < sp.edges.length) fitNote_f52 = new Int32Array(sp.edges.length).fill(-1);
  else fitNote_f52.fill(-1);
  fitNote_l53 = [];
  const _s54: number[] = [];
  if (fitNote_p68.length < sp.edges.length) fitNote_p68 = new Int32Array(sp.edges.length);
  else fitNote_p68.fill(0);
  fitNote_l69 = [];
  let _y70 = false;
  if (fitNote_f74.length < sp.edges.length) fitNote_f74 = new Int32Array(sp.edges.length).fill(-1);
  else fitNote_f74.fill(-1);
  fitNote_l75 = [];
  const _s76: number[] = [];
  const facts = fitNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k63 = armsKept.board(cl);
  if (fitNoteCands.length < sp.edges.length) fitNoteCands = new Int32Array(sp.edges.length);
  const cands = fitNoteCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(fitNoteFootprint) ?? null) : null;
  const _a42 = sp.cells;
  for (let _i43 = 0; _i43 < _a42.length; _i43++) {
    const v_c = _a42[_i43];
    let _g49 = -1;
    let _g71 = -1;
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _a44 = sp.cellEdges[v_c];
    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
      const v_e = _a44[_i45];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g49 !== _epoch) {
        _g49 = _epoch;
        for (const _e50 of fitNote_l47) fitNote_p46[_e50] = 0;
        _y48 = false;
        const _a51 = sp.cellEdges[v_c];
        for (const _e55 of fitNote_l53) fitNote_f52[_e55] = -1;
        fitNote_l53 = _a51;
        let _i57 = 0;
        _s54[0] = 0;
        let _o61 = _a51.length === 0;
        for (;;) {
          if (_a51.length === 0) {
            if (!_o61) break;
            _o61 = false;
          }
          while (_a51.length > 0 && _i57 >= 0) {
            const _e55 = _a51[_i57];
            if (_s54[_i57] > 0) fitNote_f52[_e55] = -1;
            let _r60 = (cands[_e55] >= 0 ? cands[_e55] : (cands[_e55] = b.cands[_e55])) & ~((2 << _s54[_i57]) - 1);
            let _d56 = 0;
            V59: for (; _r60 !== 0; _r60 &= _r60 - 1) {
              _d56 = 31 - Math.clz32(_r60 & -_r60);
              fitNote_f52[_e55] = _d56;
              for (let _j58 = 0; _j58 < _i57; _j58++) {
                const _y62 = _a51[_j58];
                if (!(((((_k63[v_c] ?? arms(sp, cl, v_c)) === 2) && (fitNote_f52[_e55] === 1)) && (fitNote_f52[_y62] === 1)))) continue;
                if (!((bent(sp, _e55, _y62) === (clueAt(cl.piece, v_c) === 3)))) continue V59;
              }
              break;
            }
            if (_r60 === 0) {
              _s54[_i57] = 0;
              _i57--;
              continue;
            }
            _s54[_i57] = _d56;
            if (_i57 === _a51.length - 1) break;
            _i57++;
            _s54[_i57] = 0;
          }
          if (_i57 < 0) break;
          let _g64 = 0;
          G65: {
            const _a66 = sp.cellEdges[v_c];
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              const v_x = _a66[_i67];
              if (!((fitNote_f52[v_x] === 1))) continue;
              _g64++;
            }
          }
          if (!((_g64 === (_k63[v_c] ?? arms(sp, cl, v_c))))) continue;
          if (!(true)) continue;
          fitNote_l47 = _a51;
          _y48 = true;
          for (const _e50 of _a51) fitNote_p46[_e50] |= 1 << fitNote_f52[_e50];
        }
      }
      const v_A = ((((fitNote_p46[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y48 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g71 !== _epoch) {
        _g71 = _epoch;
        for (const _e72 of fitNote_l69) fitNote_p68[_e72] = 0;
        _y70 = false;
        const _a73 = sp.cellEdges[v_c];
        for (const _e77 of fitNote_l75) fitNote_f74[_e77] = -1;
        fitNote_l75 = _a73;
        let _i79 = 0;
        _s76[0] = 0;
        let _o83 = _a73.length === 0;
        for (;;) {
          if (_a73.length === 0) {
            if (!_o83) break;
            _o83 = false;
          }
          while (_a73.length > 0 && _i79 >= 0) {
            const _e77 = _a73[_i79];
            if (_s76[_i79] > 0) fitNote_f74[_e77] = -1;
            let _r82 = (cands[_e77] >= 0 ? cands[_e77] : (cands[_e77] = b.cands[_e77])) & ~((2 << _s76[_i79]) - 1);
            let _d78 = 0;
            V81: for (; _r82 !== 0; _r82 &= _r82 - 1) {
              _d78 = 31 - Math.clz32(_r82 & -_r82);
              fitNote_f74[_e77] = _d78;
              for (let _j80 = 0; _j80 < _i79; _j80++) {
                const _y84 = _a73[_j80];
                if (!(((((_k63[v_c] ?? arms(sp, cl, v_c)) === 2) && (fitNote_f74[_e77] === 1)) && (fitNote_f74[_y84] === 1)))) continue;
                if (!((bent(sp, _e77, _y84) === (clueAt(cl.piece, v_c) === 3)))) continue V81;
              }
              break;
            }
            if (_r82 === 0) {
              _s76[_i79] = 0;
              _i79--;
              continue;
            }
            _s76[_i79] = _d78;
            if (_i79 === _a73.length - 1) break;
            _i79++;
            _s76[_i79] = 0;
          }
          if (_i79 < 0) break;
          let _g85 = 0;
          G86: {
            const _a87 = sp.cellEdges[v_c];
            for (let _i88 = 0; _i88 < _a87.length; _i88++) {
              const v_x = _a87[_i88];
              if (!((fitNote_f74[v_x] === 1))) continue;
              _g85++;
            }
          }
          if (!((_g85 === (_k63[v_c] ?? arms(sp, cl, v_c))))) continue;
          if (!(true)) continue;
          fitNote_l69 = _a73;
          _y70 = true;
          for (const _e72 of _a73) fitNote_p68[_e72] |= 1 << fitNote_f74[_e72];
        }
      }
      L89: {
        const v_B = ((((fitNote_p68[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y70 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L89;
        if (import.meta.env.DEV && staleChecking) {
          let _q90 = false;
          Q91: {
            const _f93 = new Int32Array(sp.edges.length).fill(-1);
            let _l94: readonly number[] = [];
            const _s95: number[] = [];
            const _a92 = sp.cellEdges[v_c];
            for (const _e96 of _l94) _f93[_e96] = -1;
            _l94 = _a92;
            let _i98 = 0;
            _s95[0] = 0;
            let _o102 = _a92.length === 0;
            for (;;) {
              if (_a92.length === 0) {
                if (!_o102) break;
                _o102 = false;
              }
              while (_a92.length > 0 && _i98 >= 0) {
                const _e96 = _a92[_i98];
                if (_s95[_i98] > 0) _f93[_e96] = -1;
                let _r101 = (cands[_e96] >= 0 ? cands[_e96] : (cands[_e96] = b.cands[_e96])) & ~((2 << _s95[_i98]) - 1);
                let _d97 = 0;
                V100: for (; _r101 !== 0; _r101 &= _r101 - 1) {
                  _d97 = 31 - Math.clz32(_r101 & -_r101);
                  _f93[_e96] = _d97;
                  if (_e96 === v_e && _d97 !== 1) continue;
                  for (let _j99 = 0; _j99 < _i98; _j99++) {
                    const _y103 = _a92[_j99];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f93[_e96] === 1)) && (_f93[_y103] === 1)))) continue;
                    if (!((bent(sp, _e96, _y103) === (clueAt(cl.piece, v_c) === 3)))) continue V100;
                  }
                  break;
                }
                if (_r101 === 0) {
                  _s95[_i98] = 0;
                  _i98--;
                  continue;
                }
                _s95[_i98] = _d97;
                if (_i98 === _a92.length - 1) break;
                _i98++;
                _s95[_i98] = 0;
              }
              if (_i98 < 0) break;
              let _g104 = 0;
              G105: {
                const _a106 = sp.cellEdges[v_c];
                for (let _i107 = 0; _i107 < _a106.length; _i107++) {
                  const v_x = _a106[_i107];
                  if (!((_f93[v_x] === 1))) continue;
                  _g104++;
                }
              }
              if (!((_g104 === arms(sp, cl, v_c)))) continue;
              if (true) {
                _q90 = true;
                break Q91;
              }
            }
          }
          let _q108 = false;
          Q109: {
            const _f111 = new Int32Array(sp.edges.length).fill(-1);
            let _l112: readonly number[] = [];
            const _s113: number[] = [];
            const _a110 = sp.cellEdges[v_c];
            for (const _e114 of _l112) _f111[_e114] = -1;
            _l112 = _a110;
            let _i116 = 0;
            _s113[0] = 0;
            let _o120 = _a110.length === 0;
            for (;;) {
              if (_a110.length === 0) {
                if (!_o120) break;
                _o120 = false;
              }
              while (_a110.length > 0 && _i116 >= 0) {
                const _e114 = _a110[_i116];
                if (_s113[_i116] > 0) _f111[_e114] = -1;
                let _r119 = (cands[_e114] >= 0 ? cands[_e114] : (cands[_e114] = b.cands[_e114])) & ~((2 << _s113[_i116]) - 1);
                let _d115 = 0;
                V118: for (; _r119 !== 0; _r119 &= _r119 - 1) {
                  _d115 = 31 - Math.clz32(_r119 & -_r119);
                  _f111[_e114] = _d115;
                  if (_e114 === v_e && _d115 !== 2) continue;
                  for (let _j117 = 0; _j117 < _i116; _j117++) {
                    const _y121 = _a110[_j117];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f111[_e114] === 1)) && (_f111[_y121] === 1)))) continue;
                    if (!((bent(sp, _e114, _y121) === (clueAt(cl.piece, v_c) === 3)))) continue V118;
                  }
                  break;
                }
                if (_r119 === 0) {
                  _s113[_i116] = 0;
                  _i116--;
                  continue;
                }
                _s113[_i116] = _d115;
                if (_i116 === _a110.length - 1) break;
                _i116++;
                _s113[_i116] = 0;
              }
              if (_i116 < 0) break;
              let _g122 = 0;
              G123: {
                const _a124 = sp.cellEdges[v_c];
                for (let _i125 = 0; _i125 < _a124.length; _i125++) {
                  const v_x = _a124[_i125];
                  if (!((_f111[v_x] === 1))) continue;
                  _g122++;
                }
              }
              if (!((_g122 === arms(sp, cl, v_c)))) continue;
              if (true) {
                _q108 = true;
                break Q109;
              }
            }
          }
          freshBinding("fitNote", [(sp.cells.includes(v_c)), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q90), (v_B === _q108), (!(v_A) || !(v_B))], ["c in", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c127: boolean = (v_A || v_B);
        if (_c127) {
          let _c126: boolean = !(!(v_A));
          if (!_c126) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c126 = true;
          }
          _c127 = _c126;
        }
        let _c129: boolean = _c127;
        if (_c129) {
          let _c128: boolean = !(!(v_B));
          if (!_c128) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c128 = true;
          }
          _c129 = _c128;
        }
        if (!(_c129)) return -1;
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

export interface LoopLockBinding {
  L: readonly number[];
  c: number;
  F: readonly number[];
  G: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const loopLockFacts: number[] = [];
let loopLockCands = new Int32Array(0);
let loopLock_p176 = new Int32Array(0);
let loopLock_l177: readonly number[] = [];
let loopLock_f182 = new Int32Array(0);
let loopLock_l183: readonly number[] = [];
let loopLock_p234 = new Int32Array(0);
let loopLock_l235: readonly number[] = [];
let loopLock_f240 = new Int32Array(0);
let loopLock_l241: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const loopLockFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds"],"kind":"group","set":0},{"steps":[],"kind":"group","set":0}],"relation":false,"sets":["L"]};

/** Its dearest read grows with the board as n. */
export function loopLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopLockBinding> | null): number {
  const _g129: number[] = [];
  const _g137: number[] = [];
  const _g146: number[] = [];
  if (loopLock_p176.length < sp.edges.length) loopLock_p176 = new Int32Array(sp.edges.length);
  else loopLock_p176.fill(0);
  loopLock_l177 = [];
  let _y178 = false;
  if (loopLock_f182.length < sp.edges.length) loopLock_f182 = new Int32Array(sp.edges.length).fill(-1);
  else loopLock_f182.fill(-1);
  loopLock_l183 = [];
  const _s184: number[] = [];
  const _g204: number[] = [];
  if (loopLock_p234.length < sp.edges.length) loopLock_p234 = new Int32Array(sp.edges.length);
  else loopLock_p234.fill(0);
  loopLock_l235 = [];
  let _y236 = false;
  if (loopLock_f240.length < sp.edges.length) loopLock_f240 = new Int32Array(sp.edges.length).fill(-1);
  else loopLock_f240.fill(-1);
  loopLock_l241 = [];
  const _s242: number[] = [];
  const _g266: number[] = [];
  const facts = loopLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k193 = armsKept.board(cl);
  if (loopLockCands.length < sp.edges.length) loopLockCands = new Int32Array(sp.edges.length);
  const cands = loopLockCands;
  cands.fill(-1);
  const _m404_0 = b.made[0];
  _g129.length = 0;
  G130: {
    const _a133 = sp.edges;
    for (let _i134 = 0; _i134 < _a133.length; _i134++) {
      const v_e = _a133[_i134];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g129.push(v_e);
    }
  }
  const v_L = _g129;
  const _m405_1 = b.made[1];
  const _eg145 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _visit = fire === null ? (b.visit?.(loopLockFootprint, [_eg145]) ?? null) : null;
  const _a135 = sp.cells;
  for (let _i136 = 0; _i136 < _a135.length; _i136++) {
    const v_c = _a135[_i136];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g137.length = 0;
    G138: {
      const _a141 = sp.cellEdges[v_c];
      for (let _i142 = 0; _i142 < _a141.length; _i142++) {
        const v_e = _a141[_i142];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g137.push(v_e);
      }
    }
    L143: {
      const v_F = _g137;
      const _h144 = v_F.length;
      if (!((_h144 > 0))) break L143;
      const v_G = _eg145.of(v_c);
      let _g179 = -1;
      let _g237 = -1;
      _g146.length = 0;
      G147: {
        const _a174 = v_F;
        for (let _i175 = 0; _i175 < _a174.length; _i175++) {
          const v_e = _a174[_i175];
          if (_g179 !== _epoch) {
            _g179 = _epoch;
            for (const _e180 of loopLock_l177) loopLock_p176[_e180] = 0;
            _y178 = false;
            const _a181 = sp.cellEdges[v_c];
            for (const _e185 of loopLock_l183) loopLock_f182[_e185] = -1;
            loopLock_l183 = _a181;
            let _i187 = 0;
            _s184[0] = 0;
            let _o191 = _a181.length === 0;
            for (;;) {
              if (_a181.length === 0) {
                if (!_o191) break;
                _o191 = false;
              }
              while (_a181.length > 0 && _i187 >= 0) {
                const _e185 = _a181[_i187];
                if (_s184[_i187] > 0) loopLock_f182[_e185] = -1;
                let _r190 = (cands[_e185] >= 0 ? cands[_e185] : (cands[_e185] = b.cands[_e185])) & ~((2 << _s184[_i187]) - 1);
                let _d186 = 0;
                V189: for (; _r190 !== 0; _r190 &= _r190 - 1) {
                  _d186 = 31 - Math.clz32(_r190 & -_r190);
                  loopLock_f182[_e185] = _d186;
                  for (let _j188 = 0; _j188 < _i187; _j188++) {
                    const _y192 = _a181[_j188];
                    if (!(((((_k193[v_c] ?? arms(sp, cl, v_c)) === 2) && (loopLock_f182[_e185] === 1)) && (loopLock_f182[_y192] === 1)))) continue;
                    if (!((bent(sp, _e185, _y192) === (clueAt(cl.piece, v_c) === 3)))) continue V189;
                  }
                  for (let _j188 = 0; _j188 < _i187; _j188++) {
                    const _y194 = _a181[_j188];
                    if (!(((((loopLock_f182[_e185] === 1) && (loopLock_f182[_y194] === 1)) && !((b.grid[_e185] !== 0))) && !((b.grid[_y194] !== 0))))) continue;
                    if (!(!(_eg145.of((sp.edgeEnds[2 * _y194] === v_c ? sp.edgeEnds[2 * _y194 + 1] : sp.edgeEnds[2 * _y194])) === _eg145.of((sp.edgeEnds[2 * _e185] === v_c ? sp.edgeEnds[2 * _e185 + 1] : sp.edgeEnds[2 * _e185]))))) continue V189;
                  }
                  break;
                }
                if (_r190 === 0) {
                  _s184[_i187] = 0;
                  _i187--;
                  continue;
                }
                _s184[_i187] = _d186;
                if (_i187 === _a181.length - 1) break;
                _i187++;
                _s184[_i187] = 0;
              }
              if (_i187 < 0) break;
              let _g195 = 0;
              G196: {
                const _a197 = sp.cellEdges[v_c];
                for (let _i198 = 0; _i198 < _a197.length; _i198++) {
                  const v_x = _a197[_i198];
                  if (!((loopLock_f182[v_x] === 1))) continue;
                  _g195++;
                }
              }
              let _c203: boolean = (_g195 === (_k193[v_c] ?? arms(sp, cl, v_c)));
              if (_c203) {
                let _q199 = true;
                Q200: {
                  const _a201 = sp.cellEdges[v_c];
                  for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                    const v_x = _a201[_i202];
                    if (!(((loopLock_f182[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg145.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q199 = false;
                      break Q200;
                    }
                  }
                }
                _c203 = _q199;
              }
              if (!(_c203)) continue;
              if (!(true)) continue;
              loopLock_l177 = _a181;
              _y178 = true;
              for (const _e180 of _a181) loopLock_p176[_e180] |= 1 << loopLock_f182[_e180];
            }
          }
          if (!(((((loopLock_p176[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y178 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g146.push(v_e);
        }
      }
      const v_W = _g146;
      _g204.length = 0;
      G205: {
        const _a232 = v_F;
        for (let _i233 = 0; _i233 < _a232.length; _i233++) {
          const v_e = _a232[_i233];
          if (_g237 !== _epoch) {
            _g237 = _epoch;
            for (const _e238 of loopLock_l235) loopLock_p234[_e238] = 0;
            _y236 = false;
            const _a239 = sp.cellEdges[v_c];
            for (const _e243 of loopLock_l241) loopLock_f240[_e243] = -1;
            loopLock_l241 = _a239;
            let _i245 = 0;
            _s242[0] = 0;
            let _o249 = _a239.length === 0;
            for (;;) {
              if (_a239.length === 0) {
                if (!_o249) break;
                _o249 = false;
              }
              while (_a239.length > 0 && _i245 >= 0) {
                const _e243 = _a239[_i245];
                if (_s242[_i245] > 0) loopLock_f240[_e243] = -1;
                let _r248 = (cands[_e243] >= 0 ? cands[_e243] : (cands[_e243] = b.cands[_e243])) & ~((2 << _s242[_i245]) - 1);
                let _d244 = 0;
                V247: for (; _r248 !== 0; _r248 &= _r248 - 1) {
                  _d244 = 31 - Math.clz32(_r248 & -_r248);
                  loopLock_f240[_e243] = _d244;
                  for (let _j246 = 0; _j246 < _i245; _j246++) {
                    const _y250 = _a239[_j246];
                    if (!(((((_k193[v_c] ?? arms(sp, cl, v_c)) === 2) && (loopLock_f240[_e243] === 1)) && (loopLock_f240[_y250] === 1)))) continue;
                    if (!((bent(sp, _e243, _y250) === (clueAt(cl.piece, v_c) === 3)))) continue V247;
                  }
                  for (let _j246 = 0; _j246 < _i245; _j246++) {
                    const _y251 = _a239[_j246];
                    if (!(((((loopLock_f240[_e243] === 1) && (loopLock_f240[_y251] === 1)) && !((b.grid[_e243] !== 0))) && !((b.grid[_y251] !== 0))))) continue;
                    if (!(!(_eg145.of((sp.edgeEnds[2 * _y251] === v_c ? sp.edgeEnds[2 * _y251 + 1] : sp.edgeEnds[2 * _y251])) === _eg145.of((sp.edgeEnds[2 * _e243] === v_c ? sp.edgeEnds[2 * _e243 + 1] : sp.edgeEnds[2 * _e243]))))) continue V247;
                  }
                  break;
                }
                if (_r248 === 0) {
                  _s242[_i245] = 0;
                  _i245--;
                  continue;
                }
                _s242[_i245] = _d244;
                if (_i245 === _a239.length - 1) break;
                _i245++;
                _s242[_i245] = 0;
              }
              if (_i245 < 0) break;
              let _g252 = 0;
              G253: {
                const _a254 = sp.cellEdges[v_c];
                for (let _i255 = 0; _i255 < _a254.length; _i255++) {
                  const v_x = _a254[_i255];
                  if (!((loopLock_f240[v_x] === 1))) continue;
                  _g252++;
                }
              }
              let _c260: boolean = (_g252 === (_k193[v_c] ?? arms(sp, cl, v_c)));
              if (_c260) {
                let _q256 = true;
                Q257: {
                  const _a258 = sp.cellEdges[v_c];
                  for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                    const v_x = _a258[_i259];
                    if (!(((loopLock_f240[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg145.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q256 = false;
                      break Q257;
                    }
                  }
                }
                _c260 = _q256;
              }
              if (!(_c260)) continue;
              if (!(true)) continue;
              loopLock_l235 = _a239;
              _y236 = true;
              for (const _e238 of _a239) loopLock_p234[_e238] |= 1 << loopLock_f240[_e238];
            }
          }
          if (!(((((loopLock_p234[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y236 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g204.push(v_e);
        }
      }
      L261: {
        const v_N = _g204;
        let _q262 = true;
        Q263: {
          const _a264 = v_F;
          for (let _i265 = 0; _i265 < _a264.length; _i265++) {
            const v_e = _a264[_i265];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q262 = false;
              break Q263;
            }
          }
        }
        if (!(_q262)) break L261;
        if (b.made[0] !== _m404_0 || b.made[1] !== _m405_1) {
          _g266.length = 0;
          G267: {
            const _a270 = sp.edges;
            for (let _i271 = 0; _i271 < _a270.length; _i271++) {
              const v_e = _a270[_i271];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g266.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g266))) { if (_visit !== null) _visit[v_c] = 1; return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g272: number[] = [];
          G273: {
            const _a276 = sp.edges;
            for (let _i277 = 0; _i277 < _a276.length; _i277++) {
              const v_e = _a276[_i277];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g272.push(v_e);
            }
          }
          const _g278: number[] = [];
          G279: {
            const _a282 = sp.cellEdges[v_c];
            for (let _i283 = 0; _i283 < _a282.length; _i283++) {
              const v_e = _a282[_i283];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g278.push(v_e);
            }
          }
          const _g284: number[] = [];
          G285: {
            const _a312 = v_F;
            for (let _i313 = 0; _i313 < _a312.length; _i313++) {
              const v_e = _a312[_i313];
              let _q314 = false;
              Q315: {
                const _f317 = new Int32Array(sp.edges.length).fill(-1);
                let _l318: readonly number[] = [];
                const _s319: number[] = [];
                const _a316 = sp.cellEdges[v_c];
                for (const _e320 of _l318) _f317[_e320] = -1;
                _l318 = _a316;
                let _i322 = 0;
                _s319[0] = 0;
                let _o326 = _a316.length === 0;
                for (;;) {
                  if (_a316.length === 0) {
                    if (!_o326) break;
                    _o326 = false;
                  }
                  while (_a316.length > 0 && _i322 >= 0) {
                    const _e320 = _a316[_i322];
                    if (_s319[_i322] > 0) _f317[_e320] = -1;
                    let _r325 = (cands[_e320] >= 0 ? cands[_e320] : (cands[_e320] = b.cands[_e320])) & ~((2 << _s319[_i322]) - 1);
                    let _d321 = 0;
                    V324: for (; _r325 !== 0; _r325 &= _r325 - 1) {
                      _d321 = 31 - Math.clz32(_r325 & -_r325);
                      _f317[_e320] = _d321;
                      if (_e320 === v_e && _d321 !== 1) continue;
                      for (let _j323 = 0; _j323 < _i322; _j323++) {
                        const _y327 = _a316[_j323];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f317[_e320] === 1)) && (_f317[_y327] === 1)))) continue;
                        if (!((bent(sp, _e320, _y327) === (clueAt(cl.piece, v_c) === 3)))) continue V324;
                      }
                      for (let _j323 = 0; _j323 < _i322; _j323++) {
                        const _y328 = _a316[_j323];
                        if (!(((((_f317[_e320] === 1) && (_f317[_y328] === 1)) && !((b.grid[_e320] !== 0))) && !((b.grid[_y328] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e320] === v_c ? sp.edgeEnds[2 * _e320 + 1] : sp.edgeEnds[2 * _e320]), v_L).includes((sp.edgeEnds[2 * _y328] === v_c ? sp.edgeEnds[2 * _y328 + 1] : sp.edgeEnds[2 * _y328]))))) continue V324;
                      }
                      break;
                    }
                    if (_r325 === 0) {
                      _s319[_i322] = 0;
                      _i322--;
                      continue;
                    }
                    _s319[_i322] = _d321;
                    if (_i322 === _a316.length - 1) break;
                    _i322++;
                    _s319[_i322] = 0;
                  }
                  if (_i322 < 0) break;
                  let _g329 = 0;
                  G330: {
                    const _a331 = sp.cellEdges[v_c];
                    for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                      const v_x = _a331[_i332];
                      if (!((_f317[v_x] === 1))) continue;
                      _g329++;
                    }
                  }
                  let _c337: boolean = (_g329 === arms(sp, cl, v_c));
                  if (_c337) {
                    let _q333 = true;
                    Q334: {
                      const _a335 = sp.cellEdges[v_c];
                      for (let _i336 = 0; _i336 < _a335.length; _i336++) {
                        const v_x = _a335[_i336];
                        if (!(((_f317[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg145.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q333 = false;
                          break Q334;
                        }
                      }
                    }
                    _c337 = _q333;
                  }
                  if (!(_c337)) continue;
                  if (true) {
                    _q314 = true;
                    break Q315;
                  }
                }
              }
              if (!(_q314)) continue;
              _g284.push(v_e);
            }
          }
          const _g338: number[] = [];
          G339: {
            const _a366 = v_F;
            for (let _i367 = 0; _i367 < _a366.length; _i367++) {
              const v_e = _a366[_i367];
              let _q368 = false;
              Q369: {
                const _f371 = new Int32Array(sp.edges.length).fill(-1);
                let _l372: readonly number[] = [];
                const _s373: number[] = [];
                const _a370 = sp.cellEdges[v_c];
                for (const _e374 of _l372) _f371[_e374] = -1;
                _l372 = _a370;
                let _i376 = 0;
                _s373[0] = 0;
                let _o380 = _a370.length === 0;
                for (;;) {
                  if (_a370.length === 0) {
                    if (!_o380) break;
                    _o380 = false;
                  }
                  while (_a370.length > 0 && _i376 >= 0) {
                    const _e374 = _a370[_i376];
                    if (_s373[_i376] > 0) _f371[_e374] = -1;
                    let _r379 = (cands[_e374] >= 0 ? cands[_e374] : (cands[_e374] = b.cands[_e374])) & ~((2 << _s373[_i376]) - 1);
                    let _d375 = 0;
                    V378: for (; _r379 !== 0; _r379 &= _r379 - 1) {
                      _d375 = 31 - Math.clz32(_r379 & -_r379);
                      _f371[_e374] = _d375;
                      if (_e374 === v_e && _d375 !== 2) continue;
                      for (let _j377 = 0; _j377 < _i376; _j377++) {
                        const _y381 = _a370[_j377];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f371[_e374] === 1)) && (_f371[_y381] === 1)))) continue;
                        if (!((bent(sp, _e374, _y381) === (clueAt(cl.piece, v_c) === 3)))) continue V378;
                      }
                      for (let _j377 = 0; _j377 < _i376; _j377++) {
                        const _y382 = _a370[_j377];
                        if (!(((((_f371[_e374] === 1) && (_f371[_y382] === 1)) && !((b.grid[_e374] !== 0))) && !((b.grid[_y382] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e374] === v_c ? sp.edgeEnds[2 * _e374 + 1] : sp.edgeEnds[2 * _e374]), v_L).includes((sp.edgeEnds[2 * _y382] === v_c ? sp.edgeEnds[2 * _y382 + 1] : sp.edgeEnds[2 * _y382]))))) continue V378;
                      }
                      break;
                    }
                    if (_r379 === 0) {
                      _s373[_i376] = 0;
                      _i376--;
                      continue;
                    }
                    _s373[_i376] = _d375;
                    if (_i376 === _a370.length - 1) break;
                    _i376++;
                    _s373[_i376] = 0;
                  }
                  if (_i376 < 0) break;
                  let _g383 = 0;
                  G384: {
                    const _a385 = sp.cellEdges[v_c];
                    for (let _i386 = 0; _i386 < _a385.length; _i386++) {
                      const v_x = _a385[_i386];
                      if (!((_f371[v_x] === 1))) continue;
                      _g383++;
                    }
                  }
                  let _c391: boolean = (_g383 === arms(sp, cl, v_c));
                  if (_c391) {
                    let _q387 = true;
                    Q388: {
                      const _a389 = sp.cellEdges[v_c];
                      for (let _i390 = 0; _i390 < _a389.length; _i390++) {
                        const v_x = _a389[_i390];
                        if (!(((_f371[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg145.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q387 = false;
                          break Q388;
                        }
                      }
                    }
                    _c391 = _q387;
                  }
                  if (!(_c391)) continue;
                  if (true) {
                    _q368 = true;
                    break Q369;
                  }
                }
              }
              if (!(_q368)) continue;
              _g338.push(v_e);
            }
          }
          let _q392 = true;
          Q393: {
            const _a394 = v_F;
            for (let _i395 = 0; _i395 < _a394.length; _i395++) {
              const v_e = _a394[_i395];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q392 = false;
                break Q393;
              }
            }
          }
          freshBinding("loopLock", [sameSet(v_L, _g272), (sp.cells.includes(v_c)), sameSet(v_F, _g278), (v_F.length > 0), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_W, _g284), sameSet(v_N, _g338), _q392], ["L =", "c in", "F =", "where of F", "G =", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q396 = true;
        Q397: {
          const _a398 = v_F;
          for (let _i399 = 0; _i399 < _a398.length; _i399++) {
            const v_e = _a398[_i399];
            let _c401: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c401) {
              let _c400: boolean = !(!(v_W.includes(v_e)));
              if (!_c400) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c400 = true;
              }
              _c401 = _c400;
            }
            let _c403: boolean = _c401;
            if (_c403) {
              let _c402: boolean = !(!(v_N.includes(v_e)));
              if (!_c402) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c402 = true;
              }
              _c403 = _c402;
            }
            if (!(_c403)) {
              _q396 = false;
              break Q397;
            }
          }
        }
        if (!(_q396)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), c: v_c, F: v_F.slice(), G: v_G.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface LoopNoteBinding {
  L: readonly number[];
  c: number;
  G: readonly number[];
  e: number;
  A: boolean;
  B: boolean;
}

const loopNoteFacts: number[] = [];
let loopNoteCands = new Int32Array(0);
let loopNote_p79 = new Int32Array(0);
let loopNote_l80: readonly number[] = [];
let loopNote_f85 = new Int32Array(0);
let loopNote_l86: readonly number[] = [];
let loopNote_p107 = new Int32Array(0);
let loopNote_l108: readonly number[] = [];
let loopNote_f113 = new Int32Array(0);
let loopNote_l114: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const loopNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds"],"kind":"group","set":0},{"steps":[],"kind":"group","set":0}],"relation":false,"sets":["L"]};

/** Its dearest read grows with the board as n. */
export function loopNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopNoteBinding> | null): number {
  const _g64: number[] = [];
  if (loopNote_p79.length < sp.edges.length) loopNote_p79 = new Int32Array(sp.edges.length);
  else loopNote_p79.fill(0);
  loopNote_l80 = [];
  let _y81 = false;
  if (loopNote_f85.length < sp.edges.length) loopNote_f85 = new Int32Array(sp.edges.length).fill(-1);
  else loopNote_f85.fill(-1);
  loopNote_l86 = [];
  const _s87: number[] = [];
  if (loopNote_p107.length < sp.edges.length) loopNote_p107 = new Int32Array(sp.edges.length);
  else loopNote_p107.fill(0);
  loopNote_l108 = [];
  let _y109 = false;
  if (loopNote_f113.length < sp.edges.length) loopNote_f113 = new Int32Array(sp.edges.length).fill(-1);
  else loopNote_f113.fill(-1);
  loopNote_l114 = [];
  const _s115: number[] = [];
  const _g135: number[] = [];
  const facts = loopNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k96 = armsKept.board(cl);
  if (loopNoteCands.length < sp.edges.length) loopNoteCands = new Int32Array(sp.edges.length);
  const cands = loopNoteCands;
  cands.fill(-1);
  const _m199_0 = b.made[0];
  _g64.length = 0;
  G65: {
    const _a68 = sp.edges;
    for (let _i69 = 0; _i69 < _a68.length; _i69++) {
      const v_e = _a68[_i69];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g64.push(v_e);
    }
  }
  const v_L = _g64;
  const _m200_1 = b.made[1];
  const _eg76 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _visit = fire === null ? (b.visit?.(loopNoteFootprint, [_eg76]) ?? null) : null;
  const _a70 = sp.cells;
  for (let _i71 = 0; _i71 < _a70.length; _i71++) {
    const v_c = _a70[_i71];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _q72 = false;
    Q73: {
      const _a74 = sp.cellEdges[v_c];
      for (let _i75 = 0; _i75 < _a74.length; _i75++) {
        const v_e = _a74[_i75];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q72 = true;
          break Q73;
        }
      }
    }
    if (!(_q72)) continue;
    const v_G = _eg76.of(v_c);
    let _g82 = -1;
    let _g110 = -1;
    const _a77 = sp.cellEdges[v_c];
    for (let _i78 = 0; _i78 < _a77.length; _i78++) {
      const v_e = _a77[_i78];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g82 !== _epoch) {
        _g82 = _epoch;
        for (const _e83 of loopNote_l80) loopNote_p79[_e83] = 0;
        _y81 = false;
        const _a84 = sp.cellEdges[v_c];
        for (const _e88 of loopNote_l86) loopNote_f85[_e88] = -1;
        loopNote_l86 = _a84;
        let _i90 = 0;
        _s87[0] = 0;
        let _o94 = _a84.length === 0;
        for (;;) {
          if (_a84.length === 0) {
            if (!_o94) break;
            _o94 = false;
          }
          while (_a84.length > 0 && _i90 >= 0) {
            const _e88 = _a84[_i90];
            if (_s87[_i90] > 0) loopNote_f85[_e88] = -1;
            let _r93 = (cands[_e88] >= 0 ? cands[_e88] : (cands[_e88] = b.cands[_e88])) & ~((2 << _s87[_i90]) - 1);
            let _d89 = 0;
            V92: for (; _r93 !== 0; _r93 &= _r93 - 1) {
              _d89 = 31 - Math.clz32(_r93 & -_r93);
              loopNote_f85[_e88] = _d89;
              for (let _j91 = 0; _j91 < _i90; _j91++) {
                const _y95 = _a84[_j91];
                if (!(((((_k96[v_c] ?? arms(sp, cl, v_c)) === 2) && (loopNote_f85[_e88] === 1)) && (loopNote_f85[_y95] === 1)))) continue;
                if (!((bent(sp, _e88, _y95) === (clueAt(cl.piece, v_c) === 3)))) continue V92;
              }
              for (let _j91 = 0; _j91 < _i90; _j91++) {
                const _y97 = _a84[_j91];
                if (!(((((loopNote_f85[_e88] === 1) && (loopNote_f85[_y97] === 1)) && !((b.grid[_e88] !== 0))) && !((b.grid[_y97] !== 0))))) continue;
                if (!(!(_eg76.of((sp.edgeEnds[2 * _y97] === v_c ? sp.edgeEnds[2 * _y97 + 1] : sp.edgeEnds[2 * _y97])) === _eg76.of((sp.edgeEnds[2 * _e88] === v_c ? sp.edgeEnds[2 * _e88 + 1] : sp.edgeEnds[2 * _e88]))))) continue V92;
              }
              break;
            }
            if (_r93 === 0) {
              _s87[_i90] = 0;
              _i90--;
              continue;
            }
            _s87[_i90] = _d89;
            if (_i90 === _a84.length - 1) break;
            _i90++;
            _s87[_i90] = 0;
          }
          if (_i90 < 0) break;
          let _g98 = 0;
          G99: {
            const _a100 = sp.cellEdges[v_c];
            for (let _i101 = 0; _i101 < _a100.length; _i101++) {
              const v_x = _a100[_i101];
              if (!((loopNote_f85[v_x] === 1))) continue;
              _g98++;
            }
          }
          let _c106: boolean = (_g98 === (_k96[v_c] ?? arms(sp, cl, v_c)));
          if (_c106) {
            let _q102 = true;
            Q103: {
              const _a104 = sp.cellEdges[v_c];
              for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                const v_x = _a104[_i105];
                if (!(((loopNote_f85[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg76.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q102 = false;
                  break Q103;
                }
              }
            }
            _c106 = _q102;
          }
          if (!(_c106)) continue;
          if (!(true)) continue;
          loopNote_l80 = _a84;
          _y81 = true;
          for (const _e83 of _a84) loopNote_p79[_e83] |= 1 << loopNote_f85[_e83];
        }
      }
      const v_A = ((((loopNote_p79[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y81 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g110 !== _epoch) {
        _g110 = _epoch;
        for (const _e111 of loopNote_l108) loopNote_p107[_e111] = 0;
        _y109 = false;
        const _a112 = sp.cellEdges[v_c];
        for (const _e116 of loopNote_l114) loopNote_f113[_e116] = -1;
        loopNote_l114 = _a112;
        let _i118 = 0;
        _s115[0] = 0;
        let _o122 = _a112.length === 0;
        for (;;) {
          if (_a112.length === 0) {
            if (!_o122) break;
            _o122 = false;
          }
          while (_a112.length > 0 && _i118 >= 0) {
            const _e116 = _a112[_i118];
            if (_s115[_i118] > 0) loopNote_f113[_e116] = -1;
            let _r121 = (cands[_e116] >= 0 ? cands[_e116] : (cands[_e116] = b.cands[_e116])) & ~((2 << _s115[_i118]) - 1);
            let _d117 = 0;
            V120: for (; _r121 !== 0; _r121 &= _r121 - 1) {
              _d117 = 31 - Math.clz32(_r121 & -_r121);
              loopNote_f113[_e116] = _d117;
              for (let _j119 = 0; _j119 < _i118; _j119++) {
                const _y123 = _a112[_j119];
                if (!(((((_k96[v_c] ?? arms(sp, cl, v_c)) === 2) && (loopNote_f113[_e116] === 1)) && (loopNote_f113[_y123] === 1)))) continue;
                if (!((bent(sp, _e116, _y123) === (clueAt(cl.piece, v_c) === 3)))) continue V120;
              }
              for (let _j119 = 0; _j119 < _i118; _j119++) {
                const _y124 = _a112[_j119];
                if (!(((((loopNote_f113[_e116] === 1) && (loopNote_f113[_y124] === 1)) && !((b.grid[_e116] !== 0))) && !((b.grid[_y124] !== 0))))) continue;
                if (!(!(_eg76.of((sp.edgeEnds[2 * _y124] === v_c ? sp.edgeEnds[2 * _y124 + 1] : sp.edgeEnds[2 * _y124])) === _eg76.of((sp.edgeEnds[2 * _e116] === v_c ? sp.edgeEnds[2 * _e116 + 1] : sp.edgeEnds[2 * _e116]))))) continue V120;
              }
              break;
            }
            if (_r121 === 0) {
              _s115[_i118] = 0;
              _i118--;
              continue;
            }
            _s115[_i118] = _d117;
            if (_i118 === _a112.length - 1) break;
            _i118++;
            _s115[_i118] = 0;
          }
          if (_i118 < 0) break;
          let _g125 = 0;
          G126: {
            const _a127 = sp.cellEdges[v_c];
            for (let _i128 = 0; _i128 < _a127.length; _i128++) {
              const v_x = _a127[_i128];
              if (!((loopNote_f113[v_x] === 1))) continue;
              _g125++;
            }
          }
          let _c133: boolean = (_g125 === (_k96[v_c] ?? arms(sp, cl, v_c)));
          if (_c133) {
            let _q129 = true;
            Q130: {
              const _a131 = sp.cellEdges[v_c];
              for (let _i132 = 0; _i132 < _a131.length; _i132++) {
                const v_x = _a131[_i132];
                if (!(((loopNote_f113[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg76.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q129 = false;
                  break Q130;
                }
              }
            }
            _c133 = _q129;
          }
          if (!(_c133)) continue;
          if (!(true)) continue;
          loopNote_l108 = _a112;
          _y109 = true;
          for (const _e111 of _a112) loopNote_p107[_e111] |= 1 << loopNote_f113[_e111];
        }
      }
      L134: {
        const v_B = ((((loopNote_p107[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y109 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L134;
        if (b.made[0] !== _m199_0 || b.made[1] !== _m200_1) {
          _g135.length = 0;
          G136: {
            const _a139 = sp.edges;
            for (let _i140 = 0; _i140 < _a139.length; _i140++) {
              const v_e = _a139[_i140];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g135.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g135))) { if (_visit !== null) _visit[v_c] = 1; return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g141: number[] = [];
          G142: {
            const _a145 = sp.edges;
            for (let _i146 = 0; _i146 < _a145.length; _i146++) {
              const v_e = _a145[_i146];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g141.push(v_e);
            }
          }
          let _q147 = false;
          Q148: {
            const _f150 = new Int32Array(sp.edges.length).fill(-1);
            let _l151: readonly number[] = [];
            const _s152: number[] = [];
            const _a149 = sp.cellEdges[v_c];
            for (const _e153 of _l151) _f150[_e153] = -1;
            _l151 = _a149;
            let _i155 = 0;
            _s152[0] = 0;
            let _o159 = _a149.length === 0;
            for (;;) {
              if (_a149.length === 0) {
                if (!_o159) break;
                _o159 = false;
              }
              while (_a149.length > 0 && _i155 >= 0) {
                const _e153 = _a149[_i155];
                if (_s152[_i155] > 0) _f150[_e153] = -1;
                let _r158 = (cands[_e153] >= 0 ? cands[_e153] : (cands[_e153] = b.cands[_e153])) & ~((2 << _s152[_i155]) - 1);
                let _d154 = 0;
                V157: for (; _r158 !== 0; _r158 &= _r158 - 1) {
                  _d154 = 31 - Math.clz32(_r158 & -_r158);
                  _f150[_e153] = _d154;
                  if (_e153 === v_e && _d154 !== 1) continue;
                  for (let _j156 = 0; _j156 < _i155; _j156++) {
                    const _y160 = _a149[_j156];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f150[_e153] === 1)) && (_f150[_y160] === 1)))) continue;
                    if (!((bent(sp, _e153, _y160) === (clueAt(cl.piece, v_c) === 3)))) continue V157;
                  }
                  for (let _j156 = 0; _j156 < _i155; _j156++) {
                    const _y161 = _a149[_j156];
                    if (!(((((_f150[_e153] === 1) && (_f150[_y161] === 1)) && !((b.grid[_e153] !== 0))) && !((b.grid[_y161] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e153] === v_c ? sp.edgeEnds[2 * _e153 + 1] : sp.edgeEnds[2 * _e153]), v_L).includes((sp.edgeEnds[2 * _y161] === v_c ? sp.edgeEnds[2 * _y161 + 1] : sp.edgeEnds[2 * _y161]))))) continue V157;
                  }
                  break;
                }
                if (_r158 === 0) {
                  _s152[_i155] = 0;
                  _i155--;
                  continue;
                }
                _s152[_i155] = _d154;
                if (_i155 === _a149.length - 1) break;
                _i155++;
                _s152[_i155] = 0;
              }
              if (_i155 < 0) break;
              let _g162 = 0;
              G163: {
                const _a164 = sp.cellEdges[v_c];
                for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                  const v_x = _a164[_i165];
                  if (!((_f150[v_x] === 1))) continue;
                  _g162++;
                }
              }
              let _c170: boolean = (_g162 === arms(sp, cl, v_c));
              if (_c170) {
                let _q166 = true;
                Q167: {
                  const _a168 = sp.cellEdges[v_c];
                  for (let _i169 = 0; _i169 < _a168.length; _i169++) {
                    const v_x = _a168[_i169];
                    if (!(((_f150[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg76.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q166 = false;
                      break Q167;
                    }
                  }
                }
                _c170 = _q166;
              }
              if (!(_c170)) continue;
              if (true) {
                _q147 = true;
                break Q148;
              }
            }
          }
          let _q171 = false;
          Q172: {
            const _f174 = new Int32Array(sp.edges.length).fill(-1);
            let _l175: readonly number[] = [];
            const _s176: number[] = [];
            const _a173 = sp.cellEdges[v_c];
            for (const _e177 of _l175) _f174[_e177] = -1;
            _l175 = _a173;
            let _i179 = 0;
            _s176[0] = 0;
            let _o183 = _a173.length === 0;
            for (;;) {
              if (_a173.length === 0) {
                if (!_o183) break;
                _o183 = false;
              }
              while (_a173.length > 0 && _i179 >= 0) {
                const _e177 = _a173[_i179];
                if (_s176[_i179] > 0) _f174[_e177] = -1;
                let _r182 = (cands[_e177] >= 0 ? cands[_e177] : (cands[_e177] = b.cands[_e177])) & ~((2 << _s176[_i179]) - 1);
                let _d178 = 0;
                V181: for (; _r182 !== 0; _r182 &= _r182 - 1) {
                  _d178 = 31 - Math.clz32(_r182 & -_r182);
                  _f174[_e177] = _d178;
                  if (_e177 === v_e && _d178 !== 2) continue;
                  for (let _j180 = 0; _j180 < _i179; _j180++) {
                    const _y184 = _a173[_j180];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f174[_e177] === 1)) && (_f174[_y184] === 1)))) continue;
                    if (!((bent(sp, _e177, _y184) === (clueAt(cl.piece, v_c) === 3)))) continue V181;
                  }
                  for (let _j180 = 0; _j180 < _i179; _j180++) {
                    const _y185 = _a173[_j180];
                    if (!(((((_f174[_e177] === 1) && (_f174[_y185] === 1)) && !((b.grid[_e177] !== 0))) && !((b.grid[_y185] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e177] === v_c ? sp.edgeEnds[2 * _e177 + 1] : sp.edgeEnds[2 * _e177]), v_L).includes((sp.edgeEnds[2 * _y185] === v_c ? sp.edgeEnds[2 * _y185 + 1] : sp.edgeEnds[2 * _y185]))))) continue V181;
                  }
                  break;
                }
                if (_r182 === 0) {
                  _s176[_i179] = 0;
                  _i179--;
                  continue;
                }
                _s176[_i179] = _d178;
                if (_i179 === _a173.length - 1) break;
                _i179++;
                _s176[_i179] = 0;
              }
              if (_i179 < 0) break;
              let _g186 = 0;
              G187: {
                const _a188 = sp.cellEdges[v_c];
                for (let _i189 = 0; _i189 < _a188.length; _i189++) {
                  const v_x = _a188[_i189];
                  if (!((_f174[v_x] === 1))) continue;
                  _g186++;
                }
              }
              let _c194: boolean = (_g186 === arms(sp, cl, v_c));
              if (_c194) {
                let _q190 = true;
                Q191: {
                  const _a192 = sp.cellEdges[v_c];
                  for (let _i193 = 0; _i193 < _a192.length; _i193++) {
                    const v_x = _a192[_i193];
                    if (!(((_f174[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg76.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q190 = false;
                      break Q191;
                    }
                  }
                }
                _c194 = _q190;
              }
              if (!(_c194)) continue;
              if (true) {
                _q171 = true;
                break Q172;
              }
            }
          }
          freshBinding("loopNote", [sameSet(v_L, _g141), (sp.cells.includes(v_c)), sameSet(v_G, through(sp, v_c, v_L)), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q147), (v_B === _q171), (!(v_A) || !(v_B))], ["L =", "c in", "G =", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c196: boolean = (v_A || v_B);
        if (_c196) {
          let _c195: boolean = !(!(v_A));
          if (!_c195) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c195 = true;
          }
          _c196 = _c195;
        }
        let _c198: boolean = _c196;
        if (_c198) {
          let _c197: boolean = !(!(v_B));
          if (!_c197) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c197 = true;
          }
          _c198 = _c197;
        }
        if (!(_c198)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), c: v_c, G: v_G.slice(), e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface SealLockBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  F: readonly number[];
  G: readonly number[];
  K: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const sealLockFacts: number[] = [];
let sealLockCands = new Int32Array(0);
let sealLock_f1114 = new Int32Array(0);
let sealLock_l1115: readonly number[] = [];
let sealLock_f1134 = new Int32Array(0);
let sealLock_l1135: readonly number[] = [];
const sealLock_st1290 = stamps();
let sealLock_f1296 = new Int32Array(0);
let sealLock_l1297: readonly number[] = [];
const sealLock_st1327 = stamps();
let sealLock_p1539 = new Int32Array(0);
let sealLock_l1540: readonly number[] = [];
let sealLock_f1545 = new Int32Array(0);
let sealLock_l1546: readonly number[] = [];
const sealLock_st1653 = stamps();
const sealLock_st1696 = stamps();
let sealLock_f1702 = new Int32Array(0);
let sealLock_l1703: readonly number[] = [];
const sealLock_st1732 = stamps();
let sealLock_p1947 = new Int32Array(0);
let sealLock_l1948: readonly number[] = [];
let sealLock_f1953 = new Int32Array(0);
let sealLock_l1954: readonly number[] = [];
const sealLock_st2061 = stamps();
const sealLock_st2104 = stamps();
let sealLock_f2110 = new Int32Array(0);
let sealLock_l2111: readonly number[] = [];
const sealLock_st2140 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealLockBinding> | null): number {
  const _g1059: number[] = [];
  const _g1065: number[] = [];
  if (sealLock_f1114.length < sp.edges.length) sealLock_f1114 = new Int32Array(sp.edges.length).fill(-1);
  else sealLock_f1114.fill(-1);
  sealLock_l1115 = [];
  const _s1116: number[] = [];
  if (sealLock_f1134.length < sp.edges.length) sealLock_f1134 = new Int32Array(sp.edges.length).fill(-1);
  else sealLock_f1134.fill(-1);
  sealLock_l1135 = [];
  const _s1136: number[] = [];
  const _g1150: number[] = [];
  const _g1158: number[] = [];
  const _g1167: number[] = [];
  const _g1251: number[] = [];
  if (sealLock_f1296.length < sp.edges.length) sealLock_f1296 = new Int32Array(sp.edges.length).fill(-1);
  else sealLock_f1296.fill(-1);
  sealLock_l1297 = [];
  const _s1298: number[] = [];
  const _g1320: number[] = [];
  const _g1339: number[] = [];
  if (sealLock_p1539.length < sp.edges.length) sealLock_p1539 = new Int32Array(sp.edges.length);
  else sealLock_p1539.fill(0);
  sealLock_l1540 = [];
  let _y1541 = false;
  if (sealLock_f1545.length < sp.edges.length) sealLock_f1545 = new Int32Array(sp.edges.length).fill(-1);
  else sealLock_f1545.fill(-1);
  sealLock_l1546 = [];
  const _s1547: number[] = [];
  const _g1570: number[] = [];
  const _g1657: number[] = [];
  if (sealLock_f1702.length < sp.edges.length) sealLock_f1702 = new Int32Array(sp.edges.length).fill(-1);
  else sealLock_f1702.fill(-1);
  sealLock_l1703 = [];
  const _s1704: number[] = [];
  const _g1725: number[] = [];
  const _g1747: number[] = [];
  if (sealLock_p1947.length < sp.edges.length) sealLock_p1947 = new Int32Array(sp.edges.length);
  else sealLock_p1947.fill(0);
  sealLock_l1948 = [];
  let _y1949 = false;
  if (sealLock_f1953.length < sp.edges.length) sealLock_f1953 = new Int32Array(sp.edges.length).fill(-1);
  else sealLock_f1953.fill(-1);
  sealLock_l1954 = [];
  const _s1955: number[] = [];
  const _g1978: number[] = [];
  const _g2065: number[] = [];
  if (sealLock_f2110.length < sp.edges.length) sealLock_f2110 = new Int32Array(sp.edges.length).fill(-1);
  else sealLock_f2110.fill(-1);
  sealLock_l2111 = [];
  const _s2112: number[] = [];
  const _g2133: number[] = [];
  const _g2160: number[] = [];
  const facts = sealLockFacts;
  let fired = 0;
  let changed = false;
  const _k1125 = armsKept.board(cl);
  const _h1338 = sp.cells.length;
  let _epoch = 0;
  if (sealLockCands.length < sp.edges.length) sealLockCands = new Int32Array(sp.edges.length);
  const cands = sealLockCands;
  cands.fill(-1);
  const _m3228_0 = b.made[0];
  _g1059.length = 0;
  G1060: {
    const _a1063 = sp.edges;
    for (let _i1064 = 0; _i1064 < _a1063.length; _i1064++) {
      const v_e = _a1063[_i1064];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1059.push(v_e);
    }
  }
  const v_L = _g1059;
  const _m3229_1 = b.made[1];
  const _eg1166 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1065.length = 0;
  G1066: {
    const _a1108 = sp.edges;
    for (let _i1109 = 0; _i1109 < _a1108.length; _i1109++) {
      const v_e = _a1108[_i1109];
      const _t1110 = sp.edgeEnds[2 * v_e];
      let _q1111 = false;
      Q1112: {
        const _a1113 = sp.cellEdges[_t1110];
        for (const _e1117 of sealLock_l1115) sealLock_f1114[_e1117] = -1;
        sealLock_l1115 = _a1113;
        let _i1119 = 0;
        _s1116[0] = 0;
        let _o1123 = _a1113.length === 0;
        for (;;) {
          if (_a1113.length === 0) {
            if (!_o1123) break;
            _o1123 = false;
          }
          while (_a1113.length > 0 && _i1119 >= 0) {
            const _e1117 = _a1113[_i1119];
            if (_s1116[_i1119] > 0) sealLock_f1114[_e1117] = -1;
            let _r1122 = (cands[_e1117] >= 0 ? cands[_e1117] : (cands[_e1117] = b.cands[_e1117])) & ~((2 << _s1116[_i1119]) - 1);
            let _d1118 = 0;
            V1121: for (; _r1122 !== 0; _r1122 &= _r1122 - 1) {
              _d1118 = 31 - Math.clz32(_r1122 & -_r1122);
              sealLock_f1114[_e1117] = _d1118;
              if (_e1117 === v_e && _d1118 !== 1) continue;
              for (let _j1120 = 0; _j1120 < _i1119; _j1120++) {
                const _y1124 = _a1113[_j1120];
                if (!(((((_k1125[_t1110] ?? arms(sp, cl, _t1110)) === 2) && (sealLock_f1114[_e1117] === 1)) && (sealLock_f1114[_y1124] === 1)))) continue;
                if (!((bent(sp, _e1117, _y1124) === (clueAt(cl.piece, _t1110) === 3)))) continue V1121;
              }
              break;
            }
            if (_r1122 === 0) {
              _s1116[_i1119] = 0;
              _i1119--;
              continue;
            }
            _s1116[_i1119] = _d1118;
            if (_i1119 === _a1113.length - 1) break;
            _i1119++;
            _s1116[_i1119] = 0;
          }
          if (_i1119 < 0) break;
          let _g1126 = 0;
          G1127: {
            const _a1128 = sp.cellEdges[_t1110];
            for (let _i1129 = 0; _i1129 < _a1128.length; _i1129++) {
              const v_x = _a1128[_i1129];
              if (!((sealLock_f1114[v_x] === 1))) continue;
              _g1126++;
            }
          }
          if (!((_g1126 === (_k1125[_t1110] ?? arms(sp, cl, _t1110))))) continue;
          if (true) {
            _q1111 = true;
            break Q1112;
          }
        }
      }
      let _c1149: boolean = _q1111;
      if (_c1149) {
        const _t1130 = sp.edgeEnds[2 * v_e + 1];
        let _q1131 = false;
        Q1132: {
          const _a1133 = sp.cellEdges[_t1130];
          for (const _e1137 of sealLock_l1135) sealLock_f1134[_e1137] = -1;
          sealLock_l1135 = _a1133;
          let _i1139 = 0;
          _s1136[0] = 0;
          let _o1143 = _a1133.length === 0;
          for (;;) {
            if (_a1133.length === 0) {
              if (!_o1143) break;
              _o1143 = false;
            }
            while (_a1133.length > 0 && _i1139 >= 0) {
              const _e1137 = _a1133[_i1139];
              if (_s1136[_i1139] > 0) sealLock_f1134[_e1137] = -1;
              let _r1142 = (cands[_e1137] >= 0 ? cands[_e1137] : (cands[_e1137] = b.cands[_e1137])) & ~((2 << _s1136[_i1139]) - 1);
              let _d1138 = 0;
              V1141: for (; _r1142 !== 0; _r1142 &= _r1142 - 1) {
                _d1138 = 31 - Math.clz32(_r1142 & -_r1142);
                sealLock_f1134[_e1137] = _d1138;
                if (_e1137 === v_e && _d1138 !== 1) continue;
                for (let _j1140 = 0; _j1140 < _i1139; _j1140++) {
                  const _y1144 = _a1133[_j1140];
                  if (!(((((_k1125[_t1130] ?? arms(sp, cl, _t1130)) === 2) && (sealLock_f1134[_e1137] === 1)) && (sealLock_f1134[_y1144] === 1)))) continue;
                  if (!((bent(sp, _e1137, _y1144) === (clueAt(cl.piece, _t1130) === 3)))) continue V1141;
                }
                break;
              }
              if (_r1142 === 0) {
                _s1136[_i1139] = 0;
                _i1139--;
                continue;
              }
              _s1136[_i1139] = _d1138;
              if (_i1139 === _a1133.length - 1) break;
              _i1139++;
              _s1136[_i1139] = 0;
            }
            if (_i1139 < 0) break;
            let _g1145 = 0;
            G1146: {
              const _a1147 = sp.cellEdges[_t1130];
              for (let _i1148 = 0; _i1148 < _a1147.length; _i1148++) {
                const v_x = _a1147[_i1148];
                if (!((sealLock_f1134[v_x] === 1))) continue;
                _g1145++;
              }
            }
            if (!((_g1145 === (_k1125[_t1130] ?? arms(sp, cl, _t1130))))) continue;
            if (true) {
              _q1131 = true;
              break Q1132;
            }
          }
        }
        _c1149 = _q1131;
      }
      if (!(_c1149)) continue;
      _g1065.push(v_e);
    }
  }
  const v_U = _g1065;
  const _mm1333 = memberMarks(v_U);
  _g1150.length = 0;
  G1151: {
    const _a1154 = v_U;
    for (let _i1155 = 0; _i1155 < _a1154.length; _i1155++) {
      const v_e = _a1154[_i1155];
      if (!((((_k1125[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k1125[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g1150.push(v_e);
    }
  }
  const v_P = _g1150;
  const _a1156 = sp.cells;
  for (let _i1157 = 0; _i1157 < _a1156.length; _i1157++) {
    const v_c = _a1156[_i1157];
    const _h1312 = minus(v_P, sp.cellEdges[v_c]);
    _g1158.length = 0;
    G1159: {
      const _a1162 = sp.cellEdges[v_c];
      for (let _i1163 = 0; _i1163 < _a1162.length; _i1163++) {
        const v_e = _a1162[_i1163];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1158.push(v_e);
      }
    }
    L1164: {
      const v_F = _g1158;
      const _h1165 = v_F.length;
      if (!((_h1165 > 0))) break L1164;
      const v_G = _eg1166.of(v_c);
      _g1167.length = 0;
      G1168: {
        const _a1248 = sp.cellEdges[v_c];
        for (let _i1249 = 0; _i1249 < _a1248.length; _i1249++) {
          const v_x = _a1248[_i1249];
          const _t1250 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h1313 = minus(_h1312, sp.cellEdges[_t1250]);
          const _eg1315 = edgeGroups(sp, _h1313);
          const _memo1318 = new Map<readonly number[], readonly number[]>();
          _g1251.length = 0;
          sealLock_st1290.pass++;
          G1252: {
            const _a1291 = sp.cellEdges[_t1250];
            for (let _i1292 = 0; _i1292 < _a1291.length; _i1292++) {
              const v_y = _a1291[_i1292];
              let _c1311: boolean = (v_y !== v_x);
              if (_c1311) {
                let _q1293 = false;
                Q1294: {
                  const _a1295 = sp.cellEdges[_t1250];
                  for (const _e1299 of sealLock_l1297) sealLock_f1296[_e1299] = -1;
                  sealLock_l1297 = _a1295;
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
                      if (_s1298[_i1301] > 0) sealLock_f1296[_e1299] = -1;
                      let _r1304 = (cands[_e1299] >= 0 ? cands[_e1299] : (cands[_e1299] = b.cands[_e1299])) & ~((2 << _s1298[_i1301]) - 1);
                      let _d1300 = 0;
                      V1303: for (; _r1304 !== 0; _r1304 &= _r1304 - 1) {
                        _d1300 = 31 - Math.clz32(_r1304 & -_r1304);
                        sealLock_f1296[_e1299] = _d1300;
                        if (_e1299 === v_x && _d1300 !== 1) continue;
                        if (_e1299 === v_y && _d1300 !== 1) continue;
                        for (let _j1302 = 0; _j1302 < _i1301; _j1302++) {
                          const _y1306 = _a1295[_j1302];
                          if (!(((((_k1125[_t1250] ?? arms(sp, cl, _t1250)) === 2) && (sealLock_f1296[_e1299] === 1)) && (sealLock_f1296[_y1306] === 1)))) continue;
                          if (!((bent(sp, _e1299, _y1306) === (clueAt(cl.piece, _t1250) === 3)))) continue V1303;
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
                      const _a1309 = sp.cellEdges[_t1250];
                      for (let _i1310 = 0; _i1310 < _a1309.length; _i1310++) {
                        const v_z = _a1309[_i1310];
                        if (!((sealLock_f1296[v_z] === 1))) continue;
                        _g1307++;
                      }
                    }
                    if (!((_g1307 === (_k1125[_t1250] ?? arms(sp, cl, _t1250))))) continue;
                    if (true) {
                      _q1293 = true;
                      break Q1294;
                    }
                  }
                }
                _c1311 = _q1293;
              }
              if (!(_c1311)) continue;
              const _t1314 = (sp.edgeEnds[2 * v_y] === _t1250 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t1317 = _eg1315.of(_t1314);
              let _gs1319 = _memo1318.get(_t1317);
              if (_gs1319 === undefined) {
                _g1320.length = 0;
                sealLock_st1327.pass++;
                G1321: {
                  const _a1328 = _t1317;
                  for (let _i1329 = 0; _i1329 < _a1328.length; _i1329++) {
                    const v_t = _a1328[_i1329];
                    if (!(((_k1125[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a1330 = sp.cellEdges[v_t];
                    for (let _i1331 = 0; _i1331 < _a1330.length; _i1331++) {
                      const v_y = _a1330[_i1331];
                      L1332: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k1125[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1333[v_y + 1] === 1)))) break L1332;
                        const _t1334 = v_z;
                        if (_g1320.length < 16) { if (!_g1320.includes(_t1334)) _g1320.push(_t1334); } else addOnce(_g1320, sealLock_st1327, _t1334);
                      }
                    }
                  }
                }
                _gs1319 = _g1320.slice();
                _memo1318.set(_t1317, _gs1319);
              }
              const _a1335 = union(_eg1315.of(_t1314), _gs1319);
              for (let _i1336 = 0; _i1336 < _a1335.length; _i1336++) {
                const v_t = _a1335[_i1336];
                const _t1337 = v_t;
                if (_g1251.length < 16) { if (!_g1251.includes(_t1337)) _g1251.push(_t1337); } else addOnce(_g1251, sealLock_st1290, _t1337);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t1250), _g1251)).length >= _h1338))) continue;
          _g1167.push(v_x);
        }
      }
      const v_K = _g1167;
      let _g1542 = -1;
      let _g1950 = -1;
      _g1339.length = 0;
      G1340: {
        const _a1537 = v_F;
        for (let _i1538 = 0; _i1538 < _a1537.length; _i1538++) {
          const v_e = _a1537[_i1538];
          if (_g1542 !== _epoch) {
            _g1542 = _epoch;
            for (const _e1543 of sealLock_l1540) sealLock_p1539[_e1543] = 0;
            _y1541 = false;
            const _a1544 = sp.cellEdges[v_c];
            for (const _e1548 of sealLock_l1546) sealLock_f1545[_e1548] = -1;
            sealLock_l1546 = _a1544;
            let _i1550 = 0;
            _s1547[0] = 0;
            let _o1554 = _a1544.length === 0;
            for (;;) {
              if (_a1544.length === 0) {
                if (!_o1554) break;
                _o1554 = false;
              }
              while (_a1544.length > 0 && _i1550 >= 0) {
                const _e1548 = _a1544[_i1550];
                if (_s1547[_i1550] > 0) sealLock_f1545[_e1548] = -1;
                let _r1553 = (cands[_e1548] >= 0 ? cands[_e1548] : (cands[_e1548] = b.cands[_e1548])) & ~((2 << _s1547[_i1550]) - 1);
                let _d1549 = 0;
                V1552: for (; _r1553 !== 0; _r1553 &= _r1553 - 1) {
                  _d1549 = 31 - Math.clz32(_r1553 & -_r1553);
                  sealLock_f1545[_e1548] = _d1549;
                  for (let _j1551 = 0; _j1551 < _i1550; _j1551++) {
                    const _y1555 = _a1544[_j1551];
                    if (!(((((_k1125[v_c] ?? arms(sp, cl, v_c)) === 2) && (sealLock_f1545[_e1548] === 1)) && (sealLock_f1545[_y1555] === 1)))) continue;
                    if (!((bent(sp, _e1548, _y1555) === (clueAt(cl.piece, v_c) === 3)))) continue V1552;
                  }
                  for (let _j1551 = 0; _j1551 < _i1550; _j1551++) {
                    const _y1556 = _a1544[_j1551];
                    if (!(((((sealLock_f1545[_e1548] === 1) && (sealLock_f1545[_y1556] === 1)) && !((b.grid[_e1548] !== 0))) && !((b.grid[_y1556] !== 0))))) continue;
                    if (!(!(_eg1166.of((sp.edgeEnds[2 * _y1556] === v_c ? sp.edgeEnds[2 * _y1556 + 1] : sp.edgeEnds[2 * _y1556])) === _eg1166.of((sp.edgeEnds[2 * _e1548] === v_c ? sp.edgeEnds[2 * _e1548 + 1] : sp.edgeEnds[2 * _e1548]))))) continue V1552;
                  }
                  break;
                }
                if (_r1553 === 0) {
                  _s1547[_i1550] = 0;
                  _i1550--;
                  continue;
                }
                _s1547[_i1550] = _d1549;
                if (_i1550 === _a1544.length - 1) break;
                _i1550++;
                _s1547[_i1550] = 0;
              }
              if (_i1550 < 0) break;
              let _g1557 = 0;
              G1558: {
                const _a1559 = sp.cellEdges[v_c];
                for (let _i1560 = 0; _i1560 < _a1559.length; _i1560++) {
                  const v_x = _a1559[_i1560];
                  if (!((sealLock_f1545[v_x] === 1))) continue;
                  _g1557++;
                }
              }
              let _c1565: boolean = (_g1557 === (_k1125[v_c] ?? arms(sp, cl, v_c)));
              if (_c1565) {
                let _q1561 = true;
                Q1562: {
                  const _a1563 = sp.cellEdges[v_c];
                  for (let _i1564 = 0; _i1564 < _a1563.length; _i1564++) {
                    const v_x = _a1563[_i1564];
                    if (!(((sealLock_f1545[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1166.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1561 = false;
                      break Q1562;
                    }
                  }
                }
                _c1565 = _q1561;
              }
              let _c1746: boolean = _c1565;
              if (_c1746) {
                let _q1566 = false;
                Q1567: {
                  const _a1568 = sp.cellEdges[v_c];
                  for (let _i1569 = 0; _i1569 < _a1568.length; _i1569++) {
                    const v_x = _a1568[_i1569];
                    if (!((sealLock_f1545[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q1566 = true;
                      break Q1567;
                    }
                  }
                }
                let _c1745: boolean = _q1566;
                if (!_c1745) {
                  _g1570.length = 0;
                  sealLock_st1653.pass++;
                  G1571: {
                    const _a1654 = sp.cellEdges[v_c];
                    for (let _i1655 = 0; _i1655 < _a1654.length; _i1655++) {
                      const v_x = _a1654[_i1655];
                      if (!((sealLock_f1545[v_x] === 1))) continue;
                      const _t1656 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h1718 = minus(_h1312, sp.cellEdges[_t1656]);
                      const _eg1720 = edgeGroups(sp, _h1718);
                      const _memo1723 = new Map<readonly number[], readonly number[]>();
                      _g1657.length = 0;
                      sealLock_st1696.pass++;
                      G1658: {
                        const _a1697 = sp.cellEdges[_t1656];
                        for (let _i1698 = 0; _i1698 < _a1697.length; _i1698++) {
                          const v_y = _a1697[_i1698];
                          let _c1717: boolean = (v_y !== v_x);
                          if (_c1717) {
                            let _q1699 = false;
                            Q1700: {
                              const _a1701 = sp.cellEdges[_t1656];
                              for (const _e1705 of sealLock_l1703) sealLock_f1702[_e1705] = -1;
                              sealLock_l1703 = _a1701;
                              let _i1707 = 0;
                              _s1704[0] = 0;
                              let _o1711 = _a1701.length === 0;
                              for (;;) {
                                if (_a1701.length === 0) {
                                  if (!_o1711) break;
                                  _o1711 = false;
                                }
                                while (_a1701.length > 0 && _i1707 >= 0) {
                                  const _e1705 = _a1701[_i1707];
                                  if (_s1704[_i1707] > 0) sealLock_f1702[_e1705] = -1;
                                  let _r1710 = (cands[_e1705] >= 0 ? cands[_e1705] : (cands[_e1705] = b.cands[_e1705])) & ~((2 << _s1704[_i1707]) - 1);
                                  let _d1706 = 0;
                                  V1709: for (; _r1710 !== 0; _r1710 &= _r1710 - 1) {
                                    _d1706 = 31 - Math.clz32(_r1710 & -_r1710);
                                    sealLock_f1702[_e1705] = _d1706;
                                    if (_e1705 === v_x && _d1706 !== 1) continue;
                                    if (_e1705 === v_y && _d1706 !== 1) continue;
                                    for (let _j1708 = 0; _j1708 < _i1707; _j1708++) {
                                      const _y1712 = _a1701[_j1708];
                                      if (!(((((_k1125[_t1656] ?? arms(sp, cl, _t1656)) === 2) && (sealLock_f1702[_e1705] === 1)) && (sealLock_f1702[_y1712] === 1)))) continue;
                                      if (!((bent(sp, _e1705, _y1712) === (clueAt(cl.piece, _t1656) === 3)))) continue V1709;
                                    }
                                    break;
                                  }
                                  if (_r1710 === 0) {
                                    _s1704[_i1707] = 0;
                                    _i1707--;
                                    continue;
                                  }
                                  _s1704[_i1707] = _d1706;
                                  if (_i1707 === _a1701.length - 1) break;
                                  _i1707++;
                                  _s1704[_i1707] = 0;
                                }
                                if (_i1707 < 0) break;
                                let _g1713 = 0;
                                G1714: {
                                  const _a1715 = sp.cellEdges[_t1656];
                                  for (let _i1716 = 0; _i1716 < _a1715.length; _i1716++) {
                                    const v_z = _a1715[_i1716];
                                    if (!((sealLock_f1702[v_z] === 1))) continue;
                                    _g1713++;
                                  }
                                }
                                if (!((_g1713 === (_k1125[_t1656] ?? arms(sp, cl, _t1656))))) continue;
                                if (true) {
                                  _q1699 = true;
                                  break Q1700;
                                }
                              }
                            }
                            _c1717 = _q1699;
                          }
                          if (!(_c1717)) continue;
                          const _t1719 = (sp.edgeEnds[2 * v_y] === _t1656 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t1722 = _eg1720.of(_t1719);
                          let _gs1724 = _memo1723.get(_t1722);
                          if (_gs1724 === undefined) {
                            _g1725.length = 0;
                            sealLock_st1732.pass++;
                            G1726: {
                              const _a1733 = _t1722;
                              for (let _i1734 = 0; _i1734 < _a1733.length; _i1734++) {
                                const v_t = _a1733[_i1734];
                                if (!(((_k1125[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a1735 = sp.cellEdges[v_t];
                                for (let _i1736 = 0; _i1736 < _a1735.length; _i1736++) {
                                  const v_y = _a1735[_i1736];
                                  L1737: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1125[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1333[v_y + 1] === 1)))) break L1737;
                                    const _t1738 = v_z;
                                    if (_g1725.length < 16) { if (!_g1725.includes(_t1738)) _g1725.push(_t1738); } else addOnce(_g1725, sealLock_st1732, _t1738);
                                  }
                                }
                              }
                            }
                            _gs1724 = _g1725.slice();
                            _memo1723.set(_t1722, _gs1724);
                          }
                          const _a1739 = union(_eg1720.of(_t1719), _gs1724);
                          for (let _i1740 = 0; _i1740 < _a1739.length; _i1740++) {
                            const v_t = _a1739[_i1740];
                            const _t1741 = v_t;
                            if (_g1657.length < 16) { if (!_g1657.includes(_t1741)) _g1657.push(_t1741); } else addOnce(_g1657, sealLock_st1696, _t1741);
                          }
                        }
                      }
                      const _a1742 = union(setOf(_t1656), _g1657);
                      for (let _i1743 = 0; _i1743 < _a1742.length; _i1743++) {
                        const v_t = _a1742[_i1743];
                        const _t1744 = v_t;
                        if (_g1570.length < 16) { if (!_g1570.includes(_t1744)) _g1570.push(_t1744); } else addOnce(_g1570, sealLock_st1653, _t1744);
                      }
                    }
                  }
                  _c1745 = (union(setOf(v_c), _g1570).length >= _h1338);
                }
                _c1746 = _c1745;
              }
              if (!(_c1746)) continue;
              if (!(true)) continue;
              sealLock_l1540 = _a1544;
              _y1541 = true;
              for (const _e1543 of _a1544) sealLock_p1539[_e1543] |= 1 << sealLock_f1545[_e1543];
            }
          }
          if (!(((((sealLock_p1539[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y1541 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1339.push(v_e);
        }
      }
      const v_W = _g1339;
      _g1747.length = 0;
      G1748: {
        const _a1945 = v_F;
        for (let _i1946 = 0; _i1946 < _a1945.length; _i1946++) {
          const v_e = _a1945[_i1946];
          if (_g1950 !== _epoch) {
            _g1950 = _epoch;
            for (const _e1951 of sealLock_l1948) sealLock_p1947[_e1951] = 0;
            _y1949 = false;
            const _a1952 = sp.cellEdges[v_c];
            for (const _e1956 of sealLock_l1954) sealLock_f1953[_e1956] = -1;
            sealLock_l1954 = _a1952;
            let _i1958 = 0;
            _s1955[0] = 0;
            let _o1962 = _a1952.length === 0;
            for (;;) {
              if (_a1952.length === 0) {
                if (!_o1962) break;
                _o1962 = false;
              }
              while (_a1952.length > 0 && _i1958 >= 0) {
                const _e1956 = _a1952[_i1958];
                if (_s1955[_i1958] > 0) sealLock_f1953[_e1956] = -1;
                let _r1961 = (cands[_e1956] >= 0 ? cands[_e1956] : (cands[_e1956] = b.cands[_e1956])) & ~((2 << _s1955[_i1958]) - 1);
                let _d1957 = 0;
                V1960: for (; _r1961 !== 0; _r1961 &= _r1961 - 1) {
                  _d1957 = 31 - Math.clz32(_r1961 & -_r1961);
                  sealLock_f1953[_e1956] = _d1957;
                  for (let _j1959 = 0; _j1959 < _i1958; _j1959++) {
                    const _y1963 = _a1952[_j1959];
                    if (!(((((_k1125[v_c] ?? arms(sp, cl, v_c)) === 2) && (sealLock_f1953[_e1956] === 1)) && (sealLock_f1953[_y1963] === 1)))) continue;
                    if (!((bent(sp, _e1956, _y1963) === (clueAt(cl.piece, v_c) === 3)))) continue V1960;
                  }
                  for (let _j1959 = 0; _j1959 < _i1958; _j1959++) {
                    const _y1964 = _a1952[_j1959];
                    if (!(((((sealLock_f1953[_e1956] === 1) && (sealLock_f1953[_y1964] === 1)) && !((b.grid[_e1956] !== 0))) && !((b.grid[_y1964] !== 0))))) continue;
                    if (!(!(_eg1166.of((sp.edgeEnds[2 * _y1964] === v_c ? sp.edgeEnds[2 * _y1964 + 1] : sp.edgeEnds[2 * _y1964])) === _eg1166.of((sp.edgeEnds[2 * _e1956] === v_c ? sp.edgeEnds[2 * _e1956 + 1] : sp.edgeEnds[2 * _e1956]))))) continue V1960;
                  }
                  break;
                }
                if (_r1961 === 0) {
                  _s1955[_i1958] = 0;
                  _i1958--;
                  continue;
                }
                _s1955[_i1958] = _d1957;
                if (_i1958 === _a1952.length - 1) break;
                _i1958++;
                _s1955[_i1958] = 0;
              }
              if (_i1958 < 0) break;
              let _g1965 = 0;
              G1966: {
                const _a1967 = sp.cellEdges[v_c];
                for (let _i1968 = 0; _i1968 < _a1967.length; _i1968++) {
                  const v_x = _a1967[_i1968];
                  if (!((sealLock_f1953[v_x] === 1))) continue;
                  _g1965++;
                }
              }
              let _c1973: boolean = (_g1965 === (_k1125[v_c] ?? arms(sp, cl, v_c)));
              if (_c1973) {
                let _q1969 = true;
                Q1970: {
                  const _a1971 = sp.cellEdges[v_c];
                  for (let _i1972 = 0; _i1972 < _a1971.length; _i1972++) {
                    const v_x = _a1971[_i1972];
                    if (!(((sealLock_f1953[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1166.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1969 = false;
                      break Q1970;
                    }
                  }
                }
                _c1973 = _q1969;
              }
              let _c2154: boolean = _c1973;
              if (_c2154) {
                let _q1974 = false;
                Q1975: {
                  const _a1976 = sp.cellEdges[v_c];
                  for (let _i1977 = 0; _i1977 < _a1976.length; _i1977++) {
                    const v_x = _a1976[_i1977];
                    if (!((sealLock_f1953[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q1974 = true;
                      break Q1975;
                    }
                  }
                }
                let _c2153: boolean = _q1974;
                if (!_c2153) {
                  _g1978.length = 0;
                  sealLock_st2061.pass++;
                  G1979: {
                    const _a2062 = sp.cellEdges[v_c];
                    for (let _i2063 = 0; _i2063 < _a2062.length; _i2063++) {
                      const v_x = _a2062[_i2063];
                      if (!((sealLock_f1953[v_x] === 1))) continue;
                      const _t2064 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h2126 = minus(_h1312, sp.cellEdges[_t2064]);
                      const _eg2128 = edgeGroups(sp, _h2126);
                      const _memo2131 = new Map<readonly number[], readonly number[]>();
                      _g2065.length = 0;
                      sealLock_st2104.pass++;
                      G2066: {
                        const _a2105 = sp.cellEdges[_t2064];
                        for (let _i2106 = 0; _i2106 < _a2105.length; _i2106++) {
                          const v_y = _a2105[_i2106];
                          let _c2125: boolean = (v_y !== v_x);
                          if (_c2125) {
                            let _q2107 = false;
                            Q2108: {
                              const _a2109 = sp.cellEdges[_t2064];
                              for (const _e2113 of sealLock_l2111) sealLock_f2110[_e2113] = -1;
                              sealLock_l2111 = _a2109;
                              let _i2115 = 0;
                              _s2112[0] = 0;
                              let _o2119 = _a2109.length === 0;
                              for (;;) {
                                if (_a2109.length === 0) {
                                  if (!_o2119) break;
                                  _o2119 = false;
                                }
                                while (_a2109.length > 0 && _i2115 >= 0) {
                                  const _e2113 = _a2109[_i2115];
                                  if (_s2112[_i2115] > 0) sealLock_f2110[_e2113] = -1;
                                  let _r2118 = (cands[_e2113] >= 0 ? cands[_e2113] : (cands[_e2113] = b.cands[_e2113])) & ~((2 << _s2112[_i2115]) - 1);
                                  let _d2114 = 0;
                                  V2117: for (; _r2118 !== 0; _r2118 &= _r2118 - 1) {
                                    _d2114 = 31 - Math.clz32(_r2118 & -_r2118);
                                    sealLock_f2110[_e2113] = _d2114;
                                    if (_e2113 === v_x && _d2114 !== 1) continue;
                                    if (_e2113 === v_y && _d2114 !== 1) continue;
                                    for (let _j2116 = 0; _j2116 < _i2115; _j2116++) {
                                      const _y2120 = _a2109[_j2116];
                                      if (!(((((_k1125[_t2064] ?? arms(sp, cl, _t2064)) === 2) && (sealLock_f2110[_e2113] === 1)) && (sealLock_f2110[_y2120] === 1)))) continue;
                                      if (!((bent(sp, _e2113, _y2120) === (clueAt(cl.piece, _t2064) === 3)))) continue V2117;
                                    }
                                    break;
                                  }
                                  if (_r2118 === 0) {
                                    _s2112[_i2115] = 0;
                                    _i2115--;
                                    continue;
                                  }
                                  _s2112[_i2115] = _d2114;
                                  if (_i2115 === _a2109.length - 1) break;
                                  _i2115++;
                                  _s2112[_i2115] = 0;
                                }
                                if (_i2115 < 0) break;
                                let _g2121 = 0;
                                G2122: {
                                  const _a2123 = sp.cellEdges[_t2064];
                                  for (let _i2124 = 0; _i2124 < _a2123.length; _i2124++) {
                                    const v_z = _a2123[_i2124];
                                    if (!((sealLock_f2110[v_z] === 1))) continue;
                                    _g2121++;
                                  }
                                }
                                if (!((_g2121 === (_k1125[_t2064] ?? arms(sp, cl, _t2064))))) continue;
                                if (true) {
                                  _q2107 = true;
                                  break Q2108;
                                }
                              }
                            }
                            _c2125 = _q2107;
                          }
                          if (!(_c2125)) continue;
                          const _t2127 = (sp.edgeEnds[2 * v_y] === _t2064 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2130 = _eg2128.of(_t2127);
                          let _gs2132 = _memo2131.get(_t2130);
                          if (_gs2132 === undefined) {
                            _g2133.length = 0;
                            sealLock_st2140.pass++;
                            G2134: {
                              const _a2141 = _t2130;
                              for (let _i2142 = 0; _i2142 < _a2141.length; _i2142++) {
                                const v_t = _a2141[_i2142];
                                if (!(((_k1125[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a2143 = sp.cellEdges[v_t];
                                for (let _i2144 = 0; _i2144 < _a2143.length; _i2144++) {
                                  const v_y = _a2143[_i2144];
                                  L2145: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1125[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1333[v_y + 1] === 1)))) break L2145;
                                    const _t2146 = v_z;
                                    if (_g2133.length < 16) { if (!_g2133.includes(_t2146)) _g2133.push(_t2146); } else addOnce(_g2133, sealLock_st2140, _t2146);
                                  }
                                }
                              }
                            }
                            _gs2132 = _g2133.slice();
                            _memo2131.set(_t2130, _gs2132);
                          }
                          const _a2147 = union(_eg2128.of(_t2127), _gs2132);
                          for (let _i2148 = 0; _i2148 < _a2147.length; _i2148++) {
                            const v_t = _a2147[_i2148];
                            const _t2149 = v_t;
                            if (_g2065.length < 16) { if (!_g2065.includes(_t2149)) _g2065.push(_t2149); } else addOnce(_g2065, sealLock_st2104, _t2149);
                          }
                        }
                      }
                      const _a2150 = union(setOf(_t2064), _g2065);
                      for (let _i2151 = 0; _i2151 < _a2150.length; _i2151++) {
                        const v_t = _a2150[_i2151];
                        const _t2152 = v_t;
                        if (_g1978.length < 16) { if (!_g1978.includes(_t2152)) _g1978.push(_t2152); } else addOnce(_g1978, sealLock_st2061, _t2152);
                      }
                    }
                  }
                  _c2153 = (union(setOf(v_c), _g1978).length >= _h1338);
                }
                _c2154 = _c2153;
              }
              if (!(_c2154)) continue;
              if (!(true)) continue;
              sealLock_l1948 = _a1952;
              _y1949 = true;
              for (const _e1951 of _a1952) sealLock_p1947[_e1951] |= 1 << sealLock_f1953[_e1951];
            }
          }
          if (!(((((sealLock_p1947[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y1949 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1747.push(v_e);
        }
      }
      L2155: {
        const v_N = _g1747;
        let _q2156 = true;
        Q2157: {
          const _a2158 = v_F;
          for (let _i2159 = 0; _i2159 < _a2158.length; _i2159++) {
            const v_e = _a2158[_i2159];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q2156 = false;
              break Q2157;
            }
          }
        }
        if (!(_q2156)) break L2155;
        if (b.made[0] !== _m3228_0 || b.made[1] !== _m3229_1) {
          _g2160.length = 0;
          G2161: {
            const _a2164 = sp.edges;
            for (let _i2165 = 0; _i2165 < _a2164.length; _i2165++) {
              const v_e = _a2164[_i2165];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g2160.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g2160))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g2166: number[] = [];
          G2167: {
            const _a2170 = sp.edges;
            for (let _i2171 = 0; _i2171 < _a2170.length; _i2171++) {
              const v_e = _a2170[_i2171];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g2166.push(v_e);
            }
          }
          const _g2172: number[] = [];
          G2173: {
            const _a2215 = sp.edges;
            for (let _i2216 = 0; _i2216 < _a2215.length; _i2216++) {
              const v_e = _a2215[_i2216];
              const _t2217 = sp.edgeEnds[2 * v_e];
              let _q2218 = false;
              Q2219: {
                const _f2221 = new Int32Array(sp.edges.length).fill(-1);
                let _l2222: readonly number[] = [];
                const _s2223: number[] = [];
                const _a2220 = sp.cellEdges[_t2217];
                for (const _e2224 of _l2222) _f2221[_e2224] = -1;
                _l2222 = _a2220;
                let _i2226 = 0;
                _s2223[0] = 0;
                let _o2230 = _a2220.length === 0;
                for (;;) {
                  if (_a2220.length === 0) {
                    if (!_o2230) break;
                    _o2230 = false;
                  }
                  while (_a2220.length > 0 && _i2226 >= 0) {
                    const _e2224 = _a2220[_i2226];
                    if (_s2223[_i2226] > 0) _f2221[_e2224] = -1;
                    let _r2229 = (cands[_e2224] >= 0 ? cands[_e2224] : (cands[_e2224] = b.cands[_e2224])) & ~((2 << _s2223[_i2226]) - 1);
                    let _d2225 = 0;
                    V2228: for (; _r2229 !== 0; _r2229 &= _r2229 - 1) {
                      _d2225 = 31 - Math.clz32(_r2229 & -_r2229);
                      _f2221[_e2224] = _d2225;
                      if (_e2224 === v_e && _d2225 !== 1) continue;
                      for (let _j2227 = 0; _j2227 < _i2226; _j2227++) {
                        const _y2231 = _a2220[_j2227];
                        if (!((((arms(sp, cl, _t2217) === 2) && (_f2221[_e2224] === 1)) && (_f2221[_y2231] === 1)))) continue;
                        if (!((bent(sp, _e2224, _y2231) === (clueAt(cl.piece, _t2217) === 3)))) continue V2228;
                      }
                      break;
                    }
                    if (_r2229 === 0) {
                      _s2223[_i2226] = 0;
                      _i2226--;
                      continue;
                    }
                    _s2223[_i2226] = _d2225;
                    if (_i2226 === _a2220.length - 1) break;
                    _i2226++;
                    _s2223[_i2226] = 0;
                  }
                  if (_i2226 < 0) break;
                  let _g2232 = 0;
                  G2233: {
                    const _a2234 = sp.cellEdges[_t2217];
                    for (let _i2235 = 0; _i2235 < _a2234.length; _i2235++) {
                      const v_x = _a2234[_i2235];
                      if (!((_f2221[v_x] === 1))) continue;
                      _g2232++;
                    }
                  }
                  if (!((_g2232 === arms(sp, cl, _t2217)))) continue;
                  if (true) {
                    _q2218 = true;
                    break Q2219;
                  }
                }
              }
              let _c2255: boolean = _q2218;
              if (_c2255) {
                const _t2236 = sp.edgeEnds[2 * v_e + 1];
                let _q2237 = false;
                Q2238: {
                  const _f2240 = new Int32Array(sp.edges.length).fill(-1);
                  let _l2241: readonly number[] = [];
                  const _s2242: number[] = [];
                  const _a2239 = sp.cellEdges[_t2236];
                  for (const _e2243 of _l2241) _f2240[_e2243] = -1;
                  _l2241 = _a2239;
                  let _i2245 = 0;
                  _s2242[0] = 0;
                  let _o2249 = _a2239.length === 0;
                  for (;;) {
                    if (_a2239.length === 0) {
                      if (!_o2249) break;
                      _o2249 = false;
                    }
                    while (_a2239.length > 0 && _i2245 >= 0) {
                      const _e2243 = _a2239[_i2245];
                      if (_s2242[_i2245] > 0) _f2240[_e2243] = -1;
                      let _r2248 = (cands[_e2243] >= 0 ? cands[_e2243] : (cands[_e2243] = b.cands[_e2243])) & ~((2 << _s2242[_i2245]) - 1);
                      let _d2244 = 0;
                      V2247: for (; _r2248 !== 0; _r2248 &= _r2248 - 1) {
                        _d2244 = 31 - Math.clz32(_r2248 & -_r2248);
                        _f2240[_e2243] = _d2244;
                        if (_e2243 === v_e && _d2244 !== 1) continue;
                        for (let _j2246 = 0; _j2246 < _i2245; _j2246++) {
                          const _y2250 = _a2239[_j2246];
                          if (!((((arms(sp, cl, _t2236) === 2) && (_f2240[_e2243] === 1)) && (_f2240[_y2250] === 1)))) continue;
                          if (!((bent(sp, _e2243, _y2250) === (clueAt(cl.piece, _t2236) === 3)))) continue V2247;
                        }
                        break;
                      }
                      if (_r2248 === 0) {
                        _s2242[_i2245] = 0;
                        _i2245--;
                        continue;
                      }
                      _s2242[_i2245] = _d2244;
                      if (_i2245 === _a2239.length - 1) break;
                      _i2245++;
                      _s2242[_i2245] = 0;
                    }
                    if (_i2245 < 0) break;
                    let _g2251 = 0;
                    G2252: {
                      const _a2253 = sp.cellEdges[_t2236];
                      for (let _i2254 = 0; _i2254 < _a2253.length; _i2254++) {
                        const v_x = _a2253[_i2254];
                        if (!((_f2240[v_x] === 1))) continue;
                        _g2251++;
                      }
                    }
                    if (!((_g2251 === arms(sp, cl, _t2236)))) continue;
                    if (true) {
                      _q2237 = true;
                      break Q2238;
                    }
                  }
                }
                _c2255 = _q2237;
              }
              if (!(_c2255)) continue;
              _g2172.push(v_e);
            }
          }
          const _g2256: number[] = [];
          G2257: {
            const _a2260 = v_U;
            for (let _i2261 = 0; _i2261 < _a2260.length; _i2261++) {
              const v_e = _a2260[_i2261];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g2256.push(v_e);
            }
          }
          const _g2262: number[] = [];
          G2263: {
            const _a2266 = sp.cellEdges[v_c];
            for (let _i2267 = 0; _i2267 < _a2266.length; _i2267++) {
              const v_e = _a2266[_i2267];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g2262.push(v_e);
            }
          }
          const _g2268: number[] = [];
          G2269: {
            const _a2349 = sp.cellEdges[v_c];
            for (let _i2350 = 0; _i2350 < _a2349.length; _i2350++) {
              const v_x = _a2349[_i2350];
              const _t2351 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g2352: number[] = [];
              G2353: {
                const _a2391 = sp.cellEdges[_t2351];
                for (let _i2392 = 0; _i2392 < _a2391.length; _i2392++) {
                  const v_y = _a2391[_i2392];
                  let _c2411: boolean = (v_y !== v_x);
                  if (_c2411) {
                    let _q2393 = false;
                    Q2394: {
                      const _f2396 = new Int32Array(sp.edges.length).fill(-1);
                      let _l2397: readonly number[] = [];
                      const _s2398: number[] = [];
                      const _a2395 = sp.cellEdges[_t2351];
                      for (const _e2399 of _l2397) _f2396[_e2399] = -1;
                      _l2397 = _a2395;
                      let _i2401 = 0;
                      _s2398[0] = 0;
                      let _o2405 = _a2395.length === 0;
                      for (;;) {
                        if (_a2395.length === 0) {
                          if (!_o2405) break;
                          _o2405 = false;
                        }
                        while (_a2395.length > 0 && _i2401 >= 0) {
                          const _e2399 = _a2395[_i2401];
                          if (_s2398[_i2401] > 0) _f2396[_e2399] = -1;
                          let _r2404 = (cands[_e2399] >= 0 ? cands[_e2399] : (cands[_e2399] = b.cands[_e2399])) & ~((2 << _s2398[_i2401]) - 1);
                          let _d2400 = 0;
                          V2403: for (; _r2404 !== 0; _r2404 &= _r2404 - 1) {
                            _d2400 = 31 - Math.clz32(_r2404 & -_r2404);
                            _f2396[_e2399] = _d2400;
                            if (_e2399 === v_x && _d2400 !== 1) continue;
                            if (_e2399 === v_y && _d2400 !== 1) continue;
                            for (let _j2402 = 0; _j2402 < _i2401; _j2402++) {
                              const _y2406 = _a2395[_j2402];
                              if (!((((arms(sp, cl, _t2351) === 2) && (_f2396[_e2399] === 1)) && (_f2396[_y2406] === 1)))) continue;
                              if (!((bent(sp, _e2399, _y2406) === (clueAt(cl.piece, _t2351) === 3)))) continue V2403;
                            }
                            break;
                          }
                          if (_r2404 === 0) {
                            _s2398[_i2401] = 0;
                            _i2401--;
                            continue;
                          }
                          _s2398[_i2401] = _d2400;
                          if (_i2401 === _a2395.length - 1) break;
                          _i2401++;
                          _s2398[_i2401] = 0;
                        }
                        if (_i2401 < 0) break;
                        let _g2407 = 0;
                        G2408: {
                          const _a2409 = sp.cellEdges[_t2351];
                          for (let _i2410 = 0; _i2410 < _a2409.length; _i2410++) {
                            const v_z = _a2409[_i2410];
                            if (!((_f2396[v_z] === 1))) continue;
                            _g2407++;
                          }
                        }
                        if (!((_g2407 === arms(sp, cl, _t2351)))) continue;
                        if (true) {
                          _q2393 = true;
                          break Q2394;
                        }
                      }
                    }
                    _c2411 = _q2393;
                  }
                  if (!(_c2411)) continue;
                  const _t2412 = (sp.edgeEnds[2 * v_y] === _t2351 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t2413 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t2351]);
                  const _g2414: number[] = [];
                  G2415: {
                    const _a2421 = through(sp, _t2412, _t2413);
                    for (let _i2422 = 0; _i2422 < _a2421.length; _i2422++) {
                      const v_t = _a2421[_i2422];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a2423 = sp.cellEdges[v_t];
                      for (let _i2424 = 0; _i2424 < _a2423.length; _i2424++) {
                        const v_y = _a2423[_i2424];
                        L2425: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L2425;
                          if (!_g2414.includes(v_z)) _g2414.push(v_z);
                        }
                      }
                    }
                  }
                  const _a2426 = union(through(sp, _t2412, _t2413), _g2414);
                  for (let _i2427 = 0; _i2427 < _a2426.length; _i2427++) {
                    const v_t = _a2426[_i2427];
                    if (!_g2352.includes(v_t)) _g2352.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t2351), _g2352)).length >= sp.cells.length))) continue;
              _g2268.push(v_x);
            }
          }
          const _g2428: number[] = [];
          G2429: {
            const _a2626 = v_F;
            for (let _i2627 = 0; _i2627 < _a2626.length; _i2627++) {
              const v_e = _a2626[_i2627];
              let _q2628 = false;
              Q2629: {
                const _f2631 = new Int32Array(sp.edges.length).fill(-1);
                let _l2632: readonly number[] = [];
                const _s2633: number[] = [];
                const _a2630 = sp.cellEdges[v_c];
                for (const _e2634 of _l2632) _f2631[_e2634] = -1;
                _l2632 = _a2630;
                let _i2636 = 0;
                _s2633[0] = 0;
                let _o2640 = _a2630.length === 0;
                for (;;) {
                  if (_a2630.length === 0) {
                    if (!_o2640) break;
                    _o2640 = false;
                  }
                  while (_a2630.length > 0 && _i2636 >= 0) {
                    const _e2634 = _a2630[_i2636];
                    if (_s2633[_i2636] > 0) _f2631[_e2634] = -1;
                    let _r2639 = (cands[_e2634] >= 0 ? cands[_e2634] : (cands[_e2634] = b.cands[_e2634])) & ~((2 << _s2633[_i2636]) - 1);
                    let _d2635 = 0;
                    V2638: for (; _r2639 !== 0; _r2639 &= _r2639 - 1) {
                      _d2635 = 31 - Math.clz32(_r2639 & -_r2639);
                      _f2631[_e2634] = _d2635;
                      if (_e2634 === v_e && _d2635 !== 1) continue;
                      for (let _j2637 = 0; _j2637 < _i2636; _j2637++) {
                        const _y2641 = _a2630[_j2637];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f2631[_e2634] === 1)) && (_f2631[_y2641] === 1)))) continue;
                        if (!((bent(sp, _e2634, _y2641) === (clueAt(cl.piece, v_c) === 3)))) continue V2638;
                      }
                      for (let _j2637 = 0; _j2637 < _i2636; _j2637++) {
                        const _y2642 = _a2630[_j2637];
                        if (!(((((_f2631[_e2634] === 1) && (_f2631[_y2642] === 1)) && !((b.grid[_e2634] !== 0))) && !((b.grid[_y2642] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e2634] === v_c ? sp.edgeEnds[2 * _e2634 + 1] : sp.edgeEnds[2 * _e2634]), v_L).includes((sp.edgeEnds[2 * _y2642] === v_c ? sp.edgeEnds[2 * _y2642 + 1] : sp.edgeEnds[2 * _y2642]))))) continue V2638;
                      }
                      break;
                    }
                    if (_r2639 === 0) {
                      _s2633[_i2636] = 0;
                      _i2636--;
                      continue;
                    }
                    _s2633[_i2636] = _d2635;
                    if (_i2636 === _a2630.length - 1) break;
                    _i2636++;
                    _s2633[_i2636] = 0;
                  }
                  if (_i2636 < 0) break;
                  let _g2643 = 0;
                  G2644: {
                    const _a2645 = sp.cellEdges[v_c];
                    for (let _i2646 = 0; _i2646 < _a2645.length; _i2646++) {
                      const v_x = _a2645[_i2646];
                      if (!((_f2631[v_x] === 1))) continue;
                      _g2643++;
                    }
                  }
                  let _c2651: boolean = (_g2643 === arms(sp, cl, v_c));
                  if (_c2651) {
                    let _q2647 = true;
                    Q2648: {
                      const _a2649 = sp.cellEdges[v_c];
                      for (let _i2650 = 0; _i2650 < _a2649.length; _i2650++) {
                        const v_x = _a2649[_i2650];
                        if (!(((_f2631[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg1166.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q2647 = false;
                          break Q2648;
                        }
                      }
                    }
                    _c2651 = _q2647;
                  }
                  let _c2821: boolean = _c2651;
                  if (_c2821) {
                    let _q2652 = false;
                    Q2653: {
                      const _a2654 = sp.cellEdges[v_c];
                      for (let _i2655 = 0; _i2655 < _a2654.length; _i2655++) {
                        const v_x = _a2654[_i2655];
                        if (!((_f2631[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q2652 = true;
                          break Q2653;
                        }
                      }
                    }
                    let _c2820: boolean = _q2652;
                    if (!_c2820) {
                      const _g2656: number[] = [];
                      G2657: {
                        const _a2739 = sp.cellEdges[v_c];
                        for (let _i2740 = 0; _i2740 < _a2739.length; _i2740++) {
                          const v_x = _a2739[_i2740];
                          if (!((_f2631[v_x] === 1))) continue;
                          const _t2741 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g2742: number[] = [];
                          G2743: {
                            const _a2781 = sp.cellEdges[_t2741];
                            for (let _i2782 = 0; _i2782 < _a2781.length; _i2782++) {
                              const v_y = _a2781[_i2782];
                              let _c2801: boolean = (v_y !== v_x);
                              if (_c2801) {
                                let _q2783 = false;
                                Q2784: {
                                  const _f2786 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l2787: readonly number[] = [];
                                  const _s2788: number[] = [];
                                  const _a2785 = sp.cellEdges[_t2741];
                                  for (const _e2789 of _l2787) _f2786[_e2789] = -1;
                                  _l2787 = _a2785;
                                  let _i2791 = 0;
                                  _s2788[0] = 0;
                                  let _o2795 = _a2785.length === 0;
                                  for (;;) {
                                    if (_a2785.length === 0) {
                                      if (!_o2795) break;
                                      _o2795 = false;
                                    }
                                    while (_a2785.length > 0 && _i2791 >= 0) {
                                      const _e2789 = _a2785[_i2791];
                                      if (_s2788[_i2791] > 0) _f2786[_e2789] = -1;
                                      let _r2794 = (cands[_e2789] >= 0 ? cands[_e2789] : (cands[_e2789] = b.cands[_e2789])) & ~((2 << _s2788[_i2791]) - 1);
                                      let _d2790 = 0;
                                      V2793: for (; _r2794 !== 0; _r2794 &= _r2794 - 1) {
                                        _d2790 = 31 - Math.clz32(_r2794 & -_r2794);
                                        _f2786[_e2789] = _d2790;
                                        if (_e2789 === v_x && _d2790 !== 1) continue;
                                        if (_e2789 === v_y && _d2790 !== 1) continue;
                                        for (let _j2792 = 0; _j2792 < _i2791; _j2792++) {
                                          const _y2796 = _a2785[_j2792];
                                          if (!((((arms(sp, cl, _t2741) === 2) && (_f2786[_e2789] === 1)) && (_f2786[_y2796] === 1)))) continue;
                                          if (!((bent(sp, _e2789, _y2796) === (clueAt(cl.piece, _t2741) === 3)))) continue V2793;
                                        }
                                        break;
                                      }
                                      if (_r2794 === 0) {
                                        _s2788[_i2791] = 0;
                                        _i2791--;
                                        continue;
                                      }
                                      _s2788[_i2791] = _d2790;
                                      if (_i2791 === _a2785.length - 1) break;
                                      _i2791++;
                                      _s2788[_i2791] = 0;
                                    }
                                    if (_i2791 < 0) break;
                                    let _g2797 = 0;
                                    G2798: {
                                      const _a2799 = sp.cellEdges[_t2741];
                                      for (let _i2800 = 0; _i2800 < _a2799.length; _i2800++) {
                                        const v_z = _a2799[_i2800];
                                        if (!((_f2786[v_z] === 1))) continue;
                                        _g2797++;
                                      }
                                    }
                                    if (!((_g2797 === arms(sp, cl, _t2741)))) continue;
                                    if (true) {
                                      _q2783 = true;
                                      break Q2784;
                                    }
                                  }
                                }
                                _c2801 = _q2783;
                              }
                              if (!(_c2801)) continue;
                              const _t2802 = (sp.edgeEnds[2 * v_y] === _t2741 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t2803 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t2741]);
                              const _g2804: number[] = [];
                              G2805: {
                                const _a2811 = through(sp, _t2802, _t2803);
                                for (let _i2812 = 0; _i2812 < _a2811.length; _i2812++) {
                                  const v_t = _a2811[_i2812];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a2813 = sp.cellEdges[v_t];
                                  for (let _i2814 = 0; _i2814 < _a2813.length; _i2814++) {
                                    const v_y = _a2813[_i2814];
                                    L2815: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L2815;
                                      if (!_g2804.includes(v_z)) _g2804.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a2816 = union(through(sp, _t2802, _t2803), _g2804);
                              for (let _i2817 = 0; _i2817 < _a2816.length; _i2817++) {
                                const v_t = _a2816[_i2817];
                                if (!_g2742.includes(v_t)) _g2742.push(v_t);
                              }
                            }
                          }
                          const _a2818 = union(setOf(_t2741), _g2742);
                          for (let _i2819 = 0; _i2819 < _a2818.length; _i2819++) {
                            const v_t = _a2818[_i2819];
                            if (!_g2656.includes(v_t)) _g2656.push(v_t);
                          }
                        }
                      }
                      _c2820 = (union(setOf(v_c), _g2656).length >= sp.cells.length);
                    }
                    _c2821 = _c2820;
                  }
                  if (!(_c2821)) continue;
                  if (true) {
                    _q2628 = true;
                    break Q2629;
                  }
                }
              }
              if (!(_q2628)) continue;
              _g2428.push(v_e);
            }
          }
          const _g2822: number[] = [];
          G2823: {
            const _a3020 = v_F;
            for (let _i3021 = 0; _i3021 < _a3020.length; _i3021++) {
              const v_e = _a3020[_i3021];
              let _q3022 = false;
              Q3023: {
                const _f3025 = new Int32Array(sp.edges.length).fill(-1);
                let _l3026: readonly number[] = [];
                const _s3027: number[] = [];
                const _a3024 = sp.cellEdges[v_c];
                for (const _e3028 of _l3026) _f3025[_e3028] = -1;
                _l3026 = _a3024;
                let _i3030 = 0;
                _s3027[0] = 0;
                let _o3034 = _a3024.length === 0;
                for (;;) {
                  if (_a3024.length === 0) {
                    if (!_o3034) break;
                    _o3034 = false;
                  }
                  while (_a3024.length > 0 && _i3030 >= 0) {
                    const _e3028 = _a3024[_i3030];
                    if (_s3027[_i3030] > 0) _f3025[_e3028] = -1;
                    let _r3033 = (cands[_e3028] >= 0 ? cands[_e3028] : (cands[_e3028] = b.cands[_e3028])) & ~((2 << _s3027[_i3030]) - 1);
                    let _d3029 = 0;
                    V3032: for (; _r3033 !== 0; _r3033 &= _r3033 - 1) {
                      _d3029 = 31 - Math.clz32(_r3033 & -_r3033);
                      _f3025[_e3028] = _d3029;
                      if (_e3028 === v_e && _d3029 !== 2) continue;
                      for (let _j3031 = 0; _j3031 < _i3030; _j3031++) {
                        const _y3035 = _a3024[_j3031];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f3025[_e3028] === 1)) && (_f3025[_y3035] === 1)))) continue;
                        if (!((bent(sp, _e3028, _y3035) === (clueAt(cl.piece, v_c) === 3)))) continue V3032;
                      }
                      for (let _j3031 = 0; _j3031 < _i3030; _j3031++) {
                        const _y3036 = _a3024[_j3031];
                        if (!(((((_f3025[_e3028] === 1) && (_f3025[_y3036] === 1)) && !((b.grid[_e3028] !== 0))) && !((b.grid[_y3036] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e3028] === v_c ? sp.edgeEnds[2 * _e3028 + 1] : sp.edgeEnds[2 * _e3028]), v_L).includes((sp.edgeEnds[2 * _y3036] === v_c ? sp.edgeEnds[2 * _y3036 + 1] : sp.edgeEnds[2 * _y3036]))))) continue V3032;
                      }
                      break;
                    }
                    if (_r3033 === 0) {
                      _s3027[_i3030] = 0;
                      _i3030--;
                      continue;
                    }
                    _s3027[_i3030] = _d3029;
                    if (_i3030 === _a3024.length - 1) break;
                    _i3030++;
                    _s3027[_i3030] = 0;
                  }
                  if (_i3030 < 0) break;
                  let _g3037 = 0;
                  G3038: {
                    const _a3039 = sp.cellEdges[v_c];
                    for (let _i3040 = 0; _i3040 < _a3039.length; _i3040++) {
                      const v_x = _a3039[_i3040];
                      if (!((_f3025[v_x] === 1))) continue;
                      _g3037++;
                    }
                  }
                  let _c3045: boolean = (_g3037 === arms(sp, cl, v_c));
                  if (_c3045) {
                    let _q3041 = true;
                    Q3042: {
                      const _a3043 = sp.cellEdges[v_c];
                      for (let _i3044 = 0; _i3044 < _a3043.length; _i3044++) {
                        const v_x = _a3043[_i3044];
                        if (!(((_f3025[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg1166.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q3041 = false;
                          break Q3042;
                        }
                      }
                    }
                    _c3045 = _q3041;
                  }
                  let _c3215: boolean = _c3045;
                  if (_c3215) {
                    let _q3046 = false;
                    Q3047: {
                      const _a3048 = sp.cellEdges[v_c];
                      for (let _i3049 = 0; _i3049 < _a3048.length; _i3049++) {
                        const v_x = _a3048[_i3049];
                        if (!((_f3025[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q3046 = true;
                          break Q3047;
                        }
                      }
                    }
                    let _c3214: boolean = _q3046;
                    if (!_c3214) {
                      const _g3050: number[] = [];
                      G3051: {
                        const _a3133 = sp.cellEdges[v_c];
                        for (let _i3134 = 0; _i3134 < _a3133.length; _i3134++) {
                          const v_x = _a3133[_i3134];
                          if (!((_f3025[v_x] === 1))) continue;
                          const _t3135 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g3136: number[] = [];
                          G3137: {
                            const _a3175 = sp.cellEdges[_t3135];
                            for (let _i3176 = 0; _i3176 < _a3175.length; _i3176++) {
                              const v_y = _a3175[_i3176];
                              let _c3195: boolean = (v_y !== v_x);
                              if (_c3195) {
                                let _q3177 = false;
                                Q3178: {
                                  const _f3180 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l3181: readonly number[] = [];
                                  const _s3182: number[] = [];
                                  const _a3179 = sp.cellEdges[_t3135];
                                  for (const _e3183 of _l3181) _f3180[_e3183] = -1;
                                  _l3181 = _a3179;
                                  let _i3185 = 0;
                                  _s3182[0] = 0;
                                  let _o3189 = _a3179.length === 0;
                                  for (;;) {
                                    if (_a3179.length === 0) {
                                      if (!_o3189) break;
                                      _o3189 = false;
                                    }
                                    while (_a3179.length > 0 && _i3185 >= 0) {
                                      const _e3183 = _a3179[_i3185];
                                      if (_s3182[_i3185] > 0) _f3180[_e3183] = -1;
                                      let _r3188 = (cands[_e3183] >= 0 ? cands[_e3183] : (cands[_e3183] = b.cands[_e3183])) & ~((2 << _s3182[_i3185]) - 1);
                                      let _d3184 = 0;
                                      V3187: for (; _r3188 !== 0; _r3188 &= _r3188 - 1) {
                                        _d3184 = 31 - Math.clz32(_r3188 & -_r3188);
                                        _f3180[_e3183] = _d3184;
                                        if (_e3183 === v_x && _d3184 !== 1) continue;
                                        if (_e3183 === v_y && _d3184 !== 1) continue;
                                        for (let _j3186 = 0; _j3186 < _i3185; _j3186++) {
                                          const _y3190 = _a3179[_j3186];
                                          if (!((((arms(sp, cl, _t3135) === 2) && (_f3180[_e3183] === 1)) && (_f3180[_y3190] === 1)))) continue;
                                          if (!((bent(sp, _e3183, _y3190) === (clueAt(cl.piece, _t3135) === 3)))) continue V3187;
                                        }
                                        break;
                                      }
                                      if (_r3188 === 0) {
                                        _s3182[_i3185] = 0;
                                        _i3185--;
                                        continue;
                                      }
                                      _s3182[_i3185] = _d3184;
                                      if (_i3185 === _a3179.length - 1) break;
                                      _i3185++;
                                      _s3182[_i3185] = 0;
                                    }
                                    if (_i3185 < 0) break;
                                    let _g3191 = 0;
                                    G3192: {
                                      const _a3193 = sp.cellEdges[_t3135];
                                      for (let _i3194 = 0; _i3194 < _a3193.length; _i3194++) {
                                        const v_z = _a3193[_i3194];
                                        if (!((_f3180[v_z] === 1))) continue;
                                        _g3191++;
                                      }
                                    }
                                    if (!((_g3191 === arms(sp, cl, _t3135)))) continue;
                                    if (true) {
                                      _q3177 = true;
                                      break Q3178;
                                    }
                                  }
                                }
                                _c3195 = _q3177;
                              }
                              if (!(_c3195)) continue;
                              const _t3196 = (sp.edgeEnds[2 * v_y] === _t3135 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t3197 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t3135]);
                              const _g3198: number[] = [];
                              G3199: {
                                const _a3205 = through(sp, _t3196, _t3197);
                                for (let _i3206 = 0; _i3206 < _a3205.length; _i3206++) {
                                  const v_t = _a3205[_i3206];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a3207 = sp.cellEdges[v_t];
                                  for (let _i3208 = 0; _i3208 < _a3207.length; _i3208++) {
                                    const v_y = _a3207[_i3208];
                                    L3209: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L3209;
                                      if (!_g3198.includes(v_z)) _g3198.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a3210 = union(through(sp, _t3196, _t3197), _g3198);
                              for (let _i3211 = 0; _i3211 < _a3210.length; _i3211++) {
                                const v_t = _a3210[_i3211];
                                if (!_g3136.includes(v_t)) _g3136.push(v_t);
                              }
                            }
                          }
                          const _a3212 = union(setOf(_t3135), _g3136);
                          for (let _i3213 = 0; _i3213 < _a3212.length; _i3213++) {
                            const v_t = _a3212[_i3213];
                            if (!_g3050.includes(v_t)) _g3050.push(v_t);
                          }
                        }
                      }
                      _c3214 = (union(setOf(v_c), _g3050).length >= sp.cells.length);
                    }
                    _c3215 = _c3214;
                  }
                  if (!(_c3215)) continue;
                  if (true) {
                    _q3022 = true;
                    break Q3023;
                  }
                }
              }
              if (!(_q3022)) continue;
              _g2822.push(v_e);
            }
          }
          let _q3216 = true;
          Q3217: {
            const _a3218 = v_F;
            for (let _i3219 = 0; _i3219 < _a3218.length; _i3219++) {
              const v_e = _a3218[_i3219];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q3216 = false;
                break Q3217;
              }
            }
          }
          freshBinding("sealLock", [sameSet(v_L, _g2166), sameSet(v_U, _g2172), sameSet(v_P, _g2256), (sp.cells.includes(v_c)), sameSet(v_F, _g2262), (v_F.length > 0), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g2268), sameSet(v_W, _g2428), sameSet(v_N, _g2822), _q3216], ["L =", "U =", "P =", "c in", "F =", "where of F", "G =", "K =", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q3220 = true;
        Q3221: {
          const _a3222 = v_F;
          for (let _i3223 = 0; _i3223 < _a3222.length; _i3223++) {
            const v_e = _a3222[_i3223];
            let _c3225: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c3225) {
              let _c3224: boolean = !(!(v_W.includes(v_e)));
              if (!_c3224) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c3224 = true;
              }
              _c3225 = _c3224;
            }
            let _c3227: boolean = _c3225;
            if (_c3227) {
              let _c3226: boolean = !(!(v_N.includes(v_e)));
              if (!_c3226) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c3226 = true;
              }
              _c3227 = _c3226;
            }
            if (!(_c3227)) {
              _q3220 = false;
              break Q3221;
            }
          }
        }
        if (!(_q3220)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, F: v_F.slice(), G: v_G.slice(), K: v_K.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface SealNoteBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  G: readonly number[];
  K: readonly number[];
  e: number;
  A: boolean;
  B: boolean;
}

const sealNoteFacts: number[] = [];
let sealNoteCands = new Int32Array(0);
let sealNote_f709 = new Int32Array(0);
let sealNote_l710: readonly number[] = [];
let sealNote_f729 = new Int32Array(0);
let sealNote_l730: readonly number[] = [];
const sealNote_st881 = stamps();
let sealNote_f887 = new Int32Array(0);
let sealNote_l888: readonly number[] = [];
const sealNote_st918 = stamps();
let sealNote_p932 = new Int32Array(0);
let sealNote_l933: readonly number[] = [];
let sealNote_f938 = new Int32Array(0);
let sealNote_l939: readonly number[] = [];
const sealNote_st1046 = stamps();
const sealNote_st1089 = stamps();
let sealNote_f1095 = new Int32Array(0);
let sealNote_l1096: readonly number[] = [];
const sealNote_st1125 = stamps();
let sealNote_p1140 = new Int32Array(0);
let sealNote_l1141: readonly number[] = [];
let sealNote_f1146 = new Int32Array(0);
let sealNote_l1147: readonly number[] = [];
const sealNote_st1254 = stamps();
const sealNote_st1297 = stamps();
let sealNote_f1303 = new Int32Array(0);
let sealNote_l1304: readonly number[] = [];
const sealNote_st1333 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealNoteBinding> | null): number {
  const _g654: number[] = [];
  const _g660: number[] = [];
  if (sealNote_f709.length < sp.edges.length) sealNote_f709 = new Int32Array(sp.edges.length).fill(-1);
  else sealNote_f709.fill(-1);
  sealNote_l710 = [];
  const _s711: number[] = [];
  if (sealNote_f729.length < sp.edges.length) sealNote_f729 = new Int32Array(sp.edges.length).fill(-1);
  else sealNote_f729.fill(-1);
  sealNote_l730 = [];
  const _s731: number[] = [];
  const _g745: number[] = [];
  const _g758: number[] = [];
  const _g842: number[] = [];
  if (sealNote_f887.length < sp.edges.length) sealNote_f887 = new Int32Array(sp.edges.length).fill(-1);
  else sealNote_f887.fill(-1);
  sealNote_l888 = [];
  const _s889: number[] = [];
  const _g911: number[] = [];
  if (sealNote_p932.length < sp.edges.length) sealNote_p932 = new Int32Array(sp.edges.length);
  else sealNote_p932.fill(0);
  sealNote_l933 = [];
  let _y934 = false;
  if (sealNote_f938.length < sp.edges.length) sealNote_f938 = new Int32Array(sp.edges.length).fill(-1);
  else sealNote_f938.fill(-1);
  sealNote_l939 = [];
  const _s940: number[] = [];
  const _g963: number[] = [];
  const _g1050: number[] = [];
  if (sealNote_f1095.length < sp.edges.length) sealNote_f1095 = new Int32Array(sp.edges.length).fill(-1);
  else sealNote_f1095.fill(-1);
  sealNote_l1096 = [];
  const _s1097: number[] = [];
  const _g1118: number[] = [];
  if (sealNote_p1140.length < sp.edges.length) sealNote_p1140 = new Int32Array(sp.edges.length);
  else sealNote_p1140.fill(0);
  sealNote_l1141 = [];
  let _y1142 = false;
  if (sealNote_f1146.length < sp.edges.length) sealNote_f1146 = new Int32Array(sp.edges.length).fill(-1);
  else sealNote_f1146.fill(-1);
  sealNote_l1147 = [];
  const _s1148: number[] = [];
  const _g1171: number[] = [];
  const _g1258: number[] = [];
  if (sealNote_f1303.length < sp.edges.length) sealNote_f1303 = new Int32Array(sp.edges.length).fill(-1);
  else sealNote_f1303.fill(-1);
  sealNote_l1304 = [];
  const _s1305: number[] = [];
  const _g1326: number[] = [];
  const _g1349: number[] = [];
  const facts = sealNoteFacts;
  let fired = 0;
  let changed = false;
  const _k720 = armsKept.board(cl);
  const _h929 = sp.cells.length;
  let _epoch = 0;
  if (sealNoteCands.length < sp.edges.length) sealNoteCands = new Int32Array(sp.edges.length);
  const cands = sealNoteCands;
  cands.fill(-1);
  const _m2003_0 = b.made[0];
  _g654.length = 0;
  G655: {
    const _a658 = sp.edges;
    for (let _i659 = 0; _i659 < _a658.length; _i659++) {
      const v_e = _a658[_i659];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g654.push(v_e);
    }
  }
  const v_L = _g654;
  const _m2004_1 = b.made[1];
  const _eg757 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g660.length = 0;
  G661: {
    const _a703 = sp.edges;
    for (let _i704 = 0; _i704 < _a703.length; _i704++) {
      const v_e = _a703[_i704];
      const _t705 = sp.edgeEnds[2 * v_e];
      let _q706 = false;
      Q707: {
        const _a708 = sp.cellEdges[_t705];
        for (const _e712 of sealNote_l710) sealNote_f709[_e712] = -1;
        sealNote_l710 = _a708;
        let _i714 = 0;
        _s711[0] = 0;
        let _o718 = _a708.length === 0;
        for (;;) {
          if (_a708.length === 0) {
            if (!_o718) break;
            _o718 = false;
          }
          while (_a708.length > 0 && _i714 >= 0) {
            const _e712 = _a708[_i714];
            if (_s711[_i714] > 0) sealNote_f709[_e712] = -1;
            let _r717 = (cands[_e712] >= 0 ? cands[_e712] : (cands[_e712] = b.cands[_e712])) & ~((2 << _s711[_i714]) - 1);
            let _d713 = 0;
            V716: for (; _r717 !== 0; _r717 &= _r717 - 1) {
              _d713 = 31 - Math.clz32(_r717 & -_r717);
              sealNote_f709[_e712] = _d713;
              if (_e712 === v_e && _d713 !== 1) continue;
              for (let _j715 = 0; _j715 < _i714; _j715++) {
                const _y719 = _a708[_j715];
                if (!(((((_k720[_t705] ?? arms(sp, cl, _t705)) === 2) && (sealNote_f709[_e712] === 1)) && (sealNote_f709[_y719] === 1)))) continue;
                if (!((bent(sp, _e712, _y719) === (clueAt(cl.piece, _t705) === 3)))) continue V716;
              }
              break;
            }
            if (_r717 === 0) {
              _s711[_i714] = 0;
              _i714--;
              continue;
            }
            _s711[_i714] = _d713;
            if (_i714 === _a708.length - 1) break;
            _i714++;
            _s711[_i714] = 0;
          }
          if (_i714 < 0) break;
          let _g721 = 0;
          G722: {
            const _a723 = sp.cellEdges[_t705];
            for (let _i724 = 0; _i724 < _a723.length; _i724++) {
              const v_x = _a723[_i724];
              if (!((sealNote_f709[v_x] === 1))) continue;
              _g721++;
            }
          }
          if (!((_g721 === (_k720[_t705] ?? arms(sp, cl, _t705))))) continue;
          if (true) {
            _q706 = true;
            break Q707;
          }
        }
      }
      let _c744: boolean = _q706;
      if (_c744) {
        const _t725 = sp.edgeEnds[2 * v_e + 1];
        let _q726 = false;
        Q727: {
          const _a728 = sp.cellEdges[_t725];
          for (const _e732 of sealNote_l730) sealNote_f729[_e732] = -1;
          sealNote_l730 = _a728;
          let _i734 = 0;
          _s731[0] = 0;
          let _o738 = _a728.length === 0;
          for (;;) {
            if (_a728.length === 0) {
              if (!_o738) break;
              _o738 = false;
            }
            while (_a728.length > 0 && _i734 >= 0) {
              const _e732 = _a728[_i734];
              if (_s731[_i734] > 0) sealNote_f729[_e732] = -1;
              let _r737 = (cands[_e732] >= 0 ? cands[_e732] : (cands[_e732] = b.cands[_e732])) & ~((2 << _s731[_i734]) - 1);
              let _d733 = 0;
              V736: for (; _r737 !== 0; _r737 &= _r737 - 1) {
                _d733 = 31 - Math.clz32(_r737 & -_r737);
                sealNote_f729[_e732] = _d733;
                if (_e732 === v_e && _d733 !== 1) continue;
                for (let _j735 = 0; _j735 < _i734; _j735++) {
                  const _y739 = _a728[_j735];
                  if (!(((((_k720[_t725] ?? arms(sp, cl, _t725)) === 2) && (sealNote_f729[_e732] === 1)) && (sealNote_f729[_y739] === 1)))) continue;
                  if (!((bent(sp, _e732, _y739) === (clueAt(cl.piece, _t725) === 3)))) continue V736;
                }
                break;
              }
              if (_r737 === 0) {
                _s731[_i734] = 0;
                _i734--;
                continue;
              }
              _s731[_i734] = _d733;
              if (_i734 === _a728.length - 1) break;
              _i734++;
              _s731[_i734] = 0;
            }
            if (_i734 < 0) break;
            let _g740 = 0;
            G741: {
              const _a742 = sp.cellEdges[_t725];
              for (let _i743 = 0; _i743 < _a742.length; _i743++) {
                const v_x = _a742[_i743];
                if (!((sealNote_f729[v_x] === 1))) continue;
                _g740++;
              }
            }
            if (!((_g740 === (_k720[_t725] ?? arms(sp, cl, _t725))))) continue;
            if (true) {
              _q726 = true;
              break Q727;
            }
          }
        }
        _c744 = _q726;
      }
      if (!(_c744)) continue;
      _g660.push(v_e);
    }
  }
  const v_U = _g660;
  const _mm924 = memberMarks(v_U);
  _g745.length = 0;
  G746: {
    const _a749 = v_U;
    for (let _i750 = 0; _i750 < _a749.length; _i750++) {
      const v_e = _a749[_i750];
      if (!((((_k720[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k720[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g745.push(v_e);
    }
  }
  const v_P = _g745;
  const _a751 = sp.cells;
  for (let _i752 = 0; _i752 < _a751.length; _i752++) {
    const v_c = _a751[_i752];
    const _h903 = minus(v_P, sp.cellEdges[v_c]);
    let _q753 = false;
    Q754: {
      const _a755 = sp.cellEdges[v_c];
      for (let _i756 = 0; _i756 < _a755.length; _i756++) {
        const v_e = _a755[_i756];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q753 = true;
          break Q754;
        }
      }
    }
    if (!(_q753)) continue;
    const v_G = _eg757.of(v_c);
    _g758.length = 0;
    G759: {
      const _a839 = sp.cellEdges[v_c];
      for (let _i840 = 0; _i840 < _a839.length; _i840++) {
        const v_x = _a839[_i840];
        const _t841 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h904 = minus(_h903, sp.cellEdges[_t841]);
        const _eg906 = edgeGroups(sp, _h904);
        const _memo909 = new Map<readonly number[], readonly number[]>();
        _g842.length = 0;
        sealNote_st881.pass++;
        G843: {
          const _a882 = sp.cellEdges[_t841];
          for (let _i883 = 0; _i883 < _a882.length; _i883++) {
            const v_y = _a882[_i883];
            let _c902: boolean = (v_y !== v_x);
            if (_c902) {
              let _q884 = false;
              Q885: {
                const _a886 = sp.cellEdges[_t841];
                for (const _e890 of sealNote_l888) sealNote_f887[_e890] = -1;
                sealNote_l888 = _a886;
                let _i892 = 0;
                _s889[0] = 0;
                let _o896 = _a886.length === 0;
                for (;;) {
                  if (_a886.length === 0) {
                    if (!_o896) break;
                    _o896 = false;
                  }
                  while (_a886.length > 0 && _i892 >= 0) {
                    const _e890 = _a886[_i892];
                    if (_s889[_i892] > 0) sealNote_f887[_e890] = -1;
                    let _r895 = (cands[_e890] >= 0 ? cands[_e890] : (cands[_e890] = b.cands[_e890])) & ~((2 << _s889[_i892]) - 1);
                    let _d891 = 0;
                    V894: for (; _r895 !== 0; _r895 &= _r895 - 1) {
                      _d891 = 31 - Math.clz32(_r895 & -_r895);
                      sealNote_f887[_e890] = _d891;
                      if (_e890 === v_x && _d891 !== 1) continue;
                      if (_e890 === v_y && _d891 !== 1) continue;
                      for (let _j893 = 0; _j893 < _i892; _j893++) {
                        const _y897 = _a886[_j893];
                        if (!(((((_k720[_t841] ?? arms(sp, cl, _t841)) === 2) && (sealNote_f887[_e890] === 1)) && (sealNote_f887[_y897] === 1)))) continue;
                        if (!((bent(sp, _e890, _y897) === (clueAt(cl.piece, _t841) === 3)))) continue V894;
                      }
                      break;
                    }
                    if (_r895 === 0) {
                      _s889[_i892] = 0;
                      _i892--;
                      continue;
                    }
                    _s889[_i892] = _d891;
                    if (_i892 === _a886.length - 1) break;
                    _i892++;
                    _s889[_i892] = 0;
                  }
                  if (_i892 < 0) break;
                  let _g898 = 0;
                  G899: {
                    const _a900 = sp.cellEdges[_t841];
                    for (let _i901 = 0; _i901 < _a900.length; _i901++) {
                      const v_z = _a900[_i901];
                      if (!((sealNote_f887[v_z] === 1))) continue;
                      _g898++;
                    }
                  }
                  if (!((_g898 === (_k720[_t841] ?? arms(sp, cl, _t841))))) continue;
                  if (true) {
                    _q884 = true;
                    break Q885;
                  }
                }
              }
              _c902 = _q884;
            }
            if (!(_c902)) continue;
            const _t905 = (sp.edgeEnds[2 * v_y] === _t841 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t908 = _eg906.of(_t905);
            let _gs910 = _memo909.get(_t908);
            if (_gs910 === undefined) {
              _g911.length = 0;
              sealNote_st918.pass++;
              G912: {
                const _a919 = _t908;
                for (let _i920 = 0; _i920 < _a919.length; _i920++) {
                  const v_t = _a919[_i920];
                  if (!(((_k720[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a921 = sp.cellEdges[v_t];
                  for (let _i922 = 0; _i922 < _a921.length; _i922++) {
                    const v_y = _a921[_i922];
                    L923: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k720[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm924[v_y + 1] === 1)))) break L923;
                      const _t925 = v_z;
                      if (_g911.length < 16) { if (!_g911.includes(_t925)) _g911.push(_t925); } else addOnce(_g911, sealNote_st918, _t925);
                    }
                  }
                }
              }
              _gs910 = _g911.slice();
              _memo909.set(_t908, _gs910);
            }
            const _a926 = union(_eg906.of(_t905), _gs910);
            for (let _i927 = 0; _i927 < _a926.length; _i927++) {
              const v_t = _a926[_i927];
              const _t928 = v_t;
              if (_g842.length < 16) { if (!_g842.includes(_t928)) _g842.push(_t928); } else addOnce(_g842, sealNote_st881, _t928);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t841), _g842)).length >= _h929))) continue;
        _g758.push(v_x);
      }
    }
    const v_K = _g758;
    let _g935 = -1;
    let _g1143 = -1;
    const _a930 = sp.cellEdges[v_c];
    for (let _i931 = 0; _i931 < _a930.length; _i931++) {
      const v_e = _a930[_i931];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g935 !== _epoch) {
        _g935 = _epoch;
        for (const _e936 of sealNote_l933) sealNote_p932[_e936] = 0;
        _y934 = false;
        const _a937 = sp.cellEdges[v_c];
        for (const _e941 of sealNote_l939) sealNote_f938[_e941] = -1;
        sealNote_l939 = _a937;
        let _i943 = 0;
        _s940[0] = 0;
        let _o947 = _a937.length === 0;
        for (;;) {
          if (_a937.length === 0) {
            if (!_o947) break;
            _o947 = false;
          }
          while (_a937.length > 0 && _i943 >= 0) {
            const _e941 = _a937[_i943];
            if (_s940[_i943] > 0) sealNote_f938[_e941] = -1;
            let _r946 = (cands[_e941] >= 0 ? cands[_e941] : (cands[_e941] = b.cands[_e941])) & ~((2 << _s940[_i943]) - 1);
            let _d942 = 0;
            V945: for (; _r946 !== 0; _r946 &= _r946 - 1) {
              _d942 = 31 - Math.clz32(_r946 & -_r946);
              sealNote_f938[_e941] = _d942;
              for (let _j944 = 0; _j944 < _i943; _j944++) {
                const _y948 = _a937[_j944];
                if (!(((((_k720[v_c] ?? arms(sp, cl, v_c)) === 2) && (sealNote_f938[_e941] === 1)) && (sealNote_f938[_y948] === 1)))) continue;
                if (!((bent(sp, _e941, _y948) === (clueAt(cl.piece, v_c) === 3)))) continue V945;
              }
              for (let _j944 = 0; _j944 < _i943; _j944++) {
                const _y949 = _a937[_j944];
                if (!(((((sealNote_f938[_e941] === 1) && (sealNote_f938[_y949] === 1)) && !((b.grid[_e941] !== 0))) && !((b.grid[_y949] !== 0))))) continue;
                if (!(!(_eg757.of((sp.edgeEnds[2 * _y949] === v_c ? sp.edgeEnds[2 * _y949 + 1] : sp.edgeEnds[2 * _y949])) === _eg757.of((sp.edgeEnds[2 * _e941] === v_c ? sp.edgeEnds[2 * _e941 + 1] : sp.edgeEnds[2 * _e941]))))) continue V945;
              }
              break;
            }
            if (_r946 === 0) {
              _s940[_i943] = 0;
              _i943--;
              continue;
            }
            _s940[_i943] = _d942;
            if (_i943 === _a937.length - 1) break;
            _i943++;
            _s940[_i943] = 0;
          }
          if (_i943 < 0) break;
          let _g950 = 0;
          G951: {
            const _a952 = sp.cellEdges[v_c];
            for (let _i953 = 0; _i953 < _a952.length; _i953++) {
              const v_x = _a952[_i953];
              if (!((sealNote_f938[v_x] === 1))) continue;
              _g950++;
            }
          }
          let _c958: boolean = (_g950 === (_k720[v_c] ?? arms(sp, cl, v_c)));
          if (_c958) {
            let _q954 = true;
            Q955: {
              const _a956 = sp.cellEdges[v_c];
              for (let _i957 = 0; _i957 < _a956.length; _i957++) {
                const v_x = _a956[_i957];
                if (!(((sealNote_f938[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg757.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q954 = false;
                  break Q955;
                }
              }
            }
            _c958 = _q954;
          }
          let _c1139: boolean = _c958;
          if (_c1139) {
            let _q959 = false;
            Q960: {
              const _a961 = sp.cellEdges[v_c];
              for (let _i962 = 0; _i962 < _a961.length; _i962++) {
                const v_x = _a961[_i962];
                if (!((sealNote_f938[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q959 = true;
                  break Q960;
                }
              }
            }
            let _c1138: boolean = _q959;
            if (!_c1138) {
              _g963.length = 0;
              sealNote_st1046.pass++;
              G964: {
                const _a1047 = sp.cellEdges[v_c];
                for (let _i1048 = 0; _i1048 < _a1047.length; _i1048++) {
                  const v_x = _a1047[_i1048];
                  if (!((sealNote_f938[v_x] === 1))) continue;
                  const _t1049 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h1111 = minus(_h903, sp.cellEdges[_t1049]);
                  const _eg1113 = edgeGroups(sp, _h1111);
                  const _memo1116 = new Map<readonly number[], readonly number[]>();
                  _g1050.length = 0;
                  sealNote_st1089.pass++;
                  G1051: {
                    const _a1090 = sp.cellEdges[_t1049];
                    for (let _i1091 = 0; _i1091 < _a1090.length; _i1091++) {
                      const v_y = _a1090[_i1091];
                      let _c1110: boolean = (v_y !== v_x);
                      if (_c1110) {
                        let _q1092 = false;
                        Q1093: {
                          const _a1094 = sp.cellEdges[_t1049];
                          for (const _e1098 of sealNote_l1096) sealNote_f1095[_e1098] = -1;
                          sealNote_l1096 = _a1094;
                          let _i1100 = 0;
                          _s1097[0] = 0;
                          let _o1104 = _a1094.length === 0;
                          for (;;) {
                            if (_a1094.length === 0) {
                              if (!_o1104) break;
                              _o1104 = false;
                            }
                            while (_a1094.length > 0 && _i1100 >= 0) {
                              const _e1098 = _a1094[_i1100];
                              if (_s1097[_i1100] > 0) sealNote_f1095[_e1098] = -1;
                              let _r1103 = (cands[_e1098] >= 0 ? cands[_e1098] : (cands[_e1098] = b.cands[_e1098])) & ~((2 << _s1097[_i1100]) - 1);
                              let _d1099 = 0;
                              V1102: for (; _r1103 !== 0; _r1103 &= _r1103 - 1) {
                                _d1099 = 31 - Math.clz32(_r1103 & -_r1103);
                                sealNote_f1095[_e1098] = _d1099;
                                if (_e1098 === v_x && _d1099 !== 1) continue;
                                if (_e1098 === v_y && _d1099 !== 1) continue;
                                for (let _j1101 = 0; _j1101 < _i1100; _j1101++) {
                                  const _y1105 = _a1094[_j1101];
                                  if (!(((((_k720[_t1049] ?? arms(sp, cl, _t1049)) === 2) && (sealNote_f1095[_e1098] === 1)) && (sealNote_f1095[_y1105] === 1)))) continue;
                                  if (!((bent(sp, _e1098, _y1105) === (clueAt(cl.piece, _t1049) === 3)))) continue V1102;
                                }
                                break;
                              }
                              if (_r1103 === 0) {
                                _s1097[_i1100] = 0;
                                _i1100--;
                                continue;
                              }
                              _s1097[_i1100] = _d1099;
                              if (_i1100 === _a1094.length - 1) break;
                              _i1100++;
                              _s1097[_i1100] = 0;
                            }
                            if (_i1100 < 0) break;
                            let _g1106 = 0;
                            G1107: {
                              const _a1108 = sp.cellEdges[_t1049];
                              for (let _i1109 = 0; _i1109 < _a1108.length; _i1109++) {
                                const v_z = _a1108[_i1109];
                                if (!((sealNote_f1095[v_z] === 1))) continue;
                                _g1106++;
                              }
                            }
                            if (!((_g1106 === (_k720[_t1049] ?? arms(sp, cl, _t1049))))) continue;
                            if (true) {
                              _q1092 = true;
                              break Q1093;
                            }
                          }
                        }
                        _c1110 = _q1092;
                      }
                      if (!(_c1110)) continue;
                      const _t1112 = (sp.edgeEnds[2 * v_y] === _t1049 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t1115 = _eg1113.of(_t1112);
                      let _gs1117 = _memo1116.get(_t1115);
                      if (_gs1117 === undefined) {
                        _g1118.length = 0;
                        sealNote_st1125.pass++;
                        G1119: {
                          const _a1126 = _t1115;
                          for (let _i1127 = 0; _i1127 < _a1126.length; _i1127++) {
                            const v_t = _a1126[_i1127];
                            if (!(((_k720[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a1128 = sp.cellEdges[v_t];
                            for (let _i1129 = 0; _i1129 < _a1128.length; _i1129++) {
                              const v_y = _a1128[_i1129];
                              L1130: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k720[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm924[v_y + 1] === 1)))) break L1130;
                                const _t1131 = v_z;
                                if (_g1118.length < 16) { if (!_g1118.includes(_t1131)) _g1118.push(_t1131); } else addOnce(_g1118, sealNote_st1125, _t1131);
                              }
                            }
                          }
                        }
                        _gs1117 = _g1118.slice();
                        _memo1116.set(_t1115, _gs1117);
                      }
                      const _a1132 = union(_eg1113.of(_t1112), _gs1117);
                      for (let _i1133 = 0; _i1133 < _a1132.length; _i1133++) {
                        const v_t = _a1132[_i1133];
                        const _t1134 = v_t;
                        if (_g1050.length < 16) { if (!_g1050.includes(_t1134)) _g1050.push(_t1134); } else addOnce(_g1050, sealNote_st1089, _t1134);
                      }
                    }
                  }
                  const _a1135 = union(setOf(_t1049), _g1050);
                  for (let _i1136 = 0; _i1136 < _a1135.length; _i1136++) {
                    const v_t = _a1135[_i1136];
                    const _t1137 = v_t;
                    if (_g963.length < 16) { if (!_g963.includes(_t1137)) _g963.push(_t1137); } else addOnce(_g963, sealNote_st1046, _t1137);
                  }
                }
              }
              _c1138 = (union(setOf(v_c), _g963).length >= _h929);
            }
            _c1139 = _c1138;
          }
          if (!(_c1139)) continue;
          if (!(true)) continue;
          sealNote_l933 = _a937;
          _y934 = true;
          for (const _e936 of _a937) sealNote_p932[_e936] |= 1 << sealNote_f938[_e936];
        }
      }
      const v_A = ((((sealNote_p932[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y934 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g1143 !== _epoch) {
        _g1143 = _epoch;
        for (const _e1144 of sealNote_l1141) sealNote_p1140[_e1144] = 0;
        _y1142 = false;
        const _a1145 = sp.cellEdges[v_c];
        for (const _e1149 of sealNote_l1147) sealNote_f1146[_e1149] = -1;
        sealNote_l1147 = _a1145;
        let _i1151 = 0;
        _s1148[0] = 0;
        let _o1155 = _a1145.length === 0;
        for (;;) {
          if (_a1145.length === 0) {
            if (!_o1155) break;
            _o1155 = false;
          }
          while (_a1145.length > 0 && _i1151 >= 0) {
            const _e1149 = _a1145[_i1151];
            if (_s1148[_i1151] > 0) sealNote_f1146[_e1149] = -1;
            let _r1154 = (cands[_e1149] >= 0 ? cands[_e1149] : (cands[_e1149] = b.cands[_e1149])) & ~((2 << _s1148[_i1151]) - 1);
            let _d1150 = 0;
            V1153: for (; _r1154 !== 0; _r1154 &= _r1154 - 1) {
              _d1150 = 31 - Math.clz32(_r1154 & -_r1154);
              sealNote_f1146[_e1149] = _d1150;
              for (let _j1152 = 0; _j1152 < _i1151; _j1152++) {
                const _y1156 = _a1145[_j1152];
                if (!(((((_k720[v_c] ?? arms(sp, cl, v_c)) === 2) && (sealNote_f1146[_e1149] === 1)) && (sealNote_f1146[_y1156] === 1)))) continue;
                if (!((bent(sp, _e1149, _y1156) === (clueAt(cl.piece, v_c) === 3)))) continue V1153;
              }
              for (let _j1152 = 0; _j1152 < _i1151; _j1152++) {
                const _y1157 = _a1145[_j1152];
                if (!(((((sealNote_f1146[_e1149] === 1) && (sealNote_f1146[_y1157] === 1)) && !((b.grid[_e1149] !== 0))) && !((b.grid[_y1157] !== 0))))) continue;
                if (!(!(_eg757.of((sp.edgeEnds[2 * _y1157] === v_c ? sp.edgeEnds[2 * _y1157 + 1] : sp.edgeEnds[2 * _y1157])) === _eg757.of((sp.edgeEnds[2 * _e1149] === v_c ? sp.edgeEnds[2 * _e1149 + 1] : sp.edgeEnds[2 * _e1149]))))) continue V1153;
              }
              break;
            }
            if (_r1154 === 0) {
              _s1148[_i1151] = 0;
              _i1151--;
              continue;
            }
            _s1148[_i1151] = _d1150;
            if (_i1151 === _a1145.length - 1) break;
            _i1151++;
            _s1148[_i1151] = 0;
          }
          if (_i1151 < 0) break;
          let _g1158 = 0;
          G1159: {
            const _a1160 = sp.cellEdges[v_c];
            for (let _i1161 = 0; _i1161 < _a1160.length; _i1161++) {
              const v_x = _a1160[_i1161];
              if (!((sealNote_f1146[v_x] === 1))) continue;
              _g1158++;
            }
          }
          let _c1166: boolean = (_g1158 === (_k720[v_c] ?? arms(sp, cl, v_c)));
          if (_c1166) {
            let _q1162 = true;
            Q1163: {
              const _a1164 = sp.cellEdges[v_c];
              for (let _i1165 = 0; _i1165 < _a1164.length; _i1165++) {
                const v_x = _a1164[_i1165];
                if (!(((sealNote_f1146[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg757.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q1162 = false;
                  break Q1163;
                }
              }
            }
            _c1166 = _q1162;
          }
          let _c1347: boolean = _c1166;
          if (_c1347) {
            let _q1167 = false;
            Q1168: {
              const _a1169 = sp.cellEdges[v_c];
              for (let _i1170 = 0; _i1170 < _a1169.length; _i1170++) {
                const v_x = _a1169[_i1170];
                if (!((sealNote_f1146[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q1167 = true;
                  break Q1168;
                }
              }
            }
            let _c1346: boolean = _q1167;
            if (!_c1346) {
              _g1171.length = 0;
              sealNote_st1254.pass++;
              G1172: {
                const _a1255 = sp.cellEdges[v_c];
                for (let _i1256 = 0; _i1256 < _a1255.length; _i1256++) {
                  const v_x = _a1255[_i1256];
                  if (!((sealNote_f1146[v_x] === 1))) continue;
                  const _t1257 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h1319 = minus(_h903, sp.cellEdges[_t1257]);
                  const _eg1321 = edgeGroups(sp, _h1319);
                  const _memo1324 = new Map<readonly number[], readonly number[]>();
                  _g1258.length = 0;
                  sealNote_st1297.pass++;
                  G1259: {
                    const _a1298 = sp.cellEdges[_t1257];
                    for (let _i1299 = 0; _i1299 < _a1298.length; _i1299++) {
                      const v_y = _a1298[_i1299];
                      let _c1318: boolean = (v_y !== v_x);
                      if (_c1318) {
                        let _q1300 = false;
                        Q1301: {
                          const _a1302 = sp.cellEdges[_t1257];
                          for (const _e1306 of sealNote_l1304) sealNote_f1303[_e1306] = -1;
                          sealNote_l1304 = _a1302;
                          let _i1308 = 0;
                          _s1305[0] = 0;
                          let _o1312 = _a1302.length === 0;
                          for (;;) {
                            if (_a1302.length === 0) {
                              if (!_o1312) break;
                              _o1312 = false;
                            }
                            while (_a1302.length > 0 && _i1308 >= 0) {
                              const _e1306 = _a1302[_i1308];
                              if (_s1305[_i1308] > 0) sealNote_f1303[_e1306] = -1;
                              let _r1311 = (cands[_e1306] >= 0 ? cands[_e1306] : (cands[_e1306] = b.cands[_e1306])) & ~((2 << _s1305[_i1308]) - 1);
                              let _d1307 = 0;
                              V1310: for (; _r1311 !== 0; _r1311 &= _r1311 - 1) {
                                _d1307 = 31 - Math.clz32(_r1311 & -_r1311);
                                sealNote_f1303[_e1306] = _d1307;
                                if (_e1306 === v_x && _d1307 !== 1) continue;
                                if (_e1306 === v_y && _d1307 !== 1) continue;
                                for (let _j1309 = 0; _j1309 < _i1308; _j1309++) {
                                  const _y1313 = _a1302[_j1309];
                                  if (!(((((_k720[_t1257] ?? arms(sp, cl, _t1257)) === 2) && (sealNote_f1303[_e1306] === 1)) && (sealNote_f1303[_y1313] === 1)))) continue;
                                  if (!((bent(sp, _e1306, _y1313) === (clueAt(cl.piece, _t1257) === 3)))) continue V1310;
                                }
                                break;
                              }
                              if (_r1311 === 0) {
                                _s1305[_i1308] = 0;
                                _i1308--;
                                continue;
                              }
                              _s1305[_i1308] = _d1307;
                              if (_i1308 === _a1302.length - 1) break;
                              _i1308++;
                              _s1305[_i1308] = 0;
                            }
                            if (_i1308 < 0) break;
                            let _g1314 = 0;
                            G1315: {
                              const _a1316 = sp.cellEdges[_t1257];
                              for (let _i1317 = 0; _i1317 < _a1316.length; _i1317++) {
                                const v_z = _a1316[_i1317];
                                if (!((sealNote_f1303[v_z] === 1))) continue;
                                _g1314++;
                              }
                            }
                            if (!((_g1314 === (_k720[_t1257] ?? arms(sp, cl, _t1257))))) continue;
                            if (true) {
                              _q1300 = true;
                              break Q1301;
                            }
                          }
                        }
                        _c1318 = _q1300;
                      }
                      if (!(_c1318)) continue;
                      const _t1320 = (sp.edgeEnds[2 * v_y] === _t1257 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t1323 = _eg1321.of(_t1320);
                      let _gs1325 = _memo1324.get(_t1323);
                      if (_gs1325 === undefined) {
                        _g1326.length = 0;
                        sealNote_st1333.pass++;
                        G1327: {
                          const _a1334 = _t1323;
                          for (let _i1335 = 0; _i1335 < _a1334.length; _i1335++) {
                            const v_t = _a1334[_i1335];
                            if (!(((_k720[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a1336 = sp.cellEdges[v_t];
                            for (let _i1337 = 0; _i1337 < _a1336.length; _i1337++) {
                              const v_y = _a1336[_i1337];
                              L1338: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k720[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm924[v_y + 1] === 1)))) break L1338;
                                const _t1339 = v_z;
                                if (_g1326.length < 16) { if (!_g1326.includes(_t1339)) _g1326.push(_t1339); } else addOnce(_g1326, sealNote_st1333, _t1339);
                              }
                            }
                          }
                        }
                        _gs1325 = _g1326.slice();
                        _memo1324.set(_t1323, _gs1325);
                      }
                      const _a1340 = union(_eg1321.of(_t1320), _gs1325);
                      for (let _i1341 = 0; _i1341 < _a1340.length; _i1341++) {
                        const v_t = _a1340[_i1341];
                        const _t1342 = v_t;
                        if (_g1258.length < 16) { if (!_g1258.includes(_t1342)) _g1258.push(_t1342); } else addOnce(_g1258, sealNote_st1297, _t1342);
                      }
                    }
                  }
                  const _a1343 = union(setOf(_t1257), _g1258);
                  for (let _i1344 = 0; _i1344 < _a1343.length; _i1344++) {
                    const v_t = _a1343[_i1344];
                    const _t1345 = v_t;
                    if (_g1171.length < 16) { if (!_g1171.includes(_t1345)) _g1171.push(_t1345); } else addOnce(_g1171, sealNote_st1254, _t1345);
                  }
                }
              }
              _c1346 = (union(setOf(v_c), _g1171).length >= _h929);
            }
            _c1347 = _c1346;
          }
          if (!(_c1347)) continue;
          if (!(true)) continue;
          sealNote_l1141 = _a1145;
          _y1142 = true;
          for (const _e1144 of _a1145) sealNote_p1140[_e1144] |= 1 << sealNote_f1146[_e1144];
        }
      }
      L1348: {
        const v_B = ((((sealNote_p1140[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y1142 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L1348;
        if (b.made[0] !== _m2003_0 || b.made[1] !== _m2004_1) {
          _g1349.length = 0;
          G1350: {
            const _a1353 = sp.edges;
            for (let _i1354 = 0; _i1354 < _a1353.length; _i1354++) {
              const v_e = _a1353[_i1354];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1349.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g1349))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g1355: number[] = [];
          G1356: {
            const _a1359 = sp.edges;
            for (let _i1360 = 0; _i1360 < _a1359.length; _i1360++) {
              const v_e = _a1359[_i1360];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1355.push(v_e);
            }
          }
          const _g1361: number[] = [];
          G1362: {
            const _a1404 = sp.edges;
            for (let _i1405 = 0; _i1405 < _a1404.length; _i1405++) {
              const v_e = _a1404[_i1405];
              const _t1406 = sp.edgeEnds[2 * v_e];
              let _q1407 = false;
              Q1408: {
                const _f1410 = new Int32Array(sp.edges.length).fill(-1);
                let _l1411: readonly number[] = [];
                const _s1412: number[] = [];
                const _a1409 = sp.cellEdges[_t1406];
                for (const _e1413 of _l1411) _f1410[_e1413] = -1;
                _l1411 = _a1409;
                let _i1415 = 0;
                _s1412[0] = 0;
                let _o1419 = _a1409.length === 0;
                for (;;) {
                  if (_a1409.length === 0) {
                    if (!_o1419) break;
                    _o1419 = false;
                  }
                  while (_a1409.length > 0 && _i1415 >= 0) {
                    const _e1413 = _a1409[_i1415];
                    if (_s1412[_i1415] > 0) _f1410[_e1413] = -1;
                    let _r1418 = (cands[_e1413] >= 0 ? cands[_e1413] : (cands[_e1413] = b.cands[_e1413])) & ~((2 << _s1412[_i1415]) - 1);
                    let _d1414 = 0;
                    V1417: for (; _r1418 !== 0; _r1418 &= _r1418 - 1) {
                      _d1414 = 31 - Math.clz32(_r1418 & -_r1418);
                      _f1410[_e1413] = _d1414;
                      if (_e1413 === v_e && _d1414 !== 1) continue;
                      for (let _j1416 = 0; _j1416 < _i1415; _j1416++) {
                        const _y1420 = _a1409[_j1416];
                        if (!((((arms(sp, cl, _t1406) === 2) && (_f1410[_e1413] === 1)) && (_f1410[_y1420] === 1)))) continue;
                        if (!((bent(sp, _e1413, _y1420) === (clueAt(cl.piece, _t1406) === 3)))) continue V1417;
                      }
                      break;
                    }
                    if (_r1418 === 0) {
                      _s1412[_i1415] = 0;
                      _i1415--;
                      continue;
                    }
                    _s1412[_i1415] = _d1414;
                    if (_i1415 === _a1409.length - 1) break;
                    _i1415++;
                    _s1412[_i1415] = 0;
                  }
                  if (_i1415 < 0) break;
                  let _g1421 = 0;
                  G1422: {
                    const _a1423 = sp.cellEdges[_t1406];
                    for (let _i1424 = 0; _i1424 < _a1423.length; _i1424++) {
                      const v_x = _a1423[_i1424];
                      if (!((_f1410[v_x] === 1))) continue;
                      _g1421++;
                    }
                  }
                  if (!((_g1421 === arms(sp, cl, _t1406)))) continue;
                  if (true) {
                    _q1407 = true;
                    break Q1408;
                  }
                }
              }
              let _c1444: boolean = _q1407;
              if (_c1444) {
                const _t1425 = sp.edgeEnds[2 * v_e + 1];
                let _q1426 = false;
                Q1427: {
                  const _f1429 = new Int32Array(sp.edges.length).fill(-1);
                  let _l1430: readonly number[] = [];
                  const _s1431: number[] = [];
                  const _a1428 = sp.cellEdges[_t1425];
                  for (const _e1432 of _l1430) _f1429[_e1432] = -1;
                  _l1430 = _a1428;
                  let _i1434 = 0;
                  _s1431[0] = 0;
                  let _o1438 = _a1428.length === 0;
                  for (;;) {
                    if (_a1428.length === 0) {
                      if (!_o1438) break;
                      _o1438 = false;
                    }
                    while (_a1428.length > 0 && _i1434 >= 0) {
                      const _e1432 = _a1428[_i1434];
                      if (_s1431[_i1434] > 0) _f1429[_e1432] = -1;
                      let _r1437 = (cands[_e1432] >= 0 ? cands[_e1432] : (cands[_e1432] = b.cands[_e1432])) & ~((2 << _s1431[_i1434]) - 1);
                      let _d1433 = 0;
                      V1436: for (; _r1437 !== 0; _r1437 &= _r1437 - 1) {
                        _d1433 = 31 - Math.clz32(_r1437 & -_r1437);
                        _f1429[_e1432] = _d1433;
                        if (_e1432 === v_e && _d1433 !== 1) continue;
                        for (let _j1435 = 0; _j1435 < _i1434; _j1435++) {
                          const _y1439 = _a1428[_j1435];
                          if (!((((arms(sp, cl, _t1425) === 2) && (_f1429[_e1432] === 1)) && (_f1429[_y1439] === 1)))) continue;
                          if (!((bent(sp, _e1432, _y1439) === (clueAt(cl.piece, _t1425) === 3)))) continue V1436;
                        }
                        break;
                      }
                      if (_r1437 === 0) {
                        _s1431[_i1434] = 0;
                        _i1434--;
                        continue;
                      }
                      _s1431[_i1434] = _d1433;
                      if (_i1434 === _a1428.length - 1) break;
                      _i1434++;
                      _s1431[_i1434] = 0;
                    }
                    if (_i1434 < 0) break;
                    let _g1440 = 0;
                    G1441: {
                      const _a1442 = sp.cellEdges[_t1425];
                      for (let _i1443 = 0; _i1443 < _a1442.length; _i1443++) {
                        const v_x = _a1442[_i1443];
                        if (!((_f1429[v_x] === 1))) continue;
                        _g1440++;
                      }
                    }
                    if (!((_g1440 === arms(sp, cl, _t1425)))) continue;
                    if (true) {
                      _q1426 = true;
                      break Q1427;
                    }
                  }
                }
                _c1444 = _q1426;
              }
              if (!(_c1444)) continue;
              _g1361.push(v_e);
            }
          }
          const _g1445: number[] = [];
          G1446: {
            const _a1449 = v_U;
            for (let _i1450 = 0; _i1450 < _a1449.length; _i1450++) {
              const v_e = _a1449[_i1450];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g1445.push(v_e);
            }
          }
          const _g1451: number[] = [];
          G1452: {
            const _a1532 = sp.cellEdges[v_c];
            for (let _i1533 = 0; _i1533 < _a1532.length; _i1533++) {
              const v_x = _a1532[_i1533];
              const _t1534 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g1535: number[] = [];
              G1536: {
                const _a1574 = sp.cellEdges[_t1534];
                for (let _i1575 = 0; _i1575 < _a1574.length; _i1575++) {
                  const v_y = _a1574[_i1575];
                  let _c1594: boolean = (v_y !== v_x);
                  if (_c1594) {
                    let _q1576 = false;
                    Q1577: {
                      const _f1579 = new Int32Array(sp.edges.length).fill(-1);
                      let _l1580: readonly number[] = [];
                      const _s1581: number[] = [];
                      const _a1578 = sp.cellEdges[_t1534];
                      for (const _e1582 of _l1580) _f1579[_e1582] = -1;
                      _l1580 = _a1578;
                      let _i1584 = 0;
                      _s1581[0] = 0;
                      let _o1588 = _a1578.length === 0;
                      for (;;) {
                        if (_a1578.length === 0) {
                          if (!_o1588) break;
                          _o1588 = false;
                        }
                        while (_a1578.length > 0 && _i1584 >= 0) {
                          const _e1582 = _a1578[_i1584];
                          if (_s1581[_i1584] > 0) _f1579[_e1582] = -1;
                          let _r1587 = (cands[_e1582] >= 0 ? cands[_e1582] : (cands[_e1582] = b.cands[_e1582])) & ~((2 << _s1581[_i1584]) - 1);
                          let _d1583 = 0;
                          V1586: for (; _r1587 !== 0; _r1587 &= _r1587 - 1) {
                            _d1583 = 31 - Math.clz32(_r1587 & -_r1587);
                            _f1579[_e1582] = _d1583;
                            if (_e1582 === v_x && _d1583 !== 1) continue;
                            if (_e1582 === v_y && _d1583 !== 1) continue;
                            for (let _j1585 = 0; _j1585 < _i1584; _j1585++) {
                              const _y1589 = _a1578[_j1585];
                              if (!((((arms(sp, cl, _t1534) === 2) && (_f1579[_e1582] === 1)) && (_f1579[_y1589] === 1)))) continue;
                              if (!((bent(sp, _e1582, _y1589) === (clueAt(cl.piece, _t1534) === 3)))) continue V1586;
                            }
                            break;
                          }
                          if (_r1587 === 0) {
                            _s1581[_i1584] = 0;
                            _i1584--;
                            continue;
                          }
                          _s1581[_i1584] = _d1583;
                          if (_i1584 === _a1578.length - 1) break;
                          _i1584++;
                          _s1581[_i1584] = 0;
                        }
                        if (_i1584 < 0) break;
                        let _g1590 = 0;
                        G1591: {
                          const _a1592 = sp.cellEdges[_t1534];
                          for (let _i1593 = 0; _i1593 < _a1592.length; _i1593++) {
                            const v_z = _a1592[_i1593];
                            if (!((_f1579[v_z] === 1))) continue;
                            _g1590++;
                          }
                        }
                        if (!((_g1590 === arms(sp, cl, _t1534)))) continue;
                        if (true) {
                          _q1576 = true;
                          break Q1577;
                        }
                      }
                    }
                    _c1594 = _q1576;
                  }
                  if (!(_c1594)) continue;
                  const _t1595 = (sp.edgeEnds[2 * v_y] === _t1534 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t1596 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t1534]);
                  const _g1597: number[] = [];
                  G1598: {
                    const _a1604 = through(sp, _t1595, _t1596);
                    for (let _i1605 = 0; _i1605 < _a1604.length; _i1605++) {
                      const v_t = _a1604[_i1605];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a1606 = sp.cellEdges[v_t];
                      for (let _i1607 = 0; _i1607 < _a1606.length; _i1607++) {
                        const v_y = _a1606[_i1607];
                        L1608: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L1608;
                          if (!_g1597.includes(v_z)) _g1597.push(v_z);
                        }
                      }
                    }
                  }
                  const _a1609 = union(through(sp, _t1595, _t1596), _g1597);
                  for (let _i1610 = 0; _i1610 < _a1609.length; _i1610++) {
                    const v_t = _a1609[_i1610];
                    if (!_g1535.includes(v_t)) _g1535.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t1534), _g1535)).length >= sp.cells.length))) continue;
              _g1451.push(v_x);
            }
          }
          let _q1611 = false;
          Q1612: {
            const _f1614 = new Int32Array(sp.edges.length).fill(-1);
            let _l1615: readonly number[] = [];
            const _s1616: number[] = [];
            const _a1613 = sp.cellEdges[v_c];
            for (const _e1617 of _l1615) _f1614[_e1617] = -1;
            _l1615 = _a1613;
            let _i1619 = 0;
            _s1616[0] = 0;
            let _o1623 = _a1613.length === 0;
            for (;;) {
              if (_a1613.length === 0) {
                if (!_o1623) break;
                _o1623 = false;
              }
              while (_a1613.length > 0 && _i1619 >= 0) {
                const _e1617 = _a1613[_i1619];
                if (_s1616[_i1619] > 0) _f1614[_e1617] = -1;
                let _r1622 = (cands[_e1617] >= 0 ? cands[_e1617] : (cands[_e1617] = b.cands[_e1617])) & ~((2 << _s1616[_i1619]) - 1);
                let _d1618 = 0;
                V1621: for (; _r1622 !== 0; _r1622 &= _r1622 - 1) {
                  _d1618 = 31 - Math.clz32(_r1622 & -_r1622);
                  _f1614[_e1617] = _d1618;
                  if (_e1617 === v_e && _d1618 !== 1) continue;
                  for (let _j1620 = 0; _j1620 < _i1619; _j1620++) {
                    const _y1624 = _a1613[_j1620];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f1614[_e1617] === 1)) && (_f1614[_y1624] === 1)))) continue;
                    if (!((bent(sp, _e1617, _y1624) === (clueAt(cl.piece, v_c) === 3)))) continue V1621;
                  }
                  for (let _j1620 = 0; _j1620 < _i1619; _j1620++) {
                    const _y1625 = _a1613[_j1620];
                    if (!(((((_f1614[_e1617] === 1) && (_f1614[_y1625] === 1)) && !((b.grid[_e1617] !== 0))) && !((b.grid[_y1625] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e1617] === v_c ? sp.edgeEnds[2 * _e1617 + 1] : sp.edgeEnds[2 * _e1617]), v_L).includes((sp.edgeEnds[2 * _y1625] === v_c ? sp.edgeEnds[2 * _y1625 + 1] : sp.edgeEnds[2 * _y1625]))))) continue V1621;
                  }
                  break;
                }
                if (_r1622 === 0) {
                  _s1616[_i1619] = 0;
                  _i1619--;
                  continue;
                }
                _s1616[_i1619] = _d1618;
                if (_i1619 === _a1613.length - 1) break;
                _i1619++;
                _s1616[_i1619] = 0;
              }
              if (_i1619 < 0) break;
              let _g1626 = 0;
              G1627: {
                const _a1628 = sp.cellEdges[v_c];
                for (let _i1629 = 0; _i1629 < _a1628.length; _i1629++) {
                  const v_x = _a1628[_i1629];
                  if (!((_f1614[v_x] === 1))) continue;
                  _g1626++;
                }
              }
              let _c1634: boolean = (_g1626 === arms(sp, cl, v_c));
              if (_c1634) {
                let _q1630 = true;
                Q1631: {
                  const _a1632 = sp.cellEdges[v_c];
                  for (let _i1633 = 0; _i1633 < _a1632.length; _i1633++) {
                    const v_x = _a1632[_i1633];
                    if (!(((_f1614[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg757.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1630 = false;
                      break Q1631;
                    }
                  }
                }
                _c1634 = _q1630;
              }
              let _c1804: boolean = _c1634;
              if (_c1804) {
                let _q1635 = false;
                Q1636: {
                  const _a1637 = sp.cellEdges[v_c];
                  for (let _i1638 = 0; _i1638 < _a1637.length; _i1638++) {
                    const v_x = _a1637[_i1638];
                    if (!((_f1614[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q1635 = true;
                      break Q1636;
                    }
                  }
                }
                let _c1803: boolean = _q1635;
                if (!_c1803) {
                  const _g1639: number[] = [];
                  G1640: {
                    const _a1722 = sp.cellEdges[v_c];
                    for (let _i1723 = 0; _i1723 < _a1722.length; _i1723++) {
                      const v_x = _a1722[_i1723];
                      if (!((_f1614[v_x] === 1))) continue;
                      const _t1724 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g1725: number[] = [];
                      G1726: {
                        const _a1764 = sp.cellEdges[_t1724];
                        for (let _i1765 = 0; _i1765 < _a1764.length; _i1765++) {
                          const v_y = _a1764[_i1765];
                          let _c1784: boolean = (v_y !== v_x);
                          if (_c1784) {
                            let _q1766 = false;
                            Q1767: {
                              const _f1769 = new Int32Array(sp.edges.length).fill(-1);
                              let _l1770: readonly number[] = [];
                              const _s1771: number[] = [];
                              const _a1768 = sp.cellEdges[_t1724];
                              for (const _e1772 of _l1770) _f1769[_e1772] = -1;
                              _l1770 = _a1768;
                              let _i1774 = 0;
                              _s1771[0] = 0;
                              let _o1778 = _a1768.length === 0;
                              for (;;) {
                                if (_a1768.length === 0) {
                                  if (!_o1778) break;
                                  _o1778 = false;
                                }
                                while (_a1768.length > 0 && _i1774 >= 0) {
                                  const _e1772 = _a1768[_i1774];
                                  if (_s1771[_i1774] > 0) _f1769[_e1772] = -1;
                                  let _r1777 = (cands[_e1772] >= 0 ? cands[_e1772] : (cands[_e1772] = b.cands[_e1772])) & ~((2 << _s1771[_i1774]) - 1);
                                  let _d1773 = 0;
                                  V1776: for (; _r1777 !== 0; _r1777 &= _r1777 - 1) {
                                    _d1773 = 31 - Math.clz32(_r1777 & -_r1777);
                                    _f1769[_e1772] = _d1773;
                                    if (_e1772 === v_x && _d1773 !== 1) continue;
                                    if (_e1772 === v_y && _d1773 !== 1) continue;
                                    for (let _j1775 = 0; _j1775 < _i1774; _j1775++) {
                                      const _y1779 = _a1768[_j1775];
                                      if (!((((arms(sp, cl, _t1724) === 2) && (_f1769[_e1772] === 1)) && (_f1769[_y1779] === 1)))) continue;
                                      if (!((bent(sp, _e1772, _y1779) === (clueAt(cl.piece, _t1724) === 3)))) continue V1776;
                                    }
                                    break;
                                  }
                                  if (_r1777 === 0) {
                                    _s1771[_i1774] = 0;
                                    _i1774--;
                                    continue;
                                  }
                                  _s1771[_i1774] = _d1773;
                                  if (_i1774 === _a1768.length - 1) break;
                                  _i1774++;
                                  _s1771[_i1774] = 0;
                                }
                                if (_i1774 < 0) break;
                                let _g1780 = 0;
                                G1781: {
                                  const _a1782 = sp.cellEdges[_t1724];
                                  for (let _i1783 = 0; _i1783 < _a1782.length; _i1783++) {
                                    const v_z = _a1782[_i1783];
                                    if (!((_f1769[v_z] === 1))) continue;
                                    _g1780++;
                                  }
                                }
                                if (!((_g1780 === arms(sp, cl, _t1724)))) continue;
                                if (true) {
                                  _q1766 = true;
                                  break Q1767;
                                }
                              }
                            }
                            _c1784 = _q1766;
                          }
                          if (!(_c1784)) continue;
                          const _t1785 = (sp.edgeEnds[2 * v_y] === _t1724 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t1786 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t1724]);
                          const _g1787: number[] = [];
                          G1788: {
                            const _a1794 = through(sp, _t1785, _t1786);
                            for (let _i1795 = 0; _i1795 < _a1794.length; _i1795++) {
                              const v_t = _a1794[_i1795];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a1796 = sp.cellEdges[v_t];
                              for (let _i1797 = 0; _i1797 < _a1796.length; _i1797++) {
                                const v_y = _a1796[_i1797];
                                L1798: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L1798;
                                  if (!_g1787.includes(v_z)) _g1787.push(v_z);
                                }
                              }
                            }
                          }
                          const _a1799 = union(through(sp, _t1785, _t1786), _g1787);
                          for (let _i1800 = 0; _i1800 < _a1799.length; _i1800++) {
                            const v_t = _a1799[_i1800];
                            if (!_g1725.includes(v_t)) _g1725.push(v_t);
                          }
                        }
                      }
                      const _a1801 = union(setOf(_t1724), _g1725);
                      for (let _i1802 = 0; _i1802 < _a1801.length; _i1802++) {
                        const v_t = _a1801[_i1802];
                        if (!_g1639.includes(v_t)) _g1639.push(v_t);
                      }
                    }
                  }
                  _c1803 = (union(setOf(v_c), _g1639).length >= sp.cells.length);
                }
                _c1804 = _c1803;
              }
              if (!(_c1804)) continue;
              if (true) {
                _q1611 = true;
                break Q1612;
              }
            }
          }
          let _q1805 = false;
          Q1806: {
            const _f1808 = new Int32Array(sp.edges.length).fill(-1);
            let _l1809: readonly number[] = [];
            const _s1810: number[] = [];
            const _a1807 = sp.cellEdges[v_c];
            for (const _e1811 of _l1809) _f1808[_e1811] = -1;
            _l1809 = _a1807;
            let _i1813 = 0;
            _s1810[0] = 0;
            let _o1817 = _a1807.length === 0;
            for (;;) {
              if (_a1807.length === 0) {
                if (!_o1817) break;
                _o1817 = false;
              }
              while (_a1807.length > 0 && _i1813 >= 0) {
                const _e1811 = _a1807[_i1813];
                if (_s1810[_i1813] > 0) _f1808[_e1811] = -1;
                let _r1816 = (cands[_e1811] >= 0 ? cands[_e1811] : (cands[_e1811] = b.cands[_e1811])) & ~((2 << _s1810[_i1813]) - 1);
                let _d1812 = 0;
                V1815: for (; _r1816 !== 0; _r1816 &= _r1816 - 1) {
                  _d1812 = 31 - Math.clz32(_r1816 & -_r1816);
                  _f1808[_e1811] = _d1812;
                  if (_e1811 === v_e && _d1812 !== 2) continue;
                  for (let _j1814 = 0; _j1814 < _i1813; _j1814++) {
                    const _y1818 = _a1807[_j1814];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f1808[_e1811] === 1)) && (_f1808[_y1818] === 1)))) continue;
                    if (!((bent(sp, _e1811, _y1818) === (clueAt(cl.piece, v_c) === 3)))) continue V1815;
                  }
                  for (let _j1814 = 0; _j1814 < _i1813; _j1814++) {
                    const _y1819 = _a1807[_j1814];
                    if (!(((((_f1808[_e1811] === 1) && (_f1808[_y1819] === 1)) && !((b.grid[_e1811] !== 0))) && !((b.grid[_y1819] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e1811] === v_c ? sp.edgeEnds[2 * _e1811 + 1] : sp.edgeEnds[2 * _e1811]), v_L).includes((sp.edgeEnds[2 * _y1819] === v_c ? sp.edgeEnds[2 * _y1819 + 1] : sp.edgeEnds[2 * _y1819]))))) continue V1815;
                  }
                  break;
                }
                if (_r1816 === 0) {
                  _s1810[_i1813] = 0;
                  _i1813--;
                  continue;
                }
                _s1810[_i1813] = _d1812;
                if (_i1813 === _a1807.length - 1) break;
                _i1813++;
                _s1810[_i1813] = 0;
              }
              if (_i1813 < 0) break;
              let _g1820 = 0;
              G1821: {
                const _a1822 = sp.cellEdges[v_c];
                for (let _i1823 = 0; _i1823 < _a1822.length; _i1823++) {
                  const v_x = _a1822[_i1823];
                  if (!((_f1808[v_x] === 1))) continue;
                  _g1820++;
                }
              }
              let _c1828: boolean = (_g1820 === arms(sp, cl, v_c));
              if (_c1828) {
                let _q1824 = true;
                Q1825: {
                  const _a1826 = sp.cellEdges[v_c];
                  for (let _i1827 = 0; _i1827 < _a1826.length; _i1827++) {
                    const v_x = _a1826[_i1827];
                    if (!(((_f1808[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg757.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1824 = false;
                      break Q1825;
                    }
                  }
                }
                _c1828 = _q1824;
              }
              let _c1998: boolean = _c1828;
              if (_c1998) {
                let _q1829 = false;
                Q1830: {
                  const _a1831 = sp.cellEdges[v_c];
                  for (let _i1832 = 0; _i1832 < _a1831.length; _i1832++) {
                    const v_x = _a1831[_i1832];
                    if (!((_f1808[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q1829 = true;
                      break Q1830;
                    }
                  }
                }
                let _c1997: boolean = _q1829;
                if (!_c1997) {
                  const _g1833: number[] = [];
                  G1834: {
                    const _a1916 = sp.cellEdges[v_c];
                    for (let _i1917 = 0; _i1917 < _a1916.length; _i1917++) {
                      const v_x = _a1916[_i1917];
                      if (!((_f1808[v_x] === 1))) continue;
                      const _t1918 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g1919: number[] = [];
                      G1920: {
                        const _a1958 = sp.cellEdges[_t1918];
                        for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
                          const v_y = _a1958[_i1959];
                          let _c1978: boolean = (v_y !== v_x);
                          if (_c1978) {
                            let _q1960 = false;
                            Q1961: {
                              const _f1963 = new Int32Array(sp.edges.length).fill(-1);
                              let _l1964: readonly number[] = [];
                              const _s1965: number[] = [];
                              const _a1962 = sp.cellEdges[_t1918];
                              for (const _e1966 of _l1964) _f1963[_e1966] = -1;
                              _l1964 = _a1962;
                              let _i1968 = 0;
                              _s1965[0] = 0;
                              let _o1972 = _a1962.length === 0;
                              for (;;) {
                                if (_a1962.length === 0) {
                                  if (!_o1972) break;
                                  _o1972 = false;
                                }
                                while (_a1962.length > 0 && _i1968 >= 0) {
                                  const _e1966 = _a1962[_i1968];
                                  if (_s1965[_i1968] > 0) _f1963[_e1966] = -1;
                                  let _r1971 = (cands[_e1966] >= 0 ? cands[_e1966] : (cands[_e1966] = b.cands[_e1966])) & ~((2 << _s1965[_i1968]) - 1);
                                  let _d1967 = 0;
                                  V1970: for (; _r1971 !== 0; _r1971 &= _r1971 - 1) {
                                    _d1967 = 31 - Math.clz32(_r1971 & -_r1971);
                                    _f1963[_e1966] = _d1967;
                                    if (_e1966 === v_x && _d1967 !== 1) continue;
                                    if (_e1966 === v_y && _d1967 !== 1) continue;
                                    for (let _j1969 = 0; _j1969 < _i1968; _j1969++) {
                                      const _y1973 = _a1962[_j1969];
                                      if (!((((arms(sp, cl, _t1918) === 2) && (_f1963[_e1966] === 1)) && (_f1963[_y1973] === 1)))) continue;
                                      if (!((bent(sp, _e1966, _y1973) === (clueAt(cl.piece, _t1918) === 3)))) continue V1970;
                                    }
                                    break;
                                  }
                                  if (_r1971 === 0) {
                                    _s1965[_i1968] = 0;
                                    _i1968--;
                                    continue;
                                  }
                                  _s1965[_i1968] = _d1967;
                                  if (_i1968 === _a1962.length - 1) break;
                                  _i1968++;
                                  _s1965[_i1968] = 0;
                                }
                                if (_i1968 < 0) break;
                                let _g1974 = 0;
                                G1975: {
                                  const _a1976 = sp.cellEdges[_t1918];
                                  for (let _i1977 = 0; _i1977 < _a1976.length; _i1977++) {
                                    const v_z = _a1976[_i1977];
                                    if (!((_f1963[v_z] === 1))) continue;
                                    _g1974++;
                                  }
                                }
                                if (!((_g1974 === arms(sp, cl, _t1918)))) continue;
                                if (true) {
                                  _q1960 = true;
                                  break Q1961;
                                }
                              }
                            }
                            _c1978 = _q1960;
                          }
                          if (!(_c1978)) continue;
                          const _t1979 = (sp.edgeEnds[2 * v_y] === _t1918 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t1980 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t1918]);
                          const _g1981: number[] = [];
                          G1982: {
                            const _a1988 = through(sp, _t1979, _t1980);
                            for (let _i1989 = 0; _i1989 < _a1988.length; _i1989++) {
                              const v_t = _a1988[_i1989];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a1990 = sp.cellEdges[v_t];
                              for (let _i1991 = 0; _i1991 < _a1990.length; _i1991++) {
                                const v_y = _a1990[_i1991];
                                L1992: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L1992;
                                  if (!_g1981.includes(v_z)) _g1981.push(v_z);
                                }
                              }
                            }
                          }
                          const _a1993 = union(through(sp, _t1979, _t1980), _g1981);
                          for (let _i1994 = 0; _i1994 < _a1993.length; _i1994++) {
                            const v_t = _a1993[_i1994];
                            if (!_g1919.includes(v_t)) _g1919.push(v_t);
                          }
                        }
                      }
                      const _a1995 = union(setOf(_t1918), _g1919);
                      for (let _i1996 = 0; _i1996 < _a1995.length; _i1996++) {
                        const v_t = _a1995[_i1996];
                        if (!_g1833.includes(v_t)) _g1833.push(v_t);
                      }
                    }
                  }
                  _c1997 = (union(setOf(v_c), _g1833).length >= sp.cells.length);
                }
                _c1998 = _c1997;
              }
              if (!(_c1998)) continue;
              if (true) {
                _q1805 = true;
                break Q1806;
              }
            }
          }
          freshBinding("sealNote", [sameSet(v_L, _g1355), sameSet(v_U, _g1361), sameSet(v_P, _g1445), (sp.cells.includes(v_c)), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g1451), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q1611), (v_B === _q1805), (!(v_A) || !(v_B))], ["L =", "U =", "P =", "c in", "G =", "K =", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c2000: boolean = (v_A || v_B);
        if (_c2000) {
          let _c1999: boolean = !(!(v_A));
          if (!_c1999) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c1999 = true;
          }
          _c2000 = _c1999;
        }
        let _c2002: boolean = _c2000;
        if (_c2002) {
          let _c2001: boolean = !(!(v_B));
          if (!_c2001) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c2001 = true;
          }
          _c2002 = _c2001;
        }
        if (!(_c2002)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, G: v_G.slice(), K: v_K.slice(), e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface StrandLockBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  F: readonly number[];
  G: readonly number[];
  K: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const strandLockFacts: number[] = [];
let strandLockCands = new Int32Array(0);
let strandLock_f1298 = new Int32Array(0);
let strandLock_l1299: readonly number[] = [];
let strandLock_f1318 = new Int32Array(0);
let strandLock_l1319: readonly number[] = [];
const strandLock_st1474 = stamps();
let strandLock_f1480 = new Int32Array(0);
let strandLock_l1481: readonly number[] = [];
const strandLock_st1511 = stamps();
let strandLock_p1769 = new Int32Array(0);
let strandLock_l1770: readonly number[] = [];
let strandLock_f1775 = new Int32Array(0);
let strandLock_l1776: readonly number[] = [];
const strandLock_st1883 = stamps();
const strandLock_st1926 = stamps();
let strandLock_f1932 = new Int32Array(0);
let strandLock_l1933: readonly number[] = [];
const strandLock_st1962 = stamps();
let strandLock_f1996 = new Int32Array(0);
let strandLock_l1997: readonly number[] = [];
let strandLock_p2270 = new Int32Array(0);
let strandLock_l2271: readonly number[] = [];
let strandLock_f2276 = new Int32Array(0);
let strandLock_l2277: readonly number[] = [];
const strandLock_st2384 = stamps();
const strandLock_st2427 = stamps();
let strandLock_f2433 = new Int32Array(0);
let strandLock_l2434: readonly number[] = [];
const strandLock_st2463 = stamps();
let strandLock_f2497 = new Int32Array(0);
let strandLock_l2498: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandLockBinding> | null): number {
  const _g1243: number[] = [];
  const _g1249: number[] = [];
  if (strandLock_f1298.length < sp.edges.length) strandLock_f1298 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f1298.fill(-1);
  strandLock_l1299 = [];
  const _s1300: number[] = [];
  if (strandLock_f1318.length < sp.edges.length) strandLock_f1318 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f1318.fill(-1);
  strandLock_l1319 = [];
  const _s1320: number[] = [];
  const _g1334: number[] = [];
  const _g1342: number[] = [];
  const _g1351: number[] = [];
  const _g1435: number[] = [];
  if (strandLock_f1480.length < sp.edges.length) strandLock_f1480 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f1480.fill(-1);
  strandLock_l1481 = [];
  const _s1482: number[] = [];
  const _g1504: number[] = [];
  const _g1523: number[] = [];
  if (strandLock_p1769.length < sp.edges.length) strandLock_p1769 = new Int32Array(sp.edges.length);
  else strandLock_p1769.fill(0);
  strandLock_l1770 = [];
  let _y1771 = false;
  if (strandLock_f1775.length < sp.edges.length) strandLock_f1775 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f1775.fill(-1);
  strandLock_l1776 = [];
  const _s1777: number[] = [];
  const _g1800: number[] = [];
  const _g1887: number[] = [];
  if (strandLock_f1932.length < sp.edges.length) strandLock_f1932 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f1932.fill(-1);
  strandLock_l1933 = [];
  const _s1934: number[] = [];
  const _g1955: number[] = [];
  const _g1979: number[] = [];
  if (strandLock_f1996.length < sp.edges.length) strandLock_f1996 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f1996.fill(-1);
  strandLock_l1997 = [];
  const _s1998: number[] = [];
  const _g2024: number[] = [];
  if (strandLock_p2270.length < sp.edges.length) strandLock_p2270 = new Int32Array(sp.edges.length);
  else strandLock_p2270.fill(0);
  strandLock_l2271 = [];
  let _y2272 = false;
  if (strandLock_f2276.length < sp.edges.length) strandLock_f2276 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f2276.fill(-1);
  strandLock_l2277 = [];
  const _s2278: number[] = [];
  const _g2301: number[] = [];
  const _g2388: number[] = [];
  if (strandLock_f2433.length < sp.edges.length) strandLock_f2433 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f2433.fill(-1);
  strandLock_l2434 = [];
  const _s2435: number[] = [];
  const _g2456: number[] = [];
  const _g2480: number[] = [];
  if (strandLock_f2497.length < sp.edges.length) strandLock_f2497 = new Int32Array(sp.edges.length).fill(-1);
  else strandLock_f2497.fill(-1);
  strandLock_l2498 = [];
  const _s2499: number[] = [];
  const _g2530: number[] = [];
  const facts = strandLockFacts;
  let fired = 0;
  let changed = false;
  const _k1309 = armsKept.board(cl);
  const _h1522 = sp.cells.length;
  let _epoch = 0;
  if (strandLockCands.length < sp.edges.length) strandLockCands = new Int32Array(sp.edges.length);
  const cands = strandLockCands;
  cands.fill(-1);
  const _m3782_0 = b.made[0];
  _g1243.length = 0;
  G1244: {
    const _a1247 = sp.edges;
    for (let _i1248 = 0; _i1248 < _a1247.length; _i1248++) {
      const v_e = _a1247[_i1248];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1243.push(v_e);
    }
  }
  const v_L = _g1243;
  const _m3783_1 = b.made[1];
  const _eg1350 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1249.length = 0;
  G1250: {
    const _a1292 = sp.edges;
    for (let _i1293 = 0; _i1293 < _a1292.length; _i1293++) {
      const v_e = _a1292[_i1293];
      const _t1294 = sp.edgeEnds[2 * v_e];
      let _q1295 = false;
      Q1296: {
        const _a1297 = sp.cellEdges[_t1294];
        for (const _e1301 of strandLock_l1299) strandLock_f1298[_e1301] = -1;
        strandLock_l1299 = _a1297;
        let _i1303 = 0;
        _s1300[0] = 0;
        let _o1307 = _a1297.length === 0;
        for (;;) {
          if (_a1297.length === 0) {
            if (!_o1307) break;
            _o1307 = false;
          }
          while (_a1297.length > 0 && _i1303 >= 0) {
            const _e1301 = _a1297[_i1303];
            if (_s1300[_i1303] > 0) strandLock_f1298[_e1301] = -1;
            let _r1306 = (cands[_e1301] >= 0 ? cands[_e1301] : (cands[_e1301] = b.cands[_e1301])) & ~((2 << _s1300[_i1303]) - 1);
            let _d1302 = 0;
            V1305: for (; _r1306 !== 0; _r1306 &= _r1306 - 1) {
              _d1302 = 31 - Math.clz32(_r1306 & -_r1306);
              strandLock_f1298[_e1301] = _d1302;
              if (_e1301 === v_e && _d1302 !== 1) continue;
              for (let _j1304 = 0; _j1304 < _i1303; _j1304++) {
                const _y1308 = _a1297[_j1304];
                if (!(((((_k1309[_t1294] ?? arms(sp, cl, _t1294)) === 2) && (strandLock_f1298[_e1301] === 1)) && (strandLock_f1298[_y1308] === 1)))) continue;
                if (!((bent(sp, _e1301, _y1308) === (clueAt(cl.piece, _t1294) === 3)))) continue V1305;
              }
              break;
            }
            if (_r1306 === 0) {
              _s1300[_i1303] = 0;
              _i1303--;
              continue;
            }
            _s1300[_i1303] = _d1302;
            if (_i1303 === _a1297.length - 1) break;
            _i1303++;
            _s1300[_i1303] = 0;
          }
          if (_i1303 < 0) break;
          let _g1310 = 0;
          G1311: {
            const _a1312 = sp.cellEdges[_t1294];
            for (let _i1313 = 0; _i1313 < _a1312.length; _i1313++) {
              const v_x = _a1312[_i1313];
              if (!((strandLock_f1298[v_x] === 1))) continue;
              _g1310++;
            }
          }
          if (!((_g1310 === (_k1309[_t1294] ?? arms(sp, cl, _t1294))))) continue;
          if (true) {
            _q1295 = true;
            break Q1296;
          }
        }
      }
      let _c1333: boolean = _q1295;
      if (_c1333) {
        const _t1314 = sp.edgeEnds[2 * v_e + 1];
        let _q1315 = false;
        Q1316: {
          const _a1317 = sp.cellEdges[_t1314];
          for (const _e1321 of strandLock_l1319) strandLock_f1318[_e1321] = -1;
          strandLock_l1319 = _a1317;
          let _i1323 = 0;
          _s1320[0] = 0;
          let _o1327 = _a1317.length === 0;
          for (;;) {
            if (_a1317.length === 0) {
              if (!_o1327) break;
              _o1327 = false;
            }
            while (_a1317.length > 0 && _i1323 >= 0) {
              const _e1321 = _a1317[_i1323];
              if (_s1320[_i1323] > 0) strandLock_f1318[_e1321] = -1;
              let _r1326 = (cands[_e1321] >= 0 ? cands[_e1321] : (cands[_e1321] = b.cands[_e1321])) & ~((2 << _s1320[_i1323]) - 1);
              let _d1322 = 0;
              V1325: for (; _r1326 !== 0; _r1326 &= _r1326 - 1) {
                _d1322 = 31 - Math.clz32(_r1326 & -_r1326);
                strandLock_f1318[_e1321] = _d1322;
                if (_e1321 === v_e && _d1322 !== 1) continue;
                for (let _j1324 = 0; _j1324 < _i1323; _j1324++) {
                  const _y1328 = _a1317[_j1324];
                  if (!(((((_k1309[_t1314] ?? arms(sp, cl, _t1314)) === 2) && (strandLock_f1318[_e1321] === 1)) && (strandLock_f1318[_y1328] === 1)))) continue;
                  if (!((bent(sp, _e1321, _y1328) === (clueAt(cl.piece, _t1314) === 3)))) continue V1325;
                }
                break;
              }
              if (_r1326 === 0) {
                _s1320[_i1323] = 0;
                _i1323--;
                continue;
              }
              _s1320[_i1323] = _d1322;
              if (_i1323 === _a1317.length - 1) break;
              _i1323++;
              _s1320[_i1323] = 0;
            }
            if (_i1323 < 0) break;
            let _g1329 = 0;
            G1330: {
              const _a1331 = sp.cellEdges[_t1314];
              for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
                const v_x = _a1331[_i1332];
                if (!((strandLock_f1318[v_x] === 1))) continue;
                _g1329++;
              }
            }
            if (!((_g1329 === (_k1309[_t1314] ?? arms(sp, cl, _t1314))))) continue;
            if (true) {
              _q1315 = true;
              break Q1316;
            }
          }
        }
        _c1333 = _q1315;
      }
      if (!(_c1333)) continue;
      _g1249.push(v_e);
    }
  }
  const v_U = _g1249;
  const _mm1517 = memberMarks(v_U);
  _g1334.length = 0;
  G1335: {
    const _a1338 = v_U;
    for (let _i1339 = 0; _i1339 < _a1338.length; _i1339++) {
      const v_e = _a1338[_i1339];
      if (!((((_k1309[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k1309[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g1334.push(v_e);
    }
  }
  const v_P = _g1334;
  const _a1340 = sp.cells;
  for (let _i1341 = 0; _i1341 < _a1340.length; _i1341++) {
    const v_c = _a1340[_i1341];
    const _h1496 = minus(v_P, sp.cellEdges[v_c]);
    _g1342.length = 0;
    G1343: {
      const _a1346 = sp.cellEdges[v_c];
      for (let _i1347 = 0; _i1347 < _a1346.length; _i1347++) {
        const v_e = _a1346[_i1347];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1342.push(v_e);
      }
    }
    L1348: {
      const v_F = _g1342;
      const _h1349 = v_F.length;
      if (!((_h1349 > 0))) break L1348;
      const v_G = _eg1350.of(v_c);
      _g1351.length = 0;
      G1352: {
        const _a1432 = sp.cellEdges[v_c];
        for (let _i1433 = 0; _i1433 < _a1432.length; _i1433++) {
          const v_x = _a1432[_i1433];
          const _t1434 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h1497 = minus(_h1496, sp.cellEdges[_t1434]);
          const _eg1499 = edgeGroups(sp, _h1497);
          const _memo1502 = new Map<readonly number[], readonly number[]>();
          _g1435.length = 0;
          strandLock_st1474.pass++;
          G1436: {
            const _a1475 = sp.cellEdges[_t1434];
            for (let _i1476 = 0; _i1476 < _a1475.length; _i1476++) {
              const v_y = _a1475[_i1476];
              let _c1495: boolean = (v_y !== v_x);
              if (_c1495) {
                let _q1477 = false;
                Q1478: {
                  const _a1479 = sp.cellEdges[_t1434];
                  for (const _e1483 of strandLock_l1481) strandLock_f1480[_e1483] = -1;
                  strandLock_l1481 = _a1479;
                  let _i1485 = 0;
                  _s1482[0] = 0;
                  let _o1489 = _a1479.length === 0;
                  for (;;) {
                    if (_a1479.length === 0) {
                      if (!_o1489) break;
                      _o1489 = false;
                    }
                    while (_a1479.length > 0 && _i1485 >= 0) {
                      const _e1483 = _a1479[_i1485];
                      if (_s1482[_i1485] > 0) strandLock_f1480[_e1483] = -1;
                      let _r1488 = (cands[_e1483] >= 0 ? cands[_e1483] : (cands[_e1483] = b.cands[_e1483])) & ~((2 << _s1482[_i1485]) - 1);
                      let _d1484 = 0;
                      V1487: for (; _r1488 !== 0; _r1488 &= _r1488 - 1) {
                        _d1484 = 31 - Math.clz32(_r1488 & -_r1488);
                        strandLock_f1480[_e1483] = _d1484;
                        if (_e1483 === v_x && _d1484 !== 1) continue;
                        if (_e1483 === v_y && _d1484 !== 1) continue;
                        for (let _j1486 = 0; _j1486 < _i1485; _j1486++) {
                          const _y1490 = _a1479[_j1486];
                          if (!(((((_k1309[_t1434] ?? arms(sp, cl, _t1434)) === 2) && (strandLock_f1480[_e1483] === 1)) && (strandLock_f1480[_y1490] === 1)))) continue;
                          if (!((bent(sp, _e1483, _y1490) === (clueAt(cl.piece, _t1434) === 3)))) continue V1487;
                        }
                        break;
                      }
                      if (_r1488 === 0) {
                        _s1482[_i1485] = 0;
                        _i1485--;
                        continue;
                      }
                      _s1482[_i1485] = _d1484;
                      if (_i1485 === _a1479.length - 1) break;
                      _i1485++;
                      _s1482[_i1485] = 0;
                    }
                    if (_i1485 < 0) break;
                    let _g1491 = 0;
                    G1492: {
                      const _a1493 = sp.cellEdges[_t1434];
                      for (let _i1494 = 0; _i1494 < _a1493.length; _i1494++) {
                        const v_z = _a1493[_i1494];
                        if (!((strandLock_f1480[v_z] === 1))) continue;
                        _g1491++;
                      }
                    }
                    if (!((_g1491 === (_k1309[_t1434] ?? arms(sp, cl, _t1434))))) continue;
                    if (true) {
                      _q1477 = true;
                      break Q1478;
                    }
                  }
                }
                _c1495 = _q1477;
              }
              if (!(_c1495)) continue;
              const _t1498 = (sp.edgeEnds[2 * v_y] === _t1434 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t1501 = _eg1499.of(_t1498);
              let _gs1503 = _memo1502.get(_t1501);
              if (_gs1503 === undefined) {
                _g1504.length = 0;
                strandLock_st1511.pass++;
                G1505: {
                  const _a1512 = _t1501;
                  for (let _i1513 = 0; _i1513 < _a1512.length; _i1513++) {
                    const v_t = _a1512[_i1513];
                    if (!(((_k1309[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a1514 = sp.cellEdges[v_t];
                    for (let _i1515 = 0; _i1515 < _a1514.length; _i1515++) {
                      const v_y = _a1514[_i1515];
                      L1516: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k1309[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1517[v_y + 1] === 1)))) break L1516;
                        const _t1518 = v_z;
                        if (_g1504.length < 16) { if (!_g1504.includes(_t1518)) _g1504.push(_t1518); } else addOnce(_g1504, strandLock_st1511, _t1518);
                      }
                    }
                  }
                }
                _gs1503 = _g1504.slice();
                _memo1502.set(_t1501, _gs1503);
              }
              const _a1519 = union(_eg1499.of(_t1498), _gs1503);
              for (let _i1520 = 0; _i1520 < _a1519.length; _i1520++) {
                const v_t = _a1519[_i1520];
                const _t1521 = v_t;
                if (_g1435.length < 16) { if (!_g1435.includes(_t1521)) _g1435.push(_t1521); } else addOnce(_g1435, strandLock_st1474, _t1521);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t1434), _g1435)).length >= _h1522))) continue;
          _g1351.push(v_x);
        }
      }
      const v_K = _g1351;
      let _g1772 = -1;
      let _g2273 = -1;
      _g1523.length = 0;
      G1524: {
        const _a1767 = v_F;
        for (let _i1768 = 0; _i1768 < _a1767.length; _i1768++) {
          const v_e = _a1767[_i1768];
          if (_g1772 !== _epoch) {
            _g1772 = _epoch;
            for (const _e1773 of strandLock_l1770) strandLock_p1769[_e1773] = 0;
            _y1771 = false;
            const _a1774 = sp.cellEdges[v_c];
            for (const _e1778 of strandLock_l1776) strandLock_f1775[_e1778] = -1;
            strandLock_l1776 = _a1774;
            let _i1780 = 0;
            _s1777[0] = 0;
            let _o1784 = _a1774.length === 0;
            for (;;) {
              if (_a1774.length === 0) {
                if (!_o1784) break;
                _o1784 = false;
              }
              while (_a1774.length > 0 && _i1780 >= 0) {
                const _e1778 = _a1774[_i1780];
                if (_s1777[_i1780] > 0) strandLock_f1775[_e1778] = -1;
                let _r1783 = (cands[_e1778] >= 0 ? cands[_e1778] : (cands[_e1778] = b.cands[_e1778])) & ~((2 << _s1777[_i1780]) - 1);
                let _d1779 = 0;
                V1782: for (; _r1783 !== 0; _r1783 &= _r1783 - 1) {
                  _d1779 = 31 - Math.clz32(_r1783 & -_r1783);
                  strandLock_f1775[_e1778] = _d1779;
                  for (let _j1781 = 0; _j1781 < _i1780; _j1781++) {
                    const _y1785 = _a1774[_j1781];
                    if (!(((((_k1309[v_c] ?? arms(sp, cl, v_c)) === 2) && (strandLock_f1775[_e1778] === 1)) && (strandLock_f1775[_y1785] === 1)))) continue;
                    if (!((bent(sp, _e1778, _y1785) === (clueAt(cl.piece, v_c) === 3)))) continue V1782;
                  }
                  for (let _j1781 = 0; _j1781 < _i1780; _j1781++) {
                    const _y1786 = _a1774[_j1781];
                    if (!(((((strandLock_f1775[_e1778] === 1) && (strandLock_f1775[_y1786] === 1)) && !((b.grid[_e1778] !== 0))) && !((b.grid[_y1786] !== 0))))) continue;
                    if (!(!(_eg1350.of((sp.edgeEnds[2 * _y1786] === v_c ? sp.edgeEnds[2 * _y1786 + 1] : sp.edgeEnds[2 * _y1786])) === _eg1350.of((sp.edgeEnds[2 * _e1778] === v_c ? sp.edgeEnds[2 * _e1778 + 1] : sp.edgeEnds[2 * _e1778]))))) continue V1782;
                  }
                  break;
                }
                if (_r1783 === 0) {
                  _s1777[_i1780] = 0;
                  _i1780--;
                  continue;
                }
                _s1777[_i1780] = _d1779;
                if (_i1780 === _a1774.length - 1) break;
                _i1780++;
                _s1777[_i1780] = 0;
              }
              if (_i1780 < 0) break;
              let _g1787 = 0;
              G1788: {
                const _a1789 = sp.cellEdges[v_c];
                for (let _i1790 = 0; _i1790 < _a1789.length; _i1790++) {
                  const v_x = _a1789[_i1790];
                  if (!((strandLock_f1775[v_x] === 1))) continue;
                  _g1787++;
                }
              }
              let _c1795: boolean = (_g1787 === (_k1309[v_c] ?? arms(sp, cl, v_c)));
              if (_c1795) {
                let _q1791 = true;
                Q1792: {
                  const _a1793 = sp.cellEdges[v_c];
                  for (let _i1794 = 0; _i1794 < _a1793.length; _i1794++) {
                    const v_x = _a1793[_i1794];
                    if (!(((strandLock_f1775[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1350.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1791 = false;
                      break Q1792;
                    }
                  }
                }
                _c1795 = _q1791;
              }
              let _c1976: boolean = _c1795;
              if (_c1976) {
                let _q1796 = false;
                Q1797: {
                  const _a1798 = sp.cellEdges[v_c];
                  for (let _i1799 = 0; _i1799 < _a1798.length; _i1799++) {
                    const v_x = _a1798[_i1799];
                    if (!((strandLock_f1775[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q1796 = true;
                      break Q1797;
                    }
                  }
                }
                let _c1975: boolean = _q1796;
                if (!_c1975) {
                  _g1800.length = 0;
                  strandLock_st1883.pass++;
                  G1801: {
                    const _a1884 = sp.cellEdges[v_c];
                    for (let _i1885 = 0; _i1885 < _a1884.length; _i1885++) {
                      const v_x = _a1884[_i1885];
                      if (!((strandLock_f1775[v_x] === 1))) continue;
                      const _t1886 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h1948 = minus(_h1496, sp.cellEdges[_t1886]);
                      const _eg1950 = edgeGroups(sp, _h1948);
                      const _memo1953 = new Map<readonly number[], readonly number[]>();
                      _g1887.length = 0;
                      strandLock_st1926.pass++;
                      G1888: {
                        const _a1927 = sp.cellEdges[_t1886];
                        for (let _i1928 = 0; _i1928 < _a1927.length; _i1928++) {
                          const v_y = _a1927[_i1928];
                          let _c1947: boolean = (v_y !== v_x);
                          if (_c1947) {
                            let _q1929 = false;
                            Q1930: {
                              const _a1931 = sp.cellEdges[_t1886];
                              for (const _e1935 of strandLock_l1933) strandLock_f1932[_e1935] = -1;
                              strandLock_l1933 = _a1931;
                              let _i1937 = 0;
                              _s1934[0] = 0;
                              let _o1941 = _a1931.length === 0;
                              for (;;) {
                                if (_a1931.length === 0) {
                                  if (!_o1941) break;
                                  _o1941 = false;
                                }
                                while (_a1931.length > 0 && _i1937 >= 0) {
                                  const _e1935 = _a1931[_i1937];
                                  if (_s1934[_i1937] > 0) strandLock_f1932[_e1935] = -1;
                                  let _r1940 = (cands[_e1935] >= 0 ? cands[_e1935] : (cands[_e1935] = b.cands[_e1935])) & ~((2 << _s1934[_i1937]) - 1);
                                  let _d1936 = 0;
                                  V1939: for (; _r1940 !== 0; _r1940 &= _r1940 - 1) {
                                    _d1936 = 31 - Math.clz32(_r1940 & -_r1940);
                                    strandLock_f1932[_e1935] = _d1936;
                                    if (_e1935 === v_x && _d1936 !== 1) continue;
                                    if (_e1935 === v_y && _d1936 !== 1) continue;
                                    for (let _j1938 = 0; _j1938 < _i1937; _j1938++) {
                                      const _y1942 = _a1931[_j1938];
                                      if (!(((((_k1309[_t1886] ?? arms(sp, cl, _t1886)) === 2) && (strandLock_f1932[_e1935] === 1)) && (strandLock_f1932[_y1942] === 1)))) continue;
                                      if (!((bent(sp, _e1935, _y1942) === (clueAt(cl.piece, _t1886) === 3)))) continue V1939;
                                    }
                                    break;
                                  }
                                  if (_r1940 === 0) {
                                    _s1934[_i1937] = 0;
                                    _i1937--;
                                    continue;
                                  }
                                  _s1934[_i1937] = _d1936;
                                  if (_i1937 === _a1931.length - 1) break;
                                  _i1937++;
                                  _s1934[_i1937] = 0;
                                }
                                if (_i1937 < 0) break;
                                let _g1943 = 0;
                                G1944: {
                                  const _a1945 = sp.cellEdges[_t1886];
                                  for (let _i1946 = 0; _i1946 < _a1945.length; _i1946++) {
                                    const v_z = _a1945[_i1946];
                                    if (!((strandLock_f1932[v_z] === 1))) continue;
                                    _g1943++;
                                  }
                                }
                                if (!((_g1943 === (_k1309[_t1886] ?? arms(sp, cl, _t1886))))) continue;
                                if (true) {
                                  _q1929 = true;
                                  break Q1930;
                                }
                              }
                            }
                            _c1947 = _q1929;
                          }
                          if (!(_c1947)) continue;
                          const _t1949 = (sp.edgeEnds[2 * v_y] === _t1886 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t1952 = _eg1950.of(_t1949);
                          let _gs1954 = _memo1953.get(_t1952);
                          if (_gs1954 === undefined) {
                            _g1955.length = 0;
                            strandLock_st1962.pass++;
                            G1956: {
                              const _a1963 = _t1952;
                              for (let _i1964 = 0; _i1964 < _a1963.length; _i1964++) {
                                const v_t = _a1963[_i1964];
                                if (!(((_k1309[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a1965 = sp.cellEdges[v_t];
                                for (let _i1966 = 0; _i1966 < _a1965.length; _i1966++) {
                                  const v_y = _a1965[_i1966];
                                  L1967: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1309[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1517[v_y + 1] === 1)))) break L1967;
                                    const _t1968 = v_z;
                                    if (_g1955.length < 16) { if (!_g1955.includes(_t1968)) _g1955.push(_t1968); } else addOnce(_g1955, strandLock_st1962, _t1968);
                                  }
                                }
                              }
                            }
                            _gs1954 = _g1955.slice();
                            _memo1953.set(_t1952, _gs1954);
                          }
                          const _a1969 = union(_eg1950.of(_t1949), _gs1954);
                          for (let _i1970 = 0; _i1970 < _a1969.length; _i1970++) {
                            const v_t = _a1969[_i1970];
                            const _t1971 = v_t;
                            if (_g1887.length < 16) { if (!_g1887.includes(_t1971)) _g1887.push(_t1971); } else addOnce(_g1887, strandLock_st1926, _t1971);
                          }
                        }
                      }
                      const _a1972 = union(setOf(_t1886), _g1887);
                      for (let _i1973 = 0; _i1973 < _a1972.length; _i1973++) {
                        const v_t = _a1972[_i1973];
                        const _t1974 = v_t;
                        if (_g1800.length < 16) { if (!_g1800.includes(_t1974)) _g1800.push(_t1974); } else addOnce(_g1800, strandLock_st1883, _t1974);
                      }
                    }
                  }
                  _c1975 = (union(setOf(v_c), _g1800).length >= _h1522);
                }
                _c1976 = _c1975;
              }
              let _c2023: boolean = _c1976;
              if (_c2023) {
                let _q1977 = true;
                Q1978: {
                  _g1979.length = 0;
                  G1980: {
                    const _a1983 = sp.cellEdges[v_c];
                    for (let _i1984 = 0; _i1984 < _a1983.length; _i1984++) {
                      const v_x = _a1983[_i1984];
                      if (!((strandLock_f1775[v_x] === 1))) continue;
                      _g1979.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g1979);
                  const _eg2008 = edgeGroups(sp, v_M);
                  const _a1985 = sp.cellEdges[v_c];
                  for (let _i1986 = 0; _i1986 < _a1985.length; _i1986++) {
                    const v_x = _a1985[_i1986];
                    L1987: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c1992: boolean = (v_j !== v_c);
                      if (_c1992) {
                        let _q1988 = false;
                        Q1989: {
                          const _a1990 = sp.cellEdges[v_j];
                          for (let _i1991 = 0; _i1991 < _a1990.length; _i1991++) {
                            const v_y = _a1990[_i1991];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q1988 = true;
                              break Q1989;
                            }
                          }
                        }
                        _c1992 = _q1988;
                      }
                      if (!(_c1992)) break L1987;
                      let _q1993 = false;
                      Q1994: {
                        const _a1995 = sp.cellEdges[v_j];
                        for (const _e1999 of strandLock_l1997) strandLock_f1996[_e1999] = -1;
                        strandLock_l1997 = _a1995;
                        let _i2001 = 0;
                        _s1998[0] = 0;
                        let _o2005 = _a1995.length === 0;
                        for (;;) {
                          if (_a1995.length === 0) {
                            if (!_o2005) break;
                            _o2005 = false;
                          }
                          while (_a1995.length > 0 && _i2001 >= 0) {
                            const _e1999 = _a1995[_i2001];
                            if (_s1998[_i2001] > 0) strandLock_f1996[_e1999] = -1;
                            let _r2004 = (cands[_e1999] >= 0 ? cands[_e1999] : (cands[_e1999] = b.cands[_e1999])) & ~((2 << _s1998[_i2001]) - 1);
                            let _d2000 = 0;
                            V2003: for (; _r2004 !== 0; _r2004 &= _r2004 - 1) {
                              _d2000 = 31 - Math.clz32(_r2004 & -_r2004);
                              strandLock_f1996[_e1999] = _d2000;
                              for (let _j2002 = 0; _j2002 < _i2001; _j2002++) {
                                const _y2006 = _a1995[_j2002];
                                if (!(((((_k1309[v_j] ?? arms(sp, cl, v_j)) === 2) && (strandLock_f1996[_e1999] === 1)) && (strandLock_f1996[_y2006] === 1)))) continue;
                                if (!((bent(sp, _e1999, _y2006) === (clueAt(cl.piece, v_j) === 3)))) continue V2003;
                              }
                              for (let _j2002 = 0; _j2002 < _i2001; _j2002++) {
                                const _y2007 = _a1995[_j2002];
                                if (!(((((((strandLock_f1996[_e1999] === 1) && (strandLock_f1996[_y2007] === 1)) && !((b.grid[_e1999] !== 0))) && !((b.grid[_y2007] !== 0))) && !([sp.edgeEnds[2 * _e1999], sp.edgeEnds[2 * _e1999 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y2007], sp.edgeEnds[2 * _y2007 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg2008.of((sp.edgeEnds[2 * _y2007] === v_j ? sp.edgeEnds[2 * _y2007 + 1] : sp.edgeEnds[2 * _y2007])) === _eg2008.of((sp.edgeEnds[2 * _e1999] === v_j ? sp.edgeEnds[2 * _e1999 + 1] : sp.edgeEnds[2 * _e1999]))))) continue V2003;
                              }
                              break;
                            }
                            if (_r2004 === 0) {
                              _s1998[_i2001] = 0;
                              _i2001--;
                              continue;
                            }
                            _s1998[_i2001] = _d2000;
                            if (_i2001 === _a1995.length - 1) break;
                            _i2001++;
                            _s1998[_i2001] = 0;
                          }
                          if (_i2001 < 0) break;
                          let _q2009 = true;
                          Q2010: {
                            const _a2011 = sp.cellEdges[v_j];
                            for (let _i2012 = 0; _i2012 < _a2011.length; _i2012++) {
                              const v_y = _a2011[_i2012];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((strandLock_f1996[v_y] === strandLock_f1775[v_y]))) {
                                _q2009 = false;
                                break Q2010;
                              }
                            }
                          }
                          let _c2017: boolean = _q2009;
                          if (_c2017) {
                            let _g2013 = 0;
                            G2014: {
                              const _a2015 = sp.cellEdges[v_j];
                              for (let _i2016 = 0; _i2016 < _a2015.length; _i2016++) {
                                const v_y = _a2015[_i2016];
                                if (!((strandLock_f1996[v_y] === 1))) continue;
                                _g2013++;
                              }
                            }
                            _c2017 = (_g2013 === (_k1309[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c2022: boolean = _c2017;
                          if (_c2022) {
                            let _q2018 = true;
                            Q2019: {
                              const _a2020 = sp.cellEdges[v_j];
                              for (let _i2021 = 0; _i2021 < _a2020.length; _i2021++) {
                                const v_y = _a2020[_i2021];
                                if (!((((strandLock_f1996[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg2008.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg2008.of(v_j)))) {
                                  _q2018 = false;
                                  break Q2019;
                                }
                              }
                            }
                            _c2022 = _q2018;
                          }
                          if (!(_c2022)) continue;
                          if (true) {
                            _q1993 = true;
                            break Q1994;
                          }
                        }
                      }
                      if (!(_q1993)) {
                        _q1977 = false;
                        break Q1978;
                      }
                    }
                  }
                }
                _c2023 = _q1977;
              }
              if (!(_c2023)) continue;
              if (!(true)) continue;
              strandLock_l1770 = _a1774;
              _y1771 = true;
              for (const _e1773 of _a1774) strandLock_p1769[_e1773] |= 1 << strandLock_f1775[_e1773];
            }
          }
          if (!(((((strandLock_p1769[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y1771 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1523.push(v_e);
        }
      }
      const v_W = _g1523;
      _g2024.length = 0;
      G2025: {
        const _a2268 = v_F;
        for (let _i2269 = 0; _i2269 < _a2268.length; _i2269++) {
          const v_e = _a2268[_i2269];
          if (_g2273 !== _epoch) {
            _g2273 = _epoch;
            for (const _e2274 of strandLock_l2271) strandLock_p2270[_e2274] = 0;
            _y2272 = false;
            const _a2275 = sp.cellEdges[v_c];
            for (const _e2279 of strandLock_l2277) strandLock_f2276[_e2279] = -1;
            strandLock_l2277 = _a2275;
            let _i2281 = 0;
            _s2278[0] = 0;
            let _o2285 = _a2275.length === 0;
            for (;;) {
              if (_a2275.length === 0) {
                if (!_o2285) break;
                _o2285 = false;
              }
              while (_a2275.length > 0 && _i2281 >= 0) {
                const _e2279 = _a2275[_i2281];
                if (_s2278[_i2281] > 0) strandLock_f2276[_e2279] = -1;
                let _r2284 = (cands[_e2279] >= 0 ? cands[_e2279] : (cands[_e2279] = b.cands[_e2279])) & ~((2 << _s2278[_i2281]) - 1);
                let _d2280 = 0;
                V2283: for (; _r2284 !== 0; _r2284 &= _r2284 - 1) {
                  _d2280 = 31 - Math.clz32(_r2284 & -_r2284);
                  strandLock_f2276[_e2279] = _d2280;
                  for (let _j2282 = 0; _j2282 < _i2281; _j2282++) {
                    const _y2286 = _a2275[_j2282];
                    if (!(((((_k1309[v_c] ?? arms(sp, cl, v_c)) === 2) && (strandLock_f2276[_e2279] === 1)) && (strandLock_f2276[_y2286] === 1)))) continue;
                    if (!((bent(sp, _e2279, _y2286) === (clueAt(cl.piece, v_c) === 3)))) continue V2283;
                  }
                  for (let _j2282 = 0; _j2282 < _i2281; _j2282++) {
                    const _y2287 = _a2275[_j2282];
                    if (!(((((strandLock_f2276[_e2279] === 1) && (strandLock_f2276[_y2287] === 1)) && !((b.grid[_e2279] !== 0))) && !((b.grid[_y2287] !== 0))))) continue;
                    if (!(!(_eg1350.of((sp.edgeEnds[2 * _y2287] === v_c ? sp.edgeEnds[2 * _y2287 + 1] : sp.edgeEnds[2 * _y2287])) === _eg1350.of((sp.edgeEnds[2 * _e2279] === v_c ? sp.edgeEnds[2 * _e2279 + 1] : sp.edgeEnds[2 * _e2279]))))) continue V2283;
                  }
                  break;
                }
                if (_r2284 === 0) {
                  _s2278[_i2281] = 0;
                  _i2281--;
                  continue;
                }
                _s2278[_i2281] = _d2280;
                if (_i2281 === _a2275.length - 1) break;
                _i2281++;
                _s2278[_i2281] = 0;
              }
              if (_i2281 < 0) break;
              let _g2288 = 0;
              G2289: {
                const _a2290 = sp.cellEdges[v_c];
                for (let _i2291 = 0; _i2291 < _a2290.length; _i2291++) {
                  const v_x = _a2290[_i2291];
                  if (!((strandLock_f2276[v_x] === 1))) continue;
                  _g2288++;
                }
              }
              let _c2296: boolean = (_g2288 === (_k1309[v_c] ?? arms(sp, cl, v_c)));
              if (_c2296) {
                let _q2292 = true;
                Q2293: {
                  const _a2294 = sp.cellEdges[v_c];
                  for (let _i2295 = 0; _i2295 < _a2294.length; _i2295++) {
                    const v_x = _a2294[_i2295];
                    if (!(((strandLock_f2276[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1350.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2292 = false;
                      break Q2293;
                    }
                  }
                }
                _c2296 = _q2292;
              }
              let _c2477: boolean = _c2296;
              if (_c2477) {
                let _q2297 = false;
                Q2298: {
                  const _a2299 = sp.cellEdges[v_c];
                  for (let _i2300 = 0; _i2300 < _a2299.length; _i2300++) {
                    const v_x = _a2299[_i2300];
                    if (!((strandLock_f2276[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2297 = true;
                      break Q2298;
                    }
                  }
                }
                let _c2476: boolean = _q2297;
                if (!_c2476) {
                  _g2301.length = 0;
                  strandLock_st2384.pass++;
                  G2302: {
                    const _a2385 = sp.cellEdges[v_c];
                    for (let _i2386 = 0; _i2386 < _a2385.length; _i2386++) {
                      const v_x = _a2385[_i2386];
                      if (!((strandLock_f2276[v_x] === 1))) continue;
                      const _t2387 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h2449 = minus(_h1496, sp.cellEdges[_t2387]);
                      const _eg2451 = edgeGroups(sp, _h2449);
                      const _memo2454 = new Map<readonly number[], readonly number[]>();
                      _g2388.length = 0;
                      strandLock_st2427.pass++;
                      G2389: {
                        const _a2428 = sp.cellEdges[_t2387];
                        for (let _i2429 = 0; _i2429 < _a2428.length; _i2429++) {
                          const v_y = _a2428[_i2429];
                          let _c2448: boolean = (v_y !== v_x);
                          if (_c2448) {
                            let _q2430 = false;
                            Q2431: {
                              const _a2432 = sp.cellEdges[_t2387];
                              for (const _e2436 of strandLock_l2434) strandLock_f2433[_e2436] = -1;
                              strandLock_l2434 = _a2432;
                              let _i2438 = 0;
                              _s2435[0] = 0;
                              let _o2442 = _a2432.length === 0;
                              for (;;) {
                                if (_a2432.length === 0) {
                                  if (!_o2442) break;
                                  _o2442 = false;
                                }
                                while (_a2432.length > 0 && _i2438 >= 0) {
                                  const _e2436 = _a2432[_i2438];
                                  if (_s2435[_i2438] > 0) strandLock_f2433[_e2436] = -1;
                                  let _r2441 = (cands[_e2436] >= 0 ? cands[_e2436] : (cands[_e2436] = b.cands[_e2436])) & ~((2 << _s2435[_i2438]) - 1);
                                  let _d2437 = 0;
                                  V2440: for (; _r2441 !== 0; _r2441 &= _r2441 - 1) {
                                    _d2437 = 31 - Math.clz32(_r2441 & -_r2441);
                                    strandLock_f2433[_e2436] = _d2437;
                                    if (_e2436 === v_x && _d2437 !== 1) continue;
                                    if (_e2436 === v_y && _d2437 !== 1) continue;
                                    for (let _j2439 = 0; _j2439 < _i2438; _j2439++) {
                                      const _y2443 = _a2432[_j2439];
                                      if (!(((((_k1309[_t2387] ?? arms(sp, cl, _t2387)) === 2) && (strandLock_f2433[_e2436] === 1)) && (strandLock_f2433[_y2443] === 1)))) continue;
                                      if (!((bent(sp, _e2436, _y2443) === (clueAt(cl.piece, _t2387) === 3)))) continue V2440;
                                    }
                                    break;
                                  }
                                  if (_r2441 === 0) {
                                    _s2435[_i2438] = 0;
                                    _i2438--;
                                    continue;
                                  }
                                  _s2435[_i2438] = _d2437;
                                  if (_i2438 === _a2432.length - 1) break;
                                  _i2438++;
                                  _s2435[_i2438] = 0;
                                }
                                if (_i2438 < 0) break;
                                let _g2444 = 0;
                                G2445: {
                                  const _a2446 = sp.cellEdges[_t2387];
                                  for (let _i2447 = 0; _i2447 < _a2446.length; _i2447++) {
                                    const v_z = _a2446[_i2447];
                                    if (!((strandLock_f2433[v_z] === 1))) continue;
                                    _g2444++;
                                  }
                                }
                                if (!((_g2444 === (_k1309[_t2387] ?? arms(sp, cl, _t2387))))) continue;
                                if (true) {
                                  _q2430 = true;
                                  break Q2431;
                                }
                              }
                            }
                            _c2448 = _q2430;
                          }
                          if (!(_c2448)) continue;
                          const _t2450 = (sp.edgeEnds[2 * v_y] === _t2387 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2453 = _eg2451.of(_t2450);
                          let _gs2455 = _memo2454.get(_t2453);
                          if (_gs2455 === undefined) {
                            _g2456.length = 0;
                            strandLock_st2463.pass++;
                            G2457: {
                              const _a2464 = _t2453;
                              for (let _i2465 = 0; _i2465 < _a2464.length; _i2465++) {
                                const v_t = _a2464[_i2465];
                                if (!(((_k1309[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a2466 = sp.cellEdges[v_t];
                                for (let _i2467 = 0; _i2467 < _a2466.length; _i2467++) {
                                  const v_y = _a2466[_i2467];
                                  L2468: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1309[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1517[v_y + 1] === 1)))) break L2468;
                                    const _t2469 = v_z;
                                    if (_g2456.length < 16) { if (!_g2456.includes(_t2469)) _g2456.push(_t2469); } else addOnce(_g2456, strandLock_st2463, _t2469);
                                  }
                                }
                              }
                            }
                            _gs2455 = _g2456.slice();
                            _memo2454.set(_t2453, _gs2455);
                          }
                          const _a2470 = union(_eg2451.of(_t2450), _gs2455);
                          for (let _i2471 = 0; _i2471 < _a2470.length; _i2471++) {
                            const v_t = _a2470[_i2471];
                            const _t2472 = v_t;
                            if (_g2388.length < 16) { if (!_g2388.includes(_t2472)) _g2388.push(_t2472); } else addOnce(_g2388, strandLock_st2427, _t2472);
                          }
                        }
                      }
                      const _a2473 = union(setOf(_t2387), _g2388);
                      for (let _i2474 = 0; _i2474 < _a2473.length; _i2474++) {
                        const v_t = _a2473[_i2474];
                        const _t2475 = v_t;
                        if (_g2301.length < 16) { if (!_g2301.includes(_t2475)) _g2301.push(_t2475); } else addOnce(_g2301, strandLock_st2384, _t2475);
                      }
                    }
                  }
                  _c2476 = (union(setOf(v_c), _g2301).length >= _h1522);
                }
                _c2477 = _c2476;
              }
              let _c2524: boolean = _c2477;
              if (_c2524) {
                let _q2478 = true;
                Q2479: {
                  _g2480.length = 0;
                  G2481: {
                    const _a2484 = sp.cellEdges[v_c];
                    for (let _i2485 = 0; _i2485 < _a2484.length; _i2485++) {
                      const v_x = _a2484[_i2485];
                      if (!((strandLock_f2276[v_x] === 1))) continue;
                      _g2480.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g2480);
                  const _eg2509 = edgeGroups(sp, v_M);
                  const _a2486 = sp.cellEdges[v_c];
                  for (let _i2487 = 0; _i2487 < _a2486.length; _i2487++) {
                    const v_x = _a2486[_i2487];
                    L2488: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c2493: boolean = (v_j !== v_c);
                      if (_c2493) {
                        let _q2489 = false;
                        Q2490: {
                          const _a2491 = sp.cellEdges[v_j];
                          for (let _i2492 = 0; _i2492 < _a2491.length; _i2492++) {
                            const v_y = _a2491[_i2492];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q2489 = true;
                              break Q2490;
                            }
                          }
                        }
                        _c2493 = _q2489;
                      }
                      if (!(_c2493)) break L2488;
                      let _q2494 = false;
                      Q2495: {
                        const _a2496 = sp.cellEdges[v_j];
                        for (const _e2500 of strandLock_l2498) strandLock_f2497[_e2500] = -1;
                        strandLock_l2498 = _a2496;
                        let _i2502 = 0;
                        _s2499[0] = 0;
                        let _o2506 = _a2496.length === 0;
                        for (;;) {
                          if (_a2496.length === 0) {
                            if (!_o2506) break;
                            _o2506 = false;
                          }
                          while (_a2496.length > 0 && _i2502 >= 0) {
                            const _e2500 = _a2496[_i2502];
                            if (_s2499[_i2502] > 0) strandLock_f2497[_e2500] = -1;
                            let _r2505 = (cands[_e2500] >= 0 ? cands[_e2500] : (cands[_e2500] = b.cands[_e2500])) & ~((2 << _s2499[_i2502]) - 1);
                            let _d2501 = 0;
                            V2504: for (; _r2505 !== 0; _r2505 &= _r2505 - 1) {
                              _d2501 = 31 - Math.clz32(_r2505 & -_r2505);
                              strandLock_f2497[_e2500] = _d2501;
                              for (let _j2503 = 0; _j2503 < _i2502; _j2503++) {
                                const _y2507 = _a2496[_j2503];
                                if (!(((((_k1309[v_j] ?? arms(sp, cl, v_j)) === 2) && (strandLock_f2497[_e2500] === 1)) && (strandLock_f2497[_y2507] === 1)))) continue;
                                if (!((bent(sp, _e2500, _y2507) === (clueAt(cl.piece, v_j) === 3)))) continue V2504;
                              }
                              for (let _j2503 = 0; _j2503 < _i2502; _j2503++) {
                                const _y2508 = _a2496[_j2503];
                                if (!(((((((strandLock_f2497[_e2500] === 1) && (strandLock_f2497[_y2508] === 1)) && !((b.grid[_e2500] !== 0))) && !((b.grid[_y2508] !== 0))) && !([sp.edgeEnds[2 * _e2500], sp.edgeEnds[2 * _e2500 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y2508], sp.edgeEnds[2 * _y2508 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg2509.of((sp.edgeEnds[2 * _y2508] === v_j ? sp.edgeEnds[2 * _y2508 + 1] : sp.edgeEnds[2 * _y2508])) === _eg2509.of((sp.edgeEnds[2 * _e2500] === v_j ? sp.edgeEnds[2 * _e2500 + 1] : sp.edgeEnds[2 * _e2500]))))) continue V2504;
                              }
                              break;
                            }
                            if (_r2505 === 0) {
                              _s2499[_i2502] = 0;
                              _i2502--;
                              continue;
                            }
                            _s2499[_i2502] = _d2501;
                            if (_i2502 === _a2496.length - 1) break;
                            _i2502++;
                            _s2499[_i2502] = 0;
                          }
                          if (_i2502 < 0) break;
                          let _q2510 = true;
                          Q2511: {
                            const _a2512 = sp.cellEdges[v_j];
                            for (let _i2513 = 0; _i2513 < _a2512.length; _i2513++) {
                              const v_y = _a2512[_i2513];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((strandLock_f2497[v_y] === strandLock_f2276[v_y]))) {
                                _q2510 = false;
                                break Q2511;
                              }
                            }
                          }
                          let _c2518: boolean = _q2510;
                          if (_c2518) {
                            let _g2514 = 0;
                            G2515: {
                              const _a2516 = sp.cellEdges[v_j];
                              for (let _i2517 = 0; _i2517 < _a2516.length; _i2517++) {
                                const v_y = _a2516[_i2517];
                                if (!((strandLock_f2497[v_y] === 1))) continue;
                                _g2514++;
                              }
                            }
                            _c2518 = (_g2514 === (_k1309[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c2523: boolean = _c2518;
                          if (_c2523) {
                            let _q2519 = true;
                            Q2520: {
                              const _a2521 = sp.cellEdges[v_j];
                              for (let _i2522 = 0; _i2522 < _a2521.length; _i2522++) {
                                const v_y = _a2521[_i2522];
                                if (!((((strandLock_f2497[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg2509.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg2509.of(v_j)))) {
                                  _q2519 = false;
                                  break Q2520;
                                }
                              }
                            }
                            _c2523 = _q2519;
                          }
                          if (!(_c2523)) continue;
                          if (true) {
                            _q2494 = true;
                            break Q2495;
                          }
                        }
                      }
                      if (!(_q2494)) {
                        _q2478 = false;
                        break Q2479;
                      }
                    }
                  }
                }
                _c2524 = _q2478;
              }
              if (!(_c2524)) continue;
              if (!(true)) continue;
              strandLock_l2271 = _a2275;
              _y2272 = true;
              for (const _e2274 of _a2275) strandLock_p2270[_e2274] |= 1 << strandLock_f2276[_e2274];
            }
          }
          if (!(((((strandLock_p2270[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y2272 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2024.push(v_e);
        }
      }
      L2525: {
        const v_N = _g2024;
        let _q2526 = true;
        Q2527: {
          const _a2528 = v_F;
          for (let _i2529 = 0; _i2529 < _a2528.length; _i2529++) {
            const v_e = _a2528[_i2529];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q2526 = false;
              break Q2527;
            }
          }
        }
        if (!(_q2526)) break L2525;
        if (b.made[0] !== _m3782_0 || b.made[1] !== _m3783_1) {
          _g2530.length = 0;
          G2531: {
            const _a2534 = sp.edges;
            for (let _i2535 = 0; _i2535 < _a2534.length; _i2535++) {
              const v_e = _a2534[_i2535];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g2530.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g2530))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g2536: number[] = [];
          G2537: {
            const _a2540 = sp.edges;
            for (let _i2541 = 0; _i2541 < _a2540.length; _i2541++) {
              const v_e = _a2540[_i2541];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g2536.push(v_e);
            }
          }
          const _g2542: number[] = [];
          G2543: {
            const _a2585 = sp.edges;
            for (let _i2586 = 0; _i2586 < _a2585.length; _i2586++) {
              const v_e = _a2585[_i2586];
              const _t2587 = sp.edgeEnds[2 * v_e];
              let _q2588 = false;
              Q2589: {
                const _f2591 = new Int32Array(sp.edges.length).fill(-1);
                let _l2592: readonly number[] = [];
                const _s2593: number[] = [];
                const _a2590 = sp.cellEdges[_t2587];
                for (const _e2594 of _l2592) _f2591[_e2594] = -1;
                _l2592 = _a2590;
                let _i2596 = 0;
                _s2593[0] = 0;
                let _o2600 = _a2590.length === 0;
                for (;;) {
                  if (_a2590.length === 0) {
                    if (!_o2600) break;
                    _o2600 = false;
                  }
                  while (_a2590.length > 0 && _i2596 >= 0) {
                    const _e2594 = _a2590[_i2596];
                    if (_s2593[_i2596] > 0) _f2591[_e2594] = -1;
                    let _r2599 = (cands[_e2594] >= 0 ? cands[_e2594] : (cands[_e2594] = b.cands[_e2594])) & ~((2 << _s2593[_i2596]) - 1);
                    let _d2595 = 0;
                    V2598: for (; _r2599 !== 0; _r2599 &= _r2599 - 1) {
                      _d2595 = 31 - Math.clz32(_r2599 & -_r2599);
                      _f2591[_e2594] = _d2595;
                      if (_e2594 === v_e && _d2595 !== 1) continue;
                      for (let _j2597 = 0; _j2597 < _i2596; _j2597++) {
                        const _y2601 = _a2590[_j2597];
                        if (!((((arms(sp, cl, _t2587) === 2) && (_f2591[_e2594] === 1)) && (_f2591[_y2601] === 1)))) continue;
                        if (!((bent(sp, _e2594, _y2601) === (clueAt(cl.piece, _t2587) === 3)))) continue V2598;
                      }
                      break;
                    }
                    if (_r2599 === 0) {
                      _s2593[_i2596] = 0;
                      _i2596--;
                      continue;
                    }
                    _s2593[_i2596] = _d2595;
                    if (_i2596 === _a2590.length - 1) break;
                    _i2596++;
                    _s2593[_i2596] = 0;
                  }
                  if (_i2596 < 0) break;
                  let _g2602 = 0;
                  G2603: {
                    const _a2604 = sp.cellEdges[_t2587];
                    for (let _i2605 = 0; _i2605 < _a2604.length; _i2605++) {
                      const v_x = _a2604[_i2605];
                      if (!((_f2591[v_x] === 1))) continue;
                      _g2602++;
                    }
                  }
                  if (!((_g2602 === arms(sp, cl, _t2587)))) continue;
                  if (true) {
                    _q2588 = true;
                    break Q2589;
                  }
                }
              }
              let _c2625: boolean = _q2588;
              if (_c2625) {
                const _t2606 = sp.edgeEnds[2 * v_e + 1];
                let _q2607 = false;
                Q2608: {
                  const _f2610 = new Int32Array(sp.edges.length).fill(-1);
                  let _l2611: readonly number[] = [];
                  const _s2612: number[] = [];
                  const _a2609 = sp.cellEdges[_t2606];
                  for (const _e2613 of _l2611) _f2610[_e2613] = -1;
                  _l2611 = _a2609;
                  let _i2615 = 0;
                  _s2612[0] = 0;
                  let _o2619 = _a2609.length === 0;
                  for (;;) {
                    if (_a2609.length === 0) {
                      if (!_o2619) break;
                      _o2619 = false;
                    }
                    while (_a2609.length > 0 && _i2615 >= 0) {
                      const _e2613 = _a2609[_i2615];
                      if (_s2612[_i2615] > 0) _f2610[_e2613] = -1;
                      let _r2618 = (cands[_e2613] >= 0 ? cands[_e2613] : (cands[_e2613] = b.cands[_e2613])) & ~((2 << _s2612[_i2615]) - 1);
                      let _d2614 = 0;
                      V2617: for (; _r2618 !== 0; _r2618 &= _r2618 - 1) {
                        _d2614 = 31 - Math.clz32(_r2618 & -_r2618);
                        _f2610[_e2613] = _d2614;
                        if (_e2613 === v_e && _d2614 !== 1) continue;
                        for (let _j2616 = 0; _j2616 < _i2615; _j2616++) {
                          const _y2620 = _a2609[_j2616];
                          if (!((((arms(sp, cl, _t2606) === 2) && (_f2610[_e2613] === 1)) && (_f2610[_y2620] === 1)))) continue;
                          if (!((bent(sp, _e2613, _y2620) === (clueAt(cl.piece, _t2606) === 3)))) continue V2617;
                        }
                        break;
                      }
                      if (_r2618 === 0) {
                        _s2612[_i2615] = 0;
                        _i2615--;
                        continue;
                      }
                      _s2612[_i2615] = _d2614;
                      if (_i2615 === _a2609.length - 1) break;
                      _i2615++;
                      _s2612[_i2615] = 0;
                    }
                    if (_i2615 < 0) break;
                    let _g2621 = 0;
                    G2622: {
                      const _a2623 = sp.cellEdges[_t2606];
                      for (let _i2624 = 0; _i2624 < _a2623.length; _i2624++) {
                        const v_x = _a2623[_i2624];
                        if (!((_f2610[v_x] === 1))) continue;
                        _g2621++;
                      }
                    }
                    if (!((_g2621 === arms(sp, cl, _t2606)))) continue;
                    if (true) {
                      _q2607 = true;
                      break Q2608;
                    }
                  }
                }
                _c2625 = _q2607;
              }
              if (!(_c2625)) continue;
              _g2542.push(v_e);
            }
          }
          const _g2626: number[] = [];
          G2627: {
            const _a2630 = v_U;
            for (let _i2631 = 0; _i2631 < _a2630.length; _i2631++) {
              const v_e = _a2630[_i2631];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g2626.push(v_e);
            }
          }
          const _g2632: number[] = [];
          G2633: {
            const _a2636 = sp.cellEdges[v_c];
            for (let _i2637 = 0; _i2637 < _a2636.length; _i2637++) {
              const v_e = _a2636[_i2637];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g2632.push(v_e);
            }
          }
          const _g2638: number[] = [];
          G2639: {
            const _a2719 = sp.cellEdges[v_c];
            for (let _i2720 = 0; _i2720 < _a2719.length; _i2720++) {
              const v_x = _a2719[_i2720];
              const _t2721 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g2722: number[] = [];
              G2723: {
                const _a2761 = sp.cellEdges[_t2721];
                for (let _i2762 = 0; _i2762 < _a2761.length; _i2762++) {
                  const v_y = _a2761[_i2762];
                  let _c2781: boolean = (v_y !== v_x);
                  if (_c2781) {
                    let _q2763 = false;
                    Q2764: {
                      const _f2766 = new Int32Array(sp.edges.length).fill(-1);
                      let _l2767: readonly number[] = [];
                      const _s2768: number[] = [];
                      const _a2765 = sp.cellEdges[_t2721];
                      for (const _e2769 of _l2767) _f2766[_e2769] = -1;
                      _l2767 = _a2765;
                      let _i2771 = 0;
                      _s2768[0] = 0;
                      let _o2775 = _a2765.length === 0;
                      for (;;) {
                        if (_a2765.length === 0) {
                          if (!_o2775) break;
                          _o2775 = false;
                        }
                        while (_a2765.length > 0 && _i2771 >= 0) {
                          const _e2769 = _a2765[_i2771];
                          if (_s2768[_i2771] > 0) _f2766[_e2769] = -1;
                          let _r2774 = (cands[_e2769] >= 0 ? cands[_e2769] : (cands[_e2769] = b.cands[_e2769])) & ~((2 << _s2768[_i2771]) - 1);
                          let _d2770 = 0;
                          V2773: for (; _r2774 !== 0; _r2774 &= _r2774 - 1) {
                            _d2770 = 31 - Math.clz32(_r2774 & -_r2774);
                            _f2766[_e2769] = _d2770;
                            if (_e2769 === v_x && _d2770 !== 1) continue;
                            if (_e2769 === v_y && _d2770 !== 1) continue;
                            for (let _j2772 = 0; _j2772 < _i2771; _j2772++) {
                              const _y2776 = _a2765[_j2772];
                              if (!((((arms(sp, cl, _t2721) === 2) && (_f2766[_e2769] === 1)) && (_f2766[_y2776] === 1)))) continue;
                              if (!((bent(sp, _e2769, _y2776) === (clueAt(cl.piece, _t2721) === 3)))) continue V2773;
                            }
                            break;
                          }
                          if (_r2774 === 0) {
                            _s2768[_i2771] = 0;
                            _i2771--;
                            continue;
                          }
                          _s2768[_i2771] = _d2770;
                          if (_i2771 === _a2765.length - 1) break;
                          _i2771++;
                          _s2768[_i2771] = 0;
                        }
                        if (_i2771 < 0) break;
                        let _g2777 = 0;
                        G2778: {
                          const _a2779 = sp.cellEdges[_t2721];
                          for (let _i2780 = 0; _i2780 < _a2779.length; _i2780++) {
                            const v_z = _a2779[_i2780];
                            if (!((_f2766[v_z] === 1))) continue;
                            _g2777++;
                          }
                        }
                        if (!((_g2777 === arms(sp, cl, _t2721)))) continue;
                        if (true) {
                          _q2763 = true;
                          break Q2764;
                        }
                      }
                    }
                    _c2781 = _q2763;
                  }
                  if (!(_c2781)) continue;
                  const _t2782 = (sp.edgeEnds[2 * v_y] === _t2721 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t2783 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t2721]);
                  const _g2784: number[] = [];
                  G2785: {
                    const _a2791 = through(sp, _t2782, _t2783);
                    for (let _i2792 = 0; _i2792 < _a2791.length; _i2792++) {
                      const v_t = _a2791[_i2792];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a2793 = sp.cellEdges[v_t];
                      for (let _i2794 = 0; _i2794 < _a2793.length; _i2794++) {
                        const v_y = _a2793[_i2794];
                        L2795: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L2795;
                          if (!_g2784.includes(v_z)) _g2784.push(v_z);
                        }
                      }
                    }
                  }
                  const _a2796 = union(through(sp, _t2782, _t2783), _g2784);
                  for (let _i2797 = 0; _i2797 < _a2796.length; _i2797++) {
                    const v_t = _a2796[_i2797];
                    if (!_g2722.includes(v_t)) _g2722.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t2721), _g2722)).length >= sp.cells.length))) continue;
              _g2638.push(v_x);
            }
          }
          const _g2798: number[] = [];
          G2799: {
            const _a3042 = v_F;
            for (let _i3043 = 0; _i3043 < _a3042.length; _i3043++) {
              const v_e = _a3042[_i3043];
              let _q3044 = false;
              Q3045: {
                const _f3047 = new Int32Array(sp.edges.length).fill(-1);
                let _l3048: readonly number[] = [];
                const _s3049: number[] = [];
                const _a3046 = sp.cellEdges[v_c];
                for (const _e3050 of _l3048) _f3047[_e3050] = -1;
                _l3048 = _a3046;
                let _i3052 = 0;
                _s3049[0] = 0;
                let _o3056 = _a3046.length === 0;
                for (;;) {
                  if (_a3046.length === 0) {
                    if (!_o3056) break;
                    _o3056 = false;
                  }
                  while (_a3046.length > 0 && _i3052 >= 0) {
                    const _e3050 = _a3046[_i3052];
                    if (_s3049[_i3052] > 0) _f3047[_e3050] = -1;
                    let _r3055 = (cands[_e3050] >= 0 ? cands[_e3050] : (cands[_e3050] = b.cands[_e3050])) & ~((2 << _s3049[_i3052]) - 1);
                    let _d3051 = 0;
                    V3054: for (; _r3055 !== 0; _r3055 &= _r3055 - 1) {
                      _d3051 = 31 - Math.clz32(_r3055 & -_r3055);
                      _f3047[_e3050] = _d3051;
                      if (_e3050 === v_e && _d3051 !== 1) continue;
                      for (let _j3053 = 0; _j3053 < _i3052; _j3053++) {
                        const _y3057 = _a3046[_j3053];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f3047[_e3050] === 1)) && (_f3047[_y3057] === 1)))) continue;
                        if (!((bent(sp, _e3050, _y3057) === (clueAt(cl.piece, v_c) === 3)))) continue V3054;
                      }
                      for (let _j3053 = 0; _j3053 < _i3052; _j3053++) {
                        const _y3058 = _a3046[_j3053];
                        if (!(((((_f3047[_e3050] === 1) && (_f3047[_y3058] === 1)) && !((b.grid[_e3050] !== 0))) && !((b.grid[_y3058] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e3050] === v_c ? sp.edgeEnds[2 * _e3050 + 1] : sp.edgeEnds[2 * _e3050]), v_L).includes((sp.edgeEnds[2 * _y3058] === v_c ? sp.edgeEnds[2 * _y3058 + 1] : sp.edgeEnds[2 * _y3058]))))) continue V3054;
                      }
                      break;
                    }
                    if (_r3055 === 0) {
                      _s3049[_i3052] = 0;
                      _i3052--;
                      continue;
                    }
                    _s3049[_i3052] = _d3051;
                    if (_i3052 === _a3046.length - 1) break;
                    _i3052++;
                    _s3049[_i3052] = 0;
                  }
                  if (_i3052 < 0) break;
                  let _g3059 = 0;
                  G3060: {
                    const _a3061 = sp.cellEdges[v_c];
                    for (let _i3062 = 0; _i3062 < _a3061.length; _i3062++) {
                      const v_x = _a3061[_i3062];
                      if (!((_f3047[v_x] === 1))) continue;
                      _g3059++;
                    }
                  }
                  let _c3067: boolean = (_g3059 === arms(sp, cl, v_c));
                  if (_c3067) {
                    let _q3063 = true;
                    Q3064: {
                      const _a3065 = sp.cellEdges[v_c];
                      for (let _i3066 = 0; _i3066 < _a3065.length; _i3066++) {
                        const v_x = _a3065[_i3066];
                        if (!(((_f3047[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg1350.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q3063 = false;
                          break Q3064;
                        }
                      }
                    }
                    _c3067 = _q3063;
                  }
                  let _c3237: boolean = _c3067;
                  if (_c3237) {
                    let _q3068 = false;
                    Q3069: {
                      const _a3070 = sp.cellEdges[v_c];
                      for (let _i3071 = 0; _i3071 < _a3070.length; _i3071++) {
                        const v_x = _a3070[_i3071];
                        if (!((_f3047[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q3068 = true;
                          break Q3069;
                        }
                      }
                    }
                    let _c3236: boolean = _q3068;
                    if (!_c3236) {
                      const _g3072: number[] = [];
                      G3073: {
                        const _a3155 = sp.cellEdges[v_c];
                        for (let _i3156 = 0; _i3156 < _a3155.length; _i3156++) {
                          const v_x = _a3155[_i3156];
                          if (!((_f3047[v_x] === 1))) continue;
                          const _t3157 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g3158: number[] = [];
                          G3159: {
                            const _a3197 = sp.cellEdges[_t3157];
                            for (let _i3198 = 0; _i3198 < _a3197.length; _i3198++) {
                              const v_y = _a3197[_i3198];
                              let _c3217: boolean = (v_y !== v_x);
                              if (_c3217) {
                                let _q3199 = false;
                                Q3200: {
                                  const _f3202 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l3203: readonly number[] = [];
                                  const _s3204: number[] = [];
                                  const _a3201 = sp.cellEdges[_t3157];
                                  for (const _e3205 of _l3203) _f3202[_e3205] = -1;
                                  _l3203 = _a3201;
                                  let _i3207 = 0;
                                  _s3204[0] = 0;
                                  let _o3211 = _a3201.length === 0;
                                  for (;;) {
                                    if (_a3201.length === 0) {
                                      if (!_o3211) break;
                                      _o3211 = false;
                                    }
                                    while (_a3201.length > 0 && _i3207 >= 0) {
                                      const _e3205 = _a3201[_i3207];
                                      if (_s3204[_i3207] > 0) _f3202[_e3205] = -1;
                                      let _r3210 = (cands[_e3205] >= 0 ? cands[_e3205] : (cands[_e3205] = b.cands[_e3205])) & ~((2 << _s3204[_i3207]) - 1);
                                      let _d3206 = 0;
                                      V3209: for (; _r3210 !== 0; _r3210 &= _r3210 - 1) {
                                        _d3206 = 31 - Math.clz32(_r3210 & -_r3210);
                                        _f3202[_e3205] = _d3206;
                                        if (_e3205 === v_x && _d3206 !== 1) continue;
                                        if (_e3205 === v_y && _d3206 !== 1) continue;
                                        for (let _j3208 = 0; _j3208 < _i3207; _j3208++) {
                                          const _y3212 = _a3201[_j3208];
                                          if (!((((arms(sp, cl, _t3157) === 2) && (_f3202[_e3205] === 1)) && (_f3202[_y3212] === 1)))) continue;
                                          if (!((bent(sp, _e3205, _y3212) === (clueAt(cl.piece, _t3157) === 3)))) continue V3209;
                                        }
                                        break;
                                      }
                                      if (_r3210 === 0) {
                                        _s3204[_i3207] = 0;
                                        _i3207--;
                                        continue;
                                      }
                                      _s3204[_i3207] = _d3206;
                                      if (_i3207 === _a3201.length - 1) break;
                                      _i3207++;
                                      _s3204[_i3207] = 0;
                                    }
                                    if (_i3207 < 0) break;
                                    let _g3213 = 0;
                                    G3214: {
                                      const _a3215 = sp.cellEdges[_t3157];
                                      for (let _i3216 = 0; _i3216 < _a3215.length; _i3216++) {
                                        const v_z = _a3215[_i3216];
                                        if (!((_f3202[v_z] === 1))) continue;
                                        _g3213++;
                                      }
                                    }
                                    if (!((_g3213 === arms(sp, cl, _t3157)))) continue;
                                    if (true) {
                                      _q3199 = true;
                                      break Q3200;
                                    }
                                  }
                                }
                                _c3217 = _q3199;
                              }
                              if (!(_c3217)) continue;
                              const _t3218 = (sp.edgeEnds[2 * v_y] === _t3157 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t3219 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t3157]);
                              const _g3220: number[] = [];
                              G3221: {
                                const _a3227 = through(sp, _t3218, _t3219);
                                for (let _i3228 = 0; _i3228 < _a3227.length; _i3228++) {
                                  const v_t = _a3227[_i3228];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a3229 = sp.cellEdges[v_t];
                                  for (let _i3230 = 0; _i3230 < _a3229.length; _i3230++) {
                                    const v_y = _a3229[_i3230];
                                    L3231: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L3231;
                                      if (!_g3220.includes(v_z)) _g3220.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a3232 = union(through(sp, _t3218, _t3219), _g3220);
                              for (let _i3233 = 0; _i3233 < _a3232.length; _i3233++) {
                                const v_t = _a3232[_i3233];
                                if (!_g3158.includes(v_t)) _g3158.push(v_t);
                              }
                            }
                          }
                          const _a3234 = union(setOf(_t3157), _g3158);
                          for (let _i3235 = 0; _i3235 < _a3234.length; _i3235++) {
                            const v_t = _a3234[_i3235];
                            if (!_g3072.includes(v_t)) _g3072.push(v_t);
                          }
                        }
                      }
                      _c3236 = (union(setOf(v_c), _g3072).length >= sp.cells.length);
                    }
                    _c3237 = _c3236;
                  }
                  let _c3283: boolean = _c3237;
                  if (_c3283) {
                    let _q3238 = true;
                    Q3239: {
                      const _g3240: number[] = [];
                      G3241: {
                        const _a3244 = sp.cellEdges[v_c];
                        for (let _i3245 = 0; _i3245 < _a3244.length; _i3245++) {
                          const v_x = _a3244[_i3245];
                          if (!((_f3047[v_x] === 1))) continue;
                          _g3240.push(v_x);
                        }
                      }
                      const v_M = union(v_L, _g3240);
                      const _a3246 = sp.cellEdges[v_c];
                      for (let _i3247 = 0; _i3247 < _a3246.length; _i3247++) {
                        const v_x = _a3246[_i3247];
                        L3248: {
                          const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          let _c3253: boolean = (v_j !== v_c);
                          if (_c3253) {
                            let _q3249 = false;
                            Q3250: {
                              const _a3251 = sp.cellEdges[v_j];
                              for (let _i3252 = 0; _i3252 < _a3251.length; _i3252++) {
                                const v_y = _a3251[_i3252];
                                if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                                  _q3249 = true;
                                  break Q3250;
                                }
                              }
                            }
                            _c3253 = _q3249;
                          }
                          if (!(_c3253)) break L3248;
                          let _q3254 = false;
                          Q3255: {
                            const _f3257 = new Int32Array(sp.edges.length).fill(-1);
                            let _l3258: readonly number[] = [];
                            const _s3259: number[] = [];
                            const _a3256 = sp.cellEdges[v_j];
                            for (const _e3260 of _l3258) _f3257[_e3260] = -1;
                            _l3258 = _a3256;
                            let _i3262 = 0;
                            _s3259[0] = 0;
                            let _o3266 = _a3256.length === 0;
                            for (;;) {
                              if (_a3256.length === 0) {
                                if (!_o3266) break;
                                _o3266 = false;
                              }
                              while (_a3256.length > 0 && _i3262 >= 0) {
                                const _e3260 = _a3256[_i3262];
                                if (_s3259[_i3262] > 0) _f3257[_e3260] = -1;
                                let _r3265 = (cands[_e3260] >= 0 ? cands[_e3260] : (cands[_e3260] = b.cands[_e3260])) & ~((2 << _s3259[_i3262]) - 1);
                                let _d3261 = 0;
                                V3264: for (; _r3265 !== 0; _r3265 &= _r3265 - 1) {
                                  _d3261 = 31 - Math.clz32(_r3265 & -_r3265);
                                  _f3257[_e3260] = _d3261;
                                  for (let _j3263 = 0; _j3263 < _i3262; _j3263++) {
                                    const _y3267 = _a3256[_j3263];
                                    if (!((((arms(sp, cl, v_j) === 2) && (_f3257[_e3260] === 1)) && (_f3257[_y3267] === 1)))) continue;
                                    if (!((bent(sp, _e3260, _y3267) === (clueAt(cl.piece, v_j) === 3)))) continue V3264;
                                  }
                                  for (let _j3263 = 0; _j3263 < _i3262; _j3263++) {
                                    const _y3268 = _a3256[_j3263];
                                    if (!(((((((_f3257[_e3260] === 1) && (_f3257[_y3268] === 1)) && !((b.grid[_e3260] !== 0))) && !((b.grid[_y3268] !== 0))) && !([sp.edgeEnds[2 * _e3260], sp.edgeEnds[2 * _e3260 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y3268], sp.edgeEnds[2 * _y3268 + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, (sp.edgeEnds[2 * _e3260] === v_j ? sp.edgeEnds[2 * _e3260 + 1] : sp.edgeEnds[2 * _e3260]), v_M).includes((sp.edgeEnds[2 * _y3268] === v_j ? sp.edgeEnds[2 * _y3268 + 1] : sp.edgeEnds[2 * _y3268]))))) continue V3264;
                                  }
                                  break;
                                }
                                if (_r3265 === 0) {
                                  _s3259[_i3262] = 0;
                                  _i3262--;
                                  continue;
                                }
                                _s3259[_i3262] = _d3261;
                                if (_i3262 === _a3256.length - 1) break;
                                _i3262++;
                                _s3259[_i3262] = 0;
                              }
                              if (_i3262 < 0) break;
                              let _q3269 = true;
                              Q3270: {
                                const _a3271 = sp.cellEdges[v_j];
                                for (let _i3272 = 0; _i3272 < _a3271.length; _i3272++) {
                                  const v_y = _a3271[_i3272];
                                  if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                                  if (!((_f3257[v_y] === _f3047[v_y]))) {
                                    _q3269 = false;
                                    break Q3270;
                                  }
                                }
                              }
                              let _c3277: boolean = _q3269;
                              if (_c3277) {
                                let _g3273 = 0;
                                G3274: {
                                  const _a3275 = sp.cellEdges[v_j];
                                  for (let _i3276 = 0; _i3276 < _a3275.length; _i3276++) {
                                    const v_y = _a3275[_i3276];
                                    if (!((_f3257[v_y] === 1))) continue;
                                    _g3273++;
                                  }
                                }
                                _c3277 = (_g3273 === arms(sp, cl, v_j));
                              }
                              let _c3282: boolean = _c3277;
                              if (_c3282) {
                                let _q3278 = true;
                                Q3279: {
                                  const _a3280 = sp.cellEdges[v_j];
                                  for (let _i3281 = 0; _i3281 < _a3280.length; _i3281++) {
                                    const v_y = _a3280[_i3281];
                                    if (!((((_f3257[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                      _q3278 = false;
                                      break Q3279;
                                    }
                                  }
                                }
                                _c3282 = _q3278;
                              }
                              if (!(_c3282)) continue;
                              if (true) {
                                _q3254 = true;
                                break Q3255;
                              }
                            }
                          }
                          if (!(_q3254)) {
                            _q3238 = false;
                            break Q3239;
                          }
                        }
                      }
                    }
                    _c3283 = _q3238;
                  }
                  if (!(_c3283)) continue;
                  if (true) {
                    _q3044 = true;
                    break Q3045;
                  }
                }
              }
              if (!(_q3044)) continue;
              _g2798.push(v_e);
            }
          }
          const _g3284: number[] = [];
          G3285: {
            const _a3528 = v_F;
            for (let _i3529 = 0; _i3529 < _a3528.length; _i3529++) {
              const v_e = _a3528[_i3529];
              let _q3530 = false;
              Q3531: {
                const _f3533 = new Int32Array(sp.edges.length).fill(-1);
                let _l3534: readonly number[] = [];
                const _s3535: number[] = [];
                const _a3532 = sp.cellEdges[v_c];
                for (const _e3536 of _l3534) _f3533[_e3536] = -1;
                _l3534 = _a3532;
                let _i3538 = 0;
                _s3535[0] = 0;
                let _o3542 = _a3532.length === 0;
                for (;;) {
                  if (_a3532.length === 0) {
                    if (!_o3542) break;
                    _o3542 = false;
                  }
                  while (_a3532.length > 0 && _i3538 >= 0) {
                    const _e3536 = _a3532[_i3538];
                    if (_s3535[_i3538] > 0) _f3533[_e3536] = -1;
                    let _r3541 = (cands[_e3536] >= 0 ? cands[_e3536] : (cands[_e3536] = b.cands[_e3536])) & ~((2 << _s3535[_i3538]) - 1);
                    let _d3537 = 0;
                    V3540: for (; _r3541 !== 0; _r3541 &= _r3541 - 1) {
                      _d3537 = 31 - Math.clz32(_r3541 & -_r3541);
                      _f3533[_e3536] = _d3537;
                      if (_e3536 === v_e && _d3537 !== 2) continue;
                      for (let _j3539 = 0; _j3539 < _i3538; _j3539++) {
                        const _y3543 = _a3532[_j3539];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f3533[_e3536] === 1)) && (_f3533[_y3543] === 1)))) continue;
                        if (!((bent(sp, _e3536, _y3543) === (clueAt(cl.piece, v_c) === 3)))) continue V3540;
                      }
                      for (let _j3539 = 0; _j3539 < _i3538; _j3539++) {
                        const _y3544 = _a3532[_j3539];
                        if (!(((((_f3533[_e3536] === 1) && (_f3533[_y3544] === 1)) && !((b.grid[_e3536] !== 0))) && !((b.grid[_y3544] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e3536] === v_c ? sp.edgeEnds[2 * _e3536 + 1] : sp.edgeEnds[2 * _e3536]), v_L).includes((sp.edgeEnds[2 * _y3544] === v_c ? sp.edgeEnds[2 * _y3544 + 1] : sp.edgeEnds[2 * _y3544]))))) continue V3540;
                      }
                      break;
                    }
                    if (_r3541 === 0) {
                      _s3535[_i3538] = 0;
                      _i3538--;
                      continue;
                    }
                    _s3535[_i3538] = _d3537;
                    if (_i3538 === _a3532.length - 1) break;
                    _i3538++;
                    _s3535[_i3538] = 0;
                  }
                  if (_i3538 < 0) break;
                  let _g3545 = 0;
                  G3546: {
                    const _a3547 = sp.cellEdges[v_c];
                    for (let _i3548 = 0; _i3548 < _a3547.length; _i3548++) {
                      const v_x = _a3547[_i3548];
                      if (!((_f3533[v_x] === 1))) continue;
                      _g3545++;
                    }
                  }
                  let _c3553: boolean = (_g3545 === arms(sp, cl, v_c));
                  if (_c3553) {
                    let _q3549 = true;
                    Q3550: {
                      const _a3551 = sp.cellEdges[v_c];
                      for (let _i3552 = 0; _i3552 < _a3551.length; _i3552++) {
                        const v_x = _a3551[_i3552];
                        if (!(((_f3533[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg1350.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q3549 = false;
                          break Q3550;
                        }
                      }
                    }
                    _c3553 = _q3549;
                  }
                  let _c3723: boolean = _c3553;
                  if (_c3723) {
                    let _q3554 = false;
                    Q3555: {
                      const _a3556 = sp.cellEdges[v_c];
                      for (let _i3557 = 0; _i3557 < _a3556.length; _i3557++) {
                        const v_x = _a3556[_i3557];
                        if (!((_f3533[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q3554 = true;
                          break Q3555;
                        }
                      }
                    }
                    let _c3722: boolean = _q3554;
                    if (!_c3722) {
                      const _g3558: number[] = [];
                      G3559: {
                        const _a3641 = sp.cellEdges[v_c];
                        for (let _i3642 = 0; _i3642 < _a3641.length; _i3642++) {
                          const v_x = _a3641[_i3642];
                          if (!((_f3533[v_x] === 1))) continue;
                          const _t3643 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g3644: number[] = [];
                          G3645: {
                            const _a3683 = sp.cellEdges[_t3643];
                            for (let _i3684 = 0; _i3684 < _a3683.length; _i3684++) {
                              const v_y = _a3683[_i3684];
                              let _c3703: boolean = (v_y !== v_x);
                              if (_c3703) {
                                let _q3685 = false;
                                Q3686: {
                                  const _f3688 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l3689: readonly number[] = [];
                                  const _s3690: number[] = [];
                                  const _a3687 = sp.cellEdges[_t3643];
                                  for (const _e3691 of _l3689) _f3688[_e3691] = -1;
                                  _l3689 = _a3687;
                                  let _i3693 = 0;
                                  _s3690[0] = 0;
                                  let _o3697 = _a3687.length === 0;
                                  for (;;) {
                                    if (_a3687.length === 0) {
                                      if (!_o3697) break;
                                      _o3697 = false;
                                    }
                                    while (_a3687.length > 0 && _i3693 >= 0) {
                                      const _e3691 = _a3687[_i3693];
                                      if (_s3690[_i3693] > 0) _f3688[_e3691] = -1;
                                      let _r3696 = (cands[_e3691] >= 0 ? cands[_e3691] : (cands[_e3691] = b.cands[_e3691])) & ~((2 << _s3690[_i3693]) - 1);
                                      let _d3692 = 0;
                                      V3695: for (; _r3696 !== 0; _r3696 &= _r3696 - 1) {
                                        _d3692 = 31 - Math.clz32(_r3696 & -_r3696);
                                        _f3688[_e3691] = _d3692;
                                        if (_e3691 === v_x && _d3692 !== 1) continue;
                                        if (_e3691 === v_y && _d3692 !== 1) continue;
                                        for (let _j3694 = 0; _j3694 < _i3693; _j3694++) {
                                          const _y3698 = _a3687[_j3694];
                                          if (!((((arms(sp, cl, _t3643) === 2) && (_f3688[_e3691] === 1)) && (_f3688[_y3698] === 1)))) continue;
                                          if (!((bent(sp, _e3691, _y3698) === (clueAt(cl.piece, _t3643) === 3)))) continue V3695;
                                        }
                                        break;
                                      }
                                      if (_r3696 === 0) {
                                        _s3690[_i3693] = 0;
                                        _i3693--;
                                        continue;
                                      }
                                      _s3690[_i3693] = _d3692;
                                      if (_i3693 === _a3687.length - 1) break;
                                      _i3693++;
                                      _s3690[_i3693] = 0;
                                    }
                                    if (_i3693 < 0) break;
                                    let _g3699 = 0;
                                    G3700: {
                                      const _a3701 = sp.cellEdges[_t3643];
                                      for (let _i3702 = 0; _i3702 < _a3701.length; _i3702++) {
                                        const v_z = _a3701[_i3702];
                                        if (!((_f3688[v_z] === 1))) continue;
                                        _g3699++;
                                      }
                                    }
                                    if (!((_g3699 === arms(sp, cl, _t3643)))) continue;
                                    if (true) {
                                      _q3685 = true;
                                      break Q3686;
                                    }
                                  }
                                }
                                _c3703 = _q3685;
                              }
                              if (!(_c3703)) continue;
                              const _t3704 = (sp.edgeEnds[2 * v_y] === _t3643 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t3705 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t3643]);
                              const _g3706: number[] = [];
                              G3707: {
                                const _a3713 = through(sp, _t3704, _t3705);
                                for (let _i3714 = 0; _i3714 < _a3713.length; _i3714++) {
                                  const v_t = _a3713[_i3714];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a3715 = sp.cellEdges[v_t];
                                  for (let _i3716 = 0; _i3716 < _a3715.length; _i3716++) {
                                    const v_y = _a3715[_i3716];
                                    L3717: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L3717;
                                      if (!_g3706.includes(v_z)) _g3706.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a3718 = union(through(sp, _t3704, _t3705), _g3706);
                              for (let _i3719 = 0; _i3719 < _a3718.length; _i3719++) {
                                const v_t = _a3718[_i3719];
                                if (!_g3644.includes(v_t)) _g3644.push(v_t);
                              }
                            }
                          }
                          const _a3720 = union(setOf(_t3643), _g3644);
                          for (let _i3721 = 0; _i3721 < _a3720.length; _i3721++) {
                            const v_t = _a3720[_i3721];
                            if (!_g3558.includes(v_t)) _g3558.push(v_t);
                          }
                        }
                      }
                      _c3722 = (union(setOf(v_c), _g3558).length >= sp.cells.length);
                    }
                    _c3723 = _c3722;
                  }
                  let _c3769: boolean = _c3723;
                  if (_c3769) {
                    let _q3724 = true;
                    Q3725: {
                      const _g3726: number[] = [];
                      G3727: {
                        const _a3730 = sp.cellEdges[v_c];
                        for (let _i3731 = 0; _i3731 < _a3730.length; _i3731++) {
                          const v_x = _a3730[_i3731];
                          if (!((_f3533[v_x] === 1))) continue;
                          _g3726.push(v_x);
                        }
                      }
                      const v_M = union(v_L, _g3726);
                      const _a3732 = sp.cellEdges[v_c];
                      for (let _i3733 = 0; _i3733 < _a3732.length; _i3733++) {
                        const v_x = _a3732[_i3733];
                        L3734: {
                          const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          let _c3739: boolean = (v_j !== v_c);
                          if (_c3739) {
                            let _q3735 = false;
                            Q3736: {
                              const _a3737 = sp.cellEdges[v_j];
                              for (let _i3738 = 0; _i3738 < _a3737.length; _i3738++) {
                                const v_y = _a3737[_i3738];
                                if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                                  _q3735 = true;
                                  break Q3736;
                                }
                              }
                            }
                            _c3739 = _q3735;
                          }
                          if (!(_c3739)) break L3734;
                          let _q3740 = false;
                          Q3741: {
                            const _f3743 = new Int32Array(sp.edges.length).fill(-1);
                            let _l3744: readonly number[] = [];
                            const _s3745: number[] = [];
                            const _a3742 = sp.cellEdges[v_j];
                            for (const _e3746 of _l3744) _f3743[_e3746] = -1;
                            _l3744 = _a3742;
                            let _i3748 = 0;
                            _s3745[0] = 0;
                            let _o3752 = _a3742.length === 0;
                            for (;;) {
                              if (_a3742.length === 0) {
                                if (!_o3752) break;
                                _o3752 = false;
                              }
                              while (_a3742.length > 0 && _i3748 >= 0) {
                                const _e3746 = _a3742[_i3748];
                                if (_s3745[_i3748] > 0) _f3743[_e3746] = -1;
                                let _r3751 = (cands[_e3746] >= 0 ? cands[_e3746] : (cands[_e3746] = b.cands[_e3746])) & ~((2 << _s3745[_i3748]) - 1);
                                let _d3747 = 0;
                                V3750: for (; _r3751 !== 0; _r3751 &= _r3751 - 1) {
                                  _d3747 = 31 - Math.clz32(_r3751 & -_r3751);
                                  _f3743[_e3746] = _d3747;
                                  for (let _j3749 = 0; _j3749 < _i3748; _j3749++) {
                                    const _y3753 = _a3742[_j3749];
                                    if (!((((arms(sp, cl, v_j) === 2) && (_f3743[_e3746] === 1)) && (_f3743[_y3753] === 1)))) continue;
                                    if (!((bent(sp, _e3746, _y3753) === (clueAt(cl.piece, v_j) === 3)))) continue V3750;
                                  }
                                  for (let _j3749 = 0; _j3749 < _i3748; _j3749++) {
                                    const _y3754 = _a3742[_j3749];
                                    if (!(((((((_f3743[_e3746] === 1) && (_f3743[_y3754] === 1)) && !((b.grid[_e3746] !== 0))) && !((b.grid[_y3754] !== 0))) && !([sp.edgeEnds[2 * _e3746], sp.edgeEnds[2 * _e3746 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y3754], sp.edgeEnds[2 * _y3754 + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, (sp.edgeEnds[2 * _e3746] === v_j ? sp.edgeEnds[2 * _e3746 + 1] : sp.edgeEnds[2 * _e3746]), v_M).includes((sp.edgeEnds[2 * _y3754] === v_j ? sp.edgeEnds[2 * _y3754 + 1] : sp.edgeEnds[2 * _y3754]))))) continue V3750;
                                  }
                                  break;
                                }
                                if (_r3751 === 0) {
                                  _s3745[_i3748] = 0;
                                  _i3748--;
                                  continue;
                                }
                                _s3745[_i3748] = _d3747;
                                if (_i3748 === _a3742.length - 1) break;
                                _i3748++;
                                _s3745[_i3748] = 0;
                              }
                              if (_i3748 < 0) break;
                              let _q3755 = true;
                              Q3756: {
                                const _a3757 = sp.cellEdges[v_j];
                                for (let _i3758 = 0; _i3758 < _a3757.length; _i3758++) {
                                  const v_y = _a3757[_i3758];
                                  if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                                  if (!((_f3743[v_y] === _f3533[v_y]))) {
                                    _q3755 = false;
                                    break Q3756;
                                  }
                                }
                              }
                              let _c3763: boolean = _q3755;
                              if (_c3763) {
                                let _g3759 = 0;
                                G3760: {
                                  const _a3761 = sp.cellEdges[v_j];
                                  for (let _i3762 = 0; _i3762 < _a3761.length; _i3762++) {
                                    const v_y = _a3761[_i3762];
                                    if (!((_f3743[v_y] === 1))) continue;
                                    _g3759++;
                                  }
                                }
                                _c3763 = (_g3759 === arms(sp, cl, v_j));
                              }
                              let _c3768: boolean = _c3763;
                              if (_c3768) {
                                let _q3764 = true;
                                Q3765: {
                                  const _a3766 = sp.cellEdges[v_j];
                                  for (let _i3767 = 0; _i3767 < _a3766.length; _i3767++) {
                                    const v_y = _a3766[_i3767];
                                    if (!((((_f3743[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                      _q3764 = false;
                                      break Q3765;
                                    }
                                  }
                                }
                                _c3768 = _q3764;
                              }
                              if (!(_c3768)) continue;
                              if (true) {
                                _q3740 = true;
                                break Q3741;
                              }
                            }
                          }
                          if (!(_q3740)) {
                            _q3724 = false;
                            break Q3725;
                          }
                        }
                      }
                    }
                    _c3769 = _q3724;
                  }
                  if (!(_c3769)) continue;
                  if (true) {
                    _q3530 = true;
                    break Q3531;
                  }
                }
              }
              if (!(_q3530)) continue;
              _g3284.push(v_e);
            }
          }
          let _q3770 = true;
          Q3771: {
            const _a3772 = v_F;
            for (let _i3773 = 0; _i3773 < _a3772.length; _i3773++) {
              const v_e = _a3772[_i3773];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q3770 = false;
                break Q3771;
              }
            }
          }
          freshBinding("strandLock", [sameSet(v_L, _g2536), sameSet(v_U, _g2542), sameSet(v_P, _g2626), (sp.cells.includes(v_c)), sameSet(v_F, _g2632), (v_F.length > 0), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g2638), sameSet(v_W, _g2798), sameSet(v_N, _g3284), _q3770], ["L =", "U =", "P =", "c in", "F =", "where of F", "G =", "K =", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q3774 = true;
        Q3775: {
          const _a3776 = v_F;
          for (let _i3777 = 0; _i3777 < _a3776.length; _i3777++) {
            const v_e = _a3776[_i3777];
            let _c3779: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c3779) {
              let _c3778: boolean = !(!(v_W.includes(v_e)));
              if (!_c3778) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c3778 = true;
              }
              _c3779 = _c3778;
            }
            let _c3781: boolean = _c3779;
            if (_c3781) {
              let _c3780: boolean = !(!(v_N.includes(v_e)));
              if (!_c3780) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c3780 = true;
              }
              _c3781 = _c3780;
            }
            if (!(_c3781)) {
              _q3774 = false;
              break Q3775;
            }
          }
        }
        if (!(_q3774)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, F: v_F.slice(), G: v_G.slice(), K: v_K.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface StrandNoteBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  G: readonly number[];
  K: readonly number[];
  e: number;
  A: boolean;
  B: boolean;
}

const strandNoteFacts: number[] = [];
let strandNoteCands = new Int32Array(0);
let strandNote_f801 = new Int32Array(0);
let strandNote_l802: readonly number[] = [];
let strandNote_f821 = new Int32Array(0);
let strandNote_l822: readonly number[] = [];
const strandNote_st973 = stamps();
let strandNote_f979 = new Int32Array(0);
let strandNote_l980: readonly number[] = [];
const strandNote_st1010 = stamps();
let strandNote_p1024 = new Int32Array(0);
let strandNote_l1025: readonly number[] = [];
let strandNote_f1030 = new Int32Array(0);
let strandNote_l1031: readonly number[] = [];
const strandNote_st1138 = stamps();
const strandNote_st1181 = stamps();
let strandNote_f1187 = new Int32Array(0);
let strandNote_l1188: readonly number[] = [];
const strandNote_st1217 = stamps();
let strandNote_f1251 = new Int32Array(0);
let strandNote_l1252: readonly number[] = [];
let strandNote_p1279 = new Int32Array(0);
let strandNote_l1280: readonly number[] = [];
let strandNote_f1285 = new Int32Array(0);
let strandNote_l1286: readonly number[] = [];
const strandNote_st1393 = stamps();
const strandNote_st1436 = stamps();
let strandNote_f1442 = new Int32Array(0);
let strandNote_l1443: readonly number[] = [];
const strandNote_st1472 = stamps();
let strandNote_f1506 = new Int32Array(0);
let strandNote_l1507: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandNoteBinding> | null): number {
  const _g746: number[] = [];
  const _g752: number[] = [];
  if (strandNote_f801.length < sp.edges.length) strandNote_f801 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f801.fill(-1);
  strandNote_l802 = [];
  const _s803: number[] = [];
  if (strandNote_f821.length < sp.edges.length) strandNote_f821 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f821.fill(-1);
  strandNote_l822 = [];
  const _s823: number[] = [];
  const _g837: number[] = [];
  const _g850: number[] = [];
  const _g934: number[] = [];
  if (strandNote_f979.length < sp.edges.length) strandNote_f979 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f979.fill(-1);
  strandNote_l980 = [];
  const _s981: number[] = [];
  const _g1003: number[] = [];
  if (strandNote_p1024.length < sp.edges.length) strandNote_p1024 = new Int32Array(sp.edges.length);
  else strandNote_p1024.fill(0);
  strandNote_l1025 = [];
  let _y1026 = false;
  if (strandNote_f1030.length < sp.edges.length) strandNote_f1030 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f1030.fill(-1);
  strandNote_l1031 = [];
  const _s1032: number[] = [];
  const _g1055: number[] = [];
  const _g1142: number[] = [];
  if (strandNote_f1187.length < sp.edges.length) strandNote_f1187 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f1187.fill(-1);
  strandNote_l1188 = [];
  const _s1189: number[] = [];
  const _g1210: number[] = [];
  const _g1234: number[] = [];
  if (strandNote_f1251.length < sp.edges.length) strandNote_f1251 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f1251.fill(-1);
  strandNote_l1252 = [];
  const _s1253: number[] = [];
  if (strandNote_p1279.length < sp.edges.length) strandNote_p1279 = new Int32Array(sp.edges.length);
  else strandNote_p1279.fill(0);
  strandNote_l1280 = [];
  let _y1281 = false;
  if (strandNote_f1285.length < sp.edges.length) strandNote_f1285 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f1285.fill(-1);
  strandNote_l1286 = [];
  const _s1287: number[] = [];
  const _g1310: number[] = [];
  const _g1397: number[] = [];
  if (strandNote_f1442.length < sp.edges.length) strandNote_f1442 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f1442.fill(-1);
  strandNote_l1443 = [];
  const _s1444: number[] = [];
  const _g1465: number[] = [];
  const _g1489: number[] = [];
  if (strandNote_f1506.length < sp.edges.length) strandNote_f1506 = new Int32Array(sp.edges.length).fill(-1);
  else strandNote_f1506.fill(-1);
  strandNote_l1507 = [];
  const _s1508: number[] = [];
  const _g1535: number[] = [];
  const facts = strandNoteFacts;
  let fired = 0;
  let changed = false;
  const _k812 = armsKept.board(cl);
  const _h1021 = sp.cells.length;
  let _epoch = 0;
  if (strandNoteCands.length < sp.edges.length) strandNoteCands = new Int32Array(sp.edges.length);
  const cands = strandNoteCands;
  cands.fill(-1);
  const _m2281_0 = b.made[0];
  _g746.length = 0;
  G747: {
    const _a750 = sp.edges;
    for (let _i751 = 0; _i751 < _a750.length; _i751++) {
      const v_e = _a750[_i751];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g746.push(v_e);
    }
  }
  const v_L = _g746;
  const _m2282_1 = b.made[1];
  const _eg849 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g752.length = 0;
  G753: {
    const _a795 = sp.edges;
    for (let _i796 = 0; _i796 < _a795.length; _i796++) {
      const v_e = _a795[_i796];
      const _t797 = sp.edgeEnds[2 * v_e];
      let _q798 = false;
      Q799: {
        const _a800 = sp.cellEdges[_t797];
        for (const _e804 of strandNote_l802) strandNote_f801[_e804] = -1;
        strandNote_l802 = _a800;
        let _i806 = 0;
        _s803[0] = 0;
        let _o810 = _a800.length === 0;
        for (;;) {
          if (_a800.length === 0) {
            if (!_o810) break;
            _o810 = false;
          }
          while (_a800.length > 0 && _i806 >= 0) {
            const _e804 = _a800[_i806];
            if (_s803[_i806] > 0) strandNote_f801[_e804] = -1;
            let _r809 = (cands[_e804] >= 0 ? cands[_e804] : (cands[_e804] = b.cands[_e804])) & ~((2 << _s803[_i806]) - 1);
            let _d805 = 0;
            V808: for (; _r809 !== 0; _r809 &= _r809 - 1) {
              _d805 = 31 - Math.clz32(_r809 & -_r809);
              strandNote_f801[_e804] = _d805;
              if (_e804 === v_e && _d805 !== 1) continue;
              for (let _j807 = 0; _j807 < _i806; _j807++) {
                const _y811 = _a800[_j807];
                if (!(((((_k812[_t797] ?? arms(sp, cl, _t797)) === 2) && (strandNote_f801[_e804] === 1)) && (strandNote_f801[_y811] === 1)))) continue;
                if (!((bent(sp, _e804, _y811) === (clueAt(cl.piece, _t797) === 3)))) continue V808;
              }
              break;
            }
            if (_r809 === 0) {
              _s803[_i806] = 0;
              _i806--;
              continue;
            }
            _s803[_i806] = _d805;
            if (_i806 === _a800.length - 1) break;
            _i806++;
            _s803[_i806] = 0;
          }
          if (_i806 < 0) break;
          let _g813 = 0;
          G814: {
            const _a815 = sp.cellEdges[_t797];
            for (let _i816 = 0; _i816 < _a815.length; _i816++) {
              const v_x = _a815[_i816];
              if (!((strandNote_f801[v_x] === 1))) continue;
              _g813++;
            }
          }
          if (!((_g813 === (_k812[_t797] ?? arms(sp, cl, _t797))))) continue;
          if (true) {
            _q798 = true;
            break Q799;
          }
        }
      }
      let _c836: boolean = _q798;
      if (_c836) {
        const _t817 = sp.edgeEnds[2 * v_e + 1];
        let _q818 = false;
        Q819: {
          const _a820 = sp.cellEdges[_t817];
          for (const _e824 of strandNote_l822) strandNote_f821[_e824] = -1;
          strandNote_l822 = _a820;
          let _i826 = 0;
          _s823[0] = 0;
          let _o830 = _a820.length === 0;
          for (;;) {
            if (_a820.length === 0) {
              if (!_o830) break;
              _o830 = false;
            }
            while (_a820.length > 0 && _i826 >= 0) {
              const _e824 = _a820[_i826];
              if (_s823[_i826] > 0) strandNote_f821[_e824] = -1;
              let _r829 = (cands[_e824] >= 0 ? cands[_e824] : (cands[_e824] = b.cands[_e824])) & ~((2 << _s823[_i826]) - 1);
              let _d825 = 0;
              V828: for (; _r829 !== 0; _r829 &= _r829 - 1) {
                _d825 = 31 - Math.clz32(_r829 & -_r829);
                strandNote_f821[_e824] = _d825;
                if (_e824 === v_e && _d825 !== 1) continue;
                for (let _j827 = 0; _j827 < _i826; _j827++) {
                  const _y831 = _a820[_j827];
                  if (!(((((_k812[_t817] ?? arms(sp, cl, _t817)) === 2) && (strandNote_f821[_e824] === 1)) && (strandNote_f821[_y831] === 1)))) continue;
                  if (!((bent(sp, _e824, _y831) === (clueAt(cl.piece, _t817) === 3)))) continue V828;
                }
                break;
              }
              if (_r829 === 0) {
                _s823[_i826] = 0;
                _i826--;
                continue;
              }
              _s823[_i826] = _d825;
              if (_i826 === _a820.length - 1) break;
              _i826++;
              _s823[_i826] = 0;
            }
            if (_i826 < 0) break;
            let _g832 = 0;
            G833: {
              const _a834 = sp.cellEdges[_t817];
              for (let _i835 = 0; _i835 < _a834.length; _i835++) {
                const v_x = _a834[_i835];
                if (!((strandNote_f821[v_x] === 1))) continue;
                _g832++;
              }
            }
            if (!((_g832 === (_k812[_t817] ?? arms(sp, cl, _t817))))) continue;
            if (true) {
              _q818 = true;
              break Q819;
            }
          }
        }
        _c836 = _q818;
      }
      if (!(_c836)) continue;
      _g752.push(v_e);
    }
  }
  const v_U = _g752;
  const _mm1016 = memberMarks(v_U);
  _g837.length = 0;
  G838: {
    const _a841 = v_U;
    for (let _i842 = 0; _i842 < _a841.length; _i842++) {
      const v_e = _a841[_i842];
      if (!((((_k812[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k812[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g837.push(v_e);
    }
  }
  const v_P = _g837;
  const _a843 = sp.cells;
  for (let _i844 = 0; _i844 < _a843.length; _i844++) {
    const v_c = _a843[_i844];
    const _h995 = minus(v_P, sp.cellEdges[v_c]);
    let _q845 = false;
    Q846: {
      const _a847 = sp.cellEdges[v_c];
      for (let _i848 = 0; _i848 < _a847.length; _i848++) {
        const v_e = _a847[_i848];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q845 = true;
          break Q846;
        }
      }
    }
    if (!(_q845)) continue;
    const v_G = _eg849.of(v_c);
    _g850.length = 0;
    G851: {
      const _a931 = sp.cellEdges[v_c];
      for (let _i932 = 0; _i932 < _a931.length; _i932++) {
        const v_x = _a931[_i932];
        const _t933 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h996 = minus(_h995, sp.cellEdges[_t933]);
        const _eg998 = edgeGroups(sp, _h996);
        const _memo1001 = new Map<readonly number[], readonly number[]>();
        _g934.length = 0;
        strandNote_st973.pass++;
        G935: {
          const _a974 = sp.cellEdges[_t933];
          for (let _i975 = 0; _i975 < _a974.length; _i975++) {
            const v_y = _a974[_i975];
            let _c994: boolean = (v_y !== v_x);
            if (_c994) {
              let _q976 = false;
              Q977: {
                const _a978 = sp.cellEdges[_t933];
                for (const _e982 of strandNote_l980) strandNote_f979[_e982] = -1;
                strandNote_l980 = _a978;
                let _i984 = 0;
                _s981[0] = 0;
                let _o988 = _a978.length === 0;
                for (;;) {
                  if (_a978.length === 0) {
                    if (!_o988) break;
                    _o988 = false;
                  }
                  while (_a978.length > 0 && _i984 >= 0) {
                    const _e982 = _a978[_i984];
                    if (_s981[_i984] > 0) strandNote_f979[_e982] = -1;
                    let _r987 = (cands[_e982] >= 0 ? cands[_e982] : (cands[_e982] = b.cands[_e982])) & ~((2 << _s981[_i984]) - 1);
                    let _d983 = 0;
                    V986: for (; _r987 !== 0; _r987 &= _r987 - 1) {
                      _d983 = 31 - Math.clz32(_r987 & -_r987);
                      strandNote_f979[_e982] = _d983;
                      if (_e982 === v_x && _d983 !== 1) continue;
                      if (_e982 === v_y && _d983 !== 1) continue;
                      for (let _j985 = 0; _j985 < _i984; _j985++) {
                        const _y989 = _a978[_j985];
                        if (!(((((_k812[_t933] ?? arms(sp, cl, _t933)) === 2) && (strandNote_f979[_e982] === 1)) && (strandNote_f979[_y989] === 1)))) continue;
                        if (!((bent(sp, _e982, _y989) === (clueAt(cl.piece, _t933) === 3)))) continue V986;
                      }
                      break;
                    }
                    if (_r987 === 0) {
                      _s981[_i984] = 0;
                      _i984--;
                      continue;
                    }
                    _s981[_i984] = _d983;
                    if (_i984 === _a978.length - 1) break;
                    _i984++;
                    _s981[_i984] = 0;
                  }
                  if (_i984 < 0) break;
                  let _g990 = 0;
                  G991: {
                    const _a992 = sp.cellEdges[_t933];
                    for (let _i993 = 0; _i993 < _a992.length; _i993++) {
                      const v_z = _a992[_i993];
                      if (!((strandNote_f979[v_z] === 1))) continue;
                      _g990++;
                    }
                  }
                  if (!((_g990 === (_k812[_t933] ?? arms(sp, cl, _t933))))) continue;
                  if (true) {
                    _q976 = true;
                    break Q977;
                  }
                }
              }
              _c994 = _q976;
            }
            if (!(_c994)) continue;
            const _t997 = (sp.edgeEnds[2 * v_y] === _t933 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t1000 = _eg998.of(_t997);
            let _gs1002 = _memo1001.get(_t1000);
            if (_gs1002 === undefined) {
              _g1003.length = 0;
              strandNote_st1010.pass++;
              G1004: {
                const _a1011 = _t1000;
                for (let _i1012 = 0; _i1012 < _a1011.length; _i1012++) {
                  const v_t = _a1011[_i1012];
                  if (!(((_k812[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a1013 = sp.cellEdges[v_t];
                  for (let _i1014 = 0; _i1014 < _a1013.length; _i1014++) {
                    const v_y = _a1013[_i1014];
                    L1015: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k812[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1016[v_y + 1] === 1)))) break L1015;
                      const _t1017 = v_z;
                      if (_g1003.length < 16) { if (!_g1003.includes(_t1017)) _g1003.push(_t1017); } else addOnce(_g1003, strandNote_st1010, _t1017);
                    }
                  }
                }
              }
              _gs1002 = _g1003.slice();
              _memo1001.set(_t1000, _gs1002);
            }
            const _a1018 = union(_eg998.of(_t997), _gs1002);
            for (let _i1019 = 0; _i1019 < _a1018.length; _i1019++) {
              const v_t = _a1018[_i1019];
              const _t1020 = v_t;
              if (_g934.length < 16) { if (!_g934.includes(_t1020)) _g934.push(_t1020); } else addOnce(_g934, strandNote_st973, _t1020);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t933), _g934)).length >= _h1021))) continue;
        _g850.push(v_x);
      }
    }
    const v_K = _g850;
    let _g1027 = -1;
    let _g1282 = -1;
    const _a1022 = sp.cellEdges[v_c];
    for (let _i1023 = 0; _i1023 < _a1022.length; _i1023++) {
      const v_e = _a1022[_i1023];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g1027 !== _epoch) {
        _g1027 = _epoch;
        for (const _e1028 of strandNote_l1025) strandNote_p1024[_e1028] = 0;
        _y1026 = false;
        const _a1029 = sp.cellEdges[v_c];
        for (const _e1033 of strandNote_l1031) strandNote_f1030[_e1033] = -1;
        strandNote_l1031 = _a1029;
        let _i1035 = 0;
        _s1032[0] = 0;
        let _o1039 = _a1029.length === 0;
        for (;;) {
          if (_a1029.length === 0) {
            if (!_o1039) break;
            _o1039 = false;
          }
          while (_a1029.length > 0 && _i1035 >= 0) {
            const _e1033 = _a1029[_i1035];
            if (_s1032[_i1035] > 0) strandNote_f1030[_e1033] = -1;
            let _r1038 = (cands[_e1033] >= 0 ? cands[_e1033] : (cands[_e1033] = b.cands[_e1033])) & ~((2 << _s1032[_i1035]) - 1);
            let _d1034 = 0;
            V1037: for (; _r1038 !== 0; _r1038 &= _r1038 - 1) {
              _d1034 = 31 - Math.clz32(_r1038 & -_r1038);
              strandNote_f1030[_e1033] = _d1034;
              for (let _j1036 = 0; _j1036 < _i1035; _j1036++) {
                const _y1040 = _a1029[_j1036];
                if (!(((((_k812[v_c] ?? arms(sp, cl, v_c)) === 2) && (strandNote_f1030[_e1033] === 1)) && (strandNote_f1030[_y1040] === 1)))) continue;
                if (!((bent(sp, _e1033, _y1040) === (clueAt(cl.piece, v_c) === 3)))) continue V1037;
              }
              for (let _j1036 = 0; _j1036 < _i1035; _j1036++) {
                const _y1041 = _a1029[_j1036];
                if (!(((((strandNote_f1030[_e1033] === 1) && (strandNote_f1030[_y1041] === 1)) && !((b.grid[_e1033] !== 0))) && !((b.grid[_y1041] !== 0))))) continue;
                if (!(!(_eg849.of((sp.edgeEnds[2 * _y1041] === v_c ? sp.edgeEnds[2 * _y1041 + 1] : sp.edgeEnds[2 * _y1041])) === _eg849.of((sp.edgeEnds[2 * _e1033] === v_c ? sp.edgeEnds[2 * _e1033 + 1] : sp.edgeEnds[2 * _e1033]))))) continue V1037;
              }
              break;
            }
            if (_r1038 === 0) {
              _s1032[_i1035] = 0;
              _i1035--;
              continue;
            }
            _s1032[_i1035] = _d1034;
            if (_i1035 === _a1029.length - 1) break;
            _i1035++;
            _s1032[_i1035] = 0;
          }
          if (_i1035 < 0) break;
          let _g1042 = 0;
          G1043: {
            const _a1044 = sp.cellEdges[v_c];
            for (let _i1045 = 0; _i1045 < _a1044.length; _i1045++) {
              const v_x = _a1044[_i1045];
              if (!((strandNote_f1030[v_x] === 1))) continue;
              _g1042++;
            }
          }
          let _c1050: boolean = (_g1042 === (_k812[v_c] ?? arms(sp, cl, v_c)));
          if (_c1050) {
            let _q1046 = true;
            Q1047: {
              const _a1048 = sp.cellEdges[v_c];
              for (let _i1049 = 0; _i1049 < _a1048.length; _i1049++) {
                const v_x = _a1048[_i1049];
                if (!(((strandNote_f1030[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg849.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q1046 = false;
                  break Q1047;
                }
              }
            }
            _c1050 = _q1046;
          }
          let _c1231: boolean = _c1050;
          if (_c1231) {
            let _q1051 = false;
            Q1052: {
              const _a1053 = sp.cellEdges[v_c];
              for (let _i1054 = 0; _i1054 < _a1053.length; _i1054++) {
                const v_x = _a1053[_i1054];
                if (!((strandNote_f1030[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q1051 = true;
                  break Q1052;
                }
              }
            }
            let _c1230: boolean = _q1051;
            if (!_c1230) {
              _g1055.length = 0;
              strandNote_st1138.pass++;
              G1056: {
                const _a1139 = sp.cellEdges[v_c];
                for (let _i1140 = 0; _i1140 < _a1139.length; _i1140++) {
                  const v_x = _a1139[_i1140];
                  if (!((strandNote_f1030[v_x] === 1))) continue;
                  const _t1141 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h1203 = minus(_h995, sp.cellEdges[_t1141]);
                  const _eg1205 = edgeGroups(sp, _h1203);
                  const _memo1208 = new Map<readonly number[], readonly number[]>();
                  _g1142.length = 0;
                  strandNote_st1181.pass++;
                  G1143: {
                    const _a1182 = sp.cellEdges[_t1141];
                    for (let _i1183 = 0; _i1183 < _a1182.length; _i1183++) {
                      const v_y = _a1182[_i1183];
                      let _c1202: boolean = (v_y !== v_x);
                      if (_c1202) {
                        let _q1184 = false;
                        Q1185: {
                          const _a1186 = sp.cellEdges[_t1141];
                          for (const _e1190 of strandNote_l1188) strandNote_f1187[_e1190] = -1;
                          strandNote_l1188 = _a1186;
                          let _i1192 = 0;
                          _s1189[0] = 0;
                          let _o1196 = _a1186.length === 0;
                          for (;;) {
                            if (_a1186.length === 0) {
                              if (!_o1196) break;
                              _o1196 = false;
                            }
                            while (_a1186.length > 0 && _i1192 >= 0) {
                              const _e1190 = _a1186[_i1192];
                              if (_s1189[_i1192] > 0) strandNote_f1187[_e1190] = -1;
                              let _r1195 = (cands[_e1190] >= 0 ? cands[_e1190] : (cands[_e1190] = b.cands[_e1190])) & ~((2 << _s1189[_i1192]) - 1);
                              let _d1191 = 0;
                              V1194: for (; _r1195 !== 0; _r1195 &= _r1195 - 1) {
                                _d1191 = 31 - Math.clz32(_r1195 & -_r1195);
                                strandNote_f1187[_e1190] = _d1191;
                                if (_e1190 === v_x && _d1191 !== 1) continue;
                                if (_e1190 === v_y && _d1191 !== 1) continue;
                                for (let _j1193 = 0; _j1193 < _i1192; _j1193++) {
                                  const _y1197 = _a1186[_j1193];
                                  if (!(((((_k812[_t1141] ?? arms(sp, cl, _t1141)) === 2) && (strandNote_f1187[_e1190] === 1)) && (strandNote_f1187[_y1197] === 1)))) continue;
                                  if (!((bent(sp, _e1190, _y1197) === (clueAt(cl.piece, _t1141) === 3)))) continue V1194;
                                }
                                break;
                              }
                              if (_r1195 === 0) {
                                _s1189[_i1192] = 0;
                                _i1192--;
                                continue;
                              }
                              _s1189[_i1192] = _d1191;
                              if (_i1192 === _a1186.length - 1) break;
                              _i1192++;
                              _s1189[_i1192] = 0;
                            }
                            if (_i1192 < 0) break;
                            let _g1198 = 0;
                            G1199: {
                              const _a1200 = sp.cellEdges[_t1141];
                              for (let _i1201 = 0; _i1201 < _a1200.length; _i1201++) {
                                const v_z = _a1200[_i1201];
                                if (!((strandNote_f1187[v_z] === 1))) continue;
                                _g1198++;
                              }
                            }
                            if (!((_g1198 === (_k812[_t1141] ?? arms(sp, cl, _t1141))))) continue;
                            if (true) {
                              _q1184 = true;
                              break Q1185;
                            }
                          }
                        }
                        _c1202 = _q1184;
                      }
                      if (!(_c1202)) continue;
                      const _t1204 = (sp.edgeEnds[2 * v_y] === _t1141 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t1207 = _eg1205.of(_t1204);
                      let _gs1209 = _memo1208.get(_t1207);
                      if (_gs1209 === undefined) {
                        _g1210.length = 0;
                        strandNote_st1217.pass++;
                        G1211: {
                          const _a1218 = _t1207;
                          for (let _i1219 = 0; _i1219 < _a1218.length; _i1219++) {
                            const v_t = _a1218[_i1219];
                            if (!(((_k812[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a1220 = sp.cellEdges[v_t];
                            for (let _i1221 = 0; _i1221 < _a1220.length; _i1221++) {
                              const v_y = _a1220[_i1221];
                              L1222: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k812[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1016[v_y + 1] === 1)))) break L1222;
                                const _t1223 = v_z;
                                if (_g1210.length < 16) { if (!_g1210.includes(_t1223)) _g1210.push(_t1223); } else addOnce(_g1210, strandNote_st1217, _t1223);
                              }
                            }
                          }
                        }
                        _gs1209 = _g1210.slice();
                        _memo1208.set(_t1207, _gs1209);
                      }
                      const _a1224 = union(_eg1205.of(_t1204), _gs1209);
                      for (let _i1225 = 0; _i1225 < _a1224.length; _i1225++) {
                        const v_t = _a1224[_i1225];
                        const _t1226 = v_t;
                        if (_g1142.length < 16) { if (!_g1142.includes(_t1226)) _g1142.push(_t1226); } else addOnce(_g1142, strandNote_st1181, _t1226);
                      }
                    }
                  }
                  const _a1227 = union(setOf(_t1141), _g1142);
                  for (let _i1228 = 0; _i1228 < _a1227.length; _i1228++) {
                    const v_t = _a1227[_i1228];
                    const _t1229 = v_t;
                    if (_g1055.length < 16) { if (!_g1055.includes(_t1229)) _g1055.push(_t1229); } else addOnce(_g1055, strandNote_st1138, _t1229);
                  }
                }
              }
              _c1230 = (union(setOf(v_c), _g1055).length >= _h1021);
            }
            _c1231 = _c1230;
          }
          let _c1278: boolean = _c1231;
          if (_c1278) {
            let _q1232 = true;
            Q1233: {
              _g1234.length = 0;
              G1235: {
                const _a1238 = sp.cellEdges[v_c];
                for (let _i1239 = 0; _i1239 < _a1238.length; _i1239++) {
                  const v_x = _a1238[_i1239];
                  if (!((strandNote_f1030[v_x] === 1))) continue;
                  _g1234.push(v_x);
                }
              }
              const v_M = union(v_L, _g1234);
              const _eg1263 = edgeGroups(sp, v_M);
              const _a1240 = sp.cellEdges[v_c];
              for (let _i1241 = 0; _i1241 < _a1240.length; _i1241++) {
                const v_x = _a1240[_i1241];
                L1242: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c1247: boolean = (v_j !== v_c);
                  if (_c1247) {
                    let _q1243 = false;
                    Q1244: {
                      const _a1245 = sp.cellEdges[v_j];
                      for (let _i1246 = 0; _i1246 < _a1245.length; _i1246++) {
                        const v_y = _a1245[_i1246];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q1243 = true;
                          break Q1244;
                        }
                      }
                    }
                    _c1247 = _q1243;
                  }
                  if (!(_c1247)) break L1242;
                  let _q1248 = false;
                  Q1249: {
                    const _a1250 = sp.cellEdges[v_j];
                    for (const _e1254 of strandNote_l1252) strandNote_f1251[_e1254] = -1;
                    strandNote_l1252 = _a1250;
                    let _i1256 = 0;
                    _s1253[0] = 0;
                    let _o1260 = _a1250.length === 0;
                    for (;;) {
                      if (_a1250.length === 0) {
                        if (!_o1260) break;
                        _o1260 = false;
                      }
                      while (_a1250.length > 0 && _i1256 >= 0) {
                        const _e1254 = _a1250[_i1256];
                        if (_s1253[_i1256] > 0) strandNote_f1251[_e1254] = -1;
                        let _r1259 = (cands[_e1254] >= 0 ? cands[_e1254] : (cands[_e1254] = b.cands[_e1254])) & ~((2 << _s1253[_i1256]) - 1);
                        let _d1255 = 0;
                        V1258: for (; _r1259 !== 0; _r1259 &= _r1259 - 1) {
                          _d1255 = 31 - Math.clz32(_r1259 & -_r1259);
                          strandNote_f1251[_e1254] = _d1255;
                          for (let _j1257 = 0; _j1257 < _i1256; _j1257++) {
                            const _y1261 = _a1250[_j1257];
                            if (!(((((_k812[v_j] ?? arms(sp, cl, v_j)) === 2) && (strandNote_f1251[_e1254] === 1)) && (strandNote_f1251[_y1261] === 1)))) continue;
                            if (!((bent(sp, _e1254, _y1261) === (clueAt(cl.piece, v_j) === 3)))) continue V1258;
                          }
                          for (let _j1257 = 0; _j1257 < _i1256; _j1257++) {
                            const _y1262 = _a1250[_j1257];
                            if (!(((((((strandNote_f1251[_e1254] === 1) && (strandNote_f1251[_y1262] === 1)) && !((b.grid[_e1254] !== 0))) && !((b.grid[_y1262] !== 0))) && !([sp.edgeEnds[2 * _e1254], sp.edgeEnds[2 * _e1254 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y1262], sp.edgeEnds[2 * _y1262 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg1263.of((sp.edgeEnds[2 * _y1262] === v_j ? sp.edgeEnds[2 * _y1262 + 1] : sp.edgeEnds[2 * _y1262])) === _eg1263.of((sp.edgeEnds[2 * _e1254] === v_j ? sp.edgeEnds[2 * _e1254 + 1] : sp.edgeEnds[2 * _e1254]))))) continue V1258;
                          }
                          break;
                        }
                        if (_r1259 === 0) {
                          _s1253[_i1256] = 0;
                          _i1256--;
                          continue;
                        }
                        _s1253[_i1256] = _d1255;
                        if (_i1256 === _a1250.length - 1) break;
                        _i1256++;
                        _s1253[_i1256] = 0;
                      }
                      if (_i1256 < 0) break;
                      let _q1264 = true;
                      Q1265: {
                        const _a1266 = sp.cellEdges[v_j];
                        for (let _i1267 = 0; _i1267 < _a1266.length; _i1267++) {
                          const v_y = _a1266[_i1267];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((strandNote_f1251[v_y] === strandNote_f1030[v_y]))) {
                            _q1264 = false;
                            break Q1265;
                          }
                        }
                      }
                      let _c1272: boolean = _q1264;
                      if (_c1272) {
                        let _g1268 = 0;
                        G1269: {
                          const _a1270 = sp.cellEdges[v_j];
                          for (let _i1271 = 0; _i1271 < _a1270.length; _i1271++) {
                            const v_y = _a1270[_i1271];
                            if (!((strandNote_f1251[v_y] === 1))) continue;
                            _g1268++;
                          }
                        }
                        _c1272 = (_g1268 === (_k812[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c1277: boolean = _c1272;
                      if (_c1277) {
                        let _q1273 = true;
                        Q1274: {
                          const _a1275 = sp.cellEdges[v_j];
                          for (let _i1276 = 0; _i1276 < _a1275.length; _i1276++) {
                            const v_y = _a1275[_i1276];
                            if (!((((strandNote_f1251[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg1263.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg1263.of(v_j)))) {
                              _q1273 = false;
                              break Q1274;
                            }
                          }
                        }
                        _c1277 = _q1273;
                      }
                      if (!(_c1277)) continue;
                      if (true) {
                        _q1248 = true;
                        break Q1249;
                      }
                    }
                  }
                  if (!(_q1248)) {
                    _q1232 = false;
                    break Q1233;
                  }
                }
              }
            }
            _c1278 = _q1232;
          }
          if (!(_c1278)) continue;
          if (!(true)) continue;
          strandNote_l1025 = _a1029;
          _y1026 = true;
          for (const _e1028 of _a1029) strandNote_p1024[_e1028] |= 1 << strandNote_f1030[_e1028];
        }
      }
      const v_A = ((((strandNote_p1024[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y1026 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g1282 !== _epoch) {
        _g1282 = _epoch;
        for (const _e1283 of strandNote_l1280) strandNote_p1279[_e1283] = 0;
        _y1281 = false;
        const _a1284 = sp.cellEdges[v_c];
        for (const _e1288 of strandNote_l1286) strandNote_f1285[_e1288] = -1;
        strandNote_l1286 = _a1284;
        let _i1290 = 0;
        _s1287[0] = 0;
        let _o1294 = _a1284.length === 0;
        for (;;) {
          if (_a1284.length === 0) {
            if (!_o1294) break;
            _o1294 = false;
          }
          while (_a1284.length > 0 && _i1290 >= 0) {
            const _e1288 = _a1284[_i1290];
            if (_s1287[_i1290] > 0) strandNote_f1285[_e1288] = -1;
            let _r1293 = (cands[_e1288] >= 0 ? cands[_e1288] : (cands[_e1288] = b.cands[_e1288])) & ~((2 << _s1287[_i1290]) - 1);
            let _d1289 = 0;
            V1292: for (; _r1293 !== 0; _r1293 &= _r1293 - 1) {
              _d1289 = 31 - Math.clz32(_r1293 & -_r1293);
              strandNote_f1285[_e1288] = _d1289;
              for (let _j1291 = 0; _j1291 < _i1290; _j1291++) {
                const _y1295 = _a1284[_j1291];
                if (!(((((_k812[v_c] ?? arms(sp, cl, v_c)) === 2) && (strandNote_f1285[_e1288] === 1)) && (strandNote_f1285[_y1295] === 1)))) continue;
                if (!((bent(sp, _e1288, _y1295) === (clueAt(cl.piece, v_c) === 3)))) continue V1292;
              }
              for (let _j1291 = 0; _j1291 < _i1290; _j1291++) {
                const _y1296 = _a1284[_j1291];
                if (!(((((strandNote_f1285[_e1288] === 1) && (strandNote_f1285[_y1296] === 1)) && !((b.grid[_e1288] !== 0))) && !((b.grid[_y1296] !== 0))))) continue;
                if (!(!(_eg849.of((sp.edgeEnds[2 * _y1296] === v_c ? sp.edgeEnds[2 * _y1296 + 1] : sp.edgeEnds[2 * _y1296])) === _eg849.of((sp.edgeEnds[2 * _e1288] === v_c ? sp.edgeEnds[2 * _e1288 + 1] : sp.edgeEnds[2 * _e1288]))))) continue V1292;
              }
              break;
            }
            if (_r1293 === 0) {
              _s1287[_i1290] = 0;
              _i1290--;
              continue;
            }
            _s1287[_i1290] = _d1289;
            if (_i1290 === _a1284.length - 1) break;
            _i1290++;
            _s1287[_i1290] = 0;
          }
          if (_i1290 < 0) break;
          let _g1297 = 0;
          G1298: {
            const _a1299 = sp.cellEdges[v_c];
            for (let _i1300 = 0; _i1300 < _a1299.length; _i1300++) {
              const v_x = _a1299[_i1300];
              if (!((strandNote_f1285[v_x] === 1))) continue;
              _g1297++;
            }
          }
          let _c1305: boolean = (_g1297 === (_k812[v_c] ?? arms(sp, cl, v_c)));
          if (_c1305) {
            let _q1301 = true;
            Q1302: {
              const _a1303 = sp.cellEdges[v_c];
              for (let _i1304 = 0; _i1304 < _a1303.length; _i1304++) {
                const v_x = _a1303[_i1304];
                if (!(((strandNote_f1285[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg849.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q1301 = false;
                  break Q1302;
                }
              }
            }
            _c1305 = _q1301;
          }
          let _c1486: boolean = _c1305;
          if (_c1486) {
            let _q1306 = false;
            Q1307: {
              const _a1308 = sp.cellEdges[v_c];
              for (let _i1309 = 0; _i1309 < _a1308.length; _i1309++) {
                const v_x = _a1308[_i1309];
                if (!((strandNote_f1285[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q1306 = true;
                  break Q1307;
                }
              }
            }
            let _c1485: boolean = _q1306;
            if (!_c1485) {
              _g1310.length = 0;
              strandNote_st1393.pass++;
              G1311: {
                const _a1394 = sp.cellEdges[v_c];
                for (let _i1395 = 0; _i1395 < _a1394.length; _i1395++) {
                  const v_x = _a1394[_i1395];
                  if (!((strandNote_f1285[v_x] === 1))) continue;
                  const _t1396 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h1458 = minus(_h995, sp.cellEdges[_t1396]);
                  const _eg1460 = edgeGroups(sp, _h1458);
                  const _memo1463 = new Map<readonly number[], readonly number[]>();
                  _g1397.length = 0;
                  strandNote_st1436.pass++;
                  G1398: {
                    const _a1437 = sp.cellEdges[_t1396];
                    for (let _i1438 = 0; _i1438 < _a1437.length; _i1438++) {
                      const v_y = _a1437[_i1438];
                      let _c1457: boolean = (v_y !== v_x);
                      if (_c1457) {
                        let _q1439 = false;
                        Q1440: {
                          const _a1441 = sp.cellEdges[_t1396];
                          for (const _e1445 of strandNote_l1443) strandNote_f1442[_e1445] = -1;
                          strandNote_l1443 = _a1441;
                          let _i1447 = 0;
                          _s1444[0] = 0;
                          let _o1451 = _a1441.length === 0;
                          for (;;) {
                            if (_a1441.length === 0) {
                              if (!_o1451) break;
                              _o1451 = false;
                            }
                            while (_a1441.length > 0 && _i1447 >= 0) {
                              const _e1445 = _a1441[_i1447];
                              if (_s1444[_i1447] > 0) strandNote_f1442[_e1445] = -1;
                              let _r1450 = (cands[_e1445] >= 0 ? cands[_e1445] : (cands[_e1445] = b.cands[_e1445])) & ~((2 << _s1444[_i1447]) - 1);
                              let _d1446 = 0;
                              V1449: for (; _r1450 !== 0; _r1450 &= _r1450 - 1) {
                                _d1446 = 31 - Math.clz32(_r1450 & -_r1450);
                                strandNote_f1442[_e1445] = _d1446;
                                if (_e1445 === v_x && _d1446 !== 1) continue;
                                if (_e1445 === v_y && _d1446 !== 1) continue;
                                for (let _j1448 = 0; _j1448 < _i1447; _j1448++) {
                                  const _y1452 = _a1441[_j1448];
                                  if (!(((((_k812[_t1396] ?? arms(sp, cl, _t1396)) === 2) && (strandNote_f1442[_e1445] === 1)) && (strandNote_f1442[_y1452] === 1)))) continue;
                                  if (!((bent(sp, _e1445, _y1452) === (clueAt(cl.piece, _t1396) === 3)))) continue V1449;
                                }
                                break;
                              }
                              if (_r1450 === 0) {
                                _s1444[_i1447] = 0;
                                _i1447--;
                                continue;
                              }
                              _s1444[_i1447] = _d1446;
                              if (_i1447 === _a1441.length - 1) break;
                              _i1447++;
                              _s1444[_i1447] = 0;
                            }
                            if (_i1447 < 0) break;
                            let _g1453 = 0;
                            G1454: {
                              const _a1455 = sp.cellEdges[_t1396];
                              for (let _i1456 = 0; _i1456 < _a1455.length; _i1456++) {
                                const v_z = _a1455[_i1456];
                                if (!((strandNote_f1442[v_z] === 1))) continue;
                                _g1453++;
                              }
                            }
                            if (!((_g1453 === (_k812[_t1396] ?? arms(sp, cl, _t1396))))) continue;
                            if (true) {
                              _q1439 = true;
                              break Q1440;
                            }
                          }
                        }
                        _c1457 = _q1439;
                      }
                      if (!(_c1457)) continue;
                      const _t1459 = (sp.edgeEnds[2 * v_y] === _t1396 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t1462 = _eg1460.of(_t1459);
                      let _gs1464 = _memo1463.get(_t1462);
                      if (_gs1464 === undefined) {
                        _g1465.length = 0;
                        strandNote_st1472.pass++;
                        G1466: {
                          const _a1473 = _t1462;
                          for (let _i1474 = 0; _i1474 < _a1473.length; _i1474++) {
                            const v_t = _a1473[_i1474];
                            if (!(((_k812[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a1475 = sp.cellEdges[v_t];
                            for (let _i1476 = 0; _i1476 < _a1475.length; _i1476++) {
                              const v_y = _a1475[_i1476];
                              L1477: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k812[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm1016[v_y + 1] === 1)))) break L1477;
                                const _t1478 = v_z;
                                if (_g1465.length < 16) { if (!_g1465.includes(_t1478)) _g1465.push(_t1478); } else addOnce(_g1465, strandNote_st1472, _t1478);
                              }
                            }
                          }
                        }
                        _gs1464 = _g1465.slice();
                        _memo1463.set(_t1462, _gs1464);
                      }
                      const _a1479 = union(_eg1460.of(_t1459), _gs1464);
                      for (let _i1480 = 0; _i1480 < _a1479.length; _i1480++) {
                        const v_t = _a1479[_i1480];
                        const _t1481 = v_t;
                        if (_g1397.length < 16) { if (!_g1397.includes(_t1481)) _g1397.push(_t1481); } else addOnce(_g1397, strandNote_st1436, _t1481);
                      }
                    }
                  }
                  const _a1482 = union(setOf(_t1396), _g1397);
                  for (let _i1483 = 0; _i1483 < _a1482.length; _i1483++) {
                    const v_t = _a1482[_i1483];
                    const _t1484 = v_t;
                    if (_g1310.length < 16) { if (!_g1310.includes(_t1484)) _g1310.push(_t1484); } else addOnce(_g1310, strandNote_st1393, _t1484);
                  }
                }
              }
              _c1485 = (union(setOf(v_c), _g1310).length >= _h1021);
            }
            _c1486 = _c1485;
          }
          let _c1533: boolean = _c1486;
          if (_c1533) {
            let _q1487 = true;
            Q1488: {
              _g1489.length = 0;
              G1490: {
                const _a1493 = sp.cellEdges[v_c];
                for (let _i1494 = 0; _i1494 < _a1493.length; _i1494++) {
                  const v_x = _a1493[_i1494];
                  if (!((strandNote_f1285[v_x] === 1))) continue;
                  _g1489.push(v_x);
                }
              }
              const v_M = union(v_L, _g1489);
              const _eg1518 = edgeGroups(sp, v_M);
              const _a1495 = sp.cellEdges[v_c];
              for (let _i1496 = 0; _i1496 < _a1495.length; _i1496++) {
                const v_x = _a1495[_i1496];
                L1497: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c1502: boolean = (v_j !== v_c);
                  if (_c1502) {
                    let _q1498 = false;
                    Q1499: {
                      const _a1500 = sp.cellEdges[v_j];
                      for (let _i1501 = 0; _i1501 < _a1500.length; _i1501++) {
                        const v_y = _a1500[_i1501];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q1498 = true;
                          break Q1499;
                        }
                      }
                    }
                    _c1502 = _q1498;
                  }
                  if (!(_c1502)) break L1497;
                  let _q1503 = false;
                  Q1504: {
                    const _a1505 = sp.cellEdges[v_j];
                    for (const _e1509 of strandNote_l1507) strandNote_f1506[_e1509] = -1;
                    strandNote_l1507 = _a1505;
                    let _i1511 = 0;
                    _s1508[0] = 0;
                    let _o1515 = _a1505.length === 0;
                    for (;;) {
                      if (_a1505.length === 0) {
                        if (!_o1515) break;
                        _o1515 = false;
                      }
                      while (_a1505.length > 0 && _i1511 >= 0) {
                        const _e1509 = _a1505[_i1511];
                        if (_s1508[_i1511] > 0) strandNote_f1506[_e1509] = -1;
                        let _r1514 = (cands[_e1509] >= 0 ? cands[_e1509] : (cands[_e1509] = b.cands[_e1509])) & ~((2 << _s1508[_i1511]) - 1);
                        let _d1510 = 0;
                        V1513: for (; _r1514 !== 0; _r1514 &= _r1514 - 1) {
                          _d1510 = 31 - Math.clz32(_r1514 & -_r1514);
                          strandNote_f1506[_e1509] = _d1510;
                          for (let _j1512 = 0; _j1512 < _i1511; _j1512++) {
                            const _y1516 = _a1505[_j1512];
                            if (!(((((_k812[v_j] ?? arms(sp, cl, v_j)) === 2) && (strandNote_f1506[_e1509] === 1)) && (strandNote_f1506[_y1516] === 1)))) continue;
                            if (!((bent(sp, _e1509, _y1516) === (clueAt(cl.piece, v_j) === 3)))) continue V1513;
                          }
                          for (let _j1512 = 0; _j1512 < _i1511; _j1512++) {
                            const _y1517 = _a1505[_j1512];
                            if (!(((((((strandNote_f1506[_e1509] === 1) && (strandNote_f1506[_y1517] === 1)) && !((b.grid[_e1509] !== 0))) && !((b.grid[_y1517] !== 0))) && !([sp.edgeEnds[2 * _e1509], sp.edgeEnds[2 * _e1509 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y1517], sp.edgeEnds[2 * _y1517 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg1518.of((sp.edgeEnds[2 * _y1517] === v_j ? sp.edgeEnds[2 * _y1517 + 1] : sp.edgeEnds[2 * _y1517])) === _eg1518.of((sp.edgeEnds[2 * _e1509] === v_j ? sp.edgeEnds[2 * _e1509 + 1] : sp.edgeEnds[2 * _e1509]))))) continue V1513;
                          }
                          break;
                        }
                        if (_r1514 === 0) {
                          _s1508[_i1511] = 0;
                          _i1511--;
                          continue;
                        }
                        _s1508[_i1511] = _d1510;
                        if (_i1511 === _a1505.length - 1) break;
                        _i1511++;
                        _s1508[_i1511] = 0;
                      }
                      if (_i1511 < 0) break;
                      let _q1519 = true;
                      Q1520: {
                        const _a1521 = sp.cellEdges[v_j];
                        for (let _i1522 = 0; _i1522 < _a1521.length; _i1522++) {
                          const v_y = _a1521[_i1522];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((strandNote_f1506[v_y] === strandNote_f1285[v_y]))) {
                            _q1519 = false;
                            break Q1520;
                          }
                        }
                      }
                      let _c1527: boolean = _q1519;
                      if (_c1527) {
                        let _g1523 = 0;
                        G1524: {
                          const _a1525 = sp.cellEdges[v_j];
                          for (let _i1526 = 0; _i1526 < _a1525.length; _i1526++) {
                            const v_y = _a1525[_i1526];
                            if (!((strandNote_f1506[v_y] === 1))) continue;
                            _g1523++;
                          }
                        }
                        _c1527 = (_g1523 === (_k812[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c1532: boolean = _c1527;
                      if (_c1532) {
                        let _q1528 = true;
                        Q1529: {
                          const _a1530 = sp.cellEdges[v_j];
                          for (let _i1531 = 0; _i1531 < _a1530.length; _i1531++) {
                            const v_y = _a1530[_i1531];
                            if (!((((strandNote_f1506[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg1518.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg1518.of(v_j)))) {
                              _q1528 = false;
                              break Q1529;
                            }
                          }
                        }
                        _c1532 = _q1528;
                      }
                      if (!(_c1532)) continue;
                      if (true) {
                        _q1503 = true;
                        break Q1504;
                      }
                    }
                  }
                  if (!(_q1503)) {
                    _q1487 = false;
                    break Q1488;
                  }
                }
              }
            }
            _c1533 = _q1487;
          }
          if (!(_c1533)) continue;
          if (!(true)) continue;
          strandNote_l1280 = _a1284;
          _y1281 = true;
          for (const _e1283 of _a1284) strandNote_p1279[_e1283] |= 1 << strandNote_f1285[_e1283];
        }
      }
      L1534: {
        const v_B = ((((strandNote_p1279[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y1281 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L1534;
        if (b.made[0] !== _m2281_0 || b.made[1] !== _m2282_1) {
          _g1535.length = 0;
          G1536: {
            const _a1539 = sp.edges;
            for (let _i1540 = 0; _i1540 < _a1539.length; _i1540++) {
              const v_e = _a1539[_i1540];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1535.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g1535))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g1541: number[] = [];
          G1542: {
            const _a1545 = sp.edges;
            for (let _i1546 = 0; _i1546 < _a1545.length; _i1546++) {
              const v_e = _a1545[_i1546];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1541.push(v_e);
            }
          }
          const _g1547: number[] = [];
          G1548: {
            const _a1590 = sp.edges;
            for (let _i1591 = 0; _i1591 < _a1590.length; _i1591++) {
              const v_e = _a1590[_i1591];
              const _t1592 = sp.edgeEnds[2 * v_e];
              let _q1593 = false;
              Q1594: {
                const _f1596 = new Int32Array(sp.edges.length).fill(-1);
                let _l1597: readonly number[] = [];
                const _s1598: number[] = [];
                const _a1595 = sp.cellEdges[_t1592];
                for (const _e1599 of _l1597) _f1596[_e1599] = -1;
                _l1597 = _a1595;
                let _i1601 = 0;
                _s1598[0] = 0;
                let _o1605 = _a1595.length === 0;
                for (;;) {
                  if (_a1595.length === 0) {
                    if (!_o1605) break;
                    _o1605 = false;
                  }
                  while (_a1595.length > 0 && _i1601 >= 0) {
                    const _e1599 = _a1595[_i1601];
                    if (_s1598[_i1601] > 0) _f1596[_e1599] = -1;
                    let _r1604 = (cands[_e1599] >= 0 ? cands[_e1599] : (cands[_e1599] = b.cands[_e1599])) & ~((2 << _s1598[_i1601]) - 1);
                    let _d1600 = 0;
                    V1603: for (; _r1604 !== 0; _r1604 &= _r1604 - 1) {
                      _d1600 = 31 - Math.clz32(_r1604 & -_r1604);
                      _f1596[_e1599] = _d1600;
                      if (_e1599 === v_e && _d1600 !== 1) continue;
                      for (let _j1602 = 0; _j1602 < _i1601; _j1602++) {
                        const _y1606 = _a1595[_j1602];
                        if (!((((arms(sp, cl, _t1592) === 2) && (_f1596[_e1599] === 1)) && (_f1596[_y1606] === 1)))) continue;
                        if (!((bent(sp, _e1599, _y1606) === (clueAt(cl.piece, _t1592) === 3)))) continue V1603;
                      }
                      break;
                    }
                    if (_r1604 === 0) {
                      _s1598[_i1601] = 0;
                      _i1601--;
                      continue;
                    }
                    _s1598[_i1601] = _d1600;
                    if (_i1601 === _a1595.length - 1) break;
                    _i1601++;
                    _s1598[_i1601] = 0;
                  }
                  if (_i1601 < 0) break;
                  let _g1607 = 0;
                  G1608: {
                    const _a1609 = sp.cellEdges[_t1592];
                    for (let _i1610 = 0; _i1610 < _a1609.length; _i1610++) {
                      const v_x = _a1609[_i1610];
                      if (!((_f1596[v_x] === 1))) continue;
                      _g1607++;
                    }
                  }
                  if (!((_g1607 === arms(sp, cl, _t1592)))) continue;
                  if (true) {
                    _q1593 = true;
                    break Q1594;
                  }
                }
              }
              let _c1630: boolean = _q1593;
              if (_c1630) {
                const _t1611 = sp.edgeEnds[2 * v_e + 1];
                let _q1612 = false;
                Q1613: {
                  const _f1615 = new Int32Array(sp.edges.length).fill(-1);
                  let _l1616: readonly number[] = [];
                  const _s1617: number[] = [];
                  const _a1614 = sp.cellEdges[_t1611];
                  for (const _e1618 of _l1616) _f1615[_e1618] = -1;
                  _l1616 = _a1614;
                  let _i1620 = 0;
                  _s1617[0] = 0;
                  let _o1624 = _a1614.length === 0;
                  for (;;) {
                    if (_a1614.length === 0) {
                      if (!_o1624) break;
                      _o1624 = false;
                    }
                    while (_a1614.length > 0 && _i1620 >= 0) {
                      const _e1618 = _a1614[_i1620];
                      if (_s1617[_i1620] > 0) _f1615[_e1618] = -1;
                      let _r1623 = (cands[_e1618] >= 0 ? cands[_e1618] : (cands[_e1618] = b.cands[_e1618])) & ~((2 << _s1617[_i1620]) - 1);
                      let _d1619 = 0;
                      V1622: for (; _r1623 !== 0; _r1623 &= _r1623 - 1) {
                        _d1619 = 31 - Math.clz32(_r1623 & -_r1623);
                        _f1615[_e1618] = _d1619;
                        if (_e1618 === v_e && _d1619 !== 1) continue;
                        for (let _j1621 = 0; _j1621 < _i1620; _j1621++) {
                          const _y1625 = _a1614[_j1621];
                          if (!((((arms(sp, cl, _t1611) === 2) && (_f1615[_e1618] === 1)) && (_f1615[_y1625] === 1)))) continue;
                          if (!((bent(sp, _e1618, _y1625) === (clueAt(cl.piece, _t1611) === 3)))) continue V1622;
                        }
                        break;
                      }
                      if (_r1623 === 0) {
                        _s1617[_i1620] = 0;
                        _i1620--;
                        continue;
                      }
                      _s1617[_i1620] = _d1619;
                      if (_i1620 === _a1614.length - 1) break;
                      _i1620++;
                      _s1617[_i1620] = 0;
                    }
                    if (_i1620 < 0) break;
                    let _g1626 = 0;
                    G1627: {
                      const _a1628 = sp.cellEdges[_t1611];
                      for (let _i1629 = 0; _i1629 < _a1628.length; _i1629++) {
                        const v_x = _a1628[_i1629];
                        if (!((_f1615[v_x] === 1))) continue;
                        _g1626++;
                      }
                    }
                    if (!((_g1626 === arms(sp, cl, _t1611)))) continue;
                    if (true) {
                      _q1612 = true;
                      break Q1613;
                    }
                  }
                }
                _c1630 = _q1612;
              }
              if (!(_c1630)) continue;
              _g1547.push(v_e);
            }
          }
          const _g1631: number[] = [];
          G1632: {
            const _a1635 = v_U;
            for (let _i1636 = 0; _i1636 < _a1635.length; _i1636++) {
              const v_e = _a1635[_i1636];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g1631.push(v_e);
            }
          }
          const _g1637: number[] = [];
          G1638: {
            const _a1718 = sp.cellEdges[v_c];
            for (let _i1719 = 0; _i1719 < _a1718.length; _i1719++) {
              const v_x = _a1718[_i1719];
              const _t1720 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g1721: number[] = [];
              G1722: {
                const _a1760 = sp.cellEdges[_t1720];
                for (let _i1761 = 0; _i1761 < _a1760.length; _i1761++) {
                  const v_y = _a1760[_i1761];
                  let _c1780: boolean = (v_y !== v_x);
                  if (_c1780) {
                    let _q1762 = false;
                    Q1763: {
                      const _f1765 = new Int32Array(sp.edges.length).fill(-1);
                      let _l1766: readonly number[] = [];
                      const _s1767: number[] = [];
                      const _a1764 = sp.cellEdges[_t1720];
                      for (const _e1768 of _l1766) _f1765[_e1768] = -1;
                      _l1766 = _a1764;
                      let _i1770 = 0;
                      _s1767[0] = 0;
                      let _o1774 = _a1764.length === 0;
                      for (;;) {
                        if (_a1764.length === 0) {
                          if (!_o1774) break;
                          _o1774 = false;
                        }
                        while (_a1764.length > 0 && _i1770 >= 0) {
                          const _e1768 = _a1764[_i1770];
                          if (_s1767[_i1770] > 0) _f1765[_e1768] = -1;
                          let _r1773 = (cands[_e1768] >= 0 ? cands[_e1768] : (cands[_e1768] = b.cands[_e1768])) & ~((2 << _s1767[_i1770]) - 1);
                          let _d1769 = 0;
                          V1772: for (; _r1773 !== 0; _r1773 &= _r1773 - 1) {
                            _d1769 = 31 - Math.clz32(_r1773 & -_r1773);
                            _f1765[_e1768] = _d1769;
                            if (_e1768 === v_x && _d1769 !== 1) continue;
                            if (_e1768 === v_y && _d1769 !== 1) continue;
                            for (let _j1771 = 0; _j1771 < _i1770; _j1771++) {
                              const _y1775 = _a1764[_j1771];
                              if (!((((arms(sp, cl, _t1720) === 2) && (_f1765[_e1768] === 1)) && (_f1765[_y1775] === 1)))) continue;
                              if (!((bent(sp, _e1768, _y1775) === (clueAt(cl.piece, _t1720) === 3)))) continue V1772;
                            }
                            break;
                          }
                          if (_r1773 === 0) {
                            _s1767[_i1770] = 0;
                            _i1770--;
                            continue;
                          }
                          _s1767[_i1770] = _d1769;
                          if (_i1770 === _a1764.length - 1) break;
                          _i1770++;
                          _s1767[_i1770] = 0;
                        }
                        if (_i1770 < 0) break;
                        let _g1776 = 0;
                        G1777: {
                          const _a1778 = sp.cellEdges[_t1720];
                          for (let _i1779 = 0; _i1779 < _a1778.length; _i1779++) {
                            const v_z = _a1778[_i1779];
                            if (!((_f1765[v_z] === 1))) continue;
                            _g1776++;
                          }
                        }
                        if (!((_g1776 === arms(sp, cl, _t1720)))) continue;
                        if (true) {
                          _q1762 = true;
                          break Q1763;
                        }
                      }
                    }
                    _c1780 = _q1762;
                  }
                  if (!(_c1780)) continue;
                  const _t1781 = (sp.edgeEnds[2 * v_y] === _t1720 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t1782 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t1720]);
                  const _g1783: number[] = [];
                  G1784: {
                    const _a1790 = through(sp, _t1781, _t1782);
                    for (let _i1791 = 0; _i1791 < _a1790.length; _i1791++) {
                      const v_t = _a1790[_i1791];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a1792 = sp.cellEdges[v_t];
                      for (let _i1793 = 0; _i1793 < _a1792.length; _i1793++) {
                        const v_y = _a1792[_i1793];
                        L1794: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L1794;
                          if (!_g1783.includes(v_z)) _g1783.push(v_z);
                        }
                      }
                    }
                  }
                  const _a1795 = union(through(sp, _t1781, _t1782), _g1783);
                  for (let _i1796 = 0; _i1796 < _a1795.length; _i1796++) {
                    const v_t = _a1795[_i1796];
                    if (!_g1721.includes(v_t)) _g1721.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t1720), _g1721)).length >= sp.cells.length))) continue;
              _g1637.push(v_x);
            }
          }
          let _q1797 = false;
          Q1798: {
            const _f1800 = new Int32Array(sp.edges.length).fill(-1);
            let _l1801: readonly number[] = [];
            const _s1802: number[] = [];
            const _a1799 = sp.cellEdges[v_c];
            for (const _e1803 of _l1801) _f1800[_e1803] = -1;
            _l1801 = _a1799;
            let _i1805 = 0;
            _s1802[0] = 0;
            let _o1809 = _a1799.length === 0;
            for (;;) {
              if (_a1799.length === 0) {
                if (!_o1809) break;
                _o1809 = false;
              }
              while (_a1799.length > 0 && _i1805 >= 0) {
                const _e1803 = _a1799[_i1805];
                if (_s1802[_i1805] > 0) _f1800[_e1803] = -1;
                let _r1808 = (cands[_e1803] >= 0 ? cands[_e1803] : (cands[_e1803] = b.cands[_e1803])) & ~((2 << _s1802[_i1805]) - 1);
                let _d1804 = 0;
                V1807: for (; _r1808 !== 0; _r1808 &= _r1808 - 1) {
                  _d1804 = 31 - Math.clz32(_r1808 & -_r1808);
                  _f1800[_e1803] = _d1804;
                  if (_e1803 === v_e && _d1804 !== 1) continue;
                  for (let _j1806 = 0; _j1806 < _i1805; _j1806++) {
                    const _y1810 = _a1799[_j1806];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f1800[_e1803] === 1)) && (_f1800[_y1810] === 1)))) continue;
                    if (!((bent(sp, _e1803, _y1810) === (clueAt(cl.piece, v_c) === 3)))) continue V1807;
                  }
                  for (let _j1806 = 0; _j1806 < _i1805; _j1806++) {
                    const _y1811 = _a1799[_j1806];
                    if (!(((((_f1800[_e1803] === 1) && (_f1800[_y1811] === 1)) && !((b.grid[_e1803] !== 0))) && !((b.grid[_y1811] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e1803] === v_c ? sp.edgeEnds[2 * _e1803 + 1] : sp.edgeEnds[2 * _e1803]), v_L).includes((sp.edgeEnds[2 * _y1811] === v_c ? sp.edgeEnds[2 * _y1811 + 1] : sp.edgeEnds[2 * _y1811]))))) continue V1807;
                  }
                  break;
                }
                if (_r1808 === 0) {
                  _s1802[_i1805] = 0;
                  _i1805--;
                  continue;
                }
                _s1802[_i1805] = _d1804;
                if (_i1805 === _a1799.length - 1) break;
                _i1805++;
                _s1802[_i1805] = 0;
              }
              if (_i1805 < 0) break;
              let _g1812 = 0;
              G1813: {
                const _a1814 = sp.cellEdges[v_c];
                for (let _i1815 = 0; _i1815 < _a1814.length; _i1815++) {
                  const v_x = _a1814[_i1815];
                  if (!((_f1800[v_x] === 1))) continue;
                  _g1812++;
                }
              }
              let _c1820: boolean = (_g1812 === arms(sp, cl, v_c));
              if (_c1820) {
                let _q1816 = true;
                Q1817: {
                  const _a1818 = sp.cellEdges[v_c];
                  for (let _i1819 = 0; _i1819 < _a1818.length; _i1819++) {
                    const v_x = _a1818[_i1819];
                    if (!(((_f1800[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg849.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1816 = false;
                      break Q1817;
                    }
                  }
                }
                _c1820 = _q1816;
              }
              let _c1990: boolean = _c1820;
              if (_c1990) {
                let _q1821 = false;
                Q1822: {
                  const _a1823 = sp.cellEdges[v_c];
                  for (let _i1824 = 0; _i1824 < _a1823.length; _i1824++) {
                    const v_x = _a1823[_i1824];
                    if (!((_f1800[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q1821 = true;
                      break Q1822;
                    }
                  }
                }
                let _c1989: boolean = _q1821;
                if (!_c1989) {
                  const _g1825: number[] = [];
                  G1826: {
                    const _a1908 = sp.cellEdges[v_c];
                    for (let _i1909 = 0; _i1909 < _a1908.length; _i1909++) {
                      const v_x = _a1908[_i1909];
                      if (!((_f1800[v_x] === 1))) continue;
                      const _t1910 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g1911: number[] = [];
                      G1912: {
                        const _a1950 = sp.cellEdges[_t1910];
                        for (let _i1951 = 0; _i1951 < _a1950.length; _i1951++) {
                          const v_y = _a1950[_i1951];
                          let _c1970: boolean = (v_y !== v_x);
                          if (_c1970) {
                            let _q1952 = false;
                            Q1953: {
                              const _f1955 = new Int32Array(sp.edges.length).fill(-1);
                              let _l1956: readonly number[] = [];
                              const _s1957: number[] = [];
                              const _a1954 = sp.cellEdges[_t1910];
                              for (const _e1958 of _l1956) _f1955[_e1958] = -1;
                              _l1956 = _a1954;
                              let _i1960 = 0;
                              _s1957[0] = 0;
                              let _o1964 = _a1954.length === 0;
                              for (;;) {
                                if (_a1954.length === 0) {
                                  if (!_o1964) break;
                                  _o1964 = false;
                                }
                                while (_a1954.length > 0 && _i1960 >= 0) {
                                  const _e1958 = _a1954[_i1960];
                                  if (_s1957[_i1960] > 0) _f1955[_e1958] = -1;
                                  let _r1963 = (cands[_e1958] >= 0 ? cands[_e1958] : (cands[_e1958] = b.cands[_e1958])) & ~((2 << _s1957[_i1960]) - 1);
                                  let _d1959 = 0;
                                  V1962: for (; _r1963 !== 0; _r1963 &= _r1963 - 1) {
                                    _d1959 = 31 - Math.clz32(_r1963 & -_r1963);
                                    _f1955[_e1958] = _d1959;
                                    if (_e1958 === v_x && _d1959 !== 1) continue;
                                    if (_e1958 === v_y && _d1959 !== 1) continue;
                                    for (let _j1961 = 0; _j1961 < _i1960; _j1961++) {
                                      const _y1965 = _a1954[_j1961];
                                      if (!((((arms(sp, cl, _t1910) === 2) && (_f1955[_e1958] === 1)) && (_f1955[_y1965] === 1)))) continue;
                                      if (!((bent(sp, _e1958, _y1965) === (clueAt(cl.piece, _t1910) === 3)))) continue V1962;
                                    }
                                    break;
                                  }
                                  if (_r1963 === 0) {
                                    _s1957[_i1960] = 0;
                                    _i1960--;
                                    continue;
                                  }
                                  _s1957[_i1960] = _d1959;
                                  if (_i1960 === _a1954.length - 1) break;
                                  _i1960++;
                                  _s1957[_i1960] = 0;
                                }
                                if (_i1960 < 0) break;
                                let _g1966 = 0;
                                G1967: {
                                  const _a1968 = sp.cellEdges[_t1910];
                                  for (let _i1969 = 0; _i1969 < _a1968.length; _i1969++) {
                                    const v_z = _a1968[_i1969];
                                    if (!((_f1955[v_z] === 1))) continue;
                                    _g1966++;
                                  }
                                }
                                if (!((_g1966 === arms(sp, cl, _t1910)))) continue;
                                if (true) {
                                  _q1952 = true;
                                  break Q1953;
                                }
                              }
                            }
                            _c1970 = _q1952;
                          }
                          if (!(_c1970)) continue;
                          const _t1971 = (sp.edgeEnds[2 * v_y] === _t1910 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t1972 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t1910]);
                          const _g1973: number[] = [];
                          G1974: {
                            const _a1980 = through(sp, _t1971, _t1972);
                            for (let _i1981 = 0; _i1981 < _a1980.length; _i1981++) {
                              const v_t = _a1980[_i1981];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a1982 = sp.cellEdges[v_t];
                              for (let _i1983 = 0; _i1983 < _a1982.length; _i1983++) {
                                const v_y = _a1982[_i1983];
                                L1984: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L1984;
                                  if (!_g1973.includes(v_z)) _g1973.push(v_z);
                                }
                              }
                            }
                          }
                          const _a1985 = union(through(sp, _t1971, _t1972), _g1973);
                          for (let _i1986 = 0; _i1986 < _a1985.length; _i1986++) {
                            const v_t = _a1985[_i1986];
                            if (!_g1911.includes(v_t)) _g1911.push(v_t);
                          }
                        }
                      }
                      const _a1987 = union(setOf(_t1910), _g1911);
                      for (let _i1988 = 0; _i1988 < _a1987.length; _i1988++) {
                        const v_t = _a1987[_i1988];
                        if (!_g1825.includes(v_t)) _g1825.push(v_t);
                      }
                    }
                  }
                  _c1989 = (union(setOf(v_c), _g1825).length >= sp.cells.length);
                }
                _c1990 = _c1989;
              }
              let _c2036: boolean = _c1990;
              if (_c2036) {
                let _q1991 = true;
                Q1992: {
                  const _g1993: number[] = [];
                  G1994: {
                    const _a1997 = sp.cellEdges[v_c];
                    for (let _i1998 = 0; _i1998 < _a1997.length; _i1998++) {
                      const v_x = _a1997[_i1998];
                      if (!((_f1800[v_x] === 1))) continue;
                      _g1993.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g1993);
                  const _a1999 = sp.cellEdges[v_c];
                  for (let _i2000 = 0; _i2000 < _a1999.length; _i2000++) {
                    const v_x = _a1999[_i2000];
                    L2001: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c2006: boolean = (v_j !== v_c);
                      if (_c2006) {
                        let _q2002 = false;
                        Q2003: {
                          const _a2004 = sp.cellEdges[v_j];
                          for (let _i2005 = 0; _i2005 < _a2004.length; _i2005++) {
                            const v_y = _a2004[_i2005];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q2002 = true;
                              break Q2003;
                            }
                          }
                        }
                        _c2006 = _q2002;
                      }
                      if (!(_c2006)) break L2001;
                      let _q2007 = false;
                      Q2008: {
                        const _f2010 = new Int32Array(sp.edges.length).fill(-1);
                        let _l2011: readonly number[] = [];
                        const _s2012: number[] = [];
                        const _a2009 = sp.cellEdges[v_j];
                        for (const _e2013 of _l2011) _f2010[_e2013] = -1;
                        _l2011 = _a2009;
                        let _i2015 = 0;
                        _s2012[0] = 0;
                        let _o2019 = _a2009.length === 0;
                        for (;;) {
                          if (_a2009.length === 0) {
                            if (!_o2019) break;
                            _o2019 = false;
                          }
                          while (_a2009.length > 0 && _i2015 >= 0) {
                            const _e2013 = _a2009[_i2015];
                            if (_s2012[_i2015] > 0) _f2010[_e2013] = -1;
                            let _r2018 = (cands[_e2013] >= 0 ? cands[_e2013] : (cands[_e2013] = b.cands[_e2013])) & ~((2 << _s2012[_i2015]) - 1);
                            let _d2014 = 0;
                            V2017: for (; _r2018 !== 0; _r2018 &= _r2018 - 1) {
                              _d2014 = 31 - Math.clz32(_r2018 & -_r2018);
                              _f2010[_e2013] = _d2014;
                              for (let _j2016 = 0; _j2016 < _i2015; _j2016++) {
                                const _y2020 = _a2009[_j2016];
                                if (!((((arms(sp, cl, v_j) === 2) && (_f2010[_e2013] === 1)) && (_f2010[_y2020] === 1)))) continue;
                                if (!((bent(sp, _e2013, _y2020) === (clueAt(cl.piece, v_j) === 3)))) continue V2017;
                              }
                              for (let _j2016 = 0; _j2016 < _i2015; _j2016++) {
                                const _y2021 = _a2009[_j2016];
                                if (!(((((((_f2010[_e2013] === 1) && (_f2010[_y2021] === 1)) && !((b.grid[_e2013] !== 0))) && !((b.grid[_y2021] !== 0))) && !([sp.edgeEnds[2 * _e2013], sp.edgeEnds[2 * _e2013 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y2021], sp.edgeEnds[2 * _y2021 + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, (sp.edgeEnds[2 * _e2013] === v_j ? sp.edgeEnds[2 * _e2013 + 1] : sp.edgeEnds[2 * _e2013]), v_M).includes((sp.edgeEnds[2 * _y2021] === v_j ? sp.edgeEnds[2 * _y2021 + 1] : sp.edgeEnds[2 * _y2021]))))) continue V2017;
                              }
                              break;
                            }
                            if (_r2018 === 0) {
                              _s2012[_i2015] = 0;
                              _i2015--;
                              continue;
                            }
                            _s2012[_i2015] = _d2014;
                            if (_i2015 === _a2009.length - 1) break;
                            _i2015++;
                            _s2012[_i2015] = 0;
                          }
                          if (_i2015 < 0) break;
                          let _q2022 = true;
                          Q2023: {
                            const _a2024 = sp.cellEdges[v_j];
                            for (let _i2025 = 0; _i2025 < _a2024.length; _i2025++) {
                              const v_y = _a2024[_i2025];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f2010[v_y] === _f1800[v_y]))) {
                                _q2022 = false;
                                break Q2023;
                              }
                            }
                          }
                          let _c2030: boolean = _q2022;
                          if (_c2030) {
                            let _g2026 = 0;
                            G2027: {
                              const _a2028 = sp.cellEdges[v_j];
                              for (let _i2029 = 0; _i2029 < _a2028.length; _i2029++) {
                                const v_y = _a2028[_i2029];
                                if (!((_f2010[v_y] === 1))) continue;
                                _g2026++;
                              }
                            }
                            _c2030 = (_g2026 === arms(sp, cl, v_j));
                          }
                          let _c2035: boolean = _c2030;
                          if (_c2035) {
                            let _q2031 = true;
                            Q2032: {
                              const _a2033 = sp.cellEdges[v_j];
                              for (let _i2034 = 0; _i2034 < _a2033.length; _i2034++) {
                                const v_y = _a2033[_i2034];
                                if (!((((_f2010[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                  _q2031 = false;
                                  break Q2032;
                                }
                              }
                            }
                            _c2035 = _q2031;
                          }
                          if (!(_c2035)) continue;
                          if (true) {
                            _q2007 = true;
                            break Q2008;
                          }
                        }
                      }
                      if (!(_q2007)) {
                        _q1991 = false;
                        break Q1992;
                      }
                    }
                  }
                }
                _c2036 = _q1991;
              }
              if (!(_c2036)) continue;
              if (true) {
                _q1797 = true;
                break Q1798;
              }
            }
          }
          let _q2037 = false;
          Q2038: {
            const _f2040 = new Int32Array(sp.edges.length).fill(-1);
            let _l2041: readonly number[] = [];
            const _s2042: number[] = [];
            const _a2039 = sp.cellEdges[v_c];
            for (const _e2043 of _l2041) _f2040[_e2043] = -1;
            _l2041 = _a2039;
            let _i2045 = 0;
            _s2042[0] = 0;
            let _o2049 = _a2039.length === 0;
            for (;;) {
              if (_a2039.length === 0) {
                if (!_o2049) break;
                _o2049 = false;
              }
              while (_a2039.length > 0 && _i2045 >= 0) {
                const _e2043 = _a2039[_i2045];
                if (_s2042[_i2045] > 0) _f2040[_e2043] = -1;
                let _r2048 = (cands[_e2043] >= 0 ? cands[_e2043] : (cands[_e2043] = b.cands[_e2043])) & ~((2 << _s2042[_i2045]) - 1);
                let _d2044 = 0;
                V2047: for (; _r2048 !== 0; _r2048 &= _r2048 - 1) {
                  _d2044 = 31 - Math.clz32(_r2048 & -_r2048);
                  _f2040[_e2043] = _d2044;
                  if (_e2043 === v_e && _d2044 !== 2) continue;
                  for (let _j2046 = 0; _j2046 < _i2045; _j2046++) {
                    const _y2050 = _a2039[_j2046];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f2040[_e2043] === 1)) && (_f2040[_y2050] === 1)))) continue;
                    if (!((bent(sp, _e2043, _y2050) === (clueAt(cl.piece, v_c) === 3)))) continue V2047;
                  }
                  for (let _j2046 = 0; _j2046 < _i2045; _j2046++) {
                    const _y2051 = _a2039[_j2046];
                    if (!(((((_f2040[_e2043] === 1) && (_f2040[_y2051] === 1)) && !((b.grid[_e2043] !== 0))) && !((b.grid[_y2051] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e2043] === v_c ? sp.edgeEnds[2 * _e2043 + 1] : sp.edgeEnds[2 * _e2043]), v_L).includes((sp.edgeEnds[2 * _y2051] === v_c ? sp.edgeEnds[2 * _y2051 + 1] : sp.edgeEnds[2 * _y2051]))))) continue V2047;
                  }
                  break;
                }
                if (_r2048 === 0) {
                  _s2042[_i2045] = 0;
                  _i2045--;
                  continue;
                }
                _s2042[_i2045] = _d2044;
                if (_i2045 === _a2039.length - 1) break;
                _i2045++;
                _s2042[_i2045] = 0;
              }
              if (_i2045 < 0) break;
              let _g2052 = 0;
              G2053: {
                const _a2054 = sp.cellEdges[v_c];
                for (let _i2055 = 0; _i2055 < _a2054.length; _i2055++) {
                  const v_x = _a2054[_i2055];
                  if (!((_f2040[v_x] === 1))) continue;
                  _g2052++;
                }
              }
              let _c2060: boolean = (_g2052 === arms(sp, cl, v_c));
              if (_c2060) {
                let _q2056 = true;
                Q2057: {
                  const _a2058 = sp.cellEdges[v_c];
                  for (let _i2059 = 0; _i2059 < _a2058.length; _i2059++) {
                    const v_x = _a2058[_i2059];
                    if (!(((_f2040[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg849.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2056 = false;
                      break Q2057;
                    }
                  }
                }
                _c2060 = _q2056;
              }
              let _c2230: boolean = _c2060;
              if (_c2230) {
                let _q2061 = false;
                Q2062: {
                  const _a2063 = sp.cellEdges[v_c];
                  for (let _i2064 = 0; _i2064 < _a2063.length; _i2064++) {
                    const v_x = _a2063[_i2064];
                    if (!((_f2040[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2061 = true;
                      break Q2062;
                    }
                  }
                }
                let _c2229: boolean = _q2061;
                if (!_c2229) {
                  const _g2065: number[] = [];
                  G2066: {
                    const _a2148 = sp.cellEdges[v_c];
                    for (let _i2149 = 0; _i2149 < _a2148.length; _i2149++) {
                      const v_x = _a2148[_i2149];
                      if (!((_f2040[v_x] === 1))) continue;
                      const _t2150 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g2151: number[] = [];
                      G2152: {
                        const _a2190 = sp.cellEdges[_t2150];
                        for (let _i2191 = 0; _i2191 < _a2190.length; _i2191++) {
                          const v_y = _a2190[_i2191];
                          let _c2210: boolean = (v_y !== v_x);
                          if (_c2210) {
                            let _q2192 = false;
                            Q2193: {
                              const _f2195 = new Int32Array(sp.edges.length).fill(-1);
                              let _l2196: readonly number[] = [];
                              const _s2197: number[] = [];
                              const _a2194 = sp.cellEdges[_t2150];
                              for (const _e2198 of _l2196) _f2195[_e2198] = -1;
                              _l2196 = _a2194;
                              let _i2200 = 0;
                              _s2197[0] = 0;
                              let _o2204 = _a2194.length === 0;
                              for (;;) {
                                if (_a2194.length === 0) {
                                  if (!_o2204) break;
                                  _o2204 = false;
                                }
                                while (_a2194.length > 0 && _i2200 >= 0) {
                                  const _e2198 = _a2194[_i2200];
                                  if (_s2197[_i2200] > 0) _f2195[_e2198] = -1;
                                  let _r2203 = (cands[_e2198] >= 0 ? cands[_e2198] : (cands[_e2198] = b.cands[_e2198])) & ~((2 << _s2197[_i2200]) - 1);
                                  let _d2199 = 0;
                                  V2202: for (; _r2203 !== 0; _r2203 &= _r2203 - 1) {
                                    _d2199 = 31 - Math.clz32(_r2203 & -_r2203);
                                    _f2195[_e2198] = _d2199;
                                    if (_e2198 === v_x && _d2199 !== 1) continue;
                                    if (_e2198 === v_y && _d2199 !== 1) continue;
                                    for (let _j2201 = 0; _j2201 < _i2200; _j2201++) {
                                      const _y2205 = _a2194[_j2201];
                                      if (!((((arms(sp, cl, _t2150) === 2) && (_f2195[_e2198] === 1)) && (_f2195[_y2205] === 1)))) continue;
                                      if (!((bent(sp, _e2198, _y2205) === (clueAt(cl.piece, _t2150) === 3)))) continue V2202;
                                    }
                                    break;
                                  }
                                  if (_r2203 === 0) {
                                    _s2197[_i2200] = 0;
                                    _i2200--;
                                    continue;
                                  }
                                  _s2197[_i2200] = _d2199;
                                  if (_i2200 === _a2194.length - 1) break;
                                  _i2200++;
                                  _s2197[_i2200] = 0;
                                }
                                if (_i2200 < 0) break;
                                let _g2206 = 0;
                                G2207: {
                                  const _a2208 = sp.cellEdges[_t2150];
                                  for (let _i2209 = 0; _i2209 < _a2208.length; _i2209++) {
                                    const v_z = _a2208[_i2209];
                                    if (!((_f2195[v_z] === 1))) continue;
                                    _g2206++;
                                  }
                                }
                                if (!((_g2206 === arms(sp, cl, _t2150)))) continue;
                                if (true) {
                                  _q2192 = true;
                                  break Q2193;
                                }
                              }
                            }
                            _c2210 = _q2192;
                          }
                          if (!(_c2210)) continue;
                          const _t2211 = (sp.edgeEnds[2 * v_y] === _t2150 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2212 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t2150]);
                          const _g2213: number[] = [];
                          G2214: {
                            const _a2220 = through(sp, _t2211, _t2212);
                            for (let _i2221 = 0; _i2221 < _a2220.length; _i2221++) {
                              const v_t = _a2220[_i2221];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a2222 = sp.cellEdges[v_t];
                              for (let _i2223 = 0; _i2223 < _a2222.length; _i2223++) {
                                const v_y = _a2222[_i2223];
                                L2224: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L2224;
                                  if (!_g2213.includes(v_z)) _g2213.push(v_z);
                                }
                              }
                            }
                          }
                          const _a2225 = union(through(sp, _t2211, _t2212), _g2213);
                          for (let _i2226 = 0; _i2226 < _a2225.length; _i2226++) {
                            const v_t = _a2225[_i2226];
                            if (!_g2151.includes(v_t)) _g2151.push(v_t);
                          }
                        }
                      }
                      const _a2227 = union(setOf(_t2150), _g2151);
                      for (let _i2228 = 0; _i2228 < _a2227.length; _i2228++) {
                        const v_t = _a2227[_i2228];
                        if (!_g2065.includes(v_t)) _g2065.push(v_t);
                      }
                    }
                  }
                  _c2229 = (union(setOf(v_c), _g2065).length >= sp.cells.length);
                }
                _c2230 = _c2229;
              }
              let _c2276: boolean = _c2230;
              if (_c2276) {
                let _q2231 = true;
                Q2232: {
                  const _g2233: number[] = [];
                  G2234: {
                    const _a2237 = sp.cellEdges[v_c];
                    for (let _i2238 = 0; _i2238 < _a2237.length; _i2238++) {
                      const v_x = _a2237[_i2238];
                      if (!((_f2040[v_x] === 1))) continue;
                      _g2233.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g2233);
                  const _a2239 = sp.cellEdges[v_c];
                  for (let _i2240 = 0; _i2240 < _a2239.length; _i2240++) {
                    const v_x = _a2239[_i2240];
                    L2241: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c2246: boolean = (v_j !== v_c);
                      if (_c2246) {
                        let _q2242 = false;
                        Q2243: {
                          const _a2244 = sp.cellEdges[v_j];
                          for (let _i2245 = 0; _i2245 < _a2244.length; _i2245++) {
                            const v_y = _a2244[_i2245];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q2242 = true;
                              break Q2243;
                            }
                          }
                        }
                        _c2246 = _q2242;
                      }
                      if (!(_c2246)) break L2241;
                      let _q2247 = false;
                      Q2248: {
                        const _f2250 = new Int32Array(sp.edges.length).fill(-1);
                        let _l2251: readonly number[] = [];
                        const _s2252: number[] = [];
                        const _a2249 = sp.cellEdges[v_j];
                        for (const _e2253 of _l2251) _f2250[_e2253] = -1;
                        _l2251 = _a2249;
                        let _i2255 = 0;
                        _s2252[0] = 0;
                        let _o2259 = _a2249.length === 0;
                        for (;;) {
                          if (_a2249.length === 0) {
                            if (!_o2259) break;
                            _o2259 = false;
                          }
                          while (_a2249.length > 0 && _i2255 >= 0) {
                            const _e2253 = _a2249[_i2255];
                            if (_s2252[_i2255] > 0) _f2250[_e2253] = -1;
                            let _r2258 = (cands[_e2253] >= 0 ? cands[_e2253] : (cands[_e2253] = b.cands[_e2253])) & ~((2 << _s2252[_i2255]) - 1);
                            let _d2254 = 0;
                            V2257: for (; _r2258 !== 0; _r2258 &= _r2258 - 1) {
                              _d2254 = 31 - Math.clz32(_r2258 & -_r2258);
                              _f2250[_e2253] = _d2254;
                              for (let _j2256 = 0; _j2256 < _i2255; _j2256++) {
                                const _y2260 = _a2249[_j2256];
                                if (!((((arms(sp, cl, v_j) === 2) && (_f2250[_e2253] === 1)) && (_f2250[_y2260] === 1)))) continue;
                                if (!((bent(sp, _e2253, _y2260) === (clueAt(cl.piece, v_j) === 3)))) continue V2257;
                              }
                              for (let _j2256 = 0; _j2256 < _i2255; _j2256++) {
                                const _y2261 = _a2249[_j2256];
                                if (!(((((((_f2250[_e2253] === 1) && (_f2250[_y2261] === 1)) && !((b.grid[_e2253] !== 0))) && !((b.grid[_y2261] !== 0))) && !([sp.edgeEnds[2 * _e2253], sp.edgeEnds[2 * _e2253 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y2261], sp.edgeEnds[2 * _y2261 + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, (sp.edgeEnds[2 * _e2253] === v_j ? sp.edgeEnds[2 * _e2253 + 1] : sp.edgeEnds[2 * _e2253]), v_M).includes((sp.edgeEnds[2 * _y2261] === v_j ? sp.edgeEnds[2 * _y2261 + 1] : sp.edgeEnds[2 * _y2261]))))) continue V2257;
                              }
                              break;
                            }
                            if (_r2258 === 0) {
                              _s2252[_i2255] = 0;
                              _i2255--;
                              continue;
                            }
                            _s2252[_i2255] = _d2254;
                            if (_i2255 === _a2249.length - 1) break;
                            _i2255++;
                            _s2252[_i2255] = 0;
                          }
                          if (_i2255 < 0) break;
                          let _q2262 = true;
                          Q2263: {
                            const _a2264 = sp.cellEdges[v_j];
                            for (let _i2265 = 0; _i2265 < _a2264.length; _i2265++) {
                              const v_y = _a2264[_i2265];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f2250[v_y] === _f2040[v_y]))) {
                                _q2262 = false;
                                break Q2263;
                              }
                            }
                          }
                          let _c2270: boolean = _q2262;
                          if (_c2270) {
                            let _g2266 = 0;
                            G2267: {
                              const _a2268 = sp.cellEdges[v_j];
                              for (let _i2269 = 0; _i2269 < _a2268.length; _i2269++) {
                                const v_y = _a2268[_i2269];
                                if (!((_f2250[v_y] === 1))) continue;
                                _g2266++;
                              }
                            }
                            _c2270 = (_g2266 === arms(sp, cl, v_j));
                          }
                          let _c2275: boolean = _c2270;
                          if (_c2275) {
                            let _q2271 = true;
                            Q2272: {
                              const _a2273 = sp.cellEdges[v_j];
                              for (let _i2274 = 0; _i2274 < _a2273.length; _i2274++) {
                                const v_y = _a2273[_i2274];
                                if (!((((_f2250[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                  _q2271 = false;
                                  break Q2272;
                                }
                              }
                            }
                            _c2275 = _q2271;
                          }
                          if (!(_c2275)) continue;
                          if (true) {
                            _q2247 = true;
                            break Q2248;
                          }
                        }
                      }
                      if (!(_q2247)) {
                        _q2231 = false;
                        break Q2232;
                      }
                    }
                  }
                }
                _c2276 = _q2231;
              }
              if (!(_c2276)) continue;
              if (true) {
                _q2037 = true;
                break Q2038;
              }
            }
          }
          freshBinding("strandNote", [sameSet(v_L, _g1541), sameSet(v_U, _g1547), sameSet(v_P, _g1631), (sp.cells.includes(v_c)), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g1637), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q1797), (v_B === _q2037), (!(v_A) || !(v_B))], ["L =", "U =", "P =", "c in", "G =", "K =", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c2278: boolean = (v_A || v_B);
        if (_c2278) {
          let _c2277: boolean = !(!(v_A));
          if (!_c2277) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c2277 = true;
          }
          _c2278 = _c2277;
        }
        let _c2280: boolean = _c2278;
        if (_c2280) {
          let _c2279: boolean = !(!(v_B));
          if (!_c2279) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c2279 = true;
          }
          _c2280 = _c2279;
        }
        if (!(_c2280)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, G: v_G.slice(), K: v_K.slice(), e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

const armsKept = keptStore<number>();
let armsOn: object | null = null;
let armsAt: Kept<number> = [];

/** `arms(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function arms(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== armsOn) {
    armsAt = armsKept.board(cl);
    armsOn = cl;
  }
  const _kept: Kept<number> = armsAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    for (let _i3 = 0; _i3 < 1; _i3++) {
      const v_k = v_c;
      if (!((clueAt(cl.piece, v_k) >= 3))) continue;
      _g1++;
    }
  }
  const _made = (clueAt(cl.piece, v_c) - _g1);
  _kept[v_c] = _made;
  return _made;
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
  let _q1 = false;
  Q2: {
    const _a3 = sp.edgeFaces[v_e];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_f = _a3[_i4];
      if ((sp.edgeFaces[v_x].includes(v_f))) {
        _q1 = true;
        break Q2;
      }
    }
  }
  const _made = _q1;
  _kept1[v_x] = _made;
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}
