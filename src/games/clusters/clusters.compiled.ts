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
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q422 = true;
  Q423: {
    const _a424 = cluesValued(cl.dot, -1);
    for (let _i425 = 0; _i425 < _a424.length; _i425++) {
      const v_c = _a424[_i425];
      const _h426 = clueAt(cl.dot, v_c);
      if (!((_h426 === -1))) continue;
      const _h432 = (g[v_c] || -1);
      let _g427 = 0;
      G428: {
        const _a429 = sp.adj4[v_c];
        for (let _i430 = 0; _i430 < _a429.length; _i430++) {
          const v_m = _a429[_i430];
          const _h431 = (g[v_m] || -1);
          if (!((_h431 === _h432))) continue;
          _g427++;
        }
      }
      if (!((_g427 >= 2))) {
        _q422 = false;
        break Q423;
      }
    }
  }
  if (!(_q422)) return false;
  for (let _k433 = 0; _k433 < cl.dot.at.length; _k433++) {
    const _at434 = cl.dot.at[_k433];
    const _v435 = cl.dot.v[_k433];
    let _c441: boolean = ((g[_at434] || -1) === _v435);
    if (_c441) {
      let _g436 = 0;
      G437: {
        const _a438 = sp.adj4[_at434];
        for (let _i439 = 0; _i439 < _a438.length; _i439++) {
          const v_m = _a438[_i439];
          const _h440 = (g[v_m] || -1);
          if (!((_h440 === _v435))) continue;
          _g436++;
        }
      }
      _c441 = (_g436 === 1);
    }
    if (!(_c441)) return false;
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
  const _k21 = dotKept.board(cl);
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
    let _c28: boolean = ((v_r >= 1) && (((_k21[v_c] ?? dot(sp, cl, v_c)) === 1) || (v_r >= 2)));
    if (_c28) {
      let _c27: boolean = ((_k21[v_c] ?? dot(sp, cl, v_c)) === 0);
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
  const _k59 = dotKept.board(cl);
  const _a46 = sp.cells;
  R1:
  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
    const v_x = _a46[_i47];
    const _m22_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    for (let _m48 = b.domain; _m48 !== 0; _m48 &= _m48 - 1) {
      const v_d = 31 - Math.clz32(_m48 & -_m48);
      const _h64 = (3 - v_d);
      const _h65 = _h64;
      const _a49 = union(setOf(v_x), sp.adj4[v_x]);
      R3:
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
            if (!((((_h52 || (v_e !== v_d)) && ((v_r < 1) || (((_k59[v_n] ?? dot(sp, cl, v_n)) === 0) && (v_r < 2)))) || (((_h53 && (v_e === v_d)) && ((_k59[v_n] ?? dot(sp, cl, v_n)) === 1)) && (same(b, sp, v_n) >= 1))))) break L58;
            if (b.made[0] !== _m22_0) {
              if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
              if (!(((v_n === v_x) || (b.grid[v_n] !== 0)))) { continue R3; }
            }
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _h65); changed = true; } else facts.push(PLACE, v_x, _h65); }
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
  const _g173: number[] = [];
  const _g182: number[] = [];
  const _g200: number[] = [];
  const _g214: number[] = [];
  const _g244: number[] = [];
  const _g257: number[] = [];
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _k168 = dotKept.board(cl);
  const _a166 = sp.cells;
  R1:
  for (let _i167 = 0; _i167 < _a166.length; _i167++) {
    const v_a = _a166[_i167];
    const _m49_0 = b.made[0];
    let _c179: boolean = (b.grid[v_a] !== 0);
    if (_c179) {
      let _g169 = 0;
      G170: {
        const _a171 = sp.adj4[v_a];
        for (let _i172 = 0; _i172 < _a171.length; _i172++) {
          const v_m = _a171[_i172];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g169++;
        }
      }
      _g173.length = 0;
      G174: {
        const _a177 = sp.adj4[v_a];
        for (let _i178 = 0; _i178 < _a177.length; _i178++) {
          const v_m = _a177[_i178];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g173.push(v_m);
        }
      }
      _c179 = ((((_k168[v_a] ?? dot(sp, cl, v_a)) * ((2 - (_k168[v_a] ?? dot(sp, cl, v_a))) - _g169)) + ((1 - (_k168[v_a] ?? dot(sp, cl, v_a))) * _g173.length)) > 0);
    }
    if (!(_c179)) continue;
    const _a180 = within(sp, v_a, 2);
    for (let _i181 = 0; _i181 < _a180.length; _i181++) {
      const v_b = _a180[_i181];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g182.length = 0;
      G183: {
        const _a198 = open(b, sp, v_a);
        for (let _i199 = 0; _i199 < _a198.length; _i199++) {
          const v_u = _a198[_i199];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g182.push(v_u);
        }
      }
      const v_S = _g182;
      const _h223 = v_S.length;
      _g200.length = 0;
      G201: {
        const _a210 = open(b, sp, v_a);
        for (let _i211 = 0; _i211 < _a210.length; _i211++) {
          const v_u = _a210[_i211];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g200.push(v_u);
        }
      }
      const v_R = _g200;
      const _h224 = v_R.length;
      let _g212 = 0;
      G213: {
        _g214.length = 0;
        G215: {
          const _a218 = sp.adj4[v_b];
          for (let _i219 = 0; _i219 < _a218.length; _i219++) {
            const v_m = _a218[_i219];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g214.push(v_m);
          }
        }
        const _a220 = _g214;
        for (let _i221 = 0; _i221 < _a220.length; _i221++) {
          const v_u = _a220[_i221];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g212++;
        }
      }
      L222: {
        const v_bo = _g212;
        let _c252: boolean = ((_h223 > 0) && (_h224 > 0));
        if (_c252) {
          let _c239: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
          if (_c239) {
            let _g225 = 0;
            G226: {
              const _a227 = sp.adj4[v_b];
              for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                const v_m = _a227[_i228];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                _g225++;
              }
            }
            _c239 = ((((2 - (_k168[v_b] ?? dot(sp, cl, v_b))) - _g225) - v_bo) >= hi(b, sp, cl, v_a));
          }
          let _c251: boolean = _c239;
          if (!_c251) {
            let _c250: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
            if (_c250) {
              let _g240 = 0;
              G241: {
                const _a242 = sp.adj4[v_b];
                for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                  const v_m = _a242[_i243];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g240++;
                }
              }
              _g244.length = 0;
              G245: {
                const _a248 = sp.adj4[v_b];
                for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                  const v_m = _a248[_i249];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g244.push(v_m);
                }
              }
              _c250 = ((_h223 - (((_k168[v_b] ?? dot(sp, cl, v_b)) * ((2 - (_k168[v_b] ?? dot(sp, cl, v_b))) - _g240)) + ((1 - (_k168[v_b] ?? dot(sp, cl, v_b))) * _g244.length))) >= hi(b, sp, cl, v_a));
            }
            _c251 = _c250;
          }
          _c252 = _c251;
        }
        if (!(_c252)) break L222;
        if (b.made[0] !== _m49_0) {
          let _c263: boolean = (b.grid[v_a] !== 0);
          if (_c263) {
            let _g253 = 0;
            G254: {
              const _a255 = sp.adj4[v_a];
              for (let _i256 = 0; _i256 < _a255.length; _i256++) {
                const v_m = _a255[_i256];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g253++;
              }
            }
            _g257.length = 0;
            G258: {
              const _a261 = sp.adj4[v_a];
              for (let _i262 = 0; _i262 < _a261.length; _i262++) {
                const v_m = _a261[_i262];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g257.push(v_m);
              }
            }
            _c263 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g253)) + ((1 - dot(sp, cl, v_a)) * _g257.length)) > 0);
          }
          if (!(_c263)) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _q264 = true;
        Q265: {
          const _a266 = v_R;
          for (let _i267 = 0; _i267 < _a266.length; _i267++) {
            const v_u = _a266[_i267];
            const _t268 = (b.grid[v_a] || -1);
            const _t269 = (3 - _t268);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t269); changed = true; } else facts.push(PLACE, v_u, _t269); }
            if (!(true)) {
              _q264 = false;
              break Q265;
            }
          }
        }
        if (!(_q264)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, S: v_S.slice(), R: v_R.slice(), bo: v_bo }, facts)) return 1;
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
  const _g358: number[] = [];
  const _g370: number[] = [];
  const _g384: number[] = [];
  const _g399: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _k350 = dotKept.board(cl);
  const _a348 = sp.cells;
  R1:
  for (let _i349 = 0; _i349 < _a348.length; _i349++) {
    const v_a = _a348[_i349];
    const _m93_0 = b.made[0];
    let _c355: boolean = (b.grid[v_a] !== 0);
    if (_c355) {
      let _g351 = 0;
      G352: {
        const _a353 = sp.adj4[v_a];
        for (let _i354 = 0; _i354 < _a353.length; _i354++) {
          const v_m = _a353[_i354];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g351++;
        }
      }
      _c355 = (((2 - (_k350[v_a] ?? dot(sp, cl, v_a))) - _g351) > 0);
    }
    if (!(_c355)) continue;
    const _a356 = within(sp, v_a, 2);
    for (let _i357 = 0; _i357 < _a356.length; _i357++) {
      const v_b = _a356[_i357];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g358.length = 0;
      G359: {
        const _a368 = open(b, sp, v_a);
        for (let _i369 = 0; _i369 < _a368.length; _i369++) {
          const v_u = _a368[_i369];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g358.push(v_u);
        }
      }
      const v_S = _g358;
      const _h405 = v_S.length;
      _g370.length = 0;
      G371: {
        const _a380 = open(b, sp, v_a);
        for (let _i381 = 0; _i381 < _a380.length; _i381++) {
          const v_u = _a380[_i381];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g370.push(v_u);
        }
      }
      const v_R = _g370;
      const _h407 = v_R.length;
      let _g382 = 0;
      G383: {
        _g384.length = 0;
        G385: {
          const _a388 = sp.adj4[v_b];
          for (let _i389 = 0; _i389 < _a388.length; _i389++) {
            const v_m = _a388[_i389];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g384.push(v_m);
          }
        }
        const _a390 = _g384;
        for (let _i391 = 0; _i391 < _a390.length; _i391++) {
          const v_u = _a390[_i391];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g382++;
        }
      }
      const v_bo = _g382;
      let _g392 = 0;
      G393: {
        for (let _i394 = 0; _i394 < 1; _i394++) {
          const v_k = v_b;
          if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
          _g392++;
        }
      }
      const v_alike = _g392;
      let _g395 = 0;
      G396: {
        const _a397 = sp.adj4[v_b];
        for (let _i398 = 0; _i398 < _a397.length; _i398++) {
          const v_m = _a397[_i398];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g395++;
        }
      }
      _g399.length = 0;
      G400: {
        const _a403 = sp.adj4[v_b];
        for (let _i404 = 0; _i404 < _a403.length; _i404++) {
          const v_m = _a403[_i404];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g399.push(v_m);
        }
      }
      L406: {
        const v_most = ((v_alike * (((_k350[v_b] ?? dot(sp, cl, v_b)) * ((2 - (_k350[v_b] ?? dot(sp, cl, v_b))) - _g395)) + ((1 - (_k350[v_b] ?? dot(sp, cl, v_b))) * _g399.length))) + ((1 - v_alike) * ((_h405 - ((2 - (_k350[v_b] ?? dot(sp, cl, v_b))) - _g395)) + v_bo)));
        if (!(((((_h405 > 0) && (_h407 > 0)) && (v_most < _h405)) && ((lo(b, sp, cl, v_a) - v_most) >= _h407)))) break L406;
        if (b.made[0] !== _m93_0) {
          let _c416: boolean = (b.grid[v_a] !== 0);
          if (_c416) {
            let _g412 = 0;
            G413: {
              const _a414 = sp.adj4[v_a];
              for (let _i415 = 0; _i415 < _a414.length; _i415++) {
                const v_m = _a414[_i415];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g412++;
              }
            }
            _c416 = (((2 - dot(sp, cl, v_a)) - _g412) > 0);
          }
          if (!(_c416)) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _q417 = true;
        Q418: {
          const _a419 = v_R;
          for (let _i420 = 0; _i420 < _a419.length; _i420++) {
            const v_u = _a419[_i420];
            const _t421 = (b.grid[v_a] || -1);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t421); changed = true; } else facts.push(PLACE, v_u, _t421); }
            if (!(true)) {
              _q417 = false;
              break Q418;
            }
          }
        }
        if (!(_q417)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, S: v_S.slice(), R: v_R.slice(), bo: v_bo, alike: v_alike, most: v_most }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

const dotKept = keptStore<number>();
let dotOn: object | null = null;
let dotAt: Kept<number> = [];

/** `dot(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function dot(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== dotOn) {
    dotAt = dotKept.board(cl);
    dotOn = cl;
  }
  const _kept: Kept<number> = dotAt;
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
  let _g60 = 0;
  G61: {
    const _a62 = sp.adj4[v_c];
    for (let _i63 = 0; _i63 < _a62.length; _i63++) {
      const v_m = _a62[_i63];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g60++;
    }
  }
  const _made = _g60;
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g192: number[] = [];
  G193: {
    const _a196 = sp.adj4[v_c];
    for (let _i197 = 0; _i197 < _a196.length; _i197++) {
      const v_m = _a196[_i197];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g192.push(v_m);
    }
  }
  const _made = _g192;
  _kept[v_c] = _made;
  return _made;
}

const hiKept = keptStore<number>();

/** `hi(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function hi(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = hiKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g229 = 0;
  G230: {
    const _a231 = sp.adj4[v_c];
    for (let _i232 = 0; _i232 < _a231.length; _i232++) {
      const v_m = _a231[_i232];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g229++;
    }
  }
  const _g233: number[] = [];
  G234: {
    const _a237 = sp.adj4[v_c];
    for (let _i238 = 0; _i238 < _a237.length; _i238++) {
      const v_m = _a237[_i238];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g233.push(v_m);
    }
  }
  const _made = ((dot(sp, cl, v_c) * ((2 - dot(sp, cl, v_c)) - _g229)) + ((1 - dot(sp, cl, v_c)) * _g233.length));
  _kept[v_c] = _made;
  return _made;
}

const loKept = keptStore<number>();

/** `lo(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lo(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = loKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g408 = 0;
  G409: {
    const _a410 = sp.adj4[v_c];
    for (let _i411 = 0; _i411 < _a410.length; _i411++) {
      const v_m = _a410[_i411];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g408++;
    }
  }
  const _made = ((2 - dot(sp, cl, v_c)) - _g408);
  _kept[v_c] = _made;
  return _made;
}
