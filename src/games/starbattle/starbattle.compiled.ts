// Compiled by `npm run describe` from src/games/starbattle/starbattle.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, cellsValued, freshBinding, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, type Kept } from "../../engine/describe-runtime.ts";

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
  let _q2802 = true;
  Q2803: {
    const _a2804 = sp.lines;
    for (let _i2805 = 0; _i2805 < _a2804.length; _i2805++) {
      const v_L = _a2804[_i2805];
      let _g2806 = 0;
      G2807: {
        const _a2808 = sp.lineCells[v_L];
        for (let _i2809 = 0; _i2809 < _a2808.length; _i2809++) {
          const v_c = _a2808[_i2809];
          const _h2810 = (g[v_c] || -1);
          if (!((_h2810 === 1))) continue;
          _g2806++;
        }
      }
      if (!((_g2806 === cl.stars))) {
        _q2802 = false;
        break Q2803;
      }
    }
  }
  if (!(_q2802)) return false;
  let _q2811 = true;
  Q2812: {
    const _a2813 = cl.region.parts;
    for (let _i2814 = 0; _i2814 < _a2813.length; _i2814++) {
      const v_r = _a2813[_i2814];
      let _g2815 = 0;
      G2816: {
        const _a2817 = cl.region.cells[v_r];
        for (let _i2818 = 0; _i2818 < _a2817.length; _i2818++) {
          const v_c = _a2817[_i2818];
          const _h2819 = (g[v_c] || -1);
          if (!((_h2819 === 1))) continue;
          _g2815++;
        }
      }
      if (!((_g2815 === cl.stars))) {
        _q2811 = false;
        break Q2812;
      }
    }
  }
  if (!(_q2811)) return false;
  let _q2820 = true;
  Q2821: {
    const _a2822 = sp.cells;
    for (let _i2823 = 0; _i2823 < _a2822.length; _i2823++) {
      const v_a = _a2822[_i2823];
      const _h2824 = (g[v_a] || -1);
      if (!((_h2824 === 1))) continue;
      let _q2825 = true;
      Q2826: {
        const _a2827 = sp.adj8[v_a];
        for (let _i2828 = 0; _i2828 < _a2827.length; _i2828++) {
          const v_b = _a2827[_i2828];
          const _h2829 = (g[v_b] || -1);
          if (!((_h2829 !== 1))) {
            _q2825 = false;
            break Q2826;
          }
        }
      }
      if (!(_q2825)) {
        _q2820 = false;
        break Q2821;
      }
    }
  }
  if (!(_q2820)) return false;
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
    if (import.meta.env.DEV && staleChecking) {
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
  const _g38: number[] = [];
  const facts = fullLineFacts;
  let fired = 0;
  let changed = false;
  const _a22 = sp.lines;
  for (let _i23 = 0; _i23 < _a22.length; _i23++) {
    const v_L = _a22[_i23];
    const _t24 = sp.lineCells[v_L];
    let _g25 = 0;
    G26: {
      const _a27 = _t24;
      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
        const v_c = _a27[_i28];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g25++;
      }
    }
    L29: {
      const v_n = (cl.stars - _g25);
      if (!((v_n <= 0))) break L29;
      if (import.meta.env.DEV && staleChecking) {
        const _t30 = sp.lineCells[v_L];
        let _g31 = 0;
        G32: {
          const _a33 = _t30;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g31++;
          }
        }
        freshBinding("fullLine", [(sp.lines.includes(v_L)), (v_n === (cl.stars - _g31)), (v_n <= 0)], ["L in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c46: boolean = (v_n === 0);
      if (_c46) {
        let _q35 = true;
        Q36: {
          const _t37 = sp.lineCells[v_L];
          _g38.length = 0;
          G39: {
            const _a42 = _t37;
            for (let _i43 = 0; _i43 < _a42.length; _i43++) {
              const v_c = _a42[_i43];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g38.push(v_c);
            }
          }
          const _a44 = _g38;
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            const v_c = _a44[_i45];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
            if (!(true)) {
              _q35 = false;
              break Q36;
            }
          }
        }
        _c46 = _q35;
      }
      if (!(_c46)) return -1;
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
  const _g71: number[] = [];
  const facts = fullRegionFacts;
  let fired = 0;
  let changed = false;
  const _a55 = cl.region.parts;
  for (let _i56 = 0; _i56 < _a55.length; _i56++) {
    const v_r = _a55[_i56];
    const _t57 = cl.region.cells[v_r];
    let _g58 = 0;
    G59: {
      const _a60 = _t57;
      for (let _i61 = 0; _i61 < _a60.length; _i61++) {
        const v_c = _a60[_i61];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g58++;
      }
    }
    L62: {
      const v_n = (cl.stars - _g58);
      if (!((v_n <= 0))) break L62;
      if (import.meta.env.DEV && staleChecking) {
        const _t63 = cl.region.cells[v_r];
        let _g64 = 0;
        G65: {
          const _a66 = _t63;
          for (let _i67 = 0; _i67 < _a66.length; _i67++) {
            const v_c = _a66[_i67];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g64++;
          }
        }
        freshBinding("fullRegion", [(cl.region.parts.includes(v_r)), (v_n === (cl.stars - _g64)), (v_n <= 0)], ["r in", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c79: boolean = (v_n === 0);
      if (_c79) {
        let _q68 = true;
        Q69: {
          const _t70 = cl.region.cells[v_r];
          _g71.length = 0;
          G72: {
            const _a75 = _t70;
            for (let _i76 = 0; _i76 < _a75.length; _i76++) {
              const v_c = _a75[_i76];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g71.push(v_c);
            }
          }
          const _a77 = _g71;
          for (let _i78 = 0; _i78 < _a77.length; _i78++) {
            const v_c = _a77[_i78];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
            if (!(true)) {
              _q68 = false;
              break Q69;
            }
          }
        }
        _c79 = _q68;
      }
      if (!(_c79)) return -1;
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
  const _g103: number[] = [];
  const facts = exactLineFacts;
  let fired = 0;
  let changed = false;
  const _a95 = sp.lines;
  for (let _i96 = 0; _i96 < _a95.length; _i96++) {
    const v_L = _a95[_i96];
    const _t97 = sp.lineCells[v_L];
    let _g98 = 0;
    G99: {
      const _a100 = _t97;
      for (let _i101 = 0; _i101 < _a100.length; _i101++) {
        const v_c = _a100[_i101];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g98++;
      }
    }
    const v_n = (cl.stars - _g98);
    const _t102 = sp.lineCells[v_L];
    _g103.length = 0;
    G104: {
      const _a107 = _t102;
      for (let _i108 = 0; _i108 < _a107.length; _i108++) {
        const v_c = _a107[_i108];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g103.push(v_c);
      }
    }
    L109: {
      const v_O = _g103;
      const _h110 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h110)))) break L109;
      if (import.meta.env.DEV && staleChecking) {
        const _t111 = sp.lineCells[v_L];
        let _g112 = 0;
        G113: {
          const _a114 = _t111;
          for (let _i115 = 0; _i115 < _a114.length; _i115++) {
            const v_c = _a114[_i115];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g112++;
          }
        }
        const _t116 = sp.lineCells[v_L];
        const _g117: number[] = [];
        G118: {
          const _a121 = _t116;
          for (let _i122 = 0; _i122 < _a121.length; _i122++) {
            const v_c = _a121[_i122];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g117.push(v_c);
          }
        }
        freshBinding("exactLine", [(sp.lines.includes(v_L)), (v_n === (cl.stars - _g112)), sameSet(v_O, _g117), ((v_n > 0) && (v_n >= v_O.length))], ["L in", "n =", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c127: boolean = (v_n === _h110);
      if (_c127) {
        let _q123 = true;
        Q124: {
          const _a125 = v_O;
          for (let _i126 = 0; _i126 < _a125.length; _i126++) {
            const v_c = _a125[_i126];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q123 = false;
              break Q124;
            }
          }
        }
        _c127 = _q123;
      }
      if (!(_c127)) return -1;
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
  const _g151: number[] = [];
  const facts = exactRegionFacts;
  let fired = 0;
  let changed = false;
  const _a143 = cl.region.parts;
  for (let _i144 = 0; _i144 < _a143.length; _i144++) {
    const v_r = _a143[_i144];
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
    const v_n = (cl.stars - _g146);
    const _t150 = cl.region.cells[v_r];
    _g151.length = 0;
    G152: {
      const _a155 = _t150;
      for (let _i156 = 0; _i156 < _a155.length; _i156++) {
        const v_c = _a155[_i156];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g151.push(v_c);
      }
    }
    L157: {
      const v_O = _g151;
      const _h158 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h158)))) break L157;
      if (import.meta.env.DEV && staleChecking) {
        const _t159 = cl.region.cells[v_r];
        let _g160 = 0;
        G161: {
          const _a162 = _t159;
          for (let _i163 = 0; _i163 < _a162.length; _i163++) {
            const v_c = _a162[_i163];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g160++;
          }
        }
        const _t164 = cl.region.cells[v_r];
        const _g165: number[] = [];
        G166: {
          const _a169 = _t164;
          for (let _i170 = 0; _i170 < _a169.length; _i170++) {
            const v_c = _a169[_i170];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g165.push(v_c);
          }
        }
        freshBinding("exactRegion", [(cl.region.parts.includes(v_r)), (v_n === (cl.stars - _g160)), sameSet(v_O, _g165), ((v_n > 0) && (v_n >= v_O.length))], ["r in", "n =", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c175: boolean = (v_n === _h158);
      if (_c175) {
        let _q171 = true;
        Q172: {
          const _a173 = v_O;
          for (let _i174 = 0; _i174 < _a173.length; _i174++) {
            const v_c = _a173[_i174];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q171 = false;
              break Q172;
            }
          }
        }
        _c175 = _q171;
      }
      if (!(_c175)) return -1;
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
  const _g332: number[] = [];
  const _g377: number[] = [];
  const _g395: number[] = [];
  const _g440: number[] = [];
  const _g460: number[] = [];
  const _g613: number[] = [];
  const _g628: number[] = [];
  const facts = confinedFacts;
  let fired = 0;
  let changed = false;
  const _h326 = (sp.w - 1);
  for (let v_dir = 0; v_dir <= 1; v_dir++) {
    for (let v_a = 0; v_a <= _h326; v_a++) {
      const v_B = band(sp, 1, v_dir, v_a);
      let _g327 = 0;
      G328: {
        const _a329 = v_B;
        for (let _i330 = 0; _i330 < _a329.length; _i330++) {
          const v_c = _a329[_i330];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g327++;
        }
      }
      L331: {
        const v_n = (cl.stars - _g327);
        if (!((v_n > 0))) break L331;
        _g332.length = 0;
        G333: {
          const _a360 = cl.region.parts;
          for (let _i361 = 0; _i361 < _a360.length; _i361++) {
            const v_r = _a360[_i361];
            const _t362 = cl.region.cells[v_r];
            let _g363 = 0;
            G364: {
              const _a365 = _t362;
              for (let _i366 = 0; _i366 < _a365.length; _i366++) {
                const v_c = _a365[_i366];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g363++;
              }
            }
            let _c385: boolean = ((cl.stars - _g363) > 0);
            if (_c385) {
              let _q374 = true;
              Q375: {
                const _t376 = cl.region.cells[v_r];
                _g377.length = 0;
                G378: {
                  const _a381 = _t376;
                  for (let _i382 = 0; _i382 < _a381.length; _i382++) {
                    const v_c = _a381[_i382];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g377.push(v_c);
                  }
                }
                const _a383 = _g377;
                for (let _i384 = 0; _i384 < _a383.length; _i384++) {
                  const v_c = _a383[_i384];
                  if (!((v_B.includes(v_c)))) {
                    _q374 = false;
                    break Q375;
                  }
                }
              }
              _c385 = _q374;
            }
            if (!(_c385)) continue;
            _g332.push(v_r);
          }
        }
        const v_I = _g332;
        let _g386 = 0;
        G387: {
          const _a388 = v_I;
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
            _g386 += (cl.stars - _g391);
          }
        }
        const v_mi = _g386;
        _g395.length = 0;
        G396: {
          const _a423 = cl.region.parts;
          for (let _i424 = 0; _i424 < _a423.length; _i424++) {
            const v_r = _a423[_i424];
            const _t425 = cl.region.cells[v_r];
            let _g426 = 0;
            G427: {
              const _a428 = _t425;
              for (let _i429 = 0; _i429 < _a428.length; _i429++) {
                const v_c = _a428[_i429];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g426++;
              }
            }
            let _c448: boolean = ((cl.stars - _g426) > 0);
            if (_c448) {
              let _q437 = false;
              Q438: {
                const _t439 = cl.region.cells[v_r];
                _g440.length = 0;
                G441: {
                  const _a444 = _t439;
                  for (let _i445 = 0; _i445 < _a444.length; _i445++) {
                    const v_c = _a444[_i445];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g440.push(v_c);
                  }
                }
                const _a446 = _g440;
                for (let _i447 = 0; _i447 < _a446.length; _i447++) {
                  const v_c = _a446[_i447];
                  if ((v_B.includes(v_c))) {
                    _q437 = true;
                    break Q438;
                  }
                }
              }
              _c448 = _q437;
            }
            if (!(_c448)) continue;
            _g395.push(v_r);
          }
        }
        const v_R = _g395;
        let _g449 = 0;
        G450: {
          const _a451 = v_R;
          for (let _i452 = 0; _i452 < _a451.length; _i452++) {
            const v_r = _a451[_i452];
            const _t453 = cl.region.cells[v_r];
            let _g454 = 0;
            G455: {
              const _a456 = _t453;
              for (let _i457 = 0; _i457 < _a456.length; _i457++) {
                const v_c = _a456[_i457];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g454++;
              }
            }
            _g449 += (cl.stars - _g454);
          }
        }
        const v_mr = _g449;
        let _c468: boolean = (v_mi === v_n);
        if (_c468) {
          let _q458 = false;
          Q459: {
            _g460.length = 0;
            G461: {
              const _a464 = v_B;
              for (let _i465 = 0; _i465 < _a464.length; _i465++) {
                const v_c = _a464[_i465];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g460.push(v_c);
              }
            }
            const _a466 = _g460;
            for (let _i467 = 0; _i467 < _a466.length; _i467++) {
              const v_c = _a466[_i467];
              if (!(v_I.includes(cl.region.of[v_c]))) {
                _q458 = true;
                break Q459;
              }
            }
          }
          _c468 = _q458;
        }
        L469: {
          const v_lines = _c468;
          if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L469;
          if (import.meta.env.DEV && staleChecking) {
            let _g470 = 0;
            G471: {
              const _a472 = v_B;
              for (let _i473 = 0; _i473 < _a472.length; _i473++) {
                const v_c = _a472[_i473];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g470++;
              }
            }
            const _g474: number[] = [];
            G475: {
              const _a502 = cl.region.parts;
              for (let _i503 = 0; _i503 < _a502.length; _i503++) {
                const v_r = _a502[_i503];
                const _t504 = cl.region.cells[v_r];
                let _g505 = 0;
                G506: {
                  const _a507 = _t504;
                  for (let _i508 = 0; _i508 < _a507.length; _i508++) {
                    const v_c = _a507[_i508];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g505++;
                  }
                }
                let _c527: boolean = ((cl.stars - _g505) > 0);
                if (_c527) {
                  let _q516 = true;
                  Q517: {
                    const _t518 = cl.region.cells[v_r];
                    const _g519: number[] = [];
                    G520: {
                      const _a523 = _t518;
                      for (let _i524 = 0; _i524 < _a523.length; _i524++) {
                        const v_c = _a523[_i524];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g519.push(v_c);
                      }
                    }
                    const _a525 = _g519;
                    for (let _i526 = 0; _i526 < _a525.length; _i526++) {
                      const v_c = _a525[_i526];
                      if (!((v_B.includes(v_c)))) {
                        _q516 = false;
                        break Q517;
                      }
                    }
                  }
                  _c527 = _q516;
                }
                if (!(_c527)) continue;
                _g474.push(v_r);
              }
            }
            let _g528 = 0;
            G529: {
              const _a530 = v_I;
              for (let _i531 = 0; _i531 < _a530.length; _i531++) {
                const v_r = _a530[_i531];
                const _t532 = cl.region.cells[v_r];
                let _g533 = 0;
                G534: {
                  const _a535 = _t532;
                  for (let _i536 = 0; _i536 < _a535.length; _i536++) {
                    const v_c = _a535[_i536];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g533++;
                  }
                }
                _g528 += (cl.stars - _g533);
              }
            }
            const _g537: number[] = [];
            G538: {
              const _a565 = cl.region.parts;
              for (let _i566 = 0; _i566 < _a565.length; _i566++) {
                const v_r = _a565[_i566];
                const _t567 = cl.region.cells[v_r];
                let _g568 = 0;
                G569: {
                  const _a570 = _t567;
                  for (let _i571 = 0; _i571 < _a570.length; _i571++) {
                    const v_c = _a570[_i571];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g568++;
                  }
                }
                let _c590: boolean = ((cl.stars - _g568) > 0);
                if (_c590) {
                  let _q579 = false;
                  Q580: {
                    const _t581 = cl.region.cells[v_r];
                    const _g582: number[] = [];
                    G583: {
                      const _a586 = _t581;
                      for (let _i587 = 0; _i587 < _a586.length; _i587++) {
                        const v_c = _a586[_i587];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g582.push(v_c);
                      }
                    }
                    const _a588 = _g582;
                    for (let _i589 = 0; _i589 < _a588.length; _i589++) {
                      const v_c = _a588[_i589];
                      if ((v_B.includes(v_c))) {
                        _q579 = true;
                        break Q580;
                      }
                    }
                  }
                  _c590 = _q579;
                }
                if (!(_c590)) continue;
                _g537.push(v_r);
              }
            }
            let _g591 = 0;
            G592: {
              const _a593 = v_R;
              for (let _i594 = 0; _i594 < _a593.length; _i594++) {
                const v_r = _a593[_i594];
                const _t595 = cl.region.cells[v_r];
                let _g596 = 0;
                G597: {
                  const _a598 = _t595;
                  for (let _i599 = 0; _i599 < _a598.length; _i599++) {
                    const v_c = _a598[_i599];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g596++;
                  }
                }
                _g591 += (cl.stars - _g596);
              }
            }
            let _c610: boolean = (v_mi === v_n);
            if (_c610) {
              let _q600 = false;
              Q601: {
                const _g602: number[] = [];
                G603: {
                  const _a606 = v_B;
                  for (let _i607 = 0; _i607 < _a606.length; _i607++) {
                    const v_c = _a606[_i607];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g602.push(v_c);
                  }
                }
                const _a608 = _g602;
                for (let _i609 = 0; _i609 < _a608.length; _i609++) {
                  const v_c = _a608[_i609];
                  if (!(v_I.includes(cl.region.of[v_c]))) {
                    _q600 = true;
                    break Q601;
                  }
                }
              }
              _c610 = _q600;
            }
            freshBinding("confined", [((0 <= v_dir) && (v_dir <= 1)), ((0 <= v_a) && (v_a <= (sp.w - 1))), sameSet(v_B, band(sp, 1, v_dir, v_a)), (v_n === (cl.stars - _g470)), (v_n > 0), sameSet(v_I, _g474), (v_mi === _g528), sameSet(v_R, _g537), (v_mr === _g591), (v_lines === _c610), ((v_mi >= v_n) || (v_mr <= v_n))], ["dir in", "a in", "B =", "n =", "where of n", "I =", "mi =", "R =", "mr =", "lines =", "where of lines"]);
          }
          facts.length = 0;
          changed = false;
          let _c622: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
          if (_c622) {
            let _c621: boolean = !(v_lines);
            if (!_c621) {
              let _q611 = true;
              Q612: {
                _g613.length = 0;
                G614: {
                  const _a617 = v_B;
                  for (let _i618 = 0; _i618 < _a617.length; _i618++) {
                    const v_c = _a617[_i618];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g613.push(v_c);
                  }
                }
                const _a619 = _g613;
                for (let _i620 = 0; _i620 < _a619.length; _i620++) {
                  const v_c = _a619[_i620];
                  if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                  if (!(true)) {
                    _q611 = false;
                    break Q612;
                  }
                }
              }
              _c621 = _q611;
            }
            _c622 = _c621;
          }
          let _c637: boolean = _c622;
          if (_c637) {
            let _c636: boolean = (v_lines || (v_mr > v_n));
            if (!_c636) {
              let _q623 = true;
              Q624: {
                const _a625 = v_R;
                for (let _i626 = 0; _i626 < _a625.length; _i626++) {
                  const v_r = _a625[_i626];
                  const _t627 = cl.region.cells[v_r];
                  _g628.length = 0;
                  G629: {
                    const _a632 = _t627;
                    for (let _i633 = 0; _i633 < _a632.length; _i633++) {
                      const v_c = _a632[_i633];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g628.push(v_c);
                    }
                  }
                  const _a634 = _g628;
                  for (let _i635 = 0; _i635 < _a634.length; _i635++) {
                    const v_c = _a634[_i635];
                    if (!(!(v_B.includes(v_c)))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q623 = false;
                      break Q624;
                    }
                  }
                }
              }
              _c636 = _q623;
            }
            _c637 = _c636;
          }
          if (!(_c637)) return -1;
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
let _f723 = new Int32Array(0);
let _l724: readonly number[] = [];
let _f750 = new Int32Array(0);
let _l751: readonly number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function neededLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededLineBinding> | null): number {
  const _g710: number[] = [];
  if (_f723.length < sp.cells.length) _f723 = new Int32Array(sp.cells.length).fill(-1);
  else _f723.fill(-1);
  _l724 = [];
  const _s725: number[] = [];
  if (_f750.length < sp.cells.length) _f750 = new Int32Array(sp.cells.length).fill(-1);
  else _f750.fill(-1);
  _l751 = [];
  const _s752: number[] = [];
  const _g776: number[] = [];
  const facts = neededLineFacts;
  let fired = 0;
  let changed = false;
  const _a702 = sp.lines;
  R1:
  for (let _i703 = 0; _i703 < _a702.length; _i703++) {
    const v_L = _a702[_i703];
    const _m182_0 = b.made[0];
    const _t704 = sp.lineCells[v_L];
    let _g705 = 0;
    G706: {
      const _a707 = _t704;
      for (let _i708 = 0; _i708 < _a707.length; _i708++) {
        const v_c = _a707[_i708];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g705++;
      }
    }
    const v_n = (cl.stars - _g705);
    const _t709 = sp.lineCells[v_L];
    _g710.length = 0;
    G711: {
      const _a714 = _t709;
      for (let _i715 = 0; _i715 < _a714.length; _i715++) {
        const v_c = _a714[_i715];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g710.push(v_c);
      }
    }
    L716: {
      const v_O = _g710;
      if (!((v_n > 0))) break L716;
      const _a717 = v_O;
      for (let _i718 = 0; _i718 < _a717.length; _i718++) {
        const v_x = _a717[_i718];
        L719: {
          const v_E = minus(v_O, setOf(v_x));
          const _h731 = v_E.length;
          const _h743 = (2 * _h731);
          const _h744 = (_h743 - v_n);
          let _q720 = false;
          Q721: {
            const _a722 = v_E;
            const _t732 = ((2 * _h731) - v_n);
            const _lo733 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi734 = 31 - Math.clz32(b.domain);
            for (const _e726 of _l724) _f723[_e726] = -1;
            _l724 = _a722;
            let _i728 = 0;
            _s725[0] = 0;
            let _o736 = _a722.length === 0;
            for (;;) {
              if (_a722.length === 0) {
                if (!_o736) break;
                _o736 = false;
              }
              while (_a722.length > 0 && _i728 >= 0) {
                const _e726 = _a722[_i728];
                if (_s725[_i728] > 0) _f723[_e726] = -1;
                let _r735 = b.domain & ~((2 << _s725[_i728]) - 1);
                let _d727 = 0;
                V730: for (; _r735 !== 0; _r735 &= _r735 - 1) {
                  _d727 = 31 - Math.clz32(_r735 & -_r735);
                  _f723[_e726] = _d727;
                  {
                    let _t737 = _d727;
                    for (let _j729 = 0; _j729 < _i728; _j729++) _t737 += _f723[_a722[_j729]];
                    if (_t737 + (_a722.length - _i728 - 1) * _lo733 > _t732) continue;
                    if (_t737 + (_a722.length - _i728 - 1) * _hi734 < _t732) continue;
                  }
                  for (let _j729 = 0; _j729 < _i728; _j729++) {
                    const _y738 = _a722[_j729];
                    if (!(!((((_f723[_e726] === 1) && (_f723[_y738] === 1)) && (sp.adj8[_e726].includes(_y738)))))) continue V730;
                  }
                  break;
                }
                if (_r735 === 0) {
                  _s725[_i728] = 0;
                  _i728--;
                  continue;
                }
                _s725[_i728] = _d727;
                if (_i728 === _a722.length - 1) break;
                _i728++;
                _s725[_i728] = 0;
              }
              if (_i728 < 0) break;
              let _g739 = 0;
              G740: {
                const _a741 = v_E;
                for (let _i742 = 0; _i742 < _a741.length; _i742++) {
                  const v_x = _a741[_i742];
                  _g739 += _f723[v_x];
                }
              }
              if (!((_g739 === _h744))) continue;
              if (true) {
                _q720 = true;
                break Q721;
              }
            }
          }
          if (!(!(_q720))) break L719;
          let _g745 = -1;
          G746: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h769 = (_h743 - v_j);
              let _q747 = false;
              Q748: {
                const _a749 = v_E;
                const _t758 = (_h743 - v_j);
                const _lo759 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi760 = 31 - Math.clz32(b.domain);
                for (const _e753 of _l751) _f750[_e753] = -1;
                _l751 = _a749;
                let _i755 = 0;
                _s752[0] = 0;
                let _o762 = _a749.length === 0;
                for (;;) {
                  if (_a749.length === 0) {
                    if (!_o762) break;
                    _o762 = false;
                  }
                  while (_a749.length > 0 && _i755 >= 0) {
                    const _e753 = _a749[_i755];
                    if (_s752[_i755] > 0) _f750[_e753] = -1;
                    let _r761 = b.domain & ~((2 << _s752[_i755]) - 1);
                    let _d754 = 0;
                    V757: for (; _r761 !== 0; _r761 &= _r761 - 1) {
                      _d754 = 31 - Math.clz32(_r761 & -_r761);
                      _f750[_e753] = _d754;
                      {
                        let _t763 = _d754;
                        for (let _j756 = 0; _j756 < _i755; _j756++) _t763 += _f750[_a749[_j756]];
                        if (_t763 + (_a749.length - _i755 - 1) * _lo759 > _t758) continue;
                        if (_t763 + (_a749.length - _i755 - 1) * _hi760 < _t758) continue;
                      }
                      for (let _j756 = 0; _j756 < _i755; _j756++) {
                        const _y764 = _a749[_j756];
                        if (!(!((((_f750[_e753] === 1) && (_f750[_y764] === 1)) && (sp.adj8[_e753].includes(_y764)))))) continue V757;
                      }
                      break;
                    }
                    if (_r761 === 0) {
                      _s752[_i755] = 0;
                      _i755--;
                      continue;
                    }
                    _s752[_i755] = _d754;
                    if (_i755 === _a749.length - 1) break;
                    _i755++;
                    _s752[_i755] = 0;
                  }
                  if (_i755 < 0) break;
                  let _g765 = 0;
                  G766: {
                    const _a767 = v_E;
                    for (let _i768 = 0; _i768 < _a767.length; _i768++) {
                      const v_x = _a767[_i768];
                      _g765 += _f750[v_x];
                    }
                  }
                  if (!((_g765 === _h769))) continue;
                  if (true) {
                    _q747 = true;
                    break Q748;
                  }
                }
              }
              if (!(_q747)) continue;
              _g745 = v_j;
              break G746;
            }
          }
          const v_room = _g745;
          if (b.made[0] !== _m182_0) {
            const _t770 = sp.lineCells[v_L];
            let _g771 = 0;
            G772: {
              const _a773 = _t770;
              for (let _i774 = 0; _i774 < _a773.length; _i774++) {
                const v_c = _a773[_i774];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g771++;
              }
            }
            if (!((v_n === (cl.stars - _g771)))) { continue R1; }
            const _t775 = sp.lineCells[v_L];
            _g776.length = 0;
            G777: {
              const _a780 = _t775;
              for (let _i781 = 0; _i781 < _a780.length; _i781++) {
                const v_c = _a780[_i781];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g776.push(v_c);
              }
            }
            if (!(sameSet(v_O, _g776))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _t782 = sp.lineCells[v_L];
            let _g783 = 0;
            G784: {
              const _a785 = _t782;
              for (let _i786 = 0; _i786 < _a785.length; _i786++) {
                const v_c = _a785[_i786];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g783++;
              }
            }
            const _t787 = sp.lineCells[v_L];
            const _g788: number[] = [];
            G789: {
              const _a792 = _t787;
              for (let _i793 = 0; _i793 < _a792.length; _i793++) {
                const v_c = _a792[_i793];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g788.push(v_c);
              }
            }
            let _q794 = false;
            Q795: {
              const _f797 = new Int32Array(sp.cells.length).fill(-1);
              let _l798: readonly number[] = [];
              const _s799: number[] = [];
              const _a796 = v_E;
              const _t805 = ((2 * v_E.length) - v_n);
              const _lo806 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi807 = 31 - Math.clz32(b.domain);
              for (const _e800 of _l798) _f797[_e800] = -1;
              _l798 = _a796;
              let _i802 = 0;
              _s799[0] = 0;
              let _o809 = _a796.length === 0;
              for (;;) {
                if (_a796.length === 0) {
                  if (!_o809) break;
                  _o809 = false;
                }
                while (_a796.length > 0 && _i802 >= 0) {
                  const _e800 = _a796[_i802];
                  if (_s799[_i802] > 0) _f797[_e800] = -1;
                  let _r808 = b.domain & ~((2 << _s799[_i802]) - 1);
                  let _d801 = 0;
                  V804: for (; _r808 !== 0; _r808 &= _r808 - 1) {
                    _d801 = 31 - Math.clz32(_r808 & -_r808);
                    _f797[_e800] = _d801;
                    {
                      let _t810 = _d801;
                      for (let _j803 = 0; _j803 < _i802; _j803++) _t810 += _f797[_a796[_j803]];
                      if (_t810 + (_a796.length - _i802 - 1) * _lo806 > _t805) continue;
                      if (_t810 + (_a796.length - _i802 - 1) * _hi807 < _t805) continue;
                    }
                    for (let _j803 = 0; _j803 < _i802; _j803++) {
                      const _y811 = _a796[_j803];
                      if (!(!((((_f797[_e800] === 1) && (_f797[_y811] === 1)) && (sp.adj8[_e800].includes(_y811)))))) continue V804;
                    }
                    break;
                  }
                  if (_r808 === 0) {
                    _s799[_i802] = 0;
                    _i802--;
                    continue;
                  }
                  _s799[_i802] = _d801;
                  if (_i802 === _a796.length - 1) break;
                  _i802++;
                  _s799[_i802] = 0;
                }
                if (_i802 < 0) break;
                let _g812 = 0;
                G813: {
                  const _a814 = v_E;
                  for (let _i815 = 0; _i815 < _a814.length; _i815++) {
                    const v_x = _a814[_i815];
                    _g812 += _f797[v_x];
                  }
                }
                if (!((_g812 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q794 = true;
                  break Q795;
                }
              }
            }
            let _g816 = -1;
            G817: {
              for (let v_j = v_n; v_j >= 0; v_j--) {
                let _q818 = false;
                Q819: {
                  const _f821 = new Int32Array(sp.cells.length).fill(-1);
                  let _l822: readonly number[] = [];
                  const _s823: number[] = [];
                  const _a820 = v_E;
                  const _t829 = ((2 * v_E.length) - v_j);
                  const _lo830 = 31 - Math.clz32(b.domain & -b.domain);
                  const _hi831 = 31 - Math.clz32(b.domain);
                  for (const _e824 of _l822) _f821[_e824] = -1;
                  _l822 = _a820;
                  let _i826 = 0;
                  _s823[0] = 0;
                  let _o833 = _a820.length === 0;
                  for (;;) {
                    if (_a820.length === 0) {
                      if (!_o833) break;
                      _o833 = false;
                    }
                    while (_a820.length > 0 && _i826 >= 0) {
                      const _e824 = _a820[_i826];
                      if (_s823[_i826] > 0) _f821[_e824] = -1;
                      let _r832 = b.domain & ~((2 << _s823[_i826]) - 1);
                      let _d825 = 0;
                      V828: for (; _r832 !== 0; _r832 &= _r832 - 1) {
                        _d825 = 31 - Math.clz32(_r832 & -_r832);
                        _f821[_e824] = _d825;
                        {
                          let _t834 = _d825;
                          for (let _j827 = 0; _j827 < _i826; _j827++) _t834 += _f821[_a820[_j827]];
                          if (_t834 + (_a820.length - _i826 - 1) * _lo830 > _t829) continue;
                          if (_t834 + (_a820.length - _i826 - 1) * _hi831 < _t829) continue;
                        }
                        for (let _j827 = 0; _j827 < _i826; _j827++) {
                          const _y835 = _a820[_j827];
                          if (!(!((((_f821[_e824] === 1) && (_f821[_y835] === 1)) && (sp.adj8[_e824].includes(_y835)))))) continue V828;
                        }
                        break;
                      }
                      if (_r832 === 0) {
                        _s823[_i826] = 0;
                        _i826--;
                        continue;
                      }
                      _s823[_i826] = _d825;
                      if (_i826 === _a820.length - 1) break;
                      _i826++;
                      _s823[_i826] = 0;
                    }
                    if (_i826 < 0) break;
                    let _g836 = 0;
                    G837: {
                      const _a838 = v_E;
                      for (let _i839 = 0; _i839 < _a838.length; _i839++) {
                        const v_x = _a838[_i839];
                        _g836 += _f821[v_x];
                      }
                    }
                    if (!((_g836 === ((2 * v_E.length) - v_j)))) continue;
                    if (true) {
                      _q818 = true;
                      break Q819;
                    }
                  }
                }
                if (!(_q818)) continue;
                _g816 = v_j;
                break G817;
              }
            }
            freshBinding("neededLine", [(sp.lines.includes(v_L)), (v_n === (cl.stars - _g783)), sameSet(v_O, _g788), (v_n > 0), (v_O.includes(v_x)), sameSet(v_E, minus(v_O, setOf(v_x))), !(_q794), (v_room === _g816)], ["L in", "n =", "O =", "where of O", "x in", "E =", "where of E", "room ="]);
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
let _f925 = new Int32Array(0);
let _l926: readonly number[] = [];
let _f952 = new Int32Array(0);
let _l953: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function neededRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededRegionBinding> | null): number {
  const _g912: number[] = [];
  if (_f925.length < sp.cells.length) _f925 = new Int32Array(sp.cells.length).fill(-1);
  else _f925.fill(-1);
  _l926 = [];
  const _s927: number[] = [];
  if (_f952.length < sp.cells.length) _f952 = new Int32Array(sp.cells.length).fill(-1);
  else _f952.fill(-1);
  _l953 = [];
  const _s954: number[] = [];
  const _g978: number[] = [];
  const facts = neededRegionFacts;
  let fired = 0;
  let changed = false;
  const _a904 = cl.region.parts;
  R1:
  for (let _i905 = 0; _i905 < _a904.length; _i905++) {
    const v_r = _a904[_i905];
    const _m222_0 = b.made[0];
    const _t906 = cl.region.cells[v_r];
    let _g907 = 0;
    G908: {
      const _a909 = _t906;
      for (let _i910 = 0; _i910 < _a909.length; _i910++) {
        const v_c = _a909[_i910];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g907++;
      }
    }
    const v_n = (cl.stars - _g907);
    const _t911 = cl.region.cells[v_r];
    _g912.length = 0;
    G913: {
      const _a916 = _t911;
      for (let _i917 = 0; _i917 < _a916.length; _i917++) {
        const v_c = _a916[_i917];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g912.push(v_c);
      }
    }
    L918: {
      const v_O = _g912;
      if (!((v_n > 0))) break L918;
      const _a919 = v_O;
      for (let _i920 = 0; _i920 < _a919.length; _i920++) {
        const v_x = _a919[_i920];
        L921: {
          const v_E = minus(v_O, setOf(v_x));
          const _h933 = v_E.length;
          const _h945 = (2 * _h933);
          const _h946 = (_h945 - v_n);
          let _q922 = false;
          Q923: {
            const _a924 = v_E;
            const _t934 = ((2 * _h933) - v_n);
            const _lo935 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi936 = 31 - Math.clz32(b.domain);
            for (const _e928 of _l926) _f925[_e928] = -1;
            _l926 = _a924;
            let _i930 = 0;
            _s927[0] = 0;
            let _o938 = _a924.length === 0;
            for (;;) {
              if (_a924.length === 0) {
                if (!_o938) break;
                _o938 = false;
              }
              while (_a924.length > 0 && _i930 >= 0) {
                const _e928 = _a924[_i930];
                if (_s927[_i930] > 0) _f925[_e928] = -1;
                let _r937 = b.domain & ~((2 << _s927[_i930]) - 1);
                let _d929 = 0;
                V932: for (; _r937 !== 0; _r937 &= _r937 - 1) {
                  _d929 = 31 - Math.clz32(_r937 & -_r937);
                  _f925[_e928] = _d929;
                  {
                    let _t939 = _d929;
                    for (let _j931 = 0; _j931 < _i930; _j931++) _t939 += _f925[_a924[_j931]];
                    if (_t939 + (_a924.length - _i930 - 1) * _lo935 > _t934) continue;
                    if (_t939 + (_a924.length - _i930 - 1) * _hi936 < _t934) continue;
                  }
                  for (let _j931 = 0; _j931 < _i930; _j931++) {
                    const _y940 = _a924[_j931];
                    if (!(!((((_f925[_e928] === 1) && (_f925[_y940] === 1)) && (sp.adj8[_e928].includes(_y940)))))) continue V932;
                  }
                  break;
                }
                if (_r937 === 0) {
                  _s927[_i930] = 0;
                  _i930--;
                  continue;
                }
                _s927[_i930] = _d929;
                if (_i930 === _a924.length - 1) break;
                _i930++;
                _s927[_i930] = 0;
              }
              if (_i930 < 0) break;
              let _g941 = 0;
              G942: {
                const _a943 = v_E;
                for (let _i944 = 0; _i944 < _a943.length; _i944++) {
                  const v_x = _a943[_i944];
                  _g941 += _f925[v_x];
                }
              }
              if (!((_g941 === _h946))) continue;
              if (true) {
                _q922 = true;
                break Q923;
              }
            }
          }
          if (!(!(_q922))) break L921;
          let _g947 = -1;
          G948: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h971 = (_h945 - v_j);
              let _q949 = false;
              Q950: {
                const _a951 = v_E;
                const _t960 = (_h945 - v_j);
                const _lo961 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi962 = 31 - Math.clz32(b.domain);
                for (const _e955 of _l953) _f952[_e955] = -1;
                _l953 = _a951;
                let _i957 = 0;
                _s954[0] = 0;
                let _o964 = _a951.length === 0;
                for (;;) {
                  if (_a951.length === 0) {
                    if (!_o964) break;
                    _o964 = false;
                  }
                  while (_a951.length > 0 && _i957 >= 0) {
                    const _e955 = _a951[_i957];
                    if (_s954[_i957] > 0) _f952[_e955] = -1;
                    let _r963 = b.domain & ~((2 << _s954[_i957]) - 1);
                    let _d956 = 0;
                    V959: for (; _r963 !== 0; _r963 &= _r963 - 1) {
                      _d956 = 31 - Math.clz32(_r963 & -_r963);
                      _f952[_e955] = _d956;
                      {
                        let _t965 = _d956;
                        for (let _j958 = 0; _j958 < _i957; _j958++) _t965 += _f952[_a951[_j958]];
                        if (_t965 + (_a951.length - _i957 - 1) * _lo961 > _t960) continue;
                        if (_t965 + (_a951.length - _i957 - 1) * _hi962 < _t960) continue;
                      }
                      for (let _j958 = 0; _j958 < _i957; _j958++) {
                        const _y966 = _a951[_j958];
                        if (!(!((((_f952[_e955] === 1) && (_f952[_y966] === 1)) && (sp.adj8[_e955].includes(_y966)))))) continue V959;
                      }
                      break;
                    }
                    if (_r963 === 0) {
                      _s954[_i957] = 0;
                      _i957--;
                      continue;
                    }
                    _s954[_i957] = _d956;
                    if (_i957 === _a951.length - 1) break;
                    _i957++;
                    _s954[_i957] = 0;
                  }
                  if (_i957 < 0) break;
                  let _g967 = 0;
                  G968: {
                    const _a969 = v_E;
                    for (let _i970 = 0; _i970 < _a969.length; _i970++) {
                      const v_x = _a969[_i970];
                      _g967 += _f952[v_x];
                    }
                  }
                  if (!((_g967 === _h971))) continue;
                  if (true) {
                    _q949 = true;
                    break Q950;
                  }
                }
              }
              if (!(_q949)) continue;
              _g947 = v_j;
              break G948;
            }
          }
          const v_room = _g947;
          if (b.made[0] !== _m222_0) {
            const _t972 = cl.region.cells[v_r];
            let _g973 = 0;
            G974: {
              const _a975 = _t972;
              for (let _i976 = 0; _i976 < _a975.length; _i976++) {
                const v_c = _a975[_i976];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g973++;
              }
            }
            if (!((v_n === (cl.stars - _g973)))) { continue R1; }
            const _t977 = cl.region.cells[v_r];
            _g978.length = 0;
            G979: {
              const _a982 = _t977;
              for (let _i983 = 0; _i983 < _a982.length; _i983++) {
                const v_c = _a982[_i983];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g978.push(v_c);
              }
            }
            if (!(sameSet(v_O, _g978))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _t984 = cl.region.cells[v_r];
            let _g985 = 0;
            G986: {
              const _a987 = _t984;
              for (let _i988 = 0; _i988 < _a987.length; _i988++) {
                const v_c = _a987[_i988];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g985++;
              }
            }
            const _t989 = cl.region.cells[v_r];
            const _g990: number[] = [];
            G991: {
              const _a994 = _t989;
              for (let _i995 = 0; _i995 < _a994.length; _i995++) {
                const v_c = _a994[_i995];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g990.push(v_c);
              }
            }
            let _q996 = false;
            Q997: {
              const _f999 = new Int32Array(sp.cells.length).fill(-1);
              let _l1000: readonly number[] = [];
              const _s1001: number[] = [];
              const _a998 = v_E;
              const _t1007 = ((2 * v_E.length) - v_n);
              const _lo1008 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1009 = 31 - Math.clz32(b.domain);
              for (const _e1002 of _l1000) _f999[_e1002] = -1;
              _l1000 = _a998;
              let _i1004 = 0;
              _s1001[0] = 0;
              let _o1011 = _a998.length === 0;
              for (;;) {
                if (_a998.length === 0) {
                  if (!_o1011) break;
                  _o1011 = false;
                }
                while (_a998.length > 0 && _i1004 >= 0) {
                  const _e1002 = _a998[_i1004];
                  if (_s1001[_i1004] > 0) _f999[_e1002] = -1;
                  let _r1010 = b.domain & ~((2 << _s1001[_i1004]) - 1);
                  let _d1003 = 0;
                  V1006: for (; _r1010 !== 0; _r1010 &= _r1010 - 1) {
                    _d1003 = 31 - Math.clz32(_r1010 & -_r1010);
                    _f999[_e1002] = _d1003;
                    {
                      let _t1012 = _d1003;
                      for (let _j1005 = 0; _j1005 < _i1004; _j1005++) _t1012 += _f999[_a998[_j1005]];
                      if (_t1012 + (_a998.length - _i1004 - 1) * _lo1008 > _t1007) continue;
                      if (_t1012 + (_a998.length - _i1004 - 1) * _hi1009 < _t1007) continue;
                    }
                    for (let _j1005 = 0; _j1005 < _i1004; _j1005++) {
                      const _y1013 = _a998[_j1005];
                      if (!(!((((_f999[_e1002] === 1) && (_f999[_y1013] === 1)) && (sp.adj8[_e1002].includes(_y1013)))))) continue V1006;
                    }
                    break;
                  }
                  if (_r1010 === 0) {
                    _s1001[_i1004] = 0;
                    _i1004--;
                    continue;
                  }
                  _s1001[_i1004] = _d1003;
                  if (_i1004 === _a998.length - 1) break;
                  _i1004++;
                  _s1001[_i1004] = 0;
                }
                if (_i1004 < 0) break;
                let _g1014 = 0;
                G1015: {
                  const _a1016 = v_E;
                  for (let _i1017 = 0; _i1017 < _a1016.length; _i1017++) {
                    const v_x = _a1016[_i1017];
                    _g1014 += _f999[v_x];
                  }
                }
                if (!((_g1014 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q996 = true;
                  break Q997;
                }
              }
            }
            let _g1018 = -1;
            G1019: {
              for (let v_j = v_n; v_j >= 0; v_j--) {
                let _q1020 = false;
                Q1021: {
                  const _f1023 = new Int32Array(sp.cells.length).fill(-1);
                  let _l1024: readonly number[] = [];
                  const _s1025: number[] = [];
                  const _a1022 = v_E;
                  const _t1031 = ((2 * v_E.length) - v_j);
                  const _lo1032 = 31 - Math.clz32(b.domain & -b.domain);
                  const _hi1033 = 31 - Math.clz32(b.domain);
                  for (const _e1026 of _l1024) _f1023[_e1026] = -1;
                  _l1024 = _a1022;
                  let _i1028 = 0;
                  _s1025[0] = 0;
                  let _o1035 = _a1022.length === 0;
                  for (;;) {
                    if (_a1022.length === 0) {
                      if (!_o1035) break;
                      _o1035 = false;
                    }
                    while (_a1022.length > 0 && _i1028 >= 0) {
                      const _e1026 = _a1022[_i1028];
                      if (_s1025[_i1028] > 0) _f1023[_e1026] = -1;
                      let _r1034 = b.domain & ~((2 << _s1025[_i1028]) - 1);
                      let _d1027 = 0;
                      V1030: for (; _r1034 !== 0; _r1034 &= _r1034 - 1) {
                        _d1027 = 31 - Math.clz32(_r1034 & -_r1034);
                        _f1023[_e1026] = _d1027;
                        {
                          let _t1036 = _d1027;
                          for (let _j1029 = 0; _j1029 < _i1028; _j1029++) _t1036 += _f1023[_a1022[_j1029]];
                          if (_t1036 + (_a1022.length - _i1028 - 1) * _lo1032 > _t1031) continue;
                          if (_t1036 + (_a1022.length - _i1028 - 1) * _hi1033 < _t1031) continue;
                        }
                        for (let _j1029 = 0; _j1029 < _i1028; _j1029++) {
                          const _y1037 = _a1022[_j1029];
                          if (!(!((((_f1023[_e1026] === 1) && (_f1023[_y1037] === 1)) && (sp.adj8[_e1026].includes(_y1037)))))) continue V1030;
                        }
                        break;
                      }
                      if (_r1034 === 0) {
                        _s1025[_i1028] = 0;
                        _i1028--;
                        continue;
                      }
                      _s1025[_i1028] = _d1027;
                      if (_i1028 === _a1022.length - 1) break;
                      _i1028++;
                      _s1025[_i1028] = 0;
                    }
                    if (_i1028 < 0) break;
                    let _g1038 = 0;
                    G1039: {
                      const _a1040 = v_E;
                      for (let _i1041 = 0; _i1041 < _a1040.length; _i1041++) {
                        const v_x = _a1040[_i1041];
                        _g1038 += _f1023[v_x];
                      }
                    }
                    if (!((_g1038 === ((2 * v_E.length) - v_j)))) continue;
                    if (true) {
                      _q1020 = true;
                      break Q1021;
                    }
                  }
                }
                if (!(_q1020)) continue;
                _g1018 = v_j;
                break G1019;
              }
            }
            freshBinding("neededRegion", [(cl.region.parts.includes(v_r)), (v_n === (cl.stars - _g985)), sameSet(v_O, _g990), (v_n > 0), (v_O.includes(v_x)), sameSet(v_E, minus(v_O, setOf(v_x))), !(_q996), (v_room === _g1018)], ["r in", "n =", "O =", "where of O", "x in", "E =", "where of E", "room ="]);
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
let _f1194 = new Int32Array(0);
let _l1195: readonly number[] = [];
let _f1222 = new Int32Array(0);
let _l1223: readonly number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function crowdedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedLineBinding> | null): number {
  const _g1150: number[] = [];
  const _g1172: number[] = [];
  const _g1182: number[] = [];
  if (_f1194.length < sp.cells.length) _f1194 = new Int32Array(sp.cells.length).fill(-1);
  else _f1194.fill(-1);
  _l1195 = [];
  const _s1196: number[] = [];
  if (_f1222.length < sp.cells.length) _f1222 = new Int32Array(sp.cells.length).fill(-1);
  else _f1222.fill(-1);
  _l1223 = [];
  const _s1224: number[] = [];
  const _g1242: number[] = [];
  const _g1252: number[] = [];
  const _g1260: number[] = [];
  const facts = crowdedLineFacts;
  let fired = 0;
  let changed = false;
  const _a1148 = sp.cells;
  R1:
  for (let _i1149 = 0; _i1149 < _a1148.length; _i1149++) {
    const v_x = _a1148[_i1149];
    const _m260_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1158 = sp.rowOf[v_x];
    const _h1159 = sp.colOf[v_x];
    _g1150.length = 0;
    G1151: {
      const _a1154 = sp.adj8[v_x];
      for (let _i1155 = 0; _i1155 < _a1154.length; _i1155++) {
        const v_p = _a1154[_i1155];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g1150.push(v_p);
      }
    }
    const v_R = _g1150;
    const _a1156 = sp.lines;
    for (let _i1157 = 0; _i1157 < _a1156.length; _i1157++) {
      const v_L = _a1156[_i1157];
      let _c1164: boolean = ((v_L === _h1158) || (v_L === _h1159));
      if (!_c1164) {
        let _q1160 = false;
        Q1161: {
          const _a1162 = v_R;
          for (let _i1163 = 0; _i1163 < _a1162.length; _i1163++) {
            const v_p = _a1162[_i1163];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q1160 = true;
              break Q1161;
            }
          }
        }
        _c1164 = _q1160;
      }
      if (!(_c1164)) continue;
      const v_S = sp.lineCells[v_L];
      let _g1165 = 0;
      G1166: {
        const _a1167 = v_S;
        for (let _i1168 = 0; _i1168 < _a1167.length; _i1168++) {
          const v_c = _a1167[_i1168];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1165++;
        }
      }
      let _g1169 = 0;
      G1170: {
        for (let _i1171 = 0; _i1171 < 1; _i1171++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1169++;
        }
      }
      const v_n = ((cl.stars - _g1165) - _g1169);
      _g1172.length = 0;
      G1173: {
        _g1182.length = 0;
        G1183: {
          const _a1186 = v_S;
          for (let _i1187 = 0; _i1187 < _a1186.length; _i1187++) {
            const v_c = _a1186[_i1187];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1182.push(v_c);
          }
        }
        const _a1188 = _g1182;
        for (let _i1189 = 0; _i1189 < _a1188.length; _i1189++) {
          const v_c = _a1188[_i1189];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1172.push(v_c);
        }
      }
      L1190: {
        const v_E = _g1172;
        const _h1202 = v_E.length;
        const _h1214 = (2 * _h1202);
        const _h1215 = (_h1214 - v_n);
        let _c1216: boolean = (v_n > 0);
        if (_c1216) {
          let _q1191 = false;
          Q1192: {
            const _a1193 = v_E;
            const _t1203 = ((2 * _h1202) - v_n);
            const _lo1204 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1205 = 31 - Math.clz32(b.domain);
            for (const _e1197 of _l1195) _f1194[_e1197] = -1;
            _l1195 = _a1193;
            let _i1199 = 0;
            _s1196[0] = 0;
            let _o1207 = _a1193.length === 0;
            for (;;) {
              if (_a1193.length === 0) {
                if (!_o1207) break;
                _o1207 = false;
              }
              while (_a1193.length > 0 && _i1199 >= 0) {
                const _e1197 = _a1193[_i1199];
                if (_s1196[_i1199] > 0) _f1194[_e1197] = -1;
                let _r1206 = b.domain & ~((2 << _s1196[_i1199]) - 1);
                let _d1198 = 0;
                V1201: for (; _r1206 !== 0; _r1206 &= _r1206 - 1) {
                  _d1198 = 31 - Math.clz32(_r1206 & -_r1206);
                  _f1194[_e1197] = _d1198;
                  {
                    let _t1208 = _d1198;
                    for (let _j1200 = 0; _j1200 < _i1199; _j1200++) _t1208 += _f1194[_a1193[_j1200]];
                    if (_t1208 + (_a1193.length - _i1199 - 1) * _lo1204 > _t1203) continue;
                    if (_t1208 + (_a1193.length - _i1199 - 1) * _hi1205 < _t1203) continue;
                  }
                  for (let _j1200 = 0; _j1200 < _i1199; _j1200++) {
                    const _y1209 = _a1193[_j1200];
                    if (!(!((((_f1194[_e1197] === 1) && (_f1194[_y1209] === 1)) && (sp.adj8[_e1197].includes(_y1209)))))) continue V1201;
                  }
                  break;
                }
                if (_r1206 === 0) {
                  _s1196[_i1199] = 0;
                  _i1199--;
                  continue;
                }
                _s1196[_i1199] = _d1198;
                if (_i1199 === _a1193.length - 1) break;
                _i1199++;
                _s1196[_i1199] = 0;
              }
              if (_i1199 < 0) break;
              let _g1210 = 0;
              G1211: {
                const _a1212 = v_E;
                for (let _i1213 = 0; _i1213 < _a1212.length; _i1213++) {
                  const v_x = _a1212[_i1213];
                  _g1210 += _f1194[v_x];
                }
              }
              if (!((_g1210 === _h1215))) continue;
              if (true) {
                _q1191 = true;
                break Q1192;
              }
            }
          }
          _c1216 = !(_q1191);
        }
        if (!(_c1216)) break L1190;
        let _g1217 = -1;
        G1218: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1241 = (_h1214 - v_j);
            let _q1219 = false;
            Q1220: {
              const _a1221 = v_E;
              const _t1230 = (_h1214 - v_j);
              const _lo1231 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1232 = 31 - Math.clz32(b.domain);
              for (const _e1225 of _l1223) _f1222[_e1225] = -1;
              _l1223 = _a1221;
              let _i1227 = 0;
              _s1224[0] = 0;
              let _o1234 = _a1221.length === 0;
              for (;;) {
                if (_a1221.length === 0) {
                  if (!_o1234) break;
                  _o1234 = false;
                }
                while (_a1221.length > 0 && _i1227 >= 0) {
                  const _e1225 = _a1221[_i1227];
                  if (_s1224[_i1227] > 0) _f1222[_e1225] = -1;
                  let _r1233 = b.domain & ~((2 << _s1224[_i1227]) - 1);
                  let _d1226 = 0;
                  V1229: for (; _r1233 !== 0; _r1233 &= _r1233 - 1) {
                    _d1226 = 31 - Math.clz32(_r1233 & -_r1233);
                    _f1222[_e1225] = _d1226;
                    {
                      let _t1235 = _d1226;
                      for (let _j1228 = 0; _j1228 < _i1227; _j1228++) _t1235 += _f1222[_a1221[_j1228]];
                      if (_t1235 + (_a1221.length - _i1227 - 1) * _lo1231 > _t1230) continue;
                      if (_t1235 + (_a1221.length - _i1227 - 1) * _hi1232 < _t1230) continue;
                    }
                    for (let _j1228 = 0; _j1228 < _i1227; _j1228++) {
                      const _y1236 = _a1221[_j1228];
                      if (!(!((((_f1222[_e1225] === 1) && (_f1222[_y1236] === 1)) && (sp.adj8[_e1225].includes(_y1236)))))) continue V1229;
                    }
                    break;
                  }
                  if (_r1233 === 0) {
                    _s1224[_i1227] = 0;
                    _i1227--;
                    continue;
                  }
                  _s1224[_i1227] = _d1226;
                  if (_i1227 === _a1221.length - 1) break;
                  _i1227++;
                  _s1224[_i1227] = 0;
                }
                if (_i1227 < 0) break;
                let _g1237 = 0;
                G1238: {
                  const _a1239 = v_E;
                  for (let _i1240 = 0; _i1240 < _a1239.length; _i1240++) {
                    const v_x = _a1239[_i1240];
                    _g1237 += _f1222[v_x];
                  }
                }
                if (!((_g1237 === _h1241))) continue;
                if (true) {
                  _q1219 = true;
                  break Q1220;
                }
              }
            }
            if (!(_q1219)) continue;
            _g1217 = v_j;
            break G1218;
          }
        }
        const v_room = _g1217;
        _g1242.length = 0;
        G1243: {
          _g1252.length = 0;
          G1253: {
            const _a1256 = v_S;
            for (let _i1257 = 0; _i1257 < _a1256.length; _i1257++) {
              const v_c = _a1256[_i1257];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1252.push(v_c);
            }
          }
          const _a1258 = _g1252;
          for (let _i1259 = 0; _i1259 < _a1258.length; _i1259++) {
            const v_c = _a1258[_i1259];
            if (!((v_R.includes(v_c)))) continue;
            _g1242.push(v_c);
          }
        }
        const v_Q = _g1242;
        if (b.made[0] !== _m260_0) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          _g1260.length = 0;
          G1261: {
            const _a1264 = sp.adj8[v_x];
            for (let _i1265 = 0; _i1265 < _a1264.length; _i1265++) {
              const v_p = _a1264[_i1265];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g1260.push(v_p);
            }
          }
          if (!(sameSet(v_R, _g1260))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g1266: number[] = [];
          G1267: {
            const _a1270 = sp.adj8[v_x];
            for (let _i1271 = 0; _i1271 < _a1270.length; _i1271++) {
              const v_p = _a1270[_i1271];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g1266.push(v_p);
            }
          }
          let _c1276: boolean = ((v_L === sp.rowOf[v_x]) || (v_L === sp.colOf[v_x]));
          if (!_c1276) {
            let _q1272 = false;
            Q1273: {
              const _a1274 = v_R;
              for (let _i1275 = 0; _i1275 < _a1274.length; _i1275++) {
                const v_p = _a1274[_i1275];
                if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
                  _q1272 = true;
                  break Q1273;
                }
              }
            }
            _c1276 = _q1272;
          }
          let _g1277 = 0;
          G1278: {
            const _a1279 = v_S;
            for (let _i1280 = 0; _i1280 < _a1279.length; _i1280++) {
              const v_c = _a1279[_i1280];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g1277++;
            }
          }
          let _g1281 = 0;
          G1282: {
            for (let _i1283 = 0; _i1283 < 1; _i1283++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g1281++;
            }
          }
          const _g1284: number[] = [];
          G1285: {
            const _g1294: number[] = [];
            G1295: {
              const _a1298 = v_S;
              for (let _i1299 = 0; _i1299 < _a1298.length; _i1299++) {
                const v_c = _a1298[_i1299];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g1294.push(v_c);
              }
            }
            const _a1300 = _g1294;
            for (let _i1301 = 0; _i1301 < _a1300.length; _i1301++) {
              const v_c = _a1300[_i1301];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g1284.push(v_c);
            }
          }
          let _c1324: boolean = (v_n > 0);
          if (_c1324) {
            let _q1302 = false;
            Q1303: {
              const _f1305 = new Int32Array(sp.cells.length).fill(-1);
              let _l1306: readonly number[] = [];
              const _s1307: number[] = [];
              const _a1304 = v_E;
              const _t1313 = ((2 * v_E.length) - v_n);
              const _lo1314 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1315 = 31 - Math.clz32(b.domain);
              for (const _e1308 of _l1306) _f1305[_e1308] = -1;
              _l1306 = _a1304;
              let _i1310 = 0;
              _s1307[0] = 0;
              let _o1317 = _a1304.length === 0;
              for (;;) {
                if (_a1304.length === 0) {
                  if (!_o1317) break;
                  _o1317 = false;
                }
                while (_a1304.length > 0 && _i1310 >= 0) {
                  const _e1308 = _a1304[_i1310];
                  if (_s1307[_i1310] > 0) _f1305[_e1308] = -1;
                  let _r1316 = b.domain & ~((2 << _s1307[_i1310]) - 1);
                  let _d1309 = 0;
                  V1312: for (; _r1316 !== 0; _r1316 &= _r1316 - 1) {
                    _d1309 = 31 - Math.clz32(_r1316 & -_r1316);
                    _f1305[_e1308] = _d1309;
                    {
                      let _t1318 = _d1309;
                      for (let _j1311 = 0; _j1311 < _i1310; _j1311++) _t1318 += _f1305[_a1304[_j1311]];
                      if (_t1318 + (_a1304.length - _i1310 - 1) * _lo1314 > _t1313) continue;
                      if (_t1318 + (_a1304.length - _i1310 - 1) * _hi1315 < _t1313) continue;
                    }
                    for (let _j1311 = 0; _j1311 < _i1310; _j1311++) {
                      const _y1319 = _a1304[_j1311];
                      if (!(!((((_f1305[_e1308] === 1) && (_f1305[_y1319] === 1)) && (sp.adj8[_e1308].includes(_y1319)))))) continue V1312;
                    }
                    break;
                  }
                  if (_r1316 === 0) {
                    _s1307[_i1310] = 0;
                    _i1310--;
                    continue;
                  }
                  _s1307[_i1310] = _d1309;
                  if (_i1310 === _a1304.length - 1) break;
                  _i1310++;
                  _s1307[_i1310] = 0;
                }
                if (_i1310 < 0) break;
                let _g1320 = 0;
                G1321: {
                  const _a1322 = v_E;
                  for (let _i1323 = 0; _i1323 < _a1322.length; _i1323++) {
                    const v_x = _a1322[_i1323];
                    _g1320 += _f1305[v_x];
                  }
                }
                if (!((_g1320 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q1302 = true;
                  break Q1303;
                }
              }
            }
            _c1324 = !(_q1302);
          }
          let _g1325 = -1;
          G1326: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q1327 = false;
              Q1328: {
                const _f1330 = new Int32Array(sp.cells.length).fill(-1);
                let _l1331: readonly number[] = [];
                const _s1332: number[] = [];
                const _a1329 = v_E;
                const _t1338 = ((2 * v_E.length) - v_j);
                const _lo1339 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi1340 = 31 - Math.clz32(b.domain);
                for (const _e1333 of _l1331) _f1330[_e1333] = -1;
                _l1331 = _a1329;
                let _i1335 = 0;
                _s1332[0] = 0;
                let _o1342 = _a1329.length === 0;
                for (;;) {
                  if (_a1329.length === 0) {
                    if (!_o1342) break;
                    _o1342 = false;
                  }
                  while (_a1329.length > 0 && _i1335 >= 0) {
                    const _e1333 = _a1329[_i1335];
                    if (_s1332[_i1335] > 0) _f1330[_e1333] = -1;
                    let _r1341 = b.domain & ~((2 << _s1332[_i1335]) - 1);
                    let _d1334 = 0;
                    V1337: for (; _r1341 !== 0; _r1341 &= _r1341 - 1) {
                      _d1334 = 31 - Math.clz32(_r1341 & -_r1341);
                      _f1330[_e1333] = _d1334;
                      {
                        let _t1343 = _d1334;
                        for (let _j1336 = 0; _j1336 < _i1335; _j1336++) _t1343 += _f1330[_a1329[_j1336]];
                        if (_t1343 + (_a1329.length - _i1335 - 1) * _lo1339 > _t1338) continue;
                        if (_t1343 + (_a1329.length - _i1335 - 1) * _hi1340 < _t1338) continue;
                      }
                      for (let _j1336 = 0; _j1336 < _i1335; _j1336++) {
                        const _y1344 = _a1329[_j1336];
                        if (!(!((((_f1330[_e1333] === 1) && (_f1330[_y1344] === 1)) && (sp.adj8[_e1333].includes(_y1344)))))) continue V1337;
                      }
                      break;
                    }
                    if (_r1341 === 0) {
                      _s1332[_i1335] = 0;
                      _i1335--;
                      continue;
                    }
                    _s1332[_i1335] = _d1334;
                    if (_i1335 === _a1329.length - 1) break;
                    _i1335++;
                    _s1332[_i1335] = 0;
                  }
                  if (_i1335 < 0) break;
                  let _g1345 = 0;
                  G1346: {
                    const _a1347 = v_E;
                    for (let _i1348 = 0; _i1348 < _a1347.length; _i1348++) {
                      const v_x = _a1347[_i1348];
                      _g1345 += _f1330[v_x];
                    }
                  }
                  if (!((_g1345 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q1327 = true;
                    break Q1328;
                  }
                }
              }
              if (!(_q1327)) continue;
              _g1325 = v_j;
              break G1326;
            }
          }
          const _g1349: number[] = [];
          G1350: {
            const _g1359: number[] = [];
            G1360: {
              const _a1363 = v_S;
              for (let _i1364 = 0; _i1364 < _a1363.length; _i1364++) {
                const v_c = _a1363[_i1364];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g1359.push(v_c);
              }
            }
            const _a1365 = _g1359;
            for (let _i1366 = 0; _i1366 < _a1365.length; _i1366++) {
              const v_c = _a1365[_i1366];
              if (!((v_R.includes(v_c)))) continue;
              _g1349.push(v_c);
            }
          }
          freshBinding("crowdedLine", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, _g1266), (sp.lines.includes(v_L)), _c1276, sameSet(v_S, sp.lineCells[v_L]), (v_n === ((cl.stars - _g1277) - _g1281)), sameSet(v_E, _g1284), _c1324, (v_room === _g1325), sameSet(v_Q, _g1349)], ["x in", "where of x", "R =", "L in", "where of L", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
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
let _f1518 = new Int32Array(0);
let _l1519: readonly number[] = [];
let _f1546 = new Int32Array(0);
let _l1547: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function crowdedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedRegionBinding> | null): number {
  const _g1475: number[] = [];
  const _g1496: number[] = [];
  const _g1506: number[] = [];
  if (_f1518.length < sp.cells.length) _f1518 = new Int32Array(sp.cells.length).fill(-1);
  else _f1518.fill(-1);
  _l1519 = [];
  const _s1520: number[] = [];
  if (_f1546.length < sp.cells.length) _f1546 = new Int32Array(sp.cells.length).fill(-1);
  else _f1546.fill(-1);
  _l1547 = [];
  const _s1548: number[] = [];
  const _g1566: number[] = [];
  const _g1576: number[] = [];
  const _g1584: number[] = [];
  const facts = crowdedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1473 = sp.cells;
  R1:
  for (let _i1474 = 0; _i1474 < _a1473.length; _i1474++) {
    const v_x = _a1473[_i1474];
    const _m316_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1483 = cl.region.of[v_x];
    _g1475.length = 0;
    G1476: {
      const _a1479 = sp.adj8[v_x];
      for (let _i1480 = 0; _i1480 < _a1479.length; _i1480++) {
        const v_p = _a1479[_i1480];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g1475.push(v_p);
      }
    }
    const v_R = _g1475;
    const _a1481 = cl.region.parts;
    for (let _i1482 = 0; _i1482 < _a1481.length; _i1482++) {
      const v_g = _a1481[_i1482];
      let _c1488: boolean = (v_g === _h1483);
      if (!_c1488) {
        let _q1484 = false;
        Q1485: {
          const _a1486 = v_R;
          for (let _i1487 = 0; _i1487 < _a1486.length; _i1487++) {
            const v_p = _a1486[_i1487];
            if ((cl.region.of[v_p] === v_g)) {
              _q1484 = true;
              break Q1485;
            }
          }
        }
        _c1488 = _q1484;
      }
      if (!(_c1488)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1489 = 0;
      G1490: {
        const _a1491 = v_S;
        for (let _i1492 = 0; _i1492 < _a1491.length; _i1492++) {
          const v_c = _a1491[_i1492];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1489++;
        }
      }
      let _g1493 = 0;
      G1494: {
        for (let _i1495 = 0; _i1495 < 1; _i1495++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1493++;
        }
      }
      const v_n = ((cl.stars - _g1489) - _g1493);
      _g1496.length = 0;
      G1497: {
        _g1506.length = 0;
        G1507: {
          const _a1510 = v_S;
          for (let _i1511 = 0; _i1511 < _a1510.length; _i1511++) {
            const v_c = _a1510[_i1511];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1506.push(v_c);
          }
        }
        const _a1512 = _g1506;
        for (let _i1513 = 0; _i1513 < _a1512.length; _i1513++) {
          const v_c = _a1512[_i1513];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1496.push(v_c);
        }
      }
      L1514: {
        const v_E = _g1496;
        const _h1526 = v_E.length;
        const _h1538 = (2 * _h1526);
        const _h1539 = (_h1538 - v_n);
        let _c1540: boolean = (v_n > 0);
        if (_c1540) {
          let _q1515 = false;
          Q1516: {
            const _a1517 = v_E;
            const _t1527 = ((2 * _h1526) - v_n);
            const _lo1528 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1529 = 31 - Math.clz32(b.domain);
            for (const _e1521 of _l1519) _f1518[_e1521] = -1;
            _l1519 = _a1517;
            let _i1523 = 0;
            _s1520[0] = 0;
            let _o1531 = _a1517.length === 0;
            for (;;) {
              if (_a1517.length === 0) {
                if (!_o1531) break;
                _o1531 = false;
              }
              while (_a1517.length > 0 && _i1523 >= 0) {
                const _e1521 = _a1517[_i1523];
                if (_s1520[_i1523] > 0) _f1518[_e1521] = -1;
                let _r1530 = b.domain & ~((2 << _s1520[_i1523]) - 1);
                let _d1522 = 0;
                V1525: for (; _r1530 !== 0; _r1530 &= _r1530 - 1) {
                  _d1522 = 31 - Math.clz32(_r1530 & -_r1530);
                  _f1518[_e1521] = _d1522;
                  {
                    let _t1532 = _d1522;
                    for (let _j1524 = 0; _j1524 < _i1523; _j1524++) _t1532 += _f1518[_a1517[_j1524]];
                    if (_t1532 + (_a1517.length - _i1523 - 1) * _lo1528 > _t1527) continue;
                    if (_t1532 + (_a1517.length - _i1523 - 1) * _hi1529 < _t1527) continue;
                  }
                  for (let _j1524 = 0; _j1524 < _i1523; _j1524++) {
                    const _y1533 = _a1517[_j1524];
                    if (!(!((((_f1518[_e1521] === 1) && (_f1518[_y1533] === 1)) && (sp.adj8[_e1521].includes(_y1533)))))) continue V1525;
                  }
                  break;
                }
                if (_r1530 === 0) {
                  _s1520[_i1523] = 0;
                  _i1523--;
                  continue;
                }
                _s1520[_i1523] = _d1522;
                if (_i1523 === _a1517.length - 1) break;
                _i1523++;
                _s1520[_i1523] = 0;
              }
              if (_i1523 < 0) break;
              let _g1534 = 0;
              G1535: {
                const _a1536 = v_E;
                for (let _i1537 = 0; _i1537 < _a1536.length; _i1537++) {
                  const v_x = _a1536[_i1537];
                  _g1534 += _f1518[v_x];
                }
              }
              if (!((_g1534 === _h1539))) continue;
              if (true) {
                _q1515 = true;
                break Q1516;
              }
            }
          }
          _c1540 = !(_q1515);
        }
        if (!(_c1540)) break L1514;
        let _g1541 = -1;
        G1542: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1565 = (_h1538 - v_j);
            let _q1543 = false;
            Q1544: {
              const _a1545 = v_E;
              const _t1554 = (_h1538 - v_j);
              const _lo1555 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1556 = 31 - Math.clz32(b.domain);
              for (const _e1549 of _l1547) _f1546[_e1549] = -1;
              _l1547 = _a1545;
              let _i1551 = 0;
              _s1548[0] = 0;
              let _o1558 = _a1545.length === 0;
              for (;;) {
                if (_a1545.length === 0) {
                  if (!_o1558) break;
                  _o1558 = false;
                }
                while (_a1545.length > 0 && _i1551 >= 0) {
                  const _e1549 = _a1545[_i1551];
                  if (_s1548[_i1551] > 0) _f1546[_e1549] = -1;
                  let _r1557 = b.domain & ~((2 << _s1548[_i1551]) - 1);
                  let _d1550 = 0;
                  V1553: for (; _r1557 !== 0; _r1557 &= _r1557 - 1) {
                    _d1550 = 31 - Math.clz32(_r1557 & -_r1557);
                    _f1546[_e1549] = _d1550;
                    {
                      let _t1559 = _d1550;
                      for (let _j1552 = 0; _j1552 < _i1551; _j1552++) _t1559 += _f1546[_a1545[_j1552]];
                      if (_t1559 + (_a1545.length - _i1551 - 1) * _lo1555 > _t1554) continue;
                      if (_t1559 + (_a1545.length - _i1551 - 1) * _hi1556 < _t1554) continue;
                    }
                    for (let _j1552 = 0; _j1552 < _i1551; _j1552++) {
                      const _y1560 = _a1545[_j1552];
                      if (!(!((((_f1546[_e1549] === 1) && (_f1546[_y1560] === 1)) && (sp.adj8[_e1549].includes(_y1560)))))) continue V1553;
                    }
                    break;
                  }
                  if (_r1557 === 0) {
                    _s1548[_i1551] = 0;
                    _i1551--;
                    continue;
                  }
                  _s1548[_i1551] = _d1550;
                  if (_i1551 === _a1545.length - 1) break;
                  _i1551++;
                  _s1548[_i1551] = 0;
                }
                if (_i1551 < 0) break;
                let _g1561 = 0;
                G1562: {
                  const _a1563 = v_E;
                  for (let _i1564 = 0; _i1564 < _a1563.length; _i1564++) {
                    const v_x = _a1563[_i1564];
                    _g1561 += _f1546[v_x];
                  }
                }
                if (!((_g1561 === _h1565))) continue;
                if (true) {
                  _q1543 = true;
                  break Q1544;
                }
              }
            }
            if (!(_q1543)) continue;
            _g1541 = v_j;
            break G1542;
          }
        }
        const v_room = _g1541;
        _g1566.length = 0;
        G1567: {
          _g1576.length = 0;
          G1577: {
            const _a1580 = v_S;
            for (let _i1581 = 0; _i1581 < _a1580.length; _i1581++) {
              const v_c = _a1580[_i1581];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1576.push(v_c);
            }
          }
          const _a1582 = _g1576;
          for (let _i1583 = 0; _i1583 < _a1582.length; _i1583++) {
            const v_c = _a1582[_i1583];
            if (!((v_R.includes(v_c)))) continue;
            _g1566.push(v_c);
          }
        }
        const v_Q = _g1566;
        if (b.made[0] !== _m316_0) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          _g1584.length = 0;
          G1585: {
            const _a1588 = sp.adj8[v_x];
            for (let _i1589 = 0; _i1589 < _a1588.length; _i1589++) {
              const v_p = _a1588[_i1589];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g1584.push(v_p);
            }
          }
          if (!(sameSet(v_R, _g1584))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g1590: number[] = [];
          G1591: {
            const _a1594 = sp.adj8[v_x];
            for (let _i1595 = 0; _i1595 < _a1594.length; _i1595++) {
              const v_p = _a1594[_i1595];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g1590.push(v_p);
            }
          }
          let _c1600: boolean = (v_g === cl.region.of[v_x]);
          if (!_c1600) {
            let _q1596 = false;
            Q1597: {
              const _a1598 = v_R;
              for (let _i1599 = 0; _i1599 < _a1598.length; _i1599++) {
                const v_p = _a1598[_i1599];
                if ((cl.region.of[v_p] === v_g)) {
                  _q1596 = true;
                  break Q1597;
                }
              }
            }
            _c1600 = _q1596;
          }
          let _g1601 = 0;
          G1602: {
            const _a1603 = v_S;
            for (let _i1604 = 0; _i1604 < _a1603.length; _i1604++) {
              const v_c = _a1603[_i1604];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g1601++;
            }
          }
          let _g1605 = 0;
          G1606: {
            for (let _i1607 = 0; _i1607 < 1; _i1607++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g1605++;
            }
          }
          const _g1608: number[] = [];
          G1609: {
            const _g1618: number[] = [];
            G1619: {
              const _a1622 = v_S;
              for (let _i1623 = 0; _i1623 < _a1622.length; _i1623++) {
                const v_c = _a1622[_i1623];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g1618.push(v_c);
              }
            }
            const _a1624 = _g1618;
            for (let _i1625 = 0; _i1625 < _a1624.length; _i1625++) {
              const v_c = _a1624[_i1625];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g1608.push(v_c);
            }
          }
          let _c1648: boolean = (v_n > 0);
          if (_c1648) {
            let _q1626 = false;
            Q1627: {
              const _f1629 = new Int32Array(sp.cells.length).fill(-1);
              let _l1630: readonly number[] = [];
              const _s1631: number[] = [];
              const _a1628 = v_E;
              const _t1637 = ((2 * v_E.length) - v_n);
              const _lo1638 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1639 = 31 - Math.clz32(b.domain);
              for (const _e1632 of _l1630) _f1629[_e1632] = -1;
              _l1630 = _a1628;
              let _i1634 = 0;
              _s1631[0] = 0;
              let _o1641 = _a1628.length === 0;
              for (;;) {
                if (_a1628.length === 0) {
                  if (!_o1641) break;
                  _o1641 = false;
                }
                while (_a1628.length > 0 && _i1634 >= 0) {
                  const _e1632 = _a1628[_i1634];
                  if (_s1631[_i1634] > 0) _f1629[_e1632] = -1;
                  let _r1640 = b.domain & ~((2 << _s1631[_i1634]) - 1);
                  let _d1633 = 0;
                  V1636: for (; _r1640 !== 0; _r1640 &= _r1640 - 1) {
                    _d1633 = 31 - Math.clz32(_r1640 & -_r1640);
                    _f1629[_e1632] = _d1633;
                    {
                      let _t1642 = _d1633;
                      for (let _j1635 = 0; _j1635 < _i1634; _j1635++) _t1642 += _f1629[_a1628[_j1635]];
                      if (_t1642 + (_a1628.length - _i1634 - 1) * _lo1638 > _t1637) continue;
                      if (_t1642 + (_a1628.length - _i1634 - 1) * _hi1639 < _t1637) continue;
                    }
                    for (let _j1635 = 0; _j1635 < _i1634; _j1635++) {
                      const _y1643 = _a1628[_j1635];
                      if (!(!((((_f1629[_e1632] === 1) && (_f1629[_y1643] === 1)) && (sp.adj8[_e1632].includes(_y1643)))))) continue V1636;
                    }
                    break;
                  }
                  if (_r1640 === 0) {
                    _s1631[_i1634] = 0;
                    _i1634--;
                    continue;
                  }
                  _s1631[_i1634] = _d1633;
                  if (_i1634 === _a1628.length - 1) break;
                  _i1634++;
                  _s1631[_i1634] = 0;
                }
                if (_i1634 < 0) break;
                let _g1644 = 0;
                G1645: {
                  const _a1646 = v_E;
                  for (let _i1647 = 0; _i1647 < _a1646.length; _i1647++) {
                    const v_x = _a1646[_i1647];
                    _g1644 += _f1629[v_x];
                  }
                }
                if (!((_g1644 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q1626 = true;
                  break Q1627;
                }
              }
            }
            _c1648 = !(_q1626);
          }
          let _g1649 = -1;
          G1650: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q1651 = false;
              Q1652: {
                const _f1654 = new Int32Array(sp.cells.length).fill(-1);
                let _l1655: readonly number[] = [];
                const _s1656: number[] = [];
                const _a1653 = v_E;
                const _t1662 = ((2 * v_E.length) - v_j);
                const _lo1663 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi1664 = 31 - Math.clz32(b.domain);
                for (const _e1657 of _l1655) _f1654[_e1657] = -1;
                _l1655 = _a1653;
                let _i1659 = 0;
                _s1656[0] = 0;
                let _o1666 = _a1653.length === 0;
                for (;;) {
                  if (_a1653.length === 0) {
                    if (!_o1666) break;
                    _o1666 = false;
                  }
                  while (_a1653.length > 0 && _i1659 >= 0) {
                    const _e1657 = _a1653[_i1659];
                    if (_s1656[_i1659] > 0) _f1654[_e1657] = -1;
                    let _r1665 = b.domain & ~((2 << _s1656[_i1659]) - 1);
                    let _d1658 = 0;
                    V1661: for (; _r1665 !== 0; _r1665 &= _r1665 - 1) {
                      _d1658 = 31 - Math.clz32(_r1665 & -_r1665);
                      _f1654[_e1657] = _d1658;
                      {
                        let _t1667 = _d1658;
                        for (let _j1660 = 0; _j1660 < _i1659; _j1660++) _t1667 += _f1654[_a1653[_j1660]];
                        if (_t1667 + (_a1653.length - _i1659 - 1) * _lo1663 > _t1662) continue;
                        if (_t1667 + (_a1653.length - _i1659 - 1) * _hi1664 < _t1662) continue;
                      }
                      for (let _j1660 = 0; _j1660 < _i1659; _j1660++) {
                        const _y1668 = _a1653[_j1660];
                        if (!(!((((_f1654[_e1657] === 1) && (_f1654[_y1668] === 1)) && (sp.adj8[_e1657].includes(_y1668)))))) continue V1661;
                      }
                      break;
                    }
                    if (_r1665 === 0) {
                      _s1656[_i1659] = 0;
                      _i1659--;
                      continue;
                    }
                    _s1656[_i1659] = _d1658;
                    if (_i1659 === _a1653.length - 1) break;
                    _i1659++;
                    _s1656[_i1659] = 0;
                  }
                  if (_i1659 < 0) break;
                  let _g1669 = 0;
                  G1670: {
                    const _a1671 = v_E;
                    for (let _i1672 = 0; _i1672 < _a1671.length; _i1672++) {
                      const v_x = _a1671[_i1672];
                      _g1669 += _f1654[v_x];
                    }
                  }
                  if (!((_g1669 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q1651 = true;
                    break Q1652;
                  }
                }
              }
              if (!(_q1651)) continue;
              _g1649 = v_j;
              break G1650;
            }
          }
          const _g1673: number[] = [];
          G1674: {
            const _g1683: number[] = [];
            G1684: {
              const _a1687 = v_S;
              for (let _i1688 = 0; _i1688 < _a1687.length; _i1688++) {
                const v_c = _a1687[_i1688];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g1683.push(v_c);
              }
            }
            const _a1689 = _g1683;
            for (let _i1690 = 0; _i1690 < _a1689.length; _i1690++) {
              const v_c = _a1689[_i1690];
              if (!((v_R.includes(v_c)))) continue;
              _g1673.push(v_c);
            }
          }
          freshBinding("crowdedRegion", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, _g1590), (cl.region.parts.includes(v_g)), _c1600, sameSet(v_S, cl.region.cells[v_g]), (v_n === ((cl.stars - _g1601) - _g1605)), sameSet(v_E, _g1608), _c1648, (v_room === _g1649), sameSet(v_Q, _g1673)], ["x in", "where of x", "R =", "g in", "where of g", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
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
  const _g1845: number[] = [];
  const _g1890: number[] = [];
  const _g1908: number[] = [];
  const _g1953: number[] = [];
  const _g1973: number[] = [];
  const _g2126: number[] = [];
  const _g2141: number[] = [];
  const facts = bandedFacts;
  let fired = 0;
  let changed = false;
  const _t1836 = (sp.w - 2);
  for (let v_k = 2; v_k <= _t1836; v_k++) {
    const _h1837 = (sp.w - v_k);
    const _h1842 = (v_k - 1);
    const _h1843 = (_h1842 * cl.stars);
    for (let v_dir = 0; v_dir <= 1; v_dir++) {
      for (let v_a = 0; v_a <= _h1837; v_a++) {
        const v_B = band(sp, v_k, v_dir, v_a);
        let _g1838 = 0;
        G1839: {
          const _a1840 = v_B;
          for (let _i1841 = 0; _i1841 < _a1840.length; _i1841++) {
            const v_c = _a1840[_i1841];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1838++;
          }
        }
        L1844: {
          const v_n = ((cl.stars - _g1838) + _h1843);
          if (!((v_n > 0))) break L1844;
          _g1845.length = 0;
          G1846: {
            const _a1873 = cl.region.parts;
            for (let _i1874 = 0; _i1874 < _a1873.length; _i1874++) {
              const v_r = _a1873[_i1874];
              const _t1875 = cl.region.cells[v_r];
              let _g1876 = 0;
              G1877: {
                const _a1878 = _t1875;
                for (let _i1879 = 0; _i1879 < _a1878.length; _i1879++) {
                  const v_c = _a1878[_i1879];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1876++;
                }
              }
              let _c1898: boolean = ((cl.stars - _g1876) > 0);
              if (_c1898) {
                let _q1887 = true;
                Q1888: {
                  const _t1889 = cl.region.cells[v_r];
                  _g1890.length = 0;
                  G1891: {
                    const _a1894 = _t1889;
                    for (let _i1895 = 0; _i1895 < _a1894.length; _i1895++) {
                      const v_c = _a1894[_i1895];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1890.push(v_c);
                    }
                  }
                  const _a1896 = _g1890;
                  for (let _i1897 = 0; _i1897 < _a1896.length; _i1897++) {
                    const v_c = _a1896[_i1897];
                    if (!((v_B.includes(v_c)))) {
                      _q1887 = false;
                      break Q1888;
                    }
                  }
                }
                _c1898 = _q1887;
              }
              if (!(_c1898)) continue;
              _g1845.push(v_r);
            }
          }
          const v_I = _g1845;
          let _g1899 = 0;
          G1900: {
            const _a1901 = v_I;
            for (let _i1902 = 0; _i1902 < _a1901.length; _i1902++) {
              const v_r = _a1901[_i1902];
              const _t1903 = cl.region.cells[v_r];
              let _g1904 = 0;
              G1905: {
                const _a1906 = _t1903;
                for (let _i1907 = 0; _i1907 < _a1906.length; _i1907++) {
                  const v_c = _a1906[_i1907];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1904++;
                }
              }
              _g1899 += (cl.stars - _g1904);
            }
          }
          const v_mi = _g1899;
          _g1908.length = 0;
          G1909: {
            const _a1936 = cl.region.parts;
            for (let _i1937 = 0; _i1937 < _a1936.length; _i1937++) {
              const v_r = _a1936[_i1937];
              const _t1938 = cl.region.cells[v_r];
              let _g1939 = 0;
              G1940: {
                const _a1941 = _t1938;
                for (let _i1942 = 0; _i1942 < _a1941.length; _i1942++) {
                  const v_c = _a1941[_i1942];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1939++;
                }
              }
              let _c1961: boolean = ((cl.stars - _g1939) > 0);
              if (_c1961) {
                let _q1950 = false;
                Q1951: {
                  const _t1952 = cl.region.cells[v_r];
                  _g1953.length = 0;
                  G1954: {
                    const _a1957 = _t1952;
                    for (let _i1958 = 0; _i1958 < _a1957.length; _i1958++) {
                      const v_c = _a1957[_i1958];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1953.push(v_c);
                    }
                  }
                  const _a1959 = _g1953;
                  for (let _i1960 = 0; _i1960 < _a1959.length; _i1960++) {
                    const v_c = _a1959[_i1960];
                    if ((v_B.includes(v_c))) {
                      _q1950 = true;
                      break Q1951;
                    }
                  }
                }
                _c1961 = _q1950;
              }
              if (!(_c1961)) continue;
              _g1908.push(v_r);
            }
          }
          const v_R = _g1908;
          let _g1962 = 0;
          G1963: {
            const _a1964 = v_R;
            for (let _i1965 = 0; _i1965 < _a1964.length; _i1965++) {
              const v_r = _a1964[_i1965];
              const _t1966 = cl.region.cells[v_r];
              let _g1967 = 0;
              G1968: {
                const _a1969 = _t1966;
                for (let _i1970 = 0; _i1970 < _a1969.length; _i1970++) {
                  const v_c = _a1969[_i1970];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1967++;
                }
              }
              _g1962 += (cl.stars - _g1967);
            }
          }
          const v_mr = _g1962;
          let _c1981: boolean = (v_mi === v_n);
          if (_c1981) {
            let _q1971 = false;
            Q1972: {
              _g1973.length = 0;
              G1974: {
                const _a1977 = v_B;
                for (let _i1978 = 0; _i1978 < _a1977.length; _i1978++) {
                  const v_c = _a1977[_i1978];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g1973.push(v_c);
                }
              }
              const _a1979 = _g1973;
              for (let _i1980 = 0; _i1980 < _a1979.length; _i1980++) {
                const v_c = _a1979[_i1980];
                if (!(v_I.includes(cl.region.of[v_c]))) {
                  _q1971 = true;
                  break Q1972;
                }
              }
            }
            _c1981 = _q1971;
          }
          L1982: {
            const v_lines = _c1981;
            if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L1982;
            if (import.meta.env.DEV && staleChecking) {
              let _g1983 = 0;
              G1984: {
                const _a1985 = v_B;
                for (let _i1986 = 0; _i1986 < _a1985.length; _i1986++) {
                  const v_c = _a1985[_i1986];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1983++;
                }
              }
              const _g1987: number[] = [];
              G1988: {
                const _a2015 = cl.region.parts;
                for (let _i2016 = 0; _i2016 < _a2015.length; _i2016++) {
                  const v_r = _a2015[_i2016];
                  const _t2017 = cl.region.cells[v_r];
                  let _g2018 = 0;
                  G2019: {
                    const _a2020 = _t2017;
                    for (let _i2021 = 0; _i2021 < _a2020.length; _i2021++) {
                      const v_c = _a2020[_i2021];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g2018++;
                    }
                  }
                  let _c2040: boolean = ((cl.stars - _g2018) > 0);
                  if (_c2040) {
                    let _q2029 = true;
                    Q2030: {
                      const _t2031 = cl.region.cells[v_r];
                      const _g2032: number[] = [];
                      G2033: {
                        const _a2036 = _t2031;
                        for (let _i2037 = 0; _i2037 < _a2036.length; _i2037++) {
                          const v_c = _a2036[_i2037];
                          if (!(!((b.grid[v_c] !== 0)))) continue;
                          _g2032.push(v_c);
                        }
                      }
                      const _a2038 = _g2032;
                      for (let _i2039 = 0; _i2039 < _a2038.length; _i2039++) {
                        const v_c = _a2038[_i2039];
                        if (!((v_B.includes(v_c)))) {
                          _q2029 = false;
                          break Q2030;
                        }
                      }
                    }
                    _c2040 = _q2029;
                  }
                  if (!(_c2040)) continue;
                  _g1987.push(v_r);
                }
              }
              let _g2041 = 0;
              G2042: {
                const _a2043 = v_I;
                for (let _i2044 = 0; _i2044 < _a2043.length; _i2044++) {
                  const v_r = _a2043[_i2044];
                  const _t2045 = cl.region.cells[v_r];
                  let _g2046 = 0;
                  G2047: {
                    const _a2048 = _t2045;
                    for (let _i2049 = 0; _i2049 < _a2048.length; _i2049++) {
                      const v_c = _a2048[_i2049];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g2046++;
                    }
                  }
                  _g2041 += (cl.stars - _g2046);
                }
              }
              const _g2050: number[] = [];
              G2051: {
                const _a2078 = cl.region.parts;
                for (let _i2079 = 0; _i2079 < _a2078.length; _i2079++) {
                  const v_r = _a2078[_i2079];
                  const _t2080 = cl.region.cells[v_r];
                  let _g2081 = 0;
                  G2082: {
                    const _a2083 = _t2080;
                    for (let _i2084 = 0; _i2084 < _a2083.length; _i2084++) {
                      const v_c = _a2083[_i2084];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g2081++;
                    }
                  }
                  let _c2103: boolean = ((cl.stars - _g2081) > 0);
                  if (_c2103) {
                    let _q2092 = false;
                    Q2093: {
                      const _t2094 = cl.region.cells[v_r];
                      const _g2095: number[] = [];
                      G2096: {
                        const _a2099 = _t2094;
                        for (let _i2100 = 0; _i2100 < _a2099.length; _i2100++) {
                          const v_c = _a2099[_i2100];
                          if (!(!((b.grid[v_c] !== 0)))) continue;
                          _g2095.push(v_c);
                        }
                      }
                      const _a2101 = _g2095;
                      for (let _i2102 = 0; _i2102 < _a2101.length; _i2102++) {
                        const v_c = _a2101[_i2102];
                        if ((v_B.includes(v_c))) {
                          _q2092 = true;
                          break Q2093;
                        }
                      }
                    }
                    _c2103 = _q2092;
                  }
                  if (!(_c2103)) continue;
                  _g2050.push(v_r);
                }
              }
              let _g2104 = 0;
              G2105: {
                const _a2106 = v_R;
                for (let _i2107 = 0; _i2107 < _a2106.length; _i2107++) {
                  const v_r = _a2106[_i2107];
                  const _t2108 = cl.region.cells[v_r];
                  let _g2109 = 0;
                  G2110: {
                    const _a2111 = _t2108;
                    for (let _i2112 = 0; _i2112 < _a2111.length; _i2112++) {
                      const v_c = _a2111[_i2112];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g2109++;
                    }
                  }
                  _g2104 += (cl.stars - _g2109);
                }
              }
              let _c2123: boolean = (v_mi === v_n);
              if (_c2123) {
                let _q2113 = false;
                Q2114: {
                  const _g2115: number[] = [];
                  G2116: {
                    const _a2119 = v_B;
                    for (let _i2120 = 0; _i2120 < _a2119.length; _i2120++) {
                      const v_c = _a2119[_i2120];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g2115.push(v_c);
                    }
                  }
                  const _a2121 = _g2115;
                  for (let _i2122 = 0; _i2122 < _a2121.length; _i2122++) {
                    const v_c = _a2121[_i2122];
                    if (!(v_I.includes(cl.region.of[v_c]))) {
                      _q2113 = true;
                      break Q2114;
                    }
                  }
                }
                _c2123 = _q2113;
              }
              freshBinding("banded", [((2 <= v_k) && (v_k <= (sp.w - 2))), ((0 <= v_dir) && (v_dir <= 1)), ((0 <= v_a) && (v_a <= (sp.w - v_k))), sameSet(v_B, band(sp, v_k, v_dir, v_a)), (v_n === ((cl.stars - _g1983) + ((v_k - 1) * cl.stars))), (v_n > 0), sameSet(v_I, _g1987), (v_mi === _g2041), sameSet(v_R, _g2050), (v_mr === _g2104), (v_lines === _c2123), ((v_mi >= v_n) || (v_mr <= v_n))], ["k in", "dir in", "a in", "B =", "n =", "where of n", "I =", "mi =", "R =", "mr =", "lines =", "where of lines"]);
            }
            facts.length = 0;
            changed = false;
            let _c2135: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
            if (_c2135) {
              let _c2134: boolean = !(v_lines);
              if (!_c2134) {
                let _q2124 = true;
                Q2125: {
                  _g2126.length = 0;
                  G2127: {
                    const _a2130 = v_B;
                    for (let _i2131 = 0; _i2131 < _a2130.length; _i2131++) {
                      const v_c = _a2130[_i2131];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g2126.push(v_c);
                    }
                  }
                  const _a2132 = _g2126;
                  for (let _i2133 = 0; _i2133 < _a2132.length; _i2133++) {
                    const v_c = _a2132[_i2133];
                    if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q2124 = false;
                      break Q2125;
                    }
                  }
                }
                _c2134 = _q2124;
              }
              _c2135 = _c2134;
            }
            let _c2150: boolean = _c2135;
            if (_c2150) {
              let _c2149: boolean = (v_lines || (v_mr > v_n));
              if (!_c2149) {
                let _q2136 = true;
                Q2137: {
                  const _a2138 = v_R;
                  for (let _i2139 = 0; _i2139 < _a2138.length; _i2139++) {
                    const v_r = _a2138[_i2139];
                    const _t2140 = cl.region.cells[v_r];
                    _g2141.length = 0;
                    G2142: {
                      const _a2145 = _t2140;
                      for (let _i2146 = 0; _i2146 < _a2145.length; _i2146++) {
                        const v_c = _a2145[_i2146];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g2141.push(v_c);
                      }
                    }
                    const _a2147 = _g2141;
                    for (let _i2148 = 0; _i2148 < _a2147.length; _i2148++) {
                      const v_c = _a2147[_i2148];
                      if (!(!(v_B.includes(v_c)))) continue;
                      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                      if (!(true)) {
                        _q2136 = false;
                        break Q2137;
                      }
                    }
                  }
                }
                _c2149 = _q2136;
              }
              _c2150 = _c2149;
            }
            if (!(_c2150)) return -1;
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
let _f2341 = new Int32Array(0);
let _l2342: readonly number[] = [];
let _f2369 = new Int32Array(0);
let _l2370: readonly number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function starvedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedLineBinding> | null): number {
  const _g2319: number[] = [];
  const _g2329: number[] = [];
  if (_f2341.length < sp.cells.length) _f2341 = new Int32Array(sp.cells.length).fill(-1);
  else _f2341.fill(-1);
  _l2342 = [];
  const _s2343: number[] = [];
  if (_f2369.length < sp.cells.length) _f2369 = new Int32Array(sp.cells.length).fill(-1);
  else _f2369.fill(-1);
  _l2370 = [];
  const _s2371: number[] = [];
  const _g2389: number[] = [];
  const _g2399: number[] = [];
  const facts = starvedLineFacts;
  let fired = 0;
  let changed = false;
  const _a2301 = sp.cells;
  R1:
  for (let _i2302 = 0; _i2302 < _a2301.length; _i2302++) {
    const v_x = _a2301[_i2302];
    const _m451_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h2305 = sp.rowOf[v_x];
    const _h2306 = sp.colOf[v_x];
    const _m454_1 = b.made[1];
    const v_R = ruled(b, sp, cl, v_x);
    const _a2303 = sp.lines;
    for (let _i2304 = 0; _i2304 < _a2303.length; _i2304++) {
      const v_L = _a2303[_i2304];
      let _c2311: boolean = ((v_L === _h2305) || (v_L === _h2306));
      if (!_c2311) {
        let _q2307 = false;
        Q2308: {
          const _a2309 = v_R;
          for (let _i2310 = 0; _i2310 < _a2309.length; _i2310++) {
            const v_p = _a2309[_i2310];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q2307 = true;
              break Q2308;
            }
          }
        }
        _c2311 = _q2307;
      }
      if (!(_c2311)) continue;
      const v_S = sp.lineCells[v_L];
      let _g2312 = 0;
      G2313: {
        const _a2314 = v_S;
        for (let _i2315 = 0; _i2315 < _a2314.length; _i2315++) {
          const v_c = _a2314[_i2315];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g2312++;
        }
      }
      let _g2316 = 0;
      G2317: {
        for (let _i2318 = 0; _i2318 < 1; _i2318++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g2316++;
        }
      }
      const v_n = ((cl.stars - _g2312) - _g2316);
      _g2319.length = 0;
      G2320: {
        _g2329.length = 0;
        G2330: {
          const _a2333 = v_S;
          for (let _i2334 = 0; _i2334 < _a2333.length; _i2334++) {
            const v_c = _a2333[_i2334];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g2329.push(v_c);
          }
        }
        const _a2335 = _g2329;
        for (let _i2336 = 0; _i2336 < _a2335.length; _i2336++) {
          const v_c = _a2335[_i2336];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g2319.push(v_c);
        }
      }
      L2337: {
        const v_E = _g2319;
        const _h2349 = v_E.length;
        const _h2361 = (2 * _h2349);
        const _h2362 = (_h2361 - v_n);
        let _c2363: boolean = (v_n > 0);
        if (_c2363) {
          let _q2338 = false;
          Q2339: {
            const _a2340 = v_E;
            const _t2350 = ((2 * _h2349) - v_n);
            const _lo2351 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi2352 = 31 - Math.clz32(b.domain);
            for (const _e2344 of _l2342) _f2341[_e2344] = -1;
            _l2342 = _a2340;
            let _i2346 = 0;
            _s2343[0] = 0;
            let _o2354 = _a2340.length === 0;
            for (;;) {
              if (_a2340.length === 0) {
                if (!_o2354) break;
                _o2354 = false;
              }
              while (_a2340.length > 0 && _i2346 >= 0) {
                const _e2344 = _a2340[_i2346];
                if (_s2343[_i2346] > 0) _f2341[_e2344] = -1;
                let _r2353 = b.domain & ~((2 << _s2343[_i2346]) - 1);
                let _d2345 = 0;
                V2348: for (; _r2353 !== 0; _r2353 &= _r2353 - 1) {
                  _d2345 = 31 - Math.clz32(_r2353 & -_r2353);
                  _f2341[_e2344] = _d2345;
                  {
                    let _t2355 = _d2345;
                    for (let _j2347 = 0; _j2347 < _i2346; _j2347++) _t2355 += _f2341[_a2340[_j2347]];
                    if (_t2355 + (_a2340.length - _i2346 - 1) * _lo2351 > _t2350) continue;
                    if (_t2355 + (_a2340.length - _i2346 - 1) * _hi2352 < _t2350) continue;
                  }
                  for (let _j2347 = 0; _j2347 < _i2346; _j2347++) {
                    const _y2356 = _a2340[_j2347];
                    if (!(!((((_f2341[_e2344] === 1) && (_f2341[_y2356] === 1)) && (sp.adj8[_e2344].includes(_y2356)))))) continue V2348;
                  }
                  break;
                }
                if (_r2353 === 0) {
                  _s2343[_i2346] = 0;
                  _i2346--;
                  continue;
                }
                _s2343[_i2346] = _d2345;
                if (_i2346 === _a2340.length - 1) break;
                _i2346++;
                _s2343[_i2346] = 0;
              }
              if (_i2346 < 0) break;
              let _g2357 = 0;
              G2358: {
                const _a2359 = v_E;
                for (let _i2360 = 0; _i2360 < _a2359.length; _i2360++) {
                  const v_x = _a2359[_i2360];
                  _g2357 += _f2341[v_x];
                }
              }
              if (!((_g2357 === _h2362))) continue;
              if (true) {
                _q2338 = true;
                break Q2339;
              }
            }
          }
          _c2363 = !(_q2338);
        }
        if (!(_c2363)) break L2337;
        let _g2364 = -1;
        G2365: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h2388 = (_h2361 - v_j);
            let _q2366 = false;
            Q2367: {
              const _a2368 = v_E;
              const _t2377 = (_h2361 - v_j);
              const _lo2378 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi2379 = 31 - Math.clz32(b.domain);
              for (const _e2372 of _l2370) _f2369[_e2372] = -1;
              _l2370 = _a2368;
              let _i2374 = 0;
              _s2371[0] = 0;
              let _o2381 = _a2368.length === 0;
              for (;;) {
                if (_a2368.length === 0) {
                  if (!_o2381) break;
                  _o2381 = false;
                }
                while (_a2368.length > 0 && _i2374 >= 0) {
                  const _e2372 = _a2368[_i2374];
                  if (_s2371[_i2374] > 0) _f2369[_e2372] = -1;
                  let _r2380 = b.domain & ~((2 << _s2371[_i2374]) - 1);
                  let _d2373 = 0;
                  V2376: for (; _r2380 !== 0; _r2380 &= _r2380 - 1) {
                    _d2373 = 31 - Math.clz32(_r2380 & -_r2380);
                    _f2369[_e2372] = _d2373;
                    {
                      let _t2382 = _d2373;
                      for (let _j2375 = 0; _j2375 < _i2374; _j2375++) _t2382 += _f2369[_a2368[_j2375]];
                      if (_t2382 + (_a2368.length - _i2374 - 1) * _lo2378 > _t2377) continue;
                      if (_t2382 + (_a2368.length - _i2374 - 1) * _hi2379 < _t2377) continue;
                    }
                    for (let _j2375 = 0; _j2375 < _i2374; _j2375++) {
                      const _y2383 = _a2368[_j2375];
                      if (!(!((((_f2369[_e2372] === 1) && (_f2369[_y2383] === 1)) && (sp.adj8[_e2372].includes(_y2383)))))) continue V2376;
                    }
                    break;
                  }
                  if (_r2380 === 0) {
                    _s2371[_i2374] = 0;
                    _i2374--;
                    continue;
                  }
                  _s2371[_i2374] = _d2373;
                  if (_i2374 === _a2368.length - 1) break;
                  _i2374++;
                  _s2371[_i2374] = 0;
                }
                if (_i2374 < 0) break;
                let _g2384 = 0;
                G2385: {
                  const _a2386 = v_E;
                  for (let _i2387 = 0; _i2387 < _a2386.length; _i2387++) {
                    const v_x = _a2386[_i2387];
                    _g2384 += _f2369[v_x];
                  }
                }
                if (!((_g2384 === _h2388))) continue;
                if (true) {
                  _q2366 = true;
                  break Q2367;
                }
              }
            }
            if (!(_q2366)) continue;
            _g2364 = v_j;
            break G2365;
          }
        }
        const v_room = _g2364;
        _g2389.length = 0;
        G2390: {
          _g2399.length = 0;
          G2400: {
            const _a2403 = v_S;
            for (let _i2404 = 0; _i2404 < _a2403.length; _i2404++) {
              const v_c = _a2403[_i2404];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g2399.push(v_c);
            }
          }
          const _a2405 = _g2399;
          for (let _i2406 = 0; _i2406 < _a2405.length; _i2406++) {
            const v_c = _a2405[_i2406];
            if (!((v_R.includes(v_c)))) continue;
            _g2389.push(v_c);
          }
        }
        const v_Q = _g2389;
        if (b.made[0] !== _m451_0 || b.made[1] !== _m454_1) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          if (!(sameSet(v_R, ruled(b, sp, cl, v_x)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c2411: boolean = ((v_L === sp.rowOf[v_x]) || (v_L === sp.colOf[v_x]));
          if (!_c2411) {
            let _q2407 = false;
            Q2408: {
              const _a2409 = v_R;
              for (let _i2410 = 0; _i2410 < _a2409.length; _i2410++) {
                const v_p = _a2409[_i2410];
                if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
                  _q2407 = true;
                  break Q2408;
                }
              }
            }
            _c2411 = _q2407;
          }
          let _g2412 = 0;
          G2413: {
            const _a2414 = v_S;
            for (let _i2415 = 0; _i2415 < _a2414.length; _i2415++) {
              const v_c = _a2414[_i2415];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g2412++;
            }
          }
          let _g2416 = 0;
          G2417: {
            for (let _i2418 = 0; _i2418 < 1; _i2418++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g2416++;
            }
          }
          const _g2419: number[] = [];
          G2420: {
            const _g2429: number[] = [];
            G2430: {
              const _a2433 = v_S;
              for (let _i2434 = 0; _i2434 < _a2433.length; _i2434++) {
                const v_c = _a2433[_i2434];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g2429.push(v_c);
              }
            }
            const _a2435 = _g2429;
            for (let _i2436 = 0; _i2436 < _a2435.length; _i2436++) {
              const v_c = _a2435[_i2436];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g2419.push(v_c);
            }
          }
          let _c2459: boolean = (v_n > 0);
          if (_c2459) {
            let _q2437 = false;
            Q2438: {
              const _f2440 = new Int32Array(sp.cells.length).fill(-1);
              let _l2441: readonly number[] = [];
              const _s2442: number[] = [];
              const _a2439 = v_E;
              const _t2448 = ((2 * v_E.length) - v_n);
              const _lo2449 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi2450 = 31 - Math.clz32(b.domain);
              for (const _e2443 of _l2441) _f2440[_e2443] = -1;
              _l2441 = _a2439;
              let _i2445 = 0;
              _s2442[0] = 0;
              let _o2452 = _a2439.length === 0;
              for (;;) {
                if (_a2439.length === 0) {
                  if (!_o2452) break;
                  _o2452 = false;
                }
                while (_a2439.length > 0 && _i2445 >= 0) {
                  const _e2443 = _a2439[_i2445];
                  if (_s2442[_i2445] > 0) _f2440[_e2443] = -1;
                  let _r2451 = b.domain & ~((2 << _s2442[_i2445]) - 1);
                  let _d2444 = 0;
                  V2447: for (; _r2451 !== 0; _r2451 &= _r2451 - 1) {
                    _d2444 = 31 - Math.clz32(_r2451 & -_r2451);
                    _f2440[_e2443] = _d2444;
                    {
                      let _t2453 = _d2444;
                      for (let _j2446 = 0; _j2446 < _i2445; _j2446++) _t2453 += _f2440[_a2439[_j2446]];
                      if (_t2453 + (_a2439.length - _i2445 - 1) * _lo2449 > _t2448) continue;
                      if (_t2453 + (_a2439.length - _i2445 - 1) * _hi2450 < _t2448) continue;
                    }
                    for (let _j2446 = 0; _j2446 < _i2445; _j2446++) {
                      const _y2454 = _a2439[_j2446];
                      if (!(!((((_f2440[_e2443] === 1) && (_f2440[_y2454] === 1)) && (sp.adj8[_e2443].includes(_y2454)))))) continue V2447;
                    }
                    break;
                  }
                  if (_r2451 === 0) {
                    _s2442[_i2445] = 0;
                    _i2445--;
                    continue;
                  }
                  _s2442[_i2445] = _d2444;
                  if (_i2445 === _a2439.length - 1) break;
                  _i2445++;
                  _s2442[_i2445] = 0;
                }
                if (_i2445 < 0) break;
                let _g2455 = 0;
                G2456: {
                  const _a2457 = v_E;
                  for (let _i2458 = 0; _i2458 < _a2457.length; _i2458++) {
                    const v_x = _a2457[_i2458];
                    _g2455 += _f2440[v_x];
                  }
                }
                if (!((_g2455 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q2437 = true;
                  break Q2438;
                }
              }
            }
            _c2459 = !(_q2437);
          }
          let _g2460 = -1;
          G2461: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q2462 = false;
              Q2463: {
                const _f2465 = new Int32Array(sp.cells.length).fill(-1);
                let _l2466: readonly number[] = [];
                const _s2467: number[] = [];
                const _a2464 = v_E;
                const _t2473 = ((2 * v_E.length) - v_j);
                const _lo2474 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi2475 = 31 - Math.clz32(b.domain);
                for (const _e2468 of _l2466) _f2465[_e2468] = -1;
                _l2466 = _a2464;
                let _i2470 = 0;
                _s2467[0] = 0;
                let _o2477 = _a2464.length === 0;
                for (;;) {
                  if (_a2464.length === 0) {
                    if (!_o2477) break;
                    _o2477 = false;
                  }
                  while (_a2464.length > 0 && _i2470 >= 0) {
                    const _e2468 = _a2464[_i2470];
                    if (_s2467[_i2470] > 0) _f2465[_e2468] = -1;
                    let _r2476 = b.domain & ~((2 << _s2467[_i2470]) - 1);
                    let _d2469 = 0;
                    V2472: for (; _r2476 !== 0; _r2476 &= _r2476 - 1) {
                      _d2469 = 31 - Math.clz32(_r2476 & -_r2476);
                      _f2465[_e2468] = _d2469;
                      {
                        let _t2478 = _d2469;
                        for (let _j2471 = 0; _j2471 < _i2470; _j2471++) _t2478 += _f2465[_a2464[_j2471]];
                        if (_t2478 + (_a2464.length - _i2470 - 1) * _lo2474 > _t2473) continue;
                        if (_t2478 + (_a2464.length - _i2470 - 1) * _hi2475 < _t2473) continue;
                      }
                      for (let _j2471 = 0; _j2471 < _i2470; _j2471++) {
                        const _y2479 = _a2464[_j2471];
                        if (!(!((((_f2465[_e2468] === 1) && (_f2465[_y2479] === 1)) && (sp.adj8[_e2468].includes(_y2479)))))) continue V2472;
                      }
                      break;
                    }
                    if (_r2476 === 0) {
                      _s2467[_i2470] = 0;
                      _i2470--;
                      continue;
                    }
                    _s2467[_i2470] = _d2469;
                    if (_i2470 === _a2464.length - 1) break;
                    _i2470++;
                    _s2467[_i2470] = 0;
                  }
                  if (_i2470 < 0) break;
                  let _g2480 = 0;
                  G2481: {
                    const _a2482 = v_E;
                    for (let _i2483 = 0; _i2483 < _a2482.length; _i2483++) {
                      const v_x = _a2482[_i2483];
                      _g2480 += _f2465[v_x];
                    }
                  }
                  if (!((_g2480 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q2462 = true;
                    break Q2463;
                  }
                }
              }
              if (!(_q2462)) continue;
              _g2460 = v_j;
              break G2461;
            }
          }
          const _g2484: number[] = [];
          G2485: {
            const _g2494: number[] = [];
            G2495: {
              const _a2498 = v_S;
              for (let _i2499 = 0; _i2499 < _a2498.length; _i2499++) {
                const v_c = _a2498[_i2499];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g2494.push(v_c);
              }
            }
            const _a2500 = _g2494;
            for (let _i2501 = 0; _i2501 < _a2500.length; _i2501++) {
              const v_c = _a2500[_i2501];
              if (!((v_R.includes(v_c)))) continue;
              _g2484.push(v_c);
            }
          }
          freshBinding("starvedLine", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, ruled(b, sp, cl, v_x)), (sp.lines.includes(v_L)), _c2411, sameSet(v_S, sp.lineCells[v_L]), (v_n === ((cl.stars - _g2412) - _g2416)), sameSet(v_E, _g2419), _c2459, (v_room === _g2460), sameSet(v_Q, _g2484)], ["x in", "where of x", "R =", "L in", "where of L", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
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
let _f2641 = new Int32Array(0);
let _l2642: readonly number[] = [];
let _f2669 = new Int32Array(0);
let _l2670: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function starvedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedRegionBinding> | null): number {
  const _g2619: number[] = [];
  const _g2629: number[] = [];
  if (_f2641.length < sp.cells.length) _f2641 = new Int32Array(sp.cells.length).fill(-1);
  else _f2641.fill(-1);
  _l2642 = [];
  const _s2643: number[] = [];
  if (_f2669.length < sp.cells.length) _f2669 = new Int32Array(sp.cells.length).fill(-1);
  else _f2669.fill(-1);
  _l2670 = [];
  const _s2671: number[] = [];
  const _g2689: number[] = [];
  const _g2699: number[] = [];
  const facts = starvedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a2602 = sp.cells;
  R1:
  for (let _i2603 = 0; _i2603 < _a2602.length; _i2603++) {
    const v_x = _a2602[_i2603];
    const _m505_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h2606 = cl.region.of[v_x];
    const _m508_1 = b.made[1];
    const v_R = ruled(b, sp, cl, v_x);
    const _a2604 = cl.region.parts;
    for (let _i2605 = 0; _i2605 < _a2604.length; _i2605++) {
      const v_g = _a2604[_i2605];
      let _c2611: boolean = (v_g === _h2606);
      if (!_c2611) {
        let _q2607 = false;
        Q2608: {
          const _a2609 = v_R;
          for (let _i2610 = 0; _i2610 < _a2609.length; _i2610++) {
            const v_p = _a2609[_i2610];
            if ((cl.region.of[v_p] === v_g)) {
              _q2607 = true;
              break Q2608;
            }
          }
        }
        _c2611 = _q2607;
      }
      if (!(_c2611)) continue;
      const v_S = cl.region.cells[v_g];
      let _g2612 = 0;
      G2613: {
        const _a2614 = v_S;
        for (let _i2615 = 0; _i2615 < _a2614.length; _i2615++) {
          const v_c = _a2614[_i2615];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g2612++;
        }
      }
      let _g2616 = 0;
      G2617: {
        for (let _i2618 = 0; _i2618 < 1; _i2618++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g2616++;
        }
      }
      const v_n = ((cl.stars - _g2612) - _g2616);
      _g2619.length = 0;
      G2620: {
        _g2629.length = 0;
        G2630: {
          const _a2633 = v_S;
          for (let _i2634 = 0; _i2634 < _a2633.length; _i2634++) {
            const v_c = _a2633[_i2634];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g2629.push(v_c);
          }
        }
        const _a2635 = _g2629;
        for (let _i2636 = 0; _i2636 < _a2635.length; _i2636++) {
          const v_c = _a2635[_i2636];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g2619.push(v_c);
        }
      }
      L2637: {
        const v_E = _g2619;
        const _h2649 = v_E.length;
        const _h2661 = (2 * _h2649);
        const _h2662 = (_h2661 - v_n);
        let _c2663: boolean = (v_n > 0);
        if (_c2663) {
          let _q2638 = false;
          Q2639: {
            const _a2640 = v_E;
            const _t2650 = ((2 * _h2649) - v_n);
            const _lo2651 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi2652 = 31 - Math.clz32(b.domain);
            for (const _e2644 of _l2642) _f2641[_e2644] = -1;
            _l2642 = _a2640;
            let _i2646 = 0;
            _s2643[0] = 0;
            let _o2654 = _a2640.length === 0;
            for (;;) {
              if (_a2640.length === 0) {
                if (!_o2654) break;
                _o2654 = false;
              }
              while (_a2640.length > 0 && _i2646 >= 0) {
                const _e2644 = _a2640[_i2646];
                if (_s2643[_i2646] > 0) _f2641[_e2644] = -1;
                let _r2653 = b.domain & ~((2 << _s2643[_i2646]) - 1);
                let _d2645 = 0;
                V2648: for (; _r2653 !== 0; _r2653 &= _r2653 - 1) {
                  _d2645 = 31 - Math.clz32(_r2653 & -_r2653);
                  _f2641[_e2644] = _d2645;
                  {
                    let _t2655 = _d2645;
                    for (let _j2647 = 0; _j2647 < _i2646; _j2647++) _t2655 += _f2641[_a2640[_j2647]];
                    if (_t2655 + (_a2640.length - _i2646 - 1) * _lo2651 > _t2650) continue;
                    if (_t2655 + (_a2640.length - _i2646 - 1) * _hi2652 < _t2650) continue;
                  }
                  for (let _j2647 = 0; _j2647 < _i2646; _j2647++) {
                    const _y2656 = _a2640[_j2647];
                    if (!(!((((_f2641[_e2644] === 1) && (_f2641[_y2656] === 1)) && (sp.adj8[_e2644].includes(_y2656)))))) continue V2648;
                  }
                  break;
                }
                if (_r2653 === 0) {
                  _s2643[_i2646] = 0;
                  _i2646--;
                  continue;
                }
                _s2643[_i2646] = _d2645;
                if (_i2646 === _a2640.length - 1) break;
                _i2646++;
                _s2643[_i2646] = 0;
              }
              if (_i2646 < 0) break;
              let _g2657 = 0;
              G2658: {
                const _a2659 = v_E;
                for (let _i2660 = 0; _i2660 < _a2659.length; _i2660++) {
                  const v_x = _a2659[_i2660];
                  _g2657 += _f2641[v_x];
                }
              }
              if (!((_g2657 === _h2662))) continue;
              if (true) {
                _q2638 = true;
                break Q2639;
              }
            }
          }
          _c2663 = !(_q2638);
        }
        if (!(_c2663)) break L2637;
        let _g2664 = -1;
        G2665: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h2688 = (_h2661 - v_j);
            let _q2666 = false;
            Q2667: {
              const _a2668 = v_E;
              const _t2677 = (_h2661 - v_j);
              const _lo2678 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi2679 = 31 - Math.clz32(b.domain);
              for (const _e2672 of _l2670) _f2669[_e2672] = -1;
              _l2670 = _a2668;
              let _i2674 = 0;
              _s2671[0] = 0;
              let _o2681 = _a2668.length === 0;
              for (;;) {
                if (_a2668.length === 0) {
                  if (!_o2681) break;
                  _o2681 = false;
                }
                while (_a2668.length > 0 && _i2674 >= 0) {
                  const _e2672 = _a2668[_i2674];
                  if (_s2671[_i2674] > 0) _f2669[_e2672] = -1;
                  let _r2680 = b.domain & ~((2 << _s2671[_i2674]) - 1);
                  let _d2673 = 0;
                  V2676: for (; _r2680 !== 0; _r2680 &= _r2680 - 1) {
                    _d2673 = 31 - Math.clz32(_r2680 & -_r2680);
                    _f2669[_e2672] = _d2673;
                    {
                      let _t2682 = _d2673;
                      for (let _j2675 = 0; _j2675 < _i2674; _j2675++) _t2682 += _f2669[_a2668[_j2675]];
                      if (_t2682 + (_a2668.length - _i2674 - 1) * _lo2678 > _t2677) continue;
                      if (_t2682 + (_a2668.length - _i2674 - 1) * _hi2679 < _t2677) continue;
                    }
                    for (let _j2675 = 0; _j2675 < _i2674; _j2675++) {
                      const _y2683 = _a2668[_j2675];
                      if (!(!((((_f2669[_e2672] === 1) && (_f2669[_y2683] === 1)) && (sp.adj8[_e2672].includes(_y2683)))))) continue V2676;
                    }
                    break;
                  }
                  if (_r2680 === 0) {
                    _s2671[_i2674] = 0;
                    _i2674--;
                    continue;
                  }
                  _s2671[_i2674] = _d2673;
                  if (_i2674 === _a2668.length - 1) break;
                  _i2674++;
                  _s2671[_i2674] = 0;
                }
                if (_i2674 < 0) break;
                let _g2684 = 0;
                G2685: {
                  const _a2686 = v_E;
                  for (let _i2687 = 0; _i2687 < _a2686.length; _i2687++) {
                    const v_x = _a2686[_i2687];
                    _g2684 += _f2669[v_x];
                  }
                }
                if (!((_g2684 === _h2688))) continue;
                if (true) {
                  _q2666 = true;
                  break Q2667;
                }
              }
            }
            if (!(_q2666)) continue;
            _g2664 = v_j;
            break G2665;
          }
        }
        const v_room = _g2664;
        _g2689.length = 0;
        G2690: {
          _g2699.length = 0;
          G2700: {
            const _a2703 = v_S;
            for (let _i2704 = 0; _i2704 < _a2703.length; _i2704++) {
              const v_c = _a2703[_i2704];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g2699.push(v_c);
            }
          }
          const _a2705 = _g2699;
          for (let _i2706 = 0; _i2706 < _a2705.length; _i2706++) {
            const v_c = _a2705[_i2706];
            if (!((v_R.includes(v_c)))) continue;
            _g2689.push(v_c);
          }
        }
        const v_Q = _g2689;
        if (b.made[0] !== _m505_0 || b.made[1] !== _m508_1) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          if (!(sameSet(v_R, ruled(b, sp, cl, v_x)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c2711: boolean = (v_g === cl.region.of[v_x]);
          if (!_c2711) {
            let _q2707 = false;
            Q2708: {
              const _a2709 = v_R;
              for (let _i2710 = 0; _i2710 < _a2709.length; _i2710++) {
                const v_p = _a2709[_i2710];
                if ((cl.region.of[v_p] === v_g)) {
                  _q2707 = true;
                  break Q2708;
                }
              }
            }
            _c2711 = _q2707;
          }
          let _g2712 = 0;
          G2713: {
            const _a2714 = v_S;
            for (let _i2715 = 0; _i2715 < _a2714.length; _i2715++) {
              const v_c = _a2714[_i2715];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g2712++;
            }
          }
          let _g2716 = 0;
          G2717: {
            for (let _i2718 = 0; _i2718 < 1; _i2718++) {
              const v_c = v_x;
              if (!((v_S.includes(v_c)))) continue;
              _g2716++;
            }
          }
          const _g2719: number[] = [];
          G2720: {
            const _g2729: number[] = [];
            G2730: {
              const _a2733 = v_S;
              for (let _i2734 = 0; _i2734 < _a2733.length; _i2734++) {
                const v_c = _a2733[_i2734];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g2729.push(v_c);
              }
            }
            const _a2735 = _g2729;
            for (let _i2736 = 0; _i2736 < _a2735.length; _i2736++) {
              const v_c = _a2735[_i2736];
              if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
              _g2719.push(v_c);
            }
          }
          let _c2759: boolean = (v_n > 0);
          if (_c2759) {
            let _q2737 = false;
            Q2738: {
              const _f2740 = new Int32Array(sp.cells.length).fill(-1);
              let _l2741: readonly number[] = [];
              const _s2742: number[] = [];
              const _a2739 = v_E;
              const _t2748 = ((2 * v_E.length) - v_n);
              const _lo2749 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi2750 = 31 - Math.clz32(b.domain);
              for (const _e2743 of _l2741) _f2740[_e2743] = -1;
              _l2741 = _a2739;
              let _i2745 = 0;
              _s2742[0] = 0;
              let _o2752 = _a2739.length === 0;
              for (;;) {
                if (_a2739.length === 0) {
                  if (!_o2752) break;
                  _o2752 = false;
                }
                while (_a2739.length > 0 && _i2745 >= 0) {
                  const _e2743 = _a2739[_i2745];
                  if (_s2742[_i2745] > 0) _f2740[_e2743] = -1;
                  let _r2751 = b.domain & ~((2 << _s2742[_i2745]) - 1);
                  let _d2744 = 0;
                  V2747: for (; _r2751 !== 0; _r2751 &= _r2751 - 1) {
                    _d2744 = 31 - Math.clz32(_r2751 & -_r2751);
                    _f2740[_e2743] = _d2744;
                    {
                      let _t2753 = _d2744;
                      for (let _j2746 = 0; _j2746 < _i2745; _j2746++) _t2753 += _f2740[_a2739[_j2746]];
                      if (_t2753 + (_a2739.length - _i2745 - 1) * _lo2749 > _t2748) continue;
                      if (_t2753 + (_a2739.length - _i2745 - 1) * _hi2750 < _t2748) continue;
                    }
                    for (let _j2746 = 0; _j2746 < _i2745; _j2746++) {
                      const _y2754 = _a2739[_j2746];
                      if (!(!((((_f2740[_e2743] === 1) && (_f2740[_y2754] === 1)) && (sp.adj8[_e2743].includes(_y2754)))))) continue V2747;
                    }
                    break;
                  }
                  if (_r2751 === 0) {
                    _s2742[_i2745] = 0;
                    _i2745--;
                    continue;
                  }
                  _s2742[_i2745] = _d2744;
                  if (_i2745 === _a2739.length - 1) break;
                  _i2745++;
                  _s2742[_i2745] = 0;
                }
                if (_i2745 < 0) break;
                let _g2755 = 0;
                G2756: {
                  const _a2757 = v_E;
                  for (let _i2758 = 0; _i2758 < _a2757.length; _i2758++) {
                    const v_x = _a2757[_i2758];
                    _g2755 += _f2740[v_x];
                  }
                }
                if (!((_g2755 === ((2 * v_E.length) - v_n)))) continue;
                if (true) {
                  _q2737 = true;
                  break Q2738;
                }
              }
            }
            _c2759 = !(_q2737);
          }
          let _g2760 = -1;
          G2761: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              let _q2762 = false;
              Q2763: {
                const _f2765 = new Int32Array(sp.cells.length).fill(-1);
                let _l2766: readonly number[] = [];
                const _s2767: number[] = [];
                const _a2764 = v_E;
                const _t2773 = ((2 * v_E.length) - v_j);
                const _lo2774 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi2775 = 31 - Math.clz32(b.domain);
                for (const _e2768 of _l2766) _f2765[_e2768] = -1;
                _l2766 = _a2764;
                let _i2770 = 0;
                _s2767[0] = 0;
                let _o2777 = _a2764.length === 0;
                for (;;) {
                  if (_a2764.length === 0) {
                    if (!_o2777) break;
                    _o2777 = false;
                  }
                  while (_a2764.length > 0 && _i2770 >= 0) {
                    const _e2768 = _a2764[_i2770];
                    if (_s2767[_i2770] > 0) _f2765[_e2768] = -1;
                    let _r2776 = b.domain & ~((2 << _s2767[_i2770]) - 1);
                    let _d2769 = 0;
                    V2772: for (; _r2776 !== 0; _r2776 &= _r2776 - 1) {
                      _d2769 = 31 - Math.clz32(_r2776 & -_r2776);
                      _f2765[_e2768] = _d2769;
                      {
                        let _t2778 = _d2769;
                        for (let _j2771 = 0; _j2771 < _i2770; _j2771++) _t2778 += _f2765[_a2764[_j2771]];
                        if (_t2778 + (_a2764.length - _i2770 - 1) * _lo2774 > _t2773) continue;
                        if (_t2778 + (_a2764.length - _i2770 - 1) * _hi2775 < _t2773) continue;
                      }
                      for (let _j2771 = 0; _j2771 < _i2770; _j2771++) {
                        const _y2779 = _a2764[_j2771];
                        if (!(!((((_f2765[_e2768] === 1) && (_f2765[_y2779] === 1)) && (sp.adj8[_e2768].includes(_y2779)))))) continue V2772;
                      }
                      break;
                    }
                    if (_r2776 === 0) {
                      _s2767[_i2770] = 0;
                      _i2770--;
                      continue;
                    }
                    _s2767[_i2770] = _d2769;
                    if (_i2770 === _a2764.length - 1) break;
                    _i2770++;
                    _s2767[_i2770] = 0;
                  }
                  if (_i2770 < 0) break;
                  let _g2780 = 0;
                  G2781: {
                    const _a2782 = v_E;
                    for (let _i2783 = 0; _i2783 < _a2782.length; _i2783++) {
                      const v_x = _a2782[_i2783];
                      _g2780 += _f2765[v_x];
                    }
                  }
                  if (!((_g2780 === ((2 * v_E.length) - v_j)))) continue;
                  if (true) {
                    _q2762 = true;
                    break Q2763;
                  }
                }
              }
              if (!(_q2762)) continue;
              _g2760 = v_j;
              break G2761;
            }
          }
          const _g2784: number[] = [];
          G2785: {
            const _g2794: number[] = [];
            G2795: {
              const _a2798 = v_S;
              for (let _i2799 = 0; _i2799 < _a2798.length; _i2799++) {
                const v_c = _a2798[_i2799];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g2794.push(v_c);
              }
            }
            const _a2800 = _g2794;
            for (let _i2801 = 0; _i2801 < _a2800.length; _i2801++) {
              const v_c = _a2800[_i2801];
              if (!((v_R.includes(v_c)))) continue;
              _g2784.push(v_c);
            }
          }
          freshBinding("starvedRegion", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), sameSet(v_R, ruled(b, sp, cl, v_x)), (cl.region.parts.includes(v_g)), _c2711, sameSet(v_S, cl.region.cells[v_g]), (v_n === ((cl.stars - _g2712) - _g2716)), sameSet(v_E, _g2719), _c2759, (v_room === _g2760), sameSet(v_Q, _g2784)], ["x in", "where of x", "R =", "g in", "where of g", "S =", "n =", "E =", "where of E", "room =", "Q ="]);
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
  const _g177: number[] = [];
  G178: {
    const _a181 = sp.cells;
    for (let _i182 = 0; _i182 < _a181.length; _i182++) {
      const v_c = _a181[_i182];
      if (!(((v_a <= (((1 - v_dir) * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w)))) && ((((1 - v_dir) * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w))) < (v_a + v_k))))) continue;
      _g177.push(v_c);
    }
  }
  const _made = _g177;
  _kept2[v_a] = _made;
  return _made;
}

const ruledKept = keptStore<readonly number[]>();

/** `ruled(x)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ruled(b: Marks, sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  const _kept: Kept<readonly number[]> = ruledKept.marks(b);
  if (_kept[v_x] !== undefined) return _kept[v_x];
  const _g2153: number[] = [];
  G2154: {
    const _a2179 = sp.cells;
    for (let _i2180 = 0; _i2180 < _a2179.length; _i2180++) {
      const v_p = _a2179[_i2180];
      let _c2202: boolean = (!((b.grid[v_p] !== 0)) && (v_p !== v_x));
      if (_c2202) {
        let _c2187: boolean = (sp.adj8[v_x].includes(v_p));
        if (!_c2187) {
          let _c2186: boolean = (sp.rowOf[v_p] === sp.rowOf[v_x]);
          if (_c2186) {
            const _t2181 = sp.lineCells[sp.rowOf[v_x]];
            let _g2182 = 0;
            G2183: {
              const _a2184 = _t2181;
              for (let _i2185 = 0; _i2185 < _a2184.length; _i2185++) {
                const v_c = _a2184[_i2185];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g2182++;
              }
            }
            _c2186 = ((cl.stars - _g2182) === 1);
          }
          _c2187 = _c2186;
        }
        let _c2194: boolean = _c2187;
        if (!_c2194) {
          let _c2193: boolean = (sp.colOf[v_p] === sp.colOf[v_x]);
          if (_c2193) {
            const _t2188 = sp.lineCells[sp.colOf[v_x]];
            let _g2189 = 0;
            G2190: {
              const _a2191 = _t2188;
              for (let _i2192 = 0; _i2192 < _a2191.length; _i2192++) {
                const v_c = _a2191[_i2192];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g2189++;
              }
            }
            _c2193 = ((cl.stars - _g2189) === 1);
          }
          _c2194 = _c2193;
        }
        let _c2201: boolean = _c2194;
        if (!_c2201) {
          let _c2200: boolean = (cl.region.of[v_p] === cl.region.of[v_x]);
          if (_c2200) {
            const _t2195 = cl.region.cells[cl.region.of[v_x]];
            let _g2196 = 0;
            G2197: {
              const _a2198 = _t2195;
              for (let _i2199 = 0; _i2199 < _a2198.length; _i2199++) {
                const v_c = _a2198[_i2199];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g2196++;
              }
            }
            _c2200 = ((cl.stars - _g2196) === 1);
          }
          _c2201 = _c2200;
        }
        _c2202 = _c2201;
      }
      if (!(_c2202)) continue;
      _g2153.push(v_p);
    }
  }
  const _made = _g2153;
  _kept[v_x] = _made;
  return _made;
}
