// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, rangeMask, setOf, step, stretch, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  n: ClueList;
  seg: ClueList;
  fleet: { readonly n: number; readonly length: readonly number[]; readonly boats: readonly number[] };
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "given" | "near" | "lineShips" | "total" | "center" | "extend" | "lineWater" | "isolated" | "grow" | "onlyFit" | "centerRoom" | "tooLong" | "shortRun" | "hidden" | "onlyRuns" | "shared" | "lastWater" | "lastShip" | "centerTrial";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "touch";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "touch" },
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
  { id: "given", tier: 0 },
  { id: "near", tier: 0 },
  { id: "lineShips", tier: 0 },
  { id: "total", tier: 0 },
  { id: "center", tier: 0 },
  { id: "extend", tier: 0 },
  { id: "lineWater", tier: 0 },
  { id: "isolated", tier: 0 },
  { id: "grow", tier: 1 },
  { id: "onlyFit", tier: 1 },
  { id: "centerRoom", tier: 1 },
  { id: "tooLong", tier: 1 },
  { id: "shortRun", tier: 1 },
  { id: "hidden", tier: 2 },
  { id: "onlyRuns", tier: 2 },
  { id: "shared", tier: 2 },
  { id: "lastWater", tier: 3 },
  { id: "lastShip", tier: 3 },
  { id: "centerTrial", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g5328: number[] = [];
  const _g5335: number[] = [];
  const _g5409: number[] = [];
  const _g5416: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q5309 = true;
  Q5310: {
    const _a5311 = sp.cells;
    for (let _i5312 = 0; _i5312 < _a5311.length; _i5312++) {
      const v_a = _a5311[_i5312];
      if (!(((g[v_a] || -1) === 1))) continue;
      let _q5313 = true;
      Q5314: {
        const _a5315 = sp.adj8[v_a];
        for (let _i5316 = 0; _i5316 < _a5315.length; _i5316++) {
          const v_b = _a5315[_i5316];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          if (!(((g[v_b] || -1) !== 1))) {
            _q5313 = false;
            break Q5314;
          }
        }
      }
      if (!(_q5313)) {
        _q5309 = false;
        break Q5310;
      }
    }
  }
  if (!(_q5309)) return false;
  let _q5317 = true;
  Q5318: {
    const _a5319 = sp.cells;
    for (let _i5320 = 0; _i5320 < _a5319.length; _i5320++) {
      const v_c = _a5319[_i5320];
      let _c5322: boolean = ((g[v_c] || -1) === 1);
      if (_c5322) {
        const _t5321 = step(sp, v_c, 1);
        _c5322 = !(((_t5321 !== -1) && ((g[_t5321] || -1) === 1)));
      }
      let _c5324: boolean = _c5322;
      if (_c5324) {
        const _t5323 = step(sp, v_c, 3);
        _c5324 = !(((_t5323 !== -1) && ((g[_t5323] || -1) === 1)));
      }
      if (!(_c5324)) continue;
      let _q5325 = false;
      Q5326: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          const _t5327 = sp.rowOf[v_c];
          _g5328.length = 0;
          G5329: {
            const _a5332 = sp.lineCells[_t5327];
            for (let _i5333 = 0; _i5333 < _a5332.length; _i5333++) {
              const v_x = _a5332[_i5333];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5328.push(v_x);
            }
          }
          const _t5334 = sp.colOf[v_c];
          _g5335.length = 0;
          G5336: {
            const _a5339 = sp.lineCells[_t5334];
            for (let _i5340 = 0; _i5340 < _a5339.length; _i5340++) {
              const v_x = _a5339[_i5340];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5335.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5328), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5335)).length)) {
            _q5325 = true;
            break Q5326;
          }
        }
      }
      if (!(_q5325)) {
        _q5317 = false;
        break Q5318;
      }
    }
  }
  if (!(_q5317)) return false;
  let _q5341 = true;
  Q5342: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q5341 = false;
          break Q5342;
        }
      }
    }
  }
  if (!(_q5341)) return false;
  let _g5343 = 0;
  G5344: {
    const _a5345 = sp.cells;
    for (let _i5346 = 0; _i5346 < _a5345.length; _i5346++) {
      const v_c = _a5345[_i5346];
      if (!(((g[v_c] || -1) === 1))) continue;
      _g5343++;
    }
  }
  let _g5347 = 0;
  G5348: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g5347 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g5343 === _g5347))) return false;
  for (let _k5349 = 0; _k5349 < cl.n.at.length; _k5349++) {
    const _at5350 = cl.n.at[_k5349];
    const _v5351 = cl.n.v[_k5349];
    const _t5352 = sp.lineCells[_at5350];
    let _g5353 = 0;
    G5354: {
      const _a5355 = _t5352;
      for (let _i5356 = 0; _i5356 < _a5355.length; _i5356++) {
        const v_c = _a5355[_i5356];
        if (!(((g[v_c] || -1) === 1))) continue;
        _g5353++;
      }
    }
    if (!((_g5353 === _v5351))) return false;
  }
  for (let _k5357 = 0; _k5357 < cl.seg.at.length; _k5357++) {
    const _at5358 = cl.seg.at[_k5357];
    const _v5359 = cl.seg.v[_k5357];
    let _c5396: boolean = ((_v5359 === 2) && ((g[_at5358] || -1) === 2));
    if (!_c5396) {
      let _c5395: boolean = ((_v5359 > 2) && ((g[_at5358] || -1) === 1));
      if (_c5395) {
        let _c5364: boolean = (_v5359 === 3);
        if (!_c5364) {
          let _c5361: boolean = (_v5359 === 4);
          if (_c5361) {
            const _t5360 = step(sp, _at5358, 2);
            _c5361 = ((_t5360 !== -1) && ((g[_t5360] || -1) === 1));
          }
          let _c5363: boolean = _c5361;
          if (_c5363) {
            const _t5362 = step(sp, _at5358, 1);
            _c5363 = !(((_t5362 !== -1) && ((g[_t5362] || -1) === 1)));
          }
          _c5364 = _c5363;
        }
        let _c5369: boolean = _c5364;
        if (!_c5369) {
          let _c5366: boolean = (_v5359 === 5);
          if (_c5366) {
            const _t5365 = step(sp, _at5358, 1);
            _c5366 = ((_t5365 !== -1) && ((g[_t5365] || -1) === 1));
          }
          let _c5368: boolean = _c5366;
          if (_c5368) {
            const _t5367 = step(sp, _at5358, 2);
            _c5368 = !(((_t5367 !== -1) && ((g[_t5367] || -1) === 1)));
          }
          _c5369 = _c5368;
        }
        let _c5378: boolean = _c5369;
        if (!_c5378) {
          let _c5377: boolean = (_v5359 === 6);
          if (_c5377) {
            const _t5370 = step(sp, _at5358, 1);
            let _c5372: boolean = ((_t5370 !== -1) && ((g[_t5370] || -1) === 1));
            if (_c5372) {
              const _t5371 = step(sp, _at5358, 2);
              _c5372 = ((_t5371 !== -1) && ((g[_t5371] || -1) === 1));
            }
            let _c5376: boolean = _c5372;
            if (!_c5376) {
              const _t5373 = step(sp, _at5358, 3);
              let _c5375: boolean = ((_t5373 !== -1) && ((g[_t5373] || -1) === 1));
              if (_c5375) {
                const _t5374 = step(sp, _at5358, 4);
                _c5375 = ((_t5374 !== -1) && ((g[_t5374] || -1) === 1));
              }
              _c5376 = _c5375;
            }
            _c5377 = _c5376;
          }
          _c5378 = _c5377;
        }
        let _c5383: boolean = _c5378;
        if (!_c5383) {
          let _c5380: boolean = (_v5359 === 7);
          if (_c5380) {
            const _t5379 = step(sp, _at5358, 4);
            _c5380 = ((_t5379 !== -1) && ((g[_t5379] || -1) === 1));
          }
          let _c5382: boolean = _c5380;
          if (_c5382) {
            const _t5381 = step(sp, _at5358, 3);
            _c5382 = !(((_t5381 !== -1) && ((g[_t5381] || -1) === 1)));
          }
          _c5383 = _c5382;
        }
        let _c5388: boolean = _c5383;
        if (!_c5388) {
          let _c5385: boolean = (_v5359 === 8);
          if (_c5385) {
            const _t5384 = step(sp, _at5358, 3);
            _c5385 = ((_t5384 !== -1) && ((g[_t5384] || -1) === 1));
          }
          let _c5387: boolean = _c5385;
          if (_c5387) {
            const _t5386 = step(sp, _at5358, 4);
            _c5387 = !(((_t5386 !== -1) && ((g[_t5386] || -1) === 1)));
          }
          _c5388 = _c5387;
        }
        let _c5394: boolean = _c5388;
        if (!_c5394) {
          let _c5393: boolean = (_v5359 === 9);
          if (_c5393) {
            let _q5389 = false;
            Q5390: {
              const _a5391 = sp.adj4[_at5358];
              for (let _i5392 = 0; _i5392 < _a5391.length; _i5392++) {
                const v_x = _a5391[_i5392];
                if (((g[v_x] || -1) === 1)) {
                  _q5389 = true;
                  break Q5390;
                }
              }
            }
            _c5393 = !(_q5389);
          }
          _c5394 = _c5393;
        }
        _c5395 = _c5394;
      }
      _c5396 = _c5395;
    }
    if (!(_c5396)) return false;
  }
  for (let _k5397 = 0; _k5397 < cl.fleet.n; _k5397++) {
    let _g5400 = 0;
    G5401: {
      const _a5402 = sp.cells;
      for (let _i5403 = 0; _i5403 < _a5402.length; _i5403++) {
        const v_c = _a5402[_i5403];
        let _c5405: boolean = ((g[v_c] || -1) === 1);
        if (_c5405) {
          const _t5404 = step(sp, v_c, 1);
          _c5405 = !(((_t5404 !== -1) && ((g[_t5404] || -1) === 1)));
        }
        let _c5407: boolean = _c5405;
        if (_c5407) {
          const _t5406 = step(sp, v_c, 3);
          _c5407 = !(((_t5406 !== -1) && ((g[_t5406] || -1) === 1)));
        }
        let _c5422: boolean = _c5407;
        if (_c5422) {
          const _t5408 = sp.rowOf[v_c];
          _g5409.length = 0;
          G5410: {
            const _a5413 = sp.lineCells[_t5408];
            for (let _i5414 = 0; _i5414 < _a5413.length; _i5414++) {
              const v_x = _a5413[_i5414];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5409.push(v_x);
            }
          }
          const _t5415 = sp.colOf[v_c];
          _g5416.length = 0;
          G5417: {
            const _a5420 = sp.lineCells[_t5415];
            for (let _i5421 = 0; _i5421 < _a5420.length; _i5421++) {
              const v_x = _a5420[_i5421];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5416.push(v_x);
            }
          }
          _c5422 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5409), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5416)).length === cl.fleet.length[_k5397]);
        }
        if (!(_c5422)) continue;
        _g5400++;
      }
    }
    if (!((_g5400 === cl.fleet.boats[_k5397]))) return false;
  }
  return true;
}

export interface GivenBinding {
  c: number;
  v: number;
}

const givenFacts: number[] = [];

export function given(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GivenBinding> | null): number {
  const facts = givenFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    const _h11 = clueAt(cl.seg, v_c);
    L12: {
      const v_v = _h11;
      if (!((v_v >= 2))) break L12;
      facts.length = 0;
      changed = false;
      let _c13: boolean = !((v_v === 2));
      if (!_c13) {
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        _c13 = true;
      }
      let _c15: boolean = _c13;
      if (_c15) {
        let _c14: boolean = !((v_v > 2));
        if (!_c14) {
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          _c14 = true;
        }
        _c15 = _c14;
      }
      let _c21: boolean = _c15;
      if (_c21) {
        let _c20: boolean = !((v_v === 4));
        if (!_c20) {
          const _t16 = step(sp, v_c, 2);
          let _c19: boolean = ((_t16 !== -1) && (b.value(_t16) === 1));
          if (!_c19) {
            let _c18: boolean = ((step(sp, v_c, 2) !== -1) && !(b.known(step(sp, v_c, 2))));
            if (_c18) {
              const _t17 = step(sp, v_c, 2);
              if (!b.known(_t17)) { if (fire === null) { b.placeAt(_t17, 1); changed = true; } else facts.push(PLACE, _t17, 1); }
              _c18 = true;
            }
            _c19 = _c18;
          }
          _c20 = _c19;
        }
        _c21 = _c20;
      }
      let _c27: boolean = _c21;
      if (_c27) {
        let _c26: boolean = !((v_v === 4));
        if (!_c26) {
          const _t22 = step(sp, v_c, 1);
          let _c25: boolean = ((_t22 === -1) || (b.value(_t22) === 2));
          if (!_c25) {
            let _c24: boolean = !(b.known(step(sp, v_c, 1)));
            if (_c24) {
              const _t23 = step(sp, v_c, 1);
              if (!b.known(_t23)) { if (fire === null) { b.placeAt(_t23, 2); changed = true; } else facts.push(PLACE, _t23, 2); }
              _c24 = true;
            }
            _c25 = _c24;
          }
          _c26 = _c25;
        }
        _c27 = _c26;
      }
      let _c33: boolean = _c27;
      if (_c33) {
        let _c32: boolean = !((v_v === 5));
        if (!_c32) {
          const _t28 = step(sp, v_c, 1);
          let _c31: boolean = ((_t28 !== -1) && (b.value(_t28) === 1));
          if (!_c31) {
            let _c30: boolean = ((step(sp, v_c, 1) !== -1) && !(b.known(step(sp, v_c, 1))));
            if (_c30) {
              const _t29 = step(sp, v_c, 1);
              if (!b.known(_t29)) { if (fire === null) { b.placeAt(_t29, 1); changed = true; } else facts.push(PLACE, _t29, 1); }
              _c30 = true;
            }
            _c31 = _c30;
          }
          _c32 = _c31;
        }
        _c33 = _c32;
      }
      let _c39: boolean = _c33;
      if (_c39) {
        let _c38: boolean = !((v_v === 5));
        if (!_c38) {
          const _t34 = step(sp, v_c, 2);
          let _c37: boolean = ((_t34 === -1) || (b.value(_t34) === 2));
          if (!_c37) {
            let _c36: boolean = !(b.known(step(sp, v_c, 2)));
            if (_c36) {
              const _t35 = step(sp, v_c, 2);
              if (!b.known(_t35)) { if (fire === null) { b.placeAt(_t35, 2); changed = true; } else facts.push(PLACE, _t35, 2); }
              _c36 = true;
            }
            _c37 = _c36;
          }
          _c38 = _c37;
        }
        _c39 = _c38;
      }
      let _c45: boolean = _c39;
      if (_c45) {
        let _c44: boolean = !((v_v === 7));
        if (!_c44) {
          const _t40 = step(sp, v_c, 4);
          let _c43: boolean = ((_t40 !== -1) && (b.value(_t40) === 1));
          if (!_c43) {
            let _c42: boolean = ((step(sp, v_c, 4) !== -1) && !(b.known(step(sp, v_c, 4))));
            if (_c42) {
              const _t41 = step(sp, v_c, 4);
              if (!b.known(_t41)) { if (fire === null) { b.placeAt(_t41, 1); changed = true; } else facts.push(PLACE, _t41, 1); }
              _c42 = true;
            }
            _c43 = _c42;
          }
          _c44 = _c43;
        }
        _c45 = _c44;
      }
      let _c51: boolean = _c45;
      if (_c51) {
        let _c50: boolean = !((v_v === 7));
        if (!_c50) {
          const _t46 = step(sp, v_c, 3);
          let _c49: boolean = ((_t46 === -1) || (b.value(_t46) === 2));
          if (!_c49) {
            let _c48: boolean = !(b.known(step(sp, v_c, 3)));
            if (_c48) {
              const _t47 = step(sp, v_c, 3);
              if (!b.known(_t47)) { if (fire === null) { b.placeAt(_t47, 2); changed = true; } else facts.push(PLACE, _t47, 2); }
              _c48 = true;
            }
            _c49 = _c48;
          }
          _c50 = _c49;
        }
        _c51 = _c50;
      }
      let _c57: boolean = _c51;
      if (_c57) {
        let _c56: boolean = !((v_v === 8));
        if (!_c56) {
          const _t52 = step(sp, v_c, 3);
          let _c55: boolean = ((_t52 !== -1) && (b.value(_t52) === 1));
          if (!_c55) {
            let _c54: boolean = ((step(sp, v_c, 3) !== -1) && !(b.known(step(sp, v_c, 3))));
            if (_c54) {
              const _t53 = step(sp, v_c, 3);
              if (!b.known(_t53)) { if (fire === null) { b.placeAt(_t53, 1); changed = true; } else facts.push(PLACE, _t53, 1); }
              _c54 = true;
            }
            _c55 = _c54;
          }
          _c56 = _c55;
        }
        _c57 = _c56;
      }
      let _c63: boolean = _c57;
      if (_c63) {
        let _c62: boolean = !((v_v === 8));
        if (!_c62) {
          const _t58 = step(sp, v_c, 4);
          let _c61: boolean = ((_t58 === -1) || (b.value(_t58) === 2));
          if (!_c61) {
            let _c60: boolean = !(b.known(step(sp, v_c, 4)));
            if (_c60) {
              const _t59 = step(sp, v_c, 4);
              if (!b.known(_t59)) { if (fire === null) { b.placeAt(_t59, 2); changed = true; } else facts.push(PLACE, _t59, 2); }
              _c60 = true;
            }
            _c61 = _c60;
          }
          _c62 = _c61;
        }
        _c63 = _c62;
      }
      let _c70: boolean = _c63;
      if (_c70) {
        let _c69: boolean = !((v_v === 9));
        if (!_c69) {
          let _q64 = true;
          Q65: {
            const _a66 = sp.adj4[v_c];
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              const v_x = _a66[_i67];
              let _c68: boolean = (b.value(v_x) !== 1);
              if (_c68) {
                if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c68 = true;
              }
              if (!(_c68)) {
                _q64 = false;
                break Q65;
              }
            }
          }
          _c69 = _q64;
        }
        _c70 = _c69;
      }
      if (!(_c70)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, v: v_v }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NearBinding {
  c: number;
  D: readonly number[];
}

const nearFacts: number[] = [];

export function near(b: Marks, sp: GridSpace, fire: Fire<NearBinding> | null): number {
  const _g82: number[] = [];
  const facts = nearFacts;
  let fired = 0;
  let changed = false;
  const _a80 = sp.cells;
  for (let _i81 = 0; _i81 < _a80.length; _i81++) {
    const v_c = _a80[_i81];
    if (!((b.value(v_c) === 1))) continue;
    _g82.length = 0;
    G83: {
      const _a86 = sp.adj8[v_c];
      for (let _i87 = 0; _i87 < _a86.length; _i87++) {
        const v_d = _a86[_i87];
        if (!((!(sp.adj4[v_c].includes(v_d)) && !(b.known(v_d))))) continue;
        _g82.push(v_d);
      }
    }
    L88: {
      const v_D = _g82;
      const _h89 = v_D.length;
      if (!((_h89 > 0))) break L88;
      facts.length = 0;
      changed = false;
      let _q90 = true;
      Q91: {
        const _a92 = v_D;
        for (let _i93 = 0; _i93 < _a92.length; _i93++) {
          const v_d = _a92[_i93];
          if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
          if (!(true)) {
            _q90 = false;
            break Q91;
          }
        }
      }
      if (!(_q90)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, D: v_D }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface TouchBinding {
  c: number;
  d: number;
}

const touchFacts: number[] = [];

export function touch(b: Marks, sp: GridSpace, v_c: number, fire: Fire<TouchBinding> | null): number {
  const facts = touchFacts;
  let fired = 0;
  let changed = false;
  if (!((b.value(v_c) === 1))) return 0;
  const _a98 = sp.adj8[v_c];
  for (let _i99 = 0; _i99 < _a98.length; _i99++) {
    const v_d = _a98[_i99];
    if (!((!(sp.adj4[v_c].includes(v_d)) && !(b.known(v_d))))) continue;
    facts.length = 0;
    changed = false;
    if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, d: v_d }, facts);
    }
  }
  return fired;
}

export interface LineShipsBinding {
  L: number;
  v: number;
  O: readonly number[];
  left: number;
}

const lineShipsFacts: number[] = [];

export function lineShips(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineShipsBinding> | null): number {
  const _g121: number[] = [];
  const facts = lineShipsFacts;
  let fired = 0;
  let changed = false;
  const _a116 = sp.lines;
  for (let _i117 = 0; _i117 < _a116.length; _i117++) {
    const v_L = _a116[_i117];
    const _h118 = clueAt(cl.n, v_L);
    L119: {
      const v_v = _h118;
      if (!((v_v >= 0))) break L119;
      const _t120 = sp.lineCells[v_L];
      _g121.length = 0;
      G122: {
        const _a125 = _t120;
        for (let _i126 = 0; _i126 < _a125.length; _i126++) {
          const v_c = _a125[_i126];
          if (!(!(b.known(v_c)))) continue;
          _g121.push(v_c);
        }
      }
      L127: {
        const v_O = _g121;
        const _h128 = v_O.length;
        if (!((_h128 > 0))) break L127;
        const _t129 = sp.lineCells[v_L];
        let _g130 = 0;
        G131: {
          const _a132 = _t129;
          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
            const v_c = _a132[_i133];
            if (!((b.value(v_c) === 1))) continue;
            _g130++;
          }
        }
        const v_left = (v_v - _g130);
        facts.length = 0;
        changed = false;
        let _c139: boolean = (v_left <= _h128);
        if (_c139) {
          let _c138: boolean = !((v_left === _h128));
          if (!_c138) {
            let _q134 = true;
            Q135: {
              const _a136 = v_O;
              for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                const v_c = _a136[_i137];
                if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q134 = false;
                  break Q135;
                }
              }
            }
            _c138 = _q134;
          }
          _c139 = _c138;
        }
        if (!(_c139)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O, left: v_left }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface TotalBinding {
  O: readonly number[];
  left: number;
}

const totalFacts: number[] = [];

export function total(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TotalBinding> | null): number {
  const _g156: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  const _t155 = sp.cells;
  _g156.length = 0;
  G157: {
    const _a160 = _t155;
    for (let _i161 = 0; _i161 < _a160.length; _i161++) {
      const v_c = _a160[_i161];
      if (!(!(b.known(v_c)))) continue;
      _g156.push(v_c);
    }
  }
  L162: {
    const v_O = _g156;
    const _h163 = v_O.length;
    if (!((_h163 > 0))) break L162;
    let _g164 = 0;
    G165: {
      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
        _g164 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
      }
    }
    const _t166 = sp.cells;
    let _g167 = 0;
    G168: {
      const _a169 = _t166;
      for (let _i170 = 0; _i170 < _a169.length; _i170++) {
        const v_c = _a169[_i170];
        if (!((b.value(v_c) === 1))) continue;
        _g167++;
      }
    }
    const v_left = (_g164 - _g167);
    facts.length = 0;
    changed = false;
    let _c176: boolean = (v_left <= _h163);
    if (_c176) {
      let _c175: boolean = !((v_left === _h163));
      if (!_c175) {
        let _q171 = true;
        Q172: {
          const _a173 = v_O;
          for (let _i174 = 0; _i174 < _a173.length; _i174++) {
            const v_c = _a173[_i174];
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q171 = false;
              break Q172;
            }
          }
        }
        _c175 = _q171;
      }
      _c176 = _c175;
    }
    if (!(_c176)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ O: v_O, left: v_left }, facts)) return 1;
    }
  }
  return fired;
}

export interface CenterBinding {
  c: number;
  a: number;
  b: number;
  p: number;
  q: number;
}

const centerFacts: number[] = [];

