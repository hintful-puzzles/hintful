// Compiled by `npm run describe` from src/skeleton/grid/skeleton.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, minus, rangeMask, sameSet, staleChecking, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "count" | "shared";

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
  { id: "count", tier: 0 },
  { id: "shared", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  for (let _k142 = 0; _k142 < cl.count.at.length; _k142++) {
    const _at143 = cl.count.at[_k142];
    const _v144 = cl.count.v[_k142];
    let _c150: boolean = ((g[_at143] || -1) === 2);
    if (_c150) {
      let _g145 = 0;
      G146: {
        const _a147 = sp.adj4[_at143];
        for (let _i148 = 0; _i148 < _a147.length; _i148++) {
          const v_d = _a147[_i148];
          const _h149 = (g[v_d] || -1);
          if (!((_h149 === 1))) continue;
          _g145++;
        }
      }
      _c150 = (_g145 === _v144);
    }
    if (!(_c150)) return false;
  }
  return true;
}

export interface CountBinding {
  k: number;
  c: number;
  n: number;
  O: readonly number[];
}

const countFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g17: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    const _h12 = clueAt(cl.count, v_c);
    let _g13 = 0;
    G14: {
      const _a15 = sp.adj4[v_c];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_d = _a15[_i16];
        if (!(((b.grid[v_d] || -1) === 1))) continue;
        _g13++;
      }
    }
    const v_n = (_h12 - _g13);
    _g17.length = 0;
    G18: {
      const _a21 = sp.adj4[v_c];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_d = _a21[_i22];
        const _h23 = clueAt(cl.count, v_d);
        if (!((!((b.grid[v_d] !== 0)) && (_h23 === -1)))) continue;
        _g17.push(v_d);
      }
    }
    L24: {
      const v_O = _g17;
      const _h25 = v_O.length;
      if (!(((_h25 > 0) && ((v_n <= 0) || (v_n >= _h25))))) break L24;
      if (import.meta.env.DEV && staleChecking) {
        let _g26 = 0;
        G27: {
          const _a28 = sp.adj4[v_c];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_d = _a28[_i29];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g26++;
          }
        }
        const _g30: number[] = [];
        G31: {
          const _a34 = sp.adj4[v_c];
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_d = _a34[_i35];
            if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
            _g30.push(v_d);
          }
        }
        freshBinding("count", [(v_c === cl.count.at[v_k]), (v_n === (clueAt(cl.count, v_c) - _g26)), sameSet(v_O, _g30), ((v_O.length > 0) && ((v_n <= 0) || (v_n >= v_O.length)))], ["c =", "n =", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c41: boolean = ((v_n >= 0) && (v_n <= _h25));
      if (_c41) {
        let _c40: boolean = !((v_n === 0));
        if (!_c40) {
          let _q36 = true;
          Q37: {
            const _a38 = v_O;
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_d = _a38[_i39];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c40 = _q36;
        }
        _c41 = _c40;
      }
      let _c47: boolean = _c41;
      if (_c47) {
        let _c46: boolean = (v_n === 0);
        if (!_c46) {
          let _q42 = true;
          Q43: {
            const _a44 = v_O;
            for (let _i45 = 0; _i45 < _a44.length; _i45++) {
              const v_d = _a44[_i45];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
              if (!(true)) {
                _q42 = false;
                break Q43;
              }
            }
          }
          _c46 = _q42;
        }
        _c47 = _c46;
      }
      if (!(_c47)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, c: v_c, n: v_n, O: v_O.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SharedBinding {
  k: number;
  c: number;
  O: readonly number[];
  b: number;
  M: readonly number[];
  by: number;
  R: readonly number[];
}

const sharedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function shared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedBinding> | null): number {
  const _g73: number[] = [];
  const _g85: number[] = [];
  const _g104: number[] = [];
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    const _m35_0 = b.made[0];
    _g73.length = 0;
    G74: {
      const _a77 = sp.adj4[v_c];
      for (let _i78 = 0; _i78 < _a77.length; _i78++) {
        const v_d = _a77[_i78];
        const _h79 = clueAt(cl.count, v_d);
        if (!((!((b.grid[v_d] !== 0)) && (_h79 === -1)))) continue;
        _g73.push(v_d);
      }
    }
    L80: {
      const v_O = _g73;
      const _h81 = v_O.length;
      if (!((_h81 >= 2))) break L80;
      const _a82 = within(sp, v_c, 2);
      for (let _i83 = 0; _i83 < _a82.length; _i83++) {
        const v_b = _a82[_i83];
        const _h84 = clueAt(cl.count, v_b);
        if (!(((v_b !== v_c) && (_h84 !== -1)))) continue;
        _g85.length = 0;
        G86: {
          const _a89 = sp.adj4[v_b];
          for (let _i90 = 0; _i90 < _a89.length; _i90++) {
            const v_d = _a89[_i90];
            const _h91 = clueAt(cl.count, v_d);
            if (!((!((b.grid[v_d] !== 0)) && (_h91 === -1)))) continue;
            _g85.push(v_d);
          }
        }
        L92: {
          const v_M = _g85;
          const _h93 = v_M.length;
          if (!((((_h93 > 0) && (_h93 < _h81)) && subsetOf(v_M, v_O)))) break L92;
          let _g98 = 0;
          G99: {
            const _a100 = sp.adj4[v_b];
            for (let _i101 = 0; _i101 < _a100.length; _i101++) {
              const v_d = _a100[_i101];
              if (!(((b.grid[v_d] || -1) === 1))) continue;
              _g98++;
            }
          }
          const v_by = (need(b, sp, cl, v_c) - (_h84 - _g98));
          L102: {
            const v_R = minus(v_O, v_M);
            const _h103 = v_R.length;
            if (!(((v_by <= 0) || (v_by >= _h103)))) break L102;
            if (b.made[0] !== _m35_0) {
              _g104.length = 0;
              G105: {
                const _a108 = sp.adj4[v_c];
                for (let _i109 = 0; _i109 < _a108.length; _i109++) {
                  const v_d = _a108[_i109];
                  if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
                  _g104.push(v_d);
                }
              }
              if (!(sameSet(v_O, _g104))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g110: number[] = [];
              G111: {
                const _a114 = sp.adj4[v_c];
                for (let _i115 = 0; _i115 < _a114.length; _i115++) {
                  const v_d = _a114[_i115];
                  if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
                  _g110.push(v_d);
                }
              }
              const _g116: number[] = [];
              G117: {
                const _a120 = sp.adj4[v_b];
                for (let _i121 = 0; _i121 < _a120.length; _i121++) {
                  const v_d = _a120[_i121];
                  if (!((!((b.grid[v_d] !== 0)) && (clueAt(cl.count, v_d) === -1)))) continue;
                  _g116.push(v_d);
                }
              }
              let _g122 = 0;
              G123: {
                const _a124 = sp.adj4[v_c];
                for (let _i125 = 0; _i125 < _a124.length; _i125++) {
                  const v_d = _a124[_i125];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g122++;
                }
              }
              let _g126 = 0;
              G127: {
                const _a128 = sp.adj4[v_b];
                for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                  const v_d = _a128[_i129];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g126++;
                }
              }
              freshBinding("shared", [(v_c === cl.count.at[v_k]), sameSet(v_O, _g110), (v_O.length >= 2), (within(sp, v_c, 2).includes(v_b)), ((v_b !== v_c) && (clueAt(cl.count, v_b) !== -1)), sameSet(v_M, _g116), (((v_M.length > 0) && (v_M.length < v_O.length)) && subsetOf(v_M, v_O)), (v_by === ((clueAt(cl.count, v_c) - _g122) - (clueAt(cl.count, v_b) - _g126))), sameSet(v_R, minus(v_O, v_M)), ((v_by <= 0) || (v_by >= v_R.length))], ["c =", "O =", "where of O", "b in", "where of b", "M =", "where of M", "by =", "R =", "where of R"]);
            }
            facts.length = 0;
            changed = false;
            let _c135: boolean = ((v_by >= 0) && (v_by <= _h103));
            if (_c135) {
              let _c134: boolean = !((v_by === 0));
              if (!_c134) {
                let _q130 = true;
                Q131: {
                  const _a132 = v_R;
                  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                    const v_d = _a132[_i133];
                    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                    if (!(true)) {
                      _q130 = false;
                      break Q131;
                    }
                  }
                }
                _c134 = _q130;
              }
              _c135 = _c134;
            }
            let _c141: boolean = _c135;
            if (_c141) {
              let _c140: boolean = (v_by === 0);
              if (!_c140) {
                let _q136 = true;
                Q137: {
                  const _a138 = v_R;
                  for (let _i139 = 0; _i139 < _a138.length; _i139++) {
                    const v_d = _a138[_i139];
                    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                    if (!(true)) {
                      _q136 = false;
                      break Q137;
                    }
                  }
                }
                _c140 = _q136;
              }
              _c141 = _c140;
            }
            if (!(_c141)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ k: v_k, c: v_c, O: v_O.slice(), b: v_b, M: v_M.slice(), by: v_by, R: v_R.slice() }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

const needKept = keptStore<number>();

/** `need(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g94 = 0;
  G95: {
    const _a96 = sp.adj4[v_c];
    for (let _i97 = 0; _i97 < _a96.length; _i97++) {
      const v_d = _a96[_i97];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g94++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g94);
  _kept[v_c] = _made;
  return _made;
}
