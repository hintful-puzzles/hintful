// Compiled by `npm run describe` from src/games/guess/guess.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, STRIKE, freshBinding, keptStore, popcount, rangeMask, sameSet, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  score: { readonly n: number; readonly peg: readonly (readonly number[])[]; readonly black: readonly number[]; readonly total: readonly number[] };
  ncolors: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "scoredNothing" | "noBlack" | "everyPegScored" | "blacksForced" | "blacksAccounted" | "totalAccounted" | "noRepeats";

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
  { id: "scoredNothing", tier: 0 },
  { id: "noBlack", tier: 0 },
  { id: "everyPegScored", tier: 0 },
  { id: "blacksForced", tier: 0 },
  { id: "blacksAccounted", tier: 0 },
  { id: "totalAccounted", tier: 0 },
  { id: "noRepeats", tier: 0, variation: "no duplicates" },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt, variations: readonly string[]): boolean {
  const _domain = rangeMask(1, cl.ncolors);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  if (variations.includes("no duplicates")) {
    let _g1 = true;
    const _s3: number[] = [];
    G2: {
      const _a4 = sp.cells;
      for (let _i5 = 0; _i5 < _a4.length; _i5++) {
        const v_s = _a4[_i5];
        const _h6 = (g[v_s] || -1);
        if (_s3.includes(_h6)) {
          _g1 = false;
          break G2;
        }
        _s3.push(_h6);
      }
    }
    if (!(_g1)) return false;
  }
  for (let _k7 = 0; _k7 < cl.score.n; _k7++) {
    let _g10 = 0;
    G11: {
      const _a12 = sp.cells;
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_s = _a12[_i13];
        const _h14 = (g[v_s] || -1);
        if (!((_h14 === cl.score.peg[_k7][v_s]))) continue;
        _g10++;
      }
    }
    let _c30: boolean = (cl.score.black[_k7] === _g10);
    if (_c30) {
      let _g15 = 0;
      G16: {
        for (let _m17 = _domain; _m17 !== 0; _m17 &= _m17 - 1) {
          const v_d = 31 - Math.clz32(_m17 & -_m17);
          let _g18 = -1;
          G19: {
            let _g24 = 0;
            G25: {
              const _a26 = sp.cells;
              for (let _i27 = 0; _i27 < _a26.length; _i27++) {
                const v_s = _a26[_i27];
                const _h28 = (g[v_s] || -1);
                if (!((_h28 === v_d))) continue;
                _g24++;
              }
            }
            for (let _m29 = ((1 << pegs(sp, cl, _k7, v_d)) | (1 << _g24)); _m29 !== 0; _m29 &= _m29 - 1) {
              const v_n = 31 - Math.clz32(_m29 & -_m29);
              if (_g18 === -1 || v_n < _g18) _g18 = v_n;
            }
          }
          _g15 += _g18;
        }
      }
      _c30 = (cl.score.total[_k7] === _g15);
    }
    if (!(_c30)) return false;
  }
  return true;
}

export interface ScoredNothingBinding {
  k: number;
}

const scoredNothingFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function scoredNothing(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ScoredNothingBinding> | null): number {
  const facts = scoredNothingFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    if (!((cl.score.total[v_k] === 0))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("scoredNothing", [(cl.score.total[v_k] === 0)], ["where of k"]);
    }
    facts.length = 0;
    changed = false;
    let _q1 = true;
    Q2: {
      let _g3 = 0;
      G4: {
        const _a7 = sp.cells;
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const v_s = _a7[_i8];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t9 = cl.score.peg[v_k][v_s];
          _g3 |= 1 << _t9;
        }
      }
      for (let _m10 = _g3; _m10 !== 0; _m10 &= _m10 - 1) {
        const v_d = 31 - Math.clz32(_m10 & -_m10);
        const _a11 = sp.cells;
        for (let _i12 = 0; _i12 < _a11.length; _i12++) {
          const v_s = _a11[_i12];
          if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q1 = false;
            break Q2;
          }
        }
      }
    }
    if (!(_q1)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

export interface NoBlackBinding {
  k: number;
}

const noBlackFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function noBlack(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NoBlackBinding> | null): number {
  const facts = noBlackFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    if (!((cl.score.black[v_k] === 0))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("noBlack", [(cl.score.black[v_k] === 0)], ["where of k"]);
    }
    facts.length = 0;
    changed = false;
    let _q1 = true;
    Q2: {
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_s = _a3[_i4];
        if (!((cl.score.peg[v_k][v_s] > 0))) continue;
        const _t5 = cl.score.peg[v_k][v_s];
        if ((((b.cands[v_s] >> _t5) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, _t5); changed = true; } else facts.push(STRIKE, v_s, _t5); }
        if (!(true)) {
          _q1 = false;
          break Q2;
        }
      }
    }
    if (!(_q1)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

export interface EveryPegScoredBinding {
  k: number;
}

const everyPegScoredFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function everyPegScored(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryPegScoredBinding> | null): number {
  const facts = everyPegScoredFacts;
  let fired = 0;
  let changed = false;
  const _h1 = sp.cells.length;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    if (!((cl.score.total[v_k] === _h1))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("everyPegScored", [(cl.score.total[v_k] === sp.cells.length)], ["where of k"]);
    }
    facts.length = 0;
    changed = false;
    let _q2 = true;
    Q3: {
      let _g4 = 0;
      G5: {
        const _a8 = sp.cells;
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_s = _a8[_i9];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t10 = cl.score.peg[v_k][v_s];
          _g4 |= 1 << _t10;
        }
      }
      for (let _m11 = (b.domain & ~_g4); _m11 !== 0; _m11 &= _m11 - 1) {
        const v_d = 31 - Math.clz32(_m11 & -_m11);
        const _a12 = sp.cells;
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_s = _a12[_i13];
          if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q2 = false;
            break Q3;
          }
        }
      }
    }
    if (!(_q2)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

export interface BlacksForcedBinding {
  k: number;
}

const blacksForcedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function blacksForced(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlacksForcedBinding> | null): number {
  const facts = blacksForcedFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    let _c10: boolean = (cl.score.black[v_k] > 0);
    if (_c10) {
      let _g6 = 0;
      G7: {
        const _a8 = sp.cells;
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_s = _a8[_i9];
          if (!(((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0)))) continue;
          _g6++;
        }
      }
      _c10 = (_g6 === cl.score.black[v_k]);
    }
    if (!(_c10)) continue;
    if (import.meta.env.DEV && staleChecking) {
      let _c15: boolean = (cl.score.black[v_k] > 0);
      if (_c15) {
        let _g11 = 0;
        G12: {
          const _a13 = sp.cells;
          for (let _i14 = 0; _i14 < _a13.length; _i14++) {
            const v_s = _a13[_i14];
            if (!(((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0)))) continue;
            _g11++;
          }
        }
        _c15 = (_g11 === cl.score.black[v_k]);
      }
      freshBinding("blacksForced", [_c15], ["where of k"]);
    }
    facts.length = 0;
    changed = false;
    let _q16 = true;
    Q17: {
      const _a18 = sp.cells;
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_s = _a18[_i19];
        if (!(((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0)))) continue;
        for (let _m20 = b.domain; _m20 !== 0; _m20 &= _m20 - 1) {
          const v_d = 31 - Math.clz32(_m20 & -_m20);
          if (!((v_d !== cl.score.peg[v_k][v_s]))) continue;
          if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q16 = false;
            break Q17;
          }
        }
      }
    }
    if (!(_q16)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

export interface BlacksAccountedBinding {
  k: number;
  P: readonly number[];
}

const blacksAccountedFacts: number[] = [];
let blacksAccountedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function blacksAccounted(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlacksAccountedBinding> | null): number {
  const _g8: number[] = [];
  const facts = blacksAccountedFacts;
  let fired = 0;
  let changed = false;
  if (blacksAccountedCands.length < sp.cells.length) blacksAccountedCands = new Int32Array(sp.cells.length);
  const cands = blacksAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    _g8.length = 0;
    G9: {
      const _a12 = sp.cells;
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_s = _a12[_i13];
        if (!(((cl.score.peg[v_k][v_s] > 0) && ((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === ((1 << cl.score.peg[v_k][v_s])))))) continue;
        _g8.push(v_s);
      }
    }
    L14: {
      const v_P = _g8;
      const _h15 = v_P.length;
      if (!(((_h15 > 0) && (_h15 === cl.score.black[v_k])))) break L14;
      if (import.meta.env.DEV && staleChecking) {
        const _g16: number[] = [];
        G17: {
          const _a20 = sp.cells;
          for (let _i21 = 0; _i21 < _a20.length; _i21++) {
            const v_s = _a20[_i21];
            if (!(((cl.score.peg[v_k][v_s] > 0) && ((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === ((1 << cl.score.peg[v_k][v_s])))))) continue;
            _g16.push(v_s);
          }
        }
        freshBinding("blacksAccounted", [sameSet(v_P, _g16), ((v_P.length > 0) && (v_P.length === cl.score.black[v_k]))], ["P =", "where of P"]);
      }
      facts.length = 0;
      changed = false;
      let _q22 = true;
      Q23: {
        const _a24 = sp.cells;
        for (let _i25 = 0; _i25 < _a24.length; _i25++) {
          const v_s = _a24[_i25];
          if (!((!(v_P.includes(v_s)) && ((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0))))) continue;
          const _t26 = cl.score.peg[v_k][v_s];
          if ((((b.cands[v_s] >> _t26) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, _t26); changed = true; } else facts.push(STRIKE, v_s, _t26); }
          if (!(true)) {
            _q22 = false;
            break Q23;
          }
        }
      }
      if (!(_q22)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, P: v_P.slice() }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface TotalAccountedBinding {
  k: number;
  e: number;
}

const totalAccountedFacts: number[] = [];
let totalAccountedCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function totalAccounted(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TotalAccountedBinding> | null): number {
  const _g45: number[] = [];
  const _g89: number[] = [];
  const _g98: number[] = [];
  const facts = totalAccountedFacts;
  let fired = 0;
  let changed = false;
  if (totalAccountedCands.length < sp.cells.length) totalAccountedCands = new Int32Array(sp.cells.length);
  const cands = totalAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    let _g27 = 0;
    G28: {
      let _g29 = 0;
      G30: {
        const _a33 = sp.cells;
        for (let _i34 = 0; _i34 < _a33.length; _i34++) {
          const v_s = _a33[_i34];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t35 = cl.score.peg[v_k][v_s];
          _g29 |= 1 << _t35;
        }
      }
      for (let _m36 = _g29; _m36 !== 0; _m36 &= _m36 - 1) {
        const v_d = 31 - Math.clz32(_m36 & -_m36);
        const _h51 = ((1 << v_d));
        let _g37 = -1;
        G38: {
          _g45.length = 0;
          G46: {
            const _a49 = sp.cells;
            for (let _i50 = 0; _i50 < _a49.length; _i50++) {
              const v_s = _a49[_i50];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h51))) continue;
              _g45.push(v_s);
            }
          }
          for (let _m52 = ((1 << pegs(sp, cl, v_k, v_d)) | (1 << _g45.length)); _m52 !== 0; _m52 &= _m52 - 1) {
            const v_n = 31 - Math.clz32(_m52 & -_m52);
            if (_g37 === -1 || v_n < _g37) _g37 = v_n;
          }
        }
        _g27 += _g37;
      }
    }
    L53: {
      const v_e = _g27;
      if (!(((v_e > 0) && (v_e === cl.score.total[v_k])))) break L53;
      if (import.meta.env.DEV && staleChecking) {
        let _g54 = 0;
        G55: {
          let _g56 = 0;
          G57: {
            const _a60 = sp.cells;
            for (let _i61 = 0; _i61 < _a60.length; _i61++) {
              const v_s = _a60[_i61];
              if (!((cl.score.peg[v_k][v_s] > 0))) continue;
              const _t62 = cl.score.peg[v_k][v_s];
              _g56 |= 1 << _t62;
            }
          }
          for (let _m63 = _g56; _m63 !== 0; _m63 &= _m63 - 1) {
            const v_d = 31 - Math.clz32(_m63 & -_m63);
            let _g64 = -1;
            G65: {
              const _g72: number[] = [];
              G73: {
                const _a76 = sp.cells;
                for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                  const v_s = _a76[_i77];
                  if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === ((1 << v_d))))) continue;
                  _g72.push(v_s);
                }
              }
              for (let _m78 = ((1 << pegs(sp, cl, v_k, v_d)) | (1 << _g72.length)); _m78 !== 0; _m78 &= _m78 - 1) {
                const v_n = 31 - Math.clz32(_m78 & -_m78);
                if (_g64 === -1 || v_n < _g64) _g64 = v_n;
              }
            }
            _g54 += _g64;
          }
        }
        freshBinding("totalAccounted", [(v_e === _g54), ((v_e > 0) && (v_e === cl.score.total[v_k]))], ["e =", "where of e"]);
      }
      facts.length = 0;
      changed = false;
      let _q79 = true;
      Q80: {
        let _g81 = 0;
        G82: {
          const _a85 = sp.cells;
          for (let _i86 = 0; _i86 < _a85.length; _i86++) {
            const v_s = _a85[_i86];
            if (!((cl.score.peg[v_k][v_s] > 0))) continue;
            const _t87 = cl.score.peg[v_k][v_s];
            _g81 |= 1 << _t87;
          }
        }
        for (let _m88 = _g81; _m88 !== 0; _m88 &= _m88 - 1) {
          const v_d = 31 - Math.clz32(_m88 & -_m88);
          const _h95 = ((1 << v_d));
          _g89.length = 0;
          G90: {
            const _a93 = sp.cells;
            for (let _i94 = 0; _i94 < _a93.length; _i94++) {
              const v_s = _a93[_i94];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h95))) continue;
              _g89.push(v_s);
            }
          }
          if (!((pegs(sp, cl, v_k, v_d) > _g89.length))) continue;
          const _a96 = sp.cells;
          for (let _i97 = 0; _i97 < _a96.length; _i97++) {
            const v_s = _a96[_i97];
            _g98.length = 0;
            G99: {
              const _a102 = sp.cells;
              for (let _i103 = 0; _i103 < _a102.length; _i103++) {
                const v_s = _a102[_i103];
                if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h95))) continue;
                _g98.push(v_s);
              }
            }
            if (!(!(_g98.includes(v_s)))) continue;
            if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
            if (!(true)) {
              _q79 = false;
              break Q80;
            }
          }
        }
      }
      if (!(_q79)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, e: v_e }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface NoRepeatsBinding {
  s: number;
  d: number;
}

