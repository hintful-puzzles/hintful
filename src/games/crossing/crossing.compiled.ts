// Compiled by `npm run describe` from src/games/crossing/crossing.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, cellsValued, clueAt, freshBinding, keptStore, least, listLength, nth, popcount, sameList, sameSet, staleChecking, stretch, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  blank: ClueList;
  numbers: { readonly n: number; readonly digits: readonly Int32Array[] };
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "onlyNumber" | "onlyRun" | "sharedDigit" | "crossRuns" | "narrow" | "misread" | "twice";

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
  { id: "onlyNumber", tier: 0 },
  { id: "onlyRun", tier: 0 },
  { id: "sharedDigit", tier: 0 },
  { id: "crossRuns", tier: 0 },
  { id: "narrow", tier: 0 },
  { id: "misread", tier: 0 },
  { id: "twice", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 10; v_d++) {
      if (!(((v_d === 10) === (clueAt(cl.blank, v_c) >= 0)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.lines;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_L = _a3[_i4];
      const _a5 = sp.lineCells[v_L];
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_c = _a5[_i6];
        if (!(head(sp, cl, v_L, v_c))) continue;
        let _q7 = false;
        Q8: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            const _t9 = run(sp, cl, v_L, v_c);
            const _h10 = _t9.length;
            let _c16: boolean = (listLength(cl.numbers.digits[v_k]) === _h10);
            if (_c16) {
              let _q11 = true;
              Q12: {
                const _a13 = _t9;
                for (let _i14 = 0; _i14 < _a13.length; _i14++) {
                  const v_x = _a13[_i14];
                  const _h15 = (g[v_x] || -1);
                  if (!((_h15 === nth(cl.numbers.digits[v_k], _i14)))) {
                    _q11 = false;
                    break Q12;
                  }
                }
              }
              _c16 = _q11;
            }
            if (_c16) {
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
  }
  if (!(_q1)) return false;
  let _q17 = true;
  Q18: {
    for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
      for (let v_j = 0; v_j < cl.numbers.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!(!sameList(cl.numbers.digits[v_j], cl.numbers.digits[v_k]))) {
          _q17 = false;
          break Q18;
        }
      }
    }
  }
  if (!(_q17)) return false;
  for (let _k19 = 0; _k19 < cl.blank.at.length; _k19++) {
    const _at20 = cl.blank.at[_k19];
    if (!(((g[_at20] || -1) === 10))) return false;
  }
  for (let _k22 = 0; _k22 < cl.numbers.n; _k22++) {
    let _g25 = 0;
    G26: {
      const _a27 = sp.lines;
      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
        const v_L = _a27[_i28];
        const _a29 = sp.lineCells[v_L];
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_c = _a29[_i30];
          let _c39: boolean = head(sp, cl, v_L, v_c);
          if (_c39) {
            const _t31 = run(sp, cl, v_L, v_c);
            const _h32 = _t31.length;
            let _c38: boolean = (listLength(cl.numbers.digits[_k22]) === _h32);
            if (_c38) {
              let _q33 = true;
              Q34: {
                const _a35 = _t31;
                for (let _i36 = 0; _i36 < _a35.length; _i36++) {
                  const v_x = _a35[_i36];
                  const _h37 = (g[v_x] || -1);
                  if (!((_h37 === nth(cl.numbers.digits[_k22], _i36)))) {
                    _q33 = false;
                    break Q34;
                  }
                }
              }
              _c38 = _q33;
            }
            _c39 = _c38;
          }
          if (!(_c39)) continue;
          _g25++;
        }
      }
    }
    if (!((_g25 === 1))) return false;
  }
  return true;
}

export interface OnlyNumberBinding {
  L: number;
  c: number;
  R: readonly number[];
  K: readonly number[];
}

const onlyNumberFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyNumber(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyNumberBinding> | null): number {
  const _g32: number[] = [];
  const facts = onlyNumberFacts;
  let fired = 0;
  let changed = false;
  const _a23 = sp.lines;
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_L = _a23[_i24];
    const _a25 = sp.lineCells[v_L];
    for (let _i26 = 0; _i26 < _a25.length; _i26++) {
      const v_c = _a25[_i26];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L27: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q28 = false;
        Q29: {
          const _a30 = v_R;
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_x = _a30[_i31];
            if (!((b.grid[v_x] !== 0))) {
              _q28 = true;
              break Q29;
            }
          }
        }
        if (!(_q28)) break L27;
        const _h39 = v_R.length;
        _g32.length = 0;
        G33: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c44: boolean = (listLength(cl.numbers.digits[v_k]) === _h39);
            if (_c44) {
              let _q40 = true;
              Q41: {
                const _a42 = v_R;
                for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                  const v_x = _a42[_i43];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i43)) & 1) !== 0))) {
                    _q40 = false;
                    break Q41;
                  }
                }
              }
              _c44 = _q40;
            }
            if (!((_c44 && !(written(b, sp, cl, v_k))))) continue;
            _g32.push(v_k);
          }
        }
        L45: {
          const v_K = _g32;
          const _h46 = v_K.length;
          if (!((_h46 < 2))) break L45;
          if (import.meta.env.DEV && staleChecking) {
            let _q47 = false;
            Q48: {
              const _a49 = v_R;
              for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                const v_x = _a49[_i50];
                if (!((b.grid[v_x] !== 0))) {
                  _q47 = true;
                  break Q48;
                }
              }
            }
            const _g51: number[] = [];
            G52: {
              for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                let _c62: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                if (_c62) {
                  let _q58 = true;
                  Q59: {
                    const _a60 = v_R;
                    for (let _i61 = 0; _i61 < _a60.length; _i61++) {
                      const v_x = _a60[_i61];
                      if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i61)) & 1) !== 0))) {
                        _q58 = false;
                        break Q59;
                      }
                    }
                  }
                  _c62 = _q58;
                }
                if (!((_c62 && !(written(b, sp, cl, v_k))))) continue;
                _g51.push(v_k);
              }
            }
            freshBinding("onlyNumber", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q47, sameSet(v_K, _g51), (v_K.length < 2)], ["L in", "c in", "where of c", "R =", "where of R", "K =", "where of K"]);
          }
          facts.length = 0;
          changed = false;
          let _c69: boolean = (_h46 === 1);
          if (_c69) {
            let _q63 = true;
            Q64: {
              const _a65 = v_R;
              for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                const v_x = _a65[_i66];
                if (!(!((b.grid[v_x] !== 0)))) continue;
                const _t67 = (v_K.length > 0 ? v_K[0] : -1);
                const _t68 = nth(cl.numbers.digits[_t67], _i66);
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t68); changed = true; } else facts.push(PLACE, v_x, _t68); }
                if (!(true)) {
                  _q63 = false;
                  break Q64;
                }
              }
            }
            _c69 = _q63;
          }
          if (!(_c69)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice(), K: v_K.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface OnlyRunBinding {
  k: number;
  L: number;
  c: number;
  R: readonly number[];
}

const onlyRunFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyRun(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyRunBinding> | null): number {
  const facts = onlyRunFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
    const _m93_0 = b.made[0];
    const _m94_1 = b.made[1];
    let _c40: boolean = !(written(b, sp, cl, v_k));
    if (_c40) {
      let _g26 = 0;
      G27: {
        const _a28 = sp.lines;
        for (let _i29 = 0; _i29 < _a28.length; _i29++) {
          const v_M = _a28[_i29];
          const _a30 = sp.lineCells[v_M];
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_b = _a30[_i31];
            let _c39: boolean = head(sp, cl, v_M, v_b);
            if (_c39) {
              const _t32 = run(sp, cl, v_M, v_b);
              const _h33 = _t32.length;
              let _c38: boolean = (listLength(cl.numbers.digits[v_k]) === _h33);
              if (_c38) {
                let _q34 = true;
                Q35: {
                  const _a36 = _t32;
                  for (let _i37 = 0; _i37 < _a36.length; _i37++) {
                    const v_x = _a36[_i37];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i37)) & 1) !== 0))) {
                      _q34 = false;
                      break Q35;
                    }
                  }
                }
                _c38 = _q34;
              }
              _c39 = _c38;
            }
            if (!(_c39)) continue;
            _g26++;
          }
        }
      }
      _c40 = (_g26 === 1);
    }
    if (!(_c40)) continue;
    const _a41 = sp.lines;
    for (let _i42 = 0; _i42 < _a41.length; _i42++) {
      const v_L = _a41[_i42];
      const _a43 = sp.lineCells[v_L];
      for (let _i44 = 0; _i44 < _a43.length; _i44++) {
        const v_c = _a43[_i44];
        let _c52: boolean = head(sp, cl, v_L, v_c);
        if (_c52) {
          const _t45 = run(sp, cl, v_L, v_c);
          const _h46 = _t45.length;
          let _c51: boolean = (listLength(cl.numbers.digits[v_k]) === _h46);
          if (_c51) {
            let _q47 = true;
            Q48: {
              const _a49 = _t45;
              for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                const v_x = _a49[_i50];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i50)) & 1) !== 0))) {
                  _q47 = false;
                  break Q48;
                }
              }
            }
            _c51 = _q47;
          }
          _c52 = _c51;
        }
        if (!(_c52)) continue;
        const v_R = run(sp, cl, v_L, v_c);
        if (b.made[0] !== _m93_0 || b.made[1] !== _m94_1) {
          let _c66: boolean = !(written(b, sp, cl, v_k));
          if (_c66) {
            let _g53 = 0;
            G54: {
              const _a55 = sp.lines;
              for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                const v_M = _a55[_i56];
                const _a57 = sp.lineCells[v_M];
                for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                  const v_b = _a57[_i58];
                  let _c65: boolean = head(sp, cl, v_M, v_b);
                  if (_c65) {
                    const _t59 = run(sp, cl, v_M, v_b);
                    let _c64: boolean = (listLength(cl.numbers.digits[v_k]) === _t59.length);
                    if (_c64) {
                      let _q60 = true;
                      Q61: {
                        const _a62 = _t59;
                        for (let _i63 = 0; _i63 < _a62.length; _i63++) {
                          const v_x = _a62[_i63];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i63)) & 1) !== 0))) {
                            _q60 = false;
                            break Q61;
                          }
                        }
                      }
                      _c64 = _q60;
                    }
                    _c65 = _c64;
                  }
                  if (!(_c65)) continue;
                  _g53++;
                }
              }
            }
            _c66 = (_g53 === 1);
          }
          if (!(_c66)) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c80: boolean = !(written(b, sp, cl, v_k));
          if (_c80) {
            let _g67 = 0;
            G68: {
              const _a69 = sp.lines;
              for (let _i70 = 0; _i70 < _a69.length; _i70++) {
                const v_M = _a69[_i70];
                const _a71 = sp.lineCells[v_M];
                for (let _i72 = 0; _i72 < _a71.length; _i72++) {
                  const v_b = _a71[_i72];
                  let _c79: boolean = head(sp, cl, v_M, v_b);
                  if (_c79) {
                    const _t73 = run(sp, cl, v_M, v_b);
                    let _c78: boolean = (listLength(cl.numbers.digits[v_k]) === _t73.length);
                    if (_c78) {
                      let _q74 = true;
                      Q75: {
                        const _a76 = _t73;
                        for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                          const v_x = _a76[_i77];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i77)) & 1) !== 0))) {
                            _q74 = false;
                            break Q75;
                          }
                        }
                      }
                      _c78 = _q74;
                    }
                    _c79 = _c78;
                  }
                  if (!(_c79)) continue;
                  _g67++;
                }
              }
            }
            _c80 = (_g67 === 1);
          }
          let _c87: boolean = head(sp, cl, v_L, v_c);
          if (_c87) {
            const _t81 = run(sp, cl, v_L, v_c);
            let _c86: boolean = (listLength(cl.numbers.digits[v_k]) === _t81.length);
            if (_c86) {
              let _q82 = true;
              Q83: {
                const _a84 = _t81;
                for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                  const v_x = _a84[_i85];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i85)) & 1) !== 0))) {
                    _q82 = false;
                    break Q83;
                  }
                }
              }
              _c86 = _q82;
            }
            _c87 = _c86;
          }
          freshBinding("onlyRun", [_c80, (sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), _c87, sameSet(v_R, run(sp, cl, v_L, v_c))], ["where of k", "L in", "c in", "where of c", "R ="]);
        }
        facts.length = 0;
        changed = false;
        let _q88 = true;
        Q89: {
          const _a90 = v_R;
          for (let _i91 = 0; _i91 < _a90.length; _i91++) {
            const v_x = _a90[_i91];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _t92 = nth(cl.numbers.digits[v_k], _i91);
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t92); changed = true; } else facts.push(PLACE, v_x, _t92); }
            if (!(true)) {
              _q88 = false;
              break Q89;
            }
          }
        }
        if (!(_q88)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ k: v_k, L: v_L, c: v_c, R: v_R.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface SharedDigitBinding {
  L: number;
  c: number;
  R: readonly number[];
  K: readonly number[];
  x: number;
  D: number;
}

const sharedDigitFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function sharedDigit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedDigitBinding> | null): number {
  const _g42: number[] = [];
  const _g73: number[] = [];
  const facts = sharedDigitFacts;
  let fired = 0;
  let changed = false;
  const _a33 = sp.lines;
  for (let _i34 = 0; _i34 < _a33.length; _i34++) {
    const v_L = _a33[_i34];
    const _a35 = sp.lineCells[v_L];
    R2:
    for (let _i36 = 0; _i36 < _a35.length; _i36++) {
      const v_c = _a35[_i36];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L37: {
        const v_R = run(sp, cl, v_L, v_c);
        const _m109_0 = b.made[0];
        let _q38 = false;
        Q39: {
          const _a40 = v_R;
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_x = _a40[_i41];
            if (!((b.grid[v_x] !== 0))) {
              _q38 = true;
              break Q39;
            }
          }
        }
        if (!(_q38)) break L37;
        const _h49 = v_R.length;
        const _m110_1 = b.made[1];
        _g42.length = 0;
        G43: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c54: boolean = (listLength(cl.numbers.digits[v_k]) === _h49);
            if (_c54) {
              let _q50 = true;
              Q51: {
                const _a52 = v_R;
                for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                  const v_x = _a52[_i53];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i53)) & 1) !== 0))) {
                    _q50 = false;
                    break Q51;
                  }
                }
              }
              _c54 = _q50;
            }
            if (!((_c54 && !(written(b, sp, cl, v_k))))) continue;
            _g42.push(v_k);
          }
        }
        L55: {
          const v_K = _g42;
          const _h56 = v_K.length;
          if (!((_h56 > 0))) break L55;
          const _a57 = v_R;
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_x = _a57[_i58];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _h65 = _i58;
            let _g59 = 0;
            G60: {
              const _a63 = v_K;
              for (let _i64 = 0; _i64 < _a63.length; _i64++) {
                const v_k = _a63[_i64];
                const _t66 = nth(cl.numbers.digits[v_k], _h65);
                _g59 |= 1 << _t66;
              }
            }
            L67: {
              const v_D = _g59;
              const _h68 = popcount(v_D);
              if (!((_h68 === 1))) break L67;
              if (b.made[0] !== _m109_0 || b.made[1] !== _m110_1) {
                let _q69 = false;
                Q70: {
                  const _a71 = v_R;
                  for (let _i72 = 0; _i72 < _a71.length; _i72++) {
                    const v_x = _a71[_i72];
                    if (!((b.grid[v_x] !== 0))) {
                      _q69 = true;
                      break Q70;
                    }
                  }
                }
                if (!(_q69)) { continue R2; }
                _g73.length = 0;
                G74: {
                  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                    let _c84: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                    if (_c84) {
                      let _q80 = true;
                      Q81: {
                        const _a82 = v_R;
                        for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                          const v_x = _a82[_i83];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i83)) & 1) !== 0))) {
                            _q80 = false;
                            break Q81;
                          }
                        }
                      }
                      _c84 = _q80;
                    }
                    if (!((_c84 && !(written(b, sp, cl, v_k))))) continue;
                    _g73.push(v_k);
                  }
                }
                if (!(sameSet(v_K, _g73))) { continue R2; }
              }
              if (import.meta.env.DEV && staleChecking) {
                let _q85 = false;
                Q86: {
                  const _a87 = v_R;
                  for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                    const v_x = _a87[_i88];
                    if (!((b.grid[v_x] !== 0))) {
                      _q85 = true;
                      break Q86;
                    }
                  }
                }
                const _g89: number[] = [];
                G90: {
                  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                    let _c100: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                    if (_c100) {
                      let _q96 = true;
                      Q97: {
                        const _a98 = v_R;
                        for (let _i99 = 0; _i99 < _a98.length; _i99++) {
                          const v_x = _a98[_i99];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i99)) & 1) !== 0))) {
                            _q96 = false;
                            break Q97;
                          }
                        }
                      }
                      _c100 = _q96;
                    }
                    if (!((_c100 && !(written(b, sp, cl, v_k))))) continue;
                    _g89.push(v_k);
                  }
                }
                let _g101 = 0;
                G102: {
                  const _a105 = v_K;
                  for (let _i106 = 0; _i106 < _a105.length; _i106++) {
                    const v_k = _a105[_i106];
                    const _t107 = nth(cl.numbers.digits[v_k], _i58);
                    _g101 |= 1 << _t107;
                  }
                }
                freshBinding("sharedDigit", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q85, sameSet(v_K, _g89), (v_K.length > 0), (v_R.includes(v_x)), !((b.grid[v_x] !== 0)), (v_D === _g101), (popcount(v_D) === 1)], ["L in", "c in", "where of c", "R =", "where of R", "K =", "where of K", "x in", "where of x", "D =", "where of D"]);
              }
              facts.length = 0;
              changed = false;
              const _t108 = least(v_D);
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t108); changed = true; } else facts.push(PLACE, v_x, _t108); }
              if (!(true)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice(), K: v_K.slice(), x: v_x, D: v_D }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CrossRunsBinding {
  x: number;
  A: readonly number[];
  B: readonly number[];
  KA: readonly number[];
  KB: readonly number[];
  D: number;
}

const crossRunsFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function crossRuns(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrossRunsBinding> | null): number {
  const _g61: number[] = [];
  const _g73: number[] = [];
  const facts = crossRunsFacts;
  let fired = 0;
  let changed = false;
  const _a55 = sp.cells;
  for (let _i56 = 0; _i56 < _a55.length; _i56++) {
    const v_x = _a55[_i56];
    const _h57 = clueAt(cl.blank, v_x);
    if (!(((_h57 < 0) && !((b.grid[v_x] !== 0))))) continue;
    const v_A = run(sp, cl, sp.rowOf[v_x], v_x);
    const _h59 = v_A.length;
    const _h105 = v_A.indexOf(v_x);
    L58: {
      const v_B = run(sp, cl, sp.colOf[v_x], v_x);
      const _h60 = v_B.length;
      if (!(((_h59 >= 2) && (_h60 >= 2)))) break L58;
      const _h112 = v_B.indexOf(v_x);
      _g61.length = 0;
      G62: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c72: boolean = (listLength(cl.numbers.digits[v_k]) === _h59);
          if (_c72) {
            let _q68 = true;
            Q69: {
              const _a70 = v_A;
              for (let _i71 = 0; _i71 < _a70.length; _i71++) {
                const v_x = _a70[_i71];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i71)) & 1) !== 0))) {
                  _q68 = false;
                  break Q69;
                }
              }
            }
            _c72 = _q68;
          }
          if (!((_c72 && !(written(b, sp, cl, v_k))))) continue;
          _g61.push(v_k);
        }
      }
      const v_KA = _g61;
      _g73.length = 0;
      G74: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c84: boolean = (listLength(cl.numbers.digits[v_k]) === _h60);
          if (_c84) {
            let _q80 = true;
            Q81: {
              const _a82 = v_B;
              for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                const v_x = _a82[_i83];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i83)) & 1) !== 0))) {
                  _q80 = false;
                  break Q81;
                }
              }
            }
            _c84 = _q80;
          }
          if (!((_c84 && !(written(b, sp, cl, v_k))))) continue;
          _g73.push(v_k);
        }
      }
      const v_KB = _g73;
      let _g85 = 0;
      G86: {
        let _g99 = 0;
        G100: {
          const _a103 = v_KA;
          for (let _i104 = 0; _i104 < _a103.length; _i104++) {
            const v_k = _a103[_i104];
            const _t106 = nth(cl.numbers.digits[v_k], _h105);
            _g99 |= 1 << _t106;
          }
        }
        for (let _m107 = _g99; _m107 !== 0; _m107 &= _m107 - 1) {
          const v_d = 31 - Math.clz32(_m107 & -_m107);
          let _q108 = false;
          Q109: {
            const _a110 = v_KB;
            for (let _i111 = 0; _i111 < _a110.length; _i111++) {
              const v_k = _a110[_i111];
              if ((nth(cl.numbers.digits[v_k], _h112) === v_d)) {
                _q108 = true;
                break Q109;
              }
            }
          }
          if (!(_q108)) continue;
          _g85 |= 1 << v_d;
        }
      }
      L113: {
        const v_D = _g85;
        const _h114 = popcount(v_D);
        if (!((_h114 === 1))) break L113;
        if (import.meta.env.DEV && staleChecking) {
          const _g115: number[] = [];
          G116: {
            for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
              let _c126: boolean = (listLength(cl.numbers.digits[v_k]) === v_A.length);
              if (_c126) {
                let _q122 = true;
                Q123: {
                  const _a124 = v_A;
                  for (let _i125 = 0; _i125 < _a124.length; _i125++) {
                    const v_x = _a124[_i125];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i125)) & 1) !== 0))) {
                      _q122 = false;
                      break Q123;
                    }
                  }
                }
                _c126 = _q122;
              }
              if (!((_c126 && !(written(b, sp, cl, v_k))))) continue;
              _g115.push(v_k);
            }
          }
          const _g127: number[] = [];
          G128: {
            for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
              let _c138: boolean = (listLength(cl.numbers.digits[v_k]) === v_B.length);
              if (_c138) {
                let _q134 = true;
                Q135: {
                  const _a136 = v_B;
                  for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                    const v_x = _a136[_i137];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i137)) & 1) !== 0))) {
                      _q134 = false;
                      break Q135;
                    }
                  }
                }
                _c138 = _q134;
              }
              if (!((_c138 && !(written(b, sp, cl, v_k))))) continue;
              _g127.push(v_k);
            }
          }
          let _g139 = 0;
          G140: {
            let _g153 = 0;
            G154: {
              const _a157 = v_KA;
              for (let _i158 = 0; _i158 < _a157.length; _i158++) {
                const v_k = _a157[_i158];
                const _t159 = nth(cl.numbers.digits[v_k], v_A.indexOf(v_x));
                _g153 |= 1 << _t159;
              }
            }
            for (let _m160 = _g153; _m160 !== 0; _m160 &= _m160 - 1) {
              const v_d = 31 - Math.clz32(_m160 & -_m160);
              let _q161 = false;
              Q162: {
                const _a163 = v_KB;
                for (let _i164 = 0; _i164 < _a163.length; _i164++) {
                  const v_k = _a163[_i164];
                  if ((nth(cl.numbers.digits[v_k], v_B.indexOf(v_x)) === v_d)) {
                    _q161 = true;
                    break Q162;
                  }
                }
              }
              if (!(_q161)) continue;
              _g139 |= 1 << v_d;
            }
          }
          freshBinding("crossRuns", [(sp.cells.includes(v_x)), ((clueAt(cl.blank, v_x) < 0) && !((b.grid[v_x] !== 0))), sameSet(v_A, run(sp, cl, sp.rowOf[v_x], v_x)), sameSet(v_B, run(sp, cl, sp.colOf[v_x], v_x)), ((v_A.length >= 2) && (v_B.length >= 2)), sameSet(v_KA, _g115), sameSet(v_KB, _g127), (v_D === _g139), (popcount(v_D) === 1)], ["x in", "where of x", "A =", "B =", "where of B", "KA =", "KB =", "D =", "where of D"]);
        }
        facts.length = 0;
        changed = false;
        const _t165 = least(v_D);
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t165); changed = true; } else facts.push(PLACE, v_x, _t165); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, A: v_A.slice(), B: v_B.slice(), KA: v_KA.slice(), KB: v_KB.slice(), D: v_D }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface NarrowBinding {
  L: number;
  c: number;
  R: readonly number[];
  K: readonly number[];
  x: number;
}

