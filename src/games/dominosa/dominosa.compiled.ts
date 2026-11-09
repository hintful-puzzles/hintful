// Compiled by `npm run describe` from src/games/dominosa/dominosa.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, edgeGroups, keptStore, minus, popcount, rangeMask, sameSet, setOf, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  let _q813 = true;
  Q814: {
    const _a815 = sp.cells;
    for (let _i816 = 0; _i816 < _a815.length; _i816++) {
      const v_c = _a815[_i816];
      let _g817 = 0;
      G818: {
        const _a819 = sp.adj4[v_c];
        for (let _i820 = 0; _i820 < _a819.length; _i820++) {
          const _h821 = (g[sp.adj4Edges[v_c][_i820]] || -1);
          if (!((_h821 === 1))) continue;
          _g817++;
        }
      }
      if (!((_g817 === 1))) {
        _q813 = false;
        break Q814;
      }
    }
  }
  if (!(_q813)) return false;
  let _q822 = true;
  Q823: {
    const _a824 = sp.edges;
    for (let _i825 = 0; _i825 < _a824.length; _i825++) {
      const v_e = _a824[_i825];
      const _h828 = (g[v_e] || -1);
      const _h829 = (_h828 === 1);
      const _h831 = sp.edgeEnds[2 * v_e];
      const _h832 = clueAt(cl.number, _h831);
      const _h833 = _h832;
      const _h836 = sp.edgeEnds[2 * v_e + 1];
      const _h837 = clueAt(cl.number, _h836);
      const _h838 = _h837;
      const _a826 = sp.edges;
      for (let _i827 = 0; _i827 < _a826.length; _i827++) {
        const v_f = _a826[_i827];
        const _h830 = (g[v_f] || -1);
        if (!((((v_f !== v_e) && _h829) && (_h830 === 1)))) continue;
        const _t834 = sp.edgeEnds[2 * v_f];
        const _h835 = clueAt(cl.number, _t834);
        let _c841: boolean = (_h833 === _h835);
        if (_c841) {
          const _t839 = sp.edgeEnds[2 * v_f + 1];
          const _h840 = clueAt(cl.number, _t839);
          _c841 = (_h838 === _h840);
        }
        let _c847: boolean = _c841;
        if (!_c847) {
          const _t842 = sp.edgeEnds[2 * v_f + 1];
          const _h843 = clueAt(cl.number, _t842);
          let _c846: boolean = (_h833 === _h843);
          if (_c846) {
            const _t844 = sp.edgeEnds[2 * v_f];
            const _h845 = clueAt(cl.number, _t844);
            _c846 = (_h838 === _h845);
          }
          _c847 = _c846;
        }
        if (!(!(_c847))) {
          _q822 = false;
          break Q823;
        }
      }
    }
  }
  if (!(_q822)) return false;
  for (let _k848 = 0; _k848 < cl.number.at.length; _k848++) {
    const _at849 = cl.number.at[_k848];
    let _q851 = true;
    Q852: {
      const _a853 = sp.adj4[_at849];
      for (let _i854 = 0; _i854 < _a853.length; _i854++) {
        let _q855 = false;
        Q856: {
          const _a857 = sp.edges;
          for (let _i858 = 0; _i858 < _a857.length; _i858++) {
            const v_f = _a857[_i858];
            const _h859 = (g[v_f] || -1);
            if (!((_h859 === 1))) continue;
            const _t860 = sp.adj4Edges[_at849][_i854];
            const _t861 = sp.edgeEnds[2 * _t860];
            const _h862 = clueAt(cl.number, _t861);
            const _t863 = sp.edgeEnds[2 * v_f];
            const _h864 = clueAt(cl.number, _t863);
            let _c869: boolean = (_h862 === _h864);
            if (_c869) {
              const _t865 = sp.edgeEnds[2 * _t860 + 1];
              const _h866 = clueAt(cl.number, _t865);
              const _t867 = sp.edgeEnds[2 * v_f + 1];
              const _h868 = clueAt(cl.number, _t867);
              _c869 = (_h866 === _h868);
            }
            let _c879: boolean = _c869;
            if (!_c879) {
              const _t870 = sp.edgeEnds[2 * _t860];
              const _h871 = clueAt(cl.number, _t870);
              const _t872 = sp.edgeEnds[2 * v_f + 1];
              const _h873 = clueAt(cl.number, _t872);
              let _c878: boolean = (_h871 === _h873);
              if (_c878) {
                const _t874 = sp.edgeEnds[2 * _t860 + 1];
                const _h875 = clueAt(cl.number, _t874);
                const _t876 = sp.edgeEnds[2 * v_f];
                const _h877 = clueAt(cl.number, _t876);
                _c878 = (_h875 === _h877);
              }
              _c879 = _c878;
            }
            if (_c879) {
              _q855 = true;
              break Q856;
            }
          }
        }
        if (!(_q855)) {
          _q851 = false;
          break Q852;
        }
      }
    }
    if (!(_q851)) return false;
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
  const _h15 = sp.edgeEnds[2 * v_e];
  const _h16 = clueAt(cl.number, _h15);
  const _h17 = _h16;
  const _h20 = sp.edgeEnds[2 * v_e + 1];
  const _h21 = clueAt(cl.number, _h20);
  const _h22 = _h21;
  if (!(((b.grid[v_e] || -1) === 1))) return 0;
  facts.length = 0;
  changed = false;
  let _q3 = true;
  Q4: {
    const _t5 = sp.edgeEnds[2 * v_e];
    const _t6 = sp.edgeEnds[2 * v_e + 1];
    for (let _i7 = 0; _i7 < 2; _i7++) {
      const v_x = _i7 === 0 ? _t5 : _t6;
      if (_i7 === 1 && (v_x === _t5)) continue;
      const _a8 = sp.adj4[v_x];
      for (let _i9 = 0; _i9 < _a8.length; _i9++) {
        if (!((sp.adj4Edges[v_x][_i9] !== v_e))) continue;
        const _t10 = sp.adj4Edges[v_x][_i9];
        if (!(b.grid[_t10] !== 0)) { if (fire === null) { b.placeAt(_t10, 2); changed = true; } else facts.push(PLACE, _t10, 2); }
        if (!(true)) {
          _q3 = false;
          break Q4;
        }
      }
    }
  }
  let _c33: boolean = _q3;
  if (_c33) {
    let _q11 = true;
    Q12: {
      const _a13 = sp.edges;
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        const v_f = _a13[_i14];
        let _c32: boolean = (v_f !== v_e);
        if (_c32) {
          const _t18 = sp.edgeEnds[2 * v_f];
          const _h19 = clueAt(cl.number, _t18);
          let _c25: boolean = (_h17 === _h19);
          if (_c25) {
            const _t23 = sp.edgeEnds[2 * v_f + 1];
            const _h24 = clueAt(cl.number, _t23);
            _c25 = (_h22 === _h24);
          }
          let _c31: boolean = _c25;
          if (!_c31) {
            const _t26 = sp.edgeEnds[2 * v_f + 1];
            const _h27 = clueAt(cl.number, _t26);
            let _c30: boolean = (_h17 === _h27);
            if (_c30) {
              const _t28 = sp.edgeEnds[2 * v_f];
              const _h29 = clueAt(cl.number, _t28);
              _c30 = (_h22 === _h29);
            }
            _c31 = _c30;
          }
          _c32 = _c31;
        }
        if (!(_c32)) continue;
        if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
        if (!(true)) {
          _q11 = false;
          break Q12;
        }
      }
    }
    _c33 = _q11;
  }
  if (!(_c33)) return -1;
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
const _st63 = stamps();

