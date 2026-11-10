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
  const _g12341: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h12350 = sp.cells.length;
  const _k12365 = armsKept.board(cl);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q12334 = true;
  Q12335: {
    const _a12336 = sp.cells;
    for (let _i12337 = 0; _i12337 < _a12336.length; _i12337++) {
      const v_c = _a12336[_i12337];
      const _h12338 = clueAt(cl.piece, v_c);
      if (!((_h12338 !== -1))) {
        _q12334 = false;
        break Q12335;
      }
    }
  }
  if (!(_q12334)) return false;
  let _q12339 = true;
  Q12340: {
    _g12341.length = 0;
    G12342: {
      const _a12345 = sp.edges;
      for (let _i12346 = 0; _i12346 < _a12345.length; _i12346++) {
        const v_e = _a12345[_i12346];
        const _h12347 = (g[v_e] || -1);
        if (!((_h12347 === 1))) continue;
        _g12341.push(v_e);
      }
    }
    const v_L = _g12341;
    const _h12349 = v_L.length;
    const _eg12355 = edgeGroups(sp, v_L);
    const _t12348 = sp.cells;
    const v_s = (_t12348.length > 0 ? _t12348[0] : -1);
    let _c12356: boolean = (_h12349 === (_h12350 - 1));
    if (_c12356) {
      let _q12351 = true;
      Q12352: {
        const _a12353 = sp.cells;
        for (let _i12354 = 0; _i12354 < _a12353.length; _i12354++) {
          const v_c = _a12353[_i12354];
          if (!((_eg12355.of(v_c) === _eg12355.of(v_s)))) {
            _q12351 = false;
            break Q12352;
          }
        }
      }
      _c12356 = _q12351;
    }
    if (!(_c12356)) {
      _q12339 = false;
      break Q12340;
    }
  }
  if (!(_q12339)) return false;
  for (let _k12357 = 0; _k12357 < cl.piece.at.length; _k12357++) {
    const _at12358 = cl.piece.at[_k12357];
    const _v12359 = cl.piece.v[_k12357];
    let _g12360 = 0;
    G12361: {
      const _a12362 = sp.cellEdges[_at12358];
      for (let _i12363 = 0; _i12363 < _a12362.length; _i12363++) {
        const v_e = _a12362[_i12363];
        const _h12364 = (g[v_e] || -1);
        if (!((_h12364 === 1))) continue;
        _g12360++;
      }
    }
    let _c12376: boolean = (_g12360 === (_k12365[_at12358] ?? arms(sp, cl, _at12358)));
    if (_c12376) {
      let _q12366 = true;
      Q12367: {
        const _a12368 = sp.cellEdges[_at12358];
        for (let _i12369 = 0; _i12369 < _a12368.length; _i12369++) {
          const v_e = _a12368[_i12369];
          const _h12373 = (g[v_e] || -1);
          const _h12374 = (_h12373 === 1);
          const _a12370 = sp.cellEdges[_at12358];
          const _n12371 = _i12369;
          for (let _i12372 = 0; _i12372 < _n12371; _i12372++) {
            const v_x = _a12370[_i12372];
            const _h12375 = (g[v_x] || -1);
            if (!(((((_k12365[_at12358] ?? arms(sp, cl, _at12358)) === 2) && _h12374) && (_h12375 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v12359 === 3)))) {
              _q12366 = false;
              break Q12367;
            }
          }
        }
      }
      _c12376 = _q12366;
    }
    if (!(_c12376)) return false;
  }
  for (let _k12377 = 0; _k12377 < cl.wall.at.length; _k12377++) {
    const _at12378 = cl.wall.at[_k12377];
    if (!(((g[_at12378] || -1) === 2))) return false;
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
        if (import.meta.env.DEV && staleChecking) {
          const _g212: number[] = [];
          G213: {
            const _a216 = sp.cellEdges[v_c];
            for (let _i217 = 0; _i217 < _a216.length; _i217++) {
              const v_e = _a216[_i217];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g212.push(v_e);
            }
          }
          const _g218: number[] = [];
          G219: {
            const _a240 = v_F;
            for (let _i241 = 0; _i241 < _a240.length; _i241++) {
              const v_e = _a240[_i241];
              let _q242 = false;
              Q243: {
                const _f245 = new Int32Array(sp.edges.length).fill(-1);
                let _l246: readonly number[] = [];
                const _s247: number[] = [];
                const _a244 = sp.cellEdges[v_c];
                for (const _e248 of _l246) _f245[_e248] = -1;
                _l246 = _a244;
                let _i250 = 0;
                _s247[0] = 0;
                let _o254 = _a244.length === 0;
                for (;;) {
                  if (_a244.length === 0) {
                    if (!_o254) break;
                    _o254 = false;
                  }
                  while (_a244.length > 0 && _i250 >= 0) {
                    const _e248 = _a244[_i250];
                    if (_s247[_i250] > 0) _f245[_e248] = -1;
                    let _r253 = (cands[_e248] >= 0 ? cands[_e248] : (cands[_e248] = b.cands[_e248])) & ~((2 << _s247[_i250]) - 1);
                    let _d249 = 0;
                    V252: for (; _r253 !== 0; _r253 &= _r253 - 1) {
                      _d249 = 31 - Math.clz32(_r253 & -_r253);
                      _f245[_e248] = _d249;
                      if (_e248 === v_e && _d249 !== 1) continue;
                      for (let _j251 = 0; _j251 < _i250; _j251++) {
                        const _y255 = _a244[_j251];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f245[_e248] === 1)) && (_f245[_y255] === 1)))) continue;
                        if (!((bent(sp, _e248, _y255) === (clueAt(cl.piece, v_c) === 3)))) continue V252;
                      }
                      break;
                    }
                    if (_r253 === 0) {
                      _s247[_i250] = 0;
                      _i250--;
                      continue;
                    }
                    _s247[_i250] = _d249;
                    if (_i250 === _a244.length - 1) break;
                    _i250++;
                    _s247[_i250] = 0;
                  }
                  if (_i250 < 0) break;
                  let _g256 = 0;
                  G257: {
                    const _a258 = sp.cellEdges[v_c];
                    for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                      const v_x = _a258[_i259];
                      if (!((_f245[v_x] === 1))) continue;
                      _g256++;
                    }
                  }
                  if (!((_g256 === arms(sp, cl, v_c)))) continue;
                  if (true) {
                    _q242 = true;
                    break Q243;
                  }
                }
              }
              if (!(_q242)) continue;
              _g218.push(v_e);
            }
          }
          const _g260: number[] = [];
          G261: {
            const _a282 = v_F;
            for (let _i283 = 0; _i283 < _a282.length; _i283++) {
              const v_e = _a282[_i283];
              let _q284 = false;
              Q285: {
                const _f287 = new Int32Array(sp.edges.length).fill(-1);
                let _l288: readonly number[] = [];
                const _s289: number[] = [];
                const _a286 = sp.cellEdges[v_c];
                for (const _e290 of _l288) _f287[_e290] = -1;
                _l288 = _a286;
                let _i292 = 0;
                _s289[0] = 0;
                let _o296 = _a286.length === 0;
                for (;;) {
                  if (_a286.length === 0) {
                    if (!_o296) break;
                    _o296 = false;
                  }
                  while (_a286.length > 0 && _i292 >= 0) {
                    const _e290 = _a286[_i292];
                    if (_s289[_i292] > 0) _f287[_e290] = -1;
                    let _r295 = (cands[_e290] >= 0 ? cands[_e290] : (cands[_e290] = b.cands[_e290])) & ~((2 << _s289[_i292]) - 1);
                    let _d291 = 0;
                    V294: for (; _r295 !== 0; _r295 &= _r295 - 1) {
                      _d291 = 31 - Math.clz32(_r295 & -_r295);
                      _f287[_e290] = _d291;
                      if (_e290 === v_e && _d291 !== 2) continue;
                      for (let _j293 = 0; _j293 < _i292; _j293++) {
                        const _y297 = _a286[_j293];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f287[_e290] === 1)) && (_f287[_y297] === 1)))) continue;
                        if (!((bent(sp, _e290, _y297) === (clueAt(cl.piece, v_c) === 3)))) continue V294;
                      }
                      break;
                    }
                    if (_r295 === 0) {
                      _s289[_i292] = 0;
                      _i292--;
                      continue;
                    }
                    _s289[_i292] = _d291;
                    if (_i292 === _a286.length - 1) break;
                    _i292++;
                    _s289[_i292] = 0;
                  }
                  if (_i292 < 0) break;
                  let _g298 = 0;
                  G299: {
                    const _a300 = sp.cellEdges[v_c];
                    for (let _i301 = 0; _i301 < _a300.length; _i301++) {
                      const v_x = _a300[_i301];
                      if (!((_f287[v_x] === 1))) continue;
                      _g298++;
                    }
                  }
                  if (!((_g298 === arms(sp, cl, v_c)))) continue;
                  if (true) {
                    _q284 = true;
                    break Q285;
                  }
                }
              }
              if (!(_q284)) continue;
              _g260.push(v_e);
            }
          }
          let _q302 = true;
          Q303: {
            const _a304 = v_F;
            for (let _i305 = 0; _i305 < _a304.length; _i305++) {
              const v_e = _a304[_i305];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q302 = false;
                break Q303;
              }
            }
          }
          freshBinding("fitLock", [(sp.cells.includes(v_c)), sameSet(v_F, _g212), (v_F.length > 0), sameSet(v_W, _g218), sameSet(v_N, _g260), _q302], ["c in", "F =", "where of F", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q306 = true;
        Q307: {
          const _a308 = v_F;
          for (let _i309 = 0; _i309 < _a308.length; _i309++) {
            const v_e = _a308[_i309];
            let _c311: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c311) {
              let _c310: boolean = !(!(v_W.includes(v_e)));
              if (!_c310) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c310 = true;
              }
              _c311 = _c310;
            }
            let _c313: boolean = _c311;
            if (_c313) {
              let _c312: boolean = !(!(v_N.includes(v_e)));
              if (!_c312) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c312 = true;
              }
              _c313 = _c312;
            }
            if (!(_c313)) {
              _q306 = false;
              break Q307;
            }
          }
        }
        if (!(_q306)) return -1;
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
let _p359 = new Int32Array(0);
let _l360: readonly number[] = [];
let _f365 = new Int32Array(0);
let _l366: readonly number[] = [];
let _p381 = new Int32Array(0);
let _l382: readonly number[] = [];
let _f387 = new Int32Array(0);
let _l388: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const fitNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function fitNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitNoteBinding> | null): number {
  if (_p359.length < sp.edges.length) _p359 = new Int32Array(sp.edges.length);
  else _p359.fill(0);
  _l360 = [];
  let _y361 = false;
  if (_f365.length < sp.edges.length) _f365 = new Int32Array(sp.edges.length).fill(-1);
  else _f365.fill(-1);
  _l366 = [];
  const _s367: number[] = [];
  if (_p381.length < sp.edges.length) _p381 = new Int32Array(sp.edges.length);
  else _p381.fill(0);
  _l382 = [];
  let _y383 = false;
  if (_f387.length < sp.edges.length) _f387 = new Int32Array(sp.edges.length).fill(-1);
  else _f387.fill(-1);
  _l388 = [];
  const _s389: number[] = [];
  const facts = fitNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k376 = armsKept.board(cl);
  if (fitNoteCands.length < sp.edges.length) fitNoteCands = new Int32Array(sp.edges.length);
  const cands = fitNoteCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(fitNoteFootprint) ?? null) : null;
  const _a355 = sp.cells;
  for (let _i356 = 0; _i356 < _a355.length; _i356++) {
    const v_c = _a355[_i356];
    let _g362 = -1;
    let _g384 = -1;
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _a357 = sp.cellEdges[v_c];
    for (let _i358 = 0; _i358 < _a357.length; _i358++) {
      const v_e = _a357[_i358];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g362 !== _epoch) {
        _g362 = _epoch;
        for (const _e363 of _l360) _p359[_e363] = 0;
        _y361 = false;
        const _a364 = sp.cellEdges[v_c];
        for (const _e368 of _l366) _f365[_e368] = -1;
        _l366 = _a364;
        let _i370 = 0;
        _s367[0] = 0;
        let _o374 = _a364.length === 0;
        for (;;) {
          if (_a364.length === 0) {
            if (!_o374) break;
            _o374 = false;
          }
          while (_a364.length > 0 && _i370 >= 0) {
            const _e368 = _a364[_i370];
            if (_s367[_i370] > 0) _f365[_e368] = -1;
            let _r373 = (cands[_e368] >= 0 ? cands[_e368] : (cands[_e368] = b.cands[_e368])) & ~((2 << _s367[_i370]) - 1);
            let _d369 = 0;
            V372: for (; _r373 !== 0; _r373 &= _r373 - 1) {
              _d369 = 31 - Math.clz32(_r373 & -_r373);
              _f365[_e368] = _d369;
              for (let _j371 = 0; _j371 < _i370; _j371++) {
                const _y375 = _a364[_j371];
                if (!(((((_k376[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f365[_e368] === 1)) && (_f365[_y375] === 1)))) continue;
                if (!((bent(sp, _e368, _y375) === (clueAt(cl.piece, v_c) === 3)))) continue V372;
              }
              break;
            }
            if (_r373 === 0) {
              _s367[_i370] = 0;
              _i370--;
              continue;
            }
            _s367[_i370] = _d369;
            if (_i370 === _a364.length - 1) break;
            _i370++;
            _s367[_i370] = 0;
          }
          if (_i370 < 0) break;
          let _g377 = 0;
          G378: {
            const _a379 = sp.cellEdges[v_c];
            for (let _i380 = 0; _i380 < _a379.length; _i380++) {
              const v_x = _a379[_i380];
              if (!((_f365[v_x] === 1))) continue;
              _g377++;
            }
          }
          if (!((_g377 === (_k376[v_c] ?? arms(sp, cl, v_c))))) continue;
          if (!(true)) continue;
          _l360 = _a364;
          _y361 = true;
          for (const _e363 of _a364) _p359[_e363] |= 1 << _f365[_e363];
        }
      }
      const v_A = ((((_p359[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y361 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g384 !== _epoch) {
        _g384 = _epoch;
        for (const _e385 of _l382) _p381[_e385] = 0;
        _y383 = false;
        const _a386 = sp.cellEdges[v_c];
        for (const _e390 of _l388) _f387[_e390] = -1;
        _l388 = _a386;
        let _i392 = 0;
        _s389[0] = 0;
        let _o396 = _a386.length === 0;
        for (;;) {
          if (_a386.length === 0) {
            if (!_o396) break;
            _o396 = false;
          }
          while (_a386.length > 0 && _i392 >= 0) {
            const _e390 = _a386[_i392];
            if (_s389[_i392] > 0) _f387[_e390] = -1;
            let _r395 = (cands[_e390] >= 0 ? cands[_e390] : (cands[_e390] = b.cands[_e390])) & ~((2 << _s389[_i392]) - 1);
            let _d391 = 0;
            V394: for (; _r395 !== 0; _r395 &= _r395 - 1) {
              _d391 = 31 - Math.clz32(_r395 & -_r395);
              _f387[_e390] = _d391;
              for (let _j393 = 0; _j393 < _i392; _j393++) {
                const _y397 = _a386[_j393];
                if (!(((((_k376[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f387[_e390] === 1)) && (_f387[_y397] === 1)))) continue;
                if (!((bent(sp, _e390, _y397) === (clueAt(cl.piece, v_c) === 3)))) continue V394;
              }
              break;
            }
            if (_r395 === 0) {
              _s389[_i392] = 0;
              _i392--;
              continue;
            }
            _s389[_i392] = _d391;
            if (_i392 === _a386.length - 1) break;
            _i392++;
            _s389[_i392] = 0;
          }
          if (_i392 < 0) break;
          let _g398 = 0;
          G399: {
            const _a400 = sp.cellEdges[v_c];
            for (let _i401 = 0; _i401 < _a400.length; _i401++) {
              const v_x = _a400[_i401];
              if (!((_f387[v_x] === 1))) continue;
              _g398++;
            }
          }
          if (!((_g398 === (_k376[v_c] ?? arms(sp, cl, v_c))))) continue;
          if (!(true)) continue;
          _l382 = _a386;
          _y383 = true;
          for (const _e385 of _a386) _p381[_e385] |= 1 << _f387[_e385];
        }
      }
      L402: {
        const v_B = ((((_p381[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y383 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L402;
        if (import.meta.env.DEV && staleChecking) {
          let _q403 = false;
          Q404: {
            const _f406 = new Int32Array(sp.edges.length).fill(-1);
            let _l407: readonly number[] = [];
            const _s408: number[] = [];
            const _a405 = sp.cellEdges[v_c];
            for (const _e409 of _l407) _f406[_e409] = -1;
            _l407 = _a405;
            let _i411 = 0;
            _s408[0] = 0;
            let _o415 = _a405.length === 0;
            for (;;) {
              if (_a405.length === 0) {
                if (!_o415) break;
                _o415 = false;
              }
              while (_a405.length > 0 && _i411 >= 0) {
                const _e409 = _a405[_i411];
                if (_s408[_i411] > 0) _f406[_e409] = -1;
                let _r414 = (cands[_e409] >= 0 ? cands[_e409] : (cands[_e409] = b.cands[_e409])) & ~((2 << _s408[_i411]) - 1);
                let _d410 = 0;
                V413: for (; _r414 !== 0; _r414 &= _r414 - 1) {
                  _d410 = 31 - Math.clz32(_r414 & -_r414);
                  _f406[_e409] = _d410;
                  if (_e409 === v_e && _d410 !== 1) continue;
                  for (let _j412 = 0; _j412 < _i411; _j412++) {
                    const _y416 = _a405[_j412];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f406[_e409] === 1)) && (_f406[_y416] === 1)))) continue;
                    if (!((bent(sp, _e409, _y416) === (clueAt(cl.piece, v_c) === 3)))) continue V413;
                  }
                  break;
                }
                if (_r414 === 0) {
                  _s408[_i411] = 0;
                  _i411--;
                  continue;
                }
                _s408[_i411] = _d410;
                if (_i411 === _a405.length - 1) break;
                _i411++;
                _s408[_i411] = 0;
              }
              if (_i411 < 0) break;
              let _g417 = 0;
              G418: {
                const _a419 = sp.cellEdges[v_c];
                for (let _i420 = 0; _i420 < _a419.length; _i420++) {
                  const v_x = _a419[_i420];
                  if (!((_f406[v_x] === 1))) continue;
                  _g417++;
                }
              }
              if (!((_g417 === arms(sp, cl, v_c)))) continue;
              if (true) {
                _q403 = true;
                break Q404;
              }
            }
          }
          let _q421 = false;
          Q422: {
            const _f424 = new Int32Array(sp.edges.length).fill(-1);
            let _l425: readonly number[] = [];
            const _s426: number[] = [];
            const _a423 = sp.cellEdges[v_c];
            for (const _e427 of _l425) _f424[_e427] = -1;
            _l425 = _a423;
            let _i429 = 0;
            _s426[0] = 0;
            let _o433 = _a423.length === 0;
            for (;;) {
              if (_a423.length === 0) {
                if (!_o433) break;
                _o433 = false;
              }
              while (_a423.length > 0 && _i429 >= 0) {
                const _e427 = _a423[_i429];
                if (_s426[_i429] > 0) _f424[_e427] = -1;
                let _r432 = (cands[_e427] >= 0 ? cands[_e427] : (cands[_e427] = b.cands[_e427])) & ~((2 << _s426[_i429]) - 1);
                let _d428 = 0;
                V431: for (; _r432 !== 0; _r432 &= _r432 - 1) {
                  _d428 = 31 - Math.clz32(_r432 & -_r432);
                  _f424[_e427] = _d428;
                  if (_e427 === v_e && _d428 !== 2) continue;
                  for (let _j430 = 0; _j430 < _i429; _j430++) {
                    const _y434 = _a423[_j430];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f424[_e427] === 1)) && (_f424[_y434] === 1)))) continue;
                    if (!((bent(sp, _e427, _y434) === (clueAt(cl.piece, v_c) === 3)))) continue V431;
                  }
                  break;
                }
                if (_r432 === 0) {
                  _s426[_i429] = 0;
                  _i429--;
                  continue;
                }
                _s426[_i429] = _d428;
                if (_i429 === _a423.length - 1) break;
                _i429++;
                _s426[_i429] = 0;
              }
              if (_i429 < 0) break;
              let _g435 = 0;
              G436: {
                const _a437 = sp.cellEdges[v_c];
                for (let _i438 = 0; _i438 < _a437.length; _i438++) {
                  const v_x = _a437[_i438];
                  if (!((_f424[v_x] === 1))) continue;
                  _g435++;
                }
              }
              if (!((_g435 === arms(sp, cl, v_c)))) continue;
              if (true) {
                _q421 = true;
                break Q422;
              }
            }
          }
          freshBinding("fitNote", [(sp.cells.includes(v_c)), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q403), (v_B === _q421), (!(v_A) || !(v_B))], ["c in", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c440: boolean = (v_A || v_B);
        if (_c440) {
          let _c439: boolean = !(!(v_A));
          if (!_c439) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c439 = true;
          }
          _c440 = _c439;
        }
        let _c442: boolean = _c440;
        if (_c442) {
          let _c441: boolean = !(!(v_B));
          if (!_c441) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c441 = true;
          }
          _c442 = _c441;
        }
        if (!(_c442)) return -1;
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
let _p618 = new Int32Array(0);
let _l619: readonly number[] = [];
let _f624 = new Int32Array(0);
let _l625: readonly number[] = [];
let _p676 = new Int32Array(0);
let _l677: readonly number[] = [];
let _f682 = new Int32Array(0);
let _l683: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const loopLockFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds"],"kind":"group","set":0},{"steps":[],"kind":"group","set":0}],"relation":false,"sets":["L"]};

/** Its dearest read grows with the board as n. */
export function loopLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopLockBinding> | null): number {
  const _g571: number[] = [];
  const _g579: number[] = [];
  const _g588: number[] = [];
  if (_p618.length < sp.edges.length) _p618 = new Int32Array(sp.edges.length);
  else _p618.fill(0);
  _l619 = [];
  let _y620 = false;
  if (_f624.length < sp.edges.length) _f624 = new Int32Array(sp.edges.length).fill(-1);
  else _f624.fill(-1);
  _l625 = [];
  const _s626: number[] = [];
  const _g646: number[] = [];
  if (_p676.length < sp.edges.length) _p676 = new Int32Array(sp.edges.length);
  else _p676.fill(0);
  _l677 = [];
  let _y678 = false;
  if (_f682.length < sp.edges.length) _f682 = new Int32Array(sp.edges.length).fill(-1);
  else _f682.fill(-1);
  _l683 = [];
  const _s684: number[] = [];
  const _g708: number[] = [];
  const facts = loopLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k635 = armsKept.board(cl);
  if (loopLockCands.length < sp.edges.length) loopLockCands = new Int32Array(sp.edges.length);
  const cands = loopLockCands;
  cands.fill(-1);
  const _m66_0 = b.made[0];
  _g571.length = 0;
  G572: {
    const _a575 = sp.edges;
    for (let _i576 = 0; _i576 < _a575.length; _i576++) {
      const v_e = _a575[_i576];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g571.push(v_e);
    }
  }
  const v_L = _g571;
  const _m69_1 = b.made[1];
  const _eg587 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _visit = fire === null ? (b.visit?.(loopLockFootprint, [_eg587]) ?? null) : null;
  const _a577 = sp.cells;
  for (let _i578 = 0; _i578 < _a577.length; _i578++) {
    const v_c = _a577[_i578];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g579.length = 0;
    G580: {
      const _a583 = sp.cellEdges[v_c];
      for (let _i584 = 0; _i584 < _a583.length; _i584++) {
        const v_e = _a583[_i584];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g579.push(v_e);
      }
    }
    L585: {
      const v_F = _g579;
      const _h586 = v_F.length;
      if (!((_h586 > 0))) break L585;
      const v_G = _eg587.of(v_c);
      let _g621 = -1;
      let _g679 = -1;
      _g588.length = 0;
      G589: {
        const _a616 = v_F;
        for (let _i617 = 0; _i617 < _a616.length; _i617++) {
          const v_e = _a616[_i617];
          if (_g621 !== _epoch) {
            _g621 = _epoch;
            for (const _e622 of _l619) _p618[_e622] = 0;
            _y620 = false;
            const _a623 = sp.cellEdges[v_c];
            for (const _e627 of _l625) _f624[_e627] = -1;
            _l625 = _a623;
            let _i629 = 0;
            _s626[0] = 0;
            let _o633 = _a623.length === 0;
            for (;;) {
              if (_a623.length === 0) {
                if (!_o633) break;
                _o633 = false;
              }
              while (_a623.length > 0 && _i629 >= 0) {
                const _e627 = _a623[_i629];
                if (_s626[_i629] > 0) _f624[_e627] = -1;
                let _r632 = (cands[_e627] >= 0 ? cands[_e627] : (cands[_e627] = b.cands[_e627])) & ~((2 << _s626[_i629]) - 1);
                let _d628 = 0;
                V631: for (; _r632 !== 0; _r632 &= _r632 - 1) {
                  _d628 = 31 - Math.clz32(_r632 & -_r632);
                  _f624[_e627] = _d628;
                  for (let _j630 = 0; _j630 < _i629; _j630++) {
                    const _y634 = _a623[_j630];
                    if (!(((((_k635[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f624[_e627] === 1)) && (_f624[_y634] === 1)))) continue;
                    if (!((bent(sp, _e627, _y634) === (clueAt(cl.piece, v_c) === 3)))) continue V631;
                  }
                  for (let _j630 = 0; _j630 < _i629; _j630++) {
                    const _y636 = _a623[_j630];
                    if (!(((((_f624[_e627] === 1) && (_f624[_y636] === 1)) && !((b.grid[_e627] !== 0))) && !((b.grid[_y636] !== 0))))) continue;
                    if (!(!(_eg587.of((sp.edgeEnds[2 * _y636] === v_c ? sp.edgeEnds[2 * _y636 + 1] : sp.edgeEnds[2 * _y636])) === _eg587.of((sp.edgeEnds[2 * _e627] === v_c ? sp.edgeEnds[2 * _e627 + 1] : sp.edgeEnds[2 * _e627]))))) continue V631;
                  }
                  break;
                }
                if (_r632 === 0) {
                  _s626[_i629] = 0;
                  _i629--;
                  continue;
                }
                _s626[_i629] = _d628;
                if (_i629 === _a623.length - 1) break;
                _i629++;
                _s626[_i629] = 0;
              }
              if (_i629 < 0) break;
              let _g637 = 0;
              G638: {
                const _a639 = sp.cellEdges[v_c];
                for (let _i640 = 0; _i640 < _a639.length; _i640++) {
                  const v_x = _a639[_i640];
                  if (!((_f624[v_x] === 1))) continue;
                  _g637++;
                }
              }
              let _c645: boolean = (_g637 === (_k635[v_c] ?? arms(sp, cl, v_c)));
              if (_c645) {
                let _q641 = true;
                Q642: {
                  const _a643 = sp.cellEdges[v_c];
                  for (let _i644 = 0; _i644 < _a643.length; _i644++) {
                    const v_x = _a643[_i644];
                    if (!(((_f624[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg587.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q641 = false;
                      break Q642;
                    }
                  }
                }
                _c645 = _q641;
              }
              if (!(_c645)) continue;
              if (!(true)) continue;
              _l619 = _a623;
              _y620 = true;
              for (const _e622 of _a623) _p618[_e622] |= 1 << _f624[_e622];
            }
          }
          if (!(((((_p618[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y620 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g588.push(v_e);
        }
      }
      const v_W = _g588;
      _g646.length = 0;
      G647: {
        const _a674 = v_F;
        for (let _i675 = 0; _i675 < _a674.length; _i675++) {
          const v_e = _a674[_i675];
          if (_g679 !== _epoch) {
            _g679 = _epoch;
            for (const _e680 of _l677) _p676[_e680] = 0;
            _y678 = false;
            const _a681 = sp.cellEdges[v_c];
            for (const _e685 of _l683) _f682[_e685] = -1;
            _l683 = _a681;
            let _i687 = 0;
            _s684[0] = 0;
            let _o691 = _a681.length === 0;
            for (;;) {
              if (_a681.length === 0) {
                if (!_o691) break;
                _o691 = false;
              }
              while (_a681.length > 0 && _i687 >= 0) {
                const _e685 = _a681[_i687];
                if (_s684[_i687] > 0) _f682[_e685] = -1;
                let _r690 = (cands[_e685] >= 0 ? cands[_e685] : (cands[_e685] = b.cands[_e685])) & ~((2 << _s684[_i687]) - 1);
                let _d686 = 0;
                V689: for (; _r690 !== 0; _r690 &= _r690 - 1) {
                  _d686 = 31 - Math.clz32(_r690 & -_r690);
                  _f682[_e685] = _d686;
                  for (let _j688 = 0; _j688 < _i687; _j688++) {
                    const _y692 = _a681[_j688];
                    if (!(((((_k635[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f682[_e685] === 1)) && (_f682[_y692] === 1)))) continue;
                    if (!((bent(sp, _e685, _y692) === (clueAt(cl.piece, v_c) === 3)))) continue V689;
                  }
                  for (let _j688 = 0; _j688 < _i687; _j688++) {
                    const _y693 = _a681[_j688];
                    if (!(((((_f682[_e685] === 1) && (_f682[_y693] === 1)) && !((b.grid[_e685] !== 0))) && !((b.grid[_y693] !== 0))))) continue;
                    if (!(!(_eg587.of((sp.edgeEnds[2 * _y693] === v_c ? sp.edgeEnds[2 * _y693 + 1] : sp.edgeEnds[2 * _y693])) === _eg587.of((sp.edgeEnds[2 * _e685] === v_c ? sp.edgeEnds[2 * _e685 + 1] : sp.edgeEnds[2 * _e685]))))) continue V689;
                  }
                  break;
                }
                if (_r690 === 0) {
                  _s684[_i687] = 0;
                  _i687--;
                  continue;
                }
                _s684[_i687] = _d686;
                if (_i687 === _a681.length - 1) break;
                _i687++;
                _s684[_i687] = 0;
              }
              if (_i687 < 0) break;
              let _g694 = 0;
              G695: {
                const _a696 = sp.cellEdges[v_c];
                for (let _i697 = 0; _i697 < _a696.length; _i697++) {
                  const v_x = _a696[_i697];
                  if (!((_f682[v_x] === 1))) continue;
                  _g694++;
                }
              }
              let _c702: boolean = (_g694 === (_k635[v_c] ?? arms(sp, cl, v_c)));
              if (_c702) {
                let _q698 = true;
                Q699: {
                  const _a700 = sp.cellEdges[v_c];
                  for (let _i701 = 0; _i701 < _a700.length; _i701++) {
                    const v_x = _a700[_i701];
                    if (!(((_f682[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg587.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q698 = false;
                      break Q699;
                    }
                  }
                }
                _c702 = _q698;
              }
              if (!(_c702)) continue;
              if (!(true)) continue;
              _l677 = _a681;
              _y678 = true;
              for (const _e680 of _a681) _p676[_e680] |= 1 << _f682[_e680];
            }
          }
          if (!(((((_p676[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y678 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g646.push(v_e);
        }
      }
      L703: {
        const v_N = _g646;
        let _q704 = true;
        Q705: {
          const _a706 = v_F;
          for (let _i707 = 0; _i707 < _a706.length; _i707++) {
            const v_e = _a706[_i707];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q704 = false;
              break Q705;
            }
          }
        }
        if (!(_q704)) break L703;
        if (b.made[0] !== _m66_0 || b.made[1] !== _m69_1) {
          _g708.length = 0;
          G709: {
            const _a712 = sp.edges;
            for (let _i713 = 0; _i713 < _a712.length; _i713++) {
              const v_e = _a712[_i713];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g708.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g708))) { if (_visit !== null) _visit[v_c] = 1; return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g714: number[] = [];
          G715: {
            const _a718 = sp.edges;
            for (let _i719 = 0; _i719 < _a718.length; _i719++) {
              const v_e = _a718[_i719];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g714.push(v_e);
            }
          }
          const _g720: number[] = [];
          G721: {
            const _a724 = sp.cellEdges[v_c];
            for (let _i725 = 0; _i725 < _a724.length; _i725++) {
              const v_e = _a724[_i725];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g720.push(v_e);
            }
          }
          const _g726: number[] = [];
          G727: {
            const _a754 = v_F;
            for (let _i755 = 0; _i755 < _a754.length; _i755++) {
              const v_e = _a754[_i755];
              let _q756 = false;
              Q757: {
                const _f759 = new Int32Array(sp.edges.length).fill(-1);
                let _l760: readonly number[] = [];
                const _s761: number[] = [];
                const _a758 = sp.cellEdges[v_c];
                for (const _e762 of _l760) _f759[_e762] = -1;
                _l760 = _a758;
                let _i764 = 0;
                _s761[0] = 0;
                let _o768 = _a758.length === 0;
                for (;;) {
                  if (_a758.length === 0) {
                    if (!_o768) break;
                    _o768 = false;
                  }
                  while (_a758.length > 0 && _i764 >= 0) {
                    const _e762 = _a758[_i764];
                    if (_s761[_i764] > 0) _f759[_e762] = -1;
                    let _r767 = (cands[_e762] >= 0 ? cands[_e762] : (cands[_e762] = b.cands[_e762])) & ~((2 << _s761[_i764]) - 1);
                    let _d763 = 0;
                    V766: for (; _r767 !== 0; _r767 &= _r767 - 1) {
                      _d763 = 31 - Math.clz32(_r767 & -_r767);
                      _f759[_e762] = _d763;
                      if (_e762 === v_e && _d763 !== 1) continue;
                      for (let _j765 = 0; _j765 < _i764; _j765++) {
                        const _y769 = _a758[_j765];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f759[_e762] === 1)) && (_f759[_y769] === 1)))) continue;
                        if (!((bent(sp, _e762, _y769) === (clueAt(cl.piece, v_c) === 3)))) continue V766;
                      }
                      for (let _j765 = 0; _j765 < _i764; _j765++) {
                        const _y770 = _a758[_j765];
                        if (!(((((_f759[_e762] === 1) && (_f759[_y770] === 1)) && !((b.grid[_e762] !== 0))) && !((b.grid[_y770] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e762] === v_c ? sp.edgeEnds[2 * _e762 + 1] : sp.edgeEnds[2 * _e762]), v_L).includes((sp.edgeEnds[2 * _y770] === v_c ? sp.edgeEnds[2 * _y770 + 1] : sp.edgeEnds[2 * _y770]))))) continue V766;
                      }
                      break;
                    }
                    if (_r767 === 0) {
                      _s761[_i764] = 0;
                      _i764--;
                      continue;
                    }
                    _s761[_i764] = _d763;
                    if (_i764 === _a758.length - 1) break;
                    _i764++;
                    _s761[_i764] = 0;
                  }
                  if (_i764 < 0) break;
                  let _g771 = 0;
                  G772: {
                    const _a773 = sp.cellEdges[v_c];
                    for (let _i774 = 0; _i774 < _a773.length; _i774++) {
                      const v_x = _a773[_i774];
                      if (!((_f759[v_x] === 1))) continue;
                      _g771++;
                    }
                  }
                  let _c779: boolean = (_g771 === arms(sp, cl, v_c));
                  if (_c779) {
                    let _q775 = true;
                    Q776: {
                      const _a777 = sp.cellEdges[v_c];
                      for (let _i778 = 0; _i778 < _a777.length; _i778++) {
                        const v_x = _a777[_i778];
                        if (!(((_f759[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg587.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q775 = false;
                          break Q776;
                        }
                      }
                    }
                    _c779 = _q775;
                  }
                  if (!(_c779)) continue;
                  if (true) {
                    _q756 = true;
                    break Q757;
                  }
                }
              }
              if (!(_q756)) continue;
              _g726.push(v_e);
            }
          }
          const _g780: number[] = [];
          G781: {
            const _a808 = v_F;
            for (let _i809 = 0; _i809 < _a808.length; _i809++) {
              const v_e = _a808[_i809];
              let _q810 = false;
              Q811: {
                const _f813 = new Int32Array(sp.edges.length).fill(-1);
                let _l814: readonly number[] = [];
                const _s815: number[] = [];
                const _a812 = sp.cellEdges[v_c];
                for (const _e816 of _l814) _f813[_e816] = -1;
                _l814 = _a812;
                let _i818 = 0;
                _s815[0] = 0;
                let _o822 = _a812.length === 0;
                for (;;) {
                  if (_a812.length === 0) {
                    if (!_o822) break;
                    _o822 = false;
                  }
                  while (_a812.length > 0 && _i818 >= 0) {
                    const _e816 = _a812[_i818];
                    if (_s815[_i818] > 0) _f813[_e816] = -1;
                    let _r821 = (cands[_e816] >= 0 ? cands[_e816] : (cands[_e816] = b.cands[_e816])) & ~((2 << _s815[_i818]) - 1);
                    let _d817 = 0;
                    V820: for (; _r821 !== 0; _r821 &= _r821 - 1) {
                      _d817 = 31 - Math.clz32(_r821 & -_r821);
                      _f813[_e816] = _d817;
                      if (_e816 === v_e && _d817 !== 2) continue;
                      for (let _j819 = 0; _j819 < _i818; _j819++) {
                        const _y823 = _a812[_j819];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f813[_e816] === 1)) && (_f813[_y823] === 1)))) continue;
                        if (!((bent(sp, _e816, _y823) === (clueAt(cl.piece, v_c) === 3)))) continue V820;
                      }
                      for (let _j819 = 0; _j819 < _i818; _j819++) {
                        const _y824 = _a812[_j819];
                        if (!(((((_f813[_e816] === 1) && (_f813[_y824] === 1)) && !((b.grid[_e816] !== 0))) && !((b.grid[_y824] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e816] === v_c ? sp.edgeEnds[2 * _e816 + 1] : sp.edgeEnds[2 * _e816]), v_L).includes((sp.edgeEnds[2 * _y824] === v_c ? sp.edgeEnds[2 * _y824 + 1] : sp.edgeEnds[2 * _y824]))))) continue V820;
                      }
                      break;
                    }
                    if (_r821 === 0) {
                      _s815[_i818] = 0;
                      _i818--;
                      continue;
                    }
                    _s815[_i818] = _d817;
                    if (_i818 === _a812.length - 1) break;
                    _i818++;
                    _s815[_i818] = 0;
                  }
                  if (_i818 < 0) break;
                  let _g825 = 0;
                  G826: {
                    const _a827 = sp.cellEdges[v_c];
                    for (let _i828 = 0; _i828 < _a827.length; _i828++) {
                      const v_x = _a827[_i828];
                      if (!((_f813[v_x] === 1))) continue;
                      _g825++;
                    }
                  }
                  let _c833: boolean = (_g825 === arms(sp, cl, v_c));
                  if (_c833) {
                    let _q829 = true;
                    Q830: {
                      const _a831 = sp.cellEdges[v_c];
                      for (let _i832 = 0; _i832 < _a831.length; _i832++) {
                        const v_x = _a831[_i832];
                        if (!(((_f813[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg587.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q829 = false;
                          break Q830;
                        }
                      }
                    }
                    _c833 = _q829;
                  }
                  if (!(_c833)) continue;
                  if (true) {
                    _q810 = true;
                    break Q811;
                  }
                }
              }
              if (!(_q810)) continue;
              _g780.push(v_e);
            }
          }
          let _q834 = true;
          Q835: {
            const _a836 = v_F;
            for (let _i837 = 0; _i837 < _a836.length; _i837++) {
              const v_e = _a836[_i837];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q834 = false;
                break Q835;
              }
            }
          }
          freshBinding("loopLock", [sameSet(v_L, _g714), (sp.cells.includes(v_c)), sameSet(v_F, _g720), (v_F.length > 0), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_W, _g726), sameSet(v_N, _g780), _q834], ["L =", "c in", "F =", "where of F", "G =", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q838 = true;
        Q839: {
          const _a840 = v_F;
          for (let _i841 = 0; _i841 < _a840.length; _i841++) {
            const v_e = _a840[_i841];
            let _c843: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c843) {
              let _c842: boolean = !(!(v_W.includes(v_e)));
              if (!_c842) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c842 = true;
              }
              _c843 = _c842;
            }
            let _c845: boolean = _c843;
            if (_c845) {
              let _c844: boolean = !(!(v_N.includes(v_e)));
              if (!_c844) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c844 = true;
              }
              _c845 = _c844;
            }
            if (!(_c845)) {
              _q838 = false;
              break Q839;
            }
          }
        }
        if (!(_q838)) return -1;
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
let _p924 = new Int32Array(0);
let _l925: readonly number[] = [];
let _f930 = new Int32Array(0);
let _l931: readonly number[] = [];
let _p952 = new Int32Array(0);
let _l953: readonly number[] = [];
let _f958 = new Int32Array(0);
let _l959: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const loopNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds"],"kind":"group","set":0},{"steps":[],"kind":"group","set":0}],"relation":false,"sets":["L"]};

/** Its dearest read grows with the board as n. */
export function loopNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopNoteBinding> | null): number {
  const _g909: number[] = [];
  if (_p924.length < sp.edges.length) _p924 = new Int32Array(sp.edges.length);
  else _p924.fill(0);
  _l925 = [];
  let _y926 = false;
  if (_f930.length < sp.edges.length) _f930 = new Int32Array(sp.edges.length).fill(-1);
  else _f930.fill(-1);
  _l931 = [];
  const _s932: number[] = [];
  if (_p952.length < sp.edges.length) _p952 = new Int32Array(sp.edges.length);
  else _p952.fill(0);
  _l953 = [];
  let _y954 = false;
  if (_f958.length < sp.edges.length) _f958 = new Int32Array(sp.edges.length).fill(-1);
  else _f958.fill(-1);
  _l959 = [];
  const _s960: number[] = [];
  const _g980: number[] = [];
  const facts = loopNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  const _k941 = armsKept.board(cl);
  if (loopNoteCands.length < sp.edges.length) loopNoteCands = new Int32Array(sp.edges.length);
  const cands = loopNoteCands;
  cands.fill(-1);
  const _m113_0 = b.made[0];
  _g909.length = 0;
  G910: {
    const _a913 = sp.edges;
    for (let _i914 = 0; _i914 < _a913.length; _i914++) {
      const v_e = _a913[_i914];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g909.push(v_e);
    }
  }
  const v_L = _g909;
  const _m116_1 = b.made[1];
  const _eg921 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _visit = fire === null ? (b.visit?.(loopNoteFootprint, [_eg921]) ?? null) : null;
  const _a915 = sp.cells;
  for (let _i916 = 0; _i916 < _a915.length; _i916++) {
    const v_c = _a915[_i916];
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _q917 = false;
    Q918: {
      const _a919 = sp.cellEdges[v_c];
      for (let _i920 = 0; _i920 < _a919.length; _i920++) {
        const v_e = _a919[_i920];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q917 = true;
          break Q918;
        }
      }
    }
    if (!(_q917)) continue;
    const v_G = _eg921.of(v_c);
    let _g927 = -1;
    let _g955 = -1;
    const _a922 = sp.cellEdges[v_c];
    for (let _i923 = 0; _i923 < _a922.length; _i923++) {
      const v_e = _a922[_i923];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g927 !== _epoch) {
        _g927 = _epoch;
        for (const _e928 of _l925) _p924[_e928] = 0;
        _y926 = false;
        const _a929 = sp.cellEdges[v_c];
        for (const _e933 of _l931) _f930[_e933] = -1;
        _l931 = _a929;
        let _i935 = 0;
        _s932[0] = 0;
        let _o939 = _a929.length === 0;
        for (;;) {
          if (_a929.length === 0) {
            if (!_o939) break;
            _o939 = false;
          }
          while (_a929.length > 0 && _i935 >= 0) {
            const _e933 = _a929[_i935];
            if (_s932[_i935] > 0) _f930[_e933] = -1;
            let _r938 = (cands[_e933] >= 0 ? cands[_e933] : (cands[_e933] = b.cands[_e933])) & ~((2 << _s932[_i935]) - 1);
            let _d934 = 0;
            V937: for (; _r938 !== 0; _r938 &= _r938 - 1) {
              _d934 = 31 - Math.clz32(_r938 & -_r938);
              _f930[_e933] = _d934;
              for (let _j936 = 0; _j936 < _i935; _j936++) {
                const _y940 = _a929[_j936];
                if (!(((((_k941[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f930[_e933] === 1)) && (_f930[_y940] === 1)))) continue;
                if (!((bent(sp, _e933, _y940) === (clueAt(cl.piece, v_c) === 3)))) continue V937;
              }
              for (let _j936 = 0; _j936 < _i935; _j936++) {
                const _y942 = _a929[_j936];
                if (!(((((_f930[_e933] === 1) && (_f930[_y942] === 1)) && !((b.grid[_e933] !== 0))) && !((b.grid[_y942] !== 0))))) continue;
                if (!(!(_eg921.of((sp.edgeEnds[2 * _y942] === v_c ? sp.edgeEnds[2 * _y942 + 1] : sp.edgeEnds[2 * _y942])) === _eg921.of((sp.edgeEnds[2 * _e933] === v_c ? sp.edgeEnds[2 * _e933 + 1] : sp.edgeEnds[2 * _e933]))))) continue V937;
              }
              break;
            }
            if (_r938 === 0) {
              _s932[_i935] = 0;
              _i935--;
              continue;
            }
            _s932[_i935] = _d934;
            if (_i935 === _a929.length - 1) break;
            _i935++;
            _s932[_i935] = 0;
          }
          if (_i935 < 0) break;
          let _g943 = 0;
          G944: {
            const _a945 = sp.cellEdges[v_c];
            for (let _i946 = 0; _i946 < _a945.length; _i946++) {
              const v_x = _a945[_i946];
              if (!((_f930[v_x] === 1))) continue;
              _g943++;
            }
          }
          let _c951: boolean = (_g943 === (_k941[v_c] ?? arms(sp, cl, v_c)));
          if (_c951) {
            let _q947 = true;
            Q948: {
              const _a949 = sp.cellEdges[v_c];
              for (let _i950 = 0; _i950 < _a949.length; _i950++) {
                const v_x = _a949[_i950];
                if (!(((_f930[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg921.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q947 = false;
                  break Q948;
                }
              }
            }
            _c951 = _q947;
          }
          if (!(_c951)) continue;
          if (!(true)) continue;
          _l925 = _a929;
          _y926 = true;
          for (const _e928 of _a929) _p924[_e928] |= 1 << _f930[_e928];
        }
      }
      const v_A = ((((_p924[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y926 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g955 !== _epoch) {
        _g955 = _epoch;
        for (const _e956 of _l953) _p952[_e956] = 0;
        _y954 = false;
        const _a957 = sp.cellEdges[v_c];
        for (const _e961 of _l959) _f958[_e961] = -1;
        _l959 = _a957;
        let _i963 = 0;
        _s960[0] = 0;
        let _o967 = _a957.length === 0;
        for (;;) {
          if (_a957.length === 0) {
            if (!_o967) break;
            _o967 = false;
          }
          while (_a957.length > 0 && _i963 >= 0) {
            const _e961 = _a957[_i963];
            if (_s960[_i963] > 0) _f958[_e961] = -1;
            let _r966 = (cands[_e961] >= 0 ? cands[_e961] : (cands[_e961] = b.cands[_e961])) & ~((2 << _s960[_i963]) - 1);
            let _d962 = 0;
            V965: for (; _r966 !== 0; _r966 &= _r966 - 1) {
              _d962 = 31 - Math.clz32(_r966 & -_r966);
              _f958[_e961] = _d962;
              for (let _j964 = 0; _j964 < _i963; _j964++) {
                const _y968 = _a957[_j964];
                if (!(((((_k941[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f958[_e961] === 1)) && (_f958[_y968] === 1)))) continue;
                if (!((bent(sp, _e961, _y968) === (clueAt(cl.piece, v_c) === 3)))) continue V965;
              }
              for (let _j964 = 0; _j964 < _i963; _j964++) {
                const _y969 = _a957[_j964];
                if (!(((((_f958[_e961] === 1) && (_f958[_y969] === 1)) && !((b.grid[_e961] !== 0))) && !((b.grid[_y969] !== 0))))) continue;
                if (!(!(_eg921.of((sp.edgeEnds[2 * _y969] === v_c ? sp.edgeEnds[2 * _y969 + 1] : sp.edgeEnds[2 * _y969])) === _eg921.of((sp.edgeEnds[2 * _e961] === v_c ? sp.edgeEnds[2 * _e961 + 1] : sp.edgeEnds[2 * _e961]))))) continue V965;
              }
              break;
            }
            if (_r966 === 0) {
              _s960[_i963] = 0;
              _i963--;
              continue;
            }
            _s960[_i963] = _d962;
            if (_i963 === _a957.length - 1) break;
            _i963++;
            _s960[_i963] = 0;
          }
          if (_i963 < 0) break;
          let _g970 = 0;
          G971: {
            const _a972 = sp.cellEdges[v_c];
            for (let _i973 = 0; _i973 < _a972.length; _i973++) {
              const v_x = _a972[_i973];
              if (!((_f958[v_x] === 1))) continue;
              _g970++;
            }
          }
          let _c978: boolean = (_g970 === (_k941[v_c] ?? arms(sp, cl, v_c)));
          if (_c978) {
            let _q974 = true;
            Q975: {
              const _a976 = sp.cellEdges[v_c];
              for (let _i977 = 0; _i977 < _a976.length; _i977++) {
                const v_x = _a976[_i977];
                if (!(((_f958[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg921.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q974 = false;
                  break Q975;
                }
              }
            }
            _c978 = _q974;
          }
          if (!(_c978)) continue;
          if (!(true)) continue;
          _l953 = _a957;
          _y954 = true;
          for (const _e956 of _a957) _p952[_e956] |= 1 << _f958[_e956];
        }
      }
      L979: {
        const v_B = ((((_p952[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y954 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L979;
        if (b.made[0] !== _m113_0 || b.made[1] !== _m116_1) {
          _g980.length = 0;
          G981: {
            const _a984 = sp.edges;
            for (let _i985 = 0; _i985 < _a984.length; _i985++) {
              const v_e = _a984[_i985];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g980.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g980))) { if (_visit !== null) _visit[v_c] = 1; return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g986: number[] = [];
          G987: {
            const _a990 = sp.edges;
            for (let _i991 = 0; _i991 < _a990.length; _i991++) {
              const v_e = _a990[_i991];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g986.push(v_e);
            }
          }
          let _q992 = false;
          Q993: {
            const _f995 = new Int32Array(sp.edges.length).fill(-1);
            let _l996: readonly number[] = [];
            const _s997: number[] = [];
            const _a994 = sp.cellEdges[v_c];
            for (const _e998 of _l996) _f995[_e998] = -1;
            _l996 = _a994;
            let _i1000 = 0;
            _s997[0] = 0;
            let _o1004 = _a994.length === 0;
            for (;;) {
              if (_a994.length === 0) {
                if (!_o1004) break;
                _o1004 = false;
              }
              while (_a994.length > 0 && _i1000 >= 0) {
                const _e998 = _a994[_i1000];
                if (_s997[_i1000] > 0) _f995[_e998] = -1;
                let _r1003 = (cands[_e998] >= 0 ? cands[_e998] : (cands[_e998] = b.cands[_e998])) & ~((2 << _s997[_i1000]) - 1);
                let _d999 = 0;
                V1002: for (; _r1003 !== 0; _r1003 &= _r1003 - 1) {
                  _d999 = 31 - Math.clz32(_r1003 & -_r1003);
                  _f995[_e998] = _d999;
                  if (_e998 === v_e && _d999 !== 1) continue;
                  for (let _j1001 = 0; _j1001 < _i1000; _j1001++) {
                    const _y1005 = _a994[_j1001];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f995[_e998] === 1)) && (_f995[_y1005] === 1)))) continue;
                    if (!((bent(sp, _e998, _y1005) === (clueAt(cl.piece, v_c) === 3)))) continue V1002;
                  }
                  for (let _j1001 = 0; _j1001 < _i1000; _j1001++) {
                    const _y1006 = _a994[_j1001];
                    if (!(((((_f995[_e998] === 1) && (_f995[_y1006] === 1)) && !((b.grid[_e998] !== 0))) && !((b.grid[_y1006] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e998] === v_c ? sp.edgeEnds[2 * _e998 + 1] : sp.edgeEnds[2 * _e998]), v_L).includes((sp.edgeEnds[2 * _y1006] === v_c ? sp.edgeEnds[2 * _y1006 + 1] : sp.edgeEnds[2 * _y1006]))))) continue V1002;
                  }
                  break;
                }
                if (_r1003 === 0) {
                  _s997[_i1000] = 0;
                  _i1000--;
                  continue;
                }
                _s997[_i1000] = _d999;
                if (_i1000 === _a994.length - 1) break;
                _i1000++;
                _s997[_i1000] = 0;
              }
              if (_i1000 < 0) break;
              let _g1007 = 0;
              G1008: {
                const _a1009 = sp.cellEdges[v_c];
                for (let _i1010 = 0; _i1010 < _a1009.length; _i1010++) {
                  const v_x = _a1009[_i1010];
                  if (!((_f995[v_x] === 1))) continue;
                  _g1007++;
                }
              }
              let _c1015: boolean = (_g1007 === arms(sp, cl, v_c));
              if (_c1015) {
                let _q1011 = true;
                Q1012: {
                  const _a1013 = sp.cellEdges[v_c];
                  for (let _i1014 = 0; _i1014 < _a1013.length; _i1014++) {
                    const v_x = _a1013[_i1014];
                    if (!(((_f995[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg921.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1011 = false;
                      break Q1012;
                    }
                  }
                }
                _c1015 = _q1011;
              }
              if (!(_c1015)) continue;
              if (true) {
                _q992 = true;
                break Q993;
              }
            }
          }
          let _q1016 = false;
          Q1017: {
            const _f1019 = new Int32Array(sp.edges.length).fill(-1);
            let _l1020: readonly number[] = [];
            const _s1021: number[] = [];
            const _a1018 = sp.cellEdges[v_c];
            for (const _e1022 of _l1020) _f1019[_e1022] = -1;
            _l1020 = _a1018;
            let _i1024 = 0;
            _s1021[0] = 0;
            let _o1028 = _a1018.length === 0;
            for (;;) {
              if (_a1018.length === 0) {
                if (!_o1028) break;
                _o1028 = false;
              }
              while (_a1018.length > 0 && _i1024 >= 0) {
                const _e1022 = _a1018[_i1024];
                if (_s1021[_i1024] > 0) _f1019[_e1022] = -1;
                let _r1027 = (cands[_e1022] >= 0 ? cands[_e1022] : (cands[_e1022] = b.cands[_e1022])) & ~((2 << _s1021[_i1024]) - 1);
                let _d1023 = 0;
                V1026: for (; _r1027 !== 0; _r1027 &= _r1027 - 1) {
                  _d1023 = 31 - Math.clz32(_r1027 & -_r1027);
                  _f1019[_e1022] = _d1023;
                  if (_e1022 === v_e && _d1023 !== 2) continue;
                  for (let _j1025 = 0; _j1025 < _i1024; _j1025++) {
                    const _y1029 = _a1018[_j1025];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f1019[_e1022] === 1)) && (_f1019[_y1029] === 1)))) continue;
                    if (!((bent(sp, _e1022, _y1029) === (clueAt(cl.piece, v_c) === 3)))) continue V1026;
                  }
                  for (let _j1025 = 0; _j1025 < _i1024; _j1025++) {
                    const _y1030 = _a1018[_j1025];
                    if (!(((((_f1019[_e1022] === 1) && (_f1019[_y1030] === 1)) && !((b.grid[_e1022] !== 0))) && !((b.grid[_y1030] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e1022] === v_c ? sp.edgeEnds[2 * _e1022 + 1] : sp.edgeEnds[2 * _e1022]), v_L).includes((sp.edgeEnds[2 * _y1030] === v_c ? sp.edgeEnds[2 * _y1030 + 1] : sp.edgeEnds[2 * _y1030]))))) continue V1026;
                  }
                  break;
                }
                if (_r1027 === 0) {
                  _s1021[_i1024] = 0;
                  _i1024--;
                  continue;
                }
                _s1021[_i1024] = _d1023;
                if (_i1024 === _a1018.length - 1) break;
                _i1024++;
                _s1021[_i1024] = 0;
              }
              if (_i1024 < 0) break;
              let _g1031 = 0;
              G1032: {
                const _a1033 = sp.cellEdges[v_c];
                for (let _i1034 = 0; _i1034 < _a1033.length; _i1034++) {
                  const v_x = _a1033[_i1034];
                  if (!((_f1019[v_x] === 1))) continue;
                  _g1031++;
                }
              }
              let _c1039: boolean = (_g1031 === arms(sp, cl, v_c));
              if (_c1039) {
                let _q1035 = true;
                Q1036: {
                  const _a1037 = sp.cellEdges[v_c];
                  for (let _i1038 = 0; _i1038 < _a1037.length; _i1038++) {
                    const v_x = _a1037[_i1038];
                    if (!(((_f1019[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg921.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q1035 = false;
                      break Q1036;
                    }
                  }
                }
                _c1039 = _q1035;
              }
              if (!(_c1039)) continue;
              if (true) {
                _q1016 = true;
                break Q1017;
              }
            }
          }
          freshBinding("loopNote", [sameSet(v_L, _g986), (sp.cells.includes(v_c)), sameSet(v_G, through(sp, v_c, v_L)), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q992), (v_B === _q1016), (!(v_A) || !(v_B))], ["L =", "c in", "G =", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c1041: boolean = (v_A || v_B);
        if (_c1041) {
          let _c1040: boolean = !(!(v_A));
          if (!_c1040) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c1040 = true;
          }
          _c1041 = _c1040;
        }
        let _c1043: boolean = _c1041;
        if (_c1043) {
          let _c1042: boolean = !(!(v_B));
          if (!_c1042) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c1042 = true;
          }
          _c1043 = _c1042;
        }
        if (!(_c1043)) return -1;
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
let _f2157 = new Int32Array(0);
let _l2158: readonly number[] = [];
let _f2177 = new Int32Array(0);
let _l2178: readonly number[] = [];
const _st2333 = stamps();
let _f2339 = new Int32Array(0);
let _l2340: readonly number[] = [];
const _st2370 = stamps();
let _p2582 = new Int32Array(0);
let _l2583: readonly number[] = [];
let _f2588 = new Int32Array(0);
let _l2589: readonly number[] = [];
const _st2696 = stamps();
const _st2739 = stamps();
let _f2745 = new Int32Array(0);
let _l2746: readonly number[] = [];
const _st2775 = stamps();
let _p2990 = new Int32Array(0);
let _l2991: readonly number[] = [];
let _f2996 = new Int32Array(0);
let _l2997: readonly number[] = [];
const _st3104 = stamps();
const _st3147 = stamps();
let _f3153 = new Int32Array(0);
let _l3154: readonly number[] = [];
const _st3183 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealLockBinding> | null): number {
  const _g2102: number[] = [];
  const _g2108: number[] = [];
  if (_f2157.length < sp.edges.length) _f2157 = new Int32Array(sp.edges.length).fill(-1);
  else _f2157.fill(-1);
  _l2158 = [];
  const _s2159: number[] = [];
  if (_f2177.length < sp.edges.length) _f2177 = new Int32Array(sp.edges.length).fill(-1);
  else _f2177.fill(-1);
  _l2178 = [];
  const _s2179: number[] = [];
  const _g2193: number[] = [];
  const _g2201: number[] = [];
  const _g2210: number[] = [];
  const _g2294: number[] = [];
  if (_f2339.length < sp.edges.length) _f2339 = new Int32Array(sp.edges.length).fill(-1);
  else _f2339.fill(-1);
  _l2340 = [];
  const _s2341: number[] = [];
  const _g2363: number[] = [];
  const _g2382: number[] = [];
  if (_p2582.length < sp.edges.length) _p2582 = new Int32Array(sp.edges.length);
  else _p2582.fill(0);
  _l2583 = [];
  let _y2584 = false;
  if (_f2588.length < sp.edges.length) _f2588 = new Int32Array(sp.edges.length).fill(-1);
  else _f2588.fill(-1);
  _l2589 = [];
  const _s2590: number[] = [];
  const _g2613: number[] = [];
  const _g2700: number[] = [];
  if (_f2745.length < sp.edges.length) _f2745 = new Int32Array(sp.edges.length).fill(-1);
  else _f2745.fill(-1);
  _l2746 = [];
  const _s2747: number[] = [];
  const _g2768: number[] = [];
  const _g2790: number[] = [];
  if (_p2990.length < sp.edges.length) _p2990 = new Int32Array(sp.edges.length);
  else _p2990.fill(0);
  _l2991 = [];
  let _y2992 = false;
  if (_f2996.length < sp.edges.length) _f2996 = new Int32Array(sp.edges.length).fill(-1);
  else _f2996.fill(-1);
  _l2997 = [];
  const _s2998: number[] = [];
  const _g3021: number[] = [];
  const _g3108: number[] = [];
  if (_f3153.length < sp.edges.length) _f3153 = new Int32Array(sp.edges.length).fill(-1);
  else _f3153.fill(-1);
  _l3154 = [];
  const _s3155: number[] = [];
  const _g3176: number[] = [];
  const _g3203: number[] = [];
  const facts = sealLockFacts;
  let fired = 0;
  let changed = false;
  const _k2168 = armsKept.board(cl);
  const _h2381 = sp.cells.length;
  let _epoch = 0;
  if (sealLockCands.length < sp.edges.length) sealLockCands = new Int32Array(sp.edges.length);
  const cands = sealLockCands;
  cands.fill(-1);
  const _m154_0 = b.made[0];
  _g2102.length = 0;
  G2103: {
    const _a2106 = sp.edges;
    for (let _i2107 = 0; _i2107 < _a2106.length; _i2107++) {
      const v_e = _a2106[_i2107];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g2102.push(v_e);
    }
  }
  const v_L = _g2102;
  const _m157_1 = b.made[1];
  const _eg2209 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g2108.length = 0;
  G2109: {
    const _a2151 = sp.edges;
    for (let _i2152 = 0; _i2152 < _a2151.length; _i2152++) {
      const v_e = _a2151[_i2152];
      const _t2153 = sp.edgeEnds[2 * v_e];
      let _q2154 = false;
      Q2155: {
        const _a2156 = sp.cellEdges[_t2153];
        for (const _e2160 of _l2158) _f2157[_e2160] = -1;
        _l2158 = _a2156;
        let _i2162 = 0;
        _s2159[0] = 0;
        let _o2166 = _a2156.length === 0;
        for (;;) {
          if (_a2156.length === 0) {
            if (!_o2166) break;
            _o2166 = false;
          }
          while (_a2156.length > 0 && _i2162 >= 0) {
            const _e2160 = _a2156[_i2162];
            if (_s2159[_i2162] > 0) _f2157[_e2160] = -1;
            let _r2165 = (cands[_e2160] >= 0 ? cands[_e2160] : (cands[_e2160] = b.cands[_e2160])) & ~((2 << _s2159[_i2162]) - 1);
            let _d2161 = 0;
            V2164: for (; _r2165 !== 0; _r2165 &= _r2165 - 1) {
              _d2161 = 31 - Math.clz32(_r2165 & -_r2165);
              _f2157[_e2160] = _d2161;
              if (_e2160 === v_e && _d2161 !== 1) continue;
              for (let _j2163 = 0; _j2163 < _i2162; _j2163++) {
                const _y2167 = _a2156[_j2163];
                if (!(((((_k2168[_t2153] ?? arms(sp, cl, _t2153)) === 2) && (_f2157[_e2160] === 1)) && (_f2157[_y2167] === 1)))) continue;
                if (!((bent(sp, _e2160, _y2167) === (clueAt(cl.piece, _t2153) === 3)))) continue V2164;
              }
              break;
            }
            if (_r2165 === 0) {
              _s2159[_i2162] = 0;
              _i2162--;
              continue;
            }
            _s2159[_i2162] = _d2161;
            if (_i2162 === _a2156.length - 1) break;
            _i2162++;
            _s2159[_i2162] = 0;
          }
          if (_i2162 < 0) break;
          let _g2169 = 0;
          G2170: {
            const _a2171 = sp.cellEdges[_t2153];
            for (let _i2172 = 0; _i2172 < _a2171.length; _i2172++) {
              const v_x = _a2171[_i2172];
              if (!((_f2157[v_x] === 1))) continue;
              _g2169++;
            }
          }
          if (!((_g2169 === (_k2168[_t2153] ?? arms(sp, cl, _t2153))))) continue;
          if (true) {
            _q2154 = true;
            break Q2155;
          }
        }
      }
      let _c2192: boolean = _q2154;
      if (_c2192) {
        const _t2173 = sp.edgeEnds[2 * v_e + 1];
        let _q2174 = false;
        Q2175: {
          const _a2176 = sp.cellEdges[_t2173];
          for (const _e2180 of _l2178) _f2177[_e2180] = -1;
          _l2178 = _a2176;
          let _i2182 = 0;
          _s2179[0] = 0;
          let _o2186 = _a2176.length === 0;
          for (;;) {
            if (_a2176.length === 0) {
              if (!_o2186) break;
              _o2186 = false;
            }
            while (_a2176.length > 0 && _i2182 >= 0) {
              const _e2180 = _a2176[_i2182];
              if (_s2179[_i2182] > 0) _f2177[_e2180] = -1;
              let _r2185 = (cands[_e2180] >= 0 ? cands[_e2180] : (cands[_e2180] = b.cands[_e2180])) & ~((2 << _s2179[_i2182]) - 1);
              let _d2181 = 0;
              V2184: for (; _r2185 !== 0; _r2185 &= _r2185 - 1) {
                _d2181 = 31 - Math.clz32(_r2185 & -_r2185);
                _f2177[_e2180] = _d2181;
                if (_e2180 === v_e && _d2181 !== 1) continue;
                for (let _j2183 = 0; _j2183 < _i2182; _j2183++) {
                  const _y2187 = _a2176[_j2183];
                  if (!(((((_k2168[_t2173] ?? arms(sp, cl, _t2173)) === 2) && (_f2177[_e2180] === 1)) && (_f2177[_y2187] === 1)))) continue;
                  if (!((bent(sp, _e2180, _y2187) === (clueAt(cl.piece, _t2173) === 3)))) continue V2184;
                }
                break;
              }
              if (_r2185 === 0) {
                _s2179[_i2182] = 0;
                _i2182--;
                continue;
              }
              _s2179[_i2182] = _d2181;
              if (_i2182 === _a2176.length - 1) break;
              _i2182++;
              _s2179[_i2182] = 0;
            }
            if (_i2182 < 0) break;
            let _g2188 = 0;
            G2189: {
              const _a2190 = sp.cellEdges[_t2173];
              for (let _i2191 = 0; _i2191 < _a2190.length; _i2191++) {
                const v_x = _a2190[_i2191];
                if (!((_f2177[v_x] === 1))) continue;
                _g2188++;
              }
            }
            if (!((_g2188 === (_k2168[_t2173] ?? arms(sp, cl, _t2173))))) continue;
            if (true) {
              _q2174 = true;
              break Q2175;
            }
          }
        }
        _c2192 = _q2174;
      }
      if (!(_c2192)) continue;
      _g2108.push(v_e);
    }
  }
  const v_U = _g2108;
  const _mm2376 = memberMarks(v_U);
  _g2193.length = 0;
  G2194: {
    const _a2197 = v_U;
    for (let _i2198 = 0; _i2198 < _a2197.length; _i2198++) {
      const v_e = _a2197[_i2198];
      if (!((((_k2168[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k2168[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g2193.push(v_e);
    }
  }
  const v_P = _g2193;
  const _a2199 = sp.cells;
  for (let _i2200 = 0; _i2200 < _a2199.length; _i2200++) {
    const v_c = _a2199[_i2200];
    const _h2355 = minus(v_P, sp.cellEdges[v_c]);
    _g2201.length = 0;
    G2202: {
      const _a2205 = sp.cellEdges[v_c];
      for (let _i2206 = 0; _i2206 < _a2205.length; _i2206++) {
        const v_e = _a2205[_i2206];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g2201.push(v_e);
      }
    }
    L2207: {
      const v_F = _g2201;
      const _h2208 = v_F.length;
      if (!((_h2208 > 0))) break L2207;
      const v_G = _eg2209.of(v_c);
      _g2210.length = 0;
      G2211: {
        const _a2291 = sp.cellEdges[v_c];
        for (let _i2292 = 0; _i2292 < _a2291.length; _i2292++) {
          const v_x = _a2291[_i2292];
          const _t2293 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h2356 = minus(_h2355, sp.cellEdges[_t2293]);
          const _eg2358 = edgeGroups(sp, _h2356);
          const _memo2361 = new Map<readonly number[], readonly number[]>();
          _g2294.length = 0;
          _st2333.pass++;
          G2295: {
            const _a2334 = sp.cellEdges[_t2293];
            for (let _i2335 = 0; _i2335 < _a2334.length; _i2335++) {
              const v_y = _a2334[_i2335];
              let _c2354: boolean = (v_y !== v_x);
              if (_c2354) {
                let _q2336 = false;
                Q2337: {
                  const _a2338 = sp.cellEdges[_t2293];
                  for (const _e2342 of _l2340) _f2339[_e2342] = -1;
                  _l2340 = _a2338;
                  let _i2344 = 0;
                  _s2341[0] = 0;
                  let _o2348 = _a2338.length === 0;
                  for (;;) {
                    if (_a2338.length === 0) {
                      if (!_o2348) break;
                      _o2348 = false;
                    }
                    while (_a2338.length > 0 && _i2344 >= 0) {
                      const _e2342 = _a2338[_i2344];
                      if (_s2341[_i2344] > 0) _f2339[_e2342] = -1;
                      let _r2347 = (cands[_e2342] >= 0 ? cands[_e2342] : (cands[_e2342] = b.cands[_e2342])) & ~((2 << _s2341[_i2344]) - 1);
                      let _d2343 = 0;
                      V2346: for (; _r2347 !== 0; _r2347 &= _r2347 - 1) {
                        _d2343 = 31 - Math.clz32(_r2347 & -_r2347);
                        _f2339[_e2342] = _d2343;
                        if (_e2342 === v_x && _d2343 !== 1) continue;
                        if (_e2342 === v_y && _d2343 !== 1) continue;
                        for (let _j2345 = 0; _j2345 < _i2344; _j2345++) {
                          const _y2349 = _a2338[_j2345];
                          if (!(((((_k2168[_t2293] ?? arms(sp, cl, _t2293)) === 2) && (_f2339[_e2342] === 1)) && (_f2339[_y2349] === 1)))) continue;
                          if (!((bent(sp, _e2342, _y2349) === (clueAt(cl.piece, _t2293) === 3)))) continue V2346;
                        }
                        break;
                      }
                      if (_r2347 === 0) {
                        _s2341[_i2344] = 0;
                        _i2344--;
                        continue;
                      }
                      _s2341[_i2344] = _d2343;
                      if (_i2344 === _a2338.length - 1) break;
                      _i2344++;
                      _s2341[_i2344] = 0;
                    }
                    if (_i2344 < 0) break;
                    let _g2350 = 0;
                    G2351: {
                      const _a2352 = sp.cellEdges[_t2293];
                      for (let _i2353 = 0; _i2353 < _a2352.length; _i2353++) {
                        const v_z = _a2352[_i2353];
                        if (!((_f2339[v_z] === 1))) continue;
                        _g2350++;
                      }
                    }
                    if (!((_g2350 === (_k2168[_t2293] ?? arms(sp, cl, _t2293))))) continue;
                    if (true) {
                      _q2336 = true;
                      break Q2337;
                    }
                  }
                }
                _c2354 = _q2336;
              }
              if (!(_c2354)) continue;
              const _t2357 = (sp.edgeEnds[2 * v_y] === _t2293 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t2360 = _eg2358.of(_t2357);
              let _gs2362 = _memo2361.get(_t2360);
              if (_gs2362 === undefined) {
                _g2363.length = 0;
                _st2370.pass++;
                G2364: {
                  const _a2371 = _t2360;
                  for (let _i2372 = 0; _i2372 < _a2371.length; _i2372++) {
                    const v_t = _a2371[_i2372];
                    if (!(((_k2168[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a2373 = sp.cellEdges[v_t];
                    for (let _i2374 = 0; _i2374 < _a2373.length; _i2374++) {
                      const v_y = _a2373[_i2374];
                      L2375: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k2168[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2376[v_y + 1] === 1)))) break L2375;
                        const _t2377 = v_z;
                        if (_g2363.length < 16) { if (!_g2363.includes(_t2377)) _g2363.push(_t2377); } else addOnce(_g2363, _st2370, _t2377);
                      }
                    }
                  }
                }
                _gs2362 = _g2363.slice();
                _memo2361.set(_t2360, _gs2362);
              }
              const _a2378 = union(_eg2358.of(_t2357), _gs2362);
              for (let _i2379 = 0; _i2379 < _a2378.length; _i2379++) {
                const v_t = _a2378[_i2379];
                const _t2380 = v_t;
                if (_g2294.length < 16) { if (!_g2294.includes(_t2380)) _g2294.push(_t2380); } else addOnce(_g2294, _st2333, _t2380);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t2293), _g2294)).length >= _h2381))) continue;
          _g2210.push(v_x);
        }
      }
      const v_K = _g2210;
      let _g2585 = -1;
      let _g2993 = -1;
      _g2382.length = 0;
      G2383: {
        const _a2580 = v_F;
        for (let _i2581 = 0; _i2581 < _a2580.length; _i2581++) {
          const v_e = _a2580[_i2581];
          if (_g2585 !== _epoch) {
            _g2585 = _epoch;
            for (const _e2586 of _l2583) _p2582[_e2586] = 0;
            _y2584 = false;
            const _a2587 = sp.cellEdges[v_c];
            for (const _e2591 of _l2589) _f2588[_e2591] = -1;
            _l2589 = _a2587;
            let _i2593 = 0;
            _s2590[0] = 0;
            let _o2597 = _a2587.length === 0;
            for (;;) {
              if (_a2587.length === 0) {
                if (!_o2597) break;
                _o2597 = false;
              }
              while (_a2587.length > 0 && _i2593 >= 0) {
                const _e2591 = _a2587[_i2593];
                if (_s2590[_i2593] > 0) _f2588[_e2591] = -1;
                let _r2596 = (cands[_e2591] >= 0 ? cands[_e2591] : (cands[_e2591] = b.cands[_e2591])) & ~((2 << _s2590[_i2593]) - 1);
                let _d2592 = 0;
                V2595: for (; _r2596 !== 0; _r2596 &= _r2596 - 1) {
                  _d2592 = 31 - Math.clz32(_r2596 & -_r2596);
                  _f2588[_e2591] = _d2592;
                  for (let _j2594 = 0; _j2594 < _i2593; _j2594++) {
                    const _y2598 = _a2587[_j2594];
                    if (!(((((_k2168[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f2588[_e2591] === 1)) && (_f2588[_y2598] === 1)))) continue;
                    if (!((bent(sp, _e2591, _y2598) === (clueAt(cl.piece, v_c) === 3)))) continue V2595;
                  }
                  for (let _j2594 = 0; _j2594 < _i2593; _j2594++) {
                    const _y2599 = _a2587[_j2594];
                    if (!(((((_f2588[_e2591] === 1) && (_f2588[_y2599] === 1)) && !((b.grid[_e2591] !== 0))) && !((b.grid[_y2599] !== 0))))) continue;
                    if (!(!(_eg2209.of((sp.edgeEnds[2 * _y2599] === v_c ? sp.edgeEnds[2 * _y2599 + 1] : sp.edgeEnds[2 * _y2599])) === _eg2209.of((sp.edgeEnds[2 * _e2591] === v_c ? sp.edgeEnds[2 * _e2591 + 1] : sp.edgeEnds[2 * _e2591]))))) continue V2595;
                  }
                  break;
                }
                if (_r2596 === 0) {
                  _s2590[_i2593] = 0;
                  _i2593--;
                  continue;
                }
                _s2590[_i2593] = _d2592;
                if (_i2593 === _a2587.length - 1) break;
                _i2593++;
                _s2590[_i2593] = 0;
              }
              if (_i2593 < 0) break;
              let _g2600 = 0;
              G2601: {
                const _a2602 = sp.cellEdges[v_c];
                for (let _i2603 = 0; _i2603 < _a2602.length; _i2603++) {
                  const v_x = _a2602[_i2603];
                  if (!((_f2588[v_x] === 1))) continue;
                  _g2600++;
                }
              }
              let _c2608: boolean = (_g2600 === (_k2168[v_c] ?? arms(sp, cl, v_c)));
              if (_c2608) {
                let _q2604 = true;
                Q2605: {
                  const _a2606 = sp.cellEdges[v_c];
                  for (let _i2607 = 0; _i2607 < _a2606.length; _i2607++) {
                    const v_x = _a2606[_i2607];
                    if (!(((_f2588[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg2209.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2604 = false;
                      break Q2605;
                    }
                  }
                }
                _c2608 = _q2604;
              }
              let _c2789: boolean = _c2608;
              if (_c2789) {
                let _q2609 = false;
                Q2610: {
                  const _a2611 = sp.cellEdges[v_c];
                  for (let _i2612 = 0; _i2612 < _a2611.length; _i2612++) {
                    const v_x = _a2611[_i2612];
                    if (!((_f2588[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2609 = true;
                      break Q2610;
                    }
                  }
                }
                let _c2788: boolean = _q2609;
                if (!_c2788) {
                  _g2613.length = 0;
                  _st2696.pass++;
                  G2614: {
                    const _a2697 = sp.cellEdges[v_c];
                    for (let _i2698 = 0; _i2698 < _a2697.length; _i2698++) {
                      const v_x = _a2697[_i2698];
                      if (!((_f2588[v_x] === 1))) continue;
                      const _t2699 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h2761 = minus(_h2355, sp.cellEdges[_t2699]);
                      const _eg2763 = edgeGroups(sp, _h2761);
                      const _memo2766 = new Map<readonly number[], readonly number[]>();
                      _g2700.length = 0;
                      _st2739.pass++;
                      G2701: {
                        const _a2740 = sp.cellEdges[_t2699];
                        for (let _i2741 = 0; _i2741 < _a2740.length; _i2741++) {
                          const v_y = _a2740[_i2741];
                          let _c2760: boolean = (v_y !== v_x);
                          if (_c2760) {
                            let _q2742 = false;
                            Q2743: {
                              const _a2744 = sp.cellEdges[_t2699];
                              for (const _e2748 of _l2746) _f2745[_e2748] = -1;
                              _l2746 = _a2744;
                              let _i2750 = 0;
                              _s2747[0] = 0;
                              let _o2754 = _a2744.length === 0;
                              for (;;) {
                                if (_a2744.length === 0) {
                                  if (!_o2754) break;
                                  _o2754 = false;
                                }
                                while (_a2744.length > 0 && _i2750 >= 0) {
                                  const _e2748 = _a2744[_i2750];
                                  if (_s2747[_i2750] > 0) _f2745[_e2748] = -1;
                                  let _r2753 = (cands[_e2748] >= 0 ? cands[_e2748] : (cands[_e2748] = b.cands[_e2748])) & ~((2 << _s2747[_i2750]) - 1);
                                  let _d2749 = 0;
                                  V2752: for (; _r2753 !== 0; _r2753 &= _r2753 - 1) {
                                    _d2749 = 31 - Math.clz32(_r2753 & -_r2753);
                                    _f2745[_e2748] = _d2749;
                                    if (_e2748 === v_x && _d2749 !== 1) continue;
                                    if (_e2748 === v_y && _d2749 !== 1) continue;
                                    for (let _j2751 = 0; _j2751 < _i2750; _j2751++) {
                                      const _y2755 = _a2744[_j2751];
                                      if (!(((((_k2168[_t2699] ?? arms(sp, cl, _t2699)) === 2) && (_f2745[_e2748] === 1)) && (_f2745[_y2755] === 1)))) continue;
                                      if (!((bent(sp, _e2748, _y2755) === (clueAt(cl.piece, _t2699) === 3)))) continue V2752;
                                    }
                                    break;
                                  }
                                  if (_r2753 === 0) {
                                    _s2747[_i2750] = 0;
                                    _i2750--;
                                    continue;
                                  }
                                  _s2747[_i2750] = _d2749;
                                  if (_i2750 === _a2744.length - 1) break;
                                  _i2750++;
                                  _s2747[_i2750] = 0;
                                }
                                if (_i2750 < 0) break;
                                let _g2756 = 0;
                                G2757: {
                                  const _a2758 = sp.cellEdges[_t2699];
                                  for (let _i2759 = 0; _i2759 < _a2758.length; _i2759++) {
                                    const v_z = _a2758[_i2759];
                                    if (!((_f2745[v_z] === 1))) continue;
                                    _g2756++;
                                  }
                                }
                                if (!((_g2756 === (_k2168[_t2699] ?? arms(sp, cl, _t2699))))) continue;
                                if (true) {
                                  _q2742 = true;
                                  break Q2743;
                                }
                              }
                            }
                            _c2760 = _q2742;
                          }
                          if (!(_c2760)) continue;
                          const _t2762 = (sp.edgeEnds[2 * v_y] === _t2699 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2765 = _eg2763.of(_t2762);
                          let _gs2767 = _memo2766.get(_t2765);
                          if (_gs2767 === undefined) {
                            _g2768.length = 0;
                            _st2775.pass++;
                            G2769: {
                              const _a2776 = _t2765;
                              for (let _i2777 = 0; _i2777 < _a2776.length; _i2777++) {
                                const v_t = _a2776[_i2777];
                                if (!(((_k2168[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a2778 = sp.cellEdges[v_t];
                                for (let _i2779 = 0; _i2779 < _a2778.length; _i2779++) {
                                  const v_y = _a2778[_i2779];
                                  L2780: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k2168[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2376[v_y + 1] === 1)))) break L2780;
                                    const _t2781 = v_z;
                                    if (_g2768.length < 16) { if (!_g2768.includes(_t2781)) _g2768.push(_t2781); } else addOnce(_g2768, _st2775, _t2781);
                                  }
                                }
                              }
                            }
                            _gs2767 = _g2768.slice();
                            _memo2766.set(_t2765, _gs2767);
                          }
                          const _a2782 = union(_eg2763.of(_t2762), _gs2767);
                          for (let _i2783 = 0; _i2783 < _a2782.length; _i2783++) {
                            const v_t = _a2782[_i2783];
                            const _t2784 = v_t;
                            if (_g2700.length < 16) { if (!_g2700.includes(_t2784)) _g2700.push(_t2784); } else addOnce(_g2700, _st2739, _t2784);
                          }
                        }
                      }
                      const _a2785 = union(setOf(_t2699), _g2700);
                      for (let _i2786 = 0; _i2786 < _a2785.length; _i2786++) {
                        const v_t = _a2785[_i2786];
                        const _t2787 = v_t;
                        if (_g2613.length < 16) { if (!_g2613.includes(_t2787)) _g2613.push(_t2787); } else addOnce(_g2613, _st2696, _t2787);
                      }
                    }
                  }
                  _c2788 = (union(setOf(v_c), _g2613).length >= _h2381);
                }
                _c2789 = _c2788;
              }
              if (!(_c2789)) continue;
              if (!(true)) continue;
              _l2583 = _a2587;
              _y2584 = true;
              for (const _e2586 of _a2587) _p2582[_e2586] |= 1 << _f2588[_e2586];
            }
          }
          if (!(((((_p2582[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y2584 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2382.push(v_e);
        }
      }
      const v_W = _g2382;
      _g2790.length = 0;
      G2791: {
        const _a2988 = v_F;
        for (let _i2989 = 0; _i2989 < _a2988.length; _i2989++) {
          const v_e = _a2988[_i2989];
          if (_g2993 !== _epoch) {
            _g2993 = _epoch;
            for (const _e2994 of _l2991) _p2990[_e2994] = 0;
            _y2992 = false;
            const _a2995 = sp.cellEdges[v_c];
            for (const _e2999 of _l2997) _f2996[_e2999] = -1;
            _l2997 = _a2995;
            let _i3001 = 0;
            _s2998[0] = 0;
            let _o3005 = _a2995.length === 0;
            for (;;) {
              if (_a2995.length === 0) {
                if (!_o3005) break;
                _o3005 = false;
              }
              while (_a2995.length > 0 && _i3001 >= 0) {
                const _e2999 = _a2995[_i3001];
                if (_s2998[_i3001] > 0) _f2996[_e2999] = -1;
                let _r3004 = (cands[_e2999] >= 0 ? cands[_e2999] : (cands[_e2999] = b.cands[_e2999])) & ~((2 << _s2998[_i3001]) - 1);
                let _d3000 = 0;
                V3003: for (; _r3004 !== 0; _r3004 &= _r3004 - 1) {
                  _d3000 = 31 - Math.clz32(_r3004 & -_r3004);
                  _f2996[_e2999] = _d3000;
                  for (let _j3002 = 0; _j3002 < _i3001; _j3002++) {
                    const _y3006 = _a2995[_j3002];
                    if (!(((((_k2168[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f2996[_e2999] === 1)) && (_f2996[_y3006] === 1)))) continue;
                    if (!((bent(sp, _e2999, _y3006) === (clueAt(cl.piece, v_c) === 3)))) continue V3003;
                  }
                  for (let _j3002 = 0; _j3002 < _i3001; _j3002++) {
                    const _y3007 = _a2995[_j3002];
                    if (!(((((_f2996[_e2999] === 1) && (_f2996[_y3007] === 1)) && !((b.grid[_e2999] !== 0))) && !((b.grid[_y3007] !== 0))))) continue;
                    if (!(!(_eg2209.of((sp.edgeEnds[2 * _y3007] === v_c ? sp.edgeEnds[2 * _y3007 + 1] : sp.edgeEnds[2 * _y3007])) === _eg2209.of((sp.edgeEnds[2 * _e2999] === v_c ? sp.edgeEnds[2 * _e2999 + 1] : sp.edgeEnds[2 * _e2999]))))) continue V3003;
                  }
                  break;
                }
                if (_r3004 === 0) {
                  _s2998[_i3001] = 0;
                  _i3001--;
                  continue;
                }
                _s2998[_i3001] = _d3000;
                if (_i3001 === _a2995.length - 1) break;
                _i3001++;
                _s2998[_i3001] = 0;
              }
              if (_i3001 < 0) break;
              let _g3008 = 0;
              G3009: {
                const _a3010 = sp.cellEdges[v_c];
                for (let _i3011 = 0; _i3011 < _a3010.length; _i3011++) {
                  const v_x = _a3010[_i3011];
                  if (!((_f2996[v_x] === 1))) continue;
                  _g3008++;
                }
              }
              let _c3016: boolean = (_g3008 === (_k2168[v_c] ?? arms(sp, cl, v_c)));
              if (_c3016) {
                let _q3012 = true;
                Q3013: {
                  const _a3014 = sp.cellEdges[v_c];
                  for (let _i3015 = 0; _i3015 < _a3014.length; _i3015++) {
                    const v_x = _a3014[_i3015];
                    if (!(((_f2996[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg2209.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q3012 = false;
                      break Q3013;
                    }
                  }
                }
                _c3016 = _q3012;
              }
              let _c3197: boolean = _c3016;
              if (_c3197) {
                let _q3017 = false;
                Q3018: {
                  const _a3019 = sp.cellEdges[v_c];
                  for (let _i3020 = 0; _i3020 < _a3019.length; _i3020++) {
                    const v_x = _a3019[_i3020];
                    if (!((_f2996[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q3017 = true;
                      break Q3018;
                    }
                  }
                }
                let _c3196: boolean = _q3017;
                if (!_c3196) {
                  _g3021.length = 0;
                  _st3104.pass++;
                  G3022: {
                    const _a3105 = sp.cellEdges[v_c];
                    for (let _i3106 = 0; _i3106 < _a3105.length; _i3106++) {
                      const v_x = _a3105[_i3106];
                      if (!((_f2996[v_x] === 1))) continue;
                      const _t3107 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h3169 = minus(_h2355, sp.cellEdges[_t3107]);
                      const _eg3171 = edgeGroups(sp, _h3169);
                      const _memo3174 = new Map<readonly number[], readonly number[]>();
                      _g3108.length = 0;
                      _st3147.pass++;
                      G3109: {
                        const _a3148 = sp.cellEdges[_t3107];
                        for (let _i3149 = 0; _i3149 < _a3148.length; _i3149++) {
                          const v_y = _a3148[_i3149];
                          let _c3168: boolean = (v_y !== v_x);
                          if (_c3168) {
                            let _q3150 = false;
                            Q3151: {
                              const _a3152 = sp.cellEdges[_t3107];
                              for (const _e3156 of _l3154) _f3153[_e3156] = -1;
                              _l3154 = _a3152;
                              let _i3158 = 0;
                              _s3155[0] = 0;
                              let _o3162 = _a3152.length === 0;
                              for (;;) {
                                if (_a3152.length === 0) {
                                  if (!_o3162) break;
                                  _o3162 = false;
                                }
                                while (_a3152.length > 0 && _i3158 >= 0) {
                                  const _e3156 = _a3152[_i3158];
                                  if (_s3155[_i3158] > 0) _f3153[_e3156] = -1;
                                  let _r3161 = (cands[_e3156] >= 0 ? cands[_e3156] : (cands[_e3156] = b.cands[_e3156])) & ~((2 << _s3155[_i3158]) - 1);
                                  let _d3157 = 0;
                                  V3160: for (; _r3161 !== 0; _r3161 &= _r3161 - 1) {
                                    _d3157 = 31 - Math.clz32(_r3161 & -_r3161);
                                    _f3153[_e3156] = _d3157;
                                    if (_e3156 === v_x && _d3157 !== 1) continue;
                                    if (_e3156 === v_y && _d3157 !== 1) continue;
                                    for (let _j3159 = 0; _j3159 < _i3158; _j3159++) {
                                      const _y3163 = _a3152[_j3159];
                                      if (!(((((_k2168[_t3107] ?? arms(sp, cl, _t3107)) === 2) && (_f3153[_e3156] === 1)) && (_f3153[_y3163] === 1)))) continue;
                                      if (!((bent(sp, _e3156, _y3163) === (clueAt(cl.piece, _t3107) === 3)))) continue V3160;
                                    }
                                    break;
                                  }
                                  if (_r3161 === 0) {
                                    _s3155[_i3158] = 0;
                                    _i3158--;
                                    continue;
                                  }
                                  _s3155[_i3158] = _d3157;
                                  if (_i3158 === _a3152.length - 1) break;
                                  _i3158++;
                                  _s3155[_i3158] = 0;
                                }
                                if (_i3158 < 0) break;
                                let _g3164 = 0;
                                G3165: {
                                  const _a3166 = sp.cellEdges[_t3107];
                                  for (let _i3167 = 0; _i3167 < _a3166.length; _i3167++) {
                                    const v_z = _a3166[_i3167];
                                    if (!((_f3153[v_z] === 1))) continue;
                                    _g3164++;
                                  }
                                }
                                if (!((_g3164 === (_k2168[_t3107] ?? arms(sp, cl, _t3107))))) continue;
                                if (true) {
                                  _q3150 = true;
                                  break Q3151;
                                }
                              }
                            }
                            _c3168 = _q3150;
                          }
                          if (!(_c3168)) continue;
                          const _t3170 = (sp.edgeEnds[2 * v_y] === _t3107 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t3173 = _eg3171.of(_t3170);
                          let _gs3175 = _memo3174.get(_t3173);
                          if (_gs3175 === undefined) {
                            _g3176.length = 0;
                            _st3183.pass++;
                            G3177: {
                              const _a3184 = _t3173;
                              for (let _i3185 = 0; _i3185 < _a3184.length; _i3185++) {
                                const v_t = _a3184[_i3185];
                                if (!(((_k2168[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a3186 = sp.cellEdges[v_t];
                                for (let _i3187 = 0; _i3187 < _a3186.length; _i3187++) {
                                  const v_y = _a3186[_i3187];
                                  L3188: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k2168[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm2376[v_y + 1] === 1)))) break L3188;
                                    const _t3189 = v_z;
                                    if (_g3176.length < 16) { if (!_g3176.includes(_t3189)) _g3176.push(_t3189); } else addOnce(_g3176, _st3183, _t3189);
                                  }
                                }
                              }
                            }
                            _gs3175 = _g3176.slice();
                            _memo3174.set(_t3173, _gs3175);
                          }
                          const _a3190 = union(_eg3171.of(_t3170), _gs3175);
                          for (let _i3191 = 0; _i3191 < _a3190.length; _i3191++) {
                            const v_t = _a3190[_i3191];
                            const _t3192 = v_t;
                            if (_g3108.length < 16) { if (!_g3108.includes(_t3192)) _g3108.push(_t3192); } else addOnce(_g3108, _st3147, _t3192);
                          }
                        }
                      }
                      const _a3193 = union(setOf(_t3107), _g3108);
                      for (let _i3194 = 0; _i3194 < _a3193.length; _i3194++) {
                        const v_t = _a3193[_i3194];
                        const _t3195 = v_t;
                        if (_g3021.length < 16) { if (!_g3021.includes(_t3195)) _g3021.push(_t3195); } else addOnce(_g3021, _st3104, _t3195);
                      }
                    }
                  }
                  _c3196 = (union(setOf(v_c), _g3021).length >= _h2381);
                }
                _c3197 = _c3196;
              }
              if (!(_c3197)) continue;
              if (!(true)) continue;
              _l2991 = _a2995;
              _y2992 = true;
              for (const _e2994 of _a2995) _p2990[_e2994] |= 1 << _f2996[_e2994];
            }
          }
          if (!(((((_p2990[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y2992 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2790.push(v_e);
        }
      }
      L3198: {
        const v_N = _g2790;
        let _q3199 = true;
        Q3200: {
          const _a3201 = v_F;
          for (let _i3202 = 0; _i3202 < _a3201.length; _i3202++) {
            const v_e = _a3201[_i3202];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q3199 = false;
              break Q3200;
            }
          }
        }
        if (!(_q3199)) break L3198;
        if (b.made[0] !== _m154_0 || b.made[1] !== _m157_1) {
          _g3203.length = 0;
          G3204: {
            const _a3207 = sp.edges;
            for (let _i3208 = 0; _i3208 < _a3207.length; _i3208++) {
              const v_e = _a3207[_i3208];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g3203.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g3203))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g3209: number[] = [];
          G3210: {
            const _a3213 = sp.edges;
            for (let _i3214 = 0; _i3214 < _a3213.length; _i3214++) {
              const v_e = _a3213[_i3214];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g3209.push(v_e);
            }
          }
          const _g3215: number[] = [];
          G3216: {
            const _a3258 = sp.edges;
            for (let _i3259 = 0; _i3259 < _a3258.length; _i3259++) {
              const v_e = _a3258[_i3259];
              const _t3260 = sp.edgeEnds[2 * v_e];
              let _q3261 = false;
              Q3262: {
                const _f3264 = new Int32Array(sp.edges.length).fill(-1);
                let _l3265: readonly number[] = [];
                const _s3266: number[] = [];
                const _a3263 = sp.cellEdges[_t3260];
                for (const _e3267 of _l3265) _f3264[_e3267] = -1;
                _l3265 = _a3263;
                let _i3269 = 0;
                _s3266[0] = 0;
                let _o3273 = _a3263.length === 0;
                for (;;) {
                  if (_a3263.length === 0) {
                    if (!_o3273) break;
                    _o3273 = false;
                  }
                  while (_a3263.length > 0 && _i3269 >= 0) {
                    const _e3267 = _a3263[_i3269];
                    if (_s3266[_i3269] > 0) _f3264[_e3267] = -1;
                    let _r3272 = (cands[_e3267] >= 0 ? cands[_e3267] : (cands[_e3267] = b.cands[_e3267])) & ~((2 << _s3266[_i3269]) - 1);
                    let _d3268 = 0;
                    V3271: for (; _r3272 !== 0; _r3272 &= _r3272 - 1) {
                      _d3268 = 31 - Math.clz32(_r3272 & -_r3272);
                      _f3264[_e3267] = _d3268;
                      if (_e3267 === v_e && _d3268 !== 1) continue;
                      for (let _j3270 = 0; _j3270 < _i3269; _j3270++) {
                        const _y3274 = _a3263[_j3270];
                        if (!((((arms(sp, cl, _t3260) === 2) && (_f3264[_e3267] === 1)) && (_f3264[_y3274] === 1)))) continue;
                        if (!((bent(sp, _e3267, _y3274) === (clueAt(cl.piece, _t3260) === 3)))) continue V3271;
                      }
                      break;
                    }
                    if (_r3272 === 0) {
                      _s3266[_i3269] = 0;
                      _i3269--;
                      continue;
                    }
                    _s3266[_i3269] = _d3268;
                    if (_i3269 === _a3263.length - 1) break;
                    _i3269++;
                    _s3266[_i3269] = 0;
                  }
                  if (_i3269 < 0) break;
                  let _g3275 = 0;
                  G3276: {
                    const _a3277 = sp.cellEdges[_t3260];
                    for (let _i3278 = 0; _i3278 < _a3277.length; _i3278++) {
                      const v_x = _a3277[_i3278];
                      if (!((_f3264[v_x] === 1))) continue;
                      _g3275++;
                    }
                  }
                  if (!((_g3275 === arms(sp, cl, _t3260)))) continue;
                  if (true) {
                    _q3261 = true;
                    break Q3262;
                  }
                }
              }
              let _c3298: boolean = _q3261;
              if (_c3298) {
                const _t3279 = sp.edgeEnds[2 * v_e + 1];
                let _q3280 = false;
                Q3281: {
                  const _f3283 = new Int32Array(sp.edges.length).fill(-1);
                  let _l3284: readonly number[] = [];
                  const _s3285: number[] = [];
                  const _a3282 = sp.cellEdges[_t3279];
                  for (const _e3286 of _l3284) _f3283[_e3286] = -1;
                  _l3284 = _a3282;
                  let _i3288 = 0;
                  _s3285[0] = 0;
                  let _o3292 = _a3282.length === 0;
                  for (;;) {
                    if (_a3282.length === 0) {
                      if (!_o3292) break;
                      _o3292 = false;
                    }
                    while (_a3282.length > 0 && _i3288 >= 0) {
                      const _e3286 = _a3282[_i3288];
                      if (_s3285[_i3288] > 0) _f3283[_e3286] = -1;
                      let _r3291 = (cands[_e3286] >= 0 ? cands[_e3286] : (cands[_e3286] = b.cands[_e3286])) & ~((2 << _s3285[_i3288]) - 1);
                      let _d3287 = 0;
                      V3290: for (; _r3291 !== 0; _r3291 &= _r3291 - 1) {
                        _d3287 = 31 - Math.clz32(_r3291 & -_r3291);
                        _f3283[_e3286] = _d3287;
                        if (_e3286 === v_e && _d3287 !== 1) continue;
                        for (let _j3289 = 0; _j3289 < _i3288; _j3289++) {
                          const _y3293 = _a3282[_j3289];
                          if (!((((arms(sp, cl, _t3279) === 2) && (_f3283[_e3286] === 1)) && (_f3283[_y3293] === 1)))) continue;
                          if (!((bent(sp, _e3286, _y3293) === (clueAt(cl.piece, _t3279) === 3)))) continue V3290;
                        }
                        break;
                      }
                      if (_r3291 === 0) {
                        _s3285[_i3288] = 0;
                        _i3288--;
                        continue;
                      }
                      _s3285[_i3288] = _d3287;
                      if (_i3288 === _a3282.length - 1) break;
                      _i3288++;
                      _s3285[_i3288] = 0;
                    }
                    if (_i3288 < 0) break;
                    let _g3294 = 0;
                    G3295: {
                      const _a3296 = sp.cellEdges[_t3279];
                      for (let _i3297 = 0; _i3297 < _a3296.length; _i3297++) {
                        const v_x = _a3296[_i3297];
                        if (!((_f3283[v_x] === 1))) continue;
                        _g3294++;
                      }
                    }
                    if (!((_g3294 === arms(sp, cl, _t3279)))) continue;
                    if (true) {
                      _q3280 = true;
                      break Q3281;
                    }
                  }
                }
                _c3298 = _q3280;
              }
              if (!(_c3298)) continue;
              _g3215.push(v_e);
            }
          }
          const _g3299: number[] = [];
          G3300: {
            const _a3303 = v_U;
            for (let _i3304 = 0; _i3304 < _a3303.length; _i3304++) {
              const v_e = _a3303[_i3304];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g3299.push(v_e);
            }
          }
          const _g3305: number[] = [];
          G3306: {
            const _a3309 = sp.cellEdges[v_c];
            for (let _i3310 = 0; _i3310 < _a3309.length; _i3310++) {
              const v_e = _a3309[_i3310];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g3305.push(v_e);
            }
          }
          const _g3311: number[] = [];
          G3312: {
            const _a3392 = sp.cellEdges[v_c];
            for (let _i3393 = 0; _i3393 < _a3392.length; _i3393++) {
              const v_x = _a3392[_i3393];
              const _t3394 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g3395: number[] = [];
              G3396: {
                const _a3434 = sp.cellEdges[_t3394];
                for (let _i3435 = 0; _i3435 < _a3434.length; _i3435++) {
                  const v_y = _a3434[_i3435];
                  let _c3454: boolean = (v_y !== v_x);
                  if (_c3454) {
                    let _q3436 = false;
                    Q3437: {
                      const _f3439 = new Int32Array(sp.edges.length).fill(-1);
                      let _l3440: readonly number[] = [];
                      const _s3441: number[] = [];
                      const _a3438 = sp.cellEdges[_t3394];
                      for (const _e3442 of _l3440) _f3439[_e3442] = -1;
                      _l3440 = _a3438;
                      let _i3444 = 0;
                      _s3441[0] = 0;
                      let _o3448 = _a3438.length === 0;
                      for (;;) {
                        if (_a3438.length === 0) {
                          if (!_o3448) break;
                          _o3448 = false;
                        }
                        while (_a3438.length > 0 && _i3444 >= 0) {
                          const _e3442 = _a3438[_i3444];
                          if (_s3441[_i3444] > 0) _f3439[_e3442] = -1;
                          let _r3447 = (cands[_e3442] >= 0 ? cands[_e3442] : (cands[_e3442] = b.cands[_e3442])) & ~((2 << _s3441[_i3444]) - 1);
                          let _d3443 = 0;
                          V3446: for (; _r3447 !== 0; _r3447 &= _r3447 - 1) {
                            _d3443 = 31 - Math.clz32(_r3447 & -_r3447);
                            _f3439[_e3442] = _d3443;
                            if (_e3442 === v_x && _d3443 !== 1) continue;
                            if (_e3442 === v_y && _d3443 !== 1) continue;
                            for (let _j3445 = 0; _j3445 < _i3444; _j3445++) {
                              const _y3449 = _a3438[_j3445];
                              if (!((((arms(sp, cl, _t3394) === 2) && (_f3439[_e3442] === 1)) && (_f3439[_y3449] === 1)))) continue;
                              if (!((bent(sp, _e3442, _y3449) === (clueAt(cl.piece, _t3394) === 3)))) continue V3446;
                            }
                            break;
                          }
                          if (_r3447 === 0) {
                            _s3441[_i3444] = 0;
                            _i3444--;
                            continue;
                          }
                          _s3441[_i3444] = _d3443;
                          if (_i3444 === _a3438.length - 1) break;
                          _i3444++;
                          _s3441[_i3444] = 0;
                        }
                        if (_i3444 < 0) break;
                        let _g3450 = 0;
                        G3451: {
                          const _a3452 = sp.cellEdges[_t3394];
                          for (let _i3453 = 0; _i3453 < _a3452.length; _i3453++) {
                            const v_z = _a3452[_i3453];
                            if (!((_f3439[v_z] === 1))) continue;
                            _g3450++;
                          }
                        }
                        if (!((_g3450 === arms(sp, cl, _t3394)))) continue;
                        if (true) {
                          _q3436 = true;
                          break Q3437;
                        }
                      }
                    }
                    _c3454 = _q3436;
                  }
                  if (!(_c3454)) continue;
                  const _t3455 = (sp.edgeEnds[2 * v_y] === _t3394 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t3456 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t3394]);
                  const _g3457: number[] = [];
                  G3458: {
                    const _a3464 = through(sp, _t3455, _t3456);
                    for (let _i3465 = 0; _i3465 < _a3464.length; _i3465++) {
                      const v_t = _a3464[_i3465];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a3466 = sp.cellEdges[v_t];
                      for (let _i3467 = 0; _i3467 < _a3466.length; _i3467++) {
                        const v_y = _a3466[_i3467];
                        L3468: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L3468;
                          if (!_g3457.includes(v_z)) _g3457.push(v_z);
                        }
                      }
                    }
                  }
                  const _a3469 = union(through(sp, _t3455, _t3456), _g3457);
                  for (let _i3470 = 0; _i3470 < _a3469.length; _i3470++) {
                    const v_t = _a3469[_i3470];
                    if (!_g3395.includes(v_t)) _g3395.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t3394), _g3395)).length >= sp.cells.length))) continue;
              _g3311.push(v_x);
            }
          }
          const _g3471: number[] = [];
          G3472: {
            const _a3669 = v_F;
            for (let _i3670 = 0; _i3670 < _a3669.length; _i3670++) {
              const v_e = _a3669[_i3670];
              let _q3671 = false;
              Q3672: {
                const _f3674 = new Int32Array(sp.edges.length).fill(-1);
                let _l3675: readonly number[] = [];
                const _s3676: number[] = [];
                const _a3673 = sp.cellEdges[v_c];
                for (const _e3677 of _l3675) _f3674[_e3677] = -1;
                _l3675 = _a3673;
                let _i3679 = 0;
                _s3676[0] = 0;
                let _o3683 = _a3673.length === 0;
                for (;;) {
                  if (_a3673.length === 0) {
                    if (!_o3683) break;
                    _o3683 = false;
                  }
                  while (_a3673.length > 0 && _i3679 >= 0) {
                    const _e3677 = _a3673[_i3679];
                    if (_s3676[_i3679] > 0) _f3674[_e3677] = -1;
                    let _r3682 = (cands[_e3677] >= 0 ? cands[_e3677] : (cands[_e3677] = b.cands[_e3677])) & ~((2 << _s3676[_i3679]) - 1);
                    let _d3678 = 0;
                    V3681: for (; _r3682 !== 0; _r3682 &= _r3682 - 1) {
                      _d3678 = 31 - Math.clz32(_r3682 & -_r3682);
                      _f3674[_e3677] = _d3678;
                      if (_e3677 === v_e && _d3678 !== 1) continue;
                      for (let _j3680 = 0; _j3680 < _i3679; _j3680++) {
                        const _y3684 = _a3673[_j3680];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f3674[_e3677] === 1)) && (_f3674[_y3684] === 1)))) continue;
                        if (!((bent(sp, _e3677, _y3684) === (clueAt(cl.piece, v_c) === 3)))) continue V3681;
                      }
                      for (let _j3680 = 0; _j3680 < _i3679; _j3680++) {
                        const _y3685 = _a3673[_j3680];
                        if (!(((((_f3674[_e3677] === 1) && (_f3674[_y3685] === 1)) && !((b.grid[_e3677] !== 0))) && !((b.grid[_y3685] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e3677] === v_c ? sp.edgeEnds[2 * _e3677 + 1] : sp.edgeEnds[2 * _e3677]), v_L).includes((sp.edgeEnds[2 * _y3685] === v_c ? sp.edgeEnds[2 * _y3685 + 1] : sp.edgeEnds[2 * _y3685]))))) continue V3681;
                      }
                      break;
                    }
                    if (_r3682 === 0) {
                      _s3676[_i3679] = 0;
                      _i3679--;
                      continue;
                    }
                    _s3676[_i3679] = _d3678;
                    if (_i3679 === _a3673.length - 1) break;
                    _i3679++;
                    _s3676[_i3679] = 0;
                  }
                  if (_i3679 < 0) break;
                  let _g3686 = 0;
                  G3687: {
                    const _a3688 = sp.cellEdges[v_c];
                    for (let _i3689 = 0; _i3689 < _a3688.length; _i3689++) {
                      const v_x = _a3688[_i3689];
                      if (!((_f3674[v_x] === 1))) continue;
                      _g3686++;
                    }
                  }
                  let _c3694: boolean = (_g3686 === arms(sp, cl, v_c));
                  if (_c3694) {
                    let _q3690 = true;
                    Q3691: {
                      const _a3692 = sp.cellEdges[v_c];
                      for (let _i3693 = 0; _i3693 < _a3692.length; _i3693++) {
                        const v_x = _a3692[_i3693];
                        if (!(((_f3674[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg2209.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q3690 = false;
                          break Q3691;
                        }
                      }
                    }
                    _c3694 = _q3690;
                  }
                  let _c3864: boolean = _c3694;
                  if (_c3864) {
                    let _q3695 = false;
                    Q3696: {
                      const _a3697 = sp.cellEdges[v_c];
                      for (let _i3698 = 0; _i3698 < _a3697.length; _i3698++) {
                        const v_x = _a3697[_i3698];
                        if (!((_f3674[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q3695 = true;
                          break Q3696;
                        }
                      }
                    }
                    let _c3863: boolean = _q3695;
                    if (!_c3863) {
                      const _g3699: number[] = [];
                      G3700: {
                        const _a3782 = sp.cellEdges[v_c];
                        for (let _i3783 = 0; _i3783 < _a3782.length; _i3783++) {
                          const v_x = _a3782[_i3783];
                          if (!((_f3674[v_x] === 1))) continue;
                          const _t3784 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g3785: number[] = [];
                          G3786: {
                            const _a3824 = sp.cellEdges[_t3784];
                            for (let _i3825 = 0; _i3825 < _a3824.length; _i3825++) {
                              const v_y = _a3824[_i3825];
                              let _c3844: boolean = (v_y !== v_x);
                              if (_c3844) {
                                let _q3826 = false;
                                Q3827: {
                                  const _f3829 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l3830: readonly number[] = [];
                                  const _s3831: number[] = [];
                                  const _a3828 = sp.cellEdges[_t3784];
                                  for (const _e3832 of _l3830) _f3829[_e3832] = -1;
                                  _l3830 = _a3828;
                                  let _i3834 = 0;
                                  _s3831[0] = 0;
                                  let _o3838 = _a3828.length === 0;
                                  for (;;) {
                                    if (_a3828.length === 0) {
                                      if (!_o3838) break;
                                      _o3838 = false;
                                    }
                                    while (_a3828.length > 0 && _i3834 >= 0) {
                                      const _e3832 = _a3828[_i3834];
                                      if (_s3831[_i3834] > 0) _f3829[_e3832] = -1;
                                      let _r3837 = (cands[_e3832] >= 0 ? cands[_e3832] : (cands[_e3832] = b.cands[_e3832])) & ~((2 << _s3831[_i3834]) - 1);
                                      let _d3833 = 0;
                                      V3836: for (; _r3837 !== 0; _r3837 &= _r3837 - 1) {
                                        _d3833 = 31 - Math.clz32(_r3837 & -_r3837);
                                        _f3829[_e3832] = _d3833;
                                        if (_e3832 === v_x && _d3833 !== 1) continue;
                                        if (_e3832 === v_y && _d3833 !== 1) continue;
                                        for (let _j3835 = 0; _j3835 < _i3834; _j3835++) {
                                          const _y3839 = _a3828[_j3835];
                                          if (!((((arms(sp, cl, _t3784) === 2) && (_f3829[_e3832] === 1)) && (_f3829[_y3839] === 1)))) continue;
                                          if (!((bent(sp, _e3832, _y3839) === (clueAt(cl.piece, _t3784) === 3)))) continue V3836;
                                        }
                                        break;
                                      }
                                      if (_r3837 === 0) {
                                        _s3831[_i3834] = 0;
                                        _i3834--;
                                        continue;
                                      }
                                      _s3831[_i3834] = _d3833;
                                      if (_i3834 === _a3828.length - 1) break;
                                      _i3834++;
                                      _s3831[_i3834] = 0;
                                    }
                                    if (_i3834 < 0) break;
                                    let _g3840 = 0;
                                    G3841: {
                                      const _a3842 = sp.cellEdges[_t3784];
                                      for (let _i3843 = 0; _i3843 < _a3842.length; _i3843++) {
                                        const v_z = _a3842[_i3843];
                                        if (!((_f3829[v_z] === 1))) continue;
                                        _g3840++;
                                      }
                                    }
                                    if (!((_g3840 === arms(sp, cl, _t3784)))) continue;
                                    if (true) {
                                      _q3826 = true;
                                      break Q3827;
                                    }
                                  }
                                }
                                _c3844 = _q3826;
                              }
                              if (!(_c3844)) continue;
                              const _t3845 = (sp.edgeEnds[2 * v_y] === _t3784 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t3846 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t3784]);
                              const _g3847: number[] = [];
                              G3848: {
                                const _a3854 = through(sp, _t3845, _t3846);
                                for (let _i3855 = 0; _i3855 < _a3854.length; _i3855++) {
                                  const v_t = _a3854[_i3855];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a3856 = sp.cellEdges[v_t];
                                  for (let _i3857 = 0; _i3857 < _a3856.length; _i3857++) {
                                    const v_y = _a3856[_i3857];
                                    L3858: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L3858;
                                      if (!_g3847.includes(v_z)) _g3847.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a3859 = union(through(sp, _t3845, _t3846), _g3847);
                              for (let _i3860 = 0; _i3860 < _a3859.length; _i3860++) {
                                const v_t = _a3859[_i3860];
                                if (!_g3785.includes(v_t)) _g3785.push(v_t);
                              }
                            }
                          }
                          const _a3861 = union(setOf(_t3784), _g3785);
                          for (let _i3862 = 0; _i3862 < _a3861.length; _i3862++) {
                            const v_t = _a3861[_i3862];
                            if (!_g3699.includes(v_t)) _g3699.push(v_t);
                          }
                        }
                      }
                      _c3863 = (union(setOf(v_c), _g3699).length >= sp.cells.length);
                    }
                    _c3864 = _c3863;
                  }
                  if (!(_c3864)) continue;
                  if (true) {
                    _q3671 = true;
                    break Q3672;
                  }
                }
              }
              if (!(_q3671)) continue;
              _g3471.push(v_e);
            }
          }
          const _g3865: number[] = [];
          G3866: {
            const _a4063 = v_F;
            for (let _i4064 = 0; _i4064 < _a4063.length; _i4064++) {
              const v_e = _a4063[_i4064];
              let _q4065 = false;
              Q4066: {
                const _f4068 = new Int32Array(sp.edges.length).fill(-1);
                let _l4069: readonly number[] = [];
                const _s4070: number[] = [];
                const _a4067 = sp.cellEdges[v_c];
                for (const _e4071 of _l4069) _f4068[_e4071] = -1;
                _l4069 = _a4067;
                let _i4073 = 0;
                _s4070[0] = 0;
                let _o4077 = _a4067.length === 0;
                for (;;) {
                  if (_a4067.length === 0) {
                    if (!_o4077) break;
                    _o4077 = false;
                  }
                  while (_a4067.length > 0 && _i4073 >= 0) {
                    const _e4071 = _a4067[_i4073];
                    if (_s4070[_i4073] > 0) _f4068[_e4071] = -1;
                    let _r4076 = (cands[_e4071] >= 0 ? cands[_e4071] : (cands[_e4071] = b.cands[_e4071])) & ~((2 << _s4070[_i4073]) - 1);
                    let _d4072 = 0;
                    V4075: for (; _r4076 !== 0; _r4076 &= _r4076 - 1) {
                      _d4072 = 31 - Math.clz32(_r4076 & -_r4076);
                      _f4068[_e4071] = _d4072;
                      if (_e4071 === v_e && _d4072 !== 2) continue;
                      for (let _j4074 = 0; _j4074 < _i4073; _j4074++) {
                        const _y4078 = _a4067[_j4074];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f4068[_e4071] === 1)) && (_f4068[_y4078] === 1)))) continue;
                        if (!((bent(sp, _e4071, _y4078) === (clueAt(cl.piece, v_c) === 3)))) continue V4075;
                      }
                      for (let _j4074 = 0; _j4074 < _i4073; _j4074++) {
                        const _y4079 = _a4067[_j4074];
                        if (!(((((_f4068[_e4071] === 1) && (_f4068[_y4079] === 1)) && !((b.grid[_e4071] !== 0))) && !((b.grid[_y4079] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e4071] === v_c ? sp.edgeEnds[2 * _e4071 + 1] : sp.edgeEnds[2 * _e4071]), v_L).includes((sp.edgeEnds[2 * _y4079] === v_c ? sp.edgeEnds[2 * _y4079 + 1] : sp.edgeEnds[2 * _y4079]))))) continue V4075;
                      }
                      break;
                    }
                    if (_r4076 === 0) {
                      _s4070[_i4073] = 0;
                      _i4073--;
                      continue;
                    }
                    _s4070[_i4073] = _d4072;
                    if (_i4073 === _a4067.length - 1) break;
                    _i4073++;
                    _s4070[_i4073] = 0;
                  }
                  if (_i4073 < 0) break;
                  let _g4080 = 0;
                  G4081: {
                    const _a4082 = sp.cellEdges[v_c];
                    for (let _i4083 = 0; _i4083 < _a4082.length; _i4083++) {
                      const v_x = _a4082[_i4083];
                      if (!((_f4068[v_x] === 1))) continue;
                      _g4080++;
                    }
                  }
                  let _c4088: boolean = (_g4080 === arms(sp, cl, v_c));
                  if (_c4088) {
                    let _q4084 = true;
                    Q4085: {
                      const _a4086 = sp.cellEdges[v_c];
                      for (let _i4087 = 0; _i4087 < _a4086.length; _i4087++) {
                        const v_x = _a4086[_i4087];
                        if (!(((_f4068[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg2209.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q4084 = false;
                          break Q4085;
                        }
                      }
                    }
                    _c4088 = _q4084;
                  }
                  let _c4258: boolean = _c4088;
                  if (_c4258) {
                    let _q4089 = false;
                    Q4090: {
                      const _a4091 = sp.cellEdges[v_c];
                      for (let _i4092 = 0; _i4092 < _a4091.length; _i4092++) {
                        const v_x = _a4091[_i4092];
                        if (!((_f4068[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q4089 = true;
                          break Q4090;
                        }
                      }
                    }
                    let _c4257: boolean = _q4089;
                    if (!_c4257) {
                      const _g4093: number[] = [];
                      G4094: {
                        const _a4176 = sp.cellEdges[v_c];
                        for (let _i4177 = 0; _i4177 < _a4176.length; _i4177++) {
                          const v_x = _a4176[_i4177];
                          if (!((_f4068[v_x] === 1))) continue;
                          const _t4178 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g4179: number[] = [];
                          G4180: {
                            const _a4218 = sp.cellEdges[_t4178];
                            for (let _i4219 = 0; _i4219 < _a4218.length; _i4219++) {
                              const v_y = _a4218[_i4219];
                              let _c4238: boolean = (v_y !== v_x);
                              if (_c4238) {
                                let _q4220 = false;
                                Q4221: {
                                  const _f4223 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l4224: readonly number[] = [];
                                  const _s4225: number[] = [];
                                  const _a4222 = sp.cellEdges[_t4178];
                                  for (const _e4226 of _l4224) _f4223[_e4226] = -1;
                                  _l4224 = _a4222;
                                  let _i4228 = 0;
                                  _s4225[0] = 0;
                                  let _o4232 = _a4222.length === 0;
                                  for (;;) {
                                    if (_a4222.length === 0) {
                                      if (!_o4232) break;
                                      _o4232 = false;
                                    }
                                    while (_a4222.length > 0 && _i4228 >= 0) {
                                      const _e4226 = _a4222[_i4228];
                                      if (_s4225[_i4228] > 0) _f4223[_e4226] = -1;
                                      let _r4231 = (cands[_e4226] >= 0 ? cands[_e4226] : (cands[_e4226] = b.cands[_e4226])) & ~((2 << _s4225[_i4228]) - 1);
                                      let _d4227 = 0;
                                      V4230: for (; _r4231 !== 0; _r4231 &= _r4231 - 1) {
                                        _d4227 = 31 - Math.clz32(_r4231 & -_r4231);
                                        _f4223[_e4226] = _d4227;
                                        if (_e4226 === v_x && _d4227 !== 1) continue;
                                        if (_e4226 === v_y && _d4227 !== 1) continue;
                                        for (let _j4229 = 0; _j4229 < _i4228; _j4229++) {
                                          const _y4233 = _a4222[_j4229];
                                          if (!((((arms(sp, cl, _t4178) === 2) && (_f4223[_e4226] === 1)) && (_f4223[_y4233] === 1)))) continue;
                                          if (!((bent(sp, _e4226, _y4233) === (clueAt(cl.piece, _t4178) === 3)))) continue V4230;
                                        }
                                        break;
                                      }
                                      if (_r4231 === 0) {
                                        _s4225[_i4228] = 0;
                                        _i4228--;
                                        continue;
                                      }
                                      _s4225[_i4228] = _d4227;
                                      if (_i4228 === _a4222.length - 1) break;
                                      _i4228++;
                                      _s4225[_i4228] = 0;
                                    }
                                    if (_i4228 < 0) break;
                                    let _g4234 = 0;
                                    G4235: {
                                      const _a4236 = sp.cellEdges[_t4178];
                                      for (let _i4237 = 0; _i4237 < _a4236.length; _i4237++) {
                                        const v_z = _a4236[_i4237];
                                        if (!((_f4223[v_z] === 1))) continue;
                                        _g4234++;
                                      }
                                    }
                                    if (!((_g4234 === arms(sp, cl, _t4178)))) continue;
                                    if (true) {
                                      _q4220 = true;
                                      break Q4221;
                                    }
                                  }
                                }
                                _c4238 = _q4220;
                              }
                              if (!(_c4238)) continue;
                              const _t4239 = (sp.edgeEnds[2 * v_y] === _t4178 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t4240 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t4178]);
                              const _g4241: number[] = [];
                              G4242: {
                                const _a4248 = through(sp, _t4239, _t4240);
                                for (let _i4249 = 0; _i4249 < _a4248.length; _i4249++) {
                                  const v_t = _a4248[_i4249];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a4250 = sp.cellEdges[v_t];
                                  for (let _i4251 = 0; _i4251 < _a4250.length; _i4251++) {
                                    const v_y = _a4250[_i4251];
                                    L4252: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L4252;
                                      if (!_g4241.includes(v_z)) _g4241.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a4253 = union(through(sp, _t4239, _t4240), _g4241);
                              for (let _i4254 = 0; _i4254 < _a4253.length; _i4254++) {
                                const v_t = _a4253[_i4254];
                                if (!_g4179.includes(v_t)) _g4179.push(v_t);
                              }
                            }
                          }
                          const _a4255 = union(setOf(_t4178), _g4179);
                          for (let _i4256 = 0; _i4256 < _a4255.length; _i4256++) {
                            const v_t = _a4255[_i4256];
                            if (!_g4093.includes(v_t)) _g4093.push(v_t);
                          }
                        }
                      }
                      _c4257 = (union(setOf(v_c), _g4093).length >= sp.cells.length);
                    }
                    _c4258 = _c4257;
                  }
                  if (!(_c4258)) continue;
                  if (true) {
                    _q4065 = true;
                    break Q4066;
                  }
                }
              }
              if (!(_q4065)) continue;
              _g3865.push(v_e);
            }
          }
          let _q4259 = true;
          Q4260: {
            const _a4261 = v_F;
            for (let _i4262 = 0; _i4262 < _a4261.length; _i4262++) {
              const v_e = _a4261[_i4262];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q4259 = false;
                break Q4260;
              }
            }
          }
          freshBinding("sealLock", [sameSet(v_L, _g3209), sameSet(v_U, _g3215), sameSet(v_P, _g3299), (sp.cells.includes(v_c)), sameSet(v_F, _g3305), (v_F.length > 0), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g3311), sameSet(v_W, _g3471), sameSet(v_N, _g3865), _q4259], ["L =", "U =", "P =", "c in", "F =", "where of F", "G =", "K =", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q4263 = true;
        Q4264: {
          const _a4265 = v_F;
          for (let _i4266 = 0; _i4266 < _a4265.length; _i4266++) {
            const v_e = _a4265[_i4266];
            let _c4268: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c4268) {
              let _c4267: boolean = !(!(v_W.includes(v_e)));
              if (!_c4267) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c4267 = true;
              }
              _c4268 = _c4267;
            }
            let _c4270: boolean = _c4268;
            if (_c4270) {
              let _c4269: boolean = !(!(v_N.includes(v_e)));
              if (!_c4269) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c4269 = true;
              }
              _c4270 = _c4269;
            }
            if (!(_c4270)) {
              _q4263 = false;
              break Q4264;
            }
          }
        }
        if (!(_q4263)) return -1;
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
let _f4979 = new Int32Array(0);
let _l4980: readonly number[] = [];
let _f4999 = new Int32Array(0);
let _l5000: readonly number[] = [];
const _st5151 = stamps();
let _f5157 = new Int32Array(0);
let _l5158: readonly number[] = [];
const _st5188 = stamps();
let _p5202 = new Int32Array(0);
let _l5203: readonly number[] = [];
let _f5208 = new Int32Array(0);
let _l5209: readonly number[] = [];
const _st5316 = stamps();
const _st5359 = stamps();
let _f5365 = new Int32Array(0);
let _l5366: readonly number[] = [];
const _st5395 = stamps();
let _p5410 = new Int32Array(0);
let _l5411: readonly number[] = [];
let _f5416 = new Int32Array(0);
let _l5417: readonly number[] = [];
const _st5524 = stamps();
const _st5567 = stamps();
let _f5573 = new Int32Array(0);
let _l5574: readonly number[] = [];
const _st5603 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealNoteBinding> | null): number {
  const _g4924: number[] = [];
  const _g4930: number[] = [];
  if (_f4979.length < sp.edges.length) _f4979 = new Int32Array(sp.edges.length).fill(-1);
  else _f4979.fill(-1);
  _l4980 = [];
  const _s4981: number[] = [];
  if (_f4999.length < sp.edges.length) _f4999 = new Int32Array(sp.edges.length).fill(-1);
  else _f4999.fill(-1);
  _l5000 = [];
  const _s5001: number[] = [];
  const _g5015: number[] = [];
  const _g5028: number[] = [];
  const _g5112: number[] = [];
  if (_f5157.length < sp.edges.length) _f5157 = new Int32Array(sp.edges.length).fill(-1);
  else _f5157.fill(-1);
  _l5158 = [];
  const _s5159: number[] = [];
  const _g5181: number[] = [];
  if (_p5202.length < sp.edges.length) _p5202 = new Int32Array(sp.edges.length);
  else _p5202.fill(0);
  _l5203 = [];
  let _y5204 = false;
  if (_f5208.length < sp.edges.length) _f5208 = new Int32Array(sp.edges.length).fill(-1);
  else _f5208.fill(-1);
  _l5209 = [];
  const _s5210: number[] = [];
  const _g5233: number[] = [];
  const _g5320: number[] = [];
  if (_f5365.length < sp.edges.length) _f5365 = new Int32Array(sp.edges.length).fill(-1);
  else _f5365.fill(-1);
  _l5366 = [];
  const _s5367: number[] = [];
  const _g5388: number[] = [];
  if (_p5410.length < sp.edges.length) _p5410 = new Int32Array(sp.edges.length);
  else _p5410.fill(0);
  _l5411 = [];
  let _y5412 = false;
  if (_f5416.length < sp.edges.length) _f5416 = new Int32Array(sp.edges.length).fill(-1);
  else _f5416.fill(-1);
  _l5417 = [];
  const _s5418: number[] = [];
  const _g5441: number[] = [];
  const _g5528: number[] = [];
  if (_f5573.length < sp.edges.length) _f5573 = new Int32Array(sp.edges.length).fill(-1);
  else _f5573.fill(-1);
  _l5574 = [];
  const _s5575: number[] = [];
  const _g5596: number[] = [];
  const _g5619: number[] = [];
  const facts = sealNoteFacts;
  let fired = 0;
  let changed = false;
  const _k4990 = armsKept.board(cl);
  const _h5199 = sp.cells.length;
  let _epoch = 0;
  if (sealNoteCands.length < sp.edges.length) sealNoteCands = new Int32Array(sp.edges.length);
  const cands = sealNoteCands;
  cands.fill(-1);
  const _m277_0 = b.made[0];
  _g4924.length = 0;
  G4925: {
    const _a4928 = sp.edges;
    for (let _i4929 = 0; _i4929 < _a4928.length; _i4929++) {
      const v_e = _a4928[_i4929];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g4924.push(v_e);
    }
  }
  const v_L = _g4924;
  const _m280_1 = b.made[1];
  const _eg5027 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g4930.length = 0;
  G4931: {
    const _a4973 = sp.edges;
    for (let _i4974 = 0; _i4974 < _a4973.length; _i4974++) {
      const v_e = _a4973[_i4974];
      const _t4975 = sp.edgeEnds[2 * v_e];
      let _q4976 = false;
      Q4977: {
        const _a4978 = sp.cellEdges[_t4975];
        for (const _e4982 of _l4980) _f4979[_e4982] = -1;
        _l4980 = _a4978;
        let _i4984 = 0;
        _s4981[0] = 0;
        let _o4988 = _a4978.length === 0;
        for (;;) {
          if (_a4978.length === 0) {
            if (!_o4988) break;
            _o4988 = false;
          }
          while (_a4978.length > 0 && _i4984 >= 0) {
            const _e4982 = _a4978[_i4984];
            if (_s4981[_i4984] > 0) _f4979[_e4982] = -1;
            let _r4987 = (cands[_e4982] >= 0 ? cands[_e4982] : (cands[_e4982] = b.cands[_e4982])) & ~((2 << _s4981[_i4984]) - 1);
            let _d4983 = 0;
            V4986: for (; _r4987 !== 0; _r4987 &= _r4987 - 1) {
              _d4983 = 31 - Math.clz32(_r4987 & -_r4987);
              _f4979[_e4982] = _d4983;
              if (_e4982 === v_e && _d4983 !== 1) continue;
              for (let _j4985 = 0; _j4985 < _i4984; _j4985++) {
                const _y4989 = _a4978[_j4985];
                if (!(((((_k4990[_t4975] ?? arms(sp, cl, _t4975)) === 2) && (_f4979[_e4982] === 1)) && (_f4979[_y4989] === 1)))) continue;
                if (!((bent(sp, _e4982, _y4989) === (clueAt(cl.piece, _t4975) === 3)))) continue V4986;
              }
              break;
            }
            if (_r4987 === 0) {
              _s4981[_i4984] = 0;
              _i4984--;
              continue;
            }
            _s4981[_i4984] = _d4983;
            if (_i4984 === _a4978.length - 1) break;
            _i4984++;
            _s4981[_i4984] = 0;
          }
          if (_i4984 < 0) break;
          let _g4991 = 0;
          G4992: {
            const _a4993 = sp.cellEdges[_t4975];
            for (let _i4994 = 0; _i4994 < _a4993.length; _i4994++) {
              const v_x = _a4993[_i4994];
              if (!((_f4979[v_x] === 1))) continue;
              _g4991++;
            }
          }
          if (!((_g4991 === (_k4990[_t4975] ?? arms(sp, cl, _t4975))))) continue;
          if (true) {
            _q4976 = true;
            break Q4977;
          }
        }
      }
      let _c5014: boolean = _q4976;
      if (_c5014) {
        const _t4995 = sp.edgeEnds[2 * v_e + 1];
        let _q4996 = false;
        Q4997: {
          const _a4998 = sp.cellEdges[_t4995];
          for (const _e5002 of _l5000) _f4999[_e5002] = -1;
          _l5000 = _a4998;
          let _i5004 = 0;
          _s5001[0] = 0;
          let _o5008 = _a4998.length === 0;
          for (;;) {
            if (_a4998.length === 0) {
              if (!_o5008) break;
              _o5008 = false;
            }
            while (_a4998.length > 0 && _i5004 >= 0) {
              const _e5002 = _a4998[_i5004];
              if (_s5001[_i5004] > 0) _f4999[_e5002] = -1;
              let _r5007 = (cands[_e5002] >= 0 ? cands[_e5002] : (cands[_e5002] = b.cands[_e5002])) & ~((2 << _s5001[_i5004]) - 1);
              let _d5003 = 0;
              V5006: for (; _r5007 !== 0; _r5007 &= _r5007 - 1) {
                _d5003 = 31 - Math.clz32(_r5007 & -_r5007);
                _f4999[_e5002] = _d5003;
                if (_e5002 === v_e && _d5003 !== 1) continue;
                for (let _j5005 = 0; _j5005 < _i5004; _j5005++) {
                  const _y5009 = _a4998[_j5005];
                  if (!(((((_k4990[_t4995] ?? arms(sp, cl, _t4995)) === 2) && (_f4999[_e5002] === 1)) && (_f4999[_y5009] === 1)))) continue;
                  if (!((bent(sp, _e5002, _y5009) === (clueAt(cl.piece, _t4995) === 3)))) continue V5006;
                }
                break;
              }
              if (_r5007 === 0) {
                _s5001[_i5004] = 0;
                _i5004--;
                continue;
              }
              _s5001[_i5004] = _d5003;
              if (_i5004 === _a4998.length - 1) break;
              _i5004++;
              _s5001[_i5004] = 0;
            }
            if (_i5004 < 0) break;
            let _g5010 = 0;
            G5011: {
              const _a5012 = sp.cellEdges[_t4995];
              for (let _i5013 = 0; _i5013 < _a5012.length; _i5013++) {
                const v_x = _a5012[_i5013];
                if (!((_f4999[v_x] === 1))) continue;
                _g5010++;
              }
            }
            if (!((_g5010 === (_k4990[_t4995] ?? arms(sp, cl, _t4995))))) continue;
            if (true) {
              _q4996 = true;
              break Q4997;
            }
          }
        }
        _c5014 = _q4996;
      }
      if (!(_c5014)) continue;
      _g4930.push(v_e);
    }
  }
  const v_U = _g4930;
  const _mm5194 = memberMarks(v_U);
  _g5015.length = 0;
  G5016: {
    const _a5019 = v_U;
    for (let _i5020 = 0; _i5020 < _a5019.length; _i5020++) {
      const v_e = _a5019[_i5020];
      if (!((((_k4990[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k4990[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g5015.push(v_e);
    }
  }
  const v_P = _g5015;
  const _a5021 = sp.cells;
  for (let _i5022 = 0; _i5022 < _a5021.length; _i5022++) {
    const v_c = _a5021[_i5022];
    const _h5173 = minus(v_P, sp.cellEdges[v_c]);
    let _q5023 = false;
    Q5024: {
      const _a5025 = sp.cellEdges[v_c];
      for (let _i5026 = 0; _i5026 < _a5025.length; _i5026++) {
        const v_e = _a5025[_i5026];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q5023 = true;
          break Q5024;
        }
      }
    }
    if (!(_q5023)) continue;
    const v_G = _eg5027.of(v_c);
    _g5028.length = 0;
    G5029: {
      const _a5109 = sp.cellEdges[v_c];
      for (let _i5110 = 0; _i5110 < _a5109.length; _i5110++) {
        const v_x = _a5109[_i5110];
        const _t5111 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h5174 = minus(_h5173, sp.cellEdges[_t5111]);
        const _eg5176 = edgeGroups(sp, _h5174);
        const _memo5179 = new Map<readonly number[], readonly number[]>();
        _g5112.length = 0;
        _st5151.pass++;
        G5113: {
          const _a5152 = sp.cellEdges[_t5111];
          for (let _i5153 = 0; _i5153 < _a5152.length; _i5153++) {
            const v_y = _a5152[_i5153];
            let _c5172: boolean = (v_y !== v_x);
            if (_c5172) {
              let _q5154 = false;
              Q5155: {
                const _a5156 = sp.cellEdges[_t5111];
                for (const _e5160 of _l5158) _f5157[_e5160] = -1;
                _l5158 = _a5156;
                let _i5162 = 0;
                _s5159[0] = 0;
                let _o5166 = _a5156.length === 0;
                for (;;) {
                  if (_a5156.length === 0) {
                    if (!_o5166) break;
                    _o5166 = false;
                  }
                  while (_a5156.length > 0 && _i5162 >= 0) {
                    const _e5160 = _a5156[_i5162];
                    if (_s5159[_i5162] > 0) _f5157[_e5160] = -1;
                    let _r5165 = (cands[_e5160] >= 0 ? cands[_e5160] : (cands[_e5160] = b.cands[_e5160])) & ~((2 << _s5159[_i5162]) - 1);
                    let _d5161 = 0;
                    V5164: for (; _r5165 !== 0; _r5165 &= _r5165 - 1) {
                      _d5161 = 31 - Math.clz32(_r5165 & -_r5165);
                      _f5157[_e5160] = _d5161;
                      if (_e5160 === v_x && _d5161 !== 1) continue;
                      if (_e5160 === v_y && _d5161 !== 1) continue;
                      for (let _j5163 = 0; _j5163 < _i5162; _j5163++) {
                        const _y5167 = _a5156[_j5163];
                        if (!(((((_k4990[_t5111] ?? arms(sp, cl, _t5111)) === 2) && (_f5157[_e5160] === 1)) && (_f5157[_y5167] === 1)))) continue;
                        if (!((bent(sp, _e5160, _y5167) === (clueAt(cl.piece, _t5111) === 3)))) continue V5164;
                      }
                      break;
                    }
                    if (_r5165 === 0) {
                      _s5159[_i5162] = 0;
                      _i5162--;
                      continue;
                    }
                    _s5159[_i5162] = _d5161;
                    if (_i5162 === _a5156.length - 1) break;
                    _i5162++;
                    _s5159[_i5162] = 0;
                  }
                  if (_i5162 < 0) break;
                  let _g5168 = 0;
                  G5169: {
                    const _a5170 = sp.cellEdges[_t5111];
                    for (let _i5171 = 0; _i5171 < _a5170.length; _i5171++) {
                      const v_z = _a5170[_i5171];
                      if (!((_f5157[v_z] === 1))) continue;
                      _g5168++;
                    }
                  }
                  if (!((_g5168 === (_k4990[_t5111] ?? arms(sp, cl, _t5111))))) continue;
                  if (true) {
                    _q5154 = true;
                    break Q5155;
                  }
                }
              }
              _c5172 = _q5154;
            }
            if (!(_c5172)) continue;
            const _t5175 = (sp.edgeEnds[2 * v_y] === _t5111 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t5178 = _eg5176.of(_t5175);
            let _gs5180 = _memo5179.get(_t5178);
            if (_gs5180 === undefined) {
              _g5181.length = 0;
              _st5188.pass++;
              G5182: {
                const _a5189 = _t5178;
                for (let _i5190 = 0; _i5190 < _a5189.length; _i5190++) {
                  const v_t = _a5189[_i5190];
                  if (!(((_k4990[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a5191 = sp.cellEdges[v_t];
                  for (let _i5192 = 0; _i5192 < _a5191.length; _i5192++) {
                    const v_y = _a5191[_i5192];
                    L5193: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k4990[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5194[v_y + 1] === 1)))) break L5193;
                      const _t5195 = v_z;
                      if (_g5181.length < 16) { if (!_g5181.includes(_t5195)) _g5181.push(_t5195); } else addOnce(_g5181, _st5188, _t5195);
                    }
                  }
                }
              }
              _gs5180 = _g5181.slice();
              _memo5179.set(_t5178, _gs5180);
            }
            const _a5196 = union(_eg5176.of(_t5175), _gs5180);
            for (let _i5197 = 0; _i5197 < _a5196.length; _i5197++) {
              const v_t = _a5196[_i5197];
              const _t5198 = v_t;
              if (_g5112.length < 16) { if (!_g5112.includes(_t5198)) _g5112.push(_t5198); } else addOnce(_g5112, _st5151, _t5198);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t5111), _g5112)).length >= _h5199))) continue;
        _g5028.push(v_x);
      }
    }
    const v_K = _g5028;
    let _g5205 = -1;
    let _g5413 = -1;
    const _a5200 = sp.cellEdges[v_c];
    for (let _i5201 = 0; _i5201 < _a5200.length; _i5201++) {
      const v_e = _a5200[_i5201];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g5205 !== _epoch) {
        _g5205 = _epoch;
        for (const _e5206 of _l5203) _p5202[_e5206] = 0;
        _y5204 = false;
        const _a5207 = sp.cellEdges[v_c];
        for (const _e5211 of _l5209) _f5208[_e5211] = -1;
        _l5209 = _a5207;
        let _i5213 = 0;
        _s5210[0] = 0;
        let _o5217 = _a5207.length === 0;
        for (;;) {
          if (_a5207.length === 0) {
            if (!_o5217) break;
            _o5217 = false;
          }
          while (_a5207.length > 0 && _i5213 >= 0) {
            const _e5211 = _a5207[_i5213];
            if (_s5210[_i5213] > 0) _f5208[_e5211] = -1;
            let _r5216 = (cands[_e5211] >= 0 ? cands[_e5211] : (cands[_e5211] = b.cands[_e5211])) & ~((2 << _s5210[_i5213]) - 1);
            let _d5212 = 0;
            V5215: for (; _r5216 !== 0; _r5216 &= _r5216 - 1) {
              _d5212 = 31 - Math.clz32(_r5216 & -_r5216);
              _f5208[_e5211] = _d5212;
              for (let _j5214 = 0; _j5214 < _i5213; _j5214++) {
                const _y5218 = _a5207[_j5214];
                if (!(((((_k4990[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f5208[_e5211] === 1)) && (_f5208[_y5218] === 1)))) continue;
                if (!((bent(sp, _e5211, _y5218) === (clueAt(cl.piece, v_c) === 3)))) continue V5215;
              }
              for (let _j5214 = 0; _j5214 < _i5213; _j5214++) {
                const _y5219 = _a5207[_j5214];
                if (!(((((_f5208[_e5211] === 1) && (_f5208[_y5219] === 1)) && !((b.grid[_e5211] !== 0))) && !((b.grid[_y5219] !== 0))))) continue;
                if (!(!(_eg5027.of((sp.edgeEnds[2 * _y5219] === v_c ? sp.edgeEnds[2 * _y5219 + 1] : sp.edgeEnds[2 * _y5219])) === _eg5027.of((sp.edgeEnds[2 * _e5211] === v_c ? sp.edgeEnds[2 * _e5211 + 1] : sp.edgeEnds[2 * _e5211]))))) continue V5215;
              }
              break;
            }
            if (_r5216 === 0) {
              _s5210[_i5213] = 0;
              _i5213--;
              continue;
            }
            _s5210[_i5213] = _d5212;
            if (_i5213 === _a5207.length - 1) break;
            _i5213++;
            _s5210[_i5213] = 0;
          }
          if (_i5213 < 0) break;
          let _g5220 = 0;
          G5221: {
            const _a5222 = sp.cellEdges[v_c];
            for (let _i5223 = 0; _i5223 < _a5222.length; _i5223++) {
              const v_x = _a5222[_i5223];
              if (!((_f5208[v_x] === 1))) continue;
              _g5220++;
            }
          }
          let _c5228: boolean = (_g5220 === (_k4990[v_c] ?? arms(sp, cl, v_c)));
          if (_c5228) {
            let _q5224 = true;
            Q5225: {
              const _a5226 = sp.cellEdges[v_c];
              for (let _i5227 = 0; _i5227 < _a5226.length; _i5227++) {
                const v_x = _a5226[_i5227];
                if (!(((_f5208[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg5027.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q5224 = false;
                  break Q5225;
                }
              }
            }
            _c5228 = _q5224;
          }
          let _c5409: boolean = _c5228;
          if (_c5409) {
            let _q5229 = false;
            Q5230: {
              const _a5231 = sp.cellEdges[v_c];
              for (let _i5232 = 0; _i5232 < _a5231.length; _i5232++) {
                const v_x = _a5231[_i5232];
                if (!((_f5208[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q5229 = true;
                  break Q5230;
                }
              }
            }
            let _c5408: boolean = _q5229;
            if (!_c5408) {
              _g5233.length = 0;
              _st5316.pass++;
              G5234: {
                const _a5317 = sp.cellEdges[v_c];
                for (let _i5318 = 0; _i5318 < _a5317.length; _i5318++) {
                  const v_x = _a5317[_i5318];
                  if (!((_f5208[v_x] === 1))) continue;
                  const _t5319 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h5381 = minus(_h5173, sp.cellEdges[_t5319]);
                  const _eg5383 = edgeGroups(sp, _h5381);
                  const _memo5386 = new Map<readonly number[], readonly number[]>();
                  _g5320.length = 0;
                  _st5359.pass++;
                  G5321: {
                    const _a5360 = sp.cellEdges[_t5319];
                    for (let _i5361 = 0; _i5361 < _a5360.length; _i5361++) {
                      const v_y = _a5360[_i5361];
                      let _c5380: boolean = (v_y !== v_x);
                      if (_c5380) {
                        let _q5362 = false;
                        Q5363: {
                          const _a5364 = sp.cellEdges[_t5319];
                          for (const _e5368 of _l5366) _f5365[_e5368] = -1;
                          _l5366 = _a5364;
                          let _i5370 = 0;
                          _s5367[0] = 0;
                          let _o5374 = _a5364.length === 0;
                          for (;;) {
                            if (_a5364.length === 0) {
                              if (!_o5374) break;
                              _o5374 = false;
                            }
                            while (_a5364.length > 0 && _i5370 >= 0) {
                              const _e5368 = _a5364[_i5370];
                              if (_s5367[_i5370] > 0) _f5365[_e5368] = -1;
                              let _r5373 = (cands[_e5368] >= 0 ? cands[_e5368] : (cands[_e5368] = b.cands[_e5368])) & ~((2 << _s5367[_i5370]) - 1);
                              let _d5369 = 0;
                              V5372: for (; _r5373 !== 0; _r5373 &= _r5373 - 1) {
                                _d5369 = 31 - Math.clz32(_r5373 & -_r5373);
                                _f5365[_e5368] = _d5369;
                                if (_e5368 === v_x && _d5369 !== 1) continue;
                                if (_e5368 === v_y && _d5369 !== 1) continue;
                                for (let _j5371 = 0; _j5371 < _i5370; _j5371++) {
                                  const _y5375 = _a5364[_j5371];
                                  if (!(((((_k4990[_t5319] ?? arms(sp, cl, _t5319)) === 2) && (_f5365[_e5368] === 1)) && (_f5365[_y5375] === 1)))) continue;
                                  if (!((bent(sp, _e5368, _y5375) === (clueAt(cl.piece, _t5319) === 3)))) continue V5372;
                                }
                                break;
                              }
                              if (_r5373 === 0) {
                                _s5367[_i5370] = 0;
                                _i5370--;
                                continue;
                              }
                              _s5367[_i5370] = _d5369;
                              if (_i5370 === _a5364.length - 1) break;
                              _i5370++;
                              _s5367[_i5370] = 0;
                            }
                            if (_i5370 < 0) break;
                            let _g5376 = 0;
                            G5377: {
                              const _a5378 = sp.cellEdges[_t5319];
                              for (let _i5379 = 0; _i5379 < _a5378.length; _i5379++) {
                                const v_z = _a5378[_i5379];
                                if (!((_f5365[v_z] === 1))) continue;
                                _g5376++;
                              }
                            }
                            if (!((_g5376 === (_k4990[_t5319] ?? arms(sp, cl, _t5319))))) continue;
                            if (true) {
                              _q5362 = true;
                              break Q5363;
                            }
                          }
                        }
                        _c5380 = _q5362;
                      }
                      if (!(_c5380)) continue;
                      const _t5382 = (sp.edgeEnds[2 * v_y] === _t5319 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t5385 = _eg5383.of(_t5382);
                      let _gs5387 = _memo5386.get(_t5385);
                      if (_gs5387 === undefined) {
                        _g5388.length = 0;
                        _st5395.pass++;
                        G5389: {
                          const _a5396 = _t5385;
                          for (let _i5397 = 0; _i5397 < _a5396.length; _i5397++) {
                            const v_t = _a5396[_i5397];
                            if (!(((_k4990[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a5398 = sp.cellEdges[v_t];
                            for (let _i5399 = 0; _i5399 < _a5398.length; _i5399++) {
                              const v_y = _a5398[_i5399];
                              L5400: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k4990[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5194[v_y + 1] === 1)))) break L5400;
                                const _t5401 = v_z;
                                if (_g5388.length < 16) { if (!_g5388.includes(_t5401)) _g5388.push(_t5401); } else addOnce(_g5388, _st5395, _t5401);
                              }
                            }
                          }
                        }
                        _gs5387 = _g5388.slice();
                        _memo5386.set(_t5385, _gs5387);
                      }
                      const _a5402 = union(_eg5383.of(_t5382), _gs5387);
                      for (let _i5403 = 0; _i5403 < _a5402.length; _i5403++) {
                        const v_t = _a5402[_i5403];
                        const _t5404 = v_t;
                        if (_g5320.length < 16) { if (!_g5320.includes(_t5404)) _g5320.push(_t5404); } else addOnce(_g5320, _st5359, _t5404);
                      }
                    }
                  }
                  const _a5405 = union(setOf(_t5319), _g5320);
                  for (let _i5406 = 0; _i5406 < _a5405.length; _i5406++) {
                    const v_t = _a5405[_i5406];
                    const _t5407 = v_t;
                    if (_g5233.length < 16) { if (!_g5233.includes(_t5407)) _g5233.push(_t5407); } else addOnce(_g5233, _st5316, _t5407);
                  }
                }
              }
              _c5408 = (union(setOf(v_c), _g5233).length >= _h5199);
            }
            _c5409 = _c5408;
          }
          if (!(_c5409)) continue;
          if (!(true)) continue;
          _l5203 = _a5207;
          _y5204 = true;
          for (const _e5206 of _a5207) _p5202[_e5206] |= 1 << _f5208[_e5206];
        }
      }
      const v_A = ((((_p5202[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y5204 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g5413 !== _epoch) {
        _g5413 = _epoch;
        for (const _e5414 of _l5411) _p5410[_e5414] = 0;
        _y5412 = false;
        const _a5415 = sp.cellEdges[v_c];
        for (const _e5419 of _l5417) _f5416[_e5419] = -1;
        _l5417 = _a5415;
        let _i5421 = 0;
        _s5418[0] = 0;
        let _o5425 = _a5415.length === 0;
        for (;;) {
          if (_a5415.length === 0) {
            if (!_o5425) break;
            _o5425 = false;
          }
          while (_a5415.length > 0 && _i5421 >= 0) {
            const _e5419 = _a5415[_i5421];
            if (_s5418[_i5421] > 0) _f5416[_e5419] = -1;
            let _r5424 = (cands[_e5419] >= 0 ? cands[_e5419] : (cands[_e5419] = b.cands[_e5419])) & ~((2 << _s5418[_i5421]) - 1);
            let _d5420 = 0;
            V5423: for (; _r5424 !== 0; _r5424 &= _r5424 - 1) {
              _d5420 = 31 - Math.clz32(_r5424 & -_r5424);
              _f5416[_e5419] = _d5420;
              for (let _j5422 = 0; _j5422 < _i5421; _j5422++) {
                const _y5426 = _a5415[_j5422];
                if (!(((((_k4990[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f5416[_e5419] === 1)) && (_f5416[_y5426] === 1)))) continue;
                if (!((bent(sp, _e5419, _y5426) === (clueAt(cl.piece, v_c) === 3)))) continue V5423;
              }
              for (let _j5422 = 0; _j5422 < _i5421; _j5422++) {
                const _y5427 = _a5415[_j5422];
                if (!(((((_f5416[_e5419] === 1) && (_f5416[_y5427] === 1)) && !((b.grid[_e5419] !== 0))) && !((b.grid[_y5427] !== 0))))) continue;
                if (!(!(_eg5027.of((sp.edgeEnds[2 * _y5427] === v_c ? sp.edgeEnds[2 * _y5427 + 1] : sp.edgeEnds[2 * _y5427])) === _eg5027.of((sp.edgeEnds[2 * _e5419] === v_c ? sp.edgeEnds[2 * _e5419 + 1] : sp.edgeEnds[2 * _e5419]))))) continue V5423;
              }
              break;
            }
            if (_r5424 === 0) {
              _s5418[_i5421] = 0;
              _i5421--;
              continue;
            }
            _s5418[_i5421] = _d5420;
            if (_i5421 === _a5415.length - 1) break;
            _i5421++;
            _s5418[_i5421] = 0;
          }
          if (_i5421 < 0) break;
          let _g5428 = 0;
          G5429: {
            const _a5430 = sp.cellEdges[v_c];
            for (let _i5431 = 0; _i5431 < _a5430.length; _i5431++) {
              const v_x = _a5430[_i5431];
              if (!((_f5416[v_x] === 1))) continue;
              _g5428++;
            }
          }
          let _c5436: boolean = (_g5428 === (_k4990[v_c] ?? arms(sp, cl, v_c)));
          if (_c5436) {
            let _q5432 = true;
            Q5433: {
              const _a5434 = sp.cellEdges[v_c];
              for (let _i5435 = 0; _i5435 < _a5434.length; _i5435++) {
                const v_x = _a5434[_i5435];
                if (!(((_f5416[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg5027.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q5432 = false;
                  break Q5433;
                }
              }
            }
            _c5436 = _q5432;
          }
          let _c5617: boolean = _c5436;
          if (_c5617) {
            let _q5437 = false;
            Q5438: {
              const _a5439 = sp.cellEdges[v_c];
              for (let _i5440 = 0; _i5440 < _a5439.length; _i5440++) {
                const v_x = _a5439[_i5440];
                if (!((_f5416[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q5437 = true;
                  break Q5438;
                }
              }
            }
            let _c5616: boolean = _q5437;
            if (!_c5616) {
              _g5441.length = 0;
              _st5524.pass++;
              G5442: {
                const _a5525 = sp.cellEdges[v_c];
                for (let _i5526 = 0; _i5526 < _a5525.length; _i5526++) {
                  const v_x = _a5525[_i5526];
                  if (!((_f5416[v_x] === 1))) continue;
                  const _t5527 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h5589 = minus(_h5173, sp.cellEdges[_t5527]);
                  const _eg5591 = edgeGroups(sp, _h5589);
                  const _memo5594 = new Map<readonly number[], readonly number[]>();
                  _g5528.length = 0;
                  _st5567.pass++;
                  G5529: {
                    const _a5568 = sp.cellEdges[_t5527];
                    for (let _i5569 = 0; _i5569 < _a5568.length; _i5569++) {
                      const v_y = _a5568[_i5569];
                      let _c5588: boolean = (v_y !== v_x);
                      if (_c5588) {
                        let _q5570 = false;
                        Q5571: {
                          const _a5572 = sp.cellEdges[_t5527];
                          for (const _e5576 of _l5574) _f5573[_e5576] = -1;
                          _l5574 = _a5572;
                          let _i5578 = 0;
                          _s5575[0] = 0;
                          let _o5582 = _a5572.length === 0;
                          for (;;) {
                            if (_a5572.length === 0) {
                              if (!_o5582) break;
                              _o5582 = false;
                            }
                            while (_a5572.length > 0 && _i5578 >= 0) {
                              const _e5576 = _a5572[_i5578];
                              if (_s5575[_i5578] > 0) _f5573[_e5576] = -1;
                              let _r5581 = (cands[_e5576] >= 0 ? cands[_e5576] : (cands[_e5576] = b.cands[_e5576])) & ~((2 << _s5575[_i5578]) - 1);
                              let _d5577 = 0;
                              V5580: for (; _r5581 !== 0; _r5581 &= _r5581 - 1) {
                                _d5577 = 31 - Math.clz32(_r5581 & -_r5581);
                                _f5573[_e5576] = _d5577;
                                if (_e5576 === v_x && _d5577 !== 1) continue;
                                if (_e5576 === v_y && _d5577 !== 1) continue;
                                for (let _j5579 = 0; _j5579 < _i5578; _j5579++) {
                                  const _y5583 = _a5572[_j5579];
                                  if (!(((((_k4990[_t5527] ?? arms(sp, cl, _t5527)) === 2) && (_f5573[_e5576] === 1)) && (_f5573[_y5583] === 1)))) continue;
                                  if (!((bent(sp, _e5576, _y5583) === (clueAt(cl.piece, _t5527) === 3)))) continue V5580;
                                }
                                break;
                              }
                              if (_r5581 === 0) {
                                _s5575[_i5578] = 0;
                                _i5578--;
                                continue;
                              }
                              _s5575[_i5578] = _d5577;
                              if (_i5578 === _a5572.length - 1) break;
                              _i5578++;
                              _s5575[_i5578] = 0;
                            }
                            if (_i5578 < 0) break;
                            let _g5584 = 0;
                            G5585: {
                              const _a5586 = sp.cellEdges[_t5527];
                              for (let _i5587 = 0; _i5587 < _a5586.length; _i5587++) {
                                const v_z = _a5586[_i5587];
                                if (!((_f5573[v_z] === 1))) continue;
                                _g5584++;
                              }
                            }
                            if (!((_g5584 === (_k4990[_t5527] ?? arms(sp, cl, _t5527))))) continue;
                            if (true) {
                              _q5570 = true;
                              break Q5571;
                            }
                          }
                        }
                        _c5588 = _q5570;
                      }
                      if (!(_c5588)) continue;
                      const _t5590 = (sp.edgeEnds[2 * v_y] === _t5527 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t5593 = _eg5591.of(_t5590);
                      let _gs5595 = _memo5594.get(_t5593);
                      if (_gs5595 === undefined) {
                        _g5596.length = 0;
                        _st5603.pass++;
                        G5597: {
                          const _a5604 = _t5593;
                          for (let _i5605 = 0; _i5605 < _a5604.length; _i5605++) {
                            const v_t = _a5604[_i5605];
                            if (!(((_k4990[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a5606 = sp.cellEdges[v_t];
                            for (let _i5607 = 0; _i5607 < _a5606.length; _i5607++) {
                              const v_y = _a5606[_i5607];
                              L5608: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k4990[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm5194[v_y + 1] === 1)))) break L5608;
                                const _t5609 = v_z;
                                if (_g5596.length < 16) { if (!_g5596.includes(_t5609)) _g5596.push(_t5609); } else addOnce(_g5596, _st5603, _t5609);
                              }
                            }
                          }
                        }
                        _gs5595 = _g5596.slice();
                        _memo5594.set(_t5593, _gs5595);
                      }
                      const _a5610 = union(_eg5591.of(_t5590), _gs5595);
                      for (let _i5611 = 0; _i5611 < _a5610.length; _i5611++) {
                        const v_t = _a5610[_i5611];
                        const _t5612 = v_t;
                        if (_g5528.length < 16) { if (!_g5528.includes(_t5612)) _g5528.push(_t5612); } else addOnce(_g5528, _st5567, _t5612);
                      }
                    }
                  }
                  const _a5613 = union(setOf(_t5527), _g5528);
                  for (let _i5614 = 0; _i5614 < _a5613.length; _i5614++) {
                    const v_t = _a5613[_i5614];
                    const _t5615 = v_t;
                    if (_g5441.length < 16) { if (!_g5441.includes(_t5615)) _g5441.push(_t5615); } else addOnce(_g5441, _st5524, _t5615);
                  }
                }
              }
              _c5616 = (union(setOf(v_c), _g5441).length >= _h5199);
            }
            _c5617 = _c5616;
          }
          if (!(_c5617)) continue;
          if (!(true)) continue;
          _l5411 = _a5415;
          _y5412 = true;
          for (const _e5414 of _a5415) _p5410[_e5414] |= 1 << _f5416[_e5414];
        }
      }
      L5618: {
        const v_B = ((((_p5410[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y5412 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L5618;
        if (b.made[0] !== _m277_0 || b.made[1] !== _m280_1) {
          _g5619.length = 0;
          G5620: {
            const _a5623 = sp.edges;
            for (let _i5624 = 0; _i5624 < _a5623.length; _i5624++) {
              const v_e = _a5623[_i5624];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g5619.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g5619))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g5625: number[] = [];
          G5626: {
            const _a5629 = sp.edges;
            for (let _i5630 = 0; _i5630 < _a5629.length; _i5630++) {
              const v_e = _a5629[_i5630];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g5625.push(v_e);
            }
          }
          const _g5631: number[] = [];
          G5632: {
            const _a5674 = sp.edges;
            for (let _i5675 = 0; _i5675 < _a5674.length; _i5675++) {
              const v_e = _a5674[_i5675];
              const _t5676 = sp.edgeEnds[2 * v_e];
              let _q5677 = false;
              Q5678: {
                const _f5680 = new Int32Array(sp.edges.length).fill(-1);
                let _l5681: readonly number[] = [];
                const _s5682: number[] = [];
                const _a5679 = sp.cellEdges[_t5676];
                for (const _e5683 of _l5681) _f5680[_e5683] = -1;
                _l5681 = _a5679;
                let _i5685 = 0;
                _s5682[0] = 0;
                let _o5689 = _a5679.length === 0;
                for (;;) {
                  if (_a5679.length === 0) {
                    if (!_o5689) break;
                    _o5689 = false;
                  }
                  while (_a5679.length > 0 && _i5685 >= 0) {
                    const _e5683 = _a5679[_i5685];
                    if (_s5682[_i5685] > 0) _f5680[_e5683] = -1;
                    let _r5688 = (cands[_e5683] >= 0 ? cands[_e5683] : (cands[_e5683] = b.cands[_e5683])) & ~((2 << _s5682[_i5685]) - 1);
                    let _d5684 = 0;
                    V5687: for (; _r5688 !== 0; _r5688 &= _r5688 - 1) {
                      _d5684 = 31 - Math.clz32(_r5688 & -_r5688);
                      _f5680[_e5683] = _d5684;
                      if (_e5683 === v_e && _d5684 !== 1) continue;
                      for (let _j5686 = 0; _j5686 < _i5685; _j5686++) {
                        const _y5690 = _a5679[_j5686];
                        if (!((((arms(sp, cl, _t5676) === 2) && (_f5680[_e5683] === 1)) && (_f5680[_y5690] === 1)))) continue;
                        if (!((bent(sp, _e5683, _y5690) === (clueAt(cl.piece, _t5676) === 3)))) continue V5687;
                      }
                      break;
                    }
                    if (_r5688 === 0) {
                      _s5682[_i5685] = 0;
                      _i5685--;
                      continue;
                    }
                    _s5682[_i5685] = _d5684;
                    if (_i5685 === _a5679.length - 1) break;
                    _i5685++;
                    _s5682[_i5685] = 0;
                  }
                  if (_i5685 < 0) break;
                  let _g5691 = 0;
                  G5692: {
                    const _a5693 = sp.cellEdges[_t5676];
                    for (let _i5694 = 0; _i5694 < _a5693.length; _i5694++) {
                      const v_x = _a5693[_i5694];
                      if (!((_f5680[v_x] === 1))) continue;
                      _g5691++;
                    }
                  }
                  if (!((_g5691 === arms(sp, cl, _t5676)))) continue;
                  if (true) {
                    _q5677 = true;
                    break Q5678;
                  }
                }
              }
              let _c5714: boolean = _q5677;
              if (_c5714) {
                const _t5695 = sp.edgeEnds[2 * v_e + 1];
                let _q5696 = false;
                Q5697: {
                  const _f5699 = new Int32Array(sp.edges.length).fill(-1);
                  let _l5700: readonly number[] = [];
                  const _s5701: number[] = [];
                  const _a5698 = sp.cellEdges[_t5695];
                  for (const _e5702 of _l5700) _f5699[_e5702] = -1;
                  _l5700 = _a5698;
                  let _i5704 = 0;
                  _s5701[0] = 0;
                  let _o5708 = _a5698.length === 0;
                  for (;;) {
                    if (_a5698.length === 0) {
                      if (!_o5708) break;
                      _o5708 = false;
                    }
                    while (_a5698.length > 0 && _i5704 >= 0) {
                      const _e5702 = _a5698[_i5704];
                      if (_s5701[_i5704] > 0) _f5699[_e5702] = -1;
                      let _r5707 = (cands[_e5702] >= 0 ? cands[_e5702] : (cands[_e5702] = b.cands[_e5702])) & ~((2 << _s5701[_i5704]) - 1);
                      let _d5703 = 0;
                      V5706: for (; _r5707 !== 0; _r5707 &= _r5707 - 1) {
                        _d5703 = 31 - Math.clz32(_r5707 & -_r5707);
                        _f5699[_e5702] = _d5703;
                        if (_e5702 === v_e && _d5703 !== 1) continue;
                        for (let _j5705 = 0; _j5705 < _i5704; _j5705++) {
                          const _y5709 = _a5698[_j5705];
                          if (!((((arms(sp, cl, _t5695) === 2) && (_f5699[_e5702] === 1)) && (_f5699[_y5709] === 1)))) continue;
                          if (!((bent(sp, _e5702, _y5709) === (clueAt(cl.piece, _t5695) === 3)))) continue V5706;
                        }
                        break;
                      }
                      if (_r5707 === 0) {
                        _s5701[_i5704] = 0;
                        _i5704--;
                        continue;
                      }
                      _s5701[_i5704] = _d5703;
                      if (_i5704 === _a5698.length - 1) break;
                      _i5704++;
                      _s5701[_i5704] = 0;
                    }
                    if (_i5704 < 0) break;
                    let _g5710 = 0;
                    G5711: {
                      const _a5712 = sp.cellEdges[_t5695];
                      for (let _i5713 = 0; _i5713 < _a5712.length; _i5713++) {
                        const v_x = _a5712[_i5713];
                        if (!((_f5699[v_x] === 1))) continue;
                        _g5710++;
                      }
                    }
                    if (!((_g5710 === arms(sp, cl, _t5695)))) continue;
                    if (true) {
                      _q5696 = true;
                      break Q5697;
                    }
                  }
                }
                _c5714 = _q5696;
              }
              if (!(_c5714)) continue;
              _g5631.push(v_e);
            }
          }
          const _g5715: number[] = [];
          G5716: {
            const _a5719 = v_U;
            for (let _i5720 = 0; _i5720 < _a5719.length; _i5720++) {
              const v_e = _a5719[_i5720];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g5715.push(v_e);
            }
          }
          const _g5721: number[] = [];
          G5722: {
            const _a5802 = sp.cellEdges[v_c];
            for (let _i5803 = 0; _i5803 < _a5802.length; _i5803++) {
              const v_x = _a5802[_i5803];
              const _t5804 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g5805: number[] = [];
              G5806: {
                const _a5844 = sp.cellEdges[_t5804];
                for (let _i5845 = 0; _i5845 < _a5844.length; _i5845++) {
                  const v_y = _a5844[_i5845];
                  let _c5864: boolean = (v_y !== v_x);
                  if (_c5864) {
                    let _q5846 = false;
                    Q5847: {
                      const _f5849 = new Int32Array(sp.edges.length).fill(-1);
                      let _l5850: readonly number[] = [];
                      const _s5851: number[] = [];
                      const _a5848 = sp.cellEdges[_t5804];
                      for (const _e5852 of _l5850) _f5849[_e5852] = -1;
                      _l5850 = _a5848;
                      let _i5854 = 0;
                      _s5851[0] = 0;
                      let _o5858 = _a5848.length === 0;
                      for (;;) {
                        if (_a5848.length === 0) {
                          if (!_o5858) break;
                          _o5858 = false;
                        }
                        while (_a5848.length > 0 && _i5854 >= 0) {
                          const _e5852 = _a5848[_i5854];
                          if (_s5851[_i5854] > 0) _f5849[_e5852] = -1;
                          let _r5857 = (cands[_e5852] >= 0 ? cands[_e5852] : (cands[_e5852] = b.cands[_e5852])) & ~((2 << _s5851[_i5854]) - 1);
                          let _d5853 = 0;
                          V5856: for (; _r5857 !== 0; _r5857 &= _r5857 - 1) {
                            _d5853 = 31 - Math.clz32(_r5857 & -_r5857);
                            _f5849[_e5852] = _d5853;
                            if (_e5852 === v_x && _d5853 !== 1) continue;
                            if (_e5852 === v_y && _d5853 !== 1) continue;
                            for (let _j5855 = 0; _j5855 < _i5854; _j5855++) {
                              const _y5859 = _a5848[_j5855];
                              if (!((((arms(sp, cl, _t5804) === 2) && (_f5849[_e5852] === 1)) && (_f5849[_y5859] === 1)))) continue;
                              if (!((bent(sp, _e5852, _y5859) === (clueAt(cl.piece, _t5804) === 3)))) continue V5856;
                            }
                            break;
                          }
                          if (_r5857 === 0) {
                            _s5851[_i5854] = 0;
                            _i5854--;
                            continue;
                          }
                          _s5851[_i5854] = _d5853;
                          if (_i5854 === _a5848.length - 1) break;
                          _i5854++;
                          _s5851[_i5854] = 0;
                        }
                        if (_i5854 < 0) break;
                        let _g5860 = 0;
                        G5861: {
                          const _a5862 = sp.cellEdges[_t5804];
                          for (let _i5863 = 0; _i5863 < _a5862.length; _i5863++) {
                            const v_z = _a5862[_i5863];
                            if (!((_f5849[v_z] === 1))) continue;
                            _g5860++;
                          }
                        }
                        if (!((_g5860 === arms(sp, cl, _t5804)))) continue;
                        if (true) {
                          _q5846 = true;
                          break Q5847;
                        }
                      }
                    }
                    _c5864 = _q5846;
                  }
                  if (!(_c5864)) continue;
                  const _t5865 = (sp.edgeEnds[2 * v_y] === _t5804 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t5866 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t5804]);
                  const _g5867: number[] = [];
                  G5868: {
                    const _a5874 = through(sp, _t5865, _t5866);
                    for (let _i5875 = 0; _i5875 < _a5874.length; _i5875++) {
                      const v_t = _a5874[_i5875];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a5876 = sp.cellEdges[v_t];
                      for (let _i5877 = 0; _i5877 < _a5876.length; _i5877++) {
                        const v_y = _a5876[_i5877];
                        L5878: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L5878;
                          if (!_g5867.includes(v_z)) _g5867.push(v_z);
                        }
                      }
                    }
                  }
                  const _a5879 = union(through(sp, _t5865, _t5866), _g5867);
                  for (let _i5880 = 0; _i5880 < _a5879.length; _i5880++) {
                    const v_t = _a5879[_i5880];
                    if (!_g5805.includes(v_t)) _g5805.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t5804), _g5805)).length >= sp.cells.length))) continue;
              _g5721.push(v_x);
            }
          }
          let _q5881 = false;
          Q5882: {
            const _f5884 = new Int32Array(sp.edges.length).fill(-1);
            let _l5885: readonly number[] = [];
            const _s5886: number[] = [];
            const _a5883 = sp.cellEdges[v_c];
            for (const _e5887 of _l5885) _f5884[_e5887] = -1;
            _l5885 = _a5883;
            let _i5889 = 0;
            _s5886[0] = 0;
            let _o5893 = _a5883.length === 0;
            for (;;) {
              if (_a5883.length === 0) {
                if (!_o5893) break;
                _o5893 = false;
              }
              while (_a5883.length > 0 && _i5889 >= 0) {
                const _e5887 = _a5883[_i5889];
                if (_s5886[_i5889] > 0) _f5884[_e5887] = -1;
                let _r5892 = (cands[_e5887] >= 0 ? cands[_e5887] : (cands[_e5887] = b.cands[_e5887])) & ~((2 << _s5886[_i5889]) - 1);
                let _d5888 = 0;
                V5891: for (; _r5892 !== 0; _r5892 &= _r5892 - 1) {
                  _d5888 = 31 - Math.clz32(_r5892 & -_r5892);
                  _f5884[_e5887] = _d5888;
                  if (_e5887 === v_e && _d5888 !== 1) continue;
                  for (let _j5890 = 0; _j5890 < _i5889; _j5890++) {
                    const _y5894 = _a5883[_j5890];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f5884[_e5887] === 1)) && (_f5884[_y5894] === 1)))) continue;
                    if (!((bent(sp, _e5887, _y5894) === (clueAt(cl.piece, v_c) === 3)))) continue V5891;
                  }
                  for (let _j5890 = 0; _j5890 < _i5889; _j5890++) {
                    const _y5895 = _a5883[_j5890];
                    if (!(((((_f5884[_e5887] === 1) && (_f5884[_y5895] === 1)) && !((b.grid[_e5887] !== 0))) && !((b.grid[_y5895] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e5887] === v_c ? sp.edgeEnds[2 * _e5887 + 1] : sp.edgeEnds[2 * _e5887]), v_L).includes((sp.edgeEnds[2 * _y5895] === v_c ? sp.edgeEnds[2 * _y5895 + 1] : sp.edgeEnds[2 * _y5895]))))) continue V5891;
                  }
                  break;
                }
                if (_r5892 === 0) {
                  _s5886[_i5889] = 0;
                  _i5889--;
                  continue;
                }
                _s5886[_i5889] = _d5888;
                if (_i5889 === _a5883.length - 1) break;
                _i5889++;
                _s5886[_i5889] = 0;
              }
              if (_i5889 < 0) break;
              let _g5896 = 0;
              G5897: {
                const _a5898 = sp.cellEdges[v_c];
                for (let _i5899 = 0; _i5899 < _a5898.length; _i5899++) {
                  const v_x = _a5898[_i5899];
                  if (!((_f5884[v_x] === 1))) continue;
                  _g5896++;
                }
              }
              let _c5904: boolean = (_g5896 === arms(sp, cl, v_c));
              if (_c5904) {
                let _q5900 = true;
                Q5901: {
                  const _a5902 = sp.cellEdges[v_c];
                  for (let _i5903 = 0; _i5903 < _a5902.length; _i5903++) {
                    const v_x = _a5902[_i5903];
                    if (!(((_f5884[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5027.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q5900 = false;
                      break Q5901;
                    }
                  }
                }
                _c5904 = _q5900;
              }
              let _c6074: boolean = _c5904;
              if (_c6074) {
                let _q5905 = false;
                Q5906: {
                  const _a5907 = sp.cellEdges[v_c];
                  for (let _i5908 = 0; _i5908 < _a5907.length; _i5908++) {
                    const v_x = _a5907[_i5908];
                    if (!((_f5884[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q5905 = true;
                      break Q5906;
                    }
                  }
                }
                let _c6073: boolean = _q5905;
                if (!_c6073) {
                  const _g5909: number[] = [];
                  G5910: {
                    const _a5992 = sp.cellEdges[v_c];
                    for (let _i5993 = 0; _i5993 < _a5992.length; _i5993++) {
                      const v_x = _a5992[_i5993];
                      if (!((_f5884[v_x] === 1))) continue;
                      const _t5994 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g5995: number[] = [];
                      G5996: {
                        const _a6034 = sp.cellEdges[_t5994];
                        for (let _i6035 = 0; _i6035 < _a6034.length; _i6035++) {
                          const v_y = _a6034[_i6035];
                          let _c6054: boolean = (v_y !== v_x);
                          if (_c6054) {
                            let _q6036 = false;
                            Q6037: {
                              const _f6039 = new Int32Array(sp.edges.length).fill(-1);
                              let _l6040: readonly number[] = [];
                              const _s6041: number[] = [];
                              const _a6038 = sp.cellEdges[_t5994];
                              for (const _e6042 of _l6040) _f6039[_e6042] = -1;
                              _l6040 = _a6038;
                              let _i6044 = 0;
                              _s6041[0] = 0;
                              let _o6048 = _a6038.length === 0;
                              for (;;) {
                                if (_a6038.length === 0) {
                                  if (!_o6048) break;
                                  _o6048 = false;
                                }
                                while (_a6038.length > 0 && _i6044 >= 0) {
                                  const _e6042 = _a6038[_i6044];
                                  if (_s6041[_i6044] > 0) _f6039[_e6042] = -1;
                                  let _r6047 = (cands[_e6042] >= 0 ? cands[_e6042] : (cands[_e6042] = b.cands[_e6042])) & ~((2 << _s6041[_i6044]) - 1);
                                  let _d6043 = 0;
                                  V6046: for (; _r6047 !== 0; _r6047 &= _r6047 - 1) {
                                    _d6043 = 31 - Math.clz32(_r6047 & -_r6047);
                                    _f6039[_e6042] = _d6043;
                                    if (_e6042 === v_x && _d6043 !== 1) continue;
                                    if (_e6042 === v_y && _d6043 !== 1) continue;
                                    for (let _j6045 = 0; _j6045 < _i6044; _j6045++) {
                                      const _y6049 = _a6038[_j6045];
                                      if (!((((arms(sp, cl, _t5994) === 2) && (_f6039[_e6042] === 1)) && (_f6039[_y6049] === 1)))) continue;
                                      if (!((bent(sp, _e6042, _y6049) === (clueAt(cl.piece, _t5994) === 3)))) continue V6046;
                                    }
                                    break;
                                  }
                                  if (_r6047 === 0) {
                                    _s6041[_i6044] = 0;
                                    _i6044--;
                                    continue;
                                  }
                                  _s6041[_i6044] = _d6043;
                                  if (_i6044 === _a6038.length - 1) break;
                                  _i6044++;
                                  _s6041[_i6044] = 0;
                                }
                                if (_i6044 < 0) break;
                                let _g6050 = 0;
                                G6051: {
                                  const _a6052 = sp.cellEdges[_t5994];
                                  for (let _i6053 = 0; _i6053 < _a6052.length; _i6053++) {
                                    const v_z = _a6052[_i6053];
                                    if (!((_f6039[v_z] === 1))) continue;
                                    _g6050++;
                                  }
                                }
                                if (!((_g6050 === arms(sp, cl, _t5994)))) continue;
                                if (true) {
                                  _q6036 = true;
                                  break Q6037;
                                }
                              }
                            }
                            _c6054 = _q6036;
                          }
                          if (!(_c6054)) continue;
                          const _t6055 = (sp.edgeEnds[2 * v_y] === _t5994 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6056 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t5994]);
                          const _g6057: number[] = [];
                          G6058: {
                            const _a6064 = through(sp, _t6055, _t6056);
                            for (let _i6065 = 0; _i6065 < _a6064.length; _i6065++) {
                              const v_t = _a6064[_i6065];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a6066 = sp.cellEdges[v_t];
                              for (let _i6067 = 0; _i6067 < _a6066.length; _i6067++) {
                                const v_y = _a6066[_i6067];
                                L6068: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L6068;
                                  if (!_g6057.includes(v_z)) _g6057.push(v_z);
                                }
                              }
                            }
                          }
                          const _a6069 = union(through(sp, _t6055, _t6056), _g6057);
                          for (let _i6070 = 0; _i6070 < _a6069.length; _i6070++) {
                            const v_t = _a6069[_i6070];
                            if (!_g5995.includes(v_t)) _g5995.push(v_t);
                          }
                        }
                      }
                      const _a6071 = union(setOf(_t5994), _g5995);
                      for (let _i6072 = 0; _i6072 < _a6071.length; _i6072++) {
                        const v_t = _a6071[_i6072];
                        if (!_g5909.includes(v_t)) _g5909.push(v_t);
                      }
                    }
                  }
                  _c6073 = (union(setOf(v_c), _g5909).length >= sp.cells.length);
                }
                _c6074 = _c6073;
              }
              if (!(_c6074)) continue;
              if (true) {
                _q5881 = true;
                break Q5882;
              }
            }
          }
          let _q6075 = false;
          Q6076: {
            const _f6078 = new Int32Array(sp.edges.length).fill(-1);
            let _l6079: readonly number[] = [];
            const _s6080: number[] = [];
            const _a6077 = sp.cellEdges[v_c];
            for (const _e6081 of _l6079) _f6078[_e6081] = -1;
            _l6079 = _a6077;
            let _i6083 = 0;
            _s6080[0] = 0;
            let _o6087 = _a6077.length === 0;
            for (;;) {
              if (_a6077.length === 0) {
                if (!_o6087) break;
                _o6087 = false;
              }
              while (_a6077.length > 0 && _i6083 >= 0) {
                const _e6081 = _a6077[_i6083];
                if (_s6080[_i6083] > 0) _f6078[_e6081] = -1;
                let _r6086 = (cands[_e6081] >= 0 ? cands[_e6081] : (cands[_e6081] = b.cands[_e6081])) & ~((2 << _s6080[_i6083]) - 1);
                let _d6082 = 0;
                V6085: for (; _r6086 !== 0; _r6086 &= _r6086 - 1) {
                  _d6082 = 31 - Math.clz32(_r6086 & -_r6086);
                  _f6078[_e6081] = _d6082;
                  if (_e6081 === v_e && _d6082 !== 2) continue;
                  for (let _j6084 = 0; _j6084 < _i6083; _j6084++) {
                    const _y6088 = _a6077[_j6084];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f6078[_e6081] === 1)) && (_f6078[_y6088] === 1)))) continue;
                    if (!((bent(sp, _e6081, _y6088) === (clueAt(cl.piece, v_c) === 3)))) continue V6085;
                  }
                  for (let _j6084 = 0; _j6084 < _i6083; _j6084++) {
                    const _y6089 = _a6077[_j6084];
                    if (!(((((_f6078[_e6081] === 1) && (_f6078[_y6089] === 1)) && !((b.grid[_e6081] !== 0))) && !((b.grid[_y6089] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e6081] === v_c ? sp.edgeEnds[2 * _e6081 + 1] : sp.edgeEnds[2 * _e6081]), v_L).includes((sp.edgeEnds[2 * _y6089] === v_c ? sp.edgeEnds[2 * _y6089 + 1] : sp.edgeEnds[2 * _y6089]))))) continue V6085;
                  }
                  break;
                }
                if (_r6086 === 0) {
                  _s6080[_i6083] = 0;
                  _i6083--;
                  continue;
                }
                _s6080[_i6083] = _d6082;
                if (_i6083 === _a6077.length - 1) break;
                _i6083++;
                _s6080[_i6083] = 0;
              }
              if (_i6083 < 0) break;
              let _g6090 = 0;
              G6091: {
                const _a6092 = sp.cellEdges[v_c];
                for (let _i6093 = 0; _i6093 < _a6092.length; _i6093++) {
                  const v_x = _a6092[_i6093];
                  if (!((_f6078[v_x] === 1))) continue;
                  _g6090++;
                }
              }
              let _c6098: boolean = (_g6090 === arms(sp, cl, v_c));
              if (_c6098) {
                let _q6094 = true;
                Q6095: {
                  const _a6096 = sp.cellEdges[v_c];
                  for (let _i6097 = 0; _i6097 < _a6096.length; _i6097++) {
                    const v_x = _a6096[_i6097];
                    if (!(((_f6078[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5027.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q6094 = false;
                      break Q6095;
                    }
                  }
                }
                _c6098 = _q6094;
              }
              let _c6268: boolean = _c6098;
              if (_c6268) {
                let _q6099 = false;
                Q6100: {
                  const _a6101 = sp.cellEdges[v_c];
                  for (let _i6102 = 0; _i6102 < _a6101.length; _i6102++) {
                    const v_x = _a6101[_i6102];
                    if (!((_f6078[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q6099 = true;
                      break Q6100;
                    }
                  }
                }
                let _c6267: boolean = _q6099;
                if (!_c6267) {
                  const _g6103: number[] = [];
                  G6104: {
                    const _a6186 = sp.cellEdges[v_c];
                    for (let _i6187 = 0; _i6187 < _a6186.length; _i6187++) {
                      const v_x = _a6186[_i6187];
                      if (!((_f6078[v_x] === 1))) continue;
                      const _t6188 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g6189: number[] = [];
                      G6190: {
                        const _a6228 = sp.cellEdges[_t6188];
                        for (let _i6229 = 0; _i6229 < _a6228.length; _i6229++) {
                          const v_y = _a6228[_i6229];
                          let _c6248: boolean = (v_y !== v_x);
                          if (_c6248) {
                            let _q6230 = false;
                            Q6231: {
                              const _f6233 = new Int32Array(sp.edges.length).fill(-1);
                              let _l6234: readonly number[] = [];
                              const _s6235: number[] = [];
                              const _a6232 = sp.cellEdges[_t6188];
                              for (const _e6236 of _l6234) _f6233[_e6236] = -1;
                              _l6234 = _a6232;
                              let _i6238 = 0;
                              _s6235[0] = 0;
                              let _o6242 = _a6232.length === 0;
                              for (;;) {
                                if (_a6232.length === 0) {
                                  if (!_o6242) break;
                                  _o6242 = false;
                                }
                                while (_a6232.length > 0 && _i6238 >= 0) {
                                  const _e6236 = _a6232[_i6238];
                                  if (_s6235[_i6238] > 0) _f6233[_e6236] = -1;
                                  let _r6241 = (cands[_e6236] >= 0 ? cands[_e6236] : (cands[_e6236] = b.cands[_e6236])) & ~((2 << _s6235[_i6238]) - 1);
                                  let _d6237 = 0;
                                  V6240: for (; _r6241 !== 0; _r6241 &= _r6241 - 1) {
                                    _d6237 = 31 - Math.clz32(_r6241 & -_r6241);
                                    _f6233[_e6236] = _d6237;
                                    if (_e6236 === v_x && _d6237 !== 1) continue;
                                    if (_e6236 === v_y && _d6237 !== 1) continue;
                                    for (let _j6239 = 0; _j6239 < _i6238; _j6239++) {
                                      const _y6243 = _a6232[_j6239];
                                      if (!((((arms(sp, cl, _t6188) === 2) && (_f6233[_e6236] === 1)) && (_f6233[_y6243] === 1)))) continue;
                                      if (!((bent(sp, _e6236, _y6243) === (clueAt(cl.piece, _t6188) === 3)))) continue V6240;
                                    }
                                    break;
                                  }
                                  if (_r6241 === 0) {
                                    _s6235[_i6238] = 0;
                                    _i6238--;
                                    continue;
                                  }
                                  _s6235[_i6238] = _d6237;
                                  if (_i6238 === _a6232.length - 1) break;
                                  _i6238++;
                                  _s6235[_i6238] = 0;
                                }
                                if (_i6238 < 0) break;
                                let _g6244 = 0;
                                G6245: {
                                  const _a6246 = sp.cellEdges[_t6188];
                                  for (let _i6247 = 0; _i6247 < _a6246.length; _i6247++) {
                                    const v_z = _a6246[_i6247];
                                    if (!((_f6233[v_z] === 1))) continue;
                                    _g6244++;
                                  }
                                }
                                if (!((_g6244 === arms(sp, cl, _t6188)))) continue;
                                if (true) {
                                  _q6230 = true;
                                  break Q6231;
                                }
                              }
                            }
                            _c6248 = _q6230;
                          }
                          if (!(_c6248)) continue;
                          const _t6249 = (sp.edgeEnds[2 * v_y] === _t6188 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6250 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t6188]);
                          const _g6251: number[] = [];
                          G6252: {
                            const _a6258 = through(sp, _t6249, _t6250);
                            for (let _i6259 = 0; _i6259 < _a6258.length; _i6259++) {
                              const v_t = _a6258[_i6259];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a6260 = sp.cellEdges[v_t];
                              for (let _i6261 = 0; _i6261 < _a6260.length; _i6261++) {
                                const v_y = _a6260[_i6261];
                                L6262: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L6262;
                                  if (!_g6251.includes(v_z)) _g6251.push(v_z);
                                }
                              }
                            }
                          }
                          const _a6263 = union(through(sp, _t6249, _t6250), _g6251);
                          for (let _i6264 = 0; _i6264 < _a6263.length; _i6264++) {
                            const v_t = _a6263[_i6264];
                            if (!_g6189.includes(v_t)) _g6189.push(v_t);
                          }
                        }
                      }
                      const _a6265 = union(setOf(_t6188), _g6189);
                      for (let _i6266 = 0; _i6266 < _a6265.length; _i6266++) {
                        const v_t = _a6265[_i6266];
                        if (!_g6103.includes(v_t)) _g6103.push(v_t);
                      }
                    }
                  }
                  _c6267 = (union(setOf(v_c), _g6103).length >= sp.cells.length);
                }
                _c6268 = _c6267;
              }
              if (!(_c6268)) continue;
              if (true) {
                _q6075 = true;
                break Q6076;
              }
            }
          }
          freshBinding("sealNote", [sameSet(v_L, _g5625), sameSet(v_U, _g5631), sameSet(v_P, _g5715), (sp.cells.includes(v_c)), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g5721), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q5881), (v_B === _q6075), (!(v_A) || !(v_B))], ["L =", "U =", "P =", "c in", "G =", "K =", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c6270: boolean = (v_A || v_B);
        if (_c6270) {
          let _c6269: boolean = !(!(v_A));
          if (!_c6269) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c6269 = true;
          }
          _c6270 = _c6269;
        }
        let _c6272: boolean = _c6270;
        if (_c6272) {
          let _c6271: boolean = !(!(v_B));
          if (!_c6271) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c6271 = true;
          }
          _c6272 = _c6271;
        }
        if (!(_c6272)) return -1;
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
let _f7570 = new Int32Array(0);
let _l7571: readonly number[] = [];
let _f7590 = new Int32Array(0);
let _l7591: readonly number[] = [];
const _st7746 = stamps();
let _f7752 = new Int32Array(0);
let _l7753: readonly number[] = [];
const _st7783 = stamps();
let _p8041 = new Int32Array(0);
let _l8042: readonly number[] = [];
let _f8047 = new Int32Array(0);
let _l8048: readonly number[] = [];
const _st8155 = stamps();
const _st8198 = stamps();
let _f8204 = new Int32Array(0);
let _l8205: readonly number[] = [];
const _st8234 = stamps();
let _f8268 = new Int32Array(0);
let _l8269: readonly number[] = [];
let _p8542 = new Int32Array(0);
let _l8543: readonly number[] = [];
let _f8548 = new Int32Array(0);
let _l8549: readonly number[] = [];
const _st8656 = stamps();
const _st8699 = stamps();
let _f8705 = new Int32Array(0);
let _l8706: readonly number[] = [];
const _st8735 = stamps();
let _f8769 = new Int32Array(0);
let _l8770: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandLockBinding> | null): number {
  const _g7515: number[] = [];
  const _g7521: number[] = [];
  if (_f7570.length < sp.edges.length) _f7570 = new Int32Array(sp.edges.length).fill(-1);
  else _f7570.fill(-1);
  _l7571 = [];
  const _s7572: number[] = [];
  if (_f7590.length < sp.edges.length) _f7590 = new Int32Array(sp.edges.length).fill(-1);
  else _f7590.fill(-1);
  _l7591 = [];
  const _s7592: number[] = [];
  const _g7606: number[] = [];
  const _g7614: number[] = [];
  const _g7623: number[] = [];
  const _g7707: number[] = [];
  if (_f7752.length < sp.edges.length) _f7752 = new Int32Array(sp.edges.length).fill(-1);
  else _f7752.fill(-1);
  _l7753 = [];
  const _s7754: number[] = [];
  const _g7776: number[] = [];
  const _g7795: number[] = [];
  if (_p8041.length < sp.edges.length) _p8041 = new Int32Array(sp.edges.length);
  else _p8041.fill(0);
  _l8042 = [];
  let _y8043 = false;
  if (_f8047.length < sp.edges.length) _f8047 = new Int32Array(sp.edges.length).fill(-1);
  else _f8047.fill(-1);
  _l8048 = [];
  const _s8049: number[] = [];
  const _g8072: number[] = [];
  const _g8159: number[] = [];
  if (_f8204.length < sp.edges.length) _f8204 = new Int32Array(sp.edges.length).fill(-1);
  else _f8204.fill(-1);
  _l8205 = [];
  const _s8206: number[] = [];
  const _g8227: number[] = [];
  const _g8251: number[] = [];
  if (_f8268.length < sp.edges.length) _f8268 = new Int32Array(sp.edges.length).fill(-1);
  else _f8268.fill(-1);
  _l8269 = [];
  const _s8270: number[] = [];
  const _g8296: number[] = [];
  if (_p8542.length < sp.edges.length) _p8542 = new Int32Array(sp.edges.length);
  else _p8542.fill(0);
  _l8543 = [];
  let _y8544 = false;
  if (_f8548.length < sp.edges.length) _f8548 = new Int32Array(sp.edges.length).fill(-1);
  else _f8548.fill(-1);
  _l8549 = [];
  const _s8550: number[] = [];
  const _g8573: number[] = [];
  const _g8660: number[] = [];
  if (_f8705.length < sp.edges.length) _f8705 = new Int32Array(sp.edges.length).fill(-1);
  else _f8705.fill(-1);
  _l8706 = [];
  const _s8707: number[] = [];
  const _g8728: number[] = [];
  const _g8752: number[] = [];
  if (_f8769.length < sp.edges.length) _f8769 = new Int32Array(sp.edges.length).fill(-1);
  else _f8769.fill(-1);
  _l8770 = [];
  const _s8771: number[] = [];
  const _g8802: number[] = [];
  const facts = strandLockFacts;
  let fired = 0;
  let changed = false;
  const _k7581 = armsKept.board(cl);
  const _h7794 = sp.cells.length;
  let _epoch = 0;
  if (strandLockCands.length < sp.edges.length) strandLockCands = new Int32Array(sp.edges.length);
  const cands = strandLockCands;
  cands.fill(-1);
  const _m394_0 = b.made[0];
  _g7515.length = 0;
  G7516: {
    const _a7519 = sp.edges;
    for (let _i7520 = 0; _i7520 < _a7519.length; _i7520++) {
      const v_e = _a7519[_i7520];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g7515.push(v_e);
    }
  }
  const v_L = _g7515;
  const _m397_1 = b.made[1];
  const _eg7622 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g7521.length = 0;
  G7522: {
    const _a7564 = sp.edges;
    for (let _i7565 = 0; _i7565 < _a7564.length; _i7565++) {
      const v_e = _a7564[_i7565];
      const _t7566 = sp.edgeEnds[2 * v_e];
      let _q7567 = false;
      Q7568: {
        const _a7569 = sp.cellEdges[_t7566];
        for (const _e7573 of _l7571) _f7570[_e7573] = -1;
        _l7571 = _a7569;
        let _i7575 = 0;
        _s7572[0] = 0;
        let _o7579 = _a7569.length === 0;
        for (;;) {
          if (_a7569.length === 0) {
            if (!_o7579) break;
            _o7579 = false;
          }
          while (_a7569.length > 0 && _i7575 >= 0) {
            const _e7573 = _a7569[_i7575];
            if (_s7572[_i7575] > 0) _f7570[_e7573] = -1;
            let _r7578 = (cands[_e7573] >= 0 ? cands[_e7573] : (cands[_e7573] = b.cands[_e7573])) & ~((2 << _s7572[_i7575]) - 1);
            let _d7574 = 0;
            V7577: for (; _r7578 !== 0; _r7578 &= _r7578 - 1) {
              _d7574 = 31 - Math.clz32(_r7578 & -_r7578);
              _f7570[_e7573] = _d7574;
              if (_e7573 === v_e && _d7574 !== 1) continue;
              for (let _j7576 = 0; _j7576 < _i7575; _j7576++) {
                const _y7580 = _a7569[_j7576];
                if (!(((((_k7581[_t7566] ?? arms(sp, cl, _t7566)) === 2) && (_f7570[_e7573] === 1)) && (_f7570[_y7580] === 1)))) continue;
                if (!((bent(sp, _e7573, _y7580) === (clueAt(cl.piece, _t7566) === 3)))) continue V7577;
              }
              break;
            }
            if (_r7578 === 0) {
              _s7572[_i7575] = 0;
              _i7575--;
              continue;
            }
            _s7572[_i7575] = _d7574;
            if (_i7575 === _a7569.length - 1) break;
            _i7575++;
            _s7572[_i7575] = 0;
          }
          if (_i7575 < 0) break;
          let _g7582 = 0;
          G7583: {
            const _a7584 = sp.cellEdges[_t7566];
            for (let _i7585 = 0; _i7585 < _a7584.length; _i7585++) {
              const v_x = _a7584[_i7585];
              if (!((_f7570[v_x] === 1))) continue;
              _g7582++;
            }
          }
          if (!((_g7582 === (_k7581[_t7566] ?? arms(sp, cl, _t7566))))) continue;
          if (true) {
            _q7567 = true;
            break Q7568;
          }
        }
      }
      let _c7605: boolean = _q7567;
      if (_c7605) {
        const _t7586 = sp.edgeEnds[2 * v_e + 1];
        let _q7587 = false;
        Q7588: {
          const _a7589 = sp.cellEdges[_t7586];
          for (const _e7593 of _l7591) _f7590[_e7593] = -1;
          _l7591 = _a7589;
          let _i7595 = 0;
          _s7592[0] = 0;
          let _o7599 = _a7589.length === 0;
          for (;;) {
            if (_a7589.length === 0) {
              if (!_o7599) break;
              _o7599 = false;
            }
            while (_a7589.length > 0 && _i7595 >= 0) {
              const _e7593 = _a7589[_i7595];
              if (_s7592[_i7595] > 0) _f7590[_e7593] = -1;
              let _r7598 = (cands[_e7593] >= 0 ? cands[_e7593] : (cands[_e7593] = b.cands[_e7593])) & ~((2 << _s7592[_i7595]) - 1);
              let _d7594 = 0;
              V7597: for (; _r7598 !== 0; _r7598 &= _r7598 - 1) {
                _d7594 = 31 - Math.clz32(_r7598 & -_r7598);
                _f7590[_e7593] = _d7594;
                if (_e7593 === v_e && _d7594 !== 1) continue;
                for (let _j7596 = 0; _j7596 < _i7595; _j7596++) {
                  const _y7600 = _a7589[_j7596];
                  if (!(((((_k7581[_t7586] ?? arms(sp, cl, _t7586)) === 2) && (_f7590[_e7593] === 1)) && (_f7590[_y7600] === 1)))) continue;
                  if (!((bent(sp, _e7593, _y7600) === (clueAt(cl.piece, _t7586) === 3)))) continue V7597;
                }
                break;
              }
              if (_r7598 === 0) {
                _s7592[_i7595] = 0;
                _i7595--;
                continue;
              }
              _s7592[_i7595] = _d7594;
              if (_i7595 === _a7589.length - 1) break;
              _i7595++;
              _s7592[_i7595] = 0;
            }
            if (_i7595 < 0) break;
            let _g7601 = 0;
            G7602: {
              const _a7603 = sp.cellEdges[_t7586];
              for (let _i7604 = 0; _i7604 < _a7603.length; _i7604++) {
                const v_x = _a7603[_i7604];
                if (!((_f7590[v_x] === 1))) continue;
                _g7601++;
              }
            }
            if (!((_g7601 === (_k7581[_t7586] ?? arms(sp, cl, _t7586))))) continue;
            if (true) {
              _q7587 = true;
              break Q7588;
            }
          }
        }
        _c7605 = _q7587;
      }
      if (!(_c7605)) continue;
      _g7521.push(v_e);
    }
  }
  const v_U = _g7521;
  const _mm7789 = memberMarks(v_U);
  _g7606.length = 0;
  G7607: {
    const _a7610 = v_U;
    for (let _i7611 = 0; _i7611 < _a7610.length; _i7611++) {
      const v_e = _a7610[_i7611];
      if (!((((_k7581[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k7581[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g7606.push(v_e);
    }
  }
  const v_P = _g7606;
  const _a7612 = sp.cells;
  for (let _i7613 = 0; _i7613 < _a7612.length; _i7613++) {
    const v_c = _a7612[_i7613];
    const _h7768 = minus(v_P, sp.cellEdges[v_c]);
    _g7614.length = 0;
    G7615: {
      const _a7618 = sp.cellEdges[v_c];
      for (let _i7619 = 0; _i7619 < _a7618.length; _i7619++) {
        const v_e = _a7618[_i7619];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g7614.push(v_e);
      }
    }
    L7620: {
      const v_F = _g7614;
      const _h7621 = v_F.length;
      if (!((_h7621 > 0))) break L7620;
      const v_G = _eg7622.of(v_c);
      _g7623.length = 0;
      G7624: {
        const _a7704 = sp.cellEdges[v_c];
        for (let _i7705 = 0; _i7705 < _a7704.length; _i7705++) {
          const v_x = _a7704[_i7705];
          const _t7706 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          const _h7769 = minus(_h7768, sp.cellEdges[_t7706]);
          const _eg7771 = edgeGroups(sp, _h7769);
          const _memo7774 = new Map<readonly number[], readonly number[]>();
          _g7707.length = 0;
          _st7746.pass++;
          G7708: {
            const _a7747 = sp.cellEdges[_t7706];
            for (let _i7748 = 0; _i7748 < _a7747.length; _i7748++) {
              const v_y = _a7747[_i7748];
              let _c7767: boolean = (v_y !== v_x);
              if (_c7767) {
                let _q7749 = false;
                Q7750: {
                  const _a7751 = sp.cellEdges[_t7706];
                  for (const _e7755 of _l7753) _f7752[_e7755] = -1;
                  _l7753 = _a7751;
                  let _i7757 = 0;
                  _s7754[0] = 0;
                  let _o7761 = _a7751.length === 0;
                  for (;;) {
                    if (_a7751.length === 0) {
                      if (!_o7761) break;
                      _o7761 = false;
                    }
                    while (_a7751.length > 0 && _i7757 >= 0) {
                      const _e7755 = _a7751[_i7757];
                      if (_s7754[_i7757] > 0) _f7752[_e7755] = -1;
                      let _r7760 = (cands[_e7755] >= 0 ? cands[_e7755] : (cands[_e7755] = b.cands[_e7755])) & ~((2 << _s7754[_i7757]) - 1);
                      let _d7756 = 0;
                      V7759: for (; _r7760 !== 0; _r7760 &= _r7760 - 1) {
                        _d7756 = 31 - Math.clz32(_r7760 & -_r7760);
                        _f7752[_e7755] = _d7756;
                        if (_e7755 === v_x && _d7756 !== 1) continue;
                        if (_e7755 === v_y && _d7756 !== 1) continue;
                        for (let _j7758 = 0; _j7758 < _i7757; _j7758++) {
                          const _y7762 = _a7751[_j7758];
                          if (!(((((_k7581[_t7706] ?? arms(sp, cl, _t7706)) === 2) && (_f7752[_e7755] === 1)) && (_f7752[_y7762] === 1)))) continue;
                          if (!((bent(sp, _e7755, _y7762) === (clueAt(cl.piece, _t7706) === 3)))) continue V7759;
                        }
                        break;
                      }
                      if (_r7760 === 0) {
                        _s7754[_i7757] = 0;
                        _i7757--;
                        continue;
                      }
                      _s7754[_i7757] = _d7756;
                      if (_i7757 === _a7751.length - 1) break;
                      _i7757++;
                      _s7754[_i7757] = 0;
                    }
                    if (_i7757 < 0) break;
                    let _g7763 = 0;
                    G7764: {
                      const _a7765 = sp.cellEdges[_t7706];
                      for (let _i7766 = 0; _i7766 < _a7765.length; _i7766++) {
                        const v_z = _a7765[_i7766];
                        if (!((_f7752[v_z] === 1))) continue;
                        _g7763++;
                      }
                    }
                    if (!((_g7763 === (_k7581[_t7706] ?? arms(sp, cl, _t7706))))) continue;
                    if (true) {
                      _q7749 = true;
                      break Q7750;
                    }
                  }
                }
                _c7767 = _q7749;
              }
              if (!(_c7767)) continue;
              const _t7770 = (sp.edgeEnds[2 * v_y] === _t7706 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t7773 = _eg7771.of(_t7770);
              let _gs7775 = _memo7774.get(_t7773);
              if (_gs7775 === undefined) {
                _g7776.length = 0;
                _st7783.pass++;
                G7777: {
                  const _a7784 = _t7773;
                  for (let _i7785 = 0; _i7785 < _a7784.length; _i7785++) {
                    const v_t = _a7784[_i7785];
                    if (!(((_k7581[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                    const _a7786 = sp.cellEdges[v_t];
                    for (let _i7787 = 0; _i7787 < _a7786.length; _i7787++) {
                      const v_y = _a7786[_i7787];
                      L7788: {
                        const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                        if (!((((_k7581[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7789[v_y + 1] === 1)))) break L7788;
                        const _t7790 = v_z;
                        if (_g7776.length < 16) { if (!_g7776.includes(_t7790)) _g7776.push(_t7790); } else addOnce(_g7776, _st7783, _t7790);
                      }
                    }
                  }
                }
                _gs7775 = _g7776.slice();
                _memo7774.set(_t7773, _gs7775);
              }
              const _a7791 = union(_eg7771.of(_t7770), _gs7775);
              for (let _i7792 = 0; _i7792 < _a7791.length; _i7792++) {
                const v_t = _a7791[_i7792];
                const _t7793 = v_t;
                if (_g7707.length < 16) { if (!_g7707.includes(_t7793)) _g7707.push(_t7793); } else addOnce(_g7707, _st7746, _t7793);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t7706), _g7707)).length >= _h7794))) continue;
          _g7623.push(v_x);
        }
      }
      const v_K = _g7623;
      let _g8044 = -1;
      let _g8545 = -1;
      _g7795.length = 0;
      G7796: {
        const _a8039 = v_F;
        for (let _i8040 = 0; _i8040 < _a8039.length; _i8040++) {
          const v_e = _a8039[_i8040];
          if (_g8044 !== _epoch) {
            _g8044 = _epoch;
            for (const _e8045 of _l8042) _p8041[_e8045] = 0;
            _y8043 = false;
            const _a8046 = sp.cellEdges[v_c];
            for (const _e8050 of _l8048) _f8047[_e8050] = -1;
            _l8048 = _a8046;
            let _i8052 = 0;
            _s8049[0] = 0;
            let _o8056 = _a8046.length === 0;
            for (;;) {
              if (_a8046.length === 0) {
                if (!_o8056) break;
                _o8056 = false;
              }
              while (_a8046.length > 0 && _i8052 >= 0) {
                const _e8050 = _a8046[_i8052];
                if (_s8049[_i8052] > 0) _f8047[_e8050] = -1;
                let _r8055 = (cands[_e8050] >= 0 ? cands[_e8050] : (cands[_e8050] = b.cands[_e8050])) & ~((2 << _s8049[_i8052]) - 1);
                let _d8051 = 0;
                V8054: for (; _r8055 !== 0; _r8055 &= _r8055 - 1) {
                  _d8051 = 31 - Math.clz32(_r8055 & -_r8055);
                  _f8047[_e8050] = _d8051;
                  for (let _j8053 = 0; _j8053 < _i8052; _j8053++) {
                    const _y8057 = _a8046[_j8053];
                    if (!(((((_k7581[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f8047[_e8050] === 1)) && (_f8047[_y8057] === 1)))) continue;
                    if (!((bent(sp, _e8050, _y8057) === (clueAt(cl.piece, v_c) === 3)))) continue V8054;
                  }
                  for (let _j8053 = 0; _j8053 < _i8052; _j8053++) {
                    const _y8058 = _a8046[_j8053];
                    if (!(((((_f8047[_e8050] === 1) && (_f8047[_y8058] === 1)) && !((b.grid[_e8050] !== 0))) && !((b.grid[_y8058] !== 0))))) continue;
                    if (!(!(_eg7622.of((sp.edgeEnds[2 * _y8058] === v_c ? sp.edgeEnds[2 * _y8058 + 1] : sp.edgeEnds[2 * _y8058])) === _eg7622.of((sp.edgeEnds[2 * _e8050] === v_c ? sp.edgeEnds[2 * _e8050 + 1] : sp.edgeEnds[2 * _e8050]))))) continue V8054;
                  }
                  break;
                }
                if (_r8055 === 0) {
                  _s8049[_i8052] = 0;
                  _i8052--;
                  continue;
                }
                _s8049[_i8052] = _d8051;
                if (_i8052 === _a8046.length - 1) break;
                _i8052++;
                _s8049[_i8052] = 0;
              }
              if (_i8052 < 0) break;
              let _g8059 = 0;
              G8060: {
                const _a8061 = sp.cellEdges[v_c];
                for (let _i8062 = 0; _i8062 < _a8061.length; _i8062++) {
                  const v_x = _a8061[_i8062];
                  if (!((_f8047[v_x] === 1))) continue;
                  _g8059++;
                }
              }
              let _c8067: boolean = (_g8059 === (_k7581[v_c] ?? arms(sp, cl, v_c)));
              if (_c8067) {
                let _q8063 = true;
                Q8064: {
                  const _a8065 = sp.cellEdges[v_c];
                  for (let _i8066 = 0; _i8066 < _a8065.length; _i8066++) {
                    const v_x = _a8065[_i8066];
                    if (!(((_f8047[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg7622.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q8063 = false;
                      break Q8064;
                    }
                  }
                }
                _c8067 = _q8063;
              }
              let _c8248: boolean = _c8067;
              if (_c8248) {
                let _q8068 = false;
                Q8069: {
                  const _a8070 = sp.cellEdges[v_c];
                  for (let _i8071 = 0; _i8071 < _a8070.length; _i8071++) {
                    const v_x = _a8070[_i8071];
                    if (!((_f8047[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q8068 = true;
                      break Q8069;
                    }
                  }
                }
                let _c8247: boolean = _q8068;
                if (!_c8247) {
                  _g8072.length = 0;
                  _st8155.pass++;
                  G8073: {
                    const _a8156 = sp.cellEdges[v_c];
                    for (let _i8157 = 0; _i8157 < _a8156.length; _i8157++) {
                      const v_x = _a8156[_i8157];
                      if (!((_f8047[v_x] === 1))) continue;
                      const _t8158 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h8220 = minus(_h7768, sp.cellEdges[_t8158]);
                      const _eg8222 = edgeGroups(sp, _h8220);
                      const _memo8225 = new Map<readonly number[], readonly number[]>();
                      _g8159.length = 0;
                      _st8198.pass++;
                      G8160: {
                        const _a8199 = sp.cellEdges[_t8158];
                        for (let _i8200 = 0; _i8200 < _a8199.length; _i8200++) {
                          const v_y = _a8199[_i8200];
                          let _c8219: boolean = (v_y !== v_x);
                          if (_c8219) {
                            let _q8201 = false;
                            Q8202: {
                              const _a8203 = sp.cellEdges[_t8158];
                              for (const _e8207 of _l8205) _f8204[_e8207] = -1;
                              _l8205 = _a8203;
                              let _i8209 = 0;
                              _s8206[0] = 0;
                              let _o8213 = _a8203.length === 0;
                              for (;;) {
                                if (_a8203.length === 0) {
                                  if (!_o8213) break;
                                  _o8213 = false;
                                }
                                while (_a8203.length > 0 && _i8209 >= 0) {
                                  const _e8207 = _a8203[_i8209];
                                  if (_s8206[_i8209] > 0) _f8204[_e8207] = -1;
                                  let _r8212 = (cands[_e8207] >= 0 ? cands[_e8207] : (cands[_e8207] = b.cands[_e8207])) & ~((2 << _s8206[_i8209]) - 1);
                                  let _d8208 = 0;
                                  V8211: for (; _r8212 !== 0; _r8212 &= _r8212 - 1) {
                                    _d8208 = 31 - Math.clz32(_r8212 & -_r8212);
                                    _f8204[_e8207] = _d8208;
                                    if (_e8207 === v_x && _d8208 !== 1) continue;
                                    if (_e8207 === v_y && _d8208 !== 1) continue;
                                    for (let _j8210 = 0; _j8210 < _i8209; _j8210++) {
                                      const _y8214 = _a8203[_j8210];
                                      if (!(((((_k7581[_t8158] ?? arms(sp, cl, _t8158)) === 2) && (_f8204[_e8207] === 1)) && (_f8204[_y8214] === 1)))) continue;
                                      if (!((bent(sp, _e8207, _y8214) === (clueAt(cl.piece, _t8158) === 3)))) continue V8211;
                                    }
                                    break;
                                  }
                                  if (_r8212 === 0) {
                                    _s8206[_i8209] = 0;
                                    _i8209--;
                                    continue;
                                  }
                                  _s8206[_i8209] = _d8208;
                                  if (_i8209 === _a8203.length - 1) break;
                                  _i8209++;
                                  _s8206[_i8209] = 0;
                                }
                                if (_i8209 < 0) break;
                                let _g8215 = 0;
                                G8216: {
                                  const _a8217 = sp.cellEdges[_t8158];
                                  for (let _i8218 = 0; _i8218 < _a8217.length; _i8218++) {
                                    const v_z = _a8217[_i8218];
                                    if (!((_f8204[v_z] === 1))) continue;
                                    _g8215++;
                                  }
                                }
                                if (!((_g8215 === (_k7581[_t8158] ?? arms(sp, cl, _t8158))))) continue;
                                if (true) {
                                  _q8201 = true;
                                  break Q8202;
                                }
                              }
                            }
                            _c8219 = _q8201;
                          }
                          if (!(_c8219)) continue;
                          const _t8221 = (sp.edgeEnds[2 * v_y] === _t8158 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t8224 = _eg8222.of(_t8221);
                          let _gs8226 = _memo8225.get(_t8224);
                          if (_gs8226 === undefined) {
                            _g8227.length = 0;
                            _st8234.pass++;
                            G8228: {
                              const _a8235 = _t8224;
                              for (let _i8236 = 0; _i8236 < _a8235.length; _i8236++) {
                                const v_t = _a8235[_i8236];
                                if (!(((_k7581[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a8237 = sp.cellEdges[v_t];
                                for (let _i8238 = 0; _i8238 < _a8237.length; _i8238++) {
                                  const v_y = _a8237[_i8238];
                                  L8239: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k7581[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7789[v_y + 1] === 1)))) break L8239;
                                    const _t8240 = v_z;
                                    if (_g8227.length < 16) { if (!_g8227.includes(_t8240)) _g8227.push(_t8240); } else addOnce(_g8227, _st8234, _t8240);
                                  }
                                }
                              }
                            }
                            _gs8226 = _g8227.slice();
                            _memo8225.set(_t8224, _gs8226);
                          }
                          const _a8241 = union(_eg8222.of(_t8221), _gs8226);
                          for (let _i8242 = 0; _i8242 < _a8241.length; _i8242++) {
                            const v_t = _a8241[_i8242];
                            const _t8243 = v_t;
                            if (_g8159.length < 16) { if (!_g8159.includes(_t8243)) _g8159.push(_t8243); } else addOnce(_g8159, _st8198, _t8243);
                          }
                        }
                      }
                      const _a8244 = union(setOf(_t8158), _g8159);
                      for (let _i8245 = 0; _i8245 < _a8244.length; _i8245++) {
                        const v_t = _a8244[_i8245];
                        const _t8246 = v_t;
                        if (_g8072.length < 16) { if (!_g8072.includes(_t8246)) _g8072.push(_t8246); } else addOnce(_g8072, _st8155, _t8246);
                      }
                    }
                  }
                  _c8247 = (union(setOf(v_c), _g8072).length >= _h7794);
                }
                _c8248 = _c8247;
              }
              let _c8295: boolean = _c8248;
              if (_c8295) {
                let _q8249 = true;
                Q8250: {
                  _g8251.length = 0;
                  G8252: {
                    const _a8255 = sp.cellEdges[v_c];
                    for (let _i8256 = 0; _i8256 < _a8255.length; _i8256++) {
                      const v_x = _a8255[_i8256];
                      if (!((_f8047[v_x] === 1))) continue;
                      _g8251.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g8251);
                  const _eg8280 = edgeGroups(sp, v_M);
                  const _a8257 = sp.cellEdges[v_c];
                  for (let _i8258 = 0; _i8258 < _a8257.length; _i8258++) {
                    const v_x = _a8257[_i8258];
                    L8259: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c8264: boolean = (v_j !== v_c);
                      if (_c8264) {
                        let _q8260 = false;
                        Q8261: {
                          const _a8262 = sp.cellEdges[v_j];
                          for (let _i8263 = 0; _i8263 < _a8262.length; _i8263++) {
                            const v_y = _a8262[_i8263];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q8260 = true;
                              break Q8261;
                            }
                          }
                        }
                        _c8264 = _q8260;
                      }
                      if (!(_c8264)) break L8259;
                      let _q8265 = false;
                      Q8266: {
                        const _a8267 = sp.cellEdges[v_j];
                        for (const _e8271 of _l8269) _f8268[_e8271] = -1;
                        _l8269 = _a8267;
                        let _i8273 = 0;
                        _s8270[0] = 0;
                        let _o8277 = _a8267.length === 0;
                        for (;;) {
                          if (_a8267.length === 0) {
                            if (!_o8277) break;
                            _o8277 = false;
                          }
                          while (_a8267.length > 0 && _i8273 >= 0) {
                            const _e8271 = _a8267[_i8273];
                            if (_s8270[_i8273] > 0) _f8268[_e8271] = -1;
                            let _r8276 = (cands[_e8271] >= 0 ? cands[_e8271] : (cands[_e8271] = b.cands[_e8271])) & ~((2 << _s8270[_i8273]) - 1);
                            let _d8272 = 0;
                            V8275: for (; _r8276 !== 0; _r8276 &= _r8276 - 1) {
                              _d8272 = 31 - Math.clz32(_r8276 & -_r8276);
                              _f8268[_e8271] = _d8272;
                              for (let _j8274 = 0; _j8274 < _i8273; _j8274++) {
                                const _y8278 = _a8267[_j8274];
                                if (!(((((_k7581[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f8268[_e8271] === 1)) && (_f8268[_y8278] === 1)))) continue;
                                if (!((bent(sp, _e8271, _y8278) === (clueAt(cl.piece, v_j) === 3)))) continue V8275;
                              }
                              for (let _j8274 = 0; _j8274 < _i8273; _j8274++) {
                                const _y8279 = _a8267[_j8274];
                                if (!(((((((_f8268[_e8271] === 1) && (_f8268[_y8279] === 1)) && !((b.grid[_e8271] !== 0))) && !((b.grid[_y8279] !== 0))) && !([sp.edgeEnds[2 * _e8271], sp.edgeEnds[2 * _e8271 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y8279], sp.edgeEnds[2 * _y8279 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg8280.of((sp.edgeEnds[2 * _y8279] === v_j ? sp.edgeEnds[2 * _y8279 + 1] : sp.edgeEnds[2 * _y8279])) === _eg8280.of((sp.edgeEnds[2 * _e8271] === v_j ? sp.edgeEnds[2 * _e8271 + 1] : sp.edgeEnds[2 * _e8271]))))) continue V8275;
                              }
                              break;
                            }
                            if (_r8276 === 0) {
                              _s8270[_i8273] = 0;
                              _i8273--;
                              continue;
                            }
                            _s8270[_i8273] = _d8272;
                            if (_i8273 === _a8267.length - 1) break;
                            _i8273++;
                            _s8270[_i8273] = 0;
                          }
                          if (_i8273 < 0) break;
                          let _q8281 = true;
                          Q8282: {
                            const _a8283 = sp.cellEdges[v_j];
                            for (let _i8284 = 0; _i8284 < _a8283.length; _i8284++) {
                              const v_y = _a8283[_i8284];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f8268[v_y] === _f8047[v_y]))) {
                                _q8281 = false;
                                break Q8282;
                              }
                            }
                          }
                          let _c8289: boolean = _q8281;
                          if (_c8289) {
                            let _g8285 = 0;
                            G8286: {
                              const _a8287 = sp.cellEdges[v_j];
                              for (let _i8288 = 0; _i8288 < _a8287.length; _i8288++) {
                                const v_y = _a8287[_i8288];
                                if (!((_f8268[v_y] === 1))) continue;
                                _g8285++;
                              }
                            }
                            _c8289 = (_g8285 === (_k7581[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c8294: boolean = _c8289;
                          if (_c8294) {
                            let _q8290 = true;
                            Q8291: {
                              const _a8292 = sp.cellEdges[v_j];
                              for (let _i8293 = 0; _i8293 < _a8292.length; _i8293++) {
                                const v_y = _a8292[_i8293];
                                if (!((((_f8268[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg8280.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg8280.of(v_j)))) {
                                  _q8290 = false;
                                  break Q8291;
                                }
                              }
                            }
                            _c8294 = _q8290;
                          }
                          if (!(_c8294)) continue;
                          if (true) {
                            _q8265 = true;
                            break Q8266;
                          }
                        }
                      }
                      if (!(_q8265)) {
                        _q8249 = false;
                        break Q8250;
                      }
                    }
                  }
                }
                _c8295 = _q8249;
              }
              if (!(_c8295)) continue;
              if (!(true)) continue;
              _l8042 = _a8046;
              _y8043 = true;
              for (const _e8045 of _a8046) _p8041[_e8045] |= 1 << _f8047[_e8045];
            }
          }
          if (!(((((_p8041[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y8043 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g7795.push(v_e);
        }
      }
      const v_W = _g7795;
      _g8296.length = 0;
      G8297: {
        const _a8540 = v_F;
        for (let _i8541 = 0; _i8541 < _a8540.length; _i8541++) {
          const v_e = _a8540[_i8541];
          if (_g8545 !== _epoch) {
            _g8545 = _epoch;
            for (const _e8546 of _l8543) _p8542[_e8546] = 0;
            _y8544 = false;
            const _a8547 = sp.cellEdges[v_c];
            for (const _e8551 of _l8549) _f8548[_e8551] = -1;
            _l8549 = _a8547;
            let _i8553 = 0;
            _s8550[0] = 0;
            let _o8557 = _a8547.length === 0;
            for (;;) {
              if (_a8547.length === 0) {
                if (!_o8557) break;
                _o8557 = false;
              }
              while (_a8547.length > 0 && _i8553 >= 0) {
                const _e8551 = _a8547[_i8553];
                if (_s8550[_i8553] > 0) _f8548[_e8551] = -1;
                let _r8556 = (cands[_e8551] >= 0 ? cands[_e8551] : (cands[_e8551] = b.cands[_e8551])) & ~((2 << _s8550[_i8553]) - 1);
                let _d8552 = 0;
                V8555: for (; _r8556 !== 0; _r8556 &= _r8556 - 1) {
                  _d8552 = 31 - Math.clz32(_r8556 & -_r8556);
                  _f8548[_e8551] = _d8552;
                  for (let _j8554 = 0; _j8554 < _i8553; _j8554++) {
                    const _y8558 = _a8547[_j8554];
                    if (!(((((_k7581[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f8548[_e8551] === 1)) && (_f8548[_y8558] === 1)))) continue;
                    if (!((bent(sp, _e8551, _y8558) === (clueAt(cl.piece, v_c) === 3)))) continue V8555;
                  }
                  for (let _j8554 = 0; _j8554 < _i8553; _j8554++) {
                    const _y8559 = _a8547[_j8554];
                    if (!(((((_f8548[_e8551] === 1) && (_f8548[_y8559] === 1)) && !((b.grid[_e8551] !== 0))) && !((b.grid[_y8559] !== 0))))) continue;
                    if (!(!(_eg7622.of((sp.edgeEnds[2 * _y8559] === v_c ? sp.edgeEnds[2 * _y8559 + 1] : sp.edgeEnds[2 * _y8559])) === _eg7622.of((sp.edgeEnds[2 * _e8551] === v_c ? sp.edgeEnds[2 * _e8551 + 1] : sp.edgeEnds[2 * _e8551]))))) continue V8555;
                  }
                  break;
                }
                if (_r8556 === 0) {
                  _s8550[_i8553] = 0;
                  _i8553--;
                  continue;
                }
                _s8550[_i8553] = _d8552;
                if (_i8553 === _a8547.length - 1) break;
                _i8553++;
                _s8550[_i8553] = 0;
              }
              if (_i8553 < 0) break;
              let _g8560 = 0;
              G8561: {
                const _a8562 = sp.cellEdges[v_c];
                for (let _i8563 = 0; _i8563 < _a8562.length; _i8563++) {
                  const v_x = _a8562[_i8563];
                  if (!((_f8548[v_x] === 1))) continue;
                  _g8560++;
                }
              }
              let _c8568: boolean = (_g8560 === (_k7581[v_c] ?? arms(sp, cl, v_c)));
              if (_c8568) {
                let _q8564 = true;
                Q8565: {
                  const _a8566 = sp.cellEdges[v_c];
                  for (let _i8567 = 0; _i8567 < _a8566.length; _i8567++) {
                    const v_x = _a8566[_i8567];
                    if (!(((_f8548[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg7622.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q8564 = false;
                      break Q8565;
                    }
                  }
                }
                _c8568 = _q8564;
              }
              let _c8749: boolean = _c8568;
              if (_c8749) {
                let _q8569 = false;
                Q8570: {
                  const _a8571 = sp.cellEdges[v_c];
                  for (let _i8572 = 0; _i8572 < _a8571.length; _i8572++) {
                    const v_x = _a8571[_i8572];
                    if (!((_f8548[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q8569 = true;
                      break Q8570;
                    }
                  }
                }
                let _c8748: boolean = _q8569;
                if (!_c8748) {
                  _g8573.length = 0;
                  _st8656.pass++;
                  G8574: {
                    const _a8657 = sp.cellEdges[v_c];
                    for (let _i8658 = 0; _i8658 < _a8657.length; _i8658++) {
                      const v_x = _a8657[_i8658];
                      if (!((_f8548[v_x] === 1))) continue;
                      const _t8659 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _h8721 = minus(_h7768, sp.cellEdges[_t8659]);
                      const _eg8723 = edgeGroups(sp, _h8721);
                      const _memo8726 = new Map<readonly number[], readonly number[]>();
                      _g8660.length = 0;
                      _st8699.pass++;
                      G8661: {
                        const _a8700 = sp.cellEdges[_t8659];
                        for (let _i8701 = 0; _i8701 < _a8700.length; _i8701++) {
                          const v_y = _a8700[_i8701];
                          let _c8720: boolean = (v_y !== v_x);
                          if (_c8720) {
                            let _q8702 = false;
                            Q8703: {
                              const _a8704 = sp.cellEdges[_t8659];
                              for (const _e8708 of _l8706) _f8705[_e8708] = -1;
                              _l8706 = _a8704;
                              let _i8710 = 0;
                              _s8707[0] = 0;
                              let _o8714 = _a8704.length === 0;
                              for (;;) {
                                if (_a8704.length === 0) {
                                  if (!_o8714) break;
                                  _o8714 = false;
                                }
                                while (_a8704.length > 0 && _i8710 >= 0) {
                                  const _e8708 = _a8704[_i8710];
                                  if (_s8707[_i8710] > 0) _f8705[_e8708] = -1;
                                  let _r8713 = (cands[_e8708] >= 0 ? cands[_e8708] : (cands[_e8708] = b.cands[_e8708])) & ~((2 << _s8707[_i8710]) - 1);
                                  let _d8709 = 0;
                                  V8712: for (; _r8713 !== 0; _r8713 &= _r8713 - 1) {
                                    _d8709 = 31 - Math.clz32(_r8713 & -_r8713);
                                    _f8705[_e8708] = _d8709;
                                    if (_e8708 === v_x && _d8709 !== 1) continue;
                                    if (_e8708 === v_y && _d8709 !== 1) continue;
                                    for (let _j8711 = 0; _j8711 < _i8710; _j8711++) {
                                      const _y8715 = _a8704[_j8711];
                                      if (!(((((_k7581[_t8659] ?? arms(sp, cl, _t8659)) === 2) && (_f8705[_e8708] === 1)) && (_f8705[_y8715] === 1)))) continue;
                                      if (!((bent(sp, _e8708, _y8715) === (clueAt(cl.piece, _t8659) === 3)))) continue V8712;
                                    }
                                    break;
                                  }
                                  if (_r8713 === 0) {
                                    _s8707[_i8710] = 0;
                                    _i8710--;
                                    continue;
                                  }
                                  _s8707[_i8710] = _d8709;
                                  if (_i8710 === _a8704.length - 1) break;
                                  _i8710++;
                                  _s8707[_i8710] = 0;
                                }
                                if (_i8710 < 0) break;
                                let _g8716 = 0;
                                G8717: {
                                  const _a8718 = sp.cellEdges[_t8659];
                                  for (let _i8719 = 0; _i8719 < _a8718.length; _i8719++) {
                                    const v_z = _a8718[_i8719];
                                    if (!((_f8705[v_z] === 1))) continue;
                                    _g8716++;
                                  }
                                }
                                if (!((_g8716 === (_k7581[_t8659] ?? arms(sp, cl, _t8659))))) continue;
                                if (true) {
                                  _q8702 = true;
                                  break Q8703;
                                }
                              }
                            }
                            _c8720 = _q8702;
                          }
                          if (!(_c8720)) continue;
                          const _t8722 = (sp.edgeEnds[2 * v_y] === _t8659 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t8725 = _eg8723.of(_t8722);
                          let _gs8727 = _memo8726.get(_t8725);
                          if (_gs8727 === undefined) {
                            _g8728.length = 0;
                            _st8735.pass++;
                            G8729: {
                              const _a8736 = _t8725;
                              for (let _i8737 = 0; _i8737 < _a8736.length; _i8737++) {
                                const v_t = _a8736[_i8737];
                                if (!(((_k7581[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                                const _a8738 = sp.cellEdges[v_t];
                                for (let _i8739 = 0; _i8739 < _a8738.length; _i8739++) {
                                  const v_y = _a8738[_i8739];
                                  L8740: {
                                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                    if (!((((_k7581[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm7789[v_y + 1] === 1)))) break L8740;
                                    const _t8741 = v_z;
                                    if (_g8728.length < 16) { if (!_g8728.includes(_t8741)) _g8728.push(_t8741); } else addOnce(_g8728, _st8735, _t8741);
                                  }
                                }
                              }
                            }
                            _gs8727 = _g8728.slice();
                            _memo8726.set(_t8725, _gs8727);
                          }
                          const _a8742 = union(_eg8723.of(_t8722), _gs8727);
                          for (let _i8743 = 0; _i8743 < _a8742.length; _i8743++) {
                            const v_t = _a8742[_i8743];
                            const _t8744 = v_t;
                            if (_g8660.length < 16) { if (!_g8660.includes(_t8744)) _g8660.push(_t8744); } else addOnce(_g8660, _st8699, _t8744);
                          }
                        }
                      }
                      const _a8745 = union(setOf(_t8659), _g8660);
                      for (let _i8746 = 0; _i8746 < _a8745.length; _i8746++) {
                        const v_t = _a8745[_i8746];
                        const _t8747 = v_t;
                        if (_g8573.length < 16) { if (!_g8573.includes(_t8747)) _g8573.push(_t8747); } else addOnce(_g8573, _st8656, _t8747);
                      }
                    }
                  }
                  _c8748 = (union(setOf(v_c), _g8573).length >= _h7794);
                }
                _c8749 = _c8748;
              }
              let _c8796: boolean = _c8749;
              if (_c8796) {
                let _q8750 = true;
                Q8751: {
                  _g8752.length = 0;
                  G8753: {
                    const _a8756 = sp.cellEdges[v_c];
                    for (let _i8757 = 0; _i8757 < _a8756.length; _i8757++) {
                      const v_x = _a8756[_i8757];
                      if (!((_f8548[v_x] === 1))) continue;
                      _g8752.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g8752);
                  const _eg8781 = edgeGroups(sp, v_M);
                  const _a8758 = sp.cellEdges[v_c];
                  for (let _i8759 = 0; _i8759 < _a8758.length; _i8759++) {
                    const v_x = _a8758[_i8759];
                    L8760: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c8765: boolean = (v_j !== v_c);
                      if (_c8765) {
                        let _q8761 = false;
                        Q8762: {
                          const _a8763 = sp.cellEdges[v_j];
                          for (let _i8764 = 0; _i8764 < _a8763.length; _i8764++) {
                            const v_y = _a8763[_i8764];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q8761 = true;
                              break Q8762;
                            }
                          }
                        }
                        _c8765 = _q8761;
                      }
                      if (!(_c8765)) break L8760;
                      let _q8766 = false;
                      Q8767: {
                        const _a8768 = sp.cellEdges[v_j];
                        for (const _e8772 of _l8770) _f8769[_e8772] = -1;
                        _l8770 = _a8768;
                        let _i8774 = 0;
                        _s8771[0] = 0;
                        let _o8778 = _a8768.length === 0;
                        for (;;) {
                          if (_a8768.length === 0) {
                            if (!_o8778) break;
                            _o8778 = false;
                          }
                          while (_a8768.length > 0 && _i8774 >= 0) {
                            const _e8772 = _a8768[_i8774];
                            if (_s8771[_i8774] > 0) _f8769[_e8772] = -1;
                            let _r8777 = (cands[_e8772] >= 0 ? cands[_e8772] : (cands[_e8772] = b.cands[_e8772])) & ~((2 << _s8771[_i8774]) - 1);
                            let _d8773 = 0;
                            V8776: for (; _r8777 !== 0; _r8777 &= _r8777 - 1) {
                              _d8773 = 31 - Math.clz32(_r8777 & -_r8777);
                              _f8769[_e8772] = _d8773;
                              for (let _j8775 = 0; _j8775 < _i8774; _j8775++) {
                                const _y8779 = _a8768[_j8775];
                                if (!(((((_k7581[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f8769[_e8772] === 1)) && (_f8769[_y8779] === 1)))) continue;
                                if (!((bent(sp, _e8772, _y8779) === (clueAt(cl.piece, v_j) === 3)))) continue V8776;
                              }
                              for (let _j8775 = 0; _j8775 < _i8774; _j8775++) {
                                const _y8780 = _a8768[_j8775];
                                if (!(((((((_f8769[_e8772] === 1) && (_f8769[_y8780] === 1)) && !((b.grid[_e8772] !== 0))) && !((b.grid[_y8780] !== 0))) && !([sp.edgeEnds[2 * _e8772], sp.edgeEnds[2 * _e8772 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y8780], sp.edgeEnds[2 * _y8780 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg8781.of((sp.edgeEnds[2 * _y8780] === v_j ? sp.edgeEnds[2 * _y8780 + 1] : sp.edgeEnds[2 * _y8780])) === _eg8781.of((sp.edgeEnds[2 * _e8772] === v_j ? sp.edgeEnds[2 * _e8772 + 1] : sp.edgeEnds[2 * _e8772]))))) continue V8776;
                              }
                              break;
                            }
                            if (_r8777 === 0) {
                              _s8771[_i8774] = 0;
                              _i8774--;
                              continue;
                            }
                            _s8771[_i8774] = _d8773;
                            if (_i8774 === _a8768.length - 1) break;
                            _i8774++;
                            _s8771[_i8774] = 0;
                          }
                          if (_i8774 < 0) break;
                          let _q8782 = true;
                          Q8783: {
                            const _a8784 = sp.cellEdges[v_j];
                            for (let _i8785 = 0; _i8785 < _a8784.length; _i8785++) {
                              const v_y = _a8784[_i8785];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f8769[v_y] === _f8548[v_y]))) {
                                _q8782 = false;
                                break Q8783;
                              }
                            }
                          }
                          let _c8790: boolean = _q8782;
                          if (_c8790) {
                            let _g8786 = 0;
                            G8787: {
                              const _a8788 = sp.cellEdges[v_j];
                              for (let _i8789 = 0; _i8789 < _a8788.length; _i8789++) {
                                const v_y = _a8788[_i8789];
                                if (!((_f8769[v_y] === 1))) continue;
                                _g8786++;
                              }
                            }
                            _c8790 = (_g8786 === (_k7581[v_j] ?? arms(sp, cl, v_j)));
                          }
                          let _c8795: boolean = _c8790;
                          if (_c8795) {
                            let _q8791 = true;
                            Q8792: {
                              const _a8793 = sp.cellEdges[v_j];
                              for (let _i8794 = 0; _i8794 < _a8793.length; _i8794++) {
                                const v_y = _a8793[_i8794];
                                if (!((((_f8769[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg8781.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg8781.of(v_j)))) {
                                  _q8791 = false;
                                  break Q8792;
                                }
                              }
                            }
                            _c8795 = _q8791;
                          }
                          if (!(_c8795)) continue;
                          if (true) {
                            _q8766 = true;
                            break Q8767;
                          }
                        }
                      }
                      if (!(_q8766)) {
                        _q8750 = false;
                        break Q8751;
                      }
                    }
                  }
                }
                _c8796 = _q8750;
              }
              if (!(_c8796)) continue;
              if (!(true)) continue;
              _l8543 = _a8547;
              _y8544 = true;
              for (const _e8546 of _a8547) _p8542[_e8546] |= 1 << _f8548[_e8546];
            }
          }
          if (!(((((_p8542[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y8544 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g8296.push(v_e);
        }
      }
      L8797: {
        const v_N = _g8296;
        let _q8798 = true;
        Q8799: {
          const _a8800 = v_F;
          for (let _i8801 = 0; _i8801 < _a8800.length; _i8801++) {
            const v_e = _a8800[_i8801];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q8798 = false;
              break Q8799;
            }
          }
        }
        if (!(_q8798)) break L8797;
        if (b.made[0] !== _m394_0 || b.made[1] !== _m397_1) {
          _g8802.length = 0;
          G8803: {
            const _a8806 = sp.edges;
            for (let _i8807 = 0; _i8807 < _a8806.length; _i8807++) {
              const v_e = _a8806[_i8807];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g8802.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g8802))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g8808: number[] = [];
          G8809: {
            const _a8812 = sp.edges;
            for (let _i8813 = 0; _i8813 < _a8812.length; _i8813++) {
              const v_e = _a8812[_i8813];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g8808.push(v_e);
            }
          }
          const _g8814: number[] = [];
          G8815: {
            const _a8857 = sp.edges;
            for (let _i8858 = 0; _i8858 < _a8857.length; _i8858++) {
              const v_e = _a8857[_i8858];
              const _t8859 = sp.edgeEnds[2 * v_e];
              let _q8860 = false;
              Q8861: {
                const _f8863 = new Int32Array(sp.edges.length).fill(-1);
                let _l8864: readonly number[] = [];
                const _s8865: number[] = [];
                const _a8862 = sp.cellEdges[_t8859];
                for (const _e8866 of _l8864) _f8863[_e8866] = -1;
                _l8864 = _a8862;
                let _i8868 = 0;
                _s8865[0] = 0;
                let _o8872 = _a8862.length === 0;
                for (;;) {
                  if (_a8862.length === 0) {
                    if (!_o8872) break;
                    _o8872 = false;
                  }
                  while (_a8862.length > 0 && _i8868 >= 0) {
                    const _e8866 = _a8862[_i8868];
                    if (_s8865[_i8868] > 0) _f8863[_e8866] = -1;
                    let _r8871 = (cands[_e8866] >= 0 ? cands[_e8866] : (cands[_e8866] = b.cands[_e8866])) & ~((2 << _s8865[_i8868]) - 1);
                    let _d8867 = 0;
                    V8870: for (; _r8871 !== 0; _r8871 &= _r8871 - 1) {
                      _d8867 = 31 - Math.clz32(_r8871 & -_r8871);
                      _f8863[_e8866] = _d8867;
                      if (_e8866 === v_e && _d8867 !== 1) continue;
                      for (let _j8869 = 0; _j8869 < _i8868; _j8869++) {
                        const _y8873 = _a8862[_j8869];
                        if (!((((arms(sp, cl, _t8859) === 2) && (_f8863[_e8866] === 1)) && (_f8863[_y8873] === 1)))) continue;
                        if (!((bent(sp, _e8866, _y8873) === (clueAt(cl.piece, _t8859) === 3)))) continue V8870;
                      }
                      break;
                    }
                    if (_r8871 === 0) {
                      _s8865[_i8868] = 0;
                      _i8868--;
                      continue;
                    }
                    _s8865[_i8868] = _d8867;
                    if (_i8868 === _a8862.length - 1) break;
                    _i8868++;
                    _s8865[_i8868] = 0;
                  }
                  if (_i8868 < 0) break;
                  let _g8874 = 0;
                  G8875: {
                    const _a8876 = sp.cellEdges[_t8859];
                    for (let _i8877 = 0; _i8877 < _a8876.length; _i8877++) {
                      const v_x = _a8876[_i8877];
                      if (!((_f8863[v_x] === 1))) continue;
                      _g8874++;
                    }
                  }
                  if (!((_g8874 === arms(sp, cl, _t8859)))) continue;
                  if (true) {
                    _q8860 = true;
                    break Q8861;
                  }
                }
              }
              let _c8897: boolean = _q8860;
              if (_c8897) {
                const _t8878 = sp.edgeEnds[2 * v_e + 1];
                let _q8879 = false;
                Q8880: {
                  const _f8882 = new Int32Array(sp.edges.length).fill(-1);
                  let _l8883: readonly number[] = [];
                  const _s8884: number[] = [];
                  const _a8881 = sp.cellEdges[_t8878];
                  for (const _e8885 of _l8883) _f8882[_e8885] = -1;
                  _l8883 = _a8881;
                  let _i8887 = 0;
                  _s8884[0] = 0;
                  let _o8891 = _a8881.length === 0;
                  for (;;) {
                    if (_a8881.length === 0) {
                      if (!_o8891) break;
                      _o8891 = false;
                    }
                    while (_a8881.length > 0 && _i8887 >= 0) {
                      const _e8885 = _a8881[_i8887];
                      if (_s8884[_i8887] > 0) _f8882[_e8885] = -1;
                      let _r8890 = (cands[_e8885] >= 0 ? cands[_e8885] : (cands[_e8885] = b.cands[_e8885])) & ~((2 << _s8884[_i8887]) - 1);
                      let _d8886 = 0;
                      V8889: for (; _r8890 !== 0; _r8890 &= _r8890 - 1) {
                        _d8886 = 31 - Math.clz32(_r8890 & -_r8890);
                        _f8882[_e8885] = _d8886;
                        if (_e8885 === v_e && _d8886 !== 1) continue;
                        for (let _j8888 = 0; _j8888 < _i8887; _j8888++) {
                          const _y8892 = _a8881[_j8888];
                          if (!((((arms(sp, cl, _t8878) === 2) && (_f8882[_e8885] === 1)) && (_f8882[_y8892] === 1)))) continue;
                          if (!((bent(sp, _e8885, _y8892) === (clueAt(cl.piece, _t8878) === 3)))) continue V8889;
                        }
                        break;
                      }
                      if (_r8890 === 0) {
                        _s8884[_i8887] = 0;
                        _i8887--;
                        continue;
                      }
                      _s8884[_i8887] = _d8886;
                      if (_i8887 === _a8881.length - 1) break;
                      _i8887++;
                      _s8884[_i8887] = 0;
                    }
                    if (_i8887 < 0) break;
                    let _g8893 = 0;
                    G8894: {
                      const _a8895 = sp.cellEdges[_t8878];
                      for (let _i8896 = 0; _i8896 < _a8895.length; _i8896++) {
                        const v_x = _a8895[_i8896];
                        if (!((_f8882[v_x] === 1))) continue;
                        _g8893++;
                      }
                    }
                    if (!((_g8893 === arms(sp, cl, _t8878)))) continue;
                    if (true) {
                      _q8879 = true;
                      break Q8880;
                    }
                  }
                }
                _c8897 = _q8879;
              }
              if (!(_c8897)) continue;
              _g8814.push(v_e);
            }
          }
          const _g8898: number[] = [];
          G8899: {
            const _a8902 = v_U;
            for (let _i8903 = 0; _i8903 < _a8902.length; _i8903++) {
              const v_e = _a8902[_i8903];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g8898.push(v_e);
            }
          }
          const _g8904: number[] = [];
          G8905: {
            const _a8908 = sp.cellEdges[v_c];
            for (let _i8909 = 0; _i8909 < _a8908.length; _i8909++) {
              const v_e = _a8908[_i8909];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g8904.push(v_e);
            }
          }
          const _g8910: number[] = [];
          G8911: {
            const _a8991 = sp.cellEdges[v_c];
            for (let _i8992 = 0; _i8992 < _a8991.length; _i8992++) {
              const v_x = _a8991[_i8992];
              const _t8993 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g8994: number[] = [];
              G8995: {
                const _a9033 = sp.cellEdges[_t8993];
                for (let _i9034 = 0; _i9034 < _a9033.length; _i9034++) {
                  const v_y = _a9033[_i9034];
                  let _c9053: boolean = (v_y !== v_x);
                  if (_c9053) {
                    let _q9035 = false;
                    Q9036: {
                      const _f9038 = new Int32Array(sp.edges.length).fill(-1);
                      let _l9039: readonly number[] = [];
                      const _s9040: number[] = [];
                      const _a9037 = sp.cellEdges[_t8993];
                      for (const _e9041 of _l9039) _f9038[_e9041] = -1;
                      _l9039 = _a9037;
                      let _i9043 = 0;
                      _s9040[0] = 0;
                      let _o9047 = _a9037.length === 0;
                      for (;;) {
                        if (_a9037.length === 0) {
                          if (!_o9047) break;
                          _o9047 = false;
                        }
                        while (_a9037.length > 0 && _i9043 >= 0) {
                          const _e9041 = _a9037[_i9043];
                          if (_s9040[_i9043] > 0) _f9038[_e9041] = -1;
                          let _r9046 = (cands[_e9041] >= 0 ? cands[_e9041] : (cands[_e9041] = b.cands[_e9041])) & ~((2 << _s9040[_i9043]) - 1);
                          let _d9042 = 0;
                          V9045: for (; _r9046 !== 0; _r9046 &= _r9046 - 1) {
                            _d9042 = 31 - Math.clz32(_r9046 & -_r9046);
                            _f9038[_e9041] = _d9042;
                            if (_e9041 === v_x && _d9042 !== 1) continue;
                            if (_e9041 === v_y && _d9042 !== 1) continue;
                            for (let _j9044 = 0; _j9044 < _i9043; _j9044++) {
                              const _y9048 = _a9037[_j9044];
                              if (!((((arms(sp, cl, _t8993) === 2) && (_f9038[_e9041] === 1)) && (_f9038[_y9048] === 1)))) continue;
                              if (!((bent(sp, _e9041, _y9048) === (clueAt(cl.piece, _t8993) === 3)))) continue V9045;
                            }
                            break;
                          }
                          if (_r9046 === 0) {
                            _s9040[_i9043] = 0;
                            _i9043--;
                            continue;
                          }
                          _s9040[_i9043] = _d9042;
                          if (_i9043 === _a9037.length - 1) break;
                          _i9043++;
                          _s9040[_i9043] = 0;
                        }
                        if (_i9043 < 0) break;
                        let _g9049 = 0;
                        G9050: {
                          const _a9051 = sp.cellEdges[_t8993];
                          for (let _i9052 = 0; _i9052 < _a9051.length; _i9052++) {
                            const v_z = _a9051[_i9052];
                            if (!((_f9038[v_z] === 1))) continue;
                            _g9049++;
                          }
                        }
                        if (!((_g9049 === arms(sp, cl, _t8993)))) continue;
                        if (true) {
                          _q9035 = true;
                          break Q9036;
                        }
                      }
                    }
                    _c9053 = _q9035;
                  }
                  if (!(_c9053)) continue;
                  const _t9054 = (sp.edgeEnds[2 * v_y] === _t8993 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t9055 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t8993]);
                  const _g9056: number[] = [];
                  G9057: {
                    const _a9063 = through(sp, _t9054, _t9055);
                    for (let _i9064 = 0; _i9064 < _a9063.length; _i9064++) {
                      const v_t = _a9063[_i9064];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a9065 = sp.cellEdges[v_t];
                      for (let _i9066 = 0; _i9066 < _a9065.length; _i9066++) {
                        const v_y = _a9065[_i9066];
                        L9067: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L9067;
                          if (!_g9056.includes(v_z)) _g9056.push(v_z);
                        }
                      }
                    }
                  }
                  const _a9068 = union(through(sp, _t9054, _t9055), _g9056);
                  for (let _i9069 = 0; _i9069 < _a9068.length; _i9069++) {
                    const v_t = _a9068[_i9069];
                    if (!_g8994.includes(v_t)) _g8994.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t8993), _g8994)).length >= sp.cells.length))) continue;
              _g8910.push(v_x);
            }
          }
          const _g9070: number[] = [];
          G9071: {
            const _a9314 = v_F;
            for (let _i9315 = 0; _i9315 < _a9314.length; _i9315++) {
              const v_e = _a9314[_i9315];
              let _q9316 = false;
              Q9317: {
                const _f9319 = new Int32Array(sp.edges.length).fill(-1);
                let _l9320: readonly number[] = [];
                const _s9321: number[] = [];
                const _a9318 = sp.cellEdges[v_c];
                for (const _e9322 of _l9320) _f9319[_e9322] = -1;
                _l9320 = _a9318;
                let _i9324 = 0;
                _s9321[0] = 0;
                let _o9328 = _a9318.length === 0;
                for (;;) {
                  if (_a9318.length === 0) {
                    if (!_o9328) break;
                    _o9328 = false;
                  }
                  while (_a9318.length > 0 && _i9324 >= 0) {
                    const _e9322 = _a9318[_i9324];
                    if (_s9321[_i9324] > 0) _f9319[_e9322] = -1;
                    let _r9327 = (cands[_e9322] >= 0 ? cands[_e9322] : (cands[_e9322] = b.cands[_e9322])) & ~((2 << _s9321[_i9324]) - 1);
                    let _d9323 = 0;
                    V9326: for (; _r9327 !== 0; _r9327 &= _r9327 - 1) {
                      _d9323 = 31 - Math.clz32(_r9327 & -_r9327);
                      _f9319[_e9322] = _d9323;
                      if (_e9322 === v_e && _d9323 !== 1) continue;
                      for (let _j9325 = 0; _j9325 < _i9324; _j9325++) {
                        const _y9329 = _a9318[_j9325];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f9319[_e9322] === 1)) && (_f9319[_y9329] === 1)))) continue;
                        if (!((bent(sp, _e9322, _y9329) === (clueAt(cl.piece, v_c) === 3)))) continue V9326;
                      }
                      for (let _j9325 = 0; _j9325 < _i9324; _j9325++) {
                        const _y9330 = _a9318[_j9325];
                        if (!(((((_f9319[_e9322] === 1) && (_f9319[_y9330] === 1)) && !((b.grid[_e9322] !== 0))) && !((b.grid[_y9330] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e9322] === v_c ? sp.edgeEnds[2 * _e9322 + 1] : sp.edgeEnds[2 * _e9322]), v_L).includes((sp.edgeEnds[2 * _y9330] === v_c ? sp.edgeEnds[2 * _y9330 + 1] : sp.edgeEnds[2 * _y9330]))))) continue V9326;
                      }
                      break;
                    }
                    if (_r9327 === 0) {
                      _s9321[_i9324] = 0;
                      _i9324--;
                      continue;
                    }
                    _s9321[_i9324] = _d9323;
                    if (_i9324 === _a9318.length - 1) break;
                    _i9324++;
                    _s9321[_i9324] = 0;
                  }
                  if (_i9324 < 0) break;
                  let _g9331 = 0;
                  G9332: {
                    const _a9333 = sp.cellEdges[v_c];
                    for (let _i9334 = 0; _i9334 < _a9333.length; _i9334++) {
                      const v_x = _a9333[_i9334];
                      if (!((_f9319[v_x] === 1))) continue;
                      _g9331++;
                    }
                  }
                  let _c9339: boolean = (_g9331 === arms(sp, cl, v_c));
                  if (_c9339) {
                    let _q9335 = true;
                    Q9336: {
                      const _a9337 = sp.cellEdges[v_c];
                      for (let _i9338 = 0; _i9338 < _a9337.length; _i9338++) {
                        const v_x = _a9337[_i9338];
                        if (!(((_f9319[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg7622.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q9335 = false;
                          break Q9336;
                        }
                      }
                    }
                    _c9339 = _q9335;
                  }
                  let _c9509: boolean = _c9339;
                  if (_c9509) {
                    let _q9340 = false;
                    Q9341: {
                      const _a9342 = sp.cellEdges[v_c];
                      for (let _i9343 = 0; _i9343 < _a9342.length; _i9343++) {
                        const v_x = _a9342[_i9343];
                        if (!((_f9319[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q9340 = true;
                          break Q9341;
                        }
                      }
                    }
                    let _c9508: boolean = _q9340;
                    if (!_c9508) {
                      const _g9344: number[] = [];
                      G9345: {
                        const _a9427 = sp.cellEdges[v_c];
                        for (let _i9428 = 0; _i9428 < _a9427.length; _i9428++) {
                          const v_x = _a9427[_i9428];
                          if (!((_f9319[v_x] === 1))) continue;
                          const _t9429 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g9430: number[] = [];
                          G9431: {
                            const _a9469 = sp.cellEdges[_t9429];
                            for (let _i9470 = 0; _i9470 < _a9469.length; _i9470++) {
                              const v_y = _a9469[_i9470];
                              let _c9489: boolean = (v_y !== v_x);
                              if (_c9489) {
                                let _q9471 = false;
                                Q9472: {
                                  const _f9474 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l9475: readonly number[] = [];
                                  const _s9476: number[] = [];
                                  const _a9473 = sp.cellEdges[_t9429];
                                  for (const _e9477 of _l9475) _f9474[_e9477] = -1;
                                  _l9475 = _a9473;
                                  let _i9479 = 0;
                                  _s9476[0] = 0;
                                  let _o9483 = _a9473.length === 0;
                                  for (;;) {
                                    if (_a9473.length === 0) {
                                      if (!_o9483) break;
                                      _o9483 = false;
                                    }
                                    while (_a9473.length > 0 && _i9479 >= 0) {
                                      const _e9477 = _a9473[_i9479];
                                      if (_s9476[_i9479] > 0) _f9474[_e9477] = -1;
                                      let _r9482 = (cands[_e9477] >= 0 ? cands[_e9477] : (cands[_e9477] = b.cands[_e9477])) & ~((2 << _s9476[_i9479]) - 1);
                                      let _d9478 = 0;
                                      V9481: for (; _r9482 !== 0; _r9482 &= _r9482 - 1) {
                                        _d9478 = 31 - Math.clz32(_r9482 & -_r9482);
                                        _f9474[_e9477] = _d9478;
                                        if (_e9477 === v_x && _d9478 !== 1) continue;
                                        if (_e9477 === v_y && _d9478 !== 1) continue;
                                        for (let _j9480 = 0; _j9480 < _i9479; _j9480++) {
                                          const _y9484 = _a9473[_j9480];
                                          if (!((((arms(sp, cl, _t9429) === 2) && (_f9474[_e9477] === 1)) && (_f9474[_y9484] === 1)))) continue;
                                          if (!((bent(sp, _e9477, _y9484) === (clueAt(cl.piece, _t9429) === 3)))) continue V9481;
                                        }
                                        break;
                                      }
                                      if (_r9482 === 0) {
                                        _s9476[_i9479] = 0;
                                        _i9479--;
                                        continue;
                                      }
                                      _s9476[_i9479] = _d9478;
                                      if (_i9479 === _a9473.length - 1) break;
                                      _i9479++;
                                      _s9476[_i9479] = 0;
                                    }
                                    if (_i9479 < 0) break;
                                    let _g9485 = 0;
                                    G9486: {
                                      const _a9487 = sp.cellEdges[_t9429];
                                      for (let _i9488 = 0; _i9488 < _a9487.length; _i9488++) {
                                        const v_z = _a9487[_i9488];
                                        if (!((_f9474[v_z] === 1))) continue;
                                        _g9485++;
                                      }
                                    }
                                    if (!((_g9485 === arms(sp, cl, _t9429)))) continue;
                                    if (true) {
                                      _q9471 = true;
                                      break Q9472;
                                    }
                                  }
                                }
                                _c9489 = _q9471;
                              }
                              if (!(_c9489)) continue;
                              const _t9490 = (sp.edgeEnds[2 * v_y] === _t9429 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t9491 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t9429]);
                              const _g9492: number[] = [];
                              G9493: {
                                const _a9499 = through(sp, _t9490, _t9491);
                                for (let _i9500 = 0; _i9500 < _a9499.length; _i9500++) {
                                  const v_t = _a9499[_i9500];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a9501 = sp.cellEdges[v_t];
                                  for (let _i9502 = 0; _i9502 < _a9501.length; _i9502++) {
                                    const v_y = _a9501[_i9502];
                                    L9503: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L9503;
                                      if (!_g9492.includes(v_z)) _g9492.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a9504 = union(through(sp, _t9490, _t9491), _g9492);
                              for (let _i9505 = 0; _i9505 < _a9504.length; _i9505++) {
                                const v_t = _a9504[_i9505];
                                if (!_g9430.includes(v_t)) _g9430.push(v_t);
                              }
                            }
                          }
                          const _a9506 = union(setOf(_t9429), _g9430);
                          for (let _i9507 = 0; _i9507 < _a9506.length; _i9507++) {
                            const v_t = _a9506[_i9507];
                            if (!_g9344.includes(v_t)) _g9344.push(v_t);
                          }
                        }
                      }
                      _c9508 = (union(setOf(v_c), _g9344).length >= sp.cells.length);
                    }
                    _c9509 = _c9508;
                  }
                  let _c9555: boolean = _c9509;
                  if (_c9555) {
                    let _q9510 = true;
                    Q9511: {
                      const _g9512: number[] = [];
                      G9513: {
                        const _a9516 = sp.cellEdges[v_c];
                        for (let _i9517 = 0; _i9517 < _a9516.length; _i9517++) {
                          const v_x = _a9516[_i9517];
                          if (!((_f9319[v_x] === 1))) continue;
                          _g9512.push(v_x);
                        }
                      }
                      const v_M = union(v_L, _g9512);
                      const _a9518 = sp.cellEdges[v_c];
                      for (let _i9519 = 0; _i9519 < _a9518.length; _i9519++) {
                        const v_x = _a9518[_i9519];
                        L9520: {
                          const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          let _c9525: boolean = (v_j !== v_c);
                          if (_c9525) {
                            let _q9521 = false;
                            Q9522: {
                              const _a9523 = sp.cellEdges[v_j];
                              for (let _i9524 = 0; _i9524 < _a9523.length; _i9524++) {
                                const v_y = _a9523[_i9524];
                                if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                                  _q9521 = true;
                                  break Q9522;
                                }
                              }
                            }
                            _c9525 = _q9521;
                          }
                          if (!(_c9525)) break L9520;
                          let _q9526 = false;
                          Q9527: {
                            const _f9529 = new Int32Array(sp.edges.length).fill(-1);
                            let _l9530: readonly number[] = [];
                            const _s9531: number[] = [];
                            const _a9528 = sp.cellEdges[v_j];
                            for (const _e9532 of _l9530) _f9529[_e9532] = -1;
                            _l9530 = _a9528;
                            let _i9534 = 0;
                            _s9531[0] = 0;
                            let _o9538 = _a9528.length === 0;
                            for (;;) {
                              if (_a9528.length === 0) {
                                if (!_o9538) break;
                                _o9538 = false;
                              }
                              while (_a9528.length > 0 && _i9534 >= 0) {
                                const _e9532 = _a9528[_i9534];
                                if (_s9531[_i9534] > 0) _f9529[_e9532] = -1;
                                let _r9537 = (cands[_e9532] >= 0 ? cands[_e9532] : (cands[_e9532] = b.cands[_e9532])) & ~((2 << _s9531[_i9534]) - 1);
                                let _d9533 = 0;
                                V9536: for (; _r9537 !== 0; _r9537 &= _r9537 - 1) {
                                  _d9533 = 31 - Math.clz32(_r9537 & -_r9537);
                                  _f9529[_e9532] = _d9533;
                                  for (let _j9535 = 0; _j9535 < _i9534; _j9535++) {
                                    const _y9539 = _a9528[_j9535];
                                    if (!((((arms(sp, cl, v_j) === 2) && (_f9529[_e9532] === 1)) && (_f9529[_y9539] === 1)))) continue;
                                    if (!((bent(sp, _e9532, _y9539) === (clueAt(cl.piece, v_j) === 3)))) continue V9536;
                                  }
                                  for (let _j9535 = 0; _j9535 < _i9534; _j9535++) {
                                    const _y9540 = _a9528[_j9535];
                                    if (!(((((((_f9529[_e9532] === 1) && (_f9529[_y9540] === 1)) && !((b.grid[_e9532] !== 0))) && !((b.grid[_y9540] !== 0))) && !([sp.edgeEnds[2 * _e9532], sp.edgeEnds[2 * _e9532 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y9540], sp.edgeEnds[2 * _y9540 + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, (sp.edgeEnds[2 * _e9532] === v_j ? sp.edgeEnds[2 * _e9532 + 1] : sp.edgeEnds[2 * _e9532]), v_M).includes((sp.edgeEnds[2 * _y9540] === v_j ? sp.edgeEnds[2 * _y9540 + 1] : sp.edgeEnds[2 * _y9540]))))) continue V9536;
                                  }
                                  break;
                                }
                                if (_r9537 === 0) {
                                  _s9531[_i9534] = 0;
                                  _i9534--;
                                  continue;
                                }
                                _s9531[_i9534] = _d9533;
                                if (_i9534 === _a9528.length - 1) break;
                                _i9534++;
                                _s9531[_i9534] = 0;
                              }
                              if (_i9534 < 0) break;
                              let _q9541 = true;
                              Q9542: {
                                const _a9543 = sp.cellEdges[v_j];
                                for (let _i9544 = 0; _i9544 < _a9543.length; _i9544++) {
                                  const v_y = _a9543[_i9544];
                                  if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                                  if (!((_f9529[v_y] === _f9319[v_y]))) {
                                    _q9541 = false;
                                    break Q9542;
                                  }
                                }
                              }
                              let _c9549: boolean = _q9541;
                              if (_c9549) {
                                let _g9545 = 0;
                                G9546: {
                                  const _a9547 = sp.cellEdges[v_j];
                                  for (let _i9548 = 0; _i9548 < _a9547.length; _i9548++) {
                                    const v_y = _a9547[_i9548];
                                    if (!((_f9529[v_y] === 1))) continue;
                                    _g9545++;
                                  }
                                }
                                _c9549 = (_g9545 === arms(sp, cl, v_j));
                              }
                              let _c9554: boolean = _c9549;
                              if (_c9554) {
                                let _q9550 = true;
                                Q9551: {
                                  const _a9552 = sp.cellEdges[v_j];
                                  for (let _i9553 = 0; _i9553 < _a9552.length; _i9553++) {
                                    const v_y = _a9552[_i9553];
                                    if (!((((_f9529[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                      _q9550 = false;
                                      break Q9551;
                                    }
                                  }
                                }
                                _c9554 = _q9550;
                              }
                              if (!(_c9554)) continue;
                              if (true) {
                                _q9526 = true;
                                break Q9527;
                              }
                            }
                          }
                          if (!(_q9526)) {
                            _q9510 = false;
                            break Q9511;
                          }
                        }
                      }
                    }
                    _c9555 = _q9510;
                  }
                  if (!(_c9555)) continue;
                  if (true) {
                    _q9316 = true;
                    break Q9317;
                  }
                }
              }
              if (!(_q9316)) continue;
              _g9070.push(v_e);
            }
          }
          const _g9556: number[] = [];
          G9557: {
            const _a9800 = v_F;
            for (let _i9801 = 0; _i9801 < _a9800.length; _i9801++) {
              const v_e = _a9800[_i9801];
              let _q9802 = false;
              Q9803: {
                const _f9805 = new Int32Array(sp.edges.length).fill(-1);
                let _l9806: readonly number[] = [];
                const _s9807: number[] = [];
                const _a9804 = sp.cellEdges[v_c];
                for (const _e9808 of _l9806) _f9805[_e9808] = -1;
                _l9806 = _a9804;
                let _i9810 = 0;
                _s9807[0] = 0;
                let _o9814 = _a9804.length === 0;
                for (;;) {
                  if (_a9804.length === 0) {
                    if (!_o9814) break;
                    _o9814 = false;
                  }
                  while (_a9804.length > 0 && _i9810 >= 0) {
                    const _e9808 = _a9804[_i9810];
                    if (_s9807[_i9810] > 0) _f9805[_e9808] = -1;
                    let _r9813 = (cands[_e9808] >= 0 ? cands[_e9808] : (cands[_e9808] = b.cands[_e9808])) & ~((2 << _s9807[_i9810]) - 1);
                    let _d9809 = 0;
                    V9812: for (; _r9813 !== 0; _r9813 &= _r9813 - 1) {
                      _d9809 = 31 - Math.clz32(_r9813 & -_r9813);
                      _f9805[_e9808] = _d9809;
                      if (_e9808 === v_e && _d9809 !== 2) continue;
                      for (let _j9811 = 0; _j9811 < _i9810; _j9811++) {
                        const _y9815 = _a9804[_j9811];
                        if (!((((arms(sp, cl, v_c) === 2) && (_f9805[_e9808] === 1)) && (_f9805[_y9815] === 1)))) continue;
                        if (!((bent(sp, _e9808, _y9815) === (clueAt(cl.piece, v_c) === 3)))) continue V9812;
                      }
                      for (let _j9811 = 0; _j9811 < _i9810; _j9811++) {
                        const _y9816 = _a9804[_j9811];
                        if (!(((((_f9805[_e9808] === 1) && (_f9805[_y9816] === 1)) && !((b.grid[_e9808] !== 0))) && !((b.grid[_y9816] !== 0))))) continue;
                        if (!(!(through(sp, (sp.edgeEnds[2 * _e9808] === v_c ? sp.edgeEnds[2 * _e9808 + 1] : sp.edgeEnds[2 * _e9808]), v_L).includes((sp.edgeEnds[2 * _y9816] === v_c ? sp.edgeEnds[2 * _y9816 + 1] : sp.edgeEnds[2 * _y9816]))))) continue V9812;
                      }
                      break;
                    }
                    if (_r9813 === 0) {
                      _s9807[_i9810] = 0;
                      _i9810--;
                      continue;
                    }
                    _s9807[_i9810] = _d9809;
                    if (_i9810 === _a9804.length - 1) break;
                    _i9810++;
                    _s9807[_i9810] = 0;
                  }
                  if (_i9810 < 0) break;
                  let _g9817 = 0;
                  G9818: {
                    const _a9819 = sp.cellEdges[v_c];
                    for (let _i9820 = 0; _i9820 < _a9819.length; _i9820++) {
                      const v_x = _a9819[_i9820];
                      if (!((_f9805[v_x] === 1))) continue;
                      _g9817++;
                    }
                  }
                  let _c9825: boolean = (_g9817 === arms(sp, cl, v_c));
                  if (_c9825) {
                    let _q9821 = true;
                    Q9822: {
                      const _a9823 = sp.cellEdges[v_c];
                      for (let _i9824 = 0; _i9824 < _a9823.length; _i9824++) {
                        const v_x = _a9823[_i9824];
                        if (!(((_f9805[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                        if (!(!(_eg7622.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                          _q9821 = false;
                          break Q9822;
                        }
                      }
                    }
                    _c9825 = _q9821;
                  }
                  let _c9995: boolean = _c9825;
                  if (_c9995) {
                    let _q9826 = false;
                    Q9827: {
                      const _a9828 = sp.cellEdges[v_c];
                      for (let _i9829 = 0; _i9829 < _a9828.length; _i9829++) {
                        const v_x = _a9828[_i9829];
                        if (!((_f9805[v_x] === 1))) continue;
                        if ((v_K.includes(v_x))) {
                          _q9826 = true;
                          break Q9827;
                        }
                      }
                    }
                    let _c9994: boolean = _q9826;
                    if (!_c9994) {
                      const _g9830: number[] = [];
                      G9831: {
                        const _a9913 = sp.cellEdges[v_c];
                        for (let _i9914 = 0; _i9914 < _a9913.length; _i9914++) {
                          const v_x = _a9913[_i9914];
                          if (!((_f9805[v_x] === 1))) continue;
                          const _t9915 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          const _g9916: number[] = [];
                          G9917: {
                            const _a9955 = sp.cellEdges[_t9915];
                            for (let _i9956 = 0; _i9956 < _a9955.length; _i9956++) {
                              const v_y = _a9955[_i9956];
                              let _c9975: boolean = (v_y !== v_x);
                              if (_c9975) {
                                let _q9957 = false;
                                Q9958: {
                                  const _f9960 = new Int32Array(sp.edges.length).fill(-1);
                                  let _l9961: readonly number[] = [];
                                  const _s9962: number[] = [];
                                  const _a9959 = sp.cellEdges[_t9915];
                                  for (const _e9963 of _l9961) _f9960[_e9963] = -1;
                                  _l9961 = _a9959;
                                  let _i9965 = 0;
                                  _s9962[0] = 0;
                                  let _o9969 = _a9959.length === 0;
                                  for (;;) {
                                    if (_a9959.length === 0) {
                                      if (!_o9969) break;
                                      _o9969 = false;
                                    }
                                    while (_a9959.length > 0 && _i9965 >= 0) {
                                      const _e9963 = _a9959[_i9965];
                                      if (_s9962[_i9965] > 0) _f9960[_e9963] = -1;
                                      let _r9968 = (cands[_e9963] >= 0 ? cands[_e9963] : (cands[_e9963] = b.cands[_e9963])) & ~((2 << _s9962[_i9965]) - 1);
                                      let _d9964 = 0;
                                      V9967: for (; _r9968 !== 0; _r9968 &= _r9968 - 1) {
                                        _d9964 = 31 - Math.clz32(_r9968 & -_r9968);
                                        _f9960[_e9963] = _d9964;
                                        if (_e9963 === v_x && _d9964 !== 1) continue;
                                        if (_e9963 === v_y && _d9964 !== 1) continue;
                                        for (let _j9966 = 0; _j9966 < _i9965; _j9966++) {
                                          const _y9970 = _a9959[_j9966];
                                          if (!((((arms(sp, cl, _t9915) === 2) && (_f9960[_e9963] === 1)) && (_f9960[_y9970] === 1)))) continue;
                                          if (!((bent(sp, _e9963, _y9970) === (clueAt(cl.piece, _t9915) === 3)))) continue V9967;
                                        }
                                        break;
                                      }
                                      if (_r9968 === 0) {
                                        _s9962[_i9965] = 0;
                                        _i9965--;
                                        continue;
                                      }
                                      _s9962[_i9965] = _d9964;
                                      if (_i9965 === _a9959.length - 1) break;
                                      _i9965++;
                                      _s9962[_i9965] = 0;
                                    }
                                    if (_i9965 < 0) break;
                                    let _g9971 = 0;
                                    G9972: {
                                      const _a9973 = sp.cellEdges[_t9915];
                                      for (let _i9974 = 0; _i9974 < _a9973.length; _i9974++) {
                                        const v_z = _a9973[_i9974];
                                        if (!((_f9960[v_z] === 1))) continue;
                                        _g9971++;
                                      }
                                    }
                                    if (!((_g9971 === arms(sp, cl, _t9915)))) continue;
                                    if (true) {
                                      _q9957 = true;
                                      break Q9958;
                                    }
                                  }
                                }
                                _c9975 = _q9957;
                              }
                              if (!(_c9975)) continue;
                              const _t9976 = (sp.edgeEnds[2 * v_y] === _t9915 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              const _t9977 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t9915]);
                              const _g9978: number[] = [];
                              G9979: {
                                const _a9985 = through(sp, _t9976, _t9977);
                                for (let _i9986 = 0; _i9986 < _a9985.length; _i9986++) {
                                  const v_t = _a9985[_i9986];
                                  if (!((arms(sp, cl, v_t) > 1))) continue;
                                  const _a9987 = sp.cellEdges[v_t];
                                  for (let _i9988 = 0; _i9988 < _a9987.length; _i9988++) {
                                    const v_y = _a9987[_i9988];
                                    L9989: {
                                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L9989;
                                      if (!_g9978.includes(v_z)) _g9978.push(v_z);
                                    }
                                  }
                                }
                              }
                              const _a9990 = union(through(sp, _t9976, _t9977), _g9978);
                              for (let _i9991 = 0; _i9991 < _a9990.length; _i9991++) {
                                const v_t = _a9990[_i9991];
                                if (!_g9916.includes(v_t)) _g9916.push(v_t);
                              }
                            }
                          }
                          const _a9992 = union(setOf(_t9915), _g9916);
                          for (let _i9993 = 0; _i9993 < _a9992.length; _i9993++) {
                            const v_t = _a9992[_i9993];
                            if (!_g9830.includes(v_t)) _g9830.push(v_t);
                          }
                        }
                      }
                      _c9994 = (union(setOf(v_c), _g9830).length >= sp.cells.length);
                    }
                    _c9995 = _c9994;
                  }
                  let _c10041: boolean = _c9995;
                  if (_c10041) {
                    let _q9996 = true;
                    Q9997: {
                      const _g9998: number[] = [];
                      G9999: {
                        const _a10002 = sp.cellEdges[v_c];
                        for (let _i10003 = 0; _i10003 < _a10002.length; _i10003++) {
                          const v_x = _a10002[_i10003];
                          if (!((_f9805[v_x] === 1))) continue;
                          _g9998.push(v_x);
                        }
                      }
                      const v_M = union(v_L, _g9998);
                      const _a10004 = sp.cellEdges[v_c];
                      for (let _i10005 = 0; _i10005 < _a10004.length; _i10005++) {
                        const v_x = _a10004[_i10005];
                        L10006: {
                          const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                          let _c10011: boolean = (v_j !== v_c);
                          if (_c10011) {
                            let _q10007 = false;
                            Q10008: {
                              const _a10009 = sp.cellEdges[v_j];
                              for (let _i10010 = 0; _i10010 < _a10009.length; _i10010++) {
                                const v_y = _a10009[_i10010];
                                if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                                  _q10007 = true;
                                  break Q10008;
                                }
                              }
                            }
                            _c10011 = _q10007;
                          }
                          if (!(_c10011)) break L10006;
                          let _q10012 = false;
                          Q10013: {
                            const _f10015 = new Int32Array(sp.edges.length).fill(-1);
                            let _l10016: readonly number[] = [];
                            const _s10017: number[] = [];
                            const _a10014 = sp.cellEdges[v_j];
                            for (const _e10018 of _l10016) _f10015[_e10018] = -1;
                            _l10016 = _a10014;
                            let _i10020 = 0;
                            _s10017[0] = 0;
                            let _o10024 = _a10014.length === 0;
                            for (;;) {
                              if (_a10014.length === 0) {
                                if (!_o10024) break;
                                _o10024 = false;
                              }
                              while (_a10014.length > 0 && _i10020 >= 0) {
                                const _e10018 = _a10014[_i10020];
                                if (_s10017[_i10020] > 0) _f10015[_e10018] = -1;
                                let _r10023 = (cands[_e10018] >= 0 ? cands[_e10018] : (cands[_e10018] = b.cands[_e10018])) & ~((2 << _s10017[_i10020]) - 1);
                                let _d10019 = 0;
                                V10022: for (; _r10023 !== 0; _r10023 &= _r10023 - 1) {
                                  _d10019 = 31 - Math.clz32(_r10023 & -_r10023);
                                  _f10015[_e10018] = _d10019;
                                  for (let _j10021 = 0; _j10021 < _i10020; _j10021++) {
                                    const _y10025 = _a10014[_j10021];
                                    if (!((((arms(sp, cl, v_j) === 2) && (_f10015[_e10018] === 1)) && (_f10015[_y10025] === 1)))) continue;
                                    if (!((bent(sp, _e10018, _y10025) === (clueAt(cl.piece, v_j) === 3)))) continue V10022;
                                  }
                                  for (let _j10021 = 0; _j10021 < _i10020; _j10021++) {
                                    const _y10026 = _a10014[_j10021];
                                    if (!(((((((_f10015[_e10018] === 1) && (_f10015[_y10026] === 1)) && !((b.grid[_e10018] !== 0))) && !((b.grid[_y10026] !== 0))) && !([sp.edgeEnds[2 * _e10018], sp.edgeEnds[2 * _e10018 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y10026], sp.edgeEnds[2 * _y10026 + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, (sp.edgeEnds[2 * _e10018] === v_j ? sp.edgeEnds[2 * _e10018 + 1] : sp.edgeEnds[2 * _e10018]), v_M).includes((sp.edgeEnds[2 * _y10026] === v_j ? sp.edgeEnds[2 * _y10026 + 1] : sp.edgeEnds[2 * _y10026]))))) continue V10022;
                                  }
                                  break;
                                }
                                if (_r10023 === 0) {
                                  _s10017[_i10020] = 0;
                                  _i10020--;
                                  continue;
                                }
                                _s10017[_i10020] = _d10019;
                                if (_i10020 === _a10014.length - 1) break;
                                _i10020++;
                                _s10017[_i10020] = 0;
                              }
                              if (_i10020 < 0) break;
                              let _q10027 = true;
                              Q10028: {
                                const _a10029 = sp.cellEdges[v_j];
                                for (let _i10030 = 0; _i10030 < _a10029.length; _i10030++) {
                                  const v_y = _a10029[_i10030];
                                  if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                                  if (!((_f10015[v_y] === _f9805[v_y]))) {
                                    _q10027 = false;
                                    break Q10028;
                                  }
                                }
                              }
                              let _c10035: boolean = _q10027;
                              if (_c10035) {
                                let _g10031 = 0;
                                G10032: {
                                  const _a10033 = sp.cellEdges[v_j];
                                  for (let _i10034 = 0; _i10034 < _a10033.length; _i10034++) {
                                    const v_y = _a10033[_i10034];
                                    if (!((_f10015[v_y] === 1))) continue;
                                    _g10031++;
                                  }
                                }
                                _c10035 = (_g10031 === arms(sp, cl, v_j));
                              }
                              let _c10040: boolean = _c10035;
                              if (_c10040) {
                                let _q10036 = true;
                                Q10037: {
                                  const _a10038 = sp.cellEdges[v_j];
                                  for (let _i10039 = 0; _i10039 < _a10038.length; _i10039++) {
                                    const v_y = _a10038[_i10039];
                                    if (!((((_f10015[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                    if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                      _q10036 = false;
                                      break Q10037;
                                    }
                                  }
                                }
                                _c10040 = _q10036;
                              }
                              if (!(_c10040)) continue;
                              if (true) {
                                _q10012 = true;
                                break Q10013;
                              }
                            }
                          }
                          if (!(_q10012)) {
                            _q9996 = false;
                            break Q9997;
                          }
                        }
                      }
                    }
                    _c10041 = _q9996;
                  }
                  if (!(_c10041)) continue;
                  if (true) {
                    _q9802 = true;
                    break Q9803;
                  }
                }
              }
              if (!(_q9802)) continue;
              _g9556.push(v_e);
            }
          }
          let _q10042 = true;
          Q10043: {
            const _a10044 = v_F;
            for (let _i10045 = 0; _i10045 < _a10044.length; _i10045++) {
              const v_e = _a10044[_i10045];
              if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
                _q10042 = false;
                break Q10043;
              }
            }
          }
          freshBinding("strandLock", [sameSet(v_L, _g8808), sameSet(v_U, _g8814), sameSet(v_P, _g8898), (sp.cells.includes(v_c)), sameSet(v_F, _g8904), (v_F.length > 0), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g8910), sameSet(v_W, _g9070), sameSet(v_N, _g9556), _q10042], ["L =", "U =", "P =", "c in", "F =", "where of F", "G =", "K =", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q10046 = true;
        Q10047: {
          const _a10048 = v_F;
          for (let _i10049 = 0; _i10049 < _a10048.length; _i10049++) {
            const v_e = _a10048[_i10049];
            let _c10051: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c10051) {
              let _c10050: boolean = !(!(v_W.includes(v_e)));
              if (!_c10050) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c10050 = true;
              }
              _c10051 = _c10050;
            }
            let _c10053: boolean = _c10051;
            if (_c10053) {
              let _c10052: boolean = !(!(v_N.includes(v_e)));
              if (!_c10052) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c10052 = true;
              }
              _c10053 = _c10052;
            }
            if (!(_c10053)) {
              _q10046 = false;
              break Q10047;
            }
          }
        }
        if (!(_q10046)) return -1;
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
let _f10854 = new Int32Array(0);
let _l10855: readonly number[] = [];
let _f10874 = new Int32Array(0);
let _l10875: readonly number[] = [];
const _st11026 = stamps();
let _f11032 = new Int32Array(0);
let _l11033: readonly number[] = [];
const _st11063 = stamps();
let _p11077 = new Int32Array(0);
let _l11078: readonly number[] = [];
let _f11083 = new Int32Array(0);
let _l11084: readonly number[] = [];
const _st11191 = stamps();
const _st11234 = stamps();
let _f11240 = new Int32Array(0);
let _l11241: readonly number[] = [];
const _st11270 = stamps();
let _f11304 = new Int32Array(0);
let _l11305: readonly number[] = [];
let _p11332 = new Int32Array(0);
let _l11333: readonly number[] = [];
let _f11338 = new Int32Array(0);
let _l11339: readonly number[] = [];
const _st11446 = stamps();
const _st11489 = stamps();
let _f11495 = new Int32Array(0);
let _l11496: readonly number[] = [];
const _st11525 = stamps();
let _f11559 = new Int32Array(0);
let _l11560: readonly number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strandNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandNoteBinding> | null): number {
  const _g10799: number[] = [];
  const _g10805: number[] = [];
  if (_f10854.length < sp.edges.length) _f10854 = new Int32Array(sp.edges.length).fill(-1);
  else _f10854.fill(-1);
  _l10855 = [];
  const _s10856: number[] = [];
  if (_f10874.length < sp.edges.length) _f10874 = new Int32Array(sp.edges.length).fill(-1);
  else _f10874.fill(-1);
  _l10875 = [];
  const _s10876: number[] = [];
  const _g10890: number[] = [];
  const _g10903: number[] = [];
  const _g10987: number[] = [];
  if (_f11032.length < sp.edges.length) _f11032 = new Int32Array(sp.edges.length).fill(-1);
  else _f11032.fill(-1);
  _l11033 = [];
  const _s11034: number[] = [];
  const _g11056: number[] = [];
  if (_p11077.length < sp.edges.length) _p11077 = new Int32Array(sp.edges.length);
  else _p11077.fill(0);
  _l11078 = [];
  let _y11079 = false;
  if (_f11083.length < sp.edges.length) _f11083 = new Int32Array(sp.edges.length).fill(-1);
  else _f11083.fill(-1);
  _l11084 = [];
  const _s11085: number[] = [];
  const _g11108: number[] = [];
  const _g11195: number[] = [];
  if (_f11240.length < sp.edges.length) _f11240 = new Int32Array(sp.edges.length).fill(-1);
  else _f11240.fill(-1);
  _l11241 = [];
  const _s11242: number[] = [];
  const _g11263: number[] = [];
  const _g11287: number[] = [];
  if (_f11304.length < sp.edges.length) _f11304 = new Int32Array(sp.edges.length).fill(-1);
  else _f11304.fill(-1);
  _l11305 = [];
  const _s11306: number[] = [];
  if (_p11332.length < sp.edges.length) _p11332 = new Int32Array(sp.edges.length);
  else _p11332.fill(0);
  _l11333 = [];
  let _y11334 = false;
  if (_f11338.length < sp.edges.length) _f11338 = new Int32Array(sp.edges.length).fill(-1);
  else _f11338.fill(-1);
  _l11339 = [];
  const _s11340: number[] = [];
  const _g11363: number[] = [];
  const _g11450: number[] = [];
  if (_f11495.length < sp.edges.length) _f11495 = new Int32Array(sp.edges.length).fill(-1);
  else _f11495.fill(-1);
  _l11496 = [];
  const _s11497: number[] = [];
  const _g11518: number[] = [];
  const _g11542: number[] = [];
  if (_f11559.length < sp.edges.length) _f11559 = new Int32Array(sp.edges.length).fill(-1);
  else _f11559.fill(-1);
  _l11560 = [];
  const _s11561: number[] = [];
  const _g11588: number[] = [];
  const facts = strandNoteFacts;
  let fired = 0;
  let changed = false;
  const _k10865 = armsKept.board(cl);
  const _h11074 = sp.cells.length;
  let _epoch = 0;
  if (strandNoteCands.length < sp.edges.length) strandNoteCands = new Int32Array(sp.edges.length);
  const cands = strandNoteCands;
  cands.fill(-1);
  const _m547_0 = b.made[0];
  _g10799.length = 0;
  G10800: {
    const _a10803 = sp.edges;
    for (let _i10804 = 0; _i10804 < _a10803.length; _i10804++) {
      const v_e = _a10803[_i10804];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g10799.push(v_e);
    }
  }
  const v_L = _g10799;
  const _m550_1 = b.made[1];
  const _eg10902 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g10805.length = 0;
  G10806: {
    const _a10848 = sp.edges;
    for (let _i10849 = 0; _i10849 < _a10848.length; _i10849++) {
      const v_e = _a10848[_i10849];
      const _t10850 = sp.edgeEnds[2 * v_e];
      let _q10851 = false;
      Q10852: {
        const _a10853 = sp.cellEdges[_t10850];
        for (const _e10857 of _l10855) _f10854[_e10857] = -1;
        _l10855 = _a10853;
        let _i10859 = 0;
        _s10856[0] = 0;
        let _o10863 = _a10853.length === 0;
        for (;;) {
          if (_a10853.length === 0) {
            if (!_o10863) break;
            _o10863 = false;
          }
          while (_a10853.length > 0 && _i10859 >= 0) {
            const _e10857 = _a10853[_i10859];
            if (_s10856[_i10859] > 0) _f10854[_e10857] = -1;
            let _r10862 = (cands[_e10857] >= 0 ? cands[_e10857] : (cands[_e10857] = b.cands[_e10857])) & ~((2 << _s10856[_i10859]) - 1);
            let _d10858 = 0;
            V10861: for (; _r10862 !== 0; _r10862 &= _r10862 - 1) {
              _d10858 = 31 - Math.clz32(_r10862 & -_r10862);
              _f10854[_e10857] = _d10858;
              if (_e10857 === v_e && _d10858 !== 1) continue;
              for (let _j10860 = 0; _j10860 < _i10859; _j10860++) {
                const _y10864 = _a10853[_j10860];
                if (!(((((_k10865[_t10850] ?? arms(sp, cl, _t10850)) === 2) && (_f10854[_e10857] === 1)) && (_f10854[_y10864] === 1)))) continue;
                if (!((bent(sp, _e10857, _y10864) === (clueAt(cl.piece, _t10850) === 3)))) continue V10861;
              }
              break;
            }
            if (_r10862 === 0) {
              _s10856[_i10859] = 0;
              _i10859--;
              continue;
            }
            _s10856[_i10859] = _d10858;
            if (_i10859 === _a10853.length - 1) break;
            _i10859++;
            _s10856[_i10859] = 0;
          }
          if (_i10859 < 0) break;
          let _g10866 = 0;
          G10867: {
            const _a10868 = sp.cellEdges[_t10850];
            for (let _i10869 = 0; _i10869 < _a10868.length; _i10869++) {
              const v_x = _a10868[_i10869];
              if (!((_f10854[v_x] === 1))) continue;
              _g10866++;
            }
          }
          if (!((_g10866 === (_k10865[_t10850] ?? arms(sp, cl, _t10850))))) continue;
          if (true) {
            _q10851 = true;
            break Q10852;
          }
        }
      }
      let _c10889: boolean = _q10851;
      if (_c10889) {
        const _t10870 = sp.edgeEnds[2 * v_e + 1];
        let _q10871 = false;
        Q10872: {
          const _a10873 = sp.cellEdges[_t10870];
          for (const _e10877 of _l10875) _f10874[_e10877] = -1;
          _l10875 = _a10873;
          let _i10879 = 0;
          _s10876[0] = 0;
          let _o10883 = _a10873.length === 0;
          for (;;) {
            if (_a10873.length === 0) {
              if (!_o10883) break;
              _o10883 = false;
            }
            while (_a10873.length > 0 && _i10879 >= 0) {
              const _e10877 = _a10873[_i10879];
              if (_s10876[_i10879] > 0) _f10874[_e10877] = -1;
              let _r10882 = (cands[_e10877] >= 0 ? cands[_e10877] : (cands[_e10877] = b.cands[_e10877])) & ~((2 << _s10876[_i10879]) - 1);
              let _d10878 = 0;
              V10881: for (; _r10882 !== 0; _r10882 &= _r10882 - 1) {
                _d10878 = 31 - Math.clz32(_r10882 & -_r10882);
                _f10874[_e10877] = _d10878;
                if (_e10877 === v_e && _d10878 !== 1) continue;
                for (let _j10880 = 0; _j10880 < _i10879; _j10880++) {
                  const _y10884 = _a10873[_j10880];
                  if (!(((((_k10865[_t10870] ?? arms(sp, cl, _t10870)) === 2) && (_f10874[_e10877] === 1)) && (_f10874[_y10884] === 1)))) continue;
                  if (!((bent(sp, _e10877, _y10884) === (clueAt(cl.piece, _t10870) === 3)))) continue V10881;
                }
                break;
              }
              if (_r10882 === 0) {
                _s10876[_i10879] = 0;
                _i10879--;
                continue;
              }
              _s10876[_i10879] = _d10878;
              if (_i10879 === _a10873.length - 1) break;
              _i10879++;
              _s10876[_i10879] = 0;
            }
            if (_i10879 < 0) break;
            let _g10885 = 0;
            G10886: {
              const _a10887 = sp.cellEdges[_t10870];
              for (let _i10888 = 0; _i10888 < _a10887.length; _i10888++) {
                const v_x = _a10887[_i10888];
                if (!((_f10874[v_x] === 1))) continue;
                _g10885++;
              }
            }
            if (!((_g10885 === (_k10865[_t10870] ?? arms(sp, cl, _t10870))))) continue;
            if (true) {
              _q10871 = true;
              break Q10872;
            }
          }
        }
        _c10889 = _q10871;
      }
      if (!(_c10889)) continue;
      _g10805.push(v_e);
    }
  }
  const v_U = _g10805;
  const _mm11069 = memberMarks(v_U);
  _g10890.length = 0;
  G10891: {
    const _a10894 = v_U;
    for (let _i10895 = 0; _i10895 < _a10894.length; _i10895++) {
      const v_e = _a10894[_i10895];
      if (!((((_k10865[sp.edgeEnds[2 * v_e]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e])) > 1) && ((_k10865[sp.edgeEnds[2 * v_e + 1]] ?? arms(sp, cl, sp.edgeEnds[2 * v_e + 1])) > 1)))) continue;
      _g10890.push(v_e);
    }
  }
  const v_P = _g10890;
  const _a10896 = sp.cells;
  for (let _i10897 = 0; _i10897 < _a10896.length; _i10897++) {
    const v_c = _a10896[_i10897];
    const _h11048 = minus(v_P, sp.cellEdges[v_c]);
    let _q10898 = false;
    Q10899: {
      const _a10900 = sp.cellEdges[v_c];
      for (let _i10901 = 0; _i10901 < _a10900.length; _i10901++) {
        const v_e = _a10900[_i10901];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        if (true) {
          _q10898 = true;
          break Q10899;
        }
      }
    }
    if (!(_q10898)) continue;
    const v_G = _eg10902.of(v_c);
    _g10903.length = 0;
    G10904: {
      const _a10984 = sp.cellEdges[v_c];
      for (let _i10985 = 0; _i10985 < _a10984.length; _i10985++) {
        const v_x = _a10984[_i10985];
        const _t10986 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        const _h11049 = minus(_h11048, sp.cellEdges[_t10986]);
        const _eg11051 = edgeGroups(sp, _h11049);
        const _memo11054 = new Map<readonly number[], readonly number[]>();
        _g10987.length = 0;
        _st11026.pass++;
        G10988: {
          const _a11027 = sp.cellEdges[_t10986];
          for (let _i11028 = 0; _i11028 < _a11027.length; _i11028++) {
            const v_y = _a11027[_i11028];
            let _c11047: boolean = (v_y !== v_x);
            if (_c11047) {
              let _q11029 = false;
              Q11030: {
                const _a11031 = sp.cellEdges[_t10986];
                for (const _e11035 of _l11033) _f11032[_e11035] = -1;
                _l11033 = _a11031;
                let _i11037 = 0;
                _s11034[0] = 0;
                let _o11041 = _a11031.length === 0;
                for (;;) {
                  if (_a11031.length === 0) {
                    if (!_o11041) break;
                    _o11041 = false;
                  }
                  while (_a11031.length > 0 && _i11037 >= 0) {
                    const _e11035 = _a11031[_i11037];
                    if (_s11034[_i11037] > 0) _f11032[_e11035] = -1;
                    let _r11040 = (cands[_e11035] >= 0 ? cands[_e11035] : (cands[_e11035] = b.cands[_e11035])) & ~((2 << _s11034[_i11037]) - 1);
                    let _d11036 = 0;
                    V11039: for (; _r11040 !== 0; _r11040 &= _r11040 - 1) {
                      _d11036 = 31 - Math.clz32(_r11040 & -_r11040);
                      _f11032[_e11035] = _d11036;
                      if (_e11035 === v_x && _d11036 !== 1) continue;
                      if (_e11035 === v_y && _d11036 !== 1) continue;
                      for (let _j11038 = 0; _j11038 < _i11037; _j11038++) {
                        const _y11042 = _a11031[_j11038];
                        if (!(((((_k10865[_t10986] ?? arms(sp, cl, _t10986)) === 2) && (_f11032[_e11035] === 1)) && (_f11032[_y11042] === 1)))) continue;
                        if (!((bent(sp, _e11035, _y11042) === (clueAt(cl.piece, _t10986) === 3)))) continue V11039;
                      }
                      break;
                    }
                    if (_r11040 === 0) {
                      _s11034[_i11037] = 0;
                      _i11037--;
                      continue;
                    }
                    _s11034[_i11037] = _d11036;
                    if (_i11037 === _a11031.length - 1) break;
                    _i11037++;
                    _s11034[_i11037] = 0;
                  }
                  if (_i11037 < 0) break;
                  let _g11043 = 0;
                  G11044: {
                    const _a11045 = sp.cellEdges[_t10986];
                    for (let _i11046 = 0; _i11046 < _a11045.length; _i11046++) {
                      const v_z = _a11045[_i11046];
                      if (!((_f11032[v_z] === 1))) continue;
                      _g11043++;
                    }
                  }
                  if (!((_g11043 === (_k10865[_t10986] ?? arms(sp, cl, _t10986))))) continue;
                  if (true) {
                    _q11029 = true;
                    break Q11030;
                  }
                }
              }
              _c11047 = _q11029;
            }
            if (!(_c11047)) continue;
            const _t11050 = (sp.edgeEnds[2 * v_y] === _t10986 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t11053 = _eg11051.of(_t11050);
            let _gs11055 = _memo11054.get(_t11053);
            if (_gs11055 === undefined) {
              _g11056.length = 0;
              _st11063.pass++;
              G11057: {
                const _a11064 = _t11053;
                for (let _i11065 = 0; _i11065 < _a11064.length; _i11065++) {
                  const v_t = _a11064[_i11065];
                  if (!(((_k10865[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                  const _a11066 = sp.cellEdges[v_t];
                  for (let _i11067 = 0; _i11067 < _a11066.length; _i11067++) {
                    const v_y = _a11066[_i11067];
                    L11068: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!((((_k10865[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm11069[v_y + 1] === 1)))) break L11068;
                      const _t11070 = v_z;
                      if (_g11056.length < 16) { if (!_g11056.includes(_t11070)) _g11056.push(_t11070); } else addOnce(_g11056, _st11063, _t11070);
                    }
                  }
                }
              }
              _gs11055 = _g11056.slice();
              _memo11054.set(_t11053, _gs11055);
            }
            const _a11071 = union(_eg11051.of(_t11050), _gs11055);
            for (let _i11072 = 0; _i11072 < _a11071.length; _i11072++) {
              const v_t = _a11071[_i11072];
              const _t11073 = v_t;
              if (_g10987.length < 16) { if (!_g10987.includes(_t11073)) _g10987.push(_t11073); } else addOnce(_g10987, _st11026, _t11073);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t10986), _g10987)).length >= _h11074))) continue;
        _g10903.push(v_x);
      }
    }
    const v_K = _g10903;
    let _g11080 = -1;
    let _g11335 = -1;
    const _a11075 = sp.cellEdges[v_c];
    for (let _i11076 = 0; _i11076 < _a11075.length; _i11076++) {
      const v_e = _a11075[_i11076];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g11080 !== _epoch) {
        _g11080 = _epoch;
        for (const _e11081 of _l11078) _p11077[_e11081] = 0;
        _y11079 = false;
        const _a11082 = sp.cellEdges[v_c];
        for (const _e11086 of _l11084) _f11083[_e11086] = -1;
        _l11084 = _a11082;
        let _i11088 = 0;
        _s11085[0] = 0;
        let _o11092 = _a11082.length === 0;
        for (;;) {
          if (_a11082.length === 0) {
            if (!_o11092) break;
            _o11092 = false;
          }
          while (_a11082.length > 0 && _i11088 >= 0) {
            const _e11086 = _a11082[_i11088];
            if (_s11085[_i11088] > 0) _f11083[_e11086] = -1;
            let _r11091 = (cands[_e11086] >= 0 ? cands[_e11086] : (cands[_e11086] = b.cands[_e11086])) & ~((2 << _s11085[_i11088]) - 1);
            let _d11087 = 0;
            V11090: for (; _r11091 !== 0; _r11091 &= _r11091 - 1) {
              _d11087 = 31 - Math.clz32(_r11091 & -_r11091);
              _f11083[_e11086] = _d11087;
              for (let _j11089 = 0; _j11089 < _i11088; _j11089++) {
                const _y11093 = _a11082[_j11089];
                if (!(((((_k10865[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f11083[_e11086] === 1)) && (_f11083[_y11093] === 1)))) continue;
                if (!((bent(sp, _e11086, _y11093) === (clueAt(cl.piece, v_c) === 3)))) continue V11090;
              }
              for (let _j11089 = 0; _j11089 < _i11088; _j11089++) {
                const _y11094 = _a11082[_j11089];
                if (!(((((_f11083[_e11086] === 1) && (_f11083[_y11094] === 1)) && !((b.grid[_e11086] !== 0))) && !((b.grid[_y11094] !== 0))))) continue;
                if (!(!(_eg10902.of((sp.edgeEnds[2 * _y11094] === v_c ? sp.edgeEnds[2 * _y11094 + 1] : sp.edgeEnds[2 * _y11094])) === _eg10902.of((sp.edgeEnds[2 * _e11086] === v_c ? sp.edgeEnds[2 * _e11086 + 1] : sp.edgeEnds[2 * _e11086]))))) continue V11090;
              }
              break;
            }
            if (_r11091 === 0) {
              _s11085[_i11088] = 0;
              _i11088--;
              continue;
            }
            _s11085[_i11088] = _d11087;
            if (_i11088 === _a11082.length - 1) break;
            _i11088++;
            _s11085[_i11088] = 0;
          }
          if (_i11088 < 0) break;
          let _g11095 = 0;
          G11096: {
            const _a11097 = sp.cellEdges[v_c];
            for (let _i11098 = 0; _i11098 < _a11097.length; _i11098++) {
              const v_x = _a11097[_i11098];
              if (!((_f11083[v_x] === 1))) continue;
              _g11095++;
            }
          }
          let _c11103: boolean = (_g11095 === (_k10865[v_c] ?? arms(sp, cl, v_c)));
          if (_c11103) {
            let _q11099 = true;
            Q11100: {
              const _a11101 = sp.cellEdges[v_c];
              for (let _i11102 = 0; _i11102 < _a11101.length; _i11102++) {
                const v_x = _a11101[_i11102];
                if (!(((_f11083[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg10902.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q11099 = false;
                  break Q11100;
                }
              }
            }
            _c11103 = _q11099;
          }
          let _c11284: boolean = _c11103;
          if (_c11284) {
            let _q11104 = false;
            Q11105: {
              const _a11106 = sp.cellEdges[v_c];
              for (let _i11107 = 0; _i11107 < _a11106.length; _i11107++) {
                const v_x = _a11106[_i11107];
                if (!((_f11083[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q11104 = true;
                  break Q11105;
                }
              }
            }
            let _c11283: boolean = _q11104;
            if (!_c11283) {
              _g11108.length = 0;
              _st11191.pass++;
              G11109: {
                const _a11192 = sp.cellEdges[v_c];
                for (let _i11193 = 0; _i11193 < _a11192.length; _i11193++) {
                  const v_x = _a11192[_i11193];
                  if (!((_f11083[v_x] === 1))) continue;
                  const _t11194 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h11256 = minus(_h11048, sp.cellEdges[_t11194]);
                  const _eg11258 = edgeGroups(sp, _h11256);
                  const _memo11261 = new Map<readonly number[], readonly number[]>();
                  _g11195.length = 0;
                  _st11234.pass++;
                  G11196: {
                    const _a11235 = sp.cellEdges[_t11194];
                    for (let _i11236 = 0; _i11236 < _a11235.length; _i11236++) {
                      const v_y = _a11235[_i11236];
                      let _c11255: boolean = (v_y !== v_x);
                      if (_c11255) {
                        let _q11237 = false;
                        Q11238: {
                          const _a11239 = sp.cellEdges[_t11194];
                          for (const _e11243 of _l11241) _f11240[_e11243] = -1;
                          _l11241 = _a11239;
                          let _i11245 = 0;
                          _s11242[0] = 0;
                          let _o11249 = _a11239.length === 0;
                          for (;;) {
                            if (_a11239.length === 0) {
                              if (!_o11249) break;
                              _o11249 = false;
                            }
                            while (_a11239.length > 0 && _i11245 >= 0) {
                              const _e11243 = _a11239[_i11245];
                              if (_s11242[_i11245] > 0) _f11240[_e11243] = -1;
                              let _r11248 = (cands[_e11243] >= 0 ? cands[_e11243] : (cands[_e11243] = b.cands[_e11243])) & ~((2 << _s11242[_i11245]) - 1);
                              let _d11244 = 0;
                              V11247: for (; _r11248 !== 0; _r11248 &= _r11248 - 1) {
                                _d11244 = 31 - Math.clz32(_r11248 & -_r11248);
                                _f11240[_e11243] = _d11244;
                                if (_e11243 === v_x && _d11244 !== 1) continue;
                                if (_e11243 === v_y && _d11244 !== 1) continue;
                                for (let _j11246 = 0; _j11246 < _i11245; _j11246++) {
                                  const _y11250 = _a11239[_j11246];
                                  if (!(((((_k10865[_t11194] ?? arms(sp, cl, _t11194)) === 2) && (_f11240[_e11243] === 1)) && (_f11240[_y11250] === 1)))) continue;
                                  if (!((bent(sp, _e11243, _y11250) === (clueAt(cl.piece, _t11194) === 3)))) continue V11247;
                                }
                                break;
                              }
                              if (_r11248 === 0) {
                                _s11242[_i11245] = 0;
                                _i11245--;
                                continue;
                              }
                              _s11242[_i11245] = _d11244;
                              if (_i11245 === _a11239.length - 1) break;
                              _i11245++;
                              _s11242[_i11245] = 0;
                            }
                            if (_i11245 < 0) break;
                            let _g11251 = 0;
                            G11252: {
                              const _a11253 = sp.cellEdges[_t11194];
                              for (let _i11254 = 0; _i11254 < _a11253.length; _i11254++) {
                                const v_z = _a11253[_i11254];
                                if (!((_f11240[v_z] === 1))) continue;
                                _g11251++;
                              }
                            }
                            if (!((_g11251 === (_k10865[_t11194] ?? arms(sp, cl, _t11194))))) continue;
                            if (true) {
                              _q11237 = true;
                              break Q11238;
                            }
                          }
                        }
                        _c11255 = _q11237;
                      }
                      if (!(_c11255)) continue;
                      const _t11257 = (sp.edgeEnds[2 * v_y] === _t11194 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t11260 = _eg11258.of(_t11257);
                      let _gs11262 = _memo11261.get(_t11260);
                      if (_gs11262 === undefined) {
                        _g11263.length = 0;
                        _st11270.pass++;
                        G11264: {
                          const _a11271 = _t11260;
                          for (let _i11272 = 0; _i11272 < _a11271.length; _i11272++) {
                            const v_t = _a11271[_i11272];
                            if (!(((_k10865[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a11273 = sp.cellEdges[v_t];
                            for (let _i11274 = 0; _i11274 < _a11273.length; _i11274++) {
                              const v_y = _a11273[_i11274];
                              L11275: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k10865[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm11069[v_y + 1] === 1)))) break L11275;
                                const _t11276 = v_z;
                                if (_g11263.length < 16) { if (!_g11263.includes(_t11276)) _g11263.push(_t11276); } else addOnce(_g11263, _st11270, _t11276);
                              }
                            }
                          }
                        }
                        _gs11262 = _g11263.slice();
                        _memo11261.set(_t11260, _gs11262);
                      }
                      const _a11277 = union(_eg11258.of(_t11257), _gs11262);
                      for (let _i11278 = 0; _i11278 < _a11277.length; _i11278++) {
                        const v_t = _a11277[_i11278];
                        const _t11279 = v_t;
                        if (_g11195.length < 16) { if (!_g11195.includes(_t11279)) _g11195.push(_t11279); } else addOnce(_g11195, _st11234, _t11279);
                      }
                    }
                  }
                  const _a11280 = union(setOf(_t11194), _g11195);
                  for (let _i11281 = 0; _i11281 < _a11280.length; _i11281++) {
                    const v_t = _a11280[_i11281];
                    const _t11282 = v_t;
                    if (_g11108.length < 16) { if (!_g11108.includes(_t11282)) _g11108.push(_t11282); } else addOnce(_g11108, _st11191, _t11282);
                  }
                }
              }
              _c11283 = (union(setOf(v_c), _g11108).length >= _h11074);
            }
            _c11284 = _c11283;
          }
          let _c11331: boolean = _c11284;
          if (_c11331) {
            let _q11285 = true;
            Q11286: {
              _g11287.length = 0;
              G11288: {
                const _a11291 = sp.cellEdges[v_c];
                for (let _i11292 = 0; _i11292 < _a11291.length; _i11292++) {
                  const v_x = _a11291[_i11292];
                  if (!((_f11083[v_x] === 1))) continue;
                  _g11287.push(v_x);
                }
              }
              const v_M = union(v_L, _g11287);
              const _eg11316 = edgeGroups(sp, v_M);
              const _a11293 = sp.cellEdges[v_c];
              for (let _i11294 = 0; _i11294 < _a11293.length; _i11294++) {
                const v_x = _a11293[_i11294];
                L11295: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c11300: boolean = (v_j !== v_c);
                  if (_c11300) {
                    let _q11296 = false;
                    Q11297: {
                      const _a11298 = sp.cellEdges[v_j];
                      for (let _i11299 = 0; _i11299 < _a11298.length; _i11299++) {
                        const v_y = _a11298[_i11299];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q11296 = true;
                          break Q11297;
                        }
                      }
                    }
                    _c11300 = _q11296;
                  }
                  if (!(_c11300)) break L11295;
                  let _q11301 = false;
                  Q11302: {
                    const _a11303 = sp.cellEdges[v_j];
                    for (const _e11307 of _l11305) _f11304[_e11307] = -1;
                    _l11305 = _a11303;
                    let _i11309 = 0;
                    _s11306[0] = 0;
                    let _o11313 = _a11303.length === 0;
                    for (;;) {
                      if (_a11303.length === 0) {
                        if (!_o11313) break;
                        _o11313 = false;
                      }
                      while (_a11303.length > 0 && _i11309 >= 0) {
                        const _e11307 = _a11303[_i11309];
                        if (_s11306[_i11309] > 0) _f11304[_e11307] = -1;
                        let _r11312 = (cands[_e11307] >= 0 ? cands[_e11307] : (cands[_e11307] = b.cands[_e11307])) & ~((2 << _s11306[_i11309]) - 1);
                        let _d11308 = 0;
                        V11311: for (; _r11312 !== 0; _r11312 &= _r11312 - 1) {
                          _d11308 = 31 - Math.clz32(_r11312 & -_r11312);
                          _f11304[_e11307] = _d11308;
                          for (let _j11310 = 0; _j11310 < _i11309; _j11310++) {
                            const _y11314 = _a11303[_j11310];
                            if (!(((((_k10865[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f11304[_e11307] === 1)) && (_f11304[_y11314] === 1)))) continue;
                            if (!((bent(sp, _e11307, _y11314) === (clueAt(cl.piece, v_j) === 3)))) continue V11311;
                          }
                          for (let _j11310 = 0; _j11310 < _i11309; _j11310++) {
                            const _y11315 = _a11303[_j11310];
                            if (!(((((((_f11304[_e11307] === 1) && (_f11304[_y11315] === 1)) && !((b.grid[_e11307] !== 0))) && !((b.grid[_y11315] !== 0))) && !([sp.edgeEnds[2 * _e11307], sp.edgeEnds[2 * _e11307 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y11315], sp.edgeEnds[2 * _y11315 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg11316.of((sp.edgeEnds[2 * _y11315] === v_j ? sp.edgeEnds[2 * _y11315 + 1] : sp.edgeEnds[2 * _y11315])) === _eg11316.of((sp.edgeEnds[2 * _e11307] === v_j ? sp.edgeEnds[2 * _e11307 + 1] : sp.edgeEnds[2 * _e11307]))))) continue V11311;
                          }
                          break;
                        }
                        if (_r11312 === 0) {
                          _s11306[_i11309] = 0;
                          _i11309--;
                          continue;
                        }
                        _s11306[_i11309] = _d11308;
                        if (_i11309 === _a11303.length - 1) break;
                        _i11309++;
                        _s11306[_i11309] = 0;
                      }
                      if (_i11309 < 0) break;
                      let _q11317 = true;
                      Q11318: {
                        const _a11319 = sp.cellEdges[v_j];
                        for (let _i11320 = 0; _i11320 < _a11319.length; _i11320++) {
                          const v_y = _a11319[_i11320];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f11304[v_y] === _f11083[v_y]))) {
                            _q11317 = false;
                            break Q11318;
                          }
                        }
                      }
                      let _c11325: boolean = _q11317;
                      if (_c11325) {
                        let _g11321 = 0;
                        G11322: {
                          const _a11323 = sp.cellEdges[v_j];
                          for (let _i11324 = 0; _i11324 < _a11323.length; _i11324++) {
                            const v_y = _a11323[_i11324];
                            if (!((_f11304[v_y] === 1))) continue;
                            _g11321++;
                          }
                        }
                        _c11325 = (_g11321 === (_k10865[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c11330: boolean = _c11325;
                      if (_c11330) {
                        let _q11326 = true;
                        Q11327: {
                          const _a11328 = sp.cellEdges[v_j];
                          for (let _i11329 = 0; _i11329 < _a11328.length; _i11329++) {
                            const v_y = _a11328[_i11329];
                            if (!((((_f11304[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg11316.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg11316.of(v_j)))) {
                              _q11326 = false;
                              break Q11327;
                            }
                          }
                        }
                        _c11330 = _q11326;
                      }
                      if (!(_c11330)) continue;
                      if (true) {
                        _q11301 = true;
                        break Q11302;
                      }
                    }
                  }
                  if (!(_q11301)) {
                    _q11285 = false;
                    break Q11286;
                  }
                }
              }
            }
            _c11331 = _q11285;
          }
          if (!(_c11331)) continue;
          if (!(true)) continue;
          _l11078 = _a11082;
          _y11079 = true;
          for (const _e11081 of _a11082) _p11077[_e11081] |= 1 << _f11083[_e11081];
        }
      }
      const v_A = ((((_p11077[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y11079 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g11335 !== _epoch) {
        _g11335 = _epoch;
        for (const _e11336 of _l11333) _p11332[_e11336] = 0;
        _y11334 = false;
        const _a11337 = sp.cellEdges[v_c];
        for (const _e11341 of _l11339) _f11338[_e11341] = -1;
        _l11339 = _a11337;
        let _i11343 = 0;
        _s11340[0] = 0;
        let _o11347 = _a11337.length === 0;
        for (;;) {
          if (_a11337.length === 0) {
            if (!_o11347) break;
            _o11347 = false;
          }
          while (_a11337.length > 0 && _i11343 >= 0) {
            const _e11341 = _a11337[_i11343];
            if (_s11340[_i11343] > 0) _f11338[_e11341] = -1;
            let _r11346 = (cands[_e11341] >= 0 ? cands[_e11341] : (cands[_e11341] = b.cands[_e11341])) & ~((2 << _s11340[_i11343]) - 1);
            let _d11342 = 0;
            V11345: for (; _r11346 !== 0; _r11346 &= _r11346 - 1) {
              _d11342 = 31 - Math.clz32(_r11346 & -_r11346);
              _f11338[_e11341] = _d11342;
              for (let _j11344 = 0; _j11344 < _i11343; _j11344++) {
                const _y11348 = _a11337[_j11344];
                if (!(((((_k10865[v_c] ?? arms(sp, cl, v_c)) === 2) && (_f11338[_e11341] === 1)) && (_f11338[_y11348] === 1)))) continue;
                if (!((bent(sp, _e11341, _y11348) === (clueAt(cl.piece, v_c) === 3)))) continue V11345;
              }
              for (let _j11344 = 0; _j11344 < _i11343; _j11344++) {
                const _y11349 = _a11337[_j11344];
                if (!(((((_f11338[_e11341] === 1) && (_f11338[_y11349] === 1)) && !((b.grid[_e11341] !== 0))) && !((b.grid[_y11349] !== 0))))) continue;
                if (!(!(_eg10902.of((sp.edgeEnds[2 * _y11349] === v_c ? sp.edgeEnds[2 * _y11349 + 1] : sp.edgeEnds[2 * _y11349])) === _eg10902.of((sp.edgeEnds[2 * _e11341] === v_c ? sp.edgeEnds[2 * _e11341 + 1] : sp.edgeEnds[2 * _e11341]))))) continue V11345;
              }
              break;
            }
            if (_r11346 === 0) {
              _s11340[_i11343] = 0;
              _i11343--;
              continue;
            }
            _s11340[_i11343] = _d11342;
            if (_i11343 === _a11337.length - 1) break;
            _i11343++;
            _s11340[_i11343] = 0;
          }
          if (_i11343 < 0) break;
          let _g11350 = 0;
          G11351: {
            const _a11352 = sp.cellEdges[v_c];
            for (let _i11353 = 0; _i11353 < _a11352.length; _i11353++) {
              const v_x = _a11352[_i11353];
              if (!((_f11338[v_x] === 1))) continue;
              _g11350++;
            }
          }
          let _c11358: boolean = (_g11350 === (_k10865[v_c] ?? arms(sp, cl, v_c)));
          if (_c11358) {
            let _q11354 = true;
            Q11355: {
              const _a11356 = sp.cellEdges[v_c];
              for (let _i11357 = 0; _i11357 < _a11356.length; _i11357++) {
                const v_x = _a11356[_i11357];
                if (!(((_f11338[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg10902.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q11354 = false;
                  break Q11355;
                }
              }
            }
            _c11358 = _q11354;
          }
          let _c11539: boolean = _c11358;
          if (_c11539) {
            let _q11359 = false;
            Q11360: {
              const _a11361 = sp.cellEdges[v_c];
              for (let _i11362 = 0; _i11362 < _a11361.length; _i11362++) {
                const v_x = _a11361[_i11362];
                if (!((_f11338[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q11359 = true;
                  break Q11360;
                }
              }
            }
            let _c11538: boolean = _q11359;
            if (!_c11538) {
              _g11363.length = 0;
              _st11446.pass++;
              G11364: {
                const _a11447 = sp.cellEdges[v_c];
                for (let _i11448 = 0; _i11448 < _a11447.length; _i11448++) {
                  const v_x = _a11447[_i11448];
                  if (!((_f11338[v_x] === 1))) continue;
                  const _t11449 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  const _h11511 = minus(_h11048, sp.cellEdges[_t11449]);
                  const _eg11513 = edgeGroups(sp, _h11511);
                  const _memo11516 = new Map<readonly number[], readonly number[]>();
                  _g11450.length = 0;
                  _st11489.pass++;
                  G11451: {
                    const _a11490 = sp.cellEdges[_t11449];
                    for (let _i11491 = 0; _i11491 < _a11490.length; _i11491++) {
                      const v_y = _a11490[_i11491];
                      let _c11510: boolean = (v_y !== v_x);
                      if (_c11510) {
                        let _q11492 = false;
                        Q11493: {
                          const _a11494 = sp.cellEdges[_t11449];
                          for (const _e11498 of _l11496) _f11495[_e11498] = -1;
                          _l11496 = _a11494;
                          let _i11500 = 0;
                          _s11497[0] = 0;
                          let _o11504 = _a11494.length === 0;
                          for (;;) {
                            if (_a11494.length === 0) {
                              if (!_o11504) break;
                              _o11504 = false;
                            }
                            while (_a11494.length > 0 && _i11500 >= 0) {
                              const _e11498 = _a11494[_i11500];
                              if (_s11497[_i11500] > 0) _f11495[_e11498] = -1;
                              let _r11503 = (cands[_e11498] >= 0 ? cands[_e11498] : (cands[_e11498] = b.cands[_e11498])) & ~((2 << _s11497[_i11500]) - 1);
                              let _d11499 = 0;
                              V11502: for (; _r11503 !== 0; _r11503 &= _r11503 - 1) {
                                _d11499 = 31 - Math.clz32(_r11503 & -_r11503);
                                _f11495[_e11498] = _d11499;
                                if (_e11498 === v_x && _d11499 !== 1) continue;
                                if (_e11498 === v_y && _d11499 !== 1) continue;
                                for (let _j11501 = 0; _j11501 < _i11500; _j11501++) {
                                  const _y11505 = _a11494[_j11501];
                                  if (!(((((_k10865[_t11449] ?? arms(sp, cl, _t11449)) === 2) && (_f11495[_e11498] === 1)) && (_f11495[_y11505] === 1)))) continue;
                                  if (!((bent(sp, _e11498, _y11505) === (clueAt(cl.piece, _t11449) === 3)))) continue V11502;
                                }
                                break;
                              }
                              if (_r11503 === 0) {
                                _s11497[_i11500] = 0;
                                _i11500--;
                                continue;
                              }
                              _s11497[_i11500] = _d11499;
                              if (_i11500 === _a11494.length - 1) break;
                              _i11500++;
                              _s11497[_i11500] = 0;
                            }
                            if (_i11500 < 0) break;
                            let _g11506 = 0;
                            G11507: {
                              const _a11508 = sp.cellEdges[_t11449];
                              for (let _i11509 = 0; _i11509 < _a11508.length; _i11509++) {
                                const v_z = _a11508[_i11509];
                                if (!((_f11495[v_z] === 1))) continue;
                                _g11506++;
                              }
                            }
                            if (!((_g11506 === (_k10865[_t11449] ?? arms(sp, cl, _t11449))))) continue;
                            if (true) {
                              _q11492 = true;
                              break Q11493;
                            }
                          }
                        }
                        _c11510 = _q11492;
                      }
                      if (!(_c11510)) continue;
                      const _t11512 = (sp.edgeEnds[2 * v_y] === _t11449 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t11515 = _eg11513.of(_t11512);
                      let _gs11517 = _memo11516.get(_t11515);
                      if (_gs11517 === undefined) {
                        _g11518.length = 0;
                        _st11525.pass++;
                        G11519: {
                          const _a11526 = _t11515;
                          for (let _i11527 = 0; _i11527 < _a11526.length; _i11527++) {
                            const v_t = _a11526[_i11527];
                            if (!(((_k10865[v_t] ?? arms(sp, cl, v_t)) > 1))) continue;
                            const _a11528 = sp.cellEdges[v_t];
                            for (let _i11529 = 0; _i11529 < _a11528.length; _i11529++) {
                              const v_y = _a11528[_i11529];
                              L11530: {
                                const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                if (!((((_k10865[v_z] ?? arms(sp, cl, v_z)) === 1) && (_mm11069[v_y + 1] === 1)))) break L11530;
                                const _t11531 = v_z;
                                if (_g11518.length < 16) { if (!_g11518.includes(_t11531)) _g11518.push(_t11531); } else addOnce(_g11518, _st11525, _t11531);
                              }
                            }
                          }
                        }
                        _gs11517 = _g11518.slice();
                        _memo11516.set(_t11515, _gs11517);
                      }
                      const _a11532 = union(_eg11513.of(_t11512), _gs11517);
                      for (let _i11533 = 0; _i11533 < _a11532.length; _i11533++) {
                        const v_t = _a11532[_i11533];
                        const _t11534 = v_t;
                        if (_g11450.length < 16) { if (!_g11450.includes(_t11534)) _g11450.push(_t11534); } else addOnce(_g11450, _st11489, _t11534);
                      }
                    }
                  }
                  const _a11535 = union(setOf(_t11449), _g11450);
                  for (let _i11536 = 0; _i11536 < _a11535.length; _i11536++) {
                    const v_t = _a11535[_i11536];
                    const _t11537 = v_t;
                    if (_g11363.length < 16) { if (!_g11363.includes(_t11537)) _g11363.push(_t11537); } else addOnce(_g11363, _st11446, _t11537);
                  }
                }
              }
              _c11538 = (union(setOf(v_c), _g11363).length >= _h11074);
            }
            _c11539 = _c11538;
          }
          let _c11586: boolean = _c11539;
          if (_c11586) {
            let _q11540 = true;
            Q11541: {
              _g11542.length = 0;
              G11543: {
                const _a11546 = sp.cellEdges[v_c];
                for (let _i11547 = 0; _i11547 < _a11546.length; _i11547++) {
                  const v_x = _a11546[_i11547];
                  if (!((_f11338[v_x] === 1))) continue;
                  _g11542.push(v_x);
                }
              }
              const v_M = union(v_L, _g11542);
              const _eg11571 = edgeGroups(sp, v_M);
              const _a11548 = sp.cellEdges[v_c];
              for (let _i11549 = 0; _i11549 < _a11548.length; _i11549++) {
                const v_x = _a11548[_i11549];
                L11550: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c11555: boolean = (v_j !== v_c);
                  if (_c11555) {
                    let _q11551 = false;
                    Q11552: {
                      const _a11553 = sp.cellEdges[v_j];
                      for (let _i11554 = 0; _i11554 < _a11553.length; _i11554++) {
                        const v_y = _a11553[_i11554];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q11551 = true;
                          break Q11552;
                        }
                      }
                    }
                    _c11555 = _q11551;
                  }
                  if (!(_c11555)) break L11550;
                  let _q11556 = false;
                  Q11557: {
                    const _a11558 = sp.cellEdges[v_j];
                    for (const _e11562 of _l11560) _f11559[_e11562] = -1;
                    _l11560 = _a11558;
                    let _i11564 = 0;
                    _s11561[0] = 0;
                    let _o11568 = _a11558.length === 0;
                    for (;;) {
                      if (_a11558.length === 0) {
                        if (!_o11568) break;
                        _o11568 = false;
                      }
                      while (_a11558.length > 0 && _i11564 >= 0) {
                        const _e11562 = _a11558[_i11564];
                        if (_s11561[_i11564] > 0) _f11559[_e11562] = -1;
                        let _r11567 = (cands[_e11562] >= 0 ? cands[_e11562] : (cands[_e11562] = b.cands[_e11562])) & ~((2 << _s11561[_i11564]) - 1);
                        let _d11563 = 0;
                        V11566: for (; _r11567 !== 0; _r11567 &= _r11567 - 1) {
                          _d11563 = 31 - Math.clz32(_r11567 & -_r11567);
                          _f11559[_e11562] = _d11563;
                          for (let _j11565 = 0; _j11565 < _i11564; _j11565++) {
                            const _y11569 = _a11558[_j11565];
                            if (!(((((_k10865[v_j] ?? arms(sp, cl, v_j)) === 2) && (_f11559[_e11562] === 1)) && (_f11559[_y11569] === 1)))) continue;
                            if (!((bent(sp, _e11562, _y11569) === (clueAt(cl.piece, v_j) === 3)))) continue V11566;
                          }
                          for (let _j11565 = 0; _j11565 < _i11564; _j11565++) {
                            const _y11570 = _a11558[_j11565];
                            if (!(((((((_f11559[_e11562] === 1) && (_f11559[_y11570] === 1)) && !((b.grid[_e11562] !== 0))) && !((b.grid[_y11570] !== 0))) && !([sp.edgeEnds[2 * _e11562], sp.edgeEnds[2 * _e11562 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y11570], sp.edgeEnds[2 * _y11570 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg11571.of((sp.edgeEnds[2 * _y11570] === v_j ? sp.edgeEnds[2 * _y11570 + 1] : sp.edgeEnds[2 * _y11570])) === _eg11571.of((sp.edgeEnds[2 * _e11562] === v_j ? sp.edgeEnds[2 * _e11562 + 1] : sp.edgeEnds[2 * _e11562]))))) continue V11566;
                          }
                          break;
                        }
                        if (_r11567 === 0) {
                          _s11561[_i11564] = 0;
                          _i11564--;
                          continue;
                        }
                        _s11561[_i11564] = _d11563;
                        if (_i11564 === _a11558.length - 1) break;
                        _i11564++;
                        _s11561[_i11564] = 0;
                      }
                      if (_i11564 < 0) break;
                      let _q11572 = true;
                      Q11573: {
                        const _a11574 = sp.cellEdges[v_j];
                        for (let _i11575 = 0; _i11575 < _a11574.length; _i11575++) {
                          const v_y = _a11574[_i11575];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f11559[v_y] === _f11338[v_y]))) {
                            _q11572 = false;
                            break Q11573;
                          }
                        }
                      }
                      let _c11580: boolean = _q11572;
                      if (_c11580) {
                        let _g11576 = 0;
                        G11577: {
                          const _a11578 = sp.cellEdges[v_j];
                          for (let _i11579 = 0; _i11579 < _a11578.length; _i11579++) {
                            const v_y = _a11578[_i11579];
                            if (!((_f11559[v_y] === 1))) continue;
                            _g11576++;
                          }
                        }
                        _c11580 = (_g11576 === (_k10865[v_j] ?? arms(sp, cl, v_j)));
                      }
                      let _c11585: boolean = _c11580;
                      if (_c11585) {
                        let _q11581 = true;
                        Q11582: {
                          const _a11583 = sp.cellEdges[v_j];
                          for (let _i11584 = 0; _i11584 < _a11583.length; _i11584++) {
                            const v_y = _a11583[_i11584];
                            if (!((((_f11559[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg11571.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg11571.of(v_j)))) {
                              _q11581 = false;
                              break Q11582;
                            }
                          }
                        }
                        _c11585 = _q11581;
                      }
                      if (!(_c11585)) continue;
                      if (true) {
                        _q11556 = true;
                        break Q11557;
                      }
                    }
                  }
                  if (!(_q11556)) {
                    _q11540 = false;
                    break Q11541;
                  }
                }
              }
            }
            _c11586 = _q11540;
          }
          if (!(_c11586)) continue;
          if (!(true)) continue;
          _l11333 = _a11337;
          _y11334 = true;
          for (const _e11336 of _a11337) _p11332[_e11336] |= 1 << _f11338[_e11336];
        }
      }
      L11587: {
        const v_B = ((((_p11332[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y11334 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L11587;
        if (b.made[0] !== _m547_0 || b.made[1] !== _m550_1) {
          _g11588.length = 0;
          G11589: {
            const _a11592 = sp.edges;
            for (let _i11593 = 0; _i11593 < _a11592.length; _i11593++) {
              const v_e = _a11592[_i11593];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g11588.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g11588))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g11594: number[] = [];
          G11595: {
            const _a11598 = sp.edges;
            for (let _i11599 = 0; _i11599 < _a11598.length; _i11599++) {
              const v_e = _a11598[_i11599];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g11594.push(v_e);
            }
          }
          const _g11600: number[] = [];
          G11601: {
            const _a11643 = sp.edges;
            for (let _i11644 = 0; _i11644 < _a11643.length; _i11644++) {
              const v_e = _a11643[_i11644];
              const _t11645 = sp.edgeEnds[2 * v_e];
              let _q11646 = false;
              Q11647: {
                const _f11649 = new Int32Array(sp.edges.length).fill(-1);
                let _l11650: readonly number[] = [];
                const _s11651: number[] = [];
                const _a11648 = sp.cellEdges[_t11645];
                for (const _e11652 of _l11650) _f11649[_e11652] = -1;
                _l11650 = _a11648;
                let _i11654 = 0;
                _s11651[0] = 0;
                let _o11658 = _a11648.length === 0;
                for (;;) {
                  if (_a11648.length === 0) {
                    if (!_o11658) break;
                    _o11658 = false;
                  }
                  while (_a11648.length > 0 && _i11654 >= 0) {
                    const _e11652 = _a11648[_i11654];
                    if (_s11651[_i11654] > 0) _f11649[_e11652] = -1;
                    let _r11657 = (cands[_e11652] >= 0 ? cands[_e11652] : (cands[_e11652] = b.cands[_e11652])) & ~((2 << _s11651[_i11654]) - 1);
                    let _d11653 = 0;
                    V11656: for (; _r11657 !== 0; _r11657 &= _r11657 - 1) {
                      _d11653 = 31 - Math.clz32(_r11657 & -_r11657);
                      _f11649[_e11652] = _d11653;
                      if (_e11652 === v_e && _d11653 !== 1) continue;
                      for (let _j11655 = 0; _j11655 < _i11654; _j11655++) {
                        const _y11659 = _a11648[_j11655];
                        if (!((((arms(sp, cl, _t11645) === 2) && (_f11649[_e11652] === 1)) && (_f11649[_y11659] === 1)))) continue;
                        if (!((bent(sp, _e11652, _y11659) === (clueAt(cl.piece, _t11645) === 3)))) continue V11656;
                      }
                      break;
                    }
                    if (_r11657 === 0) {
                      _s11651[_i11654] = 0;
                      _i11654--;
                      continue;
                    }
                    _s11651[_i11654] = _d11653;
                    if (_i11654 === _a11648.length - 1) break;
                    _i11654++;
                    _s11651[_i11654] = 0;
                  }
                  if (_i11654 < 0) break;
                  let _g11660 = 0;
                  G11661: {
                    const _a11662 = sp.cellEdges[_t11645];
                    for (let _i11663 = 0; _i11663 < _a11662.length; _i11663++) {
                      const v_x = _a11662[_i11663];
                      if (!((_f11649[v_x] === 1))) continue;
                      _g11660++;
                    }
                  }
                  if (!((_g11660 === arms(sp, cl, _t11645)))) continue;
                  if (true) {
                    _q11646 = true;
                    break Q11647;
                  }
                }
              }
              let _c11683: boolean = _q11646;
              if (_c11683) {
                const _t11664 = sp.edgeEnds[2 * v_e + 1];
                let _q11665 = false;
                Q11666: {
                  const _f11668 = new Int32Array(sp.edges.length).fill(-1);
                  let _l11669: readonly number[] = [];
                  const _s11670: number[] = [];
                  const _a11667 = sp.cellEdges[_t11664];
                  for (const _e11671 of _l11669) _f11668[_e11671] = -1;
                  _l11669 = _a11667;
                  let _i11673 = 0;
                  _s11670[0] = 0;
                  let _o11677 = _a11667.length === 0;
                  for (;;) {
                    if (_a11667.length === 0) {
                      if (!_o11677) break;
                      _o11677 = false;
                    }
                    while (_a11667.length > 0 && _i11673 >= 0) {
                      const _e11671 = _a11667[_i11673];
                      if (_s11670[_i11673] > 0) _f11668[_e11671] = -1;
                      let _r11676 = (cands[_e11671] >= 0 ? cands[_e11671] : (cands[_e11671] = b.cands[_e11671])) & ~((2 << _s11670[_i11673]) - 1);
                      let _d11672 = 0;
                      V11675: for (; _r11676 !== 0; _r11676 &= _r11676 - 1) {
                        _d11672 = 31 - Math.clz32(_r11676 & -_r11676);
                        _f11668[_e11671] = _d11672;
                        if (_e11671 === v_e && _d11672 !== 1) continue;
                        for (let _j11674 = 0; _j11674 < _i11673; _j11674++) {
                          const _y11678 = _a11667[_j11674];
                          if (!((((arms(sp, cl, _t11664) === 2) && (_f11668[_e11671] === 1)) && (_f11668[_y11678] === 1)))) continue;
                          if (!((bent(sp, _e11671, _y11678) === (clueAt(cl.piece, _t11664) === 3)))) continue V11675;
                        }
                        break;
                      }
                      if (_r11676 === 0) {
                        _s11670[_i11673] = 0;
                        _i11673--;
                        continue;
                      }
                      _s11670[_i11673] = _d11672;
                      if (_i11673 === _a11667.length - 1) break;
                      _i11673++;
                      _s11670[_i11673] = 0;
                    }
                    if (_i11673 < 0) break;
                    let _g11679 = 0;
                    G11680: {
                      const _a11681 = sp.cellEdges[_t11664];
                      for (let _i11682 = 0; _i11682 < _a11681.length; _i11682++) {
                        const v_x = _a11681[_i11682];
                        if (!((_f11668[v_x] === 1))) continue;
                        _g11679++;
                      }
                    }
                    if (!((_g11679 === arms(sp, cl, _t11664)))) continue;
                    if (true) {
                      _q11665 = true;
                      break Q11666;
                    }
                  }
                }
                _c11683 = _q11665;
              }
              if (!(_c11683)) continue;
              _g11600.push(v_e);
            }
          }
          const _g11684: number[] = [];
          G11685: {
            const _a11688 = v_U;
            for (let _i11689 = 0; _i11689 < _a11688.length; _i11689++) {
              const v_e = _a11688[_i11689];
              if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
              _g11684.push(v_e);
            }
          }
          const _g11690: number[] = [];
          G11691: {
            const _a11771 = sp.cellEdges[v_c];
            for (let _i11772 = 0; _i11772 < _a11771.length; _i11772++) {
              const v_x = _a11771[_i11772];
              const _t11773 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
              const _g11774: number[] = [];
              G11775: {
                const _a11813 = sp.cellEdges[_t11773];
                for (let _i11814 = 0; _i11814 < _a11813.length; _i11814++) {
                  const v_y = _a11813[_i11814];
                  let _c11833: boolean = (v_y !== v_x);
                  if (_c11833) {
                    let _q11815 = false;
                    Q11816: {
                      const _f11818 = new Int32Array(sp.edges.length).fill(-1);
                      let _l11819: readonly number[] = [];
                      const _s11820: number[] = [];
                      const _a11817 = sp.cellEdges[_t11773];
                      for (const _e11821 of _l11819) _f11818[_e11821] = -1;
                      _l11819 = _a11817;
                      let _i11823 = 0;
                      _s11820[0] = 0;
                      let _o11827 = _a11817.length === 0;
                      for (;;) {
                        if (_a11817.length === 0) {
                          if (!_o11827) break;
                          _o11827 = false;
                        }
                        while (_a11817.length > 0 && _i11823 >= 0) {
                          const _e11821 = _a11817[_i11823];
                          if (_s11820[_i11823] > 0) _f11818[_e11821] = -1;
                          let _r11826 = (cands[_e11821] >= 0 ? cands[_e11821] : (cands[_e11821] = b.cands[_e11821])) & ~((2 << _s11820[_i11823]) - 1);
                          let _d11822 = 0;
                          V11825: for (; _r11826 !== 0; _r11826 &= _r11826 - 1) {
                            _d11822 = 31 - Math.clz32(_r11826 & -_r11826);
                            _f11818[_e11821] = _d11822;
                            if (_e11821 === v_x && _d11822 !== 1) continue;
                            if (_e11821 === v_y && _d11822 !== 1) continue;
                            for (let _j11824 = 0; _j11824 < _i11823; _j11824++) {
                              const _y11828 = _a11817[_j11824];
                              if (!((((arms(sp, cl, _t11773) === 2) && (_f11818[_e11821] === 1)) && (_f11818[_y11828] === 1)))) continue;
                              if (!((bent(sp, _e11821, _y11828) === (clueAt(cl.piece, _t11773) === 3)))) continue V11825;
                            }
                            break;
                          }
                          if (_r11826 === 0) {
                            _s11820[_i11823] = 0;
                            _i11823--;
                            continue;
                          }
                          _s11820[_i11823] = _d11822;
                          if (_i11823 === _a11817.length - 1) break;
                          _i11823++;
                          _s11820[_i11823] = 0;
                        }
                        if (_i11823 < 0) break;
                        let _g11829 = 0;
                        G11830: {
                          const _a11831 = sp.cellEdges[_t11773];
                          for (let _i11832 = 0; _i11832 < _a11831.length; _i11832++) {
                            const v_z = _a11831[_i11832];
                            if (!((_f11818[v_z] === 1))) continue;
                            _g11829++;
                          }
                        }
                        if (!((_g11829 === arms(sp, cl, _t11773)))) continue;
                        if (true) {
                          _q11815 = true;
                          break Q11816;
                        }
                      }
                    }
                    _c11833 = _q11815;
                  }
                  if (!(_c11833)) continue;
                  const _t11834 = (sp.edgeEnds[2 * v_y] === _t11773 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                  const _t11835 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t11773]);
                  const _g11836: number[] = [];
                  G11837: {
                    const _a11843 = through(sp, _t11834, _t11835);
                    for (let _i11844 = 0; _i11844 < _a11843.length; _i11844++) {
                      const v_t = _a11843[_i11844];
                      if (!((arms(sp, cl, v_t) > 1))) continue;
                      const _a11845 = sp.cellEdges[v_t];
                      for (let _i11846 = 0; _i11846 < _a11845.length; _i11846++) {
                        const v_y = _a11845[_i11846];
                        L11847: {
                          const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L11847;
                          if (!_g11836.includes(v_z)) _g11836.push(v_z);
                        }
                      }
                    }
                  }
                  const _a11848 = union(through(sp, _t11834, _t11835), _g11836);
                  for (let _i11849 = 0; _i11849 < _a11848.length; _i11849++) {
                    const v_t = _a11848[_i11849];
                    if (!_g11774.includes(v_t)) _g11774.push(v_t);
                  }
                }
              }
              if (!((union(setOf(v_c), union(setOf(_t11773), _g11774)).length >= sp.cells.length))) continue;
              _g11690.push(v_x);
            }
          }
          let _q11850 = false;
          Q11851: {
            const _f11853 = new Int32Array(sp.edges.length).fill(-1);
            let _l11854: readonly number[] = [];
            const _s11855: number[] = [];
            const _a11852 = sp.cellEdges[v_c];
            for (const _e11856 of _l11854) _f11853[_e11856] = -1;
            _l11854 = _a11852;
            let _i11858 = 0;
            _s11855[0] = 0;
            let _o11862 = _a11852.length === 0;
            for (;;) {
              if (_a11852.length === 0) {
                if (!_o11862) break;
                _o11862 = false;
              }
              while (_a11852.length > 0 && _i11858 >= 0) {
                const _e11856 = _a11852[_i11858];
                if (_s11855[_i11858] > 0) _f11853[_e11856] = -1;
                let _r11861 = (cands[_e11856] >= 0 ? cands[_e11856] : (cands[_e11856] = b.cands[_e11856])) & ~((2 << _s11855[_i11858]) - 1);
                let _d11857 = 0;
                V11860: for (; _r11861 !== 0; _r11861 &= _r11861 - 1) {
                  _d11857 = 31 - Math.clz32(_r11861 & -_r11861);
                  _f11853[_e11856] = _d11857;
                  if (_e11856 === v_e && _d11857 !== 1) continue;
                  for (let _j11859 = 0; _j11859 < _i11858; _j11859++) {
                    const _y11863 = _a11852[_j11859];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f11853[_e11856] === 1)) && (_f11853[_y11863] === 1)))) continue;
                    if (!((bent(sp, _e11856, _y11863) === (clueAt(cl.piece, v_c) === 3)))) continue V11860;
                  }
                  for (let _j11859 = 0; _j11859 < _i11858; _j11859++) {
                    const _y11864 = _a11852[_j11859];
                    if (!(((((_f11853[_e11856] === 1) && (_f11853[_y11864] === 1)) && !((b.grid[_e11856] !== 0))) && !((b.grid[_y11864] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e11856] === v_c ? sp.edgeEnds[2 * _e11856 + 1] : sp.edgeEnds[2 * _e11856]), v_L).includes((sp.edgeEnds[2 * _y11864] === v_c ? sp.edgeEnds[2 * _y11864 + 1] : sp.edgeEnds[2 * _y11864]))))) continue V11860;
                  }
                  break;
                }
                if (_r11861 === 0) {
                  _s11855[_i11858] = 0;
                  _i11858--;
                  continue;
                }
                _s11855[_i11858] = _d11857;
                if (_i11858 === _a11852.length - 1) break;
                _i11858++;
                _s11855[_i11858] = 0;
              }
              if (_i11858 < 0) break;
              let _g11865 = 0;
              G11866: {
                const _a11867 = sp.cellEdges[v_c];
                for (let _i11868 = 0; _i11868 < _a11867.length; _i11868++) {
                  const v_x = _a11867[_i11868];
                  if (!((_f11853[v_x] === 1))) continue;
                  _g11865++;
                }
              }
              let _c11873: boolean = (_g11865 === arms(sp, cl, v_c));
              if (_c11873) {
                let _q11869 = true;
                Q11870: {
                  const _a11871 = sp.cellEdges[v_c];
                  for (let _i11872 = 0; _i11872 < _a11871.length; _i11872++) {
                    const v_x = _a11871[_i11872];
                    if (!(((_f11853[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg10902.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q11869 = false;
                      break Q11870;
                    }
                  }
                }
                _c11873 = _q11869;
              }
              let _c12043: boolean = _c11873;
              if (_c12043) {
                let _q11874 = false;
                Q11875: {
                  const _a11876 = sp.cellEdges[v_c];
                  for (let _i11877 = 0; _i11877 < _a11876.length; _i11877++) {
                    const v_x = _a11876[_i11877];
                    if (!((_f11853[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q11874 = true;
                      break Q11875;
                    }
                  }
                }
                let _c12042: boolean = _q11874;
                if (!_c12042) {
                  const _g11878: number[] = [];
                  G11879: {
                    const _a11961 = sp.cellEdges[v_c];
                    for (let _i11962 = 0; _i11962 < _a11961.length; _i11962++) {
                      const v_x = _a11961[_i11962];
                      if (!((_f11853[v_x] === 1))) continue;
                      const _t11963 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g11964: number[] = [];
                      G11965: {
                        const _a12003 = sp.cellEdges[_t11963];
                        for (let _i12004 = 0; _i12004 < _a12003.length; _i12004++) {
                          const v_y = _a12003[_i12004];
                          let _c12023: boolean = (v_y !== v_x);
                          if (_c12023) {
                            let _q12005 = false;
                            Q12006: {
                              const _f12008 = new Int32Array(sp.edges.length).fill(-1);
                              let _l12009: readonly number[] = [];
                              const _s12010: number[] = [];
                              const _a12007 = sp.cellEdges[_t11963];
                              for (const _e12011 of _l12009) _f12008[_e12011] = -1;
                              _l12009 = _a12007;
                              let _i12013 = 0;
                              _s12010[0] = 0;
                              let _o12017 = _a12007.length === 0;
                              for (;;) {
                                if (_a12007.length === 0) {
                                  if (!_o12017) break;
                                  _o12017 = false;
                                }
                                while (_a12007.length > 0 && _i12013 >= 0) {
                                  const _e12011 = _a12007[_i12013];
                                  if (_s12010[_i12013] > 0) _f12008[_e12011] = -1;
                                  let _r12016 = (cands[_e12011] >= 0 ? cands[_e12011] : (cands[_e12011] = b.cands[_e12011])) & ~((2 << _s12010[_i12013]) - 1);
                                  let _d12012 = 0;
                                  V12015: for (; _r12016 !== 0; _r12016 &= _r12016 - 1) {
                                    _d12012 = 31 - Math.clz32(_r12016 & -_r12016);
                                    _f12008[_e12011] = _d12012;
                                    if (_e12011 === v_x && _d12012 !== 1) continue;
                                    if (_e12011 === v_y && _d12012 !== 1) continue;
                                    for (let _j12014 = 0; _j12014 < _i12013; _j12014++) {
                                      const _y12018 = _a12007[_j12014];
                                      if (!((((arms(sp, cl, _t11963) === 2) && (_f12008[_e12011] === 1)) && (_f12008[_y12018] === 1)))) continue;
                                      if (!((bent(sp, _e12011, _y12018) === (clueAt(cl.piece, _t11963) === 3)))) continue V12015;
                                    }
                                    break;
                                  }
                                  if (_r12016 === 0) {
                                    _s12010[_i12013] = 0;
                                    _i12013--;
                                    continue;
                                  }
                                  _s12010[_i12013] = _d12012;
                                  if (_i12013 === _a12007.length - 1) break;
                                  _i12013++;
                                  _s12010[_i12013] = 0;
                                }
                                if (_i12013 < 0) break;
                                let _g12019 = 0;
                                G12020: {
                                  const _a12021 = sp.cellEdges[_t11963];
                                  for (let _i12022 = 0; _i12022 < _a12021.length; _i12022++) {
                                    const v_z = _a12021[_i12022];
                                    if (!((_f12008[v_z] === 1))) continue;
                                    _g12019++;
                                  }
                                }
                                if (!((_g12019 === arms(sp, cl, _t11963)))) continue;
                                if (true) {
                                  _q12005 = true;
                                  break Q12006;
                                }
                              }
                            }
                            _c12023 = _q12005;
                          }
                          if (!(_c12023)) continue;
                          const _t12024 = (sp.edgeEnds[2 * v_y] === _t11963 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t12025 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t11963]);
                          const _g12026: number[] = [];
                          G12027: {
                            const _a12033 = through(sp, _t12024, _t12025);
                            for (let _i12034 = 0; _i12034 < _a12033.length; _i12034++) {
                              const v_t = _a12033[_i12034];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a12035 = sp.cellEdges[v_t];
                              for (let _i12036 = 0; _i12036 < _a12035.length; _i12036++) {
                                const v_y = _a12035[_i12036];
                                L12037: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L12037;
                                  if (!_g12026.includes(v_z)) _g12026.push(v_z);
                                }
                              }
                            }
                          }
                          const _a12038 = union(through(sp, _t12024, _t12025), _g12026);
                          for (let _i12039 = 0; _i12039 < _a12038.length; _i12039++) {
                            const v_t = _a12038[_i12039];
                            if (!_g11964.includes(v_t)) _g11964.push(v_t);
                          }
                        }
                      }
                      const _a12040 = union(setOf(_t11963), _g11964);
                      for (let _i12041 = 0; _i12041 < _a12040.length; _i12041++) {
                        const v_t = _a12040[_i12041];
                        if (!_g11878.includes(v_t)) _g11878.push(v_t);
                      }
                    }
                  }
                  _c12042 = (union(setOf(v_c), _g11878).length >= sp.cells.length);
                }
                _c12043 = _c12042;
              }
              let _c12089: boolean = _c12043;
              if (_c12089) {
                let _q12044 = true;
                Q12045: {
                  const _g12046: number[] = [];
                  G12047: {
                    const _a12050 = sp.cellEdges[v_c];
                    for (let _i12051 = 0; _i12051 < _a12050.length; _i12051++) {
                      const v_x = _a12050[_i12051];
                      if (!((_f11853[v_x] === 1))) continue;
                      _g12046.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g12046);
                  const _a12052 = sp.cellEdges[v_c];
                  for (let _i12053 = 0; _i12053 < _a12052.length; _i12053++) {
                    const v_x = _a12052[_i12053];
                    L12054: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c12059: boolean = (v_j !== v_c);
                      if (_c12059) {
                        let _q12055 = false;
                        Q12056: {
                          const _a12057 = sp.cellEdges[v_j];
                          for (let _i12058 = 0; _i12058 < _a12057.length; _i12058++) {
                            const v_y = _a12057[_i12058];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q12055 = true;
                              break Q12056;
                            }
                          }
                        }
                        _c12059 = _q12055;
                      }
                      if (!(_c12059)) break L12054;
                      let _q12060 = false;
                      Q12061: {
                        const _f12063 = new Int32Array(sp.edges.length).fill(-1);
                        let _l12064: readonly number[] = [];
                        const _s12065: number[] = [];
                        const _a12062 = sp.cellEdges[v_j];
                        for (const _e12066 of _l12064) _f12063[_e12066] = -1;
                        _l12064 = _a12062;
                        let _i12068 = 0;
                        _s12065[0] = 0;
                        let _o12072 = _a12062.length === 0;
                        for (;;) {
                          if (_a12062.length === 0) {
                            if (!_o12072) break;
                            _o12072 = false;
                          }
                          while (_a12062.length > 0 && _i12068 >= 0) {
                            const _e12066 = _a12062[_i12068];
                            if (_s12065[_i12068] > 0) _f12063[_e12066] = -1;
                            let _r12071 = (cands[_e12066] >= 0 ? cands[_e12066] : (cands[_e12066] = b.cands[_e12066])) & ~((2 << _s12065[_i12068]) - 1);
                            let _d12067 = 0;
                            V12070: for (; _r12071 !== 0; _r12071 &= _r12071 - 1) {
                              _d12067 = 31 - Math.clz32(_r12071 & -_r12071);
                              _f12063[_e12066] = _d12067;
                              for (let _j12069 = 0; _j12069 < _i12068; _j12069++) {
                                const _y12073 = _a12062[_j12069];
                                if (!((((arms(sp, cl, v_j) === 2) && (_f12063[_e12066] === 1)) && (_f12063[_y12073] === 1)))) continue;
                                if (!((bent(sp, _e12066, _y12073) === (clueAt(cl.piece, v_j) === 3)))) continue V12070;
                              }
                              for (let _j12069 = 0; _j12069 < _i12068; _j12069++) {
                                const _y12074 = _a12062[_j12069];
                                if (!(((((((_f12063[_e12066] === 1) && (_f12063[_y12074] === 1)) && !((b.grid[_e12066] !== 0))) && !((b.grid[_y12074] !== 0))) && !([sp.edgeEnds[2 * _e12066], sp.edgeEnds[2 * _e12066 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y12074], sp.edgeEnds[2 * _y12074 + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, (sp.edgeEnds[2 * _e12066] === v_j ? sp.edgeEnds[2 * _e12066 + 1] : sp.edgeEnds[2 * _e12066]), v_M).includes((sp.edgeEnds[2 * _y12074] === v_j ? sp.edgeEnds[2 * _y12074 + 1] : sp.edgeEnds[2 * _y12074]))))) continue V12070;
                              }
                              break;
                            }
                            if (_r12071 === 0) {
                              _s12065[_i12068] = 0;
                              _i12068--;
                              continue;
                            }
                            _s12065[_i12068] = _d12067;
                            if (_i12068 === _a12062.length - 1) break;
                            _i12068++;
                            _s12065[_i12068] = 0;
                          }
                          if (_i12068 < 0) break;
                          let _q12075 = true;
                          Q12076: {
                            const _a12077 = sp.cellEdges[v_j];
                            for (let _i12078 = 0; _i12078 < _a12077.length; _i12078++) {
                              const v_y = _a12077[_i12078];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f12063[v_y] === _f11853[v_y]))) {
                                _q12075 = false;
                                break Q12076;
                              }
                            }
                          }
                          let _c12083: boolean = _q12075;
                          if (_c12083) {
                            let _g12079 = 0;
                            G12080: {
                              const _a12081 = sp.cellEdges[v_j];
                              for (let _i12082 = 0; _i12082 < _a12081.length; _i12082++) {
                                const v_y = _a12081[_i12082];
                                if (!((_f12063[v_y] === 1))) continue;
                                _g12079++;
                              }
                            }
                            _c12083 = (_g12079 === arms(sp, cl, v_j));
                          }
                          let _c12088: boolean = _c12083;
                          if (_c12088) {
                            let _q12084 = true;
                            Q12085: {
                              const _a12086 = sp.cellEdges[v_j];
                              for (let _i12087 = 0; _i12087 < _a12086.length; _i12087++) {
                                const v_y = _a12086[_i12087];
                                if (!((((_f12063[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                  _q12084 = false;
                                  break Q12085;
                                }
                              }
                            }
                            _c12088 = _q12084;
                          }
                          if (!(_c12088)) continue;
                          if (true) {
                            _q12060 = true;
                            break Q12061;
                          }
                        }
                      }
                      if (!(_q12060)) {
                        _q12044 = false;
                        break Q12045;
                      }
                    }
                  }
                }
                _c12089 = _q12044;
              }
              if (!(_c12089)) continue;
              if (true) {
                _q11850 = true;
                break Q11851;
              }
            }
          }
          let _q12090 = false;
          Q12091: {
            const _f12093 = new Int32Array(sp.edges.length).fill(-1);
            let _l12094: readonly number[] = [];
            const _s12095: number[] = [];
            const _a12092 = sp.cellEdges[v_c];
            for (const _e12096 of _l12094) _f12093[_e12096] = -1;
            _l12094 = _a12092;
            let _i12098 = 0;
            _s12095[0] = 0;
            let _o12102 = _a12092.length === 0;
            for (;;) {
              if (_a12092.length === 0) {
                if (!_o12102) break;
                _o12102 = false;
              }
              while (_a12092.length > 0 && _i12098 >= 0) {
                const _e12096 = _a12092[_i12098];
                if (_s12095[_i12098] > 0) _f12093[_e12096] = -1;
                let _r12101 = (cands[_e12096] >= 0 ? cands[_e12096] : (cands[_e12096] = b.cands[_e12096])) & ~((2 << _s12095[_i12098]) - 1);
                let _d12097 = 0;
                V12100: for (; _r12101 !== 0; _r12101 &= _r12101 - 1) {
                  _d12097 = 31 - Math.clz32(_r12101 & -_r12101);
                  _f12093[_e12096] = _d12097;
                  if (_e12096 === v_e && _d12097 !== 2) continue;
                  for (let _j12099 = 0; _j12099 < _i12098; _j12099++) {
                    const _y12103 = _a12092[_j12099];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f12093[_e12096] === 1)) && (_f12093[_y12103] === 1)))) continue;
                    if (!((bent(sp, _e12096, _y12103) === (clueAt(cl.piece, v_c) === 3)))) continue V12100;
                  }
                  for (let _j12099 = 0; _j12099 < _i12098; _j12099++) {
                    const _y12104 = _a12092[_j12099];
                    if (!(((((_f12093[_e12096] === 1) && (_f12093[_y12104] === 1)) && !((b.grid[_e12096] !== 0))) && !((b.grid[_y12104] !== 0))))) continue;
                    if (!(!(through(sp, (sp.edgeEnds[2 * _e12096] === v_c ? sp.edgeEnds[2 * _e12096 + 1] : sp.edgeEnds[2 * _e12096]), v_L).includes((sp.edgeEnds[2 * _y12104] === v_c ? sp.edgeEnds[2 * _y12104 + 1] : sp.edgeEnds[2 * _y12104]))))) continue V12100;
                  }
                  break;
                }
                if (_r12101 === 0) {
                  _s12095[_i12098] = 0;
                  _i12098--;
                  continue;
                }
                _s12095[_i12098] = _d12097;
                if (_i12098 === _a12092.length - 1) break;
                _i12098++;
                _s12095[_i12098] = 0;
              }
              if (_i12098 < 0) break;
              let _g12105 = 0;
              G12106: {
                const _a12107 = sp.cellEdges[v_c];
                for (let _i12108 = 0; _i12108 < _a12107.length; _i12108++) {
                  const v_x = _a12107[_i12108];
                  if (!((_f12093[v_x] === 1))) continue;
                  _g12105++;
                }
              }
              let _c12113: boolean = (_g12105 === arms(sp, cl, v_c));
              if (_c12113) {
                let _q12109 = true;
                Q12110: {
                  const _a12111 = sp.cellEdges[v_c];
                  for (let _i12112 = 0; _i12112 < _a12111.length; _i12112++) {
                    const v_x = _a12111[_i12112];
                    if (!(((_f12093[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg10902.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q12109 = false;
                      break Q12110;
                    }
                  }
                }
                _c12113 = _q12109;
              }
              let _c12283: boolean = _c12113;
              if (_c12283) {
                let _q12114 = false;
                Q12115: {
                  const _a12116 = sp.cellEdges[v_c];
                  for (let _i12117 = 0; _i12117 < _a12116.length; _i12117++) {
                    const v_x = _a12116[_i12117];
                    if (!((_f12093[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q12114 = true;
                      break Q12115;
                    }
                  }
                }
                let _c12282: boolean = _q12114;
                if (!_c12282) {
                  const _g12118: number[] = [];
                  G12119: {
                    const _a12201 = sp.cellEdges[v_c];
                    for (let _i12202 = 0; _i12202 < _a12201.length; _i12202++) {
                      const v_x = _a12201[_i12202];
                      if (!((_f12093[v_x] === 1))) continue;
                      const _t12203 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      const _g12204: number[] = [];
                      G12205: {
                        const _a12243 = sp.cellEdges[_t12203];
                        for (let _i12244 = 0; _i12244 < _a12243.length; _i12244++) {
                          const v_y = _a12243[_i12244];
                          let _c12263: boolean = (v_y !== v_x);
                          if (_c12263) {
                            let _q12245 = false;
                            Q12246: {
                              const _f12248 = new Int32Array(sp.edges.length).fill(-1);
                              let _l12249: readonly number[] = [];
                              const _s12250: number[] = [];
                              const _a12247 = sp.cellEdges[_t12203];
                              for (const _e12251 of _l12249) _f12248[_e12251] = -1;
                              _l12249 = _a12247;
                              let _i12253 = 0;
                              _s12250[0] = 0;
                              let _o12257 = _a12247.length === 0;
                              for (;;) {
                                if (_a12247.length === 0) {
                                  if (!_o12257) break;
                                  _o12257 = false;
                                }
                                while (_a12247.length > 0 && _i12253 >= 0) {
                                  const _e12251 = _a12247[_i12253];
                                  if (_s12250[_i12253] > 0) _f12248[_e12251] = -1;
                                  let _r12256 = (cands[_e12251] >= 0 ? cands[_e12251] : (cands[_e12251] = b.cands[_e12251])) & ~((2 << _s12250[_i12253]) - 1);
                                  let _d12252 = 0;
                                  V12255: for (; _r12256 !== 0; _r12256 &= _r12256 - 1) {
                                    _d12252 = 31 - Math.clz32(_r12256 & -_r12256);
                                    _f12248[_e12251] = _d12252;
                                    if (_e12251 === v_x && _d12252 !== 1) continue;
                                    if (_e12251 === v_y && _d12252 !== 1) continue;
                                    for (let _j12254 = 0; _j12254 < _i12253; _j12254++) {
                                      const _y12258 = _a12247[_j12254];
                                      if (!((((arms(sp, cl, _t12203) === 2) && (_f12248[_e12251] === 1)) && (_f12248[_y12258] === 1)))) continue;
                                      if (!((bent(sp, _e12251, _y12258) === (clueAt(cl.piece, _t12203) === 3)))) continue V12255;
                                    }
                                    break;
                                  }
                                  if (_r12256 === 0) {
                                    _s12250[_i12253] = 0;
                                    _i12253--;
                                    continue;
                                  }
                                  _s12250[_i12253] = _d12252;
                                  if (_i12253 === _a12247.length - 1) break;
                                  _i12253++;
                                  _s12250[_i12253] = 0;
                                }
                                if (_i12253 < 0) break;
                                let _g12259 = 0;
                                G12260: {
                                  const _a12261 = sp.cellEdges[_t12203];
                                  for (let _i12262 = 0; _i12262 < _a12261.length; _i12262++) {
                                    const v_z = _a12261[_i12262];
                                    if (!((_f12248[v_z] === 1))) continue;
                                    _g12259++;
                                  }
                                }
                                if (!((_g12259 === arms(sp, cl, _t12203)))) continue;
                                if (true) {
                                  _q12245 = true;
                                  break Q12246;
                                }
                              }
                            }
                            _c12263 = _q12245;
                          }
                          if (!(_c12263)) continue;
                          const _t12264 = (sp.edgeEnds[2 * v_y] === _t12203 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t12265 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t12203]);
                          const _g12266: number[] = [];
                          G12267: {
                            const _a12273 = through(sp, _t12264, _t12265);
                            for (let _i12274 = 0; _i12274 < _a12273.length; _i12274++) {
                              const v_t = _a12273[_i12274];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a12275 = sp.cellEdges[v_t];
                              for (let _i12276 = 0; _i12276 < _a12275.length; _i12276++) {
                                const v_y = _a12275[_i12276];
                                L12277: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L12277;
                                  if (!_g12266.includes(v_z)) _g12266.push(v_z);
                                }
                              }
                            }
                          }
                          const _a12278 = union(through(sp, _t12264, _t12265), _g12266);
                          for (let _i12279 = 0; _i12279 < _a12278.length; _i12279++) {
                            const v_t = _a12278[_i12279];
                            if (!_g12204.includes(v_t)) _g12204.push(v_t);
                          }
                        }
                      }
                      const _a12280 = union(setOf(_t12203), _g12204);
                      for (let _i12281 = 0; _i12281 < _a12280.length; _i12281++) {
                        const v_t = _a12280[_i12281];
                        if (!_g12118.includes(v_t)) _g12118.push(v_t);
                      }
                    }
                  }
                  _c12282 = (union(setOf(v_c), _g12118).length >= sp.cells.length);
                }
                _c12283 = _c12282;
              }
              let _c12329: boolean = _c12283;
              if (_c12329) {
                let _q12284 = true;
                Q12285: {
                  const _g12286: number[] = [];
                  G12287: {
                    const _a12290 = sp.cellEdges[v_c];
                    for (let _i12291 = 0; _i12291 < _a12290.length; _i12291++) {
                      const v_x = _a12290[_i12291];
                      if (!((_f12093[v_x] === 1))) continue;
                      _g12286.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g12286);
                  const _a12292 = sp.cellEdges[v_c];
                  for (let _i12293 = 0; _i12293 < _a12292.length; _i12293++) {
                    const v_x = _a12292[_i12293];
                    L12294: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c12299: boolean = (v_j !== v_c);
                      if (_c12299) {
                        let _q12295 = false;
                        Q12296: {
                          const _a12297 = sp.cellEdges[v_j];
                          for (let _i12298 = 0; _i12298 < _a12297.length; _i12298++) {
                            const v_y = _a12297[_i12298];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q12295 = true;
                              break Q12296;
                            }
                          }
                        }
                        _c12299 = _q12295;
                      }
                      if (!(_c12299)) break L12294;
                      let _q12300 = false;
                      Q12301: {
                        const _f12303 = new Int32Array(sp.edges.length).fill(-1);
                        let _l12304: readonly number[] = [];
                        const _s12305: number[] = [];
                        const _a12302 = sp.cellEdges[v_j];
                        for (const _e12306 of _l12304) _f12303[_e12306] = -1;
                        _l12304 = _a12302;
                        let _i12308 = 0;
                        _s12305[0] = 0;
                        let _o12312 = _a12302.length === 0;
                        for (;;) {
                          if (_a12302.length === 0) {
                            if (!_o12312) break;
                            _o12312 = false;
                          }
                          while (_a12302.length > 0 && _i12308 >= 0) {
                            const _e12306 = _a12302[_i12308];
                            if (_s12305[_i12308] > 0) _f12303[_e12306] = -1;
                            let _r12311 = (cands[_e12306] >= 0 ? cands[_e12306] : (cands[_e12306] = b.cands[_e12306])) & ~((2 << _s12305[_i12308]) - 1);
                            let _d12307 = 0;
                            V12310: for (; _r12311 !== 0; _r12311 &= _r12311 - 1) {
                              _d12307 = 31 - Math.clz32(_r12311 & -_r12311);
                              _f12303[_e12306] = _d12307;
                              for (let _j12309 = 0; _j12309 < _i12308; _j12309++) {
                                const _y12313 = _a12302[_j12309];
                                if (!((((arms(sp, cl, v_j) === 2) && (_f12303[_e12306] === 1)) && (_f12303[_y12313] === 1)))) continue;
                                if (!((bent(sp, _e12306, _y12313) === (clueAt(cl.piece, v_j) === 3)))) continue V12310;
                              }
                              for (let _j12309 = 0; _j12309 < _i12308; _j12309++) {
                                const _y12314 = _a12302[_j12309];
                                if (!(((((((_f12303[_e12306] === 1) && (_f12303[_y12314] === 1)) && !((b.grid[_e12306] !== 0))) && !((b.grid[_y12314] !== 0))) && !([sp.edgeEnds[2 * _e12306], sp.edgeEnds[2 * _e12306 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y12314], sp.edgeEnds[2 * _y12314 + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, (sp.edgeEnds[2 * _e12306] === v_j ? sp.edgeEnds[2 * _e12306 + 1] : sp.edgeEnds[2 * _e12306]), v_M).includes((sp.edgeEnds[2 * _y12314] === v_j ? sp.edgeEnds[2 * _y12314 + 1] : sp.edgeEnds[2 * _y12314]))))) continue V12310;
                              }
                              break;
                            }
                            if (_r12311 === 0) {
                              _s12305[_i12308] = 0;
                              _i12308--;
                              continue;
                            }
                            _s12305[_i12308] = _d12307;
                            if (_i12308 === _a12302.length - 1) break;
                            _i12308++;
                            _s12305[_i12308] = 0;
                          }
                          if (_i12308 < 0) break;
                          let _q12315 = true;
                          Q12316: {
                            const _a12317 = sp.cellEdges[v_j];
                            for (let _i12318 = 0; _i12318 < _a12317.length; _i12318++) {
                              const v_y = _a12317[_i12318];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f12303[v_y] === _f12093[v_y]))) {
                                _q12315 = false;
                                break Q12316;
                              }
                            }
                          }
                          let _c12323: boolean = _q12315;
                          if (_c12323) {
                            let _g12319 = 0;
                            G12320: {
                              const _a12321 = sp.cellEdges[v_j];
                              for (let _i12322 = 0; _i12322 < _a12321.length; _i12322++) {
                                const v_y = _a12321[_i12322];
                                if (!((_f12303[v_y] === 1))) continue;
                                _g12319++;
                              }
                            }
                            _c12323 = (_g12319 === arms(sp, cl, v_j));
                          }
                          let _c12328: boolean = _c12323;
                          if (_c12328) {
                            let _q12324 = true;
                            Q12325: {
                              const _a12326 = sp.cellEdges[v_j];
                              for (let _i12327 = 0; _i12327 < _a12326.length; _i12327++) {
                                const v_y = _a12326[_i12327];
                                if (!((((_f12303[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(through(sp, v_j, v_M).includes((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]))))) {
                                  _q12324 = false;
                                  break Q12325;
                                }
                              }
                            }
                            _c12328 = _q12324;
                          }
                          if (!(_c12328)) continue;
                          if (true) {
                            _q12300 = true;
                            break Q12301;
                          }
                        }
                      }
                      if (!(_q12300)) {
                        _q12284 = false;
                        break Q12285;
                      }
                    }
                  }
                }
                _c12329 = _q12284;
              }
              if (!(_c12329)) continue;
              if (true) {
                _q12090 = true;
                break Q12091;
              }
            }
          }
          freshBinding("strandNote", [sameSet(v_L, _g11594), sameSet(v_U, _g11600), sameSet(v_P, _g11684), (sp.cells.includes(v_c)), sameSet(v_G, through(sp, v_c, v_L)), sameSet(v_K, _g11690), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q11850), (v_B === _q12090), (!(v_A) || !(v_B))], ["L =", "U =", "P =", "c in", "G =", "K =", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c12331: boolean = (v_A || v_B);
        if (_c12331) {
          let _c12330: boolean = !(!(v_A));
          if (!_c12330) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c12330 = true;
          }
          _c12331 = _c12330;
        }
        let _c12333: boolean = _c12331;
        if (_c12333) {
          let _c12332: boolean = !(!(v_B));
          if (!_c12332) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c12332 = true;
          }
          _c12333 = _c12332;
        }
        if (!(_c12333)) return -1;
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
