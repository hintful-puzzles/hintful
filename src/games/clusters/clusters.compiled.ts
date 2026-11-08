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
  let _q402 = true;
  Q403: {
    const _a404 = cluesValued(cl.dot, -1);
    for (let _i405 = 0; _i405 < _a404.length; _i405++) {
      const v_c = _a404[_i405];
      const _h406 = clueAt(cl.dot, v_c);
      if (!((_h406 === -1))) continue;
      const _h412 = (g[v_c] || -1);
      let _g407 = 0;
      G408: {
        const _a409 = sp.adj4[v_c];
        for (let _i410 = 0; _i410 < _a409.length; _i410++) {
          const v_m = _a409[_i410];
          const _h411 = (g[v_m] || -1);
          if (!((_h411 === _h412))) continue;
          _g407++;
        }
      }
      if (!((_g407 >= 2))) {
        _q402 = false;
        break Q403;
      }
    }
  }
  if (!(_q402)) return false;
  for (let _k413 = 0; _k413 < cl.dot.at.length; _k413++) {
    const _at414 = cl.dot.at[_k413];
    const _v415 = cl.dot.v[_k413];
    let _c421: boolean = ((g[_at414] || -1) === _v415);
    if (_c421) {
      let _g416 = 0;
      G417: {
        const _a418 = sp.adj4[_at414];
        for (let _i419 = 0; _i419 < _a418.length; _i419++) {
          const v_m = _a418[_i419];
          const _h420 = (g[v_m] || -1);
          if (!((_h420 === _v415))) continue;
          _g416++;
        }
      }
      _c421 = (_g416 === 1);
    }
    if (!(_c421)) return false;
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
    let _c27: boolean = ((v_r >= 1) && ((dot(sp, cl, v_c) === 1) || (v_r >= 2)));
    if (_c27) {
      let _c26: boolean = (dot(sp, cl, v_c) === 0);
      if (!_c26) {
        let _g21 = 0;
        G22: {
          const _a23 = sp.adj4[v_c];
          for (let _i24 = 0; _i24 < _a23.length; _i24++) {
            const v_m = _a23[_i24];
            const _h25 = (b.grid[v_m] || -1);
            if (!((_h25 === _h11))) continue;
            _g21++;
          }
        }
        _c26 = (_g21 <= 1);
      }
      _c27 = _c26;
    }
    if (!(_c27)) return -1;
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
  const _a45 = sp.cells;
  for (let _i46 = 0; _i46 < _a45.length; _i46++) {
    const v_x = _a45[_i46];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    for (let _m47 = b.domain; _m47 !== 0; _m47 &= _m47 - 1) {
      const v_d = 31 - Math.clz32(_m47 & -_m47);
      const _h62 = (3 - v_d);
      const _h63 = _h62;
      const _a48 = union(setOf(v_x), sp.adj4[v_x]);
      for (let _i49 = 0; _i49 < _a48.length; _i49++) {
        const v_n = _a48[_i49];
        if (!(((v_n === v_x) || (b.grid[v_n] !== 0)))) continue;
        const _h51 = (v_n === v_x);
        const _h52 = (v_n !== v_x);
        for (let _m50 = b.domain; _m50 !== 0; _m50 &= _m50 - 1) {
          const v_e = 31 - Math.clz32(_m50 & -_m50);
          if (!(((_h51 && (v_e === v_d)) || (_h52 && (v_e === (b.grid[v_n] || -1)))))) continue;
          let _g53 = 0;
          G54: {
            const _a55 = sp.adj4[v_n];
            for (let _i56 = 0; _i56 < _a55.length; _i56++) {
              const v_m = _a55[_i56];
              if (!(((v_m !== v_x) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === v_e))))) continue;
              _g53++;
            }
          }
          L57: {
            const v_r = _g53;
            if (!((((_h51 || (v_e !== v_d)) && ((v_r < 1) || ((dot(sp, cl, v_n) === 0) && (v_r < 2)))) || (((_h52 && (v_e === v_d)) && (dot(sp, cl, v_n) === 1)) && (same(b, sp, v_n) >= 1))))) break L57;
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _h63); changed = true; } else facts.push(PLACE, v_x, _h63); }
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
  const _g170: number[] = [];
  const _g179: number[] = [];
  const _g197: number[] = [];
  const _g211: number[] = [];
  const _g241: number[] = [];
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _a164 = sp.cells;
  for (let _i165 = 0; _i165 < _a164.length; _i165++) {
    const v_a = _a164[_i165];
    let _c176: boolean = (b.grid[v_a] !== 0);
    if (_c176) {
      let _g166 = 0;
      G167: {
        const _a168 = sp.adj4[v_a];
        for (let _i169 = 0; _i169 < _a168.length; _i169++) {
          const v_m = _a168[_i169];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g166++;
        }
      }
      _g170.length = 0;
      G171: {
        const _a174 = sp.adj4[v_a];
        for (let _i175 = 0; _i175 < _a174.length; _i175++) {
          const v_m = _a174[_i175];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g170.push(v_m);
        }
      }
      _c176 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g166)) + ((1 - dot(sp, cl, v_a)) * _g170.length)) > 0);
    }
    if (!(_c176)) continue;
    const _a177 = within(sp, v_a, 2);
    for (let _i178 = 0; _i178 < _a177.length; _i178++) {
      const v_b = _a177[_i178];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g179.length = 0;
      G180: {
        const _a195 = open(b, sp, v_a);
        for (let _i196 = 0; _i196 < _a195.length; _i196++) {
          const v_u = _a195[_i196];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g179.push(v_u);
        }
      }
      const v_S = _g179;
      const _h220 = v_S.length;
      _g197.length = 0;
      G198: {
        const _a207 = open(b, sp, v_a);
        for (let _i208 = 0; _i208 < _a207.length; _i208++) {
          const v_u = _a207[_i208];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g197.push(v_u);
        }
      }
      const v_R = _g197;
      const _h221 = v_R.length;
      let _g209 = 0;
      G210: {
        _g211.length = 0;
        G212: {
          const _a215 = sp.adj4[v_b];
          for (let _i216 = 0; _i216 < _a215.length; _i216++) {
            const v_m = _a215[_i216];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g211.push(v_m);
          }
        }
        const _a217 = _g211;
        for (let _i218 = 0; _i218 < _a217.length; _i218++) {
          const v_u = _a217[_i218];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g209++;
        }
      }
      L219: {
        const v_bo = _g209;
        let _c249: boolean = ((_h220 > 0) && (_h221 > 0));
        if (_c249) {
          let _c236: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
          if (_c236) {
            let _g222 = 0;
            G223: {
              const _a224 = sp.adj4[v_b];
              for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                const v_m = _a224[_i225];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                _g222++;
              }
            }
            _c236 = ((((2 - dot(sp, cl, v_b)) - _g222) - v_bo) >= hi(b, sp, cl, v_a));
          }
          let _c248: boolean = _c236;
          if (!_c248) {
            let _c247: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
            if (_c247) {
              let _g237 = 0;
              G238: {
                const _a239 = sp.adj4[v_b];
                for (let _i240 = 0; _i240 < _a239.length; _i240++) {
                  const v_m = _a239[_i240];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g237++;
                }
              }
              _g241.length = 0;
              G242: {
                const _a245 = sp.adj4[v_b];
                for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                  const v_m = _a245[_i246];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g241.push(v_m);
                }
              }
              _c247 = ((_h220 - ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g237)) + ((1 - dot(sp, cl, v_b)) * _g241.length))) >= hi(b, sp, cl, v_a));
            }
            _c248 = _c247;
          }
          _c249 = _c248;
        }
        if (!(_c249)) break L219;
        facts.length = 0;
        changed = false;
        let _q250 = true;
        Q251: {
          const _a252 = v_R;
          for (let _i253 = 0; _i253 < _a252.length; _i253++) {
            const v_u = _a252[_i253];
            const _t254 = (b.grid[v_a] || -1);
            const _t255 = (3 - _t254);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t255); changed = true; } else facts.push(PLACE, v_u, _t255); }
            if (!(true)) {
              _q250 = false;
              break Q251;
            }
          }
        }
        if (!(_q250)) return -1;
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
  const _g343: number[] = [];
  const _g355: number[] = [];
  const _g369: number[] = [];
  const _g384: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _a334 = sp.cells;
  for (let _i335 = 0; _i335 < _a334.length; _i335++) {
    const v_a = _a334[_i335];
    let _c340: boolean = (b.grid[v_a] !== 0);
    if (_c340) {
      let _g336 = 0;
      G337: {
        const _a338 = sp.adj4[v_a];
        for (let _i339 = 0; _i339 < _a338.length; _i339++) {
          const v_m = _a338[_i339];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g336++;
        }
      }
      _c340 = (((2 - dot(sp, cl, v_a)) - _g336) > 0);
    }
    if (!(_c340)) continue;
    const _a341 = within(sp, v_a, 2);
    for (let _i342 = 0; _i342 < _a341.length; _i342++) {
      const v_b = _a341[_i342];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g343.length = 0;
      G344: {
        const _a353 = open(b, sp, v_a);
        for (let _i354 = 0; _i354 < _a353.length; _i354++) {
          const v_u = _a353[_i354];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g343.push(v_u);
        }
      }
      const v_S = _g343;
      const _h390 = v_S.length;
      _g355.length = 0;
      G356: {
        const _a365 = open(b, sp, v_a);
        for (let _i366 = 0; _i366 < _a365.length; _i366++) {
          const v_u = _a365[_i366];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g355.push(v_u);
        }
      }
      const v_R = _g355;
      const _h392 = v_R.length;
      let _g367 = 0;
      G368: {
        _g369.length = 0;
        G370: {
          const _a373 = sp.adj4[v_b];
          for (let _i374 = 0; _i374 < _a373.length; _i374++) {
            const v_m = _a373[_i374];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g369.push(v_m);
          }
        }
        const _a375 = _g369;
        for (let _i376 = 0; _i376 < _a375.length; _i376++) {
          const v_u = _a375[_i376];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g367++;
        }
      }
      const v_bo = _g367;
      let _g377 = 0;
      G378: {
        for (let _i379 = 0; _i379 < 1; _i379++) {
          const v_k = v_b;
          if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
          _g377++;
        }
      }
      const v_alike = _g377;
      let _g380 = 0;
      G381: {
        const _a382 = sp.adj4[v_b];
        for (let _i383 = 0; _i383 < _a382.length; _i383++) {
          const v_m = _a382[_i383];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g380++;
        }
      }
      _g384.length = 0;
      G385: {
        const _a388 = sp.adj4[v_b];
        for (let _i389 = 0; _i389 < _a388.length; _i389++) {
          const v_m = _a388[_i389];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g384.push(v_m);
        }
      }
      L391: {
        const v_most = ((v_alike * ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g380)) + ((1 - dot(sp, cl, v_b)) * _g384.length))) + ((1 - v_alike) * ((_h390 - ((2 - dot(sp, cl, v_b)) - _g380)) + v_bo)));
        if (!(((((_h390 > 0) && (_h392 > 0)) && (v_most < _h390)) && ((lo(b, sp, cl, v_a) - v_most) >= _h392)))) break L391;
        facts.length = 0;
        changed = false;
        let _q397 = true;
        Q398: {
          const _a399 = v_R;
          for (let _i400 = 0; _i400 < _a399.length; _i400++) {
            const v_u = _a399[_i400];
            const _t401 = (b.grid[v_a] || -1);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t401); changed = true; } else facts.push(PLACE, v_u, _t401); }
            if (!(true)) {
              _q397 = false;
              break Q398;
            }
          }
        }
        if (!(_q397)) return -1;
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
    for (let _i20 = 0; _i20 < 1; _i20++) {
      const v_k = v_c;
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
  let _g58 = 0;
  G59: {
    const _a60 = sp.adj4[v_c];
    for (let _i61 = 0; _i61 < _a60.length; _i61++) {
      const v_m = _a60[_i61];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g58++;
    }
  }
  const _made = _g58;
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g189: number[] = [];
  G190: {
    const _a193 = sp.adj4[v_c];
    for (let _i194 = 0; _i194 < _a193.length; _i194++) {
      const v_m = _a193[_i194];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g189.push(v_m);
    }
  }
  const _made = _g189;
  _kept[v_c] = _made;
  return _made;
}

const hiKept = keptStore<number>();

/** `hi(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function hi(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = hiKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g226 = 0;
  G227: {
    const _a228 = sp.adj4[v_c];
    for (let _i229 = 0; _i229 < _a228.length; _i229++) {
      const v_m = _a228[_i229];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g226++;
    }
  }
  const _g230: number[] = [];
  G231: {
    const _a234 = sp.adj4[v_c];
    for (let _i235 = 0; _i235 < _a234.length; _i235++) {
      const v_m = _a234[_i235];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g230.push(v_m);
    }
  }
  const _made = ((dot(sp, cl, v_c) * ((2 - dot(sp, cl, v_c)) - _g226)) + ((1 - dot(sp, cl, v_c)) * _g230.length));
  _kept[v_c] = _made;
  return _made;
}

const loKept = keptStore<number>();

/** `lo(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lo(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = loKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g393 = 0;
  G394: {
    const _a395 = sp.adj4[v_c];
    for (let _i396 = 0; _i396 < _a395.length; _i396++) {
      const v_m = _a395[_i396];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g393++;
    }
  }
  const _made = ((2 - dot(sp, cl, v_c)) - _g393);
  _kept[v_c] = _made;
  return _made;
}
