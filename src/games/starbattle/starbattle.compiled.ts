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
  let _q1972 = true;
  Q1973: {
    const _a1974 = sp.lines;
    for (let _i1975 = 0; _i1975 < _a1974.length; _i1975++) {
      const v_L = _a1974[_i1975];
      let _g1976 = 0;
      G1977: {
        const _a1978 = sp.lineCells[v_L];
        for (let _i1979 = 0; _i1979 < _a1978.length; _i1979++) {
          const v_c = _a1978[_i1979];
          const _h1980 = (g[v_c] || -1);
          if (!((_h1980 === 1))) continue;
          _g1976++;
        }
      }
      if (!((_g1976 === cl.stars))) {
        _q1972 = false;
        break Q1973;
      }
    }
  }
  if (!(_q1972)) return false;
  let _q1981 = true;
  Q1982: {
    const _a1983 = cl.region.parts;
    for (let _i1984 = 0; _i1984 < _a1983.length; _i1984++) {
      const v_r = _a1983[_i1984];
      let _g1985 = 0;
      G1986: {
        const _a1987 = cl.region.cells[v_r];
        for (let _i1988 = 0; _i1988 < _a1987.length; _i1988++) {
          const v_c = _a1987[_i1988];
          const _h1989 = (g[v_c] || -1);
          if (!((_h1989 === 1))) continue;
          _g1985++;
        }
      }
      if (!((_g1985 === cl.stars))) {
        _q1981 = false;
        break Q1982;
      }
    }
  }
  if (!(_q1981)) return false;
  let _q1990 = true;
  Q1991: {
    const _a1992 = sp.cells;
    for (let _i1993 = 0; _i1993 < _a1992.length; _i1993++) {
      const v_a = _a1992[_i1993];
      const _h1994 = (g[v_a] || -1);
      if (!((_h1994 === 1))) continue;
      let _q1995 = true;
      Q1996: {
        const _a1997 = sp.adj8[v_a];
        for (let _i1998 = 0; _i1998 < _a1997.length; _i1998++) {
          const v_b = _a1997[_i1998];
          const _h1999 = (g[v_b] || -1);
          if (!((_h1999 !== 1))) {
            _q1995 = false;
            break Q1996;
          }
        }
      }
      if (!(_q1995)) {
        _q1990 = false;
        break Q1991;
      }
    }
  }
  if (!(_q1990)) return false;
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

