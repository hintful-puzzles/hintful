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
    let _g154 = true;
    const _s156: number[] = [];
    G155: {
      const _a157 = sp.cells;
      for (let _i158 = 0; _i158 < _a157.length; _i158++) {
        const v_s = _a157[_i158];
        const _t159 = (g[v_s] || -1);
        if (_s156.includes(_t159)) {
          _g154 = false;
          break G155;
        }
        _s156.push(_t159);
      }
    }
    if (!(_g154)) return false;
  }
  for (let _k160 = 0; _k160 < cl.score.n; _k160++) {
    let _g163 = 0;
    G164: {
      const _a165 = sp.cells;
      for (let _i166 = 0; _i166 < _a165.length; _i166++) {
        const v_s = _a165[_i166];
        if (!(((g[v_s] || -1) === cl.score.peg[_k160][v_s]))) continue;
        _g163++;
      }
    }
    let _c181 = (cl.score.black[_k160] === _g163);
    if (_c181) {
      let _g167 = 0;
      G168: {
        for (let _m169 = _domain; _m169 !== 0; _m169 &= _m169 - 1) {
          const v_d = 31 - Math.clz32(_m169 & -_m169);
          let _g170 = -1;
          G171: {
            let _g172 = 0;
            G173: {
              const _a174 = sp.cells;
              for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                const v_s = _a174[_i175];
                if (!((cl.score.peg[_k160][v_s] === v_d))) continue;
                _g172++;
              }
            }
            let _g176 = 0;
            G177: {
              const _a178 = sp.cells;
              for (let _i179 = 0; _i179 < _a178.length; _i179++) {
                const v_s = _a178[_i179];
                if (!(((g[v_s] || -1) === v_d))) continue;
                _g176++;
              }
            }
            for (let _m180 = ((1 << _g172) | (1 << _g176)); _m180 !== 0; _m180 &= _m180 - 1) {
              const v_n = 31 - Math.clz32(_m180 & -_m180);
              if (_g170 === -1 || v_n < _g170) _g170 = v_n;
            }
          }
          _g167 += _g170;
        }
      }
      _c181 = (cl.score.total[_k160] === _g167);
    }
    if (!(_c181)) return false;
  }
  return true;
}

export interface ScoredNothingBinding {
  k: number;
}

const scoredNothingFacts: number[] = [];

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
          if (b.has(v_s, v_d)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
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

export function noBlack(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NoBlackBinding> | null): number {
  const facts = noBlackFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    if (!((cl.score.black[v_k] === 0))) continue;
    facts.length = 0;
    changed = false;
    let _q13 = true;
    Q14: {
      const _a15 = sp.cells;
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_s = _a15[_i16];
        if (!((cl.score.peg[v_k][v_s] > 0))) continue;
        const _t17 = cl.score.peg[v_k][v_s];
        if (b.has(v_s, _t17)) { if (fire === null) { b.strikeAt(v_s, _t17); changed = true; } else facts.push(STRIKE, v_s, _t17); }
        if (!(true)) {
          _q13 = false;
          break Q14;
        }
      }
    }
    if (!(_q13)) return -1;
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

export function everyPegScored(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryPegScoredBinding> | null): number {
  const facts = everyPegScoredFacts;
  let fired = 0;
  let changed = false;
  const _h18 = sp.cells.length;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    if (!((cl.score.total[v_k] === _h18))) continue;
    facts.length = 0;
    changed = false;
    let _q19 = true;
    Q20: {
      let _g21 = 0;
      G22: {
        const _a25 = sp.cells;
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_s = _a25[_i26];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t27 = cl.score.peg[v_k][v_s];
          _g21 |= 1 << _t27;
        }
      }
      for (let _m28 = (b.domain & ~_g21); _m28 !== 0; _m28 &= _m28 - 1) {
        const v_d = 31 - Math.clz32(_m28 & -_m28);
        const _a29 = sp.cells;
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_s = _a29[_i30];
          if (b.has(v_s, v_d)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q19 = false;
            break Q20;
          }
        }
      }
    }
    if (!(_q19)) return -1;
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