export function center(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterBinding> | null): number {
  const facts = centerFacts;
  let fired = 0;
  let changed = false;
  const _h187 = ((1 << 1) | (1 << 3));
  const _a184 = sp.cells;
  for (let _i185 = 0; _i185 < _a184.length; _i185++) {
    const v_c = _a184[_i185];
    const _h186 = clueAt(cl.seg, v_c);
    if (!((_h186 === 6))) continue;
    for (let _m188 = _h187; _m188 !== 0; _m188 &= _m188 - 1) {
      const v_a = 31 - Math.clz32(_m188 & -_m188);
      const v_b = (v_a + 1);
      const v_p = (4 - v_a);
      L189: {
        const v_q = (5 - v_a);
        const _t190 = step(sp, v_c, v_a);
        let _c192: boolean = ((_t190 === -1) || (b.value(_t190) === 2));
        if (!_c192) {
          const _t191 = step(sp, v_c, v_b);
          _c192 = ((_t191 === -1) || (b.value(_t191) === 2));
        }
        if (!(_c192)) break L189;
        facts.length = 0;
        changed = false;
        const _t193 = step(sp, v_c, v_p);
        let _c195: boolean = !(((_t193 === -1) || (b.value(_t193) === 2)));
        if (_c195) {
          const _t194 = step(sp, v_c, v_q);
          _c195 = !(((_t194 === -1) || (b.value(_t194) === 2)));
        }
        let _c197: boolean = _c195;
        if (_c197) {
          const _t196 = step(sp, v_c, v_p);
          if (!b.known(_t196)) { if (fire === null) { b.placeAt(_t196, 1); changed = true; } else facts.push(PLACE, _t196, 1); }
          _c197 = true;
        }
        let _c199: boolean = _c197;
        if (_c199) {
          const _t198 = step(sp, v_c, v_q);
          if (!b.known(_t198)) { if (fire === null) { b.placeAt(_t198, 1); changed = true; } else facts.push(PLACE, _t198, 1); }
          _c199 = true;
        }
        if (!(_c199)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, a: v_a, b: v_b, p: v_p, q: v_q }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ExtendBinding {
  F: boolean;
  c: number;
  O: readonly number[];
}

const extendFacts: number[] = [];

export function extend(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExtendBinding> | null): number {
  const _g287: number[] = [];
  const _g294: number[] = [];
  const _g304: number[] = [];
  const _g311: number[] = [];
  const _g322: number[] = [];
  const _g330: number[] = [];
  const _g345: number[] = [];
  const facts = extendFacts;
  let fired = 0;
  let changed = false;
  let _q276 = true;
  Q277: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === 1))) continue;
      let _g278 = 0;
      G279: {
        const _a280 = sp.cells;
        for (let _i281 = 0; _i281 < _a280.length; _i281++) {
          const v_c = _a280[_i281];
          const _h321 = sp.rowOf[v_c];
          const _h329 = sp.colOf[v_c];
          let _c283: boolean = (b.value(v_c) === 1);
          if (_c283) {
            const _t282 = step(sp, v_c, 1);
            _c283 = !(((_t282 !== -1) && (b.value(_t282) === 1)));
          }
          let _c285: boolean = _c283;
          if (_c285) {
            const _t284 = step(sp, v_c, 3);
            _c285 = !(((_t284 !== -1) && (b.value(_t284) === 1)));
          }
          let _c300: boolean = _c285;
          if (_c300) {
            const _t286 = sp.rowOf[v_c];
            _g287.length = 0;
            G288: {
              const _a291 = sp.lineCells[_t286];
              for (let _i292 = 0; _i292 < _a291.length; _i292++) {
                const v_x = _a291[_i292];
                if (!((b.value(v_x) === 1))) continue;
                _g287.push(v_x);
              }
            }
            const _t293 = sp.colOf[v_c];
            _g294.length = 0;
            G295: {
              const _a298 = sp.lineCells[_t293];
              for (let _i299 = 0; _i299 < _a298.length; _i299++) {
                const v_x = _a298[_i299];
                if (!((b.value(v_x) === 1))) continue;
                _g294.push(v_x);
              }
            }
            _c300 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g287), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g294)).length === 1);
          }
          let _c337: boolean = _c300;
          if (_c337) {
            let _q301 = true;
            Q302: {
              const _t303 = sp.rowOf[v_c];
              _g304.length = 0;
              G305: {
                const _a308 = sp.lineCells[_t303];
                for (let _i309 = 0; _i309 < _a308.length; _i309++) {
                  const v_x = _a308[_i309];
                  if (!((b.value(v_x) === 1))) continue;
                  _g304.push(v_x);
                }
              }
              const _t310 = sp.colOf[v_c];
              _g311.length = 0;
              G312: {
                const _a315 = sp.lineCells[_t310];
                for (let _i316 = 0; _i316 < _a315.length; _i316++) {
                  const v_x = _a315[_i316];
                  if (!((b.value(v_x) === 1))) continue;
                  _g311.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g304), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g311));
              const _a317 = v_G;
              for (let _i318 = 0; _i318 < _a317.length; _i318++) {
                const v_x = _a317[_i318];
                const _a319 = sp.adj4[v_x];
                for (let _i320 = 0; _i320 < _a319.length; _i320++) {
                  const v_y = _a319[_i320];
                  let _c328: boolean = !(v_G.includes(v_y));
                  if (_c328) {
                    _g322.length = 0;
                    G323: {
                      const _a326 = sp.lineCells[_h321];
                      for (let _i327 = 0; _i327 < _a326.length; _i327++) {
                        const v_x = _a326[_i327];
                        if (!((b.value(v_x) === 1))) continue;
                        _g322.push(v_x);
                      }
                    }
                    _c328 = ((stretch(sp.lineCells[_h321], v_c, _g322).length === 1) || (sp.lineCells[_h321].includes(v_y)));
                  }
                  let _c336: boolean = _c328;
                  if (_c336) {
                    _g330.length = 0;
                    G331: {
                      const _a334 = sp.lineCells[_h329];
                      for (let _i335 = 0; _i335 < _a334.length; _i335++) {
                        const v_x = _a334[_i335];
                        if (!((b.value(v_x) === 1))) continue;
                        _g330.push(v_x);
                      }
                    }
                    _c336 = ((stretch(sp.lineCells[_h329], v_c, _g330).length === 1) || (sp.lineCells[_h329].includes(v_y)));
                  }
                  if (!(_c336)) continue;
                  if (!((b.value(v_y) === 2))) {
                    _q301 = false;
                    break Q302;
                  }
                }
              }
            }
            _c337 = _q301;
          }
          if (!(_c337)) continue;
          _g278++;
        }
      }
      if (!((cl.fleet.boats[v_k] <= _g278))) {
        _q276 = false;
        break Q277;
      }
    }
  }
  const v_F = _q276;
  const _a338 = sp.cells;
  for (let _i339 = 0; _i339 < _a338.length; _i339++) {
    const v_c = _a338[_i339];
    let _c344: boolean = (v_F && (b.value(v_c) === 1));
    if (_c344) {
      let _q340 = false;
      Q341: {
        const _a342 = sp.adj4[v_c];
        for (let _i343 = 0; _i343 < _a342.length; _i343++) {
          const v_x = _a342[_i343];
          if ((b.value(v_x) === 1)) {
            _q340 = true;
            break Q341;
          }
        }
      }
      _c344 = !(_q340);
    }
    if (!(_c344)) continue;
    _g345.length = 0;
    G346: {
      const _a349 = sp.adj4[v_c];
      for (let _i350 = 0; _i350 < _a349.length; _i350++) {
        const v_x = _a349[_i350];
        if (!(!(b.known(v_x)))) continue;
        _g345.push(v_x);
      }
    }
    L351: {
      const v_O = _g345;
      const _h352 = v_O.length;
      if (!((_h352 === 1))) break L351;
      facts.length = 0;
      changed = false;
      let _q353 = true;
      Q354: {
        const _a355 = v_O;
        for (let _i356 = 0; _i356 < _a355.length; _i356++) {
          const v_x = _a355[_i356];
          if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) {
            _q353 = false;
            break Q354;
          }
        }
      }
      if (!(_q353)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ F: v_F, c: v_c, O: v_O }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface LineWaterBinding {
  L: number;
  v: number;
  O: readonly number[];
  left: number;
}

const lineWaterFacts: number[] = [];

export function lineWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineWaterBinding> | null): number {
  const _g378: number[] = [];
  const facts = lineWaterFacts;
  let fired = 0;
  let changed = false;
  const _a373 = sp.lines;
  for (let _i374 = 0; _i374 < _a373.length; _i374++) {
    const v_L = _a373[_i374];
    const _h375 = clueAt(cl.n, v_L);
    L376: {
      const v_v = _h375;
      if (!((v_v >= 0))) break L376;
      const _t377 = sp.lineCells[v_L];
      _g378.length = 0;
      G379: {
        const _a382 = _t377;
        for (let _i383 = 0; _i383 < _a382.length; _i383++) {
          const v_c = _a382[_i383];
          if (!(!(b.known(v_c)))) continue;
          _g378.push(v_c);
        }
      }
      L384: {
        const v_O = _g378;
        const _h385 = v_O.length;
        if (!((_h385 > 0))) break L384;
        const _t386 = sp.lineCells[v_L];
        let _g387 = 0;
        G388: {
          const _a389 = _t386;
          for (let _i390 = 0; _i390 < _a389.length; _i390++) {
            const v_c = _a389[_i390];
            if (!((b.value(v_c) === 1))) continue;
            _g387++;
          }
        }
        const v_left = (v_v - _g387);
        facts.length = 0;
        changed = false;
        let _c396: boolean = (v_left >= 0);
        if (_c396) {
          let _c395: boolean = !((v_left === 0));
          if (!_c395) {
            let _q391 = true;
            Q392: {
              const _a393 = v_O;
              for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                const v_c = _a393[_i394];
                if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q391 = false;
                  break Q392;
                }
              }
            }
            _c395 = _q391;
          }
          _c396 = _c395;
        }
        if (!(_c396)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O, left: v_left }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface IsolatedBinding {
  F: boolean;
  c: number;
}

const isolatedFacts: number[] = [];

export function isolated(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<IsolatedBinding> | null): number {
  const _g477: number[] = [];
  const _g484: number[] = [];
  const _g494: number[] = [];
  const _g501: number[] = [];
  const _g512: number[] = [];
  const _g520: number[] = [];
  const facts = isolatedFacts;
  let fired = 0;
  let changed = false;
  let _q466 = true;
  Q467: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === 1))) continue;
      let _g468 = 0;
      G469: {
        const _a470 = sp.cells;
        for (let _i471 = 0; _i471 < _a470.length; _i471++) {
          const v_c = _a470[_i471];
          const _h511 = sp.rowOf[v_c];
          const _h519 = sp.colOf[v_c];
          let _c473: boolean = (b.value(v_c) === 1);
          if (_c473) {
            const _t472 = step(sp, v_c, 1);
            _c473 = !(((_t472 !== -1) && (b.value(_t472) === 1)));
          }
          let _c475: boolean = _c473;
          if (_c475) {
            const _t474 = step(sp, v_c, 3);
            _c475 = !(((_t474 !== -1) && (b.value(_t474) === 1)));
          }
          let _c490: boolean = _c475;
          if (_c490) {
            const _t476 = sp.rowOf[v_c];
            _g477.length = 0;
            G478: {
              const _a481 = sp.lineCells[_t476];
              for (let _i482 = 0; _i482 < _a481.length; _i482++) {
                const v_x = _a481[_i482];
                if (!((b.value(v_x) === 1))) continue;
                _g477.push(v_x);
              }
            }
            const _t483 = sp.colOf[v_c];
            _g484.length = 0;
            G485: {
              const _a488 = sp.lineCells[_t483];
              for (let _i489 = 0; _i489 < _a488.length; _i489++) {
                const v_x = _a488[_i489];
                if (!((b.value(v_x) === 1))) continue;
                _g484.push(v_x);
              }
            }
            _c490 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g477), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g484)).length === 1);
          }
          let _c527: boolean = _c490;
          if (_c527) {
            let _q491 = true;
            Q492: {
              const _t493 = sp.rowOf[v_c];
              _g494.length = 0;
              G495: {
                const _a498 = sp.lineCells[_t493];
                for (let _i499 = 0; _i499 < _a498.length; _i499++) {
                  const v_x = _a498[_i499];
                  if (!((b.value(v_x) === 1))) continue;
                  _g494.push(v_x);
                }
              }
              const _t500 = sp.colOf[v_c];
              _g501.length = 0;
              G502: {
                const _a505 = sp.lineCells[_t500];
                for (let _i506 = 0; _i506 < _a505.length; _i506++) {
                  const v_x = _a505[_i506];
                  if (!((b.value(v_x) === 1))) continue;
                  _g501.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g494), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g501));
              const _a507 = v_G;
              for (let _i508 = 0; _i508 < _a507.length; _i508++) {
                const v_x = _a507[_i508];
                const _a509 = sp.adj4[v_x];
                for (let _i510 = 0; _i510 < _a509.length; _i510++) {
                  const v_y = _a509[_i510];
                  let _c518: boolean = !(v_G.includes(v_y));
                  if (_c518) {
                    _g512.length = 0;
                    G513: {
                      const _a516 = sp.lineCells[_h511];
                      for (let _i517 = 0; _i517 < _a516.length; _i517++) {
                        const v_x = _a516[_i517];
                        if (!((b.value(v_x) === 1))) continue;
                        _g512.push(v_x);
                      }
                    }
                    _c518 = ((stretch(sp.lineCells[_h511], v_c, _g512).length === 1) || (sp.lineCells[_h511].includes(v_y)));
                  }
                  let _c526: boolean = _c518;
                  if (_c526) {
                    _g520.length = 0;
                    G521: {
                      const _a524 = sp.lineCells[_h519];
                      for (let _i525 = 0; _i525 < _a524.length; _i525++) {
                        const v_x = _a524[_i525];
                        if (!((b.value(v_x) === 1))) continue;
                        _g520.push(v_x);
                      }
                    }
                    _c526 = ((stretch(sp.lineCells[_h519], v_c, _g520).length === 1) || (sp.lineCells[_h519].includes(v_y)));
                  }
                  if (!(_c526)) continue;
                  if (!((b.value(v_y) === 2))) {
                    _q491 = false;
                    break Q492;
                  }
                }
              }
            }
            _c527 = _q491;
          }
          if (!(_c527)) continue;
          _g468++;
        }
      }
      if (!((cl.fleet.boats[v_k] <= _g468))) {
        _q466 = false;
        break Q467;
      }
    }
  }
  const v_F = _q466;
  const _a528 = sp.cells;
  for (let _i529 = 0; _i529 < _a528.length; _i529++) {
    const v_c = _a528[_i529];
    let _c534: boolean = (v_F && !(b.known(v_c)));
    if (_c534) {
      let _q530 = true;
      Q531: {
        const _a532 = sp.adj4[v_c];
        for (let _i533 = 0; _i533 < _a532.length; _i533++) {
          const v_x = _a532[_i533];
          if (!((b.value(v_x) === 2))) {
            _q530 = false;
            break Q531;
          }
        }
      }
      _c534 = _q530;
    }
    if (!(_c534)) continue;
    facts.length = 0;
    changed = false;
    if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ F: v_F, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface GrowBinding {
  c: number;
  L: number;
  G: readonly number[];
  E: readonly number[];
}

const growFacts: number[] = [];

export function grow(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GrowBinding> | null): number {
  const _g631: number[] = [];
  const _g639: number[] = [];
  const _g668: number[] = [];
  const _g675: number[] = [];
  const _g685: number[] = [];
  const _g692: number[] = [];
  const _g703: number[] = [];
  const _g711: number[] = [];
  const facts = growFacts;
  let fired = 0;
  let changed = false;
  const _a627 = sp.cells;
  for (let _i628 = 0; _i628 < _a627.length; _i628++) {
    const v_c = _a627[_i628];
    if (!((b.value(v_c) === 1))) continue;
    const _a629 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i630 = 0; _i630 < _a629.length; _i630++) {
      const v_L = _a629[_i630];
      _g631.length = 0;
      G632: {
        const _a635 = sp.lineCells[v_L];
        for (let _i636 = 0; _i636 < _a635.length; _i636++) {
          const v_x = _a635[_i636];
          if (!((b.value(v_x) === 1))) continue;
          _g631.push(v_x);
        }
      }
      L637: {
        const v_G = stretch(sp.lineCells[v_L], v_c, _g631);
        const _h638 = v_G.length;
        if (!(((_h638 >= 2) && ((v_G[0] ?? -1) === v_c)))) break L637;
        _g639.length = 0;
        G640: {
          const _a648 = sp.lineCells[v_L];
          for (let _i649 = 0; _i649 < _a648.length; _i649++) {
            const v_x = _a648[_i649];
            let _c654: boolean = !(b.known(v_x));
            if (_c654) {
              let _q650 = false;
              Q651: {
                const _a652 = v_G;
                for (let _i653 = 0; _i653 < _a652.length; _i653++) {
                  const v_g = _a652[_i653];
                  if ((sp.adj4[v_g].includes(v_x))) {
                    _q650 = true;
                    break Q651;
                  }
                }
              }
              _c654 = _q650;
            }
            if (!(_c654)) continue;
            _g639.push(v_x);
          }
        }
        L655: {
          const v_E = _g639;
          const _h656 = v_E.length;
          let _c719: boolean = (_h656 === 1);
          if (_c719) {
            let _q657 = true;
            Q658: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.length[v_k] === _h638))) continue;
                let _g659 = 0;
                G660: {
                  const _a661 = sp.cells;
                  for (let _i662 = 0; _i662 < _a661.length; _i662++) {
                    const v_c = _a661[_i662];
                    const _h702 = sp.rowOf[v_c];
                    const _h710 = sp.colOf[v_c];
                    let _c664: boolean = (b.value(v_c) === 1);
                    if (_c664) {
                      const _t663 = step(sp, v_c, 1);
                      _c664 = !(((_t663 !== -1) && (b.value(_t663) === 1)));
                    }
                    let _c666: boolean = _c664;
                    if (_c666) {
                      const _t665 = step(sp, v_c, 3);
                      _c666 = !(((_t665 !== -1) && (b.value(_t665) === 1)));
                    }
                    let _c681: boolean = _c666;
                    if (_c681) {
                      const _t667 = sp.rowOf[v_c];
                      _g668.length = 0;
                      G669: {
                        const _a672 = sp.lineCells[_t667];
                        for (let _i673 = 0; _i673 < _a672.length; _i673++) {
                          const v_x = _a672[_i673];
                          if (!((b.value(v_x) === 1))) continue;
                          _g668.push(v_x);
                        }
                      }
                      const _t674 = sp.colOf[v_c];
                      _g675.length = 0;
                      G676: {
                        const _a679 = sp.lineCells[_t674];
                        for (let _i680 = 0; _i680 < _a679.length; _i680++) {
                          const v_x = _a679[_i680];
                          if (!((b.value(v_x) === 1))) continue;
                          _g675.push(v_x);
                        }
                      }
                      _c681 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g668), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g675)).length === _h638);
                    }
                    let _c718: boolean = _c681;
                    if (_c718) {
                      let _q682 = true;
                      Q683: {
                        const _t684 = sp.rowOf[v_c];
                        _g685.length = 0;
                        G686: {
                          const _a689 = sp.lineCells[_t684];
                          for (let _i690 = 0; _i690 < _a689.length; _i690++) {
                            const v_x = _a689[_i690];
                            if (!((b.value(v_x) === 1))) continue;
                            _g685.push(v_x);
                          }
                        }
                        const _t691 = sp.colOf[v_c];
                        _g692.length = 0;
                        G693: {
                          const _a696 = sp.lineCells[_t691];
                          for (let _i697 = 0; _i697 < _a696.length; _i697++) {
                            const v_x = _a696[_i697];
                            if (!((b.value(v_x) === 1))) continue;
                            _g692.push(v_x);
                          }
                        }
                        const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g685), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g692));
                        const _a698 = v_G;
                        for (let _i699 = 0; _i699 < _a698.length; _i699++) {
                          const v_x = _a698[_i699];
                          const _a700 = sp.adj4[v_x];
                          for (let _i701 = 0; _i701 < _a700.length; _i701++) {
                            const v_y = _a700[_i701];
                            let _c709: boolean = !(v_G.includes(v_y));
                            if (_c709) {
                              _g703.length = 0;
                              G704: {
                                const _a707 = sp.lineCells[_h702];
                                for (let _i708 = 0; _i708 < _a707.length; _i708++) {
                                  const v_x = _a707[_i708];
                                  if (!((b.value(v_x) === 1))) continue;
                                  _g703.push(v_x);
                                }
                              }
                              _c709 = ((stretch(sp.lineCells[_h702], v_c, _g703).length === 1) || (sp.lineCells[_h702].includes(v_y)));
                            }
                            let _c717: boolean = _c709;
                            if (_c717) {
                              _g711.length = 0;
                              G712: {
                                const _a715 = sp.lineCells[_h710];
                                for (let _i716 = 0; _i716 < _a715.length; _i716++) {
                                  const v_x = _a715[_i716];
                                  if (!((b.value(v_x) === 1))) continue;
                                  _g711.push(v_x);
                                }
                              }
                              _c717 = ((stretch(sp.lineCells[_h710], v_c, _g711).length === 1) || (sp.lineCells[_h710].includes(v_y)));
                            }
                            if (!(_c717)) continue;
                            if (!((b.value(v_y) === 2))) {
                              _q682 = false;
                              break Q683;
                            }
                          }
                        }
                      }
                      _c718 = _q682;
                    }
                    if (!(_c718)) continue;
                    _g659++;
                  }
                }
                if (!((cl.fleet.boats[v_k] <= _g659))) {
                  _q657 = false;
                  break Q658;
                }
              }
            }
            _c719 = _q657;
          }
          if (!(_c719)) break L655;
          facts.length = 0;
          changed = false;
          let _q720 = true;
          Q721: {
            const _a722 = v_E;
            for (let _i723 = 0; _i723 < _a722.length; _i723++) {
              const v_x = _a722[_i723];
              if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q720 = false;
                break Q721;
              }
            }
          }
          if (!(_q720)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, G: v_G, E: v_E }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface OnlyFitBinding {
  M: number;
  L: number;
  c: number;
  R: readonly number[];
  m: number;
  b: number;
}

const onlyFitFacts: number[] = [];

