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
  let _q440 = true;
  Q441: {
    const _a442 = cluesValued(cl.dot, -1);
    for (let _i443 = 0; _i443 < _a442.length; _i443++) {
      const v_c = _a442[_i443];
      const _h444 = clueAt(cl.dot, v_c);
      if (!((_h444 === -1))) continue;
      const _h450 = (g[v_c] || -1);
      let _g445 = 0;
      G446: {
        const _a447 = sp.adj4[v_c];
        for (let _i448 = 0; _i448 < _a447.length; _i448++) {
          const v_m = _a447[_i448];
          const _h449 = (g[v_m] || -1);
          if (!((_h449 === _h450))) continue;
          _g445++;
        }
      }
      if (!((_g445 >= 2))) {
        _q440 = false;
        break Q441;
      }
    }
  }
  if (!(_q440)) return false;
  for (let _k451 = 0; _k451 < cl.dot.at.length; _k451++) {
    const _at452 = cl.dot.at[_k451];
    const _v453 = cl.dot.v[_k451];
    let _c459: boolean = ((g[_at452] || -1) === _v453);
    if (_c459) {
      let _g454 = 0;
      G455: {
        const _a456 = sp.adj4[_at452];
        for (let _i457 = 0; _i457 < _a456.length; _i457++) {
          const v_m = _a456[_i457];
          const _h458 = (g[v_m] || -1);
          if (!((_h458 === _v453))) continue;
          _g454++;
        }
      }
      _c459 = (_g454 === 1);
    }
    if (!(_c459)) return false;
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
      const _h65 = (3 - v_d);
      const _h66 = _h65;
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
            let _c64: boolean = ((_h52 || (v_e !== v_d)) && ((v_r < 1) || ((dot(sp, cl, v_n) === 0) && (v_r < 2))));
            if (!_c64) {
              let _c63: boolean = ((_h53 && (v_e === v_d)) && (dot(sp, cl, v_n) === 1));
              if (_c63) {
                let _g59 = 0;
                G60: {
                  const _a61 = sp.adj4[v_n];
                  for (let _i62 = 0; _i62 < _a61.length; _i62++) {
                    const v_m = _a61[_i62];
                    if (!(((b.grid[v_m] || -1) === (b.grid[v_n] || -1)))) continue;
                    _g59++;
                  }
                }
                _c63 = (_g59 >= 1);
              }
              _c64 = _c63;
            }
            if (!(_c64)) break L58;
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _h66); changed = true; } else facts.push(PLACE, v_x, _h66); }
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
  const _g192: number[] = [];
  const _g200: number[] = [];
  const _g210: number[] = [];
  const _g220: number[] = [];
  const _g239: number[] = [];
  const _g250: number[] = [];
  const _g260: number[] = [];
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _a167 = sp.cells;
  for (let _i168 = 0; _i168 < _a167.length; _i168++) {
    const v_a = _a167[_i168];
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
      _c179 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g169)) + ((1 - dot(sp, cl, v_a)) * _g173.length)) > 0);
    }
    if (!(_c179)) continue;
    const _a180 = within(sp, v_a, 2);
    for (let _i181 = 0; _i181 < _a180.length; _i181++) {
      const v_b = _a180[_i181];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g182.length = 0;
      G183: {
        _g192.length = 0;
        G193: {
          const _a196 = sp.adj4[v_a];
          for (let _i197 = 0; _i197 < _a196.length; _i197++) {
            const v_m = _a196[_i197];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g192.push(v_m);
          }
        }
        const _a198 = _g192;
        for (let _i199 = 0; _i199 < _a198.length; _i199++) {
          const v_u = _a198[_i199];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g182.push(v_u);
        }
      }
      const v_S = _g182;
      const _h229 = v_S.length;
      _g200.length = 0;
      G201: {
        _g210.length = 0;
        G211: {
          const _a214 = sp.adj4[v_a];
          for (let _i215 = 0; _i215 < _a214.length; _i215++) {
            const v_m = _a214[_i215];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g210.push(v_m);
          }
        }
        const _a216 = _g210;
        for (let _i217 = 0; _i217 < _a216.length; _i217++) {
          const v_u = _a216[_i217];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g200.push(v_u);
        }
      }
      const v_R = _g200;
      const _h230 = v_R.length;
      let _g218 = 0;
      G219: {
        _g220.length = 0;
        G221: {
          const _a224 = sp.adj4[v_b];
          for (let _i225 = 0; _i225 < _a224.length; _i225++) {
            const v_m = _a224[_i225];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g220.push(v_m);
          }
        }
        const _a226 = _g220;
        for (let _i227 = 0; _i227 < _a226.length; _i227++) {
          const v_u = _a226[_i227];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g218++;
        }
      }
      L228: {
        const v_bo = _g218;
        let _c268: boolean = ((_h229 > 0) && (_h230 > 0));
        if (_c268) {
          let _c245: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
          if (_c245) {
            let _g231 = 0;
            G232: {
              const _a233 = sp.adj4[v_b];
              for (let _i234 = 0; _i234 < _a233.length; _i234++) {
                const v_m = _a233[_i234];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                _g231++;
              }
            }
            let _g235 = 0;
            G236: {
              const _a237 = sp.adj4[v_a];
              for (let _i238 = 0; _i238 < _a237.length; _i238++) {
                const v_m = _a237[_i238];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g235++;
              }
            }
            _g239.length = 0;
            G240: {
              const _a243 = sp.adj4[v_a];
              for (let _i244 = 0; _i244 < _a243.length; _i244++) {
                const v_m = _a243[_i244];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g239.push(v_m);
              }
            }
            _c245 = ((((2 - dot(sp, cl, v_b)) - _g231) - v_bo) >= ((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g235)) + ((1 - dot(sp, cl, v_a)) * _g239.length)));
          }
          let _c267: boolean = _c245;
          if (!_c267) {
            let _c266: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
            if (_c266) {
              let _g246 = 0;
              G247: {
                const _a248 = sp.adj4[v_b];
                for (let _i249 = 0; _i249 < _a248.length; _i249++) {
                  const v_m = _a248[_i249];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g246++;
                }
              }
              _g250.length = 0;
              G251: {
                const _a254 = sp.adj4[v_b];
                for (let _i255 = 0; _i255 < _a254.length; _i255++) {
                  const v_m = _a254[_i255];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g250.push(v_m);
                }
              }
              let _g256 = 0;
              G257: {
                const _a258 = sp.adj4[v_a];
                for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                  const v_m = _a258[_i259];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                  _g256++;
                }
              }
              _g260.length = 0;
              G261: {
                const _a264 = sp.adj4[v_a];
                for (let _i265 = 0; _i265 < _a264.length; _i265++) {
                  const v_m = _a264[_i265];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g260.push(v_m);
                }
              }
              _c266 = ((_h229 - ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g246)) + ((1 - dot(sp, cl, v_b)) * _g250.length))) >= ((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g256)) + ((1 - dot(sp, cl, v_a)) * _g260.length)));
            }
            _c267 = _c266;
          }
          _c268 = _c267;
        }
        if (!(_c268)) break L228;
        facts.length = 0;
        changed = false;
        let _q269 = true;
        Q270: {
          const _a271 = v_R;
          for (let _i272 = 0; _i272 < _a271.length; _i272++) {
            const v_u = _a271[_i272];
            const _t273 = (b.grid[v_a] || -1);
            const _t274 = (3 - _t273);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t274); changed = true; } else facts.push(PLACE, v_u, _t274); }
            if (!(true)) {
              _q269 = false;
              break Q270;
            }
          }
        }
        if (!(_q269)) return -1;
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
  const _g363: number[] = [];
  const _g373: number[] = [];
  const _g381: number[] = [];
  const _g391: number[] = [];
  const _g401: number[] = [];
  const _g417: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _a354 = sp.cells;
  for (let _i355 = 0; _i355 < _a354.length; _i355++) {
    const v_a = _a354[_i355];
    let _c360: boolean = (b.grid[v_a] !== 0);
    if (_c360) {
      let _g356 = 0;
      G357: {
        const _a358 = sp.adj4[v_a];
        for (let _i359 = 0; _i359 < _a358.length; _i359++) {
          const v_m = _a358[_i359];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g356++;
        }
      }
      _c360 = (((2 - dot(sp, cl, v_a)) - _g356) > 0);
    }
    if (!(_c360)) continue;
    const _a361 = within(sp, v_a, 2);
    for (let _i362 = 0; _i362 < _a361.length; _i362++) {
      const v_b = _a361[_i362];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g363.length = 0;
      G364: {
        _g373.length = 0;
        G374: {
          const _a377 = sp.adj4[v_a];
          for (let _i378 = 0; _i378 < _a377.length; _i378++) {
            const v_m = _a377[_i378];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g373.push(v_m);
          }
        }
        const _a379 = _g373;
        for (let _i380 = 0; _i380 < _a379.length; _i380++) {
          const v_u = _a379[_i380];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g363.push(v_u);
        }
      }
      const v_S = _g363;
      const _h423 = v_S.length;
      _g381.length = 0;
      G382: {
        _g391.length = 0;
        G392: {
          const _a395 = sp.adj4[v_a];
          for (let _i396 = 0; _i396 < _a395.length; _i396++) {
            const v_m = _a395[_i396];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g391.push(v_m);
          }
        }
        const _a397 = _g391;
        for (let _i398 = 0; _i398 < _a397.length; _i398++) {
          const v_u = _a397[_i398];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g381.push(v_u);
        }
      }
      const v_R = _g381;
      const _h429 = v_R.length;
      let _g399 = 0;
      G400: {
        _g401.length = 0;
        G402: {
          const _a405 = sp.adj4[v_b];
          for (let _i406 = 0; _i406 < _a405.length; _i406++) {
            const v_m = _a405[_i406];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g401.push(v_m);
          }
        }
        const _a407 = _g401;
        for (let _i408 = 0; _i408 < _a407.length; _i408++) {
          const v_u = _a407[_i408];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g399++;
        }
      }
      const v_bo = _g399;
      let _g409 = 0;
      G410: {
        const _a411 = setOf(v_b);
        for (let _i412 = 0; _i412 < _a411.length; _i412++) {
          const v_k = _a411[_i412];
          if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
          _g409++;
        }
      }
      const v_alike = _g409;
      let _g413 = 0;
      G414: {
        const _a415 = sp.adj4[v_b];
        for (let _i416 = 0; _i416 < _a415.length; _i416++) {
          const v_m = _a415[_i416];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g413++;
        }
      }
      _g417.length = 0;
      G418: {
        const _a421 = sp.adj4[v_b];
        for (let _i422 = 0; _i422 < _a421.length; _i422++) {
          const v_m = _a421[_i422];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g417.push(v_m);
        }
      }
      let _g424 = 0;
      G425: {
        const _a426 = sp.adj4[v_b];
        for (let _i427 = 0; _i427 < _a426.length; _i427++) {
          const v_m = _a426[_i427];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g424++;
        }
      }
      L428: {
        const v_most = ((v_alike * ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g413)) + ((1 - dot(sp, cl, v_b)) * _g417.length))) + ((1 - v_alike) * ((_h423 - ((2 - dot(sp, cl, v_b)) - _g424)) + v_bo)));
        let _c434: boolean = (((_h423 > 0) && (_h429 > 0)) && (v_most < _h423));
        if (_c434) {
          let _g430 = 0;
          G431: {
            const _a432 = sp.adj4[v_a];
            for (let _i433 = 0; _i433 < _a432.length; _i433++) {
              const v_m = _a432[_i433];
              if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
              _g430++;
            }
          }
          _c434 = ((((2 - dot(sp, cl, v_a)) - _g430) - v_most) >= _h429);
        }
        if (!(_c434)) break L428;
        facts.length = 0;
        changed = false;
        let _q435 = true;
        Q436: {
          const _a437 = v_R;
          for (let _i438 = 0; _i438 < _a437.length; _i438++) {
            const v_u = _a437[_i438];
            const _t439 = (b.grid[v_a] || -1);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t439); changed = true; } else facts.push(PLACE, v_u, _t439); }
            if (!(true)) {
              _q435 = false;
              break Q436;
            }
          }
        }
        if (!(_q435)) return -1;
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
