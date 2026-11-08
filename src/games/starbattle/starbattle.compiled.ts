// Compiled by `npm run describe` from src/games/starbattle/starbattle.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, keptStore, minus, rangeMask, setOf, type Kept } from "../../engine/describe-runtime.ts";

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
  let _q1950 = true;
  Q1951: {
    const _a1952 = sp.lines;
    for (let _i1953 = 0; _i1953 < _a1952.length; _i1953++) {
      const v_L = _a1952[_i1953];
      let _g1954 = 0;
      G1955: {
        const _a1956 = sp.lineCells[v_L];
        for (let _i1957 = 0; _i1957 < _a1956.length; _i1957++) {
          const v_c = _a1956[_i1957];
          const _h1958 = (g[v_c] || -1);
          if (!((_h1958 === 1))) continue;
          _g1954++;
        }
      }
      if (!((_g1954 === cl.stars))) {
        _q1950 = false;
        break Q1951;
      }
    }
  }
  if (!(_q1950)) return false;
  let _q1959 = true;
  Q1960: {
    const _a1961 = cl.region.parts;
    for (let _i1962 = 0; _i1962 < _a1961.length; _i1962++) {
      const v_r = _a1961[_i1962];
      let _g1963 = 0;
      G1964: {
        const _a1965 = cl.region.cells[v_r];
        for (let _i1966 = 0; _i1966 < _a1965.length; _i1966++) {
          const v_c = _a1965[_i1966];
          const _h1967 = (g[v_c] || -1);
          if (!((_h1967 === 1))) continue;
          _g1963++;
        }
      }
      if (!((_g1963 === cl.stars))) {
        _q1959 = false;
        break Q1960;
      }
    }
  }
  if (!(_q1959)) return false;
  let _q1968 = true;
  Q1969: {
    const _a1970 = sp.cells;
    for (let _i1971 = 0; _i1971 < _a1970.length; _i1971++) {
      const v_a = _a1970[_i1971];
      const _h1972 = (g[v_a] || -1);
      if (!((_h1972 === 1))) continue;
      let _q1973 = true;
      Q1974: {
        const _a1975 = sp.adj8[v_a];
        for (let _i1976 = 0; _i1976 < _a1975.length; _i1976++) {
          const v_b = _a1975[_i1976];
          const _h1977 = (g[v_b] || -1);
          if (!((_h1977 !== 1))) {
            _q1973 = false;
            break Q1974;
          }
        }
      }
      if (!(_q1973)) {
        _q1968 = false;
        break Q1969;
      }
    }
  }
  if (!(_q1968)) return false;
  return true;
}

export interface AroundBinding {
  c: number;
}

const aroundFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function around(b: Marks, sp: GridSpace, fire: Fire<AroundBinding> | null): number {
  const facts = aroundFacts;
  let fired = 0;
  let changed = false;
  const _a3 = sp.cells;
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
        if (fire !== null && !fire({ L: v_L, n: v_n, O: v_O }, facts)) return 1;
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
        if (fire !== null && !fire({ r: v_r, n: v_n, O: v_O }, facts)) return 1;
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
            if (fire !== null && !fire({ dir: v_dir, a: v_a, B: v_B, n: v_n, I: v_I, mi: v_mi, R: v_R, mr: v_mr, lines: v_lines }, facts)) return 1;
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

/** Its dearest read grows with the board as n^0.5. */
export function neededLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededLineBinding> | null): number {
  const _g535: number[] = [];
  const _f548 = new Int32Array(sp.cells.length).fill(-1);
  let _l549: readonly number[] = [];
  const _s550: number[] = [];
  const _f575 = new Int32Array(sp.cells.length).fill(-1);
  let _l576: readonly number[] = [];
  const _s577: number[] = [];
  const facts = neededLineFacts;
  let fired = 0;
  let changed = false;
  const _a527 = sp.lines;
  for (let _i528 = 0; _i528 < _a527.length; _i528++) {
    const v_L = _a527[_i528];
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
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, n: v_n, O: v_O, x: v_x, E: v_E, room: v_room }, facts)) return 1;
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

