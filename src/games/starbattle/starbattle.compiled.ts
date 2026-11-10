// Compiled by `npm run describe` from src/games/starbattle/starbattle.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, cellsValued, freshBinding, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  region: Partition;
  stars: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "around" | "fullLine" | "fullRegion" | "exactLine" | "exactRegion" | "confined" | "neededLine" | "neededRegion" | "crowdedLine" | "crowdedRegion" | "banded" | "starvedLine" | "starvedRegion";

/** Every technique run as each value is placed, by id. */
export type PlacingId = never;

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
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
  { id: "around", tier: 0 },
  { id: "fullLine", tier: 0 },
  { id: "fullRegion", tier: 0 },
  { id: "exactLine", tier: 0 },
  { id: "exactRegion", tier: 0 },
  { id: "confined", tier: 0 },
  { id: "neededLine", tier: 0 },
  { id: "neededRegion", tier: 0 },
  { id: "crowdedLine", tier: 0 },
  { id: "crowdedRegion", tier: 0 },
  { id: "banded", tier: 1 },
  { id: "starvedLine", tier: 2 },
  { id: "starvedRegion", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.lines;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_L = _a3[_i4];
      let _g5 = 0;
      G6: {
        const _a7 = sp.lineCells[v_L];
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const v_c = _a7[_i8];
          const _h9 = (g[v_c] || -1);
          if (!((_h9 === 1))) continue;
          _g5++;
        }
      }
      if (!((_g5 === cl.stars))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q10 = true;
  Q11: {
    const _a12 = cl.region.parts;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_r = _a12[_i13];
      let _g14 = 0;
      G15: {
        const _a16 = cl.region.cells[v_r];
        for (let _i17 = 0; _i17 < _a16.length; _i17++) {
          const v_c = _a16[_i17];
          const _h18 = (g[v_c] || -1);
          if (!((_h18 === 1))) continue;
          _g14++;
        }
      }
      if (!((_g14 === cl.stars))) {
        _q10 = false;
        break Q11;
      }
    }
  }
  if (!(_q10)) return false;
  let _q19 = true;
  Q20: {
    const _a21 = sp.cells;
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_a = _a21[_i22];
      const _h23 = (g[v_a] || -1);
      if (!((_h23 === 1))) continue;
      let _q24 = true;
      Q25: {
        const _a26 = sp.adj8[v_a];
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_b = _a26[_i27];
          const _h28 = (g[v_b] || -1);
          if (!((_h28 !== 1))) {
            _q24 = false;
            break Q25;
          }
        }
      }
      if (!(_q24)) {
        _q19 = false;
        break Q20;
      }
    }
  }
  if (!(_q19)) return false;
  return true;
}

export interface AroundBinding {
  c: number;
}

const aroundFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function around(b: Marks, sp: GridSpace, fire: Fire<AroundBinding> | null): number {
  const facts = aroundFacts;
  let fired = 0;
  let changed = false;
  const _a3 = cellsValued(b, sp.cells, 1);
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    if (DEV && staleChecking) {
      freshBinding("around", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1)], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      const _a7 = sp.adj8[v_c];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_p = _a7[_i8];
        if (!(((b.grid[v_p] || -1) !== 1))) {
          _q5 = false;
          break Q6;
        }
      }
    }
    let _c13: boolean = _q5;
    if (_c13) {
      let _q9 = true;
      Q10: {
        const _a11 = sp.adj8[v_c];
        for (let _i12 = 0; _i12 < _a11.length; _i12++) {
          const v_p = _a11[_i12];
          if (!(!((b.grid[v_p] !== 0)))) continue;
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
          if (!(true)) {
            _q9 = false;
            break Q10;
          }
        }
      }
      _c13 = _q9;
    }
    if (!(_c13)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface FullLineBinding {
  L: number;
  n: number;
}

const fullLineFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function fullLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FullLineBinding> | null): number {
  const _g25: number[] = [];
  const facts = fullLineFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.lines;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_L = _a9[_i10];
    const _t11 = sp.lineCells[v_L];
    let _g12 = 0;
    G13: {
      const _a14 = _t11;
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_c = _a14[_i15];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g12++;
      }
    }
    L16: {
      const v_n = (cl.stars - _g12);
      if (!((v_n <= 0))) break L16;
      if (DEV && staleChecking) {
        const _t17 = sp.lineCells[v_L];
        let _g18 = 0;
        G19: {
          const _a20 = _t17;
          for (let _i21 = 0; _i21 < _a20.length; _i21++) {
            const v_c = _a20[_i21];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g18++;
          }
        }
        freshBinding("fullLine", [(sp.lines.includes(v_L)), (v_n === (cl.stars - _g18)), (v_n <= 0)], ["L in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c33: boolean = (v_n === 0);
      if (_c33) {
        let _q22 = true;
        Q23: {
          const _t24 = sp.lineCells[v_L];
          _g25.length = 0;
          G26: {
            const _a29 = _t24;
            for (let _i30 = 0; _i30 < _a29.length; _i30++) {
              const v_c = _a29[_i30];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g25.push(v_c);
            }
          }
          const _a31 = _g25;
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_c = _a31[_i32];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
            if (!(true)) {
              _q22 = false;
              break Q23;
            }
          }
        }
        _c33 = _q22;
      }
      if (!(_c33)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface FullRegionBinding {
  r: number;
  n: number;
}

const fullRegionFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function fullRegion(b: Marks, _sp: GridSpace, cl: Dealt, fire: Fire<FullRegionBinding> | null): number {
  const _g25: number[] = [];
  const facts = fullRegionFacts;
  let fired = 0;
  let changed = false;
  const _a9 = cl.region.parts;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_r = _a9[_i10];
    const _t11 = cl.region.cells[v_r];
    let _g12 = 0;
    G13: {
      const _a14 = _t11;
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_c = _a14[_i15];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g12++;
      }
    }
    L16: {
      const v_n = (cl.stars - _g12);
      if (!((v_n <= 0))) break L16;
      if (DEV && staleChecking) {
        const _t17 = cl.region.cells[v_r];
        let _g18 = 0;
        G19: {
          const _a20 = _t17;
          for (let _i21 = 0; _i21 < _a20.length; _i21++) {
            const v_c = _a20[_i21];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g18++;
          }
        }
        freshBinding("fullRegion", [(cl.region.parts.includes(v_r)), (v_n === (cl.stars - _g18)), (v_n <= 0)], ["r in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c33: boolean = (v_n === 0);
      if (_c33) {
        let _q22 = true;
        Q23: {
          const _t24 = cl.region.cells[v_r];
          _g25.length = 0;
          G26: {
            const _a29 = _t24;
            for (let _i30 = 0; _i30 < _a29.length; _i30++) {
              const v_c = _a29[_i30];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g25.push(v_c);
            }
          }
          const _a31 = _g25;
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_c = _a31[_i32];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
            if (!(true)) {
              _q22 = false;
              break Q23;
            }
          }
        }
        _c33 = _q22;
      }
      if (!(_c33)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ExactLineBinding {
  L: number;
  n: number;
  O: readonly number[];
}

const exactLineFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function exactLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExactLineBinding> | null): number {
  const _g24: number[] = [];
  const facts = exactLineFacts;
  let fired = 0;
  let changed = false;
  const _a16 = sp.lines;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_L = _a16[_i17];
    const _t18 = sp.lineCells[v_L];
    let _g19 = 0;
    G20: {
      const _a21 = _t18;
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_c = _a21[_i22];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g19++;
      }
    }
    const v_n = (cl.stars - _g19);
    const _t23 = sp.lineCells[v_L];
    _g24.length = 0;
    G25: {
      const _a28 = _t23;
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_c = _a28[_i29];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g24.push(v_c);
      }
    }
    L30: {
      const v_O = _g24;
      const _h31 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h31)))) break L30;
      if (DEV && staleChecking) {
        const _t32 = sp.lineCells[v_L];
        let _g33 = 0;
        G34: {
          const _a35 = _t32;
          for (let _i36 = 0; _i36 < _a35.length; _i36++) {
            const v_c = _a35[_i36];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g33++;
          }
        }
        const _t37 = sp.lineCells[v_L];
        const _g38: number[] = [];
        G39: {
          const _a42 = _t37;
          for (let _i43 = 0; _i43 < _a42.length; _i43++) {
            const v_c = _a42[_i43];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g38.push(v_c);
          }
        }
        freshBinding("exactLine", [(sp.lines.includes(v_L)), (v_n === (cl.stars - _g33)), sameSet(v_O, _g38), ((v_n > 0) && (v_n >= v_O.length))], ["L in", "n =", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c48: boolean = (v_n === _h31);
      if (_c48) {
        let _q44 = true;
        Q45: {
          const _a46 = v_O;
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_c = _a46[_i47];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q44 = false;
              break Q45;
            }
          }
        }
        _c48 = _q44;
      }
      if (!(_c48)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, n: v_n, O: v_O.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ExactRegionBinding {
  r: number;
  n: number;
  O: readonly number[];
}

const exactRegionFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function exactRegion(b: Marks, _sp: GridSpace, cl: Dealt, fire: Fire<ExactRegionBinding> | null): number {
  const _g24: number[] = [];
  const facts = exactRegionFacts;
  let fired = 0;
  let changed = false;
  const _a16 = cl.region.parts;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_r = _a16[_i17];
    const _t18 = cl.region.cells[v_r];
    let _g19 = 0;
    G20: {
      const _a21 = _t18;
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_c = _a21[_i22];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g19++;
      }
    }
    const v_n = (cl.stars - _g19);
    const _t23 = cl.region.cells[v_r];
    _g24.length = 0;
    G25: {
      const _a28 = _t23;
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_c = _a28[_i29];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g24.push(v_c);
      }
    }
    L30: {
      const v_O = _g24;
      const _h31 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h31)))) break L30;
      if (DEV && staleChecking) {
        const _t32 = cl.region.cells[v_r];
        let _g33 = 0;
        G34: {
          const _a35 = _t32;
          for (let _i36 = 0; _i36 < _a35.length; _i36++) {
            const v_c = _a35[_i36];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g33++;
          }
        }
        const _t37 = cl.region.cells[v_r];
        const _g38: number[] = [];
        G39: {
          const _a42 = _t37;
          for (let _i43 = 0; _i43 < _a42.length; _i43++) {
            const v_c = _a42[_i43];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g38.push(v_c);
          }
        }
        freshBinding("exactRegion", [(cl.region.parts.includes(v_r)), (v_n === (cl.stars - _g33)), sameSet(v_O, _g38), ((v_n > 0) && (v_n >= v_O.length))], ["r in", "n =", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c48: boolean = (v_n === _h31);
      if (_c48) {
        let _q44 = true;
        Q45: {
          const _a46 = v_O;
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_c = _a46[_i47];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q44 = false;
              break Q45;
            }
          }
        }
        _c48 = _q44;
      }
      if (!(_c48)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, n: v_n, O: v_O.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ConfinedBinding {
  dir: number;
  a: number;
  B: readonly number[];
  n: number;
  I: readonly number[];
  mi: number;
  R: readonly number[];
  mr: number;
  lines: boolean;
}

const confinedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function confined(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ConfinedBinding> | null): number {
  const _g151: number[] = [];
  const _g196: number[] = [];
  const _g214: number[] = [];
  const _g259: number[] = [];
  const _g279: number[] = [];
  const _g432: number[] = [];
  const _g447: number[] = [];
  const facts = confinedFacts;
  let fired = 0;
  let changed = false;
  const _h145 = (sp.w - 1);
  for (let v_dir = 0; v_dir <= 1; v_dir++) {
    for (let v_a = 0; v_a <= _h145; v_a++) {
      const v_B = band(sp, 1, v_dir, v_a);
      let _g146 = 0;
      G147: {
        const _a148 = v_B;
        for (let _i149 = 0; _i149 < _a148.length; _i149++) {
          const v_c = _a148[_i149];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g146++;
        }
      }
      L150: {
        const v_n = (cl.stars - _g146);
        if (!((v_n > 0))) break L150;
        _g151.length = 0;
        G152: {
          const _a179 = cl.region.parts;
          for (let _i180 = 0; _i180 < _a179.length; _i180++) {
            const v_r = _a179[_i180];
            const _t181 = cl.region.cells[v_r];
            let _g182 = 0;
            G183: {
              const _a184 = _t181;
              for (let _i185 = 0; _i185 < _a184.length; _i185++) {
                const v_c = _a184[_i185];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g182++;
              }
            }
            let _c204: boolean = ((cl.stars - _g182) > 0);
            if (_c204) {
              let _q193 = true;
              Q194: {
                const _t195 = cl.region.cells[v_r];
                _g196.length = 0;
                G197: {
                  const _a200 = _t195;
                  for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                    const v_c = _a200[_i201];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g196.push(v_c);
                  }
                }
                const _a202 = _g196;
                for (let _i203 = 0; _i203 < _a202.length; _i203++) {
                  const v_c = _a202[_i203];
                  if (!((v_B.includes(v_c)))) {
                    _q193 = false;
                    break Q194;
                  }
                }
              }
              _c204 = _q193;
            }
            if (!(_c204)) continue;
            _g151.push(v_r);
          }
        }
        const v_I = _g151;
        let _g205 = 0;
        G206: {
          const _a207 = v_I;
          for (let _i208 = 0; _i208 < _a207.length; _i208++) {
            const v_r = _a207[_i208];
            const _t209 = cl.region.cells[v_r];
            let _g210 = 0;
            G211: {
              const _a212 = _t209;
              for (let _i213 = 0; _i213 < _a212.length; _i213++) {
                const v_c = _a212[_i213];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g210++;
              }
            }
            _g205 += (cl.stars - _g210);
          }
        }
        const v_mi = _g205;
        _g214.length = 0;
        G215: {
          const _a242 = cl.region.parts;
          for (let _i243 = 0; _i243 < _a242.length; _i243++) {
            const v_r = _a242[_i243];
            const _t244 = cl.region.cells[v_r];
            let _g245 = 0;
            G246: {
              const _a247 = _t244;
              for (let _i248 = 0; _i248 < _a247.length; _i248++) {
                const v_c = _a247[_i248];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g245++;
              }
            }
            let _c267: boolean = ((cl.stars - _g245) > 0);
            if (_c267) {
              let _q256 = false;
              Q257: {
                const _t258 = cl.region.cells[v_r];
                _g259.length = 0;
                G260: {
                  const _a263 = _t258;
                  for (let _i264 = 0; _i264 < _a263.length; _i264++) {
                    const v_c = _a263[_i264];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g259.push(v_c);
                  }
                }
                const _a265 = _g259;
                for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                  const v_c = _a265[_i266];
                  if ((v_B.includes(v_c))) {
                    _q256 = true;
                    break Q257;
                  }
                }
              }
              _c267 = _q256;
            }
            if (!(_c267)) continue;
            _g214.push(v_r);
          }
        }
        const v_R = _g214;
        let _g268 = 0;
        G269: {
          const _a270 = v_R;
          for (let _i271 = 0; _i271 < _a270.length; _i271++) {
            const v_r = _a270[_i271];
            const _t272 = cl.region.cells[v_r];
            let _g273 = 0;
            G274: {
              const _a275 = _t272;
              for (let _i276 = 0; _i276 < _a275.length; _i276++) {
                const v_c = _a275[_i276];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g273++;
              }
            }
            _g268 += (cl.stars - _g273);
          }
        }
        const v_mr = _g268;
        let _c287: boolean = (v_mi === v_n);
        if (_c287) {
          let _q277 = false;
          Q278: {
            _g279.length = 0;
            G280: {
              const _a283 = v_B;
              for (let _i284 = 0; _i284 < _a283.length; _i284++) {
                const v_c = _a283[_i284];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g279.push(v_c);
              }
            }
            const _a285 = _g279;
            for (let _i286 = 0; _i286 < _a285.length; _i286++) {
              const v_c = _a285[_i286];
              if (!(v_I.includes(cl.region.of[v_c]))) {
                _q277 = true;
                break Q278;
              }
            }
          }
          _c287 = _q277;
        }
        L288: {
          const v_lines = _c287;
          if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L288;
          if (DEV && staleChecking) {
            let _g289 = 0;
            G290: {
              const _a291 = v_B;
              for (let _i292 = 0; _i292 < _a291.length; _i292++) {
                const v_c = _a291[_i292];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g289++;
              }
            }
            const _g293: number[] = [];
            G294: {
              const _a321 = cl.region.parts;
              for (let _i322 = 0; _i322 < _a321.length; _i322++) {
                const v_r = _a321[_i322];
                const _t323 = cl.region.cells[v_r];
                let _g324 = 0;
                G325: {
                  const _a326 = _t323;
                  for (let _i327 = 0; _i327 < _a326.length; _i327++) {
                    const v_c = _a326[_i327];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g324++;
                  }
                }
                let _c346: boolean = ((cl.stars - _g324) > 0);
                if (_c346) {
                  let _q335 = true;
                  Q336: {
                    const _t337 = cl.region.cells[v_r];
                    const _g338: number[] = [];
                    G339: {
                      const _a342 = _t337;
                      for (let _i343 = 0; _i343 < _a342.length; _i343++) {
                        const v_c = _a342[_i343];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g338.push(v_c);
                      }
                    }
                    const _a344 = _g338;
                    for (let _i345 = 0; _i345 < _a344.length; _i345++) {
                      const v_c = _a344[_i345];
                      if (!((v_B.includes(v_c)))) {
                        _q335 = false;
                        break Q336;
                      }
                    }
                  }
                  _c346 = _q335;
                }
                if (!(_c346)) continue;
                _g293.push(v_r);
              }
            }
            let _g347 = 0;
            G348: {
              const _a349 = v_I;
              for (let _i350 = 0; _i350 < _a349.length; _i350++) {
                const v_r = _a349[_i350];
                const _t351 = cl.region.cells[v_r];
                let _g352 = 0;
                G353: {
                  const _a354 = _t351;
                  for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                    const v_c = _a354[_i355];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g352++;
                  }
                }
                _g347 += (cl.stars - _g352);
              }
            }
            const _g356: number[] = [];
            G357: {
              const _a384 = cl.region.parts;
              for (let _i385 = 0; _i385 < _a384.length; _i385++) {
                const v_r = _a384[_i385];
                const _t386 = cl.region.cells[v_r];
                let _g387 = 0;
                G388: {
                  const _a389 = _t386;
                  for (let _i390 = 0; _i390 < _a389.length; _i390++) {
                    const v_c = _a389[_i390];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g387++;
                  }
                }
                let _c409: boolean = ((cl.stars - _g387) > 0);
                if (_c409) {
                  let _q398 = false;
                  Q399: {
                    const _t400 = cl.region.cells[v_r];
                    const _g401: number[] = [];
                    G402: {
                      const _a405 = _t400;
                      for (let _i406 = 0; _i406 < _a405.length; _i406++) {
                        const v_c = _a405[_i406];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g401.push(v_c);
                      }
                    }
                    const _a407 = _g401;
                    for (let _i408 = 0; _i408 < _a407.length; _i408++) {
                      const v_c = _a407[_i408];
                      if ((v_B.includes(v_c))) {
                        _q398 = true;
                        break Q399;
                      }
                    }
                  }
                  _c409 = _q398;
                }
                if (!(_c409)) continue;
                _g356.push(v_r);
              }
            }
            let _g410 = 0;
            G411: {
              const _a412 = v_R;
              for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                const v_r = _a412[_i413];
                const _t414 = cl.region.cells[v_r];
                let _g415 = 0;
                G416: {
                  const _a417 = _t414;
                  for (let _i418 = 0; _i418 < _a417.length; _i418++) {
                    const v_c = _a417[_i418];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g415++;
                  }
                }
                _g410 += (cl.stars - _g415);
              }
            }
            let _c429: boolean = (v_mi === v_n);
            if (_c429) {
              let _q419 = false;
              Q420: {
                const _g421: number[] = [];
                G422: {
                  const _a425 = v_B;
                  for (let _i426 = 0; _i426 < _a425.length; _i426++) {
                    const v_c = _a425[_i426];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g421.push(v_c);
                  }
                }
                const _a427 = _g421;
                for (let _i428 = 0; _i428 < _a427.length; _i428++) {
                  const v_c = _a427[_i428];
                  if (!(v_I.includes(cl.region.of[v_c]))) {
                    _q419 = true;
                    break Q420;
                  }
                }
              }
              _c429 = _q419;
            }
            freshBinding("confined", [((0 <= v_dir) && (v_dir <= 1)), ((0 <= v_a) && (v_a <= (sp.w - 1))), sameSet(v_B, band(sp, 1, v_dir, v_a)), (v_n === (cl.stars - _g289)), (v_n > 0), sameSet(v_I, _g293), (v_mi === _g347), sameSet(v_R, _g356), (v_mr === _g410), (v_lines === _c429), ((v_mi >= v_n) || (v_mr <= v_n))], ["dir in", "a in", "B =", "n =", "where of n", "I =", "mi =", "R =", "mr =", "lines =", "where of lines"]);
          }
          facts.length = 0;
          changed = false;
          let _c441: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
          if (_c441) {
            let _c440: boolean = !(v_lines);
            if (!_c440) {
              let _q430 = true;
              Q431: {
                _g432.length = 0;
                G433: {
                  const _a436 = v_B;
                  for (let _i437 = 0; _i437 < _a436.length; _i437++) {
                    const v_c = _a436[_i437];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g432.push(v_c);
                  }
                }
                const _a438 = _g432;
                for (let _i439 = 0; _i439 < _a438.length; _i439++) {
                  const v_c = _a438[_i439];
                  if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                  if (!(true)) {
                    _q430 = false;
                    break Q431;
                  }
                }
              }
              _c440 = _q430;
            }
            _c441 = _c440;
          }
          let _c456: boolean = _c441;
          if (_c456) {
            let _c455: boolean = (v_lines || (v_mr > v_n));
            if (!_c455) {
              let _q442 = true;
              Q443: {
                const _a444 = v_R;
                for (let _i445 = 0; _i445 < _a444.length; _i445++) {
                  const v_r = _a444[_i445];
                  const _t446 = cl.region.cells[v_r];
                  _g447.length = 0;
                  G448: {
                    const _a451 = _t446;
                    for (let _i452 = 0; _i452 < _a451.length; _i452++) {
                      const v_c = _a451[_i452];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g447.push(v_c);
                    }
                  }
                  const _a453 = _g447;
                  for (let _i454 = 0; _i454 < _a453.length; _i454++) {
                    const v_c = _a453[_i454];
                    if (!(!(v_B.includes(v_c)))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q442 = false;
                      break Q443;
                    }
                  }
                }
              }
              _c455 = _q442;
            }
            _c456 = _c455;
          }
          if (!(_c456)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ dir: v_dir, a: v_a, B: v_B.slice(), n: v_n, I: v_I.slice(), mi: v_mi, R: v_R.slice(), mr: v_mr, lines: v_lines }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface NeededLineBinding {
  L: number;
  n: number;
  O: readonly number[];
  x: number;
  E: readonly number[];
  room: number;
}

const neededLineFacts: number[] = [];
let neededLine_f86 = new Int32Array(0);
let neededLine_l87: readonly number[] = [];
let neededLine_f113 = new Int32Array(0);
let neededLine_l114: readonly number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function neededLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededLineBinding> | null): number {
  const _g73: number[] = [];
  if (neededLine_f86.length < sp.cells.length) neededLine_f86 = new Int32Array(sp.cells.length).fill(-1);
  else neededLine_f86.fill(-1);
  neededLine_l87 = [];
  const _s88: number[] = [];
  if (neededLine_f113.length < sp.cells.length) neededLine_f113 = new Int32Array(sp.cells.length).fill(-1);
  else neededLine_f113.fill(-1);
  neededLine_l114 = [];
  const _s115: number[] = [];
  const _g139: number[] = [];
  const facts = neededLineFacts;
  let fired = 0;
  let changed = false;
  const _a65 = sp.lines;
  R1:
  for (let _i66 = 0; _i66 < _a65.length; _i66++) {
    const v_L = _a65[_i66];
    const _m203_0 = b.made[0];
    const _t67 = sp.lineCells[v_L];
    let _g68 = 0;
    G69: {
      const _a70 = _t67;
      for (let _i71 = 0; _i71 < _a70.length; _i71++) {
        const v_c = _a70[_i71];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g68++;
      }
    }
    const v_n = (cl.stars - _g68);
    const _t72 = sp.lineCells[v_L];
    _g73.length = 0;
    G74: {
      const _a77 = _t72;
      for (let _i78 = 0; _i78 < _a77.length; _i78++) {
        const v_c = _a77[_i78];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g73.push(v_c);
      }
    }
    L79: {
      const v_O = _g73;
      if (!((v_n > 0))) break L79;
      const _a80 = v_O;
      for (let _i81 = 0; _i81 < _a80.length; _i81++) {
        const v_x = _a80[_i81];
        L82: {
          const v_E = minus(v_O, setOf(v_x));
          const _h94 = v_E.length;
          const _h106 = (2 * _h94);
          const _h107 = (_h106 - v_n);
          let _q83 = false;
          Q84: {
            const _a85 = v_E;
            const _t95 = ((2 * _h94) - v_n);
            const _lo96 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi97 = 31 - Math.clz32(b.domain);
            for (const _e89 of neededLine_l87) neededLine_f86[_e89] = -1;
            neededLine_l87 = _a85;
            let _i91 = 0;
            _s88[0] = 0;
            let _o99 = _a85.length === 0;
            for (;;) {
              if (_a85.length === 0) {
                if (!_o99) break;
                _o99 = false;
              }
              while (_a85.length > 0 && _i91 >= 0) {
                const _e89 = _a85[_i91];
                if (_s88[_i91] > 0) neededLine_f86[_e89] = -1;
                let _r98 = b.domain & ~((2 << _s88[_i91]) - 1);
                let _d90 = 0;
                V93: for (; _r98 !== 0; _r98 &= _r98 - 1) {
                  _d90 = 31 - Math.clz32(_r98 & -_r98);
                  neededLine_f86[_e89] = _d90;
                  {
                    let _t100 = _d90;
                    for (let _j92 = 0; _j92 < _i91; _j92++) _t100 += neededLine_f86[_a85[_j92]];
                    if (_t100 + (_a85.length - _i91 - 1) * _lo96 > _t95) continue;
                    if (_t100 + (_a85.length - _i91 - 1) * _hi97 < _t95) continue;
                  }
                  for (let _j92 = 0; _j92 < _i91; _j92++) {
                    const _y101 = _a85[_j92];
                    if (!(!((((neededLine_f86[_e89] === 1) && (neededLine_f86[_y101] === 1)) && (sp.adj8[_e89].includes(_y101)))))) continue V93;
                  }
                  break;
                }
                if (_r98 === 0) {
                  _s88[_i91] = 0;
                  _i91--;
                  continue;
                }
                _s88[_i91] = _d90;
                if (_i91 === _a85.length - 1) break;
                _i91++;
                _s88[_i91] = 0;
              }
              if (_i91 < 0) break;
              let _g102 = 0;
              G103: {
                const _a104 = v_E;
                for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                  const v_x = _a104[_i105];
                  _g102 += neededLine_f86[v_x];
                }
              }
              if (!((_g102 === _h107))) continue;
              if (true) {
                _q83 = true;
                break Q84;
              }
            }
          }
          if (!(!(_q83))) break L82;
          let _g108 = -1;
          G109: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h132 = (_h106 - v_j);
              let _q110 = false;
              Q111: {
                const _a112 = v_E;
                const _t121 = (_h106 - v_j);
                const _lo122 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi123 = 31 - Math.clz32(b.domain);
                for (const _e116 of neededLine_l114) neededLine_f113[_e116] = -1;
                neededLine_l114 = _a112;
                let _i118 = 0;
                _s115[0] = 0;
                let _o125 = _a112.length === 0;
                for (;;) {
                  if (_a112.length === 0) {
                    if (!_o125) break;
                    _o125 = false;
                  }
                  while (_a112.length > 0 && _i118 >= 0) {
                    const _e116 = _a112[_i118];
                    if (_s115[_i118] > 0) neededLine_f113[_e116] = -1;
                    let _r124 = b.domain & ~((2 << _s115[_i118]) - 1);
                    let _d117 = 0;
                    V120: for (; _r124 !== 0; _r124 &= _r124 - 1) {
                      _d117 = 31 - Math.clz32(_r124 & -_r124);
                      neededLine_f113[_e116] = _d117;
                      {
                        let _t126 = _d117;
                        for (let _j119 = 0; _j119 < _i118; _j119++) _t126 += neededLine_f113[_a112[_j119]];
                        if (_t126 + (_a112.length - _i118 - 1) * _lo122 > _t121) continue;
                        if (_t126 + (_a112.length - _i118 - 1) * _hi123 < _t121) continue;
                      }
                      for (let _j119 = 0; _j119 < _i118; _j119++) {
                        const _y127 = _a112[_j119];
                        if (!(!((((neededLine_f113[_e116] === 1) && (neededLine_f113[_y127] === 1)) && (sp.adj8[_e116].includes(_y127)))))) continue V120;
                      }
                      break;
                    }
                    if (_r124 === 0) {
                      _s115[_i118] = 0;
                      _i118--;
                      continue;
                    }
                    _s115[_i118] = _d117;
                    if (_i118 === _a112.length - 1) break;
                    _i118++;
                    _s115[_i118] = 0;
                  }
                  if (_i118 < 0) break;
                  let _g128 = 0;
                  G129: {
                    const _a130 = v_E;
                    for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                      const v_x = _a130[_i131];
                      _g128 += neededLine_f113[v_x];
                    }
                  }
                  if (!((_g128 === _h132))) continue;
                  if (true) {
                    _q110 = true;
                    break Q111;
                  }
                }
              }
              if (!(_q110)) continue;
              _g108 = v_j;
              break G109;
            }
          }
          const v_room = _g108;
          if (b.made[0] !== _m203_0) {
            const _t133 = sp.lineCells[v_L];
            let _g134 = 0;
            G135: {
              const _a136 = _t133;
              for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                const v_c = _a136[_i137];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g134++;
              }
            }
            if (!((v_n === (cl.stars - _g134)))) { continue R1; }
            const _t138 = sp.lineCells[v_L];
            _g139.length = 0;
            G140: {
              const _a143 = _t138;
              for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                const v_c = _a143[_i144];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g139.push(v_c);
              }
            }
            if (!(sameSet(v_O, _g139))) { continue R1; }
          }
          if (DEV && staleChecking) {
            const _t145 = sp.lineCells[v_L];
            let _g146 = 0;
            G147: {
              const _a148 = _t145;
              for (let _i149 = 0; _i149 < _a148.length; _i149++) {
                const v_c = _a148[_i149];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g146++;
              }
            }
            const _t150 = sp.lineCells[v_L];
            const _g151: number[] = [];
            G152: {
              const _a155 = _t150;
              for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                const v_c = _a155[_i156];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g151.push(v_c);
              }
            }
            let _q157 = false;
            Q158: {
              const _f160 = new Int32Array(sp.cells.length).fill(-1);
              let _l161: readonly number[] = [];
              const _s162: number[] = [];
              const _a159 = v_E;
              const _t168 = ((2 * v_E.length) - v_n);
              const _lo169 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi170 = 31 - Math.clz32(b.domain);
              for (const _e163 of _l161) _f160[_e163] = -1;
              _l161 = _a159;
              let _i165 = 0;
              _s162[0] = 0;
              let _o172 = _a159.length === 0;
              for (;;) {
                if (_a159.length === 0) {
                  if (!_o172) break;
                  _o172 = false;
                }
                while (_a159.length > 0 && _i165 >= 0) {
                  const _e163 = _a159[_i165];
                  if (_s162[_i165] > 0) _f160[_e163] = -1;
                  let _r171 = b.domain & ~((2 << _s162[_i165]) - 1);
                  let _d164 = 0;
                  V167: for (; _r171 !== 0; _r171 &= _r171 - 1) {
                    _d164 = 31 - Math.clz32(_r171 & -_r171);
                    _f160[_e163] = _d164;
                    {
                      let _t173 = _d164;
                      for (let _j166 = 0; _j166 < _i165; _j166++) _t173 += _f160[_a159[_j166]];
                      if (_t173 + (_a159.length - _i165 - 1) * _lo169 > _t168) continue;
                      if (_t173 + (_a159.length - _i165 - 1) * _hi170 < _t168) continue;
                    }
                    for (let _j166 = 0; _j166 < _i165; _j166++) {
                      const _y174 = _a159[_j166];
                      if (!(!((((_f160[_e163] === 1) && (_f160[_y174] === 1)) && (sp.adj8[_e163].includes(_y174)))))) continue V167;
                    }
                    break;
                  }
                  if (_r171 === 0) {
                    _s162[_i165] = 0;
                    _i165--;
                    continue;
                  }
                  _s162[_i165] = _d164;
                  if (_i165 === _a159.length - 1) break;
                  _i165++;
                  _s162[_i165] = 0;
                }
                if (_i165 < 0) break;
                let _g175 = 0;
                G176: {
                  const _a177 = v_E;
                  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                    const v_x = _a177[_i178];
                    _g175 += _f160[v_x];
                  }
                }
                if (!((_g175 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q157 = true;
                  break Q158;
                }
              }
            }
            let _g179 = -1;
            G180: {
              for (let v_j = v_n; v_j >= 0; v_j--) {
                let _q181 = false;
                Q182: {
                  const _f184 = new Int32Array(sp.cells.length).fill(-1);
                  let _l185: readonly number[] = [];
                  const _s186: number[] = [];
                  const _a183 = v_E;
                  const _t192 = ((2 * v_E.length) - v_j);
                  const _lo193 = 31 - Math.clz32(b.domain & -b.domain);
                  const _hi194 = 31 - Math.clz32(b.domain);
                  for (const _e187 of _l185) _f184[_e187] = -1;
                  _l185 = _a183;
                  let _i189 = 0;
                  _s186[0] = 0;
                  let _o196 = _a183.length === 0;
                  for (;;) {
                    if (_a183.length === 0) {
                      if (!_o196) break;
                      _o196 = false;
                    }
                    while (_a183.length > 0 && _i189 >= 0) {
                      const _e187 = _a183[_i189];
                      if (_s186[_i189] > 0) _f184[_e187] = -1;
                      let _r195 = b.domain & ~((2 << _s186[_i189]) - 1);
                      let _d188 = 0;
                      V191: for (; _r195 !== 0; _r195 &= _r195 - 1) {
                        _d188 = 31 - Math.clz32(_r195 & -_r195);
                        _f184[_e187] = _d188;
                        {
                          let _t197 = _d188;
                          for (let _j190 = 0; _j190 < _i189; _j190++) _t197 += _f184[_a183[_j190]];
                          if (_t197 + (_a183.length - _i189 - 1) * _lo193 > _t192) continue;
                          if (_t197 + (_a183.length - _i189 - 1) * _hi194 < _t192) continue;
                        }
                        for (let _j190 = 0; _j190 < _i189; _j190++) {
                          const _y198 = _a183[_j190];
                          if (!(!((((_f184[_e187] === 1) && (_f184[_y198] === 1)) && (sp.adj8[_e187].includes(_y198)))))) continue V191;
                        }
                        break;
                      }
                      if (_r195 === 0) {
                        _s186[_i189] = 0;
                        _i189--;
                        continue;
                      }
                      _s186[_i189] = _d188;
                      if (_i189 === _a183.length - 1) break;
                      _i189++;
                      _s186[_i189] = 0;
                    }
                    if (_i189 < 0) break;
                    let _g199 = 0;
                    G200: {
                      const _a201 = v_E;
                      for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                        const v_x = _a201[_i202];
                        _g199 += _f184[v_x];
                      }
                    }
                    if (!((_g199 === ((2 * v_E.length) - v_j)))) continue;
                    if (true) {
                      _q181 = true;
                      break Q182;
                    }
                  }
                }
                if (!(_q181)) continue;
                _g179 = v_j;
                break G180;
              }
            }
            freshBinding("neededLine", [(sp.lines.includes(v_L)), (v_n === (cl.stars - _g146)), sameSet(v_O, _g151), (v_n > 0), (v_O.includes(v_x)), sameSet(v_E, minus(v_O, setOf(v_x))), !(_q157), (v_room === _g179)], ["L in", "n =", "O =", "where of O", "x in", "E =", "where of E", "room ="]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, n: v_n, O: v_O.slice(), x: v_x, E: v_E.slice(), room: v_room }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface NeededRegionBinding {
  r: number;
  n: number;
  O: readonly number[];
  x: number;
  E: readonly number[];
  room: number;
}

const neededRegionFacts: number[] = [];
let neededRegion_f86 = new Int32Array(0);
let neededRegion_l87: readonly number[] = [];
let neededRegion_f113 = new Int32Array(0);
let neededRegion_l114: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function neededRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededRegionBinding> | null): number {
  const _g73: number[] = [];
  if (neededRegion_f86.length < sp.cells.length) neededRegion_f86 = new Int32Array(sp.cells.length).fill(-1);
  else neededRegion_f86.fill(-1);
  neededRegion_l87 = [];
  const _s88: number[] = [];
  if (neededRegion_f113.length < sp.cells.length) neededRegion_f113 = new Int32Array(sp.cells.length).fill(-1);
  else neededRegion_f113.fill(-1);
  neededRegion_l114 = [];
  const _s115: number[] = [];
  const _g139: number[] = [];
  const facts = neededRegionFacts;
  let fired = 0;
  let changed = false;
  const _a65 = cl.region.parts;
  R1:
  for (let _i66 = 0; _i66 < _a65.length; _i66++) {
    const v_r = _a65[_i66];
    const _m203_0 = b.made[0];
    const _t67 = cl.region.cells[v_r];
    let _g68 = 0;
    G69: {
      const _a70 = _t67;
      for (let _i71 = 0; _i71 < _a70.length; _i71++) {
        const v_c = _a70[_i71];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g68++;
      }
    }
    const v_n = (cl.stars - _g68);
    const _t72 = cl.region.cells[v_r];
    _g73.length = 0;
    G74: {
      const _a77 = _t72;
      for (let _i78 = 0; _i78 < _a77.length; _i78++) {
        const v_c = _a77[_i78];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g73.push(v_c);
      }
    }
    L79: {
      const v_O = _g73;
      if (!((v_n > 0))) break L79;
      const _a80 = v_O;
      for (let _i81 = 0; _i81 < _a80.length; _i81++) {
        const v_x = _a80[_i81];
        L82: {
          const v_E = minus(v_O, setOf(v_x));
          const _h94 = v_E.length;
          const _h106 = (2 * _h94);
          const _h107 = (_h106 - v_n);
          let _q83 = false;
          Q84: {
            const _a85 = v_E;
            const _t95 = ((2 * _h94) - v_n);
            const _lo96 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi97 = 31 - Math.clz32(b.domain);
            for (const _e89 of neededRegion_l87) neededRegion_f86[_e89] = -1;
            neededRegion_l87 = _a85;
            let _i91 = 0;
            _s88[0] = 0;
            let _o99 = _a85.length === 0;
            for (;;) {
              if (_a85.length === 0) {
                if (!_o99) break;
                _o99 = false;
              }
              while (_a85.length > 0 && _i91 >= 0) {
                const _e89 = _a85[_i91];
                if (_s88[_i91] > 0) neededRegion_f86[_e89] = -1;
                let _r98 = b.domain & ~((2 << _s88[_i91]) - 1);
                let _d90 = 0;
                V93: for (; _r98 !== 0; _r98 &= _r98 - 1) {
                  _d90 = 31 - Math.clz32(_r98 & -_r98);
                  neededRegion_f86[_e89] = _d90;
                  {
                    let _t100 = _d90;
                    for (let _j92 = 0; _j92 < _i91; _j92++) _t100 += neededRegion_f86[_a85[_j92]];
                    if (_t100 + (_a85.length - _i91 - 1) * _lo96 > _t95) continue;
                    if (_t100 + (_a85.length - _i91 - 1) * _hi97 < _t95) continue;
                  }
                  for (let _j92 = 0; _j92 < _i91; _j92++) {
                    const _y101 = _a85[_j92];
                    if (!(!((((neededRegion_f86[_e89] === 1) && (neededRegion_f86[_y101] === 1)) && (sp.adj8[_e89].includes(_y101)))))) continue V93;
                  }
                  break;
                }
                if (_r98 === 0) {
                  _s88[_i91] = 0;
                  _i91--;
                  continue;
                }
                _s88[_i91] = _d90;
                if (_i91 === _a85.length - 1) break;
                _i91++;
                _s88[_i91] = 0;
              }
              if (_i91 < 0) break;
              let _g102 = 0;
              G103: {
                const _a104 = v_E;
                for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                  const v_x = _a104[_i105];
                  _g102 += neededRegion_f86[v_x];
                }
              }
              if (!((_g102 === _h107))) continue;
              if (true) {
                _q83 = true;
                break Q84;
              }
            }
          }
          if (!(!(_q83))) break L82;
          let _g108 = -1;
          G109: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h132 = (_h106 - v_j);
              let _q110 = false;
              Q111: {
                const _a112 = v_E;
                const _t121 = (_h106 - v_j);
                const _lo122 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi123 = 31 - Math.clz32(b.domain);
                for (const _e116 of neededRegion_l114) neededRegion_f113[_e116] = -1;
                neededRegion_l114 = _a112;
                let _i118 = 0;
                _s115[0] = 0;
                let _o125 = _a112.length === 0;
                for (;;) {
                  if (_a112.length === 0) {
                    if (!_o125) break;
                    _o125 = false;
                  }
                  while (_a112.length > 0 && _i118 >= 0) {
                    const _e116 = _a112[_i118];
                    if (_s115[_i118] > 0) neededRegion_f113[_e116] = -1;
                    let _r124 = b.domain & ~((2 << _s115[_i118]) - 1);
                    let _d117 = 0;
                    V120: for (; _r124 !== 0; _r124 &= _r124 - 1) {
                      _d117 = 31 - Math.clz32(_r124 & -_r124);
                      neededRegion_f113[_e116] = _d117;
                      {
                        let _t126 = _d117;
                        for (let _j119 = 0; _j119 < _i118; _j119++) _t126 += neededRegion_f113[_a112[_j119]];
                        if (_t126 + (_a112.length - _i118 - 1) * _lo122 > _t121) continue;
                        if (_t126 + (_a112.length - _i118 - 1) * _hi123 < _t121) continue;
                      }
                      for (let _j119 = 0; _j119 < _i118; _j119++) {
                        const _y127 = _a112[_j119];
                        if (!(!((((neededRegion_f113[_e116] === 1) && (neededRegion_f113[_y127] === 1)) && (sp.adj8[_e116].includes(_y127)))))) continue V120;
                      }
                      break;
                    }
                    if (_r124 === 0) {
                      _s115[_i118] = 0;
                      _i118--;
                      continue;
                    }
                    _s115[_i118] = _d117;
                    if (_i118 === _a112.length - 1) break;
                    _i118++;
                    _s115[_i118] = 0;
                  }
                  if (_i118 < 0) break;
                  let _g128 = 0;
                  G129: {
                    const _a130 = v_E;
                    for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                      const v_x = _a130[_i131];
                      _g128 += neededRegion_f113[v_x];
                    }
                  }
                  if (!((_g128 === _h132))) continue;
                  if (true) {
                    _q110 = true;
                    break Q111;
                  }
                }
              }
              if (!(_q110)) continue;
              _g108 = v_j;
              break G109;
            }
          }
          const v_room = _g108;
          if (b.made[0] !== _m203_0) {
            const _t133 = cl.region.cells[v_r];
            let _g134 = 0;
            G135: {
              const _a136 = _t133;
              for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                const v_c = _a136[_i137];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g134++;
              }
            }
            if (!((v_n === (cl.stars - _g134)))) { continue R1; }
            const _t138 = cl.region.cells[v_r];
            _g139.length = 0;
            G140: {
              const _a143 = _t138;
              for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                const v_c = _a143[_i144];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g139.push(v_c);
              }
            }
            if (!(sameSet(v_O, _g139))) { continue R1; }
          }
          if (DEV && staleChecking) {
            const _t145 = cl.region.cells[v_r];
            let _g146 = 0;
            G147: {
              const _a148 = _t145;
              for (let _i149 = 0; _i149 < _a148.length; _i149++) {
                const v_c = _a148[_i149];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g146++;
              }
            }
            const _t150 = cl.region.cells[v_r];
            const _g151: number[] = [];
            G152: {
              const _a155 = _t150;
              for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                const v_c = _a155[_i156];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g151.push(v_c);
              }
            }
            let _q157 = false;
            Q158: {
              const _f160 = new Int32Array(sp.cells.length).fill(-1);
              let _l161: readonly number[] = [];
              const _s162: number[] = [];
              const _a159 = v_E;
              const _t168 = ((2 * v_E.length) - v_n);
              const _lo169 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi170 = 31 - Math.clz32(b.domain);
              for (const _e163 of _l161) _f160[_e163] = -1;
              _l161 = _a159;
              let _i165 = 0;
              _s162[0] = 0;
              let _o172 = _a159.length === 0;
              for (;;) {
                if (_a159.length === 0) {
                  if (!_o172) break;
                  _o172 = false;
                }
                while (_a159.length > 0 && _i165 >= 0) {
                  const _e163 = _a159[_i165];
                  if (_s162[_i165] > 0) _f160[_e163] = -1;
                  let _r171 = b.domain & ~((2 << _s162[_i165]) - 1);
                  let _d164 = 0;
                  V167: for (; _r171 !== 0; _r171 &= _r171 - 1) {
                    _d164 = 31 - Math.clz32(_r171 & -_r171);
                    _f160[_e163] = _d164;
                    {
                      let _t173 = _d164;
                      for (let _j166 = 0; _j166 < _i165; _j166++) _t173 += _f160[_a159[_j166]];
                      if (_t173 + (_a159.length - _i165 - 1) * _lo169 > _t168) continue;
                      if (_t173 + (_a159.length - _i165 - 1) * _hi170 < _t168) continue;
                    }
                    for (let _j166 = 0; _j166 < _i165; _j166++) {
                      const _y174 = _a159[_j166];
                      if (!(!((((_f160[_e163] === 1) && (_f160[_y174] === 1)) && (sp.adj8[_e163].includes(_y174)))))) continue V167;
                    }
                    break;
                  }
                  if (_r171 === 0) {
                    _s162[_i165] = 0;
                    _i165--;
                    continue;
                  }
                  _s162[_i165] = _d164;
                  if (_i165 === _a159.length - 1) break;
                  _i165++;
                  _s162[_i165] = 0;
                }
                if (_i165 < 0) break;
                let _g175 = 0;
                G176: {
                  const _a177 = v_E;
                  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                    const v_x = _a177[_i178];
                    _g175 += _f160[v_x];
                  }
                }
                if (!((_g175 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q157 = true;
                  break Q158;
                }
              }
            }
            let _g179 = -1;
            G180: {
              for (let v_j = v_n; v_j >= 0; v_j--) {
                let _q181 = false;
                Q182: {
                  const _f184 = new Int32Array(sp.cells.length).fill(-1);
                  let _l185: readonly number[] = [];
                  const _s186: number[] = [];
                  const _a183 = v_E;
                  const _t192 = ((2 * v_E.length) - v_j);
                  const _lo193 = 31 - Math.clz32(b.domain & -b.domain);
                  const _hi194 = 31 - Math.clz32(b.domain);
                  for (const _e187 of _l185) _f184[_e187] = -1;
                  _l185 = _a183;
                  let _i189 = 0;
                  _s186[0] = 0;
                  let _o196 = _a183.length === 0;
                  for (;;) {
                    if (_a183.length === 0) {
                      if (!_o196) break;
                      _o196 = false;
                    }
                    while (_a183.length > 0 && _i189 >= 0) {
                      const _e187 = _a183[_i189];
                      if (_s186[_i189] > 0) _f184[_e187] = -1;
                      let _r195 = b.domain & ~((2 << _s186[_i189]) - 1);
                      let _d188 = 0;
                      V191: for (; _r195 !== 0; _r195 &= _r195 - 1) {
                        _d188 = 31 - Math.clz32(_r195 & -_r195);
                        _f184[_e187] = _d188;
                        {
                          let _t197 = _d188;
                          for (let _j190 = 0; _j190 < _i189; _j190++) _t197 += _f184[_a183[_j190]];
                          if (_t197 + (_a183.length - _i189 - 1) * _lo193 > _t192) continue;
                          if (_t197 + (_a183.length - _i189 - 1) * _hi194 < _t192) continue;
                        }
                        for (let _j190 = 0; _j190 < _i189; _j190++) {
                          const _y198 = _a183[_j190];
                          if (!(!((((_f184[_e187] === 1) && (_f184[_y198] === 1)) && (sp.adj8[_e187].includes(_y198)))))) continue V191;
                        }
                        break;
                      }
                      if (_r195 === 0) {
                        _s186[_i189] = 0;
                        _i189--;
                        continue;
                      }
                      _s186[_i189] = _d188;
                      if (_i189 === _a183.length - 1) break;
                      _i189++;
                      _s186[_i189] = 0;
                    }
                    if (_i189 < 0) break;
                    let _g199 = 0;
                    G200: {
                      const _a201 = v_E;
                      for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                        const v_x = _a201[_i202];
                        _g199 += _f184[v_x];
                      }
                    }
                    if (!((_g199 === ((2 * v_E.length) - v_j)))) continue;
                    if (true) {
                      _q181 = true;
                      break Q182;
                    }
                  }
                }
                if (!(_q181)) continue;
                _g179 = v_j;
                break G180;
              }
            }
            freshBinding("neededRegion", [(cl.region.parts.includes(v_r)), (v_n === (cl.stars - _g146)), sameSet(v_O, _g151), (v_n > 0), (v_O.includes(v_x)), sameSet(v_E, minus(v_O, setOf(v_x))), !(_q157), (v_room === _g179)], ["r in", "n =", "O =", "where of O", "x in", "E =", "where of E", "room ="]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ r: v_r, n: v_n, O: v_O.slice(), x: v_x, E: v_E.slice(), room: v_room }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface CrowdedLineBinding {
  x: number;
  R: readonly number[];
  L: number;
  S: readonly number[];
  n: number;
  E: readonly number[];
  room: number;
  Q: readonly number[];
}

