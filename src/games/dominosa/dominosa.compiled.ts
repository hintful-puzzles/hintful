// Compiled by `npm run describe` from src/games/dominosa/dominosa.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, edgeGroups, keptStore, minus, popcount, rangeMask, setOf, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  let _q753 = true;
  Q754: {
    const _a755 = sp.cells;
    for (let _i756 = 0; _i756 < _a755.length; _i756++) {
      const v_c = _a755[_i756];
      let _g757 = 0;
      G758: {
        const _a759 = sp.adj4[v_c];
        for (let _i760 = 0; _i760 < _a759.length; _i760++) {
          const _h761 = (g[sp.adj4Edges[v_c][_i760]] || -1);
          if (!((_h761 === 1))) continue;
          _g757++;
        }
      }
      if (!((_g757 === 1))) {
        _q753 = false;
        break Q754;
      }
    }
  }
  if (!(_q753)) return false;
  let _q762 = true;
  Q763: {
    const _a764 = sp.edges;
    for (let _i765 = 0; _i765 < _a764.length; _i765++) {
      const v_e = _a764[_i765];
      const _h768 = (g[v_e] || -1);
      const _h769 = (_h768 === 1);
      const _h771 = sp.edgeEnds[2 * v_e];
      const _h772 = clueAt(cl.number, _h771);
      const _h773 = _h772;
      const _h776 = sp.edgeEnds[2 * v_e + 1];
      const _h777 = clueAt(cl.number, _h776);
      const _h778 = _h777;
      const _a766 = sp.edges;
      for (let _i767 = 0; _i767 < _a766.length; _i767++) {
        const v_f = _a766[_i767];
        const _h770 = (g[v_f] || -1);
        if (!((((v_f !== v_e) && _h769) && (_h770 === 1)))) continue;
        const _t774 = sp.edgeEnds[2 * v_f];
        const _h775 = clueAt(cl.number, _t774);
        let _c781: boolean = (_h773 === _h775);
        if (_c781) {
          const _t779 = sp.edgeEnds[2 * v_f + 1];
          const _h780 = clueAt(cl.number, _t779);
          _c781 = (_h778 === _h780);
        }
        let _c787: boolean = _c781;
        if (!_c787) {
          const _t782 = sp.edgeEnds[2 * v_f + 1];
          const _h783 = clueAt(cl.number, _t782);
          let _c786: boolean = (_h773 === _h783);
          if (_c786) {
            const _t784 = sp.edgeEnds[2 * v_f];
            const _h785 = clueAt(cl.number, _t784);
            _c786 = (_h778 === _h785);
          }
          _c787 = _c786;
        }
        if (!(!(_c787))) {
          _q762 = false;
          break Q763;
        }
      }
    }
  }
  if (!(_q762)) return false;
  for (let _k788 = 0; _k788 < cl.number.at.length; _k788++) {
    const _at789 = cl.number.at[_k788];
    let _q791 = true;
    Q792: {
      const _a793 = sp.adj4[_at789];
      for (let _i794 = 0; _i794 < _a793.length; _i794++) {
        let _q795 = false;
        Q796: {
          const _a797 = sp.edges;
          for (let _i798 = 0; _i798 < _a797.length; _i798++) {
            const v_f = _a797[_i798];
            const _h799 = (g[v_f] || -1);
            if (!((_h799 === 1))) continue;
            const _t800 = sp.adj4Edges[_at789][_i794];
            const _t801 = sp.edgeEnds[2 * _t800];
            const _h802 = clueAt(cl.number, _t801);
            const _t803 = sp.edgeEnds[2 * v_f];
            const _h804 = clueAt(cl.number, _t803);
            let _c809: boolean = (_h802 === _h804);
            if (_c809) {
              const _t805 = sp.edgeEnds[2 * _t800 + 1];
              const _h806 = clueAt(cl.number, _t805);
              const _t807 = sp.edgeEnds[2 * v_f + 1];
              const _h808 = clueAt(cl.number, _t807);
              _c809 = (_h806 === _h808);
            }
            let _c819: boolean = _c809;
            if (!_c819) {
              const _t810 = sp.edgeEnds[2 * _t800];
              const _h811 = clueAt(cl.number, _t810);
              const _t812 = sp.edgeEnds[2 * v_f + 1];
              const _h813 = clueAt(cl.number, _t812);
              let _c818: boolean = (_h811 === _h813);
              if (_c818) {
                const _t814 = sp.edgeEnds[2 * _t800 + 1];
                const _h815 = clueAt(cl.number, _t814);
                const _t816 = sp.edgeEnds[2 * v_f];
                const _h817 = clueAt(cl.number, _t816);
                _c818 = (_h815 === _h817);
              }
              _c819 = _c818;
            }
            if (_c819) {
              _q795 = true;
              break Q796;
            }
          }
        }
        if (!(_q795)) {
          _q791 = false;
          break Q792;
        }
      }
    }
    if (!(_q791)) return false;
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
  for (let _i270 = 0; _i270 < _a269.length; _i270++) {
    const v_p = _a269[_i270];
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

/** Its dearest read grows with the board as n. */
export function localDuplicate2(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicate2Binding> | null): number {
  const _g410: number[] = [];
  const _g423: number[] = [];
  const _g466: number[] = [];
  const _g477: number[] = [];
  const facts = localDuplicate2Facts;
  let fired = 0;
  let changed = false;
  const _a402 = sp.edges;
  for (let _i403 = 0; _i403 < _a402.length; _i403++) {
    const v_p = _a402[_i403];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h460 = sp.edgeEnds[2 * v_p];
    const _h461 = sp.edgeEnds[2 * v_p + 1];
    const _t404 = sp.edgeEnds[2 * v_p];
    const _t405 = sp.edgeEnds[2 * v_p + 1];
    for (let _i406 = 0; _i406 < 2; _i406++) {
      const v_x = _i406 === 0 ? _t404 : _t405;
      if (_i406 === 1 && (v_x === _t404)) continue;
      const _a407 = sp.adj4[v_x];
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
  const _g524: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  _g524.length = 0;
  G525: {
    const _a528 = sp.edges;
    for (let _i529 = 0; _i529 < _a528.length; _i529++) {
      const v_e = _a528[_i529];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      _g524.push(v_e);
    }
  }
  const v_P = _g524;
  const _a530 = sp.edges;
  for (let _i531 = 0; _i531 < _a530.length; _i531++) {
    const v_p = _a530[_i531];
    const _h536 = sp.edgeEnds[2 * v_p + 1];
    const _h540 = sp.edgeEnds[2 * v_p];
    let _c542: boolean = !((b.grid[v_p] !== 0));
    if (_c542) {
      let _q532 = false;
      Q533: {
        const _a534 = sp.adj4[sp.edgeEnds[2 * v_p]];
        for (let _i535 = 0; _i535 < _a534.length; _i535++) {
          const v_x = _a534[_i535];
          const _h539 = (v_x !== _h536);
          const _h541 = sp.edgeOf(_h540, v_x);
          const _a537 = sp.adj4[_h536];
          for (let _i538 = 0; _i538 < _a537.length; _i538++) {
            const v_y = _a537[_i538];
            if (!(((_h539 && (v_y !== _h540)) && (sp.adj4[v_x].includes(v_y))))) continue;
            if (((((b.grid[_h541] || -1) !== 2) && ((b.grid[sp.adj4Edges[_h536][_i538]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
              _q532 = true;
              break Q533;
            }
          }
        }
      }
      _c542 = !(_q532);
    }
    if (!(_c542)) continue;
    const v_Q = minus(v_P, setOf(v_p));
    const _eg543 = edgeGroups(sp, v_Q);
    const _h546 = _eg543.of(sp.edgeEnds[2 * v_p + 1]).length;
    L544: {
      const v_A = _eg543.of(sp.edgeEnds[2 * v_p]);
      const _h545 = v_A.length;
      if (!(((!(_eg543.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((_h545 % 2) === 0)) && ((_h546 % 2) === 0)))) break L544;
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
  const _g589: number[] = [];
  const _g606: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  const _k586 = showingKept.board(cl);
  const _t585 = cl.n;
  for (let v_a = 0; v_a <= _t585; v_a++) {
    L587: {
      const v_S = (_k586[v_a] ?? showing(sp, cl, v_a));
      const _h588 = v_S.length;
      if (!((_h588 <= 16))) break L587;
      const _h608 = (_h588 - 2);
      _g589.length = 0;
      G590: {
        const _a597 = v_S;
        for (let _i598 = 0; _i598 < _a597.length; _i598++) {
          const v_c = _a597[_i598];
          let _q599 = false;
          Q600: {
            const _a601 = sp.adj4[v_c];
            for (let _i602 = 0; _i602 < _a601.length; _i602++) {
              if (((b.grid[sp.adj4Edges[v_c][_i602]] || -1) === 1)) {
                _q599 = true;
                break Q600;
              }
            }
          }
          if (!(!(_q599))) continue;
          _g589.push(v_c);
        }
      }
      const v_U = _g589;
      const _e603 = v_U;
      const _pm615: number[] = [];
      let _pp616 = -1;
      for (let _k604 = 0; _k604 < 1 << _e603.length; _k604++) {
        if (!(popcount(_k604) >= 2)) continue;
        const v_T = _g606;
        v_T.length = 0;
        for (let _j605 = 0; _j605 < _e603.length; _j605++) if ((_k604 >> (_e603.length - 1 - _j605)) & 1) v_T.push(_e603[_j605]);
        const _h607 = v_T.length;
        if (!(((_h607 >= 2) && (_h607 <= _h608)))) continue;
        let _g609 = 0;
        if (_pp616 !== b.placed) {
          _pp616 = b.placed;
          for (let _j617 = 0; _j617 < _e603.length; _j617++) {
            const v_m618 = _e603[_j617];
            let _g619 = 0;
            G620: {
              const _a623 = sp.adj4[v_m618];
              for (let _i624 = 0; _i624 < _a623.length; _i624++) {
                const v_y = _a623[_i624];
                if (!(((b.grid[sp.adj4Edges[v_m618][_i624]] || -1) !== 2))) continue;
                const _t625 = clueAt(cl.number, v_y);
                _g619 |= 1 << _t625;
              }
            }
            _pm615[_j617] = _g619;
          }
        }
        for (let _j617 = 0; _j617 < _e603.length; _j617++) if ((_k604 >> (_e603.length - 1 - _j617)) & 1) _g609 |= _pm615[_j617];
        L626: {
          const v_O = _g609;
          const _h627 = popcount(v_O);
          let _c634: boolean = (_h627 === _h607);
          if (_c634) {
            let _q628 = false;
            Q629: {
              const _a630 = v_T;
              for (let _i631 = 0; _i631 < _a630.length; _i631++) {
                const v_x = _a630[_i631];
                const _a632 = sp.adj4[v_x];
                for (let _i633 = 0; _i633 < _a632.length; _i633++) {
                  const v_y = _a632[_i633];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i633]] || -1) !== 2)) {
                    _q628 = true;
                    break Q629;
                  }
                }
              }
            }
            _c634 = !(_q628);
          }
          if (!(_c634)) break L626;
          facts.length = 0;
          changed = false;
          let _q635 = true;
          Q636: {
            const _a637 = v_S;
            for (let _i638 = 0; _i638 < _a637.length; _i638++) {
              const v_x = _a637[_i638];
              const _a639 = sp.adj4[v_x];
              for (let _i640 = 0; _i640 < _a639.length; _i640++) {
                const v_y = _a639[_i640];
                const _h642 = clueAt(cl.number, v_y);
                L641: {
                  const v_f = sp.adj4Edges[v_x][_i640];
                  if (!(((((b.grid[v_f] || -1) !== 2) && (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])))) && (((v_O >> _h642) & 1) !== 0)))) break L641;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q635 = false;
                    break Q636;
                  }
                }
              }
            }
          }
          if (!(_q635)) return -1;
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
  const _g685: number[] = [];
  const _g702: number[] = [];
  const facts = setDoublesFacts;
  let fired = 0;
  let changed = false;
  const _k682 = showingKept.board(cl);
  const _t681 = cl.n;
  for (let v_a = 0; v_a <= _t681; v_a++) {
    L683: {
      const v_S = (_k682[v_a] ?? showing(sp, cl, v_a));
      const _h684 = v_S.length;
      if (!((_h684 <= 16))) break L683;
      const _h723 = (_h684 - 2);
      _g685.length = 0;
      G686: {
        const _a693 = v_S;
        for (let _i694 = 0; _i694 < _a693.length; _i694++) {
          const v_c = _a693[_i694];
          let _q695 = false;
          Q696: {
            const _a697 = sp.adj4[v_c];
            for (let _i698 = 0; _i698 < _a697.length; _i698++) {
              if (((b.grid[sp.adj4Edges[v_c][_i698]] || -1) === 1)) {
                _q695 = true;
                break Q696;
              }
            }
          }
          if (!(!(_q695))) continue;
          _g685.push(v_c);
        }
      }
      const v_U = _g685;
      const _e699 = v_U;
      const _pm710: number[] = [];
      let _pp711 = -1;
      for (let _k700 = 0; _k700 < 1 << _e699.length; _k700++) {
        if (!(popcount(_k700) >= 3)) continue;
        const v_T = _g702;
        v_T.length = 0;
        for (let _j701 = 0; _j701 < _e699.length; _j701++) if ((_k700 >> (_e699.length - 1 - _j701)) & 1) v_T.push(_e699[_j701]);
        const _h703 = v_T.length;
        if (!((_h703 >= 3))) continue;
        let _g704 = 0;
        if (_pp711 !== b.placed) {
          _pp711 = b.placed;
          for (let _j712 = 0; _j712 < _e699.length; _j712++) {
            const v_m713 = _e699[_j712];
            let _g714 = 0;
            G715: {
              const _a718 = sp.adj4[v_m713];
              for (let _i719 = 0; _i719 < _a718.length; _i719++) {
                const v_y = _a718[_i719];
                if (!(((b.grid[sp.adj4Edges[v_m713][_i719]] || -1) !== 2))) continue;
                const _t720 = clueAt(cl.number, v_y);
                _g714 |= 1 << _t720;
              }
            }
            _pm710[_j712] = _g714;
          }
        }
        for (let _j712 = 0; _j712 < _e699.length; _j712++) if ((_k700 >> (_e699.length - 1 - _j712)) & 1) _g704 |= _pm710[_j712];
        L721: {
          const v_O = _g704;
          const _h722 = popcount(v_O);
          let _c730: boolean = (((2 <= _h722) && (_h722 <= _h723)) && ((_h722 === _h703) || (_h722 === (_h703 - 1))));
          if (_c730) {
            let _q724 = false;
            Q725: {
              const _a726 = v_T;
              for (let _i727 = 0; _i727 < _a726.length; _i727++) {
                const v_x = _a726[_i727];
                const _a728 = sp.adj4[v_x];
                for (let _i729 = 0; _i729 < _a728.length; _i729++) {
                  const v_y = _a728[_i729];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i729]] || -1) !== 2)) {
                    _q724 = true;
                    break Q725;
                  }
                }
              }
            }
            _c730 = _q724;
          }
          if (!(_c730)) break L721;
          const _h739 = (_h722 < _h703);
          facts.length = 0;
          changed = false;
          let _q731 = true;
          Q732: {
            const _a733 = v_S;
            for (let _i734 = 0; _i734 < _a733.length; _i734++) {
              const v_x = _a733[_i734];
              const _a735 = sp.adj4[v_x];
              for (let _i736 = 0; _i736 < _a735.length; _i736++) {
                const v_y = _a735[_i736];
                const _h738 = clueAt(cl.number, v_y);
                L737: {
                  const v_f = sp.adj4Edges[v_x][_i736];
                  let _c752: boolean = (((b.grid[v_f] || -1) !== 2) && (((v_O >> _h738) & 1) !== 0));
                  if (_c752) {
                    let _c745: boolean = (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])));
                    if (_c745) {
                      let _c744: boolean = _h739;
                      if (!_c744) {
                        const _t740 = sp.edgeEnds[2 * v_f];
                        const _h741 = clueAt(cl.number, _t740);
                        const _t742 = sp.edgeEnds[2 * v_f + 1];
                        const _h743 = clueAt(cl.number, _t742);
                        _c744 = (_h741 === _h743);
                      }
                      _c745 = _c744;
                    }
                    let _c751: boolean = _c745;
                    if (!_c751) {
                      let _c750: boolean = _h739;
                      if (_c750) {
                        const _t746 = sp.edgeEnds[2 * v_f];
                        const _h747 = clueAt(cl.number, _t746);
                        const _t748 = sp.edgeEnds[2 * v_f + 1];
                        const _h749 = clueAt(cl.number, _t748);
                        _c750 = (_h747 === _h749);
                      }
                      _c751 = (_c750 && !(((v_T.includes(sp.edgeEnds[2 * v_f])) && (v_T.includes(sp.edgeEnds[2 * v_f + 1])))));
                    }
                    _c752 = _c751;
                  }
                  if (!(_c752)) break L737;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q731 = false;
                    break Q732;
                  }
                }
              }
            }
          }
          if (!(_q731)) return -1;
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
