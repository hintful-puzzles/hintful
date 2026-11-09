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
    let _g193 = true;
    const _s195: number[] = [];
    G194: {
      const _a196 = sp.cells;
      for (let _i197 = 0; _i197 < _a196.length; _i197++) {
        const v_s = _a196[_i197];
        const _h198 = (g[v_s] || -1);
        if (_s195.includes(_h198)) {
          _g193 = false;
          break G194;
        }
        _s195.push(_h198);
      }
    }
    if (!(_g193)) return false;
  }
  for (let _k199 = 0; _k199 < cl.score.n; _k199++) {
    let _g202 = 0;
    G203: {
      const _a204 = sp.cells;
      for (let _i205 = 0; _i205 < _a204.length; _i205++) {
        const v_s = _a204[_i205];
        const _h206 = (g[v_s] || -1);
        if (!((_h206 === cl.score.peg[_k199][v_s]))) continue;
        _g202++;
      }
    }
    let _c222: boolean = (cl.score.black[_k199] === _g202);
    if (_c222) {
      let _g207 = 0;
      G208: {
        for (let _m209 = _domain; _m209 !== 0; _m209 &= _m209 - 1) {
          const v_d = 31 - Math.clz32(_m209 & -_m209);
          let _g210 = -1;
          G211: {
            let _g216 = 0;
            G217: {
              const _a218 = sp.cells;
              for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                const v_s = _a218[_i219];
                const _h220 = (g[v_s] || -1);
                if (!((_h220 === v_d))) continue;
                _g216++;
              }
            }
            for (let _m221 = ((1 << pegs(sp, cl, _k199, v_d)) | (1 << _g216)); _m221 !== 0; _m221 &= _m221 - 1) {
              const v_n = 31 - Math.clz32(_m221 & -_m221);
              if (_g210 === -1 || v_n < _g210) _g210 = v_n;
            }
          }
          _g207 += _g210;
        }
      }
      _c222 = (cl.score.total[_k199] === _g207);
    }
    if (!(_c222)) return false;
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
  const _g142: number[] = [];
  const _g168: number[] = [];
  const _g177: number[] = [];
  const facts = totalAccountedFacts;
  let fired = 0;
  let changed = false;
  if (totalAccountedCands.length < sp.cells.length) totalAccountedCands = new Int32Array(sp.cells.length);
  const cands = totalAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    let _g117 = 0;
    G118: {
      let _g126 = 0;
      G127: {
        const _a130 = sp.cells;
        for (let _i131 = 0; _i131 < _a130.length; _i131++) {
          const v_s = _a130[_i131];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t132 = cl.score.peg[v_k][v_s];
          _g126 |= 1 << _t132;
        }
      }
      for (let _m133 = _g126; _m133 !== 0; _m133 &= _m133 - 1) {
        const v_d = 31 - Math.clz32(_m133 & -_m133);
        const _h148 = ((1 << v_d));
        let _g134 = -1;
        G135: {
          _g142.length = 0;
          G143: {
            const _a146 = sp.cells;
            for (let _i147 = 0; _i147 < _a146.length; _i147++) {
              const v_s = _a146[_i147];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h148))) continue;
              _g142.push(v_s);
            }
          }
          for (let _m149 = ((1 << pegs(sp, cl, v_k, v_d)) | (1 << _g142.length)); _m149 !== 0; _m149 &= _m149 - 1) {
            const v_n = 31 - Math.clz32(_m149 & -_m149);
            if (_g134 === -1 || v_n < _g134) _g134 = v_n;
          }
        }
        _g117 += _g134;
      }
    }
    L150: {
      const v_e = _g117;
      if (!(((v_e > 0) && (v_e === cl.score.total[v_k])))) break L150;
      facts.length = 0;
      changed = false;
      let _q151 = true;
      Q152: {
        let _g160 = 0;
        G161: {
          const _a164 = sp.cells;
          for (let _i165 = 0; _i165 < _a164.length; _i165++) {
            const v_s = _a164[_i165];
            if (!((cl.score.peg[v_k][v_s] > 0))) continue;
            const _t166 = cl.score.peg[v_k][v_s];
            _g160 |= 1 << _t166;
          }
        }
        for (let _m167 = _g160; _m167 !== 0; _m167 &= _m167 - 1) {
          const v_d = 31 - Math.clz32(_m167 & -_m167);
          const _h174 = ((1 << v_d));
          _g168.length = 0;
          G169: {
            const _a172 = sp.cells;
            for (let _i173 = 0; _i173 < _a172.length; _i173++) {
              const v_s = _a172[_i173];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h174))) continue;
              _g168.push(v_s);
            }
          }
          if (!((pegs(sp, cl, v_k, v_d) > _g168.length))) continue;
          const _a175 = sp.cells;
          for (let _i176 = 0; _i176 < _a175.length; _i176++) {
            const v_s = _a175[_i176];
            _g177.length = 0;
            G178: {
              const _a181 = sp.cells;
              for (let _i182 = 0; _i182 < _a181.length; _i182++) {
                const v_s = _a181[_i182];
                if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])) === _h174))) continue;
                _g177.push(v_s);
              }
            }
            if (!(!(_g177.includes(v_s)))) continue;
            if ((((b.cands[v_s] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
            if (!(true)) {
              _q151 = false;
              break Q152;
            }
          }
        }
      }
      if (!(_q151)) return -1;
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
  const _a186 = sp.cells;
  for (let _i187 = 0; _i187 < _a186.length; _i187++) {
    const v_s = _a186[_i187];
    if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s]))) === 1))) continue;
    for (let _m188 = (cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cands[v_s])); _m188 !== 0; _m188 &= _m188 - 1) {
      const v_d = 31 - Math.clz32(_m188 & -_m188);
      facts.length = 0;
      changed = false;
      let _q189 = true;
      Q190: {
        const _a191 = sp.cells;
        for (let _i192 = 0; _i192 < _a191.length; _i192++) {
          const v_t = _a191[_i192];
          if (!((v_t !== v_s))) continue;
          if ((((b.cands[v_t] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_t, v_d); changed = true; } else facts.push(STRIKE, v_t, v_d); }
          if (!(true)) {
            _q189 = false;
            break Q190;
          }
        }
      }
      if (!(_q189)) return -1;
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