const narrowFacts: number[] = [];
let narrowCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function narrow(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NarrowBinding> | null): number {
  const _g34: number[] = [];
  const _g54: number[] = [];
  const facts = narrowFacts;
  let fired = 0;
  let changed = false;
  if (narrowCands.length < sp.cells.length) narrowCands = new Int32Array(sp.cells.length);
  const cands = narrowCands;
  cands.fill(-1);
  const _a24 = sp.lines;
  for (let _i25 = 0; _i25 < _a24.length; _i25++) {
    const v_L = _a24[_i25];
    const _a26 = sp.lineCells[v_L];
    R2:
    for (let _i27 = 0; _i27 < _a26.length; _i27++) {
      const v_c = _a26[_i27];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L28: {
        const v_R = run(sp, cl, v_L, v_c);
        const _m90_0 = b.made[0];
        let _q29 = false;
        Q30: {
          const _a31 = v_R;
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_x = _a31[_i32];
            const _h33 = (b.grid[v_x] !== 0);
            if (!(_h33)) {
              _q29 = true;
              break Q30;
            }
          }
        }
        if (!(_q29)) break L28;
        const _h41 = v_R.length;
        const _m91_1 = b.made[1];
        _g34.length = 0;
        G35: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c46: boolean = (listLength(cl.numbers.digits[v_k]) === _h41);
            if (_c46) {
              let _q42 = true;
              Q43: {
                const _a44 = v_R;
                for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                  const v_x = _a44[_i45];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i45)) & 1) !== 0))) {
                    _q42 = false;
                    break Q43;
                  }
                }
              }
              _c46 = _q42;
            }
            if (!((_c46 && !(written(b, sp, cl, v_k))))) continue;
            _g34.push(v_k);
          }
        }
        const v_K = _g34;
        const _a47 = v_R;
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_x = _a47[_i48];
          const _h49 = (b.grid[v_x] !== 0);
          if (!(!(_h49))) continue;
          const _h89 = _i48;
          if (b.made[0] !== _m90_0 || b.made[1] !== _m91_1) {
            let _q50 = false;
            Q51: {
              const _a52 = v_R;
              for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                const v_x = _a52[_i53];
                if (!((b.grid[v_x] !== 0))) {
                  _q50 = true;
                  break Q51;
                }
              }
            }
            if (!(_q50)) { continue R2; }
            _g54.length = 0;
            G55: {
              for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                let _c65: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                if (_c65) {
                  let _q61 = true;
                  Q62: {
                    const _a63 = v_R;
                    for (let _i64 = 0; _i64 < _a63.length; _i64++) {
                      const v_x = _a63[_i64];
                      if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i64)) & 1) !== 0))) {
                        _q61 = false;
                        break Q62;
                      }
                    }
                  }
                  _c65 = _q61;
                }
                if (!((_c65 && !(written(b, sp, cl, v_k))))) continue;
                _g54.push(v_k);
              }
            }
            if (!(sameSet(v_K, _g54))) { continue R2; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _q66 = false;
            Q67: {
              const _a68 = v_R;
              for (let _i69 = 0; _i69 < _a68.length; _i69++) {
                const v_x = _a68[_i69];
                if (!((b.grid[v_x] !== 0))) {
                  _q66 = true;
                  break Q67;
                }
              }
            }
            const _g70: number[] = [];
            G71: {
              for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                let _c81: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                if (_c81) {
                  let _q77 = true;
                  Q78: {
                    const _a79 = v_R;
                    for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                      const v_x = _a79[_i80];
                      if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i80)) & 1) !== 0))) {
                        _q77 = false;
                        break Q78;
                      }
                    }
                  }
                  _c81 = _q77;
                }
                if (!((_c81 && !(written(b, sp, cl, v_k))))) continue;
                _g70.push(v_k);
              }
            }
            freshBinding("narrow", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q66, sameSet(v_K, _g70), (v_R.includes(v_x)), !((b.grid[v_x] !== 0))], ["L in", "c in", "where of c", "R =", "where of R", "K =", "x in", "where of x"]);
          }
          facts.length = 0;
          changed = false;
          let _q82 = true;
          Q83: {
            for (let _m84 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m84 !== 0; _m84 &= _m84 - 1) {
              const v_d = 31 - Math.clz32(_m84 & -_m84);
              let _q85 = false;
              Q86: {
                const _a87 = v_K;
                for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                  const v_k = _a87[_i88];
                  if ((nth(cl.numbers.digits[v_k], _h89) === v_d)) {
                    _q85 = true;
                    break Q86;
                  }
                }
              }
              if (!(!(_q85))) continue;
              if ((((b.cands[v_x] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_x, v_d); changed = true; } else facts.push(STRIKE, v_x, v_d); }
              if (!(true)) {
                _q82 = false;
                break Q83;
              }
            }
          }
          if (!(_q82)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice(), K: v_K.slice(), x: v_x }, facts)) return 1;
            cands.fill(-1);
          }
        }
      }
    }
  }
  return fired;
}

