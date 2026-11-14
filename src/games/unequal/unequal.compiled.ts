// Compiled by `npm run describe` from src/games/unequal/unequal.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, freshBinding, rangeMask, setOf, staleChecking } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  greater: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "latin.hiddenSingle" | "latin.single" | "sign" | "latin.set" | "latin.fish" | "latin.wing";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  sign: SignSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["sign"] as const;

/** Each kind of step's words as the description states them, and each
 * fact's, by wording (`engine/stated.ts`). */
export const STATED = {
  "sign": {"fact":[{"look":"The larger side of {outline sign: this greater-than sign} can't hold the smallest number"},{"look":"{outline small: the outlined smaller side} of {outline sign: this greater-than sign} is at least {lo}"},{"look":"The smaller side of {outline sign: this greater-than sign} can't hold the largest number"},{"look":"{outline big: the outlined larger side} of {outline sign: this greater-than sign} is at most {hi}"}]},
} as const;

/** Every technique run as each value is placed, by id. */
export type PlacingId = "latin.placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "latin.placed" },
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
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "sign", tier: 1 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  const _n5 = new Int32Array(32);
  Q2: for (const _u3 of sp.lines) {
    _n5.fill(0);
    for (const _c4 of sp.lineCells[_u3]) {
      const _t6 = (g[_c4] || -1);
      if (++_n5[_t6] > 1) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k7 = 0; _k7 < cl.greater.at.length; _k7++) {
    const _at8 = cl.greater.at[_k7];
    const _v9 = cl.greater.v[_k7];
    if (!(((g[_v9] || -1) > (g[(sp.edgeEnds[2 * _at8] === _v9 ? sp.edgeEnds[2 * _at8 + 1] : sp.edgeEnds[2 * _at8])] || -1)))) return false;
  }
  return true;
}

export interface SignBinding {
  k: number;
  big: number;
  small: number;
}

