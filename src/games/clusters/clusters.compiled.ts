// Compiled by `npm run describe` from src/games/clusters/clusters.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, keptStore, rangeMask, setOf, type Kept, union, within } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  dot: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "broken" | "refute" | "countFull" | "countShort";

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
  { id: "broken", tier: 0 },
  { id: "refute", tier: 0 },
  { id: "countFull", tier: 1 },
  { id: "countShort", tier: 1 },
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
  let _q409 = true;
  Q410: {
    const _a411 = cluesValued(cl.dot, -1);
    for (let _i412 = 0; _i412 < _a411.length; _i412++) {
      const v_c = _a411[_i412];
      const _h413 = clueAt(cl.dot, v_c);
      if (!((_h413 === -1))) continue;
      const _h419 = (g[v_c] || -1);
      let _g414 = 0;
      G415: {
        const _a416 = sp.adj4[v_c];
        for (let _i417 = 0; _i417 < _a416.length; _i417++) {
          const v_m = _a416[_i417];
          const _h418 = (g[v_m] || -1);
          if (!((_h418 === _h419))) continue;
          _g414++;
        }
      }
      if (!((_g414 >= 2))) {
        _q409 = false;
        break Q410;
      }
    }
  }
  if (!(_q409)) return false;
  for (let _k420 = 0; _k420 < cl.dot.at.length; _k420++) {
    const _at421 = cl.dot.at[_k420];
    const _v422 = cl.dot.v[_k420];
    let _c428: boolean = ((g[_at421] || -1) === _v422);
    if (_c428) {
      let _g423 = 0;
      G424: {
        const _a425 = sp.adj4[_at421];
        for (let _i426 = 0; _i426 < _a425.length; _i426++) {
          const v_m = _a425[_i426];
          const _h427 = (g[v_m] || -1);
          if (!((_h427 === _v422))) continue;
          _g423++;
        }
      }
      _c428 = (_g423 === 1);
    }
    if (!(_c428)) return false;
  }
  return true;
}

export interface BrokenBinding {
  c: number;
  r: number;
}

const brokenFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function broken(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BrokenBinding> | null): number {
  const facts = brokenFacts;
  let fired = 0;
  let changed = false;
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    const _h10 = (b.grid[v_c] !== 0);
    if (!(_h10)) continue;
    const _h11 = (b.grid[v_c] || -1);
    let _g12 = 0;
    G13: {
      const _a14 = sp.adj4[v_c];
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_m = _a14[_i15];
        const _h16 = (b.grid[v_m] !== 0);
        const _h17 = (b.grid[v_m] || -1);
        if (!(((v_m !== v_c) && (!(_h16) || (_h17 === _h11))))) continue;
        _g12++;
      }
    }
    const v_r = _g12;
    facts.length = 0;
    changed = false;
    let _c28: boolean = ((v_r >= 1) && ((dot(sp, cl, v_c) === 1) || (v_r >= 2)));
    if (_c28) {
      let _c27: boolean = (dot(sp, cl, v_c) === 0);
      if (!_c27) {
        let _g22 = 0;
        G23: {
          const _a24 = sp.adj4[v_c];
          for (let _i25 = 0; _i25 < _a24.length; _i25++) {
            const v_m = _a24[_i25];
            const _h26 = (b.grid[v_m] || -1);
            if (!((_h26 === _h11))) continue;
            _g22++;
          }
        }
        _c27 = (_g22 <= 1);
      }
      _c28 = _c27;
    }
    if (!(_c28)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c, r: v_r }, facts)) return 1;
    }
  }
  return fired;
}

export interface RefuteBinding {
  x: number;
  d: number;
  n: number;
  e: number;
  r: number;
}

const refuteFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function refute(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RefuteBinding> | null): number {
  const facts = refuteFacts;
  let fired = 0;
  let changed = false;
  const _a46 = sp.cells;
  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
    const v_x = _a46[_i47];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    for (let _m48 = b.domain; _m48 !== 0; _m48 &= _m48 - 1) {
      const v_d = 31 - Math.clz32(_m48 & -_m48);
      const _h63 = (3 - v_d);
      const _h64 = _h63;
      const _a49 = union(setOf(v_x), sp.adj4[v_x]);
      for (let _i50 = 0; _i50 < _a49.length; _i50++) {
        const v_n = _a49[_i50];
        if (!(((v_n === v_x) || (b.grid[v_n] !== 0)))) continue;
        const _h52 = (v_n === v_x);
        const _h53 = (v_n !== v_x);
        for (let _m51 = b.domain; _m51 !== 0; _m51 &= _m51 - 1) {
          const v_e = 31 - Math.clz32(_m51 & -_m51);
          if (!(((_h52 && (v_e === v_d)) || (_h53 && (v_e === (b.grid[v_n] || -1)))))) continue;
          let _g54 = 0;
          G55: {
            const _a56 = sp.adj4[v_n];
            for (let _i57 = 0; _i57 < _a56.length; _i57++) {
              const v_m = _a56[_i57];
              if (!(((v_m !== v_x) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === v_e))))) continue;
              _g54++;
            }
          }
          L58: {
            const v_r = _g54;
            if (!((((_h52 || (v_e !== v_d)) && ((v_r < 1) || ((dot(sp, cl, v_n) === 0) && (v_r < 2)))) || (((_h53 && (v_e === v_d)) && (dot(sp, cl, v_n) === 1)) && (same(b, sp, v_n) >= 1))))) break L58;
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _h64); changed = true; } else facts.push(PLACE, v_x, _h64); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ x: v_x, d: v_d, n: v_n, e: v_e, r: v_r }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CountFullBinding {
  a: number;
  b: number;
  S: readonly number[];
  R: readonly number[];
  bo: number;
}

const countFullFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function countFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountFullBinding> | null): number {
  const _g171: number[] = [];
  const _g180: number[] = [];
  const _g198: number[] = [];
  const _g212: number[] = [];
  const _g242: number[] = [];
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _a165 = sp.cells;
  for (let _i166 = 0; _i166 < _a165.length; _i166++) {
    const v_a = _a165[_i166];
    let _c177: boolean = (b.grid[v_a] !== 0);
    if (_c177) {
      let _g167 = 0;
      G168: {
        const _a169 = sp.adj4[v_a];
        for (let _i170 = 0; _i170 < _a169.length; _i170++) {
          const v_m = _a169[_i170];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g167++;
        }
      }
      _g171.length = 0;
      G172: {
        const _a175 = sp.adj4[v_a];
        for (let _i176 = 0; _i176 < _a175.length; _i176++) {
          const v_m = _a175[_i176];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g171.push(v_m);
        }
      }
      _c177 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g167)) + ((1 - dot(sp, cl, v_a)) * _g171.length)) > 0);
    }
    if (!(_c177)) continue;
    const _a178 = within(sp, v_a, 2);
    for (let _i179 = 0; _i179 < _a178.length; _i179++) {
      const v_b = _a178[_i179];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g180.length = 0;
      G181: {
        const _a196 = open(b, sp, v_a);
        for (let _i197 = 0; _i197 < _a196.length; _i197++) {
          const v_u = _a196[_i197];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g180.push(v_u);
        }
      }
      const v_S = _g180;
      const _h221 = v_S.length;
      _g198.length = 0;
      G199: {
        const _a208 = open(b, sp, v_a);
        for (let _i209 = 0; _i209 < _a208.length; _i209++) {
          const v_u = _a208[_i209];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g198.push(v_u);
        }
      }
      const v_R = _g198;
      const _h222 = v_R.length;
      let _g210 = 0;
      G211: {
        _g212.length = 0;
        G213: {
          const _a216 = sp.adj4[v_b];
          for (let _i217 = 0; _i217 < _a216.length; _i217++) {
            const v_m = _a216[_i217];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g212.push(v_m);
          }
        }
        const _a218 = _g212;
        for (let _i219 = 0; _i219 < _a218.length; _i219++) {
          const v_u = _a218[_i219];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g210++;
        }
      }
      L220: {
        const v_bo = _g210;
        let _c250: boolean = ((_h221 > 0) && (_h222 > 0));
        if (_c250) {
          let _c237: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
          if (_c237) {
            let _g223 = 0;
            G224: {
              const _a225 = sp.adj4[v_b];
              for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                const v_m = _a225[_i226];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                _g223++;
              }
            }
            _c237 = ((((2 - dot(sp, cl, v_b)) - _g223) - v_bo) >= hi(b, sp, cl, v_a));
          }
          let _c249: boolean = _c237;
          if (!_c249) {
            let _c248: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
            if (_c248) {
              let _g238 = 0;
              G239: {
                const _a240 = sp.adj4[v_b];
                for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                  const v_m = _a240[_i241];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g238++;
                }
              }
              _g242.length = 0;
              G243: {
                const _a246 = sp.adj4[v_b];
                for (let _i247 = 0; _i247 < _a246.length; _i247++) {
                  const v_m = _a246[_i247];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g242.push(v_m);
                }
              }
              _c248 = ((_h221 - ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g238)) + ((1 - dot(sp, cl, v_b)) * _g242.length))) >= hi(b, sp, cl, v_a));
            }
            _c249 = _c248;
          }
          _c250 = _c249;
        }
        if (!(_c250)) break L220;
        facts.length = 0;
        changed = false;
        let _q251 = true;
        Q252: {
          const _a253 = v_R;
          for (let _i254 = 0; _i254 < _a253.length; _i254++) {
            const v_u = _a253[_i254];
            const _t255 = (b.grid[v_a] || -1);
            const _t256 = (3 - _t255);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t256); changed = true; } else facts.push(PLACE, v_u, _t256); }
            if (!(true)) {
              _q251 = false;
              break Q252;
            }
          }
        }
        if (!(_q251)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, S: v_S, R: v_R, bo: v_bo }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CountShortBinding {
  a: number;
  b: number;
  S: readonly number[];
  R: readonly number[];
  bo: number;
  alike: number;
  most: number;
}

const countShortFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function countShort(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountShortBinding> | null): number {
  const _g345: number[] = [];
  const _g357: number[] = [];
  const _g371: number[] = [];
  const _g387: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _a336 = sp.cells;
  for (let _i337 = 0; _i337 < _a336.length; _i337++) {
    const v_a = _a336[_i337];
    let _c342: boolean = (b.grid[v_a] !== 0);
    if (_c342) {
      let _g338 = 0;
      G339: {
        const _a340 = sp.adj4[v_a];
        for (let _i341 = 0; _i341 < _a340.length; _i341++) {
          const v_m = _a340[_i341];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g338++;
        }
      }
      _c342 = (((2 - dot(sp, cl, v_a)) - _g338) > 0);
    }
    if (!(_c342)) continue;
    const _a343 = within(sp, v_a, 2);
    for (let _i344 = 0; _i344 < _a343.length; _i344++) {
      const v_b = _a343[_i344];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g345.length = 0;
      G346: {
        const _a355 = open(b, sp, v_a);
        for (let _i356 = 0; _i356 < _a355.length; _i356++) {
          const v_u = _a355[_i356];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g345.push(v_u);
        }
      }
      const v_S = _g345;
      const _h393 = v_S.length;
      _g357.length = 0;
      G358: {
        const _a367 = open(b, sp, v_a);
        for (let _i368 = 0; _i368 < _a367.length; _i368++) {
          const v_u = _a367[_i368];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g357.push(v_u);
        }
      }
      const v_R = _g357;
      const _h399 = v_R.length;
      let _g369 = 0;
      G370: {
        _g371.length = 0;
        G372: {
          const _a375 = sp.adj4[v_b];
          for (let _i376 = 0; _i376 < _a375.length; _i376++) {
            const v_m = _a375[_i376];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g371.push(v_m);
          }
        }
        const _a377 = _g371;
        for (let _i378 = 0; _i378 < _a377.length; _i378++) {
          const v_u = _a377[_i378];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g369++;
        }
      }
      const v_bo = _g369;
      let _g379 = 0;
      G380: {
        const _a381 = setOf(v_b);
        for (let _i382 = 0; _i382 < _a381.length; _i382++) {
          const v_k = _a381[_i382];
          if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
          _g379++;
        }
      }
      const v_alike = _g379;
      let _g383 = 0;
      G384: {
        const _a385 = sp.adj4[v_b];
        for (let _i386 = 0; _i386 < _a385.length; _i386++) {
          const v_m = _a385[_i386];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g383++;
        }
      }
      _g387.length = 0;
      G388: {
        const _a391 = sp.adj4[v_b];
        for (let _i392 = 0; _i392 < _a391.length; _i392++) {
          const v_m = _a391[_i392];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g387.push(v_m);
        }
      }
      let _g394 = 0;
      G395: {
        const _a396 = sp.adj4[v_b];
        for (let _i397 = 0; _i397 < _a396.length; _i397++) {
          const v_m = _a396[_i397];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g394++;
        }
      }
      L398: {
        const v_most = ((v_alike * ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g383)) + ((1 - dot(sp, cl, v_b)) * _g387.length))) + ((1 - v_alike) * ((_h393 - ((2 - dot(sp, cl, v_b)) - _g394)) + v_bo)));
        if (!(((((_h393 > 0) && (_h399 > 0)) && (v_most < _h393)) && ((lo(b, sp, cl, v_a) - v_most) >= _h399)))) break L398;
        facts.length = 0;
        changed = false;
        let _q404 = true;
        Q405: {
          const _a406 = v_R;
          for (let _i407 = 0; _i407 < _a406.length; _i407++) {
            const v_u = _a406[_i407];
            const _t408 = (b.grid[v_a] || -1);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t408); changed = true; } else facts.push(PLACE, v_u, _t408); }
            if (!(true)) {
              _q404 = false;
              break Q405;
            }
          }
        }
        if (!(_q404)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, S: v_S, R: v_R, bo: v_bo, alike: v_alike, most: v_most }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

