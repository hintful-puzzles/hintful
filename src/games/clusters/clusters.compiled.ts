// Compiled by `npm run describe` from src/games/clusters/clusters.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, rangeMask, setOf, union, within } from "../../engine/describe-runtime.ts";

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
  let _q642 = true;
  Q643: {
    const _a644 = sp.cells;
    for (let _i645 = 0; _i645 < _a644.length; _i645++) {
      const v_c = _a644[_i645];
      if (!((clueAt(cl.dot, v_c) === -1))) continue;
      let _g646 = 0;
      G647: {
        const _a648 = sp.adj4[v_c];
        for (let _i649 = 0; _i649 < _a648.length; _i649++) {
          const v_m = _a648[_i649];
          if (!(((g[v_m] || -1) === (g[v_c] || -1)))) continue;
          _g646++;
        }
      }
      if (!((_g646 >= 2))) {
        _q642 = false;
        break Q643;
      }
    }
  }
  if (!(_q642)) return false;
  for (let _k650 = 0; _k650 < cl.dot.at.length; _k650++) {
    const _at651 = cl.dot.at[_k650];
    const _v652 = cl.dot.v[_k650];
    let _c657: boolean = ((g[_at651] || -1) === _v652);
    if (_c657) {
      let _g653 = 0;
      G654: {
        const _a655 = sp.adj4[_at651];
        for (let _i656 = 0; _i656 < _a655.length; _i656++) {
          const v_m = _a655[_i656];
          if (!(((g[v_m] || -1) === _v652))) continue;
          _g653++;
        }
      }
      _c657 = (_g653 === 1);
    }
    if (!(_c657)) return false;
  }
  return true;
}

export interface BrokenBinding {
  c: number;
  r: number;
}

const brokenFacts: number[] = [];

export function broken(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BrokenBinding> | null): number {
  const facts = brokenFacts;
  let fired = 0;
  let changed = false;
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    const _h10 = b.known(v_c);
    if (!(_h10)) continue;
    const _h11 = b.value(v_c);
    let _g12 = 0;
    G13: {
      const _a14 = sp.adj4[v_c];
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_m = _a14[_i15];
        const _h16 = b.known(v_m);
        const _h17 = b.value(v_m);
        if (!(((v_m !== v_c) && (!(_h16) || (_h17 === _h11))))) continue;
        _g12++;
      }
    }
    const v_r = _g12;
    facts.length = 0;
    changed = false;
    let _c23: boolean = (v_r >= 1);
    if (_c23) {
      let _g18 = 0;
      G19: {
        const _a20 = setOf(v_c);
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_k = _a20[_i21];
          const _h22 = clueAt(cl.dot, v_k);
          if (!((_h22 !== -1))) continue;
          _g18++;
        }
      }
      _c23 = ((_g18 === 1) || (v_r >= 2));
    }
    let _c35: boolean = _c23;
    if (_c35) {
      let _g24 = 0;
      G25: {
        const _a26 = setOf(v_c);
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_k = _a26[_i27];
          const _h28 = clueAt(cl.dot, v_k);
          if (!((_h28 !== -1))) continue;
          _g24++;
        }
      }
      let _c34: boolean = (_g24 === 0);
      if (!_c34) {
        let _g29 = 0;
        G30: {
          const _a31 = sp.adj4[v_c];
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_m = _a31[_i32];
            const _h33 = b.value(v_m);
            if (!((_h33 === _h11))) continue;
            _g29++;
          }
        }
        _c34 = (_g29 <= 1);
      }
      _c35 = _c34;
    }
    if (!(_c35)) return -1;
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

