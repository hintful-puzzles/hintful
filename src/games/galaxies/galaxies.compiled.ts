// Compiled by `npm run describe` from src/games/galaxies/galaxies.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, clueAt, edgeGroups, keptStore, opp, rangeMask, setOf, through, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g464: number[] = [];
  const _g477: number[] = [];
  const _g497: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q462 = true;
  Q463: {
    _g464.length = 0;
    G465: {
      const _a468 = sp.edges;
      for (let _i469 = 0; _i469 < _a468.length; _i469++) {
        const v_e = _a468[_i469];
        const _h470 = (g[v_e] || -1);
        if (!((_h470 === 2))) continue;
        _g464.push(v_e);
      }
    }
    const v_O = _g464;
    const _eg474 = edgeGroups(sp, v_O);
    const _a471 = sp.edges;
    for (let _i472 = 0; _i472 < _a471.length; _i472++) {
      const v_e = _a471[_i472];
      const _h473 = (g[v_e] || -1);
      if (!(((_h473 === 1) === !(_eg474.of(sp.edgeEnds[2 * v_e + 1]) === _eg474.of(sp.edgeEnds[2 * v_e]))))) {
        _q462 = false;
        break Q463;
      }
    }
  }
  if (!(_q462)) return false;
  let _q475 = true;
  Q476: {
    _g477.length = 0;
    G478: {
      const _a481 = sp.edges;
      for (let _i482 = 0; _i482 < _a481.length; _i482++) {
        const v_e = _a481[_i482];
        const _h483 = (g[v_e] || -1);
        if (!((_h483 === 2))) continue;
        _g477.push(v_e);
      }
    }
    const v_O = _g477;
    const _eg491 = edgeGroups(sp, v_O);
    const _a484 = sp.cells;
    for (let _i485 = 0; _i485 < _a484.length; _i485++) {
      const v_c = _a484[_i485];
      let _g486 = 0;
      G487: {
        const _a488 = sp.centers;
        for (let _i489 = 0; _i489 < _a488.length; _i489++) {
          const v_p = _a488[_i489];
          const _h490 = clueAt(cl.dot, v_p);
          if (!(((_h490 !== -1) && (_eg491.of((sp.centerCells[v_p][0] ?? -1)) === _eg491.of(v_c))))) continue;
          _g486++;
        }
      }
      if (!((_g486 === 1))) {
        _q475 = false;
        break Q476;
      }
    }
  }
  if (!(_q475)) return false;
  for (let _k492 = 0; _k492 < cl.dot.at.length; _k492++) {
    const _at493 = cl.dot.at[_k492];
    let _q495 = true;
    Q496: {
      _g497.length = 0;
      G498: {
        const _a501 = sp.edges;
        for (let _i502 = 0; _i502 < _a501.length; _i502++) {
          const v_e = _a501[_i502];
          const _h503 = (g[v_e] || -1);
          if (!((_h503 === 2))) continue;
          _g497.push(v_e);
        }
      }
      const v_O = _g497;
      const _eg504 = edgeGroups(sp, v_O);
      const v_R = _eg504.of((sp.centerCells[_at493][0] ?? -1));
      let _q505 = true;
      Q506: {
        const _a507 = sp.centerCells[_at493];
        for (let _i508 = 0; _i508 < _a507.length; _i508++) {
          const v_c = _a507[_i508];
          if (!((_eg504.of(v_c) === v_R))) {
            _q505 = false;
            break Q506;
          }
        }
      }
      let _c513: boolean = _q505;
      if (_c513) {
        let _q509 = true;
        Q510: {
          const _a511 = v_R;
          for (let _i512 = 0; _i512 < _a511.length; _i512++) {
            const v_c = _a511[_i512];
            if (!((_eg504.of(opp(sp, v_c, _at493)) === v_R))) {
              _q509 = false;
              break Q510;
            }
          }
        }
        _c513 = _q509;
      }
      if (!(_c513)) {
        _q495 = false;
        break Q496;
      }
    }
    if (!(_q495)) return false;
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
    const _h19 = b.value(v_e);
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
    if (!(!(b.known(v_e)))) continue;
    L27: {
      const v_p = b.markOf(sp.edgeEnds[2 * v_e]);
      if (!((v_p !== -1))) break L27;
      L28: {
        const v_q = b.markOf(sp.edgeEnds[2 * v_e + 1]);
        if (!(((v_q !== -1) && (v_q !== v_p)))) break L28;
        facts.length = 0;
        changed = false;
        if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
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
        const _h55 = b.value(sp.edgeOf(v_c, v_n));
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
  const _g231: number[] = [];
  const _g267: number[] = [];
  const facts = soleOwnerFacts;
  let fired = 0;
  let changed = false;
  _g231.length = 0;
  G232: {
    const _a235 = sp.edges;
    for (let _i236 = 0; _i236 < _a235.length; _i236++) {
      const v_e = _a235[_i236];
      const _h237 = b.value(v_e);
      if (!((_h237 !== 1))) continue;
      _g231.push(v_e);
    }
  }
  const v_O = _g231;
  const _eg242 = edgeGroups(sp, v_O);
  const _a238 = sp.cells;
  for (let _i239 = 0; _i239 < _a238.length; _i239++) {
    const v_c = _a238[_i239];
    let _c266: boolean = (b.markOf(v_c) === -1);
    if (_c266) {
      let _q240 = true;
      Q241: {
        const v_R = _eg242.of(v_c);
        let _q243 = false;
        Q244: {
          for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
            const _h264 = cl.dot.at[v_p];
            let _c250: boolean = (_eg242.of((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)) === v_R);
            if (_c250) {
              let _q245 = true;
              Q246: {
                const _a248 = sp.centerCells[cl.dot.at[v_p]];
                for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                  const v_c_247 = _a248[_i249];
                  if (!((_eg242.of(v_c_247) === v_R))) {
                    _q245 = false;
                    break Q246;
                  }
                }
              }
              _c250 = _q245;
            }
            let _c259: boolean = _c250;
            if (_c259) {
              let _q251 = true;
              Q252: {
                for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                  let _c258: boolean = (v_r === v_p);
                  if (!_c258) {
                    let _q253 = true;
                    Q254: {
                      const _a256 = sp.centerCells[cl.dot.at[v_r]];
                      for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                        const v_c_255 = _a256[_i257];
                        if (!(!(_eg242.of(v_c_255) === v_R))) {
                          _q253 = false;
                          break Q254;
                        }
                      }
                    }
                    _c258 = _q253;
                  }
                  if (!(_c258)) {
                    _q251 = false;
                    break Q252;
                  }
                }
              }
              _c259 = _q251;
            }
            let _c265: boolean = _c259;
            if (_c265) {
              let _q260 = true;
              Q261: {
                const _a262 = v_R;
                for (let _i263 = 0; _i263 < _a262.length; _i263++) {
                  const v_y = _a262[_i263];
                  if (!((_eg242.of(opp(sp, v_y, _h264)) === v_R))) {
                    _q260 = false;
                    break Q261;
                  }
                }
              }
              _c265 = _q260;
            }
            if (_c265) {
              _q243 = true;
              break Q244;
            }
          }
        }
        if (!(_q243)) {
          _q240 = false;
          break Q241;
        }
      }
      _c266 = !(_q240);
    }
    if (!(_c266)) continue;
    _g267.length = 0;
    G268: {
      const _a294 = near(sp, cl, v_c);
      for (let _i295 = 0; _i295 < _a294.length; _i295++) {
        const v_q = _a294[_i295];
        const _t296 = opp(sp, v_c, cl.dot.at[v_q]);
        let _q297 = true;
        Q298: {
          const v_R = _eg242.of(_t296);
          let _q299 = false;
          Q300: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h318 = cl.dot.at[v_p];
              let _c305: boolean = (_eg242.of((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)) === v_R);
              if (_c305) {
                let _q301 = true;
                Q302: {
                  const _a303 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i304 = 0; _i304 < _a303.length; _i304++) {
                    const v_c = _a303[_i304];
                    if (!((_eg242.of(v_c) === v_R))) {
                      _q301 = false;
                      break Q302;
                    }
                  }
                }
                _c305 = _q301;
              }
              let _c313: boolean = _c305;
              if (_c313) {
                let _q306 = true;
                Q307: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c312: boolean = (v_r === v_p);
                    if (!_c312) {
                      let _q308 = true;
                      Q309: {
                        const _a310 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i311 = 0; _i311 < _a310.length; _i311++) {
                          const v_c = _a310[_i311];
                          if (!(!(_eg242.of(v_c) === v_R))) {
                            _q308 = false;
                            break Q309;
                          }
                        }
                      }
                      _c312 = _q308;
                    }
                    if (!(_c312)) {
                      _q306 = false;
                      break Q307;
                    }
                  }
                }
                _c313 = _q306;
              }
              let _c319: boolean = _c313;
              if (_c319) {
                let _q314 = true;
                Q315: {
                  const _a316 = v_R;
                  for (let _i317 = 0; _i317 < _a316.length; _i317++) {
                    const v_y = _a316[_i317];
                    if (!((_eg242.of(opp(sp, v_y, _h318)) === v_R))) {
                      _q314 = false;
                      break Q315;
                    }
                  }
                }
                _c319 = _q314;
              }
              if (_c319) {
                _q299 = true;
                break Q300;
              }
            }
          }
          if (!(_q299)) {
            _q297 = false;
            break Q298;
          }
        }
        if (!(!(_q297))) continue;
        _g267.push(v_q);
      }
    }
    L320: {
      const v_K = _g267;
      const _h321 = v_K.length;
      if (!((_h321 < 2))) break L320;
      facts.length = 0;
      changed = false;
      let _c330: boolean = (_h321 > 0);
      if (_c330) {
        let _q322 = true;
        Q323: {
          const _a324 = v_K;
          for (let _i325 = 0; _i325 < _a324.length; _i325++) {
            const v_q = _a324[_i325];
            let _mk326 = v_c >= 0;
            if (_mk326) { const _was = b.markOf(v_c); if (_was >= 0) _mk326 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c329: boolean = _mk326;
            if (_c329) {
              const _t327 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk328 = _t327 >= 0;
              if (_mk328) { const _was = b.markOf(_t327); if (_was >= 0) _mk328 = _was === v_q; else if (fire === null) { b.markAt(_t327, v_q); changed = true; } else facts.push(MARK, _t327, v_q); }
              _c329 = _mk328;
            }
            if (!(_c329)) {
              _q322 = false;
              break Q323;
            }
          }
        }
        _c330 = _q322;
      }
      if (!(_c330)) return -1;
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
  const _g376: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _a374 = sp.cells;
  for (let _i375 = 0; _i375 < _a374.length; _i375++) {
    const v_c = _a374[_i375];
    if (!((b.markOf(v_c) === -1))) continue;
    _g376.length = 0;
    G377: {
      const _a380 = near(sp, cl, v_c);
      for (let _i381 = 0; _i381 < _a380.length; _i381++) {
        const v_q = _a380[_i381];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g376.push(v_q);
      }
    }
    L382: {
      const v_K = _g376;
      const _h383 = v_K.length;
      if (!((_h383 < 2))) break L382;
      facts.length = 0;
      changed = false;
      let _c392: boolean = (_h383 > 0);
      if (_c392) {
        let _q384 = true;
        Q385: {
          const _a386 = v_K;
          for (let _i387 = 0; _i387 < _a386.length; _i387++) {
            const v_q = _a386[_i387];
            let _mk388 = v_c >= 0;
            if (_mk388) { const _was = b.markOf(v_c); if (_was >= 0) _mk388 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c391: boolean = _mk388;
            if (_c391) {
              const _t389 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk390 = _t389 >= 0;
              if (_mk390) { const _was = b.markOf(_t389); if (_was >= 0) _mk390 = _was === v_q; else if (fire === null) { b.markAt(_t389, v_q); changed = true; } else facts.push(MARK, _t389, v_q); }
              _c391 = _mk390;
            }
            if (!(_c391)) {
              _q384 = false;
              break Q385;
            }
          }
        }
        _c392 = _q384;
      }
      if (!(_c392)) return -1;
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
  const _g417: number[] = [];
  const _g425: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a414 = sp.cells;
  for (let _i415 = 0; _i415 < _a414.length; _i415++) {
    const v_c = _a414[_i415];
    L416: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L416;
      const _h443 = cl.dot.at[v_q];
      _g417.length = 0;
      G418: {
        const _a421 = sp.edges;
        for (let _i422 = 0; _i422 < _a421.length; _i422++) {
          const v_e = _a421[_i422];
          const _h423 = b.value(v_e);
          if (!((((_h423 !== 1) && (b.markOf(sp.edgeEnds[2 * v_e]) === v_q)) && (b.markOf(sp.edgeEnds[2 * v_e + 1]) === v_q)))) continue;
          _g417.push(v_e);
        }
      }
      L424: {
        const v_G = through(sp, v_c, _g417);
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L424;
        _g425.length = 0;
        G426: {
          const _a431 = v_G;
          for (let _i432 = 0; _i432 < _a431.length; _i432++) {
            const v_x = _a431[_i432];
            const _a433 = sp.adj4[v_x];
            for (let _i434 = 0; _i434 < _a433.length; _i434++) {
              const v_n = _a433[_i434];
              const _h435 = b.value(sp.edgeOf(v_x, v_n));
              if (!(((b.markOf(v_n) === -1) && (_h435 !== 1)))) continue;
              if (!_g425.includes(v_n)) _g425.push(v_n);
            }
          }
        }
        L436: {
          const v_L = _g425;
          const _h437 = v_L.length;
          if (!((_h437 < 2))) break L436;
          facts.length = 0;
          changed = false;
          let _c447: boolean = (_h437 > 0);
          if (_c447) {
            let _q438 = true;
            Q439: {
              const _a440 = v_L;
              for (let _i441 = 0; _i441 < _a440.length; _i441++) {
                const v_l = _a440[_i441];
                let _mk442 = v_l >= 0;
                if (_mk442) { const _was = b.markOf(v_l); if (_was >= 0) _mk442 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c446: boolean = _mk442;
                if (_c446) {
                  const _t444 = opp(sp, v_l, _h443);
                  let _mk445 = _t444 >= 0;
                  if (_mk445) { const _was = b.markOf(_t444); if (_was >= 0) _mk445 = _was === v_q; else if (fire === null) { b.markAt(_t444, v_q); changed = true; } else facts.push(MARK, _t444, v_q); }
                  _c446 = _mk445;
                }
                if (!(_c446)) {
                  _q438 = false;
                  break Q439;
                }
              }
            }
            _c447 = _q438;
          }
          if (!(_c447)) return -1;
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
  const _a455 = sp.edges;
  for (let _i456 = 0; _i456 < _a455.length; _i456++) {
    const v_e = _a455[_i456];
    if (!(!(b.known(v_e)))) continue;
    const _a457 = setOf(sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]);
    for (let _i458 = 0; _i458 < _a457.length; _i458++) {
      const v_a = _a457[_i458];
      L459: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L459;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L460: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L460;
          L461: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || (b.value(sp.edgeOf(v_a2, v_b2)) === 1)))) break L461;
            facts.length = 0;
            changed = false;
            if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
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
  const _g108: number[] = [];
  G109: {
    const _a145 = sp.edges;
    for (let _i146 = 0; _i146 < _a145.length; _i146++) {
      const v_e = _a145[_i146];
      const _t147 = sp.edgeEnds[2 * v_e];
      let _c154: boolean = (opp(sp, _t147, cl.dot.at[v_q]) !== -1);
      if (_c154) {
        let _q148 = true;
        Q149: {
          const _g150: number[] = [];
          G151: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t147)))) continue;
              _g150.push(v_p);
            }
          }
          const _a152 = _g150;
          for (let _i153 = 0; _i153 < _a152.length; _i153++) {
            const v_p = _a152[_i153];
            if (!((v_p === v_q))) {
              _q148 = false;
              break Q149;
            }
          }
        }
        _c154 = _q148;
      }
      let _c162: boolean = _c154;
      if (_c162) {
        let _q155 = true;
        Q156: {
          const _t157 = opp(sp, _t147, cl.dot.at[v_q]);
          const _g158: number[] = [];
          G159: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t157)))) continue;
              _g158.push(v_p);
            }
          }
          const _a160 = _g158;
          for (let _i161 = 0; _i161 < _a160.length; _i161++) {
            const v_p = _a160[_i161];
            if (!((v_p === v_q))) {
              _q155 = false;
              break Q156;
            }
          }
        }
        _c162 = _q155;
      }
      let _c179: boolean = _c162;
      if (_c179) {
        const _t163 = sp.edgeEnds[2 * v_e + 1];
        let _c170: boolean = (opp(sp, _t163, cl.dot.at[v_q]) !== -1);
        if (_c170) {
          let _q164 = true;
          Q165: {
            const _g166: number[] = [];
            G167: {
              for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t163)))) continue;
                _g166.push(v_p);
              }
            }
            const _a168 = _g166;
            for (let _i169 = 0; _i169 < _a168.length; _i169++) {
              const v_p = _a168[_i169];
              if (!((v_p === v_q))) {
                _q164 = false;
                break Q165;
              }
            }
          }
          _c170 = _q164;
        }
        let _c178: boolean = _c170;
        if (_c178) {
          let _q171 = true;
          Q172: {
            const _t173 = opp(sp, _t163, cl.dot.at[v_q]);
            const _g174: number[] = [];
            G175: {
              for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                if (!((sp.centerCells[cl.dot.at[v_p]].includes(_t173)))) continue;
                _g174.push(v_p);
              }
            }
            const _a176 = _g174;
            for (let _i177 = 0; _i177 < _a176.length; _i177++) {
              const v_p = _a176[_i177];
              if (!((v_p === v_q))) {
                _q171 = false;
                break Q172;
              }
            }
          }
          _c178 = _q171;
        }
        _c179 = _c178;
      }
      if (!(_c179)) continue;
      _g108.push(v_e);
    }
  }
  const _made = through(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), _g108);
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

