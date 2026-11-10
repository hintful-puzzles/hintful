// Compiled by `npm run describe` from src/skeleton/edges/skeleton.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, edgeGroups, freshBinding, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  wall: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "forced" | "pairBreaks";

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
  { id: "forced", tier: 0 },
  { id: "pairBreaks", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g446: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q435 = true;
  Q436: {
    const _a437 = sp.cells;
    for (let _i438 = 0; _i438 < _a437.length; _i438++) {
      const v_c = _a437[_i438];
      let _g439 = 0;
      G440: {
        const _a441 = sp.adj4[v_c];
        for (let _i442 = 0; _i442 < _a441.length; _i442++) {
          const _h443 = (g[sp.adj4Edges[v_c][_i442]] || -1);
          if (!((_h443 === 1))) continue;
          _g439++;
        }
      }
      if (!((_g439 === 2))) {
        _q435 = false;
        break Q436;
      }
    }
  }
  if (!(_q435)) return false;
  let _q444 = true;
  Q445: {
    _g446.length = 0;
    G447: {
      const _a450 = sp.edges;
      for (let _i451 = 0; _i451 < _a450.length; _i451++) {
        const v_e = _a450[_i451];
        const _h452 = (g[v_e] || -1);
        if (!((_h452 === 1))) continue;
        _g446.push(v_e);
      }
    }
    const v_R = _g446;
    const _eg457 = edgeGroups(sp, v_R);
    const _a453 = sp.cells;
    for (let _i454 = 0; _i454 < _a453.length; _i454++) {
      const v_a = _a453[_i454];
      const _a455 = sp.cells;
      for (let _i456 = 0; _i456 < _a455.length; _i456++) {
        const v_b = _a455[_i456];
        if (!((_eg457.of(v_b) === _eg457.of(v_a)))) {
          _q444 = false;
          break Q445;
        }
      }
    }
  }
  if (!(_q444)) return false;
  for (let _k458 = 0; _k458 < cl.wall.at.length; _k458++) {
    const _at459 = cl.wall.at[_k458];
    if (!(((g[_at459] || -1) === 2))) return false;
  }
  return true;
}

export interface ForcedBinding {
  c: number;
  n: number;
  U: readonly number[];
}

const forcedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function forced(b: Marks, sp: GridSpace, fire: Fire<ForcedBinding> | null): number {
  const facts = forcedFacts;
  let fired = 0;
  let changed = false;
  const _a40 = sp.cells;
  for (let _i41 = 0; _i41 < _a40.length; _i41++) {
    const v_c = _a40[_i41];
    let _g42 = 0;
    G43: {
      const _a44 = sp.adj4[v_c];
      for (let _i45 = 0; _i45 < _a44.length; _i45++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i45]] || -1) === 1))) continue;
        _g42++;
      }
    }
    const v_n = (2 - _g42);
    L46: {
      const v_U = ways(b, sp, v_c);
      const _h47 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h47 <= v_n))))) break L46;
      if (import.meta.env.DEV && staleChecking) {
        let _g48 = 0;
        G49: {
          const _a50 = sp.adj4[v_c];
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i51]] || -1) === 1))) continue;
            _g48++;
          }
        }
        freshBinding("forced", [(sp.cells.includes(v_c)), (v_n === (2 - _g48)), sameSet(v_U, ways(b, sp, v_c)), ((v_n < 0) || ((v_n > 0) && (v_U.length <= v_n)))], ["c in", "n =", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c57: boolean = ((v_n >= 0) && (_h47 === v_n));
      if (_c57) {
        let _q52 = true;
        Q53: {
          const _a54 = v_U;
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_y = _a54[_i55];
            const _t56 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t56] !== 0)) { if (fire === null) { b.placeAt(_t56, 1); changed = true; } else facts.push(PLACE, _t56, 1); }
            if (!(true)) {
              _q52 = false;
              break Q53;
            }
          }
        }
        _c57 = _q52;
      }
      if (!(_c57)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n, U: v_U.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairBreaksBinding {
  c: number;
  U: readonly number[];
  k: number;
  I: readonly number[];
  i: number;
  j: number;
}

const pairBreaksFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function pairBreaks(b: Marks, sp: GridSpace, fire: Fire<PairBreaksBinding> | null): number {
  const _g224: number[] = [];
  const _g272: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h203 = (sp.w * sp.h);
  const _a190 = sp.cells;
  R1:
  for (let _i191 = 0; _i191 < _a190.length; _i191++) {
    const v_c = _a190[_i191];
    const _m27_0 = b.made[0];
    let _g192 = 0;
    G193: {
      const _a194 = sp.adj4[v_c];
      for (let _i195 = 0; _i195 < _a194.length; _i195++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i195]] || -1) === 1))) continue;
        _g192++;
      }
    }
    if (!((_g192 === 0))) continue;
    const _m32_1 = b.made[1];
    L196: {
      const v_U = ways(b, sp, v_c);
      const _h197 = v_U.length;
      if (!((_h197 === 3))) break L196;
      const _a198 = v_U;
      for (let _i199 = 0; _i199 < _a198.length; _i199++) {
        const v_k = _a198[_i199];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L200: {
          const v_j = (v_I[1] ?? -1);
          let _c313: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
          if (_c313) {
            let _c312: boolean = ((throughWhere(sp, v_i, (_te201: number): boolean => {  return ((b.grid[_te201] || -1) === 1); }).includes(v_j)) && ((throughWhere(sp, v_i, (_te202: number): boolean => {  return ((b.grid[_te202] || -1) === 1); }).length + 1) < _h203));
            if (!_c312) {
              const _wc204 = sp.edgeOf(v_c, v_i);
              const _wd205 = 1;
              const _wc206 = sp.edgeOf(v_c, v_j);
              const _wd207 = 1;
              let _q208 = false;
              Q209: {
                const _a211 = throughWhere(sp, v_c, (_te210: number): boolean => {  return ((_te210 === _wc206 ? _wd207 : (_te210 === _wc204 ? _wd205 : (b.grid[_te210] || -1))) === 1); });
                for (let _i212 = 0; _i212 < _a211.length; _i212++) {
                  const v_t = _a211[_i212];
                  let _c218: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c218) {
                    let _g213 = 0;
                    G214: {
                      const _a215 = sp.adj4[v_t];
                      for (let _i216 = 0; _i216 < _a215.length; _i216++) {
                        const _t217 = sp.adj4Edges[v_t][_i216];
                        if (!(((_t217 === _wc206 ? _wd207 : (_t217 === _wc204 ? _wd205 : (b.grid[_t217] || -1))) === 1))) continue;
                        _g213++;
                      }
                    }
                    _c218 = (_g213 < 2);
                  }
                  if (!(_c218)) continue;
                  let _g219 = 0;
                  G220: {
                    const _a221 = sp.adj4[v_t];
                    for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                      const _t223 = sp.adj4Edges[v_t][_i222];
                      if (!(((_t223 === _wc206 ? _wd207 : (_t223 === _wc204 ? _wd205 : (b.grid[_t223] || -1))) === 1))) continue;
                      _g219++;
                    }
                  }
                  let _c262: boolean = (_g219 < 2);
                  if (_c262) {
                    _g224.length = 0;
                    G225: {
                      const _a244 = sp.adj4[v_t];
                      for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                        const v_y = _a244[_i245];
                        const _t246 = sp.adj4Edges[v_t][_i245];
                        let _c252: boolean = !((_t246 === _wc206 ? true : (_t246 === _wc204 ? true : (b.grid[_t246] !== 0))));
                        if (_c252) {
                          let _g247 = 0;
                          G248: {
                            const _a249 = sp.adj4[v_t];
                            for (let _i250 = 0; _i250 < _a249.length; _i250++) {
                              const _t251 = sp.adj4Edges[v_t][_i250];
                              if (!(((_t251 === _wc206 ? _wd207 : (_t251 === _wc204 ? _wd205 : (b.grid[_t251] || -1))) === 1))) continue;
                              _g247++;
                            }
                          }
                          _c252 = (_g247 < 2);
                        }
                        let _c259: boolean = _c252;
                        if (_c259) {
                          let _g253 = 0;
                          G254: {
                            const _a256 = sp.adj4[v_y];
                            for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                              const _t258 = sp.adj4Edges[v_y][_i257];
                              if (!(((_t258 === _wc206 ? _wd207 : (_t258 === _wc204 ? _wd205 : (b.grid[_t258] || -1))) === 1))) continue;
                              _g253++;
                            }
                          }
                          _c259 = (_g253 < 2);
                        }
                        if (!((_c259 && (!(throughWhere(sp, v_t, (_te260: number): boolean => {  return ((_te260 === _wc206 ? _wd207 : (_te260 === _wc204 ? _wd205 : (b.grid[_te260] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_t, (_te261: number): boolean => {  return ((_te261 === _wc206 ? _wd207 : (_te261 === _wc204 ? _wd205 : (b.grid[_te261] || -1))) === 1); }).length === _h203))))) continue;
                        _g224.push(v_y);
                      }
                    }
                    _c262 = ((_g219 + _g224.length) < 2);
                  }
                  let _c311: boolean = _c262;
                  if (!_c311) {
                    let _q263 = false;
                    Q264: {
                      const _a265 = sp.adj4[v_t];
                      for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                        const v_s = _a265[_i266];
                        let _g267 = 0;
                        G268: {
                          const _a269 = sp.adj4[v_s];
                          for (let _i270 = 0; _i270 < _a269.length; _i270++) {
                            const _t271 = sp.adj4Edges[v_s][_i270];
                            if (!(((_t271 === _wc206 ? _wd207 : (_t271 === _wc204 ? _wd205 : (b.grid[_t271] || -1))) === 1))) continue;
                            _g267++;
                          }
                        }
                        let _c310: boolean = (_g267 < 2);
                        if (_c310) {
                          _g272.length = 0;
                          G273: {
                            const _a292 = sp.adj4[v_s];
                            for (let _i293 = 0; _i293 < _a292.length; _i293++) {
                              const v_y = _a292[_i293];
                              const _t294 = sp.adj4Edges[v_s][_i293];
                              let _c300: boolean = !((_t294 === _wc206 ? true : (_t294 === _wc204 ? true : (b.grid[_t294] !== 0))));
                              if (_c300) {
                                let _g295 = 0;
                                G296: {
                                  const _a297 = sp.adj4[v_s];
                                  for (let _i298 = 0; _i298 < _a297.length; _i298++) {
                                    const _t299 = sp.adj4Edges[v_s][_i298];
                                    if (!(((_t299 === _wc206 ? _wd207 : (_t299 === _wc204 ? _wd205 : (b.grid[_t299] || -1))) === 1))) continue;
                                    _g295++;
                                  }
                                }
                                _c300 = (_g295 < 2);
                              }
                              let _c307: boolean = _c300;
                              if (_c307) {
                                let _g301 = 0;
                                G302: {
                                  const _a304 = sp.adj4[v_y];
                                  for (let _i305 = 0; _i305 < _a304.length; _i305++) {
                                    const _t306 = sp.adj4Edges[v_y][_i305];
                                    if (!(((_t306 === _wc206 ? _wd207 : (_t306 === _wc204 ? _wd205 : (b.grid[_t306] || -1))) === 1))) continue;
                                    _g301++;
                                  }
                                }
                                _c307 = (_g301 < 2);
                              }
                              if (!((_c307 && (!(throughWhere(sp, v_s, (_te308: number): boolean => {  return ((_te308 === _wc206 ? _wd207 : (_te308 === _wc204 ? _wd205 : (b.grid[_te308] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_s, (_te309: number): boolean => {  return ((_te309 === _wc206 ? _wd207 : (_te309 === _wc204 ? _wd205 : (b.grid[_te309] || -1))) === 1); }).length === _h203))))) continue;
                              _g272.push(v_y);
                            }
                          }
                          _c310 = ((_g267 + _g272.length) < 2);
                        }
                        if (_c310) {
                          _q263 = true;
                          break Q264;
                        }
                      }
                    }
                    _c311 = _q263;
                  }
                  if (_c311) {
                    _q208 = true;
                    break Q209;
                  }
                }
              }
              _c312 = _q208;
            }
            _c313 = _c312;
          }
          if (!(_c313)) break L200;
          if (b.made[0] !== _m27_0 || b.made[1] !== _m32_1) {
            let _g314 = 0;
            G315: {
              const _a316 = sp.adj4[v_c];
              for (let _i317 = 0; _i317 < _a316.length; _i317++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i317]] || -1) === 1))) continue;
                _g314++;
              }
            }
            if (!((_g314 === 0))) { continue R1; }
            if (!(sameSet(v_U, ways(b, sp, v_c)))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g318 = 0;
            G319: {
              const _a320 = sp.adj4[v_c];
              for (let _i321 = 0; _i321 < _a320.length; _i321++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i321]] || -1) === 1))) continue;
                _g318++;
              }
            }
            let _c433: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
            if (_c433) {
              let _c432: boolean = ((throughWhere(sp, v_i, (_te322: number): boolean => {  return ((b.grid[_te322] || -1) === 1); }).includes(v_j)) && ((throughWhere(sp, v_i, (_te323: number): boolean => {  return ((b.grid[_te323] || -1) === 1); }).length + 1) < (sp.w * sp.h)));
              if (!_c432) {
                const _wc324 = sp.edgeOf(v_c, v_i);
                const _wd325 = 1;
                const _wc326 = sp.edgeOf(v_c, v_j);
                const _wd327 = 1;
                let _q328 = false;
                Q329: {
                  const _a331 = throughWhere(sp, v_c, (_te330: number): boolean => {  return ((_te330 === _wc326 ? _wd327 : (_te330 === _wc324 ? _wd325 : (b.grid[_te330] || -1))) === 1); });
                  for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                    const v_t = _a331[_i332];
                    let _c338: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c338) {
                      let _g333 = 0;
                      G334: {
                        const _a335 = sp.adj4[v_t];
                        for (let _i336 = 0; _i336 < _a335.length; _i336++) {
                          const _t337 = sp.adj4Edges[v_t][_i336];
                          if (!(((_t337 === _wc326 ? _wd327 : (_t337 === _wc324 ? _wd325 : (b.grid[_t337] || -1))) === 1))) continue;
                          _g333++;
                        }
                      }
                      _c338 = (_g333 < 2);
                    }
                    if (!(_c338)) continue;
                    let _g339 = 0;
                    G340: {
                      const _a341 = sp.adj4[v_t];
                      for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                        const _t343 = sp.adj4Edges[v_t][_i342];
                        if (!(((_t343 === _wc326 ? _wd327 : (_t343 === _wc324 ? _wd325 : (b.grid[_t343] || -1))) === 1))) continue;
                        _g339++;
                      }
                    }
                    let _c382: boolean = (_g339 < 2);
                    if (_c382) {
                      const _g344: number[] = [];
                      G345: {
                        const _a364 = sp.adj4[v_t];
                        for (let _i365 = 0; _i365 < _a364.length; _i365++) {
                          const v_y = _a364[_i365];
                          const _t366 = sp.adj4Edges[v_t][_i365];
                          let _c372: boolean = !((_t366 === _wc326 ? true : (_t366 === _wc324 ? true : (b.grid[_t366] !== 0))));
                          if (_c372) {
                            let _g367 = 0;
                            G368: {
                              const _a369 = sp.adj4[v_t];
                              for (let _i370 = 0; _i370 < _a369.length; _i370++) {
                                const _t371 = sp.adj4Edges[v_t][_i370];
                                if (!(((_t371 === _wc326 ? _wd327 : (_t371 === _wc324 ? _wd325 : (b.grid[_t371] || -1))) === 1))) continue;
                                _g367++;
                              }
                            }
                            _c372 = (_g367 < 2);
                          }
                          let _c379: boolean = _c372;
                          if (_c379) {
                            let _g373 = 0;
                            G374: {
                              const _a376 = sp.adj4[v_y];
                              for (let _i377 = 0; _i377 < _a376.length; _i377++) {
                                const _t378 = sp.adj4Edges[v_y][_i377];
                                if (!(((_t378 === _wc326 ? _wd327 : (_t378 === _wc324 ? _wd325 : (b.grid[_t378] || -1))) === 1))) continue;
                                _g373++;
                              }
                            }
                            _c379 = (_g373 < 2);
                          }
                          if (!((_c379 && (!(throughWhere(sp, v_t, (_te380: number): boolean => {  return ((_te380 === _wc326 ? _wd327 : (_te380 === _wc324 ? _wd325 : (b.grid[_te380] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_t, (_te381: number): boolean => {  return ((_te381 === _wc326 ? _wd327 : (_te381 === _wc324 ? _wd325 : (b.grid[_te381] || -1))) === 1); }).length === (sp.w * sp.h)))))) continue;
                          _g344.push(v_y);
                        }
                      }
                      _c382 = ((_g339 + _g344.length) < 2);
                    }
                    let _c431: boolean = _c382;
                    if (!_c431) {
                      let _q383 = false;
                      Q384: {
                        const _a385 = sp.adj4[v_t];
                        for (let _i386 = 0; _i386 < _a385.length; _i386++) {
                          const v_s = _a385[_i386];
                          let _g387 = 0;
                          G388: {
                            const _a389 = sp.adj4[v_s];
                            for (let _i390 = 0; _i390 < _a389.length; _i390++) {
                              const _t391 = sp.adj4Edges[v_s][_i390];
                              if (!(((_t391 === _wc326 ? _wd327 : (_t391 === _wc324 ? _wd325 : (b.grid[_t391] || -1))) === 1))) continue;
                              _g387++;
                            }
                          }
                          let _c430: boolean = (_g387 < 2);
                          if (_c430) {
                            const _g392: number[] = [];
                            G393: {
                              const _a412 = sp.adj4[v_s];
                              for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                                const v_y = _a412[_i413];
                                const _t414 = sp.adj4Edges[v_s][_i413];
                                let _c420: boolean = !((_t414 === _wc326 ? true : (_t414 === _wc324 ? true : (b.grid[_t414] !== 0))));
                                if (_c420) {
                                  let _g415 = 0;
                                  G416: {
                                    const _a417 = sp.adj4[v_s];
                                    for (let _i418 = 0; _i418 < _a417.length; _i418++) {
                                      const _t419 = sp.adj4Edges[v_s][_i418];
                                      if (!(((_t419 === _wc326 ? _wd327 : (_t419 === _wc324 ? _wd325 : (b.grid[_t419] || -1))) === 1))) continue;
                                      _g415++;
                                    }
                                  }
                                  _c420 = (_g415 < 2);
                                }
                                let _c427: boolean = _c420;
                                if (_c427) {
                                  let _g421 = 0;
                                  G422: {
                                    const _a424 = sp.adj4[v_y];
                                    for (let _i425 = 0; _i425 < _a424.length; _i425++) {
                                      const _t426 = sp.adj4Edges[v_y][_i425];
                                      if (!(((_t426 === _wc326 ? _wd327 : (_t426 === _wc324 ? _wd325 : (b.grid[_t426] || -1))) === 1))) continue;
                                      _g421++;
                                    }
                                  }
                                  _c427 = (_g421 < 2);
                                }
                                if (!((_c427 && (!(throughWhere(sp, v_s, (_te428: number): boolean => {  return ((_te428 === _wc326 ? _wd327 : (_te428 === _wc324 ? _wd325 : (b.grid[_te428] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_s, (_te429: number): boolean => {  return ((_te429 === _wc326 ? _wd327 : (_te429 === _wc324 ? _wd325 : (b.grid[_te429] || -1))) === 1); }).length === (sp.w * sp.h)))))) continue;
                                _g392.push(v_y);
                              }
                            }
                            _c430 = ((_g387 + _g392.length) < 2);
                          }
                          if (_c430) {
                            _q383 = true;
                            break Q384;
                          }
                        }
                      }
                      _c431 = _q383;
                    }
                    if (_c431) {
                      _q328 = true;
                      break Q329;
                    }
                  }
                }
                _c432 = _q328;
              }
              _c433 = _c432;
            }
            freshBinding("pairBreaks", [(sp.cells.includes(v_c)), (_g318 === 0), sameSet(v_U, ways(b, sp, v_c)), (v_U.length === 3), (v_U.includes(v_k)), sameSet(v_I, minus(v_U, setOf(v_k))), (v_i === (v_I[0] ?? -1)), (v_j === (v_I[1] ?? -1)), _c433], ["c in", "where of c", "U =", "where of U", "k in", "I =", "i =", "j =", "where of j"]);
          }
          facts.length = 0;
          changed = false;
          const _t434 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t434] !== 0)) { if (fire === null) { b.placeAt(_t434, 1); changed = true; } else facts.push(PLACE, _t434, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, U: v_U.slice(), k: v_k, I: v_I.slice(), i: v_i, j: v_j }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const waysKept = keptStore<readonly number[]>();

/** `ways(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ways(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = waysKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g7: number[] = [];
  G8: {
    const _a24 = sp.adj4[v_c];
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      const v_y = _a24[_i25];
      let _c30: boolean = !((b.grid[sp.adj4Edges[v_c][_i25]] !== 0));
      if (_c30) {
        let _g26 = 0;
        G27: {
          const _a28 = sp.adj4[v_c];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i29]] || -1) === 1))) continue;
            _g26++;
          }
        }
        _c30 = (_g26 < 2);
      }
      let _c36: boolean = _c30;
      if (_c36) {
        let _g31 = 0;
        G32: {
          const _a34 = sp.adj4[v_y];
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            if (!(((b.grid[sp.adj4Edges[v_y][_i35]] || -1) === 1))) continue;
            _g31++;
          }
        }
        _c36 = (_g31 < 2);
      }
      if (!((_c36 && (!(throughWhere(sp, v_c, (_te37: number): boolean => {  return ((b.grid[_te37] || -1) === 1); }).includes(v_y)) || (throughWhere(sp, v_c, (_te38: number): boolean => {  return ((b.grid[_te38] || -1) === 1); }).length === (sp.w * sp.h)))))) continue;
      _g7.push(v_y);
    }
  }
  const _made = _g7;
  _kept[v_c] = _made;
  return _made;
}