const crowdedLineFacts: number[] = [];
let crowdedLine_f153 = new Int32Array(0);
let crowdedLine_l154: readonly number[] = [];
let crowdedLine_f181 = new Int32Array(0);
let crowdedLine_l182: readonly number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function crowdedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedLineBinding> | null): number {
  const _g109: number[] = [];
  const _g131: number[] = [];
  const _g141: number[] = [];
  if (crowdedLine_f153.length < sp.cells.length) crowdedLine_f153 = new Int32Array(sp.cells.length).fill(-1);
  else crowdedLine_f153.fill(-1);
  crowdedLine_l154 = [];
  const _s155: number[] = [];
  if (crowdedLine_f181.length < sp.cells.length) crowdedLine_f181 = new Int32Array(sp.cells.length).fill(-1);
  else crowdedLine_f181.fill(-1);
  crowdedLine_l182 = [];
  const _s183: number[] = [];
  const _g201: number[] = [];
  const _g211: number[] = [];
  const _g219: number[] = [];
  const facts = crowdedLineFacts;
  let fired = 0;
  let changed = false;
  const _a107 = sp.cells;
  R1:
  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
    const v_x = _a107[_i108];
    const _m326_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h117 = sp.rowOf[v_x];
    const _h118 = sp.colOf[v_x];
    _g109.length = 0;
    G110: {
      const _a113 = sp.adj8[v_x];
      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
        const v_p = _a113[_i114];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g109.push(v_p);
      }
    }
    const v_R = _g109;
    const _a115 = sp.lines;
    for (let _i116 = 0; _i116 < _a115.length; _i116++) {
      const v_L = _a115[_i116];
      let _c123: boolean = ((v_L === _h117) || (v_L === _h118));
      if (!_c123) {
        let _q119 = false;
        Q120: {
          const _a121 = v_R;
          for (let _i122 = 0; _i122 < _a121.length; _i122++) {
            const v_p = _a121[_i122];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q119 = true;
              break Q120;
            }
          }
        }
        _c123 = _q119;
      }
      if (!(_c123)) continue;
      const v_S = sp.lineCells[v_L];
      let _g124 = 0;
      G125: {
        const _a126 = v_S;
        for (let _i127 = 0; _i127 < _a126.length; _i127++) {
          const v_c = _a126[_i127];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g124++;
        }
      }
      let _g128 = 0;
      G129: {
        for (let _i130 = 0; _i130 < 1; _i130++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g128++;
        }
      }
      const v_n = ((cl.stars - _g124) - _g128);
      _g131.length = 0;
      G132: {
        _g141.length = 0;
        G142: {
          const _a145 = v_S;
          for (let _i146 = 0; _i146 < _a145.length; _i146++) {
            const v_c = _a145[_i146];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g141.push(v_c);
          }
        }
        const _a147 = _g141;
        for (let _i148 = 0; _i148 < _a147.length; _i148++) {
          const v_c = _a147[_i148];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g131.push(v_c);
        }
      }
      L149: {
        const v_E = _g131;
        const _h161 = v_E.length;
        const _h173 = (2 * _h161);
        const _h174 = (_h173 - v_n);
        let _c175: boolean = (v_n > 0);
        if (_c175) {
          let _q150 = false;
          Q151: {
            const _a152 = v_E;
            const _t162 = ((2 * _h161) - v_n);
            const _lo163 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi164 = 31 - Math.clz32(b.domain);
            for (const _e156 of crowdedLine_l154) crowdedLine_f153[_e156] = -1;
            crowdedLine_l154 = _a152;
            let _i158 = 0;
            _s155[0] = 0;
            let _o166 = _a152.length === 0;
            for (;;) {
              if (_a152.length === 0) {
                if (!_o166) break;
                _o166 = false;
              }
              while (_a152.length > 0 && _i158 >= 0) {
                const _e156 = _a152[_i158];
                if (_s155[_i158] > 0) crowdedLine_f153[_e156] = -1;
                let _r165 = b.domain & ~((2 << _s155[_i158]) - 1);
                let _d157 = 0;
                V160: for (; _r165 !== 0; _r165 &= _r165 - 1) {
                  _d157 = 31 - Math.clz32(_r165 & -_r165);
                  crowdedLine_f153[_e156] = _d157;
                  {
                    let _t167 = _d157;
                    for (let _j159 = 0; _j159 < _i158; _j159++) _t167 += crowdedLine_f153[_a152[_j159]];
                    if (_t167 + (_a152.length - _i158 - 1) * _lo163 > _t162) continue;
                    if (_t167 + (_a152.length - _i158 - 1) * _hi164 < _t162) continue;
                  }
                  for (let _j159 = 0; _j159 < _i158; _j159++) {
                    const _y168 = _a152[_j159];
                    if (!(!((((crowdedLine_f153[_e156] === 1) && (crowdedLine_f153[_y168] === 1)) && (sp.adj8[_e156].includes(_y168)))))) continue V160;
                  }
                  break;
                }
                if (_r165 === 0) {
                  _s155[_i158] = 0;
                  _i158--;
                  continue;
                }
                _s155[_i158] = _d157;
                if (_i158 === _a152.length - 1) break;
                _i158++;
                _s155[_i158] = 0;
              }
              if (_i158 < 0) break;
              let _g169 = 0;
              G170: {
                const _a171 = v_E;
                for (let _i172 = 0; _i172 < _a171.length; _i172++) {
                  const v_x = _a171[_i172];
                  _g169 += crowdedLine_f153[v_x];
                }
              }
              if (!((_g169 === _h174))) continue;
              if (true) {
                _q150 = true;
                break Q151;
              }
            }
          }
          _c175 = !(_q150);
        }
        if (!(_c175)) break L149;
        let _g176 = -1;
        G177: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h200 = (_h173 - v_j);
            let _q178 = false;
            Q179: {
              const _a180 = v_E;
              const _t189 = (_h173 - v_j);
              const _lo190 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi191 = 31 - Math.clz32(b.domain);
              for (const _e184 of crowdedLine_l182) crowdedLine_f181[_e184] = -1;
              crowdedLine_l182 = _a180;
              let _i186 = 0;
              _s183[0] = 0;
              let _o193 = _a180.length === 0;
              for (;;) {
                if (_a180.length === 0) {
                  if (!_o193) break;
                  _o193 = false;
                }
                while (_a180.length > 0 && _i186 >= 0) {
                  const _e184 = _a180[_i186];
                  if (_s183[_i186] > 0) crowdedLine_f181[_e184] = -1;
                  let _r192 = b.domain & ~((2 << _s183[_i186]) - 1);
                  let _d185 = 0;
                  V188: for (; _r192 !== 0; _r192 &= _r192 - 1) {
                    _d185 = 31 - Math.clz32(_r192 & -_r192);
                    crowdedLine_f181[_e184] = _d185;
                    {
                      let _t194 = _d185;
                      for (let _j187 = 0; _j187 < _i186; _j187++) _t194 += crowdedLine_f181[_a180[_j187]];
                      if (_t194 + (_a180.length - _i186 - 1) * _lo190 > _t189) continue;
                      if (_t194 + (_a180.length - _i186 - 1) * _hi191 < _t189) continue;
                    }
                    for (let _j187 = 0; _j187 < _i186; _j187++) {
                      const _y195 = _a180[_j187];
                      if (!(!((((crowdedLine_f181[_e184] === 1) && (crowdedLine_f181[_y195] === 1)) && (sp.adj8[_e184].includes(_y195)))))) continue V188;
                    }
                    break;
                  }
                  if (_r192 === 0) {
                    _s183[_i186] = 0;
                    _i186--;
                    continue;
                  }
                  _s183[_i186] = _d185;
                  if (_i186 === _a180.length - 1) break;
                  _i186++;
                  _s183[_i186] = 0;
                }
                if (_i186 < 0) break;
                let _g196 = 0;
                G197: {
                  const _a198 = v_E;
                  for (let _i199 = 0; _i199 < _a198.length; _i199++) {
                    const v_x = _a198[_i199];
                    _g196 += crowdedLine_f181[v_x];
                  }
                }
                if (!((_g196 === _h200))) continue;
                if (true) {
                  _q178 = true;
                  break Q179;
                }
              }
            }
            if (!(_q178)) continue;
            _g176 = v_j;
            break G177;
          }
        }
        const v_room = _g176;
        _g201.length = 0;
        G202: {
          _g211.length = 0;
          G212: {
            const _a215 = v_S;
            for (let _i216 = 0; _i216 < _a215.length; _i216++) {
              const v_c = _a215[_i216];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g211.push(v_c);
            }
          }
          const _a217 = _g211;
          for (let _i218 = 0; _i218 < _a217.length; _i218++) {
            const v_c = _a217[_i218];
            if (!((v_R.includes(v_c)))) continue;
            _g201.push(v_c);
          }
        }
        const v_Q = _g201;
        if (b.made[0] !== _m326_0) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          _g219.length = 0;
          G220: {
            const _a223 = sp.adj8[v_x];
            for (let _i224 = 0; _i224 < _a223.length; _i224++) {
              const v_p = _a223[_i224];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g219.push(v_p);
            }
          }
          if (!(sameSet(v_R, _g219))) { continue R1; }
        }
        if (DEV && staleChecking) {
          const _g225: number[] = [];
          G226: {
            const _a229 = sp.adj8[v_x];
            for (let _i230 = 0; _i230 < _a229.length; _i230++) {
              const v_p = _a229[_i230];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g225.push(v_p);
            }
          }
          let _c235: boolean = ((v_L === sp.rowOf[v_x]) || (v_L === sp.colOf[v_x]));
          if (!_c235) {
            let _q231 = false;
            Q232: {
              const _a233 = v_R;
              for (let _i234 = 0; _i234 < _a233.length; _i234++) {
                const v_p = _a233[_i234];
                if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
                  _q231 = true;
                  break Q232;
                }
              }
            }
            _c235 = _q231;
          }
          let _g236 = 0;
          G237: {
            const _a238 = v_S;
            for (let _i239 = 0; _i239 < _a238.length; _i239++) {
              const v_c = _a238[_i239];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g236++;
            }
          }
          let _g240 = 0;
          G241: {
            for (let _i242 = 0; _i242 < 1; _i242++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g240++;
            }
          }
          const _g243: number[] = [];
          G244: {
            const _g253: number[] = [];
            G254: {
              const _a257 = v_S;
              for (let _i258 = 0; _i258 < _a257.length; _i258++) {
                const v_c = _a257[_i258];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g253.push(v_c);
              }
            }
            const _a259 = _g253;
            for (let _i260 = 0; _i260 < _a259.length; _i260++) {
              const v_c = _a259[_i260];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g243.push(v_c);
            }
          }
          let _c283: boolean = (v_n > 0);
          if (_c283) {
            let _q261 = false;
            Q262: {
              const _f264 = new Int32Array(sp.cells.length).fill(-1);
              let _l265: readonly number[] = [];
              const _s266: number[] = [];
              const _a263 = v_E;
              const _t272 = ((2 * v_E.length) - v_n);
              const _lo273 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi274 = 31 - Math.clz32(b.domain);
              for (const _e267 of _l265) _f264[_e267] = -1;
              _l265 = _a263;
              let _i269 = 0;
              _s266[0] = 0;
              let _o276 = _a263.length === 0;
              for (;;) {
                if (_a263.length === 0) {
                  if (!_o276) break;
                  _o276 = false;
                }
                while (_a263.length > 0 && _i269 >= 0) {
                  const _e267 = _a263[_i269];
                  if (_s266[_i269] > 0) _f264[_e267] = -1;
                  let _r275 = b.domain & ~((2 << _s266[_i269]) - 1);
                  let _d268 = 0;
                  V271: for (; _r275 !== 0; _r275 &= _r275 - 1) {
                    _d268 = 31 - Math.clz32(_r275 & -_r275);
                    _f264[_e267] = _d268;
                    {
                      let _t277 = _d268;
                      for (let _j270 = 0; _j270 < _i269; _j270++) _t277 += _f264[_a263[_j270]];
                      if (_t277 + (_a263.length - _i269 - 1) * _lo273 > _t272) continue;
                      if (_t277 + (_a263.length - _i269 - 1) * _hi274 < _t272) continue;
                    }
                    for (let _j270 = 0; _j270 < _i269; _j270++) {
                      const _y278 = _a263[_j270];
                      if (!(!((((_f264[_e267] === 1) && (_f264[_y278] === 1)) && (sp.adj8[_e267].includes(_y278)))))) continue V271;
                    }
                    break;
                  }
                  if (_r275 === 0) {
                    _s266[_i269] = 0;
                    _i269--;
                    continue;
                  }
                  _s266[_i269] = _d268;
                  if (_i269 === _a263.length - 1) break;
                  _i269++;
                  _s266[_i269] = 0;
                }
                if (_i269 < 0) break;
                let _g279 = 0;
                G280: {
                  const _a281 = v_E;
                  for (let _i282 = 0; _i282 < _a281.length; _i282++) {
                    const v_x = _a281[_i282];
                    _g279 += _f264[v_x];
                  }
                }
                if (!((_g279 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q261 = true;
                  break Q262;
                }
              }
            }
            _c283 = !(_q261);
          }
          let _g284 = -1;
          G285: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q286 = false;
              Q287: {
                const _f289 = new Int32Array(sp.cells.length).fill(-1);
                let _l290: readonly number[] = [];
                const _s291: number[] = [];
                const _a288 = v_E;
                const _t297 = ((2 * v_E.length) - v_j);
                const _lo298 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi299 = 31 - Math.clz32(b.domain);
                for (const _e292 of _l290) _f289[_e292] = -1;
                _l290 = _a288;
                let _i294 = 0;
                _s291[0] = 0;
                let _o301 = _a288.length === 0;
                for (;;) {
                  if (_a288.length === 0) {
                    if (!_o301) break;
                    _o301 = false;
                  }
                  while (_a288.length > 0 && _i294 >= 0) {
                    const _e292 = _a288[_i294];
                    if (_s291[_i294] > 0) _f289[_e292] = -1;
                    let _r300 = b.domain & ~((2 << _s291[_i294]) - 1);
                    let _d293 = 0;
                    V296: for (; _r300 !== 0; _r300 &= _r300 - 1) {
                      _d293 = 31 - Math.clz32(_r300 & -_r300);
                      _f289[_e292] = _d293;
                      {
                        let _t302 = _d293;
                        for (let _j295 = 0; _j295 < _i294; _j295++) _t302 += _f289[_a288[_j295]];
                        if (_t302 + (_a288.length - _i294 - 1) * _lo298 > _t297) continue;
                        if (_t302 + (_a288.length - _i294 - 1) * _hi299 < _t297) continue;
                      }
                      for (let _j295 = 0; _j295 < _i294; _j295++) {
                        const _y303 = _a288[_j295];
                        if (!(!((((_f289[_e292] === 1) && (_f289[_y303] === 1)) && (sp.adj8[_e292].includes(_y303)))))) continue V296;
                      }
                      break;
                    }
                    if (_r300 === 0) {
                      _s291[_i294] = 0;
                      _i294--;
                      continue;
                    }
                    _s291[_i294] = _d293;
                    if (_i294 === _a288.length - 1) break;
                    _i294++;
                    _s291[_i294] = 0;
                  }
                  if (_i294 < 0) break;
                  let _g304 = 0;
                  G305: {
                    const _a306 = v_E;
                    for (let _i307 = 0; _i307 < _a306.length; _i307++) {
                      const v_x = _a306[_i307];
                      _g304 += _f289[v_x];
                    }
                  }
                  if (!((_g304 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q286 = true;
                    break Q287;
                  }
                }
              }
              if (!(_q286)) continue;
              _g284 = v_j;
              break G285;
            }
          }
          const _g308: number[] = [];
          G309: {
            const _g318: number[] = [];
            G319: {
              const _a322 = v_S;
              for (let _i323 = 0; _i323 < _a322.length; _i323++) {
                const v_c = _a322[_i323];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g318.push(v_c);
              }
            }
            const _a324 = _g318;
            for (let _i325 = 0; _i325 < _a324.length; _i325++) {
              const v_c = _a324[_i325];
              if (!((v_R.includes(v_c)))) continue;
              _g308.push(v_c);
            }
          }
          freshBinding("crowdedLine", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, _g225), (sp.lines.includes(v_L)), _c235, sameSet(v_S, sp.lineCells[v_L]), (v_n === ((cl.stars - _g236) - _g240)), sameSet(v_E, _g243), _c283, (v_room === _g284), sameSet(v_Q, _g308)], ["x in", "where of x", "R =", "L in", "where of L", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R.slice(), L: v_L, S: v_S.slice(), n: v_n, E: v_E.slice(), room: v_room, Q: v_Q.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CrowdedRegionBinding {
  x: number;
  R: readonly number[];
  g: number;
  S: readonly number[];
  n: number;
  E: readonly number[];
  room: number;
  Q: readonly number[];
}

const crowdedRegionFacts: number[] = [];
let crowdedRegion_f152 = new Int32Array(0);
let crowdedRegion_l153: readonly number[] = [];
let crowdedRegion_f180 = new Int32Array(0);
let crowdedRegion_l181: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function crowdedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedRegionBinding> | null): number {
  const _g109: number[] = [];
  const _g130: number[] = [];
  const _g140: number[] = [];
  if (crowdedRegion_f152.length < sp.cells.length) crowdedRegion_f152 = new Int32Array(sp.cells.length).fill(-1);
  else crowdedRegion_f152.fill(-1);
  crowdedRegion_l153 = [];
  const _s154: number[] = [];
  if (crowdedRegion_f180.length < sp.cells.length) crowdedRegion_f180 = new Int32Array(sp.cells.length).fill(-1);
  else crowdedRegion_f180.fill(-1);
  crowdedRegion_l181 = [];
  const _s182: number[] = [];
  const _g200: number[] = [];
  const _g210: number[] = [];
  const _g218: number[] = [];
  const facts = crowdedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a107 = sp.cells;
  R1:
  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
    const v_x = _a107[_i108];
    const _m325_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h117 = cl.region.of[v_x];
    _g109.length = 0;
    G110: {
      const _a113 = sp.adj8[v_x];
      for (let _i114 = 0; _i114 < _a113.length; _i114++) {
        const v_p = _a113[_i114];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g109.push(v_p);
      }
    }
    const v_R = _g109;
    const _a115 = cl.region.parts;
    for (let _i116 = 0; _i116 < _a115.length; _i116++) {
      const v_g = _a115[_i116];
      let _c122: boolean = (v_g === _h117);
      if (!_c122) {
        let _q118 = false;
        Q119: {
          const _a120 = v_R;
          for (let _i121 = 0; _i121 < _a120.length; _i121++) {
            const v_p = _a120[_i121];
            if ((cl.region.of[v_p] === v_g)) {
              _q118 = true;
              break Q119;
            }
          }
        }
        _c122 = _q118;
      }
      if (!(_c122)) continue;
      const v_S = cl.region.cells[v_g];
      let _g123 = 0;
      G124: {
        const _a125 = v_S;
        for (let _i126 = 0; _i126 < _a125.length; _i126++) {
          const v_c = _a125[_i126];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g123++;
        }
      }
      let _g127 = 0;
      G128: {
        for (let _i129 = 0; _i129 < 1; _i129++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g127++;
        }
      }
      const v_n = ((cl.stars - _g123) - _g127);
      _g130.length = 0;
      G131: {
        _g140.length = 0;
        G141: {
          const _a144 = v_S;
          for (let _i145 = 0; _i145 < _a144.length; _i145++) {
            const v_c = _a144[_i145];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g140.push(v_c);
          }
        }
        const _a146 = _g140;
        for (let _i147 = 0; _i147 < _a146.length; _i147++) {
          const v_c = _a146[_i147];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g130.push(v_c);
        }
      }
      L148: {
        const v_E = _g130;
        const _h160 = v_E.length;
        const _h172 = (2 * _h160);
        const _h173 = (_h172 - v_n);
        let _c174: boolean = (v_n > 0);
        if (_c174) {
          let _q149 = false;
          Q150: {
            const _a151 = v_E;
            const _t161 = ((2 * _h160) - v_n);
            const _lo162 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi163 = 31 - Math.clz32(b.domain);
            for (const _e155 of crowdedRegion_l153) crowdedRegion_f152[_e155] = -1;
            crowdedRegion_l153 = _a151;
            let _i157 = 0;
            _s154[0] = 0;
            let _o165 = _a151.length === 0;
            for (;;) {
              if (_a151.length === 0) {
                if (!_o165) break;
                _o165 = false;
              }
              while (_a151.length > 0 && _i157 >= 0) {
                const _e155 = _a151[_i157];
                if (_s154[_i157] > 0) crowdedRegion_f152[_e155] = -1;
                let _r164 = b.domain & ~((2 << _s154[_i157]) - 1);
                let _d156 = 0;
                V159: for (; _r164 !== 0; _r164 &= _r164 - 1) {
                  _d156 = 31 - Math.clz32(_r164 & -_r164);
                  crowdedRegion_f152[_e155] = _d156;
                  {
                    let _t166 = _d156;
                    for (let _j158 = 0; _j158 < _i157; _j158++) _t166 += crowdedRegion_f152[_a151[_j158]];
                    if (_t166 + (_a151.length - _i157 - 1) * _lo162 > _t161) continue;
                    if (_t166 + (_a151.length - _i157 - 1) * _hi163 < _t161) continue;
                  }
                  for (let _j158 = 0; _j158 < _i157; _j158++) {
                    const _y167 = _a151[_j158];
                    if (!(!((((crowdedRegion_f152[_e155] === 1) && (crowdedRegion_f152[_y167] === 1)) && (sp.adj8[_e155].includes(_y167)))))) continue V159;
                  }
                  break;
                }
                if (_r164 === 0) {
                  _s154[_i157] = 0;
                  _i157--;
                  continue;
                }
                _s154[_i157] = _d156;
                if (_i157 === _a151.length - 1) break;
                _i157++;
                _s154[_i157] = 0;
              }
              if (_i157 < 0) break;
              let _g168 = 0;
              G169: {
                const _a170 = v_E;
                for (let _i171 = 0; _i171 < _a170.length; _i171++) {
                  const v_x = _a170[_i171];
                  _g168 += crowdedRegion_f152[v_x];
                }
              }
              if (!((_g168 === _h173))) continue;
              if (true) {
                _q149 = true;
                break Q150;
              }
            }
          }
          _c174 = !(_q149);
        }
        if (!(_c174)) break L148;
        let _g175 = -1;
        G176: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h199 = (_h172 - v_j);
            let _q177 = false;
            Q178: {
              const _a179 = v_E;
              const _t188 = (_h172 - v_j);
              const _lo189 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi190 = 31 - Math.clz32(b.domain);
              for (const _e183 of crowdedRegion_l181) crowdedRegion_f180[_e183] = -1;
              crowdedRegion_l181 = _a179;
              let _i185 = 0;
              _s182[0] = 0;
              let _o192 = _a179.length === 0;
              for (;;) {
                if (_a179.length === 0) {
                  if (!_o192) break;
                  _o192 = false;
                }
                while (_a179.length > 0 && _i185 >= 0) {
                  const _e183 = _a179[_i185];
                  if (_s182[_i185] > 0) crowdedRegion_f180[_e183] = -1;
                  let _r191 = b.domain & ~((2 << _s182[_i185]) - 1);
                  let _d184 = 0;
                  V187: for (; _r191 !== 0; _r191 &= _r191 - 1) {
                    _d184 = 31 - Math.clz32(_r191 & -_r191);
                    crowdedRegion_f180[_e183] = _d184;
                    {
                      let _t193 = _d184;
                      for (let _j186 = 0; _j186 < _i185; _j186++) _t193 += crowdedRegion_f180[_a179[_j186]];
                      if (_t193 + (_a179.length - _i185 - 1) * _lo189 > _t188) continue;
                      if (_t193 + (_a179.length - _i185 - 1) * _hi190 < _t188) continue;
                    }
                    for (let _j186 = 0; _j186 < _i185; _j186++) {
                      const _y194 = _a179[_j186];
                      if (!(!((((crowdedRegion_f180[_e183] === 1) && (crowdedRegion_f180[_y194] === 1)) && (sp.adj8[_e183].includes(_y194)))))) continue V187;
                    }
                    break;
                  }
                  if (_r191 === 0) {
                    _s182[_i185] = 0;
                    _i185--;
                    continue;
                  }
                  _s182[_i185] = _d184;
                  if (_i185 === _a179.length - 1) break;
                  _i185++;
                  _s182[_i185] = 0;
                }
                if (_i185 < 0) break;
                let _g195 = 0;
                G196: {
                  const _a197 = v_E;
                  for (let _i198 = 0; _i198 < _a197.length; _i198++) {
                    const v_x = _a197[_i198];
                    _g195 += crowdedRegion_f180[v_x];
                  }
                }
                if (!((_g195 === _h199))) continue;
                if (true) {
                  _q177 = true;
                  break Q178;
                }
              }
            }
            if (!(_q177)) continue;
            _g175 = v_j;
            break G176;
          }
        }
        const v_room = _g175;
        _g200.length = 0;
        G201: {
          _g210.length = 0;
          G211: {
            const _a214 = v_S;
            for (let _i215 = 0; _i215 < _a214.length; _i215++) {
              const v_c = _a214[_i215];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g210.push(v_c);
            }
          }
          const _a216 = _g210;
          for (let _i217 = 0; _i217 < _a216.length; _i217++) {
            const v_c = _a216[_i217];
            if (!((v_R.includes(v_c)))) continue;
            _g200.push(v_c);
          }
        }
        const v_Q = _g200;
        if (b.made[0] !== _m325_0) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          _g218.length = 0;
          G219: {
            const _a222 = sp.adj8[v_x];
            for (let _i223 = 0; _i223 < _a222.length; _i223++) {
              const v_p = _a222[_i223];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g218.push(v_p);
            }
          }
          if (!(sameSet(v_R, _g218))) { continue R1; }
        }
        if (DEV && staleChecking) {
          const _g224: number[] = [];
          G225: {
            const _a228 = sp.adj8[v_x];
            for (let _i229 = 0; _i229 < _a228.length; _i229++) {
              const v_p = _a228[_i229];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g224.push(v_p);
            }
          }
          let _c234: boolean = (v_g === cl.region.of[v_x]);
          if (!_c234) {
            let _q230 = false;
            Q231: {
              const _a232 = v_R;
              for (let _i233 = 0; _i233 < _a232.length; _i233++) {
                const v_p = _a232[_i233];
                if ((cl.region.of[v_p] === v_g)) {
                  _q230 = true;
                  break Q231;
                }
              }
            }
            _c234 = _q230;
          }
          let _g235 = 0;
          G236: {
            const _a237 = v_S;
            for (let _i238 = 0; _i238 < _a237.length; _i238++) {
              const v_c = _a237[_i238];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g235++;
            }
          }
          let _g239 = 0;
          G240: {
            for (let _i241 = 0; _i241 < 1; _i241++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g239++;
            }
          }
          const _g242: number[] = [];
          G243: {
            const _g252: number[] = [];
            G253: {
              const _a256 = v_S;
              for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                const v_c = _a256[_i257];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g252.push(v_c);
              }
            }
            const _a258 = _g252;
            for (let _i259 = 0; _i259 < _a258.length; _i259++) {
              const v_c = _a258[_i259];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g242.push(v_c);
            }
          }
          let _c282: boolean = (v_n > 0);
          if (_c282) {
            let _q260 = false;
            Q261: {
              const _f263 = new Int32Array(sp.cells.length).fill(-1);
              let _l264: readonly number[] = [];
              const _s265: number[] = [];
              const _a262 = v_E;
              const _t271 = ((2 * v_E.length) - v_n);
              const _lo272 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi273 = 31 - Math.clz32(b.domain);
              for (const _e266 of _l264) _f263[_e266] = -1;
              _l264 = _a262;
              let _i268 = 0;
              _s265[0] = 0;
              let _o275 = _a262.length === 0;
              for (;;) {
                if (_a262.length === 0) {
                  if (!_o275) break;
                  _o275 = false;
                }
                while (_a262.length > 0 && _i268 >= 0) {
                  const _e266 = _a262[_i268];
                  if (_s265[_i268] > 0) _f263[_e266] = -1;
                  let _r274 = b.domain & ~((2 << _s265[_i268]) - 1);
                  let _d267 = 0;
                  V270: for (; _r274 !== 0; _r274 &= _r274 - 1) {
                    _d267 = 31 - Math.clz32(_r274 & -_r274);
                    _f263[_e266] = _d267;
                    {
                      let _t276 = _d267;
                      for (let _j269 = 0; _j269 < _i268; _j269++) _t276 += _f263[_a262[_j269]];
                      if (_t276 + (_a262.length - _i268 - 1) * _lo272 > _t271) continue;
                      if (_t276 + (_a262.length - _i268 - 1) * _hi273 < _t271) continue;
                    }
                    for (let _j269 = 0; _j269 < _i268; _j269++) {
                      const _y277 = _a262[_j269];
                      if (!(!((((_f263[_e266] === 1) && (_f263[_y277] === 1)) && (sp.adj8[_e266].includes(_y277)))))) continue V270;
                    }
                    break;
                  }
                  if (_r274 === 0) {
                    _s265[_i268] = 0;
                    _i268--;
                    continue;
                  }
                  _s265[_i268] = _d267;
                  if (_i268 === _a262.length - 1) break;
                  _i268++;
                  _s265[_i268] = 0;
                }
                if (_i268 < 0) break;
                let _g278 = 0;
                G279: {
                  const _a280 = v_E;
                  for (let _i281 = 0; _i281 < _a280.length; _i281++) {
                    const v_x = _a280[_i281];
                    _g278 += _f263[v_x];
                  }
                }
                if (!((_g278 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q260 = true;
                  break Q261;
                }
              }
            }
            _c282 = !(_q260);
          }
          let _g283 = -1;
          G284: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q285 = false;
              Q286: {
                const _f288 = new Int32Array(sp.cells.length).fill(-1);
                let _l289: readonly number[] = [];
                const _s290: number[] = [];
                const _a287 = v_E;
                const _t296 = ((2 * v_E.length) - v_j);
                const _lo297 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi298 = 31 - Math.clz32(b.domain);
                for (const _e291 of _l289) _f288[_e291] = -1;
                _l289 = _a287;
                let _i293 = 0;
                _s290[0] = 0;
                let _o300 = _a287.length === 0;
                for (;;) {
                  if (_a287.length === 0) {
                    if (!_o300) break;
                    _o300 = false;
                  }
                  while (_a287.length > 0 && _i293 >= 0) {
                    const _e291 = _a287[_i293];
                    if (_s290[_i293] > 0) _f288[_e291] = -1;
                    let _r299 = b.domain & ~((2 << _s290[_i293]) - 1);
                    let _d292 = 0;
                    V295: for (; _r299 !== 0; _r299 &= _r299 - 1) {
                      _d292 = 31 - Math.clz32(_r299 & -_r299);
                      _f288[_e291] = _d292;
                      {
                        let _t301 = _d292;
                        for (let _j294 = 0; _j294 < _i293; _j294++) _t301 += _f288[_a287[_j294]];
                        if (_t301 + (_a287.length - _i293 - 1) * _lo297 > _t296) continue;
                        if (_t301 + (_a287.length - _i293 - 1) * _hi298 < _t296) continue;
                      }
                      for (let _j294 = 0; _j294 < _i293; _j294++) {
                        const _y302 = _a287[_j294];
                        if (!(!((((_f288[_e291] === 1) && (_f288[_y302] === 1)) && (sp.adj8[_e291].includes(_y302)))))) continue V295;
                      }
                      break;
                    }
                    if (_r299 === 0) {
                      _s290[_i293] = 0;
                      _i293--;
                      continue;
                    }
                    _s290[_i293] = _d292;
                    if (_i293 === _a287.length - 1) break;
                    _i293++;
                    _s290[_i293] = 0;
                  }
                  if (_i293 < 0) break;
                  let _g303 = 0;
                  G304: {
                    const _a305 = v_E;
                    for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                      const v_x = _a305[_i306];
                      _g303 += _f288[v_x];
                    }
                  }
                  if (!((_g303 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q285 = true;
                    break Q286;
                  }
                }
              }
              if (!(_q285)) continue;
              _g283 = v_j;
              break G284;
            }
          }
          const _g307: number[] = [];
          G308: {
            const _g317: number[] = [];
            G318: {
              const _a321 = v_S;
              for (let _i322 = 0; _i322 < _a321.length; _i322++) {
                const v_c = _a321[_i322];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g317.push(v_c);
              }
            }
            const _a323 = _g317;
            for (let _i324 = 0; _i324 < _a323.length; _i324++) {
              const v_c = _a323[_i324];
              if (!((v_R.includes(v_c)))) continue;
              _g307.push(v_c);
            }
          }
          freshBinding("crowdedRegion", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, _g224), (cl.region.parts.includes(v_g)), _c234, sameSet(v_S, cl.region.cells[v_g]), (v_n === ((cl.stars - _g235) - _g239)), sameSet(v_E, _g242), _c282, (v_room === _g283), sameSet(v_Q, _g307)], ["x in", "where of x", "R =", "g in", "where of g", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R.slice(), g: v_g, S: v_S.slice(), n: v_n, E: v_E.slice(), room: v_room, Q: v_Q.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface BandedBinding {
  k: number;
  dir: number;
  a: number;
  B: readonly number[];
  n: number;
  I: readonly number[];
  mi: number;
  R: readonly number[];
  mr: number;
  lines: boolean;
}

const bandedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function banded(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BandedBinding> | null): number {
  const _g155: number[] = [];
  const _g200: number[] = [];
  const _g218: number[] = [];
  const _g263: number[] = [];
  const _g283: number[] = [];
  const _g436: number[] = [];
  const _g451: number[] = [];
  const facts = bandedFacts;
  let fired = 0;
  let changed = false;
  const _t146 = (sp.w - 2);
  for (let v_k = 2; v_k <= _t146; v_k++) {
    const _h147 = (sp.w - v_k);
    const _h152 = (v_k - 1);
    const _h153 = (_h152 * cl.stars);
    for (let v_dir = 0; v_dir <= 1; v_dir++) {
      for (let v_a = 0; v_a <= _h147; v_a++) {
        const v_B = band(sp, v_k, v_dir, v_a);
        let _g148 = 0;
        G149: {
          const _a150 = v_B;
          for (let _i151 = 0; _i151 < _a150.length; _i151++) {
            const v_c = _a150[_i151];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g148++;
          }
        }
        L154: {
          const v_n = ((cl.stars - _g148) + _h153);
          if (!((v_n > 0))) break L154;
          _g155.length = 0;
          G156: {
            const _a183 = cl.region.parts;
            for (let _i184 = 0; _i184 < _a183.length; _i184++) {
              const v_r = _a183[_i184];
              const _t185 = cl.region.cells[v_r];
              let _g186 = 0;
              G187: {
                const _a188 = _t185;
                for (let _i189 = 0; _i189 < _a188.length; _i189++) {
                  const v_c = _a188[_i189];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g186++;
                }
              }
              let _c208: boolean = ((cl.stars - _g186) > 0);
              if (_c208) {
                let _q197 = true;
                Q198: {
                  const _t199 = cl.region.cells[v_r];
                  _g200.length = 0;
                  G201: {
                    const _a204 = _t199;
                    for (let _i205 = 0; _i205 < _a204.length; _i205++) {
                      const v_c = _a204[_i205];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g200.push(v_c);
                    }
                  }
                  const _a206 = _g200;
                  for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                    const v_c = _a206[_i207];
                    if (!((v_B.includes(v_c)))) {
                      _q197 = false;
                      break Q198;
                    }
                  }
                }
                _c208 = _q197;
              }
              if (!(_c208)) continue;
              _g155.push(v_r);
            }
          }
          const v_I = _g155;
          let _g209 = 0;
          G210: {
            const _a211 = v_I;
            for (let _i212 = 0; _i212 < _a211.length; _i212++) {
              const v_r = _a211[_i212];
              const _t213 = cl.region.cells[v_r];
              let _g214 = 0;
              G215: {
                const _a216 = _t213;
                for (let _i217 = 0; _i217 < _a216.length; _i217++) {
                  const v_c = _a216[_i217];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g214++;
                }
              }
              _g209 += (cl.stars - _g214);
            }
          }
          const v_mi = _g209;
          _g218.length = 0;
          G219: {
            const _a246 = cl.region.parts;
            for (let _i247 = 0; _i247 < _a246.length; _i247++) {
              const v_r = _a246[_i247];
              const _t248 = cl.region.cells[v_r];
              let _g249 = 0;
              G250: {
                const _a251 = _t248;
                for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                  const v_c = _a251[_i252];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g249++;
                }
              }
              let _c271: boolean = ((cl.stars - _g249) > 0);
              if (_c271) {
                let _q260 = false;
                Q261: {
                  const _t262 = cl.region.cells[v_r];
                  _g263.length = 0;
                  G264: {
                    const _a267 = _t262;
                    for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                      const v_c = _a267[_i268];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g263.push(v_c);
                    }
                  }
                  const _a269 = _g263;
                  for (let _i270 = 0; _i270 < _a269.length; _i270++) {
                    const v_c = _a269[_i270];
                    if ((v_B.includes(v_c))) {
                      _q260 = true;
                      break Q261;
                    }
                  }
                }
                _c271 = _q260;
              }
              if (!(_c271)) continue;
              _g218.push(v_r);
            }
          }
          const v_R = _g218;
          let _g272 = 0;
          G273: {
            const _a274 = v_R;
            for (let _i275 = 0; _i275 < _a274.length; _i275++) {
              const v_r = _a274[_i275];
              const _t276 = cl.region.cells[v_r];
              let _g277 = 0;
              G278: {
                const _a279 = _t276;
                for (let _i280 = 0; _i280 < _a279.length; _i280++) {
                  const v_c = _a279[_i280];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g277++;
                }
              }
              _g272 += (cl.stars - _g277);
            }
          }
          const v_mr = _g272;
          let _c291: boolean = (v_mi === v_n);
          if (_c291) {
            let _q281 = false;
            Q282: {
              _g283.length = 0;
              G284: {
                const _a287 = v_B;
                for (let _i288 = 0; _i288 < _a287.length; _i288++) {
                  const v_c = _a287[_i288];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g283.push(v_c);
                }
              }
              const _a289 = _g283;
              for (let _i290 = 0; _i290 < _a289.length; _i290++) {
                const v_c = _a289[_i290];
                if (!(v_I.includes(cl.region.of[v_c]))) {
                  _q281 = true;
                  break Q282;
                }
              }
            }
            _c291 = _q281;
          }
          L292: {
            const v_lines = _c291;
            if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L292;
            if (DEV && staleChecking) {
              let _g293 = 0;
              G294: {
                const _a295 = v_B;
                for (let _i296 = 0; _i296 < _a295.length; _i296++) {
                  const v_c = _a295[_i296];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g293++;
                }
              }
              const _g297: number[] = [];
              G298: {
                const _a325 = cl.region.parts;
                for (let _i326 = 0; _i326 < _a325.length; _i326++) {
                  const v_r = _a325[_i326];
                  const _t327 = cl.region.cells[v_r];
                  let _g328 = 0;
                  G329: {
                    const _a330 = _t327;
                    for (let _i331 = 0; _i331 < _a330.length; _i331++) {
                      const v_c = _a330[_i331];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g328++;
                    }
                  }
                  let _c350: boolean = ((cl.stars - _g328) > 0);
                  if (_c350) {
                    let _q339 = true;
                    Q340: {
                      const _t341 = cl.region.cells[v_r];
                      const _g342: number[] = [];
                      G343: {
                        const _a346 = _t341;
                        for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                          const v_c = _a346[_i347];
                          if (!(!((b.grid[v_c] !== 0)))) continue;
                          _g342.push(v_c);
                        }
                      }
                      const _a348 = _g342;
                      for (let _i349 = 0; _i349 < _a348.length; _i349++) {
                        const v_c = _a348[_i349];
                        if (!((v_B.includes(v_c)))) {
                          _q339 = false;
                          break Q340;
                        }
                      }
                    }
                    _c350 = _q339;
                  }
                  if (!(_c350)) continue;
                  _g297.push(v_r);
                }
              }
              let _g351 = 0;
              G352: {
                const _a353 = v_I;
                for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                  const v_r = _a353[_i354];
                  const _t355 = cl.region.cells[v_r];
                  let _g356 = 0;
                  G357: {
                    const _a358 = _t355;
                    for (let _i359 = 0; _i359 < _a358.length; _i359++) {
                      const v_c = _a358[_i359];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g356++;
                    }
                  }
                  _g351 += (cl.stars - _g356);
                }
              }
              const _g360: number[] = [];
              G361: {
                const _a388 = cl.region.parts;
                for (let _i389 = 0; _i389 < _a388.length; _i389++) {
                  const v_r = _a388[_i389];
                  const _t390 = cl.region.cells[v_r];
                  let _g391 = 0;
                  G392: {
                    const _a393 = _t390;
                    for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                      const v_c = _a393[_i394];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g391++;
                    }
                  }
                  let _c413: boolean = ((cl.stars - _g391) > 0);
                  if (_c413) {
                    let _q402 = false;
                    Q403: {
                      const _t404 = cl.region.cells[v_r];
                      const _g405: number[] = [];
                      G406: {
                        const _a409 = _t404;
                        for (let _i410 = 0; _i410 < _a409.length; _i410++) {
                          const v_c = _a409[_i410];
                          if (!(!((b.grid[v_c] !== 0)))) continue;
                          _g405.push(v_c);
                        }
                      }
                      const _a411 = _g405;
                      for (let _i412 = 0; _i412 < _a411.length; _i412++) {
                        const v_c = _a411[_i412];
                        if ((v_B.includes(v_c))) {
                          _q402 = true;
                          break Q403;
                        }
                      }
                    }
                    _c413 = _q402;
                  }
                  if (!(_c413)) continue;
                  _g360.push(v_r);
                }
              }
              let _g414 = 0;
              G415: {
                const _a416 = v_R;
                for (let _i417 = 0; _i417 < _a416.length; _i417++) {
                  const v_r = _a416[_i417];
                  const _t418 = cl.region.cells[v_r];
                  let _g419 = 0;
                  G420: {
                    const _a421 = _t418;
                    for (let _i422 = 0; _i422 < _a421.length; _i422++) {
                      const v_c = _a421[_i422];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g419++;
                    }
                  }
                  _g414 += (cl.stars - _g419);
                }
              }
              let _c433: boolean = (v_mi === v_n);
              if (_c433) {
                let _q423 = false;
                Q424: {
                  const _g425: number[] = [];
                  G426: {
                    const _a429 = v_B;
                    for (let _i430 = 0; _i430 < _a429.length; _i430++) {
                      const v_c = _a429[_i430];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g425.push(v_c);
                    }
                  }
                  const _a431 = _g425;
                  for (let _i432 = 0; _i432 < _a431.length; _i432++) {
                    const v_c = _a431[_i432];
                    if (!(v_I.includes(cl.region.of[v_c]))) {
                      _q423 = true;
                      break Q424;
                    }
                  }
                }
                _c433 = _q423;
              }
              freshBinding("banded", [((2 <= v_k) && (v_k <= (sp.w - 2))), ((0 <= v_dir) && (v_dir <= 1)), ((0 <= v_a) && (v_a <= (sp.w - v_k))), sameSet(v_B, band(sp, v_k, v_dir, v_a)), (v_n === ((cl.stars - _g293) + ((v_k - 1) * cl.stars))), (v_n > 0), sameSet(v_I, _g297), (v_mi === _g351), sameSet(v_R, _g360), (v_mr === _g414), (v_lines === _c433), ((v_mi >= v_n) || (v_mr <= v_n))], ["k in", "dir in", "a in", "B =", "n =", "where of n", "I =", "mi =", "R =", "mr =", "lines =", "where of lines"]);
            }
            facts.length = 0;
            changed = false;
            let _c445: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
            if (_c445) {
              let _c444: boolean = !(v_lines);
              if (!_c444) {
                let _q434 = true;
                Q435: {
                  _g436.length = 0;
                  G437: {
                    const _a440 = v_B;
                    for (let _i441 = 0; _i441 < _a440.length; _i441++) {
                      const v_c = _a440[_i441];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g436.push(v_c);
                    }
                  }
                  const _a442 = _g436;
                  for (let _i443 = 0; _i443 < _a442.length; _i443++) {
                    const v_c = _a442[_i443];
                    if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q434 = false;
                      break Q435;
                    }
                  }
                }
                _c444 = _q434;
              }
              _c445 = _c444;
            }
            let _c460: boolean = _c445;
            if (_c460) {
              let _c459: boolean = (v_lines || (v_mr > v_n));
              if (!_c459) {
                let _q446 = true;
                Q447: {
                  const _a448 = v_R;
                  for (let _i449 = 0; _i449 < _a448.length; _i449++) {
                    const v_r = _a448[_i449];
                    const _t450 = cl.region.cells[v_r];
                    _g451.length = 0;
                    G452: {
                      const _a455 = _t450;
                      for (let _i456 = 0; _i456 < _a455.length; _i456++) {
                        const v_c = _a455[_i456];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g451.push(v_c);
                      }
                    }
                    const _a457 = _g451;
                    for (let _i458 = 0; _i458 < _a457.length; _i458++) {
                      const v_c = _a457[_i458];
                      if (!(!(v_B.includes(v_c)))) continue;
                      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                      if (!(true)) {
                        _q446 = false;
                        break Q447;
                      }
                    }
                  }
                }
                _c459 = _q446;
              }
              _c460 = _c459;
            }
            if (!(_c460)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ k: v_k, dir: v_dir, a: v_a, B: v_B.slice(), n: v_n, I: v_I.slice(), mi: v_mi, R: v_R.slice(), mr: v_mr, lines: v_lines }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface StarvedLineBinding {
  x: number;
  R: readonly number[];
  L: number;
  S: readonly number[];
  n: number;
  E: readonly number[];
  room: number;
  Q: readonly number[];
}

const starvedLineFacts: number[] = [];
let starvedLine_f141 = new Int32Array(0);
let starvedLine_l142: readonly number[] = [];
let starvedLine_f169 = new Int32Array(0);
let starvedLine_l170: readonly number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function starvedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedLineBinding> | null): number {
  const _g119: number[] = [];
  const _g129: number[] = [];
  if (starvedLine_f141.length < sp.cells.length) starvedLine_f141 = new Int32Array(sp.cells.length).fill(-1);
  else starvedLine_f141.fill(-1);
  starvedLine_l142 = [];
  const _s143: number[] = [];
  if (starvedLine_f169.length < sp.cells.length) starvedLine_f169 = new Int32Array(sp.cells.length).fill(-1);
  else starvedLine_f169.fill(-1);
  starvedLine_l170 = [];
  const _s171: number[] = [];
  const _g189: number[] = [];
  const _g199: number[] = [];
  const facts = starvedLineFacts;
  let fired = 0;
  let changed = false;
  const _a101 = sp.cells;
  R1:
  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
    const v_x = _a101[_i102];
    const _m302_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h105 = sp.rowOf[v_x];
    const _h106 = sp.colOf[v_x];
    const _m303_1 = b.made[1];
    const v_R = ruled(b, sp, cl, v_x);
    const _a103 = sp.lines;
    for (let _i104 = 0; _i104 < _a103.length; _i104++) {
      const v_L = _a103[_i104];
      let _c111: boolean = ((v_L === _h105) || (v_L === _h106));
      if (!_c111) {
        let _q107 = false;
        Q108: {
          const _a109 = v_R;
          for (let _i110 = 0; _i110 < _a109.length; _i110++) {
            const v_p = _a109[_i110];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q107 = true;
              break Q108;
            }
          }
        }
        _c111 = _q107;
      }
      if (!(_c111)) continue;
      const v_S = sp.lineCells[v_L];
      let _g112 = 0;
      G113: {
        const _a114 = v_S;
        for (let _i115 = 0; _i115 < _a114.length; _i115++) {
          const v_c = _a114[_i115];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g112++;
        }
      }
      let _g116 = 0;
      G117: {
        for (let _i118 = 0; _i118 < 1; _i118++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g116++;
        }
      }
      const v_n = ((cl.stars - _g112) - _g116);
      _g119.length = 0;
      G120: {
        _g129.length = 0;
        G130: {
          const _a133 = v_S;
          for (let _i134 = 0; _i134 < _a133.length; _i134++) {
            const v_c = _a133[_i134];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g129.push(v_c);
          }
        }
        const _a135 = _g129;
        for (let _i136 = 0; _i136 < _a135.length; _i136++) {
          const v_c = _a135[_i136];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g119.push(v_c);
        }
      }
      L137: {
        const v_E = _g119;
        const _h149 = v_E.length;
        const _h161 = (2 * _h149);
        const _h162 = (_h161 - v_n);
        let _c163: boolean = (v_n > 0);
        if (_c163) {
          let _q138 = false;
          Q139: {
            const _a140 = v_E;
            const _t150 = ((2 * _h149) - v_n);
            const _lo151 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi152 = 31 - Math.clz32(b.domain);
            for (const _e144 of starvedLine_l142) starvedLine_f141[_e144] = -1;
            starvedLine_l142 = _a140;
            let _i146 = 0;
            _s143[0] = 0;
            let _o154 = _a140.length === 0;
            for (;;) {
              if (_a140.length === 0) {
                if (!_o154) break;
                _o154 = false;
              }
              while (_a140.length > 0 && _i146 >= 0) {
                const _e144 = _a140[_i146];
                if (_s143[_i146] > 0) starvedLine_f141[_e144] = -1;
                let _r153 = b.domain & ~((2 << _s143[_i146]) - 1);
                let _d145 = 0;
                V148: for (; _r153 !== 0; _r153 &= _r153 - 1) {
                  _d145 = 31 - Math.clz32(_r153 & -_r153);
                  starvedLine_f141[_e144] = _d145;
                  {
                    let _t155 = _d145;
                    for (let _j147 = 0; _j147 < _i146; _j147++) _t155 += starvedLine_f141[_a140[_j147]];
                    if (_t155 + (_a140.length - _i146 - 1) * _lo151 > _t150) continue;
                    if (_t155 + (_a140.length - _i146 - 1) * _hi152 < _t150) continue;
                  }
                  for (let _j147 = 0; _j147 < _i146; _j147++) {
                    const _y156 = _a140[_j147];
                    if (!(!((((starvedLine_f141[_e144] === 1) && (starvedLine_f141[_y156] === 1)) && (sp.adj8[_e144].includes(_y156)))))) continue V148;
                  }
                  break;
                }
                if (_r153 === 0) {
                  _s143[_i146] = 0;
                  _i146--;
                  continue;
                }
                _s143[_i146] = _d145;
                if (_i146 === _a140.length - 1) break;
                _i146++;
                _s143[_i146] = 0;
              }
              if (_i146 < 0) break;
              let _g157 = 0;
              G158: {
                const _a159 = v_E;
                for (let _i160 = 0; _i160 < _a159.length; _i160++) {
                  const v_x = _a159[_i160];
                  _g157 += starvedLine_f141[v_x];
                }
              }
              if (!((_g157 === _h162))) continue;
              if (true) {
                _q138 = true;
                break Q139;
              }
            }
          }
          _c163 = !(_q138);
        }
        if (!(_c163)) break L137;
        let _g164 = -1;
        G165: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h188 = (_h161 - v_j);
            let _q166 = false;
            Q167: {
              const _a168 = v_E;
              const _t177 = (_h161 - v_j);
              const _lo178 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi179 = 31 - Math.clz32(b.domain);
              for (const _e172 of starvedLine_l170) starvedLine_f169[_e172] = -1;
              starvedLine_l170 = _a168;
              let _i174 = 0;
              _s171[0] = 0;
              let _o181 = _a168.length === 0;
              for (;;) {
                if (_a168.length === 0) {
                  if (!_o181) break;
                  _o181 = false;
                }
                while (_a168.length > 0 && _i174 >= 0) {
                  const _e172 = _a168[_i174];
                  if (_s171[_i174] > 0) starvedLine_f169[_e172] = -1;
                  let _r180 = b.domain & ~((2 << _s171[_i174]) - 1);
                  let _d173 = 0;
                  V176: for (; _r180 !== 0; _r180 &= _r180 - 1) {
                    _d173 = 31 - Math.clz32(_r180 & -_r180);
                    starvedLine_f169[_e172] = _d173;
                    {
                      let _t182 = _d173;
                      for (let _j175 = 0; _j175 < _i174; _j175++) _t182 += starvedLine_f169[_a168[_j175]];
                      if (_t182 + (_a168.length - _i174 - 1) * _lo178 > _t177) continue;
                      if (_t182 + (_a168.length - _i174 - 1) * _hi179 < _t177) continue;
                    }
                    for (let _j175 = 0; _j175 < _i174; _j175++) {
                      const _y183 = _a168[_j175];
                      if (!(!((((starvedLine_f169[_e172] === 1) && (starvedLine_f169[_y183] === 1)) && (sp.adj8[_e172].includes(_y183)))))) continue V176;
                    }
                    break;
                  }
                  if (_r180 === 0) {
                    _s171[_i174] = 0;
                    _i174--;
                    continue;
                  }
                  _s171[_i174] = _d173;
                  if (_i174 === _a168.length - 1) break;
                  _i174++;
                  _s171[_i174] = 0;
                }
                if (_i174 < 0) break;
                let _g184 = 0;
                G185: {
                  const _a186 = v_E;
                  for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                    const v_x = _a186[_i187];
                    _g184 += starvedLine_f169[v_x];
                  }
                }
                if (!((_g184 === _h188))) continue;
                if (true) {
                  _q166 = true;
                  break Q167;
                }
              }
            }
            if (!(_q166)) continue;
            _g164 = v_j;
            break G165;
          }
        }
        const v_room = _g164;
        _g189.length = 0;
        G190: {
          _g199.length = 0;
          G200: {
            const _a203 = v_S;
            for (let _i204 = 0; _i204 < _a203.length; _i204++) {
              const v_c = _a203[_i204];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g199.push(v_c);
            }
          }
          const _a205 = _g199;
          for (let _i206 = 0; _i206 < _a205.length; _i206++) {
            const v_c = _a205[_i206];
            if (!((v_R.includes(v_c)))) continue;
            _g189.push(v_c);
          }
        }
        const v_Q = _g189;
        if (b.made[0] !== _m302_0 || b.made[1] !== _m303_1) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          if (!(sameSet(v_R, ruled(b, sp, cl, v_x)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _c211: boolean = ((v_L === sp.rowOf[v_x]) || (v_L === sp.colOf[v_x]));
          if (!_c211) {
            let _q207 = false;
            Q208: {
              const _a209 = v_R;
              for (let _i210 = 0; _i210 < _a209.length; _i210++) {
                const v_p = _a209[_i210];
                if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
                  _q207 = true;
                  break Q208;
                }
              }
            }
            _c211 = _q207;
          }
          let _g212 = 0;
          G213: {
            const _a214 = v_S;
            for (let _i215 = 0; _i215 < _a214.length; _i215++) {
              const v_c = _a214[_i215];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g212++;
            }
          }
          let _g216 = 0;
          G217: {
            for (let _i218 = 0; _i218 < 1; _i218++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g216++;
            }
          }
          const _g219: number[] = [];
          G220: {
            const _g229: number[] = [];
            G230: {
              const _a233 = v_S;
              for (let _i234 = 0; _i234 < _a233.length; _i234++) {
                const v_c = _a233[_i234];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g229.push(v_c);
              }
            }
            const _a235 = _g229;
            for (let _i236 = 0; _i236 < _a235.length; _i236++) {
              const v_c = _a235[_i236];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g219.push(v_c);
            }
          }
          let _c259: boolean = (v_n > 0);
          if (_c259) {
            let _q237 = false;
            Q238: {
              const _f240 = new Int32Array(sp.cells.length).fill(-1);
              let _l241: readonly number[] = [];
              const _s242: number[] = [];
              const _a239 = v_E;
              const _t248 = ((2 * v_E.length) - v_n);
              const _lo249 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi250 = 31 - Math.clz32(b.domain);
              for (const _e243 of _l241) _f240[_e243] = -1;
              _l241 = _a239;
              let _i245 = 0;
              _s242[0] = 0;
              let _o252 = _a239.length === 0;
              for (;;) {
                if (_a239.length === 0) {
                  if (!_o252) break;
                  _o252 = false;
                }
                while (_a239.length > 0 && _i245 >= 0) {
                  const _e243 = _a239[_i245];
                  if (_s242[_i245] > 0) _f240[_e243] = -1;
                  let _r251 = b.domain & ~((2 << _s242[_i245]) - 1);
                  let _d244 = 0;
                  V247: for (; _r251 !== 0; _r251 &= _r251 - 1) {
                    _d244 = 31 - Math.clz32(_r251 & -_r251);
                    _f240[_e243] = _d244;
                    {
                      let _t253 = _d244;
                      for (let _j246 = 0; _j246 < _i245; _j246++) _t253 += _f240[_a239[_j246]];
                      if (_t253 + (_a239.length - _i245 - 1) * _lo249 > _t248) continue;
                      if (_t253 + (_a239.length - _i245 - 1) * _hi250 < _t248) continue;
                    }
                    for (let _j246 = 0; _j246 < _i245; _j246++) {
                      const _y254 = _a239[_j246];
                      if (!(!((((_f240[_e243] === 1) && (_f240[_y254] === 1)) && (sp.adj8[_e243].includes(_y254)))))) continue V247;
                    }
                    break;
                  }
                  if (_r251 === 0) {
                    _s242[_i245] = 0;
                    _i245--;
                    continue;
                  }
                  _s242[_i245] = _d244;
                  if (_i245 === _a239.length - 1) break;
                  _i245++;
                  _s242[_i245] = 0;
                }
                if (_i245 < 0) break;
                let _g255 = 0;
                G256: {
                  const _a257 = v_E;
                  for (let _i258 = 0; _i258 < _a257.length; _i258++) {
                    const v_x = _a257[_i258];
                    _g255 += _f240[v_x];
                  }
                }
                if (!((_g255 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q237 = true;
                  break Q238;
                }
              }
            }
            _c259 = !(_q237);
          }
          let _g260 = -1;
          G261: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q262 = false;
              Q263: {
                const _f265 = new Int32Array(sp.cells.length).fill(-1);
                let _l266: readonly number[] = [];
                const _s267: number[] = [];
                const _a264 = v_E;
                const _t273 = ((2 * v_E.length) - v_j);
                const _lo274 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi275 = 31 - Math.clz32(b.domain);
                for (const _e268 of _l266) _f265[_e268] = -1;
                _l266 = _a264;
                let _i270 = 0;
                _s267[0] = 0;
                let _o277 = _a264.length === 0;
                for (;;) {
                  if (_a264.length === 0) {
                    if (!_o277) break;
                    _o277 = false;
                  }
                  while (_a264.length > 0 && _i270 >= 0) {
                    const _e268 = _a264[_i270];
                    if (_s267[_i270] > 0) _f265[_e268] = -1;
                    let _r276 = b.domain & ~((2 << _s267[_i270]) - 1);
                    let _d269 = 0;
                    V272: for (; _r276 !== 0; _r276 &= _r276 - 1) {
                      _d269 = 31 - Math.clz32(_r276 & -_r276);
                      _f265[_e268] = _d269;
                      {
                        let _t278 = _d269;
                        for (let _j271 = 0; _j271 < _i270; _j271++) _t278 += _f265[_a264[_j271]];
                        if (_t278 + (_a264.length - _i270 - 1) * _lo274 > _t273) continue;
                        if (_t278 + (_a264.length - _i270 - 1) * _hi275 < _t273) continue;
                      }
                      for (let _j271 = 0; _j271 < _i270; _j271++) {
                        const _y279 = _a264[_j271];
                        if (!(!((((_f265[_e268] === 1) && (_f265[_y279] === 1)) && (sp.adj8[_e268].includes(_y279)))))) continue V272;
                      }
                      break;
                    }
                    if (_r276 === 0) {
                      _s267[_i270] = 0;
                      _i270--;
                      continue;
                    }
                    _s267[_i270] = _d269;
                    if (_i270 === _a264.length - 1) break;
                    _i270++;
                    _s267[_i270] = 0;
                  }
                  if (_i270 < 0) break;
                  let _g280 = 0;
                  G281: {
                    const _a282 = v_E;
                    for (let _i283 = 0; _i283 < _a282.length; _i283++) {
                      const v_x = _a282[_i283];
                      _g280 += _f265[v_x];
                    }
                  }
                  if (!((_g280 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q262 = true;
                    break Q263;
                  }
                }
              }
              if (!(_q262)) continue;
              _g260 = v_j;
              break G261;
            }
          }
          const _g284: number[] = [];
          G285: {
            const _g294: number[] = [];
            G295: {
              const _a298 = v_S;
              for (let _i299 = 0; _i299 < _a298.length; _i299++) {
                const v_c = _a298[_i299];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g294.push(v_c);
              }
            }
            const _a300 = _g294;
            for (let _i301 = 0; _i301 < _a300.length; _i301++) {
              const v_c = _a300[_i301];
              if (!((v_R.includes(v_c)))) continue;
              _g284.push(v_c);
            }
          }
          freshBinding("starvedLine", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, ruled(b, sp, cl, v_x)), (sp.lines.includes(v_L)), _c211, sameSet(v_S, sp.lineCells[v_L]), (v_n === ((cl.stars - _g212) - _g216)), sameSet(v_E, _g219), _c259, (v_room === _g260), sameSet(v_Q, _g284)], ["x in", "where of x", "R =", "L in", "where of L", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R.slice(), L: v_L, S: v_S.slice(), n: v_n, E: v_E.slice(), room: v_room, Q: v_Q.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface StarvedRegionBinding {
  x: number;
  R: readonly number[];
  g: number;
  S: readonly number[];
  n: number;
  E: readonly number[];
  room: number;
  Q: readonly number[];
}

const starvedRegionFacts: number[] = [];
let starvedRegion_f140 = new Int32Array(0);
let starvedRegion_l141: readonly number[] = [];
let starvedRegion_f168 = new Int32Array(0);
let starvedRegion_l169: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function starvedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedRegionBinding> | null): number {
  const _g118: number[] = [];
  const _g128: number[] = [];
  if (starvedRegion_f140.length < sp.cells.length) starvedRegion_f140 = new Int32Array(sp.cells.length).fill(-1);
  else starvedRegion_f140.fill(-1);
  starvedRegion_l141 = [];
  const _s142: number[] = [];
  if (starvedRegion_f168.length < sp.cells.length) starvedRegion_f168 = new Int32Array(sp.cells.length).fill(-1);
  else starvedRegion_f168.fill(-1);
  starvedRegion_l169 = [];
  const _s170: number[] = [];
  const _g188: number[] = [];
  const _g198: number[] = [];
  const facts = starvedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a101 = sp.cells;
  R1:
  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
    const v_x = _a101[_i102];
    const _m301_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h105 = cl.region.of[v_x];
    const _m302_1 = b.made[1];
    const v_R = ruled(b, sp, cl, v_x);
    const _a103 = cl.region.parts;
    for (let _i104 = 0; _i104 < _a103.length; _i104++) {
      const v_g = _a103[_i104];
      let _c110: boolean = (v_g === _h105);
      if (!_c110) {
        let _q106 = false;
        Q107: {
          const _a108 = v_R;
          for (let _i109 = 0; _i109 < _a108.length; _i109++) {
            const v_p = _a108[_i109];
            if ((cl.region.of[v_p] === v_g)) {
              _q106 = true;
              break Q107;
            }
          }
        }
        _c110 = _q106;
      }
      if (!(_c110)) continue;
      const v_S = cl.region.cells[v_g];
      let _g111 = 0;
      G112: {
        const _a113 = v_S;
        for (let _i114 = 0; _i114 < _a113.length; _i114++) {
          const v_c = _a113[_i114];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g111++;
        }
      }
      let _g115 = 0;
      G116: {
        for (let _i117 = 0; _i117 < 1; _i117++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g115++;
        }
      }
      const v_n = ((cl.stars - _g111) - _g115);
      _g118.length = 0;
      G119: {
        _g128.length = 0;
        G129: {
          const _a132 = v_S;
          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
            const v_c = _a132[_i133];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g128.push(v_c);
          }
        }
        const _a134 = _g128;
        for (let _i135 = 0; _i135 < _a134.length; _i135++) {
          const v_c = _a134[_i135];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g118.push(v_c);
        }
      }
      L136: {
        const v_E = _g118;
        const _h148 = v_E.length;
        const _h160 = (2 * _h148);
        const _h161 = (_h160 - v_n);
        let _c162: boolean = (v_n > 0);
        if (_c162) {
          let _q137 = false;
          Q138: {
            const _a139 = v_E;
            const _t149 = ((2 * _h148) - v_n);
            const _lo150 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi151 = 31 - Math.clz32(b.domain);
            for (const _e143 of starvedRegion_l141) starvedRegion_f140[_e143] = -1;
            starvedRegion_l141 = _a139;
            let _i145 = 0;
            _s142[0] = 0;
            let _o153 = _a139.length === 0;
            for (;;) {
              if (_a139.length === 0) {
                if (!_o153) break;
                _o153 = false;
              }
              while (_a139.length > 0 && _i145 >= 0) {
                const _e143 = _a139[_i145];
                if (_s142[_i145] > 0) starvedRegion_f140[_e143] = -1;
                let _r152 = b.domain & ~((2 << _s142[_i145]) - 1);
                let _d144 = 0;
                V147: for (; _r152 !== 0; _r152 &= _r152 - 1) {
                  _d144 = 31 - Math.clz32(_r152 & -_r152);
                  starvedRegion_f140[_e143] = _d144;
                  {
                    let _t154 = _d144;
                    for (let _j146 = 0; _j146 < _i145; _j146++) _t154 += starvedRegion_f140[_a139[_j146]];
                    if (_t154 + (_a139.length - _i145 - 1) * _lo150 > _t149) continue;
                    if (_t154 + (_a139.length - _i145 - 1) * _hi151 < _t149) continue;
                  }
                  for (let _j146 = 0; _j146 < _i145; _j146++) {
                    const _y155 = _a139[_j146];
                    if (!(!((((starvedRegion_f140[_e143] === 1) && (starvedRegion_f140[_y155] === 1)) && (sp.adj8[_e143].includes(_y155)))))) continue V147;
                  }
                  break;
                }
                if (_r152 === 0) {
                  _s142[_i145] = 0;
                  _i145--;
                  continue;
                }
                _s142[_i145] = _d144;
                if (_i145 === _a139.length - 1) break;
                _i145++;
                _s142[_i145] = 0;
              }
              if (_i145 < 0) break;
              let _g156 = 0;
              G157: {
                const _a158 = v_E;
                for (let _i159 = 0; _i159 < _a158.length; _i159++) {
                  const v_x = _a158[_i159];
                  _g156 += starvedRegion_f140[v_x];
                }
              }
              if (!((_g156 === _h161))) continue;
              if (true) {
                _q137 = true;
                break Q138;
              }
            }
          }
          _c162 = !(_q137);
        }
        if (!(_c162)) break L136;
        let _g163 = -1;
        G164: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h187 = (_h160 - v_j);
            let _q165 = false;
            Q166: {
              const _a167 = v_E;
              const _t176 = (_h160 - v_j);
              const _lo177 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi178 = 31 - Math.clz32(b.domain);
              for (const _e171 of starvedRegion_l169) starvedRegion_f168[_e171] = -1;
              starvedRegion_l169 = _a167;
              let _i173 = 0;
              _s170[0] = 0;
              let _o180 = _a167.length === 0;
              for (;;) {
                if (_a167.length === 0) {
                  if (!_o180) break;
                  _o180 = false;
                }
                while (_a167.length > 0 && _i173 >= 0) {
                  const _e171 = _a167[_i173];
                  if (_s170[_i173] > 0) starvedRegion_f168[_e171] = -1;
                  let _r179 = b.domain & ~((2 << _s170[_i173]) - 1);
                  let _d172 = 0;
                  V175: for (; _r179 !== 0; _r179 &= _r179 - 1) {
                    _d172 = 31 - Math.clz32(_r179 & -_r179);
                    starvedRegion_f168[_e171] = _d172;
                    {
                      let _t181 = _d172;
                      for (let _j174 = 0; _j174 < _i173; _j174++) _t181 += starvedRegion_f168[_a167[_j174]];
                      if (_t181 + (_a167.length - _i173 - 1) * _lo177 > _t176) continue;
                      if (_t181 + (_a167.length - _i173 - 1) * _hi178 < _t176) continue;
                    }
                    for (let _j174 = 0; _j174 < _i173; _j174++) {
                      const _y182 = _a167[_j174];
                      if (!(!((((starvedRegion_f168[_e171] === 1) && (starvedRegion_f168[_y182] === 1)) && (sp.adj8[_e171].includes(_y182)))))) continue V175;
                    }
                    break;
                  }
                  if (_r179 === 0) {
                    _s170[_i173] = 0;
                    _i173--;
                    continue;
                  }
                  _s170[_i173] = _d172;
                  if (_i173 === _a167.length - 1) break;
                  _i173++;
                  _s170[_i173] = 0;
                }
                if (_i173 < 0) break;
                let _g183 = 0;
                G184: {
                  const _a185 = v_E;
                  for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                    const v_x = _a185[_i186];
                    _g183 += starvedRegion_f168[v_x];
                  }
                }
                if (!((_g183 === _h187))) continue;
                if (true) {
                  _q165 = true;
                  break Q166;
                }
              }
            }
            if (!(_q165)) continue;
            _g163 = v_j;
            break G164;
          }
        }
        const v_room = _g163;
        _g188.length = 0;
        G189: {
          _g198.length = 0;
          G199: {
            const _a202 = v_S;
            for (let _i203 = 0; _i203 < _a202.length; _i203++) {
              const v_c = _a202[_i203];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g198.push(v_c);
            }
          }
          const _a204 = _g198;
          for (let _i205 = 0; _i205 < _a204.length; _i205++) {
            const v_c = _a204[_i205];
            if (!((v_R.includes(v_c)))) continue;
            _g188.push(v_c);
          }
        }
        const v_Q = _g188;
        if (b.made[0] !== _m301_0 || b.made[1] !== _m302_1) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          if (!(sameSet(v_R, ruled(b, sp, cl, v_x)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _c210: boolean = (v_g === cl.region.of[v_x]);
          if (!_c210) {
            let _q206 = false;
            Q207: {
              const _a208 = v_R;
              for (let _i209 = 0; _i209 < _a208.length; _i209++) {
                const v_p = _a208[_i209];
                if ((cl.region.of[v_p] === v_g)) {
                  _q206 = true;
                  break Q207;
                }
              }
            }
            _c210 = _q206;
          }
          let _g211 = 0;
          G212: {
            const _a213 = v_S;
            for (let _i214 = 0; _i214 < _a213.length; _i214++) {
              const v_c = _a213[_i214];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g211++;
            }
          }
          let _g215 = 0;
          G216: {
            for (let _i217 = 0; _i217 < 1; _i217++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g215++;
            }
          }
          const _g218: number[] = [];
          G219: {
            const _g228: number[] = [];
            G229: {
              const _a232 = v_S;
              for (let _i233 = 0; _i233 < _a232.length; _i233++) {
                const v_c = _a232[_i233];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g228.push(v_c);
              }
            }
            const _a234 = _g228;
            for (let _i235 = 0; _i235 < _a234.length; _i235++) {
              const v_c = _a234[_i235];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g218.push(v_c);
            }
          }
          let _c258: boolean = (v_n > 0);
          if (_c258) {
            let _q236 = false;
            Q237: {
              const _f239 = new Int32Array(sp.cells.length).fill(-1);
              let _l240: readonly number[] = [];
              const _s241: number[] = [];
              const _a238 = v_E;
              const _t247 = ((2 * v_E.length) - v_n);
              const _lo248 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi249 = 31 - Math.clz32(b.domain);
              for (const _e242 of _l240) _f239[_e242] = -1;
              _l240 = _a238;
              let _i244 = 0;
              _s241[0] = 0;
              let _o251 = _a238.length === 0;
              for (;;) {
                if (_a238.length === 0) {
                  if (!_o251) break;
                  _o251 = false;
                }
                while (_a238.length > 0 && _i244 >= 0) {
                  const _e242 = _a238[_i244];
                  if (_s241[_i244] > 0) _f239[_e242] = -1;
                  let _r250 = b.domain & ~((2 << _s241[_i244]) - 1);
                  let _d243 = 0;
                  V246: for (; _r250 !== 0; _r250 &= _r250 - 1) {
                    _d243 = 31 - Math.clz32(_r250 & -_r250);
                    _f239[_e242] = _d243;
                    {
                      let _t252 = _d243;
                      for (let _j245 = 0; _j245 < _i244; _j245++) _t252 += _f239[_a238[_j245]];
                      if (_t252 + (_a238.length - _i244 - 1) * _lo248 > _t247) continue;
                      if (_t252 + (_a238.length - _i244 - 1) * _hi249 < _t247) continue;
                    }
                    for (let _j245 = 0; _j245 < _i244; _j245++) {
                      const _y253 = _a238[_j245];
                      if (!(!((((_f239[_e242] === 1) && (_f239[_y253] === 1)) && (sp.adj8[_e242].includes(_y253)))))) continue V246;
                    }
                    break;
                  }
                  if (_r250 === 0) {
                    _s241[_i244] = 0;
                    _i244--;
                    continue;
                  }
                  _s241[_i244] = _d243;
                  if (_i244 === _a238.length - 1) break;
                  _i244++;
                  _s241[_i244] = 0;
                }
                if (_i244 < 0) break;
                let _g254 = 0;
                G255: {
                  const _a256 = v_E;
                  for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                    const v_x = _a256[_i257];
                    _g254 += _f239[v_x];
                  }
                }
                if (!((_g254 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q236 = true;
                  break Q237;
                }
              }
            }
            _c258 = !(_q236);
          }
          let _g259 = -1;
          G260: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q261 = false;
              Q262: {
                const _f264 = new Int32Array(sp.cells.length).fill(-1);
                let _l265: readonly number[] = [];
                const _s266: number[] = [];
                const _a263 = v_E;
                const _t272 = ((2 * v_E.length) - v_j);
                const _lo273 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi274 = 31 - Math.clz32(b.domain);
                for (const _e267 of _l265) _f264[_e267] = -1;
                _l265 = _a263;
                let _i269 = 0;
                _s266[0] = 0;
                let _o276 = _a263.length === 0;
                for (;;) {
                  if (_a263.length === 0) {
                    if (!_o276) break;
                    _o276 = false;
                  }
                  while (_a263.length > 0 && _i269 >= 0) {
                    const _e267 = _a263[_i269];
                    if (_s266[_i269] > 0) _f264[_e267] = -1;
                    let _r275 = b.domain & ~((2 << _s266[_i269]) - 1);
                    let _d268 = 0;
                    V271: for (; _r275 !== 0; _r275 &= _r275 - 1) {
                      _d268 = 31 - Math.clz32(_r275 & -_r275);
                      _f264[_e267] = _d268;
                      {
                        let _t277 = _d268;
                        for (let _j270 = 0; _j270 < _i269; _j270++) _t277 += _f264[_a263[_j270]];
                        if (_t277 + (_a263.length - _i269 - 1) * _lo273 > _t272) continue;
                        if (_t277 + (_a263.length - _i269 - 1) * _hi274 < _t272) continue;
                      }
                      for (let _j270 = 0; _j270 < _i269; _j270++) {
                        const _y278 = _a263[_j270];
                        if (!(!((((_f264[_e267] === 1) && (_f264[_y278] === 1)) && (sp.adj8[_e267].includes(_y278)))))) continue V271;
                      }
                      break;
                    }
                    if (_r275 === 0) {
                      _s266[_i269] = 0;
                      _i269--;
                      continue;
                    }
                    _s266[_i269] = _d268;
                    if (_i269 === _a263.length - 1) break;
                    _i269++;
                    _s266[_i269] = 0;
                  }
                  if (_i269 < 0) break;
                  let _g279 = 0;
                  G280: {
                    const _a281 = v_E;
                    for (let _i282 = 0; _i282 < _a281.length; _i282++) {
                      const v_x = _a281[_i282];
                      _g279 += _f264[v_x];
                    }
                  }
                  if (!((_g279 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q261 = true;
                    break Q262;
                  }
                }
              }
              if (!(_q261)) continue;
              _g259 = v_j;
              break G260;
            }
          }
          const _g283: number[] = [];
          G284: {
            const _g293: number[] = [];
            G294: {
              const _a297 = v_S;
              for (let _i298 = 0; _i298 < _a297.length; _i298++) {
                const v_c = _a297[_i298];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g293.push(v_c);
              }
            }
            const _a299 = _g293;
            for (let _i300 = 0; _i300 < _a299.length; _i300++) {
              const v_c = _a299[_i300];
              if (!((v_R.includes(v_c)))) continue;
              _g283.push(v_c);
            }
          }
          freshBinding("starvedRegion", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, ruled(b, sp, cl, v_x)), (cl.region.parts.includes(v_g)), _c210, sameSet(v_S, cl.region.cells[v_g]), (v_n === ((cl.stars - _g211) - _g215)), sameSet(v_E, _g218), _c258, (v_room === _g259), sameSet(v_Q, _g283)], ["x in", "where of x", "R =", "g in", "where of g", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R.slice(), g: v_g, S: v_S.slice(), n: v_n, E: v_E.slice(), room: v_room, Q: v_Q.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

const bandKept = keptStore<Kept<Kept<readonly number[]>>>();
let bandOn: object | null = null;
let bandAt: Kept<Kept<Kept<readonly number[]>>> = [];

/** `band(k, dir, a)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function band(sp: GridSpace, v_k: number, v_dir: number, v_a: number): readonly number[] {
  if (sp !== bandOn) {
    bandAt = bandKept.board(sp);
    bandOn = sp;
  }
  const _kept: Kept<Kept<Kept<readonly number[]>>> = bandAt;
  const _kept1 = (_kept[v_k] ??= []);
  const _kept2 = (_kept1[v_dir] ??= []);
  if (_kept2[v_a] !== undefined) return _kept2[v_a];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.cells;
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_c = _a5[_i6];
      if (!(((v_a <= (((1 - v_dir) * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w)))) && ((((1 - v_dir) * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w))) < (v_a + v_k))))) continue;
      _g1.push(v_c);
    }
  }
  const _made = _g1;
  _kept2[v_a] = _made;
  return _made;
}

const ruledKept = keptStore<readonly number[]>();

/** `ruled(x)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ruled(b: Marks, sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  const _kept: Kept<readonly number[]> = ruledKept.marks(b);
  if (_kept[v_x] !== undefined) return _kept[v_x];
  const _g1: number[] = [];
  G2: {
    const _a27 = sp.cells;
    for (let _i28 = 0; _i28 < _a27.length; _i28++) {
      const v_p = _a27[_i28];
      let _c50: boolean = (!((b.grid[v_p] !== 0)) && (v_p !== v_x));
      if (_c50) {
        let _c35: boolean = (sp.adj8[v_x].includes(v_p));
        if (!_c35) {
          let _c34: boolean = (sp.rowOf[v_p] === sp.rowOf[v_x]);
          if (_c34) {
            const _t29 = sp.lineCells[sp.rowOf[v_x]];
            let _g30 = 0;
            G31: {
              const _a32 = _t29;
              for (let _i33 = 0; _i33 < _a32.length; _i33++) {
                const v_c = _a32[_i33];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g30++;
              }
            }
            _c34 = ((cl.stars - _g30) === 1);
          }
          _c35 = _c34;
        }
        let _c42: boolean = _c35;
        if (!_c42) {
          let _c41: boolean = (sp.colOf[v_p] === sp.colOf[v_x]);
          if (_c41) {
            const _t36 = sp.lineCells[sp.colOf[v_x]];
            let _g37 = 0;
            G38: {
              const _a39 = _t36;
              for (let _i40 = 0; _i40 < _a39.length; _i40++) {
                const v_c = _a39[_i40];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g37++;
              }
            }
            _c41 = ((cl.stars - _g37) === 1);
          }
          _c42 = _c41;
        }
        let _c49: boolean = _c42;
        if (!_c49) {
          let _c48: boolean = (cl.region.of[v_p] === cl.region.of[v_x]);
          if (_c48) {
            const _t43 = cl.region.cells[cl.region.of[v_x]];
            let _g44 = 0;
            G45: {
              const _a46 = _t43;
              for (let _i47 = 0; _i47 < _a46.length; _i47++) {
                const v_c = _a46[_i47];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g44++;
              }
            }
            _c48 = ((cl.stars - _g44) === 1);
          }
          _c49 = _c48;
        }
        _c50 = _c49;
      }
      if (!(_c50)) continue;
      _g1.push(v_p);
    }
  }
  const _made = _g1;
  _kept[v_x] = _made;
  return _made;
}