/** Its dearest read grows with the board as n. */
export function confined(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ConfinedBinding> | null): number {
  const _g293: number[] = [];
  const _g306: number[] = [];
  const _g351: number[] = [];
  const _g369: number[] = [];
  const _g414: number[] = [];
  const _g434: number[] = [];
  const _g446: number[] = [];
  const _g461: number[] = [];
  const facts = confinedFacts;
  let fired = 0;
  let changed = false;
  const _h292 = (sp.w - 1);
  for (let v_dir = 0; v_dir <= 1; v_dir++) {
    const _h299 = (1 - v_dir);
    for (let v_a = 0; v_a <= _h292; v_a++) {
      const _h300 = (v_a + 1);
      _g293.length = 0;
      G294: {
        const _a297 = sp.cells;
        for (let _i298 = 0; _i298 < _a297.length; _i298++) {
          const v_c = _a297[_i298];
          if (!(((v_a <= ((_h299 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w)))) && (((_h299 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w))) < _h300)))) continue;
          _g293.push(v_c);
        }
      }
      const v_B = _g293;
      let _g301 = 0;
      G302: {
        const _a303 = v_B;
        for (let _i304 = 0; _i304 < _a303.length; _i304++) {
          const v_c = _a303[_i304];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g301++;
        }
      }
      L305: {
        const v_n = (cl.stars - _g301);
        if (!((v_n > 0))) break L305;
        _g306.length = 0;
        G307: {
          const _a334 = cl.region.parts;
          for (let _i335 = 0; _i335 < _a334.length; _i335++) {
            const v_r = _a334[_i335];
            const _t336 = cl.region.cells[v_r];
            let _g337 = 0;
            G338: {
              const _a339 = _t336;
              for (let _i340 = 0; _i340 < _a339.length; _i340++) {
                const v_c = _a339[_i340];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g337++;
              }
            }
            let _c359: boolean = ((cl.stars - _g337) > 0);
            if (_c359) {
              let _q348 = true;
              Q349: {
                const _t350 = cl.region.cells[v_r];
                _g351.length = 0;
                G352: {
                  const _a355 = _t350;
                  for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                    const v_c = _a355[_i356];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g351.push(v_c);
                  }
                }
                const _a357 = _g351;
                for (let _i358 = 0; _i358 < _a357.length; _i358++) {
                  const v_c = _a357[_i358];
                  if (!((v_B.includes(v_c)))) {
                    _q348 = false;
                    break Q349;
                  }
                }
              }
              _c359 = _q348;
            }
            if (!(_c359)) continue;
            _g306.push(v_r);
          }
        }
        const v_I = _g306;
        let _g360 = 0;
        G361: {
          const _a362 = v_I;
          for (let _i363 = 0; _i363 < _a362.length; _i363++) {
            const v_r = _a362[_i363];
            const _t364 = cl.region.cells[v_r];
            let _g365 = 0;
            G366: {
              const _a367 = _t364;
              for (let _i368 = 0; _i368 < _a367.length; _i368++) {
                const v_c = _a367[_i368];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g365++;
              }
            }
            _g360 += (cl.stars - _g365);
          }
        }
        const v_mi = _g360;
        _g369.length = 0;
        G370: {
          const _a397 = cl.region.parts;
          for (let _i398 = 0; _i398 < _a397.length; _i398++) {
            const v_r = _a397[_i398];
            const _t399 = cl.region.cells[v_r];
            let _g400 = 0;
            G401: {
              const _a402 = _t399;
              for (let _i403 = 0; _i403 < _a402.length; _i403++) {
                const v_c = _a402[_i403];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g400++;
              }
            }
            let _c422: boolean = ((cl.stars - _g400) > 0);
            if (_c422) {
              let _q411 = false;
              Q412: {
                const _t413 = cl.region.cells[v_r];
                _g414.length = 0;
                G415: {
                  const _a418 = _t413;
                  for (let _i419 = 0; _i419 < _a418.length; _i419++) {
                    const v_c = _a418[_i419];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g414.push(v_c);
                  }
                }
                const _a420 = _g414;
                for (let _i421 = 0; _i421 < _a420.length; _i421++) {
                  const v_c = _a420[_i421];
                  if ((v_B.includes(v_c))) {
                    _q411 = true;
                    break Q412;
                  }
                }
              }
              _c422 = _q411;
            }
            if (!(_c422)) continue;
            _g369.push(v_r);
          }
        }
        const v_R = _g369;
        let _g423 = 0;
        G424: {
          const _a425 = v_R;
          for (let _i426 = 0; _i426 < _a425.length; _i426++) {
            const v_r = _a425[_i426];
            const _t427 = cl.region.cells[v_r];
            let _g428 = 0;
            G429: {
              const _a430 = _t427;
              for (let _i431 = 0; _i431 < _a430.length; _i431++) {
                const v_c = _a430[_i431];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g428++;
              }
            }
            _g423 += (cl.stars - _g428);
          }
        }
        const v_mr = _g423;
        let _c442: boolean = (v_mi === v_n);
        if (_c442) {
          let _q432 = false;
          Q433: {
            _g434.length = 0;
            G435: {
              const _a438 = v_B;
              for (let _i439 = 0; _i439 < _a438.length; _i439++) {
                const v_c = _a438[_i439];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g434.push(v_c);
              }
            }
            const _a440 = _g434;
            for (let _i441 = 0; _i441 < _a440.length; _i441++) {
              const v_c = _a440[_i441];
              if (!(v_I.includes(cl.region.of[v_c]))) {
                _q432 = true;
                break Q433;
              }
            }
          }
          _c442 = _q432;
        }
        L443: {
          const v_lines = _c442;
          if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L443;
          facts.length = 0;
          changed = false;
          let _c455: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
          if (_c455) {
            let _c454: boolean = !(v_lines);
            if (!_c454) {
              let _q444 = true;
              Q445: {
                _g446.length = 0;
                G447: {
                  const _a450 = v_B;
                  for (let _i451 = 0; _i451 < _a450.length; _i451++) {
                    const v_c = _a450[_i451];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g446.push(v_c);
                  }
                }
                const _a452 = _g446;
                for (let _i453 = 0; _i453 < _a452.length; _i453++) {
                  const v_c = _a452[_i453];
                  if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                  if (!(true)) {
                    _q444 = false;
                    break Q445;
                  }
                }
              }
              _c454 = _q444;
            }
            _c455 = _c454;
          }
          let _c470: boolean = _c455;
          if (_c470) {
            let _c469: boolean = (v_lines || (v_mr > v_n));
            if (!_c469) {
              let _q456 = true;
              Q457: {
                const _a458 = v_R;
                for (let _i459 = 0; _i459 < _a458.length; _i459++) {
                  const v_r = _a458[_i459];
                  const _t460 = cl.region.cells[v_r];
                  _g461.length = 0;
                  G462: {
                    const _a465 = _t460;
                    for (let _i466 = 0; _i466 < _a465.length; _i466++) {
                      const v_c = _a465[_i466];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g461.push(v_c);
                    }
                  }
                  const _a467 = _g461;
                  for (let _i468 = 0; _i468 < _a467.length; _i468++) {
                    const v_c = _a467[_i468];
                    if (!(!(v_B.includes(v_c)))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q456 = false;
                      break Q457;
                    }
                  }
                }
              }
              _c469 = _q456;
            }
            _c470 = _c469;
          }
          if (!(_c470)) return -1;
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
  const _g543: number[] = [];
  const _f556 = new Int32Array(sp.cells.length).fill(-1);
  let _l557: readonly number[] = [];
  const _s558: number[] = [];
  const _f583 = new Int32Array(sp.cells.length).fill(-1);
  let _l584: readonly number[] = [];
  const _s585: number[] = [];
  const facts = neededLineFacts;
  let fired = 0;
  let changed = false;
  const _a535 = sp.lines;
  for (let _i536 = 0; _i536 < _a535.length; _i536++) {
    const v_L = _a535[_i536];
    const _t537 = sp.lineCells[v_L];
    let _g538 = 0;
    G539: {
      const _a540 = _t537;
      for (let _i541 = 0; _i541 < _a540.length; _i541++) {
        const v_c = _a540[_i541];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g538++;
      }
    }
    const v_n = (cl.stars - _g538);
    const _t542 = sp.lineCells[v_L];
    _g543.length = 0;
    G544: {
      const _a547 = _t542;
      for (let _i548 = 0; _i548 < _a547.length; _i548++) {
        const v_c = _a547[_i548];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g543.push(v_c);
      }
    }
    L549: {
      const v_O = _g543;
      if (!((v_n > 0))) break L549;
      const _a550 = v_O;
      for (let _i551 = 0; _i551 < _a550.length; _i551++) {
        const v_x = _a550[_i551];
        L552: {
          const v_E = minus(v_O, setOf(v_x));
          const _h564 = v_E.length;
          const _h576 = (2 * _h564);
          const _h577 = (_h576 - v_n);
          let _q553 = false;
          Q554: {
            const _a555 = v_E;
            const _t565 = ((2 * _h564) - v_n);
            const _lo566 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi567 = 31 - Math.clz32(b.domain);
            for (const _e559 of _l557) _f556[_e559] = -1;
            _l557 = _a555;
            let _i561 = 0;
            _s558[0] = 0;
            let _o569 = _a555.length === 0;
            for (;;) {
              if (_a555.length === 0) {
                if (!_o569) break;
                _o569 = false;
              }
              while (_a555.length > 0 && _i561 >= 0) {
                const _e559 = _a555[_i561];
                if (_s558[_i561] > 0) _f556[_e559] = -1;
                let _r568 = b.domain & ~((2 << _s558[_i561]) - 1);
                let _d560 = 0;
                V563: for (; _r568 !== 0; _r568 &= _r568 - 1) {
                  _d560 = 31 - Math.clz32(_r568 & -_r568);
                  _f556[_e559] = _d560;
                  {
                    let _t570 = _d560;
                    for (let _j562 = 0; _j562 < _i561; _j562++) _t570 += _f556[_a555[_j562]];
                    if (_t570 + (_a555.length - _i561 - 1) * _lo566 > _t565) continue;
                    if (_t570 + (_a555.length - _i561 - 1) * _hi567 < _t565) continue;
                  }
                  for (let _j562 = 0; _j562 < _i561; _j562++) {
                    const _y571 = _a555[_j562];
                    if (!(!((((_f556[_e559] === 1) && (_f556[_y571] === 1)) && (sp.adj8[_e559].includes(_y571)))))) continue V563;
                  }
                  break;
                }
                if (_r568 === 0) {
                  _s558[_i561] = 0;
                  _i561--;
                  continue;
                }
                _s558[_i561] = _d560;
                if (_i561 === _a555.length - 1) break;
                _i561++;
                _s558[_i561] = 0;
              }
              if (_i561 < 0) break;
              let _g572 = 0;
              G573: {
                const _a574 = v_E;
                for (let _i575 = 0; _i575 < _a574.length; _i575++) {
                  const v_x = _a574[_i575];
                  _g572 += _f556[v_x];
                }
              }
              if (!((_g572 === _h577))) continue;
              if (true) {
                _q553 = true;
                break Q554;
              }
            }
          }
          if (!(!(_q553))) break L552;
          let _g578 = -1;
          G579: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h602 = (_h576 - v_j);
              let _q580 = false;
              Q581: {
                const _a582 = v_E;
                const _t591 = (_h576 - v_j);
                const _lo592 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi593 = 31 - Math.clz32(b.domain);
                for (const _e586 of _l584) _f583[_e586] = -1;
                _l584 = _a582;
                let _i588 = 0;
                _s585[0] = 0;
                let _o595 = _a582.length === 0;
                for (;;) {
                  if (_a582.length === 0) {
                    if (!_o595) break;
                    _o595 = false;
                  }
                  while (_a582.length > 0 && _i588 >= 0) {
                    const _e586 = _a582[_i588];
                    if (_s585[_i588] > 0) _f583[_e586] = -1;
                    let _r594 = b.domain & ~((2 << _s585[_i588]) - 1);
                    let _d587 = 0;
                    V590: for (; _r594 !== 0; _r594 &= _r594 - 1) {
                      _d587 = 31 - Math.clz32(_r594 & -_r594);
                      _f583[_e586] = _d587;
                      {
                        let _t596 = _d587;
                        for (let _j589 = 0; _j589 < _i588; _j589++) _t596 += _f583[_a582[_j589]];
                        if (_t596 + (_a582.length - _i588 - 1) * _lo592 > _t591) continue;
                        if (_t596 + (_a582.length - _i588 - 1) * _hi593 < _t591) continue;
                      }
                      for (let _j589 = 0; _j589 < _i588; _j589++) {
                        const _y597 = _a582[_j589];
                        if (!(!((((_f583[_e586] === 1) && (_f583[_y597] === 1)) && (sp.adj8[_e586].includes(_y597)))))) continue V590;
                      }
                      break;
                    }
                    if (_r594 === 0) {
                      _s585[_i588] = 0;
                      _i588--;
                      continue;
                    }
                    _s585[_i588] = _d587;
                    if (_i588 === _a582.length - 1) break;
                    _i588++;
                    _s585[_i588] = 0;
                  }
                  if (_i588 < 0) break;
                  let _g598 = 0;
                  G599: {
                    const _a600 = v_E;
                    for (let _i601 = 0; _i601 < _a600.length; _i601++) {
                      const v_x = _a600[_i601];
                      _g598 += _f583[v_x];
                    }
                  }
                  if (!((_g598 === _h602))) continue;
                  if (true) {
                    _q580 = true;
                    break Q581;
                  }
                }
              }
              if (!(_q580)) continue;
              _g578 = v_j;
              break G579;
            }
          }
          const v_room = _g578;
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
  const _g675: number[] = [];
  const _f688 = new Int32Array(sp.cells.length).fill(-1);
  let _l689: readonly number[] = [];
  const _s690: number[] = [];
  const _f715 = new Int32Array(sp.cells.length).fill(-1);
  let _l716: readonly number[] = [];
  const _s717: number[] = [];
  const facts = neededRegionFacts;
  let fired = 0;
  let changed = false;
  const _a667 = cl.region.parts;
  for (let _i668 = 0; _i668 < _a667.length; _i668++) {
    const v_r = _a667[_i668];
    const _t669 = cl.region.cells[v_r];
    let _g670 = 0;
    G671: {
      const _a672 = _t669;
      for (let _i673 = 0; _i673 < _a672.length; _i673++) {
        const v_c = _a672[_i673];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g670++;
      }
    }
    const v_n = (cl.stars - _g670);
    const _t674 = cl.region.cells[v_r];
    _g675.length = 0;
    G676: {
      const _a679 = _t674;
      for (let _i680 = 0; _i680 < _a679.length; _i680++) {
        const v_c = _a679[_i680];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g675.push(v_c);
      }
    }
    L681: {
      const v_O = _g675;
      if (!((v_n > 0))) break L681;
      const _a682 = v_O;
      for (let _i683 = 0; _i683 < _a682.length; _i683++) {
        const v_x = _a682[_i683];
        L684: {
          const v_E = minus(v_O, setOf(v_x));
          const _h696 = v_E.length;
          const _h708 = (2 * _h696);
          const _h709 = (_h708 - v_n);
          let _q685 = false;
          Q686: {
            const _a687 = v_E;
            const _t697 = ((2 * _h696) - v_n);
            const _lo698 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi699 = 31 - Math.clz32(b.domain);
            for (const _e691 of _l689) _f688[_e691] = -1;
            _l689 = _a687;
            let _i693 = 0;
            _s690[0] = 0;
            let _o701 = _a687.length === 0;
            for (;;) {
              if (_a687.length === 0) {
                if (!_o701) break;
                _o701 = false;
              }
              while (_a687.length > 0 && _i693 >= 0) {
                const _e691 = _a687[_i693];
                if (_s690[_i693] > 0) _f688[_e691] = -1;
                let _r700 = b.domain & ~((2 << _s690[_i693]) - 1);
                let _d692 = 0;
                V695: for (; _r700 !== 0; _r700 &= _r700 - 1) {
                  _d692 = 31 - Math.clz32(_r700 & -_r700);
                  _f688[_e691] = _d692;
                  {
                    let _t702 = _d692;
                    for (let _j694 = 0; _j694 < _i693; _j694++) _t702 += _f688[_a687[_j694]];
                    if (_t702 + (_a687.length - _i693 - 1) * _lo698 > _t697) continue;
                    if (_t702 + (_a687.length - _i693 - 1) * _hi699 < _t697) continue;
                  }
                  for (let _j694 = 0; _j694 < _i693; _j694++) {
                    const _y703 = _a687[_j694];
                    if (!(!((((_f688[_e691] === 1) && (_f688[_y703] === 1)) && (sp.adj8[_e691].includes(_y703)))))) continue V695;
                  }
                  break;
                }
                if (_r700 === 0) {
                  _s690[_i693] = 0;
                  _i693--;
                  continue;
                }
                _s690[_i693] = _d692;
                if (_i693 === _a687.length - 1) break;
                _i693++;
                _s690[_i693] = 0;
              }
              if (_i693 < 0) break;
              let _g704 = 0;
              G705: {
                const _a706 = v_E;
                for (let _i707 = 0; _i707 < _a706.length; _i707++) {
                  const v_x = _a706[_i707];
                  _g704 += _f688[v_x];
                }
              }
              if (!((_g704 === _h709))) continue;
              if (true) {
                _q685 = true;
                break Q686;
              }
            }
          }
          if (!(!(_q685))) break L684;
          let _g710 = -1;
          G711: {
            for (let v_j = v_n; v_j >= 0; v_j--) {
              const _h734 = (_h708 - v_j);
              let _q712 = false;
              Q713: {
                const _a714 = v_E;
                const _t723 = (_h708 - v_j);
                const _lo724 = 31 - Math.clz32(b.domain & -b.domain);
                const _hi725 = 31 - Math.clz32(b.domain);
                for (const _e718 of _l716) _f715[_e718] = -1;
                _l716 = _a714;
                let _i720 = 0;
                _s717[0] = 0;
                let _o727 = _a714.length === 0;
                for (;;) {
                  if (_a714.length === 0) {
                    if (!_o727) break;
                    _o727 = false;
                  }
                  while (_a714.length > 0 && _i720 >= 0) {
                    const _e718 = _a714[_i720];
                    if (_s717[_i720] > 0) _f715[_e718] = -1;
                    let _r726 = b.domain & ~((2 << _s717[_i720]) - 1);
                    let _d719 = 0;
                    V722: for (; _r726 !== 0; _r726 &= _r726 - 1) {
                      _d719 = 31 - Math.clz32(_r726 & -_r726);
                      _f715[_e718] = _d719;
                      {
                        let _t728 = _d719;
                        for (let _j721 = 0; _j721 < _i720; _j721++) _t728 += _f715[_a714[_j721]];
                        if (_t728 + (_a714.length - _i720 - 1) * _lo724 > _t723) continue;
                        if (_t728 + (_a714.length - _i720 - 1) * _hi725 < _t723) continue;
                      }
                      for (let _j721 = 0; _j721 < _i720; _j721++) {
                        const _y729 = _a714[_j721];
                        if (!(!((((_f715[_e718] === 1) && (_f715[_y729] === 1)) && (sp.adj8[_e718].includes(_y729)))))) continue V722;
                      }
                      break;
                    }
                    if (_r726 === 0) {
                      _s717[_i720] = 0;
                      _i720--;
                      continue;
                    }
                    _s717[_i720] = _d719;
                    if (_i720 === _a714.length - 1) break;
                    _i720++;
                    _s717[_i720] = 0;
                  }
                  if (_i720 < 0) break;
                  let _g730 = 0;
                  G731: {
                    const _a732 = v_E;
                    for (let _i733 = 0; _i733 < _a732.length; _i733++) {
                      const v_x = _a732[_i733];
                      _g730 += _f715[v_x];
                    }
                  }
                  if (!((_g730 === _h734))) continue;
                  if (true) {
                    _q712 = true;
                    break Q713;
                  }
                }
              }
              if (!(_q712)) continue;
              _g710 = v_j;
              break G711;
            }
          }
          const v_room = _g710;
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
  const _g844: number[] = [];
  const _g867: number[] = [];
  const _g877: number[] = [];
  const _f889 = new Int32Array(sp.cells.length).fill(-1);
  let _l890: readonly number[] = [];
  const _s891: number[] = [];
  const _f917 = new Int32Array(sp.cells.length).fill(-1);
  let _l918: readonly number[] = [];
  const _s919: number[] = [];
  const _g937: number[] = [];
  const _g947: number[] = [];
  const facts = crowdedLineFacts;
  let fired = 0;
  let changed = false;
  const _a842 = sp.cells;
  for (let _i843 = 0; _i843 < _a842.length; _i843++) {
    const v_x = _a842[_i843];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h852 = sp.rowOf[v_x];
    const _h853 = sp.colOf[v_x];
    _g844.length = 0;
    G845: {
      const _a848 = sp.adj8[v_x];
      for (let _i849 = 0; _i849 < _a848.length; _i849++) {
        const v_p = _a848[_i849];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g844.push(v_p);
      }
    }
    const v_R = _g844;
    const _a850 = sp.lines;
    for (let _i851 = 0; _i851 < _a850.length; _i851++) {
      const v_L = _a850[_i851];
      let _c858: boolean = ((v_L === _h852) || (v_L === _h853));
      if (!_c858) {
        let _q854 = false;
        Q855: {
          const _a856 = v_R;
          for (let _i857 = 0; _i857 < _a856.length; _i857++) {
            const v_p = _a856[_i857];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q854 = true;
              break Q855;
            }
          }
        }
        _c858 = _q854;
      }
      if (!(_c858)) continue;
      const v_S = sp.lineCells[v_L];
      let _g859 = 0;
      G860: {
        const _a861 = v_S;
        for (let _i862 = 0; _i862 < _a861.length; _i862++) {
          const v_c = _a861[_i862];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g859++;
        }
      }
      let _g863 = 0;
      G864: {
        const _a865 = setOf(v_x);
        for (let _i866 = 0; _i866 < _a865.length; _i866++) {
          const v_c = _a865[_i866];
          if (!((v_S.includes(v_c)))) continue;
          _g863++;
        }
      }
      const v_n = ((cl.stars - _g859) - _g863);
      _g867.length = 0;
      G868: {
        _g877.length = 0;
        G878: {
          const _a881 = v_S;
          for (let _i882 = 0; _i882 < _a881.length; _i882++) {
            const v_c = _a881[_i882];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g877.push(v_c);
          }
        }
        const _a883 = _g877;
        for (let _i884 = 0; _i884 < _a883.length; _i884++) {
          const v_c = _a883[_i884];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g867.push(v_c);
        }
      }
      L885: {
        const v_E = _g867;
        const _h897 = v_E.length;
        const _h909 = (2 * _h897);
        const _h910 = (_h909 - v_n);
        let _c911: boolean = (v_n > 0);
        if (_c911) {
          let _q886 = false;
          Q887: {
            const _a888 = v_E;
            const _t898 = ((2 * _h897) - v_n);
            const _lo899 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi900 = 31 - Math.clz32(b.domain);
            for (const _e892 of _l890) _f889[_e892] = -1;
            _l890 = _a888;
            let _i894 = 0;
            _s891[0] = 0;
            let _o902 = _a888.length === 0;
            for (;;) {
              if (_a888.length === 0) {
                if (!_o902) break;
                _o902 = false;
              }
              while (_a888.length > 0 && _i894 >= 0) {
                const _e892 = _a888[_i894];
                if (_s891[_i894] > 0) _f889[_e892] = -1;
                let _r901 = b.domain & ~((2 << _s891[_i894]) - 1);
                let _d893 = 0;
                V896: for (; _r901 !== 0; _r901 &= _r901 - 1) {
                  _d893 = 31 - Math.clz32(_r901 & -_r901);
                  _f889[_e892] = _d893;
                  {
                    let _t903 = _d893;
                    for (let _j895 = 0; _j895 < _i894; _j895++) _t903 += _f889[_a888[_j895]];
                    if (_t903 + (_a888.length - _i894 - 1) * _lo899 > _t898) continue;
                    if (_t903 + (_a888.length - _i894 - 1) * _hi900 < _t898) continue;
                  }
                  for (let _j895 = 0; _j895 < _i894; _j895++) {
                    const _y904 = _a888[_j895];
                    if (!(!((((_f889[_e892] === 1) && (_f889[_y904] === 1)) && (sp.adj8[_e892].includes(_y904)))))) continue V896;
                  }
                  break;
                }
                if (_r901 === 0) {
                  _s891[_i894] = 0;
                  _i894--;
                  continue;
                }
                _s891[_i894] = _d893;
                if (_i894 === _a888.length - 1) break;
                _i894++;
                _s891[_i894] = 0;
              }
              if (_i894 < 0) break;
              let _g905 = 0;
              G906: {
                const _a907 = v_E;
                for (let _i908 = 0; _i908 < _a907.length; _i908++) {
                  const v_x = _a907[_i908];
                  _g905 += _f889[v_x];
                }
              }
              if (!((_g905 === _h910))) continue;
              if (true) {
                _q886 = true;
                break Q887;
              }
            }
          }
          _c911 = !(_q886);
        }
        if (!(_c911)) break L885;
        let _g912 = -1;
        G913: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h936 = (_h909 - v_j);
            let _q914 = false;
            Q915: {
              const _a916 = v_E;
              const _t925 = (_h909 - v_j);
              const _lo926 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi927 = 31 - Math.clz32(b.domain);
              for (const _e920 of _l918) _f917[_e920] = -1;
              _l918 = _a916;
              let _i922 = 0;
              _s919[0] = 0;
              let _o929 = _a916.length === 0;
              for (;;) {
                if (_a916.length === 0) {
                  if (!_o929) break;
                  _o929 = false;
                }
                while (_a916.length > 0 && _i922 >= 0) {
                  const _e920 = _a916[_i922];
                  if (_s919[_i922] > 0) _f917[_e920] = -1;
                  let _r928 = b.domain & ~((2 << _s919[_i922]) - 1);
                  let _d921 = 0;
                  V924: for (; _r928 !== 0; _r928 &= _r928 - 1) {
                    _d921 = 31 - Math.clz32(_r928 & -_r928);
                    _f917[_e920] = _d921;
                    {
                      let _t930 = _d921;
                      for (let _j923 = 0; _j923 < _i922; _j923++) _t930 += _f917[_a916[_j923]];
                      if (_t930 + (_a916.length - _i922 - 1) * _lo926 > _t925) continue;
                      if (_t930 + (_a916.length - _i922 - 1) * _hi927 < _t925) continue;
                    }
                    for (let _j923 = 0; _j923 < _i922; _j923++) {
                      const _y931 = _a916[_j923];
                      if (!(!((((_f917[_e920] === 1) && (_f917[_y931] === 1)) && (sp.adj8[_e920].includes(_y931)))))) continue V924;
                    }
                    break;
                  }
                  if (_r928 === 0) {
                    _s919[_i922] = 0;
                    _i922--;
                    continue;
                  }
                  _s919[_i922] = _d921;
                  if (_i922 === _a916.length - 1) break;
                  _i922++;
                  _s919[_i922] = 0;
                }
                if (_i922 < 0) break;
                let _g932 = 0;
                G933: {
                  const _a934 = v_E;
                  for (let _i935 = 0; _i935 < _a934.length; _i935++) {
                    const v_x = _a934[_i935];
                    _g932 += _f917[v_x];
                  }
                }
                if (!((_g932 === _h936))) continue;
                if (true) {
                  _q914 = true;
                  break Q915;
                }
              }
            }
            if (!(_q914)) continue;
            _g912 = v_j;
            break G913;
          }
        }
        const v_room = _g912;
        _g937.length = 0;
        G938: {
          _g947.length = 0;
          G948: {
            const _a951 = v_S;
            for (let _i952 = 0; _i952 < _a951.length; _i952++) {
              const v_c = _a951[_i952];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g947.push(v_c);
            }
          }
          const _a953 = _g947;
          for (let _i954 = 0; _i954 < _a953.length; _i954++) {
            const v_c = _a953[_i954];
            if (!((v_R.includes(v_c)))) continue;
            _g937.push(v_c);
          }
        }
        const v_Q = _g937;
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
  const _g1064: number[] = [];
  const _g1086: number[] = [];
  const _g1096: number[] = [];
  const _f1108 = new Int32Array(sp.cells.length).fill(-1);
  let _l1109: readonly number[] = [];
  const _s1110: number[] = [];
  const _f1136 = new Int32Array(sp.cells.length).fill(-1);
  let _l1137: readonly number[] = [];
  const _s1138: number[] = [];
  const _g1156: number[] = [];
  const _g1166: number[] = [];
  const facts = crowdedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1062 = sp.cells;
  for (let _i1063 = 0; _i1063 < _a1062.length; _i1063++) {
    const v_x = _a1062[_i1063];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1072 = cl.region.of[v_x];
    _g1064.length = 0;
    G1065: {
      const _a1068 = sp.adj8[v_x];
      for (let _i1069 = 0; _i1069 < _a1068.length; _i1069++) {
        const v_p = _a1068[_i1069];
        if (!(!((b.grid[v_p] !== 0)))) continue;
        _g1064.push(v_p);
      }
    }
    const v_R = _g1064;
    const _a1070 = cl.region.parts;
    for (let _i1071 = 0; _i1071 < _a1070.length; _i1071++) {
      const v_g = _a1070[_i1071];
      let _c1077: boolean = (v_g === _h1072);
      if (!_c1077) {
        let _q1073 = false;
        Q1074: {
          const _a1075 = v_R;
          for (let _i1076 = 0; _i1076 < _a1075.length; _i1076++) {
            const v_p = _a1075[_i1076];
            if ((cl.region.of[v_p] === v_g)) {
              _q1073 = true;
              break Q1074;
            }
          }
        }
        _c1077 = _q1073;
      }
      if (!(_c1077)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1078 = 0;
      G1079: {
        const _a1080 = v_S;
        for (let _i1081 = 0; _i1081 < _a1080.length; _i1081++) {
          const v_c = _a1080[_i1081];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1078++;
        }
      }
      let _g1082 = 0;
      G1083: {
        const _a1084 = setOf(v_x);
        for (let _i1085 = 0; _i1085 < _a1084.length; _i1085++) {
          const v_c = _a1084[_i1085];
          if (!((v_S.includes(v_c)))) continue;
          _g1082++;
        }
      }
      const v_n = ((cl.stars - _g1078) - _g1082);
      _g1086.length = 0;
      G1087: {
        _g1096.length = 0;
        G1097: {
          const _a1100 = v_S;
          for (let _i1101 = 0; _i1101 < _a1100.length; _i1101++) {
            const v_c = _a1100[_i1101];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1096.push(v_c);
          }
        }
        const _a1102 = _g1096;
        for (let _i1103 = 0; _i1103 < _a1102.length; _i1103++) {
          const v_c = _a1102[_i1103];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1086.push(v_c);
        }
      }
      L1104: {
        const v_E = _g1086;
        const _h1116 = v_E.length;
        const _h1128 = (2 * _h1116);
        const _h1129 = (_h1128 - v_n);
        let _c1130: boolean = (v_n > 0);
        if (_c1130) {
          let _q1105 = false;
          Q1106: {
            const _a1107 = v_E;
            const _t1117 = ((2 * _h1116) - v_n);
            const _lo1118 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1119 = 31 - Math.clz32(b.domain);
            for (const _e1111 of _l1109) _f1108[_e1111] = -1;
            _l1109 = _a1107;
            let _i1113 = 0;
            _s1110[0] = 0;
            let _o1121 = _a1107.length === 0;
            for (;;) {
              if (_a1107.length === 0) {
                if (!_o1121) break;
                _o1121 = false;
              }
              while (_a1107.length > 0 && _i1113 >= 0) {
                const _e1111 = _a1107[_i1113];
                if (_s1110[_i1113] > 0) _f1108[_e1111] = -1;
                let _r1120 = b.domain & ~((2 << _s1110[_i1113]) - 1);
                let _d1112 = 0;
                V1115: for (; _r1120 !== 0; _r1120 &= _r1120 - 1) {
                  _d1112 = 31 - Math.clz32(_r1120 & -_r1120);
                  _f1108[_e1111] = _d1112;
                  {
                    let _t1122 = _d1112;
                    for (let _j1114 = 0; _j1114 < _i1113; _j1114++) _t1122 += _f1108[_a1107[_j1114]];
                    if (_t1122 + (_a1107.length - _i1113 - 1) * _lo1118 > _t1117) continue;
                    if (_t1122 + (_a1107.length - _i1113 - 1) * _hi1119 < _t1117) continue;
                  }
                  for (let _j1114 = 0; _j1114 < _i1113; _j1114++) {
                    const _y1123 = _a1107[_j1114];
                    if (!(!((((_f1108[_e1111] === 1) && (_f1108[_y1123] === 1)) && (sp.adj8[_e1111].includes(_y1123)))))) continue V1115;
                  }
                  break;
                }
                if (_r1120 === 0) {
                  _s1110[_i1113] = 0;
                  _i1113--;
                  continue;
                }
                _s1110[_i1113] = _d1112;
                if (_i1113 === _a1107.length - 1) break;
                _i1113++;
                _s1110[_i1113] = 0;
              }
              if (_i1113 < 0) break;
              let _g1124 = 0;
              G1125: {
                const _a1126 = v_E;
                for (let _i1127 = 0; _i1127 < _a1126.length; _i1127++) {
                  const v_x = _a1126[_i1127];
                  _g1124 += _f1108[v_x];
                }
              }
              if (!((_g1124 === _h1129))) continue;
              if (true) {
                _q1105 = true;
                break Q1106;
              }
            }
          }
          _c1130 = !(_q1105);
        }
        if (!(_c1130)) break L1104;
        let _g1131 = -1;
        G1132: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1155 = (_h1128 - v_j);
            let _q1133 = false;
            Q1134: {
              const _a1135 = v_E;
              const _t1144 = (_h1128 - v_j);
              const _lo1145 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1146 = 31 - Math.clz32(b.domain);
              for (const _e1139 of _l1137) _f1136[_e1139] = -1;
              _l1137 = _a1135;
              let _i1141 = 0;
              _s1138[0] = 0;
              let _o1148 = _a1135.length === 0;
              for (;;) {
                if (_a1135.length === 0) {
                  if (!_o1148) break;
                  _o1148 = false;
                }
                while (_a1135.length > 0 && _i1141 >= 0) {
                  const _e1139 = _a1135[_i1141];
                  if (_s1138[_i1141] > 0) _f1136[_e1139] = -1;
                  let _r1147 = b.domain & ~((2 << _s1138[_i1141]) - 1);
                  let _d1140 = 0;
                  V1143: for (; _r1147 !== 0; _r1147 &= _r1147 - 1) {
                    _d1140 = 31 - Math.clz32(_r1147 & -_r1147);
                    _f1136[_e1139] = _d1140;
                    {
                      let _t1149 = _d1140;
                      for (let _j1142 = 0; _j1142 < _i1141; _j1142++) _t1149 += _f1136[_a1135[_j1142]];
                      if (_t1149 + (_a1135.length - _i1141 - 1) * _lo1145 > _t1144) continue;
                      if (_t1149 + (_a1135.length - _i1141 - 1) * _hi1146 < _t1144) continue;
                    }
                    for (let _j1142 = 0; _j1142 < _i1141; _j1142++) {
                      const _y1150 = _a1135[_j1142];
                      if (!(!((((_f1136[_e1139] === 1) && (_f1136[_y1150] === 1)) && (sp.adj8[_e1139].includes(_y1150)))))) continue V1143;
                    }
                    break;
                  }
                  if (_r1147 === 0) {
                    _s1138[_i1141] = 0;
                    _i1141--;
                    continue;
                  }
                  _s1138[_i1141] = _d1140;
                  if (_i1141 === _a1135.length - 1) break;
                  _i1141++;
                  _s1138[_i1141] = 0;
                }
                if (_i1141 < 0) break;
                let _g1151 = 0;
                G1152: {
                  const _a1153 = v_E;
                  for (let _i1154 = 0; _i1154 < _a1153.length; _i1154++) {
                    const v_x = _a1153[_i1154];
                    _g1151 += _f1136[v_x];
                  }
                }
                if (!((_g1151 === _h1155))) continue;
                if (true) {
                  _q1133 = true;
                  break Q1134;
                }
              }
            }
            if (!(_q1133)) continue;
            _g1131 = v_j;
            break G1132;
          }
        }
        const v_room = _g1131;
        _g1156.length = 0;
        G1157: {
          _g1166.length = 0;
          G1167: {
            const _a1170 = v_S;
            for (let _i1171 = 0; _i1171 < _a1170.length; _i1171++) {
              const v_c = _a1170[_i1171];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1166.push(v_c);
            }
          }
          const _a1172 = _g1166;
          for (let _i1173 = 0; _i1173 < _a1172.length; _i1173++) {
            const v_c = _a1172[_i1173];
            if (!((v_R.includes(v_c)))) continue;
            _g1156.push(v_c);
          }
        }
        const v_Q = _g1156;
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

/** Its dearest read grows with the board as n. */
export function banded(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BandedBinding> | null): number {
  const _g1327: number[] = [];
  const _g1342: number[] = [];
  const _g1387: number[] = [];
  const _g1405: number[] = [];
  const _g1450: number[] = [];
  const _g1470: number[] = [];
  const _g1482: number[] = [];
  const _g1497: number[] = [];
  const facts = bandedFacts;
  let fired = 0;
  let changed = false;
  const _t1325 = (sp.w - 2);
  for (let v_k = 2; v_k <= _t1325; v_k++) {
    const _h1326 = (sp.w - v_k);
    const _h1339 = (v_k - 1);
    const _h1340 = (_h1339 * cl.stars);
    for (let v_dir = 0; v_dir <= 1; v_dir++) {
      const _h1333 = (1 - v_dir);
      for (let v_a = 0; v_a <= _h1326; v_a++) {
        const _h1334 = (v_a + v_k);
        _g1327.length = 0;
        G1328: {
          const _a1331 = sp.cells;
          for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
            const v_c = _a1331[_i1332];
            if (!(((v_a <= ((_h1333 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w)))) && (((_h1333 * ((v_c / sp.w) | 0)) + (v_dir * (v_c % sp.w))) < _h1334)))) continue;
            _g1327.push(v_c);
          }
        }
        const v_B = _g1327;
        let _g1335 = 0;
        G1336: {
          const _a1337 = v_B;
          for (let _i1338 = 0; _i1338 < _a1337.length; _i1338++) {
            const v_c = _a1337[_i1338];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1335++;
          }
        }
        L1341: {
          const v_n = ((cl.stars - _g1335) + _h1340);
          if (!((v_n > 0))) break L1341;
          _g1342.length = 0;
          G1343: {
            const _a1370 = cl.region.parts;
            for (let _i1371 = 0; _i1371 < _a1370.length; _i1371++) {
              const v_r = _a1370[_i1371];
              const _t1372 = cl.region.cells[v_r];
              let _g1373 = 0;
              G1374: {
                const _a1375 = _t1372;
                for (let _i1376 = 0; _i1376 < _a1375.length; _i1376++) {
                  const v_c = _a1375[_i1376];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1373++;
                }
              }
              let _c1395: boolean = ((cl.stars - _g1373) > 0);
              if (_c1395) {
                let _q1384 = true;
                Q1385: {
                  const _t1386 = cl.region.cells[v_r];
                  _g1387.length = 0;
                  G1388: {
                    const _a1391 = _t1386;
                    for (let _i1392 = 0; _i1392 < _a1391.length; _i1392++) {
                      const v_c = _a1391[_i1392];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1387.push(v_c);
                    }
                  }
                  const _a1393 = _g1387;
                  for (let _i1394 = 0; _i1394 < _a1393.length; _i1394++) {
                    const v_c = _a1393[_i1394];
                    if (!((v_B.includes(v_c)))) {
                      _q1384 = false;
                      break Q1385;
                    }
                  }
                }
                _c1395 = _q1384;
              }
              if (!(_c1395)) continue;
              _g1342.push(v_r);
            }
          }
          const v_I = _g1342;
          let _g1396 = 0;
          G1397: {
            const _a1398 = v_I;
            for (let _i1399 = 0; _i1399 < _a1398.length; _i1399++) {
              const v_r = _a1398[_i1399];
              const _t1400 = cl.region.cells[v_r];
              let _g1401 = 0;
              G1402: {
                const _a1403 = _t1400;
                for (let _i1404 = 0; _i1404 < _a1403.length; _i1404++) {
                  const v_c = _a1403[_i1404];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1401++;
                }
              }
              _g1396 += (cl.stars - _g1401);
            }
          }
          const v_mi = _g1396;
          _g1405.length = 0;
          G1406: {
            const _a1433 = cl.region.parts;
            for (let _i1434 = 0; _i1434 < _a1433.length; _i1434++) {
              const v_r = _a1433[_i1434];
              const _t1435 = cl.region.cells[v_r];
              let _g1436 = 0;
              G1437: {
                const _a1438 = _t1435;
                for (let _i1439 = 0; _i1439 < _a1438.length; _i1439++) {
                  const v_c = _a1438[_i1439];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1436++;
                }
              }
              let _c1458: boolean = ((cl.stars - _g1436) > 0);
              if (_c1458) {
                let _q1447 = false;
                Q1448: {
                  const _t1449 = cl.region.cells[v_r];
                  _g1450.length = 0;
                  G1451: {
                    const _a1454 = _t1449;
                    for (let _i1455 = 0; _i1455 < _a1454.length; _i1455++) {
                      const v_c = _a1454[_i1455];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1450.push(v_c);
                    }
                  }
                  const _a1456 = _g1450;
                  for (let _i1457 = 0; _i1457 < _a1456.length; _i1457++) {
                    const v_c = _a1456[_i1457];
                    if ((v_B.includes(v_c))) {
                      _q1447 = true;
                      break Q1448;
                    }
                  }
                }
                _c1458 = _q1447;
              }
              if (!(_c1458)) continue;
              _g1405.push(v_r);
            }
          }
          const v_R = _g1405;
          let _g1459 = 0;
          G1460: {
            const _a1461 = v_R;
            for (let _i1462 = 0; _i1462 < _a1461.length; _i1462++) {
              const v_r = _a1461[_i1462];
              const _t1463 = cl.region.cells[v_r];
              let _g1464 = 0;
              G1465: {
                const _a1466 = _t1463;
                for (let _i1467 = 0; _i1467 < _a1466.length; _i1467++) {
                  const v_c = _a1466[_i1467];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1464++;
                }
              }
              _g1459 += (cl.stars - _g1464);
            }
          }
          const v_mr = _g1459;
          let _c1478: boolean = (v_mi === v_n);
          if (_c1478) {
            let _q1468 = false;
            Q1469: {
              _g1470.length = 0;
              G1471: {
                const _a1474 = v_B;
                for (let _i1475 = 0; _i1475 < _a1474.length; _i1475++) {
                  const v_c = _a1474[_i1475];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g1470.push(v_c);
                }
              }
              const _a1476 = _g1470;
              for (let _i1477 = 0; _i1477 < _a1476.length; _i1477++) {
                const v_c = _a1476[_i1477];
                if (!(v_I.includes(cl.region.of[v_c]))) {
                  _q1468 = true;
                  break Q1469;
                }
              }
            }
            _c1478 = _q1468;
          }
          L1479: {
            const v_lines = _c1478;
            if (!(((v_mi >= v_n) || (v_mr <= v_n)))) break L1479;
            facts.length = 0;
            changed = false;
            let _c1491: boolean = ((v_mi <= v_n) && (v_mr >= v_n));
            if (_c1491) {
              let _c1490: boolean = !(v_lines);
              if (!_c1490) {
                let _q1480 = true;
                Q1481: {
                  _g1482.length = 0;
                  G1483: {
                    const _a1486 = v_B;
                    for (let _i1487 = 0; _i1487 < _a1486.length; _i1487++) {
                      const v_c = _a1486[_i1487];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g1482.push(v_c);
                    }
                  }
                  const _a1488 = _g1482;
                  for (let _i1489 = 0; _i1489 < _a1488.length; _i1489++) {
                    const v_c = _a1488[_i1489];
                    if (!(!(v_I.includes(cl.region.of[v_c])))) continue;
                    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                    if (!(true)) {
                      _q1480 = false;
                      break Q1481;
                    }
                  }
                }
                _c1490 = _q1480;
              }
              _c1491 = _c1490;
            }
            let _c1506: boolean = _c1491;
            if (_c1506) {
              let _c1505: boolean = (v_lines || (v_mr > v_n));
              if (!_c1505) {
                let _q1492 = true;
                Q1493: {
                  const _a1494 = v_R;
                  for (let _i1495 = 0; _i1495 < _a1494.length; _i1495++) {
                    const v_r = _a1494[_i1495];
                    const _t1496 = cl.region.cells[v_r];
                    _g1497.length = 0;
                    G1498: {
                      const _a1501 = _t1496;
                      for (let _i1502 = 0; _i1502 < _a1501.length; _i1502++) {
                        const v_c = _a1501[_i1502];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g1497.push(v_c);
                      }
                    }
                    const _a1503 = _g1497;
                    for (let _i1504 = 0; _i1504 < _a1503.length; _i1504++) {
                      const v_c = _a1503[_i1504];
                      if (!(!(v_B.includes(v_c)))) continue;
                      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                      if (!(true)) {
                        _q1492 = false;
                        break Q1493;
                      }
                    }
                  }
                }
                _c1505 = _q1492;
              }
              _c1506 = _c1505;
            }
            if (!(_c1506)) return -1;
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
  const _g1677: number[] = [];
  const _g1687: number[] = [];
  const _f1699 = new Int32Array(sp.cells.length).fill(-1);
  let _l1700: readonly number[] = [];
  const _s1701: number[] = [];
  const _f1727 = new Int32Array(sp.cells.length).fill(-1);
  let _l1728: readonly number[] = [];
  const _s1729: number[] = [];
  const _g1747: number[] = [];
  const _g1757: number[] = [];
  const facts = starvedLineFacts;
  let fired = 0;
  let changed = false;
  const _a1658 = sp.cells;
  for (let _i1659 = 0; _i1659 < _a1658.length; _i1659++) {
    const v_x = _a1658[_i1659];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1662 = sp.rowOf[v_x];
    const _h1663 = sp.colOf[v_x];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1660 = sp.lines;
    for (let _i1661 = 0; _i1661 < _a1660.length; _i1661++) {
      const v_L = _a1660[_i1661];
      let _c1668: boolean = ((v_L === _h1662) || (v_L === _h1663));
      if (!_c1668) {
        let _q1664 = false;
        Q1665: {
          const _a1666 = v_R;
          for (let _i1667 = 0; _i1667 < _a1666.length; _i1667++) {
            const v_p = _a1666[_i1667];
            if (((v_L === sp.rowOf[v_p]) || (v_L === sp.colOf[v_p]))) {
              _q1664 = true;
              break Q1665;
            }
          }
        }
        _c1668 = _q1664;
      }
      if (!(_c1668)) continue;
      const v_S = sp.lineCells[v_L];
      let _g1669 = 0;
      G1670: {
        const _a1671 = v_S;
        for (let _i1672 = 0; _i1672 < _a1671.length; _i1672++) {
          const v_c = _a1671[_i1672];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1669++;
        }
      }
      let _g1673 = 0;
      G1674: {
        const _a1675 = setOf(v_x);
        for (let _i1676 = 0; _i1676 < _a1675.length; _i1676++) {
          const v_c = _a1675[_i1676];
          if (!((v_S.includes(v_c)))) continue;
          _g1673++;
        }
      }
      const v_n = ((cl.stars - _g1669) - _g1673);
      _g1677.length = 0;
      G1678: {
        _g1687.length = 0;
        G1688: {
          const _a1691 = v_S;
          for (let _i1692 = 0; _i1692 < _a1691.length; _i1692++) {
            const v_c = _a1691[_i1692];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1687.push(v_c);
          }
        }
        const _a1693 = _g1687;
        for (let _i1694 = 0; _i1694 < _a1693.length; _i1694++) {
          const v_c = _a1693[_i1694];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1677.push(v_c);
        }
      }
      L1695: {
        const v_E = _g1677;
        const _h1707 = v_E.length;
        const _h1719 = (2 * _h1707);
        const _h1720 = (_h1719 - v_n);
        let _c1721: boolean = (v_n > 0);
        if (_c1721) {
          let _q1696 = false;
          Q1697: {
            const _a1698 = v_E;
            const _t1708 = ((2 * _h1707) - v_n);
            const _lo1709 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1710 = 31 - Math.clz32(b.domain);
            for (const _e1702 of _l1700) _f1699[_e1702] = -1;
            _l1700 = _a1698;
            let _i1704 = 0;
            _s1701[0] = 0;
            let _o1712 = _a1698.length === 0;
            for (;;) {
              if (_a1698.length === 0) {
                if (!_o1712) break;
                _o1712 = false;
              }
              while (_a1698.length > 0 && _i1704 >= 0) {
                const _e1702 = _a1698[_i1704];
                if (_s1701[_i1704] > 0) _f1699[_e1702] = -1;
                let _r1711 = b.domain & ~((2 << _s1701[_i1704]) - 1);
                let _d1703 = 0;
                V1706: for (; _r1711 !== 0; _r1711 &= _r1711 - 1) {
                  _d1703 = 31 - Math.clz32(_r1711 & -_r1711);
                  _f1699[_e1702] = _d1703;
                  {
                    let _t1713 = _d1703;
                    for (let _j1705 = 0; _j1705 < _i1704; _j1705++) _t1713 += _f1699[_a1698[_j1705]];
                    if (_t1713 + (_a1698.length - _i1704 - 1) * _lo1709 > _t1708) continue;
                    if (_t1713 + (_a1698.length - _i1704 - 1) * _hi1710 < _t1708) continue;
                  }
                  for (let _j1705 = 0; _j1705 < _i1704; _j1705++) {
                    const _y1714 = _a1698[_j1705];
                    if (!(!((((_f1699[_e1702] === 1) && (_f1699[_y1714] === 1)) && (sp.adj8[_e1702].includes(_y1714)))))) continue V1706;
                  }
                  break;
                }
                if (_r1711 === 0) {
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
              let _g1715 = 0;
              G1716: {
                const _a1717 = v_E;
                for (let _i1718 = 0; _i1718 < _a1717.length; _i1718++) {
                  const v_x = _a1717[_i1718];
                  _g1715 += _f1699[v_x];
                }
              }
              if (!((_g1715 === _h1720))) continue;
              if (true) {
                _q1696 = true;
                break Q1697;
              }
            }
          }
          _c1721 = !(_q1696);
        }
        if (!(_c1721)) break L1695;
        let _g1722 = -1;
        G1723: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1746 = (_h1719 - v_j);
            let _q1724 = false;
            Q1725: {
              const _a1726 = v_E;
              const _t1735 = (_h1719 - v_j);
              const _lo1736 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1737 = 31 - Math.clz32(b.domain);
              for (const _e1730 of _l1728) _f1727[_e1730] = -1;
              _l1728 = _a1726;
              let _i1732 = 0;
              _s1729[0] = 0;
              let _o1739 = _a1726.length === 0;
              for (;;) {
                if (_a1726.length === 0) {
                  if (!_o1739) break;
                  _o1739 = false;
                }
                while (_a1726.length > 0 && _i1732 >= 0) {
                  const _e1730 = _a1726[_i1732];
                  if (_s1729[_i1732] > 0) _f1727[_e1730] = -1;
                  let _r1738 = b.domain & ~((2 << _s1729[_i1732]) - 1);
                  let _d1731 = 0;
                  V1734: for (; _r1738 !== 0; _r1738 &= _r1738 - 1) {
                    _d1731 = 31 - Math.clz32(_r1738 & -_r1738);
                    _f1727[_e1730] = _d1731;
                    {
                      let _t1740 = _d1731;
                      for (let _j1733 = 0; _j1733 < _i1732; _j1733++) _t1740 += _f1727[_a1726[_j1733]];
                      if (_t1740 + (_a1726.length - _i1732 - 1) * _lo1736 > _t1735) continue;
                      if (_t1740 + (_a1726.length - _i1732 - 1) * _hi1737 < _t1735) continue;
                    }
                    for (let _j1733 = 0; _j1733 < _i1732; _j1733++) {
                      const _y1741 = _a1726[_j1733];
                      if (!(!((((_f1727[_e1730] === 1) && (_f1727[_y1741] === 1)) && (sp.adj8[_e1730].includes(_y1741)))))) continue V1734;
                    }
                    break;
                  }
                  if (_r1738 === 0) {
                    _s1729[_i1732] = 0;
                    _i1732--;
                    continue;
                  }
                  _s1729[_i1732] = _d1731;
                  if (_i1732 === _a1726.length - 1) break;
                  _i1732++;
                  _s1729[_i1732] = 0;
                }
                if (_i1732 < 0) break;
                let _g1742 = 0;
                G1743: {
                  const _a1744 = v_E;
                  for (let _i1745 = 0; _i1745 < _a1744.length; _i1745++) {
                    const v_x = _a1744[_i1745];
                    _g1742 += _f1727[v_x];
                  }
                }
                if (!((_g1742 === _h1746))) continue;
                if (true) {
                  _q1724 = true;
                  break Q1725;
                }
              }
            }
            if (!(_q1724)) continue;
            _g1722 = v_j;
            break G1723;
          }
        }
        const v_room = _g1722;
        _g1747.length = 0;
        G1748: {
          _g1757.length = 0;
          G1758: {
            const _a1761 = v_S;
            for (let _i1762 = 0; _i1762 < _a1761.length; _i1762++) {
              const v_c = _a1761[_i1762];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1757.push(v_c);
            }
          }
          const _a1763 = _g1757;
          for (let _i1764 = 0; _i1764 < _a1763.length; _i1764++) {
            const v_c = _a1763[_i1764];
            if (!((v_R.includes(v_c)))) continue;
            _g1747.push(v_c);
          }
        }
        const v_Q = _g1747;
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
  const _g1884: number[] = [];
  const _g1894: number[] = [];
  const _f1906 = new Int32Array(sp.cells.length).fill(-1);
  let _l1907: readonly number[] = [];
  const _s1908: number[] = [];
  const _f1934 = new Int32Array(sp.cells.length).fill(-1);
  let _l1935: readonly number[] = [];
  const _s1936: number[] = [];
  const _g1954: number[] = [];
  const _g1964: number[] = [];
  const facts = starvedRegionFacts;
  let fired = 0;
  let changed = false;
  const _a1866 = sp.cells;
  for (let _i1867 = 0; _i1867 < _a1866.length; _i1867++) {
    const v_x = _a1866[_i1867];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    const _h1870 = cl.region.of[v_x];
    const v_R = ruled(b, sp, cl, v_x);
    const _a1868 = cl.region.parts;
    for (let _i1869 = 0; _i1869 < _a1868.length; _i1869++) {
      const v_g = _a1868[_i1869];
      let _c1875: boolean = (v_g === _h1870);
      if (!_c1875) {
        let _q1871 = false;
        Q1872: {
          const _a1873 = v_R;
          for (let _i1874 = 0; _i1874 < _a1873.length; _i1874++) {
            const v_p = _a1873[_i1874];
            if ((cl.region.of[v_p] === v_g)) {
              _q1871 = true;
              break Q1872;
            }
          }
        }
        _c1875 = _q1871;
      }
      if (!(_c1875)) continue;
      const v_S = cl.region.cells[v_g];
      let _g1876 = 0;
      G1877: {
        const _a1878 = v_S;
        for (let _i1879 = 0; _i1879 < _a1878.length; _i1879++) {
          const v_c = _a1878[_i1879];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g1876++;
        }
      }
      let _g1880 = 0;
      G1881: {
        const _a1882 = setOf(v_x);
        for (let _i1883 = 0; _i1883 < _a1882.length; _i1883++) {
          const v_c = _a1882[_i1883];
          if (!((v_S.includes(v_c)))) continue;
          _g1880++;
        }
      }
      const v_n = ((cl.stars - _g1876) - _g1880);
      _g1884.length = 0;
      G1885: {
        _g1894.length = 0;
        G1895: {
          const _a1898 = v_S;
          for (let _i1899 = 0; _i1899 < _a1898.length; _i1899++) {
            const v_c = _a1898[_i1899];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1894.push(v_c);
          }
        }
        const _a1900 = _g1894;
        for (let _i1901 = 0; _i1901 < _a1900.length; _i1901++) {
          const v_c = _a1900[_i1901];
          if (!(((v_c !== v_x) && !(v_R.includes(v_c))))) continue;
          _g1884.push(v_c);
        }
      }
      L1902: {
        const v_E = _g1884;
        const _h1914 = v_E.length;
        const _h1926 = (2 * _h1914);
        const _h1927 = (_h1926 - v_n);
        let _c1928: boolean = (v_n > 0);
        if (_c1928) {
          let _q1903 = false;
          Q1904: {
            const _a1905 = v_E;
            const _t1915 = ((2 * _h1914) - v_n);
            const _lo1916 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi1917 = 31 - Math.clz32(b.domain);
            for (const _e1909 of _l1907) _f1906[_e1909] = -1;
            _l1907 = _a1905;
            let _i1911 = 0;
            _s1908[0] = 0;
            let _o1919 = _a1905.length === 0;
            for (;;) {
              if (_a1905.length === 0) {
                if (!_o1919) break;
                _o1919 = false;
              }
              while (_a1905.length > 0 && _i1911 >= 0) {
                const _e1909 = _a1905[_i1911];
                if (_s1908[_i1911] > 0) _f1906[_e1909] = -1;
                let _r1918 = b.domain & ~((2 << _s1908[_i1911]) - 1);
                let _d1910 = 0;
                V1913: for (; _r1918 !== 0; _r1918 &= _r1918 - 1) {
                  _d1910 = 31 - Math.clz32(_r1918 & -_r1918);
                  _f1906[_e1909] = _d1910;
                  {
                    let _t1920 = _d1910;
                    for (let _j1912 = 0; _j1912 < _i1911; _j1912++) _t1920 += _f1906[_a1905[_j1912]];
                    if (_t1920 + (_a1905.length - _i1911 - 1) * _lo1916 > _t1915) continue;
                    if (_t1920 + (_a1905.length - _i1911 - 1) * _hi1917 < _t1915) continue;
                  }
                  for (let _j1912 = 0; _j1912 < _i1911; _j1912++) {
                    const _y1921 = _a1905[_j1912];
                    if (!(!((((_f1906[_e1909] === 1) && (_f1906[_y1921] === 1)) && (sp.adj8[_e1909].includes(_y1921)))))) continue V1913;
                  }
                  break;
                }
                if (_r1918 === 0) {
                  _s1908[_i1911] = 0;
                  _i1911--;
                  continue;
                }
                _s1908[_i1911] = _d1910;
                if (_i1911 === _a1905.length - 1) break;
                _i1911++;
                _s1908[_i1911] = 0;
              }
              if (_i1911 < 0) break;
              let _g1922 = 0;
              G1923: {
                const _a1924 = v_E;
                for (let _i1925 = 0; _i1925 < _a1924.length; _i1925++) {
                  const v_x = _a1924[_i1925];
                  _g1922 += _f1906[v_x];
                }
              }
              if (!((_g1922 === _h1927))) continue;
              if (true) {
                _q1903 = true;
                break Q1904;
              }
            }
          }
          _c1928 = !(_q1903);
        }
        if (!(_c1928)) break L1902;
        let _g1929 = -1;
        G1930: {
          for (let v_j = v_n; v_j >= 0; v_j--) {
            const _h1953 = (_h1926 - v_j);
            let _q1931 = false;
            Q1932: {
              const _a1933 = v_E;
              const _t1942 = (_h1926 - v_j);
              const _lo1943 = 31 - Math.clz32(b.domain & -b.domain);
              const _hi1944 = 31 - Math.clz32(b.domain);
              for (const _e1937 of _l1935) _f1934[_e1937] = -1;
              _l1935 = _a1933;
              let _i1939 = 0;
              _s1936[0] = 0;
              let _o1946 = _a1933.length === 0;
              for (;;) {
                if (_a1933.length === 0) {
                  if (!_o1946) break;
                  _o1946 = false;
                }
                while (_a1933.length > 0 && _i1939 >= 0) {
                  const _e1937 = _a1933[_i1939];
                  if (_s1936[_i1939] > 0) _f1934[_e1937] = -1;
                  let _r1945 = b.domain & ~((2 << _s1936[_i1939]) - 1);
                  let _d1938 = 0;
                  V1941: for (; _r1945 !== 0; _r1945 &= _r1945 - 1) {
                    _d1938 = 31 - Math.clz32(_r1945 & -_r1945);
                    _f1934[_e1937] = _d1938;
                    {
                      let _t1947 = _d1938;
                      for (let _j1940 = 0; _j1940 < _i1939; _j1940++) _t1947 += _f1934[_a1933[_j1940]];
                      if (_t1947 + (_a1933.length - _i1939 - 1) * _lo1943 > _t1942) continue;
                      if (_t1947 + (_a1933.length - _i1939 - 1) * _hi1944 < _t1942) continue;
                    }
                    for (let _j1940 = 0; _j1940 < _i1939; _j1940++) {
                      const _y1948 = _a1933[_j1940];
                      if (!(!((((_f1934[_e1937] === 1) && (_f1934[_y1948] === 1)) && (sp.adj8[_e1937].includes(_y1948)))))) continue V1941;
                    }
                    break;
                  }
                  if (_r1945 === 0) {
                    _s1936[_i1939] = 0;
                    _i1939--;
                    continue;
                  }
                  _s1936[_i1939] = _d1938;
                  if (_i1939 === _a1933.length - 1) break;
                  _i1939++;
                  _s1936[_i1939] = 0;
                }
                if (_i1939 < 0) break;
                let _g1949 = 0;
                G1950: {
                  const _a1951 = v_E;
                  for (let _i1952 = 0; _i1952 < _a1951.length; _i1952++) {
                    const v_x = _a1951[_i1952];
                    _g1949 += _f1934[v_x];
                  }
                }
                if (!((_g1949 === _h1953))) continue;
                if (true) {
                  _q1931 = true;
                  break Q1932;
                }
              }
            }
            if (!(_q1931)) continue;
            _g1929 = v_j;
            break G1930;
          }
        }
        const v_room = _g1929;
        _g1954.length = 0;
        G1955: {
          _g1964.length = 0;
          G1965: {
            const _a1968 = v_S;
            for (let _i1969 = 0; _i1969 < _a1968.length; _i1969++) {
              const v_c = _a1968[_i1969];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g1964.push(v_c);
            }
          }
          const _a1970 = _g1964;
          for (let _i1971 = 0; _i1971 < _a1970.length; _i1971++) {
            const v_c = _a1970[_i1971];
            if (!((v_R.includes(v_c)))) continue;
            _g1954.push(v_c);
          }
        }
        const v_Q = _g1954;
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

const ruledKept = keptStore<readonly number[]>();

/** `ruled(x)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ruled(b: Marks, sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  const _kept: Kept<readonly number[]> = ruledKept.marks(b);
  if (_kept[v_x] !== undefined) return _kept[v_x];
  const _g1509: number[] = [];
  G1510: {
    const _a1535 = sp.cells;
    for (let _i1536 = 0; _i1536 < _a1535.length; _i1536++) {
      const v_p = _a1535[_i1536];
      let _c1558: boolean = (!((b.grid[v_p] !== 0)) && (v_p !== v_x));
      if (_c1558) {
        let _c1543: boolean = (sp.adj8[v_x].includes(v_p));
        if (!_c1543) {
          let _c1542: boolean = (sp.rowOf[v_p] === sp.rowOf[v_x]);
          if (_c1542) {
            const _t1537 = sp.lineCells[sp.rowOf[v_x]];
            let _g1538 = 0;
            G1539: {
              const _a1540 = _t1537;
              for (let _i1541 = 0; _i1541 < _a1540.length; _i1541++) {
                const v_c = _a1540[_i1541];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1538++;
              }
            }
            _c1542 = ((cl.stars - _g1538) === 1);
          }
          _c1543 = _c1542;
        }
        let _c1550: boolean = _c1543;
        if (!_c1550) {
          let _c1549: boolean = (sp.colOf[v_p] === sp.colOf[v_x]);
          if (_c1549) {
            const _t1544 = sp.lineCells[sp.colOf[v_x]];
            let _g1545 = 0;
            G1546: {
              const _a1547 = _t1544;
              for (let _i1548 = 0; _i1548 < _a1547.length; _i1548++) {
                const v_c = _a1547[_i1548];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1545++;
              }
            }
            _c1549 = ((cl.stars - _g1545) === 1);
          }
          _c1550 = _c1549;
        }
        let _c1557: boolean = _c1550;
        if (!_c1557) {
          let _c1556: boolean = (cl.region.of[v_p] === cl.region.of[v_x]);
          if (_c1556) {
            const _t1551 = cl.region.cells[cl.region.of[v_x]];
            let _g1552 = 0;
            G1553: {
              const _a1554 = _t1551;
              for (let _i1555 = 0; _i1555 < _a1554.length; _i1555++) {
                const v_c = _a1554[_i1555];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1552++;
              }
            }
            _c1556 = ((cl.stars - _g1552) === 1);
          }
          _c1557 = _c1556;
        }
        _c1558 = _c1557;
      }
      if (!(_c1558)) continue;
      _g1509.push(v_p);
    }
  }
  const _made = _g1509;
  _kept[v_x] = _made;
  return _made;
}