const reachKept = keptStore<readonly number[]>();

/** `reach(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = reachKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g337: number[] = [];
  G338: {
    const _g355: number[] = [];
    G356: {
      const _a363 = sp.edges;
      for (let _i364 = 0; _i364 < _a363.length; _i364++) {
        const v_e = _a363[_i364];
        let _c366: boolean = (b.value(v_e) !== 1);
        if (_c366) {
          const _t365 = sp.edgeEnds[2 * v_e];
          _c366 = (((opp(sp, _t365, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t365) === -1) || (b.markOf(_t365) === v_q))) && ((b.markOf(opp(sp, _t365, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t365, cl.dot.at[v_q])) === v_q)));
        }
        let _c368: boolean = _c366;
        if (_c368) {
          const _t367 = sp.edgeEnds[2 * v_e + 1];
          _c368 = (((opp(sp, _t367, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t367) === -1) || (b.markOf(_t367) === v_q))) && ((b.markOf(opp(sp, _t367, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t367, cl.dot.at[v_q])) === v_q)));
        }
        if (!(_c368)) continue;
        _g355.push(v_e);
      }
    }
    const v_T = through(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), _g355);
    const _a369 = v_T;
    for (let _i370 = 0; _i370 < _a369.length; _i370++) {
      const v_x = _a369[_i370];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g337.includes(v_x)) _g337.push(v_x);
    }
  }
  const _made = _g337;
  _kept[v_q] = _made;
  return _made;
}
