// Compiled by `npm run describe` from src/games/dominosa/dominosa.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, edgeGroups, keptStore, minus, popcount, rangeMask, setOf, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  n: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "onlySpot" | "squareOnly" | "squareSingleDomino" | "mustOverlap" | "localDuplicate" | "localDuplicate2" | "parity" | "set" | "setDoubles";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "placed" },
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
  { id: "onlySpot", tier: 0 },
  { id: "squareOnly", tier: 0 },
  { id: "squareSingleDomino", tier: 1 },
  { id: "mustOverlap", tier: 1 },
  { id: "localDuplicate", tier: 1 },
  { id: "localDuplicate2", tier: 1 },
  { id: "parity", tier: 1 },
  { id: "set", tier: 2 },
  { id: "setDoubles", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q729 = true;
  Q730: {
    const _a731 = sp.cells;
    for (let _i732 = 0; _i732 < _a731.length; _i732++) {
      const v_c = _a731[_i732];
      let _g733 = 0;
      G734: {
        const _a735 = sp.adj4[v_c];
        for (let _i736 = 0; _i736 < _a735.length; _i736++) {
          const _h737 = (g[sp.adj4Edges[v_c][_i736]] || -1);
          if (!((_h737 === 1))) continue;
          _g733++;
        }
      }
      if (!((_g733 === 1))) {
        _q729 = false;
        break Q730;
      }
    }
  }
  if (!(_q729)) return false;
  let _q738 = true;
  Q739: {
    const _a740 = sp.edges;
    for (let _i741 = 0; _i741 < _a740.length; _i741++) {
      const v_e = _a740[_i741];
      const _h744 = (g[v_e] || -1);
      const _h745 = (_h744 === 1);
      const _h747 = sp.edgeEnds[2 * v_e];
      const _h748 = clueAt(cl.number, _h747);
      const _h749 = _h748;
      const _h752 = sp.edgeEnds[2 * v_e + 1];
      const _h753 = clueAt(cl.number, _h752);
      const _h754 = _h753;
      const _a742 = sp.edges;
      for (let _i743 = 0; _i743 < _a742.length; _i743++) {
        const v_f = _a742[_i743];
        const _h746 = (g[v_f] || -1);
        if (!((((v_f !== v_e) && _h745) && (_h746 === 1)))) continue;
        const _t750 = sp.edgeEnds[2 * v_f];
        const _h751 = clueAt(cl.number, _t750);
        let _c757: boolean = (_h749 === _h751);
        if (_c757) {
          const _t755 = sp.edgeEnds[2 * v_f + 1];
          const _h756 = clueAt(cl.number, _t755);
          _c757 = (_h754 === _h756);
        }
        let _c763: boolean = _c757;
        if (!_c763) {
          const _t758 = sp.edgeEnds[2 * v_f + 1];
          const _h759 = clueAt(cl.number, _t758);
          let _c762: boolean = (_h749 === _h759);
          if (_c762) {
            const _t760 = sp.edgeEnds[2 * v_f];
            const _h761 = clueAt(cl.number, _t760);
            _c762 = (_h754 === _h761);
          }
          _c763 = _c762;
        }
        if (!(!(_c763))) {
          _q738 = false;
          break Q739;
        }
      }
    }
  }
  if (!(_q738)) return false;
  for (let _k764 = 0; _k764 < cl.number.at.length; _k764++) {
    const _at765 = cl.number.at[_k764];
    let _q767 = true;
    Q768: {
      const _a769 = sp.adj4[_at765];
      for (let _i770 = 0; _i770 < _a769.length; _i770++) {
        let _q771 = false;
        Q772: {
          const _a773 = sp.edges;
          for (let _i774 = 0; _i774 < _a773.length; _i774++) {
            const v_f = _a773[_i774];
            const _h775 = (g[v_f] || -1);
            if (!((_h775 === 1))) continue;
            const _t776 = sp.adj4Edges[_at765][_i770];
            const _t777 = sp.edgeEnds[2 * _t776];
            const _h778 = clueAt(cl.number, _t777);
            const _t779 = sp.edgeEnds[2 * v_f];
            const _h780 = clueAt(cl.number, _t779);
            let _c785: boolean = (_h778 === _h780);
            if (_c785) {
              const _t781 = sp.edgeEnds[2 * _t776 + 1];
              const _h782 = clueAt(cl.number, _t781);
              const _t783 = sp.edgeEnds[2 * v_f + 1];
              const _h784 = clueAt(cl.number, _t783);
              _c785 = (_h782 === _h784);
            }
            let _c795: boolean = _c785;
            if (!_c795) {
              const _t786 = sp.edgeEnds[2 * _t776];
              const _h787 = clueAt(cl.number, _t786);
              const _t788 = sp.edgeEnds[2 * v_f + 1];
              const _h789 = clueAt(cl.number, _t788);
              let _c794: boolean = (_h787 === _h789);
              if (_c794) {
                const _t790 = sp.edgeEnds[2 * _t776 + 1];
                const _h791 = clueAt(cl.number, _t790);
                const _t792 = sp.edgeEnds[2 * v_f];
                const _h793 = clueAt(cl.number, _t792);
                _c794 = (_h791 === _h793);
              }
              _c795 = _c794;
            }
            if (_c795) {
              _q771 = true;
              break Q772;
            }
          }
        }
        if (!(_q771)) {
          _q767 = false;
          break Q768;
        }
      }
    }
    if (!(_q767)) return false;
  }
  return true;
}

