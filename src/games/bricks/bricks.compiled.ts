// Compiled by `npm run describe` from src/games/bricks/bricks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, cellsValued, clueAt, freshBinding, keptStore, setOf, staleChecking, stretch, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  hole: ClueList;
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "strandSupport" | "undercount" | "three" | "unsupported" | "overcount";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  strandSupport: StrandSupportSays;
  undercount: UndercountSays;
  three: ThreeSays;
  unsupported: UnsupportedSays;
  overcount: OvercountSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["strandSupport","undercount","three","unsupported","overcount"] as const;

/** The techniques whose step is made for each square the firing decides. */
export const SAYS_EACH: readonly (keyof SaysById)[] = ["strandSupport","undercount","three","unsupported","overcount"];

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
  { id: "strandSupport", tier: 0 },
  { id: "undercount", tier: 0 },
  { id: "three", tier: 0 },
  { id: "unsupported", tier: 0 },
  { id: "overcount", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 2; v_d++) {
      if (!(((v_d === 2) || ((clueAt(cl.hole, v_c) < 0) && (clueAt(cl.number, v_c) < 0))))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g5: number[] = [];
  const _h17 = (sp.h - 1);
  const _k20 = belowKept.board(sp);
  const _k33 = aroundKept.board(sp);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      _g5.length = 0;
      G6: {
        const _a9 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i10 = 0; _i10 < _a9.length; _i10++) {
          const v_x = _a9[_i10];
          const _h11 = (g[v_x] || -1);
          if (!((_h11 === 1))) continue;
          _g5.push(v_x);
        }
      }
      if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5).length <= 2))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q12 = true;
  Q13: {
    const _a14 = sp.cells;
    for (let _i15 = 0; _i15 < _a14.length; _i15++) {
      const v_c = _a14[_i15];
      const _h16 = (g[v_c] || -1);
      if (!((_h16 === 1))) continue;
      let _c24: boolean = (((v_c / sp.w) | 0) === _h17);
      if (!_c24) {
        let _q18 = false;
        Q19: {
          const _a21 = (_k20[v_c] ?? below(sp, v_c));
          for (let _i22 = 0; _i22 < _a21.length; _i22++) {
            const v_p = _a21[_i22];
            const _h23 = (g[v_p] || -1);
            if ((_h23 === 1)) {
              _q18 = true;
              break Q19;
            }
          }
        }
        _c24 = _q18;
      }
      if (!(_c24)) {
        _q12 = false;
        break Q13;
      }
    }
  }
  if (!(_q12)) return false;
  for (let _k25 = 0; _k25 < cl.hole.at.length; _k25++) {
    const _at26 = cl.hole.at[_k25];
    if (!(((g[_at26] || -1) === 2))) return false;
  }
  for (let _k28 = 0; _k28 < cl.number.at.length; _k28++) {
    const _at29 = cl.number.at[_k28];
    const _v30 = cl.number.v[_k28];
    let _c37: boolean = ((g[_at29] || -1) === 2);
    if (_c37) {
      let _g31 = 0;
      G32: {
        const _a34 = (_k33[_at29] ?? around(sp, _at29));
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_p = _a34[_i35];
          const _h36 = (g[v_p] || -1);
          if (!((_h36 === 1))) continue;
          _g31++;
        }
      }
      _c37 = (_g31 === _v30);
    }
    if (!(_c37)) return false;
  }
  return true;
}

