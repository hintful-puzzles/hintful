// Compiled by `npm run describe` from src/games/galaxies/galaxies.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, clueAt, edgeGroups, keptEdgeGroups, keptStore, opp, rangeMask, setOf, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

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
export const tiers: readonly string[] = ["Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g397: number[] = [];
  const _g410: number[] = [];
  const _g430: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q395 = true;
  Q396: {
    _g397.length = 0;
    G398: {
      const _a401 = sp.edges;
      for (let _i402 = 0; _i402 < _a401.length; _i402++) {
        const v_e = _a401[_i402];
        const _h403 = (g[v_e] || -1);
        if (!((_h403 === 2))) continue;
        _g397.push(v_e);
      }
    }
    const v_O = _g397;
    const _eg407 = edgeGroups(sp, v_O);
    const _a404 = sp.edges;
    for (let _i405 = 0; _i405 < _a404.length; _i405++) {
      const v_e = _a404[_i405];
      const _h406 = (g[v_e] || -1);
      if (!(((_h406 === 1) === !(_eg407.of(sp.edgeEnds[2 * v_e + 1]) === _eg407.of(sp.edgeEnds[2 * v_e]))))) {
        _q395 = false;
        break Q396;
      }
    }
  }
  if (!(_q395)) return false;
  let _q408 = true;
  Q409: {
    _g410.length = 0;
    G411: {
      const _a414 = sp.edges;
      for (let _i415 = 0; _i415 < _a414.length; _i415++) {
        const v_e = _a414[_i415];
        const _h416 = (g[v_e] || -1);
        if (!((_h416 === 2))) continue;
        _g410.push(v_e);
      }
    }
    const v_O = _g410;
    const _eg424 = edgeGroups(sp, v_O);
    const _a417 = sp.cells;
    for (let _i418 = 0; _i418 < _a417.length; _i418++) {
      const v_c = _a417[_i418];
      let _g419 = 0;
      G420: {
        const _a421 = sp.centers;
        for (let _i422 = 0; _i422 < _a421.length; _i422++) {
          const v_p = _a421[_i422];
          const _h423 = clueAt(cl.dot, v_p);
          if (!(((_h423 !== -1) && (_eg424.of((sp.centerCells[v_p][0] ?? -1)) === _eg424.of(v_c))))) continue;
          _g419++;
        }
      }
      if (!((_g419 === 1))) {
        _q408 = false;
        break Q409;
      }
    }
  }
  if (!(_q408)) return false;
  for (let _k425 = 0; _k425 < cl.dot.at.length; _k425++) {
    const _at426 = cl.dot.at[_k425];
    let _q428 = true;
    Q429: {
      _g430.length = 0;
      G431: {
        const _a434 = sp.edges;
        for (let _i435 = 0; _i435 < _a434.length; _i435++) {
          const v_e = _a434[_i435];
          const _h436 = (g[v_e] || -1);
          if (!((_h436 === 2))) continue;
          _g430.push(v_e);
        }
      }
      const v_O = _g430;
      const _eg437 = edgeGroups(sp, v_O);
      const v_R = _eg437.of((sp.centerCells[_at426][0] ?? -1));
      let _q438 = true;
      Q439: {
        const _a440 = sp.centerCells[_at426];
        for (let _i441 = 0; _i441 < _a440.length; _i441++) {
          const v_c = _a440[_i441];
          if (!((_eg437.of(v_c) === v_R))) {
            _q438 = false;
            break Q439;
          }
        }
      }
      let _c446: boolean = _q438;
      if (_c446) {
        let _q442 = true;
        Q443: {
          const _a444 = v_R;
          for (let _i445 = 0; _i445 < _a444.length; _i445++) {
            const v_c = _a444[_i445];
            if (!((_eg437.of(opp(sp, v_c, _at426)) === v_R))) {
              _q442 = false;
              break Q443;
            }
          }
        }
        _c446 = _q442;
      }
      if (!(_c446)) {
        _q428 = false;
        break Q429;
      }
    }
    if (!(_q428)) return false;
  }
  return true;
}

export interface DotTileBinding {
  q: number;
}

const dotTileFacts: number[] = [];

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
          if (fire !== null && !fire({ c: v_c, N: v_N, q: v_q }, facts)) return 1;
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

