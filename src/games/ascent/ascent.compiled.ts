// Compiled by `npm run describe` from src/games/ascent/ascent.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, cellsValued, clueAt, cluesValued, keptStore, type Kept } from "../../engine/describe-runtime.ts";

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
  const _k361 = nbrKept.board(cl);
  const _h397 = (sp.h - 1);
  const _h398 = (sp.w - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;
  }
  let _q354 = true;
  Q355: {
    const _a356 = sp.cells;
    for (let _i357 = 0; _i357 < _a356.length; _i357++) {
      const v_c = _a356[_i357];
      const _h358 = (g[v_c] || -1);
      if (!((_h358 < cl.top))) continue;
      const _h365 = (_h358 + 1);
      let _q359 = false;
      Q360: {
        const _a362 = (_k361[v_c] ?? nbr(sp, cl, v_c));
        for (let _i363 = 0; _i363 < _a362.length; _i363++) {
          const v_p = _a362[_i363];
          const _h364 = (g[v_p] || -1);
          if ((_h364 === _h365)) {
            _q359 = true;
            break Q360;
          }
        }
      }
      if (!(_q359)) {
        _q354 = false;
        break Q355;
      }
    }
  }
  if (!(_q354)) return false;
  let _q366 = true;
  Q367: {
    const _a368 = sp.cells;
    for (let _i369 = 0; _i369 < _a368.length; _i369++) {
      const v_c = _a368[_i369];
      const _h370 = (g[v_c] || -1);
      if (!((_h370 <= cl.top))) continue;
      let _g371 = 0;
      G372: {
        const _a373 = sp.cells;
        for (let _i374 = 0; _i374 < _a373.length; _i374++) {
          const v_x = _a373[_i374];
          const _h375 = (g[v_x] || -1);
          if (!((_h375 === _h370))) continue;
          _g371++;
        }
      }
      if (!((_g371 === 1))) {
        _q366 = false;
        break Q367;
      }
    }
  }
  if (!(_q366)) return false;
  let _g376 = 0;
  G377: {
    const _a378 = cluesValued(cl.wall, -1);
    for (let _i379 = 0; _i379 < _a378.length; _i379++) {
      const v_x = _a378[_i379];
      const _h380 = clueAt(cl.wall, v_x);
      const _h381 = clueAt(cl.arrow, v_x);
      if (!(((_h380 === -1) && (_h381 === -1)))) continue;
      _g376++;
    }
  }
  if (!((cl.top === _g376))) return false;
  for (let _k382 = 0; _k382 < cl.number.at.length; _k382++) {
    const _at383 = cl.number.at[_k382];
    const _v384 = cl.number.v[_k382];
    if (!(((g[_at383] || -1) === _v384))) return false;
  }
  for (let _k385 = 0; _k385 < cl.wall.at.length; _k385++) {
    const _at386 = cl.wall.at[_k385];
    if (!(((g[_at386] || -1) === (cl.top + 1)))) return false;
  }
  for (let _k388 = 0; _k388 < cl.arrow.at.length; _k388++) {
    const _at389 = cl.arrow.at[_k388];
    const _v390 = cl.arrow.v[_k388];
    let _c401: boolean = ((g[_at389] || -1) === (cl.top + 1));
    if (_c401) {
      let _q391 = false;
      Q392: {
        const _a393 = cluesValued(cl.wall, -1);
        for (let _i394 = 0; _i394 < _a393.length; _i394++) {
          const v_p = _a393[_i394];
          const _h395 = clueAt(cl.wall, v_p);
          const _h396 = clueAt(cl.arrow, v_p);
          let _c399: boolean = ((_h395 === -1) && (_h396 === -1));
          if (_c399) {
            _c399 = (((((((_at389 / sp.w) | 0) > 0) && (((_at389 / sp.w) | 0) < _h397)) && (((v_p / sp.w) | 0) === ((_at389 / sp.w) | 0))) || (((((((_at389 / sp.w) | 0) === 0) || (((_at389 / sp.w) | 0) === _h397)) && ((_at389 % sp.w) > 0)) && ((_at389 % sp.w) < _h398)) && ((v_p % sp.w) === (_at389 % sp.w)))) || ((((((_at389 / sp.w) | 0) === 0) || (((_at389 / sp.w) | 0) === _h397)) && (((_at389 % sp.w) === 0) || ((_at389 % sp.w) === _h398))) && (Math.abs(((v_p % sp.w) - (_at389 % sp.w))) === Math.abs((((v_p / sp.w) | 0) - ((_at389 / sp.w) | 0))))));
          }
          if (!(_c399)) continue;
          const _h400 = (g[v_p] || -1);
          if ((_h400 === _v390)) {
            _q391 = true;
            break Q392;
          }
        }
      }
      _c401 = _q391;
    }
    if (!(_c401)) return false;
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
      facts.length = 0;
      changed = false;
      let _c39: boolean = (_h37 === 1);
      if (_c39) {
        const _t38 = (v_S.length > 0 ? v_S[0] : -1);
        if (!(b.grid[_t38] !== 0)) { if (fire === null) { b.placeAt(_t38, v_n); changed = true; } else facts.push(PLACE, _t38, v_n); }
        _c39 = true;
      }
      if (!(_c39)) return -1;
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
  const _h69 = (cl.moves === 0);
  const _h70 = (cl.moves === 1);
  const _a50 = sp.cells;
  R1:
  for (let _i51 = 0; _i51 < _a50.length; _i51++) {
    const v_c = _a50[_i51];
    const _m32_0 = b.made[0];
    const _h52 = (b.grid[v_c] !== 0);
    const _h53 = clueAt(cl.wall, v_c);
    const _h54 = clueAt(cl.arrow, v_c);
    if (!((_h52 && ((_h53 === -1) && (_h54 === -1))))) continue;
    const _h55 = (b.grid[v_c] || -1);
    const _h71 = (v_c % sp.w);
    const _h72 = ((v_c / sp.w) | 0);
    const _t56 = (_h55 - 1);
    const _t57 = (_h55 + 1);
    R2:
    for (let _i58 = 0; _i58 < 2; _i58++) {
      const v_m = _i58 === 0 ? _t56 : _t57;
      if (_i58 === 1 && (v_m === _t56)) continue;
      let _c64: boolean = ((v_m >= 1) && (v_m <= cl.top));
      if (_c64) {
        let _g59 = 0;
        G60: {
          const _a61 = cellsValued(b, sp.cells, v_m);
          for (let _i62 = 0; _i62 < _a61.length; _i62++) {
            const v_x = _a61[_i62];
            const _h63 = (b.grid[v_x] || -1);
            if (!((_h63 === v_m))) continue;
            _g59++;
          }
        }
        _c64 = !((_g59 > 0));
      }
      if (!(_c64)) continue;
      if (b.made[0] !== _m32_0) {
        if (!(((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))))) { continue R1; }
        if (!(((v_m === ((b.grid[v_c] || -1) - 1)) || (v_m === ((b.grid[v_c] || -1) + 1))))) { continue R2; }
      }
      facts.length = 0;
      changed = false;
      let _q65 = true;
      Q66: {
        const _a67 = sp.cells;
        for (let _i68 = 0; _i68 < _a67.length; _i68++) {
          const v_p = _a67[_i68];
          if (!((b.has(v_p, v_m) && !((((_h69 || (_h70 && ((((v_p % sp.w) - _h71) * (((v_p / sp.w) | 0) - _h72)) > 0))) && ((Math.abs(((v_p % sp.w) - _h71)) + Math.abs((((v_p / sp.w) | 0) - _h72))) <= 1)) || ((!((_h69 || (_h70 && ((((v_p % sp.w) - _h71) * (((v_p / sp.w) | 0) - _h72)) > 0)))) && (Math.abs(((v_p % sp.w) - _h71)) <= 1)) && (Math.abs((((v_p / sp.w) | 0) - _h72)) <= 1))))))) continue;
          if (b.has(v_p, v_m)) { if (fire === null) { b.strikeAt(v_p, v_m); changed = true; } else facts.push(STRIKE, v_p, v_m); }
          if (!(true)) {
            _q65 = false;
            break Q66;
          }
        }
      }
      if (!(_q65)) return -1;
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
  const _h108 = (cl.moves === 0);
  const _h109 = (cl.moves === 1);
  const _a94 = sp.cells;
  R1:
  for (let _i95 = 0; _i95 < _a94.length; _i95++) {
    const v_c = _a94[_i95];
    const _m50_0 = b.made[0];
    const _h96 = (b.grid[v_c] !== 0);
    const _h97 = clueAt(cl.wall, v_c);
    const _h98 = clueAt(cl.arrow, v_c);
    if (!((_h96 && ((_h97 === -1) && (_h98 === -1))))) continue;
    const _h99 = (b.grid[v_c] || -1);
    const _h110 = (v_c % sp.w);
    const _h111 = ((v_c / sp.w) | 0);
    const v_n = _h99;
    const _m56_1 = b.made[1];
    const _t100 = ((v_n - gapBelow(b, sp, v_n)) + 1);
    const _t101 = ((v_n + gapAbove(b, sp, cl, v_n)) - 1);
    R2:
    for (let v_m = _t100; v_m <= _t101; v_m++) {
      if (!((v_m !== v_n))) continue;
      const _h106 = (v_m - v_n);
      const _h107 = Math.abs(_h106);
      if (b.made[0] !== _m50_0 || b.made[1] !== _m56_1) {
        if (!(((b.grid[v_c] !== 0) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1))))) { continue R1; }
        if (!((v_n === (b.grid[v_c] || -1)))) { continue R1; }
        if (!(((((v_n - gapBelow(b, sp, v_n)) + 1) <= v_m) && (v_m <= ((v_n + gapAbove(b, sp, cl, v_n)) - 1))))) { continue R2; }
      }
      facts.length = 0;
      changed = false;
      let _q102 = true;
      Q103: {
        const _a104 = sp.cells;
        for (let _i105 = 0; _i105 < _a104.length; _i105++) {
          const v_p = _a104[_i105];
          if (!((b.has(v_p, v_m) && !((((_h108 || (_h109 && ((((v_p % sp.w) - _h110) * (((v_p / sp.w) | 0) - _h111)) > 0))) && ((Math.abs(((v_p % sp.w) - _h110)) + Math.abs((((v_p / sp.w) | 0) - _h111))) <= _h107)) || ((!((_h108 || (_h109 && ((((v_p % sp.w) - _h110) * (((v_p / sp.w) | 0) - _h111)) > 0)))) && (Math.abs(((v_p % sp.w) - _h110)) <= _h107)) && (Math.abs((((v_p / sp.w) | 0) - _h111)) <= _h107))))))) continue;
          if (b.has(v_p, v_m)) { if (fire === null) { b.strikeAt(v_p, v_m); changed = true; } else facts.push(STRIKE, v_p, v_m); }
          if (!(true)) {
            _q102 = false;
            break Q103;
          }
        }
      }
      if (!(_q102)) return -1;
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
  const _k162 = nbrKept.board(cl);
  const _a156 = sp.cells;
  R1:
  for (let _i157 = 0; _i157 < _a156.length; _i157++) {
    const v_c = _a156[_i157];
    const _m69_0 = b.made[0];
    const _m69_1 = b.made[1];
    const _h158 = clueAt(cl.wall, v_c);
    const _h159 = clueAt(cl.arrow, v_c);
    let _c182: boolean = (!((b.grid[v_c] !== 0)) && ((_h158 === -1) && (_h159 === -1)));
    if (_c182) {
      let _g160 = 0;
      G161: {
        const _a163 = (_k162[v_c] ?? nbr(sp, cl, v_c));
        for (let _i164 = 0; _i164 < _a163.length; _i164++) {
          const v_p = _a163[_i164];
          const _h165 = clueAt(cl.wall, v_p);
          const _h166 = clueAt(cl.arrow, v_p);
          let _c181: boolean = ((_h165 === -1) && (_h166 === -1));
          if (_c181) {
            let _c173: boolean = !((b.grid[v_p] !== 0));
            if (!_c173) {
              let _c172: boolean = ((b.grid[v_p] || -1) > 1);
              if (_c172) {
                const _t167 = ((b.grid[v_p] || -1) - 1);
                let _g168 = 0;
                G169: {
                  const _a170 = cellsValued(b, sp.cells, _t167);
                  for (let _i171 = 0; _i171 < _a170.length; _i171++) {
                    const v_x = _a170[_i171];
                    if (!(((b.grid[v_x] || -1) === _t167))) continue;
                    _g168++;
                  }
                }
                _c172 = !((_g168 > 0));
              }
              _c173 = _c172;
            }
            let _c180: boolean = _c173;
            if (!_c180) {
              let _c179: boolean = ((b.grid[v_p] || -1) < cl.top);
              if (_c179) {
                const _t174 = ((b.grid[v_p] || -1) + 1);
                let _g175 = 0;
                G176: {
                  const _a177 = cellsValued(b, sp.cells, _t174);
                  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                    const v_x = _a177[_i178];
                    if (!(((b.grid[v_x] || -1) === _t174))) continue;
                    _g175++;
                  }
                }
                _c179 = !((_g175 > 0));
              }
              _c180 = _c179;
            }
            _c181 = _c180;
          }
          if (!(_c181)) continue;
          _g160++;
        }
      }
      _c182 = (_g160 === 1);
    }
    if (!(_c182)) continue;
    const _t183 = cl.top;
    for (let _i184 = 0; _i184 < 2; _i184++) {
      const v_n = _i184 === 0 ? 1 : _t183;
      if (_i184 === 1 && (v_n === 1)) continue;
      let _g185 = 0;
      G186: {
        const _a187 = cellsValued(b, sp.cells, v_n);
        for (let _i188 = 0; _i188 < _a187.length; _i188++) {
          const v_x = _a187[_i188];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g185++;
        }
      }
      let _c198: boolean = (!((_g185 > 0)) && b.has(v_c, v_n));
      if (_c198) {
        let _q189 = false;
        Q190: {
          const _t191 = cl.top;
          for (let _i192 = 0; _i192 < 2; _i192++) {
            const v_e = _i192 === 0 ? 1 : _t191;
            if (_i192 === 1 && (v_e === 1)) continue;
            let _c197: boolean = (v_e !== v_n);
            if (_c197) {
              let _g193 = 0;
              G194: {
                const _a195 = cellsValued(b, sp.cells, v_e);
                for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                  const v_x = _a195[_i196];
                  if (!(((b.grid[v_x] || -1) === v_e))) continue;
                  _g193++;
                }
              }
              _c197 = !((_g193 > 0));
            }
            if (!(_c197)) continue;
            if (b.has(v_c, v_e)) {
              _q189 = true;
              break Q190;
            }
          }
        }
        _c198 = !(_q189);
      }
      if (!(_c198)) continue;
      if (b.made[0] !== _m69_0 || b.made[1] !== _m69_1) {
        let _c218: boolean = (!((b.grid[v_c] !== 0)) && ((clueAt(cl.wall, v_c) === -1) && (clueAt(cl.arrow, v_c) === -1)));
        if (_c218) {
          let _g199 = 0;
          G200: {
            const _a201 = nbr(sp, cl, v_c);
            for (let _i202 = 0; _i202 < _a201.length; _i202++) {
              const v_p = _a201[_i202];
              let _c217: boolean = ((clueAt(cl.wall, v_p) === -1) && (clueAt(cl.arrow, v_p) === -1));
              if (_c217) {
                let _c209: boolean = !((b.grid[v_p] !== 0));
                if (!_c209) {
                  let _c208: boolean = ((b.grid[v_p] || -1) > 1);
                  if (_c208) {
                    const _t203 = ((b.grid[v_p] || -1) - 1);
                    let _g204 = 0;
                    G205: {
                      const _a206 = cellsValued(b, sp.cells, _t203);
                      for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                        const v_x = _a206[_i207];
                        if (!(((b.grid[v_x] || -1) === _t203))) continue;
                        _g204++;
                      }
                    }
                    _c208 = !((_g204 > 0));
                  }
                  _c209 = _c208;
                }
                let _c216: boolean = _c209;
                if (!_c216) {
                  let _c215: boolean = ((b.grid[v_p] || -1) < cl.top);
                  if (_c215) {
                    const _t210 = ((b.grid[v_p] || -1) + 1);
                    let _g211 = 0;
                    G212: {
                      const _a213 = cellsValued(b, sp.cells, _t210);
                      for (let _i214 = 0; _i214 < _a213.length; _i214++) {
                        const v_x = _a213[_i214];
                        if (!(((b.grid[v_x] || -1) === _t210))) continue;
                        _g211++;
                      }
                    }
                    _c215 = !((_g211 > 0));
                  }
                  _c216 = _c215;
                }
                _c217 = _c216;
              }
              if (!(_c217)) continue;
              _g199++;
            }
          }
          _c218 = (_g199 === 1);
        }
        if (!(_c218)) { continue R1; }
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
  const _k237 = nbrKept.board(cl);
  const _t224 = cl.top;
  for (let v_n = 1; v_n <= _t224; v_n++) {
    let _g225 = 0;
    G226: {
      const _a227 = cellsValued(b, sp.cells, v_n);
      for (let _i228 = 0; _i228 < _a227.length; _i228++) {
        const v_x = _a227[_i228];
        const _h229 = (b.grid[v_x] || -1);
        if (!((_h229 === v_n))) continue;
        _g225++;
      }
    }
    if (!(!((_g225 > 0)))) continue;
    const _h234 = (v_n > 1);
    const _h240 = (v_n - 1);
    const _h242 = (v_n < cl.top);
    const _h247 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q230 = true;
    Q231: {
      const _a232 = sp.cells;
      for (let _i233 = 0; _i233 < _a232.length; _i233++) {
        const v_c = _a232[_i233];
        let _c250: boolean = b.has(v_c, v_n);
        if (_c250) {
          let _c241: boolean = _h234;
          if (_c241) {
            let _q235 = false;
            Q236: {
              const _a238 = (_k237[v_c] ?? nbr(sp, cl, v_c));
              for (let _i239 = 0; _i239 < _a238.length; _i239++) {
                const v_p = _a238[_i239];
                if (b.has(v_p, _h240)) {
                  _q235 = true;
                  break Q236;
                }
              }
            }
            _c241 = !(_q235);
          }
          let _c249: boolean = _c241;
          if (!_c249) {
            let _c248: boolean = _h242;
            if (_c248) {
              let _q243 = false;
              Q244: {
                const _a245 = (_k237[v_c] ?? nbr(sp, cl, v_c));
                for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                  const v_p = _a245[_i246];
                  if (b.has(v_p, _h247)) {
                    _q243 = true;
                    break Q244;
                  }
                }
              }
              _c248 = !(_q243);
            }
            _c249 = _c248;
          }
          _c250 = _c249;
        }
        if (!(_c250)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q230 = false;
          break Q231;
        }
      }
    }
    if (!(_q230)) return -1;
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
  const _a267 = sp.cells;
  for (let _i268 = 0; _i268 < _a267.length; _i268++) {
    const v_c = _a267[_i268];
    const _h269 = clueAt(cl.wall, v_c);
    const _h270 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h269 === -1) && (_h270 === -1))) && (b.candCount(v_c) === 1)))) continue;
    L271: {
      const v_n = b.candFirst(v_c);
      let _c277: boolean = (v_n > 1);
      if (_c277) {
        const _t272 = (v_n - 1);
        let _g273 = 0;
        G274: {
          const _a275 = cellsValued(b, sp.cells, _t272);
          for (let _i276 = 0; _i276 < _a275.length; _i276++) {
            const v_x = _a275[_i276];
            if (!(((b.grid[v_x] || -1) === _t272))) continue;
            _g273++;
          }
        }
        _c277 = (_g273 > 0);
      }
      let _c284: boolean = _c277;
      if (!_c284) {
        let _c283: boolean = (v_n < cl.top);
        if (_c283) {
          const _t278 = (v_n + 1);
          let _g279 = 0;
          G280: {
            const _a281 = cellsValued(b, sp.cells, _t278);
            for (let _i282 = 0; _i282 < _a281.length; _i282++) {
              const v_x = _a281[_i282];
              if (!(((b.grid[v_x] || -1) === _t278))) continue;
              _g279++;
            }
          }
          _c283 = (_g279 > 0);
        }
        _c284 = _c283;
      }
      if (!(_c284)) break L271;
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
  const _a287 = sp.cells;
  for (let _i288 = 0; _i288 < _a287.length; _i288++) {
    const v_c = _a287[_i288];
    const _h289 = clueAt(cl.wall, v_c);
    const _h290 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h289 === -1) && (_h290 === -1))) && (b.candCount(v_c) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c292: boolean = (b.candCount(v_c) === 1);
    if (_c292) {
      const _t291 = b.candFirst(v_c);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t291); changed = true; } else facts.push(PLACE, v_c, _t291); }
      _c292 = true;
    }
    if (!(_c292)) return -1;
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
  const _h306 = (sp.h - 1);
  const _h315 = (sp.w - 1);
  const _a296 = sp.cells;
  for (let _i297 = 0; _i297 < _a296.length; _i297++) {
    const v_a = _a296[_i297];
    const _h298 = clueAt(cl.arrow, v_a);
    const _h304 = ((v_a / sp.w) | 0);
    const _h305 = (_h304 > 0);
    const _h307 = (_h304 < _h306);
    const _h308 = (_h305 && _h307);
    const _h309 = (_h304 === 0);
    const _h310 = (_h304 === _h306);
    const _h311 = (_h309 || _h310);
    const _h312 = (v_a % sp.w);
    const _h313 = (_h312 > 0);
    const _h314 = (_h311 && _h313);
    const _h316 = (_h312 < _h315);
    const _h317 = (_h314 && _h316);
    const _h318 = (_h312 === 0);
    const _h319 = (_h312 === _h315);
    const _h320 = (_h318 || _h319);
    const _h321 = (_h311 && _h320);
    L299: {
      const v_n = _h298;
      if (!((v_n !== -1))) break L299;
      facts.length = 0;
      changed = false;
      let _q300 = true;
      Q301: {
        const _a302 = sp.cells;
        for (let _i303 = 0; _i303 < _a302.length; _i303++) {
          const v_p = _a302[_i303];
          if (!((b.has(v_p, v_n) && !((((_h308 && (((v_p / sp.w) | 0) === _h304)) || (_h317 && ((v_p % sp.w) === _h312))) || (_h321 && (Math.abs(((v_p % sp.w) - _h312)) === Math.abs((((v_p / sp.w) | 0) - _h304))))))))) continue;
          if (b.has(v_p, v_n)) { if (fire === null) { b.strikeAt(v_p, v_n); changed = true; } else facts.push(STRIKE, v_p, v_n); }
          if (!(true)) {
            _q300 = false;
            break Q301;
          }
        }
      }
      if (!(_q300)) return -1;
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
  const _k340 = nbrKept.board(cl);
  const _t327 = cl.top;
  for (let v_n = 1; v_n <= _t327; v_n++) {
    let _g328 = 0;
    G329: {
      const _a330 = cellsValued(b, sp.cells, v_n);
      for (let _i331 = 0; _i331 < _a330.length; _i331++) {
        const v_x = _a330[_i331];
        const _h332 = (b.grid[v_x] || -1);
        if (!((_h332 === v_n))) continue;
        _g328++;
      }
    }
    if (!(!((_g328 > 0)))) continue;
    const _h337 = (v_n > 1);
    const _h343 = (v_n - 1);
    const _h345 = (v_n < cl.top);
    const _h350 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q333 = true;
    Q334: {
      const _a335 = sp.cells;
      for (let _i336 = 0; _i336 < _a335.length; _i336++) {
        const v_c = _a335[_i336];
        let _c353: boolean = b.has(v_c, v_n);
        if (_c353) {
          let _c344: boolean = _h337;
          if (_c344) {
            let _q338 = false;
            Q339: {
              const _a341 = (_k340[v_c] ?? nbr(sp, cl, v_c));
              for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                const v_p = _a341[_i342];
                if (b.has(v_p, _h343)) {
                  _q338 = true;
                  break Q339;
                }
              }
            }
            _c344 = !(_q338);
          }
          let _c352: boolean = _c344;
          if (!_c352) {
            let _c351: boolean = _h345;
            if (_c351) {
              let _q346 = false;
              Q347: {
                const _a348 = (_k340[v_c] ?? nbr(sp, cl, v_c));
                for (let _i349 = 0; _i349 < _a348.length; _i349++) {
                  const v_p = _a348[_i349];
                  if (b.has(v_p, _h350)) {
                    _q346 = true;
                    break Q347;
                  }
                }
              }
              _c351 = !(_q346);
            }
            _c352 = _c351;
          }
          _c353 = _c352;
        }
        if (!(_c353)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q333 = false;
          break Q334;
        }
      }
    }
    if (!(_q333)) return -1;
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
  let _g75 = -1;
  G76: {
    for (let v_j = 1; v_j <= v_n; v_j++) {
      let _c82: boolean = (v_j === v_n);
      if (!_c82) {
        const _t77 = (v_n - v_j);
        let _g78 = 0;
        G79: {
          const _a80 = cellsValued(b, sp.cells, _t77);
          for (let _i81 = 0; _i81 < _a80.length; _i81++) {
            const v_x = _a80[_i81];
            if (!(((b.grid[v_x] || -1) === _t77))) continue;
            _g78++;
          }
        }
        _c82 = (_g78 > 0);
      }
      if (!(_c82)) continue;
      _g75 = v_j;
      break G76;
    }
  }
  const _made = _g75;
  _kept[v_n] = _made;
  return _made;
}

const gapAboveKept = keptStore<number>();

/** `gapAbove(n)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function gapAbove(b: Marks, sp: GridSpace, cl: Dealt, v_n: number): number {
  const _kept: Kept<number> = gapAboveKept.marks(b);
  if (_kept[v_n] !== undefined) return _kept[v_n];
  let _g84 = -1;
  G85: {
    const _t86 = ((cl.top + 1) - v_n);
    for (let v_j = 1; v_j <= _t86; v_j++) {
      let _c92: boolean = (v_j === ((cl.top + 1) - v_n));
      if (!_c92) {
        const _t87 = (v_n + v_j);
        let _g88 = 0;
        G89: {
          const _a90 = cellsValued(b, sp.cells, _t87);
          for (let _i91 = 0; _i91 < _a90.length; _i91++) {
            const v_x = _a90[_i91];
            if (!(((b.grid[v_x] || -1) === _t87))) continue;
            _g88++;
          }
        }
        _c92 = (_g88 > 0);
      }
      if (!(_c92)) continue;
      _g84 = v_j;
      break G85;
    }
  }
  const _made = _g84;
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
  const _g116: number[] = [];
  G117: {
    const _a120 = sp.adj8[v_c];
    for (let _i121 = 0; _i121 < _a120.length; _i121++) {
      const v_p = _a120[_i121];
      if (!((((cl.moves === 2) || ((cl.moves === 0) && (sp.adj4[v_c].includes(v_p)))) || ((cl.moves === 1) && (((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))))) continue;
      _g116.push(v_p);
    }
  }
  const _made = _g116;
  _kept[v_c] = _made;
  return _made;
}