export function onlyFit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyFitBinding> | null): number {
  const _g930: number[] = [];
  const _g937: number[] = [];
  const _g947: number[] = [];
  const _g954: number[] = [];
  const _g965: number[] = [];
  const _g973: number[] = [];
  const _g994: number[] = [];
  const _g1031: number[] = [];
  const _g1038: number[] = [];
  const _g1048: number[] = [];
  const _g1055: number[] = [];
  const _g1066: number[] = [];
  const _g1074: number[] = [];
  const _g1097: number[] = [];
  const facts = onlyFitFacts;
  let fired = 0;
  let changed = false;
  let _g918 = -1;
  G919: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      const _t920 = cl.fleet.length[v_k];
      let _g921 = 0;
      G922: {
        const _a923 = sp.cells;
        for (let _i924 = 0; _i924 < _a923.length; _i924++) {
          const v_c = _a923[_i924];
          const _h964 = sp.rowOf[v_c];
          const _h972 = sp.colOf[v_c];
          let _c926: boolean = (b.value(v_c) === 1);
          if (_c926) {
            const _t925 = step(sp, v_c, 1);
            _c926 = !(((_t925 !== -1) && (b.value(_t925) === 1)));
          }
          let _c928: boolean = _c926;
          if (_c928) {
            const _t927 = step(sp, v_c, 3);
            _c928 = !(((_t927 !== -1) && (b.value(_t927) === 1)));
          }
          let _c943: boolean = _c928;
          if (_c943) {
            const _t929 = sp.rowOf[v_c];
            _g930.length = 0;
            G931: {
              const _a934 = sp.lineCells[_t929];
              for (let _i935 = 0; _i935 < _a934.length; _i935++) {
                const v_x = _a934[_i935];
                if (!((b.value(v_x) === 1))) continue;
                _g930.push(v_x);
              }
            }
            const _t936 = sp.colOf[v_c];
            _g937.length = 0;
            G938: {
              const _a941 = sp.lineCells[_t936];
              for (let _i942 = 0; _i942 < _a941.length; _i942++) {
                const v_x = _a941[_i942];
                if (!((b.value(v_x) === 1))) continue;
                _g937.push(v_x);
              }
            }
            _c943 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g930), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g937)).length === _t920);
          }
          let _c980: boolean = _c943;
          if (_c980) {
            let _q944 = true;
            Q945: {
              const _t946 = sp.rowOf[v_c];
              _g947.length = 0;
              G948: {
                const _a951 = sp.lineCells[_t946];
                for (let _i952 = 0; _i952 < _a951.length; _i952++) {
                  const v_x = _a951[_i952];
                  if (!((b.value(v_x) === 1))) continue;
                  _g947.push(v_x);
                }
              }
              const _t953 = sp.colOf[v_c];
              _g954.length = 0;
              G955: {
                const _a958 = sp.lineCells[_t953];
                for (let _i959 = 0; _i959 < _a958.length; _i959++) {
                  const v_x = _a958[_i959];
                  if (!((b.value(v_x) === 1))) continue;
                  _g954.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g947), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g954));
              const _a960 = v_G;
              for (let _i961 = 0; _i961 < _a960.length; _i961++) {
                const v_x = _a960[_i961];
                const _a962 = sp.adj4[v_x];
                for (let _i963 = 0; _i963 < _a962.length; _i963++) {
                  const v_y = _a962[_i963];
                  let _c971: boolean = !(v_G.includes(v_y));
                  if (_c971) {
                    _g965.length = 0;
                    G966: {
                      const _a969 = sp.lineCells[_h964];
                      for (let _i970 = 0; _i970 < _a969.length; _i970++) {
                        const v_x = _a969[_i970];
                        if (!((b.value(v_x) === 1))) continue;
                        _g965.push(v_x);
                      }
                    }
                    _c971 = ((stretch(sp.lineCells[_h964], v_c, _g965).length === 1) || (sp.lineCells[_h964].includes(v_y)));
                  }
                  let _c979: boolean = _c971;
                  if (_c979) {
                    _g973.length = 0;
                    G974: {
                      const _a977 = sp.lineCells[_h972];
                      for (let _i978 = 0; _i978 < _a977.length; _i978++) {
                        const v_x = _a977[_i978];
                        if (!((b.value(v_x) === 1))) continue;
                        _g973.push(v_x);
                      }
                    }
                    _c979 = ((stretch(sp.lineCells[_h972], v_c, _g973).length === 1) || (sp.lineCells[_h972].includes(v_y)));
                  }
                  if (!(_c979)) continue;
                  if (!((b.value(v_y) === 2))) {
                    _q944 = false;
                    break Q945;
                  }
                }
              }
            }
            _c980 = _q944;
          }
          if (!(_c980)) continue;
          _g921++;
        }
      }
      if (!((cl.fleet.boats[v_k] > _g921))) continue;
      const _t981 = cl.fleet.length[v_k];
      if (_g918 === -1 || _t981 > _g918) _g918 = _t981;
    }
  }
  const v_M = _g918;
  const _a982 = sp.lines;
  for (let _i983 = 0; _i983 < _a982.length; _i983++) {
    const v_L = _a982[_i983];
    const _h1006 = clueAt(cl.n, v_L);
    const _h1007 = (_h1006 < 0);
    const _a984 = sp.lineCells[v_L];
    for (let _i985 = 0; _i985 < _a984.length; _i985++) {
      const v_c = _a984[_i985];
      const _h990 = (v_c % sp.w);
      const _h991 = ((v_c / sp.w) | 0);
      const _h992 = (_h990 + _h991);
      let _c993: boolean = (b.value(v_c) !== 2);
      if (_c993) {
        let _q986 = false;
        Q987: {
          const _a988 = sp.adj4[v_c];
          for (let _i989 = 0; _i989 < _a988.length; _i989++) {
            const v_p = _a988[_i989];
            if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h992)))) continue;
            if ((b.value(v_p) !== 2)) {
              _q986 = true;
              break Q987;
            }
          }
        }
        _c993 = !(_q986);
      }
      if (!(_c993)) continue;
      _g994.length = 0;
      G995: {
        const _a998 = sp.lineCells[v_L];
        for (let _i999 = 0; _i999 < _a998.length; _i999++) {
          const v_x = _a998[_i999];
          if (!((b.value(v_x) !== 2))) continue;
          _g994.push(v_x);
        }
      }
      const v_R = stretch(sp.lineCells[v_L], v_c, _g994);
      const _h1000 = v_R.length;
      L1001: {
        const v_m = _h1000;
        let _c1019: boolean = (v_m === v_M);
        if (_c1019) {
          let _g1002 = 0;
          G1003: {
            const _a1004 = v_R;
            for (let _i1005 = 0; _i1005 < _a1004.length; _i1005++) {
              const v_c = _a1004[_i1005];
              if (!((b.value(v_c) === 1))) continue;
              _g1002++;
            }
          }
          let _c1018: boolean = ((_g1002 < _h1000) && (_h1000 >= v_m));
          if (_c1018) {
            let _c1017: boolean = _h1007;
            if (!_c1017) {
              const _t1008 = sp.lineCells[v_L];
              let _g1009 = 0;
              G1010: {
                const _a1011 = _t1008;
                for (let _i1012 = 0; _i1012 < _a1011.length; _i1012++) {
                  const v_c = _a1011[_i1012];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1009++;
                }
              }
              let _g1013 = 0;
              G1014: {
                const _a1015 = v_R;
                for (let _i1016 = 0; _i1016 < _a1015.length; _i1016++) {
                  const v_c = _a1015[_i1016];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1013++;
                }
              }
              _c1017 = (((_h1006 - _g1009) + _g1013) >= v_m);
            }
            _c1018 = _c1017;
          }
          _c1019 = _c1018;
        }
        if (!(_c1019)) break L1001;
        const _h1128 = (v_m > 1);
        let _g1020 = 0;
        G1021: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            if (!((cl.fleet.length[v_k] === v_m))) continue;
            _g1020 += cl.fleet.boats[v_k];
          }
        }
        let _g1022 = 0;
        G1023: {
          const _a1024 = sp.cells;
          for (let _i1025 = 0; _i1025 < _a1024.length; _i1025++) {
            const v_c = _a1024[_i1025];
            const _h1065 = sp.rowOf[v_c];
            const _h1073 = sp.colOf[v_c];
            let _c1027: boolean = (b.value(v_c) === 1);
            if (_c1027) {
              const _t1026 = step(sp, v_c, 1);
              _c1027 = !(((_t1026 !== -1) && (b.value(_t1026) === 1)));
            }
            let _c1029: boolean = _c1027;
            if (_c1029) {
              const _t1028 = step(sp, v_c, 3);
              _c1029 = !(((_t1028 !== -1) && (b.value(_t1028) === 1)));
            }
            let _c1044: boolean = _c1029;
            if (_c1044) {
              const _t1030 = sp.rowOf[v_c];
              _g1031.length = 0;
              G1032: {
                const _a1035 = sp.lineCells[_t1030];
                for (let _i1036 = 0; _i1036 < _a1035.length; _i1036++) {
                  const v_x = _a1035[_i1036];
                  if (!((b.value(v_x) === 1))) continue;
                  _g1031.push(v_x);
                }
              }
              const _t1037 = sp.colOf[v_c];
              _g1038.length = 0;
              G1039: {
                const _a1042 = sp.lineCells[_t1037];
                for (let _i1043 = 0; _i1043 < _a1042.length; _i1043++) {
                  const v_x = _a1042[_i1043];
                  if (!((b.value(v_x) === 1))) continue;
                  _g1038.push(v_x);
                }
              }
              _c1044 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1031), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1038)).length === v_m);
            }
            let _c1081: boolean = _c1044;
            if (_c1081) {
              let _q1045 = true;
              Q1046: {
                const _t1047 = sp.rowOf[v_c];
                _g1048.length = 0;
                G1049: {
                  const _a1052 = sp.lineCells[_t1047];
                  for (let _i1053 = 0; _i1053 < _a1052.length; _i1053++) {
                    const v_x = _a1052[_i1053];
                    if (!((b.value(v_x) === 1))) continue;
                    _g1048.push(v_x);
                  }
                }
                const _t1054 = sp.colOf[v_c];
                _g1055.length = 0;
                G1056: {
                  const _a1059 = sp.lineCells[_t1054];
                  for (let _i1060 = 0; _i1060 < _a1059.length; _i1060++) {
                    const v_x = _a1059[_i1060];
                    if (!((b.value(v_x) === 1))) continue;
                    _g1055.push(v_x);
                  }
                }
                const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1048), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1055));
                const _a1061 = v_G;
                for (let _i1062 = 0; _i1062 < _a1061.length; _i1062++) {
                  const v_x = _a1061[_i1062];
                  const _a1063 = sp.adj4[v_x];
                  for (let _i1064 = 0; _i1064 < _a1063.length; _i1064++) {
                    const v_y = _a1063[_i1064];
                    let _c1072: boolean = !(v_G.includes(v_y));
                    if (_c1072) {
                      _g1066.length = 0;
                      G1067: {
                        const _a1070 = sp.lineCells[_h1065];
                        for (let _i1071 = 0; _i1071 < _a1070.length; _i1071++) {
                          const v_x = _a1070[_i1071];
                          if (!((b.value(v_x) === 1))) continue;
                          _g1066.push(v_x);
                        }
                      }
                      _c1072 = ((stretch(sp.lineCells[_h1065], v_c, _g1066).length === 1) || (sp.lineCells[_h1065].includes(v_y)));
                    }
                    let _c1080: boolean = _c1072;
                    if (_c1080) {
                      _g1074.length = 0;
                      G1075: {
                        const _a1078 = sp.lineCells[_h1073];
                        for (let _i1079 = 0; _i1079 < _a1078.length; _i1079++) {
                          const v_x = _a1078[_i1079];
                          if (!((b.value(v_x) === 1))) continue;
                          _g1074.push(v_x);
                        }
                      }
                      _c1080 = ((stretch(sp.lineCells[_h1073], v_c, _g1074).length === 1) || (sp.lineCells[_h1073].includes(v_y)));
                    }
                    if (!(_c1080)) continue;
                    if (!((b.value(v_y) === 2))) {
                      _q1045 = false;
                      break Q1046;
                    }
                  }
                }
              }
              _c1081 = _q1045;
            }
            if (!(_c1081)) continue;
            _g1022++;
          }
        }
        L1082: {
          const v_b = (_g1020 - _g1022);
          let _c1123: boolean = (v_b === 1);
          if (_c1123) {
            let _g1083 = 0;
            G1084: {
              const _a1085 = sp.lines;
              for (let _i1086 = 0; _i1086 < _a1085.length; _i1086++) {
                const v_K = _a1085[_i1086];
                const _h1109 = clueAt(cl.n, v_K);
                const _h1110 = (_h1109 < 0);
                const _a1087 = sp.lineCells[v_K];
                for (let _i1088 = 0; _i1088 < _a1087.length; _i1088++) {
                  const v_d = _a1087[_i1088];
                  const _h1093 = (v_d % sp.w);
                  const _h1094 = ((v_d / sp.w) | 0);
                  const _h1095 = (_h1093 + _h1094);
                  let _c1096: boolean = (b.value(v_d) !== 2);
                  if (_c1096) {
                    let _q1089 = false;
                    Q1090: {
                      const _a1091 = sp.adj4[v_d];
                      for (let _i1092 = 0; _i1092 < _a1091.length; _i1092++) {
                        const v_p = _a1091[_i1092];
                        if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h1095)))) continue;
                        if ((b.value(v_p) !== 2)) {
                          _q1089 = true;
                          break Q1090;
                        }
                      }
                    }
                    _c1096 = !(_q1089);
                  }
                  let _c1122: boolean = _c1096;
                  if (_c1122) {
                    _g1097.length = 0;
                    G1098: {
                      const _a1101 = sp.lineCells[v_K];
                      for (let _i1102 = 0; _i1102 < _a1101.length; _i1102++) {
                        const v_x = _a1101[_i1102];
                        if (!((b.value(v_x) !== 2))) continue;
                        _g1097.push(v_x);
                      }
                    }
                    const _t1103 = stretch(sp.lineCells[v_K], v_d, _g1097);
                    const _h1108 = _t1103.length;
                    let _g1104 = 0;
                    G1105: {
                      const _a1106 = _t1103;
                      for (let _i1107 = 0; _i1107 < _a1106.length; _i1107++) {
                        const v_c = _a1106[_i1107];
                        if (!((b.value(v_c) === 1))) continue;
                        _g1104++;
                      }
                    }
                    let _c1121: boolean = ((_g1104 < _h1108) && (_h1108 >= v_m));
                    if (_c1121) {
                      let _c1120: boolean = _h1110;
                      if (!_c1120) {
                        const _t1111 = sp.lineCells[v_K];
                        let _g1112 = 0;
                        G1113: {
                          const _a1114 = _t1111;
                          for (let _i1115 = 0; _i1115 < _a1114.length; _i1115++) {
                            const v_c = _a1114[_i1115];
                            if (!((b.value(v_c) === 1))) continue;
                            _g1112++;
                          }
                        }
                        let _g1116 = 0;
                        G1117: {
                          const _a1118 = _t1103;
                          for (let _i1119 = 0; _i1119 < _a1118.length; _i1119++) {
                            const v_c = _a1118[_i1119];
                            if (!((b.value(v_c) === 1))) continue;
                            _g1116++;
                          }
                        }
                        _c1120 = (((_h1109 - _g1112) + _g1116) >= v_m);
                      }
                      _c1121 = _c1120;
                    }
                    _c1122 = _c1121;
                  }
                  if (!(_c1122)) continue;
                  _g1083++;
                }
              }
            }
            _c1123 = (_g1083 === 1);
          }
          if (!(_c1123)) break L1082;
          facts.length = 0;
          changed = false;
          let _q1124 = true;
          Q1125: {
            const _a1126 = v_R;
            for (let _i1127 = 0; _i1127 < _a1126.length; _i1127++) {
              const v_x = _a1126[_i1127];
              if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c1134: boolean = true;
              if (_c1134) {
                let _c1133: boolean = _h1128;
                if (!_c1133) {
                  let _q1129 = true;
                  Q1130: {
                    const _a1131 = sp.adj4[v_x];
                    for (let _i1132 = 0; _i1132 < _a1131.length; _i1132++) {
                      const v_y = _a1131[_i1132];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!b.known(v_y)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q1129 = false;
                        break Q1130;
                      }
                    }
                  }
                  _c1133 = _q1129;
                }
                _c1134 = _c1133;
              }
              if (!(_c1134)) {
                _q1124 = false;
                break Q1125;
              }
            }
          }
          if (!(_q1124)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ M: v_M, L: v_L, c: v_c, R: v_R, m: v_m, b: v_b }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface CenterRoomBinding {
  c: number;
  L: number;
  v: number;
  S: readonly number[];
}

const centerRoomFacts: number[] = [];

export function centerRoom(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterRoomBinding> | null): number {
  const _g1164: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a1157 = sp.cells;
  for (let _i1158 = 0; _i1158 < _a1157.length; _i1158++) {
    const v_c = _a1157[_i1158];
    const _h1159 = clueAt(cl.seg, v_c);
    if (!((_h1159 === 6))) continue;
    const _a1160 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i1161 = 0; _i1161 < _a1160.length; _i1161++) {
      const v_L = _a1160[_i1161];
      const _h1162 = clueAt(cl.n, v_L);
      L1163: {
        const v_v = _h1162;
        if (!((v_v >= 0))) break L1163;
        _g1164.length = 0;
        G1165: {
          const _a1168 = sp.adj4[v_c];
          for (let _i1169 = 0; _i1169 < _a1168.length; _i1169++) {
            const v_x = _a1168[_i1169];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g1164.push(v_x);
          }
        }
        L1170: {
          const v_S = _g1164;
          const _h1171 = v_S.length;
          let _c1181: boolean = (_h1171 === 2);
          if (_c1181) {
            const _t1172 = sp.lineCells[v_L];
            let _g1173 = 0;
            G1174: {
              const _a1175 = _t1172;
              for (let _i1176 = 0; _i1176 < _a1175.length; _i1176++) {
                const v_c = _a1175[_i1176];
                if (!((b.value(v_c) === 1))) continue;
                _g1173++;
              }
            }
            let _g1177 = 0;
            G1178: {
              const _a1179 = v_S;
              for (let _i1180 = 0; _i1180 < _a1179.length; _i1180++) {
                const v_x = _a1179[_i1180];
                if (!((b.value(v_x) !== 1))) continue;
                _g1177++;
              }
            }
            _c1181 = ((v_v - _g1173) < _g1177);
          }
          if (!(_c1181)) break L1170;
          facts.length = 0;
          changed = false;
          let _q1182 = true;
          Q1183: {
            const _a1184 = v_S;
            for (let _i1185 = 0; _i1185 < _a1184.length; _i1185++) {
              const v_x = _a1184[_i1185];
              if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q1182 = false;
                break Q1183;
              }
            }
          }
          if (!(_q1182)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, v: v_v, S: v_S }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface TooLongBinding {
  M: number;
  c: number;
}

const tooLongFacts: number[] = [];

export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding> | null): number {
  const _g1283: number[] = [];
  const _g1290: number[] = [];
  const _g1300: number[] = [];
  const _g1307: number[] = [];
  const _g1318: number[] = [];
  const _g1326: number[] = [];
  const _g1342: number[] = [];
  const _g1349: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  let _g1271 = -1;
  G1272: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      const _t1273 = cl.fleet.length[v_k];
      let _g1274 = 0;
      G1275: {
        const _a1276 = sp.cells;
        for (let _i1277 = 0; _i1277 < _a1276.length; _i1277++) {
          const v_c = _a1276[_i1277];
          const _h1317 = sp.rowOf[v_c];
          const _h1325 = sp.colOf[v_c];
          let _c1279: boolean = (b.value(v_c) === 1);
          if (_c1279) {
            const _t1278 = step(sp, v_c, 1);
            _c1279 = !(((_t1278 !== -1) && (b.value(_t1278) === 1)));
          }
          let _c1281: boolean = _c1279;
          if (_c1281) {
            const _t1280 = step(sp, v_c, 3);
            _c1281 = !(((_t1280 !== -1) && (b.value(_t1280) === 1)));
          }
          let _c1296: boolean = _c1281;
          if (_c1296) {
            const _t1282 = sp.rowOf[v_c];
            _g1283.length = 0;
            G1284: {
              const _a1287 = sp.lineCells[_t1282];
              for (let _i1288 = 0; _i1288 < _a1287.length; _i1288++) {
                const v_x = _a1287[_i1288];
                if (!((b.value(v_x) === 1))) continue;
                _g1283.push(v_x);
              }
            }
            const _t1289 = sp.colOf[v_c];
            _g1290.length = 0;
            G1291: {
              const _a1294 = sp.lineCells[_t1289];
              for (let _i1295 = 0; _i1295 < _a1294.length; _i1295++) {
                const v_x = _a1294[_i1295];
                if (!((b.value(v_x) === 1))) continue;
                _g1290.push(v_x);
              }
            }
            _c1296 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1283), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1290)).length === _t1273);
          }
          let _c1333: boolean = _c1296;
          if (_c1333) {
            let _q1297 = true;
            Q1298: {
              const _t1299 = sp.rowOf[v_c];
              _g1300.length = 0;
              G1301: {
                const _a1304 = sp.lineCells[_t1299];
                for (let _i1305 = 0; _i1305 < _a1304.length; _i1305++) {
                  const v_x = _a1304[_i1305];
                  if (!((b.value(v_x) === 1))) continue;
                  _g1300.push(v_x);
                }
              }
              const _t1306 = sp.colOf[v_c];
              _g1307.length = 0;
              G1308: {
                const _a1311 = sp.lineCells[_t1306];
                for (let _i1312 = 0; _i1312 < _a1311.length; _i1312++) {
                  const v_x = _a1311[_i1312];
                  if (!((b.value(v_x) === 1))) continue;
                  _g1307.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1300), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1307));
              const _a1313 = v_G;
              for (let _i1314 = 0; _i1314 < _a1313.length; _i1314++) {
                const v_x = _a1313[_i1314];
                const _a1315 = sp.adj4[v_x];
                for (let _i1316 = 0; _i1316 < _a1315.length; _i1316++) {
                  const v_y = _a1315[_i1316];
                  let _c1324: boolean = !(v_G.includes(v_y));
                  if (_c1324) {
                    _g1318.length = 0;
                    G1319: {
                      const _a1322 = sp.lineCells[_h1317];
                      for (let _i1323 = 0; _i1323 < _a1322.length; _i1323++) {
                        const v_x = _a1322[_i1323];
                        if (!((b.value(v_x) === 1))) continue;
                        _g1318.push(v_x);
                      }
                    }
                    _c1324 = ((stretch(sp.lineCells[_h1317], v_c, _g1318).length === 1) || (sp.lineCells[_h1317].includes(v_y)));
                  }
                  let _c1332: boolean = _c1324;
                  if (_c1332) {
                    _g1326.length = 0;
                    G1327: {
                      const _a1330 = sp.lineCells[_h1325];
                      for (let _i1331 = 0; _i1331 < _a1330.length; _i1331++) {
                        const v_x = _a1330[_i1331];
                        if (!((b.value(v_x) === 1))) continue;
                        _g1326.push(v_x);
                      }
                    }
                    _c1332 = ((stretch(sp.lineCells[_h1325], v_c, _g1326).length === 1) || (sp.lineCells[_h1325].includes(v_y)));
                  }
                  if (!(_c1332)) continue;
                  if (!((b.value(v_y) === 2))) {
                    _q1297 = false;
                    break Q1298;
                  }
                }
              }
            }
            _c1333 = _q1297;
          }
          if (!(_c1333)) continue;
          _g1274++;
        }
      }
      if (!((cl.fleet.boats[v_k] > _g1274))) continue;
      const _t1334 = cl.fleet.length[v_k];
      if (_g1271 === -1 || _t1334 > _g1271) _g1271 = _t1334;
    }
  }
  const v_M = _g1271;
  const _a1335 = sp.cells;
  for (let _i1336 = 0; _i1336 < _a1335.length; _i1336++) {
    const v_c = _a1335[_i1336];
    let _c1355: boolean = !(b.known(v_c));
    if (_c1355) {
      let _g1337 = 0;
      G1338: {
        const _a1339 = sp.adj4[v_c];
        for (let _i1340 = 0; _i1340 < _a1339.length; _i1340++) {
          const v_a = _a1339[_i1340];
          if (!((b.value(v_a) === 1))) continue;
          const _t1341 = sp.rowOf[v_a];
          _g1342.length = 0;
          G1343: {
            const _a1346 = sp.lineCells[_t1341];
            for (let _i1347 = 0; _i1347 < _a1346.length; _i1347++) {
              const v_x = _a1346[_i1347];
              if (!((b.value(v_x) === 1))) continue;
              _g1342.push(v_x);
            }
          }
          const _t1348 = sp.colOf[v_a];
          _g1349.length = 0;
          G1350: {
            const _a1353 = sp.lineCells[_t1348];
            for (let _i1354 = 0; _i1354 < _a1353.length; _i1354++) {
              const v_x = _a1353[_i1354];
              if (!((b.value(v_x) === 1))) continue;
              _g1349.push(v_x);
            }
          }
          _g1337 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g1342), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g1349)).length;
        }
      }
      _c1355 = ((1 + _g1337) > v_M);
    }
    if (!(_c1355)) continue;
    facts.length = 0;
    changed = false;
    if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ M: v_M, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface ShortRunBinding {
  L: number;
  c: number;
  R: readonly number[];
  O: readonly number[];
}

const shortRunFacts: number[] = [];

