// Compiled by `npm run describe` from src/games/net/net.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, keptStore, memberMarks, minus, rangeMask, sameSet, setOf, stamps, type Footprint, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g8361: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h8370 = sp.cells.length;
  const _k8385 = armsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q8354 = true;
  Q8355: {
    const _a8356 = sp.cells;
    for (let _i8357 = 0; _i8357 < _a8356.length; _i8357++) {
      const v_c = _a8356[_i8357];
      const _h8358 = clueAt(cl.piece, v_c);
      if (!((_h8358 !== -1))) {
        _q8354 = false;
        break Q8355;
      }
    }
  }
  if (!(_q8354)) return false;
  let _q8359 = true;
  Q8360: {
    _g8361.length = 0;
    G8362: {
      const _a8365 = sp.edges;
      for (let _i8366 = 0; _i8366 < _a8365.length; _i8366++) {
        const v_e = _a8365[_i8366];
        const _h8367 = (g[v_e] || -1);
        if (!((_h8367 === 1))) continue;
        _g8361.push(v_e);
      }
    }
    const v_L = _g8361;
    const _h8369 = v_L.length;
    const _eg8375 = edgeGroups(sp, v_L);
    const _t8368 = sp.cells;
    const v_s = (_t8368.length > 0 ? _t8368[0] : -1);
    let _c8376: boolean = (_h8369 === (_h8370 - 1));
    if (_c8376) {
      let _q8371 = true;
      Q8372: {
        const _a8373 = sp.cells;
        for (let _i8374 = 0; _i8374 < _a8373.length; _i8374++) {
          const v_c = _a8373[_i8374];
          if (!((_eg8375.of(v_c) === _eg8375.of(v_s)))) {
            _q8371 = false;
            break Q8372;
          }
        }
      }
      _c8376 = _q8371;
    }
    if (!(_c8376)) {
      _q8359 = false;
      break Q8360;
    }
  }
  if (!(_q8359)) return false;
  for (let _k8377 = 0; _k8377 < cl.piece.at.length; _k8377++) {
    const _at8378 = cl.piece.at[_k8377];
    const _v8379 = cl.piece.v[_k8377];
    let _g8380 = 0;
    G8381: {
      const _a8382 = sp.cellEdges[_at8378];
      for (let _i8383 = 0; _i8383 < _a8382.length; _i8383++) {
        const v_e = _a8382[_i8383];
        const _h8384 = (g[v_e] || -1);
        if (!((_h8384 === 1))) continue;
        _g8380++;
      }
    }
    let _c8396: boolean = (_g8380 === (_k8385[_at8378] ?? arms(sp, cl, _at8378)));
    if (_c8396) {
      let _q8386 = true;
      Q8387: {
        const _a8388 = sp.cellEdges[_at8378];
        for (let _i8389 = 0; _i8389 < _a8388.length; _i8389++) {
          const v_e = _a8388[_i8389];
          const _h8393 = (g[v_e] || -1);
          const _h8394 = (_h8393 === 1);
          const _a8390 = sp.cellEdges[_at8378];
          const _n8391 = _i8389;
          for (let _i8392 = 0; _i8392 < _n8391; _i8392++) {
            const v_x = _a8390[_i8392];
            const _h8395 = (g[v_x] || -1);
            if (!(((((_k8385[_at8378] ?? arms(sp, cl, _at8378)) === 2) && _h8394) && (_h8395 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v8379 === 3)))) {
              _q8386 = false;
              break Q8387;
            }
          }
        }
      }
      _c8396 = _q8386;
    }
    if (!(_c8396)) return false;
  }
  for (let _k8397 = 0; _k8397 < cl.wall.at.length; _k8397++) {
    const _at8398 = cl.wall.at[_k8397];
    if (!(((g[_at8398] || -1) === 2))) return false;
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
  const _g578: number[] = [];
  const facts = loopLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k505 = armsKept.board(cl);
  if (loopLockCands.length < sp.edges.length) loopLockCands = new Int32Array(sp.edges.length);
  const cands = loopLockCands;
  cands.fill(-1);
  const _m66_0 = b.made[0];
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
  const _m69_1 = b.made[1];
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
        if (b.made[0] !== _m66_0 || b.made[1] !== _m69_1) {
          _g578.length = 0;
          G579: {
            const _a582 = sp.edges;
            for (let _i583 = 0; _i583 < _a582.length; _i583++) {
              const v_e = _a582[_i583];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g578.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g578))) { if (_visit !== null) _visit[v_c] = 1; return fired; }
        }
        facts.length = 0;
        changed = false;
        let _q584 = true;
        Q585: {
          const _a586 = v_F;
          for (let _i587 = 0; _i587 < _a586.length; _i587++) {
            const v_e = _a586[_i587];
            let _c589: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c589) {
              let _c588: boolean = !(!(v_W.includes(v_e)));
              if (!_c588) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c588 = true;
              }
              _c589 = _c588;
            }
            let _c591: boolean = _c589;
            if (_c591) {
              let _c590: boolean = !(!(v_N.includes(v_e)));
              if (!_c590) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c590 = true;
              }
              _c591 = _c590;
            }
            if (!(_c591)) {
              _q584 = false;
              break Q585;
            }
          }
        }
        if (!(_q584)) return -1;
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
let _p670 = new Int32Array(0);
let _l671: readonly number[] = [];
let _f676 = new Int32Array(0);
let _l677: readonly number[] = [];
let _p698 = new Int32Array(0);
let _l699: readonly number[] = [];
let _f704 = new Int32Array(0);
let _l705: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const loopNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds"],"kind":"group","set":0},{"steps":[],"kind":"group","set":0}],"relation":false,"sets":["L"]};

