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
  let _q735 = true;
  Q736: {
    const _a737 = sp.cells;
    for (let _i738 = 0; _i738 < _a737.length; _i738++) {
      const v_c = _a737[_i738];
      let _g739 = 0;
      G740: {
        const _a741 = sp.adj4[v_c];
        for (let _i742 = 0; _i742 < _a741.length; _i742++) {
          const _h743 = (g[sp.adj4Edges[v_c][_i742]] || -1);
          if (!((_h743 === 1))) continue;
          _g739++;
        }
      }
      if (!((_g739 === 1))) {
        _q735 = false;
        break Q736;
      }
    }
  }
  if (!(_q735)) return false;
  let _q744 = true;
  Q745: {
    const _a746 = sp.edges;
    for (let _i747 = 0; _i747 < _a746.length; _i747++) {
      const v_e = _a746[_i747];
      const _h750 = (g[v_e] || -1);
      const _h751 = (_h750 === 1);
      const _h753 = sp.edgeEnds[2 * v_e];
      const _h754 = clueAt(cl.number, _h753);
      const _h755 = _h754;
      const _h758 = sp.edgeEnds[2 * v_e + 1];
      const _h759 = clueAt(cl.number, _h758);
      const _h760 = _h759;
      const _a748 = sp.edges;
      for (let _i749 = 0; _i749 < _a748.length; _i749++) {
        const v_f = _a748[_i749];
        const _h752 = (g[v_f] || -1);
        if (!((((v_f !== v_e) && _h751) && (_h752 === 1)))) continue;
        const _t756 = sp.edgeEnds[2 * v_f];
        const _h757 = clueAt(cl.number, _t756);
        let _c763: boolean = (_h755 === _h757);
        if (_c763) {
          const _t761 = sp.edgeEnds[2 * v_f + 1];
          const _h762 = clueAt(cl.number, _t761);
          _c763 = (_h760 === _h762);
        }
        let _c769: boolean = _c763;
        if (!_c769) {
          const _t764 = sp.edgeEnds[2 * v_f + 1];
          const _h765 = clueAt(cl.number, _t764);
          let _c768: boolean = (_h755 === _h765);
          if (_c768) {
            const _t766 = sp.edgeEnds[2 * v_f];
            const _h767 = clueAt(cl.number, _t766);
            _c768 = (_h760 === _h767);
          }
          _c769 = _c768;
        }
        if (!(!(_c769))) {
          _q744 = false;
          break Q745;
        }
      }
    }
  }
  if (!(_q744)) return false;
  for (let _k770 = 0; _k770 < cl.number.at.length; _k770++) {
    const _at771 = cl.number.at[_k770];
    let _q773 = true;
    Q774: {
      const _a775 = sp.adj4[_at771];
      for (let _i776 = 0; _i776 < _a775.length; _i776++) {
        let _q777 = false;
        Q778: {
          const _a779 = sp.edges;
          for (let _i780 = 0; _i780 < _a779.length; _i780++) {
            const v_f = _a779[_i780];
            const _h781 = (g[v_f] || -1);
            if (!((_h781 === 1))) continue;
            const _t782 = sp.adj4Edges[_at771][_i776];
            const _t783 = sp.edgeEnds[2 * _t782];
            const _h784 = clueAt(cl.number, _t783);
            const _t785 = sp.edgeEnds[2 * v_f];
            const _h786 = clueAt(cl.number, _t785);
            let _c791: boolean = (_h784 === _h786);
            if (_c791) {
              const _t787 = sp.edgeEnds[2 * _t782 + 1];
              const _h788 = clueAt(cl.number, _t787);
              const _t789 = sp.edgeEnds[2 * v_f + 1];
              const _h790 = clueAt(cl.number, _t789);
              _c791 = (_h788 === _h790);
            }
            let _c801: boolean = _c791;
            if (!_c801) {
              const _t792 = sp.edgeEnds[2 * _t782];
              const _h793 = clueAt(cl.number, _t792);
              const _t794 = sp.edgeEnds[2 * v_f + 1];
              const _h795 = clueAt(cl.number, _t794);
              let _c800: boolean = (_h793 === _h795);
              if (_c800) {
                const _t796 = sp.edgeEnds[2 * _t782 + 1];
                const _h797 = clueAt(cl.number, _t796);
                const _t798 = sp.edgeEnds[2 * v_f];
                const _h799 = clueAt(cl.number, _t798);
                _c800 = (_h797 === _h799);
              }
              _c801 = _c800;
            }
            if (_c801) {
              _q777 = true;
              break Q778;
            }
          }
        }
        if (!(_q777)) {
          _q773 = false;
          break Q774;
        }
      }
    }
    if (!(_q773)) return false;
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

/** Its dearest read grows with the board as 1. */
export function onlySpot(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlySpotBinding> | null): number {
  const _g57: number[] = [];
  const facts = onlySpotFacts;
  let fired = 0;
  let changed = false;
  const _t55 = cl.n;
  for (let v_a = 0; v_a <= _t55; v_a++) {
    const _t56 = cl.n;
    for (let v_b = v_a; v_b <= _t56; v_b++) {
      _g57.length = 0;
      G58: {
        const _a63 = showing(sp, cl, v_a);
        for (let _i64 = 0; _i64 < _a63.length; _i64++) {
          const v_x = _a63[_i64];
          const _a65 = sp.adj4[v_x];
          for (let _i66 = 0; _i66 < _a65.length; _i66++) {
            const v_y = _a65[_i66];
            const _h67 = clueAt(cl.number, v_y);
            if (!(((_h67 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i66]] || -1) !== 2)))) continue;
            const _t68 = sp.adj4Edges[v_x][_i66];
            if (!_g57.includes(_t68)) _g57.push(_t68);
          }
        }
      }
      L69: {
        const v_P = _g57;
        const _h70 = v_P.length;
        if (!((_h70 === 1))) break L69;
        L71: {
          const v_e = (v_P[0] ?? -1);
          if (!(!((b.grid[v_e] !== 0)))) break L71;
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

/** Its dearest read grows with the board as n. */
export function squareOnly(b: Marks, sp: GridSpace, fire: Fire<SquareOnlyBinding> | null): number {
  const _g89: number[] = [];
  const facts = squareOnlyFacts;
  let fired = 0;
  let changed = false;
  const _a87 = sp.cells;
  for (let _i88 = 0; _i88 < _a87.length; _i88++) {
    const v_c = _a87[_i88];
    _g89.length = 0;
    G90: {
      const _a93 = sp.adj4[v_c];
      for (let _i94 = 0; _i94 < _a93.length; _i94++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i94]] || -1) !== 2))) continue;
        const _t95 = sp.adj4Edges[v_c][_i94];
        if (!_g89.includes(_t95)) _g89.push(_t95);
      }
    }
    L96: {
      const v_S = _g89;
      const _h97 = v_S.length;
      let _c102: boolean = (_h97 <= 1);
      if (_c102) {
        let _q98 = false;
        Q99: {
          const _a100 = v_S;
          for (let _i101 = 0; _i101 < _a100.length; _i101++) {
            const v_f = _a100[_i101];
            if ((b.grid[v_f] !== 0)) {
              _q98 = true;
              break Q99;
            }
          }
        }
        _c102 = !(_q98);
      }
      if (!(_c102)) break L96;
      facts.length = 0;
      changed = false;
      let _c104: boolean = (_h97 === 1);
      if (_c104) {
        const _t103 = (v_S[0] ?? -1);
        if (!(b.grid[_t103] !== 0)) { if (fire === null) { b.placeAt(_t103, 1); changed = true; } else facts.push(PLACE, _t103, 1); }
        _c104 = true;
      }
      if (!(_c104)) return -1;
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

/** Its dearest read grows with the board as n^2. */
export function squareSingleDomino(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareSingleDominoBinding> | null): number {
  const _g133: number[] = [];
  const facts = squareSingleDominoFacts;
  let fired = 0;
  let changed = false;
  const _a131 = sp.cells;
  for (let _i132 = 0; _i132 < _a131.length; _i132++) {
    const v_c = _a131[_i132];
    _g133.length = 0;
    G134: {
      const _a137 = sp.adj4[v_c];
      for (let _i138 = 0; _i138 < _a137.length; _i138++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i138]] || -1) !== 2))) continue;
        const _t139 = sp.adj4Edges[v_c][_i138];
        if (!_g133.includes(_t139)) _g133.push(_t139);
      }
    }
    L140: {
      const v_S = _g133;
      const _h141 = v_S.length;
      if (!((_h141 >= 2))) break L140;
      L142: {
        const v_s = (v_S[0] ?? -1);
        const _h149 = sp.edgeEnds[2 * v_s];
        const _h150 = clueAt(cl.number, _h149);
        const _h151 = _h150;
        const _h154 = sp.edgeEnds[2 * v_s + 1];
        const _h155 = clueAt(cl.number, _h154);
        const _h156 = _h155;
        let _q143 = true;
        Q144: {
          const _a145 = v_S;
          for (let _i146 = 0; _i146 < _a145.length; _i146++) {
            const v_f = _a145[_i146];
            const _t147 = sp.edgeEnds[2 * v_f];
            const _h148 = clueAt(cl.number, _t147);
            let _c157: boolean = (_h148 === _h151);
            if (_c157) {
              const _t152 = sp.edgeEnds[2 * v_f + 1];
              const _h153 = clueAt(cl.number, _t152);
              _c157 = (_h153 === _h156);
            }
            let _c163: boolean = _c157;
            if (!_c163) {
              const _t158 = sp.edgeEnds[2 * v_f];
              const _h159 = clueAt(cl.number, _t158);
              let _c162: boolean = (_h159 === _h156);
              if (_c162) {
                const _t160 = sp.edgeEnds[2 * v_f + 1];
                const _h161 = clueAt(cl.number, _t160);
                _c162 = (_h161 === _h151);
              }
              _c163 = _c162;
            }
            if (!(_c163)) {
              _q143 = false;
              break Q144;
            }
          }
        }
        if (!(_q143)) break L142;
        facts.length = 0;
        changed = false;
        let _q164 = true;
        Q165: {
          const _a166 = sp.edges;
          for (let _i167 = 0; _i167 < _a166.length; _i167++) {
            const v_f = _a166[_i167];
            let _c179: boolean = (!(v_S.includes(v_f)) && ((b.grid[v_f] || -1) !== 2));
            if (_c179) {
              const _t168 = sp.edgeEnds[2 * v_f];
              const _h169 = clueAt(cl.number, _t168);
              let _c172: boolean = (_h169 === _h151);
              if (_c172) {
                const _t170 = sp.edgeEnds[2 * v_f + 1];
                const _h171 = clueAt(cl.number, _t170);
                _c172 = (_h171 === _h156);
              }
              let _c178: boolean = _c172;
              if (!_c178) {
                const _t173 = sp.edgeEnds[2 * v_f];
                const _h174 = clueAt(cl.number, _t173);
                let _c177: boolean = (_h174 === _h156);
                if (_c177) {
                  const _t175 = sp.edgeEnds[2 * v_f + 1];
                  const _h176 = clueAt(cl.number, _t175);
                  _c177 = (_h176 === _h151);
                }
                _c178 = _c177;
              }
              _c179 = _c178;
            }
            if (!(_c179)) continue;
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
            if (!(true)) {
              _q164 = false;
              break Q165;
            }
          }
        }
        if (!(_q164)) return -1;
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

/** Its dearest read grows with the board as 1. */
export function mustOverlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustOverlapBinding> | null): number {
  const _g196: number[] = [];
  const facts = mustOverlapFacts;
  let fired = 0;
  let changed = false;
  const _t194 = cl.n;
  for (let v_a = 0; v_a <= _t194; v_a++) {
    const _t195 = cl.n;
    for (let v_b = v_a; v_b <= _t195; v_b++) {
      _g196.length = 0;
      G197: {
        const _a202 = showing(sp, cl, v_a);
        for (let _i203 = 0; _i203 < _a202.length; _i203++) {
          const v_x = _a202[_i203];
          const _a204 = sp.adj4[v_x];
          for (let _i205 = 0; _i205 < _a204.length; _i205++) {
            const v_y = _a204[_i205];
            const _h206 = clueAt(cl.number, v_y);
            if (!(((_h206 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i205]] || -1) !== 2)))) continue;
            const _t207 = sp.adj4Edges[v_x][_i205];
            if (!_g196.includes(_t207)) _g196.push(_t207);
          }
        }
      }
      L208: {
        const v_P = _g196;
        const _h209 = v_P.length;
        if (!((_h209 >= 2))) break L208;
        const v_e = (v_P[0] ?? -1);
        facts.length = 0;
        changed = false;
        let _q210 = true;
        Q211: {
          const _t212 = sp.edgeEnds[2 * v_e];
          const _t213 = sp.edgeEnds[2 * v_e + 1];
          for (let _i214 = 0; _i214 < 2; _i214++) {
            const v_x = _i214 === 0 ? _t212 : _t213;
            if (_i214 === 1 && (v_x === _t212)) continue;
            const _a215 = sp.adj4[v_x];
            for (let _i216 = 0; _i216 < _a215.length; _i216++) {
              const _h221 = sp.adj4Edges[v_x][_i216];
              const _h222 = sp.edgeEnds[2 * _h221];
              const _h223 = sp.edgeEnds[2 * _h221 + 1];
              let _c224: boolean = (!(v_P.includes(sp.adj4Edges[v_x][_i216])) && ((b.grid[sp.adj4Edges[v_x][_i216]] || -1) !== 2));
              if (_c224) {
                let _q217 = true;
                Q218: {
                  const _a219 = v_P;
                  for (let _i220 = 0; _i220 < _a219.length; _i220++) {
                    const v_f = _a219[_i220];
                    if (!(((((sp.edgeEnds[2 * v_f] === _h222) || (sp.edgeEnds[2 * v_f] === _h223)) || (sp.edgeEnds[2 * v_f + 1] === _h222)) || (sp.edgeEnds[2 * v_f + 1] === _h223)))) {
                      _q217 = false;
                      break Q218;
                    }
                  }
                }
                _c224 = _q217;
              }
              if (!(_c224)) continue;
              const _t225 = sp.adj4Edges[v_x][_i216];
              if (!(b.grid[_t225] !== 0)) { if (fire === null) { b.placeAt(_t225, 2); changed = true; } else facts.push(PLACE, _t225, 2); }
              if (!(true)) {
                _q210 = false;
                break Q211;
              }
            }
          }
        }
        if (!(_q210)) return -1;
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

/** Its dearest read grows with the board as n. */
export function localDuplicate(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicateBinding> | null): number {
  const _g269: number[] = [];
  const facts = localDuplicateFacts;
  let fired = 0;
  let changed = false;
  const _a259 = sp.edges;
  for (let _i260 = 0; _i260 < _a259.length; _i260++) {
    const v_p = _a259[_i260];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h282 = sp.edgeEnds[2 * v_p];
    const _h283 = clueAt(cl.number, _h282);
    const _h284 = _h283;
    const _h287 = sp.edgeEnds[2 * v_p + 1];
    const _h288 = clueAt(cl.number, _h287);
    const _h289 = _h288;
    const _t261 = sp.edgeEnds[2 * v_p];
    const _t262 = sp.edgeEnds[2 * v_p + 1];
    for (let _i263 = 0; _i263 < 2; _i263++) {
      const v_x = _i263 === 0 ? _t261 : _t262;
      if (_i263 === 1 && (v_x === _t261)) continue;
      const _a264 = sp.adj4[v_x];
      for (let _i265 = 0; _i265 < _a264.length; _i265++) {
        const v_y = _a264[_i265];
        L266: {
          const v_q = sp.adj4Edges[v_x][_i265];
          let _c297: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
          if (_c297) {
            let _q267 = true;
            Q268: {
              _g269.length = 0;
              G270: {
                const _a275 = sp.adj4[v_y];
                for (let _i276 = 0; _i276 < _a275.length; _i276++) {
                  if (!(((b.grid[sp.adj4Edges[v_y][_i276]] || -1) !== 2))) continue;
                  const _t277 = sp.adj4Edges[v_y][_i276];
                  if (!_g269.includes(_t277)) _g269.push(_t277);
                }
              }
              const _a278 = _g269;
              for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                const v_r = _a278[_i279];
                if (!((v_r !== v_q))) continue;
                const _t280 = sp.edgeEnds[2 * v_r];
                const _h281 = clueAt(cl.number, _t280);
                let _c290: boolean = (_h281 === _h284);
                if (_c290) {
                  const _t285 = sp.edgeEnds[2 * v_r + 1];
                  const _h286 = clueAt(cl.number, _t285);
                  _c290 = (_h286 === _h289);
                }
                let _c296: boolean = _c290;
                if (!_c296) {
                  const _t291 = sp.edgeEnds[2 * v_r];
                  const _h292 = clueAt(cl.number, _t291);
                  let _c295: boolean = (_h292 === _h289);
                  if (_c295) {
                    const _t293 = sp.edgeEnds[2 * v_r + 1];
                    const _h294 = clueAt(cl.number, _t293);
                    _c295 = (_h294 === _h284);
                  }
                  _c296 = _c295;
                }
                if (!(_c296)) {
                  _q267 = false;
                  break Q268;
                }
              }
            }
            _c297 = _q267;
          }
          if (!(_c297)) break L266;
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
  const _g398: number[] = [];
  const _g411: number[] = [];
  const _g452: number[] = [];
  const _g463: number[] = [];
  const facts = localDuplicate2Facts;
  let fired = 0;
  let changed = false;
  const _a390 = sp.edges;
  for (let _i391 = 0; _i391 < _a390.length; _i391++) {
    const v_p = _a390[_i391];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h446 = sp.edgeEnds[2 * v_p];
    const _h447 = sp.edgeEnds[2 * v_p + 1];
    const _t392 = sp.edgeEnds[2 * v_p];
    const _t393 = sp.edgeEnds[2 * v_p + 1];
    for (let _i394 = 0; _i394 < 2; _i394++) {
      const v_x = _i394 === 0 ? _t392 : _t393;
      if (_i394 === 1 && (v_x === _t392)) continue;
      const _a395 = sp.adj4[v_x];
      for (let _i396 = 0; _i396 < _a395.length; _i396++) {
        const v_y = _a395[_i396];
        L397: {
          const v_q = sp.adj4Edges[v_x][_i396];
          if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) break L397;
          const _h489 = sp.edgeEnds[2 * v_q];
          const _h490 = sp.edgeEnds[2 * v_q + 1];
          _g398.length = 0;
          G399: {
            _g411.length = 0;
            G412: {
              const _a417 = sp.adj4[v_y];
              for (let _i418 = 0; _i418 < _a417.length; _i418++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i418]] || -1) !== 2))) continue;
                const _t419 = sp.adj4Edges[v_y][_i418];
                if (!_g411.includes(_t419)) _g411.push(_t419);
              }
            }
            const _a420 = _g411;
            for (let _i421 = 0; _i421 < _a420.length; _i421++) {
              const v_r = _a420[_i421];
              if (!((v_r !== v_q))) continue;
              _g398.push(v_r);
            }
          }
          L422: {
            const v_R = _g398;
            const _h423 = v_R.length;
            if (!((_h423 >= 1))) break L422;
            L424: {
              const v_d = (v_R[0] ?? -1);
              const _h431 = sp.edgeEnds[2 * v_d];
              const _h432 = clueAt(cl.number, _h431);
              const _h433 = _h432;
              const _h436 = sp.edgeEnds[2 * v_d + 1];
              const _h437 = clueAt(cl.number, _h436);
              const _h438 = _h437;
              let _q425 = true;
              Q426: {
                const _a427 = v_R;
                for (let _i428 = 0; _i428 < _a427.length; _i428++) {
                  const v_r = _a427[_i428];
                  const _t429 = sp.edgeEnds[2 * v_r];
                  const _h430 = clueAt(cl.number, _t429);
                  let _c439: boolean = (_h430 === _h433);
                  if (_c439) {
                    const _t434 = sp.edgeEnds[2 * v_r + 1];
                    const _h435 = clueAt(cl.number, _t434);
                    _c439 = (_h435 === _h438);
                  }
                  let _c445: boolean = _c439;
                  if (!_c445) {
                    const _t440 = sp.edgeEnds[2 * v_r];
                    const _h441 = clueAt(cl.number, _t440);
                    let _c444: boolean = (_h441 === _h438);
                    if (_c444) {
                      const _t442 = sp.edgeEnds[2 * v_r + 1];
                      const _h443 = clueAt(cl.number, _t442);
                      _c444 = (_h443 === _h433);
                    }
                    _c445 = _c444;
                  }
                  if (!(_c445)) {
                    _q425 = false;
                    break Q426;
                  }
                }
              }
              if (!(_q425)) break L424;
              for (let _i448 = 0; _i448 < 2; _i448++) {
                const v_x2 = _i448 === 0 ? _h446 : _h447;
                if (_i448 === 1 && (v_x2 === _h446)) continue;
                const _a449 = sp.adj4[v_x2];
                for (let _i450 = 0; _i450 < _a449.length; _i450++) {
                  const v_z = _a449[_i450];
                  L451: {
                    const v_q2 = sp.adj4Edges[v_x2][_i450];
                    if (!((((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)))) break L451;
                    _g452.length = 0;
                    G453: {
                      _g463.length = 0;
                      G464: {
                        const _a467 = sp.adj4[v_z];
                        for (let _i468 = 0; _i468 < _a467.length; _i468++) {
                          if (!(((b.grid[sp.adj4Edges[v_z][_i468]] || -1) !== 2))) continue;
                          const _t469 = sp.adj4Edges[v_z][_i468];
                          if (!_g463.includes(_t469)) _g463.push(_t469);
                        }
                      }
                      const _a470 = _g463;
                      for (let _i471 = 0; _i471 < _a470.length; _i471++) {
                        const v_r = _a470[_i471];
                        if (!((v_r !== v_q2))) continue;
                        _g452.push(v_r);
                      }
                    }
                    L472: {
                      const v_S = _g452;
                      const _h473 = v_S.length;
                      let _c491: boolean = (_h473 >= 1);
                      if (_c491) {
                        let _q474 = true;
                        Q475: {
                          const _a476 = v_S;
                          for (let _i477 = 0; _i477 < _a476.length; _i477++) {
                            const v_r = _a476[_i477];
                            const _t478 = sp.edgeEnds[2 * v_r];
                            const _h479 = clueAt(cl.number, _t478);
                            let _c482: boolean = (_h479 === _h433);
                            if (_c482) {
                              const _t480 = sp.edgeEnds[2 * v_r + 1];
                              const _h481 = clueAt(cl.number, _t480);
                              _c482 = (_h481 === _h438);
                            }
                            let _c488: boolean = _c482;
                            if (!_c488) {
                              const _t483 = sp.edgeEnds[2 * v_r];
                              const _h484 = clueAt(cl.number, _t483);
                              let _c487: boolean = (_h484 === _h438);
                              if (_c487) {
                                const _t485 = sp.edgeEnds[2 * v_r + 1];
                                const _h486 = clueAt(cl.number, _t485);
                                _c487 = (_h486 === _h433);
                              }
                              _c488 = _c487;
                            }
                            if (!((_c488 && !(((((sp.edgeEnds[2 * v_r] === _h489) || (sp.edgeEnds[2 * v_r] === _h490)) || (sp.edgeEnds[2 * v_r + 1] === _h489)) || (sp.edgeEnds[2 * v_r + 1] === _h490)))))) {
                              _q474 = false;
                              break Q475;
                            }
                          }
                        }
                        _c491 = _q474;
                      }
                      if (!(_c491)) break L472;
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
  const _g508: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  _g508.length = 0;
  G509: {
    const _a512 = sp.edges;
    for (let _i513 = 0; _i513 < _a512.length; _i513++) {
      const v_e = _a512[_i513];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      _g508.push(v_e);
    }
  }
  const v_P = _g508;
  const _a514 = sp.edges;
  for (let _i515 = 0; _i515 < _a514.length; _i515++) {
    const v_p = _a514[_i515];
    const _h520 = sp.edgeEnds[2 * v_p + 1];
    const _h524 = sp.edgeEnds[2 * v_p];
    let _c526: boolean = !((b.grid[v_p] !== 0));
    if (_c526) {
      let _q516 = false;
      Q517: {
        const _a518 = sp.adj4[sp.edgeEnds[2 * v_p]];
        for (let _i519 = 0; _i519 < _a518.length; _i519++) {
          const v_x = _a518[_i519];
          const _h523 = (v_x !== _h520);
          const _h525 = sp.edgeOf(_h524, v_x);
          const _a521 = sp.adj4[_h520];
          for (let _i522 = 0; _i522 < _a521.length; _i522++) {
            const v_y = _a521[_i522];
            if (!(((_h523 && (v_y !== _h524)) && (sp.adj4[v_x].includes(v_y))))) continue;
            if (((((b.grid[_h525] || -1) !== 2) && ((b.grid[sp.adj4Edges[_h520][_i522]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
              _q516 = true;
              break Q517;
            }
          }
        }
      }
      _c526 = !(_q516);
    }
    if (!(_c526)) continue;
    const v_Q = minus(v_P, setOf(v_p));
    const _eg527 = edgeGroups(sp, v_Q);
    const _h530 = _eg527.of(sp.edgeEnds[2 * v_p + 1]).length;
    L528: {
      const v_A = _eg527.of(sp.edgeEnds[2 * v_p]);
      const _h529 = v_A.length;
      if (!(((!(_eg527.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((_h529 % 2) === 0)) && ((_h530 % 2) === 0)))) break L528;
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
  const _g572: number[] = [];
  const _g589: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  const _t569 = cl.n;
  for (let v_a = 0; v_a <= _t569; v_a++) {
    L570: {
      const v_S = showing(sp, cl, v_a);
      const _h571 = v_S.length;
      if (!((_h571 <= 16))) break L570;
      const _h591 = (_h571 - 2);
      _g572.length = 0;
      G573: {
        const _a580 = v_S;
        for (let _i581 = 0; _i581 < _a580.length; _i581++) {
          const v_c = _a580[_i581];
          let _q582 = false;
          Q583: {
            const _a584 = sp.adj4[v_c];
            for (let _i585 = 0; _i585 < _a584.length; _i585++) {
              if (((b.grid[sp.adj4Edges[v_c][_i585]] || -1) === 1)) {
                _q582 = true;
                break Q583;
              }
            }
          }
          if (!(!(_q582))) continue;
          _g572.push(v_c);
        }
      }
      const v_U = _g572;
      const _e586 = v_U;
      const _pm598: number[] = [];
      let _pp599 = -1;
      for (let _k587 = 0; _k587 < 1 << _e586.length; _k587++) {
        if (!(popcount(_k587) >= 2)) continue;
        const v_T = _g589;
        v_T.length = 0;
        for (let _j588 = 0; _j588 < _e586.length; _j588++) if ((_k587 >> (_e586.length - 1 - _j588)) & 1) v_T.push(_e586[_j588]);
        const _h590 = v_T.length;
        if (!(((_h590 >= 2) && (_h590 <= _h591)))) continue;
        let _g592 = 0;
        if (_pp599 !== b.placed) {
          _pp599 = b.placed;
          for (let _j600 = 0; _j600 < _e586.length; _j600++) {
            const v_m601 = _e586[_j600];
            let _g602 = 0;
            G603: {
              const _a606 = sp.adj4[v_m601];
              for (let _i607 = 0; _i607 < _a606.length; _i607++) {
                const v_y = _a606[_i607];
                if (!(((b.grid[sp.adj4Edges[v_m601][_i607]] || -1) !== 2))) continue;
                const _t608 = clueAt(cl.number, v_y);
                _g602 |= 1 << _t608;
              }
            }
            _pm598[_j600] = _g602;
          }
        }
        for (let _j600 = 0; _j600 < _e586.length; _j600++) if ((_k587 >> (_e586.length - 1 - _j600)) & 1) _g592 |= _pm598[_j600];
        L609: {
          const v_O = _g592;
          const _h610 = popcount(v_O);
          let _c617: boolean = (_h610 === _h590);
          if (_c617) {
            let _q611 = false;
            Q612: {
              const _a613 = v_T;
              for (let _i614 = 0; _i614 < _a613.length; _i614++) {
                const v_x = _a613[_i614];
                const _a615 = sp.adj4[v_x];
                for (let _i616 = 0; _i616 < _a615.length; _i616++) {
                  const v_y = _a615[_i616];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i616]] || -1) !== 2)) {
                    _q611 = true;
                    break Q612;
                  }
                }
              }
            }
            _c617 = !(_q611);
          }
          if (!(_c617)) break L609;
          facts.length = 0;
          changed = false;
          let _q618 = true;
          Q619: {
            const _a620 = v_S;
            for (let _i621 = 0; _i621 < _a620.length; _i621++) {
              const v_x = _a620[_i621];
              const _a622 = sp.adj4[v_x];
              for (let _i623 = 0; _i623 < _a622.length; _i623++) {
                const v_y = _a622[_i623];
                const _h625 = clueAt(cl.number, v_y);
                L624: {
                  const v_f = sp.adj4Edges[v_x][_i623];
                  if (!(((((b.grid[v_f] || -1) !== 2) && (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])))) && (((v_O >> _h625) & 1) !== 0)))) break L624;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q618 = false;
                    break Q619;
                  }
                }
              }
            }
          }
          if (!(_q618)) return -1;
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
  const _g667: number[] = [];
  const _g684: number[] = [];
  const facts = setDoublesFacts;
  let fired = 0;
  let changed = false;
  const _t664 = cl.n;
  for (let v_a = 0; v_a <= _t664; v_a++) {
    L665: {
      const v_S = showing(sp, cl, v_a);
      const _h666 = v_S.length;
      if (!((_h666 <= 16))) break L665;
      const _h705 = (_h666 - 2);
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
      const v_U = _g667;
      const _e681 = v_U;
      const _pm692: number[] = [];
      let _pp693 = -1;
      for (let _k682 = 0; _k682 < 1 << _e681.length; _k682++) {
        if (!(popcount(_k682) >= 3)) continue;
        const v_T = _g684;
        v_T.length = 0;
        for (let _j683 = 0; _j683 < _e681.length; _j683++) if ((_k682 >> (_e681.length - 1 - _j683)) & 1) v_T.push(_e681[_j683]);
        const _h685 = v_T.length;
        if (!((_h685 >= 3))) continue;
        let _g686 = 0;
        if (_pp693 !== b.placed) {
          _pp693 = b.placed;
          for (let _j694 = 0; _j694 < _e681.length; _j694++) {
            const v_m695 = _e681[_j694];
            let _g696 = 0;
            G697: {
              const _a700 = sp.adj4[v_m695];
              for (let _i701 = 0; _i701 < _a700.length; _i701++) {
                const v_y = _a700[_i701];
                if (!(((b.grid[sp.adj4Edges[v_m695][_i701]] || -1) !== 2))) continue;
                const _t702 = clueAt(cl.number, v_y);
                _g696 |= 1 << _t702;
              }
            }
            _pm692[_j694] = _g696;
          }
        }
        for (let _j694 = 0; _j694 < _e681.length; _j694++) if ((_k682 >> (_e681.length - 1 - _j694)) & 1) _g686 |= _pm692[_j694];
        L703: {
          const v_O = _g686;
          const _h704 = popcount(v_O);
          let _c712: boolean = (((2 <= _h704) && (_h704 <= _h705)) && ((_h704 === _h685) || (_h704 === (_h685 - 1))));
          if (_c712) {
            let _q706 = false;
            Q707: {
              const _a708 = v_T;
              for (let _i709 = 0; _i709 < _a708.length; _i709++) {
                const v_x = _a708[_i709];
                const _a710 = sp.adj4[v_x];
                for (let _i711 = 0; _i711 < _a710.length; _i711++) {
                  const v_y = _a710[_i711];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i711]] || -1) !== 2)) {
                    _q706 = true;
                    break Q707;
                  }
                }
              }
            }
            _c712 = _q706;
          }
          if (!(_c712)) break L703;
          const _h721 = (_h704 < _h685);
          facts.length = 0;
          changed = false;
          let _q713 = true;
          Q714: {
            const _a715 = v_S;
            for (let _i716 = 0; _i716 < _a715.length; _i716++) {
              const v_x = _a715[_i716];
              const _a717 = sp.adj4[v_x];
              for (let _i718 = 0; _i718 < _a717.length; _i718++) {
                const v_y = _a717[_i718];
                const _h720 = clueAt(cl.number, v_y);
                L719: {
                  const v_f = sp.adj4Edges[v_x][_i718];
                  let _c734: boolean = (((b.grid[v_f] || -1) !== 2) && (((v_O >> _h720) & 1) !== 0));
                  if (_c734) {
                    let _c727: boolean = (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])));
                    if (_c727) {
                      let _c726: boolean = _h721;
                      if (!_c726) {
                        const _t722 = sp.edgeEnds[2 * v_f];
                        const _h723 = clueAt(cl.number, _t722);
                        const _t724 = sp.edgeEnds[2 * v_f + 1];
                        const _h725 = clueAt(cl.number, _t724);
                        _c726 = (_h723 === _h725);
                      }
                      _c727 = _c726;
                    }
                    let _c733: boolean = _c727;
                    if (!_c733) {
                      let _c732: boolean = _h721;
                      if (_c732) {
                        const _t728 = sp.edgeEnds[2 * v_f];
                        const _h729 = clueAt(cl.number, _t728);
                        const _t730 = sp.edgeEnds[2 * v_f + 1];
                        const _h731 = clueAt(cl.number, _t730);
                        _c732 = (_h729 === _h731);
                      }
                      _c733 = (_c732 && !(((v_T.includes(sp.edgeEnds[2 * v_f])) && (v_T.includes(sp.edgeEnds[2 * v_f + 1])))));
                    }
                    _c734 = _c733;
                  }
                  if (!(_c734)) break L719;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q713 = false;
                    break Q714;
                  }
                }
              }
            }
          }
          if (!(_q713)) return -1;
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

/** `showing(a)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function showing(_sp: GridSpace, cl: Dealt, v_a: number): readonly number[] {
  const _kept: Kept<readonly number[]> = showingKept.board(cl);
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
