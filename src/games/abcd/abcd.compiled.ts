// Compiled by `npm run describe` from src/games/abcd/abcd.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, freshBinding, least, perElement, perPlace, perValue, popcount, rangeMask, sameSet, staleChecking, stretch } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
  n: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "satisfied" | "single" | "runs";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "placed" | "placedDiagonal";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "placed" },
  { id: "placedDiagonal", variation: "no diagonal" },
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
  { id: "satisfied", tier: 0 },
  { id: "single", tier: 0 },
  { id: "runs", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt, variations: readonly string[]): boolean {
  const _domain = rangeMask(1, cl.n);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h8 = (g[v_c] || -1);
      const _a5 = sp.adj4[v_c];
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_p = _a5[_i6];
        const _h7 = (g[v_p] || -1);
        if (!((_h7 !== _h8))) {
          _q1 = false;
          break Q2;
        }
      }
    }
  }
  if (!(_q1)) return false;
  if (variations.includes("no diagonal")) {
    let _q9 = true;
    Q10: {
      const _a11 = sp.cells;
      for (let _i12 = 0; _i12 < _a11.length; _i12++) {
        const v_c = _a11[_i12];
        const _h16 = (g[v_c] || -1);
        const _a13 = sp.adj8[v_c];
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_p = _a13[_i14];
          const _h15 = (g[v_p] || -1);
          if (!((_h15 !== _h16))) {
            _q9 = false;
            break Q10;
          }
        }
      }
    }
    if (!(_q9)) return false;
  }
  for (let _k17 = 0; _k17 < cl.count.at.length; _k17++) {
    const _at18 = perElement(cl.count.at[_k17]);
    const _per20 = perValue(cl.count.at[_k17]);
    const _v19 = cl.count.v[_k17];
    let _g21 = 0;
    G22: {
      const _a23 = sp.lineCells[_at18];
      for (let _i24 = 0; _i24 < _a23.length; _i24++) {
        const v_c = _a23[_i24];
        const _h25 = (g[v_c] || -1);
        if (!((_h25 === _per20))) continue;
        _g21++;
      }
    }
    if (!((_g21 === _v19))) return false;
  }
  return true;
}

export interface PlacedBinding {
  c: number;
  p: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (b.grid[v_c] !== 0);
  const _h9 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const _a6 = sp.adj4[v_c];
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_p = _a6[_i7];
    const _h8 = (b.grid[v_p] !== 0);
    if (!(!(_h8))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("placed", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (sp.adj4[v_c].includes(v_p)), !((b.grid[v_p] !== 0))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> _h9) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _h9); changed = true; } else facts.push(STRIKE, v_p, _h9); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface SatisfiedBinding {
  L: number;
  d: number;
  v: number;
}

const satisfiedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function satisfied(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SatisfiedBinding> | null): number {
  const facts = satisfiedFacts;
  let fired = 0;
  let changed = false;
  const _a10 = sp.lines;
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_L = _a10[_i11];
    for (let _m12 = b.domain; _m12 !== 0; _m12 &= _m12 - 1) {
      const v_d = 31 - Math.clz32(_m12 & -_m12);
      const _h13 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L14: {
        const v_v = _h13;
        let _c20: boolean = (v_v >= 0);
        if (_c20) {
          let _g15 = 0;
          G16: {
            const _a17 = sp.lineCells[v_L];
            for (let _i18 = 0; _i18 < _a17.length; _i18++) {
              const v_c = _a17[_i18];
              const _h19 = (b.grid[v_c] || -1);
              if (!((_h19 === v_d))) continue;
              _g15++;
            }
          }
          _c20 = (_g15 >= v_v);
        }
        if (!(_c20)) break L14;
        if (import.meta.env.DEV && staleChecking) {
          let _c25: boolean = (v_v >= 0);
          if (_c25) {
            let _g21 = 0;
            G22: {
              const _a23 = sp.lineCells[v_L];
              for (let _i24 = 0; _i24 < _a23.length; _i24++) {
                const v_c = _a23[_i24];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g21++;
              }
            }
            _c25 = (_g21 >= v_v);
          }
          freshBinding("satisfied", [(sp.lines.includes(v_L)), (((b.domain >> v_d) & 1) !== 0), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), _c25], ["L in", "d in", "v =", "where of v"]);
        }
        facts.length = 0;
        changed = false;
        let _g26 = 0;
        G27: {
          const _a28 = sp.lineCells[v_L];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_c = _a28[_i29];
            const _h30 = (b.grid[v_c] || -1);
            if (!((_h30 === v_d))) continue;
            _g26++;
          }
        }
        let _c36: boolean = (_g26 === v_v);
        if (_c36) {
          let _q31 = true;
          Q32: {
            const _a33 = sp.lineCells[v_L];
            for (let _i34 = 0; _i34 < _a33.length; _i34++) {
              const v_c = _a33[_i34];
              const _h35 = (b.grid[v_c] !== 0);
              if (!(!(_h35))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q31 = false;
                break Q32;
              }
            }
          }
          _c36 = _q31;
        }
        if (!(_c36)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface SingleBinding {
  c: number;
}

const singleFacts: number[] = [];
let singleCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding> | null): number {
  const facts = singleFacts;
  let fired = 0;
  let changed = false;
  if (singleCands.length < sp.cells.length) singleCands = new Int32Array(sp.cells.length);
  const cands = singleCands;
  cands.fill(-1);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("single", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c6: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c6) {
      const _t5 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t5); changed = true; } else facts.push(PLACE, v_c, _t5); }
      _c6 = true;
    }
    if (!(_c6)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface RunsBinding {
  L: number;
  d: number;
  v: number;
  O: readonly number[];
}

const runsFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function runs(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RunsBinding> | null): number {
  const _g33: number[] = [];
  const facts = runsFacts;
  let fired = 0;
  let changed = false;
  const _a24 = sp.lines;
  for (let _i25 = 0; _i25 < _a24.length; _i25++) {
    const v_L = _a24[_i25];
    for (let _m26 = b.domain; _m26 !== 0; _m26 &= _m26 - 1) {
      const v_d = 31 - Math.clz32(_m26 & -_m26);
      const _h27 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L28: {
        const v_v = _h27;
        let _g29 = 0;
        G30: {
          const _a31 = sp.lineCells[v_L];
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_c = _a31[_i32];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g29++;
          }
        }
        if (!((v_v > _g29))) break L28;
        _g33.length = 0;
        G34: {
          const _a37 = sp.lineCells[v_L];
          for (let _i38 = 0; _i38 < _a37.length; _i38++) {
            const v_c = _a37[_i38];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g33.push(v_c);
          }
        }
        L39: {
          const v_O = _g33;
          let _g40 = 0;
          G41: {
            const _a42 = v_O;
            for (let _i43 = 0; _i43 < _a42.length; _i43++) {
              const v_c = _a42[_i43];
              if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0))) continue;
              _g40++;
            }
          }
          if (!((_g40 === (v_v - _g29)))) break L39;
          if (import.meta.env.DEV && staleChecking) {
            let _g44 = 0;
            G45: {
              const _a46 = sp.lineCells[v_L];
              for (let _i47 = 0; _i47 < _a46.length; _i47++) {
                const v_c = _a46[_i47];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g44++;
              }
            }
            const _g48: number[] = [];
            G49: {
              const _a52 = sp.lineCells[v_L];
              for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                const v_c = _a52[_i53];
                if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                _g48.push(v_c);
              }
            }
            let _g54 = 0;
            G55: {
              const _a56 = v_O;
              for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                const v_c = _a56[_i57];
                if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0))) continue;
                _g54++;
              }
            }
            let _g58 = 0;
            G59: {
              const _a60 = sp.lineCells[v_L];
              for (let _i61 = 0; _i61 < _a60.length; _i61++) {
                const v_c = _a60[_i61];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g58++;
              }
            }
            freshBinding("runs", [(sp.lines.includes(v_L)), (((b.domain >> v_d) & 1) !== 0), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v > _g44), sameSet(v_O, _g48), (_g54 === (v_v - _g58))], ["L in", "d in", "v =", "where of v", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q62 = true;
          Q63: {
            const _a64 = v_O;
            for (let _i65 = 0; _i65 < _a64.length; _i65++) {
              const v_c = _a64[_i65];
              const _h66 = stretch(sp.lineCells[v_L], v_c, v_O).length;
              if (!((((_h66 % 2) === 1) && ((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q62 = false;
                break Q63;
              }
            }
          }
          if (!(_q62)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, O: v_O.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface PlacedDiagonalBinding {
  c: number;
  p: number;
}

const placedDiagonalFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function placedDiagonal(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedDiagonalBinding> | null): number {
  const facts = placedDiagonalFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (b.grid[v_c] !== 0);
  const _h9 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const _a6 = sp.adj8[v_c];
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_p = _a6[_i7];
    const _h8 = (b.grid[v_p] !== 0);
    if (!((!(sp.adj4[v_c].includes(v_p)) && !(_h8)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("placedDiagonal", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (sp.adj8[v_c].includes(v_p)), (!(sp.adj4[v_c].includes(v_p)) && !((b.grid[v_p] !== 0)))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> _h9) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _h9); changed = true; } else facts.push(STRIKE, v_p, _h9); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}
