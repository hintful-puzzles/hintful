// Compiled by `npm run describe` from src/games/crossing/crossing.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, cellsValued, clueAt, keptStore, least, listLength, nth, popcount, sameList, sameSet, stretch, type Kept } from "../../engine/describe-runtime.ts";

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
  let _q465 = true;
  Q466: {
    const _a467 = sp.lines;
    for (let _i468 = 0; _i468 < _a467.length; _i468++) {
      const v_L = _a467[_i468];
      const _a469 = sp.lineCells[v_L];
      for (let _i470 = 0; _i470 < _a469.length; _i470++) {
        const v_c = _a469[_i470];
        if (!(head(sp, cl, v_L, v_c))) continue;
        let _q471 = false;
        Q472: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            const _t473 = run(sp, cl, v_L, v_c);
            const _h474 = _t473.length;
            let _c480: boolean = (listLength(cl.numbers.digits[v_k]) === _h474);
            if (_c480) {
              let _q475 = true;
              Q476: {
                const _a477 = _t473;
                for (let _i478 = 0; _i478 < _a477.length; _i478++) {
                  const v_x = _a477[_i478];
                  const _h479 = (g[v_x] || -1);
                  if (!((_h479 === nth(cl.numbers.digits[v_k], _i478)))) {
                    _q475 = false;
                    break Q476;
                  }
                }
              }
              _c480 = _q475;
            }
            if (_c480) {
              _q471 = true;
              break Q472;
            }
          }
        }
        if (!(_q471)) {
          _q465 = false;
          break Q466;
        }
      }
    }
  }
  if (!(_q465)) return false;
  let _q481 = true;
  Q482: {
    for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
      for (let v_j = 0; v_j < cl.numbers.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!(!sameList(cl.numbers.digits[v_j], cl.numbers.digits[v_k]))) {
          _q481 = false;
          break Q482;
        }
      }
    }
  }
  if (!(_q481)) return false;
  for (let _k483 = 0; _k483 < cl.blank.at.length; _k483++) {
    const _at484 = cl.blank.at[_k483];
    if (!(((g[_at484] || -1) === 10))) return false;
  }
  for (let _k486 = 0; _k486 < cl.numbers.n; _k486++) {
    let _g489 = 0;
    G490: {
      const _a491 = sp.lines;
      for (let _i492 = 0; _i492 < _a491.length; _i492++) {
        const v_L = _a491[_i492];
        const _a493 = sp.lineCells[v_L];
        for (let _i494 = 0; _i494 < _a493.length; _i494++) {
          const v_c = _a493[_i494];
          let _c503: boolean = head(sp, cl, v_L, v_c);
          if (_c503) {
            const _t495 = run(sp, cl, v_L, v_c);
            const _h496 = _t495.length;
            let _c502: boolean = (listLength(cl.numbers.digits[_k486]) === _h496);
            if (_c502) {
              let _q497 = true;
              Q498: {
                const _a499 = _t495;
                for (let _i500 = 0; _i500 < _a499.length; _i500++) {
                  const v_x = _a499[_i500];
                  const _h501 = (g[v_x] || -1);
                  if (!((_h501 === nth(cl.numbers.digits[_k486], _i500)))) {
                    _q497 = false;
                    break Q498;
                  }
                }
              }
              _c502 = _q497;
            }
            _c503 = _c502;
          }
          if (!(_c503)) continue;
          _g489++;
        }
      }
    }
    if (!((_g489 === 1))) return false;
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
  const _g56: number[] = [];
  const facts = onlyNumberFacts;
  let fired = 0;
  let changed = false;
  const _a47 = sp.lines;
  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
    const v_L = _a47[_i48];
    const _a49 = sp.lineCells[v_L];
    for (let _i50 = 0; _i50 < _a49.length; _i50++) {
      const v_c = _a49[_i50];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L51: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q52 = false;
        Q53: {
          const _a54 = v_R;
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_x = _a54[_i55];
            if (!((b.grid[v_x] !== 0))) {
              _q52 = true;
              break Q53;
            }
          }
        }
        if (!(_q52)) break L51;
        const _h63 = v_R.length;
        _g56.length = 0;
        G57: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c68: boolean = (listLength(cl.numbers.digits[v_k]) === _h63);
            if (_c68) {
              let _q64 = true;
              Q65: {
                const _a66 = v_R;
                for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                  const v_x = _a66[_i67];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i67)) & 1) !== 0))) {
                    _q64 = false;
                    break Q65;
                  }
                }
              }
              _c68 = _q64;
            }
            if (!((_c68 && !(written(b, sp, cl, v_k))))) continue;
            _g56.push(v_k);
          }
        }
        L69: {
          const v_K = _g56;
          const _h70 = v_K.length;
          if (!((_h70 < 2))) break L69;
          facts.length = 0;
          changed = false;
          let _c77: boolean = (_h70 === 1);
          if (_c77) {
            let _q71 = true;
            Q72: {
              const _a73 = v_R;
              for (let _i74 = 0; _i74 < _a73.length; _i74++) {
                const v_x = _a73[_i74];
                if (!(!((b.grid[v_x] !== 0)))) continue;
                const _t75 = (v_K.length > 0 ? v_K[0] : -1);
                const _t76 = nth(cl.numbers.digits[_t75], _i74);
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t76); changed = true; } else facts.push(PLACE, v_x, _t76); }
                if (!(true)) {
                  _q71 = false;
                  break Q72;
                }
              }
            }
            _c77 = _q71;
          }
          if (!(_c77)) return -1;
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
    const _m33_0 = b.made[0];
    const _m33_1 = b.made[1];
    let _c117: boolean = !(written(b, sp, cl, v_k));
    if (_c117) {
      let _g103 = 0;
      G104: {
        const _a105 = sp.lines;
        for (let _i106 = 0; _i106 < _a105.length; _i106++) {
          const v_M = _a105[_i106];
          const _a107 = sp.lineCells[v_M];
          for (let _i108 = 0; _i108 < _a107.length; _i108++) {
            const v_b = _a107[_i108];
            let _c116: boolean = head(sp, cl, v_M, v_b);
            if (_c116) {
              const _t109 = run(sp, cl, v_M, v_b);
              const _h110 = _t109.length;
              let _c115: boolean = (listLength(cl.numbers.digits[v_k]) === _h110);
              if (_c115) {
                let _q111 = true;
                Q112: {
                  const _a113 = _t109;
                  for (let _i114 = 0; _i114 < _a113.length; _i114++) {
                    const v_x = _a113[_i114];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i114)) & 1) !== 0))) {
                      _q111 = false;
                      break Q112;
                    }
                  }
                }
                _c115 = _q111;
              }
              _c116 = _c115;
            }
            if (!(_c116)) continue;
            _g103++;
          }
        }
      }
      _c117 = (_g103 === 1);
    }
    if (!(_c117)) continue;
    const _a118 = sp.lines;
    for (let _i119 = 0; _i119 < _a118.length; _i119++) {
      const v_L = _a118[_i119];
      const _a120 = sp.lineCells[v_L];
      for (let _i121 = 0; _i121 < _a120.length; _i121++) {
        const v_c = _a120[_i121];
        let _c129: boolean = head(sp, cl, v_L, v_c);
        if (_c129) {
          const _t122 = run(sp, cl, v_L, v_c);
          const _h123 = _t122.length;
          let _c128: boolean = (listLength(cl.numbers.digits[v_k]) === _h123);
          if (_c128) {
            let _q124 = true;
            Q125: {
              const _a126 = _t122;
              for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                const v_x = _a126[_i127];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i127)) & 1) !== 0))) {
                  _q124 = false;
                  break Q125;
                }
              }
            }
            _c128 = _q124;
          }
          _c129 = _c128;
        }
        if (!(_c129)) continue;
        const v_R = run(sp, cl, v_L, v_c);
        if (b.made[0] !== _m33_0 || b.made[1] !== _m33_1) {
          let _c143: boolean = !(written(b, sp, cl, v_k));
          if (_c143) {
            let _g130 = 0;
            G131: {
              const _a132 = sp.lines;
              for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                const v_M = _a132[_i133];
                const _a134 = sp.lineCells[v_M];
                for (let _i135 = 0; _i135 < _a134.length; _i135++) {
                  const v_b = _a134[_i135];
                  let _c142: boolean = head(sp, cl, v_M, v_b);
                  if (_c142) {
                    const _t136 = run(sp, cl, v_M, v_b);
                    let _c141: boolean = (listLength(cl.numbers.digits[v_k]) === _t136.length);
                    if (_c141) {
                      let _q137 = true;
                      Q138: {
                        const _a139 = _t136;
                        for (let _i140 = 0; _i140 < _a139.length; _i140++) {
                          const v_x = _a139[_i140];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i140)) & 1) !== 0))) {
                            _q137 = false;
                            break Q138;
                          }
                        }
                      }
                      _c141 = _q137;
                    }
                    _c142 = _c141;
                  }
                  if (!(_c142)) continue;
                  _g130++;
                }
              }
            }
            _c143 = (_g130 === 1);
          }
          if (!(_c143)) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _q144 = true;
        Q145: {
          const _a146 = v_R;
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_x = _a146[_i147];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _t148 = nth(cl.numbers.digits[v_k], _i147);
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t148); changed = true; } else facts.push(PLACE, v_x, _t148); }
            if (!(true)) {
              _q144 = false;
              break Q145;
            }
          }
        }
        if (!(_q144)) return -1;
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
  const _g190: number[] = [];
  const _g221: number[] = [];
  const facts = sharedDigitFacts;
  let fired = 0;
  let changed = false;
  const _a181 = sp.lines;
  for (let _i182 = 0; _i182 < _a181.length; _i182++) {
    const v_L = _a181[_i182];
    const _a183 = sp.lineCells[v_L];
    R2:
    for (let _i184 = 0; _i184 < _a183.length; _i184++) {
      const v_c = _a183[_i184];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L185: {
        const v_R = run(sp, cl, v_L, v_c);
        const _m69_0 = b.made[0];
        let _q186 = false;
        Q187: {
          const _a188 = v_R;
          for (let _i189 = 0; _i189 < _a188.length; _i189++) {
            const v_x = _a188[_i189];
            if (!((b.grid[v_x] !== 0))) {
              _q186 = true;
              break Q187;
            }
          }
        }
        if (!(_q186)) break L185;
        const _h197 = v_R.length;
        const _m73_1 = b.made[1];
        _g190.length = 0;
        G191: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c202: boolean = (listLength(cl.numbers.digits[v_k]) === _h197);
            if (_c202) {
              let _q198 = true;
              Q199: {
                const _a200 = v_R;
                for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                  const v_x = _a200[_i201];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i201)) & 1) !== 0))) {
                    _q198 = false;
                    break Q199;
                  }
                }
              }
              _c202 = _q198;
            }
            if (!((_c202 && !(written(b, sp, cl, v_k))))) continue;
            _g190.push(v_k);
          }
        }
        L203: {
          const v_K = _g190;
          const _h204 = v_K.length;
          if (!((_h204 > 0))) break L203;
          const _a205 = v_R;
          for (let _i206 = 0; _i206 < _a205.length; _i206++) {
            const v_x = _a205[_i206];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _h213 = _i206;
            let _g207 = 0;
            G208: {
              const _a211 = v_K;
              for (let _i212 = 0; _i212 < _a211.length; _i212++) {
                const v_k = _a211[_i212];
                const _t214 = nth(cl.numbers.digits[v_k], _h213);
                _g207 |= 1 << _t214;
              }
            }
            L215: {
              const v_D = _g207;
              const _h216 = popcount(v_D);
              if (!((_h216 === 1))) break L215;
              if (b.made[0] !== _m69_0 || b.made[1] !== _m73_1) {
                let _q217 = false;
                Q218: {
                  const _a219 = v_R;
                  for (let _i220 = 0; _i220 < _a219.length; _i220++) {
                    const v_x = _a219[_i220];
                    if (!((b.grid[v_x] !== 0))) {
                      _q217 = true;
                      break Q218;
                    }
                  }
                }
                if (!(_q217)) { continue R2; }
                _g221.length = 0;
                G222: {
                  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                    let _c232: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                    if (_c232) {
                      let _q228 = true;
                      Q229: {
                        const _a230 = v_R;
                        for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                          const v_x = _a230[_i231];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i231)) & 1) !== 0))) {
                            _q228 = false;
                            break Q229;
                          }
                        }
                      }
                      _c232 = _q228;
                    }
                    if (!((_c232 && !(written(b, sp, cl, v_k))))) continue;
                    _g221.push(v_k);
                  }
                }
                if (!(sameSet(v_K, _g221))) { continue R2; }
              }
              facts.length = 0;
              changed = false;
              const _t233 = least(v_D);
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t233); changed = true; } else facts.push(PLACE, v_x, _t233); }
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
  const _g294: number[] = [];
  const _g306: number[] = [];
  const facts = crossRunsFacts;
  let fired = 0;
  let changed = false;
  const _a288 = sp.cells;
  for (let _i289 = 0; _i289 < _a288.length; _i289++) {
    const v_x = _a288[_i289];
    const _h290 = clueAt(cl.blank, v_x);
    if (!(((_h290 < 0) && !((b.grid[v_x] !== 0))))) continue;
    const v_A = run(sp, cl, sp.rowOf[v_x], v_x);
    const _h292 = v_A.length;
    const _h338 = v_A.indexOf(v_x);
    L291: {
      const v_B = run(sp, cl, sp.colOf[v_x], v_x);
      const _h293 = v_B.length;
      if (!(((_h292 >= 2) && (_h293 >= 2)))) break L291;
      const _h345 = v_B.indexOf(v_x);
      _g294.length = 0;
      G295: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c305: boolean = (listLength(cl.numbers.digits[v_k]) === _h292);
          if (_c305) {
            let _q301 = true;
            Q302: {
              const _a303 = v_A;
              for (let _i304 = 0; _i304 < _a303.length; _i304++) {
                const v_x = _a303[_i304];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i304)) & 1) !== 0))) {
                  _q301 = false;
                  break Q302;
                }
              }
            }
            _c305 = _q301;
          }
          if (!((_c305 && !(written(b, sp, cl, v_k))))) continue;
          _g294.push(v_k);
        }
      }
      const v_KA = _g294;
      _g306.length = 0;
      G307: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c317: boolean = (listLength(cl.numbers.digits[v_k]) === _h293);
          if (_c317) {
            let _q313 = true;
            Q314: {
              const _a315 = v_B;
              for (let _i316 = 0; _i316 < _a315.length; _i316++) {
                const v_x = _a315[_i316];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i316)) & 1) !== 0))) {
                  _q313 = false;
                  break Q314;
                }
              }
            }
            _c317 = _q313;
          }
          if (!((_c317 && !(written(b, sp, cl, v_k))))) continue;
          _g306.push(v_k);
        }
      }
      const v_KB = _g306;
      let _g318 = 0;
      G319: {
        let _g332 = 0;
        G333: {
          const _a336 = v_KA;
          for (let _i337 = 0; _i337 < _a336.length; _i337++) {
            const v_k = _a336[_i337];
            const _t339 = nth(cl.numbers.digits[v_k], _h338);
            _g332 |= 1 << _t339;
          }
        }
        for (let _m340 = _g332; _m340 !== 0; _m340 &= _m340 - 1) {
          const v_d = 31 - Math.clz32(_m340 & -_m340);
          let _q341 = false;
          Q342: {
            const _a343 = v_KB;
            for (let _i344 = 0; _i344 < _a343.length; _i344++) {
              const v_k = _a343[_i344];
              if ((nth(cl.numbers.digits[v_k], _h345) === v_d)) {
                _q341 = true;
                break Q342;
              }
            }
          }
          if (!(_q341)) continue;
          _g318 |= 1 << v_d;
        }
      }
      L346: {
        const v_D = _g318;
        const _h347 = popcount(v_D);
        if (!((_h347 === 1))) break L346;
        facts.length = 0;
        changed = false;
        const _t348 = least(v_D);
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t348); changed = true; } else facts.push(PLACE, v_x, _t348); }
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
  const _g382: number[] = [];
  const _g402: number[] = [];
  const facts = narrowFacts;
  let fired = 0;
  let changed = false;
  if (narrowCands.length < sp.cells.length) narrowCands = new Int32Array(sp.cells.length);
  const cands = narrowCands;
  cands.fill(-1);
  const _a372 = sp.lines;
  for (let _i373 = 0; _i373 < _a372.length; _i373++) {
    const v_L = _a372[_i373];
    const _a374 = sp.lineCells[v_L];
    R2:
    for (let _i375 = 0; _i375 < _a374.length; _i375++) {
      const v_c = _a374[_i375];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L376: {
        const v_R = run(sp, cl, v_L, v_c);
        const _m140_0 = b.made[0];
        let _q377 = false;
        Q378: {
          const _a379 = v_R;
          for (let _i380 = 0; _i380 < _a379.length; _i380++) {
            const v_x = _a379[_i380];
            const _h381 = (b.grid[v_x] !== 0);
            if (!(_h381)) {
              _q377 = true;
              break Q378;
            }
          }
        }
        if (!(_q377)) break L376;
        const _h389 = v_R.length;
        const _m144_1 = b.made[1];
        _g382.length = 0;
        G383: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c394: boolean = (listLength(cl.numbers.digits[v_k]) === _h389);
            if (_c394) {
              let _q390 = true;
              Q391: {
                const _a392 = v_R;
                for (let _i393 = 0; _i393 < _a392.length; _i393++) {
                  const v_x = _a392[_i393];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i393)) & 1) !== 0))) {
                    _q390 = false;
                    break Q391;
                  }
                }
              }
              _c394 = _q390;
            }
            if (!((_c394 && !(written(b, sp, cl, v_k))))) continue;
            _g382.push(v_k);
          }
        }
        const v_K = _g382;
        const _a395 = v_R;
        for (let _i396 = 0; _i396 < _a395.length; _i396++) {
          const v_x = _a395[_i396];
          const _h397 = (b.grid[v_x] !== 0);
          if (!(!(_h397))) continue;
          const _h421 = _i396;
          if (b.made[0] !== _m140_0 || b.made[1] !== _m144_1) {
            let _q398 = false;
            Q399: {
              const _a400 = v_R;
              for (let _i401 = 0; _i401 < _a400.length; _i401++) {
                const v_x = _a400[_i401];
                if (!((b.grid[v_x] !== 0))) {
                  _q398 = true;
                  break Q399;
                }
              }
            }
            if (!(_q398)) { continue R2; }
            _g402.length = 0;
            G403: {
              for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                let _c413: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                if (_c413) {
                  let _q409 = true;
                  Q410: {
                    const _a411 = v_R;
                    for (let _i412 = 0; _i412 < _a411.length; _i412++) {
                      const v_x = _a411[_i412];
                      if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i412)) & 1) !== 0))) {
                        _q409 = false;
                        break Q410;
                      }
                    }
                  }
                  _c413 = _q409;
                }
                if (!((_c413 && !(written(b, sp, cl, v_k))))) continue;
                _g402.push(v_k);
              }
            }
            if (!(sameSet(v_K, _g402))) { continue R2; }
          }
          facts.length = 0;
          changed = false;
          let _q414 = true;
          Q415: {
            for (let _m416 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m416 !== 0; _m416 &= _m416 - 1) {
              const v_d = 31 - Math.clz32(_m416 & -_m416);
              let _q417 = false;
              Q418: {
                const _a419 = v_K;
                for (let _i420 = 0; _i420 < _a419.length; _i420++) {
                  const v_k = _a419[_i420];
                  if ((nth(cl.numbers.digits[v_k], _h421) === v_d)) {
                    _q417 = true;
                    break Q418;
                  }
                }
              }
              if (!(!(_q417))) continue;
              if ((((b.cands[v_x] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_x, v_d); changed = true; } else facts.push(STRIKE, v_x, v_d); }
              if (!(true)) {
                _q414 = false;
                break Q415;
              }
            }
          }
          if (!(_q414)) return -1;
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
  const _a431 = sp.lines;
  for (let _i432 = 0; _i432 < _a431.length; _i432++) {
    const v_L = _a431[_i432];
    const _a433 = sp.lineCells[v_L];
    for (let _i434 = 0; _i434 < _a433.length; _i434++) {
      const v_c = _a433[_i434];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L435: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q436 = true;
        Q437: {
          const _a438 = v_R;
          for (let _i439 = 0; _i439 < _a438.length; _i439++) {
            const v_x = _a438[_i439];
            const _h440 = (b.grid[v_x] !== 0);
            if (!(_h440)) {
              _q436 = false;
              break Q437;
            }
          }
        }
        if (!(_q436)) break L435;
        const _h443 = v_R.length;
        facts.length = 0;
        changed = false;
        let _q441 = false;
        Q442: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c449: boolean = (listLength(cl.numbers.digits[v_k]) === _h443);
            if (_c449) {
              let _q444 = true;
              Q445: {
                const _a446 = v_R;
                for (let _i447 = 0; _i447 < _a446.length; _i447++) {
                  const v_x = _a446[_i447];
                  const _h448 = (b.grid[v_x] || -1);
                  if (!((_h448 === nth(cl.numbers.digits[v_k], _i447)))) {
                    _q444 = false;
                    break Q445;
                  }
                }
              }
              _c449 = _q444;
            }
            if (_c449) {
              _q441 = true;
              break Q442;
            }
          }
        }
        if (!(_q441)) return -1;
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
    let _g450 = 0;
    G451: {
      const _a452 = sp.lines;
      for (let _i453 = 0; _i453 < _a452.length; _i453++) {
        const v_L = _a452[_i453];
        const _a454 = sp.lineCells[v_L];
        for (let _i455 = 0; _i455 < _a454.length; _i455++) {
          const v_c = _a454[_i455];
          let _c464: boolean = head(sp, cl, v_L, v_c);
          if (_c464) {
            const _t456 = run(sp, cl, v_L, v_c);
            const _h457 = _t456.length;
            let _c463: boolean = (listLength(cl.numbers.digits[v_k]) === _h457);
            if (_c463) {
              let _q458 = true;
              Q459: {
                const _a460 = _t456;
                for (let _i461 = 0; _i461 < _a460.length; _i461++) {
                  const v_x = _a460[_i461];
                  const _h462 = (b.grid[v_x] || -1);
                  if (!((_h462 === nth(cl.numbers.digits[v_k], _i461)))) {
                    _q458 = false;
                    break Q459;
                  }
                }
              }
              _c463 = _q458;
            }
            _c464 = _c463;
          }
          if (!(_c464)) continue;
          _g450++;
        }
      }
    }
    if (!((_g450 < 2))) return -1;
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
  const _g7: number[] = [];
  G8: {
    const _a11 = sp.cells;
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_c = _a11[_i12];
      if (!((clueAt(cl.blank, v_c) < 0))) continue;
      _g7.push(v_c);
    }
  }
  const _made = stretch(sp.lineCells[v_L], v_c, _g7);
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
  let _c14: boolean = ((clueAt(cl.blank, v_c) < 0) && (run(sp, cl, v_L, v_c).length >= 2));
  if (_c14) {
    const _t13 = run(sp, cl, v_L, v_c);
    _c14 = ((_t13.length > 0 ? _t13[0] : -1) === v_c);
  }
  const _made = _c14;
  _kept1[v_c] = _made;
  return _made;
}

