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
  const _g390: number[] = [];
  const _g403: number[] = [];
  const _g423: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q388 = true;
  Q389: {
    _g390.length = 0;
    G391: {
      const _a394 = sp.edges;
      for (let _i395 = 0; _i395 < _a394.length; _i395++) {
        const v_e = _a394[_i395];
        const _h396 = (g[v_e] || -1);
        if (!((_h396 === 2))) continue;
        _g390.push(v_e);
      }
    }
    const v_O = _g390;
    const _eg400 = edgeGroups(sp, v_O);
    const _a397 = sp.edges;
    for (let _i398 = 0; _i398 < _a397.length; _i398++) {
      const v_e = _a397[_i398];
      const _h399 = (g[v_e] || -1);
      if (!(((_h399 === 1) === !(_eg400.of(sp.edgeEnds[2 * v_e + 1]) === _eg400.of(sp.edgeEnds[2 * v_e]))))) {
        _q388 = false;
        break Q389;
      }
    }
  }
  if (!(_q388)) return false;
  let _q401 = true;
  Q402: {
    _g403.length = 0;
    G404: {
      const _a407 = sp.edges;
      for (let _i408 = 0; _i408 < _a407.length; _i408++) {
        const v_e = _a407[_i408];
        const _h409 = (g[v_e] || -1);
        if (!((_h409 === 2))) continue;
        _g403.push(v_e);
      }
    }
    const v_O = _g403;
    const _eg417 = edgeGroups(sp, v_O);
    const _a410 = sp.cells;
    for (let _i411 = 0; _i411 < _a410.length; _i411++) {
      const v_c = _a410[_i411];
      let _g412 = 0;
      G413: {
        const _a414 = sp.centers;
        for (let _i415 = 0; _i415 < _a414.length; _i415++) {
          const v_p = _a414[_i415];
          const _h416 = clueAt(cl.dot, v_p);
          if (!(((_h416 !== -1) && (_eg417.of((sp.centerCells[v_p][0] ?? -1)) === _eg417.of(v_c))))) continue;
          _g412++;
        }
      }
      if (!((_g412 === 1))) {
        _q401 = false;
        break Q402;
      }
    }
  }
  if (!(_q401)) return false;
  for (let _k418 = 0; _k418 < cl.dot.at.length; _k418++) {
    const _at419 = cl.dot.at[_k418];
    let _q421 = true;
    Q422: {
      _g423.length = 0;
      G424: {
        const _a427 = sp.edges;
        for (let _i428 = 0; _i428 < _a427.length; _i428++) {
          const v_e = _a427[_i428];
          const _h429 = (g[v_e] || -1);
          if (!((_h429 === 2))) continue;
          _g423.push(v_e);
        }
      }
      const v_O = _g423;
      const _eg430 = edgeGroups(sp, v_O);
      const v_R = _eg430.of((sp.centerCells[_at419][0] ?? -1));
      let _q431 = true;
      Q432: {
        const _a433 = sp.centerCells[_at419];
        for (let _i434 = 0; _i434 < _a433.length; _i434++) {
          const v_c = _a433[_i434];
          if (!((_eg430.of(v_c) === v_R))) {
            _q431 = false;
            break Q432;
          }
        }
      }
      let _c439: boolean = _q431;
      if (_c439) {
        let _q435 = true;
        Q436: {
          const _a437 = v_R;
          for (let _i438 = 0; _i438 < _a437.length; _i438++) {
            const v_c = _a437[_i438];
            if (!((_eg430.of(opp(sp, v_c, _at419)) === v_R))) {
              _q435 = false;
              break Q436;
            }
          }
        }
        _c439 = _q435;
      }
      if (!(_c439)) {
        _q421 = false;
        break Q422;
      }
    }
    if (!(_q421)) return false;
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

/** Its dearest read grows with the board as n^3. */
export function soleOwner(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SoleOwnerBinding> | null): number {
  const _g185: number[] = [];
  const _g222: number[] = [];
  const facts = soleOwnerFacts;
  let fired = 0;
  let changed = false;
  _g185.length = 0;
  G186: {
    const _a189 = sp.edges;
    for (let _i190 = 0; _i190 < _a189.length; _i190++) {
      const v_e = _a189[_i190];
      const _h191 = (b.grid[v_e] || -1);
      if (!((_h191 !== 1))) continue;
      _g185.push(v_e);
    }
  }
  const v_O = _g185;
  const _eg194 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _memo196 = new Map<readonly number[], boolean>();
  const _a192 = sp.cells;
  for (let _i193 = 0; _i193 < _a192.length; _i193++) {
    const v_c = _a192[_i193];
    let _c221: boolean = (b.markOf(v_c) === -1);
    if (_c221) {
      const _t195 = _eg194.of(v_c);
      let _gq197 = _memo196.get(_t195);
      if (_gq197 === undefined) {
        let _q198 = false;
        Q199: {
          for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
            const _h219 = cl.dot.at[v_p];
            let _c205: boolean = (_t195.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
            if (_c205) {
              let _q200 = true;
              Q201: {
                const _a203 = sp.centerCells[cl.dot.at[v_p]];
                for (let _i204 = 0; _i204 < _a203.length; _i204++) {
                  const v_c_202 = _a203[_i204];
                  if (!((_t195.includes(v_c_202)))) {
                    _q200 = false;
                    break Q201;
                  }
                }
              }
              _c205 = _q200;
            }
            let _c214: boolean = _c205;
            if (_c214) {
              let _q206 = true;
              Q207: {
                for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                  let _c213: boolean = (v_r === v_p);
                  if (!_c213) {
                    let _q208 = true;
                    Q209: {
                      const _a211 = sp.centerCells[cl.dot.at[v_r]];
                      for (let _i212 = 0; _i212 < _a211.length; _i212++) {
                        const v_c_210 = _a211[_i212];
                        if (!(!(_t195.includes(v_c_210)))) {
                          _q208 = false;
                          break Q209;
                        }
                      }
                    }
                    _c213 = _q208;
                  }
                  if (!(_c213)) {
                    _q206 = false;
                    break Q207;
                  }
                }
              }
              _c214 = _q206;
            }
            let _c220: boolean = _c214;
            if (_c220) {
              let _q215 = true;
              Q216: {
                const _a217 = _t195;
                for (let _i218 = 0; _i218 < _a217.length; _i218++) {
                  const v_y = _a217[_i218];
                  if (!((_t195.includes(opp(sp, v_y, _h219))))) {
                    _q215 = false;
                    break Q216;
                  }
                }
              }
              _c220 = _q215;
            }
            if (_c220) {
              _q198 = true;
              break Q199;
            }
          }
        }
        _gq197 = _q198;
        _memo196.set(_t195, _gq197);
      }
      _c221 = !(_gq197);
    }
    if (!(_c221)) continue;
    _g222.length = 0;
    G223: {
      const _a249 = near(sp, cl, v_c);
      for (let _i250 = 0; _i250 < _a249.length; _i250++) {
        const v_q = _a249[_i250];
        const _t251 = opp(sp, v_c, cl.dot.at[v_q]);
        const _t252 = _eg194.of(_t251);
        let _gq253 = _memo196.get(_t252);
        if (_gq253 === undefined) {
          let _q254 = false;
          Q255: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h273 = cl.dot.at[v_p];
              let _c260: boolean = (_t252.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
              if (_c260) {
                let _q256 = true;
                Q257: {
                  const _a258 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                    const v_c = _a258[_i259];
                    if (!((_t252.includes(v_c)))) {
                      _q256 = false;
                      break Q257;
                    }
                  }
                }
                _c260 = _q256;
              }
              let _c268: boolean = _c260;
              if (_c268) {
                let _q261 = true;
                Q262: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c267: boolean = (v_r === v_p);
                    if (!_c267) {
                      let _q263 = true;
                      Q264: {
                        const _a265 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                          const v_c = _a265[_i266];
                          if (!(!(_t252.includes(v_c)))) {
                            _q263 = false;
                            break Q264;
                          }
                        }
                      }
                      _c267 = _q263;
                    }
                    if (!(_c267)) {
                      _q261 = false;
                      break Q262;
                    }
                  }
                }
                _c268 = _q261;
              }
              let _c274: boolean = _c268;
              if (_c274) {
                let _q269 = true;
                Q270: {
                  const _a271 = _t252;
                  for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                    const v_y = _a271[_i272];
                    if (!((_t252.includes(opp(sp, v_y, _h273))))) {
                      _q269 = false;
                      break Q270;
                    }
                  }
                }
                _c274 = _q269;
              }
              if (_c274) {
                _q254 = true;
                break Q255;
              }
            }
          }
          _gq253 = _q254;
          _memo196.set(_t252, _gq253);
        }
        if (!(!(_gq253))) continue;
        _g222.push(v_q);
      }
    }
    L275: {
      const v_K = _g222;
      const _h276 = v_K.length;
      if (!((_h276 < 2))) break L275;
      facts.length = 0;
      changed = false;
      let _c285: boolean = (_h276 > 0);
      if (_c285) {
        let _q277 = true;
        Q278: {
          const _a279 = v_K;
          for (let _i280 = 0; _i280 < _a279.length; _i280++) {
            const v_q = _a279[_i280];
            let _mk281 = v_c >= 0;
            if (_mk281) { const _was = b.markOf(v_c); if (_was >= 0) _mk281 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c284: boolean = _mk281;
            if (_c284) {
              const _t282 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk283 = _t282 >= 0;
              if (_mk283) { const _was = b.markOf(_t282); if (_was >= 0) _mk283 = _was === v_q; else if (fire === null) { b.markAt(_t282, v_q); changed = true; } else facts.push(MARK, _t282, v_q); }
              _c284 = _mk283;
            }
            if (!(_c284)) {
              _q277 = false;
              break Q278;
            }
          }
        }
        _c285 = _q277;
      }
      if (!(_c285)) return -1;
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

/** Its dearest read grows with the board as n. */
export function onlyReach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyReachBinding> | null): number {
  const _g313: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _a311 = sp.cells;
  for (let _i312 = 0; _i312 < _a311.length; _i312++) {
    const v_c = _a311[_i312];
    if (!((b.markOf(v_c) === -1))) continue;
    _g313.length = 0;
    G314: {
      const _a317 = near(sp, cl, v_c);
      for (let _i318 = 0; _i318 < _a317.length; _i318++) {
        const v_q = _a317[_i318];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g313.push(v_q);
      }
    }
    L319: {
      const v_K = _g313;
      const _h320 = v_K.length;
      if (!((_h320 < 2))) break L319;
      facts.length = 0;
      changed = false;
      let _c329: boolean = (_h320 > 0);
      if (_c329) {
        let _q321 = true;
        Q322: {
          const _a323 = v_K;
          for (let _i324 = 0; _i324 < _a323.length; _i324++) {
            const v_q = _a323[_i324];
            let _mk325 = v_c >= 0;
            if (_mk325) { const _was = b.markOf(v_c); if (_was >= 0) _mk325 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c328: boolean = _mk325;
            if (_c328) {
              const _t326 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk327 = _t326 >= 0;
              if (_mk327) { const _was = b.markOf(_t326); if (_was >= 0) _mk327 = _was === v_q; else if (fire === null) { b.markAt(_t326, v_q); changed = true; } else facts.push(MARK, _t326, v_q); }
              _c328 = _mk327;
            }
            if (!(_c328)) {
              _q321 = false;
              break Q322;
            }
          }
        }
        _c329 = _q321;
      }
      if (!(_c329)) return -1;
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

/** Its dearest read grows with the board as n^2. */
export function exclave(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExclaveBinding> | null): number {
  const _g351: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a346 = sp.cells;
  for (let _i347 = 0; _i347 < _a346.length; _i347++) {
    const v_c = _a346[_i347];
    L348: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L348;
      const _h369 = cl.dot.at[v_q];
      L350: {
        const v_G = throughWhere(sp, v_c, (_te349: number): boolean => {  return ((((b.grid[_te349] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te349]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te349 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L350;
        _g351.length = 0;
        G352: {
          const _a357 = v_G;
          for (let _i358 = 0; _i358 < _a357.length; _i358++) {
            const v_x = _a357[_i358];
            const _a359 = sp.adj4[v_x];
            for (let _i360 = 0; _i360 < _a359.length; _i360++) {
              const v_n = _a359[_i360];
              const _h361 = (b.grid[sp.adj4Edges[v_x][_i360]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h361 !== 1)))) continue;
              if (!_g351.includes(v_n)) _g351.push(v_n);
            }
          }
        }
        L362: {
          const v_L = _g351;
          const _h363 = v_L.length;
          if (!((_h363 < 2))) break L362;
          facts.length = 0;
          changed = false;
          let _c373: boolean = (_h363 > 0);
          if (_c373) {
            let _q364 = true;
            Q365: {
              const _a366 = v_L;
              for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                const v_l = _a366[_i367];
                let _mk368 = v_l >= 0;
                if (_mk368) { const _was = b.markOf(v_l); if (_was >= 0) _mk368 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c372: boolean = _mk368;
                if (_c372) {
                  const _t370 = opp(sp, v_l, _h369);
                  let _mk371 = _t370 >= 0;
                  if (_mk371) { const _was = b.markOf(_t370); if (_was >= 0) _mk371 = _was === v_q; else if (fire === null) { b.markAt(_t370, v_q); changed = true; } else facts.push(MARK, _t370, v_q); }
                  _c372 = _mk371;
                }
                if (!(_c372)) {
                  _q364 = false;
                  break Q365;
                }
              }
            }
            _c373 = _q364;
          }
          if (!(_c373)) return -1;
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

/** Its dearest read grows with the board as n. */
export function mirrorWall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MirrorWallBinding> | null): number {
  const facts = mirrorWallFacts;
  let fired = 0;
  let changed = false;
  const _a381 = sp.edges;
  for (let _i382 = 0; _i382 < _a381.length; _i382++) {
    const v_e = _a381[_i382];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _a383 = setOf(sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]);
    for (let _i384 = 0; _i384 < _a383.length; _i384++) {
      const v_a = _a383[_i384];
      L385: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L385;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L386: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L386;
          L387: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L387;
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
  const _g112: number[] = [];
  G113: {
    for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
      if (!((sp.centerCells[cl.dot.at[v_p]].includes(v_x)))) continue;
      _g112.push(v_p);
    }
  }
  const _made = _g112;
  _kept[v_x] = _made;
  return _made;
}

const roomKept = keptStore<readonly number[]>();

/** `room(q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function room(sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = roomKept.board(cl);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _made = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te108: number): boolean => { const _t109 = sp.edgeEnds[2 * _te108]; let _c116: boolean = (opp(sp, _t109, cl.dot.at[v_q]) !== -1); if (_c116) {   let _q110 = true;   Q111: {     const _a114 = under(sp, cl, _t109);     for (let _i115 = 0; _i115 < _a114.length; _i115++) {       const v_p = _a114[_i115];       if (!((v_p === v_q))) {         _q110 = false;         break Q111;       }     }   }   _c116 = _q110; } let _c121: boolean = _c116; if (_c121) {   let _q117 = true;   Q118: {     const _a119 = under(sp, cl, opp(sp, _t109, cl.dot.at[v_q]));     for (let _i120 = 0; _i120 < _a119.length; _i120++) {       const v_p = _a119[_i120];       if (!((v_p === v_q))) {         _q117 = false;         break Q118;       }     }   }   _c121 = _q117; } let _c133: boolean = _c121; if (_c133) {   const _t122 = sp.edgeEnds[2 * _te108 + 1];   let _c127: boolean = (opp(sp, _t122, cl.dot.at[v_q]) !== -1);   if (_c127) {     let _q123 = true;     Q124: {       const _a125 = under(sp, cl, _t122);       for (let _i126 = 0; _i126 < _a125.length; _i126++) {         const v_p = _a125[_i126];         if (!((v_p === v_q))) {           _q123 = false;           break Q124;         }       }     }     _c127 = _q123;   }   let _c132: boolean = _c127;   if (_c132) {     let _q128 = true;     Q129: {       const _a130 = under(sp, cl, opp(sp, _t122, cl.dot.at[v_q]));       for (let _i131 = 0; _i131 < _a130.length; _i131++) {         const v_p = _a130[_i131];         if (!((v_p === v_q))) {           _q128 = false;           break Q129;         }       }     }     _c132 = _q128;   }   _c133 = _c132; } return _c133; });
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
  const _g292: number[] = [];
  G293: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te301: number): boolean => { let _c303: boolean = ((b.grid[_te301] || -1) !== 1); if (_c303) {   const _t302 = sp.edgeEnds[2 * _te301];   _c303 = (((opp(sp, _t302, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t302) === -1) || (b.markOf(_t302) === v_q))) && ((b.markOf(opp(sp, _t302, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t302, cl.dot.at[v_q])) === v_q))); } let _c305: boolean = _c303; if (_c305) {   const _t304 = sp.edgeEnds[2 * _te301 + 1];   _c305 = (((opp(sp, _t304, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t304) === -1) || (b.markOf(_t304) === v_q))) && ((b.markOf(opp(sp, _t304, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t304, cl.dot.at[v_q])) === v_q))); } return _c305; });
    const _a306 = v_T;
    for (let _i307 = 0; _i307 < _a306.length; _i307++) {
      const v_x = _a306[_i307];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g292.includes(v_x)) _g292.push(v_x);
    }
  }
  const _made = _g292;
  _kept[v_q] = _made;
  return _made;
}