/** Its dearest read grows with the board as 1. */
export function onlySpot(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlySpotBinding> | null): number {
  const _g57: number[] = [];
  const facts = onlySpotFacts;
  let fired = 0;
  let changed = false;
  const _k64 = showingKept.board(cl);
  const _t55 = cl.n;
  for (let v_a = 0; v_a <= _t55; v_a++) {
    const _t56 = cl.n;
    for (let v_b = v_a; v_b <= _t56; v_b++) {
      _g57.length = 0;
      _st63.pass++;
      G58: {
        const _a65 = (_k64[v_a] ?? showing(sp, cl, v_a));
        for (let _i66 = 0; _i66 < _a65.length; _i66++) {
          const v_x = _a65[_i66];
          const _a67 = sp.adj4[v_x];
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_y = _a67[_i68];
            const _h69 = clueAt(cl.number, v_y);
            if (!(((_h69 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i68]] || -1) !== 2)))) continue;
            const _t70 = sp.adj4Edges[v_x][_i68];
            const _t71 = _t70;
            if (_g57.length < 16) { if (!_g57.includes(_t71)) _g57.push(_t71); } else addOnce(_g57, _st63, _t71);
          }
        }
      }
      L72: {
        const v_P = _g57;
        const _h73 = v_P.length;
        if (!((_h73 === 1))) break L72;
        L74: {
          const v_e = (v_P[0] ?? -1);
          if (!(!((b.grid[v_e] !== 0)))) break L74;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, b: v_b, P: v_P.slice(), e: v_e }, facts)) return 1;
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
const _st96 = stamps();

/** Its dearest read grows with the board as n. */
export function squareOnly(b: Marks, sp: GridSpace, fire: Fire<SquareOnlyBinding> | null): number {
  const _g92: number[] = [];
  const facts = squareOnlyFacts;
  let fired = 0;
  let changed = false;
  const _a90 = sp.cells;
  for (let _i91 = 0; _i91 < _a90.length; _i91++) {
    const v_c = _a90[_i91];
    _g92.length = 0;
    _st96.pass++;
    G93: {
      const _a97 = sp.adj4[v_c];
      for (let _i98 = 0; _i98 < _a97.length; _i98++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i98]] || -1) !== 2))) continue;
        const _t99 = sp.adj4Edges[v_c][_i98];
        const _t100 = _t99;
        if (_g92.length < 16) { if (!_g92.includes(_t100)) _g92.push(_t100); } else addOnce(_g92, _st96, _t100);
      }
    }
    L101: {
      const v_S = _g92;
      const _h102 = v_S.length;
      let _c107: boolean = (_h102 <= 1);
      if (_c107) {
        let _q103 = false;
        Q104: {
          const _a105 = v_S;
          for (let _i106 = 0; _i106 < _a105.length; _i106++) {
            const v_f = _a105[_i106];
            if ((b.grid[v_f] !== 0)) {
              _q103 = true;
              break Q104;
            }
          }
        }
        _c107 = !(_q103);
      }
      if (!(_c107)) break L101;
      facts.length = 0;
      changed = false;
      let _c109: boolean = (_h102 === 1);
      if (_c109) {
        const _t108 = (v_S[0] ?? -1);
        if (!(b.grid[_t108] !== 0)) { if (fire === null) { b.placeAt(_t108, 1); changed = true; } else facts.push(PLACE, _t108, 1); }
        _c109 = true;
      }
      if (!(_c109)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, S: v_S.slice() }, facts)) return 1;
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
const _st142 = stamps();

