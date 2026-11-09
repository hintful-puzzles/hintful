// Compiled by `npm run describe` from src/games/galaxies/galaxies.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, keptStore, opp, rangeMask, stamps, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  dot: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "dotTile" | "split" | "separate" | "enclosed" | "soleOwner" | "onlyReach" | "exclave" | "mirrorWall";

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
  { id: "dotTile", tier: 0 },
  { id: "split", tier: 0 },
  { id: "separate", tier: 0 },
  { id: "enclosed", tier: 0 },
  { id: "soleOwner", tier: 0 },
  { id: "onlyReach", tier: 0 },
  { id: "exclave", tier: 0 },
  { id: "mirrorWall", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g383: number[] = [];
  const _g396: number[] = [];
  const _g416: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q381 = true;
  Q382: {
    _g383.length = 0;
    G384: {
      const _a387 = sp.edges;
      for (let _i388 = 0; _i388 < _a387.length; _i388++) {
        const v_e = _a387[_i388];
        const _h389 = (g[v_e] || -1);
        if (!((_h389 === 2))) continue;
        _g383.push(v_e);
      }
    }
    const v_O = _g383;
    const _eg393 = edgeGroups(sp, v_O);
    const _a390 = sp.edges;
    for (let _i391 = 0; _i391 < _a390.length; _i391++) {
      const v_e = _a390[_i391];
      const _h392 = (g[v_e] || -1);
      if (!(((_h392 === 1) === !(_eg393.of(sp.edgeEnds[2 * v_e + 1]) === _eg393.of(sp.edgeEnds[2 * v_e]))))) {
        _q381 = false;
        break Q382;
      }
    }
  }
  if (!(_q381)) return false;
  let _q394 = true;
  Q395: {
    _g396.length = 0;
    G397: {
      const _a400 = sp.edges;
      for (let _i401 = 0; _i401 < _a400.length; _i401++) {
        const v_e = _a400[_i401];
        const _h402 = (g[v_e] || -1);
        if (!((_h402 === 2))) continue;
        _g396.push(v_e);
      }
    }
    const v_O = _g396;
    const _eg410 = edgeGroups(sp, v_O);
    const _a403 = sp.cells;
    for (let _i404 = 0; _i404 < _a403.length; _i404++) {
      const v_c = _a403[_i404];
      let _g405 = 0;
      G406: {
        const _a407 = sp.centers;
        for (let _i408 = 0; _i408 < _a407.length; _i408++) {
          const v_p = _a407[_i408];
          const _h409 = clueAt(cl.dot, v_p);
          if (!(((_h409 !== -1) && (_eg410.of((sp.centerCells[v_p][0] ?? -1)) === _eg410.of(v_c))))) continue;
          _g405++;
        }
      }
      if (!((_g405 === 1))) {
        _q394 = false;
        break Q395;
      }
    }
  }
  if (!(_q394)) return false;
  for (let _k411 = 0; _k411 < cl.dot.at.length; _k411++) {
    const _at412 = cl.dot.at[_k411];
    let _q414 = true;
    Q415: {
      _g416.length = 0;
      G417: {
        const _a420 = sp.edges;
        for (let _i421 = 0; _i421 < _a420.length; _i421++) {
          const v_e = _a420[_i421];
          const _h422 = (g[v_e] || -1);
          if (!((_h422 === 2))) continue;
          _g416.push(v_e);
        }
      }
      const v_O = _g416;
      const _eg423 = edgeGroups(sp, v_O);
      const v_R = _eg423.of((sp.centerCells[_at412][0] ?? -1));
      let _q424 = true;
      Q425: {
        const _a426 = sp.centerCells[_at412];
        for (let _i427 = 0; _i427 < _a426.length; _i427++) {
          const v_c = _a426[_i427];
          if (!((_eg423.of(v_c) === v_R))) {
            _q424 = false;
            break Q425;
          }
        }
      }
      let _c432: boolean = _q424;
      if (_c432) {
        let _q428 = true;
        Q429: {
          const _a430 = v_R;
          for (let _i431 = 0; _i431 < _a430.length; _i431++) {
            const v_c = _a430[_i431];
            if (!((_eg423.of(opp(sp, v_c, _at412)) === v_R))) {
              _q428 = false;
              break Q429;
            }
          }
        }
        _c432 = _q428;
      }
      if (!(_c432)) {
        _q414 = false;
        break Q415;
      }
    }
    if (!(_q414)) return false;
  }
  return true;
}