/** Its dearest read grows with the board as 1. */
export function neededRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededRegionBinding> | null): number {
  const _g667: number[] = [];
  const _f680 = new Int32Array(sp.cells.length).fill(-1);
  let _l681: readonly number[] = [];
  const _s682: number[] = [];
  const _f707 = new Int32Array(sp.cells.length).fill(-1);
  let _l708: readonly number[] = [];
  const _s709: number[] = [];
  const facts = neededRegionFacts;
  let fired = 0;
  let changed = false;
  const _a659 = cl.region.parts;
  for (let _i660 = 0; _i660 < _a659.length; _i660++) {
    const v_r = _a659[_i660];
    const _t661 = cl.region.cells[v_r];
    let _g662 = 0;
    G663: {
      const _a664 = _t661;
      for (let _i665 = 0; _i665 < _a664.length; _i665++) {
        const v_c = _a664[_i665];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g662++;
      }
    }
    const v_n = (cl.stars - _g662);
    const _t666 = cl.region.cells[v_r];
    _g667.length = 0;
    G668: {
      const _a671 = _t666;
      for (let _i672 = 0; _i672 < _a671.length; _i672++) {
        const v_c = _a671[_i672];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g667.push(v_c);
      }
    }
    L673: {
      const v_O = _g667;
      if (!((v_n > 0))) break L673;
      const _a674 = v_O;
      for (let _i675 = 0; _i675 < _a674.length; _i675++) {
        const v_x = _a674[_i675];
        L676: {
          const v_E = minus(v_O, setOf(v_x));
          const _h688 = v_E.length;
          const _h700 = (2 * _h688);
          const _h701 = (_h700 - v_n);
          let _q677 = false;
          Q678: {
            const _a679 = v_E;
            const _t689 = ((2 * _h688) - v_n);
            const _lo690 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi691 = 31 - Math.clz32(b.domain);
            for (const _e683 of _l681) _f680[_e683] = -1;
            _l681 = _a679;
            let _i685 = 0;
            _s682[0] = 0;
            let _o693 = _a679.length === 0;
            for (;;) {
              if (_a679.length === 0) {
                if (!_o693) break;
                _o693 = false;
              }
              while (_a679.length > 0 && _i685 >= 0) {
                const _e683 = _a679[_i685];
                if (_s682[_i685] > 0) _f680[_e683] = -1;
                let _r692 = b.domain & ~((2 << _s682[_i685]) - 1);
                let _d684 = 0;
                V687: for (; _r692 !== 0; _r692 &= _r692 - 1) {
                  _d684 = 31 - Math.clz32(_r692 & -_r692);
                  _f680[_e683] = _d684;
                  {
                    let _t694 = _d684;
                    for (let _j686 = 0; _j686 < _i685; _j686++) _t694 += _f680[_a679[_j686]];
                    if (_t694 + (_a679.length - _i685 - 1) * _lo690 > _t689) continue;
                    if (_t694 + (_a679.length - _i685 - 1) * _hi691 < _t689) continue;
                  }
                  for (let _j686 = 0; _j686 < _i685; _j686++) {
                    const _y695 = _a679[_j686];
                    if (!(!((((_f680[_e683] === 1) && (_f680[_y695] === 1)) && (sp.adj8[_e683].includes(_y695)))))) continue V687;
                  }
                  break;
                }
                if (_r692 === 0) {
                  _s682[_i685] = 0;
                  _i685--;
                  continue;
                }
                _s682[_i685] = _d684;
                if (_i685 === _a679.length - 1) break;
                _i685++;
                _s682[_i685] = 0;
              }
              if (_i685 < 0) break;
              let _g696 = 0;
              G697: {
                const _a698 = v_E;
                for (let _i699 = 0; _i699 < _a698.length; _i699++) {
                  const v_x = _a698[_i699];
                  _g696 += _f680[v_x];
                }
              }
              if (!((_g696 === _h701))) continue;
              if (true) {
                _q677 = true;
                break Q678;
              }
            }
          }
          if (!(!(_q677))) break L676;
          let _g702 = -1;
          G703: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h726 = (_h700 - v_j);
              let _q704 = false;
              Q705: {
                const _a706 = v_E;
                const _t715 = (_h700 - v_j);
                const _lo716 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi717 = 31 - Math.clz32(b.domain);
                for (const _e710 of _l708) _f707[_e710] = -1;
                _l708 = _a706;
                let _i712 = 0;
                _s709[0] = 0;
                let _o719 = _a706.length === 0;
                for (;;) {
                  if (_a706.length === 0) {
                    if (!_o719) break;
                    _o719 = false;
                  }
                  while (_a706.length > 0 && _i712 >= 0) {
                    const _e710 = _a706[_i712];
                    if (_s709[_i712] > 0) _f707[_e710] = -1;
                    let _r718 = b.domain & ~((2 << _s709[_i712]) - 1);
                    let _d711 = 0;
                    V714: for (; _r718 !== 0; _r718 &= _r718 - 1) {
                      _d711 = 31 - Math.clz32(_r718 & -_r718);
                      _f707[_e710] = _d711;
                      {
                        let _t720 = _d711;
                        for (let _j713 = 0; _j713 < _i712; _j713++) _t720 += _f707[_a706[_j713]];
                        if (_t720 + (_a706.length - _i712 - 1) * _lo716 > _t715) continue;
                        if (_t720 + (_a706.length - _i712 - 1) * _hi717 < _t715) continue;
                      }
                      for (let _j713 = 0; _j713 < _i712; _j713++) {
                        const _y721 = _a706[_j713];
                        if (!(!((((_f707[_e710] === 1) && (_f707[_y721] === 1)) && (sp.adj8[_e710].includes(_y721)))))) continue V714;
                      }
                      break;
                    }
                    if (_r718 === 0) {
                      _s709[_i712] = 0;
                      _i712--;
                      continue;
                    }
                    _s709[_i712] = _d711;
                    if (_i712 === _a706.length - 1) break;
                    _i712++;
                    _s709[_i712] = 0;
                  }
                  if (_i712 < 0) break;
                  let _g722 = 0;
                  G723: {
                    const _a724 = v_E;
                    for (let _i725 = 0; _i725 < _a724.length; _i725++) {
                      const v_x = _a724[_i725];
                      _g722 += _f707[v_x];
                    }
                  }
                  if (!((_g722 === _h726))) continue;
                  if (true) {
                    _q704 = true;
                    break Q705;
                  }
                }
              }
              if (!(_q704)) continue;
              _g702 = v_j;
              break G703;
            }
          }
          const v_room = _g702;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ r: v_r, n: v_n, O: v_O, x: v_x, E: v_E, room: v_room }, facts)) return 1;
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

