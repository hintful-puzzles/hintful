// Compiled by `npm run describe` from src/games/starbattle/starbattle.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, minus, rangeMask, setOf } from "../../engine/describe-runtime.ts";

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
  let _q2148 = true;
  Q2149: {
    const _a2150 = sp.lines;
    for (let _i2151 = 0; _i2151 < _a2150.length; _i2151++) {
      const v_L = _a2150[_i2151];
      let _g2152 = 0;
      G2153: {
        const _a2154 = sp.lineCells[v_L];
        for (let _i2155 = 0; _i2155 < _a2154.length; _i2155++) {
          const v_c = _a2154[_i2155];
          if (!(((g[v_c] || -1) === 1))) continue;
          _g2152++;
        }
      }
      if (!((_g2152 === cl.stars))) {
        _q2148 = false;
        break Q2149;
      }
    }
  }
  if (!(_q2148)) return false;
  let _q2156 = true;
  Q2157: {
    const _a2158 = cl.region.parts;
    for (let _i2159 = 0; _i2159 < _a2158.length; _i2159++) {
      const v_r = _a2158[_i2159];
      let _g2160 = 0;
      G2161: {
        const _a2162 = cl.region.cells[v_r];
        for (let _i2163 = 0; _i2163 < _a2162.length; _i2163++) {
          const v_c = _a2162[_i2163];
          if (!(((g[v_c] || -1) === 1))) continue;
          _g2160++;
        }
      }
      if (!((_g2160 === cl.stars))) {
        _q2156 = false;
        break Q2157;
      }
    }
  }
  if (!(_q2156)) return false;
  let _q2164 = true;
  Q2165: {
    const _a2166 = sp.cells;
    for (let _i2167 = 0; _i2167 < _a2166.length; _i2167++) {
      const v_a = _a2166[_i2167];
      if (!(((g[v_a] || -1) === 1))) continue;
      let _q2168 = true;
      Q2169: {
        const _a2170 = sp.adj8[v_a];
        for (let _i2171 = 0; _i2171 < _a2170.length; _i2171++) {
          const v_b = _a2170[_i2171];
          if (!(((g[v_b] || -1) !== 1))) {
            _q2168 = false;
            break Q2169;
          }
        }
      }
      if (!(_q2168)) {
        _q2164 = false;
        break Q2165;
      }
    }
  }
  if (!(_q2164)) return false;
  return true;
}

export interface AroundBinding {
  c: number;
}

const aroundFacts: number[] = [];

