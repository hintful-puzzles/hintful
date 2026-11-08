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
  let _q1942 = true;
  Q1943: {
    const _a1944 = sp.lines;
    for (let _i1945 = 0; _i1945 < _a1944.length; _i1945++) {
      const v_L = _a1944[_i1945];
      let _g1946 = 0;
      G1947: {
        const _a1948 = sp.lineCells[v_L];
        for (let _i1949 = 0; _i1949 < _a1948.length; _i1949++) {
          const v_c = _a1948[_i1949];
          const _h1950 = (g[v_c] || -1);
          if (!((_h1950 === 1))) continue;
          _g1946++;
        }
      }
      if (!((_g1946 === cl.stars))) {
        _q1942 = false;
        break Q1943;
      }
    }
  }
  if (!(_q1942)) return false;
  let _q1951 = true;
  Q1952: {
    const _a1953 = cl.region.parts;
    for (let _i1954 = 0; _i1954 < _a1953.length; _i1954++) {
      const v_r = _a1953[_i1954];
      let _g1955 = 0;
      G1956: {
        const _a1957 = cl.region.cells[v_r];
        for (let _i1958 = 0; _i1958 < _a1957.length; _i1958++) {
          const v_c = _a1957[_i1958];
          const _h1959 = (g[v_c] || -1);
          if (!((_h1959 === 1))) continue;
          _g1955++;
        }
      }
      if (!((_g1955 === cl.stars))) {
        _q1951 = false;
        break Q1952;
      }
    }
  }
  if (!(_q1951)) return false;
  let _q1960 = true;
  Q1961: {
    const _a1962 = sp.cells;
    for (let _i1963 = 0; _i1963 < _a1962.length; _i1963++) {
      const v_a = _a1962[_i1963];
      const _h1964 = (g[v_a] || -1);
      if (!((_h1964 === 1))) continue;
      let _q1965 = true;
      Q1966: {
        const _a1967 = sp.adj8[v_a];
        for (let _i1968 = 0; _i1968 < _a1967.length; _i1968++) {
          const v_b = _a1967[_i1968];
          const _h1969 = (g[v_b] || -1);
          if (!((_h1969 !== 1))) {
            _q1965 = false;
            break Q1966;
          }
        }
      }
      if (!(_q1965)) {
        _q1960 = false;
        break Q1961;
      }
    }
  }
  if (!(_q1960)) return false;
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

