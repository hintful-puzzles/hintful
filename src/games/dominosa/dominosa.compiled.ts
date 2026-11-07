// Compiled by `npm run describe` from src/games/dominosa/dominosa.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, edgeGroups, minus, popcount, rangeMask, setOf } from "../../engine/describe-runtime.ts";

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
  let _q799 = true;
  Q800: {
    const _a801 = sp.cells;
    for (let _i802 = 0; _i802 < _a801.length; _i802++) {
      const v_c = _a801[_i802];
      let _g803 = 0;
      G804: {
        const _a805 = sp.adj4[v_c];
        for (let _i806 = 0; _i806 < _a805.length; _i806++) {
          const _h807 = (g[sp.adj4Edges[v_c][_i806]] || -1);
          if (!((_h807 === 1))) continue;
          _g803++;
        }
      }
      if (!((_g803 === 1))) {
        _q799 = false;
        break Q800;
      }
    }
  }
  if (!(_q799)) return false;
  let _q808 = true;
  Q809: {
    const _a810 = sp.edges;
    for (let _i811 = 0; _i811 < _a810.length; _i811++) {
      const v_e = _a810[_i811];
      const _h814 = (g[v_e] || -1);
      const _h815 = (_h814 === 1);
      const _h817 = sp.edgeEnds[2 * v_e];
      const _h818 = clueAt(cl.number, _h817);
      const _h819 = _h818;
      const _h822 = sp.edgeEnds[2 * v_e + 1];
      const _h823 = clueAt(cl.number, _h822);
      const _h824 = _h823;
      const _a812 = sp.edges;
      for (let _i813 = 0; _i813 < _a812.length; _i813++) {
        const v_f = _a812[_i813];
        const _h816 = (g[v_f] || -1);
        if (!((((v_f !== v_e) && _h815) && (_h816 === 1)))) continue;
        const _t820 = sp.edgeEnds[2 * v_f];
        const _h821 = clueAt(cl.number, _t820);
        let _c827: boolean = (_h819 === _h821);
        if (_c827) {
          const _t825 = sp.edgeEnds[2 * v_f + 1];
          const _h826 = clueAt(cl.number, _t825);
          _c827 = (_h824 === _h826);
        }
        let _c833: boolean = _c827;
        if (!_c833) {
          const _t828 = sp.edgeEnds[2 * v_f + 1];
          const _h829 = clueAt(cl.number, _t828);
          let _c832: boolean = (_h819 === _h829);
          if (_c832) {
            const _t830 = sp.edgeEnds[2 * v_f];
            const _h831 = clueAt(cl.number, _t830);
            _c832 = (_h824 === _h831);
          }
          _c833 = _c832;
        }
        if (!(!(_c833))) {
          _q808 = false;
          break Q809;
        }
      }
    }
  }
  if (!(_q808)) return false;
  for (let _k834 = 0; _k834 < cl.number.at.length; _k834++) {
    const _at835 = cl.number.at[_k834];
    let _q837 = true;
    Q838: {
      const _a839 = sp.adj4[_at835];
      for (let _i840 = 0; _i840 < _a839.length; _i840++) {
        let _q841 = false;
        Q842: {
          const _a843 = sp.edges;
          for (let _i844 = 0; _i844 < _a843.length; _i844++) {
            const v_f = _a843[_i844];
            const _h845 = (g[v_f] || -1);
            if (!((_h845 === 1))) continue;
            const _t846 = sp.adj4Edges[_at835][_i840];
            const _t847 = sp.edgeEnds[2 * _t846];
            const _h848 = clueAt(cl.number, _t847);
            const _t849 = sp.edgeEnds[2 * v_f];
            const _h850 = clueAt(cl.number, _t849);
            let _c855: boolean = (_h848 === _h850);
            if (_c855) {
              const _t851 = sp.edgeEnds[2 * _t846 + 1];
              const _h852 = clueAt(cl.number, _t851);
              const _t853 = sp.edgeEnds[2 * v_f + 1];
              const _h854 = clueAt(cl.number, _t853);
              _c855 = (_h852 === _h854);
            }
            let _c865: boolean = _c855;
            if (!_c865) {
              const _t856 = sp.edgeEnds[2 * _t846];
              const _h857 = clueAt(cl.number, _t856);
              const _t858 = sp.edgeEnds[2 * v_f + 1];
              const _h859 = clueAt(cl.number, _t858);
              let _c864: boolean = (_h857 === _h859);
              if (_c864) {
                const _t860 = sp.edgeEnds[2 * _t846 + 1];
                const _h861 = clueAt(cl.number, _t860);
                const _t862 = sp.edgeEnds[2 * v_f];
                const _h863 = clueAt(cl.number, _t862);
                _c864 = (_h861 === _h863);
              }
              _c865 = _c864;
            }
            if (_c865) {
              _q841 = true;
              break Q842;
            }
          }
        }
        if (!(_q841)) {
          _q837 = false;
          break Q838;
        }
      }
    }
    if (!(_q837)) return false;
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
  const _g62: number[] = [];
  const _g74: number[] = [];
  const facts = onlySpotFacts;
  let fired = 0;
  let changed = false;
  const _t60 = cl.n;
  for (let v_a = 0; v_a <= _t60; v_a++) {
    const _t61 = cl.n;
    for (let v_b = v_a; v_b <= _t61; v_b++) {
      _g62.length = 0;
      G63: {
        _g74.length = 0;
        G75: {
          const _a78 = cluesValued(cl.number, v_a);
          for (let _i79 = 0; _i79 < _a78.length; _i79++) {
            const v_c = _a78[_i79];
            const _h80 = clueAt(cl.number, v_c);
            if (!((_h80 === v_a))) continue;
            _g74.push(v_c);
          }
        }
        const _a81 = _g74;
        for (let _i82 = 0; _i82 < _a81.length; _i82++) {
          const v_x = _a81[_i82];
          const _a83 = sp.adj4[v_x];
          for (let _i84 = 0; _i84 < _a83.length; _i84++) {
            const v_y = _a83[_i84];
            const _h85 = clueAt(cl.number, v_y);
            if (!(((_h85 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i84]] || -1) !== 2)))) continue;
            const _t86 = sp.adj4Edges[v_x][_i84];
            if (!_g62.includes(_t86)) _g62.push(_t86);
          }
        }
      }
      L87: {
        const v_P = _g62;
        const _h88 = v_P.length;
        if (!((_h88 === 1))) break L87;
        L89: {
          const v_e = (v_P[0] ?? -1);
          if (!(!((b.grid[v_e] !== 0)))) break L89;
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
  const _g107: number[] = [];
  const facts = squareOnlyFacts;
  let fired = 0;
  let changed = false;
  const _a105 = sp.cells;
  for (let _i106 = 0; _i106 < _a105.length; _i106++) {
    const v_c = _a105[_i106];
    _g107.length = 0;
    G108: {
      const _a111 = sp.adj4[v_c];
      for (let _i112 = 0; _i112 < _a111.length; _i112++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i112]] || -1) !== 2))) continue;
        const _t113 = sp.adj4Edges[v_c][_i112];
        if (!_g107.includes(_t113)) _g107.push(_t113);
      }
    }
    L114: {
      const v_S = _g107;
      const _h115 = v_S.length;
      let _c120: boolean = (_h115 <= 1);
      if (_c120) {
        let _q116 = false;
        Q117: {
          const _a118 = v_S;
          for (let _i119 = 0; _i119 < _a118.length; _i119++) {
            const v_f = _a118[_i119];
            if ((b.grid[v_f] !== 0)) {
              _q116 = true;
              break Q117;
            }
          }
        }
        _c120 = !(_q116);
      }
      if (!(_c120)) break L114;
      facts.length = 0;
      changed = false;
      let _c122: boolean = (_h115 === 1);
      if (_c122) {
        const _t121 = (v_S[0] ?? -1);
        if (!(b.grid[_t121] !== 0)) { if (fire === null) { b.placeAt(_t121, 1); changed = true; } else facts.push(PLACE, _t121, 1); }
        _c122 = true;
      }
      if (!(_c122)) return -1;
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
  const _g151: number[] = [];
  const facts = squareSingleDominoFacts;
  let fired = 0;
  let changed = false;
  const _a149 = sp.cells;
  for (let _i150 = 0; _i150 < _a149.length; _i150++) {
    const v_c = _a149[_i150];
    _g151.length = 0;
    G152: {
      const _a155 = sp.adj4[v_c];
      for (let _i156 = 0; _i156 < _a155.length; _i156++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i156]] || -1) !== 2))) continue;
        const _t157 = sp.adj4Edges[v_c][_i156];
        if (!_g151.includes(_t157)) _g151.push(_t157);
      }
    }
    L158: {
      const v_S = _g151;
      const _h159 = v_S.length;
      if (!((_h159 >= 2))) break L158;
      L160: {
        const v_s = (v_S[0] ?? -1);
        const _h167 = sp.edgeEnds[2 * v_s];
        const _h168 = clueAt(cl.number, _h167);
        const _h169 = _h168;
        const _h172 = sp.edgeEnds[2 * v_s + 1];
        const _h173 = clueAt(cl.number, _h172);
        const _h174 = _h173;
        let _q161 = true;
        Q162: {
          const _a163 = v_S;
          for (let _i164 = 0; _i164 < _a163.length; _i164++) {
            const v_f = _a163[_i164];
            const _t165 = sp.edgeEnds[2 * v_f];
            const _h166 = clueAt(cl.number, _t165);
            let _c175: boolean = (_h166 === _h169);
            if (_c175) {
              const _t170 = sp.edgeEnds[2 * v_f + 1];
              const _h171 = clueAt(cl.number, _t170);
              _c175 = (_h171 === _h174);
            }
            let _c181: boolean = _c175;
            if (!_c181) {
              const _t176 = sp.edgeEnds[2 * v_f];
              const _h177 = clueAt(cl.number, _t176);
              let _c180: boolean = (_h177 === _h174);
              if (_c180) {
                const _t178 = sp.edgeEnds[2 * v_f + 1];
                const _h179 = clueAt(cl.number, _t178);
                _c180 = (_h179 === _h169);
              }
              _c181 = _c180;
            }
            if (!(_c181)) {
              _q161 = false;
              break Q162;
            }
          }
        }
        if (!(_q161)) break L160;
        facts.length = 0;
        changed = false;
        let _q182 = true;
        Q183: {
          const _a184 = sp.edges;
          for (let _i185 = 0; _i185 < _a184.length; _i185++) {
            const v_f = _a184[_i185];
            let _c197: boolean = (!(v_S.includes(v_f)) && ((b.grid[v_f] || -1) !== 2));
            if (_c197) {
              const _t186 = sp.edgeEnds[2 * v_f];
              const _h187 = clueAt(cl.number, _t186);
              let _c190: boolean = (_h187 === _h169);
              if (_c190) {
                const _t188 = sp.edgeEnds[2 * v_f + 1];
                const _h189 = clueAt(cl.number, _t188);
                _c190 = (_h189 === _h174);
              }
              let _c196: boolean = _c190;
              if (!_c196) {
                const _t191 = sp.edgeEnds[2 * v_f];
                const _h192 = clueAt(cl.number, _t191);
                let _c195: boolean = (_h192 === _h174);
                if (_c195) {
                  const _t193 = sp.edgeEnds[2 * v_f + 1];
                  const _h194 = clueAt(cl.number, _t193);
                  _c195 = (_h194 === _h169);
                }
                _c196 = _c195;
              }
              _c197 = _c196;
            }
            if (!(_c197)) continue;
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
            if (!(true)) {
              _q182 = false;
              break Q183;
            }
          }
        }
        if (!(_q182)) return -1;
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
  const _g226: number[] = [];
  const _g238: number[] = [];
  const facts = mustOverlapFacts;
  let fired = 0;
  let changed = false;
  const _t224 = cl.n;
  for (let v_a = 0; v_a <= _t224; v_a++) {
    const _t225 = cl.n;
    for (let v_b = v_a; v_b <= _t225; v_b++) {
      _g226.length = 0;
      G227: {
        _g238.length = 0;
        G239: {
          const _a242 = cluesValued(cl.number, v_a);
          for (let _i243 = 0; _i243 < _a242.length; _i243++) {
            const v_c = _a242[_i243];
            const _h244 = clueAt(cl.number, v_c);
            if (!((_h244 === v_a))) continue;
            _g238.push(v_c);
          }
        }
        const _a245 = _g238;
        for (let _i246 = 0; _i246 < _a245.length; _i246++) {
          const v_x = _a245[_i246];
          const _a247 = sp.adj4[v_x];
          for (let _i248 = 0; _i248 < _a247.length; _i248++) {
            const v_y = _a247[_i248];
            const _h249 = clueAt(cl.number, v_y);
            if (!(((_h249 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i248]] || -1) !== 2)))) continue;
            const _t250 = sp.adj4Edges[v_x][_i248];
            if (!_g226.includes(_t250)) _g226.push(_t250);
          }
        }
      }
      L251: {
        const v_P = _g226;
        const _h252 = v_P.length;
        if (!((_h252 >= 2))) break L251;
        const v_e = (v_P[0] ?? -1);
        facts.length = 0;
        changed = false;
        let _q253 = true;
        Q254: {
          const _a255 = setOf(sp.edgeEnds[2 * v_e], sp.edgeEnds[2 * v_e + 1]);
          for (let _i256 = 0; _i256 < _a255.length; _i256++) {
            const v_x = _a255[_i256];
            const _a257 = sp.adj4[v_x];
            for (let _i258 = 0; _i258 < _a257.length; _i258++) {
              const _h263 = sp.adj4Edges[v_x][_i258];
              const _h264 = sp.edgeEnds[2 * _h263];
              const _h265 = sp.edgeEnds[2 * _h263 + 1];
              let _c266: boolean = (!(v_P.includes(sp.adj4Edges[v_x][_i258])) && ((b.grid[sp.adj4Edges[v_x][_i258]] || -1) !== 2));
              if (_c266) {
                let _q259 = true;
                Q260: {
                  const _a261 = v_P;
                  for (let _i262 = 0; _i262 < _a261.length; _i262++) {
                    const v_f = _a261[_i262];
                    if (!(((((sp.edgeEnds[2 * v_f] === _h264) || (sp.edgeEnds[2 * v_f] === _h265)) || (sp.edgeEnds[2 * v_f + 1] === _h264)) || (sp.edgeEnds[2 * v_f + 1] === _h265)))) {
                      _q259 = false;
                      break Q260;
                    }
                  }
                }
                _c266 = _q259;
              }
              if (!(_c266)) continue;
              const _t267 = sp.adj4Edges[v_x][_i258];
              if (!(b.grid[_t267] !== 0)) { if (fire === null) { b.placeAt(_t267, 2); changed = true; } else facts.push(PLACE, _t267, 2); }
              if (!(true)) {
                _q253 = false;
                break Q254;
              }
            }
          }
        }
        if (!(_q253)) return -1;
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
  const _g309: number[] = [];
  const facts = localDuplicateFacts;
  let fired = 0;
  let changed = false;
  const _a300 = sp.edges;
  for (let _i301 = 0; _i301 < _a300.length; _i301++) {
    const v_p = _a300[_i301];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h322 = sp.edgeEnds[2 * v_p];
    const _h323 = clueAt(cl.number, _h322);
    const _h324 = _h323;
    const _h327 = sp.edgeEnds[2 * v_p + 1];
    const _h328 = clueAt(cl.number, _h327);
    const _h329 = _h328;
    const _a302 = setOf(sp.edgeEnds[2 * v_p], sp.edgeEnds[2 * v_p + 1]);
    for (let _i303 = 0; _i303 < _a302.length; _i303++) {
      const v_x = _a302[_i303];
      const _a304 = sp.adj4[v_x];
      for (let _i305 = 0; _i305 < _a304.length; _i305++) {
        const v_y = _a304[_i305];
        L306: {
          const v_q = sp.adj4Edges[v_x][_i305];
          let _c337: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
          if (_c337) {
            let _q307 = true;
            Q308: {
              _g309.length = 0;
              G310: {
                const _a315 = sp.adj4[v_y];
                for (let _i316 = 0; _i316 < _a315.length; _i316++) {
                  if (!(((b.grid[sp.adj4Edges[v_y][_i316]] || -1) !== 2))) continue;
                  const _t317 = sp.adj4Edges[v_y][_i316];
                  if (!_g309.includes(_t317)) _g309.push(_t317);
                }
              }
              const _a318 = _g309;
              for (let _i319 = 0; _i319 < _a318.length; _i319++) {
                const v_r = _a318[_i319];
                if (!((v_r !== v_q))) continue;
                const _t320 = sp.edgeEnds[2 * v_r];
                const _h321 = clueAt(cl.number, _t320);
                let _c330: boolean = (_h321 === _h324);
                if (_c330) {
                  const _t325 = sp.edgeEnds[2 * v_r + 1];
                  const _h326 = clueAt(cl.number, _t325);
                  _c330 = (_h326 === _h329);
                }
                let _c336: boolean = _c330;
                if (!_c336) {
                  const _t331 = sp.edgeEnds[2 * v_r];
                  const _h332 = clueAt(cl.number, _t331);
                  let _c335: boolean = (_h332 === _h329);
                  if (_c335) {
                    const _t333 = sp.edgeEnds[2 * v_r + 1];
                    const _h334 = clueAt(cl.number, _t333);
                    _c335 = (_h334 === _h324);
                  }
                  _c336 = _c335;
                }
                if (!(_c336)) {
                  _q307 = false;
                  break Q308;
                }
              }
            }
            _c337 = _q307;
          }
          if (!(_c337)) break L306;
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
  const _g435: number[] = [];
  const _g448: number[] = [];
  const _g490: number[] = [];
  const _g501: number[] = [];
  const facts = localDuplicate2Facts;
  let fired = 0;
  let changed = false;
  const _a428 = sp.edges;
  for (let _i429 = 0; _i429 < _a428.length; _i429++) {
    const v_p = _a428[_i429];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h483 = sp.edgeEnds[2 * v_p];
    const _h484 = sp.edgeEnds[2 * v_p + 1];
    const _a430 = setOf(sp.edgeEnds[2 * v_p], sp.edgeEnds[2 * v_p + 1]);
    for (let _i431 = 0; _i431 < _a430.length; _i431++) {
      const v_x = _a430[_i431];
      const _a432 = sp.adj4[v_x];
      for (let _i433 = 0; _i433 < _a432.length; _i433++) {
        const v_y = _a432[_i433];
        L434: {
          const v_q = sp.adj4Edges[v_x][_i433];
          if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) break L434;
          const _h527 = sp.edgeEnds[2 * v_q];
          const _h528 = sp.edgeEnds[2 * v_q + 1];
          _g435.length = 0;
          G436: {
            _g448.length = 0;
            G449: {
              const _a454 = sp.adj4[v_y];
              for (let _i455 = 0; _i455 < _a454.length; _i455++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i455]] || -1) !== 2))) continue;
                const _t456 = sp.adj4Edges[v_y][_i455];
                if (!_g448.includes(_t456)) _g448.push(_t456);
              }
            }
            const _a457 = _g448;
            for (let _i458 = 0; _i458 < _a457.length; _i458++) {
              const v_r = _a457[_i458];
              if (!((v_r !== v_q))) continue;
              _g435.push(v_r);
            }
          }
          L459: {
            const v_R = _g435;
            const _h460 = v_R.length;
            if (!((_h460 >= 1))) break L459;
            L461: {
              const v_d = (v_R[0] ?? -1);
              const _h468 = sp.edgeEnds[2 * v_d];
              const _h469 = clueAt(cl.number, _h468);
              const _h470 = _h469;
              const _h473 = sp.edgeEnds[2 * v_d + 1];
              const _h474 = clueAt(cl.number, _h473);
              const _h475 = _h474;
              let _q462 = true;
              Q463: {
                const _a464 = v_R;
                for (let _i465 = 0; _i465 < _a464.length; _i465++) {
                  const v_r = _a464[_i465];
                  const _t466 = sp.edgeEnds[2 * v_r];
                  const _h467 = clueAt(cl.number, _t466);
                  let _c476: boolean = (_h467 === _h470);
                  if (_c476) {
                    const _t471 = sp.edgeEnds[2 * v_r + 1];
                    const _h472 = clueAt(cl.number, _t471);
                    _c476 = (_h472 === _h475);
                  }
                  let _c482: boolean = _c476;
                  if (!_c482) {
                    const _t477 = sp.edgeEnds[2 * v_r];
                    const _h478 = clueAt(cl.number, _t477);
                    let _c481: boolean = (_h478 === _h475);
                    if (_c481) {
                      const _t479 = sp.edgeEnds[2 * v_r + 1];
                      const _h480 = clueAt(cl.number, _t479);
                      _c481 = (_h480 === _h470);
                    }
                    _c482 = _c481;
                  }
                  if (!(_c482)) {
                    _q462 = false;
                    break Q463;
                  }
                }
              }
              if (!(_q462)) break L461;
              const _a485 = setOf(_h483, _h484);
              for (let _i486 = 0; _i486 < _a485.length; _i486++) {
                const v_x2 = _a485[_i486];
                const _a487 = sp.adj4[v_x2];
                for (let _i488 = 0; _i488 < _a487.length; _i488++) {
                  const v_z = _a487[_i488];
                  L489: {
                    const v_q2 = sp.adj4Edges[v_x2][_i488];
                    if (!((((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)))) break L489;
                    _g490.length = 0;
                    G491: {
                      _g501.length = 0;
                      G502: {
                        const _a505 = sp.adj4[v_z];
                        for (let _i506 = 0; _i506 < _a505.length; _i506++) {
                          if (!(((b.grid[sp.adj4Edges[v_z][_i506]] || -1) !== 2))) continue;
                          const _t507 = sp.adj4Edges[v_z][_i506];
                          if (!_g501.includes(_t507)) _g501.push(_t507);
                        }
                      }
                      const _a508 = _g501;
                      for (let _i509 = 0; _i509 < _a508.length; _i509++) {
                        const v_r = _a508[_i509];
                        if (!((v_r !== v_q2))) continue;
                        _g490.push(v_r);
                      }
                    }
                    L510: {
                      const v_S = _g490;
                      const _h511 = v_S.length;
                      let _c529: boolean = (_h511 >= 1);
                      if (_c529) {
                        let _q512 = true;
                        Q513: {
                          const _a514 = v_S;
                          for (let _i515 = 0; _i515 < _a514.length; _i515++) {
                            const v_r = _a514[_i515];
                            const _t516 = sp.edgeEnds[2 * v_r];
                            const _h517 = clueAt(cl.number, _t516);
                            let _c520: boolean = (_h517 === _h470);
                            if (_c520) {
                              const _t518 = sp.edgeEnds[2 * v_r + 1];
                              const _h519 = clueAt(cl.number, _t518);
                              _c520 = (_h519 === _h475);
                            }
                            let _c526: boolean = _c520;
                            if (!_c526) {
                              const _t521 = sp.edgeEnds[2 * v_r];
                              const _h522 = clueAt(cl.number, _t521);
                              let _c525: boolean = (_h522 === _h475);
                              if (_c525) {
                                const _t523 = sp.edgeEnds[2 * v_r + 1];
                                const _h524 = clueAt(cl.number, _t523);
                                _c525 = (_h524 === _h470);
                              }
                              _c526 = _c525;
                            }
                            if (!((_c526 && !(((((sp.edgeEnds[2 * v_r] === _h527) || (sp.edgeEnds[2 * v_r] === _h528)) || (sp.edgeEnds[2 * v_r + 1] === _h527)) || (sp.edgeEnds[2 * v_r + 1] === _h528)))))) {
                              _q512 = false;
                              break Q513;
                            }
                          }
                        }
                        _c529 = _q512;
                      }
                      if (!(_c529)) break L510;
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
  const _g546: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  _g546.length = 0;
  G547: {
    const _a550 = sp.edges;
    for (let _i551 = 0; _i551 < _a550.length; _i551++) {
      const v_e = _a550[_i551];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      _g546.push(v_e);
    }
  }
  const v_P = _g546;
  const _a552 = sp.edges;
  for (let _i553 = 0; _i553 < _a552.length; _i553++) {
    const v_p = _a552[_i553];
    const _h558 = sp.edgeEnds[2 * v_p + 1];
    const _h562 = sp.edgeEnds[2 * v_p];
    let _c564: boolean = !((b.grid[v_p] !== 0));
    if (_c564) {
      let _q554 = false;
      Q555: {
        const _a556 = sp.adj4[sp.edgeEnds[2 * v_p]];
        for (let _i557 = 0; _i557 < _a556.length; _i557++) {
          const v_x = _a556[_i557];
          const _h561 = (v_x !== _h558);
          const _h563 = sp.edgeOf(_h562, v_x);
          const _a559 = sp.adj4[_h558];
          for (let _i560 = 0; _i560 < _a559.length; _i560++) {
            const v_y = _a559[_i560];
            if (!(((_h561 && (v_y !== _h562)) && (sp.adj4[v_x].includes(v_y))))) continue;
            if (((((b.grid[_h563] || -1) !== 2) && ((b.grid[sp.adj4Edges[_h558][_i560]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
              _q554 = true;
              break Q555;
            }
          }
        }
      }
      _c564 = !(_q554);
    }
    if (!(_c564)) continue;
    const v_Q = minus(v_P, setOf(v_p));
    const _eg565 = edgeGroups(sp, v_Q);
    const _h568 = _eg565.of(sp.edgeEnds[2 * v_p + 1]).length;
    L566: {
      const v_A = _eg565.of(sp.edgeEnds[2 * v_p]);
      const _h567 = v_A.length;
      if (!(((!(_eg565.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((_h567 % 2) === 0)) && ((_h568 % 2) === 0)))) break L566;
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
  const _g614: number[] = [];
  const _g623: number[] = [];
  const _g640: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  const _t613 = cl.n;
  for (let v_a = 0; v_a <= _t613; v_a++) {
    _g614.length = 0;
    G615: {
      const _a618 = cluesValued(cl.number, v_a);
      for (let _i619 = 0; _i619 < _a618.length; _i619++) {
        const v_c = _a618[_i619];
        const _h620 = clueAt(cl.number, v_c);
        if (!((_h620 === v_a))) continue;
        _g614.push(v_c);
      }
    }
    L621: {
      const v_S = _g614;
      const _h622 = v_S.length;
      if (!((_h622 <= 16))) break L621;
      const _h642 = (_h622 - 2);
      _g623.length = 0;
      G624: {
        const _a631 = v_S;
        for (let _i632 = 0; _i632 < _a631.length; _i632++) {
          const v_c = _a631[_i632];
          let _q633 = false;
          Q634: {
            const _a635 = sp.adj4[v_c];
            for (let _i636 = 0; _i636 < _a635.length; _i636++) {
              if (((b.grid[sp.adj4Edges[v_c][_i636]] || -1) === 1)) {
                _q633 = true;
                break Q634;
              }
            }
          }
          if (!(!(_q633))) continue;
          _g623.push(v_c);
        }
      }
      const v_U = _g623;
      const _e637 = v_U;
      const _pm649: number[] = [];
      let _pp650 = -1;
      for (let _k638 = 0; _k638 < 1 << _e637.length; _k638++) {
        if (!(popcount(_k638) >= 2)) continue;
        const v_T = _g640;
        v_T.length = 0;
        for (let _j639 = 0; _j639 < _e637.length; _j639++) if ((_k638 >> (_e637.length - 1 - _j639)) & 1) v_T.push(_e637[_j639]);
        const _h641 = v_T.length;
        if (!(((_h641 >= 2) && (_h641 <= _h642)))) continue;
        let _g643 = 0;
        if (_pp650 !== b.placed) {
          _pp650 = b.placed;
          for (let _j651 = 0; _j651 < _e637.length; _j651++) {
            const v_m652 = _e637[_j651];
            let _g653 = 0;
            G654: {
              const _a657 = sp.adj4[v_m652];
              for (let _i658 = 0; _i658 < _a657.length; _i658++) {
                const v_y = _a657[_i658];
                if (!(((b.grid[sp.adj4Edges[v_m652][_i658]] || -1) !== 2))) continue;
                const _t659 = clueAt(cl.number, v_y);
                _g653 |= 1 << _t659;
              }
            }
            _pm649[_j651] = _g653;
          }
        }
        for (let _j651 = 0; _j651 < _e637.length; _j651++) if ((_k638 >> (_e637.length - 1 - _j651)) & 1) _g643 |= _pm649[_j651];
        L660: {
          const v_O = _g643;
          const _h661 = popcount(v_O);
          let _c668: boolean = (_h661 === _h641);
          if (_c668) {
            let _q662 = false;
            Q663: {
              const _a664 = v_T;
              for (let _i665 = 0; _i665 < _a664.length; _i665++) {
                const v_x = _a664[_i665];
                const _a666 = sp.adj4[v_x];
                for (let _i667 = 0; _i667 < _a666.length; _i667++) {
                  const v_y = _a666[_i667];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i667]] || -1) !== 2)) {
                    _q662 = true;
                    break Q663;
                  }
                }
              }
            }
            _c668 = !(_q662);
          }
          if (!(_c668)) break L660;
          facts.length = 0;
          changed = false;
          let _q669 = true;
          Q670: {
            const _a671 = v_S;
            for (let _i672 = 0; _i672 < _a671.length; _i672++) {
              const v_x = _a671[_i672];
              const _a673 = sp.adj4[v_x];
              for (let _i674 = 0; _i674 < _a673.length; _i674++) {
                const v_y = _a673[_i674];
                const _h676 = clueAt(cl.number, v_y);
                L675: {
                  const v_f = sp.adj4Edges[v_x][_i674];
                  if (!(((((b.grid[v_f] || -1) !== 2) && (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])))) && (((v_O >> _h676) & 1) !== 0)))) break L675;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q669 = false;
                    break Q670;
                  }
                }
              }
            }
          }
          if (!(_q669)) return -1;
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
  const _g722: number[] = [];
  const _g731: number[] = [];
  const _g748: number[] = [];
  const facts = setDoublesFacts;
  let fired = 0;
  let changed = false;
  const _t721 = cl.n;
  for (let v_a = 0; v_a <= _t721; v_a++) {
    _g722.length = 0;
    G723: {
      const _a726 = cluesValued(cl.number, v_a);
      for (let _i727 = 0; _i727 < _a726.length; _i727++) {
        const v_c = _a726[_i727];
        const _h728 = clueAt(cl.number, v_c);
        if (!((_h728 === v_a))) continue;
        _g722.push(v_c);
      }
    }
    L729: {
      const v_S = _g722;
      const _h730 = v_S.length;
      if (!((_h730 <= 16))) break L729;
      const _h769 = (_h730 - 2);
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
          const _h785 = (_h768 < _h749);
          facts.length = 0;
          changed = false;
          let _q777 = true;
          Q778: {
            const _a779 = v_S;
            for (let _i780 = 0; _i780 < _a779.length; _i780++) {
              const v_x = _a779[_i780];
              const _a781 = sp.adj4[v_x];
              for (let _i782 = 0; _i782 < _a781.length; _i782++) {
                const v_y = _a781[_i782];
                const _h784 = clueAt(cl.number, v_y);
                L783: {
                  const v_f = sp.adj4Edges[v_x][_i782];
                  let _c798: boolean = (((b.grid[v_f] || -1) !== 2) && (((v_O >> _h784) & 1) !== 0));
                  if (_c798) {
                    let _c791: boolean = (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])));
                    if (_c791) {
                      let _c790: boolean = _h785;
                      if (!_c790) {
                        const _t786 = sp.edgeEnds[2 * v_f];
                        const _h787 = clueAt(cl.number, _t786);
                        const _t788 = sp.edgeEnds[2 * v_f + 1];
                        const _h789 = clueAt(cl.number, _t788);
                        _c790 = (_h787 === _h789);
                      }
                      _c791 = _c790;
                    }
                    let _c797: boolean = _c791;
                    if (!_c797) {
                      let _c796: boolean = _h785;
                      if (_c796) {
                        const _t792 = sp.edgeEnds[2 * v_f];
                        const _h793 = clueAt(cl.number, _t792);
                        const _t794 = sp.edgeEnds[2 * v_f + 1];
                        const _h795 = clueAt(cl.number, _t794);
                        _c796 = (_h793 === _h795);
                      }
                      _c797 = (_c796 && !(((v_T.includes(sp.edgeEnds[2 * v_f])) && (v_T.includes(sp.edgeEnds[2 * v_f + 1])))));
                    }
                    _c798 = _c797;
                  }
                  if (!(_c798)) break L783;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q777 = false;
                    break Q778;
                  }
                }
              }
            }
          }
          if (!(_q777)) return -1;
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