export function soleOwner(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SoleOwnerBinding> | null): number {
  const _g193: number[] = [];
  const _g229: number[] = [];
  const facts = soleOwnerFacts;
  let fired = 0;
  let changed = false;
  _g193.length = 0;
  G194: {
    const _a197 = sp.edges;
    for (let _i198 = 0; _i198 < _a197.length; _i198++) {
      const v_e = _a197[_i198];
      const _h199 = (b.grid[v_e] || -1);
      if (!((_h199 !== 1))) continue;
      _g193.push(v_e);
    }
  }
  const v_O = _g193;
  const _eg204 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a200 = sp.cells;
  for (let _i201 = 0; _i201 < _a200.length; _i201++) {
    const v_c = _a200[_i201];
    let _c228: boolean = (b.markOf(v_c) === -1);
    if (_c228) {
      let _q202 = true;
      Q203: {
        const v_R = _eg204.of(v_c);
        let _q205 = false;
        Q206: {
          for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
            const _h226 = cl.dot.at[v_p];
            let _c212: boolean = (_eg204.of((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)) === v_R);
            if (_c212) {
              let _q207 = true;
              Q208: {
                const _a210 = sp.centerCells[cl.dot.at[v_p]];
                for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                  const v_c_209 = _a210[_i211];
                  if (!((_eg204.of(v_c_209) === v_R))) {
                    _q207 = false;
                    break Q208;
                  }
                }
              }
              _c212 = _q207;
            }
            let _c221: boolean = _c212;
            if (_c221) {
              let _q213 = true;
              Q214: {
                for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                  let _c220: boolean = (v_r === v_p);
                  if (!_c220) {
                    let _q215 = true;
                    Q216: {
                      const _a218 = sp.centerCells[cl.dot.at[v_r]];
                      for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                        const v_c_217 = _a218[_i219];
                        if (!(!(_eg204.of(v_c_217) === v_R))) {
                          _q215 = false;
                          break Q216;
                        }
                      }
                    }
                    _c220 = _q215;
                  }
                  if (!(_c220)) {
                    _q213 = false;
                    break Q214;
                  }
                }
              }
              _c221 = _q213;
            }
            let _c227: boolean = _c221;
            if (_c227) {
              let _q222 = true;
              Q223: {
                const _a224 = v_R;
                for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                  const v_y = _a224[_i225];
                  if (!((_eg204.of(opp(sp, v_y, _h226)) === v_R))) {
                    _q222 = false;
                    break Q223;
                  }
                }
              }
              _c227 = _q222;
            }
            if (_c227) {
              _q205 = true;
              break Q206;
            }
          }
        }
        if (!(_q205)) {
          _q202 = false;
          break Q203;
        }
      }
      _c228 = !(_q202);
    }
    if (!(_c228)) continue;
    _g229.length = 0;
    G230: {
      const _a256 = near(sp, cl, v_c);
      for (let _i257 = 0; _i257 < _a256.length; _i257++) {
        const v_q = _a256[_i257];
        const _t258 = opp(sp, v_c, cl.dot.at[v_q]);
        let _q259 = true;
        Q260: {
          const v_R = _eg204.of(_t258);
          let _q261 = false;
          Q262: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h280 = cl.dot.at[v_p];
              let _c267: boolean = (_eg204.of((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)) === v_R);
              if (_c267) {
                let _q263 = true;
                Q264: {
                  const _a265 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                    const v_c = _a265[_i266];
                    if (!((_eg204.of(v_c) === v_R))) {
                      _q263 = false;
                      break Q264;
                    }
                  }
                }
                _c267 = _q263;
              }
              let _c275: boolean = _c267;
              if (_c275) {
                let _q268 = true;
                Q269: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c274: boolean = (v_r === v_p);
                    if (!_c274) {
                      let _q270 = true;
                      Q271: {
                        const _a272 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i273 = 0; _i273 < _a272.length; _i273++) {
                          const v_c = _a272[_i273];
                          if (!(!(_eg204.of(v_c) === v_R))) {
                            _q270 = false;
                            break Q271;
                          }
                        }
                      }
                      _c274 = _q270;
                    }
                    if (!(_c274)) {
                      _q268 = false;
                      break Q269;
                    }
                  }
                }
                _c275 = _q268;
              }
              let _c281: boolean = _c275;
              if (_c281) {
                let _q276 = true;
                Q277: {
                  const _a278 = v_R;
                  for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                    const v_y = _a278[_i279];
                    if (!((_eg204.of(opp(sp, v_y, _h280)) === v_R))) {
                      _q276 = false;
                      break Q277;
                    }
                  }
                }
                _c281 = _q276;
              }
              if (_c281) {
                _q261 = true;
                break Q262;
              }
            }
          }
          if (!(_q261)) {
            _q259 = false;
            break Q260;
          }
        }
        if (!(!(_q259))) continue;
        _g229.push(v_q);
      }
    }
    L282: {
      const v_K = _g229;
      const _h283 = v_K.length;
      if (!((_h283 < 2))) break L282;
      facts.length = 0;
      changed = false;
      let _c292: boolean = (_h283 > 0);
      if (_c292) {
        let _q284 = true;
        Q285: {
          const _a286 = v_K;
          for (let _i287 = 0; _i287 < _a286.length; _i287++) {
            const v_q = _a286[_i287];
            let _mk288 = v_c >= 0;
            if (_mk288) { const _was = b.markOf(v_c); if (_was >= 0) _mk288 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c291: boolean = _mk288;
            if (_c291) {
              const _t289 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk290 = _t289 >= 0;
              if (_mk290) { const _was = b.markOf(_t289); if (_was >= 0) _mk290 = _was === v_q; else if (fire === null) { b.markAt(_t289, v_q); changed = true; } else facts.push(MARK, _t289, v_q); }
              _c291 = _mk290;
            }
            if (!(_c291)) {
              _q284 = false;
              break Q285;
            }
          }
        }
        _c292 = _q284;
      }
      if (!(_c292)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ O: v_O, c: v_c, K: v_K }, facts)) return 1;
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