export function blacksForced(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlacksForcedBinding> | null): number {
  const facts = blacksForcedFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    let _c40 = (cl.score.black[v_k] > 0);
    if (_c40) {
      let _g36 = 0;
      G37: {
        const _a38 = sp.cells;
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_s = _a38[_i39];
          if (!(((cl.score.peg[v_k][v_s] > 0) && b.has(v_s, cl.score.peg[v_k][v_s])))) continue;
          _g36++;
        }
      }
      _c40 = (_g36 === cl.score.black[v_k]);
    }
    if (!(_c40)) continue;
    facts.length = 0;
    changed = false;
    let _q41 = true;
    Q42: {
      const _a43 = sp.cells;
      for (let _i44 = 0; _i44 < _a43.length; _i44++) {
        const v_s = _a43[_i44];
        if (!(((cl.score.peg[v_k][v_s] > 0) && b.has(v_s, cl.score.peg[v_k][v_s])))) continue;
        for (let _m45 = b.domain; _m45 !== 0; _m45 &= _m45 - 1) {
          const v_d = 31 - Math.clz32(_m45 & -_m45);
          if (!((v_d !== cl.score.peg[v_k][v_s]))) continue;
          if (b.has(v_s, v_d)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
          if (!(true)) {
            _q41 = false;
            break Q42;
          }
        }
      }
    }
    if (!(_q41)) return -1;
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

export function blacksAccounted(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlacksAccountedBinding> | null): number {
  const _g53: number[] = [];
  const facts = blacksAccountedFacts;
  let fired = 0;
  let changed = false;
  if (blacksAccountedCands.length < sp.cells.length) blacksAccountedCands = new Int32Array(sp.cells.length);
  const cands = blacksAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    _g53.length = 0;
    G54: {
      const _a57 = sp.cells;
      for (let _i58 = 0; _i58 < _a57.length; _i58++) {
        const v_s = _a57[_i58];
        if (!(((cl.score.peg[v_k][v_s] > 0) && ((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cand(v_s))) === ((1 << cl.score.peg[v_k][v_s])))))) continue;
        _g53.push(v_s);
      }
    }
    L59: {
      const v_P = _g53;
      const _h60 = v_P.length;
      if (!(((_h60 > 0) && (_h60 === cl.score.black[v_k])))) break L59;
      facts.length = 0;
      changed = false;
      let _q61 = true;
      Q62: {
        const _a63 = sp.cells;
        for (let _i64 = 0; _i64 < _a63.length; _i64++) {
          const v_s = _a63[_i64];
          if (!((!(v_P.includes(v_s)) && ((cl.score.peg[v_k][v_s] > 0) && b.has(v_s, cl.score.peg[v_k][v_s]))))) continue;
          const _t65 = cl.score.peg[v_k][v_s];
          if (b.has(v_s, _t65)) { if (fire === null) { b.strikeAt(v_s, _t65); changed = true; } else facts.push(STRIKE, v_s, _t65); }
          if (!(true)) {
            _q61 = false;
            break Q62;
          }
        }
      }
      if (!(_q61)) return -1;
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

export function totalAccounted(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TotalAccountedBinding> | null): number {
  const _g106: number[] = [];
  const _g129: number[] = [];
  const _g138: number[] = [];
  const facts = totalAccountedFacts;
  let fired = 0;
  let changed = false;
  if (totalAccountedCands.length < sp.cells.length) totalAccountedCands = new Int32Array(sp.cells.length);
  const cands = totalAccountedCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.score.n; v_k++) {
    let _g90 = 0;
    G91: {
      let _g92 = 0;
      G93: {
        const _a96 = sp.cells;
        for (let _i97 = 0; _i97 < _a96.length; _i97++) {
          const v_s = _a96[_i97];
          if (!((cl.score.peg[v_k][v_s] > 0))) continue;
          const _t98 = cl.score.peg[v_k][v_s];
          _g92 |= 1 << _t98;
        }
      }
      for (let _m99 = _g92; _m99 !== 0; _m99 &= _m99 - 1) {
        const v_d = 31 - Math.clz32(_m99 & -_m99);
        const _h112 = ((1 << v_d));
        let _g100 = -1;
        G101: {
          let _g102 = 0;
          G103: {
            const _a104 = sp.cells;
            for (let _i105 = 0; _i105 < _a104.length; _i105++) {
              const v_s = _a104[_i105];
              if (!((cl.score.peg[v_k][v_s] === v_d))) continue;
              _g102++;
            }
          }
          _g106.length = 0;
          G107: {
            const _a110 = sp.cells;
            for (let _i111 = 0; _i111 < _a110.length; _i111++) {
              const v_s = _a110[_i111];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cand(v_s))) === _h112))) continue;
              _g106.push(v_s);
            }
          }
          for (let _m113 = ((1 << _g102) | (1 << _g106.length)); _m113 !== 0; _m113 &= _m113 - 1) {
            const v_n = 31 - Math.clz32(_m113 & -_m113);
            if (_g100 === -1 || v_n < _g100) _g100 = v_n;
          }
        }
        _g90 += _g100;
      }
    }
    L114: {
      const v_e = _g90;
      if (!(((v_e > 0) && (v_e === cl.score.total[v_k])))) break L114;
      facts.length = 0;
      changed = false;
      let _q115 = true;
      Q116: {
        let _g117 = 0;
        G118: {
          const _a121 = sp.cells;
          for (let _i122 = 0; _i122 < _a121.length; _i122++) {
            const v_s = _a121[_i122];
            if (!((cl.score.peg[v_k][v_s] > 0))) continue;
            const _t123 = cl.score.peg[v_k][v_s];
            _g117 |= 1 << _t123;
          }
        }
        for (let _m124 = _g117; _m124 !== 0; _m124 &= _m124 - 1) {
          const v_d = 31 - Math.clz32(_m124 & -_m124);
          const _h135 = ((1 << v_d));
          let _g125 = 0;
          G126: {
            const _a127 = sp.cells;
            for (let _i128 = 0; _i128 < _a127.length; _i128++) {
              const v_s = _a127[_i128];
              if (!((cl.score.peg[v_k][v_s] === v_d))) continue;
              _g125++;
            }
          }
          _g129.length = 0;
          G130: {
            const _a133 = sp.cells;
            for (let _i134 = 0; _i134 < _a133.length; _i134++) {
              const v_s = _a133[_i134];
              if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cand(v_s))) === _h135))) continue;
              _g129.push(v_s);
            }
          }
          if (!((_g125 > _g129.length))) continue;
          const _a136 = sp.cells;
          for (let _i137 = 0; _i137 < _a136.length; _i137++) {
            const v_s = _a136[_i137];
            _g138.length = 0;
            G139: {
              const _a142 = sp.cells;
              for (let _i143 = 0; _i143 < _a142.length; _i143++) {
                const v_s = _a142[_i143];
                if (!(((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cand(v_s))) === _h135))) continue;
                _g138.push(v_s);
              }
            }
            if (!(!(_g138.includes(v_s)))) continue;
            if (b.has(v_s, v_d)) { if (fire === null) { b.strikeAt(v_s, v_d); changed = true; } else facts.push(STRIKE, v_s, v_d); }
            if (!(true)) {
              _q115 = false;
              break Q116;
            }
          }
        }
      }
      if (!(_q115)) return -1;
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

