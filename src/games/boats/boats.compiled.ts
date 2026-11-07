// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, rangeMask, setOf, step, stretch, union } from "../../engine/describe-runtime.ts";

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
  const _g5334: number[] = [];
  const _g5341: number[] = [];
  const _g5415: number[] = [];
  const _g5422: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q5315 = true;
  Q5316: {
    const _a5317 = sp.cells;
    for (let _i5318 = 0; _i5318 < _a5317.length; _i5318++) {
      const v_a = _a5317[_i5318];
      if (!(((g[v_a] || -1) === 1))) continue;
      let _q5319 = true;
      Q5320: {
        const _a5321 = sp.adj8[v_a];
        for (let _i5322 = 0; _i5322 < _a5321.length; _i5322++) {
          const v_b = _a5321[_i5322];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          if (!(((g[v_b] || -1) !== 1))) {
            _q5319 = false;
            break Q5320;
          }
        }
      }
      if (!(_q5319)) {
        _q5315 = false;
        break Q5316;
      }
    }
  }
  if (!(_q5315)) return false;
  let _q5323 = true;
  Q5324: {
    const _a5325 = sp.cells;
    for (let _i5326 = 0; _i5326 < _a5325.length; _i5326++) {
      const v_c = _a5325[_i5326];
      let _c5328: boolean = ((g[v_c] || -1) === 1);
      if (_c5328) {
        const _t5327 = step(sp, v_c, 1);
        _c5328 = !(((_t5327 !== -1) && ((g[_t5327] || -1) === 1)));
      }
      let _c5330: boolean = _c5328;
      if (_c5330) {
        const _t5329 = step(sp, v_c, 3);
        _c5330 = !(((_t5329 !== -1) && ((g[_t5329] || -1) === 1)));
      }
      if (!(_c5330)) continue;
      let _q5331 = false;
      Q5332: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          const _t5333 = sp.rowOf[v_c];
          _g5334.length = 0;
          G5335: {
            const _a5338 = sp.lineCells[_t5333];
            for (let _i5339 = 0; _i5339 < _a5338.length; _i5339++) {
              const v_x = _a5338[_i5339];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5334.push(v_x);
            }
          }
          const _t5340 = sp.colOf[v_c];
          _g5341.length = 0;
          G5342: {
            const _a5345 = sp.lineCells[_t5340];
            for (let _i5346 = 0; _i5346 < _a5345.length; _i5346++) {
              const v_x = _a5345[_i5346];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5341.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5334), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5341)).length)) {
            _q5331 = true;
            break Q5332;
          }
        }
      }
      if (!(_q5331)) {
        _q5323 = false;
        break Q5324;
      }
    }
  }
  if (!(_q5323)) return false;
  let _q5347 = true;
  Q5348: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q5347 = false;
          break Q5348;
        }
      }
    }
  }
  if (!(_q5347)) return false;
  let _g5349 = 0;
  G5350: {
    const _a5351 = sp.cells;
    for (let _i5352 = 0; _i5352 < _a5351.length; _i5352++) {
      const v_c = _a5351[_i5352];
      if (!(((g[v_c] || -1) === 1))) continue;
      _g5349++;
    }
  }
  let _g5353 = 0;
  G5354: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g5353 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g5349 === _g5353))) return false;
  for (let _k5355 = 0; _k5355 < cl.n.at.length; _k5355++) {
    const _at5356 = cl.n.at[_k5355];
    const _v5357 = cl.n.v[_k5355];
    const _t5358 = sp.lineCells[_at5356];
    let _g5359 = 0;
    G5360: {
      const _a5361 = _t5358;
      for (let _i5362 = 0; _i5362 < _a5361.length; _i5362++) {
        const v_c = _a5361[_i5362];
        if (!(((g[v_c] || -1) === 1))) continue;
        _g5359++;
      }
    }
    if (!((_g5359 === _v5357))) return false;
  }
  for (let _k5363 = 0; _k5363 < cl.seg.at.length; _k5363++) {
    const _at5364 = cl.seg.at[_k5363];
    const _v5365 = cl.seg.v[_k5363];
    let _c5402: boolean = ((_v5365 === 2) && ((g[_at5364] || -1) === 2));
    if (!_c5402) {
      let _c5401: boolean = ((_v5365 > 2) && ((g[_at5364] || -1) === 1));
      if (_c5401) {
        let _c5370: boolean = (_v5365 === 3);
        if (!_c5370) {
          let _c5367: boolean = (_v5365 === 4);
          if (_c5367) {
            const _t5366 = step(sp, _at5364, 2);
            _c5367 = ((_t5366 !== -1) && ((g[_t5366] || -1) === 1));
          }
          let _c5369: boolean = _c5367;
          if (_c5369) {
            const _t5368 = step(sp, _at5364, 1);
            _c5369 = !(((_t5368 !== -1) && ((g[_t5368] || -1) === 1)));
          }
          _c5370 = _c5369;
        }
        let _c5375: boolean = _c5370;
        if (!_c5375) {
          let _c5372: boolean = (_v5365 === 5);
          if (_c5372) {
            const _t5371 = step(sp, _at5364, 1);
            _c5372 = ((_t5371 !== -1) && ((g[_t5371] || -1) === 1));
          }
          let _c5374: boolean = _c5372;
          if (_c5374) {
            const _t5373 = step(sp, _at5364, 2);
            _c5374 = !(((_t5373 !== -1) && ((g[_t5373] || -1) === 1)));
          }
          _c5375 = _c5374;
        }
        let _c5384: boolean = _c5375;
        if (!_c5384) {
          let _c5383: boolean = (_v5365 === 6);
          if (_c5383) {
            const _t5376 = step(sp, _at5364, 1);
            let _c5378: boolean = ((_t5376 !== -1) && ((g[_t5376] || -1) === 1));
            if (_c5378) {
              const _t5377 = step(sp, _at5364, 2);
              _c5378 = ((_t5377 !== -1) && ((g[_t5377] || -1) === 1));
            }
            let _c5382: boolean = _c5378;
            if (!_c5382) {
              const _t5379 = step(sp, _at5364, 3);
              let _c5381: boolean = ((_t5379 !== -1) && ((g[_t5379] || -1) === 1));
              if (_c5381) {
                const _t5380 = step(sp, _at5364, 4);
                _c5381 = ((_t5380 !== -1) && ((g[_t5380] || -1) === 1));
              }
              _c5382 = _c5381;
            }
            _c5383 = _c5382;
          }
          _c5384 = _c5383;
        }
        let _c5389: boolean = _c5384;
        if (!_c5389) {
          let _c5386: boolean = (_v5365 === 7);
          if (_c5386) {
            const _t5385 = step(sp, _at5364, 4);
            _c5386 = ((_t5385 !== -1) && ((g[_t5385] || -1) === 1));
          }
          let _c5388: boolean = _c5386;
          if (_c5388) {
            const _t5387 = step(sp, _at5364, 3);
            _c5388 = !(((_t5387 !== -1) && ((g[_t5387] || -1) === 1)));
          }
          _c5389 = _c5388;
        }
        let _c5394: boolean = _c5389;
        if (!_c5394) {
          let _c5391: boolean = (_v5365 === 8);
          if (_c5391) {
            const _t5390 = step(sp, _at5364, 3);
            _c5391 = ((_t5390 !== -1) && ((g[_t5390] || -1) === 1));
          }
          let _c5393: boolean = _c5391;
          if (_c5393) {
            const _t5392 = step(sp, _at5364, 4);
            _c5393 = !(((_t5392 !== -1) && ((g[_t5392] || -1) === 1)));
          }
          _c5394 = _c5393;
        }
        let _c5400: boolean = _c5394;
        if (!_c5400) {
          let _c5399: boolean = (_v5365 === 9);
          if (_c5399) {
            let _q5395 = false;
            Q5396: {
              const _a5397 = sp.adj4[_at5364];
              for (let _i5398 = 0; _i5398 < _a5397.length; _i5398++) {
                const v_x = _a5397[_i5398];
                if (((g[v_x] || -1) === 1)) {
                  _q5395 = true;
                  break Q5396;
                }
              }
            }
            _c5399 = !(_q5395);
          }
          _c5400 = _c5399;
        }
        _c5401 = _c5400;
      }
      _c5402 = _c5401;
    }
    if (!(_c5402)) return false;
  }
  for (let _k5403 = 0; _k5403 < cl.fleet.n; _k5403++) {
    let _g5406 = 0;
    G5407: {
      const _a5408 = sp.cells;
      for (let _i5409 = 0; _i5409 < _a5408.length; _i5409++) {
        const v_c = _a5408[_i5409];
        let _c5411: boolean = ((g[v_c] || -1) === 1);
        if (_c5411) {
          const _t5410 = step(sp, v_c, 1);
          _c5411 = !(((_t5410 !== -1) && ((g[_t5410] || -1) === 1)));
        }
        let _c5413: boolean = _c5411;
        if (_c5413) {
          const _t5412 = step(sp, v_c, 3);
          _c5413 = !(((_t5412 !== -1) && ((g[_t5412] || -1) === 1)));
        }
        let _c5428: boolean = _c5413;
        if (_c5428) {
          const _t5414 = sp.rowOf[v_c];
          _g5415.length = 0;
          G5416: {
            const _a5419 = sp.lineCells[_t5414];
            for (let _i5420 = 0; _i5420 < _a5419.length; _i5420++) {
              const v_x = _a5419[_i5420];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5415.push(v_x);
            }
          }
          const _t5421 = sp.colOf[v_c];
          _g5422.length = 0;
          G5423: {
            const _a5426 = sp.lineCells[_t5421];
            for (let _i5427 = 0; _i5427 < _a5426.length; _i5427++) {
              const v_x = _a5426[_i5427];
              if (!(((g[v_x] || -1) === 1))) continue;
              _g5422.push(v_x);
            }
          }
          _c5428 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5415), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5422)).length === cl.fleet.length[_k5403]);
        }
        if (!(_c5428)) continue;
        _g5406++;
      }
    }
    if (!((_g5406 === cl.fleet.boats[_k5403]))) return false;
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
  const _a184 = cluesValued(cl.seg, 6);
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
  const _a1157 = cluesValued(cl.seg, 6);
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
  const _g2331: number[] = [];
  const _g2341: number[] = [];
  const _g2353: number[] = [];
  const _g2364: number[] = [];
  const _g2401: number[] = [];
  const _g2411: number[] = [];
  const _g2423: number[] = [];
  const _g2434: number[] = [];
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  const _a2321 = sp.lines;
  for (let _i2322 = 0; _i2322 < _a2321.length; _i2322++) {
    const v_L = _a2321[_i2322];
    const _h2323 = clueAt(cl.n, v_L);
    let _g2324 = -1;
    G2325: {
      const _a2326 = setOf(v_L);
      for (let _i2327 = 0; _i2327 < _a2326.length; _i2327++) {
        const v_K = _a2326[_i2327];
        const _h2328 = clueAt(cl.n, v_K);
        let _c2348: boolean = (_h2328 < 0);
        if (_c2348) {
          let _q2329 = true;
          Q2330: {
            _g2331.length = 0;
            G2332: {
              const _a2335 = sp.lines;
              for (let _i2336 = 0; _i2336 < _a2335.length; _i2336++) {
                const v_M = _a2335[_i2336];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g2331.push(v_M);
              }
            }
            const _a2337 = _g2331;
            for (let _i2338 = 0; _i2338 < _a2337.length; _i2338++) {
              const v_M = _a2337[_i2338];
              const _h2339 = clueAt(cl.n, v_M);
              let _c2347: boolean = (_h2339 >= 0);
              if (!_c2347) {
                const _t2340 = sp.lineCells[v_M];
                _g2341.length = 0;
                G2342: {
                  const _a2345 = _t2340;
                  for (let _i2346 = 0; _i2346 < _a2345.length; _i2346++) {
                    const v_c = _a2345[_i2346];
                    if (!(!(b.known(v_c)))) continue;
                    _g2341.push(v_c);
                  }
                }
                _c2347 = (_g2341.length === 0);
              }
              if (!(_c2347)) {
                _q2329 = false;
                break Q2330;
              }
            }
          }
          _c2348 = _q2329;
        }
        if (!(_c2348)) continue;
        let _g2349 = 0;
        G2350: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g2349 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g2351 = 0;
        G2352: {
          _g2353.length = 0;
          G2354: {
            const _a2357 = sp.lines;
            for (let _i2358 = 0; _i2358 < _a2357.length; _i2358++) {
              const v_M = _a2357[_i2358];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g2353.push(v_M);
            }
          }
          const _a2359 = _g2353;
          for (let _i2360 = 0; _i2360 < _a2359.length; _i2360++) {
            const v_M = _a2359[_i2360];
            const _h2361 = clueAt(cl.n, v_M);
            if (!((_h2361 >= 0))) continue;
            _g2351 += _h2361;
          }
        }
        let _g2362 = 0;
        G2363: {
          _g2364.length = 0;
          G2365: {
            const _a2368 = sp.lines;
            for (let _i2369 = 0; _i2369 < _a2368.length; _i2369++) {
              const v_M = _a2368[_i2369];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g2364.push(v_M);
            }
          }
          const _a2370 = _g2364;
          for (let _i2371 = 0; _i2371 < _a2370.length; _i2371++) {
            const v_M = _a2370[_i2371];
            const _h2372 = clueAt(cl.n, v_M);
            if (!((_h2372 < 0))) continue;
            const _t2373 = sp.lineCells[v_M];
            let _g2374 = 0;
            G2375: {
              const _a2376 = _t2373;
              for (let _i2377 = 0; _i2377 < _a2376.length; _i2377++) {
                const v_c = _a2376[_i2377];
                if (!((b.value(v_c) === 1))) continue;
                _g2374++;
              }
            }
            _g2362 += _g2374;
          }
        }
        const _t2378 = ((_g2349 - _g2351) - _g2362);
        if (_g2324 === -1 || _t2378 > _g2324) _g2324 = _t2378;
      }
    }
    L2379: {
      const v_v = ((_h2323 + _g2324) + 1);
      if (!((v_v >= 0))) break L2379;
      let _g2380 = 0;
      G2381: {
        const _a2382 = sp.lineCells[v_L];
        for (let _i2383 = 0; _i2383 < _a2382.length; _i2383++) {
          const v_c = _a2382[_i2383];
          if (!((b.value(v_c) === 2))) continue;
          _g2380++;
        }
      }
      L2384: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g2380);
        if (!(((v_t === 1) || (v_t === 2)))) break L2384;
        const _a2385 = sp.lineCells[v_L];
        for (let _i2386 = 0; _i2386 < _a2385.length; _i2386++) {
          const v_k = _a2385[_i2386];
          let _g2387 = -1;
          let _n2389 = 0;
          G2388: {
            const _a2390 = setOf(sp.rowOf[v_k], sp.colOf[v_k]);
            for (let _i2391 = 0; _i2391 < _a2390.length; _i2391++) {
              const v_M = _a2390[_i2391];
              if (!((v_M !== v_L))) continue;
              if (++_n2389 === 2) {
                _g2387 = -1;
                break G2388;
              }
              _g2387 = v_M;
            }
          }
          const v_K = _g2387;
          const _h2392 = clueAt(cl.n, v_K);
          let _g2393 = -1;
          G2394: {
            const _a2396 = setOf(v_K);
            for (let _i2397 = 0; _i2397 < _a2396.length; _i2397++) {
              const v_K_2395 = _a2396[_i2397];
              const _h2398 = clueAt(cl.n, v_K_2395);
              let _c2418: boolean = (_h2398 < 0);
              if (_c2418) {
                let _q2399 = true;
                Q2400: {
                  _g2401.length = 0;
                  G2402: {
                    const _a2405 = sp.lines;
                    for (let _i2406 = 0; _i2406 < _a2405.length; _i2406++) {
                      const v_M = _a2405[_i2406];
                      if (!(((v_M !== v_K_2395) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_2395][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_2395][1] ?? -1) % sp.w)))))) continue;
                      _g2401.push(v_M);
                    }
                  }
                  const _a2407 = _g2401;
                  for (let _i2408 = 0; _i2408 < _a2407.length; _i2408++) {
                    const v_M = _a2407[_i2408];
                    const _h2409 = clueAt(cl.n, v_M);
                    let _c2417: boolean = (_h2409 >= 0);
                    if (!_c2417) {
                      const _t2410 = sp.lineCells[v_M];
                      _g2411.length = 0;
                      G2412: {
                        const _a2415 = _t2410;
                        for (let _i2416 = 0; _i2416 < _a2415.length; _i2416++) {
                          const v_c = _a2415[_i2416];
                          if (!(!(b.known(v_c)))) continue;
                          _g2411.push(v_c);
                        }
                      }
                      _c2417 = (_g2411.length === 0);
                    }
                    if (!(_c2417)) {
                      _q2399 = false;
                      break Q2400;
                    }
                  }
                }
                _c2418 = _q2399;
              }
              if (!(_c2418)) continue;
              let _g2419 = 0;
              G2420: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g2419 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              let _g2421 = 0;
              G2422: {
                _g2423.length = 0;
                G2424: {
                  const _a2427 = sp.lines;
                  for (let _i2428 = 0; _i2428 < _a2427.length; _i2428++) {
                    const v_M = _a2427[_i2428];
                    if (!(((v_M !== v_K_2395) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_2395][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_2395][1] ?? -1) % sp.w)))))) continue;
                    _g2423.push(v_M);
                  }
                }
                const _a2429 = _g2423;
                for (let _i2430 = 0; _i2430 < _a2429.length; _i2430++) {
                  const v_M = _a2429[_i2430];
                  const _h2431 = clueAt(cl.n, v_M);
                  if (!((_h2431 >= 0))) continue;
                  _g2421 += _h2431;
                }
              }
              let _g2432 = 0;
              G2433: {
                _g2434.length = 0;
                G2435: {
                  const _a2438 = sp.lines;
                  for (let _i2439 = 0; _i2439 < _a2438.length; _i2439++) {
                    const v_M = _a2438[_i2439];
                    if (!(((v_M !== v_K_2395) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_2395][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_2395][1] ?? -1) % sp.w)))))) continue;
                    _g2434.push(v_M);
                  }
                }
                const _a2440 = _g2434;
                for (let _i2441 = 0; _i2441 < _a2440.length; _i2441++) {
                  const v_M = _a2440[_i2441];
                  const _h2442 = clueAt(cl.n, v_M);
                  if (!((_h2442 < 0))) continue;
                  const _t2443 = sp.lineCells[v_M];
                  let _g2444 = 0;
                  G2445: {
                    const _a2446 = _t2443;
                    for (let _i2447 = 0; _i2447 < _a2446.length; _i2447++) {
                      const v_c = _a2446[_i2447];
                      if (!((b.value(v_c) === 1))) continue;
                      _g2444++;
                    }
                  }
                  _g2432 += _g2444;
                }
              }
              const _t2448 = ((_g2419 - _g2421) - _g2432);
              if (_g2393 === -1 || _t2448 > _g2393) _g2393 = _t2448;
            }
          }
          const v_j = ((_h2392 + _g2393) + 1);
          const _h2457 = (v_j >= 0);
          let _g2449 = 0;
          G2450: {
            const _a2451 = sp.adj4[v_k];
            for (let _i2452 = 0; _i2452 < _a2451.length; _i2452++) {
              const v_x = _a2451[_i2452];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !(b.known(v_x))))) continue;
              _g2449++;
            }
          }
          let _g2453 = 0;
          G2454: {
            const _a2455 = setOf(v_k);
            for (let _i2456 = 0; _i2456 < _a2455.length; _i2456++) {
              const v_x = _a2455[_i2456];
              let _c2463: boolean = (!(b.known(v_x)) && _h2457);
              if (_c2463) {
                const _t2458 = sp.lineCells[v_K];
                let _g2459 = 0;
                G2460: {
                  const _a2461 = _t2458;
                  for (let _i2462 = 0; _i2462 < _a2461.length; _i2462++) {
                    const v_c = _a2461[_i2462];
                    if (!((b.value(v_c) === 1))) continue;
                    _g2459++;
                  }
                }
                _c2463 = ((v_j - _g2459) === 1);
              }
              if (!(_c2463)) continue;
              _g2453++;
            }
          }
          L2464: {
            const v_s = (_g2449 + _g2453);
            if (!((v_s > v_t))) break L2464;
            facts.length = 0;
            changed = false;
            let _q2465 = true;
            Q2466: {
              const _a2467 = sp.adj4[v_k];
              for (let _i2468 = 0; _i2468 < _a2467.length; _i2468++) {
                const v_y = _a2467[_i2468];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !(b.known(v_y))))) continue;
                if (!b.known(v_y)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q2465 = false;
                  break Q2466;
                }
              }
            }
            if (!(_q2465)) return -1;
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
  const _g2988: number[] = [];
  const _g2998: number[] = [];
  const _g3010: number[] = [];
  const _g3021: number[] = [];
  const _g3058: number[] = [];
  const _g3068: number[] = [];
  const _g3080: number[] = [];
  const _g3091: number[] = [];
  const _g3110: number[] = [];
  const _g3116: number[] = [];
  const _g3126: number[] = [];
  const _g3139: number[] = [];
  const _g3158: number[] = [];
  const _g3178: number[] = [];
  const _g3188: number[] = [];
  const _g3200: number[] = [];
  const _g3211: number[] = [];
  const _g3257: number[] = [];
  const _g3266: number[] = [];
  const _g3351: number[] = [];
  const _g3365: number[] = [];
  const _g3375: number[] = [];
  const _g3389: number[] = [];
  const _g3407: number[] = [];
  const _g3421: number[] = [];
  const _g3450: number[] = [];
  const _g3457: number[] = [];
  const _g3467: number[] = [];
  const _g3474: number[] = [];
  const _g3485: number[] = [];
  const _g3493: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  let _g2975 = -1;
  G2976: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2977 = cl.fleet.length[v_k];
      if (_g2975 === -1 || _t2977 > _g2975) _g2975 = _t2977;
    }
  }
  const v_T = _g2975;
  const _a2978 = sp.lines;
  for (let _i2979 = 0; _i2979 < _a2978.length; _i2979++) {
    const v_L = _a2978[_i2979];
    const _h2980 = clueAt(cl.n, v_L);
    let _g2981 = -1;
    G2982: {
      const _a2983 = setOf(v_L);
      for (let _i2984 = 0; _i2984 < _a2983.length; _i2984++) {
        const v_K = _a2983[_i2984];
        const _h2985 = clueAt(cl.n, v_K);
        let _c3005: boolean = (_h2985 < 0);
        if (_c3005) {
          let _q2986 = true;
          Q2987: {
            _g2988.length = 0;
            G2989: {
              const _a2992 = sp.lines;
              for (let _i2993 = 0; _i2993 < _a2992.length; _i2993++) {
                const v_M = _a2992[_i2993];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g2988.push(v_M);
              }
            }
            const _a2994 = _g2988;
            for (let _i2995 = 0; _i2995 < _a2994.length; _i2995++) {
              const v_M = _a2994[_i2995];
              const _h2996 = clueAt(cl.n, v_M);
              let _c3004: boolean = (_h2996 >= 0);
              if (!_c3004) {
                const _t2997 = sp.lineCells[v_M];
                _g2998.length = 0;
                G2999: {
                  const _a3002 = _t2997;
                  for (let _i3003 = 0; _i3003 < _a3002.length; _i3003++) {
                    const v_c = _a3002[_i3003];
                    if (!(!(b.known(v_c)))) continue;
                    _g2998.push(v_c);
                  }
                }
                _c3004 = (_g2998.length === 0);
              }
              if (!(_c3004)) {
                _q2986 = false;
                break Q2987;
              }
            }
          }
          _c3005 = _q2986;
        }
        if (!(_c3005)) continue;
        let _g3006 = 0;
        G3007: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g3006 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g3008 = 0;
        G3009: {
          _g3010.length = 0;
          G3011: {
            const _a3014 = sp.lines;
            for (let _i3015 = 0; _i3015 < _a3014.length; _i3015++) {
              const v_M = _a3014[_i3015];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g3010.push(v_M);
            }
          }
          const _a3016 = _g3010;
          for (let _i3017 = 0; _i3017 < _a3016.length; _i3017++) {
            const v_M = _a3016[_i3017];
            const _h3018 = clueAt(cl.n, v_M);
            if (!((_h3018 >= 0))) continue;
            _g3008 += _h3018;
          }
        }
        let _g3019 = 0;
        G3020: {
          _g3021.length = 0;
          G3022: {
            const _a3025 = sp.lines;
            for (let _i3026 = 0; _i3026 < _a3025.length; _i3026++) {
              const v_M = _a3025[_i3026];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g3021.push(v_M);
            }
          }
          const _a3027 = _g3021;
          for (let _i3028 = 0; _i3028 < _a3027.length; _i3028++) {
            const v_M = _a3027[_i3028];
            const _h3029 = clueAt(cl.n, v_M);
            if (!((_h3029 < 0))) continue;
            const _t3030 = sp.lineCells[v_M];
            let _g3031 = 0;
            G3032: {
              const _a3033 = _t3030;
              for (let _i3034 = 0; _i3034 < _a3033.length; _i3034++) {
                const v_c = _a3033[_i3034];
                if (!((b.value(v_c) === 1))) continue;
                _g3031++;
              }
            }
            _g3019 += _g3031;
          }
        }
        const _t3035 = ((_g3006 - _g3008) - _g3019);
        if (_g2981 === -1 || _t3035 > _g2981) _g2981 = _t3035;
      }
    }
    L3036: {
      const v_v = ((_h2980 + _g2981) + 1);
      let _c3041: boolean = (v_v >= 0);
      if (_c3041) {
        let _g3037 = 0;
        G3038: {
          const _a3039 = sp.lineCells[v_L];
          for (let _i3040 = 0; _i3040 < _a3039.length; _i3040++) {
            const v_c = _a3039[_i3040];
            if (!((b.value(v_c) === 2))) continue;
            _g3037++;
          }
        }
        _c3041 = (((sp.lineCells[v_L].length - v_v) - _g3037) === 1);
      }
      if (!(_c3041)) break L3036;
      const _a3042 = sp.lineCells[v_L];
      for (let _i3043 = 0; _i3043 < _a3042.length; _i3043++) {
        const v_c = _a3042[_i3043];
        if (!(!(b.known(v_c)))) continue;
        let _g3044 = -1;
        let _n3046 = 0;
        G3045: {
          const _a3047 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i3048 = 0; _i3048 < _a3047.length; _i3048++) {
            const v_M = _a3047[_i3048];
            if (!((v_M !== v_L))) continue;
            if (++_n3046 === 2) {
              _g3044 = -1;
              break G3045;
            }
            _g3044 = v_M;
          }
        }
        const v_K = _g3044;
        const _h3049 = clueAt(cl.n, v_K);
        let _g3050 = -1;
        G3051: {
          const _a3053 = setOf(v_K);
          for (let _i3054 = 0; _i3054 < _a3053.length; _i3054++) {
            const v_K_3052 = _a3053[_i3054];
            const _h3055 = clueAt(cl.n, v_K_3052);
            let _c3075: boolean = (_h3055 < 0);
            if (_c3075) {
              let _q3056 = true;
              Q3057: {
                _g3058.length = 0;
                G3059: {
                  const _a3062 = sp.lines;
                  for (let _i3063 = 0; _i3063 < _a3062.length; _i3063++) {
                    const v_M = _a3062[_i3063];
                    if (!(((v_M !== v_K_3052) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_3052][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_3052][1] ?? -1) % sp.w)))))) continue;
                    _g3058.push(v_M);
                  }
                }
                const _a3064 = _g3058;
                for (let _i3065 = 0; _i3065 < _a3064.length; _i3065++) {
                  const v_M = _a3064[_i3065];
                  const _h3066 = clueAt(cl.n, v_M);
                  let _c3074: boolean = (_h3066 >= 0);
                  if (!_c3074) {
                    const _t3067 = sp.lineCells[v_M];
                    _g3068.length = 0;
                    G3069: {
                      const _a3072 = _t3067;
                      for (let _i3073 = 0; _i3073 < _a3072.length; _i3073++) {
                        const v_c = _a3072[_i3073];
                        if (!(!(b.known(v_c)))) continue;
                        _g3068.push(v_c);
                      }
                    }
                    _c3074 = (_g3068.length === 0);
                  }
                  if (!(_c3074)) {
                    _q3056 = false;
                    break Q3057;
                  }
                }
              }
              _c3075 = _q3056;
            }
            if (!(_c3075)) continue;
            let _g3076 = 0;
            G3077: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3076 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            let _g3078 = 0;
            G3079: {
              _g3080.length = 0;
              G3081: {
                const _a3084 = sp.lines;
                for (let _i3085 = 0; _i3085 < _a3084.length; _i3085++) {
                  const v_M = _a3084[_i3085];
                  if (!(((v_M !== v_K_3052) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_3052][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_3052][1] ?? -1) % sp.w)))))) continue;
                  _g3080.push(v_M);
                }
              }
              const _a3086 = _g3080;
              for (let _i3087 = 0; _i3087 < _a3086.length; _i3087++) {
                const v_M = _a3086[_i3087];
                const _h3088 = clueAt(cl.n, v_M);
                if (!((_h3088 >= 0))) continue;
                _g3078 += _h3088;
              }
            }
            let _g3089 = 0;
            G3090: {
              _g3091.length = 0;
              G3092: {
                const _a3095 = sp.lines;
                for (let _i3096 = 0; _i3096 < _a3095.length; _i3096++) {
                  const v_M = _a3095[_i3096];
                  if (!(((v_M !== v_K_3052) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_3052][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_3052][1] ?? -1) % sp.w)))))) continue;
                  _g3091.push(v_M);
                }
              }
              const _a3097 = _g3091;
              for (let _i3098 = 0; _i3098 < _a3097.length; _i3098++) {
                const v_M = _a3097[_i3098];
                const _h3099 = clueAt(cl.n, v_M);
                if (!((_h3099 < 0))) continue;
                const _t3100 = sp.lineCells[v_M];
                let _g3101 = 0;
                G3102: {
                  const _a3103 = _t3100;
                  for (let _i3104 = 0; _i3104 < _a3103.length; _i3104++) {
                    const v_c = _a3103[_i3104];
                    if (!((b.value(v_c) === 1))) continue;
                    _g3101++;
                  }
                }
                _g3089 += _g3101;
              }
            }
            const _t3105 = ((_g3076 - _g3078) - _g3089);
            if (_g3050 === -1 || _t3105 > _g3050) _g3050 = _t3105;
          }
        }
        const v_j = ((_h3049 + _g3050) + 1);
        const _h3134 = (v_j >= 0);
        let _g3106 = 0;
        G3107: {
          const _a3108 = sp.lineCells[v_K];
          for (let _i3109 = 0; _i3109 < _a3108.length; _i3109++) {
            const v_c = _a3108[_i3109];
            if (!((b.value(v_c) === 2))) continue;
            _g3106++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g3106);
        const _h3135 = (v_t === 1);
        const _h3136 = (_h3134 && _h3135);
        _g3110.length = 0;
        G3111: {
          const _a3114 = sp.lineCells[v_L];
          for (let _i3115 = 0; _i3115 < _a3114.length; _i3115++) {
            const v_x = _a3114[_i3115];
            if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
            _g3110.push(v_x);
          }
        }
        _g3116.length = 0;
        G3117: {
          _g3126.length = 0;
          G3127: {
            const _a3130 = sp.lineCells[v_K];
            for (let _i3131 = 0; _i3131 < _a3130.length; _i3131++) {
              const v_x = _a3130[_i3131];
              if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
              _g3126.push(v_x);
            }
          }
          const _a3132 = _g3126;
          for (let _i3133 = 0; _i3133 < _a3132.length; _i3133++) {
            const v_x = _a3132[_i3133];
            if (!(_h3136)) continue;
            _g3116.push(v_x);
          }
        }
        L3137: {
          const v_H = union(_g3110, _g3116);
          const _t3138 = setOf(v_c);
          _g3139.length = 0;
          G3140: {
            const _a3145 = v_H;
            for (let _i3146 = 0; _i3146 < _a3145.length; _i3146++) {
              const v_a = _a3145[_i3146];
              const _a3147 = sp.adj8[v_a];
              for (let _i3148 = 0; _i3148 < _a3147.length; _i3148++) {
                const v_d = _a3147[_i3148];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !(b.known(v_d))))) continue;
                if (!_g3139.includes(v_d)) _g3139.push(v_d);
              }
            }
          }
          const _t3149 = union(_t3138, _g3139);
          let _q3150 = false;
          Q3151: {
            const _a3152 = v_H;
            for (let _i3153 = 0; _i3153 < _a3152.length; _i3153++) {
              const v_a = _a3152[_i3153];
              const _a3154 = sp.adj8[v_a];
              for (let _i3155 = 0; _i3155 < _a3154.length; _i3155++) {
                const v_b = _a3154[_i3155];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || (b.value(v_b) === 1))) {
                  _q3150 = true;
                  break Q3151;
                }
              }
            }
          }
          let _c3236: boolean = _q3150;
          if (!_c3236) {
            let _q3156 = false;
            Q3157: {
              _g3158.length = 0;
              G3159: {
                const _a3164 = union(v_H, _t3149);
                for (let _i3165 = 0; _i3165 < _a3164.length; _i3165++) {
                  const v_a = _a3164[_i3165];
                  const _a3166 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i3167 = 0; _i3167 < _a3166.length; _i3167++) {
                    const v_M = _a3166[_i3167];
                    if (!_g3158.includes(v_M)) _g3158.push(v_M);
                  }
                }
              }
              const _a3168 = _g3158;
              for (let _i3169 = 0; _i3169 < _a3168.length; _i3169++) {
                const v_L = _a3168[_i3169];
                const _h3170 = clueAt(cl.n, v_L);
                let _g3171 = -1;
                G3172: {
                  const _a3173 = setOf(v_L);
                  for (let _i3174 = 0; _i3174 < _a3173.length; _i3174++) {
                    const v_K = _a3173[_i3174];
                    const _h3175 = clueAt(cl.n, v_K);
                    let _c3195: boolean = (_h3175 < 0);
                    if (_c3195) {
                      let _q3176 = true;
                      Q3177: {
                        _g3178.length = 0;
                        G3179: {
                          const _a3182 = sp.lines;
                          for (let _i3183 = 0; _i3183 < _a3182.length; _i3183++) {
                            const v_M = _a3182[_i3183];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g3178.push(v_M);
                          }
                        }
                        const _a3184 = _g3178;
                        for (let _i3185 = 0; _i3185 < _a3184.length; _i3185++) {
                          const v_M = _a3184[_i3185];
                          const _h3186 = clueAt(cl.n, v_M);
                          let _c3194: boolean = (_h3186 >= 0);
                          if (!_c3194) {
                            const _t3187 = sp.lineCells[v_M];
                            _g3188.length = 0;
                            G3189: {
                              const _a3192 = _t3187;
                              for (let _i3193 = 0; _i3193 < _a3192.length; _i3193++) {
                                const v_c = _a3192[_i3193];
                                if (!(!(b.known(v_c)))) continue;
                                _g3188.push(v_c);
                              }
                            }
                            _c3194 = (_g3188.length === 0);
                          }
                          if (!(_c3194)) {
                            _q3176 = false;
                            break Q3177;
                          }
                        }
                      }
                      _c3195 = _q3176;
                    }
                    if (!(_c3195)) continue;
                    let _g3196 = 0;
                    G3197: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g3196 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g3198 = 0;
                    G3199: {
                      _g3200.length = 0;
                      G3201: {
                        const _a3204 = sp.lines;
                        for (let _i3205 = 0; _i3205 < _a3204.length; _i3205++) {
                          const v_M = _a3204[_i3205];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g3200.push(v_M);
                        }
                      }
                      const _a3206 = _g3200;
                      for (let _i3207 = 0; _i3207 < _a3206.length; _i3207++) {
                        const v_M = _a3206[_i3207];
                        const _h3208 = clueAt(cl.n, v_M);
                        if (!((_h3208 >= 0))) continue;
                        _g3198 += _h3208;
                      }
                    }
                    let _g3209 = 0;
                    G3210: {
                      _g3211.length = 0;
                      G3212: {
                        const _a3215 = sp.lines;
                        for (let _i3216 = 0; _i3216 < _a3215.length; _i3216++) {
                          const v_M = _a3215[_i3216];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g3211.push(v_M);
                        }
                      }
                      const _a3217 = _g3211;
                      for (let _i3218 = 0; _i3218 < _a3217.length; _i3218++) {
                        const v_M = _a3217[_i3218];
                        const _h3219 = clueAt(cl.n, v_M);
                        if (!((_h3219 < 0))) continue;
                        const _t3220 = sp.lineCells[v_M];
                        let _g3221 = 0;
                        G3222: {
                          const _a3223 = _t3220;
                          for (let _i3224 = 0; _i3224 < _a3223.length; _i3224++) {
                            const v_c = _a3223[_i3224];
                            if (!((b.value(v_c) === 1))) continue;
                            _g3221++;
                          }
                        }
                        _g3209 += _g3221;
                      }
                    }
                    const _t3225 = ((_g3196 - _g3198) - _g3209);
                    if (_g3171 === -1 || _t3225 > _g3171) _g3171 = _t3225;
                  }
                }
                L3226: {
                  const v_v = ((_h3170 + _g3171) + 1);
                  if (!((v_v >= 0))) break L3226;
                  let _g3227 = 0;
                  G3228: {
                    const _a3229 = sp.lineCells[v_L];
                    for (let _i3230 = 0; _i3230 < _a3229.length; _i3230++) {
                      const v_x = _a3229[_i3230];
                      if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g3227++;
                    }
                  }
                  let _c3235: boolean = (_g3227 > v_v);
                  if (!_c3235) {
                    let _g3231 = 0;
                    G3232: {
                      const _a3233 = sp.lineCells[v_L];
                      for (let _i3234 = 0; _i3234 < _a3233.length; _i3234++) {
                        const v_x = _a3233[_i3234];
                        if (!((!(_t3149.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                        _g3231++;
                      }
                    }
                    _c3235 = (_g3231 < v_v);
                  }
                  if (_c3235) {
                    _q3156 = true;
                    break Q3157;
                  }
                }
              }
            }
            _c3236 = _q3156;
          }
          let _c3243: boolean = _c3236;
          if (!_c3243) {
            let _g3237 = 0;
            G3238: {
              const _a3239 = sp.cells;
              for (let _i3240 = 0; _i3240 < _a3239.length; _i3240++) {
                const v_x = _a3239[_i3240];
                if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                _g3237++;
              }
            }
            let _g3241 = 0;
            G3242: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3241 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c3243 = (_g3237 > _g3241);
          }
          let _c3250: boolean = _c3243;
          if (!_c3250) {
            let _g3244 = 0;
            G3245: {
              const _a3246 = sp.cells;
              for (let _i3247 = 0; _i3247 < _a3246.length; _i3247++) {
                const v_x = _a3246[_i3247];
                if (!((!(_t3149.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                _g3244++;
              }
            }
            let _g3248 = 0;
            G3249: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3248 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c3250 = (_g3244 < _g3248);
          }
          let _c3263: boolean = _c3250;
          if (!_c3263) {
            let _q3251 = false;
            Q3252: {
              const _a3253 = v_H;
              for (let _i3254 = 0; _i3254 < _a3253.length; _i3254++) {
                const v_a = _a3253[_i3254];
                const _a3255 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i3256 = 0; _i3256 < _a3255.length; _i3256++) {
                  const v_L = _a3255[_i3256];
                  _g3257.length = 0;
                  G3258: {
                    const _a3261 = sp.lineCells[v_L];
                    for (let _i3262 = 0; _i3262 < _a3261.length; _i3262++) {
                      const v_x = _a3261[_i3262];
                      if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g3257.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g3257).length > v_T)) {
                    _q3251 = true;
                    break Q3252;
                  }
                }
              }
            }
            _c3263 = _q3251;
          }
          let _c3501: boolean = _c3263;
          if (!_c3501) {
            let _q3264 = false;
            Q3265: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g3266.length = 0;
                G3267: {
                  _g3351.length = 0;
                  G3352: {
                    const _a3357 = union(v_H, _t3149);
                    for (let _i3358 = 0; _i3358 < _a3357.length; _i3358++) {
                      const v_x = _a3357[_i3358];
                      const _a3359 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i3360 = 0; _i3360 < _a3359.length; _i3360++) {
                        const v_y = _a3359[_i3360];
                        if (!_g3351.includes(v_y)) _g3351.push(v_y);
                      }
                    }
                  }
                  const _a3361 = _g3351;
                  for (let _i3362 = 0; _i3362 < _a3361.length; _i3362++) {
                    const v_a = _a3361[_i3362];
                    if (!(((v_H.includes(v_a)) || (b.value(v_a) === 1)))) continue;
                    const _a3363 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i3364 = 0; _i3364 < _a3363.length; _i3364++) {
                      const v_L = _a3363[_i3364];
                      _g3365.length = 0;
                      G3366: {
                        const _a3369 = sp.lineCells[v_L];
                        for (let _i3370 = 0; _i3370 < _a3369.length; _i3370++) {
                          const v_x = _a3369[_i3370];
                          if (!(((v_H.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                          _g3365.push(v_x);
                        }
                      }
                      L3371: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g3365);
                        const _h3372 = v_G.length;
                        const _h3401 = (_h3372 === 1);
                        let _c3404: boolean = (_h3372 === v_m);
                        if (_c3404) {
                          let _q3373 = true;
                          Q3374: {
                            _g3375.length = 0;
                            G3376: {
                              _g3389.length = 0;
                              G3390: {
                                const _a3395 = v_G;
                                for (let _i3396 = 0; _i3396 < _a3395.length; _i3396++) {
                                  const v_g = _a3395[_i3396];
                                  const _a3397 = sp.adj4[v_g];
                                  for (let _i3398 = 0; _i3398 < _a3397.length; _i3398++) {
                                    const v_z = _a3397[_i3398];
                                    if (!_g3389.includes(v_z)) _g3389.push(v_z);
                                  }
                                }
                              }
                              const _a3399 = _g3389;
                              for (let _i3400 = 0; _i3400 < _a3399.length; _i3400++) {
                                const v_y = _a3399[_i3400];
                                if (!((!(v_G.includes(v_y)) && (_h3401 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g3375.push(v_y);
                              }
                            }
                            const _a3402 = _g3375;
                            for (let _i3403 = 0; _i3403 < _a3402.length; _i3403++) {
                              const v_y = _a3402[_i3403];
                              if (!(((_t3149.includes(v_y)) || (b.value(v_y) === 2)))) {
                                _q3373 = false;
                                break Q3374;
                              }
                            }
                          }
                          _c3404 = _q3373;
                        }
                        let _c3435: boolean = _c3404;
                        if (_c3435) {
                          let _q3405 = false;
                          Q3406: {
                            _g3407.length = 0;
                            G3408: {
                              _g3421.length = 0;
                              G3422: {
                                const _a3427 = v_G;
                                for (let _i3428 = 0; _i3428 < _a3427.length; _i3428++) {
                                  const v_g = _a3427[_i3428];
                                  const _a3429 = sp.adj4[v_g];
                                  for (let _i3430 = 0; _i3430 < _a3429.length; _i3430++) {
                                    const v_z = _a3429[_i3430];
                                    if (!_g3421.includes(v_z)) _g3421.push(v_z);
                                  }
                                }
                              }
                              const _a3431 = _g3421;
                              for (let _i3432 = 0; _i3432 < _a3431.length; _i3432++) {
                                const v_y = _a3431[_i3432];
                                if (!((!(v_G.includes(v_y)) && (_h3401 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g3407.push(v_y);
                              }
                            }
                            const _a3433 = union(v_G, _g3407);
                            for (let _i3434 = 0; _i3434 < _a3433.length; _i3434++) {
                              const v_x = _a3433[_i3434];
                              if (((v_H.includes(v_x)) || (_t3149.includes(v_x)))) {
                                _q3405 = true;
                                break Q3406;
                              }
                            }
                          }
                          _c3435 = _q3405;
                        }
                        if (!(_c3435)) break L3371;
                        const _t3436 = (v_G[0] ?? -1);
                        if (!_g3266.includes(_t3436)) _g3266.push(_t3436);
                      }
                    }
                  }
                }
                L3437: {
                  const v_C = _g3266;
                  const _h3438 = v_C.length;
                  if (!((_h3438 > 0))) break L3437;
                  let _g3439 = 0;
                  G3440: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g3439 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g3441 = 0;
                  G3442: {
                    const _a3443 = sp.cells;
                    for (let _i3444 = 0; _i3444 < _a3443.length; _i3444++) {
                      const v_c = _a3443[_i3444];
                      const _h3484 = sp.rowOf[v_c];
                      const _h3492 = sp.colOf[v_c];
                      let _c3446: boolean = (b.value(v_c) === 1);
                      if (_c3446) {
                        const _t3445 = step(sp, v_c, 1);
                        _c3446 = !(((_t3445 !== -1) && (b.value(_t3445) === 1)));
                      }
                      let _c3448: boolean = _c3446;
                      if (_c3448) {
                        const _t3447 = step(sp, v_c, 3);
                        _c3448 = !(((_t3447 !== -1) && (b.value(_t3447) === 1)));
                      }
                      let _c3463: boolean = _c3448;
                      if (_c3463) {
                        const _t3449 = sp.rowOf[v_c];
                        _g3450.length = 0;
                        G3451: {
                          const _a3454 = sp.lineCells[_t3449];
                          for (let _i3455 = 0; _i3455 < _a3454.length; _i3455++) {
                            const v_x = _a3454[_i3455];
                            if (!((b.value(v_x) === 1))) continue;
                            _g3450.push(v_x);
                          }
                        }
                        const _t3456 = sp.colOf[v_c];
                        _g3457.length = 0;
                        G3458: {
                          const _a3461 = sp.lineCells[_t3456];
                          for (let _i3462 = 0; _i3462 < _a3461.length; _i3462++) {
                            const v_x = _a3461[_i3462];
                            if (!((b.value(v_x) === 1))) continue;
                            _g3457.push(v_x);
                          }
                        }
                        _c3463 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g3450), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g3457)).length === v_m);
                      }
                      let _c3500: boolean = _c3463;
                      if (_c3500) {
                        let _q3464 = true;
                        Q3465: {
                          const _t3466 = sp.rowOf[v_c];
                          _g3467.length = 0;
                          G3468: {
                            const _a3471 = sp.lineCells[_t3466];
                            for (let _i3472 = 0; _i3472 < _a3471.length; _i3472++) {
                              const v_x = _a3471[_i3472];
                              if (!((b.value(v_x) === 1))) continue;
                              _g3467.push(v_x);
                            }
                          }
                          const _t3473 = sp.colOf[v_c];
                          _g3474.length = 0;
                          G3475: {
                            const _a3478 = sp.lineCells[_t3473];
                            for (let _i3479 = 0; _i3479 < _a3478.length; _i3479++) {
                              const v_x = _a3478[_i3479];
                              if (!((b.value(v_x) === 1))) continue;
                              _g3474.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g3467), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g3474));
                          const _a3480 = v_G;
                          for (let _i3481 = 0; _i3481 < _a3480.length; _i3481++) {
                            const v_x = _a3480[_i3481];
                            const _a3482 = sp.adj4[v_x];
                            for (let _i3483 = 0; _i3483 < _a3482.length; _i3483++) {
                              const v_y = _a3482[_i3483];
                              let _c3491: boolean = !(v_G.includes(v_y));
                              if (_c3491) {
                                _g3485.length = 0;
                                G3486: {
                                  const _a3489 = sp.lineCells[_h3484];
                                  for (let _i3490 = 0; _i3490 < _a3489.length; _i3490++) {
                                    const v_x = _a3489[_i3490];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g3485.push(v_x);
                                  }
                                }
                                _c3491 = ((stretch(sp.lineCells[_h3484], v_c, _g3485).length === 1) || (sp.lineCells[_h3484].includes(v_y)));
                              }
                              let _c3499: boolean = _c3491;
                              if (_c3499) {
                                _g3493.length = 0;
                                G3494: {
                                  const _a3497 = sp.lineCells[_h3492];
                                  for (let _i3498 = 0; _i3498 < _a3497.length; _i3498++) {
                                    const v_x = _a3497[_i3498];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g3493.push(v_x);
                                  }
                                }
                                _c3499 = ((stretch(sp.lineCells[_h3492], v_c, _g3493).length === 1) || (sp.lineCells[_h3492].includes(v_y)));
                              }
                              if (!(_c3499)) continue;
                              if (!((b.value(v_y) === 2))) {
                                _q3464 = false;
                                break Q3465;
                              }
                            }
                          }
                        }
                        _c3500 = _q3464;
                      }
                      if (!(_c3500)) continue;
                      _g3441++;
                    }
                  }
                  if ((_h3438 > (_g3439 - _g3441))) {
                    _q3264 = true;
                    break Q3265;
                  }
                }
              }
            }
            _c3501 = _q3264;
          }
          if (!(_c3501)) break L3137;
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
  const _g4023: number[] = [];
  const _g4033: number[] = [];
  const _g4045: number[] = [];
  const _g4056: number[] = [];
  const _g4094: number[] = [];
  const _g4104: number[] = [];
  const _g4116: number[] = [];
  const _g4127: number[] = [];
  const _g4147: number[] = [];
  const _g4153: number[] = [];
  const _g4163: number[] = [];
  const _g4176: number[] = [];
  const _g4195: number[] = [];
  const _g4215: number[] = [];
  const _g4225: number[] = [];
  const _g4237: number[] = [];
  const _g4248: number[] = [];
  const _g4294: number[] = [];
  const _g4303: number[] = [];
  const _g4388: number[] = [];
  const _g4402: number[] = [];
  const _g4412: number[] = [];
  const _g4426: number[] = [];
  const _g4444: number[] = [];
  const _g4458: number[] = [];
  const _g4487: number[] = [];
  const _g4494: number[] = [];
  const _g4504: number[] = [];
  const _g4511: number[] = [];
  const _g4522: number[] = [];
  const _g4530: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  let _g4010 = -1;
  G4011: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t4012 = cl.fleet.length[v_k];
      if (_g4010 === -1 || _t4012 > _g4010) _g4010 = _t4012;
    }
  }
  const v_T = _g4010;
  const _a4013 = sp.lines;
  for (let _i4014 = 0; _i4014 < _a4013.length; _i4014++) {
    const v_L = _a4013[_i4014];
    const _h4015 = clueAt(cl.n, v_L);
    let _g4016 = -1;
    G4017: {
      const _a4018 = setOf(v_L);
      for (let _i4019 = 0; _i4019 < _a4018.length; _i4019++) {
        const v_K = _a4018[_i4019];
        const _h4020 = clueAt(cl.n, v_K);
        let _c4040: boolean = (_h4020 < 0);
        if (_c4040) {
          let _q4021 = true;
          Q4022: {
            _g4023.length = 0;
            G4024: {
              const _a4027 = sp.lines;
              for (let _i4028 = 0; _i4028 < _a4027.length; _i4028++) {
                const v_M = _a4027[_i4028];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g4023.push(v_M);
              }
            }
            const _a4029 = _g4023;
            for (let _i4030 = 0; _i4030 < _a4029.length; _i4030++) {
              const v_M = _a4029[_i4030];
              const _h4031 = clueAt(cl.n, v_M);
              let _c4039: boolean = (_h4031 >= 0);
              if (!_c4039) {
                const _t4032 = sp.lineCells[v_M];
                _g4033.length = 0;
                G4034: {
                  const _a4037 = _t4032;
                  for (let _i4038 = 0; _i4038 < _a4037.length; _i4038++) {
                    const v_c = _a4037[_i4038];
                    if (!(!(b.known(v_c)))) continue;
                    _g4033.push(v_c);
                  }
                }
                _c4039 = (_g4033.length === 0);
              }
              if (!(_c4039)) {
                _q4021 = false;
                break Q4022;
              }
            }
          }
          _c4040 = _q4021;
        }
        if (!(_c4040)) continue;
        let _g4041 = 0;
        G4042: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g4041 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g4043 = 0;
        G4044: {
          _g4045.length = 0;
          G4046: {
            const _a4049 = sp.lines;
            for (let _i4050 = 0; _i4050 < _a4049.length; _i4050++) {
              const v_M = _a4049[_i4050];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g4045.push(v_M);
            }
          }
          const _a4051 = _g4045;
          for (let _i4052 = 0; _i4052 < _a4051.length; _i4052++) {
            const v_M = _a4051[_i4052];
            const _h4053 = clueAt(cl.n, v_M);
            if (!((_h4053 >= 0))) continue;
            _g4043 += _h4053;
          }
        }
        let _g4054 = 0;
        G4055: {
          _g4056.length = 0;
          G4057: {
            const _a4060 = sp.lines;
            for (let _i4061 = 0; _i4061 < _a4060.length; _i4061++) {
              const v_M = _a4060[_i4061];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g4056.push(v_M);
            }
          }
          const _a4062 = _g4056;
          for (let _i4063 = 0; _i4063 < _a4062.length; _i4063++) {
            const v_M = _a4062[_i4063];
            const _h4064 = clueAt(cl.n, v_M);
            if (!((_h4064 < 0))) continue;
            const _t4065 = sp.lineCells[v_M];
            let _g4066 = 0;
            G4067: {
              const _a4068 = _t4065;
              for (let _i4069 = 0; _i4069 < _a4068.length; _i4069++) {
                const v_c = _a4068[_i4069];
                if (!((b.value(v_c) === 1))) continue;
                _g4066++;
              }
            }
            _g4054 += _g4066;
          }
        }
        const _t4070 = ((_g4041 - _g4043) - _g4054);
        if (_g4016 === -1 || _t4070 > _g4016) _g4016 = _t4070;
      }
    }
    L4071: {
      const v_v = ((_h4015 + _g4016) + 1);
      let _c4077: boolean = (v_v >= 0);
      if (_c4077) {
        const _t4072 = sp.lineCells[v_L];
        let _g4073 = 0;
        G4074: {
          const _a4075 = _t4072;
          for (let _i4076 = 0; _i4076 < _a4075.length; _i4076++) {
            const v_c = _a4075[_i4076];
            if (!((b.value(v_c) === 1))) continue;
            _g4073++;
          }
        }
        _c4077 = ((v_v - _g4073) === 1);
      }
      if (!(_c4077)) break L4071;
      const _a4078 = sp.lineCells[v_L];
      for (let _i4079 = 0; _i4079 < _a4078.length; _i4079++) {
        const v_c = _a4078[_i4079];
        if (!(!(b.known(v_c)))) continue;
        let _g4080 = -1;
        let _n4082 = 0;
        G4081: {
          const _a4083 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i4084 = 0; _i4084 < _a4083.length; _i4084++) {
            const v_M = _a4083[_i4084];
            if (!((v_M !== v_L))) continue;
            if (++_n4082 === 2) {
              _g4080 = -1;
              break G4081;
            }
            _g4080 = v_M;
          }
        }
        const v_K = _g4080;
        const _h4085 = clueAt(cl.n, v_K);
        let _g4086 = -1;
        G4087: {
          const _a4089 = setOf(v_K);
          for (let _i4090 = 0; _i4090 < _a4089.length; _i4090++) {
            const v_K_4088 = _a4089[_i4090];
            const _h4091 = clueAt(cl.n, v_K_4088);
            let _c4111: boolean = (_h4091 < 0);
            if (_c4111) {
              let _q4092 = true;
              Q4093: {
                _g4094.length = 0;
                G4095: {
                  const _a4098 = sp.lines;
                  for (let _i4099 = 0; _i4099 < _a4098.length; _i4099++) {
                    const v_M = _a4098[_i4099];
                    if (!(((v_M !== v_K_4088) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_4088][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_4088][1] ?? -1) % sp.w)))))) continue;
                    _g4094.push(v_M);
                  }
                }
                const _a4100 = _g4094;
                for (let _i4101 = 0; _i4101 < _a4100.length; _i4101++) {
                  const v_M = _a4100[_i4101];
                  const _h4102 = clueAt(cl.n, v_M);
                  let _c4110: boolean = (_h4102 >= 0);
                  if (!_c4110) {
                    const _t4103 = sp.lineCells[v_M];
                    _g4104.length = 0;
                    G4105: {
                      const _a4108 = _t4103;
                      for (let _i4109 = 0; _i4109 < _a4108.length; _i4109++) {
                        const v_c = _a4108[_i4109];
                        if (!(!(b.known(v_c)))) continue;
                        _g4104.push(v_c);
                      }
                    }
                    _c4110 = (_g4104.length === 0);
                  }
                  if (!(_c4110)) {
                    _q4092 = false;
                    break Q4093;
                  }
                }
              }
              _c4111 = _q4092;
            }
            if (!(_c4111)) continue;
            let _g4112 = 0;
            G4113: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g4112 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            let _g4114 = 0;
            G4115: {
              _g4116.length = 0;
              G4117: {
                const _a4120 = sp.lines;
                for (let _i4121 = 0; _i4121 < _a4120.length; _i4121++) {
                  const v_M = _a4120[_i4121];
                  if (!(((v_M !== v_K_4088) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_4088][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_4088][1] ?? -1) % sp.w)))))) continue;
                  _g4116.push(v_M);
                }
              }
              const _a4122 = _g4116;
              for (let _i4123 = 0; _i4123 < _a4122.length; _i4123++) {
                const v_M = _a4122[_i4123];
                const _h4124 = clueAt(cl.n, v_M);
                if (!((_h4124 >= 0))) continue;
                _g4114 += _h4124;
              }
            }
            let _g4125 = 0;
            G4126: {
              _g4127.length = 0;
              G4128: {
                const _a4131 = sp.lines;
                for (let _i4132 = 0; _i4132 < _a4131.length; _i4132++) {
                  const v_M = _a4131[_i4132];
                  if (!(((v_M !== v_K_4088) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_4088][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_4088][1] ?? -1) % sp.w)))))) continue;
                  _g4127.push(v_M);
                }
              }
              const _a4133 = _g4127;
              for (let _i4134 = 0; _i4134 < _a4133.length; _i4134++) {
                const v_M = _a4133[_i4134];
                const _h4135 = clueAt(cl.n, v_M);
                if (!((_h4135 < 0))) continue;
                const _t4136 = sp.lineCells[v_M];
                let _g4137 = 0;
                G4138: {
                  const _a4139 = _t4136;
                  for (let _i4140 = 0; _i4140 < _a4139.length; _i4140++) {
                    const v_c = _a4139[_i4140];
                    if (!((b.value(v_c) === 1))) continue;
                    _g4137++;
                  }
                }
                _g4125 += _g4137;
              }
            }
            const _t4141 = ((_g4112 - _g4114) - _g4125);
            if (_g4086 === -1 || _t4141 > _g4086) _g4086 = _t4141;
          }
        }
        const v_j = ((_h4085 + _g4086) + 1);
        const _h4171 = (v_j >= 0);
        const _t4142 = sp.lineCells[v_K];
        let _g4143 = 0;
        G4144: {
          const _a4145 = _t4142;
          for (let _i4146 = 0; _i4146 < _a4145.length; _i4146++) {
            const v_c = _a4145[_i4146];
            if (!((b.value(v_c) === 1))) continue;
            _g4143++;
          }
        }
        const v_u = (v_j - _g4143);
        const _h4172 = (v_u === 1);
        const _h4173 = (_h4171 && _h4172);
        _g4147.length = 0;
        G4148: {
          const _a4151 = sp.lineCells[v_L];
          for (let _i4152 = 0; _i4152 < _a4151.length; _i4152++) {
            const v_x = _a4151[_i4152];
            if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
            _g4147.push(v_x);
          }
        }
        _g4153.length = 0;
        G4154: {
          _g4163.length = 0;
          G4164: {
            const _a4167 = sp.lineCells[v_K];
            for (let _i4168 = 0; _i4168 < _a4167.length; _i4168++) {
              const v_x = _a4167[_i4168];
              if (!(((v_x !== v_c) && !(b.known(v_x))))) continue;
              _g4163.push(v_x);
            }
          }
          const _a4169 = _g4163;
          for (let _i4170 = 0; _i4170 < _a4169.length; _i4170++) {
            const v_x = _a4169[_i4170];
            if (!(_h4173)) continue;
            _g4153.push(v_x);
          }
        }
        L4174: {
          const v_W = union(_g4147, _g4153);
          const _t4175 = setOf(v_c);
          _g4176.length = 0;
          G4177: {
            const _a4182 = _t4175;
            for (let _i4183 = 0; _i4183 < _a4182.length; _i4183++) {
              const v_a = _a4182[_i4183];
              const _a4184 = sp.adj8[v_a];
              for (let _i4185 = 0; _i4185 < _a4184.length; _i4185++) {
                const v_d = _a4184[_i4185];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !(b.known(v_d))))) continue;
                if (!_g4176.includes(v_d)) _g4176.push(v_d);
              }
            }
          }
          const _t4186 = union(v_W, _g4176);
          let _q4187 = false;
          Q4188: {
            const _a4189 = _t4175;
            for (let _i4190 = 0; _i4190 < _a4189.length; _i4190++) {
              const v_a = _a4189[_i4190];
              const _a4191 = sp.adj8[v_a];
              for (let _i4192 = 0; _i4192 < _a4191.length; _i4192++) {
                const v_b = _a4191[_i4192];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t4175.includes(v_b)) || (b.value(v_b) === 1))) {
                  _q4187 = true;
                  break Q4188;
                }
              }
            }
          }
          let _c4273: boolean = _q4187;
          if (!_c4273) {
            let _q4193 = false;
            Q4194: {
              _g4195.length = 0;
              G4196: {
                const _a4201 = union(_t4175, _t4186);
                for (let _i4202 = 0; _i4202 < _a4201.length; _i4202++) {
                  const v_a = _a4201[_i4202];
                  const _a4203 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i4204 = 0; _i4204 < _a4203.length; _i4204++) {
                    const v_M = _a4203[_i4204];
                    if (!_g4195.includes(v_M)) _g4195.push(v_M);
                  }
                }
              }
              const _a4205 = _g4195;
              for (let _i4206 = 0; _i4206 < _a4205.length; _i4206++) {
                const v_L = _a4205[_i4206];
                const _h4207 = clueAt(cl.n, v_L);
                let _g4208 = -1;
                G4209: {
                  const _a4210 = setOf(v_L);
                  for (let _i4211 = 0; _i4211 < _a4210.length; _i4211++) {
                    const v_K = _a4210[_i4211];
                    const _h4212 = clueAt(cl.n, v_K);
                    let _c4232: boolean = (_h4212 < 0);
                    if (_c4232) {
                      let _q4213 = true;
                      Q4214: {
                        _g4215.length = 0;
                        G4216: {
                          const _a4219 = sp.lines;
                          for (let _i4220 = 0; _i4220 < _a4219.length; _i4220++) {
                            const v_M = _a4219[_i4220];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g4215.push(v_M);
                          }
                        }
                        const _a4221 = _g4215;
                        for (let _i4222 = 0; _i4222 < _a4221.length; _i4222++) {
                          const v_M = _a4221[_i4222];
                          const _h4223 = clueAt(cl.n, v_M);
                          let _c4231: boolean = (_h4223 >= 0);
                          if (!_c4231) {
                            const _t4224 = sp.lineCells[v_M];
                            _g4225.length = 0;
                            G4226: {
                              const _a4229 = _t4224;
                              for (let _i4230 = 0; _i4230 < _a4229.length; _i4230++) {
                                const v_c = _a4229[_i4230];
                                if (!(!(b.known(v_c)))) continue;
                                _g4225.push(v_c);
                              }
                            }
                            _c4231 = (_g4225.length === 0);
                          }
                          if (!(_c4231)) {
                            _q4213 = false;
                            break Q4214;
                          }
                        }
                      }
                      _c4232 = _q4213;
                    }
                    if (!(_c4232)) continue;
                    let _g4233 = 0;
                    G4234: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g4233 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g4235 = 0;
                    G4236: {
                      _g4237.length = 0;
                      G4238: {
                        const _a4241 = sp.lines;
                        for (let _i4242 = 0; _i4242 < _a4241.length; _i4242++) {
                          const v_M = _a4241[_i4242];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g4237.push(v_M);
                        }
                      }
                      const _a4243 = _g4237;
                      for (let _i4244 = 0; _i4244 < _a4243.length; _i4244++) {
                        const v_M = _a4243[_i4244];
                        const _h4245 = clueAt(cl.n, v_M);
                        if (!((_h4245 >= 0))) continue;
                        _g4235 += _h4245;
                      }
                    }
                    let _g4246 = 0;
                    G4247: {
                      _g4248.length = 0;
                      G4249: {
                        const _a4252 = sp.lines;
                        for (let _i4253 = 0; _i4253 < _a4252.length; _i4253++) {
                          const v_M = _a4252[_i4253];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g4248.push(v_M);
                        }
                      }
                      const _a4254 = _g4248;
                      for (let _i4255 = 0; _i4255 < _a4254.length; _i4255++) {
                        const v_M = _a4254[_i4255];
                        const _h4256 = clueAt(cl.n, v_M);
                        if (!((_h4256 < 0))) continue;
                        const _t4257 = sp.lineCells[v_M];
                        let _g4258 = 0;
                        G4259: {
                          const _a4260 = _t4257;
                          for (let _i4261 = 0; _i4261 < _a4260.length; _i4261++) {
                            const v_c = _a4260[_i4261];
                            if (!((b.value(v_c) === 1))) continue;
                            _g4258++;
                          }
                        }
                        _g4246 += _g4258;
                      }
                    }
                    const _t4262 = ((_g4233 - _g4235) - _g4246);
                    if (_g4208 === -1 || _t4262 > _g4208) _g4208 = _t4262;
                  }
                }
                L4263: {
                  const v_v = ((_h4207 + _g4208) + 1);
                  if (!((v_v >= 0))) break L4263;
                  let _g4264 = 0;
                  G4265: {
                    const _a4266 = sp.lineCells[v_L];
                    for (let _i4267 = 0; _i4267 < _a4266.length; _i4267++) {
                      const v_x = _a4266[_i4267];
                      if (!(((_t4175.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g4264++;
                    }
                  }
                  let _c4272: boolean = (_g4264 > v_v);
                  if (!_c4272) {
                    let _g4268 = 0;
                    G4269: {
                      const _a4270 = sp.lineCells[v_L];
                      for (let _i4271 = 0; _i4271 < _a4270.length; _i4271++) {
                        const v_x = _a4270[_i4271];
                        if (!((!(_t4186.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                        _g4268++;
                      }
                    }
                    _c4272 = (_g4268 < v_v);
                  }
                  if (_c4272) {
                    _q4193 = true;
                    break Q4194;
                  }
                }
              }
            }
            _c4273 = _q4193;
          }
          let _c4280: boolean = _c4273;
          if (!_c4280) {
            let _g4274 = 0;
            G4275: {
              const _a4276 = sp.cells;
              for (let _i4277 = 0; _i4277 < _a4276.length; _i4277++) {
                const v_x = _a4276[_i4277];
                if (!(((_t4175.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                _g4274++;
              }
            }
            let _g4278 = 0;
            G4279: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g4278 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c4280 = (_g4274 > _g4278);
          }
          let _c4287: boolean = _c4280;
          if (!_c4287) {
            let _g4281 = 0;
            G4282: {
              const _a4283 = sp.cells;
              for (let _i4284 = 0; _i4284 < _a4283.length; _i4284++) {
                const v_x = _a4283[_i4284];
                if (!((!(_t4186.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                _g4281++;
              }
            }
            let _g4285 = 0;
            G4286: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g4285 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c4287 = (_g4281 < _g4285);
          }
          let _c4300: boolean = _c4287;
          if (!_c4300) {
            let _q4288 = false;
            Q4289: {
              const _a4290 = _t4175;
              for (let _i4291 = 0; _i4291 < _a4290.length; _i4291++) {
                const v_a = _a4290[_i4291];
                const _a4292 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i4293 = 0; _i4293 < _a4292.length; _i4293++) {
                  const v_L = _a4292[_i4293];
                  _g4294.length = 0;
                  G4295: {
                    const _a4298 = sp.lineCells[v_L];
                    for (let _i4299 = 0; _i4299 < _a4298.length; _i4299++) {
                      const v_x = _a4298[_i4299];
                      if (!(((_t4175.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g4294.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g4294).length > v_T)) {
                    _q4288 = true;
                    break Q4289;
                  }
                }
              }
            }
            _c4300 = _q4288;
          }
          let _c4538: boolean = _c4300;
          if (!_c4538) {
            let _q4301 = false;
            Q4302: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g4303.length = 0;
                G4304: {
                  _g4388.length = 0;
                  G4389: {
                    const _a4394 = union(_t4175, _t4186);
                    for (let _i4395 = 0; _i4395 < _a4394.length; _i4395++) {
                      const v_x = _a4394[_i4395];
                      const _a4396 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i4397 = 0; _i4397 < _a4396.length; _i4397++) {
                        const v_y = _a4396[_i4397];
                        if (!_g4388.includes(v_y)) _g4388.push(v_y);
                      }
                    }
                  }
                  const _a4398 = _g4388;
                  for (let _i4399 = 0; _i4399 < _a4398.length; _i4399++) {
                    const v_a = _a4398[_i4399];
                    if (!(((_t4175.includes(v_a)) || (b.value(v_a) === 1)))) continue;
                    const _a4400 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i4401 = 0; _i4401 < _a4400.length; _i4401++) {
                      const v_L = _a4400[_i4401];
                      _g4402.length = 0;
                      G4403: {
                        const _a4406 = sp.lineCells[v_L];
                        for (let _i4407 = 0; _i4407 < _a4406.length; _i4407++) {
                          const v_x = _a4406[_i4407];
                          if (!(((_t4175.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                          _g4402.push(v_x);
                        }
                      }
                      L4408: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g4402);
                        const _h4409 = v_G.length;
                        const _h4438 = (_h4409 === 1);
                        let _c4441: boolean = (_h4409 === v_m);
                        if (_c4441) {
                          let _q4410 = true;
                          Q4411: {
                            _g4412.length = 0;
                            G4413: {
                              _g4426.length = 0;
                              G4427: {
                                const _a4432 = v_G;
                                for (let _i4433 = 0; _i4433 < _a4432.length; _i4433++) {
                                  const v_g = _a4432[_i4433];
                                  const _a4434 = sp.adj4[v_g];
                                  for (let _i4435 = 0; _i4435 < _a4434.length; _i4435++) {
                                    const v_z = _a4434[_i4435];
                                    if (!_g4426.includes(v_z)) _g4426.push(v_z);
                                  }
                                }
                              }
                              const _a4436 = _g4426;
                              for (let _i4437 = 0; _i4437 < _a4436.length; _i4437++) {
                                const v_y = _a4436[_i4437];
                                if (!((!(v_G.includes(v_y)) && (_h4438 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g4412.push(v_y);
                              }
                            }
                            const _a4439 = _g4412;
                            for (let _i4440 = 0; _i4440 < _a4439.length; _i4440++) {
                              const v_y = _a4439[_i4440];
                              if (!(((_t4186.includes(v_y)) || (b.value(v_y) === 2)))) {
                                _q4410 = false;
                                break Q4411;
                              }
                            }
                          }
                          _c4441 = _q4410;
                        }
                        let _c4472: boolean = _c4441;
                        if (_c4472) {
                          let _q4442 = false;
                          Q4443: {
                            _g4444.length = 0;
                            G4445: {
                              _g4458.length = 0;
                              G4459: {
                                const _a4464 = v_G;
                                for (let _i4465 = 0; _i4465 < _a4464.length; _i4465++) {
                                  const v_g = _a4464[_i4465];
                                  const _a4466 = sp.adj4[v_g];
                                  for (let _i4467 = 0; _i4467 < _a4466.length; _i4467++) {
                                    const v_z = _a4466[_i4467];
                                    if (!_g4458.includes(v_z)) _g4458.push(v_z);
                                  }
                                }
                              }
                              const _a4468 = _g4458;
                              for (let _i4469 = 0; _i4469 < _a4468.length; _i4469++) {
                                const v_y = _a4468[_i4469];
                                if (!((!(v_G.includes(v_y)) && (_h4438 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g4444.push(v_y);
                              }
                            }
                            const _a4470 = union(v_G, _g4444);
                            for (let _i4471 = 0; _i4471 < _a4470.length; _i4471++) {
                              const v_x = _a4470[_i4471];
                              if (((_t4175.includes(v_x)) || (_t4186.includes(v_x)))) {
                                _q4442 = true;
                                break Q4443;
                              }
                            }
                          }
                          _c4472 = _q4442;
                        }
                        if (!(_c4472)) break L4408;
                        const _t4473 = (v_G[0] ?? -1);
                        if (!_g4303.includes(_t4473)) _g4303.push(_t4473);
                      }
                    }
                  }
                }
                L4474: {
                  const v_C = _g4303;
                  const _h4475 = v_C.length;
                  if (!((_h4475 > 0))) break L4474;
                  let _g4476 = 0;
                  G4477: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g4476 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g4478 = 0;
                  G4479: {
                    const _a4480 = sp.cells;
                    for (let _i4481 = 0; _i4481 < _a4480.length; _i4481++) {
                      const v_c = _a4480[_i4481];
                      const _h4521 = sp.rowOf[v_c];
                      const _h4529 = sp.colOf[v_c];
                      let _c4483: boolean = (b.value(v_c) === 1);
                      if (_c4483) {
                        const _t4482 = step(sp, v_c, 1);
                        _c4483 = !(((_t4482 !== -1) && (b.value(_t4482) === 1)));
                      }
                      let _c4485: boolean = _c4483;
                      if (_c4485) {
                        const _t4484 = step(sp, v_c, 3);
                        _c4485 = !(((_t4484 !== -1) && (b.value(_t4484) === 1)));
                      }
                      let _c4500: boolean = _c4485;
                      if (_c4500) {
                        const _t4486 = sp.rowOf[v_c];
                        _g4487.length = 0;
                        G4488: {
                          const _a4491 = sp.lineCells[_t4486];
                          for (let _i4492 = 0; _i4492 < _a4491.length; _i4492++) {
                            const v_x = _a4491[_i4492];
                            if (!((b.value(v_x) === 1))) continue;
                            _g4487.push(v_x);
                          }
                        }
                        const _t4493 = sp.colOf[v_c];
                        _g4494.length = 0;
                        G4495: {
                          const _a4498 = sp.lineCells[_t4493];
                          for (let _i4499 = 0; _i4499 < _a4498.length; _i4499++) {
                            const v_x = _a4498[_i4499];
                            if (!((b.value(v_x) === 1))) continue;
                            _g4494.push(v_x);
                          }
                        }
                        _c4500 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g4487), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g4494)).length === v_m);
                      }
                      let _c4537: boolean = _c4500;
                      if (_c4537) {
                        let _q4501 = true;
                        Q4502: {
                          const _t4503 = sp.rowOf[v_c];
                          _g4504.length = 0;
                          G4505: {
                            const _a4508 = sp.lineCells[_t4503];
                            for (let _i4509 = 0; _i4509 < _a4508.length; _i4509++) {
                              const v_x = _a4508[_i4509];
                              if (!((b.value(v_x) === 1))) continue;
                              _g4504.push(v_x);
                            }
                          }
                          const _t4510 = sp.colOf[v_c];
                          _g4511.length = 0;
                          G4512: {
                            const _a4515 = sp.lineCells[_t4510];
                            for (let _i4516 = 0; _i4516 < _a4515.length; _i4516++) {
                              const v_x = _a4515[_i4516];
                              if (!((b.value(v_x) === 1))) continue;
                              _g4511.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g4504), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g4511));
                          const _a4517 = v_G;
                          for (let _i4518 = 0; _i4518 < _a4517.length; _i4518++) {
                            const v_x = _a4517[_i4518];
                            const _a4519 = sp.adj4[v_x];
                            for (let _i4520 = 0; _i4520 < _a4519.length; _i4520++) {
                              const v_y = _a4519[_i4520];
                              let _c4528: boolean = !(v_G.includes(v_y));
                              if (_c4528) {
                                _g4522.length = 0;
                                G4523: {
                                  const _a4526 = sp.lineCells[_h4521];
                                  for (let _i4527 = 0; _i4527 < _a4526.length; _i4527++) {
                                    const v_x = _a4526[_i4527];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g4522.push(v_x);
                                  }
                                }
                                _c4528 = ((stretch(sp.lineCells[_h4521], v_c, _g4522).length === 1) || (sp.lineCells[_h4521].includes(v_y)));
                              }
                              let _c4536: boolean = _c4528;
                              if (_c4536) {
                                _g4530.length = 0;
                                G4531: {
                                  const _a4534 = sp.lineCells[_h4529];
                                  for (let _i4535 = 0; _i4535 < _a4534.length; _i4535++) {
                                    const v_x = _a4534[_i4535];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g4530.push(v_x);
                                  }
                                }
                                _c4536 = ((stretch(sp.lineCells[_h4529], v_c, _g4530).length === 1) || (sp.lineCells[_h4529].includes(v_y)));
                              }
                              if (!(_c4536)) continue;
                              if (!((b.value(v_y) === 2))) {
                                _q4501 = false;
                                break Q4502;
                              }
                            }
                          }
                        }
                        _c4537 = _q4501;
                      }
                      if (!(_c4537)) continue;
                      _g4478++;
                    }
                  }
                  if ((_h4475 > (_g4476 - _g4478))) {
                    _q4301 = true;
                    break Q4302;
                  }
                }
              }
            }
            _c4538 = _q4301;
          }
          if (!(_c4538)) break L4174;
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
  const _g4928: number[] = [];
  const _g4941: number[] = [];
  const _g4947: number[] = [];
  const _g4966: number[] = [];
  const _g4986: number[] = [];
  const _g4996: number[] = [];
  const _g5008: number[] = [];
  const _g5019: number[] = [];
  const _g5065: number[] = [];
  const _g5074: number[] = [];
  const _g5159: number[] = [];
  const _g5173: number[] = [];
  const _g5183: number[] = [];
  const _g5197: number[] = [];
  const _g5215: number[] = [];
  const _g5229: number[] = [];
  const _g5258: number[] = [];
  const _g5265: number[] = [];
  const _g5275: number[] = [];
  const _g5282: number[] = [];
  const _g5293: number[] = [];
  const _g5301: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  let _g4920 = -1;
  G4921: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t4922 = cl.fleet.length[v_k];
      if (_g4920 === -1 || _t4922 > _g4920) _g4920 = _t4922;
    }
  }
  const v_T = _g4920;
  const _a4923 = cluesValued(cl.seg, 6);
  for (let _i4924 = 0; _i4924 < _a4923.length; _i4924++) {
    const v_c = _a4923[_i4924];
    const _h4925 = clueAt(cl.seg, v_c);
    if (!((_h4925 === 6))) continue;
    const _a4926 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i4927 = 0; _i4927 < _a4926.length; _i4927++) {
      const v_L = _a4926[_i4927];
      _g4928.length = 0;
      G4929: {
        const _a4932 = sp.adj4[v_c];
        for (let _i4933 = 0; _i4933 < _a4932.length; _i4933++) {
          const v_x = _a4932[_i4933];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g4928.push(v_x);
        }
      }
      L4934: {
        const v_S = _g4928;
        const _h4935 = v_S.length;
        let _c4940: boolean = (_h4935 === 2);
        if (_c4940) {
          let _q4936 = false;
          Q4937: {
            const _a4938 = v_S;
            for (let _i4939 = 0; _i4939 < _a4938.length; _i4939++) {
              const v_x = _a4938[_i4939];
              if (!(b.known(v_x))) {
                _q4936 = true;
                break Q4937;
              }
            }
          }
          _c4940 = _q4936;
        }
        let _c5310: boolean = _c4940;
        if (_c5310) {
          _g4941.length = 0;
          G4942: {
            const _a4945 = v_S;
            for (let _i4946 = 0; _i4946 < _a4945.length; _i4946++) {
              const v_x = _a4945[_i4946];
              if (!((v_x !== v_x))) continue;
              _g4941.push(v_x);
            }
          }
          _g4947.length = 0;
          G4948: {
            const _a4953 = v_S;
            for (let _i4954 = 0; _i4954 < _a4953.length; _i4954++) {
              const v_a = _a4953[_i4954];
              const _a4955 = sp.adj8[v_a];
              for (let _i4956 = 0; _i4956 < _a4955.length; _i4956++) {
                const v_d = _a4955[_i4956];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !(b.known(v_d))))) continue;
                if (!_g4947.includes(v_d)) _g4947.push(v_d);
              }
            }
          }
          const _t4957 = union(_g4941, _g4947);
          let _q4958 = false;
          Q4959: {
            const _a4960 = v_S;
            for (let _i4961 = 0; _i4961 < _a4960.length; _i4961++) {
              const v_a = _a4960[_i4961];
              const _a4962 = sp.adj8[v_a];
              for (let _i4963 = 0; _i4963 < _a4962.length; _i4963++) {
                const v_b = _a4962[_i4963];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || (b.value(v_b) === 1))) {
                  _q4958 = true;
                  break Q4959;
                }
              }
            }
          }
          let _c5044: boolean = _q4958;
          if (!_c5044) {
            let _q4964 = false;
            Q4965: {
              _g4966.length = 0;
              G4967: {
                const _a4972 = union(v_S, _t4957);
                for (let _i4973 = 0; _i4973 < _a4972.length; _i4973++) {
                  const v_a = _a4972[_i4973];
                  const _a4974 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i4975 = 0; _i4975 < _a4974.length; _i4975++) {
                    const v_M = _a4974[_i4975];
                    if (!_g4966.includes(v_M)) _g4966.push(v_M);
                  }
                }
              }
              const _a4976 = _g4966;
              for (let _i4977 = 0; _i4977 < _a4976.length; _i4977++) {
                const v_L = _a4976[_i4977];
                const _h4978 = clueAt(cl.n, v_L);
                let _g4979 = -1;
                G4980: {
                  const _a4981 = setOf(v_L);
                  for (let _i4982 = 0; _i4982 < _a4981.length; _i4982++) {
                    const v_K = _a4981[_i4982];
                    const _h4983 = clueAt(cl.n, v_K);
                    let _c5003: boolean = (_h4983 < 0);
                    if (_c5003) {
                      let _q4984 = true;
                      Q4985: {
                        _g4986.length = 0;
                        G4987: {
                          const _a4990 = sp.lines;
                          for (let _i4991 = 0; _i4991 < _a4990.length; _i4991++) {
                            const v_M = _a4990[_i4991];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g4986.push(v_M);
                          }
                        }
                        const _a4992 = _g4986;
                        for (let _i4993 = 0; _i4993 < _a4992.length; _i4993++) {
                          const v_M = _a4992[_i4993];
                          const _h4994 = clueAt(cl.n, v_M);
                          let _c5002: boolean = (_h4994 >= 0);
                          if (!_c5002) {
                            const _t4995 = sp.lineCells[v_M];
                            _g4996.length = 0;
                            G4997: {
                              const _a5000 = _t4995;
                              for (let _i5001 = 0; _i5001 < _a5000.length; _i5001++) {
                                const v_c = _a5000[_i5001];
                                if (!(!(b.known(v_c)))) continue;
                                _g4996.push(v_c);
                              }
                            }
                            _c5002 = (_g4996.length === 0);
                          }
                          if (!(_c5002)) {
                            _q4984 = false;
                            break Q4985;
                          }
                        }
                      }
                      _c5003 = _q4984;
                    }
                    if (!(_c5003)) continue;
                    let _g5004 = 0;
                    G5005: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g5004 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g5006 = 0;
                    G5007: {
                      _g5008.length = 0;
                      G5009: {
                        const _a5012 = sp.lines;
                        for (let _i5013 = 0; _i5013 < _a5012.length; _i5013++) {
                          const v_M = _a5012[_i5013];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g5008.push(v_M);
                        }
                      }
                      const _a5014 = _g5008;
                      for (let _i5015 = 0; _i5015 < _a5014.length; _i5015++) {
                        const v_M = _a5014[_i5015];
                        const _h5016 = clueAt(cl.n, v_M);
                        if (!((_h5016 >= 0))) continue;
                        _g5006 += _h5016;
                      }
                    }
                    let _g5017 = 0;
                    G5018: {
                      _g5019.length = 0;
                      G5020: {
                        const _a5023 = sp.lines;
                        for (let _i5024 = 0; _i5024 < _a5023.length; _i5024++) {
                          const v_M = _a5023[_i5024];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g5019.push(v_M);
                        }
                      }
                      const _a5025 = _g5019;
                      for (let _i5026 = 0; _i5026 < _a5025.length; _i5026++) {
                        const v_M = _a5025[_i5026];
                        const _h5027 = clueAt(cl.n, v_M);
                        if (!((_h5027 < 0))) continue;
                        const _t5028 = sp.lineCells[v_M];
                        let _g5029 = 0;
                        G5030: {
                          const _a5031 = _t5028;
                          for (let _i5032 = 0; _i5032 < _a5031.length; _i5032++) {
                            const v_c = _a5031[_i5032];
                            if (!((b.value(v_c) === 1))) continue;
                            _g5029++;
                          }
                        }
                        _g5017 += _g5029;
                      }
                    }
                    const _t5033 = ((_g5004 - _g5006) - _g5017);
                    if (_g4979 === -1 || _t5033 > _g4979) _g4979 = _t5033;
                  }
                }
                L5034: {
                  const v_v = ((_h4978 + _g4979) + 1);
                  if (!((v_v >= 0))) break L5034;
                  let _g5035 = 0;
                  G5036: {
                    const _a5037 = sp.lineCells[v_L];
                    for (let _i5038 = 0; _i5038 < _a5037.length; _i5038++) {
                      const v_x = _a5037[_i5038];
                      if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g5035++;
                    }
                  }
                  let _c5043: boolean = (_g5035 > v_v);
                  if (!_c5043) {
                    let _g5039 = 0;
                    G5040: {
                      const _a5041 = sp.lineCells[v_L];
                      for (let _i5042 = 0; _i5042 < _a5041.length; _i5042++) {
                        const v_x = _a5041[_i5042];
                        if (!((!(_t4957.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                        _g5039++;
                      }
                    }
                    _c5043 = (_g5039 < v_v);
                  }
                  if (_c5043) {
                    _q4964 = true;
                    break Q4965;
                  }
                }
              }
            }
            _c5044 = _q4964;
          }
          let _c5051: boolean = _c5044;
          if (!_c5051) {
            let _g5045 = 0;
            G5046: {
              const _a5047 = sp.cells;
              for (let _i5048 = 0; _i5048 < _a5047.length; _i5048++) {
                const v_x = _a5047[_i5048];
                if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                _g5045++;
              }
            }
            let _g5049 = 0;
            G5050: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g5049 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c5051 = (_g5045 > _g5049);
          }
          let _c5058: boolean = _c5051;
          if (!_c5058) {
            let _g5052 = 0;
            G5053: {
              const _a5054 = sp.cells;
              for (let _i5055 = 0; _i5055 < _a5054.length; _i5055++) {
                const v_x = _a5054[_i5055];
                if (!((!(_t4957.includes(v_x)) && (b.value(v_x) !== 2)))) continue;
                _g5052++;
              }
            }
            let _g5056 = 0;
            G5057: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g5056 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c5058 = (_g5052 < _g5056);
          }
          let _c5071: boolean = _c5058;
          if (!_c5071) {
            let _q5059 = false;
            Q5060: {
              const _a5061 = v_S;
              for (let _i5062 = 0; _i5062 < _a5061.length; _i5062++) {
                const v_a = _a5061[_i5062];
                const _a5063 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i5064 = 0; _i5064 < _a5063.length; _i5064++) {
                  const v_L = _a5063[_i5064];
                  _g5065.length = 0;
                  G5066: {
                    const _a5069 = sp.lineCells[v_L];
                    for (let _i5070 = 0; _i5070 < _a5069.length; _i5070++) {
                      const v_x = _a5069[_i5070];
                      if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                      _g5065.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g5065).length > v_T)) {
                    _q5059 = true;
                    break Q5060;
                  }
                }
              }
            }
            _c5071 = _q5059;
          }
          let _c5309: boolean = _c5071;
          if (!_c5309) {
            let _q5072 = false;
            Q5073: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g5074.length = 0;
                G5075: {
                  _g5159.length = 0;
                  G5160: {
                    const _a5165 = union(v_S, _t4957);
                    for (let _i5166 = 0; _i5166 < _a5165.length; _i5166++) {
                      const v_x = _a5165[_i5166];
                      const _a5167 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i5168 = 0; _i5168 < _a5167.length; _i5168++) {
                        const v_y = _a5167[_i5168];
                        if (!_g5159.includes(v_y)) _g5159.push(v_y);
                      }
                    }
                  }
                  const _a5169 = _g5159;
                  for (let _i5170 = 0; _i5170 < _a5169.length; _i5170++) {
                    const v_a = _a5169[_i5170];
                    if (!(((v_S.includes(v_a)) || (b.value(v_a) === 1)))) continue;
                    const _a5171 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i5172 = 0; _i5172 < _a5171.length; _i5172++) {
                      const v_L = _a5171[_i5172];
                      _g5173.length = 0;
                      G5174: {
                        const _a5177 = sp.lineCells[v_L];
                        for (let _i5178 = 0; _i5178 < _a5177.length; _i5178++) {
                          const v_x = _a5177[_i5178];
                          if (!(((v_S.includes(v_x)) || (b.value(v_x) === 1)))) continue;
                          _g5173.push(v_x);
                        }
                      }
                      L5179: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g5173);
                        const _h5180 = v_G.length;
                        const _h5209 = (_h5180 === 1);
                        let _c5212: boolean = (_h5180 === v_m);
                        if (_c5212) {
                          let _q5181 = true;
                          Q5182: {
                            _g5183.length = 0;
                            G5184: {
                              _g5197.length = 0;
                              G5198: {
                                const _a5203 = v_G;
                                for (let _i5204 = 0; _i5204 < _a5203.length; _i5204++) {
                                  const v_g = _a5203[_i5204];
                                  const _a5205 = sp.adj4[v_g];
                                  for (let _i5206 = 0; _i5206 < _a5205.length; _i5206++) {
                                    const v_z = _a5205[_i5206];
                                    if (!_g5197.includes(v_z)) _g5197.push(v_z);
                                  }
                                }
                              }
                              const _a5207 = _g5197;
                              for (let _i5208 = 0; _i5208 < _a5207.length; _i5208++) {
                                const v_y = _a5207[_i5208];
                                if (!((!(v_G.includes(v_y)) && (_h5209 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g5183.push(v_y);
                              }
                            }
                            const _a5210 = _g5183;
                            for (let _i5211 = 0; _i5211 < _a5210.length; _i5211++) {
                              const v_y = _a5210[_i5211];
                              if (!(((_t4957.includes(v_y)) || (b.value(v_y) === 2)))) {
                                _q5181 = false;
                                break Q5182;
                              }
                            }
                          }
                          _c5212 = _q5181;
                        }
                        let _c5243: boolean = _c5212;
                        if (_c5243) {
                          let _q5213 = false;
                          Q5214: {
                            _g5215.length = 0;
                            G5216: {
                              _g5229.length = 0;
                              G5230: {
                                const _a5235 = v_G;
                                for (let _i5236 = 0; _i5236 < _a5235.length; _i5236++) {
                                  const v_g = _a5235[_i5236];
                                  const _a5237 = sp.adj4[v_g];
                                  for (let _i5238 = 0; _i5238 < _a5237.length; _i5238++) {
                                    const v_z = _a5237[_i5238];
                                    if (!_g5229.includes(v_z)) _g5229.push(v_z);
                                  }
                                }
                              }
                              const _a5239 = _g5229;
                              for (let _i5240 = 0; _i5240 < _a5239.length; _i5240++) {
                                const v_y = _a5239[_i5240];
                                if (!((!(v_G.includes(v_y)) && (_h5209 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g5215.push(v_y);
                              }
                            }
                            const _a5241 = union(v_G, _g5215);
                            for (let _i5242 = 0; _i5242 < _a5241.length; _i5242++) {
                              const v_x = _a5241[_i5242];
                              if (((v_S.includes(v_x)) || (_t4957.includes(v_x)))) {
                                _q5213 = true;
                                break Q5214;
                              }
                            }
                          }
                          _c5243 = _q5213;
                        }
                        if (!(_c5243)) break L5179;
                        const _t5244 = (v_G[0] ?? -1);
                        if (!_g5074.includes(_t5244)) _g5074.push(_t5244);
                      }
                    }
                  }
                }
                L5245: {
                  const v_C = _g5074;
                  const _h5246 = v_C.length;
                  if (!((_h5246 > 0))) break L5245;
                  let _g5247 = 0;
                  G5248: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g5247 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g5249 = 0;
                  G5250: {
                    const _a5251 = sp.cells;
                    for (let _i5252 = 0; _i5252 < _a5251.length; _i5252++) {
                      const v_c = _a5251[_i5252];
                      const _h5292 = sp.rowOf[v_c];
                      const _h5300 = sp.colOf[v_c];
                      let _c5254: boolean = (b.value(v_c) === 1);
                      if (_c5254) {
                        const _t5253 = step(sp, v_c, 1);
                        _c5254 = !(((_t5253 !== -1) && (b.value(_t5253) === 1)));
                      }
                      let _c5256: boolean = _c5254;
                      if (_c5256) {
                        const _t5255 = step(sp, v_c, 3);
                        _c5256 = !(((_t5255 !== -1) && (b.value(_t5255) === 1)));
                      }
                      let _c5271: boolean = _c5256;
                      if (_c5271) {
                        const _t5257 = sp.rowOf[v_c];
                        _g5258.length = 0;
                        G5259: {
                          const _a5262 = sp.lineCells[_t5257];
                          for (let _i5263 = 0; _i5263 < _a5262.length; _i5263++) {
                            const v_x = _a5262[_i5263];
                            if (!((b.value(v_x) === 1))) continue;
                            _g5258.push(v_x);
                          }
                        }
                        const _t5264 = sp.colOf[v_c];
                        _g5265.length = 0;
                        G5266: {
                          const _a5269 = sp.lineCells[_t5264];
                          for (let _i5270 = 0; _i5270 < _a5269.length; _i5270++) {
                            const v_x = _a5269[_i5270];
                            if (!((b.value(v_x) === 1))) continue;
                            _g5265.push(v_x);
                          }
                        }
                        _c5271 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5258), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5265)).length === v_m);
                      }
                      let _c5308: boolean = _c5271;
                      if (_c5308) {
                        let _q5272 = true;
                        Q5273: {
                          const _t5274 = sp.rowOf[v_c];
                          _g5275.length = 0;
                          G5276: {
                            const _a5279 = sp.lineCells[_t5274];
                            for (let _i5280 = 0; _i5280 < _a5279.length; _i5280++) {
                              const v_x = _a5279[_i5280];
                              if (!((b.value(v_x) === 1))) continue;
                              _g5275.push(v_x);
                            }
                          }
                          const _t5281 = sp.colOf[v_c];
                          _g5282.length = 0;
                          G5283: {
                            const _a5286 = sp.lineCells[_t5281];
                            for (let _i5287 = 0; _i5287 < _a5286.length; _i5287++) {
                              const v_x = _a5286[_i5287];
                              if (!((b.value(v_x) === 1))) continue;
                              _g5282.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5275), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5282));
                          const _a5288 = v_G;
                          for (let _i5289 = 0; _i5289 < _a5288.length; _i5289++) {
                            const v_x = _a5288[_i5289];
                            const _a5290 = sp.adj4[v_x];
                            for (let _i5291 = 0; _i5291 < _a5290.length; _i5291++) {
                              const v_y = _a5290[_i5291];
                              let _c5299: boolean = !(v_G.includes(v_y));
                              if (_c5299) {
                                _g5293.length = 0;
                                G5294: {
                                  const _a5297 = sp.lineCells[_h5292];
                                  for (let _i5298 = 0; _i5298 < _a5297.length; _i5298++) {
                                    const v_x = _a5297[_i5298];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g5293.push(v_x);
                                  }
                                }
                                _c5299 = ((stretch(sp.lineCells[_h5292], v_c, _g5293).length === 1) || (sp.lineCells[_h5292].includes(v_y)));
                              }
                              let _c5307: boolean = _c5299;
                              if (_c5307) {
                                _g5301.length = 0;
                                G5302: {
                                  const _a5305 = sp.lineCells[_h5300];
                                  for (let _i5306 = 0; _i5306 < _a5305.length; _i5306++) {
                                    const v_x = _a5305[_i5306];
                                    if (!((b.value(v_x) === 1))) continue;
                                    _g5301.push(v_x);
                                  }
                                }
                                _c5307 = ((stretch(sp.lineCells[_h5300], v_c, _g5301).length === 1) || (sp.lineCells[_h5300].includes(v_y)));
                              }
                              if (!(_c5307)) continue;
                              if (!((b.value(v_y) === 2))) {
                                _q5272 = false;
                                break Q5273;
                              }
                            }
                          }
                        }
                        _c5308 = _q5272;
                      }
                      if (!(_c5308)) continue;
                      _g5249++;
                    }
                  }
                  if ((_h5246 > (_g5247 - _g5249))) {
                    _q5072 = true;
                    break Q5073;
                  }
                }
              }
            }
            _c5309 = _q5072;
          }
          _c5310 = _c5309;
        }
        if (!(_c5310)) break L4934;
        facts.length = 0;
        changed = false;
        let _q5311 = true;
        Q5312: {
          const _a5313 = v_S;
          for (let _i5314 = 0; _i5314 < _a5313.length; _i5314++) {
            const v_x = _a5313[_i5314];
            if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q5311 = false;
              break Q5312;
            }
          }
        }
        if (!(_q5311)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ T: v_T, c: v_c, L: v_L, S: v_S }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