/** Its dearest read grows with the board as n^2. */
export function squareSingleDomino(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareSingleDominoBinding> | null): number {
  const _g138: number[] = [];
  const facts = squareSingleDominoFacts;
  let fired = 0;
  let changed = false;
  const _a136 = sp.cells;
  for (let _i137 = 0; _i137 < _a136.length; _i137++) {
    const v_c = _a136[_i137];
    _g138.length = 0;
    _st142.pass++;
    G139: {
      const _a143 = sp.adj4[v_c];
      for (let _i144 = 0; _i144 < _a143.length; _i144++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i144]] || -1) !== 2))) continue;
        const _t145 = sp.adj4Edges[v_c][_i144];
        const _t146 = _t145;
        if (_g138.length < 16) { if (!_g138.includes(_t146)) _g138.push(_t146); } else addOnce(_g138, _st142, _t146);
      }
    }
    L147: {
      const v_S = _g138;
      const _h148 = v_S.length;
      if (!((_h148 >= 2))) break L147;
      L149: {
        const v_s = (v_S[0] ?? -1);
        const _h156 = sp.edgeEnds[2 * v_s];
        const _h157 = clueAt(cl.number, _h156);
        const _h158 = _h157;
        const _h161 = sp.edgeEnds[2 * v_s + 1];
        const _h162 = clueAt(cl.number, _h161);
        const _h163 = _h162;
        let _q150 = true;
        Q151: {
          const _a152 = v_S;
          for (let _i153 = 0; _i153 < _a152.length; _i153++) {
            const v_f = _a152[_i153];
            const _t154 = sp.edgeEnds[2 * v_f];
            const _h155 = clueAt(cl.number, _t154);
            let _c164: boolean = (_h155 === _h158);
            if (_c164) {
              const _t159 = sp.edgeEnds[2 * v_f + 1];
              const _h160 = clueAt(cl.number, _t159);
              _c164 = (_h160 === _h163);
            }
            let _c170: boolean = _c164;
            if (!_c170) {
              const _t165 = sp.edgeEnds[2 * v_f];
              const _h166 = clueAt(cl.number, _t165);
              let _c169: boolean = (_h166 === _h163);
              if (_c169) {
                const _t167 = sp.edgeEnds[2 * v_f + 1];
                const _h168 = clueAt(cl.number, _t167);
                _c169 = (_h168 === _h158);
              }
              _c170 = _c169;
            }
            if (!(_c170)) {
              _q150 = false;
              break Q151;
            }
          }
        }
        if (!(_q150)) break L149;
        facts.length = 0;
        changed = false;
        let _q171 = true;
        Q172: {
          const _a173 = sp.edges;
          for (let _i174 = 0; _i174 < _a173.length; _i174++) {
            const v_f = _a173[_i174];
            let _c186: boolean = (!(v_S.includes(v_f)) && ((b.grid[v_f] || -1) !== 2));
            if (_c186) {
              const _t175 = sp.edgeEnds[2 * v_f];
              const _h176 = clueAt(cl.number, _t175);
              let _c179: boolean = (_h176 === _h158);
              if (_c179) {
                const _t177 = sp.edgeEnds[2 * v_f + 1];
                const _h178 = clueAt(cl.number, _t177);
                _c179 = (_h178 === _h163);
              }
              let _c185: boolean = _c179;
              if (!_c185) {
                const _t180 = sp.edgeEnds[2 * v_f];
                const _h181 = clueAt(cl.number, _t180);
                let _c184: boolean = (_h181 === _h163);
                if (_c184) {
                  const _t182 = sp.edgeEnds[2 * v_f + 1];
                  const _h183 = clueAt(cl.number, _t182);
                  _c184 = (_h183 === _h158);
                }
                _c185 = _c184;
              }
              _c186 = _c185;
            }
            if (!(_c186)) continue;
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
            if (!(true)) {
              _q171 = false;
              break Q172;
            }
          }
        }
        if (!(_q171)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, S: v_S.slice(), s: v_s }, facts)) return 1;
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
const _st209 = stamps();

