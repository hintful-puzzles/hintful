// Compiled by `npm run describe` from src/games/guess/guess.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, STRIKE, popcount, rangeMask } from "../../engine/describe-runtime.ts";

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
    let _g189 = true;
    const _s191: number[] = [];
    G190: {
      const _a192 = sp.cells;
      for (let _i193 = 0; _i193 < _a192.length; _i193++) {
        const v_s = _a192[_i193];
        const _h194 = (g[v_s] || -1);
        if (_s191.includes(_h194)) {
          _g189 = false;
          break G190;
        }
        _s191.push(_h194);
      }
    }
    if (!(_g189)) return false;
  }
  for (let _k195 = 0; _k195 < cl.score.n; _k195++) {
    let _g198 = 0;
    G199: {
      const _a200 = sp.cells;
      for (let _i201 = 0; _i201 < _a200.length; _i201++) {
        const v_s = _a200[_i201];
        const _h202 = (g[v_s] || -1);
        if (!((_h202 === cl.score.peg[_k195][v_s]))) continue;
        _g198++;
      }
    }
    let _c218: boolean = (cl.score.black[_k195] === _g198);
    if (_c218) {
      let _g203 = 0;
      G204: {
        for (let _m205 = _domain; _m205 !== 0; _m205 &= _m205 - 1) {
          const v_d = 31 - Math.clz32(_m205 & -_m205);
          let _g206 = -1;
          G207: {
            let _g208 = 0;
            G209: {
              const _a210 = sp.cells;
              for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                const v_s = _a210[_i211];
                if (!((cl.score.peg[_k195][v_s] === v_d))) continue;
                _g208++;
              }
            }
            let _g212 = 0;
            G213: {
              const _a214 = sp.cells;
              for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                const v_s = _a214[_i215];
                const _h216 = (g[v_s] || -1);
                if (!((_h216 === v_d))) continue;
                _g212++;
              }
            }
            for (let _m217 = ((1 << _g208) | (1 << _g212)); _m217 !== 0; _m217 &= _m217 - 1) {
              const v_n = 31 - Math.clz32(_m217 & -_m217);
              if (_g206 === -1 || v_n < _g206) _g206 = v_n;
            }
          }
          _g203 += _g206;
        }
      }
      _c218 = (cl.score.total[_k195] === _g203);
    }
    if (!(_c218)) return false;
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
    facts.length = 0;
    changed = false;
    let _q1 = true;
    Q2: {
      let _g10 = 0;
      G11: {
        const _a14 = sp.cells;
        for (let _i15 = 0; _i15 < _a14.length; _i15++) {
          const v_s = _a14[_i15];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t16 = cl.score.peg[v_k][v_s];
          _g10 |= 1 << _t16;
        }
      }
      for (let _m17 = _g10; _m17 !== 0; _m17 &= _m17 - 1) {
        const v_d = 31 - Math.clz32(_m17 & -_m17);
        const _a18 = sp.cells;
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_s = _a18[_i19];
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
    facts.length = 0;
    changed = false;
    let _q20 = true;
    Q21: {
      const _a22 = sp.cells;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_s = _a22[_i23];
        if (!((cl.score.peg[v_k][v_s] > 0))) continue;
        const _t24 = cl.score.peg[v_k][v_s];
        if ((((b.cands[v_s] >> _t24) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, _t24); changed = true; } else facts.push(STRIKE, v_s, _t24); }
        if (!(true)) {
          _q20 = false;
          break Q21;
        }
      }
    }
    if (!(_q20)) return -1;
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
  const _h25 = sp.cells.length;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    if (!((cl.score.total[v_k] === _h25))) continue;
    facts.length = 0;
    changed = false;
    let _q26 = true;
    Q27: {
      let _g35 = 0;
      G36: {
        const _a39 = sp.cells;
        for (let _i40 = 0; _i40 < _a39.length; _i40++) {
          const v_s = _a39[_i40];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t41 = cl.score.peg[v_k][v_s];
          _g35 |= 1 << _t41;
        }
      }
      for (let _m42 = (b.domain & ~_g35); _m42 !== 0; _m42 &= _m42 - 1) {
        const v_d = 31 - Math.clz32(_m42 & -_m42);
        const _a43 = sp.cells;
        for (let _i44 = 0; _i44 < _a43.length; _i44++) {
          const v_s = _a43[_i44];
          if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q26 = false;
            break Q27;
          }
        }
      }
    }
    if (!(_q26)) return -1;
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
    let _c54: boolean = (cl.score.black[v_k] > 0);
    if (_c54) {
      let _g50 = 0;
      G51: {
        const _a52 = sp.cells;
        for (let _i53 = 0; _i53 < _a52.length; _i53++) {
          const v_s = _a52[_i53];
          if (!(((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0)))) continue;
          _g50++;
        }
      }
      _c54 = (_g50 === cl.score.black[v_k]);
    }
    if (!(_c54)) continue;
    facts.length = 0;
    changed = false;
    let _q55 = true;
    Q56: {
      const _a57 = sp.cells;
      for (let _i58 = 0; _i58 < _a57.length; _i58++) {
        const v_s = _a57[_i58];
        if (!(((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0)))) continue;
        for (let _m59 = b.domain; _m59 !== 0; _m59 &= _m59 - 1) {
          const v_d = 31 - Math.clz32(_m59 & -_m59);
          if (!((v_d !== cl.score.peg[v_k][v_s]))) continue;
          if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q55 = false;
            break Q56;
          }
        }
      }
    }
    if (!(_q55)) return -1;
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
  const _g67: number[] = [];
  const facts = blacksAccountedFacts;
  let fired = 0;
  let changed = false;
  if (blacksAccountedCands.length < sp.cells.length) blacksAccountedCands = new Int32Array(sp.cells.length);
  const cands = blacksAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    _g67.length = 0;
    G68: {
      const _a71 = sp.cells;
      for (let _i72 = 0; _i72 < _a71.length; _i72++) {
        const v_s = _a71[_i72];
        if (!(((cl.score.peg[v_k][v_s] > 0) && ((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === ((1 << cl.score.peg[v_k][v_s])))))) continue;
        _g67.push(v_s);
      }
    }
    L73: {
      const v_P = _g67;
      const _h74 = v_P.length;
      if (!(((_h74 > 0) && (_h74 === cl.score.black[v_k])))) break L73;
      facts.length = 0;
      changed = false;
      let _q75 = true;
      Q76: {
        const _a77 = sp.cells;
        for (let _i78 = 0; _i78 < _a77.length; _i78++) {
          const v_s = _a77[_i78];
          if (!((!(v_P.includes(v_s)) && ((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0))))) continue;
          const _t79 = cl.score.peg[v_k][v_s];
          if ((((b.cands[v_s] >> _t79) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, _t79); changed = true; } else facts.push(STRIKE, v_s, _t79); }
          if (!(true)) {
            _q75 = false;
            break Q76;
          }
        }
      }
      if (!(_q75)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, P: v_P }, facts)) return 1;
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
  const _g134: number[] = [];
  const _g164: number[] = [];
  const _g173: number[] = [];
  const facts = totalAccountedFacts;
  let fired = 0;
  let changed = false;
  if (totalAccountedCands.length < sp.cells.length) totalAccountedCands = new Int32Array(sp.cells.length);
  const cands = totalAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    let _g111 = 0;
    G112: {
      let _g120 = 0;
      G121: {
        const _a124 = sp.cells;
        for (let _i125 = 0; _i125 < _a124.length; _i125++) {
          const v_s = _a124[_i125];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t126 = cl.score.peg[v_k][v_s];
          _g120 |= 1 << _t126;
        }
      }
      for (let _m127 = _g120; _m127 !== 0; _m127 &= _m127 - 1) {
        const v_d = 31 - Math.clz32(_m127 & -_m127);
        const _h140 = ((1 << v_d));
        let _g128 = -1;
        G129: {
          let _g130 = 0;
          G131: {
            const _a132 = sp.cells;
            for (let _i133 = 0; _i133 < _a132.length; _i133++) {
              const v_s = _a132[_i133];
              if (!((cl.score.peg[v_k][v_s] === v_d))) continue;
              _g130++;
            }
          }
          _g134.length = 0;
          G135: {
            const _a138 = sp.cells;
            for (let _i139 = 0; _i139 < _a138.length; _i139++) {
              const v_s = _a138[_i139];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h140))) continue;
              _g134.push(v_s);
            }
          }
          for (let _m141 = ((1 << _g130) | (1 << _g134.length)); _m141 !== 0; _m141 &= _m141 - 1) {
            const v_n = 31 - Math.clz32(_m141 & -_m141);
            if (_g128 === -1 || v_n < _g128) _g128 = v_n;
          }
        }
        _g111 += _g128;
      }
    }
    L142: {
      const v_e = _g111;
      if (!(((v_e > 0) && (v_e === cl.score.total[v_k])))) break L142;
      facts.length = 0;
      changed = false;
      let _q143 = true;
      Q144: {
        let _g152 = 0;
        G153: {
          const _a156 = sp.cells;
          for (let _i157 = 0; _i157 < _a156.length; _i157++) {
            const v_s = _a156[_i157];
            if (!((cl.score.peg[v_k][v_s] > 0))) continue;
            const _t158 = cl.score.peg[v_k][v_s];
            _g152 |= 1 << _t158;
          }
        }
        for (let _m159 = _g152; _m159 !== 0; _m159 &= _m159 - 1) {
          const v_d = 31 - Math.clz32(_m159 & -_m159);
          const _h170 = ((1 << v_d));
          let _g160 = 0;
          G161: {
            const _a162 = sp.cells;
            for (let _i163 = 0; _i163 < _a162.length; _i163++) {
              const v_s = _a162[_i163];
              if (!((cl.score.peg[v_k][v_s] === v_d))) continue;
              _g160++;
            }
          }
          _g164.length = 0;
          G165: {
            const _a168 = sp.cells;
            for (let _i169 = 0; _i169 < _a168.length; _i169++) {
              const v_s = _a168[_i169];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h170))) continue;
              _g164.push(v_s);
            }
          }
          if (!((_g160 > _g164.length))) continue;
          const _a171 = sp.cells;
          for (let _i172 = 0; _i172 < _a171.length; _i172++) {
            const v_s = _a171[_i172];
            _g173.length = 0;
            G174: {
              const _a177 = sp.cells;
              for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                const v_s = _a177[_i178];
                if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h170))) continue;
                _g173.push(v_s);
              }
            }
            if (!(!(_g173.includes(v_s)))) continue;
            if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
            if (!(true)) {
              _q143 = false;
              break Q144;
            }
          }
        }
      }
      if (!(_q143)) return -1;
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
  const _a182 = sp.cells;
  for (let _i183 = 0; _i183 < _a182.length; _i183++) {
    const v_s = _a182[_i183];
    if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1))) continue;
    for (let _m184 = (cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])); _m184 !== 0; _m184 &= _m184 - 1) {
      const v_d = 31 - Math.clz32(_m184 & -_m184);
      facts.length = 0;
      changed = false;
      let _q185 = true;
      Q186: {
        const _a187 = sp.cells;
        for (let _i188 = 0; _i188 < _a187.length; _i188++) {
          const v_t = _a187[_i188];
          if (!((v_t !== v_s))) continue;
          if ((((b.cands[v_t] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_d); changed = true; } else facts.push(STRIKE, v_t, v_d); }
          if (!(true)) {
            _q185 = false;
            break Q186;
          }
        }
      }
      if (!(_q185)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ s: v_s, d: v_d }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
