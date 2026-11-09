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
  const _h373 = (sp.h - 1);
  const _h374 = (sp.w - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;
  }
  let _q331 = true;
  Q332: {
    const _a333 = sp.cells;
    for (let _i334 = 0; _i334 < _a333.length; _i334++) {
      const v_c = _a333[_i334];
      const _h335 = (g[v_c] || -1);
      if (!((_h335 < cl.top))) continue;
      const _h341 = (_h335 + 1);
      let _q336 = false;
      Q337: {
        const _a338 = nbr(sp, cl, v_c);
        for (let _i339 = 0; _i339 < _a338.length; _i339++) {
          const v_p = _a338[_i339];
          const _h340 = (g[v_p] || -1);
          if ((_h340 === _h341)) {
            _q336 = true;
            break Q337;
          }
        }
      }
      if (!(_q336)) {
        _q331 = false;
        break Q332;
      }
    }
  }
  if (!(_q331)) return false;
  let _q342 = true;
  Q343: {
    const _a344 = sp.cells;
    for (let _i345 = 0; _i345 < _a344.length; _i345++) {
      const v_c = _a344[_i345];
      const _h346 = (g[v_c] || -1);
      if (!((_h346 <= cl.top))) continue;
      let _g347 = 0;
      G348: {
        const _a349 = sp.cells;
        for (let _i350 = 0; _i350 < _a349.length; _i350++) {
          const v_x = _a349[_i350];
          const _h351 = (g[v_x] || -1);
          if (!((_h351 === _h346))) continue;
          _g347++;
        }
      }
      if (!((_g347 === 1))) {
        _q342 = false;
        break Q343;
      }
    }
  }
  if (!(_q342)) return false;
  let _g352 = 0;
  G353: {
    const _a354 = cluesValued(cl.wall, -1);
    for (let _i355 = 0; _i355 < _a354.length; _i355++) {
      const v_x = _a354[_i355];
      const _h356 = clueAt(cl.wall, v_x);
      const _h357 = clueAt(cl.arrow, v_x);
      if (!(((_h356 === -1) && (_h357 === -1)))) continue;
      _g352++;
    }
  }
  if (!((cl.top === _g352))) return false;
  for (let _k358 = 0; _k358 < cl.number.at.length; _k358++) {
    const _at359 = cl.number.at[_k358];
    const _v360 = cl.number.v[_k358];
    if (!(((g[_at359] || -1) === _v360))) return false;
  }
  for (let _k361 = 0; _k361 < cl.wall.at.length; _k361++) {
    const _at362 = cl.wall.at[_k361];
    if (!(((g[_at362] || -1) === (cl.top + 1)))) return false;
  }
  for (let _k364 = 0; _k364 < cl.arrow.at.length; _k364++) {
    const _at365 = cl.arrow.at[_k364];
    const _v366 = cl.arrow.v[_k364];
    let _c377: boolean = ((g[_at365] || -1) === (cl.top + 1));
    if (_c377) {
      let _q367 = false;
      Q368: {
        const _a369 = cluesValued(cl.wall, -1);
        for (let _i370 = 0; _i370 < _a369.length; _i370++) {
          const v_p = _a369[_i370];
          const _h371 = clueAt(cl.wall, v_p);
          const _h372 = clueAt(cl.arrow, v_p);
          let _c375: boolean = ((_h371 === -1) && (_h372 === -1));
          if (_c375) {
            _c375 = (((((((_at365 / sp.w) | 0) > 0) && (((_at365 / sp.w) | 0) < _h373)) && (((v_p / sp.w) | 0) === ((_at365 / sp.w) | 0))) || (((((((_at365 / sp.w) | 0) === 0) || (((_at365 / sp.w) | 0) === _h373)) && ((_at365 % sp.w) > 0)) && ((_at365 % sp.w) < _h374)) && ((v_p % sp.w) === (_at365 % sp.w)))) || ((((((_at365 / sp.w) | 0) === 0) || (((_at365 / sp.w) | 0) === _h373)) && (((_at365 % sp.w) === 0) || ((_at365 % sp.w) === _h374))) && (Math.abs(((v_p % sp.w) - (_at365 % sp.w))) === Math.abs((((v_p / sp.w) | 0) - ((_at365 / sp.w) | 0))))));
          }
          if (!(_c375)) continue;
          const _h376 = (g[v_p] || -1);
          if ((_h376 === _v366)) {
            _q367 = true;
            break Q368;
          }
        }
      }
      _c377 = _q367;
    }
    if (!(_c377)) return false;
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
  const _a156 = sp.cells;
  for (let _i157 = 0; _i157 < _a156.length; _i157++) {
    const v_c = _a156[_i157];
    const _h158 = clueAt(cl.wall, v_c);
    const _h159 = clueAt(cl.arrow, v_c);
    let _c181: boolean = (!((b.grid[v_c] !== 0)) && ((_h158 === -1) && (_h159 === -1)));
    if (_c181) {
      let _g160 = 0;
      G161: {
        const _a162 = nbr(sp, cl, v_c);
        for (let _i163 = 0; _i163 < _a162.length; _i163++) {
          const v_p = _a162[_i163];
          const _h164 = clueAt(cl.wall, v_p);
          const _h165 = clueAt(cl.arrow, v_p);
          let _c180: boolean = ((_h164 === -1) && (_h165 === -1));
          if (_c180) {
            let _c172: boolean = !((b.grid[v_p] !== 0));
            if (!_c172) {
              let _c171: boolean = ((b.grid[v_p] || -1) > 1);
              if (_c171) {
                const _t166 = ((b.grid[v_p] || -1) - 1);
                let _g167 = 0;
                G168: {
                  const _a169 = cellsValued(b, sp.cells, _t166);
                  for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                    const v_x = _a169[_i170];
                    if (!(((b.grid[v_x] || -1) === _t166))) continue;
                    _g167++;
                  }
                }
                _c171 = !((_g167 > 0));
              }
              _c172 = _c171;
            }
            let _c179: boolean = _c172;
            if (!_c179) {
              let _c178: boolean = ((b.grid[v_p] || -1) < cl.top);
              if (_c178) {
                const _t173 = ((b.grid[v_p] || -1) + 1);
                let _g174 = 0;
                G175: {
                  const _a176 = cellsValued(b, sp.cells, _t173);
                  for (let _i177 = 0; _i177 < _a176.length; _i177++) {
                    const v_x = _a176[_i177];
                    if (!(((b.grid[v_x] || -1) === _t173))) continue;
                    _g174++;
                  }
                }
                _c178 = !((_g174 > 0));
              }
              _c179 = _c178;
            }
            _c180 = _c179;
          }
          if (!(_c180)) continue;
          _g160++;
        }
      }
      _c181 = (_g160 === 1);
    }
    if (!(_c181)) continue;
    const _t182 = cl.top;
    for (let _i183 = 0; _i183 < 2; _i183++) {
      const v_n = _i183 === 0 ? 1 : _t182;
      if (_i183 === 1 && (v_n === 1)) continue;
      let _g184 = 0;
      G185: {
        const _a186 = cellsValued(b, sp.cells, v_n);
        for (let _i187 = 0; _i187 < _a186.length; _i187++) {
          const v_x = _a186[_i187];
          if (!(((b.grid[v_x] || -1) === v_n))) continue;
          _g184++;
        }
      }
      let _c197: boolean = (!((_g184 > 0)) && b.has(v_c, v_n));
      if (_c197) {
        let _q188 = false;
        Q189: {
          const _t190 = cl.top;
          for (let _i191 = 0; _i191 < 2; _i191++) {
            const v_e = _i191 === 0 ? 1 : _t190;
            if (_i191 === 1 && (v_e === 1)) continue;
            let _c196: boolean = (v_e !== v_n);
            if (_c196) {
              let _g192 = 0;
              G193: {
                const _a194 = cellsValued(b, sp.cells, v_e);
                for (let _i195 = 0; _i195 < _a194.length; _i195++) {
                  const v_x = _a194[_i195];
                  if (!(((b.grid[v_x] || -1) === v_e))) continue;
                  _g192++;
                }
              }
              _c196 = !((_g192 > 0));
            }
            if (!(_c196)) continue;
            if (b.has(v_c, v_e)) {
              _q188 = true;
              break Q189;
            }
          }
        }
        _c197 = !(_q188);
      }
      if (!(_c197)) continue;
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
  const _t203 = cl.top;
  for (let v_n = 1; v_n <= _t203; v_n++) {
    let _g204 = 0;
    G205: {
      const _a206 = cellsValued(b, sp.cells, v_n);
      for (let _i207 = 0; _i207 < _a206.length; _i207++) {
        const v_x = _a206[_i207];
        const _h208 = (b.grid[v_x] || -1);
        if (!((_h208 === v_n))) continue;
        _g204++;
      }
    }
    if (!(!((_g204 > 0)))) continue;
    const _h213 = (v_n > 1);
    const _h218 = (v_n - 1);
    const _h220 = (v_n < cl.top);
    const _h225 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q209 = true;
    Q210: {
      const _a211 = sp.cells;
      for (let _i212 = 0; _i212 < _a211.length; _i212++) {
        const v_c = _a211[_i212];
        let _c228: boolean = b.has(v_c, v_n);
        if (_c228) {
          let _c219: boolean = _h213;
          if (_c219) {
            let _q214 = false;
            Q215: {
              const _a216 = nbr(sp, cl, v_c);
              for (let _i217 = 0; _i217 < _a216.length; _i217++) {
                const v_p = _a216[_i217];
                if (b.has(v_p, _h218)) {
                  _q214 = true;
                  break Q215;
                }
              }
            }
            _c219 = !(_q214);
          }
          let _c227: boolean = _c219;
          if (!_c227) {
            let _c226: boolean = _h220;
            if (_c226) {
              let _q221 = false;
              Q222: {
                const _a223 = nbr(sp, cl, v_c);
                for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                  const v_p = _a223[_i224];
                  if (b.has(v_p, _h225)) {
                    _q221 = true;
                    break Q222;
                  }
                }
              }
              _c226 = !(_q221);
            }
            _c227 = _c226;
          }
          _c228 = _c227;
        }
        if (!(_c228)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q209 = false;
          break Q210;
        }
      }
    }
    if (!(_q209)) return -1;
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
  const _a245 = sp.cells;
  for (let _i246 = 0; _i246 < _a245.length; _i246++) {
    const v_c = _a245[_i246];
    const _h247 = clueAt(cl.wall, v_c);
    const _h248 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h247 === -1) && (_h248 === -1))) && (b.candCount(v_c) === 1)))) continue;
    L249: {
      const v_n = b.candFirst(v_c);
      let _c255: boolean = (v_n > 1);
      if (_c255) {
        const _t250 = (v_n - 1);
        let _g251 = 0;
        G252: {
          const _a253 = cellsValued(b, sp.cells, _t250);
          for (let _i254 = 0; _i254 < _a253.length; _i254++) {
            const v_x = _a253[_i254];
            if (!(((b.grid[v_x] || -1) === _t250))) continue;
            _g251++;
          }
        }
        _c255 = (_g251 > 0);
      }
      let _c262: boolean = _c255;
      if (!_c262) {
        let _c261: boolean = (v_n < cl.top);
        if (_c261) {
          const _t256 = (v_n + 1);
          let _g257 = 0;
          G258: {
            const _a259 = cellsValued(b, sp.cells, _t256);
            for (let _i260 = 0; _i260 < _a259.length; _i260++) {
              const v_x = _a259[_i260];
              if (!(((b.grid[v_x] || -1) === _t256))) continue;
              _g257++;
            }
          }
          _c261 = (_g257 > 0);
        }
        _c262 = _c261;
      }
      if (!(_c262)) break L249;
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
  const _a265 = sp.cells;
  for (let _i266 = 0; _i266 < _a265.length; _i266++) {
    const v_c = _a265[_i266];
    const _h267 = clueAt(cl.wall, v_c);
    const _h268 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h267 === -1) && (_h268 === -1))) && (b.candCount(v_c) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c270: boolean = (b.candCount(v_c) === 1);
    if (_c270) {
      const _t269 = b.candFirst(v_c);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t269); changed = true; } else facts.push(PLACE, v_c, _t269); }
      _c270 = true;
    }
    if (!(_c270)) return -1;
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
  const _h284 = (sp.h - 1);
  const _h293 = (sp.w - 1);
  const _a274 = sp.cells;
  for (let _i275 = 0; _i275 < _a274.length; _i275++) {
    const v_a = _a274[_i275];
    const _h276 = clueAt(cl.arrow, v_a);
    const _h282 = ((v_a / sp.w) | 0);
    const _h283 = (_h282 > 0);
    const _h285 = (_h282 < _h284);
    const _h286 = (_h283 && _h285);
    const _h287 = (_h282 === 0);
    const _h288 = (_h282 === _h284);
    const _h289 = (_h287 || _h288);
    const _h290 = (v_a % sp.w);
    const _h291 = (_h290 > 0);
    const _h292 = (_h289 && _h291);
    const _h294 = (_h290 < _h293);
    const _h295 = (_h292 && _h294);
    const _h296 = (_h290 === 0);
    const _h297 = (_h290 === _h293);
    const _h298 = (_h296 || _h297);
    const _h299 = (_h289 && _h298);
    L277: {
      const v_n = _h276;
      if (!((v_n !== -1))) break L277;
      facts.length = 0;
      changed = false;
      let _q278 = true;
      Q279: {
        const _a280 = sp.cells;
        for (let _i281 = 0; _i281 < _a280.length; _i281++) {
          const v_p = _a280[_i281];
          if (!((b.has(v_p, v_n) && !((((_h286 && (((v_p / sp.w) | 0) === _h282)) || (_h295 && ((v_p % sp.w) === _h290))) || (_h299 && (Math.abs(((v_p % sp.w) - _h290)) === Math.abs((((v_p / sp.w) | 0) - _h282))))))))) continue;
          if (b.has(v_p, v_n)) { if (fire === null) { b.strikeAt(v_p, v_n); changed = true; } else facts.push(STRIKE, v_p, v_n); }
          if (!(true)) {
            _q278 = false;
            break Q279;
          }
        }
      }
      if (!(_q278)) return -1;
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
  const _t305 = cl.top;
  for (let v_n = 1; v_n <= _t305; v_n++) {
    let _g306 = 0;
    G307: {
      const _a308 = cellsValued(b, sp.cells, v_n);
      for (let _i309 = 0; _i309 < _a308.length; _i309++) {
        const v_x = _a308[_i309];
        const _h310 = (b.grid[v_x] || -1);
        if (!((_h310 === v_n))) continue;
        _g306++;
      }
    }
    if (!(!((_g306 > 0)))) continue;
    const _h315 = (v_n > 1);
    const _h320 = (v_n - 1);
    const _h322 = (v_n < cl.top);
    const _h327 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q311 = true;
    Q312: {
      const _a313 = sp.cells;
      for (let _i314 = 0; _i314 < _a313.length; _i314++) {
        const v_c = _a313[_i314];
        let _c330: boolean = b.has(v_c, v_n);
        if (_c330) {
          let _c321: boolean = _h315;
          if (_c321) {
            let _q316 = false;
            Q317: {
              const _a318 = nbr(sp, cl, v_c);
              for (let _i319 = 0; _i319 < _a318.length; _i319++) {
                const v_p = _a318[_i319];
                if (b.has(v_p, _h320)) {
                  _q316 = true;
                  break Q317;
                }
              }
            }
            _c321 = !(_q316);
          }
          let _c329: boolean = _c321;
          if (!_c329) {
            let _c328: boolean = _h322;
            if (_c328) {
              let _q323 = false;
              Q324: {
                const _a325 = nbr(sp, cl, v_c);
                for (let _i326 = 0; _i326 < _a325.length; _i326++) {
                  const v_p = _a325[_i326];
                  if (b.has(v_p, _h327)) {
                    _q323 = true;
                    break Q324;
                  }
                }
              }
              _c328 = !(_q323);
            }
            _c329 = _c328;
          }
          _c330 = _c329;
        }
        if (!(_c330)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q311 = false;
          break Q312;
        }
      }
    }
    if (!(_q311)) return -1;
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

/** `nbr(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function nbr(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = nbrKept.board(cl);
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
