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
  const _g12: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _g5 = 0;
      G6: {
        const _a7 = sp.adj4[v_c];
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const _h9 = (g[sp.adj4Edges[v_c][_i8]] || -1);
          if (!((_h9 === 1))) continue;
          _g5++;
        }
      }
      if (!((_g5 === 2))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q10 = true;
  Q11: {
    _g12.length = 0;
    G13: {
      const _a16 = sp.edges;
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_e = _a16[_i17];
        const _h18 = (g[v_e] || -1);
        if (!((_h18 === 1))) continue;
        _g12.push(v_e);
      }
    }
    const v_R = _g12;
    const _eg23 = edgeGroups(sp, v_R);
    const _a19 = sp.cells;
    for (let _i20 = 0; _i20 < _a19.length; _i20++) {
      const v_a = _a19[_i20];
      const _a21 = sp.cells;
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_b = _a21[_i22];
        if (!((_eg23.of(v_b) === _eg23.of(v_a)))) {
          _q10 = false;
          break Q11;
        }
      }
    }
  }
  if (!(_q10)) return false;
  for (let _k24 = 0; _k24 < cl.wall.at.length; _k24++) {
    const _at25 = cl.wall.at[_k24];
    if (!(((g[_at25] || -1) === 2))) return false;
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
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    let _g10 = 0;
    G11: {
      const _a12 = sp.adj4[v_c];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i13]] || -1) === 1))) continue;
        _g10++;
      }
    }
    const v_n = (2 - _g10);
    L14: {
      const v_U = ways(b, sp, v_c);
      const _h15 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h15 <= v_n))))) break L14;
      if (import.meta.env.DEV && staleChecking) {
        let _g16 = 0;
        G17: {
          const _a18 = sp.adj4[v_c];
          for (let _i19 = 0; _i19 < _a18.length; _i19++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i19]] || -1) === 1))) continue;
            _g16++;
          }
        }
        freshBinding("forced", [(sp.cells.includes(v_c)), (v_n === (2 - _g16)), sameSet(v_U, ways(b, sp, v_c)), ((v_n < 0) || ((v_n > 0) && (v_U.length <= v_n)))], ["c in", "n =", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c25: boolean = ((v_n >= 0) && (_h15 === v_n));
      if (_c25) {
        let _q20 = true;
        Q21: {
          const _a22 = v_U;
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_y = _a22[_i23];
            const _t24 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t24] !== 0)) { if (fire === null) { b.placeAt(_t24, 1); changed = true; } else facts.push(PLACE, _t24, 1); }
            if (!(true)) {
              _q20 = false;
              break Q21;
            }
          }
        }
        _c25 = _q20;
      }
      if (!(_c25)) return -1;
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
  const _g167: number[] = [];
  const _g215: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h146 = (sp.w * sp.h);
  const _a133 = sp.cells;
  R1:
  for (let _i134 = 0; _i134 < _a133.length; _i134++) {
    const v_c = _a133[_i134];
    const _m378_0 = b.made[0];
    let _g135 = 0;
    G136: {
      const _a137 = sp.adj4[v_c];
      for (let _i138 = 0; _i138 < _a137.length; _i138++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i138]] || -1) === 1))) continue;
        _g135++;
      }
    }
    if (!((_g135 === 0))) continue;
    const _m379_1 = b.made[1];
    L139: {
      const v_U = ways(b, sp, v_c);
      const _h140 = v_U.length;
      if (!((_h140 === 3))) break L139;
      const _a141 = v_U;
      for (let _i142 = 0; _i142 < _a141.length; _i142++) {
        const v_k = _a141[_i142];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L143: {
          const v_j = (v_I[1] ?? -1);
          let _c256: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
          if (_c256) {
            let _c255: boolean = ((throughWhere(sp, v_i, (_te144: number): boolean => {  return ((b.grid[_te144] || -1) === 1); }).includes(v_j)) && ((throughWhere(sp, v_i, (_te145: number): boolean => {  return ((b.grid[_te145] || -1) === 1); }).length + 1) < _h146));
            if (!_c255) {
              const _wc147 = sp.edgeOf(v_c, v_i);
              const _wd148 = 1;
              const _wc149 = sp.edgeOf(v_c, v_j);
              const _wd150 = 1;
              let _q151 = false;
              Q152: {
                const _a154 = throughWhere(sp, v_c, (_te153: number): boolean => {  return ((_te153 === _wc149 ? _wd150 : (_te153 === _wc147 ? _wd148 : (b.grid[_te153] || -1))) === 1); });
                for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                  const v_t = _a154[_i155];
                  let _c161: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c161) {
                    let _g156 = 0;
                    G157: {
                      const _a158 = sp.adj4[v_t];
                      for (let _i159 = 0; _i159 < _a158.length; _i159++) {
                        const _t160 = sp.adj4Edges[v_t][_i159];
                        if (!(((_t160 === _wc149 ? _wd150 : (_t160 === _wc147 ? _wd148 : (b.grid[_t160] || -1))) === 1))) continue;
                        _g156++;
                      }
                    }
                    _c161 = (_g156 < 2);
                  }
                  if (!(_c161)) continue;
                  let _g162 = 0;
                  G163: {
                    const _a164 = sp.adj4[v_t];
                    for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                      const _t166 = sp.adj4Edges[v_t][_i165];
                      if (!(((_t166 === _wc149 ? _wd150 : (_t166 === _wc147 ? _wd148 : (b.grid[_t166] || -1))) === 1))) continue;
                      _g162++;
                    }
                  }
                  let _c205: boolean = (_g162 < 2);
                  if (_c205) {
                    _g167.length = 0;
                    G168: {
                      const _a187 = sp.adj4[v_t];
                      for (let _i188 = 0; _i188 < _a187.length; _i188++) {
                        const v_y = _a187[_i188];
                        const _t189 = sp.adj4Edges[v_t][_i188];
                        let _c195: boolean = !((_t189 === _wc149 ? true : (_t189 === _wc147 ? true : (b.grid[_t189] !== 0))));
                        if (_c195) {
                          let _g190 = 0;
                          G191: {
                            const _a192 = sp.adj4[v_t];
                            for (let _i193 = 0; _i193 < _a192.length; _i193++) {
                              const _t194 = sp.adj4Edges[v_t][_i193];
                              if (!(((_t194 === _wc149 ? _wd150 : (_t194 === _wc147 ? _wd148 : (b.grid[_t194] || -1))) === 1))) continue;
                              _g190++;
                            }
                          }
                          _c195 = (_g190 < 2);
                        }
                        let _c202: boolean = _c195;
                        if (_c202) {
                          let _g196 = 0;
                          G197: {
                            const _a199 = sp.adj4[v_y];
                            for (let _i200 = 0; _i200 < _a199.length; _i200++) {
                              const _t201 = sp.adj4Edges[v_y][_i200];
                              if (!(((_t201 === _wc149 ? _wd150 : (_t201 === _wc147 ? _wd148 : (b.grid[_t201] || -1))) === 1))) continue;
                              _g196++;
                            }
                          }
                          _c202 = (_g196 < 2);
                        }
                        if (!((_c202 && (!(throughWhere(sp, v_t, (_te203: number): boolean => {  return ((_te203 === _wc149 ? _wd150 : (_te203 === _wc147 ? _wd148 : (b.grid[_te203] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_t, (_te204: number): boolean => {  return ((_te204 === _wc149 ? _wd150 : (_te204 === _wc147 ? _wd148 : (b.grid[_te204] || -1))) === 1); }).length === _h146))))) continue;
                        _g167.push(v_y);
                      }
                    }
                    _c205 = ((_g162 + _g167.length) < 2);
                  }
                  let _c254: boolean = _c205;
                  if (!_c254) {
                    let _q206 = false;
                    Q207: {
                      const _a208 = sp.adj4[v_t];
                      for (let _i209 = 0; _i209 < _a208.length; _i209++) {
                        const v_s = _a208[_i209];
                        let _g210 = 0;
                        G211: {
                          const _a212 = sp.adj4[v_s];
                          for (let _i213 = 0; _i213 < _a212.length; _i213++) {
                            const _t214 = sp.adj4Edges[v_s][_i213];
                            if (!(((_t214 === _wc149 ? _wd150 : (_t214 === _wc147 ? _wd148 : (b.grid[_t214] || -1))) === 1))) continue;
                            _g210++;
                          }
                        }
                        let _c253: boolean = (_g210 < 2);
                        if (_c253) {
                          _g215.length = 0;
                          G216: {
                            const _a235 = sp.adj4[v_s];
                            for (let _i236 = 0; _i236 < _a235.length; _i236++) {
                              const v_y = _a235[_i236];
                              const _t237 = sp.adj4Edges[v_s][_i236];
                              let _c243: boolean = !((_t237 === _wc149 ? true : (_t237 === _wc147 ? true : (b.grid[_t237] !== 0))));
                              if (_c243) {
                                let _g238 = 0;
                                G239: {
                                  const _a240 = sp.adj4[v_s];
                                  for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                                    const _t242 = sp.adj4Edges[v_s][_i241];
                                    if (!(((_t242 === _wc149 ? _wd150 : (_t242 === _wc147 ? _wd148 : (b.grid[_t242] || -1))) === 1))) continue;
                                    _g238++;
                                  }
                                }
                                _c243 = (_g238 < 2);
                              }
                              let _c250: boolean = _c243;
                              if (_c250) {
                                let _g244 = 0;
                                G245: {
                                  const _a247 = sp.adj4[v_y];
                                  for (let _i248 = 0; _i248 < _a247.length; _i248++) {
                                    const _t249 = sp.adj4Edges[v_y][_i248];
                                    if (!(((_t249 === _wc149 ? _wd150 : (_t249 === _wc147 ? _wd148 : (b.grid[_t249] || -1))) === 1))) continue;
                                    _g244++;
                                  }
                                }
                                _c250 = (_g244 < 2);
                              }
                              if (!((_c250 && (!(throughWhere(sp, v_s, (_te251: number): boolean => {  return ((_te251 === _wc149 ? _wd150 : (_te251 === _wc147 ? _wd148 : (b.grid[_te251] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_s, (_te252: number): boolean => {  return ((_te252 === _wc149 ? _wd150 : (_te252 === _wc147 ? _wd148 : (b.grid[_te252] || -1))) === 1); }).length === _h146))))) continue;
                              _g215.push(v_y);
                            }
                          }
                          _c253 = ((_g210 + _g215.length) < 2);
                        }
                        if (_c253) {
                          _q206 = true;
                          break Q207;
                        }
                      }
                    }
                    _c254 = _q206;
                  }
                  if (_c254) {
                    _q151 = true;
                    break Q152;
                  }
                }
              }
              _c255 = _q151;
            }
            _c256 = _c255;
          }
          if (!(_c256)) break L143;
          if (b.made[0] !== _m378_0 || b.made[1] !== _m379_1) {
            let _g257 = 0;
            G258: {
              const _a259 = sp.adj4[v_c];
              for (let _i260 = 0; _i260 < _a259.length; _i260++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i260]] || -1) === 1))) continue;
                _g257++;
              }
            }
            if (!((_g257 === 0))) { continue R1; }
            if (!(sameSet(v_U, ways(b, sp, v_c)))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g261 = 0;
            G262: {
              const _a263 = sp.adj4[v_c];
              for (let _i264 = 0; _i264 < _a263.length; _i264++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i264]] || -1) === 1))) continue;
                _g261++;
              }
            }
            let _c376: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
            if (_c376) {
              let _c375: boolean = ((throughWhere(sp, v_i, (_te265: number): boolean => {  return ((b.grid[_te265] || -1) === 1); }).includes(v_j)) && ((throughWhere(sp, v_i, (_te266: number): boolean => {  return ((b.grid[_te266] || -1) === 1); }).length + 1) < (sp.w * sp.h)));
              if (!_c375) {
                const _wc267 = sp.edgeOf(v_c, v_i);
                const _wd268 = 1;
                const _wc269 = sp.edgeOf(v_c, v_j);
                const _wd270 = 1;
                let _q271 = false;
                Q272: {
                  const _a274 = throughWhere(sp, v_c, (_te273: number): boolean => {  return ((_te273 === _wc269 ? _wd270 : (_te273 === _wc267 ? _wd268 : (b.grid[_te273] || -1))) === 1); });
                  for (let _i275 = 0; _i275 < _a274.length; _i275++) {
                    const v_t = _a274[_i275];
                    let _c281: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c281) {
                      let _g276 = 0;
                      G277: {
                        const _a278 = sp.adj4[v_t];
                        for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                          const _t280 = sp.adj4Edges[v_t][_i279];
                          if (!(((_t280 === _wc269 ? _wd270 : (_t280 === _wc267 ? _wd268 : (b.grid[_t280] || -1))) === 1))) continue;
                          _g276++;
                        }
                      }
                      _c281 = (_g276 < 2);
                    }
                    if (!(_c281)) continue;
                    let _g282 = 0;
                    G283: {
                      const _a284 = sp.adj4[v_t];
                      for (let _i285 = 0; _i285 < _a284.length; _i285++) {
                        const _t286 = sp.adj4Edges[v_t][_i285];
                        if (!(((_t286 === _wc269 ? _wd270 : (_t286 === _wc267 ? _wd268 : (b.grid[_t286] || -1))) === 1))) continue;
                        _g282++;
                      }
                    }
                    let _c325: boolean = (_g282 < 2);
                    if (_c325) {
                      const _g287: number[] = [];
                      G288: {
                        const _a307 = sp.adj4[v_t];
                        for (let _i308 = 0; _i308 < _a307.length; _i308++) {
                          const v_y = _a307[_i308];
                          const _t309 = sp.adj4Edges[v_t][_i308];
                          let _c315: boolean = !((_t309 === _wc269 ? true : (_t309 === _wc267 ? true : (b.grid[_t309] !== 0))));
                          if (_c315) {
                            let _g310 = 0;
                            G311: {
                              const _a312 = sp.adj4[v_t];
                              for (let _i313 = 0; _i313 < _a312.length; _i313++) {
                                const _t314 = sp.adj4Edges[v_t][_i313];
                                if (!(((_t314 === _wc269 ? _wd270 : (_t314 === _wc267 ? _wd268 : (b.grid[_t314] || -1))) === 1))) continue;
                                _g310++;
                              }
                            }
                            _c315 = (_g310 < 2);
                          }
                          let _c322: boolean = _c315;
                          if (_c322) {
                            let _g316 = 0;
                            G317: {
                              const _a319 = sp.adj4[v_y];
                              for (let _i320 = 0; _i320 < _a319.length; _i320++) {
                                const _t321 = sp.adj4Edges[v_y][_i320];
                                if (!(((_t321 === _wc269 ? _wd270 : (_t321 === _wc267 ? _wd268 : (b.grid[_t321] || -1))) === 1))) continue;
                                _g316++;
                              }
                            }
                            _c322 = (_g316 < 2);
                          }
                          if (!((_c322 && (!(throughWhere(sp, v_t, (_te323: number): boolean => {  return ((_te323 === _wc269 ? _wd270 : (_te323 === _wc267 ? _wd268 : (b.grid[_te323] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_t, (_te324: number): boolean => {  return ((_te324 === _wc269 ? _wd270 : (_te324 === _wc267 ? _wd268 : (b.grid[_te324] || -1))) === 1); }).length === (sp.w * sp.h)))))) continue;
                          _g287.push(v_y);
                        }
                      }
                      _c325 = ((_g282 + _g287.length) < 2);
                    }
                    let _c374: boolean = _c325;
                    if (!_c374) {
                      let _q326 = false;
                      Q327: {
                        const _a328 = sp.adj4[v_t];
                        for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                          const v_s = _a328[_i329];
                          let _g330 = 0;
                          G331: {
                            const _a332 = sp.adj4[v_s];
                            for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                              const _t334 = sp.adj4Edges[v_s][_i333];
                              if (!(((_t334 === _wc269 ? _wd270 : (_t334 === _wc267 ? _wd268 : (b.grid[_t334] || -1))) === 1))) continue;
                              _g330++;
                            }
                          }
                          let _c373: boolean = (_g330 < 2);
                          if (_c373) {
                            const _g335: number[] = [];
                            G336: {
                              const _a355 = sp.adj4[v_s];
                              for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                                const v_y = _a355[_i356];
                                const _t357 = sp.adj4Edges[v_s][_i356];
                                let _c363: boolean = !((_t357 === _wc269 ? true : (_t357 === _wc267 ? true : (b.grid[_t357] !== 0))));
                                if (_c363) {
                                  let _g358 = 0;
                                  G359: {
                                    const _a360 = sp.adj4[v_s];
                                    for (let _i361 = 0; _i361 < _a360.length; _i361++) {
                                      const _t362 = sp.adj4Edges[v_s][_i361];
                                      if (!(((_t362 === _wc269 ? _wd270 : (_t362 === _wc267 ? _wd268 : (b.grid[_t362] || -1))) === 1))) continue;
                                      _g358++;
                                    }
                                  }
                                  _c363 = (_g358 < 2);
                                }
                                let _c370: boolean = _c363;
                                if (_c370) {
                                  let _g364 = 0;
                                  G365: {
                                    const _a367 = sp.adj4[v_y];
                                    for (let _i368 = 0; _i368 < _a367.length; _i368++) {
                                      const _t369 = sp.adj4Edges[v_y][_i368];
                                      if (!(((_t369 === _wc269 ? _wd270 : (_t369 === _wc267 ? _wd268 : (b.grid[_t369] || -1))) === 1))) continue;
                                      _g364++;
                                    }
                                  }
                                  _c370 = (_g364 < 2);
                                }
                                if (!((_c370 && (!(throughWhere(sp, v_s, (_te371: number): boolean => {  return ((_te371 === _wc269 ? _wd270 : (_te371 === _wc267 ? _wd268 : (b.grid[_te371] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_s, (_te372: number): boolean => {  return ((_te372 === _wc269 ? _wd270 : (_te372 === _wc267 ? _wd268 : (b.grid[_te372] || -1))) === 1); }).length === (sp.w * sp.h)))))) continue;
                                _g335.push(v_y);
                              }
                            }
                            _c373 = ((_g330 + _g335.length) < 2);
                          }
                          if (_c373) {
                            _q326 = true;
                            break Q327;
                          }
                        }
                      }
                      _c374 = _q326;
                    }
                    if (_c374) {
                      _q271 = true;
                      break Q272;
                    }
                  }
                }
                _c375 = _q271;
              }
              _c376 = _c375;
            }
            freshBinding("pairBreaks", [(sp.cells.includes(v_c)), (_g261 === 0), sameSet(v_U, ways(b, sp, v_c)), (v_U.length === 3), (v_U.includes(v_k)), sameSet(v_I, minus(v_U, setOf(v_k))), (v_i === (v_I[0] ?? -1)), (v_j === (v_I[1] ?? -1)), _c376], ["c in", "where of c", "U =", "where of U", "k in", "I =", "i =", "j =", "where of j"]);
          }
          facts.length = 0;
          changed = false;
          const _t377 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t377] !== 0)) { if (fire === null) { b.placeAt(_t377, 1); changed = true; } else facts.push(PLACE, _t377, 1); }
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
  const _g1: number[] = [];
  G2: {
    const _a18 = sp.adj4[v_c];
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_y = _a18[_i19];
      let _c24: boolean = !((b.grid[sp.adj4Edges[v_c][_i19]] !== 0));
      if (_c24) {
        let _g20 = 0;
        G21: {
          const _a22 = sp.adj4[v_c];
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i23]] || -1) === 1))) continue;
            _g20++;
          }
        }
        _c24 = (_g20 < 2);
      }
      let _c30: boolean = _c24;
      if (_c30) {
        let _g25 = 0;
        G26: {
          const _a28 = sp.adj4[v_y];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            if (!(((b.grid[sp.adj4Edges[v_y][_i29]] || -1) === 1))) continue;
            _g25++;
          }
        }
        _c30 = (_g25 < 2);
      }
      if (!((_c30 && (!(throughWhere(sp, v_c, (_te31: number): boolean => {  return ((b.grid[_te31] || -1) === 1); }).includes(v_y)) || (throughWhere(sp, v_c, (_te32: number): boolean => {  return ((b.grid[_te32] || -1) === 1); }).length === (sp.w * sp.h)))))) continue;
      _g1.push(v_y);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}