export interface MisreadBinding {
  L: number;
  c: number;
  R: readonly number[];
}

const misreadFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function misread(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MisreadBinding> | null): number {
  const facts = misreadFacts;
  let fired = 0;
  let changed = false;
  const _a10 = sp.lines;
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_L = _a10[_i11];
    const _a12 = sp.lineCells[v_L];
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_c = _a12[_i13];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L14: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q15 = true;
        Q16: {
          const _a17 = v_R;
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_x = _a17[_i18];
            const _h19 = (b.grid[v_x] !== 0);
            if (!(_h19)) {
              _q15 = false;
              break Q16;
            }
          }
        }
        if (!(_q15)) break L14;
        const _h26 = v_R.length;
        if (import.meta.env.DEV && staleChecking) {
          let _q20 = true;
          Q21: {
            const _a22 = v_R;
            for (let _i23 = 0; _i23 < _a22.length; _i23++) {
              const v_x = _a22[_i23];
              if (!((b.grid[v_x] !== 0))) {
                _q20 = false;
                break Q21;
              }
            }
          }
          freshBinding("misread", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q20], ["L in", "c in", "where of c", "R =", "where of R"]);
        }
        facts.length = 0;
        changed = false;
        let _q24 = false;
        Q25: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c32: boolean = (listLength(cl.numbers.digits[v_k]) === _h26);
            if (_c32) {
              let _q27 = true;
              Q28: {
                const _a29 = v_R;
                for (let _i30 = 0; _i30 < _a29.length; _i30++) {
                  const v_x = _a29[_i30];
                  const _h31 = (b.grid[v_x] || -1);
                  if (!((_h31 === nth(cl.numbers.digits[v_k], _i30)))) {
                    _q27 = false;
                    break Q28;
                  }
                }
              }
              _c32 = _q27;
            }
            if (_c32) {
              _q24 = true;
              break Q25;
            }
          }
        }
        if (!(_q24)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface TwiceBinding {
  k: number;
}

const twiceFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function twice(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwiceBinding> | null): number {
  const facts = twiceFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
    facts.length = 0;
    changed = false;
    let _g1 = 0;
    G2: {
      const _a3 = sp.lines;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_L = _a3[_i4];
        const _a5 = sp.lineCells[v_L];
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_c = _a5[_i6];
          let _c15: boolean = head(sp, cl, v_L, v_c);
          if (_c15) {
            const _t7 = run(sp, cl, v_L, v_c);
            const _h8 = _t7.length;
            let _c14: boolean = (listLength(cl.numbers.digits[v_k]) === _h8);
            if (_c14) {
              let _q9 = true;
              Q10: {
                const _a11 = _t7;
                for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                  const v_x = _a11[_i12];
                  const _h13 = (b.grid[v_x] || -1);
                  if (!((_h13 === nth(cl.numbers.digits[v_k], _i12)))) {
                    _q9 = false;
                    break Q10;
                  }
                }
              }
              _c14 = _q9;
            }
            _c15 = _c14;
          }
          if (!(_c15)) continue;
          _g1++;
        }
      }
    }
    if (!((_g1 < 2))) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

