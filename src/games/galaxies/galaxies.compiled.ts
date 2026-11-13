// Compiled by `npm run describe` from src/games/galaxies/galaxies.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, MARK, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptEdgeGroups, keptStore, opp, rangeMask, sameSet, staleChecking, stamps, through, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  dotTile: DotTileSays;
  separate: SeparateSays;
  enclosed: EnclosedSays;
  soleOwner: SoleOwnerSays;
  onlyReach: OnlyReachSays;
  exclave: ExclaveSays;
  mirrorWall: MirrorWallSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["dotTile","separate","enclosed","soleOwner","onlyReach","exclave","mirrorWall"] as const;

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
  const _g3: number[] = [];
  const _g16: number[] = [];
  const _g36: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    _g3.length = 0;
    G4: {
      const _a7 = sp.edges;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_e = _a7[_i8];
        const _h9 = (g[v_e] || -1);
        if (!((_h9 === 2))) continue;
        _g3.push(v_e);
      }
    }
    const v_O = _g3;
    const _eg13 = edgeGroups(sp, v_O);
    const _a10 = sp.edges;
    for (let _i11 = 0; _i11 < _a10.length; _i11++) {
      const v_e = _a10[_i11];
      const _h12 = (g[v_e] || -1);
      if (!(((_h12 === 1) === !(_eg13.of(sp.edgeEnds[2 * v_e + 1]) === _eg13.of(sp.edgeEnds[2 * v_e]))))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q14 = true;
  Q15: {
    _g16.length = 0;
    G17: {
      const _a20 = sp.edges;
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_e = _a20[_i21];
        const _h22 = (g[v_e] || -1);
        if (!((_h22 === 2))) continue;
        _g16.push(v_e);
      }
    }
    const v_O = _g16;
    const _eg30 = edgeGroups(sp, v_O);
    const _a23 = sp.cells;
    for (let _i24 = 0; _i24 < _a23.length; _i24++) {
      const v_c = _a23[_i24];
      let _g25 = 0;
      G26: {
        const _a27 = sp.centers;
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_p = _a27[_i28];
          const _h29 = clueAt(cl.dot, v_p);
          if (!(((_h29 !== -1) && (_eg30.of((sp.centerCells[v_p][0] ?? -1)) === _eg30.of(v_c))))) continue;
          _g25++;
        }
      }
      if (!((_g25 === 1))) {
        _q14 = false;
        break Q15;
      }
    }
  }
  if (!(_q14)) return false;
  for (let _k31 = 0; _k31 < cl.dot.at.length; _k31++) {
    const _at32 = cl.dot.at[_k31];
    let _q34 = true;
    Q35: {
      _g36.length = 0;
      G37: {
        const _a40 = sp.edges;
        for (let _i41 = 0; _i41 < _a40.length; _i41++) {
          const v_e = _a40[_i41];
          const _h42 = (g[v_e] || -1);
          if (!((_h42 === 2))) continue;
          _g36.push(v_e);
        }
      }
      const v_O = _g36;
      const _eg43 = edgeGroups(sp, v_O);
      const v_R = _eg43.of((sp.centerCells[_at32][0] ?? -1));
      let _q44 = true;
      Q45: {
        const _a46 = sp.centerCells[_at32];
        for (let _i47 = 0; _i47 < _a46.length; _i47++) {
          const v_c = _a46[_i47];
          if (!((_eg43.of(v_c) === v_R))) {
            _q44 = false;
            break Q45;
          }
        }
      }
      let _c52: boolean = _q44;
      if (_c52) {
        let _q48 = true;
        Q49: {
          const _a50 = v_R;
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_c = _a50[_i51];
            if (!((_eg43.of(opp(sp, v_c, _at32)) === v_R))) {
              _q48 = false;
              break Q49;
            }
          }
        }
        _c52 = _q48;
      }
      if (!(_c52)) {
        _q34 = false;
        break Q35;
      }
    }
    if (!(_q34)) return false;
  }
  return true;
}