/** What a square the firing decides has of its own, read where it is made. */
export interface SignSaysFact {
  /** The index of the wording that held (`STATED`). */
  wording: number;
  terms: { sign: readonly number[]; };
  marks: {  };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface SignSays {
  terms: { big: number; small: number; lo: number; hi: number; };
  marks: {  };
  facts: SignSaysFact[];
}

const signFacts: number[] = [];
const signFactSays: SignSaysFact[] = [];
let signCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function sign(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SignBinding, SignSays> | null): number {
  const facts = signFacts;
  let fired = 0;
  let changed = false;
  if (signCands.length < sp.cells.length) signCands = new Int32Array(sp.cells.length);
  const cands = signCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.greater.at.length; v_k++) {
    const v_big = cl.greater.v[v_k];
    const _t3 = cl.greater.at[v_k];
    const _t4 = cl.greater.v[v_k];
    const v_small = (sp.edgeEnds[2 * _t3] === _t4 ? sp.edgeEnds[2 * _t3 + 1] : sp.edgeEnds[2 * _t3]);
    if (DEV && staleChecking) {
      const _t5 = cl.greater.at[v_k];
      const _t6 = cl.greater.v[v_k];
      freshBinding("sign", [(v_big === cl.greater.v[v_k]), (v_small === (sp.edgeEnds[2 * _t5] === _t6 ? sp.edgeEnds[2 * _t5 + 1] : sp.edgeEnds[2 * _t5]))], ["big =", "small ="]);
    }
    facts.length = 0;
    signFactSays.length = 0;
    changed = false;
    let _q7 = true;
    Q8: {
      for (let _i9 = 0; _i9 < 2; _i9++) {
        const v_c = _i9 === 0 ? v_big : v_small;
        if (_i9 === 1 && (v_c === v_big)) continue;
        const _h11 = (v_c === v_big);
        const _h28 = (v_c === v_small);
        for (let _m10 = b.domain; _m10 !== 0; _m10 &= _m10 - 1) {
          const v_d = 31 - Math.clz32(_m10 & -_m10);
          let _c15: boolean = _h11;
          if (_c15) {
            let _q12 = true;
            Q13: {
              for (let _m14 = (cands[v_small] >= 0 ? cands[v_small] : (cands[v_small] = b.cands[v_small])); _m14 !== 0; _m14 &= _m14 - 1) {
                const v_d2 = 31 - Math.clz32(_m14 & -_m14);
                if (!((v_d <= v_d2))) {
                  _q12 = false;
                  break Q13;
                }
              }
            }
            _c15 = _q12;
          }
          let _c27: boolean = !(_c15);
          if (!_c27) {
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
              if (fire === null) { b.strikeAt(v_c, v_d); changed = true; }
              if (fire !== null) {
                let _g16 = -1;
                let _n18 = 0;
                G17: {
                  for (let _i19 = 0; _i19 < 2; _i19++) {
                    const v_p = _i19 === 0 ? v_big : v_small;
                    if (_i19 === 1 && (v_p === v_big)) continue;
                    if (!((v_p !== v_c))) continue;
                    if (++_n18 === 2) {
                      _g16 = -1;
                      break G17;
                    }
                    _g16 = v_p;
                  }
                }
                let _c23: boolean = _h11;
                if (_c23) {
                  let _g20 = -1;
                  G21: {
                    for (let _m22 = (cands[v_small] >= 0 ? cands[v_small] : (cands[v_small] = b.cands[v_small])); _m22 !== 0; _m22 &= _m22 - 1) {
                      const v_d2 = 31 - Math.clz32(_m22 & -_m22);
                      if (_g20 === -1 || v_d2 < _g20) _g20 = v_d2;
                    }
                  }
                  _c23 = (_g20 <= 1);
                }
                let _g24 = -1;
                G25: {
                  for (let _m26 = (cands[v_big] >= 0 ? cands[v_big] : (cands[v_big] = b.cands[v_big])); _m26 !== 0; _m26 &= _m26 - 1) {
                    const v_d2 = 31 - Math.clz32(_m26 & -_m26);
                    if (_g24 === -1 || v_d2 > _g24) _g24 = v_d2;
                  }
                }
                facts.push(STRIKE, v_c, v_d);
                signFactSays.push({ wording: (_c23 ? 0 : _h11 ? 1 : (_g24 >= sp.w) ? 2 : 3), terms: { sign: setOf(v_c, _g16).slice() }, marks: {  } });
              }
            }
            _c27 = true;
          }
          let _c45: boolean = _c27;
          if (_c45) {
            let _c32: boolean = _h28;
            if (_c32) {
              let _q29 = true;
              Q30: {
                for (let _m31 = (cands[v_big] >= 0 ? cands[v_big] : (cands[v_big] = b.cands[v_big])); _m31 !== 0; _m31 &= _m31 - 1) {
                  const v_d2 = 31 - Math.clz32(_m31 & -_m31);
                  if (!((v_d >= v_d2))) {
                    _q29 = false;
                    break Q30;
                  }
                }
              }
              _c32 = _q29;
            }
            let _c44: boolean = !(_c32);
            if (!_c44) {
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) {
                if (fire === null) { b.strikeAt(v_c, v_d); changed = true; }
                if (fire !== null) {
                  let _g33 = -1;
                  let _n35 = 0;
                  G34: {
                    for (let _i36 = 0; _i36 < 2; _i36++) {
                      const v_p = _i36 === 0 ? v_big : v_small;
                      if (_i36 === 1 && (v_p === v_big)) continue;
                      if (!((v_p !== v_c))) continue;
                      if (++_n35 === 2) {
                        _g33 = -1;
                        break G34;
                      }
                      _g33 = v_p;
                    }
                  }
                  let _c40: boolean = _h11;
                  if (_c40) {
                    let _g37 = -1;
                    G38: {
                      for (let _m39 = (cands[v_small] >= 0 ? cands[v_small] : (cands[v_small] = b.cands[v_small])); _m39 !== 0; _m39 &= _m39 - 1) {
                        const v_d2 = 31 - Math.clz32(_m39 & -_m39);
                        if (_g37 === -1 || v_d2 < _g37) _g37 = v_d2;
                      }
                    }
                    _c40 = (_g37 <= 1);
                  }
                  let _g41 = -1;
                  G42: {
                    for (let _m43 = (cands[v_big] >= 0 ? cands[v_big] : (cands[v_big] = b.cands[v_big])); _m43 !== 0; _m43 &= _m43 - 1) {
                      const v_d2 = 31 - Math.clz32(_m43 & -_m43);
                      if (_g41 === -1 || v_d2 > _g41) _g41 = v_d2;
                    }
                  }
                  facts.push(STRIKE, v_c, v_d);
                  signFactSays.push({ wording: (_c40 ? 0 : _h11 ? 1 : (_g41 >= sp.w) ? 2 : 3), terms: { sign: setOf(v_c, _g33).slice() }, marks: {  } });
                }
              }
              _c44 = true;
            }
            _c45 = _c44;
          }
          if (!(_c45)) {
            _q7 = false;
            break Q8;
          }
        }
      }
    }
    if (!(_q7)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        if (signFactSays.length * 3 !== facts.length) throw new Error("sign: a fact of its conclusion is made where says.fact is not read");
        let _g46 = -1;
        G47: {
          for (let _m48 = (cands[v_small] >= 0 ? cands[v_small] : (cands[v_small] = b.cands[v_small])); _m48 !== 0; _m48 &= _m48 - 1) {
            const v_d = 31 - Math.clz32(_m48 & -_m48);
            if (_g46 === -1 || v_d < _g46) _g46 = v_d;
          }
        }
        let _g49 = -1;
        G50: {
          for (let _m51 = (cands[v_big] >= 0 ? cands[v_big] : (cands[v_big] = b.cands[v_big])); _m51 !== 0; _m51 &= _m51 - 1) {
            const v_d = 31 - Math.clz32(_m51 & -_m51);
            if (_g49 === -1 || v_d > _g49) _g49 = v_d;
          }
        }
        const _says = { terms: { big: v_big, small: v_small, lo: _g46, hi: _g49 }, marks: {  }, facts: signFactSays.slice() };
        if (!fire({ k: v_k, big: v_big, small: v_small }, facts, _says)) return 1;
      }
      cands.fill(-1);
    }
  }
  return fired;
}