export interface DotTileBinding {
  q: number;
}

const dotTileFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function dotTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DotTileBinding> | null): number {
  const facts = dotTileFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.dot.at.length; v_q++) {
    let _q5 = false;
    Q6: {
      const _a7 = sp.centerCells[cl.dot.at[v_q]];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_c = _a7[_i8];
        if ((b.markOf(v_c) !== v_q)) {
          _q5 = true;
          break Q6;
        }
      }
    }
    if (!(_q5)) continue;
    facts.length = 0;
    changed = false;
    let _q9 = true;
    Q10: {
      const _a11 = sp.centerCells[cl.dot.at[v_q]];
      for (let _i12 = 0; _i12 < _a11.length; _i12++) {
        const v_c = _a11[_i12];
        let _mk13 = v_c >= 0;
        if (_mk13) { const _was = b.markOf(v_c); if (_was >= 0) _mk13 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
        if (!(_mk13)) {
          _q9 = false;
          break Q10;
        }
      }
    }
    if (!(_q9)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ q: v_q }, facts)) return 1;
    }
  }
  return fired;
}

export interface SplitBinding {
  e: number;
  q: number;
}

const splitFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function split(b: Marks, sp: GridSpace, fire: Fire<SplitBinding> | null): number {
  const facts = splitFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.edges;
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_e = _a17[_i18];
    const _h19 = (b.grid[v_e] || -1);
    if (!((_h19 === 1))) continue;
    L20: {
      const v_q = b.markOf(sp.edgeEnds[2 * v_e]);
      if (!((v_q !== -1))) break L20;
      facts.length = 0;
      changed = false;
      if (!((b.markOf(sp.edgeEnds[2 * v_e + 1]) !== v_q))) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, q: v_q }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SeparateBinding {
  e: number;
  p: number;
  q: number;
}

const separateFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function separate(b: Marks, sp: GridSpace, fire: Fire<SeparateBinding> | null): number {
  const facts = separateFacts;
  let fired = 0;
  let changed = false;
  const _a25 = sp.edges;
  for (let _i26 = 0; _i26 < _a25.length; _i26++) {
    const v_e = _a25[_i26];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L27: {
      const v_p = b.markOf(sp.edgeEnds[2 * v_e]);
      if (!((v_p !== -1))) break L27;
      L28: {
        const v_q = b.markOf(sp.edgeEnds[2 * v_e + 1]);
        if (!(((v_q !== -1) && (v_q !== v_p)))) break L28;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ e: v_e, p: v_p, q: v_q }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface EnclosedBinding {
  c: number;
  N: readonly number[];
  q: number;
}

const enclosedFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function enclosed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EnclosedBinding> | null): number {
  const _g49: number[] = [];
  const facts = enclosedFacts;
  let fired = 0;
  let changed = false;
  const _a47 = sp.cells;
  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
    const v_c = _a47[_i48];
    if (!((b.markOf(v_c) === -1))) continue;
    _g49.length = 0;
    G50: {
      const _a53 = sp.adj4[v_c];
      for (let _i54 = 0; _i54 < _a53.length; _i54++) {
        const v_n = _a53[_i54];
        const _h55 = (b.grid[sp.adj4Edges[v_c][_i54]] || -1);
        if (!((_h55 !== 1))) continue;
        _g49.push(v_n);
      }
    }
    L56: {
      const v_N = _g49;
      const _h57 = v_N.length;
      if (!((_h57 > 0))) break L56;
      L58: {
        const v_q = b.markOf((v_N[0] ?? -1));
        let _c63: boolean = (v_q !== -1);
        if (_c63) {
          let _q59 = true;
          Q60: {
            const _a61 = v_N;
            for (let _i62 = 0; _i62 < _a61.length; _i62++) {
              const v_n = _a61[_i62];
              if (!((b.markOf(v_n) === v_q))) {
                _q59 = false;
                break Q60;
              }
            }
          }
          _c63 = _q59;
        }
        let _c66: boolean = _c63;
        if (_c66) {
          let _q64 = false;
          Q65: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              if ((opp(sp, v_c, cl.dot.at[v_p]) === v_c)) {
                _q64 = true;
                break Q65;
              }
            }
          }
          _c66 = !(_q64);
        }
        if (!(_c66)) break L58;
        facts.length = 0;
        changed = false;
        let _mk67 = v_c >= 0;
        if (_mk67) { const _was = b.markOf(v_c); if (_was >= 0) _mk67 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
        let _c70: boolean = _mk67;
        if (_c70) {
          const _t68 = opp(sp, v_c, cl.dot.at[v_q]);
          let _mk69 = _t68 >= 0;
          if (_mk69) { const _was = b.markOf(_t68); if (_was >= 0) _mk69 = _was === v_q; else if (fire === null) { b.markAt(_t68, v_q); changed = true; } else facts.push(MARK, _t68, v_q); }
          _c70 = _mk69;
        }
        if (!(_c70)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, N: v_N.slice(), q: v_q }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface SoleOwnerBinding {
  O: readonly number[];
  c: number;
  K: readonly number[];
}

const soleOwnerFacts: number[] = [];

/** Its dearest read grows with the board as n^3. */
export function soleOwner(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SoleOwnerBinding> | null): number {
  const _g172: number[] = [];
  const _g209: number[] = [];
  const facts = soleOwnerFacts;
  let fired = 0;
  let changed = false;
  const _k236 = nearKept.board(cl);
  _g172.length = 0;
  G173: {
    const _a176 = sp.edges;
    for (let _i177 = 0; _i177 < _a176.length; _i177++) {
      const v_e = _a176[_i177];
      const _h178 = (b.grid[v_e] || -1);
      if (!((_h178 !== 1))) continue;
      _g172.push(v_e);
    }
  }
  const v_O = _g172;
  const _eg181 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _memo183 = new Map<readonly number[], boolean>();
  const _a179 = sp.cells;
  for (let _i180 = 0; _i180 < _a179.length; _i180++) {
    const v_c = _a179[_i180];
    let _c208: boolean = (b.markOf(v_c) === -1);
    if (_c208) {
      const _t182 = _eg181.of(v_c);
      let _gq184 = _memo183.get(_t182);
      if (_gq184 === undefined) {
        let _q185 = false;
        Q186: {
          for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
            const _h206 = cl.dot.at[v_p];
            let _c192: boolean = (_t182.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
            if (_c192) {
              let _q187 = true;
              Q188: {
                const _a190 = sp.centerCells[cl.dot.at[v_p]];
                for (let _i191 = 0; _i191 < _a190.length; _i191++) {
                  const v_c_189 = _a190[_i191];
                  if (!((_t182.includes(v_c_189)))) {
                    _q187 = false;
                    break Q188;
                  }
                }
              }
              _c192 = _q187;
            }
            let _c201: boolean = _c192;
            if (_c201) {
              let _q193 = true;
              Q194: {
                for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                  let _c200: boolean = (v_r === v_p);
                  if (!_c200) {
                    let _q195 = true;
                    Q196: {
                      const _a198 = sp.centerCells[cl.dot.at[v_r]];
                      for (let _i199 = 0; _i199 < _a198.length; _i199++) {
                        const v_c_197 = _a198[_i199];
                        if (!(!(_t182.includes(v_c_197)))) {
                          _q195 = false;
                          break Q196;
                        }
                      }
                    }
                    _c200 = _q195;
                  }
                  if (!(_c200)) {
                    _q193 = false;
                    break Q194;
                  }
                }
              }
              _c201 = _q193;
            }
            let _c207: boolean = _c201;
            if (_c207) {
              let _q202 = true;
              Q203: {
                const _a204 = _t182;
                for (let _i205 = 0; _i205 < _a204.length; _i205++) {
                  const v_y = _a204[_i205];
                  if (!((_t182.includes(opp(sp, v_y, _h206))))) {
                    _q202 = false;
                    break Q203;
                  }
                }
              }
              _c207 = _q202;
            }
            if (_c207) {
              _q185 = true;
              break Q186;
            }
          }
        }
        _gq184 = _q185;
        _memo183.set(_t182, _gq184);
      }
      _c208 = !(_gq184);
    }
    if (!(_c208)) continue;
    _g209.length = 0;
    G210: {
      const _a237 = (_k236[v_c] ?? near(sp, cl, v_c));
      for (let _i238 = 0; _i238 < _a237.length; _i238++) {
        const v_q = _a237[_i238];
        const _t239 = opp(sp, v_c, cl.dot.at[v_q]);
        const _t240 = _eg181.of(_t239);
        let _gq241 = _memo183.get(_t240);
        if (_gq241 === undefined) {
          let _q242 = false;
          Q243: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h261 = cl.dot.at[v_p];
              let _c248: boolean = (_t240.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
              if (_c248) {
                let _q244 = true;
                Q245: {
                  const _a246 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i247 = 0; _i247 < _a246.length; _i247++) {
                    const v_c = _a246[_i247];
                    if (!((_t240.includes(v_c)))) {
                      _q244 = false;
                      break Q245;
                    }
                  }
                }
                _c248 = _q244;
              }
              let _c256: boolean = _c248;
              if (_c256) {
                let _q249 = true;
                Q250: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c255: boolean = (v_r === v_p);
                    if (!_c255) {
                      let _q251 = true;
                      Q252: {
                        const _a253 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i254 = 0; _i254 < _a253.length; _i254++) {
                          const v_c = _a253[_i254];
                          if (!(!(_t240.includes(v_c)))) {
                            _q251 = false;
                            break Q252;
                          }
                        }
                      }
                      _c255 = _q251;
                    }
                    if (!(_c255)) {
                      _q249 = false;
                      break Q250;
                    }
                  }
                }
                _c256 = _q249;
              }
              let _c262: boolean = _c256;
              if (_c262) {
                let _q257 = true;
                Q258: {
                  const _a259 = _t240;
                  for (let _i260 = 0; _i260 < _a259.length; _i260++) {
                    const v_y = _a259[_i260];
                    if (!((_t240.includes(opp(sp, v_y, _h261))))) {
                      _q257 = false;
                      break Q258;
                    }
                  }
                }
                _c262 = _q257;
              }
              if (_c262) {
                _q242 = true;
                break Q243;
              }
            }
          }
          _gq241 = _q242;
          _memo183.set(_t240, _gq241);
        }
        if (!(!(_gq241))) continue;
        _g209.push(v_q);
      }
    }
    L263: {
      const v_K = _g209;
      const _h264 = v_K.length;
      if (!((_h264 < 2))) break L263;
      facts.length = 0;
      changed = false;
      let _c273: boolean = (_h264 > 0);
      if (_c273) {
        let _q265 = true;
        Q266: {
          const _a267 = v_K;
          for (let _i268 = 0; _i268 < _a267.length; _i268++) {
            const v_q = _a267[_i268];
            let _mk269 = v_c >= 0;
            if (_mk269) { const _was = b.markOf(v_c); if (_was >= 0) _mk269 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c272: boolean = _mk269;
            if (_c272) {
              const _t270 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk271 = _t270 >= 0;
              if (_mk271) { const _was = b.markOf(_t270); if (_was >= 0) _mk271 = _was === v_q; else if (fire === null) { b.markAt(_t270, v_q); changed = true; } else facts.push(MARK, _t270, v_q); }
              _c272 = _mk271;
            }
            if (!(_c272)) {
              _q265 = false;
              break Q266;
            }
          }
        }
        _c273 = _q265;
      }
      if (!(_c273)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O.slice(), c: v_c, K: v_K.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface OnlyReachBinding {
  c: number;
  K: readonly number[];
}

const onlyReachFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyReach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyReachBinding> | null): number {
  const _g301: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _k305 = nearKept.board(cl);
  const _a299 = sp.cells;
  for (let _i300 = 0; _i300 < _a299.length; _i300++) {
    const v_c = _a299[_i300];
    if (!((b.markOf(v_c) === -1))) continue;
    _g301.length = 0;
    G302: {
      const _a306 = (_k305[v_c] ?? near(sp, cl, v_c));
      for (let _i307 = 0; _i307 < _a306.length; _i307++) {
        const v_q = _a306[_i307];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g301.push(v_q);
      }
    }
    L308: {
      const v_K = _g301;
      const _h309 = v_K.length;
      if (!((_h309 < 2))) break L308;
      facts.length = 0;
      changed = false;
      let _c318: boolean = (_h309 > 0);
      if (_c318) {
        let _q310 = true;
        Q311: {
          const _a312 = v_K;
          for (let _i313 = 0; _i313 < _a312.length; _i313++) {
            const v_q = _a312[_i313];
            let _mk314 = v_c >= 0;
            if (_mk314) { const _was = b.markOf(v_c); if (_was >= 0) _mk314 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c317: boolean = _mk314;
            if (_c317) {
              const _t315 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk316 = _t315 >= 0;
              if (_mk316) { const _was = b.markOf(_t315); if (_was >= 0) _mk316 = _was === v_q; else if (fire === null) { b.markAt(_t315, v_q); changed = true; } else facts.push(MARK, _t315, v_q); }
              _c317 = _mk316;
            }
            if (!(_c317)) {
              _q310 = false;
              break Q311;
            }
          }
        }
        _c318 = _q310;
      }
      if (!(_c318)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, K: v_K.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ExclaveBinding {
  c: number;
  q: number;
  G: readonly number[];
  L: readonly number[];
}

const exclaveFacts: number[] = [];
const _st346 = stamps();

/** Its dearest read grows with the board as n^2. */
export function exclave(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExclaveBinding> | null): number {
  const _g340: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a335 = sp.cells;
  for (let _i336 = 0; _i336 < _a335.length; _i336++) {
    const v_c = _a335[_i336];
    L337: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L337;
      const _h360 = cl.dot.at[v_q];
      L339: {
        const v_G = throughWhere(sp, v_c, (_te338: number): boolean => {  return ((((b.grid[_te338] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te338]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te338 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L339;
        _g340.length = 0;
        _st346.pass++;
        G341: {
          const _a347 = v_G;
          for (let _i348 = 0; _i348 < _a347.length; _i348++) {
            const v_x = _a347[_i348];
            const _a349 = sp.adj4[v_x];
            for (let _i350 = 0; _i350 < _a349.length; _i350++) {
              const v_n = _a349[_i350];
              const _h351 = (b.grid[sp.adj4Edges[v_x][_i350]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h351 !== 1)))) continue;
              const _t352 = v_n;
              if (_g340.length < 16) { if (!_g340.includes(_t352)) _g340.push(_t352); } else addOnce(_g340, _st346, _t352);
            }
          }
        }
        L353: {
          const v_L = _g340;
          const _h354 = v_L.length;
          if (!((_h354 < 2))) break L353;
          facts.length = 0;
          changed = false;
          let _c364: boolean = (_h354 > 0);
          if (_c364) {
            let _q355 = true;
            Q356: {
              const _a357 = v_L;
              for (let _i358 = 0; _i358 < _a357.length; _i358++) {
                const v_l = _a357[_i358];
                let _mk359 = v_l >= 0;
                if (_mk359) { const _was = b.markOf(v_l); if (_was >= 0) _mk359 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c363: boolean = _mk359;
                if (_c363) {
                  const _t361 = opp(sp, v_l, _h360);
                  let _mk362 = _t361 >= 0;
                  if (_mk362) { const _was = b.markOf(_t361); if (_was >= 0) _mk362 = _was === v_q; else if (fire === null) { b.markAt(_t361, v_q); changed = true; } else facts.push(MARK, _t361, v_q); }
                  _c363 = _mk362;
                }
                if (!(_c363)) {
                  _q355 = false;
                  break Q356;
                }
              }
            }
            _c364 = _q355;
          }
          if (!(_c364)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, q: v_q, G: v_G.slice(), L: v_L.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface MirrorWallBinding {
  e: number;
  a: number;
  q: number;
  b: number;
  a2: number;
  b2: number;
}

const mirrorWallFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function mirrorWall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MirrorWallBinding> | null): number {
  const facts = mirrorWallFacts;
  let fired = 0;
  let changed = false;
  const _a373 = sp.edges;
  for (let _i374 = 0; _i374 < _a373.length; _i374++) {
    const v_e = _a373[_i374];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _t375 = sp.edgeEnds[2 * v_e];
    const _t376 = sp.edgeEnds[2 * v_e + 1];
    for (let _i377 = 0; _i377 < 2; _i377++) {
      const v_a = _i377 === 0 ? _t375 : _t376;
      if (_i377 === 1 && (v_a === _t375)) continue;
      L378: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L378;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L379: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L379;
          L380: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L380;
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ e: v_e, a: v_a, q: v_q, b: v_b, a2: v_a2, b2: v_b2 }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

const underKept = keptStore<readonly number[]>();
let underOn: object | null = null;
let underAt: Kept<readonly number[]> = [];

/** `under(x)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function under(sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  if (cl !== underOn) {
    underAt = underKept.board(cl);
    underOn = cl;
  }
  const _kept: Kept<readonly number[]> = underAt;
  if (_kept[v_x] !== undefined) return _kept[v_x];
  const _g111: number[] = [];
  G112: {
    for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
      if (!((sp.centerCells[cl.dot.at[v_p]].includes(v_x)))) continue;
      _g111.push(v_p);
    }
  }
  const _made = _g111;
  _kept[v_x] = _made;
  return _made;
}

const freeKept = keptStore<Kept<boolean>>();
let freeOn: object | null = null;
let freeAt: Kept<Kept<boolean>> = [];

/** `free(x, q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function free(sp: GridSpace, cl: Dealt, v_x: number, v_q: number): boolean {
  if (cl !== freeOn) {
    freeAt = freeKept.board(cl);
    freeOn = cl;
  }
  const _kept: Kept<Kept<boolean>> = freeAt;
  const _kept1 = (_kept[v_x] ??= []);
  if (_kept1[v_q] !== undefined) return _kept1[v_q];
  let _c115: boolean = (opp(sp, v_x, cl.dot.at[v_q]) !== -1);
  if (_c115) {
    let _q109 = true;
    Q110: {
      const _a113 = under(sp, cl, v_x);
      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
        const v_p = _a113[_i114];
        if (!((v_p === v_q))) {
          _q109 = false;
          break Q110;
        }
      }
    }
    _c115 = _q109;
  }
  let _c120: boolean = _c115;
  if (_c120) {
    let _q116 = true;
    Q117: {
      const _a118 = under(sp, cl, opp(sp, v_x, cl.dot.at[v_q]));
      for (let _i119 = 0; _i119 < _a118.length; _i119++) {
        const v_p = _a118[_i119];
        if (!((v_p === v_q))) {
          _q116 = false;
          break Q117;
        }
      }
    }
    _c120 = _q116;
  }
  const _made = _c120;
  _kept1[v_q] = _made;
  return _made;
}

const roomKept = keptStore<readonly number[]>();
let roomOn: object | null = null;
let roomAt: Kept<readonly number[]> = [];

/** `room(q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function room(sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  if (cl !== roomOn) {
    roomAt = roomKept.board(cl);
    roomOn = cl;
  }
  const _kept: Kept<readonly number[]> = roomAt;
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _made = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te108: number): boolean => {  return (free(sp, cl, sp.edgeEnds[2 * _te108], v_q) && free(sp, cl, sp.edgeEnds[2 * _te108 + 1], v_q)); });
  _kept[v_q] = _made;
  return _made;
}

const nearKept = keptStore<readonly number[]>();
let nearOn: object | null = null;
let nearAt: Kept<readonly number[]> = [];

/** `near(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function near(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== nearOn) {
    nearAt = nearKept.board(cl);
    nearOn = cl;
  }
  const _kept: Kept<readonly number[]> = nearAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g106: number[] = [];
  G107: {
    for (let v_q = 0; v_q < cl.dot.at.length; v_q++) {
      if (!((room(sp, cl, v_q).includes(v_c)))) continue;
      _g106.push(v_q);
    }
  }
  const _made = _g106;
  _kept[v_c] = _made;
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) !== 1);
}

const reachKept = keptStore<readonly number[]>();

/** `reach(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = reachKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g280: number[] = [];
  G281: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te289: number): boolean => { let _c291: boolean = ((b.grid[_te289] || -1) !== 1); if (_c291) {   const _t290 = sp.edgeEnds[2 * _te289];   _c291 = (((opp(sp, _t290, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t290) === -1) || (b.markOf(_t290) === v_q))) && ((b.markOf(opp(sp, _t290, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t290, cl.dot.at[v_q])) === v_q))); } let _c293: boolean = _c291; if (_c293) {   const _t292 = sp.edgeEnds[2 * _te289 + 1];   _c293 = (((opp(sp, _t292, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t292) === -1) || (b.markOf(_t292) === v_q))) && ((b.markOf(opp(sp, _t292, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t292, cl.dot.at[v_q])) === v_q))); } return _c293; });
    const _a294 = v_T;
    for (let _i295 = 0; _i295 < _a294.length; _i295++) {
      const v_x = _a294[_i295];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g280.includes(v_x)) _g280.push(v_x);
    }
  }
  const _made = _g280;
  _kept[v_q] = _made;
  return _made;
}
