// Compiled by `npm run describe` from src/games/starbattle/starbattle.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, cellsValued, keptStore, minus, rangeMask, sameSet, setOf, type Kept } from "../../engine/describe-runtime.ts";

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
  let _q1978 = true;
  Q1979: {
    const _a1980 = sp.lines;
    for (let _i1981 = 0; _i1981 < _a1980.length; _i1981++) {
      const v_L = _a1980[_i1981];
      let _g1982 = 0;
      G1983: {
        const _a1984 = sp.lineCells[v_L];
        for (let _i1985 = 0; _i1985 < _a1984.length; _i1985++) {
          const v_c = _a1984[_i1985];
          const _h1986 = (g[v_c] || -1);
          if (!((_h1986 === 1))) continue;
          _g1982++;
        }
      }
      if (!((_g1982 === cl.stars))) {
        _q1978 = false;
        break Q1979;
      }
    }
  }
  if (!(_q1978)) return false;
  let _q1987 = true;
  Q1988: {
    const _a1989 = cl.region.parts;
    for (let _i1990 = 0; _i1990 < _a1989.length; _i1990++) {
      const v_r = _a1989[_i1990];
      let _g1991 = 0;
      G1992: {
        const _a1993 = cl.region.cells[v_r];
        for (let _i1994 = 0; _i1994 < _a1993.length; _i1994++) {
          const v_c = _a1993[_i1994];
          const _h1995 = (g[v_c] || -1);
          if (!((_h1995 === 1))) continue;
          _g1991++;
        }
      }
      if (!((_g1991 === cl.stars))) {
        _q1987 = false;
        break Q1988;
      }
    }
  }
  if (!(_q1987)) return false;
  let _q1996 = true;
  Q1997: {
    const _a1998 = sp.cells;
    for (let _i1999 = 0; _i1999 < _a1998.length; _i1999++) {
      const v_a = _a1998[_i1999];
      const _h2000 = (g[v_a] || -1);
      if (!((_h2000 === 1))) continue;
      let _q2001 = true;
      Q2002: {
        const _a2003 = sp.adj8[v_a];
        for (let _i2004 = 0; _i2004 < _a2003.length; _i2004++) {
          const v_b = _a2003[_i2004];
          const _h2005 = (g[v_b] || -1);
          if (!((_h2005 !== 1))) {
            _q2001 = false;
            break Q2002;
          }
        }
      }
      if (!(_q2001)) {
        _q1996 = false;
        break Q1997;
      }
    }
  }
  if (!(_q1996)) return false;
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
  const _g33: number[] = [];
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
      facts.length = 0;
      changed = false;
      let _c41: boolean = (v_n === 0);
      if (_c41) {
        let _q30 = true;
        Q31: {
          const _t32 = sp.lineCells[v_L];
          _g33.length = 0;
          G34: {
            const _a37 = _t32;
            for (let _i38 = 0; _i38 < _a37.length; _i38++) {
              const v_c = _a37[_i38];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g33.push(v_c);
            }
          }
          const _a39 = _g33;
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_c = _a39[_i40];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
            if (!(true)) {
              _q30 = false;
              break Q31;
            }
          }
        }
        _c41 = _q30;
      }
      if (!(_c41)) return -1;
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
  const _g61: number[] = [];
  const facts = fullRegionFacts;
  let fired = 0;
  let changed = false;
  const _a50 = cl.region.parts;
  for (let _i51 = 0; _i51 < _a50.length; _i51++) {
    const v_r = _a50[_i51];
    const _t52 = cl.region.cells[v_r];
    let _g53 = 0;
    G54: {
      const _a55 = _t52;
      for (let _i56 = 0; _i56 < _a55.length; _i56++) {
        const v_c = _a55[_i56];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g53++;
      }
    }
    L57: {
      const v_n = (cl.stars - _g53);
      if (!((v_n <= 0))) break L57;
      facts.length = 0;
      changed = false;
      let _c69: boolean = (v_n === 0);
      if (_c69) {
        let _q58 = true;
        Q59: {
          const _t60 = cl.region.cells[v_r];
          _g61.length = 0;
          G62: {
            const _a65 = _t60;
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_c = _a65[_i66];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g61.push(v_c);
            }
          }
          const _a67 = _g61;
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_c = _a67[_i68];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
            if (!(true)) {
              _q58 = false;
              break Q59;
            }
          }
        }
        _c69 = _q58;
      }
      if (!(_c69)) return -1;
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
  const _g93: number[] = [];
  const facts = exactLineFacts;
  let fired = 0;
  let changed = false;
  const _a85 = sp.lines;
  for (let _i86 = 0; _i86 < _a85.length; _i86++) {
    const v_L = _a85[_i86];
    const _t87 = sp.lineCells[v_L];
    let _g88 = 0;
    G89: {
      const _a90 = _t87;
      for (let _i91 = 0; _i91 < _a90.length; _i91++) {
        const v_c = _a90[_i91];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g88++;
      }
    }
    const v_n = (cl.stars - _g88);
    const _t92 = sp.lineCells[v_L];
    _g93.length = 0;
    G94: {
      const _a97 = _t92;
      for (let _i98 = 0; _i98 < _a97.length; _i98++) {
        const v_c = _a97[_i98];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g93.push(v_c);
      }
    }
    L99: {
      const v_O = _g93;
      const _h100 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h100)))) break L99;
      facts.length = 0;
      changed = false;
      let _c105: boolean = (v_n === _h100);
      if (_c105) {
        let _q101 = true;
        Q102: {
          const _a103 = v_O;
          for (let _i104 = 0; _i104 < _a103.length; _i104++) {
            const v_c = _a103[_i104];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q101 = false;
              break Q102;
            }
          }
        }
        _c105 = _q101;
      }
      if (!(_c105)) return -1;
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
  const _g129: number[] = [];
  const facts = exactRegionFacts;
  let fired = 0;
  let changed = false;
  const _a121 = cl.region.parts;
  for (let _i122 = 0; _i122 < _a121.length; _i122++) {
    const v_r = _a121[_i122];
    const _t123 = cl.region.cells[v_r];
    let _g124 = 0;
    G125: {
      const _a126 = _t123;
      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
        const v_c = _a126[_i127];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g124++;
      }
    }
    const v_n = (cl.stars - _g124);
    const _t128 = cl.region.cells[v_r];
    _g129.length = 0;
    G130: {
      const _a133 = _t128;
      for (let _i134 = 0; _i134 < _a133.length; _i134++) {
        const v_c = _a133[_i134];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g129.push(v_c);
      }
    }
    L135: {
      const v_O = _g129;
      const _h136 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h136)))) break L135;
      facts.length = 0;
      changed = false;
      let _c141: boolean = (v_n === _h136);
      if (_c141) {
        let _q137 = true;
        Q138: {
          const _a139 = v_O;
          for (let _i140 = 0; _i140 < _a139.length; _i140++) {
            const v_c = _a139[_i140];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q137 = false;
              break Q138;
            }
          }
        }
        _c141 = _q137;
      }
      if (!(_c141)) return -1;
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
  const _g298: number[] = [];
  const _g343: number[] = [];
  const _g361: number[] = [];
  const _g406: number[] = [];
  const _g426: number[] = [];
  const _g438: number[] = [];
  const _g453: number[] = [];
  const facts = confinedFacts;
  let fired = 0;
  let changed = false;
  const _h292 = (sp.w - 1);
  for (let v_dir = 0; v_dir <= 1; v_dir++) {
    for (let v_a = 0; v_a <= _h292; v_a++) {
      const v_B = band(sp, 1, v_dir, v_a);
      let _g293 = 0;
      G294: {
        const _a295 = v_B;
        for (let _i296 = 0; _i296 < _a295.length; _i296++) {
          const v_c = _a295[_i296];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g293++;
        }
      }
      L297: {
        const v_n = (cl.stars - _g293);
        if (!((v_n > 0))) break L297;
        _g298.length = 0;
        G299: {
          const _a326 = cl.region.parts;
          for (let _i327 = 0; _i327 < _a326.length; _i327++) {
            const v_r = _a326[_i327];
            const _t328 = cl.region.cells[v_r];
            let _g329 = 0;
            G330: {
              const _a331 = _t328;
              for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                const v_c = _a331[_i332];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g329++;
              }
            }
            let _c351: boolean = ((cl.stars - _g329) > 0);
            if (_c351) {
              let _q340 = true;
              Q341: {
                const _t342 = cl.region.cells[v_r];
                _g343.length = 0;
                G344: {
                  const _a347 = _t342;
                  for (let _i348 = 0; _i348 < _a347.length; _i348++) {
                    const v_c = _a347[_i348];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g343.push(v_c);
                  }
                }
                const _a349 = _g343;
                for (let _i350 = 0; _i350 < _a349.length; _i350++) {
                  const v_c = _a349[_i350];
                  if (!((v_B.includes(v_c)))) {
                    _q340 = false;
                    break Q341;
                  }
                }
              }
              _c351 = _q340;
            }
            if (!(_c351)) continue;
            _g298.push(v_r);
          }
        }
        const v_I = _g298;
        let _g352 = 0;
        G353: {
          const _a354 = v_I;
          for (let _i355 = 0; _i355 < _a354.length; _i355++) {
            const v_r = _a354[_i355];
            const _t356 = cl.region.cells[v_r];
            let _g357 = 0;
            G358: {
              const _a359 = _t356;
              for (let _i360 = 0; _i360 < _a359.length; _i360++) {
                const v_c = _a359[_i360];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g357++;
              }
            }
            _g352 += (cl.stars - _g357);
          }
        }
        const v_mi = _g352;
        _g361.length = 0;
        G362: {
          const _a389 = cl.region.parts;
          for (let _i390 = 0; _i390 < _a389.length; _i390++) {
            const v_r = _a389[_i390];
            const _t391 = cl.region.cells[v_r];
            let _g392 = 0;
            G393: {
              const _a394 = _t391;
              for (let _i395 = 0; _i395 < _a394.length; _i395++) {
                const v_c = _a394[_i395];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g392++;
              }
            }
            let _c414: boolean = ((cl.stars - _g392) > 0);
            if (_c414) {
              let _q403 = false;
              Q404: {
                const _t405 = cl.region.cells[v_r];
                _g406.length = 0;
                G407: {
                  const _a410 = _t405;
                  for (let _i411 = 0; _i411 < _a410.length; _i411++) {
                    const v_c = _a410[_i411];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g406.push(v_c);
                  }
                }
                const _a412 = _g406;
                for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                  const v_c = _a412[_i413];
                  if ((v_B.includes(v_c))) {
                    _q403 = true;
                    break Q404;
                  }
                }
              }
              _c414 = _q403;
            }
            if (!(_c414)) continue;
            _g361.push(v_r);
          }
        }
        const v_R = _g361;
        let _g415 = 0;
        G416: {
          const _a417 = v_R;
          for (let _i418 = 0; _i418 < _a417.length; _i418++) {
            const v_r = _a417[_i418];
            const _t419 = cl.region.cells[v_r];
            let _g420 = 0;
            G421: {
              const _a422 = _t419;
              for (let _i423 = 0; _i423 < _a422.length; _i423++) {
                const v_c = _a422[_i423];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g420++;
              }
            }
            _g415 += (cl.stars - _g420);
          }
        }
        const v_mr = _g415;
        let _c434: boolean = (v_mi === v_n);
        if (_c434) {
          let _q424 = false;
          Q425: {
            _g426.length = 0;
            G427: {
              const _a430 = v_B;
              for (let _i431 = 0; _i431 < _a430.length; _i431++) {
                const v_c = _a430[_i431];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g426.push(v_c);
              }
            }
            const _a432 = _g426;
            for (let _i433 = 0; _i433 < _a432.length; _i433++) {
              const v_c = _a432[_i433];
              if (!(v_I.includes(cl.region.of[v_c]))) {
                _q424 = true;
                break Q425;
              }
            }
          }
          _c434 = _q424;
        }
        L435: {
          const v_lines = _c434;
          if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L435;
          facts.length = 0;
          changed = false;
          let _c447: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
          if (_c447) {
            let _c446: boolean = !(v_lines);
            if (!_c446) {
              let _q436 = true;
              Q437: {
                _g438.length = 0;
                G439: {
                  const _a442 = v_B;
                  for (let _i443 = 0; _i443 < _a442.length; _i443++) {
                    const v_c = _a442[_i443];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g438.push(v_c);
                  }
                }
                const _a444 = _g438;
                for (let _i445 = 0; _i445 < _a444.length; _i445++) {
                  const v_c = _a444[_i445];
                  if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                  if (!(true)) {
                    _q436 = false;
                    break Q437;
                  }
                }
              }
              _c446 = _q436;
            }
            _c447 = _c446;
          }
          let _c462: boolean = _c447;
          if (_c462) {
            let _c461: boolean = (v_lines || (v_mr > v_n));
            if (!_c461) {
              let _q448 = true;
              Q449: {
                const _a450 = v_R;
                for (let _i451 = 0; _i451 < _a450.length; _i451++) {
                  const v_r = _a450[_i451];
                  const _t452 = cl.region.cells[v_r];
                  _g453.length = 0;
                  G454: {
                    const _a457 = _t452;
                    for (let _i458 = 0; _i458 < _a457.length; _i458++) {
                      const v_c = _a457[_i458];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g453.push(v_c);
                    }
                  }
                  const _a459 = _g453;
                  for (let _i460 = 0; _i460 < _a459.length; _i460++) {
                    const v_c = _a459[_i460];
                    if (!(!(v_B.includes(v_c)))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q448 = false;
                      break Q449;
                    }
                  }
                }
              }
              _c461 = _q448;
            }
            _c462 = _c461;
          }
          if (!(_c462)) return -1;
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
let _f548 = new Int32Array(0);
let _l549: readonly number[] = [];
let _f575 = new Int32Array(0);
let _l576: readonly number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function neededLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededLineBinding> | null): number {
  const _g535: number[] = [];
  if (_f548.length < sp.cells.length) _f548 = new Int32Array(sp.cells.length).fill(-1);
  else _f548.fill(-1);
  _l549 = [];
  const _s550: number[] = [];
  if (_f575.length < sp.cells.length) _f575 = new Int32Array(sp.cells.length).fill(-1);
  else _f575.fill(-1);
  _l576 = [];
  const _s577: number[] = [];
  const _g601: number[] = [];
  const facts = neededLineFacts;
  let fired = 0;
  let changed = false;
  const _a527 = sp.lines;
  R1:
  for (let _i528 = 0; _i528 < _a527.length; _i528++) {
    const v_L = _a527[_i528];
    const _m182_0 = b.made[0];
    const _t529 = sp.lineCells[v_L];
    let _g530 = 0;
    G531: {
      const _a532 = _t529;
      for (let _i533 = 0; _i533 < _a532.length; _i533++) {
        const v_c = _a532[_i533];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g530++;
      }
    }
    const v_n = (cl.stars - _g530);
    const _t534 = sp.lineCells[v_L];
    _g535.length = 0;
    G536: {
      const _a539 = _t534;
      for (let _i540 = 0; _i540 < _a539.length; _i540++) {
        const v_c = _a539[_i540];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g535.push(v_c);
      }
    }
    L541: {
      const v_O = _g535;
      if (!((v_n > 0))) break L541;
      const _a542 = v_O;
      for (let _i543 = 0; _i543 < _a542.length; _i543++) {
        const v_x = _a542[_i543];
        L544: {
          const v_E = minus(v_O, setOf(v_x));
          const _h556 = v_E.length;
          const _h568 = (2 * _h556);
          const _h569 = (_h568 - v_n);
          let _q545 = false;
          Q546: {
            const _a547 = v_E;
            const _t557 = ((2 * _h556) - v_n);
            const _lo558 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi559 = 31 - Math.clz32(b.domain);
            for (const _e551 of _l549) _f548[_e551] = -1;
            _l549 = _a547;
            let _i553 = 0;
            _s550[0] = 0;
            let _o561 = _a547.length === 0;
            for (;;) {
              if (_a547.length === 0) {
                if (!_o561) break;
                _o561 = false;
              }
              while (_a547.length > 0 && _i553 >= 0) {
                const _e551 = _a547[_i553];
                if (_s550[_i553] > 0) _f548[_e551] = -1;
                let _r560 = b.domain & ~((2 << _s550[_i553]) - 1);
                let _d552 = 0;
                V555: for (; _r560 !== 0; _r560 &= _r560 - 1) {
                  _d552 = 31 - Math.clz32(_r560 & -_r560);
                  _f548[_e551] = _d552;
                  {
                    let _t562 = _d552;
                    for (let _j554 = 0; _j554 < _i553; _j554++) _t562 += _f548[_a547[_j554]];
                    if (_t562 + (_a547.length - _i553 - 1) * _lo558 > _t557) continue;
                    if (_t562 + (_a547.length - _i553 - 1) * _hi559 < _t557) continue;
                  }
                  for (let _j554 = 0; _j554 < _i553; _j554++) {
                    const _y563 = _a547[_j554];
                    if (!(!((((_f548[_e551] === 1) && (_f548[_y563] === 1)) && (sp.adj8[_e551].includes(_y563)))))) continue V555;
                  }
                  break;
                }
                if (_r560 === 0) {
                  _s550[_i553] = 0;
                  _i553--;
                  continue;
                }
                _s550[_i553] = _d552;
                if (_i553 === _a547.length - 1) break;
                _i553++;
                _s550[_i553] = 0;
              }
              if (_i553 < 0) break;
              let _g564 = 0;
              G565: {
                const _a566 = v_E;
                for (let _i567 = 0; _i567 < _a566.length; _i567++) {
                  const v_x = _a566[_i567];
                  _g564 += _f548[v_x];
                }
              }
              if (!((_g564 === _h569))) continue;
              if (true) {
                _q545 = true;
                break Q546;
              }
            }
          }
          if (!(!(_q545))) break L544;
          let _g570 = -1;
          G571: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h594 = (_h568 - v_j);
              let _q572 = false;
              Q573: {
                const _a574 = v_E;
                const _t583 = (_h568 - v_j);
                const _lo584 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi585 = 31 - Math.clz32(b.domain);
                for (const _e578 of _l576) _f575[_e578] = -1;
                _l576 = _a574;
                let _i580 = 0;
                _s577[0] = 0;
                let _o587 = _a574.length === 0;
                for (;;) {
                  if (_a574.length === 0) {
                    if (!_o587) break;
                    _o587 = false;
                  }
                  while (_a574.length > 0 && _i580 >= 0) {
                    const _e578 = _a574[_i580];
                    if (_s577[_i580] > 0) _f575[_e578] = -1;
                    let _r586 = b.domain & ~((2 << _s577[_i580]) - 1);
                    let _d579 = 0;
                    V582: for (; _r586 !== 0; _r586 &= _r586 - 1) {
                      _d579 = 31 - Math.clz32(_r586 & -_r586);
                      _f575[_e578] = _d579;
                      {
                        let _t588 = _d579;
                        for (let _j581 = 0; _j581 < _i580; _j581++) _t588 += _f575[_a574[_j581]];
                        if (_t588 + (_a574.length - _i580 - 1) * _lo584 > _t583) continue;
                        if (_t588 + (_a574.length - _i580 - 1) * _hi585 < _t583) continue;
                      }
                      for (let _j581 = 0; _j581 < _i580; _j581++) {
                        const _y589 = _a574[_j581];
                        if (!(!((((_f575[_e578] === 1) && (_f575[_y589] === 1)) && (sp.adj8[_e578].includes(_y589)))))) continue V582;
                      }
                      break;
                    }
                    if (_r586 === 0) {
                      _s577[_i580] = 0;
                      _i580--;
                      continue;
                    }
                    _s577[_i580] = _d579;
                    if (_i580 === _a574.length - 1) break;
                    _i580++;
                    _s577[_i580] = 0;
                  }
                  if (_i580 < 0) break;
                  let _g590 = 0;
                  G591: {
                    const _a592 = v_E;
                    for (let _i593 = 0; _i593 < _a592.length; _i593++) {
                      const v_x = _a592[_i593];
                      _g590 += _f575[v_x];
                    }
                  }
                  if (!((_g590 === _h594))) continue;
                  if (true) {
                    _q572 = true;
                    break Q573;
                  }
                }
              }
              if (!(_q572)) continue;
              _g570 = v_j;
              break G571;
            }
          }
          const v_room = _g570;
          if (b.made[0] !== _m182_0) {
            const _t595 = sp.lineCells[v_L];
            let _g596 = 0;
            G597: {
              const _a598 = _t595;
              for (let _i599 = 0; _i599 < _a598.length; _i599++) {
                const v_c = _a598[_i599];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g596++;
              }
            }
            if (!((v_n === (cl.stars - _g596)))) { continue R1; }
            const _t600 = sp.lineCells[v_L];
            _g601.length = 0;
            G602: {
              const _a605 = _t600;
              for (let _i606 = 0; _i606 < _a605.length; _i606++) {
                const v_c = _a605[_i606];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g601.push(v_c);
              }
            }
            if (!(sameSet(v_O, _g601))) { continue R1; }
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
let _f692 = new Int32Array(0);
let _l693: readonly number[] = [];
let _f719 = new Int32Array(0);
let _l720: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function neededRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededRegionBinding> | null): number {
  const _g679: number[] = [];
  if (_f692.length < sp.cells.length) _f692 = new Int32Array(sp.cells.length).fill(-1);
  else _f692.fill(-1);
  _l693 = [];
  const _s694: number[] = [];
  if (_f719.length < sp.cells.length) _f719 = new Int32Array(sp.cells.length).fill(-1);
  else _f719.fill(-1);
  _l720 = [];
  const _s721: number[] = [];
  const _g745: number[] = [];
  const facts = neededRegionFacts;
  let fired = 0;
  let changed = false;
  const _a671 = cl.region.parts;
  R1:
  for (let _i672 = 0; _i672 < _a671.length; _i672++) {
    const v_r = _a671[_i672];
    const _m222_0 = b.made[0];
    const _t673 = cl.region.cells[v_r];
    let _g674 = 0;
    G675: {
      const _a676 = _t673;
      for (let _i677 = 0; _i677 < _a676.length; _i677++) {
        const v_c = _a676[_i677];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g674++;
      }
    }
    const v_n = (cl.stars - _g674);
    const _t678 = cl.region.cells[v_r];
    _g679.length = 0;
    G680: {
      const _a683 = _t678;
      for (let _i684 = 0; _i684 < _a683.length; _i684++) {
        const v_c = _a683[_i684];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g679.push(v_c);
      }
    }
    L685: {
      const v_O = _g679;
      if (!((v_n > 0))) break L685;
      const _a686 = v_O;
      for (let _i687 = 0; _i687 < _a686.length; _i687++) {
        const v_x = _a686[_i687];
        L688: {
          const v_E = minus(v_O, setOf(v_x));
          const _h700 = v_E.length;
          const _h712 = (2 * _h700);
          const _h713 = (_h712 - v_n);
          let _q689 = false;
          Q690: {
            const _a691 = v_E;
            const _t701 = ((2 * _h700) - v_n);
            const _lo702 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi703 = 31 - Math.clz32(b.domain);
            for (const _e695 of _l693) _f692[_e695] = -1;
            _l693 = _a691;
            let _i697 = 0;
            _s694[0] = 0;
            let _o705 = _a691.length === 0;
            for (;;) {
              if (_a691.length === 0) {
                if (!_o705) break;
                _o705 = false;
              }
              while (_a691.length > 0 && _i697 >= 0) {
                const _e695 = _a691[_i697];
                if (_s694[_i697] > 0) _f692[_e695] = -1;
                let _r704 = b.domain & ~((2 << _s694[_i697]) - 1);
                let _d696 = 0;
                V699: for (; _r704 !== 0; _r704 &= _r704 - 1) {
                  _d696 = 31 - Math.clz32(_r704 & -_r704);
                  _f692[_e695] = _d696;
                  {
                    let _t706 = _d696;
                    for (let _j698 = 0; _j698 < _i697; _j698++) _t706 += _f692[_a691[_j698]];
                    if (_t706 + (_a691.length - _i697 - 1) * _lo702 > _t701) continue;
                    if (_t706 + (_a691.length - _i697 - 1) * _hi703 < _t701) continue;
                  }
                  for (let _j698 = 0; _j698 < _i697; _j698++) {
                    const _y707 = _a691[_j698];
                    if (!(!((((_f692[_e695] === 1) && (_f692[_y707] === 1)) && (sp.adj8[_e695].includes(_y707)))))) continue V699;
                  }
                  break;
                }
                if (_r704 === 0) {
                  _s694[_i697] = 0;
                  _i697--;
                  continue;
                }
                _s694[_i697] = _d696;
                if (_i697 === _a691.length - 1) break;
                _i697++;
                _s694[_i697] = 0;
              }
              if (_i697 < 0) break;
              let _g708 = 0;
              G709: {
                const _a710 = v_E;
                for (let _i711 = 0; _i711 < _a710.length; _i711++) {
                  const v_x = _a710[_i711];
                  _g708 += _f692[v_x];
                }
              }
              if (!((_g708 === _h713))) continue;
              if (true) {
                _q689 = true;
                break Q690;
              }
            }
          }
          if (!(!(_q689))) break L688;
          let _g714 = -1;
          G715: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h738 = (_h712 - v_j);
              let _q716 = false;
              Q717: {
                const _a718 = v_E;
                const _t727 = (_h712 - v_j);
                const _lo728 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi729 = 31 - Math.clz32(b.domain);
                for (const _e722 of _l720) _f719[_e722] = -1;
                _l720 = _a718;
                let _i724 = 0;
                _s721[0] = 0;
                let _o731 = _a718.length === 0;
                for (;;) {
                  if (_a718.length === 0) {
                    if (!_o731) break;
                    _o731 = false;
                  }
                  while (_a718.length > 0 && _i724 >= 0) {
                    const _e722 = _a718[_i724];
                    if (_s721[_i724] > 0) _f719[_e722] = -1;
                    let _r730 = b.domain & ~((2 << _s721[_i724]) - 1);
                    let _d723 = 0;
                    V726: for (; _r730 !== 0; _r730 &= _r730 - 1) {
                      _d723 = 31 - Math.clz32(_r730 & -_r730);
                      _f719[_e722] = _d723;
                      {
                        let _t732 = _d723;
                        for (let _j725 = 0; _j725 < _i724; _j725++) _t732 += _f719[_a718[_j725]];
                        if (_t732 + (_a718.length - _i724 - 1) * _lo728 > _t727) continue;
                        if (_t732 + (_a718.length - _i724 - 1) * _hi729 < _t727) continue;
                      }
                      for (let _j725 = 0; _j725 < _i724; _j725++) {
                        const _y733 = _a718[_j725];
                        if (!(!((((_f719[_e722] === 1) && (_f719[_y733] === 1)) && (sp.adj8[_e722].includes(_y733)))))) continue V726;
                      }
                      break;
                    }
                    if (_r730 === 0) {
                      _s721[_i724] = 0;
                      _i724--;
                      continue;
                    }
                    _s721[_i724] = _d723;
                    if (_i724 === _a718.length - 1) break;
                    _i724++;
                    _s721[_i724] = 0;
                  }
                  if (_i724 < 0) break;
                  let _g734 = 0;
                  G735: {
                    const _a736 = v_E;
                    for (let _i737 = 0; _i737 < _a736.length; _i737++) {
                      const v_x = _a736[_i737];
                      _g734 += _f719[v_x];
                    }
                  }
                  if (!((_g734 === _h738))) continue;
                  if (true) {
                    _q716 = true;
                    break Q717;
                  }
                }
              }
              if (!(_q716)) continue;
              _g714 = v_j;
              break G715;
            }
          }
          const v_room = _g714;
          if (b.made[0] !== _m222_0) {
            const _t739 = cl.region.cells[v_r];
            let _g740 = 0;
            G741: {
              const _a742 = _t739;
              for (let _i743 = 0; _i743 < _a742.length; _i743++) {
                const v_c = _a742[_i743];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g740++;
              }
            }
            if (!((v_n === (cl.stars - _g740)))) { continue R1; }
            const _t744 = cl.region.cells[v_r];
            _g745.length = 0;
            G746: {
              const _a749 = _t744;
              for (let _i750 = 0; _i750 < _a749.length; _i750++) {
                const v_c = _a749[_i750];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g745.push(v_c);
              }
            }
            if (!(sameSet(v_O, _g745))) { continue R1; }
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
let _f903 = new Int32Array(0);
let _l904: readonly number[] = [];
let _f931 = new Int32Array(0);
let _l932: readonly number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function crowdedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedLineBinding> | null): number {
  const _g859: number[] = [];
  const _g881: number[] = [];
  const _g891: number[] = [];
  if (_f903.length < sp.cells.length) _f903 = new Int32Array(sp.cells.length).fill(-1);
  else _f903.fill(-1);
  _l904 = [];
  const _s905: number[] = [];
  if (_f931.length < sp.cells.length) _f931 = new Int32Array(sp.cells.length).fill(-1);
  else _f931.fill(-1);
  _l932 = [];
  const _s933: number[] = [];
  const _g951: number[] = [];
  const _g961: number[] = [];
  const _g969: number[] = [];
  const facts = crowdedLineFacts;
  let fired = 0;
  let changed = false;
  const _a857 = sp.cells;
  R1:
  for (let _i858 = 0; _i858 < _a857.length; _i858++) {
    const v_x = _a857[_i858];
    const _m260_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h867 = sp.rowOf[v_x];
    const _h868 = sp.colOf[v_x];
    _g859.length = 0;
    G860: {
      const _a863 = sp.adj8[v_x];
      for (let _i864 = 0; _i864 < _a863.length; _i864++) {
        const v_p = _a863[_i864];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g859.push(v_p);
      }
    }
    const v_R = _g859;
    const _a865 = sp.lines;
    for (let _i866 = 0; _i866 < _a865.length; _i866++) {
      const v_L = _a865[_i866];
      let _c873: boolean = ((v_L === _h867) || (v_L === _h868));
      if (!_c873) {
        let _q869 = false;
        Q870: {
          const _a871 = v_R;
          for (let _i872 = 0; _i872 < _a871.length; _i872++) {
            const v_p = _a871[_i872];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q869 = true;
              break Q870;
            }
          }
        }
        _c873 = _q869;
      }
      if (!(_c873)) continue;
      const v_S = sp.lineCells[v_L];
      let _g874 = 0;
      G875: {
        const _a876 = v_S;
        for (let _i877 = 0; _i877 < _a876.length; _i877++) {
          const v_c = _a876[_i877];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g874++;
        }
      }
      let _g878 = 0;
      G879: {
        for (let _i880 = 0; _i880 < 1; _i880++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g878++;
        }
      }
      const v_n = ((cl.stars - _g874) - _g878);
      _g881.length = 0;
      G882: {
        _g891.length = 0;
        G892: {
          const _a895 = v_S;
          for (let _i896 = 0; _i896 < _a895.length; _i896++) {
            const v_c = _a895[_i896];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g891.push(v_c);
          }
        }
        const _a897 = _g891;
        for (let _i898 = 0; _i898 < _a897.length; _i898++) {
          const v_c = _a897[_i898];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g881.push(v_c);
        }
      }
      L899: {
        const v_E = _g881;
        const _h911 = v_E.length;
        const _h923 = (2 * _h911);
        const _h924 = (_h923 - v_n);
        let _c925: boolean = (v_n > 0);
        if (_c925) {
          let _q900 = false;
          Q901: {
            const _a902 = v_E;
            const _t912 = ((2 * _h911) - v_n);
            const _lo913 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi914 = 31 - Math.clz32(b.domain);
            for (const _e906 of _l904) _f903[_e906] = -1;
            _l904 = _a902;
            let _i908 = 0;
            _s905[0] = 0;
            let _o916 = _a902.length === 0;
            for (;;) {
              if (_a902.length === 0) {
                if (!_o916) break;
                _o916 = false;
              }
              while (_a902.length > 0 && _i908 >= 0) {
                const _e906 = _a902[_i908];
                if (_s905[_i908] > 0) _f903[_e906] = -1;
                let _r915 = b.domain & ~((2 << _s905[_i908]) - 1);
                let _d907 = 0;
                V910: for (; _r915 !== 0; _r915 &= _r915 - 1) {
                  _d907 = 31 - Math.clz32(_r915 & -_r915);
                  _f903[_e906] = _d907;
                  {
                    let _t917 = _d907;
                    for (let _j909 = 0; _j909 < _i908; _j909++) _t917 += _f903[_a902[_j909]];
                    if (_t917 + (_a902.length - _i908 - 1) * _lo913 > _t912) continue;
                    if (_t917 + (_a902.length - _i908 - 1) * _hi914 < _t912) continue;
                  }
                  for (let _j909 = 0; _j909 < _i908; _j909++) {
                    const _y918 = _a902[_j909];
                    if (!(!((((_f903[_e906] === 1) && (_f903[_y918] === 1)) && (sp.adj8[_e906].includes(_y918)))))) continue V910;
                  }
                  break;
                }
                if (_r915 === 0) {
                  _s905[_i908] = 0;
                  _i908--;
                  continue;
                }
                _s905[_i908] = _d907;
                if (_i908 === _a902.length - 1) break;
                _i908++;
                _s905[_i908] = 0;
              }
              if (_i908 < 0) break;
              let _g919 = 0;
              G920: {
                const _a921 = v_E;
                for (let _i922 = 0; _i922 < _a921.length; _i922++) {
                  const v_x = _a921[_i922];
                  _g919 += _f903[v_x];
                }
              }
              if (!((_g919 === _h924))) continue;
              if (true) {
                _q900 = true;
                break Q901;
              }
            }
          }
          _c925 = !(_q900);
        }
        if (!(_c925)) break L899;
        let _g926 = -1;
        G927: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h950 = (_h923 - v_j);
            let _q928 = false;
            Q929: {
              const _a930 = v_E;
              const _t939 = (_h923 - v_j);
              const _lo940 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi941 = 31 - Math.clz32(b.domain);
              for (const _e934 of _l932) _f931[_e934] = -1;
              _l932 = _a930;
              let _i936 = 0;
              _s933[0] = 0;
              let _o943 = _a930.length === 0;
              for (;;) {
                if (_a930.length === 0) {
                  if (!_o943) break;
                  _o943 = false;
                }
                while (_a930.length > 0 && _i936 >= 0) {
                  const _e934 = _a930[_i936];
                  if (_s933[_i936] > 0) _f931[_e934] = -1;
                  let _r942 = b.domain & ~((2 << _s933[_i936]) - 1);
                  let _d935 = 0;
                  V938: for (; _r942 !== 0; _r942 &= _r942 - 1) {
                    _d935 = 31 - Math.clz32(_r942 & -_r942);
                    _f931[_e934] = _d935;
                    {
                      let _t944 = _d935;
                      for (let _j937 = 0; _j937 < _i936; _j937++) _t944 += _f931[_a930[_j937]];
                      if (_t944 + (_a930.length - _i936 - 1) * _lo940 > _t939) continue;
                      if (_t944 + (_a930.length - _i936 - 1) * _hi941 < _t939) continue;
                    }
                    for (let _j937 = 0; _j937 < _i936; _j937++) {
                      const _y945 = _a930[_j937];
                      if (!(!((((_f931[_e934] === 1) && (_f931[_y945] === 1)) && (sp.adj8[_e934].includes(_y945)))))) continue V938;
                    }
                    break;
                  }
                  if (_r942 === 0) {
                    _s933[_i936] = 0;
                    _i936--;
                    continue;
                  }
                  _s933[_i936] = _d935;
                  if (_i936 === _a930.length - 1) break;
                  _i936++;
                  _s933[_i936] = 0;
                }
                if (_i936 < 0) break;
                let _g946 = 0;
                G947: {
                  const _a948 = v_E;
                  for (let _i949 = 0; _i949 < _a948.length; _i949++) {
                    const v_x = _a948[_i949];
                    _g946 += _f931[v_x];
                  }
                }
                if (!((_g946 === _h950))) continue;
                if (true) {
                  _q928 = true;
                  break Q929;
                }
              }
            }
            if (!(_q928)) continue;
            _g926 = v_j;
            break G927;
          }
        }
        const v_room = _g926;
        _g951.length = 0;
        G952: {
          _g961.length = 0;
          G962: {
            const _a965 = v_S;
            for (let _i966 = 0; _i966 < _a965.length; _i966++) {
              const v_c = _a965[_i966];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g961.push(v_c);
            }
          }
          const _a967 = _g961;
          for (let _i968 = 0; _i968 < _a967.length; _i968++) {
            const v_c = _a967[_i968];
            if (!((v_R.includes(v_c)))) continue;
            _g951.push(v_c);
          }
        }
        const v_Q = _g951;
        if (b.made[0] !== _m260_0) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          _g969.length = 0;
          G970: {
            const _a973 = sp.adj8[v_x];
            for (let _i974 = 0; _i974 < _a973.length; _i974++) {
              const v_p = _a973[_i974];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g969.push(v_p);
            }
          }
          if (!(sameSet(v_R, _g969))) { continue R1; }
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
let _f1126 = new Int32Array(0);
let _l1127: readonly number[] = [];
let _f1154 = new Int32Array(0);
let _l1155: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function crowdedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedRegionBinding> | null): number {
  const _g1083: number[] = [];
  const _g1104: number[] = [];
  const _g1114: number[] = [];
  if (_f1126.length < sp.cells.length) _f1126 = new Int32Array(sp.cells.length).fill(-1);
  else _f1126.fill(-1);
  _l1127 = [];
  const _s1128: number[] = [];
  if (_f1154.length < sp.cells.length) _f1154 = new Int32Array(sp.cells.length).fill(-1);
  else _f1154.fill(-1);
  _l1155 = [];
  const _s1156: number[] = [];
  const _g1174: number[] = [];
  const _g1184: number[] = [];
  const _g1192: number[] = [];
  const facts = crowdedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1081 = sp.cells;
  R1:
  for (let _i1082 = 0; _i1082 < _a1081.length; _i1082++) {
    const v_x = _a1081[_i1082];
    const _m316_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1091 = cl.region.of[v_x];
    _g1083.length = 0;
    G1084: {
      const _a1087 = sp.adj8[v_x];
      for (let _i1088 = 0; _i1088 < _a1087.length; _i1088++) {
        const v_p = _a1087[_i1088];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g1083.push(v_p);
      }
    }
    const v_R = _g1083;
    const _a1089 = cl.region.parts;
    for (let _i1090 = 0; _i1090 < _a1089.length; _i1090++) {
      const v_g = _a1089[_i1090];
      let _c1096: boolean = (v_g === _h1091);
      if (!_c1096) {
        let _q1092 = false;
        Q1093: {
          const _a1094 = v_R;
          for (let _i1095 = 0; _i1095 < _a1094.length; _i1095++) {
            const v_p = _a1094[_i1095];
            if ((cl.region.of[v_p] === v_g)) {
              _q1092 = true;
              break Q1093;
            }
          }
        }
        _c1096 = _q1092;
      }
      if (!(_c1096)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1097 = 0;
      G1098: {
        const _a1099 = v_S;
        for (let _i1100 = 0; _i1100 < _a1099.length; _i1100++) {
          const v_c = _a1099[_i1100];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1097++;
        }
      }
      let _g1101 = 0;
      G1102: {
        for (let _i1103 = 0; _i1103 < 1; _i1103++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1101++;
        }
      }
      const v_n = ((cl.stars - _g1097) - _g1101);
      _g1104.length = 0;
      G1105: {
        _g1114.length = 0;
        G1115: {
          const _a1118 = v_S;
          for (let _i1119 = 0; _i1119 < _a1118.length; _i1119++) {
            const v_c = _a1118[_i1119];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1114.push(v_c);
          }
        }
        const _a1120 = _g1114;
        for (let _i1121 = 0; _i1121 < _a1120.length; _i1121++) {
          const v_c = _a1120[_i1121];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1104.push(v_c);
        }
      }
      L1122: {
        const v_E = _g1104;
        const _h1134 = v_E.length;
        const _h1146 = (2 * _h1134);
        const _h1147 = (_h1146 - v_n);
        let _c1148: boolean = (v_n > 0);
        if (_c1148) {
          let _q1123 = false;
          Q1124: {
            const _a1125 = v_E;
            const _t1135 = ((2 * _h1134) - v_n);
            const _lo1136 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1137 = 31 - Math.clz32(b.domain);
            for (const _e1129 of _l1127) _f1126[_e1129] = -1;
            _l1127 = _a1125;
            let _i1131 = 0;
            _s1128[0] = 0;
            let _o1139 = _a1125.length === 0;
            for (;;) {
              if (_a1125.length === 0) {
                if (!_o1139) break;
                _o1139 = false;
              }
              while (_a1125.length > 0 && _i1131 >= 0) {
                const _e1129 = _a1125[_i1131];
                if (_s1128[_i1131] > 0) _f1126[_e1129] = -1;
                let _r1138 = b.domain & ~((2 << _s1128[_i1131]) - 1);
                let _d1130 = 0;
                V1133: for (; _r1138 !== 0; _r1138 &= _r1138 - 1) {
                  _d1130 = 31 - Math.clz32(_r1138 & -_r1138);
                  _f1126[_e1129] = _d1130;
                  {
                    let _t1140 = _d1130;
                    for (let _j1132 = 0; _j1132 < _i1131; _j1132++) _t1140 += _f1126[_a1125[_j1132]];
                    if (_t1140 + (_a1125.length - _i1131 - 1) * _lo1136 > _t1135) continue;
                    if (_t1140 + (_a1125.length - _i1131 - 1) * _hi1137 < _t1135) continue;
                  }
                  for (let _j1132 = 0; _j1132 < _i1131; _j1132++) {
                    const _y1141 = _a1125[_j1132];
                    if (!(!((((_f1126[_e1129] === 1) && (_f1126[_y1141] === 1)) && (sp.adj8[_e1129].includes(_y1141)))))) continue V1133;
                  }
                  break;
                }
                if (_r1138 === 0) {
                  _s1128[_i1131] = 0;
                  _i1131--;
                  continue;
                }
                _s1128[_i1131] = _d1130;
                if (_i1131 === _a1125.length - 1) break;
                _i1131++;
                _s1128[_i1131] = 0;
              }
              if (_i1131 < 0) break;
              let _g1142 = 0;
              G1143: {
                const _a1144 = v_E;
                for (let _i1145 = 0; _i1145 < _a1144.length; _i1145++) {
                  const v_x = _a1144[_i1145];
                  _g1142 += _f1126[v_x];
                }
              }
              if (!((_g1142 === _h1147))) continue;
              if (true) {
                _q1123 = true;
                break Q1124;
              }
            }
          }
          _c1148 = !(_q1123);
        }
        if (!(_c1148)) break L1122;
        let _g1149 = -1;
        G1150: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1173 = (_h1146 - v_j);
            let _q1151 = false;
            Q1152: {
              const _a1153 = v_E;
              const _t1162 = (_h1146 - v_j);
              const _lo1163 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1164 = 31 - Math.clz32(b.domain);
              for (const _e1157 of _l1155) _f1154[_e1157] = -1;
              _l1155 = _a1153;
              let _i1159 = 0;
              _s1156[0] = 0;
              let _o1166 = _a1153.length === 0;
              for (;;) {
                if (_a1153.length === 0) {
                  if (!_o1166) break;
                  _o1166 = false;
                }
                while (_a1153.length > 0 && _i1159 >= 0) {
                  const _e1157 = _a1153[_i1159];
                  if (_s1156[_i1159] > 0) _f1154[_e1157] = -1;
                  let _r1165 = b.domain & ~((2 << _s1156[_i1159]) - 1);
                  let _d1158 = 0;
                  V1161: for (; _r1165 !== 0; _r1165 &= _r1165 - 1) {
                    _d1158 = 31 - Math.clz32(_r1165 & -_r1165);
                    _f1154[_e1157] = _d1158;
                    {
                      let _t1167 = _d1158;
                      for (let _j1160 = 0; _j1160 < _i1159; _j1160++) _t1167 += _f1154[_a1153[_j1160]];
                      if (_t1167 + (_a1153.length - _i1159 - 1) * _lo1163 > _t1162) continue;
                      if (_t1167 + (_a1153.length - _i1159 - 1) * _hi1164 < _t1162) continue;
                    }
                    for (let _j1160 = 0; _j1160 < _i1159; _j1160++) {
                      const _y1168 = _a1153[_j1160];
                      if (!(!((((_f1154[_e1157] === 1) && (_f1154[_y1168] === 1)) && (sp.adj8[_e1157].includes(_y1168)))))) continue V1161;
                    }
                    break;
                  }
                  if (_r1165 === 0) {
                    _s1156[_i1159] = 0;
                    _i1159--;
                    continue;
                  }
                  _s1156[_i1159] = _d1158;
                  if (_i1159 === _a1153.length - 1) break;
                  _i1159++;
                  _s1156[_i1159] = 0;
                }
                if (_i1159 < 0) break;
                let _g1169 = 0;
                G1170: {
                  const _a1171 = v_E;
                  for (let _i1172 = 0; _i1172 < _a1171.length; _i1172++) {
                    const v_x = _a1171[_i1172];
                    _g1169 += _f1154[v_x];
                  }
                }
                if (!((_g1169 === _h1173))) continue;
                if (true) {
                  _q1151 = true;
                  break Q1152;
                }
              }
            }
            if (!(_q1151)) continue;
            _g1149 = v_j;
            break G1150;
          }
        }
        const v_room = _g1149;
        _g1174.length = 0;
        G1175: {
          _g1184.length = 0;
          G1185: {
            const _a1188 = v_S;
            for (let _i1189 = 0; _i1189 < _a1188.length; _i1189++) {
              const v_c = _a1188[_i1189];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1184.push(v_c);
            }
          }
          const _a1190 = _g1184;
          for (let _i1191 = 0; _i1191 < _a1190.length; _i1191++) {
            const v_c = _a1190[_i1191];
            if (!((v_R.includes(v_c)))) continue;
            _g1174.push(v_c);
          }
        }
        const v_Q = _g1174;
        if (b.made[0] !== _m316_0) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          _g1192.length = 0;
          G1193: {
            const _a1196 = sp.adj8[v_x];
            for (let _i1197 = 0; _i1197 < _a1196.length; _i1197++) {
              const v_p = _a1196[_i1197];
              if (!(!((b.grid[v_p] !== 0)))) continue;
              _g1192.push(v_p);
            }
          }
          if (!(sameSet(v_R, _g1192))) { continue R1; }
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
  const _g1352: number[] = [];
  const _g1397: number[] = [];
  const _g1415: number[] = [];
  const _g1460: number[] = [];
  const _g1480: number[] = [];
  const _g1492: number[] = [];
  const _g1507: number[] = [];
  const facts = bandedFacts;
  let fired = 0;
  let changed = false;
  const _t1343 = (sp.w - 2);
  for (let v_k = 2; v_k <= _t1343; v_k++) {
    const _h1344 = (sp.w - v_k);
    const _h1349 = (v_k - 1);
    const _h1350 = (_h1349 * cl.stars);
    for (let v_dir = 0; v_dir <= 1; v_dir++) {
      for (let v_a = 0; v_a <= _h1344; v_a++) {
        const v_B = band(sp, v_k, v_dir, v_a);
        let _g1345 = 0;
        G1346: {
          const _a1347 = v_B;
          for (let _i1348 = 0; _i1348 < _a1347.length; _i1348++) {
            const v_c = _a1347[_i1348];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1345++;
          }
        }
        L1351: {
          const v_n = ((cl.stars - _g1345) + _h1350);
          if (!((v_n > 0))) break L1351;
          _g1352.length = 0;
          G1353: {
            const _a1380 = cl.region.parts;
            for (let _i1381 = 0; _i1381 < _a1380.length; _i1381++) {
              const v_r = _a1380[_i1381];
              const _t1382 = cl.region.cells[v_r];
              let _g1383 = 0;
              G1384: {
                const _a1385 = _t1382;
                for (let _i1386 = 0; _i1386 < _a1385.length; _i1386++) {
                  const v_c = _a1385[_i1386];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1383++;
                }
              }
              let _c1405: boolean = ((cl.stars - _g1383) > 0);
              if (_c1405) {
                let _q1394 = true;
                Q1395: {
                  const _t1396 = cl.region.cells[v_r];
                  _g1397.length = 0;
                  G1398: {
                    const _a1401 = _t1396;
                    for (let _i1402 = 0; _i1402 < _a1401.length; _i1402++) {
                      const v_c = _a1401[_i1402];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1397.push(v_c);
                    }
                  }
                  const _a1403 = _g1397;
                  for (let _i1404 = 0; _i1404 < _a1403.length; _i1404++) {
                    const v_c = _a1403[_i1404];
                    if (!((v_B.includes(v_c)))) {
                      _q1394 = false;
                      break Q1395;
                    }
                  }
                }
                _c1405 = _q1394;
              }
              if (!(_c1405)) continue;
              _g1352.push(v_r);
            }
          }
          const v_I = _g1352;
          let _g1406 = 0;
          G1407: {
            const _a1408 = v_I;
            for (let _i1409 = 0; _i1409 < _a1408.length; _i1409++) {
              const v_r = _a1408[_i1409];
              const _t1410 = cl.region.cells[v_r];
              let _g1411 = 0;
              G1412: {
                const _a1413 = _t1410;
                for (let _i1414 = 0; _i1414 < _a1413.length; _i1414++) {
                  const v_c = _a1413[_i1414];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1411++;
                }
              }
              _g1406 += (cl.stars - _g1411);
            }
          }
          const v_mi = _g1406;
          _g1415.length = 0;
          G1416: {
            const _a1443 = cl.region.parts;
            for (let _i1444 = 0; _i1444 < _a1443.length; _i1444++) {
              const v_r = _a1443[_i1444];
              const _t1445 = cl.region.cells[v_r];
              let _g1446 = 0;
              G1447: {
                const _a1448 = _t1445;
                for (let _i1449 = 0; _i1449 < _a1448.length; _i1449++) {
                  const v_c = _a1448[_i1449];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1446++;
                }
              }
              let _c1468: boolean = ((cl.stars - _g1446) > 0);
              if (_c1468) {
                let _q1457 = false;
                Q1458: {
                  const _t1459 = cl.region.cells[v_r];
                  _g1460.length = 0;
                  G1461: {
                    const _a1464 = _t1459;
                    for (let _i1465 = 0; _i1465 < _a1464.length; _i1465++) {
                      const v_c = _a1464[_i1465];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1460.push(v_c);
                    }
                  }
                  const _a1466 = _g1460;
                  for (let _i1467 = 0; _i1467 < _a1466.length; _i1467++) {
                    const v_c = _a1466[_i1467];
                    if ((v_B.includes(v_c))) {
                      _q1457 = true;
                      break Q1458;
                    }
                  }
                }
                _c1468 = _q1457;
              }
              if (!(_c1468)) continue;
              _g1415.push(v_r);
            }
          }
          const v_R = _g1415;
          let _g1469 = 0;
          G1470: {
            const _a1471 = v_R;
            for (let _i1472 = 0; _i1472 < _a1471.length; _i1472++) {
              const v_r = _a1471[_i1472];
              const _t1473 = cl.region.cells[v_r];
              let _g1474 = 0;
              G1475: {
                const _a1476 = _t1473;
                for (let _i1477 = 0; _i1477 < _a1476.length; _i1477++) {
                  const v_c = _a1476[_i1477];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1474++;
                }
              }
              _g1469 += (cl.stars - _g1474);
            }
          }
          const v_mr = _g1469;
          let _c1488: boolean = (v_mi === v_n);
          if (_c1488) {
            let _q1478 = false;
            Q1479: {
              _g1480.length = 0;
              G1481: {
                const _a1484 = v_B;
                for (let _i1485 = 0; _i1485 < _a1484.length; _i1485++) {
                  const v_c = _a1484[_i1485];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g1480.push(v_c);
                }
              }
              const _a1486 = _g1480;
              for (let _i1487 = 0; _i1487 < _a1486.length; _i1487++) {
                const v_c = _a1486[_i1487];
                if (!(v_I.includes(cl.region.of[v_c]))) {
                  _q1478 = true;
                  break Q1479;
                }
              }
            }
            _c1488 = _q1478;
          }
          L1489: {
            const v_lines = _c1488;
            if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L1489;
            facts.length = 0;
            changed = false;
            let _c1501: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
            if (_c1501) {
              let _c1500: boolean = !(v_lines);
              if (!_c1500) {
                let _q1490 = true;
                Q1491: {
                  _g1492.length = 0;
                  G1493: {
                    const _a1496 = v_B;
                    for (let _i1497 = 0; _i1497 < _a1496.length; _i1497++) {
                      const v_c = _a1496[_i1497];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1492.push(v_c);
                    }
                  }
                  const _a1498 = _g1492;
                  for (let _i1499 = 0; _i1499 < _a1498.length; _i1499++) {
                    const v_c = _a1498[_i1499];
                    if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q1490 = false;
                      break Q1491;
                    }
                  }
                }
                _c1500 = _q1490;
              }
              _c1501 = _c1500;
            }
            let _c1516: boolean = _c1501;
            if (_c1516) {
              let _c1515: boolean = (v_lines || (v_mr > v_n));
              if (!_c1515) {
                let _q1502 = true;
                Q1503: {
                  const _a1504 = v_R;
                  for (let _i1505 = 0; _i1505 < _a1504.length; _i1505++) {
                    const v_r = _a1504[_i1505];
                    const _t1506 = cl.region.cells[v_r];
                    _g1507.length = 0;
                    G1508: {
                      const _a1511 = _t1506;
                      for (let _i1512 = 0; _i1512 < _a1511.length; _i1512++) {
                        const v_c = _a1511[_i1512];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g1507.push(v_c);
                      }
                    }
                    const _a1513 = _g1507;
                    for (let _i1514 = 0; _i1514 < _a1513.length; _i1514++) {
                      const v_c = _a1513[_i1514];
                      if (!(!(v_B.includes(v_c)))) continue;
                      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                      if (!(true)) {
                        _q1502 = false;
                        break Q1503;
                      }
                    }
                  }
                }
                _c1515 = _q1502;
              }
              _c1516 = _c1515;
            }
            if (!(_c1516)) return -1;
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
let _f1707 = new Int32Array(0);
let _l1708: readonly number[] = [];
let _f1735 = new Int32Array(0);
let _l1736: readonly number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function starvedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedLineBinding> | null): number {
  const _g1685: number[] = [];
  const _g1695: number[] = [];
  if (_f1707.length < sp.cells.length) _f1707 = new Int32Array(sp.cells.length).fill(-1);
  else _f1707.fill(-1);
  _l1708 = [];
  const _s1709: number[] = [];
  if (_f1735.length < sp.cells.length) _f1735 = new Int32Array(sp.cells.length).fill(-1);
  else _f1735.fill(-1);
  _l1736 = [];
  const _s1737: number[] = [];
  const _g1755: number[] = [];
  const _g1765: number[] = [];
  const facts = starvedLineFacts;
  let fired = 0;
  let changed = false;
  const _a1667 = sp.cells;
  R1:
  for (let _i1668 = 0; _i1668 < _a1667.length; _i1668++) {
    const v_x = _a1667[_i1668];
    const _m451_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1671 = sp.rowOf[v_x];
    const _h1672 = sp.colOf[v_x];
    const _m454_1 = b.made[1];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1669 = sp.lines;
    for (let _i1670 = 0; _i1670 < _a1669.length; _i1670++) {
      const v_L = _a1669[_i1670];
      let _c1677: boolean = ((v_L === _h1671) || (v_L === _h1672));
      if (!_c1677) {
        let _q1673 = false;
        Q1674: {
          const _a1675 = v_R;
          for (let _i1676 = 0; _i1676 < _a1675.length; _i1676++) {
            const v_p = _a1675[_i1676];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q1673 = true;
              break Q1674;
            }
          }
        }
        _c1677 = _q1673;
      }
      if (!(_c1677)) continue;
      const v_S = sp.lineCells[v_L];
      let _g1678 = 0;
      G1679: {
        const _a1680 = v_S;
        for (let _i1681 = 0; _i1681 < _a1680.length; _i1681++) {
          const v_c = _a1680[_i1681];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1678++;
        }
      }
      let _g1682 = 0;
      G1683: {
        for (let _i1684 = 0; _i1684 < 1; _i1684++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1682++;
        }
      }
      const v_n = ((cl.stars - _g1678) - _g1682);
      _g1685.length = 0;
      G1686: {
        _g1695.length = 0;
        G1696: {
          const _a1699 = v_S;
          for (let _i1700 = 0; _i1700 < _a1699.length; _i1700++) {
            const v_c = _a1699[_i1700];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1695.push(v_c);
          }
        }
        const _a1701 = _g1695;
        for (let _i1702 = 0; _i1702 < _a1701.length; _i1702++) {
          const v_c = _a1701[_i1702];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1685.push(v_c);
        }
      }
      L1703: {
        const v_E = _g1685;
        const _h1715 = v_E.length;
        const _h1727 = (2 * _h1715);
        const _h1728 = (_h1727 - v_n);
        let _c1729: boolean = (v_n > 0);
        if (_c1729) {
          let _q1704 = false;
          Q1705: {
            const _a1706 = v_E;
            const _t1716 = ((2 * _h1715) - v_n);
            const _lo1717 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1718 = 31 - Math.clz32(b.domain);
            for (const _e1710 of _l1708) _f1707[_e1710] = -1;
            _l1708 = _a1706;
            let _i1712 = 0;
            _s1709[0] = 0;
            let _o1720 = _a1706.length === 0;
            for (;;) {
              if (_a1706.length === 0) {
                if (!_o1720) break;
                _o1720 = false;
              }
              while (_a1706.length > 0 && _i1712 >= 0) {
                const _e1710 = _a1706[_i1712];
                if (_s1709[_i1712] > 0) _f1707[_e1710] = -1;
                let _r1719 = b.domain & ~((2 << _s1709[_i1712]) - 1);
                let _d1711 = 0;
                V1714: for (; _r1719 !== 0; _r1719 &= _r1719 - 1) {
                  _d1711 = 31 - Math.clz32(_r1719 & -_r1719);
                  _f1707[_e1710] = _d1711;
                  {
                    let _t1721 = _d1711;
                    for (let _j1713 = 0; _j1713 < _i1712; _j1713++) _t1721 += _f1707[_a1706[_j1713]];
                    if (_t1721 + (_a1706.length - _i1712 - 1) * _lo1717 > _t1716) continue;
                    if (_t1721 + (_a1706.length - _i1712 - 1) * _hi1718 < _t1716) continue;
                  }
                  for (let _j1713 = 0; _j1713 < _i1712; _j1713++) {
                    const _y1722 = _a1706[_j1713];
                    if (!(!((((_f1707[_e1710] === 1) && (_f1707[_y1722] === 1)) && (sp.adj8[_e1710].includes(_y1722)))))) continue V1714;
                  }
                  break;
                }
                if (_r1719 === 0) {
                  _s1709[_i1712] = 0;
                  _i1712--;
                  continue;
                }
                _s1709[_i1712] = _d1711;
                if (_i1712 === _a1706.length - 1) break;
                _i1712++;
                _s1709[_i1712] = 0;
              }
              if (_i1712 < 0) break;
              let _g1723 = 0;
              G1724: {
                const _a1725 = v_E;
                for (let _i1726 = 0; _i1726 < _a1725.length; _i1726++) {
                  const v_x = _a1725[_i1726];
                  _g1723 += _f1707[v_x];
                }
              }
              if (!((_g1723 === _h1728))) continue;
              if (true) {
                _q1704 = true;
                break Q1705;
              }
            }
          }
          _c1729 = !(_q1704);
        }
        if (!(_c1729)) break L1703;
        let _g1730 = -1;
        G1731: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1754 = (_h1727 - v_j);
            let _q1732 = false;
            Q1733: {
              const _a1734 = v_E;
              const _t1743 = (_h1727 - v_j);
              const _lo1744 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1745 = 31 - Math.clz32(b.domain);
              for (const _e1738 of _l1736) _f1735[_e1738] = -1;
              _l1736 = _a1734;
              let _i1740 = 0;
              _s1737[0] = 0;
              let _o1747 = _a1734.length === 0;
              for (;;) {
                if (_a1734.length === 0) {
                  if (!_o1747) break;
                  _o1747 = false;
                }
                while (_a1734.length > 0 && _i1740 >= 0) {
                  const _e1738 = _a1734[_i1740];
                  if (_s1737[_i1740] > 0) _f1735[_e1738] = -1;
                  let _r1746 = b.domain & ~((2 << _s1737[_i1740]) - 1);
                  let _d1739 = 0;
                  V1742: for (; _r1746 !== 0; _r1746 &= _r1746 - 1) {
                    _d1739 = 31 - Math.clz32(_r1746 & -_r1746);
                    _f1735[_e1738] = _d1739;
                    {
                      let _t1748 = _d1739;
                      for (let _j1741 = 0; _j1741 < _i1740; _j1741++) _t1748 += _f1735[_a1734[_j1741]];
                      if (_t1748 + (_a1734.length - _i1740 - 1) * _lo1744 > _t1743) continue;
                      if (_t1748 + (_a1734.length - _i1740 - 1) * _hi1745 < _t1743) continue;
                    }
                    for (let _j1741 = 0; _j1741 < _i1740; _j1741++) {
                      const _y1749 = _a1734[_j1741];
                      if (!(!((((_f1735[_e1738] === 1) && (_f1735[_y1749] === 1)) && (sp.adj8[_e1738].includes(_y1749)))))) continue V1742;
                    }
                    break;
                  }
                  if (_r1746 === 0) {
                    _s1737[_i1740] = 0;
                    _i1740--;
                    continue;
                  }
                  _s1737[_i1740] = _d1739;
                  if (_i1740 === _a1734.length - 1) break;
                  _i1740++;
                  _s1737[_i1740] = 0;
                }
                if (_i1740 < 0) break;
                let _g1750 = 0;
                G1751: {
                  const _a1752 = v_E;
                  for (let _i1753 = 0; _i1753 < _a1752.length; _i1753++) {
                    const v_x = _a1752[_i1753];
                    _g1750 += _f1735[v_x];
                  }
                }
                if (!((_g1750 === _h1754))) continue;
                if (true) {
                  _q1732 = true;
                  break Q1733;
                }
              }
            }
            if (!(_q1732)) continue;
            _g1730 = v_j;
            break G1731;
          }
        }
        const v_room = _g1730;
        _g1755.length = 0;
        G1756: {
          _g1765.length = 0;
          G1766: {
            const _a1769 = v_S;
            for (let _i1770 = 0; _i1770 < _a1769.length; _i1770++) {
              const v_c = _a1769[_i1770];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1765.push(v_c);
            }
          }
          const _a1771 = _g1765;
          for (let _i1772 = 0; _i1772 < _a1771.length; _i1772++) {
            const v_c = _a1771[_i1772];
            if (!((v_R.includes(v_c)))) continue;
            _g1755.push(v_c);
          }
        }
        const v_Q = _g1755;
        if (b.made[0] !== _m451_0 || b.made[1] !== _m454_1) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          if (!(sameSet(v_R, ruled(b, sp, cl, v_x)))) { continue R1; }
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
let _f1912 = new Int32Array(0);
let _l1913: readonly number[] = [];
let _f1940 = new Int32Array(0);
let _l1941: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function starvedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedRegionBinding> | null): number {
  const _g1890: number[] = [];
  const _g1900: number[] = [];
  if (_f1912.length < sp.cells.length) _f1912 = new Int32Array(sp.cells.length).fill(-1);
  else _f1912.fill(-1);
  _l1913 = [];
  const _s1914: number[] = [];
  if (_f1940.length < sp.cells.length) _f1940 = new Int32Array(sp.cells.length).fill(-1);
  else _f1940.fill(-1);
  _l1941 = [];
  const _s1942: number[] = [];
  const _g1960: number[] = [];
  const _g1970: number[] = [];
  const facts = starvedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1873 = sp.cells;
  R1:
  for (let _i1874 = 0; _i1874 < _a1873.length; _i1874++) {
    const v_x = _a1873[_i1874];
    const _m505_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1877 = cl.region.of[v_x];
    const _m508_1 = b.made[1];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1875 = cl.region.parts;
    for (let _i1876 = 0; _i1876 < _a1875.length; _i1876++) {
      const v_g = _a1875[_i1876];
      let _c1882: boolean = (v_g === _h1877);
      if (!_c1882) {
        let _q1878 = false;
        Q1879: {
          const _a1880 = v_R;
          for (let _i1881 = 0; _i1881 < _a1880.length; _i1881++) {
            const v_p = _a1880[_i1881];
            if ((cl.region.of[v_p] === v_g)) {
              _q1878 = true;
              break Q1879;
            }
          }
        }
        _c1882 = _q1878;
      }
      if (!(_c1882)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1883 = 0;
      G1884: {
        const _a1885 = v_S;
        for (let _i1886 = 0; _i1886 < _a1885.length; _i1886++) {
          const v_c = _a1885[_i1886];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1883++;
        }
      }
      let _g1887 = 0;
      G1888: {
        for (let _i1889 = 0; _i1889 < 1; _i1889++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1887++;
        }
      }
      const v_n = ((cl.stars - _g1883) - _g1887);
      _g1890.length = 0;
      G1891: {
        _g1900.length = 0;
        G1901: {
          const _a1904 = v_S;
          for (let _i1905 = 0; _i1905 < _a1904.length; _i1905++) {
            const v_c = _a1904[_i1905];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1900.push(v_c);
          }
        }
        const _a1906 = _g1900;
        for (let _i1907 = 0; _i1907 < _a1906.length; _i1907++) {
          const v_c = _a1906[_i1907];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1890.push(v_c);
        }
      }
      L1908: {
        const v_E = _g1890;
        const _h1920 = v_E.length;
        const _h1932 = (2 * _h1920);
        const _h1933 = (_h1932 - v_n);
        let _c1934: boolean = (v_n > 0);
        if (_c1934) {
          let _q1909 = false;
          Q1910: {
            const _a1911 = v_E;
            const _t1921 = ((2 * _h1920) - v_n);
            const _lo1922 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1923 = 31 - Math.clz32(b.domain);
            for (const _e1915 of _l1913) _f1912[_e1915] = -1;
            _l1913 = _a1911;
            let _i1917 = 0;
            _s1914[0] = 0;
            let _o1925 = _a1911.length === 0;
            for (;;) {
              if (_a1911.length === 0) {
                if (!_o1925) break;
                _o1925 = false;
              }
              while (_a1911.length > 0 && _i1917 >= 0) {
                const _e1915 = _a1911[_i1917];
                if (_s1914[_i1917] > 0) _f1912[_e1915] = -1;
                let _r1924 = b.domain & ~((2 << _s1914[_i1917]) - 1);
                let _d1916 = 0;
                V1919: for (; _r1924 !== 0; _r1924 &= _r1924 - 1) {
                  _d1916 = 31 - Math.clz32(_r1924 & -_r1924);
                  _f1912[_e1915] = _d1916;
                  {
                    let _t1926 = _d1916;
                    for (let _j1918 = 0; _j1918 < _i1917; _j1918++) _t1926 += _f1912[_a1911[_j1918]];
                    if (_t1926 + (_a1911.length - _i1917 - 1) * _lo1922 > _t1921) continue;
                    if (_t1926 + (_a1911.length - _i1917 - 1) * _hi1923 < _t1921) continue;
                  }
                  for (let _j1918 = 0; _j1918 < _i1917; _j1918++) {
                    const _y1927 = _a1911[_j1918];
                    if (!(!((((_f1912[_e1915] === 1) && (_f1912[_y1927] === 1)) && (sp.adj8[_e1915].includes(_y1927)))))) continue V1919;
                  }
                  break;
                }
                if (_r1924 === 0) {
                  _s1914[_i1917] = 0;
                  _i1917--;
                  continue;
                }
                _s1914[_i1917] = _d1916;
                if (_i1917 === _a1911.length - 1) break;
                _i1917++;
                _s1914[_i1917] = 0;
              }
              if (_i1917 < 0) break;
              let _g1928 = 0;
              G1929: {
                const _a1930 = v_E;
                for (let _i1931 = 0; _i1931 < _a1930.length; _i1931++) {
                  const v_x = _a1930[_i1931];
                  _g1928 += _f1912[v_x];
                }
              }
              if (!((_g1928 === _h1933))) continue;
              if (true) {
                _q1909 = true;
                break Q1910;
              }
            }
          }
          _c1934 = !(_q1909);
        }
        if (!(_c1934)) break L1908;
        let _g1935 = -1;
        G1936: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1959 = (_h1932 - v_j);
            let _q1937 = false;
            Q1938: {
              const _a1939 = v_E;
              const _t1948 = (_h1932 - v_j);
              const _lo1949 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1950 = 31 - Math.clz32(b.domain);
              for (const _e1943 of _l1941) _f1940[_e1943] = -1;
              _l1941 = _a1939;
              let _i1945 = 0;
              _s1942[0] = 0;
              let _o1952 = _a1939.length === 0;
              for (;;) {
                if (_a1939.length === 0) {
                  if (!_o1952) break;
                  _o1952 = false;
                }
                while (_a1939.length > 0 && _i1945 >= 0) {
                  const _e1943 = _a1939[_i1945];
                  if (_s1942[_i1945] > 0) _f1940[_e1943] = -1;
                  let _r1951 = b.domain & ~((2 << _s1942[_i1945]) - 1);
                  let _d1944 = 0;
                  V1947: for (; _r1951 !== 0; _r1951 &= _r1951 - 1) {
                    _d1944 = 31 - Math.clz32(_r1951 & -_r1951);
                    _f1940[_e1943] = _d1944;
                    {
                      let _t1953 = _d1944;
                      for (let _j1946 = 0; _j1946 < _i1945; _j1946++) _t1953 += _f1940[_a1939[_j1946]];
                      if (_t1953 + (_a1939.length - _i1945 - 1) * _lo1949 > _t1948) continue;
                      if (_t1953 + (_a1939.length - _i1945 - 1) * _hi1950 < _t1948) continue;
                    }
                    for (let _j1946 = 0; _j1946 < _i1945; _j1946++) {
                      const _y1954 = _a1939[_j1946];
                      if (!(!((((_f1940[_e1943] === 1) && (_f1940[_y1954] === 1)) && (sp.adj8[_e1943].includes(_y1954)))))) continue V1947;
                    }
                    break;
                  }
                  if (_r1951 === 0) {
                    _s1942[_i1945] = 0;
                    _i1945--;
                    continue;
                  }
                  _s1942[_i1945] = _d1944;
                  if (_i1945 === _a1939.length - 1) break;
                  _i1945++;
                  _s1942[_i1945] = 0;
                }
                if (_i1945 < 0) break;
                let _g1955 = 0;
                G1956: {
                  const _a1957 = v_E;
                  for (let _i1958 = 0; _i1958 < _a1957.length; _i1958++) {
                    const v_x = _a1957[_i1958];
                    _g1955 += _f1940[v_x];
                  }
                }
                if (!((_g1955 === _h1959))) continue;
                if (true) {
                  _q1937 = true;
                  break Q1938;
                }
              }
            }
            if (!(_q1937)) continue;
            _g1935 = v_j;
            break G1936;
          }
        }
        const v_room = _g1935;
        _g1960.length = 0;
        G1961: {
          _g1970.length = 0;
          G1971: {
            const _a1974 = v_S;
            for (let _i1975 = 0; _i1975 < _a1974.length; _i1975++) {
              const v_c = _a1974[_i1975];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1970.push(v_c);
            }
          }
          const _a1976 = _g1970;
          for (let _i1977 = 0; _i1977 < _a1976.length; _i1977++) {
            const v_c = _a1976[_i1977];
            if (!((v_R.includes(v_c)))) continue;
            _g1960.push(v_c);
          }
        }
        const v_Q = _g1960;
        if (b.made[0] !== _m505_0 || b.made[1] !== _m508_1) {
          if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
          if (!(sameSet(v_R, ruled(b, sp, cl, v_x)))) { continue R1; }
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
  const _g143: number[] = [];
  G144: {
    const _a147 = sp.cells;
    for (let _i148 = 0; _i148 < _a147.length; _i148++) {
      const v_c = _a147[_i148];
      if (!(((v_a <= (((1 - v_dir) * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w)))) && ((((1 - v_dir) * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w))) < (v_a + v_k))))) continue;
      _g143.push(v_c);
    }
  }
  const _made = _g143;
  _kept2[v_a] = _made;
  return _made;
}

const ruledKept = keptStore<readonly number[]>();

/** `ruled(x)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ruled(b: Marks, sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  const _kept: Kept<readonly number[]> = ruledKept.marks(b);
  if (_kept[v_x] !== undefined) return _kept[v_x];
  const _g1519: number[] = [];
  G1520: {
    const _a1545 = sp.cells;
    for (let _i1546 = 0; _i1546 < _a1545.length; _i1546++) {
      const v_p = _a1545[_i1546];
      let _c1568: boolean = (!((b.grid[v_p] !== 0)) && (v_p !== v_x));
      if (_c1568) {
        let _c1553: boolean = (sp.adj8[v_x].includes(v_p));
        if (!_c1553) {
          let _c1552: boolean = (sp.rowOf[v_p] === sp.rowOf[v_x]);
          if (_c1552) {
            const _t1547 = sp.lineCells[sp.rowOf[v_x]];
            let _g1548 = 0;
            G1549: {
              const _a1550 = _t1547;
              for (let _i1551 = 0; _i1551 < _a1550.length; _i1551++) {
                const v_c = _a1550[_i1551];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1548++;
              }
            }
            _c1552 = ((cl.stars - _g1548) === 1);
          }
          _c1553 = _c1552;
        }
        let _c1560: boolean = _c1553;
        if (!_c1560) {
          let _c1559: boolean = (sp.colOf[v_p] === sp.colOf[v_x]);
          if (_c1559) {
            const _t1554 = sp.lineCells[sp.colOf[v_x]];
            let _g1555 = 0;
            G1556: {
              const _a1557 = _t1554;
              for (let _i1558 = 0; _i1558 < _a1557.length; _i1558++) {
                const v_c = _a1557[_i1558];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1555++;
              }
            }
            _c1559 = ((cl.stars - _g1555) === 1);
          }
          _c1560 = _c1559;
        }
        let _c1567: boolean = _c1560;
        if (!_c1567) {
          let _c1566: boolean = (cl.region.of[v_p] === cl.region.of[v_x]);
          if (_c1566) {
            const _t1561 = cl.region.cells[cl.region.of[v_x]];
            let _g1562 = 0;
            G1563: {
              const _a1564 = _t1561;
              for (let _i1565 = 0; _i1565 < _a1564.length; _i1565++) {
                const v_c = _a1564[_i1565];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1562++;
              }
            }
            _c1566 = ((cl.stars - _g1562) === 1);
          }
          _c1567 = _c1566;
        }
        _c1568 = _c1567;
      }
      if (!(_c1568)) continue;
      _g1519.push(v_p);
    }
  }
  const _made = _g1519;
  _kept[v_x] = _made;
  return _made;
}
