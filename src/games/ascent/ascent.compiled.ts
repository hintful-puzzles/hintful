// Compiled by `npm run describe` from src/games/ascent/ascent.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, cellsValued, clueAt, cluesValued, freshBinding, keptStore, sameSet, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

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
  const _k431 = nbrKept.board(cl);
  const _h467 = (sp.h - 1);
  const _h468 = (sp.w - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;
  }
  let _q424 = true;
  Q425: {
    const _a426 = sp.cells;
    for (let _i427 = 0; _i427 < _a426.length; _i427++) {
      const v_c = _a426[_i427];
      const _h428 = (g[v_c] || -1);
      if (!((_h428 < cl.top))) continue;
      const _h435 = (_h428 + 1);
      let _q429 = false;
      Q430: {
        const _a432 = (_k431[v_c] ?? nbr(sp, cl, v_c));
        for (let _i433 = 0; _i433 < _a432.length; _i433++) {
          const v_p = _a432[_i433];
          const _h434 = (g[v_p] || -1);
          if ((_h434 === _h435)) {
            _q429 = true;
            break Q430;
          }
        }
      }
      if (!(_q429)) {
        _q424 = false;
        break Q425;
      }
    }
  }
  if (!(_q424)) return false;
  let _q436 = true;
  Q437: {
    const _a438 = sp.cells;
    for (let _i439 = 0; _i439 < _a438.length; _i439++) {
      const v_c = _a438[_i439];
      const _h440 = (g[v_c] || -1);
      if (!((_h440 <= cl.top))) continue;
      let _g441 = 0;
      G442: {
        const _a443 = sp.cells;
        for (let _i444 = 0; _i444 < _a443.length; _i444++) {
          const v_x = _a443[_i444];
          const _h445 = (g[v_x] || -1);
          if (!((_h445 === _h440))) continue;
          _g441++;
        }
      }
      if (!((_g441 === 1))) {
        _q436 = false;
        break Q437;
      }
    }
  }
  if (!(_q436)) return false;
  let _g446 = 0;
  G447: {
    const _a448 = cluesValued(cl.wall, -1);
    for (let _i449 = 0; _i449 < _a448.length; _i449++) {
      const v_x = _a448[_i449];
      const _h450 = clueAt(cl.wall, v_x);
      const _h451 = clueAt(cl.arrow, v_x);
      if (!(((_h450 === -1) && (_h451 === -1)))) continue;
      _g446++;
    }
  }
  if (!((cl.top === _g446))) return false;
  for (let _k452 = 0; _k452 < cl.number.at.length; _k452++) {
    const _at453 = cl.number.at[_k452];
    const _v454 = cl.number.v[_k452];
    if (!(((g[_at453] || -1) === _v454))) return false;
  }
  for (let _k455 = 0; _k455 < cl.wall.at.length; _k455++) {
    const _at456 = cl.wall.at[_k455];
    if (!(((g[_at456] || -1) === (cl.top + 1)))) return false;
  }
  for (let _k458 = 0; _k458 < cl.arrow.at.length; _k458++) {
    const _at459 = cl.arrow.at[_k458];
    const _v460 = cl.arrow.v[_k458];
    let _c471: boolean = ((g[_at459] || -1) === (cl.top + 1));
    if (_c471) {
      let _q461 = false;
      Q462: {
        const _a463 = cluesValued(cl.wall, -1);
        for (let _i464 = 0; _i464 < _a463.length; _i464++) {
          const v_p = _a463[_i464];
          const _h465 = clueAt(cl.wall, v_p);
          const _h466 = clueAt(cl.arrow, v_p);
          let _c469: boolean = ((_h465 === -1) && (_h466 === -1));
          if (_c469) {
            _c469 = (((((((_at459 / sp.w) | 0) > 0) && (((_at459 / sp.w) | 0) < _h467)) && (((v_p / sp.w) | 0) === ((_at459 / sp.w) | 0))) || (((((((_at459 / sp.w) | 0) === 0) || (((_at459 / sp.w) | 0) === _h467)) && ((_at459 % sp.w) > 0)) && ((_at459 % sp.w) < _h468)) && ((v_p % sp.w) === (_at459 % sp.w)))) || ((((((_at459 / sp.w) | 0) === 0) || (((_at459 / sp.w) | 0) === _h467)) && (((_at459 % sp.w) === 0) || ((_at459 % sp.w) === _h468))) && (Math.abs(((v_p % sp.w) - (_at459 % sp.w))) === Math.abs((((v_p / sp.w) | 0) - ((_at459 / sp.w) | 0))))));
          }
          if (!(_c469)) continue;
          const _h470 = (g[v_p] || -1);
          if ((_h470 === _v460)) {
            _q461 = true;
            break Q462;
          }
        }
      }
      _c471 = _q461;
    }
    if (!(_c471)) return false;
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
  const _h6 = (b.grid[v_c] !== 0);
  const _h7 = clueAt(cl.wall, v_c);
  const _h8 = clueAt(cl.arrow, v_c);
  const _h12 = (b.grid[v_c] || -1);
  if (!((_h6 && ((_h7 === -1) && (_h8 === -1))))) return 0;
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_p = _a9[_i10];
    const _h11 = (b.grid[v_p] !== 0);
    if (!(((v_p !== v_c) && !(_h11)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("once", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))), (sp.cells.includes(v_p)), ((v_p !== v_c) && !((b.grid[v_p] !== 0)))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if (b.has(v_p, _h12)) { if (fire === null) { b.strikeAt(v_p, _h12); changed = true; } else facts.push(STRIKE, v_p, _h12); }
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
  const _g30: number[] = [];
  const facts = onlySquareFacts;
  let fired = 0;
  let changed = false;
  const _t25 = cl.top;
  for (let v_n = 1; v_n <= _t25; v_n++) {
    let _g26 = 0;
    G27: {
      const _a28 = cellsValued(b, sp.cells, v_n);
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_x = _a28[_i29];
        if (!(((b.grid[v_x] || -1) === v_n))) continue;
        _g26++;
      }
    }
    if (!(!((_g26 > 0)))) continue;
    _g30.length = 0;
    G31: {
      const _a34 = sp.cells;
      for (let _i35 = 0; _i35 < _a34.length; _i35++) {
        const v_c = _a34[_i35];
        if (!((!((b.grid[v_c] !== 0)) && b.has(v_c, v_n)))) continue;
        _g30.push(v_c);
      }
    }
    L36: {
      const v_S = _g30;
      const _h37 = v_S.length;
      if (!((_h37 < 2))) break L36;
      if (import.meta.env.DEV && staleChecking) {
        let _g38 = 0;
        G39: {
          const _a40 = cellsValued(b, sp.cells, v_n);
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_x = _a40[_i41];
            if (!(((b.grid[v_x] || -1) === v_n))) continue;
            _g38++;
          }
        }
        const _g42: number[] = [];
        G43: {
          const _a46 = sp.cells;
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_c = _a46[_i47];
            if (!((!((b.grid[v_c] !== 0)) && b.has(v_c, v_n)))) continue;
            _g42.push(v_c);
          }
        }
        freshBinding("onlySquare", [((1 <= v_n) && (v_n <= cl.top)), !((_g38 > 0)), sameSet(v_S, _g42), (v_S.length < 2)], ["n in", "where of n", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _c49: boolean = (_h37 === 1);
      if (_c49) {
        const _t48 = (v_S.length > 0 ? v_S[0] : -1);
        if (!(b.grid[_t48] !== 0)) { if (fire === null) { b.placeAt(_t48, v_n); changed = true; } else facts.push(PLACE, _t48, v_n); }
        _c49 = true;
      }
      if (!(_c49)) return -1;
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
  const _h84 = (cl.moves === 0);
  const _h85 = (cl.moves === 1);
  const _a60 = sp.cells;
  R1:
  for (let _i61 = 0; _i61 < _a60.length; _i61++) {
    const v_c = _a60[_i61];
    const _m32_0 = b.made[0];
    const _h62 = (b.grid[v_c] !== 0);
    const _h63 = clueAt(cl.wall, v_c);
    const _h64 = clueAt(cl.arrow, v_c);
    if (!((_h62 && ((_h63 === -1) && (_h64 === -1))))) continue;
    const _h65 = (b.grid[v_c] || -1);
    const _h86 = (v_c % sp.w);
    const _h87 = ((v_c / sp.w) | 0);
    const _t66 = (_h65 - 1);
    const _t67 = (_h65 + 1);
    R2:
    for (let _i68 = 0; _i68 < 2; _i68++) {
      const v_m = _i68 === 0 ? _t66 : _t67;
      if (_i68 === 1 && (v_m === _t66)) continue;
      let _c74: boolean = ((v_m >= 1) && (v_m <= cl.top));
      if (_c74) {
        let _g69 = 0;
        G70: {
          const _a71 = cellsValued(b, sp.cells, v_m);
          for (let _i72 = 0; _i72 < _a71.length; _i72++) {
            const v_x = _a71[_i72];
            const _h73 = (b.grid[v_x] || -1);
            if (!((_h73 === v_m))) continue;
            _g69++;
          }
        }
        _c74 = !((_g69 > 0));
      }
      if (!(_c74)) continue;
      if (b.made[0] !== _m32_0) {
        if (!(((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))))) { continue R1; }
        if (!(((v_m === ((b.grid[v_c] || -1) - 1)) || (v_m === ((b.grid[v_c] || -1) + 1))))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c79: boolean = ((v_m >= 1) && (v_m <= cl.top));
        if (_c79) {
          let _g75 = 0;
          G76: {
            const _a77 = cellsValued(b, sp.cells, v_m);
            for (let _i78 = 0; _i78 < _a77.length; _i78++) {
              const v_x = _a77[_i78];
              if (!(((b.grid[v_x] || -1) === v_m))) continue;
              _g75++;
            }
          }
          _c79 = !((_g75 > 0));
        }
        freshBinding("nextTo", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))), ((v_m === ((b.grid[v_c] || -1) - 1)) || (v_m === ((b.grid[v_c] || -1) + 1))), _c79], ["c in", "where of c", "m in", "where of m"]);
      }
      facts.length = 0;
      changed = false;
      let _q80 = true;
      Q81: {
        const _a82 = sp.cells;
        for (let _i83 = 0; _i83 < _a82.length; _i83++) {
          const v_p = _a82[_i83];
          if (!((b.has(v_p, v_m) && !((((_h84 || (_h85 && ((((v_p % sp.w) - _h86) * (((v_p / sp.w) | 0) - _h87)) > 0))) && ((Math.abs(((v_p % sp.w) - _h86)) + Math.abs((((v_p / sp.w) | 0) - _h87))) <= 1)) || ((!((_h84 || (_h85 && ((((v_p % sp.w) - _h86) * (((v_p / sp.w) | 0) - _h87)) > 0)))) && (Math.abs(((v_p % sp.w) - _h86)) <= 1)) && (Math.abs((((v_p / sp.w) | 0) - _h87)) <= 1))))))) continue;
          if (b.has(v_p, v_m)) { if (fire === null) { b.strikeAt(v_p, v_m); changed = true; } else facts.push(STRIKE, v_p, v_m); }
          if (!(true)) {
            _q80 = false;
            break Q81;
          }
        }
      }
      if (!(_q80)) return -1;
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
  const _h123 = (cl.moves === 0);
  const _h124 = (cl.moves === 1);
  const _a109 = sp.cells;
  R1:
  for (let _i110 = 0; _i110 < _a109.length; _i110++) {
    const v_c = _a109[_i110];
    const _m50_0 = b.made[0];
    const _h111 = (b.grid[v_c] !== 0);
    const _h112 = clueAt(cl.wall, v_c);
    const _h113 = clueAt(cl.arrow, v_c);
    if (!((_h111 && ((_h112 === -1) && (_h113 === -1))))) continue;
    const _h114 = (b.grid[v_c] || -1);
    const _h125 = (v_c % sp.w);
    const _h126 = ((v_c / sp.w) | 0);
    const v_n = _h114;
    const _m56_1 = b.made[1];
    const _t115 = ((v_n - gapBelow(b, sp, v_n)) + 1);
    const _t116 = ((v_n + gapAbove(b, sp, cl, v_n)) - 1);
    R2:
    for (let v_m = _t115; v_m <= _t116; v_m++) {
      if (!((v_m !== v_n))) continue;
      const _h121 = (v_m - v_n);
      const _h122 = Math.abs(_h121);
      if (b.made[0] !== _m50_0 || b.made[1] !== _m56_1) {
        if (!(((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))))) { continue R1; }
        if (!((v_n === (b.grid[v_c] || -1)))) { continue R1; }
        if (!(((((v_n - gapBelow(b, sp, v_n)) + 1) <= v_m) && (v_m <= ((v_n + gapAbove(b, sp, cl, v_n)) - 1))))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("reach", [(sp.cells.includes(v_c)), ((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))), (v_n === (b.grid[v_c] || -1)), ((((v_n - gapBelow(b, sp, v_n)) + 1) <= v_m) && (v_m <= ((v_n + gapAbove(b, sp, cl, v_n)) - 1))), (v_m !== v_n)], ["c in", "where of c", "n =", "m in", "where of m"]);
      }
      facts.length = 0;
      changed = false;
      let _q117 = true;
      Q118: {
        const _a119 = sp.cells;
        for (let _i120 = 0; _i120 < _a119.length; _i120++) {
          const v_p = _a119[_i120];
          if (!((b.has(v_p, v_m) && !((((_h123 || (_h124 && ((((v_p % sp.w) - _h125) * (((v_p / sp.w) | 0) - _h126)) > 0))) && ((Math.abs(((v_p % sp.w) - _h125)) + Math.abs((((v_p / sp.w) | 0) - _h126))) <= _h122)) || ((!((_h123 || (_h124 && ((((v_p % sp.w) - _h125) * (((v_p / sp.w) | 0) - _h126)) > 0)))) && (Math.abs(((v_p % sp.w) - _h125)) <= _h122)) && (Math.abs((((v_p / sp.w) | 0) - _h126)) <= _h122))))))) continue;
          if (b.has(v_p, v_m)) { if (fire === null) { b.strikeAt(v_p, v_m); changed = true; } else facts.push(STRIKE, v_p, v_m); }
          if (!(true)) {
            _q117 = false;
            break Q118;
          }
        }
      }
      if (!(_q117)) return -1;
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
  const _k177 = nbrKept.board(cl);
  const _a171 = sp.cells;
  R1:
  for (let _i172 = 0; _i172 < _a171.length; _i172++) {
    const v_c = _a171[_i172];
    const _m69_0 = b.made[0];
    const _m69_1 = b.made[1];
    const _h173 = clueAt(cl.wall, v_c);
    const _h174 = clueAt(cl.arrow, v_c);
    let _c197: boolean = (!((b.grid[v_c] !== 0)) && ((_h173 === -1) && (_h174 === -1)));
    if (_c197) {
      let _g175 = 0;
      G176: {
        const _a178 = (_k177[v_c] ?? nbr(sp, cl, v_c));
        for (let _i179 = 0; _i179 < _a178.length; _i179++) {
          const v_p = _a178[_i179];
          const _h180 = clueAt(cl.wall, v_p);
          const _h181 = clueAt(cl.arrow, v_p);
          let _c196: boolean = ((_h180 === -1) && (_h181 === -1));
          if (_c196) {
            let _c188: boolean = !((b.grid[v_p] !== 0));
            if (!_c188) {
              let _c187: boolean = ((b.grid[v_p] || -1) > 1);
              if (_c187) {
                const _t182 = ((b.grid[v_p] || -1) - 1);
                let _g183 = 0;
                G184: {
                  const _a185 = cellsValued(b, sp.cells, _t182);
                  for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                    const v_x = _a185[_i186];
                    if (!(((b.grid[v_x] || -1) === _t182))) continue;
                    _g183++;
                  }
                }
                _c187 = !((_g183 > 0));
              }
              _c188 = _c187;
            }
            let _c195: boolean = _c188;
            if (!_c195) {
              let _c194: boolean = ((b.grid[v_p] || -1) < cl.top);
              if (_c194) {
                const _t189 = ((b.grid[v_p] || -1) + 1);
                let _g190 = 0;
                G191: {
                  const _a192 = cellsValued(b, sp.cells, _t189);
                  for (let _i193 = 0; _i193 < _a192.length; _i193++) {
                    const v_x = _a192[_i193];
                    if (!(((b.grid[v_x] || -1) === _t189))) continue;
                    _g190++;
                  }
                }
                _c194 = !((_g190 > 0));
              }
              _c195 = _c194;
            }
            _c196 = _c195;
          }
          if (!(_c196)) continue;
          _g175++;
        }
      }
      _c197 = (_g175 === 1);
    }
    if (!(_c197)) continue;
    const _t198 = cl.top;
    for (let _i199 = 0; _i199 < 2; _i199++) {
      const v_n = _i199 === 0 ? 1 : _t198;
      if (_i199 === 1 && (v_n === 1)) continue;
      let _g200 = 0;
      G201: {
        const _a202 = cellsValued(b, sp.cells, v_n);
        for (let _i203 = 0; _i203 < _a202.length; _i203++) {
          const v_x = _a202[_i203];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g200++;
        }
      }
      let _c213: boolean = (!((_g200 > 0)) && b.has(v_c, v_n));
      if (_c213) {
        let _q204 = false;
        Q205: {
          const _t206 = cl.top;
          for (let _i207 = 0; _i207 < 2; _i207++) {
            const v_e = _i207 === 0 ? 1 : _t206;
            if (_i207 === 1 && (v_e === 1)) continue;
            let _c212: boolean = (v_e !== v_n);
            if (_c212) {
              let _g208 = 0;
              G209: {
                const _a210 = cellsValued(b, sp.cells, v_e);
                for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                  const v_x = _a210[_i211];
                  if (!(((b.grid[v_x] || -1) === v_e))) continue;
                  _g208++;
                }
              }
              _c212 = !((_g208 > 0));
            }
            if (!(_c212)) continue;
            if (b.has(v_c, v_e)) {
              _q204 = true;
              break Q205;
            }
          }
        }
        _c213 = !(_q204);
      }
      if (!(_c213)) continue;
      if (b.made[0] !== _m69_0 || b.made[1] !== _m69_1) {
        let _c233: boolean = (!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1)));
        if (_c233) {
          let _g214 = 0;
          G215: {
            const _a216 = nbr(sp, cl, v_c);
            for (let _i217 = 0; _i217 < _a216.length; _i217++) {
              const v_p = _a216[_i217];
              let _c232: boolean = ((clueAt(cl.wall, v_p) === -1) && (clueAt(cl.arrow, v_p) === -1));
              if (_c232) {
                let _c224: boolean = !((b.grid[v_p] !== 0));
                if (!_c224) {
                  let _c223: boolean = ((b.grid[v_p] || -1) > 1);
                  if (_c223) {
                    const _t218 = ((b.grid[v_p] || -1) - 1);
                    let _g219 = 0;
                    G220: {
                      const _a221 = cellsValued(b, sp.cells, _t218);
                      for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                        const v_x = _a221[_i222];
                        if (!(((b.grid[v_x] || -1) === _t218))) continue;
                        _g219++;
                      }
                    }
                    _c223 = !((_g219 > 0));
                  }
                  _c224 = _c223;
                }
                let _c231: boolean = _c224;
                if (!_c231) {
                  let _c230: boolean = ((b.grid[v_p] || -1) < cl.top);
                  if (_c230) {
                    const _t225 = ((b.grid[v_p] || -1) + 1);
                    let _g226 = 0;
                    G227: {
                      const _a228 = cellsValued(b, sp.cells, _t225);
                      for (let _i229 = 0; _i229 < _a228.length; _i229++) {
                        const v_x = _a228[_i229];
                        if (!(((b.grid[v_x] || -1) === _t225))) continue;
                        _g226++;
                      }
                    }
                    _c230 = !((_g226 > 0));
                  }
                  _c231 = _c230;
                }
                _c232 = _c231;
              }
              if (!(_c232)) continue;
              _g214++;
            }
          }
          _c233 = (_g214 === 1);
        }
        if (!(_c233)) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c253: boolean = (!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1)));
        if (_c253) {
          let _g234 = 0;
          G235: {
            const _a236 = nbr(sp, cl, v_c);
            for (let _i237 = 0; _i237 < _a236.length; _i237++) {
              const v_p = _a236[_i237];
              let _c252: boolean = ((clueAt(cl.wall, v_p) === -1) && (clueAt(cl.arrow, v_p) === -1));
              if (_c252) {
                let _c244: boolean = !((b.grid[v_p] !== 0));
                if (!_c244) {
                  let _c243: boolean = ((b.grid[v_p] || -1) > 1);
                  if (_c243) {
                    const _t238 = ((b.grid[v_p] || -1) - 1);
                    let _g239 = 0;
                    G240: {
                      const _a241 = cellsValued(b, sp.cells, _t238);
                      for (let _i242 = 0; _i242 < _a241.length; _i242++) {
                        const v_x = _a241[_i242];
                        if (!(((b.grid[v_x] || -1) === _t238))) continue;
                        _g239++;
                      }
                    }
                    _c243 = !((_g239 > 0));
                  }
                  _c244 = _c243;
                }
                let _c251: boolean = _c244;
                if (!_c251) {
                  let _c250: boolean = ((b.grid[v_p] || -1) < cl.top);
                  if (_c250) {
                    const _t245 = ((b.grid[v_p] || -1) + 1);
                    let _g246 = 0;
                    G247: {
                      const _a248 = cellsValued(b, sp.cells, _t245);
                      for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                        const v_x = _a248[_i249];
                        if (!(((b.grid[v_x] || -1) === _t245))) continue;
                        _g246++;
                      }
                    }
                    _c250 = !((_g246 > 0));
                  }
                  _c251 = _c250;
                }
                _c252 = _c251;
              }
              if (!(_c252)) continue;
              _g234++;
            }
          }
          _c253 = (_g234 === 1);
        }
        let _g254 = 0;
        G255: {
          const _a256 = cellsValued(b, sp.cells, v_n);
          for (let _i257 = 0; _i257 < _a256.length; _i257++) {
            const v_x = _a256[_i257];
            if (!(((b.grid[v_x] || -1) === v_n))) continue;
            _g254++;
          }
        }
        let _c267: boolean = (!((_g254 > 0)) && b.has(v_c, v_n));
        if (_c267) {
          let _q258 = false;
          Q259: {
            const _t260 = cl.top;
            for (let _i261 = 0; _i261 < 2; _i261++) {
              const v_e = _i261 === 0 ? 1 : _t260;
              if (_i261 === 1 && (v_e === 1)) continue;
              let _c266: boolean = (v_e !== v_n);
              if (_c266) {
                let _g262 = 0;
                G263: {
                  const _a264 = cellsValued(b, sp.cells, v_e);
                  for (let _i265 = 0; _i265 < _a264.length; _i265++) {
                    const v_x = _a264[_i265];
                    if (!(((b.grid[v_x] || -1) === v_e))) continue;
                    _g262++;
                  }
                }
                _c266 = !((_g262 > 0));
              }
              if (!(_c266)) continue;
              if (b.has(v_c, v_e)) {
                _q258 = true;
                break Q259;
              }
            }
          }
          _c267 = !(_q258);
        }
        freshBinding("deadEnd", [(sp.cells.includes(v_c)), _c253, ((v_n === 1) || (v_n === cl.top)), _c267], ["c in", "where of c", "n in", "where of n"]);
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
  const _k290 = nbrKept.board(cl);
  const _t273 = cl.top;
  for (let v_n = 1; v_n <= _t273; v_n++) {
    let _g274 = 0;
    G275: {
      const _a276 = cellsValued(b, sp.cells, v_n);
      for (let _i277 = 0; _i277 < _a276.length; _i277++) {
        const v_x = _a276[_i277];
        const _h278 = (b.grid[v_x] || -1);
        if (!((_h278 === v_n))) continue;
        _g274++;
      }
    }
    if (!(!((_g274 > 0)))) continue;
    const _h287 = (v_n > 1);
    const _h293 = (v_n - 1);
    const _h295 = (v_n < cl.top);
    const _h300 = (v_n + 1);
    if (import.meta.env.DEV && staleChecking) {
      let _g279 = 0;
      G280: {
        const _a281 = cellsValued(b, sp.cells, v_n);
        for (let _i282 = 0; _i282 < _a281.length; _i282++) {
          const v_x = _a281[_i282];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g279++;
        }
      }
      freshBinding("overlap", [((1 <= v_n) && (v_n <= cl.top)), !((_g279 > 0))], ["n in", "where of n"]);
    }
    facts.length = 0;
    changed = false;
    let _q283 = true;
    Q284: {
      const _a285 = sp.cells;
      for (let _i286 = 0; _i286 < _a285.length; _i286++) {
        const v_c = _a285[_i286];
        let _c303: boolean = b.has(v_c, v_n);
        if (_c303) {
          let _c294: boolean = _h287;
          if (_c294) {
            let _q288 = false;
            Q289: {
              const _a291 = (_k290[v_c] ?? nbr(sp, cl, v_c));
              for (let _i292 = 0; _i292 < _a291.length; _i292++) {
                const v_p = _a291[_i292];
                if (b.has(v_p, _h293)) {
                  _q288 = true;
                  break Q289;
                }
              }
            }
            _c294 = !(_q288);
          }
          let _c302: boolean = _c294;
          if (!_c302) {
            let _c301: boolean = _h295;
            if (_c301) {
              let _q296 = false;
              Q297: {
                const _a298 = (_k290[v_c] ?? nbr(sp, cl, v_c));
                for (let _i299 = 0; _i299 < _a298.length; _i299++) {
                  const v_p = _a298[_i299];
                  if (b.has(v_p, _h300)) {
                    _q296 = true;
                    break Q297;
                  }
                }
              }
              _c301 = !(_q296);
            }
            _c302 = _c301;
          }
          _c303 = _c302;
        }
        if (!(_c303)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q283 = false;
          break Q284;
        }
      }
    }
    if (!(_q283)) return -1;
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
  const _a320 = sp.cells;
  for (let _i321 = 0; _i321 < _a320.length; _i321++) {
    const v_c = _a320[_i321];
    const _h322 = clueAt(cl.wall, v_c);
    const _h323 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h322 === -1) && (_h323 === -1))) && (b.candCount(v_c) === 1)))) continue;
    L324: {
      const v_n = b.candFirst(v_c);
      let _c330: boolean = (v_n > 1);
      if (_c330) {
        const _t325 = (v_n - 1);
        let _g326 = 0;
        G327: {
          const _a328 = cellsValued(b, sp.cells, _t325);
          for (let _i329 = 0; _i329 < _a328.length; _i329++) {
            const v_x = _a328[_i329];
            if (!(((b.grid[v_x] || -1) === _t325))) continue;
            _g326++;
          }
        }
        _c330 = (_g326 > 0);
      }
      let _c337: boolean = _c330;
      if (!_c337) {
        let _c336: boolean = (v_n < cl.top);
        if (_c336) {
          const _t331 = (v_n + 1);
          let _g332 = 0;
          G333: {
            const _a334 = cellsValued(b, sp.cells, _t331);
            for (let _i335 = 0; _i335 < _a334.length; _i335++) {
              const v_x = _a334[_i335];
              if (!(((b.grid[v_x] || -1) === _t331))) continue;
              _g332++;
            }
          }
          _c336 = (_g332 > 0);
        }
        _c337 = _c336;
      }
      if (!(_c337)) break L324;
      if (import.meta.env.DEV && staleChecking) {
        let _c343: boolean = (v_n > 1);
        if (_c343) {
          const _t338 = (v_n - 1);
          let _g339 = 0;
          G340: {
            const _a341 = cellsValued(b, sp.cells, _t338);
            for (let _i342 = 0; _i342 < _a341.length; _i342++) {
              const v_x = _a341[_i342];
              if (!(((b.grid[v_x] || -1) === _t338))) continue;
              _g339++;
            }
          }
          _c343 = (_g339 > 0);
        }
        let _c350: boolean = _c343;
        if (!_c350) {
          let _c349: boolean = (v_n < cl.top);
          if (_c349) {
            const _t344 = (v_n + 1);
            let _g345 = 0;
            G346: {
              const _a347 = cellsValued(b, sp.cells, _t344);
              for (let _i348 = 0; _i348 < _a347.length; _i348++) {
                const v_x = _a347[_i348];
                if (!(((b.grid[v_x] || -1) === _t344))) continue;
                _g345++;
              }
            }
            _c349 = (_g345 > 0);
          }
          _c350 = _c349;
        }
        freshBinding("onlyNumberNear", [(sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))) && (b.candCount(v_c) === 1)), (v_n === b.candFirst(v_c)), _c350], ["c in", "where of c", "n =", "where of n"]);
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
  const _a353 = sp.cells;
  for (let _i354 = 0; _i354 < _a353.length; _i354++) {
    const v_c = _a353[_i354];
    const _h355 = clueAt(cl.wall, v_c);
    const _h356 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h355 === -1) && (_h356 === -1))) && (b.candCount(v_c) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("onlyNumber", [(sp.cells.includes(v_c)), ((!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))) && (b.candCount(v_c) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c358: boolean = (b.candCount(v_c) === 1);
    if (_c358) {
      const _t357 = b.candFirst(v_c);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t357); changed = true; } else facts.push(PLACE, v_c, _t357); }
      _c358 = true;
    }
    if (!(_c358)) return -1;
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
  const _h372 = (sp.h - 1);
  const _h381 = (sp.w - 1);
  const _a362 = sp.cells;
  for (let _i363 = 0; _i363 < _a362.length; _i363++) {
    const v_a = _a362[_i363];
    const _h364 = clueAt(cl.arrow, v_a);
    const _h370 = ((v_a / sp.w) | 0);
    const _h371 = (_h370 > 0);
    const _h373 = (_h370 < _h372);
    const _h374 = (_h371 && _h373);
    const _h375 = (_h370 === 0);
    const _h376 = (_h370 === _h372);
    const _h377 = (_h375 || _h376);
    const _h378 = (v_a % sp.w);
    const _h379 = (_h378 > 0);
    const _h380 = (_h377 && _h379);
    const _h382 = (_h378 < _h381);
    const _h383 = (_h380 && _h382);
    const _h384 = (_h378 === 0);
    const _h385 = (_h378 === _h381);
    const _h386 = (_h384 || _h385);
    const _h387 = (_h377 && _h386);
    L365: {
      const v_n = _h364;
      if (!((v_n !== -1))) break L365;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("onLine", [(sp.cells.includes(v_a)), (v_n === clueAt(cl.arrow, v_a)), (v_n !== -1)], ["a in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _q366 = true;
      Q367: {
        const _a368 = sp.cells;
        for (let _i369 = 0; _i369 < _a368.length; _i369++) {
          const v_p = _a368[_i369];
          if (!((b.has(v_p, v_n) && !((((_h374 && (((v_p / sp.w) | 0) === _h370)) || (_h383 && ((v_p % sp.w) === _h378))) || (_h387 && (Math.abs(((v_p % sp.w) - _h378)) === Math.abs((((v_p / sp.w) | 0) - _h370))))))))) continue;
          if (b.has(v_p, v_n)) { if (fire === null) { b.strikeAt(v_p, v_n); changed = true; } else facts.push(STRIKE, v_p, v_n); }
          if (!(true)) {
            _q366 = false;
            break Q367;
          }
        }
      }
      if (!(_q366)) return -1;
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
  const _k410 = nbrKept.board(cl);
  const _t393 = cl.top;
  for (let v_n = 1; v_n <= _t393; v_n++) {
    let _g394 = 0;
    G395: {
      const _a396 = cellsValued(b, sp.cells, v_n);
      for (let _i397 = 0; _i397 < _a396.length; _i397++) {
        const v_x = _a396[_i397];
        const _h398 = (b.grid[v_x] || -1);
        if (!((_h398 === v_n))) continue;
        _g394++;
      }
    }
    if (!(!((_g394 > 0)))) continue;
    const _h407 = (v_n > 1);
    const _h413 = (v_n - 1);
    const _h415 = (v_n < cl.top);
    const _h420 = (v_n + 1);
    if (import.meta.env.DEV && staleChecking) {
      let _g399 = 0;
      G400: {
        const _a401 = cellsValued(b, sp.cells, v_n);
        for (let _i402 = 0; _i402 < _a401.length; _i402++) {
          const v_x = _a401[_i402];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g399++;
        }
      }
      freshBinding("overlapEdges", [((1 <= v_n) && (v_n <= cl.top)), !((_g399 > 0))], ["n in", "where of n"]);
    }
    facts.length = 0;
    changed = false;
    let _q403 = true;
    Q404: {
      const _a405 = sp.cells;
      for (let _i406 = 0; _i406 < _a405.length; _i406++) {
        const v_c = _a405[_i406];
        let _c423: boolean = b.has(v_c, v_n);
        if (_c423) {
          let _c414: boolean = _h407;
          if (_c414) {
            let _q408 = false;
            Q409: {
              const _a411 = (_k410[v_c] ?? nbr(sp, cl, v_c));
              for (let _i412 = 0; _i412 < _a411.length; _i412++) {
                const v_p = _a411[_i412];
                if (b.has(v_p, _h413)) {
                  _q408 = true;
                  break Q409;
                }
              }
            }
            _c414 = !(_q408);
          }
          let _c422: boolean = _c414;
          if (!_c422) {
            let _c421: boolean = _h415;
            if (_c421) {
              let _q416 = false;
              Q417: {
                const _a418 = (_k410[v_c] ?? nbr(sp, cl, v_c));
                for (let _i419 = 0; _i419 < _a418.length; _i419++) {
                  const v_p = _a418[_i419];
                  if (b.has(v_p, _h420)) {
                    _q416 = true;
                    break Q417;
                  }
                }
              }
              _c421 = !(_q416);
            }
            _c422 = _c421;
          }
          _c423 = _c422;
        }
        if (!(_c423)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q403 = false;
          break Q404;
        }
      }
    }
    if (!(_q403)) return -1;
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
  let _g90 = -1;
  G91: {
    for (let v_j = 1; v_j <= v_n; v_j++) {
      let _c97: boolean = (v_j === v_n);
      if (!_c97) {
        const _t92 = (v_n - v_j);
        let _g93 = 0;
        G94: {
          const _a95 = cellsValued(b, sp.cells, _t92);
          for (let _i96 = 0; _i96 < _a95.length; _i96++) {
            const v_x = _a95[_i96];
            if (!(((b.grid[v_x] || -1) === _t92))) continue;
            _g93++;
          }
        }
        _c97 = (_g93 > 0);
      }
      if (!(_c97)) continue;
      _g90 = v_j;
      break G91;
    }
  }
  const _made = _g90;
  _kept[v_n] = _made;
  return _made;
}

const gapAboveKept = keptStore<number>();

/** `gapAbove(n)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function gapAbove(b: Marks, sp: GridSpace, cl: Dealt, v_n: number): number {
  const _kept: Kept<number> = gapAboveKept.marks(b);
  if (_kept[v_n] !== undefined) return _kept[v_n];
  let _g99 = -1;
  G100: {
    const _t101 = ((cl.top + 1) - v_n);
    for (let v_j = 1; v_j <= _t101; v_j++) {
      let _c107: boolean = (v_j === ((cl.top + 1) - v_n));
      if (!_c107) {
        const _t102 = (v_n + v_j);
        let _g103 = 0;
        G104: {
          const _a105 = cellsValued(b, sp.cells, _t102);
          for (let _i106 = 0; _i106 < _a105.length; _i106++) {
            const v_x = _a105[_i106];
            if (!(((b.grid[v_x] || -1) === _t102))) continue;
            _g103++;
          }
        }
        _c107 = (_g103 > 0);
      }
      if (!(_c107)) continue;
      _g99 = v_j;
      break G100;
    }
  }
  const _made = _g99;
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
  const _g131: number[] = [];
  G132: {
    const _a135 = sp.adj8[v_c];
    for (let _i136 = 0; _i136 < _a135.length; _i136++) {
      const v_p = _a135[_i136];
      if (!((((cl.moves === 2) || ((cl.moves === 0) && (sp.adj4[v_c].includes(v_p)))) || ((cl.moves === 1) && (((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))))) continue;
      _g131.push(v_p);
    }
  }
  const _made = _g131;
  _kept[v_c] = _made;
  return _made;
}
