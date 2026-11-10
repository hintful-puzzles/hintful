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
  let _q595 = true;
  Q596: {
    const _a597 = sp.lines;
    for (let _i598 = 0; _i598 < _a597.length; _i598++) {
      const v_L = _a597[_i598];
      const _a599 = sp.lineCells[v_L];
      for (let _i600 = 0; _i600 < _a599.length; _i600++) {
        const v_c = _a599[_i600];
        if (!(head(sp, cl, v_L, v_c))) continue;
        let _q601 = false;
        Q602: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            const _t603 = run(sp, cl, v_L, v_c);
            const _h604 = _t603.length;
            let _c610: boolean = (listLength(cl.numbers.digits[v_k]) === _h604);
            if (_c610) {
              let _q605 = true;
              Q606: {
                const _a607 = _t603;
                for (let _i608 = 0; _i608 < _a607.length; _i608++) {
                  const v_x = _a607[_i608];
                  const _h609 = (g[v_x] || -1);
                  if (!((_h609 === nth(cl.numbers.digits[v_k], _i608)))) {
                    _q605 = false;
                    break Q606;
                  }
                }
              }
              _c610 = _q605;
            }
            if (_c610) {
              _q601 = true;
              break Q602;
            }
          }
        }
        if (!(_q601)) {
          _q595 = false;
          break Q596;
        }
      }
    }
  }
  if (!(_q595)) return false;
  let _q611 = true;
  Q612: {
    for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
      for (let v_j = 0; v_j < cl.numbers.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!(!sameList(cl.numbers.digits[v_j], cl.numbers.digits[v_k]))) {
          _q611 = false;
          break Q612;
        }
      }
    }
  }
  if (!(_q611)) return false;
  for (let _k613 = 0; _k613 < cl.blank.at.length; _k613++) {
    const _at614 = cl.blank.at[_k613];
    if (!(((g[_at614] || -1) === 10))) return false;
  }
  for (let _k616 = 0; _k616 < cl.numbers.n; _k616++) {
    let _g619 = 0;
    G620: {
      const _a621 = sp.lines;
      for (let _i622 = 0; _i622 < _a621.length; _i622++) {
        const v_L = _a621[_i622];
        const _a623 = sp.lineCells[v_L];
        for (let _i624 = 0; _i624 < _a623.length; _i624++) {
          const v_c = _a623[_i624];
          let _c633: boolean = head(sp, cl, v_L, v_c);
          if (_c633) {
            const _t625 = run(sp, cl, v_L, v_c);
            const _h626 = _t625.length;
            let _c632: boolean = (listLength(cl.numbers.digits[_k616]) === _h626);
            if (_c632) {
              let _q627 = true;
              Q628: {
                const _a629 = _t625;
                for (let _i630 = 0; _i630 < _a629.length; _i630++) {
                  const v_x = _a629[_i630];
                  const _h631 = (g[v_x] || -1);
                  if (!((_h631 === nth(cl.numbers.digits[_k616], _i630)))) {
                    _q627 = false;
                    break Q628;
                  }
                }
              }
              _c632 = _q627;
            }
            _c633 = _c632;
          }
          if (!(_c633)) continue;
          _g619++;
        }
      }
    }
    if (!((_g619 === 1))) return false;
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
          if (import.meta.env.DEV && staleChecking) {
            let _q71 = false;
            Q72: {
              const _a73 = v_R;
              for (let _i74 = 0; _i74 < _a73.length; _i74++) {
                const v_x = _a73[_i74];
                if (!((b.grid[v_x] !== 0))) {
                  _q71 = true;
                  break Q72;
                }
              }
            }
            const _g75: number[] = [];
            G76: {
              for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                let _c86: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                if (_c86) {
                  let _q82 = true;
                  Q83: {
                    const _a84 = v_R;
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
                if (!((_c86 && !(written(b, sp, cl, v_k))))) continue;
                _g75.push(v_k);
              }
            }
            freshBinding("onlyNumber", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q71, sameSet(v_K, _g75), (v_K.length < 2)], ["L in", "c in", "where of c", "R =", "where of R", "K =", "where of K"]);
          }
          facts.length = 0;
          changed = false;
          let _c93: boolean = (_h70 === 1);
          if (_c93) {
            let _q87 = true;
            Q88: {
              const _a89 = v_R;
              for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                const v_x = _a89[_i90];
                if (!(!((b.grid[v_x] !== 0)))) continue;
                const _t91 = (v_K.length > 0 ? v_K[0] : -1);
                const _t92 = nth(cl.numbers.digits[_t91], _i90);
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t92); changed = true; } else facts.push(PLACE, v_x, _t92); }
                if (!(true)) {
                  _q87 = false;
                  break Q88;
                }
              }
            }
            _c93 = _q87;
          }
          if (!(_c93)) return -1;
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
    let _c133: boolean = !(written(b, sp, cl, v_k));
    if (_c133) {
      let _g119 = 0;
      G120: {
        const _a121 = sp.lines;
        for (let _i122 = 0; _i122 < _a121.length; _i122++) {
          const v_M = _a121[_i122];
          const _a123 = sp.lineCells[v_M];
          for (let _i124 = 0; _i124 < _a123.length; _i124++) {
            const v_b = _a123[_i124];
            let _c132: boolean = head(sp, cl, v_M, v_b);
            if (_c132) {
              const _t125 = run(sp, cl, v_M, v_b);
              const _h126 = _t125.length;
              let _c131: boolean = (listLength(cl.numbers.digits[v_k]) === _h126);
              if (_c131) {
                let _q127 = true;
                Q128: {
                  const _a129 = _t125;
                  for (let _i130 = 0; _i130 < _a129.length; _i130++) {
                    const v_x = _a129[_i130];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i130)) & 1) !== 0))) {
                      _q127 = false;
                      break Q128;
                    }
                  }
                }
                _c131 = _q127;
              }
              _c132 = _c131;
            }
            if (!(_c132)) continue;
            _g119++;
          }
        }
      }
      _c133 = (_g119 === 1);
    }
    if (!(_c133)) continue;
    const _a134 = sp.lines;
    for (let _i135 = 0; _i135 < _a134.length; _i135++) {
      const v_L = _a134[_i135];
      const _a136 = sp.lineCells[v_L];
      for (let _i137 = 0; _i137 < _a136.length; _i137++) {
        const v_c = _a136[_i137];
        let _c145: boolean = head(sp, cl, v_L, v_c);
        if (_c145) {
          const _t138 = run(sp, cl, v_L, v_c);
          const _h139 = _t138.length;
          let _c144: boolean = (listLength(cl.numbers.digits[v_k]) === _h139);
          if (_c144) {
            let _q140 = true;
            Q141: {
              const _a142 = _t138;
              for (let _i143 = 0; _i143 < _a142.length; _i143++) {
                const v_x = _a142[_i143];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i143)) & 1) !== 0))) {
                  _q140 = false;
                  break Q141;
                }
              }
            }
            _c144 = _q140;
          }
          _c145 = _c144;
        }
        if (!(_c145)) continue;
        const v_R = run(sp, cl, v_L, v_c);
        if (b.made[0] !== _m33_0 || b.made[1] !== _m33_1) {
          let _c159: boolean = !(written(b, sp, cl, v_k));
          if (_c159) {
            let _g146 = 0;
            G147: {
              const _a148 = sp.lines;
              for (let _i149 = 0; _i149 < _a148.length; _i149++) {
                const v_M = _a148[_i149];
                const _a150 = sp.lineCells[v_M];
                for (let _i151 = 0; _i151 < _a150.length; _i151++) {
                  const v_b = _a150[_i151];
                  let _c158: boolean = head(sp, cl, v_M, v_b);
                  if (_c158) {
                    const _t152 = run(sp, cl, v_M, v_b);
                    let _c157: boolean = (listLength(cl.numbers.digits[v_k]) === _t152.length);
                    if (_c157) {
                      let _q153 = true;
                      Q154: {
                        const _a155 = _t152;
                        for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                          const v_x = _a155[_i156];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i156)) & 1) !== 0))) {
                            _q153 = false;
                            break Q154;
                          }
                        }
                      }
                      _c157 = _q153;
                    }
                    _c158 = _c157;
                  }
                  if (!(_c158)) continue;
                  _g146++;
                }
              }
            }
            _c159 = (_g146 === 1);
          }
          if (!(_c159)) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c173: boolean = !(written(b, sp, cl, v_k));
          if (_c173) {
            let _g160 = 0;
            G161: {
              const _a162 = sp.lines;
              for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                const v_M = _a162[_i163];
                const _a164 = sp.lineCells[v_M];
                for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                  const v_b = _a164[_i165];
                  let _c172: boolean = head(sp, cl, v_M, v_b);
                  if (_c172) {
                    const _t166 = run(sp, cl, v_M, v_b);
                    let _c171: boolean = (listLength(cl.numbers.digits[v_k]) === _t166.length);
                    if (_c171) {
                      let _q167 = true;
                      Q168: {
                        const _a169 = _t166;
                        for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                          const v_x = _a169[_i170];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i170)) & 1) !== 0))) {
                            _q167 = false;
                            break Q168;
                          }
                        }
                      }
                      _c171 = _q167;
                    }
                    _c172 = _c171;
                  }
                  if (!(_c172)) continue;
                  _g160++;
                }
              }
            }
            _c173 = (_g160 === 1);
          }
          let _c180: boolean = head(sp, cl, v_L, v_c);
          if (_c180) {
            const _t174 = run(sp, cl, v_L, v_c);
            let _c179: boolean = (listLength(cl.numbers.digits[v_k]) === _t174.length);
            if (_c179) {
              let _q175 = true;
              Q176: {
                const _a177 = _t174;
                for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                  const v_x = _a177[_i178];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i178)) & 1) !== 0))) {
                    _q175 = false;
                    break Q176;
                  }
                }
              }
              _c179 = _q175;
            }
            _c180 = _c179;
          }
          freshBinding("onlyRun", [_c173, (sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), _c180, sameSet(v_R, run(sp, cl, v_L, v_c))], ["where of k", "L in", "c in", "where of c", "R ="]);
        }
        facts.length = 0;
        changed = false;
        let _q181 = true;
        Q182: {
          const _a183 = v_R;
          for (let _i184 = 0; _i184 < _a183.length; _i184++) {
            const v_x = _a183[_i184];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _t185 = nth(cl.numbers.digits[v_k], _i184);
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t185); changed = true; } else facts.push(PLACE, v_x, _t185); }
            if (!(true)) {
              _q181 = false;
              break Q182;
            }
          }
        }
        if (!(_q181)) return -1;
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
  const _g227: number[] = [];
  const _g258: number[] = [];
  const facts = sharedDigitFacts;
  let fired = 0;
  let changed = false;
  const _a218 = sp.lines;
  for (let _i219 = 0; _i219 < _a218.length; _i219++) {
    const v_L = _a218[_i219];
    const _a220 = sp.lineCells[v_L];
    R2:
    for (let _i221 = 0; _i221 < _a220.length; _i221++) {
      const v_c = _a220[_i221];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L222: {
        const v_R = run(sp, cl, v_L, v_c);
        const _m69_0 = b.made[0];
        let _q223 = false;
        Q224: {
          const _a225 = v_R;
          for (let _i226 = 0; _i226 < _a225.length; _i226++) {
            const v_x = _a225[_i226];
            if (!((b.grid[v_x] !== 0))) {
              _q223 = true;
              break Q224;
            }
          }
        }
        if (!(_q223)) break L222;
        const _h234 = v_R.length;
        const _m73_1 = b.made[1];
        _g227.length = 0;
        G228: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c239: boolean = (listLength(cl.numbers.digits[v_k]) === _h234);
            if (_c239) {
              let _q235 = true;
              Q236: {
                const _a237 = v_R;
                for (let _i238 = 0; _i238 < _a237.length; _i238++) {
                  const v_x = _a237[_i238];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i238)) & 1) !== 0))) {
                    _q235 = false;
                    break Q236;
                  }
                }
              }
              _c239 = _q235;
            }
            if (!((_c239 && !(written(b, sp, cl, v_k))))) continue;
            _g227.push(v_k);
          }
        }
        L240: {
          const v_K = _g227;
          const _h241 = v_K.length;
          if (!((_h241 > 0))) break L240;
          const _a242 = v_R;
          for (let _i243 = 0; _i243 < _a242.length; _i243++) {
            const v_x = _a242[_i243];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _h250 = _i243;
            let _g244 = 0;
            G245: {
              const _a248 = v_K;
              for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                const v_k = _a248[_i249];
                const _t251 = nth(cl.numbers.digits[v_k], _h250);
                _g244 |= 1 << _t251;
              }
            }
            L252: {
              const v_D = _g244;
              const _h253 = popcount(v_D);
              if (!((_h253 === 1))) break L252;
              if (b.made[0] !== _m69_0 || b.made[1] !== _m73_1) {
                let _q254 = false;
                Q255: {
                  const _a256 = v_R;
                  for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                    const v_x = _a256[_i257];
                    if (!((b.grid[v_x] !== 0))) {
                      _q254 = true;
                      break Q255;
                    }
                  }
                }
                if (!(_q254)) { continue R2; }
                _g258.length = 0;
                G259: {
                  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                    let _c269: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                    if (_c269) {
                      let _q265 = true;
                      Q266: {
                        const _a267 = v_R;
                        for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                          const v_x = _a267[_i268];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i268)) & 1) !== 0))) {
                            _q265 = false;
                            break Q266;
                          }
                        }
                      }
                      _c269 = _q265;
                    }
                    if (!((_c269 && !(written(b, sp, cl, v_k))))) continue;
                    _g258.push(v_k);
                  }
                }
                if (!(sameSet(v_K, _g258))) { continue R2; }
              }
              if (import.meta.env.DEV && staleChecking) {
                let _q270 = false;
                Q271: {
                  const _a272 = v_R;
                  for (let _i273 = 0; _i273 < _a272.length; _i273++) {
                    const v_x = _a272[_i273];
                    if (!((b.grid[v_x] !== 0))) {
                      _q270 = true;
                      break Q271;
                    }
                  }
                }
                const _g274: number[] = [];
                G275: {
                  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                    let _c285: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                    if (_c285) {
                      let _q281 = true;
                      Q282: {
                        const _a283 = v_R;
                        for (let _i284 = 0; _i284 < _a283.length; _i284++) {
                          const v_x = _a283[_i284];
                          if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i284)) & 1) !== 0))) {
                            _q281 = false;
                            break Q282;
                          }
                        }
                      }
                      _c285 = _q281;
                    }
                    if (!((_c285 && !(written(b, sp, cl, v_k))))) continue;
                    _g274.push(v_k);
                  }
                }
                let _g286 = 0;
                G287: {
                  const _a290 = v_K;
                  for (let _i291 = 0; _i291 < _a290.length; _i291++) {
                    const v_k = _a290[_i291];
                    const _t292 = nth(cl.numbers.digits[v_k], _i243);
                    _g286 |= 1 << _t292;
                  }
                }
                freshBinding("sharedDigit", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q270, sameSet(v_K, _g274), (v_K.length > 0), (v_R.includes(v_x)), !((b.grid[v_x] !== 0)), (v_D === _g286), (popcount(v_D) === 1)], ["L in", "c in", "where of c", "R =", "where of R", "K =", "where of K", "x in", "where of x", "D =", "where of D"]);
              }
              facts.length = 0;
              changed = false;
              const _t293 = least(v_D);
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t293); changed = true; } else facts.push(PLACE, v_x, _t293); }
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
  const _g354: number[] = [];
  const _g366: number[] = [];
  const facts = crossRunsFacts;
  let fired = 0;
  let changed = false;
  const _a348 = sp.cells;
  for (let _i349 = 0; _i349 < _a348.length; _i349++) {
    const v_x = _a348[_i349];
    const _h350 = clueAt(cl.blank, v_x);
    if (!(((_h350 < 0) && !((b.grid[v_x] !== 0))))) continue;
    const v_A = run(sp, cl, sp.rowOf[v_x], v_x);
    const _h352 = v_A.length;
    const _h398 = v_A.indexOf(v_x);
    L351: {
      const v_B = run(sp, cl, sp.colOf[v_x], v_x);
      const _h353 = v_B.length;
      if (!(((_h352 >= 2) && (_h353 >= 2)))) break L351;
      const _h405 = v_B.indexOf(v_x);
      _g354.length = 0;
      G355: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c365: boolean = (listLength(cl.numbers.digits[v_k]) === _h352);
          if (_c365) {
            let _q361 = true;
            Q362: {
              const _a363 = v_A;
              for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                const v_x = _a363[_i364];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i364)) & 1) !== 0))) {
                  _q361 = false;
                  break Q362;
                }
              }
            }
            _c365 = _q361;
          }
          if (!((_c365 && !(written(b, sp, cl, v_k))))) continue;
          _g354.push(v_k);
        }
      }
      const v_KA = _g354;
      _g366.length = 0;
      G367: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c377: boolean = (listLength(cl.numbers.digits[v_k]) === _h353);
          if (_c377) {
            let _q373 = true;
            Q374: {
              const _a375 = v_B;
              for (let _i376 = 0; _i376 < _a375.length; _i376++) {
                const v_x = _a375[_i376];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i376)) & 1) !== 0))) {
                  _q373 = false;
                  break Q374;
                }
              }
            }
            _c377 = _q373;
          }
          if (!((_c377 && !(written(b, sp, cl, v_k))))) continue;
          _g366.push(v_k);
        }
      }
      const v_KB = _g366;
      let _g378 = 0;
      G379: {
        let _g392 = 0;
        G393: {
          const _a396 = v_KA;
          for (let _i397 = 0; _i397 < _a396.length; _i397++) {
            const v_k = _a396[_i397];
            const _t399 = nth(cl.numbers.digits[v_k], _h398);
            _g392 |= 1 << _t399;
          }
        }
        for (let _m400 = _g392; _m400 !== 0; _m400 &= _m400 - 1) {
          const v_d = 31 - Math.clz32(_m400 & -_m400);
          let _q401 = false;
          Q402: {
            const _a403 = v_KB;
            for (let _i404 = 0; _i404 < _a403.length; _i404++) {
              const v_k = _a403[_i404];
              if ((nth(cl.numbers.digits[v_k], _h405) === v_d)) {
                _q401 = true;
                break Q402;
              }
            }
          }
          if (!(_q401)) continue;
          _g378 |= 1 << v_d;
        }
      }
      L406: {
        const v_D = _g378;
        const _h407 = popcount(v_D);
        if (!((_h407 === 1))) break L406;
        if (import.meta.env.DEV && staleChecking) {
          const _g408: number[] = [];
          G409: {
            for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
              let _c419: boolean = (listLength(cl.numbers.digits[v_k]) === v_A.length);
              if (_c419) {
                let _q415 = true;
                Q416: {
                  const _a417 = v_A;
                  for (let _i418 = 0; _i418 < _a417.length; _i418++) {
                    const v_x = _a417[_i418];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i418)) & 1) !== 0))) {
                      _q415 = false;
                      break Q416;
                    }
                  }
                }
                _c419 = _q415;
              }
              if (!((_c419 && !(written(b, sp, cl, v_k))))) continue;
              _g408.push(v_k);
            }
          }
          const _g420: number[] = [];
          G421: {
            for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
              let _c431: boolean = (listLength(cl.numbers.digits[v_k]) === v_B.length);
              if (_c431) {
                let _q427 = true;
                Q428: {
                  const _a429 = v_B;
                  for (let _i430 = 0; _i430 < _a429.length; _i430++) {
                    const v_x = _a429[_i430];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i430)) & 1) !== 0))) {
                      _q427 = false;
                      break Q428;
                    }
                  }
                }
                _c431 = _q427;
              }
              if (!((_c431 && !(written(b, sp, cl, v_k))))) continue;
              _g420.push(v_k);
            }
          }
          let _g432 = 0;
          G433: {
            let _g446 = 0;
            G447: {
              const _a450 = v_KA;
              for (let _i451 = 0; _i451 < _a450.length; _i451++) {
                const v_k = _a450[_i451];
                const _t452 = nth(cl.numbers.digits[v_k], v_A.indexOf(v_x));
                _g446 |= 1 << _t452;
              }
            }
            for (let _m453 = _g446; _m453 !== 0; _m453 &= _m453 - 1) {
              const v_d = 31 - Math.clz32(_m453 & -_m453);
              let _q454 = false;
              Q455: {
                const _a456 = v_KB;
                for (let _i457 = 0; _i457 < _a456.length; _i457++) {
                  const v_k = _a456[_i457];
                  if ((nth(cl.numbers.digits[v_k], v_B.indexOf(v_x)) === v_d)) {
                    _q454 = true;
                    break Q455;
                  }
                }
              }
              if (!(_q454)) continue;
              _g432 |= 1 << v_d;
            }
          }
          freshBinding("crossRuns", [(sp.cells.includes(v_x)), ((clueAt(cl.blank, v_x) < 0) && !((b.grid[v_x] !== 0))), sameSet(v_A, run(sp, cl, sp.rowOf[v_x], v_x)), sameSet(v_B, run(sp, cl, sp.colOf[v_x], v_x)), ((v_A.length >= 2) && (v_B.length >= 2)), sameSet(v_KA, _g408), sameSet(v_KB, _g420), (v_D === _g432), (popcount(v_D) === 1)], ["x in", "where of x", "A =", "B =", "where of B", "KA =", "KB =", "D =", "where of D"]);
        }
        facts.length = 0;
        changed = false;
        const _t458 = least(v_D);
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t458); changed = true; } else facts.push(PLACE, v_x, _t458); }
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
  const _g492: number[] = [];
  const _g512: number[] = [];
  const facts = narrowFacts;
  let fired = 0;
  let changed = false;
  if (narrowCands.length < sp.cells.length) narrowCands = new Int32Array(sp.cells.length);
  const cands = narrowCands;
  cands.fill(-1);
  const _a482 = sp.lines;
  for (let _i483 = 0; _i483 < _a482.length; _i483++) {
    const v_L = _a482[_i483];
    const _a484 = sp.lineCells[v_L];
    R2:
    for (let _i485 = 0; _i485 < _a484.length; _i485++) {
      const v_c = _a484[_i485];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L486: {
        const v_R = run(sp, cl, v_L, v_c);
        const _m140_0 = b.made[0];
        let _q487 = false;
        Q488: {
          const _a489 = v_R;
          for (let _i490 = 0; _i490 < _a489.length; _i490++) {
            const v_x = _a489[_i490];
            const _h491 = (b.grid[v_x] !== 0);
            if (!(_h491)) {
              _q487 = true;
              break Q488;
            }
          }
        }
        if (!(_q487)) break L486;
        const _h499 = v_R.length;
        const _m144_1 = b.made[1];
        _g492.length = 0;
        G493: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c504: boolean = (listLength(cl.numbers.digits[v_k]) === _h499);
            if (_c504) {
              let _q500 = true;
              Q501: {
                const _a502 = v_R;
                for (let _i503 = 0; _i503 < _a502.length; _i503++) {
                  const v_x = _a502[_i503];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i503)) & 1) !== 0))) {
                    _q500 = false;
                    break Q501;
                  }
                }
              }
              _c504 = _q500;
            }
            if (!((_c504 && !(written(b, sp, cl, v_k))))) continue;
            _g492.push(v_k);
          }
        }
        const v_K = _g492;
        const _a505 = v_R;
        for (let _i506 = 0; _i506 < _a505.length; _i506++) {
          const v_x = _a505[_i506];
          const _h507 = (b.grid[v_x] !== 0);
          if (!(!(_h507))) continue;
          const _h547 = _i506;
          if (b.made[0] !== _m140_0 || b.made[1] !== _m144_1) {
            let _q508 = false;
            Q509: {
              const _a510 = v_R;
              for (let _i511 = 0; _i511 < _a510.length; _i511++) {
                const v_x = _a510[_i511];
                if (!((b.grid[v_x] !== 0))) {
                  _q508 = true;
                  break Q509;
                }
              }
            }
            if (!(_q508)) { continue R2; }
            _g512.length = 0;
            G513: {
              for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                let _c523: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                if (_c523) {
                  let _q519 = true;
                  Q520: {
                    const _a521 = v_R;
                    for (let _i522 = 0; _i522 < _a521.length; _i522++) {
                      const v_x = _a521[_i522];
                      if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i522)) & 1) !== 0))) {
                        _q519 = false;
                        break Q520;
                      }
                    }
                  }
                  _c523 = _q519;
                }
                if (!((_c523 && !(written(b, sp, cl, v_k))))) continue;
                _g512.push(v_k);
              }
            }
            if (!(sameSet(v_K, _g512))) { continue R2; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _q524 = false;
            Q525: {
              const _a526 = v_R;
              for (let _i527 = 0; _i527 < _a526.length; _i527++) {
                const v_x = _a526[_i527];
                if (!((b.grid[v_x] !== 0))) {
                  _q524 = true;
                  break Q525;
                }
              }
            }
            const _g528: number[] = [];
            G529: {
              for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
                let _c539: boolean = (listLength(cl.numbers.digits[v_k]) === v_R.length);
                if (_c539) {
                  let _q535 = true;
                  Q536: {
                    const _a537 = v_R;
                    for (let _i538 = 0; _i538 < _a537.length; _i538++) {
                      const v_x = _a537[_i538];
                      if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i538)) & 1) !== 0))) {
                        _q535 = false;
                        break Q536;
                      }
                    }
                  }
                  _c539 = _q535;
                }
                if (!((_c539 && !(written(b, sp, cl, v_k))))) continue;
                _g528.push(v_k);
              }
            }
            freshBinding("narrow", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q524, sameSet(v_K, _g528), (v_R.includes(v_x)), !((b.grid[v_x] !== 0))], ["L in", "c in", "where of c", "R =", "where of R", "K =", "x in", "where of x"]);
          }
          facts.length = 0;
          changed = false;
          let _q540 = true;
          Q541: {
            for (let _m542 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m542 !== 0; _m542 &= _m542 - 1) {
              const v_d = 31 - Math.clz32(_m542 & -_m542);
              let _q543 = false;
              Q544: {
                const _a545 = v_K;
                for (let _i546 = 0; _i546 < _a545.length; _i546++) {
                  const v_k = _a545[_i546];
                  if ((nth(cl.numbers.digits[v_k], _h547) === v_d)) {
                    _q543 = true;
                    break Q544;
                  }
                }
              }
              if (!(!(_q543))) continue;
              if ((((b.cands[v_x] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_x, v_d); changed = true; } else facts.push(STRIKE, v_x, v_d); }
              if (!(true)) {
                _q540 = false;
                break Q541;
              }
            }
          }
          if (!(_q540)) return -1;
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
  const _a557 = sp.lines;
  for (let _i558 = 0; _i558 < _a557.length; _i558++) {
    const v_L = _a557[_i558];
    const _a559 = sp.lineCells[v_L];
    for (let _i560 = 0; _i560 < _a559.length; _i560++) {
      const v_c = _a559[_i560];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L561: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q562 = true;
        Q563: {
          const _a564 = v_R;
          for (let _i565 = 0; _i565 < _a564.length; _i565++) {
            const v_x = _a564[_i565];
            const _h566 = (b.grid[v_x] !== 0);
            if (!(_h566)) {
              _q562 = false;
              break Q563;
            }
          }
        }
        if (!(_q562)) break L561;
        const _h573 = v_R.length;
        if (import.meta.env.DEV && staleChecking) {
          let _q567 = true;
          Q568: {
            const _a569 = v_R;
            for (let _i570 = 0; _i570 < _a569.length; _i570++) {
              const v_x = _a569[_i570];
              if (!((b.grid[v_x] !== 0))) {
                _q567 = false;
                break Q568;
              }
            }
          }
          freshBinding("misread", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), head(sp, cl, v_L, v_c), sameSet(v_R, run(sp, cl, v_L, v_c)), _q567], ["L in", "c in", "where of c", "R =", "where of R"]);
        }
        facts.length = 0;
        changed = false;
        let _q571 = false;
        Q572: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c579: boolean = (listLength(cl.numbers.digits[v_k]) === _h573);
            if (_c579) {
              let _q574 = true;
              Q575: {
                const _a576 = v_R;
                for (let _i577 = 0; _i577 < _a576.length; _i577++) {
                  const v_x = _a576[_i577];
                  const _h578 = (b.grid[v_x] || -1);
                  if (!((_h578 === nth(cl.numbers.digits[v_k], _i577)))) {
                    _q574 = false;
                    break Q575;
                  }
                }
              }
              _c579 = _q574;
            }
            if (_c579) {
              _q571 = true;
              break Q572;
            }
          }
        }
        if (!(_q571)) return -1;
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
    let _g580 = 0;
    G581: {
      const _a582 = sp.lines;
      for (let _i583 = 0; _i583 < _a582.length; _i583++) {
        const v_L = _a582[_i583];
        const _a584 = sp.lineCells[v_L];
        for (let _i585 = 0; _i585 < _a584.length; _i585++) {
          const v_c = _a584[_i585];
          let _c594: boolean = head(sp, cl, v_L, v_c);
          if (_c594) {
            const _t586 = run(sp, cl, v_L, v_c);
            const _h587 = _t586.length;
            let _c593: boolean = (listLength(cl.numbers.digits[v_k]) === _h587);
            if (_c593) {
              let _q588 = true;
              Q589: {
                const _a590 = _t586;
                for (let _i591 = 0; _i591 < _a590.length; _i591++) {
                  const v_x = _a590[_i591];
                  const _h592 = (b.grid[v_x] || -1);
                  if (!((_h592 === nth(cl.numbers.digits[v_k], _i591)))) {
                    _q588 = false;
                    break Q589;
                  }
                }
              }
              _c593 = _q588;
            }
            _c594 = _c593;
          }
          if (!(_c594)) continue;
          _g580++;
        }
      }
    }
    if (!((_g580 < 2))) return -1;
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
