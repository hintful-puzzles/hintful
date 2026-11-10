// Compiled by `npm run describe` from src/games/galaxies/galaxies.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptEdgeGroups, keptStore, opp, rangeMask, sameSet, staleChecking, stamps, through, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g507: number[] = [];
  const _g520: number[] = [];
  const _g540: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q505 = true;
  Q506: {
    _g507.length = 0;
    G508: {
      const _a511 = sp.edges;
      for (let _i512 = 0; _i512 < _a511.length; _i512++) {
        const v_e = _a511[_i512];
        const _h513 = (g[v_e] || -1);
        if (!((_h513 === 2))) continue;
        _g507.push(v_e);
      }
    }
    const v_O = _g507;
    const _eg517 = edgeGroups(sp, v_O);
    const _a514 = sp.edges;
    for (let _i515 = 0; _i515 < _a514.length; _i515++) {
      const v_e = _a514[_i515];
      const _h516 = (g[v_e] || -1);
      if (!(((_h516 === 1) === !(_eg517.of(sp.edgeEnds[2 * v_e + 1]) === _eg517.of(sp.edgeEnds[2 * v_e]))))) {
        _q505 = false;
        break Q506;
      }
    }
  }
  if (!(_q505)) return false;
  let _q518 = true;
  Q519: {
    _g520.length = 0;
    G521: {
      const _a524 = sp.edges;
      for (let _i525 = 0; _i525 < _a524.length; _i525++) {
        const v_e = _a524[_i525];
        const _h526 = (g[v_e] || -1);
        if (!((_h526 === 2))) continue;
        _g520.push(v_e);
      }
    }
    const v_O = _g520;
    const _eg534 = edgeGroups(sp, v_O);
    const _a527 = sp.cells;
    for (let _i528 = 0; _i528 < _a527.length; _i528++) {
      const v_c = _a527[_i528];
      let _g529 = 0;
      G530: {
        const _a531 = sp.centers;
        for (let _i532 = 0; _i532 < _a531.length; _i532++) {
          const v_p = _a531[_i532];
          const _h533 = clueAt(cl.dot, v_p);
          if (!(((_h533 !== -1) && (_eg534.of((sp.centerCells[v_p][0] ?? -1)) === _eg534.of(v_c))))) continue;
          _g529++;
        }
      }
      if (!((_g529 === 1))) {
        _q518 = false;
        break Q519;
      }
    }
  }
  if (!(_q518)) return false;
  for (let _k535 = 0; _k535 < cl.dot.at.length; _k535++) {
    const _at536 = cl.dot.at[_k535];
    let _q538 = true;
    Q539: {
      _g540.length = 0;
      G541: {
        const _a544 = sp.edges;
        for (let _i545 = 0; _i545 < _a544.length; _i545++) {
          const v_e = _a544[_i545];
          const _h546 = (g[v_e] || -1);
          if (!((_h546 === 2))) continue;
          _g540.push(v_e);
        }
      }
      const v_O = _g540;
      const _eg547 = edgeGroups(sp, v_O);
      const v_R = _eg547.of((sp.centerCells[_at536][0] ?? -1));
      let _q548 = true;
      Q549: {
        const _a550 = sp.centerCells[_at536];
        for (let _i551 = 0; _i551 < _a550.length; _i551++) {
          const v_c = _a550[_i551];
          if (!((_eg547.of(v_c) === v_R))) {
            _q548 = false;
            break Q549;
          }
        }
      }
      let _c556: boolean = _q548;
      if (_c556) {
        let _q552 = true;
        Q553: {
          const _a554 = v_R;
          for (let _i555 = 0; _i555 < _a554.length; _i555++) {
            const v_c = _a554[_i555];
            if (!((_eg547.of(opp(sp, v_c, _at536)) === v_R))) {
              _q552 = false;
              break Q553;
            }
          }
        }
        _c556 = _q552;
      }
      if (!(_c556)) {
        _q538 = false;
        break Q539;
      }
    }
    if (!(_q538)) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      let _q9 = false;
      Q10: {
        const _a11 = sp.centerCells[cl.dot.at[v_q]];
        for (let _i12 = 0; _i12 < _a11.length; _i12++) {
          const v_c = _a11[_i12];
          if ((b.markOf(v_c) !== v_q)) {
            _q9 = true;
            break Q10;
          }
        }
      }
      freshBinding("dotTile", [_q9], ["where of q"]);
    }
    facts.length = 0;
    changed = false;
    let _q13 = true;
    Q14: {
      const _a15 = sp.centerCells[cl.dot.at[v_q]];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_c = _a15[_i16];
        let _mk17 = v_c >= 0;
        if (_mk17) { const _was = b.markOf(v_c); if (_was >= 0) _mk17 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
        if (!(_mk17)) {
          _q13 = false;
          break Q14;
        }
      }
    }
    if (!(_q13)) return -1;
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
  const _a21 = sp.edges;
  for (let _i22 = 0; _i22 < _a21.length; _i22++) {
    const v_e = _a21[_i22];
    const _h23 = (b.grid[v_e] || -1);
    if (!((_h23 === 1))) continue;
    L24: {
      const v_q = b.markOf(sp.edgeEnds[2 * v_e]);
      if (!((v_q !== -1))) break L24;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("split", [(sp.edges.includes(v_e)), ((b.grid[v_e] || -1) === 1), (v_q === b.markOf(sp.edgeEnds[2 * v_e])), (v_q !== -1)], ["e in", "where of e", "q =", "where of q"]);
      }
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
  const _a29 = sp.edges;
  for (let _i30 = 0; _i30 < _a29.length; _i30++) {
    const v_e = _a29[_i30];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L31: {
      const v_p = b.markOf(sp.edgeEnds[2 * v_e]);
      if (!((v_p !== -1))) break L31;
      L32: {
        const v_q = b.markOf(sp.edgeEnds[2 * v_e + 1]);
        if (!(((v_q !== -1) && (v_q !== v_p)))) break L32;
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("separate", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), (v_p === b.markOf(sp.edgeEnds[2 * v_e])), (v_p !== -1), (v_q === b.markOf(sp.edgeEnds[2 * v_e + 1])), ((v_q !== -1) && (v_q !== v_p))], ["e in", "where of e", "p =", "where of p", "q =", "where of q"]);
        }
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
  const _g53: number[] = [];
  const facts = enclosedFacts;
  let fired = 0;
  let changed = false;
  const _a51 = sp.cells;
  for (let _i52 = 0; _i52 < _a51.length; _i52++) {
    const v_c = _a51[_i52];
    if (!((b.markOf(v_c) === -1))) continue;
    _g53.length = 0;
    G54: {
      const _a57 = sp.adj4[v_c];
      for (let _i58 = 0; _i58 < _a57.length; _i58++) {
        const v_n = _a57[_i58];
        const _h59 = (b.grid[sp.adj4Edges[v_c][_i58]] || -1);
        if (!((_h59 !== 1))) continue;
        _g53.push(v_n);
      }
    }
    L60: {
      const v_N = _g53;
      const _h61 = v_N.length;
      if (!((_h61 > 0))) break L60;
      L62: {
        const v_q = b.markOf((v_N[0] ?? -1));
        let _c67: boolean = (v_q !== -1);
        if (_c67) {
          let _q63 = true;
          Q64: {
            const _a65 = v_N;
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_n = _a65[_i66];
              if (!((b.markOf(v_n) === v_q))) {
                _q63 = false;
                break Q64;
              }
            }
          }
          _c67 = _q63;
        }
        let _c70: boolean = _c67;
        if (_c70) {
          let _q68 = false;
          Q69: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              if ((opp(sp, v_c, cl.dot.at[v_p]) === v_c)) {
                _q68 = true;
                break Q69;
              }
            }
          }
          _c70 = !(_q68);
        }
        if (!(_c70)) break L62;
        if (import.meta.env.DEV && staleChecking) {
          const _g71: number[] = [];
          G72: {
            const _a75 = sp.adj4[v_c];
            for (let _i76 = 0; _i76 < _a75.length; _i76++) {
              const v_n = _a75[_i76];
              if (!(((b.grid[sp.adj4Edges[v_c][_i76]] || -1) !== 1))) continue;
              _g71.push(v_n);
            }
          }
          let _c81: boolean = (v_q !== -1);
          if (_c81) {
            let _q77 = true;
            Q78: {
              const _a79 = v_N;
              for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                const v_n = _a79[_i80];
                if (!((b.markOf(v_n) === v_q))) {
                  _q77 = false;
                  break Q78;
                }
              }
            }
            _c81 = _q77;
          }
          let _c84: boolean = _c81;
          if (_c84) {
            let _q82 = false;
            Q83: {
              for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                if ((opp(sp, v_c, cl.dot.at[v_p]) === v_c)) {
                  _q82 = true;
                  break Q83;
                }
              }
            }
            _c84 = !(_q82);
          }
          freshBinding("enclosed", [(sp.cells.includes(v_c)), (b.markOf(v_c) === -1), sameSet(v_N, _g71), (v_N.length > 0), (v_q === b.markOf((v_N[0] ?? -1))), _c84], ["c in", "where of c", "N =", "where of N", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        let _mk85 = v_c >= 0;
        if (_mk85) { const _was = b.markOf(v_c); if (_was >= 0) _mk85 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
        let _c88: boolean = _mk85;
        if (_c88) {
          const _t86 = opp(sp, v_c, cl.dot.at[v_q]);
          let _mk87 = _t86 >= 0;
          if (_mk87) { const _was = b.markOf(_t86); if (_was >= 0) _mk87 = _was === v_q; else if (fire === null) { b.markAt(_t86, v_q); changed = true; } else facts.push(MARK, _t86, v_q); }
          _c88 = _mk87;
        }
        if (!(_c88)) return -1;
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
  const _g190: number[] = [];
  const _g227: number[] = [];
  const _g283: number[] = [];
  const facts = soleOwnerFacts;
  let fired = 0;
  let changed = false;
  const _k254 = nearKept.board(cl);
  const _m70_0 = b.made[0];
  _g190.length = 0;
  G191: {
    const _a194 = sp.edges;
    for (let _i195 = 0; _i195 < _a194.length; _i195++) {
      const v_e = _a194[_i195];
      const _h196 = (b.grid[v_e] || -1);
      if (!((_h196 !== 1))) continue;
      _g190.push(v_e);
    }
  }
  const v_O = _g190;
  const _m73_1 = b.made[1];
  const _m73_3 = b.made[3];
  const _eg199 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _memo201 = new Map<readonly number[], boolean>();
  const _a197 = sp.cells;
  for (let _i198 = 0; _i198 < _a197.length; _i198++) {
    const v_c = _a197[_i198];
    let _c226: boolean = (b.markOf(v_c) === -1);
    if (_c226) {
      const _t200 = _eg199.of(v_c);
      let _gq202 = _memo201.get(_t200);
      if (_gq202 === undefined) {
        let _q203 = false;
        Q204: {
          for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
            const _h224 = cl.dot.at[v_p];
            let _c210: boolean = (_t200.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
            if (_c210) {
              let _q205 = true;
              Q206: {
                const _a208 = sp.centerCells[cl.dot.at[v_p]];
                for (let _i209 = 0; _i209 < _a208.length; _i209++) {
                  const v_c_207 = _a208[_i209];
                  if (!((_t200.includes(v_c_207)))) {
                    _q205 = false;
                    break Q206;
                  }
                }
              }
              _c210 = _q205;
            }
            let _c219: boolean = _c210;
            if (_c219) {
              let _q211 = true;
              Q212: {
                for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                  let _c218: boolean = (v_r === v_p);
                  if (!_c218) {
                    let _q213 = true;
                    Q214: {
                      const _a216 = sp.centerCells[cl.dot.at[v_r]];
                      for (let _i217 = 0; _i217 < _a216.length; _i217++) {
                        const v_c_215 = _a216[_i217];
                        if (!(!(_t200.includes(v_c_215)))) {
                          _q213 = false;
                          break Q214;
                        }
                      }
                    }
                    _c218 = _q213;
                  }
                  if (!(_c218)) {
                    _q211 = false;
                    break Q212;
                  }
                }
              }
              _c219 = _q211;
            }
            let _c225: boolean = _c219;
            if (_c225) {
              let _q220 = true;
              Q221: {
                const _a222 = _t200;
                for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                  const v_y = _a222[_i223];
                  if (!((_t200.includes(opp(sp, v_y, _h224))))) {
                    _q220 = false;
                    break Q221;
                  }
                }
              }
              _c225 = _q220;
            }
            if (_c225) {
              _q203 = true;
              break Q204;
            }
          }
        }
        _gq202 = _q203;
        _memo201.set(_t200, _gq202);
      }
      _c226 = !(_gq202);
    }
    if (!(_c226)) continue;
    _g227.length = 0;
    G228: {
      const _a255 = (_k254[v_c] ?? near(sp, cl, v_c));
      for (let _i256 = 0; _i256 < _a255.length; _i256++) {
        const v_q = _a255[_i256];
        const _t257 = opp(sp, v_c, cl.dot.at[v_q]);
        const _t258 = _eg199.of(_t257);
        let _gq259 = _memo201.get(_t258);
        if (_gq259 === undefined) {
          let _q260 = false;
          Q261: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h279 = cl.dot.at[v_p];
              let _c266: boolean = (_t258.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
              if (_c266) {
                let _q262 = true;
                Q263: {
                  const _a264 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i265 = 0; _i265 < _a264.length; _i265++) {
                    const v_c = _a264[_i265];
                    if (!((_t258.includes(v_c)))) {
                      _q262 = false;
                      break Q263;
                    }
                  }
                }
                _c266 = _q262;
              }
              let _c274: boolean = _c266;
              if (_c274) {
                let _q267 = true;
                Q268: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c273: boolean = (v_r === v_p);
                    if (!_c273) {
                      let _q269 = true;
                      Q270: {
                        const _a271 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                          const v_c = _a271[_i272];
                          if (!(!(_t258.includes(v_c)))) {
                            _q269 = false;
                            break Q270;
                          }
                        }
                      }
                      _c273 = _q269;
                    }
                    if (!(_c273)) {
                      _q267 = false;
                      break Q268;
                    }
                  }
                }
                _c274 = _q267;
              }
              let _c280: boolean = _c274;
              if (_c280) {
                let _q275 = true;
                Q276: {
                  const _a277 = _t258;
                  for (let _i278 = 0; _i278 < _a277.length; _i278++) {
                    const v_y = _a277[_i278];
                    if (!((_t258.includes(opp(sp, v_y, _h279))))) {
                      _q275 = false;
                      break Q276;
                    }
                  }
                }
                _c280 = _q275;
              }
              if (_c280) {
                _q260 = true;
                break Q261;
              }
            }
          }
          _gq259 = _q260;
          _memo201.set(_t258, _gq259);
        }
        if (!(!(_gq259))) continue;
        _g227.push(v_q);
      }
    }
    L281: {
      const v_K = _g227;
      const _h282 = v_K.length;
      if (!((_h282 < 2))) break L281;
      if (b.made[0] !== _m70_0 || b.made[1] !== _m73_1 || b.made[3] !== _m73_3) {
        _g283.length = 0;
        G284: {
          const _a287 = sp.edges;
          for (let _i288 = 0; _i288 < _a287.length; _i288++) {
            const v_e = _a287[_i288];
            if (!(((b.grid[v_e] || -1) !== 1))) continue;
            _g283.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g283))) { return fired; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g289: number[] = [];
        G290: {
          const _a293 = sp.edges;
          for (let _i294 = 0; _i294 < _a293.length; _i294++) {
            const v_e = _a293[_i294];
            if (!(((b.grid[v_e] || -1) !== 1))) continue;
            _g289.push(v_e);
          }
        }
        let _c319: boolean = (b.markOf(v_c) === -1);
        if (_c319) {
          let _q295 = true;
          Q296: {
            const v_R = through(sp, v_c, v_O);
            let _q297 = false;
            Q298: {
              for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                let _c304: boolean = (v_R.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
                if (_c304) {
                  let _q299 = true;
                  Q300: {
                    const _a302 = sp.centerCells[cl.dot.at[v_p]];
                    for (let _i303 = 0; _i303 < _a302.length; _i303++) {
                      const v_c_301 = _a302[_i303];
                      if (!((v_R.includes(v_c_301)))) {
                        _q299 = false;
                        break Q300;
                      }
                    }
                  }
                  _c304 = _q299;
                }
                let _c313: boolean = _c304;
                if (_c313) {
                  let _q305 = true;
                  Q306: {
                    for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                      let _c312: boolean = (v_r === v_p);
                      if (!_c312) {
                        let _q307 = true;
                        Q308: {
                          const _a310 = sp.centerCells[cl.dot.at[v_r]];
                          for (let _i311 = 0; _i311 < _a310.length; _i311++) {
                            const v_c_309 = _a310[_i311];
                            if (!(!(v_R.includes(v_c_309)))) {
                              _q307 = false;
                              break Q308;
                            }
                          }
                        }
                        _c312 = _q307;
                      }
                      if (!(_c312)) {
                        _q305 = false;
                        break Q306;
                      }
                    }
                  }
                  _c313 = _q305;
                }
                let _c318: boolean = _c313;
                if (_c318) {
                  let _q314 = true;
                  Q315: {
                    const _a316 = v_R;
                    for (let _i317 = 0; _i317 < _a316.length; _i317++) {
                      const v_y = _a316[_i317];
                      if (!((v_R.includes(opp(sp, v_y, cl.dot.at[v_p]))))) {
                        _q314 = false;
                        break Q315;
                      }
                    }
                  }
                  _c318 = _q314;
                }
                if (_c318) {
                  _q297 = true;
                  break Q298;
                }
              }
            }
            if (!(_q297)) {
              _q295 = false;
              break Q296;
            }
          }
          _c319 = !(_q295);
        }
        const _g320: number[] = [];
        G321: {
          const _a347 = near(sp, cl, v_c);
          for (let _i348 = 0; _i348 < _a347.length; _i348++) {
            const v_q = _a347[_i348];
            const _t349 = opp(sp, v_c, cl.dot.at[v_q]);
            let _q350 = true;
            Q351: {
              const v_R = through(sp, _t349, v_O);
              let _q352 = false;
              Q353: {
                for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                  let _c358: boolean = (v_R.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
                  if (_c358) {
                    let _q354 = true;
                    Q355: {
                      const _a356 = sp.centerCells[cl.dot.at[v_p]];
                      for (let _i357 = 0; _i357 < _a356.length; _i357++) {
                        const v_c = _a356[_i357];
                        if (!((v_R.includes(v_c)))) {
                          _q354 = false;
                          break Q355;
                        }
                      }
                    }
                    _c358 = _q354;
                  }
                  let _c366: boolean = _c358;
                  if (_c366) {
                    let _q359 = true;
                    Q360: {
                      for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                        let _c365: boolean = (v_r === v_p);
                        if (!_c365) {
                          let _q361 = true;
                          Q362: {
                            const _a363 = sp.centerCells[cl.dot.at[v_r]];
                            for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                              const v_c = _a363[_i364];
                              if (!(!(v_R.includes(v_c)))) {
                                _q361 = false;
                                break Q362;
                              }
                            }
                          }
                          _c365 = _q361;
                        }
                        if (!(_c365)) {
                          _q359 = false;
                          break Q360;
                        }
                      }
                    }
                    _c366 = _q359;
                  }
                  let _c371: boolean = _c366;
                  if (_c371) {
                    let _q367 = true;
                    Q368: {
                      const _a369 = v_R;
                      for (let _i370 = 0; _i370 < _a369.length; _i370++) {
                        const v_y = _a369[_i370];
                        if (!((v_R.includes(opp(sp, v_y, cl.dot.at[v_p]))))) {
                          _q367 = false;
                          break Q368;
                        }
                      }
                    }
                    _c371 = _q367;
                  }
                  if (_c371) {
                    _q352 = true;
                    break Q353;
                  }
                }
              }
              if (!(_q352)) {
                _q350 = false;
                break Q351;
              }
            }
            if (!(!(_q350))) continue;
            _g320.push(v_q);
          }
        }
        freshBinding("soleOwner", [sameSet(v_O, _g289), (sp.cells.includes(v_c)), _c319, sameSet(v_K, _g320), (v_K.length < 2)], ["O =", "c in", "where of c", "K =", "where of K"]);
      }
      facts.length = 0;
      changed = false;
      let _c380: boolean = (_h282 > 0);
      if (_c380) {
        let _q372 = true;
        Q373: {
          const _a374 = v_K;
          for (let _i375 = 0; _i375 < _a374.length; _i375++) {
            const v_q = _a374[_i375];
            let _mk376 = v_c >= 0;
            if (_mk376) { const _was = b.markOf(v_c); if (_was >= 0) _mk376 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c379: boolean = _mk376;
            if (_c379) {
              const _t377 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk378 = _t377 >= 0;
              if (_mk378) { const _was = b.markOf(_t377); if (_was >= 0) _mk378 = _was === v_q; else if (fire === null) { b.markAt(_t377, v_q); changed = true; } else facts.push(MARK, _t377, v_q); }
              _c379 = _mk378;
            }
            if (!(_c379)) {
              _q372 = false;
              break Q373;
            }
          }
        }
        _c380 = _q372;
      }
      if (!(_c380)) return -1;
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
  const _g408: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _k412 = nearKept.board(cl);
  const _a406 = sp.cells;
  for (let _i407 = 0; _i407 < _a406.length; _i407++) {
    const v_c = _a406[_i407];
    if (!((b.markOf(v_c) === -1))) continue;
    _g408.length = 0;
    G409: {
      const _a413 = (_k412[v_c] ?? near(sp, cl, v_c));
      for (let _i414 = 0; _i414 < _a413.length; _i414++) {
        const v_q = _a413[_i414];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g408.push(v_q);
      }
    }
    L415: {
      const v_K = _g408;
      const _h416 = v_K.length;
      if (!((_h416 < 2))) break L415;
      if (import.meta.env.DEV && staleChecking) {
        const _g417: number[] = [];
        G418: {
          const _a421 = near(sp, cl, v_c);
          for (let _i422 = 0; _i422 < _a421.length; _i422++) {
            const v_q = _a421[_i422];
            if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
            _g417.push(v_q);
          }
        }
        freshBinding("onlyReach", [(sp.cells.includes(v_c)), (b.markOf(v_c) === -1), sameSet(v_K, _g417), (v_K.length < 2)], ["c in", "where of c", "K =", "where of K"]);
      }
      facts.length = 0;
      changed = false;
      let _c431: boolean = (_h416 > 0);
      if (_c431) {
        let _q423 = true;
        Q424: {
          const _a425 = v_K;
          for (let _i426 = 0; _i426 < _a425.length; _i426++) {
            const v_q = _a425[_i426];
            let _mk427 = v_c >= 0;
            if (_mk427) { const _was = b.markOf(v_c); if (_was >= 0) _mk427 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c430: boolean = _mk427;
            if (_c430) {
              const _t428 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk429 = _t428 >= 0;
              if (_mk429) { const _was = b.markOf(_t428); if (_was >= 0) _mk429 = _was === v_q; else if (fire === null) { b.markAt(_t428, v_q); changed = true; } else facts.push(MARK, _t428, v_q); }
              _c430 = _mk429;
            }
            if (!(_c430)) {
              _q423 = false;
              break Q424;
            }
          }
        }
        _c431 = _q423;
      }
      if (!(_c431)) return -1;
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
const _st459 = stamps();

/** Its dearest read grows with the board as n^2. */
export function exclave(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExclaveBinding> | null): number {
  const _g453: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a448 = sp.cells;
  for (let _i449 = 0; _i449 < _a448.length; _i449++) {
    const v_c = _a448[_i449];
    L450: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L450;
      const _h484 = cl.dot.at[v_q];
      L452: {
        const v_G = throughWhere(sp, v_c, (_te451: number): boolean => {  return ((((b.grid[_te451] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te451]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te451 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L452;
        _g453.length = 0;
        _st459.pass++;
        G454: {
          const _a460 = v_G;
          for (let _i461 = 0; _i461 < _a460.length; _i461++) {
            const v_x = _a460[_i461];
            const _a462 = sp.adj4[v_x];
            for (let _i463 = 0; _i463 < _a462.length; _i463++) {
              const v_n = _a462[_i463];
              const _h464 = (b.grid[sp.adj4Edges[v_x][_i463]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h464 !== 1)))) continue;
              const _t465 = v_n;
              if (_g453.length < 16) { if (!_g453.includes(_t465)) _g453.push(_t465); } else addOnce(_g453, _st459, _t465);
            }
          }
        }
        L466: {
          const v_L = _g453;
          const _h467 = v_L.length;
          if (!((_h467 < 2))) break L466;
          if (import.meta.env.DEV && staleChecking) {
            const _g469: number[] = [];
            G470: {
              const _a475 = v_G;
              for (let _i476 = 0; _i476 < _a475.length; _i476++) {
                const v_x = _a475[_i476];
                const _a477 = sp.adj4[v_x];
                for (let _i478 = 0; _i478 < _a477.length; _i478++) {
                  const v_n = _a477[_i478];
                  if (!(((b.markOf(v_n) === -1) && ((b.grid[sp.adj4Edges[v_x][_i478]] || -1) !== 1)))) continue;
                  if (!_g469.includes(v_n)) _g469.push(v_n);
                }
              }
            }
            freshBinding("exclave", [(sp.cells.includes(v_c)), (v_q === b.markOf(v_c)), (v_q !== -1), sameSet(v_G, throughWhere(sp, v_c, (_te468: number): boolean => {  return ((((b.grid[_te468] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te468]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te468 + 1]) === v_q)); })), (((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))), sameSet(v_L, _g469), (v_L.length < 2)], ["c in", "q =", "where of q", "G =", "where of G", "L =", "where of L"]);
          }
          facts.length = 0;
          changed = false;
          let _c488: boolean = (_h467 > 0);
          if (_c488) {
            let _q479 = true;
            Q480: {
              const _a481 = v_L;
              for (let _i482 = 0; _i482 < _a481.length; _i482++) {
                const v_l = _a481[_i482];
                let _mk483 = v_l >= 0;
                if (_mk483) { const _was = b.markOf(v_l); if (_was >= 0) _mk483 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c487: boolean = _mk483;
                if (_c487) {
                  const _t485 = opp(sp, v_l, _h484);
                  let _mk486 = _t485 >= 0;
                  if (_mk486) { const _was = b.markOf(_t485); if (_was >= 0) _mk486 = _was === v_q; else if (fire === null) { b.markAt(_t485, v_q); changed = true; } else facts.push(MARK, _t485, v_q); }
                  _c487 = _mk486;
                }
                if (!(_c487)) {
                  _q479 = false;
                  break Q480;
                }
              }
            }
            _c488 = _q479;
          }
          if (!(_c488)) return -1;
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
  const _a497 = sp.edges;
  R1:
  for (let _i498 = 0; _i498 < _a497.length; _i498++) {
    const v_e = _a497[_i498];
    const _m146_0 = b.made[0];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _t499 = sp.edgeEnds[2 * v_e];
    const _t500 = sp.edgeEnds[2 * v_e + 1];
    for (let _i501 = 0; _i501 < 2; _i501++) {
      const v_a = _i501 === 0 ? _t499 : _t500;
      if (_i501 === 1 && (v_a === _t499)) continue;
      L502: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L502;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L503: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L503;
          L504: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L504;
            if (b.made[0] !== _m146_0) {
              if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              freshBinding("mirrorWall", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), ((v_a === sp.edgeEnds[2 * v_e]) || (v_a === sp.edgeEnds[2 * v_e + 1])), (v_q === b.markOf(v_a)), (v_q !== -1), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_a2 === opp(sp, v_a, cl.dot.at[v_q])), (v_a2 !== -1), (v_b2 === opp(sp, v_b, cl.dot.at[v_q])), ((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1))], ["e in", "where of e", "a in", "q =", "where of q", "b =", "a2 =", "where of a2", "b2 =", "where of b2"]);
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
  const _g129: number[] = [];
  G130: {
    for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
      if (!((sp.centerCells[cl.dot.at[v_p]].includes(v_x)))) continue;
      _g129.push(v_p);
    }
  }
  const _made = _g129;
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
  let _c133: boolean = (opp(sp, v_x, cl.dot.at[v_q]) !== -1);
  if (_c133) {
    let _q127 = true;
    Q128: {
      const _a131 = under(sp, cl, v_x);
      for (let _i132 = 0; _i132 < _a131.length; _i132++) {
        const v_p = _a131[_i132];
        if (!((v_p === v_q))) {
          _q127 = false;
          break Q128;
        }
      }
    }
    _c133 = _q127;
  }
  let _c138: boolean = _c133;
  if (_c138) {
    let _q134 = true;
    Q135: {
      const _a136 = under(sp, cl, opp(sp, v_x, cl.dot.at[v_q]));
      for (let _i137 = 0; _i137 < _a136.length; _i137++) {
        const v_p = _a136[_i137];
        if (!((v_p === v_q))) {
          _q134 = false;
          break Q135;
        }
      }
    }
    _c138 = _q134;
  }
  const _made = _c138;
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
  const _made = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te126: number): boolean => {  return (free(sp, cl, sp.edgeEnds[2 * _te126], v_q) && free(sp, cl, sp.edgeEnds[2 * _te126 + 1], v_q)); });
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
  const _g124: number[] = [];
  G125: {
    for (let v_q = 0; v_q < cl.dot.at.length; v_q++) {
      if (!((room(sp, cl, v_q).includes(v_c)))) continue;
      _g124.push(v_q);
    }
  }
  const _made = _g124;
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
  const _g387: number[] = [];
  G388: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te396: number): boolean => { let _c398: boolean = ((b.grid[_te396] || -1) !== 1); if (_c398) {   const _t397 = sp.edgeEnds[2 * _te396];   _c398 = (((opp(sp, _t397, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t397) === -1) || (b.markOf(_t397) === v_q))) && ((b.markOf(opp(sp, _t397, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t397, cl.dot.at[v_q])) === v_q))); } let _c400: boolean = _c398; if (_c400) {   const _t399 = sp.edgeEnds[2 * _te396 + 1];   _c400 = (((opp(sp, _t399, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t399) === -1) || (b.markOf(_t399) === v_q))) && ((b.markOf(opp(sp, _t399, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t399, cl.dot.at[v_q])) === v_q))); } return _c400; });
    const _a401 = v_T;
    for (let _i402 = 0; _i402 < _a401.length; _i402++) {
      const v_x = _a401[_i402];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g387.includes(v_x)) _g387.push(v_x);
    }
  }
  const _made = _g387;
  _kept[v_q] = _made;
  return _made;
}