const noRepeatsFacts: number[] = [];
let noRepeatsCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function noRepeats(b: Marks, sp: GridSpace, fire: Fire<NoRepeatsBinding> | null): number {
  const facts = noRepeatsFacts;
  let fired = 0;
  let changed = false;
  if (noRepeatsCands.length < sp.cells.length) noRepeatsCands = new Int32Array(sp.cells.length);
  const cands = noRepeatsCands;
  cands.fill(-1);
  const _a4 = sp.cells;
  R1:
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_s = _a4[_i5];
    const _m11_1 = b.made[1];
    if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1))) continue;
    R2:
    for (let _m6 = (cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])); _m6 !== 0; _m6 &= _m6 - 1) {
      const v_d = 31 - Math.clz32(_m6 & -_m6);
      if (b.made[1] !== _m11_1) {
        if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1))) { continue R1; }
        if (!((((b.cands[v_s] >> v_d) & 1) !== 0))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("noRepeats", [(sp.cells.includes(v_s)), (popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1), (((b.cands[v_s] >> v_d) & 1) !== 0)], ["s in", "where of s", "d in"]);
      }
      facts.length = 0;
      changed = false;
      let _q7 = true;
      Q8: {
        const _a9 = sp.cells;
        for (let _i10 = 0; _i10 < _a9.length; _i10++) {
          const v_t = _a9[_i10];
          if (!((v_t !== v_s))) continue;
          if ((((b.cands[v_t] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_d); changed = true; } else facts.push(STRIKE, v_t, v_d); }
          if (!(true)) {
            _q7 = false;
            break Q8;
          }
        }
      }
      if (!(_q7)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ s: v_s, d: v_d }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

const pegsKept = keptStore<Kept<number>>();
let pegsOn: object | null = null;
let pegsAt: Kept<Kept<number>> = [];

/** `pegs(k, d)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function pegs(sp: GridSpace, cl: Dealt, v_k: number, v_d: number): number {
  if (cl !== pegsOn) {
    pegsAt = pegsKept.board(cl);
    pegsOn = cl;
  }
  const _kept: Kept<Kept<number>> = pegsAt;
  const _kept1 = (_kept[v_k] ??= []);
  if (_kept1[v_d] !== undefined) return _kept1[v_d];
  let _g1 = 0;
  G2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_s = _a3[_i4];
      if (!((cl.score.peg[v_k][v_s] === v_d))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept1[v_d] = _made;
  return _made;
}
