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
  const _g398: number[] = [];
  const _g411: number[] = [];
  const _g431: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q396 = true;
  Q397: {
    _g398.length = 0;
    G399: {
      const _a402 = sp.edges;
      for (let _i403 = 0; _i403 < _a402.length; _i403++) {
        const v_e = _a402[_i403];
        const _h404 = (g[v_e] || -1);
        if (!((_h404 === 2))) continue;
        _g398.push(v_e);
      }
    }
    const v_O = _g398;
    const _eg408 = edgeGroups(sp, v_O);
    const _a405 = sp.edges;
    for (let _i406 = 0; _i406 < _a405.length; _i406++) {
      const v_e = _a405[_i406];
      const _h407 = (g[v_e] || -1);
      if (!(((_h407 === 1) === !(_eg408.of(sp.edgeEnds[2 * v_e + 1]) === _eg408.of(sp.edgeEnds[2 * v_e]))))) {
        _q396 = false;
        break Q397;
      }
    }
  }
  if (!(_q396)) return false;
  let _q409 = true;
  Q410: {
    _g411.length = 0;
    G412: {
      const _a415 = sp.edges;
      for (let _i416 = 0; _i416 < _a415.length; _i416++) {
        const v_e = _a415[_i416];
        const _h417 = (g[v_e] || -1);
        if (!((_h417 === 2))) continue;
        _g411.push(v_e);
      }
    }
    const v_O = _g411;
    const _eg425 = edgeGroups(sp, v_O);
    const _a418 = sp.cells;
    for (let _i419 = 0; _i419 < _a418.length; _i419++) {
      const v_c = _a418[_i419];
      let _g420 = 0;
      G421: {
        const _a422 = sp.centers;
        for (let _i423 = 0; _i423 < _a422.length; _i423++) {
          const v_p = _a422[_i423];
          const _h424 = clueAt(cl.dot, v_p);
          if (!(((_h424 !== -1) && (_eg425.of((sp.centerCells[v_p][0] ?? -1)) === _eg425.of(v_c))))) continue;
          _g420++;
        }
      }
      if (!((_g420 === 1))) {
        _q409 = false;
        break Q410;
      }
    }
  }
  if (!(_q409)) return false;
  for (let _k426 = 0; _k426 < cl.dot.at.length; _k426++) {
    const _at427 = cl.dot.at[_k426];
    let _q429 = true;
    Q430: {
      _g431.length = 0;
      G432: {
        const _a435 = sp.edges;
        for (let _i436 = 0; _i436 < _a435.length; _i436++) {
          const v_e = _a435[_i436];
          const _h437 = (g[v_e] || -1);
          if (!((_h437 === 2))) continue;
          _g431.push(v_e);
        }
      }
      const v_O = _g431;
      const _eg438 = edgeGroups(sp, v_O);
      const v_R = _eg438.of((sp.centerCells[_at427][0] ?? -1));
      let _q439 = true;
      Q440: {
        const _a441 = sp.centerCells[_at427];
        for (let _i442 = 0; _i442 < _a441.length; _i442++) {
          const v_c = _a441[_i442];
          if (!((_eg438.of(v_c) === v_R))) {
            _q439 = false;
            break Q440;
          }
        }
      }
      let _c447: boolean = _q439;
      if (_c447) {
        let _q443 = true;
        Q444: {
          const _a445 = v_R;
          for (let _i446 = 0; _i446 < _a445.length; _i446++) {
            const v_c = _a445[_i446];
            if (!((_eg438.of(opp(sp, v_c, _at427)) === v_R))) {
              _q443 = false;
              break Q444;
            }
          }
        }
        _c447 = _q443;
      }
      if (!(_c447)) {
        _q429 = false;
        break Q430;
      }
    }
    if (!(_q429)) return false;
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
  const _g193: number[] = [];
  const _g230: number[] = [];
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
  const _eg202 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _memo204 = new Map<readonly number[], boolean>();
  const _a200 = sp.cells;
  for (let _i201 = 0; _i201 < _a200.length; _i201++) {
    const v_c = _a200[_i201];
    let _c229: boolean = (b.markOf(v_c) === -1);
    if (_c229) {
      const _t203 = _eg202.of(v_c);
      let _gq205 = _memo204.get(_t203);
      if (_gq205 === undefined) {
        let _q206 = false;
        Q207: {
          for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
            const _h227 = cl.dot.at[v_p];
            let _c213: boolean = (_t203.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
            if (_c213) {
              let _q208 = true;
              Q209: {
                const _a211 = sp.centerCells[cl.dot.at[v_p]];
                for (let _i212 = 0; _i212 < _a211.length; _i212++) {
                  const v_c_210 = _a211[_i212];
                  if (!((_t203.includes(v_c_210)))) {
                    _q208 = false;
                    break Q209;
                  }
                }
              }
              _c213 = _q208;
            }
            let _c222: boolean = _c213;
            if (_c222) {
              let _q214 = true;
              Q215: {
                for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                  let _c221: boolean = (v_r === v_p);
                  if (!_c221) {
                    let _q216 = true;
                    Q217: {
                      const _a219 = sp.centerCells[cl.dot.at[v_r]];
                      for (let _i220 = 0; _i220 < _a219.length; _i220++) {
                        const v_c_218 = _a219[_i220];
                        if (!(!(_t203.includes(v_c_218)))) {
                          _q216 = false;
                          break Q217;
                        }
                      }
                    }
                    _c221 = _q216;
                  }
                  if (!(_c221)) {
                    _q214 = false;
                    break Q215;
                  }
                }
              }
              _c222 = _q214;
            }
            let _c228: boolean = _c222;
            if (_c228) {
              let _q223 = true;
              Q224: {
                const _a225 = _t203;
                for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                  const v_y = _a225[_i226];
                  if (!((_t203.includes(opp(sp, v_y, _h227))))) {
                    _q223 = false;
                    break Q224;
                  }
                }
              }
              _c228 = _q223;
            }
            if (_c228) {
              _q206 = true;
              break Q207;
            }
          }
        }
        _gq205 = _q206;
        _memo204.set(_t203, _gq205);
      }
      _c229 = !(_gq205);
    }
    if (!(_c229)) continue;
    _g230.length = 0;
    G231: {
      const _a257 = near(sp, cl, v_c);
      for (let _i258 = 0; _i258 < _a257.length; _i258++) {
        const v_q = _a257[_i258];
        const _t259 = opp(sp, v_c, cl.dot.at[v_q]);
        const _t260 = _eg202.of(_t259);
        let _gq261 = _memo204.get(_t260);
        if (_gq261 === undefined) {
          let _q262 = false;
          Q263: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h281 = cl.dot.at[v_p];
              let _c268: boolean = (_t260.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
              if (_c268) {
                let _q264 = true;
                Q265: {
                  const _a266 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i267 = 0; _i267 < _a266.length; _i267++) {
                    const v_c = _a266[_i267];
                    if (!((_t260.includes(v_c)))) {
                      _q264 = false;
                      break Q265;
                    }
                  }
                }
                _c268 = _q264;
              }
              let _c276: boolean = _c268;
              if (_c276) {
                let _q269 = true;
                Q270: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c275: boolean = (v_r === v_p);
                    if (!_c275) {
                      let _q271 = true;
                      Q272: {
                        const _a273 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                          const v_c = _a273[_i274];
                          if (!(!(_t260.includes(v_c)))) {
                            _q271 = false;
                            break Q272;
                          }
                        }
                      }
                      _c275 = _q271;
                    }
                    if (!(_c275)) {
                      _q269 = false;
                      break Q270;
                    }
                  }
                }
                _c276 = _q269;
              }
              let _c282: boolean = _c276;
              if (_c282) {
                let _q277 = true;
                Q278: {
                  const _a279 = _t260;
                  for (let _i280 = 0; _i280 < _a279.length; _i280++) {
                    const v_y = _a279[_i280];
                    if (!((_t260.includes(opp(sp, v_y, _h281))))) {
                      _q277 = false;
                      break Q278;
                    }
                  }
                }
                _c282 = _q277;
              }
              if (_c282) {
                _q262 = true;
                break Q263;
              }
            }
          }
          _gq261 = _q262;
          _memo204.set(_t260, _gq261);
        }
        if (!(!(_gq261))) continue;
        _g230.push(v_q);
      }
    }
    L283: {
      const v_K = _g230;
      const _h284 = v_K.length;
      if (!((_h284 < 2))) break L283;
      facts.length = 0;
      changed = false;
      let _c293: boolean = (_h284 > 0);
      if (_c293) {
        let _q285 = true;
        Q286: {
          const _a287 = v_K;
          for (let _i288 = 0; _i288 < _a287.length; _i288++) {
            const v_q = _a287[_i288];
            let _mk289 = v_c >= 0;
            if (_mk289) { const _was = b.markOf(v_c); if (_was >= 0) _mk289 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c292: boolean = _mk289;
            if (_c292) {
              const _t290 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk291 = _t290 >= 0;
              if (_mk291) { const _was = b.markOf(_t290); if (_was >= 0) _mk291 = _was === v_q; else if (fire === null) { b.markAt(_t290, v_q); changed = true; } else facts.push(MARK, _t290, v_q); }
              _c292 = _mk291;
            }
            if (!(_c292)) {
              _q285 = false;
              break Q286;
            }
          }
        }
        _c293 = _q285;
      }
      if (!(_c293)) return -1;
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
  const _g321: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _a319 = sp.cells;
  for (let _i320 = 0; _i320 < _a319.length; _i320++) {
    const v_c = _a319[_i320];
    if (!((b.markOf(v_c) === -1))) continue;
    _g321.length = 0;
    G322: {
      const _a325 = near(sp, cl, v_c);
      for (let _i326 = 0; _i326 < _a325.length; _i326++) {
        const v_q = _a325[_i326];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g321.push(v_q);
      }
    }
    L327: {
      const v_K = _g321;
      const _h328 = v_K.length;
      if (!((_h328 < 2))) break L327;
      facts.length = 0;
      changed = false;
      let _c337: boolean = (_h328 > 0);
      if (_c337) {
        let _q329 = true;
        Q330: {
          const _a331 = v_K;
          for (let _i332 = 0; _i332 < _a331.length; _i332++) {
            const v_q = _a331[_i332];
            let _mk333 = v_c >= 0;
            if (_mk333) { const _was = b.markOf(v_c); if (_was >= 0) _mk333 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c336: boolean = _mk333;
            if (_c336) {
              const _t334 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk335 = _t334 >= 0;
              if (_mk335) { const _was = b.markOf(_t334); if (_was >= 0) _mk335 = _was === v_q; else if (fire === null) { b.markAt(_t334, v_q); changed = true; } else facts.push(MARK, _t334, v_q); }
              _c336 = _mk335;
            }
            if (!(_c336)) {
              _q329 = false;
              break Q330;
            }
          }
        }
        _c337 = _q329;
      }
      if (!(_c337)) return -1;
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
  const _g359: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a354 = sp.cells;
  for (let _i355 = 0; _i355 < _a354.length; _i355++) {
    const v_c = _a354[_i355];
    L356: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L356;
      const _h377 = cl.dot.at[v_q];
      L358: {
        const v_G = throughWhere(sp, v_c, (_te357: number): boolean => {  return ((((b.grid[_te357] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te357]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te357 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L358;
        _g359.length = 0;
        G360: {
          const _a365 = v_G;
          for (let _i366 = 0; _i366 < _a365.length; _i366++) {
            const v_x = _a365[_i366];
            const _a367 = sp.adj4[v_x];
            for (let _i368 = 0; _i368 < _a367.length; _i368++) {
              const v_n = _a367[_i368];
              const _h369 = (b.grid[sp.adj4Edges[v_x][_i368]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h369 !== 1)))) continue;
              if (!_g359.includes(v_n)) _g359.push(v_n);
            }
          }
        }
        L370: {
          const v_L = _g359;
          const _h371 = v_L.length;
          if (!((_h371 < 2))) break L370;
          facts.length = 0;
          changed = false;
          let _c381: boolean = (_h371 > 0);
          if (_c381) {
            let _q372 = true;
            Q373: {
              const _a374 = v_L;
              for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                const v_l = _a374[_i375];
                let _mk376 = v_l >= 0;
                if (_mk376) { const _was = b.markOf(v_l); if (_was >= 0) _mk376 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c380: boolean = _mk376;
                if (_c380) {
                  const _t378 = opp(sp, v_l, _h377);
                  let _mk379 = _t378 >= 0;
                  if (_mk379) { const _was = b.markOf(_t378); if (_was >= 0) _mk379 = _was === v_q; else if (fire === null) { b.markAt(_t378, v_q); changed = true; } else facts.push(MARK, _t378, v_q); }
                  _c380 = _mk379;
                }
                if (!(_c380)) {
                  _q372 = false;
                  break Q373;
                }
              }
            }
            _c381 = _q372;
          }
          if (!(_c381)) return -1;
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
  const _a389 = sp.edges;
  for (let _i390 = 0; _i390 < _a389.length; _i390++) {
    const v_e = _a389[_i390];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _a391 = setOf(sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]);
    for (let _i392 = 0; _i392 < _a391.length; _i392++) {
      const v_a = _a391[_i392];
      L393: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L393;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L394: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L394;
          L395: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L395;
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
  const _g300: number[] = [];
  G301: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te309: number): boolean => { let _c311: boolean = ((b.grid[_te309] || -1) !== 1); if (_c311) {   const _t310 = sp.edgeEnds[2 * _te309];   _c311 = (((opp(sp, _t310, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t310) === -1) || (b.markOf(_t310) === v_q))) && ((b.markOf(opp(sp, _t310, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t310, cl.dot.at[v_q])) === v_q))); } let _c313: boolean = _c311; if (_c313) {   const _t312 = sp.edgeEnds[2 * _te309 + 1];   _c313 = (((opp(sp, _t312, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t312) === -1) || (b.markOf(_t312) === v_q))) && ((b.markOf(opp(sp, _t312, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t312, cl.dot.at[v_q])) === v_q))); } return _c313; });
    const _a314 = v_T;
    for (let _i315 = 0; _i315 < _a314.length; _i315++) {
      const v_x = _a314[_i315];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g300.includes(v_x)) _g300.push(v_x);
    }
  }
  const _made = _g300;
  _kept[v_q] = _made;
  return _made;
}