export function refute(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RefuteBinding> | null): number {
  const facts = refuteFacts;
  let fired = 0;
  let changed = false;
  const _a64 = sp.cells;
  for (let _i65 = 0; _i65 < _a64.length; _i65++) {
    const v_x = _a64[_i65];
    if (!(!(b.known(v_x)))) continue;
    for (let _m66 = b.domain; _m66 !== 0; _m66 &= _m66 - 1) {
      const v_d = 31 - Math.clz32(_m66 & -_m66);
      const _h96 = (3 - v_d);
      const _h97 = _h96;
      const _a67 = union(setOf(v_x), sp.adj4[v_x]);
      for (let _i68 = 0; _i68 < _a67.length; _i68++) {
        const v_n = _a67[_i68];
        if (!(((v_n === v_x) || b.known(v_n)))) continue;
        const _h70 = (v_n === v_x);
        const _h71 = (v_n !== v_x);
        for (let _m69 = b.domain; _m69 !== 0; _m69 &= _m69 - 1) {
          const v_e = 31 - Math.clz32(_m69 & -_m69);
          if (!(((_h70 && (v_e === v_d)) || (_h71 && (v_e === b.value(v_n)))))) continue;
          let _g72 = 0;
          G73: {
            const _a74 = sp.adj4[v_n];
            for (let _i75 = 0; _i75 < _a74.length; _i75++) {
              const v_m = _a74[_i75];
              if (!(((v_m !== v_x) && (!(b.known(v_m)) || (b.value(v_m) === v_e))))) continue;
              _g72++;
            }
          }
          L76: {
            const v_r = _g72;
            let _c83: boolean = (_h70 || (v_e !== v_d));
            if (_c83) {
              let _c82: boolean = (v_r < 1);
              if (!_c82) {
                let _g77 = 0;
                G78: {
                  const _a79 = setOf(v_n);
                  for (let _i80 = 0; _i80 < _a79.length; _i80++) {
                    const v_k = _a79[_i80];
                    const _h81 = clueAt(cl.dot, v_k);
                    if (!((_h81 !== -1))) continue;
                    _g77++;
                  }
                }
                _c82 = ((_g77 === 0) && (v_r < 2));
              }
              _c83 = _c82;
            }
            let _c95: boolean = _c83;
            if (!_c95) {
              let _c89: boolean = (_h71 && (v_e === v_d));
              if (_c89) {
                let _g84 = 0;
                G85: {
                  const _a86 = setOf(v_n);
                  for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                    const v_k = _a86[_i87];
                    const _h88 = clueAt(cl.dot, v_k);
                    if (!((_h88 !== -1))) continue;
                    _g84++;
                  }
                }
                _c89 = (_g84 === 1);
              }
              let _c94: boolean = _c89;
              if (_c94) {
                let _g90 = 0;
                G91: {
                  const _a92 = sp.adj4[v_n];
                  for (let _i93 = 0; _i93 < _a92.length; _i93++) {
                    const v_m = _a92[_i93];
                    if (!((b.value(v_m) === b.value(v_n)))) continue;
                    _g90++;
                  }
                }
                _c94 = (_g90 >= 1);
              }
              _c95 = _c94;
            }
            if (!(_c95)) break L76;
            facts.length = 0;
            changed = false;
            if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, _h97); changed = true; } else facts.push(PLACE, v_x, _h97); }
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

export function countFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountFullBinding> | null): number {
  const _g271: number[] = [];
  const _g280: number[] = [];
  const _g290: number[] = [];
  const _g298: number[] = [];
  const _g308: number[] = [];
  const _g318: number[] = [];
  const _g357: number[] = [];
  const _g383: number[] = [];
  const _g408: number[] = [];
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _a250 = sp.cells;
  for (let _i251 = 0; _i251 < _a250.length; _i251++) {
    const v_a = _a250[_i251];
    let _c277: boolean = b.known(v_a);
    if (_c277) {
      let _g252 = 0;
      G253: {
        const _a254 = setOf(v_a);
        for (let _i255 = 0; _i255 < _a254.length; _i255++) {
          const v_k = _a254[_i255];
          const _h256 = clueAt(cl.dot, v_k);
          if (!((_h256 !== -1))) continue;
          _g252++;
        }
      }
      let _g257 = 0;
      G258: {
        const _a259 = setOf(v_a);
        for (let _i260 = 0; _i260 < _a259.length; _i260++) {
          const v_k = _a259[_i260];
          const _h261 = clueAt(cl.dot, v_k);
          if (!((_h261 !== -1))) continue;
          _g257++;
        }
      }
      let _g262 = 0;
      G263: {
        const _a264 = sp.adj4[v_a];
        for (let _i265 = 0; _i265 < _a264.length; _i265++) {
          const v_m = _a264[_i265];
          if (!((b.value(v_m) === b.value(v_a)))) continue;
          _g262++;
        }
      }
      let _g266 = 0;
      G267: {
        const _a268 = setOf(v_a);
        for (let _i269 = 0; _i269 < _a268.length; _i269++) {
          const v_k = _a268[_i269];
          const _h270 = clueAt(cl.dot, v_k);
          if (!((_h270 !== -1))) continue;
          _g266++;
        }
      }
      _g271.length = 0;
      G272: {
        const _a275 = sp.adj4[v_a];
        for (let _i276 = 0; _i276 < _a275.length; _i276++) {
          const v_m = _a275[_i276];
          if (!(!(b.known(v_m)))) continue;
          _g271.push(v_m);
        }
      }
      _c277 = (((_g252 * ((2 - _g257) - _g262)) + ((1 - _g266) * _g271.length)) > 0);
    }
    if (!(_c277)) continue;
    const _a278 = within(sp, v_a, 2);
    for (let _i279 = 0; _i279 < _a278.length; _i279++) {
      const v_b = _a278[_i279];
      if (!(((v_b !== v_a) && b.known(v_b)))) continue;
      _g280.length = 0;
      G281: {
        _g290.length = 0;
        G291: {
          const _a294 = sp.adj4[v_a];
          for (let _i295 = 0; _i295 < _a294.length; _i295++) {
            const v_m = _a294[_i295];
            if (!(!(b.known(v_m)))) continue;
            _g290.push(v_m);
          }
        }
        const _a296 = _g290;
        for (let _i297 = 0; _i297 < _a296.length; _i297++) {
          const v_u = _a296[_i297];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g280.push(v_u);
        }
      }
      const v_S = _g280;
      const _h327 = v_S.length;
      _g298.length = 0;
      G299: {
        _g308.length = 0;
        G309: {
          const _a312 = sp.adj4[v_a];
          for (let _i313 = 0; _i313 < _a312.length; _i313++) {
            const v_m = _a312[_i313];
            if (!(!(b.known(v_m)))) continue;
            _g308.push(v_m);
          }
        }
        const _a314 = _g308;
        for (let _i315 = 0; _i315 < _a314.length; _i315++) {
          const v_u = _a314[_i315];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g298.push(v_u);
        }
      }
      const v_R = _g298;
      const _h328 = v_R.length;
      let _g316 = 0;
      G317: {
        _g318.length = 0;
        G319: {
          const _a322 = sp.adj4[v_b];
          for (let _i323 = 0; _i323 < _a322.length; _i323++) {
            const v_m = _a322[_i323];
            if (!(!(b.known(v_m)))) continue;
            _g318.push(v_m);
          }
        }
        const _a324 = _g318;
        for (let _i325 = 0; _i325 < _a324.length; _i325++) {
          const v_u = _a324[_i325];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g316++;
        }
      }
      L326: {
        const v_bo = _g316;
        let _c416: boolean = ((_h327 > 0) && (_h328 > 0));
        if (_c416) {
          let _c363: boolean = (b.value(v_b) === b.value(v_a));
          if (_c363) {
            let _g329 = 0;
            G330: {
              const _a331 = setOf(v_b);
              for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                const v_k = _a331[_i332];
                const _h333 = clueAt(cl.dot, v_k);
                if (!((_h333 !== -1))) continue;
                _g329++;
              }
            }
            let _g334 = 0;
            G335: {
              const _a336 = sp.adj4[v_b];
              for (let _i337 = 0; _i337 < _a336.length; _i337++) {
                const v_m = _a336[_i337];
                if (!((b.value(v_m) === b.value(v_b)))) continue;
                _g334++;
              }
            }
            let _g338 = 0;
            G339: {
              const _a340 = setOf(v_a);
              for (let _i341 = 0; _i341 < _a340.length; _i341++) {
                const v_k = _a340[_i341];
                const _h342 = clueAt(cl.dot, v_k);
                if (!((_h342 !== -1))) continue;
                _g338++;
              }
            }
            let _g343 = 0;
            G344: {
              const _a345 = setOf(v_a);
              for (let _i346 = 0; _i346 < _a345.length; _i346++) {
                const v_k = _a345[_i346];
                const _h347 = clueAt(cl.dot, v_k);
                if (!((_h347 !== -1))) continue;
                _g343++;
              }
            }
            let _g348 = 0;
            G349: {
              const _a350 = sp.adj4[v_a];
              for (let _i351 = 0; _i351 < _a350.length; _i351++) {
                const v_m = _a350[_i351];
                if (!((b.value(v_m) === b.value(v_a)))) continue;
                _g348++;
              }
            }
            let _g352 = 0;
            G353: {
              const _a354 = setOf(v_a);
              for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                const v_k = _a354[_i355];
                const _h356 = clueAt(cl.dot, v_k);
                if (!((_h356 !== -1))) continue;
                _g352++;
              }
            }
            _g357.length = 0;
            G358: {
              const _a361 = sp.adj4[v_a];
              for (let _i362 = 0; _i362 < _a361.length; _i362++) {
                const v_m = _a361[_i362];
                if (!(!(b.known(v_m)))) continue;
                _g357.push(v_m);
              }
            }
            _c363 = ((((2 - _g329) - _g334) - v_bo) >= ((_g338 * ((2 - _g343) - _g348)) + ((1 - _g352) * _g357.length)));
          }
          let _c415: boolean = _c363;
          if (!_c415) {
            let _c414: boolean = (b.value(v_b) !== b.value(v_a));
            if (_c414) {
              let _g364 = 0;
              G365: {
                const _a366 = setOf(v_b);
                for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                  const v_k = _a366[_i367];
                  const _h368 = clueAt(cl.dot, v_k);
                  if (!((_h368 !== -1))) continue;
                  _g364++;
                }
              }
              let _g369 = 0;
              G370: {
                const _a371 = setOf(v_b);
                for (let _i372 = 0; _i372 < _a371.length; _i372++) {
                  const v_k = _a371[_i372];
                  const _h373 = clueAt(cl.dot, v_k);
                  if (!((_h373 !== -1))) continue;
                  _g369++;
                }
              }
              let _g374 = 0;
              G375: {
                const _a376 = sp.adj4[v_b];
                for (let _i377 = 0; _i377 < _a376.length; _i377++) {
                  const v_m = _a376[_i377];
                  if (!((b.value(v_m) === b.value(v_b)))) continue;
                  _g374++;
                }
              }
              let _g378 = 0;
              G379: {
                const _a380 = setOf(v_b);
                for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                  const v_k = _a380[_i381];
                  const _h382 = clueAt(cl.dot, v_k);
                  if (!((_h382 !== -1))) continue;
                  _g378++;
                }
              }
              _g383.length = 0;
              G384: {
                const _a387 = sp.adj4[v_b];
                for (let _i388 = 0; _i388 < _a387.length; _i388++) {
                  const v_m = _a387[_i388];
                  if (!(!(b.known(v_m)))) continue;
                  _g383.push(v_m);
                }
              }
              let _g389 = 0;
              G390: {
                const _a391 = setOf(v_a);
                for (let _i392 = 0; _i392 < _a391.length; _i392++) {
                  const v_k = _a391[_i392];
                  const _h393 = clueAt(cl.dot, v_k);
                  if (!((_h393 !== -1))) continue;
                  _g389++;
                }
              }
              let _g394 = 0;
              G395: {
                const _a396 = setOf(v_a);
                for (let _i397 = 0; _i397 < _a396.length; _i397++) {
                  const v_k = _a396[_i397];
                  const _h398 = clueAt(cl.dot, v_k);
                  if (!((_h398 !== -1))) continue;
                  _g394++;
                }
              }
              let _g399 = 0;
              G400: {
                const _a401 = sp.adj4[v_a];
                for (let _i402 = 0; _i402 < _a401.length; _i402++) {
                  const v_m = _a401[_i402];
                  if (!((b.value(v_m) === b.value(v_a)))) continue;
                  _g399++;
                }
              }
              let _g403 = 0;
              G404: {
                const _a405 = setOf(v_a);
                for (let _i406 = 0; _i406 < _a405.length; _i406++) {
                  const v_k = _a405[_i406];
                  const _h407 = clueAt(cl.dot, v_k);
                  if (!((_h407 !== -1))) continue;
                  _g403++;
                }
              }
              _g408.length = 0;
              G409: {
                const _a412 = sp.adj4[v_a];
                for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                  const v_m = _a412[_i413];
                  if (!(!(b.known(v_m)))) continue;
                  _g408.push(v_m);
                }
              }
              _c414 = ((_h327 - ((_g364 * ((2 - _g369) - _g374)) + ((1 - _g378) * _g383.length))) >= ((_g389 * ((2 - _g394) - _g399)) + ((1 - _g403) * _g408.length)));
            }
            _c415 = _c414;
          }
          _c416 = _c415;
        }
        if (!(_c416)) break L326;
        facts.length = 0;
        changed = false;
        let _q417 = true;
        Q418: {
          const _a419 = v_R;
          for (let _i420 = 0; _i420 < _a419.length; _i420++) {
            const v_u = _a419[_i420];
            const _t421 = b.value(v_a);
            const _t422 = (3 - _t421);
            if (!b.known(v_u)) { if (fire === null) { b.placeAt(v_u, _t422); changed = true; } else facts.push(PLACE, v_u, _t422); }
            if (!(true)) {
              _q417 = false;
              break Q418;
            }
          }
        }
        if (!(_q417)) return -1;
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

