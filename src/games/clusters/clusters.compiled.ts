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
  let _q406 = true;
  Q407: {
    const _a408 = cluesValued(cl.dot, -1);
    for (let _i409 = 0; _i409 < _a408.length; _i409++) {
      const v_c = _a408[_i409];
      const _h410 = clueAt(cl.dot, v_c);
      if (!((_h410 === -1))) continue;
      const _h416 = (g[v_c] || -1);
      let _g411 = 0;
      G412: {
        const _a413 = sp.adj4[v_c];
        for (let _i414 = 0; _i414 < _a413.length; _i414++) {
          const v_m = _a413[_i414];
          const _h415 = (g[v_m] || -1);
          if (!((_h415 === _h416))) continue;
          _g411++;
        }
      }
      if (!((_g411 >= 2))) {
        _q406 = false;
        break Q407;
      }
    }
  }
  if (!(_q406)) return false;
  for (let _k417 = 0; _k417 < cl.dot.at.length; _k417++) {
    const _at418 = cl.dot.at[_k417];
    const _v419 = cl.dot.v[_k417];
    let _c425: boolean = ((g[_at418] || -1) === _v419);
    if (_c425) {
      let _g420 = 0;
      G421: {
        const _a422 = sp.adj4[_at418];
        for (let _i423 = 0; _i423 < _a422.length; _i423++) {
          const v_m = _a422[_i423];
          const _h424 = (g[v_m] || -1);
          if (!((_h424 === _v419))) continue;
          _g420++;
        }
      }
      _c425 = (_g420 === 1);
    }
    if (!(_c425)) return false;
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
  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
    const v_x = _a46[_i47];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    for (let _m48 = b.domain; _m48 !== 0; _m48 &= _m48 - 1) {
      const v_d = 31 - Math.clz32(_m48 & -_m48);
      const _h64 = (3 - v_d);
      const _h65 = _h64;
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
            if (!((((_h52 || (v_e !== v_d)) && ((v_r < 1) || (((_k59[v_n] ?? dot(sp, cl, v_n)) === 0) && (v_r < 2)))) || (((_h53 && (v_e === v_d)) && ((_k59[v_n] ?? dot(sp, cl, v_n)) === 1)) && (same(b, sp, v_n) >= 1))))) break L58;
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
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _k168 = dotKept.board(cl);
  const _a166 = sp.cells;
  for (let _i167 = 0; _i167 < _a166.length; _i167++) {
    const v_a = _a166[_i167];
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
        facts.length = 0;
        changed = false;
        let _q253 = true;
        Q254: {
          const _a255 = v_R;
          for (let _i256 = 0; _i256 < _a255.length; _i256++) {
            const v_u = _a255[_i256];
            const _t257 = (b.grid[v_a] || -1);
            const _t258 = (3 - _t257);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t258); changed = true; } else facts.push(PLACE, v_u, _t258); }
            if (!(true)) {
              _q253 = false;
              break Q254;
            }
          }
        }
        if (!(_q253)) return -1;
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
  const _g347: number[] = [];
  const _g359: number[] = [];
  const _g373: number[] = [];
  const _g388: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _k339 = dotKept.board(cl);
  const _a337 = sp.cells;
  for (let _i338 = 0; _i338 < _a337.length; _i338++) {
    const v_a = _a337[_i338];
    let _c344: boolean = (b.grid[v_a] !== 0);
    if (_c344) {
      let _g340 = 0;
      G341: {
        const _a342 = sp.adj4[v_a];
        for (let _i343 = 0; _i343 < _a342.length; _i343++) {
          const v_m = _a342[_i343];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g340++;
        }
      }
      _c344 = (((2 - (_k339[v_a] ?? dot(sp, cl, v_a))) - _g340) > 0);
    }
    if (!(_c344)) continue;
    const _a345 = within(sp, v_a, 2);
    for (let _i346 = 0; _i346 < _a345.length; _i346++) {
      const v_b = _a345[_i346];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g347.length = 0;
      G348: {
        const _a357 = open(b, sp, v_a);
        for (let _i358 = 0; _i358 < _a357.length; _i358++) {
          const v_u = _a357[_i358];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g347.push(v_u);
        }
      }
      const v_S = _g347;
      const _h394 = v_S.length;
      _g359.length = 0;
      G360: {
        const _a369 = open(b, sp, v_a);
        for (let _i370 = 0; _i370 < _a369.length; _i370++) {
          const v_u = _a369[_i370];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g359.push(v_u);
        }
      }
      const v_R = _g359;
      const _h396 = v_R.length;
      let _g371 = 0;
      G372: {
        _g373.length = 0;
        G374: {
          const _a377 = sp.adj4[v_b];
          for (let _i378 = 0; _i378 < _a377.length; _i378++) {
            const v_m = _a377[_i378];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g373.push(v_m);
          }
        }
        const _a379 = _g373;
        for (let _i380 = 0; _i380 < _a379.length; _i380++) {
          const v_u = _a379[_i380];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g371++;
        }
      }
      const v_bo = _g371;
      let _g381 = 0;
      G382: {
        for (let _i383 = 0; _i383 < 1; _i383++) {
          const v_k = v_b;
          if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
          _g381++;
        }
      }
      const v_alike = _g381;
      let _g384 = 0;
      G385: {
        const _a386 = sp.adj4[v_b];
        for (let _i387 = 0; _i387 < _a386.length; _i387++) {
          const v_m = _a386[_i387];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g384++;
        }
      }
      _g388.length = 0;
      G389: {
        const _a392 = sp.adj4[v_b];
        for (let _i393 = 0; _i393 < _a392.length; _i393++) {
          const v_m = _a392[_i393];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g388.push(v_m);
        }
      }
      L395: {
        const v_most = ((v_alike * (((_k339[v_b] ?? dot(sp, cl, v_b)) * ((2 - (_k339[v_b] ?? dot(sp, cl, v_b))) - _g384)) + ((1 - (_k339[v_b] ?? dot(sp, cl, v_b))) * _g388.length))) + ((1 - v_alike) * ((_h394 - ((2 - (_k339[v_b] ?? dot(sp, cl, v_b))) - _g384)) + v_bo)));
        if (!(((((_h394 > 0) && (_h396 > 0)) && (v_most < _h394)) && ((lo(b, sp, cl, v_a) - v_most) >= _h396)))) break L395;
        facts.length = 0;
        changed = false;
        let _q401 = true;
        Q402: {
          const _a403 = v_R;
          for (let _i404 = 0; _i404 < _a403.length; _i404++) {
            const v_u = _a403[_i404];
            const _t405 = (b.grid[v_a] || -1);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t405); changed = true; } else facts.push(PLACE, v_u, _t405); }
            if (!(true)) {
              _q401 = false;
              break Q402;
            }
          }
        }
        if (!(_q401)) return -1;
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
  let _g397 = 0;
  G398: {
    const _a399 = sp.adj4[v_c];
    for (let _i400 = 0; _i400 < _a399.length; _i400++) {
      const v_m = _a399[_i400];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g397++;
    }
  }
  const _made = ((2 - dot(sp, cl, v_c)) - _g397);
  _kept[v_c] = _made;
  return _made;
}