/** Its dearest read grows with the board as 1. */
export function mustOverlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustOverlapBinding> | null): number {
  const _g203: number[] = [];
  const facts = mustOverlapFacts;
  let fired = 0;
  let changed = false;
  const _k210 = showingKept.board(cl);
  const _t201 = cl.n;
  for (let v_a = 0; v_a <= _t201; v_a++) {
    const _t202 = cl.n;
    for (let v_b = v_a; v_b <= _t202; v_b++) {
      _g203.length = 0;
      _st209.pass++;
      G204: {
        const _a211 = (_k210[v_a] ?? showing(sp, cl, v_a));
        for (let _i212 = 0; _i212 < _a211.length; _i212++) {
          const v_x = _a211[_i212];
          const _a213 = sp.adj4[v_x];
          for (let _i214 = 0; _i214 < _a213.length; _i214++) {
            const v_y = _a213[_i214];
            const _h215 = clueAt(cl.number, v_y);
            if (!(((_h215 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i214]] || -1) !== 2)))) continue;
            const _t216 = sp.adj4Edges[v_x][_i214];
            const _t217 = _t216;
            if (_g203.length < 16) { if (!_g203.includes(_t217)) _g203.push(_t217); } else addOnce(_g203, _st209, _t217);
          }
        }
      }
      L218: {
        const v_P = _g203;
        const _h219 = v_P.length;
        if (!((_h219 >= 2))) break L218;
        const v_e = (v_P[0] ?? -1);
        facts.length = 0;
        changed = false;
        let _q220 = true;
        Q221: {
          const _t222 = sp.edgeEnds[2 * v_e];
          const _t223 = sp.edgeEnds[2 * v_e + 1];
          for (let _i224 = 0; _i224 < 2; _i224++) {
            const v_x = _i224 === 0 ? _t222 : _t223;
            if (_i224 === 1 && (v_x === _t222)) continue;
            const _a225 = sp.adj4[v_x];
            for (let _i226 = 0; _i226 < _a225.length; _i226++) {
              const _h231 = sp.adj4Edges[v_x][_i226];
              const _h232 = sp.edgeEnds[2 * _h231];
              const _h233 = sp.edgeEnds[2 * _h231 + 1];
              let _c234: boolean = (!(v_P.includes(sp.adj4Edges[v_x][_i226])) && ((b.grid[sp.adj4Edges[v_x][_i226]] || -1) !== 2));
              if (_c234) {
                let _q227 = true;
                Q228: {
                  const _a229 = v_P;
                  for (let _i230 = 0; _i230 < _a229.length; _i230++) {
                    const v_f = _a229[_i230];
                    if (!(((((sp.edgeEnds[2 * v_f] === _h232) || (sp.edgeEnds[2 * v_f] === _h233)) || (sp.edgeEnds[2 * v_f + 1] === _h232)) || (sp.edgeEnds[2 * v_f + 1] === _h233)))) {
                      _q227 = false;
                      break Q228;
                    }
                  }
                }
                _c234 = _q227;
              }
              if (!(_c234)) continue;
              const _t235 = sp.adj4Edges[v_x][_i226];
              if (!(b.grid[_t235] !== 0)) { if (fire === null) { b.placeAt(_t235, 2); changed = true; } else facts.push(PLACE, _t235, 2); }
              if (!(true)) {
                _q220 = false;
                break Q221;
              }
            }
          }
        }
        if (!(_q220)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, P: v_P.slice(), e: v_e }, facts)) return 1;
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
const _st284 = stamps();