export function shortRun(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ShortRunBinding> | null): number {
  const _g1442: number[] = [];
  const _g1450: number[] = [];
  const _g1469: number[] = [];
  const _g1476: number[] = [];
  const _g1486: number[] = [];
  const _g1493: number[] = [];
  const _g1504: number[] = [];
  const _g1512: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a1438 = sp.lines;
  for (let _i1439 = 0; _i1439 < _a1438.length; _i1439++) {
    const v_L = _a1438[_i1439];
    const _a1440 = sp.lineCells[v_L];
    for (let _i1441 = 0; _i1441 < _a1440.length; _i1441++) {
      const v_c = _a1440[_i1441];
      _g1442.length = 0;
      G1443: {
        const _a1446 = sp.lineCells[v_L];
        for (let _i1447 = 0; _i1447 < _a1446.length; _i1447++) {
          const v_x = _a1446[_i1447];
          if (!((b.value(v_x) !== 2))) continue;
          _g1442.push(v_x);
        }
      }
      L1448: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g1442);
        const _h1449 = v_R.length;
        if (!(((_h1449 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L1448;
        _g1450.length = 0;
        G1451: {
          const _a1454 = v_R;
          for (let _i1455 = 0; _i1455 < _a1454.length; _i1455++) {
            const v_c = _a1454[_i1455];
            if (!(!(b.known(v_c)))) continue;
            _g1450.push(v_c);
          }
        }
        L1456: {
          const v_O = _g1450;
          const _h1457 = v_O.length;
          let _c1520: boolean = (_h1457 === 1);
          if (_c1520) {
            let _q1458 = true;
            Q1459: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.length[v_k] === _h1449))) continue;
                let _g1460 = 0;
                G1461: {
                  const _a1462 = sp.cells;
                  for (let _i1463 = 0; _i1463 < _a1462.length; _i1463++) {
                    const v_c = _a1462[_i1463];
                    const _h1503 = sp.rowOf[v_c];
                    const _h1511 = sp.colOf[v_c];
                    let _c1465: boolean = (b.value(v_c) === 1);
                    if (_c1465) {
                      const _t1464 = step(sp, v_c, 1);
                      _c1465 = !(((_t1464 !== -1) && (b.value(_t1464) === 1)));
                    }
                    let _c1467: boolean = _c1465;
                    if (_c1467) {
                      const _t1466 = step(sp, v_c, 3);
                      _c1467 = !(((_t1466 !== -1) && (b.value(_t1466) === 1)));
                    }
                    let _c1482: boolean = _c1467;
                    if (_c1482) {
                      const _t1468 = sp.rowOf[v_c];
                      _g1469.length = 0;
                      G1470: {
                        const _a1473 = sp.lineCells[_t1468];
                        for (let _i1474 = 0; _i1474 < _a1473.length; _i1474++) {
                          const v_x = _a1473[_i1474];
                          if (!((b.value(v_x) === 1))) continue;
                          _g1469.push(v_x);
                        }
                      }
                      const _t1475 = sp.colOf[v_c];
                      _g1476.length = 0;
                      G1477: {
                        const _a1480 = sp.lineCells[_t1475];
                        for (let _i1481 = 0; _i1481 < _a1480.length; _i1481++) {
                          const v_x = _a1480[_i1481];
                          if (!((b.value(v_x) === 1))) continue;
                          _g1476.push(v_x);
                        }
                      }
                      _c1482 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1469), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1476)).length === _h1449);
                    }
                    let _c1519: boolean = _c1482;
                    if (_c1519) {
                      let _q1483 = true;
                      Q1484: {
                        const _t1485 = sp.rowOf[v_c];
                        _g1486.length = 0;
                        G1487: {
                          const _a1490 = sp.lineCells[_t1485];
                          for (let _i1491 = 0; _i1491 < _a1490.length; _i1491++) {
                            const v_x = _a1490[_i1491];
                            if (!((b.value(v_x) === 1))) continue;
                            _g1486.push(v_x);
                          }
                        }
                        const _t1492 = sp.colOf[v_c];
                        _g1493.length = 0;
                        G1494: {
                          const _a1497 = sp.lineCells[_t1492];
                          for (let _i1498 = 0; _i1498 < _a1497.length; _i1498++) {
                            const v_x = _a1497[_i1498];
                            if (!((b.value(v_x) === 1))) continue;
                            _g1493.push(v_x);
                          }
                        }
                        const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1486), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1493));
                        const _a1499 = v_G;
                        for (let _i1500 = 0; _i1500 < _a1499.length; _i1500++) {
                          const v_x = _a1499[_i1500];
                          const _a1501 = sp.adj4[v_x];
                          for (let _i1502 = 0; _i1502 < _a1501.length; _i1502++) {
                            const v_y = _a1501[_i1502];
                            let _c1510: boolean = !(v_G.includes(v_y));
                            if (_c1510) {
                              _g1504.length = 0;
                              G1505: {
                                const _a1508 = sp.lineCells[_h1503];
                                for (let _i1509 = 0; _i1509 < _a1508.length; _i1509++) {
                                  const v_x = _a1508[_i1509];
                                  if (!((b.value(v_x) === 1))) continue;
                                  _g1504.push(v_x);
                                }
                              }
                              _c1510 = ((stretch(sp.lineCells[_h1503], v_c, _g1504).length === 1) || (sp.lineCells[_h1503].includes(v_y)));
                            }
                            let _c1518: boolean = _c1510;
                            if (_c1518) {
                              _g1512.length = 0;
                              G1513: {
                                const _a1516 = sp.lineCells[_h1511];
                                for (let _i1517 = 0; _i1517 < _a1516.length; _i1517++) {
                                  const v_x = _a1516[_i1517];
                                  if (!((b.value(v_x) === 1))) continue;
                                  _g1512.push(v_x);
                                }
                              }
                              _c1518 = ((stretch(sp.lineCells[_h1511], v_c, _g1512).length === 1) || (sp.lineCells[_h1511].includes(v_y)));
                            }
                            if (!(_c1518)) continue;
                            if (!((b.value(v_y) === 2))) {
                              _q1483 = false;
                              break Q1484;
                            }
                          }
                        }
                      }
                      _c1519 = _q1483;
                    }
                    if (!(_c1519)) continue;
                    _g1460++;
                  }
                }
                if (!((cl.fleet.boats[v_k] <= _g1460))) {
                  _q1458 = false;
                  break Q1459;
                }
              }
            }
            _c1520 = _q1458;
          }
          if (!(_c1520)) break L1456;
          facts.length = 0;
          changed = false;
          let _q1521 = true;
          Q1522: {
            const _a1523 = v_O;
            for (let _i1524 = 0; _i1524 < _a1523.length; _i1524++) {
              const v_x = _a1523[_i1524];
              if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q1521 = false;
                break Q1522;
              }
            }
          }
          if (!(_q1521)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R, O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface HiddenBinding {
  L: number;
  O: readonly number[];
  v: number;
  left: number;
}

const hiddenFacts: number[] = [];

export function hidden(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<HiddenBinding> | null): number {
  const _g1596: number[] = [];
  const _g1611: number[] = [];
  const _g1621: number[] = [];
  const _g1633: number[] = [];
  const _g1644: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a1592 = sp.lines;
  for (let _i1593 = 0; _i1593 < _a1592.length; _i1593++) {
    const v_L = _a1592[_i1593];
    const _h1594 = clueAt(cl.n, v_L);
    if (!((_h1594 < 0))) continue;
    const _t1595 = sp.lineCells[v_L];
    _g1596.length = 0;
    G1597: {
      const _a1600 = _t1595;
      for (let _i1601 = 0; _i1601 < _a1600.length; _i1601++) {
        const v_c = _a1600[_i1601];
        if (!(!(b.known(v_c)))) continue;
        _g1596.push(v_c);
      }
    }
    L1602: {
      const v_O = _g1596;
      const _h1603 = v_O.length;
      if (!((_h1603 > 0))) break L1602;
      let _g1604 = -1;
      G1605: {
        const _a1606 = setOf(v_L);
        for (let _i1607 = 0; _i1607 < _a1606.length; _i1607++) {
          const v_K = _a1606[_i1607];
          const _h1608 = clueAt(cl.n, v_K);
          let _c1628: boolean = (_h1608 < 0);
          if (_c1628) {
            let _q1609 = true;
            Q1610: {
              _g1611.length = 0;
              G1612: {
                const _a1615 = sp.lines;
                for (let _i1616 = 0; _i1616 < _a1615.length; _i1616++) {
                  const v_M = _a1615[_i1616];
                  if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                  _g1611.push(v_M);
                }
              }
              const _a1617 = _g1611;
              for (let _i1618 = 0; _i1618 < _a1617.length; _i1618++) {
                const v_M = _a1617[_i1618];
                const _h1619 = clueAt(cl.n, v_M);
                let _c1627: boolean = (_h1619 >= 0);
                if (!_c1627) {
                  const _t1620 = sp.lineCells[v_M];
                  _g1621.length = 0;
                  G1622: {
                    const _a1625 = _t1620;
                    for (let _i1626 = 0; _i1626 < _a1625.length; _i1626++) {
                      const v_c = _a1625[_i1626];
                      if (!(!(b.known(v_c)))) continue;
                      _g1621.push(v_c);
                    }
                  }
                  _c1627 = (_g1621.length === 0);
                }
                if (!(_c1627)) {
                  _q1609 = false;
                  break Q1610;
                }
              }
            }
            _c1628 = _q1609;
          }
          if (!(_c1628)) continue;
          let _g1629 = 0;
          G1630: {
            for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
              _g1629 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
            }
          }
          let _g1631 = 0;
          G1632: {
            _g1633.length = 0;
            G1634: {
              const _a1637 = sp.lines;
              for (let _i1638 = 0; _i1638 < _a1637.length; _i1638++) {
                const v_M = _a1637[_i1638];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g1633.push(v_M);
              }
            }
            const _a1639 = _g1633;
            for (let _i1640 = 0; _i1640 < _a1639.length; _i1640++) {
              const v_M = _a1639[_i1640];
              const _h1641 = clueAt(cl.n, v_M);
              if (!((_h1641 >= 0))) continue;
              _g1631 += _h1641;
            }
          }
          let _g1642 = 0;
          G1643: {
            _g1644.length = 0;
            G1645: {
              const _a1648 = sp.lines;
              for (let _i1649 = 0; _i1649 < _a1648.length; _i1649++) {
                const v_M = _a1648[_i1649];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g1644.push(v_M);
              }
            }
            const _a1650 = _g1644;
            for (let _i1651 = 0; _i1651 < _a1650.length; _i1651++) {
              const v_M = _a1650[_i1651];
              const _h1652 = clueAt(cl.n, v_M);
              if (!((_h1652 < 0))) continue;
              const _t1653 = sp.lineCells[v_M];
              let _g1654 = 0;
              G1655: {
                const _a1656 = _t1653;
                for (let _i1657 = 0; _i1657 < _a1656.length; _i1657++) {
                  const v_c = _a1656[_i1657];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1654++;
                }
              }
              _g1642 += _g1654;
            }
          }
          const _t1658 = ((_g1629 - _g1631) - _g1642);
          if (_g1604 === -1 || _t1658 > _g1604) _g1604 = _t1658;
        }
      }
      L1659: {
        const v_v = _g1604;
        if (!((v_v >= 0))) break L1659;
        const _t1660 = sp.lineCells[v_L];
        let _g1661 = 0;
        G1662: {
          const _a1663 = _t1660;
          for (let _i1664 = 0; _i1664 < _a1663.length; _i1664++) {
            const v_c = _a1663[_i1664];
            if (!((b.value(v_c) === 1))) continue;
            _g1661++;
          }
        }
        const v_left = (v_v - _g1661);
        facts.length = 0;
        changed = false;
        let _c1670: boolean = ((v_left >= 0) && (v_left <= _h1603));
        if (_c1670) {
          let _c1669: boolean = !((v_left === 0));
          if (!_c1669) {
            let _q1665 = true;
            Q1666: {
              const _a1667 = v_O;
              for (let _i1668 = 0; _i1668 < _a1667.length; _i1668++) {
                const v_c = _a1667[_i1668];
                if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q1665 = false;
                  break Q1666;
                }
              }
            }
            _c1669 = _q1665;
          }
          _c1670 = _c1669;
        }
        let _c1676: boolean = _c1670;
        if (_c1676) {
          let _c1675: boolean = !((v_left === _h1603));
          if (!_c1675) {
            let _q1671 = true;
            Q1672: {
              const _a1673 = v_O;
              for (let _i1674 = 0; _i1674 < _a1673.length; _i1674++) {
                const v_c = _a1673[_i1674];
                if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q1671 = false;
                  break Q1672;
                }
              }
            }
            _c1675 = _q1671;
          }
          _c1676 = _c1675;
        }
        if (!(_c1676)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, O: v_O, v: v_v, left: v_left }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface OnlyRunsBinding {
  m: number;
  L: number;
  c: number;
  R: readonly number[];
  C: readonly number[];
  b: number;
  r: number;
}

const onlyRunsFacts: number[] = [];

export function onlyRuns(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyRunsBinding> | null): number {
  const _g1928: number[] = [];
  const _g1935: number[] = [];
  const _g1945: number[] = [];
  const _g1952: number[] = [];
  const _g1963: number[] = [];
  const _g1971: number[] = [];
  const _g1993: number[] = [];
  const _g2024: number[] = [];
  const _g2044: number[] = [];
  const _g2051: number[] = [];
  const _g2061: number[] = [];
  const _g2068: number[] = [];
  const _g2079: number[] = [];
  const _g2087: number[] = [];
  const _g2109: number[] = [];
  const _g2150: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  let _g1916 = -1;
  G1917: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      const _t1918 = cl.fleet.length[v_k];
      let _g1919 = 0;
      G1920: {
        const _a1921 = sp.cells;
        for (let _i1922 = 0; _i1922 < _a1921.length; _i1922++) {
          const v_c = _a1921[_i1922];
          const _h1962 = sp.rowOf[v_c];
          const _h1970 = sp.colOf[v_c];
          let _c1924: boolean = (b.value(v_c) === 1);
          if (_c1924) {
            const _t1923 = step(sp, v_c, 1);
            _c1924 = !(((_t1923 !== -1) && (b.value(_t1923) === 1)));
          }
          let _c1926: boolean = _c1924;
          if (_c1926) {
            const _t1925 = step(sp, v_c, 3);
            _c1926 = !(((_t1925 !== -1) && (b.value(_t1925) === 1)));
          }
          let _c1941: boolean = _c1926;
          if (_c1941) {
            const _t1927 = sp.rowOf[v_c];
            _g1928.length = 0;
            G1929: {
              const _a1932 = sp.lineCells[_t1927];
              for (let _i1933 = 0; _i1933 < _a1932.length; _i1933++) {
                const v_x = _a1932[_i1933];
                if (!((b.value(v_x) === 1))) continue;
                _g1928.push(v_x);
              }
            }
            const _t1934 = sp.colOf[v_c];
            _g1935.length = 0;
            G1936: {
              const _a1939 = sp.lineCells[_t1934];
              for (let _i1940 = 0; _i1940 < _a1939.length; _i1940++) {
                const v_x = _a1939[_i1940];
                if (!((b.value(v_x) === 1))) continue;
                _g1935.push(v_x);
              }
            }
            _c1941 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1928), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1935)).length === _t1918);
          }
          let _c1978: boolean = _c1941;
          if (_c1978) {
            let _q1942 = true;
            Q1943: {
              const _t1944 = sp.rowOf[v_c];
              _g1945.length = 0;
              G1946: {
                const _a1949 = sp.lineCells[_t1944];
                for (let _i1950 = 0; _i1950 < _a1949.length; _i1950++) {
                  const v_x = _a1949[_i1950];
                  if (!((b.value(v_x) === 1))) continue;
                  _g1945.push(v_x);
                }
              }
              const _t1951 = sp.colOf[v_c];
              _g1952.length = 0;
              G1953: {
                const _a1956 = sp.lineCells[_t1951];
                for (let _i1957 = 0; _i1957 < _a1956.length; _i1957++) {
                  const v_x = _a1956[_i1957];
                  if (!((b.value(v_x) === 1))) continue;
                  _g1952.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1945), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1952));
              const _a1958 = v_G;
              for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
                const v_x = _a1958[_i1959];
                const _a1960 = sp.adj4[v_x];
                for (let _i1961 = 0; _i1961 < _a1960.length; _i1961++) {
                  const v_y = _a1960[_i1961];
                  let _c1969: boolean = !(v_G.includes(v_y));
                  if (_c1969) {
                    _g1963.length = 0;
                    G1964: {
                      const _a1967 = sp.lineCells[_h1962];
                      for (let _i1968 = 0; _i1968 < _a1967.length; _i1968++) {
                        const v_x = _a1967[_i1968];
                        if (!((b.value(v_x) === 1))) continue;
                        _g1963.push(v_x);
                      }
                    }
                    _c1969 = ((stretch(sp.lineCells[_h1962], v_c, _g1963).length === 1) || (sp.lineCells[_h1962].includes(v_y)));
                  }
                  let _c1977: boolean = _c1969;
                  if (_c1977) {
                    _g1971.length = 0;
                    G1972: {
                      const _a1975 = sp.lineCells[_h1970];
                      for (let _i1976 = 0; _i1976 < _a1975.length; _i1976++) {
                        const v_x = _a1975[_i1976];
                        if (!((b.value(v_x) === 1))) continue;
                        _g1971.push(v_x);
                      }
                    }
                    _c1977 = ((stretch(sp.lineCells[_h1970], v_c, _g1971).length === 1) || (sp.lineCells[_h1970].includes(v_y)));
                  }
                  if (!(_c1977)) continue;
                  if (!((b.value(v_y) === 2))) {
                    _q1942 = false;
                    break Q1943;
                  }
                }
              }
            }
            _c1978 = _q1942;
          }
          if (!(_c1978)) continue;
          _g1919++;
        }
      }
      if (!((cl.fleet.boats[v_k] > _g1919))) continue;
      const _t1979 = cl.fleet.length[v_k];
      if (_g1916 === -1 || _t1979 > _g1916) _g1916 = _t1979;
    }
  }
  L1980: {
    const v_m = _g1916;
    if (!((v_m > 0))) break L1980;
    const _h2023 = (2 * v_m);
    const _h2175 = (_h2023 + 1);
    const _a1981 = sp.lines;
    for (let _i1982 = 0; _i1982 < _a1981.length; _i1982++) {
      const v_L = _a1981[_i1982];
      const _h2009 = clueAt(cl.n, v_L);
      const _h2010 = (_h2009 < 0);
      const _a1983 = sp.lineCells[v_L];
      for (let _i1984 = 0; _i1984 < _a1983.length; _i1984++) {
        const v_c = _a1983[_i1984];
        const _h1989 = (v_c % sp.w);
        const _h1990 = ((v_c / sp.w) | 0);
        const _h1991 = (_h1989 + _h1990);
        let _c1992: boolean = (b.value(v_c) !== 2);
        if (_c1992) {
          let _q1985 = false;
          Q1986: {
            const _a1987 = sp.adj4[v_c];
            for (let _i1988 = 0; _i1988 < _a1987.length; _i1988++) {
              const v_p = _a1987[_i1988];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h1991)))) continue;
              if ((b.value(v_p) !== 2)) {
                _q1985 = true;
                break Q1986;
              }
            }
          }
          _c1992 = !(_q1985);
        }
        if (!(_c1992)) continue;
        _g1993.length = 0;
        G1994: {
          const _a1997 = sp.lineCells[v_L];
          for (let _i1998 = 0; _i1998 < _a1997.length; _i1998++) {
            const v_x = _a1997[_i1998];
            if (!((b.value(v_x) !== 2))) continue;
            _g1993.push(v_x);
          }
        }
        L1999: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g1993);
          const _h2004 = v_R.length;
          let _g2000 = 0;
          G2001: {
            const _a2002 = v_R;
            for (let _i2003 = 0; _i2003 < _a2002.length; _i2003++) {
              const v_c = _a2002[_i2003];
              if (!((b.value(v_c) === 1))) continue;
              _g2000++;
            }
          }
          let _c2022: boolean = (_g2000 < _h2004);
          if (_c2022) {
            let _g2005 = 0;
            G2006: {
              const _a2007 = v_R;
              for (let _i2008 = 0; _i2008 < _a2007.length; _i2008++) {
                const v_c = _a2007[_i2008];
                if (!((b.value(v_c) === 1))) continue;
                _g2005++;
              }
            }
            let _c2021: boolean = ((_g2005 < _h2004) && (_h2004 >= v_m));
            if (_c2021) {
              let _c2020: boolean = _h2010;
              if (!_c2020) {
                const _t2011 = sp.lineCells[v_L];
                let _g2012 = 0;
                G2013: {
                  const _a2014 = _t2011;
                  for (let _i2015 = 0; _i2015 < _a2014.length; _i2015++) {
                    const v_c = _a2014[_i2015];
                    if (!((b.value(v_c) === 1))) continue;
                    _g2012++;
                  }
                }
                let _g2016 = 0;
                G2017: {
                  const _a2018 = v_R;
                  for (let _i2019 = 0; _i2019 < _a2018.length; _i2019++) {
                    const v_c = _a2018[_i2019];
                    if (!((b.value(v_c) === 1))) continue;
                    _g2016++;
                  }
                }
                _c2020 = (((_h2009 - _g2012) + _g2016) >= v_m);
              }
              _c2021 = _c2020;
            }
            _c2022 = _c2021;
          }
          if (!((_c2022 && (_h2004 < _h2023)))) break L1999;
          const _h2030 = (_h2004 - v_m);
          _g2024.length = 0;
          G2025: {
            const _a2028 = v_R;
            for (let _i2029 = 0; _i2029 < _a2028.length; _i2029++) {
              const v_x = _a2028[_i2029];
              if (!(((_i2029 >= _h2030) && (_i2029 < v_m)))) continue;
              _g2024.push(v_x);
            }
          }
          L2031: {
            const v_C = _g2024;
            const _h2032 = v_C.length;
            if (!((_h2032 > 0))) break L2031;
            const _h2181 = (_h2032 > 1);
            let _g2033 = 0;
            G2034: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.length[v_k] === v_m))) continue;
                _g2033 += cl.fleet.boats[v_k];
              }
            }
            let _g2035 = 0;
            G2036: {
              const _a2037 = sp.cells;
              for (let _i2038 = 0; _i2038 < _a2037.length; _i2038++) {
                const v_c = _a2037[_i2038];
                const _h2078 = sp.rowOf[v_c];
                const _h2086 = sp.colOf[v_c];
                let _c2040: boolean = (b.value(v_c) === 1);
                if (_c2040) {
                  const _t2039 = step(sp, v_c, 1);
                  _c2040 = !(((_t2039 !== -1) && (b.value(_t2039) === 1)));
                }
                let _c2042: boolean = _c2040;
                if (_c2042) {
                  const _t2041 = step(sp, v_c, 3);
                  _c2042 = !(((_t2041 !== -1) && (b.value(_t2041) === 1)));
                }
                let _c2057: boolean = _c2042;
                if (_c2057) {
                  const _t2043 = sp.rowOf[v_c];
                  _g2044.length = 0;
                  G2045: {
                    const _a2048 = sp.lineCells[_t2043];
                    for (let _i2049 = 0; _i2049 < _a2048.length; _i2049++) {
                      const v_x = _a2048[_i2049];
                      if (!((b.value(v_x) === 1))) continue;
                      _g2044.push(v_x);
                    }
                  }
                  const _t2050 = sp.colOf[v_c];
                  _g2051.length = 0;
                  G2052: {
                    const _a2055 = sp.lineCells[_t2050];
                    for (let _i2056 = 0; _i2056 < _a2055.length; _i2056++) {
                      const v_x = _a2055[_i2056];
                      if (!((b.value(v_x) === 1))) continue;
                      _g2051.push(v_x);
                    }
                  }
                  _c2057 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2044), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2051)).length === v_m);
                }
                let _c2094: boolean = _c2057;
                if (_c2094) {
                  let _q2058 = true;
                  Q2059: {
                    const _t2060 = sp.rowOf[v_c];
                    _g2061.length = 0;
                    G2062: {
                      const _a2065 = sp.lineCells[_t2060];
                      for (let _i2066 = 0; _i2066 < _a2065.length; _i2066++) {
                        const v_x = _a2065[_i2066];
                        if (!((b.value(v_x) === 1))) continue;
                        _g2061.push(v_x);
                      }
                    }
                    const _t2067 = sp.colOf[v_c];
                    _g2068.length = 0;
                    G2069: {
                      const _a2072 = sp.lineCells[_t2067];
                      for (let _i2073 = 0; _i2073 < _a2072.length; _i2073++) {
                        const v_x = _a2072[_i2073];
                        if (!((b.value(v_x) === 1))) continue;
                        _g2068.push(v_x);
                      }
                    }
                    const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2061), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2068));
                    const _a2074 = v_G;
                    for (let _i2075 = 0; _i2075 < _a2074.length; _i2075++) {
                      const v_x = _a2074[_i2075];
                      const _a2076 = sp.adj4[v_x];
                      for (let _i2077 = 0; _i2077 < _a2076.length; _i2077++) {
                        const v_y = _a2076[_i2077];
                        let _c2085: boolean = !(v_G.includes(v_y));
                        if (_c2085) {
                          _g2079.length = 0;
                          G2080: {
                            const _a2083 = sp.lineCells[_h2078];
                            for (let _i2084 = 0; _i2084 < _a2083.length; _i2084++) {
                              const v_x = _a2083[_i2084];
                              if (!((b.value(v_x) === 1))) continue;
                              _g2079.push(v_x);
                            }
                          }
                          _c2085 = ((stretch(sp.lineCells[_h2078], v_c, _g2079).length === 1) || (sp.lineCells[_h2078].includes(v_y)));
                        }
                        let _c2093: boolean = _c2085;
                        if (_c2093) {
                          _g2087.length = 0;
                          G2088: {
                            const _a2091 = sp.lineCells[_h2086];
                            for (let _i2092 = 0; _i2092 < _a2091.length; _i2092++) {
                              const v_x = _a2091[_i2092];
                              if (!((b.value(v_x) === 1))) continue;
                              _g2087.push(v_x);
                            }
                          }
                          _c2093 = ((stretch(sp.lineCells[_h2086], v_c, _g2087).length === 1) || (sp.lineCells[_h2086].includes(v_y)));
                        }
                        if (!(_c2093)) continue;
                        if (!((b.value(v_y) === 2))) {
                          _q2058 = false;
                          break Q2059;
                        }
                      }
                    }
                  }
                  _c2094 = _q2058;
                }
                if (!(_c2094)) continue;
                _g2035++;
              }
            }
            const v_b = (_g2033 - _g2035);
            let _g2095 = 0;
            G2096: {
              const _a2097 = sp.lines;
              for (let _i2098 = 0; _i2098 < _a2097.length; _i2098++) {
                const v_K = _a2097[_i2098];
                const _h2121 = clueAt(cl.n, v_K);
                const _h2122 = (_h2121 < 0);
                const _a2099 = sp.lineCells[v_K];
                for (let _i2100 = 0; _i2100 < _a2099.length; _i2100++) {
                  const v_d = _a2099[_i2100];
                  const _h2105 = (v_d % sp.w);
                  const _h2106 = ((v_d / sp.w) | 0);
                  const _h2107 = (_h2105 + _h2106);
                  let _c2108: boolean = (b.value(v_d) !== 2);
                  if (_c2108) {
                    let _q2101 = false;
                    Q2102: {
                      const _a2103 = sp.adj4[v_d];
                      for (let _i2104 = 0; _i2104 < _a2103.length; _i2104++) {
                        const v_p = _a2103[_i2104];
                        if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h2107)))) continue;
                        if ((b.value(v_p) !== 2)) {
                          _q2101 = true;
                          break Q2102;
                        }
                      }
                    }
                    _c2108 = !(_q2101);
                  }
                  let _c2134: boolean = _c2108;
                  if (_c2134) {
                    _g2109.length = 0;
                    G2110: {
                      const _a2113 = sp.lineCells[v_K];
                      for (let _i2114 = 0; _i2114 < _a2113.length; _i2114++) {
                        const v_x = _a2113[_i2114];
                        if (!((b.value(v_x) !== 2))) continue;
                        _g2109.push(v_x);
                      }
                    }
                    const _t2115 = stretch(sp.lineCells[v_K], v_d, _g2109);
                    const _h2120 = _t2115.length;
                    let _g2116 = 0;
                    G2117: {
                      const _a2118 = _t2115;
                      for (let _i2119 = 0; _i2119 < _a2118.length; _i2119++) {
                        const v_c = _a2118[_i2119];
                        if (!((b.value(v_c) === 1))) continue;
                        _g2116++;
                      }
                    }
                    let _c2133: boolean = ((_g2116 < _h2120) && (_h2120 >= v_m));
                    if (_c2133) {
                      let _c2132: boolean = _h2122;
                      if (!_c2132) {
                        const _t2123 = sp.lineCells[v_K];
                        let _g2124 = 0;
                        G2125: {
                          const _a2126 = _t2123;
                          for (let _i2127 = 0; _i2127 < _a2126.length; _i2127++) {
                            const v_c = _a2126[_i2127];
                            if (!((b.value(v_c) === 1))) continue;
                            _g2124++;
                          }
                        }
                        let _g2128 = 0;
                        G2129: {
                          const _a2130 = _t2115;
                          for (let _i2131 = 0; _i2131 < _a2130.length; _i2131++) {
                            const v_c = _a2130[_i2131];
                            if (!((b.value(v_c) === 1))) continue;
                            _g2128++;
                          }
                        }
                        _c2132 = (((_h2121 - _g2124) + _g2128) >= v_m);
                      }
                      _c2133 = _c2132;
                    }
                    _c2134 = _c2133;
                  }
                  if (!(_c2134)) continue;
                  _g2095++;
                }
              }
            }
            L2135: {
              const v_r = _g2095;
              let _c2176: boolean = (v_r === v_b);
              if (_c2176) {
                let _q2136 = false;
                Q2137: {
                  const _a2138 = sp.lines;
                  for (let _i2139 = 0; _i2139 < _a2138.length; _i2139++) {
                    const v_K = _a2138[_i2139];
                    const _h2162 = clueAt(cl.n, v_K);
                    const _h2163 = (_h2162 < 0);
                    const _a2140 = sp.lineCells[v_K];
                    for (let _i2141 = 0; _i2141 < _a2140.length; _i2141++) {
                      const v_d = _a2140[_i2141];
                      const _h2146 = (v_d % sp.w);
                      const _h2147 = ((v_d / sp.w) | 0);
                      const _h2148 = (_h2146 + _h2147);
                      let _c2149: boolean = (b.value(v_d) !== 2);
                      if (_c2149) {
                        let _q2142 = false;
                        Q2143: {
                          const _a2144 = sp.adj4[v_d];
                          for (let _i2145 = 0; _i2145 < _a2144.length; _i2145++) {
                            const v_p = _a2144[_i2145];
                            if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h2148)))) continue;
                            if ((b.value(v_p) !== 2)) {
                              _q2142 = true;
                              break Q2143;
                            }
                          }
                        }
                        _c2149 = !(_q2142);
                      }
                      if (!(_c2149)) continue;
                      _g2150.length = 0;
                      G2151: {
                        const _a2154 = sp.lineCells[v_K];
                        for (let _i2155 = 0; _i2155 < _a2154.length; _i2155++) {
                          const v_x = _a2154[_i2155];
                          if (!((b.value(v_x) !== 2))) continue;
                          _g2150.push(v_x);
                        }
                      }
                      L2156: {
                        const v_R = stretch(sp.lineCells[v_K], v_d, _g2150);
                        const _h2161 = v_R.length;
                        let _g2157 = 0;
                        G2158: {
                          const _a2159 = v_R;
                          for (let _i2160 = 0; _i2160 < _a2159.length; _i2160++) {
                            const v_c = _a2159[_i2160];
                            if (!((b.value(v_c) === 1))) continue;
                            _g2157++;
                          }
                        }
                        let _c2174: boolean = ((_g2157 < _h2161) && (_h2161 >= v_m));
                        if (_c2174) {
                          let _c2173: boolean = _h2163;
                          if (!_c2173) {
                            const _t2164 = sp.lineCells[v_K];
                            let _g2165 = 0;
                            G2166: {
                              const _a2167 = _t2164;
                              for (let _i2168 = 0; _i2168 < _a2167.length; _i2168++) {
                                const v_c = _a2167[_i2168];
                                if (!((b.value(v_c) === 1))) continue;
                                _g2165++;
                              }
                            }
                            let _g2169 = 0;
                            G2170: {
                              const _a2171 = v_R;
                              for (let _i2172 = 0; _i2172 < _a2171.length; _i2172++) {
                                const v_c = _a2171[_i2172];
                                if (!((b.value(v_c) === 1))) continue;
                                _g2169++;
                              }
                            }
                            _c2173 = (((_h2162 - _g2165) + _g2169) >= v_m);
                          }
                          _c2174 = _c2173;
                        }
                        if (!(_c2174)) break L2156;
                        if ((_h2161 >= _h2175)) {
                          _q2136 = true;
                          break Q2137;
                        }
                      }
                    }
                  }
                }
                _c2176 = !(_q2136);
              }
              if (!(_c2176)) break L2135;
              facts.length = 0;
              changed = false;
              let _q2177 = true;
              Q2178: {
                const _a2179 = v_C;
                for (let _i2180 = 0; _i2180 < _a2179.length; _i2180++) {
                  const v_x = _a2179[_i2180];
                  if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c2187: boolean = true;
                  if (_c2187) {
                    let _c2186: boolean = _h2181;
                    if (!_c2186) {
                      let _q2182 = true;
                      Q2183: {
                        const _a2184 = sp.adj4[v_x];
                        for (let _i2185 = 0; _i2185 < _a2184.length; _i2185++) {
                          const v_y = _a2184[_i2185];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!b.known(v_y)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q2182 = false;
                            break Q2183;
                          }
                        }
                      }
                      _c2186 = _q2182;
                    }
                    _c2187 = _c2186;
                  }
                  if (!(_c2187)) {
                    _q2177 = false;
                    break Q2178;
                  }
                }
              }
              if (!(_q2177)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ m: v_m, L: v_L, c: v_c, R: v_R, C: v_C, b: v_b, r: v_r }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface SharedBinding {
  L: number;
  v: number;
  t: number;
  k: number;
  K: number;
  j: number;
  s: number;
}

