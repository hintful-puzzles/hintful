// Compiled by `npm run describe` from src/games/net/net.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, keptStore, memberMarks, minus, rangeMask, setOf, stamps, type Footprint, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g8325: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h8334 = sp.cells.length;
  const _k8349 = armsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q8318 = true;
  Q8319: {
    const _a8320 = sp.cells;
    for (let _i8321 = 0; _i8321 < _a8320.length; _i8321++) {
      const v_c = _a8320[_i8321];
      const _h8322 = clueAt(cl.piece, v_c);
      if (!((_h8322 !== -1))) {
        _q8318 = false;
        break Q8319;
      }
    }
  }
  if (!(_q8318)) return false;
  let _q8323 = true;
  Q8324: {
    _g8325.length = 0;
    G8326: {
      const _a8329 = sp.edges;
      for (let _i8330 = 0; _i8330 < _a8329.length; _i8330++) {
        const v_e = _a8329[_i8330];
        const _h8331 = (g[v_e] || -1);
        if (!((_h8331 === 1))) continue;
        _g8325.push(v_e);
      }
    }
    const v_L = _g8325;
    const _h8333 = v_L.length;
    const _eg8339 = edgeGroups(sp, v_L);
    const _t8332 = sp.cells;
    const v_s = (_t8332.length > 0 ? _t8332[0] : -1);
    let _c8340: boolean = (_h8333 === (_h8334 - 1));
    if (_c8340) {
      let _q8335 = true;
      Q8336: {
        const _a8337 = sp.cells;
        for (let _i8338 = 0; _i8338 < _a8337.length; _i8338++) {
          const v_c = _a8337[_i8338];
          if (!((_eg8339.of(v_c) === _eg8339.of(v_s)))) {
            _q8335 = false;
            break Q8336;
          }
        }
      }
      _c8340 = _q8335;
    }
    if (!(_c8340)) {
      _q8323 = false;
      break Q8324;
    }
  }
  if (!(_q8323)) return false;
  for (let _k8341 = 0; _k8341 < cl.piece.at.length; _k8341++) {
    const _at8342 = cl.piece.at[_k8341];
    const _v8343 = cl.piece.v[_k8341];
    let _g8344 = 0;
    G8345: {
      const _a8346 = sp.cellEdges[_at8342];
      for (let _i8347 = 0; _i8347 < _a8346.length; _i8347++) {
        const v_e = _a8346[_i8347];
        const _h8348 = (g[v_e] || -1);
        if (!((_h8348 === 1))) continue;
        _g8344++;
      }
    }
    let _c8360: boolean = (_g8344 === (_k8349[_at8342] ?? arms(sp, cl, _at8342)));
    if (_c8360) {
      let _q8350 = true;
      Q8351: {
        const _a8352 = sp.cellEdges[_at8342];
        for (let _i8353 = 0; _i8353 < _a8352.length; _i8353++) {
          const v_e = _a8352[_i8353];
          const _h8357 = (g[v_e] || -1);
          const _h8358 = (_h8357 === 1);
          const _a8354 = sp.cellEdges[_at8342];
          const _n8355 = _i8353;
          for (let _i8356 = 0; _i8356 < _n8355; _i8356++) {
            const v_x = _a8354[_i8356];
            const _h8359 = (g[v_x] || -1);
            if (!(((((_k8349[_at8342] ?? arms(sp, cl, _at8342)) === 2) && _h8358) && (_h8359 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v8343 === 3)))) {
              _q8350 = false;
              break Q8351;
            }
          }
        }
      }
      _c8360 = _q8350;
    }
    if (!(_c8360)) return false;
  }
  for (let _k8361 = 0; _k8361 < cl.wall.at.length; _k8361++) {
    const _at8362 = cl.wall.at[_k8361];
    if (!(((g[_at8362] || -1) === 2))) return false;
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
let _p140 = new Int32Array(0);
let _l141: readonly number[] = [];
let _f146 = new Int32Array(0);
let _l147: readonly number[] = [];
let _p186 = new Int32Array(0);
let _l187: readonly number[] = [];
let _f192 = new Int32Array(0);
let _l193: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const fitLockFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function fitLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitLockBinding> | null): number {
  const _g108: number[] = [];
  const _g116: number[] = [];
  if (_p140.length < sp.edges.length) _p140 = new Int32Array(sp.edges.length);
  else _p140.fill(0);
  _l141 = [];
  let _y142 = false;
  if (_f146.length < sp.edges.length) _f146 = new Int32Array(sp.edges.length).fill(-1);
  else _f146.fill(-1);
  _l147 = [];
  const _s148: number[] = [];
  const _g162: number[] = [];
  if (_p186.length < sp.edges.length) _p186 = new Int32Array(sp.edges.length);
  else _p186.fill(0);
  _l187 = [];
  let _y188 = false;
  if (_f192.length < sp.edges.length) _f192 = new Int32Array(sp.edges.length).fill(-1);
  else _f192.fill(-1);
  _l193 = [];
  const _s194: number[] = [];
  const facts = fitLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k157 = armsKept.board(cl);
  if (fitLockCands.length < sp.edges.length) fitLockCands = new Int32Array(sp.edges.length);
  const cands = fitLockCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(fitLockFootprint) ?? null) : null;
  const _a106 = sp.cells;
  for (let _i107 = 0; _i107 < _a106.length; _i107++) {
    const v_c = _a106[_i107];
    let _g143 = -1;
    let _g189 = -1;
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g108.length = 0;
    G109: {
      const _a112 = sp.cellEdges[v_c];
      for (let _i113 = 0; _i113 < _a112.length; _i113++) {
        const v_e = _a112[_i113];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g108.push(v_e);
      }
    }
    L114: {
      const v_F = _g108;
      const _h115 = v_F.length;
      if (!((_h115 > 0))) break L114;
      _g116.length = 0;
      G117: {
        const _a138 = v_F;
        for (let _i139 = 0; _i139 < _a138.length; _i139++) {
          const v_e = _a138[_i139];
          if (_g143 !== _epoch) {
            _g143 = _epoch;
            for (const _e144 of _l141) _p140[_e144] = 0;
            _y142 = false;
            const _a145 = sp.cellEdges[v_c];
            for (const _e149 of _l147) _f146[_e149] = -1;
            _l147 = _a145;
            let _i151 = 0;
            _s148[0] = 0;
            let _o155 = _a145.length === 0;
            for (;;) {
              if (_a145.length === 0) {
                if (!_o155) break;
                _o155 = false;
              }
              while (_a145.length > 0 && _i151 >= 0) {
                const _e149 = _a145[_i151];
                if (_s148[_i151] > 0) _f146[_e149] = -1;
                let _r154 = (cands[_e149] >= 0 ? cands[_e149] : (cands[_e149] = b.cands[_e149])) & ~((2 << _s148[_i151]) - 1);
                let _d150 = 0;
                V153: for (; _r154 !== 0; _r154 &= _r154 - 1) {
                  _d150 = 31 - Math.clz32(_r154 & -_r154);
                  _f146[_e149] = _d150;
                  for (let _j152 = 0; _j152 < _i151; _j152++) {
                    const _y156 = _a145[_j152];
                    if (!(((((_k157[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f146[_e149] === 1)) && (_f146[_y156] === 1)))) continue;
                    if (!((bent(sp, _e149, _y156) === (clueAt(cl.piece, v_c) === 3)))) continue V153;
                  }
                  break;
                }
                if (_r154 === 0) {
                  _s148[_i151] = 0;
                  _i151--;
                  continue;
                }
                _s148[_i151] = _d150;
                if (_i151 === _a145.length - 1) break;
                _i151++;
                _s148[_i151] = 0;
              }
              if (_i151 < 0) break;
              let _g158 = 0;
              G159: {
                const _a160 = sp.cellEdges[v_c];
                for (let _i161 = 0; _i161 < _a160.length; _i161++) {
                  const v_x = _a160[_i161];
                  if (!((_f146[v_x] === 1))) continue;
                  _g158++;
                }
              }
              if (!((_g158 === (_k157[v_c] ?? arms(sp, cl, v_c))))) continue;
              if (!(true)) continue;
              _l141 = _a145;
              _y142 = true;
              for (const _e144 of _a145) _p140[_e144] |= 1 << _f146[_e144];
            }
          }
          if (!(((((_p140[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y142 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g116.push(v_e);
        }
      }
      const v_W = _g116;
      _g162.length = 0;
      G163: {
        const _a184 = v_F;
        for (let _i185 = 0; _i185 < _a184.length; _i185++) {
          const v_e = _a184[_i185];
          if (_g189 !== _epoch) {
            _g189 = _epoch;
            for (const _e190 of _l187) _p186[_e190] = 0;
            _y188 = false;
            const _a191 = sp.cellEdges[v_c];
            for (const _e195 of _l193) _f192[_e195] = -1;
            _l193 = _a191;
            let _i197 = 0;
            _s194[0] = 0;
            let _o201 = _a191.length === 0;
            for (;;) {
              if (_a191.length === 0) {
                if (!_o201) break;
                _o201 = false;
              }
              while (_a191.length > 0 && _i197 >= 0) {
                const _e195 = _a191[_i197];
                if (_s194[_i197] > 0) _f192[_e195] = -1;
                let _r200 = (cands[_e195] >= 0 ? cands[_e195] : (cands[_e195] = b.cands[_e195])) & ~((2 << _s194[_i197]) - 1);
                let _d196 = 0;
                V199: for (; _r200 !== 0; _r200 &= _r200 - 1) {
                  _d196 = 31 - Math.clz32(_r200 & -_r200);
                  _f192[_e195] = _d196;
                  for (let _j198 = 0; _j198 < _i197; _j198++) {
                    const _y202 = _a191[_j198];
                    if (!(((((_k157[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f192[_e195] === 1)) && (_f192[_y202] === 1)))) continue;
                    if (!((bent(sp, _e195, _y202) === (clueAt(cl.piece, v_c) === 3)))) continue V199;
                  }
                  break;
                }
                if (_r200 === 0) {
                  _s194[_i197] = 0;
                  _i197--;
                  continue;
                }
                _s194[_i197] = _d196;
                if (_i197 === _a191.length - 1) break;
                _i197++;
                _s194[_i197] = 0;
              }
              if (_i197 < 0) break;
              let _g203 = 0;
              G204: {
                const _a205 = sp.cellEdges[v_c];
                for (let _i206 = 0; _i206 < _a205.length; _i206++) {
                  const v_x = _a205[_i206];
                  if (!((_f192[v_x] === 1))) continue;
                  _g203++;
                }
              }
              if (!((_g203 === (_k157[v_c] ?? arms(sp, cl, v_c))))) continue;
              if (!(true)) continue;
              _l187 = _a191;
              _y188 = true;
              for (const _e190 of _a191) _p186[_e190] |= 1 << _f192[_e190];
            }
          }
          if (!(((((_p186[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y188 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g162.push(v_e);
        }
      }
      L207: {
        const v_N = _g162;
        let _q208 = true;
        Q209: {
          const _a210 = v_F;
          for (let _i211 = 0; _i211 < _a210.length; _i211++) {
            const v_e = _a210[_i211];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q208 = false;
              break Q209;
            }
          }
        }
        if (!(_q208)) break L207;
        facts.length = 0;
        changed = false;
        let _q212 = true;
        Q213: {
          const _a214 = v_F;
          for (let _i215 = 0; _i215 < _a214.length; _i215++) {
            const v_e = _a214[_i215];
            let _c217: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c217) {
              let _c216: boolean = !(!(v_W.includes(v_e)));
              if (!_c216) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c216 = true;
              }
              _c217 = _c216;
            }
            let _c219: boolean = _c217;
            if (_c219) {
              let _c218: boolean = !(!(v_N.includes(v_e)));
              if (!_c218) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c218 = true;
              }
              _c219 = _c218;
            }
            if (!(_c219)) {
              _q212 = false;
              break Q213;
            }
          }
        }
        if (!(_q212)) return -1;
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
let _p265 = new Int32Array(0);
let _l266: readonly number[] = [];
let _f271 = new Int32Array(0);
let _l272: readonly number[] = [];
let _p287 = new Int32Array(0);
let _l288: readonly number[] = [];
let _f293 = new Int32Array(0);
let _l294: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const fitNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function fitNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitNoteBinding> | null): number {
  if (_p265.length < sp.edges.length) _p265 = new Int32Array(sp.edges.length);
  else _p265.fill(0);
  _l266 = [];
  let _y267 = false;
  if (_f271.length < sp.edges.length) _f271 = new Int32Array(sp.edges.length).fill(-1);
  else _f271.fill(-1);
  _l272 = [];
  const _s273: number[] = [];
  if (_p287.length < sp.edges.length) _p287 = new Int32Array(sp.edges.length);
  else _p287.fill(0);
  _l288 = [];
  let _y289 = false;
  if (_f293.length < sp.edges.length) _f293 = new Int32Array(sp.edges.length).fill(-1);
  else _f293.fill(-1);
  _l294 = [];
  const _s295: number[] = [];
  const facts = fitNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k282 = armsKept.board(cl);
  if (fitNoteCands.length < sp.edges.length) fitNoteCands = new Int32Array(sp.edges.length);
  const cands = fitNoteCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(fitNoteFootprint) ?? null) : null;
  const _a261 = sp.cells;
  for (let _i262 = 0; _i262 < _a261.length; _i262++) {
    const v_c = _a261[_i262];
    let _g268 = -1;
    let _g290 = -1;
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _a263 = sp.cellEdges[v_c];
    for (let _i264 = 0; _i264 < _a263.length; _i264++) {
      const v_e = _a263[_i264];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g268 !== _epoch) {
        _g268 = _epoch;
        for (const _e269 of _l266) _p265[_e269] = 0;
        _y267 = false;
        const _a270 = sp.cellEdges[v_c];
        for (const _e274 of _l272) _f271[_e274] = -1;
        _l272 = _a270;
        let _i276 = 0;
        _s273[0] = 0;
        let _o280 = _a270.length === 0;
        for (;;) {
          if (_a270.length === 0) {
            if (!_o280) break;
            _o280 = false;
          }
          while (_a270.length > 0 && _i276 >= 0) {
            const _e274 = _a270[_i276];
            if (_s273[_i276] > 0) _f271[_e274] = -1;
            let _r279 = (cands[_e274] >= 0 ? cands[_e274] : (cands[_e274] = b.cands[_e274])) & ~((2 << _s273[_i276]) - 1);
            let _d275 = 0;
            V278: for (; _r279 !== 0; _r279 &= _r279 - 1) {
              _d275 = 31 - Math.clz32(_r279 & -_r279);
              _f271[_e274] = _d275;
              for (let _j277 = 0; _j277 < _i276; _j277++) {
                const _y281 = _a270[_j277];
                if (!(((((_k282[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f271[_e274] === 1)) && (_f271[_y281] === 1)))) continue;
                if (!((bent(sp, _e274, _y281) === (clueAt(cl.piece, v_c) === 3)))) continue V278;
              }
              break;
            }
            if (_r279 === 0) {
              _s273[_i276] = 0;
              _i276--;
              continue;
            }
            _s273[_i276] = _d275;
            if (_i276 === _a270.length - 1) break;
            _i276++;
            _s273[_i276] = 0;
          }
          if (_i276 < 0) break;
          let _g283 = 0;
          G284: {
            const _a285 = sp.cellEdges[v_c];
            for (let _i286 = 0; _i286 < _a285.length; _i286++) {
              const v_x = _a285[_i286];
              if (!((_f271[v_x] === 1))) continue;
              _g283++;
            }
          }
          if (!((_g283 === (_k282[v_c] ?? arms(sp, cl, v_c))))) continue;
          if (!(true)) continue;
          _l266 = _a270;
          _y267 = true;
          for (const _e269 of _a270) _p265[_e269] |= 1 << _f271[_e269];
        }
      }
      const v_A = ((((_p265[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y267 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g290 !== _epoch) {
        _g290 = _epoch;
        for (const _e291 of _l288) _p287[_e291] = 0;
        _y289 = false;
        const _a292 = sp.cellEdges[v_c];
        for (const _e296 of _l294) _f293[_e296] = -1;
        _l294 = _a292;
        let _i298 = 0;
        _s295[0] = 0;
        let _o302 = _a292.length === 0;
        for (;;) {
          if (_a292.length === 0) {
            if (!_o302) break;
            _o302 = false;
          }
          while (_a292.length > 0 && _i298 >= 0) {
            const _e296 = _a292[_i298];
            if (_s295[_i298] > 0) _f293[_e296] = -1;
            let _r301 = (cands[_e296] >= 0 ? cands[_e296] : (cands[_e296] = b.cands[_e296])) & ~((2 << _s295[_i298]) - 1);
            let _d297 = 0;
            V300: for (; _r301 !== 0; _r301 &= _r301 - 1) {
              _d297 = 31 - Math.clz32(_r301 & -_r301);
              _f293[_e296] = _d297;
              for (let _j299 = 0; _j299 < _i298; _j299++) {
                const _y303 = _a292[_j299];
                if (!(((((_k282[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f293[_e296] === 1)) && (_f293[_y303] === 1)))) continue;
                if (!((bent(sp, _e296, _y303) === (clueAt(cl.piece, v_c) === 3)))) continue V300;
              }
              break;
            }
            if (_r301 === 0) {
              _s295[_i298] = 0;
              _i298--;
              continue;
            }
            _s295[_i298] = _d297;
            if (_i298 === _a292.length - 1) break;
            _i298++;
            _s295[_i298] = 0;
          }
          if (_i298 < 0) break;
          let _g304 = 0;
          G305: {
            const _a306 = sp.cellEdges[v_c];
            for (let _i307 = 0; _i307 < _a306.length; _i307++) {
              const v_x = _a306[_i307];
              if (!((_f293[v_x] === 1))) continue;
              _g304++;
            }
          }
          if (!((_g304 === (_k282[v_c] ?? arms(sp, cl, v_c))))) continue;
          if (!(true)) continue;
          _l288 = _a292;
          _y289 = true;
          for (const _e291 of _a292) _p287[_e291] |= 1 << _f293[_e291];
        }
      }
      L308: {
        const v_B = ((((_p287[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y289 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L308;
        facts.length = 0;
        changed = false;
        let _c310: boolean = (v_A || v_B);
        if (_c310) {
          let _c309: boolean = !(!(v_A));
          if (!_c309) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c309 = true;
          }
          _c310 = _c309;
        }
        let _c312: boolean = _c310;
        if (_c312) {
          let _c311: boolean = !(!(v_B));
          if (!_c311) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c311 = true;
          }
          _c312 = _c311;
        }
        if (!(_c312)) return -1;
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
let _p488 = new Int32Array(0);
let _l489: readonly number[] = [];
let _f494 = new Int32Array(0);
let _l495: readonly number[] = [];
let _p546 = new Int32Array(0);
let _l547: readonly number[] = [];
let _f552 = new Int32Array(0);
let _l553: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const loopLockFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds"],"kind":"group","set":0},{"steps":[],"kind":"group","set":0}],"relation":false,"sets":["L"]};

/** Its dearest read grows with the board as n. */
export function loopLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopLockBinding> | null): number {
  const _g441: number[] = [];
  const _g449: number[] = [];
  const _g458: number[] = [];
  if (_p488.length < sp.edges.length) _p488 = new Int32Array(sp.edges.length);
  else _p488.fill(0);
  _l489 = [];
  let _y490 = false;
  if (_f494.length < sp.edges.length) _f494 = new Int32Array(sp.edges.length).fill(-1);
  else _f494.fill(-1);
  _l495 = [];
  const _s496: number[] = [];
  const _g516: number[] = [];
  if (_p546.length < sp.edges.length) _p546 = new Int32Array(sp.edges.length);
  else _p546.fill(0);
  _l547 = [];
  let _y548 = false;
  if (_f552.length < sp.edges.length) _f552 = new Int32Array(sp.edges.length).fill(-1);
  else _f552.fill(-1);
  _l553 = [];
  const _s554: number[] = [];
  const facts = loopLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k505 = armsKept.board(cl);
  if (loopLockCands.length < sp.edges.length) loopLockCands = new Int32Array(sp.edges.length);
  const cands = loopLockCands;
  cands.fill(-1);
  _g441.length = 0;
  G442: {
    const _a445 = sp.edges;
    for (let _i446 = 0; _i446 < _a445.length; _i446++) {
      const v_e = _a445[_i446];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g441.push(v_e);
    }
  }
  const v_L = _g441;
  const _eg457 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _visit = fire === null ? (b.visit?.(loopLockFootprint, [_eg457]) ?? null) : null;
  const _a447 = sp.cells;
  for (let _i448 = 0; _i448 < _a447.length; _i448++) {
    const v_c = _a447[_i448];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g449.length = 0;
    G450: {
      const _a453 = sp.cellEdges[v_c];
      for (let _i454 = 0; _i454 < _a453.length; _i454++) {
        const v_e = _a453[_i454];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g449.push(v_e);
      }
    }
    L455: {
      const v_F = _g449;
      const _h456 = v_F.length;
      if (!((_h456 > 0))) break L455;
      const v_G = _eg457.of(v_c);
      let _g491 = -1;
      let _g549 = -1;
      _g458.length = 0;
      G459: {
        const _a486 = v_F;
        for (let _i487 = 0; _i487 < _a486.length; _i487++) {
          const v_e = _a486[_i487];
          if (_g491 !== _epoch) {
            _g491 = _epoch;
            for (const _e492 of _l489) _p488[_e492] = 0;
            _y490 = false;
            const _a493 = sp.cellEdges[v_c];
            for (const _e497 of _l495) _f494[_e497] = -1;
            _l495 = _a493;
            let _i499 = 0;
            _s496[0] = 0;
            let _o503 = _a493.length === 0;
            for (;;) {
              if (_a493.length === 0) {
                if (!_o503) break;
                _o503 = false;
              }
              while (_a493.length > 0 && _i499 >= 0) {
                const _e497 = _a493[_i499];
                if (_s496[_i499] > 0) _f494[_e497] = -1;
                let _r502 = (cands[_e497] >= 0 ? cands[_e497] : (cands[_e497] = b.cands[_e497])) & ~((2 << _s496[_i499]) - 1);
                let _d498 = 0;
                V501: for (; _r502 !== 0; _r502 &= _r502 - 1) {
                  _d498 = 31 - Math.clz32(_r502 & -_r502);
                  _f494[_e497] = _d498;
                  for (let _j500 = 0; _j500 < _i499; _j500++) {
                    const _y504 = _a493[_j500];
                    if (!(((((_k505[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f494[_e497] === 1)) && (_f494[_y504] === 1)))) continue;
                    if (!((bent(sp, _e497, _y504) === (clueAt(cl.piece, v_c) === 3)))) continue V501;
                  }
                  for (let _j500 = 0; _j500 < _i499; _j500++) {
                    const _y506 = _a493[_j500];
                    if (!(((((_f494[_e497] === 1) && (_f494[_y506] === 1)) && !((b.grid[_e497] !== 0))) && !((b.grid[_y506] !== 0))))) continue;
                    if (!(!(_eg457.of((sp.edgeEnds[2 * _y506] === v_c ? sp.edgeEnds[2 * _y506 + 1] : sp.edgeEnds[2 * _y506])) === _eg457.of((sp.edgeEnds[2 * _e497] === v_c ? sp.edgeEnds[2 * _e497 + 1] : sp.edgeEnds[2 * _e497]))))) continue V501;
                  }
                  break;
                }
                if (_r502 === 0) {
                  _s496[_i499] = 0;
                  _i499--;
                  continue;
                }
                _s496[_i499] = _d498;
                if (_i499 === _a493.length - 1) break;
                _i499++;
                _s496[_i499] = 0;
              }
              if (_i499 < 0) break;
              let _g507 = 0;
              G508: {
                const _a509 = sp.cellEdges[v_c];
                for (let _i510 = 0; _i510 < _a509.length; _i510++) {
                  const v_x = _a509[_i510];
                  if (!((_f494[v_x] === 1))) continue;
                  _g507++;
                }
              }
              let _c515: boolean = (_g507 === (_k505[v_c] ?? arms(sp, cl, v_c)));
              if (_c515) {
                let _q511 = true;
                Q512: {
                  const _a513 = sp.cellEdges[v_c];
                  for (let _i514 = 0; _i514 < _a513.length; _i514++) {
                    const v_x = _a513[_i514];
                    if (!(((_f494[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg457.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q511 = false;
                      break Q512;
                    }
                  }
                }
                _c515 = _q511;
              }
              if (!(_c515)) continue;
              if (!(true)) continue;
              _l489 = _a493;
              _y490 = true;
              for (const _e492 of _a493) _p488[_e492] |= 1 << _f494[_e492];
            }
          }
          if (!(((((_p488[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y490 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g458.push(v_e);
        }
      }
      const v_W = _g458;
      _g516.length = 0;
      G517: {
        const _a544 = v_F;
        for (let _i545 = 0; _i545 < _a544.length; _i545++) {
          const v_e = _a544[_i545];
          if (_g549 !== _epoch) {
            _g549 = _epoch;
            for (const _e550 of _l547) _p546[_e550] = 0;
            _y548 = false;
            const _a551 = sp.cellEdges[v_c];
            for (const _e555 of _l553) _f552[_e555] = -1;
            _l553 = _a551;
            let _i557 = 0;
            _s554[0] = 0;
            let _o561 = _a551.length === 0;
            for (;;) {
              if (_a551.length === 0) {
                if (!_o561) break;
                _o561 = false;
              }
              while (_a551.length > 0 && _i557 >= 0) {
                const _e555 = _a551[_i557];
                if (_s554[_i557] > 0) _f552[_e555] = -1;
                let _r560 = (cands[_e555] >= 0 ? cands[_e555] : (cands[_e555] = b.cands[_e555])) & ~((2 << _s554[_i557]) - 1);
                let _d556 = 0;
                V559: for (; _r560 !== 0; _r560 &= _r560 - 1) {
                  _d556 = 31 - Math.clz32(_r560 & -_r560);
                  _f552[_e555] = _d556;
                  for (let _j558 = 0; _j558 < _i557; _j558++) {
                    const _y562 = _a551[_j558];
                    if (!(((((_k505[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f552[_e555] === 1)) && (_f552[_y562] === 1)))) continue;
                    if (!((bent(sp, _e555, _y562) === (clueAt(cl.piece, v_c) === 3)))) continue V559;
                  }
                  for (let _j558 = 0; _j558 < _i557; _j558++) {
                    const _y563 = _a551[_j558];
                    if (!(((((_f552[_e555] === 1) && (_f552[_y563] === 1)) && !((b.grid[_e555] !== 0))) && !((b.grid[_y563] !== 0))))) continue;
                    if (!(!(_eg457.of((sp.edgeEnds[2 * _y563] === v_c ? sp.edgeEnds[2 * _y563 + 1] : sp.edgeEnds[2 * _y563])) === _eg457.of((sp.edgeEnds[2 * _e555] === v_c ? sp.edgeEnds[2 * _e555 + 1] : sp.edgeEnds[2 * _e555]))))) continue V559;
                  }
                  break;
                }
                if (_r560 === 0) {
                  _s554[_i557] = 0;
                  _i557--;
                  continue;
                }
                _s554[_i557] = _d556;
                if (_i557 === _a551.length - 1) break;
                _i557++;
                _s554[_i557] = 0;
              }
              if (_i557 < 0) break;
              let _g564 = 0;
              G565: {
                const _a566 = sp.cellEdges[v_c];
                for (let _i567 = 0; _i567 < _a566.length; _i567++) {
                  const v_x = _a566[_i567];
                  if (!((_f552[v_x] === 1))) continue;
                  _g564++;
                }
              }
              let _c572: boolean = (_g564 === (_k505[v_c] ?? arms(sp, cl, v_c)));
              if (_c572) {
                let _q568 = true;
                Q569: {
                  const _a570 = sp.cellEdges[v_c];
                  for (let _i571 = 0; _i571 < _a570.length; _i571++) {
                    const v_x = _a570[_i571];
                    if (!(((_f552[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg457.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q568 = false;
                      break Q569;
                    }
                  }
                }
                _c572 = _q568;
              }
              if (!(_c572)) continue;
              if (!(true)) continue;
              _l547 = _a551;
              _y548 = true;
              for (const _e550 of _a551) _p546[_e550] |= 1 << _f552[_e550];
            }
          }
          if (!(((((_p546[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y548 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g516.push(v_e);
        }
      }
      L573: {
        const v_N = _g516;
        let _q574 = true;
        Q575: {
          const _a576 = v_F;
          for (let _i577 = 0; _i577 < _a576.length; _i577++) {
            const v_e = _a576[_i577];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q574 = false;
              break Q575;
            }
          }
        }
        if (!(_q574)) break L573;
        facts.length = 0;
        changed = false;
        let _q578 = true;
        Q579: {
          const _a580 = v_F;
          for (let _i581 = 0; _i581 < _a580.length; _i581++) {
            const v_e = _a580[_i581];
            let _c583: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c583) {
              let _c582: boolean = !(!(v_W.includes(v_e)));
              if (!_c582) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c582 = true;
              }
              _c583 = _c582;
            }
            let _c585: boolean = _c583;
            if (_c585) {
              let _c584: boolean = !(!(v_N.includes(v_e)));
              if (!_c584) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c584 = true;
              }
              _c585 = _c584;
            }
            if (!(_c585)) {
              _q578 = false;
              break Q579;
            }
          }
        }
        if (!(_q578)) return -1;
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
let _p664 = new Int32Array(0);
let _l665: readonly number[] = [];
let _f670 = new Int32Array(0);
let _l671: readonly number[] = [];
let _p692 = new Int32Array(0);
let _l693: readonly number[] = [];
let _f698 = new Int32Array(0);
let _l699: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const loopNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds"],"kind":"group","set":0},{"steps":[],"kind":"group","set":0}],"relation":false,"sets":["L"]};

/** Its dearest read grows with the board as n. */
export function loopNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopNoteBinding> | null): number {
  const _g649: number[] = [];
  if (_p664.length < sp.edges.length) _p664 = new Int32Array(sp.edges.length);
  else _p664.fill(0);
  _l665 = [];
  let _y666 = false;
  if (_f670.length < sp.edges.length) _f670 = new Int32Array(sp.edges.length).fill(-1);
  else _f670.fill(-1);
  _l671 = [];
  const _s672: number[] = [];
  if (_p692.length < sp.edges.length) _p692 = new Int32Array(sp.edges.length);
  else _p692.fill(0);
  _l693 = [];
  let _y694 = false;
  if (_f698.length < sp.edges.length) _f698 = new Int32Array(sp.edges.length).fill(-1);
  else _f698.fill(-1);
  _l699 = [];
  const _s700: number[] = [];
  const facts = loopNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k681 = armsKept.board(cl);
  if (loopNoteCands.length < sp.edges.length) loopNoteCands = new Int32Array(sp.edges.length);
  const cands = loopNoteCands;
  cands.fill(-1);
  _g649.length = 0;
  G650: {
    const _a653 = sp.edges;
    for (let _i654 = 0; _i654 < _a653.length; _i654++) {
      const v_e = _a653[_i654];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g649.push(v_e);
    }
  }
  const v_L = _g649;
  const _eg661 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _visit = fire === null ? (b.visit?.(loopNoteFootprint, [_eg661]) ?? null) : null;
  const _a655 = sp.cells;
  for (let _i656 = 0; _i656 < _a655.length; _i656++) {
    const v_c = _a655[_i656];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _q657 = false;
    Q658: {
      const _a659 = sp.cellEdges[v_c];
      for (let _i660 = 0; _i660 < _a659.length; _i660++) {
        const v_e = _a659[_i660];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q657 = true;
          break Q658;
        }
      }
    }
    if (!(_q657)) continue;
    const v_G = _eg661.of(v_c);
    let _g667 = -1;
    let _g695 = -1;
    const _a662 = sp.cellEdges[v_c];
    for (let _i663 = 0; _i663 < _a662.length; _i663++) {
      const v_e = _a662[_i663];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g667 !== _epoch) {
        _g667 = _epoch;
        for (const _e668 of _l665) _p664[_e668] = 0;
        _y666 = false;
        const _a669 = sp.cellEdges[v_c];
        for (const _e673 of _l671) _f670[_e673] = -1;
        _l671 = _a669;
        let _i675 = 0;
        _s672[0] = 0;
        let _o679 = _a669.length === 0;
        for (;;) {
          if (_a669.length === 0) {
            if (!_o679) break;
            _o679 = false;
          }
          while (_a669.length > 0 && _i675 >= 0) {
            const _e673 = _a669[_i675];
            if (_s672[_i675] > 0) _f670[_e673] = -1;
            let _r678 = (cands[_e673] >= 0 ? cands[_e673] : (cands[_e673] = b.cands[_e673])) & ~((2 << _s672[_i675]) - 1);
            let _d674 = 0;
            V677: for (; _r678 !== 0; _r678 &= _r678 - 1) {
              _d674 = 31 - Math.clz32(_r678 & -_r678);
              _f670[_e673] = _d674;
              for (let _j676 = 0; _j676 < _i675; _j676++) {
                const _y680 = _a669[_j676];
                if (!(((((_k681[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f670[_e673] === 1)) && (_f670[_y680] === 1)))) continue;
                if (!((bent(sp, _e673, _y680) === (clueAt(cl.piece, v_c) === 3)))) continue V677;
              }
              for (let _j676 = 0; _j676 < _i675; _j676++) {
                const _y682 = _a669[_j676];
                if (!(((((_f670[_e673] === 1) && (_f670[_y682] === 1)) && !((b.grid[_e673] !== 0))) && !((b.grid[_y682] !== 0))))) continue;
                if (!(!(_eg661.of((sp.edgeEnds[2 * _y682] === v_c ? sp.edgeEnds[2 * _y682 + 1] : sp.edgeEnds[2 * _y682])) === _eg661.of((sp.edgeEnds[2 * _e673] === v_c ? sp.edgeEnds[2 * _e673 + 1] : sp.edgeEnds[2 * _e673]))))) continue V677;
              }
              break;
            }
            if (_r678 === 0) {
              _s672[_i675] = 0;
              _i675--;
              continue;
            }
            _s672[_i675] = _d674;
            if (_i675 === _a669.length - 1) break;
            _i675++;
            _s672[_i675] = 0;
          }
          if (_i675 < 0) break;
          let _g683 = 0;
          G684: {
            const _a685 = sp.cellEdges[v_c];
            for (let _i686 = 0; _i686 < _a685.length; _i686++) {
              const v_x = _a685[_i686];
              if (!((_f670[v_x] === 1))) continue;
              _g683++;
            }
          }
          let _c691: boolean = (_g683 === (_k681[v_c] ?? arms(sp, cl, v_c)));
          if (_c691) {
            let _q687 = true;
            Q688: {
              const _a689 = sp.cellEdges[v_c];
              for (let _i690 = 0; _i690 < _a689.length; _i690++) {
                const v_x = _a689[_i690];
                if (!(((_f670[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg661.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q687 = false;
                  break Q688;
                }
              }
            }
            _c691 = _q687;
          }
          if (!(_c691)) continue;
          if (!(true)) continue;
          _l665 = _a669;
          _y666 = true;
          for (const _e668 of _a669) _p664[_e668] |= 1 << _f670[_e668];
        }
      }
      const v_A = ((((_p664[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y666 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g695 !== _epoch) {
        _g695 = _epoch;
        for (const _e696 of _l693) _p692[_e696] = 0;
        _y694 = false;
        const _a697 = sp.cellEdges[v_c];
        for (const _e701 of _l699) _f698[_e701] = -1;
        _l699 = _a697;
        let _i703 = 0;
        _s700[0] = 0;
        let _o707 = _a697.length === 0;
        for (;;) {
          if (_a697.length === 0) {
            if (!_o707) break;
            _o707 = false;
          }
          while (_a697.length > 0 && _i703 >= 0) {
            const _e701 = _a697[_i703];
            if (_s700[_i703] > 0) _f698[_e701] = -1;
            let _r706 = (cands[_e701] >= 0 ? cands[_e701] : (cands[_e701] = b.cands[_e701])) & ~((2 << _s700[_i703]) - 1);
            let _d702 = 0;
            V705: for (; _r706 !== 0; _r706 &= _r706 - 1) {
              _d702 = 31 - Math.clz32(_r706 & -_r706);
              _f698[_e701] = _d702;
              for (let _j704 = 0; _j704 < _i703; _j704++) {
                const _y708 = _a697[_j704];
                if (!(((((_k681[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f698[_e701] === 1)) && (_f698[_y708] === 1)))) continue;
                if (!((bent(sp, _e701, _y708) === (clueAt(cl.piece, v_c) === 3)))) continue V705;
              }
              for (let _j704 = 0; _j704 < _i703; _j704++) {
                const _y709 = _a697[_j704];
                if (!(((((_f698[_e701] === 1) && (_f698[_y709] === 1)) && !((b.grid[_e701] !== 0))) && !((b.grid[_y709] !== 0))))) continue;
                if (!(!(_eg661.of((sp.edgeEnds[2 * _y709] === v_c ? sp.edgeEnds[2 * _y709 + 1] : sp.edgeEnds[2 * _y709])) === _eg661.of((sp.edgeEnds[2 * _e701] === v_c ? sp.edgeEnds[2 * _e701 + 1] : sp.edgeEnds[2 * _e701]))))) continue V705;
              }
              break;
            }
            if (_r706 === 0) {
              _s700[_i703] = 0;
              _i703--;
              continue;
            }
            _s700[_i703] = _d702;
            if (_i703 === _a697.length - 1) break;
            _i703++;
            _s700[_i703] = 0;
          }
          if (_i703 < 0) break;
          let _g710 = 0;
          G711: {
            const _a712 = sp.cellEdges[v_c];
            for (let _i713 = 0; _i713 < _a712.length; _i713++) {
              const v_x = _a712[_i713];
              if (!((_f698[v_x] === 1))) continue;
              _g710++;
            }
          }
          let _c718: boolean = (_g710 === (_k681[v_c] ?? arms(sp, cl, v_c)));
          if (_c718) {
            let _q714 = true;
            Q715: {
              const _a716 = sp.cellEdges[v_c];
              for (let _i717 = 0; _i717 < _a716.length; _i717++) {
                const v_x = _a716[_i717];
                if (!(((_f698[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg661.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q714 = false;
                  break Q715;
                }
              }
            }
            _c718 = _q714;
          }
          if (!(_c718)) continue;
          if (!(true)) continue;
          _l693 = _a697;
          _y694 = true;
          for (const _e696 of _a697) _p692[_e696] |= 1 << _f698[_e696];
        }
      }
      L719: {
        const v_B = ((((_p692[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y694 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L719;
        facts.length = 0;
        changed = false;
        let _c721: boolean = (v_A || v_B);
        if (_c721) {
          let _c720: boolean = !(!(v_A));
          if (!_c720) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c720 = true;
          }
          _c721 = _c720;
        }
        let _c723: boolean = _c721;
        if (_c723) {
          let _c722: boolean = !(!(v_B));
          if (!_c722) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c722 = true;
          }
          _c723 = _c722;
        }
        if (!(_c723)) return -1;
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
let _f1837 = new Int32Array(0);
let _l1838: readonly number[] = [];
let _f1857 = new Int32Array(0);
let _l1858: readonly number[] = [];
const _st2013 = stamps();
let _f2019 = new Int32Array(0);
let _l2020: readonly number[] = [];
const _st2050 = stamps();
let _p2262 = new Int32Array(0);
let _l2263: readonly number[] = [];
let _f2268 = new Int32Array(0);
let _l2269: readonly number[] = [];
const _st2376 = stamps();
const _st2419 = stamps();
let _f2425 = new Int32Array(0);
let _l2426: readonly number[] = [];
const _st2455 = stamps();
let _p2670 = new Int32Array(0);
let _l2671: readonly number[] = [];
let _f2676 = new Int32Array(0);
let _l2677: readonly number[] = [];
const _st2784 = stamps();
const _st2827 = stamps();
let _f2833 = new Int32Array(0);
let _l2834: readonly number[] = [];
const _st2863 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealLockBinding> | null): number {
  const _g1782: number[] = [];
  const _g1788: number[] = [];
  if (_f1837.length < sp.edges.length) _f1837 = new Int32Array(sp.edges.length).fill(-1);
  else _f1837.fill(-1);
  _l1838 = [];
  const _s1839: number[] = [];
  if (_f1857.length < sp.edges.length) _f1857 = new Int32Array(sp.edges.length).fill(-1);
  else _f1857.fill(-1);
  _l1858 = [];
  const _s1859: number[] = [];
  const _g1873: number[] = [];
  const _g1881: number[] = [];
  const _g1890: number[] = [];
  const _g1974: number[] = [];
  if (_f2019.length < sp.edges.length) _f2019 = new Int32Array(sp.edges.length).fill(-1);
  else _f2019.fill(-1);
  _l2020 = [];
  const _s2021: number[] = [];
  const _g2043: number[] = [];
  const _g2062: number[] = [];
  if (_p2262.length < sp.edges.length) _p2262 = new Int32Array(sp.edges.length);
  else _p2262.fill(0);
  _l2263 = [];
  let _y2264 = false;
  if (_f2268.length < sp.edges.length) _f2268 = new Int32Array(sp.edges.length).fill(-1);
  else _f2268.fill(-1);
  _l2269 = [];
  const _s2270: number[] = [];
  const _g2293: number[] = [];
  const _g2380: number[] = [];
  if (_f2425.length < sp.edges.length) _f2425 = new Int32Array(sp.edges.length).fill(-1);
  else _f2425.fill(-1);
  _l2426 = [];
  const _s2427: number[] = [];
  const _g2448: number[] = [];
  const _g2470: number[] = [];
  if (_p2670.length < sp.edges.length) _p2670 = new Int32Array(sp.edges.length);
  else _p2670.fill(0);
  _l2671 = [];
  let _y2672 = false;
  if (_f2676.length < sp.edges.length) _f2676 = new Int32Array(sp.edges.length).fill(-1);
  else _f2676.fill(-1);
  _l2677 = [];
  const _s2678: number[] = [];
  const _g2701: number[] = [];
  const _g2788: number[] = [];
  if (_f2833.length < sp.edges.length) _f2833 = new Int32Array(sp.edges.length).fill(-1);
  else _f2833.fill(-1);
  _l2834 = [];
  const _s2835: number[] = [];
  const _g2856: number[] = [];
  const facts = sealLockFacts;
  let fired = 0;
  let changed = false;
  const _k1848 = armsKept.board(cl);
  const _h2061 = sp.cells.length;
  let _epoch = 0;
  if (sealLockCands.length < sp.edges.length) sealLockCands = new Int32Array(sp.edges.length);
  const cands = sealLockCands;
  cands.fill(-1);
  _g1782.length = 0;
  G1783: {
    const _a1786 = sp.edges;
    for (let _i1787 = 0; _i1787 < _a1786.length; _i1787++) {
      const v_e = _a1786[_i1787];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1782.push(v_e);
    }
  }
  const v_L = _g1782;
  const _eg1889 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1788.length = 0;
  G1789: {
    const _a1831 = sp.edges;
    for (let _i1832 = 0; _i1832 < _a1831.length; _i1832++) {
      const v_e = _a1831[_i1832];
      const _t1833 = sp.edgeEnds[2 * v_e];
      let _q1834 = false;
      Q1835: {
        const _a1836 = sp.cellEdges[_t1833];
        for (const _e1840 of _l1838) _f1837[_e1840] = -1;
        _l1838 = _a1836;
        let _i1842 = 0;
        _s1839[0] = 0;
        let _o1846 = _a1836.length === 0;
        for (;;) {
          if (_a1836.length === 0) {
            if (!_o1846) break;
            _o1846 = false;
          }
          while (_a1836.length > 0 && _i1842 >= 0) {
            const _e1840 = _a1836[_i1842];
            if (_s1839[_i1842] > 0) _f1837[_e1840] = -1;
            let _r1845 = (cands[_e1840] >= 0 ? cands[_e1840] : (cands[_e1840] = b.cands[_e1840])) & ~((2 << _s1839[_i1842]) - 1);
            let _d1841 = 0;
            V1844: for (; _r1845 !== 0; _r1845 &= _r1845 - 1) {
              _d1841 = 31 - Math.clz32(_r1845 & -_r1845);
              _f1837[_e1840] = _d1841;
              if (_e1840 === v_e && _d1841 !== 1) continue;
              for (let _j1843 = 0; _j1843 < _i1842; _j1843++) {
                const _y1847 = _a1836[_j1843];
                if (!(((((_k1848[_t1833] ?? arms(sp, cl, _t1833)) === 2) && (_f1837[_e1840] === 1)) && (_f1837[_y1847] === 1)))) continue;
                if (!((bent(sp, _e1840, _y1847) === (clueAt(cl.piece, _t1833) === 3)))) continue V1844;
              }
              break;
            }
            if (_r1845 === 0) {
              _s1839[_i1842] = 0;
              _i1842--;
              continue;
            }
            _s1839[_i1842] = _d1841;
            if (_i1842 === _a1836.length - 1) break;
            _i1842++;
            _s1839[_i1842] = 0;
          }
          if (_i1842 < 0) break;
          let _g1849 = 0;
          G1850: {
            const _a1851 = sp.cellEdges[_t1833];
            for (let _i1852 = 0; _i1852 < _a1851.length; _i1852++) {
              const v_x = _a1851[_i1852];
              if (!((_f1837[v_x] === 1))) continue;
              _g1849++;
            }
          }
          if (!((_g1849 === (_k1848[_t1833] ?? arms(sp, cl, _t1833))))) continue;
          if (true) {
            _q1834 = true;
            break Q1835;
          }
        }
      }
      let _c1872: boolean = _q1834;
      if (_c1872) {
        const _t1853 = sp.edgeEnds[2 * v_e + 1];
        let _q1854 = false;
        Q1855: {
          const _a1856 = sp.cellEdges[_t1853];
          for (const _e1860 of _l1858) _f1857[_e1860] = -1;
          _l1858 = _a1856;
          let _i1862 = 0;
          _s1859[0] = 0;
          let _o1866 = _a1856.length === 0;
          for (;;) {
            if (_a1856.length === 0) {
              if (!_o1866) break;
              _o1866 = false;
            }
            while (_a1856.length > 0 && _i1862 >= 0) {
              const _e1860 = _a1856[_i1862];
              if (_s1859[_i1862] > 0) _f1857[_e1860] = -1;
              let _r1865 = (cands[_e1860] >= 0 ? cands[_e1860] : (cands[_e1860] = b.cands[_e1860])) & ~((2 << _s1859[_i1862]) - 1);
              let _d1861 = 0;
              V1864: for (; _r1865 !== 0; _r1865 &= _r1865 - 1) {
                _d1861 = 31 - Math.clz32(_r1865 & -_r1865);
                _f1857[_e1860] = _d1861;
                if (_e1860 === v_e && _d1861 !== 1) continue;
                for (let _j1863 = 0; _j1863 < _i1862; _j1863++) {
                  const _y1867 = _a1856[_j1863];
                  if (!(((((_k1848[_t1853] ?? arms(sp, cl, _t1853)) === 2) && (_f1857[_e1860] === 1)) && (_f1857[_y1867] === 1)))) continue;
                  if (!((bent(sp, _e1860, _y1867) === (clueAt(cl.piece, _t1853) === 3)))) continue V1864;
                }
                break;
              }
              if (_r1865 === 0) {
                _s1859[_i1862] = 0;
                _i1862--;
                continue;
              }
              _s1859[_i1862] = _d1861;
              if (_i1862 === _a1856.length - 1) break;
              _i1862++;
              _s1859[_i1862] = 0;
            }
            if (_i1862 < 0) break;
            let _g1868 = 0;
            G1869: {
              const _a1870 = sp.cellEdges[_t1853];
              for (let _i1871 = 0; _i1871 < _a1870.length; _i1871++) {
                const v_x = _a1870[_i1871];
                if (!((_f1857[v_x] === 1))) continue;
                _g1868++;
              }
            }
            if (!((_g1868 === (_k1848[_t1853] ?? arms(sp, cl, _t1853))))) continue;
            if (true) {
              _q1854 = true;
              break Q1855;
            }
          }
        }
        _c1872 = _q1854;
      }
      if (!(_c1872)) continue;
      _g1788.push(v_e);
    }
  }
  const v_U = _g1788;
  const _mm2056 = memberMarks(v_U);
  _g1873.length = 0;
  G1874: {
    const _a1877 = v_U;
    for (let _i1878 = 0; _i1878 < _a1877.length; _i1878++) {
      const v_e = _a1877[_i1878];
      if (!((((_k1848[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k1848[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g1873.push(v_e);
    }
  }
  const v_P = _g1873;
  const _a1879 = sp.cells;
  for (let _i1880 = 0; _i1880 < _a1879.length; _i1880++) {
    const v_c = _a1879[_i1880];
    const _h2035 = minus(v_P, sp.cellEdges[v_c]);
    _g1881.length = 0;
    G1882: {
      const _a1885 = sp.cellEdges[v_c];
      for (let _i1886 = 0; _i1886 < _a1885.length; _i1886++) {
        const v_e = _a1885[_i1886];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1881.push(v_e);
      }
    }
    L1887: {
      const v_F = _g1881;
      const _h1888 = v_F.length;
      if (!((_h1888 > 0))) break L1887;
      const v_G = _eg1889.of(v_c);
      _g1890.length = 0;
      G1891: {
        const _a1971 = sp.cellEdges[v_c];
        for (let _i1972 = 0; _i1972 < _a1971.length; _i1972++) {
          const v_x = _a1971[_i1972];
          const _t1973 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h2036 = minus(_h2035, sp.cellEdges[_t1973]);
          const _eg2038 = edgeGroups(sp, _h2036);
          const _memo2041 = new Map<readonly number[], readonly number[]>();
          _g1974.length = 0;
          _st2013.pass++;
          G1975: {
            const _a2014 = sp.cellEdges[_t1973];
            for (let _i2015 = 0; _i2015 < _a2014.length; _i2015++) {
              const v_y = _a2014[_i2015];
              let _c2034: boolean = (v_y !== v_x);
              if (_c2034) {
                let _q2016 = false;
                Q2017: {
                  const _a2018 = sp.cellEdges[_t1973];
                  for (const _e2022 of _l2020) _f2019[_e2022] = -1;
                  _l2020 = _a2018;
                  let _i2024 = 0;
                  _s2021[0] = 0;
                  let _o2028 = _a2018.length === 0;
                  for (;;) {
                    if (_a2018.length === 0) {
                      if (!_o2028) break;
                      _o2028 = false;
                    }
                    while (_a2018.length > 0 && _i2024 >= 0) {
                      const _e2022 = _a2018[_i2024];
                      if (_s2021[_i2024] > 0) _f2019[_e2022] = -1;
                      let _r2027 = (cands[_e2022] >= 0 ? cands[_e2022] : (cands[_e2022] = b.cands[_e2022])) & ~((2 << _s2021[_i2024]) - 1);
                      let _d2023 = 0;
                      V2026: for (; _r2027 !== 0; _r2027 &= _r2027 - 1) {
                        _d2023 = 31 - Math.clz32(_r2027 & -_r2027);
                        _f2019[_e2022] = _d2023;
                        if (_e2022 === v_x && _d2023 !== 1) continue;
                        if (_e2022 === v_y && _d2023 !== 1) continue;
                        for (let _j2025 = 0; _j2025 < _i2024; _j2025++) {
                          const _y2029 = _a2018[_j2025];
                          if (!(((((_k1848[_t1973] ?? arms(sp, cl, _t1973)) === 2) && (_f2019[_e2022] === 1)) && (_f2019[_y2029] === 1)))) continue;
                          if (!((bent(sp, _e2022, _y2029) === (clueAt(cl.piece, _t1973) === 3)))) continue V2026;
                        }
                        break;
                      }
                      if (_r2027 === 0) {
                        _s2021[_i2024] = 0;
                        _i2024--;
                        continue;
                      }
                      _s2021[_i2024] = _d2023;
                      if (_i2024 === _a2018.length - 1) break;
                      _i2024++;
                      _s2021[_i2024] = 0;
                    }
                    if (_i2024 < 0) break;
                    let _g2030 = 0;
                    G2031: {
                      const _a2032 = sp.cellEdges[_t1973];
                      for (let _i2033 = 0; _i2033 < _a2032.length; _i2033++) {
                        const v_z = _a2032[_i2033];
                        if (!((_f2019[v_z] === 1))) continue;
                        _g2030++;
                      }
                    }
                    if (!((_g2030 === (_k1848[_t1973] ?? arms(sp, cl, _t1973))))) continue;
                    if (true) {
                      _q2016 = true;
                      break Q2017;
                    }
                  }
                }
                _c2034 = _q2016;
              }
              if (!(_c2034)) continue;
              const _t2037 = (sp.edgeEnds[2 * v_y] === _t1973 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t2040 = _eg2038.of(_t2037);
              let _gs2042 = _memo2041.get(_t2040);
              if (_gs2042 === undefined) {
                _g2043.length = 0;
                _st2050.pass++;
                G2044: {
                  const _a2051 = _t2040;
                  for (let _i2052 = 0; _i2052 < _a2051.length; _i2052++) {
                    const v_t = _a2051[_i2052];
                    if (!(((_k1848[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a2053 = sp.cellEdges[v_t];
                    for (let _i2054 = 0; _i2054 < _a2053.length; _i2054++) {
                      const v_y = _a2053[_i2054];
                      L2055: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k1848[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2056[v_y + 1] === 1)))) break L2055;
                        const _t2057 = v_z;
                        if (_g2043.length < 16) { if (!_g2043.includes(_t2057)) _g2043.push(_t2057); } else addOnce(_g2043, _st2050, _t2057);
                      }
                    }
                  }
                }
                _gs2042 = _g2043.slice();
                _memo2041.set(_t2040, _gs2042);
              }
              const _a2058 = union(_eg2038.of(_t2037), _gs2042);
              for (let _i2059 = 0; _i2059 < _a2058.length; _i2059++) {
                const v_t = _a2058[_i2059];
                const _t2060 = v_t;
                if (_g1974.length < 16) { if (!_g1974.includes(_t2060)) _g1974.push(_t2060); } else addOnce(_g1974, _st2013, _t2060);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t1973), _g1974)).length >= _h2061))) continue;
          _g1890.push(v_x);
        }
      }
      const v_K = _g1890;
      let _g2265 = -1;
      let _g2673 = -1;
      _g2062.length = 0;
      G2063: {
        const _a2260 = v_F;
        for (let _i2261 = 0; _i2261 < _a2260.length; _i2261++) {
          const v_e = _a2260[_i2261];
          if (_g2265 !== _epoch) {
            _g2265 = _epoch;
            for (const _e2266 of _l2263) _p2262[_e2266] = 0;
            _y2264 = false;
            const _a2267 = sp.cellEdges[v_c];
            for (const _e2271 of _l2269) _f2268[_e2271] = -1;
            _l2269 = _a2267;
            let _i2273 = 0;
            _s2270[0] = 0;
            let _o2277 = _a2267.length === 0;
            for (;;) {
              if (_a2267.length === 0) {
                if (!_o2277) break;
                _o2277 = false;
              }
              while (_a2267.length > 0 && _i2273 >= 0) {
                const _e2271 = _a2267[_i2273];
                if (_s2270[_i2273] > 0) _f2268[_e2271] = -1;
                let _r2276 = (cands[_e2271] >= 0 ? cands[_e2271] : (cands[_e2271] = b.cands[_e2271])) & ~((2 << _s2270[_i2273]) - 1);
                let _d2272 = 0;
                V2275: for (; _r2276 !== 0; _r2276 &= _r2276 - 1) {
                  _d2272 = 31 - Math.clz32(_r2276 & -_r2276);
                  _f2268[_e2271] = _d2272;
                  for (let _j2274 = 0; _j2274 < _i2273; _j2274++) {
                    const _y2278 = _a2267[_j2274];
                    if (!(((((_k1848[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f2268[_e2271] === 1)) && (_f2268[_y2278] === 1)))) continue;
                    if (!((bent(sp, _e2271, _y2278) === (clueAt(cl.piece, v_c) === 3)))) continue V2275;
                  }
                  for (let _j2274 = 0; _j2274 < _i2273; _j2274++) {
                    const _y2279 = _a2267[_j2274];
                    if (!(((((_f2268[_e2271] === 1) && (_f2268[_y2279] === 1)) && !((b.grid[_e2271] !== 0))) && !((b.grid[_y2279] !== 0))))) continue;
                    if (!(!(_eg1889.of((sp.edgeEnds[2 * _y2279] === v_c ? sp.edgeEnds[2 * _y2279 + 1] : sp.edgeEnds[2 * _y2279])) === _eg1889.of((sp.edgeEnds[2 * _e2271] === v_c ? sp.edgeEnds[2 * _e2271 + 1] : sp.edgeEnds[2 * _e2271]))))) continue V2275;
                  }
                  break;
                }
                if (_r2276 === 0) {
                  _s2270[_i2273] = 0;
                  _i2273--;
                  continue;
                }
                _s2270[_i2273] = _d2272;
                if (_i2273 === _a2267.length - 1) break;
                _i2273++;
                _s2270[_i2273] = 0;
              }
              if (_i2273 < 0) break;
              let _g2280 = 0;
              G2281: {
                const _a2282 = sp.cellEdges[v_c];
                for (let _i2283 = 0; _i2283 < _a2282.length; _i2283++) {
                  const v_x = _a2282[_i2283];
                  if (!((_f2268[v_x] === 1))) continue;
                  _g2280++;
                }
              }
              let _c2288: boolean = (_g2280 === (_k1848[v_c] ?? arms(sp, cl, v_c)));
              if (_c2288) {
                let _q2284 = true;
                Q2285: {
                  const _a2286 = sp.cellEdges[v_c];
                  for (let _i2287 = 0; _i2287 < _a2286.length; _i2287++) {
                    const v_x = _a2286[_i2287];
                    if (!(((_f2268[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1889.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2284 = false;
                      break Q2285;
                    }
                  }
                }
                _c2288 = _q2284;
              }
              let _c2469: boolean = _c2288;
              if (_c2469) {
                let _q2289 = false;
                Q2290: {
                  const _a2291 = sp.cellEdges[v_c];
                  for (let _i2292 = 0; _i2292 < _a2291.length; _i2292++) {
                    const v_x = _a2291[_i2292];
                    if (!((_f2268[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2289 = true;
                      break Q2290;
                    }
                  }
                }
                let _c2468: boolean = _q2289;
                if (!_c2468) {
                  _g2293.length = 0;
                  _st2376.pass++;
                  G2294: {
                    const _a2377 = sp.cellEdges[v_c];
                    for (let _i2378 = 0; _i2378 < _a2377.length; _i2378++) {
                      const v_x = _a2377[_i2378];
                      if (!((_f2268[v_x] === 1))) continue;
                      const _t2379 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h2441 = minus(_h2035, sp.cellEdges[_t2379]);
                      const _eg2443 = edgeGroups(sp, _h2441);
                      const _memo2446 = new Map<readonly number[], readonly number[]>();
                      _g2380.length = 0;
                      _st2419.pass++;
                      G2381: {
                        const _a2420 = sp.cellEdges[_t2379];
                        for (let _i2421 = 0; _i2421 < _a2420.length; _i2421++) {
                          const v_y = _a2420[_i2421];
                          let _c2440: boolean = (v_y !== v_x);
                          if (_c2440) {
                            let _q2422 = false;
                            Q2423: {
                              const _a2424 = sp.cellEdges[_t2379];
                              for (const _e2428 of _l2426) _f2425[_e2428] = -1;
                              _l2426 = _a2424;
                              let _i2430 = 0;
                              _s2427[0] = 0;
                              let _o2434 = _a2424.length === 0;
                              for (;;) {
                                if (_a2424.length === 0) {
                                  if (!_o2434) break;
                                  _o2434 = false;
                                }
                                while (_a2424.length > 0 && _i2430 >= 0) {
                                  const _e2428 = _a2424[_i2430];
                                  if (_s2427[_i2430] > 0) _f2425[_e2428] = -1;
                                  let _r2433 = (cands[_e2428] >= 0 ? cands[_e2428] : (cands[_e2428] = b.cands[_e2428])) & ~((2 << _s2427[_i2430]) - 1);
                                  let _d2429 = 0;
                                  V2432: for (; _r2433 !== 0; _r2433 &= _r2433 - 1) {
                                    _d2429 = 31 - Math.clz32(_r2433 & -_r2433);
                                    _f2425[_e2428] = _d2429;
                                    if (_e2428 === v_x && _d2429 !== 1) continue;
                                    if (_e2428 === v_y && _d2429 !== 1) continue;
                                    for (let _j2431 = 0; _j2431 < _i2430; _j2431++) {
                                      const _y2435 = _a2424[_j2431];
                                      if (!(((((_k1848[_t2379] ?? arms(sp, cl, _t2379)) === 2) && (_f2425[_e2428] === 1)) && (_f2425[_y2435] === 1)))) continue;
                                      if (!((bent(sp, _e2428, _y2435) === (clueAt(cl.piece, _t2379) === 3)))) continue V2432;
                                    }
                                    break;
                                  }
                                  if (_r2433 === 0) {
                                    _s2427[_i2430] = 0;
                                    _i2430--;
                                    continue;
                                  }
                                  _s2427[_i2430] = _d2429;
                                  if (_i2430 === _a2424.length - 1) break;
                                  _i2430++;
                                  _s2427[_i2430] = 0;
                                }
                                if (_i2430 < 0) break;
                                let _g2436 = 0;
                                G2437: {
                                  const _a2438 = sp.cellEdges[_t2379];
                                  for (let _i2439 = 0; _i2439 < _a2438.length; _i2439++) {
                                    const v_z = _a2438[_i2439];
                                    if (!((_f2425[v_z] === 1))) continue;
                                    _g2436++;
                                  }
                                }
                                if (!((_g2436 === (_k1848[_t2379] ?? arms(sp, cl, _t2379))))) continue;
                                if (true) {
                                  _q2422 = true;
                                  break Q2423;
                                }
                              }
                            }
                            _c2440 = _q2422;
                          }
                          if (!(_c2440)) continue;
                          const _t2442 = (sp.edgeEnds[2 * v_y] === _t2379 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2445 = _eg2443.of(_t2442);
                          let _gs2447 = _memo2446.get(_t2445);
                          if (_gs2447 === undefined) {
                            _g2448.length = 0;
                            _st2455.pass++;
                            G2449: {
                              const _a2456 = _t2445;
                              for (let _i2457 = 0; _i2457 < _a2456.length; _i2457++) {
                                const v_t = _a2456[_i2457];
                                if (!(((_k1848[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a2458 = sp.cellEdges[v_t];
                                for (let _i2459 = 0; _i2459 < _a2458.length; _i2459++) {
                                  const v_y = _a2458[_i2459];
                                  L2460: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1848[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2056[v_y + 1] === 1)))) break L2460;
                                    const _t2461 = v_z;
                                    if (_g2448.length < 16) { if (!_g2448.includes(_t2461)) _g2448.push(_t2461); } else addOnce(_g2448, _st2455, _t2461);
                                  }
                                }
                              }
                            }
                            _gs2447 = _g2448.slice();
                            _memo2446.set(_t2445, _gs2447);
                          }
                          const _a2462 = union(_eg2443.of(_t2442), _gs2447);
                          for (let _i2463 = 0; _i2463 < _a2462.length; _i2463++) {
                            const v_t = _a2462[_i2463];
                            const _t2464 = v_t;
                            if (_g2380.length < 16) { if (!_g2380.includes(_t2464)) _g2380.push(_t2464); } else addOnce(_g2380, _st2419, _t2464);
                          }
                        }
                      }
                      const _a2465 = union(setOf(_t2379), _g2380);
                      for (let _i2466 = 0; _i2466 < _a2465.length; _i2466++) {
                        const v_t = _a2465[_i2466];
                        const _t2467 = v_t;
                        if (_g2293.length < 16) { if (!_g2293.includes(_t2467)) _g2293.push(_t2467); } else addOnce(_g2293, _st2376, _t2467);
                      }
                    }
                  }
                  _c2468 = (union(setOf(v_c), _g2293).length >= _h2061);
                }
                _c2469 = _c2468;
              }
              if (!(_c2469)) continue;
              if (!(true)) continue;
              _l2263 = _a2267;
              _y2264 = true;
              for (const _e2266 of _a2267) _p2262[_e2266] |= 1 << _f2268[_e2266];
            }
          }
          if (!(((((_p2262[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y2264 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2062.push(v_e);
        }
      }
      const v_W = _g2062;
      _g2470.length = 0;
      G2471: {
        const _a2668 = v_F;
        for (let _i2669 = 0; _i2669 < _a2668.length; _i2669++) {
          const v_e = _a2668[_i2669];
          if (_g2673 !== _epoch) {
            _g2673 = _epoch;
            for (const _e2674 of _l2671) _p2670[_e2674] = 0;
            _y2672 = false;
            const _a2675 = sp.cellEdges[v_c];
            for (const _e2679 of _l2677) _f2676[_e2679] = -1;
            _l2677 = _a2675;
            let _i2681 = 0;
            _s2678[0] = 0;
            let _o2685 = _a2675.length === 0;
            for (;;) {
              if (_a2675.length === 0) {
                if (!_o2685) break;
                _o2685 = false;
              }
              while (_a2675.length > 0 && _i2681 >= 0) {
                const _e2679 = _a2675[_i2681];
                if (_s2678[_i2681] > 0) _f2676[_e2679] = -1;
                let _r2684 = (cands[_e2679] >= 0 ? cands[_e2679] : (cands[_e2679] = b.cands[_e2679])) & ~((2 << _s2678[_i2681]) - 1);
                let _d2680 = 0;
                V2683: for (; _r2684 !== 0; _r2684 &= _r2684 - 1) {
                  _d2680 = 31 - Math.clz32(_r2684 & -_r2684);
                  _f2676[_e2679] = _d2680;
                  for (let _j2682 = 0; _j2682 < _i2681; _j2682++) {
                    const _y2686 = _a2675[_j2682];
                    if (!(((((_k1848[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f2676[_e2679] === 1)) && (_f2676[_y2686] === 1)))) continue;
                    if (!((bent(sp, _e2679, _y2686) === (clueAt(cl.piece, v_c) === 3)))) continue V2683;
                  }
                  for (let _j2682 = 0; _j2682 < _i2681; _j2682++) {
                    const _y2687 = _a2675[_j2682];
                    if (!(((((_f2676[_e2679] === 1) && (_f2676[_y2687] === 1)) && !((b.grid[_e2679] !== 0))) && !((b.grid[_y2687] !== 0))))) continue;
                    if (!(!(_eg1889.of((sp.edgeEnds[2 * _y2687] === v_c ? sp.edgeEnds[2 * _y2687 + 1] : sp.edgeEnds[2 * _y2687])) === _eg1889.of((sp.edgeEnds[2 * _e2679] === v_c ? sp.edgeEnds[2 * _e2679 + 1] : sp.edgeEnds[2 * _e2679]))))) continue V2683;
                  }
                  break;
                }
                if (_r2684 === 0) {
                  _s2678[_i2681] = 0;
                  _i2681--;
                  continue;
                }
                _s2678[_i2681] = _d2680;
                if (_i2681 === _a2675.length - 1) break;
                _i2681++;
                _s2678[_i2681] = 0;
              }
              if (_i2681 < 0) break;
              let _g2688 = 0;
              G2689: {
                const _a2690 = sp.cellEdges[v_c];
                for (let _i2691 = 0; _i2691 < _a2690.length; _i2691++) {
                  const v_x = _a2690[_i2691];
                  if (!((_f2676[v_x] === 1))) continue;
                  _g2688++;
                }
              }
              let _c2696: boolean = (_g2688 === (_k1848[v_c] ?? arms(sp, cl, v_c)));
              if (_c2696) {
                let _q2692 = true;
                Q2693: {
                  const _a2694 = sp.cellEdges[v_c];
                  for (let _i2695 = 0; _i2695 < _a2694.length; _i2695++) {
                    const v_x = _a2694[_i2695];
                    if (!(((_f2676[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1889.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2692 = false;
                      break Q2693;
                    }
                  }
                }
                _c2696 = _q2692;
              }
              let _c2877: boolean = _c2696;
              if (_c2877) {
                let _q2697 = false;
                Q2698: {
                  const _a2699 = sp.cellEdges[v_c];
                  for (let _i2700 = 0; _i2700 < _a2699.length; _i2700++) {
                    const v_x = _a2699[_i2700];
                    if (!((_f2676[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2697 = true;
                      break Q2698;
                    }
                  }
                }
                let _c2876: boolean = _q2697;
                if (!_c2876) {
                  _g2701.length = 0;
                  _st2784.pass++;
                  G2702: {
                    const _a2785 = sp.cellEdges[v_c];
                    for (let _i2786 = 0; _i2786 < _a2785.length; _i2786++) {
                      const v_x = _a2785[_i2786];
                      if (!((_f2676[v_x] === 1))) continue;
                      const _t2787 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h2849 = minus(_h2035, sp.cellEdges[_t2787]);
                      const _eg2851 = edgeGroups(sp, _h2849);
                      const _memo2854 = new Map<readonly number[], readonly number[]>();
                      _g2788.length = 0;
                      _st2827.pass++;
                      G2789: {
                        const _a2828 = sp.cellEdges[_t2787];
                        for (let _i2829 = 0; _i2829 < _a2828.length; _i2829++) {
                          const v_y = _a2828[_i2829];
                          let _c2848: boolean = (v_y !== v_x);
                          if (_c2848) {
                            let _q2830 = false;
                            Q2831: {
                              const _a2832 = sp.cellEdges[_t2787];
                              for (const _e2836 of _l2834) _f2833[_e2836] = -1;
                              _l2834 = _a2832;
                              let _i2838 = 0;
                              _s2835[0] = 0;
                              let _o2842 = _a2832.length === 0;
                              for (;;) {
                                if (_a2832.length === 0) {
                                  if (!_o2842) break;
                                  _o2842 = false;
                                }
                                while (_a2832.length > 0 && _i2838 >= 0) {
                                  const _e2836 = _a2832[_i2838];
                                  if (_s2835[_i2838] > 0) _f2833[_e2836] = -1;
                                  let _r2841 = (cands[_e2836] >= 0 ? cands[_e2836] : (cands[_e2836] = b.cands[_e2836])) & ~((2 << _s2835[_i2838]) - 1);
                                  let _d2837 = 0;
                                  V2840: for (; _r2841 !== 0; _r2841 &= _r2841 - 1) {
                                    _d2837 = 31 - Math.clz32(_r2841 & -_r2841);
                                    _f2833[_e2836] = _d2837;
                                    if (_e2836 === v_x && _d2837 !== 1) continue;
                                    if (_e2836 === v_y && _d2837 !== 1) continue;
                                    for (let _j2839 = 0; _j2839 < _i2838; _j2839++) {
                                      const _y2843 = _a2832[_j2839];
                                      if (!(((((_k1848[_t2787] ?? arms(sp, cl, _t2787)) === 2) && (_f2833[_e2836] === 1)) && (_f2833[_y2843] === 1)))) continue;
                                      if (!((bent(sp, _e2836, _y2843) === (clueAt(cl.piece, _t2787) === 3)))) continue V2840;
                                    }
                                    break;
                                  }
                                  if (_r2841 === 0) {
                                    _s2835[_i2838] = 0;
                                    _i2838--;
                                    continue;
                                  }
                                  _s2835[_i2838] = _d2837;
                                  if (_i2838 === _a2832.length - 1) break;
                                  _i2838++;
                                  _s2835[_i2838] = 0;
                                }
                                if (_i2838 < 0) break;
                                let _g2844 = 0;
                                G2845: {
                                  const _a2846 = sp.cellEdges[_t2787];
                                  for (let _i2847 = 0; _i2847 < _a2846.length; _i2847++) {
                                    const v_z = _a2846[_i2847];
                                    if (!((_f2833[v_z] === 1))) continue;
                                    _g2844++;
                                  }
                                }
                                if (!((_g2844 === (_k1848[_t2787] ?? arms(sp, cl, _t2787))))) continue;
                                if (true) {
                                  _q2830 = true;
                                  break Q2831;
                                }
                              }
                            }
                            _c2848 = _q2830;
                          }
                          if (!(_c2848)) continue;
                          const _t2850 = (sp.edgeEnds[2 * v_y] === _t2787 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2853 = _eg2851.of(_t2850);
                          let _gs2855 = _memo2854.get(_t2853);
                          if (_gs2855 === undefined) {
                            _g2856.length = 0;
                            _st2863.pass++;
                            G2857: {
                              const _a2864 = _t2853;
                              for (let _i2865 = 0; _i2865 < _a2864.length; _i2865++) {
                                const v_t = _a2864[_i2865];
                                if (!(((_k1848[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a2866 = sp.cellEdges[v_t];
                                for (let _i2867 = 0; _i2867 < _a2866.length; _i2867++) {
                                  const v_y = _a2866[_i2867];
                                  L2868: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1848[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2056[v_y + 1] === 1)))) break L2868;
                                    const _t2869 = v_z;
                                    if (_g2856.length < 16) { if (!_g2856.includes(_t2869)) _g2856.push(_t2869); } else addOnce(_g2856, _st2863, _t2869);
                                  }
                                }
                              }
                            }
                            _gs2855 = _g2856.slice();
                            _memo2854.set(_t2853, _gs2855);
                          }
                          const _a2870 = union(_eg2851.of(_t2850), _gs2855);
                          for (let _i2871 = 0; _i2871 < _a2870.length; _i2871++) {
                            const v_t = _a2870[_i2871];
                            const _t2872 = v_t;
                            if (_g2788.length < 16) { if (!_g2788.includes(_t2872)) _g2788.push(_t2872); } else addOnce(_g2788, _st2827, _t2872);
                          }
                        }
                      }
                      const _a2873 = union(setOf(_t2787), _g2788);
                      for (let _i2874 = 0; _i2874 < _a2873.length; _i2874++) {
                        const v_t = _a2873[_i2874];
                        const _t2875 = v_t;
                        if (_g2701.length < 16) { if (!_g2701.includes(_t2875)) _g2701.push(_t2875); } else addOnce(_g2701, _st2784, _t2875);
                      }
                    }
                  }
                  _c2876 = (union(setOf(v_c), _g2701).length >= _h2061);
                }
                _c2877 = _c2876;
              }
              if (!(_c2877)) continue;
              if (!(true)) continue;
              _l2671 = _a2675;
              _y2672 = true;
              for (const _e2674 of _a2675) _p2670[_e2674] |= 1 << _f2676[_e2674];
            }
          }
          if (!(((((_p2670[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y2672 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2470.push(v_e);
        }
      }
      L2878: {
        const v_N = _g2470;
        let _q2879 = true;
        Q2880: {
          const _a2881 = v_F;
          for (let _i2882 = 0; _i2882 < _a2881.length; _i2882++) {
            const v_e = _a2881[_i2882];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q2879 = false;
              break Q2880;
            }
          }
        }
        if (!(_q2879)) break L2878;
        facts.length = 0;
        changed = false;
        let _q2883 = true;
        Q2884: {
          const _a2885 = v_F;
          for (let _i2886 = 0; _i2886 < _a2885.length; _i2886++) {
            const v_e = _a2885[_i2886];
            let _c2888: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c2888) {
              let _c2887: boolean = !(!(v_W.includes(v_e)));
              if (!_c2887) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c2887 = true;
              }
              _c2888 = _c2887;
            }
            let _c2890: boolean = _c2888;
            if (_c2890) {
              let _c2889: boolean = !(!(v_N.includes(v_e)));
              if (!_c2889) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c2889 = true;
              }
              _c2890 = _c2889;
            }
            if (!(_c2890)) {
              _q2883 = false;
              break Q2884;
            }
          }
        }
        if (!(_q2883)) return -1;
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
let _f3599 = new Int32Array(0);
let _l3600: readonly number[] = [];
let _f3619 = new Int32Array(0);
let _l3620: readonly number[] = [];
const _st3771 = stamps();
let _f3777 = new Int32Array(0);
let _l3778: readonly number[] = [];
const _st3808 = stamps();
let _p3822 = new Int32Array(0);
let _l3823: readonly number[] = [];
let _f3828 = new Int32Array(0);
let _l3829: readonly number[] = [];
const _st3936 = stamps();
const _st3979 = stamps();
let _f3985 = new Int32Array(0);
let _l3986: readonly number[] = [];
const _st4015 = stamps();
let _p4030 = new Int32Array(0);
let _l4031: readonly number[] = [];
let _f4036 = new Int32Array(0);
let _l4037: readonly number[] = [];
const _st4144 = stamps();
const _st4187 = stamps();
let _f4193 = new Int32Array(0);
let _l4194: readonly number[] = [];
const _st4223 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealNoteBinding> | null): number {
  const _g3544: number[] = [];
  const _g3550: number[] = [];
  if (_f3599.length < sp.edges.length) _f3599 = new Int32Array(sp.edges.length).fill(-1);
  else _f3599.fill(-1);
  _l3600 = [];
  const _s3601: number[] = [];
  if (_f3619.length < sp.edges.length) _f3619 = new Int32Array(sp.edges.length).fill(-1);
  else _f3619.fill(-1);
  _l3620 = [];
  const _s3621: number[] = [];
  const _g3635: number[] = [];
  const _g3648: number[] = [];
  const _g3732: number[] = [];
  if (_f3777.length < sp.edges.length) _f3777 = new Int32Array(sp.edges.length).fill(-1);
  else _f3777.fill(-1);
  _l3778 = [];
  const _s3779: number[] = [];
  const _g3801: number[] = [];
  if (_p3822.length < sp.edges.length) _p3822 = new Int32Array(sp.edges.length);
  else _p3822.fill(0);
  _l3823 = [];
  let _y3824 = false;
  if (_f3828.length < sp.edges.length) _f3828 = new Int32Array(sp.edges.length).fill(-1);
  else _f3828.fill(-1);
  _l3829 = [];
  const _s3830: number[] = [];
  const _g3853: number[] = [];
  const _g3940: number[] = [];
  if (_f3985.length < sp.edges.length) _f3985 = new Int32Array(sp.edges.length).fill(-1);
  else _f3985.fill(-1);
  _l3986 = [];
  const _s3987: number[] = [];
  const _g4008: number[] = [];
  if (_p4030.length < sp.edges.length) _p4030 = new Int32Array(sp.edges.length);
  else _p4030.fill(0);
  _l4031 = [];
  let _y4032 = false;
  if (_f4036.length < sp.edges.length) _f4036 = new Int32Array(sp.edges.length).fill(-1);
  else _f4036.fill(-1);
  _l4037 = [];
  const _s4038: number[] = [];
  const _g4061: number[] = [];
  const _g4148: number[] = [];
  if (_f4193.length < sp.edges.length) _f4193 = new Int32Array(sp.edges.length).fill(-1);
  else _f4193.fill(-1);
  _l4194 = [];
  const _s4195: number[] = [];
  const _g4216: number[] = [];
  const facts = sealNoteFacts;
  let fired = 0;
  let changed = false;
  const _k3610 = armsKept.board(cl);
  const _h3819 = sp.cells.length;
  let _epoch = 0;
  if (sealNoteCands.length < sp.edges.length) sealNoteCands = new Int32Array(sp.edges.length);
  const cands = sealNoteCands;
  cands.fill(-1);
  _g3544.length = 0;
  G3545: {
    const _a3548 = sp.edges;
    for (let _i3549 = 0; _i3549 < _a3548.length; _i3549++) {
      const v_e = _a3548[_i3549];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g3544.push(v_e);
    }
  }
  const v_L = _g3544;
  const _eg3647 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g3550.length = 0;
  G3551: {
    const _a3593 = sp.edges;
    for (let _i3594 = 0; _i3594 < _a3593.length; _i3594++) {
      const v_e = _a3593[_i3594];
      const _t3595 = sp.edgeEnds[2 * v_e];
      let _q3596 = false;
      Q3597: {
        const _a3598 = sp.cellEdges[_t3595];
        for (const _e3602 of _l3600) _f3599[_e3602] = -1;
        _l3600 = _a3598;
        let _i3604 = 0;
        _s3601[0] = 0;
        let _o3608 = _a3598.length === 0;
        for (;;) {
          if (_a3598.length === 0) {
            if (!_o3608) break;
            _o3608 = false;
          }
          while (_a3598.length > 0 && _i3604 >= 0) {
            const _e3602 = _a3598[_i3604];
            if (_s3601[_i3604] > 0) _f3599[_e3602] = -1;
            let _r3607 = (cands[_e3602] >= 0 ? cands[_e3602] : (cands[_e3602] = b.cands[_e3602])) & ~((2 << _s3601[_i3604]) - 1);
            let _d3603 = 0;
            V3606: for (; _r3607 !== 0; _r3607 &= _r3607 - 1) {
              _d3603 = 31 - Math.clz32(_r3607 & -_r3607);
              _f3599[_e3602] = _d3603;
              if (_e3602 === v_e && _d3603 !== 1) continue;
              for (let _j3605 = 0; _j3605 < _i3604; _j3605++) {
                const _y3609 = _a3598[_j3605];
                if (!(((((_k3610[_t3595] ?? arms(sp, cl, _t3595)) === 2) && (_f3599[_e3602] === 1)) && (_f3599[_y3609] === 1)))) continue;
                if (!((bent(sp, _e3602, _y3609) === (clueAt(cl.piece, _t3595) === 3)))) continue V3606;
              }
              break;
            }
            if (_r3607 === 0) {
              _s3601[_i3604] = 0;
              _i3604--;
              continue;
            }
            _s3601[_i3604] = _d3603;
            if (_i3604 === _a3598.length - 1) break;
            _i3604++;
            _s3601[_i3604] = 0;
          }
          if (_i3604 < 0) break;
          let _g3611 = 0;
          G3612: {
            const _a3613 = sp.cellEdges[_t3595];
            for (let _i3614 = 0; _i3614 < _a3613.length; _i3614++) {
              const v_x = _a3613[_i3614];
              if (!((_f3599[v_x] === 1))) continue;
              _g3611++;
            }
          }
          if (!((_g3611 === (_k3610[_t3595] ?? arms(sp, cl, _t3595))))) continue;
          if (true) {
            _q3596 = true;
            break Q3597;
          }
        }
      }
      let _c3634: boolean = _q3596;
      if (_c3634) {
        const _t3615 = sp.edgeEnds[2 * v_e + 1];
        let _q3616 = false;
        Q3617: {
          const _a3618 = sp.cellEdges[_t3615];
          for (const _e3622 of _l3620) _f3619[_e3622] = -1;
          _l3620 = _a3618;
          let _i3624 = 0;
          _s3621[0] = 0;
          let _o3628 = _a3618.length === 0;
          for (;;) {
            if (_a3618.length === 0) {
              if (!_o3628) break;
              _o3628 = false;
            }
            while (_a3618.length > 0 && _i3624 >= 0) {
              const _e3622 = _a3618[_i3624];
              if (_s3621[_i3624] > 0) _f3619[_e3622] = -1;
              let _r3627 = (cands[_e3622] >= 0 ? cands[_e3622] : (cands[_e3622] = b.cands[_e3622])) & ~((2 << _s3621[_i3624]) - 1);
              let _d3623 = 0;
              V3626: for (; _r3627 !== 0; _r3627 &= _r3627 - 1) {
                _d3623 = 31 - Math.clz32(_r3627 & -_r3627);
                _f3619[_e3622] = _d3623;
                if (_e3622 === v_e && _d3623 !== 1) continue;
                for (let _j3625 = 0; _j3625 < _i3624; _j3625++) {
                  const _y3629 = _a3618[_j3625];
                  if (!(((((_k3610[_t3615] ?? arms(sp, cl, _t3615)) === 2) && (_f3619[_e3622] === 1)) && (_f3619[_y3629] === 1)))) continue;
                  if (!((bent(sp, _e3622, _y3629) === (clueAt(cl.piece, _t3615) === 3)))) continue V3626;
                }
                break;
              }
              if (_r3627 === 0) {
                _s3621[_i3624] = 0;
                _i3624--;
                continue;
              }
              _s3621[_i3624] = _d3623;
              if (_i3624 === _a3618.length - 1) break;
              _i3624++;
              _s3621[_i3624] = 0;
            }
            if (_i3624 < 0) break;
            let _g3630 = 0;
            G3631: {
              const _a3632 = sp.cellEdges[_t3615];
              for (let _i3633 = 0; _i3633 < _a3632.length; _i3633++) {
                const v_x = _a3632[_i3633];
                if (!((_f3619[v_x] === 1))) continue;
                _g3630++;
              }
            }
            if (!((_g3630 === (_k3610[_t3615] ?? arms(sp, cl, _t3615))))) continue;
            if (true) {
              _q3616 = true;
              break Q3617;
            }
          }
        }
        _c3634 = _q3616;
      }
      if (!(_c3634)) continue;
      _g3550.push(v_e);
    }
  }
  const v_U = _g3550;
  const _mm3814 = memberMarks(v_U);
  _g3635.length = 0;
  G3636: {
    const _a3639 = v_U;
    for (let _i3640 = 0; _i3640 < _a3639.length; _i3640++) {
      const v_e = _a3639[_i3640];
      if (!((((_k3610[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k3610[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g3635.push(v_e);
    }
  }
  const v_P = _g3635;
  const _a3641 = sp.cells;
  for (let _i3642 = 0; _i3642 < _a3641.length; _i3642++) {
    const v_c = _a3641[_i3642];
    const _h3793 = minus(v_P, sp.cellEdges[v_c]);
    let _q3643 = false;
    Q3644: {
      const _a3645 = sp.cellEdges[v_c];
      for (let _i3646 = 0; _i3646 < _a3645.length; _i3646++) {
        const v_e = _a3645[_i3646];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q3643 = true;
          break Q3644;
        }
      }
    }
    if (!(_q3643)) continue;
    const v_G = _eg3647.of(v_c);
    _g3648.length = 0;
    G3649: {
      const _a3729 = sp.cellEdges[v_c];
      for (let _i3730 = 0; _i3730 < _a3729.length; _i3730++) {
        const v_x = _a3729[_i3730];
        const _t3731 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h3794 = minus(_h3793, sp.cellEdges[_t3731]);
        const _eg3796 = edgeGroups(sp, _h3794);
        const _memo3799 = new Map<readonly number[], readonly number[]>();
        _g3732.length = 0;
        _st3771.pass++;
        G3733: {
          const _a3772 = sp.cellEdges[_t3731];
          for (let _i3773 = 0; _i3773 < _a3772.length; _i3773++) {
            const v_y = _a3772[_i3773];
            let _c3792: boolean = (v_y !== v_x);
            if (_c3792) {
              let _q3774 = false;
              Q3775: {
                const _a3776 = sp.cellEdges[_t3731];
                for (const _e3780 of _l3778) _f3777[_e3780] = -1;
                _l3778 = _a3776;
                let _i3782 = 0;
                _s3779[0] = 0;
                let _o3786 = _a3776.length === 0;
                for (;;) {
                  if (_a3776.length === 0) {
                    if (!_o3786) break;
                    _o3786 = false;
                  }
                  while (_a3776.length > 0 && _i3782 >= 0) {
                    const _e3780 = _a3776[_i3782];
                    if (_s3779[_i3782] > 0) _f3777[_e3780] = -1;
                    let _r3785 = (cands[_e3780] >= 0 ? cands[_e3780] : (cands[_e3780] = b.cands[_e3780])) & ~((2 << _s3779[_i3782]) - 1);
                    let _d3781 = 0;
                    V3784: for (; _r3785 !== 0; _r3785 &= _r3785 - 1) {
                      _d3781 = 31 - Math.clz32(_r3785 & -_r3785);
                      _f3777[_e3780] = _d3781;
                      if (_e3780 === v_x && _d3781 !== 1) continue;
                      if (_e3780 === v_y && _d3781 !== 1) continue;
                      for (let _j3783 = 0; _j3783 < _i3782; _j3783++) {
                        const _y3787 = _a3776[_j3783];
                        if (!(((((_k3610[_t3731] ?? arms(sp, cl, _t3731)) === 2) && (_f3777[_e3780] === 1)) && (_f3777[_y3787] === 1)))) continue;
                        if (!((bent(sp, _e3780, _y3787) === (clueAt(cl.piece, _t3731) === 3)))) continue V3784;
                      }
                      break;
                    }
                    if (_r3785 === 0) {
                      _s3779[_i3782] = 0;
                      _i3782--;
                      continue;
                    }
                    _s3779[_i3782] = _d3781;
                    if (_i3782 === _a3776.length - 1) break;
                    _i3782++;
                    _s3779[_i3782] = 0;
                  }
                  if (_i3782 < 0) break;
                  let _g3788 = 0;
                  G3789: {
                    const _a3790 = sp.cellEdges[_t3731];
                    for (let _i3791 = 0; _i3791 < _a3790.length; _i3791++) {
                      const v_z = _a3790[_i3791];
                      if (!((_f3777[v_z] === 1))) continue;
                      _g3788++;
                    }
                  }
                  if (!((_g3788 === (_k3610[_t3731] ?? arms(sp, cl, _t3731))))) continue;
                  if (true) {
                    _q3774 = true;
                    break Q3775;
                  }
                }
              }
              _c3792 = _q3774;
            }
            if (!(_c3792)) continue;
            const _t3795 = (sp.edgeEnds[2 * v_y] === _t3731 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t3798 = _eg3796.of(_t3795);
            let _gs3800 = _memo3799.get(_t3798);
            if (_gs3800 === undefined) {
              _g3801.length = 0;
              _st3808.pass++;
              G3802: {
                const _a3809 = _t3798;
                for (let _i3810 = 0; _i3810 < _a3809.length; _i3810++) {
                  const v_t = _a3809[_i3810];
                  if (!(((_k3610[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a3811 = sp.cellEdges[v_t];
                  for (let _i3812 = 0; _i3812 < _a3811.length; _i3812++) {
                    const v_y = _a3811[_i3812];
                    L3813: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k3610[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm3814[v_y + 1] === 1)))) break L3813;
                      const _t3815 = v_z;
                      if (_g3801.length < 16) { if (!_g3801.includes(_t3815)) _g3801.push(_t3815); } else addOnce(_g3801, _st3808, _t3815);
                    }
                  }
                }
              }
              _gs3800 = _g3801.slice();
              _memo3799.set(_t3798, _gs3800);
            }
            const _a3816 = union(_eg3796.of(_t3795), _gs3800);
            for (let _i3817 = 0; _i3817 < _a3816.length; _i3817++) {
              const v_t = _a3816[_i3817];
              const _t3818 = v_t;
              if (_g3732.length < 16) { if (!_g3732.includes(_t3818)) _g3732.push(_t3818); } else addOnce(_g3732, _st3771, _t3818);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t3731), _g3732)).length >= _h3819))) continue;
        _g3648.push(v_x);
      }
    }
    const v_K = _g3648;
    let _g3825 = -1;
    let _g4033 = -1;
    const _a3820 = sp.cellEdges[v_c];
    for (let _i3821 = 0; _i3821 < _a3820.length; _i3821++) {
      const v_e = _a3820[_i3821];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g3825 !== _epoch) {
        _g3825 = _epoch;
        for (const _e3826 of _l3823) _p3822[_e3826] = 0;
        _y3824 = false;
        const _a3827 = sp.cellEdges[v_c];
        for (const _e3831 of _l3829) _f3828[_e3831] = -1;
        _l3829 = _a3827;
        let _i3833 = 0;
        _s3830[0] = 0;
        let _o3837 = _a3827.length === 0;
        for (;;) {
          if (_a3827.length === 0) {
            if (!_o3837) break;
            _o3837 = false;
          }
          while (_a3827.length > 0 && _i3833 >= 0) {
            const _e3831 = _a3827[_i3833];
            if (_s3830[_i3833] > 0) _f3828[_e3831] = -1;
            let _r3836 = (cands[_e3831] >= 0 ? cands[_e3831] : (cands[_e3831] = b.cands[_e3831])) & ~((2 << _s3830[_i3833]) - 1);
            let _d3832 = 0;
            V3835: for (; _r3836 !== 0; _r3836 &= _r3836 - 1) {
              _d3832 = 31 - Math.clz32(_r3836 & -_r3836);
              _f3828[_e3831] = _d3832;
              for (let _j3834 = 0; _j3834 < _i3833; _j3834++) {
                const _y3838 = _a3827[_j3834];
                if (!(((((_k3610[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f3828[_e3831] === 1)) && (_f3828[_y3838] === 1)))) continue;
                if (!((bent(sp, _e3831, _y3838) === (clueAt(cl.piece, v_c) === 3)))) continue V3835;
              }
              for (let _j3834 = 0; _j3834 < _i3833; _j3834++) {
                const _y3839 = _a3827[_j3834];
                if (!(((((_f3828[_e3831] === 1) && (_f3828[_y3839] === 1)) && !((b.grid[_e3831] !== 0))) && !((b.grid[_y3839] !== 0))))) continue;
                if (!(!(_eg3647.of((sp.edgeEnds[2 * _y3839] === v_c ? sp.edgeEnds[2 * _y3839 + 1] : sp.edgeEnds[2 * _y3839])) === _eg3647.of((sp.edgeEnds[2 * _e3831] === v_c ? sp.edgeEnds[2 * _e3831 + 1] : sp.edgeEnds[2 * _e3831]))))) continue V3835;
              }
              break;
            }
            if (_r3836 === 0) {
              _s3830[_i3833] = 0;
              _i3833--;
              continue;
            }
            _s3830[_i3833] = _d3832;
            if (_i3833 === _a3827.length - 1) break;
            _i3833++;
            _s3830[_i3833] = 0;
          }
          if (_i3833 < 0) break;
          let _g3840 = 0;
          G3841: {
            const _a3842 = sp.cellEdges[v_c];
            for (let _i3843 = 0; _i3843 < _a3842.length; _i3843++) {
              const v_x = _a3842[_i3843];
              if (!((_f3828[v_x] === 1))) continue;
              _g3840++;
            }
          }
          let _c3848: boolean = (_g3840 === (_k3610[v_c] ?? arms(sp, cl, v_c)));
          if (_c3848) {
            let _q3844 = true;
            Q3845: {
              const _a3846 = sp.cellEdges[v_c];
              for (let _i3847 = 0; _i3847 < _a3846.length; _i3847++) {
                const v_x = _a3846[_i3847];
                if (!(((_f3828[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg3647.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q3844 = false;
                  break Q3845;
                }
              }
            }
            _c3848 = _q3844;
          }
          let _c4029: boolean = _c3848;
          if (_c4029) {
            let _q3849 = false;
            Q3850: {
              const _a3851 = sp.cellEdges[v_c];
              for (let _i3852 = 0; _i3852 < _a3851.length; _i3852++) {
                const v_x = _a3851[_i3852];
                if (!((_f3828[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q3849 = true;
                  break Q3850;
                }
              }
            }
            let _c4028: boolean = _q3849;
            if (!_c4028) {
              _g3853.length = 0;
              _st3936.pass++;
              G3854: {
                const _a3937 = sp.cellEdges[v_c];
                for (let _i3938 = 0; _i3938 < _a3937.length; _i3938++) {
                  const v_x = _a3937[_i3938];
                  if (!((_f3828[v_x] === 1))) continue;
                  const _t3939 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h4001 = minus(_h3793, sp.cellEdges[_t3939]);
                  const _eg4003 = edgeGroups(sp, _h4001);
                  const _memo4006 = new Map<readonly number[], readonly number[]>();
                  _g3940.length = 0;
                  _st3979.pass++;
                  G3941: {
                    const _a3980 = sp.cellEdges[_t3939];
                    for (let _i3981 = 0; _i3981 < _a3980.length; _i3981++) {
                      const v_y = _a3980[_i3981];
                      let _c4000: boolean = (v_y !== v_x);
                      if (_c4000) {
                        let _q3982 = false;
                        Q3983: {
                          const _a3984 = sp.cellEdges[_t3939];
                          for (const _e3988 of _l3986) _f3985[_e3988] = -1;
                          _l3986 = _a3984;
                          let _i3990 = 0;
                          _s3987[0] = 0;
                          let _o3994 = _a3984.length === 0;
                          for (;;) {
                            if (_a3984.length === 0) {
                              if (!_o3994) break;
                              _o3994 = false;
                            }
                            while (_a3984.length > 0 && _i3990 >= 0) {
                              const _e3988 = _a3984[_i3990];
                              if (_s3987[_i3990] > 0) _f3985[_e3988] = -1;
                              let _r3993 = (cands[_e3988] >= 0 ? cands[_e3988] : (cands[_e3988] = b.cands[_e3988])) & ~((2 << _s3987[_i3990]) - 1);
                              let _d3989 = 0;
                              V3992: for (; _r3993 !== 0; _r3993 &= _r3993 - 1) {
                                _d3989 = 31 - Math.clz32(_r3993 & -_r3993);
                                _f3985[_e3988] = _d3989;
                                if (_e3988 === v_x && _d3989 !== 1) continue;
                                if (_e3988 === v_y && _d3989 !== 1) continue;
                                for (let _j3991 = 0; _j3991 < _i3990; _j3991++) {
                                  const _y3995 = _a3984[_j3991];
                                  if (!(((((_k3610[_t3939] ?? arms(sp, cl, _t3939)) === 2) && (_f3985[_e3988] === 1)) && (_f3985[_y3995] === 1)))) continue;
                                  if (!((bent(sp, _e3988, _y3995) === (clueAt(cl.piece, _t3939) === 3)))) continue V3992;
                                }
                                break;
                              }
                              if (_r3993 === 0) {
                                _s3987[_i3990] = 0;
                                _i3990--;
                                continue;
                              }
                              _s3987[_i3990] = _d3989;
                              if (_i3990 === _a3984.length - 1) break;
                              _i3990++;
                              _s3987[_i3990] = 0;
                            }
                            if (_i3990 < 0) break;
                            let _g3996 = 0;
                            G3997: {
                              const _a3998 = sp.cellEdges[_t3939];
                              for (let _i3999 = 0; _i3999 < _a3998.length; _i3999++) {
                                const v_z = _a3998[_i3999];
                                if (!((_f3985[v_z] === 1))) continue;
                                _g3996++;
                              }
                            }
                            if (!((_g3996 === (_k3610[_t3939] ?? arms(sp, cl, _t3939))))) continue;
                            if (true) {
                              _q3982 = true;
                              break Q3983;
                            }
                          }
                        }
                        _c4000 = _q3982;
                      }
                      if (!(_c4000)) continue;
                      const _t4002 = (sp.edgeEnds[2 * v_y] === _t3939 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t4005 = _eg4003.of(_t4002);
                      let _gs4007 = _memo4006.get(_t4005);
                      if (_gs4007 === undefined) {
                        _g4008.length = 0;
                        _st4015.pass++;
                        G4009: {
                          const _a4016 = _t4005;
                          for (let _i4017 = 0; _i4017 < _a4016.length; _i4017++) {
                            const v_t = _a4016[_i4017];
                            if (!(((_k3610[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a4018 = sp.cellEdges[v_t];
                            for (let _i4019 = 0; _i4019 < _a4018.length; _i4019++) {
                              const v_y = _a4018[_i4019];
                              L4020: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k3610[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm3814[v_y + 1] === 1)))) break L4020;
                                const _t4021 = v_z;
                                if (_g4008.length < 16) { if (!_g4008.includes(_t4021)) _g4008.push(_t4021); } else addOnce(_g4008, _st4015, _t4021);
                              }
                            }
                          }
                        }
                        _gs4007 = _g4008.slice();
                        _memo4006.set(_t4005, _gs4007);
                      }
                      const _a4022 = union(_eg4003.of(_t4002), _gs4007);
                      for (let _i4023 = 0; _i4023 < _a4022.length; _i4023++) {
                        const v_t = _a4022[_i4023];
                        const _t4024 = v_t;
                        if (_g3940.length < 16) { if (!_g3940.includes(_t4024)) _g3940.push(_t4024); } else addOnce(_g3940, _st3979, _t4024);
                      }
                    }
                  }
                  const _a4025 = union(setOf(_t3939), _g3940);
                  for (let _i4026 = 0; _i4026 < _a4025.length; _i4026++) {
                    const v_t = _a4025[_i4026];
                    const _t4027 = v_t;
                    if (_g3853.length < 16) { if (!_g3853.includes(_t4027)) _g3853.push(_t4027); } else addOnce(_g3853, _st3936, _t4027);
                  }
                }
              }
              _c4028 = (union(setOf(v_c), _g3853).length >= _h3819);
            }
            _c4029 = _c4028;
          }
          if (!(_c4029)) continue;
          if (!(true)) continue;
          _l3823 = _a3827;
          _y3824 = true;
          for (const _e3826 of _a3827) _p3822[_e3826] |= 1 << _f3828[_e3826];
        }
      }
      const v_A = ((((_p3822[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y3824 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g4033 !== _epoch) {
        _g4033 = _epoch;
        for (const _e4034 of _l4031) _p4030[_e4034] = 0;
        _y4032 = false;
        const _a4035 = sp.cellEdges[v_c];
        for (const _e4039 of _l4037) _f4036[_e4039] = -1;
        _l4037 = _a4035;
        let _i4041 = 0;
        _s4038[0] = 0;
        let _o4045 = _a4035.length === 0;
        for (;;) {
          if (_a4035.length === 0) {
            if (!_o4045) break;
            _o4045 = false;
          }
          while (_a4035.length > 0 && _i4041 >= 0) {
            const _e4039 = _a4035[_i4041];
            if (_s4038[_i4041] > 0) _f4036[_e4039] = -1;
            let _r4044 = (cands[_e4039] >= 0 ? cands[_e4039] : (cands[_e4039] = b.cands[_e4039])) & ~((2 << _s4038[_i4041]) - 1);
            let _d4040 = 0;
            V4043: for (; _r4044 !== 0; _r4044 &= _r4044 - 1) {
              _d4040 = 31 - Math.clz32(_r4044 & -_r4044);
              _f4036[_e4039] = _d4040;
              for (let _j4042 = 0; _j4042 < _i4041; _j4042++) {
                const _y4046 = _a4035[_j4042];
                if (!(((((_k3610[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f4036[_e4039] === 1)) && (_f4036[_y4046] === 1)))) continue;
                if (!((bent(sp, _e4039, _y4046) === (clueAt(cl.piece, v_c) === 3)))) continue V4043;
              }
              for (let _j4042 = 0; _j4042 < _i4041; _j4042++) {
                const _y4047 = _a4035[_j4042];
                if (!(((((_f4036[_e4039] === 1) && (_f4036[_y4047] === 1)) && !((b.grid[_e4039] !== 0))) && !((b.grid[_y4047] !== 0))))) continue;
                if (!(!(_eg3647.of((sp.edgeEnds[2 * _y4047] === v_c ? sp.edgeEnds[2 * _y4047 + 1] : sp.edgeEnds[2 * _y4047])) === _eg3647.of((sp.edgeEnds[2 * _e4039] === v_c ? sp.edgeEnds[2 * _e4039 + 1] : sp.edgeEnds[2 * _e4039]))))) continue V4043;
              }
              break;
            }
            if (_r4044 === 0) {
              _s4038[_i4041] = 0;
              _i4041--;
              continue;
            }
            _s4038[_i4041] = _d4040;
            if (_i4041 === _a4035.length - 1) break;
            _i4041++;
            _s4038[_i4041] = 0;
          }
          if (_i4041 < 0) break;
          let _g4048 = 0;
          G4049: {
            const _a4050 = sp.cellEdges[v_c];
            for (let _i4051 = 0; _i4051 < _a4050.length; _i4051++) {
              const v_x = _a4050[_i4051];
              if (!((_f4036[v_x] === 1))) continue;
              _g4048++;
            }
          }
          let _c4056: boolean = (_g4048 === (_k3610[v_c] ?? arms(sp, cl, v_c)));
          if (_c4056) {
            let _q4052 = true;
            Q4053: {
              const _a4054 = sp.cellEdges[v_c];
              for (let _i4055 = 0; _i4055 < _a4054.length; _i4055++) {
                const v_x = _a4054[_i4055];
                if (!(((_f4036[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg3647.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q4052 = false;
                  break Q4053;
                }
              }
            }
            _c4056 = _q4052;
          }
          let _c4237: boolean = _c4056;
          if (_c4237) {
            let _q4057 = false;
            Q4058: {
              const _a4059 = sp.cellEdges[v_c];
              for (let _i4060 = 0; _i4060 < _a4059.length; _i4060++) {
                const v_x = _a4059[_i4060];
                if (!((_f4036[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q4057 = true;
                  break Q4058;
                }
              }
            }
            let _c4236: boolean = _q4057;
            if (!_c4236) {
              _g4061.length = 0;
              _st4144.pass++;
              G4062: {
                const _a4145 = sp.cellEdges[v_c];
                for (let _i4146 = 0; _i4146 < _a4145.length; _i4146++) {
                  const v_x = _a4145[_i4146];
                  if (!((_f4036[v_x] === 1))) continue;
                  const _t4147 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h4209 = minus(_h3793, sp.cellEdges[_t4147]);
                  const _eg4211 = edgeGroups(sp, _h4209);
                  const _memo4214 = new Map<readonly number[], readonly number[]>();
                  _g4148.length = 0;
                  _st4187.pass++;
                  G4149: {
                    const _a4188 = sp.cellEdges[_t4147];
                    for (let _i4189 = 0; _i4189 < _a4188.length; _i4189++) {
                      const v_y = _a4188[_i4189];
                      let _c4208: boolean = (v_y !== v_x);
                      if (_c4208) {
                        let _q4190 = false;
                        Q4191: {
                          const _a4192 = sp.cellEdges[_t4147];
                          for (const _e4196 of _l4194) _f4193[_e4196] = -1;
                          _l4194 = _a4192;
                          let _i4198 = 0;
                          _s4195[0] = 0;
                          let _o4202 = _a4192.length === 0;
                          for (;;) {
                            if (_a4192.length === 0) {
                              if (!_o4202) break;
                              _o4202 = false;
                            }
                            while (_a4192.length > 0 && _i4198 >= 0) {
                              const _e4196 = _a4192[_i4198];
                              if (_s4195[_i4198] > 0) _f4193[_e4196] = -1;
                              let _r4201 = (cands[_e4196] >= 0 ? cands[_e4196] : (cands[_e4196] = b.cands[_e4196])) & ~((2 << _s4195[_i4198]) - 1);
                              let _d4197 = 0;
                              V4200: for (; _r4201 !== 0; _r4201 &= _r4201 - 1) {
                                _d4197 = 31 - Math.clz32(_r4201 & -_r4201);
                                _f4193[_e4196] = _d4197;
                                if (_e4196 === v_x && _d4197 !== 1) continue;
                                if (_e4196 === v_y && _d4197 !== 1) continue;
                                for (let _j4199 = 0; _j4199 < _i4198; _j4199++) {
                                  const _y4203 = _a4192[_j4199];
                                  if (!(((((_k3610[_t4147] ?? arms(sp, cl, _t4147)) === 2) && (_f4193[_e4196] === 1)) && (_f4193[_y4203] === 1)))) continue;
                                  if (!((bent(sp, _e4196, _y4203) === (clueAt(cl.piece, _t4147) === 3)))) continue V4200;
                                }
                                break;
                              }
                              if (_r4201 === 0) {
                                _s4195[_i4198] = 0;
                                _i4198--;
                                continue;
                              }
                              _s4195[_i4198] = _d4197;
                              if (_i4198 === _a4192.length - 1) break;
                              _i4198++;
                              _s4195[_i4198] = 0;
                            }
                            if (_i4198 < 0) break;
                            let _g4204 = 0;
                            G4205: {
                              const _a4206 = sp.cellEdges[_t4147];
                              for (let _i4207 = 0; _i4207 < _a4206.length; _i4207++) {
                                const v_z = _a4206[_i4207];
                                if (!((_f4193[v_z] === 1))) continue;
                                _g4204++;
                              }
                            }
                            if (!((_g4204 === (_k3610[_t4147] ?? arms(sp, cl, _t4147))))) continue;
                            if (true) {
                              _q4190 = true;
                              break Q4191;
                            }
                          }
                        }
                        _c4208 = _q4190;
                      }
                      if (!(_c4208)) continue;
                      const _t4210 = (sp.edgeEnds[2 * v_y] === _t4147 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t4213 = _eg4211.of(_t4210);
                      let _gs4215 = _memo4214.get(_t4213);
                      if (_gs4215 === undefined) {
                        _g4216.length = 0;
                        _st4223.pass++;
                        G4217: {
                          const _a4224 = _t4213;
                          for (let _i4225 = 0; _i4225 < _a4224.length; _i4225++) {
                            const v_t = _a4224[_i4225];
                            if (!(((_k3610[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a4226 = sp.cellEdges[v_t];
                            for (let _i4227 = 0; _i4227 < _a4226.length; _i4227++) {
                              const v_y = _a4226[_i4227];
                              L4228: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k3610[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm3814[v_y + 1] === 1)))) break L4228;
                                const _t4229 = v_z;
                                if (_g4216.length < 16) { if (!_g4216.includes(_t4229)) _g4216.push(_t4229); } else addOnce(_g4216, _st4223, _t4229);
                              }
                            }
                          }
                        }
                        _gs4215 = _g4216.slice();
                        _memo4214.set(_t4213, _gs4215);
                      }
                      const _a4230 = union(_eg4211.of(_t4210), _gs4215);
                      for (let _i4231 = 0; _i4231 < _a4230.length; _i4231++) {
                        const v_t = _a4230[_i4231];
                        const _t4232 = v_t;
                        if (_g4148.length < 16) { if (!_g4148.includes(_t4232)) _g4148.push(_t4232); } else addOnce(_g4148, _st4187, _t4232);
                      }
                    }
                  }
                  const _a4233 = union(setOf(_t4147), _g4148);
                  for (let _i4234 = 0; _i4234 < _a4233.length; _i4234++) {
                    const v_t = _a4233[_i4234];
                    const _t4235 = v_t;
                    if (_g4061.length < 16) { if (!_g4061.includes(_t4235)) _g4061.push(_t4235); } else addOnce(_g4061, _st4144, _t4235);
                  }
                }
              }
              _c4236 = (union(setOf(v_c), _g4061).length >= _h3819);
            }
            _c4237 = _c4236;
          }
          if (!(_c4237)) continue;
          if (!(true)) continue;
          _l4031 = _a4035;
          _y4032 = true;
          for (const _e4034 of _a4035) _p4030[_e4034] |= 1 << _f4036[_e4034];
        }
      }
      L4238: {
        const v_B = ((((_p4030[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y4032 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L4238;
        facts.length = 0;
        changed = false;
        let _c4240: boolean = (v_A || v_B);
        if (_c4240) {
          let _c4239: boolean = !(!(v_A));
          if (!_c4239) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c4239 = true;
          }
          _c4240 = _c4239;
        }
        let _c4242: boolean = _c4240;
        if (_c4242) {
          let _c4241: boolean = !(!(v_B));
          if (!_c4241) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c4241 = true;
          }
          _c4242 = _c4241;
        }
        if (!(_c4242)) return -1;
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
let _f5540 = new Int32Array(0);
let _l5541: readonly number[] = [];
let _f5560 = new Int32Array(0);
let _l5561: readonly number[] = [];
const _st5716 = stamps();
let _f5722 = new Int32Array(0);
let _l5723: readonly number[] = [];
const _st5753 = stamps();
let _p6011 = new Int32Array(0);
let _l6012: readonly number[] = [];
let _f6017 = new Int32Array(0);
let _l6018: readonly number[] = [];
const _st6125 = stamps();
const _st6168 = stamps();
let _f6174 = new Int32Array(0);
let _l6175: readonly number[] = [];
const _st6204 = stamps();
let _f6238 = new Int32Array(0);
let _l6239: readonly number[] = [];
let _p6512 = new Int32Array(0);
let _l6513: readonly number[] = [];
let _f6518 = new Int32Array(0);
let _l6519: readonly number[] = [];
const _st6626 = stamps();
const _st6669 = stamps();
let _f6675 = new Int32Array(0);
let _l6676: readonly number[] = [];
const _st6705 = stamps();
let _f6739 = new Int32Array(0);
let _l6740: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandLockBinding> | null): number {
  const _g5485: number[] = [];
  const _g5491: number[] = [];
  if (_f5540.length < sp.edges.length) _f5540 = new Int32Array(sp.edges.length).fill(-1);
  else _f5540.fill(-1);
  _l5541 = [];
  const _s5542: number[] = [];
  if (_f5560.length < sp.edges.length) _f5560 = new Int32Array(sp.edges.length).fill(-1);
  else _f5560.fill(-1);
  _l5561 = [];
  const _s5562: number[] = [];
  const _g5576: number[] = [];
  const _g5584: number[] = [];
  const _g5593: number[] = [];
  const _g5677: number[] = [];
  if (_f5722.length < sp.edges.length) _f5722 = new Int32Array(sp.edges.length).fill(-1);
  else _f5722.fill(-1);
  _l5723 = [];
  const _s5724: number[] = [];
  const _g5746: number[] = [];
  const _g5765: number[] = [];
  if (_p6011.length < sp.edges.length) _p6011 = new Int32Array(sp.edges.length);
  else _p6011.fill(0);
  _l6012 = [];
  let _y6013 = false;
  if (_f6017.length < sp.edges.length) _f6017 = new Int32Array(sp.edges.length).fill(-1);
  else _f6017.fill(-1);
  _l6018 = [];
  const _s6019: number[] = [];
  const _g6042: number[] = [];
  const _g6129: number[] = [];
  if (_f6174.length < sp.edges.length) _f6174 = new Int32Array(sp.edges.length).fill(-1);
  else _f6174.fill(-1);
  _l6175 = [];
  const _s6176: number[] = [];
  const _g6197: number[] = [];
  const _g6221: number[] = [];
  if (_f6238.length < sp.edges.length) _f6238 = new Int32Array(sp.edges.length).fill(-1);
  else _f6238.fill(-1);
  _l6239 = [];
  const _s6240: number[] = [];
  const _g6266: number[] = [];
  if (_p6512.length < sp.edges.length) _p6512 = new Int32Array(sp.edges.length);
  else _p6512.fill(0);
  _l6513 = [];
  let _y6514 = false;
  if (_f6518.length < sp.edges.length) _f6518 = new Int32Array(sp.edges.length).fill(-1);
  else _f6518.fill(-1);
  _l6519 = [];
  const _s6520: number[] = [];
  const _g6543: number[] = [];
  const _g6630: number[] = [];
  if (_f6675.length < sp.edges.length) _f6675 = new Int32Array(sp.edges.length).fill(-1);
  else _f6675.fill(-1);
  _l6676 = [];
  const _s6677: number[] = [];
  const _g6698: number[] = [];
  const _g6722: number[] = [];
  if (_f6739.length < sp.edges.length) _f6739 = new Int32Array(sp.edges.length).fill(-1);
  else _f6739.fill(-1);
  _l6740 = [];
  const _s6741: number[] = [];
  const facts = strandLockFacts;
  let fired = 0;
  let changed = false;
  const _k5551 = armsKept.board(cl);
  const _h5764 = sp.cells.length;
  let _epoch = 0;
  if (strandLockCands.length < sp.edges.length) strandLockCands = new Int32Array(sp.edges.length);
  const cands = strandLockCands;
  cands.fill(-1);
  _g5485.length = 0;
  G5486: {
    const _a5489 = sp.edges;
    for (let _i5490 = 0; _i5490 < _a5489.length; _i5490++) {
      const v_e = _a5489[_i5490];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g5485.push(v_e);
    }
  }
  const v_L = _g5485;
  const _eg5592 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g5491.length = 0;
  G5492: {
    const _a5534 = sp.edges;
    for (let _i5535 = 0; _i5535 < _a5534.length; _i5535++) {
      const v_e = _a5534[_i5535];
      const _t5536 = sp.edgeEnds[2 * v_e];
      let _q5537 = false;
      Q5538: {
        const _a5539 = sp.cellEdges[_t5536];
        for (const _e5543 of _l5541) _f5540[_e5543] = -1;
        _l5541 = _a5539;
        let _i5545 = 0;
        _s5542[0] = 0;
        let _o5549 = _a5539.length === 0;
        for (;;) {
          if (_a5539.length === 0) {
            if (!_o5549) break;
            _o5549 = false;
          }
          while (_a5539.length > 0 && _i5545 >= 0) {
            const _e5543 = _a5539[_i5545];
            if (_s5542[_i5545] > 0) _f5540[_e5543] = -1;
            let _r5548 = (cands[_e5543] >= 0 ? cands[_e5543] : (cands[_e5543] = b.cands[_e5543])) & ~((2 << _s5542[_i5545]) - 1);
            let _d5544 = 0;
            V5547: for (; _r5548 !== 0; _r5548 &= _r5548 - 1) {
              _d5544 = 31 - Math.clz32(_r5548 & -_r5548);
              _f5540[_e5543] = _d5544;
              if (_e5543 === v_e && _d5544 !== 1) continue;
              for (let _j5546 = 0; _j5546 < _i5545; _j5546++) {
                const _y5550 = _a5539[_j5546];
                if (!(((((_k5551[_t5536] ?? arms(sp, cl, _t5536)) === 2) && (_f5540[_e5543] === 1)) && (_f5540[_y5550] === 1)))) continue;
                if (!((bent(sp, _e5543, _y5550) === (clueAt(cl.piece, _t5536) === 3)))) continue V5547;
              }
              break;
            }
            if (_r5548 === 0) {
              _s5542[_i5545] = 0;
              _i5545--;
              continue;
            }
            _s5542[_i5545] = _d5544;
            if (_i5545 === _a5539.length - 1) break;
            _i5545++;
            _s5542[_i5545] = 0;
          }
          if (_i5545 < 0) break;
          let _g5552 = 0;
          G5553: {
            const _a5554 = sp.cellEdges[_t5536];
            for (let _i5555 = 0; _i5555 < _a5554.length; _i5555++) {
              const v_x = _a5554[_i5555];
              if (!((_f5540[v_x] === 1))) continue;
              _g5552++;
            }
          }
          if (!((_g5552 === (_k5551[_t5536] ?? arms(sp, cl, _t5536))))) continue;
          if (true) {
            _q5537 = true;
            break Q5538;
          }
        }
      }
      let _c5575: boolean = _q5537;
      if (_c5575) {
        const _t5556 = sp.edgeEnds[2 * v_e + 1];
        let _q5557 = false;
        Q5558: {
          const _a5559 = sp.cellEdges[_t5556];
          for (const _e5563 of _l5561) _f5560[_e5563] = -1;
          _l5561 = _a5559;
          let _i5565 = 0;
          _s5562[0] = 0;
          let _o5569 = _a5559.length === 0;
          for (;;) {
            if (_a5559.length === 0) {
              if (!_o5569) break;
              _o5569 = false;
            }
            while (_a5559.length > 0 && _i5565 >= 0) {
              const _e5563 = _a5559[_i5565];
              if (_s5562[_i5565] > 0) _f5560[_e5563] = -1;
              let _r5568 = (cands[_e5563] >= 0 ? cands[_e5563] : (cands[_e5563] = b.cands[_e5563])) & ~((2 << _s5562[_i5565]) - 1);
              let _d5564 = 0;
              V5567: for (; _r5568 !== 0; _r5568 &= _r5568 - 1) {
                _d5564 = 31 - Math.clz32(_r5568 & -_r5568);
                _f5560[_e5563] = _d5564;
                if (_e5563 === v_e && _d5564 !== 1) continue;
                for (let _j5566 = 0; _j5566 < _i5565; _j5566++) {
                  const _y5570 = _a5559[_j5566];
                  if (!(((((_k5551[_t5556] ?? arms(sp, cl, _t5556)) === 2) && (_f5560[_e5563] === 1)) && (_f5560[_y5570] === 1)))) continue;
                  if (!((bent(sp, _e5563, _y5570) === (clueAt(cl.piece, _t5556) === 3)))) continue V5567;
                }
                break;
              }
              if (_r5568 === 0) {
                _s5562[_i5565] = 0;
                _i5565--;
                continue;
              }
              _s5562[_i5565] = _d5564;
              if (_i5565 === _a5559.length - 1) break;
              _i5565++;
              _s5562[_i5565] = 0;
            }
            if (_i5565 < 0) break;
            let _g5571 = 0;
            G5572: {
              const _a5573 = sp.cellEdges[_t5556];
              for (let _i5574 = 0; _i5574 < _a5573.length; _i5574++) {
                const v_x = _a5573[_i5574];
                if (!((_f5560[v_x] === 1))) continue;
                _g5571++;
              }
            }
            if (!((_g5571 === (_k5551[_t5556] ?? arms(sp, cl, _t5556))))) continue;
            if (true) {
              _q5557 = true;
              break Q5558;
            }
          }
        }
        _c5575 = _q5557;
      }
      if (!(_c5575)) continue;
      _g5491.push(v_e);
    }
  }
  const v_U = _g5491;
  const _mm5759 = memberMarks(v_U);
  _g5576.length = 0;
  G5577: {
    const _a5580 = v_U;
    for (let _i5581 = 0; _i5581 < _a5580.length; _i5581++) {
      const v_e = _a5580[_i5581];
      if (!((((_k5551[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k5551[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g5576.push(v_e);
    }
  }
  const v_P = _g5576;
  const _a5582 = sp.cells;
  for (let _i5583 = 0; _i5583 < _a5582.length; _i5583++) {
    const v_c = _a5582[_i5583];
    const _h5738 = minus(v_P, sp.cellEdges[v_c]);
    _g5584.length = 0;
    G5585: {
      const _a5588 = sp.cellEdges[v_c];
      for (let _i5589 = 0; _i5589 < _a5588.length; _i5589++) {
        const v_e = _a5588[_i5589];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g5584.push(v_e);
      }
    }
    L5590: {
      const v_F = _g5584;
      const _h5591 = v_F.length;
      if (!((_h5591 > 0))) break L5590;
      const v_G = _eg5592.of(v_c);
      _g5593.length = 0;
      G5594: {
        const _a5674 = sp.cellEdges[v_c];
        for (let _i5675 = 0; _i5675 < _a5674.length; _i5675++) {
          const v_x = _a5674[_i5675];
          const _t5676 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h5739 = minus(_h5738, sp.cellEdges[_t5676]);
          const _eg5741 = edgeGroups(sp, _h5739);
          const _memo5744 = new Map<readonly number[], readonly number[]>();
          _g5677.length = 0;
          _st5716.pass++;
          G5678: {
            const _a5717 = sp.cellEdges[_t5676];
            for (let _i5718 = 0; _i5718 < _a5717.length; _i5718++) {
              const v_y = _a5717[_i5718];
              let _c5737: boolean = (v_y !== v_x);
              if (_c5737) {
                let _q5719 = false;
                Q5720: {
                  const _a5721 = sp.cellEdges[_t5676];
                  for (const _e5725 of _l5723) _f5722[_e5725] = -1;
                  _l5723 = _a5721;
                  let _i5727 = 0;
                  _s5724[0] = 0;
                  let _o5731 = _a5721.length === 0;
                  for (;;) {
                    if (_a5721.length === 0) {
                      if (!_o5731) break;
                      _o5731 = false;
                    }
                    while (_a5721.length > 0 && _i5727 >= 0) {
                      const _e5725 = _a5721[_i5727];
                      if (_s5724[_i5727] > 0) _f5722[_e5725] = -1;
                      let _r5730 = (cands[_e5725] >= 0 ? cands[_e5725] : (cands[_e5725] = b.cands[_e5725])) & ~((2 << _s5724[_i5727]) - 1);
                      let _d5726 = 0;
                      V5729: for (; _r5730 !== 0; _r5730 &= _r5730 - 1) {
                        _d5726 = 31 - Math.clz32(_r5730 & -_r5730);
                        _f5722[_e5725] = _d5726;
                        if (_e5725 === v_x && _d5726 !== 1) continue;
                        if (_e5725 === v_y && _d5726 !== 1) continue;
                        for (let _j5728 = 0; _j5728 < _i5727; _j5728++) {
                          const _y5732 = _a5721[_j5728];
                          if (!(((((_k5551[_t5676] ?? arms(sp, cl, _t5676)) === 2) && (_f5722[_e5725] === 1)) && (_f5722[_y5732] === 1)))) continue;
                          if (!((bent(sp, _e5725, _y5732) === (clueAt(cl.piece, _t5676) === 3)))) continue V5729;
                        }
                        break;
                      }
                      if (_r5730 === 0) {
                        _s5724[_i5727] = 0;
                        _i5727--;
                        continue;
                      }
                      _s5724[_i5727] = _d5726;
                      if (_i5727 === _a5721.length - 1) break;
                      _i5727++;
                      _s5724[_i5727] = 0;
                    }
                    if (_i5727 < 0) break;
                    let _g5733 = 0;
                    G5734: {
                      const _a5735 = sp.cellEdges[_t5676];
                      for (let _i5736 = 0; _i5736 < _a5735.length; _i5736++) {
                        const v_z = _a5735[_i5736];
                        if (!((_f5722[v_z] === 1))) continue;
                        _g5733++;
                      }
                    }
                    if (!((_g5733 === (_k5551[_t5676] ?? arms(sp, cl, _t5676))))) continue;
                    if (true) {
                      _q5719 = true;
                      break Q5720;
                    }
                  }
                }
                _c5737 = _q5719;
              }
              if (!(_c5737)) continue;
              const _t5740 = (sp.edgeEnds[2 * v_y] === _t5676 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t5743 = _eg5741.of(_t5740);
              let _gs5745 = _memo5744.get(_t5743);
              if (_gs5745 === undefined) {
                _g5746.length = 0;
                _st5753.pass++;
                G5747: {
                  const _a5754 = _t5743;
                  for (let _i5755 = 0; _i5755 < _a5754.length; _i5755++) {
                    const v_t = _a5754[_i5755];
                    if (!(((_k5551[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a5756 = sp.cellEdges[v_t];
                    for (let _i5757 = 0; _i5757 < _a5756.length; _i5757++) {
                      const v_y = _a5756[_i5757];
                      L5758: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k5551[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5759[v_y + 1] === 1)))) break L5758;
                        const _t5760 = v_z;
                        if (_g5746.length < 16) { if (!_g5746.includes(_t5760)) _g5746.push(_t5760); } else addOnce(_g5746, _st5753, _t5760);
                      }
                    }
                  }
                }
                _gs5745 = _g5746.slice();
                _memo5744.set(_t5743, _gs5745);
              }
              const _a5761 = union(_eg5741.of(_t5740), _gs5745);
              for (let _i5762 = 0; _i5762 < _a5761.length; _i5762++) {
                const v_t = _a5761[_i5762];
                const _t5763 = v_t;
                if (_g5677.length < 16) { if (!_g5677.includes(_t5763)) _g5677.push(_t5763); } else addOnce(_g5677, _st5716, _t5763);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t5676), _g5677)).length >= _h5764))) continue;
          _g5593.push(v_x);
        }
      }
      const v_K = _g5593;
      let _g6014 = -1;
      let _g6515 = -1;
      _g5765.length = 0;
      G5766: {
        const _a6009 = v_F;
        for (let _i6010 = 0; _i6010 < _a6009.length; _i6010++) {
          const v_e = _a6009[_i6010];
          if (_g6014 !== _epoch) {
            _g6014 = _epoch;
            for (const _e6015 of _l6012) _p6011[_e6015] = 0;
            _y6013 = false;
            const _a6016 = sp.cellEdges[v_c];
            for (const _e6020 of _l6018) _f6017[_e6020] = -1;
            _l6018 = _a6016;
            let _i6022 = 0;
            _s6019[0] = 0;
            let _o6026 = _a6016.length === 0;
            for (;;) {
              if (_a6016.length === 0) {
                if (!_o6026) break;
                _o6026 = false;
              }
              while (_a6016.length > 0 && _i6022 >= 0) {
                const _e6020 = _a6016[_i6022];
                if (_s6019[_i6022] > 0) _f6017[_e6020] = -1;
                let _r6025 = (cands[_e6020] >= 0 ? cands[_e6020] : (cands[_e6020] = b.cands[_e6020])) & ~((2 << _s6019[_i6022]) - 1);
                let _d6021 = 0;
                V6024: for (; _r6025 !== 0; _r6025 &= _r6025 - 1) {
                  _d6021 = 31 - Math.clz32(_r6025 & -_r6025);
                  _f6017[_e6020] = _d6021;
                  for (let _j6023 = 0; _j6023 < _i6022; _j6023++) {
                    const _y6027 = _a6016[_j6023];
                    if (!(((((_k5551[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f6017[_e6020] === 1)) && (_f6017[_y6027] === 1)))) continue;
                    if (!((bent(sp, _e6020, _y6027) === (clueAt(cl.piece, v_c) === 3)))) continue V6024;
                  }
                  for (let _j6023 = 0; _j6023 < _i6022; _j6023++) {
                    const _y6028 = _a6016[_j6023];
                    if (!(((((_f6017[_e6020] === 1) && (_f6017[_y6028] === 1)) && !((b.grid[_e6020] !== 0))) && !((b.grid[_y6028] !== 0))))) continue;
                    if (!(!(_eg5592.of((sp.edgeEnds[2 * _y6028] === v_c ? sp.edgeEnds[2 * _y6028 + 1] : sp.edgeEnds[2 * _y6028])) === _eg5592.of((sp.edgeEnds[2 * _e6020] === v_c ? sp.edgeEnds[2 * _e6020 + 1] : sp.edgeEnds[2 * _e6020]))))) continue V6024;
                  }
                  break;
                }
                if (_r6025 === 0) {
                  _s6019[_i6022] = 0;
                  _i6022--;
                  continue;
                }
                _s6019[_i6022] = _d6021;
                if (_i6022 === _a6016.length - 1) break;
                _i6022++;
                _s6019[_i6022] = 0;
              }
              if (_i6022 < 0) break;
              let _g6029 = 0;
              G6030: {
                const _a6031 = sp.cellEdges[v_c];
                for (let _i6032 = 0; _i6032 < _a6031.length; _i6032++) {
                  const v_x = _a6031[_i6032];
                  if (!((_f6017[v_x] === 1))) continue;
                  _g6029++;
                }
              }
              let _c6037: boolean = (_g6029 === (_k5551[v_c] ?? arms(sp, cl, v_c)));
              if (_c6037) {
                let _q6033 = true;
                Q6034: {
                  const _a6035 = sp.cellEdges[v_c];
                  for (let _i6036 = 0; _i6036 < _a6035.length; _i6036++) {
                    const v_x = _a6035[_i6036];
                    if (!(((_f6017[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5592.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q6033 = false;
                      break Q6034;
                    }
                  }
                }
                _c6037 = _q6033;
              }
              let _c6218: boolean = _c6037;
              if (_c6218) {
                let _q6038 = false;
                Q6039: {
                  const _a6040 = sp.cellEdges[v_c];
                  for (let _i6041 = 0; _i6041 < _a6040.length; _i6041++) {
                    const v_x = _a6040[_i6041];
                    if (!((_f6017[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q6038 = true;
                      break Q6039;
                    }
                  }
                }
                let _c6217: boolean = _q6038;
                if (!_c6217) {
                  _g6042.length = 0;
                  _st6125.pass++;
                  G6043: {
                    const _a6126 = sp.cellEdges[v_c];
                    for (let _i6127 = 0; _i6127 < _a6126.length; _i6127++) {
                      const v_x = _a6126[_i6127];
                      if (!((_f6017[v_x] === 1))) continue;
                      const _t6128 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h6190 = minus(_h5738, sp.cellEdges[_t6128]);
                      const _eg6192 = edgeGroups(sp, _h6190);
                      const _memo6195 = new Map<readonly number[], readonly number[]>();
                      _g6129.length = 0;
                      _st6168.pass++;
                      G6130: {
                        const _a6169 = sp.cellEdges[_t6128];
                        for (let _i6170 = 0; _i6170 < _a6169.length; _i6170++) {
                          const v_y = _a6169[_i6170];
                          let _c6189: boolean = (v_y !== v_x);
                          if (_c6189) {
                            let _q6171 = false;
                            Q6172: {
                              const _a6173 = sp.cellEdges[_t6128];
                              for (const _e6177 of _l6175) _f6174[_e6177] = -1;
                              _l6175 = _a6173;
                              let _i6179 = 0;
                              _s6176[0] = 0;
                              let _o6183 = _a6173.length === 0;
                              for (;;) {
                                if (_a6173.length === 0) {
                                  if (!_o6183) break;
                                  _o6183 = false;
                                }
                                while (_a6173.length > 0 && _i6179 >= 0) {
                                  const _e6177 = _a6173[_i6179];
                                  if (_s6176[_i6179] > 0) _f6174[_e6177] = -1;
                                  let _r6182 = (cands[_e6177] >= 0 ? cands[_e6177] : (cands[_e6177] = b.cands[_e6177])) & ~((2 << _s6176[_i6179]) - 1);
                                  let _d6178 = 0;
                                  V6181: for (; _r6182 !== 0; _r6182 &= _r6182 - 1) {
                                    _d6178 = 31 - Math.clz32(_r6182 & -_r6182);
                                    _f6174[_e6177] = _d6178;
                                    if (_e6177 === v_x && _d6178 !== 1) continue;
                                    if (_e6177 === v_y && _d6178 !== 1) continue;
                                    for (let _j6180 = 0; _j6180 < _i6179; _j6180++) {
                                      const _y6184 = _a6173[_j6180];
                                      if (!(((((_k5551[_t6128] ?? arms(sp, cl, _t6128)) === 2) && (_f6174[_e6177] === 1)) && (_f6174[_y6184] === 1)))) continue;
                                      if (!((bent(sp, _e6177, _y6184) === (clueAt(cl.piece, _t6128) === 3)))) continue V6181;
                                    }
                                    break;
                                  }
                                  if (_r6182 === 0) {
                                    _s6176[_i6179] = 0;
                                    _i6179--;
                                    continue;
                                  }
                                  _s6176[_i6179] = _d6178;
                                  if (_i6179 === _a6173.length - 1) break;
                                  _i6179++;
                                  _s6176[_i6179] = 0;
                                }
                                if (_i6179 < 0) break;
                                let _g6185 = 0;
                                G6186: {
                                  const _a6187 = sp.cellEdges[_t6128];
                                  for (let _i6188 = 0; _i6188 < _a6187.length; _i6188++) {
                                    const v_z = _a6187[_i6188];
                                    if (!((_f6174[v_z] === 1))) continue;
                                    _g6185++;
                                  }
                                }
                                if (!((_g6185 === (_k5551[_t6128] ?? arms(sp, cl, _t6128))))) continue;
                                if (true) {
                                  _q6171 = true;
                                  break Q6172;
                                }
                              }
                            }
                            _c6189 = _q6171;
                          }
                          if (!(_c6189)) continue;
                          const _t6191 = (sp.edgeEnds[2 * v_y] === _t6128 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6194 = _eg6192.of(_t6191);
                          let _gs6196 = _memo6195.get(_t6194);
                          if (_gs6196 === undefined) {
                            _g6197.length = 0;
                            _st6204.pass++;
                            G6198: {
                              const _a6205 = _t6194;
                              for (let _i6206 = 0; _i6206 < _a6205.length; _i6206++) {
                                const v_t = _a6205[_i6206];
                                if (!(((_k5551[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a6207 = sp.cellEdges[v_t];
                                for (let _i6208 = 0; _i6208 < _a6207.length; _i6208++) {
                                  const v_y = _a6207[_i6208];
                                  L6209: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k5551[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5759[v_y + 1] === 1)))) break L6209;
                                    const _t6210 = v_z;
                                    if (_g6197.length < 16) { if (!_g6197.includes(_t6210)) _g6197.push(_t6210); } else addOnce(_g6197, _st6204, _t6210);
                                  }
                                }
                              }
                            }
                            _gs6196 = _g6197.slice();
                            _memo6195.set(_t6194, _gs6196);
                          }
                          const _a6211 = union(_eg6192.of(_t6191), _gs6196);
                          for (let _i6212 = 0; _i6212 < _a6211.length; _i6212++) {
                            const v_t = _a6211[_i6212];
                            const _t6213 = v_t;
                            if (_g6129.length < 16) { if (!_g6129.includes(_t6213)) _g6129.push(_t6213); } else addOnce(_g6129, _st6168, _t6213);
                          }
                        }
                      }
                      const _a6214 = union(setOf(_t6128), _g6129);
                      for (let _i6215 = 0; _i6215 < _a6214.length; _i6215++) {
                        const v_t = _a6214[_i6215];
                        const _t6216 = v_t;
                        if (_g6042.length < 16) { if (!_g6042.includes(_t6216)) _g6042.push(_t6216); } else addOnce(_g6042, _st6125, _t6216);
                      }
                    }
                  }
                  _c6217 = (union(setOf(v_c), _g6042).length >= _h5764);
                }
                _c6218 = _c6217;
              }
              let _c6265: boolean = _c6218;
              if (_c6265) {
                let _q6219 = true;
                Q6220: {
                  _g6221.length = 0;
                  G6222: {
                    const _a6225 = sp.cellEdges[v_c];
                    for (let _i6226 = 0; _i6226 < _a6225.length; _i6226++) {
                      const v_x = _a6225[_i6226];
                      if (!((_f6017[v_x] === 1))) continue;
                      _g6221.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g6221);
                  const _eg6250 = edgeGroups(sp, v_M);
                  const _a6227 = sp.cellEdges[v_c];
                  for (let _i6228 = 0; _i6228 < _a6227.length; _i6228++) {
                    const v_x = _a6227[_i6228];
                    L6229: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c6234: boolean = (v_j !== v_c);
                      if (_c6234) {
                        let _q6230 = false;
                        Q6231: {
                          const _a6232 = sp.cellEdges[v_j];
                          for (let _i6233 = 0; _i6233 < _a6232.length; _i6233++) {
                            const v_y = _a6232[_i6233];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q6230 = true;
                              break Q6231;
                            }
                          }
                        }
                        _c6234 = _q6230;
                      }
                      if (!(_c6234)) break L6229;
                      let _q6235 = false;
                      Q6236: {
                        const _a6237 = sp.cellEdges[v_j];
                        for (const _e6241 of _l6239) _f6238[_e6241] = -1;
                        _l6239 = _a6237;
                        let _i6243 = 0;
                        _s6240[0] = 0;
                        let _o6247 = _a6237.length === 0;
                        for (;;) {
                          if (_a6237.length === 0) {
                            if (!_o6247) break;
                            _o6247 = false;
                          }
                          while (_a6237.length > 0 && _i6243 >= 0) {
                            const _e6241 = _a6237[_i6243];
                            if (_s6240[_i6243] > 0) _f6238[_e6241] = -1;
                            let _r6246 = (cands[_e6241] >= 0 ? cands[_e6241] : (cands[_e6241] = b.cands[_e6241])) & ~((2 << _s6240[_i6243]) - 1);
                            let _d6242 = 0;
                            V6245: for (; _r6246 !== 0; _r6246 &= _r6246 - 1) {
                              _d6242 = 31 - Math.clz32(_r6246 & -_r6246);
                              _f6238[_e6241] = _d6242;
                              for (let _j6244 = 0; _j6244 < _i6243; _j6244++) {
                                const _y6248 = _a6237[_j6244];
                                if (!(((((_k5551[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f6238[_e6241] === 1)) && (_f6238[_y6248] === 1)))) continue;
                                if (!((bent(sp, _e6241, _y6248) === (clueAt(cl.piece, v_j) === 3)))) continue V6245;
                              }
                              for (let _j6244 = 0; _j6244 < _i6243; _j6244++) {
                                const _y6249 = _a6237[_j6244];
                                if (!(((((((_f6238[_e6241] === 1) && (_f6238[_y6249] === 1)) && !((b.grid[_e6241] !== 0))) && !((b.grid[_y6249] !== 0))) && !([sp.edgeEnds[2 * _e6241], sp.edgeEnds[2 * _e6241 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y6249], sp.edgeEnds[2 * _y6249 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6250.of((sp.edgeEnds[2 * _y6249] === v_j ? sp.edgeEnds[2 * _y6249 + 1] : sp.edgeEnds[2 * _y6249])) === _eg6250.of((sp.edgeEnds[2 * _e6241] === v_j ? sp.edgeEnds[2 * _e6241 + 1] : sp.edgeEnds[2 * _e6241]))))) continue V6245;
                              }
                              break;
                            }
                            if (_r6246 === 0) {
                              _s6240[_i6243] = 0;
                              _i6243--;
                              continue;
                            }
                            _s6240[_i6243] = _d6242;
                            if (_i6243 === _a6237.length - 1) break;
                            _i6243++;
                            _s6240[_i6243] = 0;
                          }
                          if (_i6243 < 0) break;
                          let _q6251 = true;
                          Q6252: {
                            const _a6253 = sp.cellEdges[v_j];
                            for (let _i6254 = 0; _i6254 < _a6253.length; _i6254++) {
                              const v_y = _a6253[_i6254];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f6238[v_y] === _f6017[v_y]))) {
                                _q6251 = false;
                                break Q6252;
                              }
                            }
                          }
                          let _c6259: boolean = _q6251;
                          if (_c6259) {
                            let _g6255 = 0;
                            G6256: {
                              const _a6257 = sp.cellEdges[v_j];
                              for (let _i6258 = 0; _i6258 < _a6257.length; _i6258++) {
                                const v_y = _a6257[_i6258];
                                if (!((_f6238[v_y] === 1))) continue;
                                _g6255++;
                              }
                            }
                            _c6259 = (_g6255 === (_k5551[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c6264: boolean = _c6259;
                          if (_c6264) {
                            let _q6260 = true;
                            Q6261: {
                              const _a6262 = sp.cellEdges[v_j];
                              for (let _i6263 = 0; _i6263 < _a6262.length; _i6263++) {
                                const v_y = _a6262[_i6263];
                                if (!((((_f6238[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6250.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg6250.of(v_j)))) {
                                  _q6260 = false;
                                  break Q6261;
                                }
                              }
                            }
                            _c6264 = _q6260;
                          }
                          if (!(_c6264)) continue;
                          if (true) {
                            _q6235 = true;
                            break Q6236;
                          }
                        }
                      }
                      if (!(_q6235)) {
                        _q6219 = false;
                        break Q6220;
                      }
                    }
                  }
                }
                _c6265 = _q6219;
              }
              if (!(_c6265)) continue;
              if (!(true)) continue;
              _l6012 = _a6016;
              _y6013 = true;
              for (const _e6015 of _a6016) _p6011[_e6015] |= 1 << _f6017[_e6015];
            }
          }
          if (!(((((_p6011[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y6013 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g5765.push(v_e);
        }
      }
      const v_W = _g5765;
      _g6266.length = 0;
      G6267: {
        const _a6510 = v_F;
        for (let _i6511 = 0; _i6511 < _a6510.length; _i6511++) {
          const v_e = _a6510[_i6511];
          if (_g6515 !== _epoch) {
            _g6515 = _epoch;
            for (const _e6516 of _l6513) _p6512[_e6516] = 0;
            _y6514 = false;
            const _a6517 = sp.cellEdges[v_c];
            for (const _e6521 of _l6519) _f6518[_e6521] = -1;
            _l6519 = _a6517;
            let _i6523 = 0;
            _s6520[0] = 0;
            let _o6527 = _a6517.length === 0;
            for (;;) {
              if (_a6517.length === 0) {
                if (!_o6527) break;
                _o6527 = false;
              }
              while (_a6517.length > 0 && _i6523 >= 0) {
                const _e6521 = _a6517[_i6523];
                if (_s6520[_i6523] > 0) _f6518[_e6521] = -1;
                let _r6526 = (cands[_e6521] >= 0 ? cands[_e6521] : (cands[_e6521] = b.cands[_e6521])) & ~((2 << _s6520[_i6523]) - 1);
                let _d6522 = 0;
                V6525: for (; _r6526 !== 0; _r6526 &= _r6526 - 1) {
                  _d6522 = 31 - Math.clz32(_r6526 & -_r6526);
                  _f6518[_e6521] = _d6522;
                  for (let _j6524 = 0; _j6524 < _i6523; _j6524++) {
                    const _y6528 = _a6517[_j6524];
                    if (!(((((_k5551[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f6518[_e6521] === 1)) && (_f6518[_y6528] === 1)))) continue;
                    if (!((bent(sp, _e6521, _y6528) === (clueAt(cl.piece, v_c) === 3)))) continue V6525;
                  }
                  for (let _j6524 = 0; _j6524 < _i6523; _j6524++) {
                    const _y6529 = _a6517[_j6524];
                    if (!(((((_f6518[_e6521] === 1) && (_f6518[_y6529] === 1)) && !((b.grid[_e6521] !== 0))) && !((b.grid[_y6529] !== 0))))) continue;
                    if (!(!(_eg5592.of((sp.edgeEnds[2 * _y6529] === v_c ? sp.edgeEnds[2 * _y6529 + 1] : sp.edgeEnds[2 * _y6529])) === _eg5592.of((sp.edgeEnds[2 * _e6521] === v_c ? sp.edgeEnds[2 * _e6521 + 1] : sp.edgeEnds[2 * _e6521]))))) continue V6525;
                  }
                  break;
                }
                if (_r6526 === 0) {
                  _s6520[_i6523] = 0;
                  _i6523--;
                  continue;
                }
                _s6520[_i6523] = _d6522;
                if (_i6523 === _a6517.length - 1) break;
                _i6523++;
                _s6520[_i6523] = 0;
              }
              if (_i6523 < 0) break;
              let _g6530 = 0;
              G6531: {
                const _a6532 = sp.cellEdges[v_c];
                for (let _i6533 = 0; _i6533 < _a6532.length; _i6533++) {
                  const v_x = _a6532[_i6533];
                  if (!((_f6518[v_x] === 1))) continue;
                  _g6530++;
                }
              }
              let _c6538: boolean = (_g6530 === (_k5551[v_c] ?? arms(sp, cl, v_c)));
              if (_c6538) {
                let _q6534 = true;
                Q6535: {
                  const _a6536 = sp.cellEdges[v_c];
                  for (let _i6537 = 0; _i6537 < _a6536.length; _i6537++) {
                    const v_x = _a6536[_i6537];
                    if (!(((_f6518[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5592.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q6534 = false;
                      break Q6535;
                    }
                  }
                }
                _c6538 = _q6534;
              }
              let _c6719: boolean = _c6538;
              if (_c6719) {
                let _q6539 = false;
                Q6540: {
                  const _a6541 = sp.cellEdges[v_c];
                  for (let _i6542 = 0; _i6542 < _a6541.length; _i6542++) {
                    const v_x = _a6541[_i6542];
                    if (!((_f6518[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q6539 = true;
                      break Q6540;
                    }
                  }
                }
                let _c6718: boolean = _q6539;
                if (!_c6718) {
                  _g6543.length = 0;
                  _st6626.pass++;
                  G6544: {
                    const _a6627 = sp.cellEdges[v_c];
                    for (let _i6628 = 0; _i6628 < _a6627.length; _i6628++) {
                      const v_x = _a6627[_i6628];
                      if (!((_f6518[v_x] === 1))) continue;
                      const _t6629 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h6691 = minus(_h5738, sp.cellEdges[_t6629]);
                      const _eg6693 = edgeGroups(sp, _h6691);
                      const _memo6696 = new Map<readonly number[], readonly number[]>();
                      _g6630.length = 0;
                      _st6669.pass++;
                      G6631: {
                        const _a6670 = sp.cellEdges[_t6629];
                        for (let _i6671 = 0; _i6671 < _a6670.length; _i6671++) {
                          const v_y = _a6670[_i6671];
                          let _c6690: boolean = (v_y !== v_x);
                          if (_c6690) {
                            let _q6672 = false;
                            Q6673: {
                              const _a6674 = sp.cellEdges[_t6629];
                              for (const _e6678 of _l6676) _f6675[_e6678] = -1;
                              _l6676 = _a6674;
                              let _i6680 = 0;
                              _s6677[0] = 0;
                              let _o6684 = _a6674.length === 0;
                              for (;;) {
                                if (_a6674.length === 0) {
                                  if (!_o6684) break;
                                  _o6684 = false;
                                }
                                while (_a6674.length > 0 && _i6680 >= 0) {
                                  const _e6678 = _a6674[_i6680];
                                  if (_s6677[_i6680] > 0) _f6675[_e6678] = -1;
                                  let _r6683 = (cands[_e6678] >= 0 ? cands[_e6678] : (cands[_e6678] = b.cands[_e6678])) & ~((2 << _s6677[_i6680]) - 1);
                                  let _d6679 = 0;
                                  V6682: for (; _r6683 !== 0; _r6683 &= _r6683 - 1) {
                                    _d6679 = 31 - Math.clz32(_r6683 & -_r6683);
                                    _f6675[_e6678] = _d6679;
                                    if (_e6678 === v_x && _d6679 !== 1) continue;
                                    if (_e6678 === v_y && _d6679 !== 1) continue;
                                    for (let _j6681 = 0; _j6681 < _i6680; _j6681++) {
                                      const _y6685 = _a6674[_j6681];
                                      if (!(((((_k5551[_t6629] ?? arms(sp, cl, _t6629)) === 2) && (_f6675[_e6678] === 1)) && (_f6675[_y6685] === 1)))) continue;
                                      if (!((bent(sp, _e6678, _y6685) === (clueAt(cl.piece, _t6629) === 3)))) continue V6682;
                                    }
                                    break;
                                  }
                                  if (_r6683 === 0) {
                                    _s6677[_i6680] = 0;
                                    _i6680--;
                                    continue;
                                  }
                                  _s6677[_i6680] = _d6679;
                                  if (_i6680 === _a6674.length - 1) break;
                                  _i6680++;
                                  _s6677[_i6680] = 0;
                                }
                                if (_i6680 < 0) break;
                                let _g6686 = 0;
                                G6687: {
                                  const _a6688 = sp.cellEdges[_t6629];
                                  for (let _i6689 = 0; _i6689 < _a6688.length; _i6689++) {
                                    const v_z = _a6688[_i6689];
                                    if (!((_f6675[v_z] === 1))) continue;
                                    _g6686++;
                                  }
                                }
                                if (!((_g6686 === (_k5551[_t6629] ?? arms(sp, cl, _t6629))))) continue;
                                if (true) {
                                  _q6672 = true;
                                  break Q6673;
                                }
                              }
                            }
                            _c6690 = _q6672;
                          }
                          if (!(_c6690)) continue;
                          const _t6692 = (sp.edgeEnds[2 * v_y] === _t6629 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6695 = _eg6693.of(_t6692);
                          let _gs6697 = _memo6696.get(_t6695);
                          if (_gs6697 === undefined) {
                            _g6698.length = 0;
                            _st6705.pass++;
                            G6699: {
                              const _a6706 = _t6695;
                              for (let _i6707 = 0; _i6707 < _a6706.length; _i6707++) {
                                const v_t = _a6706[_i6707];
                                if (!(((_k5551[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a6708 = sp.cellEdges[v_t];
                                for (let _i6709 = 0; _i6709 < _a6708.length; _i6709++) {
                                  const v_y = _a6708[_i6709];
                                  L6710: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k5551[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5759[v_y + 1] === 1)))) break L6710;
                                    const _t6711 = v_z;
                                    if (_g6698.length < 16) { if (!_g6698.includes(_t6711)) _g6698.push(_t6711); } else addOnce(_g6698, _st6705, _t6711);
                                  }
                                }
                              }
                            }
                            _gs6697 = _g6698.slice();
                            _memo6696.set(_t6695, _gs6697);
                          }
                          const _a6712 = union(_eg6693.of(_t6692), _gs6697);
                          for (let _i6713 = 0; _i6713 < _a6712.length; _i6713++) {
                            const v_t = _a6712[_i6713];
                            const _t6714 = v_t;
                            if (_g6630.length < 16) { if (!_g6630.includes(_t6714)) _g6630.push(_t6714); } else addOnce(_g6630, _st6669, _t6714);
                          }
                        }
                      }
                      const _a6715 = union(setOf(_t6629), _g6630);
                      for (let _i6716 = 0; _i6716 < _a6715.length; _i6716++) {
                        const v_t = _a6715[_i6716];
                        const _t6717 = v_t;
                        if (_g6543.length < 16) { if (!_g6543.includes(_t6717)) _g6543.push(_t6717); } else addOnce(_g6543, _st6626, _t6717);
                      }
                    }
                  }
                  _c6718 = (union(setOf(v_c), _g6543).length >= _h5764);
                }
                _c6719 = _c6718;
              }
              let _c6766: boolean = _c6719;
              if (_c6766) {
                let _q6720 = true;
                Q6721: {
                  _g6722.length = 0;
                  G6723: {
                    const _a6726 = sp.cellEdges[v_c];
                    for (let _i6727 = 0; _i6727 < _a6726.length; _i6727++) {
                      const v_x = _a6726[_i6727];
                      if (!((_f6518[v_x] === 1))) continue;
                      _g6722.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g6722);
                  const _eg6751 = edgeGroups(sp, v_M);
                  const _a6728 = sp.cellEdges[v_c];
                  for (let _i6729 = 0; _i6729 < _a6728.length; _i6729++) {
                    const v_x = _a6728[_i6729];
                    L6730: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c6735: boolean = (v_j !== v_c);
                      if (_c6735) {
                        let _q6731 = false;
                        Q6732: {
                          const _a6733 = sp.cellEdges[v_j];
                          for (let _i6734 = 0; _i6734 < _a6733.length; _i6734++) {
                            const v_y = _a6733[_i6734];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q6731 = true;
                              break Q6732;
                            }
                          }
                        }
                        _c6735 = _q6731;
                      }
                      if (!(_c6735)) break L6730;
                      let _q6736 = false;
                      Q6737: {
                        const _a6738 = sp.cellEdges[v_j];
                        for (const _e6742 of _l6740) _f6739[_e6742] = -1;
                        _l6740 = _a6738;
                        let _i6744 = 0;
                        _s6741[0] = 0;
                        let _o6748 = _a6738.length === 0;
                        for (;;) {
                          if (_a6738.length === 0) {
                            if (!_o6748) break;
                            _o6748 = false;
                          }
                          while (_a6738.length > 0 && _i6744 >= 0) {
                            const _e6742 = _a6738[_i6744];
                            if (_s6741[_i6744] > 0) _f6739[_e6742] = -1;
                            let _r6747 = (cands[_e6742] >= 0 ? cands[_e6742] : (cands[_e6742] = b.cands[_e6742])) & ~((2 << _s6741[_i6744]) - 1);
                            let _d6743 = 0;
                            V6746: for (; _r6747 !== 0; _r6747 &= _r6747 - 1) {
                              _d6743 = 31 - Math.clz32(_r6747 & -_r6747);
                              _f6739[_e6742] = _d6743;
                              for (let _j6745 = 0; _j6745 < _i6744; _j6745++) {
                                const _y6749 = _a6738[_j6745];
                                if (!(((((_k5551[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f6739[_e6742] === 1)) && (_f6739[_y6749] === 1)))) continue;
                                if (!((bent(sp, _e6742, _y6749) === (clueAt(cl.piece, v_j) === 3)))) continue V6746;
                              }
                              for (let _j6745 = 0; _j6745 < _i6744; _j6745++) {
                                const _y6750 = _a6738[_j6745];
                                if (!(((((((_f6739[_e6742] === 1) && (_f6739[_y6750] === 1)) && !((b.grid[_e6742] !== 0))) && !((b.grid[_y6750] !== 0))) && !([sp.edgeEnds[2 * _e6742], sp.edgeEnds[2 * _e6742 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y6750], sp.edgeEnds[2 * _y6750 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6751.of((sp.edgeEnds[2 * _y6750] === v_j ? sp.edgeEnds[2 * _y6750 + 1] : sp.edgeEnds[2 * _y6750])) === _eg6751.of((sp.edgeEnds[2 * _e6742] === v_j ? sp.edgeEnds[2 * _e6742 + 1] : sp.edgeEnds[2 * _e6742]))))) continue V6746;
                              }
                              break;
                            }
                            if (_r6747 === 0) {
                              _s6741[_i6744] = 0;
                              _i6744--;
                              continue;
                            }
                            _s6741[_i6744] = _d6743;
                            if (_i6744 === _a6738.length - 1) break;
                            _i6744++;
                            _s6741[_i6744] = 0;
                          }
                          if (_i6744 < 0) break;
                          let _q6752 = true;
                          Q6753: {
                            const _a6754 = sp.cellEdges[v_j];
                            for (let _i6755 = 0; _i6755 < _a6754.length; _i6755++) {
                              const v_y = _a6754[_i6755];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f6739[v_y] === _f6518[v_y]))) {
                                _q6752 = false;
                                break Q6753;
                              }
                            }
                          }
                          let _c6760: boolean = _q6752;
                          if (_c6760) {
                            let _g6756 = 0;
                            G6757: {
                              const _a6758 = sp.cellEdges[v_j];
                              for (let _i6759 = 0; _i6759 < _a6758.length; _i6759++) {
                                const v_y = _a6758[_i6759];
                                if (!((_f6739[v_y] === 1))) continue;
                                _g6756++;
                              }
                            }
                            _c6760 = (_g6756 === (_k5551[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c6765: boolean = _c6760;
                          if (_c6765) {
                            let _q6761 = true;
                            Q6762: {
                              const _a6763 = sp.cellEdges[v_j];
                              for (let _i6764 = 0; _i6764 < _a6763.length; _i6764++) {
                                const v_y = _a6763[_i6764];
                                if (!((((_f6739[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6751.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg6751.of(v_j)))) {
                                  _q6761 = false;
                                  break Q6762;
                                }
                              }
                            }
                            _c6765 = _q6761;
                          }
                          if (!(_c6765)) continue;
                          if (true) {
                            _q6736 = true;
                            break Q6737;
                          }
                        }
                      }
                      if (!(_q6736)) {
                        _q6720 = false;
                        break Q6721;
                      }
                    }
                  }
                }
                _c6766 = _q6720;
              }
              if (!(_c6766)) continue;
              if (!(true)) continue;
              _l6513 = _a6517;
              _y6514 = true;
              for (const _e6516 of _a6517) _p6512[_e6516] |= 1 << _f6518[_e6516];
            }
          }
          if (!(((((_p6512[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y6514 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g6266.push(v_e);
        }
      }
      L6767: {
        const v_N = _g6266;
        let _q6768 = true;
        Q6769: {
          const _a6770 = v_F;
          for (let _i6771 = 0; _i6771 < _a6770.length; _i6771++) {
            const v_e = _a6770[_i6771];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q6768 = false;
              break Q6769;
            }
          }
        }
        if (!(_q6768)) break L6767;
        facts.length = 0;
        changed = false;
        let _q6772 = true;
        Q6773: {
          const _a6774 = v_F;
          for (let _i6775 = 0; _i6775 < _a6774.length; _i6775++) {
            const v_e = _a6774[_i6775];
            let _c6777: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c6777) {
              let _c6776: boolean = !(!(v_W.includes(v_e)));
              if (!_c6776) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c6776 = true;
              }
              _c6777 = _c6776;
            }
            let _c6779: boolean = _c6777;
            if (_c6779) {
              let _c6778: boolean = !(!(v_N.includes(v_e)));
              if (!_c6778) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c6778 = true;
              }
              _c6779 = _c6778;
            }
            if (!(_c6779)) {
              _q6772 = false;
              break Q6773;
            }
          }
        }
        if (!(_q6772)) return -1;
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
let _f7580 = new Int32Array(0);
let _l7581: readonly number[] = [];
let _f7600 = new Int32Array(0);
let _l7601: readonly number[] = [];
const _st7752 = stamps();
let _f7758 = new Int32Array(0);
let _l7759: readonly number[] = [];
const _st7789 = stamps();
let _p7803 = new Int32Array(0);
let _l7804: readonly number[] = [];
let _f7809 = new Int32Array(0);
let _l7810: readonly number[] = [];
const _st7917 = stamps();
const _st7960 = stamps();
let _f7966 = new Int32Array(0);
let _l7967: readonly number[] = [];
const _st7996 = stamps();
let _f8030 = new Int32Array(0);
let _l8031: readonly number[] = [];
let _p8058 = new Int32Array(0);
let _l8059: readonly number[] = [];
let _f8064 = new Int32Array(0);
let _l8065: readonly number[] = [];
const _st8172 = stamps();
const _st8215 = stamps();
let _f8221 = new Int32Array(0);
let _l8222: readonly number[] = [];
const _st8251 = stamps();
let _f8285 = new Int32Array(0);
let _l8286: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandNoteBinding> | null): number {
  const _g7525: number[] = [];
  const _g7531: number[] = [];
  if (_f7580.length < sp.edges.length) _f7580 = new Int32Array(sp.edges.length).fill(-1);
  else _f7580.fill(-1);
  _l7581 = [];
  const _s7582: number[] = [];
  if (_f7600.length < sp.edges.length) _f7600 = new Int32Array(sp.edges.length).fill(-1);
  else _f7600.fill(-1);
  _l7601 = [];
  const _s7602: number[] = [];
  const _g7616: number[] = [];
  const _g7629: number[] = [];
  const _g7713: number[] = [];
  if (_f7758.length < sp.edges.length) _f7758 = new Int32Array(sp.edges.length).fill(-1);
  else _f7758.fill(-1);
  _l7759 = [];
  const _s7760: number[] = [];
  const _g7782: number[] = [];
  if (_p7803.length < sp.edges.length) _p7803 = new Int32Array(sp.edges.length);
  else _p7803.fill(0);
  _l7804 = [];
  let _y7805 = false;
  if (_f7809.length < sp.edges.length) _f7809 = new Int32Array(sp.edges.length).fill(-1);
  else _f7809.fill(-1);
  _l7810 = [];
  const _s7811: number[] = [];
  const _g7834: number[] = [];
  const _g7921: number[] = [];
  if (_f7966.length < sp.edges.length) _f7966 = new Int32Array(sp.edges.length).fill(-1);
  else _f7966.fill(-1);
  _l7967 = [];
  const _s7968: number[] = [];
  const _g7989: number[] = [];
  const _g8013: number[] = [];
  if (_f8030.length < sp.edges.length) _f8030 = new Int32Array(sp.edges.length).fill(-1);
  else _f8030.fill(-1);
  _l8031 = [];
  const _s8032: number[] = [];
  if (_p8058.length < sp.edges.length) _p8058 = new Int32Array(sp.edges.length);
  else _p8058.fill(0);
  _l8059 = [];
  let _y8060 = false;
  if (_f8064.length < sp.edges.length) _f8064 = new Int32Array(sp.edges.length).fill(-1);
  else _f8064.fill(-1);
  _l8065 = [];
  const _s8066: number[] = [];
  const _g8089: number[] = [];
  const _g8176: number[] = [];
  if (_f8221.length < sp.edges.length) _f8221 = new Int32Array(sp.edges.length).fill(-1);
  else _f8221.fill(-1);
  _l8222 = [];
  const _s8223: number[] = [];
  const _g8244: number[] = [];
  const _g8268: number[] = [];
  if (_f8285.length < sp.edges.length) _f8285 = new Int32Array(sp.edges.length).fill(-1);
  else _f8285.fill(-1);
  _l8286 = [];
  const _s8287: number[] = [];
  const facts = strandNoteFacts;
  let fired = 0;
  let changed = false;
  const _k7591 = armsKept.board(cl);
  const _h7800 = sp.cells.length;
  let _epoch = 0;
  if (strandNoteCands.length < sp.edges.length) strandNoteCands = new Int32Array(sp.edges.length);
  const cands = strandNoteCands;
  cands.fill(-1);
  _g7525.length = 0;
  G7526: {
    const _a7529 = sp.edges;
    for (let _i7530 = 0; _i7530 < _a7529.length; _i7530++) {
      const v_e = _a7529[_i7530];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g7525.push(v_e);
    }
  }
  const v_L = _g7525;
  const _eg7628 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g7531.length = 0;
  G7532: {
    const _a7574 = sp.edges;
    for (let _i7575 = 0; _i7575 < _a7574.length; _i7575++) {
      const v_e = _a7574[_i7575];
      const _t7576 = sp.edgeEnds[2 * v_e];
      let _q7577 = false;
      Q7578: {
        const _a7579 = sp.cellEdges[_t7576];
        for (const _e7583 of _l7581) _f7580[_e7583] = -1;
        _l7581 = _a7579;
        let _i7585 = 0;
        _s7582[0] = 0;
        let _o7589 = _a7579.length === 0;
        for (;;) {
          if (_a7579.length === 0) {
            if (!_o7589) break;
            _o7589 = false;
          }
          while (_a7579.length > 0 && _i7585 >= 0) {
            const _e7583 = _a7579[_i7585];
            if (_s7582[_i7585] > 0) _f7580[_e7583] = -1;
            let _r7588 = (cands[_e7583] >= 0 ? cands[_e7583] : (cands[_e7583] = b.cands[_e7583])) & ~((2 << _s7582[_i7585]) - 1);
            let _d7584 = 0;
            V7587: for (; _r7588 !== 0; _r7588 &= _r7588 - 1) {
              _d7584 = 31 - Math.clz32(_r7588 & -_r7588);
              _f7580[_e7583] = _d7584;
              if (_e7583 === v_e && _d7584 !== 1) continue;
              for (let _j7586 = 0; _j7586 < _i7585; _j7586++) {
                const _y7590 = _a7579[_j7586];
                if (!(((((_k7591[_t7576] ?? arms(sp, cl, _t7576)) === 2) && (_f7580[_e7583] === 1)) && (_f7580[_y7590] === 1)))) continue;
                if (!((bent(sp, _e7583, _y7590) === (clueAt(cl.piece, _t7576) === 3)))) continue V7587;
              }
              break;
            }
            if (_r7588 === 0) {
              _s7582[_i7585] = 0;
              _i7585--;
              continue;
            }
            _s7582[_i7585] = _d7584;
            if (_i7585 === _a7579.length - 1) break;
            _i7585++;
            _s7582[_i7585] = 0;
          }
          if (_i7585 < 0) break;
          let _g7592 = 0;
          G7593: {
            const _a7594 = sp.cellEdges[_t7576];
            for (let _i7595 = 0; _i7595 < _a7594.length; _i7595++) {
              const v_x = _a7594[_i7595];
              if (!((_f7580[v_x] === 1))) continue;
              _g7592++;
            }
          }
          if (!((_g7592 === (_k7591[_t7576] ?? arms(sp, cl, _t7576))))) continue;
          if (true) {
            _q7577 = true;
            break Q7578;
          }
        }
      }
      let _c7615: boolean = _q7577;
      if (_c7615) {
        const _t7596 = sp.edgeEnds[2 * v_e + 1];
        let _q7597 = false;
        Q7598: {
          const _a7599 = sp.cellEdges[_t7596];
          for (const _e7603 of _l7601) _f7600[_e7603] = -1;
          _l7601 = _a7599;
          let _i7605 = 0;
          _s7602[0] = 0;
          let _o7609 = _a7599.length === 0;
          for (;;) {
            if (_a7599.length === 0) {
              if (!_o7609) break;
              _o7609 = false;
            }
            while (_a7599.length > 0 && _i7605 >= 0) {
              const _e7603 = _a7599[_i7605];
              if (_s7602[_i7605] > 0) _f7600[_e7603] = -1;
              let _r7608 = (cands[_e7603] >= 0 ? cands[_e7603] : (cands[_e7603] = b.cands[_e7603])) & ~((2 << _s7602[_i7605]) - 1);
              let _d7604 = 0;
              V7607: for (; _r7608 !== 0; _r7608 &= _r7608 - 1) {
                _d7604 = 31 - Math.clz32(_r7608 & -_r7608);
                _f7600[_e7603] = _d7604;
                if (_e7603 === v_e && _d7604 !== 1) continue;
                for (let _j7606 = 0; _j7606 < _i7605; _j7606++) {
                  const _y7610 = _a7599[_j7606];
                  if (!(((((_k7591[_t7596] ?? arms(sp, cl, _t7596)) === 2) && (_f7600[_e7603] === 1)) && (_f7600[_y7610] === 1)))) continue;
                  if (!((bent(sp, _e7603, _y7610) === (clueAt(cl.piece, _t7596) === 3)))) continue V7607;
                }
                break;
              }
              if (_r7608 === 0) {
                _s7602[_i7605] = 0;
                _i7605--;
                continue;
              }
              _s7602[_i7605] = _d7604;
              if (_i7605 === _a7599.length - 1) break;
              _i7605++;
              _s7602[_i7605] = 0;
            }
            if (_i7605 < 0) break;
            let _g7611 = 0;
            G7612: {
              const _a7613 = sp.cellEdges[_t7596];
              for (let _i7614 = 0; _i7614 < _a7613.length; _i7614++) {
                const v_x = _a7613[_i7614];
                if (!((_f7600[v_x] === 1))) continue;
                _g7611++;
              }
            }
            if (!((_g7611 === (_k7591[_t7596] ?? arms(sp, cl, _t7596))))) continue;
            if (true) {
              _q7597 = true;
              break Q7598;
            }
          }
        }
        _c7615 = _q7597;
      }
      if (!(_c7615)) continue;
      _g7531.push(v_e);
    }
  }
  const v_U = _g7531;
  const _mm7795 = memberMarks(v_U);
  _g7616.length = 0;
  G7617: {
    const _a7620 = v_U;
    for (let _i7621 = 0; _i7621 < _a7620.length; _i7621++) {
      const v_e = _a7620[_i7621];
      if (!((((_k7591[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k7591[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g7616.push(v_e);
    }
  }
  const v_P = _g7616;
  const _a7622 = sp.cells;
  for (let _i7623 = 0; _i7623 < _a7622.length; _i7623++) {
    const v_c = _a7622[_i7623];
    const _h7774 = minus(v_P, sp.cellEdges[v_c]);
    let _q7624 = false;
    Q7625: {
      const _a7626 = sp.cellEdges[v_c];
      for (let _i7627 = 0; _i7627 < _a7626.length; _i7627++) {
        const v_e = _a7626[_i7627];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q7624 = true;
          break Q7625;
        }
      }
    }
    if (!(_q7624)) continue;
    const v_G = _eg7628.of(v_c);
    _g7629.length = 0;
    G7630: {
      const _a7710 = sp.cellEdges[v_c];
      for (let _i7711 = 0; _i7711 < _a7710.length; _i7711++) {
        const v_x = _a7710[_i7711];
        const _t7712 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h7775 = minus(_h7774, sp.cellEdges[_t7712]);
        const _eg7777 = edgeGroups(sp, _h7775);
        const _memo7780 = new Map<readonly number[], readonly number[]>();
        _g7713.length = 0;
        _st7752.pass++;
        G7714: {
          const _a7753 = sp.cellEdges[_t7712];
          for (let _i7754 = 0; _i7754 < _a7753.length; _i7754++) {
            const v_y = _a7753[_i7754];
            let _c7773: boolean = (v_y !== v_x);
            if (_c7773) {
              let _q7755 = false;
              Q7756: {
                const _a7757 = sp.cellEdges[_t7712];
                for (const _e7761 of _l7759) _f7758[_e7761] = -1;
                _l7759 = _a7757;
                let _i7763 = 0;
                _s7760[0] = 0;
                let _o7767 = _a7757.length === 0;
                for (;;) {
                  if (_a7757.length === 0) {
                    if (!_o7767) break;
                    _o7767 = false;
                  }
                  while (_a7757.length > 0 && _i7763 >= 0) {
                    const _e7761 = _a7757[_i7763];
                    if (_s7760[_i7763] > 0) _f7758[_e7761] = -1;
                    let _r7766 = (cands[_e7761] >= 0 ? cands[_e7761] : (cands[_e7761] = b.cands[_e7761])) & ~((2 << _s7760[_i7763]) - 1);
                    let _d7762 = 0;
                    V7765: for (; _r7766 !== 0; _r7766 &= _r7766 - 1) {
                      _d7762 = 31 - Math.clz32(_r7766 & -_r7766);
                      _f7758[_e7761] = _d7762;
                      if (_e7761 === v_x && _d7762 !== 1) continue;
                      if (_e7761 === v_y && _d7762 !== 1) continue;
                      for (let _j7764 = 0; _j7764 < _i7763; _j7764++) {
                        const _y7768 = _a7757[_j7764];
                        if (!(((((_k7591[_t7712] ?? arms(sp, cl, _t7712)) === 2) && (_f7758[_e7761] === 1)) && (_f7758[_y7768] === 1)))) continue;
                        if (!((bent(sp, _e7761, _y7768) === (clueAt(cl.piece, _t7712) === 3)))) continue V7765;
                      }
                      break;
                    }
                    if (_r7766 === 0) {
                      _s7760[_i7763] = 0;
                      _i7763--;
                      continue;
                    }
                    _s7760[_i7763] = _d7762;
                    if (_i7763 === _a7757.length - 1) break;
                    _i7763++;
                    _s7760[_i7763] = 0;
                  }
                  if (_i7763 < 0) break;
                  let _g7769 = 0;
                  G7770: {
                    const _a7771 = sp.cellEdges[_t7712];
                    for (let _i7772 = 0; _i7772 < _a7771.length; _i7772++) {
                      const v_z = _a7771[_i7772];
                      if (!((_f7758[v_z] === 1))) continue;
                      _g7769++;
                    }
                  }
                  if (!((_g7769 === (_k7591[_t7712] ?? arms(sp, cl, _t7712))))) continue;
                  if (true) {
                    _q7755 = true;
                    break Q7756;
                  }
                }
              }
              _c7773 = _q7755;
            }
            if (!(_c7773)) continue;
            const _t7776 = (sp.edgeEnds[2 * v_y] === _t7712 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t7779 = _eg7777.of(_t7776);
            let _gs7781 = _memo7780.get(_t7779);
            if (_gs7781 === undefined) {
              _g7782.length = 0;
              _st7789.pass++;
              G7783: {
                const _a7790 = _t7779;
                for (let _i7791 = 0; _i7791 < _a7790.length; _i7791++) {
                  const v_t = _a7790[_i7791];
                  if (!(((_k7591[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a7792 = sp.cellEdges[v_t];
                  for (let _i7793 = 0; _i7793 < _a7792.length; _i7793++) {
                    const v_y = _a7792[_i7793];
                    L7794: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k7591[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7795[v_y + 1] === 1)))) break L7794;
                      const _t7796 = v_z;
                      if (_g7782.length < 16) { if (!_g7782.includes(_t7796)) _g7782.push(_t7796); } else addOnce(_g7782, _st7789, _t7796);
                    }
                  }
                }
              }
              _gs7781 = _g7782.slice();
              _memo7780.set(_t7779, _gs7781);
            }
            const _a7797 = union(_eg7777.of(_t7776), _gs7781);
            for (let _i7798 = 0; _i7798 < _a7797.length; _i7798++) {
              const v_t = _a7797[_i7798];
              const _t7799 = v_t;
              if (_g7713.length < 16) { if (!_g7713.includes(_t7799)) _g7713.push(_t7799); } else addOnce(_g7713, _st7752, _t7799);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t7712), _g7713)).length >= _h7800))) continue;
        _g7629.push(v_x);
      }
    }
    const v_K = _g7629;
    let _g7806 = -1;
    let _g8061 = -1;
    const _a7801 = sp.cellEdges[v_c];
    for (let _i7802 = 0; _i7802 < _a7801.length; _i7802++) {
      const v_e = _a7801[_i7802];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g7806 !== _epoch) {
        _g7806 = _epoch;
        for (const _e7807 of _l7804) _p7803[_e7807] = 0;
        _y7805 = false;
        const _a7808 = sp.cellEdges[v_c];
        for (const _e7812 of _l7810) _f7809[_e7812] = -1;
        _l7810 = _a7808;
        let _i7814 = 0;
        _s7811[0] = 0;
        let _o7818 = _a7808.length === 0;
        for (;;) {
          if (_a7808.length === 0) {
            if (!_o7818) break;
            _o7818 = false;
          }
          while (_a7808.length > 0 && _i7814 >= 0) {
            const _e7812 = _a7808[_i7814];
            if (_s7811[_i7814] > 0) _f7809[_e7812] = -1;
            let _r7817 = (cands[_e7812] >= 0 ? cands[_e7812] : (cands[_e7812] = b.cands[_e7812])) & ~((2 << _s7811[_i7814]) - 1);
            let _d7813 = 0;
            V7816: for (; _r7817 !== 0; _r7817 &= _r7817 - 1) {
              _d7813 = 31 - Math.clz32(_r7817 & -_r7817);
              _f7809[_e7812] = _d7813;
              for (let _j7815 = 0; _j7815 < _i7814; _j7815++) {
                const _y7819 = _a7808[_j7815];
                if (!(((((_k7591[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f7809[_e7812] === 1)) && (_f7809[_y7819] === 1)))) continue;
                if (!((bent(sp, _e7812, _y7819) === (clueAt(cl.piece, v_c) === 3)))) continue V7816;
              }
              for (let _j7815 = 0; _j7815 < _i7814; _j7815++) {
                const _y7820 = _a7808[_j7815];
                if (!(((((_f7809[_e7812] === 1) && (_f7809[_y7820] === 1)) && !((b.grid[_e7812] !== 0))) && !((b.grid[_y7820] !== 0))))) continue;
                if (!(!(_eg7628.of((sp.edgeEnds[2 * _y7820] === v_c ? sp.edgeEnds[2 * _y7820 + 1] : sp.edgeEnds[2 * _y7820])) === _eg7628.of((sp.edgeEnds[2 * _e7812] === v_c ? sp.edgeEnds[2 * _e7812 + 1] : sp.edgeEnds[2 * _e7812]))))) continue V7816;
              }
              break;
            }
            if (_r7817 === 0) {
              _s7811[_i7814] = 0;
              _i7814--;
              continue;
            }
            _s7811[_i7814] = _d7813;
            if (_i7814 === _a7808.length - 1) break;
            _i7814++;
            _s7811[_i7814] = 0;
          }
          if (_i7814 < 0) break;
          let _g7821 = 0;
          G7822: {
            const _a7823 = sp.cellEdges[v_c];
            for (let _i7824 = 0; _i7824 < _a7823.length; _i7824++) {
              const v_x = _a7823[_i7824];
              if (!((_f7809[v_x] === 1))) continue;
              _g7821++;
            }
          }
          let _c7829: boolean = (_g7821 === (_k7591[v_c] ?? arms(sp, cl, v_c)));
          if (_c7829) {
            let _q7825 = true;
            Q7826: {
              const _a7827 = sp.cellEdges[v_c];
              for (let _i7828 = 0; _i7828 < _a7827.length; _i7828++) {
                const v_x = _a7827[_i7828];
                if (!(((_f7809[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg7628.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q7825 = false;
                  break Q7826;
                }
              }
            }
            _c7829 = _q7825;
          }
          let _c8010: boolean = _c7829;
          if (_c8010) {
            let _q7830 = false;
            Q7831: {
              const _a7832 = sp.cellEdges[v_c];
              for (let _i7833 = 0; _i7833 < _a7832.length; _i7833++) {
                const v_x = _a7832[_i7833];
                if (!((_f7809[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q7830 = true;
                  break Q7831;
                }
              }
            }
            let _c8009: boolean = _q7830;
            if (!_c8009) {
              _g7834.length = 0;
              _st7917.pass++;
              G7835: {
                const _a7918 = sp.cellEdges[v_c];
                for (let _i7919 = 0; _i7919 < _a7918.length; _i7919++) {
                  const v_x = _a7918[_i7919];
                  if (!((_f7809[v_x] === 1))) continue;
                  const _t7920 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h7982 = minus(_h7774, sp.cellEdges[_t7920]);
                  const _eg7984 = edgeGroups(sp, _h7982);
                  const _memo7987 = new Map<readonly number[], readonly number[]>();
                  _g7921.length = 0;
                  _st7960.pass++;
                  G7922: {
                    const _a7961 = sp.cellEdges[_t7920];
                    for (let _i7962 = 0; _i7962 < _a7961.length; _i7962++) {
                      const v_y = _a7961[_i7962];
                      let _c7981: boolean = (v_y !== v_x);
                      if (_c7981) {
                        let _q7963 = false;
                        Q7964: {
                          const _a7965 = sp.cellEdges[_t7920];
                          for (const _e7969 of _l7967) _f7966[_e7969] = -1;
                          _l7967 = _a7965;
                          let _i7971 = 0;
                          _s7968[0] = 0;
                          let _o7975 = _a7965.length === 0;
                          for (;;) {
                            if (_a7965.length === 0) {
                              if (!_o7975) break;
                              _o7975 = false;
                            }
                            while (_a7965.length > 0 && _i7971 >= 0) {
                              const _e7969 = _a7965[_i7971];
                              if (_s7968[_i7971] > 0) _f7966[_e7969] = -1;
                              let _r7974 = (cands[_e7969] >= 0 ? cands[_e7969] : (cands[_e7969] = b.cands[_e7969])) & ~((2 << _s7968[_i7971]) - 1);
                              let _d7970 = 0;
                              V7973: for (; _r7974 !== 0; _r7974 &= _r7974 - 1) {
                                _d7970 = 31 - Math.clz32(_r7974 & -_r7974);
                                _f7966[_e7969] = _d7970;
                                if (_e7969 === v_x && _d7970 !== 1) continue;
                                if (_e7969 === v_y && _d7970 !== 1) continue;
                                for (let _j7972 = 0; _j7972 < _i7971; _j7972++) {
                                  const _y7976 = _a7965[_j7972];
                                  if (!(((((_k7591[_t7920] ?? arms(sp, cl, _t7920)) === 2) && (_f7966[_e7969] === 1)) && (_f7966[_y7976] === 1)))) continue;
                                  if (!((bent(sp, _e7969, _y7976) === (clueAt(cl.piece, _t7920) === 3)))) continue V7973;
                                }
                                break;
                              }
                              if (_r7974 === 0) {
                                _s7968[_i7971] = 0;
                                _i7971--;
                                continue;
                              }
                              _s7968[_i7971] = _d7970;
                              if (_i7971 === _a7965.length - 1) break;
                              _i7971++;
                              _s7968[_i7971] = 0;
                            }
                            if (_i7971 < 0) break;
                            let _g7977 = 0;
                            G7978: {
                              const _a7979 = sp.cellEdges[_t7920];
                              for (let _i7980 = 0; _i7980 < _a7979.length; _i7980++) {
                                const v_z = _a7979[_i7980];
                                if (!((_f7966[v_z] === 1))) continue;
                                _g7977++;
                              }
                            }
                            if (!((_g7977 === (_k7591[_t7920] ?? arms(sp, cl, _t7920))))) continue;
                            if (true) {
                              _q7963 = true;
                              break Q7964;
                            }
                          }
                        }
                        _c7981 = _q7963;
                      }
                      if (!(_c7981)) continue;
                      const _t7983 = (sp.edgeEnds[2 * v_y] === _t7920 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t7986 = _eg7984.of(_t7983);
                      let _gs7988 = _memo7987.get(_t7986);
                      if (_gs7988 === undefined) {
                        _g7989.length = 0;
                        _st7996.pass++;
                        G7990: {
                          const _a7997 = _t7986;
                          for (let _i7998 = 0; _i7998 < _a7997.length; _i7998++) {
                            const v_t = _a7997[_i7998];
                            if (!(((_k7591[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a7999 = sp.cellEdges[v_t];
                            for (let _i8000 = 0; _i8000 < _a7999.length; _i8000++) {
                              const v_y = _a7999[_i8000];
                              L8001: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k7591[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7795[v_y + 1] === 1)))) break L8001;
                                const _t8002 = v_z;
                                if (_g7989.length < 16) { if (!_g7989.includes(_t8002)) _g7989.push(_t8002); } else addOnce(_g7989, _st7996, _t8002);
                              }
                            }
                          }
                        }
                        _gs7988 = _g7989.slice();
                        _memo7987.set(_t7986, _gs7988);
                      }
                      const _a8003 = union(_eg7984.of(_t7983), _gs7988);
                      for (let _i8004 = 0; _i8004 < _a8003.length; _i8004++) {
                        const v_t = _a8003[_i8004];
                        const _t8005 = v_t;
                        if (_g7921.length < 16) { if (!_g7921.includes(_t8005)) _g7921.push(_t8005); } else addOnce(_g7921, _st7960, _t8005);
                      }
                    }
                  }
                  const _a8006 = union(setOf(_t7920), _g7921);
                  for (let _i8007 = 0; _i8007 < _a8006.length; _i8007++) {
                    const v_t = _a8006[_i8007];
                    const _t8008 = v_t;
                    if (_g7834.length < 16) { if (!_g7834.includes(_t8008)) _g7834.push(_t8008); } else addOnce(_g7834, _st7917, _t8008);
                  }
                }
              }
              _c8009 = (union(setOf(v_c), _g7834).length >= _h7800);
            }
            _c8010 = _c8009;
          }
          let _c8057: boolean = _c8010;
          if (_c8057) {
            let _q8011 = true;
            Q8012: {
              _g8013.length = 0;
              G8014: {
                const _a8017 = sp.cellEdges[v_c];
                for (let _i8018 = 0; _i8018 < _a8017.length; _i8018++) {
                  const v_x = _a8017[_i8018];
                  if (!((_f7809[v_x] === 1))) continue;
                  _g8013.push(v_x);
                }
              }
              const v_M = union(v_L, _g8013);
              const _eg8042 = edgeGroups(sp, v_M);
              const _a8019 = sp.cellEdges[v_c];
              for (let _i8020 = 0; _i8020 < _a8019.length; _i8020++) {
                const v_x = _a8019[_i8020];
                L8021: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c8026: boolean = (v_j !== v_c);
                  if (_c8026) {
                    let _q8022 = false;
                    Q8023: {
                      const _a8024 = sp.cellEdges[v_j];
                      for (let _i8025 = 0; _i8025 < _a8024.length; _i8025++) {
                        const v_y = _a8024[_i8025];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q8022 = true;
                          break Q8023;
                        }
                      }
                    }
                    _c8026 = _q8022;
                  }
                  if (!(_c8026)) break L8021;
                  let _q8027 = false;
                  Q8028: {
                    const _a8029 = sp.cellEdges[v_j];
                    for (const _e8033 of _l8031) _f8030[_e8033] = -1;
                    _l8031 = _a8029;
                    let _i8035 = 0;
                    _s8032[0] = 0;
                    let _o8039 = _a8029.length === 0;
                    for (;;) {
                      if (_a8029.length === 0) {
                        if (!_o8039) break;
                        _o8039 = false;
                      }
                      while (_a8029.length > 0 && _i8035 >= 0) {
                        const _e8033 = _a8029[_i8035];
                        if (_s8032[_i8035] > 0) _f8030[_e8033] = -1;
                        let _r8038 = (cands[_e8033] >= 0 ? cands[_e8033] : (cands[_e8033] = b.cands[_e8033])) & ~((2 << _s8032[_i8035]) - 1);
                        let _d8034 = 0;
                        V8037: for (; _r8038 !== 0; _r8038 &= _r8038 - 1) {
                          _d8034 = 31 - Math.clz32(_r8038 & -_r8038);
                          _f8030[_e8033] = _d8034;
                          for (let _j8036 = 0; _j8036 < _i8035; _j8036++) {
                            const _y8040 = _a8029[_j8036];
                            if (!(((((_k7591[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f8030[_e8033] === 1)) && (_f8030[_y8040] === 1)))) continue;
                            if (!((bent(sp, _e8033, _y8040) === (clueAt(cl.piece, v_j) === 3)))) continue V8037;
                          }
                          for (let _j8036 = 0; _j8036 < _i8035; _j8036++) {
                            const _y8041 = _a8029[_j8036];
                            if (!(((((((_f8030[_e8033] === 1) && (_f8030[_y8041] === 1)) && !((b.grid[_e8033] !== 0))) && !((b.grid[_y8041] !== 0))) && !([sp.edgeEnds[2 * _e8033], sp.edgeEnds[2 * _e8033 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y8041], sp.edgeEnds[2 * _y8041 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8042.of((sp.edgeEnds[2 * _y8041] === v_j ? sp.edgeEnds[2 * _y8041 + 1] : sp.edgeEnds[2 * _y8041])) === _eg8042.of((sp.edgeEnds[2 * _e8033] === v_j ? sp.edgeEnds[2 * _e8033 + 1] : sp.edgeEnds[2 * _e8033]))))) continue V8037;
                          }
                          break;
                        }
                        if (_r8038 === 0) {
                          _s8032[_i8035] = 0;
                          _i8035--;
                          continue;
                        }
                        _s8032[_i8035] = _d8034;
                        if (_i8035 === _a8029.length - 1) break;
                        _i8035++;
                        _s8032[_i8035] = 0;
                      }
                      if (_i8035 < 0) break;
                      let _q8043 = true;
                      Q8044: {
                        const _a8045 = sp.cellEdges[v_j];
                        for (let _i8046 = 0; _i8046 < _a8045.length; _i8046++) {
                          const v_y = _a8045[_i8046];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f8030[v_y] === _f7809[v_y]))) {
                            _q8043 = false;
                            break Q8044;
                          }
                        }
                      }
                      let _c8051: boolean = _q8043;
                      if (_c8051) {
                        let _g8047 = 0;
                        G8048: {
                          const _a8049 = sp.cellEdges[v_j];
                          for (let _i8050 = 0; _i8050 < _a8049.length; _i8050++) {
                            const v_y = _a8049[_i8050];
                            if (!((_f8030[v_y] === 1))) continue;
                            _g8047++;
                          }
                        }
                        _c8051 = (_g8047 === (_k7591[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c8056: boolean = _c8051;
                      if (_c8056) {
                        let _q8052 = true;
                        Q8053: {
                          const _a8054 = sp.cellEdges[v_j];
                          for (let _i8055 = 0; _i8055 < _a8054.length; _i8055++) {
                            const v_y = _a8054[_i8055];
                            if (!((((_f8030[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8042.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg8042.of(v_j)))) {
                              _q8052 = false;
                              break Q8053;
                            }
                          }
                        }
                        _c8056 = _q8052;
                      }
                      if (!(_c8056)) continue;
                      if (true) {
                        _q8027 = true;
                        break Q8028;
                      }
                    }
                  }
                  if (!(_q8027)) {
                    _q8011 = false;
                    break Q8012;
                  }
                }
              }
            }
            _c8057 = _q8011;
          }
          if (!(_c8057)) continue;
          if (!(true)) continue;
          _l7804 = _a7808;
          _y7805 = true;
          for (const _e7807 of _a7808) _p7803[_e7807] |= 1 << _f7809[_e7807];
        }
      }
      const v_A = ((((_p7803[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y7805 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g8061 !== _epoch) {
        _g8061 = _epoch;
        for (const _e8062 of _l8059) _p8058[_e8062] = 0;
        _y8060 = false;
        const _a8063 = sp.cellEdges[v_c];
        for (const _e8067 of _l8065) _f8064[_e8067] = -1;
        _l8065 = _a8063;
        let _i8069 = 0;
        _s8066[0] = 0;
        let _o8073 = _a8063.length === 0;
        for (;;) {
          if (_a8063.length === 0) {
            if (!_o8073) break;
            _o8073 = false;
          }
          while (_a8063.length > 0 && _i8069 >= 0) {
            const _e8067 = _a8063[_i8069];
            if (_s8066[_i8069] > 0) _f8064[_e8067] = -1;
            let _r8072 = (cands[_e8067] >= 0 ? cands[_e8067] : (cands[_e8067] = b.cands[_e8067])) & ~((2 << _s8066[_i8069]) - 1);
            let _d8068 = 0;
            V8071: for (; _r8072 !== 0; _r8072 &= _r8072 - 1) {
              _d8068 = 31 - Math.clz32(_r8072 & -_r8072);
              _f8064[_e8067] = _d8068;
              for (let _j8070 = 0; _j8070 < _i8069; _j8070++) {
                const _y8074 = _a8063[_j8070];
                if (!(((((_k7591[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f8064[_e8067] === 1)) && (_f8064[_y8074] === 1)))) continue;
                if (!((bent(sp, _e8067, _y8074) === (clueAt(cl.piece, v_c) === 3)))) continue V8071;
              }
              for (let _j8070 = 0; _j8070 < _i8069; _j8070++) {
                const _y8075 = _a8063[_j8070];
                if (!(((((_f8064[_e8067] === 1) && (_f8064[_y8075] === 1)) && !((b.grid[_e8067] !== 0))) && !((b.grid[_y8075] !== 0))))) continue;
                if (!(!(_eg7628.of((sp.edgeEnds[2 * _y8075] === v_c ? sp.edgeEnds[2 * _y8075 + 1] : sp.edgeEnds[2 * _y8075])) === _eg7628.of((sp.edgeEnds[2 * _e8067] === v_c ? sp.edgeEnds[2 * _e8067 + 1] : sp.edgeEnds[2 * _e8067]))))) continue V8071;
              }
              break;
            }
            if (_r8072 === 0) {
              _s8066[_i8069] = 0;
              _i8069--;
              continue;
            }
            _s8066[_i8069] = _d8068;
            if (_i8069 === _a8063.length - 1) break;
            _i8069++;
            _s8066[_i8069] = 0;
          }
          if (_i8069 < 0) break;
          let _g8076 = 0;
          G8077: {
            const _a8078 = sp.cellEdges[v_c];
            for (let _i8079 = 0; _i8079 < _a8078.length; _i8079++) {
              const v_x = _a8078[_i8079];
              if (!((_f8064[v_x] === 1))) continue;
              _g8076++;
            }
          }
          let _c8084: boolean = (_g8076 === (_k7591[v_c] ?? arms(sp, cl, v_c)));
          if (_c8084) {
            let _q8080 = true;
            Q8081: {
              const _a8082 = sp.cellEdges[v_c];
              for (let _i8083 = 0; _i8083 < _a8082.length; _i8083++) {
                const v_x = _a8082[_i8083];
                if (!(((_f8064[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg7628.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q8080 = false;
                  break Q8081;
                }
              }
            }
            _c8084 = _q8080;
          }
          let _c8265: boolean = _c8084;
          if (_c8265) {
            let _q8085 = false;
            Q8086: {
              const _a8087 = sp.cellEdges[v_c];
              for (let _i8088 = 0; _i8088 < _a8087.length; _i8088++) {
                const v_x = _a8087[_i8088];
                if (!((_f8064[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q8085 = true;
                  break Q8086;
                }
              }
            }
            let _c8264: boolean = _q8085;
            if (!_c8264) {
              _g8089.length = 0;
              _st8172.pass++;
              G8090: {
                const _a8173 = sp.cellEdges[v_c];
                for (let _i8174 = 0; _i8174 < _a8173.length; _i8174++) {
                  const v_x = _a8173[_i8174];
                  if (!((_f8064[v_x] === 1))) continue;
                  const _t8175 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h8237 = minus(_h7774, sp.cellEdges[_t8175]);
                  const _eg8239 = edgeGroups(sp, _h8237);
                  const _memo8242 = new Map<readonly number[], readonly number[]>();
                  _g8176.length = 0;
                  _st8215.pass++;
                  G8177: {
                    const _a8216 = sp.cellEdges[_t8175];
                    for (let _i8217 = 0; _i8217 < _a8216.length; _i8217++) {
                      const v_y = _a8216[_i8217];
                      let _c8236: boolean = (v_y !== v_x);
                      if (_c8236) {
                        let _q8218 = false;
                        Q8219: {
                          const _a8220 = sp.cellEdges[_t8175];
                          for (const _e8224 of _l8222) _f8221[_e8224] = -1;
                          _l8222 = _a8220;
                          let _i8226 = 0;
                          _s8223[0] = 0;
                          let _o8230 = _a8220.length === 0;
                          for (;;) {
                            if (_a8220.length === 0) {
                              if (!_o8230) break;
                              _o8230 = false;
                            }
                            while (_a8220.length > 0 && _i8226 >= 0) {
                              const _e8224 = _a8220[_i8226];
                              if (_s8223[_i8226] > 0) _f8221[_e8224] = -1;
                              let _r8229 = (cands[_e8224] >= 0 ? cands[_e8224] : (cands[_e8224] = b.cands[_e8224])) & ~((2 << _s8223[_i8226]) - 1);
                              let _d8225 = 0;
                              V8228: for (; _r8229 !== 0; _r8229 &= _r8229 - 1) {
                                _d8225 = 31 - Math.clz32(_r8229 & -_r8229);
                                _f8221[_e8224] = _d8225;
                                if (_e8224 === v_x && _d8225 !== 1) continue;
                                if (_e8224 === v_y && _d8225 !== 1) continue;
                                for (let _j8227 = 0; _j8227 < _i8226; _j8227++) {
                                  const _y8231 = _a8220[_j8227];
                                  if (!(((((_k7591[_t8175] ?? arms(sp, cl, _t8175)) === 2) && (_f8221[_e8224] === 1)) && (_f8221[_y8231] === 1)))) continue;
                                  if (!((bent(sp, _e8224, _y8231) === (clueAt(cl.piece, _t8175) === 3)))) continue V8228;
                                }
                                break;
                              }
                              if (_r8229 === 0) {
                                _s8223[_i8226] = 0;
                                _i8226--;
                                continue;
                              }
                              _s8223[_i8226] = _d8225;
                              if (_i8226 === _a8220.length - 1) break;
                              _i8226++;
                              _s8223[_i8226] = 0;
                            }
                            if (_i8226 < 0) break;
                            let _g8232 = 0;
                            G8233: {
                              const _a8234 = sp.cellEdges[_t8175];
                              for (let _i8235 = 0; _i8235 < _a8234.length; _i8235++) {
                                const v_z = _a8234[_i8235];
                                if (!((_f8221[v_z] === 1))) continue;
                                _g8232++;
                              }
                            }
                            if (!((_g8232 === (_k7591[_t8175] ?? arms(sp, cl, _t8175))))) continue;
                            if (true) {
                              _q8218 = true;
                              break Q8219;
                            }
                          }
                        }
                        _c8236 = _q8218;
                      }
                      if (!(_c8236)) continue;
                      const _t8238 = (sp.edgeEnds[2 * v_y] === _t8175 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t8241 = _eg8239.of(_t8238);
                      let _gs8243 = _memo8242.get(_t8241);
                      if (_gs8243 === undefined) {
                        _g8244.length = 0;
                        _st8251.pass++;
                        G8245: {
                          const _a8252 = _t8241;
                          for (let _i8253 = 0; _i8253 < _a8252.length; _i8253++) {
                            const v_t = _a8252[_i8253];
                            if (!(((_k7591[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a8254 = sp.cellEdges[v_t];
                            for (let _i8255 = 0; _i8255 < _a8254.length; _i8255++) {
                              const v_y = _a8254[_i8255];
                              L8256: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k7591[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7795[v_y + 1] === 1)))) break L8256;
                                const _t8257 = v_z;
                                if (_g8244.length < 16) { if (!_g8244.includes(_t8257)) _g8244.push(_t8257); } else addOnce(_g8244, _st8251, _t8257);
                              }
                            }
                          }
                        }
                        _gs8243 = _g8244.slice();
                        _memo8242.set(_t8241, _gs8243);
                      }
                      const _a8258 = union(_eg8239.of(_t8238), _gs8243);
                      for (let _i8259 = 0; _i8259 < _a8258.length; _i8259++) {
                        const v_t = _a8258[_i8259];
                        const _t8260 = v_t;
                        if (_g8176.length < 16) { if (!_g8176.includes(_t8260)) _g8176.push(_t8260); } else addOnce(_g8176, _st8215, _t8260);
                      }
                    }
                  }
                  const _a8261 = union(setOf(_t8175), _g8176);
                  for (let _i8262 = 0; _i8262 < _a8261.length; _i8262++) {
                    const v_t = _a8261[_i8262];
                    const _t8263 = v_t;
                    if (_g8089.length < 16) { if (!_g8089.includes(_t8263)) _g8089.push(_t8263); } else addOnce(_g8089, _st8172, _t8263);
                  }
                }
              }
              _c8264 = (union(setOf(v_c), _g8089).length >= _h7800);
            }
            _c8265 = _c8264;
          }
          let _c8312: boolean = _c8265;
          if (_c8312) {
            let _q8266 = true;
            Q8267: {
              _g8268.length = 0;
              G8269: {
                const _a8272 = sp.cellEdges[v_c];
                for (let _i8273 = 0; _i8273 < _a8272.length; _i8273++) {
                  const v_x = _a8272[_i8273];
                  if (!((_f8064[v_x] === 1))) continue;
                  _g8268.push(v_x);
                }
              }
              const v_M = union(v_L, _g8268);
              const _eg8297 = edgeGroups(sp, v_M);
              const _a8274 = sp.cellEdges[v_c];
              for (let _i8275 = 0; _i8275 < _a8274.length; _i8275++) {
                const v_x = _a8274[_i8275];
                L8276: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c8281: boolean = (v_j !== v_c);
                  if (_c8281) {
                    let _q8277 = false;
                    Q8278: {
                      const _a8279 = sp.cellEdges[v_j];
                      for (let _i8280 = 0; _i8280 < _a8279.length; _i8280++) {
                        const v_y = _a8279[_i8280];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q8277 = true;
                          break Q8278;
                        }
                      }
                    }
                    _c8281 = _q8277;
                  }
                  if (!(_c8281)) break L8276;
                  let _q8282 = false;
                  Q8283: {
                    const _a8284 = sp.cellEdges[v_j];
                    for (const _e8288 of _l8286) _f8285[_e8288] = -1;
                    _l8286 = _a8284;
                    let _i8290 = 0;
                    _s8287[0] = 0;
                    let _o8294 = _a8284.length === 0;
                    for (;;) {
                      if (_a8284.length === 0) {
                        if (!_o8294) break;
                        _o8294 = false;
                      }
                      while (_a8284.length > 0 && _i8290 >= 0) {
                        const _e8288 = _a8284[_i8290];
                        if (_s8287[_i8290] > 0) _f8285[_e8288] = -1;
                        let _r8293 = (cands[_e8288] >= 0 ? cands[_e8288] : (cands[_e8288] = b.cands[_e8288])) & ~((2 << _s8287[_i8290]) - 1);
                        let _d8289 = 0;
                        V8292: for (; _r8293 !== 0; _r8293 &= _r8293 - 1) {
                          _d8289 = 31 - Math.clz32(_r8293 & -_r8293);
                          _f8285[_e8288] = _d8289;
                          for (let _j8291 = 0; _j8291 < _i8290; _j8291++) {
                            const _y8295 = _a8284[_j8291];
                            if (!(((((_k7591[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f8285[_e8288] === 1)) && (_f8285[_y8295] === 1)))) continue;
                            if (!((bent(sp, _e8288, _y8295) === (clueAt(cl.piece, v_j) === 3)))) continue V8292;
                          }
                          for (let _j8291 = 0; _j8291 < _i8290; _j8291++) {
                            const _y8296 = _a8284[_j8291];
                            if (!(((((((_f8285[_e8288] === 1) && (_f8285[_y8296] === 1)) && !((b.grid[_e8288] !== 0))) && !((b.grid[_y8296] !== 0))) && !([sp.edgeEnds[2 * _e8288], sp.edgeEnds[2 * _e8288 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y8296], sp.edgeEnds[2 * _y8296 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8297.of((sp.edgeEnds[2 * _y8296] === v_j ? sp.edgeEnds[2 * _y8296 + 1] : sp.edgeEnds[2 * _y8296])) === _eg8297.of((sp.edgeEnds[2 * _e8288] === v_j ? sp.edgeEnds[2 * _e8288 + 1] : sp.edgeEnds[2 * _e8288]))))) continue V8292;
                          }
                          break;
                        }
                        if (_r8293 === 0) {
                          _s8287[_i8290] = 0;
                          _i8290--;
                          continue;
                        }
                        _s8287[_i8290] = _d8289;
                        if (_i8290 === _a8284.length - 1) break;
                        _i8290++;
                        _s8287[_i8290] = 0;
                      }
                      if (_i8290 < 0) break;
                      let _q8298 = true;
                      Q8299: {
                        const _a8300 = sp.cellEdges[v_j];
                        for (let _i8301 = 0; _i8301 < _a8300.length; _i8301++) {
                          const v_y = _a8300[_i8301];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f8285[v_y] === _f8064[v_y]))) {
                            _q8298 = false;
                            break Q8299;
                          }
                        }
                      }
                      let _c8306: boolean = _q8298;
                      if (_c8306) {
                        let _g8302 = 0;
                        G8303: {
                          const _a8304 = sp.cellEdges[v_j];
                          for (let _i8305 = 0; _i8305 < _a8304.length; _i8305++) {
                            const v_y = _a8304[_i8305];
                            if (!((_f8285[v_y] === 1))) continue;
                            _g8302++;
                          }
                        }
                        _c8306 = (_g8302 === (_k7591[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c8311: boolean = _c8306;
                      if (_c8311) {
                        let _q8307 = true;
                        Q8308: {
                          const _a8309 = sp.cellEdges[v_j];
                          for (let _i8310 = 0; _i8310 < _a8309.length; _i8310++) {
                            const v_y = _a8309[_i8310];
                            if (!((((_f8285[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8297.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg8297.of(v_j)))) {
                              _q8307 = false;
                              break Q8308;
                            }
                          }
                        }
                        _c8311 = _q8307;
                      }
                      if (!(_c8311)) continue;
                      if (true) {
                        _q8282 = true;
                        break Q8283;
                      }
                    }
                  }
                  if (!(_q8282)) {
                    _q8266 = false;
                    break Q8267;
                  }
                }
              }
            }
            _c8312 = _q8266;
          }
          if (!(_c8312)) continue;
          if (!(true)) continue;
          _l8059 = _a8063;
          _y8060 = true;
          for (const _e8062 of _a8063) _p8058[_e8062] |= 1 << _f8064[_e8062];
        }
      }
      L8313: {
        const v_B = ((((_p8058[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y8060 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L8313;
        facts.length = 0;
        changed = false;
        let _c8315: boolean = (v_A || v_B);
        if (_c8315) {
          let _c8314: boolean = !(!(v_A));
          if (!_c8314) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c8314 = true;
          }
          _c8315 = _c8314;
        }
        let _c8317: boolean = _c8315;
        if (_c8317) {
          let _c8316: boolean = !(!(v_B));
          if (!_c8316) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c8316 = true;
          }
          _c8317 = _c8316;
        }
        if (!(_c8317)) return -1;
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
  let _g28 = 0;
  G29: {
    for (let _i30 = 0; _i30 < 1; _i30++) {
      const v_k = v_c;
      if (!((clueAt(cl.piece, v_k) >= 3))) continue;
      _g28++;
    }
  }
  const _made = (clueAt(cl.piece, v_c) - _g28);
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
  let _q31 = false;
  Q32: {
    const _a33 = sp.edgeFaces[v_e];
    for (let _i34 = 0; _i34 < _a33.length; _i34++) {
      const v_f = _a33[_i34];
      if ((sp.edgeFaces[v_x].includes(v_f))) {
        _q31 = true;
        break Q32;
      }
    }
  }
  const _made = _q31;
  _kept1[v_x] = _made;
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}