export interface PlacedBinding {
  e: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function placed(b: Marks, sp: GridSpace, cl: Dealt, v_e: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h14 = sp.edgeEnds[2 * v_e];
  const _h15 = clueAt(cl.number, _h14);
  const _h16 = _h15;
  const _h19 = sp.edgeEnds[2 * v_e + 1];
  const _h20 = clueAt(cl.number, _h19);
  const _h21 = _h20;
  if (!(((b.grid[v_e] || -1) === 1))) return 0;
  facts.length = 0;
  changed = false;
  let _q3 = true;
  Q4: {
    const _a5 = setOf(sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_x = _a5[_i6];
      const _a7 = sp.adj4[v_x];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        if (!((sp.adj4Edges[v_x][_i8] !== v_e))) continue;
        const _t9 = sp.adj4Edges[v_x][_i8];
        if (!(b.grid[_t9] !== 0)) { if (fire === null) { b.placeAt(_t9, 2); changed = true; } else facts.push(PLACE, _t9, 2); }
        if (!(true)) {
          _q3 = false;
          break Q4;
        }
      }
    }
  }
  let _c32: boolean = _q3;
  if (_c32) {
    let _q10 = true;
    Q11: {
      const _a12 = sp.edges;
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_f = _a12[_i13];
        let _c31: boolean = (v_f !== v_e);
        if (_c31) {
          const _t17 = sp.edgeEnds[2 * v_f];
          const _h18 = clueAt(cl.number, _t17);
          let _c24: boolean = (_h16 === _h18);
          if (_c24) {
            const _t22 = sp.edgeEnds[2 * v_f + 1];
            const _h23 = clueAt(cl.number, _t22);
            _c24 = (_h21 === _h23);
          }
          let _c30: boolean = _c24;
          if (!_c30) {
            const _t25 = sp.edgeEnds[2 * v_f + 1];
            const _h26 = clueAt(cl.number, _t25);
            let _c29: boolean = (_h16 === _h26);
            if (_c29) {
              const _t27 = sp.edgeEnds[2 * v_f];
              const _h28 = clueAt(cl.number, _t27);
              _c29 = (_h21 === _h28);
            }
            _c30 = _c29;
          }
          _c31 = _c30;
        }
        if (!(_c31)) continue;
        if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
        if (!(true)) {
          _q10 = false;
          break Q11;
        }
      }
    }
    _c32 = _q10;
  }
  if (!(_c32)) return -1;
  if (changed || facts.length > 0) {
    fired = 1;
    if (fire !== null) fire({ e: v_e }, facts);
  }
  return fired;
}

export interface OnlySpotBinding {
  a: number;
  b: number;
  P: readonly number[];
  e: number;
}

const onlySpotFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function onlySpot(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlySpotBinding> | null): number {
  const _g56: number[] = [];
  const facts = onlySpotFacts;
  let fired = 0;
  let changed = false;
  const _t54 = cl.n;
  for (let v_a = 0; v_a <= _t54; v_a++) {
    const _t55 = cl.n;
    for (let v_b = v_a; v_b <= _t55; v_b++) {
      _g56.length = 0;
      G57: {
        const _a62 = showing(sp, cl, v_a);
        for (let _i63 = 0; _i63 < _a62.length; _i63++) {
          const v_x = _a62[_i63];
          const _a64 = sp.adj4[v_x];
          for (let _i65 = 0; _i65 < _a64.length; _i65++) {
            const v_y = _a64[_i65];
            const _h66 = clueAt(cl.number, v_y);
            if (!(((_h66 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i65]] || -1) !== 2)))) continue;
            const _t67 = sp.adj4Edges[v_x][_i65];
            if (!_g56.includes(_t67)) _g56.push(_t67);
          }
        }
      }
      L68: {
        const v_P = _g56;
        const _h69 = v_P.length;
        if (!((_h69 === 1))) break L68;
        L70: {
          const v_e = (v_P[0] ?? -1);
          if (!(!((b.grid[v_e] !== 0)))) break L70;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, b: v_b, P: v_P, e: v_e }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface SquareOnlyBinding {
  c: number;
  S: readonly number[];
}

const squareOnlyFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function squareOnly(b: Marks, sp: GridSpace, fire: Fire<SquareOnlyBinding> | null): number {
  const _g88: number[] = [];
  const facts = squareOnlyFacts;
  let fired = 0;
  let changed = false;
  const _a86 = sp.cells;
  for (let _i87 = 0; _i87 < _a86.length; _i87++) {
    const v_c = _a86[_i87];
    _g88.length = 0;
    G89: {
      const _a92 = sp.adj4[v_c];
      for (let _i93 = 0; _i93 < _a92.length; _i93++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i93]] || -1) !== 2))) continue;
        const _t94 = sp.adj4Edges[v_c][_i93];
        if (!_g88.includes(_t94)) _g88.push(_t94);
      }
    }
    L95: {
      const v_S = _g88;
      const _h96 = v_S.length;
      let _c101: boolean = (_h96 <= 1);
      if (_c101) {
        let _q97 = false;
        Q98: {
          const _a99 = v_S;
          for (let _i100 = 0; _i100 < _a99.length; _i100++) {
            const v_f = _a99[_i100];
            if ((b.grid[v_f] !== 0)) {
              _q97 = true;
              break Q98;
            }
          }
        }
        _c101 = !(_q97);
      }
      if (!(_c101)) break L95;
      facts.length = 0;
      changed = false;
      let _c103: boolean = (_h96 === 1);
      if (_c103) {
        const _t102 = (v_S[0] ?? -1);
        if (!(b.grid[_t102] !== 0)) { if (fire === null) { b.placeAt(_t102, 1); changed = true; } else facts.push(PLACE, _t102, 1); }
        _c103 = true;
      }
      if (!(_c103)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, S: v_S }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SquareSingleDominoBinding {
  c: number;
  S: readonly number[];
  s: number;
}

const squareSingleDominoFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function squareSingleDomino(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareSingleDominoBinding> | null): number {
  const _g132: number[] = [];
  const facts = squareSingleDominoFacts;
  let fired = 0;
  let changed = false;
  const _a130 = sp.cells;
  for (let _i131 = 0; _i131 < _a130.length; _i131++) {
    const v_c = _a130[_i131];
    _g132.length = 0;
    G133: {
      const _a136 = sp.adj4[v_c];
      for (let _i137 = 0; _i137 < _a136.length; _i137++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i137]] || -1) !== 2))) continue;
        const _t138 = sp.adj4Edges[v_c][_i137];
        if (!_g132.includes(_t138)) _g132.push(_t138);
      }
    }
    L139: {
      const v_S = _g132;
      const _h140 = v_S.length;
      if (!((_h140 >= 2))) break L139;
      L141: {
        const v_s = (v_S[0] ?? -1);
        const _h148 = sp.edgeEnds[2 * v_s];
        const _h149 = clueAt(cl.number, _h148);
        const _h150 = _h149;
        const _h153 = sp.edgeEnds[2 * v_s + 1];
        const _h154 = clueAt(cl.number, _h153);
        const _h155 = _h154;
        let _q142 = true;
        Q143: {
          const _a144 = v_S;
          for (let _i145 = 0; _i145 < _a144.length; _i145++) {
            const v_f = _a144[_i145];
            const _t146 = sp.edgeEnds[2 * v_f];
            const _h147 = clueAt(cl.number, _t146);
            let _c156: boolean = (_h147 === _h150);
            if (_c156) {
              const _t151 = sp.edgeEnds[2 * v_f + 1];
              const _h152 = clueAt(cl.number, _t151);
              _c156 = (_h152 === _h155);
            }
            let _c162: boolean = _c156;
            if (!_c162) {
              const _t157 = sp.edgeEnds[2 * v_f];
              const _h158 = clueAt(cl.number, _t157);
              let _c161: boolean = (_h158 === _h155);
              if (_c161) {
                const _t159 = sp.edgeEnds[2 * v_f + 1];
                const _h160 = clueAt(cl.number, _t159);
                _c161 = (_h160 === _h150);
              }
              _c162 = _c161;
            }
            if (!(_c162)) {
              _q142 = false;
              break Q143;
            }
          }
        }
        if (!(_q142)) break L141;
        facts.length = 0;
        changed = false;
        let _q163 = true;
        Q164: {
          const _a165 = sp.edges;
          for (let _i166 = 0; _i166 < _a165.length; _i166++) {
            const v_f = _a165[_i166];
            let _c178: boolean = (!(v_S.includes(v_f)) && ((b.grid[v_f] || -1) !== 2));
            if (_c178) {
              const _t167 = sp.edgeEnds[2 * v_f];
              const _h168 = clueAt(cl.number, _t167);
              let _c171: boolean = (_h168 === _h150);
              if (_c171) {
                const _t169 = sp.edgeEnds[2 * v_f + 1];
                const _h170 = clueAt(cl.number, _t169);
                _c171 = (_h170 === _h155);
              }
              let _c177: boolean = _c171;
              if (!_c177) {
                const _t172 = sp.edgeEnds[2 * v_f];
                const _h173 = clueAt(cl.number, _t172);
                let _c176: boolean = (_h173 === _h155);
                if (_c176) {
                  const _t174 = sp.edgeEnds[2 * v_f + 1];
                  const _h175 = clueAt(cl.number, _t174);
                  _c176 = (_h175 === _h150);
                }
                _c177 = _c176;
              }
              _c178 = _c177;
            }
            if (!(_c178)) continue;
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
            if (!(true)) {
              _q163 = false;
              break Q164;
            }
          }
        }
        if (!(_q163)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, S: v_S, s: v_s }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface MustOverlapBinding {
  a: number;
  b: number;
  P: readonly number[];
  e: number;
}

const mustOverlapFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function mustOverlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustOverlapBinding> | null): number {
  const _g195: number[] = [];
  const facts = mustOverlapFacts;
  let fired = 0;
  let changed = false;
  const _t193 = cl.n;
  for (let v_a = 0; v_a <= _t193; v_a++) {
    const _t194 = cl.n;
    for (let v_b = v_a; v_b <= _t194; v_b++) {
      _g195.length = 0;
      G196: {
        const _a201 = showing(sp, cl, v_a);
        for (let _i202 = 0; _i202 < _a201.length; _i202++) {
          const v_x = _a201[_i202];
          const _a203 = sp.adj4[v_x];
          for (let _i204 = 0; _i204 < _a203.length; _i204++) {
            const v_y = _a203[_i204];
            const _h205 = clueAt(cl.number, v_y);
            if (!(((_h205 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i204]] || -1) !== 2)))) continue;
            const _t206 = sp.adj4Edges[v_x][_i204];
            if (!_g195.includes(_t206)) _g195.push(_t206);
          }
        }
      }
      L207: {
        const v_P = _g195;
        const _h208 = v_P.length;
        if (!((_h208 >= 2))) break L207;
        const v_e = (v_P[0] ?? -1);
        facts.length = 0;
        changed = false;
        let _q209 = true;
        Q210: {
          const _a211 = setOf(sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]);
          for (let _i212 = 0; _i212 < _a211.length; _i212++) {
            const v_x = _a211[_i212];
            const _a213 = sp.adj4[v_x];
            for (let _i214 = 0; _i214 < _a213.length; _i214++) {
              const _h219 = sp.adj4Edges[v_x][_i214];
              const _h220 = sp.edgeEnds[2 * _h219];
              const _h221 = sp.edgeEnds[2 * _h219 + 1];
              let _c222: boolean = (!(v_P.includes(sp.adj4Edges[v_x][_i214])) && ((b.grid[sp.adj4Edges[v_x][_i214]] || -1) !== 2));
              if (_c222) {
                let _q215 = true;
                Q216: {
                  const _a217 = v_P;
                  for (let _i218 = 0; _i218 < _a217.length; _i218++) {
                    const v_f = _a217[_i218];
                    if (!(((((sp.edgeEnds[2 * v_f] === _h220) || (sp.edgeEnds[2 * v_f] === _h221)) || (sp.edgeEnds[2 * v_f + 1] === _h220)) || (sp.edgeEnds[2 * v_f + 1] === _h221)))) {
                      _q215 = false;
                      break Q216;
                    }
                  }
                }
                _c222 = _q215;
              }
              if (!(_c222)) continue;
              const _t223 = sp.adj4Edges[v_x][_i214];
              if (!(b.grid[_t223] !== 0)) { if (fire === null) { b.placeAt(_t223, 2); changed = true; } else facts.push(PLACE, _t223, 2); }
              if (!(true)) {
                _q209 = false;
                break Q210;
              }
            }
          }
        }
        if (!(_q209)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, P: v_P, e: v_e }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface LocalDuplicateBinding {
  p: number;
  x: number;
  y: number;
  q: number;
}

const localDuplicateFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function localDuplicate(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicateBinding> | null): number {
  const _g265: number[] = [];
  const facts = localDuplicateFacts;
  let fired = 0;
  let changed = false;
  const _a256 = sp.edges;
  for (let _i257 = 0; _i257 < _a256.length; _i257++) {
    const v_p = _a256[_i257];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h278 = sp.edgeEnds[2 * v_p];
    const _h279 = clueAt(cl.number, _h278);
    const _h280 = _h279;
    const _h283 = sp.edgeEnds[2 * v_p + 1];
    const _h284 = clueAt(cl.number, _h283);
    const _h285 = _h284;
    const _a258 = setOf(sp.edgeEnds[2 * v_p], sp.edgeEnds[2 * v_p + 1]);
    for (let _i259 = 0; _i259 < _a258.length; _i259++) {
      const v_x = _a258[_i259];
      const _a260 = sp.adj4[v_x];
      for (let _i261 = 0; _i261 < _a260.length; _i261++) {
        const v_y = _a260[_i261];
        L262: {
          const v_q = sp.adj4Edges[v_x][_i261];
          let _c293: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
          if (_c293) {
            let _q263 = true;
            Q264: {
              _g265.length = 0;
              G266: {
                const _a271 = sp.adj4[v_y];
                for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                  if (!(((b.grid[sp.adj4Edges[v_y][_i272]] || -1) !== 2))) continue;
                  const _t273 = sp.adj4Edges[v_y][_i272];
                  if (!_g265.includes(_t273)) _g265.push(_t273);
                }
              }
              const _a274 = _g265;
              for (let _i275 = 0; _i275 < _a274.length; _i275++) {
                const v_r = _a274[_i275];
                if (!((v_r !== v_q))) continue;
                const _t276 = sp.edgeEnds[2 * v_r];
                const _h277 = clueAt(cl.number, _t276);
                let _c286: boolean = (_h277 === _h280);
                if (_c286) {
                  const _t281 = sp.edgeEnds[2 * v_r + 1];
                  const _h282 = clueAt(cl.number, _t281);
                  _c286 = (_h282 === _h285);
                }
                let _c292: boolean = _c286;
                if (!_c292) {
                  const _t287 = sp.edgeEnds[2 * v_r];
                  const _h288 = clueAt(cl.number, _t287);
                  let _c291: boolean = (_h288 === _h285);
                  if (_c291) {
                    const _t289 = sp.edgeEnds[2 * v_r + 1];
                    const _h290 = clueAt(cl.number, _t289);
                    _c291 = (_h290 === _h280);
                  }
                  _c292 = _c291;
                }
                if (!(_c292)) {
                  _q263 = false;
                  break Q264;
                }
              }
            }
            _c293 = _q263;
          }
          if (!(_c293)) break L262;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ p: v_p, x: v_x, y: v_y, q: v_q }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LocalDuplicate2Binding {
  p: number;
  x: number;
  y: number;
  q: number;
  R: readonly number[];
  d: number;
  x2: number;
  z: number;
  q2: number;
  S: readonly number[];
}

const localDuplicate2Facts: number[] = [];

/** Its dearest read grows with the board as n. */
export function localDuplicate2(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicate2Binding> | null): number {
  const _g391: number[] = [];
  const _g404: number[] = [];
  const _g446: number[] = [];
  const _g457: number[] = [];
  const facts = localDuplicate2Facts;
  let fired = 0;
  let changed = false;
  const _a384 = sp.edges;
  for (let _i385 = 0; _i385 < _a384.length; _i385++) {
    const v_p = _a384[_i385];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h439 = sp.edgeEnds[2 * v_p];
    const _h440 = sp.edgeEnds[2 * v_p + 1];
    const _a386 = setOf(sp.edgeEnds[2 * v_p], sp.edgeEnds[2 * v_p + 1]);
    for (let _i387 = 0; _i387 < _a386.length; _i387++) {
      const v_x = _a386[_i387];
      const _a388 = sp.adj4[v_x];
      for (let _i389 = 0; _i389 < _a388.length; _i389++) {
        const v_y = _a388[_i389];
        L390: {
          const v_q = sp.adj4Edges[v_x][_i389];
          if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) break L390;
          const _h483 = sp.edgeEnds[2 * v_q];
          const _h484 = sp.edgeEnds[2 * v_q + 1];
          _g391.length = 0;
          G392: {
            _g404.length = 0;
            G405: {
              const _a410 = sp.adj4[v_y];
              for (let _i411 = 0; _i411 < _a410.length; _i411++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i411]] || -1) !== 2))) continue;
                const _t412 = sp.adj4Edges[v_y][_i411];
                if (!_g404.includes(_t412)) _g404.push(_t412);
              }
            }
            const _a413 = _g404;
            for (let _i414 = 0; _i414 < _a413.length; _i414++) {
              const v_r = _a413[_i414];
              if (!((v_r !== v_q))) continue;
              _g391.push(v_r);
            }
          }
          L415: {
            const v_R = _g391;
            const _h416 = v_R.length;
            if (!((_h416 >= 1))) break L415;
            L417: {
              const v_d = (v_R[0] ?? -1);
              const _h424 = sp.edgeEnds[2 * v_d];
              const _h425 = clueAt(cl.number, _h424);
              const _h426 = _h425;
              const _h429 = sp.edgeEnds[2 * v_d + 1];
              const _h430 = clueAt(cl.number, _h429);
              const _h431 = _h430;
              let _q418 = true;
              Q419: {
                const _a420 = v_R;
                for (let _i421 = 0; _i421 < _a420.length; _i421++) {
                  const v_r = _a420[_i421];
                  const _t422 = sp.edgeEnds[2 * v_r];
                  const _h423 = clueAt(cl.number, _t422);
                  let _c432: boolean = (_h423 === _h426);
                  if (_c432) {
                    const _t427 = sp.edgeEnds[2 * v_r + 1];
                    const _h428 = clueAt(cl.number, _t427);
                    _c432 = (_h428 === _h431);
                  }
                  let _c438: boolean = _c432;
                  if (!_c438) {
                    const _t433 = sp.edgeEnds[2 * v_r];
                    const _h434 = clueAt(cl.number, _t433);
                    let _c437: boolean = (_h434 === _h431);
                    if (_c437) {
                      const _t435 = sp.edgeEnds[2 * v_r + 1];
                      const _h436 = clueAt(cl.number, _t435);
                      _c437 = (_h436 === _h426);
                    }
                    _c438 = _c437;
                  }
                  if (!(_c438)) {
                    _q418 = false;
                    break Q419;
                  }
                }
              }
              if (!(_q418)) break L417;
              const _a441 = setOf(_h439, _h440);
              for (let _i442 = 0; _i442 < _a441.length; _i442++) {
                const v_x2 = _a441[_i442];
                const _a443 = sp.adj4[v_x2];
                for (let _i444 = 0; _i444 < _a443.length; _i444++) {
                  const v_z = _a443[_i444];
                  L445: {
                    const v_q2 = sp.adj4Edges[v_x2][_i444];
                    if (!((((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)))) break L445;
                    _g446.length = 0;
                    G447: {
                      _g457.length = 0;
                      G458: {
                        const _a461 = sp.adj4[v_z];
                        for (let _i462 = 0; _i462 < _a461.length; _i462++) {
                          if (!(((b.grid[sp.adj4Edges[v_z][_i462]] || -1) !== 2))) continue;
                          const _t463 = sp.adj4Edges[v_z][_i462];
                          if (!_g457.includes(_t463)) _g457.push(_t463);
                        }
                      }
                      const _a464 = _g457;
                      for (let _i465 = 0; _i465 < _a464.length; _i465++) {
                        const v_r = _a464[_i465];
                        if (!((v_r !== v_q2))) continue;
                        _g446.push(v_r);
                      }
                    }
                    L466: {
                      const v_S = _g446;
                      const _h467 = v_S.length;
                      let _c485: boolean = (_h467 >= 1);
                      if (_c485) {
                        let _q468 = true;
                        Q469: {
                          const _a470 = v_S;
                          for (let _i471 = 0; _i471 < _a470.length; _i471++) {
                            const v_r = _a470[_i471];
                            const _t472 = sp.edgeEnds[2 * v_r];
                            const _h473 = clueAt(cl.number, _t472);
                            let _c476: boolean = (_h473 === _h426);
                            if (_c476) {
                              const _t474 = sp.edgeEnds[2 * v_r + 1];
                              const _h475 = clueAt(cl.number, _t474);
                              _c476 = (_h475 === _h431);
                            }
                            let _c482: boolean = _c476;
                            if (!_c482) {
                              const _t477 = sp.edgeEnds[2 * v_r];
                              const _h478 = clueAt(cl.number, _t477);
                              let _c481: boolean = (_h478 === _h431);
                              if (_c481) {
                                const _t479 = sp.edgeEnds[2 * v_r + 1];
                                const _h480 = clueAt(cl.number, _t479);
                                _c481 = (_h480 === _h426);
                              }
                              _c482 = _c481;
                            }
                            if (!((_c482 && !(((((sp.edgeEnds[2 * v_r] === _h483) || (sp.edgeEnds[2 * v_r] === _h484)) || (sp.edgeEnds[2 * v_r + 1] === _h483)) || (sp.edgeEnds[2 * v_r + 1] === _h484)))))) {
                              _q468 = false;
                              break Q469;
                            }
                          }
                        }
                        _c485 = _q468;
                      }
                      if (!(_c485)) break L466;
                      facts.length = 0;
                      changed = false;
                      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                      if (!(true)) return -1;
                      if (changed || facts.length > 0) {
                        fired = 1;
                        if (fire !== null && !fire({ p: v_p, x: v_x, y: v_y, q: v_q, R: v_R, d: v_d, x2: v_x2, z: v_z, q2: v_q2, S: v_S }, facts)) return 1;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface ParityBinding {
  P: readonly number[];
  p: number;
  Q: readonly number[];
  A: readonly number[];
}

const parityFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function parity(b: Marks, sp: GridSpace, fire: Fire<ParityBinding> | null): number {
  const _g502: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  _g502.length = 0;
  G503: {
    const _a506 = sp.edges;
    for (let _i507 = 0; _i507 < _a506.length; _i507++) {
      const v_e = _a506[_i507];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      _g502.push(v_e);
    }
  }
  const v_P = _g502;
  const _a508 = sp.edges;
  for (let _i509 = 0; _i509 < _a508.length; _i509++) {
    const v_p = _a508[_i509];
    const _h514 = sp.edgeEnds[2 * v_p + 1];
    const _h518 = sp.edgeEnds[2 * v_p];
    let _c520: boolean = !((b.grid[v_p] !== 0));
    if (_c520) {
      let _q510 = false;
      Q511: {
        const _a512 = sp.adj4[sp.edgeEnds[2 * v_p]];
        for (let _i513 = 0; _i513 < _a512.length; _i513++) {
          const v_x = _a512[_i513];
          const _h517 = (v_x !== _h514);
          const _h519 = sp.edgeOf(_h518, v_x);
          const _a515 = sp.adj4[_h514];
          for (let _i516 = 0; _i516 < _a515.length; _i516++) {
            const v_y = _a515[_i516];
            if (!(((_h517 && (v_y !== _h518)) && (sp.adj4[v_x].includes(v_y))))) continue;
            if (((((b.grid[_h519] || -1) !== 2) && ((b.grid[sp.adj4Edges[_h514][_i516]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
              _q510 = true;
              break Q511;
            }
          }
        }
      }
      _c520 = !(_q510);
    }
    if (!(_c520)) continue;
    const v_Q = minus(v_P, setOf(v_p));
    const _eg521 = edgeGroups(sp, v_Q);
    const _h524 = _eg521.of(sp.edgeEnds[2 * v_p + 1]).length;
    L522: {
      const v_A = _eg521.of(sp.edgeEnds[2 * v_p]);
      const _h523 = v_A.length;
      if (!(((!(_eg521.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((_h523 % 2) === 0)) && ((_h524 % 2) === 0)))) break L522;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ P: v_P, p: v_p, Q: v_Q, A: v_A }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SetBinding {
  a: number;
  S: readonly number[];
  U: readonly number[];
  T: readonly number[];
  O: number;
}

const setFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function set(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SetBinding> | null): number {
  const _g566: number[] = [];
  const _g583: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  const _t563 = cl.n;
  for (let v_a = 0; v_a <= _t563; v_a++) {
    L564: {
      const v_S = showing(sp, cl, v_a);
      const _h565 = v_S.length;
      if (!((_h565 <= 16))) break L564;
      const _h585 = (_h565 - 2);
      _g566.length = 0;
      G567: {
        const _a574 = v_S;
        for (let _i575 = 0; _i575 < _a574.length; _i575++) {
          const v_c = _a574[_i575];
          let _q576 = false;
          Q577: {
            const _a578 = sp.adj4[v_c];
            for (let _i579 = 0; _i579 < _a578.length; _i579++) {
              if (((b.grid[sp.adj4Edges[v_c][_i579]] || -1) === 1)) {
                _q576 = true;
                break Q577;
              }
            }
          }
          if (!(!(_q576))) continue;
          _g566.push(v_c);
        }
      }
      const v_U = _g566;
      const _e580 = v_U;
      const _pm592: number[] = [];
      let _pp593 = -1;
      for (let _k581 = 0; _k581 < 1 << _e580.length; _k581++) {
        if (!(popcount(_k581) >= 2)) continue;
        const v_T = _g583;
        v_T.length = 0;
        for (let _j582 = 0; _j582 < _e580.length; _j582++) if ((_k581 >> (_e580.length - 1 - _j582)) & 1) v_T.push(_e580[_j582]);
        const _h584 = v_T.length;
        if (!(((_h584 >= 2) && (_h584 <= _h585)))) continue;
        let _g586 = 0;
        if (_pp593 !== b.placed) {
          _pp593 = b.placed;
          for (let _j594 = 0; _j594 < _e580.length; _j594++) {
            const v_m595 = _e580[_j594];
            let _g596 = 0;
            G597: {
              const _a600 = sp.adj4[v_m595];
              for (let _i601 = 0; _i601 < _a600.length; _i601++) {
                const v_y = _a600[_i601];
                if (!(((b.grid[sp.adj4Edges[v_m595][_i601]] || -1) !== 2))) continue;
                const _t602 = clueAt(cl.number, v_y);
                _g596 |= 1 << _t602;
              }
            }
            _pm592[_j594] = _g596;
          }
        }
        for (let _j594 = 0; _j594 < _e580.length; _j594++) if ((_k581 >> (_e580.length - 1 - _j594)) & 1) _g586 |= _pm592[_j594];
        L603: {
          const v_O = _g586;
          const _h604 = popcount(v_O);
          let _c611: boolean = (_h604 === _h584);
          if (_c611) {
            let _q605 = false;
            Q606: {
              const _a607 = v_T;
              for (let _i608 = 0; _i608 < _a607.length; _i608++) {
                const v_x = _a607[_i608];
                const _a609 = sp.adj4[v_x];
                for (let _i610 = 0; _i610 < _a609.length; _i610++) {
                  const v_y = _a609[_i610];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i610]] || -1) !== 2)) {
                    _q605 = true;
                    break Q606;
                  }
                }
              }
            }
            _c611 = !(_q605);
          }
          if (!(_c611)) break L603;
          facts.length = 0;
          changed = false;
          let _q612 = true;
          Q613: {
            const _a614 = v_S;
            for (let _i615 = 0; _i615 < _a614.length; _i615++) {
              const v_x = _a614[_i615];
              const _a616 = sp.adj4[v_x];
              for (let _i617 = 0; _i617 < _a616.length; _i617++) {
                const v_y = _a616[_i617];
                const _h619 = clueAt(cl.number, v_y);
                L618: {
                  const v_f = sp.adj4Edges[v_x][_i617];
                  if (!(((((b.grid[v_f] || -1) !== 2) && (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])))) && (((v_O >> _h619) & 1) !== 0)))) break L618;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q612 = false;
                    break Q613;
                  }
                }
              }
            }
          }
          if (!(_q612)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, S: v_S, U: v_U, T: v_T, O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface SetDoublesBinding {
  a: number;
  S: readonly number[];
  U: readonly number[];
  T: readonly number[];
  O: number;
}

const setDoublesFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function setDoubles(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SetDoublesBinding> | null): number {
  const _g661: number[] = [];
  const _g678: number[] = [];
  const facts = setDoublesFacts;
  let fired = 0;
  let changed = false;
  const _t658 = cl.n;
  for (let v_a = 0; v_a <= _t658; v_a++) {
    L659: {
      const v_S = showing(sp, cl, v_a);
      const _h660 = v_S.length;
      if (!((_h660 <= 16))) break L659;
      const _h699 = (_h660 - 2);
      _g661.length = 0;
      G662: {
        const _a669 = v_S;
        for (let _i670 = 0; _i670 < _a669.length; _i670++) {
          const v_c = _a669[_i670];
          let _q671 = false;
          Q672: {
            const _a673 = sp.adj4[v_c];
            for (let _i674 = 0; _i674 < _a673.length; _i674++) {
              if (((b.grid[sp.adj4Edges[v_c][_i674]] || -1) === 1)) {
                _q671 = true;
                break Q672;
              }
            }
          }
          if (!(!(_q671))) continue;
          _g661.push(v_c);
        }
      }
      const v_U = _g661;
      const _e675 = v_U;
      const _pm686: number[] = [];
      let _pp687 = -1;
      for (let _k676 = 0; _k676 < 1 << _e675.length; _k676++) {
        if (!(popcount(_k676) >= 3)) continue;
        const v_T = _g678;
        v_T.length = 0;
        for (let _j677 = 0; _j677 < _e675.length; _j677++) if ((_k676 >> (_e675.length - 1 - _j677)) & 1) v_T.push(_e675[_j677]);
        const _h679 = v_T.length;
        if (!((_h679 >= 3))) continue;
        let _g680 = 0;
        if (_pp687 !== b.placed) {
          _pp687 = b.placed;
          for (let _j688 = 0; _j688 < _e675.length; _j688++) {
            const v_m689 = _e675[_j688];
            let _g690 = 0;
            G691: {
              const _a694 = sp.adj4[v_m689];
              for (let _i695 = 0; _i695 < _a694.length; _i695++) {
                const v_y = _a694[_i695];
                if (!(((b.grid[sp.adj4Edges[v_m689][_i695]] || -1) !== 2))) continue;
                const _t696 = clueAt(cl.number, v_y);
                _g690 |= 1 << _t696;
              }
            }
            _pm686[_j688] = _g690;
          }
        }
        for (let _j688 = 0; _j688 < _e675.length; _j688++) if ((_k676 >> (_e675.length - 1 - _j688)) & 1) _g680 |= _pm686[_j688];
        L697: {
          const v_O = _g680;
          const _h698 = popcount(v_O);
          let _c706: boolean = (((2 <= _h698) && (_h698 <= _h699)) && ((_h698 === _h679) || (_h698 === (_h679 - 1))));
          if (_c706) {
            let _q700 = false;
            Q701: {
              const _a702 = v_T;
              for (let _i703 = 0; _i703 < _a702.length; _i703++) {
                const v_x = _a702[_i703];
                const _a704 = sp.adj4[v_x];
                for (let _i705 = 0; _i705 < _a704.length; _i705++) {
                  const v_y = _a704[_i705];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i705]] || -1) !== 2)) {
                    _q700 = true;
                    break Q701;
                  }
                }
              }
            }
            _c706 = _q700;
          }
          if (!(_c706)) break L697;
          const _h715 = (_h698 < _h679);
          facts.length = 0;
          changed = false;
          let _q707 = true;
          Q708: {
            const _a709 = v_S;
            for (let _i710 = 0; _i710 < _a709.length; _i710++) {
              const v_x = _a709[_i710];
              const _a711 = sp.adj4[v_x];
              for (let _i712 = 0; _i712 < _a711.length; _i712++) {
                const v_y = _a711[_i712];
                const _h714 = clueAt(cl.number, v_y);
                L713: {
                  const v_f = sp.adj4Edges[v_x][_i712];
                  let _c728: boolean = (((b.grid[v_f] || -1) !== 2) && (((v_O >> _h714) & 1) !== 0));
                  if (_c728) {
                    let _c721: boolean = (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])));
                    if (_c721) {
                      let _c720: boolean = _h715;
                      if (!_c720) {
                        const _t716 = sp.edgeEnds[2 * v_f];
                        const _h717 = clueAt(cl.number, _t716);
                        const _t718 = sp.edgeEnds[2 * v_f + 1];
                        const _h719 = clueAt(cl.number, _t718);
                        _c720 = (_h717 === _h719);
                      }
                      _c721 = _c720;
                    }
                    let _c727: boolean = _c721;
                    if (!_c727) {
                      let _c726: boolean = _h715;
                      if (_c726) {
                        const _t722 = sp.edgeEnds[2 * v_f];
                        const _h723 = clueAt(cl.number, _t722);
                        const _t724 = sp.edgeEnds[2 * v_f + 1];
                        const _h725 = clueAt(cl.number, _t724);
                        _c726 = (_h723 === _h725);
                      }
                      _c727 = (_c726 && !(((v_T.includes(sp.edgeEnds[2 * v_f])) && (v_T.includes(sp.edgeEnds[2 * v_f + 1])))));
                    }
                    _c728 = _c727;
                  }
                  if (!(_c728)) break L713;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q707 = false;
                    break Q708;
                  }
                }
              }
            }
          }
          if (!(_q707)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, S: v_S, U: v_U, T: v_T, O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const showingKept = keptStore<readonly number[]>();

/** `showing(a)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function showing(_sp: GridSpace, cl: Dealt, v_a: number): readonly number[] {
  const _kept: Kept<readonly number[]> = showingKept.board(cl);
  if (_kept[v_a] !== undefined) return _kept[v_a];
  const _g37: number[] = [];
  G38: {
    const _a41 = cluesValued(cl.number, v_a);
    for (let _i42 = 0; _i42 < _a41.length; _i42++) {
      const v_c = _a41[_i42];
      if (!((clueAt(cl.number, v_c) === v_a))) continue;
      _g37.push(v_c);
    }
  }
  const _made = _g37;
  _kept[v_a] = _made;
  return _made;
}
