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
    let _g236 = true;
    const _s238: number[] = [];
    G237: {
      const _a239 = sp.cells;
      for (let _i240 = 0; _i240 < _a239.length; _i240++) {
        const v_s = _a239[_i240];
        const _h241 = (g[v_s] || -1);
        if (_s238.includes(_h241)) {
          _g236 = false;
          break G237;
        }
        _s238.push(_h241);
      }
    }
    if (!(_g236)) return false;
  }
  for (let _k242 = 0; _k242 < cl.score.n; _k242++) {
    let _g245 = 0;
    G246: {
      const _a247 = sp.cells;
      for (let _i248 = 0; _i248 < _a247.length; _i248++) {
        const v_s = _a247[_i248];
        const _h249 = (g[v_s] || -1);
        if (!((_h249 === cl.score.peg[_k242][v_s]))) continue;
        _g245++;
      }
    }
    let _c265: boolean = (cl.score.black[_k242] === _g245);
    if (_c265) {
      let _g250 = 0;
      G251: {
        for (let _m252 = _domain; _m252 !== 0; _m252 &= _m252 - 1) {
          const v_d = 31 - Math.clz32(_m252 & -_m252);
          let _g253 = -1;
          G254: {
            let _g259 = 0;
            G260: {
              const _a261 = sp.cells;
              for (let _i262 = 0; _i262 < _a261.length; _i262++) {
                const v_s = _a261[_i262];
                const _h263 = (g[v_s] || -1);
                if (!((_h263 === v_d))) continue;
                _g259++;
              }
            }
            for (let _m264 = ((1 << pegs(sp, cl, _k242, v_d)) | (1 << _g259)); _m264 !== 0; _m264 &= _m264 - 1) {
              const v_n = 31 - Math.clz32(_m264 & -_m264);
              if (_g253 === -1 || v_n < _g253) _g253 = v_n;
            }
          }
          _g250 += _g253;
        }
      }
      _c265 = (cl.score.total[_k242] === _g250);
    }
    if (!(_c265)) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("noBlack", [(cl.score.black[v_k] === 0)], ["where of k"]);
    }
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("everyPegScored", [(cl.score.total[v_k] === sp.cells.length)], ["where of k"]);
    }
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
    if (import.meta.env.DEV && staleChecking) {
      let _c59: boolean = (cl.score.black[v_k] > 0);
      if (_c59) {
        let _g55 = 0;
        G56: {
          const _a57 = sp.cells;
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_s = _a57[_i58];
            if (!(((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0)))) continue;
            _g55++;
          }
        }
        _c59 = (_g55 === cl.score.black[v_k]);
      }
      freshBinding("blacksForced", [_c59], ["where of k"]);
    }
    facts.length = 0;
    changed = false;
    let _q60 = true;
    Q61: {
      const _a62 = sp.cells;
      for (let _i63 = 0; _i63 < _a62.length; _i63++) {
        const v_s = _a62[_i63];
        if (!(((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0)))) continue;
        for (let _m64 = b.domain; _m64 !== 0; _m64 &= _m64 - 1) {
          const v_d = 31 - Math.clz32(_m64 & -_m64);
          if (!((v_d !== cl.score.peg[v_k][v_s]))) continue;
          if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q60 = false;
            break Q61;
          }
        }
      }
    }
    if (!(_q60)) return -1;
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
  const _g72: number[] = [];
  const facts = blacksAccountedFacts;
  let fired = 0;
  let changed = false;
  if (blacksAccountedCands.length < sp.cells.length) blacksAccountedCands = new Int32Array(sp.cells.length);
  const cands = blacksAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    _g72.length = 0;
    G73: {
      const _a76 = sp.cells;
      for (let _i77 = 0; _i77 < _a76.length; _i77++) {
        const v_s = _a76[_i77];
        if (!(((cl.score.peg[v_k][v_s] > 0) && ((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === ((1 << cl.score.peg[v_k][v_s])))))) continue;
        _g72.push(v_s);
      }
    }
    L78: {
      const v_P = _g72;
      const _h79 = v_P.length;
      if (!(((_h79 > 0) && (_h79 === cl.score.black[v_k])))) break L78;
      if (import.meta.env.DEV && staleChecking) {
        const _g80: number[] = [];
        G81: {
          const _a84 = sp.cells;
          for (let _i85 = 0; _i85 < _a84.length; _i85++) {
            const v_s = _a84[_i85];
            if (!(((cl.score.peg[v_k][v_s] > 0) && ((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === ((1 << cl.score.peg[v_k][v_s])))))) continue;
            _g80.push(v_s);
          }
        }
        freshBinding("blacksAccounted", [sameSet(v_P, _g80), ((v_P.length > 0) && (v_P.length === cl.score.black[v_k]))], ["P =", "where of P"]);
      }
      facts.length = 0;
      changed = false;
      let _q86 = true;
      Q87: {
        const _a88 = sp.cells;
        for (let _i89 = 0; _i89 < _a88.length; _i89++) {
          const v_s = _a88[_i89];
          if (!((!(v_P.includes(v_s)) && ((cl.score.peg[v_k][v_s] > 0) && (((b.cands[v_s] >> cl.score.peg[v_k][v_s]) & 1) !== 0))))) continue;
          const _t90 = cl.score.peg[v_k][v_s];
          if ((((b.cands[v_s] >> _t90) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, _t90); changed = true; } else facts.push(STRIKE, v_s, _t90); }
          if (!(true)) {
            _q86 = false;
            break Q87;
          }
        }
      }
      if (!(_q86)) return -1;
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
  const _g153: number[] = [];
  const _g211: number[] = [];
  const _g220: number[] = [];
  const facts = totalAccountedFacts;
  let fired = 0;
  let changed = false;
  if (totalAccountedCands.length < sp.cells.length) totalAccountedCands = new Int32Array(sp.cells.length);
  const cands = totalAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    let _g128 = 0;
    G129: {
      let _g137 = 0;
      G138: {
        const _a141 = sp.cells;
        for (let _i142 = 0; _i142 < _a141.length; _i142++) {
          const v_s = _a141[_i142];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t143 = cl.score.peg[v_k][v_s];
          _g137 |= 1 << _t143;
        }
      }
      for (let _m144 = _g137; _m144 !== 0; _m144 &= _m144 - 1) {
        const v_d = 31 - Math.clz32(_m144 & -_m144);
        const _h159 = ((1 << v_d));
        let _g145 = -1;
        G146: {
          _g153.length = 0;
          G154: {
            const _a157 = sp.cells;
            for (let _i158 = 0; _i158 < _a157.length; _i158++) {
              const v_s = _a157[_i158];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h159))) continue;
              _g153.push(v_s);
            }
          }
          for (let _m160 = ((1 << pegs(sp, cl, v_k, v_d)) | (1 << _g153.length)); _m160 !== 0; _m160 &= _m160 - 1) {
            const v_n = 31 - Math.clz32(_m160 & -_m160);
            if (_g145 === -1 || v_n < _g145) _g145 = v_n;
          }
        }
        _g128 += _g145;
      }
    }
    L161: {
      const v_e = _g128;
      if (!(((v_e > 0) && (v_e === cl.score.total[v_k])))) break L161;
      if (import.meta.env.DEV && staleChecking) {
        let _g162 = 0;
        G163: {
          let _g171 = 0;
          G172: {
            const _a175 = sp.cells;
            for (let _i176 = 0; _i176 < _a175.length; _i176++) {
              const v_s = _a175[_i176];
              if (!((cl.score.peg[v_k][v_s] > 0))) continue;
              const _t177 = cl.score.peg[v_k][v_s];
              _g171 |= 1 << _t177;
            }
          }
          for (let _m178 = _g171; _m178 !== 0; _m178 &= _m178 - 1) {
            const v_d = 31 - Math.clz32(_m178 & -_m178);
            let _g179 = -1;
            G180: {
              const _g187: number[] = [];
              G188: {
                const _a191 = sp.cells;
                for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                  const v_s = _a191[_i192];
                  if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === ((1 << v_d))))) continue;
                  _g187.push(v_s);
                }
              }
              for (let _m193 = ((1 << pegs(sp, cl, v_k, v_d)) | (1 << _g187.length)); _m193 !== 0; _m193 &= _m193 - 1) {
                const v_n = 31 - Math.clz32(_m193 & -_m193);
                if (_g179 === -1 || v_n < _g179) _g179 = v_n;
              }
            }
            _g162 += _g179;
          }
        }
        freshBinding("totalAccounted", [(v_e === _g162), ((v_e > 0) && (v_e === cl.score.total[v_k]))], ["e =", "where of e"]);
      }
      facts.length = 0;
      changed = false;
      let _q194 = true;
      Q195: {
        let _g203 = 0;
        G204: {
          const _a207 = sp.cells;
          for (let _i208 = 0; _i208 < _a207.length; _i208++) {
            const v_s = _a207[_i208];
            if (!((cl.score.peg[v_k][v_s] > 0))) continue;
            const _t209 = cl.score.peg[v_k][v_s];
            _g203 |= 1 << _t209;
          }
        }
        for (let _m210 = _g203; _m210 !== 0; _m210 &= _m210 - 1) {
          const v_d = 31 - Math.clz32(_m210 & -_m210);
          const _h217 = ((1 << v_d));
          _g211.length = 0;
          G212: {
            const _a215 = sp.cells;
            for (let _i216 = 0; _i216 < _a215.length; _i216++) {
              const v_s = _a215[_i216];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h217))) continue;
              _g211.push(v_s);
            }
          }
          if (!((pegs(sp, cl, v_k, v_d) > _g211.length))) continue;
          const _a218 = sp.cells;
          for (let _i219 = 0; _i219 < _a218.length; _i219++) {
            const v_s = _a218[_i219];
            _g220.length = 0;
            G221: {
              const _a224 = sp.cells;
              for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                const v_s = _a224[_i225];
                if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h217))) continue;
                _g220.push(v_s);
              }
            }
            if (!(!(_g220.includes(v_s)))) continue;
            if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
            if (!(true)) {
              _q194 = false;
              break Q195;
            }
          }
        }
      }
      if (!(_q194)) return -1;
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
  const _a229 = sp.cells;
  R1:
  for (let _i230 = 0; _i230 < _a229.length; _i230++) {
    const v_s = _a229[_i230];
    const _m107_1 = b.made[1];
    if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1))) continue;
    R2:
    for (let _m231 = (cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])); _m231 !== 0; _m231 &= _m231 - 1) {
      const v_d = 31 - Math.clz32(_m231 & -_m231);
      if (b.made[1] !== _m107_1) {
        if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1))) { continue R1; }
        if (!((((b.cands[v_s] >> v_d) & 1) !== 0))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("noRepeats", [(sp.cells.includes(v_s)), (popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1), (((b.cands[v_s] >> v_d) & 1) !== 0)], ["s in", "where of s", "d in"]);
      }
      facts.length = 0;
      changed = false;
      let _q232 = true;
      Q233: {
        const _a234 = sp.cells;
        for (let _i235 = 0; _i235 < _a234.length; _i235++) {
          const v_t = _a234[_i235];
          if (!((v_t !== v_s))) continue;
          if ((((b.cands[v_t] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_d); changed = true; } else facts.push(STRIKE, v_t, v_d); }
          if (!(true)) {
            _q232 = false;
            break Q233;
          }
        }
      }
      if (!(_q232)) return -1;
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
  let _g110 = 0;
  G111: {
    const _a112 = sp.cells;
    for (let _i113 = 0; _i113 < _a112.length; _i113++) {
      const v_s = _a112[_i113];
      if (!((cl.score.peg[v_k][v_s] === v_d))) continue;
      _g110++;
    }
  }
  const _made = _g110;
  _kept1[v_d] = _made;
  return _made;
}
