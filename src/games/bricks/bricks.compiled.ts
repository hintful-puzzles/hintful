// Compiled by `npm run describe` from src/games/bricks/bricks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, stretch, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g139: number[] = [];
  const _g154: number[] = [];
  const _g164: number[] = [];
  const _g186: number[] = [];
  const _h151 = (sp.h - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q135 = true;
  Q136: {
    const _a137 = sp.cells;
    for (let _i138 = 0; _i138 < _a137.length; _i138++) {
      const v_c = _a137[_i138];
      _g139.length = 0;
      G140: {
        const _a143 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i144 = 0; _i144 < _a143.length; _i144++) {
          const v_x = _a143[_i144];
          const _h145 = (g[v_x] || -1);
          if (!((_h145 === 1))) continue;
          _g139.push(v_x);
        }
      }
      if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g139).length <= 2))) {
        _q135 = false;
        break Q136;
      }
    }
  }
  if (!(_q135)) return false;
  let _q146 = true;
  Q147: {
    const _a148 = sp.cells;
    for (let _i149 = 0; _i149 < _a148.length; _i149++) {
      const v_c = _a148[_i149];
      const _h150 = (g[v_c] || -1);
      if (!((_h150 === 1))) continue;
      const _h170 = (v_c % sp.w);
      const _h171 = ((v_c / sp.w) | 0);
      let _c177: boolean = (((v_c / sp.w) | 0) === _h151);
      if (!_c177) {
        let _q152 = false;
        Q153: {
          _g154.length = 0;
          G155: {
            _g164.length = 0;
            G165: {
              const _a168 = sp.adj8[v_c];
              for (let _i169 = 0; _i169 < _a168.length; _i169++) {
                const v_p = _a168[_i169];
                if (!((((v_p % sp.w) - _h170) !== (((v_p / sp.w) | 0) - _h171)))) continue;
                _g164.push(v_p);
              }
            }
            const _a172 = _g164;
            for (let _i173 = 0; _i173 < _a172.length; _i173++) {
              const v_p = _a172[_i173];
              if (!((((v_p / sp.w) | 0) > _h171))) continue;
              _g154.push(v_p);
            }
          }
          const _a174 = _g154;
          for (let _i175 = 0; _i175 < _a174.length; _i175++) {
            const v_p = _a174[_i175];
            const _h176 = (g[v_p] || -1);
            if ((_h176 === 1)) {
              _q152 = true;
              break Q153;
            }
          }
        }
        _c177 = _q152;
      }
      if (!(_c177)) {
        _q146 = false;
        break Q147;
      }
    }
  }
  if (!(_q146)) return false;
  for (let _k178 = 0; _k178 < cl.hole.at.length; _k178++) {
    const _at179 = cl.hole.at[_k178];
    if (!(((g[_at179] || -1) === 2))) return false;
  }
  for (let _k181 = 0; _k181 < cl.number.at.length; _k181++) {
    const _at182 = cl.number.at[_k181];
    const _v183 = cl.number.v[_k181];
    let _c197: boolean = ((g[_at182] || -1) === 2);
    if (_c197) {
      const _h192 = (_at182 % sp.w);
      const _h193 = ((_at182 / sp.w) | 0);
      let _g184 = 0;
      G185: {
        _g186.length = 0;
        G187: {
          const _a190 = sp.adj8[_at182];
          for (let _i191 = 0; _i191 < _a190.length; _i191++) {
            const v_p = _a190[_i191];
            if (!((((v_p % sp.w) - _h192) !== (((v_p / sp.w) | 0) - _h193)))) continue;
            _g186.push(v_p);
          }
        }
        const _a194 = _g186;
        for (let _i195 = 0; _i195 < _a194.length; _i195++) {
          const v_p = _a194[_i195];
          const _h196 = (g[v_p] || -1);
          if (!((_h196 === 1))) continue;
          _g184++;
        }
      }
      _c197 = (_g184 === _v183);
    }
    if (!(_c197)) return false;
  }
  return true;
}

export interface StrandSupportBinding {
  a: number;
}

const strandSupportFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function strandSupport(b: Marks, sp: GridSpace, fire: Fire<StrandSupportBinding> | null): number {
  const facts = strandSupportFacts;
  let fired = 0;
  let changed = false;
  const _h7 = (sp.h - 1);
  const _a5 = sp.cells;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_a = _a5[_i6];
    if (!((((b.grid[v_a] || -1) === 1) && (((v_a / sp.w) | 0) < _h7)))) continue;
    facts.length = 0;
    changed = false;
    let _c39: boolean = supportable(b, sp, v_a);
    if (_c39) {
      let _q30 = true;
      Q31: {
        const _a32 = below(sp, v_a);
        for (let _i33 = 0; _i33 < _a32.length; _i33++) {
          const v_c = _a32[_i33];
          let _c38: boolean = !((b.grid[v_c] !== 0));
          if (_c38) {
            let _q34 = true;
            Q35: {
              const _a36 = below(sp, v_a);
              for (let _i37 = 0; _i37 < _a36.length; _i37++) {
                const v_p = _a36[_i37];
                if (!((v_p !== v_c))) continue;
                if (!(((b.grid[v_p] || -1) === 2))) {
                  _q34 = false;
                  break Q35;
                }
              }
            }
            _c38 = _q34;
          }
          if (!(_c38)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) {
            _q30 = false;
            break Q31;
          }
        }
      }
      _c39 = _q30;
    }
    if (!(_c39)) return -1;
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
  const _g59: number[] = [];
  const facts = undercountFacts;
  let fired = 0;
  let changed = false;
  const _a43 = sp.cells;
  for (let _i44 = 0; _i44 < _a43.length; _i44++) {
    const v_k = _a43[_i44];
    const _h45 = clueAt(cl.number, v_k);
    const _h65 = (v_k % sp.w);
    const _h66 = ((v_k / sp.w) | 0);
    L46: {
      const v_n = _h45;
      if (!((v_n >= 0))) break L46;
      facts.length = 0;
      changed = false;
      let _c70: boolean = (open(b, sp, v_k) >= v_n);
      if (_c70) {
        let _c69: boolean = (open(b, sp, v_k) > v_n);
        if (!_c69) {
          let _q57 = true;
          Q58: {
            _g59.length = 0;
            G60: {
              const _a63 = sp.adj8[v_k];
              for (let _i64 = 0; _i64 < _a63.length; _i64++) {
                const v_p = _a63[_i64];
                if (!((((v_p % sp.w) - _h65) !== (((v_p / sp.w) | 0) - _h66)))) continue;
                _g59.push(v_p);
              }
            }
            const _a67 = _g59;
            for (let _i68 = 0; _i68 < _a67.length; _i68++) {
              const v_c = _a67[_i68];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
              if (!(true)) {
                _q57 = false;
                break Q58;
              }
            }
          }
          _c69 = _q57;
        }
        _c70 = _c69;
      }
      if (!(_c70)) return -1;
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
  const _g79: number[] = [];
  const _g91: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a73 = sp.rows;
  for (let _i74 = 0; _i74 < _a73.length; _i74++) {
    const v_L = _a73[_i74];
    facts.length = 0;
    changed = false;
    let _q75 = true;
    Q76: {
      const _a77 = sp.lineCells[v_L];
      for (let _i78 = 0; _i78 < _a77.length; _i78++) {
        const v_c = _a77[_i78];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g79.length = 0;
        G80: {
          const _a83 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i84 = 0; _i84 < _a83.length; _i84++) {
            const v_x = _a83[_i84];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g79.push(v_x);
          }
        }
        if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g79).length <= 2))) {
          _q75 = false;
          break Q76;
        }
      }
    }
    let _c98: boolean = _q75;
    if (_c98) {
      let _q85 = true;
      Q86: {
        const _a87 = sp.lineCells[v_L];
        for (let _i88 = 0; _i88 < _a87.length; _i88++) {
          const v_c = _a87[_i88];
          let _c97: boolean = !((b.grid[v_c] !== 0));
          if (_c97) {
            const _wc89 = v_c;
            const _wd90 = 1;
            _g91.length = 0;
            G92: {
              const _a95 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                const v_x = _a95[_i96];
                if (!(((v_x === _wc89 ? _wd90 : (b.grid[v_x] || -1)) === 1))) continue;
                _g91.push(v_x);
              }
            }
            _c97 = (stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g91).length > 2);
          }
          if (!(_c97)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q85 = false;
            break Q86;
          }
        }
      }
      _c98 = _q85;
    }
    if (!(_c98)) return -1;
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
  const _h103 = (sp.h - 1);
  const _a101 = sp.cells;
  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
    const v_c = _a101[_i102];
    if (!(((!((b.grid[v_c] !== 0)) && (((v_c / sp.w) | 0) < _h103)) && !(supportable(b, sp, v_c))))) continue;
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
  const _g123: number[] = [];
  const facts = overcountFacts;
  let fired = 0;
  let changed = false;
  const _a107 = sp.cells;
  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
    const v_k = _a107[_i108];
    const _h109 = clueAt(cl.number, v_k);
    const _h129 = (v_k % sp.w);
    const _h130 = ((v_k / sp.w) | 0);
    L110: {
      const v_n = _h109;
      if (!((v_n >= 0))) break L110;
      facts.length = 0;
      changed = false;
      let _c134: boolean = (shaded(b, sp, v_k) <= v_n);
      if (_c134) {
        let _c133: boolean = (shaded(b, sp, v_k) < v_n);
        if (!_c133) {
          let _q121 = true;
          Q122: {
            _g123.length = 0;
            G124: {
              const _a127 = sp.adj8[v_k];
              for (let _i128 = 0; _i128 < _a127.length; _i128++) {
                const v_p = _a127[_i128];
                if (!((((v_p % sp.w) - _h129) !== (((v_p / sp.w) | 0) - _h130)))) continue;
                _g123.push(v_p);
              }
            }
            const _a131 = _g123;
            for (let _i132 = 0; _i132 < _a131.length; _i132++) {
              const v_c = _a131[_i132];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
              if (!(true)) {
                _q121 = false;
                break Q122;
              }
            }
          }
          _c133 = _q121;
        }
        _c134 = _c133;
      }
      if (!(_c134)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

const belowKept = keptStore<readonly number[]>();

/** `below(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function below(sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = belowKept.board(sp);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g10: number[] = [];
  G11: {
    const _g20: number[] = [];
    G21: {
      const _a24 = sp.adj8[v_c];
      for (let _i25 = 0; _i25 < _a24.length; _i25++) {
        const v_p = _a24[_i25];
        if (!((((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))) continue;
        _g20.push(v_p);
      }
    }
    const _a26 = _g20;
    for (let _i27 = 0; _i27 < _a26.length; _i27++) {
      const v_p = _a26[_i27];
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
    const _a28 = below(sp, v_c);
    for (let _i29 = 0; _i29 < _a28.length; _i29++) {
      const v_p = _a28[_i29];
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
  let _g47 = 0;
  G48: {
    const _g49: number[] = [];
    G50: {
      const _a53 = sp.adj8[v_k];
      for (let _i54 = 0; _i54 < _a53.length; _i54++) {
        const v_p = _a53[_i54];
        if (!((((v_p % sp.w) - (v_k % sp.w)) !== (((v_p / sp.w) | 0) - ((v_k / sp.w) | 0))))) continue;
        _g49.push(v_p);
      }
    }
    const _a55 = _g49;
    for (let _i56 = 0; _i56 < _a55.length; _i56++) {
      const v_p = _a55[_i56];
      if (!(((b.grid[v_p] || -1) !== 2))) continue;
      _g47++;
    }
  }
  const _made = _g47;
  _kept[v_k] = _made;
  return _made;
}

const shadedKept = keptStore<number>();

/** `shaded(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function shaded(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = shadedKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g111 = 0;
  G112: {
    const _g113: number[] = [];
    G114: {
      const _a117 = sp.adj8[v_k];
      for (let _i118 = 0; _i118 < _a117.length; _i118++) {
        const v_p = _a117[_i118];
        if (!((((v_p % sp.w) - (v_k % sp.w)) !== (((v_p / sp.w) | 0) - ((v_k / sp.w) | 0))))) continue;
        _g113.push(v_p);
      }
    }
    const _a119 = _g113;
    for (let _i120 = 0; _i120 < _a119.length; _i120++) {
      const v_p = _a119[_i120];
      if (!(((b.grid[v_p] || -1) === 1))) continue;
      _g111++;
    }
  }
  const _made = _g111;
  _kept[v_k] = _made;
  return _made;
}
