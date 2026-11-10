// Compiled by `npm run describe` from src/games/bricks/bricks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, cellsValued, clueAt, freshBinding, keptStore, staleChecking, stretch, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g108: number[] = [];
  const _h120 = (sp.h - 1);
  const _k123 = belowKept.board(sp);
  const _k136 = aroundKept.board(sp);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q104 = true;
  Q105: {
    const _a106 = sp.cells;
    for (let _i107 = 0; _i107 < _a106.length; _i107++) {
      const v_c = _a106[_i107];
      _g108.length = 0;
      G109: {
        const _a112 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i113 = 0; _i113 < _a112.length; _i113++) {
          const v_x = _a112[_i113];
          const _h114 = (g[v_x] || -1);
          if (!((_h114 === 1))) continue;
          _g108.push(v_x);
        }
      }
      if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g108).length <= 2))) {
        _q104 = false;
        break Q105;
      }
    }
  }
  if (!(_q104)) return false;
  let _q115 = true;
  Q116: {
    const _a117 = sp.cells;
    for (let _i118 = 0; _i118 < _a117.length; _i118++) {
      const v_c = _a117[_i118];
      const _h119 = (g[v_c] || -1);
      if (!((_h119 === 1))) continue;
      let _c127: boolean = (((v_c / sp.w) | 0) === _h120);
      if (!_c127) {
        let _q121 = false;
        Q122: {
          const _a124 = (_k123[v_c] ?? below(sp, v_c));
          for (let _i125 = 0; _i125 < _a124.length; _i125++) {
            const v_p = _a124[_i125];
            const _h126 = (g[v_p] || -1);
            if ((_h126 === 1)) {
              _q121 = true;
              break Q122;
            }
          }
        }
        _c127 = _q121;
      }
      if (!(_c127)) {
        _q115 = false;
        break Q116;
      }
    }
  }
  if (!(_q115)) return false;
  for (let _k128 = 0; _k128 < cl.hole.at.length; _k128++) {
    const _at129 = cl.hole.at[_k128];
    if (!(((g[_at129] || -1) === 2))) return false;
  }
  for (let _k131 = 0; _k131 < cl.number.at.length; _k131++) {
    const _at132 = cl.number.at[_k131];
    const _v133 = cl.number.v[_k131];
    let _c140: boolean = ((g[_at132] || -1) === 2);
    if (_c140) {
      let _g134 = 0;
      G135: {
        const _a137 = (_k136[_at132] ?? around(sp, _at132));
        for (let _i138 = 0; _i138 < _a137.length; _i138++) {
          const v_p = _a137[_i138];
          const _h139 = (g[v_p] || -1);
          if (!((_h139 === 1))) continue;
          _g134++;
        }
      }
      _c140 = (_g134 === _v133);
    }
    if (!(_c140)) return false;
  }
  return true;
}

export interface StrandSupportBinding {
  a: number;
}

const strandSupportFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function strandSupport(b: Marks, sp: GridSpace, fire: Fire<StrandSupportBinding> | null): number {
  const facts = strandSupportFacts;
  let fired = 0;
  let changed = false;
  const _h7 = (sp.h - 1);
  const _k26 = belowKept.board(sp);
  const _a5 = cellsValued(b, sp.cells, 1);
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_a = _a5[_i6];
    if (!((((b.grid[v_a] || -1) === 1) && (((v_a / sp.w) | 0) < _h7)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("strandSupport", [(sp.cells.includes(v_a)), (((b.grid[v_a] || -1) === 1) && (((v_a / sp.w) | 0) < (sp.h - 1)))], ["a in", "where of a"]);
    }
    facts.length = 0;
    changed = false;
    let _c34: boolean = supportable(b, sp, v_a);
    if (_c34) {
      let _q24 = true;
      Q25: {
        const _a27 = (_k26[v_a] ?? below(sp, v_a));
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_c = _a27[_i28];
          let _c33: boolean = !((b.grid[v_c] !== 0));
          if (_c33) {
            let _q29 = true;
            Q30: {
              const _a31 = (_k26[v_a] ?? below(sp, v_a));
              for (let _i32 = 0; _i32 < _a31.length; _i32++) {
                const v_p = _a31[_i32];
                if (!((v_p !== v_c))) continue;
                if (!(((b.grid[v_p] || -1) === 2))) {
                  _q29 = false;
                  break Q30;
                }
              }
            }
            _c33 = _q29;
          }
          if (!(_c33)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) {
            _q24 = false;
            break Q25;
          }
        }
      }
      _c34 = _q24;
    }
    if (!(_c34)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ a: v_a }, facts)) return 1;
    }
  }
  return fired;
}