/** Its dearest read grows with the board as n^1.5. */
export function crowdedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedLineBinding> | null): number {
  const _g835: number[] = [];
  const _g857: number[] = [];
  const _g867: number[] = [];
  const _f879 = new Int32Array(sp.cells.length).fill(-1);
  let _l880: readonly number[] = [];
  const _s881: number[] = [];
  const _f907 = new Int32Array(sp.cells.length).fill(-1);
  let _l908: readonly number[] = [];
  const _s909: number[] = [];
  const _g927: number[] = [];
  const _g937: number[] = [];
  const facts = crowdedLineFacts;
  let fired = 0;
  let changed = false;
  const _a833 = sp.cells;
  for (let _i834 = 0; _i834 < _a833.length; _i834++) {
    const v_x = _a833[_i834];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h843 = sp.rowOf[v_x];
    const _h844 = sp.colOf[v_x];
    _g835.length = 0;
    G836: {
      const _a839 = sp.adj8[v_x];
      for (let _i840 = 0; _i840 < _a839.length; _i840++) {
        const v_p = _a839[_i840];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g835.push(v_p);
      }
    }
    const v_R = _g835;
    const _a841 = sp.lines;
    for (let _i842 = 0; _i842 < _a841.length; _i842++) {
      const v_L = _a841[_i842];
      let _c849: boolean = ((v_L === _h843) || (v_L === _h844));
      if (!_c849) {
        let _q845 = false;
        Q846: {
          const _a847 = v_R;
          for (let _i848 = 0; _i848 < _a847.length; _i848++) {
            const v_p = _a847[_i848];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q845 = true;
              break Q846;
            }
          }
        }
        _c849 = _q845;
      }
      if (!(_c849)) continue;
      const v_S = sp.lineCells[v_L];
      let _g850 = 0;
      G851: {
        const _a852 = v_S;
        for (let _i853 = 0; _i853 < _a852.length; _i853++) {
          const v_c = _a852[_i853];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g850++;
        }
      }
      let _g854 = 0;
      G855: {
        for (let _i856 = 0; _i856 < 1; _i856++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g854++;
        }
      }
      const v_n = ((cl.stars - _g850) - _g854);
      _g857.length = 0;
      G858: {
        _g867.length = 0;
        G868: {
          const _a871 = v_S;
          for (let _i872 = 0; _i872 < _a871.length; _i872++) {
            const v_c = _a871[_i872];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g867.push(v_c);
          }
        }
        const _a873 = _g867;
        for (let _i874 = 0; _i874 < _a873.length; _i874++) {
          const v_c = _a873[_i874];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g857.push(v_c);
        }
      }
      L875: {
        const v_E = _g857;
        const _h887 = v_E.length;
        const _h899 = (2 * _h887);
        const _h900 = (_h899 - v_n);
        let _c901: boolean = (v_n > 0);
        if (_c901) {
          let _q876 = false;
          Q877: {
            const _a878 = v_E;
            const _t888 = ((2 * _h887) - v_n);
            const _lo889 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi890 = 31 - Math.clz32(b.domain);
            for (const _e882 of _l880) _f879[_e882] = -1;
            _l880 = _a878;
            let _i884 = 0;
            _s881[0] = 0;
            let _o892 = _a878.length === 0;
            for (;;) {
              if (_a878.length === 0) {
                if (!_o892) break;
                _o892 = false;
              }
              while (_a878.length > 0 && _i884 >= 0) {
                const _e882 = _a878[_i884];
                if (_s881[_i884] > 0) _f879[_e882] = -1;
                let _r891 = b.domain & ~((2 << _s881[_i884]) - 1);
                let _d883 = 0;
                V886: for (; _r891 !== 0; _r891 &= _r891 - 1) {
                  _d883 = 31 - Math.clz32(_r891 & -_r891);
                  _f879[_e882] = _d883;
                  {
                    let _t893 = _d883;
                    for (let _j885 = 0; _j885 < _i884; _j885++) _t893 += _f879[_a878[_j885]];
                    if (_t893 + (_a878.length - _i884 - 1) * _lo889 > _t888) continue;
                    if (_t893 + (_a878.length - _i884 - 1) * _hi890 < _t888) continue;
                  }
                  for (let _j885 = 0; _j885 < _i884; _j885++) {
                    const _y894 = _a878[_j885];
                    if (!(!((((_f879[_e882] === 1) && (_f879[_y894] === 1)) && (sp.adj8[_e882].includes(_y894)))))) continue V886;
                  }
                  break;
                }
                if (_r891 === 0) {
                  _s881[_i884] = 0;
                  _i884--;
                  continue;
                }
                _s881[_i884] = _d883;
                if (_i884 === _a878.length - 1) break;
                _i884++;
                _s881[_i884] = 0;
              }
              if (_i884 < 0) break;
              let _g895 = 0;
              G896: {
                const _a897 = v_E;
                for (let _i898 = 0; _i898 < _a897.length; _i898++) {
                  const v_x = _a897[_i898];
                  _g895 += _f879[v_x];
                }
              }
              if (!((_g895 === _h900))) continue;
              if (true) {
                _q876 = true;
                break Q877;
              }
            }
          }
          _c901 = !(_q876);
        }
        if (!(_c901)) break L875;
        let _g902 = -1;
        G903: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h926 = (_h899 - v_j);
            let _q904 = false;
            Q905: {
              const _a906 = v_E;
              const _t915 = (_h899 - v_j);
              const _lo916 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi917 = 31 - Math.clz32(b.domain);
              for (const _e910 of _l908) _f907[_e910] = -1;
              _l908 = _a906;
              let _i912 = 0;
              _s909[0] = 0;
              let _o919 = _a906.length === 0;
              for (;;) {
                if (_a906.length === 0) {
                  if (!_o919) break;
                  _o919 = false;
                }
                while (_a906.length > 0 && _i912 >= 0) {
                  const _e910 = _a906[_i912];
                  if (_s909[_i912] > 0) _f907[_e910] = -1;
                  let _r918 = b.domain & ~((2 << _s909[_i912]) - 1);
                  let _d911 = 0;
                  V914: for (; _r918 !== 0; _r918 &= _r918 - 1) {
                    _d911 = 31 - Math.clz32(_r918 & -_r918);
                    _f907[_e910] = _d911;
                    {
                      let _t920 = _d911;
                      for (let _j913 = 0; _j913 < _i912; _j913++) _t920 += _f907[_a906[_j913]];
                      if (_t920 + (_a906.length - _i912 - 1) * _lo916 > _t915) continue;
                      if (_t920 + (_a906.length - _i912 - 1) * _hi917 < _t915) continue;
                    }
                    for (let _j913 = 0; _j913 < _i912; _j913++) {
                      const _y921 = _a906[_j913];
                      if (!(!((((_f907[_e910] === 1) && (_f907[_y921] === 1)) && (sp.adj8[_e910].includes(_y921)))))) continue V914;
                    }
                    break;
                  }
                  if (_r918 === 0) {
                    _s909[_i912] = 0;
                    _i912--;
                    continue;
                  }
                  _s909[_i912] = _d911;
                  if (_i912 === _a906.length - 1) break;
                  _i912++;
                  _s909[_i912] = 0;
                }
                if (_i912 < 0) break;
                let _g922 = 0;
                G923: {
                  const _a924 = v_E;
                  for (let _i925 = 0; _i925 < _a924.length; _i925++) {
                    const v_x = _a924[_i925];
                    _g922 += _f907[v_x];
                  }
                }
                if (!((_g922 === _h926))) continue;
                if (true) {
                  _q904 = true;
                  break Q905;
                }
              }
            }
            if (!(_q904)) continue;
            _g902 = v_j;
            break G903;
          }
        }
        const v_room = _g902;
        _g927.length = 0;
        G928: {
          _g937.length = 0;
          G938: {
            const _a941 = v_S;
            for (let _i942 = 0; _i942 < _a941.length; _i942++) {
              const v_c = _a941[_i942];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g937.push(v_c);
            }
          }
          const _a943 = _g937;
          for (let _i944 = 0; _i944 < _a943.length; _i944++) {
            const v_c = _a943[_i944];
            if (!((v_R.includes(v_c)))) continue;
            _g927.push(v_c);
          }
        }
        const v_Q = _g927;
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

/** Its dearest read grows with the board as n. */
export function crowdedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedRegionBinding> | null): number {
  const _g1053: number[] = [];
  const _g1074: number[] = [];
  const _g1084: number[] = [];
  const _f1096 = new Int32Array(sp.cells.length).fill(-1);
  let _l1097: readonly number[] = [];
  const _s1098: number[] = [];
  const _f1124 = new Int32Array(sp.cells.length).fill(-1);
  let _l1125: readonly number[] = [];
  const _s1126: number[] = [];
  const _g1144: number[] = [];
  const _g1154: number[] = [];
  const facts = crowdedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1051 = sp.cells;
  for (let _i1052 = 0; _i1052 < _a1051.length; _i1052++) {
    const v_x = _a1051[_i1052];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1061 = cl.region.of[v_x];
    _g1053.length = 0;
    G1054: {
      const _a1057 = sp.adj8[v_x];
      for (let _i1058 = 0; _i1058 < _a1057.length; _i1058++) {
        const v_p = _a1057[_i1058];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g1053.push(v_p);
      }
    }
    const v_R = _g1053;
    const _a1059 = cl.region.parts;
    for (let _i1060 = 0; _i1060 < _a1059.length; _i1060++) {
      const v_g = _a1059[_i1060];
      let _c1066: boolean = (v_g === _h1061);
      if (!_c1066) {
        let _q1062 = false;
        Q1063: {
          const _a1064 = v_R;
          for (let _i1065 = 0; _i1065 < _a1064.length; _i1065++) {
            const v_p = _a1064[_i1065];
            if ((cl.region.of[v_p] === v_g)) {
              _q1062 = true;
              break Q1063;
            }
          }
        }
        _c1066 = _q1062;
      }
      if (!(_c1066)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1067 = 0;
      G1068: {
        const _a1069 = v_S;
        for (let _i1070 = 0; _i1070 < _a1069.length; _i1070++) {
          const v_c = _a1069[_i1070];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1067++;
        }
      }
      let _g1071 = 0;
      G1072: {
        for (let _i1073 = 0; _i1073 < 1; _i1073++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1071++;
        }
      }
      const v_n = ((cl.stars - _g1067) - _g1071);
      _g1074.length = 0;
      G1075: {
        _g1084.length = 0;
        G1085: {
          const _a1088 = v_S;
          for (let _i1089 = 0; _i1089 < _a1088.length; _i1089++) {
            const v_c = _a1088[_i1089];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1084.push(v_c);
          }
        }
        const _a1090 = _g1084;
        for (let _i1091 = 0; _i1091 < _a1090.length; _i1091++) {
          const v_c = _a1090[_i1091];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1074.push(v_c);
        }
      }
      L1092: {
        const v_E = _g1074;
        const _h1104 = v_E.length;
        const _h1116 = (2 * _h1104);
        const _h1117 = (_h1116 - v_n);
        let _c1118: boolean = (v_n > 0);
        if (_c1118) {
          let _q1093 = false;
          Q1094: {
            const _a1095 = v_E;
            const _t1105 = ((2 * _h1104) - v_n);
            const _lo1106 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1107 = 31 - Math.clz32(b.domain);
            for (const _e1099 of _l1097) _f1096[_e1099] = -1;
            _l1097 = _a1095;
            let _i1101 = 0;
            _s1098[0] = 0;
            let _o1109 = _a1095.length === 0;
            for (;;) {
              if (_a1095.length === 0) {
                if (!_o1109) break;
                _o1109 = false;
              }
              while (_a1095.length > 0 && _i1101 >= 0) {
                const _e1099 = _a1095[_i1101];
                if (_s1098[_i1101] > 0) _f1096[_e1099] = -1;
                let _r1108 = b.domain & ~((2 << _s1098[_i1101]) - 1);
                let _d1100 = 0;
                V1103: for (; _r1108 !== 0; _r1108 &= _r1108 - 1) {
                  _d1100 = 31 - Math.clz32(_r1108 & -_r1108);
                  _f1096[_e1099] = _d1100;
                  {
                    let _t1110 = _d1100;
                    for (let _j1102 = 0; _j1102 < _i1101; _j1102++) _t1110 += _f1096[_a1095[_j1102]];
                    if (_t1110 + (_a1095.length - _i1101 - 1) * _lo1106 > _t1105) continue;
                    if (_t1110 + (_a1095.length - _i1101 - 1) * _hi1107 < _t1105) continue;
                  }
                  for (let _j1102 = 0; _j1102 < _i1101; _j1102++) {
                    const _y1111 = _a1095[_j1102];
                    if (!(!((((_f1096[_e1099] === 1) && (_f1096[_y1111] === 1)) && (sp.adj8[_e1099].includes(_y1111)))))) continue V1103;
                  }
                  break;
                }
                if (_r1108 === 0) {
                  _s1098[_i1101] = 0;
                  _i1101--;
                  continue;
                }
                _s1098[_i1101] = _d1100;
                if (_i1101 === _a1095.length - 1) break;
                _i1101++;
                _s1098[_i1101] = 0;
              }
              if (_i1101 < 0) break;
              let _g1112 = 0;
              G1113: {
                const _a1114 = v_E;
                for (let _i1115 = 0; _i1115 < _a1114.length; _i1115++) {
                  const v_x = _a1114[_i1115];
                  _g1112 += _f1096[v_x];
                }
              }
              if (!((_g1112 === _h1117))) continue;
              if (true) {
                _q1093 = true;
                break Q1094;
              }
            }
          }
          _c1118 = !(_q1093);
        }
        if (!(_c1118)) break L1092;
        let _g1119 = -1;
        G1120: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1143 = (_h1116 - v_j);
            let _q1121 = false;
            Q1122: {
              const _a1123 = v_E;
              const _t1132 = (_h1116 - v_j);
              const _lo1133 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1134 = 31 - Math.clz32(b.domain);
              for (const _e1127 of _l1125) _f1124[_e1127] = -1;
              _l1125 = _a1123;
              let _i1129 = 0;
              _s1126[0] = 0;
              let _o1136 = _a1123.length === 0;
              for (;;) {
                if (_a1123.length === 0) {
                  if (!_o1136) break;
                  _o1136 = false;
                }
                while (_a1123.length > 0 && _i1129 >= 0) {
                  const _e1127 = _a1123[_i1129];
                  if (_s1126[_i1129] > 0) _f1124[_e1127] = -1;
                  let _r1135 = b.domain & ~((2 << _s1126[_i1129]) - 1);
                  let _d1128 = 0;
                  V1131: for (; _r1135 !== 0; _r1135 &= _r1135 - 1) {
                    _d1128 = 31 - Math.clz32(_r1135 & -_r1135);
                    _f1124[_e1127] = _d1128;
                    {
                      let _t1137 = _d1128;
                      for (let _j1130 = 0; _j1130 < _i1129; _j1130++) _t1137 += _f1124[_a1123[_j1130]];
                      if (_t1137 + (_a1123.length - _i1129 - 1) * _lo1133 > _t1132) continue;
                      if (_t1137 + (_a1123.length - _i1129 - 1) * _hi1134 < _t1132) continue;
                    }
                    for (let _j1130 = 0; _j1130 < _i1129; _j1130++) {
                      const _y1138 = _a1123[_j1130];
                      if (!(!((((_f1124[_e1127] === 1) && (_f1124[_y1138] === 1)) && (sp.adj8[_e1127].includes(_y1138)))))) continue V1131;
                    }
                    break;
                  }
                  if (_r1135 === 0) {
                    _s1126[_i1129] = 0;
                    _i1129--;
                    continue;
                  }
                  _s1126[_i1129] = _d1128;
                  if (_i1129 === _a1123.length - 1) break;
                  _i1129++;
                  _s1126[_i1129] = 0;
                }
                if (_i1129 < 0) break;
                let _g1139 = 0;
                G1140: {
                  const _a1141 = v_E;
                  for (let _i1142 = 0; _i1142 < _a1141.length; _i1142++) {
                    const v_x = _a1141[_i1142];
                    _g1139 += _f1124[v_x];
                  }
                }
                if (!((_g1139 === _h1143))) continue;
                if (true) {
                  _q1121 = true;
                  break Q1122;
                }
              }
            }
            if (!(_q1121)) continue;
            _g1119 = v_j;
            break G1120;
          }
        }
        const v_room = _g1119;
        _g1144.length = 0;
        G1145: {
          _g1154.length = 0;
          G1155: {
            const _a1158 = v_S;
            for (let _i1159 = 0; _i1159 < _a1158.length; _i1159++) {
              const v_c = _a1158[_i1159];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1154.push(v_c);
            }
          }
          const _a1160 = _g1154;
          for (let _i1161 = 0; _i1161 < _a1160.length; _i1161++) {
            const v_c = _a1160[_i1161];
            if (!((v_R.includes(v_c)))) continue;
            _g1144.push(v_c);
          }
        }
        const v_Q = _g1144;
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
  const _g1316: number[] = [];
  const _g1361: number[] = [];
  const _g1379: number[] = [];
  const _g1424: number[] = [];
  const _g1444: number[] = [];
  const _g1456: number[] = [];
  const _g1471: number[] = [];
  const facts = bandedFacts;
  let fired = 0;
  let changed = false;
  const _t1307 = (sp.w - 2);
  for (let v_k = 2; v_k <= _t1307; v_k++) {
    const _h1308 = (sp.w - v_k);
    const _h1313 = (v_k - 1);
    const _h1314 = (_h1313 * cl.stars);
    for (let v_dir = 0; v_dir <= 1; v_dir++) {
      for (let v_a = 0; v_a <= _h1308; v_a++) {
        const v_B = band(sp, v_k, v_dir, v_a);
        let _g1309 = 0;
        G1310: {
          const _a1311 = v_B;
          for (let _i1312 = 0; _i1312 < _a1311.length; _i1312++) {
            const v_c = _a1311[_i1312];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1309++;
          }
        }
        L1315: {
          const v_n = ((cl.stars - _g1309) + _h1314);
          if (!((v_n > 0))) break L1315;
          _g1316.length = 0;
          G1317: {
            const _a1344 = cl.region.parts;
            for (let _i1345 = 0; _i1345 < _a1344.length; _i1345++) {
              const v_r = _a1344[_i1345];
              const _t1346 = cl.region.cells[v_r];
              let _g1347 = 0;
              G1348: {
                const _a1349 = _t1346;
                for (let _i1350 = 0; _i1350 < _a1349.length; _i1350++) {
                  const v_c = _a1349[_i1350];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1347++;
                }
              }
              let _c1369: boolean = ((cl.stars - _g1347) > 0);
              if (_c1369) {
                let _q1358 = true;
                Q1359: {
                  const _t1360 = cl.region.cells[v_r];
                  _g1361.length = 0;
                  G1362: {
                    const _a1365 = _t1360;
                    for (let _i1366 = 0; _i1366 < _a1365.length; _i1366++) {
                      const v_c = _a1365[_i1366];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1361.push(v_c);
                    }
                  }
                  const _a1367 = _g1361;
                  for (let _i1368 = 0; _i1368 < _a1367.length; _i1368++) {
                    const v_c = _a1367[_i1368];
                    if (!((v_B.includes(v_c)))) {
                      _q1358 = false;
                      break Q1359;
                    }
                  }
                }
                _c1369 = _q1358;
              }
              if (!(_c1369)) continue;
              _g1316.push(v_r);
            }
          }
          const v_I = _g1316;
          let _g1370 = 0;
          G1371: {
            const _a1372 = v_I;
            for (let _i1373 = 0; _i1373 < _a1372.length; _i1373++) {
              const v_r = _a1372[_i1373];
              const _t1374 = cl.region.cells[v_r];
              let _g1375 = 0;
              G1376: {
                const _a1377 = _t1374;
                for (let _i1378 = 0; _i1378 < _a1377.length; _i1378++) {
                  const v_c = _a1377[_i1378];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1375++;
                }
              }
              _g1370 += (cl.stars - _g1375);
            }
          }
          const v_mi = _g1370;
          _g1379.length = 0;
          G1380: {
            const _a1407 = cl.region.parts;
            for (let _i1408 = 0; _i1408 < _a1407.length; _i1408++) {
              const v_r = _a1407[_i1408];
              const _t1409 = cl.region.cells[v_r];
              let _g1410 = 0;
              G1411: {
                const _a1412 = _t1409;
                for (let _i1413 = 0; _i1413 < _a1412.length; _i1413++) {
                  const v_c = _a1412[_i1413];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1410++;
                }
              }
              let _c1432: boolean = ((cl.stars - _g1410) > 0);
              if (_c1432) {
                let _q1421 = false;
                Q1422: {
                  const _t1423 = cl.region.cells[v_r];
                  _g1424.length = 0;
                  G1425: {
                    const _a1428 = _t1423;
                    for (let _i1429 = 0; _i1429 < _a1428.length; _i1429++) {
                      const v_c = _a1428[_i1429];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1424.push(v_c);
                    }
                  }
                  const _a1430 = _g1424;
                  for (let _i1431 = 0; _i1431 < _a1430.length; _i1431++) {
                    const v_c = _a1430[_i1431];
                    if ((v_B.includes(v_c))) {
                      _q1421 = true;
                      break Q1422;
                    }
                  }
                }
                _c1432 = _q1421;
              }
              if (!(_c1432)) continue;
              _g1379.push(v_r);
            }
          }
          const v_R = _g1379;
          let _g1433 = 0;
          G1434: {
            const _a1435 = v_R;
            for (let _i1436 = 0; _i1436 < _a1435.length; _i1436++) {
              const v_r = _a1435[_i1436];
              const _t1437 = cl.region.cells[v_r];
              let _g1438 = 0;
              G1439: {
                const _a1440 = _t1437;
                for (let _i1441 = 0; _i1441 < _a1440.length; _i1441++) {
                  const v_c = _a1440[_i1441];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1438++;
                }
              }
              _g1433 += (cl.stars - _g1438);
            }
          }
          const v_mr = _g1433;
          let _c1452: boolean = (v_mi === v_n);
          if (_c1452) {
            let _q1442 = false;
            Q1443: {
              _g1444.length = 0;
              G1445: {
                const _a1448 = v_B;
                for (let _i1449 = 0; _i1449 < _a1448.length; _i1449++) {
                  const v_c = _a1448[_i1449];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g1444.push(v_c);
                }
              }
              const _a1450 = _g1444;
              for (let _i1451 = 0; _i1451 < _a1450.length; _i1451++) {
                const v_c = _a1450[_i1451];
                if (!(v_I.includes(cl.region.of[v_c]))) {
                  _q1442 = true;
                  break Q1443;
                }
              }
            }
            _c1452 = _q1442;
          }
          L1453: {
            const v_lines = _c1452;
            if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L1453;
            facts.length = 0;
            changed = false;
            let _c1465: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
            if (_c1465) {
              let _c1464: boolean = !(v_lines);
              if (!_c1464) {
                let _q1454 = true;
                Q1455: {
                  _g1456.length = 0;
                  G1457: {
                    const _a1460 = v_B;
                    for (let _i1461 = 0; _i1461 < _a1460.length; _i1461++) {
                      const v_c = _a1460[_i1461];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1456.push(v_c);
                    }
                  }
                  const _a1462 = _g1456;
                  for (let _i1463 = 0; _i1463 < _a1462.length; _i1463++) {
                    const v_c = _a1462[_i1463];
                    if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q1454 = false;
                      break Q1455;
                    }
                  }
                }
                _c1464 = _q1454;
              }
              _c1465 = _c1464;
            }
            let _c1480: boolean = _c1465;
            if (_c1480) {
              let _c1479: boolean = (v_lines || (v_mr > v_n));
              if (!_c1479) {
                let _q1466 = true;
                Q1467: {
                  const _a1468 = v_R;
                  for (let _i1469 = 0; _i1469 < _a1468.length; _i1469++) {
                    const v_r = _a1468[_i1469];
                    const _t1470 = cl.region.cells[v_r];
                    _g1471.length = 0;
                    G1472: {
                      const _a1475 = _t1470;
                      for (let _i1476 = 0; _i1476 < _a1475.length; _i1476++) {
                        const v_c = _a1475[_i1476];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g1471.push(v_c);
                      }
                    }
                    const _a1477 = _g1471;
                    for (let _i1478 = 0; _i1478 < _a1477.length; _i1478++) {
                      const v_c = _a1477[_i1478];
                      if (!(!(v_B.includes(v_c)))) continue;
                      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                      if (!(true)) {
                        _q1466 = false;
                        break Q1467;
                      }
                    }
                  }
                }
                _c1479 = _q1466;
              }
              _c1480 = _c1479;
            }
            if (!(_c1480)) return -1;
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

/** Its dearest read grows with the board as n^1.5. */
export function starvedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedLineBinding> | null): number {
  const _g1649: number[] = [];
  const _g1659: number[] = [];
  const _f1671 = new Int32Array(sp.cells.length).fill(-1);
  let _l1672: readonly number[] = [];
  const _s1673: number[] = [];
  const _f1699 = new Int32Array(sp.cells.length).fill(-1);
  let _l1700: readonly number[] = [];
  const _s1701: number[] = [];
  const _g1719: number[] = [];
  const _g1729: number[] = [];
  const facts = starvedLineFacts;
  let fired = 0;
  let changed = false;
  const _a1631 = sp.cells;
  for (let _i1632 = 0; _i1632 < _a1631.length; _i1632++) {
    const v_x = _a1631[_i1632];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1635 = sp.rowOf[v_x];
    const _h1636 = sp.colOf[v_x];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1633 = sp.lines;
    for (let _i1634 = 0; _i1634 < _a1633.length; _i1634++) {
      const v_L = _a1633[_i1634];
      let _c1641: boolean = ((v_L === _h1635) || (v_L === _h1636));
      if (!_c1641) {
        let _q1637 = false;
        Q1638: {
          const _a1639 = v_R;
          for (let _i1640 = 0; _i1640 < _a1639.length; _i1640++) {
            const v_p = _a1639[_i1640];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q1637 = true;
              break Q1638;
            }
          }
        }
        _c1641 = _q1637;
      }
      if (!(_c1641)) continue;
      const v_S = sp.lineCells[v_L];
      let _g1642 = 0;
      G1643: {
        const _a1644 = v_S;
        for (let _i1645 = 0; _i1645 < _a1644.length; _i1645++) {
          const v_c = _a1644[_i1645];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1642++;
        }
      }
      let _g1646 = 0;
      G1647: {
        for (let _i1648 = 0; _i1648 < 1; _i1648++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1646++;
        }
      }
      const v_n = ((cl.stars - _g1642) - _g1646);
      _g1649.length = 0;
      G1650: {
        _g1659.length = 0;
        G1660: {
          const _a1663 = v_S;
          for (let _i1664 = 0; _i1664 < _a1663.length; _i1664++) {
            const v_c = _a1663[_i1664];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1659.push(v_c);
          }
        }
        const _a1665 = _g1659;
        for (let _i1666 = 0; _i1666 < _a1665.length; _i1666++) {
          const v_c = _a1665[_i1666];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1649.push(v_c);
        }
      }
      L1667: {
        const v_E = _g1649;
        const _h1679 = v_E.length;
        const _h1691 = (2 * _h1679);
        const _h1692 = (_h1691 - v_n);
        let _c1693: boolean = (v_n > 0);
        if (_c1693) {
          let _q1668 = false;
          Q1669: {
            const _a1670 = v_E;
            const _t1680 = ((2 * _h1679) - v_n);
            const _lo1681 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1682 = 31 - Math.clz32(b.domain);
            for (const _e1674 of _l1672) _f1671[_e1674] = -1;
            _l1672 = _a1670;
            let _i1676 = 0;
            _s1673[0] = 0;
            let _o1684 = _a1670.length === 0;
            for (;;) {
              if (_a1670.length === 0) {
                if (!_o1684) break;
                _o1684 = false;
              }
              while (_a1670.length > 0 && _i1676 >= 0) {
                const _e1674 = _a1670[_i1676];
                if (_s1673[_i1676] > 0) _f1671[_e1674] = -1;
                let _r1683 = b.domain & ~((2 << _s1673[_i1676]) - 1);
                let _d1675 = 0;
                V1678: for (; _r1683 !== 0; _r1683 &= _r1683 - 1) {
                  _d1675 = 31 - Math.clz32(_r1683 & -_r1683);
                  _f1671[_e1674] = _d1675;
                  {
                    let _t1685 = _d1675;
                    for (let _j1677 = 0; _j1677 < _i1676; _j1677++) _t1685 += _f1671[_a1670[_j1677]];
                    if (_t1685 + (_a1670.length - _i1676 - 1) * _lo1681 > _t1680) continue;
                    if (_t1685 + (_a1670.length - _i1676 - 1) * _hi1682 < _t1680) continue;
                  }
                  for (let _j1677 = 0; _j1677 < _i1676; _j1677++) {
                    const _y1686 = _a1670[_j1677];
                    if (!(!((((_f1671[_e1674] === 1) && (_f1671[_y1686] === 1)) && (sp.adj8[_e1674].includes(_y1686)))))) continue V1678;
                  }
                  break;
                }
                if (_r1683 === 0) {
                  _s1673[_i1676] = 0;
                  _i1676--;
                  continue;
                }
                _s1673[_i1676] = _d1675;
                if (_i1676 === _a1670.length - 1) break;
                _i1676++;
                _s1673[_i1676] = 0;
              }
              if (_i1676 < 0) break;
              let _g1687 = 0;
              G1688: {
                const _a1689 = v_E;
                for (let _i1690 = 0; _i1690 < _a1689.length; _i1690++) {
                  const v_x = _a1689[_i1690];
                  _g1687 += _f1671[v_x];
                }
              }
              if (!((_g1687 === _h1692))) continue;
              if (true) {
                _q1668 = true;
                break Q1669;
              }
            }
          }
          _c1693 = !(_q1668);
        }
        if (!(_c1693)) break L1667;
        let _g1694 = -1;
        G1695: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1718 = (_h1691 - v_j);
            let _q1696 = false;
            Q1697: {
              const _a1698 = v_E;
              const _t1707 = (_h1691 - v_j);
              const _lo1708 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1709 = 31 - Math.clz32(b.domain);
              for (const _e1702 of _l1700) _f1699[_e1702] = -1;
              _l1700 = _a1698;
              let _i1704 = 0;
              _s1701[0] = 0;
              let _o1711 = _a1698.length === 0;
              for (;;) {
                if (_a1698.length === 0) {
                  if (!_o1711) break;
                  _o1711 = false;
                }
                while (_a1698.length > 0 && _i1704 >= 0) {
                  const _e1702 = _a1698[_i1704];
                  if (_s1701[_i1704] > 0) _f1699[_e1702] = -1;
                  let _r1710 = b.domain & ~((2 << _s1701[_i1704]) - 1);
                  let _d1703 = 0;
                  V1706: for (; _r1710 !== 0; _r1710 &= _r1710 - 1) {
                    _d1703 = 31 - Math.clz32(_r1710 & -_r1710);
                    _f1699[_e1702] = _d1703;
                    {
                      let _t1712 = _d1703;
                      for (let _j1705 = 0; _j1705 < _i1704; _j1705++) _t1712 += _f1699[_a1698[_j1705]];
                      if (_t1712 + (_a1698.length - _i1704 - 1) * _lo1708 > _t1707) continue;
                      if (_t1712 + (_a1698.length - _i1704 - 1) * _hi1709 < _t1707) continue;
                    }
                    for (let _j1705 = 0; _j1705 < _i1704; _j1705++) {
                      const _y1713 = _a1698[_j1705];
                      if (!(!((((_f1699[_e1702] === 1) && (_f1699[_y1713] === 1)) && (sp.adj8[_e1702].includes(_y1713)))))) continue V1706;
                    }
                    break;
                  }
                  if (_r1710 === 0) {
                    _s1701[_i1704] = 0;
                    _i1704--;
                    continue;
                  }
                  _s1701[_i1704] = _d1703;
                  if (_i1704 === _a1698.length - 1) break;
                  _i1704++;
                  _s1701[_i1704] = 0;
                }
                if (_i1704 < 0) break;
                let _g1714 = 0;
                G1715: {
                  const _a1716 = v_E;
                  for (let _i1717 = 0; _i1717 < _a1716.length; _i1717++) {
                    const v_x = _a1716[_i1717];
                    _g1714 += _f1699[v_x];
                  }
                }
                if (!((_g1714 === _h1718))) continue;
                if (true) {
                  _q1696 = true;
                  break Q1697;
                }
              }
            }
            if (!(_q1696)) continue;
            _g1694 = v_j;
            break G1695;
          }
        }
        const v_room = _g1694;
        _g1719.length = 0;
        G1720: {
          _g1729.length = 0;
          G1730: {
            const _a1733 = v_S;
            for (let _i1734 = 0; _i1734 < _a1733.length; _i1734++) {
              const v_c = _a1733[_i1734];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1729.push(v_c);
            }
          }
          const _a1735 = _g1729;
          for (let _i1736 = 0; _i1736 < _a1735.length; _i1736++) {
            const v_c = _a1735[_i1736];
            if (!((v_R.includes(v_c)))) continue;
            _g1719.push(v_c);
          }
        }
        const v_Q = _g1719;
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

/** Its dearest read grows with the board as n. */
export function starvedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedRegionBinding> | null): number {
  const _g1854: number[] = [];
  const _g1864: number[] = [];
  const _f1876 = new Int32Array(sp.cells.length).fill(-1);
  let _l1877: readonly number[] = [];
  const _s1878: number[] = [];
  const _f1904 = new Int32Array(sp.cells.length).fill(-1);
  let _l1905: readonly number[] = [];
  const _s1906: number[] = [];
  const _g1924: number[] = [];
  const _g1934: number[] = [];
  const facts = starvedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1837 = sp.cells;
  for (let _i1838 = 0; _i1838 < _a1837.length; _i1838++) {
    const v_x = _a1837[_i1838];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1841 = cl.region.of[v_x];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1839 = cl.region.parts;
    for (let _i1840 = 0; _i1840 < _a1839.length; _i1840++) {
      const v_g = _a1839[_i1840];
      let _c1846: boolean = (v_g === _h1841);
      if (!_c1846) {
        let _q1842 = false;
        Q1843: {
          const _a1844 = v_R;
          for (let _i1845 = 0; _i1845 < _a1844.length; _i1845++) {
            const v_p = _a1844[_i1845];
            if ((cl.region.of[v_p] === v_g)) {
              _q1842 = true;
              break Q1843;
            }
          }
        }
        _c1846 = _q1842;
      }
      if (!(_c1846)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1847 = 0;
      G1848: {
        const _a1849 = v_S;
        for (let _i1850 = 0; _i1850 < _a1849.length; _i1850++) {
          const v_c = _a1849[_i1850];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1847++;
        }
      }
      let _g1851 = 0;
      G1852: {
        for (let _i1853 = 0; _i1853 < 1; _i1853++) {
          const v_c = v_x;
          if (!((v_S.includes(v_c)))) continue;
          _g1851++;
        }
      }
      const v_n = ((cl.stars - _g1847) - _g1851);
      _g1854.length = 0;
      G1855: {
        _g1864.length = 0;
        G1865: {
          const _a1868 = v_S;
          for (let _i1869 = 0; _i1869 < _a1868.length; _i1869++) {
            const v_c = _a1868[_i1869];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1864.push(v_c);
          }
        }
        const _a1870 = _g1864;
        for (let _i1871 = 0; _i1871 < _a1870.length; _i1871++) {
          const v_c = _a1870[_i1871];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1854.push(v_c);
        }
      }
      L1872: {
        const v_E = _g1854;
        const _h1884 = v_E.length;
        const _h1896 = (2 * _h1884);
        const _h1897 = (_h1896 - v_n);
        let _c1898: boolean = (v_n > 0);
        if (_c1898) {
          let _q1873 = false;
          Q1874: {
            const _a1875 = v_E;
            const _t1885 = ((2 * _h1884) - v_n);
            const _lo1886 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1887 = 31 - Math.clz32(b.domain);
            for (const _e1879 of _l1877) _f1876[_e1879] = -1;
            _l1877 = _a1875;
            let _i1881 = 0;
            _s1878[0] = 0;
            let _o1889 = _a1875.length === 0;
            for (;;) {
              if (_a1875.length === 0) {
                if (!_o1889) break;
                _o1889 = false;
              }
              while (_a1875.length > 0 && _i1881 >= 0) {
                const _e1879 = _a1875[_i1881];
                if (_s1878[_i1881] > 0) _f1876[_e1879] = -1;
                let _r1888 = b.domain & ~((2 << _s1878[_i1881]) - 1);
                let _d1880 = 0;
                V1883: for (; _r1888 !== 0; _r1888 &= _r1888 - 1) {
                  _d1880 = 31 - Math.clz32(_r1888 & -_r1888);
                  _f1876[_e1879] = _d1880;
                  {
                    let _t1890 = _d1880;
                    for (let _j1882 = 0; _j1882 < _i1881; _j1882++) _t1890 += _f1876[_a1875[_j1882]];
                    if (_t1890 + (_a1875.length - _i1881 - 1) * _lo1886 > _t1885) continue;
                    if (_t1890 + (_a1875.length - _i1881 - 1) * _hi1887 < _t1885) continue;
                  }
                  for (let _j1882 = 0; _j1882 < _i1881; _j1882++) {
                    const _y1891 = _a1875[_j1882];
                    if (!(!((((_f1876[_e1879] === 1) && (_f1876[_y1891] === 1)) && (sp.adj8[_e1879].includes(_y1891)))))) continue V1883;
                  }
                  break;
                }
                if (_r1888 === 0) {
                  _s1878[_i1881] = 0;
                  _i1881--;
                  continue;
                }
                _s1878[_i1881] = _d1880;
                if (_i1881 === _a1875.length - 1) break;
                _i1881++;
                _s1878[_i1881] = 0;
              }
              if (_i1881 < 0) break;
              let _g1892 = 0;
              G1893: {
                const _a1894 = v_E;
                for (let _i1895 = 0; _i1895 < _a1894.length; _i1895++) {
                  const v_x = _a1894[_i1895];
                  _g1892 += _f1876[v_x];
                }
              }
              if (!((_g1892 === _h1897))) continue;
              if (true) {
                _q1873 = true;
                break Q1874;
              }
            }
          }
          _c1898 = !(_q1873);
        }
        if (!(_c1898)) break L1872;
        let _g1899 = -1;
        G1900: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1923 = (_h1896 - v_j);
            let _q1901 = false;
            Q1902: {
              const _a1903 = v_E;
              const _t1912 = (_h1896 - v_j);
              const _lo1913 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1914 = 31 - Math.clz32(b.domain);
              for (const _e1907 of _l1905) _f1904[_e1907] = -1;
              _l1905 = _a1903;
              let _i1909 = 0;
              _s1906[0] = 0;
              let _o1916 = _a1903.length === 0;
              for (;;) {
                if (_a1903.length === 0) {
                  if (!_o1916) break;
                  _o1916 = false;
                }
                while (_a1903.length > 0 && _i1909 >= 0) {
                  const _e1907 = _a1903[_i1909];
                  if (_s1906[_i1909] > 0) _f1904[_e1907] = -1;
                  let _r1915 = b.domain & ~((2 << _s1906[_i1909]) - 1);
                  let _d1908 = 0;
                  V1911: for (; _r1915 !== 0; _r1915 &= _r1915 - 1) {
                    _d1908 = 31 - Math.clz32(_r1915 & -_r1915);
                    _f1904[_e1907] = _d1908;
                    {
                      let _t1917 = _d1908;
                      for (let _j1910 = 0; _j1910 < _i1909; _j1910++) _t1917 += _f1904[_a1903[_j1910]];
                      if (_t1917 + (_a1903.length - _i1909 - 1) * _lo1913 > _t1912) continue;
                      if (_t1917 + (_a1903.length - _i1909 - 1) * _hi1914 < _t1912) continue;
                    }
                    for (let _j1910 = 0; _j1910 < _i1909; _j1910++) {
                      const _y1918 = _a1903[_j1910];
                      if (!(!((((_f1904[_e1907] === 1) && (_f1904[_y1918] === 1)) && (sp.adj8[_e1907].includes(_y1918)))))) continue V1911;
                    }
                    break;
                  }
                  if (_r1915 === 0) {
                    _s1906[_i1909] = 0;
                    _i1909--;
                    continue;
                  }
                  _s1906[_i1909] = _d1908;
                  if (_i1909 === _a1903.length - 1) break;
                  _i1909++;
                  _s1906[_i1909] = 0;
                }
                if (_i1909 < 0) break;
                let _g1919 = 0;
                G1920: {
                  const _a1921 = v_E;
                  for (let _i1922 = 0; _i1922 < _a1921.length; _i1922++) {
                    const v_x = _a1921[_i1922];
                    _g1919 += _f1904[v_x];
                  }
                }
                if (!((_g1919 === _h1923))) continue;
                if (true) {
                  _q1901 = true;
                  break Q1902;
                }
              }
            }
            if (!(_q1901)) continue;
            _g1899 = v_j;
            break G1900;
          }
        }
        const v_room = _g1899;
        _g1924.length = 0;
        G1925: {
          _g1934.length = 0;
          G1935: {
            const _a1938 = v_S;
            for (let _i1939 = 0; _i1939 < _a1938.length; _i1939++) {
              const v_c = _a1938[_i1939];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1934.push(v_c);
            }
          }
          const _a1940 = _g1934;
          for (let _i1941 = 0; _i1941 < _a1940.length; _i1941++) {
            const v_c = _a1940[_i1941];
            if (!((v_R.includes(v_c)))) continue;
            _g1924.push(v_c);
          }
        }
        const v_Q = _g1924;
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
  const _g1483: number[] = [];
  G1484: {
    const _a1509 = sp.cells;
    for (let _i1510 = 0; _i1510 < _a1509.length; _i1510++) {
      const v_p = _a1509[_i1510];
      let _c1532: boolean = (!((b.grid[v_p] !== 0)) && (v_p !== v_x));
      if (_c1532) {
        let _c1517: boolean = (sp.adj8[v_x].includes(v_p));
        if (!_c1517) {
          let _c1516: boolean = (sp.rowOf[v_p] === sp.rowOf[v_x]);
          if (_c1516) {
            const _t1511 = sp.lineCells[sp.rowOf[v_x]];
            let _g1512 = 0;
            G1513: {
              const _a1514 = _t1511;
              for (let _i1515 = 0; _i1515 < _a1514.length; _i1515++) {
                const v_c = _a1514[_i1515];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1512++;
              }
            }
            _c1516 = ((cl.stars - _g1512) === 1);
          }
          _c1517 = _c1516;
        }
        let _c1524: boolean = _c1517;
        if (!_c1524) {
          let _c1523: boolean = (sp.colOf[v_p] === sp.colOf[v_x]);
          if (_c1523) {
            const _t1518 = sp.lineCells[sp.colOf[v_x]];
            let _g1519 = 0;
            G1520: {
              const _a1521 = _t1518;
              for (let _i1522 = 0; _i1522 < _a1521.length; _i1522++) {
                const v_c = _a1521[_i1522];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1519++;
              }
            }
            _c1523 = ((cl.stars - _g1519) === 1);
          }
          _c1524 = _c1523;
        }
        let _c1531: boolean = _c1524;
        if (!_c1531) {
          let _c1530: boolean = (cl.region.of[v_p] === cl.region.of[v_x]);
          if (_c1530) {
            const _t1525 = cl.region.cells[cl.region.of[v_x]];
            let _g1526 = 0;
            G1527: {
              const _a1528 = _t1525;
              for (let _i1529 = 0; _i1529 < _a1528.length; _i1529++) {
                const v_c = _a1528[_i1529];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1526++;
              }
            }
            _c1530 = ((cl.stars - _g1526) === 1);
          }
          _c1531 = _c1530;
        }
        _c1532 = _c1531;
      }
      if (!(_c1532)) continue;
      _g1483.push(v_p);
    }
  }
  const _made = _g1483;
  _kept[v_x] = _made;
  return _made;
}