/** Its dearest read grows with the board as n. */
export function localDuplicate(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicateBinding> | null): number {
  const _g279: number[] = [];
  const facts = localDuplicateFacts;
  let fired = 0;
  let changed = false;
  const _a269 = sp.edges;
  R1:
  for (let _i270 = 0; _i270 < _a269.length; _i270++) {
    const v_p = _a269[_i270];
    const _m114_0 = b.made[0];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h294 = sp.edgeEnds[2 * v_p];
    const _h295 = clueAt(cl.number, _h294);
    const _h296 = _h295;
    const _h299 = sp.edgeEnds[2 * v_p + 1];
    const _h300 = clueAt(cl.number, _h299);
    const _h301 = _h300;
    const _t271 = sp.edgeEnds[2 * v_p];
    const _t272 = sp.edgeEnds[2 * v_p + 1];
    for (let _i273 = 0; _i273 < 2; _i273++) {
      const v_x = _i273 === 0 ? _t271 : _t272;
      if (_i273 === 1 && (v_x === _t271)) continue;
      const _a274 = sp.adj4[v_x];
      for (let _i275 = 0; _i275 < _a274.length; _i275++) {
        const v_y = _a274[_i275];
        L276: {
          const v_q = sp.adj4Edges[v_x][_i275];
          let _c309: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
          if (_c309) {
            let _q277 = true;
            Q278: {
              _g279.length = 0;
              _st284.pass++;
              G280: {
                const _a286 = sp.adj4[v_y];
                for (let _i287 = 0; _i287 < _a286.length; _i287++) {
                  if (!(((b.grid[sp.adj4Edges[v_y][_i287]] || -1) !== 2))) continue;
                  const _t288 = sp.adj4Edges[v_y][_i287];
                  const _t289 = _t288;
                  if (_g279.length < 16) { if (!_g279.includes(_t289)) _g279.push(_t289); } else addOnce(_g279, _st284, _t289);
                }
              }
              const _a290 = _g279;
              for (let _i291 = 0; _i291 < _a290.length; _i291++) {
                const v_r = _a290[_i291];
                if (!((v_r !== v_q))) continue;
                const _t292 = sp.edgeEnds[2 * v_r];
                const _h293 = clueAt(cl.number, _t292);
                let _c302: boolean = (_h293 === _h296);
                if (_c302) {
                  const _t297 = sp.edgeEnds[2 * v_r + 1];
                  const _h298 = clueAt(cl.number, _t297);
                  _c302 = (_h298 === _h301);
                }
                let _c308: boolean = _c302;
                if (!_c308) {
                  const _t303 = sp.edgeEnds[2 * v_r];
                  const _h304 = clueAt(cl.number, _t303);
                  let _c307: boolean = (_h304 === _h301);
                  if (_c307) {
                    const _t305 = sp.edgeEnds[2 * v_r + 1];
                    const _h306 = clueAt(cl.number, _t305);
                    _c307 = (_h306 === _h296);
                  }
                  _c308 = _c307;
                }
                if (!(_c308)) {
                  _q277 = false;
                  break Q278;
                }
              }
            }
            _c309 = _q277;
          }
          if (!(_c309)) break L276;
          if (b.made[0] !== _m114_0) {
            if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
          }
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
const _st428 = stamps();
const _st481 = stamps();
const _st526 = stamps();

/** Its dearest read grows with the board as n. */
export function localDuplicate2(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicate2Binding> | null): number {
  const _g410: number[] = [];
  const _g423: number[] = [];
  const _g466: number[] = [];
  const _g477: number[] = [];
  const _g508: number[] = [];
  const _g521: number[] = [];
  const facts = localDuplicate2Facts;
  let fired = 0;
  let changed = false;
  const _a402 = sp.edges;
  R1:
  for (let _i403 = 0; _i403 < _a402.length; _i403++) {
    const v_p = _a402[_i403];
    const _m142_0 = b.made[0];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h460 = sp.edgeEnds[2 * v_p];
    const _h461 = sp.edgeEnds[2 * v_p + 1];
    const _t404 = sp.edgeEnds[2 * v_p];
    const _t405 = sp.edgeEnds[2 * v_p + 1];
    for (let _i406 = 0; _i406 < 2; _i406++) {
      const v_x = _i406 === 0 ? _t404 : _t405;
      if (_i406 === 1 && (v_x === _t404)) continue;
      const _a407 = sp.adj4[v_x];
      R3:
      for (let _i408 = 0; _i408 < _a407.length; _i408++) {
        const v_y = _a407[_i408];
        L409: {
          const v_q = sp.adj4Edges[v_x][_i408];
          if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) break L409;
          const _h505 = sp.edgeEnds[2 * v_q];
          const _h506 = sp.edgeEnds[2 * v_q + 1];
          _g410.length = 0;
          G411: {
            _g423.length = 0;
            _st428.pass++;
            G424: {
              const _a430 = sp.adj4[v_y];
              for (let _i431 = 0; _i431 < _a430.length; _i431++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i431]] || -1) !== 2))) continue;
                const _t432 = sp.adj4Edges[v_y][_i431];
                const _t433 = _t432;
                if (_g423.length < 16) { if (!_g423.includes(_t433)) _g423.push(_t433); } else addOnce(_g423, _st428, _t433);
              }
            }
            const _a434 = _g423;
            for (let _i435 = 0; _i435 < _a434.length; _i435++) {
              const v_r = _a434[_i435];
              if (!((v_r !== v_q))) continue;
              _g410.push(v_r);
            }
          }
          L436: {
            const v_R = _g410;
            const _h437 = v_R.length;
            if (!((_h437 >= 1))) break L436;
            L438: {
              const v_d = (v_R[0] ?? -1);
              const _h445 = sp.edgeEnds[2 * v_d];
              const _h446 = clueAt(cl.number, _h445);
              const _h447 = _h446;
              const _h450 = sp.edgeEnds[2 * v_d + 1];
              const _h451 = clueAt(cl.number, _h450);
              const _h452 = _h451;
              let _q439 = true;
              Q440: {
                const _a441 = v_R;
                for (let _i442 = 0; _i442 < _a441.length; _i442++) {
                  const v_r = _a441[_i442];
                  const _t443 = sp.edgeEnds[2 * v_r];
                  const _h444 = clueAt(cl.number, _t443);
                  let _c453: boolean = (_h444 === _h447);
                  if (_c453) {
                    const _t448 = sp.edgeEnds[2 * v_r + 1];
                    const _h449 = clueAt(cl.number, _t448);
                    _c453 = (_h449 === _h452);
                  }
                  let _c459: boolean = _c453;
                  if (!_c459) {
                    const _t454 = sp.edgeEnds[2 * v_r];
                    const _h455 = clueAt(cl.number, _t454);
                    let _c458: boolean = (_h455 === _h452);
                    if (_c458) {
                      const _t456 = sp.edgeEnds[2 * v_r + 1];
                      const _h457 = clueAt(cl.number, _t456);
                      _c458 = (_h457 === _h447);
                    }
                    _c459 = _c458;
                  }
                  if (!(_c459)) {
                    _q439 = false;
                    break Q440;
                  }
                }
              }
              if (!(_q439)) break L438;
              for (let _i462 = 0; _i462 < 2; _i462++) {
                const v_x2 = _i462 === 0 ? _h460 : _h461;
                if (_i462 === 1 && (v_x2 === _h460)) continue;
                const _a463 = sp.adj4[v_x2];
                for (let _i464 = 0; _i464 < _a463.length; _i464++) {
                  const v_z = _a463[_i464];
                  L465: {
                    const v_q2 = sp.adj4Edges[v_x2][_i464];
                    if (!((((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)))) break L465;
                    _g466.length = 0;
                    G467: {
                      _g477.length = 0;
                      _st481.pass++;
                      G478: {
                        const _a482 = sp.adj4[v_z];
                        for (let _i483 = 0; _i483 < _a482.length; _i483++) {
                          if (!(((b.grid[sp.adj4Edges[v_z][_i483]] || -1) !== 2))) continue;
                          const _t484 = sp.adj4Edges[v_z][_i483];
                          const _t485 = _t484;
                          if (_g477.length < 16) { if (!_g477.includes(_t485)) _g477.push(_t485); } else addOnce(_g477, _st481, _t485);
                        }
                      }
                      const _a486 = _g477;
                      for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                        const v_r = _a486[_i487];
                        if (!((v_r !== v_q2))) continue;
                        _g466.push(v_r);
                      }
                    }
                    L488: {
                      const v_S = _g466;
                      const _h489 = v_S.length;
                      let _c507: boolean = (_h489 >= 1);
                      if (_c507) {
                        let _q490 = true;
                        Q491: {
                          const _a492 = v_S;
                          for (let _i493 = 0; _i493 < _a492.length; _i493++) {
                            const v_r = _a492[_i493];
                            const _t494 = sp.edgeEnds[2 * v_r];
                            const _h495 = clueAt(cl.number, _t494);
                            let _c498: boolean = (_h495 === _h447);
                            if (_c498) {
                              const _t496 = sp.edgeEnds[2 * v_r + 1];
                              const _h497 = clueAt(cl.number, _t496);
                              _c498 = (_h497 === _h452);
                            }
                            let _c504: boolean = _c498;
                            if (!_c504) {
                              const _t499 = sp.edgeEnds[2 * v_r];
                              const _h500 = clueAt(cl.number, _t499);
                              let _c503: boolean = (_h500 === _h452);
                              if (_c503) {
                                const _t501 = sp.edgeEnds[2 * v_r + 1];
                                const _h502 = clueAt(cl.number, _t501);
                                _c503 = (_h502 === _h447);
                              }
                              _c504 = _c503;
                            }
                            if (!((_c504 && !(((((sp.edgeEnds[2 * v_r] === _h505) || (sp.edgeEnds[2 * v_r] === _h506)) || (sp.edgeEnds[2 * v_r + 1] === _h505)) || (sp.edgeEnds[2 * v_r + 1] === _h506)))))) {
                              _q490 = false;
                              break Q491;
                            }
                          }
                        }
                        _c507 = _q490;
                      }
                      if (!(_c507)) break L488;
                      if (b.made[0] !== _m142_0) {
                        if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
                        if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) { continue R3; }
                        _g508.length = 0;
                        G509: {
                          _g521.length = 0;
                          _st526.pass++;
                          G522: {
                            const _a528 = sp.adj4[v_y];
                            for (let _i529 = 0; _i529 < _a528.length; _i529++) {
                              if (!(((b.grid[sp.adj4Edges[v_y][_i529]] || -1) !== 2))) continue;
                              const _t530 = sp.adj4Edges[v_y][_i529];
                              const _t531 = _t530;
                              if (_g521.length < 16) { if (!_g521.includes(_t531)) _g521.push(_t531); } else addOnce(_g521, _st526, _t531);
                            }
                          }
                          const _a532 = _g521;
                          for (let _i533 = 0; _i533 < _a532.length; _i533++) {
                            const v_r = _a532[_i533];
                            if (!((v_r !== v_q))) continue;
                            _g508.push(v_r);
                          }
                        }
                        if (!(sameSet(v_R, _g508))) { continue R3; }
                      }
                      facts.length = 0;
                      changed = false;
                      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                      if (!(true)) return -1;
                      if (changed || facts.length > 0) {
                        fired = 1;
                        if (fire !== null && !fire({ p: v_p, x: v_x, y: v_y, q: v_q, R: v_R.slice(), d: v_d, x2: v_x2, z: v_z, q2: v_q2, S: v_S.slice() }, facts)) return 1;
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
  const _g550: number[] = [];
  const _g573: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _m201_0 = b.made[0];
  _g550.length = 0;
  G551: {
    const _a554 = sp.edges;
    for (let _i555 = 0; _i555 < _a554.length; _i555++) {
      const v_e = _a554[_i555];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      _g550.push(v_e);
    }
  }
  const v_P = _g550;
  const _a556 = sp.edges;
  for (let _i557 = 0; _i557 < _a556.length; _i557++) {
    const v_p = _a556[_i557];
    const _h562 = sp.edgeEnds[2 * v_p + 1];
    const _h566 = sp.edgeEnds[2 * v_p];
    let _c568: boolean = !((b.grid[v_p] !== 0));
    if (_c568) {
      let _q558 = false;
      Q559: {
        const _a560 = sp.adj4[sp.edgeEnds[2 * v_p]];
        for (let _i561 = 0; _i561 < _a560.length; _i561++) {
          const v_x = _a560[_i561];
          const _h565 = (v_x !== _h562);
          const _h567 = sp.edgeOf(_h566, v_x);
          const _a563 = sp.adj4[_h562];
          for (let _i564 = 0; _i564 < _a563.length; _i564++) {
            const v_y = _a563[_i564];
            if (!(((_h565 && (v_y !== _h566)) && (sp.adj4[v_x].includes(v_y))))) continue;
            if (((((b.grid[_h567] || -1) !== 2) && ((b.grid[sp.adj4Edges[_h562][_i564]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
              _q558 = true;
              break Q559;
            }
          }
        }
      }
      _c568 = !(_q558);
    }
    if (!(_c568)) continue;
    const v_Q = minus(v_P, setOf(v_p));
    const _eg569 = edgeGroups(sp, v_Q);
    const _h572 = _eg569.of(sp.edgeEnds[2 * v_p + 1]).length;
    L570: {
      const v_A = _eg569.of(sp.edgeEnds[2 * v_p]);
      const _h571 = v_A.length;
      if (!(((!(_eg569.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((_h571 % 2) === 0)) && ((_h572 % 2) === 0)))) break L570;
      if (b.made[0] !== _m201_0) {
        _g573.length = 0;
        G574: {
          const _a577 = sp.edges;
          for (let _i578 = 0; _i578 < _a577.length; _i578++) {
            const v_e = _a577[_i578];
            if (!(((b.grid[v_e] || -1) !== 2))) continue;
            _g573.push(v_e);
          }
        }
        if (!(sameSet(v_P, _g573))) { return fired; }
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ P: v_P.slice(), p: v_p, Q: v_Q.slice(), A: v_A.slice() }, facts)) return 1;
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
  const _g621: number[] = [];
  const _g638: number[] = [];
  const _g667: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  const _k618 = showingKept.board(cl);
  const _t617 = cl.n;
  R1:
  for (let v_a = 0; v_a <= _t617; v_a++) {
    L619: {
      const v_S = (_k618[v_a] ?? showing(sp, cl, v_a));
      const _h620 = v_S.length;
      if (!((_h620 <= 16))) break L619;
      const _h640 = (_h620 - 2);
      const _m233_0 = b.made[0];
      _g621.length = 0;
      G622: {
        const _a629 = v_S;
        for (let _i630 = 0; _i630 < _a629.length; _i630++) {
          const v_c = _a629[_i630];
          let _q631 = false;
          Q632: {
            const _a633 = sp.adj4[v_c];
            for (let _i634 = 0; _i634 < _a633.length; _i634++) {
              if (((b.grid[sp.adj4Edges[v_c][_i634]] || -1) === 1)) {
                _q631 = true;
                break Q632;
              }
            }
          }
          if (!(!(_q631))) continue;
          _g621.push(v_c);
        }
      }
      const v_U = _g621;
      const _e635 = v_U;
      const _pm647: number[] = [];
      let _pp648 = -1;
      for (let _k636 = 0; _k636 < 1 << _e635.length; _k636++) {
        if (!(popcount(_k636) >= 2)) continue;
        const v_T = _g638;
        v_T.length = 0;
        for (let _j637 = 0; _j637 < _e635.length; _j637++) if ((_k636 >> (_e635.length - 1 - _j637)) & 1) v_T.push(_e635[_j637]);
        const _h639 = v_T.length;
        if (!(((_h639 >= 2) && (_h639 <= _h640)))) continue;
        let _g641 = 0;
        if (_pp648 !== b.placed) {
          _pp648 = b.placed;
          for (let _j649 = 0; _j649 < _e635.length; _j649++) {
            const v_m650 = _e635[_j649];
            let _g651 = 0;
            G652: {
              const _a655 = sp.adj4[v_m650];
              for (let _i656 = 0; _i656 < _a655.length; _i656++) {
                const v_y = _a655[_i656];
                if (!(((b.grid[sp.adj4Edges[v_m650][_i656]] || -1) !== 2))) continue;
                const _t657 = clueAt(cl.number, v_y);
                _g651 |= 1 << _t657;
              }
            }
            _pm647[_j649] = _g651;
          }
        }
        for (let _j649 = 0; _j649 < _e635.length; _j649++) if ((_k636 >> (_e635.length - 1 - _j649)) & 1) _g641 |= _pm647[_j649];
        L658: {
          const v_O = _g641;
          const _h659 = popcount(v_O);
          let _c666: boolean = (_h659 === _h639);
          if (_c666) {
            let _q660 = false;
            Q661: {
              const _a662 = v_T;
              for (let _i663 = 0; _i663 < _a662.length; _i663++) {
                const v_x = _a662[_i663];
                const _a664 = sp.adj4[v_x];
                for (let _i665 = 0; _i665 < _a664.length; _i665++) {
                  const v_y = _a664[_i665];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i665]] || -1) !== 2)) {
                    _q660 = true;
                    break Q661;
                  }
                }
              }
            }
            _c666 = !(_q660);
          }
          if (!(_c666)) break L658;
          if (b.made[0] !== _m233_0) {
            _g667.length = 0;
            G668: {
              const _a675 = v_S;
              for (let _i676 = 0; _i676 < _a675.length; _i676++) {
                const v_c = _a675[_i676];
                let _q677 = false;
                Q678: {
                  const _a679 = sp.adj4[v_c];
                  for (let _i680 = 0; _i680 < _a679.length; _i680++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i680]] || -1) === 1)) {
                      _q677 = true;
                      break Q678;
                    }
                  }
                }
                if (!(!(_q677))) continue;
                _g667.push(v_c);
              }
            }
            if (!(sameSet(v_U, _g667))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _q681 = true;
          Q682: {
            const _a683 = v_S;
            for (let _i684 = 0; _i684 < _a683.length; _i684++) {
              const v_x = _a683[_i684];
              const _a685 = sp.adj4[v_x];
              for (let _i686 = 0; _i686 < _a685.length; _i686++) {
                const v_y = _a685[_i686];
                const _h688 = clueAt(cl.number, v_y);
                L687: {
                  const v_f = sp.adj4Edges[v_x][_i686];
                  if (!(((((b.grid[v_f] || -1) !== 2) && (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])))) && (((v_O >> _h688) & 1) !== 0)))) break L687;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q681 = false;
                    break Q682;
                  }
                }
              }
            }
          }
          if (!(_q681)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, S: v_S.slice(), U: v_U.slice(), T: v_T.slice(), O: v_O }, facts)) return 1;
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
  const _g731: number[] = [];
  const _g748: number[] = [];
  const _g777: number[] = [];
  const facts = setDoublesFacts;
  let fired = 0;
  let changed = false;
  const _k728 = showingKept.board(cl);
  const _t727 = cl.n;
  R1:
  for (let v_a = 0; v_a <= _t727; v_a++) {
    L729: {
      const v_S = (_k728[v_a] ?? showing(sp, cl, v_a));
      const _h730 = v_S.length;
      if (!((_h730 <= 16))) break L729;
      const _h769 = (_h730 - 2);
      const _m268_0 = b.made[0];
      _g731.length = 0;
      G732: {
        const _a739 = v_S;
        for (let _i740 = 0; _i740 < _a739.length; _i740++) {
          const v_c = _a739[_i740];
          let _q741 = false;
          Q742: {
            const _a743 = sp.adj4[v_c];
            for (let _i744 = 0; _i744 < _a743.length; _i744++) {
              if (((b.grid[sp.adj4Edges[v_c][_i744]] || -1) === 1)) {
                _q741 = true;
                break Q742;
              }
            }
          }
          if (!(!(_q741))) continue;
          _g731.push(v_c);
        }
      }
      const v_U = _g731;
      const _e745 = v_U;
      const _pm756: number[] = [];
      let _pp757 = -1;
      for (let _k746 = 0; _k746 < 1 << _e745.length; _k746++) {
        if (!(popcount(_k746) >= 3)) continue;
        const v_T = _g748;
        v_T.length = 0;
        for (let _j747 = 0; _j747 < _e745.length; _j747++) if ((_k746 >> (_e745.length - 1 - _j747)) & 1) v_T.push(_e745[_j747]);
        const _h749 = v_T.length;
        if (!((_h749 >= 3))) continue;
        let _g750 = 0;
        if (_pp757 !== b.placed) {
          _pp757 = b.placed;
          for (let _j758 = 0; _j758 < _e745.length; _j758++) {
            const v_m759 = _e745[_j758];
            let _g760 = 0;
            G761: {
              const _a764 = sp.adj4[v_m759];
              for (let _i765 = 0; _i765 < _a764.length; _i765++) {
                const v_y = _a764[_i765];
                if (!(((b.grid[sp.adj4Edges[v_m759][_i765]] || -1) !== 2))) continue;
                const _t766 = clueAt(cl.number, v_y);
                _g760 |= 1 << _t766;
              }
            }
            _pm756[_j758] = _g760;
          }
        }
        for (let _j758 = 0; _j758 < _e745.length; _j758++) if ((_k746 >> (_e745.length - 1 - _j758)) & 1) _g750 |= _pm756[_j758];
        L767: {
          const v_O = _g750;
          const _h768 = popcount(v_O);
          let _c776: boolean = (((2 <= _h768) && (_h768 <= _h769)) && ((_h768 === _h749) || (_h768 === (_h749 - 1))));
          if (_c776) {
            let _q770 = false;
            Q771: {
              const _a772 = v_T;
              for (let _i773 = 0; _i773 < _a772.length; _i773++) {
                const v_x = _a772[_i773];
                const _a774 = sp.adj4[v_x];
                for (let _i775 = 0; _i775 < _a774.length; _i775++) {
                  const v_y = _a774[_i775];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i775]] || -1) !== 2)) {
                    _q770 = true;
                    break Q771;
                  }
                }
              }
            }
            _c776 = _q770;
          }
          if (!(_c776)) break L767;
          const _h799 = (_h768 < _h749);
          if (b.made[0] !== _m268_0) {
            _g777.length = 0;
            G778: {
              const _a785 = v_S;
              for (let _i786 = 0; _i786 < _a785.length; _i786++) {
                const v_c = _a785[_i786];
                let _q787 = false;
                Q788: {
                  const _a789 = sp.adj4[v_c];
                  for (let _i790 = 0; _i790 < _a789.length; _i790++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i790]] || -1) === 1)) {
                      _q787 = true;
                      break Q788;
                    }
                  }
                }
                if (!(!(_q787))) continue;
                _g777.push(v_c);
              }
            }
            if (!(sameSet(v_U, _g777))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _q791 = true;
          Q792: {
            const _a793 = v_S;
            for (let _i794 = 0; _i794 < _a793.length; _i794++) {
              const v_x = _a793[_i794];
              const _a795 = sp.adj4[v_x];
              for (let _i796 = 0; _i796 < _a795.length; _i796++) {
                const v_y = _a795[_i796];
                const _h798 = clueAt(cl.number, v_y);
                L797: {
                  const v_f = sp.adj4Edges[v_x][_i796];
                  let _c812: boolean = (((b.grid[v_f] || -1) !== 2) && (((v_O >> _h798) & 1) !== 0));
                  if (_c812) {
                    let _c805: boolean = (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])));
                    if (_c805) {
                      let _c804: boolean = _h799;
                      if (!_c804) {
                        const _t800 = sp.edgeEnds[2 * v_f];
                        const _h801 = clueAt(cl.number, _t800);
                        const _t802 = sp.edgeEnds[2 * v_f + 1];
                        const _h803 = clueAt(cl.number, _t802);
                        _c804 = (_h801 === _h803);
                      }
                      _c805 = _c804;
                    }
                    let _c811: boolean = _c805;
                    if (!_c811) {
                      let _c810: boolean = _h799;
                      if (_c810) {
                        const _t806 = sp.edgeEnds[2 * v_f];
                        const _h807 = clueAt(cl.number, _t806);
                        const _t808 = sp.edgeEnds[2 * v_f + 1];
                        const _h809 = clueAt(cl.number, _t808);
                        _c810 = (_h807 === _h809);
                      }
                      _c811 = (_c810 && !(((v_T.includes(sp.edgeEnds[2 * v_f])) && (v_T.includes(sp.edgeEnds[2 * v_f + 1])))));
                    }
                    _c812 = _c811;
                  }
                  if (!(_c812)) break L797;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q791 = false;
                    break Q792;
                  }
                }
              }
            }
          }
          if (!(_q791)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, S: v_S.slice(), U: v_U.slice(), T: v_T.slice(), O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const showingKept = keptStore<readonly number[]>();
let showingOn: object | null = null;
let showingAt: Kept<readonly number[]> = [];

/** `showing(a)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function showing(_sp: GridSpace, cl: Dealt, v_a: number): readonly number[] {
  if (cl !== showingOn) {
    showingAt = showingKept.board(cl);
    showingOn = cl;
  }
  const _kept: Kept<readonly number[]> = showingAt;
  if (_kept[v_a] !== undefined) return _kept[v_a];
  const _g38: number[] = [];
  G39: {
    const _a42 = cluesValued(cl.number, v_a);
    for (let _i43 = 0; _i43 < _a42.length; _i43++) {
      const v_c = _a42[_i43];
      if (!((clueAt(cl.number, v_c) === v_a))) continue;
      _g38.push(v_c);
    }
  }
  const _made = _g38;
  _kept[v_a] = _made;
  return _made;
}
