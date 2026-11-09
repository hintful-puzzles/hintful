// Compiled by `npm run describe` from src/games/galaxies/galaxies.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, clueAt, edgeGroups, keptEdgeGroups, keptStore, opp, rangeMask, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g379: number[] = [];
  const _g392: number[] = [];
  const _g412: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q377 = true;
  Q378: {
    _g379.length = 0;
    G380: {
      const _a383 = sp.edges;
      for (let _i384 = 0; _i384 < _a383.length; _i384++) {
        const v_e = _a383[_i384];
        const _h385 = (g[v_e] || -1);
        if (!((_h385 === 2))) continue;
        _g379.push(v_e);
      }
    }
    const v_O = _g379;
    const _eg389 = edgeGroups(sp, v_O);
    const _a386 = sp.edges;
    for (let _i387 = 0; _i387 < _a386.length; _i387++) {
      const v_e = _a386[_i387];
      const _h388 = (g[v_e] || -1);
      if (!(((_h388 === 1) === !(_eg389.of(sp.edgeEnds[2 * v_e + 1]) === _eg389.of(sp.edgeEnds[2 * v_e]))))) {
        _q377 = false;
        break Q378;
      }
    }
  }
  if (!(_q377)) return false;
  let _q390 = true;
  Q391: {
    _g392.length = 0;
    G393: {
      const _a396 = sp.edges;
      for (let _i397 = 0; _i397 < _a396.length; _i397++) {
        const v_e = _a396[_i397];
        const _h398 = (g[v_e] || -1);
        if (!((_h398 === 2))) continue;
        _g392.push(v_e);
      }
    }
    const v_O = _g392;
    const _eg406 = edgeGroups(sp, v_O);
    const _a399 = sp.cells;
    for (let _i400 = 0; _i400 < _a399.length; _i400++) {
      const v_c = _a399[_i400];
      let _g401 = 0;
      G402: {
        const _a403 = sp.centers;
        for (let _i404 = 0; _i404 < _a403.length; _i404++) {
          const v_p = _a403[_i404];
          const _h405 = clueAt(cl.dot, v_p);
          if (!(((_h405 !== -1) && (_eg406.of((sp.centerCells[v_p][0] ?? -1)) === _eg406.of(v_c))))) continue;
          _g401++;
        }
      }
      if (!((_g401 === 1))) {
        _q390 = false;
        break Q391;
      }
    }
  }
  if (!(_q390)) return false;
  for (let _k407 = 0; _k407 < cl.dot.at.length; _k407++) {
    const _at408 = cl.dot.at[_k407];
    let _q410 = true;
    Q411: {
      _g412.length = 0;
      G413: {
        const _a416 = sp.edges;
        for (let _i417 = 0; _i417 < _a416.length; _i417++) {
          const v_e = _a416[_i417];
          const _h418 = (g[v_e] || -1);
          if (!((_h418 === 2))) continue;
          _g412.push(v_e);
        }
      }
      const v_O = _g412;
      const _eg419 = edgeGroups(sp, v_O);
      const v_R = _eg419.of((sp.centerCells[_at408][0] ?? -1));
      let _q420 = true;
      Q421: {
        const _a422 = sp.centerCells[_at408];
        for (let _i423 = 0; _i423 < _a422.length; _i423++) {
          const v_c = _a422[_i423];
          if (!((_eg419.of(v_c) === v_R))) {
            _q420 = false;
            break Q421;
          }
        }
      }
      let _c428: boolean = _q420;
      if (_c428) {
        let _q424 = true;
        Q425: {
          const _a426 = v_R;
          for (let _i427 = 0; _i427 < _a426.length; _i427++) {
            const v_c = _a426[_i427];
            if (!((_eg419.of(opp(sp, v_c, _at408)) === v_R))) {
              _q424 = false;
              break Q425;
            }
          }
        }
        _c428 = _q424;
      }
      if (!(_c428)) {
        _q410 = false;
        break Q411;
      }
    }
    if (!(_q410)) return false;
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
      const _a236 = near(sp, cl, v_c);
      for (let _i237 = 0; _i237 < _a236.length; _i237++) {
        const v_q = _a236[_i237];
        const _t238 = opp(sp, v_c, cl.dot.at[v_q]);
        const _t239 = _eg181.of(_t238);
        let _gq240 = _memo183.get(_t239);
        if (_gq240 === undefined) {
          let _q241 = false;
          Q242: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h260 = cl.dot.at[v_p];
              let _c247: boolean = (_t239.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
              if (_c247) {
                let _q243 = true;
                Q244: {
                  const _a245 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                    const v_c = _a245[_i246];
                    if (!((_t239.includes(v_c)))) {
                      _q243 = false;
                      break Q244;
                    }
                  }
                }
                _c247 = _q243;
              }
              let _c255: boolean = _c247;
              if (_c255) {
                let _q248 = true;
                Q249: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c254: boolean = (v_r === v_p);
                    if (!_c254) {
                      let _q250 = true;
                      Q251: {
                        const _a252 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i253 = 0; _i253 < _a252.length; _i253++) {
                          const v_c = _a252[_i253];
                          if (!(!(_t239.includes(v_c)))) {
                            _q250 = false;
                            break Q251;
                          }
                        }
                      }
                      _c254 = _q250;
                    }
                    if (!(_c254)) {
                      _q248 = false;
                      break Q249;
                    }
                  }
                }
                _c255 = _q248;
              }
              let _c261: boolean = _c255;
              if (_c261) {
                let _q256 = true;
                Q257: {
                  const _a258 = _t239;
                  for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                    const v_y = _a258[_i259];
                    if (!((_t239.includes(opp(sp, v_y, _h260))))) {
                      _q256 = false;
                      break Q257;
                    }
                  }
                }
                _c261 = _q256;
              }
              if (_c261) {
                _q241 = true;
                break Q242;
              }
            }
          }
          _gq240 = _q241;
          _memo183.set(_t239, _gq240);
        }
        if (!(!(_gq240))) continue;
        _g209.push(v_q);
      }
    }
    L262: {
      const v_K = _g209;
      const _h263 = v_K.length;
      if (!((_h263 < 2))) break L262;
      facts.length = 0;
      changed = false;
      let _c272: boolean = (_h263 > 0);
      if (_c272) {
        let _q264 = true;
        Q265: {
          const _a266 = v_K;
          for (let _i267 = 0; _i267 < _a266.length; _i267++) {
            const v_q = _a266[_i267];
            let _mk268 = v_c >= 0;
            if (_mk268) { const _was = b.markOf(v_c); if (_was >= 0) _mk268 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c271: boolean = _mk268;
            if (_c271) {
              const _t269 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk270 = _t269 >= 0;
              if (_mk270) { const _was = b.markOf(_t269); if (_was >= 0) _mk270 = _was === v_q; else if (fire === null) { b.markAt(_t269, v_q); changed = true; } else facts.push(MARK, _t269, v_q); }
              _c271 = _mk270;
            }
            if (!(_c271)) {
              _q264 = false;
              break Q265;
            }
          }
        }
        _c272 = _q264;
      }
      if (!(_c272)) return -1;
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
  const _g300: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _a298 = sp.cells;
  for (let _i299 = 0; _i299 < _a298.length; _i299++) {
    const v_c = _a298[_i299];
    if (!((b.markOf(v_c) === -1))) continue;
    _g300.length = 0;
    G301: {
      const _a304 = near(sp, cl, v_c);
      for (let _i305 = 0; _i305 < _a304.length; _i305++) {
        const v_q = _a304[_i305];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g300.push(v_q);
      }
    }
    L306: {
      const v_K = _g300;
      const _h307 = v_K.length;
      if (!((_h307 < 2))) break L306;
      facts.length = 0;
      changed = false;
      let _c316: boolean = (_h307 > 0);
      if (_c316) {
        let _q308 = true;
        Q309: {
          const _a310 = v_K;
          for (let _i311 = 0; _i311 < _a310.length; _i311++) {
            const v_q = _a310[_i311];
            let _mk312 = v_c >= 0;
            if (_mk312) { const _was = b.markOf(v_c); if (_was >= 0) _mk312 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c315: boolean = _mk312;
            if (_c315) {
              const _t313 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk314 = _t313 >= 0;
              if (_mk314) { const _was = b.markOf(_t313); if (_was >= 0) _mk314 = _was === v_q; else if (fire === null) { b.markAt(_t313, v_q); changed = true; } else facts.push(MARK, _t313, v_q); }
              _c315 = _mk314;
            }
            if (!(_c315)) {
              _q308 = false;
              break Q309;
            }
          }
        }
        _c316 = _q308;
      }
      if (!(_c316)) return -1;
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

/** Its dearest read grows with the board as n^2. */
export function exclave(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExclaveBinding> | null): number {
  const _g338: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a333 = sp.cells;
  for (let _i334 = 0; _i334 < _a333.length; _i334++) {
    const v_c = _a333[_i334];
    L335: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L335;
      const _h356 = cl.dot.at[v_q];
      L337: {
        const v_G = throughWhere(sp, v_c, (_te336: number): boolean => {  return ((((b.grid[_te336] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te336]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te336 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L337;
        _g338.length = 0;
        G339: {
          const _a344 = v_G;
          for (let _i345 = 0; _i345 < _a344.length; _i345++) {
            const v_x = _a344[_i345];
            const _a346 = sp.adj4[v_x];
            for (let _i347 = 0; _i347 < _a346.length; _i347++) {
              const v_n = _a346[_i347];
              const _h348 = (b.grid[sp.adj4Edges[v_x][_i347]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h348 !== 1)))) continue;
              if (!_g338.includes(v_n)) _g338.push(v_n);
            }
          }
        }
        L349: {
          const v_L = _g338;
          const _h350 = v_L.length;
          if (!((_h350 < 2))) break L349;
          facts.length = 0;
          changed = false;
          let _c360: boolean = (_h350 > 0);
          if (_c360) {
            let _q351 = true;
            Q352: {
              const _a353 = v_L;
              for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                const v_l = _a353[_i354];
                let _mk355 = v_l >= 0;
                if (_mk355) { const _was = b.markOf(v_l); if (_was >= 0) _mk355 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c359: boolean = _mk355;
                if (_c359) {
                  const _t357 = opp(sp, v_l, _h356);
                  let _mk358 = _t357 >= 0;
                  if (_mk358) { const _was = b.markOf(_t357); if (_was >= 0) _mk358 = _was === v_q; else if (fire === null) { b.markAt(_t357, v_q); changed = true; } else facts.push(MARK, _t357, v_q); }
                  _c359 = _mk358;
                }
                if (!(_c359)) {
                  _q351 = false;
                  break Q352;
                }
              }
            }
            _c360 = _q351;
          }
          if (!(_c360)) return -1;
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
  const _a369 = sp.edges;
  for (let _i370 = 0; _i370 < _a369.length; _i370++) {
    const v_e = _a369[_i370];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _t371 = sp.edgeEnds[2 * v_e];
    const _t372 = sp.edgeEnds[2 * v_e + 1];
    for (let _i373 = 0; _i373 < 2; _i373++) {
      const v_a = _i373 === 0 ? _t371 : _t372;
      if (_i373 === 1 && (v_a === _t371)) continue;
      L374: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L374;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L375: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L375;
          L376: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L376;
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

/** `under(x)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function under(sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  const _kept: Kept<readonly number[]> = underKept.board(cl);
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

/** `free(x, q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function free(sp: GridSpace, cl: Dealt, v_x: number, v_q: number): boolean {
  const _kept: Kept<Kept<boolean>> = freeKept.board(cl);
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

/** `room(q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function room(sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = roomKept.board(cl);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _made = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te108: number): boolean => {  return (free(sp, cl, sp.edgeEnds[2 * _te108], v_q) && free(sp, cl, sp.edgeEnds[2 * _te108 + 1], v_q)); });
  _kept[v_q] = _made;
  return _made;
}

const nearKept = keptStore<readonly number[]>();

/** `near(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function near(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = nearKept.board(cl);
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
  const _g279: number[] = [];
  G280: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te288: number): boolean => { let _c290: boolean = ((b.grid[_te288] || -1) !== 1); if (_c290) {   const _t289 = sp.edgeEnds[2 * _te288];   _c290 = (((opp(sp, _t289, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t289) === -1) || (b.markOf(_t289) === v_q))) && ((b.markOf(opp(sp, _t289, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t289, cl.dot.at[v_q])) === v_q))); } let _c292: boolean = _c290; if (_c292) {   const _t291 = sp.edgeEnds[2 * _te288 + 1];   _c292 = (((opp(sp, _t291, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t291) === -1) || (b.markOf(_t291) === v_q))) && ((b.markOf(opp(sp, _t291, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t291, cl.dot.at[v_q])) === v_q))); } return _c292; });
    const _a293 = v_T;
    for (let _i294 = 0; _i294 < _a293.length; _i294++) {
      const v_x = _a293[_i294];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g279.includes(v_x)) _g279.push(v_x);
    }
  }
  const _made = _g279;
  _kept[v_q] = _made;
  return _made;
}