const sharedFacts: number[] = [];

export function shared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedBinding> | null): number {
  const _g2330: number[] = [];
  const _g2340: number[] = [];
  const _g2352: number[] = [];
  const _g2363: number[] = [];
  const _g2399: number[] = [];
  const _g2409: number[] = [];
  const _g2421: number[] = [];
  const _g2432: number[] = [];
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  const _a2320 = sp.lines;
  for (let _i2321 = 0; _i2321 < _a2320.length; _i2321++) {
    const v_L = _a2320[_i2321];
    const _h2322 = clueAt(cl.n, v_L);
    let _g2323 = -1;
    G2324: {
      const _a2325 = setOf(v_L);
      for (let _i2326 = 0; _i2326 < _a2325.length; _i2326++) {
        const v_K = _a2325[_i2326];
        const _h2327 = clueAt(cl.n, v_K);
        let _c2347: boolean = (_h2327 < 0);
        if (_c2347) {
          let _q2328 = true;
          Q2329: {
            _g2330.length = 0;
            G2331: {
              const _a2334 = sp.lines;
              for (let _i2335 = 0; _i2335 < _a2334.length; _i2335++) {
                const v_M = _a2334[_i2335];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g2330.push(v_M);
              }
            }
            const _a2336 = _g2330;
            for (let _i2337 = 0; _i2337 < _a2336.length; _i2337++) {
              const v_M = _a2336[_i2337];
              const _h2338 = clueAt(cl.n, v_M);
              let _c2346: boolean = (_h2338 >= 0);
              if (!_c2346) {
                const _t2339 = sp.lineCells[v_M];
                _g2340.length = 0;
                G2341: {
                  const _a2344 = _t2339;
                  for (let _i2345 = 0; _i2345 < _a2344.length; _i2345++) {
                    const v_c = _a2344[_i2345];
                    if (!(!(b.known(v_c)))) continue;
                    _g2340.push(v_c);
                  }
                }
                _c2346 = (_g2340.length === 0);
              }
              if (!(_c2346)) {
                _q2328 = false;
                break Q2329;
              }
            }
          }
          _c2347 = _q2328;
        }
        if (!(_c2347)) continue;
        let _g2348 = 0;
        G2349: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g2348 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g2350 = 0;
        G2351: {
          _g2352.length = 0;
          G2353: {
            const _a2356 = sp.lines;
            for (let _i2357 = 0; _i2357 < _a2356.length; _i2357++) {
              const v_M = _a2356[_i2357];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g2352.push(v_M);
            }
          }
          const _a2358 = _g2352;
          for (let _i2359 = 0; _i2359 < _a2358.length; _i2359++) {
            const v_M = _a2358[_i2359];
            const _h2360 = clueAt(cl.n, v_M);
            if (!((_h2360 >= 0))) continue;
            _g2350 += _h2360;
          }
        }
        let _g2361 = 0;
        G2362: {
          _g2363.length = 0;
          G2364: {
            const _a2367 = sp.lines;
            for (let _i2368 = 0; _i2368 < _a2367.length; _i2368++) {
              const v_M = _a2367[_i2368];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g2363.push(v_M);
            }
          }
          const _a2369 = _g2363;
          for (let _i2370 = 0; _i2370 < _a2369.length; _i2370++) {
            const v_M = _a2369[_i2370];
            const _h2371 = clueAt(cl.n, v_M);
            if (!((_h2371 < 0))) continue;
            const _t2372 = sp.lineCells[v_M];
            let _g2373 = 0;
            G2374: {
              const _a2375 = _t2372;
              for (let _i2376 = 0; _i2376 < _a2375.length; _i2376++) {
                const v_c = _a2375[_i2376];
                if (!((b.value(v_c) === 1))) continue;
                _g2373++;
              }
            }
            _g2361 += _g2373;
          }
        }
        const _t2377 = ((_g2348 - _g2350) - _g2361);
        if (_g2323 === -1 || _t2377 > _g2323) _g2323 = _t2377;
      }
    }
    L2378: {
      const v_v = ((_h2322 + _g2323) + 1);
      if (!((v_v >= 0))) break L2378;
      let _g2379 = 0;
      G2380: {
        const _a2381 = sp.lineCells[v_L];
        for (let _i2382 = 0; _i2382 < _a2381.length; _i2382++) {
          const v_c = _a2381[_i2382];
          if (!((b.value(v_c) === 2))) continue;
          _g2379++;
        }
      }
      L2383: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g2379);
        if (!(((v_t === 1) || (v_t === 2)))) break L2383;
        const _a2384 = sp.lineCells[v_L];
        for (let _i2385 = 0; _i2385 < _a2384.length; _i2385++) {
          const v_k = _a2384[_i2385];
          let _g2386 = -1;
          let _n2388 = 0;
          G2387: {
            const _a2389 = setOf(sp.rowOf[v_k], sp.colOf[v_k]);
            for (let _i2390 = 0; _i2390 < _a2389.length; _i2390++) {
              const v_M = _a2389[_i2390];
              if (!((v_M !== v_L))) continue;
              if (++_n2388 === 2) {
                _g2386 = -1;
                break G2387;
              }
              _g2386 = v_M;
            }
          }
          const v_K = _g2386;
          const _h2391 = clueAt(cl.n, v_K);
          let _g2392 = -1;
          G2393: {
            const _a2394 = setOf(v_K);
            for (let _i2395 = 0; _i2395 < _a2394.length; _i2395++) {
              const v_K = _a2394[_i2395];
              const _h2396 = clueAt(cl.n, v_K);
              let _c2416: boolean = (_h2396 < 0);
              if (_c2416) {
                let _q2397 = true;
                Q2398: {
                  _g2399.length = 0;
                  G2400: {
                    const _a2403 = sp.lines;
                    for (let _i2404 = 0; _i2404 < _a2403.length; _i2404++) {
                      const v_M = _a2403[_i2404];
                      if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                      _g2399.push(v_M);
                    }
                  }
                  const _a2405 = _g2399;
                  for (let _i2406 = 0; _i2406 < _a2405.length; _i2406++) {
                    const v_M = _a2405[_i2406];
                    const _h2407 = clueAt(cl.n, v_M);
                    let _c2415: boolean = (_h2407 >= 0);
                    if (!_c2415) {
                      const _t2408 = sp.lineCells[v_M];
                      _g2409.length = 0;
                      G2410: {
                        const _a2413 = _t2408;
                        for (let _i2414 = 0; _i2414 < _a2413.length; _i2414++) {
                          const v_c = _a2413[_i2414];
                          if (!(!(b.known(v_c)))) continue;
                          _g2409.push(v_c);
                        }
                      }
                      _c2415 = (_g2409.length === 0);
                    }
                    if (!(_c2415)) {
                      _q2397 = false;
                      break Q2398;
                    }
                  }
                }
                _c2416 = _q2397;
              }
              if (!(_c2416)) continue;
              let _g2417 = 0;
              G2418: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g2417 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              let _g2419 = 0;
              G2420: {
                _g2421.length = 0;
                G2422: {
                  const _a2425 = sp.lines;
                  for (let _i2426 = 0; _i2426 < _a2425.length; _i2426++) {
                    const v_M = _a2425[_i2426];
                    if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                    _g2421.push(v_M);
                  }
                }
                const _a2427 = _g2421;
                for (let _i2428 = 0; _i2428 < _a2427.length; _i2428++) {
                  const v_M = _a2427[_i2428];
                  const _h2429 = clueAt(cl.n, v_M);
                  if (!((_h2429 >= 0))) continue;
                  _g2419 += _h2429;
                }
              }
              let _g2430 = 0;
              G2431: {
                _g2432.length = 0;
                G2433: {
                  const _a2436 = sp.lines;
                  for (let _i2437 = 0; _i2437 < _a2436.length; _i2437++) {
                    const v_M = _a2436[_i2437];
                    if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                    _g2432.push(v_M);
                  }
                }
                const _a2438 = _g2432;
                for (let _i2439 = 0; _i2439 < _a2438.length; _i2439++) {
                  const v_M = _a2438[_i2439];
                  const _h2440 = clueAt(cl.n, v_M);
                  if (!((_h2440 < 0))) continue;
                  const _t2441 = sp.lineCells[v_M];
                  let _g2442 = 0;
                  G2443: {
                    const _a2444 = _t2441;
                    for (let _i2445 = 0; _i2445 < _a2444.length; _i2445++) {
                      const v_c = _a2444[_i2445];
                      if (!((b.value(v_c) === 1))) continue;
                      _g2442++;
                    }
                  }
                  _g2430 += _g2442;
                }
              }
              const _t2446 = ((_g2417 - _g2419) - _g2430);
              if (_g2392 === -1 || _t2446 > _g2392) _g2392 = _t2446;
            }
          }
          const v_j = ((_h2391 + _g2392) + 1);
          const _h2455 = (v_j >= 0);
          let _g2447 = 0;
          G2448: {
            const _a2449 = sp.adj4[v_k];
            for (let _i2450 = 0; _i2450 < _a2449.length; _i2450++) {
              const v_x = _a2449[_i2450];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !(b.known(v_x))))) continue;
              _g2447++;
            }
          }
          let _g2451 = 0;
          G2452: {
            const _a2453 = setOf(v_k);
            for (let _i2454 = 0; _i2454 < _a2453.length; _i2454++) {
              const v_x = _a2453[_i2454];
              let _c2461: boolean = (!(b.known(v_x)) && _h2455);
              if (_c2461) {
                const _t2456 = sp.lineCells[v_K];
                let _g2457 = 0;
                G2458: {
                  const _a2459 = _t2456;
                  for (let _i2460 = 0; _i2460 < _a2459.length; _i2460++) {
                    const v_c = _a2459[_i2460];
                    if (!((b.value(v_c) === 1))) continue;
                    _g2457++;
                  }
                }
                _c2461 = ((v_j - _g2457) === 1);
              }
              if (!(_c2461)) continue;
              _g2451++;
            }
          }
          L2462: {
            const v_s = (_g2447 + _g2451);
            if (!((v_s > v_t))) break L2462;
            facts.length = 0;
            changed = false;
            let _q2463 = true;
            Q2464: {
              const _a2465 = sp.adj4[v_k];
              for (let _i2466 = 0; _i2466 < _a2465.length; _i2466++) {
                const v_y = _a2465[_i2466];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !(b.known(v_y))))) continue;
                if (!b.known(v_y)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q2463 = false;
                  break Q2464;
                }
              }
            }
            if (!(_q2463)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ L: v_L, v: v_v, t: v_t, k: v_k, K: v_K, j: v_j, s: v_s }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface LastWaterBinding {
  T: number;
  L: number;
  v: number;
  c: number;
  K: number;
  j: number;
  t: number;
  H: readonly number[];
}

const lastWaterFacts: number[] = [];

