// Compiled by `npm run describe` from src/games/unruly/unruly.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, rangeMask, setOf } from "../../engine/describe-runtime.ts";

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "threes" | "lastGap" | "quota" | "lastOne" | "unique";

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
  { id: "threes", tier: 0 },
  { id: "lastGap", tier: 0 },
  { id: "quota", tier: 1 },
  { id: "unique", tier: 1, variation: "unique" },
  { id: "lastOne", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, variations: readonly string[]): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q210 = true;
  Q211: {
    const _a212 = sp.lines;
    for (let _i213 = 0; _i213 < _a212.length; _i213++) {
      const v_L = _a212[_i213];
      const _t214 = (sp.lineCells[v_L].length - 3);
      for (let v_i = 0; v_i <= _t214; v_i++) {
        const _t215 = (v_i + 1);
        let _c218: boolean = ((g[(sp.lineCells[v_L][v_i] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t215] ?? -1)] || -1));
        if (_c218) {
          const _t216 = (v_i + 1);
          const _t217 = (v_i + 2);
          _c218 = ((g[(sp.lineCells[v_L][_t216] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t217] ?? -1)] || -1));
        }
        if (!(!(_c218))) {
          _q210 = false;
          break Q211;
        }
      }
    }
  }
  if (!(_q210)) return false;
  let _q219 = true;
  Q220: {
    const _a221 = sp.lines;
    for (let _i222 = 0; _i222 < _a221.length; _i222++) {
      const v_L = _a221[_i222];
      for (let _m223 = _domain; _m223 !== 0; _m223 &= _m223 - 1) {
        const v_d = 31 - Math.clz32(_m223 & -_m223);
        let _g224 = 0;
        G225: {
          const _a226 = sp.lineCells[v_L];
          for (let _i227 = 0; _i227 < _a226.length; _i227++) {
            const v_c = _a226[_i227];
            const _h228 = (g[v_c] || -1);
            if (!((_h228 === v_d))) continue;
            _g224++;
          }
        }
        if (!(((2 * _g224) === sp.lineCells[v_L].length))) {
          _q219 = false;
          break Q220;
        }
      }
    }
  }
  if (!(_q219)) return false;
  if (variations.includes("unique")) {
    let _q229 = true;
    Q230: {
      const _a231 = sp.lines;
      for (let _i232 = 0; _i232 < _a231.length; _i232++) {
        const v_A = _a231[_i232];
        const _h235 = (sp.rows.includes(v_A));
        const _a233 = sp.lines;
        for (let _i234 = 0; _i234 < _a233.length; _i234++) {
          const v_B = _a233[_i234];
          if (!(((v_B !== v_A) && (_h235 === (sp.rows.includes(v_B)))))) continue;
          let _q236 = false;
          Q237: {
            const _t238 = (sp.lineCells[v_A].length - 1);
            for (let v_i = 0; v_i <= _t238; v_i++) {
              if (((g[(sp.lineCells[v_A][v_i] ?? -1)] || -1) !== (g[(sp.lineCells[v_B][v_i] ?? -1)] || -1))) {
                _q236 = true;
                break Q237;
              }
            }
          }
          if (!(_q236)) {
            _q229 = false;
            break Q230;
          }
        }
      }
    }
    if (!(_q229)) return false;
  }
  return true;
}

export interface ThreesBinding {
  L: number;
  i: number;
  W: readonly number[];
  x: number;
  d: number;
}

const threesFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function threes(b: Marks, sp: GridSpace, fire: Fire<ThreesBinding> | null): number {
  const facts = threesFacts;
  let fired = 0;
  let changed = false;
  const _a13 = sp.lines;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_L = _a13[_i14];
    const _t15 = (sp.lineCells[v_L].length - 3);
    for (let v_i = 0; v_i <= _t15; v_i++) {
      const _t16 = (v_i + 1);
      const _t17 = (v_i + 2);
      const v_W = setOf((sp.lineCells[v_L][v_i] ?? -1), (sp.lineCells[v_L][_t16] ?? -1), (sp.lineCells[v_L][_t17] ?? -1));
      const _a18 = v_W;
      R3:
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_x = _a18[_i19];
        const _m16_0 = b.made[0];
        if (!(!((b.grid[v_x] !== 0)))) continue;
        for (let _m20 = b.domain; _m20 !== 0; _m20 &= _m20 - 1) {
          const v_d = 31 - Math.clz32(_m20 & -_m20);
          let _q21 = true;
          Q22: {
            const _a23 = v_W;
            for (let _i24 = 0; _i24 < _a23.length; _i24++) {
              const v_c = _a23[_i24];
              if (!((v_c !== v_x))) continue;
              if (!(((b.grid[v_c] || -1) === v_d))) {
                _q21 = false;
                break Q22;
              }
            }
          }
          if (!(_q21)) continue;
          if (b.made[0] !== _m16_0) {
            if (!(!((b.grid[v_x] !== 0)))) { continue R3; }
          }
          facts.length = 0;
          changed = false;
          const _t25 = (3 - v_d);
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t25); changed = true; } else facts.push(PLACE, v_x, _t25); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, i: v_i, W: v_W.slice(), x: v_x, d: v_d }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LastGapBinding {
  L: number;
  n: number;
  d: number;
}

const lastGapFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function lastGap(b: Marks, sp: GridSpace, fire: Fire<LastGapBinding> | null): number {
  const facts = lastGapFacts;
  let fired = 0;
  let changed = false;
  const _a38 = sp.lines;
  for (let _i39 = 0; _i39 < _a38.length; _i39++) {
    const v_L = _a38[_i39];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    const _h51 = (v_n - 1);
    for (let _m40 = b.domain; _m40 !== 0; _m40 &= _m40 - 1) {
      const v_d = 31 - Math.clz32(_m40 & -_m40);
      const _h49 = (3 - v_d);
      const _h50 = _h49;
      let _g41 = 0;
      G42: {
        const _a43 = sp.lineCells[v_L];
        for (let _i44 = 0; _i44 < _a43.length; _i44++) {
          const v_c = _a43[_i44];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g41++;
        }
      }
      let _c52: boolean = (_g41 === v_n);
      if (_c52) {
        let _g45 = 0;
        G46: {
          const _a47 = sp.lineCells[v_L];
          for (let _i48 = 0; _i48 < _a47.length; _i48++) {
            const v_c = _a47[_i48];
            if (!(((b.grid[v_c] || -1) === _h50))) continue;
            _g45++;
          }
        }
        _c52 = (_g45 === _h51);
      }
      if (!(_c52)) continue;
      facts.length = 0;
      changed = false;
      let _q53 = true;
      Q54: {
        const _a55 = sp.lineCells[v_L];
        for (let _i56 = 0; _i56 < _a55.length; _i56++) {
          const v_c = _a55[_i56];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h50); changed = true; } else facts.push(PLACE, v_c, _h50); }
          if (!(true)) {
            _q53 = false;
            break Q54;
          }
        }
      }
      if (!(_q53)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, n: v_n, d: v_d }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface QuotaBinding {
  L: number;
  n: number;
  d: number;
}

const quotaFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function quota(b: Marks, sp: GridSpace, fire: Fire<QuotaBinding> | null): number {
  const facts = quotaFacts;
  let fired = 0;
  let changed = false;
  const _a69 = sp.lines;
  for (let _i70 = 0; _i70 < _a69.length; _i70++) {
    const v_L = _a69[_i70];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    for (let _m71 = b.domain; _m71 !== 0; _m71 &= _m71 - 1) {
      const v_d = 31 - Math.clz32(_m71 & -_m71);
      const _h80 = (3 - v_d);
      const _h81 = _h80;
      let _g72 = 0;
      G73: {
        const _a74 = sp.lineCells[v_L];
        for (let _i75 = 0; _i75 < _a74.length; _i75++) {
          const v_c = _a74[_i75];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g72++;
        }
      }
      let _c82: boolean = (_g72 === v_n);
      if (_c82) {
        let _g76 = 0;
        G77: {
          const _a78 = sp.lineCells[v_L];
          for (let _i79 = 0; _i79 < _a78.length; _i79++) {
            const v_c = _a78[_i79];
            if (!(((b.grid[v_c] || -1) === _h81))) continue;
            _g76++;
          }
        }
        _c82 = (_g76 < v_n);
      }
      if (!(_c82)) continue;
      facts.length = 0;
      changed = false;
      let _q83 = true;
      Q84: {
        const _a85 = sp.lineCells[v_L];
        for (let _i86 = 0; _i86 < _a85.length; _i86++) {
          const v_c = _a85[_i86];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h81); changed = true; } else facts.push(PLACE, v_c, _h81); }
          if (!(true)) {
            _q83 = false;
            break Q84;
          }
        }
      }
      if (!(_q83)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L, n: v_n, d: v_d }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface LastOneBinding {
  L: number;
  n: number;
  d: number;
  i: number;
  W: readonly number[];
}

const lastOneFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function lastOne(b: Marks, sp: GridSpace, fire: Fire<LastOneBinding> | null): number {
  const facts = lastOneFacts;
  let fired = 0;
  let changed = false;
  const _a112 = sp.lines;
  for (let _i113 = 0; _i113 < _a112.length; _i113++) {
    const v_L = _a112[_i113];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    const _h119 = (v_n - 1);
    const _h126 = (v_n - 2);
    R2:
    for (let _m114 = b.domain; _m114 !== 0; _m114 &= _m114 - 1) {
      const v_d = 31 - Math.clz32(_m114 & -_m114);
      const _m82_0 = b.made[0];
      const _h124 = (3 - v_d);
      const _h125 = _h124;
      let _g115 = 0;
      G116: {
        const _a117 = sp.lineCells[v_L];
        for (let _i118 = 0; _i118 < _a117.length; _i118++) {
          const v_c = _a117[_i118];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g115++;
        }
      }
      let _c127: boolean = (_g115 === _h119);
      if (_c127) {
        let _g120 = 0;
        G121: {
          const _a122 = sp.lineCells[v_L];
          for (let _i123 = 0; _i123 < _a122.length; _i123++) {
            const v_c = _a122[_i123];
            if (!(((b.grid[v_c] || -1) === _h125))) continue;
            _g120++;
          }
        }
        _c127 = (_g120 <= _h126);
      }
      if (!(_c127)) continue;
      const _t128 = (sp.lineCells[v_L].length - 3);
      for (let v_i = 0; v_i <= _t128; v_i++) {
        const _t129 = (v_i + 1);
        const _t130 = (v_i + 2);
        L131: {
          const v_W = setOf((sp.lineCells[v_L][v_i] ?? -1), (sp.lineCells[v_L][_t129] ?? -1), (sp.lineCells[v_L][_t130] ?? -1));
          let _q132 = true;
          Q133: {
            const _a134 = v_W;
            for (let _i135 = 0; _i135 < _a134.length; _i135++) {
              const v_c = _a134[_i135];
              if (!(((b.grid[v_c] || -1) !== v_d))) {
                _q132 = false;
                break Q133;
              }
            }
          }
          let _c140: boolean = _q132;
          if (_c140) {
            let _g136 = 0;
            G137: {
              const _a138 = v_W;
              for (let _i139 = 0; _i139 < _a138.length; _i139++) {
                const v_c = _a138[_i139];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g136++;
              }
            }
            _c140 = (_g136 >= 2);
          }
          if (!(_c140)) break L131;
          if (b.made[0] !== _m82_0) {
            let _g141 = 0;
            G142: {
              const _a143 = sp.lineCells[v_L];
              for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                const v_c = _a143[_i144];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g141++;
              }
            }
            let _c149: boolean = (_g141 === (v_n - 1));
            if (_c149) {
              let _g145 = 0;
              G146: {
                const _a147 = sp.lineCells[v_L];
                for (let _i148 = 0; _i148 < _a147.length; _i148++) {
                  const v_c = _a147[_i148];
                  if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
                  _g145++;
                }
              }
              _c149 = (_g145 <= (v_n - 2));
            }
            if (!(_c149)) { continue R2; }
          }
          facts.length = 0;
          changed = false;
          let _q150 = true;
          Q151: {
            const _a152 = sp.lineCells[v_L];
            for (let _i153 = 0; _i153 < _a152.length; _i153++) {
              const v_c = _a152[_i153];
              if (!((!((b.grid[v_c] !== 0)) && !(v_W.includes(v_c))))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h125); changed = true; } else facts.push(PLACE, v_c, _h125); }
              if (!(true)) {
                _q150 = false;
                break Q151;
              }
            }
          }
          if (!(_q150)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, n: v_n, d: v_d, i: v_i, W: v_W.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface UniqueBinding {
  A: number;
  n: number;
  d: number;
  B: number;
  j: number;
}

const uniqueFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function unique(b: Marks, sp: GridSpace, fire: Fire<UniqueBinding> | null): number {
  const facts = uniqueFacts;
  let fired = 0;
  let changed = false;
  const _a173 = sp.lines;
  for (let _i174 = 0; _i174 < _a173.length; _i174++) {
    const v_A = _a173[_i174];
    const _h182 = (sp.rows.includes(v_A));
    const v_n = Math.trunc(sp.lineCells[v_A].length / 2);
    const _h187 = (v_n - 1);
    R2:
    for (let _m175 = b.domain; _m175 !== 0; _m175 &= _m175 - 1) {
      const v_d = 31 - Math.clz32(_m175 & -_m175);
      const _m116_0 = b.made[0];
      let _g176 = 0;
      G177: {
        const _a178 = sp.lineCells[v_A];
        for (let _i179 = 0; _i179 < _a178.length; _i179++) {
          const v_c = _a178[_i179];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g176++;
        }
      }
      if (!((_g176 === v_n))) continue;
      const _h207 = (3 - v_d);
      const _h208 = _h207;
      const _a180 = sp.lines;
      R3:
      for (let _i181 = 0; _i181 < _a180.length; _i181++) {
        const v_B = _a180[_i181];
        let _c188: boolean = ((v_B !== v_A) && (_h182 === (sp.rows.includes(v_B))));
        if (_c188) {
          let _g183 = 0;
          G184: {
            const _a185 = sp.lineCells[v_B];
            for (let _i186 = 0; _i186 < _a185.length; _i186++) {
              const v_c = _a185[_i186];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g183++;
            }
          }
          _c188 = (_g183 === _h187);
        }
        let _c192: boolean = _c188;
        if (_c192) {
          let _q189 = true;
          Q190: {
            const _t191 = (sp.lineCells[v_A].length - 1);
            for (let v_j = 0; v_j <= _t191; v_j++) {
              if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
              if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                _q189 = false;
                break Q190;
              }
            }
          }
          _c192 = _q189;
        }
        if (!(_c192)) continue;
        const _t193 = (sp.lineCells[v_A].length - 1);
        for (let v_j = 0; v_j <= _t193; v_j++) {
          if (!((((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d) && !((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] !== 0))))) continue;
          if (b.made[0] !== _m116_0) {
            let _g194 = 0;
            G195: {
              const _a196 = sp.lineCells[v_A];
              for (let _i197 = 0; _i197 < _a196.length; _i197++) {
                const v_c = _a196[_i197];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g194++;
              }
            }
            if (!((_g194 === v_n))) { continue R2; }
            let _c202: boolean = ((v_B !== v_A) && ((sp.rows.includes(v_A)) === (sp.rows.includes(v_B))));
            if (_c202) {
              let _g198 = 0;
              G199: {
                const _a200 = sp.lineCells[v_B];
                for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                  const v_c = _a200[_i201];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g198++;
                }
              }
              _c202 = (_g198 === (v_n - 1));
            }
            let _c206: boolean = _c202;
            if (_c206) {
              let _q203 = true;
              Q204: {
                const _t205 = (sp.lineCells[v_A].length - 1);
                for (let v_j = 0; v_j <= _t205; v_j++) {
                  if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
                  if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                    _q203 = false;
                    break Q204;
                  }
                }
              }
              _c206 = _q203;
            }
            if (!(_c206)) { continue R3; }
          }
          facts.length = 0;
          changed = false;
          const _t209 = (sp.lineCells[v_B][v_j] ?? -1);
          if (!(b.grid[_t209] !== 0)) { if (fire === null) { b.placeAt(_t209, _h208); changed = true; } else facts.push(PLACE, _t209, _h208); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ A: v_A, n: v_n, d: v_d, B: v_B, j: v_j }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}