export function noRepeats(b: Marks, sp: GridSpace, fire: Fire<NoRepeatsBinding> | null): number {
  const facts = noRepeatsFacts;
  let fired = 0;
  let changed = false;
  if (noRepeatsCands.length < sp.cells.length) noRepeatsCands = new Int32Array(sp.cells.length);
  const cands = noRepeatsCands;
  cands.fill(-1);
  const _a147 = sp.cells;
  for (let _i148 = 0; _i148 < _a147.length; _i148++) {
    const v_s = _a147[_i148];
    if (!((popcount((cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cand(v_s)))) === 1))) continue;
    for (let _m149 = (cands[v_s] >= 0 ? cands[v_s] : (cands[v_s] = b.cand(v_s))); _m149 !== 0; _m149 &= _m149 - 1) {
      const v_d = 31 - Math.clz32(_m149 & -_m149);
      facts.length = 0;
      changed = false;
      let _q150 = true;
      Q151: {
        const _a152 = sp.cells;
        for (let _i153 = 0; _i153 < _a152.length; _i153++) {
          const v_t = _a152[_i153];
          if (!((v_t !== v_s))) continue;
          if (b.has(v_t, v_d)) { if (fire === null) { b.strikeAt(v_t, v_d); changed = true; } else facts.push(STRIKE, v_t, v_d); }
          if (!(true)) {
            _q150 = false;
            break Q151;
          }
        }
      }
      if (!(_q150)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ s: v_s, d: v_d }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