export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding> | null): number {
  const _g2985: number[] = [];
  const _g2995: number[] = [];
  const _g3007: number[] = [];
  const _g3018: number[] = [];
  const _g3054: number[] = [];
  const _g3064: number[] = [];
  const _g3076: number[] = [];
  const _g3087: number[] = [];
  const _g3106: number[] = [];
  const _g3112: number[] = [];
  const _g3122: number[] = [];
  const _g3135: number[] = [];
  const _g3154: number[] = [];
  const _g3174: number[] = [];
  const _g3184: number[] = [];
  const _g3196: number[] = [];
  const _g3207: number[] = [];
  const _g3253: number[] = [];
  const _g3262: number[] = [];
  const _g3347: number[] = [];
  const _g3361: number[] = [];
  const _g3371: number[] = [];
  const _g3385: number[] = [];
  const _g3403: number[] = [];
  const _g3417: number[] = [];
  const _g3446: number[] = [];
  const _g3453: number[] = [];
  const _g3463: number[] = [];
  const _g3470: number[] = [];
  const _g3481: number[] = [];
  const _g3489: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  let _g2972 = -1;
  G2973: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2974 = cl.fleet.length[v_k];
      if (_g2972 === -1 || _t2974 > _g2972) _g2972 = _t2974;
    }
  }
  const v_T = _g2972;
  const _a2975 = sp.lines;
  for (let _i2976 = 0; _i2976 < _a2975.length; _i2976++) {
    const v_L = _a2975[_i2976];
    const _h2977 = clueAt(cl.n, v_L);
    let _g2978 = -1;
    G2979: {
      const _a2980 = setOf(v_L);
      for (let _i2981 = 0; _i2981 < _a2980.length; _i2981++) {
        const v_K = _a2980[_i2981];
        const _h2982 = clueAt(cl.n, v_K);
        let _c3002: boolean = (_h2982 < 0);
        if (_c3002) {
          let _q2983 = true;
          Q2984: {
            _g2985.length = 0;
            G2986: {
              const _a2989 = sp.lines;
              for (let _i2990 = 0; _i2990 < _a2989.length; _i2990++) {
                const v_M = _a2989[_i2990];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g2985.push(v_M);
              }
            }
            const _a2991 = _g2985;
            for (let _i2992 = 0; _i2992 < _a2991.length; _i2992++) {
              const v_M = _a2991[_i2992];
              const _h2993 = clueAt(cl.n, v_M);
              let _c3001: boolean = (_h2993 >= 0);
              if (!_c3001) {
                const _t2994 = sp.lineCells[v_M];
                _g2995.length = 0;
                G2996: {
                  const _a2999 = _t2994;
                  for (let _i3000 = 0; _i3000 < _a2999.length; _i3000++) {
                    const v_c = _a2999[_i3000];
                    if (!(!(b.known(v_c)))) continue;
                    _g2995.push(v_c);
                  }
                }
                _c3001 = (_g2995.length === 0);
              }
              if (!(_c3001)) {
                _q2983 = false;
                break Q2984;
              }
            }
          }
          _c3002 = _q2983;
        }
        if (!(_c3002)) continue;
        let _g3003 = 0;
        G3004: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g3003 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g3005 = 0;
        G3006: {
          _g3007.length = 0;
          G3008: {
            const _a3011 = sp.lines;
            for (let _i3012 = 0; _i3012 < _a3011.length; _i3012++) {
              const v_M = _a3011[_i3012];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g3007.push(v_M);
            }
          }
          const _a3013 = _g3007;
          for (let _i3014 = 0; _i3014 < _a3013.length; _i3014++) {
            const v_M = _a3013[_i3014];
            const _h3015 = clueAt(cl.n, v_M);
            if (!((_h3015 >= 0))) continue;
            _g3005 += _h3015;
          }
        }
        let _g3016 = 0;
        G3017: {
          _g3018.length = 0;
          G3019: {
            const _a3022 = sp.lines;
            for (let _i3023 = 0; _i3023 < _a3022.length; _i3023++) {
              const v_M = _a3022[_i3023];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g3018.push(v_M);
            }
          }
          const _a3024 = _g3018;
          for (let _i3025 = 0; _i3025 < _a3024.length; _i3025++) {
            const v_M = _a3024[_i3025];
            const _h3026 = clueAt(cl.n, v_M);
            if (!((_h3026 < 0))) continue;
            const _t3027 = sp.lineCells[v_M];
            let _g3028 = 0;
            G3029: {
              const _a3030 = _t3027;
              for (let _i3031 = 0; _i3031 < _a3030.length; _i3031++) {
                const v_c = _a3030[_i3031];
                if (!((b.value(v_c) === 1))) continue;
                _g3028++;
              }
            }
            _g3016 += _g3028;
          }
        }
        const _t3032 = ((_g3003 - _g3005) - _g3016);
        if (_g2978 === -1 || _t3032 > _g2978) _g2978 = _t3032;
      }
    }
    L3033: {
      const v_v = ((_h2977 + _g2978) + 1);
      let _c3038: boolean = (v_v >= 0);
      if (_c3038) {
        let _g3034 = 0;
        G3035: {
          const _a3036 = sp.lineCells[v_L];
          for (let _i3037 = 0; _i3037 < _a3036.length; _i3037++) {
            const v_c = _a3036[_i3037];
            if (!((b.value(v_c) === 2))) continue;
            _g3034++;
          }
        }
        _c3038 = (((sp.lineCells[v_L].length - v_v) - _g3034) === 1);
      }
      if (!(_c3038)) break L3033;
      const _a3039 = sp.lineCells[v_L];
      for (let _i3040 = 0; _i3040 < _a3039.length; _i3040++) {
        const v_c = _a3039[_i3040];
        if (!(!(b.known(v_c)))) continue;
        let _g3041 = -1;
        let _n3043 = 0;
        G3042: {
          const _a3044 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i3045 = 0; _i3045 < _a3044.length; _i3045++) {
            const v_M = _a3044[_i3045];
            if (!((v_M !== v_L))) continue;
            if (++_n3043 === 2) {
              _g3041 = -1;
              break G3042;
            }
            _g3041 = v_M;
          }
        }
        const v_K = _g3041;
        const _h3046 = clueAt(cl.n, v_K);
        let _g3047 = -1;
        G3048: {
          const _a3049 = setOf(v_K);
          for (let _i3050 = 0; _i3050 < _a3049.length; _i3050++) {
            const v_K = _a3049[_i3050];
            const _h3051 = clueAt(cl.n, v_K);
            let _c3071: boolean = (_h3051 < 0);
            if (_c3071) {
              let _q3052 = true;
              Q3053: {
                _g3054.length = 0;
                G3055: {
                  const _a3058 = sp.lines;
                  for (let _i3059 = 0; _i3059 < _a3058.length; _i3059++) {
                    const v_M = _a3058[_i3059];
                    if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                    _g3054.push(v_M);
                  }
                }
                const _a3060 = _g3054;
                for (let _i3061 = 0; _i3061 < _a3060.length; _i3061++) {
                  const v_M = _a3060[_i3061];
                  const _h3062 = clueAt(cl.n, v_M);
                  let _c3070: boolean = (_h3062 >= 0);
                  if (!_c3070) {
                    const _t3063 = sp.lineCells[v_M];
                    _g3064.length = 0;
                    G3065: {
                      const _a3068 = _t3063;
                      for (let _i3069 = 0; _i3069 < _a3068.length; _i3069++) {
                        const v_c = _a3068[_i3069];
                        if (!(!(b.known(v_c)))) continue;
                        _g3064.push(v_c);
                      }
                    }
                    _c3070 = (_g3064.length === 0);
                  }
                  if (!(_c3070)) {
                    _q3052 = false;
                    break Q3053;
                  }
                }
              }
              _c3071 = _q3052;
            }
            if (!(_c3071)) continue;
            let _g3072 = 0;
            G3073: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3072 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            let _g3074 = 0;
            G3075: {
              _g3076.length = 0;
              G3077: {
                const _a3080 = sp.lines;
                for (let _i3081 = 0; _i3081 < _a3080.length; _i3081++) {
                  const v_M = _a3080[_i3081];
                  if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                  _g3076.push(v_M);
                }
              }
              const _a3082 = _g3076;
              for (let _i3083 = 0; _i3083 < _a3082.length; _i3083++) {
                const v_M = _a3082[_i3083];
                const _h3084 = clueAt(cl.n, v_M);
                if (!((_h3084 >= 0))) continue;
                _g3074 += _h3084;
              }
            }
            let _g3085 = 0;
            G3086: {
              _g3087.length = 0;
              G3088: {
                const _a3091 = sp.lines;
                for (let _i3092 = 0; _i3092 < _a3091.length; _i3092++) {
                  const v_M = _a3091[_i3092];
                  if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                  _g3087.push(v_M);
                }
              }
              const _a3093 = _g3087;
              for (let _i3094 = 0; _i3094 < _a3093.length; _i3094++) {
                const v_M = _a3093[_i3094];
                const _h3095 = clueAt(cl.n, v_M);
                if (!((_h3095 < 0))) continue;
                const _t3096 = sp.lineCells[v_M];
                let _g3097 = 0;
                G3098: {
                  const _a3099 = _t3096;
                  for (let _i3100 = 0; _i3100 < _a3099.length; _i3100++) {
                    const v_c = _a3099[_i3100];
                    if (!((b.value(v_c) === 1))) continue;
                    _g3097++;
                  }
                }
                _g3085 += _g3097;
              }
            }
            const _t3101 = ((_g3072 - _g3074) - _g3085);
            if (_g3047 === -1 || _t3101 > _g3047) _g3047 = _t3101;
          }
        }
        const v_j = ((_h3046 + _g3047) + 1);
        const _h3130 = (v_j >= 0);
        let _g3102 = 0;
        G3103: {
          const _a3104 = sp.lineCells[v_K];
          for (let _i3105 = 0; _i3105 < _a3104.length; _i3105++) {
            const v_c = _a3104[_i3105];
            if (!((b.value(v_c) === 2))) continue;
            _g3102++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g3102);
        const _h3131 = (v_t === 1);
        const _h3132 = (_h3130 && _h3131);
        _g3106.length = 0;
        G3107: {
          const _a3110 = sp.lineCells[v_L];
          for (let _i3111 = 0; _i3111 < _a3110.length; _i3111++) {
            const v_x = _a3110[_i3111];
            if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
            _g3106.push(v_x);
          }
        }
        _g3112.length = 0;
        G3113: {
          _g3122.length = 0;
          G3123: {
            const _a3126 = sp.lineCells[v_K];
            for (let _i3127 = 0; _i3127 < _a3126.length; _i3127++) {
              const v_x = _a3126[_i3127];
              if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
              _g3122.push(v_x);
            }
          }
          const _a3128 = _g3122;
          for (let _i3129 = 0; _i3129 < _a3128.length; _i3129++) {
            const v_x = _a3128[_i3129];
            if (!(_h3132)) continue;
            _g3112.push(v_x);
          }
        }
        L3133: {
          const v_H = union(_g3106, _g3112);
          const _t3134 = setOf(v_c);
          _g3135.length = 0;
          G3136: {
            const _a3141 = v_H;
            for (let _i3142 = 0; _i3142 < _a3141.length; _i3142++) {
              const v_a = _a3141[_i3142];
              const _a3143 = sp.adj8[v_a];
              for (let _i3144 = 0; _i3144 < _a3143.length; _i3144++) {
                const v_d = _a3143[_i3144];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !(b.known(v_d))))) continue;
                if (!_g3135.includes(v_d)) _g3135.push(v_d);
              }
            }
          }
          const _t3145 = union(_t3134, _g3135);
          let _q3146 = false;
          Q3147: {
            const _a3148 = v_H;
            for (let _i3149 = 0; _i3149 < _a3148.length; _i3149++) {
              const v_a = _a3148[_i3149];
              const _a3150 = sp.adj8[v_a];
              for (let _i3151 = 0; _i3151 < _a3150.length; _i3151++) {
                const v_b = _a3150[_i3151];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || (b.value(v_b) === 1))) {
                  _q3146 = true;
                  break Q3147;
                }
              }
            }
          }
          let _c3232: boolean = _q3146;
          if (!_c3232) {
            let _q3152 = false;
            Q3153: {
              _g3154.length = 0;
              G3155: {
                const _a3160 = union(v_H, _t3145);
                for (let _i3161 = 0; _i3161 < _a3160.length; _i3161++) {
                  const v_a = _a3160[_i3161];
                  const _a3162 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i3163 = 0; _i3163 < _a3162.length; _i3163++) {
                    const v_M = _a3162[_i3163];
                    if (!_g3154.includes(v_M)) _g3154.push(v_M);
                  }
                }
              }
              const _a3164 = _g3154;
              for (let _i3165 = 0; _i3165 < _a3164.length; _i3165++) {
                const v_L = _a3164[_i3165];
                const _h3166 = clueAt(cl.n, v_L);
                let _g3167 = -1;
                G3168: {
                  const _a3169 = setOf(v_L);
                  for (let _i3170 = 0; _i3170 < _a3169.length; _i3170++) {
                    const v_K = _a3169[_i3170];
                    const _h3171 = clueAt(cl.n, v_K);
                    let _c3191: boolean = (_h3171 < 0);
                    if (_c3191) {
                      let _q3172 = true;
                      Q3173: {
                        _g3174.length = 0;
                        G3175: {
                          const _a3178 = sp.lines;
                          for (let _i3179 = 0; _i3179 < _a3178.length; _i3179++) {
                            const v_M = _a3178[_i3179];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g3174.push(v_M);
                          }
                        }
                        const _a3180 = _g3174;
                        for (let _i3181 = 0; _i3181 < _a3180.length; _i3181++) {
                          const v_M = _a3180[_i3181];
                          const _h3182 = clueAt(cl.n, v_M);
                          let _c3190: boolean = (_h3182 >= 0);
                          if (!_c3190) {
                            const _t3183 = sp.lineCells[v_M];
                            _g3184.length = 0;
                            G3185: {
                              const _a3188 = _t3183;
                              for (let _i3189 = 0; _i3189 < _a3188.length; _i3189++) {
                                const v_c = _a3188[_i3189];
                                if (!(!(b.known(v_c)))) continue;
                                _g3184.push(v_c);
                              }
                            }
                            _c3190 = (_g3184.length === 0);
                          }
                          if (!(_c3190)) {
                            _q3172 = false;
                            break Q3173;
                          }
                        }
                      }
                      _c3191 = _q3172;
                    }
                    if (!(_c3191)) continue;
                    let _g3192 = 0;
                    G3193: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g3192 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g3194 = 0;
                    G3195: {
                      _g3196.length = 0;
                      G3197: {
                        const _a3200 = sp.lines;
                        for (let _i3201 = 0; _i3201 < _a3200.length; _i3201++) {
                          const v_M = _a3200[_i3201];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g3196.push(v_M);
                        }
                      }
                      const _a3202 = _g3196;
                      for (let _i3203 = 0; _i3203 < _a3202.length; _i3203++) {
                        const v_M = _a3202[_i3203];
                        const _h3204 = clueAt(cl.n, v_M);
                        if (!((_h3204 >= 0))) continue;
                        _g3194 += _h3204;
                      }
                    }
                    let _g3205 = 0;
                    G3206: {
                      _g3207.length = 0;
                      G3208: {
                        const _a3211 = sp.lines;
                        for (let _i3212 = 0; _i3212 < _a3211.length; _i3212++) {
                          const v_M = _a3211[_i3212];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g3207.push(v_M);
                        }
                      }
                      const _a3213 = _g3207;
                      for (let _i3214 = 0; _i3214 < _a3213.length; _i3214++) {
                        const v_M = _a3213[_i3214];
                        const _h3215 = clueAt(cl.n, v_M);
                        if (!((_h3215 < 0))) continue;
                        const _t3216 = sp.lineCells[v_M];
                        let _g3217 = 0;
                        G3218: {
                          const _a3219 = _t3216;
                          for (let _i3220 = 0; _i3220 < _a3219.length; _i3220++) {
                            const v_c = _a3219[_i3220];
                            if (!((b.value(v_c) === 1))) continue;
                            _g3217++;
                          }
                        }
                        _g3205 += _g3217;
                      }
                    }
                    const _t3221 = ((_g3192 - _g3194) - _g3205);
                    if (_g3167 === -1 || _t3221 > _g3167) _g3167 = _t3221;
                  }
                }
                L3222: {
                  const v_v = ((_h3166 + _g3167) + 1);
                  if (!((v_v >= 0))) break L3222;
                  let _g3223 = 0;
                  G3224: {
                    const _a3225 = sp.lineCells[v_L];
                    for (let _i3226 = 0; _i3226 < _a3225.length; _i3226++) {
                      const v_x = _a3225[_i3226];
                      if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g3223++;
                    }
                  }
                  let _c3231: boolean = (_g3223 > v_v);
                  if (!_c3231) {
                    let _g3227 = 0;
                    G3228: {
                      const _a3229 = sp.lineCells[v_L];
                      for (let _i3230 = 0; _i3230 < _a3229.length; _i3230++) {
                        const v_x = _a3229[_i3230];
                        if (!((!(_t3145.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                        _g3227++;
                      }
                    }
                    _c3231 = (_g3227 < v_v);
                  }
                  if (_c3231) {
                    _q3152 = true;
                    break Q3153;
                  }
                }
              }
            }
            _c3232 = _q3152;
          }
          let _c3239: boolean = _c3232;
          if (!_c3239) {
            let _g3233 = 0;
            G3234: {
              const _a3235 = sp.cells;
              for (let _i3236 = 0; _i3236 < _a3235.length; _i3236++) {
                const v_x = _a3235[_i3236];
                if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                _g3233++;
              }
            }
            let _g3237 = 0;
            G3238: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3237 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c3239 = (_g3233 > _g3237);
          }
          let _c3246: boolean = _c3239;
          if (!_c3246) {
            let _g3240 = 0;
            G3241: {
              const _a3242 = sp.cells;
              for (let _i3243 = 0; _i3243 < _a3242.length; _i3243++) {
                const v_x = _a3242[_i3243];
                if (!((!(_t3145.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                _g3240++;
              }
            }
            let _g3244 = 0;
            G3245: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3244 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c3246 = (_g3240 < _g3244);
          }
          let _c3259: boolean = _c3246;
          if (!_c3259) {
            let _q3247 = false;
            Q3248: {
              const _a3249 = v_H;
              for (let _i3250 = 0; _i3250 < _a3249.length; _i3250++) {
                const v_a = _a3249[_i3250];
                const _a3251 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i3252 = 0; _i3252 < _a3251.length; _i3252++) {
                  const v_L = _a3251[_i3252];
                  _g3253.length = 0;
                  G3254: {
                    const _a3257 = sp.lineCells[v_L];
                    for (let _i3258 = 0; _i3258 < _a3257.length; _i3258++) {
                      const v_x = _a3257[_i3258];
                      if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g3253.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g3253).length > v_T)) {
                    _q3247 = true;
                    break Q3248;
                  }
                }
              }
            }
            _c3259 = _q3247;
          }
          let _c3497: boolean = _c3259;
          if (!_c3497) {
            let _q3260 = false;
            Q3261: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g3262.length = 0;
                G3263: {
                  _g3347.length = 0;
                  G3348: {
                    const _a3353 = union(v_H, _t3145);
                    for (let _i3354 = 0; _i3354 < _a3353.length; _i3354++) {
                      const v_x = _a3353[_i3354];
                      const _a3355 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i3356 = 0; _i3356 < _a3355.length; _i3356++) {
                        const v_y = _a3355[_i3356];
                        if (!_g3347.includes(v_y)) _g3347.push(v_y);
                      }
                    }
                  }
                  const _a3357 = _g3347;
                  for (let _i3358 = 0; _i3358 < _a3357.length; _i3358++) {
                    const v_a = _a3357[_i3358];
                    if (!(((v_H.includes(v_a)) || (b.value(v_a) === 1)))) continue;
                    const _a3359 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i3360 = 0; _i3360 < _a3359.length; _i3360++) {
                      const v_L = _a3359[_i3360];
                      _g3361.length = 0;
                      G3362: {
                        const _a3365 = sp.lineCells[v_L];
                        for (let _i3366 = 0; _i3366 < _a3365.length; _i3366++) {
                          const v_x = _a3365[_i3366];
                          if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                          _g3361.push(v_x);
                        }
                      }
                      L3367: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g3361);
                        const _h3368 = v_G.length;
                        const _h3397 = (_h3368 === 1);
                        let _c3400: boolean = (_h3368 === v_m);
                        if (_c3400) {
                          let _q3369 = true;
                          Q3370: {
                            _g3371.length = 0;
                            G3372: {
                              _g3385.length = 0;
                              G3386: {
                                const _a3391 = v_G;
                                for (let _i3392 = 0; _i3392 < _a3391.length; _i3392++) {
                                  const v_g = _a3391[_i3392];
                                  const _a3393 = sp.adj4[v_g];
                                  for (let _i3394 = 0; _i3394 < _a3393.length; _i3394++) {
                                    const v_z = _a3393[_i3394];
                                    if (!_g3385.includes(v_z)) _g3385.push(v_z);
                                  }
                                }
                              }
                              const _a3395 = _g3385;
                              for (let _i3396 = 0; _i3396 < _a3395.length; _i3396++) {
                                const v_y = _a3395[_i3396];
                                if (!((!(v_G.includes(v_y)) && (_h3397 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g3371.push(v_y);
                              }
                            }
                            const _a3398 = _g3371;
                            for (let _i3399 = 0; _i3399 < _a3398.length; _i3399++) {
                              const v_y = _a3398[_i3399];
                              if (!(((_t3145.includes(v_y)) || (b.value(v_y) === 2)))) {
                                _q3369 = false;
                                break Q3370;
                              }
                            }
                          }
                          _c3400 = _q3369;
                        }
                        let _c3431: boolean = _c3400;
                        if (_c3431) {
                          let _q3401 = false;
                          Q3402: {
                            _g3403.length = 0;
                            G3404: {
                              _g3417.length = 0;
                              G3418: {
                                const _a3423 = v_G;
                                for (let _i3424 = 0; _i3424 < _a3423.length; _i3424++) {
                                  const v_g = _a3423[_i3424];
                                  const _a3425 = sp.adj4[v_g];
                                  for (let _i3426 = 0; _i3426 < _a3425.length; _i3426++) {
                                    const v_z = _a3425[_i3426];
                                    if (!_g3417.includes(v_z)) _g3417.push(v_z);
                                  }
                                }
                              }
                              const _a3427 = _g3417;
                              for (let _i3428 = 0; _i3428 < _a3427.length; _i3428++) {
                                const v_y = _a3427[_i3428];
                                if (!((!(v_G.includes(v_y)) && (_h3397 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g3403.push(v_y);
                              }
                            }
                            const _a3429 = union(v_G, _g3403);
                            for (let _i3430 = 0; _i3430 < _a3429.length; _i3430++) {
                              const v_x = _a3429[_i3430];
                              if (((v_H.includes(v_x)) || (_t3145.includes(v_x)))) {
                                _q3401 = true;
                                break Q3402;
                              }
                            }
                          }
                          _c3431 = _q3401;
                        }
                        if (!(_c3431)) break L3367;
                        const _t3432 = (v_G[0] ?? -1);
                        if (!_g3262.includes(_t3432)) _g3262.push(_t3432);
                      }
                    }
                  }
                }
                L3433: {
                  const v_C = _g3262;
                  const _h3434 = v_C.length;
                  if (!((_h3434 > 0))) break L3433;
                  let _g3435 = 0;
                  G3436: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g3435 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g3437 = 0;
                  G3438: {
                    const _a3439 = sp.cells;
                    for (let _i3440 = 0; _i3440 < _a3439.length; _i3440++) {
                      const v_c = _a3439[_i3440];
                      const _h3480 = sp.rowOf[v_c];
                      const _h3488 = sp.colOf[v_c];
                      let _c3442: boolean = (b.value(v_c) === 1);
                      if (_c3442) {
                        const _t3441 = step(sp, v_c, 1);
                        _c3442 = !(((_t3441 !== -1) && (b.value(_t3441) === 1)));
                      }
                      let _c3444: boolean = _c3442;
                      if (_c3444) {
                        const _t3443 = step(sp, v_c, 3);
                        _c3444 = !(((_t3443 !== -1) && (b.value(_t3443) === 1)));
                      }
                      let _c3459: boolean = _c3444;
                      if (_c3459) {
                        const _t3445 = sp.rowOf[v_c];
                        _g3446.length = 0;
                        G3447: {
                          const _a3450 = sp.lineCells[_t3445];
                          for (let _i3451 = 0; _i3451 < _a3450.length; _i3451++) {
                            const v_x = _a3450[_i3451];
                            if (!((b.value(v_x) === 1))) continue;
                            _g3446.push(v_x);
                          }
                        }
                        const _t3452 = sp.colOf[v_c];
                        _g3453.length = 0;
                        G3454: {
                          const _a3457 = sp.lineCells[_t3452];
                          for (let _i3458 = 0; _i3458 < _a3457.length; _i3458++) {
                            const v_x = _a3457[_i3458];
                            if (!((b.value(v_x) === 1))) continue;
                            _g3453.push(v_x);
                          }
                        }
                        _c3459 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g3446), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g3453)).length === v_m);
                      }
                      let _c3496: boolean = _c3459;
                      if (_c3496) {
                        let _q3460 = true;
                        Q3461: {
                          const _t3462 = sp.rowOf[v_c];
                          _g3463.length = 0;
                          G3464: {
                            const _a3467 = sp.lineCells[_t3462];
                            for (let _i3468 = 0; _i3468 < _a3467.length; _i3468++) {
                              const v_x = _a3467[_i3468];
                              if (!((b.value(v_x) === 1))) continue;
                              _g3463.push(v_x);
                            }
                          }
                          const _t3469 = sp.colOf[v_c];
                          _g3470.length = 0;
                          G3471: {
                            const _a3474 = sp.lineCells[_t3469];
                            for (let _i3475 = 0; _i3475 < _a3474.length; _i3475++) {
                              const v_x = _a3474[_i3475];
                              if (!((b.value(v_x) === 1))) continue;
                              _g3470.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g3463), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g3470));
                          const _a3476 = v_G;
                          for (let _i3477 = 0; _i3477 < _a3476.length; _i3477++) {
                            const v_x = _a3476[_i3477];
                            const _a3478 = sp.adj4[v_x];
                            for (let _i3479 = 0; _i3479 < _a3478.length; _i3479++) {
                              const v_y = _a3478[_i3479];
                              let _c3487: boolean = !(v_G.includes(v_y));
                              if (_c3487) {
                                _g3481.length = 0;
                                G3482: {
                                  const _a3485 = sp.lineCells[_h3480];
                                  for (let _i3486 = 0; _i3486 < _a3485.length; _i3486++) {
                                    const v_x = _a3485[_i3486];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g3481.push(v_x);
                                  }
                                }
                                _c3487 = ((stretch(sp.lineCells[_h3480], v_c, _g3481).length === 1) || (sp.lineCells[_h3480].includes(v_y)));
                              }
                              let _c3495: boolean = _c3487;
                              if (_c3495) {
                                _g3489.length = 0;
                                G3490: {
                                  const _a3493 = sp.lineCells[_h3488];
                                  for (let _i3494 = 0; _i3494 < _a3493.length; _i3494++) {
                                    const v_x = _a3493[_i3494];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g3489.push(v_x);
                                  }
                                }
                                _c3495 = ((stretch(sp.lineCells[_h3488], v_c, _g3489).length === 1) || (sp.lineCells[_h3488].includes(v_y)));
                              }
                              if (!(_c3495)) continue;
                              if (!((b.value(v_y) === 2))) {
                                _q3460 = false;
                                break Q3461;
                              }
                            }
                          }
                        }
                        _c3496 = _q3460;
                      }
                      if (!(_c3496)) continue;
                      _g3437++;
                    }
                  }
                  if ((_h3434 > (_g3435 - _g3437))) {
                    _q3260 = true;
                    break Q3261;
                  }
                }
              }
            }
            _c3497 = _q3260;
          }
          if (!(_c3497)) break L3133;
          facts.length = 0;
          changed = false;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, t: v_t, H: v_H }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LastShipBinding {
  T: number;
  L: number;
  v: number;
  c: number;
  K: number;
  j: number;
  u: number;
  W: readonly number[];
}

const lastShipFacts: number[] = [];

export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding> | null): number {
  const _g4018: number[] = [];
  const _g4028: number[] = [];
  const _g4040: number[] = [];
  const _g4051: number[] = [];
  const _g4088: number[] = [];
  const _g4098: number[] = [];
  const _g4110: number[] = [];
  const _g4121: number[] = [];
  const _g4141: number[] = [];
  const _g4147: number[] = [];
  const _g4157: number[] = [];
  const _g4170: number[] = [];
  const _g4189: number[] = [];
  const _g4209: number[] = [];
  const _g4219: number[] = [];
  const _g4231: number[] = [];
  const _g4242: number[] = [];
  const _g4288: number[] = [];
  const _g4297: number[] = [];
  const _g4382: number[] = [];
  const _g4396: number[] = [];
  const _g4406: number[] = [];
  const _g4420: number[] = [];
  const _g4438: number[] = [];
  const _g4452: number[] = [];
  const _g4481: number[] = [];
  const _g4488: number[] = [];
  const _g4498: number[] = [];
  const _g4505: number[] = [];
  const _g4516: number[] = [];
  const _g4524: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  let _g4005 = -1;
  G4006: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t4007 = cl.fleet.length[v_k];
      if (_g4005 === -1 || _t4007 > _g4005) _g4005 = _t4007;
    }
  }
  const v_T = _g4005;
  const _a4008 = sp.lines;
  for (let _i4009 = 0; _i4009 < _a4008.length; _i4009++) {
    const v_L = _a4008[_i4009];
    const _h4010 = clueAt(cl.n, v_L);
    let _g4011 = -1;
    G4012: {
      const _a4013 = setOf(v_L);
      for (let _i4014 = 0; _i4014 < _a4013.length; _i4014++) {
        const v_K = _a4013[_i4014];
        const _h4015 = clueAt(cl.n, v_K);
        let _c4035: boolean = (_h4015 < 0);
        if (_c4035) {
          let _q4016 = true;
          Q4017: {
            _g4018.length = 0;
            G4019: {
              const _a4022 = sp.lines;
              for (let _i4023 = 0; _i4023 < _a4022.length; _i4023++) {
                const v_M = _a4022[_i4023];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g4018.push(v_M);
              }
            }
            const _a4024 = _g4018;
            for (let _i4025 = 0; _i4025 < _a4024.length; _i4025++) {
              const v_M = _a4024[_i4025];
              const _h4026 = clueAt(cl.n, v_M);
              let _c4034: boolean = (_h4026 >= 0);
              if (!_c4034) {
                const _t4027 = sp.lineCells[v_M];
                _g4028.length = 0;
                G4029: {
                  const _a4032 = _t4027;
                  for (let _i4033 = 0; _i4033 < _a4032.length; _i4033++) {
                    const v_c = _a4032[_i4033];
                    if (!(!(b.known(v_c)))) continue;
                    _g4028.push(v_c);
                  }
                }
                _c4034 = (_g4028.length === 0);
              }
              if (!(_c4034)) {
                _q4016 = false;
                break Q4017;
              }
            }
          }
          _c4035 = _q4016;
        }
        if (!(_c4035)) continue;
        let _g4036 = 0;
        G4037: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g4036 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g4038 = 0;
        G4039: {
          _g4040.length = 0;
          G4041: {
            const _a4044 = sp.lines;
            for (let _i4045 = 0; _i4045 < _a4044.length; _i4045++) {
              const v_M = _a4044[_i4045];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g4040.push(v_M);
            }
          }
          const _a4046 = _g4040;
          for (let _i4047 = 0; _i4047 < _a4046.length; _i4047++) {
            const v_M = _a4046[_i4047];
            const _h4048 = clueAt(cl.n, v_M);
            if (!((_h4048 >= 0))) continue;
            _g4038 += _h4048;
          }
        }
        let _g4049 = 0;
        G4050: {
          _g4051.length = 0;
          G4052: {
            const _a4055 = sp.lines;
            for (let _i4056 = 0; _i4056 < _a4055.length; _i4056++) {
              const v_M = _a4055[_i4056];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g4051.push(v_M);
            }
          }
          const _a4057 = _g4051;
          for (let _i4058 = 0; _i4058 < _a4057.length; _i4058++) {
            const v_M = _a4057[_i4058];
            const _h4059 = clueAt(cl.n, v_M);
            if (!((_h4059 < 0))) continue;
            const _t4060 = sp.lineCells[v_M];
            let _g4061 = 0;
            G4062: {
              const _a4063 = _t4060;
              for (let _i4064 = 0; _i4064 < _a4063.length; _i4064++) {
                const v_c = _a4063[_i4064];
                if (!((b.value(v_c) === 1))) continue;
                _g4061++;
              }
            }
            _g4049 += _g4061;
          }
        }
        const _t4065 = ((_g4036 - _g4038) - _g4049);
        if (_g4011 === -1 || _t4065 > _g4011) _g4011 = _t4065;
      }
    }
    L4066: {
      const v_v = ((_h4010 + _g4011) + 1);
      let _c4072: boolean = (v_v >= 0);
      if (_c4072) {
        const _t4067 = sp.lineCells[v_L];
        let _g4068 = 0;
        G4069: {
          const _a4070 = _t4067;
          for (let _i4071 = 0; _i4071 < _a4070.length; _i4071++) {
            const v_c = _a4070[_i4071];
            if (!((b.value(v_c) === 1))) continue;
            _g4068++;
          }
        }
        _c4072 = ((v_v - _g4068) === 1);
      }
      if (!(_c4072)) break L4066;
      const _a4073 = sp.lineCells[v_L];
      for (let _i4074 = 0; _i4074 < _a4073.length; _i4074++) {
        const v_c = _a4073[_i4074];
        if (!(!(b.known(v_c)))) continue;
        let _g4075 = -1;
        let _n4077 = 0;
        G4076: {
          const _a4078 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i4079 = 0; _i4079 < _a4078.length; _i4079++) {
            const v_M = _a4078[_i4079];
            if (!((v_M !== v_L))) continue;
            if (++_n4077 === 2) {
              _g4075 = -1;
              break G4076;
            }
            _g4075 = v_M;
          }
        }
        const v_K = _g4075;
        const _h4080 = clueAt(cl.n, v_K);
        let _g4081 = -1;
        G4082: {
          const _a4083 = setOf(v_K);
          for (let _i4084 = 0; _i4084 < _a4083.length; _i4084++) {
            const v_K = _a4083[_i4084];
            const _h4085 = clueAt(cl.n, v_K);
            let _c4105: boolean = (_h4085 < 0);
            if (_c4105) {
              let _q4086 = true;
              Q4087: {
                _g4088.length = 0;
                G4089: {
                  const _a4092 = sp.lines;
                  for (let _i4093 = 0; _i4093 < _a4092.length; _i4093++) {
                    const v_M = _a4092[_i4093];
                    if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                    _g4088.push(v_M);
                  }
                }
                const _a4094 = _g4088;
                for (let _i4095 = 0; _i4095 < _a4094.length; _i4095++) {
                  const v_M = _a4094[_i4095];
                  const _h4096 = clueAt(cl.n, v_M);
                  let _c4104: boolean = (_h4096 >= 0);
                  if (!_c4104) {
                    const _t4097 = sp.lineCells[v_M];
                    _g4098.length = 0;
                    G4099: {
                      const _a4102 = _t4097;
                      for (let _i4103 = 0; _i4103 < _a4102.length; _i4103++) {
                        const v_c = _a4102[_i4103];
                        if (!(!(b.known(v_c)))) continue;
                        _g4098.push(v_c);
                      }
                    }
                    _c4104 = (_g4098.length === 0);
                  }
                  if (!(_c4104)) {
                    _q4086 = false;
                    break Q4087;
                  }
                }
              }
              _c4105 = _q4086;
            }
            if (!(_c4105)) continue;
            let _g4106 = 0;
            G4107: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g4106 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            let _g4108 = 0;
            G4109: {
              _g4110.length = 0;
              G4111: {
                const _a4114 = sp.lines;
                for (let _i4115 = 0; _i4115 < _a4114.length; _i4115++) {
                  const v_M = _a4114[_i4115];
                  if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                  _g4110.push(v_M);
                }
              }
              const _a4116 = _g4110;
              for (let _i4117 = 0; _i4117 < _a4116.length; _i4117++) {
                const v_M = _a4116[_i4117];
                const _h4118 = clueAt(cl.n, v_M);
                if (!((_h4118 >= 0))) continue;
                _g4108 += _h4118;
              }
            }
            let _g4119 = 0;
            G4120: {
              _g4121.length = 0;
              G4122: {
                const _a4125 = sp.lines;
                for (let _i4126 = 0; _i4126 < _a4125.length; _i4126++) {
                  const v_M = _a4125[_i4126];
                  if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                  _g4121.push(v_M);
                }
              }
              const _a4127 = _g4121;
              for (let _i4128 = 0; _i4128 < _a4127.length; _i4128++) {
                const v_M = _a4127[_i4128];
                const _h4129 = clueAt(cl.n, v_M);
                if (!((_h4129 < 0))) continue;
                const _t4130 = sp.lineCells[v_M];
                let _g4131 = 0;
                G4132: {
                  const _a4133 = _t4130;
                  for (let _i4134 = 0; _i4134 < _a4133.length; _i4134++) {
                    const v_c = _a4133[_i4134];
                    if (!((b.value(v_c) === 1))) continue;
                    _g4131++;
                  }
                }
                _g4119 += _g4131;
              }
            }
            const _t4135 = ((_g4106 - _g4108) - _g4119);
            if (_g4081 === -1 || _t4135 > _g4081) _g4081 = _t4135;
          }
        }
        const v_j = ((_h4080 + _g4081) + 1);
        const _h4165 = (v_j >= 0);
        const _t4136 = sp.lineCells[v_K];
        let _g4137 = 0;
        G4138: {
          const _a4139 = _t4136;
          for (let _i4140 = 0; _i4140 < _a4139.length; _i4140++) {
            const v_c = _a4139[_i4140];
            if (!((b.value(v_c) === 1))) continue;
            _g4137++;
          }
        }
        const v_u = (v_j - _g4137);
        const _h4166 = (v_u === 1);
        const _h4167 = (_h4165 && _h4166);
        _g4141.length = 0;
        G4142: {
          const _a4145 = sp.lineCells[v_L];
          for (let _i4146 = 0; _i4146 < _a4145.length; _i4146++) {
            const v_x = _a4145[_i4146];
            if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
            _g4141.push(v_x);
          }
        }
        _g4147.length = 0;
        G4148: {
          _g4157.length = 0;
          G4158: {
            const _a4161 = sp.lineCells[v_K];
            for (let _i4162 = 0; _i4162 < _a4161.length; _i4162++) {
              const v_x = _a4161[_i4162];
              if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
              _g4157.push(v_x);
            }
          }
          const _a4163 = _g4157;
          for (let _i4164 = 0; _i4164 < _a4163.length; _i4164++) {
            const v_x = _a4163[_i4164];
            if (!(_h4167)) continue;
            _g4147.push(v_x);
          }
        }
        L4168: {
          const v_W = union(_g4141, _g4147);
          const _t4169 = setOf(v_c);
          _g4170.length = 0;
          G4171: {
            const _a4176 = _t4169;
            for (let _i4177 = 0; _i4177 < _a4176.length; _i4177++) {
              const v_a = _a4176[_i4177];
              const _a4178 = sp.adj8[v_a];
              for (let _i4179 = 0; _i4179 < _a4178.length; _i4179++) {
                const v_d = _a4178[_i4179];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !(b.known(v_d))))) continue;
                if (!_g4170.includes(v_d)) _g4170.push(v_d);
              }
            }
          }
          const _t4180 = union(v_W, _g4170);
          let _q4181 = false;
          Q4182: {
            const _a4183 = _t4169;
            for (let _i4184 = 0; _i4184 < _a4183.length; _i4184++) {
              const v_a = _a4183[_i4184];
              const _a4185 = sp.adj8[v_a];
              for (let _i4186 = 0; _i4186 < _a4185.length; _i4186++) {
                const v_b = _a4185[_i4186];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t4169.includes(v_b)) || (b.value(v_b) === 1))) {
                  _q4181 = true;
                  break Q4182;
                }
              }
            }
          }
          let _c4267: boolean = _q4181;
          if (!_c4267) {
            let _q4187 = false;
            Q4188: {
              _g4189.length = 0;
              G4190: {
                const _a4195 = union(_t4169, _t4180);
                for (let _i4196 = 0; _i4196 < _a4195.length; _i4196++) {
                  const v_a = _a4195[_i4196];
                  const _a4197 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i4198 = 0; _i4198 < _a4197.length; _i4198++) {
                    const v_M = _a4197[_i4198];
                    if (!_g4189.includes(v_M)) _g4189.push(v_M);
                  }
                }
              }
              const _a4199 = _g4189;
              for (let _i4200 = 0; _i4200 < _a4199.length; _i4200++) {
                const v_L = _a4199[_i4200];
                const _h4201 = clueAt(cl.n, v_L);
                let _g4202 = -1;
                G4203: {
                  const _a4204 = setOf(v_L);
                  for (let _i4205 = 0; _i4205 < _a4204.length; _i4205++) {
                    const v_K = _a4204[_i4205];
                    const _h4206 = clueAt(cl.n, v_K);
                    let _c4226: boolean = (_h4206 < 0);
                    if (_c4226) {
                      let _q4207 = true;
                      Q4208: {
                        _g4209.length = 0;
                        G4210: {
                          const _a4213 = sp.lines;
                          for (let _i4214 = 0; _i4214 < _a4213.length; _i4214++) {
                            const v_M = _a4213[_i4214];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g4209.push(v_M);
                          }
                        }
                        const _a4215 = _g4209;
                        for (let _i4216 = 0; _i4216 < _a4215.length; _i4216++) {
                          const v_M = _a4215[_i4216];
                          const _h4217 = clueAt(cl.n, v_M);
                          let _c4225: boolean = (_h4217 >= 0);
                          if (!_c4225) {
                            const _t4218 = sp.lineCells[v_M];
                            _g4219.length = 0;
                            G4220: {
                              const _a4223 = _t4218;
                              for (let _i4224 = 0; _i4224 < _a4223.length; _i4224++) {
                                const v_c = _a4223[_i4224];
                                if (!(!(b.known(v_c)))) continue;
                                _g4219.push(v_c);
                              }
                            }
                            _c4225 = (_g4219.length === 0);
                          }
                          if (!(_c4225)) {
                            _q4207 = false;
                            break Q4208;
                          }
                        }
                      }
                      _c4226 = _q4207;
                    }
                    if (!(_c4226)) continue;
                    let _g4227 = 0;
                    G4228: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g4227 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g4229 = 0;
                    G4230: {
                      _g4231.length = 0;
                      G4232: {
                        const _a4235 = sp.lines;
                        for (let _i4236 = 0; _i4236 < _a4235.length; _i4236++) {
                          const v_M = _a4235[_i4236];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g4231.push(v_M);
                        }
                      }
                      const _a4237 = _g4231;
                      for (let _i4238 = 0; _i4238 < _a4237.length; _i4238++) {
                        const v_M = _a4237[_i4238];
                        const _h4239 = clueAt(cl.n, v_M);
                        if (!((_h4239 >= 0))) continue;
                        _g4229 += _h4239;
                      }
                    }
                    let _g4240 = 0;
                    G4241: {
                      _g4242.length = 0;
                      G4243: {
                        const _a4246 = sp.lines;
                        for (let _i4247 = 0; _i4247 < _a4246.length; _i4247++) {
                          const v_M = _a4246[_i4247];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g4242.push(v_M);
                        }
                      }
                      const _a4248 = _g4242;
                      for (let _i4249 = 0; _i4249 < _a4248.length; _i4249++) {
                        const v_M = _a4248[_i4249];
                        const _h4250 = clueAt(cl.n, v_M);
                        if (!((_h4250 < 0))) continue;
                        const _t4251 = sp.lineCells[v_M];
                        let _g4252 = 0;
                        G4253: {
                          const _a4254 = _t4251;
                          for (let _i4255 = 0; _i4255 < _a4254.length; _i4255++) {
                            const v_c = _a4254[_i4255];
                            if (!((b.value(v_c) === 1))) continue;
                            _g4252++;
                          }
                        }
                        _g4240 += _g4252;
                      }
                    }
                    const _t4256 = ((_g4227 - _g4229) - _g4240);
                    if (_g4202 === -1 || _t4256 > _g4202) _g4202 = _t4256;
                  }
                }
                L4257: {
                  const v_v = ((_h4201 + _g4202) + 1);
                  if (!((v_v >= 0))) break L4257;
                  let _g4258 = 0;
                  G4259: {
                    const _a4260 = sp.lineCells[v_L];
                    for (let _i4261 = 0; _i4261 < _a4260.length; _i4261++) {
                      const v_x = _a4260[_i4261];
                      if (!(((_t4169.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g4258++;
                    }
                  }
                  let _c4266: boolean = (_g4258 > v_v);
                  if (!_c4266) {
                    let _g4262 = 0;
                    G4263: {
                      const _a4264 = sp.lineCells[v_L];
                      for (let _i4265 = 0; _i4265 < _a4264.length; _i4265++) {
                        const v_x = _a4264[_i4265];
                        if (!((!(_t4180.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                        _g4262++;
                      }
                    }
                    _c4266 = (_g4262 < v_v);
                  }
                  if (_c4266) {
                    _q4187 = true;
                    break Q4188;
                  }
                }
              }
            }
            _c4267 = _q4187;
          }
          let _c4274: boolean = _c4267;
          if (!_c4274) {
            let _g4268 = 0;
            G4269: {
              const _a4270 = sp.cells;
              for (let _i4271 = 0; _i4271 < _a4270.length; _i4271++) {
                const v_x = _a4270[_i4271];
                if (!(((_t4169.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                _g4268++;
              }
            }
            let _g4272 = 0;
            G4273: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g4272 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c4274 = (_g4268 > _g4272);
          }
          let _c4281: boolean = _c4274;
          if (!_c4281) {
            let _g4275 = 0;
            G4276: {
              const _a4277 = sp.cells;
              for (let _i4278 = 0; _i4278 < _a4277.length; _i4278++) {
                const v_x = _a4277[_i4278];
                if (!((!(_t4180.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                _g4275++;
              }
            }
            let _g4279 = 0;
            G4280: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g4279 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c4281 = (_g4275 < _g4279);
          }
          let _c4294: boolean = _c4281;
          if (!_c4294) {
            let _q4282 = false;
            Q4283: {
              const _a4284 = _t4169;
              for (let _i4285 = 0; _i4285 < _a4284.length; _i4285++) {
                const v_a = _a4284[_i4285];
                const _a4286 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i4287 = 0; _i4287 < _a4286.length; _i4287++) {
                  const v_L = _a4286[_i4287];
                  _g4288.length = 0;
                  G4289: {
                    const _a4292 = sp.lineCells[v_L];
                    for (let _i4293 = 0; _i4293 < _a4292.length; _i4293++) {
                      const v_x = _a4292[_i4293];
                      if (!(((_t4169.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g4288.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g4288).length > v_T)) {
                    _q4282 = true;
                    break Q4283;
                  }
                }
              }
            }
            _c4294 = _q4282;
          }
          let _c4532: boolean = _c4294;
          if (!_c4532) {
            let _q4295 = false;
            Q4296: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g4297.length = 0;
                G4298: {
                  _g4382.length = 0;
                  G4383: {
                    const _a4388 = union(_t4169, _t4180);
                    for (let _i4389 = 0; _i4389 < _a4388.length; _i4389++) {
                      const v_x = _a4388[_i4389];
                      const _a4390 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i4391 = 0; _i4391 < _a4390.length; _i4391++) {
                        const v_y = _a4390[_i4391];
                        if (!_g4382.includes(v_y)) _g4382.push(v_y);
                      }
                    }
                  }
                  const _a4392 = _g4382;
                  for (let _i4393 = 0; _i4393 < _a4392.length; _i4393++) {
                    const v_a = _a4392[_i4393];
                    if (!(((_t4169.includes(v_a)) || (b.value(v_a) === 1)))) continue;
                    const _a4394 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i4395 = 0; _i4395 < _a4394.length; _i4395++) {
                      const v_L = _a4394[_i4395];
                      _g4396.length = 0;
                      G4397: {
                        const _a4400 = sp.lineCells[v_L];
                        for (let _i4401 = 0; _i4401 < _a4400.length; _i4401++) {
                          const v_x = _a4400[_i4401];
                          if (!(((_t4169.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                          _g4396.push(v_x);
                        }
                      }
                      L4402: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g4396);
                        const _h4403 = v_G.length;
                        const _h4432 = (_h4403 === 1);
                        let _c4435: boolean = (_h4403 === v_m);
                        if (_c4435) {
                          let _q4404 = true;
                          Q4405: {
                            _g4406.length = 0;
                            G4407: {
                              _g4420.length = 0;
                              G4421: {
                                const _a4426 = v_G;
                                for (let _i4427 = 0; _i4427 < _a4426.length; _i4427++) {
                                  const v_g = _a4426[_i4427];
                                  const _a4428 = sp.adj4[v_g];
                                  for (let _i4429 = 0; _i4429 < _a4428.length; _i4429++) {
                                    const v_z = _a4428[_i4429];
                                    if (!_g4420.includes(v_z)) _g4420.push(v_z);
                                  }
                                }
                              }
                              const _a4430 = _g4420;
                              for (let _i4431 = 0; _i4431 < _a4430.length; _i4431++) {
                                const v_y = _a4430[_i4431];
                                if (!((!(v_G.includes(v_y)) && (_h4432 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g4406.push(v_y);
                              }
                            }
                            const _a4433 = _g4406;
                            for (let _i4434 = 0; _i4434 < _a4433.length; _i4434++) {
                              const v_y = _a4433[_i4434];
                              if (!(((_t4180.includes(v_y)) || (b.value(v_y) === 2)))) {
                                _q4404 = false;
                                break Q4405;
                              }
                            }
                          }
                          _c4435 = _q4404;
                        }
                        let _c4466: boolean = _c4435;
                        if (_c4466) {
                          let _q4436 = false;
                          Q4437: {
                            _g4438.length = 0;
                            G4439: {
                              _g4452.length = 0;
                              G4453: {
                                const _a4458 = v_G;
                                for (let _i4459 = 0; _i4459 < _a4458.length; _i4459++) {
                                  const v_g = _a4458[_i4459];
                                  const _a4460 = sp.adj4[v_g];
                                  for (let _i4461 = 0; _i4461 < _a4460.length; _i4461++) {
                                    const v_z = _a4460[_i4461];
                                    if (!_g4452.includes(v_z)) _g4452.push(v_z);
                                  }
                                }
                              }
                              const _a4462 = _g4452;
                              for (let _i4463 = 0; _i4463 < _a4462.length; _i4463++) {
                                const v_y = _a4462[_i4463];
                                if (!((!(v_G.includes(v_y)) && (_h4432 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g4438.push(v_y);
                              }
                            }
                            const _a4464 = union(v_G, _g4438);
                            for (let _i4465 = 0; _i4465 < _a4464.length; _i4465++) {
                              const v_x = _a4464[_i4465];
                              if (((_t4169.includes(v_x)) || (_t4180.includes(v_x)))) {
                                _q4436 = true;
                                break Q4437;
                              }
                            }
                          }
                          _c4466 = _q4436;
                        }
                        if (!(_c4466)) break L4402;
                        const _t4467 = (v_G[0] ?? -1);
                        if (!_g4297.includes(_t4467)) _g4297.push(_t4467);
                      }
                    }
                  }
                }
                L4468: {
                  const v_C = _g4297;
                  const _h4469 = v_C.length;
                  if (!((_h4469 > 0))) break L4468;
                  let _g4470 = 0;
                  G4471: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g4470 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g4472 = 0;
                  G4473: {
                    const _a4474 = sp.cells;
                    for (let _i4475 = 0; _i4475 < _a4474.length; _i4475++) {
                      const v_c = _a4474[_i4475];
                      const _h4515 = sp.rowOf[v_c];
                      const _h4523 = sp.colOf[v_c];
                      let _c4477: boolean = (b.value(v_c) === 1);
                      if (_c4477) {
                        const _t4476 = step(sp, v_c, 1);
                        _c4477 = !(((_t4476 !== -1) && (b.value(_t4476) === 1)));
                      }
                      let _c4479: boolean = _c4477;
                      if (_c4479) {
                        const _t4478 = step(sp, v_c, 3);
                        _c4479 = !(((_t4478 !== -1) && (b.value(_t4478) === 1)));
                      }
                      let _c4494: boolean = _c4479;
                      if (_c4494) {
                        const _t4480 = sp.rowOf[v_c];
                        _g4481.length = 0;
                        G4482: {
                          const _a4485 = sp.lineCells[_t4480];
                          for (let _i4486 = 0; _i4486 < _a4485.length; _i4486++) {
                            const v_x = _a4485[_i4486];
                            if (!((b.value(v_x) === 1))) continue;
                            _g4481.push(v_x);
                          }
                        }
                        const _t4487 = sp.colOf[v_c];
                        _g4488.length = 0;
                        G4489: {
                          const _a4492 = sp.lineCells[_t4487];
                          for (let _i4493 = 0; _i4493 < _a4492.length; _i4493++) {
                            const v_x = _a4492[_i4493];
                            if (!((b.value(v_x) === 1))) continue;
                            _g4488.push(v_x);
                          }
                        }
                        _c4494 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g4481), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g4488)).length === v_m);
                      }
                      let _c4531: boolean = _c4494;
                      if (_c4531) {
                        let _q4495 = true;
                        Q4496: {
                          const _t4497 = sp.rowOf[v_c];
                          _g4498.length = 0;
                          G4499: {
                            const _a4502 = sp.lineCells[_t4497];
                            for (let _i4503 = 0; _i4503 < _a4502.length; _i4503++) {
                              const v_x = _a4502[_i4503];
                              if (!((b.value(v_x) === 1))) continue;
                              _g4498.push(v_x);
                            }
                          }
                          const _t4504 = sp.colOf[v_c];
                          _g4505.length = 0;
                          G4506: {
                            const _a4509 = sp.lineCells[_t4504];
                            for (let _i4510 = 0; _i4510 < _a4509.length; _i4510++) {
                              const v_x = _a4509[_i4510];
                              if (!((b.value(v_x) === 1))) continue;
                              _g4505.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g4498), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g4505));
                          const _a4511 = v_G;
                          for (let _i4512 = 0; _i4512 < _a4511.length; _i4512++) {
                            const v_x = _a4511[_i4512];
                            const _a4513 = sp.adj4[v_x];
                            for (let _i4514 = 0; _i4514 < _a4513.length; _i4514++) {
                              const v_y = _a4513[_i4514];
                              let _c4522: boolean = !(v_G.includes(v_y));
                              if (_c4522) {
                                _g4516.length = 0;
                                G4517: {
                                  const _a4520 = sp.lineCells[_h4515];
                                  for (let _i4521 = 0; _i4521 < _a4520.length; _i4521++) {
                                    const v_x = _a4520[_i4521];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g4516.push(v_x);
                                  }
                                }
                                _c4522 = ((stretch(sp.lineCells[_h4515], v_c, _g4516).length === 1) || (sp.lineCells[_h4515].includes(v_y)));
                              }
                              let _c4530: boolean = _c4522;
                              if (_c4530) {
                                _g4524.length = 0;
                                G4525: {
                                  const _a4528 = sp.lineCells[_h4523];
                                  for (let _i4529 = 0; _i4529 < _a4528.length; _i4529++) {
                                    const v_x = _a4528[_i4529];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g4524.push(v_x);
                                  }
                                }
                                _c4530 = ((stretch(sp.lineCells[_h4523], v_c, _g4524).length === 1) || (sp.lineCells[_h4523].includes(v_y)));
                              }
                              if (!(_c4530)) continue;
                              if (!((b.value(v_y) === 2))) {
                                _q4495 = false;
                                break Q4496;
                              }
                            }
                          }
                        }
                        _c4531 = _q4495;
                      }
                      if (!(_c4531)) continue;
                      _g4472++;
                    }
                  }
                  if ((_h4469 > (_g4470 - _g4472))) {
                    _q4295 = true;
                    break Q4296;
                  }
                }
              }
            }
            _c4532 = _q4295;
          }
          if (!(_c4532)) break L4168;
          facts.length = 0;
          changed = false;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, u: v_u, W: v_W }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface CenterTrialBinding {
  T: number;
  c: number;
  L: number;
  S: readonly number[];
}

const centerTrialFacts: number[] = [];

export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding> | null): number {
  const _g4922: number[] = [];
  const _g4935: number[] = [];
  const _g4941: number[] = [];
  const _g4960: number[] = [];
  const _g4980: number[] = [];
  const _g4990: number[] = [];
  const _g5002: number[] = [];
  const _g5013: number[] = [];
  const _g5059: number[] = [];
  const _g5068: number[] = [];
  const _g5153: number[] = [];
  const _g5167: number[] = [];
  const _g5177: number[] = [];
  const _g5191: number[] = [];
  const _g5209: number[] = [];
  const _g5223: number[] = [];
  const _g5252: number[] = [];
  const _g5259: number[] = [];
  const _g5269: number[] = [];
  const _g5276: number[] = [];
  const _g5287: number[] = [];
  const _g5295: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  let _g4914 = -1;
  G4915: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t4916 = cl.fleet.length[v_k];
      if (_g4914 === -1 || _t4916 > _g4914) _g4914 = _t4916;
    }
  }
  const v_T = _g4914;
  const _a4917 = sp.cells;
  for (let _i4918 = 0; _i4918 < _a4917.length; _i4918++) {
    const v_c = _a4917[_i4918];
    const _h4919 = clueAt(cl.seg, v_c);
    if (!((_h4919 === 6))) continue;
    const _a4920 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i4921 = 0; _i4921 < _a4920.length; _i4921++) {
      const v_L = _a4920[_i4921];
      _g4922.length = 0;
      G4923: {
        const _a4926 = sp.adj4[v_c];
        for (let _i4927 = 0; _i4927 < _a4926.length; _i4927++) {
          const v_x = _a4926[_i4927];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g4922.push(v_x);
        }
      }
      L4928: {
        const v_S = _g4922;
        const _h4929 = v_S.length;
        let _c4934: boolean = (_h4929 === 2);
        if (_c4934) {
          let _q4930 = false;
          Q4931: {
            const _a4932 = v_S;
            for (let _i4933 = 0; _i4933 < _a4932.length; _i4933++) {
              const v_x = _a4932[_i4933];
              if (!(b.known(v_x))) {
                _q4930 = true;
                break Q4931;
              }
            }
          }
          _c4934 = _q4930;
        }
        let _c5304: boolean = _c4934;
        if (_c5304) {
          _g4935.length = 0;
          G4936: {
            const _a4939 = v_S;
            for (let _i4940 = 0; _i4940 < _a4939.length; _i4940++) {
              const v_x = _a4939[_i4940];
              if (!((v_x !== v_x))) continue;
              _g4935.push(v_x);
            }
          }
          _g4941.length = 0;
          G4942: {
            const _a4947 = v_S;
            for (let _i4948 = 0; _i4948 < _a4947.length; _i4948++) {
              const v_a = _a4947[_i4948];
              const _a4949 = sp.adj8[v_a];
              for (let _i4950 = 0; _i4950 < _a4949.length; _i4950++) {
                const v_d = _a4949[_i4950];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !(b.known(v_d))))) continue;
                if (!_g4941.includes(v_d)) _g4941.push(v_d);
              }
            }
          }
          const _t4951 = union(_g4935, _g4941);
          let _q4952 = false;
          Q4953: {
            const _a4954 = v_S;
            for (let _i4955 = 0; _i4955 < _a4954.length; _i4955++) {
              const v_a = _a4954[_i4955];
              const _a4956 = sp.adj8[v_a];
              for (let _i4957 = 0; _i4957 < _a4956.length; _i4957++) {
                const v_b = _a4956[_i4957];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || (b.value(v_b) === 1))) {
                  _q4952 = true;
                  break Q4953;
                }
              }
            }
          }
          let _c5038: boolean = _q4952;
          if (!_c5038) {
            let _q4958 = false;
            Q4959: {
              _g4960.length = 0;
              G4961: {
                const _a4966 = union(v_S, _t4951);
                for (let _i4967 = 0; _i4967 < _a4966.length; _i4967++) {
                  const v_a = _a4966[_i4967];
                  const _a4968 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i4969 = 0; _i4969 < _a4968.length; _i4969++) {
                    const v_M = _a4968[_i4969];
                    if (!_g4960.includes(v_M)) _g4960.push(v_M);
                  }
                }
              }
              const _a4970 = _g4960;
              for (let _i4971 = 0; _i4971 < _a4970.length; _i4971++) {
                const v_L = _a4970[_i4971];
                const _h4972 = clueAt(cl.n, v_L);
                let _g4973 = -1;
                G4974: {
                  const _a4975 = setOf(v_L);
                  for (let _i4976 = 0; _i4976 < _a4975.length; _i4976++) {
                    const v_K = _a4975[_i4976];
                    const _h4977 = clueAt(cl.n, v_K);
                    let _c4997: boolean = (_h4977 < 0);
                    if (_c4997) {
                      let _q4978 = true;
                      Q4979: {
                        _g4980.length = 0;
                        G4981: {
                          const _a4984 = sp.lines;
                          for (let _i4985 = 0; _i4985 < _a4984.length; _i4985++) {
                            const v_M = _a4984[_i4985];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g4980.push(v_M);
                          }
                        }
                        const _a4986 = _g4980;
                        for (let _i4987 = 0; _i4987 < _a4986.length; _i4987++) {
                          const v_M = _a4986[_i4987];
                          const _h4988 = clueAt(cl.n, v_M);
                          let _c4996: boolean = (_h4988 >= 0);
                          if (!_c4996) {
                            const _t4989 = sp.lineCells[v_M];
                            _g4990.length = 0;
                            G4991: {
                              const _a4994 = _t4989;
                              for (let _i4995 = 0; _i4995 < _a4994.length; _i4995++) {
                                const v_c = _a4994[_i4995];
                                if (!(!(b.known(v_c)))) continue;
                                _g4990.push(v_c);
                              }
                            }
                            _c4996 = (_g4990.length === 0);
                          }
                          if (!(_c4996)) {
                            _q4978 = false;
                            break Q4979;
                          }
                        }
                      }
                      _c4997 = _q4978;
                    }
                    if (!(_c4997)) continue;
                    let _g4998 = 0;
                    G4999: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g4998 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g5000 = 0;
                    G5001: {
                      _g5002.length = 0;
                      G5003: {
                        const _a5006 = sp.lines;
                        for (let _i5007 = 0; _i5007 < _a5006.length; _i5007++) {
                          const v_M = _a5006[_i5007];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g5002.push(v_M);
                        }
                      }
                      const _a5008 = _g5002;
                      for (let _i5009 = 0; _i5009 < _a5008.length; _i5009++) {
                        const v_M = _a5008[_i5009];
                        const _h5010 = clueAt(cl.n, v_M);
                        if (!((_h5010 >= 0))) continue;
                        _g5000 += _h5010;
                      }
                    }
                    let _g5011 = 0;
                    G5012: {
                      _g5013.length = 0;
                      G5014: {
                        const _a5017 = sp.lines;
                        for (let _i5018 = 0; _i5018 < _a5017.length; _i5018++) {
                          const v_M = _a5017[_i5018];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g5013.push(v_M);
                        }
                      }
                      const _a5019 = _g5013;
                      for (let _i5020 = 0; _i5020 < _a5019.length; _i5020++) {
                        const v_M = _a5019[_i5020];
                        const _h5021 = clueAt(cl.n, v_M);
                        if (!((_h5021 < 0))) continue;
                        const _t5022 = sp.lineCells[v_M];
                        let _g5023 = 0;
                        G5024: {
                          const _a5025 = _t5022;
                          for (let _i5026 = 0; _i5026 < _a5025.length; _i5026++) {
                            const v_c = _a5025[_i5026];
                            if (!((b.value(v_c) === 1))) continue;
                            _g5023++;
                          }
                        }
                        _g5011 += _g5023;
                      }
                    }
                    const _t5027 = ((_g4998 - _g5000) - _g5011);
                    if (_g4973 === -1 || _t5027 > _g4973) _g4973 = _t5027;
                  }
                }
                L5028: {
                  const v_v = ((_h4972 + _g4973) + 1);
                  if (!((v_v >= 0))) break L5028;
                  let _g5029 = 0;
                  G5030: {
                    const _a5031 = sp.lineCells[v_L];
                    for (let _i5032 = 0; _i5032 < _a5031.length; _i5032++) {
                      const v_x = _a5031[_i5032];
                      if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g5029++;
                    }
                  }
                  let _c5037: boolean = (_g5029 > v_v);
                  if (!_c5037) {
                    let _g5033 = 0;
                    G5034: {
                      const _a5035 = sp.lineCells[v_L];
                      for (let _i5036 = 0; _i5036 < _a5035.length; _i5036++) {
                        const v_x = _a5035[_i5036];
                        if (!((!(_t4951.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                        _g5033++;
                      }
                    }
                    _c5037 = (_g5033 < v_v);
                  }
                  if (_c5037) {
                    _q4958 = true;
                    break Q4959;
                  }
                }
              }
            }
            _c5038 = _q4958;
          }
          let _c5045: boolean = _c5038;
          if (!_c5045) {
            let _g5039 = 0;
            G5040: {
              const _a5041 = sp.cells;
              for (let _i5042 = 0; _i5042 < _a5041.length; _i5042++) {
                const v_x = _a5041[_i5042];
                if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                _g5039++;
              }
            }
            let _g5043 = 0;
            G5044: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g5043 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c5045 = (_g5039 > _g5043);
          }
          let _c5052: boolean = _c5045;
          if (!_c5052) {
            let _g5046 = 0;
            G5047: {
              const _a5048 = sp.cells;
              for (let _i5049 = 0; _i5049 < _a5048.length; _i5049++) {
                const v_x = _a5048[_i5049];
                if (!((!(_t4951.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                _g5046++;
              }
            }
            let _g5050 = 0;
            G5051: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g5050 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c5052 = (_g5046 < _g5050);
          }
          let _c5065: boolean = _c5052;
          if (!_c5065) {
            let _q5053 = false;
            Q5054: {
              const _a5055 = v_S;
              for (let _i5056 = 0; _i5056 < _a5055.length; _i5056++) {
                const v_a = _a5055[_i5056];
                const _a5057 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i5058 = 0; _i5058 < _a5057.length; _i5058++) {
                  const v_L = _a5057[_i5058];
                  _g5059.length = 0;
                  G5060: {
                    const _a5063 = sp.lineCells[v_L];
                    for (let _i5064 = 0; _i5064 < _a5063.length; _i5064++) {
                      const v_x = _a5063[_i5064];
                      if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g5059.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g5059).length > v_T)) {
                    _q5053 = true;
                    break Q5054;
                  }
                }
              }
            }
            _c5065 = _q5053;
          }
          let _c5303: boolean = _c5065;
          if (!_c5303) {
            let _q5066 = false;
            Q5067: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g5068.length = 0;
                G5069: {
                  _g5153.length = 0;
                  G5154: {
                    const _a5159 = union(v_S, _t4951);
                    for (let _i5160 = 0; _i5160 < _a5159.length; _i5160++) {
                      const v_x = _a5159[_i5160];
                      const _a5161 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i5162 = 0; _i5162 < _a5161.length; _i5162++) {
                        const v_y = _a5161[_i5162];
                        if (!_g5153.includes(v_y)) _g5153.push(v_y);
                      }
                    }
                  }
                  const _a5163 = _g5153;
                  for (let _i5164 = 0; _i5164 < _a5163.length; _i5164++) {
                    const v_a = _a5163[_i5164];
                    if (!(((v_S.includes(v_a)) || (b.value(v_a) === 1)))) continue;
                    const _a5165 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i5166 = 0; _i5166 < _a5165.length; _i5166++) {
                      const v_L = _a5165[_i5166];
                      _g5167.length = 0;
                      G5168: {
                        const _a5171 = sp.lineCells[v_L];
                        for (let _i5172 = 0; _i5172 < _a5171.length; _i5172++) {
                          const v_x = _a5171[_i5172];
                          if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                          _g5167.push(v_x);
                        }
                      }
                      L5173: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g5167);
                        const _h5174 = v_G.length;
                        const _h5203 = (_h5174 === 1);
                        let _c5206: boolean = (_h5174 === v_m);
                        if (_c5206) {
                          let _q5175 = true;
                          Q5176: {
                            _g5177.length = 0;
                            G5178: {
                              _g5191.length = 0;
                              G5192: {
                                const _a5197 = v_G;
                                for (let _i5198 = 0; _i5198 < _a5197.length; _i5198++) {
                                  const v_g = _a5197[_i5198];
                                  const _a5199 = sp.adj4[v_g];
                                  for (let _i5200 = 0; _i5200 < _a5199.length; _i5200++) {
                                    const v_z = _a5199[_i5200];
                                    if (!_g5191.includes(v_z)) _g5191.push(v_z);
                                  }
                                }
                              }
                              const _a5201 = _g5191;
                              for (let _i5202 = 0; _i5202 < _a5201.length; _i5202++) {
                                const v_y = _a5201[_i5202];
                                if (!((!(v_G.includes(v_y)) && (_h5203 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g5177.push(v_y);
                              }
                            }
                            const _a5204 = _g5177;
                            for (let _i5205 = 0; _i5205 < _a5204.length; _i5205++) {
                              const v_y = _a5204[_i5205];
                              if (!(((_t4951.includes(v_y)) || (b.value(v_y) === 2)))) {
                                _q5175 = false;
                                break Q5176;
                              }
                            }
                          }
                          _c5206 = _q5175;
                        }
                        let _c5237: boolean = _c5206;
                        if (_c5237) {
                          let _q5207 = false;
                          Q5208: {
                            _g5209.length = 0;
                            G5210: {
                              _g5223.length = 0;
                              G5224: {
                                const _a5229 = v_G;
                                for (let _i5230 = 0; _i5230 < _a5229.length; _i5230++) {
                                  const v_g = _a5229[_i5230];
                                  const _a5231 = sp.adj4[v_g];
                                  for (let _i5232 = 0; _i5232 < _a5231.length; _i5232++) {
                                    const v_z = _a5231[_i5232];
                                    if (!_g5223.includes(v_z)) _g5223.push(v_z);
                                  }
                                }
                              }
                              const _a5233 = _g5223;
                              for (let _i5234 = 0; _i5234 < _a5233.length; _i5234++) {
                                const v_y = _a5233[_i5234];
                                if (!((!(v_G.includes(v_y)) && (_h5203 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g5209.push(v_y);
                              }
                            }
                            const _a5235 = union(v_G, _g5209);
                            for (let _i5236 = 0; _i5236 < _a5235.length; _i5236++) {
                              const v_x = _a5235[_i5236];
                              if (((v_S.includes(v_x)) || (_t4951.includes(v_x)))) {
                                _q5207 = true;
                                break Q5208;
                              }
                            }
                          }
                          _c5237 = _q5207;
                        }
                        if (!(_c5237)) break L5173;
                        const _t5238 = (v_G[0] ?? -1);
                        if (!_g5068.includes(_t5238)) _g5068.push(_t5238);
                      }
                    }
                  }
                }
                L5239: {
                  const v_C = _g5068;
                  const _h5240 = v_C.length;
                  if (!((_h5240 > 0))) break L5239;
                  let _g5241 = 0;
                  G5242: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g5241 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g5243 = 0;
                  G5244: {
                    const _a5245 = sp.cells;
                    for (let _i5246 = 0; _i5246 < _a5245.length; _i5246++) {
                      const v_c = _a5245[_i5246];
                      const _h5286 = sp.rowOf[v_c];
                      const _h5294 = sp.colOf[v_c];
                      let _c5248: boolean = (b.value(v_c) === 1);
                      if (_c5248) {
                        const _t5247 = step(sp, v_c, 1);
                        _c5248 = !(((_t5247 !== -1) && (b.value(_t5247) === 1)));
                      }
                      let _c5250: boolean = _c5248;
                      if (_c5250) {
                        const _t5249 = step(sp, v_c, 3);
                        _c5250 = !(((_t5249 !== -1) && (b.value(_t5249) === 1)));
                      }
                      let _c5265: boolean = _c5250;
                      if (_c5265) {
                        const _t5251 = sp.rowOf[v_c];
                        _g5252.length = 0;
                        G5253: {
                          const _a5256 = sp.lineCells[_t5251];
                          for (let _i5257 = 0; _i5257 < _a5256.length; _i5257++) {
                            const v_x = _a5256[_i5257];
                            if (!((b.value(v_x) === 1))) continue;
                            _g5252.push(v_x);
                          }
                        }
                        const _t5258 = sp.colOf[v_c];
                        _g5259.length = 0;
                        G5260: {
                          const _a5263 = sp.lineCells[_t5258];
                          for (let _i5264 = 0; _i5264 < _a5263.length; _i5264++) {
                            const v_x = _a5263[_i5264];
                            if (!((b.value(v_x) === 1))) continue;
                            _g5259.push(v_x);
                          }
                        }
                        _c5265 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5252), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5259)).length === v_m);
                      }
                      let _c5302: boolean = _c5265;
                      if (_c5302) {
                        let _q5266 = true;
                        Q5267: {
                          const _t5268 = sp.rowOf[v_c];
                          _g5269.length = 0;
                          G5270: {
                            const _a5273 = sp.lineCells[_t5268];
                            for (let _i5274 = 0; _i5274 < _a5273.length; _i5274++) {
                              const v_x = _a5273[_i5274];
                              if (!((b.value(v_x) === 1))) continue;
                              _g5269.push(v_x);
                            }
                          }
                          const _t5275 = sp.colOf[v_c];
                          _g5276.length = 0;
                          G5277: {
                            const _a5280 = sp.lineCells[_t5275];
                            for (let _i5281 = 0; _i5281 < _a5280.length; _i5281++) {
                              const v_x = _a5280[_i5281];
                              if (!((b.value(v_x) === 1))) continue;
                              _g5276.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5269), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5276));
                          const _a5282 = v_G;
                          for (let _i5283 = 0; _i5283 < _a5282.length; _i5283++) {
                            const v_x = _a5282[_i5283];
                            const _a5284 = sp.adj4[v_x];
                            for (let _i5285 = 0; _i5285 < _a5284.length; _i5285++) {
                              const v_y = _a5284[_i5285];
                              let _c5293: boolean = !(v_G.includes(v_y));
                              if (_c5293) {
                                _g5287.length = 0;
                                G5288: {
                                  const _a5291 = sp.lineCells[_h5286];
                                  for (let _i5292 = 0; _i5292 < _a5291.length; _i5292++) {
                                    const v_x = _a5291[_i5292];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g5287.push(v_x);
                                  }
                                }
                                _c5293 = ((stretch(sp.lineCells[_h5286], v_c, _g5287).length === 1) || (sp.lineCells[_h5286].includes(v_y)));
                              }
                              let _c5301: boolean = _c5293;
                              if (_c5301) {
                                _g5295.length = 0;
                                G5296: {
                                  const _a5299 = sp.lineCells[_h5294];
                                  for (let _i5300 = 0; _i5300 < _a5299.length; _i5300++) {
                                    const v_x = _a5299[_i5300];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g5295.push(v_x);
                                  }
                                }
                                _c5301 = ((stretch(sp.lineCells[_h5294], v_c, _g5295).length === 1) || (sp.lineCells[_h5294].includes(v_y)));
                              }
                              if (!(_c5301)) continue;
                              if (!((b.value(v_y) === 2))) {
                                _q5266 = false;
                                break Q5267;
                              }
                            }
                          }
                        }
                        _c5302 = _q5266;
                      }
                      if (!(_c5302)) continue;
                      _g5243++;
                    }
                  }
                  if ((_h5240 > (_g5241 - _g5243))) {
                    _q5066 = true;
                    break Q5067;
                  }
                }
              }
            }
            _c5303 = _q5066;
          }
          _c5304 = _c5303;
        }
        if (!(_c5304)) break L4928;
        facts.length = 0;
        changed = false;
        let _q5305 = true;
        Q5306: {
          const _a5307 = v_S;
          for (let _i5308 = 0; _i5308 < _a5307.length; _i5308++) {
            const v_x = _a5307[_i5308];
            if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q5305 = false;
              break Q5306;
            }
          }
        }
        if (!(_q5305)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ T: v_T, c: v_c, L: v_L, S: v_S }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