const writtenKept = keptStore<boolean>();

/** `written(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function written(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): boolean {
  const _kept: Kept<boolean> = writtenKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _q27 = false;
  Q28: {
    const _t29 = nth(cl.numbers.digits[v_k], 0);
    const _a30 = cellsValued(b, sp.cells, _t29);
    for (let _i31 = 0; _i31 < _a30.length; _i31++) {
      const v_c = _a30[_i31];
      if (!(((b.grid[v_c] || -1) === nth(cl.numbers.digits[v_k], 0)))) continue;
      const _t32 = sp.rowOf[v_c];
      const _t33 = sp.colOf[v_c];
      for (let _i34 = 0; _i34 < 2; _i34++) {
        const v_L = _i34 === 0 ? _t32 : _t33;
        if (_i34 === 1 && (v_L === _t32)) continue;
        if (!(head(sp, cl, v_L, v_c))) continue;
        const _t35 = run(sp, cl, v_L, v_c);
        let _c40: boolean = (listLength(cl.numbers.digits[v_k]) === _t35.length);
        if (_c40) {
          let _q36 = true;
          Q37: {
            const _a38 = _t35;
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_x = _a38[_i39];
              if (!(((b.grid[v_x] || -1) === nth(cl.numbers.digits[v_k], _i39)))) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c40 = _q36;
        }
        if (_c40) {
          _q27 = true;
          break Q28;
        }
      }
    }
  }
  const _made = _q27;
  _kept[v_k] = _made;
  return _made;
}
