// Compiled by `npm run describe` from src/games/guess/guess.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, STRIKE, keptStore, popcount, rangeMask, type Kept } from "../../engine/describe-runtime.ts";

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
    let _g181 = true;
    const _s183: number[] = [];
    G182: {
      const _a184 = sp.cells;
      for (let _i185 = 0; _i185 < _a184.length; _i185++) {
        const v_s = _a184[_i185];
        const _h186 = (g[v_s] || -1);
        if (_s183.includes(_h186)) {
          _g181 = false;
          break G182;
        }
        _s183.push(_h186);
      }
    }
    if (!(_g181)) return false;
  }
  for (let _k187 = 0; _k187 < cl.score.n; _k187++) {
    let _g190 = 0;
    G191: {
      const _a192 = sp.cells;
      for (let _i193 = 0; _i193 < _a192.length; _i193++) {
        const v_s = _a192[_i193];
        const _h194 = (g[v_s] || -1);
        if (!((_h194 === cl.score.peg[_k187][v_s]))) continue;
        _g190++;
      }
    }
    let _c210: boolean = (cl.score.black[_k187] === _g190);
    if (_c210) {
      let _g195 = 0;
      G196: {
        for (let _m197 = _domain; _m197 !== 0; _m197 &= _m197 - 1) {
          const v_d = 31 - Math.clz32(_m197 & -_m197);
          let _g198 = -1;
          G199: {
            let _g200 = 0;
            G201: {
              const _a202 = sp.cells;
              for (let _i203 = 0; _i203 < _a202.length; _i203++) {
                const v_s = _a202[_i203];
                if (!((cl.score.peg[_k187][v_s] === v_d))) continue;
                _g200++;
              }
            }
            let _g204 = 0;
            G205: {
              const _a206 = sp.cells;
              for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                const v_s = _a206[_i207];
                const _h208 = (g[v_s] || -1);
                if (!((_h208 === v_d))) continue;
                _g204++;
              }
            }
            for (let _m209 = ((1 << _g200) | (1 << _g204)); _m209 !== 0; _m209 &= _m209 - 1) {
              const v_n = 31 - Math.clz32(_m209 & -_m209);
              if (_g198 === -1 || v_n < _g198) _g198 = v_n;
            }
          }
          _g195 += _g198;
        }
      }
      _c210 = (cl.score.total[_k187] === _g195);
    }
    if (!(_c210)) return false;
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
  const _g130: number[] = [];
  const _g156: number[] = [];
  const _g165: number[] = [];
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
        const _h136 = ((1 << v_d));
        let _g128 = -1;
        G129: {
          _g130.length = 0;
          G131: {
            const _a134 = sp.cells;
            for (let _i135 = 0; _i135 < _a134.length; _i135++) {
              const v_s = _a134[_i135];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h136))) continue;
              _g130.push(v_s);
            }
          }
          for (let _m137 = ((1 << pegs(sp, cl, v_k, v_d)) | (1 << _g130.length)); _m137 !== 0; _m137 &= _m137 - 1) {
            const v_n = 31 - Math.clz32(_m137 & -_m137);
            if (_g128 === -1 || v_n < _g128) _g128 = v_n;
          }
        }
        _g111 += _g128;
      }
    }
    L138: {
      const v_e = _g111;
      if (!(((v_e > 0) && (v_e === cl.score.total[v_k])))) break L138;
      facts.length = 0;
      changed = false;
      let _q139 = true;
      Q140: {
        let _g148 = 0;
        G149: {
          const _a152 = sp.cells;
          for (let _i153 = 0; _i153 < _a152.length; _i153++) {
            const v_s = _a152[_i153];
            if (!((cl.score.peg[v_k][v_s] > 0))) continue;
            const _t154 = cl.score.peg[v_k][v_s];
            _g148 |= 1 << _t154;
          }
        }
        for (let _m155 = _g148; _m155 !== 0; _m155 &= _m155 - 1) {
          const v_d = 31 - Math.clz32(_m155 & -_m155);
          const _h162 = ((1 << v_d));
          _g156.length = 0;
          G157: {
            const _a160 = sp.cells;
            for (let _i161 = 0; _i161 < _a160.length; _i161++) {
              const v_s = _a160[_i161];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h162))) continue;
              _g156.push(v_s);
            }
          }
          if (!((pegs(sp, cl, v_k, v_d) > _g156.length))) continue;
          const _a163 = sp.cells;
          for (let _i164 = 0; _i164 < _a163.length; _i164++) {
            const v_s = _a163[_i164];
            _g165.length = 0;
            G166: {
              const _a169 = sp.cells;
              for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                const v_s = _a169[_i170];
                if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h162))) continue;
                _g165.push(v_s);
              }
            }
            if (!(!(_g165.includes(v_s)))) continue;
            if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
            if (!(true)) {
              _q139 = false;
              break Q140;
            }
          }
        }
      }
      if (!(_q139)) return -1;
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
  const _a174 = sp.cells;
  for (let _i175 = 0; _i175 < _a174.length; _i175++) {
    const v_s = _a174[_i175];
    if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1))) continue;
    for (let _m176 = (cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])); _m176 !== 0; _m176 &= _m176 - 1) {
      const v_d = 31 - Math.clz32(_m176 & -_m176);
      facts.length = 0;
      changed = false;
      let _q177 = true;
      Q178: {
        const _a179 = sp.cells;
        for (let _i180 = 0; _i180 < _a179.length; _i180++) {
          const v_t = _a179[_i180];
          if (!((v_t !== v_s))) continue;
          if ((((b.cands[v_t] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_d); changed = true; } else facts.push(STRIKE, v_t, v_d); }
          if (!(true)) {
            _q177 = false;
            break Q178;
          }
        }
      }
      if (!(_q177)) return -1;
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

/** `pegs(k, d)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function pegs(sp: GridSpace, cl: Dealt, v_k: number, v_d: number): number {
  const _kept: Kept<Kept<number>> = pegsKept.board(cl);
  const _kept1 = (_kept[v_k] ??= []);
  if (_kept1[v_d] !== undefined) return _kept1[v_d];
  let _g99 = 0;
  G100: {
    const _a101 = sp.cells;
    for (let _i102 = 0; _i102 < _a101.length; _i102++) {
      const v_s = _a101[_i102];
      if (!((cl.score.peg[v_k][v_s] === v_d))) continue;
      _g99++;
    }
  }
  const _made = _g99;
  _kept1[v_d] = _made;
  return _made;
}
