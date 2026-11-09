// Compiled by `npm run describe` from src/games/bricks/bricks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, cellsValued, clueAt, keptStore, stretch, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g105: number[] = [];
  const _h117 = (sp.h - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q101 = true;
  Q102: {
    const _a103 = sp.cells;
    for (let _i104 = 0; _i104 < _a103.length; _i104++) {
      const v_c = _a103[_i104];
      _g105.length = 0;
      G106: {
        const _a109 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i110 = 0; _i110 < _a109.length; _i110++) {
          const v_x = _a109[_i110];
          const _h111 = (g[v_x] || -1);
          if (!((_h111 === 1))) continue;
          _g105.push(v_x);
        }
      }
      if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g105).length <= 2))) {
        _q101 = false;
        break Q102;
      }
    }
  }
  if (!(_q101)) return false;
  let _q112 = true;
  Q113: {
    const _a114 = sp.cells;
    for (let _i115 = 0; _i115 < _a114.length; _i115++) {
      const v_c = _a114[_i115];
      const _h116 = (g[v_c] || -1);
      if (!((_h116 === 1))) continue;
      let _c123: boolean = (((v_c / sp.w) | 0) === _h117);
      if (!_c123) {
        let _q118 = false;
        Q119: {
          const _a120 = below(sp, v_c);
          for (let _i121 = 0; _i121 < _a120.length; _i121++) {
            const v_p = _a120[_i121];
            const _h122 = (g[v_p] || -1);
            if ((_h122 === 1)) {
              _q118 = true;
              break Q119;
            }
          }
        }
        _c123 = _q118;
      }
      if (!(_c123)) {
        _q112 = false;
        break Q113;
      }
    }
  }
  if (!(_q112)) return false;
  for (let _k124 = 0; _k124 < cl.hole.at.length; _k124++) {
    const _at125 = cl.hole.at[_k124];
    if (!(((g[_at125] || -1) === 2))) return false;
  }
  for (let _k127 = 0; _k127 < cl.number.at.length; _k127++) {
    const _at128 = cl.number.at[_k127];
    const _v129 = cl.number.v[_k127];
    let _c135: boolean = ((g[_at128] || -1) === 2);
    if (_c135) {
      let _g130 = 0;
      G131: {
        const _a132 = around(sp, _at128);
        for (let _i133 = 0; _i133 < _a132.length; _i133++) {
          const v_p = _a132[_i133];
          const _h134 = (g[v_p] || -1);
          if (!((_h134 === 1))) continue;
          _g130++;
        }
      }
      _c135 = (_g130 === _v129);
    }
    if (!(_c135)) return false;
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
  const _a5 = cellsValued(b, sp.cells, 1);
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_a = _a5[_i6];
    if (!((((b.grid[v_a] || -1) === 1) && (((v_a / sp.w) | 0) < _h7)))) continue;
    facts.length = 0;
    changed = false;
    let _c33: boolean = supportable(b, sp, v_a);
    if (_c33) {
      let _q24 = true;
      Q25: {
        const _a26 = below(sp, v_a);
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_c = _a26[_i27];
          let _c32: boolean = !((b.grid[v_c] !== 0));
          if (_c32) {
            let _q28 = true;
            Q29: {
              const _a30 = below(sp, v_a);
              for (let _i31 = 0; _i31 < _a30.length; _i31++) {
                const v_p = _a30[_i31];
                if (!((v_p !== v_c))) continue;
                if (!(((b.grid[v_p] || -1) === 2))) {
                  _q28 = false;
                  break Q29;
                }
              }
            }
            _c32 = _q28;
          }
          if (!(_c32)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) {
            _q24 = false;
            break Q25;
          }
        }
      }
      _c33 = _q24;
    }
    if (!(_c33)) return -1;
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
  const _a37 = sp.cells;
  for (let _i38 = 0; _i38 < _a37.length; _i38++) {
    const v_k = _a37[_i38];
    const _h39 = clueAt(cl.number, v_k);
    L40: {
      const v_n = _h39;
      if (!((v_n >= 0))) break L40;
      facts.length = 0;
      changed = false;
      let _c50: boolean = (open(b, sp, v_k) >= v_n);
      if (_c50) {
        let _c49: boolean = (open(b, sp, v_k) > v_n);
        if (!_c49) {
          let _q45 = true;
          Q46: {
            const _a47 = around(sp, v_k);
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_c = _a47[_i48];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
              if (!(true)) {
                _q45 = false;
                break Q46;
              }
            }
          }
          _c49 = _q45;
        }
        _c50 = _c49;
      }
      if (!(_c50)) return -1;
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
  const _g59: number[] = [];
  const _g71: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a53 = sp.rows;
  for (let _i54 = 0; _i54 < _a53.length; _i54++) {
    const v_L = _a53[_i54];
    facts.length = 0;
    changed = false;
    let _q55 = true;
    Q56: {
      const _a57 = sp.lineCells[v_L];
      for (let _i58 = 0; _i58 < _a57.length; _i58++) {
        const v_c = _a57[_i58];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g59.length = 0;
        G60: {
          const _a63 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i64 = 0; _i64 < _a63.length; _i64++) {
            const v_x = _a63[_i64];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g59.push(v_x);
          }
        }
        if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g59).length <= 2))) {
          _q55 = false;
          break Q56;
        }
      }
    }
    let _c78: boolean = _q55;
    if (_c78) {
      let _q65 = true;
      Q66: {
        const _a67 = sp.lineCells[v_L];
        for (let _i68 = 0; _i68 < _a67.length; _i68++) {
          const v_c = _a67[_i68];
          let _c77: boolean = !((b.grid[v_c] !== 0));
          if (_c77) {
            const _wc69 = v_c;
            const _wd70 = 1;
            _g71.length = 0;
            G72: {
              const _a75 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i76 = 0; _i76 < _a75.length; _i76++) {
                const v_x = _a75[_i76];
                if (!(((v_x === _wc69 ? _wd70 : (b.grid[v_x] || -1)) === 1))) continue;
                _g71.push(v_x);
              }
            }
            _c77 = (stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g71).length > 2);
          }
          if (!(_c77)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q65 = false;
            break Q66;
          }
        }
      }
      _c78 = _q65;
    }
    if (!(_c78)) return -1;
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
  const _h83 = (sp.h - 1);
  const _a81 = sp.cells;
  for (let _i82 = 0; _i82 < _a81.length; _i82++) {
    const v_c = _a81[_i82];
    if (!(((!((b.grid[v_c] !== 0)) && (((v_c / sp.w) | 0) < _h83)) && !(supportable(b, sp, v_c))))) continue;
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
  const _a87 = sp.cells;
  for (let _i88 = 0; _i88 < _a87.length; _i88++) {
    const v_k = _a87[_i88];
    const _h89 = clueAt(cl.number, v_k);
    L90: {
      const v_n = _h89;
      if (!((v_n >= 0))) break L90;
      facts.length = 0;
      changed = false;
      let _c100: boolean = (shaded(b, sp, v_k) <= v_n);
      if (_c100) {
        let _c99: boolean = (shaded(b, sp, v_k) < v_n);
        if (!_c99) {
          let _q95 = true;
          Q96: {
            const _a97 = around(sp, v_k);
            for (let _i98 = 0; _i98 < _a97.length; _i98++) {
              const v_c = _a97[_i98];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
              if (!(true)) {
                _q95 = false;
                break Q96;
              }
            }
          }
          _c99 = _q95;
        }
        _c100 = _c99;
      }
      if (!(_c100)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

const aroundKept = keptStore<readonly number[]>();

/** `around(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function around(sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = aroundKept.board(sp);
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

/** `below(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function below(sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = belowKept.board(sp);
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
  let _g41 = 0;
  G42: {
    const _a43 = around(sp, v_k);
    for (let _i44 = 0; _i44 < _a43.length; _i44++) {
      const v_p = _a43[_i44];
      if (!(((b.grid[v_p] || -1) !== 2))) continue;
      _g41++;
    }
  }
  const _made = _g41;
  _kept[v_k] = _made;
  return _made;
}

const shadedKept = keptStore<number>();

/** `shaded(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function shaded(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = shadedKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g91 = 0;
  G92: {
    const _a93 = around(sp, v_k);
    for (let _i94 = 0; _i94 < _a93.length; _i94++) {
      const v_p = _a93[_i94];
      if (!(((b.grid[v_p] || -1) === 1))) continue;
      _g91++;
    }
  }
  const _made = _g91;
  _kept[v_k] = _made;
  return _made;
}
