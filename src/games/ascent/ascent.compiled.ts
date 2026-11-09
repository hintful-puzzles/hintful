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
export type LadderId = "onlySquare" | "nextTo" | "reach" | "overlap" | "onlyNumberNear" | "onlyNumber" | "onLine" | "overlapEdges";

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
  const _h293 = (sp.h - 1);
  const _h294 = (sp.w - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;
  }
  let _q251 = true;
  Q252: {
    const _a253 = sp.cells;
    for (let _i254 = 0; _i254 < _a253.length; _i254++) {
      const v_c = _a253[_i254];
      const _h255 = (g[v_c] || -1);
      if (!((_h255 < cl.top))) continue;
      const _h261 = (_h255 + 1);
      let _q256 = false;
      Q257: {
        const _a258 = nbr(sp, cl, v_c);
        for (let _i259 = 0; _i259 < _a258.length; _i259++) {
          const v_p = _a258[_i259];
          const _h260 = (g[v_p] || -1);
          if ((_h260 === _h261)) {
            _q256 = true;
            break Q257;
          }
        }
      }
      if (!(_q256)) {
        _q251 = false;
        break Q252;
      }
    }
  }
  if (!(_q251)) return false;
  let _q262 = true;
  Q263: {
    const _a264 = sp.cells;
    for (let _i265 = 0; _i265 < _a264.length; _i265++) {
      const v_c = _a264[_i265];
      const _h266 = (g[v_c] || -1);
      if (!((_h266 <= cl.top))) continue;
      let _g267 = 0;
      G268: {
        const _a269 = sp.cells;
        for (let _i270 = 0; _i270 < _a269.length; _i270++) {
          const v_x = _a269[_i270];
          const _h271 = (g[v_x] || -1);
          if (!((_h271 === _h266))) continue;
          _g267++;
        }
      }
      if (!((_g267 === 1))) {
        _q262 = false;
        break Q263;
      }
    }
  }
  if (!(_q262)) return false;
  let _g272 = 0;
  G273: {
    const _a274 = cluesValued(cl.wall, -1);
    for (let _i275 = 0; _i275 < _a274.length; _i275++) {
      const v_x = _a274[_i275];
      const _h276 = clueAt(cl.wall, v_x);
      const _h277 = clueAt(cl.arrow, v_x);
      if (!(((_h276 === -1) && (_h277 === -1)))) continue;
      _g272++;
    }
  }
  if (!((cl.top === _g272))) return false;
  for (let _k278 = 0; _k278 < cl.number.at.length; _k278++) {
    const _at279 = cl.number.at[_k278];
    const _v280 = cl.number.v[_k278];
    if (!(((g[_at279] || -1) === _v280))) return false;
  }
  for (let _k281 = 0; _k281 < cl.wall.at.length; _k281++) {
    const _at282 = cl.wall.at[_k281];
    if (!(((g[_at282] || -1) === (cl.top + 1)))) return false;
  }
  for (let _k284 = 0; _k284 < cl.arrow.at.length; _k284++) {
    const _at285 = cl.arrow.at[_k284];
    const _v286 = cl.arrow.v[_k284];
    let _c297: boolean = ((g[_at285] || -1) === (cl.top + 1));
    if (_c297) {
      let _q287 = false;
      Q288: {
        const _a289 = cluesValued(cl.wall, -1);
        for (let _i290 = 0; _i290 < _a289.length; _i290++) {
          const v_p = _a289[_i290];
          const _h291 = clueAt(cl.wall, v_p);
          const _h292 = clueAt(cl.arrow, v_p);
          let _c295: boolean = ((_h291 === -1) && (_h292 === -1));
          if (_c295) {
            _c295 = (((((((_at285 / sp.w) | 0) > 0) && (((_at285 / sp.w) | 0) < _h293)) && (((v_p / sp.w) | 0) === ((_at285 / sp.w) | 0))) || (((((((_at285 / sp.w) | 0) === 0) || (((_at285 / sp.w) | 0) === _h293)) && ((_at285 % sp.w) > 0)) && ((_at285 % sp.w) < _h294)) && ((v_p % sp.w) === (_at285 % sp.w)))) || ((((((_at285 / sp.w) | 0) === 0) || (((_at285 / sp.w) | 0) === _h293)) && (((_at285 % sp.w) === 0) || ((_at285 % sp.w) === _h294))) && (Math.abs(((v_p % sp.w) - (_at285 % sp.w))) === Math.abs((((v_p / sp.w) | 0) - ((_at285 / sp.w) | 0))))));
          }
          if (!(_c295)) continue;
          const _h296 = (g[v_p] || -1);
          if ((_h296 === _v286)) {
            _q287 = true;
            break Q288;
          }
        }
      }
      _c297 = _q287;
    }
    if (!(_c297)) return false;
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

export interface OverlapBinding {
  n: number;
}

const overlapFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function overlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverlapBinding> | null): number {
  const facts = overlapFacts;
  let fired = 0;
  let changed = false;
  const _t117 = cl.top;
  for (let v_n = 1; v_n <= _t117; v_n++) {
    let _g118 = 0;
    G119: {
      const _a120 = cellsValued(b, sp.cells, v_n);
      for (let _i121 = 0; _i121 < _a120.length; _i121++) {
        const v_x = _a120[_i121];
        const _h122 = (b.grid[v_x] || -1);
        if (!((_h122 === v_n))) continue;
        _g118++;
      }
    }
    if (!(!((_g118 > 0)))) continue;
    const _h127 = (v_n > 1);
    const _h138 = (v_n - 1);
    const _h140 = (v_n < cl.top);
    const _h145 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q123 = true;
    Q124: {
      const _a125 = sp.cells;
      for (let _i126 = 0; _i126 < _a125.length; _i126++) {
        const v_c = _a125[_i126];
        let _c148: boolean = b.has(v_c, v_n);
        if (_c148) {
          let _c139: boolean = _h127;
          if (_c139) {
            let _q128 = false;
            Q129: {
              const _a136 = nbr(sp, cl, v_c);
              for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                const v_p = _a136[_i137];
                if (b.has(v_p, _h138)) {
                  _q128 = true;
                  break Q129;
                }
              }
            }
            _c139 = !(_q128);
          }
          let _c147: boolean = _c139;
          if (!_c147) {
            let _c146: boolean = _h140;
            if (_c146) {
              let _q141 = false;
              Q142: {
                const _a143 = nbr(sp, cl, v_c);
                for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                  const v_p = _a143[_i144];
                  if (b.has(v_p, _h145)) {
                    _q141 = true;
                    break Q142;
                  }
                }
              }
              _c146 = !(_q141);
            }
            _c147 = _c146;
          }
          _c148 = _c147;
        }
        if (!(_c148)) continue;
        if (b.has(v_c, v_n)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
        if (!(true)) {
          _q123 = false;
          break Q124;
        }
      }
    }
    if (!(_q123)) return -1;
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
  const _a165 = sp.cells;
  for (let _i166 = 0; _i166 < _a165.length; _i166++) {
    const v_c = _a165[_i166];
    const _h167 = clueAt(cl.wall, v_c);
    const _h168 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h167 === -1) && (_h168 === -1))) && (b.candCount(v_c) === 1)))) continue;
    L169: {
      const v_n = b.candFirst(v_c);
      let _c175: boolean = (v_n > 1);
      if (_c175) {
        const _t170 = (v_n - 1);
        let _g171 = 0;
        G172: {
          const _a173 = cellsValued(b, sp.cells, _t170);
          for (let _i174 = 0; _i174 < _a173.length; _i174++) {
            const v_x = _a173[_i174];
            if (!(((b.grid[v_x] || -1) === _t170))) continue;
            _g171++;
          }
        }
        _c175 = (_g171 > 0);
      }
      let _c182: boolean = _c175;
      if (!_c182) {
        let _c181: boolean = (v_n < cl.top);
        if (_c181) {
          const _t176 = (v_n + 1);
          let _g177 = 0;
          G178: {
            const _a179 = cellsValued(b, sp.cells, _t176);
            for (let _i180 = 0; _i180 < _a179.length; _i180++) {
              const v_x = _a179[_i180];
              if (!(((b.grid[v_x] || -1) === _t176))) continue;
              _g177++;
            }
          }
          _c181 = (_g177 > 0);
        }
        _c182 = _c181;
      }
      if (!(_c182)) break L169;
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
  const _a185 = sp.cells;
  for (let _i186 = 0; _i186 < _a185.length; _i186++) {
    const v_c = _a185[_i186];
    const _h187 = clueAt(cl.wall, v_c);
    const _h188 = clueAt(cl.arrow, v_c);
    if (!(((!((b.grid[v_c] !== 0)) && ((_h187 === -1) && (_h188 === -1))) && (b.candCount(v_c) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c190: boolean = (b.candCount(v_c) === 1);
    if (_c190) {
      const _t189 = b.candFirst(v_c);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t189); changed = true; } else facts.push(PLACE, v_c, _t189); }
      _c190 = true;
    }
    if (!(_c190)) return -1;
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
  const _h204 = (sp.h - 1);
  const _h213 = (sp.w - 1);
  const _a194 = sp.cells;
  for (let _i195 = 0; _i195 < _a194.length; _i195++) {
    const v_a = _a194[_i195];
    const _h196 = clueAt(cl.arrow, v_a);
    const _h202 = ((v_a / sp.w) | 0);
    const _h203 = (_h202 > 0);
    const _h205 = (_h202 < _h204);
    const _h206 = (_h203 && _h205);
    const _h207 = (_h202 === 0);
    const _h208 = (_h202 === _h204);
    const _h209 = (_h207 || _h208);
    const _h210 = (v_a % sp.w);
    const _h211 = (_h210 > 0);
    const _h212 = (_h209 && _h211);
    const _h214 = (_h210 < _h213);
    const _h215 = (_h212 && _h214);
    const _h216 = (_h210 === 0);
    const _h217 = (_h210 === _h213);
    const _h218 = (_h216 || _h217);
    const _h219 = (_h209 && _h218);
    L197: {
      const v_n = _h196;
      if (!((v_n !== -1))) break L197;
      facts.length = 0;
      changed = false;
      let _q198 = true;
      Q199: {
        const _a200 = sp.cells;
        for (let _i201 = 0; _i201 < _a200.length; _i201++) {
          const v_p = _a200[_i201];
          if (!((b.has(v_p, v_n) && !((((_h206 && (((v_p / sp.w) | 0) === _h202)) || (_h215 && ((v_p % sp.w) === _h210))) || (_h219 && (Math.abs(((v_p % sp.w) - _h210)) === Math.abs((((v_p / sp.w) | 0) - _h202))))))))) continue;
          if (b.has(v_p, v_n)) { if (fire === null) { b.strikeAt(v_p, v_n); changed = true; } else facts.push(STRIKE, v_p, v_n); }
          if (!(true)) {
            _q198 = false;
            break Q199;
          }
        }
      }
      if (!(_q198)) return -1;
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
  const _t225 = cl.top;
  for (let v_n = 1; v_n <= _t225; v_n++) {
    let _g226 = 0;
    G227: {
      const _a228 = cellsValued(b, sp.cells, v_n);
      for (let _i229 = 0; _i229 < _a228.length; _i229++) {
        const v_x = _a228[_i229];
        const _h230 = (b.grid[v_x] || -1);
        if (!((_h230 === v_n))) continue;
        _g226++;
      }
    }
    if (!(!((_g226 > 0)))) continue;
    const _h235 = (v_n > 1);
    const _h240 = (v_n - 1);
    const _h242 = (v_n < cl.top);
    const _h247 = (v_n + 1);
    facts.length = 0;
    changed = false;
    let _q231 = true;
    Q232: {
      const _a233 = sp.cells;
      for (let _i234 = 0; _i234 < _a233.length; _i234++) {
        const v_c = _a233[_i234];
        let _c250: boolean = b.has(v_c, v_n);
        if (_c250) {
          let _c241: boolean = _h235;
          if (_c241) {
            let _q236 = false;
            Q237: {
              const _a238 = nbr(sp, cl, v_c);
              for (let _i239 = 0; _i239 < _a238.length; _i239++) {
                const v_p = _a238[_i239];
                if (b.has(v_p, _h240)) {
                  _q236 = true;
                  break Q237;
                }
              }
            }
            _c241 = !(_q236);
          }
          let _c249: boolean = _c241;
          if (!_c249) {
            let _c248: boolean = _h242;
            if (_c248) {
              let _q243 = false;
              Q244: {
                const _a245 = nbr(sp, cl, v_c);
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
          _q231 = false;
          break Q232;
        }
      }
    }
    if (!(_q231)) return -1;
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
  const _g130: number[] = [];
  G131: {
    const _a134 = sp.adj8[v_c];
    for (let _i135 = 0; _i135 < _a134.length; _i135++) {
      const v_p = _a134[_i135];
      if (!((((cl.moves === 2) || ((cl.moves === 0) && (sp.adj4[v_c].includes(v_p)))) || ((cl.moves === 1) && (((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))))) continue;
      _g130.push(v_p);
    }
  }
  const _made = _g130;
  _kept[v_c] = _made;
  return _made;
}
