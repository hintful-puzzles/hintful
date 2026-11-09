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
  const _k341 = nbrKept.board(cl);
  const _h377 = (sp.h - 1);
  const _h378 = (sp.w - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;
  }
  let _q334 = true;
  Q335: {
    const _a336 = sp.cells;
    for (let _i337 = 0; _i337 < _a336.length; _i337++) {
      const v_c = _a336[_i337];
      const _h338 = (g[v_c] || -1);
      if (!((_h338 < cl.top))) continue;
      const _h345 = (_h338 + 1);
      let _q339 = false;
      Q340: {
        const _a342 = (_k341[v_c] ?? nbr(sp, cl, v_c));
        for (let _i343 = 0; _i343 < _a342.length; _i343++) {
          const v_p = _a342[_i343];
          const _h344 = (g[v_p] || -1);
          if ((_h344 === _h345)) {
            _q339 = true;
            break Q340;
          }
        }
      }
      if (!(_q339)) {
        _q334 = false;
        break Q335;
      }
    }
  }
  if (!(_q334)) return false;
  let _q346 = true;
  Q347: {
    const _a348 = sp.cells;
    for (let _i349 = 0; _i349 < _a348.length; _i349++) {
      const v_c = _a348[_i349];
      const _h350 = (g[v_c] || -1);
      if (!((_h350 <= cl.top))) continue;
      let _g351 = 0;
      G352: {
        const _a353 = sp.cells;
        for (let _i354 = 0; _i354 < _a353.length; _i354++) {
          const v_x = _a353[_i354];
          const _h355 = (g[v_x] || -1);
          if (!((_h355 === _h350))) continue;
          _g351++;
        }
      }
      if (!((_g351 === 1))) {
        _q346 = false;
        break Q347;
      }
    }
  }
  if (!(_q346)) return false;
  let _g356 = 0;
  G357: {
    const _a358 = cluesValued(cl.wall, -1);
    for (let _i359 = 0; _i359 < _a358.length; _i359++) {
      const v_x = _a358[_i359];
      const _h360 = clueAt(cl.wall, v_x);
      const _h361 = clueAt(cl.arrow, v_x);
      if (!(((_h360 === -1) && (_h361 === -1)))) continue;
      _g356++;
    }
  }
  if (!((cl.top === _g356))) return false;
  for (let _k362 = 0; _k362 < cl.number.at.length; _k362++) {
    const _at363 = cl.number.at[_k362];
    const _v364 = cl.number.v[_k362];
    if (!(((g[_at363] || -1) === _v364))) return false;
  }
  for (let _k365 = 0; _k365 < cl.wall.at.length; _k365++) {
    const _at366 = cl.wall.at[_k365];
    if (!(((g[_at366] || -1) === (cl.top + 1)))) return false;
  }
  for (let _k368 = 0; _k368 < cl.arrow.at.length; _k368++) {
    const _at369 = cl.arrow.at[_k368];
    const _v370 = cl.arrow.v[_k368];
    let _c381: boolean = ((g[_at369] || -1) === (cl.top + 1));
    if (_c381) {
      let _q371 = false;
      Q372: {
        const _a373 = cluesValued(cl.wall, -1);
        for (let _i374 = 0; _i374 < _a373.length; _i374++) {
          const v_p = _a373[_i374];
          const _h375 = clueAt(cl.wall, v_p);
          const _h376 = clueAt(cl.arrow, v_p);
          let _c379: boolean = ((_h375 === -1) && (_h376 === -1));
          if (_c379) {
            _c379 = (((((((_at369 / sp.w) | 0) > 0) && (((_at369 / sp.w) | 0) < _h377)) && (((v_p / sp.w) | 0) === ((_at369 / sp.w) | 0))) || (((((((_at369 / sp.w) | 0) === 0) || (((_at369 / sp.w) | 0) === _h377)) && ((_at369 % sp.w) > 0)) && ((_at369 % sp.w) < _h378)) && ((v_p % sp.w) === (_at369 % sp.w)))) || ((((((_at369 / sp.w) | 0) === 0) || (((_at369 / sp.w) | 0) === _h377)) && (((_at369 % sp.w) === 0) || ((_at369 % sp.w) === _h378))) && (Math.abs(((v_p % sp.w) - (_at369 % sp.w))) === Math.abs((((v_p / sp.w) | 0) - ((_at369 / sp.w) | 0))))));
          }
          if (!(_c379)) continue;
          const _h380 = (g[v_p] || -1);
          if ((_h380 === _v370)) {
            _q371 = true;
            break Q372;
          }
        }
      }
      _c381 = _q371;
    }
    if (!(_c381)) return false;
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
  for (let _i51 = 0; _i51 < _a50.length; _i51++) {
    const v_c = _a50[_i51];
    const _h52 = (b.grid[v_c] !== 0);
    const _h53 = clueAt(cl.wall, v_c);
    const _h54 = clueAt(cl.arrow, v_c);
    if (!((_h52 && ((_h53 === -1) && (_h54 === -1))))) continue;
    const _h55 = (b.grid[v_c] || -1);
    const _h71 = (v_c % sp.w);
    const _h72 = ((v_c / sp.w) | 0);
    const _t56 = (_h55 - 1);
    const _t57 = (_h55 + 1);
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
  for (let _i95 = 0; _i95 < _a94.length; _i95++) {
    const v_c = _a94[_i95];
    const _h96 = (b.grid[v_c] !== 0);
    const _h97 = clueAt(cl.wall, v_c);
    const _h98 = clueAt(cl.arrow, v_c);
    if (!((_h96 && ((_h97 === -1) && (_h98 === -1))))) continue;
    const _h99 = (b.grid[v_c] || -1);
    const _h110 = (v_c % sp.w);
    const _h111 = ((v_c / sp.w) | 0);
    const v_n = _h99;
    const _t100 = ((v_n - gapBelow(b, sp, v_n)) + 1);
    const _t101 = ((v_n + gapAbove(b, sp, cl, v_n)) - 1);
    for (let v_m = _t100; v_m <= _t101; v_m++) {
      if (!((v_m !== v_n))) continue;
      const _h106 = (v_m - v_n);
      const _h107 = Math.abs(_h106);
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
  for (let _i157 = 0; _i157 < _a156.length; _i157++) {
    const v_c = _a156[_i157];
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
  const _k217 = nbrKept.board(cl);
  const _t204 = cl.top;
  for (let v_n = 1; v_n <= _t204; v_n++) {
    let _g205 = 0;
    G206: {
      const _a207 = cellsValued(b, sp.cells, v_n);
      for (let _i208 = 0; _i208 < _a207.length; _i208++) {
        const v_x = _a207[_i208];
        const _h209 = (b.grid[v_x] || -1);
        if (!((_h209 === v_n))) continue;
        _g205++;
      }
    }
    if (!(!((_g205 > 0)))) continue;
    const _h214 = (v_n > 1);
    const _h220 = (v_n - 1);
    const _h222 = (v_n < cl.top);
    const _h227 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q210 = true;
    Q211: {
      const _a212 = sp.cells;
      for (let _i213 = 0; _i213 < _a212.length; _i213++) {
        const v_c = _a212[_i213];
        let _c230: boolean = b.has(v_c, v_n);
        if (_c230) {
          let _c221: boolean = _h214;
          if (_c221) {
            let _q215 = false;
            Q216: {
              const _a218 = (_k217[v_c] ?? nbr(sp, cl, v_c));
              for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                const v_p = _a218[_i219];
                if (b.has(v_p, _h220)) {
                  _q215 = true;
                  break Q216;
                }
              }
            }
            _c221 = !(_q215);
          }
          let _c229: boolean = _c221;
          if (!_c229) {
            let _c228: boolean = _h222;
            if (_c228) {
              let _q223 = false;
              Q224: {
                const _a225 = (_k217[v_c] ?? nbr(sp, cl, v_c));
                for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                  const v_p = _a225[_i226];
                  if (b.has(v_p, _h227)) {
                    _q223 = true;
                    break Q224;
                  }
                }
              }
              _c228 = !(_q223);
            }
            _c229 = _c228;
          }
          _c230 = _c229;
        }
        if (!(_c230)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q210 = false;
          break Q211;
        }
      }
    }
    if (!(_q210)) return -1;
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
  const _a247 = sp.cells;
  for (let _i248 = 0; _i248 < _a247.length; _i248++) {
    const v_c = _a247[_i248];
    const _h249 = clueAt(cl.wall, v_c);
    const _h250 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h249 === -1) && (_h250 === -1))) && (b.candCount(v_c) === 1)))) continue;
    L251: {
      const v_n = b.candFirst(v_c);
      let _c257: boolean = (v_n > 1);
      if (_c257) {
        const _t252 = (v_n - 1);
        let _g253 = 0;
        G254: {
          const _a255 = cellsValued(b, sp.cells, _t252);
          for (let _i256 = 0; _i256 < _a255.length; _i256++) {
            const v_x = _a255[_i256];
            if (!(((b.grid[v_x] || -1) === _t252))) continue;
            _g253++;
          }
        }
        _c257 = (_g253 > 0);
      }
      let _c264: boolean = _c257;
      if (!_c264) {
        let _c263: boolean = (v_n < cl.top);
        if (_c263) {
          const _t258 = (v_n + 1);
          let _g259 = 0;
          G260: {
            const _a261 = cellsValued(b, sp.cells, _t258);
            for (let _i262 = 0; _i262 < _a261.length; _i262++) {
              const v_x = _a261[_i262];
              if (!(((b.grid[v_x] || -1) === _t258))) continue;
              _g259++;
            }
          }
          _c263 = (_g259 > 0);
        }
        _c264 = _c263;
      }
      if (!(_c264)) break L251;
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
  const _a267 = sp.cells;
  for (let _i268 = 0; _i268 < _a267.length; _i268++) {
    const v_c = _a267[_i268];
    const _h269 = clueAt(cl.wall, v_c);
    const _h270 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h269 === -1) && (_h270 === -1))) && (b.candCount(v_c) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c272: boolean = (b.candCount(v_c) === 1);
    if (_c272) {
      const _t271 = b.candFirst(v_c);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t271); changed = true; } else facts.push(PLACE, v_c, _t271); }
      _c272 = true;
    }
    if (!(_c272)) return -1;
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
  const _h286 = (sp.h - 1);
  const _h295 = (sp.w - 1);
  const _a276 = sp.cells;
  for (let _i277 = 0; _i277 < _a276.length; _i277++) {
    const v_a = _a276[_i277];
    const _h278 = clueAt(cl.arrow, v_a);
    const _h284 = ((v_a / sp.w) | 0);
    const _h285 = (_h284 > 0);
    const _h287 = (_h284 < _h286);
    const _h288 = (_h285 && _h287);
    const _h289 = (_h284 === 0);
    const _h290 = (_h284 === _h286);
    const _h291 = (_h289 || _h290);
    const _h292 = (v_a % sp.w);
    const _h293 = (_h292 > 0);
    const _h294 = (_h291 && _h293);
    const _h296 = (_h292 < _h295);
    const _h297 = (_h294 && _h296);
    const _h298 = (_h292 === 0);
    const _h299 = (_h292 === _h295);
    const _h300 = (_h298 || _h299);
    const _h301 = (_h291 && _h300);
    L279: {
      const v_n = _h278;
      if (!((v_n !== -1))) break L279;
      facts.length = 0;
      changed = false;
      let _q280 = true;
      Q281: {
        const _a282 = sp.cells;
        for (let _i283 = 0; _i283 < _a282.length; _i283++) {
          const v_p = _a282[_i283];
          if (!((b.has(v_p, v_n) && !((((_h288 && (((v_p / sp.w) | 0) === _h284)) || (_h297 && ((v_p % sp.w) === _h292))) || (_h301 && (Math.abs(((v_p % sp.w) - _h292)) === Math.abs((((v_p / sp.w) | 0) - _h284))))))))) continue;
          if (b.has(v_p, v_n)) { if (fire === null) { b.strikeAt(v_p, v_n); changed = true; } else facts.push(STRIKE, v_p, v_n); }
          if (!(true)) {
            _q280 = false;
            break Q281;
          }
        }
      }
      if (!(_q280)) return -1;
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
  const _k320 = nbrKept.board(cl);
  const _t307 = cl.top;
  for (let v_n = 1; v_n <= _t307; v_n++) {
    let _g308 = 0;
    G309: {
      const _a310 = cellsValued(b, sp.cells, v_n);
      for (let _i311 = 0; _i311 < _a310.length; _i311++) {
        const v_x = _a310[_i311];
        const _h312 = (b.grid[v_x] || -1);
        if (!((_h312 === v_n))) continue;
        _g308++;
      }
    }
    if (!(!((_g308 > 0)))) continue;
    const _h317 = (v_n > 1);
    const _h323 = (v_n - 1);
    const _h325 = (v_n < cl.top);
    const _h330 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q313 = true;
    Q314: {
      const _a315 = sp.cells;
      for (let _i316 = 0; _i316 < _a315.length; _i316++) {
        const v_c = _a315[_i316];
        let _c333: boolean = b.has(v_c, v_n);
        if (_c333) {
          let _c324: boolean = _h317;
          if (_c324) {
            let _q318 = false;
            Q319: {
              const _a321 = (_k320[v_c] ?? nbr(sp, cl, v_c));
              for (let _i322 = 0; _i322 < _a321.length; _i322++) {
                const v_p = _a321[_i322];
                if (b.has(v_p, _h323)) {
                  _q318 = true;
                  break Q319;
                }
              }
            }
            _c324 = !(_q318);
          }
          let _c332: boolean = _c324;
          if (!_c332) {
            let _c331: boolean = _h325;
            if (_c331) {
              let _q326 = false;
              Q327: {
                const _a328 = (_k320[v_c] ?? nbr(sp, cl, v_c));
                for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                  const v_p = _a328[_i329];
                  if (b.has(v_p, _h330)) {
                    _q326 = true;
                    break Q327;
                  }
                }
              }
              _c331 = !(_q326);
            }
            _c332 = _c331;
          }
          _c333 = _c332;
        }
        if (!(_c333)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q313 = false;
          break Q314;
        }
      }
    }
    if (!(_q313)) return -1;
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
