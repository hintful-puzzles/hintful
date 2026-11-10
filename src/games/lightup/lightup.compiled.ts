// Compiled by `npm run describe` from src/games/lightup/lightup.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, nextOfSize, sameSet, staleChecking, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  wall: ClueList;
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "square" | "darkSet" | "clueSet";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "shine";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "shine" },
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
  { id: "square", tier: 0 },
  { id: "darkSet", tier: 1 },
  { id: "clueSet", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 2; v_d++) {
      if (!(((v_d === 2) || ((clueAt(cl.wall, v_c) < 0) && (clueAt(cl.number, v_c) < 0))))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _k9 = lightsKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = clueAt(cl.wall, v_c);
      const _h6 = clueAt(cl.number, v_c);
      if (!(((_h5 < 0) && (_h6 < 0)))) continue;
      let _q7 = false;
      Q8: {
        const _a10 = (_k9[v_c] ?? lights(sp, cl, v_c));
        for (let _i11 = 0; _i11 < _a10.length; _i11++) {
          const v_p = _a10[_i11];
          const _h12 = (g[v_p] || -1);
          if ((_h12 === 1)) {
            _q7 = true;
            break Q8;
          }
        }
      }
      if (!(_q7)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q13 = true;
  Q14: {
    const _a15 = sp.cells;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_c = _a15[_i16];
      const _h17 = (g[v_c] || -1);
      if (!((_h17 === 1))) continue;
      let _q18 = true;
      Q19: {
        const _a20 = (_k9[v_c] ?? lights(sp, cl, v_c));
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_p = _a20[_i21];
          if (!((v_p !== v_c))) continue;
          const _h22 = (g[v_p] || -1);
          if (!((_h22 === 2))) {
            _q18 = false;
            break Q19;
          }
        }
      }
      if (!(_q18)) {
        _q13 = false;
        break Q14;
      }
    }
  }
  if (!(_q13)) return false;
  for (let _k23 = 0; _k23 < cl.wall.at.length; _k23++) {
    const _at24 = cl.wall.at[_k23];
    if (!(((g[_at24] || -1) === 2))) return false;
  }
  for (let _k26 = 0; _k26 < cl.number.at.length; _k26++) {
    const _at27 = cl.number.at[_k26];
    const _v28 = cl.number.v[_k26];
    let _c34: boolean = ((g[_at27] || -1) === 2);
    if (_c34) {
      let _g29 = 0;
      G30: {
        const _a31 = sp.adj4[_at27];
        for (let _i32 = 0; _i32 < _a31.length; _i32++) {
          const v_p = _a31[_i32];
          const _h33 = (g[v_p] || -1);
          if (!((_h33 === 1))) continue;
          _g29++;
        }
      }
      _c34 = (_g29 === _v28);
    }
    if (!(_c34)) return false;
  }
  return true;
}

export interface ShineBinding {
  c: number;
  p: number;
}

const shineFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function shine(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<ShineBinding> | null): number {
  const facts = shineFacts;
  let fired = 0;
  let changed = false;
  const _k5 = lightsKept.board(cl);
  if (!(((b.grid[v_c] || -1) === 1))) return 0;
  const _a6 = (_k5[v_c] ?? lights(sp, cl, v_c));
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_p = _a6[_i7];
    if (!(((v_p !== v_c) && !((b.grid[v_p] !== 0))))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("shine", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), (lights(sp, cl, v_c).includes(v_p)), ((v_p !== v_c) && !((b.grid[v_p] !== 0)))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface SquareBinding {
  X: number;
  c: number;
  n: number;
  L: readonly number[];
}

const squareFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function square(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareBinding> | null): number {
  const facts = squareFacts;
  let fired = 0;
  let changed = false;
  const _k10 = lightsKept.board(cl);
  const _a5 = sp.cols;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_X = _a5[_i6];
    const _a7 = sp.lineCells[v_X];
    for (let _i8 = 0; _i8 < _a7.length; _i8++) {
      const v_c = _a7[_i8];
      const _h9 = clueAt(cl.number, v_c);
      const _h11 = clueAt(cl.wall, v_c);
      const v_n = _h9;
      const v_L = (_k10[v_c] ?? lights(sp, cl, v_c));
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("square", [(sp.cols.includes(v_X)), (sp.lineCells[v_X].includes(v_c)), (v_n === clueAt(cl.number, v_c)), sameSet(v_L, lights(sp, cl, v_c))], ["X in", "c in", "n =", "L ="]);
      }
      facts.length = 0;
      changed = false;
      let _c33: boolean = !(((_h11 < 0) && (_h9 < 0)));
      if (!_c33) {
        let _c16: boolean = ((b.grid[v_c] || -1) !== 1);
        if (!_c16) {
          let _q12 = true;
          Q13: {
            const _a14 = v_L;
            for (let _i15 = 0; _i15 < _a14.length; _i15++) {
              const v_p = _a14[_i15];
              if (!((v_p !== v_c))) continue;
              if (!(((b.grid[v_p] || -1) !== 1))) {
                _q12 = false;
                break Q13;
              }
            }
          }
          _c16 = _q12;
        }
        let _c32: boolean = _c16;
        if (_c32) {
          let _q17 = false;
          Q18: {
            const _a19 = v_L;
            for (let _i20 = 0; _i20 < _a19.length; _i20++) {
              const v_p = _a19[_i20];
              if (((b.grid[v_p] || -1) === 1)) {
                _q17 = true;
                break Q18;
              }
            }
          }
          let _c31: boolean = _q17;
          if (!_c31) {
            let _g21 = 0;
            G22: {
              const _a23 = v_L;
              for (let _i24 = 0; _i24 < _a23.length; _i24++) {
                const v_p = _a23[_i24];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g21++;
              }
            }
            let _c30: boolean = (_g21 >= 1);
            if (_c30) {
              let _c29: boolean = (_g21 > 1);
              if (!_c29) {
                let _q25 = true;
                Q26: {
                  const _a27 = v_L;
                  for (let _i28 = 0; _i28 < _a27.length; _i28++) {
                    const v_p = _a27[_i28];
                    if (!(!((b.grid[v_p] !== 0)))) continue;
                    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                    if (!(true)) {
                      _q25 = false;
                      break Q26;
                    }
                  }
                }
                _c29 = _q25;
              }
              _c30 = _c29;
            }
            _c31 = _c30;
          }
          _c32 = _c31;
        }
        _c33 = _c32;
      }
      let _c64: boolean = _c33;
      if (_c64) {
        let _c63: boolean = (v_n < 0);
        if (!_c63) {
          let _g34 = 0;
          G35: {
            const _a36 = sp.adj4[v_c];
            for (let _i37 = 0; _i37 < _a36.length; _i37++) {
              const v_p = _a36[_i37];
              if (!(((b.grid[v_p] || -1) === 1))) continue;
              _g34++;
            }
          }
          let _c42: boolean = (_g34 <= v_n);
          if (_c42) {
            let _g38 = 0;
            G39: {
              const _a40 = sp.adj4[v_c];
              for (let _i41 = 0; _i41 < _a40.length; _i41++) {
                const v_p = _a40[_i41];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g38++;
              }
            }
            _c42 = ((_g34 + _g38) >= v_n);
          }
          let _c48: boolean = _c42;
          if (_c48) {
            let _c47: boolean = (_g34 < v_n);
            if (!_c47) {
              let _q43 = true;
              Q44: {
                const _a45 = sp.adj4[v_c];
                for (let _i46 = 0; _i46 < _a45.length; _i46++) {
                  const v_p = _a45[_i46];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                  if (!(true)) {
                    _q43 = false;
                    break Q44;
                  }
                }
              }
              _c47 = _q43;
            }
            _c48 = _c47;
          }
          let _c62: boolean = _c48;
          if (_c62) {
            let _g49 = 0;
            G50: {
              const _a51 = sp.adj4[v_c];
              for (let _i52 = 0; _i52 < _a51.length; _i52++) {
                const v_p = _a51[_i52];
                if (!(((b.grid[v_p] || -1) === 1))) continue;
                _g49++;
              }
            }
            let _g53 = 0;
            G54: {
              const _a55 = sp.adj4[v_c];
              for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                const v_p = _a55[_i56];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g53++;
              }
            }
            let _c61: boolean = ((_g49 + _g53) > v_n);
            if (!_c61) {
              let _q57 = true;
              Q58: {
                const _a59 = sp.adj4[v_c];
                for (let _i60 = 0; _i60 < _a59.length; _i60++) {
                  const v_p = _a59[_i60];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                  if (!(true)) {
                    _q57 = false;
                    break Q58;
                  }
                }
              }
              _c61 = _q57;
            }
            _c62 = _c61;
          }
          _c63 = _c62;
        }
        _c64 = _c63;
      }
      if (!(_c64)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ X: v_X, c: v_c, n: v_n, L: v_L.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DarkSetBinding {
  X: number;
  u: number;
  L: readonly number[];
  S: readonly number[];
}

const darkSetFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function darkSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DarkSetBinding> | null): number {
  const _g28: number[] = [];
  const facts = darkSetFacts;
  let fired = 0;
  let changed = false;
  const _k22 = lightsKept.board(cl);
  const _k47 = rivalsKept.board(cl);
  const _a16 = sp.cols;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_X = _a16[_i17];
    const _a18 = sp.lineCells[v_X];
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_u = _a18[_i19];
      const _h20 = clueAt(cl.wall, v_u);
      const _h21 = clueAt(cl.number, v_u);
      if (!(((_h20 < 0) && (_h21 < 0)))) continue;
      L23: {
        const v_L = (_k22[v_u] ?? lights(sp, cl, v_u));
        let _q24 = false;
        Q25: {
          const _a26 = v_L;
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_p = _a26[_i27];
            if (((b.grid[v_p] || -1) === 1)) {
              _q24 = true;
              break Q25;
            }
          }
        }
        if (!(!(_q24))) break L23;
        _g28.length = 0;
        G29: {
          const _a32 = v_L;
          for (let _i33 = 0; _i33 < _a32.length; _i33++) {
            const v_s = _a32[_i33];
            if (!(!((b.grid[v_s] !== 0)))) continue;
            _g28.push(v_s);
          }
        }
        const v_S = _g28;
        const _h44 = v_S.length;
        if (import.meta.env.DEV && staleChecking) {
          let _q34 = false;
          Q35: {
            const _a36 = v_L;
            for (let _i37 = 0; _i37 < _a36.length; _i37++) {
              const v_p = _a36[_i37];
              if (((b.grid[v_p] || -1) === 1)) {
                _q34 = true;
                break Q35;
              }
            }
          }
          const _g38: number[] = [];
          G39: {
            const _a42 = v_L;
            for (let _i43 = 0; _i43 < _a42.length; _i43++) {
              const v_s = _a42[_i43];
              if (!(!((b.grid[v_s] !== 0)))) continue;
              _g38.push(v_s);
            }
          }
          freshBinding("darkSet", [(sp.cols.includes(v_X)), (sp.lineCells[v_X].includes(v_u)), ((clueAt(cl.wall, v_u) < 0) && (clueAt(cl.number, v_u) < 0)), sameSet(v_L, lights(sp, cl, v_u)), !(_q34), sameSet(v_S, _g38)], ["X in", "u in", "where of u", "L =", "where of L", "S ="]);
        }
        facts.length = 0;
        changed = false;
        let _c66: boolean = (_h44 > 0);
        if (_c66) {
          let _q45 = true;
          Q46: {
            const _a48 = (_k47[(v_S.length > 0 ? v_S[0] : -1)] ?? rivals(sp, cl, (v_S.length > 0 ? v_S[0] : -1)));
            for (let _i49 = 0; _i49 < _a48.length; _i49++) {
              const v_d = _a48[_i49];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              L50: {
                const v_D = (_k22[v_d] ?? lights(sp, cl, v_d));
                let _q51 = true;
                Q52: {
                  const _a53 = v_S;
                  for (let _i54 = 0; _i54 < _a53.length; _i54++) {
                    const v_s = _a53[_i54];
                    let _c65: boolean = (v_s !== v_d);
                    if (_c65) {
                      let _c64: boolean = (v_D.includes(v_s));
                      if (!_c64) {
                        let _q55 = false;
                        Q56: {
                          const _a57 = sp.adj4[v_d];
                          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                            const v_k = _a57[_i58];
                            const _h59 = clueAt(cl.number, v_k);
                            if (!(((_h59 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                            let _g60 = 0;
                            G61: {
                              const _a62 = sp.adj4[v_k];
                              for (let _i63 = 0; _i63 < _a62.length; _i63++) {
                                const v_p = _a62[_i63];
                                if (!(((b.grid[v_p] || -1) === 1))) continue;
                                _g60++;
                              }
                            }
                            if (((_g60 + 1) === _h59)) {
                              _q55 = true;
                              break Q56;
                            }
                          }
                        }
                        _c64 = _q55;
                      }
                      _c65 = _c64;
                    }
                    if (!(_c65)) {
                      _q51 = false;
                      break Q52;
                    }
                  }
                }
                if (!(_q51)) break L50;
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q45 = false;
                  break Q46;
                }
              }
            }
          }
          _c66 = _q45;
        }
        if (!(_c66)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ X: v_X, u: v_u, L: v_L.slice(), S: v_S.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ClueSetBinding {
  X: number;
  k: number;
  n: number;
  F: readonly number[];
  m: number;
  T: readonly number[];
}

const clueSetFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function clueSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueSetBinding> | null): number {
  const _g36: number[] = [];
  const _g49: number[] = [];
  const _g57: number[] = [];
  const facts = clueSetFacts;
  let fired = 0;
  let changed = false;
  const _k83 = rivalsKept.board(cl);
  const _k86 = lightsKept.board(cl);
  const _a26 = sp.cols;
  for (let _i27 = 0; _i27 < _a26.length; _i27++) {
    const v_X = _a26[_i27];
    const _a28 = sp.lineCells[v_X];
    R2:
    for (let _i29 = 0; _i29 < _a28.length; _i29++) {
      const v_k = _a28[_i29];
      const _h30 = clueAt(cl.number, v_k);
      L31: {
        const v_n = _h30;
        const _m103_0 = b.made[0];
        let _g32 = 0;
        G33: {
          const _a34 = sp.adj4[v_k];
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_p = _a34[_i35];
            if (!(((b.grid[v_p] || -1) === 1))) continue;
            _g32++;
          }
        }
        if (!((v_n > _g32))) break L31;
        _g36.length = 0;
        G37: {
          const _a40 = sp.adj4[v_k];
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_p = _a40[_i41];
            if (!(!((b.grid[v_p] !== 0)))) continue;
            _g36.push(v_p);
          }
        }
        const v_F = _g36;
        const _h43 = v_F.length;
        L42: {
          const v_m = (v_n - _g32);
          if (!((v_m <= _h43))) break L42;
          const _h51 = (_h43 - v_m);
          const _h52 = (_h51 + 1);
          const _e44 = v_F;
          const _t47 = ((_h43 - v_m) + 1);
          const _n48 = 1 << _e44.length;
          for (let _k45 = _t47 > _e44.length ? _n48 : (1 << _t47) - 1; _k45 < _n48; _k45 = _t47 === 0 ? _n48 : nextOfSize(_k45)) {
            const v_T = _g49;
            v_T.length = 0;
            for (let _j46 = 0; _j46 < _e44.length; _j46++) if ((_k45 >> (_e44.length - 1 - _j46)) & 1) v_T.push(_e44[_j46]);
            const _h50 = v_T.length;
            if (!((_h50 === _h52))) continue;
            if (b.made[0] !== _m103_0) {
              let _g53 = 0;
              G54: {
                const _a55 = sp.adj4[v_k];
                for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                  const v_p = _a55[_i56];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g53++;
                }
              }
              if (!((v_n > _g53))) { continue R2; }
              _g57.length = 0;
              G58: {
                const _a61 = sp.adj4[v_k];
                for (let _i62 = 0; _i62 < _a61.length; _i62++) {
                  const v_p = _a61[_i62];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  _g57.push(v_p);
                }
              }
              if (!(sameSet(v_F, _g57))) { continue R2; }
              let _g63 = 0;
              G64: {
                const _a65 = sp.adj4[v_k];
                for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                  const v_p = _a65[_i66];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g63++;
                }
              }
              if (!((v_m === (v_n - _g63)))) { continue R2; }
            }
            if (import.meta.env.DEV && staleChecking) {
              let _g67 = 0;
              G68: {
                const _a69 = sp.adj4[v_k];
                for (let _i70 = 0; _i70 < _a69.length; _i70++) {
                  const v_p = _a69[_i70];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g67++;
                }
              }
              const _g71: number[] = [];
              G72: {
                const _a75 = sp.adj4[v_k];
                for (let _i76 = 0; _i76 < _a75.length; _i76++) {
                  const v_p = _a75[_i76];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  _g71.push(v_p);
                }
              }
              let _g77 = 0;
              G78: {
                const _a79 = sp.adj4[v_k];
                for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                  const v_p = _a79[_i80];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g77++;
                }
              }
              freshBinding("clueSet", [(sp.cols.includes(v_X)), (sp.lineCells[v_X].includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n > _g67), sameSet(v_F, _g71), (v_m === (v_n - _g77)), (v_m <= v_F.length), (v_T.length === ((v_F.length - v_m) + 1))], ["X in", "k in", "n =", "where of n", "F =", "m =", "where of m", "where of T"]);
            }
            facts.length = 0;
            changed = false;
            let _q81 = true;
            Q82: {
              const _a84 = (_k83[(v_T.length > 0 ? v_T[0] : -1)] ?? rivals(sp, cl, (v_T.length > 0 ? v_T[0] : -1)));
              for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                const v_d = _a84[_i85];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                L87: {
                  const v_D = (_k86[v_d] ?? lights(sp, cl, v_d));
                  let _q88 = true;
                  Q89: {
                    const _a90 = v_T;
                    for (let _i91 = 0; _i91 < _a90.length; _i91++) {
                      const v_s = _a90[_i91];
                      let _c102: boolean = (v_s !== v_d);
                      if (_c102) {
                        let _c101: boolean = (v_D.includes(v_s));
                        if (!_c101) {
                          let _q92 = false;
                          Q93: {
                            const _a94 = sp.adj4[v_d];
                            for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                              const v_k = _a94[_i95];
                              const _h96 = clueAt(cl.number, v_k);
                              if (!(((_h96 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                              let _g97 = 0;
                              G98: {
                                const _a99 = sp.adj4[v_k];
                                for (let _i100 = 0; _i100 < _a99.length; _i100++) {
                                  const v_p = _a99[_i100];
                                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                                  _g97++;
                                }
                              }
                              if (((_g97 + 1) === _h96)) {
                                _q92 = true;
                                break Q93;
                              }
                            }
                          }
                          _c101 = _q92;
                        }
                        _c102 = _c101;
                      }
                      if (!(_c102)) {
                        _q88 = false;
                        break Q89;
                      }
                    }
                  }
                  if (!(_q88)) break L87;
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q81 = false;
                    break Q82;
                  }
                }
              }
            }
            if (!(_q81)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ X: v_X, k: v_k, n: v_n, F: v_F.slice(), m: v_m, T: v_T.slice() }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

const floorsKept = keptStore<readonly number[]>();
let floorsOn: object | null = null;
let floorsAt: Kept<readonly number[]> = [];

/** `floors(L)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function floors(sp: GridSpace, cl: Dealt, v_L: number): readonly number[] {
  if (cl !== floorsOn) {
    floorsAt = floorsKept.board(cl);
    floorsOn = cl;
  }
  const _kept: Kept<readonly number[]> = floorsAt;
  if (_kept[v_L] !== undefined) return _kept[v_L];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.lineCells[v_L];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_x = _a5[_i6];
      if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
      _g1.push(v_x);
    }
  }
  const _made = _g1;
  _kept[v_L] = _made;
  return _made;
}

const lightsKept = keptStore<readonly number[]>();
let lightsOn: object | null = null;
let lightsAt: Kept<readonly number[]> = [];

/** `lights(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function lights(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== lightsOn) {
    lightsAt = lightsKept.board(cl);
    lightsOn = cl;
  }
  const _kept: Kept<readonly number[]> = lightsAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _made = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, floors(sp, cl, sp.rowOf[v_c])), stretch(sp.lineCells[sp.colOf[v_c]], v_c, floors(sp, cl, sp.colOf[v_c])));
  _kept[v_c] = _made;
  return _made;
}

const rivalsKept = keptStore<readonly number[]>();
let rivalsOn: object | null = null;
let rivalsAt: Kept<readonly number[]> = [];

/** `rivals(s)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function rivals(sp: GridSpace, cl: Dealt, v_s: number): readonly number[] {
  if (cl !== rivalsOn) {
    rivalsAt = rivalsKept.board(cl);
    rivalsOn = cl;
  }
  const _kept: Kept<readonly number[]> = rivalsAt;
  if (_kept[v_s] !== undefined) return _kept[v_s];
  const _g1: number[] = [];
  G2: {
    const _a7 = sp.adj4[v_s];
    for (let _i8 = 0; _i8 < _a7.length; _i8++) {
      const v_k = _a7[_i8];
      const _a9 = sp.adj4[v_k];
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_p = _a9[_i10];
        if (!_g1.includes(v_p)) _g1.push(v_p);
      }
    }
  }
  const _made = union(lights(sp, cl, v_s), _g1);
  _kept[v_s] = _made;
  return _made;
}
