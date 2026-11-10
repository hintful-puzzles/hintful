// Compiled by `npm run describe` from src/games/ascent/ascent.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, cellsValued, clueAt, cluesValued, freshBinding, keptStore, sameSet, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  wall: ClueList;
  arrow: ClueList;
  moves: number;
  top: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "onlySquare" | "nextTo" | "reach" | "deadEnd" | "overlap" | "onlyNumberNear" | "onlyNumber" | "onLine" | "overlapEdges";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "once";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "once" },
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
  { id: "onlySquare", tier: 0 },
  { id: "nextTo", tier: 0 },
  { id: "onLine", tier: 0, variation: "Edges" },
  { id: "reach", tier: 1 },
  { id: "deadEnd", tier: 1 },
  { id: "overlap", tier: 1, from: 3 },
  { id: "overlapEdges", tier: 1, variation: "Edges" },
  { id: "onlyNumberNear", tier: 2, until: 3 },
  { id: "onlyNumber", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard"];

/** Whether cell `v_c` may hold `v_d`: its domain, wider than a mask. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number, v_d: number): boolean {
  const _t1 = (cl.top + 1);
  if (v_d < 1 || v_d > _t1) return false;
  return (((v_d <= cl.top) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))) || ((v_d === (cl.top + 1)) && !(((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1)))));
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _k8 = nbrKept.board(cl);
  const _h44 = (sp.h - 1);
  const _h45 = (sp.w - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = (g[v_c] || -1);
      if (!((_h5 < cl.top))) continue;
      const _h12 = (_h5 + 1);
      let _q6 = false;
      Q7: {
        const _a9 = (_k8[v_c] ?? nbr(sp, cl, v_c));
        for (let _i10 = 0; _i10 < _a9.length; _i10++) {
          const v_p = _a9[_i10];
          const _h11 = (g[v_p] || -1);
          if ((_h11 === _h12)) {
            _q6 = true;
            break Q7;
          }
        }
      }
      if (!(_q6)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q13 = true;
  Q14: {
    const _a15 = sp.cells;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_c = _a15[_i16];
      const _h17 = (g[v_c] || -1);
      if (!((_h17 <= cl.top))) continue;
      let _g18 = 0;
      G19: {
        const _a20 = sp.cells;
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_x = _a20[_i21];
          const _h22 = (g[v_x] || -1);
          if (!((_h22 === _h17))) continue;
          _g18++;
        }
      }
      if (!((_g18 === 1))) {
        _q13 = false;
        break Q14;
      }
    }
  }
  if (!(_q13)) return false;
  let _g23 = 0;
  G24: {
    const _a25 = cluesValued(cl.wall, -1);
    for (let _i26 = 0; _i26 < _a25.length; _i26++) {
      const v_x = _a25[_i26];
      const _h27 = clueAt(cl.wall, v_x);
      const _h28 = clueAt(cl.arrow, v_x);
      if (!(((_h27 === -1) && (_h28 === -1)))) continue;
      _g23++;
    }
  }
  if (!((cl.top === _g23))) return false;
  for (let _k29 = 0; _k29 < cl.number.at.length; _k29++) {
    const _at30 = cl.number.at[_k29];
    const _v31 = cl.number.v[_k29];
    if (!(((g[_at30] || -1) === _v31))) return false;
  }
  for (let _k32 = 0; _k32 < cl.wall.at.length; _k32++) {
    const _at33 = cl.wall.at[_k32];
    if (!(((g[_at33] || -1) === (cl.top + 1)))) return false;
  }
  for (let _k35 = 0; _k35 < cl.arrow.at.length; _k35++) {
    const _at36 = cl.arrow.at[_k35];
    const _v37 = cl.arrow.v[_k35];
    let _c48: boolean = ((g[_at36] || -1) === (cl.top + 1));
    if (_c48) {
      let _q38 = false;
      Q39: {
        const _a40 = cluesValued(cl.wall, -1);
        for (let _i41 = 0; _i41 < _a40.length; _i41++) {
          const v_p = _a40[_i41];
          const _h42 = clueAt(cl.wall, v_p);
          const _h43 = clueAt(cl.arrow, v_p);
          let _c46: boolean = ((_h42 === -1) && (_h43 === -1));
          if (_c46) {
            _c46 = (((((((_at36 / sp.w) | 0) > 0) && (((_at36 / sp.w) | 0) < _h44)) && (((v_p / sp.w) | 0) === ((_at36 / sp.w) | 0))) || (((((((_at36 / sp.w) | 0) === 0) || (((_at36 / sp.w) | 0) === _h44)) && ((_at36 % sp.w) > 0)) && ((_at36 % sp.w) < _h45)) && ((v_p % sp.w) === (_at36 % sp.w)))) || ((((((_at36 / sp.w) | 0) === 0) || (((_at36 / sp.w) | 0) === _h44)) && (((_at36 % sp.w) === 0) || ((_at36 % sp.w) === _h45))) && (Math.abs(((v_p % sp.w) - (_at36 % sp.w))) === Math.abs((((v_p / sp.w) | 0) - ((_at36 / sp.w) | 0))))));
          }
          if (!(_c46)) continue;
          const _h47 = (g[v_p] || -1);
          if ((_h47 === _v37)) {
            _q38 = true;
            break Q39;
          }
        }
      }
      _c48 = _q38;
    }
    if (!(_c48)) return false;
  }
  return true;
}

export interface OnceBinding {
  c: number;
  p: number;
}

const onceFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function once(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<OnceBinding> | null): number {
  const facts = onceFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (b.grid[v_c] !== 0);
  const _h6 = clueAt(cl.wall, v_c);
  const _h7 = clueAt(cl.arrow, v_c);
  const _h11 = (b.grid[v_c] || -1);
  if (!((_h5 && ((_h6 === -1) && (_h7 === -1))))) return 0;
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_p = _a8[_i9];
    const _h10 = (b.grid[v_p] !== 0);
    if (!(((v_p !== v_c) && !(_h10)))) continue;
    if (DEV && staleChecking) {
      freshBinding("once", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))), (sp.cells.includes(v_p)), ((v_p !== v_c) && !((b.grid[v_p] !== 0)))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if (b.has(v_p, _h11)) { if (fire === null) { b.strikeAt(v_p, _h11); changed = true; } else facts.push(STRIKE, v_p, _h11); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface OnlySquareBinding {
  n: number;
  S: readonly number[];
}

const onlySquareFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlySquare(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlySquareBinding> | null): number {
  const _g18: number[] = [];
  const facts = onlySquareFacts;
  let fired = 0;
  let changed = false;
  const _t13 = cl.top;
  for (let v_n = 1; v_n <= _t13; v_n++) {
    let _g14 = 0;
    G15: {
      const _a16 = cellsValued(b, sp.cells, v_n);
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_x = _a16[_i17];
        if (!(((b.grid[v_x] || -1) === v_n))) continue;
        _g14++;
      }
    }
    if (!(!((_g14 > 0)))) continue;
    _g18.length = 0;
    G19: {
      const _a22 = sp.cells;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_c = _a22[_i23];
        if (!((!((b.grid[v_c] !== 0)) && b.has(v_c, v_n)))) continue;
        _g18.push(v_c);
      }
    }
    L24: {
      const v_S = _g18;
      const _h25 = v_S.length;
      if (!((_h25 < 2))) break L24;
      if (DEV && staleChecking) {
        let _g26 = 0;
        G27: {
          const _a28 = cellsValued(b, sp.cells, v_n);
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_x = _a28[_i29];
            if (!(((b.grid[v_x] || -1) === v_n))) continue;
            _g26++;
          }
        }
        const _g30: number[] = [];
        G31: {
          const _a34 = sp.cells;
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_c = _a34[_i35];
            if (!((!((b.grid[v_c] !== 0)) && b.has(v_c, v_n)))) continue;
            _g30.push(v_c);
          }
        }
        freshBinding("onlySquare", [((1 <= v_n) && (v_n <= cl.top)), !((_g26 > 0)), sameSet(v_S, _g30), (v_S.length < 2)], ["n in", "where of n", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _c37: boolean = (_h25 === 1);
      if (_c37) {
        const _t36 = (v_S.length > 0 ? v_S[0] : -1);
        if (!(b.grid[_t36] !== 0)) { if (fire === null) { b.placeAt(_t36, v_n); changed = true; } else facts.push(PLACE, _t36, v_n); }
        _c37 = true;
      }
      if (!(_c37)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ n: v_n, S: v_S.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NextToBinding {
  c: number;
  m: number;
}

const nextToFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function nextTo(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NextToBinding> | null): number {
  const facts = nextToFacts;
  let fired = 0;
  let changed = false;
  const _h35 = (cl.moves === 0);
  const _h36 = (cl.moves === 1);
  const _a11 = sp.cells;
  R1:
  for (let _i12 = 0; _i12 < _a11.length; _i12++) {
    const v_c = _a11[_i12];
    const _m39_0 = b.made[0];
    const _h13 = (b.grid[v_c] !== 0);
    const _h14 = clueAt(cl.wall, v_c);
    const _h15 = clueAt(cl.arrow, v_c);
    if (!((_h13 && ((_h14 === -1) && (_h15 === -1))))) continue;
    const _h16 = (b.grid[v_c] || -1);
    const _h37 = (v_c % sp.w);
    const _h38 = ((v_c / sp.w) | 0);
    const _t17 = (_h16 - 1);
    const _t18 = (_h16 + 1);
    R2:
    for (let _i19 = 0; _i19 < 2; _i19++) {
      const v_m = _i19 === 0 ? _t17 : _t18;
      if (_i19 === 1 && (v_m === _t17)) continue;
      let _c25: boolean = ((v_m >= 1) && (v_m <= cl.top));
      if (_c25) {
        let _g20 = 0;
        G21: {
          const _a22 = cellsValued(b, sp.cells, v_m);
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_x = _a22[_i23];
            const _h24 = (b.grid[v_x] || -1);
            if (!((_h24 === v_m))) continue;
            _g20++;
          }
        }
        _c25 = !((_g20 > 0));
      }
      if (!(_c25)) continue;
      if (b.made[0] !== _m39_0) {
        if (!(((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))))) { continue R1; }
        if (!(((v_m === ((b.grid[v_c] || -1) - 1)) || (v_m === ((b.grid[v_c] || -1) + 1))))) { continue R2; }
      }
      if (DEV && staleChecking) {
        let _c30: boolean = ((v_m >= 1) && (v_m <= cl.top));
        if (_c30) {
          let _g26 = 0;
          G27: {
            const _a28 = cellsValued(b, sp.cells, v_m);
            for (let _i29 = 0; _i29 < _a28.length; _i29++) {
              const v_x = _a28[_i29];
              if (!(((b.grid[v_x] || -1) === v_m))) continue;
              _g26++;
            }
          }
          _c30 = !((_g26 > 0));
        }
        freshBinding("nextTo", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))), ((v_m === ((b.grid[v_c] || -1) - 1)) || (v_m === ((b.grid[v_c] || -1) + 1))), _c30], ["c in", "where of c", "m in", "where of m"]);
      }
      facts.length = 0;
      changed = false;
      let _q31 = true;
      Q32: {
        const _a33 = sp.cells;
        for (let _i34 = 0; _i34 < _a33.length; _i34++) {
          const v_p = _a33[_i34];
          if (!((b.has(v_p, v_m) && !((((_h35 || (_h36 && ((((v_p % sp.w) - _h37) * (((v_p / sp.w) | 0) - _h38)) > 0))) && ((Math.abs(((v_p % sp.w) - _h37)) + Math.abs((((v_p / sp.w) | 0) - _h38))) <= 1)) || ((!((_h35 || (_h36 && ((((v_p % sp.w) - _h37) * (((v_p / sp.w) | 0) - _h38)) > 0)))) && (Math.abs(((v_p % sp.w) - _h37)) <= 1)) && (Math.abs((((v_p / sp.w) | 0) - _h38)) <= 1))))))) continue;
          if (b.has(v_p, v_m)) { if (fire === null) { b.strikeAt(v_p, v_m); changed = true; } else facts.push(STRIKE, v_p, v_m); }
          if (!(true)) {
            _q31 = false;
            break Q32;
          }
        }
      }
      if (!(_q31)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, m: v_m }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ReachBinding {
  c: number;
  n: number;
  m: number;
}

const reachFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding> | null): number {
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  const _h19 = (cl.moves === 0);
  const _h20 = (cl.moves === 1);
  const _a5 = sp.cells;
  R1:
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_c = _a5[_i6];
    const _m23_0 = b.made[0];
    const _h7 = (b.grid[v_c] !== 0);
    const _h8 = clueAt(cl.wall, v_c);
    const _h9 = clueAt(cl.arrow, v_c);
    if (!((_h7 && ((_h8 === -1) && (_h9 === -1))))) continue;
    const _h10 = (b.grid[v_c] || -1);
    const _h21 = (v_c % sp.w);
    const _h22 = ((v_c / sp.w) | 0);
    const v_n = _h10;
    const _m24_1 = b.made[1];
    const _t11 = ((v_n - gapBelow(b, sp, v_n)) + 1);
    const _t12 = ((v_n + gapAbove(b, sp, cl, v_n)) - 1);
    R2:
    for (let v_m = _t11; v_m <= _t12; v_m++) {
      if (!((v_m !== v_n))) continue;
      const _h17 = (v_m - v_n);
      const _h18 = Math.abs(_h17);
      if (b.made[0] !== _m23_0 || b.made[1] !== _m24_1) {
        if (!(((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))))) { continue R1; }
        if (!((v_n === (b.grid[v_c] || -1)))) { continue R1; }
        if (!(((((v_n - gapBelow(b, sp, v_n)) + 1) <= v_m) && (v_m <= ((v_n + gapAbove(b, sp, cl, v_n)) - 1))))) { continue R2; }
      }
      if (DEV && staleChecking) {
        freshBinding("reach", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))), (v_n === (b.grid[v_c] || -1)), ((((v_n - gapBelow(b, sp, v_n)) + 1) <= v_m) && (v_m <= ((v_n + gapAbove(b, sp, cl, v_n)) - 1))), (v_m !== v_n)], ["c in", "where of c", "n =", "m in", "where of m"]);
      }
      facts.length = 0;
      changed = false;
      let _q13 = true;
      Q14: {
        const _a15 = sp.cells;
        for (let _i16 = 0; _i16 < _a15.length; _i16++) {
          const v_p = _a15[_i16];
          if (!((b.has(v_p, v_m) && !((((_h19 || (_h20 && ((((v_p % sp.w) - _h21) * (((v_p / sp.w) | 0) - _h22)) > 0))) && ((Math.abs(((v_p % sp.w) - _h21)) + Math.abs((((v_p / sp.w) | 0) - _h22))) <= _h18)) || ((!((_h19 || (_h20 && ((((v_p % sp.w) - _h21) * (((v_p / sp.w) | 0) - _h22)) > 0)))) && (Math.abs(((v_p % sp.w) - _h21)) <= _h18)) && (Math.abs((((v_p / sp.w) | 0) - _h22)) <= _h18))))))) continue;
          if (b.has(v_p, v_m)) { if (fire === null) { b.strikeAt(v_p, v_m); changed = true; } else facts.push(STRIKE, v_p, v_m); }
          if (!(true)) {
            _q13 = false;
            break Q14;
          }
        }
      }
      if (!(_q13)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n, m: v_m }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DeadEndBinding {
  c: number;
  n: number;
}

const deadEndFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function deadEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DeadEndBinding> | null): number {
  const facts = deadEndFacts;
  let fired = 0;
  let changed = false;
  const _k45 = nbrKept.board(cl);
  const _a39 = sp.cells;
  R1:
  for (let _i40 = 0; _i40 < _a39.length; _i40++) {
    const v_c = _a39[_i40];
    const _m136_0 = b.made[0];
    const _m137_1 = b.made[1];
    const _h41 = clueAt(cl.wall, v_c);
    const _h42 = clueAt(cl.arrow, v_c);
    let _c65: boolean = (!((b.grid[v_c] !== 0)) && ((_h41 === -1) && (_h42 === -1)));
    if (_c65) {
      let _g43 = 0;
      G44: {
        const _a46 = (_k45[v_c] ?? nbr(sp, cl, v_c));
        for (let _i47 = 0; _i47 < _a46.length; _i47++) {
          const v_p = _a46[_i47];
          const _h48 = clueAt(cl.wall, v_p);
          const _h49 = clueAt(cl.arrow, v_p);
          let _c64: boolean = ((_h48 === -1) && (_h49 === -1));
          if (_c64) {
            let _c56: boolean = !((b.grid[v_p] !== 0));
            if (!_c56) {
              let _c55: boolean = ((b.grid[v_p] || -1) > 1);
              if (_c55) {
                const _t50 = ((b.grid[v_p] || -1) - 1);
                let _g51 = 0;
                G52: {
                  const _a53 = cellsValued(b, sp.cells, _t50);
                  for (let _i54 = 0; _i54 < _a53.length; _i54++) {
                    const v_x = _a53[_i54];
                    if (!(((b.grid[v_x] || -1) === _t50))) continue;
                    _g51++;
                  }
                }
                _c55 = !((_g51 > 0));
              }
              _c56 = _c55;
            }
            let _c63: boolean = _c56;
            if (!_c63) {
              let _c62: boolean = ((b.grid[v_p] || -1) < cl.top);
              if (_c62) {
                const _t57 = ((b.grid[v_p] || -1) + 1);
                let _g58 = 0;
                G59: {
                  const _a60 = cellsValued(b, sp.cells, _t57);
                  for (let _i61 = 0; _i61 < _a60.length; _i61++) {
                    const v_x = _a60[_i61];
                    if (!(((b.grid[v_x] || -1) === _t57))) continue;
                    _g58++;
                  }
                }
                _c62 = !((_g58 > 0));
              }
              _c63 = _c62;
            }
            _c64 = _c63;
          }
          if (!(_c64)) continue;
          _g43++;
        }
      }
      _c65 = (_g43 === 1);
    }
    if (!(_c65)) continue;
    const _t66 = cl.top;
    for (let _i67 = 0; _i67 < 2; _i67++) {
      const v_n = _i67 === 0 ? 1 : _t66;
      if (_i67 === 1 && (v_n === 1)) continue;
      let _g68 = 0;
      G69: {
        const _a70 = cellsValued(b, sp.cells, v_n);
        for (let _i71 = 0; _i71 < _a70.length; _i71++) {
          const v_x = _a70[_i71];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g68++;
        }
      }
      let _c81: boolean = (!((_g68 > 0)) && b.has(v_c, v_n));
      if (_c81) {
        let _q72 = false;
        Q73: {
          const _t74 = cl.top;
          for (let _i75 = 0; _i75 < 2; _i75++) {
            const v_e = _i75 === 0 ? 1 : _t74;
            if (_i75 === 1 && (v_e === 1)) continue;
            let _c80: boolean = (v_e !== v_n);
            if (_c80) {
              let _g76 = 0;
              G77: {
                const _a78 = cellsValued(b, sp.cells, v_e);
                for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                  const v_x = _a78[_i79];
                  if (!(((b.grid[v_x] || -1) === v_e))) continue;
                  _g76++;
                }
              }
              _c80 = !((_g76 > 0));
            }
            if (!(_c80)) continue;
            if (b.has(v_c, v_e)) {
              _q72 = true;
              break Q73;
            }
          }
        }
        _c81 = !(_q72);
      }
      if (!(_c81)) continue;
      if (b.made[0] !== _m136_0 || b.made[1] !== _m137_1) {
        let _c101: boolean = (!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1)));
        if (_c101) {
          let _g82 = 0;
          G83: {
            const _a84 = nbr(sp, cl, v_c);
            for (let _i85 = 0; _i85 < _a84.length; _i85++) {
              const v_p = _a84[_i85];
              let _c100: boolean = ((clueAt(cl.wall, v_p) === -1) && (clueAt(cl.arrow, v_p) === -1));
              if (_c100) {
                let _c92: boolean = !((b.grid[v_p] !== 0));
                if (!_c92) {
                  let _c91: boolean = ((b.grid[v_p] || -1) > 1);
                  if (_c91) {
                    const _t86 = ((b.grid[v_p] || -1) - 1);
                    let _g87 = 0;
                    G88: {
                      const _a89 = cellsValued(b, sp.cells, _t86);
                      for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                        const v_x = _a89[_i90];
                        if (!(((b.grid[v_x] || -1) === _t86))) continue;
                        _g87++;
                      }
                    }
                    _c91 = !((_g87 > 0));
                  }
                  _c92 = _c91;
                }
                let _c99: boolean = _c92;
                if (!_c99) {
                  let _c98: boolean = ((b.grid[v_p] || -1) < cl.top);
                  if (_c98) {
                    const _t93 = ((b.grid[v_p] || -1) + 1);
                    let _g94 = 0;
                    G95: {
                      const _a96 = cellsValued(b, sp.cells, _t93);
                      for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                        const v_x = _a96[_i97];
                        if (!(((b.grid[v_x] || -1) === _t93))) continue;
                        _g94++;
                      }
                    }
                    _c98 = !((_g94 > 0));
                  }
                  _c99 = _c98;
                }
                _c100 = _c99;
              }
              if (!(_c100)) continue;
              _g82++;
            }
          }
          _c101 = (_g82 === 1);
        }
        if (!(_c101)) { continue R1; }
      }
      if (DEV && staleChecking) {
        let _c121: boolean = (!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1)));
        if (_c121) {
          let _g102 = 0;
          G103: {
            const _a104 = nbr(sp, cl, v_c);
            for (let _i105 = 0; _i105 < _a104.length; _i105++) {
              const v_p = _a104[_i105];
              let _c120: boolean = ((clueAt(cl.wall, v_p) === -1) && (clueAt(cl.arrow, v_p) === -1));
              if (_c120) {
                let _c112: boolean = !((b.grid[v_p] !== 0));
                if (!_c112) {
                  let _c111: boolean = ((b.grid[v_p] || -1) > 1);
                  if (_c111) {
                    const _t106 = ((b.grid[v_p] || -1) - 1);
                    let _g107 = 0;
                    G108: {
                      const _a109 = cellsValued(b, sp.cells, _t106);
                      for (let _i110 = 0; _i110 < _a109.length; _i110++) {
                        const v_x = _a109[_i110];
                        if (!(((b.grid[v_x] || -1) === _t106))) continue;
                        _g107++;
                      }
                    }
                    _c111 = !((_g107 > 0));
                  }
                  _c112 = _c111;
                }
                let _c119: boolean = _c112;
                if (!_c119) {
                  let _c118: boolean = ((b.grid[v_p] || -1) < cl.top);
                  if (_c118) {
                    const _t113 = ((b.grid[v_p] || -1) + 1);
                    let _g114 = 0;
                    G115: {
                      const _a116 = cellsValued(b, sp.cells, _t113);
                      for (let _i117 = 0; _i117 < _a116.length; _i117++) {
                        const v_x = _a116[_i117];
                        if (!(((b.grid[v_x] || -1) === _t113))) continue;
                        _g114++;
                      }
                    }
                    _c118 = !((_g114 > 0));
                  }
                  _c119 = _c118;
                }
                _c120 = _c119;
              }
              if (!(_c120)) continue;
              _g102++;
            }
          }
          _c121 = (_g102 === 1);
        }
        let _g122 = 0;
        G123: {
          const _a124 = cellsValued(b, sp.cells, v_n);
          for (let _i125 = 0; _i125 < _a124.length; _i125++) {
            const v_x = _a124[_i125];
            if (!(((b.grid[v_x] || -1) === v_n))) continue;
            _g122++;
          }
        }
        let _c135: boolean = (!((_g122 > 0)) && b.has(v_c, v_n));
        if (_c135) {
          let _q126 = false;
          Q127: {
            const _t128 = cl.top;
            for (let _i129 = 0; _i129 < 2; _i129++) {
              const v_e = _i129 === 0 ? 1 : _t128;
              if (_i129 === 1 && (v_e === 1)) continue;
              let _c134: boolean = (v_e !== v_n);
              if (_c134) {
                let _g130 = 0;
                G131: {
                  const _a132 = cellsValued(b, sp.cells, v_e);
                  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                    const v_x = _a132[_i133];
                    if (!(((b.grid[v_x] || -1) === v_e))) continue;
                    _g130++;
                  }
                }
                _c134 = !((_g130 > 0));
              }
              if (!(_c134)) continue;
              if (b.has(v_c, v_e)) {
                _q126 = true;
                break Q127;
              }
            }
          }
          _c135 = !(_q126);
        }
        freshBinding("deadEnd", [(sp.cells.includes(v_c)), _c121, ((v_n === 1) || (v_n === cl.top)), _c135], ["c in", "where of c", "n in", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_n); changed = true; } else facts.push(PLACE, v_c, v_n); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface OverlapBinding {
  n: number;
}

const overlapFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function overlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverlapBinding> | null): number {
  const facts = overlapFacts;
  let fired = 0;
  let changed = false;
  const _k23 = nbrKept.board(cl);
  const _t6 = cl.top;
  for (let v_n = 1; v_n <= _t6; v_n++) {
    let _g7 = 0;
    G8: {
      const _a9 = cellsValued(b, sp.cells, v_n);
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_x = _a9[_i10];
        const _h11 = (b.grid[v_x] || -1);
        if (!((_h11 === v_n))) continue;
        _g7++;
      }
    }
    if (!(!((_g7 > 0)))) continue;
    const _h20 = (v_n > 1);
    const _h26 = (v_n - 1);
    const _h28 = (v_n < cl.top);
    const _h33 = (v_n + 1);
    if (DEV && staleChecking) {
      let _g12 = 0;
      G13: {
        const _a14 = cellsValued(b, sp.cells, v_n);
        for (let _i15 = 0; _i15 < _a14.length; _i15++) {
          const v_x = _a14[_i15];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g12++;
        }
      }
      freshBinding("overlap", [((1 <= v_n) && (v_n <= cl.top)), !((_g12 > 0))], ["n in", "where of n"]);
    }
    facts.length = 0;
    changed = false;
    let _q16 = true;
    Q17: {
      const _a18 = sp.cells;
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_c = _a18[_i19];
        let _c36: boolean = b.has(v_c, v_n);
        if (_c36) {
          let _c27: boolean = _h20;
          if (_c27) {
            let _q21 = false;
            Q22: {
              const _a24 = (_k23[v_c] ?? nbr(sp, cl, v_c));
              for (let _i25 = 0; _i25 < _a24.length; _i25++) {
                const v_p = _a24[_i25];
                if (b.has(v_p, _h26)) {
                  _q21 = true;
                  break Q22;
                }
              }
            }
            _c27 = !(_q21);
          }
          let _c35: boolean = _c27;
          if (!_c35) {
            let _c34: boolean = _h28;
            if (_c34) {
              let _q29 = false;
              Q30: {
                const _a31 = (_k23[v_c] ?? nbr(sp, cl, v_c));
                for (let _i32 = 0; _i32 < _a31.length; _i32++) {
                  const v_p = _a31[_i32];
                  if (b.has(v_p, _h33)) {
                    _q29 = true;
                    break Q30;
                  }
                }
              }
              _c34 = !(_q29);
            }
            _c35 = _c34;
          }
          _c36 = _c35;
        }
        if (!(_c36)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q16 = false;
          break Q17;
        }
      }
    }
    if (!(_q16)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ n: v_n }, facts)) return 1;
    }
  }
  return fired;
}

export interface OnlyNumberNearBinding {
  c: number;
  n: number;
}

const onlyNumberNearFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyNumberNear(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyNumberNearBinding> | null): number {
  const facts = onlyNumberNearFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.cells;
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_c = _a17[_i18];
    const _h19 = clueAt(cl.wall, v_c);
    const _h20 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h19 === -1) && (_h20 === -1))) && (b.candCount(v_c) === 1)))) continue;
    L21: {
      const v_n = b.candFirst(v_c);
      let _c27: boolean = (v_n > 1);
      if (_c27) {
        const _t22 = (v_n - 1);
        let _g23 = 0;
        G24: {
          const _a25 = cellsValued(b, sp.cells, _t22);
          for (let _i26 = 0; _i26 < _a25.length; _i26++) {
            const v_x = _a25[_i26];
            if (!(((b.grid[v_x] || -1) === _t22))) continue;
            _g23++;
          }
        }
        _c27 = (_g23 > 0);
      }
      let _c34: boolean = _c27;
      if (!_c34) {
        let _c33: boolean = (v_n < cl.top);
        if (_c33) {
          const _t28 = (v_n + 1);
          let _g29 = 0;
          G30: {
            const _a31 = cellsValued(b, sp.cells, _t28);
            for (let _i32 = 0; _i32 < _a31.length; _i32++) {
              const v_x = _a31[_i32];
              if (!(((b.grid[v_x] || -1) === _t28))) continue;
              _g29++;
            }
          }
          _c33 = (_g29 > 0);
        }
        _c34 = _c33;
      }
      if (!(_c34)) break L21;
      if (DEV && staleChecking) {
        let _c40: boolean = (v_n > 1);
        if (_c40) {
          const _t35 = (v_n - 1);
          let _g36 = 0;
          G37: {
            const _a38 = cellsValued(b, sp.cells, _t35);
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_x = _a38[_i39];
              if (!(((b.grid[v_x] || -1) === _t35))) continue;
              _g36++;
            }
          }
          _c40 = (_g36 > 0);
        }
        let _c47: boolean = _c40;
        if (!_c47) {
          let _c46: boolean = (v_n < cl.top);
          if (_c46) {
            const _t41 = (v_n + 1);
            let _g42 = 0;
            G43: {
              const _a44 = cellsValued(b, sp.cells, _t41);
              for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                const v_x = _a44[_i45];
                if (!(((b.grid[v_x] || -1) === _t41))) continue;
                _g42++;
              }
            }
            _c46 = (_g42 > 0);
          }
          _c47 = _c46;
        }
        freshBinding("onlyNumberNear", [(sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))) && (b.candCount(v_c) === 1)), (v_n === b.candFirst(v_c)), _c47], ["c in", "where of c", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_n); changed = true; } else facts.push(PLACE, v_c, v_n); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface OnlyNumberBinding {
  c: number;
}

const onlyNumberFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyNumber(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyNumberBinding> | null): number {
  const facts = onlyNumberFacts;
  let fired = 0;
  let changed = false;
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    const _h5 = clueAt(cl.wall, v_c);
    const _h6 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h5 === -1) && (_h6 === -1))) && (b.candCount(v_c) < 2)))) continue;
    if (DEV && staleChecking) {
      freshBinding("onlyNumber", [(sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))) && (b.candCount(v_c) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c8: boolean = (b.candCount(v_c) === 1);
    if (_c8) {
      const _t7 = b.candFirst(v_c);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t7); changed = true; } else facts.push(PLACE, v_c, _t7); }
      _c8 = true;
    }
    if (!(_c8)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface OnLineBinding {
  a: number;
  n: number;
}

const onLineFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function onLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnLineBinding> | null): number {
  const facts = onLineFacts;
  let fired = 0;
  let changed = false;
  const _h14 = (sp.h - 1);
  const _h23 = (sp.w - 1);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_a = _a4[_i5];
    const _h6 = clueAt(cl.arrow, v_a);
    const _h12 = ((v_a / sp.w) | 0);
    const _h13 = (_h12 > 0);
    const _h15 = (_h12 < _h14);
    const _h16 = (_h13 && _h15);
    const _h17 = (_h12 === 0);
    const _h18 = (_h12 === _h14);
    const _h19 = (_h17 || _h18);
    const _h20 = (v_a % sp.w);
    const _h21 = (_h20 > 0);
    const _h22 = (_h19 && _h21);
    const _h24 = (_h20 < _h23);
    const _h25 = (_h22 && _h24);
    const _h26 = (_h20 === 0);
    const _h27 = (_h20 === _h23);
    const _h28 = (_h26 || _h27);
    const _h29 = (_h19 && _h28);
    L7: {
      const v_n = _h6;
      if (!((v_n !== -1))) break L7;
      if (DEV && staleChecking) {
        freshBinding("onLine", [(sp.cells.includes(v_a)), (v_n === clueAt(cl.arrow, v_a)), (v_n !== -1)], ["a in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _q8 = true;
      Q9: {
        const _a10 = sp.cells;
        for (let _i11 = 0; _i11 < _a10.length; _i11++) {
          const v_p = _a10[_i11];
          if (!((b.has(v_p, v_n) && !((((_h16 && (((v_p / sp.w) | 0) === _h12)) || (_h25 && ((v_p % sp.w) === _h20))) || (_h29 && (Math.abs(((v_p % sp.w) - _h20)) === Math.abs((((v_p / sp.w) | 0) - _h12))))))))) continue;
          if (b.has(v_p, v_n)) { if (fire === null) { b.strikeAt(v_p, v_n); changed = true; } else facts.push(STRIKE, v_p, v_n); }
          if (!(true)) {
            _q8 = false;
            break Q9;
          }
        }
      }
      if (!(_q8)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ a: v_a, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface OverlapEdgesBinding {
  n: number;
}

const overlapEdgesFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function overlapEdges(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverlapEdgesBinding> | null): number {
  const facts = overlapEdgesFacts;
  let fired = 0;
  let changed = false;
  const _k23 = nbrKept.board(cl);
  const _t6 = cl.top;
  for (let v_n = 1; v_n <= _t6; v_n++) {
    let _g7 = 0;
    G8: {
      const _a9 = cellsValued(b, sp.cells, v_n);
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_x = _a9[_i10];
        const _h11 = (b.grid[v_x] || -1);
        if (!((_h11 === v_n))) continue;
        _g7++;
      }
    }
    if (!(!((_g7 > 0)))) continue;
    const _h20 = (v_n > 1);
    const _h26 = (v_n - 1);
    const _h28 = (v_n < cl.top);
    const _h33 = (v_n + 1);
    if (DEV && staleChecking) {
      let _g12 = 0;
      G13: {
        const _a14 = cellsValued(b, sp.cells, v_n);
        for (let _i15 = 0; _i15 < _a14.length; _i15++) {
          const v_x = _a14[_i15];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g12++;
        }
      }
      freshBinding("overlapEdges", [((1 <= v_n) && (v_n <= cl.top)), !((_g12 > 0))], ["n in", "where of n"]);
    }
    facts.length = 0;
    changed = false;
    let _q16 = true;
    Q17: {
      const _a18 = sp.cells;
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_c = _a18[_i19];
        let _c36: boolean = b.has(v_c, v_n);
        if (_c36) {
          let _c27: boolean = _h20;
          if (_c27) {
            let _q21 = false;
            Q22: {
              const _a24 = (_k23[v_c] ?? nbr(sp, cl, v_c));
              for (let _i25 = 0; _i25 < _a24.length; _i25++) {
                const v_p = _a24[_i25];
                if (b.has(v_p, _h26)) {
                  _q21 = true;
                  break Q22;
                }
              }
            }
            _c27 = !(_q21);
          }
          let _c35: boolean = _c27;
          if (!_c35) {
            let _c34: boolean = _h28;
            if (_c34) {
              let _q29 = false;
              Q30: {
                const _a31 = (_k23[v_c] ?? nbr(sp, cl, v_c));
                for (let _i32 = 0; _i32 < _a31.length; _i32++) {
                  const v_p = _a31[_i32];
                  if (b.has(v_p, _h33)) {
                    _q29 = true;
                    break Q30;
                  }
                }
              }
              _c34 = !(_q29);
            }
            _c35 = _c34;
          }
          _c36 = _c35;
        }
        if (!(_c36)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q16 = false;
          break Q17;
        }
      }
    }
    if (!(_q16)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ n: v_n }, facts)) return 1;
    }
  }
  return fired;
}

const gapBelowKept = keptStore<number>();

/** `gapBelow(n)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function gapBelow(b: Marks, sp: GridSpace, v_n: number): number {
  const _kept: Kept<number> = gapBelowKept.marks(b);
  if (_kept[v_n] !== undefined) return _kept[v_n];
  let _g1 = -1;
  G2: {
    for (let v_j = 1; v_j <= v_n; v_j++) {
      let _c8: boolean = (v_j === v_n);
      if (!_c8) {
        const _t3 = (v_n - v_j);
        let _g4 = 0;
        G5: {
          const _a6 = cellsValued(b, sp.cells, _t3);
          for (let _i7 = 0; _i7 < _a6.length; _i7++) {
            const v_x = _a6[_i7];
            if (!(((b.grid[v_x] || -1) === _t3))) continue;
            _g4++;
          }
        }
        _c8 = (_g4 > 0);
      }
      if (!(_c8)) continue;
      _g1 = v_j;
      break G2;
    }
  }
  const _made = _g1;
  _kept[v_n] = _made;
  return _made;
}

const gapAboveKept = keptStore<number>();

/** `gapAbove(n)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function gapAbove(b: Marks, sp: GridSpace, cl: Dealt, v_n: number): number {
  const _kept: Kept<number> = gapAboveKept.marks(b);
  if (_kept[v_n] !== undefined) return _kept[v_n];
  let _g1 = -1;
  G2: {
    const _t3 = ((cl.top + 1) - v_n);
    for (let v_j = 1; v_j <= _t3; v_j++) {
      let _c9: boolean = (v_j === ((cl.top + 1) - v_n));
      if (!_c9) {
        const _t4 = (v_n + v_j);
        let _g5 = 0;
        G6: {
          const _a7 = cellsValued(b, sp.cells, _t4);
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_x = _a7[_i8];
            if (!(((b.grid[v_x] || -1) === _t4))) continue;
            _g5++;
          }
        }
        _c9 = (_g5 > 0);
      }
      if (!(_c9)) continue;
      _g1 = v_j;
      break G2;
    }
  }
  const _made = _g1;
  _kept[v_n] = _made;
  return _made;
}

const nbrKept = keptStore<readonly number[]>();
let nbrOn: object | null = null;
let nbrAt: Kept<readonly number[]> = [];

/** `nbr(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function nbr(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== nbrOn) {
    nbrAt = nbrKept.board(cl);
    nbrOn = cl;
  }
  const _kept: Kept<readonly number[]> = nbrAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.adj8[v_c];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_p = _a5[_i6];
      if (!((((cl.moves === 2) || ((cl.moves === 0) && (sp.adj4[v_c].includes(v_p)))) || ((cl.moves === 1) && (((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))))) continue;
      _g1.push(v_p);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}