/** Its dearest read grows with the board as n^1.5. */
export function crowdedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedLineBinding> | null): number {
  const _g836: number[] = [];
  const _g859: number[] = [];
  const _g869: number[] = [];
  const _f881 = new Int32Array(sp.cells.length).fill(-1);
  let _l882: readonly number[] = [];
  const _s883: number[] = [];
  const _f909 = new Int32Array(sp.cells.length).fill(-1);
  let _l910: readonly number[] = [];
  const _s911: number[] = [];
  const _g929: number[] = [];
  const _g939: number[] = [];
  const facts = crowdedLineFacts;
  let fired = 0;
  let changed = false;
  const _a834 = sp.cells;
  for (let _i835 = 0; _i835 < _a834.length; _i835++) {
    const v_x = _a834[_i835];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h844 = sp.rowOf[v_x];
    const _h845 = sp.colOf[v_x];
    _g836.length = 0;
    G837: {
      const _a840 = sp.adj8[v_x];
      for (let _i841 = 0; _i841 < _a840.length; _i841++) {
        const v_p = _a840[_i841];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g836.push(v_p);
      }
    }
    const v_R = _g836;
    const _a842 = sp.lines;
    for (let _i843 = 0; _i843 < _a842.length; _i843++) {
      const v_L = _a842[_i843];
      let _c850: boolean = ((v_L === _h844) || (v_L === _h845));
      if (!_c850) {
        let _q846 = false;
        Q847: {
          const _a848 = v_R;
          for (let _i849 = 0; _i849 < _a848.length; _i849++) {
            const v_p = _a848[_i849];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q846 = true;
              break Q847;
            }
          }
        }
        _c850 = _q846;
      }
      if (!(_c850)) continue;
      const v_S = sp.lineCells[v_L];
      let _g851 = 0;
      G852: {
        const _a853 = v_S;
        for (let _i854 = 0; _i854 < _a853.length; _i854++) {
          const v_c = _a853[_i854];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g851++;
        }
      }
      let _g855 = 0;
      G856: {
        const _a857 = setOf(v_x);
        for (let _i858 = 0; _i858 < _a857.length; _i858++) {
          const v_c = _a857[_i858];
          if (!((v_S.includes(v_c)))) continue;
          _g855++;
        }
      }
      const v_n = ((cl.stars - _g851) - _g855);
      _g859.length = 0;
      G860: {
        _g869.length = 0;
        G870: {
          const _a873 = v_S;
          for (let _i874 = 0; _i874 < _a873.length; _i874++) {
            const v_c = _a873[_i874];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g869.push(v_c);
          }
        }
        const _a875 = _g869;
        for (let _i876 = 0; _i876 < _a875.length; _i876++) {
          const v_c = _a875[_i876];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g859.push(v_c);
        }
      }
      L877: {
        const v_E = _g859;
        const _h889 = v_E.length;
        const _h901 = (2 * _h889);
        const _h902 = (_h901 - v_n);
        let _c903: boolean = (v_n > 0);
        if (_c903) {
          let _q878 = false;
          Q879: {
            const _a880 = v_E;
            const _t890 = ((2 * _h889) - v_n);
            const _lo891 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi892 = 31 - Math.clz32(b.domain);
            for (const _e884 of _l882) _f881[_e884] = -1;
            _l882 = _a880;
            let _i886 = 0;
            _s883[0] = 0;
            let _o894 = _a880.length === 0;
            for (;;) {
              if (_a880.length === 0) {
                if (!_o894) break;
                _o894 = false;
              }
              while (_a880.length > 0 && _i886 >= 0) {
                const _e884 = _a880[_i886];
                if (_s883[_i886] > 0) _f881[_e884] = -1;
                let _r893 = b.domain & ~((2 << _s883[_i886]) - 1);
                let _d885 = 0;
                V888: for (; _r893 !== 0; _r893 &= _r893 - 1) {
                  _d885 = 31 - Math.clz32(_r893 & -_r893);
                  _f881[_e884] = _d885;
                  {
                    let _t895 = _d885;
                    for (let _j887 = 0; _j887 < _i886; _j887++) _t895 += _f881[_a880[_j887]];
                    if (_t895 + (_a880.length - _i886 - 1) * _lo891 > _t890) continue;
                    if (_t895 + (_a880.length - _i886 - 1) * _hi892 < _t890) continue;
                  }
                  for (let _j887 = 0; _j887 < _i886; _j887++) {
                    const _y896 = _a880[_j887];
                    if (!(!((((_f881[_e884] === 1) && (_f881[_y896] === 1)) && (sp.adj8[_e884].includes(_y896)))))) continue V888;
                  }
                  break;
                }
                if (_r893 === 0) {
                  _s883[_i886] = 0;
                  _i886--;
                  continue;
                }
                _s883[_i886] = _d885;
                if (_i886 === _a880.length - 1) break;
                _i886++;
                _s883[_i886] = 0;
              }
              if (_i886 < 0) break;
              let _g897 = 0;
              G898: {
                const _a899 = v_E;
                for (let _i900 = 0; _i900 < _a899.length; _i900++) {
                  const v_x = _a899[_i900];
                  _g897 += _f881[v_x];
                }
              }
              if (!((_g897 === _h902))) continue;
              if (true) {
                _q878 = true;
                break Q879;
              }
            }
          }
          _c903 = !(_q878);
        }
        if (!(_c903)) break L877;
        let _g904 = -1;
        G905: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h928 = (_h901 - v_j);
            let _q906 = false;
            Q907: {
              const _a908 = v_E;
              const _t917 = (_h901 - v_j);
              const _lo918 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi919 = 31 - Math.clz32(b.domain);
              for (const _e912 of _l910) _f909[_e912] = -1;
              _l910 = _a908;
              let _i914 = 0;
              _s911[0] = 0;
              let _o921 = _a908.length === 0;
              for (;;) {
                if (_a908.length === 0) {
                  if (!_o921) break;
                  _o921 = false;
                }
                while (_a908.length > 0 && _i914 >= 0) {
                  const _e912 = _a908[_i914];
                  if (_s911[_i914] > 0) _f909[_e912] = -1;
                  let _r920 = b.domain & ~((2 << _s911[_i914]) - 1);
                  let _d913 = 0;
                  V916: for (; _r920 !== 0; _r920 &= _r920 - 1) {
                    _d913 = 31 - Math.clz32(_r920 & -_r920);
                    _f909[_e912] = _d913;
                    {
                      let _t922 = _d913;
                      for (let _j915 = 0; _j915 < _i914; _j915++) _t922 += _f909[_a908[_j915]];
                      if (_t922 + (_a908.length - _i914 - 1) * _lo918 > _t917) continue;
                      if (_t922 + (_a908.length - _i914 - 1) * _hi919 < _t917) continue;
                    }
                    for (let _j915 = 0; _j915 < _i914; _j915++) {
                      const _y923 = _a908[_j915];
                      if (!(!((((_f909[_e912] === 1) && (_f909[_y923] === 1)) && (sp.adj8[_e912].includes(_y923)))))) continue V916;
                    }
                    break;
                  }
                  if (_r920 === 0) {
                    _s911[_i914] = 0;
                    _i914--;
                    continue;
                  }
                  _s911[_i914] = _d913;
                  if (_i914 === _a908.length - 1) break;
                  _i914++;
                  _s911[_i914] = 0;
                }
                if (_i914 < 0) break;
                let _g924 = 0;
                G925: {
                  const _a926 = v_E;
                  for (let _i927 = 0; _i927 < _a926.length; _i927++) {
                    const v_x = _a926[_i927];
                    _g924 += _f909[v_x];
                  }
                }
                if (!((_g924 === _h928))) continue;
                if (true) {
                  _q906 = true;
                  break Q907;
                }
              }
            }
            if (!(_q906)) continue;
            _g904 = v_j;
            break G905;
          }
        }
        const v_room = _g904;
        _g929.length = 0;
        G930: {
          _g939.length = 0;
          G940: {
            const _a943 = v_S;
            for (let _i944 = 0; _i944 < _a943.length; _i944++) {
              const v_c = _a943[_i944];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g939.push(v_c);
            }
          }
          const _a945 = _g939;
          for (let _i946 = 0; _i946 < _a945.length; _i946++) {
            const v_c = _a945[_i946];
            if (!((v_R.includes(v_c)))) continue;
            _g929.push(v_c);
          }
        }
        const v_Q = _g929;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R, L: v_L, S: v_S, n: v_n, E: v_E, room: v_room, Q: v_Q }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function crowdedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedRegionBinding> | null): number {
  const _g1056: number[] = [];
  const _g1078: number[] = [];
  const _g1088: number[] = [];
  const _f1100 = new Int32Array(sp.cells.length).fill(-1);
  let _l1101: readonly number[] = [];
  const _s1102: number[] = [];
  const _f1128 = new Int32Array(sp.cells.length).fill(-1);
  let _l1129: readonly number[] = [];
  const _s1130: number[] = [];
  const _g1148: number[] = [];
  const _g1158: number[] = [];
  const facts = crowdedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1054 = sp.cells;
  for (let _i1055 = 0; _i1055 < _a1054.length; _i1055++) {
    const v_x = _a1054[_i1055];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1064 = cl.region.of[v_x];
    _g1056.length = 0;
    G1057: {
      const _a1060 = sp.adj8[v_x];
      for (let _i1061 = 0; _i1061 < _a1060.length; _i1061++) {
        const v_p = _a1060[_i1061];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g1056.push(v_p);
      }
    }
    const v_R = _g1056;
    const _a1062 = cl.region.parts;
    for (let _i1063 = 0; _i1063 < _a1062.length; _i1063++) {
      const v_g = _a1062[_i1063];
      let _c1069: boolean = (v_g === _h1064);
      if (!_c1069) {
        let _q1065 = false;
        Q1066: {
          const _a1067 = v_R;
          for (let _i1068 = 0; _i1068 < _a1067.length; _i1068++) {
            const v_p = _a1067[_i1068];
            if ((cl.region.of[v_p] === v_g)) {
              _q1065 = true;
              break Q1066;
            }
          }
        }
        _c1069 = _q1065;
      }
      if (!(_c1069)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1070 = 0;
      G1071: {
        const _a1072 = v_S;
        for (let _i1073 = 0; _i1073 < _a1072.length; _i1073++) {
          const v_c = _a1072[_i1073];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1070++;
        }
      }
      let _g1074 = 0;
      G1075: {
        const _a1076 = setOf(v_x);
        for (let _i1077 = 0; _i1077 < _a1076.length; _i1077++) {
          const v_c = _a1076[_i1077];
          if (!((v_S.includes(v_c)))) continue;
          _g1074++;
        }
      }
      const v_n = ((cl.stars - _g1070) - _g1074);
      _g1078.length = 0;
      G1079: {
        _g1088.length = 0;
        G1089: {
          const _a1092 = v_S;
          for (let _i1093 = 0; _i1093 < _a1092.length; _i1093++) {
            const v_c = _a1092[_i1093];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1088.push(v_c);
          }
        }
        const _a1094 = _g1088;
        for (let _i1095 = 0; _i1095 < _a1094.length; _i1095++) {
          const v_c = _a1094[_i1095];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1078.push(v_c);
        }
      }
      L1096: {
        const v_E = _g1078;
        const _h1108 = v_E.length;
        const _h1120 = (2 * _h1108);
        const _h1121 = (_h1120 - v_n);
        let _c1122: boolean = (v_n > 0);
        if (_c1122) {
          let _q1097 = false;
          Q1098: {
            const _a1099 = v_E;
            const _t1109 = ((2 * _h1108) - v_n);
            const _lo1110 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1111 = 31 - Math.clz32(b.domain);
            for (const _e1103 of _l1101) _f1100[_e1103] = -1;
            _l1101 = _a1099;
            let _i1105 = 0;
            _s1102[0] = 0;
            let _o1113 = _a1099.length === 0;
            for (;;) {
              if (_a1099.length === 0) {
                if (!_o1113) break;
                _o1113 = false;
              }
              while (_a1099.length > 0 && _i1105 >= 0) {
                const _e1103 = _a1099[_i1105];
                if (_s1102[_i1105] > 0) _f1100[_e1103] = -1;
                let _r1112 = b.domain & ~((2 << _s1102[_i1105]) - 1);
                let _d1104 = 0;
                V1107: for (; _r1112 !== 0; _r1112 &= _r1112 - 1) {
                  _d1104 = 31 - Math.clz32(_r1112 & -_r1112);
                  _f1100[_e1103] = _d1104;
                  {
                    let _t1114 = _d1104;
                    for (let _j1106 = 0; _j1106 < _i1105; _j1106++) _t1114 += _f1100[_a1099[_j1106]];
                    if (_t1114 + (_a1099.length - _i1105 - 1) * _lo1110 > _t1109) continue;
                    if (_t1114 + (_a1099.length - _i1105 - 1) * _hi1111 < _t1109) continue;
                  }
                  for (let _j1106 = 0; _j1106 < _i1105; _j1106++) {
                    const _y1115 = _a1099[_j1106];
                    if (!(!((((_f1100[_e1103] === 1) && (_f1100[_y1115] === 1)) && (sp.adj8[_e1103].includes(_y1115)))))) continue V1107;
                  }
                  break;
                }
                if (_r1112 === 0) {
                  _s1102[_i1105] = 0;
                  _i1105--;
                  continue;
                }
                _s1102[_i1105] = _d1104;
                if (_i1105 === _a1099.length - 1) break;
                _i1105++;
                _s1102[_i1105] = 0;
              }
              if (_i1105 < 0) break;
              let _g1116 = 0;
              G1117: {
                const _a1118 = v_E;
                for (let _i1119 = 0; _i1119 < _a1118.length; _i1119++) {
                  const v_x = _a1118[_i1119];
                  _g1116 += _f1100[v_x];
                }
              }
              if (!((_g1116 === _h1121))) continue;
              if (true) {
                _q1097 = true;
                break Q1098;
              }
            }
          }
          _c1122 = !(_q1097);
        }
        if (!(_c1122)) break L1096;
        let _g1123 = -1;
        G1124: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1147 = (_h1120 - v_j);
            let _q1125 = false;
            Q1126: {
              const _a1127 = v_E;
              const _t1136 = (_h1120 - v_j);
              const _lo1137 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1138 = 31 - Math.clz32(b.domain);
              for (const _e1131 of _l1129) _f1128[_e1131] = -1;
              _l1129 = _a1127;
              let _i1133 = 0;
              _s1130[0] = 0;
              let _o1140 = _a1127.length === 0;
              for (;;) {
                if (_a1127.length === 0) {
                  if (!_o1140) break;
                  _o1140 = false;
                }
                while (_a1127.length > 0 && _i1133 >= 0) {
                  const _e1131 = _a1127[_i1133];
                  if (_s1130[_i1133] > 0) _f1128[_e1131] = -1;
                  let _r1139 = b.domain & ~((2 << _s1130[_i1133]) - 1);
                  let _d1132 = 0;
                  V1135: for (; _r1139 !== 0; _r1139 &= _r1139 - 1) {
                    _d1132 = 31 - Math.clz32(_r1139 & -_r1139);
                    _f1128[_e1131] = _d1132;
                    {
                      let _t1141 = _d1132;
                      for (let _j1134 = 0; _j1134 < _i1133; _j1134++) _t1141 += _f1128[_a1127[_j1134]];
                      if (_t1141 + (_a1127.length - _i1133 - 1) * _lo1137 > _t1136) continue;
                      if (_t1141 + (_a1127.length - _i1133 - 1) * _hi1138 < _t1136) continue;
                    }
                    for (let _j1134 = 0; _j1134 < _i1133; _j1134++) {
                      const _y1142 = _a1127[_j1134];
                      if (!(!((((_f1128[_e1131] === 1) && (_f1128[_y1142] === 1)) && (sp.adj8[_e1131].includes(_y1142)))))) continue V1135;
                    }
                    break;
                  }
                  if (_r1139 === 0) {
                    _s1130[_i1133] = 0;
                    _i1133--;
                    continue;
                  }
                  _s1130[_i1133] = _d1132;
                  if (_i1133 === _a1127.length - 1) break;
                  _i1133++;
                  _s1130[_i1133] = 0;
                }
                if (_i1133 < 0) break;
                let _g1143 = 0;
                G1144: {
                  const _a1145 = v_E;
                  for (let _i1146 = 0; _i1146 < _a1145.length; _i1146++) {
                    const v_x = _a1145[_i1146];
                    _g1143 += _f1128[v_x];
                  }
                }
                if (!((_g1143 === _h1147))) continue;
                if (true) {
                  _q1125 = true;
                  break Q1126;
                }
              }
            }
            if (!(_q1125)) continue;
            _g1123 = v_j;
            break G1124;
          }
        }
        const v_room = _g1123;
        _g1148.length = 0;
        G1149: {
          _g1158.length = 0;
          G1159: {
            const _a1162 = v_S;
            for (let _i1163 = 0; _i1163 < _a1162.length; _i1163++) {
              const v_c = _a1162[_i1163];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1158.push(v_c);
            }
          }
          const _a1164 = _g1158;
          for (let _i1165 = 0; _i1165 < _a1164.length; _i1165++) {
            const v_c = _a1164[_i1165];
            if (!((v_R.includes(v_c)))) continue;
            _g1148.push(v_c);
          }
        }
        const v_Q = _g1148;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R, g: v_g, S: v_S, n: v_n, E: v_E, room: v_room, Q: v_Q }, facts)) return 1;
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
  const _g1320: number[] = [];
  const _g1365: number[] = [];
  const _g1383: number[] = [];
  const _g1428: number[] = [];
  const _g1448: number[] = [];
  const _g1460: number[] = [];
  const _g1475: number[] = [];
  const facts = bandedFacts;
  let fired = 0;
  let changed = false;
  const _t1311 = (sp.w - 2);
  for (let v_k = 2; v_k <= _t1311; v_k++) {
    const _h1312 = (sp.w - v_k);
    const _h1317 = (v_k - 1);
    const _h1318 = (_h1317 * cl.stars);
    for (let v_dir = 0; v_dir <= 1; v_dir++) {
      for (let v_a = 0; v_a <= _h1312; v_a++) {
        const v_B = band(sp, v_k, v_dir, v_a);
        let _g1313 = 0;
        G1314: {
          const _a1315 = v_B;
          for (let _i1316 = 0; _i1316 < _a1315.length; _i1316++) {
            const v_c = _a1315[_i1316];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1313++;
          }
        }
        L1319: {
          const v_n = ((cl.stars - _g1313) + _h1318);
          if (!((v_n > 0))) break L1319;
          _g1320.length = 0;
          G1321: {
            const _a1348 = cl.region.parts;
            for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
              const v_r = _a1348[_i1349];
              const _t1350 = cl.region.cells[v_r];
              let _g1351 = 0;
              G1352: {
                const _a1353 = _t1350;
                for (let _i1354 = 0; _i1354 < _a1353.length; _i1354++) {
                  const v_c = _a1353[_i1354];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1351++;
                }
              }
              let _c1373: boolean = ((cl.stars - _g1351) > 0);
              if (_c1373) {
                let _q1362 = true;
                Q1363: {
                  const _t1364 = cl.region.cells[v_r];
                  _g1365.length = 0;
                  G1366: {
                    const _a1369 = _t1364;
                    for (let _i1370 = 0; _i1370 < _a1369.length; _i1370++) {
                      const v_c = _a1369[_i1370];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1365.push(v_c);
                    }
                  }
                  const _a1371 = _g1365;
                  for (let _i1372 = 0; _i1372 < _a1371.length; _i1372++) {
                    const v_c = _a1371[_i1372];
                    if (!((v_B.includes(v_c)))) {
                      _q1362 = false;
                      break Q1363;
                    }
                  }
                }
                _c1373 = _q1362;
              }
              if (!(_c1373)) continue;
              _g1320.push(v_r);
            }
          }
          const v_I = _g1320;
          let _g1374 = 0;
          G1375: {
            const _a1376 = v_I;
            for (let _i1377 = 0; _i1377 < _a1376.length; _i1377++) {
              const v_r = _a1376[_i1377];
              const _t1378 = cl.region.cells[v_r];
              let _g1379 = 0;
              G1380: {
                const _a1381 = _t1378;
                for (let _i1382 = 0; _i1382 < _a1381.length; _i1382++) {
                  const v_c = _a1381[_i1382];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1379++;
                }
              }
              _g1374 += (cl.stars - _g1379);
            }
          }
          const v_mi = _g1374;
          _g1383.length = 0;
          G1384: {
            const _a1411 = cl.region.parts;
            for (let _i1412 = 0; _i1412 < _a1411.length; _i1412++) {
              const v_r = _a1411[_i1412];
              const _t1413 = cl.region.cells[v_r];
              let _g1414 = 0;
              G1415: {
                const _a1416 = _t1413;
                for (let _i1417 = 0; _i1417 < _a1416.length; _i1417++) {
                  const v_c = _a1416[_i1417];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1414++;
                }
              }
              let _c1436: boolean = ((cl.stars - _g1414) > 0);
              if (_c1436) {
                let _q1425 = false;
                Q1426: {
                  const _t1427 = cl.region.cells[v_r];
                  _g1428.length = 0;
                  G1429: {
                    const _a1432 = _t1427;
                    for (let _i1433 = 0; _i1433 < _a1432.length; _i1433++) {
                      const v_c = _a1432[_i1433];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1428.push(v_c);
                    }
                  }
                  const _a1434 = _g1428;
                  for (let _i1435 = 0; _i1435 < _a1434.length; _i1435++) {
                    const v_c = _a1434[_i1435];
                    if ((v_B.includes(v_c))) {
                      _q1425 = true;
                      break Q1426;
                    }
                  }
                }
                _c1436 = _q1425;
              }
              if (!(_c1436)) continue;
              _g1383.push(v_r);
            }
          }
          const v_R = _g1383;
          let _g1437 = 0;
          G1438: {
            const _a1439 = v_R;
            for (let _i1440 = 0; _i1440 < _a1439.length; _i1440++) {
              const v_r = _a1439[_i1440];
              const _t1441 = cl.region.cells[v_r];
              let _g1442 = 0;
              G1443: {
                const _a1444 = _t1441;
                for (let _i1445 = 0; _i1445 < _a1444.length; _i1445++) {
                  const v_c = _a1444[_i1445];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1442++;
                }
              }
              _g1437 += (cl.stars - _g1442);
            }
          }
          const v_mr = _g1437;
          let _c1456: boolean = (v_mi === v_n);
          if (_c1456) {
            let _q1446 = false;
            Q1447: {
              _g1448.length = 0;
              G1449: {
                const _a1452 = v_B;
                for (let _i1453 = 0; _i1453 < _a1452.length; _i1453++) {
                  const v_c = _a1452[_i1453];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g1448.push(v_c);
                }
              }
              const _a1454 = _g1448;
              for (let _i1455 = 0; _i1455 < _a1454.length; _i1455++) {
                const v_c = _a1454[_i1455];
                if (!(v_I.includes(cl.region.of[v_c]))) {
                  _q1446 = true;
                  break Q1447;
                }
              }
            }
            _c1456 = _q1446;
          }
          L1457: {
            const v_lines = _c1456;
            if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L1457;
            facts.length = 0;
            changed = false;
            let _c1469: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
            if (_c1469) {
              let _c1468: boolean = !(v_lines);
              if (!_c1468) {
                let _q1458 = true;
                Q1459: {
                  _g1460.length = 0;
                  G1461: {
                    const _a1464 = v_B;
                    for (let _i1465 = 0; _i1465 < _a1464.length; _i1465++) {
                      const v_c = _a1464[_i1465];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1460.push(v_c);
                    }
                  }
                  const _a1466 = _g1460;
                  for (let _i1467 = 0; _i1467 < _a1466.length; _i1467++) {
                    const v_c = _a1466[_i1467];
                    if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q1458 = false;
                      break Q1459;
                    }
                  }
                }
                _c1468 = _q1458;
              }
              _c1469 = _c1468;
            }
            let _c1484: boolean = _c1469;
            if (_c1484) {
              let _c1483: boolean = (v_lines || (v_mr > v_n));
              if (!_c1483) {
                let _q1470 = true;
                Q1471: {
                  const _a1472 = v_R;
                  for (let _i1473 = 0; _i1473 < _a1472.length; _i1473++) {
                    const v_r = _a1472[_i1473];
                    const _t1474 = cl.region.cells[v_r];
                    _g1475.length = 0;
                    G1476: {
                      const _a1479 = _t1474;
                      for (let _i1480 = 0; _i1480 < _a1479.length; _i1480++) {
                        const v_c = _a1479[_i1480];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g1475.push(v_c);
                      }
                    }
                    const _a1481 = _g1475;
                    for (let _i1482 = 0; _i1482 < _a1481.length; _i1482++) {
                      const v_c = _a1481[_i1482];
                      if (!(!(v_B.includes(v_c)))) continue;
                      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                      if (!(true)) {
                        _q1470 = false;
                        break Q1471;
                      }
                    }
                  }
                }
                _c1483 = _q1470;
              }
              _c1484 = _c1483;
            }
            if (!(_c1484)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ k: v_k, dir: v_dir, a: v_a, B: v_B, n: v_n, I: v_I, mi: v_mi, R: v_R, mr: v_mr, lines: v_lines }, facts)) return 1;
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

/** Its dearest read grows with the board as n^1.5. */
export function starvedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedLineBinding> | null): number {
  const _g1655: number[] = [];
  const _g1665: number[] = [];
  const _f1677 = new Int32Array(sp.cells.length).fill(-1);
  let _l1678: readonly number[] = [];
  const _s1679: number[] = [];
  const _f1705 = new Int32Array(sp.cells.length).fill(-1);
  let _l1706: readonly number[] = [];
  const _s1707: number[] = [];
  const _g1725: number[] = [];
  const _g1735: number[] = [];
  const facts = starvedLineFacts;
  let fired = 0;
  let changed = false;
  const _a1636 = sp.cells;
  for (let _i1637 = 0; _i1637 < _a1636.length; _i1637++) {
    const v_x = _a1636[_i1637];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1640 = sp.rowOf[v_x];
    const _h1641 = sp.colOf[v_x];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1638 = sp.lines;
    for (let _i1639 = 0; _i1639 < _a1638.length; _i1639++) {
      const v_L = _a1638[_i1639];
      let _c1646: boolean = ((v_L === _h1640) || (v_L === _h1641));
      if (!_c1646) {
        let _q1642 = false;
        Q1643: {
          const _a1644 = v_R;
          for (let _i1645 = 0; _i1645 < _a1644.length; _i1645++) {
            const v_p = _a1644[_i1645];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q1642 = true;
              break Q1643;
            }
          }
        }
        _c1646 = _q1642;
      }
      if (!(_c1646)) continue;
      const v_S = sp.lineCells[v_L];
      let _g1647 = 0;
      G1648: {
        const _a1649 = v_S;
        for (let _i1650 = 0; _i1650 < _a1649.length; _i1650++) {
          const v_c = _a1649[_i1650];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1647++;
        }
      }
      let _g1651 = 0;
      G1652: {
        const _a1653 = setOf(v_x);
        for (let _i1654 = 0; _i1654 < _a1653.length; _i1654++) {
          const v_c = _a1653[_i1654];
          if (!((v_S.includes(v_c)))) continue;
          _g1651++;
        }
      }
      const v_n = ((cl.stars - _g1647) - _g1651);
      _g1655.length = 0;
      G1656: {
        _g1665.length = 0;
        G1666: {
          const _a1669 = v_S;
          for (let _i1670 = 0; _i1670 < _a1669.length; _i1670++) {
            const v_c = _a1669[_i1670];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1665.push(v_c);
          }
        }
        const _a1671 = _g1665;
        for (let _i1672 = 0; _i1672 < _a1671.length; _i1672++) {
          const v_c = _a1671[_i1672];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1655.push(v_c);
        }
      }
      L1673: {
        const v_E = _g1655;
        const _h1685 = v_E.length;
        const _h1697 = (2 * _h1685);
        const _h1698 = (_h1697 - v_n);
        let _c1699: boolean = (v_n > 0);
        if (_c1699) {
          let _q1674 = false;
          Q1675: {
            const _a1676 = v_E;
            const _t1686 = ((2 * _h1685) - v_n);
            const _lo1687 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1688 = 31 - Math.clz32(b.domain);
            for (const _e1680 of _l1678) _f1677[_e1680] = -1;
            _l1678 = _a1676;
            let _i1682 = 0;
            _s1679[0] = 0;
            let _o1690 = _a1676.length === 0;
            for (;;) {
              if (_a1676.length === 0) {
                if (!_o1690) break;
                _o1690 = false;
              }
              while (_a1676.length > 0 && _i1682 >= 0) {
                const _e1680 = _a1676[_i1682];
                if (_s1679[_i1682] > 0) _f1677[_e1680] = -1;
                let _r1689 = b.domain & ~((2 << _s1679[_i1682]) - 1);
                let _d1681 = 0;
                V1684: for (; _r1689 !== 0; _r1689 &= _r1689 - 1) {
                  _d1681 = 31 - Math.clz32(_r1689 & -_r1689);
                  _f1677[_e1680] = _d1681;
                  {
                    let _t1691 = _d1681;
                    for (let _j1683 = 0; _j1683 < _i1682; _j1683++) _t1691 += _f1677[_a1676[_j1683]];
                    if (_t1691 + (_a1676.length - _i1682 - 1) * _lo1687 > _t1686) continue;
                    if (_t1691 + (_a1676.length - _i1682 - 1) * _hi1688 < _t1686) continue;
                  }
                  for (let _j1683 = 0; _j1683 < _i1682; _j1683++) {
                    const _y1692 = _a1676[_j1683];
                    if (!(!((((_f1677[_e1680] === 1) && (_f1677[_y1692] === 1)) && (sp.adj8[_e1680].includes(_y1692)))))) continue V1684;
                  }
                  break;
                }
                if (_r1689 === 0) {
                  _s1679[_i1682] = 0;
                  _i1682--;
                  continue;
                }
                _s1679[_i1682] = _d1681;
                if (_i1682 === _a1676.length - 1) break;
                _i1682++;
                _s1679[_i1682] = 0;
              }
              if (_i1682 < 0) break;
              let _g1693 = 0;
              G1694: {
                const _a1695 = v_E;
                for (let _i1696 = 0; _i1696 < _a1695.length; _i1696++) {
                  const v_x = _a1695[_i1696];
                  _g1693 += _f1677[v_x];
                }
              }
              if (!((_g1693 === _h1698))) continue;
              if (true) {
                _q1674 = true;
                break Q1675;
              }
            }
          }
          _c1699 = !(_q1674);
        }
        if (!(_c1699)) break L1673;
        let _g1700 = -1;
        G1701: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1724 = (_h1697 - v_j);
            let _q1702 = false;
            Q1703: {
              const _a1704 = v_E;
              const _t1713 = (_h1697 - v_j);
              const _lo1714 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1715 = 31 - Math.clz32(b.domain);
              for (const _e1708 of _l1706) _f1705[_e1708] = -1;
              _l1706 = _a1704;
              let _i1710 = 0;
              _s1707[0] = 0;
              let _o1717 = _a1704.length === 0;
              for (;;) {
                if (_a1704.length === 0) {
                  if (!_o1717) break;
                  _o1717 = false;
                }
                while (_a1704.length > 0 && _i1710 >= 0) {
                  const _e1708 = _a1704[_i1710];
                  if (_s1707[_i1710] > 0) _f1705[_e1708] = -1;
                  let _r1716 = b.domain & ~((2 << _s1707[_i1710]) - 1);
                  let _d1709 = 0;
                  V1712: for (; _r1716 !== 0; _r1716 &= _r1716 - 1) {
                    _d1709 = 31 - Math.clz32(_r1716 & -_r1716);
                    _f1705[_e1708] = _d1709;
                    {
                      let _t1718 = _d1709;
                      for (let _j1711 = 0; _j1711 < _i1710; _j1711++) _t1718 += _f1705[_a1704[_j1711]];
                      if (_t1718 + (_a1704.length - _i1710 - 1) * _lo1714 > _t1713) continue;
                      if (_t1718 + (_a1704.length - _i1710 - 1) * _hi1715 < _t1713) continue;
                    }
                    for (let _j1711 = 0; _j1711 < _i1710; _j1711++) {
                      const _y1719 = _a1704[_j1711];
                      if (!(!((((_f1705[_e1708] === 1) && (_f1705[_y1719] === 1)) && (sp.adj8[_e1708].includes(_y1719)))))) continue V1712;
                    }
                    break;
                  }
                  if (_r1716 === 0) {
                    _s1707[_i1710] = 0;
                    _i1710--;
                    continue;
                  }
                  _s1707[_i1710] = _d1709;
                  if (_i1710 === _a1704.length - 1) break;
                  _i1710++;
                  _s1707[_i1710] = 0;
                }
                if (_i1710 < 0) break;
                let _g1720 = 0;
                G1721: {
                  const _a1722 = v_E;
                  for (let _i1723 = 0; _i1723 < _a1722.length; _i1723++) {
                    const v_x = _a1722[_i1723];
                    _g1720 += _f1705[v_x];
                  }
                }
                if (!((_g1720 === _h1724))) continue;
                if (true) {
                  _q1702 = true;
                  break Q1703;
                }
              }
            }
            if (!(_q1702)) continue;
            _g1700 = v_j;
            break G1701;
          }
        }
        const v_room = _g1700;
        _g1725.length = 0;
        G1726: {
          _g1735.length = 0;
          G1736: {
            const _a1739 = v_S;
            for (let _i1740 = 0; _i1740 < _a1739.length; _i1740++) {
              const v_c = _a1739[_i1740];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1735.push(v_c);
            }
          }
          const _a1741 = _g1735;
          for (let _i1742 = 0; _i1742 < _a1741.length; _i1742++) {
            const v_c = _a1741[_i1742];
            if (!((v_R.includes(v_c)))) continue;
            _g1725.push(v_c);
          }
        }
        const v_Q = _g1725;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R, L: v_L, S: v_S, n: v_n, E: v_E, room: v_room, Q: v_Q }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function starvedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedRegionBinding> | null): number {
  const _g1862: number[] = [];
  const _g1872: number[] = [];
  const _f1884 = new Int32Array(sp.cells.length).fill(-1);
  let _l1885: readonly number[] = [];
  const _s1886: number[] = [];
  const _f1912 = new Int32Array(sp.cells.length).fill(-1);
  let _l1913: readonly number[] = [];
  const _s1914: number[] = [];
  const _g1932: number[] = [];
  const _g1942: number[] = [];
  const facts = starvedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1844 = sp.cells;
  for (let _i1845 = 0; _i1845 < _a1844.length; _i1845++) {
    const v_x = _a1844[_i1845];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1848 = cl.region.of[v_x];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1846 = cl.region.parts;
    for (let _i1847 = 0; _i1847 < _a1846.length; _i1847++) {
      const v_g = _a1846[_i1847];
      let _c1853: boolean = (v_g === _h1848);
      if (!_c1853) {
        let _q1849 = false;
        Q1850: {
          const _a1851 = v_R;
          for (let _i1852 = 0; _i1852 < _a1851.length; _i1852++) {
            const v_p = _a1851[_i1852];
            if ((cl.region.of[v_p] === v_g)) {
              _q1849 = true;
              break Q1850;
            }
          }
        }
        _c1853 = _q1849;
      }
      if (!(_c1853)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1854 = 0;
      G1855: {
        const _a1856 = v_S;
        for (let _i1857 = 0; _i1857 < _a1856.length; _i1857++) {
          const v_c = _a1856[_i1857];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1854++;
        }
      }
      let _g1858 = 0;
      G1859: {
        const _a1860 = setOf(v_x);
        for (let _i1861 = 0; _i1861 < _a1860.length; _i1861++) {
          const v_c = _a1860[_i1861];
          if (!((v_S.includes(v_c)))) continue;
          _g1858++;
        }
      }
      const v_n = ((cl.stars - _g1854) - _g1858);
      _g1862.length = 0;
      G1863: {
        _g1872.length = 0;
        G1873: {
          const _a1876 = v_S;
          for (let _i1877 = 0; _i1877 < _a1876.length; _i1877++) {
            const v_c = _a1876[_i1877];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1872.push(v_c);
          }
        }
        const _a1878 = _g1872;
        for (let _i1879 = 0; _i1879 < _a1878.length; _i1879++) {
          const v_c = _a1878[_i1879];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1862.push(v_c);
        }
      }
      L1880: {
        const v_E = _g1862;
        const _h1892 = v_E.length;
        const _h1904 = (2 * _h1892);
        const _h1905 = (_h1904 - v_n);
        let _c1906: boolean = (v_n > 0);
        if (_c1906) {
          let _q1881 = false;
          Q1882: {
            const _a1883 = v_E;
            const _t1893 = ((2 * _h1892) - v_n);
            const _lo1894 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1895 = 31 - Math.clz32(b.domain);
            for (const _e1887 of _l1885) _f1884[_e1887] = -1;
            _l1885 = _a1883;
            let _i1889 = 0;
            _s1886[0] = 0;
            let _o1897 = _a1883.length === 0;
            for (;;) {
              if (_a1883.length === 0) {
                if (!_o1897) break;
                _o1897 = false;
              }
              while (_a1883.length > 0 && _i1889 >= 0) {
                const _e1887 = _a1883[_i1889];
                if (_s1886[_i1889] > 0) _f1884[_e1887] = -1;
                let _r1896 = b.domain & ~((2 << _s1886[_i1889]) - 1);
                let _d1888 = 0;
                V1891: for (; _r1896 !== 0; _r1896 &= _r1896 - 1) {
                  _d1888 = 31 - Math.clz32(_r1896 & -_r1896);
                  _f1884[_e1887] = _d1888;
                  {
                    let _t1898 = _d1888;
                    for (let _j1890 = 0; _j1890 < _i1889; _j1890++) _t1898 += _f1884[_a1883[_j1890]];
                    if (_t1898 + (_a1883.length - _i1889 - 1) * _lo1894 > _t1893) continue;
                    if (_t1898 + (_a1883.length - _i1889 - 1) * _hi1895 < _t1893) continue;
                  }
                  for (let _j1890 = 0; _j1890 < _i1889; _j1890++) {
                    const _y1899 = _a1883[_j1890];
                    if (!(!((((_f1884[_e1887] === 1) && (_f1884[_y1899] === 1)) && (sp.adj8[_e1887].includes(_y1899)))))) continue V1891;
                  }
                  break;
                }
                if (_r1896 === 0) {
                  _s1886[_i1889] = 0;
                  _i1889--;
                  continue;
                }
                _s1886[_i1889] = _d1888;
                if (_i1889 === _a1883.length - 1) break;
                _i1889++;
                _s1886[_i1889] = 0;
              }
              if (_i1889 < 0) break;
              let _g1900 = 0;
              G1901: {
                const _a1902 = v_E;
                for (let _i1903 = 0; _i1903 < _a1902.length; _i1903++) {
                  const v_x = _a1902[_i1903];
                  _g1900 += _f1884[v_x];
                }
              }
              if (!((_g1900 === _h1905))) continue;
              if (true) {
                _q1881 = true;
                break Q1882;
              }
            }
          }
          _c1906 = !(_q1881);
        }
        if (!(_c1906)) break L1880;
        let _g1907 = -1;
        G1908: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1931 = (_h1904 - v_j);
            let _q1909 = false;
            Q1910: {
              const _a1911 = v_E;
              const _t1920 = (_h1904 - v_j);
              const _lo1921 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1922 = 31 - Math.clz32(b.domain);
              for (const _e1915 of _l1913) _f1912[_e1915] = -1;
              _l1913 = _a1911;
              let _i1917 = 0;
              _s1914[0] = 0;
              let _o1924 = _a1911.length === 0;
              for (;;) {
                if (_a1911.length === 0) {
                  if (!_o1924) break;
                  _o1924 = false;
                }
                while (_a1911.length > 0 && _i1917 >= 0) {
                  const _e1915 = _a1911[_i1917];
                  if (_s1914[_i1917] > 0) _f1912[_e1915] = -1;
                  let _r1923 = b.domain & ~((2 << _s1914[_i1917]) - 1);
                  let _d1916 = 0;
                  V1919: for (; _r1923 !== 0; _r1923 &= _r1923 - 1) {
                    _d1916 = 31 - Math.clz32(_r1923 & -_r1923);
                    _f1912[_e1915] = _d1916;
                    {
                      let _t1925 = _d1916;
                      for (let _j1918 = 0; _j1918 < _i1917; _j1918++) _t1925 += _f1912[_a1911[_j1918]];
                      if (_t1925 + (_a1911.length - _i1917 - 1) * _lo1921 > _t1920) continue;
                      if (_t1925 + (_a1911.length - _i1917 - 1) * _hi1922 < _t1920) continue;
                    }
                    for (let _j1918 = 0; _j1918 < _i1917; _j1918++) {
                      const _y1926 = _a1911[_j1918];
                      if (!(!((((_f1912[_e1915] === 1) && (_f1912[_y1926] === 1)) && (sp.adj8[_e1915].includes(_y1926)))))) continue V1919;
                    }
                    break;
                  }
                  if (_r1923 === 0) {
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
                let _g1927 = 0;
                G1928: {
                  const _a1929 = v_E;
                  for (let _i1930 = 0; _i1930 < _a1929.length; _i1930++) {
                    const v_x = _a1929[_i1930];
                    _g1927 += _f1912[v_x];
                  }
                }
                if (!((_g1927 === _h1931))) continue;
                if (true) {
                  _q1909 = true;
                  break Q1910;
                }
              }
            }
            if (!(_q1909)) continue;
            _g1907 = v_j;
            break G1908;
          }
        }
        const v_room = _g1907;
        _g1932.length = 0;
        G1933: {
          _g1942.length = 0;
          G1943: {
            const _a1946 = v_S;
            for (let _i1947 = 0; _i1947 < _a1946.length; _i1947++) {
              const v_c = _a1946[_i1947];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1942.push(v_c);
            }
          }
          const _a1948 = _g1942;
          for (let _i1949 = 0; _i1949 < _a1948.length; _i1949++) {
            const v_c = _a1948[_i1949];
            if (!((v_R.includes(v_c)))) continue;
            _g1932.push(v_c);
          }
        }
        const v_Q = _g1932;
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, R: v_R, g: v_g, S: v_S, n: v_n, E: v_E, room: v_room, Q: v_Q }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

const bandKept = keptStore<Kept<Kept<readonly number[]>>>();

/** `band(k, dir, a)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function band(sp: GridSpace, v_k: number, v_dir: number, v_a: number): readonly number[] {
  const _kept: Kept<Kept<Kept<readonly number[]>>> = bandKept.board(sp);
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
  const _g1487: number[] = [];
  G1488: {
    const _a1513 = sp.cells;
    for (let _i1514 = 0; _i1514 < _a1513.length; _i1514++) {
      const v_p = _a1513[_i1514];
      let _c1536: boolean = (!((b.grid[v_p] !== 0)) && (v_p !== v_x));
      if (_c1536) {
        let _c1521: boolean = (sp.adj8[v_x].includes(v_p));
        if (!_c1521) {
          let _c1520: boolean = (sp.rowOf[v_p] === sp.rowOf[v_x]);
          if (_c1520) {
            const _t1515 = sp.lineCells[sp.rowOf[v_x]];
            let _g1516 = 0;
            G1517: {
              const _a1518 = _t1515;
              for (let _i1519 = 0; _i1519 < _a1518.length; _i1519++) {
                const v_c = _a1518[_i1519];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1516++;
              }
            }
            _c1520 = ((cl.stars - _g1516) === 1);
          }
          _c1521 = _c1520;
        }
        let _c1528: boolean = _c1521;
        if (!_c1528) {
          let _c1527: boolean = (sp.colOf[v_p] === sp.colOf[v_x]);
          if (_c1527) {
            const _t1522 = sp.lineCells[sp.colOf[v_x]];
            let _g1523 = 0;
            G1524: {
              const _a1525 = _t1522;
              for (let _i1526 = 0; _i1526 < _a1525.length; _i1526++) {
                const v_c = _a1525[_i1526];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1523++;
              }
            }
            _c1527 = ((cl.stars - _g1523) === 1);
          }
          _c1528 = _c1527;
        }
        let _c1535: boolean = _c1528;
        if (!_c1535) {
          let _c1534: boolean = (cl.region.of[v_p] === cl.region.of[v_x]);
          if (_c1534) {
            const _t1529 = cl.region.cells[cl.region.of[v_x]];
            let _g1530 = 0;
            G1531: {
              const _a1532 = _t1529;
              for (let _i1533 = 0; _i1533 < _a1532.length; _i1533++) {
                const v_c = _a1532[_i1533];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1530++;
              }
            }
            _c1534 = ((cl.stars - _g1530) === 1);
          }
          _c1535 = _c1534;
        }
        _c1536 = _c1535;
      }
      if (!(_c1536)) continue;
      _g1487.push(v_p);
    }
  }
  const _made = _g1487;
  _kept[v_x] = _made;
  return _made;
}