export interface StrandSupportBinding {
  a: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface StrandSupportSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const strandSupportFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function strandSupport(b: Marks, sp: GridSpace, fire: Fire<StrandSupportBinding, StrandSupportSays> | null): number {
  const facts = strandSupportFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (sp.h - 1);
  const _k8 = belowKept.board(sp);
  const _a3 = cellsValued(b, sp.cells, 1);
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_a = _a3[_i4];
    if (!((((b.grid[v_a] || -1) === 1) && (((v_a / sp.w) | 0) < _h5)))) continue;
    if (DEV && staleChecking) {
      freshBinding("strandSupport", [(sp.cells.includes(v_a)), (((b.grid[v_a] || -1) === 1) && (((v_a / sp.w) | 0) < (sp.h - 1)))], ["a in", "where of a"]);
    }
    facts.length = 0;
    changed = false;
    let _c16: boolean = supportable(b, sp, v_a);
    if (_c16) {
      let _q6 = true;
      Q7: {
        const _a9 = (_k8[v_a] ?? below(sp, v_a));
        for (let _i10 = 0; _i10 < _a9.length; _i10++) {
          const v_c = _a9[_i10];
          let _c15: boolean = !((b.grid[v_c] !== 0));
          if (_c15) {
            let _q11 = true;
            Q12: {
              const _a13 = (_k8[v_a] ?? below(sp, v_a));
              for (let _i14 = 0; _i14 < _a13.length; _i14++) {
                const v_p = _a13[_i14];
                if (!((v_p !== v_c))) continue;
                if (!(((b.grid[v_p] || -1) === 2))) {
                  _q11 = false;
                  break Q12;
                }
              }
            }
            _c15 = _q11;
          }
          if (!(_c15)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) {
            _q6 = false;
            break Q7;
          }
        }
      }
      _c16 = _q6;
    }
    if (!(_c16)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: {  }, marks: { outline: setOf(v_a).slice() } };
        if (!fire({ a: v_a }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface UndercountBinding {
  k: number;
  n: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface UndercountSays {
  terms: { clue: number; value: number; };
  marks: { outline: readonly number[]; };
}

const undercountFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function undercount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UndercountBinding, UndercountSays> | null): number {
  const facts = undercountFacts;
  let fired = 0;
  let changed = false;
  const _k10 = aroundKept.board(sp);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_k = _a4[_i5];
    const _h6 = clueAt(cl.number, v_k);
    L7: {
      const v_n = _h6;
      if (!((v_n >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("undercount", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n >= 0)], ["k in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c14: boolean = (open(b, sp, v_k) >= v_n);
      if (_c14) {
        let _c13: boolean = (open(b, sp, v_k) > v_n);
        if (!_c13) {
          let _q8 = true;
          Q9: {
            const _a11 = (_k10[v_k] ?? around(sp, v_k));
            for (let _i12 = 0; _i12 < _a11.length; _i12++) {
              const v_c = _a11[_i12];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
              if (!(true)) {
                _q8 = false;
                break Q9;
              }
            }
          }
          _c13 = _q8;
        }
        _c14 = _c13;
      }
      if (!(_c14)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { clue: v_k, value: v_n }, marks: { outline: setOf(v_k).slice() } };
          if (!fire({ k: v_k, n: v_n }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ThreeBinding {
  L: number;
}

/** What a square the firing decides has of its own, read where it is made. */
export interface ThreeSaysFact {
  terms: {  };
  marks: { outline: readonly number[]; };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface ThreeSays {
  terms: {  };
  marks: {  };
  facts: ThreeSaysFact[];
}

const threeFacts: number[] = [];
const threeFactSays: ThreeSaysFact[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function three(b: Marks, sp: GridSpace, fire: Fire<ThreeBinding, ThreeSays> | null): number {
  const _g9: number[] = [];
  const _g21: number[] = [];
  const _g30: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a3 = sp.rows;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_L = _a3[_i4];
    if (DEV && staleChecking) {
      freshBinding("three", [(sp.rows.includes(v_L))], ["L in"]);
    }
    facts.length = 0;
    threeFactSays.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      const _a7 = sp.lineCells[v_L];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_c = _a7[_i8];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g9.length = 0;
        G10: {
          const _a13 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i14 = 0; _i14 < _a13.length; _i14++) {
            const v_x = _a13[_i14];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g9.push(v_x);
          }
        }
        if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g9).length <= 2))) {
          _q5 = false;
          break Q6;
        }
      }
    }
    let _c36: boolean = _q5;
    if (_c36) {
      let _q15 = true;
      Q16: {
        const _a17 = sp.lineCells[v_L];
        for (let _i18 = 0; _i18 < _a17.length; _i18++) {
          const v_c = _a17[_i18];
          let _c27: boolean = !((b.grid[v_c] !== 0));
          if (_c27) {
            const _wc19 = v_c;
            const _wd20 = 1;
            _g21.length = 0;
            G22: {
              const _a25 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i26 = 0; _i26 < _a25.length; _i26++) {
                const v_x = _a25[_i26];
                if (!(((v_x === _wc19 ? _wd20 : (b.grid[v_x] || -1)) === 1))) continue;
                _g21.push(v_x);
              }
            }
            _c27 = (stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g21).length > 2);
          }
          if (!(_c27)) continue;
          if (!(b.grid[v_c] !== 0)) {
            if (fire === null) { b.placeAt(v_c, 2); changed = true; }
            if (fire !== null) {
              const _wc28 = v_c;
              const _wd29 = 1;
              _g30.length = 0;
              G31: {
                const _a34 = sp.lineCells[sp.rowOf[v_c]];
                for (let _i35 = 0; _i35 < _a34.length; _i35++) {
                  const v_x = _a34[_i35];
                  if (!(((v_x === _wc28 ? _wd29 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g30.push(v_x);
                }
              }
              facts.push(PLACE, v_c, 2);
              threeFactSays.push({ terms: {  }, marks: { outline: stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g30).slice() } });
            }
          }
          if (!(true)) {
            _q15 = false;
            break Q16;
          }
        }
      }
      _c36 = _q15;
    }
    if (!(_c36)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        if (threeFactSays.length * 3 !== facts.length) throw new Error("three: a fact of its conclusion is made where says.fact is not read");
        const _says = { terms: {  }, marks: {  }, facts: threeFactSays.slice() };
        if (!fire({ L: v_L }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface UnsupportedBinding {
  c: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface UnsupportedSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const unsupportedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function unsupported(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UnsupportedBinding, UnsupportedSays> | null): number {
  const _g6: number[] = [];
  const facts = unsupportedFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (sp.h - 1);
  const _k10 = belowKept.board(sp);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!(((!((b.grid[v_c] !== 0)) && (((v_c / sp.w) | 0) < _h5)) && !(supportable(b, sp, v_c))))) continue;
    if (DEV && staleChecking) {
      freshBinding("unsupported", [(sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && (((v_c / sp.w) | 0) < (sp.h - 1))) && !(supportable(b, sp, v_c)))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        _g6.length = 0;
        G7: {
          const _a11 = (_k10[v_c] ?? below(sp, v_c));
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_p = _a11[_i12];
            const _h13 = clueAt(cl.hole, v_p);
            if (!((_h13 < 0))) continue;
            _g6.push(v_p);
          }
        }
        const _says = { terms: {  }, marks: { outline: _g6.slice() } };
        if (!fire({ c: v_c }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface OvercountBinding {
  k: number;
  n: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface OvercountSays {
  terms: { clue: number; value: number; };
  marks: { outline: readonly number[]; };
}

const overcountFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function overcount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OvercountBinding, OvercountSays> | null): number {
  const facts = overcountFacts;
  let fired = 0;
  let changed = false;
  const _k10 = aroundKept.board(sp);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_k = _a4[_i5];
    const _h6 = clueAt(cl.number, v_k);
    L7: {
      const v_n = _h6;
      if (!((v_n >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("overcount", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n >= 0)], ["k in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c14: boolean = (shaded(b, sp, v_k) <= v_n);
      if (_c14) {
        let _c13: boolean = (shaded(b, sp, v_k) < v_n);
        if (!_c13) {
          let _q8 = true;
          Q9: {
            const _a11 = (_k10[v_k] ?? around(sp, v_k));
            for (let _i12 = 0; _i12 < _a11.length; _i12++) {
              const v_c = _a11[_i12];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
              if (!(true)) {
                _q8 = false;
                break Q9;
              }
            }
          }
          _c13 = _q8;
        }
        _c14 = _c13;
      }
      if (!(_c14)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { clue: v_k, value: v_n }, marks: { outline: setOf(v_k).slice() } };
          if (!fire({ k: v_k, n: v_n }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

const aroundKept = keptStore<readonly number[]>();
let aroundOn: object | null = null;
let aroundAt: Kept<readonly number[]> = [];

/** `around(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function around(sp: GridSpace, v_c: number): readonly number[] {
  if (sp !== aroundOn) {
    aroundAt = aroundKept.board(sp);
    aroundOn = sp;
  }
  const _kept: Kept<readonly number[]> = aroundAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.adj8[v_c];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_p = _a5[_i6];
      if (!((((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))) continue;
      _g1.push(v_p);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const belowKept = keptStore<readonly number[]>();
let belowOn: object | null = null;
let belowAt: Kept<readonly number[]> = [];

/** `below(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function below(sp: GridSpace, v_c: number): readonly number[] {
  if (sp !== belowOn) {
    belowAt = belowKept.board(sp);
    belowOn = sp;
  }
  const _kept: Kept<readonly number[]> = belowAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a5 = around(sp, v_c);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_p = _a5[_i6];
      if (!((((v_p / sp.w) | 0) > ((v_c / sp.w) | 0)))) continue;
      _g1.push(v_p);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const supportableKept = keptStore<boolean>();

/** `supportable(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function supportable(b: Marks, sp: GridSpace, v_c: number): boolean {
  const _kept: Kept<boolean> = supportableKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _q1 = false;
  Q2: {
    const _a3 = below(sp, v_c);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_p = _a3[_i4];
      if (((b.grid[v_p] || -1) !== 2)) {
        _q1 = true;
        break Q2;
      }
    }
  }
  const _made = _q1;
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<number>();

/** `open(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = openKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g1 = 0;
  G2: {
    const _a3 = around(sp, v_k);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_p = _a3[_i4];
      if (!(((b.grid[v_p] || -1) !== 2))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_k] = _made;
  return _made;
}

const shadedKept = keptStore<number>();

/** `shaded(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function shaded(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = shadedKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g1 = 0;
  G2: {
    const _a3 = around(sp, v_k);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_p = _a3[_i4];
      if (!(((b.grid[v_p] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_k] = _made;
  return _made;
}