export function countShort(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountShortBinding> | null): number {
  const _g540: number[] = [];
  const _g550: number[] = [];
  const _g558: number[] = [];
  const _g568: number[] = [];
  const _g578: number[] = [];
  const _g609: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _a526 = sp.cells;
  for (let _i527 = 0; _i527 < _a526.length; _i527++) {
    const v_a = _a526[_i527];
    let _c537: boolean = b.known(v_a);
    if (_c537) {
      let _g528 = 0;
      G529: {
        const _a530 = setOf(v_a);
        for (let _i531 = 0; _i531 < _a530.length; _i531++) {
          const v_k = _a530[_i531];
          const _h532 = clueAt(cl.dot, v_k);
          if (!((_h532 !== -1))) continue;
          _g528++;
        }
      }
      let _g533 = 0;
      G534: {
        const _a535 = sp.adj4[v_a];
        for (let _i536 = 0; _i536 < _a535.length; _i536++) {
          const v_m = _a535[_i536];
          if (!((b.value(v_m) === b.value(v_a)))) continue;
          _g533++;
        }
      }
      _c537 = (((2 - _g528) - _g533) > 0);
    }
    if (!(_c537)) continue;
    const _a538 = within(sp, v_a, 2);
    for (let _i539 = 0; _i539 < _a538.length; _i539++) {
      const v_b = _a538[_i539];
      if (!(((v_b !== v_a) && b.known(v_b)))) continue;
      _g540.length = 0;
      G541: {
        _g550.length = 0;
        G551: {
          const _a554 = sp.adj4[v_a];
          for (let _i555 = 0; _i555 < _a554.length; _i555++) {
            const v_m = _a554[_i555];
            if (!(!(b.known(v_m)))) continue;
            _g550.push(v_m);
          }
        }
        const _a556 = _g550;
        for (let _i557 = 0; _i557 < _a556.length; _i557++) {
          const v_u = _a556[_i557];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g540.push(v_u);
        }
      }
      const v_S = _g540;
      const _h615 = v_S.length;
      _g558.length = 0;
      G559: {
        _g568.length = 0;
        G569: {
          const _a572 = sp.adj4[v_a];
          for (let _i573 = 0; _i573 < _a572.length; _i573++) {
            const v_m = _a572[_i573];
            if (!(!(b.known(v_m)))) continue;
            _g568.push(v_m);
          }
        }
        const _a574 = _g568;
        for (let _i575 = 0; _i575 < _a574.length; _i575++) {
          const v_u = _a574[_i575];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g558.push(v_u);
        }
      }
      const v_R = _g558;
      const _h626 = v_R.length;
      let _g576 = 0;
      G577: {
        _g578.length = 0;
        G579: {
          const _a582 = sp.adj4[v_b];
          for (let _i583 = 0; _i583 < _a582.length; _i583++) {
            const v_m = _a582[_i583];
            if (!(!(b.known(v_m)))) continue;
            _g578.push(v_m);
          }
        }
        const _a584 = _g578;
        for (let _i585 = 0; _i585 < _a584.length; _i585++) {
          const v_u = _a584[_i585];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g576++;
        }
      }
      const v_bo = _g576;
      let _g586 = 0;
      G587: {
        const _a588 = setOf(v_b);
        for (let _i589 = 0; _i589 < _a588.length; _i589++) {
          const v_k = _a588[_i589];
          if (!((b.value(v_k) === b.value(v_a)))) continue;
          _g586++;
        }
      }
      const v_alike = _g586;
      let _g590 = 0;
      G591: {
        const _a592 = setOf(v_b);
        for (let _i593 = 0; _i593 < _a592.length; _i593++) {
          const v_k = _a592[_i593];
          const _h594 = clueAt(cl.dot, v_k);
          if (!((_h594 !== -1))) continue;
          _g590++;
        }
      }
      let _g595 = 0;
      G596: {
        const _a597 = setOf(v_b);
        for (let _i598 = 0; _i598 < _a597.length; _i598++) {
          const v_k = _a597[_i598];
          const _h599 = clueAt(cl.dot, v_k);
          if (!((_h599 !== -1))) continue;
          _g595++;
        }
      }
      let _g600 = 0;
      G601: {
        const _a602 = sp.adj4[v_b];
        for (let _i603 = 0; _i603 < _a602.length; _i603++) {
          const v_m = _a602[_i603];
          if (!((b.value(v_m) === b.value(v_b)))) continue;
          _g600++;
        }
      }
      let _g604 = 0;
      G605: {
        const _a606 = setOf(v_b);
        for (let _i607 = 0; _i607 < _a606.length; _i607++) {
          const v_k = _a606[_i607];
          const _h608 = clueAt(cl.dot, v_k);
          if (!((_h608 !== -1))) continue;
          _g604++;
        }
      }
      _g609.length = 0;
      G610: {
        const _a613 = sp.adj4[v_b];
        for (let _i614 = 0; _i614 < _a613.length; _i614++) {
          const v_m = _a613[_i614];
          if (!(!(b.known(v_m)))) continue;
          _g609.push(v_m);
        }
      }
      let _g616 = 0;
      G617: {
        const _a618 = setOf(v_b);
        for (let _i619 = 0; _i619 < _a618.length; _i619++) {
          const v_k = _a618[_i619];
          const _h620 = clueAt(cl.dot, v_k);
          if (!((_h620 !== -1))) continue;
          _g616++;
        }
      }
      let _g621 = 0;
      G622: {
        const _a623 = sp.adj4[v_b];
        for (let _i624 = 0; _i624 < _a623.length; _i624++) {
          const v_m = _a623[_i624];
          if (!((b.value(v_m) === b.value(v_b)))) continue;
          _g621++;
        }
      }
      L625: {
        const v_most = ((v_alike * ((_g590 * ((2 - _g595) - _g600)) + ((1 - _g604) * _g609.length))) + ((1 - v_alike) * ((_h615 - ((2 - _g616) - _g621)) + v_bo)));
        let _c636: boolean = (((_h615 > 0) && (_h626 > 0)) && (v_most < _h615));
        if (_c636) {
          let _g627 = 0;
          G628: {
            const _a629 = setOf(v_a);
            for (let _i630 = 0; _i630 < _a629.length; _i630++) {
              const v_k = _a629[_i630];
              const _h631 = clueAt(cl.dot, v_k);
              if (!((_h631 !== -1))) continue;
              _g627++;
            }
          }
          let _g632 = 0;
          G633: {
            const _a634 = sp.adj4[v_a];
            for (let _i635 = 0; _i635 < _a634.length; _i635++) {
              const v_m = _a634[_i635];
              if (!((b.value(v_m) === b.value(v_a)))) continue;
              _g632++;
            }
          }
          _c636 = ((((2 - _g627) - _g632) - v_most) >= _h626);
        }
        if (!(_c636)) break L625;
        facts.length = 0;
        changed = false;
        let _q637 = true;
        Q638: {
          const _a639 = v_R;
          for (let _i640 = 0; _i640 < _a639.length; _i640++) {
            const v_u = _a639[_i640];
            const _t641 = b.value(v_a);
            if (!b.known(v_u)) { if (fire === null) { b.placeAt(v_u, _t641); changed = true; } else facts.push(PLACE, v_u, _t641); }
            if (!(true)) {
              _q637 = false;
              break Q638;
            }
          }
        }
        if (!(_q637)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, S: v_S, R: v_R, bo: v_bo, alike: v_alike, most: v_most }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