export interface UndercountBinding {
  k: number;
  n: number;
}

const undercountFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function undercount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UndercountBinding> | null): number {
  const facts = undercountFacts;
  let fired = 0;
  let changed = false;
  const _k48 = aroundKept.board(sp);
  const _a38 = sp.cells;
  for (let _i39 = 0; _i39 < _a38.length; _i39++) {
    const v_k = _a38[_i39];
    const _h40 = clueAt(cl.number, v_k);
    L41: {
      const v_n = _h40;
      if (!((v_n >= 0))) break L41;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("undercount", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n >= 0)], ["k in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c52: boolean = (open(b, sp, v_k) >= v_n);
      if (_c52) {
        let _c51: boolean = (open(b, sp, v_k) > v_n);
        if (!_c51) {
          let _q46 = true;
          Q47: {
            const _a49 = (_k48[v_k] ?? around(sp, v_k));
            for (let _i50 = 0; _i50 < _a49.length; _i50++) {
              const v_c = _a49[_i50];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
              if (!(true)) {
                _q46 = false;
                break Q47;
              }
            }
          }
          _c51 = _q46;
        }
        _c52 = _c51;
      }
      if (!(_c52)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ThreeBinding {
  L: number;
}

const threeFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function three(b: Marks, sp: GridSpace, fire: Fire<ThreeBinding> | null): number {
  const _g61: number[] = [];
  const _g73: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a55 = sp.rows;
  for (let _i56 = 0; _i56 < _a55.length; _i56++) {
    const v_L = _a55[_i56];
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("three", [(sp.rows.includes(v_L))], ["L in"]);
    }
    facts.length = 0;
    changed = false;
    let _q57 = true;
    Q58: {
      const _a59 = sp.lineCells[v_L];
      for (let _i60 = 0; _i60 < _a59.length; _i60++) {
        const v_c = _a59[_i60];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g61.length = 0;
        G62: {
          const _a65 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i66 = 0; _i66 < _a65.length; _i66++) {
            const v_x = _a65[_i66];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g61.push(v_x);
          }
        }
        if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g61).length <= 2))) {
          _q57 = false;
          break Q58;
        }
      }
    }
    let _c80: boolean = _q57;
    if (_c80) {
      let _q67 = true;
      Q68: {
        const _a69 = sp.lineCells[v_L];
        for (let _i70 = 0; _i70 < _a69.length; _i70++) {
          const v_c = _a69[_i70];
          let _c79: boolean = !((b.grid[v_c] !== 0));
          if (_c79) {
            const _wc71 = v_c;
            const _wd72 = 1;
            _g73.length = 0;
            G74: {
              const _a77 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i78 = 0; _i78 < _a77.length; _i78++) {
                const v_x = _a77[_i78];
                if (!(((v_x === _wc71 ? _wd72 : (b.grid[v_x] || -1)) === 1))) continue;
                _g73.push(v_x);
              }
            }
            _c79 = (stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g73).length > 2);
          }
          if (!(_c79)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q67 = false;
            break Q68;
          }
        }
      }
      _c80 = _q67;
    }
    if (!(_c80)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ L: v_L }, facts)) return 1;
    }
  }
  return fired;
}

export interface UnsupportedBinding {
  c: number;
}

const unsupportedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function unsupported(b: Marks, sp: GridSpace, fire: Fire<UnsupportedBinding> | null): number {
  const facts = unsupportedFacts;
  let fired = 0;
  let changed = false;
  const _h85 = (sp.h - 1);
  const _a83 = sp.cells;
  for (let _i84 = 0; _i84 < _a83.length; _i84++) {
    const v_c = _a83[_i84];
    if (!(((!((b.grid[v_c] !== 0)) && (((v_c / sp.w) | 0) < _h85)) && !(supportable(b, sp, v_c))))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("unsupported", [(sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && (((v_c / sp.w) | 0) < (sp.h - 1))) && !(supportable(b, sp, v_c)))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface OvercountBinding {
  k: number;
  n: number;
}

const overcountFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function overcount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OvercountBinding> | null): number {
  const facts = overcountFacts;
  let fired = 0;
  let changed = false;
  const _k99 = aroundKept.board(sp);
  const _a89 = sp.cells;
  for (let _i90 = 0; _i90 < _a89.length; _i90++) {
    const v_k = _a89[_i90];
    const _h91 = clueAt(cl.number, v_k);
    L92: {
      const v_n = _h91;
      if (!((v_n >= 0))) break L92;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("overcount", [(sp.cells.includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n >= 0)], ["k in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c103: boolean = (shaded(b, sp, v_k) <= v_n);
      if (_c103) {
        let _c102: boolean = (shaded(b, sp, v_k) < v_n);
        if (!_c102) {
          let _q97 = true;
          Q98: {
            const _a100 = (_k99[v_k] ?? around(sp, v_k));
            for (let _i101 = 0; _i101 < _a100.length; _i101++) {
              const v_c = _a100[_i101];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
              if (!(true)) {
                _q97 = false;
                break Q98;
              }
            }
          }
          _c102 = _q97;
        }
        _c103 = _c102;
      }
      if (!(_c103)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
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
  const _g12: number[] = [];
  G13: {
    const _a16 = sp.adj8[v_c];
    for (let _i17 = 0; _i17 < _a16.length; _i17++) {
      const v_p = _a16[_i17];
      if (!((((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))) continue;
      _g12.push(v_p);
    }
  }
  const _made = _g12;
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
  const _g10: number[] = [];
  G11: {
    const _a20 = around(sp, v_c);
    for (let _i21 = 0; _i21 < _a20.length; _i21++) {
      const v_p = _a20[_i21];
      if (!((((v_p / sp.w) | 0) > ((v_c / sp.w) | 0)))) continue;
      _g10.push(v_p);
    }
  }
  const _made = _g10;
  _kept[v_c] = _made;
  return _made;
}

const supportableKept = keptStore<boolean>();

/** `supportable(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function supportable(b: Marks, sp: GridSpace, v_c: number): boolean {
  const _kept: Kept<boolean> = supportableKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _q8 = false;
  Q9: {
    const _a22 = below(sp, v_c);
    for (let _i23 = 0; _i23 < _a22.length; _i23++) {
      const v_p = _a22[_i23];
      if (((b.grid[v_p] || -1) !== 2)) {
        _q8 = true;
        break Q9;
      }
    }
  }
  const _made = _q8;
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<number>();

/** `open(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = openKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g42 = 0;
  G43: {
    const _a44 = around(sp, v_k);
    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
      const v_p = _a44[_i45];
      if (!(((b.grid[v_p] || -1) !== 2))) continue;
      _g42++;
    }
  }
  const _made = _g42;
  _kept[v_k] = _made;
  return _made;
}

const shadedKept = keptStore<number>();

/** `shaded(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function shaded(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = shadedKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g93 = 0;
  G94: {
    const _a95 = around(sp, v_k);
    for (let _i96 = 0; _i96 < _a95.length; _i96++) {
      const v_p = _a95[_i96];
      if (!(((b.grid[v_p] || -1) === 1))) continue;
      _g93++;
    }
  }
  const _made = _g93;
  _kept[v_k] = _made;
  return _made;
}