export function around(b: Marks, sp: GridSpace, fire: Fire<AroundBinding> | null): number {
  const facts = aroundFacts;
  let fired = 0;
  let changed = false;
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((b.value(v_c) === 1))) continue;
    facts.length = 0;
    changed = false;
    let _q5 = true;
    Q6: {
      const _a7 = sp.adj8[v_c];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_p = _a7[_i8];
        if (!((b.value(v_p) !== 1))) {
          _q5 = false;
          break Q6;
        }
      }
    }
    let _c13 = _q5;
    if (_c13) {
      let _q9 = true;
      Q10: {
        const _a11 = sp.adj8[v_c];
        for (let _i12 = 0; _i12 < _a11.length; _i12++) {
          const v_p = _a11[_i12];
          if (!(!(b.known(v_p)))) continue;
          if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
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
        if (!((b.value(v_c) === 1))) continue;
        _g25++;
      }
    }
    L29: {
      const v_n = (cl.stars - _g25);
      if (!((v_n <= 0))) break L29;
      facts.length = 0;
      changed = false;
      let _c41 = (v_n === 0);
      if (_c41) {
        let _q30 = true;
        Q31: {
          const _t32 = sp.lineCells[v_L];
          _g33.length = 0;
          G34: {
            const _a37 = _t32;
            for (let _i38 = 0; _i38 < _a37.length; _i38++) {
              const v_c = _a37[_i38];
              if (!(!(b.known(v_c)))) continue;
              _g33.push(v_c);
            }
          }
          const _a39 = _g33;
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_c = _a39[_i40];
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
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
        if (!((b.value(v_c) === 1))) continue;
        _g53++;
      }
    }
    L57: {
      const v_n = (cl.stars - _g53);
      if (!((v_n <= 0))) break L57;
      facts.length = 0;
      changed = false;
      let _c69 = (v_n === 0);
      if (_c69) {
        let _q58 = true;
        Q59: {
          const _t60 = cl.region.cells[v_r];
          _g61.length = 0;
          G62: {
            const _a65 = _t60;
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_c = _a65[_i66];
              if (!(!(b.known(v_c)))) continue;
              _g61.push(v_c);
            }
          }
          const _a67 = _g61;
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_c = _a67[_i68];
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
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
        if (!((b.value(v_c) === 1))) continue;
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
        if (!(!(b.known(v_c)))) continue;
        _g93.push(v_c);
      }
    }
    L99: {
      const v_O = _g93;
      const _h100 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h100)))) break L99;
      facts.length = 0;
      changed = false;
      let _c105 = (v_n === _h100);
      if (_c105) {
        let _q101 = true;
        Q102: {
          const _a103 = v_O;
          for (let _i104 = 0; _i104 < _a103.length; _i104++) {
            const v_c = _a103[_i104];
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
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
        if (!((b.value(v_c) === 1))) continue;
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
        if (!(!(b.known(v_c)))) continue;
        _g129.push(v_c);
      }
    }
    L135: {
      const v_O = _g129;
      const _h136 = v_O.length;
      if (!(((v_n > 0) && (v_n >= _h136)))) break L135;
      facts.length = 0;
      changed = false;
      let _c141 = (v_n === _h136);
      if (_c141) {
        let _q137 = true;
        Q138: {
          const _a139 = v_O;
          for (let _i140 = 0; _i140 < _a139.length; _i140++) {
            const v_c = _a139[_i140];
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
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

export function confined(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ConfinedBinding> | null): number {
  const _g297: number[] = [];
  const _g310: number[] = [];
  const _g355: number[] = [];
  const _g373: number[] = [];
  const _g418: number[] = [];
  const _g438: number[] = [];
  const _g450: number[] = [];
  const _g465: number[] = [];
  const facts = confinedFacts;
  let fired = 0;
  let changed = false;
  const _h294 = (sp.w - 1);
  const _h295 = rangeMask(0, _h294);
  for (let _m293 = rangeMask(0, 1); _m293 !== 0; _m293 &= _m293 - 1) {
    const v_dir = 31 - Math.clz32(_m293 & -_m293);
    const _h303 = (1 - v_dir);
    for (let _m296 = _h295; _m296 !== 0; _m296 &= _m296 - 1) {
      const v_a = 31 - Math.clz32(_m296 & -_m296);
      const _h304 = (v_a + 1);
      _g297.length = 0;
      G298: {
        const _a301 = sp.cells;
        for (let _i302 = 0; _i302 < _a301.length; _i302++) {
          const v_c = _a301[_i302];
          if (!(((v_a <= ((_h303 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w)))) && (((_h303 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w))) < _h304)))) continue;
          _g297.push(v_c);
        }
      }
      const v_B = _g297;
      let _g305 = 0;
      G306: {
        const _a307 = v_B;
        for (let _i308 = 0; _i308 < _a307.length; _i308++) {
          const v_c = _a307[_i308];
          if (!((b.value(v_c) === 1))) continue;
          _g305++;
        }
      }
      L309: {
        const v_n = (cl.stars - _g305);
        if (!((v_n > 0))) break L309;
        _g310.length = 0;
        G311: {
          const _a338 = cl.region.parts;
          for (let _i339 = 0; _i339 < _a338.length; _i339++) {
            const v_r = _a338[_i339];
            const _t340 = cl.region.cells[v_r];
            let _g341 = 0;
            G342: {
              const _a343 = _t340;
              for (let _i344 = 0; _i344 < _a343.length; _i344++) {
                const v_c = _a343[_i344];
                if (!((b.value(v_c) === 1))) continue;
                _g341++;
              }
            }
            let _c363 = ((cl.stars - _g341) > 0);
            if (_c363) {
              let _q352 = true;
              Q353: {
                const _t354 = cl.region.cells[v_r];
                _g355.length = 0;
                G356: {
                  const _a359 = _t354;
                  for (let _i360 = 0; _i360 < _a359.length; _i360++) {
                    const v_c = _a359[_i360];
                    if (!(!(b.known(v_c)))) continue;
                    _g355.push(v_c);
                  }
                }
                const _a361 = _g355;
                for (let _i362 = 0; _i362 < _a361.length; _i362++) {
                  const v_c = _a361[_i362];
                  if (!((v_B.includes(v_c)))) {
                    _q352 = false;
                    break Q353;
                  }
                }
              }
              _c363 = _q352;
            }
            if (!(_c363)) continue;
            _g310.push(v_r);
          }
        }
        const v_I = _g310;
        let _g364 = 0;
        G365: {
          const _a366 = v_I;
          for (let _i367 = 0; _i367 < _a366.length; _i367++) {
            const v_r = _a366[_i367];
            const _t368 = cl.region.cells[v_r];
            let _g369 = 0;
            G370: {
              const _a371 = _t368;
              for (let _i372 = 0; _i372 < _a371.length; _i372++) {
                const v_c = _a371[_i372];
                if (!((b.value(v_c) === 1))) continue;
                _g369++;
              }
            }
            _g364 += (cl.stars - _g369);
          }
        }
        const v_mi = _g364;
        _g373.length = 0;
        G374: {
          const _a401 = cl.region.parts;
          for (let _i402 = 0; _i402 < _a401.length; _i402++) {
            const v_r = _a401[_i402];
            const _t403 = cl.region.cells[v_r];
            let _g404 = 0;
            G405: {
              const _a406 = _t403;
              for (let _i407 = 0; _i407 < _a406.length; _i407++) {
                const v_c = _a406[_i407];
                if (!((b.value(v_c) === 1))) continue;
                _g404++;
              }
            }
            let _c426 = ((cl.stars - _g404) > 0);
            if (_c426) {
              let _q415 = false;
              Q416: {
                const _t417 = cl.region.cells[v_r];
                _g418.length = 0;
                G419: {
                  const _a422 = _t417;
                  for (let _i423 = 0; _i423 < _a422.length; _i423++) {
                    const v_c = _a422[_i423];
                    if (!(!(b.known(v_c)))) continue;
                    _g418.push(v_c);
                  }
                }
                const _a424 = _g418;
                for (let _i425 = 0; _i425 < _a424.length; _i425++) {
                  const v_c = _a424[_i425];
                  if ((v_B.includes(v_c))) {
                    _q415 = true;
                    break Q416;
                  }
                }
              }
              _c426 = _q415;
            }
            if (!(_c426)) continue;
            _g373.push(v_r);
          }
        }
        const v_R = _g373;
        let _g427 = 0;
        G428: {
          const _a429 = v_R;
          for (let _i430 = 0; _i430 < _a429.length; _i430++) {
            const v_r = _a429[_i430];
            const _t431 = cl.region.cells[v_r];
            let _g432 = 0;
            G433: {
              const _a434 = _t431;
              for (let _i435 = 0; _i435 < _a434.length; _i435++) {
                const v_c = _a434[_i435];
                if (!((b.value(v_c) === 1))) continue;
                _g432++;
              }
            }
            _g427 += (cl.stars - _g432);
          }
        }
        const v_mr = _g427;
        let _c446 = (v_mi === v_n);
        if (_c446) {
          let _q436 = false;
          Q437: {
            _g438.length = 0;
            G439: {
              const _a442 = v_B;
              for (let _i443 = 0; _i443 < _a442.length; _i443++) {
                const v_c = _a442[_i443];
                if (!(!(b.known(v_c)))) continue;
                _g438.push(v_c);
              }
            }
            const _a444 = _g438;
            for (let _i445 = 0; _i445 < _a444.length; _i445++) {
              const v_c = _a444[_i445];
              if (!(v_I.includes(cl.region.of[v_c]))) {
                _q436 = true;
                break Q437;
              }
            }
          }
          _c446 = _q436;
        }
        L447: {
          const v_lines = _c446;
          if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L447;
          facts.length = 0;
          changed = false;
          let _c459 = ((v_mi <= v_n) && (v_mr >= v_n));
          if (_c459) {
            let _c458 = !(v_lines);
            if (!_c458) {
              let _q448 = true;
              Q449: {
                _g450.length = 0;
                G451: {
                  const _a454 = v_B;
                  for (let _i455 = 0; _i455 < _a454.length; _i455++) {
                    const v_c = _a454[_i455];
                    if (!(!(b.known(v_c)))) continue;
                    _g450.push(v_c);
                  }
                }
                const _a456 = _g450;
                for (let _i457 = 0; _i457 < _a456.length; _i457++) {
                  const v_c = _a456[_i457];
                  if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                  if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                  if (!(true)) {
                    _q448 = false;
                    break Q449;
                  }
                }
              }
              _c458 = _q448;
            }
            _c459 = _c458;
          }
          let _c474 = _c459;
          if (_c474) {
            let _c473 = (v_lines || (v_mr > v_n));
            if (!_c473) {
              let _q460 = true;
              Q461: {
                const _a462 = v_R;
                for (let _i463 = 0; _i463 < _a462.length; _i463++) {
                  const v_r = _a462[_i463];
                  const _t464 = cl.region.cells[v_r];
                  _g465.length = 0;
                  G466: {
                    const _a469 = _t464;
                    for (let _i470 = 0; _i470 < _a469.length; _i470++) {
                      const v_c = _a469[_i470];
                      if (!(!(b.known(v_c)))) continue;
                      _g465.push(v_c);
                    }
                  }
                  const _a471 = _g465;
                  for (let _i472 = 0; _i472 < _a471.length; _i472++) {
                    const v_c = _a471[_i472];
                    if (!(!(v_B.includes(v_c)))) continue;
                    if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q460 = false;
                      break Q461;
                    }
                  }
                }
              }
              _c473 = _q460;
            }
            _c474 = _c473;
          }
          if (!(_c474)) return -1;
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

export function neededLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededLineBinding> | null): number {
  const _g548: number[] = [];
  const _f561 = new Int32Array(sp.cells.length).fill(-1);
  let _l562: readonly number[] = [];
  const _s563: number[] = [];
  const _f590 = new Int32Array(sp.cells.length).fill(-1);
  let _l591: readonly number[] = [];
  const _s592: number[] = [];
  const facts = neededLineFacts;
  let fired = 0;
  let changed = false;
  const _a540 = sp.lines;
  for (let _i541 = 0; _i541 < _a540.length; _i541++) {
    const v_L = _a540[_i541];
    const _t542 = sp.lineCells[v_L];
    let _g543 = 0;
    G544: {
      const _a545 = _t542;
      for (let _i546 = 0; _i546 < _a545.length; _i546++) {
        const v_c = _a545[_i546];
        if (!((b.value(v_c) === 1))) continue;
        _g543++;
      }
    }
    const v_n = (cl.stars - _g543);
    const _h585 = rangeMask(0, v_n);
    const _t547 = sp.lineCells[v_L];
    _g548.length = 0;
    G549: {
      const _a552 = _t547;
      for (let _i553 = 0; _i553 < _a552.length; _i553++) {
        const v_c = _a552[_i553];
        if (!(!(b.known(v_c)))) continue;
        _g548.push(v_c);
      }
    }
    L554: {
      const v_O = _g548;
      if (!((v_n > 0))) break L554;
      const _a555 = v_O;
      for (let _i556 = 0; _i556 < _a555.length; _i556++) {
        const v_x = _a555[_i556];
        L557: {
          const v_E = minus(v_O, setOf(v_x));
          const _h569 = v_E.length;
          const _h581 = (2 * _h569);
          const _h582 = (_h581 - v_n);
          let _q558 = false;
          Q559: {
            const _a560 = v_E;
            const _t570 = ((2 * _h569) - v_n);
            const _lo571 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi572 = 31 - Math.clz32(b.domain);
            for (const _e564 of _l562) _f561[_e564] = -1;
            _l562 = _a560;
            let _i566 = 0;
            _s563[0] = 0;
            let _o574 = _a560.length === 0;
            for (;;) {
              if (_a560.length === 0) {
                if (!_o574) break;
                _o574 = false;
              }
              while (_a560.length > 0 && _i566 >= 0) {
                const _e564 = _a560[_i566];
                if (_s563[_i566] > 0) _f561[_e564] = -1;
                let _r573 = b.domain & ~((2 << _s563[_i566]) - 1);
                let _d565 = 0;
                V568: for (; _r573 !== 0; _r573 &= _r573 - 1) {
                  _d565 = 31 - Math.clz32(_r573 & -_r573);
                  _f561[_e564] = _d565;
                  {
                    let _t575 = _d565;
                    for (let _j567 = 0; _j567 < _i566; _j567++) _t575 += _f561[_a560[_j567]];
                    if (_t575 + (_a560.length - _i566 - 1) * _lo571 > _t570) continue;
                    if (_t575 + (_a560.length - _i566 - 1) * _hi572 < _t570) continue;
                  }
                  for (let _j567 = 0; _j567 < _i566; _j567++) {
                    const _y576 = _a560[_j567];
                    if (!(!((((_f561[_e564] === 1) && (_f561[_y576] === 1)) && (sp.adj8[_e564].includes(_y576)))))) continue V568;
                  }
                  break;
                }
                if (_r573 === 0) {
                  _s563[_i566] = 0;
                  _i566--;
                  continue;
                }
                _s563[_i566] = _d565;
                if (_i566 === _a560.length - 1) break;
                _i566++;
                _s563[_i566] = 0;
              }
              if (_i566 < 0) break;
              let _g577 = 0;
              G578: {
                const _a579 = v_E;
                for (let _i580 = 0; _i580 < _a579.length; _i580++) {
                  const v_x = _a579[_i580];
                  _g577 += _f561[v_x];
                }
              }
              if (!((_g577 === _h582))) continue;
              if (true) {
                _q558 = true;
                break Q559;
              }
            }
          }
          if (!(!(_q558))) break L557;
          let _g583 = -1;
          G584: {
            for (let _m586 = _h585; _m586 !== 0; _m586 &= _m586 - 1) {
              const v_j = 31 - Math.clz32(_m586 & -_m586);
              const _h609 = (_h581 - v_j);
              let _q587 = false;
              Q588: {
                const _a589 = v_E;
                const _t598 = (_h581 - v_j);
                const _lo599 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi600 = 31 - Math.clz32(b.domain);
                for (const _e593 of _l591) _f590[_e593] = -1;
                _l591 = _a589;
                let _i595 = 0;
                _s592[0] = 0;
                let _o602 = _a589.length === 0;
                for (;;) {
                  if (_a589.length === 0) {
                    if (!_o602) break;
                    _o602 = false;
                  }
                  while (_a589.length > 0 && _i595 >= 0) {
                    const _e593 = _a589[_i595];
                    if (_s592[_i595] > 0) _f590[_e593] = -1;
                    let _r601 = b.domain & ~((2 << _s592[_i595]) - 1);
                    let _d594 = 0;
                    V597: for (; _r601 !== 0; _r601 &= _r601 - 1) {
                      _d594 = 31 - Math.clz32(_r601 & -_r601);
                      _f590[_e593] = _d594;
                      {
                        let _t603 = _d594;
                        for (let _j596 = 0; _j596 < _i595; _j596++) _t603 += _f590[_a589[_j596]];
                        if (_t603 + (_a589.length - _i595 - 1) * _lo599 > _t598) continue;
                        if (_t603 + (_a589.length - _i595 - 1) * _hi600 < _t598) continue;
                      }
                      for (let _j596 = 0; _j596 < _i595; _j596++) {
                        const _y604 = _a589[_j596];
                        if (!(!((((_f590[_e593] === 1) && (_f590[_y604] === 1)) && (sp.adj8[_e593].includes(_y604)))))) continue V597;
                      }
                      break;
                    }
                    if (_r601 === 0) {
                      _s592[_i595] = 0;
                      _i595--;
                      continue;
                    }
                    _s592[_i595] = _d594;
                    if (_i595 === _a589.length - 1) break;
                    _i595++;
                    _s592[_i595] = 0;
                  }
                  if (_i595 < 0) break;
                  let _g605 = 0;
                  G606: {
                    const _a607 = v_E;
                    for (let _i608 = 0; _i608 < _a607.length; _i608++) {
                      const v_x = _a607[_i608];
                      _g605 += _f590[v_x];
                    }
                  }
                  if (!((_g605 === _h609))) continue;
                  if (true) {
                    _q587 = true;
                    break Q588;
                  }
                }
              }
              if (!(_q587)) continue;
              if (_g583 === -1 || v_j > _g583) _g583 = v_j;
            }
          }
          const v_room = _g583;
          facts.length = 0;
          changed = false;
          if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
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

export function neededRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeededRegionBinding> | null): number {
  const _g683: number[] = [];
  const _f696 = new Int32Array(sp.cells.length).fill(-1);
  let _l697: readonly number[] = [];
  const _s698: number[] = [];
  const _f725 = new Int32Array(sp.cells.length).fill(-1);
  let _l726: readonly number[] = [];
  const _s727: number[] = [];
  const facts = neededRegionFacts;
  let fired = 0;
  let changed = false;
  const _a675 = cl.region.parts;
  for (let _i676 = 0; _i676 < _a675.length; _i676++) {
    const v_r = _a675[_i676];
    const _t677 = cl.region.cells[v_r];
    let _g678 = 0;
    G679: {
      const _a680 = _t677;
      for (let _i681 = 0; _i681 < _a680.length; _i681++) {
        const v_c = _a680[_i681];
        if (!((b.value(v_c) === 1))) continue;
        _g678++;
      }
    }
    const v_n = (cl.stars - _g678);
    const _h720 = rangeMask(0, v_n);
    const _t682 = cl.region.cells[v_r];
    _g683.length = 0;
    G684: {
      const _a687 = _t682;
      for (let _i688 = 0; _i688 < _a687.length; _i688++) {
        const v_c = _a687[_i688];
        if (!(!(b.known(v_c)))) continue;
        _g683.push(v_c);
      }
    }
    L689: {
      const v_O = _g683;
      if (!((v_n > 0))) break L689;
      const _a690 = v_O;
      for (let _i691 = 0; _i691 < _a690.length; _i691++) {
        const v_x = _a690[_i691];
        L692: {
          const v_E = minus(v_O, setOf(v_x));
          const _h704 = v_E.length;
          const _h716 = (2 * _h704);
          const _h717 = (_h716 - v_n);
          let _q693 = false;
          Q694: {
            const _a695 = v_E;
            const _t705 = ((2 * _h704) - v_n);
            const _lo706 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi707 = 31 - Math.clz32(b.domain);
            for (const _e699 of _l697) _f696[_e699] = -1;
            _l697 = _a695;
            let _i701 = 0;
            _s698[0] = 0;
            let _o709 = _a695.length === 0;
            for (;;) {
              if (_a695.length === 0) {
                if (!_o709) break;
                _o709 = false;
              }
              while (_a695.length > 0 && _i701 >= 0) {
                const _e699 = _a695[_i701];
                if (_s698[_i701] > 0) _f696[_e699] = -1;
                let _r708 = b.domain & ~((2 << _s698[_i701]) - 1);
                let _d700 = 0;
                V703: for (; _r708 !== 0; _r708 &= _r708 - 1) {
                  _d700 = 31 - Math.clz32(_r708 & -_r708);
                  _f696[_e699] = _d700;
                  {
                    let _t710 = _d700;
                    for (let _j702 = 0; _j702 < _i701; _j702++) _t710 += _f696[_a695[_j702]];
                    if (_t710 + (_a695.length - _i701 - 1) * _lo706 > _t705) continue;
                    if (_t710 + (_a695.length - _i701 - 1) * _hi707 < _t705) continue;
                  }
                  for (let _j702 = 0; _j702 < _i701; _j702++) {
                    const _y711 = _a695[_j702];
                    if (!(!((((_f696[_e699] === 1) && (_f696[_y711] === 1)) && (sp.adj8[_e699].includes(_y711)))))) continue V703;
                  }
                  break;
                }
                if (_r708 === 0) {
                  _s698[_i701] = 0;
                  _i701--;
                  continue;
                }
                _s698[_i701] = _d700;
                if (_i701 === _a695.length - 1) break;
                _i701++;
                _s698[_i701] = 0;
              }
              if (_i701 < 0) break;
              let _g712 = 0;
              G713: {
                const _a714 = v_E;
                for (let _i715 = 0; _i715 < _a714.length; _i715++) {
                  const v_x = _a714[_i715];
                  _g712 += _f696[v_x];
                }
              }
              if (!((_g712 === _h717))) continue;
              if (true) {
                _q693 = true;
                break Q694;
              }
            }
          }
          if (!(!(_q693))) break L692;
          let _g718 = -1;
          G719: {
            for (let _m721 = _h720; _m721 !== 0; _m721 &= _m721 - 1) {
              const v_j = 31 - Math.clz32(_m721 & -_m721);
              const _h744 = (_h716 - v_j);
              let _q722 = false;
              Q723: {
                const _a724 = v_E;
                const _t733 = (_h716 - v_j);
                const _lo734 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi735 = 31 - Math.clz32(b.domain);
                for (const _e728 of _l726) _f725[_e728] = -1;
                _l726 = _a724;
                let _i730 = 0;
                _s727[0] = 0;
                let _o737 = _a724.length === 0;
                for (;;) {
                  if (_a724.length === 0) {
                    if (!_o737) break;
                    _o737 = false;
                  }
                  while (_a724.length > 0 && _i730 >= 0) {
                    const _e728 = _a724[_i730];
                    if (_s727[_i730] > 0) _f725[_e728] = -1;
                    let _r736 = b.domain & ~((2 << _s727[_i730]) - 1);
                    let _d729 = 0;
                    V732: for (; _r736 !== 0; _r736 &= _r736 - 1) {
                      _d729 = 31 - Math.clz32(_r736 & -_r736);
                      _f725[_e728] = _d729;
                      {
                        let _t738 = _d729;
                        for (let _j731 = 0; _j731 < _i730; _j731++) _t738 += _f725[_a724[_j731]];
                        if (_t738 + (_a724.length - _i730 - 1) * _lo734 > _t733) continue;
                        if (_t738 + (_a724.length - _i730 - 1) * _hi735 < _t733) continue;
                      }
                      for (let _j731 = 0; _j731 < _i730; _j731++) {
                        const _y739 = _a724[_j731];
                        if (!(!((((_f725[_e728] === 1) && (_f725[_y739] === 1)) && (sp.adj8[_e728].includes(_y739)))))) continue V732;
                      }
                      break;
                    }
                    if (_r736 === 0) {
                      _s727[_i730] = 0;
                      _i730--;
                      continue;
                    }
                    _s727[_i730] = _d729;
                    if (_i730 === _a724.length - 1) break;
                    _i730++;
                    _s727[_i730] = 0;
                  }
                  if (_i730 < 0) break;
                  let _g740 = 0;
                  G741: {
                    const _a742 = v_E;
                    for (let _i743 = 0; _i743 < _a742.length; _i743++) {
                      const v_x = _a742[_i743];
                      _g740 += _f725[v_x];
                    }
                  }
                  if (!((_g740 === _h744))) continue;
                  if (true) {
                    _q722 = true;
                    break Q723;
                  }
                }
              }
              if (!(_q722)) continue;
              if (_g718 === -1 || v_j > _g718) _g718 = v_j;
            }
          }
          const v_room = _g718;
          facts.length = 0;
          changed = false;
          if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
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

export function crowdedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedLineBinding> | null): number {
  const _g855: number[] = [];
  const _g878: number[] = [];
  const _g888: number[] = [];
  const _f900 = new Int32Array(sp.cells.length).fill(-1);
  let _l901: readonly number[] = [];
  const _s902: number[] = [];
  const _f929 = new Int32Array(sp.cells.length).fill(-1);
  let _l930: readonly number[] = [];
  const _s931: number[] = [];
  const _g949: number[] = [];
  const _g959: number[] = [];
  const facts = crowdedLineFacts;
  let fired = 0;
  let changed = false;
  const _a853 = sp.cells;
  for (let _i854 = 0; _i854 < _a853.length; _i854++) {
    const v_x = _a853[_i854];
    if (!(!(b.known(v_x)))) continue;
    const _h863 = sp.rowOf[v_x];
    const _h864 = sp.colOf[v_x];
    _g855.length = 0;
    G856: {
      const _a859 = sp.adj8[v_x];
      for (let _i860 = 0; _i860 < _a859.length; _i860++) {
        const v_p = _a859[_i860];
        if (!(!(b.known(v_p)))) continue;
        _g855.push(v_p);
      }
    }
    const v_R = _g855;
    const _a861 = sp.lines;
    for (let _i862 = 0; _i862 < _a861.length; _i862++) {
      const v_L = _a861[_i862];
      let _c869 = ((v_L === _h863) || (v_L === _h864));
      if (!_c869) {
        let _q865 = false;
        Q866: {
          const _a867 = v_R;
          for (let _i868 = 0; _i868 < _a867.length; _i868++) {
            const v_p = _a867[_i868];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q865 = true;
              break Q866;
            }
          }
        }
        _c869 = _q865;
      }
      if (!(_c869)) continue;
      const v_S = sp.lineCells[v_L];
      let _g870 = 0;
      G871: {
        const _a872 = v_S;
        for (let _i873 = 0; _i873 < _a872.length; _i873++) {
          const v_c = _a872[_i873];
          if (!((b.value(v_c) === 1))) continue;
          _g870++;
        }
      }
      let _g874 = 0;
      G875: {
        const _a876 = setOf(v_x);
        for (let _i877 = 0; _i877 < _a876.length; _i877++) {
          const v_c = _a876[_i877];
          if (!((v_S.includes(v_c)))) continue;
          _g874++;
        }
      }
      const v_n = ((cl.stars - _g870) - _g874);
      _g878.length = 0;
      G879: {
        _g888.length = 0;
        G889: {
          const _a892 = v_S;
          for (let _i893 = 0; _i893 < _a892.length; _i893++) {
            const v_c = _a892[_i893];
            if (!(!(b.known(v_c)))) continue;
            _g888.push(v_c);
          }
        }
        const _a894 = _g888;
        for (let _i895 = 0; _i895 < _a894.length; _i895++) {
          const v_c = _a894[_i895];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g878.push(v_c);
        }
      }
      L896: {
        const v_E = _g878;
        const _h908 = v_E.length;
        const _h920 = (2 * _h908);
        const _h921 = (_h920 - v_n);
        let _c922 = (v_n > 0);
        if (_c922) {
          let _q897 = false;
          Q898: {
            const _a899 = v_E;
            const _t909 = ((2 * _h908) - v_n);
            const _lo910 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi911 = 31 - Math.clz32(b.domain);
            for (const _e903 of _l901) _f900[_e903] = -1;
            _l901 = _a899;
            let _i905 = 0;
            _s902[0] = 0;
            let _o913 = _a899.length === 0;
            for (;;) {
              if (_a899.length === 0) {
                if (!_o913) break;
                _o913 = false;
              }
              while (_a899.length > 0 && _i905 >= 0) {
                const _e903 = _a899[_i905];
                if (_s902[_i905] > 0) _f900[_e903] = -1;
                let _r912 = b.domain & ~((2 << _s902[_i905]) - 1);
                let _d904 = 0;
                V907: for (; _r912 !== 0; _r912 &= _r912 - 1) {
                  _d904 = 31 - Math.clz32(_r912 & -_r912);
                  _f900[_e903] = _d904;
                  {
                    let _t914 = _d904;
                    for (let _j906 = 0; _j906 < _i905; _j906++) _t914 += _f900[_a899[_j906]];
                    if (_t914 + (_a899.length - _i905 - 1) * _lo910 > _t909) continue;
                    if (_t914 + (_a899.length - _i905 - 1) * _hi911 < _t909) continue;
                  }
                  for (let _j906 = 0; _j906 < _i905; _j906++) {
                    const _y915 = _a899[_j906];
                    if (!(!((((_f900[_e903] === 1) && (_f900[_y915] === 1)) && (sp.adj8[_e903].includes(_y915)))))) continue V907;
                  }
                  break;
                }
                if (_r912 === 0) {
                  _s902[_i905] = 0;
                  _i905--;
                  continue;
                }
                _s902[_i905] = _d904;
                if (_i905 === _a899.length - 1) break;
                _i905++;
                _s902[_i905] = 0;
              }
              if (_i905 < 0) break;
              let _g916 = 0;
              G917: {
                const _a918 = v_E;
                for (let _i919 = 0; _i919 < _a918.length; _i919++) {
                  const v_x = _a918[_i919];
                  _g916 += _f900[v_x];
                }
              }
              if (!((_g916 === _h921))) continue;
              if (true) {
                _q897 = true;
                break Q898;
              }
            }
          }
          _c922 = !(_q897);
        }
        if (!(_c922)) break L896;
        let _g923 = -1;
        G924: {
          for (let _m925 = rangeMask(0, v_n); _m925 !== 0; _m925 &= _m925 - 1) {
            const v_j = 31 - Math.clz32(_m925 & -_m925);
            const _h948 = (_h920 - v_j);
            let _q926 = false;
            Q927: {
              const _a928 = v_E;
              const _t937 = (_h920 - v_j);
              const _lo938 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi939 = 31 - Math.clz32(b.domain);
              for (const _e932 of _l930) _f929[_e932] = -1;
              _l930 = _a928;
              let _i934 = 0;
              _s931[0] = 0;
              let _o941 = _a928.length === 0;
              for (;;) {
                if (_a928.length === 0) {
                  if (!_o941) break;
                  _o941 = false;
                }
                while (_a928.length > 0 && _i934 >= 0) {
                  const _e932 = _a928[_i934];
                  if (_s931[_i934] > 0) _f929[_e932] = -1;
                  let _r940 = b.domain & ~((2 << _s931[_i934]) - 1);
                  let _d933 = 0;
                  V936: for (; _r940 !== 0; _r940 &= _r940 - 1) {
                    _d933 = 31 - Math.clz32(_r940 & -_r940);
                    _f929[_e932] = _d933;
                    {
                      let _t942 = _d933;
                      for (let _j935 = 0; _j935 < _i934; _j935++) _t942 += _f929[_a928[_j935]];
                      if (_t942 + (_a928.length - _i934 - 1) * _lo938 > _t937) continue;
                      if (_t942 + (_a928.length - _i934 - 1) * _hi939 < _t937) continue;
                    }
                    for (let _j935 = 0; _j935 < _i934; _j935++) {
                      const _y943 = _a928[_j935];
                      if (!(!((((_f929[_e932] === 1) && (_f929[_y943] === 1)) && (sp.adj8[_e932].includes(_y943)))))) continue V936;
                    }
                    break;
                  }
                  if (_r940 === 0) {
                    _s931[_i934] = 0;
                    _i934--;
                    continue;
                  }
                  _s931[_i934] = _d933;
                  if (_i934 === _a928.length - 1) break;
                  _i934++;
                  _s931[_i934] = 0;
                }
                if (_i934 < 0) break;
                let _g944 = 0;
                G945: {
                  const _a946 = v_E;
                  for (let _i947 = 0; _i947 < _a946.length; _i947++) {
                    const v_x = _a946[_i947];
                    _g944 += _f929[v_x];
                  }
                }
                if (!((_g944 === _h948))) continue;
                if (true) {
                  _q926 = true;
                  break Q927;
                }
              }
            }
            if (!(_q926)) continue;
            if (_g923 === -1 || v_j > _g923) _g923 = v_j;
          }
        }
        const v_room = _g923;
        _g949.length = 0;
        G950: {
          _g959.length = 0;
          G960: {
            const _a963 = v_S;
            for (let _i964 = 0; _i964 < _a963.length; _i964++) {
              const v_c = _a963[_i964];
              if (!(!(b.known(v_c)))) continue;
              _g959.push(v_c);
            }
          }
          const _a965 = _g959;
          for (let _i966 = 0; _i966 < _a965.length; _i966++) {
            const v_c = _a965[_i966];
            if (!((v_R.includes(v_c)))) continue;
            _g949.push(v_c);
          }
        }
        const v_Q = _g949;
        facts.length = 0;
        changed = false;
        if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
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

export function crowdedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrowdedRegionBinding> | null): number {
  const _g1077: number[] = [];
  const _g1099: number[] = [];
  const _g1109: number[] = [];
  const _f1121 = new Int32Array(sp.cells.length).fill(-1);
  let _l1122: readonly number[] = [];
  const _s1123: number[] = [];
  const _f1150 = new Int32Array(sp.cells.length).fill(-1);
  let _l1151: readonly number[] = [];
  const _s1152: number[] = [];
  const _g1170: number[] = [];
  const _g1180: number[] = [];
  const facts = crowdedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1075 = sp.cells;
  for (let _i1076 = 0; _i1076 < _a1075.length; _i1076++) {
    const v_x = _a1075[_i1076];
    if (!(!(b.known(v_x)))) continue;
    const _h1085 = cl.region.of[v_x];
    _g1077.length = 0;
    G1078: {
      const _a1081 = sp.adj8[v_x];
      for (let _i1082 = 0; _i1082 < _a1081.length; _i1082++) {
        const v_p = _a1081[_i1082];
        if (!(!(b.known(v_p)))) continue;
        _g1077.push(v_p);
      }
    }
    const v_R = _g1077;
    const _a1083 = cl.region.parts;
    for (let _i1084 = 0; _i1084 < _a1083.length; _i1084++) {
      const v_g = _a1083[_i1084];
      let _c1090 = (v_g === _h1085);
      if (!_c1090) {
        let _q1086 = false;
        Q1087: {
          const _a1088 = v_R;
          for (let _i1089 = 0; _i1089 < _a1088.length; _i1089++) {
            const v_p = _a1088[_i1089];
            if ((cl.region.of[v_p] === v_g)) {
              _q1086 = true;
              break Q1087;
            }
          }
        }
        _c1090 = _q1086;
      }
      if (!(_c1090)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1091 = 0;
      G1092: {
        const _a1093 = v_S;
        for (let _i1094 = 0; _i1094 < _a1093.length; _i1094++) {
          const v_c = _a1093[_i1094];
          if (!((b.value(v_c) === 1))) continue;
          _g1091++;
        }
      }
      let _g1095 = 0;
      G1096: {
        const _a1097 = setOf(v_x);
        for (let _i1098 = 0; _i1098 < _a1097.length; _i1098++) {
          const v_c = _a1097[_i1098];
          if (!((v_S.includes(v_c)))) continue;
          _g1095++;
        }
      }
      const v_n = ((cl.stars - _g1091) - _g1095);
      _g1099.length = 0;
      G1100: {
        _g1109.length = 0;
        G1110: {
          const _a1113 = v_S;
          for (let _i1114 = 0; _i1114 < _a1113.length; _i1114++) {
            const v_c = _a1113[_i1114];
            if (!(!(b.known(v_c)))) continue;
            _g1109.push(v_c);
          }
        }
        const _a1115 = _g1109;
        for (let _i1116 = 0; _i1116 < _a1115.length; _i1116++) {
          const v_c = _a1115[_i1116];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1099.push(v_c);
        }
      }
      L1117: {
        const v_E = _g1099;
        const _h1129 = v_E.length;
        const _h1141 = (2 * _h1129);
        const _h1142 = (_h1141 - v_n);
        let _c1143 = (v_n > 0);
        if (_c1143) {
          let _q1118 = false;
          Q1119: {
            const _a1120 = v_E;
            const _t1130 = ((2 * _h1129) - v_n);
            const _lo1131 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1132 = 31 - Math.clz32(b.domain);
            for (const _e1124 of _l1122) _f1121[_e1124] = -1;
            _l1122 = _a1120;
            let _i1126 = 0;
            _s1123[0] = 0;
            let _o1134 = _a1120.length === 0;
            for (;;) {
              if (_a1120.length === 0) {
                if (!_o1134) break;
                _o1134 = false;
              }
              while (_a1120.length > 0 && _i1126 >= 0) {
                const _e1124 = _a1120[_i1126];
                if (_s1123[_i1126] > 0) _f1121[_e1124] = -1;
                let _r1133 = b.domain & ~((2 << _s1123[_i1126]) - 1);
                let _d1125 = 0;
                V1128: for (; _r1133 !== 0; _r1133 &= _r1133 - 1) {
                  _d1125 = 31 - Math.clz32(_r1133 & -_r1133);
                  _f1121[_e1124] = _d1125;
                  {
                    let _t1135 = _d1125;
                    for (let _j1127 = 0; _j1127 < _i1126; _j1127++) _t1135 += _f1121[_a1120[_j1127]];
                    if (_t1135 + (_a1120.length - _i1126 - 1) * _lo1131 > _t1130) continue;
                    if (_t1135 + (_a1120.length - _i1126 - 1) * _hi1132 < _t1130) continue;
                  }
                  for (let _j1127 = 0; _j1127 < _i1126; _j1127++) {
                    const _y1136 = _a1120[_j1127];
                    if (!(!((((_f1121[_e1124] === 1) && (_f1121[_y1136] === 1)) && (sp.adj8[_e1124].includes(_y1136)))))) continue V1128;
                  }
                  break;
                }
                if (_r1133 === 0) {
                  _s1123[_i1126] = 0;
                  _i1126--;
                  continue;
                }
                _s1123[_i1126] = _d1125;
                if (_i1126 === _a1120.length - 1) break;
                _i1126++;
                _s1123[_i1126] = 0;
              }
              if (_i1126 < 0) break;
              let _g1137 = 0;
              G1138: {
                const _a1139 = v_E;
                for (let _i1140 = 0; _i1140 < _a1139.length; _i1140++) {
                  const v_x = _a1139[_i1140];
                  _g1137 += _f1121[v_x];
                }
              }
              if (!((_g1137 === _h1142))) continue;
              if (true) {
                _q1118 = true;
                break Q1119;
              }
            }
          }
          _c1143 = !(_q1118);
        }
        if (!(_c1143)) break L1117;
        let _g1144 = -1;
        G1145: {
          for (let _m1146 = rangeMask(0, v_n); _m1146 !== 0; _m1146 &= _m1146 - 1) {
            const v_j = 31 - Math.clz32(_m1146 & -_m1146);
            const _h1169 = (_h1141 - v_j);
            let _q1147 = false;
            Q1148: {
              const _a1149 = v_E;
              const _t1158 = (_h1141 - v_j);
              const _lo1159 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1160 = 31 - Math.clz32(b.domain);
              for (const _e1153 of _l1151) _f1150[_e1153] = -1;
              _l1151 = _a1149;
              let _i1155 = 0;
              _s1152[0] = 0;
              let _o1162 = _a1149.length === 0;
              for (;;) {
                if (_a1149.length === 0) {
                  if (!_o1162) break;
                  _o1162 = false;
                }
                while (_a1149.length > 0 && _i1155 >= 0) {
                  const _e1153 = _a1149[_i1155];
                  if (_s1152[_i1155] > 0) _f1150[_e1153] = -1;
                  let _r1161 = b.domain & ~((2 << _s1152[_i1155]) - 1);
                  let _d1154 = 0;
                  V1157: for (; _r1161 !== 0; _r1161 &= _r1161 - 1) {
                    _d1154 = 31 - Math.clz32(_r1161 & -_r1161);
                    _f1150[_e1153] = _d1154;
                    {
                      let _t1163 = _d1154;
                      for (let _j1156 = 0; _j1156 < _i1155; _j1156++) _t1163 += _f1150[_a1149[_j1156]];
                      if (_t1163 + (_a1149.length - _i1155 - 1) * _lo1159 > _t1158) continue;
                      if (_t1163 + (_a1149.length - _i1155 - 1) * _hi1160 < _t1158) continue;
                    }
                    for (let _j1156 = 0; _j1156 < _i1155; _j1156++) {
                      const _y1164 = _a1149[_j1156];
                      if (!(!((((_f1150[_e1153] === 1) && (_f1150[_y1164] === 1)) && (sp.adj8[_e1153].includes(_y1164)))))) continue V1157;
                    }
                    break;
                  }
                  if (_r1161 === 0) {
                    _s1152[_i1155] = 0;
                    _i1155--;
                    continue;
                  }
                  _s1152[_i1155] = _d1154;
                  if (_i1155 === _a1149.length - 1) break;
                  _i1155++;
                  _s1152[_i1155] = 0;
                }
                if (_i1155 < 0) break;
                let _g1165 = 0;
                G1166: {
                  const _a1167 = v_E;
                  for (let _i1168 = 0; _i1168 < _a1167.length; _i1168++) {
                    const v_x = _a1167[_i1168];
                    _g1165 += _f1150[v_x];
                  }
                }
                if (!((_g1165 === _h1169))) continue;
                if (true) {
                  _q1147 = true;
                  break Q1148;
                }
              }
            }
            if (!(_q1147)) continue;
            if (_g1144 === -1 || v_j > _g1144) _g1144 = v_j;
          }
        }
        const v_room = _g1144;
        _g1170.length = 0;
        G1171: {
          _g1180.length = 0;
          G1181: {
            const _a1184 = v_S;
            for (let _i1185 = 0; _i1185 < _a1184.length; _i1185++) {
              const v_c = _a1184[_i1185];
              if (!(!(b.known(v_c)))) continue;
              _g1180.push(v_c);
            }
          }
          const _a1186 = _g1180;
          for (let _i1187 = 0; _i1187 < _a1186.length; _i1187++) {
            const v_c = _a1186[_i1187];
            if (!((v_R.includes(v_c)))) continue;
            _g1170.push(v_c);
          }
        }
        const v_Q = _g1170;
        facts.length = 0;
        changed = false;
        if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
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

export function banded(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BandedBinding> | null): number {
  const _g1346: number[] = [];
  const _g1361: number[] = [];
  const _g1406: number[] = [];
  const _g1424: number[] = [];
  const _g1469: number[] = [];
  const _g1489: number[] = [];
  const _g1501: number[] = [];
  const _g1516: number[] = [];
  const facts = bandedFacts;
  let fired = 0;
  let changed = false;
  const _h1341 = rangeMask(0, 1);
  for (let _m1340 = rangeMask(2, (sp.w - 2)); _m1340 !== 0; _m1340 &= _m1340 - 1) {
    const v_k = 31 - Math.clz32(_m1340 & -_m1340);
    const _h1343 = (sp.w - v_k);
    const _h1344 = rangeMask(0, _h1343);
    const _h1358 = (v_k - 1);
    const _h1359 = (_h1358 * cl.stars);
    for (let _m1342 = _h1341; _m1342 !== 0; _m1342 &= _m1342 - 1) {
      const v_dir = 31 - Math.clz32(_m1342 & -_m1342);
      const _h1352 = (1 - v_dir);
      for (let _m1345 = _h1344; _m1345 !== 0; _m1345 &= _m1345 - 1) {
        const v_a = 31 - Math.clz32(_m1345 & -_m1345);
        const _h1353 = (v_a + v_k);
        _g1346.length = 0;
        G1347: {
          const _a1350 = sp.cells;
          for (let _i1351 = 0; _i1351 < _a1350.length; _i1351++) {
            const v_c = _a1350[_i1351];
            if (!(((v_a <= ((_h1352 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w)))) && (((_h1352 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w))) < _h1353)))) continue;
            _g1346.push(v_c);
          }
        }
        const v_B = _g1346;
        let _g1354 = 0;
        G1355: {
          const _a1356 = v_B;
          for (let _i1357 = 0; _i1357 < _a1356.length; _i1357++) {
            const v_c = _a1356[_i1357];
            if (!((b.value(v_c) === 1))) continue;
            _g1354++;
          }
        }
        L1360: {
          const v_n = ((cl.stars - _g1354) + _h1359);
          if (!((v_n > 0))) break L1360;
          _g1361.length = 0;
          G1362: {
            const _a1389 = cl.region.parts;
            for (let _i1390 = 0; _i1390 < _a1389.length; _i1390++) {
              const v_r = _a1389[_i1390];
              const _t1391 = cl.region.cells[v_r];
              let _g1392 = 0;
              G1393: {
                const _a1394 = _t1391;
                for (let _i1395 = 0; _i1395 < _a1394.length; _i1395++) {
                  const v_c = _a1394[_i1395];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1392++;
                }
              }
              let _c1414 = ((cl.stars - _g1392) > 0);
              if (_c1414) {
                let _q1403 = true;
                Q1404: {
                  const _t1405 = cl.region.cells[v_r];
                  _g1406.length = 0;
                  G1407: {
                    const _a1410 = _t1405;
                    for (let _i1411 = 0; _i1411 < _a1410.length; _i1411++) {
                      const v_c = _a1410[_i1411];
                      if (!(!(b.known(v_c)))) continue;
                      _g1406.push(v_c);
                    }
                  }
                  const _a1412 = _g1406;
                  for (let _i1413 = 0; _i1413 < _a1412.length; _i1413++) {
                    const v_c = _a1412[_i1413];
                    if (!((v_B.includes(v_c)))) {
                      _q1403 = false;
                      break Q1404;
                    }
                  }
                }
                _c1414 = _q1403;
              }
              if (!(_c1414)) continue;
              _g1361.push(v_r);
            }
          }
          const v_I = _g1361;
          let _g1415 = 0;
          G1416: {
            const _a1417 = v_I;
            for (let _i1418 = 0; _i1418 < _a1417.length; _i1418++) {
              const v_r = _a1417[_i1418];
              const _t1419 = cl.region.cells[v_r];
              let _g1420 = 0;
              G1421: {
                const _a1422 = _t1419;
                for (let _i1423 = 0; _i1423 < _a1422.length; _i1423++) {
                  const v_c = _a1422[_i1423];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1420++;
                }
              }
              _g1415 += (cl.stars - _g1420);
            }
          }
          const v_mi = _g1415;
          _g1424.length = 0;
          G1425: {
            const _a1452 = cl.region.parts;
            for (let _i1453 = 0; _i1453 < _a1452.length; _i1453++) {
              const v_r = _a1452[_i1453];
              const _t1454 = cl.region.cells[v_r];
              let _g1455 = 0;
              G1456: {
                const _a1457 = _t1454;
                for (let _i1458 = 0; _i1458 < _a1457.length; _i1458++) {
                  const v_c = _a1457[_i1458];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1455++;
                }
              }
              let _c1477 = ((cl.stars - _g1455) > 0);
              if (_c1477) {
                let _q1466 = false;
                Q1467: {
                  const _t1468 = cl.region.cells[v_r];
                  _g1469.length = 0;
                  G1470: {
                    const _a1473 = _t1468;
                    for (let _i1474 = 0; _i1474 < _a1473.length; _i1474++) {
                      const v_c = _a1473[_i1474];
                      if (!(!(b.known(v_c)))) continue;
                      _g1469.push(v_c);
                    }
                  }
                  const _a1475 = _g1469;
                  for (let _i1476 = 0; _i1476 < _a1475.length; _i1476++) {
                    const v_c = _a1475[_i1476];
                    if ((v_B.includes(v_c))) {
                      _q1466 = true;
                      break Q1467;
                    }
                  }
                }
                _c1477 = _q1466;
              }
              if (!(_c1477)) continue;
              _g1424.push(v_r);
            }
          }
          const v_R = _g1424;
          let _g1478 = 0;
          G1479: {
            const _a1480 = v_R;
            for (let _i1481 = 0; _i1481 < _a1480.length; _i1481++) {
              const v_r = _a1480[_i1481];
              const _t1482 = cl.region.cells[v_r];
              let _g1483 = 0;
              G1484: {
                const _a1485 = _t1482;
                for (let _i1486 = 0; _i1486 < _a1485.length; _i1486++) {
                  const v_c = _a1485[_i1486];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1483++;
                }
              }
              _g1478 += (cl.stars - _g1483);
            }
          }
          const v_mr = _g1478;
          let _c1497 = (v_mi === v_n);
          if (_c1497) {
            let _q1487 = false;
            Q1488: {
              _g1489.length = 0;
              G1490: {
                const _a1493 = v_B;
                for (let _i1494 = 0; _i1494 < _a1493.length; _i1494++) {
                  const v_c = _a1493[_i1494];
                  if (!(!(b.known(v_c)))) continue;
                  _g1489.push(v_c);
                }
              }
              const _a1495 = _g1489;
              for (let _i1496 = 0; _i1496 < _a1495.length; _i1496++) {
                const v_c = _a1495[_i1496];
                if (!(v_I.includes(cl.region.of[v_c]))) {
                  _q1487 = true;
                  break Q1488;
                }
              }
            }
            _c1497 = _q1487;
          }
          L1498: {
            const v_lines = _c1497;
            if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L1498;
            facts.length = 0;
            changed = false;
            let _c1510 = ((v_mi <= v_n) && (v_mr >= v_n));
            if (_c1510) {
              let _c1509 = !(v_lines);
              if (!_c1509) {
                let _q1499 = true;
                Q1500: {
                  _g1501.length = 0;
                  G1502: {
                    const _a1505 = v_B;
                    for (let _i1506 = 0; _i1506 < _a1505.length; _i1506++) {
                      const v_c = _a1505[_i1506];
                      if (!(!(b.known(v_c)))) continue;
                      _g1501.push(v_c);
                    }
                  }
                  const _a1507 = _g1501;
                  for (let _i1508 = 0; _i1508 < _a1507.length; _i1508++) {
                    const v_c = _a1507[_i1508];
                    if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                    if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q1499 = false;
                      break Q1500;
                    }
                  }
                }
                _c1509 = _q1499;
              }
              _c1510 = _c1509;
            }
            let _c1525 = _c1510;
            if (_c1525) {
              let _c1524 = (v_lines || (v_mr > v_n));
              if (!_c1524) {
                let _q1511 = true;
                Q1512: {
                  const _a1513 = v_R;
                  for (let _i1514 = 0; _i1514 < _a1513.length; _i1514++) {
                    const v_r = _a1513[_i1514];
                    const _t1515 = cl.region.cells[v_r];
                    _g1516.length = 0;
                    G1517: {
                      const _a1520 = _t1515;
                      for (let _i1521 = 0; _i1521 < _a1520.length; _i1521++) {
                        const v_c = _a1520[_i1521];
                        if (!(!(b.known(v_c)))) continue;
                        _g1516.push(v_c);
                      }
                    }
                    const _a1522 = _g1516;
                    for (let _i1523 = 0; _i1523 < _a1522.length; _i1523++) {
                      const v_c = _a1522[_i1523];
                      if (!(!(v_B.includes(v_c)))) continue;
                      if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                      if (!(true)) {
                        _q1511 = false;
                        break Q1512;
                      }
                    }
                  }
                }
                _c1524 = _q1511;
              }
              _c1525 = _c1524;
            }
            if (!(_c1525)) return -1;
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

export function starvedLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedLineBinding> | null): number {
  const _g1680: number[] = [];
  const _g1748: number[] = [];
  const _g1758: number[] = [];
  const _f1770 = new Int32Array(sp.cells.length).fill(-1);
  let _l1771: readonly number[] = [];
  const _s1772: number[] = [];
  const _f1799 = new Int32Array(sp.cells.length).fill(-1);
  let _l1800: readonly number[] = [];
  const _s1801: number[] = [];
  const _g1819: number[] = [];
  const _g1829: number[] = [];
  const facts = starvedLineFacts;
  let fired = 0;
  let changed = false;
  const _a1678 = sp.cells;
  for (let _i1679 = 0; _i1679 < _a1678.length; _i1679++) {
    const v_x = _a1678[_i1679];
    if (!(!(b.known(v_x)))) continue;
    const _h1708 = sp.rowOf[v_x];
    const _h1716 = sp.colOf[v_x];
    const _h1724 = cl.region.of[v_x];
    _g1680.length = 0;
    G1681: {
      const _a1706 = sp.cells;
      for (let _i1707 = 0; _i1707 < _a1706.length; _i1707++) {
        const v_p = _a1706[_i1707];
        let _c1732 = (!(b.known(v_p)) && (v_p !== v_x));
        if (_c1732) {
          let _c1715 = (sp.adj8[v_x].includes(v_p));
          if (!_c1715) {
            let _c1714 = (sp.rowOf[v_p] === _h1708);
            if (_c1714) {
              const _t1709 = sp.lineCells[_h1708];
              let _g1710 = 0;
              G1711: {
                const _a1712 = _t1709;
                for (let _i1713 = 0; _i1713 < _a1712.length; _i1713++) {
                  const v_c = _a1712[_i1713];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1710++;
                }
              }
              _c1714 = ((cl.stars - _g1710) === 1);
            }
            _c1715 = _c1714;
          }
          let _c1723 = _c1715;
          if (!_c1723) {
            let _c1722 = (sp.colOf[v_p] === _h1716);
            if (_c1722) {
              const _t1717 = sp.lineCells[_h1716];
              let _g1718 = 0;
              G1719: {
                const _a1720 = _t1717;
                for (let _i1721 = 0; _i1721 < _a1720.length; _i1721++) {
                  const v_c = _a1720[_i1721];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1718++;
                }
              }
              _c1722 = ((cl.stars - _g1718) === 1);
            }
            _c1723 = _c1722;
          }
          let _c1731 = _c1723;
          if (!_c1731) {
            let _c1730 = (cl.region.of[v_p] === _h1724);
            if (_c1730) {
              const _t1725 = cl.region.cells[_h1724];
              let _g1726 = 0;
              G1727: {
                const _a1728 = _t1725;
                for (let _i1729 = 0; _i1729 < _a1728.length; _i1729++) {
                  const v_c = _a1728[_i1729];
                  if (!((b.value(v_c) === 1))) continue;
                  _g1726++;
                }
              }
              _c1730 = ((cl.stars - _g1726) === 1);
            }
            _c1731 = _c1730;
          }
          _c1732 = _c1731;
        }
        if (!(_c1732)) continue;
        _g1680.push(v_p);
      }
    }
    const v_R = _g1680;
    const _a1733 = sp.lines;
    for (let _i1734 = 0; _i1734 < _a1733.length; _i1734++) {
      const v_L = _a1733[_i1734];
      let _c1739 = ((v_L === _h1708) || (v_L === _h1716));
      if (!_c1739) {
        let _q1735 = false;
        Q1736: {
          const _a1737 = v_R;
          for (let _i1738 = 0; _i1738 < _a1737.length; _i1738++) {
            const v_p = _a1737[_i1738];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q1735 = true;
              break Q1736;
            }
          }
        }
        _c1739 = _q1735;
      }
      if (!(_c1739)) continue;
      const v_S = sp.lineCells[v_L];
      let _g1740 = 0;
      G1741: {
        const _a1742 = v_S;
        for (let _i1743 = 0; _i1743 < _a1742.length; _i1743++) {
          const v_c = _a1742[_i1743];
          if (!((b.value(v_c) === 1))) continue;
          _g1740++;
        }
      }
      let _g1744 = 0;
      G1745: {
        const _a1746 = setOf(v_x);
        for (let _i1747 = 0; _i1747 < _a1746.length; _i1747++) {
          const v_c = _a1746[_i1747];
          if (!((v_S.includes(v_c)))) continue;
          _g1744++;
        }
      }
      const v_n = ((cl.stars - _g1740) - _g1744);
      _g1748.length = 0;
      G1749: {
        _g1758.length = 0;
        G1759: {
          const _a1762 = v_S;
          for (let _i1763 = 0; _i1763 < _a1762.length; _i1763++) {
            const v_c = _a1762[_i1763];
            if (!(!(b.known(v_c)))) continue;
            _g1758.push(v_c);
          }
        }
        const _a1764 = _g1758;
        for (let _i1765 = 0; _i1765 < _a1764.length; _i1765++) {
          const v_c = _a1764[_i1765];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1748.push(v_c);
        }
      }
      L1766: {
        const v_E = _g1748;
        const _h1778 = v_E.length;
        const _h1790 = (2 * _h1778);
        const _h1791 = (_h1790 - v_n);
        let _c1792 = (v_n > 0);
        if (_c1792) {
          let _q1767 = false;
          Q1768: {
            const _a1769 = v_E;
            const _t1779 = ((2 * _h1778) - v_n);
            const _lo1780 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1781 = 31 - Math.clz32(b.domain);
            for (const _e1773 of _l1771) _f1770[_e1773] = -1;
            _l1771 = _a1769;
            let _i1775 = 0;
            _s1772[0] = 0;
            let _o1783 = _a1769.length === 0;
            for (;;) {
              if (_a1769.length === 0) {
                if (!_o1783) break;
                _o1783 = false;
              }
              while (_a1769.length > 0 && _i1775 >= 0) {
                const _e1773 = _a1769[_i1775];
                if (_s1772[_i1775] > 0) _f1770[_e1773] = -1;
                let _r1782 = b.domain & ~((2 << _s1772[_i1775]) - 1);
                let _d1774 = 0;
                V1777: for (; _r1782 !== 0; _r1782 &= _r1782 - 1) {
                  _d1774 = 31 - Math.clz32(_r1782 & -_r1782);
                  _f1770[_e1773] = _d1774;
                  {
                    let _t1784 = _d1774;
                    for (let _j1776 = 0; _j1776 < _i1775; _j1776++) _t1784 += _f1770[_a1769[_j1776]];
                    if (_t1784 + (_a1769.length - _i1775 - 1) * _lo1780 > _t1779) continue;
                    if (_t1784 + (_a1769.length - _i1775 - 1) * _hi1781 < _t1779) continue;
                  }
                  for (let _j1776 = 0; _j1776 < _i1775; _j1776++) {
                    const _y1785 = _a1769[_j1776];
                    if (!(!((((_f1770[_e1773] === 1) && (_f1770[_y1785] === 1)) && (sp.adj8[_e1773].includes(_y1785)))))) continue V1777;
                  }
                  break;
                }
                if (_r1782 === 0) {
                  _s1772[_i1775] = 0;
                  _i1775--;
                  continue;
                }
                _s1772[_i1775] = _d1774;
                if (_i1775 === _a1769.length - 1) break;
                _i1775++;
                _s1772[_i1775] = 0;
              }
              if (_i1775 < 0) break;
              let _g1786 = 0;
              G1787: {
                const _a1788 = v_E;
                for (let _i1789 = 0; _i1789 < _a1788.length; _i1789++) {
                  const v_x = _a1788[_i1789];
                  _g1786 += _f1770[v_x];
                }
              }
              if (!((_g1786 === _h1791))) continue;
              if (true) {
                _q1767 = true;
                break Q1768;
              }
            }
          }
          _c1792 = !(_q1767);
        }
        if (!(_c1792)) break L1766;
        let _g1793 = -1;
        G1794: {
          for (let _m1795 = rangeMask(0, v_n); _m1795 !== 0; _m1795 &= _m1795 - 1) {
            const v_j = 31 - Math.clz32(_m1795 & -_m1795);
            const _h1818 = (_h1790 - v_j);
            let _q1796 = false;
            Q1797: {
              const _a1798 = v_E;
              const _t1807 = (_h1790 - v_j);
              const _lo1808 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1809 = 31 - Math.clz32(b.domain);
              for (const _e1802 of _l1800) _f1799[_e1802] = -1;
              _l1800 = _a1798;
              let _i1804 = 0;
              _s1801[0] = 0;
              let _o1811 = _a1798.length === 0;
              for (;;) {
                if (_a1798.length === 0) {
                  if (!_o1811) break;
                  _o1811 = false;
                }
                while (_a1798.length > 0 && _i1804 >= 0) {
                  const _e1802 = _a1798[_i1804];
                  if (_s1801[_i1804] > 0) _f1799[_e1802] = -1;
                  let _r1810 = b.domain & ~((2 << _s1801[_i1804]) - 1);
                  let _d1803 = 0;
                  V1806: for (; _r1810 !== 0; _r1810 &= _r1810 - 1) {
                    _d1803 = 31 - Math.clz32(_r1810 & -_r1810);
                    _f1799[_e1802] = _d1803;
                    {
                      let _t1812 = _d1803;
                      for (let _j1805 = 0; _j1805 < _i1804; _j1805++) _t1812 += _f1799[_a1798[_j1805]];
                      if (_t1812 + (_a1798.length - _i1804 - 1) * _lo1808 > _t1807) continue;
                      if (_t1812 + (_a1798.length - _i1804 - 1) * _hi1809 < _t1807) continue;
                    }
                    for (let _j1805 = 0; _j1805 < _i1804; _j1805++) {
                      const _y1813 = _a1798[_j1805];
                      if (!(!((((_f1799[_e1802] === 1) && (_f1799[_y1813] === 1)) && (sp.adj8[_e1802].includes(_y1813)))))) continue V1806;
                    }
                    break;
                  }
                  if (_r1810 === 0) {
                    _s1801[_i1804] = 0;
                    _i1804--;
                    continue;
                  }
                  _s1801[_i1804] = _d1803;
                  if (_i1804 === _a1798.length - 1) break;
                  _i1804++;
                  _s1801[_i1804] = 0;
                }
                if (_i1804 < 0) break;
                let _g1814 = 0;
                G1815: {
                  const _a1816 = v_E;
                  for (let _i1817 = 0; _i1817 < _a1816.length; _i1817++) {
                    const v_x = _a1816[_i1817];
                    _g1814 += _f1799[v_x];
                  }
                }
                if (!((_g1814 === _h1818))) continue;
                if (true) {
                  _q1796 = true;
                  break Q1797;
                }
              }
            }
            if (!(_q1796)) continue;
            if (_g1793 === -1 || v_j > _g1793) _g1793 = v_j;
          }
        }
        const v_room = _g1793;
        _g1819.length = 0;
        G1820: {
          _g1829.length = 0;
          G1830: {
            const _a1833 = v_S;
            for (let _i1834 = 0; _i1834 < _a1833.length; _i1834++) {
              const v_c = _a1833[_i1834];
              if (!(!(b.known(v_c)))) continue;
              _g1829.push(v_c);
            }
          }
          const _a1835 = _g1829;
          for (let _i1836 = 0; _i1836 < _a1835.length; _i1836++) {
            const v_c = _a1835[_i1836];
            if (!((v_R.includes(v_c)))) continue;
            _g1819.push(v_c);
          }
        }
        const v_Q = _g1819;
        facts.length = 0;
        changed = false;
        if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
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

export function starvedRegion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedRegionBinding> | null): number {
  const _g1991: number[] = [];
  const _g2059: number[] = [];
  const _g2069: number[] = [];
  const _f2081 = new Int32Array(sp.cells.length).fill(-1);
  let _l2082: readonly number[] = [];
  const _s2083: number[] = [];
  const _f2110 = new Int32Array(sp.cells.length).fill(-1);
  let _l2111: readonly number[] = [];
  const _s2112: number[] = [];
  const _g2130: number[] = [];
  const _g2140: number[] = [];
  const facts = starvedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1989 = sp.cells;
  for (let _i1990 = 0; _i1990 < _a1989.length; _i1990++) {
    const v_x = _a1989[_i1990];
    if (!(!(b.known(v_x)))) continue;
    const _h2019 = sp.rowOf[v_x];
    const _h2027 = sp.colOf[v_x];
    const _h2035 = cl.region.of[v_x];
    _g1991.length = 0;
    G1992: {
      const _a2017 = sp.cells;
      for (let _i2018 = 0; _i2018 < _a2017.length; _i2018++) {
        const v_p = _a2017[_i2018];
        let _c2043 = (!(b.known(v_p)) && (v_p !== v_x));
        if (_c2043) {
          let _c2026 = (sp.adj8[v_x].includes(v_p));
          if (!_c2026) {
            let _c2025 = (sp.rowOf[v_p] === _h2019);
            if (_c2025) {
              const _t2020 = sp.lineCells[_h2019];
              let _g2021 = 0;
              G2022: {
                const _a2023 = _t2020;
                for (let _i2024 = 0; _i2024 < _a2023.length; _i2024++) {
                  const v_c = _a2023[_i2024];
                  if (!((b.value(v_c) === 1))) continue;
                  _g2021++;
                }
              }
              _c2025 = ((cl.stars - _g2021) === 1);
            }
            _c2026 = _c2025;
          }
          let _c2034 = _c2026;
          if (!_c2034) {
            let _c2033 = (sp.colOf[v_p] === _h2027);
            if (_c2033) {
              const _t2028 = sp.lineCells[_h2027];
              let _g2029 = 0;
              G2030: {
                const _a2031 = _t2028;
                for (let _i2032 = 0; _i2032 < _a2031.length; _i2032++) {
                  const v_c = _a2031[_i2032];
                  if (!((b.value(v_c) === 1))) continue;
                  _g2029++;
                }
              }
              _c2033 = ((cl.stars - _g2029) === 1);
            }
            _c2034 = _c2033;
          }
          let _c2042 = _c2034;
          if (!_c2042) {
            let _c2041 = (cl.region.of[v_p] === _h2035);
            if (_c2041) {
              const _t2036 = cl.region.cells[_h2035];
              let _g2037 = 0;
              G2038: {
                const _a2039 = _t2036;
                for (let _i2040 = 0; _i2040 < _a2039.length; _i2040++) {
                  const v_c = _a2039[_i2040];
                  if (!((b.value(v_c) === 1))) continue;
                  _g2037++;
                }
              }
              _c2041 = ((cl.stars - _g2037) === 1);
            }
            _c2042 = _c2041;
          }
          _c2043 = _c2042;
        }
        if (!(_c2043)) continue;
        _g1991.push(v_p);
      }
    }
    const v_R = _g1991;
    const _a2044 = cl.region.parts;
    for (let _i2045 = 0; _i2045 < _a2044.length; _i2045++) {
      const v_g = _a2044[_i2045];
      let _c2050 = (v_g === _h2035);
      if (!_c2050) {
        let _q2046 = false;
        Q2047: {
          const _a2048 = v_R;
          for (let _i2049 = 0; _i2049 < _a2048.length; _i2049++) {
            const v_p = _a2048[_i2049];
            if ((cl.region.of[v_p] === v_g)) {
              _q2046 = true;
              break Q2047;
            }
          }
        }
        _c2050 = _q2046;
      }
      if (!(_c2050)) continue;
      const v_S = cl.region.cells[v_g];
      let _g2051 = 0;
      G2052: {
        const _a2053 = v_S;
        for (let _i2054 = 0; _i2054 < _a2053.length; _i2054++) {
          const v_c = _a2053[_i2054];
          if (!((b.value(v_c) === 1))) continue;
          _g2051++;
        }
      }
      let _g2055 = 0;
      G2056: {
        const _a2057 = setOf(v_x);
        for (let _i2058 = 0; _i2058 < _a2057.length; _i2058++) {
          const v_c = _a2057[_i2058];
          if (!((v_S.includes(v_c)))) continue;
          _g2055++;
        }
      }
      const v_n = ((cl.stars - _g2051) - _g2055);
      _g2059.length = 0;
      G2060: {
        _g2069.length = 0;
        G2070: {
          const _a2073 = v_S;
          for (let _i2074 = 0; _i2074 < _a2073.length; _i2074++) {
            const v_c = _a2073[_i2074];
            if (!(!(b.known(v_c)))) continue;
            _g2069.push(v_c);
          }
        }
        const _a2075 = _g2069;
        for (let _i2076 = 0; _i2076 < _a2075.length; _i2076++) {
          const v_c = _a2075[_i2076];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g2059.push(v_c);
        }
      }
      L2077: {
        const v_E = _g2059;
        const _h2089 = v_E.length;
        const _h2101 = (2 * _h2089);
        const _h2102 = (_h2101 - v_n);
        let _c2103 = (v_n > 0);
        if (_c2103) {
          let _q2078 = false;
          Q2079: {
            const _a2080 = v_E;
            const _t2090 = ((2 * _h2089) - v_n);
            const _lo2091 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi2092 = 31 - Math.clz32(b.domain);
            for (const _e2084 of _l2082) _f2081[_e2084] = -1;
            _l2082 = _a2080;
            let _i2086 = 0;
            _s2083[0] = 0;
            let _o2094 = _a2080.length === 0;
            for (;;) {
              if (_a2080.length === 0) {
                if (!_o2094) break;
                _o2094 = false;
              }
              while (_a2080.length > 0 && _i2086 >= 0) {
                const _e2084 = _a2080[_i2086];
                if (_s2083[_i2086] > 0) _f2081[_e2084] = -1;
                let _r2093 = b.domain & ~((2 << _s2083[_i2086]) - 1);
                let _d2085 = 0;
                V2088: for (; _r2093 !== 0; _r2093 &= _r2093 - 1) {
                  _d2085 = 31 - Math.clz32(_r2093 & -_r2093);
                  _f2081[_e2084] = _d2085;
                  {
                    let _t2095 = _d2085;
                    for (let _j2087 = 0; _j2087 < _i2086; _j2087++) _t2095 += _f2081[_a2080[_j2087]];
                    if (_t2095 + (_a2080.length - _i2086 - 1) * _lo2091 > _t2090) continue;
                    if (_t2095 + (_a2080.length - _i2086 - 1) * _hi2092 < _t2090) continue;
                  }
                  for (let _j2087 = 0; _j2087 < _i2086; _j2087++) {
                    const _y2096 = _a2080[_j2087];
                    if (!(!((((_f2081[_e2084] === 1) && (_f2081[_y2096] === 1)) && (sp.adj8[_e2084].includes(_y2096)))))) continue V2088;
                  }
                  break;
                }
                if (_r2093 === 0) {
                  _s2083[_i2086] = 0;
                  _i2086--;
                  continue;
                }
                _s2083[_i2086] = _d2085;
                if (_i2086 === _a2080.length - 1) break;
                _i2086++;
                _s2083[_i2086] = 0;
              }
              if (_i2086 < 0) break;
              let _g2097 = 0;
              G2098: {
                const _a2099 = v_E;
                for (let _i2100 = 0; _i2100 < _a2099.length; _i2100++) {
                  const v_x = _a2099[_i2100];
                  _g2097 += _f2081[v_x];
                }
              }
              if (!((_g2097 === _h2102))) continue;
              if (true) {
                _q2078 = true;
                break Q2079;
              }
            }
          }
          _c2103 = !(_q2078);
        }
        if (!(_c2103)) break L2077;
        let _g2104 = -1;
        G2105: {
          for (let _m2106 = rangeMask(0, v_n); _m2106 !== 0; _m2106 &= _m2106 - 1) {
            const v_j = 31 - Math.clz32(_m2106 & -_m2106);
            const _h2129 = (_h2101 - v_j);
            let _q2107 = false;
            Q2108: {
              const _a2109 = v_E;
              const _t2118 = (_h2101 - v_j);
              const _lo2119 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi2120 = 31 - Math.clz32(b.domain);
              for (const _e2113 of _l2111) _f2110[_e2113] = -1;
              _l2111 = _a2109;
              let _i2115 = 0;
              _s2112[0] = 0;
              let _o2122 = _a2109.length === 0;
              for (;;) {
                if (_a2109.length === 0) {
                  if (!_o2122) break;
                  _o2122 = false;
                }
                while (_a2109.length > 0 && _i2115 >= 0) {
                  const _e2113 = _a2109[_i2115];
                  if (_s2112[_i2115] > 0) _f2110[_e2113] = -1;
                  let _r2121 = b.domain & ~((2 << _s2112[_i2115]) - 1);
                  let _d2114 = 0;
                  V2117: for (; _r2121 !== 0; _r2121 &= _r2121 - 1) {
                    _d2114 = 31 - Math.clz32(_r2121 & -_r2121);
                    _f2110[_e2113] = _d2114;
                    {
                      let _t2123 = _d2114;
                      for (let _j2116 = 0; _j2116 < _i2115; _j2116++) _t2123 += _f2110[_a2109[_j2116]];
                      if (_t2123 + (_a2109.length - _i2115 - 1) * _lo2119 > _t2118) continue;
                      if (_t2123 + (_a2109.length - _i2115 - 1) * _hi2120 < _t2118) continue;
                    }
                    for (let _j2116 = 0; _j2116 < _i2115; _j2116++) {
                      const _y2124 = _a2109[_j2116];
                      if (!(!((((_f2110[_e2113] === 1) && (_f2110[_y2124] === 1)) && (sp.adj8[_e2113].includes(_y2124)))))) continue V2117;
                    }
                    break;
                  }
                  if (_r2121 === 0) {
                    _s2112[_i2115] = 0;
                    _i2115--;
                    continue;
                  }
                  _s2112[_i2115] = _d2114;
                  if (_i2115 === _a2109.length - 1) break;
                  _i2115++;
                  _s2112[_i2115] = 0;
                }
                if (_i2115 < 0) break;
                let _g2125 = 0;
                G2126: {
                  const _a2127 = v_E;
                  for (let _i2128 = 0; _i2128 < _a2127.length; _i2128++) {
                    const v_x = _a2127[_i2128];
                    _g2125 += _f2110[v_x];
                  }
                }
                if (!((_g2125 === _h2129))) continue;
                if (true) {
                  _q2107 = true;
                  break Q2108;
                }
              }
            }
            if (!(_q2107)) continue;
            if (_g2104 === -1 || v_j > _g2104) _g2104 = v_j;
          }
        }
        const v_room = _g2104;
        _g2130.length = 0;
        G2131: {
          _g2140.length = 0;
          G2141: {
            const _a2144 = v_S;
            for (let _i2145 = 0; _i2145 < _a2144.length; _i2145++) {
              const v_c = _a2144[_i2145];
              if (!(!(b.known(v_c)))) continue;
              _g2140.push(v_c);
            }
          }
          const _a2146 = _g2140;
          for (let _i2147 = 0; _i2147 < _a2146.length; _i2147++) {
            const v_c = _a2146[_i2147];
            if (!((v_R.includes(v_c)))) continue;
            _g2130.push(v_c);
          }
        }
        const v_Q = _g2130;
        facts.length = 0;
        changed = false;
        if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
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