export interface DotTileBinding {
  q: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface DotTileSays {
  terms: { q: number; };
  marks: {  };
}

const dotTileFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function dotTile(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DotTileBinding, DotTileSays> | null): number {
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
    if (DEV && staleChecking) {
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
      if (fire !== null) {
        const _says = { terms: { q: v_q }, marks: {  } };
        if (!fire({ q: v_q }, facts, _says)) return 1;
      }
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
  const _a4 = sp.edges;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_e = _a4[_i5];
    const _h6 = (b.grid[v_e] || -1);
    if (!((_h6 === 1))) continue;
    L7: {
      const v_q = b.markOf(sp.edgeEnds[2 * v_e]);
      if (!((v_q !== -1))) break L7;
      if (DEV && staleChecking) {
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SeparateSays {
  terms: { e: number; p: number; q: number; };
  marks: {  };
}

const separateFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function separate(b: Marks, sp: GridSpace, fire: Fire<SeparateBinding, SeparateSays> | null): number {
  const facts = separateFacts;
  let fired = 0;
  let changed = false;
  const _a5 = sp.edges;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_e = _a5[_i6];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L7: {
      const v_p = b.markOf(sp.edgeEnds[2 * v_e]);
      if (!((v_p !== -1))) break L7;
      L8: {
        const v_q = b.markOf(sp.edgeEnds[2 * v_e + 1]);
        if (!(((v_q !== -1) && (v_q !== v_p)))) break L8;
        if (DEV && staleChecking) {
          freshBinding("separate", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), (v_p === b.markOf(sp.edgeEnds[2 * v_e])), (v_p !== -1), (v_q === b.markOf(sp.edgeEnds[2 * v_e + 1])), ((v_q !== -1) && (v_q !== v_p))], ["e in", "where of e", "p =", "where of p", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { e: v_e, p: v_p, q: v_q }, marks: {  } };
            if (!fire({ e: v_e, p: v_p, q: v_q }, facts, _says)) return 1;
          }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface EnclosedSays {
  terms: { c: number; N: readonly number[]; q: number; };
  marks: {  };
}

const enclosedFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function enclosed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EnclosedBinding, EnclosedSays> | null): number {
  const _g21: number[] = [];
  const facts = enclosedFacts;
  let fired = 0;
  let changed = false;
  const _a19 = sp.cells;
  for (let _i20 = 0; _i20 < _a19.length; _i20++) {
    const v_c = _a19[_i20];
    if (!((b.markOf(v_c) === -1))) continue;
    _g21.length = 0;
    G22: {
      const _a25 = sp.adj4[v_c];
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_n = _a25[_i26];
        const _h27 = (b.grid[sp.adj4Edges[v_c][_i26]] || -1);
        if (!((_h27 !== 1))) continue;
        _g21.push(v_n);
      }
    }
    L28: {
      const v_N = _g21;
      const _h29 = v_N.length;
      if (!((_h29 > 0))) break L28;
      L30: {
        const v_q = b.markOf((v_N[0] ?? -1));
        let _c35: boolean = (v_q !== -1);
        if (_c35) {
          let _q31 = true;
          Q32: {
            const _a33 = v_N;
            for (let _i34 = 0; _i34 < _a33.length; _i34++) {
              const v_n = _a33[_i34];
              if (!((b.markOf(v_n) === v_q))) {
                _q31 = false;
                break Q32;
              }
            }
          }
          _c35 = _q31;
        }
        let _c38: boolean = _c35;
        if (_c38) {
          let _q36 = false;
          Q37: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              if ((opp(sp, v_c, cl.dot.at[v_p]) === v_c)) {
                _q36 = true;
                break Q37;
              }
            }
          }
          _c38 = !(_q36);
        }
        if (!(_c38)) break L30;
        if (DEV && staleChecking) {
          const _g39: number[] = [];
          G40: {
            const _a43 = sp.adj4[v_c];
            for (let _i44 = 0; _i44 < _a43.length; _i44++) {
              const v_n = _a43[_i44];
              if (!(((b.grid[sp.adj4Edges[v_c][_i44]] || -1) !== 1))) continue;
              _g39.push(v_n);
            }
          }
          let _c49: boolean = (v_q !== -1);
          if (_c49) {
            let _q45 = true;
            Q46: {
              const _a47 = v_N;
              for (let _i48 = 0; _i48 < _a47.length; _i48++) {
                const v_n = _a47[_i48];
                if (!((b.markOf(v_n) === v_q))) {
                  _q45 = false;
                  break Q46;
                }
              }
            }
            _c49 = _q45;
          }
          let _c52: boolean = _c49;
          if (_c52) {
            let _q50 = false;
            Q51: {
              for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                if ((opp(sp, v_c, cl.dot.at[v_p]) === v_c)) {
                  _q50 = true;
                  break Q51;
                }
              }
            }
            _c52 = !(_q50);
          }
          freshBinding("enclosed", [(sp.cells.includes(v_c)), (b.markOf(v_c) === -1), sameSet(v_N, _g39), (v_N.length > 0), (v_q === b.markOf((v_N[0] ?? -1))), _c52], ["c in", "where of c", "N =", "where of N", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        let _mk53 = v_c >= 0;
        if (_mk53) { const _was = b.markOf(v_c); if (_was >= 0) _mk53 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
        let _c56: boolean = _mk53;
        if (_c56) {
          const _t54 = opp(sp, v_c, cl.dot.at[v_q]);
          let _mk55 = _t54 >= 0;
          if (_mk55) { const _was = b.markOf(_t54); if (_was >= 0) _mk55 = _was === v_q; else if (fire === null) { b.markAt(_t54, v_q); changed = true; } else facts.push(MARK, _t54, v_q); }
          _c56 = _mk55;
        }
        if (!(_c56)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c, N: v_N.slice(), q: v_q }, marks: {  } };
            if (!fire({ c: v_c, N: v_N.slice(), q: v_q }, facts, _says)) return 1;
          }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SoleOwnerSays {
  terms: { c: number; K: readonly number[]; };
  marks: {  };
}

const soleOwnerFacts: number[] = [];

/** Its dearest read grows with the board as n^3. */
export function soleOwner(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SoleOwnerBinding, SoleOwnerSays> | null): number {
  const _g87: number[] = [];
  const _g124: number[] = [];
  const _g180: number[] = [];
  const facts = soleOwnerFacts;
  let fired = 0;
  let changed = false;
  const _k151 = nearKept.board(cl);
  const _m278_0 = b.made[0];
  _g87.length = 0;
  G88: {
    const _a91 = sp.edges;
    for (let _i92 = 0; _i92 < _a91.length; _i92++) {
      const v_e = _a91[_i92];
      const _h93 = (b.grid[v_e] || -1);
      if (!((_h93 !== 1))) continue;
      _g87.push(v_e);
    }
  }
  const v_O = _g87;
  const _m279_1 = b.made[1];
  const _m280_3 = b.made[3];
  const _eg96 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _memo98 = new Map<readonly number[], boolean>();
  const _a94 = sp.cells;
  for (let _i95 = 0; _i95 < _a94.length; _i95++) {
    const v_c = _a94[_i95];
    let _c123: boolean = (b.markOf(v_c) === -1);
    if (_c123) {
      const _t97 = _eg96.of(v_c);
      let _gq99 = _memo98.get(_t97);
      if (_gq99 === undefined) {
        let _q100 = false;
        Q101: {
          for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
            const _h121 = cl.dot.at[v_p];
            let _c107: boolean = (_t97.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
            if (_c107) {
              let _q102 = true;
              Q103: {
                const _a105 = sp.centerCells[cl.dot.at[v_p]];
                for (let _i106 = 0; _i106 < _a105.length; _i106++) {
                  const v_c_104 = _a105[_i106];
                  if (!((_t97.includes(v_c_104)))) {
                    _q102 = false;
                    break Q103;
                  }
                }
              }
              _c107 = _q102;
            }
            let _c116: boolean = _c107;
            if (_c116) {
              let _q108 = true;
              Q109: {
                for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                  let _c115: boolean = (v_r === v_p);
                  if (!_c115) {
                    let _q110 = true;
                    Q111: {
                      const _a113 = sp.centerCells[cl.dot.at[v_r]];
                      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
                        const v_c_112 = _a113[_i114];
                        if (!(!(_t97.includes(v_c_112)))) {
                          _q110 = false;
                          break Q111;
                        }
                      }
                    }
                    _c115 = _q110;
                  }
                  if (!(_c115)) {
                    _q108 = false;
                    break Q109;
                  }
                }
              }
              _c116 = _q108;
            }
            let _c122: boolean = _c116;
            if (_c122) {
              let _q117 = true;
              Q118: {
                const _a119 = _t97;
                for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                  const v_y = _a119[_i120];
                  if (!((_t97.includes(opp(sp, v_y, _h121))))) {
                    _q117 = false;
                    break Q118;
                  }
                }
              }
              _c122 = _q117;
            }
            if (_c122) {
              _q100 = true;
              break Q101;
            }
          }
        }
        _gq99 = _q100;
        _memo98.set(_t97, _gq99);
      }
      _c123 = !(_gq99);
    }
    if (!(_c123)) continue;
    _g124.length = 0;
    G125: {
      const _a152 = (_k151[v_c] ?? near(sp, cl, v_c));
      for (let _i153 = 0; _i153 < _a152.length; _i153++) {
        const v_q = _a152[_i153];
        const _t154 = opp(sp, v_c, cl.dot.at[v_q]);
        const _t155 = _eg96.of(_t154);
        let _gq156 = _memo98.get(_t155);
        if (_gq156 === undefined) {
          let _q157 = false;
          Q158: {
            for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
              const _h176 = cl.dot.at[v_p];
              let _c163: boolean = (_t155.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
              if (_c163) {
                let _q159 = true;
                Q160: {
                  const _a161 = sp.centerCells[cl.dot.at[v_p]];
                  for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                    const v_c = _a161[_i162];
                    if (!((_t155.includes(v_c)))) {
                      _q159 = false;
                      break Q160;
                    }
                  }
                }
                _c163 = _q159;
              }
              let _c171: boolean = _c163;
              if (_c171) {
                let _q164 = true;
                Q165: {
                  for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                    let _c170: boolean = (v_r === v_p);
                    if (!_c170) {
                      let _q166 = true;
                      Q167: {
                        const _a168 = sp.centerCells[cl.dot.at[v_r]];
                        for (let _i169 = 0; _i169 < _a168.length; _i169++) {
                          const v_c = _a168[_i169];
                          if (!(!(_t155.includes(v_c)))) {
                            _q166 = false;
                            break Q167;
                          }
                        }
                      }
                      _c170 = _q166;
                    }
                    if (!(_c170)) {
                      _q164 = false;
                      break Q165;
                    }
                  }
                }
                _c171 = _q164;
              }
              let _c177: boolean = _c171;
              if (_c177) {
                let _q172 = true;
                Q173: {
                  const _a174 = _t155;
                  for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                    const v_y = _a174[_i175];
                    if (!((_t155.includes(opp(sp, v_y, _h176))))) {
                      _q172 = false;
                      break Q173;
                    }
                  }
                }
                _c177 = _q172;
              }
              if (_c177) {
                _q157 = true;
                break Q158;
              }
            }
          }
          _gq156 = _q157;
          _memo98.set(_t155, _gq156);
        }
        if (!(!(_gq156))) continue;
        _g124.push(v_q);
      }
    }
    L178: {
      const v_K = _g124;
      const _h179 = v_K.length;
      if (!((_h179 < 2))) break L178;
      if (b.made[0] !== _m278_0 || b.made[1] !== _m279_1 || b.made[3] !== _m280_3) {
        _g180.length = 0;
        G181: {
          const _a184 = sp.edges;
          for (let _i185 = 0; _i185 < _a184.length; _i185++) {
            const v_e = _a184[_i185];
            if (!(((b.grid[v_e] || -1) !== 1))) continue;
            _g180.push(v_e);
          }
        }
        if (!(sameSet(v_O, _g180))) { return fired; }
      }
      if (DEV && staleChecking) {
        const _g186: number[] = [];
        G187: {
          const _a190 = sp.edges;
          for (let _i191 = 0; _i191 < _a190.length; _i191++) {
            const v_e = _a190[_i191];
            if (!(((b.grid[v_e] || -1) !== 1))) continue;
            _g186.push(v_e);
          }
        }
        let _c216: boolean = (b.markOf(v_c) === -1);
        if (_c216) {
          let _q192 = true;
          Q193: {
            const v_R = through(sp, v_c, v_O);
            let _q194 = false;
            Q195: {
              for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                let _c201: boolean = (v_R.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
                if (_c201) {
                  let _q196 = true;
                  Q197: {
                    const _a199 = sp.centerCells[cl.dot.at[v_p]];
                    for (let _i200 = 0; _i200 < _a199.length; _i200++) {
                      const v_c_198 = _a199[_i200];
                      if (!((v_R.includes(v_c_198)))) {
                        _q196 = false;
                        break Q197;
                      }
                    }
                  }
                  _c201 = _q196;
                }
                let _c210: boolean = _c201;
                if (_c210) {
                  let _q202 = true;
                  Q203: {
                    for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                      let _c209: boolean = (v_r === v_p);
                      if (!_c209) {
                        let _q204 = true;
                        Q205: {
                          const _a207 = sp.centerCells[cl.dot.at[v_r]];
                          for (let _i208 = 0; _i208 < _a207.length; _i208++) {
                            const v_c_206 = _a207[_i208];
                            if (!(!(v_R.includes(v_c_206)))) {
                              _q204 = false;
                              break Q205;
                            }
                          }
                        }
                        _c209 = _q204;
                      }
                      if (!(_c209)) {
                        _q202 = false;
                        break Q203;
                      }
                    }
                  }
                  _c210 = _q202;
                }
                let _c215: boolean = _c210;
                if (_c215) {
                  let _q211 = true;
                  Q212: {
                    const _a213 = v_R;
                    for (let _i214 = 0; _i214 < _a213.length; _i214++) {
                      const v_y = _a213[_i214];
                      if (!((v_R.includes(opp(sp, v_y, cl.dot.at[v_p]))))) {
                        _q211 = false;
                        break Q212;
                      }
                    }
                  }
                  _c215 = _q211;
                }
                if (_c215) {
                  _q194 = true;
                  break Q195;
                }
              }
            }
            if (!(_q194)) {
              _q192 = false;
              break Q193;
            }
          }
          _c216 = !(_q192);
        }
        const _g217: number[] = [];
        G218: {
          const _a244 = near(sp, cl, v_c);
          for (let _i245 = 0; _i245 < _a244.length; _i245++) {
            const v_q = _a244[_i245];
            const _t246 = opp(sp, v_c, cl.dot.at[v_q]);
            let _q247 = true;
            Q248: {
              const v_R = through(sp, _t246, v_O);
              let _q249 = false;
              Q250: {
                for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
                  let _c255: boolean = (v_R.includes((sp.centerCells[cl.dot.at[v_p]][0] ?? -1)));
                  if (_c255) {
                    let _q251 = true;
                    Q252: {
                      const _a253 = sp.centerCells[cl.dot.at[v_p]];
                      for (let _i254 = 0; _i254 < _a253.length; _i254++) {
                        const v_c = _a253[_i254];
                        if (!((v_R.includes(v_c)))) {
                          _q251 = false;
                          break Q252;
                        }
                      }
                    }
                    _c255 = _q251;
                  }
                  let _c263: boolean = _c255;
                  if (_c263) {
                    let _q256 = true;
                    Q257: {
                      for (let v_r = 0; v_r < cl.dot.at.length; v_r++) {
                        let _c262: boolean = (v_r === v_p);
                        if (!_c262) {
                          let _q258 = true;
                          Q259: {
                            const _a260 = sp.centerCells[cl.dot.at[v_r]];
                            for (let _i261 = 0; _i261 < _a260.length; _i261++) {
                              const v_c = _a260[_i261];
                              if (!(!(v_R.includes(v_c)))) {
                                _q258 = false;
                                break Q259;
                              }
                            }
                          }
                          _c262 = _q258;
                        }
                        if (!(_c262)) {
                          _q256 = false;
                          break Q257;
                        }
                      }
                    }
                    _c263 = _q256;
                  }
                  let _c268: boolean = _c263;
                  if (_c268) {
                    let _q264 = true;
                    Q265: {
                      const _a266 = v_R;
                      for (let _i267 = 0; _i267 < _a266.length; _i267++) {
                        const v_y = _a266[_i267];
                        if (!((v_R.includes(opp(sp, v_y, cl.dot.at[v_p]))))) {
                          _q264 = false;
                          break Q265;
                        }
                      }
                    }
                    _c268 = _q264;
                  }
                  if (_c268) {
                    _q249 = true;
                    break Q250;
                  }
                }
              }
              if (!(_q249)) {
                _q247 = false;
                break Q248;
              }
            }
            if (!(!(_q247))) continue;
            _g217.push(v_q);
          }
        }
        freshBinding("soleOwner", [sameSet(v_O, _g186), (sp.cells.includes(v_c)), _c216, sameSet(v_K, _g217), (v_K.length < 2)], ["O =", "c in", "where of c", "K =", "where of K"]);
      }
      facts.length = 0;
      changed = false;
      let _c277: boolean = (_h179 > 0);
      if (_c277) {
        let _q269 = true;
        Q270: {
          const _a271 = v_K;
          for (let _i272 = 0; _i272 < _a271.length; _i272++) {
            const v_q = _a271[_i272];
            let _mk273 = v_c >= 0;
            if (_mk273) { const _was = b.markOf(v_c); if (_was >= 0) _mk273 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c276: boolean = _mk273;
            if (_c276) {
              const _t274 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk275 = _t274 >= 0;
              if (_mk275) { const _was = b.markOf(_t274); if (_was >= 0) _mk275 = _was === v_q; else if (fire === null) { b.markAt(_t274, v_q); changed = true; } else facts.push(MARK, _t274, v_q); }
              _c276 = _mk275;
            }
            if (!(_c276)) {
              _q269 = false;
              break Q270;
            }
          }
        }
        _c277 = _q269;
      }
      if (!(_c277)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { c: v_c, K: v_K.slice() }, marks: {  } };
          if (!fire({ O: v_O.slice(), c: v_c, K: v_K.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface OnlyReachBinding {
  c: number;
  K: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface OnlyReachSays {
  terms: { c: number; K: readonly number[]; };
  marks: {  };
}

const onlyReachFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyReach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyReachBinding, OnlyReachSays> | null): number {
  const _g12: number[] = [];
  const facts = onlyReachFacts;
  let fired = 0;
  let changed = false;
  const _k16 = nearKept.board(cl);
  const _a10 = sp.cells;
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_c = _a10[_i11];
    if (!((b.markOf(v_c) === -1))) continue;
    _g12.length = 0;
    G13: {
      const _a17 = (_k16[v_c] ?? near(sp, cl, v_c));
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_q = _a17[_i18];
        if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
        _g12.push(v_q);
      }
    }
    L19: {
      const v_K = _g12;
      const _h20 = v_K.length;
      if (!((_h20 < 2))) break L19;
      if (DEV && staleChecking) {
        const _g21: number[] = [];
        G22: {
          const _a25 = near(sp, cl, v_c);
          for (let _i26 = 0; _i26 < _a25.length; _i26++) {
            const v_q = _a25[_i26];
            if (!((reach(b, sp, cl, v_q).includes(v_c)))) continue;
            _g21.push(v_q);
          }
        }
        freshBinding("onlyReach", [(sp.cells.includes(v_c)), (b.markOf(v_c) === -1), sameSet(v_K, _g21), (v_K.length < 2)], ["c in", "where of c", "K =", "where of K"]);
      }
      facts.length = 0;
      changed = false;
      let _c35: boolean = (_h20 > 0);
      if (_c35) {
        let _q27 = true;
        Q28: {
          const _a29 = v_K;
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_q = _a29[_i30];
            let _mk31 = v_c >= 0;
            if (_mk31) { const _was = b.markOf(v_c); if (_was >= 0) _mk31 = _was === v_q; else if (fire === null) { b.markAt(v_c, v_q); changed = true; } else facts.push(MARK, v_c, v_q); }
            let _c34: boolean = _mk31;
            if (_c34) {
              const _t32 = opp(sp, v_c, cl.dot.at[v_q]);
              let _mk33 = _t32 >= 0;
              if (_mk33) { const _was = b.markOf(_t32); if (_was >= 0) _mk33 = _was === v_q; else if (fire === null) { b.markAt(_t32, v_q); changed = true; } else facts.push(MARK, _t32, v_q); }
              _c34 = _mk33;
            }
            if (!(_c34)) {
              _q27 = false;
              break Q28;
            }
          }
        }
        _c35 = _q27;
      }
      if (!(_c35)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { c: v_c, K: v_K.slice() }, marks: {  } };
          if (!fire({ c: v_c, K: v_K.slice() }, facts, _says)) return 1;
        }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ExclaveSays {
  terms: { q: number; G: readonly number[]; L: readonly number[]; };
  marks: {  };
}

const exclaveFacts: number[] = [];
const exclave_st28 = stamps();

/** Its dearest read grows with the board as n^2. */
export function exclave(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExclaveBinding, ExclaveSays> | null): number {
  const _g22: number[] = [];
  const facts = exclaveFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.cells;
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_c = _a17[_i18];
    L19: {
      const v_q = b.markOf(v_c);
      if (!((v_q !== -1))) break L19;
      const _h53 = cl.dot.at[v_q];
      L21: {
        const v_G = throughWhere(sp, v_c, (_te20: number): boolean => {  return ((((b.grid[_te20] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te20]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te20 + 1]) === v_q)); });
        if (!((((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))))) break L21;
        _g22.length = 0;
        exclave_st28.pass++;
        G23: {
          const _a29 = v_G;
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_x = _a29[_i30];
            const _a31 = sp.adj4[v_x];
            for (let _i32 = 0; _i32 < _a31.length; _i32++) {
              const v_n = _a31[_i32];
              const _h33 = (b.grid[sp.adj4Edges[v_x][_i32]] || -1);
              if (!(((b.markOf(v_n) === -1) && (_h33 !== 1)))) continue;
              const _t34 = v_n;
              if (_g22.length < 16) { if (!_g22.includes(_t34)) _g22.push(_t34); } else addOnce(_g22, exclave_st28, _t34);
            }
          }
        }
        L35: {
          const v_L = _g22;
          const _h36 = v_L.length;
          if (!((_h36 < 2))) break L35;
          if (DEV && staleChecking) {
            const _g38: number[] = [];
            G39: {
              const _a44 = v_G;
              for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                const v_x = _a44[_i45];
                const _a46 = sp.adj4[v_x];
                for (let _i47 = 0; _i47 < _a46.length; _i47++) {
                  const v_n = _a46[_i47];
                  if (!(((b.markOf(v_n) === -1) && ((b.grid[sp.adj4Edges[v_x][_i47]] || -1) !== 1)))) continue;
                  if (!_g38.includes(v_n)) _g38.push(v_n);
                }
              }
            }
            freshBinding("exclave", [(sp.cells.includes(v_c)), (v_q === b.markOf(v_c)), (v_q !== -1), sameSet(v_G, throughWhere(sp, v_c, (_te37: number): boolean => {  return ((((b.grid[_te37] || -1) !== 1) && (b.markOf(sp.edgeEnds[2 * _te37]) === v_q)) && (b.markOf(sp.edgeEnds[2 * _te37 + 1]) === v_q)); })), (((v_G[0] ?? -1) === v_c) && !(v_G.includes((sp.centerCells[cl.dot.at[v_q]][0] ?? -1)))), sameSet(v_L, _g38), (v_L.length < 2)], ["c in", "q =", "where of q", "G =", "where of G", "L =", "where of L"]);
          }
          facts.length = 0;
          changed = false;
          let _c57: boolean = (_h36 > 0);
          if (_c57) {
            let _q48 = true;
            Q49: {
              const _a50 = v_L;
              for (let _i51 = 0; _i51 < _a50.length; _i51++) {
                const v_l = _a50[_i51];
                let _mk52 = v_l >= 0;
                if (_mk52) { const _was = b.markOf(v_l); if (_was >= 0) _mk52 = _was === v_q; else if (fire === null) { b.markAt(v_l, v_q); changed = true; } else facts.push(MARK, v_l, v_q); }
                let _c56: boolean = _mk52;
                if (_c56) {
                  const _t54 = opp(sp, v_l, _h53);
                  let _mk55 = _t54 >= 0;
                  if (_mk55) { const _was = b.markOf(_t54); if (_was >= 0) _mk55 = _was === v_q; else if (fire === null) { b.markAt(_t54, v_q); changed = true; } else facts.push(MARK, _t54, v_q); }
                  _c56 = _mk55;
                }
                if (!(_c56)) {
                  _q48 = false;
                  break Q49;
                }
              }
            }
            _c57 = _q48;
          }
          if (!(_c57)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              const _says = { terms: { q: v_q, G: v_G.slice(), L: v_L.slice() }, marks: {  } };
              if (!fire({ c: v_c, q: v_q, G: v_G.slice(), L: v_L.slice() }, facts, _says)) return 1;
            }
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface MirrorWallSays {
  terms: { e: number; a: number; q: number; a2: number; };
  marks: {  };
}

const mirrorWallFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function mirrorWall(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MirrorWallBinding, MirrorWallSays> | null): number {
  const facts = mirrorWallFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.edges;
  R1:
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_e = _a9[_i10];
    const _m17_0 = b.made[0];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const _t11 = sp.edgeEnds[2 * v_e];
    const _t12 = sp.edgeEnds[2 * v_e + 1];
    for (let _i13 = 0; _i13 < 2; _i13++) {
      const v_a = _i13 === 0 ? _t11 : _t12;
      if (_i13 === 1 && (v_a === _t11)) continue;
      L14: {
        const v_q = b.markOf(v_a);
        if (!((v_q !== -1))) break L14;
        const v_b = (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        L15: {
          const v_a2 = opp(sp, v_a, cl.dot.at[v_q]);
          if (!((v_a2 !== -1))) break L15;
          L16: {
            const v_b2 = opp(sp, v_b, cl.dot.at[v_q]);
            if (!(((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1)))) break L16;
            if (b.made[0] !== _m17_0) {
              if (!(!((b.grid[v_e] !== 0)))) { continue R1; }
            }
            if (DEV && staleChecking) {
              freshBinding("mirrorWall", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), ((v_a === sp.edgeEnds[2 * v_e]) || (v_a === sp.edgeEnds[2 * v_e + 1])), (v_q === b.markOf(v_a)), (v_q !== -1), (v_b === (sp.edgeEnds[2 * v_e] === v_a ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), (v_a2 === opp(sp, v_a, cl.dot.at[v_q])), (v_a2 !== -1), (v_b2 === opp(sp, v_b, cl.dot.at[v_q])), ((v_b2 === -1) || ((b.grid[sp.edgeOf(v_a2, v_b2)] || -1) === 1))], ["e in", "where of e", "a in", "q =", "where of q", "b =", "a2 =", "where of a2", "b2 =", "where of b2"]);
            }
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null) {
                const _says = { terms: { e: v_e, a: v_a, q: v_q, a2: v_a2 }, marks: {  } };
                if (!fire({ e: v_e, a: v_a, q: v_q, b: v_b, a2: v_a2, b2: v_b2 }, facts, _says)) return 1;
              }
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
  const _g1: number[] = [];
  G2: {
    for (let v_p = 0; v_p < cl.dot.at.length; v_p++) {
      if (!((sp.centerCells[cl.dot.at[v_p]].includes(v_x)))) continue;
      _g1.push(v_p);
    }
  }
  const _made = _g1;
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
  let _c5: boolean = (opp(sp, v_x, cl.dot.at[v_q]) !== -1);
  if (_c5) {
    let _q1 = true;
    Q2: {
      const _a3 = under(sp, cl, v_x);
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_p = _a3[_i4];
        if (!((v_p === v_q))) {
          _q1 = false;
          break Q2;
        }
      }
    }
    _c5 = _q1;
  }
  let _c10: boolean = _c5;
  if (_c10) {
    let _q6 = true;
    Q7: {
      const _a8 = under(sp, cl, opp(sp, v_x, cl.dot.at[v_q]));
      for (let _i9 = 0; _i9 < _a8.length; _i9++) {
        const v_p = _a8[_i9];
        if (!((v_p === v_q))) {
          _q6 = false;
          break Q7;
        }
      }
    }
    _c10 = _q6;
  }
  const _made = _c10;
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
  const _made = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te1: number): boolean => {  return (free(sp, cl, sp.edgeEnds[2 * _te1], v_q) && free(sp, cl, sp.edgeEnds[2 * _te1 + 1], v_q)); });
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
  const _g1: number[] = [];
  G2: {
    for (let v_q = 0; v_q < cl.dot.at.length; v_q++) {
      if (!((room(sp, cl, v_q).includes(v_c)))) continue;
      _g1.push(v_q);
    }
  }
  const _made = _g1;
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
  const _g1: number[] = [];
  G2: {
    const v_T = throughWhere(sp, (sp.centerCells[cl.dot.at[v_q]][0] ?? -1), (_te10: number): boolean => { let _c12: boolean = ((b.grid[_te10] || -1) !== 1); if (_c12) {   const _t11 = sp.edgeEnds[2 * _te10];   _c12 = (((opp(sp, _t11, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t11) === -1) || (b.markOf(_t11) === v_q))) && ((b.markOf(opp(sp, _t11, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t11, cl.dot.at[v_q])) === v_q))); } let _c14: boolean = _c12; if (_c14) {   const _t13 = sp.edgeEnds[2 * _te10 + 1];   _c14 = (((opp(sp, _t13, cl.dot.at[v_q]) !== -1) && ((b.markOf(_t13) === -1) || (b.markOf(_t13) === v_q))) && ((b.markOf(opp(sp, _t13, cl.dot.at[v_q])) === -1) || (b.markOf(opp(sp, _t13, cl.dot.at[v_q])) === v_q))); } return _c14; });
    const _a15 = v_T;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_x = _a15[_i16];
      if (!((v_T.includes(opp(sp, v_x, cl.dot.at[v_q]))))) continue;
      if (!_g1.includes(v_x)) _g1.push(v_x);
    }
  }
  const _made = _g1;
  _kept[v_q] = _made;
  return _made;
}