const runKept = keptStore<Kept<readonly number[]>>();
let runOn: object | null = null;
let runAt: Kept<Kept<readonly number[]>> = [];

/** `run(L, c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function run(sp: GridSpace, cl: Dealt, v_L: number, v_c: number): readonly number[] {
  if (cl !== runOn) {
    runAt = runKept.board(cl);
    runOn = cl;
  }
  const _kept: Kept<Kept<readonly number[]>> = runAt;
  const _kept1 = (_kept[v_L] ??= []);
  if (_kept1[v_c] !== undefined) return _kept1[v_c];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.cells;
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_c = _a5[_i6];
      if (!((clueAt(cl.blank, v_c) < 0))) continue;
      _g1.push(v_c);
    }
  }
  const _made = stretch(sp.lineCells[v_L], v_c, _g1);
  _kept1[v_c] = _made;
  return _made;
}

const headKept = keptStore<Kept<boolean>>();
let headOn: object | null = null;
let headAt: Kept<Kept<boolean>> = [];

/** `head(L, c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function head(sp: GridSpace, cl: Dealt, v_L: number, v_c: number): boolean {
  if (cl !== headOn) {
    headAt = headKept.board(cl);
    headOn = cl;
  }
  const _kept: Kept<Kept<boolean>> = headAt;
  const _kept1 = (_kept[v_L] ??= []);
  if (_kept1[v_c] !== undefined) return _kept1[v_c];
  let _c2: boolean = ((clueAt(cl.blank, v_c) < 0) && (run(sp, cl, v_L, v_c).length >= 2));
  if (_c2) {
    const _t1 = run(sp, cl, v_L, v_c);
    _c2 = ((_t1.length > 0 ? _t1[0] : -1) === v_c);
  }
  const _made = _c2;
  _kept1[v_c] = _made;
  return _made;
}

const writtenKept = keptStore<boolean>();

/** `written(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function written(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): boolean {
  const _kept: Kept<boolean> = writtenKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _q1 = false;
  Q2: {
    const _t3 = nth(cl.numbers.digits[v_k], 0);
    const _a4 = cellsValued(b, sp.cells, _t3);
    for (let _i5 = 0; _i5 < _a4.length; _i5++) {
      const v_c = _a4[_i5];
      if (!(((b.grid[v_c] || -1) === nth(cl.numbers.digits[v_k], 0)))) continue;
      const _t6 = sp.rowOf[v_c];
      const _t7 = sp.colOf[v_c];
      for (let _i8 = 0; _i8 < 2; _i8++) {
        const v_L = _i8 === 0 ? _t6 : _t7;
        if (_i8 === 1 && (v_L === _t6)) continue;
        if (!(head(sp, cl, v_L, v_c))) continue;
        const _t9 = run(sp, cl, v_L, v_c);
        let _c14: boolean = (listLength(cl.numbers.digits[v_k]) === _t9.length);
        if (_c14) {
          let _q10 = true;
          Q11: {
            const _a12 = _t9;
            for (let _i13 = 0; _i13 < _a12.length; _i13++) {
              const v_x = _a12[_i13];
              if (!(((b.grid[v_x] || -1) === nth(cl.numbers.digits[v_k], _i13)))) {
                _q10 = false;
                break Q11;
              }
            }
          }
          _c14 = _q10;
        }
        if (_c14) {
          _q1 = true;
          break Q2;
        }
      }
    }
  }
  const _made = _q1;
  _kept[v_k] = _made;
  return _made;
}
