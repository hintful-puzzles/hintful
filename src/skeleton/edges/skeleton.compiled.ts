// Compiled by `npm run describe` from src/skeleton/edges/skeleton.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, edgeGroups, keptStore, minus, rangeMask, setOf, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g322: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q311 = true;
  Q312: {
    const _a313 = sp.cells;
    for (let _i314 = 0; _i314 < _a313.length; _i314++) {
      const v_c = _a313[_i314];
      let _g315 = 0;
      G316: {
        const _a317 = sp.adj4[v_c];
        for (let _i318 = 0; _i318 < _a317.length; _i318++) {
          const _h319 = (g[sp.adj4Edges[v_c][_i318]] || -1);
          if (!((_h319 === 1))) continue;
          _g315++;
        }
      }
      if (!((_g315 === 2))) {
        _q311 = false;
        break Q312;
      }
    }
  }
  if (!(_q311)) return false;
  let _q320 = true;
  Q321: {
    _g322.length = 0;
    G323: {
      const _a326 = sp.edges;
      for (let _i327 = 0; _i327 < _a326.length; _i327++) {
        const v_e = _a326[_i327];
        const _h328 = (g[v_e] || -1);
        if (!((_h328 === 1))) continue;
        _g322.push(v_e);
      }
    }
    const v_R = _g322;
    const _eg333 = edgeGroups(sp, v_R);
    const _a329 = sp.cells;
    for (let _i330 = 0; _i330 < _a329.length; _i330++) {
      const v_a = _a329[_i330];
      const _a331 = sp.cells;
      for (let _i332 = 0; _i332 < _a331.length; _i332++) {
        const v_b = _a331[_i332];
        if (!((_eg333.of(v_b) === _eg333.of(v_a)))) {
          _q320 = false;
          break Q321;
        }
      }
    }
  }
  if (!(_q320)) return false;
  for (let _k334 = 0; _k334 < cl.wall.at.length; _k334++) {
    const _at335 = cl.wall.at[_k334];
    if (!(((g[_at335] || -1) === 2))) return false;
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
      facts.length = 0;
      changed = false;
      let _c53: boolean = ((v_n >= 0) && (_h47 === v_n));
      if (_c53) {
        let _q48 = true;
        Q49: {
          const _a50 = v_U;
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_y = _a50[_i51];
            const _t52 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t52] !== 0)) { if (fire === null) { b.placeAt(_t52, 1); changed = true; } else facts.push(PLACE, _t52, 1); }
            if (!(true)) {
              _q48 = false;
              break Q49;
            }
          }
        }
        _c53 = _q48;
      }
      if (!(_c53)) return -1;
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
  const _g220: number[] = [];
  const _g268: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h199 = (sp.w * sp.h);
  const _a186 = sp.cells;
  for (let _i187 = 0; _i187 < _a186.length; _i187++) {
    const v_c = _a186[_i187];
    let _g188 = 0;
    G189: {
      const _a190 = sp.adj4[v_c];
      for (let _i191 = 0; _i191 < _a190.length; _i191++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i191]] || -1) === 1))) continue;
        _g188++;
      }
    }
    if (!((_g188 === 0))) continue;
    L192: {
      const v_U = ways(b, sp, v_c);
      const _h193 = v_U.length;
      if (!((_h193 === 3))) break L192;
      const _a194 = v_U;
      for (let _i195 = 0; _i195 < _a194.length; _i195++) {
        const v_k = _a194[_i195];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L196: {
          const v_j = (v_I[1] ?? -1);
          let _c309: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
          if (_c309) {
            let _c308: boolean = ((throughWhere(sp, v_i, (_te197: number): boolean => {  return ((b.grid[_te197] || -1) === 1); }).includes(v_j)) && ((throughWhere(sp, v_i, (_te198: number): boolean => {  return ((b.grid[_te198] || -1) === 1); }).length + 1) < _h199));
            if (!_c308) {
              const _wc200 = sp.edgeOf(v_c, v_i);
              const _wd201 = 1;
              const _wc202 = sp.edgeOf(v_c, v_j);
              const _wd203 = 1;
              let _q204 = false;
              Q205: {
                const _a207 = throughWhere(sp, v_c, (_te206: number): boolean => {  return ((_te206 === _wc202 ? _wd203 : (_te206 === _wc200 ? _wd201 : (b.grid[_te206] || -1))) === 1); });
                for (let _i208 = 0; _i208 < _a207.length; _i208++) {
                  const v_t = _a207[_i208];
                  let _c214: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c214) {
                    let _g209 = 0;
                    G210: {
                      const _a211 = sp.adj4[v_t];
                      for (let _i212 = 0; _i212 < _a211.length; _i212++) {
                        const _t213 = sp.adj4Edges[v_t][_i212];
                        if (!(((_t213 === _wc202 ? _wd203 : (_t213 === _wc200 ? _wd201 : (b.grid[_t213] || -1))) === 1))) continue;
                        _g209++;
                      }
                    }
                    _c214 = (_g209 < 2);
                  }
                  if (!(_c214)) continue;
                  let _g215 = 0;
                  G216: {
                    const _a217 = sp.adj4[v_t];
                    for (let _i218 = 0; _i218 < _a217.length; _i218++) {
                      const _t219 = sp.adj4Edges[v_t][_i218];
                      if (!(((_t219 === _wc202 ? _wd203 : (_t219 === _wc200 ? _wd201 : (b.grid[_t219] || -1))) === 1))) continue;
                      _g215++;
                    }
                  }
                  let _c258: boolean = (_g215 < 2);
                  if (_c258) {
                    _g220.length = 0;
                    G221: {
                      const _a240 = sp.adj4[v_t];
                      for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                        const v_y = _a240[_i241];
                        const _t242 = sp.adj4Edges[v_t][_i241];
                        let _c248: boolean = !((_t242 === _wc202 ? true : (_t242 === _wc200 ? true : (b.grid[_t242] !== 0))));
                        if (_c248) {
                          let _g243 = 0;
                          G244: {
                            const _a245 = sp.adj4[v_t];
                            for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                              const _t247 = sp.adj4Edges[v_t][_i246];
                              if (!(((_t247 === _wc202 ? _wd203 : (_t247 === _wc200 ? _wd201 : (b.grid[_t247] || -1))) === 1))) continue;
                              _g243++;
                            }
                          }
                          _c248 = (_g243 < 2);
                        }
                        let _c255: boolean = _c248;
                        if (_c255) {
                          let _g249 = 0;
                          G250: {
                            const _a252 = sp.adj4[v_y];
                            for (let _i253 = 0; _i253 < _a252.length; _i253++) {
                              const _t254 = sp.adj4Edges[v_y][_i253];
                              if (!(((_t254 === _wc202 ? _wd203 : (_t254 === _wc200 ? _wd201 : (b.grid[_t254] || -1))) === 1))) continue;
                              _g249++;
                            }
                          }
                          _c255 = (_g249 < 2);
                        }
                        if (!((_c255 && (!(throughWhere(sp, v_t, (_te256: number): boolean => {  return ((_te256 === _wc202 ? _wd203 : (_te256 === _wc200 ? _wd201 : (b.grid[_te256] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_t, (_te257: number): boolean => {  return ((_te257 === _wc202 ? _wd203 : (_te257 === _wc200 ? _wd201 : (b.grid[_te257] || -1))) === 1); }).length === _h199))))) continue;
                        _g220.push(v_y);
                      }
                    }
                    _c258 = ((_g215 + _g220.length) < 2);
                  }
                  let _c307: boolean = _c258;
                  if (!_c307) {
                    let _q259 = false;
                    Q260: {
                      const _a261 = sp.adj4[v_t];
                      for (let _i262 = 0; _i262 < _a261.length; _i262++) {
                        const v_s = _a261[_i262];
                        let _g263 = 0;
                        G264: {
                          const _a265 = sp.adj4[v_s];
                          for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                            const _t267 = sp.adj4Edges[v_s][_i266];
                            if (!(((_t267 === _wc202 ? _wd203 : (_t267 === _wc200 ? _wd201 : (b.grid[_t267] || -1))) === 1))) continue;
                            _g263++;
                          }
                        }
                        let _c306: boolean = (_g263 < 2);
                        if (_c306) {
                          _g268.length = 0;
                          G269: {
                            const _a288 = sp.adj4[v_s];
                            for (let _i289 = 0; _i289 < _a288.length; _i289++) {
                              const v_y = _a288[_i289];
                              const _t290 = sp.adj4Edges[v_s][_i289];
                              let _c296: boolean = !((_t290 === _wc202 ? true : (_t290 === _wc200 ? true : (b.grid[_t290] !== 0))));
                              if (_c296) {
                                let _g291 = 0;
                                G292: {
                                  const _a293 = sp.adj4[v_s];
                                  for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                                    const _t295 = sp.adj4Edges[v_s][_i294];
                                    if (!(((_t295 === _wc202 ? _wd203 : (_t295 === _wc200 ? _wd201 : (b.grid[_t295] || -1))) === 1))) continue;
                                    _g291++;
                                  }
                                }
                                _c296 = (_g291 < 2);
                              }
                              let _c303: boolean = _c296;
                              if (_c303) {
                                let _g297 = 0;
                                G298: {
                                  const _a300 = sp.adj4[v_y];
                                  for (let _i301 = 0; _i301 < _a300.length; _i301++) {
                                    const _t302 = sp.adj4Edges[v_y][_i301];
                                    if (!(((_t302 === _wc202 ? _wd203 : (_t302 === _wc200 ? _wd201 : (b.grid[_t302] || -1))) === 1))) continue;
                                    _g297++;
                                  }
                                }
                                _c303 = (_g297 < 2);
                              }
                              if (!((_c303 && (!(throughWhere(sp, v_s, (_te304: number): boolean => {  return ((_te304 === _wc202 ? _wd203 : (_te304 === _wc200 ? _wd201 : (b.grid[_te304] || -1))) === 1); }).includes(v_y)) || (throughWhere(sp, v_s, (_te305: number): boolean => {  return ((_te305 === _wc202 ? _wd203 : (_te305 === _wc200 ? _wd201 : (b.grid[_te305] || -1))) === 1); }).length === _h199))))) continue;
                              _g268.push(v_y);
                            }
                          }
                          _c306 = ((_g263 + _g268.length) < 2);
                        }
                        if (_c306) {
                          _q259 = true;
                          break Q260;
                        }
                      }
                    }
                    _c307 = _q259;
                  }
                  if (_c307) {
                    _q204 = true;
                    break Q205;
                  }
                }
              }
              _c308 = _q204;
            }
            _c309 = _c308;
          }
          if (!(_c309)) break L196;
          facts.length = 0;
          changed = false;
          const _t310 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t310] !== 0)) { if (fire === null) { b.placeAt(_t310, 1); changed = true; } else facts.push(PLACE, _t310, 1); }
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