const dotKept = keptStore<number>();

/** `dot(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function dot(_sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = dotKept.board(cl);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g18 = 0;
  G19: {
    const _a20 = setOf(v_c);
    for (let _i21 = 0; _i21 < _a20.length; _i21++) {
      const v_k = _a20[_i21];
      if (!((clueAt(cl.dot, v_k) !== -1))) continue;
      _g18++;
    }
  }
  const _made = _g18;
  _kept[v_c] = _made;
  return _made;
}

const sameKept = keptStore<number>();

/** `same(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function same(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = sameKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g59 = 0;
  G60: {
    const _a61 = sp.adj4[v_c];
    for (let _i62 = 0; _i62 < _a61.length; _i62++) {
      const v_m = _a61[_i62];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g59++;
    }
  }
  const _made = _g59;
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g190: number[] = [];
  G191: {
    const _a194 = sp.adj4[v_c];
    for (let _i195 = 0; _i195 < _a194.length; _i195++) {
      const v_m = _a194[_i195];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g190.push(v_m);
    }
  }
  const _made = _g190;
  _kept[v_c] = _made;
  return _made;
}

const hiKept = keptStore<number>();

/** `hi(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function hi(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = hiKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g227 = 0;
  G228: {
    const _a229 = sp.adj4[v_c];
    for (let _i230 = 0; _i230 < _a229.length; _i230++) {
      const v_m = _a229[_i230];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g227++;
    }
  }
  const _g231: number[] = [];
  G232: {
    const _a235 = sp.adj4[v_c];
    for (let _i236 = 0; _i236 < _a235.length; _i236++) {
      const v_m = _a235[_i236];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g231.push(v_m);
    }
  }
  const _made = ((dot(sp, cl, v_c) * ((2 - dot(sp, cl, v_c)) - _g227)) + ((1 - dot(sp, cl, v_c)) * _g231.length));
  _kept[v_c] = _made;
  return _made;
}

const loKept = keptStore<number>();

/** `lo(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lo(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = loKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g400 = 0;
  G401: {
    const _a402 = sp.adj4[v_c];
    for (let _i403 = 0; _i403 < _a402.length; _i403++) {
      const v_m = _a402[_i403];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g400++;
    }
  }
  const _made = ((2 - dot(sp, cl, v_c)) - _g400);
  _kept[v_c] = _made;
  return _made;
}
