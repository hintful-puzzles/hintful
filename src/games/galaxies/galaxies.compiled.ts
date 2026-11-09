// Compiled by `npm run describe` from src/games/galaxies/galaxies.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, addOnce, clueAt, edgeGroups, keptEdgeGroups, keptStore, opp, rangeMask, sameSet, stamps, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g389: number[] = [];
  const _g402: number[] = [];
  const _g422: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q387 = true;
  Q388: {
    _g389.length = 0;
    G390: {
      const _a393 = sp.edges;
      for (let _i394 = 0; _i394 < _a393.length; _i394++) {
        const v_e = _a393[_i394];
        const _h395 = (g[v_e] || -1);
        if (!((_h395 === 2))) continue;
        _g389.push(v_e);
      }
    }
    const v_O = _g389;
    const _eg399 = edgeGroups(sp, v_O);
    const _a396 = sp.edges;
    for (let _i397 = 0; _i397 < _a396.length; _i397++) {
      const v_e = _a396[_i397];
      const _h398 = (g[v_e] || -1);
      if (!(((_h398 === 1) === !(_eg399.of(sp.edgeEnds[2 * v_e + 1]) === _eg399.of(sp.edgeEnds[2 * v_e]))))) {
        _q387 = false;
        break Q388;
      }
    }
  }
  if (!(_q387)) return false;
  let _q400 = true;
  Q401: {
    _g402.length = 0;
    G403: {
      const _a406 = sp.edges;
      for (let _i407 = 0; _i407 < _a406.length; _i407++) {
        const v_e = _a406[_i407];
        const _h408 = (g[v_e] || -1);
        if (!((_h408 === 2))) continue;
        _g402.push(v_e);
      }
    }
    const v_O = _g402;
    const _eg416 = edgeGroups(sp, v_O);
    const _a409 = sp.cells;
    for (let _i410 = 0; _i410 < _a409.length; _i410++) {
      const v_c = _a409[_i410];
      let _g411 = 0;
      G412: {
        const _a413 = sp.centers;
        for (let _i414 = 0; _i414 < _a413.length; _i414++) {
          const v_p = _a413[_i414];
          const _h415 = clueAt(cl.dot, v_p);
          if (!(((_h415 !== -1) && (_eg416.of((sp.centerCells[v_p][0] ?? -1)) === _eg416.of(v_c))))) continue;
          _g411++;
        }
      }
      if (!((_g411 === 1))) {
        _q400 = false;
        break Q401;
      }
    }
  }
  if (!(_q400)) return false;
  for (let _k417 = 0; _k417 < cl.dot.at.length; _k417++) {
    const _at418 = cl.dot.at[_k417];
    let _q420 = true;
    Q421: {
      _g422.length = 0;
      G423: {
        const _a426 = sp.edges;
        for (let _i427 = 0; _i427 < _a426.length; _i427++) {
          const v_e = _a426[_i427];
          const _h428 = (g[v_e] || -1);
          if (!((_h428 === 2))) continue;
          _g422.push(v_e);
        }
      }
      const v_O = _g422;
      const _eg429 = edgeGroups(sp, v_O);
      const v_R = _eg429.of((sp.centerCells[_at418][0] ?? -1));
      let _q430 = true;
      Q431: {
        const _a432 = sp.centerCells[_at418];
        for (let _i433 = 0; _i433 < _a432.length; _i433++) {
          const v_c = _a432[_i433];
          if (!((_eg429.of(v_c) === v_R))) {
            _q430 = false;
            break Q431;
          }
        }
      }
      let _c438: boolean = _q430;
      if (_c438) {
        let _q434 = true;
        Q435: {
          const _a436 = v_R;
          for (let _i437 = 0; _i437 < _a436.length; _i437++) {
            const v_c = _a436[_i437];
            if (!((_eg429.of(opp(sp, v_c, _at418)) === v_R))) {
              _q434 = false;
              break Q435;
            }
          }
        }
        _c438 = _q434;
      }
      if (!(_c438)) {
        _q420 = false;
        break Q421;
      }
    }
    if (!(_q420)) return false;
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
  const _g265: number[] = [];
  const facts = soleOwnerFacts;
  let fired = 0;
  let changed = false;
  const _k236 = nearKept.board(cl);
  const _m70_0 = b.made[0];
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
  const _m73_1 = b.made[1];
  const _m73_3 = b.made[3];
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
      if (b.made[0] !== _m70_0 || b.made[1] !== _m73_1 || b.made[3] !== _m73_3) {
        _g265.length = 0;
        G266: {
          const _a269 = sp.edges;
          for (let _i270 = 0; _i270 < _a269.length; _i270++) {
            const v_e = _a269[_i270];
            if (!(((b.grid[v_e] || -1) !== 1))) continue;
            _g265.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g265))) { return fired; }
      }
      facts.length = 0;
      changed = false;
      let _c279: boolean = (_h264 > 0);
      if (_c279) {
        let _q271 = true;
        Q272: {
          const _a273 = v_K;
          for (let _i274 = 0; _i274 < _a273.length; _i274++) {
            const v_q = _a273[_i274];
            let _mk275 = v_c >= 0;
            if (_mk275) { const _was = b.markOf(v_c); if (_was >= 0) _mk275 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c278: boolean = _mk275;
            if (_c278) {
              const _t276 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk277 = _t276 >= 0;
              if (_mk277) { const _was = b.markOf(_t276); if (_was >= 0) _mk277 = _was === v_q; else if (fire === null) { b.markAt(_t276, v_q); changed = true; } else facts.push(MARK, _t276, v_q); }
              _c278 = _mk277;
            }
            if (!(_c278)) {
              _q271 = false;
              break Q272;
            }
          }
        }
        _c279 = _q271;
      }
      if (!(_c279)) return -1;
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
  const _g307: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _k311 = nearKept.board(cl);
  const _a305 = sp.cells;
  for (let _i306 = 0; _i306 < _a305.length; _i306++) {
    const v_c = _a305[_i306];
    if (!((b.markOf(v_c) === -1))) continue;
    _g307.length = 0;
    G308: {
      const _a312 = (_k311[v_c] ?? near(sp, cl, v_c));
      for (let _i313 = 0; _i313 < _a312.length; _i313++) {
        const v_q = _a312[_i313];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g307.push(v_q);
      }
    }
    L314: {
      const v_K = _g307;
      const _h315 = v_K.length;
      if (!((_h315 < 2))) break L314;
      facts.length = 0;
      changed = false;
      let _c324: boolean = (_h315 > 0);
      if (_c324) {
        let _q316 = true;
        Q317: {
          const _a318 = v_K;
          for (let _i319 = 0; _i319 < _a318.length; _i319++) {
            const v_q = _a318[_i319];
            let _mk320 = v_c >= 0;
            if (_mk320) { const _was = b.markOf(v_c); if (_was >= 0) _mk320 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c323: boolean = _mk320;
            if (_c323) {
              const _t321 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk322 = _t321 >= 0;
              if (_mk322) { const _was = b.markOf(_t321); if (_was >= 0) _mk322 = _was === v_q; else if (fire === null) { b.markAt(_t321, v_q); changed = true; } else facts.push(MARK, _t321, v_q); }
              _c323 = _mk322;
            }
            if (!(_c323)) {
              _q316 = false;
              break Q317;
            }
          }
        }
        _c324 = _q316;
      }
      if (!(_c324)) return -1;
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
const _st352 = stamps();

/** Its dearest read grows with the board as n^2. */
export function exclave(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExclaveBinding> | null): number {
  const _g346: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a341 = sp.cells;
  for (let _i342 = 0; _i342 < _a341.length; _i342++) {
    const v_c = _a341[_i342];
    L343: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L343;
      const _h366 = cl.dot.at[v_q];
      L345: {
        const v_G = throughWhere(sp, v_c, (_te344: number): boolean => {  return ((((b.grid[_te344] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te344]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te344 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L345;
        _g346.length = 0;
        _st352.pass++;
        G347: {
          const _a353 = v_G;
          for (let _i354 = 0; _i354 < _a353.length; _i354++) {
            const v_x = _a353[_i354];
            const _a355 = sp.adj4[v_x];
            for (let _i356 = 0; _i356 < _a355.length; _i356++) {
              const v_n = _a355[_i356];
              const _h357 = (b.grid[sp.adj4Edges[v_x][_i356]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h357 !== 1)))) continue;
              const _t358 = v_n;
              if (_g346.length < 16) { if (!_g346.includes(_t358)) _g346.push(_t358); } else addOnce(_g346, _st352, _t358);
            }
          }
        }
        L359: {
          const v_L = _g346;
          const _h360 = v_L.length;
          if (!((_h360 < 2))) break L359;
          facts.length = 0;
          changed = false;
          let _c370: boolean = (_h360 > 0);
          if (_c370) {
            let _q361 = true;
            Q362: {
              const _a363 = v_L;
              for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                const v_l = _a363[_i364];
                let _mk365 = v_l >= 0;
                if (_mk365) { const _was = b.markOf(v_l); if (_was >= 0) _mk365 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c369: boolean = _mk365;
                if (_c369) {
                  const _t367 = opp(sp, v_l, _h366);
                  let _mk368 = _t367 >= 0;
                  if (_mk368) { const _was = b.markOf(_t367); if (_was >= 0) _mk368 = _was === v_q; else if (fire === null) { b.markAt(_t367, v_q); changed = true; } else facts.push(MARK, _t367, v_q); }
                  _c369 = _mk368;
                }
                if (!(_c369)) {
                  _q361 = false;
                  break Q362;
                }
              }
            }
            _c370 = _q361;
          }
          if (!(_c370)) return -1;
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
  const _a379 = sp.edges;
  R1:
  for (let _i380 = 0; _i380 < _a379.length; _i380++) {
    const v_e = _a379[_i380];
    const _m146_0 = b.made[0];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _t381 = sp.edgeEnds[2 * v_e];
    const _t382 = sp.edgeEnds[2 * v_e + 1];
    for (let _i383 = 0; _i383 < 2; _i383++) {
      const v_a = _i383 === 0 ? _t381 : _t382;
      if (_i383 === 1 && (v_a === _t381)) continue;
      L384: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L384;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L385: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L385;
          L386: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L386;
            if (b.made[0] !== _m146_0) {
              if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
            }
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
  const _g286: number[] = [];
  G287: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te295: number): boolean => { let _c297: boolean = ((b.grid[_te295] || -1) !== 1); if (_c297) {   const _t296 = sp.edgeEnds[2 * _te295];   _c297 = (((opp(sp, _t296, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t296) === -1) || (b.markOf(_t296) === v_q))) && ((b.markOf(opp(sp, _t296, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t296, cl.dot.at[v_q])) === v_q))); } let _c299: boolean = _c297; if (_c299) {   const _t298 = sp.edgeEnds[2 * _te295 + 1];   _c299 = (((opp(sp, _t298, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t298) === -1) || (b.markOf(_t298) === v_q))) && ((b.markOf(opp(sp, _t298, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t298, cl.dot.at[v_q])) === v_q))); } return _c299; });
    const _a300 = v_T;
    for (let _i301 = 0; _i301 < _a300.length; _i301++) {
      const v_x = _a300[_i301];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g286.includes(v_x)) _g286.push(v_x);
    }
  }
  const _made = _g286;
  _kept[v_q] = _made;
  return _made;
}