/** Its dearest read grows with the board as n. */
export function loopNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopNoteBinding> | null): number {
  const _g655: number[] = [];
  if (_p670.length < sp.edges.length) _p670 = new Int32Array(sp.edges.length);
  else _p670.fill(0);
  _l671 = [];
  let _y672 = false;
  if (_f676.length < sp.edges.length) _f676 = new Int32Array(sp.edges.length).fill(-1);
  else _f676.fill(-1);
  _l677 = [];
  const _s678: number[] = [];
  if (_p698.length < sp.edges.length) _p698 = new Int32Array(sp.edges.length);
  else _p698.fill(0);
  _l699 = [];
  let _y700 = false;
  if (_f704.length < sp.edges.length) _f704 = new Int32Array(sp.edges.length).fill(-1);
  else _f704.fill(-1);
  _l705 = [];
  const _s706: number[] = [];
  const _g726: number[] = [];
  const facts = loopNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k687 = armsKept.board(cl);
  if (loopNoteCands.length < sp.edges.length) loopNoteCands = new Int32Array(sp.edges.length);
  const cands = loopNoteCands;
  cands.fill(-1);
  const _m113_0 = b.made[0];
  _g655.length = 0;
  G656: {
    const _a659 = sp.edges;
    for (let _i660 = 0; _i660 < _a659.length; _i660++) {
      const v_e = _a659[_i660];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g655.push(v_e);
    }
  }
  const v_L = _g655;
  const _m116_1 = b.made[1];
  const _eg667 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _visit = fire === null ? (b.visit?.(loopNoteFootprint, [_eg667]) ?? null) : null;
  const _a661 = sp.cells;
  for (let _i662 = 0; _i662 < _a661.length; _i662++) {
    const v_c = _a661[_i662];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _q663 = false;
    Q664: {
      const _a665 = sp.cellEdges[v_c];
      for (let _i666 = 0; _i666 < _a665.length; _i666++) {
        const v_e = _a665[_i666];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q663 = true;
          break Q664;
        }
      }
    }
    if (!(_q663)) continue;
    const v_G = _eg667.of(v_c);
    let _g673 = -1;
    let _g701 = -1;
    const _a668 = sp.cellEdges[v_c];
    for (let _i669 = 0; _i669 < _a668.length; _i669++) {
      const v_e = _a668[_i669];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g673 !== _epoch) {
        _g673 = _epoch;
        for (const _e674 of _l671) _p670[_e674] = 0;
        _y672 = false;
        const _a675 = sp.cellEdges[v_c];
        for (const _e679 of _l677) _f676[_e679] = -1;
        _l677 = _a675;
        let _i681 = 0;
        _s678[0] = 0;
        let _o685 = _a675.length === 0;
        for (;;) {
          if (_a675.length === 0) {
            if (!_o685) break;
            _o685 = false;
          }
          while (_a675.length > 0 && _i681 >= 0) {
            const _e679 = _a675[_i681];
            if (_s678[_i681] > 0) _f676[_e679] = -1;
            let _r684 = (cands[_e679] >= 0 ? cands[_e679] : (cands[_e679] = b.cands[_e679])) & ~((2 << _s678[_i681]) - 1);
            let _d680 = 0;
            V683: for (; _r684 !== 0; _r684 &= _r684 - 1) {
              _d680 = 31 - Math.clz32(_r684 & -_r684);
              _f676[_e679] = _d680;
              for (let _j682 = 0; _j682 < _i681; _j682++) {
                const _y686 = _a675[_j682];
                if (!(((((_k687[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f676[_e679] === 1)) && (_f676[_y686] === 1)))) continue;
                if (!((bent(sp, _e679, _y686) === (clueAt(cl.piece, v_c) === 3)))) continue V683;
              }
              for (let _j682 = 0; _j682 < _i681; _j682++) {
                const _y688 = _a675[_j682];
                if (!(((((_f676[_e679] === 1) && (_f676[_y688] === 1)) && !((b.grid[_e679] !== 0))) && !((b.grid[_y688] !== 0))))) continue;
                if (!(!(_eg667.of((sp.edgeEnds[2 * _y688] === v_c ? sp.edgeEnds[2 * _y688 + 1] : sp.edgeEnds[2 * _y688])) === _eg667.of((sp.edgeEnds[2 * _e679] === v_c ? sp.edgeEnds[2 * _e679 + 1] : sp.edgeEnds[2 * _e679]))))) continue V683;
              }
              break;
            }
            if (_r684 === 0) {
              _s678[_i681] = 0;
              _i681--;
              continue;
            }
            _s678[_i681] = _d680;
            if (_i681 === _a675.length - 1) break;
            _i681++;
            _s678[_i681] = 0;
          }
          if (_i681 < 0) break;
          let _g689 = 0;
          G690: {
            const _a691 = sp.cellEdges[v_c];
            for (let _i692 = 0; _i692 < _a691.length; _i692++) {
              const v_x = _a691[_i692];
              if (!((_f676[v_x] === 1))) continue;
              _g689++;
            }
          }
          let _c697: boolean = (_g689 === (_k687[v_c] ?? arms(sp, cl, v_c)));
          if (_c697) {
            let _q693 = true;
            Q694: {
              const _a695 = sp.cellEdges[v_c];
              for (let _i696 = 0; _i696 < _a695.length; _i696++) {
                const v_x = _a695[_i696];
                if (!(((_f676[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg667.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q693 = false;
                  break Q694;
                }
              }
            }
            _c697 = _q693;
          }
          if (!(_c697)) continue;
          if (!(true)) continue;
          _l671 = _a675;
          _y672 = true;
          for (const _e674 of _a675) _p670[_e674] |= 1 << _f676[_e674];
        }
      }
      const v_A = ((((_p670[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y672 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g701 !== _epoch) {
        _g701 = _epoch;
        for (const _e702 of _l699) _p698[_e702] = 0;
        _y700 = false;
        const _a703 = sp.cellEdges[v_c];
        for (const _e707 of _l705) _f704[_e707] = -1;
        _l705 = _a703;
        let _i709 = 0;
        _s706[0] = 0;
        let _o713 = _a703.length === 0;
        for (;;) {
          if (_a703.length === 0) {
            if (!_o713) break;
            _o713 = false;
          }
          while (_a703.length > 0 && _i709 >= 0) {
            const _e707 = _a703[_i709];
            if (_s706[_i709] > 0) _f704[_e707] = -1;
            let _r712 = (cands[_e707] >= 0 ? cands[_e707] : (cands[_e707] = b.cands[_e707])) & ~((2 << _s706[_i709]) - 1);
            let _d708 = 0;
            V711: for (; _r712 !== 0; _r712 &= _r712 - 1) {
              _d708 = 31 - Math.clz32(_r712 & -_r712);
              _f704[_e707] = _d708;
              for (let _j710 = 0; _j710 < _i709; _j710++) {
                const _y714 = _a703[_j710];
                if (!(((((_k687[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f704[_e707] === 1)) && (_f704[_y714] === 1)))) continue;
                if (!((bent(sp, _e707, _y714) === (clueAt(cl.piece, v_c) === 3)))) continue V711;
              }
              for (let _j710 = 0; _j710 < _i709; _j710++) {
                const _y715 = _a703[_j710];
                if (!(((((_f704[_e707] === 1) && (_f704[_y715] === 1)) && !((b.grid[_e707] !== 0))) && !((b.grid[_y715] !== 0))))) continue;
                if (!(!(_eg667.of((sp.edgeEnds[2 * _y715] === v_c ? sp.edgeEnds[2 * _y715 + 1] : sp.edgeEnds[2 * _y715])) === _eg667.of((sp.edgeEnds[2 * _e707] === v_c ? sp.edgeEnds[2 * _e707 + 1] : sp.edgeEnds[2 * _e707]))))) continue V711;
              }
              break;
            }
            if (_r712 === 0) {
              _s706[_i709] = 0;
              _i709--;
              continue;
            }
            _s706[_i709] = _d708;
            if (_i709 === _a703.length - 1) break;
            _i709++;
            _s706[_i709] = 0;
          }
          if (_i709 < 0) break;
          let _g716 = 0;
          G717: {
            const _a718 = sp.cellEdges[v_c];
            for (let _i719 = 0; _i719 < _a718.length; _i719++) {
              const v_x = _a718[_i719];
              if (!((_f704[v_x] === 1))) continue;
              _g716++;
            }
          }
          let _c724: boolean = (_g716 === (_k687[v_c] ?? arms(sp, cl, v_c)));
          if (_c724) {
            let _q720 = true;
            Q721: {
              const _a722 = sp.cellEdges[v_c];
              for (let _i723 = 0; _i723 < _a722.length; _i723++) {
                const v_x = _a722[_i723];
                if (!(((_f704[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg667.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q720 = false;
                  break Q721;
                }
              }
            }
            _c724 = _q720;
          }
          if (!(_c724)) continue;
          if (!(true)) continue;
          _l699 = _a703;
          _y700 = true;
          for (const _e702 of _a703) _p698[_e702] |= 1 << _f704[_e702];
        }
      }
      L725: {
        const v_B = ((((_p698[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y700 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L725;
        if (b.made[0] !== _m113_0 || b.made[1] !== _m116_1) {
          _g726.length = 0;
          G727: {
            const _a730 = sp.edges;
            for (let _i731 = 0; _i731 < _a730.length; _i731++) {
              const v_e = _a730[_i731];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g726.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g726))) { if (_visit !== null) _visit[v_c] = 1; return fired; }
        }
        facts.length = 0;
        changed = false;
        let _c733: boolean = (v_A || v_B);
        if (_c733) {
          let _c732: boolean = !(!(v_A));
          if (!_c732) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c732 = true;
          }
          _c733 = _c732;
        }
        let _c735: boolean = _c733;
        if (_c735) {
          let _c734: boolean = !(!(v_B));
          if (!_c734) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c734 = true;
          }
          _c735 = _c734;
        }
        if (!(_c735)) return -1;
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
let _f1849 = new Int32Array(0);
let _l1850: readonly number[] = [];
let _f1869 = new Int32Array(0);
let _l1870: readonly number[] = [];
const _st2025 = stamps();
let _f2031 = new Int32Array(0);
let _l2032: readonly number[] = [];
const _st2062 = stamps();
let _p2274 = new Int32Array(0);
let _l2275: readonly number[] = [];
let _f2280 = new Int32Array(0);
let _l2281: readonly number[] = [];
const _st2388 = stamps();
const _st2431 = stamps();
let _f2437 = new Int32Array(0);
let _l2438: readonly number[] = [];
const _st2467 = stamps();
let _p2682 = new Int32Array(0);
let _l2683: readonly number[] = [];
let _f2688 = new Int32Array(0);
let _l2689: readonly number[] = [];
const _st2796 = stamps();
const _st2839 = stamps();
let _f2845 = new Int32Array(0);
let _l2846: readonly number[] = [];
const _st2875 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealLockBinding> | null): number {
  const _g1794: number[] = [];
  const _g1800: number[] = [];
  if (_f1849.length < sp.edges.length) _f1849 = new Int32Array(sp.edges.length).fill(-1);
  else _f1849.fill(-1);
  _l1850 = [];
  const _s1851: number[] = [];
  if (_f1869.length < sp.edges.length) _f1869 = new Int32Array(sp.edges.length).fill(-1);
  else _f1869.fill(-1);
  _l1870 = [];
  const _s1871: number[] = [];
  const _g1885: number[] = [];
  const _g1893: number[] = [];
  const _g1902: number[] = [];
  const _g1986: number[] = [];
  if (_f2031.length < sp.edges.length) _f2031 = new Int32Array(sp.edges.length).fill(-1);
  else _f2031.fill(-1);
  _l2032 = [];
  const _s2033: number[] = [];
  const _g2055: number[] = [];
  const _g2074: number[] = [];
  if (_p2274.length < sp.edges.length) _p2274 = new Int32Array(sp.edges.length);
  else _p2274.fill(0);
  _l2275 = [];
  let _y2276 = false;
  if (_f2280.length < sp.edges.length) _f2280 = new Int32Array(sp.edges.length).fill(-1);
  else _f2280.fill(-1);
  _l2281 = [];
  const _s2282: number[] = [];
  const _g2305: number[] = [];
  const _g2392: number[] = [];
  if (_f2437.length < sp.edges.length) _f2437 = new Int32Array(sp.edges.length).fill(-1);
  else _f2437.fill(-1);
  _l2438 = [];
  const _s2439: number[] = [];
  const _g2460: number[] = [];
  const _g2482: number[] = [];
  if (_p2682.length < sp.edges.length) _p2682 = new Int32Array(sp.edges.length);
  else _p2682.fill(0);
  _l2683 = [];
  let _y2684 = false;
  if (_f2688.length < sp.edges.length) _f2688 = new Int32Array(sp.edges.length).fill(-1);
  else _f2688.fill(-1);
  _l2689 = [];
  const _s2690: number[] = [];
  const _g2713: number[] = [];
  const _g2800: number[] = [];
  if (_f2845.length < sp.edges.length) _f2845 = new Int32Array(sp.edges.length).fill(-1);
  else _f2845.fill(-1);
  _l2846 = [];
  const _s2847: number[] = [];
  const _g2868: number[] = [];
  const _g2895: number[] = [];
  const facts = sealLockFacts;
  let fired = 0;
  let changed = false;
  const _k1860 = armsKept.board(cl);
  const _h2073 = sp.cells.length;
  let _epoch = 0;
  if (sealLockCands.length < sp.edges.length) sealLockCands = new Int32Array(sp.edges.length);
  const cands = sealLockCands;
  cands.fill(-1);
  const _m154_0 = b.made[0];
  _g1794.length = 0;
  G1795: {
    const _a1798 = sp.edges;
    for (let _i1799 = 0; _i1799 < _a1798.length; _i1799++) {
      const v_e = _a1798[_i1799];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1794.push(v_e);
    }
  }
  const v_L = _g1794;
  const _m157_1 = b.made[1];
  const _eg1901 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1800.length = 0;
  G1801: {
    const _a1843 = sp.edges;
    for (let _i1844 = 0; _i1844 < _a1843.length; _i1844++) {
      const v_e = _a1843[_i1844];
      const _t1845 = sp.edgeEnds[2 * v_e];
      let _q1846 = false;
      Q1847: {
        const _a1848 = sp.cellEdges[_t1845];
        for (const _e1852 of _l1850) _f1849[_e1852] = -1;
        _l1850 = _a1848;
        let _i1854 = 0;
        _s1851[0] = 0;
        let _o1858 = _a1848.length === 0;
        for (;;) {
          if (_a1848.length === 0) {
            if (!_o1858) break;
            _o1858 = false;
          }
          while (_a1848.length > 0 && _i1854 >= 0) {
            const _e1852 = _a1848[_i1854];
            if (_s1851[_i1854] > 0) _f1849[_e1852] = -1;
            let _r1857 = (cands[_e1852] >= 0 ? cands[_e1852] : (cands[_e1852] = b.cands[_e1852])) & ~((2 << _s1851[_i1854]) - 1);
            let _d1853 = 0;
            V1856: for (; _r1857 !== 0; _r1857 &= _r1857 - 1) {
              _d1853 = 31 - Math.clz32(_r1857 & -_r1857);
              _f1849[_e1852] = _d1853;
              if (_e1852 === v_e && _d1853 !== 1) continue;
              for (let _j1855 = 0; _j1855 < _i1854; _j1855++) {
                const _y1859 = _a1848[_j1855];
                if (!(((((_k1860[_t1845] ?? arms(sp, cl, _t1845)) === 2) && (_f1849[_e1852] === 1)) && (_f1849[_y1859] === 1)))) continue;
                if (!((bent(sp, _e1852, _y1859) === (clueAt(cl.piece, _t1845) === 3)))) continue V1856;
              }
              break;
            }
            if (_r1857 === 0) {
              _s1851[_i1854] = 0;
              _i1854--;
              continue;
            }
            _s1851[_i1854] = _d1853;
            if (_i1854 === _a1848.length - 1) break;
            _i1854++;
            _s1851[_i1854] = 0;
          }
          if (_i1854 < 0) break;
          let _g1861 = 0;
          G1862: {
            const _a1863 = sp.cellEdges[_t1845];
            for (let _i1864 = 0; _i1864 < _a1863.length; _i1864++) {
              const v_x = _a1863[_i1864];
              if (!((_f1849[v_x] === 1))) continue;
              _g1861++;
            }
          }
          if (!((_g1861 === (_k1860[_t1845] ?? arms(sp, cl, _t1845))))) continue;
          if (true) {
            _q1846 = true;
            break Q1847;
          }
        }
      }
      let _c1884: boolean = _q1846;
      if (_c1884) {
        const _t1865 = sp.edgeEnds[2 * v_e + 1];
        let _q1866 = false;
        Q1867: {
          const _a1868 = sp.cellEdges[_t1865];
          for (const _e1872 of _l1870) _f1869[_e1872] = -1;
          _l1870 = _a1868;
          let _i1874 = 0;
          _s1871[0] = 0;
          let _o1878 = _a1868.length === 0;
          for (;;) {
            if (_a1868.length === 0) {
              if (!_o1878) break;
              _o1878 = false;
            }
            while (_a1868.length > 0 && _i1874 >= 0) {
              const _e1872 = _a1868[_i1874];
              if (_s1871[_i1874] > 0) _f1869[_e1872] = -1;
              let _r1877 = (cands[_e1872] >= 0 ? cands[_e1872] : (cands[_e1872] = b.cands[_e1872])) & ~((2 << _s1871[_i1874]) - 1);
              let _d1873 = 0;
              V1876: for (; _r1877 !== 0; _r1877 &= _r1877 - 1) {
                _d1873 = 31 - Math.clz32(_r1877 & -_r1877);
                _f1869[_e1872] = _d1873;
                if (_e1872 === v_e && _d1873 !== 1) continue;
                for (let _j1875 = 0; _j1875 < _i1874; _j1875++) {
                  const _y1879 = _a1868[_j1875];
                  if (!(((((_k1860[_t1865] ?? arms(sp, cl, _t1865)) === 2) && (_f1869[_e1872] === 1)) && (_f1869[_y1879] === 1)))) continue;
                  if (!((bent(sp, _e1872, _y1879) === (clueAt(cl.piece, _t1865) === 3)))) continue V1876;
                }
                break;
              }
              if (_r1877 === 0) {
                _s1871[_i1874] = 0;
                _i1874--;
                continue;
              }
              _s1871[_i1874] = _d1873;
              if (_i1874 === _a1868.length - 1) break;
              _i1874++;
              _s1871[_i1874] = 0;
            }
            if (_i1874 < 0) break;
            let _g1880 = 0;
            G1881: {
              const _a1882 = sp.cellEdges[_t1865];
              for (let _i1883 = 0; _i1883 < _a1882.length; _i1883++) {
                const v_x = _a1882[_i1883];
                if (!((_f1869[v_x] === 1))) continue;
                _g1880++;
              }
            }
            if (!((_g1880 === (_k1860[_t1865] ?? arms(sp, cl, _t1865))))) continue;
            if (true) {
              _q1866 = true;
              break Q1867;
            }
          }
        }
        _c1884 = _q1866;
      }
      if (!(_c1884)) continue;
      _g1800.push(v_e);
    }
  }
  const v_U = _g1800;
  const _mm2068 = memberMarks(v_U);
  _g1885.length = 0;
  G1886: {
    const _a1889 = v_U;
    for (let _i1890 = 0; _i1890 < _a1889.length; _i1890++) {
      const v_e = _a1889[_i1890];
      if (!((((_k1860[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k1860[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g1885.push(v_e);
    }
  }
  const v_P = _g1885;
  const _a1891 = sp.cells;
  for (let _i1892 = 0; _i1892 < _a1891.length; _i1892++) {
    const v_c = _a1891[_i1892];
    const _h2047 = minus(v_P, sp.cellEdges[v_c]);
    _g1893.length = 0;
    G1894: {
      const _a1897 = sp.cellEdges[v_c];
      for (let _i1898 = 0; _i1898 < _a1897.length; _i1898++) {
        const v_e = _a1897[_i1898];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1893.push(v_e);
      }
    }
    L1899: {
      const v_F = _g1893;
      const _h1900 = v_F.length;
      if (!((_h1900 > 0))) break L1899;
      const v_G = _eg1901.of(v_c);
      _g1902.length = 0;
      G1903: {
        const _a1983 = sp.cellEdges[v_c];
        for (let _i1984 = 0; _i1984 < _a1983.length; _i1984++) {
          const v_x = _a1983[_i1984];
          const _t1985 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h2048 = minus(_h2047, sp.cellEdges[_t1985]);
          const _eg2050 = edgeGroups(sp, _h2048);
          const _memo2053 = new Map<readonly number[], readonly number[]>();
          _g1986.length = 0;
          _st2025.pass++;
          G1987: {
            const _a2026 = sp.cellEdges[_t1985];
            for (let _i2027 = 0; _i2027 < _a2026.length; _i2027++) {
              const v_y = _a2026[_i2027];
              let _c2046: boolean = (v_y !== v_x);
              if (_c2046) {
                let _q2028 = false;
                Q2029: {
                  const _a2030 = sp.cellEdges[_t1985];
                  for (const _e2034 of _l2032) _f2031[_e2034] = -1;
                  _l2032 = _a2030;
                  let _i2036 = 0;
                  _s2033[0] = 0;
                  let _o2040 = _a2030.length === 0;
                  for (;;) {
                    if (_a2030.length === 0) {
                      if (!_o2040) break;
                      _o2040 = false;
                    }
                    while (_a2030.length > 0 && _i2036 >= 0) {
                      const _e2034 = _a2030[_i2036];
                      if (_s2033[_i2036] > 0) _f2031[_e2034] = -1;
                      let _r2039 = (cands[_e2034] >= 0 ? cands[_e2034] : (cands[_e2034] = b.cands[_e2034])) & ~((2 << _s2033[_i2036]) - 1);
                      let _d2035 = 0;
                      V2038: for (; _r2039 !== 0; _r2039 &= _r2039 - 1) {
                        _d2035 = 31 - Math.clz32(_r2039 & -_r2039);
                        _f2031[_e2034] = _d2035;
                        if (_e2034 === v_x && _d2035 !== 1) continue;
                        if (_e2034 === v_y && _d2035 !== 1) continue;
                        for (let _j2037 = 0; _j2037 < _i2036; _j2037++) {
                          const _y2041 = _a2030[_j2037];
                          if (!(((((_k1860[_t1985] ?? arms(sp, cl, _t1985)) === 2) && (_f2031[_e2034] === 1)) && (_f2031[_y2041] === 1)))) continue;
                          if (!((bent(sp, _e2034, _y2041) === (clueAt(cl.piece, _t1985) === 3)))) continue V2038;
                        }
                        break;
                      }
                      if (_r2039 === 0) {
                        _s2033[_i2036] = 0;
                        _i2036--;
                        continue;
                      }
                      _s2033[_i2036] = _d2035;
                      if (_i2036 === _a2030.length - 1) break;
                      _i2036++;
                      _s2033[_i2036] = 0;
                    }
                    if (_i2036 < 0) break;
                    let _g2042 = 0;
                    G2043: {
                      const _a2044 = sp.cellEdges[_t1985];
                      for (let _i2045 = 0; _i2045 < _a2044.length; _i2045++) {
                        const v_z = _a2044[_i2045];
                        if (!((_f2031[v_z] === 1))) continue;
                        _g2042++;
                      }
                    }
                    if (!((_g2042 === (_k1860[_t1985] ?? arms(sp, cl, _t1985))))) continue;
                    if (true) {
                      _q2028 = true;
                      break Q2029;
                    }
                  }
                }
                _c2046 = _q2028;
              }
              if (!(_c2046)) continue;
              const _t2049 = (sp.edgeEnds[2 * v_y] === _t1985 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t2052 = _eg2050.of(_t2049);
              let _gs2054 = _memo2053.get(_t2052);
              if (_gs2054 === undefined) {
                _g2055.length = 0;
                _st2062.pass++;
                G2056: {
                  const _a2063 = _t2052;
                  for (let _i2064 = 0; _i2064 < _a2063.length; _i2064++) {
                    const v_t = _a2063[_i2064];
                    if (!(((_k1860[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a2065 = sp.cellEdges[v_t];
                    for (let _i2066 = 0; _i2066 < _a2065.length; _i2066++) {
                      const v_y = _a2065[_i2066];
                      L2067: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k1860[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2068[v_y + 1] === 1)))) break L2067;
                        const _t2069 = v_z;
                        if (_g2055.length < 16) { if (!_g2055.includes(_t2069)) _g2055.push(_t2069); } else addOnce(_g2055, _st2062, _t2069);
                      }
                    }
                  }
                }
                _gs2054 = _g2055.slice();
                _memo2053.set(_t2052, _gs2054);
              }
              const _a2070 = union(_eg2050.of(_t2049), _gs2054);
              for (let _i2071 = 0; _i2071 < _a2070.length; _i2071++) {
                const v_t = _a2070[_i2071];
                const _t2072 = v_t;
                if (_g1986.length < 16) { if (!_g1986.includes(_t2072)) _g1986.push(_t2072); } else addOnce(_g1986, _st2025, _t2072);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t1985), _g1986)).length >= _h2073))) continue;
          _g1902.push(v_x);
        }
      }
      const v_K = _g1902;
      let _g2277 = -1;
      let _g2685 = -1;
      _g2074.length = 0;
      G2075: {
        const _a2272 = v_F;
        for (let _i2273 = 0; _i2273 < _a2272.length; _i2273++) {
          const v_e = _a2272[_i2273];
          if (_g2277 !== _epoch) {
            _g2277 = _epoch;
            for (const _e2278 of _l2275) _p2274[_e2278] = 0;
            _y2276 = false;
            const _a2279 = sp.cellEdges[v_c];
            for (const _e2283 of _l2281) _f2280[_e2283] = -1;
            _l2281 = _a2279;
            let _i2285 = 0;
            _s2282[0] = 0;
            let _o2289 = _a2279.length === 0;
            for (;;) {
              if (_a2279.length === 0) {
                if (!_o2289) break;
                _o2289 = false;
              }
              while (_a2279.length > 0 && _i2285 >= 0) {
                const _e2283 = _a2279[_i2285];
                if (_s2282[_i2285] > 0) _f2280[_e2283] = -1;
                let _r2288 = (cands[_e2283] >= 0 ? cands[_e2283] : (cands[_e2283] = b.cands[_e2283])) & ~((2 << _s2282[_i2285]) - 1);
                let _d2284 = 0;
                V2287: for (; _r2288 !== 0; _r2288 &= _r2288 - 1) {
                  _d2284 = 31 - Math.clz32(_r2288 & -_r2288);
                  _f2280[_e2283] = _d2284;
                  for (let _j2286 = 0; _j2286 < _i2285; _j2286++) {
                    const _y2290 = _a2279[_j2286];
                    if (!(((((_k1860[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f2280[_e2283] === 1)) && (_f2280[_y2290] === 1)))) continue;
                    if (!((bent(sp, _e2283, _y2290) === (clueAt(cl.piece, v_c) === 3)))) continue V2287;
                  }
                  for (let _j2286 = 0; _j2286 < _i2285; _j2286++) {
                    const _y2291 = _a2279[_j2286];
                    if (!(((((_f2280[_e2283] === 1) && (_f2280[_y2291] === 1)) && !((b.grid[_e2283] !== 0))) && !((b.grid[_y2291] !== 0))))) continue;
                    if (!(!(_eg1901.of((sp.edgeEnds[2 * _y2291] === v_c ? sp.edgeEnds[2 * _y2291 + 1] : sp.edgeEnds[2 * _y2291])) === _eg1901.of((sp.edgeEnds[2 * _e2283] === v_c ? sp.edgeEnds[2 * _e2283 + 1] : sp.edgeEnds[2 * _e2283]))))) continue V2287;
                  }
                  break;
                }
                if (_r2288 === 0) {
                  _s2282[_i2285] = 0;
                  _i2285--;
                  continue;
                }
                _s2282[_i2285] = _d2284;
                if (_i2285 === _a2279.length - 1) break;
                _i2285++;
                _s2282[_i2285] = 0;
              }
              if (_i2285 < 0) break;
              let _g2292 = 0;
              G2293: {
                const _a2294 = sp.cellEdges[v_c];
                for (let _i2295 = 0; _i2295 < _a2294.length; _i2295++) {
                  const v_x = _a2294[_i2295];
                  if (!((_f2280[v_x] === 1))) continue;
                  _g2292++;
                }
              }
              let _c2300: boolean = (_g2292 === (_k1860[v_c] ?? arms(sp, cl, v_c)));
              if (_c2300) {
                let _q2296 = true;
                Q2297: {
                  const _a2298 = sp.cellEdges[v_c];
                  for (let _i2299 = 0; _i2299 < _a2298.length; _i2299++) {
                    const v_x = _a2298[_i2299];
                    if (!(((_f2280[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1901.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2296 = false;
                      break Q2297;
                    }
                  }
                }
                _c2300 = _q2296;
              }
              let _c2481: boolean = _c2300;
              if (_c2481) {
                let _q2301 = false;
                Q2302: {
                  const _a2303 = sp.cellEdges[v_c];
                  for (let _i2304 = 0; _i2304 < _a2303.length; _i2304++) {
                    const v_x = _a2303[_i2304];
                    if (!((_f2280[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2301 = true;
                      break Q2302;
                    }
                  }
                }
                let _c2480: boolean = _q2301;
                if (!_c2480) {
                  _g2305.length = 0;
                  _st2388.pass++;
                  G2306: {
                    const _a2389 = sp.cellEdges[v_c];
                    for (let _i2390 = 0; _i2390 < _a2389.length; _i2390++) {
                      const v_x = _a2389[_i2390];
                      if (!((_f2280[v_x] === 1))) continue;
                      const _t2391 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h2453 = minus(_h2047, sp.cellEdges[_t2391]);
                      const _eg2455 = edgeGroups(sp, _h2453);
                      const _memo2458 = new Map<readonly number[], readonly number[]>();
                      _g2392.length = 0;
                      _st2431.pass++;
                      G2393: {
                        const _a2432 = sp.cellEdges[_t2391];
                        for (let _i2433 = 0; _i2433 < _a2432.length; _i2433++) {
                          const v_y = _a2432[_i2433];
                          let _c2452: boolean = (v_y !== v_x);
                          if (_c2452) {
                            let _q2434 = false;
                            Q2435: {
                              const _a2436 = sp.cellEdges[_t2391];
                              for (const _e2440 of _l2438) _f2437[_e2440] = -1;
                              _l2438 = _a2436;
                              let _i2442 = 0;
                              _s2439[0] = 0;
                              let _o2446 = _a2436.length === 0;
                              for (;;) {
                                if (_a2436.length === 0) {
                                  if (!_o2446) break;
                                  _o2446 = false;
                                }
                                while (_a2436.length > 0 && _i2442 >= 0) {
                                  const _e2440 = _a2436[_i2442];
                                  if (_s2439[_i2442] > 0) _f2437[_e2440] = -1;
                                  let _r2445 = (cands[_e2440] >= 0 ? cands[_e2440] : (cands[_e2440] = b.cands[_e2440])) & ~((2 << _s2439[_i2442]) - 1);
                                  let _d2441 = 0;
                                  V2444: for (; _r2445 !== 0; _r2445 &= _r2445 - 1) {
                                    _d2441 = 31 - Math.clz32(_r2445 & -_r2445);
                                    _f2437[_e2440] = _d2441;
                                    if (_e2440 === v_x && _d2441 !== 1) continue;
                                    if (_e2440 === v_y && _d2441 !== 1) continue;
                                    for (let _j2443 = 0; _j2443 < _i2442; _j2443++) {
                                      const _y2447 = _a2436[_j2443];
                                      if (!(((((_k1860[_t2391] ?? arms(sp, cl, _t2391)) === 2) && (_f2437[_e2440] === 1)) && (_f2437[_y2447] === 1)))) continue;
                                      if (!((bent(sp, _e2440, _y2447) === (clueAt(cl.piece, _t2391) === 3)))) continue V2444;
                                    }
                                    break;
                                  }
                                  if (_r2445 === 0) {
                                    _s2439[_i2442] = 0;
                                    _i2442--;
                                    continue;
                                  }
                                  _s2439[_i2442] = _d2441;
                                  if (_i2442 === _a2436.length - 1) break;
                                  _i2442++;
                                  _s2439[_i2442] = 0;
                                }
                                if (_i2442 < 0) break;
                                let _g2448 = 0;
                                G2449: {
                                  const _a2450 = sp.cellEdges[_t2391];
                                  for (let _i2451 = 0; _i2451 < _a2450.length; _i2451++) {
                                    const v_z = _a2450[_i2451];
                                    if (!((_f2437[v_z] === 1))) continue;
                                    _g2448++;
                                  }
                                }
                                if (!((_g2448 === (_k1860[_t2391] ?? arms(sp, cl, _t2391))))) continue;
                                if (true) {
                                  _q2434 = true;
                                  break Q2435;
                                }
                              }
                            }
                            _c2452 = _q2434;
                          }
                          if (!(_c2452)) continue;
                          const _t2454 = (sp.edgeEnds[2 * v_y] === _t2391 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2457 = _eg2455.of(_t2454);
                          let _gs2459 = _memo2458.get(_t2457);
                          if (_gs2459 === undefined) {
                            _g2460.length = 0;
                            _st2467.pass++;
                            G2461: {
                              const _a2468 = _t2457;
                              for (let _i2469 = 0; _i2469 < _a2468.length; _i2469++) {
                                const v_t = _a2468[_i2469];
                                if (!(((_k1860[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a2470 = sp.cellEdges[v_t];
                                for (let _i2471 = 0; _i2471 < _a2470.length; _i2471++) {
                                  const v_y = _a2470[_i2471];
                                  L2472: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1860[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2068[v_y + 1] === 1)))) break L2472;
                                    const _t2473 = v_z;
                                    if (_g2460.length < 16) { if (!_g2460.includes(_t2473)) _g2460.push(_t2473); } else addOnce(_g2460, _st2467, _t2473);
                                  }
                                }
                              }
                            }
                            _gs2459 = _g2460.slice();
                            _memo2458.set(_t2457, _gs2459);
                          }
                          const _a2474 = union(_eg2455.of(_t2454), _gs2459);
                          for (let _i2475 = 0; _i2475 < _a2474.length; _i2475++) {
                            const v_t = _a2474[_i2475];
                            const _t2476 = v_t;
                            if (_g2392.length < 16) { if (!_g2392.includes(_t2476)) _g2392.push(_t2476); } else addOnce(_g2392, _st2431, _t2476);
                          }
                        }
                      }
                      const _a2477 = union(setOf(_t2391), _g2392);
                      for (let _i2478 = 0; _i2478 < _a2477.length; _i2478++) {
                        const v_t = _a2477[_i2478];
                        const _t2479 = v_t;
                        if (_g2305.length < 16) { if (!_g2305.includes(_t2479)) _g2305.push(_t2479); } else addOnce(_g2305, _st2388, _t2479);
                      }
                    }
                  }
                  _c2480 = (union(setOf(v_c), _g2305).length >= _h2073);
                }
                _c2481 = _c2480;
              }
              if (!(_c2481)) continue;
              if (!(true)) continue;
              _l2275 = _a2279;
              _y2276 = true;
              for (const _e2278 of _a2279) _p2274[_e2278] |= 1 << _f2280[_e2278];
            }
          }
          if (!(((((_p2274[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y2276 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2074.push(v_e);
        }
      }
      const v_W = _g2074;
      _g2482.length = 0;
      G2483: {
        const _a2680 = v_F;
        for (let _i2681 = 0; _i2681 < _a2680.length; _i2681++) {
          const v_e = _a2680[_i2681];
          if (_g2685 !== _epoch) {
            _g2685 = _epoch;
            for (const _e2686 of _l2683) _p2682[_e2686] = 0;
            _y2684 = false;
            const _a2687 = sp.cellEdges[v_c];
            for (const _e2691 of _l2689) _f2688[_e2691] = -1;
            _l2689 = _a2687;
            let _i2693 = 0;
            _s2690[0] = 0;
            let _o2697 = _a2687.length === 0;
            for (;;) {
              if (_a2687.length === 0) {
                if (!_o2697) break;
                _o2697 = false;
              }
              while (_a2687.length > 0 && _i2693 >= 0) {
                const _e2691 = _a2687[_i2693];
                if (_s2690[_i2693] > 0) _f2688[_e2691] = -1;
                let _r2696 = (cands[_e2691] >= 0 ? cands[_e2691] : (cands[_e2691] = b.cands[_e2691])) & ~((2 << _s2690[_i2693]) - 1);
                let _d2692 = 0;
                V2695: for (; _r2696 !== 0; _r2696 &= _r2696 - 1) {
                  _d2692 = 31 - Math.clz32(_r2696 & -_r2696);
                  _f2688[_e2691] = _d2692;
                  for (let _j2694 = 0; _j2694 < _i2693; _j2694++) {
                    const _y2698 = _a2687[_j2694];
                    if (!(((((_k1860[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f2688[_e2691] === 1)) && (_f2688[_y2698] === 1)))) continue;
                    if (!((bent(sp, _e2691, _y2698) === (clueAt(cl.piece, v_c) === 3)))) continue V2695;
                  }
                  for (let _j2694 = 0; _j2694 < _i2693; _j2694++) {
                    const _y2699 = _a2687[_j2694];
                    if (!(((((_f2688[_e2691] === 1) && (_f2688[_y2699] === 1)) && !((b.grid[_e2691] !== 0))) && !((b.grid[_y2699] !== 0))))) continue;
                    if (!(!(_eg1901.of((sp.edgeEnds[2 * _y2699] === v_c ? sp.edgeEnds[2 * _y2699 + 1] : sp.edgeEnds[2 * _y2699])) === _eg1901.of((sp.edgeEnds[2 * _e2691] === v_c ? sp.edgeEnds[2 * _e2691 + 1] : sp.edgeEnds[2 * _e2691]))))) continue V2695;
                  }
                  break;
                }
                if (_r2696 === 0) {
                  _s2690[_i2693] = 0;
                  _i2693--;
                  continue;
                }
                _s2690[_i2693] = _d2692;
                if (_i2693 === _a2687.length - 1) break;
                _i2693++;
                _s2690[_i2693] = 0;
              }
              if (_i2693 < 0) break;
              let _g2700 = 0;
              G2701: {
                const _a2702 = sp.cellEdges[v_c];
                for (let _i2703 = 0; _i2703 < _a2702.length; _i2703++) {
                  const v_x = _a2702[_i2703];
                  if (!((_f2688[v_x] === 1))) continue;
                  _g2700++;
                }
              }
              let _c2708: boolean = (_g2700 === (_k1860[v_c] ?? arms(sp, cl, v_c)));
              if (_c2708) {
                let _q2704 = true;
                Q2705: {
                  const _a2706 = sp.cellEdges[v_c];
                  for (let _i2707 = 0; _i2707 < _a2706.length; _i2707++) {
                    const v_x = _a2706[_i2707];
                    if (!(((_f2688[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1901.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2704 = false;
                      break Q2705;
                    }
                  }
                }
                _c2708 = _q2704;
              }
              let _c2889: boolean = _c2708;
              if (_c2889) {
                let _q2709 = false;
                Q2710: {
                  const _a2711 = sp.cellEdges[v_c];
                  for (let _i2712 = 0; _i2712 < _a2711.length; _i2712++) {
                    const v_x = _a2711[_i2712];
                    if (!((_f2688[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2709 = true;
                      break Q2710;
                    }
                  }
                }
                let _c2888: boolean = _q2709;
                if (!_c2888) {
                  _g2713.length = 0;
                  _st2796.pass++;
                  G2714: {
                    const _a2797 = sp.cellEdges[v_c];
                    for (let _i2798 = 0; _i2798 < _a2797.length; _i2798++) {
                      const v_x = _a2797[_i2798];
                      if (!((_f2688[v_x] === 1))) continue;
                      const _t2799 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h2861 = minus(_h2047, sp.cellEdges[_t2799]);
                      const _eg2863 = edgeGroups(sp, _h2861);
                      const _memo2866 = new Map<readonly number[], readonly number[]>();
                      _g2800.length = 0;
                      _st2839.pass++;
                      G2801: {
                        const _a2840 = sp.cellEdges[_t2799];
                        for (let _i2841 = 0; _i2841 < _a2840.length; _i2841++) {
                          const v_y = _a2840[_i2841];
                          let _c2860: boolean = (v_y !== v_x);
                          if (_c2860) {
                            let _q2842 = false;
                            Q2843: {
                              const _a2844 = sp.cellEdges[_t2799];
                              for (const _e2848 of _l2846) _f2845[_e2848] = -1;
                              _l2846 = _a2844;
                              let _i2850 = 0;
                              _s2847[0] = 0;
                              let _o2854 = _a2844.length === 0;
                              for (;;) {
                                if (_a2844.length === 0) {
                                  if (!_o2854) break;
                                  _o2854 = false;
                                }
                                while (_a2844.length > 0 && _i2850 >= 0) {
                                  const _e2848 = _a2844[_i2850];
                                  if (_s2847[_i2850] > 0) _f2845[_e2848] = -1;
                                  let _r2853 = (cands[_e2848] >= 0 ? cands[_e2848] : (cands[_e2848] = b.cands[_e2848])) & ~((2 << _s2847[_i2850]) - 1);
                                  let _d2849 = 0;
                                  V2852: for (; _r2853 !== 0; _r2853 &= _r2853 - 1) {
                                    _d2849 = 31 - Math.clz32(_r2853 & -_r2853);
                                    _f2845[_e2848] = _d2849;
                                    if (_e2848 === v_x && _d2849 !== 1) continue;
                                    if (_e2848 === v_y && _d2849 !== 1) continue;
                                    for (let _j2851 = 0; _j2851 < _i2850; _j2851++) {
                                      const _y2855 = _a2844[_j2851];
                                      if (!(((((_k1860[_t2799] ?? arms(sp, cl, _t2799)) === 2) && (_f2845[_e2848] === 1)) && (_f2845[_y2855] === 1)))) continue;
                                      if (!((bent(sp, _e2848, _y2855) === (clueAt(cl.piece, _t2799) === 3)))) continue V2852;
                                    }
                                    break;
                                  }
                                  if (_r2853 === 0) {
                                    _s2847[_i2850] = 0;
                                    _i2850--;
                                    continue;
                                  }
                                  _s2847[_i2850] = _d2849;
                                  if (_i2850 === _a2844.length - 1) break;
                                  _i2850++;
                                  _s2847[_i2850] = 0;
                                }
                                if (_i2850 < 0) break;
                                let _g2856 = 0;
                                G2857: {
                                  const _a2858 = sp.cellEdges[_t2799];
                                  for (let _i2859 = 0; _i2859 < _a2858.length; _i2859++) {
                                    const v_z = _a2858[_i2859];
                                    if (!((_f2845[v_z] === 1))) continue;
                                    _g2856++;
                                  }
                                }
                                if (!((_g2856 === (_k1860[_t2799] ?? arms(sp, cl, _t2799))))) continue;
                                if (true) {
                                  _q2842 = true;
                                  break Q2843;
                                }
                              }
                            }
                            _c2860 = _q2842;
                          }
                          if (!(_c2860)) continue;
                          const _t2862 = (sp.edgeEnds[2 * v_y] === _t2799 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2865 = _eg2863.of(_t2862);
                          let _gs2867 = _memo2866.get(_t2865);
                          if (_gs2867 === undefined) {
                            _g2868.length = 0;
                            _st2875.pass++;
                            G2869: {
                              const _a2876 = _t2865;
                              for (let _i2877 = 0; _i2877 < _a2876.length; _i2877++) {
                                const v_t = _a2876[_i2877];
                                if (!(((_k1860[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a2878 = sp.cellEdges[v_t];
                                for (let _i2879 = 0; _i2879 < _a2878.length; _i2879++) {
                                  const v_y = _a2878[_i2879];
                                  L2880: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k1860[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2068[v_y + 1] === 1)))) break L2880;
                                    const _t2881 = v_z;
                                    if (_g2868.length < 16) { if (!_g2868.includes(_t2881)) _g2868.push(_t2881); } else addOnce(_g2868, _st2875, _t2881);
                                  }
                                }
                              }
                            }
                            _gs2867 = _g2868.slice();
                            _memo2866.set(_t2865, _gs2867);
                          }
                          const _a2882 = union(_eg2863.of(_t2862), _gs2867);
                          for (let _i2883 = 0; _i2883 < _a2882.length; _i2883++) {
                            const v_t = _a2882[_i2883];
                            const _t2884 = v_t;
                            if (_g2800.length < 16) { if (!_g2800.includes(_t2884)) _g2800.push(_t2884); } else addOnce(_g2800, _st2839, _t2884);
                          }
                        }
                      }
                      const _a2885 = union(setOf(_t2799), _g2800);
                      for (let _i2886 = 0; _i2886 < _a2885.length; _i2886++) {
                        const v_t = _a2885[_i2886];
                        const _t2887 = v_t;
                        if (_g2713.length < 16) { if (!_g2713.includes(_t2887)) _g2713.push(_t2887); } else addOnce(_g2713, _st2796, _t2887);
                      }
                    }
                  }
                  _c2888 = (union(setOf(v_c), _g2713).length >= _h2073);
                }
                _c2889 = _c2888;
              }
              if (!(_c2889)) continue;
              if (!(true)) continue;
              _l2683 = _a2687;
              _y2684 = true;
              for (const _e2686 of _a2687) _p2682[_e2686] |= 1 << _f2688[_e2686];
            }
          }
          if (!(((((_p2682[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y2684 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2482.push(v_e);
        }
      }
      L2890: {
        const v_N = _g2482;
        let _q2891 = true;
        Q2892: {
          const _a2893 = v_F;
          for (let _i2894 = 0; _i2894 < _a2893.length; _i2894++) {
            const v_e = _a2893[_i2894];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q2891 = false;
              break Q2892;
            }
          }
        }
        if (!(_q2891)) break L2890;
        if (b.made[0] !== _m154_0 || b.made[1] !== _m157_1) {
          _g2895.length = 0;
          G2896: {
            const _a2899 = sp.edges;
            for (let _i2900 = 0; _i2900 < _a2899.length; _i2900++) {
              const v_e = _a2899[_i2900];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g2895.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g2895))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _q2901 = true;
        Q2902: {
          const _a2903 = v_F;
          for (let _i2904 = 0; _i2904 < _a2903.length; _i2904++) {
            const v_e = _a2903[_i2904];
            let _c2906: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c2906) {
              let _c2905: boolean = !(!(v_W.includes(v_e)));
              if (!_c2905) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c2905 = true;
              }
              _c2906 = _c2905;
            }
            let _c2908: boolean = _c2906;
            if (_c2908) {
              let _c2907: boolean = !(!(v_N.includes(v_e)));
              if (!_c2907) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c2907 = true;
              }
              _c2908 = _c2907;
            }
            if (!(_c2908)) {
              _q2901 = false;
              break Q2902;
            }
          }
        }
        if (!(_q2901)) return -1;
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
let _f3617 = new Int32Array(0);
let _l3618: readonly number[] = [];
let _f3637 = new Int32Array(0);
let _l3638: readonly number[] = [];
const _st3789 = stamps();
let _f3795 = new Int32Array(0);
let _l3796: readonly number[] = [];
const _st3826 = stamps();
let _p3840 = new Int32Array(0);
let _l3841: readonly number[] = [];
let _f3846 = new Int32Array(0);
let _l3847: readonly number[] = [];
const _st3954 = stamps();
const _st3997 = stamps();
let _f4003 = new Int32Array(0);
let _l4004: readonly number[] = [];
const _st4033 = stamps();
let _p4048 = new Int32Array(0);
let _l4049: readonly number[] = [];
let _f4054 = new Int32Array(0);
let _l4055: readonly number[] = [];
const _st4162 = stamps();
const _st4205 = stamps();
let _f4211 = new Int32Array(0);
let _l4212: readonly number[] = [];
const _st4241 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealNoteBinding> | null): number {
  const _g3562: number[] = [];
  const _g3568: number[] = [];
  if (_f3617.length < sp.edges.length) _f3617 = new Int32Array(sp.edges.length).fill(-1);
  else _f3617.fill(-1);
  _l3618 = [];
  const _s3619: number[] = [];
  if (_f3637.length < sp.edges.length) _f3637 = new Int32Array(sp.edges.length).fill(-1);
  else _f3637.fill(-1);
  _l3638 = [];
  const _s3639: number[] = [];
  const _g3653: number[] = [];
  const _g3666: number[] = [];
  const _g3750: number[] = [];
  if (_f3795.length < sp.edges.length) _f3795 = new Int32Array(sp.edges.length).fill(-1);
  else _f3795.fill(-1);
  _l3796 = [];
  const _s3797: number[] = [];
  const _g3819: number[] = [];
  if (_p3840.length < sp.edges.length) _p3840 = new Int32Array(sp.edges.length);
  else _p3840.fill(0);
  _l3841 = [];
  let _y3842 = false;
  if (_f3846.length < sp.edges.length) _f3846 = new Int32Array(sp.edges.length).fill(-1);
  else _f3846.fill(-1);
  _l3847 = [];
  const _s3848: number[] = [];
  const _g3871: number[] = [];
  const _g3958: number[] = [];
  if (_f4003.length < sp.edges.length) _f4003 = new Int32Array(sp.edges.length).fill(-1);
  else _f4003.fill(-1);
  _l4004 = [];
  const _s4005: number[] = [];
  const _g4026: number[] = [];
  if (_p4048.length < sp.edges.length) _p4048 = new Int32Array(sp.edges.length);
  else _p4048.fill(0);
  _l4049 = [];
  let _y4050 = false;
  if (_f4054.length < sp.edges.length) _f4054 = new Int32Array(sp.edges.length).fill(-1);
  else _f4054.fill(-1);
  _l4055 = [];
  const _s4056: number[] = [];
  const _g4079: number[] = [];
  const _g4166: number[] = [];
  if (_f4211.length < sp.edges.length) _f4211 = new Int32Array(sp.edges.length).fill(-1);
  else _f4211.fill(-1);
  _l4212 = [];
  const _s4213: number[] = [];
  const _g4234: number[] = [];
  const _g4257: number[] = [];
  const facts = sealNoteFacts;
  let fired = 0;
  let changed = false;
  const _k3628 = armsKept.board(cl);
  const _h3837 = sp.cells.length;
  let _epoch = 0;
  if (sealNoteCands.length < sp.edges.length) sealNoteCands = new Int32Array(sp.edges.length);
  const cands = sealNoteCands;
  cands.fill(-1);
  const _m277_0 = b.made[0];
  _g3562.length = 0;
  G3563: {
    const _a3566 = sp.edges;
    for (let _i3567 = 0; _i3567 < _a3566.length; _i3567++) {
      const v_e = _a3566[_i3567];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g3562.push(v_e);
    }
  }
  const v_L = _g3562;
  const _m280_1 = b.made[1];
  const _eg3665 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g3568.length = 0;
  G3569: {
    const _a3611 = sp.edges;
    for (let _i3612 = 0; _i3612 < _a3611.length; _i3612++) {
      const v_e = _a3611[_i3612];
      const _t3613 = sp.edgeEnds[2 * v_e];
      let _q3614 = false;
      Q3615: {
        const _a3616 = sp.cellEdges[_t3613];
        for (const _e3620 of _l3618) _f3617[_e3620] = -1;
        _l3618 = _a3616;
        let _i3622 = 0;
        _s3619[0] = 0;
        let _o3626 = _a3616.length === 0;
        for (;;) {
          if (_a3616.length === 0) {
            if (!_o3626) break;
            _o3626 = false;
          }
          while (_a3616.length > 0 && _i3622 >= 0) {
            const _e3620 = _a3616[_i3622];
            if (_s3619[_i3622] > 0) _f3617[_e3620] = -1;
            let _r3625 = (cands[_e3620] >= 0 ? cands[_e3620] : (cands[_e3620] = b.cands[_e3620])) & ~((2 << _s3619[_i3622]) - 1);
            let _d3621 = 0;
            V3624: for (; _r3625 !== 0; _r3625 &= _r3625 - 1) {
              _d3621 = 31 - Math.clz32(_r3625 & -_r3625);
              _f3617[_e3620] = _d3621;
              if (_e3620 === v_e && _d3621 !== 1) continue;
              for (let _j3623 = 0; _j3623 < _i3622; _j3623++) {
                const _y3627 = _a3616[_j3623];
                if (!(((((_k3628[_t3613] ?? arms(sp, cl, _t3613)) === 2) && (_f3617[_e3620] === 1)) && (_f3617[_y3627] === 1)))) continue;
                if (!((bent(sp, _e3620, _y3627) === (clueAt(cl.piece, _t3613) === 3)))) continue V3624;
              }
              break;
            }
            if (_r3625 === 0) {
              _s3619[_i3622] = 0;
              _i3622--;
              continue;
            }
            _s3619[_i3622] = _d3621;
            if (_i3622 === _a3616.length - 1) break;
            _i3622++;
            _s3619[_i3622] = 0;
          }
          if (_i3622 < 0) break;
          let _g3629 = 0;
          G3630: {
            const _a3631 = sp.cellEdges[_t3613];
            for (let _i3632 = 0; _i3632 < _a3631.length; _i3632++) {
              const v_x = _a3631[_i3632];
              if (!((_f3617[v_x] === 1))) continue;
              _g3629++;
            }
          }
          if (!((_g3629 === (_k3628[_t3613] ?? arms(sp, cl, _t3613))))) continue;
          if (true) {
            _q3614 = true;
            break Q3615;
          }
        }
      }
      let _c3652: boolean = _q3614;
      if (_c3652) {
        const _t3633 = sp.edgeEnds[2 * v_e + 1];
        let _q3634 = false;
        Q3635: {
          const _a3636 = sp.cellEdges[_t3633];
          for (const _e3640 of _l3638) _f3637[_e3640] = -1;
          _l3638 = _a3636;
          let _i3642 = 0;
          _s3639[0] = 0;
          let _o3646 = _a3636.length === 0;
          for (;;) {
            if (_a3636.length === 0) {
              if (!_o3646) break;
              _o3646 = false;
            }
            while (_a3636.length > 0 && _i3642 >= 0) {
              const _e3640 = _a3636[_i3642];
              if (_s3639[_i3642] > 0) _f3637[_e3640] = -1;
              let _r3645 = (cands[_e3640] >= 0 ? cands[_e3640] : (cands[_e3640] = b.cands[_e3640])) & ~((2 << _s3639[_i3642]) - 1);
              let _d3641 = 0;
              V3644: for (; _r3645 !== 0; _r3645 &= _r3645 - 1) {
                _d3641 = 31 - Math.clz32(_r3645 & -_r3645);
                _f3637[_e3640] = _d3641;
                if (_e3640 === v_e && _d3641 !== 1) continue;
                for (let _j3643 = 0; _j3643 < _i3642; _j3643++) {
                  const _y3647 = _a3636[_j3643];
                  if (!(((((_k3628[_t3633] ?? arms(sp, cl, _t3633)) === 2) && (_f3637[_e3640] === 1)) && (_f3637[_y3647] === 1)))) continue;
                  if (!((bent(sp, _e3640, _y3647) === (clueAt(cl.piece, _t3633) === 3)))) continue V3644;
                }
                break;
              }
              if (_r3645 === 0) {
                _s3639[_i3642] = 0;
                _i3642--;
                continue;
              }
              _s3639[_i3642] = _d3641;
              if (_i3642 === _a3636.length - 1) break;
              _i3642++;
              _s3639[_i3642] = 0;
            }
            if (_i3642 < 0) break;
            let _g3648 = 0;
            G3649: {
              const _a3650 = sp.cellEdges[_t3633];
              for (let _i3651 = 0; _i3651 < _a3650.length; _i3651++) {
                const v_x = _a3650[_i3651];
                if (!((_f3637[v_x] === 1))) continue;
                _g3648++;
              }
            }
            if (!((_g3648 === (_k3628[_t3633] ?? arms(sp, cl, _t3633))))) continue;
            if (true) {
              _q3634 = true;
              break Q3635;
            }
          }
        }
        _c3652 = _q3634;
      }
      if (!(_c3652)) continue;
      _g3568.push(v_e);
    }
  }
  const v_U = _g3568;
  const _mm3832 = memberMarks(v_U);
  _g3653.length = 0;
  G3654: {
    const _a3657 = v_U;
    for (let _i3658 = 0; _i3658 < _a3657.length; _i3658++) {
      const v_e = _a3657[_i3658];
      if (!((((_k3628[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k3628[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g3653.push(v_e);
    }
  }
  const v_P = _g3653;
  const _a3659 = sp.cells;
  for (let _i3660 = 0; _i3660 < _a3659.length; _i3660++) {
    const v_c = _a3659[_i3660];
    const _h3811 = minus(v_P, sp.cellEdges[v_c]);
    let _q3661 = false;
    Q3662: {
      const _a3663 = sp.cellEdges[v_c];
      for (let _i3664 = 0; _i3664 < _a3663.length; _i3664++) {
        const v_e = _a3663[_i3664];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q3661 = true;
          break Q3662;
        }
      }
    }
    if (!(_q3661)) continue;
    const v_G = _eg3665.of(v_c);
    _g3666.length = 0;
    G3667: {
      const _a3747 = sp.cellEdges[v_c];
      for (let _i3748 = 0; _i3748 < _a3747.length; _i3748++) {
        const v_x = _a3747[_i3748];
        const _t3749 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h3812 = minus(_h3811, sp.cellEdges[_t3749]);
        const _eg3814 = edgeGroups(sp, _h3812);
        const _memo3817 = new Map<readonly number[], readonly number[]>();
        _g3750.length = 0;
        _st3789.pass++;
        G3751: {
          const _a3790 = sp.cellEdges[_t3749];
          for (let _i3791 = 0; _i3791 < _a3790.length; _i3791++) {
            const v_y = _a3790[_i3791];
            let _c3810: boolean = (v_y !== v_x);
            if (_c3810) {
              let _q3792 = false;
              Q3793: {
                const _a3794 = sp.cellEdges[_t3749];
                for (const _e3798 of _l3796) _f3795[_e3798] = -1;
                _l3796 = _a3794;
                let _i3800 = 0;
                _s3797[0] = 0;
                let _o3804 = _a3794.length === 0;
                for (;;) {
                  if (_a3794.length === 0) {
                    if (!_o3804) break;
                    _o3804 = false;
                  }
                  while (_a3794.length > 0 && _i3800 >= 0) {
                    const _e3798 = _a3794[_i3800];
                    if (_s3797[_i3800] > 0) _f3795[_e3798] = -1;
                    let _r3803 = (cands[_e3798] >= 0 ? cands[_e3798] : (cands[_e3798] = b.cands[_e3798])) & ~((2 << _s3797[_i3800]) - 1);
                    let _d3799 = 0;
                    V3802: for (; _r3803 !== 0; _r3803 &= _r3803 - 1) {
                      _d3799 = 31 - Math.clz32(_r3803 & -_r3803);
                      _f3795[_e3798] = _d3799;
                      if (_e3798 === v_x && _d3799 !== 1) continue;
                      if (_e3798 === v_y && _d3799 !== 1) continue;
                      for (let _j3801 = 0; _j3801 < _i3800; _j3801++) {
                        const _y3805 = _a3794[_j3801];
                        if (!(((((_k3628[_t3749] ?? arms(sp, cl, _t3749)) === 2) && (_f3795[_e3798] === 1)) && (_f3795[_y3805] === 1)))) continue;
                        if (!((bent(sp, _e3798, _y3805) === (clueAt(cl.piece, _t3749) === 3)))) continue V3802;
                      }
                      break;
                    }
                    if (_r3803 === 0) {
                      _s3797[_i3800] = 0;
                      _i3800--;
                      continue;
                    }
                    _s3797[_i3800] = _d3799;
                    if (_i3800 === _a3794.length - 1) break;
                    _i3800++;
                    _s3797[_i3800] = 0;
                  }
                  if (_i3800 < 0) break;
                  let _g3806 = 0;
                  G3807: {
                    const _a3808 = sp.cellEdges[_t3749];
                    for (let _i3809 = 0; _i3809 < _a3808.length; _i3809++) {
                      const v_z = _a3808[_i3809];
                      if (!((_f3795[v_z] === 1))) continue;
                      _g3806++;
                    }
                  }
                  if (!((_g3806 === (_k3628[_t3749] ?? arms(sp, cl, _t3749))))) continue;
                  if (true) {
                    _q3792 = true;
                    break Q3793;
                  }
                }
              }
              _c3810 = _q3792;
            }
            if (!(_c3810)) continue;
            const _t3813 = (sp.edgeEnds[2 * v_y] === _t3749 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t3816 = _eg3814.of(_t3813);
            let _gs3818 = _memo3817.get(_t3816);
            if (_gs3818 === undefined) {
              _g3819.length = 0;
              _st3826.pass++;
              G3820: {
                const _a3827 = _t3816;
                for (let _i3828 = 0; _i3828 < _a3827.length; _i3828++) {
                  const v_t = _a3827[_i3828];
                  if (!(((_k3628[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a3829 = sp.cellEdges[v_t];
                  for (let _i3830 = 0; _i3830 < _a3829.length; _i3830++) {
                    const v_y = _a3829[_i3830];
                    L3831: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k3628[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm3832[v_y + 1] === 1)))) break L3831;
                      const _t3833 = v_z;
                      if (_g3819.length < 16) { if (!_g3819.includes(_t3833)) _g3819.push(_t3833); } else addOnce(_g3819, _st3826, _t3833);
                    }
                  }
                }
              }
              _gs3818 = _g3819.slice();
              _memo3817.set(_t3816, _gs3818);
            }
            const _a3834 = union(_eg3814.of(_t3813), _gs3818);
            for (let _i3835 = 0; _i3835 < _a3834.length; _i3835++) {
              const v_t = _a3834[_i3835];
              const _t3836 = v_t;
              if (_g3750.length < 16) { if (!_g3750.includes(_t3836)) _g3750.push(_t3836); } else addOnce(_g3750, _st3789, _t3836);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t3749), _g3750)).length >= _h3837))) continue;
        _g3666.push(v_x);
      }
    }
    const v_K = _g3666;
    let _g3843 = -1;
    let _g4051 = -1;
    const _a3838 = sp.cellEdges[v_c];
    for (let _i3839 = 0; _i3839 < _a3838.length; _i3839++) {
      const v_e = _a3838[_i3839];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g3843 !== _epoch) {
        _g3843 = _epoch;
        for (const _e3844 of _l3841) _p3840[_e3844] = 0;
        _y3842 = false;
        const _a3845 = sp.cellEdges[v_c];
        for (const _e3849 of _l3847) _f3846[_e3849] = -1;
        _l3847 = _a3845;
        let _i3851 = 0;
        _s3848[0] = 0;
        let _o3855 = _a3845.length === 0;
        for (;;) {
          if (_a3845.length === 0) {
            if (!_o3855) break;
            _o3855 = false;
          }
          while (_a3845.length > 0 && _i3851 >= 0) {
            const _e3849 = _a3845[_i3851];
            if (_s3848[_i3851] > 0) _f3846[_e3849] = -1;
            let _r3854 = (cands[_e3849] >= 0 ? cands[_e3849] : (cands[_e3849] = b.cands[_e3849])) & ~((2 << _s3848[_i3851]) - 1);
            let _d3850 = 0;
            V3853: for (; _r3854 !== 0; _r3854 &= _r3854 - 1) {
              _d3850 = 31 - Math.clz32(_r3854 & -_r3854);
              _f3846[_e3849] = _d3850;
              for (let _j3852 = 0; _j3852 < _i3851; _j3852++) {
                const _y3856 = _a3845[_j3852];
                if (!(((((_k3628[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f3846[_e3849] === 1)) && (_f3846[_y3856] === 1)))) continue;
                if (!((bent(sp, _e3849, _y3856) === (clueAt(cl.piece, v_c) === 3)))) continue V3853;
              }
              for (let _j3852 = 0; _j3852 < _i3851; _j3852++) {
                const _y3857 = _a3845[_j3852];
                if (!(((((_f3846[_e3849] === 1) && (_f3846[_y3857] === 1)) && !((b.grid[_e3849] !== 0))) && !((b.grid[_y3857] !== 0))))) continue;
                if (!(!(_eg3665.of((sp.edgeEnds[2 * _y3857] === v_c ? sp.edgeEnds[2 * _y3857 + 1] : sp.edgeEnds[2 * _y3857])) === _eg3665.of((sp.edgeEnds[2 * _e3849] === v_c ? sp.edgeEnds[2 * _e3849 + 1] : sp.edgeEnds[2 * _e3849]))))) continue V3853;
              }
              break;
            }
            if (_r3854 === 0) {
              _s3848[_i3851] = 0;
              _i3851--;
              continue;
            }
            _s3848[_i3851] = _d3850;
            if (_i3851 === _a3845.length - 1) break;
            _i3851++;
            _s3848[_i3851] = 0;
          }
          if (_i3851 < 0) break;
          let _g3858 = 0;
          G3859: {
            const _a3860 = sp.cellEdges[v_c];
            for (let _i3861 = 0; _i3861 < _a3860.length; _i3861++) {
              const v_x = _a3860[_i3861];
              if (!((_f3846[v_x] === 1))) continue;
              _g3858++;
            }
          }
          let _c3866: boolean = (_g3858 === (_k3628[v_c] ?? arms(sp, cl, v_c)));
          if (_c3866) {
            let _q3862 = true;
            Q3863: {
              const _a3864 = sp.cellEdges[v_c];
              for (let _i3865 = 0; _i3865 < _a3864.length; _i3865++) {
                const v_x = _a3864[_i3865];
                if (!(((_f3846[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg3665.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q3862 = false;
                  break Q3863;
                }
              }
            }
            _c3866 = _q3862;
          }
          let _c4047: boolean = _c3866;
          if (_c4047) {
            let _q3867 = false;
            Q3868: {
              const _a3869 = sp.cellEdges[v_c];
              for (let _i3870 = 0; _i3870 < _a3869.length; _i3870++) {
                const v_x = _a3869[_i3870];
                if (!((_f3846[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q3867 = true;
                  break Q3868;
                }
              }
            }
            let _c4046: boolean = _q3867;
            if (!_c4046) {
              _g3871.length = 0;
              _st3954.pass++;
              G3872: {
                const _a3955 = sp.cellEdges[v_c];
                for (let _i3956 = 0; _i3956 < _a3955.length; _i3956++) {
                  const v_x = _a3955[_i3956];
                  if (!((_f3846[v_x] === 1))) continue;
                  const _t3957 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h4019 = minus(_h3811, sp.cellEdges[_t3957]);
                  const _eg4021 = edgeGroups(sp, _h4019);
                  const _memo4024 = new Map<readonly number[], readonly number[]>();
                  _g3958.length = 0;
                  _st3997.pass++;
                  G3959: {
                    const _a3998 = sp.cellEdges[_t3957];
                    for (let _i3999 = 0; _i3999 < _a3998.length; _i3999++) {
                      const v_y = _a3998[_i3999];
                      let _c4018: boolean = (v_y !== v_x);
                      if (_c4018) {
                        let _q4000 = false;
                        Q4001: {
                          const _a4002 = sp.cellEdges[_t3957];
                          for (const _e4006 of _l4004) _f4003[_e4006] = -1;
                          _l4004 = _a4002;
                          let _i4008 = 0;
                          _s4005[0] = 0;
                          let _o4012 = _a4002.length === 0;
                          for (;;) {
                            if (_a4002.length === 0) {
                              if (!_o4012) break;
                              _o4012 = false;
                            }
                            while (_a4002.length > 0 && _i4008 >= 0) {
                              const _e4006 = _a4002[_i4008];
                              if (_s4005[_i4008] > 0) _f4003[_e4006] = -1;
                              let _r4011 = (cands[_e4006] >= 0 ? cands[_e4006] : (cands[_e4006] = b.cands[_e4006])) & ~((2 << _s4005[_i4008]) - 1);
                              let _d4007 = 0;
                              V4010: for (; _r4011 !== 0; _r4011 &= _r4011 - 1) {
                                _d4007 = 31 - Math.clz32(_r4011 & -_r4011);
                                _f4003[_e4006] = _d4007;
                                if (_e4006 === v_x && _d4007 !== 1) continue;
                                if (_e4006 === v_y && _d4007 !== 1) continue;
                                for (let _j4009 = 0; _j4009 < _i4008; _j4009++) {
                                  const _y4013 = _a4002[_j4009];
                                  if (!(((((_k3628[_t3957] ?? arms(sp, cl, _t3957)) === 2) && (_f4003[_e4006] === 1)) && (_f4003[_y4013] === 1)))) continue;
                                  if (!((bent(sp, _e4006, _y4013) === (clueAt(cl.piece, _t3957) === 3)))) continue V4010;
                                }
                                break;
                              }
                              if (_r4011 === 0) {
                                _s4005[_i4008] = 0;
                                _i4008--;
                                continue;
                              }
                              _s4005[_i4008] = _d4007;
                              if (_i4008 === _a4002.length - 1) break;
                              _i4008++;
                              _s4005[_i4008] = 0;
                            }
                            if (_i4008 < 0) break;
                            let _g4014 = 0;
                            G4015: {
                              const _a4016 = sp.cellEdges[_t3957];
                              for (let _i4017 = 0; _i4017 < _a4016.length; _i4017++) {
                                const v_z = _a4016[_i4017];
                                if (!((_f4003[v_z] === 1))) continue;
                                _g4014++;
                              }
                            }
                            if (!((_g4014 === (_k3628[_t3957] ?? arms(sp, cl, _t3957))))) continue;
                            if (true) {
                              _q4000 = true;
                              break Q4001;
                            }
                          }
                        }
                        _c4018 = _q4000;
                      }
                      if (!(_c4018)) continue;
                      const _t4020 = (sp.edgeEnds[2 * v_y] === _t3957 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t4023 = _eg4021.of(_t4020);
                      let _gs4025 = _memo4024.get(_t4023);
                      if (_gs4025 === undefined) {
                        _g4026.length = 0;
                        _st4033.pass++;
                        G4027: {
                          const _a4034 = _t4023;
                          for (let _i4035 = 0; _i4035 < _a4034.length; _i4035++) {
                            const v_t = _a4034[_i4035];
                            if (!(((_k3628[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a4036 = sp.cellEdges[v_t];
                            for (let _i4037 = 0; _i4037 < _a4036.length; _i4037++) {
                              const v_y = _a4036[_i4037];
                              L4038: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k3628[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm3832[v_y + 1] === 1)))) break L4038;
                                const _t4039 = v_z;
                                if (_g4026.length < 16) { if (!_g4026.includes(_t4039)) _g4026.push(_t4039); } else addOnce(_g4026, _st4033, _t4039);
                              }
                            }
                          }
                        }
                        _gs4025 = _g4026.slice();
                        _memo4024.set(_t4023, _gs4025);
                      }
                      const _a4040 = union(_eg4021.of(_t4020), _gs4025);
                      for (let _i4041 = 0; _i4041 < _a4040.length; _i4041++) {
                        const v_t = _a4040[_i4041];
                        const _t4042 = v_t;
                        if (_g3958.length < 16) { if (!_g3958.includes(_t4042)) _g3958.push(_t4042); } else addOnce(_g3958, _st3997, _t4042);
                      }
                    }
                  }
                  const _a4043 = union(setOf(_t3957), _g3958);
                  for (let _i4044 = 0; _i4044 < _a4043.length; _i4044++) {
                    const v_t = _a4043[_i4044];
                    const _t4045 = v_t;
                    if (_g3871.length < 16) { if (!_g3871.includes(_t4045)) _g3871.push(_t4045); } else addOnce(_g3871, _st3954, _t4045);
                  }
                }
              }
              _c4046 = (union(setOf(v_c), _g3871).length >= _h3837);
            }
            _c4047 = _c4046;
          }
          if (!(_c4047)) continue;
          if (!(true)) continue;
          _l3841 = _a3845;
          _y3842 = true;
          for (const _e3844 of _a3845) _p3840[_e3844] |= 1 << _f3846[_e3844];
        }
      }
      const v_A = ((((_p3840[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y3842 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g4051 !== _epoch) {
        _g4051 = _epoch;
        for (const _e4052 of _l4049) _p4048[_e4052] = 0;
        _y4050 = false;
        const _a4053 = sp.cellEdges[v_c];
        for (const _e4057 of _l4055) _f4054[_e4057] = -1;
        _l4055 = _a4053;
        let _i4059 = 0;
        _s4056[0] = 0;
        let _o4063 = _a4053.length === 0;
        for (;;) {
          if (_a4053.length === 0) {
            if (!_o4063) break;
            _o4063 = false;
          }
          while (_a4053.length > 0 && _i4059 >= 0) {
            const _e4057 = _a4053[_i4059];
            if (_s4056[_i4059] > 0) _f4054[_e4057] = -1;
            let _r4062 = (cands[_e4057] >= 0 ? cands[_e4057] : (cands[_e4057] = b.cands[_e4057])) & ~((2 << _s4056[_i4059]) - 1);
            let _d4058 = 0;
            V4061: for (; _r4062 !== 0; _r4062 &= _r4062 - 1) {
              _d4058 = 31 - Math.clz32(_r4062 & -_r4062);
              _f4054[_e4057] = _d4058;
              for (let _j4060 = 0; _j4060 < _i4059; _j4060++) {
                const _y4064 = _a4053[_j4060];
                if (!(((((_k3628[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f4054[_e4057] === 1)) && (_f4054[_y4064] === 1)))) continue;
                if (!((bent(sp, _e4057, _y4064) === (clueAt(cl.piece, v_c) === 3)))) continue V4061;
              }
              for (let _j4060 = 0; _j4060 < _i4059; _j4060++) {
                const _y4065 = _a4053[_j4060];
                if (!(((((_f4054[_e4057] === 1) && (_f4054[_y4065] === 1)) && !((b.grid[_e4057] !== 0))) && !((b.grid[_y4065] !== 0))))) continue;
                if (!(!(_eg3665.of((sp.edgeEnds[2 * _y4065] === v_c ? sp.edgeEnds[2 * _y4065 + 1] : sp.edgeEnds[2 * _y4065])) === _eg3665.of((sp.edgeEnds[2 * _e4057] === v_c ? sp.edgeEnds[2 * _e4057 + 1] : sp.edgeEnds[2 * _e4057]))))) continue V4061;
              }
              break;
            }
            if (_r4062 === 0) {
              _s4056[_i4059] = 0;
              _i4059--;
              continue;
            }
            _s4056[_i4059] = _d4058;
            if (_i4059 === _a4053.length - 1) break;
            _i4059++;
            _s4056[_i4059] = 0;
          }
          if (_i4059 < 0) break;
          let _g4066 = 0;
          G4067: {
            const _a4068 = sp.cellEdges[v_c];
            for (let _i4069 = 0; _i4069 < _a4068.length; _i4069++) {
              const v_x = _a4068[_i4069];
              if (!((_f4054[v_x] === 1))) continue;
              _g4066++;
            }
          }
          let _c4074: boolean = (_g4066 === (_k3628[v_c] ?? arms(sp, cl, v_c)));
          if (_c4074) {
            let _q4070 = true;
            Q4071: {
              const _a4072 = sp.cellEdges[v_c];
              for (let _i4073 = 0; _i4073 < _a4072.length; _i4073++) {
                const v_x = _a4072[_i4073];
                if (!(((_f4054[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg3665.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q4070 = false;
                  break Q4071;
                }
              }
            }
            _c4074 = _q4070;
          }
          let _c4255: boolean = _c4074;
          if (_c4255) {
            let _q4075 = false;
            Q4076: {
              const _a4077 = sp.cellEdges[v_c];
              for (let _i4078 = 0; _i4078 < _a4077.length; _i4078++) {
                const v_x = _a4077[_i4078];
                if (!((_f4054[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q4075 = true;
                  break Q4076;
                }
              }
            }
            let _c4254: boolean = _q4075;
            if (!_c4254) {
              _g4079.length = 0;
              _st4162.pass++;
              G4080: {
                const _a4163 = sp.cellEdges[v_c];
                for (let _i4164 = 0; _i4164 < _a4163.length; _i4164++) {
                  const v_x = _a4163[_i4164];
                  if (!((_f4054[v_x] === 1))) continue;
                  const _t4165 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h4227 = minus(_h3811, sp.cellEdges[_t4165]);
                  const _eg4229 = edgeGroups(sp, _h4227);
                  const _memo4232 = new Map<readonly number[], readonly number[]>();
                  _g4166.length = 0;
                  _st4205.pass++;
                  G4167: {
                    const _a4206 = sp.cellEdges[_t4165];
                    for (let _i4207 = 0; _i4207 < _a4206.length; _i4207++) {
                      const v_y = _a4206[_i4207];
                      let _c4226: boolean = (v_y !== v_x);
                      if (_c4226) {
                        let _q4208 = false;
                        Q4209: {
                          const _a4210 = sp.cellEdges[_t4165];
                          for (const _e4214 of _l4212) _f4211[_e4214] = -1;
                          _l4212 = _a4210;
                          let _i4216 = 0;
                          _s4213[0] = 0;
                          let _o4220 = _a4210.length === 0;
                          for (;;) {
                            if (_a4210.length === 0) {
                              if (!_o4220) break;
                              _o4220 = false;
                            }
                            while (_a4210.length > 0 && _i4216 >= 0) {
                              const _e4214 = _a4210[_i4216];
                              if (_s4213[_i4216] > 0) _f4211[_e4214] = -1;
                              let _r4219 = (cands[_e4214] >= 0 ? cands[_e4214] : (cands[_e4214] = b.cands[_e4214])) & ~((2 << _s4213[_i4216]) - 1);
                              let _d4215 = 0;
                              V4218: for (; _r4219 !== 0; _r4219 &= _r4219 - 1) {
                                _d4215 = 31 - Math.clz32(_r4219 & -_r4219);
                                _f4211[_e4214] = _d4215;
                                if (_e4214 === v_x && _d4215 !== 1) continue;
                                if (_e4214 === v_y && _d4215 !== 1) continue;
                                for (let _j4217 = 0; _j4217 < _i4216; _j4217++) {
                                  const _y4221 = _a4210[_j4217];
                                  if (!(((((_k3628[_t4165] ?? arms(sp, cl, _t4165)) === 2) && (_f4211[_e4214] === 1)) && (_f4211[_y4221] === 1)))) continue;
                                  if (!((bent(sp, _e4214, _y4221) === (clueAt(cl.piece, _t4165) === 3)))) continue V4218;
                                }
                                break;
                              }
                              if (_r4219 === 0) {
                                _s4213[_i4216] = 0;
                                _i4216--;
                                continue;
                              }
                              _s4213[_i4216] = _d4215;
                              if (_i4216 === _a4210.length - 1) break;
                              _i4216++;
                              _s4213[_i4216] = 0;
                            }
                            if (_i4216 < 0) break;
                            let _g4222 = 0;
                            G4223: {
                              const _a4224 = sp.cellEdges[_t4165];
                              for (let _i4225 = 0; _i4225 < _a4224.length; _i4225++) {
                                const v_z = _a4224[_i4225];
                                if (!((_f4211[v_z] === 1))) continue;
                                _g4222++;
                              }
                            }
                            if (!((_g4222 === (_k3628[_t4165] ?? arms(sp, cl, _t4165))))) continue;
                            if (true) {
                              _q4208 = true;
                              break Q4209;
                            }
                          }
                        }
                        _c4226 = _q4208;
                      }
                      if (!(_c4226)) continue;
                      const _t4228 = (sp.edgeEnds[2 * v_y] === _t4165 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t4231 = _eg4229.of(_t4228);
                      let _gs4233 = _memo4232.get(_t4231);
                      if (_gs4233 === undefined) {
                        _g4234.length = 0;
                        _st4241.pass++;
                        G4235: {
                          const _a4242 = _t4231;
                          for (let _i4243 = 0; _i4243 < _a4242.length; _i4243++) {
                            const v_t = _a4242[_i4243];
                            if (!(((_k3628[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a4244 = sp.cellEdges[v_t];
                            for (let _i4245 = 0; _i4245 < _a4244.length; _i4245++) {
                              const v_y = _a4244[_i4245];
                              L4246: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k3628[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm3832[v_y + 1] === 1)))) break L4246;
                                const _t4247 = v_z;
                                if (_g4234.length < 16) { if (!_g4234.includes(_t4247)) _g4234.push(_t4247); } else addOnce(_g4234, _st4241, _t4247);
                              }
                            }
                          }
                        }
                        _gs4233 = _g4234.slice();
                        _memo4232.set(_t4231, _gs4233);
                      }
                      const _a4248 = union(_eg4229.of(_t4228), _gs4233);
                      for (let _i4249 = 0; _i4249 < _a4248.length; _i4249++) {
                        const v_t = _a4248[_i4249];
                        const _t4250 = v_t;
                        if (_g4166.length < 16) { if (!_g4166.includes(_t4250)) _g4166.push(_t4250); } else addOnce(_g4166, _st4205, _t4250);
                      }
                    }
                  }
                  const _a4251 = union(setOf(_t4165), _g4166);
                  for (let _i4252 = 0; _i4252 < _a4251.length; _i4252++) {
                    const v_t = _a4251[_i4252];
                    const _t4253 = v_t;
                    if (_g4079.length < 16) { if (!_g4079.includes(_t4253)) _g4079.push(_t4253); } else addOnce(_g4079, _st4162, _t4253);
                  }
                }
              }
              _c4254 = (union(setOf(v_c), _g4079).length >= _h3837);
            }
            _c4255 = _c4254;
          }
          if (!(_c4255)) continue;
          if (!(true)) continue;
          _l4049 = _a4053;
          _y4050 = true;
          for (const _e4052 of _a4053) _p4048[_e4052] |= 1 << _f4054[_e4052];
        }
      }
      L4256: {
        const v_B = ((((_p4048[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y4050 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L4256;
        if (b.made[0] !== _m277_0 || b.made[1] !== _m280_1) {
          _g4257.length = 0;
          G4258: {
            const _a4261 = sp.edges;
            for (let _i4262 = 0; _i4262 < _a4261.length; _i4262++) {
              const v_e = _a4261[_i4262];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g4257.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g4257))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _c4264: boolean = (v_A || v_B);
        if (_c4264) {
          let _c4263: boolean = !(!(v_A));
          if (!_c4263) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c4263 = true;
          }
          _c4264 = _c4263;
        }
        let _c4266: boolean = _c4264;
        if (_c4266) {
          let _c4265: boolean = !(!(v_B));
          if (!_c4265) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c4265 = true;
          }
          _c4266 = _c4265;
        }
        if (!(_c4266)) return -1;
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
let _f5564 = new Int32Array(0);
let _l5565: readonly number[] = [];
let _f5584 = new Int32Array(0);
let _l5585: readonly number[] = [];
const _st5740 = stamps();
let _f5746 = new Int32Array(0);
let _l5747: readonly number[] = [];
const _st5777 = stamps();
let _p6035 = new Int32Array(0);
let _l6036: readonly number[] = [];
let _f6041 = new Int32Array(0);
let _l6042: readonly number[] = [];
const _st6149 = stamps();
const _st6192 = stamps();
let _f6198 = new Int32Array(0);
let _l6199: readonly number[] = [];
const _st6228 = stamps();
let _f6262 = new Int32Array(0);
let _l6263: readonly number[] = [];
let _p6536 = new Int32Array(0);
let _l6537: readonly number[] = [];
let _f6542 = new Int32Array(0);
let _l6543: readonly number[] = [];
const _st6650 = stamps();
const _st6693 = stamps();
let _f6699 = new Int32Array(0);
let _l6700: readonly number[] = [];
const _st6729 = stamps();
let _f6763 = new Int32Array(0);
let _l6764: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandLockBinding> | null): number {
  const _g5509: number[] = [];
  const _g5515: number[] = [];
  if (_f5564.length < sp.edges.length) _f5564 = new Int32Array(sp.edges.length).fill(-1);
  else _f5564.fill(-1);
  _l5565 = [];
  const _s5566: number[] = [];
  if (_f5584.length < sp.edges.length) _f5584 = new Int32Array(sp.edges.length).fill(-1);
  else _f5584.fill(-1);
  _l5585 = [];
  const _s5586: number[] = [];
  const _g5600: number[] = [];
  const _g5608: number[] = [];
  const _g5617: number[] = [];
  const _g5701: number[] = [];
  if (_f5746.length < sp.edges.length) _f5746 = new Int32Array(sp.edges.length).fill(-1);
  else _f5746.fill(-1);
  _l5747 = [];
  const _s5748: number[] = [];
  const _g5770: number[] = [];
  const _g5789: number[] = [];
  if (_p6035.length < sp.edges.length) _p6035 = new Int32Array(sp.edges.length);
  else _p6035.fill(0);
  _l6036 = [];
  let _y6037 = false;
  if (_f6041.length < sp.edges.length) _f6041 = new Int32Array(sp.edges.length).fill(-1);
  else _f6041.fill(-1);
  _l6042 = [];
  const _s6043: number[] = [];
  const _g6066: number[] = [];
  const _g6153: number[] = [];
  if (_f6198.length < sp.edges.length) _f6198 = new Int32Array(sp.edges.length).fill(-1);
  else _f6198.fill(-1);
  _l6199 = [];
  const _s6200: number[] = [];
  const _g6221: number[] = [];
  const _g6245: number[] = [];
  if (_f6262.length < sp.edges.length) _f6262 = new Int32Array(sp.edges.length).fill(-1);
  else _f6262.fill(-1);
  _l6263 = [];
  const _s6264: number[] = [];
  const _g6290: number[] = [];
  if (_p6536.length < sp.edges.length) _p6536 = new Int32Array(sp.edges.length);
  else _p6536.fill(0);
  _l6537 = [];
  let _y6538 = false;
  if (_f6542.length < sp.edges.length) _f6542 = new Int32Array(sp.edges.length).fill(-1);
  else _f6542.fill(-1);
  _l6543 = [];
  const _s6544: number[] = [];
  const _g6567: number[] = [];
  const _g6654: number[] = [];
  if (_f6699.length < sp.edges.length) _f6699 = new Int32Array(sp.edges.length).fill(-1);
  else _f6699.fill(-1);
  _l6700 = [];
  const _s6701: number[] = [];
  const _g6722: number[] = [];
  const _g6746: number[] = [];
  if (_f6763.length < sp.edges.length) _f6763 = new Int32Array(sp.edges.length).fill(-1);
  else _f6763.fill(-1);
  _l6764 = [];
  const _s6765: number[] = [];
  const _g6796: number[] = [];
  const facts = strandLockFacts;
  let fired = 0;
  let changed = false;
  const _k5575 = armsKept.board(cl);
  const _h5788 = sp.cells.length;
  let _epoch = 0;
  if (strandLockCands.length < sp.edges.length) strandLockCands = new Int32Array(sp.edges.length);
  const cands = strandLockCands;
  cands.fill(-1);
  const _m394_0 = b.made[0];
  _g5509.length = 0;
  G5510: {
    const _a5513 = sp.edges;
    for (let _i5514 = 0; _i5514 < _a5513.length; _i5514++) {
      const v_e = _a5513[_i5514];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g5509.push(v_e);
    }
  }
  const v_L = _g5509;
  const _m397_1 = b.made[1];
  const _eg5616 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g5515.length = 0;
  G5516: {
    const _a5558 = sp.edges;
    for (let _i5559 = 0; _i5559 < _a5558.length; _i5559++) {
      const v_e = _a5558[_i5559];
      const _t5560 = sp.edgeEnds[2 * v_e];
      let _q5561 = false;
      Q5562: {
        const _a5563 = sp.cellEdges[_t5560];
        for (const _e5567 of _l5565) _f5564[_e5567] = -1;
        _l5565 = _a5563;
        let _i5569 = 0;
        _s5566[0] = 0;
        let _o5573 = _a5563.length === 0;
        for (;;) {
          if (_a5563.length === 0) {
            if (!_o5573) break;
            _o5573 = false;
          }
          while (_a5563.length > 0 && _i5569 >= 0) {
            const _e5567 = _a5563[_i5569];
            if (_s5566[_i5569] > 0) _f5564[_e5567] = -1;
            let _r5572 = (cands[_e5567] >= 0 ? cands[_e5567] : (cands[_e5567] = b.cands[_e5567])) & ~((2 << _s5566[_i5569]) - 1);
            let _d5568 = 0;
            V5571: for (; _r5572 !== 0; _r5572 &= _r5572 - 1) {
              _d5568 = 31 - Math.clz32(_r5572 & -_r5572);
              _f5564[_e5567] = _d5568;
              if (_e5567 === v_e && _d5568 !== 1) continue;
              for (let _j5570 = 0; _j5570 < _i5569; _j5570++) {
                const _y5574 = _a5563[_j5570];
                if (!(((((_k5575[_t5560] ?? arms(sp, cl, _t5560)) === 2) && (_f5564[_e5567] === 1)) && (_f5564[_y5574] === 1)))) continue;
                if (!((bent(sp, _e5567, _y5574) === (clueAt(cl.piece, _t5560) === 3)))) continue V5571;
              }
              break;
            }
            if (_r5572 === 0) {
              _s5566[_i5569] = 0;
              _i5569--;
              continue;
            }
            _s5566[_i5569] = _d5568;
            if (_i5569 === _a5563.length - 1) break;
            _i5569++;
            _s5566[_i5569] = 0;
          }
          if (_i5569 < 0) break;
          let _g5576 = 0;
          G5577: {
            const _a5578 = sp.cellEdges[_t5560];
            for (let _i5579 = 0; _i5579 < _a5578.length; _i5579++) {
              const v_x = _a5578[_i5579];
              if (!((_f5564[v_x] === 1))) continue;
              _g5576++;
            }
          }
          if (!((_g5576 === (_k5575[_t5560] ?? arms(sp, cl, _t5560))))) continue;
          if (true) {
            _q5561 = true;
            break Q5562;
          }
        }
      }
      let _c5599: boolean = _q5561;
      if (_c5599) {
        const _t5580 = sp.edgeEnds[2 * v_e + 1];
        let _q5581 = false;
        Q5582: {
          const _a5583 = sp.cellEdges[_t5580];
          for (const _e5587 of _l5585) _f5584[_e5587] = -1;
          _l5585 = _a5583;
          let _i5589 = 0;
          _s5586[0] = 0;
          let _o5593 = _a5583.length === 0;
          for (;;) {
            if (_a5583.length === 0) {
              if (!_o5593) break;
              _o5593 = false;
            }
            while (_a5583.length > 0 && _i5589 >= 0) {
              const _e5587 = _a5583[_i5589];
              if (_s5586[_i5589] > 0) _f5584[_e5587] = -1;
              let _r5592 = (cands[_e5587] >= 0 ? cands[_e5587] : (cands[_e5587] = b.cands[_e5587])) & ~((2 << _s5586[_i5589]) - 1);
              let _d5588 = 0;
              V5591: for (; _r5592 !== 0; _r5592 &= _r5592 - 1) {
                _d5588 = 31 - Math.clz32(_r5592 & -_r5592);
                _f5584[_e5587] = _d5588;
                if (_e5587 === v_e && _d5588 !== 1) continue;
                for (let _j5590 = 0; _j5590 < _i5589; _j5590++) {
                  const _y5594 = _a5583[_j5590];
                  if (!(((((_k5575[_t5580] ?? arms(sp, cl, _t5580)) === 2) && (_f5584[_e5587] === 1)) && (_f5584[_y5594] === 1)))) continue;
                  if (!((bent(sp, _e5587, _y5594) === (clueAt(cl.piece, _t5580) === 3)))) continue V5591;
                }
                break;
              }
              if (_r5592 === 0) {
                _s5586[_i5589] = 0;
                _i5589--;
                continue;
              }
              _s5586[_i5589] = _d5588;
              if (_i5589 === _a5583.length - 1) break;
              _i5589++;
              _s5586[_i5589] = 0;
            }
            if (_i5589 < 0) break;
            let _g5595 = 0;
            G5596: {
              const _a5597 = sp.cellEdges[_t5580];
              for (let _i5598 = 0; _i5598 < _a5597.length; _i5598++) {
                const v_x = _a5597[_i5598];
                if (!((_f5584[v_x] === 1))) continue;
                _g5595++;
              }
            }
            if (!((_g5595 === (_k5575[_t5580] ?? arms(sp, cl, _t5580))))) continue;
            if (true) {
              _q5581 = true;
              break Q5582;
            }
          }
        }
        _c5599 = _q5581;
      }
      if (!(_c5599)) continue;
      _g5515.push(v_e);
    }
  }
  const v_U = _g5515;
  const _mm5783 = memberMarks(v_U);
  _g5600.length = 0;
  G5601: {
    const _a5604 = v_U;
    for (let _i5605 = 0; _i5605 < _a5604.length; _i5605++) {
      const v_e = _a5604[_i5605];
      if (!((((_k5575[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k5575[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g5600.push(v_e);
    }
  }
  const v_P = _g5600;
  const _a5606 = sp.cells;
  for (let _i5607 = 0; _i5607 < _a5606.length; _i5607++) {
    const v_c = _a5606[_i5607];
    const _h5762 = minus(v_P, sp.cellEdges[v_c]);
    _g5608.length = 0;
    G5609: {
      const _a5612 = sp.cellEdges[v_c];
      for (let _i5613 = 0; _i5613 < _a5612.length; _i5613++) {
        const v_e = _a5612[_i5613];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g5608.push(v_e);
      }
    }
    L5614: {
      const v_F = _g5608;
      const _h5615 = v_F.length;
      if (!((_h5615 > 0))) break L5614;
      const v_G = _eg5616.of(v_c);
      _g5617.length = 0;
      G5618: {
        const _a5698 = sp.cellEdges[v_c];
        for (let _i5699 = 0; _i5699 < _a5698.length; _i5699++) {
          const v_x = _a5698[_i5699];
          const _t5700 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h5763 = minus(_h5762, sp.cellEdges[_t5700]);
          const _eg5765 = edgeGroups(sp, _h5763);
          const _memo5768 = new Map<readonly number[], readonly number[]>();
          _g5701.length = 0;
          _st5740.pass++;
          G5702: {
            const _a5741 = sp.cellEdges[_t5700];
            for (let _i5742 = 0; _i5742 < _a5741.length; _i5742++) {
              const v_y = _a5741[_i5742];
              let _c5761: boolean = (v_y !== v_x);
              if (_c5761) {
                let _q5743 = false;
                Q5744: {
                  const _a5745 = sp.cellEdges[_t5700];
                  for (const _e5749 of _l5747) _f5746[_e5749] = -1;
                  _l5747 = _a5745;
                  let _i5751 = 0;
                  _s5748[0] = 0;
                  let _o5755 = _a5745.length === 0;
                  for (;;) {
                    if (_a5745.length === 0) {
                      if (!_o5755) break;
                      _o5755 = false;
                    }
                    while (_a5745.length > 0 && _i5751 >= 0) {
                      const _e5749 = _a5745[_i5751];
                      if (_s5748[_i5751] > 0) _f5746[_e5749] = -1;
                      let _r5754 = (cands[_e5749] >= 0 ? cands[_e5749] : (cands[_e5749] = b.cands[_e5749])) & ~((2 << _s5748[_i5751]) - 1);
                      let _d5750 = 0;
                      V5753: for (; _r5754 !== 0; _r5754 &= _r5754 - 1) {
                        _d5750 = 31 - Math.clz32(_r5754 & -_r5754);
                        _f5746[_e5749] = _d5750;
                        if (_e5749 === v_x && _d5750 !== 1) continue;
                        if (_e5749 === v_y && _d5750 !== 1) continue;
                        for (let _j5752 = 0; _j5752 < _i5751; _j5752++) {
                          const _y5756 = _a5745[_j5752];
                          if (!(((((_k5575[_t5700] ?? arms(sp, cl, _t5700)) === 2) && (_f5746[_e5749] === 1)) && (_f5746[_y5756] === 1)))) continue;
                          if (!((bent(sp, _e5749, _y5756) === (clueAt(cl.piece, _t5700) === 3)))) continue V5753;
                        }
                        break;
                      }
                      if (_r5754 === 0) {
                        _s5748[_i5751] = 0;
                        _i5751--;
                        continue;
                      }
                      _s5748[_i5751] = _d5750;
                      if (_i5751 === _a5745.length - 1) break;
                      _i5751++;
                      _s5748[_i5751] = 0;
                    }
                    if (_i5751 < 0) break;
                    let _g5757 = 0;
                    G5758: {
                      const _a5759 = sp.cellEdges[_t5700];
                      for (let _i5760 = 0; _i5760 < _a5759.length; _i5760++) {
                        const v_z = _a5759[_i5760];
                        if (!((_f5746[v_z] === 1))) continue;
                        _g5757++;
                      }
                    }
                    if (!((_g5757 === (_k5575[_t5700] ?? arms(sp, cl, _t5700))))) continue;
                    if (true) {
                      _q5743 = true;
                      break Q5744;
                    }
                  }
                }
                _c5761 = _q5743;
              }
              if (!(_c5761)) continue;
              const _t5764 = (sp.edgeEnds[2 * v_y] === _t5700 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t5767 = _eg5765.of(_t5764);
              let _gs5769 = _memo5768.get(_t5767);
              if (_gs5769 === undefined) {
                _g5770.length = 0;
                _st5777.pass++;
                G5771: {
                  const _a5778 = _t5767;
                  for (let _i5779 = 0; _i5779 < _a5778.length; _i5779++) {
                    const v_t = _a5778[_i5779];
                    if (!(((_k5575[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a5780 = sp.cellEdges[v_t];
                    for (let _i5781 = 0; _i5781 < _a5780.length; _i5781++) {
                      const v_y = _a5780[_i5781];
                      L5782: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k5575[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5783[v_y + 1] === 1)))) break L5782;
                        const _t5784 = v_z;
                        if (_g5770.length < 16) { if (!_g5770.includes(_t5784)) _g5770.push(_t5784); } else addOnce(_g5770, _st5777, _t5784);
                      }
                    }
                  }
                }
                _gs5769 = _g5770.slice();
                _memo5768.set(_t5767, _gs5769);
              }
              const _a5785 = union(_eg5765.of(_t5764), _gs5769);
              for (let _i5786 = 0; _i5786 < _a5785.length; _i5786++) {
                const v_t = _a5785[_i5786];
                const _t5787 = v_t;
                if (_g5701.length < 16) { if (!_g5701.includes(_t5787)) _g5701.push(_t5787); } else addOnce(_g5701, _st5740, _t5787);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t5700), _g5701)).length >= _h5788))) continue;
          _g5617.push(v_x);
        }
      }
      const v_K = _g5617;
      let _g6038 = -1;
      let _g6539 = -1;
      _g5789.length = 0;
      G5790: {
        const _a6033 = v_F;
        for (let _i6034 = 0; _i6034 < _a6033.length; _i6034++) {
          const v_e = _a6033[_i6034];
          if (_g6038 !== _epoch) {
            _g6038 = _epoch;
            for (const _e6039 of _l6036) _p6035[_e6039] = 0;
            _y6037 = false;
            const _a6040 = sp.cellEdges[v_c];
            for (const _e6044 of _l6042) _f6041[_e6044] = -1;
            _l6042 = _a6040;
            let _i6046 = 0;
            _s6043[0] = 0;
            let _o6050 = _a6040.length === 0;
            for (;;) {
              if (_a6040.length === 0) {
                if (!_o6050) break;
                _o6050 = false;
              }
              while (_a6040.length > 0 && _i6046 >= 0) {
                const _e6044 = _a6040[_i6046];
                if (_s6043[_i6046] > 0) _f6041[_e6044] = -1;
                let _r6049 = (cands[_e6044] >= 0 ? cands[_e6044] : (cands[_e6044] = b.cands[_e6044])) & ~((2 << _s6043[_i6046]) - 1);
                let _d6045 = 0;
                V6048: for (; _r6049 !== 0; _r6049 &= _r6049 - 1) {
                  _d6045 = 31 - Math.clz32(_r6049 & -_r6049);
                  _f6041[_e6044] = _d6045;
                  for (let _j6047 = 0; _j6047 < _i6046; _j6047++) {
                    const _y6051 = _a6040[_j6047];
                    if (!(((((_k5575[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f6041[_e6044] === 1)) && (_f6041[_y6051] === 1)))) continue;
                    if (!((bent(sp, _e6044, _y6051) === (clueAt(cl.piece, v_c) === 3)))) continue V6048;
                  }
                  for (let _j6047 = 0; _j6047 < _i6046; _j6047++) {
                    const _y6052 = _a6040[_j6047];
                    if (!(((((_f6041[_e6044] === 1) && (_f6041[_y6052] === 1)) && !((b.grid[_e6044] !== 0))) && !((b.grid[_y6052] !== 0))))) continue;
                    if (!(!(_eg5616.of((sp.edgeEnds[2 * _y6052] === v_c ? sp.edgeEnds[2 * _y6052 + 1] : sp.edgeEnds[2 * _y6052])) === _eg5616.of((sp.edgeEnds[2 * _e6044] === v_c ? sp.edgeEnds[2 * _e6044 + 1] : sp.edgeEnds[2 * _e6044]))))) continue V6048;
                  }
                  break;
                }
                if (_r6049 === 0) {
                  _s6043[_i6046] = 0;
                  _i6046--;
                  continue;
                }
                _s6043[_i6046] = _d6045;
                if (_i6046 === _a6040.length - 1) break;
                _i6046++;
                _s6043[_i6046] = 0;
              }
              if (_i6046 < 0) break;
              let _g6053 = 0;
              G6054: {
                const _a6055 = sp.cellEdges[v_c];
                for (let _i6056 = 0; _i6056 < _a6055.length; _i6056++) {
                  const v_x = _a6055[_i6056];
                  if (!((_f6041[v_x] === 1))) continue;
                  _g6053++;
                }
              }
              let _c6061: boolean = (_g6053 === (_k5575[v_c] ?? arms(sp, cl, v_c)));
              if (_c6061) {
                let _q6057 = true;
                Q6058: {
                  const _a6059 = sp.cellEdges[v_c];
                  for (let _i6060 = 0; _i6060 < _a6059.length; _i6060++) {
                    const v_x = _a6059[_i6060];
                    if (!(((_f6041[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5616.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q6057 = false;
                      break Q6058;
                    }
                  }
                }
                _c6061 = _q6057;
              }
              let _c6242: boolean = _c6061;
              if (_c6242) {
                let _q6062 = false;
                Q6063: {
                  const _a6064 = sp.cellEdges[v_c];
                  for (let _i6065 = 0; _i6065 < _a6064.length; _i6065++) {
                    const v_x = _a6064[_i6065];
                    if (!((_f6041[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q6062 = true;
                      break Q6063;
                    }
                  }
                }
                let _c6241: boolean = _q6062;
                if (!_c6241) {
                  _g6066.length = 0;
                  _st6149.pass++;
                  G6067: {
                    const _a6150 = sp.cellEdges[v_c];
                    for (let _i6151 = 0; _i6151 < _a6150.length; _i6151++) {
                      const v_x = _a6150[_i6151];
                      if (!((_f6041[v_x] === 1))) continue;
                      const _t6152 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h6214 = minus(_h5762, sp.cellEdges[_t6152]);
                      const _eg6216 = edgeGroups(sp, _h6214);
                      const _memo6219 = new Map<readonly number[], readonly number[]>();
                      _g6153.length = 0;
                      _st6192.pass++;
                      G6154: {
                        const _a6193 = sp.cellEdges[_t6152];
                        for (let _i6194 = 0; _i6194 < _a6193.length; _i6194++) {
                          const v_y = _a6193[_i6194];
                          let _c6213: boolean = (v_y !== v_x);
                          if (_c6213) {
                            let _q6195 = false;
                            Q6196: {
                              const _a6197 = sp.cellEdges[_t6152];
                              for (const _e6201 of _l6199) _f6198[_e6201] = -1;
                              _l6199 = _a6197;
                              let _i6203 = 0;
                              _s6200[0] = 0;
                              let _o6207 = _a6197.length === 0;
                              for (;;) {
                                if (_a6197.length === 0) {
                                  if (!_o6207) break;
                                  _o6207 = false;
                                }
                                while (_a6197.length > 0 && _i6203 >= 0) {
                                  const _e6201 = _a6197[_i6203];
                                  if (_s6200[_i6203] > 0) _f6198[_e6201] = -1;
                                  let _r6206 = (cands[_e6201] >= 0 ? cands[_e6201] : (cands[_e6201] = b.cands[_e6201])) & ~((2 << _s6200[_i6203]) - 1);
                                  let _d6202 = 0;
                                  V6205: for (; _r6206 !== 0; _r6206 &= _r6206 - 1) {
                                    _d6202 = 31 - Math.clz32(_r6206 & -_r6206);
                                    _f6198[_e6201] = _d6202;
                                    if (_e6201 === v_x && _d6202 !== 1) continue;
                                    if (_e6201 === v_y && _d6202 !== 1) continue;
                                    for (let _j6204 = 0; _j6204 < _i6203; _j6204++) {
                                      const _y6208 = _a6197[_j6204];
                                      if (!(((((_k5575[_t6152] ?? arms(sp, cl, _t6152)) === 2) && (_f6198[_e6201] === 1)) && (_f6198[_y6208] === 1)))) continue;
                                      if (!((bent(sp, _e6201, _y6208) === (clueAt(cl.piece, _t6152) === 3)))) continue V6205;
                                    }
                                    break;
                                  }
                                  if (_r6206 === 0) {
                                    _s6200[_i6203] = 0;
                                    _i6203--;
                                    continue;
                                  }
                                  _s6200[_i6203] = _d6202;
                                  if (_i6203 === _a6197.length - 1) break;
                                  _i6203++;
                                  _s6200[_i6203] = 0;
                                }
                                if (_i6203 < 0) break;
                                let _g6209 = 0;
                                G6210: {
                                  const _a6211 = sp.cellEdges[_t6152];
                                  for (let _i6212 = 0; _i6212 < _a6211.length; _i6212++) {
                                    const v_z = _a6211[_i6212];
                                    if (!((_f6198[v_z] === 1))) continue;
                                    _g6209++;
                                  }
                                }
                                if (!((_g6209 === (_k5575[_t6152] ?? arms(sp, cl, _t6152))))) continue;
                                if (true) {
                                  _q6195 = true;
                                  break Q6196;
                                }
                              }
                            }
                            _c6213 = _q6195;
                          }
                          if (!(_c6213)) continue;
                          const _t6215 = (sp.edgeEnds[2 * v_y] === _t6152 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6218 = _eg6216.of(_t6215);
                          let _gs6220 = _memo6219.get(_t6218);
                          if (_gs6220 === undefined) {
                            _g6221.length = 0;
                            _st6228.pass++;
                            G6222: {
                              const _a6229 = _t6218;
                              for (let _i6230 = 0; _i6230 < _a6229.length; _i6230++) {
                                const v_t = _a6229[_i6230];
                                if (!(((_k5575[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a6231 = sp.cellEdges[v_t];
                                for (let _i6232 = 0; _i6232 < _a6231.length; _i6232++) {
                                  const v_y = _a6231[_i6232];
                                  L6233: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k5575[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5783[v_y + 1] === 1)))) break L6233;
                                    const _t6234 = v_z;
                                    if (_g6221.length < 16) { if (!_g6221.includes(_t6234)) _g6221.push(_t6234); } else addOnce(_g6221, _st6228, _t6234);
                                  }
                                }
                              }
                            }
                            _gs6220 = _g6221.slice();
                            _memo6219.set(_t6218, _gs6220);
                          }
                          const _a6235 = union(_eg6216.of(_t6215), _gs6220);
                          for (let _i6236 = 0; _i6236 < _a6235.length; _i6236++) {
                            const v_t = _a6235[_i6236];
                            const _t6237 = v_t;
                            if (_g6153.length < 16) { if (!_g6153.includes(_t6237)) _g6153.push(_t6237); } else addOnce(_g6153, _st6192, _t6237);
                          }
                        }
                      }
                      const _a6238 = union(setOf(_t6152), _g6153);
                      for (let _i6239 = 0; _i6239 < _a6238.length; _i6239++) {
                        const v_t = _a6238[_i6239];
                        const _t6240 = v_t;
                        if (_g6066.length < 16) { if (!_g6066.includes(_t6240)) _g6066.push(_t6240); } else addOnce(_g6066, _st6149, _t6240);
                      }
                    }
                  }
                  _c6241 = (union(setOf(v_c), _g6066).length >= _h5788);
                }
                _c6242 = _c6241;
              }
              let _c6289: boolean = _c6242;
              if (_c6289) {
                let _q6243 = true;
                Q6244: {
                  _g6245.length = 0;
                  G6246: {
                    const _a6249 = sp.cellEdges[v_c];
                    for (let _i6250 = 0; _i6250 < _a6249.length; _i6250++) {
                      const v_x = _a6249[_i6250];
                      if (!((_f6041[v_x] === 1))) continue;
                      _g6245.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g6245);
                  const _eg6274 = edgeGroups(sp, v_M);
                  const _a6251 = sp.cellEdges[v_c];
                  for (let _i6252 = 0; _i6252 < _a6251.length; _i6252++) {
                    const v_x = _a6251[_i6252];
                    L6253: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c6258: boolean = (v_j !== v_c);
                      if (_c6258) {
                        let _q6254 = false;
                        Q6255: {
                          const _a6256 = sp.cellEdges[v_j];
                          for (let _i6257 = 0; _i6257 < _a6256.length; _i6257++) {
                            const v_y = _a6256[_i6257];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q6254 = true;
                              break Q6255;
                            }
                          }
                        }
                        _c6258 = _q6254;
                      }
                      if (!(_c6258)) break L6253;
                      let _q6259 = false;
                      Q6260: {
                        const _a6261 = sp.cellEdges[v_j];
                        for (const _e6265 of _l6263) _f6262[_e6265] = -1;
                        _l6263 = _a6261;
                        let _i6267 = 0;
                        _s6264[0] = 0;
                        let _o6271 = _a6261.length === 0;
                        for (;;) {
                          if (_a6261.length === 0) {
                            if (!_o6271) break;
                            _o6271 = false;
                          }
                          while (_a6261.length > 0 && _i6267 >= 0) {
                            const _e6265 = _a6261[_i6267];
                            if (_s6264[_i6267] > 0) _f6262[_e6265] = -1;
                            let _r6270 = (cands[_e6265] >= 0 ? cands[_e6265] : (cands[_e6265] = b.cands[_e6265])) & ~((2 << _s6264[_i6267]) - 1);
                            let _d6266 = 0;
                            V6269: for (; _r6270 !== 0; _r6270 &= _r6270 - 1) {
                              _d6266 = 31 - Math.clz32(_r6270 & -_r6270);
                              _f6262[_e6265] = _d6266;
                              for (let _j6268 = 0; _j6268 < _i6267; _j6268++) {
                                const _y6272 = _a6261[_j6268];
                                if (!(((((_k5575[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f6262[_e6265] === 1)) && (_f6262[_y6272] === 1)))) continue;
                                if (!((bent(sp, _e6265, _y6272) === (clueAt(cl.piece, v_j) === 3)))) continue V6269;
                              }
                              for (let _j6268 = 0; _j6268 < _i6267; _j6268++) {
                                const _y6273 = _a6261[_j6268];
                                if (!(((((((_f6262[_e6265] === 1) && (_f6262[_y6273] === 1)) && !((b.grid[_e6265] !== 0))) && !((b.grid[_y6273] !== 0))) && !([sp.edgeEnds[2 * _e6265], sp.edgeEnds[2 * _e6265 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y6273], sp.edgeEnds[2 * _y6273 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6274.of((sp.edgeEnds[2 * _y6273] === v_j ? sp.edgeEnds[2 * _y6273 + 1] : sp.edgeEnds[2 * _y6273])) === _eg6274.of((sp.edgeEnds[2 * _e6265] === v_j ? sp.edgeEnds[2 * _e6265 + 1] : sp.edgeEnds[2 * _e6265]))))) continue V6269;
                              }
                              break;
                            }
                            if (_r6270 === 0) {
                              _s6264[_i6267] = 0;
                              _i6267--;
                              continue;
                            }
                            _s6264[_i6267] = _d6266;
                            if (_i6267 === _a6261.length - 1) break;
                            _i6267++;
                            _s6264[_i6267] = 0;
                          }
                          if (_i6267 < 0) break;
                          let _q6275 = true;
                          Q6276: {
                            const _a6277 = sp.cellEdges[v_j];
                            for (let _i6278 = 0; _i6278 < _a6277.length; _i6278++) {
                              const v_y = _a6277[_i6278];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f6262[v_y] === _f6041[v_y]))) {
                                _q6275 = false;
                                break Q6276;
                              }
                            }
                          }
                          let _c6283: boolean = _q6275;
                          if (_c6283) {
                            let _g6279 = 0;
                            G6280: {
                              const _a6281 = sp.cellEdges[v_j];
                              for (let _i6282 = 0; _i6282 < _a6281.length; _i6282++) {
                                const v_y = _a6281[_i6282];
                                if (!((_f6262[v_y] === 1))) continue;
                                _g6279++;
                              }
                            }
                            _c6283 = (_g6279 === (_k5575[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c6288: boolean = _c6283;
                          if (_c6288) {
                            let _q6284 = true;
                            Q6285: {
                              const _a6286 = sp.cellEdges[v_j];
                              for (let _i6287 = 0; _i6287 < _a6286.length; _i6287++) {
                                const v_y = _a6286[_i6287];
                                if (!((((_f6262[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6274.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg6274.of(v_j)))) {
                                  _q6284 = false;
                                  break Q6285;
                                }
                              }
                            }
                            _c6288 = _q6284;
                          }
                          if (!(_c6288)) continue;
                          if (true) {
                            _q6259 = true;
                            break Q6260;
                          }
                        }
                      }
                      if (!(_q6259)) {
                        _q6243 = false;
                        break Q6244;
                      }
                    }
                  }
                }
                _c6289 = _q6243;
              }
              if (!(_c6289)) continue;
              if (!(true)) continue;
              _l6036 = _a6040;
              _y6037 = true;
              for (const _e6039 of _a6040) _p6035[_e6039] |= 1 << _f6041[_e6039];
            }
          }
          if (!(((((_p6035[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y6037 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g5789.push(v_e);
        }
      }
      const v_W = _g5789;
      _g6290.length = 0;
      G6291: {
        const _a6534 = v_F;
        for (let _i6535 = 0; _i6535 < _a6534.length; _i6535++) {
          const v_e = _a6534[_i6535];
          if (_g6539 !== _epoch) {
            _g6539 = _epoch;
            for (const _e6540 of _l6537) _p6536[_e6540] = 0;
            _y6538 = false;
            const _a6541 = sp.cellEdges[v_c];
            for (const _e6545 of _l6543) _f6542[_e6545] = -1;
            _l6543 = _a6541;
            let _i6547 = 0;
            _s6544[0] = 0;
            let _o6551 = _a6541.length === 0;
            for (;;) {
              if (_a6541.length === 0) {
                if (!_o6551) break;
                _o6551 = false;
              }
              while (_a6541.length > 0 && _i6547 >= 0) {
                const _e6545 = _a6541[_i6547];
                if (_s6544[_i6547] > 0) _f6542[_e6545] = -1;
                let _r6550 = (cands[_e6545] >= 0 ? cands[_e6545] : (cands[_e6545] = b.cands[_e6545])) & ~((2 << _s6544[_i6547]) - 1);
                let _d6546 = 0;
                V6549: for (; _r6550 !== 0; _r6550 &= _r6550 - 1) {
                  _d6546 = 31 - Math.clz32(_r6550 & -_r6550);
                  _f6542[_e6545] = _d6546;
                  for (let _j6548 = 0; _j6548 < _i6547; _j6548++) {
                    const _y6552 = _a6541[_j6548];
                    if (!(((((_k5575[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f6542[_e6545] === 1)) && (_f6542[_y6552] === 1)))) continue;
                    if (!((bent(sp, _e6545, _y6552) === (clueAt(cl.piece, v_c) === 3)))) continue V6549;
                  }
                  for (let _j6548 = 0; _j6548 < _i6547; _j6548++) {
                    const _y6553 = _a6541[_j6548];
                    if (!(((((_f6542[_e6545] === 1) && (_f6542[_y6553] === 1)) && !((b.grid[_e6545] !== 0))) && !((b.grid[_y6553] !== 0))))) continue;
                    if (!(!(_eg5616.of((sp.edgeEnds[2 * _y6553] === v_c ? sp.edgeEnds[2 * _y6553 + 1] : sp.edgeEnds[2 * _y6553])) === _eg5616.of((sp.edgeEnds[2 * _e6545] === v_c ? sp.edgeEnds[2 * _e6545 + 1] : sp.edgeEnds[2 * _e6545]))))) continue V6549;
                  }
                  break;
                }
                if (_r6550 === 0) {
                  _s6544[_i6547] = 0;
                  _i6547--;
                  continue;
                }
                _s6544[_i6547] = _d6546;
                if (_i6547 === _a6541.length - 1) break;
                _i6547++;
                _s6544[_i6547] = 0;
              }
              if (_i6547 < 0) break;
              let _g6554 = 0;
              G6555: {
                const _a6556 = sp.cellEdges[v_c];
                for (let _i6557 = 0; _i6557 < _a6556.length; _i6557++) {
                  const v_x = _a6556[_i6557];
                  if (!((_f6542[v_x] === 1))) continue;
                  _g6554++;
                }
              }
              let _c6562: boolean = (_g6554 === (_k5575[v_c] ?? arms(sp, cl, v_c)));
              if (_c6562) {
                let _q6558 = true;
                Q6559: {
                  const _a6560 = sp.cellEdges[v_c];
                  for (let _i6561 = 0; _i6561 < _a6560.length; _i6561++) {
                    const v_x = _a6560[_i6561];
                    if (!(((_f6542[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5616.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q6558 = false;
                      break Q6559;
                    }
                  }
                }
                _c6562 = _q6558;
              }
              let _c6743: boolean = _c6562;
              if (_c6743) {
                let _q6563 = false;
                Q6564: {
                  const _a6565 = sp.cellEdges[v_c];
                  for (let _i6566 = 0; _i6566 < _a6565.length; _i6566++) {
                    const v_x = _a6565[_i6566];
                    if (!((_f6542[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q6563 = true;
                      break Q6564;
                    }
                  }
                }
                let _c6742: boolean = _q6563;
                if (!_c6742) {
                  _g6567.length = 0;
                  _st6650.pass++;
                  G6568: {
                    const _a6651 = sp.cellEdges[v_c];
                    for (let _i6652 = 0; _i6652 < _a6651.length; _i6652++) {
                      const v_x = _a6651[_i6652];
                      if (!((_f6542[v_x] === 1))) continue;
                      const _t6653 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h6715 = minus(_h5762, sp.cellEdges[_t6653]);
                      const _eg6717 = edgeGroups(sp, _h6715);
                      const _memo6720 = new Map<readonly number[], readonly number[]>();
                      _g6654.length = 0;
                      _st6693.pass++;
                      G6655: {
                        const _a6694 = sp.cellEdges[_t6653];
                        for (let _i6695 = 0; _i6695 < _a6694.length; _i6695++) {
                          const v_y = _a6694[_i6695];
                          let _c6714: boolean = (v_y !== v_x);
                          if (_c6714) {
                            let _q6696 = false;
                            Q6697: {
                              const _a6698 = sp.cellEdges[_t6653];
                              for (const _e6702 of _l6700) _f6699[_e6702] = -1;
                              _l6700 = _a6698;
                              let _i6704 = 0;
                              _s6701[0] = 0;
                              let _o6708 = _a6698.length === 0;
                              for (;;) {
                                if (_a6698.length === 0) {
                                  if (!_o6708) break;
                                  _o6708 = false;
                                }
                                while (_a6698.length > 0 && _i6704 >= 0) {
                                  const _e6702 = _a6698[_i6704];
                                  if (_s6701[_i6704] > 0) _f6699[_e6702] = -1;
                                  let _r6707 = (cands[_e6702] >= 0 ? cands[_e6702] : (cands[_e6702] = b.cands[_e6702])) & ~((2 << _s6701[_i6704]) - 1);
                                  let _d6703 = 0;
                                  V6706: for (; _r6707 !== 0; _r6707 &= _r6707 - 1) {
                                    _d6703 = 31 - Math.clz32(_r6707 & -_r6707);
                                    _f6699[_e6702] = _d6703;
                                    if (_e6702 === v_x && _d6703 !== 1) continue;
                                    if (_e6702 === v_y && _d6703 !== 1) continue;
                                    for (let _j6705 = 0; _j6705 < _i6704; _j6705++) {
                                      const _y6709 = _a6698[_j6705];
                                      if (!(((((_k5575[_t6653] ?? arms(sp, cl, _t6653)) === 2) && (_f6699[_e6702] === 1)) && (_f6699[_y6709] === 1)))) continue;
                                      if (!((bent(sp, _e6702, _y6709) === (clueAt(cl.piece, _t6653) === 3)))) continue V6706;
                                    }
                                    break;
                                  }
                                  if (_r6707 === 0) {
                                    _s6701[_i6704] = 0;
                                    _i6704--;
                                    continue;
                                  }
                                  _s6701[_i6704] = _d6703;
                                  if (_i6704 === _a6698.length - 1) break;
                                  _i6704++;
                                  _s6701[_i6704] = 0;
                                }
                                if (_i6704 < 0) break;
                                let _g6710 = 0;
                                G6711: {
                                  const _a6712 = sp.cellEdges[_t6653];
                                  for (let _i6713 = 0; _i6713 < _a6712.length; _i6713++) {
                                    const v_z = _a6712[_i6713];
                                    if (!((_f6699[v_z] === 1))) continue;
                                    _g6710++;
                                  }
                                }
                                if (!((_g6710 === (_k5575[_t6653] ?? arms(sp, cl, _t6653))))) continue;
                                if (true) {
                                  _q6696 = true;
                                  break Q6697;
                                }
                              }
                            }
                            _c6714 = _q6696;
                          }
                          if (!(_c6714)) continue;
                          const _t6716 = (sp.edgeEnds[2 * v_y] === _t6653 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6719 = _eg6717.of(_t6716);
                          let _gs6721 = _memo6720.get(_t6719);
                          if (_gs6721 === undefined) {
                            _g6722.length = 0;
                            _st6729.pass++;
                            G6723: {
                              const _a6730 = _t6719;
                              for (let _i6731 = 0; _i6731 < _a6730.length; _i6731++) {
                                const v_t = _a6730[_i6731];
                                if (!(((_k5575[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a6732 = sp.cellEdges[v_t];
                                for (let _i6733 = 0; _i6733 < _a6732.length; _i6733++) {
                                  const v_y = _a6732[_i6733];
                                  L6734: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k5575[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5783[v_y + 1] === 1)))) break L6734;
                                    const _t6735 = v_z;
                                    if (_g6722.length < 16) { if (!_g6722.includes(_t6735)) _g6722.push(_t6735); } else addOnce(_g6722, _st6729, _t6735);
                                  }
                                }
                              }
                            }
                            _gs6721 = _g6722.slice();
                            _memo6720.set(_t6719, _gs6721);
                          }
                          const _a6736 = union(_eg6717.of(_t6716), _gs6721);
                          for (let _i6737 = 0; _i6737 < _a6736.length; _i6737++) {
                            const v_t = _a6736[_i6737];
                            const _t6738 = v_t;
                            if (_g6654.length < 16) { if (!_g6654.includes(_t6738)) _g6654.push(_t6738); } else addOnce(_g6654, _st6693, _t6738);
                          }
                        }
                      }
                      const _a6739 = union(setOf(_t6653), _g6654);
                      for (let _i6740 = 0; _i6740 < _a6739.length; _i6740++) {
                        const v_t = _a6739[_i6740];
                        const _t6741 = v_t;
                        if (_g6567.length < 16) { if (!_g6567.includes(_t6741)) _g6567.push(_t6741); } else addOnce(_g6567, _st6650, _t6741);
                      }
                    }
                  }
                  _c6742 = (union(setOf(v_c), _g6567).length >= _h5788);
                }
                _c6743 = _c6742;
              }
              let _c6790: boolean = _c6743;
              if (_c6790) {
                let _q6744 = true;
                Q6745: {
                  _g6746.length = 0;
                  G6747: {
                    const _a6750 = sp.cellEdges[v_c];
                    for (let _i6751 = 0; _i6751 < _a6750.length; _i6751++) {
                      const v_x = _a6750[_i6751];
                      if (!((_f6542[v_x] === 1))) continue;
                      _g6746.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g6746);
                  const _eg6775 = edgeGroups(sp, v_M);
                  const _a6752 = sp.cellEdges[v_c];
                  for (let _i6753 = 0; _i6753 < _a6752.length; _i6753++) {
                    const v_x = _a6752[_i6753];
                    L6754: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c6759: boolean = (v_j !== v_c);
                      if (_c6759) {
                        let _q6755 = false;
                        Q6756: {
                          const _a6757 = sp.cellEdges[v_j];
                          for (let _i6758 = 0; _i6758 < _a6757.length; _i6758++) {
                            const v_y = _a6757[_i6758];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q6755 = true;
                              break Q6756;
                            }
                          }
                        }
                        _c6759 = _q6755;
                      }
                      if (!(_c6759)) break L6754;
                      let _q6760 = false;
                      Q6761: {
                        const _a6762 = sp.cellEdges[v_j];
                        for (const _e6766 of _l6764) _f6763[_e6766] = -1;
                        _l6764 = _a6762;
                        let _i6768 = 0;
                        _s6765[0] = 0;
                        let _o6772 = _a6762.length === 0;
                        for (;;) {
                          if (_a6762.length === 0) {
                            if (!_o6772) break;
                            _o6772 = false;
                          }
                          while (_a6762.length > 0 && _i6768 >= 0) {
                            const _e6766 = _a6762[_i6768];
                            if (_s6765[_i6768] > 0) _f6763[_e6766] = -1;
                            let _r6771 = (cands[_e6766] >= 0 ? cands[_e6766] : (cands[_e6766] = b.cands[_e6766])) & ~((2 << _s6765[_i6768]) - 1);
                            let _d6767 = 0;
                            V6770: for (; _r6771 !== 0; _r6771 &= _r6771 - 1) {
                              _d6767 = 31 - Math.clz32(_r6771 & -_r6771);
                              _f6763[_e6766] = _d6767;
                              for (let _j6769 = 0; _j6769 < _i6768; _j6769++) {
                                const _y6773 = _a6762[_j6769];
                                if (!(((((_k5575[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f6763[_e6766] === 1)) && (_f6763[_y6773] === 1)))) continue;
                                if (!((bent(sp, _e6766, _y6773) === (clueAt(cl.piece, v_j) === 3)))) continue V6770;
                              }
                              for (let _j6769 = 0; _j6769 < _i6768; _j6769++) {
                                const _y6774 = _a6762[_j6769];
                                if (!(((((((_f6763[_e6766] === 1) && (_f6763[_y6774] === 1)) && !((b.grid[_e6766] !== 0))) && !((b.grid[_y6774] !== 0))) && !([sp.edgeEnds[2 * _e6766], sp.edgeEnds[2 * _e6766 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y6774], sp.edgeEnds[2 * _y6774 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6775.of((sp.edgeEnds[2 * _y6774] === v_j ? sp.edgeEnds[2 * _y6774 + 1] : sp.edgeEnds[2 * _y6774])) === _eg6775.of((sp.edgeEnds[2 * _e6766] === v_j ? sp.edgeEnds[2 * _e6766 + 1] : sp.edgeEnds[2 * _e6766]))))) continue V6770;
                              }
                              break;
                            }
                            if (_r6771 === 0) {
                              _s6765[_i6768] = 0;
                              _i6768--;
                              continue;
                            }
                            _s6765[_i6768] = _d6767;
                            if (_i6768 === _a6762.length - 1) break;
                            _i6768++;
                            _s6765[_i6768] = 0;
                          }
                          if (_i6768 < 0) break;
                          let _q6776 = true;
                          Q6777: {
                            const _a6778 = sp.cellEdges[v_j];
                            for (let _i6779 = 0; _i6779 < _a6778.length; _i6779++) {
                              const v_y = _a6778[_i6779];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f6763[v_y] === _f6542[v_y]))) {
                                _q6776 = false;
                                break Q6777;
                              }
                            }
                          }
                          let _c6784: boolean = _q6776;
                          if (_c6784) {
                            let _g6780 = 0;
                            G6781: {
                              const _a6782 = sp.cellEdges[v_j];
                              for (let _i6783 = 0; _i6783 < _a6782.length; _i6783++) {
                                const v_y = _a6782[_i6783];
                                if (!((_f6763[v_y] === 1))) continue;
                                _g6780++;
                              }
                            }
                            _c6784 = (_g6780 === (_k5575[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c6789: boolean = _c6784;
                          if (_c6789) {
                            let _q6785 = true;
                            Q6786: {
                              const _a6787 = sp.cellEdges[v_j];
                              for (let _i6788 = 0; _i6788 < _a6787.length; _i6788++) {
                                const v_y = _a6787[_i6788];
                                if (!((((_f6763[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6775.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg6775.of(v_j)))) {
                                  _q6785 = false;
                                  break Q6786;
                                }
                              }
                            }
                            _c6789 = _q6785;
                          }
                          if (!(_c6789)) continue;
                          if (true) {
                            _q6760 = true;
                            break Q6761;
                          }
                        }
                      }
                      if (!(_q6760)) {
                        _q6744 = false;
                        break Q6745;
                      }
                    }
                  }
                }
                _c6790 = _q6744;
              }
              if (!(_c6790)) continue;
              if (!(true)) continue;
              _l6537 = _a6541;
              _y6538 = true;
              for (const _e6540 of _a6541) _p6536[_e6540] |= 1 << _f6542[_e6540];
            }
          }
          if (!(((((_p6536[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y6538 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g6290.push(v_e);
        }
      }
      L6791: {
        const v_N = _g6290;
        let _q6792 = true;
        Q6793: {
          const _a6794 = v_F;
          for (let _i6795 = 0; _i6795 < _a6794.length; _i6795++) {
            const v_e = _a6794[_i6795];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q6792 = false;
              break Q6793;
            }
          }
        }
        if (!(_q6792)) break L6791;
        if (b.made[0] !== _m394_0 || b.made[1] !== _m397_1) {
          _g6796.length = 0;
          G6797: {
            const _a6800 = sp.edges;
            for (let _i6801 = 0; _i6801 < _a6800.length; _i6801++) {
              const v_e = _a6800[_i6801];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g6796.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g6796))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _q6802 = true;
        Q6803: {
          const _a6804 = v_F;
          for (let _i6805 = 0; _i6805 < _a6804.length; _i6805++) {
            const v_e = _a6804[_i6805];
            let _c6807: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c6807) {
              let _c6806: boolean = !(!(v_W.includes(v_e)));
              if (!_c6806) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c6806 = true;
              }
              _c6807 = _c6806;
            }
            let _c6809: boolean = _c6807;
            if (_c6809) {
              let _c6808: boolean = !(!(v_N.includes(v_e)));
              if (!_c6808) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c6808 = true;
              }
              _c6809 = _c6808;
            }
            if (!(_c6809)) {
              _q6802 = false;
              break Q6803;
            }
          }
        }
        if (!(_q6802)) return -1;
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
let _f7610 = new Int32Array(0);
let _l7611: readonly number[] = [];
let _f7630 = new Int32Array(0);
let _l7631: readonly number[] = [];
const _st7782 = stamps();
let _f7788 = new Int32Array(0);
let _l7789: readonly number[] = [];
const _st7819 = stamps();
let _p7833 = new Int32Array(0);
let _l7834: readonly number[] = [];
let _f7839 = new Int32Array(0);
let _l7840: readonly number[] = [];
const _st7947 = stamps();
const _st7990 = stamps();
let _f7996 = new Int32Array(0);
let _l7997: readonly number[] = [];
const _st8026 = stamps();
let _f8060 = new Int32Array(0);
let _l8061: readonly number[] = [];
let _p8088 = new Int32Array(0);
let _l8089: readonly number[] = [];
let _f8094 = new Int32Array(0);
let _l8095: readonly number[] = [];
const _st8202 = stamps();
const _st8245 = stamps();
let _f8251 = new Int32Array(0);
let _l8252: readonly number[] = [];
const _st8281 = stamps();
let _f8315 = new Int32Array(0);
let _l8316: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandNoteBinding> | null): number {
  const _g7555: number[] = [];
  const _g7561: number[] = [];
  if (_f7610.length < sp.edges.length) _f7610 = new Int32Array(sp.edges.length).fill(-1);
  else _f7610.fill(-1);
  _l7611 = [];
  const _s7612: number[] = [];
  if (_f7630.length < sp.edges.length) _f7630 = new Int32Array(sp.edges.length).fill(-1);
  else _f7630.fill(-1);
  _l7631 = [];
  const _s7632: number[] = [];
  const _g7646: number[] = [];
  const _g7659: number[] = [];
  const _g7743: number[] = [];
  if (_f7788.length < sp.edges.length) _f7788 = new Int32Array(sp.edges.length).fill(-1);
  else _f7788.fill(-1);
  _l7789 = [];
  const _s7790: number[] = [];
  const _g7812: number[] = [];
  if (_p7833.length < sp.edges.length) _p7833 = new Int32Array(sp.edges.length);
  else _p7833.fill(0);
  _l7834 = [];
  let _y7835 = false;
  if (_f7839.length < sp.edges.length) _f7839 = new Int32Array(sp.edges.length).fill(-1);
  else _f7839.fill(-1);
  _l7840 = [];
  const _s7841: number[] = [];
  const _g7864: number[] = [];
  const _g7951: number[] = [];
  if (_f7996.length < sp.edges.length) _f7996 = new Int32Array(sp.edges.length).fill(-1);
  else _f7996.fill(-1);
  _l7997 = [];
  const _s7998: number[] = [];
  const _g8019: number[] = [];
  const _g8043: number[] = [];
  if (_f8060.length < sp.edges.length) _f8060 = new Int32Array(sp.edges.length).fill(-1);
  else _f8060.fill(-1);
  _l8061 = [];
  const _s8062: number[] = [];
  if (_p8088.length < sp.edges.length) _p8088 = new Int32Array(sp.edges.length);
  else _p8088.fill(0);
  _l8089 = [];
  let _y8090 = false;
  if (_f8094.length < sp.edges.length) _f8094 = new Int32Array(sp.edges.length).fill(-1);
  else _f8094.fill(-1);
  _l8095 = [];
  const _s8096: number[] = [];
  const _g8119: number[] = [];
  const _g8206: number[] = [];
  if (_f8251.length < sp.edges.length) _f8251 = new Int32Array(sp.edges.length).fill(-1);
  else _f8251.fill(-1);
  _l8252 = [];
  const _s8253: number[] = [];
  const _g8274: number[] = [];
  const _g8298: number[] = [];
  if (_f8315.length < sp.edges.length) _f8315 = new Int32Array(sp.edges.length).fill(-1);
  else _f8315.fill(-1);
  _l8316 = [];
  const _s8317: number[] = [];
  const _g8344: number[] = [];
  const facts = strandNoteFacts;
  let fired = 0;
  let changed = false;
  const _k7621 = armsKept.board(cl);
  const _h7830 = sp.cells.length;
  let _epoch = 0;
  if (strandNoteCands.length < sp.edges.length) strandNoteCands = new Int32Array(sp.edges.length);
  const cands = strandNoteCands;
  cands.fill(-1);
  const _m547_0 = b.made[0];
  _g7555.length = 0;
  G7556: {
    const _a7559 = sp.edges;
    for (let _i7560 = 0; _i7560 < _a7559.length; _i7560++) {
      const v_e = _a7559[_i7560];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g7555.push(v_e);
    }
  }
  const v_L = _g7555;
  const _m550_1 = b.made[1];
  const _eg7658 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g7561.length = 0;
  G7562: {
    const _a7604 = sp.edges;
    for (let _i7605 = 0; _i7605 < _a7604.length; _i7605++) {
      const v_e = _a7604[_i7605];
      const _t7606 = sp.edgeEnds[2 * v_e];
      let _q7607 = false;
      Q7608: {
        const _a7609 = sp.cellEdges[_t7606];
        for (const _e7613 of _l7611) _f7610[_e7613] = -1;
        _l7611 = _a7609;
        let _i7615 = 0;
        _s7612[0] = 0;
        let _o7619 = _a7609.length === 0;
        for (;;) {
          if (_a7609.length === 0) {
            if (!_o7619) break;
            _o7619 = false;
          }
          while (_a7609.length > 0 && _i7615 >= 0) {
            const _e7613 = _a7609[_i7615];
            if (_s7612[_i7615] > 0) _f7610[_e7613] = -1;
            let _r7618 = (cands[_e7613] >= 0 ? cands[_e7613] : (cands[_e7613] = b.cands[_e7613])) & ~((2 << _s7612[_i7615]) - 1);
            let _d7614 = 0;
            V7617: for (; _r7618 !== 0; _r7618 &= _r7618 - 1) {
              _d7614 = 31 - Math.clz32(_r7618 & -_r7618);
              _f7610[_e7613] = _d7614;
              if (_e7613 === v_e && _d7614 !== 1) continue;
              for (let _j7616 = 0; _j7616 < _i7615; _j7616++) {
                const _y7620 = _a7609[_j7616];
                if (!(((((_k7621[_t7606] ?? arms(sp, cl, _t7606)) === 2) && (_f7610[_e7613] === 1)) && (_f7610[_y7620] === 1)))) continue;
                if (!((bent(sp, _e7613, _y7620) === (clueAt(cl.piece, _t7606) === 3)))) continue V7617;
              }
              break;
            }
            if (_r7618 === 0) {
              _s7612[_i7615] = 0;
              _i7615--;
              continue;
            }
            _s7612[_i7615] = _d7614;
            if (_i7615 === _a7609.length - 1) break;
            _i7615++;
            _s7612[_i7615] = 0;
          }
          if (_i7615 < 0) break;
          let _g7622 = 0;
          G7623: {
            const _a7624 = sp.cellEdges[_t7606];
            for (let _i7625 = 0; _i7625 < _a7624.length; _i7625++) {
              const v_x = _a7624[_i7625];
              if (!((_f7610[v_x] === 1))) continue;
              _g7622++;
            }
          }
          if (!((_g7622 === (_k7621[_t7606] ?? arms(sp, cl, _t7606))))) continue;
          if (true) {
            _q7607 = true;
            break Q7608;
          }
        }
      }
      let _c7645: boolean = _q7607;
      if (_c7645) {
        const _t7626 = sp.edgeEnds[2 * v_e + 1];
        let _q7627 = false;
        Q7628: {
          const _a7629 = sp.cellEdges[_t7626];
          for (const _e7633 of _l7631) _f7630[_e7633] = -1;
          _l7631 = _a7629;
          let _i7635 = 0;
          _s7632[0] = 0;
          let _o7639 = _a7629.length === 0;
          for (;;) {
            if (_a7629.length === 0) {
              if (!_o7639) break;
              _o7639 = false;
            }
            while (_a7629.length > 0 && _i7635 >= 0) {
              const _e7633 = _a7629[_i7635];
              if (_s7632[_i7635] > 0) _f7630[_e7633] = -1;
              let _r7638 = (cands[_e7633] >= 0 ? cands[_e7633] : (cands[_e7633] = b.cands[_e7633])) & ~((2 << _s7632[_i7635]) - 1);
              let _d7634 = 0;
              V7637: for (; _r7638 !== 0; _r7638 &= _r7638 - 1) {
                _d7634 = 31 - Math.clz32(_r7638 & -_r7638);
                _f7630[_e7633] = _d7634;
                if (_e7633 === v_e && _d7634 !== 1) continue;
                for (let _j7636 = 0; _j7636 < _i7635; _j7636++) {
                  const _y7640 = _a7629[_j7636];
                  if (!(((((_k7621[_t7626] ?? arms(sp, cl, _t7626)) === 2) && (_f7630[_e7633] === 1)) && (_f7630[_y7640] === 1)))) continue;
                  if (!((bent(sp, _e7633, _y7640) === (clueAt(cl.piece, _t7626) === 3)))) continue V7637;
                }
                break;
              }
              if (_r7638 === 0) {
                _s7632[_i7635] = 0;
                _i7635--;
                continue;
              }
              _s7632[_i7635] = _d7634;
              if (_i7635 === _a7629.length - 1) break;
              _i7635++;
              _s7632[_i7635] = 0;
            }
            if (_i7635 < 0) break;
            let _g7641 = 0;
            G7642: {
              const _a7643 = sp.cellEdges[_t7626];
              for (let _i7644 = 0; _i7644 < _a7643.length; _i7644++) {
                const v_x = _a7643[_i7644];
                if (!((_f7630[v_x] === 1))) continue;
                _g7641++;
              }
            }
            if (!((_g7641 === (_k7621[_t7626] ?? arms(sp, cl, _t7626))))) continue;
            if (true) {
              _q7627 = true;
              break Q7628;
            }
          }
        }
        _c7645 = _q7627;
      }
      if (!(_c7645)) continue;
      _g7561.push(v_e);
    }
  }
  const v_U = _g7561;
  const _mm7825 = memberMarks(v_U);
  _g7646.length = 0;
  G7647: {
    const _a7650 = v_U;
    for (let _i7651 = 0; _i7651 < _a7650.length; _i7651++) {
      const v_e = _a7650[_i7651];
      if (!((((_k7621[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k7621[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g7646.push(v_e);
    }
  }
  const v_P = _g7646;
  const _a7652 = sp.cells;
  for (let _i7653 = 0; _i7653 < _a7652.length; _i7653++) {
    const v_c = _a7652[_i7653];
    const _h7804 = minus(v_P, sp.cellEdges[v_c]);
    let _q7654 = false;
    Q7655: {
      const _a7656 = sp.cellEdges[v_c];
      for (let _i7657 = 0; _i7657 < _a7656.length; _i7657++) {
        const v_e = _a7656[_i7657];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q7654 = true;
          break Q7655;
        }
      }
    }
    if (!(_q7654)) continue;
    const v_G = _eg7658.of(v_c);
    _g7659.length = 0;
    G7660: {
      const _a7740 = sp.cellEdges[v_c];
      for (let _i7741 = 0; _i7741 < _a7740.length; _i7741++) {
        const v_x = _a7740[_i7741];
        const _t7742 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h7805 = minus(_h7804, sp.cellEdges[_t7742]);
        const _eg7807 = edgeGroups(sp, _h7805);
        const _memo7810 = new Map<readonly number[], readonly number[]>();
        _g7743.length = 0;
        _st7782.pass++;
        G7744: {
          const _a7783 = sp.cellEdges[_t7742];
          for (let _i7784 = 0; _i7784 < _a7783.length; _i7784++) {
            const v_y = _a7783[_i7784];
            let _c7803: boolean = (v_y !== v_x);
            if (_c7803) {
              let _q7785 = false;
              Q7786: {
                const _a7787 = sp.cellEdges[_t7742];
                for (const _e7791 of _l7789) _f7788[_e7791] = -1;
                _l7789 = _a7787;
                let _i7793 = 0;
                _s7790[0] = 0;
                let _o7797 = _a7787.length === 0;
                for (;;) {
                  if (_a7787.length === 0) {
                    if (!_o7797) break;
                    _o7797 = false;
                  }
                  while (_a7787.length > 0 && _i7793 >= 0) {
                    const _e7791 = _a7787[_i7793];
                    if (_s7790[_i7793] > 0) _f7788[_e7791] = -1;
                    let _r7796 = (cands[_e7791] >= 0 ? cands[_e7791] : (cands[_e7791] = b.cands[_e7791])) & ~((2 << _s7790[_i7793]) - 1);
                    let _d7792 = 0;
                    V7795: for (; _r7796 !== 0; _r7796 &= _r7796 - 1) {
                      _d7792 = 31 - Math.clz32(_r7796 & -_r7796);
                      _f7788[_e7791] = _d7792;
                      if (_e7791 === v_x && _d7792 !== 1) continue;
                      if (_e7791 === v_y && _d7792 !== 1) continue;
                      for (let _j7794 = 0; _j7794 < _i7793; _j7794++) {
                        const _y7798 = _a7787[_j7794];
                        if (!(((((_k7621[_t7742] ?? arms(sp, cl, _t7742)) === 2) && (_f7788[_e7791] === 1)) && (_f7788[_y7798] === 1)))) continue;
                        if (!((bent(sp, _e7791, _y7798) === (clueAt(cl.piece, _t7742) === 3)))) continue V7795;
                      }
                      break;
                    }
                    if (_r7796 === 0) {
                      _s7790[_i7793] = 0;
                      _i7793--;
                      continue;
                    }
                    _s7790[_i7793] = _d7792;
                    if (_i7793 === _a7787.length - 1) break;
                    _i7793++;
                    _s7790[_i7793] = 0;
                  }
                  if (_i7793 < 0) break;
                  let _g7799 = 0;
                  G7800: {
                    const _a7801 = sp.cellEdges[_t7742];
                    for (let _i7802 = 0; _i7802 < _a7801.length; _i7802++) {
                      const v_z = _a7801[_i7802];
                      if (!((_f7788[v_z] === 1))) continue;
                      _g7799++;
                    }
                  }
                  if (!((_g7799 === (_k7621[_t7742] ?? arms(sp, cl, _t7742))))) continue;
                  if (true) {
                    _q7785 = true;
                    break Q7786;
                  }
                }
              }
              _c7803 = _q7785;
            }
            if (!(_c7803)) continue;
            const _t7806 = (sp.edgeEnds[2 * v_y] === _t7742 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t7809 = _eg7807.of(_t7806);
            let _gs7811 = _memo7810.get(_t7809);
            if (_gs7811 === undefined) {
              _g7812.length = 0;
              _st7819.pass++;
              G7813: {
                const _a7820 = _t7809;
                for (let _i7821 = 0; _i7821 < _a7820.length; _i7821++) {
                  const v_t = _a7820[_i7821];
                  if (!(((_k7621[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a7822 = sp.cellEdges[v_t];
                  for (let _i7823 = 0; _i7823 < _a7822.length; _i7823++) {
                    const v_y = _a7822[_i7823];
                    L7824: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k7621[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7825[v_y + 1] === 1)))) break L7824;
                      const _t7826 = v_z;
                      if (_g7812.length < 16) { if (!_g7812.includes(_t7826)) _g7812.push(_t7826); } else addOnce(_g7812, _st7819, _t7826);
                    }
                  }
                }
              }
              _gs7811 = _g7812.slice();
              _memo7810.set(_t7809, _gs7811);
            }
            const _a7827 = union(_eg7807.of(_t7806), _gs7811);
            for (let _i7828 = 0; _i7828 < _a7827.length; _i7828++) {
              const v_t = _a7827[_i7828];
              const _t7829 = v_t;
              if (_g7743.length < 16) { if (!_g7743.includes(_t7829)) _g7743.push(_t7829); } else addOnce(_g7743, _st7782, _t7829);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t7742), _g7743)).length >= _h7830))) continue;
        _g7659.push(v_x);
      }
    }
    const v_K = _g7659;
    let _g7836 = -1;
    let _g8091 = -1;
    const _a7831 = sp.cellEdges[v_c];
    for (let _i7832 = 0; _i7832 < _a7831.length; _i7832++) {
      const v_e = _a7831[_i7832];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g7836 !== _epoch) {
        _g7836 = _epoch;
        for (const _e7837 of _l7834) _p7833[_e7837] = 0;
        _y7835 = false;
        const _a7838 = sp.cellEdges[v_c];
        for (const _e7842 of _l7840) _f7839[_e7842] = -1;
        _l7840 = _a7838;
        let _i7844 = 0;
        _s7841[0] = 0;
        let _o7848 = _a7838.length === 0;
        for (;;) {
          if (_a7838.length === 0) {
            if (!_o7848) break;
            _o7848 = false;
          }
          while (_a7838.length > 0 && _i7844 >= 0) {
            const _e7842 = _a7838[_i7844];
            if (_s7841[_i7844] > 0) _f7839[_e7842] = -1;
            let _r7847 = (cands[_e7842] >= 0 ? cands[_e7842] : (cands[_e7842] = b.cands[_e7842])) & ~((2 << _s7841[_i7844]) - 1);
            let _d7843 = 0;
            V7846: for (; _r7847 !== 0; _r7847 &= _r7847 - 1) {
              _d7843 = 31 - Math.clz32(_r7847 & -_r7847);
              _f7839[_e7842] = _d7843;
              for (let _j7845 = 0; _j7845 < _i7844; _j7845++) {
                const _y7849 = _a7838[_j7845];
                if (!(((((_k7621[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f7839[_e7842] === 1)) && (_f7839[_y7849] === 1)))) continue;
                if (!((bent(sp, _e7842, _y7849) === (clueAt(cl.piece, v_c) === 3)))) continue V7846;
              }
              for (let _j7845 = 0; _j7845 < _i7844; _j7845++) {
                const _y7850 = _a7838[_j7845];
                if (!(((((_f7839[_e7842] === 1) && (_f7839[_y7850] === 1)) && !((b.grid[_e7842] !== 0))) && !((b.grid[_y7850] !== 0))))) continue;
                if (!(!(_eg7658.of((sp.edgeEnds[2 * _y7850] === v_c ? sp.edgeEnds[2 * _y7850 + 1] : sp.edgeEnds[2 * _y7850])) === _eg7658.of((sp.edgeEnds[2 * _e7842] === v_c ? sp.edgeEnds[2 * _e7842 + 1] : sp.edgeEnds[2 * _e7842]))))) continue V7846;
              }
              break;
            }
            if (_r7847 === 0) {
              _s7841[_i7844] = 0;
              _i7844--;
              continue;
            }
            _s7841[_i7844] = _d7843;
            if (_i7844 === _a7838.length - 1) break;
            _i7844++;
            _s7841[_i7844] = 0;
          }
          if (_i7844 < 0) break;
          let _g7851 = 0;
          G7852: {
            const _a7853 = sp.cellEdges[v_c];
            for (let _i7854 = 0; _i7854 < _a7853.length; _i7854++) {
              const v_x = _a7853[_i7854];
              if (!((_f7839[v_x] === 1))) continue;
              _g7851++;
            }
          }
          let _c7859: boolean = (_g7851 === (_k7621[v_c] ?? arms(sp, cl, v_c)));
          if (_c7859) {
            let _q7855 = true;
            Q7856: {
              const _a7857 = sp.cellEdges[v_c];
              for (let _i7858 = 0; _i7858 < _a7857.length; _i7858++) {
                const v_x = _a7857[_i7858];
                if (!(((_f7839[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg7658.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q7855 = false;
                  break Q7856;
                }
              }
            }
            _c7859 = _q7855;
          }
          let _c8040: boolean = _c7859;
          if (_c8040) {
            let _q7860 = false;
            Q7861: {
              const _a7862 = sp.cellEdges[v_c];
              for (let _i7863 = 0; _i7863 < _a7862.length; _i7863++) {
                const v_x = _a7862[_i7863];
                if (!((_f7839[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q7860 = true;
                  break Q7861;
                }
              }
            }
            let _c8039: boolean = _q7860;
            if (!_c8039) {
              _g7864.length = 0;
              _st7947.pass++;
              G7865: {
                const _a7948 = sp.cellEdges[v_c];
                for (let _i7949 = 0; _i7949 < _a7948.length; _i7949++) {
                  const v_x = _a7948[_i7949];
                  if (!((_f7839[v_x] === 1))) continue;
                  const _t7950 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h8012 = minus(_h7804, sp.cellEdges[_t7950]);
                  const _eg8014 = edgeGroups(sp, _h8012);
                  const _memo8017 = new Map<readonly number[], readonly number[]>();
                  _g7951.length = 0;
                  _st7990.pass++;
                  G7952: {
                    const _a7991 = sp.cellEdges[_t7950];
                    for (let _i7992 = 0; _i7992 < _a7991.length; _i7992++) {
                      const v_y = _a7991[_i7992];
                      let _c8011: boolean = (v_y !== v_x);
                      if (_c8011) {
                        let _q7993 = false;
                        Q7994: {
                          const _a7995 = sp.cellEdges[_t7950];
                          for (const _e7999 of _l7997) _f7996[_e7999] = -1;
                          _l7997 = _a7995;
                          let _i8001 = 0;
                          _s7998[0] = 0;
                          let _o8005 = _a7995.length === 0;
                          for (;;) {
                            if (_a7995.length === 0) {
                              if (!_o8005) break;
                              _o8005 = false;
                            }
                            while (_a7995.length > 0 && _i8001 >= 0) {
                              const _e7999 = _a7995[_i8001];
                              if (_s7998[_i8001] > 0) _f7996[_e7999] = -1;
                              let _r8004 = (cands[_e7999] >= 0 ? cands[_e7999] : (cands[_e7999] = b.cands[_e7999])) & ~((2 << _s7998[_i8001]) - 1);
                              let _d8000 = 0;
                              V8003: for (; _r8004 !== 0; _r8004 &= _r8004 - 1) {
                                _d8000 = 31 - Math.clz32(_r8004 & -_r8004);
                                _f7996[_e7999] = _d8000;
                                if (_e7999 === v_x && _d8000 !== 1) continue;
                                if (_e7999 === v_y && _d8000 !== 1) continue;
                                for (let _j8002 = 0; _j8002 < _i8001; _j8002++) {
                                  const _y8006 = _a7995[_j8002];
                                  if (!(((((_k7621[_t7950] ?? arms(sp, cl, _t7950)) === 2) && (_f7996[_e7999] === 1)) && (_f7996[_y8006] === 1)))) continue;
                                  if (!((bent(sp, _e7999, _y8006) === (clueAt(cl.piece, _t7950) === 3)))) continue V8003;
                                }
                                break;
                              }
                              if (_r8004 === 0) {
                                _s7998[_i8001] = 0;
                                _i8001--;
                                continue;
                              }
                              _s7998[_i8001] = _d8000;
                              if (_i8001 === _a7995.length - 1) break;
                              _i8001++;
                              _s7998[_i8001] = 0;
                            }
                            if (_i8001 < 0) break;
                            let _g8007 = 0;
                            G8008: {
                              const _a8009 = sp.cellEdges[_t7950];
                              for (let _i8010 = 0; _i8010 < _a8009.length; _i8010++) {
                                const v_z = _a8009[_i8010];
                                if (!((_f7996[v_z] === 1))) continue;
                                _g8007++;
                              }
                            }
                            if (!((_g8007 === (_k7621[_t7950] ?? arms(sp, cl, _t7950))))) continue;
                            if (true) {
                              _q7993 = true;
                              break Q7994;
                            }
                          }
                        }
                        _c8011 = _q7993;
                      }
                      if (!(_c8011)) continue;
                      const _t8013 = (sp.edgeEnds[2 * v_y] === _t7950 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t8016 = _eg8014.of(_t8013);
                      let _gs8018 = _memo8017.get(_t8016);
                      if (_gs8018 === undefined) {
                        _g8019.length = 0;
                        _st8026.pass++;
                        G8020: {
                          const _a8027 = _t8016;
                          for (let _i8028 = 0; _i8028 < _a8027.length; _i8028++) {
                            const v_t = _a8027[_i8028];
                            if (!(((_k7621[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a8029 = sp.cellEdges[v_t];
                            for (let _i8030 = 0; _i8030 < _a8029.length; _i8030++) {
                              const v_y = _a8029[_i8030];
                              L8031: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k7621[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7825[v_y + 1] === 1)))) break L8031;
                                const _t8032 = v_z;
                                if (_g8019.length < 16) { if (!_g8019.includes(_t8032)) _g8019.push(_t8032); } else addOnce(_g8019, _st8026, _t8032);
                              }
                            }
                          }
                        }
                        _gs8018 = _g8019.slice();
                        _memo8017.set(_t8016, _gs8018);
                      }
                      const _a8033 = union(_eg8014.of(_t8013), _gs8018);
                      for (let _i8034 = 0; _i8034 < _a8033.length; _i8034++) {
                        const v_t = _a8033[_i8034];
                        const _t8035 = v_t;
                        if (_g7951.length < 16) { if (!_g7951.includes(_t8035)) _g7951.push(_t8035); } else addOnce(_g7951, _st7990, _t8035);
                      }
                    }
                  }
                  const _a8036 = union(setOf(_t7950), _g7951);
                  for (let _i8037 = 0; _i8037 < _a8036.length; _i8037++) {
                    const v_t = _a8036[_i8037];
                    const _t8038 = v_t;
                    if (_g7864.length < 16) { if (!_g7864.includes(_t8038)) _g7864.push(_t8038); } else addOnce(_g7864, _st7947, _t8038);
                  }
                }
              }
              _c8039 = (union(setOf(v_c), _g7864).length >= _h7830);
            }
            _c8040 = _c8039;
          }
          let _c8087: boolean = _c8040;
          if (_c8087) {
            let _q8041 = true;
            Q8042: {
              _g8043.length = 0;
              G8044: {
                const _a8047 = sp.cellEdges[v_c];
                for (let _i8048 = 0; _i8048 < _a8047.length; _i8048++) {
                  const v_x = _a8047[_i8048];
                  if (!((_f7839[v_x] === 1))) continue;
                  _g8043.push(v_x);
                }
              }
              const v_M = union(v_L, _g8043);
              const _eg8072 = edgeGroups(sp, v_M);
              const _a8049 = sp.cellEdges[v_c];
              for (let _i8050 = 0; _i8050 < _a8049.length; _i8050++) {
                const v_x = _a8049[_i8050];
                L8051: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c8056: boolean = (v_j !== v_c);
                  if (_c8056) {
                    let _q8052 = false;
                    Q8053: {
                      const _a8054 = sp.cellEdges[v_j];
                      for (let _i8055 = 0; _i8055 < _a8054.length; _i8055++) {
                        const v_y = _a8054[_i8055];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q8052 = true;
                          break Q8053;
                        }
                      }
                    }
                    _c8056 = _q8052;
                  }
                  if (!(_c8056)) break L8051;
                  let _q8057 = false;
                  Q8058: {
                    const _a8059 = sp.cellEdges[v_j];
                    for (const _e8063 of _l8061) _f8060[_e8063] = -1;
                    _l8061 = _a8059;
                    let _i8065 = 0;
                    _s8062[0] = 0;
                    let _o8069 = _a8059.length === 0;
                    for (;;) {
                      if (_a8059.length === 0) {
                        if (!_o8069) break;
                        _o8069 = false;
                      }
                      while (_a8059.length > 0 && _i8065 >= 0) {
                        const _e8063 = _a8059[_i8065];
                        if (_s8062[_i8065] > 0) _f8060[_e8063] = -1;
                        let _r8068 = (cands[_e8063] >= 0 ? cands[_e8063] : (cands[_e8063] = b.cands[_e8063])) & ~((2 << _s8062[_i8065]) - 1);
                        let _d8064 = 0;
                        V8067: for (; _r8068 !== 0; _r8068 &= _r8068 - 1) {
                          _d8064 = 31 - Math.clz32(_r8068 & -_r8068);
                          _f8060[_e8063] = _d8064;
                          for (let _j8066 = 0; _j8066 < _i8065; _j8066++) {
                            const _y8070 = _a8059[_j8066];
                            if (!(((((_k7621[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f8060[_e8063] === 1)) && (_f8060[_y8070] === 1)))) continue;
                            if (!((bent(sp, _e8063, _y8070) === (clueAt(cl.piece, v_j) === 3)))) continue V8067;
                          }
                          for (let _j8066 = 0; _j8066 < _i8065; _j8066++) {
                            const _y8071 = _a8059[_j8066];
                            if (!(((((((_f8060[_e8063] === 1) && (_f8060[_y8071] === 1)) && !((b.grid[_e8063] !== 0))) && !((b.grid[_y8071] !== 0))) && !([sp.edgeEnds[2 * _e8063], sp.edgeEnds[2 * _e8063 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y8071], sp.edgeEnds[2 * _y8071 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8072.of((sp.edgeEnds[2 * _y8071] === v_j ? sp.edgeEnds[2 * _y8071 + 1] : sp.edgeEnds[2 * _y8071])) === _eg8072.of((sp.edgeEnds[2 * _e8063] === v_j ? sp.edgeEnds[2 * _e8063 + 1] : sp.edgeEnds[2 * _e8063]))))) continue V8067;
                          }
                          break;
                        }
                        if (_r8068 === 0) {
                          _s8062[_i8065] = 0;
                          _i8065--;
                          continue;
                        }
                        _s8062[_i8065] = _d8064;
                        if (_i8065 === _a8059.length - 1) break;
                        _i8065++;
                        _s8062[_i8065] = 0;
                      }
                      if (_i8065 < 0) break;
                      let _q8073 = true;
                      Q8074: {
                        const _a8075 = sp.cellEdges[v_j];
                        for (let _i8076 = 0; _i8076 < _a8075.length; _i8076++) {
                          const v_y = _a8075[_i8076];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f8060[v_y] === _f7839[v_y]))) {
                            _q8073 = false;
                            break Q8074;
                          }
                        }
                      }
                      let _c8081: boolean = _q8073;
                      if (_c8081) {
                        let _g8077 = 0;
                        G8078: {
                          const _a8079 = sp.cellEdges[v_j];
                          for (let _i8080 = 0; _i8080 < _a8079.length; _i8080++) {
                            const v_y = _a8079[_i8080];
                            if (!((_f8060[v_y] === 1))) continue;
                            _g8077++;
                          }
                        }
                        _c8081 = (_g8077 === (_k7621[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c8086: boolean = _c8081;
                      if (_c8086) {
                        let _q8082 = true;
                        Q8083: {
                          const _a8084 = sp.cellEdges[v_j];
                          for (let _i8085 = 0; _i8085 < _a8084.length; _i8085++) {
                            const v_y = _a8084[_i8085];
                            if (!((((_f8060[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8072.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg8072.of(v_j)))) {
                              _q8082 = false;
                              break Q8083;
                            }
                          }
                        }
                        _c8086 = _q8082;
                      }
                      if (!(_c8086)) continue;
                      if (true) {
                        _q8057 = true;
                        break Q8058;
                      }
                    }
                  }
                  if (!(_q8057)) {
                    _q8041 = false;
                    break Q8042;
                  }
                }
              }
            }
            _c8087 = _q8041;
          }
          if (!(_c8087)) continue;
          if (!(true)) continue;
          _l7834 = _a7838;
          _y7835 = true;
          for (const _e7837 of _a7838) _p7833[_e7837] |= 1 << _f7839[_e7837];
        }
      }
      const v_A = ((((_p7833[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y7835 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g8091 !== _epoch) {
        _g8091 = _epoch;
        for (const _e8092 of _l8089) _p8088[_e8092] = 0;
        _y8090 = false;
        const _a8093 = sp.cellEdges[v_c];
        for (const _e8097 of _l8095) _f8094[_e8097] = -1;
        _l8095 = _a8093;
        let _i8099 = 0;
        _s8096[0] = 0;
        let _o8103 = _a8093.length === 0;
        for (;;) {
          if (_a8093.length === 0) {
            if (!_o8103) break;
            _o8103 = false;
          }
          while (_a8093.length > 0 && _i8099 >= 0) {
            const _e8097 = _a8093[_i8099];
            if (_s8096[_i8099] > 0) _f8094[_e8097] = -1;
            let _r8102 = (cands[_e8097] >= 0 ? cands[_e8097] : (cands[_e8097] = b.cands[_e8097])) & ~((2 << _s8096[_i8099]) - 1);
            let _d8098 = 0;
            V8101: for (; _r8102 !== 0; _r8102 &= _r8102 - 1) {
              _d8098 = 31 - Math.clz32(_r8102 & -_r8102);
              _f8094[_e8097] = _d8098;
              for (let _j8100 = 0; _j8100 < _i8099; _j8100++) {
                const _y8104 = _a8093[_j8100];
                if (!(((((_k7621[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f8094[_e8097] === 1)) && (_f8094[_y8104] === 1)))) continue;
                if (!((bent(sp, _e8097, _y8104) === (clueAt(cl.piece, v_c) === 3)))) continue V8101;
              }
              for (let _j8100 = 0; _j8100 < _i8099; _j8100++) {
                const _y8105 = _a8093[_j8100];
                if (!(((((_f8094[_e8097] === 1) && (_f8094[_y8105] === 1)) && !((b.grid[_e8097] !== 0))) && !((b.grid[_y8105] !== 0))))) continue;
                if (!(!(_eg7658.of((sp.edgeEnds[2 * _y8105] === v_c ? sp.edgeEnds[2 * _y8105 + 1] : sp.edgeEnds[2 * _y8105])) === _eg7658.of((sp.edgeEnds[2 * _e8097] === v_c ? sp.edgeEnds[2 * _e8097 + 1] : sp.edgeEnds[2 * _e8097]))))) continue V8101;
              }
              break;
            }
            if (_r8102 === 0) {
              _s8096[_i8099] = 0;
              _i8099--;
              continue;
            }
            _s8096[_i8099] = _d8098;
            if (_i8099 === _a8093.length - 1) break;
            _i8099++;
            _s8096[_i8099] = 0;
          }
          if (_i8099 < 0) break;
          let _g8106 = 0;
          G8107: {
            const _a8108 = sp.cellEdges[v_c];
            for (let _i8109 = 0; _i8109 < _a8108.length; _i8109++) {
              const v_x = _a8108[_i8109];
              if (!((_f8094[v_x] === 1))) continue;
              _g8106++;
            }
          }
          let _c8114: boolean = (_g8106 === (_k7621[v_c] ?? arms(sp, cl, v_c)));
          if (_c8114) {
            let _q8110 = true;
            Q8111: {
              const _a8112 = sp.cellEdges[v_c];
              for (let _i8113 = 0; _i8113 < _a8112.length; _i8113++) {
                const v_x = _a8112[_i8113];
                if (!(((_f8094[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg7658.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q8110 = false;
                  break Q8111;
                }
              }
            }
            _c8114 = _q8110;
          }
          let _c8295: boolean = _c8114;
          if (_c8295) {
            let _q8115 = false;
            Q8116: {
              const _a8117 = sp.cellEdges[v_c];
              for (let _i8118 = 0; _i8118 < _a8117.length; _i8118++) {
                const v_x = _a8117[_i8118];
                if (!((_f8094[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q8115 = true;
                  break Q8116;
                }
              }
            }
            let _c8294: boolean = _q8115;
            if (!_c8294) {
              _g8119.length = 0;
              _st8202.pass++;
              G8120: {
                const _a8203 = sp.cellEdges[v_c];
                for (let _i8204 = 0; _i8204 < _a8203.length; _i8204++) {
                  const v_x = _a8203[_i8204];
                  if (!((_f8094[v_x] === 1))) continue;
                  const _t8205 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h8267 = minus(_h7804, sp.cellEdges[_t8205]);
                  const _eg8269 = edgeGroups(sp, _h8267);
                  const _memo8272 = new Map<readonly number[], readonly number[]>();
                  _g8206.length = 0;
                  _st8245.pass++;
                  G8207: {
                    const _a8246 = sp.cellEdges[_t8205];
                    for (let _i8247 = 0; _i8247 < _a8246.length; _i8247++) {
                      const v_y = _a8246[_i8247];
                      let _c8266: boolean = (v_y !== v_x);
                      if (_c8266) {
                        let _q8248 = false;
                        Q8249: {
                          const _a8250 = sp.cellEdges[_t8205];
                          for (const _e8254 of _l8252) _f8251[_e8254] = -1;
                          _l8252 = _a8250;
                          let _i8256 = 0;
                          _s8253[0] = 0;
                          let _o8260 = _a8250.length === 0;
                          for (;;) {
                            if (_a8250.length === 0) {
                              if (!_o8260) break;
                              _o8260 = false;
                            }
                            while (_a8250.length > 0 && _i8256 >= 0) {
                              const _e8254 = _a8250[_i8256];
                              if (_s8253[_i8256] > 0) _f8251[_e8254] = -1;
                              let _r8259 = (cands[_e8254] >= 0 ? cands[_e8254] : (cands[_e8254] = b.cands[_e8254])) & ~((2 << _s8253[_i8256]) - 1);
                              let _d8255 = 0;
                              V8258: for (; _r8259 !== 0; _r8259 &= _r8259 - 1) {
                                _d8255 = 31 - Math.clz32(_r8259 & -_r8259);
                                _f8251[_e8254] = _d8255;
                                if (_e8254 === v_x && _d8255 !== 1) continue;
                                if (_e8254 === v_y && _d8255 !== 1) continue;
                                for (let _j8257 = 0; _j8257 < _i8256; _j8257++) {
                                  const _y8261 = _a8250[_j8257];
                                  if (!(((((_k7621[_t8205] ?? arms(sp, cl, _t8205)) === 2) && (_f8251[_e8254] === 1)) && (_f8251[_y8261] === 1)))) continue;
                                  if (!((bent(sp, _e8254, _y8261) === (clueAt(cl.piece, _t8205) === 3)))) continue V8258;
                                }
                                break;
                              }
                              if (_r8259 === 0) {
                                _s8253[_i8256] = 0;
                                _i8256--;
                                continue;
                              }
                              _s8253[_i8256] = _d8255;
                              if (_i8256 === _a8250.length - 1) break;
                              _i8256++;
                              _s8253[_i8256] = 0;
                            }
                            if (_i8256 < 0) break;
                            let _g8262 = 0;
                            G8263: {
                              const _a8264 = sp.cellEdges[_t8205];
                              for (let _i8265 = 0; _i8265 < _a8264.length; _i8265++) {
                                const v_z = _a8264[_i8265];
                                if (!((_f8251[v_z] === 1))) continue;
                                _g8262++;
                              }
                            }
                            if (!((_g8262 === (_k7621[_t8205] ?? arms(sp, cl, _t8205))))) continue;
                            if (true) {
                              _q8248 = true;
                              break Q8249;
                            }
                          }
                        }
                        _c8266 = _q8248;
                      }
                      if (!(_c8266)) continue;
                      const _t8268 = (sp.edgeEnds[2 * v_y] === _t8205 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t8271 = _eg8269.of(_t8268);
                      let _gs8273 = _memo8272.get(_t8271);
                      if (_gs8273 === undefined) {
                        _g8274.length = 0;
                        _st8281.pass++;
                        G8275: {
                          const _a8282 = _t8271;
                          for (let _i8283 = 0; _i8283 < _a8282.length; _i8283++) {
                            const v_t = _a8282[_i8283];
                            if (!(((_k7621[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a8284 = sp.cellEdges[v_t];
                            for (let _i8285 = 0; _i8285 < _a8284.length; _i8285++) {
                              const v_y = _a8284[_i8285];
                              L8286: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k7621[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7825[v_y + 1] === 1)))) break L8286;
                                const _t8287 = v_z;
                                if (_g8274.length < 16) { if (!_g8274.includes(_t8287)) _g8274.push(_t8287); } else addOnce(_g8274, _st8281, _t8287);
                              }
                            }
                          }
                        }
                        _gs8273 = _g8274.slice();
                        _memo8272.set(_t8271, _gs8273);
                      }
                      const _a8288 = union(_eg8269.of(_t8268), _gs8273);
                      for (let _i8289 = 0; _i8289 < _a8288.length; _i8289++) {
                        const v_t = _a8288[_i8289];
                        const _t8290 = v_t;
                        if (_g8206.length < 16) { if (!_g8206.includes(_t8290)) _g8206.push(_t8290); } else addOnce(_g8206, _st8245, _t8290);
                      }
                    }
                  }
                  const _a8291 = union(setOf(_t8205), _g8206);
                  for (let _i8292 = 0; _i8292 < _a8291.length; _i8292++) {
                    const v_t = _a8291[_i8292];
                    const _t8293 = v_t;
                    if (_g8119.length < 16) { if (!_g8119.includes(_t8293)) _g8119.push(_t8293); } else addOnce(_g8119, _st8202, _t8293);
                  }
                }
              }
              _c8294 = (union(setOf(v_c), _g8119).length >= _h7830);
            }
            _c8295 = _c8294;
          }
          let _c8342: boolean = _c8295;
          if (_c8342) {
            let _q8296 = true;
            Q8297: {
              _g8298.length = 0;
              G8299: {
                const _a8302 = sp.cellEdges[v_c];
                for (let _i8303 = 0; _i8303 < _a8302.length; _i8303++) {
                  const v_x = _a8302[_i8303];
                  if (!((_f8094[v_x] === 1))) continue;
                  _g8298.push(v_x);
                }
              }
              const v_M = union(v_L, _g8298);
              const _eg8327 = edgeGroups(sp, v_M);
              const _a8304 = sp.cellEdges[v_c];
              for (let _i8305 = 0; _i8305 < _a8304.length; _i8305++) {
                const v_x = _a8304[_i8305];
                L8306: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c8311: boolean = (v_j !== v_c);
                  if (_c8311) {
                    let _q8307 = false;
                    Q8308: {
                      const _a8309 = sp.cellEdges[v_j];
                      for (let _i8310 = 0; _i8310 < _a8309.length; _i8310++) {
                        const v_y = _a8309[_i8310];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q8307 = true;
                          break Q8308;
                        }
                      }
                    }
                    _c8311 = _q8307;
                  }
                  if (!(_c8311)) break L8306;
                  let _q8312 = false;
                  Q8313: {
                    const _a8314 = sp.cellEdges[v_j];
                    for (const _e8318 of _l8316) _f8315[_e8318] = -1;
                    _l8316 = _a8314;
                    let _i8320 = 0;
                    _s8317[0] = 0;
                    let _o8324 = _a8314.length === 0;
                    for (;;) {
                      if (_a8314.length === 0) {
                        if (!_o8324) break;
                        _o8324 = false;
                      }
                      while (_a8314.length > 0 && _i8320 >= 0) {
                        const _e8318 = _a8314[_i8320];
                        if (_s8317[_i8320] > 0) _f8315[_e8318] = -1;
                        let _r8323 = (cands[_e8318] >= 0 ? cands[_e8318] : (cands[_e8318] = b.cands[_e8318])) & ~((2 << _s8317[_i8320]) - 1);
                        let _d8319 = 0;
                        V8322: for (; _r8323 !== 0; _r8323 &= _r8323 - 1) {
                          _d8319 = 31 - Math.clz32(_r8323 & -_r8323);
                          _f8315[_e8318] = _d8319;
                          for (let _j8321 = 0; _j8321 < _i8320; _j8321++) {
                            const _y8325 = _a8314[_j8321];
                            if (!(((((_k7621[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f8315[_e8318] === 1)) && (_f8315[_y8325] === 1)))) continue;
                            if (!((bent(sp, _e8318, _y8325) === (clueAt(cl.piece, v_j) === 3)))) continue V8322;
                          }
                          for (let _j8321 = 0; _j8321 < _i8320; _j8321++) {
                            const _y8326 = _a8314[_j8321];
                            if (!(((((((_f8315[_e8318] === 1) && (_f8315[_y8326] === 1)) && !((b.grid[_e8318] !== 0))) && !((b.grid[_y8326] !== 0))) && !([sp.edgeEnds[2 * _e8318], sp.edgeEnds[2 * _e8318 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y8326], sp.edgeEnds[2 * _y8326 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8327.of((sp.edgeEnds[2 * _y8326] === v_j ? sp.edgeEnds[2 * _y8326 + 1] : sp.edgeEnds[2 * _y8326])) === _eg8327.of((sp.edgeEnds[2 * _e8318] === v_j ? sp.edgeEnds[2 * _e8318 + 1] : sp.edgeEnds[2 * _e8318]))))) continue V8322;
                          }
                          break;
                        }
                        if (_r8323 === 0) {
                          _s8317[_i8320] = 0;
                          _i8320--;
                          continue;
                        }
                        _s8317[_i8320] = _d8319;
                        if (_i8320 === _a8314.length - 1) break;
                        _i8320++;
                        _s8317[_i8320] = 0;
                      }
                      if (_i8320 < 0) break;
                      let _q8328 = true;
                      Q8329: {
                        const _a8330 = sp.cellEdges[v_j];
                        for (let _i8331 = 0; _i8331 < _a8330.length; _i8331++) {
                          const v_y = _a8330[_i8331];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f8315[v_y] === _f8094[v_y]))) {
                            _q8328 = false;
                            break Q8329;
                          }
                        }
                      }
                      let _c8336: boolean = _q8328;
                      if (_c8336) {
                        let _g8332 = 0;
                        G8333: {
                          const _a8334 = sp.cellEdges[v_j];
                          for (let _i8335 = 0; _i8335 < _a8334.length; _i8335++) {
                            const v_y = _a8334[_i8335];
                            if (!((_f8315[v_y] === 1))) continue;
                            _g8332++;
                          }
                        }
                        _c8336 = (_g8332 === (_k7621[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c8341: boolean = _c8336;
                      if (_c8341) {
                        let _q8337 = true;
                        Q8338: {
                          const _a8339 = sp.cellEdges[v_j];
                          for (let _i8340 = 0; _i8340 < _a8339.length; _i8340++) {
                            const v_y = _a8339[_i8340];
                            if (!((((_f8315[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8327.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg8327.of(v_j)))) {
                              _q8337 = false;
                              break Q8338;
                            }
                          }
                        }
                        _c8341 = _q8337;
                      }
                      if (!(_c8341)) continue;
                      if (true) {
                        _q8312 = true;
                        break Q8313;
                      }
                    }
                  }
                  if (!(_q8312)) {
                    _q8296 = false;
                    break Q8297;
                  }
                }
              }
            }
            _c8342 = _q8296;
          }
          if (!(_c8342)) continue;
          if (!(true)) continue;
          _l8089 = _a8093;
          _y8090 = true;
          for (const _e8092 of _a8093) _p8088[_e8092] |= 1 << _f8094[_e8092];
        }
      }
      L8343: {
        const v_B = ((((_p8088[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y8090 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L8343;
        if (b.made[0] !== _m547_0 || b.made[1] !== _m550_1) {
          _g8344.length = 0;
          G8345: {
            const _a8348 = sp.edges;
            for (let _i8349 = 0; _i8349 < _a8348.length; _i8349++) {
              const v_e = _a8348[_i8349];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g8344.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g8344))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _c8351: boolean = (v_A || v_B);
        if (_c8351) {
          let _c8350: boolean = !(!(v_A));
          if (!_c8350) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c8350 = true;
          }
          _c8351 = _c8350;
        }
        let _c8353: boolean = _c8351;
        if (_c8353) {
          let _c8352: boolean = !(!(v_B));
          if (!_c8352) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c8352 = true;
          }
          _c8353 = _c8352;
        }
        if (!(_c8353)) return -1;
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
