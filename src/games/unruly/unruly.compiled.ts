// Compiled by `npm run describe` from src/games/unruly/unruly.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, PLACE, freshBinding, rangeMask, sameSet, setOf, staleChecking } from "../../engine/describe-runtime.ts";

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
  let _q1 = true;
  Q2: {
    const _a3 = sp.lines;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_L = _a3[_i4];
      const _t5 = (sp.lineCells[v_L].length - 3);
      for (let v_i = 0; v_i <= _t5; v_i++) {
        const _t6 = (v_i + 1);
        let _c9: boolean = ((g[(sp.lineCells[v_L][v_i] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t6] ?? -1)] || -1));
        if (_c9) {
          const _t7 = (v_i + 1);
          const _t8 = (v_i + 2);
          _c9 = ((g[(sp.lineCells[v_L][_t7] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t8] ?? -1)] || -1));
        }
        if (!(!(_c9))) {
          _q1 = false;
          break Q2;
        }
      }
    }
  }
  if (!(_q1)) return false;
  let _q10 = true;
  Q11: {
    const _a12 = sp.lines;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_L = _a12[_i13];
      for (let _m14 = _domain; _m14 !== 0; _m14 &= _m14 - 1) {
        const v_d = 31 - Math.clz32(_m14 & -_m14);
        let _g15 = 0;
        G16: {
          const _a17 = sp.lineCells[v_L];
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_c = _a17[_i18];
            const _h19 = (g[v_c] || -1);
            if (!((_h19 === v_d))) continue;
            _g15++;
          }
        }
        if (!(((2 * _g15) === sp.lineCells[v_L].length))) {
          _q10 = false;
          break Q11;
        }
      }
    }
  }
  if (!(_q10)) return false;
  if (variations.includes("unique")) {
    let _q20 = true;
    Q21: {
      const _a22 = sp.lines;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_A = _a22[_i23];
        const _h26 = (sp.rows.includes(v_A));
        const _a24 = sp.lines;
        for (let _i25 = 0; _i25 < _a24.length; _i25++) {
          const v_B = _a24[_i25];
          if (!(((v_B !== v_A) && (_h26 === (sp.rows.includes(v_B)))))) continue;
          let _q27 = false;
          Q28: {
            const _t29 = (sp.lineCells[v_A].length - 1);
            for (let v_i = 0; v_i <= _t29; v_i++) {
              if (((g[(sp.lineCells[v_A][v_i] ?? -1)] || -1) !== (g[(sp.lineCells[v_B][v_i] ?? -1)] || -1))) {
                _q27 = true;
                break Q28;
              }
            }
          }
          if (!(_q27)) {
            _q20 = false;
            break Q21;
          }
        }
      }
    }
    if (!(_q20)) return false;
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
        const _m32_0 = b.made[0];
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
          if (b.made[0] !== _m32_0) {
            if (!(!((b.grid[v_x] !== 0)))) { continue R3; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _t25 = (v_i + 1);
            const _t26 = (v_i + 2);
            let _q27 = true;
            Q28: {
              const _a29 = v_W;
              for (let _i30 = 0; _i30 < _a29.length; _i30++) {
                const v_c = _a29[_i30];
                if (!((v_c !== v_x))) continue;
                if (!(((b.grid[v_c] || -1) === v_d))) {
                  _q27 = false;
                  break Q28;
                }
              }
            }
            freshBinding("threes", [(sp.lines.includes(v_L)), ((0 <= v_i) && (v_i <= (sp.lineCells[v_L].length - 3))), sameSet(v_W, setOf((sp.lineCells[v_L][v_i] ?? -1), (sp.lineCells[v_L][_t25] ?? -1), (sp.lineCells[v_L][_t26] ?? -1))), (v_W.includes(v_x)), !((b.grid[v_x] !== 0)), (((b.domain >> v_d) & 1) !== 0), _q27], ["L in", "i in", "W =", "x in", "where of x", "d in", "where of d"]);
          }
          facts.length = 0;
          changed = false;
          const _t31 = (3 - v_d);
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t31); changed = true; } else facts.push(PLACE, v_x, _t31); }
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
  const _a13 = sp.lines;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_L = _a13[_i14];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    const _h26 = (v_n - 1);
    for (let _m15 = b.domain; _m15 !== 0; _m15 &= _m15 - 1) {
      const v_d = 31 - Math.clz32(_m15 & -_m15);
      const _h24 = (3 - v_d);
      const _h25 = _h24;
      let _g16 = 0;
      G17: {
        const _a18 = sp.lineCells[v_L];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_c = _a18[_i19];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g16++;
        }
      }
      let _c27: boolean = (_g16 === v_n);
      if (_c27) {
        let _g20 = 0;
        G21: {
          const _a22 = sp.lineCells[v_L];
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_c = _a22[_i23];
            if (!(((b.grid[v_c] || -1) === _h25))) continue;
            _g20++;
          }
        }
        _c27 = (_g20 === _h26);
      }
      if (!(_c27)) continue;
      if (import.meta.env.DEV && staleChecking) {
        let _g28 = 0;
        G29: {
          const _a30 = sp.lineCells[v_L];
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_c = _a30[_i31];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g28++;
          }
        }
        let _c36: boolean = (_g28 === v_n);
        if (_c36) {
          let _g32 = 0;
          G33: {
            const _a34 = sp.lineCells[v_L];
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_c = _a34[_i35];
              if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
              _g32++;
            }
          }
          _c36 = (_g32 === (v_n - 1));
        }
        freshBinding("lastGap", [(sp.lines.includes(v_L)), (v_n === Math.trunc(sp.lineCells[v_L].length / 2)), (((b.domain >> v_d) & 1) !== 0), _c36], ["L in", "n =", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      let _q37 = true;
      Q38: {
        const _a39 = sp.lineCells[v_L];
        for (let _i40 = 0; _i40 < _a39.length; _i40++) {
          const v_c = _a39[_i40];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h25); changed = true; } else facts.push(PLACE, v_c, _h25); }
          if (!(true)) {
            _q37 = false;
            break Q38;
          }
        }
      }
      if (!(_q37)) return -1;
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
  const _a13 = sp.lines;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_L = _a13[_i14];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    for (let _m15 = b.domain; _m15 !== 0; _m15 &= _m15 - 1) {
      const v_d = 31 - Math.clz32(_m15 & -_m15);
      const _h24 = (3 - v_d);
      const _h25 = _h24;
      let _g16 = 0;
      G17: {
        const _a18 = sp.lineCells[v_L];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_c = _a18[_i19];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g16++;
        }
      }
      let _c26: boolean = (_g16 === v_n);
      if (_c26) {
        let _g20 = 0;
        G21: {
          const _a22 = sp.lineCells[v_L];
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_c = _a22[_i23];
            if (!(((b.grid[v_c] || -1) === _h25))) continue;
            _g20++;
          }
        }
        _c26 = (_g20 < v_n);
      }
      if (!(_c26)) continue;
      if (import.meta.env.DEV && staleChecking) {
        let _g27 = 0;
        G28: {
          const _a29 = sp.lineCells[v_L];
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_c = _a29[_i30];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g27++;
          }
        }
        let _c35: boolean = (_g27 === v_n);
        if (_c35) {
          let _g31 = 0;
          G32: {
            const _a33 = sp.lineCells[v_L];
            for (let _i34 = 0; _i34 < _a33.length; _i34++) {
              const v_c = _a33[_i34];
              if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
              _g31++;
            }
          }
          _c35 = (_g31 < v_n);
        }
        freshBinding("quota", [(sp.lines.includes(v_L)), (v_n === Math.trunc(sp.lineCells[v_L].length / 2)), (((b.domain >> v_d) & 1) !== 0), _c35], ["L in", "n =", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      let _q36 = true;
      Q37: {
        const _a38 = sp.lineCells[v_L];
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_c = _a38[_i39];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h25); changed = true; } else facts.push(PLACE, v_c, _h25); }
          if (!(true)) {
            _q36 = false;
            break Q37;
          }
        }
      }
      if (!(_q36)) return -1;
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
  const _a26 = sp.lines;
  for (let _i27 = 0; _i27 < _a26.length; _i27++) {
    const v_L = _a26[_i27];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    const _h33 = (v_n - 1);
    const _h40 = (v_n - 2);
    R2:
    for (let _m28 = b.domain; _m28 !== 0; _m28 &= _m28 - 1) {
      const v_d = 31 - Math.clz32(_m28 & -_m28);
      const _m88_0 = b.made[0];
      const _h38 = (3 - v_d);
      const _h39 = _h38;
      let _g29 = 0;
      G30: {
        const _a31 = sp.lineCells[v_L];
        for (let _i32 = 0; _i32 < _a31.length; _i32++) {
          const v_c = _a31[_i32];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g29++;
        }
      }
      let _c41: boolean = (_g29 === _h33);
      if (_c41) {
        let _g34 = 0;
        G35: {
          const _a36 = sp.lineCells[v_L];
          for (let _i37 = 0; _i37 < _a36.length; _i37++) {
            const v_c = _a36[_i37];
            if (!(((b.grid[v_c] || -1) === _h39))) continue;
            _g34++;
          }
        }
        _c41 = (_g34 <= _h40);
      }
      if (!(_c41)) continue;
      const _t42 = (sp.lineCells[v_L].length - 3);
      for (let v_i = 0; v_i <= _t42; v_i++) {
        const _t43 = (v_i + 1);
        const _t44 = (v_i + 2);
        L45: {
          const v_W = setOf((sp.lineCells[v_L][v_i] ?? -1), (sp.lineCells[v_L][_t43] ?? -1), (sp.lineCells[v_L][_t44] ?? -1));
          let _q46 = true;
          Q47: {
            const _a48 = v_W;
            for (let _i49 = 0; _i49 < _a48.length; _i49++) {
              const v_c = _a48[_i49];
              if (!(((b.grid[v_c] || -1) !== v_d))) {
                _q46 = false;
                break Q47;
              }
            }
          }
          let _c54: boolean = _q46;
          if (_c54) {
            let _g50 = 0;
            G51: {
              const _a52 = v_W;
              for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                const v_c = _a52[_i53];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g50++;
              }
            }
            _c54 = (_g50 >= 2);
          }
          if (!(_c54)) break L45;
          if (b.made[0] !== _m88_0) {
            let _g55 = 0;
            G56: {
              const _a57 = sp.lineCells[v_L];
              for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                const v_c = _a57[_i58];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g55++;
              }
            }
            let _c63: boolean = (_g55 === (v_n - 1));
            if (_c63) {
              let _g59 = 0;
              G60: {
                const _a61 = sp.lineCells[v_L];
                for (let _i62 = 0; _i62 < _a61.length; _i62++) {
                  const v_c = _a61[_i62];
                  if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
                  _g59++;
                }
              }
              _c63 = (_g59 <= (v_n - 2));
            }
            if (!(_c63)) { continue R2; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g64 = 0;
            G65: {
              const _a66 = sp.lineCells[v_L];
              for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                const v_c = _a66[_i67];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g64++;
              }
            }
            let _c72: boolean = (_g64 === (v_n - 1));
            if (_c72) {
              let _g68 = 0;
              G69: {
                const _a70 = sp.lineCells[v_L];
                for (let _i71 = 0; _i71 < _a70.length; _i71++) {
                  const v_c = _a70[_i71];
                  if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
                  _g68++;
                }
              }
              _c72 = (_g68 <= (v_n - 2));
            }
            const _t73 = (v_i + 1);
            const _t74 = (v_i + 2);
            let _q75 = true;
            Q76: {
              const _a77 = v_W;
              for (let _i78 = 0; _i78 < _a77.length; _i78++) {
                const v_c = _a77[_i78];
                if (!(((b.grid[v_c] || -1) !== v_d))) {
                  _q75 = false;
                  break Q76;
                }
              }
            }
            let _c83: boolean = _q75;
            if (_c83) {
              let _g79 = 0;
              G80: {
                const _a81 = v_W;
                for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                  const v_c = _a81[_i82];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g79++;
                }
              }
              _c83 = (_g79 >= 2);
            }
            freshBinding("lastOne", [(sp.lines.includes(v_L)), (v_n === Math.trunc(sp.lineCells[v_L].length / 2)), (((b.domain >> v_d) & 1) !== 0), _c72, ((0 <= v_i) && (v_i <= (sp.lineCells[v_L].length - 3))), sameSet(v_W, setOf((sp.lineCells[v_L][v_i] ?? -1), (sp.lineCells[v_L][_t73] ?? -1), (sp.lineCells[v_L][_t74] ?? -1))), _c83], ["L in", "n =", "d in", "where of d", "i in", "W =", "where of W"]);
          }
          facts.length = 0;
          changed = false;
          let _q84 = true;
          Q85: {
            const _a86 = sp.lineCells[v_L];
            for (let _i87 = 0; _i87 < _a86.length; _i87++) {
              const v_c = _a86[_i87];
              if (!((!((b.grid[v_c] !== 0)) && !(v_W.includes(v_c))))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h39); changed = true; } else facts.push(PLACE, v_c, _h39); }
              if (!(true)) {
                _q84 = false;
                break Q85;
              }
            }
          }
          if (!(_q84)) return -1;
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
  const _a20 = sp.lines;
  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
    const v_A = _a20[_i21];
    const _h29 = (sp.rows.includes(v_A));
    const v_n = Math.trunc(sp.lineCells[v_A].length / 2);
    const _h34 = (v_n - 1);
    R2:
    for (let _m22 = b.domain; _m22 !== 0; _m22 &= _m22 - 1) {
      const v_d = 31 - Math.clz32(_m22 & -_m22);
      const _m70_0 = b.made[0];
      let _g23 = 0;
      G24: {
        const _a25 = sp.lineCells[v_A];
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_c = _a25[_i26];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g23++;
        }
      }
      if (!((_g23 === v_n))) continue;
      const _h67 = (3 - v_d);
      const _h68 = _h67;
      const _a27 = sp.lines;
      R3:
      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
        const v_B = _a27[_i28];
        let _c35: boolean = ((v_B !== v_A) && (_h29 === (sp.rows.includes(v_B))));
        if (_c35) {
          let _g30 = 0;
          G31: {
            const _a32 = sp.lineCells[v_B];
            for (let _i33 = 0; _i33 < _a32.length; _i33++) {
              const v_c = _a32[_i33];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g30++;
            }
          }
          _c35 = (_g30 === _h34);
        }
        let _c39: boolean = _c35;
        if (_c39) {
          let _q36 = true;
          Q37: {
            const _t38 = (sp.lineCells[v_A].length - 1);
            for (let v_j = 0; v_j <= _t38; v_j++) {
              if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
              if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c39 = _q36;
        }
        if (!(_c39)) continue;
        const _t40 = (sp.lineCells[v_A].length - 1);
        for (let v_j = 0; v_j <= _t40; v_j++) {
          if (!((((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d) && !((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] !== 0))))) continue;
          if (b.made[0] !== _m70_0) {
            let _g41 = 0;
            G42: {
              const _a43 = sp.lineCells[v_A];
              for (let _i44 = 0; _i44 < _a43.length; _i44++) {
                const v_c = _a43[_i44];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g41++;
              }
            }
            if (!((_g41 === v_n))) { continue R2; }
            let _c49: boolean = ((v_B !== v_A) && ((sp.rows.includes(v_A)) === (sp.rows.includes(v_B))));
            if (_c49) {
              let _g45 = 0;
              G46: {
                const _a47 = sp.lineCells[v_B];
                for (let _i48 = 0; _i48 < _a47.length; _i48++) {
                  const v_c = _a47[_i48];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g45++;
                }
              }
              _c49 = (_g45 === (v_n - 1));
            }
            let _c53: boolean = _c49;
            if (_c53) {
              let _q50 = true;
              Q51: {
                const _t52 = (sp.lineCells[v_A].length - 1);
                for (let v_j = 0; v_j <= _t52; v_j++) {
                  if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
                  if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                    _q50 = false;
                    break Q51;
                  }
                }
              }
              _c53 = _q50;
            }
            if (!(_c53)) { continue R3; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g54 = 0;
            G55: {
              const _a56 = sp.lineCells[v_A];
              for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                const v_c = _a56[_i57];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g54++;
              }
            }
            let _c62: boolean = ((v_B !== v_A) && ((sp.rows.includes(v_A)) === (sp.rows.includes(v_B))));
            if (_c62) {
              let _g58 = 0;
              G59: {
                const _a60 = sp.lineCells[v_B];
                for (let _i61 = 0; _i61 < _a60.length; _i61++) {
                  const v_c = _a60[_i61];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g58++;
                }
              }
              _c62 = (_g58 === (v_n - 1));
            }
            let _c66: boolean = _c62;
            if (_c66) {
              let _q63 = true;
              Q64: {
                const _t65 = (sp.lineCells[v_A].length - 1);
                for (let v_j = 0; v_j <= _t65; v_j++) {
                  if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
                  if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                    _q63 = false;
                    break Q64;
                  }
                }
              }
              _c66 = _q63;
            }
            freshBinding("unique", [(sp.lines.includes(v_A)), (v_n === Math.trunc(sp.lineCells[v_A].length / 2)), (((b.domain >> v_d) & 1) !== 0), (_g54 === v_n), (sp.lines.includes(v_B)), _c66, ((0 <= v_j) && (v_j <= (sp.lineCells[v_A].length - 1))), (((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d) && !((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] !== 0)))], ["A in", "n =", "d in", "where of d", "B in", "where of B", "j in", "where of j"]);
          }
          facts.length = 0;
          changed = false;
          const _t69 = (sp.lineCells[v_B][v_j] ?? -1);
          if (!(b.grid[_t69] !== 0)) { if (fire === null) { b.placeAt(_t69, _h68); changed = true; } else facts.push(PLACE, _t69, _h68); }
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