export function onlyReach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyReachBinding> | null): number {
  const _g320: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _a318 = sp.cells;
  for (let _i319 = 0; _i319 < _a318.length; _i319++) {
    const v_c = _a318[_i319];
    if (!((b.markOf(v_c) === -1))) continue;
    _g320.length = 0;
    G321: {
      const _a324 = near(sp, cl, v_c);
      for (let _i325 = 0; _i325 < _a324.length; _i325++) {
        const v_q = _a324[_i325];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g320.push(v_q);
      }
    }
    L326: {
      const v_K = _g320;
      const _h327 = v_K.length;
      if (!((_h327 < 2))) break L326;
      facts.length = 0;
      changed = false;
      let _c336: boolean = (_h327 > 0);
      if (_c336) {
        let _q328 = true;
        Q329: {
          const _a330 = v_K;
          for (let _i331 = 0; _i331 < _a330.length; _i331++) {
            const v_q = _a330[_i331];
            let _mk332 = v_c >= 0;
            if (_mk332) { const _was = b.markOf(v_c); if (_was >= 0) _mk332 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c335: boolean = _mk332;
            if (_c335) {
              const _t333 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk334 = _t333 >= 0;
              if (_mk334) { const _was = b.markOf(_t333); if (_was >= 0) _mk334 = _was === v_q; else if (fire === null) { b.markAt(_t333, v_q); changed = true; } else facts.push(MARK, _t333, v_q); }
              _c335 = _mk334;
            }
            if (!(_c335)) {
              _q328 = false;
              break Q329;
            }
          }
        }
        _c336 = _q328;
      }
      if (!(_c336)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, K: v_K }, facts)) return 1;
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

export function exclave(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExclaveBinding> | null): number {
  const _g358: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a353 = sp.cells;
  for (let _i354 = 0; _i354 < _a353.length; _i354++) {
    const v_c = _a353[_i354];
    L355: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L355;
      const _h376 = cl.dot.at[v_q];
      L357: {
        const v_G = throughWhere(sp, v_c, (_te356: number): boolean => {  return ((((b.grid[_te356] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te356]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te356 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L357;
        _g358.length = 0;
        G359: {
          const _a364 = v_G;
          for (let _i365 = 0; _i365 < _a364.length; _i365++) {
            const v_x = _a364[_i365];
            const _a366 = sp.adj4[v_x];
            for (let _i367 = 0; _i367 < _a366.length; _i367++) {
              const v_n = _a366[_i367];
              const _h368 = (b.grid[sp.adj4Edges[v_x][_i367]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h368 !== 1)))) continue;
              if (!_g358.includes(v_n)) _g358.push(v_n);
            }
          }
        }
        L369: {
          const v_L = _g358;
          const _h370 = v_L.length;
          if (!((_h370 < 2))) break L369;
          facts.length = 0;
          changed = false;
          let _c380: boolean = (_h370 > 0);
          if (_c380) {
            let _q371 = true;
            Q372: {
              const _a373 = v_L;
              for (let _i374 = 0; _i374 < _a373.length; _i374++) {
                const v_l = _a373[_i374];
                let _mk375 = v_l >= 0;
                if (_mk375) { const _was = b.markOf(v_l); if (_was >= 0) _mk375 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c379: boolean = _mk375;
                if (_c379) {
                  const _t377 = opp(sp, v_l, _h376);
                  let _mk378 = _t377 >= 0;
                  if (_mk378) { const _was = b.markOf(_t377); if (_was >= 0) _mk378 = _was === v_q; else if (fire === null) { b.markAt(_t377, v_q); changed = true; } else facts.push(MARK, _t377, v_q); }
                  _c379 = _mk378;
                }
                if (!(_c379)) {
                  _q371 = false;
                  break Q372;
                }
              }
            }
            _c380 = _q371;
          }
          if (!(_c380)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, q: v_q, G: v_G, L: v_L }, facts)) return 1;
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

export function mirrorWall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MirrorWallBinding> | null): number {
  const facts = mirrorWallFacts;
  let fired = 0;
  let changed = false;
  const _a388 = sp.edges;
  for (let _i389 = 0; _i389 < _a388.length; _i389++) {
    const v_e = _a388[_i389];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _a390 = setOf(sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]);
    for (let _i391 = 0; _i391 < _a390.length; _i391++) {
      const v_a = _a390[_i391];
      L392: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L392;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L393: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L393;
          L394: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L394;
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

const roomKept = keptStore<readonly number[]>();

/** `room(q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function room(sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = roomKept.board(cl);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _made = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te108: number): boolean => { const _t109 = sp.edgeEnds[2 * _te108]; let _c116: boolean = (opp(sp, _t109, cl.dot.at[v_q]) !== -1); if (_c116) {   let _q110 = true;   Q111: {     const _g112: number[] = [];     G113: {       for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {         if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t109)))) continue;         _g112.push(v_p);       }     }     const _a114 = _g112;     for (let _i115 = 0; _i115 < _a114.length; _i115++) {       const v_p = _a114[_i115];       if (!((v_p === v_q))) {         _q110 = false;         break Q111;       }     }   }   _c116 = _q110; } let _c124: boolean = _c116; if (_c124) {   let _q117 = true;   Q118: {     const _t119 = opp(sp, _t109, cl.dot.at[v_q]);     const _g120: number[] = [];     G121: {       for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {         if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t119)))) continue;         _g120.push(v_p);       }     }     const _a122 = _g120;     for (let _i123 = 0; _i123 < _a122.length; _i123++) {       const v_p = _a122[_i123];       if (!((v_p === v_q))) {         _q117 = false;         break Q118;       }     }   }   _c124 = _q117; } let _c141: boolean = _c124; if (_c141) {   const _t125 = sp.edgeEnds[2 * _te108 + 1];   let _c132: boolean = (opp(sp, _t125, cl.dot.at[v_q]) !== -1);   if (_c132) {     let _q126 = true;     Q127: {       const _g128: number[] = [];       G129: {         for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {           if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t125)))) continue;           _g128.push(v_p);         }       }       const _a130 = _g128;       for (let _i131 = 0; _i131 < _a130.length; _i131++) {         const v_p = _a130[_i131];         if (!((v_p === v_q))) {           _q126 = false;           break Q127;         }       }     }     _c132 = _q126;   }   let _c140: boolean = _c132;   if (_c140) {     let _q133 = true;     Q134: {       const _t135 = opp(sp, _t125, cl.dot.at[v_q]);       const _g136: number[] = [];       G137: {         for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {           if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t135)))) continue;           _g136.push(v_p);         }       }       const _a138 = _g136;       for (let _i139 = 0; _i139 < _a138.length; _i139++) {         const v_p = _a138[_i139];         if (!((v_p === v_q))) {           _q133 = false;           break Q134;         }       }     }     _c140 = _q133;   }   _c141 = _c140; } return _c141; });
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
  const _g299: number[] = [];
  G300: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te308: number): boolean => { let _c310: boolean = ((b.grid[_te308] || -1) !== 1); if (_c310) {   const _t309 = sp.edgeEnds[2 * _te308];   _c310 = (((opp(sp, _t309, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t309) === -1) || (b.markOf(_t309) === v_q))) && ((b.markOf(opp(sp, _t309, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t309, cl.dot.at[v_q])) === v_q))); } let _c312: boolean = _c310; if (_c312) {   const _t311 = sp.edgeEnds[2 * _te308 + 1];   _c312 = (((opp(sp, _t311, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t311) === -1) || (b.markOf(_t311) === v_q))) && ((b.markOf(opp(sp, _t311, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t311, cl.dot.at[v_q])) === v_q))); } return _c312; });
    const _a313 = v_T;
    for (let _i314 = 0; _i314 < _a313.length; _i314++) {
      const v_x = _a313[_i314];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g299.includes(v_x)) _g299.push(v_x);
    }
  }
  const _made = _g299;
  _kept[v_q] = _made;
  return _made;
}
